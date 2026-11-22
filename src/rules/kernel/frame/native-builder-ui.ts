// 仅适配锁定的完整建卡器。作者的控件实例、选择反应、表单和完成流程保持同一份。
/* eslint-disable @typescript-eslint/no-explicit-any -- 私人完整版未提供类型声明。 */
import { nativeStepStatus } from './native-builder-review'
import { generatedText } from './system-text'

export interface NativeBuilderAuthor {
  ActorCharactermancer: any
  ComponentUiUtil: any
  Charactermancer_Util: any
}
export type NativePickLabels = Record<string, Record<string, string>>

const steps = [
  ['Origin (Species)', '种族'],
  ['Origin (Background)', '背景'],
  ['Class', '职业'],
  ['Origin (Other)', '其他出身'],
  ['Abilities', '属性值'],
  ['Starting Equipment', '起始装备'],
  ['Equipment Shop', '装备商店'],
  ['Spells', '法术'],
  ['Feats', '专长'],
] as const
const categoryNames: Record<string, string> = { race: '种族', background: '背景', class: '职业', subclass: '子职业' }

interface NativeTab { name: string; btnTab: HTMLElement; wrpTab: HTMLElement }
interface Entry { name: string; source: string }
interface Candidate extends Entry { value: number; display: string }
interface PickerRoute { category: string; entry(value: number): Entry | undefined }
interface Picker {
  anchor: HTMLElement
  element: HTMLElement
  category: string
  chosen(): Candidate | undefined
  mount(into: HTMLElement): void
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

function button(text: string, action: () => void, className = 'p6-builder-btn'): HTMLButtonElement {
  const node = element('button', className, text)
  node.type = 'button'
  node.addEventListener('click', action)
  return node
}

function candidate(route: PickerRoute, value: number, labels: NativePickLabels): Candidate | undefined {
  const entry = route.entry(value)
  if (!entry?.name || !entry.source) return
  const urls = (globalThis as any).UrlUtil
  const key = urls.URL_TO_HASH_BUILDER[route.category]?.(entry)
  const display = labels[route.category]?.[key]
  return display ? { value, name: entry.name, source: entry.source, display } : undefined
}

/** 复用作者列表已筛过的候选和实际选中动作。左栏搜索同时保留中文名、原名与作者来源。 */
function createPicker(author: any, anchor: HTMLElement, route: PickerRoute, labels: NativePickLabels): Picker {
  const title = categoryNames[route.category]
  const section = element('section', 'p6-picker')
  const heading = element('h3', 'p6-picker-title', title)
  const search = element('input', 'p6-picker-search')
  search.type = 'search'
  search.placeholder = `搜索${title}`
  search.setAttribute('aria-label', search.placeholder)
  const list = element('div', 'p6-picker-list')
  const status = element('p', 'p6-picker-status')
  status.setAttribute('aria-live', 'polite')
  section.append(heading, search, list, status)
  let rows = new Map<number, HTMLButtonElement>()
  const chosen = () => author.getSelected() == null ? undefined : candidate(route, author.getSelected(), labels)
  const change = () => {
    const value = author.getSelected()
    for (const [id, row] of rows) row.setAttribute('aria-pressed', String(value === id))
  }
  const draw = () => {
    const term = search.value.trim().normalize('NFKC').toLocaleLowerCase()
    const choices: Candidate[] = author._rdState.getAvailableOptionMetas()
      .flatMap(({ value }: { value: number | null }) => value == null ? [] : candidate(route, value, labels) ?? [])
    const matches = choices.filter((row) => `${row.display} ${row.name} ${row.source}`.normalize('NFKC').toLocaleLowerCase().includes(term))
    rows = new Map(matches.map((row) => {
      const entry = button('', () => {
        if (!author._state.isDisabled) author._addToSelection(row.value)
      }, 'p6-picker-row')
      entry.dataset.source = row.source
      entry.disabled = !!author._state.isDisabled
      entry.append(element('span', 'p6-picker-name', row.display), element('small', 'p6-picker-source', row.source))
      return [row.value, entry]
    }))
    list.replaceChildren(...rows.values())
    change()
    status.textContent = matches.length ? `${matches.length} 项` : term ? '没找到匹配的资料' : '当前资料源没有与战役库匹配的选项'
  }
  search.addEventListener('input', draw)
  author.addHookSelected(change)
  for (const prop of ['values', 'pulse_fnFilter', 'isDisabled']) author._addHookBase(prop, draw)
  return {
    element: section, anchor, category: route.category, chosen,
    mount(into) { into.append(section); anchor.style.setProperty('display', 'none', 'important'); draw() },
  }
}

/** 职业、子职、种族和背景的条目选择都经过 getSelSearchable。 */
function capturePickers(bundle: NativeBuilderAuthor, labels: NativePickLabels, add: (picker: Picker) => void): () => void {
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

function makeStep(tab: NativeTab, label: string) {
  const section = tab.wrpTab
  section.classList.remove('ve-flex-col')
  const content = element('div', 'p6-builder-panel')
  const heading = element('h2', 'p6-builder-selection')
  heading.hidden = true
  content.append(heading)
  content.append(...section.childNodes)
  section.append(content)
  section.classList.add('p6-builder-step')
  if (label === '法术') section.classList.add('p6-builder-spells')
  const rail = element('aside', 'p6-builder-rail')
  const tools = element('div', 'p6-builder-rail-tools')
  const goToDetails = button('查看选择与资料', () => section.classList.add('p6-builder-show-panel'))
  tools.append(goToDetails)
  const backToList = button('返回候选列表', () => section.classList.remove('p6-builder-show-panel'))
  backToList.classList.add('p6-builder-back-to-list')
  section.prepend(backToList)
  return { label, tab, content, rail, tools, heading }
}

function renderWizard(model: any, target: HTMLElement, pickers: Picker[], save: () => Promise<void>): () => void {
  const tabs = model._tabs as NativeTab[]
  const layout = steps.map(([name, label]) => {
    const tab = tabs.find((it) => it.name === name || it.btnTab.textContent?.trim() === name)
    if (!tab) throw Error(`作者建卡缺少步骤：${label}`)
    return makeStep(tab, label)
  })
  const authorNav = tabs[0].btnTab.parentElement!
  const authorFooter = target.lastElementChild as HTMLElement
  authorNav.hidden = true
  authorFooter.hidden = true
  if (authorFooter.previousElementSibling instanceof HTMLHRElement) authorFooter.previousElementSibling.hidden = true
  target.classList.add('p6-builder')
  const nav = element('nav', 'p6-builder-nav')
  nav.setAttribute('aria-label', '建卡步骤')
  target.prepend(nav)
  const review = element('section', 'p6-builder-review')
  target.append(review)
  const footer = element('div', 'p6-builder-footer')
  const feedback = element('p', 'p6-builder-feedback')
  feedback.setAttribute('aria-live', 'polite')
  footer.append(feedback)
  target.append(footer)
  let active = 0
  let busy = false
  const next = button('下一步', () => show(active + 1), 'p6-builder-btn p6-builder-primary')
  const back = button('上一步', () => show(active - 1))
  const finish = button('创建人物', () => { void complete() }, 'p6-builder-btn p6-builder-primary')
  footer.append(back, next, finish)
  const count = layout.length
  const navButtons = [...layout.map((step) => step.label), '检查后创建'].map((label, index) => button(label, () => show(index), 'p6-builder-tab'))
  nav.append(...navButtons)

  function show(index: number): void {
    if (index < 0 || index > count || busy) return
    active = index
    feedback.textContent = ''
    navButtons.forEach((node, i) => {
      if (i === index) node.setAttribute('aria-current', 'step')
      else node.removeAttribute('aria-current')
    })
    for (const [i, step] of layout.entries()) {
      step.tab.wrpTab.classList.toggle('p6-builder-inactive', i !== index)
      if (i === index) step.tab.wrpTab.classList.remove('p6-builder-show-panel')
    }
    review.hidden = index !== count
    next.hidden = index === count
    back.disabled = index === 0
    finish.hidden = index !== count
    if (index < count) model.activeTab_ = layout[index].tab
    else drawReview()
  }

  function drawReview(): void {
    const title = element('h2', '', '检查后创建')
    const help = element('p', '', '核对人物的选择。点击任一步可以返回修改。')
    const status = nativeStepStatus(model)
    const rows = layout.map((step, i) => {
      const relevant = pickers.filter((picker) => step.content.contains(picker.anchor))
      const names = relevant.flatMap((picker) => picker.chosen()?.display ?? [])
      const info = status.get(step.label) ?? (relevant.length && !names.length ? { text: '未选择' } : undefined)
      const caption = [step.label, names.join(' / '), info?.text].filter(Boolean).join(' · ')
      return button(caption, () => show(i))
    })
    review.replaceChildren(title, help, ...rows)
  }

  async function complete(): Promise<void> {
    if (busy) return
    const status = nativeStepStatus(model)
    const pending = layout.map(({ label }) => ({ label, status: status.get(label) }))
      .find((step) => step.status?.pending)
    if (pending) {
      show(layout.findIndex((step) => step.label === pending.label))
      feedback.textContent = pending.status?.text ?? ''
      return
    }
    busy = true
    finish.disabled = true
    try { await save() } catch (error) {
      feedback.textContent = error instanceof Error ? error.message : '作者建卡失败'
    } finally {
      busy = false
      finish.disabled = false
    }
  }

  function mountPickers() {
    for (const step of layout) {
      const inside = pickers.filter((picker) => step.content.contains(picker.anchor))
      for (const stale of [...step.rail.children]) {
        if (stale !== step.tools && !inside.some((picker) => picker.element === stale)) stale.remove()
      }
      if (inside.length && !step.rail.isConnected) {
        step.tab.wrpTab.classList.add('p6-builder-split')
        step.tab.wrpTab.prepend(step.rail)
      }
      for (const picker of inside) if (!picker.element.isConnected) picker.mount(step.rail)
      if (inside.length && step.rail.lastElementChild !== step.tools) step.rail.append(step.tools)
      const selected = inside.flatMap((picker) => picker.chosen()?.display ?? [])
      const title = selected.length ? selected.join(' · ') : inside.length ? `从列表选择${step.label}` : ''
      if (step.heading.textContent !== title) step.heading.textContent = title
      step.heading.hidden = !title
    }
    for (let i = pickers.length - 1; i >= 0; i--) if (!pickers[i].anchor.isConnected) pickers.splice(i, 1)
  }
  // 仅换有明确语言键的显示文字。显式 value 仍由作者使用。
  for (const option of target.querySelectorAll<HTMLOptionElement>('option[value]')) {
    const text = option.textContent?.trim()
    if (!text) continue
    const key = generatedText(text)
    const i18n = (globalThis as any).game.i18n
    if (key.$t === 'system' && i18n.has(key.key)) option.textContent = i18n.localize(key.key)
  }
  const observer = new MutationObserver(mountPickers)
  for (const step of layout) observer.observe(step.content, { childList: true, subtree: true })
  mountPickers()
  show(0)
  return () => observer.disconnect()
}

/** 先让作者创建完整窗口，再接它的页面与原有控件。结束只认作者最终写入成功的回调。 */
export function installNativeBuilderUi(author: NativeBuilderAuthor, labels: NativePickLabels | undefined) {
  const proto = author.ActorCharactermancer.Component.prototype
  const render = proto._pRender
  const finish = proto._pHandleSaveClick_postSave
  let completed = false
  let error: unknown
  let failed = false
  let cleanup: (() => void) | undefined
  const pickers: Picker[] = []
  const clear = labels ? capturePickers(author, labels, (picker) => pickers.push(picker)) : undefined
  proto._pHandleSaveClick_postSave = async function (...args: any[]) {
    const result = await finish.apply(this, args)
    completed = true
    return result
  }
  const fail = proto._pHandleSaveClick_getClosure_handleFailure
  proto._pHandleSaveClick_getClosure_handleFailure = function (...args: any[]) {
    failed = true
    return fail.apply(this, args)
  }
  if (labels) {
    proto._pRender = async function (target: HTMLElement) {
      await render.call(this, target)
      try {
        cleanup?.()
        cleanup = renderWizard(this, target, pickers, async () => {
          await this._pHandleSaveClick()
          if (failed) throw Error('作者未完成建卡，请关掉本次草稿重试。')
        })
      } catch (cause) {
        error = cause
        console.error('完整建卡器界面加载失败', cause)
        const alert = element('p', 'p6-builder-feedback', '无法加载分步建卡，请关闭草稿后重试。')
        alert.setAttribute('role', 'alert')
        target.prepend(alert)
      }
    }
  }
  return {
    completed: () => completed && !failed,
    error: () => error ?? (failed ? new Error('作者中断了建卡，草稿未存入战役。') : undefined),
    close() {
      cleanup?.()
      clear?.()
      proto._pRender = render
      proto._pHandleSaveClick_postSave = finish
      proto._pHandleSaveClick_getClosure_handleFailure = fail
    },
  }
}
