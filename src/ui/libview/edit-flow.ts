// P5.5 新建 / 编辑条目的流程：选类型 → 选起点 → 编辑器。各起点最后都交给 openEditor（带着起点给的条目，还没存）。
import { markRaw } from 'vue'
import type { EntryType } from '../../library/custom-new'
import type { EditDraft } from '../../library/manage'
import { useModalStore } from '../../stores/modal'
import type { Ent } from './edit-json'
import JsonStartPage from './JsonStartPage.vue'
import NewStartPage from './NewStartPage.vue'
import NewTypePage from './NewTypePage.vue'

/** 一次编辑：改哪一类、在哪一套资料、存进哪个包、从什么开始。 */
export interface EditSession {
  codeSet: string
  prop: string
  /** 作者给这一类的显示名（中文版给中文）。 */
  typeName: string
  /** 存进的包（我的库）。 */
  pack: { id: string; name: string } | null
  /** 起点给的条目（主语言那一边）。 */
  ent: Ent
  target: EditDraft['target']
  /** 接着改的草稿。 */
  draftKey?: string
  /** 详细表单：全部字段展开（作者模板起点）；简易表单只列必填，其余折起来。 */
  detailed?: boolean
  /** 改已有的条目：作者编号（换掉这一条）。 */
  replaceHash?: string
}

/** 包里 [新建条目]：选类型（弹窗里前进一页）。 */
export function openNewEntry(codeSet: string, pack: { id: string; name: string }): void {
  useModalStore().push({ key: `new:${pack.id}`, title: '新建条目：选类型', component: markRaw(NewTypePage), variant: 'sheet', props: { codeSet, pack } })
}

export function openStart(codeSet: string, pack: { id: string; name: string } | null, type: EntryType): void {
  useModalStore().push({ key: `start:${type.prop}`, title: `新建${type.name}：从哪开始`, component: markRaw(NewStartPage), variant: 'sheet', props: { codeSet, pack, type } })
}

/**
 * 进编辑器。表单编辑器在第 4 批接上；在那之前先进 JSON 页（u7-8c 同一个代码编辑框），内容已经按起点填好。
 */
export function openEditor(s: EditSession): void {
  // 新条目存进选的包：来源由保存时按包写（起点给的来源是原书 / 转换器的，留着会和原件同编号）
  if (s.target.kind === 'new' && 'source' in s.ent) { const { source: _drop, ...rest } = s.ent; s = { ...s, ent: rest } }
  useModalStore().push({ key: `edit:${s.prop}:${Date.now()}`, title: `编辑${s.typeName}`, component: markRaw(JsonStartPage), variant: 'sheet', props: { session: s } })
}
