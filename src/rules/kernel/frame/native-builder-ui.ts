// 仅适配锁定的完整建卡器。作者的控件实例、选择反应、表单和完成流程保持同一份。
/* eslint-disable @typescript-eslint/no-explicit-any -- 私人完整版未提供类型声明。 */
import { nativeStepStatus } from './native-builder-review'
import { bindAuthorControls, decorateAuthorControls, mountAbilityModes, mountLevelControls } from './native-builder-controls'
import { capturePickers, categoryNames, type Picker } from './native-builder-pickers'
import { button, element } from './native-builder-elements'
import type { NativeCardPreview, NativePresentation } from '../native-presentation'
import { request } from './request'
import { bindEquipmentPicker } from './native-equipment-picker'

export interface NativeBuilderAuthor {
  ActorCharactermancer: any
  ComponentUiUtil: any
  Charactermancer_Util: any
  Charactermancer_Spell_Level: any
  Charactermancer_AvailableEquipmentInfo: any
}

const pages = [
  { name: 'Origin (Species)', label: '种族', prop: 'race' },
  { name: 'Origin (Background)', label: '背景', prop: 'background' },
  { name: 'Class', label: '职业', prop: 'class' },
  { name: 'Class', label: '子职', prop: 'subclass', optional: 'subclass' },
  { name: 'Origin (Other)', label: '其他出身', optional: 'controls' },
  { name: 'Feats', label: '专长' },
  { name: 'Abilities', label: '属性值' },
  { name: 'Starting Equipment', label: '装备', shop: 'Equipment Shop' },
  { name: 'Spells', label: '法术', optional: 'spells' },
]
type Page = typeof pages[number]
interface NativeTab { name: string; btnTab: HTMLElement; wrpTab: HTMLElement }

function makeStep(tab: NativeTab) {
  const section = tab.wrpTab
  section.classList.remove('ve-flex-col')
  section.classList.add('p6-builder-step')
  const rail = element('aside', 'p6-builder-rail')
  rail.hidden = true
  const panel = element('div', 'p6-builder-panel')
  const heading = element('div', 'p6-builder-selection p6-builder-ui')
  const title = element('h2', 'p6-builder-selection-title')
  const form = element('div', 'p6-native-body')
  const brief = element('p', 'p6-builder-brief p6-builder-ui')
  const source = element('small', 'p6-picker-source')
  let picker: Picker | undefined
  const action = button('选它', () => picker?.toggle(), 'p6-builder-btn p6-builder-primary')
  const open = button('看资料卡', () => {
    const row = picker?.preview()
    if (!picker || !row) return
    void request({ op: 'build-card', prop: picker.category, hash: row.hash, open: true }).catch((error) => {
      brief.textContent = `无法打开资料卡：${String(error)}`
    })
  })
  form.append(...section.childNodes)
  heading.append(title, source, action, open)
  panel.append(heading, form, brief)
  section.append(rail, panel)
  return { tab, rail, form, heading, title, brief, source, action, open, focus: (card?: Picker) => { picker = card } }
}
type Step = ReturnType<typeof makeStep>

function usePreview(step: Step, card: Picker | undefined): void {
  const { heading, title, brief, form, source, action, open } = step
  step.focus(card)
  const preview = card?.preview()
  const chosen = card?.chosen()
  const isChosen = preview && chosen?.value === preview.value
  const label = card && categoryNames[card.category]
  heading.hidden = !card
  form.hidden = !!card && !isChosen
  brief.hidden = !card
  title.textContent = preview?.label.name ?? (card ? `选择${label}` : '')
  source.textContent = preview?.source ?? ''
  action.hidden = !preview
  open.hidden = !preview
  if (!preview || !card) {
    delete brief.dataset.entry
    brief.textContent = card ? '请从左栏选择一条资料。' : ''
    return
  }
  action.textContent = isChosen ? '取消选它' : '选它'
  action.disabled = card.disabled()
  const key = `${card.category}|${preview.hash}`
  if (brief.dataset.entry === key) return
  brief.dataset.entry = key
  brief.textContent = '正在读取资料…'
  void request({ op: 'build-card', prop: card.category, hash: preview.hash, open: false })
    .then((value) => {
      if (brief.dataset.entry !== key) return
      const data = value as NativeCardPreview | null
      brief.textContent = data?.text ? `${data.chinese ? '' : '仅有英文资料 · '}${data.text}` : '点击「看资料卡」查看详情。'
    })
    .catch(() => { if (brief.dataset.entry === key) brief.textContent = '预览读取失败，可打开资料卡。' })
}

