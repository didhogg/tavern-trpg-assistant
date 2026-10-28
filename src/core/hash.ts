import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'

/** 键排序的稳定序列化：相同内容必得到相同文本；忽略值为 undefined 的键。 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v === undefined ? null : v)).join(',')}]`
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`
}

export function sha256Hex(input: Uint8Array | string): string {
  return bytesToHex(sha256(typeof input === 'string' ? utf8ToBytes(input) : input))
}

export function hashValue(value: unknown): string {
  return sha256Hex(stableStringify(value))
}
