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

// 层次（和参考图一致）：surface = 卡片 / 输入框 / 弹层（最亮）；bg = 内容区"纸色"；bgSide = 嵌套块 / 栏目底；side = 边栏（暖深灰，两种模式都是深色）；bgSunk = 卡片里再嵌的块；bgHover = 悬停
// 驾驶员 2026-11-09 选定 A，并要求：不要浅粉色（错误底、选中底）、点缀黄不要太突兀、深色不要近乎全黑（改暖深灰）、边栏用暖深灰。B、C 已删除（在 git 历史里 7fdd763）。
// 奶油米（第三版）：驾驶员要"偏暖淡奶油米色"，不要偏橄榄绿。做法：Radix gold（米色）和 orange（暖橙）同阶内插，得到接近参考图纸色的暖奶油；深色同理用 gold-dark 和 brown-dark 对半内插（暖深灰，不偏橄榄也不偏巧克力棕）。内插只在这些底色上用，文档标明。
const cream = (g, o, t) => `m:r:gold.${g}|r:orange.${o}|${t}`
const dk = (n) => `m:r:gold-dark.${n}|r:brown-dark.${n}|0.5`
export const CANDIDATES = {
  a: {
    name: 'A · 暖奶油米 · 番茄红', source: 'Radix Colors：gold + orange（底，内插）/ brown（文字）/ tomato（主色）/ red / grass / amber',
    feel: '偏暖的淡奶油米色（接近参考图的纸色），边栏是暖深灰；主色是偏橙的番茄红；点缀是柔和的烛光琥珀，只做小面积。',
    risk: '主色（番茄红）和错误色（正红）相近，所以错误永远带 ⚠ 图标 + 文字 + 红边框，不靠颜色单独表达；没有任何粉色底。底色是内插值，不是色阶原值。',
    light: {
      surface: cream(2, 1, 0.5), bg: cream(3, 3, 0.45), bgSide: cream(4, 4, 0.3), bgSunk: cream(3, 3, 0.45), bgHover: cream(5, 4, 0.2), line: cream(6, 5, 0.25),
      text: 'r:brown.12', text2: 'r:brown.11', lineCtrl: 'r:brown.9',
      side: 'r:brown.12', sideInk: cream(3, 3, 0.45), sideInk2: 'r:brown.7', sideHover: 'm:r:brown.12|r:brown.1|0.08', sideActive: 'm:r:brown.12|r:brown.1|0.16', sideLine: 'm:r:brown.12|r:brown.1|0.14',
      ...ladder('tomato'), primaryText: 'm:r:tomato.11|r:tomato.12|0.25', primaryTint: cream(4, 4, 0.3), primaryTintLine: cream(7, 6, 0.3),
      heroBg: 'r:brown.12', heroInk: 'r:brown.1', heroInk2: 'r:brown.6',
      dangerText: 'r:red.11', dangerBg: cream(2, 1, 0.5), dangerLine: 'r:red.9',
      successText: 'r:grass.11', successBg: 'r:grass.2', warnText: 'r:amber.12', warnBg: 'r:amber.2',
    },
    dark: {
      surface: dk(5), bg: dk(4), bgSide: dk(3), bgSunk: dk(3), bgHover: dk(6), line: dk(7),
      text: 'r:brown-dark.12', text2: 'r:brown-dark.11', lineCtrl: 'r:brown-dark.9',
      side: dk(3), sideInk: 'r:brown-dark.12', sideInk2: 'r:brown-dark.11', sideHover: dk(4), sideActive: dk(5), sideLine: dk(5),
      ...ladderDark('tomato'), primaryText: 'm:r:tomato-dark.10|r:tomato-dark.11|0.5', primaryTint: dk(4), primaryTintLine: dk(8),
      heroBg: dk(2), heroInk: 'r:brown-dark.12', heroInk2: 'r:brown-dark.11',
      dangerText: 'r:red-dark.10', dangerBg: dk(3), dangerLine: 'r:red-dark.9',
      successText: 'm:r:grass-dark.10|r:grass-dark.11|0.4', successBg: dk(3), warnText: 'm:r:amber-dark.11|r:brown-dark.11|0.5', warnBg: dk(3),
    },
  },
}

// 点缀色（极小面积，不做大块按钮）：柔和的烛光琥珀，不用亮黄
const ACCENT = { a: { light: 'r:amber.7', dark: 'r:amber.7' } }
const ACCENT_TEXT = { a: { light: 'm:r:amber.11|r:amber.12|0.35', dark: 'r:brown-dark.11' } }

function modeMap(id, mode) {
  const m = { ...CANDIDATES[id][mode] }
  m.text3 = m.lineCtrl // 占位 / 禁用文字复用同一个灰（交叉复用：浅色的边线灰 brown.9 = 深色的边线灰 brown-dark.9，同一个 #ad7f58）
  m.accent = ACCENT[id][mode]
  m.accentText = ACCENT_TEXT[id][mode]
  m.onAccent = 'r:amber.12'
  m.onPrimary = '#ffffff'
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
  ['sideInk', 'side', 4.5, '边栏文字'], ['sideInk2', 'side', 4.5, '边栏次要文字'], ['sideInk', 'sideActive', 4.5, '边栏选中项文字'], ['onPrimary', 'primary', 4.5, '主按钮文字（基色）'], ['onPrimary', 'primaryHover', 4.5, '主按钮文字（悬停 +1）'], ['onPrimary', 'primaryPressed', 4.5, '主按钮文字（按下 −1）'],
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
    const keys = ['surface', 'bg', 'bgSide', 'side', 'bgSunk', 'bgHover', 'line', 'lineCtrl', 'text', 'text2', 'text3']
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
