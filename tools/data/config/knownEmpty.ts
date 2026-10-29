/** 已兑现字段中确实允许为空的路径；按字段路径写明理由。 */
export const KNOWN_EMPTY: Record<string, string> = {
  'subclass.shortName': '来源短名用于 id/owner 匹配，不单独显示；R1 不把空输出当失败',
}
