// 从作者条目编号反推来源（P5 T6 后4：读档缺条目时按书补装）。存档引用只记 数据集 / 类别 / 编号，不记来源。
// 作者编号（UrlUtil.URL_TO_HASH_BUILDER）大多是「编码后的名字_来源」；子职是「职业_职业来源,state:sub~简称~子职来源=…」；
// 埋表（embeddedTable）是「母条目编号~类别~t序号」。
// 做法：按作者的分隔符（_ , ~ : =）切成小段，从后往前与已知来源比对，取第一个命中的（也试「从这一段到 _ 结尾」的整段，
// 照顾来源里本身带 _ 的情况）。推不出来返回 null（界面如实说「不知道在哪本书」），不猜。
// 实测（P5 T6，中文官方真实库 32,278 条）：见交接文档 §5。

/** knownSources：小写来源 → 作者原写法。返回作者原写法的来源，推不出来为 null。 */
export function sourceFromHash(hash: string, knownSources: Map<string, string>): string | null {
  const dec = (s: string): string => { try { return decodeURIComponent(s).toLowerCase() } catch { return s.toLowerCase() } }
  const tokens = hash.split(/[_,~:=]/).filter(Boolean)
  for (let i = tokens.length - 1; i >= 0; i--) {
    const one = knownSources.get(dec(tokens[i]))
    if (one) return one
  }
  // 来源本身带分隔符（少见）：按 _ 拼后缀再试
  const parts = hash.split('_')
  for (let i = parts.length - 1; i >= 1; i--) {
    const hit = knownSources.get(dec(parts.slice(i).join('_')))
    if (hit) return hit
  }
  return null
}
