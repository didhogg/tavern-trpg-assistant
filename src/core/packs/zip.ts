import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { TrpgError } from '../errors'

export type ZipFiles = Record<string, Uint8Array>

export function readZip(bytes: Uint8Array): ZipFiles {
  try {
    return unzipSync(bytes)
  } catch {
    throw new TrpgError('E_NOT_ZIP', '无法识别：这不是 TRPG 跑团助手的文件')
  }
}

/** 固定的压缩级别与文件时间，保证同一内容得到逐字节相同的包。 */
export function writeZip(files: Record<string, Uint8Array | string>): Uint8Array {
  const input: Record<string, Uint8Array> = {}
  for (const name of Object.keys(files).sort()) {
    const content = files[name]
    input[name] = typeof content === 'string' ? strToU8(content) : content
  }
  return zipSync(input, { level: 6, mtime: new Date(1980, 0, 1, 0, 0, 0) })
}

export function readJson(files: ZipFiles, name: string): unknown {
  const file = files[name]
  if (!file) return undefined
  try {
    return JSON.parse(strFromU8(file))
  } catch {
    throw new TrpgError('E_BAD_CONTENT', `文件内容损坏：${name} 无法解析`)
  }
}
