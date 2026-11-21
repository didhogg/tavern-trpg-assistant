// 作者建卡器界面字底稿：读探针收字 + 私人版 Bundle.js（只在本机），算来源候选，合并进现有底稿。
// 只补新行、只更新 seen / candidates；已有 translation / status / from:agent 一律不覆盖。
// 本机没有 vendor/private/modules/plutonium/ 时提示后退出，不改底稿。
// 用法：node tools/build-plutonium-ui-draft.mjs
import { access, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadTerms, choose } from './lib/terms.mjs'
import { loadSitePairs } from './lib/site-pairs.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const privateDir = join(root, 'vendor/private/modules/plutonium')
const bundlePath = join(privateDir, 'js/Bundle.js')
const draftPath = join(root, 'tools/plutonium-ui-translations.json')
const packDir = join(root, 'work/p6-zh-pack')

try {
  await access(bundlePath)
} catch {
  console.log('跳过：本机没有私人完整版（vendor/private/modules/plutonium/js/Bundle.js），底稿不动。')
  process.exit(0)
}

const norm = (text) => String(text ?? '').replace(/\s+/g, ' ').trim()
const lower = (text) => norm(text).toLowerCase()
const readJson = async (path, fallback) => {
  try { return JSON.parse(await readFile(path, 'utf8')) } catch { return fallback }
}

const approved = await readJson(join(root, 'tools/approved-translations.json'), [])
const draft = await readJson(draftPath, [])
const previous = await readJson(join(packDir, 'seen-tr.json'), [])
const terms = await loadTerms()
const site = await loadSitePairs()
const bundle = await readFile(bundlePath, 'utf8')
const literals = await readJson(join(packDir, 'lits.json'), [])

const flat = (obj, path = '', out = {}) => {
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object') flat(value, `${path}${key}.`, out)
    else if (typeof value === 'string') out[`${path}${key}`] = value
  }
  return out
}
const dndEn = flat(await readJson(join(root, 'vendor/foundry/systems/dnd5e/lang/en.json'), {}))
const dndZh = flat(await readJson(join(root, 'vendor/foundry/systems/dnd5e/lang/zh.json'), {}))
const dnd = new Map()
for (const [key, value] of Object.entries(dndEn)) {
  if (!dndZh[key]) continue
  const text = lower(value)
  const list = dnd.get(text) ?? []
  list.push({ key, zh: dndZh[key] })
  dnd.set(text, list)
}
const dndScore = (key) => /^DND5E\.ADVANCEMENT\./.test(key) || /^DND5E\.StartingEquipment\./.test(key) ? 4
  : /^TYPES\.Item\./.test(key) ? 3 : /^DND5E\./.test(key) ? 2 : 1

/** 收字：优先读探针整理清单；没有就只读探针原始结果（新行先按 review 收）。 */
const observed = new Map()
const addObserved = (text, seen) => {
  const t = norm(text)
  if (!t) return
  const row = observed.get(t) ?? { text: t, seen: new Set() }
  for (const s of seen) row.seen.add(s)
  observed.set(t, row)
}
const uiList = await readJson(join(packDir, 'ui-list.json'), null)
const stepLabel = {
  'source-window': 'Source Window', 'builder-initial': 'Builder', class: 'Class', 'class-picked': 'Class',
  'add-class-open': 'Add Another Class', 'origin-background': 'Origin (Background)', 'origin-background-picked': 'Origin (Background)',
  'origin-species': 'Origin (Species)', 'origin-species-picked': 'Origin (Species)', 'origin-other': 'Origin (Other)',
  'origin-other-picked': 'Origin (Other)', abilities: 'Abilities', 'abilities-roll': 'Abilities', 'abilities-rolled': 'Abilities',
  'abilities-standard-array': 'Abilities', 'abilities-point-buy': 'Abilities', 'abilities-manual': 'Abilities',
  'starting-equipment': 'Starting Equipment', 'equipment-choose-open': 'Starting Equipment', 'equipment-used': 'Starting Equipment',
  'equipment-used-again': 'Starting Equipment', 'equipment-shop': 'Equipment Shop', 'equipment-shop-removed': 'Equipment Shop',
  'equipment-shop-filter': 'Equipment Shop', spells: 'Spells', 'spells-filter': 'Spells', 'spells-learn': 'Spells',
  'spells-prep': 'Spells', feats: 'Feats', 'feats-extra-open': 'Feats', 'finalize-warning': 'Finalize',
  'finalize-confirm': 'Finalize', 'build-complete': 'Build Complete',
}
const seenByText = new Map()
for (const [campaign, label] of [['collect-2014zh.json', '2014'], ['collect-2014en.json', '2014'], ['collect-2024ui.json', '2024']]) {
  const data = await readJson(join(packDir, campaign), null)
  if (!data) continue
  for (const row of data.texts ?? []) {
    const seen = seenByText.get(norm(row.t)) ?? new Set()
    for (const step of row.steps ?? []) seen.add(`${label}:${stepLabel[step] ?? step}`)
    seenByText.set(norm(row.t), seen)
  }
}
for (const row of previous) {
  const seen = seenByText.get(norm(row.t)) ?? new Set()
  seen.add('2014:previous-probe')
  seenByText.set(norm(row.t), seen)
}
if (!uiList) {
  console.log('缺少整理清单 work/p6-zh-pack/ui-list.json（先跑探针分拣），底稿不动。')
  process.exit(0)
}
for (const row of uiList) addObserved(row.t, seenByText.get(norm(row.t)) ?? [])
for (const row of previous) if (row.t !== 'The "') addObserved(row.t, seenByText.get(norm(row.t)) ?? [])

