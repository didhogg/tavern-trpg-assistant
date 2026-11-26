// 参考实录工具的「自动对比」：同一串操作，参考那边（Tidy5e + dnd5e + 作者）做一遍、我们插件里做一遍，
// 两边各导出 preparedActors（source = 存下来的完整人物，system = 算出来的数），逐项比，出差异表。
//
// 编号问题用一条通用规则处理，不按字段写特例：每次导入作者都给条目、成长发新的随机编号，所以
// 先把这个人数据里出现过的所有编号（人物、物品、效果、成长）登记成「它指的是什么」（例「物品:feat:Wild Shape」），
// 再把数据里所有地方出现的这些编号换成标签——引用就按「指的是哪件东西」比，不按随机号比。
//
// 只有下面这几个键跟操作结果无关，整键去掉（集中登记在这里，写明原因）：
const NOISE_KEYS = {
  _stats: '创建 / 修改时间、系统版本号：每次建都不同',
  sort: '列表排序序号：拖放顺序，不是人物数据',
  ownership: '谁能看这个人：参考小窗和插件小窗的用户不同',
  folder: 'Foundry 文件夹：参考小窗里不建文件夹',
}

// 插件自己记在人物上的东西（flags 里插件自己的名下，例如「作者这次导入加了哪些」的记录，地基 ②）：参考那边本来就没有，
// 单独列成一节「插件自己的记录」，不混进真正的差别里。
const OWN_FLAGS = 'flags.tavern-trpg'

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)

/** 登记这个人数据里所有编号 → 标签。同名同类多件按出现顺序加 #2、#3。 */
function idLabels(actor) {
  const map = new Map()
  const seen = new Map()
  const label = (base) => { const n = (seen.get(base) ?? 0) + 1; seen.set(base, n); return n > 1 ? `${base}#${n}` : base }
  if (actor._id) map.set(actor._id, '人物')
  for (const item of actor.items ?? []) {
    const itemLabel = label(`物品:${item.type}:${item.name}`)
    if (item._id) map.set(item._id, itemLabel)
    for (const adv of Array.isArray(item.system?.advancement) ? item.system.advancement : Object.values(item.system?.advancement ?? {})) {
      if (adv?._id) map.set(adv._id, label(`${itemLabel}/成长:${adv.type}:${adv.level ?? ''}:${adv.title ?? ''}`))
    }
    for (const act of Object.values(item.system?.activities ?? {})) if (act?._id) map.set(act._id, label(`${itemLabel}/活动:${act.type}:${act.name ?? ''}`))
    for (const eff of item.effects ?? []) if (eff._id) map.set(eff._id, label(`${itemLabel}/效果:${eff.name}`))
  }
  for (const eff of actor.effects ?? []) if (eff._id) map.set(eff._id, label(`效果:${eff.name}`))
  return map
}

/** 把编号换成标签、去掉无关键。字符串里嵌着的编号（如 Actor.xxx.Item.yyy）也换。 */
function normalize(value, ids) {
  const swap = (s) => {
    if (ids.has(s)) return `‹${ids.get(s)}›`
    return s.replace(/[A-Za-z0-9]{16}/g, (m) => (ids.has(m) ? `‹${ids.get(m)}›` : m))
  }
  const walk = (v) => {
    if (typeof v === 'string') return swap(v)
    if (Array.isArray(v)) return v.map(walk)
    if (isObj(v)) {
      const out = {}
      for (const [k, x] of Object.entries(v)) { if (Object.hasOwn(NOISE_KEYS, k)) continue; out[swap(k)] = walk(x) }
      return out
    }
    return v
  }
  return walk(value)
}

/** 摊平成「路径 → 值」。数组按下标。 */
function flat(v, prefix = '', out = {}) {
  if (Array.isArray(v)) { if (!v.length) out[prefix] = '[]'; v.forEach((x, i) => flat(x, `${prefix}[${i}]`, out)) }
  else if (isObj(v)) { const keys = Object.keys(v); if (!keys.length) out[prefix] = '{}'; for (const k of keys) flat(v[k], prefix ? `${prefix}.${k}` : k, out) }
  else out[prefix] = v
  return out
}

function diffFlat(a, b) {
  const rows = []
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k]; const y = b[k]
    if (JSON.stringify(x) !== JSON.stringify(y)) rows.push({ path: k, ref: x, ours: y })
  }
  return rows.sort((p, q) => p.path.localeCompare(q.path))
}

/** 一个人的东西按标签分好：物品、人物身上的效果。 */
function byLabel(list, kind) {
  const seen = new Map(); const out = new Map()
  for (const x of list ?? []) {
    const base = kind === 'item' ? `${x.type}:${x.name}` : x.name
    const n = (seen.get(base) ?? 0) + 1; seen.set(base, n)
    out.set(n > 1 ? `${base}#${n}` : base, x)
  }
  return out
}

