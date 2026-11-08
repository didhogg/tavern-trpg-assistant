// 把结算小窗要用的官方原件原样放进 vendor/foundry/（驾驶员 2026-11-07 决定 8：整份官方 foundry.mjs 无界面运行）。
// 清单不手抄：跑一次演示站官方完整启动（dnd5e + libWrapper + Plutonium），录下实际取过的每个文件，原样保存，
// 目录与 Foundry 服务器一致（scripts/、lang/、tours/、systems/dnd5e/、modules/<id>/），小窗用相对路径取。
// 资料包与 5etools 条目不进 vendor：小窗运行时向插件要（【库】）。
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { chromium } from 'playwright-core'
import { assets, root, systemRoot } from '../tests/e2e/kernel/assets.mjs'
import { bootOfficial, loadOfficial } from '../tests/e2e/kernel/official.mjs'

const out = join(root, 'vendor/foundry')
const DEMO = 'https://demo.foundryvtt.com'
const input = await assets()
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await (await browser.newContext({ bypassCSP: true })).newPage()
const responses = new Map()
page.on('response', async r => {
  const url = new URL(r.url())
  if (url.origin !== DEMO || r.status() !== 200) return
  responses.set(url.pathname, r)
})
let scripts, boot
try {
  const diagnostics = await loadOfficial(page, input.moduleRoots)
  scripts = diagnostics.requests.map(u => new URL(u).pathname.slice(1))
  boot = await bootOfficial(page, input, { upstreams: true, headlessFull: true })
  await page.waitForFunction(() => typeof game.modules.get('plutonium')?.api === 'object', null, { timeout: 15_000 })
  await rm(out, { recursive: true, force: true })
  const saved = []
  for (const [path, response] of responses) {
    const top = path.split('/')[1]
    // 页面本身与 5etools 条目（data/）不进 vendor；后者由【库】供给。
    if (['probe-blank-page', 'data', 'api'].includes(top)) continue
    const file = resolve(out, '.' + decodeURIComponent(path))
    if (!file.startsWith(out + sep)) throw Error(`Path escaped: ${path}`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, await response.body())
    saved.push(relative(out, file))
  }
  // 经官方连接读取的模板（全部来自系统与模块目录）也按原路径保存。
  const templates = [...new Set(boot.socketCalls.filter(c => c.event === 'template').map(c => c.args[0]))]
  for (const path of templates) {
    if (!(path in input.templates)) throw Error(`Template has no original source: ${path}`)
    const file = resolve(out, path)
    if (!file.startsWith(out + sep)) throw Error(`Path escaped: ${path}`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, input.templates[path])
    saved.push(path)
  }
  // dnd5e：原代码按探路方式打包（keepNames），连同清单与语言文件。
  await mkdir(join(out, 'systems/dnd5e/lang'), { recursive: true })
  await writeFile(join(out, 'systems/dnd5e/dnd5e.js'), input.compiled.outputFiles[0].text)
  await cp(join(systemRoot, 'system.json'), join(out, 'systems/dnd5e/system.json'))
  for (const l of JSON.parse(await readFile(join(systemRoot, 'system.json'), 'utf8')).languages) await cp(join(systemRoot, l.path), join(out, 'systems/dnd5e', l.path))
  // T5：Plutonium 原包 data/ 中【库】英文官方没有的补充文件原样带上。
  // 英文官方清单路径是 data/...，Plutonium 包内相对 data/ 的路径要补 data/ 前缀再比，不能拿相对路径直接比。
  const registry = JSON.parse(await readFile(join(root, 'src/library/sources.json'), 'utf8'))
  const en = registry.sources.find((it) => it.id === 'en-official')
  const enSet = registry.codeSets.en
  const listUrl = en.fileList.replaceAll('{repo}', enSet.repo).replaceAll('{commit}', enSet.commit)
  const tree = await (await fetch(listUrl, { headers: { 'user-agent': 'trpg-assistant-vendor' } })).json()
  if (!Array.isArray(tree.tree)) throw Error(`读不到英文官方文件清单：${listUrl}`)
  const provided = new Set(tree.tree.filter((it) => it.type === 'blob').map((it) => it.path))
  const plutoniumData = join(input.moduleRoots.plutonium, 'data')
  let dataFiles = 0
  let dataBytes = 0
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name)
      if (entry.isDirectory()) { await walk(file); continue }
      const rel = relative(plutoniumData, file).split(sep).join('/')
      if (provided.has(`data/${rel}`)) continue
      const dest = join(out, 'modules/plutonium/data', rel)
      await mkdir(dirname(dest), { recursive: true })
      await cp(file, dest)
      saved.push(relative(out, dest)); dataFiles++; dataBytes += (await stat(file)).size
    }
  }
  await walk(plutoniumData)
  for (const [id, dir] of Object.entries(input.moduleRoots)) {
    const manifest = JSON.parse(await readFile(join(dir, 'module.json'), 'utf8'))
    await mkdir(join(out, 'modules', id), { recursive: true })
    await cp(join(dir, 'module.json'), join(out, 'modules', id, 'module.json'))
    for (const path of [...(manifest.esmodules ?? []), ...(manifest.scripts ?? []), ...(manifest.languages ?? []).map(l => l.path)]) {
      await mkdir(dirname(join(out, 'modules', id, path)), { recursive: true })
      await cp(join(dir, path), join(out, 'modules', id, path))
    }
    for (const license of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) await cp(join(dir, license), join(out, 'modules', id, license)).catch(() => undefined)
  }
  const classic = scripts.filter(s => !s.endsWith('.mjs'))
  const html = ['<!doctype html>', '<html><head><meta charset="utf-8"><title>settlement kernel</title>',
    '<script src="../../dist/frame-early.js"></script>',
    ...classic.map(s => `<script src="${s}"></script>`),
    '<script type="module" src="../../dist/kernel-frame.js"></script>',
    '</head><body><aside id="tooltip"></aside></body></html>', ''].join('\n')
  await writeFile(join(out, 'frame.html'), html)
  await writeFile(join(out, 'manifest.json'), JSON.stringify({
    source: `${DEMO} (Foundry ${boot.release})`,
    // 与对照环境输入一致（tests/e2e/kernel/official.mjs）；版本号取自本次启动。
    release: { generation: Number(boot.release.split('.')[0]), build: Number(boot.release.split('.')[1]), channel: 'stable', node_version: 22 }, system: `dnd5e ${input.manifest.version}`,
    modules: Object.fromEntries(input.modules.map(m => [m.id, m.version])),
    classicScripts: classic, entry: 'scripts/foundry.mjs',
    files: saved.sort(), note: 'Recorded from one official headless boot by tools/vendor-foundry-kernel.mjs; do not edit by hand.',
  }, null, 2) + '\n')
  console.log(`vendor/foundry: ${saved.length} recorded files, ${classic.length} classic scripts, ${templates.length} templates`)
  console.log(`Plutonium data not provided by library: ${dataFiles} files, ${(dataBytes / 1048576).toFixed(1)} MB`)
} finally { await browser.close() }
