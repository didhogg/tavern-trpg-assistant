import { describe, expect, it } from 'vitest'
import { strToU8 } from 'fflate'
import { TrpgError } from '../../src/core/errors'
import { sha256Hex } from '../../src/core/hash'
import { assertPackPaths } from '../../src/core/packs/paths'
import { buildPackFile } from '../../src/core/packs/file'
import { recognizeFile, verifyDownload } from '../../src/core/packs/recognize'
import { writeZip } from '../../src/core/packs/zip'
import { makeEntries, makePack, PNG } from '../helpers/fixtures'

const ctx = { appVersion: '1.0.0', hasRule: (id: string) => id === 'dnd5e2014' }

function codeOf(fn: () => unknown): { code: string; message: string } {
  try {
    fn()
  } catch (e) {
    expect(e).toBeInstanceOf(TrpgError)
    return { code: (e as TrpgError).code, message: (e as TrpgError).message }
  }
  throw new Error('应当抛出错误')
}

function manifest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { id: 'x', ruleId: 'dnd5e2014', category: 'rules', name: 'X', version: '1.0.0', entryCount: 0, ...overrides }
}

function pack(files: Record<string, Uint8Array | string>, overrides: Record<string, unknown> = {}, version = 2): Uint8Array {
  return writeZip({
    'trpg-manifest.json': JSON.stringify({ format: 'trpg-pack', formatVersion: version, pack: manifest(overrides) }),
    ...files,
  })
}

function entry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { id: 'a', type: 'spell', name: '火球术', data: {}, ...overrides }
}

