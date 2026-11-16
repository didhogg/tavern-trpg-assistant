// e2e 底座与统一端口（tests/e2e/library/e2e-base.mjs）、静态服务的端口占用报错（static.mjs）。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanupOwn } from '../e2e/library/profile-clone.mjs'
import { E2E_PORT, baseDir, freshFromBase } from '../e2e/library/e2e-base.mjs'
import { startStatic } from '../e2e/library/static.mjs'

let work: string
beforeEach(() => { work = mkdtempSync(join(tmpdir(), 'e2e-base-test-')) })
afterEach(() => { cleanupOwn(); rmSync(work, { recursive: true, force: true }) })

describe('底座', () => {
  it('统一端口是一个常量；底座目录按内核区分；内核名不对就报错', () => {
    expect(Number.isInteger(E2E_PORT)).toBe(true)
    expect(baseDir('chrome', work)).toBe(join(work, 'profile-e2e-base-chrome'))
    expect(baseDir('webkit', work)).toBe(join(work, 'profile-e2e-base-webkit'))
    expect(() => baseDir('firefox', work)).toThrow('浏览器内核')
  })
  it('底座不存在：报错里写明怎么造（npm run e2e:base），不会悄悄新建空资料', () => {
    expect(() => freshFromBase('chrome', 'demo', { workDir: work })).toThrow('npm run e2e:base')
    expect(existsSync(join(work, 'profile-demo-chrome'))).toBe(false)
  })
  it('从底座克隆出这个测试自己的副本；改副本不动底座', () => {
    const base = baseDir('chrome', work)
    mkdirSync(join(base, 'Default'), { recursive: true })
    writeFileSync(join(base, 'Default', 'db'), 'BASE')
    const copy = freshFromBase('chrome', 'demo', { workDir: work })
    expect(copy).toBe(join(work, 'profile-demo-chrome'))
    expect(readFileSync(join(copy, 'Default', 'db'), 'utf8')).toBe('BASE')
    writeFileSync(join(copy, 'Default', 'db'), 'CHANGED')
    expect(readFileSync(join(base, 'Default', 'db'), 'utf8')).toBe('BASE')
  })
})

describe('静态服务', () => {
  it('端口被占用：报清楚的错（写明是端口 / 可能两个测试同时跑），不偷偷换端口', async () => {
    const first = await startStatic({ port: 0 })
    const port = Number(new URL(first.url).port)
    await expect(startStatic({ port })).rejects.toThrow(`端口 ${port} 已被占用`)
    first.server.close()
  })
})
