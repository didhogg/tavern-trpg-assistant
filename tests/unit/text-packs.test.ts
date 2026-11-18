import { describe, expect, it, vi } from 'vitest'
import { TextPacks } from '../../src/library/text-packs'
import { TextService } from '../../src/library/texts'

const root = new URL('https://plugin.test/')
const files = {
  'manifest.json': { system: 'rules 1.0', modules: { addon: '1' } },
  'systems/rules/system.json': { languages: [{ lang: 'en', path: 'lang/en.json' }] },
  'modules/addon/module.json': { languages: [{ lang: 'en', path: 'lang/en.json' }] },
  'lang/en.json': { CORE: { Label: 'Core label' } },
  'systems/rules/lang/en.json': { RULE: { Label: 'Rule label' } },
  'modules/addon/lang/en.json': { ADDON: { Label: 'Addon label' } },
  'lang-packs.json': { packs: { zh: { files: [
    { package: 'system', id: 'rules', path: 'lang/zh.json' },
    { package: 'module', id: 'foreign', path: 'lang/zh.json' },
  ] } } },
  'systems/rules/lang/zh.json': { 'RULE.Label': '规则名' },
}
const fixtureFetch = () => vi.fn(async (url: URL | RequestInfo) => {
  const path = String(url).split('vendor/foundry/')[1]
  const value = files[path as keyof typeof files]
  return new Response(value ? JSON.stringify(value) : null, { status: value ? 200 : 404 })
}) as unknown as ReturnType<typeof vi.fn<typeof fetch>>

describe('公共语言包读取', () => {
  it('按登记包读取并缓存，不把英文回退或其他系统的同名键冒充中文', async () => {
    const fetcher = fixtureFetch()
    const packs = new TextPacks(root, fetcher)
    expect(await packs.resolve('cn', ['RULE.Label', 'CORE.Label'])).toEqual(['规则名', null])
    const count = fetcher.mock.calls.length
    expect(await packs.resolve('cn', ['RULE.Label'])).toEqual(['规则名'])
    expect(fetcher.mock.calls).toHaveLength(count)
    expect(fetcher.mock.calls.some(([url]) => String(url).includes('foreign'))).toBe(false)
  })
  it('英文按核心、系统、模块原始清单读取，不需要中文包', async () => {
    const packs = new TextPacks(root, fixtureFetch())
    expect(await packs.resolve('en', ['CORE.Label', 'RULE.Label', 'ADDON.Label'])).toEqual(['Core label', 'Rule label', 'Addon label'])
  })
  it('普通业务经公共取字服务读语言键，无须启动作者或结算小窗', async () => {
    const frame = vi.fn().mockRejectedValue(Error('不该开小窗'))
    const packs = new TextPacks(root, fixtureFetch())
    const texts = new TextService(frame, (cs, keys) => packs.resolve(cs, keys))
    expect(await texts.reader('cn').resolve([{ source: 'system', key: 'RULE.Label' }])).toEqual(['规则名'])
    expect(frame).not.toHaveBeenCalled()
  })
  it('文件读取失败后能重试，不缓存永久失败', async () => {
    const actual = fixtureFetch()
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null, { status: 503 })).mockImplementation(actual)
    const packs = new TextPacks(root, fetcher)
    await expect(packs.resolve('cn', ['RULE.Label'])).rejects.toThrow('503')
    expect(await packs.resolve('cn', ['RULE.Label'])).toEqual(['规则名'])
  })
  it('浏览器原生 fetch 保留全局接收者', async () => {
    const actual = fixtureFetch()
    const fetcher = function(this: unknown, ...args: Parameters<typeof fetch>) {
      expect(this).toBe(globalThis)
      return actual(...args)
    }
    expect(await new TextPacks(root, fetcher).resolve('cn', ['RULE.Label'])).toEqual(['规则名'])
  })
})
