import type { CompareResult, Fate } from './types'

const n = (x: number): string => x.toLocaleString('en-US')
const pct = (a: number, b: number): string => (b ? `${((a / b) * 100).toFixed(1)}%` : '—')
const cut = (s: string, k = 36): string => (s.length > k ? `${s.slice(0, k)}…` : s)
const FATE: Record<Fate, string> = { sameBook: '同名同书', elsewhere: '名字在官方别处出现', homebrewOnly: '只在自制出现', nowhere: '所有源里都没有' }
const FATES: Fate[] = ['sameBook', 'elsewhere', 'homebrewOnly', 'nowhere']

/** 报告全部由程序按数字生成；不含时间，保证连跑两遍逐字相同。 */
export function renderReport(r: CompareResult): string {
  const L: string[] = []
  const total = r.oldEntries
  L.push('# T4 步骤1：新旧比对（切到数据源后，旧库哪些条目会消失）', '')
  L.push('> 由 `tools/db/compare/index.ts` 现算，只读。原则：旧库和源对不上是转换器的问题，以数据源为准；本报告不替旧条目定配对规则：「对不上」的数字是个范围——上限是严格口径，宽松口径给出规则敏感度；真正的配对规则归上游，属于 P2 后端。也不是让人逐条核对。', '')
  L.push('## 0. 两边是什么', '')
  L.push('```')
  L.push(`旧 = tavern-trpg-data 已发布包：${n(r.oldPacks)} 个包 / ${n(total)} 条 / ${n(r.oldBooks)} 本来源书`)
  L.push(`新 = T3 源清单的 ${r.repos.length} 个源，所有记录形状：`)
  for (const s of r.repos) L.push(`      ${s.id.padEnd(16)} ${n(s.records).padStart(8)} 条记录 / ${n(s.files)} 个内容文件`)
  L.push(`新源里旧库没有的来源书：${n(r.newOutOfScopeBooks)} 本 / ${n(r.newOutOfScopeRecords)} 条记录（${r.officialRepos.length} 个官方仓库去重合并后的口径，算「新增来源」）`)
  L.push(`对不上的旧条目：严格口径（英文名转小写 + 同一本书）${n(r.goneStrict)} 条；宽松口径（只比字母和数字）仍对不上 ${n(r.goneLoose)} 条`)
  L.push(`旧库指纹：${r.oldFingerprint.slice(0, 16)}…（切源前后相同才算旧库没动）`)
  L.push(`新源记录索引哈希：${r.newIndexSha256.slice(0, 16)}…`)
  L.push('```', '')
  L.push('## 1. 总览：旧库每一条去了哪', '')
  L.push('```')
  for (const f of FATES) L.push(`${FATE[f].padEnd(12, '  ')} ${n(r.fates[f]).padStart(6)} 条  ${pct(r.fates[f], total).padStart(6)}  ${'█'.repeat(Math.round((r.fates[f] / total) * 40))}`)
  L.push('```', '')
  L.push(`旧条目的署名（旧库自己写的 data.credit.by）：全库 ${r.creditAll.map(([k, v]) => `${k} ${n(v)}`).join('、')}；其中会消失的 ${r.creditVanished.map(([k, v]) => `${k} ${n(v)}`).join('、')}。`, '')
  L.push(`名字在官方数据里出现过的字段（程序统计旧条目英文名在哪些字段里能找到，没有事先规定）：${r.nameKeys.map(([k, v]) => `${k} ${n(v)}`).join('、') || '—'}`, '')
  L.push('## 2. 按旧类型', '')
  L.push('| 旧类型 | 条数 | 对不上（宽松口径） | 同名同书 | 官方别处出现 | 只在自制 | 所有源都没有 | 名字在别处时出现的位置（字段/结构类型/层级） |')
  L.push('|---|---:|---:|---:|---:|---:|---:|---|')
  for (const t of r.perType) {
    L.push(`| ${t.type} | ${n(t.total)} | ${n(t.looseGone)} | ${n(t.sameBook)} (${pct(t.sameBook, t.total)}) | ${n(t.elsewhere)} | ${n(t.homebrewOnly)} | ${n(t.nowhere)} | ${t.elsewhereWhere.map(([k, v]) => `${k} ${n(v)}`).join('、') || '—'} |`)
  }
  L.push('', '### 会消失的旧条目带着哪些旧转换器加的标记（比"找到的"明显更常带的字段，程序算出）', '')
  for (const t of r.perType.filter((x) => x.total > x.sameBook)) {
    L.push(`- **${t.type}**（会消失 ${n(t.total - t.sameBook)}）：${t.markers.map((m) => `${m.key} ${n(m.vanished)}/${n(m.found)}`).join('、') || '无明显标记'}  ｜  署名 ${t.credits.map(([k, v]) => `${k} ${n(v)}`).join('、')}`)
  }
  L.push('', '### 例子（每个去向 3 个，取编号最前）', '')
  for (const t of r.perType.filter((x) => x.total > x.sameBook)) {
    for (const f of FATES.slice(1)) {
      const ex = t.examples[f]
      if (ex.length) L.push(`- **${t.type}** · ${FATE[f]}：${ex.map((e) => `${cut(e.name)} / ${cut(e.nameEn)}（${e.book}）`).join('；')}`)
    }
  }
  L.push('', '## 3. 按书对照（库里一本书一个包）', '')
  L.push('书名取自清单里上游登记的真实书名。新源记录数取所有官方仓库去重合并后的数（同类别 + 同英文名 + 同来源算一条；官方仓库之间并不完全重复），所有形状。', '')
  L.push('| 来源 | 书名 | 版本 | 旧包 | 旧条数 | 同名同书 | 新源这本书的记录 | 其中旧库没有的 |')
  L.push('|---|---|---|---|---:|---:|---:|---:|')
  for (const b of r.perBook) {
    L.push(`| ${b.book} | ${b.name || '（清单未登记）'}${b.nameEn ? ` / ${b.nameEn}` : ''} | ${b.edition || '—'} | ${b.oldPacks.map((p) => p.replace(/\.trpgpack$/, '')).join('、')} | ${n(b.oldEntries)} | ${n(b.sameBook)} | ${n(b.newRecords)} | ${n(b.newOnly)} |`)
  }
  L.push('', '## 4. 新源每个类别：旧库同书里有多少没覆盖', '')
  L.push('只看「来源书在旧库里出现过」的官方记录（去重合并）；其余算新增来源。「旧库覆盖」指有旧条目与它同名同书。', '')
  L.push('| 新源类别 | 范围内记录 | 旧库覆盖 | 旧库没有 | 其中版本分布 | 新增来源的记录 |')
  L.push('|---|---:|---:|---:|---|---:|')
  for (const c of r.perCategory) {
    L.push(`| ${c.category} | ${n(c.inScope)} | ${n(c.matched)} | ${n(c.newOnly)} | ${c.newOnlyByEdition.map(([e, k]) => `${e} ${n(k)}`).join('、') || '—'} | ${n(c.outOfScope)} |`)
  }
  L.push('', '## 5. 没做的事', '')
  L.push('- 没有逐条核对原书，没有手补；"名字在别处出现"只说明名字出现了，**不保证内容一致**。')
  L.push('- 「同名同书」的比较不分类别（旧类型和新类别的对应属于配对规则，归 P2），同名同书的不同类别记录可能互相算作对上。')
  L.push('- 旧库自己拼的名字（如 `X·表名`、`EladrinElf`）在新源里精确查不到，是拼接造成的，不等于内容缺失。')
  L.push('- 魔法物品模板展开后的成品、怪物变体在新源里藏在一条记录里（T1-T2 报告 §2.8、T3 报告 §4.2），由上游展开程序生成，不算缺口，本报告也不展开。')
  L.push('- 旧库只有 2014；新源的 2024 记录全部落在「旧库没有」或「新增来源」，不做新旧比对。')
  L.push(`- 会消失的旧条目共 ${n(r.vanish.length)} 条，完整清单在 \`新旧比对.json\` 的 \`vanish\` 字段（机器可读，不是让人逐条看）。`)
  L.push('')
  return L.join('\n')
}
