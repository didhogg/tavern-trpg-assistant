import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { OUT_ROOT, RAW_DB, REPORT_DIR } from '../lib/paths'

/** 第 3 步（R3）：把原样库里存的上游代码还原到 <OUT_ROOT>/_upstream/<库>/，在纯 Node 里加载，记录哪些能跑、哪些不能。
 *  只读源码、不改写、不装任何包。结果写到 report/上游代码试跑.md。 */
type Lib = 'cn' | 'en'
interface Probe { module: string; ok: boolean; note: string }

export function materialize(lib: Lib): string {
  const root = join(OUT_ROOT, '_upstream', lib)
  const db = new DatabaseSync(RAW_DB, { readOnly: true })
  for (const r of db.prepare('SELECT file, body FROM code WHERE lib=?').iterate(lib) as Iterable<{ file: string; body: string }>) {
    const p = join(root, r.file)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, r.body)
  }
  db.close()
  return root
}

const CORE = ['js/locale.js', 'js/parser.js', 'js/utils.js', 'js/utils-ui.js', 'js/render.js', 'js/render-dice.js', 'js/hist.js', 'js/utils-dataloader.js', 'js/utils-config.js']

async function tryImport(root: string, rel: string): Promise<Probe> {
  if (!existsSync(join(root, rel))) return { module: rel, ok: true, note: '（这个仓库没有该文件，跳过）' }
  try { await import(pathToFileURL(join(root, rel)).href); return { module: rel, ok: true, note: '' } } catch (e) { return { module: rel, ok: false, note: String((e as Error).message).split('\n')[0]!.slice(0, 200) } }
}

export async function runTrial(): Promise<void> {
  // 一个进程只加载一个库（上游代码把 Parser 等挂在全局上，两份会互相覆盖）
  const lib = (process.argv[3] ?? 'en') as Lib
  const root = materialize(lib)
  const core: Probe[] = []
  // 中文仓库 node/ 下的 i18n 需要 npm 包 i18n，先如实试一次；浏览器版 js/locale.js 不需要
  if (lib === 'cn') core.push(await tryImport(root, 'node/locale/i18n.js'))
  for (const m of CORE) core.push(await tryImport(root, m))
  const converters: Probe[] = []
  for (const f of readdirSync(join(root, 'js/converter')).filter((x) => /^converter(utils)?-.*\.js$/.test(x) && !/-ui/.test(x)).sort()) converters.push(await tryImport(root, `js/converter/${f}`))
  const g = globalThis as unknown as Record<string, any>
  const probes: string[] = []
  probes.push(`Parser 属性数：${g.Parser ? Object.keys(g.Parser).length : '未加载'}`)
  probes.push(`Renderer.tag 属性数：${g.Renderer?.tag ? Object.keys(g.Renderer.tag).length : '未加载'}`)
  probes.push(`Parser.CRS 条数：${g.Parser?.CRS?.length ?? '无'}；Parser.attAbvToFull('dex') = ${g.Parser?.attAbvToFull?.('dex') ?? '无'}；Parser.crToXp('5') = ${g.Parser?.crToXp?.('5') ?? '无'}`)
  try { const t = g.Renderer.dice.lang.getTree3('2d6+8'); probes.push(`骰子解析 getTree3('2d6+8')：得到语法树（根节点 ${Object.keys(t).join(',')}）`) } catch (e) { probes.push(`骰子解析失败：${(e as Error).message}`) }
  // 用英文库里的真实火球术，去掉标签数组，再让上游识别器重新算一遍
  const raw = new DatabaseSync(RAW_DB, { readOnly: true })
  const row = raw.prepare("SELECT body FROM raw WHERE lib='en' AND category='spell' AND name='Fireball' AND source='PHB'").get() as { body: string } | undefined
  if (row && converters.find((c) => c.module.endsWith('converterutils-spell.js'))?.ok) {
    const sp = await import(pathToFileURL(join(root, 'js/converter/converterutils-spell.js')).href)
    const orig = JSON.parse(row.body) as Record<string, unknown>
    const tags = ['damageInflict', 'savingThrow', 'miscTags', 'areaTags', 'spellAttack', 'abilityCheck', 'affectsCreatureType', 'scalingLevelDice', 'conditionInflict']
    for (const T of ['DamageInflictTagger', 'SavingThrowTagger', 'MiscTagsTagger', 'SpellAttackTagger', 'AbilityCheckTagger', 'AffectedCreatureTypeTagger']) {
      const c = structuredClone(orig)
      for (const k of tags) delete c[k]
      try { sp[T].tryRun(c, { cbWarning: () => {}, cbErr: () => {} }); probes.push(`${T}：重新算出 ${JSON.stringify(Object.fromEntries(tags.filter((k) => c[k] !== undefined).map((k) => [k, c[k]])))}；数据里原有 ${JSON.stringify(Object.fromEntries(tags.filter((k) => orig[k] !== undefined).map((k) => [k, orig[k]])))}`) } catch (e) { probes.push(`${T}：出错 ${(e as Error).message.slice(0, 120)}`) }
    }
  }
  raw.close()
  const tbl = (ps: Probe[]): string => ps.map((p) => `| ${p.module} | ${p.ok ? '能加载' : '失败'} | ${p.note.replace(/\|/g, '/')} |`).join('\n')
  const md = `# 上游代码试跑（${lib === 'cn' ? '中文仓库 2.39.0' : '英文仓库 2.36.1'}）\n\n运行环境：Node ${process.version}；没有安装任何 npm 包；代码从原样库还原到 \`_upstream/${lib}\`，未改写。\n\n## 核心模块\n\n| 模块 | 结果 | 说明 |\n|---|---|---|\n${tbl(core)}\n\n## js/converter 下的 ${converters.length} 个识别器模块\n\n能加载 ${converters.filter((c) => c.ok).length} 个，失败 ${converters.filter((c) => !c.ok).length} 个。\n\n${converters.some((c) => !c.ok) ? `| 模块 | 结果 | 说明 |\n|---|---|---|\n${tbl(converters.filter((c) => !c.ok))}\n` : ''}\n## 功能试跑\n\n${probes.map((p) => `- ${p}`).join('\n')}\n`
  mkdirSync(REPORT_DIR, { recursive: true })
  writeFileSync(join(REPORT_DIR, `上游代码试跑_${lib}.md`), md)
  console.log(md)
}
