// 结算小窗的中文语言文件：官方客户端按「系统 / 模块清单里登记的语言文件」给界面文字（技能名、语言名、进阶标题、状态名……）。
// 沿用作者词表和社区语言键生成；作者建卡器界面字另有底稿 tools/plutonium-ui-translations.json（只把 final 行并进来）；
// 驾驶员明确批准的单项译文放 approved-translations.json：
//   · 对每个已装包（vendor/foundry/manifest.json 里的系统和模块），按它自己清单里登记的英文文件逐条翻；
//   · 同一编号先用社区翻译模块（按同一套编号逐条翻好的，如 5e_chn；读法见 tools/lib/community-langs.mjs，驾驶员 2026-11-17 定：两边不同时听社区）；
//   · 社区没有的编号，再从作者「大译名表」配：整句完全相同（忽略大小写和首尾空格）才翻，对不上的留空——官方客户端缺哪个键就自动回退英文；
//   · 同一个英文有几种中文：同一组兄弟键（同一个上级路径，例如全是语言名）里多数词属于哪个分类，整组就优先取那个分类
//     （Giant 在语言名一组里是「巨人语」，不是生物「巨人」）；仍有几种 → 不翻，记进复核清单，不替人挑。
// 产出（都是生成的，不手改）：
//   <包目录>/lang/zh.json                    各包的中文语言文件（Foundry 核心 = vendor/foundry/lang/zh.json）
//   vendor/foundry/lang-packs.json           声明：有哪些语言包、每包哪些文件、内容摘要（插件按它登记，不写死语言名单）
//   vendor/foundry/lang-packs.review.json    复核清单（冲突、统计），不进运行时
// 译名表换版本或 dnd5e 换版本后重跑：npm run gen:kernel-lang   （译名表位置见 tools/lib/terms.mjs）
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { choose, loadTerms } from './lib/terms.mjs'
import { upstreamMessages } from './lib/upstream-messages.mjs'
import { applyPluginUi, pluginUiKeyCollisions, pluginUiRows, pluginUiStats } from './lib/plugin-ui.mjs'
import { communityDir, loadCommunity } from './lib/community-langs.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const foundry = join(root, 'vendor/foundry')
const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback
const LANG = arg('lang', 'zh')
const LANG_NAME = arg('name', '中文')
/** 一组里某个分类要覆盖多大比例的「有译法的成员」才算这组的分类（语言名一组几乎全是语言分类）。 */
const GROUP_SHARE = 0.6
const GROUP_MIN = 3

const { candidates, version } = await loadTerms()
if (!candidates.size) { console.error('译名表没读到，不生成（避免产出空的语言包）。'); process.exit(1) }

const community = await loadCommunity({ lang: LANG, name: LANG_NAME })
const communityFrom = [...new Set([...community.values()].flat().map((c) => c.from))]

const manifest = JSON.parse(await readFile(join(foundry, 'manifest.json'), 'utf8'))
const packages = [
  { type: 'system', id: manifest.system.split(' ')[0], dir: `systems/${manifest.system.split(' ')[0]}`, file: 'system.json' },
  ...Object.keys(manifest.modules).map((id) => ({ type: 'module', id, dir: `modules/${id}`, file: 'module.json' })),
  // Foundry 核心自己的界面字（效果改法、文档名……）：核心没有包清单，英文文件固定在 lang/en.json；社区里声明 coreTranslation 的模块翻它
  { type: 'core', id: 'core', dir: '', file: null },
]

const leaves = (obj, path = '', out = []) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = path ? `${path}.${k}` : k
    if (v && typeof v === 'object') leaves(v, key, out)
    else if (typeof v === 'string') out.push({ key, text: v })
  }
  return out
}
const parentOf = (key) => key.slice(0, Math.max(0, key.lastIndexOf('.')))

/** 每个上级路径下的成员里，哪个分类覆盖得最多（要够多才算）；平手取靠前的分类。 */
function groupCategories(list) {
  const groups = new Map()
  for (const { key, text } of list) {
    const c = candidates.get(text.trim().toLowerCase())
    if (!c) continue
    const g = groups.get(parentOf(key)) ?? { members: 0, byCategory: new Map() }
    g.members++
    for (const cat of new Set(c.map((x) => x.category))) g.byCategory.set(cat, (g.byCategory.get(cat) ?? 0) + 1)
    groups.set(parentOf(key), g)
  }
  const out = new Map()
  for (const [parent, g] of groups) {
    if (g.members < GROUP_MIN) continue
    const best = [...g.byCategory].sort((a, b) => b[1] - a[1])[0]
    if (best && best[1] / g.members >= GROUP_SHARE) out.set(parent, best[0])
  }
  return out
}

