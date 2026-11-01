import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { apiSpells, hasApi } from './consumer/refApi'
import { has5etools, raw5e } from './consumer/ref5etools'
import { arr, fold, rec, str } from './consumer/util'

const flat = (v: unknown): string => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join(' ') : v && typeof v === 'object' ? Object.values(v).map(flat).join(' ') : '')
const TAG = /\{@scale(?:damage|dice) ([^|}]+)\|([^|}]+)\|([^|}]+)(?:\|[^}]*)?\}/g

/** 把 “8d6” + 增量 “1d6” 在法术位 S 环时的骰式算出来（同一骰面才合并；不同骰面返回 undefined）。 */
function diceAt(base: string, inc: string, spellLevel: number, slot: number): string | undefined {
  const b = /^(\d+)d(\d+)$/.exec(base.trim()), i = /^(\d+)d(\d+)$/.exec(inc.trim())
  if (!b || !i || b[2] !== i[2]) return undefined
  return `${Number(b[1]) + Number(i[1]) * (slot - spellLevel)}d${b[2]}`
}

describe('G2b 升环施法（b8）', () => {
  it('升环效果现在全是文字；5etools 标签能不能算出与 5e API 一致的每环骰式；其余分类', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-upcast')
    const withText = l.of('spell').filter((s) => s.data.higherLevel !== undefined)
    rec2.stat('b8', 'spellsWithHigherLevelText', withText.length)
    const structured = withText.filter((s) => s.data.upcast !== undefined || s.data.scaling !== undefined || s.data.higherLevelScaling !== undefined)
    rec2.stat('b8', 'withStructure', structured.length)
    rec2.find({ id: 'b8-upcast-no-structure', check: 'b8', kind: 'data-defect', fixSource: 'import-5etools', entries: withText.map((s) => `${s.id} ${s.name}`), expected: 'PHB 第 11 章各法术“升环施法”；5etools 的 {@scaledamage} 标签；5e API 的 damage_at_slot_level', note: '升环效果只有文字，没有结构：火球术用 5 环施放该掷几个骰，程序算不出来' })
    if (has5etools()) {
      // 从 5etools 原始法术里读标签
      const raw = new Map<string, Record<string, unknown>>()
      for (const f of ['phb', 'xge', 'tce', 'bmt']) for (const sp of arr(rec(raw5e(`spells/spells-${f}.json`)).spell).map(rec)) raw.set(fold(str(sp.ENG_name) || str(sp.name)), sp)
      const api = hasApi() ? apiSpells() : {}
      const apiByName = new Map(Object.values(api).map((a) => [fold(a.name), a]))
      let tagged = 0
      let comparable = 0
      let agree = 0
      const disagree: string[] = []
      const noTag: string[] = []
      for (const s of withText) {
        const r = raw.get(fold(s.nameEn ?? ''))
        const text = flat(r?.entriesHigherLevel)
        const tags = [...text.matchAll(TAG)]
        if (!tags.length) { noTag.push(s.id); continue }
        tagged++
        const a = apiByName.get(fold(s.nameEn ?? ''))
        if (!a?.damage) continue
        const level = Number(s.data.level)
        // 一个法术可以有多个标签（冰墙术：墙体伤害与穿过墙的伤害）；API 只列其中一部分，所以“至少一个标签与 API 逐环一致、且没有标签与 API 冲突”才算一致
        const results: boolean[] = []
        let any = false
        for (const m of tags) {
          let tagOk = true
          let tagAny = false
          const [, base, range, inc] = m
          const [lo, hi] = range.split('-').map(Number)
          for (let slot = Math.max(lo, level); slot <= (hi || 9); slot++) {
            const want = diceAt(base, inc, level, slot)
            if (!want) continue
            // API 对有些法术只列了第一环（墙术）或写成“4d6 OR 5d6”（焰击术）：取 API 在这一环有的值，没有就不比
            const vals = [...a.damage.map((d) => d.damage_at_slot_level?.[String(slot)]), a.heal_at_slot_level?.[String(slot)]].filter((v): v is string => typeof v === 'string')
            if (!vals.length) continue
            tagAny = true
            if (!vals.some((v) => v === want || v.split(' OR ').includes(want) || v.startsWith(want + ' '))) tagOk = false
          }
          if (tagAny) { any = true; results.push(tagOk) }
        }
        const ok = results.some(Boolean)
        if (any) { comparable++; if (ok) agree++; else disagree.push(`${s.id} ${s.name}`) }
      }
      rec2.stat('b8', 'taggedIn5etools', tagged)
      rec2.stat('b8', 'comparableWithApi', comparable)
      rec2.stat('b8', 'tagMatchesApi', agree)
      if (disagree.length) rec2.find({ id: 'b8-tag-vs-api', check: 'b8', kind: 'source-defect', fixSource: 'decision', entries: disagree, expected: '5e API damage_at_slot_level（SRD 法术逐环）', note: '5etools 标签算出的每环骰式与 5e API 不一致（需对照 PHB 原文判断谁对）' })
      // 没有标签的：按升环文字分类
      const cat = (s: string): string => (/召唤|魔宠|造物|灵魄|守卫|数据/.test(s) ? 'summon' : /治疗|恢复|生命值/.test(s) ? 'heal' : /目标|个生物|枚|只|额外|多一|发射|飞弹|光线|匕首/.test(s) ? 'targets' : /持续|分钟|小时|天/.test(s) ? 'duration' : /尺|范围|半径|体积/.test(s) ? 'area' : 'other')
      const groups: Record<string, string[]> = {}
      for (const id of noTag) { const s = l.need(id); (groups[cat(str(s.data.higherLevel))] ??= []).push(`${id} ${s.name}`) }
      for (const [k, v] of Object.entries(groups)) rec2.stat('b8', `noTag.${k}`, v.length)
      for (const [k, v] of Object.entries(groups)) rec2.find({ id: `b8-upcast-no-tag-${k}`, check: 'b8', kind: 'data-defect', fixSource: 'self-structure', entries: v, expected: 'PHB、XGE、TCE 各法术原文', note: `没有 5etools 标签的升环（${k === 'targets' ? '目标/数量增加' : k === 'summon' ? '召唤物随环级变强' : k === 'heal' ? '治疗量' : k === 'duration' ? '持续时间变长' : k === 'area' ? '范围变大' : '其他，只留文字并标“不自动计算”'}），需要自己对照原书结构化` })
    }
    expect(rec2.settle()).toEqual([])
  })
})
