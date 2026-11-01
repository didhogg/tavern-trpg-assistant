import { describe, expect, it } from 'vitest'
import { ABILITIES, DAMAGE, CONDITION_CODES } from './consumer/codes'
import { XP_BY_CR, profByCr } from './consumer/expected/cr'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { apiMonsters, hasApiMonsters } from './consumer/refApi'
import { evaluateFormula } from '../../src/rules/dnd5e2014/data/formula'
import { abilityMod, avgOf, crValue } from './consumer/monsterSheet'
import { arr, fold, rec, str, strs } from './consumer/util'

const mod = abilityMod
const avg = avgOf

describe('G2c 怪物基础与挑战等级（c1 c2 c3）', () => {
  it('挑战等级 → 经验值与熟练加值；生命值与骰式；豁免与技能加值的自洽', () => {
    const l = lib()
    const rec2 = new Recorder('g2c-monster-basic')
    const M = l.of('monster')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    const crs = new Set<string>()
    let checks = 0
    for (const m of M) {
      const d = m.data
      const tag = `${m.id} ${m.name}`
      const cr = crValue(d.cr)
      crs.add(String(cr))
      checks++
      if (!(String(cr) in XP_BY_CR)) add('cr-unknown', `${tag}：${JSON.stringify(d.cr)}`)
      // 带巢穴/聚会的挑战等级对象：lair/coven 也得是已知挑战等级
      for (const k of ['lair', 'coven']) if (rec(d.cr)[k] !== undefined && !(String(rec(d.cr)[k]) in XP_BY_CR)) add('cr-unknown', `${tag}：${k}=${String(rec(d.cr)[k])}`)
      // 生命值：有骰式的，骰式平均值 = 生命值；没有骰式的看是不是有 special
      const hp = rec(d.hp)
      checks++
      if (typeof hp.formula === 'string') { const a = avg(hp.formula); if (a === undefined) add('hp-formula-unparsable', `${tag}：${hp.formula}`); else if (a !== hp.average) add('hp-formula-mismatch', `${tag}：骰式 ${hp.formula} 平均 ${a} / 写明 ${String(hp.average)}`) }
      else add('hp-no-formula', `${tag}：${JSON.stringify(hp.special ?? hp)}`)
      // 豁免、技能加值 = 调整值 + 熟练（或专精 2 倍）。熟练由挑战等级给出（注意：部分怪物书上本来就不严格按表，不符的逐条列出）
      const prof = profByCr(cr)
      const ab = rec(d.abilities) as Record<string, number>
      for (const [k, v] of Object.entries(rec(d.saves))) {
        checks++
        const diff = Number(v) - mod(ab[k])
        if (!ABILITIES.includes(k)) add('save-code', `${tag}：${k}`)
        else if (diff !== prof) add('save-bonus-off', `${tag}：${k} 加值 ${v}，调整值 ${mod(ab[k])}，应加熟练 ${prof}（差 ${diff - prof}）`)
      }
      const SK: Record<string, string> = { acrobatics: 'dex', 'animal handling': 'wis', arcana: 'int', athletics: 'str', deception: 'cha', history: 'int', insight: 'wis', intimidation: 'cha', investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis', performance: 'cha', persuasion: 'cha', religion: 'int', 'sleight of hand': 'dex', stealth: 'dex', survival: 'wis' }
      for (const [k, v] of Object.entries(rec(d.skills))) {
        checks++
        if (!(k in SK)) { add('skill-code', `${tag}：${k}`); continue }
        const diff = Number(v) - mod(ab[SK[k]])
        if (diff !== prof && diff !== prof * 2) add('skill-bonus-off', `${tag}：${k} 加值 ${v}，调整值 ${mod(ab[SK[k]])}，熟练 ${prof}（差 ${diff - prof}）`)
      }
      // 被动察觉 = 10 + 察觉加值（有察觉技能）或 10 + 感知调整值
      checks++
      const pp = rec(d.skills).perception !== undefined ? 10 + Number(rec(d.skills).perception) : 10 + mod(ab.wis)
      if (d.passive === undefined || d.passive === null) add('passive-missing', tag)
      else if (d.passive !== pp) add('passive-off', `${tag}：写明 ${String(d.passive)} / 算出 ${pp}`)
      // 抗性/免疫/易伤/状态免疫的代码
      for (const k of ['resist', 'immune', 'vulnerable']) for (const x of strs(d[k])) {
        checks++
        if (DAMAGE.includes(x)) continue
        // 带条件的写法：伤害代码用顿号连起来，后面括号里是条件文字（“来自非魔法攻击”“非银质武器”……）；纯文字（“法术伤害”）
        const m = /^((?:[a-z]+、)*[a-z]+)（([^）]*)）$/.exec(x)
        if (m && m[1].split('、').every((c) => DAMAGE.includes(c))) add('resist-conditional', `${tag}（${k}）：${x}`)
        else add('resist-text', `${tag}（${k}）：${x}`)
      }
      for (const x of strs(d.conditionImmune)) { checks++; if (!CONDITION_CODES.includes(x)) add('condition-code', `${tag}：${x}`) }
      void evaluateFormula
    }
    rec2.stat('c1', 'monsters', M.length)
    rec2.stat('c1', 'checks', checks)
    rec2.stat('c2', 'distinctCr', crs.size)
    const NOTE: Record<string, string> = {
      'cr-unknown': '挑战等级不在 0 到 30 的已知表里（经验值读不出）', 'hp-formula-unparsable': '生命骰式读不了', 'hp-formula-mismatch': '生命骰式的平均值和写明的生命值不一致。已对照 MM、MPMM、VGM、MTF 原书逐条核对：灰矮人与枯藤怪应为 4d8+8（生命值 26）；噬魂怪两个版本应为 17d10+34（生命值 127）；云巨人欢笑者应为 21d12+126（生命值 262）；盗贼大师生命值应为 84（骰式 13d8+26 对）；阴影獒犬首领原书只写“生命值 42–54”、没有骰式（数据里的 6d8+6 抄自普通阴影獒犬）；诅咒石化人原书自己印的就是“19 (3d8 + 4)”，数据与原书一致（原书自相矛盾）',
      'hp-no-formula': '没有生命骰式（战斗里无法掷生命）：多数是书上就只写了固定生命值，或特殊生命值（如会随条件变化）', 'save-bonus-off': '豁免加值 ≠ 调整值 + 熟练（自洽检查；怪物不一定严格按表，但差值多说明可能抄错）',
      'skill-bonus-off': '技能加值 ≠ 调整值 + 熟练或专精', 'passive-missing': '没有被动察觉', 'passive-off': '被动察觉 ≠ 10 + 察觉加值（或感知调整值）',
      'resist-conditional': '抗性/免疫/易伤写成“伤害代码、伤害代码（条件文字）”的一整串字符串（非魔法攻击、非银质武器、非精金武器、微光或黑暗中、仅限某元素位面……）：程序读不出“是哪些伤害类型、在什么条件下”，战斗里自动减伤会判错', 'resist-text': '抗性/免疫写成纯文字（法术伤害、见下文龙之抗性、来自石肤术）', 'save-code': '豁免属性代码不合法', 'skill-code': '技能代码不合法', 'condition-code': '状态免疫代码不合法',
    }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `c1-${k}`, check: k.startsWith('resist') ? 'c6' : k.startsWith('cr') ? 'c2' : k.startsWith('save') || k.startsWith('skill') ? 'c3' : 'c1', kind: k === 'hp-formula-mismatch' || k.endsWith('-off') || k === 'hp-no-formula' ? 'source-defect' : 'data-defect', fixSource: k === 'hp-formula-mismatch' || k === 'hp-no-formula' ? 'decision' : 'self-structure', entries: ids, expected: k.endsWith('-off') || k.startsWith('hp') ? '条目自己的数据（自洽检查）；需对照 MM、MPMM 原文' : '代码表与格式定义', note: NOTE[k] ?? `怪物“${k}”`, selfCheck: true })
    expect(rec2.settle()).toEqual([])
  })

  it('SRD 怪物与 5e API 逐项对照：挑战等级、经验值、熟练、生命、护甲、速度、属性、抗性免疫、感官、语言', () => {
    if (!hasApiMonsters()) return
    const l = lib()
    const rec2 = new Recorder('g2c-monster-api')
    const api = apiMonsters()
    const byName = new Map(l.of('monster').filter((m) => m.pack === 'dnd5e2014-srd' || /^dnd5e2014-mm-\d+\.\d+\.\d+$/.test(m.pack)).map((m) => [fold(m.nameEn ?? ''), m]))
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    const missing: string[] = []
    let matched = 0
    let checks = 0
    for (const a of Object.values(api)) {
      const m = byName.get(fold(a.name))
      if (!m) { missing.push(a.name); continue }
      matched++
      const d = m.data
      const tag = `${m.id}（${a.name}）`
      const eq = (k: string, ok: boolean, info = ''): void => { checks++; if (!ok) add(k, info ? `${tag} ${info}` : tag) }
      eq('cr', crValue(d.cr) === a.challenge_rating, `数据=${String(crValue(d.cr))} API=${a.challenge_rating}`)
      eq('xp-table', XP_BY_CR[String(a.challenge_rating)] === a.xp, `表=${XP_BY_CR[String(a.challenge_rating)]} API=${a.xp}`)
      eq('prof-table', profByCr(a.challenge_rating) === a.proficiency_bonus, `表=${profByCr(a.challenge_rating)} API=${a.proficiency_bonus}`)
      eq('hp', rec(d.hp).average === a.hit_points, `数据=${String(rec(d.hp).average)} API=${a.hit_points}`)
      eq('hp-roll', str(rec(d.hp).formula).replace(/\s/g, '') === a.hit_points_roll.replace(/\s/g, ''), `数据=${str(rec(d.hp).formula)} API=${a.hit_points_roll}`)
      const ac = arr(d.ac).map(rec)[0]
      eq('ac', ac?.value === a.armor_class[0].value, `数据=${String(ac?.value)} API=${a.armor_class[0].value}`)
      const ab = rec(d.abilities)
      eq('abilities', ab.str === a.strength && ab.dex === a.dexterity && ab.con === a.constitution && ab.int === a.intelligence && ab.wis === a.wisdom && ab.cha === a.charisma, '属性值')
      const walk = parseInt(String(a.speed.walk ?? '0'), 10)
      eq('speed-walk', (rec(d.speed).walk ?? 0) === walk, `数据=${String(rec(d.speed).walk)} API=${walk}`)
      for (const mode of ['fly', 'swim', 'climb', 'burrow']) if (a.speed[mode] !== undefined) eq(`speed-${mode}`, rec(d.speed)[mode] === parseInt(String(a.speed[mode]), 10), `数据=${String(rec(d.speed)[mode])} API=${String(a.speed[mode])}`)
      const sameSet = (x: string[], y: string[]): boolean => [...x].sort().join(',') === [...y].sort().join(',')
      const dmgWords = (s: string[]): string[] => s.flatMap((x) => x.split(/[;,]/)).map((x) => x.trim().toLowerCase()).filter((x) => DAMAGE.includes(x))
      eq('immune', sameSet(strs(d.immune), dmgWords(a.damage_immunities)), `数据=${strs(d.immune).join(',')} API=${dmgWords(a.damage_immunities).join(',')}`)
      eq('resist', sameSet(strs(d.resist), dmgWords(a.damage_resistances)), `数据=${strs(d.resist).join(',')} API=${dmgWords(a.damage_resistances).join(',')}`)
      eq('vulnerable', sameSet(strs(d.vulnerable), dmgWords(a.damage_vulnerabilities)), `数据=${strs(d.vulnerable).join(',')} API=${dmgWords(a.damage_vulnerabilities).join(',')}`)
      eq('condition-immune', sameSet(strs(d.conditionImmune), a.condition_immunities.map((x) => x.index)), `数据=${strs(d.conditionImmune).join(',')} API=${a.condition_immunities.map((x) => x.index).join(',')}`)
      const sv = Object.fromEntries(a.proficiencies.filter((p) => p.proficiency.index.startsWith('saving-throw-')).map((p) => [p.proficiency.index.slice(13).slice(0, 3), p.value]))
      eq('saves', JSON.stringify(Object.entries(sv).sort()) === JSON.stringify(Object.entries(rec(d.saves)).sort()), `数据=${JSON.stringify(d.saves)} API=${JSON.stringify(sv)}`)
      const sk = Object.fromEntries(a.proficiencies.filter((p) => p.proficiency.index.startsWith('skill-')).map((p) => [p.proficiency.index.slice(6).replace(/-/g, ' '), p.value]))
      eq('skills', JSON.stringify(Object.entries(sk).sort()) === JSON.stringify(Object.entries(rec(d.skills)).sort()), `数据=${JSON.stringify(d.skills)} API=${JSON.stringify(sk)}`)
      eq('passive', d.passive === a.senses.passive_perception, `数据=${String(d.passive)} API=${String(a.senses.passive_perception)}`)
    }
    rec2.stat('c1', 'apiMonsters', Object.keys(api).length)
    rec2.stat('c1', 'matchedWithApi', matched)
    rec2.stat('c1', 'checksWithApi', checks)
    // 5e API 自己有抄错的地方（读过怪物图鉴原文：基础蜥蜴人 AC、石化蜥蜴 AC、邪教狂信者生命值、灰矮人生命骰、闪现犬/巨蜘蛛被动察觉、鳄鱼游泳速度、经验值表里的 25/50 等），
    // 所以 API 只做参考，不当裁判：数据与 API 不同的个数记成统计，真正的核对以怪物图鉴原文为准（见 g2c-monster-mm）。
    for (const [k, ids] of Object.entries(bad)) rec2.stat('c1', `apiDiffers.${k}`, ids.length)
    void missing
    expect(rec2.settle()).toEqual([])
  })
})
