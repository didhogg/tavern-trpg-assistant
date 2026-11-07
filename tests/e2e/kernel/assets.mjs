// 只在测试中读取参考原件；Foundry 商业代码不会进入 vendor 或 dist。
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import yaml from 'js-yaml'
import { serverPackageData } from '../../../src/rules/kernel/packages.ts'

export const root = fileURLToPath(new URL('../../../', import.meta.url))
export const reference = process.env.TRPG_REFERENCE ?? '/Users/xxx/DND- reference（DO NO DELETE！）'
export const output = join(root, 'work/p3-2-a')
export const systemRoot = join(reference, 'dnd5e-6.1.x')
export const digest = value => createHash('sha256').update(value).digest('hex')

export async function pack(name) {
  const documents = []
  for (const path of (await readdir(join(systemRoot, 'packs/_source', name), { recursive: true })).sort()) {
    if (!/\.ya?ml$/.test(path)) continue
    const document = yaml.load(await readFile(join(systemRoot, 'packs/_source', name, path), 'utf8'))
    if (!document?._id || !document?._key) throw Error(`Pack source lacks author identity: ${name}/${path}`)
    if (!String(document._key).startsWith('!folders!')) documents.push(document)
  }
  if (!documents.length) throw Error(`No documents decoded: ${name}`)
  return documents
}

/** ⓪ 探路已转出的作者 5etools 物品里，取一件需同调的魔法武器（数据驱动，不写物品名单）。 */
async function convertedMagicItem() {
  const data = JSON.parse(await readFile(join(root, 'work/p3-2-measurement/effects-chrome.json'), 'utf8'))
  const row = (data.rows ?? []).find(r => r.kind === 'item' && r.type === 'weapon' && r.system?.attunement === 'required'
    && r.system?.magicalBonus && !r.error && !r.notAttempted)
  if (!row) throw Error('No converted attunement weapon in work/p3-2-measurement/effects-chrome.json')
  return {
    _id: digest(`${row.name}|${row.source}|item`).slice(0, 16),
    name: row.name,
    type: row.type,
    img: null,
    system: row.system,
    effects: (row.effects ?? []).map((effect, index) => ({ ...effect,
      _id: digest(`${row.name}|${row.source}|effect|${index}`).slice(0, 16) })),
  }
}

/** dnd5e 作者物品包里，挑一件“法杖、非施法活动消耗次数、带恢复周期”的物品（数据驱动，不写物品名单）。 */
async function chargedItem() {
  const items = await pack('items')
  const item = items.filter(i => i.type === 'equipment' && i.system?.type?.value === 'wand' && i.system?.uses?.recovery?.length
    && Object.values(i.system.activities ?? {}).some(a => a.type !== 'cast'
      && (a.consumption?.targets ?? []).some(t => t.type === 'itemUses')))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))[0]
  if (!item) throw Error('No charged wand with non-cast usage in dnd5e items pack')
  return {
    ...item,
    _id: digest(`${item.name}|${item._key}|charged`).slice(0, 16),
    effects: (item.effects ?? []).map((effect, index) => ({ ...effect,
      _id: digest(`${item.name}|charged|effect|${index}`).slice(0, 16) })),
  }
}

export async function assets() {
  const rawManifest = JSON.parse(await readFile(join(systemRoot, 'system.json'), 'utf8'))
  const manifest = serverPackageData(rawManifest, 'system')
  const compiled = await build({ entryPoints: [join(systemRoot, 'dnd5e.mjs')], bundle: true, write: false, metafile: true,
    format: 'iife', keepNames: true, logLevel: 'error', loader: { '.hbs': 'text', '.json': 'json' } })
  const heroes = await pack('heroes')
  // b 段：把一个 Plutonium 从作者 5etools 物品转出的魔法武器放进现成角色，用来测同调与魔法变体。
  // 转换结果取自 ⓪ 探路的全量输出（work/ 忽略目录，测试环境已有）；不手写物品数据。
  const magic = await convertedMagicItem()
  // b 段：再从 dnd5e 作者物品包挑一件带充能恢复、且用非施法活动消耗次数的法杖，测次数与恢复。
  const charged = await chargedItem()
  const host = heroes.slice().sort((a, b) => String(a._id).localeCompare(String(b._id)))[0]
  host.items ??= []
  host.items.push(magic, charged)
  const monsters = await pack('monsters')
  const templates = {}
  for (const path of await readdir(join(systemRoot, 'templates'), { recursive: true })) {
    if (path.endsWith('.hbs')) templates[`systems/dnd5e/templates/${path}`] = await readFile(join(systemRoot, 'templates', path), 'utf8')
  }
  const moduleRoots = { 'lib-wrapper': join(root, 'work/ref-extra/built/lib-wrapper'),
    plutonium: join(reference, 'plutonium-next-master/plutonium') }
  const modules = await Promise.all(Object.values(moduleRoots).map(async path => serverPackageData(JSON.parse(await readFile(join(path, 'module.json'), 'utf8')), 'module')))
  for (const [id, dir] of Object.entries(moduleRoots)) for (const path of await readdir(dir, { recursive: true })) {
    if (/\.(hbs|html)$/.test(path)) templates[`modules/${id}/${path}`] = await readFile(join(dir, path), 'utf8')
  }
  const packs = {}
  for (const description of rawManifest.packs) packs[`${manifest.id}.${description.name}`] = await pack(description.name)
  return { manifest, compiled, actors: [...heroes, ...monsters], heroes, monsters, templates, modules, moduleRoots, packs }
}

export async function save(name, data) {
  await mkdir(output, { recursive: true })
  await writeFile(join(output, name), JSON.stringify(data, null, 2) + '\n')
}