function renderWizard(model: any, target: HTMLElement, pickers: Picker[], presentation: NativePresentation, save: () => Promise<void>): () => void {
  const tabs = model._tabs as NativeTab[]
  const layout = new Map(tabs.map((tab) => [tab.name, makeStep(tab)]))
  // 每个作者页面都在导航中。已归入职业或装备的子页共用相同的作者实例。
  const registered = new Set(pages.flatMap((page) => page.shop ? [page.name, page.shop] : [page.name]))
  const order = [...pages, ...tabs.filter((tab) => !registered.has(tab.name)).map((tab): Page => ({ name: tab.name, label: tab.btnTab.textContent?.trim() || '作者选项' }))]
  const authorNav = tabs[0].btnTab.parentElement!
  const authorFooter = target.lastElementChild as HTMLElement
  authorNav.hidden = true
  authorFooter.hidden = true
  if (authorFooter.previousElementSibling instanceof HTMLHRElement) authorFooter.previousElementSibling.hidden = true
  target.classList.add('p6-builder')
  const nav = element('nav', 'p6-builder-nav p6-builder-ui')
  nav.setAttribute('aria-label', '建卡步骤')
  target.prepend(nav)
  const review = element('section', 'p6-builder-review p6-builder-ui')
  target.append(review)
  const tabsInside = element('div', 'p6-builder-switch p6-builder-ui')
  nav.after(tabsInside)
  const spellSummary = element('span', 'p6-builder-spell-status')
  const footer = element('div', 'p6-builder-footer p6-builder-ui')
  const feedback = element('p', 'p6-builder-feedback')
  feedback.setAttribute('aria-live', 'polite')
  const hint = element('small', 'p6-builder-hint', '关掉窗口会丢掉这次选择')
  footer.append(hint, feedback)
  target.append(footer)
  let active: Page | null = order[0]
  let shopOpen = false
  let busy = false
  let pendingRefresh = 0
  const focused = new Map<string, Picker>()
  const next = button('下一步', () => move(1), 'p6-builder-btn p6-builder-primary')
  const back = button('上一步', () => move(-1))
  const name = String(model._actor?.name ?? '')
  const finish = button(name ? `创建「${name}」` : '创建人物', () => { void complete() }, 'p6-builder-btn p6-builder-primary')
  footer.append(back, next, finish)
  const navButtons = new Map<Page | null, HTMLButtonElement>([...order, null].map((page) => {
    const node = button('', () => show(page), 'p6-builder-tab')
    node.append(element('i'), element('span', '', page?.label ?? '完成'))
    return [page, node]
  }))
  nav.append(element('span', 'p6-builder-tab p6-builder-past', '✓ 名字'), ...navButtons.values())

  function available(page: Page): boolean {
    const step = layout.get(page.name)
    if (!step) return false
    switch (page.optional) {
      case 'subclass': return pickers.some((picker) => picker.category === 'subclass' && !!picker.preview())
      case 'spells':
        return model.compSpell.compsSpellSpells.some(Boolean)
          || !!step.form.querySelector('.manc__list-row, [name="btn-learn-cantrip"], [name="btn-prepare"]')
      case 'controls':
        return [...step.form.querySelectorAll('button,input,select')].some((el) => !el.closest('.ve-hidden,[hidden]'))
      default: return true
    }
  }

  function move(direction: number): void {
    const sequence = [...order.filter(available), null]
    const at = sequence.indexOf(active)
    const page = sequence[at + direction]
    if (page !== undefined) show(page)
  }

  function statusLabel(page: Page): string {
    return page.label === '装备' ? '起始装备' : page.label
  }

  function show(page: Page | null): void {
    if (busy || (page && !available(page))) return
    active = page
    shopOpen = false
    feedback.textContent = ''
    tabsInside.replaceChildren()
    tabsInside.hidden = !page?.shop && page?.label !== '法术'
    if (page?.shop) {
      const starting = button('起始装备', () => { shopOpen = false; showBody() })
      const shop = button('装备商店', () => { shopOpen = true; showBody() })
      tabsInside.append(starting, shop)
    }
    if (page?.label === '法术') tabsInside.append(spellSummary)
    showBody()
    const current = navButtons.get(page)
    if (current && current.offsetLeft + current.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = current.offsetLeft
    else if (current && current.offsetLeft < nav.scrollLeft) nav.scrollLeft = current.offsetLeft
  }

  function showBody(): void {
    const name = active && (shopOpen ? active.shop : active.name)
    const selected = name ? layout.get(name) : undefined
    for (const candidate of layout.values()) candidate.tab.wrpTab.classList.toggle('p6-builder-inactive', candidate !== selected)
    if (selected && model.activeTab_ !== selected.tab) model.activeTab_ = selected.tab
    review.hidden = !!active
    next.hidden = !active
    finish.hidden = !!active
    back.disabled = active === order[0]
    for (const [i, control] of [...tabsInside.children].entries()) control.setAttribute('aria-pressed', String(!!i === shopOpen))
    refresh()
  }

  function drawReview(): void {
    const status = nativeStepStatus(model)
    const summary = element('dl', 'p6-builder-summary')
    const required = element('div', 'p6-builder-todo')
    const optional = element('div', 'p6-builder-todo')
    for (const page of order.filter(available)) {
      const info = status.get(statusLabel(page))
      const names = pickers.filter((picker) => picker.category === page.prop).flatMap((picker) => picker.chosen()?.label.name ?? [])
      if (names.length || info?.text) {
        summary.append(element('dt', '', page.label), element('dd', '', [...names, info?.text].filter(Boolean).join(' · ')))
      }
      const pending = info?.pending || (page.prop && !names.length)
      if (pending || info?.text.includes('可继续选择')) {
        const row = element('div', 'p6-builder-todo-row')
        row.append(element('span', '', pending ? info?.text ?? `还没选${page.label}` : info?.text), button('去填', () => show(page)))
        const section = info?.pending ? required : optional
        section.append(row)
      }
      for (const group of choiceGroups(page)) {
        if (Number(group.dataset.missing) < 1) continue
        const row = element('div', 'p6-builder-todo-row')
        row.append(element('span', '', `${page.label} · ${group.textContent}`), button('去填', () => show(page)))
        optional.append(row)
      }
    }
    review.replaceChildren(element('h2', '', name || '检查后创建'), summary)
    for (const [section, title] of [[required, '创建前要处理'], [optional, '还可以选择']] as const) {
      if (!section.childElementCount) continue
      section.prepend(element('b', '', `${title}（${section.childElementCount}）`))
      review.append(section)
    }
  }

  function choiceGroups(page: Page): HTMLElement[] {
    if (page.prop === 'subclass') return []
    return [...layout.get(page.name)?.form.querySelectorAll<HTMLElement>('.p6-choice-progress') ?? []]
      .filter((status) => !status.closest('.ve-hidden'))
  }

  async function complete(): Promise<void> {
    if (busy) return
    const status = nativeStepStatus(model)
    const pending = order.filter(available).find((page) => status.get(statusLabel(page))?.pending)
    const shop = status.get('装备商店')
    if (pending || shop?.pending) {
      const page = pending ?? order.find((step) => step.shop)!
      show(page)
      if (!pending && shop?.pending) { shopOpen = true; showBody() }
      feedback.textContent = (pending ? status.get(statusLabel(page))?.text : shop?.text) ?? ''
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

  function refresh(): void {
    mountLevelControls(model)
    for (let i = pickers.length - 1; i >= 0; i--) if (!pickers[i].anchor.isConnected) {
      pickers[i].element.remove()
      pickers.splice(i, 1)
    }
    const status = nativeStepStatus(model)
    let ordinal = 1
    spellSummary.textContent = status.get('法术')?.text ?? '本次可在下方选择法术'
    for (const [page, node] of navButtons) {
      node.hidden = !!page && !available(page)
      if (page === active) node.setAttribute('aria-current', 'step')
      else node.removeAttribute('aria-current')
      const chosen = page && pickers.some((picker) => picker.category === page.prop && picker.chosen())
      const info = page && status.get(statusLabel(page))
      const done = !!(info?.pending === false || (info && !info.pending && !info.text.includes('可继续选择')) || (chosen && !info))
        && !!page && choiceGroups(page).every((group) => group.dataset.done === 'true')
      node.dataset.done = String(done)
      if (!node.hidden) {
        ordinal += 1
        node.firstElementChild!.textContent = done && page !== active ? '✓' : String(ordinal)
      }
    }
    if (!active) { drawReview(); return }
    const step = layout.get(shopOpen ? active.shop! : active.name)
    if (!step) return
    const local = pickers.filter((picker) => step.form.contains(picker.anchor))
    for (const picker of local) {
      if (!picker.element.isConnected) picker.mount(step.rail)
      picker.element.hidden = picker.category !== active.prop
    }
    const matches = local.filter((picker) => picker.category === active!.prop)
    const previous = focused.get(active.prop ?? '')
    const shown = previous && matches.includes(previous) ? previous : matches[0]
    step.rail.hidden = !shown
    step.tab.wrpTab.classList.toggle('p6-builder-split', !!shown)
    step.tab.wrpTab.classList.toggle('p6-builder-spells', active.label === '法术')
    step.tab.wrpTab.classList.toggle('p6-builder-attributes', active.label === '属性值')
    step.tab.wrpTab.classList.toggle('p6-builder-equipment', !!active.shop && !shopOpen)
    usePreview(step, shown)
    decorateAuthorControls(step.form, presentation)
    if (active.label === '属性值') mountAbilityModes(step.form, model, presentation)
  }

  function schedule(): void {
    if (pendingRefresh) return
    pendingRefresh = requestAnimationFrame(() => { pendingRefresh = 0; refresh() })
  }
  function focusPicker(event: Event): void {
    const picker = pickers.find((candidate) => candidate.element === event.target)
    if (picker) focused.set(picker.category, picker)
  }
  const observer = new MutationObserver(schedule)
  for (const step of layout.values()) observer.observe(step.form, { childList: true, subtree: true })
  target.addEventListener('p6-picker-change', schedule)
  target.addEventListener('p6-picker-preview', focusPicker)
  target.addEventListener('p6-choice-change', schedule)
  target.addEventListener('change', schedule)
  target.addEventListener('click', schedule)
  show(active)
  return () => {
    observer.disconnect()
    cancelAnimationFrame(pendingRefresh)
    target.removeEventListener('p6-picker-change', schedule)
    target.removeEventListener('p6-picker-preview', focusPicker)
    target.removeEventListener('p6-choice-change', schedule)
    target.removeEventListener('change', schedule)
    target.removeEventListener('click', schedule)
  }
}

/** 先让作者创建完整窗口，再接它的页面与原有控件。结束只认作者最终写入成功的回调。 */
export function installNativeBuilderUi(author: NativeBuilderAuthor, labels: NativePresentation | undefined) {
  const proto = author.ActorCharactermancer.Component.prototype
  const render = proto._pRender
  const finish = proto._pHandleSaveClick_postSave
  let completed = false
  let error: unknown
  let failed = false
  let cleanup: (() => void) | undefined
  const pickers: Picker[] = []
  const clearControls = labels ? bindAuthorControls(author, labels) : undefined
  const clearEquipment = labels ? bindEquipmentPicker(author.Charactermancer_AvailableEquipmentInfo, labels) : undefined
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
        cleanup = renderWizard(this, target, pickers, labels, async () => {
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
      clearControls?.()
      clearEquipment?.()
      proto._pRender = render
      proto._pHandleSaveClick_postSave = finish
      proto._pHandleSaveClick_getClosure_handleFailure = fail
    },
  }
}
