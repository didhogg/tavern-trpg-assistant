// 同一个作者入口负责所有类别槽。保留作者候选及返回值，选择后由原调用方收下 UID。
/* eslint-disable @typescript-eslint/no-explicit-any -- 私人完整版未提供类型声明。 */
import type { NativePresentation } from '../native-presentation'
import { button, element } from './native-builder-elements'
import { nativeText } from './native-builder-controls'

const g = globalThis as any
const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase()

export function bindEquipmentPicker(author: any, presentation: NativePresentation): () => void {
  const proto = author.prototype
  const original = proto.pGetUserChoiceFromEquipmentTypes
  let trigger: HTMLButtonElement | null = null
  let close: (() => void) | undefined
  function remember(event: MouseEvent): void {
    const node = event.target instanceof Element && event.target.closest<HTMLButtonElement>('.p6-builder-equipment button:has(.fa-magnifying-glass)')
    if (!node) return
    trigger = node
    // 浏览器可以在同一次点击的两个监听器之间清空微任务。保留到该次事件分派结束。
    setTimeout(() => { if (trigger === node) trigger = null }, 0)
  }
  document.addEventListener('click', remember, true)
  proto.pGetUserChoiceFromEquipmentTypes = function (types: string[]) {
    const anchor = trigger
    if (!anchor) return original.call(this, types)
    close?.()
    const scope = anchor.closest('.imp-cls__wrp-equi-group')
    if (!scope) return original.call(this, types)
    const rows = g.SortUtil
    const uids: string[] = [...new Set<string>(types.flatMap((type) => this._getSetChoices(type)))].sort(rows.ascSortLower)
    return new Promise<[boolean, string | null]>((resolve) => {
      const panel = element('div', 'p6-equip-picker p6-builder-ui')
      const search = element('input', 'p6-picker-search')
      search.type = 'search'
      search.placeholder = '搜索装备'
      search.setAttribute('aria-label', search.placeholder)
      const list = element('div', 'p6-equip-picker-list')
      panel.append(search, list)
      function finish(ok: boolean, uid: string | null = null): void {
        document.removeEventListener('pointerdown', outside, true)
        close = undefined
        panel.remove()
        anchor?.focus()
        resolve([ok, uid])
      }
      function outside(event: PointerEvent): void {
        if (event.target instanceof Node && !panel.contains(event.target) && !anchor?.contains(event.target)) finish(false)
      }
      close = () => finish(false)
      const candidates = uids.map((uid) => {
        const entry = g.DataUtil.proxy.unpackUid('item', uid, 'item')
        const hash = g.UrlUtil.URL_TO_HASH_BUILDER.item(entry)
        const title = presentation.labels.item?.[hash]?.name ?? nativeText(entry.name, presentation)
        const row = button('', () => finish(true, uid), 'p6-picker-row')
        row.dataset.uid = uid
        row.append(element('span', '', title), element('small', 'p6-picker-source', entry.source))
        return { row, term: normalize(`${title} ${entry.name} ${entry.source}`) }
      })
      const draw = () => {
        const term = normalize(search.value.trim())
        const visible = candidates.filter((entry) => entry.term.includes(term))
        list.replaceChildren(...visible.map(({ row }) => row))
        if (!visible.length) list.append(element('p', 'p6-picker-status', '没有匹配的装备'))
      }
      search.addEventListener('input', draw)
      panel.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.stopPropagation(); finish(false) } })
      const tools = element('div', 'p6-equip-picker-tools')
      tools.append(button('清除选择', () => finish(true)), button('取消', () => finish(false)))
      panel.append(tools)
      scope.append(panel)
      document.addEventListener('pointerdown', outside, true)
      draw()
      search.focus()
    })
  }
  return () => {
    close?.()
    document.removeEventListener('click', remember, true)
    proto.pGetUserChoiceFromEquipmentTypes = original
  }
}
