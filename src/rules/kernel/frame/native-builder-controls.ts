// 0c 只改呈现。多选仍用作者返回的行和校验，等级下拉直接调用作者的等级操作。
/* eslint-disable @typescript-eslint/no-explicit-any -- 私人完整版未提供类型声明。 */
import type { NativePresentation } from '../native-presentation'
import type { NativeBuilderAuthor } from './native-builder-ui'
import { button, element } from './native-builder-elements'
import { generatedText, systemText } from './system-text'

const g = globalThis as any
const normalize = (text: string) => text.trim().toLowerCase()
const strings = new WeakMap<NativePresentation, Map<string, string>>()

export function nativeText(text: string, presentation: NativePresentation): string {
  const keyOfText = normalize(text)
  const exact = Object.hasOwn(presentation.terms, keyOfText) ? presentation.terms[keyOfText] : undefined
  if (exact) return exact
  if (!/[a-zA-Z]/.test(text)) return text
  let cache = strings.get(presentation)
  if (!cache) { cache = new Map(); strings.set(presentation, cache) }
  const existing = cache.get(text)
  if (existing !== undefined) return existing
  for (const { $t, ...key } of [generatedText(text), systemText(text)]) {
    if ($t !== 'system' || !('key' in key) || !g.game.i18n.has(key.key)) continue
    const result = g.game.i18n.localize(key.key)
    if (result !== text) { cache.set(text, result); return result }
  }
  cache.set(text, text)
  return text
}

function showText(text: string, presentation: NativePresentation): string {
  const whole = nativeText(text.trim(), presentation)
  if (whole !== text.trim()) return text.replace(text.trim(), whole)
  const ability = /^\s*\((\w{3})\)\s*$/.exec(text)
  if (ability) {
    const name = g.CONFIG.DND5E.abilities[ability[1].toLowerCase()]?.label
    if (name) return text.replace(ability[1], name)
  }
  // 作者表格有些格子由几条独立的名称组成，逐个用同一个出口取已知译名。
  if (text.includes(', ')) {
    const parts = text.split(', ')
    const labels = parts.map((part) => nativeText(part, presentation))
    if (labels.some((label, i) => label !== parts[i])) return labels.join('，')
  }
  return text
}

