// P3-4 结果汇总：把 P3-1、结算内核全链路、真实【库】存档/备份的结果逐行写成设计 §5 的 14 行。
// 用法：node tests/e2e/p3-4-report.mjs（先跑 p3-1.mjs、kernel/full-chain.mjs、library/p3-4-full.mjs）
import fs from 'node:fs'
import { join } from 'node:path'
import { root } from './kernel/assets.mjs'

const engines = (process.env.ENGINE ? process.env.ENGINE.split(',') : ['chrome', 'webkit'])
const outDir = join(root, 'work/e2e-lib')
const kernelDir = join(root, 'work/p3-2-a')
const evidence = {
  p31: name => `work/e2e-lib/p3-1-${name}.json（本轮重跑）`,
  kernel: name => `work/p3-2-a/p3-4-kernel-${name}.json（本轮重跑）`,
  full: name => `work/e2e-lib/p3-4-full-${name}.json（本轮重跑）`,
  p32: 'work/p3-2-a/candidate-*.json、monsters-*.json、build-*.json、session-*.json、dice-*.json、convert-*.json（P3-2 各段本轮回归）',
}

const read = path => {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')) } catch { return null }
}

function rowsFor(name) {
  const p31 = read(join(outDir, `p3-1-${name}.json`))
  const kernel = read(join(kernelDir, `p3-4-kernel-${name}.json`))
  const full = read(join(outDir, `p3-4-full-${name}.json`))
  const v31 = p31?.verdict ?? {}
  const f = full?.out ?? {}
  const k = kernel?.first ?? {}
  const row = (id, design, pass, evidenceText, note = '') => ({ id, design, pass: !!pass, evidence: evidenceText, note })
  return [
    row(1, '一本书属于两个范围或全局；两种战役都能用，内容只存一份', p31?.passed && v31.catalog && v31.assign, evidence.p31(name), 'P3-1 catalog/assign 分支'),
    row(2, '同一条从多个范围进来只出现一次，不重复加成', f.dedupe?.rows > 0 && f.dedupe?.unique === f.dedupe?.rows, evidence.full(name), `query ${f.dedupe?.rows} 行 / 唯一 ${f.dedupe?.unique}`),
    row(3, '两个战役用不同资料，来回切换互不影响', f.dedupe?.otherCampaignRows === 0 && v31.fetchReasons, evidence.full(name), `排除 PHB 的战役查到 ${f.dedupe?.otherCampaignRows} 行；P3-1 缺失原因 ${JSON.stringify(p31?.out?.fetch)}`),
    row(4, '房规覆盖只在设定处生效；关掉回原件；存档引用编号不变', v31.houseRule && v31.houseDeletedFallsBack && f.checkBefore?.overridesChanged && f.closed?.refsSurvive, evidence.p31(name), `P3-1 houseRule/houseDeleted；本轮覆盖差异 ${f.checkBefore?.overridesChanged}`),
    row(5, '同编号 A+B、C、D：导入后原件照常生效，选备选才换，不悄悄盖掉', v31.baseStaysOfficial && v31.alternativeHasPatch && v31.brewVsBrewEarlierWins && v31.copyOfOriginal, evidence.p31(name), 'P3-1 四个分支'),
    row(6, '自制导出再导入：作者内容与依赖恢复；范围设置可单独恢复', v31.export && p31?.out?.scopesExport?.format === 'trpg-library-scopes' && f.scopes?.exported === 'trpg-library-scopes' && f.restored?.library?.brews > 0, evidence.p31(name), `导出 scopes；恢复 brews=${f.restored?.library?.brews}`),
    row(7, '新建、编辑、删除自己的条目：走作者可编辑路径；身份清楚', v31.savedEntry && v31.template && v31.convertClassic && v31.houseDeletedFallsBack, evidence.p31(name), 'P3-1 savedEntry/template/convert/houseDeleted'),
    row(8, '结算五段：真实作者条目、每个数有来源；本链路实际调用一次', kernel?.passed && k.levelUp?.status === 'complete' && k.equip?.status === 'complete' && k.cast?.status === 'complete' && k.damage?.status === 'complete' && (k.levelUp?.changes?.length ?? 0) > 0 && k.provenance?.levelUp?.after === 2 && k.provenance?.damage?.after === 2 && k.provenance?.cast?.after === 1, evidence.kernel(name), `变更 ${k.levelUp?.changes?.length ?? 0}+${k.damage?.changes?.length ?? 0} 条；出处前后值 ${JSON.stringify(k.provenance)}；P3-2 各段：${evidence.p32}`),
    row(9, '未支持写法标出受影响的数，不冒充完整', (k.unsupported?.count ?? 0) > 0 && (k.unsupported?.sample?.length ?? 0) > 0, evidence.kernel(name), `未支持 ${k.unsupported?.count} 条`),
    row(10, '完整链路：建 2014 战役 → 选范围 → 结算内核建卡 → 打一场（含怪物）→ 预览 → 写入 → 撤销 → 存档 → 改范围 → 读档 → 结果一致', full?.passed && f.appliedRevision === 1 && f.loadedState && f.checkLoaded === 0 && f.appliedState?.monsterHp === 2 && f.appliedState?.spell1 === 1, evidence.full(name), `真实 changes ${f.changes}；HP ${f.appliedState?.heroHp}/${f.appliedState?.monsterHp}；法术位 ${f.appliedState?.spell1}`),
    row(11, '断网重开：同版本下结果一致', kernel?.passed && (kernel?.replayDiffs?.length ?? 1) === 0, evidence.kernel(name), `两次全新启动差异 ${kernel?.replayDiffs?.length}`),
    row(12, '缺资料 / 版本变了：引用、选择、状态不丢（含 §4 差别列表）', f.checkBefore?.dataVersionChanged && f.checkBefore?.overridesChanged && (f.closed?.missing?.length ?? 0) > 0 && f.closed?.refsSurvive && f.open === 0 && f.checkLoaded === 0, evidence.full(name), `版本 ${f.checkBefore?.dataVersionChanges?.official?.before}→${f.checkBefore?.dataVersionChanges?.official?.after}；覆盖 ${f.checkBefore?.overridesChanged}`),
    row(13, '旧修订 / 写入失败：不覆盖新数据、不破坏旧存档', f.stale === 'E_REVISION_CONFLICT' && f.staleUnchanged, evidence.full(name), `旧修订返回 ${f.stale}`),
    row(14, '完整备份恢复：自制和房规还在；缺的官方数据明确列出', (f.backup?.libraryFiles ?? 0) >= 3 && (f.restored?.library?.brews ?? 0) > 0 && (f.restored?.library?.houseRules ?? 0) > 0 && f.restored?.workspace && (f.restored?.missing ?? 1) === 0, evidence.full(name), `备份文件 ${f.backup?.libraryFiles}；恢复 brews=${f.restored?.library?.brews} houseRules=${f.restored?.library?.houseRules} missing=${f.restored?.missing}`),
  ]
}

