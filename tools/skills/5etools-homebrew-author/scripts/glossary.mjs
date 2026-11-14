// 查作者中文站大译名表：英文说法 → 中文候选（带分类、来源、已确定 / 待讨论）。只给候选，不替你选。
// 用法：node glossary.mjs "Fireball" "Shadowy Defense" … [--category=spell] [--file=词表.txt] [--terms=术语表.json] [--json]
//   --category=  只看某一类（作者分类名：spell、creature、item、bestiary、variantrule……；没有分类的条目分类是空）
//   --file=      每行一个英文说法
//   --json       输出 JSON（给脚本用）
// 退出码：0 正常（查不到也算正常，会写“没查到”）；2 用不了（术语表找不到、没给词）。
import { loadGlossary, lookup } from './glossary-lib.mjs'
import { readFile } from 'node:fs/promises'

const args = process.argv.slice(2)
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)
const queries = args.filter((a) => !a.startsWith('--'))
const file = opt('file')
if (file) queries.push(...(await readFile(file, 'utf8')).split('\n').map((l) => l.trim()).filter(Boolean))
if (!queries.length) { console.error('用法：node glossary.mjs "English term" … [--category=spell] [--file=词表.txt] [--json]'); process.exit(2) }

let glossary
try { glossary = await loadGlossary(opt('terms')) } catch (error) { console.error(error instanceof Error ? error.message : error); process.exit(2) }
const results = queries.map((q) => lookup(glossary, q, { category: opt('category') }))

if (args.includes('--json')) {
  console.log(JSON.stringify({ terms: glossary.file, results }, null, 2))
} else {
  console.log(`术语表：${glossary.file}（${glossary.count} 条）。以下只是候选，要按上下文选；分类为空 = 作者表里没分类。\n`)
  for (const r of results) {
    if (!r.candidates.length) { console.log(`${r.en}\n  没查到${opt('category') ? `（分类 ${opt('category')} 里）` : ''}——不要编，列进“术语表没有”清单\n`); continue }
    console.log(`${r.en}${r.conflict ? '   ⚠ 同一英文有多个中文，按上下文选' : ''}`)
    // 同一个中文（同一种匹配）合并成一行，分类并列
    const merged = new Map()
    for (const c of r.candidates) {
      const k = `${c.match}|${c.cn}`
      if (!merged.has(k)) merged.set(k, { ...c, tags: [], notes: [] })
      const m = merged.get(k)
      const tag = `${c.category || '无分类'}${c.status === '待讨论' ? '·待讨论' : ''}`
      if (!m.tags.includes(tag)) m.tags.push(tag)
      if (c.note && !m.notes.includes(c.note)) m.notes.push(c.note)
    }
    for (const m of merged.values()) console.log(`  ${m.match === '精确' ? '●' : '○'} ${m.cn}   [${m.tags.join('、')}]${m.match === '精确' ? '' : `  ← 变体：${m.matchedEn}`}${m.notes.length ? `  备注：${m.notes.join('；')}` : ''}`)
    console.log('')
  }
}
