// 小窗里的编号随机源按种子确定：官方 randomID 用 crypto.getRandomValues 生成新编号（例如迁移旧格式效果时），
// 换成确定序列后同一份输入每次得到同样的编号，变更计划才稳定（蓝图 §3.2 同输入同结果）。只在隔离小窗与对照环境里安装。
// 掷骰不走这里：骰点由插件喂入。

function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return h >>> 0
}

/** 安装确定随机源；返回重设种子的函数（每次启动世界前按输入重设）。 */
export function installSeededCrypto(target: { crypto: Crypto }): (seed: string) => void {
  let state = 0
  const next = (): number => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return (t ^ (t >>> 14)) >>> 0
  }
  const fill = <T extends ArrayBufferView | null>(array: T): T => {
    if (!array) return array
    const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength)
    for (let i = 0; i < bytes.length; i += 4) {
      const value = next()
      for (let j = 0; j < 4 && i + j < bytes.length; j++) bytes[i + j] = (value >>> (8 * j)) & 0xff
    }
    return array
  }
  Object.defineProperty(target.crypto, 'getRandomValues', { value: fill, configurable: true, writable: true })
  return seed => { state = hash(seed) }
}
