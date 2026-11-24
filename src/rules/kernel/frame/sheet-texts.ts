// 人物页显示文字的出处（小窗这一头，只标来路，不取字；取字在主线唯一出口 kernel/display.ts）：物品 / 特性名按作者编号。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { asData, fromEntry, named, namedOr, type EntryAt, type FrameText } from '../shown'
import { nameText } from './registry-keys'
import { plutoniumBuild } from './plutonium-build'
import { uiText } from './system-text'

const g = globalThis as any

/**
 * 作者导入怪物动作 / 特性 / 传奇动作时记下的编号（flags.plutonium.hash = 名字编号_所属条目编号…）→ 它在英文条目里的位置。
 * 用作者同一套 Renderer.stripTags + UrlUtil.encodeForHash 给条目里每个带名字的对象算编号来对，不比对文字、不认类别名。
 * 传奇动作作者先剥掉末尾的“(Costs N Actions)”再算编号：精确对不上时再试“去掉末尾一个括号 / 句末标点”；
 * 巢穴动作列表项没名字，作者截开头当名字：再试“物品名是这段话的开头”。每一档都只认唯一一个，否则不定位。
 */
function locate(entries: unknown[], hash: string, itemName: string): EntryAt | null {
  const exact: EntryAt[] = []
  const trimmed: EntryAt[] = []
  const opening: EntryAt[] = []
  const id = (text: string): string => String(g.UrlUtil.encodeForHash(text))
  // 没名字的一段话（巢穴动作）：作者只从“列表”的列表项里取（getListItems），截开头几个词当名字、末尾加“...”→ 用物品名对列表项的开头
  const head = itemName.replace(/\s*\.\.\.$/, '').trim().toLowerCase()
  const walk = (node: any, entry: number, path: Array<string | number>, inList = false): void => {
    if (Array.isArray(node)) { node.forEach((x, i) => walk(x, entry, [...path, i], inList)); return }
    if (typeof node === 'string') {
      if (inList && head.length >= 8 && String(g.Renderer.stripTags(node)).trim().toLowerCase().startsWith(head)) opening.push({ entry, path })
      return
    }
    if (!node || typeof node !== 'object') return
    if (path.length && typeof node.name === 'string') {
      const plain = String(g.Renderer.stripTags(node.name))
      // 作者改名去掉的末尾：一个括号（每日次数、消耗动作）或句末标点
      const cut = plain.replace(/\s*\([^()]*\)\s*$/, '').replace(/\s*[.?!]$/, '')
      // 作者导入背景特性时去掉条目名前的「Feature:」（作者 UtilEntityBackgroundFeature 的别名规则）
      const alias = plutoniumBuild?.UtilEntityBackgroundFeature?._getEntityAliases_name_noFeature?.({ name: plain }) ?? null
      if (hash.startsWith(`${id(plain)}_`)) exact.push({ entry, path: [...path, 'name'] })
      else if (cut !== plain && hash.startsWith(`${id(cut)}_`)) trimmed.push({ entry, path: [...path, 'name'] })
      else if (alias && hash.startsWith(`${id(alias)}_`)) trimmed.push({ entry, path: [...path, 'name'] })
    }
    for (const [k, v] of Object.entries(node)) if (v && typeof v === 'object') walk(v, entry, [...path, k], node.type === 'list' && k === 'items')
  }
  entries.forEach((e, i) => walk(e, i, []))
  if (exact.length) return exact.length === 1 ? exact[0] : null
  if (trimmed.length) return trimmed.length === 1 ? trimmed[0] : null
  return opening.length === 1 ? opening[0] : null
}

/**
 * 物品 / 特性名：带作者编号的按编号取本战役库名（并交编号给出口配库条目）；
 * 怪物动作等（作者只记了名字编号）按编号在条目里定位，取本战役语言版同一处；都没有就按原文位置找（zhAt）。
 */
export function itemText(i: any, entries: unknown[]): { name: FrameText; author?: { propDroppable: string; source?: string; hash: string } } {
  const raw = i.flags?.plutonium
  // 作者「导入到人物」时跟着条目来的物品（起始装备等）只记页面 + 来源 + 编号、没记类别：真页面（*.html）按作者自己的页面 → 类别登记补上
  //（物品页的第一个类别就是作者给物品记的 item）；raceFeature 这类不是真页面的，照旧按编号在条目里定位
  const derived = raw && !raw.propDroppable && typeof raw.page === 'string' && raw.page.endsWith('.html') ? g.UrlUtil?.PAGE_TO_PROPS?.[raw.page]?.[0] : null
  const f = derived ? { ...raw, propDroppable: derived } : raw
  // 玩家改过名（我们界面改名 / 复制副本时记下 flags.tavern-trpg.named）：名字原样显示玩家起的，不再按作者编号取原名；作者编号照留（还能看库里资料）
  const renamed = i.flags?.['tavern-trpg']?.named === true
  if (f?.propDroppable && typeof f.hash === 'string') {
    const author = { propDroppable: f.propDroppable, ...(f.source ? { source: f.source } : {}), hash: f.hash }
    if (renamed) return { name: asData(String(i.name ?? '')), author }
    // 跟着条目来的物品（类别是补的）：名字可能是条目里写的显示名（Prayer Book → 底层物品 Book）或杂项文字，先按名字在条目原文里找，找不到再按编号取库名
    // 都取不到（作者自己生成、库里没有的，如徒手打击）：dnd5e 语言包里同样英文原文的键，再按作者程序字串编号（uiText）
    return { name: derived ? fromEntry(i.name, namedOr(i.name, author, nameText(String(i.name ?? ''), null) ?? uiText(String(i.name ?? '')))) : named(i.name, author), author }
  }
  if (renamed) return { name: asData(String(i.name ?? '')) }
  const at = typeof f?.hash === 'string' ? locate(entries, f.hash, String(i.name ?? '')) : null
  if (at) return { name: fromEntry(i.name, undefined, at) }
  // 没有作者编号、也不在条目里的（作者 / dnd5e 自己加的东西，如“徒手打击”）：dnd5e 语言包里有同样英文原文的键就按它取
  // 作者程序自己起的名字（作者程序字串编号，uiText）也是这一档
  return { name: nameText(String(i.name ?? ''), null) ?? fromEntry(i.name, uiText(String(i.name ?? ''))) }
}
