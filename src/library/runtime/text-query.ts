// 显示取字的批量请求协议；描述出处，不定义条目或人物数据。所有业务模块共用显示出口。
export type TextQuery =
  | { source: 'system'; key: string }
  | { source: 'author'; path: string[] }
  | { source: 'value'; key: string; group: string[]; kind?: 'category' }
  | { source: 'proficiency'; key: string; count: number }
  | { source: 'requirement'; raw: unknown }
  /** 一段带作者标签的原文（{@recharge 5} 等），交本战役作者渲染器渲染成纯文字。 */
  | { source: 'render'; text: string }
export type AuthorTextQuery = Exclude<TextQuery, { source: 'system' }>
