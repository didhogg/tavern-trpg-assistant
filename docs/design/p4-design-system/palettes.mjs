// 三套候选配色：每个色号都是"色阶出处.步骤"的引用，由脚本解出真实十六进制并核算对比度。
// 出处：Radix Colors 3.0.0（MIT）、Tailwind CSS 3.4.17（MIT）；原文件副本在 sources/。
// 方向（驾驶员 2026-11-09）：底色要像参考图那样的"淡暖色浅黄米色"，不要现有的"经典黄"点缀色（#b8954a）；暖黄红；平整无纹理。
// 方法：按《如何在 UI 设计项目中组织与管理配色》（Joseph Todaro）的四类管理：
//   一、品牌固定色  二、布局与结构色（深浅交叉复用灰色）  三、指示色（品牌红不当错误色；禁用态单独定义）  四、交互色（一个基色 + 悬停 +1 / 按下 −1 阶梯）
// 运行：node docs/design/p4-design-system/palettes.mjs  → 生成 tokens.palettes.css、contrast.json
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const radix = JSON.parse(readFileSync(join(here, 'sources/radix-3.0.0.json'), 'utf8')).scales
const tw = JSON.parse(readFileSync(join(here, 'sources/tailwind-3.4.17.json'), 'utf8')).scales

const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const rgb2hex = (r) => '#' + r.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')

/** "r:sand.3" Radix｜"t:stone.900" Tailwind｜"#fff" 原样｜"m:<引用>|<引用>|0.25" 两个出处色之间的内插（只用于淡黄底色微调和交互阶梯，文档里标明） */
export function resolve(ref) {
  if (ref.startsWith('#')) return ref
  if (ref.startsWith('m:')) {
    const [a, b, t] = ref.slice(2).split('|')
    const [x, y] = [hex2rgb(resolve(a)), hex2rgb(resolve(b))]
    return rgb2hex(x.map((v, i) => v + (y[i] - v) * Number(t)))
  }
  const [src, rest] = ref.split(':')
  const [scale, step] = rest.split('.')
  const v = (src === 'r' ? radix : tw)[scale]?.[step]
  if (!v) throw new Error(`色阶出处里没有 ${ref}`)
  return v
}

/** 主色阶梯（浅色）：基色 = 比出处第 11 阶再深一点（内插），悬停 = 浅一阶（+1，即第 11 阶），按下 = 深一阶（−1）。三个状态白字都 ≥4.5:1。 */
const ladder = (s) => ({ primary: `m:r:${s}.11|r:${s}.12|0.25`, primaryHover: `r:${s}.11`, primaryPressed: `m:r:${s}.11|r:${s}.12|0.55` })
/** 深色：深底上主色要更亮才有存在感，基色取第 11 阶，悬停往第 10 阶走半步，按下往第 12 阶走 25%。 */
const ladderDark = (s) => ({ primary: `r:${s}.11`, primaryHover: `m:r:${s}.11|r:${s}.10|0.5`, primaryPressed: `m:r:${s}.11|r:${s}.12|0.25` })

