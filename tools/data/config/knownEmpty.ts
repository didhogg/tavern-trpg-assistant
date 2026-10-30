/** 已兑现字段中确实允许为空的路径；按字段路径写明理由。 */
export const KNOWN_EMPTY: Record<string, string> = {
  "boon.reprintedAs": "boon 的重印目标在收录范围内，但该类型条目要到 R11 才建出，R11 建条目时自动套用 supersededBy 解析",
  "boon.reprintedAs[].tag": "boon 的重印目标在收录范围内，但该类型条目要到 R11 才建出，R11 建条目时自动套用 supersededBy 解析",
  "boon.reprintedAs[].uid": "boon 的重印目标在收录范围内，但该类型条目要到 R11 才建出，R11 建条目时自动套用 supersededBy 解析",
  "cult.reprintedAs": "cult 的重印目标在收录范围内，但该类型条目要到 R11 才建出，R11 建条目时自动套用 supersededBy 解析",
  "cult.reprintedAs[].tag": "cult 的重印目标在收录范围内，但该类型条目要到 R11 才建出，R11 建条目时自动套用 supersededBy 解析",
  "cult.reprintedAs[].uid": "cult 的重印目标在收录范围内，但该类型条目要到 R11 才建出，R11 建条目时自动套用 supersededBy 解析",
  "deck.reprintedAs": "deck 的重印目标在收录范围内，但该类型条目要到 R11 才建出，R11 建条目时自动套用 supersededBy 解析",
  'subclass.shortName': '来源短名用于 id/owner 匹配，不单独显示；R1 不把空输出当失败',
}
