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

export async function assets() {
  const rawManifest = JSON.parse(await readFile(join(systemRoot, 'system.json'), 'utf8'))
  const manifest = serverPackageData(rawManifest, 'system')
  const compiled = await build({ entryPoints: [join(systemRoot, 'dnd5e.mjs')], bundle: true, write: false, metafile: true,
    format: 'iife', keepNames: true, logLevel: 'error', loader: { '.hbs': 'text', '.json': 'json' } })
  const heroes = await pack('heroes')
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
