// 小窗里：条目正文里的链接标签 {@spell 火球术|PHB} {@creature 地精} {@table 魔法物品表A} … 点了该跳到哪个条目（P5 B-04）。
// 全部转调作者统一的 Renderer.utils.getTagMeta（render.js），所有标签同一个入口；各类标签的默认来源、
// 特殊写法（职业特性、子职业…）都在作者的登记里，这边不抄。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'

export interface TagMeta {
  tag: string
  name: string
  displayText: string
  source: string | null
  /** 作者给的页面（真页面如 spells.html，或作者标的"假页面"如 card）。 */
  page: string
  /** 要找的条目编号（作者算好的，已编码）。 */
  hash: string
  /** 这个页面对应的类别（作者加载器的登记表反查）；一个页面可能对应几个类别（职业页 = 职业 + 子职业）。 */
  props: string[]
  /** 书 / 冒险标签带的章节与小节（{@book 显示|DMG|章|小节}）；hash 只指到这一本。 */
  part?: { chapter: number | null; section: string | null; ixNamedSection?: number | null }
}

/** 按作者加载器登记表（页面或类别名 → 类别）找类别；找不到就是空。 */
function propsOfPage(page: string): string[] {
  const table = A.DataLoader._PROP_TO_HASH_PAGE as Record<string, string>
  const byPage = Object.entries(table).filter(([, pg]) => pg === page).map(([prop]) => prop)
  if (byPage.length) return byPage
  // 作者的"假页面"直接写类别名（card、skill、classfeature…），大小写按登记表对
  return Object.keys(table).filter((prop) => prop.toLowerCase() === page.toLowerCase())
}

/**
 * 作者的渲染器对 {@book} / {@adventure} 单独处理、不走 getTagMeta（render.js 2495–2510）：
 * 用作者的 UidUtil.unpackUidAdventureBook 拆开，编号写法照作者（小写的书编号）。
 */
function bookTagMeta(tag: '@book' | '@adventure', text: string): TagMeta {
  const page = tag === '@book' ? 'book.html' : 'adventure.html'
  const { displayText, id, ixChapter, sectionName, ixNamedSection } = A.UidUtil.unpackUidAdventureBook(text)
  return {
    tag, name: String(displayText ?? id ?? ''), displayText: String(displayText ?? id ?? ''), source: id ?? null,
    page, hash: String(id ?? '').toLowerCase(), props: propsOfPage(page),
    part: { chapter: ixChapter ?? null, section: sectionName ?? null, ixNamedSection: ixNamedSection ?? null },
  }
}

/**
 * 标签 → 条目引用。tag 带不带 @ 都行；作者不认识的标签（骰子标签等）返回 null。
 * 有"悬停页"的标签（职业特性、子职业特性）要的是特性条目本身，用悬停页与悬停编号。
 */
export async function tagMeta(tag: string, text: string): Promise<TagMeta | null> {
  await init()
  const full = tag.startsWith('@') ? tag : `@${tag}`
  if (full === '@book' || full === '@adventure') return bookTagMeta(full, text)
  let meta: any
  try {
    meta = A.Renderer.utils.getTagMeta(full, text)
  } catch {
    return null
  }
  if (!meta) return null
  const page: string = meta.pageHover ?? meta.page
  const hash: string = meta.hashHover ?? meta.hash
  const sourceHover = meta.sourceHover ?? meta.source
  return {
    tag: full,
    name: String(meta.name ?? ''),
    displayText: String(meta.displayText ?? meta.linkText ?? meta.name ?? ''),
    source: sourceHover ?? null,
    page,
    hash,
    props: propsOfPage(page),
  }
}
