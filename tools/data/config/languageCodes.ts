export const LANGUAGE_DIALECT_CODES: Record<string, { parent: string; zh: string }> = {
  auran: { parent: 'primordial', zh: '气族语' },
  aquan: { parent: 'primordial', zh: '水族语' },
  ignan: { parent: 'primordial', zh: '火族语' },
  terran: { parent: 'primordial', zh: '土族语' },
}

export const PSEUDO_LANGUAGE_CODES: Record<string, string> = {
  anystandard: '任选一种标准语言',
  other: '其他语言',
}
