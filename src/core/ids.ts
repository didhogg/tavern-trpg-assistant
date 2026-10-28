/** UUID v4。使用 getRandomValues，在非安全上下文（http 局域网）中也可用。 */
export function uuid(): string {
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0'))
  return `${h.slice(0, 4).join('')}-${h.slice(4, 6).join('')}-${h.slice(6, 8).join('')}-${h.slice(8, 10).join('')}-${h.slice(10).join('')}`
}

export interface OwnerInfo {
  ownerKey: string
  ownerLabel: string
}

/** 当前数据的归属键：群组用群组 id，角色卡用头像文件名（characterId 只是数组下标，不稳定）。 */
export function ownerFromHost(host: {
  groupId?: string | null
  groups?: Array<{ id: string; name?: string }>
  characterId?: string | number
  characters?: Array<{ name?: string; avatar?: string }>
}): OwnerInfo | null {
  if (host.groupId) {
    const group = host.groups?.find((g) => g.id === host.groupId)
    return { ownerKey: `group:${host.groupId}`, ownerLabel: group?.name ?? '群组' }
  }
  if (host.characterId !== undefined && host.characterId !== null) {
    const card = host.characters?.[Number(host.characterId)]
    if (card?.avatar) return { ownerKey: `char:${card.avatar}`, ownerLabel: card.name ?? card.avatar }
  }
  return null
}

/** 批内编号：0→A … 25→Z，26→AA，27→AB … */
export function batchLabel(index: number): string {
  let n = index
  let out = ''
  do {
    out = String.fromCharCode(65 + (n % 26)) + out
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return out
}
