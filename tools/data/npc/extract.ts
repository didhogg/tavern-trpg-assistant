import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { REF_5ETOOLS } from '../lib/io'
import { PACK_BY_SOURCE } from '../config/books'
import type { PlannedEntry } from '../convert/plan'

interface Raw { [key: string]: unknown }
const isObj = (v: unknown): v is Raw => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown): string => typeof v === 'string' ? v : ''
const HAN = /[\u3400-\u9fff]/
const strip = (v: string): string => v.replace(/\{@(\w+) ([^}|]+)(?:\|([^}]+))?\}/g, (_m, _t: string, a: string, b?: string) => b || a)
const H_PAT = /(?:uses?|using) the \{@creature ([^}|]+)[^}]*\} stat|has the statistics of (?:a|an) \{@creature ([^}|]+)|is (?:a|an) \{@creature ([^}|]+)/i
const COMMON = new Set('Area Room Chapter Part Level Appendix Encounter Treasure Development Roleplaying Background Introduction Conclusion Aftermath Statistics Creature Guardian Sentry'.split(' '))
const NON_NPC = new Set(['Scufflecup', 'Castle Djaynai', 'The Platinum Rooms', "Ignis's Children", "Zalto's Prisoner", 'Giant Beavers', 'Hostel Visitors', 'Brightguard', 'Hellrider', 'Solamnia', 'Speaking Stones'])
const M_STOP = new Set(['They', 'He', 'She', 'It', 'Each', 'Both', 'These', 'Those', 'This', 'That', 'The', 'A', 'An', 'You', 'We', 'I', 'Characters', 'Players', 'Creatures', 'Creature', 'Anyone', 'Someone', 'Nothing', 'Everyone'])

function proper(name: string): boolean {
  if (!name || /[:\d]/.test(name) || NON_NPC.has(name)) return false
  const words = name.split(/\s+/).filter(Boolean)
  return words.length > 0 && words.every((w) => /^[A-Z]/.test(w)) && !words.some((w) => COMMON.has(w))
}
function firstTexts(node: Raw, out: string[] = []): string[] {
  const entries = node.entries
  if (!Array.isArray(entries)) return out
  for (const item of entries.slice(0, 2)) {
    if (typeof item === 'string') out.push(item)
    else if (isObj(item) && Array.isArray(item.entries)) for (const x of item.entries) if (typeof x === 'string') out.push(x)
  }
  return out
}
function firstString(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) { for (const x of value) { const s = firstString(x); if (s) return s } }
  else if (isObj(value)) { for (const x of Object.values(value)) { const s = firstString(x); if (s) return s } }
  return ''
}
function atPath(root: unknown, path: Array<string | number>): unknown {
  let cur: unknown = root
  for (const p of path) {
    if (typeof p === 'number') { if (!Array.isArray(cur)) return undefined; cur = cur[p] }
    else { if (!isObj(cur)) return undefined; cur = cur[p] }
  }
  return cur
}
function load(file: string): unknown {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) as unknown : undefined
}

