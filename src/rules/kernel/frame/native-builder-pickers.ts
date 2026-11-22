// 作者的选择器仍持有值和事件。0c 的列表只决定预览，确认才调用真实作者选择。
/* eslint-disable @typescript-eslint/no-explicit-any -- 私人完整版未提供类型声明。 */
import type { NativeBuilderAuthor } from './native-builder-ui'
import type { NativeLabel, NativePresentation } from '../native-presentation'
import { button, element } from './native-builder-elements'

export const categoryNames: Record<string, string> = { race: '种族', background: '背景', class: '职业', subclass: '子职业' }
interface Entry { name: string; source: string }
export interface Candidate extends Entry {
  value: number
  hash: string
  label: NativeLabel
}
interface PickerRoute { category: string; entry(value: number): Entry | undefined }
export interface Picker {
  anchor: HTMLElement
  element: HTMLElement
  category: string
  chosen(): Candidate | undefined
  preview(): Candidate | undefined
  disabled(): boolean
  toggle(): void
  mount(into: HTMLElement): void
}

function candidate(route: PickerRoute, value: number, presentation: NativePresentation): Candidate | undefined {
  const entry = route.entry(value)
  if (!entry?.name || !entry.source) return
  const urls = (globalThis as any).UrlUtil
  const hash = urls.URL_TO_HASH_BUILDER[route.category]?.(entry)
  const label = presentation.labels[route.category]?.[hash]
  return label ? { value, name: entry.name, source: entry.source, hash, label } : undefined
}

function createPicker(author: any, anchor: HTMLElement, route: PickerRoute, presentation: NativePresentation): Picker {
  const title = categoryNames[route.category]
  const section = element('section', 'p6-picker')
  const search = element('input', 'p6-picker-search')
  search.type = 'search'
  search.placeholder = `搜索${title}`
  search.setAttribute('aria-label', search.placeholder)
  const list = element('div', 'p6-picker-list')
  const status = element('p', 'p6-picker-status')
  status.setAttribute('aria-live', 'polite')
  section.append(search, list, status)
  let rows = new Map<number, HTMLButtonElement>()
  let preview: Candidate | undefined
  const chosen = () => author.getSelected() == null ? undefined : candidate(route, author.getSelected(), presentation)
  const change = () => {
    const selected = author.getSelected()
    for (const [id, row] of rows) {
      row.setAttribute('aria-pressed', String(selected === id))
      row.dataset.preview = String(preview?.value === id)
    }
    section.dispatchEvent(new Event('p6-picker-change', { bubbles: true }))
  }
  const draw = () => {
    const term = search.value.trim().normalize('NFKC').toLocaleLowerCase()
    const choices: Candidate[] = author._rdState.getAvailableOptionMetas()
      .flatMap(({ value }: { value: number | null }) => value == null ? [] : candidate(route, value, presentation) ?? [])
    const matches = choices.filter((row) => `${row.label.name} ${row.name} ${row.source}`.normalize('NFKC').toLocaleLowerCase().includes(term))
    if (!preview || !matches.some((row) => row.value === preview?.value)) {
      const selected = matches.find((row) => row.value === author.getSelected())
      preview = selected ?? matches[0]
    }
    rows = new Map(matches.map((row) => {
      const entry = button('', () => {
        preview = row
        section.dispatchEvent(new Event('p6-picker-preview', { bubbles: true }))
        change()
      }, 'p6-picker-row')
      entry.dataset.source = row.source
      entry.append(element('span', 'p6-picker-name', row.label.name), element('small', 'p6-picker-source', row.source))
      return [row.value, entry]
    }))
    list.replaceChildren(...rows.values())
    change()
    status.textContent = matches.length ? `共 ${matches.length} 条` : term ? '没找到匹配的资料' : '当前没有可选资料'
  }
  search.addEventListener('input', draw)
  author.addHookSelected(change)
  for (const prop of ['values', 'pulse_fnFilter', 'isDisabled']) author._addHookBase(prop, draw)
  return {
    element: section, anchor, category: route.category, chosen,
    preview: () => preview,
    disabled: () => !!author._state.isDisabled,
    toggle() {
      if (!preview || this.disabled()) return
      // 与作者原下拉的选中动作相同，清空用它自己的空值。
      author._addToSelection(chosen()?.value === preview.value ? null : preview.value)
    },
    mount(into) { into.append(section); anchor.style.setProperty('display', 'none', 'important'); draw() },
  }
}

/** 职业、子职、种族和背景的条目选择都经过 getSelSearchable。 */
export function capturePickers(bundle: NativeBuilderAuthor, labels: NativePresentation, add: (picker: Picker) => void): () => void {
  const factory = bundle.ComponentUiUtil
  const util = bundle.Charactermancer_Util
  const get = factory.getSelSearchable
  const getFiltered = util.getFilterSearchMeta
  const dropdown = factory._SearchableDropdownComponent.prototype
  const render = dropdown.render
  let filtered: PickerRoute | undefined
  util.getFilterSearchMeta = function (opts: any) {
    const kind = { race_ixRace: 'race', background_ixBackground: 'background' }[opts.prop as string]
    const previous = filtered
    if (kind) filtered = { category: kind, entry: (value) => opts.data[value] }
    try { return getFiltered.call(this, opts) } finally { filtered = previous }
  }
  factory.getSelSearchable = function (comp: any, prop: string, options: any) {
    let route = filtered
    if (typeof comp.getClass_ === 'function' && /_ixClass$/.test(prop)) {
      route = { category: 'class', entry: (ix) => comp.getClass_({ ix }) }
    }
    if (typeof comp.getSubclass_ === 'function' && /_ixSubclass$/.test(prop)) {
      const cls = comp.getClass_({ propIxClass: prop.replace(/_subclass_ixSubclass$/, '_ixClass') })
      if (cls) route = { category: 'subclass', entry: (ix) => comp.getSubclass_({ cls, ix }) }
    }
    if (!route) return get.call(this, comp, prop, options)
    const pickerRoute = route
    dropdown.render = function () {
      const result = render.call(this)
      add(createPicker(this, result.wrp, pickerRoute, labels))
      return result
    }
    try { return get.call(this, comp, prop, options) } finally { dropdown.render = render }
  }
  return () => { factory.getSelSearchable = get; util.getFilterSearchMeta = getFiltered }
}