describe('recognizeFile（U2 §2.3 识别顺序与提示）', () => {
  it('识别合法内容包并重新计算分类计数', () => {
    const rec = recognizeFile(makePack({}, [...makeEntries(2, 'spell'), ...makeEntries(1, 'monster', 'm')]), ctx)
    expect(rec.type).toBe('pack')
    if (rec.type !== 'pack') return
    expect(rec.manifest.entryCount).toBe(3)
    expect(rec.manifest.typeCounts).toEqual({ spell: 2, monster: 1 })
    expect(rec.sha256).toMatch(/^[0-9a-f]{64}$/)
  })

  it('不是 zip / 缺少说明文件 / 未知格式 / 更高格式', () => {
    expect(codeOf(() => recognizeFile(strToU8('hello'), ctx))).toEqual({ code: 'E_NOT_ZIP', message: '无法识别：这不是 TRPG 跑团助手的文件' })
    expect(codeOf(() => recognizeFile(writeZip({ 'a.txt': 'x' }), ctx))).toEqual({ code: 'E_NO_MANIFEST', message: '无法识别：缺少说明文件，可能不是本扩展导出的文件' })
    expect(codeOf(() => recognizeFile(writeZip({ 'trpg-manifest.json': JSON.stringify({ format: 'other', formatVersion: 1 }) }), ctx)).code).toBe('E_UNKNOWN_FORMAT')
    expect(codeOf(() => recognizeFile(writeZip({ 'trpg-manifest.json': JSON.stringify({ format: 'trpg-pack', formatVersion: 99 }) }), ctx))).toEqual({ code: 'E_NEWER_FORMAT', message: '这个文件由更新版本的扩展创建，请先更新扩展' })
  })

  it('规则未安装 / 要求更高扩展 / 数据版本 v1、v2 接受、v3 拒绝', () => {
    expect(codeOf(() => recognizeFile(makePack({ ruleId: 'coc7' }), ctx))).toEqual({ code: 'E_RULE_MISSING', message: '需要先安装规则『coc7』' })
    expect(codeOf(() => recognizeFile(makePack({ minAppVersion: '9.0.0' }), ctx)).code).toBe('E_NEWER_APP')
    expect((recognizeFile(pack({ 'entries/spell.json': '[]' }, { dataVersion: 1 }), ctx) as { manifest: { dataVersion: number } }).manifest.dataVersion).toBe(1)
    expect((recognizeFile(pack({ 'entries/spell.json': '[]' }, { dataVersion: 2 }), ctx) as { manifest: { dataVersion: number } }).manifest.dataVersion).toBe(2)
    expect(codeOf(() => recognizeFile(pack({ 'entries/spell.json': '[]' }, { dataVersion: 3 }), ctx))).toEqual({ code: 'E_NEWER_DATA', message: '这个内容包由更新版本的扩展制作，请先更新扩展' })
  })

  it('条目结构、说明文件、条目数量不合法', () => {
    const badEntry = pack({ 'entries/spell.json': JSON.stringify([entry({ id: 'a' }), entry({ id: 'b', name: '魔法飞弹', keywords: 'oops' })]) }, { entryCount: 2 })
    expect(codeOf(() => recognizeFile(badEntry, ctx))).toEqual({ code: 'E_BAD_CONTENT', message: '文件内容损坏：第 2 项「魔法飞弹」的 keywords 不合法' })
    const badVersion = pack({}, { version: 'abc' })
    expect(codeOf(() => recognizeFile(badVersion, ctx)).message).toBe('文件内容损坏：说明文件的 version 不合法')
    const mismatch = pack({ 'entries/spell.json': JSON.stringify(makeEntries(3)) }, { entryCount: 5 })
    expect(codeOf(() => recognizeFile(mismatch, ctx)).message).toBe('文件内容损坏：条目数量不符（说明为 5，实际 3）')
  })

  it('路径只允许 a-z 0-9 / . _ -，且不能有 .. 或开头 /', () => {
    for (const name of ['entries/中文.json', 'entries/../x.json', '/entries/x.json']) {
      expect(codeOf(() => recognizeFile(pack({ [name]: '[]' }, { entryCount: 0 }), ctx)).code).toBe('E_BAD_CONTENT')
    }
  })

  it('禁止 .js .mjs .html .htm .svg 与未知顶层目录', () => {
    for (const name of ['entries/x.js', 'entries/x.mjs', 'entries/x.html', 'entries/x.htm', 'entries/x.svg', 'scripts/x.json']) {
      expect(codeOf(() => recognizeFile(pack({ [name]: '{}' }, { entryCount: 0 }), ctx)).code).toBe('E_FORBIDDEN_FILE')
    }
  })

  it('文件数与解压总量上限', () => {
    const files: Record<string, Uint8Array> = {}
    for (let i = 0; i < 20_001; i++) files[`entries/${i}.json`] = new Uint8Array(1)
    expect(codeOf(() => assertPackPaths(Object.keys(files), files, 2))).toEqual({ code: 'E_TOO_LARGE', message: '文件过大或文件数过多，无法导入' })
    const huge = { 'entries/huge.json': { length: 256 * 1024 * 1024 + 1 } } as unknown as Record<string, Uint8Array>
    expect(codeOf(() => assertPackPaths(['entries/huge.json'], huge, 2))).toEqual({ code: 'E_TOO_LARGE', message: '文件过大或文件数过多，无法导入' })
  })

  it('图片：文件名是哈希、哈希一致、是 png/jpeg/webp/gif、清单一一对应', () => {
    const hash = sha256Hex(PNG)
    const good = pack({ 'entries/spell.json': '[]', [`blobs/${hash}`]: PNG }, { entryCount: 0, blobs: [{ hash, mime: 'image/png', size: PNG.length }] })
    const rec = recognizeFile(good, ctx)
    expect(rec.type === 'pack' && rec.blobs.size).toBe(1)
    const badName = pack({ 'entries/spell.json': '[]', 'blobs/notahash': PNG }, { entryCount: 0 })
    expect(codeOf(() => recognizeFile(badName, ctx)).code).toBe('E_BAD_CONTENT')
    const badHash = pack({ 'entries/spell.json': '[]', [`blobs/${'a'.repeat(64)}`]: PNG }, { entryCount: 0, blobs: [{ hash: 'a'.repeat(64), mime: 'image/png', size: PNG.length }] })
    expect(codeOf(() => recognizeFile(badHash, ctx)).message).toBe('文件内容损坏：图片「aaaaaaaaaaaa」的哈希不一致')
    const notImage = new Uint8Array([1, 2, 3])
    const notImageHash = sha256Hex(notImage)
    const badType = pack({ 'entries/spell.json': '[]', [`blobs/${notImageHash}`]: notImage }, { entryCount: 0, blobs: [{ hash: notImageHash, mime: 'image/png', size: 3 }] })
    expect(codeOf(() => recognizeFile(badType, ctx)).message).toBe(`文件内容损坏：图片「${notImageHash}」不合法`)
    const missing = pack({ 'entries/spell.json': '[]' }, { entryCount: 0, blobs: [{ hash, mime: 'image/png', size: PNG.length }] })
    expect(codeOf(() => recognizeFile(missing, ctx)).message).toBe('文件内容损坏：缺少图片或图片清单不一致')
    const big = new Uint8Array(10 * 1024 * 1024 + 1)
    big.set(PNG)
    const bigHash = sha256Hex(big)
    const tooBig = pack({ 'entries/spell.json': '[]', [`blobs/${bigHash}`]: big }, { entryCount: 0, blobs: [{ hash: bigHash, mime: 'image/png', size: big.length }] })
    expect(codeOf(() => recognizeFile(tooBig, ctx)).message).toContain('过大')
  })

  it('$ref：包内解析、ext 必须有后备、pack 必须声明', () => {
    const entryWith = (data: Record<string, unknown>) => JSON.stringify([entry({ data })])
    const missingItem = pack({ 'entries/spell.json': entryWith({ x: { $ref: 'item', id: 'nope' } }) }, { entryCount: 1 })
    expect(codeOf(() => recognizeFile(missingItem, ctx)).message).toContain('引用了不存在的内容')
    const missingExt = pack({ 'entries/spell.json': entryWith({ x: { $ref: 'ext', lineage: 'l', id: 'nope' } }) }, { entryCount: 1 })
    expect(codeOf(() => recognizeFile(missingExt, ctx)).message).toContain('引用了不存在的内容')
    const undeclaredPack = pack({ 'entries/spell.json': entryWith({ x: { $ref: 'pack', packId: 'other', entryId: 'x' } }) }, { entryCount: 1 })
    expect(codeOf(() => recognizeFile(undeclaredPack, ctx)).message).toContain('引用了不存在的包')
    const fallback = pack({ 'entries/spell.json': entryWith({ x: { $ref: 'ext', lineage: 'l', id: 'nope' } }), 'adventure/fallback.json': JSON.stringify({ items: [{ kind: 'person', id: 'nope', name: '后备', data: { origin: { lineage: 'l', itemId: 'nope' } } }] }) }, { entryCount: 1 })
    expect(() => recognizeFile(fallback, ctx)).not.toThrow()
  })

  it('修改版：target.packId 必须在 requires 中，且同一 target 只能一次', () => {
    const override = { override: { target: { packId: 'other', entryId: 'x' }, mode: 'patch' } }
    const bad = pack({ 'entries/item.json': JSON.stringify([entry({ type: 'item', ...override })]) }, { entryCount: 1 })
    expect(codeOf(() => recognizeFile(bad, ctx)).message).toContain('未声明为依赖')
    const ok = pack({ 'entries/item.json': JSON.stringify([entry({ type: 'item', ...override })]) }, { entryCount: 1, relationships: { requires: [{ id: 'other' }], recommends: [], conflicts: [] } })
    expect(() => recognizeFile(ok, ctx)).not.toThrow()
    const twice = pack({ 'entries/item.json': JSON.stringify([entry({ type: 'item', ...override }), entry({ id: 'b', type: 'item', ...override })]) }, { entryCount: 2, relationships: { requires: [{ id: 'other' }], recommends: [], conflicts: [] } })
    expect(codeOf(() => recognizeFile(twice, ctx)).message).toContain('被修改了两次')
  })

  it('formatVersion 1 兼容：kind/dependsOn/assets 折算为 category/relationships/blobs', () => {
    const hash = sha256Hex(PNG)
    const bytes = writeZip({
      'trpg-manifest.json': JSON.stringify({ format: 'trpg-pack', formatVersion: 1, pack: { id: 'old', ruleId: 'dnd5e2014', kind: 'module', name: '旧包', version: '1.0.0', entryCount: 1, dependsOn: [{ id: 'dnd5e2014-srd' }] } }),
      'entries/spell.json': JSON.stringify([entry({ image: 'art/a.png' })]),
      'assets/art/a.png': PNG,
    })
    const rec = recognizeFile(bytes, ctx)
    expect(rec.type).toBe('pack')
    if (rec.type !== 'pack') return
    expect(rec.manifest.category).toBe('adventure')
    expect(rec.manifest.relationships.requires).toEqual([{ id: 'dnd5e2014-srd' }])
    expect(rec.entries[0].image).toEqual({ $asset: hash })
    expect(rec.blobs.get(hash)?.bytes).toEqual(PNG)
  })

  it('下载校验：大小或校验值不符时提示重试', () => {
    const bytes = makePack()
    expect(() => verifyDownload(bytes, { byteSize: bytes.length, sha256: sha256Hex(bytes) })).not.toThrow()
    expect(codeOf(() => verifyDownload(bytes, { byteSize: bytes.length, sha256: 'x' }))).toEqual({ code: 'E_CHECKSUM', message: '下载的文件不完整，请重试' })
  })

  it('空条目的内容包合法', () => {
    const bytes = buildPackFile({ manifest: { id: 'empty', ruleId: 'dnd5e2014', category: 'adventure', name: '空', version: '0.1.0' }, entries: [] })
    expect(recognizeFile(bytes, ctx).type).toBe('pack')
  })
})
