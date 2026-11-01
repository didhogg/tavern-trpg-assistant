/**
 * 仍带 `lang:other` 的条目（驾驶员决定：以后遇到 other 一律报错）。
 * 第 2 站 2-9 把这三个种族改成各自的语言后，删掉这里对应的行；清单清空即可删除本文件与构建里的引用。
 * 构建校验两头都查：不在清单里却带 other → 报错；在清单里却已经没有 other → 也报错（提醒删行）。
 */
export const LANG_OTHER_PENDING: readonly string[] = []
