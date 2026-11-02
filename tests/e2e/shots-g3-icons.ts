// G3 批 4：15 个生物类型图标总图（game-icons.net，CC BY 3.0）。
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { CREATURE_ICONS } from '../../src/ui/kit/creatureIcons'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))

const labels: Record<string, string> = {
  aberration: '异怪', beast: '野兽', celestial: '天界生物', construct: '构装', dragon: '龙类',
  elemental: '元素', fey: '妖精', fiend: '邪魔', giant: '巨人', humanoid: '类人',
  monstrosity: '怪物', ooze: '泥怪', plant: '植物', undead: '亡灵', unknown: '未知',
}
const out = join(root, 'docs/probes/G3_截图')
mkdirSync(out, { recursive: true })
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await chromium.launch({ executablePath: chrome, headless: true })
try {
  for (const scheme of ['light', 'dark'] as const) {
    const page = await browser.newPage({ viewport: { width: 980, height: 680 }, colorScheme: scheme })
    const fg = scheme === 'dark' ? '#e8e1d3' : '#24211d'
    const bg = scheme === 'dark' ? '#1c1a18' : '#f5f0e7'
    const card = scheme === 'dark' ? '#292520' : '#fffdf8'
    const line = scheme === 'dark' ? '#514a40' : '#d9cdbb'
    const html = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;padding:28px;background:${bg};color:${fg};font:15px/1.4 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}
      h1{font-size:20px;margin:0 0 4px} p{margin:0 0 20px;opacity:.65;font-size:13px}
      .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
      .card{background:${card};border:1px solid ${line};border-radius:12px;padding:16px;text-align:center}
      svg{width:64px;height:64px;fill:currentColor;opacity:.9}.name{margin-top:8px;font-size:14px}
      .key{font-size:11px;opacity:.45;margin-top:2px}
    </style><h1>生物类型图标 · 15 种</h1><p>game-icons.net（CC BY 3.0）· 单色路径 · 深浅色均用 currentColor</p><div class="grid">
    ${Object.entries(CREATURE_ICONS).map(([key, path]) => `<div class="card"><svg viewBox="0 0 512 512" aria-label="${labels[key] ?? key}"><g>${path}</g></svg><div class="name">${labels[key] ?? key}</div><div class="key">${key}</div></div>`).join('')}
    </div>`
    await page.setContent(html)
    await page.screenshot({ path: join(out, `04-生物类型图标总图-${scheme}.png`), fullPage: true })
    await page.close()
  }
} finally { await browser.close() }
console.log(`图标总图已保存到 ${out}`)
