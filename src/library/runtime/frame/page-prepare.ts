// 小窗里：作者各列表页打开时先做的准备（P5-5 §11.5、§12）。作者自己的页面在读数据、画条目之前都先做这一步：
// 怪物页预载传奇组（bestiary.js 341–346、608 行），物品页装物品类型 / 属性 / 武器精通表（filter-items.js 605 行；
// 作者加载器 DataTypeLoaderItemMastery 也先装）。小窗不做的话：怪物画不出巢穴动作，物品报「找不到物品类型」，
// 带武器精通的自制物品解析失败（「Item mastery … not found」）。按作者页面名登记：加一页 = 加一行。
import { A, init } from './author'

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

async function preparePage(page: string): Promise<void> {
  const run = PAGE_PREPARE[page]
  if (!run) return
  let p = prepared.get(page)
  if (!p) {
    p = run().catch((e: unknown) => { prepared.delete(page); throw e })
    prepared.set(page, p)
  }
  await p
}


/** 读 / 画某一类之前：先做它所在作者页面的准备。 */
export async function prepareProp(prop: string): Promise<void> {
  await init()
  await preparePage(A.DataLoader.getPropPage(prop) ?? '')
}
