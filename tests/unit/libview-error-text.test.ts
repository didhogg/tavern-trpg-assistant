import { describe, expect, it } from 'vitest'
import { hasDetail, plainError } from '../../src/ui/libview/error-text'

describe('横幅里的报错只放一句人话（P5-5 §12.3）', () => {
  it('后端「中文说明：原始报错」：只留中文说明，调用位置收进详情', () => {
    const raw = '删除《Sample - Giddy; 《乏味巫师指南》.json》没有成功：自制解析失败，没有发布：_getMastery@tauri://localhost/scripts/extensions/third-party/tavern-trpg-assistant/vendor/cn/js/render.js:13025:28'
    expect(plainError(raw)).toBe('删除《Sample - Giddy; 《乏味巫师指南》.json》没有成功：自制解析失败，没有发布')
    expect(hasDetail(raw)).toBe(true)
  })
  it('只有英文原始报错：去掉「Error:」取第一行', () => {
    expect(plainError('Error: Item mastry 削弱|XPHB not found.\n    at Renderer.item._getMastery (render.js:13025:19)')).toBe('Item mastry 削弱|XPHB not found.')
  })
  it('一句中文、没有原始报错：原样，不给详情；太长截短', () => {
    expect(plainError('现在没有网络，连上后再试')).toBe('现在没有网络，连上后再试')
    expect(hasDetail('现在没有网络，连上后再试')).toBe(false)
    expect(plainError('长'.repeat(100)).length).toBe(81)
  })
  it('空：原因未知', () => { expect(plainError('')).toBe('原因未知') })
})
