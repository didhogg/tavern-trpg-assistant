import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fold } from './util'

/** 从 PHB 中译文本解析第 11 章的各职业法术列表（法术名取英文名，忽略大小写与标点）。文件不存在返回 undefined。 */
const FILE = join(process.cwd(), 'reference', '龙与地下城官方资料', 'txt', '5eDnD_玩家手册PHB_中译v1.72版.txt')
const CLASS: Array<[RegExp, string]> = [[/^吟游诗人法术/, 'bard'], [/^牧师法术/, 'cleric'], [/^德鲁伊法术/, 'druid'], [/^圣武士法术/, 'paladin'], [/^游侠法术/, 'ranger'], [/^术士法术/, 'sorcerer'], [/^(魔契师|邪术师)法术/, 'warlock'], [/^法师法术/, 'wizard']]

export const hasPhbText = (): boolean => existsSync(FILE)

/** 中译 PHB 文本里两处英文拼写错误（Speak With Animal 少了 s；Wall of Throns），按书上的正确拼写更正 */
const TYPO: Record<string, string> = { speakwithanimal: 'speakwithanimals', wallofthrons: 'wallofthorns' }

export function phbSpellLists(): Record<string, Record<number, string[]>> {
  const lines = readFileSync(FILE, 'utf8').split('\n').map((s) => s.trim())
  const start = lines.findIndex((s, i) => s.startsWith('吟游诗人法术') && lines[i + 1]?.startsWith('Spells'))
  const end = lines.findIndex((s, i) => i > start && s.startsWith('法术详述 Spell Descriptions'))
  const out: Record<string, Record<number, string[]>> = {}
  let cls = ''
  let lvl = 0
  let open = false
  for (const line of lines.slice(start, end)) {
    const c = CLASS.find(([re]) => re.test(line))
    if (c) { cls = c[1]; out[cls] = {}; open = false; continue }
    if (!cls || line === '' || /^Spells$/.test(line) || /PDF|^\d+$/.test(line)) continue
    const h = /^(\d) 环/.exec(line)
    if (h) { lvl = Number(h[1]); out[cls][lvl] ??= []; open = false; continue }
    const m = /^[^A-Za-z]+\s+([A-Za-z].*)$/.exec(line) // “中文名 English Name”
    if (m && /[一-鿿]/.test(line)) { out[cls][lvl].push(fold(m[1])); open = true; continue }
    if (open && /^[A-Za-z]/.test(line)) out[cls][lvl][out[cls][lvl].length - 1] += fold(line) // 英文名折行
  }
  for (const byLevel of Object.values(out)) for (const names of Object.values(byLevel)) names.forEach((n, i) => { names[i] = TYPO[n] ?? n })
  return out
}
