// P5.5 收尾 C1（根因 A）：自制、房规都要先有对应语言的官方资料才读得出来（作者程序启动要读官方数据，B-37）。
// 统一在开作者小窗那一道门查（LibraryService），没装就立刻报这一种错；列清单的地方认出它当作空的，其他地方原样显示这句话。
import { CODE_SETS } from './sources'

export class OfficialMissingError extends Error {
  readonly codeSet: string
  constructor(codeSet: string) {
    const name = CODE_SETS[codeSet]?.label ?? codeSet
    super(`${name}官方资料没装，读不了${name}这一套（装好官方资料后，你导入和自己写的都还在）`)
    this.name = 'OfficialMissingError'
    this.codeSet = codeSet
  }
}

export const isOfficialMissing = (e: unknown): e is OfficialMissingError => e instanceof Error && e.name === 'OfficialMissingError'

/** 列清单用：这种语言没装就当作空的，别的错照常抛。 */
export async function emptyIfMissing<T>(run: () => Promise<T[]>): Promise<T[]> {
  try { return await run() } catch (e) { if (isOfficialMissing(e)) return []; throw e }
}
