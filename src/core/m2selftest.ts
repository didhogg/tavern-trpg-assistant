import { uuid } from './ids'
import { stableStringify } from './hash'
import { createServices } from './services'
import { fetchCatalog, downloadPack } from './packs/catalog'
import { loadBuiltinPack } from './packs/builtinFile'
import { resolveCatalogUrl } from './packs/catalogUrl'
import type { Entry, InstalledPack } from '../schemas/pack'
import type { RecognizedPack } from './packs/recognize'

export interface M2Step {
  name: string
  ok: boolean
  skipped?: boolean
  detail?: string
}

const BOOK_NAMES: Record<string, string> = {
  PHB: '玩家手册', DMG: '城主指南', MM: '怪物图鉴', XGE: '珊娜萨的万事指南', TCE: '塔莎的万事坩埚',
  SCAG: '剑湾冒险者指南', VGM: '瓦罗怪物指南', MTF: '魔邓肯的众敌卷册', MPMM: '魔邓肯巨献：多元宇宙的怪物', BMT: '万象无常书',
}

function sourceLine(entry: Entry): string {
  const src = entry.data.src as { book?: string; page?: number } | undefined
  const credit = entry.data.credit as { by?: string; license?: string } | undefined
  return `出自《${BOOK_NAMES[src?.book ?? ''] ?? src?.book ?? '未知'}》第 ${src?.page ?? 0} 页 · 中文：${credit?.by ?? '未知'}（${credit?.license ?? '未知'}）`
}

const builtinBytes = () => loadBuiltinPack('dnd5e2014-srd')

function catalogUrl(): string {
  return resolveCatalogUrl({ catalogUrl: 'https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json' })
}

