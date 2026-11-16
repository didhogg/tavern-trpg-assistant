// e2e 资料副本的统一入口（tests/e2e/library/profile-clone.mjs）：克隆、护栏、自动清理、残留扫描。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanupOwn, freshProfile, sweepStale } from '../e2e/library/profile-clone.mjs'

let work: string
let base: string
beforeEach(() => {
  work = mkdtempSync(join(tmpdir(), 'clone-test-'))
  base = join(work, 'profile-base')
  mkdirSync(join(base, 'Default', 'IndexedDB'), { recursive: true })
  writeFileSync(join(base, 'Default', 'IndexedDB', 'db'), 'DATA')
  writeFileSync(join(base, 'Local State'), '{}')
  // Chrome 的锁文件是指向不存在目标的符号链接
  symlinkSync('host-123', join(base, 'SingletonLock'))
  writeFileSync(join(base, 'SingletonCookie'), '1')
})
afterEach(() => { cleanupOwn(); rmSync(work, { recursive: true, force: true }); vi.restoreAllMocks() })

const registry = (): string[] => (existsSync(join(work, '.clones')) ? readdirSync(join(work, '.clones')) : [])

describe('freshProfile', () => {
  it('克隆出一份内容相同的副本，删掉 Singleton* 锁文件，底座不动，并登记', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const to = join(work, 'profile-copy')
    expect(freshProfile(base, to, { workDir: work })).toBe(to)
    expect(readFileSync(join(to, 'Default', 'IndexedDB', 'db'), 'utf8')).toBe('DATA')
    expect(readdirSync(to).filter((n) => n.startsWith('Singleton'))).toEqual([])
    expect(lstatSync(join(base, 'SingletonLock'), { throwIfNoEntry: false })).toBeTruthy()
    expect(registry()).toHaveLength(1)
    const entry = JSON.parse(readFileSync(join(work, '.clones', registry()[0]), 'utf8'))
    expect(entry).toMatchObject({ path: to, pid: process.pid })
    expect(['clone', 'copy']).toContain(entry.method)
  })

  it('副本已存在就先删掉再建（和原来脚本的 rm + cp 一样）', () => {
    const to = join(work, 'profile-copy')
    mkdirSync(to)
    writeFileSync(join(to, 'old'), 'x')
    freshProfile(base, to, { workDir: work })
    expect(existsSync(join(to, 'old'))).toBe(false)
    expect(existsSync(join(to, 'Local State'))).toBe(true)
  })

  it('护栏：副本不在 work 目录下、就是底座、底座不存在，都拒绝，不会删任何东西', () => {
    expect(() => freshProfile(base, join(tmpdir(), 'elsewhere'), { workDir: work })).toThrow('必须放在')
    expect(() => freshProfile(base, base, { workDir: work })).toThrow('不能就是底座')
    expect(() => freshProfile(base, work, { workDir: work })).toThrow('必须放在')
    expect(() => freshProfile(join(work, 'nope'), join(work, 'x'), { workDir: work })).toThrow('底座不存在')
    expect(existsSync(join(base, 'Local State'))).toBe(true)
  })

  it('克隆不可用：退回普通复制并打印原因，内容照样对', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const to = join(work, 'profile-copy')
    freshProfile(base, to, { workDir: work, clone: () => { throw new Error('cp: not supported') } })
    expect(readFileSync(join(to, 'Default', 'IndexedDB', 'db'), 'utf8')).toBe('DATA')
    expect(warn.mock.calls.some((c) => String(c[0]).includes('改用普通复制'))).toBe(true)
    expect(JSON.parse(readFileSync(join(work, '.clones', registry()[0]), 'utf8')).method).toBe('copy')
  })

  it('克隆开始之前就已登记（克隆要十来秒，中途被杀也能扫到半成品）', () => {
    const to = join(work, 'profile-copy')
    let registeredDuringClone = false
    freshProfile(base, to, { workDir: work, clone: (_from: string, dest: string) => {
      registeredDuringClone = registry().length === 1
      mkdirSync(dest)
      writeFileSync(join(dest, 'partial'), 'x')
      throw new Error('interrupted') // 克隆失败 → 退回普通复制，登记仍在
    } })
    expect(registeredDuringClone).toBe(true)
  })

  it('keep：不登记、清理时不删', () => {
    const to = join(work, 'profile-copy')
    freshProfile(base, to, { workDir: work, keep: true })
    expect(registry()).toEqual([])
    cleanupOwn()
    expect(existsSync(to)).toBe(true)
  })
})

describe('清理', () => {
  it('cleanupOwn 删掉本进程登记的副本和登记文件，不碰底座和别的目录', () => {
    const a = freshProfile(base, join(work, 'profile-a'), { workDir: work })
    const other = join(work, 'profile-not-registered')
    mkdirSync(other)
    cleanupOwn()
    expect(existsSync(a)).toBe(false)
    expect(registry()).toEqual([])
    expect(existsSync(base)).toBe(true)
    expect(existsSync(other)).toBe(true)
  })

  it('sweepStale 只删进程已经死了的登记；活着的（含本进程）不动；登记指向 work 之外的不删那个路径', () => {
    const live = freshProfile(base, join(work, 'profile-live'), { workDir: work })
    const dead = spawnSync(process.execPath, ['-e', '0'])
    const deadPid = dead.pid
    const gone = join(work, 'profile-gone')
    mkdirSync(gone)
    const outside = mkdtempSync(join(tmpdir(), 'outside-'))
    writeFileSync(join(work, '.clones', 'dead-1.json'), JSON.stringify({ path: gone, pid: deadPid, at: 1 }))
    writeFileSync(join(work, '.clones', 'dead-2.json'), JSON.stringify({ path: outside, pid: deadPid, at: 1 }))
    const { removed, busy } = sweepStale({ workDir: work })
    expect(busy).toEqual([])
    expect(removed.sort()).toEqual([gone, outside].sort())
    expect(existsSync(gone)).toBe(false)
    expect(existsSync(outside)).toBe(true)
    expect(existsSync(live)).toBe(true)
    expect(registry()).toHaveLength(1)
    rmSync(outside, { recursive: true, force: true })
  })

  it('sweepStale 删不掉（孤儿进程还在写）：不抛错，保留登记，列进 busy，别的照常处理', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mkdirSync(join(work, '.clones'), { recursive: true })
    const deadPid = spawnSync(process.execPath, ['-e', '0']).pid
    const busyDir = join(work, 'profile-busy')
    const okDir = join(work, 'profile-ok')
    mkdirSync(busyDir)
    mkdirSync(okDir)
    writeFileSync(join(work, '.clones', 'a.json'), JSON.stringify({ path: busyDir, pid: deadPid, at: 1 }))
    writeFileSync(join(work, '.clones', 'b.json'), JSON.stringify({ path: okDir, pid: deadPid, at: 1 }))
    const out = sweepStale({ workDir: work, remove: (p: string) => { if (p === busyDir) throw new Error('ENOTEMPTY: directory not empty'); rmSync(p, { recursive: true, force: true }) } })
    expect(out).toEqual({ removed: [okDir], busy: [busyDir] })
    expect(readdirSync(join(work, '.clones'))).toEqual(['a.json'])
  })
})
