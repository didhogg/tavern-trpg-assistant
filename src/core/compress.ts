// T2：换算结果压缩存【库】。用浏览器自带的 CompressionStream（gzip），不加依赖；读时先解压。
export async function gzipText(text: string): Promise<Uint8Array> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export async function gunzipText(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Response(stream).text()
}
