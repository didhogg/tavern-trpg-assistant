import { addTableBindings } from './tableBindings'
import { addVariantAnchors, type PackLike } from './variantLists'

/** 转换完、分好包之后的收尾步骤（G2.5 P 站）：可选扩展法术锚点、表格绑定。 */
export function postConvert(packs: PackLike[]): void {
  addVariantAnchors(packs)
  addTableBindings(packs)
}