// 层次（和参考图一致）：surface = 卡片 / 输入框 / 弹层（最亮）；bg = 内容区"纸色"；bgSide = 侧栏 / 栏目（比纸色略深）；bgSunk = 卡片里再嵌的块；bgHover = 悬停
export const CANDIDATES = {
  a: {
    name: 'A · 奶油米（偏橄榄）· 番茄红', source: 'Radix Colors：gold（底）/ tomato（主色）/ bronze（深色）/ crimson / grass / amber',
    feel: '安静的奶油米色，略带橄榄的灰调，主色是偏橙的番茄红。三套里最克制、最"软件"。',
    risk: '主色（番茄红）和错误色相近，所以错误色改用偏粉的绯红，并且永远带 ⚠ 图标和文字。',
    g1: 'r:gold.9', g2: 'r:gold.11',
    light: {
      surface: 'r:gold.2', bg: 'r:gold.3', bgSide: 'r:gold.4', bgSunk: 'r:gold.3', bgHover: 'r:gold.5', line: 'r:gold.6',
      text: 'r:gold.12',
      ...ladder('tomato'), primaryText: 'm:r:tomato.11|r:tomato.12|0.25', primaryTint: 'r:tomato.2', primaryTintLine: 'r:tomato.6',
      heroBg: 'r:gold.12', heroInk: 'r:gold.1', heroInk2: 'r:gold.6',
      dangerText: 'r:crimson.11', dangerBg: 'r:crimson.2', dangerLine: 'r:crimson.7',
      successText: 'r:grass.11', successBg: 'r:grass.2', warnText: 'r:amber.12', warnBg: 'r:amber.2',
    },
    dark: {
      surface: 'r:bronze-dark.2', bg: 'r:bronze-dark.1', bgSide: 'r:bronze-dark.2', bgSunk: 'r:bronze-dark.1', bgHover: 'r:bronze-dark.4', line: 'r:bronze-dark.5',
      text: 'r:bronze-dark.12',
      ...ladderDark('tomato'), primaryText: 'r:tomato-dark.11', primaryTint: 'r:tomato-dark.3', primaryTintLine: 'r:tomato-dark.6',
      heroBg: 'r:bronze-dark.4', heroInk: 'r:bronze-dark.12', heroInk2: 'r:bronze-dark.11',
      dangerText: 'r:crimson-dark.11', dangerBg: 'r:crimson-dark.3', dangerLine: 'r:crimson-dark.7',
      successText: 'r:grass-dark.11', successBg: 'r:grass-dark.3', warnText: 'r:amber-dark.11', warnBg: 'r:amber-dark.3',
    },
  },
  b: {
    name: 'B · 桃米（偏暖粉）· 正红', source: 'Radix Colors：brown / red / orange / grass / amber',
    feel: '最接近参考图的暖：带一点桃红的米色，主色是干净的深正红（不偏橙、不偏粉）。三套里最"规则书 / 手账"。',
    risk: '深红靠近用户不想要的"酒红 AI 味"，所以红只用在主按钮、标题和选中态，不铺大块；错误色改用橙红。',
    g1: 'r:brown.9', g2: 'r:brown.11',
    light: {
      surface: 'r:brown.2', bg: 'r:brown.3', bgSide: 'r:brown.4', bgSunk: 'r:brown.3', bgHover: 'r:brown.5', line: 'r:brown.6',
      text: 'r:brown.12',
      ...ladder('red'), primaryText: 'm:r:red.11|r:red.12|0.25', primaryTint: 'r:red.2', primaryTintLine: 'r:red.6',
      heroBg: 'r:brown.12', heroInk: 'r:brown.1', heroInk2: 'r:brown.6',
      dangerText: 'r:orange.12', dangerBg: 'r:orange.2', dangerLine: 'r:orange.7',
      successText: 'r:grass.11', successBg: 'r:grass.2', warnText: 'r:amber.12', warnBg: 'r:amber.2',
    },
    dark: {
      surface: 'r:brown-dark.2', bg: 'r:brown-dark.1', bgSide: 'r:brown-dark.2', bgSunk: 'r:brown-dark.1', bgHover: 'r:brown-dark.4', line: 'r:brown-dark.5',
      text: 'r:brown-dark.12',
      ...ladderDark('red'), primaryText: 'r:red-dark.11', primaryTint: 'r:red-dark.3', primaryTintLine: 'r:red-dark.6',
      heroBg: 'r:brown-dark.4', heroInk: 'r:brown-dark.12', heroInk2: 'r:brown-dark.11',
      dangerText: 'r:orange-dark.11', dangerBg: 'r:orange-dark.3', dangerLine: 'r:orange-dark.7',
      successText: 'r:grass-dark.11', successBg: 'r:grass-dark.3', warnText: 'r:amber-dark.11', warnBg: 'r:amber-dark.3',
    },
  },
  c: {
    name: 'C · 奶油黄（偏黄）· 深琥珀', source: 'Radix Colors：gold + amber（底，内插）/ Tailwind CSS：amber（主色）/ stone（深色）/ red / green',
    feel: '三套里最黄、最暖：淡奶油黄的纸色，主按钮是深琥珀，红只留给错误，"品牌色 ≠ 失败色"一眼分清。',
    risk: '主色偏黄褐，容易显得"旧"；靠高对比文字和干净的底压住。底色是在 Radix gold 和 amber 之间内插出来的（不是色阶原值）。',
    g1: 't:stone.500', g2: 't:stone.600',
    light: {
      surface: 'r:amber.1', bg: 'm:r:gold.3|r:amber.3|0.35', bgSide: 'm:r:gold.4|r:amber.4|0.2', bgSunk: 'm:r:gold.3|r:amber.3|0.2', bgHover: 'm:r:gold.5|r:amber.4|0.2', line: 'm:r:gold.6|r:amber.6|0.2',
      text: 't:stone.900',
      primary: 't:amber.800', primaryHover: 't:amber.700', primaryPressed: 't:amber.900', primaryText: 't:amber.800', primaryTint: 't:amber.50', primaryTintLine: 't:amber.300',
      heroBg: 't:stone.900', heroInk: 't:stone.50', heroInk2: 't:stone.300',
      dangerText: 't:red.700', dangerBg: 't:red.50', dangerLine: 't:red.300',
      successText: 't:green.700', successBg: 't:green.50', warnText: 't:orange.700', warnBg: 't:orange.50',
    },
    dark: {
      surface: 't:stone.800', bg: 't:stone.900', bgSide: 't:stone.800', bgSunk: 't:stone.800', bgHover: 't:stone.700', line: 't:stone.700',
      text: 't:stone.50',
      primary: 't:amber.700', primaryHover: 'm:t:amber.700|t:amber.600|0.15', primaryPressed: 't:amber.800', primaryText: 't:amber.400', primaryTint: '#3a2a12', primaryTintLine: 't:amber.800',
      heroBg: 't:stone.700', heroInk: 't:stone.50', heroInk2: 't:stone.300',
      dangerText: '#fca5a5', dangerBg: '#3b1515', dangerLine: 't:red.700',
      successText: '#86efac', successBg: '#12301c', warnText: '#fdba74', warnBg: '#3a2010',
    },
  },
}

