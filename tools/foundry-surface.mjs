// 生成适配底座清单：保留实测符号，并用 TypeScript AST 收集原程序的显式 Foundry 依赖。
// 这里只统计，不生成 Foundry 实现，不复制商业源码，也不把未执行分支当成不需要。
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { build } from 'esbuild'

const root = fileURLToPath(new URL('../', import.meta.url))
const reference = process.env.TRPG_REFERENCE ?? '/Users/xxx/DND- reference（DO NO DELETE！）'
const systemRoot = join(reference, 'dnd5e-6.1.x')
const output = join(root, 'work/p3-2-a')
const measurePath = process.env.FOUNDRY_MEASUREMENT ?? join(root, 'work/p3-2-route/measure-result.json')
const measured = JSON.parse(await readFile(measurePath, 'utf8'))
const bundle = await build({ entryPoints: [join(systemRoot, 'dnd5e.mjs')], bundle: true, write: false,
  metafile: true, keepNames: true, logLevel: 'error', loader: { '.hbs': 'text', '.json': 'json' } })
const files = Object.keys(bundle.metafile.inputs).filter(f => f.endsWith('.mjs')).map(f => resolve(f))
files.push(join(reference, 'plutonium-next-master/plutonium/js/Bundle.js'))
const entries = new Map()
const fingerprints = []
for (const file of files.sort()) {
  const source = await readFile(file, 'utf8')
  fingerprints.push({ path: file.replace(reference, '$REFERENCE'), sha256: createHash('sha256').update(source).digest('hex') })
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  function chain(node) {
    if (ts.isIdentifier(node)) return node.text
    if (ts.isPropertyAccessExpression(node)) {
      const prefix = chain(node.expression)
      return prefix && `${prefix}.${node.name.text}`
    }
    if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression)) {
      const prefix = chain(node.expression)
      return prefix && `${prefix}.${node.argumentExpression.text}`
    }
    return null
  }
  function visit(node) {
    // 解开 const {ArrayField, SchemaField} = foundry.data.fields 这类作者写法。
    if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer) {
      const parent = chain(node.initializer)
      if (parent?.startsWith('foundry.')) for (const binding of node.name.elements) {
        const key = binding.propertyName?.getText(tree) ?? binding.name.getText(tree)
        if (binding.dotDotDotToken || !ts.isIdentifier(binding.name)) continue
        const path = `${parent}.${key}`
        let record = entries.get(path)
        if (!record) { record = { path, uses: 0, kinds: new Set(), examples: [] }; entries.set(path, record) }
        record.uses++; record.kinds.add('destructured binding')
        if (record.examples.length < 3) record.examples.push({ file: file.replace(reference, '$REFERENCE'),
          line: tree.getLineAndCharacterOfPosition(binding.getStart(tree)).line + 1 })
      }
    }
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const path = chain(node)
      if (path?.startsWith('foundry.') && !(ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node)) {
        let record = entries.get(path)
        if (!record) { record = { path, uses: 0, kinds: new Set(), examples: [] }; entries.set(path, record) }
        record.uses++
        record.kinds.add(ts.isNewExpression(node.parent) ? 'construct' : ts.isCallExpression(node.parent) ? 'call' : 'reference')
        if (record.examples.length < 3) record.examples.push({ file: file.replace(reference, '$REFERENCE'),
          line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1 })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
}
const report = {
  source: 'TypeScript AST + existing Chrome precise coverage; observed coverage is not an implementation-size estimate',
  measured: { inputs: measured.inputs, errors: measured.pageErrors, routes: measured.summary.routes,
    writebackExtra: measured.summary.writebackExtraCore },
  staticReferences: [...entries.values()].map(r => ({ ...r, kinds: [...r.kinds].sort() })).sort((a, b) => a.path.localeCompare(b.path)),
  limitations: ['Computed and indirect dependencies require runtime checks.', 'Game, Combat, UI-labelled symbols were excluded by the earlier measurement; retain that exclusion as evidence, not proof they are unnecessary.',
    'Existing measurement did not execute the full Plutonium lifecycle or full advancement application.'],
  fingerprints,
}
await mkdir(output, { recursive: true })
const path = join(output, 'surface.json')
await writeFile(path, JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ output: path, measuredSymbols: measured.summary.routes.routeB_owners,
  staticReferences: report.staticReferences.length, sourceFiles: files.length,
  measurementSavedErrorSample: measured.pageErrors.length, root: dirname(path) }))