export function extractNpcs(monsters: PlannedEntry[], sources: string[]): PlannedEntry[] {
  const byName = new Map<string, PlannedEntry>()
  const monsterNames = new Set<string>()
  for (const m of monsters) {
    if (m.type !== 'monster') continue
    for (const n of [m.name, m.nameEn]) if (n) byName.set(n.toLowerCase(), m)
    for (const n of [m.name, m.nameEn]) if (n) monsterNames.add(n.toLowerCase())
  }
  const out: PlannedEntry[] = []
  const seen = new Set<string>()
  for (const source of sources) {
    const enFile = join(REF_5ETOOLS, 'data-bak', 'adventure', `adventure-${source.toLowerCase()}.json`)
    const zhFile = join(REF_5ETOOLS, 'data', 'adventure', `adventure-${source.toLowerCase()}.json`)
    const en = load(enFile); const zh = load(zhFile)
    if (!en) continue
    const walk = (node: unknown, path: Array<string | number>, ancestors: Array<{ path: Array<string | number>; name: string; page: number }>): void => {
      if (Array.isArray(node)) { node.forEach((x, i) => walk(x, [...path, i], ancestors)); return }
      if (!isObj(node)) return
      const name = str(node.name)
      const page = typeof node.page === 'number' ? node.page : ancestors.at(-1)?.page ?? 0
      const nextAnc = name ? [...ancestors, { path, name, page }] : ancestors
      if (name && proper(name)) {
        const texts = firstTexts(node)
        for (const text of texts) {
          if (!new RegExp(`^\\s*(?:\\{@creature\\s+)?${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(?:\\||\\b)`, 'i').test(text)) continue
          const m = H_PAT.exec(text)
          if (!m) continue
          const creature = (m[1] || m[2] || m[3] || '').split('|')[0].trim()
          const target = byName.get(creature.toLowerCase())
          if (!target) break
          if (monsterNames.has(name.toLowerCase())) break
          const zhNode = isObj(atPath(zh, path)) ? atPath(zh, path) as Raw : undefined
          const zhName = str(zhNode?.name)
          const zhIntro = strip(firstString(zhNode?.entries))
          const enIntro = strip(firstString(node.entries))
          const npcName = HAN.test(zhName) ? zhName : name
          const id = `npc.${npcName === name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${source.toLowerCase()}`
          if (seen.has(id)) break
          seen.add(id)
          const chapter = [...ancestors].reverse().find((a) => a.name)?.name ?? source
          const heading = HAN.test(zhName) ? zhName : name
          const introText = zhIntro || enIntro
          const missing: string[] = []
          if (!HAN.test(zhName)) missing.push('zh')
          if (!introText) missing.push('intro')
          const credit = { by: '不全书', license: 'GPL-3.0', machine: false, missing, srd: false, structured: { by: '本项目', license: 'CC-BY-NC-SA-4.0' } }
          const i18n = { en: { name, fields: enIntro ? { intro: [{ p: enIntro }] } : {} } }
          const raw = {
            statblock: target.id,
            adventure: source,
            at: { chapter, ...(heading ? { heading } : {}) },
            ...(introText ? { intro: [{ p: introText.slice(0, 600) }] } : {}),
            confidence: 'high',
            summary: `具名 NPC · 使用「${target.name}」的数据`,
            credit,
            i18n,
          }
          out.push({
            key: `npc|${source}|${name}`,
            type: 'npc',
            raw,
            source,
            packId: PACK_BY_SOURCE.get(source)!,
            srd: false,
            name: npcName,
            nameEn: name,
            page,
            id,
            missingName: false,
            missingPage: false,
            context: { adventure: source },
          })
          break
        }
      }
      for (const [k, v] of Object.entries(node)) if (k !== 'entries' || Array.isArray(v)) walk(v, [...path, k], nextAnc)
    }
    walk(en, [], [])
  }
  // M 档：named {@creature Name} + stat、Name (use the X stat)、句首 Name uses the X stat。
  const mPat = /named \{@creature ([^}|]+)|([A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+){0,3})\s*\((?:use|uses|using) the \{@creature ([^}|]+)[^}]*\} stat|(?:^|[.!?] )([A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+){0,3}) (?:uses|use|using) the \{@creature ([^}|]+)[^}]*\} stat/g
  for (const source of sources) {
    const enFile = join(REF_5ETOOLS, 'data-bak', 'adventure', `adventure-${source.toLowerCase()}.json`)
    const zhFile = join(REF_5ETOOLS, 'data', 'adventure', `adventure-${source.toLowerCase()}.json`)
    const en = load(enFile); const zh = load(zhFile)
    if (!en) continue
    const walk = (node: unknown, path: Array<string | number>, ancestors: Array<{ name: string; page: number }>): void => {
      if (Array.isArray(node)) { node.forEach((x, i) => walk(x, [...path, i], ancestors)); return }
      if (isObj(node)) {
        const page = typeof node.page === 'number' ? node.page : ancestors.at(-1)?.page ?? 0
        const next = typeof node.name === 'string' && node.name ? [...ancestors, { name: node.name, page }] : ancestors
        for (const [k, v] of Object.entries(node)) if (k !== 'entries' || Array.isArray(v)) walk(v, [...path, k], next)
        return
      }
      if (typeof node !== 'string') return
      for (const m of node.matchAll(mPat)) {
        const name = (m[1] || m[2] || m[4] || '').trim()
        const creature = (m[3] || m[5] || '').split('|')[0].trim()
        if (!name || !proper(name) || M_STOP.has(name.split(/\s+/)[0]) || monsterNames.has(name.toLowerCase())) continue
        const target = byName.get(creature.toLowerCase())
        if (!target) continue
        const id = `npc.${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${source.toLowerCase()}`
        if (seen.has(id)) continue
        seen.add(id)
        const zhNode = atPath(zh, path)
        const zhText = typeof zhNode === 'string' ? strip(zhNode) : ''
        const enText = strip(node)
        const chapter = [...ancestors].reverse().find((a) => a.name)?.name ?? source
        const introText = zhText || enText
        const missing = ['zh', ...(introText ? [] : ['intro'])]
        out.push({
          key: `npc|${source}|${name}`,
          type: 'npc',
          raw: {
            statblock: target.id,
            adventure: source,
            at: { chapter, heading: name },
            ...(introText ? { intro: [{ p: introText.slice(0, 600) }] } : {}),
            confidence: 'medium',
            summary: `具名 NPC · 使用「${target.name}」的数据`,
            credit: { by: '不全书', license: 'GPL-3.0', machine: false, missing, srd: false, structured: { by: '本项目', license: 'CC-BY-NC-SA-4.0' } },
            i18n: { en: { name, fields: enText ? { intro: [{ p: enText.slice(0, 600) }] } : {} } },
          },
          source,
          packId: PACK_BY_SOURCE.get(source)!,
          srd: false,
          name,
          nameEn: name,
          page: 0,
          id,
          missingName: false,
          missingPage: false,
          context: { adventure: source },
        })
      }
    }
    walk(en, [], [])
  }
  return out
}
