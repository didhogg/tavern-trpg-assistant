import { describe, expect, it } from 'vitest'
import { humanizeTokens } from '../../src/ui/library/tokens'
import { parseInline } from '../../src/ui/library/inline'

describe('怪物部件占位符显示成人话', () => {
  it('简称、豁免 DC、命中、伤害都换成文字', () => {
    expect(humanizeTokens('<$title_short_name$>在<$short_name$>的回合')).toBe('该生物在该生物的回合')
    expect(humanizeTokens('DC <$dc__dex$> 敏捷豁免')).toBe('DC （8＋熟练加值＋敏捷调整值） 敏捷豁免')
    expect(humanizeTokens('命中<$命中__力量$>，<$to_hit__str$>')).toBe('命中（熟练加值＋力量调整值），（熟练加值＋力量调整值）')
    expect(humanizeTokens('<$damage_avg__7+str$>（2d6<$damage_mod__str$>）')).toBe('7＋力量调整值（2d6＋力量调整值）')
  })
  it('来源里的拼写瑕疵变体也认；不认识的占位符原样保留', () => {
    expect(humanizeTokens('<$dc_体质$><$dc_wis$><$to_hit_敏捷$><$damage_mod_力量$><$伤害修正__力量$>')).toBe('（8＋熟练加值＋体质调整值）（8＋熟练加值＋感知调整值）（熟练加值＋敏捷调整值）＋力量调整值＋力量调整值')
    expect(humanizeTokens('<$something_else$>')).toBe('<$something_else$>')
  })
  it('行内解析后的文字片段里不再出现 <$', () => {
    const text = parseInline('命中{{hit:<$命中__力量$>}}，伤害<$damage_avg__5+str$>').map((s) => s.text).join('')
    expect(text).not.toContain('<$')
  })
})
