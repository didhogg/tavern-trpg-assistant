import { join } from 'node:path'
import { DATA_5ETOOLS, type Raw } from './load'
import { readJson } from '../lib/io'
import { BOOKS } from '../config/books'

export interface BookData {
  source: string
  contents: Raw[]
  chapters: Raw[]
}

const SOURCES = BOOKS.map((b) => b.source)

export async function loadBookData(): Promise<BookData[]> {
  const index = await readJson<{ book: Raw[] }>(join(DATA_5ETOOLS, 'books.json'))
  const bySource = new Map(index.book.map((book) => [String(book.source), book]))
  const out: BookData[] = []
  for (const source of SOURCES) {
    const info = bySource.get(source)
    if (!info) throw new Error(`books.json 缺少 ${source}`)
    const file = await readJson<{ bookData: Array<{ data: Raw[] }> }>(join(DATA_5ETOOLS, 'book', `book-${source.toLowerCase()}.json`))
    const chapters = file.bookData[0]?.data
    if (!Array.isArray(chapters)) throw new Error(`${source} 缺少 bookData[0].data`)
    const contents = Array.isArray(info.contents) ? info.contents : []
    if (contents.length !== chapters.length) throw new Error(`${source} contents ${contents.length} != chapters ${chapters.length}`)
    for (const [i, chapter] of chapters.entries()) {
      if (typeof chapter.id !== 'string' || !/^[0-9a-f]{3}$/.test(chapter.id)) throw new Error(`${source} 第 ${i} 章缺三位 id`)
      if (typeof chapter.name !== 'string' || !chapter.name) throw new Error(`${source} 第 ${i} 章缺 name`)
      if (typeof chapter.ENG_name !== 'string' || !chapter.ENG_name) throw new Error(`${source} 第 ${i} 章缺 ENG_name`)
    }
    out.push({ source, contents, chapters })
  }
  return out
}
