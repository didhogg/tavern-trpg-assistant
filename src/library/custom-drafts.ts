// P5.5 B7 编辑器草稿：编辑器每次停手就存一份，关掉再打开可以接着改。草稿只存在插件管理记录里，不写作者内容，不影响条目本身；
// 保存条目成功后由调用方丢掉草稿。结构照作者构建器的草稿（manage.ts EditDraft）。类别按这套资料集的字段表核对，不写类型名单。
// 草稿和撤销记录一样不进完整备份。
import { formatOfCodeSet } from './formats'
import type { EditDraft, ManageStore } from './manage'
import { refKey } from './scopes'

export type DraftInput = Omit<EditDraft, 'at' | 'm'> & { m?: Partial<EditDraft['m']> }

/** 草稿的键：数据集 | 类别 | 改的是谁（新条目每次新开一份，键里带随机号）。 */
export function draftKey(d: Pick<EditDraft, 'codeSet' | 'prop' | 'target'>): string {
  const who = d.target.kind === 'mine' ? `mine:${d.target.uniqueId}`
    : d.target.kind === 'house' ? `house:${refKey(d.target.ref)}`
      : `new:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  return `${d.codeSet}|${d.prop}|${who}`
}

/** 存草稿；key 不给就按改的是谁生成（新条目每次新开）。返回键。 */
export async function saveDraft(manage: ManageStore, input: DraftInput, key?: string): Promise<string> {
  if (!input.s || typeof input.s !== 'object' || Array.isArray(input.s)) throw new Error('草稿里的条目要是一个 JSON 对象')
  if (!(await formatOfCodeSet(input.codeSet).fields(input.prop))) throw new Error(`这套资料不收这一类条目：${input.prop}`)
  const k = key ?? draftKey(input)
  const was = await manage.draft(k)
  const m: EditDraft['m'] = { isModified: true, isPersisted: false, nameOriginal: was?.m.nameOriginal ?? null, styleHint: was?.m.styleHint ?? null, ...input.m }
  await manage.putDraft(k, { at: Date.now(), codeSet: input.codeSet, prop: input.prop, s: structuredClone(input.s), m, target: input.target })
  return k
}

/** 列出草稿（新的在前）；给数据集就只列这一套的。 */
export async function listDrafts(manage: ManageStore, codeSet?: string): Promise<Array<EditDraft & { key: string }>> {
  return [...(await manage.drafts())].map(([key, d]) => ({ key, ...d })).filter((d) => !codeSet || d.codeSet === codeSet).sort((a, b) => b.at - a.at)
}
