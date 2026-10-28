import { beforeEach, describe, expect, it, vi } from 'vitest'

const state: { textarea: { value: string } | null; refuse: boolean } = { textarea: null, refuse: false }
vi.mock('../../src/host/context', () => ({
  getTextarea: () => state.textarea,
  setTextareaValue: (ta: { value: string }, value: string) => {
    if (!state.refuse) ta.value = value
  },
}))

import { appendToInput } from '../../src/host/input'

describe('追加到酒馆输入框', () => {
  beforeEach(() => {
    state.textarea = { value: '' }
    state.refuse = false
  })

  it('输入框为空：直接写入', () => {
    expect(appendToInput('<!-- a -->')).toBe(true)
    expect(state.textarea?.value).toBe('<!-- a -->')
  })

  it('已有文字：保留原文，另起一行追加', () => {
    state.textarea!.value = '我推开门'
    appendToInput('<!-- a -->')
    expect(state.textarea?.value).toBe('我推开门\n<!-- a -->')
  })

  it('原文已以换行结尾：不再多加换行', () => {
    state.textarea!.value = '我推开门\n'
    appendToInput('<!-- a -->')
    expect(state.textarea?.value).toBe('我推开门\n<!-- a -->')
  })

  it('找不到输入框，或写入后读回不一致：返回 false', () => {
    state.textarea = null
    expect(appendToInput('x')).toBe(false)
    state.textarea = { value: '原文' }
    state.refuse = true
    expect(appendToInput('x')).toBe(false)
    expect(state.textarea.value).toBe('原文')
  })
})
