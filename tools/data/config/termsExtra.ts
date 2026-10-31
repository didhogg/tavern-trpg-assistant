/** 术语词典的手写补充（R14）：英文（小写）→ 中文；每项写依据。优先级最高。 */
export const TERMS_EXTRA = new Map<string, { zh: string; basis: string }>([
  ['condition', { zh: '状态', basis: '5etools 中文版术语：condition = 状态（conditionsdiseases 页面与 Parser.CONTITION_TO_EN 的说明文字）' }],
  ['ki', { zh: '气', basis: '5etools 中文版与规格 §5.9：武僧 Ki 的中文名为「气」' }],
])
