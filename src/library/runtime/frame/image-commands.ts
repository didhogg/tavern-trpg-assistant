// 小窗里：怪物、物件、载具的头像（token）图片路径（P5 B-03）。头像路径怎么拼（用不用 tokenUrl / token / tokenHref、名字怎么转成文件名）
// 是作者的规则（Renderer.generic.getTokenUrl），这里直接调用作者各类的 getTokenUrl，不抄规则。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'
import { stripImageRoot } from '../../images'

/** 作者里有 getTokenUrl 的类别：类别名 → 作者的类（render.js：monster、object、vehicle 各一个）。 */
const TOKEN_CLASSES: Record<string, string> = { monster: 'monster', object: 'object', vehicle: 'vehicle' }

/** 这个条目有没有头像、路径（相对图片根）。没有头像、类别没有头像规则返回 null。 */
export async function tokenPath(prop: string, ent: any): Promise<string | null> {
  await init()
  const cls = TOKEN_CLASSES[prop]
  if (!cls || !A.Renderer[cls]?.getTokenUrl) return null
  if (!A.Renderer.generic.hasToken(ent)) return null
  const url: string | null = A.Renderer[cls].getTokenUrl(ent)
  return url ? (/^https?:/.test(url) ? url : stripImageRoot(url)) : null
}
