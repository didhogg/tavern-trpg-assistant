import { describe, expect, it } from 'vitest'
import { MARKER_COMMENT, MARKER_INJECT, scanPayload } from '../src/probes/promptScan'

describe('scanPayload', () => {
  it('在对话补全请求中找到完整保留的注释', () => {
    const payload = { chat: [{ role: 'user', content: `你好 <!--${MARKER_COMMENT} 测试-->` }] }
    const r = scanPayload(payload)
    expect(r.comment).toBe(true)
    expect(r.commentIntact).toBe(true)
    expect(r.inject).toBe(false)
  })

  it('注释被去掉标记符号时判为不完整', () => {
    const r = scanPayload({ chat: [{ role: 'user', content: `你好 ${MARKER_COMMENT}` }] })
    expect(r.comment).toBe(true)
    expect(r.commentIntact).toBe(false)
  })

  it('定位注入文本所在消息距末尾的位置', () => {
    const payload = {
      chat: [
        { role: 'system', content: '设定' },
        { role: 'system', content: `[${MARKER_INJECT}]` },
        { role: 'user', content: '行动' },
      ],
    }
    expect(scanPayload(payload).injectAt).toEqual({ role: 'system', indexFromEnd: 1 })
  })

  it('支持纯文本请求，且没有标记时全部为 false', () => {
    const r = scanPayload('只有普通文字')
    expect(r.comment).toBe(false)
    expect(r.inject).toBe(false)
    expect(r.injectAt).toBeUndefined()
  })
})