/** 给人看的结果概要：职业 / 子职业和等级、各类东西各几件（按数据里实际有的类型数，不写死类型）。 */
function summary(actor) {
  const items = actor.items ?? []
  const classes = items.filter((i) => i.type === 'class').map((i) => `${i.name} ${i.system?.levels ?? ''} 级`)
  const subs = items.filter((i) => i.type === 'subclass').map((i) => i.name)
  const counts = {}
  for (const i of items) counts[i.type] = (counts[i.type] ?? 0) + 1
  return `${classes.join(' + ') || '没有职业'}${subs.length ? `（${subs.join('、')}）` : ''}；${Object.entries(counts).map(([t, n]) => `${t} ${n}`).join('、')}；人物身上效果 ${actor.effects?.length ?? 0}`
}

/**
 * 比两边。ref / ours = preparedActors 里的一项 { source, system }。
 * 交回：人物本身（存下的 + 算出的）差别、物品 / 效果 只在一边的、两边都有但内容不同的。
 */
export function compareActors(ref, ours) {
  const nr = normalize(ref.source, idLabels(ref.source))
  const no = normalize(ours.source, idLabels(ours.source))
  const strip = (s) => { const { items, effects, ...rest } = s; return rest }
  const actorRows = diffFlat(flat(strip(nr)), flat(strip(no)))
  const own = (r) => r.path === OWN_FLAGS || r.path.startsWith(`${OWN_FLAGS}.`)
  const result = {
    actor: actorRows.filter((r) => !own(r)),
    own: actorRows.filter(own),
    summary: { ref: summary(ref.source), ours: summary(ours.source) },
    computed: diffFlat(flat(normalize(ref.system, idLabels(ref.source))), flat(normalize(ours.system, idLabels(ours.source)))),
    items: { onlyRef: [], onlyOurs: [], changed: [] },
    effects: { onlyRef: [], onlyOurs: [], changed: [] },
  }
  for (const [kind, key] of [['item', 'items'], ['effect', 'effects']]) {
    const a = byLabel(nr[key], kind); const b = byLabel(no[key], kind)
    for (const [label, x] of a) {
      if (!b.has(label)) { result[key].onlyRef.push(label); continue }
      const rows = diffFlat(flat(x), flat(b.get(label)))
      if (rows.length) result[key].changed.push({ label, rows })
    }
    for (const label of b.keys()) if (!a.has(label)) result[key].onlyOurs.push(label)
  }
  return result
}

const show = (v) => (v === undefined ? '（没有）' : typeof v === 'string' ? v : JSON.stringify(v)).replace(/\|/g, '\\|').slice(0, 120)

/** 差异表（给人看的 Markdown）。每件东西最多列 limit 行，多的写「还有 N 行」，完整的在 diff.json。 */
export function diffReport(d, { limit = 25 } = {}) {
  const lines = []
  const table = (rows) => {
    lines.push('| 位置 | 参考那边 | 我们这边 |', '|---|---|---|')
    for (const r of rows.slice(0, limit)) lines.push(`| \`${r.path}\` | ${show(r.ref)} | ${show(r.ours)} |`)
    if (rows.length > limit) lines.push(`| …还有 ${rows.length - limit} 行（见 diff.json） | | |`)
  }
  const count = d.actor.length + d.computed.length + d.items.onlyRef.length + d.items.onlyOurs.length + d.items.changed.length + d.effects.onlyRef.length + d.effects.onlyOurs.length + d.effects.changed.length
  lines.push(`- 参考那边结果：${d.summary.ref}`, `- 我们这边结果：${d.summary.ours}`, '')
  lines.push(count ? `**共 ${count} 处不同**` : '**两边完全一样**', '')
  lines.push(`## 人物本身（存下来的数据）：${d.actor.length} 处不同`); if (d.actor.length) table(d.actor); lines.push('')
  lines.push(`## 人物算出来的数（角色卡上显示的）：${d.computed.length} 处不同`); if (d.computed.length) table(d.computed); lines.push('')
  for (const [key, name] of [['items', '物品 / 特性 / 法术 / 职业'], ['effects', '人物身上的效果']]) {
    const x = d[key]
    lines.push(`## ${name}`)
    lines.push(`- 只有参考那边有（我们漏了）：${x.onlyRef.length ? x.onlyRef.join('、') : '无'}`)
    lines.push(`- 只有我们这边有（参考没有）：${x.onlyOurs.length ? x.onlyOurs.join('、') : '无'}`)
    lines.push(`- 两边都有但内容不同：${x.changed.length ? '' : '无'}`)
    for (const c of x.changed) { lines.push('', `### ${c.label}（${c.rows.length} 处）`); table(c.rows) }
    lines.push('')
  }
  lines.push(`## 插件自己的记录（参考那边本来没有，预期的，不算差别）：${d.own.length} 行`)
  if (d.own.length) table(d.own)
  return lines.join('\n')
}
