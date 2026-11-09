// 把作者的自制结构定义（vendor/brew-schema/schema，见 tools/vendor-brew-schema.mjs）用 ajv 预编译成一个独立校验器，
// 压缩后输出 vendor/brew-schema/validator.js（提交进仓库；插件运行时第一次校验时按网址加载它，
// 不需要 ajv 编译器，也就不用 new Function，酒馆页面的安全策略禁止 eval 时照样能用）。
// 只在作者结构定义换了版本之后重跑：node tools/vendor-brew-schema.mjs && node tools/build-brew-validator.mjs配置照作者校验器 UtilAjv.getValidator()：
//   2020 草案、允许联合类型；忽略 version / markdownDescription 两个关键字；date 格式为 YYYY-MM-DD；
//   作者对 multipleOf 补了浮点修正（用 number-precision），这里用 ajv 自带的 multipleOfPrecision 做同样的事（编译产物不能带自定义函数）。
// 本结构里实际只用到 date 一种 format（grep 过），所以不需要 ajv-formats。
import Ajv2020 from 'ajv/dist/2020.js'
import standaloneCode from 'ajv/dist/standalone/index.js'
import { build } from 'esbuild'
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dir = join(root, 'vendor/brew-schema')
const source = JSON.parse(await readFile(join(dir, 'SOURCE.json'), 'utf8'))
const ENTRY = 'homebrew.json'

async function listJson(base) {
  const out = []
  for (const name of await readdir(base)) {
    const p = join(base, name)
    if ((await stat(p)).isDirectory()) out.push(...(await listJson(p)))
    else if (name.endsWith('.json')) out.push(p)
  }
  return out.sort()
}

const ajv = new Ajv2020({ allowUnionTypes: true, multipleOfPrecision: 12, inlineRefs: false, code: { source: true, esm: true } })
ajv.addKeyword({ keyword: 'version', validate: false })
ajv.addKeyword({ keyword: 'markdownDescription', validate: false })
ajv.addFormat('date', /^\d\d\d\d-\d\d-\d\d$/)

const schemaDir = join(dir, 'schema')
let count = 0
for (const file of await listJson(schemaDir)) {
  ajv.addSchema(JSON.parse(await readFile(file, 'utf8')), relative(schemaDir, file).replace(/\\/g, '/'))
  count++
}
ajv.addSchema(JSON.parse(await readFile(join(dir, 'remote/plutonium-scenes-shared.json'), 'utf8')), source.remote)

// 编译产物里的 require 换成 import，再用 esbuild 把 ajv 的两个运行时小函数一起打成单个压缩文件。
const code = standaloneCode(ajv, { validateBrew: ENTRY })
  .replace('require("ajv/dist/runtime/equal").default', '__equal.default')
  .replace('require("ajv/dist/runtime/ucs2length").default', '__ucs2length.default')
if (code.includes('require(')) throw new Error('编译产物里还有 require，需要补替换')
const entry = `import * as __equal from 'ajv/dist/runtime/equal.js'\nimport * as __ucs2length from 'ajv/dist/runtime/ucs2length.js'\n${code}`
const result = await build({ stdin: { contents: entry, resolveDir: root, loader: 'js' }, bundle: true, format: 'esm', minify: true, target: 'es2020', write: false, logLevel: 'warning' })
const header = `// 自动生成，不要手改。由 tools/build-brew-validator.mjs 从 vendor/brew-schema/schema（${source.package}@${source.version}，${source.license}）编译。\n`
const out = join(dir, 'validator.js')
await writeFile(out, header + result.outputFiles[0].text)
console.log(`已编译 ${count} 个结构文件 + 1 个外部引用 → vendor/brew-schema/validator.js（${(result.outputFiles[0].text.length / 1024 / 1024).toFixed(1)} MB）`)
