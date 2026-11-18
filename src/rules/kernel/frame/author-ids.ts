// 显示名统一按作者编号取（主线 naming.ts）：小窗只负责把 dnd5e 编号换回作者编号，不起名。
// 换法全用作者自己的通路，不建对照表：把这个编号放进一个空白人物 → Plutonium 读人物现有熟练（getExisting，作者名）
// → Plutonium 渲染这个熟练（_getRenderedStatic，作者链接）→ 链接上的作者编号（页面 + 来源 + hash，与 Plutonium 写进物品的 flags 同形）。
// 多个来源保留全部作者链接，主线核对译名是否一致；没有链接时保留待解析状态。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者组件和官方文档没有类型声明 */
import type { KernelRefFlags } from '../../../core/saves/split'
import { plutoniumBuild } from './plutonium-build'
import { BUILD_ACTOR_TYPE } from './actor-types'

const g = globalThis as any
/** 数值型熟练（技能、工具、豁免）记在各自的键下，其余（语言、护甲、武器、抗性……）是一个集合。 */
const NUMERIC = new Set(['skills', 'tool', 'saves'])

/** 作者渲染出的 HTML 里唯一的作者链接 → 作者编号。 */
export function authorIdFromHtml(html: string, pageToProps: Record<string, string[] | undefined>): KernelRefFlags | null {
  const box = document.createElement('div')
  box.innerHTML = html
  const links = [...box.querySelectorAll('[data-vet-page][data-vet-hash]')]
  if (links.length !== 1) return null
  const page = links[0].getAttribute('data-vet-page') ?? ''
  const hash = links[0].getAttribute('data-vet-hash') ?? ''
  const source = links[0].getAttribute('data-vet-source') ?? ''
  const propDroppable = pageToProps[page]?.[0]
  return page && hash && propDroppable ? { page, source, hash, propDroppable } : null
}

/** 每个 dnd5e 编号对应的全部作者编号；来源多解完整交回。 */
export async function authorIdsOf(keys: Iterable<string>): Promise<Record<string, KernelRefFlags[]>> {
  const api = plutoniumBuild
  const trait = g.dnd5e?.documents?.Trait
  if (!api || !trait) return {}
  const select = api.Charactermancer_OtherProficiencySelect
  const availableProficiencyManager = await api.Charactermancer_AvailableProficiencyManager.pGetInstance()
  const blank = new g.CONFIG.Actor.documentClass({ name: 'Author ids', type: BUILD_ACTOR_TYPE })
  const out: Record<string, KernelRefFlags[]> = {}
  for (const key of new Set(keys)) {
    try {
      const type = key.split(':')[0]
      const path = trait.changeKeyPath(key)
      if (!path) continue
      const leaf = key.split(':').pop()
      const actor = blank.clone(g.foundry.utils.expandObject({ [path]: NUMERIC.has(type) ? 1 : [leaf] }))
      const existing = select.getExisting(select.getExistingFvttFromActor(actor), { availableProficiencyManager })
      const found = Object.entries(existing ?? {}).flatMap(([prop, names]: [string, any]) =>
        Object.entries(names ?? {}).filter(([name, v]) => name !== 'other' && v).map(([name]) => ({ prop, name })))
      const ids = found.flatMap(value => {
        const html = select._getRenderedStatic({ ...value, availableProficiencyManager })
        const id = typeof html === 'string' ? authorIdFromHtml(html, g.UrlUtil.PAGE_TO_PROPS ?? {}) : null
        return id ? [id] : []
      })
      if (ids.length) out[key] = ids
    } catch (e) {
      console.warn('[trpg-assistant] 作者编号换不出', key, e)
    }
  }
  return out
}