const candidatesOf = (text) => {
  const key = lower(text)
  const list = []
  const approve = approved.find((row) => row.lang === 'zh' && row.package === 'plutonium' && row.text === text)
  if (approve) list.push({ zh: approve.translation, from: 'approved-translations' })
  const dndRows = dnd.get(key) ?? []
  if (dndRows.length) {
    const best = Math.max(...dndRows.map((row) => dndScore(row.key)))
    for (const row of dndRows.filter((item) => dndScore(item.key) === best).slice(0, 8)) list.push({ zh: row.zh, from: `dnd5e:${row.key}` })
  }
  const term = terms.candidates.get(key)
  if (term) {
    const chosen = choose(term)
    if (chosen?.label) list.push({ zh: chosen.label, from: `terms:${chosen.candidates.map((item) => item.category || '常规').join('/')}` })
    else for (const item of chosen?.candidates ?? []) list.push({ zh: item.zh, from: `terms:${item.category || '常规'}` })
  }
  const pair = site.pairs.get(key)
  if (pair) list.push({ zh: pair.zh, from: `site:${pair.from.replace(/^5etools 中文站 /, '')}` })
  return list.filter((item) => item.zh)
}

const chosenOf = (list) => {
  const unique = [...new Set(list.map((item) => item.zh))]
  if (unique.length !== 1) return { translation: list[0]?.zh ?? '', from: list[0]?.from ?? 'agent', final: false }
  return { translation: unique[0], from: list.find((item) => item.zh === unique[0])?.from ?? 'agent', final: true }
}

const byText = new Map(draft.map((row) => [row.text, row]))
const result = []
for (const { text, seen } of observed.values()) {
  const existing = byText.get(text)
  if (existing) {
    const union = [...new Set([...(existing.seen ?? []), ...seen])].sort()
    const list = [...(existing.candidates ?? [])]
    for (const item of candidatesOf(text)) if (!list.some((old) => old.zh === item.zh && old.from === item.from)) list.push(item)
    result.push({ ...existing, seen: union, candidates: list })
    continue
  }
  const list = candidatesOf(text)
  const pick = chosenOf(list)
  result.push({
    lang: 'zh', package: 'plutonium', text,
    translation: pick.translation,
    from: pick.from,
    status: pick.final ? 'final' : 'review',
    seen: [...new Set(seen)].sort(),
    candidates: list,
    note: (text.match(/\{\}/g) ?? []).length ? `空位 {} 共 ${(text.match(/\{\}/g) ?? []).length} 个。` : '',
  })
}
// 保持已有行，哪怕这次探针没再看到（任务要求：只补，不删）。
for (const row of draft) if (!result.some((item) => item.text === row.text)) result.push(row)
result.sort((a, b) => a.text.localeCompare(b.text))
await writeFile(draftPath, JSON.stringify(result, null, 1) + '\n')
console.log(`底稿 ${result.length} 条（新收 ${Math.max(0, result.length - draft.length)}）；私人版 Bundle.js ${bundle.length} 字节；静态字串 ${literals.length} 条。`)