/** 作者的 UI 值和标识仍原样。只翻译可见文字和无障碍提示。 */
export function decorateAuthorControls(root: HTMLElement, presentation: NativePresentation): void {
  for (const group of root.querySelectorAll('.p6-choice-group')) {
    const heading = group.previousElementSibling
    if (heading?.classList.contains('ve-mb-1') && /^Choose\b/.test(heading.textContent ?? '')) heading.classList.add('p6-choice-instruction')
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let next: Node | null
  while ((next = walker.nextNode())) {
    const text = next as Text
    if (!text.data.trim() || text.parentElement?.closest('script,style,textarea,.p6-builder-ui')) continue
    const option = text.parentElement?.closest('option')
    const translated = showText(text.data, presentation)
    if (translated === text.data) continue
    if (option && !option.hasAttribute('value')) option.setAttribute('value', option.value)
    text.data = translated
  }
  for (const el of root.querySelectorAll<HTMLElement>('[title],[placeholder],[aria-label]')) {
    for (const attr of ['title', 'placeholder', 'aria-label']) {
      const original = el.getAttribute(attr)
      if (!original) continue
      const translated = showText(original, presentation)
      if (translated !== original) el.setAttribute(attr, translated)
    }
  }
  for (const el of root.querySelectorAll<HTMLButtonElement>('button[name="btn-learn-cantrip"],button[name="btn-learn-spell"],button[name="btn-prepare"]')) {
    const label = el.name === 'btn-prepare' ? '准备' : '学习'
    if (el.textContent !== label) el.textContent = label
    el.setAttribute('aria-pressed', String(el.classList.contains('ve-active')))
  }
}

/** 作者显式返回 rowMetas 让调用方自定样式。使用同一个 checkbox、顺序和份数，保留其限制和回调。 */
export function bindAuthorControls(author: NativeBuilderAuthor, presentation: NativePresentation): () => void {
  const factory = author.ComponentUiUtil
  const multiple = factory.getMetaWrpMultipleChoice
  const spell = author.Charactermancer_Spell_Level.prototype
  const createSpell = spell._getListItem
  factory.getMetaWrpMultipleChoice = function (comp: any, prop: string, opts: any) {
    const meta = multiple.call(this, comp, prop, opts)
    if (opts?.count == null || !meta.rowMetas?.length) return meta
    const status = element('small', 'p6-choice-progress p6-builder-ui')
    status.setAttribute('aria-live', 'polite')
    meta.ele.classList.add('p6-choice-group')
    meta.ele.classList.remove('ve-flex-col')
    for (const row of meta.rowMetas) row.cb.closest('label')?.parentElement?.classList.add('p6-choice-option')
    meta.ele.prepend(status)
    const paint = () => {
      const remaining = opts.count - meta.rowMetas.filter((row: any) => row.cb.checked).length
      status.textContent = remaining > 0 ? `选 ${opts.count} 项 · 还差 ${remaining} 项` : `已选好 · ${opts.count} 项`
      status.dataset.done = String(remaining <= 0)
      status.dataset.missing = String(Math.max(0, remaining))
      if (meta.ele.isConnected && !meta.ele.closest('.application:not(.trpg-main)')) {
        meta.ele.dispatchEvent(new Event('p6-choice-change', { bubbles: true }))
      }
    }
    const cleanup = meta.cleanup
    comp._addHookBase(meta.propPulse, paint)
    meta.cleanup = function (...args: any[]) {
      comp._removeHookBase(meta.propPulse, paint)
      return cleanup.apply(this, args)
    }
    paint()
    return meta
  }
  spell._getListItem = function (entry: any, ...args: any[]) {
    const item = createSpell.call(this, entry, ...args)
    const hash = g.UrlUtil.URL_TO_HASH_BUILDER.spell(entry)
    const label = presentation.labels.spell?.[hash]
    if (label && item?.ele) {
      const name = item.ele.firstElementChild
      if (name) {
        name.textContent = label.name
        name.classList.add('p6-spell-name')
      }
      item.values.alias = [item.values.alias, label.name].filter(Boolean).join(' ')
      item.ele.dataset.p6Spell = hash
    }
    return item
  }
  return () => {
    factory.getMetaWrpMultipleChoice = multiple
    spell._getListItem = createSpell
  }
}

/** 模式按钮使用作者的公开标签页 setter，原生属性控件继续算数。 */
export function mountAbilityModes(root: HTMLElement, model: any, presentation: NativePresentation): void {
  const header = root.querySelector<HTMLElement>('.ve-statgen-shared__wrp-header')
  const select = header?.querySelector('select')
  const statgen = model.compAbility.compStatgen
  if (!header || !select || header.querySelector('.p6-ability-methods')) return
  const methods = element('div', 'p6-ability-methods p6-builder-ui')
  methods.setAttribute('role', 'group')
  methods.setAttribute('aria-label', '怎么定属性')
  const options = [...select.options].slice(1)
  const rows = options.map((option) => {
    const index = Number(option.value)
    const label = nativeText(option.textContent ?? '', presentation)
    const optionButton = button(label, () => { statgen.ixActiveTab = index; paint() })
    optionButton.disabled = option.disabled
    methods.append(optionButton)
    return { index, optionButton }
  })
  function paint(): void {
    for (const { index, optionButton } of rows) optionButton.setAttribute('aria-pressed', String(statgen.ixActiveTab === index))
    const stage = root.closest<HTMLElement>('.p6-builder-attributes')
    if (stage) stage.dataset.mode = statgen.getMode()
  }
  select.style.setProperty('display', 'none', 'important')
  header.replaceChildren(select, element('b', '', '怎么定属性？'), methods)
  paint()
}

const boundLevels = new WeakSet<object>()
export function mountLevelControls(model: any): void {
  for (const comp of model.compClass.compsClassLevelSelect) {
    if (!comp?._isRadio || boundLevels.has(comp)) continue
    const items: any[] = comp._list?.items ?? []
    const group = items[0]?.ele.closest('.ve-min-h-0') as HTMLElement | undefined
    if (!group || !items.length) continue
    boundLevels.add(comp)
    const drop = element('label', 'p6-level p6-builder-ui', '目标等级')
    const select = element('select')
    select.setAttribute('aria-label', '目标等级')
    for (const item of items) {
      const level = item.getId() + 1
      const option = element('option', '', `${level} 级`)
      option.value = String(level)
      option.disabled = item.data.cbSel.disabled
      select.append(option)
    }
    select.value = String(comp.getTargetLevel() ?? '')
    select.addEventListener('change', (event) => {
      const candidate = items.find((item) => item.getId() + 1 === Number(select.value))
      if (candidate && !candidate.data.cbSel.checked) comp._handleSelectClick(candidate, event)
      select.value = String(comp.getTargetLevel() ?? '')
      drop.dispatchEvent(new Event('p6-choice-change', { bubbles: true }))
    })
    drop.append(select)
    const choices = group.closest('.ve-flex-col.ve-w-100.ve-mt-2')
    if (choices) choices.prepend(drop)
    else group.before(drop)
    // 真正的等级值仍由作者原列表持有，保留阶段和事件。
    group.style.setProperty('display', 'none', 'important')
  }
}
