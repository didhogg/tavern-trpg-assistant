// 汇总已完成的测量；不把导出动作/效果冒充完整结算覆盖率。
import { readFile, writeFile, readdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../../', import.meta.url))
const work = `${root}work/p3-2-measurement/`
const json = async path => JSON.parse(await readFile(path, 'utf8'))
const [chrome, webkit, sourcesChrome, sourcesWebkit, ddb, numericChrome, numericWebkit, fingerprints] = await Promise.all([
  json(`${work}effects-chrome.json`), json(`${work}effects-webkit.json`), json(`${work}source-candidates-chrome.json`), json(`${work}source-candidates-webkit.json`), json(`${work}ddb-hints.json`),
  json(`${root}work/e2e-lib/p3-2-probe-chrome.json`), json(`${root}work/e2e-lib/p3-2-probe-webkit.json`), json(`${work}input-fingerprints.json`),
])
const count = value => Object.keys(value ?? {}).length
const table = (headers, rows) => `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows.map(row => `| ${row.join(' | ')} |`).join('\n')}\n`
function effectsSummary(input) {
  const groups = {}; const errors = {}; const blocked = {}; const writes = {}; const activities = {}; const advancements = {}
  for (const row of input.rows) {
    const s = groups[row.kind] ??= { total: 0, success: 0, error: 0, blocked: 0, effects: 0, activities: 0, uses: 0, advancements: 0, anyArtifact: 0 }
    s.total++
    if (row.error) { s.error++; const key = row.error.split(' | ')[0]; errors[key] = (errors[key] ?? 0) + 1; continue }
    if (row.notAttempted) { s.blocked++; blocked[row.notAttempted] = (blocked[row.notAttempted] ?? 0) + 1; continue }
    s.success++
    const effects = row.effects ?? []; const acts = Object.values(row.system?.activities ?? {}); const advances = Object.values(row.system?.advancement ?? {})
    if (effects.length) s.effects++
    if (acts.length) s.activities++
    if (row.system?.uses?.max) s.uses++
    if (advances.length) s.advancements++
    if (effects.length || acts.length || row.system?.uses?.max || advances.length) s.anyArtifact++
    for (const effect of effects) for (const change of effect.system?.changes ?? effect.changes ?? []) {
      const key = `${change.key} | ${change.type ?? change.mode}`; writes[key] = (writes[key] ?? 0) + 1
    }
    for (const activity of acts) activities[activity.type ?? '(missing)'] = (activities[activity.type ?? '(missing)'] ?? 0) + 1
    for (const advancement of advances) advancements[advancement.type ?? '(missing)'] = (advancements[advancement.type ?? '(missing)'] ?? 0) + 1
  }
  return { groups, errors, blocked, writes, activities, advancements }
}
function sourceSummary(input) {
  const groups = {}
  for (const row of input.rows) {
    const s = groups[row.kind] ??= { total: 0, srdEligible: 0, srdCandidate: 0, srdMultiple: 0, srdEffects: 0, srdActivities: 0, paaCandidate: 0, errors: 0 }
    s.total++; if (row.srdEligible) s.srdEligible++
    if (row.srd?.length) s.srdCandidate++
    if (row.srd?.length > 1) s.srdMultiple++
    if (row.srd?.some(x => x.effects)) s.srdEffects++
    if (row.srd?.some(x => x.activities)) s.srdActivities++
    if (row.paa?.length) s.paaCandidate++
    if (row.error) s.errors++
  }
  return groups
}
function ddbSummary(input) {
  const groups = {}; const failures = {}
  for (const row of input) {
    const s = groups[row.kind] ??= { total: 0, found: 0, effectHints: 0, activityHints: 0, callbackHints: 0, getterErrors: 0, loadErrors: 0 }
    s.total++; if (row.found) s.found++
    if (row.hints?.effects?.length) s.effectHints++
    if (row.hints?.activity || row.hints?.additionalActivities?.length) s.activityHints++
    if (JSON.stringify(row.hints ?? {}).includes('[FUNCTION_REQUIRES_EXECUTION]')) s.callbackHints++
    if (row.error) { s.loadErrors++; failures[row.error] = (failures[row.error] ?? 0) + 1 }
    if (count(row.errors)) { s.getterErrors++; for (const error of Object.values(row.errors)) failures[error] = (failures[error] ?? 0) + 1 }
  }
  return { groups, failures }
}
const a = effectsSummary(chrome); const b = effectsSummary(webkit)
const sc = sourceSummary(sourcesChrome); const sw = sourceSummary(sourcesWebkit)
assert.deepEqual(a, b, '两浏览器转换分类、写法/动作/成长计数不一致')
assert.deepEqual(sc, sw, '两浏览器来源候选计数不一致')
assert.equal(count(a.errors), 0, '转换还有未解释错误')
assert.equal(count(chrome.loadErrors), 0); assert.equal(chrome.childErrors.length, 0)
assert.equal(chrome.logs.length, 0); assert.equal(webkit.logs.length, 0)
assert.equal(sourcesChrome.errors.length, 0); assert.equal(sourcesWebkit.errors.length, 0)
assert(!Object.values(sc).some(group => group.errors))
assert(Object.values(sc).some(group => group.srdCandidate), 'SRD 候选全为零：先检查读取器，不得报告覆盖率')
assert.equal(chrome.regression.mockIsArray, false); assert.equal(chrome.regression.officialRoundTrip, true)
assert(numericChrome.assertionsPassed && numericWebkit.assertionsPassed)
assert.deepEqual(numericChrome.numericCorpus, numericWebkit.numericCorpus)
const n = numericChrome.numericCorpus; const d = ddbSummary(ddb)
const ddbEnvironment = await json(`${work}ddb-environment.json`)
assert(ddbEnvironment.officialApiLoaded); assert.equal(ddbEnvironment.setupErrors.length, 0)
const numeric = { tagCount: n.tagCount, unique: n.uniqueExpressions, parsed: n.rows.filter(x => x.parsed).length, replayed: n.rows.filter(x => x.sameResult).length, choiceExpressions: n.rows.filter(x => x.choiceBranches?.every(branch => branch.parsed)).length, tagErrors: n.tagErrors.length, preparedCases: n.prepared.reduce((sum, row) => sum + row.cases, 0), preparedErrors: n.preparedErrors.length }
const sourceWrites = { plutonium: a.writes, srd: {}, paa: {}, ddb: {} }
const scanChanges = (value, output) => {
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    if ((key === 'changes' || key === 'ac5eChanges') && Array.isArray(child)) for (const change of child) {
      if (!change || change.key === undefined) continue
      const write = `${change.key} | ${change.type ?? change.mode ?? '(unspecified)'}`
      output[write] = (output[write] ?? 0) + 1
    }
    scanChanges(child, output)
  }
}
for (const row of sourcesChrome.rows) for (const match of row.paa ?? []) scanChanges(match.data, sourceWrites.paa)
for (const row of ddb) scanChanges(row.hints, sourceWrites.ddb)
const ref = process.env.TRPG_REFERENCE ?? '/Users/xxx/DND- reference（DO NO DELETE！）'
const YAML = createRequire(`${root}work/ddb/ddb-importer/package.json`)('js-yaml')
const matched = new Set(sourcesChrome.rows.flatMap(row => row.srd.map(hit => `${hit.pack}.${hit.id}`)))
const manifest = await json(join(ref, 'dnd5e-6.1.x/system.json'))
for (const pack of manifest.packs.filter(pack => pack.flags?.dnd5e?.rulesVersion === 'legacy')) {
  const dir = join(ref, 'dnd5e-6.1.x/packs/_source', pack.name)
  for (const file of await readdir(dir, { recursive: true })) {
    if (!/\.(json|ya?ml)$/.test(file)) continue
    const text = await readFile(join(dir, file), 'utf8')
    const doc = file.endsWith('.json') ? JSON.parse(text) : YAML.load(text)
    if (matched.has(`${manifest.id}.${pack.name}.${doc._id}`)) scanChanges(doc.effects, sourceWrites.srd)
  }
}
const allWriteKinds = new Set(Object.values(sourceWrites).flatMap(Object.keys))
const summary = { generatedAt: new Date().toISOString(), scope: chrome.census, versions: chrome.versions, effects: a, sourceWrites, allObservedWriteKinds: allWriteKinds.size, sources: sc, ddb: d, numeric, parity: { effectClassificationAndWriteCensus: true, sourceCandidateCounts: true, numericResults: true }, fullSettlementCoverage: { percentage: null, reason: '正式内核 a～e 尚未实现；不存在完整效果语义清单及全部效果执行验证，不能把找到结构当成已正确结算' } }
await writeFile(`${work}summary.json`, JSON.stringify(summary, null, 2))
const labels = { class: '职业', subclass: '子职业', classFeature: '职业特性', subclassFeature: '子职业特性', feat: '专长', optionalfeature: '可选特性', spell: '法术', item: '物品', race: '种族', raceFeature: '种族特性', background: '背景', monster: '怪物', monsterFeature: '怪物动作与特性' }
const label = kind => `${labels[kind] ?? kind}（${kind}）`
const coreKinds = ['class', 'subclass', 'classFeature', 'subclassFeature', 'feat', 'optionalfeature', 'spell', 'item', 'race', 'raceFeature', 'background']
const mainRows = coreKinds.map(kind => { const g = a.groups[kind]; return [label(kind), g.total, g.success, g.blocked, g.error, g.effects, g.activities, g.uses, g.advancements] })
const sourceRows = Object.entries(sc).map(([kind, g]) => [label(kind), g.srdEligible, g.srdCandidate, g.srdMultiple, g.srdEffects, g.srdActivities, g.paaCandidate])
const ddbRows = Object.entries(d.groups).map(([kind, g]) => [label(kind), g.total, g.found, g.effectHints, g.activityHints, g.callbackHints, g.getterErrors, g.loadErrors])
const totalSuccess = Object.values(a.groups).reduce((sum, group) => sum + group.success, 0)
const report = `# D2-P3-2 ⓪ 探路：复杂结算全量测量报告

日期：2026-11-07。状态：**本轮探路测量与测试已执行；正式内核 a～e 尚未开始；完整复杂结算覆盖率尚不可量化。没有单独提交，探路脚本随 a 段提交。**

## 0. 直接回答驾驶员

**不能据此承诺“大部分非语境型数值结算已完整覆盖”，也不能给出 80%／98% 之类总数。** 本轮已经把作者转换器的输出测到了，但“取得效果”和“我们的内核已正确执行效果”是两道不同的门。这里保留全部未知项，不把没有输出的条目直接判成“无需计算”或“必须手填”。

    作者条目 → 作者转换器 → 动作／效果／成长记录 → 本插件结算 → 状态与存档
     已展开      已全量测       已统计写法          a～e 待做     P3-3/4 待验

已证明：两浏览器按作者同一批输入完成测量，生成文档成功 ${totalSuccess} 行，转换错误 0；其中包含父条目和子条目，**不能相加作一本书或独立规则的数量**。这只证明转换器可在所述探路环境中产出数据，不证明每条数据的所有机制都已自动化。

- ${numeric.unique} 种真实骰式：${numeric.parsed} 种直接解析并确定性重放；${numeric.choiceExpressions} 种为分号多选，各分支可解析。多选仍需玩家选择，不能算无输入全自动。
- 准备法术公式 ${n.prepared.length} 条，${numeric.preparedCases} 组等级×属性调整值组合可计算，错误 ${numeric.preparedErrors}。此处验证作者公式可执行，不是独立逐条校对规则原书。
- SRD、PAA、DDB 的候选与缺依赖情况分开统计；**不相加报“综合覆盖率”**。
- a～e 的最终数值、条件生效、叠加顺序、持续时间、资源变化及存档恢复尚无完整执行证据；P3-3/P3-4 也未执行。

## 1. 范围、来源与分母

本轮使用只读参考目录中的 5etools 站点数据，交给 Plutonium 自带作者加载器 DataLoader 展开。不是手写 JSON 解析器、不是只读顶层数组。包含站点自带的试玩稿与第三方出版内容；“站点数据”不等于“全部都是 WotC 官方书”。

作者 SourceUtil.isClassicSource 按来源日期判断旧版，与 P3-1 的初始归类依据一致；另外保留 classSource/subclassSource 兼容性检查。用户自己的并集、排除、房规和自制库没有被这份参考快照全量枚举，故不能把结果当成任意战役的覆盖率。

注意：可见旧来源的子职业可能属于新版职业。在资料范围里，不代表支持 2014 结算；此类行保留、单列，不混进成功分母。怪物子条目由作者 getFauxFeature 生成，与父条目有重叠。物品由作者加载器展开变体，变体也不是独立结算算法。

${table(['类别', '全版本作者输出', '旧来源可见', '其余来源'], Object.entries(chrome.census).filter(([, g]) => g.all !== undefined).map(([kind, g]) => [label(kind), g.all, g.classic, g.excluded]))}
完整输入文件指纹见 work/p3-2-measurement/input-fingerprints.json，语料见 corpus-chrome.json/corpus-webkit.json。**本地参考快照与玩家已经安装的英文/中文数据是否逐文件同版本，本轮未证明；不能冒充在线全库最新版或玩家战役实装结果。**

${table(['原件', '文件数', '清单 SHA-256'], Object.entries(fingerprints).map(([kind, value]) => [kind, value.files.length, value.digest]))}

## 2. 测量环境与修正

- Plutonium ${chrome.versions.plutonium}；Bundle SHA-256：${chrome.versions.bundleSha256}。
- dnd5e ${chrome.versions.dnd5e}：原配置与 applyLegacyRules 都从参考源码打包；Plutonium 也明确设为 classic。没有把 dnd5e 默认 modern 当 2014。
- Foundry 公共基础模块取自官方演示站，源码原样缓存于 work/p3-2-measurement/official，逐文件 SHA-256 记在 effects-*.json 的 provenance。不随插件发布。
- 官方演示站标示 14.365，dnd5e 要求最低 ${chrome.versions.dnd5eMinimum}；**这不是完整兼容宿主**。仅验证本报告实际调用到的路径，不证明完整 Actor、活动、宏系统可用。
- DDB 的测试替身只用于载入。实际转换缺少通用空壳依赖时抛 HOST_MISSING，不让空返回凑成成功；DDB 的文档模型替身也禁止作为真实模型执行。
- 仅运行必要的数据/配置初始化，不触发 Plutonium 整套 init/setup/ready 界面、socket、后端请求。两浏览器最终没有页面错误、网络失败或初始化错误。
- 本地化 _loc 按官方 v14 定义绑定既有测试 localize；测试环境不做实际翻译，描述与 UI 显示不在本轮验证范围。
- 数组回归测试：旧 mockIsArray=false；官方工具 officialRoundTrip=true。“警觉”真实转换得到 initiativeAlert=true、override、优先级 4；这还不等于人物先攻已经算出 +5。

官方依据：[基础模块](https://demo.foundryvtt.com/common/utils/helpers.mjs)、[本地化别名说明](https://github.com/foundryvtt/foundryvtt/issues/13357)。

## 3. Plutonium 实际输出

“成功”仅指完整返回且可序列化，没有调用运行阶段的通用空壳。后四列表示有该结构的条目数；各列可能重叠，**不能求和，也不是完整自动化率**。普通 utility 活动、一次选择、一次标记，不能证明条目全部机制已覆盖。

${table(['类别', '输入', '成功', '单列边界', '错误', '有效果列表', '有活动', '有次数', '有成长记录'], mainRows)}

NPC 单独列：
${table(['测量对象', '输入', '成功转换', '单列边界', '错误'], ['monster', 'monsterFeature'].map(kind => { const g = a.groups[kind]; return [label(kind), g.total, g.success, g.blocked, g.error] }))}

${table(['边界原因', '记录数'], Object.entries(a.blocked))}

怪物父条目只实测了作者 HP 处理；不是完整 NPC Actor 导入。怪物施法依赖作者 ImporterCreature 的完整流程：先导入各法术，再组装施法活动与引用。不能把含 ability 字符串的原始 spellcasting 对象当普通特性送入转换器，否则会误走能力值提升处理。没有删除该字段，也没有手补转换。

动作类型分布：
${table(['作者活动类型', '活动数（非条目数）'], Object.entries(a.activities))}
成长类型分布：
${table(['作者成长类型', '记录数'], Object.entries(a.advancements))}

效果实际使用 ${Object.keys(a.writes).length} 种“目标路径＋操作”组合。完整清单在 summary.json 的 effects.writes。**这是待实现写法登记表的输入，不是已经支持的登记表；具体路径数也不等于需要手写同样数量的算法，技能、属性等可以按同一套作者处理方式登记。** flags.dnd5e、system 路径及第三方宏/活动还需要各自的执行语义；不能只做字符串替换就视为完成。

## 4. 第二来源：候选，不是完成率

### 4.1 SRD 与 PAA

SRD 根据 dnd5e system.json 中作者声明为 legacy 的资料包读取；源码实际是 YAML，用作者工具选用的 js-yaml 原样读取，没有清理或重写原件。使用 Plutonium 原候选编号、别名和匹配函数，保留多候选。不自行按中文译名或简单英文名合并。

PAA 统计其自己维护的数据，用 Plutonium 的 propsMatch 原函数查候选；没有运行 CPR，也没有把含宏或依赖的记录当成可独立执行。PAA 作者生成的索引在这份参考源码里不存在；本轮不冒充已完成正式 PAA 接入。

${table(['类别', '带 SRD 标记', 'SRD 候选命中', '多候选', '候选含效果', '候选含活动', 'PAA 原始候选命中'], sourceRows)}

匹配到的原始效果写法（不执行）：
${table(['来源', '不同“目标路径＋操作”组合数'], Object.entries(sourceWrites).map(([source, writes]) => [source, Object.keys(writes).length]))}

四个来源共观察到 ${allWriteKinds.size} 种写法组合；不同来源的模式表示可能不同，这个并集不是最少登记表行数，也不保证语义可以共用。完整清单保存在 summary.json 的 sourceWrites。DDB 的回调、宏、AC5e 等表达式仍须另外验证，不能只按目标路径统计就宣布支持。

SRD 命中只表示作者查找键能对应，尚未验证这些活动/效果在本插件执行；未命中也不能判断整条规则不可自动化。PAA 依赖过滤、优先级与 _merge 合并仍须按作者原流程接入后验证。PAA、内联、试玩稿、自制、Internal、Generated 是**逐字段**取数，并可按 _merge 合并，不是整条找到就停止。

### 4.2 DDB

使用 DDB 正式工厂 load 查找，is2014=true，按正式调用签名传 document；沿用作者的 jsdom 测试环境并载入原 API_BASE，初始化错误 0。基础文档与角色来自作者测试夹具，不是玩家 D&D Beyond 导出。遍历补强器实际 getter，保留回调、异常、未命中。

${table(['类别', '输入', '找到补强器', '有效果提示', '有活动提示', '含待执行回调', '提示读取出错条目', '加载出错条目'], ddbRows)}

导出测试通过只表示每条输入都记录了查找、提示或异常，不表示所有补强器执行成功。加载失败和提示读取失败仍单列。

这些数值**不能称为可直接执行的效果条数**。部分提示要求真实 DDB 角色修正、基础活动、选择或 Foundry 扩展；函数占位符只用于诊断，绝不进正式数据。

提示读取错误分布（只报告读取失败，不推测失败对象完整机制；“资料包 OFF”是完整导入/测试设置尚缺，不能归为数据缺失）：
${table(['错误', '次数'], Object.entries(d.failures).map(([message, count]) => [message.replaceAll('|', '／').replaceAll('\n', ' '), count]))}

## 5. 数值能力与原 7 项探路

${table(['项目', '本次证据', '限制'], [
 ['Plutonium 脱离完整 Foundry', '必要初始化＋全批转换；见 §3', '不包含完整 Actor、NPC 施法及宏系统'],
 ['dnd5e 旧版规则', '实际调用作者 applyLegacyRules，非只阅读', '最终结算纯函数还未移植'],
 ['2014 遭遇', '真实地精＋4 个 3 级角色，easy；两浏览器一致', '原入口场景测试，不是所有组合穷尽'],
 ['购点', '读取作者 27 点预算、费用表、标准数组', '未写新的购点算法'],
 ['骰子解析', numeric.tagCount + ' 个标签、' + numeric.unique + ' 种不同骰式', '统计表达式，不统计规则语义'],
 ['preparedSpells', numeric.preparedCases + ' 组代入可计算，无异常', '未覆盖尚未接入的人物施法选择流程'],
 ['给定点数重放', numeric.replayed + ' 种真实骰式重放一致，外加 kh/kl/dl 基础用例', '多选仍需选分支；取高/去低平均值是作者已知限制'],
])}

${table(['公式所属', '作者公式', '测试组合数'], n.prepared.map(x => [x.name + ' [' + x.source + ']', x.formula.replaceAll('|', '／'), x.cases]))}

额外基础用例包含非法骰式、点数不足、PB、取高/去低、升环标签与表格行。作者对 kh/kl/dl 的 avg 不支持这一限制仍存在；本轮真实标签没有触发，不意味着限制消失。

## 6. 测试清单与可复跑命令

- 项目检查：npm run check（类型、lint、182 项单元测试通过；不是 UI 全矩阵）。
- 真实作者小窗：node tests/e2e/library/p3-2-probe.mjs（Chrome/WebKit，基本探路＋完整骰式/公式语料）。
- 全量转换与来源：node tests/e2e/library/p3-2-effects.mjs（Chrome/WebKit）；不需要在参考库安装或运行命令。
- DDB 作者现有补强器测试：在 work/ddb/ddb-importer 执行 ./node_modules/.bin/vitest run tests/parser/enrichers；87 文件、2999 通过、12 跳过。
- DDB 提示导出：把 tests/e2e/library/p3-2-ddb-extract.ts.fixture 复制到上述复制件 tests/_export/p3Complete.test.ts，再在复制件执行 ./node_modules/.bin/vitest run tests/_export/p3Complete.test.ts。
- 统计一致性与报告：node tests/e2e/library/p3-2-report.mjs；断言两浏览器分类、写法计数、来源候选与数值输出一致，转换错误为零，SRD 不是误读空包。

DDB 的 npm run audit:enrichers 指向本快照中缺失的 tests/audit/*.audit.test.ts，实际执行失败（No test files found），未伪报通过。替代的是作者实际存在的整套 tests/parser/enrichers，不是自造审计结果。12 项 skipped 仍是未验证，不算通过。

所有日志、原始测量、来源指纹、完整未支持/边界列表在 work/p3-2-measurement。体量较大且含上游原始代码/数据，不进提交。脚本和本报告留待 a 段提交，不推送。

## 7. 为什么总覆盖率仍为空，以及下一道门

完整率至少需要“每条需要哪些机器效果”与“内核已正确执行哪些效果”的对照。作者数据大量机制仍在正文；仅从“没有生成效果”无法自动区分：本来无需算、语境判断、需要玩家选择、真正缺少效果。当前没有这份完整语义分母，也没有正式执行器；本报告不会凭印象补四种分类或逐条手填规则。

按已批准 a～e 的范围，执行证据逐块列明：

| 段 | 本轮已取得的证据 | 尚不能声称覆盖的内容 |
| --- | --- | --- |
| a 基础与骰子 | 作者骰式、重放、购点及规则配置能调用 | 人物属性、熟练、技能、豁免、先攻、速度、AC 的完整计算与来源叠加未移植验证 |
| b 物品装备 | 全量物品文档、效果、活动、次数输出 | 装备/卸下、同调、加值冲突与穿戴条件生效未执行 |
| c 战斗 | 效果写法与活动结构可取得，作者旧版配置已应用 | 抗性/免疫/易伤、豁免伤害、兼职法术位、休息、状态与专注的完整状态变化未执行 |
| d 怪物 NPC | HP 入口及怪物子条目转换 | 完整 Actor 构建、NPC 施法引用与资源、传奇行动回合循环未执行 |
| e 建卡升级 | 职业/种族等成长记录、准备公式可取得 | 选择展开全过程、前置条件、起始装备、升级后整个人物重算未执行 |

因此目前可审阅的是：**全量作者输出、候选来源、实际写法、已验证数值能力与明确边界**。a～e 实现后才有本插件执行率；P3-4 才能给完整链路证据。未测与无法判明必须保留，不能变成 0%、100% 或估算“大部分”。

下一步：把效果来源、逐字段合并、写法执行、玩家选择/语境条件、未知提示及 NPC 施法路径补入同一份 P3 整体设计，先给驾驶员审阅；SRD/PAA/DDB 正式纳入【库】仍须按设计批准。然后回到原 a→b→c→d→e，不逐条补数据、不另造条目格式。

## 8. 本轮自检：做错后已修正的地方

1. 初版探路代理递归包住作者配置，把不存在的可选键当缺依赖。已在载入后还原真实配置对象，只对实际不存在的宿主调用报错；没有逐条填配置。
2. 初版试用职业转换器会再次取共享缓存，后续父职业查找被作者转换过程的修改影响。改用作者已有的 isClsDereferenced/isScDereferenced 选项和副本，保留转换前语料；没有改作者算法。
3. 初版把原始怪物 spellcasting 当普通特性送入转换器。读回作者 NPC 导入流程后撤销该错误调用，单列必须走完整导入路径的边界；没有删除 ability 或手补施法数据。
4. 初版 SRD 读取只找 JSON，读成空包。核对作者 utils/packs.mjs 后改用同一 YAML 解析库，增加“包为空立即失败”及“SRD 候选全零立即失败”的断言；错误的零结果未作为最终结论。
5. DDB 初版只沿用 Node 测试环境，漏了作者已有的 DOM 测试模式、正式 API_BASE 和 load 的 document 参数，导致部分异常来自测量环境。已按作者入口修正并重测，环境错误不归咎数据。
6. 新脚本最初有未使用变量和错误原因未保留，lint 检出后清理并重新跑项目检查。
` 
const reportFile = `${root}docs/handoff/D2-P3-2_⓪探路报告.md`
const existing = await readFile(reportFile, 'utf8')
const appendixAt = existing.indexOf('\n## 9. 未覆盖部分是否都需要语境')
await writeFile(reportFile, report + (appendixAt < 0 ? '' : existing.slice(appendixAt)))
console.log(JSON.stringify({ effects: a.groups, numeric, sources: sc, ddb: d.groups, report: 'docs/handoff/D2-P3-2_⓪探路报告.md' }, null, 2))
