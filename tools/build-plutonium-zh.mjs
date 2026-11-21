// Offline, local-only: the original private bundle is read once and never written.
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { localizePlutonium, nativeTranslations } from './lib/plutonium-zh.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const input = join(root, 'vendor/private/modules/plutonium/js/Bundle.js')
const output = join(root, 'vendor/private/lang/zh/modules/plutonium/js')
const evidence = join(root, 'work/p6-zh-pack')
const readJson = async (path) => JSON.parse(await readFile(join(root, path), 'utf8'))
const sha256 = (text) => createHash('sha256').update(text).digest('hex')

const original = await readFile(input, 'utf8').catch((error) => {
  if (error.code !== 'ENOENT') throw error
  throw new Error('本机缺少私人完整版 Plutonium。请先把原包放在 vendor/private/modules/plutonium/。', { cause: error })
})
const translations = nativeTranslations(
  await readJson('tools/plutonium-ui-translations.json'),
  await readJson('tools/approved-translations.json'),
)
const { bundle, rows, edits } = localizePlutonium(original, translations)
if (!edits) throw new Error('没有匹配到可确认的作者显示位置，保留原有构建')
const fingerprints = { original: sha256(original), localized: sha256(bundle) }
const totals = {
  approved: rows.length,
  localized: rows.filter((row) => row.translated > 0).length,
  mixed: rows.filter((row) => row.translated > 0 && row.retained > 0).length,
  retained: rows.filter((row) => !row.translated && row.retained > 0).length,
  unmatched: rows.filter((row) => !row.translated && !row.retained).length,
  replacements: rows.reduce((count, row) => count + row.translated, 0),
}

await mkdir(output, { recursive: true })
await mkdir(evidence, { recursive: true })
for (const [name, content] of [['Bundle.js', bundle], ['fingerprints.json', JSON.stringify(fingerprints, null, 2) + '\n']]) {
  const temporary = join(output, `.${name}.${process.pid}.tmp`)
  await writeFile(temporary, content)
  await rename(temporary, join(output, name))
}
await writeFile(join(evidence, 'step4-build.json'), JSON.stringify({ totals, fingerprints, rows }, null, 2) + '\n')
console.log('本机中文构建已生成。明细见 work/p6-zh-pack/step4-build.json。')
console.log(JSON.stringify(totals))
