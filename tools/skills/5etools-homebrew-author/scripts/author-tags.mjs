// 从作者站的 js/render.js 读出“带名字的条目引用”标签（{@spell fireball|phb}、{@condition prone}、{@item longsword|phb}…）。
// 作者把每个标签写成一个类（Renderer.tag 里的 TagXxx），按父类分：_TagTextStyle = 纯文字样式（b、i、u…），
// _TagDiceFlavor* = 骰子 / 数值，_TagPipedNoDisplayText = 链接 / 过滤器 / 颜色，_TagPipedDisplayText* = 带名字的条目引用。
// 只取最后一类；不手写标签名单。作者 render.js 换版本后，名单自动跟着变。
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { renderJs } from './paths.mjs'

/** 返回 { tags: Set<标签名>, from: 文件路径 }；找不到或解析不出来时抛错（不悄悄降级）。 */
export async function referenceTags(path = renderJs) {
  if (!existsSync(path)) throw new Error(`找不到作者 render.js：${path}\n（用环境变量 BREW_RENDER_JS 指定；没有它就分不出“引用标签”和“样式标签”）`)
  const lines = (await readFile(path, 'utf8')).split('\n')
  const start = lines.findIndex((l) => l.startsWith('Renderer.tag = class'))
  if (start < 0) throw new Error(`${path} 里没找到 Renderer.tag（作者源码结构变了，要重新核对 scripts/author-tags.mjs）`)
  const heads = []
  for (let i = start; i < lines.length; i++) {
    if (/^\tstatic TAG_LOOKUP/.test(lines[i])) break
    if (/^\tstatic Tag\w+ = class extends this\.\w+/.test(lines[i])) heads.push(i)
  }
  const tags = new Set()
  for (const h of heads) {
    const base = /extends this\.(\w+)/.exec(lines[h])[1]
    if (!base.startsWith('_TagPipedDisplayText')) continue
    const tagName = /tagName = "(\w+)"/.exec(lines.slice(h, h + 20).join('\n'))?.[1]
    if (tagName) tags.add(tagName)
  }
  // 自检：几个一定是条目引用的标签必须在里面，否则说明解析坏了
  for (const must of ['spell', 'item', 'creature', 'condition']) {
    if (!tags.has(must)) throw new Error(`解析作者 render.js 出来的引用标签里没有 ${must}（共 ${tags.size} 个），作者源码结构可能变了`)
  }
  return { tags, from: path }
}