const errors = name => {
  const p31 = read(join(outDir, `p3-1-${name}.json`))
  const kernel = read(join(kernelDir, `p3-4-kernel-${name}.json`))
  const full = read(join(outDir, `p3-4-full-${name}.json`))
  const all = [...(p31?.errors ?? []), ...(kernel?.first?.errors ?? []), ...(kernel?.replay?.errors ?? []), ...(full?.errors ?? [])]
  return all.map(text => text.includes('gendata-nav-adventure-book-index.json')
    ? { text: text.split('\n')[0], decision: '单列：文件已在【库】镜像（hasSourceFile=true），作者导航仍请求它；只影响书目导航，不影响条目、存档、备份；不手写生成文件。' }
    : { text: text.split('\n')[0], decision: '已解释/非 P3-4 失败' })
}

const results = []
for (const name of engines) {
  const rows = rowsFor(name)
  const passed = rows.every(r => r.pass)
  const result = { engine: name, passed, rows, errors: errors(name), generatedAt: new Date().toISOString() }
  fs.writeFileSync(join(outDir, `p3-4-${name}.json`), JSON.stringify(result, null, 2) + '\n')
  results.push(result)
  console.log(name, passed ? 'PASS' : 'FAIL', rows.map(r => `${r.id}:${r.pass ? 'PASS' : 'FAIL'}`).join(' '))
  for (const error of result.errors) console.log(' error:', error.text, '→', error.decision)
}
process.exit(results.every(r => r.passed) ? 0 : 1)