// 点缀色（极小面积）：从色阶里取干净的琥珀，不用现有的"经典黄"
const ACCENT = { a: { light: 'r:amber.9', dark: 'r:amber-dark.9' }, b: { light: 'r:amber.9', dark: 'r:amber-dark.9' }, c: { light: 't:amber.400', dark: 't:amber.400' } }
const ACCENT_TEXT = { a: { light: 'm:r:amber.11|r:amber.12|0.35', dark: 'r:amber-dark.11' }, b: { light: 'm:r:amber.11|r:amber.12|0.35', dark: 'r:amber-dark.11' }, c: { light: 't:amber.800', dark: 't:amber.400' } }

// 二.4 交叉复用：g1 一个灰同时是 浅色的控件边线 = 深色的次要文字 = 深色的控件边线；g2 是浅色的次要文字（深色里没有第二个灰能同时满足 3:1 边线和 4.5:1 文字，所以只复用 g1）。
// C 的色阶步长太大，只能复用 lineCtrl（g1 两种模式共用）；次要文字各取一档。
function modeMap(id, mode) {
  const c = CANDIDATES[id]
  const m = { ...c[mode] }
  if (id === 'c') {
    m.lineCtrl = c.g1
    m.text2 = mode === 'light' ? c.g2 : 't:stone.300'
  } else if (mode === 'light') { m.lineCtrl = c.g1; m.text2 = c.g2 } else { m.text2 = c.g1; m.lineCtrl = c.g1 }
  m.text3 = m.lineCtrl // 占位 / 禁用文字复用同一个灰（交叉复用，少一个灰）
  m.accent = ACCENT[id][mode]
  m.accentText = ACCENT_TEXT[id][mode]
  m.onAccent = id === 'c' ? 't:stone.900' : 'r:amber.12'
  m.onPrimary = '#ffffff'
  // 禁用态（三.3）：浅 / 深各自独立的灰；文字仍要能读
  m.disabledBg = m.bgSunk
  m.disabledText = m.text3
  m.focus = mode === 'light' ? m.primary : m.primaryText
  return m
}

const lum = (hex) => {
  const v = hex2rgb(hex).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
}
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

