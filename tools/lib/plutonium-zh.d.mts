import type { ApprovedRow, PluginUiRow } from './plugin-ui.mjs'

export function nativeTranslations(draft: PluginUiRow[], approved: ApprovedRow[]): Map<string, string>
export function localizePlutonium(sourceText: string, translations: ReadonlyMap<string, string>): {
  bundle: string
  rows: Array<{ text: string; translated: number; retained: number }>
  edits: number
}
