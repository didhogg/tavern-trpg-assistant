import { describe, expect, it } from 'vitest'
import { officialTaskKey } from '../../../src/library/tasks'

describe('官方任务身份', () => {
  it('同语言不同书、不同语言不同选择、不同目标提交都不会被当成同一个任务', () => {
    expect(officialTaskKey({ books: ['PHB'] })).not.toBe(officialTaskKey({ books: ['MM'] }))
    expect(officialTaskKey({ books: ['PHB'], commit: 'a' })).not.toBe(officialTaskKey({ books: ['PHB'], commit: 'b' }))
    expect(officialTaskKey({ books: ['PHB'] })).toBe(officialTaskKey({ books: ['PHB'] }))
  })
})
