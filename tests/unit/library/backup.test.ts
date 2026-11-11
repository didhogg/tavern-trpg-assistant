import { describe, expect, it } from 'vitest'
import { CustomLibrary } from '../../../src/library/custom'

describe('完整备份的作者存储分类（P5 核验）', () => {
  it('BrewUtil2 与 PrereleaseUtil 两个管理器都导出，不只读 HOMEBREW_2_STORAGE', async () => {
    const view = {
      kvGet: async (_codeSet: string, key: string) => key === 'HOMEBREW_2_STORAGE'
        ? [{ head: { docIdLocal: 'brew1', filename: 'brew.json' }, body: { _meta: { sources: [{ json: 'B' }] } } }]
        : key === 'PRERELEASE_STORAGE'
          ? [{ head: { docIdLocal: 'pre1', filename: 'pre.json' }, body: { _meta: { sources: [{ json: 'P' }] } } }]
          : null,
    }
    const lib = { currentView: async () => view }
    const scoped = { manage: { houseRules: async () => [], assignments: async () => new Map(), userScopes: async () => [] } }
    const custom = new CustomLibrary(lib as never, scoped as never, {} as never)
    const files = await custom.exportBackup()
    expect(Object.keys(files).sort()).toEqual(['brew/cn/brew.json', 'brew/cn/prerelease/pre.json', 'brew/en/brew.json', 'brew/en/prerelease/pre.json', 'house-rules.json', 'scopes.json'])
    expect(JSON.parse(files['brew/cn/prerelease/pre.json'])).toEqual({ _meta: { sources: [{ json: 'P' }] } })
  })

  it('恢复时试玩稿文件也走作者导入分流，不被丢掉', async () => {
    const imported: Array<{ setId: string; names: string[] }> = []
    const lib = { currentView: async () => ({ kvGet: async () => null }), brewImport: async (setId: string, files: Array<{ name: string }>) => { imported.push({ setId, names: files.map((f) => f.name) }); return { value: { added: [] }, errors: [], parse: {} } } }
    const scoped = { manage: { houseRules: async () => [], linkHouseRule: async () => undefined }, reset: () => undefined }
    const custom = new CustomLibrary(lib as never, scoped as never, {} as never)
    await custom.importBackup({ 'brew/cn/prerelease/pre.json': '{"_meta":{}}' })
    expect(imported).toEqual([{ setId: 'cn-brew', names: ['prerelease/pre.json'] }])
  })
})
