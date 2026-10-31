import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'
import { loadS1Before } from './s1-snapshot'
import { ID_REDIRECTS } from '../../tools/data/config/idRedirects'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

const FAMILY_ID = 'item.drow-equipment-family.mm'
/** 卓尔装备的具体物品与 6 个母条目（编号不变，名称改成「卓尔装备·…」）。 */
const isDrow = (id: string): boolean => /-drow-plus-\d\.mm$/.test(id) || /^item\.drow-plus-\d-(weapon|armor)\.mm$/.test(id)

/** S1 允许新增的键：升级授予里跨包可选授予的 labels 与 packId。 */
function allowedNew(path: string[], key: string): boolean {
  return path.length === 2 && path[0] === 'advancement' && (key === 'labels' || key === 'packId')
}

function violations(oldValue: unknown, newValue: unknown, path: string[], out: string[]): void {
  if (out.length > 5) return
  if (Array.isArray(oldValue)) {
    if (!Array.isArray(newValue) || newValue.length < oldValue.length) { out.push(`${path.join('.')} 数组变短或类型变了`); return }
    oldValue.forEach((item, i) => violations(item, newValue[i], [...path, String(i)], out))
    if (newValue.length > oldValue.length) out.push(`${path.join('.')} 数组变长`)
    return
  }
  if (isObj(oldValue)) {
    if (!isObj(newValue)) { out.push(`${path.join('.')} 类型变了`); return }
    for (const [key, item] of Object.entries(oldValue)) violations(item, newValue[key], [...path, key], out)
    for (const key of Object.keys(newValue)) if (!(key in oldValue) && !allowedNew(path, key)) out.push(`${path.join('.')}.${key} 是不允许新增的键`)
    return
  }
  if (oldValue !== newValue) out.push(`${path.join('.')}: ${JSON.stringify(oldValue)?.slice(0, 40)} → ${JSON.stringify(newValue)?.slice(0, 40)}`)
}

describe('S1 只改允许的地方', () => {
  const before = loadS1Before()
  const now = allEntries()
  const byId = new Map(now.map((e) => [e.id, e]))

  it('条目集合：只多一个家族；少的全在重定向表里（卓尔装备枪械）且目标存在', () => {
    const added = now.filter((e) => !before[e.id]).map((e) => e.id)
    expect(added).toEqual([FAMILY_ID])
    const removed = Object.keys(before).filter((id) => !byId.has(id))
    expect(removed.length).toBeGreaterThan(0)
    for (const id of removed) {
      expect(ID_REDIRECTS[id], id).toBeDefined()
      expect(byId.has(ID_REDIRECTS[id].to), id).toBe(true)
      expect(before[id].data.baseItem, id).toBeDefined()
    }
  })

  it('每个保留的条目：类型不变；名称、摘要、关键词只在卓尔装备上变；英文名只能变成英文那一遍的名字；data 只增不改', () => {
    // 先算出改了名的条目，供其他条目里的引用显示文字同步
    const renamed = new Map<string, string>()
    for (const e of now) { const old = before[e.id]; if (old && old.name !== e.name) renamed.set(old.name, e.name) }
    // 长名字先换（链甲衫在链甲之前）
    const replaceNames = (value: string): string => { let out = value; for (const [from, to] of [...renamed].sort((x, y) => y[0].length - x[0].length)) out = out.split(from).join(to); return out }
    const bad: string[] = []
    for (const e of now) {
      const old = before[e.id]
      if (!old) continue
      if (e.type !== old.type) bad.push(`${e.id} 类型变了`)
      if (e.name !== old.name) {
        if (!isDrow(e.id) || !e.name.startsWith('卓尔装备·')) bad.push(`${e.id} 名称变了：${old.name} → ${e.name}`)
        if (e.summary !== replaceNames(old.summary)) bad.push(`${e.id} 摘要不只是名称变化`)
      } else if (e.summary !== replaceNames(old.summary)) bad.push(`${e.id} 摘要变了`)
      const english = (e as { i18n?: { en?: { name?: string } } }).i18n?.en?.name
      const cleanedAlias = !english && /[\u4e00-\u9fff]/.test(old.nameEn ?? '') && !/[\u4e00-\u9fff]/.test(e.nameEn ?? '') // 只有中文的基线别名：英文名去掉汉字
      if (e.nameEn !== old.nameEn && e.nameEn !== english && !cleanedAlias) bad.push(`${e.id} 英文名 ${old.nameEn} → ${e.nameEn} 不是英文那一遍的名字`)
      const wanted = [...new Set(old.keywords.map((k) => (k === old.name ? e.name : k === old.nameEn ? (e.nameEn ?? k) : k)))]
      if (e.nameEn !== old.nameEn && e.nameEn && !wanted.includes(e.nameEn)) wanted.push(e.nameEn)
      if (JSON.stringify([...e.keywords].sort()) !== JSON.stringify(wanted.sort())) bad.push(`${e.id} 关键词不是「旧关键词按名称变化同步」：${JSON.stringify(e.keywords)} vs ${JSON.stringify(wanted)}`)
      const out: string[] = []
      violations(JSON.parse(replaceNames(JSON.stringify(old.data))), e.data, [], out)
      if (out.length) bad.push(`${e.id}: ${out[0]}`)
    }
    expect(bad.slice(0, 10)).toEqual([])
  }, 180_000)
})
