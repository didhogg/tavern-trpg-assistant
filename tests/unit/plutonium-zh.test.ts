import { describe, expect, it, vi } from 'vitest'
import { localizePlutonium, nativeTranslations } from '../../tools/lib/plutonium-zh.mjs'
import { sha256Hex } from '../../src/core/hash'
import { readPrivatePlutoniumZh } from '../../src/rules/kernel/frame/plutonium-zh'

describe('offline author display translation', () => {
  it('translates rendering calls, preserves option values, HTML structure and arbitrary data', () => {
    const source = [
      'veT(parent)`<button data-value="Light" title="Light">Light</button>`;',
      'veT`<button title=\'Light\' data-other=\'title="Light"\'>Light</button>`;',
      'panel.vee.appends("<p>Light</p>");',
      'if (value === "Light") save({name: "Light", label: "Light", ["Light"]: "Light"});',
      'new Filter({header: "Light"});',
      'veT`<script>let label = "Light"</script>`;',
    ].join('\n')
    const result = localizePlutonium(source, new Map([['Light', '轻型']]))
    expect(result.bundle).toContain('<button data-value="Light" title="轻型">轻型</button>')
    expect(result.bundle).toContain('title=\'轻型\' data-other=\'title="Light"\'')
    expect(result.bundle).toContain('<p>轻型</p>')
    expect(result.bundle.split('\n').slice(3)).toEqual(source.split('\n').slice(3))
    expect(localizePlutonium(source, new Map([['Light', '轻型']]))).toEqual(result)
  })

  it('keeps expressions and order, including nested display values, escapes translated HTML', () => {
    const source = 'veT`<p>Picked ${get(0)} / ${get(1)}</p><button data-value="${"OK"}">${confirmation || "OK"}</button>`;'
    const messages = new Map([['Picked {} / {}', '已选 {} / {}'], ['OK', '确定 <继续>']])
    const actual = localizePlutonium(source, messages)
    expect(actual.bundle).toBe('veT`<p>已选 ${get(0)} / ${get(1)}</p><button data-value="${"OK"}">${confirmation || "确定 &lt;继续&gt;"}</button>`;')
  })

  it('uses only final or explicitly approved rows and rejects lost placeholders', () => {
    const base = { lang: 'zh', package: 'plutonium', from: 'test' }
    const draft = [
      { ...base, text: 'Notice', translation: '稿件', status: 'final' as const },
      { ...base, text: 'Wait', translation: '等待', status: 'review' as const },
      { ...base, text: 'Choose {}', translation: '选择{}', status: 'review' as const },
    ]
    expect([...nativeTranslations(draft, [{ ...base, text: 'Notice', translation: '通知' }])]).toEqual([['Notice', '通知']])
    expect(() => nativeTranslations(draft, [{ ...base, text: 'Choose {}', translation: '选' }])).toThrow('空位')
  })
})

describe('private build fingerprints', () => {
  const original = 'original program'
  const localized = 'localized program'
  const folder = new URL('http://localhost/private/lang/zh/')

  it('reads the localized bytes only after verifying the original; rejects stale or corrupted files', async () => {
    const fingerprint = { original: sha256Hex(original), localized: sha256Hex(localized) }
    const fetchImpl = vi.fn(async (url: RequestInfo | URL) => String(url).endsWith('fingerprints.json')
      ? Response.json(fingerprint)
      : new Response(localized))
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      await expect(readPrivatePlutoniumZh(original, folder, fetchImpl)).resolves.toBe(localized)
      fetchImpl.mockClear()
      await expect(readPrivatePlutoniumZh('updated program', folder, fetchImpl)).resolves.toBeNull()
      expect(fetchImpl).toHaveBeenCalledTimes(1)
      fingerprint.localized = sha256Hex('different output')
      await expect(readPrivatePlutoniumZh(original, folder, fetchImpl)).resolves.toBeNull()
      expect(warning).toHaveBeenCalledTimes(2)
    } finally {
      warning.mockRestore()
    }
  })

  it('accepts an installation without the optional localized bundle', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 404 }))
    await expect(readPrivatePlutoniumZh(original, folder, fetchImpl)).resolves.toBeNull()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
