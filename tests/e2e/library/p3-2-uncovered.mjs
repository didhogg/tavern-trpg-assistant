// 对已测语料作可复跑的缺口验证；不写语境正则、不改条目、不推断完整语义。
import { readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../../', import.meta.url))
const dir = `${root}work/p3-2-measurement/`
const load = async path => JSON.parse(await readFile(path, 'utf8'))
const [measured, candidates, hints, corpus, numeric] = await Promise.all([load(dir+'effects-chrome.json'), load(dir+'source-candidates-chrome.json'), load(dir+'ddb-hints.json'), load(dir+'corpus-chrome.json'), load(`${root}work/e2e-lib/p3-2-probe-chrome.json`)])
const source = await readFile('/Users/xxx/DND- reference（DO NO DELETE！）/plutonium-next-master/plutonium/js/Bundle.js', 'utf8')
assert.equal(createHash('sha256').update(source).digest('hex'), measured.versions.bundleSha256, '参考源码改变，应重测，禁止拼接版本')
const start = source.indexOf('class UtilAdvancementsEntry {')
const end = source.indexOf('\nlet UtilActivityBuilder', start)
assert(start >= 0 && end > start)
const authorCode = source.slice(start, end)
// 字段名直接取自作者这个处理器实际读取的 ent.xxx，不自造语义词典。
const mechanicalFields = [...new Set([...authorCode.matchAll(/\bent\.([A-Za-z][A-Za-z0-9_]*)/g)].map(m=>m[1]))]
const parsedExpressions = new Set(numeric.numericCorpus.rows.filter(r=>r.parsed && r.sameResult).map(r=>r.expression))
const pg = Object.groupBy(measured.rows, r=>r.kind)
const sg = Object.groupBy(candidates.rows, r=>r.kind)
const dg = Object.groupBy(hints, r=>r.kind)
const present = value => Array.isArray(value) ? value.length > 0 : value && typeof value === 'object' ? Object.keys(value).length > 0 : value !== undefined && value !== null && value !== false && value !== ''
const rows = []; const summary = {}
for (const [kind, inputs] of Object.entries(corpus)) {
  assert.equal(inputs.length, pg[kind].length)
  assert.equal(inputs.length, sg[kind].length)
  if(dg[kind]) assert.equal(inputs.length, dg[kind].length)
  const total = summary[kind] = { inputs: inputs.length, executionBoundary: 0, hasClue: 0, noClue: 0, mechanicalFieldEvidence: 0, verifiedDiceEvidence: 0, stillUnknown: 0 }
  inputs.forEach((ent, i) => {
    const p = pg[kind][i], s = sg[kind][i], d = dg[kind]?.[i]
    assert.equal(ent.name, p.name); assert.equal(ent.source,p.source)
    assert.equal(ent.name,s.name); if(d) {assert.equal(ent.name,d.name);assert.equal(ent.source,d.source)}
    if(p.error || p.notAttempted || p.ownerCompatible===false) { total.executionBoundary++; return }
    const clue = present(p.effects)||present(p.system?.activities)||present(p.system?.uses?.max)||present(p.system?.advancement)
      ||s.srd.some(x=>x.effects||x.activities||present(x.uses))
      ||s.paa.some(x=>present(x.data.effects)||present(x.data.activities)||present(x.data.system?.activities)||present(x.data.system?.uses?.max)||present(x.data.advancement))
      ||present(d?.hints?.effects)||present(d?.hints?.activity)||present(d?.hints?.additionalActivities)||present(d?.hints?.override)
    if(clue) {total.hasClue++;return}
    total.noClue++
    const fields = mechanicalFields.filter(field=>present(ent[field])).map(field=>({field,value:ent[field]}))
    const dice = [...JSON.stringify(ent).matchAll(/\{@(?:dice|damage|autodice) ([^}|]+)(?:\|[^}]*)?\}/g)].map(m=>m[1]).filter(expr=>parsedExpressions.has(expr))
    const row = {kind,name:ent.name,source:ent.source,hash:p.hash,owner:ent.className??ent.raceName??ent.monsterName??null,fields,dice:[...new Set(dice)],verdict:fields.length||dice.length?'has-machine-processable-parts':'undetermined'}
    if(fields.length)total.mechanicalFieldEvidence++
    if(dice.length)total.verifiedDiceEvidence++
    if(row.verdict==='undetermined')total.stillUnknown++
    rows.push(row)
  })
  assert.equal(total.inputs,total.executionBoundary+total.hasClue+total.noClue)
}
const output={sourceFunction:'UtilAdvancementsEntry',mechanicalFields,sourceSha256:measured.versions.bundleSha256,summary,rows,limits:'只证明存在机械输入或已解析骰式，不证明整条无需语境或已完整结算。没有证据的条目均未判明；没有用关键词猜语境。'}
await writeFile(dir+'uncovered-audit.json',JSON.stringify(output,null,2))
const evidence=rows.filter(r=>r.verdict==='has-machine-processable-parts')
assert(evidence.length>0,'未取得反证，不能断言缺口存在机械部分')
const headers='| 类别 | 无处理线索 | 有作者机械字段 | 有已验证骰式 | 仍未判明 |\n| --- | --- | --- | --- | --- |'
const lines=Object.entries(summary).filter(([,s])=>s.noClue).map(([kind,s])=>`| ${kind} | ${s.noClue} | ${s.mechanicalFieldEvidence} | ${s.verifiedDiceEvidence} | ${s.stillUnknown} |`)
const samples=Object.entries(Object.groupBy(evidence,r=>r.kind)).map(([kind,items])=>{const x=items[0];return `- ${kind}：${x.name} [${x.source}]；作者字段 ${x.fields.map(f=>f.field).join('、')||'无'}；已验证骰式 ${x.dice.join('、')||'无'}。`})
const note=`\n## 9. 未覆盖部分是否都需要语境：自动化核验\n\n**不是。上一轮“没有动作/效果等输出”的统计，不能用来判断不可自动化。** 本次逐项对齐作者原始对象、转换结果、SRD/PAA 候选与 DDB 提示后，对无处理线索部分作了全量机器检查。\n\n流程：已有测量 → 排除有线索和明确执行边界 → 读取作者处理器实际消费的字段 → 对照已经实测解析和重放的骰式 → 保留证据与未知。\n\n${headers}\n${lines.join('\n')}\n\n共有 ${evidence.length} 条至少含一项可机器处理的机械部分；两种证据可重叠，不能相加。这不等于这些条目的全部正文都无需判断。\n\n机械字段清单直接从作者 UtilAdvancementsEntry 源码的 ent.xxx 读取位置自动取得：${mechanicalFields.join('、')}。作者的技能/语言/工具等处理器明确在选择尚未传入时返回空数组；**等待玩家选择与需要 DM 解释语境不同**。例如人物选好熟练后，熟练加值可由统一内核计算，不需要逐条为背景补数据。\n\n骰式证据只采用真实条目里与前轮成功解析、确定性重放结果完全一致的表达式，不自写骰子算法。\n\n以下例子由脚本按类别自动取第一条有证据记录，仅展示字段/骰式，不逐条校对原书：\n${samples.join('\n')}\n\n没有上述证据的记录统一保留“未判明”。不能自动把它们归为纯叙事、语境判断、无需计算或真正缺数据。复合条目可同时包含固定数值、玩家选择及场面条件；本轮不强行给整条贴互斥标签。完整 NPC 施法等执行边界仍单列，不混作“没有自动化”。\n\n结论：先前输出指标漏掉了“结构化输入经人物选择后才产生结果”等路径，应按整类作者处理流程接入内核；不用逐条修补。其余正文机制仍未判明，本轮不承诺全部可自动化，也不承诺全部不可自动化。\n\n复跑：node tests/e2e/library/p3-2-uncovered.mjs。明细：work/p3-2-measurement/uncovered-audit.json。本轮没有更改条目或产品代码。\n`
const reportPath=`${root}docs/handoff/D2-P3-2_⓪探路报告.md`
const old=await readFile(reportPath,'utf8')
await writeFile(reportPath,old.split('\n## 9. 未覆盖部分是否都需要语境')[0]+note)
console.log(JSON.stringify({summary,evidence:evidence.length,samples},null,2))
