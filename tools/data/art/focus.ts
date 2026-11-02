import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import smartcrop from 'smartcrop-sharp'
import { loadRawData } from '../extract/load'
import { REPO_ROOT } from '../lib/io'
import { monsterTokenUrl, portraitUrl, type TokenLike } from './urls'

type Raw = Record<string, unknown>
const OUT = join(REPO_ROOT, 'tools', 'data', 'out')
const CACHE = join(OUT, 'art-cache')
const FOCUS = join(REPO_ROOT, 'tools', 'data', 'art', 'focus.json')
const SHEET = join(OUT, 'art-sheet.html')
const THRESHOLD = 0.8
const isObj = (v: unknown): v is Raw => !!v && typeof v === 'object' && !Array.isArray(v)
const sha = (v: string | Buffer): string => createHash('sha256').update(v).digest('hex')

export interface ArtMonster {
  source: string
  name: string
  nameEn: string
  token?: string
  portrait?: string
}

export function collectArt(data: { monsters: Raw[]; fluff?: Array<{ kind: string; raw: Raw }> }): ArtMonster[] {
  const fluff = new Map<string, Raw>()
  for (const f of data.fluff ?? []) if (f.kind === 'monster') fluff.set(`${String(f.raw.source)}|${String(f.raw.ENG_name ?? f.raw.name)}`, f.raw)
  const out = new Map<string, ArtMonster>()
  for (const m of data.monsters) {
    const source = String(m.source ?? '')
    const name = String(m.name ?? '')
    const nameEn = String(m.ENG_name ?? name)
    const f = fluff.get(`${source}|${nameEn}`) ?? fluff.get(`${source}|${name}`)
    const images = Array.isArray(f?.images) ? f!.images as Raw[] : []
    const portrait = portraitUrl(isObj(images[0]?.href) ? images[0].href as { type?: string; path?: string; url?: string } : undefined)
    const token = monsterTokenUrl(m as TokenLike, source, nameEn)
    const key = portrait ?? token ?? `${source}|${nameEn}`
    if (!out.has(key)) out.set(key, { source, name, nameEn, token, portrait })
  }
  return [...out.values()]
}

async function download(url: string): Promise<Buffer> {
  mkdirSync(CACHE, { recursive: true })
  const file = join(CACHE, sha(url))
  if (existsSync(file)) return readFileSync(file)
  let last: unknown
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'tavern-trpg-d12b/1.0' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      writeFileSync(file, buf)
      return buf
    } catch (e) {
      last = e
      await new Promise((r) => setTimeout(r, 2000 * 2 ** i))
    }
  }
  throw last instanceof Error ? last : new Error(String(last))
}

async function gray(buffer: Buffer, long: number): Promise<{ data: Buffer; w: number; h: number }> {
  const img = sharp(buffer).rotate().resize({ width: long, height: long, fit: 'inside', withoutEnlargement: true }).grayscale()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  return { data, w: info.width, h: info.height }
}

interface Focus { sha256: string; w: number; h: number; x: number; y: number; size: number; method: 'token-match' | 'smartcrop'; score?: number; token?: string; error?: string }
type TokenStatus = 200 | string

async function matchToken(cv: any, portrait: Buffer, token: Buffer): Promise<{ score: number; x: number; y: number; size: number } | undefined> {
  const p = await gray(portrait, 768)
  const t = await gray(token, 256)
  const pmat = cv.matFromArray(p.h, p.w, cv.CV_8UC1, p.data)
  const tmat = cv.matFromArray(t.h, t.w, cv.CV_8UC1, t.data)
  const mask = cv.Mat.zeros(t.h, t.w, cv.CV_8UC1)
  cv.circle(mask, new cv.Point(t.w / 2, t.h / 2), Math.floor(Math.min(t.w, t.h) * 0.4), new cv.Scalar(255), -1)
  let best: { score: number; x: number; y: number; size: number } | undefined
  const minDim = Math.min(p.w, p.h)
  try {
    for (let d = Math.floor(minDim * 0.15); d <= minDim; d = Math.floor(d * 1.15)) {
      for (const flip of [false, true]) {
        const tm = new cv.Mat()
        cv.resize(tmat, tm, new cv.Size(d, d), 0, 0, cv.INTER_LINEAR)
        const mk = new cv.Mat()
        cv.resize(mask, mk, new cv.Size(d, d), 0, 0, cv.INTER_NEAREST)
        const use = new cv.Mat()
        if (flip) cv.flip(tm, use, 1); else tm.copyTo(use)
        const result = new cv.Mat()
        try {
          cv.matchTemplate(pmat, use, result, cv.TM_CCORR_NORMED, mk)
          const mm = cv.minMaxLoc(result)
          const score = Number(mm.maxVal)
          if (!best || score > best.score) {
            const full = d / 0.8
            best = { score: Number.isFinite(score) ? score : 0, x: (mm.maxLoc.x + d / 2) / p.w, y: (mm.maxLoc.y + d / 2) / p.h, size: Math.min(1, full / minDim) }
          }
        } finally { result.delete(); use.delete(); mk.delete(); tm.delete() }
      }
    }
  } finally { pmat.delete(); tmat.delete(); mask.delete() }
  return best
}

