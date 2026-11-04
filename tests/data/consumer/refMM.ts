import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fold } from './util'
import { REFERENCE_ROOT } from '../../../tools/data/lib/io'

/** 本地核对材料：怪物图鉴中译文本（PDF 抽出的文字）。把每个怪物的数据块解析成结构。文件不存在时 hasMM() 为 false。 */
const FILE = join(REFERENCE_ROOT, '龙与地下城官方资料', 'txt', '龙与地下城 第五版 怪物图鉴 (wizard rpg) (z-library.sk, 1lib.sk, z-lib.sk).txt')
export const hasMM = (): boolean => existsSync(FILE)

export interface MMMonster {
  en: string; cn: string; ac: number; hp?: number; hpFormula?: string
  speed: Record<string, number>
  abilities: Partial<Record<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', number>>
  saves: Record<string, number>; skills: Record<string, number>
  passive?: number; cr?: string; xp?: number
}

const SKILL: Record<string, string> = { 欺瞒: 'deception', 洞悉: 'insight', 洞察: 'insight', 察觉: 'perception', 隐匿: 'stealth', 奥秘: 'arcana', 历史: 'history', 调查: 'investigation', 游说: 'persuasion', 巧手: 'sleight of hand', 医药: 'medicine', 宗教: 'religion', 运动: 'athletics', 杂技: 'acrobatics', 驯兽: 'animal handling', 威吓: 'intimidation', 自然: 'nature', 表演: 'performance', 求生: 'survival' }
const SAVE: Record<string, string> = { 力量: 'str', 敏捷: 'dex', 体质: 'con', 智力: 'int', 感知: 'wis', 魅力: 'cha' }
const SPEED: Record<string, string> = { 游泳: 'swim', 飞行: 'fly', 攀爬: 'climb', 掘穴: 'burrow' }

const norm = (s: string): string => s.replace(/⼒/g, '力').replace(/\s+/g, ' ').replace(/\+\s+(\d)/g, '+$1').replace(/-\s+(\d)/g, '-$1')

export function parseMM(): Map<string, MMMonster> {
  const lines = readFileSync(FILE, 'utf8').split('\n')
  const out = new Map<string, MMMonster>()
  for (let i = 0; i < lines.length; i++) {
    const head = /^(\S[^\n]*?) ([A-Z][A-Za-z'’\-,. ()/]+?)\s*$/.exec(lines[i].trim())
    if (!head) continue
    // 数据块的第一行 AC 必须紧跟在名字后面（最多隔 3 行），否则是正文里提到这个怪物的名字，不是它的数据块
    const near = norm(lines.slice(i, i + 4).join(' '))
    if (!/AC[:：]\s*\d+/.test(near)) continue
    let chunk = norm(lines.slice(i, i + 26).join(' '))
    if (!/HP[:：]\s*\d+/.test(chunk)) continue
    const acAt = chunk.search(/AC[:：]\s*\d+/)
    const end = /挑战等级[:：][^）)]*[）)]/.exec(chunk.slice(acAt))
    if (end) chunk = chunk.slice(0, acAt + end.index + end[0].length)
    const nextAc = chunk.slice(acAt + 4).search(/AC[:：]\s*\d+/)
    if (nextAc >= 0) chunk = chunk.slice(0, acAt + 4 + nextAc)
    const en = head[2].trim()
    if (out.has(fold(en))) continue
    const ac = Number(/AC[:：]\s*(\d+)/.exec(chunk)![1])
    const hp = /HP[:：]\s*(\d+)\s*[（(]([^）)]*)[）)]/.exec(chunk)
    const m: MMMonster = { en, cn: head[1].trim(), ac, hp: hp ? Number(hp[1]) : undefined, hpFormula: hp?.[2].replace(/\s/g, ''), speed: {}, abilities: {}, saves: {}, skills: {} }
    const sp = /速度[:：]\s*(.*?)\s*力量/.exec(chunk)?.[1] ?? ''
    for (const part of sp.split(/[，,]/)) {
      const n = /(\d+)\s*尺/.exec(part)
      if (!n) continue
      const key = Object.keys(SPEED).find((k) => part.includes(k))
      m.speed[key ? SPEED[key] : 'walk'] = Number(n[1])
    }
    for (const [cn, k] of Object.entries({ 力量: 'str', 敏捷: 'dex', 体质: 'con', 智力: 'int', 感知: 'wis', 魅力: 'cha' })) {
      const a = new RegExp(`${cn}\\s*(\\d+)\\s*[（(]`).exec(chunk)
      if (a) m.abilities[k as 'str'] = Number(a[1])
    }
    const sv = /豁免[:：]\s*(.*?)\s*(?:技能|伤害|状态|感官|语言|挑战)/.exec(chunk)?.[1]
    if (sv) for (const x of sv.matchAll(/(力量|敏捷|体质|智力|感知|魅力)\s*([+-]\d+)/g)) m.saves[SAVE[x[1]]] = Number(x[2])
    const sk = /技能[:：]\s*(.*?)\s*(?:伤害|状态|感官|语言|挑战)/.exec(chunk)?.[1]
    if (sk) for (const x of sk.matchAll(/(欺瞒|洞悉|洞察|察觉|隐匿|奥秘|历史|调查|游说|巧手|医药|宗教|运动|杂技|驯兽|威吓|自然|表演|求生)\s*([+-]\d+)/g)) m.skills[SKILL[x[1]]] = Number(x[2])
    const ps = /被动察觉\s*(\d+)/.exec(chunk)
    if (ps) m.passive = Number(ps[1])
    const cr = /挑战等级[:：]\s*([\d/]+)\s*[（(]\s*([\d,]+)\s*XP/.exec(chunk)
    if (cr) { m.cr = cr[1]; m.xp = Number(cr[2].replace(/,/g, '')) }
    out.set(fold(en), m)
  }
  return out
}
export const crNumber = (s: string): number => (s.includes('/') ? Number(s.split('/')[0]) / Number(s.split('/')[1]) : Number(s))
