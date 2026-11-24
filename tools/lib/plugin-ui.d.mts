export interface PluginUiRow {
  lang: string
  package: string
  text: string
  translation: string
  from: string
  status: 'final' | 'review'
  seen?: string[]
  candidates?: Array<{ zh: string; from: string }>
  note?: string
}
export interface ApprovedRow {
  lang: string
  package: string
  text: string
  translation: string
}
export const PLUGIN_UI: { lang: 'zh'; package: 'plutonium' }
/** 模板句英文原文的编号（和 upstreamKey 同一个摘要，前缀 UpstreamSource）。 */
export function upstreamSourceKey(text: string): string
export function checkPlaceholders(text: string, translation: string): true
export function pluginUiRows(draft: unknown): PluginUiRow[]
export function pluginUiStats(rows: PluginUiRow[]): { total: number; final: number; review: number; byFrom: Record<string, number> }
export function pluginUiKeyCollisions(flat: Record<string, string>, rows: PluginUiRow[], approved?: Array<{ lang: string; package: string; text: string; translation: string }>): Array<{ key: string; text: string; existing: string; draft: string; from: string }>
export function applyPluginUi(flat: Record<string, string>, rows: PluginUiRow[], approved?: ApprovedRow[]): {
  flat: Record<string, string>
  added: Array<{ key: string; text: string; translation: string; from: string }>
  shared: number
  conflicts: Array<{ key: string; text: string; existing: string; draft: string; from: string }>
  approvedRows: number
}
