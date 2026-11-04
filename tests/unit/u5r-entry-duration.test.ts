import { describe, expect, it } from 'vitest'
import { durationOfFoundry, durationOfOpen } from '../../tools/data/convert/duration'

describe('U5R 条目时长（来源读取）', () => {
  it('活动里的中文单位与数字', () => {
    expect(durationOfFoundry({ activities: [{ duration: { units: '分钟', value: '10' } }] })).toEqual({ type: 'timed', amount: 10, unit: 'minute', concentration: false })
    expect(durationOfFoundry({ activities: [{ duration: { units: '小时', value: '1' } }] })?.unit).toBe('hour')
  })
  it('特效里的秒数换成最整的单位；回合与轮数', () => {
    expect(durationOfFoundry({ effects: [{ duration: { seconds: 3600 } }] })).toMatchObject({ amount: 1, unit: 'hour' })
    expect(durationOfFoundry({ effects: [{ duration: { seconds: 600 } }] })).toMatchObject({ amount: 10, unit: 'minute' })
    expect(durationOfFoundry({ effects: [{ duration: { rounds: 1 } }] })).toMatchObject({ amount: 1, unit: 'round' })
  })
  it('公式时长与瞬时不猜、不写', () => {
    expect(durationOfOpen({ activities: { a: { duration: { units: 'hour', value: 'floor(@classes.druid.levels / 2)' } } } })).toBeUndefined()
    expect(durationOfOpen({ activities: { a: { duration: { units: 'inst', value: '' } } } })).toBeUndefined()
  })
  it('开源数据的英文单位', () => {
    expect(durationOfOpen({ activities: { a: { duration: { units: 'minute', value: '1' } } } })).toMatchObject({ type: 'timed', amount: 1, unit: 'minute' })
  })
})
