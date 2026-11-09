// 图标：沿用项目已有的 Phosphor Icons（Regular，MIT，见 THIRD_PARTY_NOTICES.md）。路径直接读 src/ui/kit/icons.ts，不另存一份；
// 只缺"新建分支"（git-branch），从官方包 @phosphor-icons/core@2.1.1 取（sources/phosphor-git-branch.svg）。
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const here = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(here, '../../../src/ui/kit/icons.ts'), 'utf8')
export const ICONS = {}
for (const m of src.matchAll(/^  '([a-z0-9-]+)': '(.*)',?$/gm)) ICONS[m[1]] = m[2]
const gb = readFileSync(join(here, 'sources/phosphor-git-branch.svg'), 'utf8').match(/<svg[^>]*>(.*)<\/svg>/s)[1]
ICONS['git-branch'] = gb
export const NEW_ICONS = ['git-branch']
export const icon = (name, size = 18) => {
  if (!ICONS[name]) throw new Error(`没有图标 ${name}`)
  return `<svg class="trpg-icon" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" width="${size}" height="${size}">${ICONS[name]}</svg>`
}
// P4 用到的图标和用途（名字都是 Phosphor 的）
export const ICON_MAP = [
  ['house', '侧栏 · 首页'], ['books', '侧栏 · 库'], ['gear', '侧栏 · 设置'], ['dice-five', '悬浮球 / 首页主视觉（纯色单骰）'], ['x', '关闭'],
  ['caret-right', '下钻 / 更多'], ['caret-down', '展开分组 / 存档芯片'], ['check', '勾选 / 步骤已完成'], ['check-circle', '成功'], ['warning', '错误 / 提醒（永远和文字一起）'],
  ['circle-notch', '读取中 / 进度环转圈'], ['floppy-disk', '保存存档'], ['git-branch', '新建分支存档（新增）'], ['arrow-counter-clockwise', '读取已有存档 / 撤销'],
  ['download-simple', '已下载 / 导出'], ['upload-simple', '导入'], ['trash', '删除'], ['dots-three', '更多菜单'], ['info', '说明'], ['plus', '步进器 +'], ['minus', '步进器 −'],
]
