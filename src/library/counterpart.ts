// 中英对应（P5 B-10、G-3a）：条目页右上"En / 中文"一键切换要的"另一种语言里的这一条"。官方数据靠配对表，自制靠配对的包（brew-pairing.ts）。
// 中文 → 英文取作者做法算出的配对表（service.englishPairs）；英文 → 中文由同一张配对表反过来建。
// 配对不是一一对应：约 3% 的条目没有对应，或多个中文条目指向同一个英文条目（作者"按名字配"的做法，见 P5-0 §11），
// 所以返回的不只是地址，还带"有歧义 / 没有对应 / 被别的条目共用"，界面据此提示。
import type { BrewPairs } from './brew-pairing'
import type { EnglishPairs, LibraryService } from './service'
import type { EntryRef } from './scopes'
import { SOURCES, getSource, officialSourceOf } from './sources'
import { parsedKey } from './install'

export type CounterpartStatus = 'found' | 'ambiguous' | 'none'

export interface Counterpart {
  status: CounterpartStatus
  /** found：一条；ambiguous：几个候选；none：空。 */
  refs: EntryRef[]
  /** none 的原因 / found 时的提示。 */
  reason: 'not-official' | 'not-installed' | 'not-paired' | 'not-found' | 'no-counterpart' | 'pack-unpaired' | 'structure-differs' | 'no-english-name' | null
  /** found 时：另有几条别的条目也指向同一条（共用，切回来可能回不到原条）。 */
  sharedBy: number
}

const none = (reason: NonNullable<Counterpart['reason']>): Counterpart => ({ status: 'none', refs: [], reason, sharedBy: 0 })

export class Counterparts {
  /** 配对表重建后是新对象，缓存自然换新，不需要手动清。 */
  private readonly reverse = new WeakMap<EnglishPairs, Map<string, string[]>>()

  constructor(private readonly lib: LibraryService, private readonly brewPairs?: Pick<BrewPairs, 'entry'>) {}

  /** 英文编号 → 指向它的中文编号们（按类别）。配对表按"中文编号 → 英文编号"存，这里反过来建一次。 */
  private reverseOf(pairs: EnglishPairs): Map<string, string[]> {
    let map = this.reverse.get(pairs)
    if (!map) {
      map = new Map<string, string[]>()
      for (const [prop, byHash] of Object.entries(pairs.pairs)) {
        for (const [cnHash, v] of Object.entries(byHash)) {
          const key = `${prop}\u0000${v.enHash}`
          const list = map.get(key)
          if (list) list.push(cnHash)
          else map.set(key, [cnHash])
        }
      }
      this.reverse.set(pairs, map)
    }
    return map
  }

  /** 自制条目：找配对的包，按同一下标取另一种语言里的那一条（P5 G-3a；配对规则见 brew-pairing.ts）。 */
  private async brewCounterpart(ref: EntryRef, opts: { docIdLocal?: string }): Promise<Counterpart> {
    if (!this.brewPairs) return none('pack-unpaired')
    // 另一种语言的官方资料没装：那边的作者程序启动不了（缺官方数据文件），直接说「没装」，不去开一个注定失败的小窗（P5 T6）
    const pairSet = getSource(ref.set).pair
    if (pairSet && !(await this.lib.officialInstalled(getSource(pairSet).codeSet))) return none('not-installed')
    const { refs, reason } = await this.brewPairs.entry(ref, opts)
    if (!refs.length) return none(reason ?? 'no-counterpart')
    return { status: refs.length === 1 ? 'found' : 'ambiguous', refs, reason: null, sharedBy: 0 }
  }

  /**
   * 书 / 冒险正文（阅读器）在另一种语言里是不是也有（P5 T6）：两种语言的书号相同。
   * 官方：另一种语言的官方资料装着，且这本书 / 冒险也装了；自制：配对的自制源里有同一书号的正文。只看安装记录，不读正文。
   */
  async corpus(ref: { set: string; prop: string; id: string }): Promise<{ target: { set: string; prop: string; id: string } | null; reason: Counterpart['reason'] }> {
    const source = SOURCES.find((s) => s.id === ref.set)
    if (!source?.pair) return { target: null, reason: 'not-paired' }
    const pair = getSource(source.pair)
    if (!(await this.lib.officialInstalled(pair.codeSet))) return { target: null, reason: 'not-installed' }
    const target = { set: pair.id, prop: ref.prop, id: ref.id }
    if (pair.kind === 'brew') {
      const list = (await this.lib.brewCorpora(pair.id))[ref.prop] ?? []
      return list.some((b) => b.id === ref.id) ? { target, reason: null } : { target: null, reason: 'no-counterpart' }
    }
    const view = await this.lib.currentView()
    const state = await view.officialState(pair.id)
    if (!state || state.status !== 'installed') return { target: null, reason: 'not-installed' }
    const installed = ref.prop === 'adventure' || ref.prop === 'adventureData' ? await view.installedAdventures(pair.id) : await view.installedBooks(pair.id)
    const has = installed ? installed.includes(ref.id) : !!(await view.derivedGet(parsedKey(pair.id, ref.prop, ref.id)))
    return has ? { target, reason: null } : { target: null, reason: 'not-found' }
  }

  /**
   * 这一条在另一种语言里对应哪一条。官方数据集用配对表，自制按配对的包同一下标取。
   * 同编号拆成几行以后（B-31），variant.docIdLocal 指明是哪个包里的那一行，只在这个包里找。
   */
  async counterpart(ref: EntryRef, variant: { docIdLocal?: string } = {}): Promise<Counterpart> {
    const source = SOURCES.find((s) => s.id === ref.set)
    if (source?.kind === 'brew' && source.pair) return this.brewCounterpart(ref, variant)
    if (variant.docIdLocal) {
      const brewSet = SOURCES.find((s) => s.kind === 'brew' && s.codeSet === source?.codeSet)
      if (brewSet?.pair) return this.brewCounterpart({ ...ref, set: brewSet.id }, variant)
    }
    if (!source || source.kind !== 'official' || !source.pair) return none('not-official')
    const pair = getSource(source.pair)
    const cn = source.lang === 'zh' ? source : pair
    let pairs: EnglishPairs
    try {
      pairs = await this.lib.englishPairs(cn.id)
    } catch {
      return none('not-installed')
    }
    const reverse = this.reverseOf(pairs)
    if (source.id === cn.id) {
      const hit = pairs.pairs[ref.prop]?.[ref.hash]
      if (!hit) return none('not-paired')
      if (!(await this.lib.storedItem(pair.id, ref.prop, hit.enHash))) return none('not-found')
      const sharedBy = (reverse.get(`${ref.prop}\u0000${hit.enHash}`)?.length ?? 1) - 1
      return { status: 'found', refs: [{ set: pair.id, prop: ref.prop, hash: hit.enHash }], reason: null, sharedBy }
    }
    const cnHashes = reverse.get(`${ref.prop}\u0000${ref.hash}`) ?? []
    const refs: EntryRef[] = []
    for (const h of cnHashes) if (await this.lib.storedItem(cn.id, ref.prop, h)) refs.push({ set: cn.id, prop: ref.prop, hash: h })
    if (!refs.length) return none('no-counterpart')
    return refs.length === 1 ? { status: 'found', refs, reason: null, sharedBy: 0 } : { status: 'ambiguous', refs, reason: null, sharedBy: 0 }
  }
}

/** 登记里的官方中文 / 英文数据集编号（给界面选"另一种语言"用）。 */
export function officialIdOf(codeSet: string): string {
  return officialSourceOf(codeSet).id
}