// 必须达标的配对：[前景, 背景, 最低对比度, 说明]
const PAIRS = [
  ['text', 'bg', 4.5, '正文 / 纸色底'], ['text2', 'bg', 4.5, '次要文字 / 纸色底'], ['text', 'surface', 4.5, '正文 / 卡片'], ['text2', 'surface', 4.5, '次要文字 / 卡片'],
  ['text', 'bgSide', 4.5, '正文 / 侧栏'], ['text2', 'bgSide', 4.5, '次要文字 / 侧栏'], ['text2', 'bgSunk', 4.5, '浅灰说明 / 嵌套块'], ['text', 'bgHover', 4.5, '正文 / 悬停底'],
  ['onPrimary', 'primary', 4.5, '主按钮文字（基色）'], ['onPrimary', 'primaryHover', 4.5, '主按钮文字（悬停 +1）'], ['onPrimary', 'primaryPressed', 4.5, '主按钮文字（按下 −1）'],
  ['primaryText', 'bg', 4.5, '红 / 琥珀标题与链接 / 纸色底'], ['primaryText', 'surface', 4.5, '红 / 琥珀标题与链接 / 卡片'], ['primaryText', 'primaryTint', 4.5, '选中态文字 / 选中底'],
  ['accentText', 'bg', 4.5, '琥珀文字 / 纸色底'], ['onAccent', 'accent', 4.5, '琥珀块上的文字'],
  ['heroInk', 'heroBg', 4.5, '首页横幅文字'], ['heroInk2', 'heroBg', 4.5, '首页横幅次要文字'], ['accent', 'heroBg', 3, '横幅上的琥珀点缀（3:1）'],
  ['dangerText', 'dangerBg', 4.5, '错误文字'], ['successText', 'successBg', 4.5, '成功文字'], ['warnText', 'warnBg', 4.5, '提醒文字'],
  ['lineCtrl', 'surface', 3, '输入框 / 控件边线（非文字 3:1）'], ['lineCtrl', 'bg', 3, '控件边线 / 纸色底（非文字 3:1）'],
  ['disabledText', 'disabledBg', 2.2, '禁用文字仍可辨认（下限 2.2:1，不是 AA）'],
]
// 仅装饰、不承载信息的配对，只报告不要求：
const INFO = [['accent', 'bg', '琥珀点缀 / 纸色底（只做小点缀，不承载信息）'], ['primary', 'bg', '主按钮 / 纸色底（按钮有文字标签，边界不是唯一识别信息）']]

export function build() {
  const resolved = {}, report = {}, neutrals = {}
  for (const id of Object.keys(CANDIDATES)) {
    resolved[id] = {}; report[id] = {}
    for (const mode of ['light', 'dark']) {
      const m = Object.fromEntries(Object.entries(modeMap(id, mode)).map(([k, v]) => [k, resolve(v)]))
      resolved[id][mode] = m
      report[id][mode] = [
        ...PAIRS.map(([f, b, min, note]) => ({ fg: f, bg: b, min, note, ratio: Math.round(contrast(m[f], m[b]) * 100) / 100, ok: contrast(m[f], m[b]) >= min })),
        ...INFO.map(([f, b, note]) => ({ fg: f, bg: b, min: 0, note, ratio: Math.round(contrast(m[f], m[b]) * 100) / 100, ok: true, info: true })),
      ]
    }
    const keys = ['surface', 'bg', 'bgSide', 'bgSunk', 'bgHover', 'line', 'lineCtrl', 'text', 'text2', 'text3']
    neutrals[id] = new Set(['light', 'dark'].flatMap((mo) => keys.map((k) => resolved[id][mo][k]))).size
  }
  return { resolved, report, neutrals }
}

const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
export function paletteCss(resolved) {
  const block = (sel, m) => `${sel} {\n${Object.entries(m).map(([k, v]) => `  --${kebab(k)}: ${v};`).join('\n')}\n}`
  return Object.entries(resolved).map(([id, m]) =>
    `/* 候选 ${id.toUpperCase()}：${CANDIDATES[id].name}（${CANDIDATES[id].source}） */\n${block(`.ds-root[data-palette='${id}'], :host([data-palette='${id}'])`, m.light)}\n@media (prefers-color-scheme: dark) {\n${block(`.ds-root[data-palette='${id}']:not([data-theme='light'])`, m.dark).replace(/^/gm, '  ')}\n}\n${block(`.ds-root[data-palette='${id}'][data-theme='dark']`, m.dark)}`).join('\n\n')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { resolved, report, neutrals } = build()
  writeFileSync(join(here, 'tokens.palettes.css'), `/* 自动生成：node docs/design/p4-design-system/palettes.mjs ；不要手改 */\n${paletteCss(resolved)}\n`)
  writeFileSync(join(here, 'contrast.json'), JSON.stringify({ resolved, report, neutrals }, null, 1))
  let bad = 0
  for (const [id, r] of Object.entries(report)) for (const [mode, rows] of Object.entries(r)) for (const x of rows) if (!x.ok) { bad++; console.log(`✘ ${id} ${mode} ${x.fg}/${x.bg} ${x.ratio} < ${x.min}（${x.note}）`) }
  console.log(bad ? `未达标 ${bad} 项` : '全部达标', '｜灰色数量（浅+深合计）', neutrals)
  for (const id of Object.keys(resolved)) console.log(id, 'light', ['surface', 'bg', 'bgSide', 'text', 'text2', 'primary'].map((k) => resolved[id].light[k]).join(' '))
}
