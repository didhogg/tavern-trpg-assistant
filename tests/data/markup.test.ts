import { describe, expect, it } from 'vitest'
import { renderInline, type InlineContext } from '../../tools/data/markup/inline'

function ctx(): InlineContext {
  return {
    index: { byTypeName: new Map(), byTypeNameSource: new Map() },
    book: 'PHB',
    ownPack: 'p',
    allowed: new Set(),
    softRefs: { count: 0 },
    missingTags: new Map(),
  }
}

const r = (text: string) => renderInline(text, ctx())

describe('行内标签显示文字（5etools 参数位置）', () => {
  it('筛选、神祇、危害、语言等取各自的显示位置', () => {
    expect(r('{@filter 军用武器|items|source=phb}')).toBe('军用武器')
    expect(r('{@deity 安博里|费伦|SCAG}')).toBe('安博里')
    expect(r('{@deity 安博里|费伦|SCAG|显示}')).toBe('显示')
    expect(r('{@hazard 燃烧|XPHB}')).toBe('燃烧')
    expect(r('{@language 原初语|phb|水族语}')).toBe('水族语')
    expect(r('{@quickref 视野与光照||2||微光光照}')).toBe('微光光照')
    expect(r('{@quickref 困难地形||3}')).toBe('困难地形')
    expect(r('{@5etools 专长|feats.html}')).toBe('专长')
  })

  it('命中、充能、概率有固定写法', () => {
    expect(r('{@h}5点伤害')).toBe('命中：5点伤害')
    expect(r('火焰吐息 {@recharge 5}')).toBe('火焰吐息 （充能5–6）')
    expect(r('{@recharge}')).toBe('（充能6）')
    expect(r('{@chance 50}')).toBe('50%')
  })

  it('职业特性引用的显示文字取后面的位置，不会把来源当显示文字', () => {
    expect(r('{@classFeature 神圣感知|圣武士|PHB|1}')).toBe('神圣感知')
    expect(r('{@classFeature 神圣感知|圣武士|PHB|1|PHB|感知神圣}')).toBe('感知神圣')
    expect(r('{@subclassFeature 风暴灵光|野蛮人|PHB|风暴先驱|XGE|3|XGE}')).toBe('风暴灵光')
  })

  it('骰子、命中、DC 转成标记', () => {
    expect(r('{@damage 8d6}')).toBe('{{roll:8d6|8d6}}')
    expect(r('{@hit 5}')).toBe('{{hit:5}}')
    expect(r('{@dc 15}')).toBe('{{dc:15}}')
  })
})
