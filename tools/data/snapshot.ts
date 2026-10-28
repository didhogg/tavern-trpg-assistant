import { join } from 'node:path'
import { listFiles, readJson, rel, REPO_ROOT, sha256File, writeText } from './lib/io'

const DATA_5ETOOLS = join(REPO_ROOT, 'reference', '5etools-cn-main（数据库）', 'data')
const DATA_FALLBACK = join(REPO_ROOT, 'reference', 'dnd-data-main（数据库）', 'data')

export interface Snapshot {
  formatVersion: 1
  files: Record<string, string>
}

/** 构建实际读取的输入文件；顺序固定，便于对照。 */
export async function snapshotFiles(): Promise<string[]> {
  const files: string[] = []
  const add = async (dir: string, predicate: (name: string) => boolean) => {
    for (const path of await listFiles(dir, predicate)) files.push(path)
  }
  await add(join(DATA_5ETOOLS, 'spells'), (n) => n.endsWith('.json'))
  await add(join(DATA_5ETOOLS, 'bestiary'), (n) => n.startsWith('bestiary-') && n.endsWith('.json'))
  await add(join(DATA_5ETOOLS, 'class'), (n) => n.endsWith('.json'))
  for (const name of [
    'items.json',
    'items-base.json',
    'magicvariants.json',
    'races.json',
    'backgrounds.json',
    'feats.json',
    'optionalfeatures.json',
    'conditionsdiseases.json',
    'variantrules.json',
    'actions.json',
    'tables.json',
    'loot.json',
    'books.json',
    'languages.json',
    'skills.json',
    'senses.json',
    'generated/gendata-spell-source-lookup.json',
  ]) {
    files.push(join(DATA_5ETOOLS, name))
  }
  await add(DATA_FALLBACK, (n) => n.endsWith('.json'))
  return files.sort()
}

export async function createSnapshot(): Promise<Snapshot> {
  const files: Record<string, string> = {}
  for (const path of await snapshotFiles()) files[rel(path)] = await sha256File(path)
  return { formatVersion: 1, files }
}

export function changedFiles(saved: Snapshot, current: Snapshot): string[] {
  const keys = new Set([...Object.keys(saved.files), ...Object.keys(current.files)])
  return [...keys].filter((key) => saved.files[key] !== current.files[key]).sort()
}

export async function loadSnapshot(): Promise<Snapshot | undefined> {
  try {
    return await readJson<Snapshot>(join(REPO_ROOT, 'tools', 'data', 'snapshot.json'))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}

export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  await writeText(join(REPO_ROOT, 'tools', 'data', 'snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`)
}