async function focusOne(cv: any, m: ArtMonster): Promise<Focus | undefined> {
  if (!m.portrait) return undefined
  try {
    const portrait = await download(m.portrait)
    const meta = await sharp(portrait).metadata()
    const w = meta.width ?? 0; const h = meta.height ?? 0
    if (!w || !h) throw new Error('无法读取图片尺寸')
    let token: Buffer | undefined
    if (m.token) { try { token = await download(m.token) } catch { token = undefined } }
    if (token) {
      const hit = await matchToken(cv, portrait, token)
      if (hit && hit.score >= THRESHOLD) return { sha256: sha(portrait), w, h, x: hit.x, y: hit.y, size: hit.size, method: 'token-match', score: hit.score, token: m.token }
    }
    const crop = await smartcrop.crop(portrait, { width: Math.min(w, h), height: Math.min(w, h), minScale: 0.5 })
    const c = crop.topCrop
    return { sha256: sha(portrait), w, h, x: (c.x + c.width / 2) / w, y: (c.y + c.height / 2) / h, size: c.width / Math.min(w, h), method: 'smartcrop', ...(m.token ? { token: m.token } : {}) }
  } catch (e) {
    return { sha256: '', w: 0, h: 0, x: 0, y: 0, size: 0, method: 'smartcrop', error: e instanceof Error ? e.message : String(e) }
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const at = i++; out[at] = await fn(items[at]) }
  }))
  return out
}

function round(v: number): number { return Math.round(v * 1000) / 1000 }
function stable(obj: Record<string, unknown>): string {
  const sorted = Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]))
  return `${JSON.stringify(sorted, null, 2)}\n`
}

async function main(): Promise<void> {
  const sheet = process.argv.includes('--sheet')
  const data = await loadRawData()
  const art = collectArt(data)
  const all = art.filter((m) => m.portrait)
  const limit = Number(process.env.ART_LIMIT ?? 0)
  const offset = Number(process.env.ART_OFFSET ?? 0)
  let existingRaw: Record<string, unknown> = {}
  try { existingRaw = JSON.parse(readFileSync(FOCUS, 'utf8')) as Record<string, unknown> } catch { existingRaw = {} }
  const existingTokens: Record<string, TokenStatus> = (existingRaw.tokens as Record<string, TokenStatus> | undefined) ?? {}
  delete existingRaw.tokens
  const existing = existingRaw as Record<string, Focus>
  const withPortrait = all.filter((m) => !existing[m.portrait!]).slice(offset, limit || undefined)
  console.log(`怪物 ${art.length}，有立绘 ${all.length}，已缓存焦点 ${Object.keys(existing).length}，本轮 ${withPortrait.length}`)
  const cv = await import('@techstark/opencv-js').then((m) => m.default ?? m)
  const out: Record<string, Focus> = { ...existing }
  const results: Focus[] = []
  for (let start = 0; start < withPortrait.length; start += 20) {
    const chunk = withPortrait.slice(start, start + 20)
    const rs = await mapLimit(chunk, 4, (m) => focusOne(cv as any, m))
    chunk.forEach((m, i) => {
      const r = rs[i]
      if (!r || !m.portrait) return
      results.push(r)
      out[m.portrait] = {
        sha256: r.sha256, w: r.w, h: r.h, x: round(r.x), y: round(r.y), size: round(r.size), method: r.method,
        ...(r.score !== undefined ? { score: round(r.score) } : {}),
        ...(r.token ? { token: r.token } : {}),
        ...(r.error ? { error: r.error } : {}),
      }
    })
    writeFileSync(FOCUS, stable(out as Record<string, unknown>))
  }
  const tokenUrls = [...new Set(art.map((m) => m.token).filter((x): x is string => !!x))]
  const tokenLimit = Number(process.env.ART_TOKEN_LIMIT ?? 0)
  const probe = tokenUrls.slice(0, tokenLimit || undefined)
  const tokens: Record<string, TokenStatus> = { ...existingTokens }
  for (let start = 0; start < probe.length; start += 50) {
    const chunk = probe.slice(start, start + 50)
    const statuses = await mapLimit(chunk, 4, async (url) => { try { await download(url); return 200 as const } catch (e) { return e instanceof Error ? e.message : String(e) } })
    chunk.forEach((url, i) => { tokens[url] = statuses[i] })
    writeFileSync(FOCUS, stable({ ...out, tokens } as Record<string, unknown>))
    console.log(`token 探测 ${Math.min(start + 50, probe.length)}/${probe.length}`)
  }
  writeFileSync(FOCUS, stable({ ...out, tokens } as Record<string, unknown>))
  const allResults = Object.values(out)
  const scores = allResults.filter((r) => r.method === 'token-match' && r.score !== undefined).map((r) => r.score!)
  const matched = scores.length
  const smart = allResults.filter((r) => r.method === 'smartcrop' && !r.error).length
  const errors = allResults.filter((r) => r.error).length
  const tokenErrors = Object.entries(tokens).filter(([, v]) => v !== 200)
  console.log(`完成：有立绘 ${all.length}，token-match ${matched}，smartcrop ${smart}，错误 ${errors}，token 不可达 ${tokenErrors.length}`)
  if (tokenErrors.length) console.log(`token 不可达：${tokenErrors.slice(0, 10).map(([u, e]) => `${u} (${e})`).join('；')}`)
  if (scores.length) console.log(`token 分数 min ${Math.min(...scores).toFixed(3)} / p50 ${scores.sort((a,b)=>a-b)[Math.floor(scores.length/2)].toFixed(3)} / max ${Math.max(...scores).toFixed(3)}`)
  if (sheet) writeSheet(art, out)
}

