import { mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { OUT_ROOT, REF, REPO } from '../lib/paths'
import { loadUpstream } from './loadUpstream'

/**
 * 上游取数（R3）：用上游自己的 DataLoader.pCacheAndGetAllSite 取出"网站上真正显示的那批条目"，
 * 每个类别写成一个 JSON。DataLoader 注册了哪些类别，就取哪些类别（读它自己的注册表，不自己列名单）。
 * 一个进程只能加载一个库的数据：lib = cn（中文）或 bak（中文仓库自带的英文原版 data-bak）。
 * 两边用同一份上游代码（中文仓库 2.39.0），只是 data 目录不同。
 */
/** 用上游自己的函数给每条算出：h = 本语言哈希（URL_TO_HASH_BUILDER[类别]）；e = 英文哈希（URL_TO_ENG_HASH_BUILDER[类别]，只有中文库有 ENG_name）；
 *  s = 来源（SourceUtil.getEntitySource）；f = 条目自带的 edition 字段；c = 上游判断是不是旧版来源（SourceUtil.isClassicSource）；d = 来源有没有出版日期。 */
function writeKeys(g: Record<string, any>, outDir: string, prop: string, rows: any[], isCn: boolean, keyStats: Record<string, unknown>, sources: Set<string>): void {
  const hb = g.UrlUtil.URL_TO_HASH_BUILDER[prop]
  const eb = g.UrlUtil.URL_TO_ENG_HASH_BUILDER[prop]
  let errs = 0
  const keys = rows.map((ent) => {
    const k: { h: string | null; e: string | null; s: string | null; f: string | null; c: boolean | null; d: boolean } = { h: null, e: null, s: null, f: ent.edition ?? null, c: null, d: false }
    try { if (hb) k.h = hb(ent) } catch { errs += 1 }
    try { if (isCn && eb && ent.ENG_name !== undefined) k.e = eb(ent) } catch { errs += 1 }
    try {
      const src = g.SourceUtil.getEntitySource(ent)
      if (typeof src === 'string' && src) { k.s = src; sources.add(src); k.d = g.Parser.sourceJsonToDate(src) != null; k.c = g.SourceUtil.isClassicSource(src) }
    } catch { errs += 1 }
    return k
  })
  keyStats[prop] = { 有哈希构造器: !!hb, 有英文哈希构造器: !!eb, 构造出错: errs }
  writeFileSync(join(outDir, `${prop}.keys.json`), JSON.stringify(keys))
}

async function main(): Promise<void> {
  const lib = (process.argv[2] ?? 'cn') as 'cn' | 'bak'
  const g = await loadUpstream('cn')
  // 速查（reference）的加载器要用到索引器里的类；上游网页也是先加载它
  await import(pathToFileURL(join(OUT_ROOT, '_upstream', 'cn', 'js/omnidexer.js')).href)
  if (lib === 'cn') process.chdir(REPO.cn)
  else {
    const root = join(OUT_ROOT, '_upstream', 'bakroot')
    rmSync(root, { recursive: true, force: true })
    mkdirSync(root, { recursive: true })
    symlinkSync(REF.cnBak, join(root, 'data'))
    process.chdir(root)
  }
  const ut: any = await import(pathToFileURL(join(OUT_ROOT, '_upstream', 'cn', 'node/util.js')).href)
  ut.patchLoadJson()
  const outDir = join(OUT_ROOT, '_upstream', `dump_${lib}`)
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  // 每个加载器自己声明的类别（静态属性 PROPS）；"xxx.html" 之类是页面别名，指向同一批条目，不另算
  const loaders: any[] = g.DataLoader._DATA_TYPE_LOADER_LIST
  const props = [...new Set(loaders.flatMap((l) => [...(l.constructor.PROPS ?? [])]))].sort() as string[]
  const aliases = Object.keys(g.DataLoader._DATA_TYPE_LOADERS).filter((k) => !props.includes(k)).sort()
  const summary: Array<{ prop: string; count: number | null; error?: string }> = []
  const keyStats: Record<string, unknown> = {}
  const sources = new Set<string>()
  // 冒险、书：上游不支持"一次取全站"（内部用 Symbol 当来源，拼不成字符串），网页是按目录文件里的来源一本一本取。
  // 这里照网页的做法：读上游的目录文件 adventures.json / books.json，每本用 DataLoader.pCacheAndGet 取。
  const perSource: Record<string, { page: string; index: string; contents: string; data: string }> = {
    adventure: { page: g.UrlUtil.PG_ADVENTURE, index: 'data/adventures.json', contents: 'adventure', data: 'adventureData' },
    book: { page: g.UrlUtil.PG_BOOK, index: 'data/books.json', contents: 'book', data: 'bookData' },
  }
  for (const [name, c] of Object.entries(perSource)) {
    try {
      const index = await g.DataUtil.loadJSON(c.index)
      const contents: unknown[] = [], data: unknown[] = []
      for (const item of index[c.contents]) {
        const pack = await g.DataLoader.pCacheAndGet(c.page, item.source, g.UrlUtil.URL_TO_HASH_BUILDER[c.page](item))
        if (!pack) { summary.push({ prop: `${name}:${item.source}`, count: null, error: '上游取不到这一本' }); continue }
        contents.push(pack[c.contents]); data.push(pack[c.data])
      }
      writeFileSync(join(outDir, `${c.contents}.json`), JSON.stringify(contents))
      writeKeys(g, outDir, c.contents, contents as any[], lib === 'cn', keyStats, sources)
      writeKeys(g, outDir, c.data, data as any[], lib === 'cn', keyStats, sources)
      writeFileSync(join(outDir, `${c.data}.json`), JSON.stringify(data))
      summary.push({ prop: c.contents, count: contents.length }, { prop: c.data, count: data.length })
    } catch (e) {
      summary.push({ prop: name, count: null, error: String((e as Error).message ?? e).split('\n')[0]!.slice(0, 200) })
    }
  }
  const handled = new Set(['adventure', 'adventureData', 'book', 'bookData'])
  for (const prop of props.filter((p) => !handled.has(p))) {
    try {
      const rows = await g.DataLoader.pCacheAndGetAllSite(prop, { isSilent: true })
      if (rows == null) { summary.push({ prop, count: null }); continue }
      writeFileSync(join(outDir, `${prop}.json`), JSON.stringify(rows))
      writeKeys(g, outDir, prop, rows, lib === 'cn', keyStats, sources)
      summary.push({ prop, count: rows.length })
    } catch (e) {
      summary.push({ prop, count: null, error: String((e as Error).message ?? e).split('\n')[0]!.slice(0, 200) })
    }
  }
  // 来源代号 → 上游给的全名、缩写、出版日期（打包命名用；全部来自上游 Parser）
  const sourceInfo = Object.fromEntries([...sources].sort().map((src) => [src, { full: g.Parser.sourceJsonToFull(src), abv: g.Parser.sourceJsonToAbv(src), date: g.Parser.sourceJsonToDate(src) ?? null }]))
  writeFileSync(join(outDir, '_sources.json'), JSON.stringify(sourceInfo))
  writeFileSync(join(outDir, '_summary.json'), JSON.stringify({ lib, loaders: loaders.length, props: props.length, aliases, keyStats, summary }, null, 1))
  const ok = summary.filter((s) => s.count != null)
  console.log(`${lib}: ${loaders.length} 个加载器声明 ${props.length} 个类别（另有页面别名 ${aliases.length} 个不另算），取出 ${ok.length} 个，共 ${ok.reduce((a, s) => a + (s.count ?? 0), 0)} 条；无内容 ${summary.filter((s) => s.count == null && !s.error).length}；出错 ${summary.filter((s) => s.error).length}`)
  for (const s of summary.filter((x) => x.error)) console.log('  出错', s.prop, s.error)
}
await main()
