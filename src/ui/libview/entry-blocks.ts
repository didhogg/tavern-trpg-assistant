// 正文编辑（P5.5 §16.7 第 2 条）共用：表单所在的资料集（中文 / 英文，转换要用对应的作者程序）、新加一段用的 Markdown 起稿。
// 起稿只是给人看的示例文字，结构由作者转换器（custom.markdownBlocks）生成，不在这里写正文结构。
import type { ComputedRef, InjectionKey, Ref } from 'vue'

export const CODESET_KEY: InjectionKey<Ref<string> | ComputedRef<string>> = Symbol('trpg-entry-codeset')

export const NEW_BLOCKS: Array<{ key: string; label: string; icon: string; md: string }> = [
  { key: 'heading', label: '小标题段', icon: 'plus', md: '#### 小标题\n\n这里写这一段的内容。' },
  { key: 'list', label: '列表', icon: 'list-bullets', md: '- 第一项\n- 第二项' },
  { key: 'table', label: '表格', icon: 'table', md: '| d6 | 结果 |\n|---|---|\n| 1 | 第一种 |\n| 2 | 第二种 |' },
]