function writeSheet(art: ArtMonster[], focus: Record<string, Focus>): void {
  const rows: string[] = []
  const take = (pred: (m: ArtMonster) => boolean, n: number): ArtMonster[] => art.filter(pred).slice(0, n)
  const matched = take((m) => !!m.portrait && focus[m.portrait]?.method === 'token-match', 60)
  const smart = take((m) => !!m.portrait && focus[m.portrait]?.method === 'smartcrop' && !focus[m.portrait]?.error, 40)
  const tokenOnly = take((m) => !m.portrait && !!m.token, 20)
  for (const [kind, list] of [['token-match', matched], ['smartcrop', smart], ['token-only', tokenOnly]] as const) {
    for (const m of list) {
      const f = m.portrait ? focus[m.portrait] : undefined
      const img = m.portrait ? `<img src="${m.portrait}" />` : ''
      const token = m.token ? `<img src="${m.token}" />` : ''
      const box = f && !f.error ? `<div class="box" style="left:${(f.x - f.size / 2) * 100}%;top:${(f.y - f.size / 2) * 100}%;width:${f.size * 100}%;height:${f.size * 100}%"></div>` : ''
      rows.push(`<figure class="${kind}"><div class="portrait">${img}${box}</div><div class="token">${token}</div><figcaption>${kind}<br>${m.source} / ${m.nameEn}${f?.score !== undefined ? `<br>${f.score.toFixed(3)}` : ''}</figcaption></figure>`)
    }
  }
  const html = `<!doctype html><meta charset="utf-8"><title>D1.2b 头像抽查</title><style>body{background:#111;color:#ddd;font:13px system-ui;margin:20px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}figure{margin:0;background:#1d1d1d;padding:8px;border-radius:8px}.portrait{position:relative;height:240px;display:flex;align-items:center;justify-content:center;overflow:hidden}.portrait img{max-width:100%;max-height:100%}.box{position:absolute;border:2px solid #ffd166;box-sizing:border-box}.token{height:96px;display:flex;align-items:center;justify-content:center}.token img{max-height:90px;border-radius:50%}figcaption{margin-top:6px;color:#aaa;font-size:11px}</style><h1>D1.2b 头像抽查</h1><div class="grid">${rows.join('')}</div>`
  writeFileSync(SHEET, html)
  console.log(`抽查页：${SHEET}（${rows.length} 格）`)
}

if (process.argv[1]?.endsWith('focus.ts')) main().catch((e) => { console.error(e); process.exit(1) })
