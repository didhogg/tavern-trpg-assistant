import { describe, expect, it } from 'vitest'
import { entryFacts } from '../../src/ui/library/facts'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { cleanMarkup, plainText } from './consumer/plainText'

const LEAK: Array<[string, RegExp]> = [['标记未去掉', /\{\{|\}\}/], ['对象泄漏', /\[object|undefined|NaN|\bnull\b/], ['占位符', /<\$|\$>/], ['编号泄漏', /\b(?:monster|spell|item|feature|class|race|rule|table)\.[a-z0-9-]+\.[a-z]+\b/]]

describe('G2d 交给 AI 的文字（d10）', () => {
  it('全部条目都能导出干净纯文字：没有标记、没有对象泄漏、没有编号泄漏；长度分布', () => {
    const l = lib()
    const rec2 = new Recorder('g2d-plaintext')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    const name = (id: string): string => l.get(id)?.name ?? '〔未安装的条目〕'
    const lengths: number[] = []
    const onlyHeader = new Map<string, string[]>()
    for (const r of l.rows) {
      const t = plainText(r, name)
      lengths.push(t.length)
      for (const [k, re] of LEAK) if (re.test(t)) add(`leak-${k}`, `${r.id} ${r.name}：${re.exec(t)![0].slice(0, 40)}`)
      const lines = t.split('\n').filter((x) => x.trim())
      if (lines.length <= 2) onlyHeader.set(r.type, [...(onlyHeader.get(r.type) ?? []), `${r.id} ${r.name}`])
    }
    // 界面的“事实”构建（entryFacts）覆盖哪些类型：没有的类型，结构化字段（神祇的万神殿与领域、语言的文字与使用者、危害的等级、物件的护甲与生命、专长的前置……）不会出现在纯文字里
    const cover = new Map<string, [number, number]>()
    for (const r of l.rows) { const c = cover.get(r.type) ?? [0, 0]; c[1]++; if (entryFacts({ type: r.type, data: r.data } as never).length) c[0]++; cover.set(r.type, c) }
    for (const [t, [with_, all]] of cover) rec2.stat('d10', `factsCoverage.${t}`, Math.round((100 * with_) / all))
    const noFacts = [...cover].filter(([, [w]]) => w === 0).map(([t]) => t)
    lengths.sort((a, b) => a - b)
    const pick = (q: number): number => lengths[Math.floor((lengths.length - 1) * q)]
    rec2.stat('d10', 'entries', l.rows.length)
    rec2.stat('d10', 'length.p50', pick(0.5))
    rec2.stat('d10', 'length.p95', pick(0.95))
    rec2.stat('d10', 'length.max', lengths[lengths.length - 1])
    const long = l.rows.filter((r) => plainText(r, name).length > 12000)
    rec2.stat('d10', 'over12000chars', long.length)
    for (const [t, v] of onlyHeader) rec2.stat('d10', `onlyNameAndSummary.${t}`, v.length)
    const NOTE: Record<string, string> = { 'leak-标记未去掉': '导出后仍有 {{ }} 标记', 'leak-对象泄漏': '导出里出现 [object / undefined / null / NaN', 'leak-占位符': '导出里有 <$ $> 占位符', 'leak-编号泄漏': '导出里出现条目编号（应显示名字）' }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `d10-${k}`, check: 'd10', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '纯文字导出（参考实现 consumer/plainText.ts）', note: NOTE[k], selfCheck: true })
    rec2.find({ id: 'd10-no-facts-types', check: 'd10', kind: 'decision', fixSource: 'decision', entries: noFacts.map((t) => `${t}（${cover.get(t)![1]} 个条目没有结构化事实，纯文字只有名字、摘要和正文）`), expected: '界面 entryFacts（src/ui/library/facts.ts）', note: '这些类型的结构化字段（神祇的万神殿/领域/象征、语言的文字与使用者、专长的前置与属性提升、危害的等级、物件的护甲与生命……）没有进“事实”，所以既不在详情页的数据行里，也不在给 AI 的文字里。推荐：给“事实”补这几类（详情页与给 AI 共用，归 G3 显示整理），G2.5 不改数据' })
    rec2.find({ id: 'd10-long-entries', check: 'd10', kind: 'decision', fixSource: 'decision', entries: long.map((r) => `${r.id} ${r.name}：${plainText(r, name).length} 字`), expected: '长度分布', note: '导出超过 12,000 字的条目（书籍章节、长表）；“给 AI”按级别（摘要/全文）取用，长条目只给摘要或分段，不整条塞进提示词' })
    // 去标记函数本身的小自测
    expect(cleanMarkup('命中{{hit:7}}，{{ref:spell.fireball.phb|火球术}} {{roll:8d6|8d6}} DC {{dc:15}}')).toBe('命中+7，火球术 8d6 DC DC 15')
    expect(rec2.settle()).toEqual([])
  })
})