/** D1 §12 驾驶员第 2 项的 5 步；只在临时数据库运行，不触碰真实数据。 */
export async function runM2SelfTest(onStep?: (step: M2Step) => void): Promise<M2Step[]> {
  const steps: M2Step[] = []
  const s = createServices({ dbName: `tavern-trpg-assistant-m2-${uuid()}`, appVersion: '99.0.0' })
  const emit = (step: M2Step) => {
    steps.push(step)
    onStep?.(step)
  }
  let failed = false
  const run = async (name: string, fn: () => Promise<Omit<M2Step, 'name' | 'ok'> | string | void>): Promise<void> => {
    if (failed) return
    try {
      const result = await fn()
      emit({ name, ok: true, ...(typeof result === 'string' ? { detail: result } : result) })
    } catch (error) {
      failed = true
      emit({ name, ok: false, detail: error instanceof Error ? error.message : String(error) })
    }
  }

  const installed: InstalledPack[] = []
  try {
    await run('安装内置 SRD 包', async () => {
      const status = await s.packs.installBuiltin(await builtinBytes())
      const pack = await s.db.packs.get('dnd5e2014-srd')
      if (!pack) throw new Error('内置 SRD 包未安装')
      installed.push(pack)
      return `${status}；${pack.entryCount} 条，${(pack.byteSize / 1024).toFixed(1)} KB`
    })

    await run('从数据仓库下载一个书籍包', async () => {
      let catalog
      try {
        catalog = await fetchCatalog({ url: catalogUrl() })
      } catch (error) {
        return { skipped: true, detail: `跳过：数据仓库尚未发布（${error instanceof Error ? error.message : String(error)}）` }
      }
      const target = catalog.packs.find((p) => p.id !== 'dnd5e2014-srd')
      if (!target) return { skipped: true, detail: '跳过：目录中没有可下载的书籍包' }
      const bytes = await downloadPack(target, { catalogUrl: catalogUrl() })
      const rec = s.packs.recognize(bytes)
      if (rec.type !== 'pack') throw new Error('下载的不是内容包')
      const pack = await s.packs.install(rec, { source: 'download' })
      installed.push(pack)
      return `${pack.name} v${pack.version}；${(bytes.length / 1024).toFixed(1)} KB，校验值一致`
    })

    await run('显示各包条数与 5 个抽样条目', async () => {
      const packs = await s.packs.list()
      const counts = packs.map((p) => `${p.name}：${p.entryCount} 条`).join('；')
      const samples: Entry[] = []
      for (const pack of packs) {
        const entries = await s.db.entries.where('packId').equals(pack.id).limit(2).toArray()
        for (const row of entries) {
          if (samples.length >= 5) break
          samples.push({ ...row, id: row.entryId })
        }
        if (samples.length >= 5) break
      }
      return {
        detail: [counts, ...samples.map((e, i) => `${i + 1}. ${e.name}｜${e.summary}｜${sourceLine(e)}`)].join('\n'),
      }
    })

    await run('人物规则数据抽样', async () => {
      const entries = await s.db.entries.toArray()
      const get = (id: string) => entries.find((e) => e.entryId === id)
      const wizard = get('class.wizard.phb')
      const barbarian = get('class.barbarian.phb')
      const dwarf = get('subrace.dwarf-mountain.phb')
      const tough = get('feat.tough.phb')
      const poisoned = get('condition.poisoned.phb')
      if (!wizard || !barbarian || !dwarf || !tough || !poisoned) throw new Error('抽样条目缺失（需要 SRD + 玩家手册）')
      const slots = (wizard.data.spellcasting as { slotsByLevel: Array<{ level: number; slots: number[] }> }).slotsByLevel[4].slots
      const scale = (entry: { data: Record<string, unknown> }, id: string, level: number): unknown => {
        const list = (entry.data.advancement as Array<Record<string, unknown>> | undefined) ?? []
        const item = list.find((a) => a.kind === 'scaleValue' && a.id === id)
        const table = (item?.scale ?? {}) as Record<string, unknown>
        for (let n = level; n >= 1; n--) if (table[String(n)] !== undefined) return table[String(n)]
        return undefined
      }
      const uses = scale(barbarian, 'rage-uses', 9)
      const damage = scale(barbarian, 'rage-damage', 9)
      const speed = (dwarf.data.speed as { walk?: number }).walk
      const resist = (dwarf.data.resist as string[] | undefined)?.join('、')
      const hp = (tough.data.effects as Array<{ kind: string; perLevel?: number }> | undefined)?.find((e) => e.kind === 'hpMax')?.perLevel
      const poisonedEffects = (poisoned.data.effects as Array<{ kind: string }> | undefined)?.map((e) => e.kind).join('、')
      return {
        detail: [
          `法师 5 级法术位：${slots.join('/')}`,
          `野蛮人 9 级狂暴：${String(uses)} 次，伤害 +${String(damage)}`,
          `山地矮人：速度 ${String(speed)} 尺，抗性 ${resist ?? '—'}`,
          `健壮：每级生命上限 +${String(hp)}`,
          `中毒：${poisonedEffects ?? '—'}`,
        ].join('\n'),
      }
    })

    await run('每种数据做一次导入 → 读取 → 使用 → 导出 → 再导入', async () => {
      const packs = await s.packs.list({ ruleId: 'dnd5e2014' })
      if (!packs.length) throw new Error('没有已安装的内容包')
      const all = await s.db.entries.toArray()
      const types = [...new Set(all.map((e) => e.type))].sort()
      const lines: string[] = []
      const failures: string[] = []
      for (const type of types) {
        const row = all.find((e) => e.type === type)!
        const original = await s.packs.exportPack(row.packId)
        const rec = s.packs.recognize(original) as RecognizedPack
        const again = rec.entries.find((e) => e.id === row.entryId)
        if (!again || stableStringify(again.data) !== stableStringify(row.data)) {
          failures.push(`${type}: ${row.entryId} 导出后内容不一致`)
          continue
        }
        await s.packs.install(rec, { source: 'import', resolution: 'overwrite' })
        const back = await s.db.entries.get([row.packId, row.entryId])
        if (!back || stableStringify(back.data) !== stableStringify(row.data)) {
          failures.push(`${type}: ${row.entryId} 再导入后内容不一致`)
          continue
        }
        lines.push(`✓ ${type}：${row.entryId}`)
      }
      const featurePack = packs.find((p) => p.content.features.length > 0)
      if (featurePack) {
        const before = stableStringify(featurePack.content.features)
        const exported = await s.packs.exportPack(featurePack.id)
        const rec = s.packs.recognize(exported) as RecognizedPack
        if (stableStringify(rec.features) !== before) failures.push(`功能定义：${featurePack.id} 导出后不一致`)
        await s.packs.install(rec, { source: 'import', resolution: 'overwrite' })
        lines.push(`✓ 功能定义：${featurePack.content.features.length} 个（规则选项原样保留）`)
      }
      lines.push('↷ 图片、冒险内容项：官方书籍包不含，跳过（由测试夹具覆盖）')
      if (failures.length) throw new Error(failures.join('；'))
      return lines.join('\n')
    })

    await run('清理测试数据库', async () => {
      const name = s.db.name
      s.db.close()
      await s.db.delete()
      const databases = typeof indexedDB.databases === 'function' ? await indexedDB.databases() : []
      if (databases.some((d) => d.name === name)) throw new Error('临时数据库未删除')
      return `${name} 已删除`
    })
  } finally {
    if (s.db.isOpen()) {
      s.db.close()
      await s.db.delete()
    }
  }
  return steps
}
