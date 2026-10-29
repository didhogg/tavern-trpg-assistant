import type { TrpgDatabase } from '../db'
import { TrpgError, isQuotaError, QUOTA_MESSAGE } from '../errors'
import { sha256Hex } from '../hash'
import { assertImage, MAX_IMAGE_BYTES } from '../packs/images'

/** 上传图片（L1 §3.12）：按文件头判定类型，超过 10MB 拒绝，按内容哈希存放（已有则跳过）；返回图片引用。 */
export async function putAsset(db: TrpgDatabase, bytes: Uint8Array, now: number): Promise<{ $asset: string }> {
  if (bytes.length > MAX_IMAGE_BYTES) throw new TrpgError('E_TOO_LARGE', '图片超过 10MB，请先压缩后再选')
  const mime = assertImage('这张图片', bytes)
  const hash = sha256Hex(bytes)
  try {
    if (!(await db.blobs.get(hash))) await db.blobs.put({ hash, bytes, mime, size: bytes.length, createdAt: now })
  } catch (error) {
    if (isQuotaError(error)) throw new TrpgError('E_QUOTA', QUOTA_MESSAGE)
    throw error
  }
  return { $asset: hash }
}
