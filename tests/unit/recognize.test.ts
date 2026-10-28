import { describe, expect, it } from 'vitest'
import { strToU8 } from 'fflate'
import { TrpgError } from '../../src/core/errors'
import { buildPackFile } from '../../src/core/packs/file'
import { recognizeFile, verifyDownload } from '../../src/core/packs/recognize'
import { sha256Hex } from '../../src/core/hash'
import { writeZip } from '../../src/core/packs/zip'
import { makeEntries, makePack } from '../helpers/fixtures'

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

describe('recognizeFile（U2 §2.3 识别顺序与提示）', () => {
  it('识别合法内容包并重新计算分类计数', () => {
    const rec = recognizeFile(makePack({}, [...makeEntries(2, 'spell'), ...makeEntries(1, 'monster', 'm')]), ctx)
    expect(rec.type).toBe('pack')
    if (rec.type !== 'pack') return
    expect(rec.manifest.entryCount).toBe(3)
    expect(rec.manifest.typeCounts).toEqual({ spell: 2, monster: 1 })
    expect(rec.sha256).toMatch(/^[0-9a-f]{64}$/)
  })

  it('不是 zip', () => {
    expect(codeOf(() => recognizeFile(strToU8('hello'), ctx))).toEqual({ code: 'E_NOT_ZIP', message: '无法识别：这不是 TRPG 跑团助手的文件' })
  })

  it('缺少说明文件', () => {
    const bytes = writeZip({ 'a.txt': 'x' })
    expect(codeOf(() => recognizeFile(bytes, ctx))).toEqual({ code: 'E_NO_MANIFEST', message: '无法识别：缺少说明文件，可能不是本扩展导出的文件' })
  })

  it('未知文件类型', () => {
    const bytes = writeZip({ 'trpg-manifest.json': JSON.stringify({ format: 'other', formatVersion: 1 }) })
    expect(codeOf(() => recognizeFile(bytes, ctx)).code).toBe('E_UNKNOWN_FORMAT')
  })

  it('文件格式版本高于当前', () => {
    const bytes = writeZip({ 'trpg-manifest.json': JSON.stringify({ format: 'trpg-pack', formatVersion: 99 }) })
    expect(codeOf(() => recognizeFile(bytes, ctx))).toEqual({ code: 'E_NEWER_FORMAT', message: '这个文件由更新版本的扩展创建，请先更新扩展' })
  })

  it('规则未安装', () => {
    const rec = () => recognizeFile(makePack({ ruleId: 'coc7' }), ctx)
    expect(codeOf(rec)).toEqual({ code: 'E_RULE_MISSING', message: '需要先安装规则『coc7』' })
  })

  it('要求更高的扩展版本', () => {
    expect(codeOf(() => recognizeFile(makePack({ minAppVersion: '9.0.0' }), ctx)).code).toBe('E_NEWER_APP')
  })

  it('条目结构不合法时指出第几项、名称与字段', () => {
    const bytes = writeZip({
      'trpg-manifest.json': JSON.stringify({ format: 'trpg-pack', formatVersion: 1, pack: { id: 'x', ruleId: 'dnd5e2014', kind: 'data', name: 'X', version: '1.0.0', entryCount: 2, typeCounts: {} } }),
      'entries/spell.json': JSON.stringify([{ id: 'a', type: 'spell', name: '火球术' }, { id: 'b', type: 'spell', name: '魔法飞弹', keywords: 'oops' }]),
    })
    expect(codeOf(() => recognizeFile(bytes, ctx))).toEqual({ code: 'E_BAD_CONTENT', message: '文件内容损坏：第 2 项「魔法飞弹」的 keywords 不合法' })
  })

  it('说明文件字段不合法', () => {
    const bytes = writeZip({ 'trpg-manifest.json': JSON.stringify({ format: 'trpg-pack', formatVersion: 1, pack: { id: 'x', ruleId: 'dnd5e2014', kind: 'data', name: 'X', version: 'abc', entryCount: 0 } }) })
    expect(codeOf(() => recognizeFile(bytes, ctx)).message).toBe('文件内容损坏：说明文件的 pack.version 不合法')
  })

  it('条目数量与说明不符视为损坏（文件被截断）', () => {
    const bytes = writeZip({
      'trpg-manifest.json': JSON.stringify({ format: 'trpg-pack', formatVersion: 1, pack: { id: 'x', ruleId: 'dnd5e2014', kind: 'data', name: 'X', version: '1.0.0', entryCount: 5, typeCounts: {} } }),
      'entries/spell.json': JSON.stringify(makeEntries(3)),
    })
    expect(codeOf(() => recognizeFile(bytes, ctx)).message).toBe('文件内容损坏：条目数量不符（说明为 5，实际 3）')
  })

  it('读取附带的图片资源', () => {
    const assets = new Map([['maps/cave.png', new Uint8Array([1, 2, 3])]])
    const rec = recognizeFile(makePack({}, makeEntries(1), assets), ctx)
    expect(rec.type === 'pack' && rec.assets.get('maps/cave.png')).toEqual(new Uint8Array([1, 2, 3]))
  })

  it('下载校验：大小或校验值不符时提示重试', () => {
    const bytes = makePack()
    expect(() => verifyDownload(bytes, { byteSize: bytes.length, sha256: sha256Hex(bytes) })).not.toThrow()
    expect(codeOf(() => verifyDownload(bytes, { byteSize: bytes.length, sha256: 'x' }))).toEqual({ code: 'E_CHECKSUM', message: '下载的文件不完整，请重试' })
    expect(codeOf(() => verifyDownload(bytes, { byteSize: bytes.length + 1, sha256: sha256Hex(bytes) })).code).toBe('E_CHECKSUM')
  })

  it('空条目的内容包合法', () => {
    const bytes = buildPackFile({ manifest: { id: 'empty', ruleId: 'dnd5e2014', kind: 'module', name: '空', version: '0.1.0' }, entries: [] })
    expect(recognizeFile(bytes, ctx).type).toBe('pack')
  })
})
