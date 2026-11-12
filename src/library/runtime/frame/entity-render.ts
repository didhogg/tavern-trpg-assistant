// 小窗里：整条条目按作者自己的整页渲染画出来（P5-5 §11.5，驾驶员 2026-11-12 批准）。
// 每类怎么画由作者的 Renderer.hover.getFnRenderCompact(页面) 决定（作者按页面登记，含怪物的传奇动作 / 巢穴 / 区域效应等），
// 插件不再手写「这一类由哪些字段组成」。链接、表格由 author-markup 的钩子保留。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'
import { collectAuthorLinks, type AuthorMarkup } from './author-markup'

/**
 * 作者各列表页打开时先做的准备（照作者页面脚本：bestiary.js 第 341–346、608 行预载传奇组；
 * filter-items.js 第 605 行装物品类型 / 属性表）。不做的话，怪物画不出巢穴动作 / 区域效应，物品报「找不到物品类型」。
 * 按作者页面名登记：加一页 = 加一行。
 */
const PAGE_PREPARE: Record<string, () => Promise<unknown>> = {
  'bestiary.html': () => Promise.all([A.DataUtil.monster.pPreloadLegendaryGroupsSite(), A.DataUtil.monster.pUpdatePreloadLegendaryGroupsBrew()]),
  'items.html': () => A.Renderer.item.pPopulatePropertyAndTypeReference(),
}
const prepared = new Map<string, Promise<unknown>>()

export async function preparePage(page: string): Promise<void> {
  const run = PAGE_PREPARE[page]
  if (!run) return
  let p = prepared.get(page)
  if (!p) {
    p = run().catch((e: unknown) => { prepared.delete(page); throw e })
    prepared.set(page, p)
  }
  await p
}

/** 作者的整条渲染函数：先按页面找，再按类别名找（作者两种都登记了）。没有返回 null。 */
function compactOf(prop: string): ((ent: any) => string) | null {
  const page = A.DataLoader.getPropPage(prop)
  for (const key of [page, prop]) {
    if (!key) continue
    try {
      if (A.Renderer.hover._getFnRenderCompact({ page: key, isStatic: true })) return A.Renderer.hover.getFnRenderCompact(key, { isStatic: true })
    } catch { /* 作者对这个键没有登记：换下一个 */ }
  }
  return null
}

/** 作者的通用整条渲染（作者 getFnRenderCompact 的 "generic"）：这一类没有专门渲染、或专门渲染出错时用。 */
const generic = (): ((ent: any) => string) => A.Renderer.hover.getFnRenderCompact('generic', { isStatic: true })

/** 跑一次作者渲染：收链接和表格，去掉作者的名字行（标题栏已经显示名字）。 */
function run(fn: (ent: any) => string, item: any): AuthorMarkup | null {
  const { value, marker, links, tables } = collectAuthorLinks(() => String(fn(item) ?? ''))
  if (!value.trim()) return null
  const tpl = document.createElement('template')
  tpl.innerHTML = `<table>${value}</table>`
  tpl.content.querySelectorAll('th.ve-stats__th-name').forEach((th) => th.closest('tr')?.remove())
  return { html: tpl.innerHTML, marker, links, tables }
}

/**
 * 整条条目的作者渲染（带链接与表格标记）。这一类有作者专门的整条渲染就用它；没有、或作者程序在这一条上出错
 * （例：中文版载具的船只渲染引用了未定义的「船体」），退回作者的通用整条渲染并在控制台说明。
 */
export async function renderEntity(prop: string, item: any): Promise<AuthorMarkup | null> {
  await init()
  await preparePage(A.DataLoader.getPropPage(prop) ?? '')
  const fn = compactOf(prop)
  if (fn) {
    try { return run(fn, item) } catch (e) { console.warn(`[trpg-assistant] 作者的「${prop}」整条渲染出错，改用通用渲染`, e) }
  }
  return run(generic(), item)
}
