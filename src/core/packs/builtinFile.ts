/** 随扩展分发的内置包文件：与构建产物同在 `packs/` 目录，文件名即包 id。 */
const FILES: Record<string, URL> = {
  'dnd5e2014-srd': new URL('../packs/dnd5e2014-srd.trpgpack', import.meta.url),
}

export async function loadBuiltinPack(id: string): Promise<Uint8Array> {
  const url = FILES[id]
  if (!url) throw new Error(`没有找到内置内容包：${id}`)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`内置内容包读取失败（${response.status}）`)
  return new Uint8Array(await response.arrayBuffer())
}
