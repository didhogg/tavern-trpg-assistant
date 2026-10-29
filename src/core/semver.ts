function parts(version: string): [number, number, number] {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!m) throw new Error(`版本号格式不正确：${version}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

/** 返回 -1 / 0 / 1。 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const pa = parts(a)
  const pb = parts(b)
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1
  }
  return 0
}

/** 末位加 1：1.0.24 → 1.0.25（库内编辑每次保存都这样）。 */
export function bumpPatch(version: string): string {
  const [major, minor, patch] = parts(version)
  return `${major}.${minor}.${patch + 1}`
}
