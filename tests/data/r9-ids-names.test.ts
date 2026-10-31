import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r9-pack-helpers'

describe('R9 表 id 与名称', () => {
  it('id 合法、同包名称唯一、没有同名后缀、B7 为 0', () => {
    const packs = loadAllPacks()
    const bad: string[] = []
    for (const pack of packs) {
      const names = new Set<string>()
      for (const entry of pack.entries) {
        if (entry.type !== 'table') continue
        if (!/^table\.[a-z0-9][a-z0-9.-]*$/.test(entry.id)) bad.push(`${entry.id} id`)
        if (names.has(entry.name)) bad.push(`${entry.id} 名称重复 ${entry.name}`)
        names.add(entry.name)
        if (entry.name.includes('（2）')) bad.push(`${entry.id} 同名后缀`)
        const parts = entry.name.split('·')
        if (parts.length === 2 && parts[0] === parts[1]) bad.push(`${entry.id} X·X`)
      }
    }
    expect(bad).toEqual([])
  })
})