async function equipmentLabels(pkg) {
  const bundle = await readFile(join(foundry, pkg.dir, 'js/Bundle.js'), 'utf8')
  const rows = [...bundle.matchAll(/class _EquipmentTypeExpander_\w+ extends _EquipmentTypeExpanderBase \{\s*name = "([^"]+)";\s*equipmentType = "(\w+)";/g)]
  if (!rows.length) throw Error('没读到 Plutonium 的起始装备类别登记')
  return rows.map(([, text, code]) => ({ key: `TRPGAssistant.EquipmentType.${code}`, text, isEquipment: true }))
}

const approved = JSON.parse(await readFile(join(root, 'tools/approved-translations.json'), 'utf8'))
const uiDraft = LANG === 'zh' ? pluginUiRows(JSON.parse(await readFile(join(root, 'tools/plutonium-ui-translations.json'), 'utf8'))) : []
const uiStats = pluginUiStats(uiDraft)
const applied = []
const upstream = await upstreamMessages(foundry)
const files = []
const review = { generatedFrom: version, community: communityFrom, communityDir, lang: LANG, packs: [], upstreamMessages: [], approvedOverrides: applied }
for (const pkg of packages) {
  const pkgManifest = pkg.file ? JSON.parse(await readFile(join(foundry, pkg.dir, pkg.file), 'utf8')) : { languages: [{ lang: 'en', path: 'lang/en.json' }] }
  const en = (pkgManifest.languages ?? []).find((l) => l.lang === 'en')
  if (!en) continue
  const source = JSON.parse(await readFile(join(foundry, pkg.dir, en.path), 'utf8'))
  const list = leaves(source)
  if (pkg.id === 'plutonium') list.push(...await equipmentLabels(pkg), ...upstream)
  const cats = groupCategories(list)
  const flat = {}
  const conflicts = []
  const differs = []
  let fromCommunity = 0
  // 社区翻译：同一编号、有字、和英文原文不同才算翻了
  const communityOf = (key, text) => (community.get(pkg.id) ?? []).map((c) => c.texts[key]).find((v) => typeof v === 'string' && v.trim() && v.trim() !== text.trim())
  for (const { key, text, isEquipment } of list) {
    const override = approved.find(row => row.lang === LANG && row.package === pkg.id && row.text === text)
    if (override) { flat[key] = override.translation; applied.push({ ...override, key }); continue }
    const term = text.trim().toLowerCase()
    // 类别登记用单数，译名表也可能只收规则书里的复数（原词优先）。
    const all = candidates.get(term) ?? (isEquipment ? candidates.get(`${term}s`) : undefined)
    const preferred = all ? cats.get(parentOf(key)) : undefined
    const inGroup = preferred === undefined || !all ? [] : all.filter((x) => x.category === preferred)
    const picked = all ? choose(inGroup.length ? inGroup : all) : null
    const shared = communityOf(key, text)
    if (shared) {
      flat[key] = shared
      fromCommunity++
      if (picked?.label && picked.label !== shared) differs.push({ key, en: text, community: shared, terms: picked.label })
      continue
    }
    if (!all) continue
    if (picked?.label) flat[key] = picked.label
    else conflicts.push({ key, en: text, candidates: picked?.candidates.map((x) => ({ zh: x.zh, category: x.category })) ?? [] })
  }
  if (pkg.id === 'plutonium' && LANG === 'zh') {
    const ui = applyPluginUi(flat, uiDraft, approved)
    Object.assign(flat, ui.flat)
    const keyCollisions = pluginUiKeyCollisions(flat, uiDraft, approved)
    review.pluginUi = {
      ...uiStats,
      included: ui.added.length,
      sharedWithUpstream: ui.shared,
      approvedOverrides: ui.approvedRows,
      conflicts: [...ui.conflicts, ...keyCollisions],
      reviewRows: uiDraft
        .filter((row) => row.status === 'review' && !approved.some((item) => item.lang === LANG && item.package === pkg.id && item.text === row.text))
        .map((row) => ({ text: row.text, translation: row.translation, from: row.from, seen: row.seen, candidates: row.candidates, note: row.note })),
    }
    review.upstreamMessages = upstream.map(row => ({ ...row, origins: row.origins.slice(0, 3), translation: flat[row.key] ?? null }))
  }
  const zhPath = en.path.replace(/en\.json$/, `${LANG}.json`)
  review.packs.push({ package: `${pkg.type}:${pkg.id}`, total: list.length, translated: Object.keys(flat).length, fromCommunity, conflicts: conflicts.length, groupsWithCategory: cats.size, conflictList: conflicts.slice(0, 300), differsFromTerms: differs.length, differsList: differs })
  if (!Object.keys(flat).length) continue
  // 平铺的点号键：官方客户端读语言文件时会 expandObject，和嵌套写法等价
  const body = JSON.stringify(flat, null, 1) + '\n'
  await mkdir(join(foundry, pkg.dir, zhPath, '..'), { recursive: true })
  await writeFile(join(foundry, pkg.dir, zhPath), body)
  files.push({ package: pkg.type, id: pkg.id, path: zhPath, sha256: createHash('sha256').update(body).digest('hex') })
}

const hash = createHash('sha256').update(files.map((f) => `${f.package}:${f.id}:${f.path}:${f.sha256}`).sort().join('\n')).digest('hex')
const declaration = { generatedFrom: [`大译名表 ${version}`, ...communityFrom.map((x) => `社区 ${x}`)].join('；'), packs: { [LANG]: { name: LANG_NAME, hash, files } } }
await writeFile(join(foundry, 'lang-packs.json'), JSON.stringify(declaration, null, 1) + '\n')
await writeFile(join(foundry, 'lang-packs.review.json'), JSON.stringify(review, null, 1) + '\n')
for (const p of review.packs) console.log(`${p.package}：${p.total} 条，翻了 ${p.translated}（社区 ${p.fromCommunity}），冲突不翻 ${p.conflicts}，与译名表译法不同 ${p.differsFromTerms}，有分类的组 ${p.groupsWithCategory}`)
if (review.pluginUi) console.log(`plutonium 界面字：底稿 ${review.pluginUi.total} 条，final ${review.pluginUi.final}，review ${review.pluginUi.review}，并入 ${review.pluginUi.included}，与已有键共用 ${review.pluginUi.sharedWithUpstream}，冲突 ${review.pluginUi.conflicts.length}`)
console.log(`语言包 ${LANG}：${files.length} 个文件，摘要 ${hash.slice(0, 12)} → vendor/foundry/lang-packs.json`)
