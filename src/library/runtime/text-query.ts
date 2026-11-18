// 显示取字的批量请求协议；描述出处，不定义条目或人物数据。所有业务模块共用显示出口。
export type TextQuery =
  | { source: 'system'; key: string }
  | { source: 'author'; path: string[] }
  | { source: 'value'; key: string; group: string[]; kind?: 'category' }
  | { source: 'proficiency'; key: string; count: number }
  | { source: 'requirement'; raw: unknown }
export type AuthorTextQuery = Exclude<TextQuery, { source: 'system' }>
