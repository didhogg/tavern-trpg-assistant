// 插件的管理记录读写（D2-P3 整体设计 §2.8）：归类、自建范围、版本选择（全局 / 某规则）、房规链接。
// 战役自己的选书设置不在这里（存在战役记录里，P3-3），由调用方传进来。
import type { LibraryDatabase, ManageRecord } from './db'
import type { Assignment, EntryRef, ScopeDef } from './scopes'

/** 版本选择的层级：全局，或某套规则下的全部战役。本战役的选择在战役记录里。 */
export type ChoiceLevel = 'global' | `rule:${string}`

export interface HouseRuleLink {
  /** 房规条目（可编辑自制里的那一条）。 */
  house: EntryRef
  /** 它改的是哪一条。 */
  target: EntryRef
}

export class ManageStore {
  constructor(private readonly db: LibraryDatabase) {}

  private async all<T>(kind: ManageRecord['kind']): Promise<Array<{ key: string; value: T }>> {
    return (await this.db.manage.where('kind').equals(kind).toArray()).map((r) => ({ key: r.key, value: r.value as T }))
  }

  private async put(kind: ManageRecord['kind'], key: string, value: unknown | null): Promise<void> {
    if (value === null) await this.db.manage.delete([kind, key])
    else await this.db.manage.put({ kind, key, value, updatedAt: Date.now() })
  }

  /** 用户的归类（单位 → 归属）；没有记录的单位用作者判断。 */
  async assignments(): Promise<Map<string, Assignment>> {
    return new Map((await this.all<Assignment>('assign')).map((r) => [r.key, r.value]))
  }

  /** 改归类；null = 清掉，回到作者判断。 */
  setAssignment(unit: string, a: Assignment | null): Promise<void> {
    return this.put('assign', unit, a)
  }

  async userScopes(): Promise<ScopeDef[]> {
    return (await this.all<ScopeDef>('scope')).map((r) => r.value)
  }

  addScope(scope: { id: string; name: string }): Promise<void> {
    return this.put('scope', scope.id, { id: scope.id, name: scope.name })
  }

  /** 删自建范围，同时从所有归类里去掉它。 */
  async removeScope(id: string): Promise<void> {
    await this.db.transaction('rw', this.db.manage, async () => {
      await this.put('scope', id, null)
      for (const [unit, a] of await this.assignments()) {
        if (a.scopes.includes(id)) await this.setAssignment(unit, { ...a, scopes: a.scopes.filter((s) => s !== id) })
      }
    })
  }

  /** 某一层的版本选择：目标 refKey → 备选编号（'base' = 原件）。 */
  async choices(level: ChoiceLevel): Promise<Record<string, string>> {
    const prefix = `${level}|`
    return Object.fromEntries((await this.all<string>('choice')).filter((r) => r.key.startsWith(prefix)).map((r) => [r.key.slice(prefix.length), r.value]))
  }

  /** 选版本；null = 清掉这一层的选择。 */
  setChoice(level: ChoiceLevel, targetKey: string, altId: string | null): Promise<void> {
    return this.put('choice', `${level}|${targetKey}`, altId)
  }

  async houseRules(): Promise<HouseRuleLink[]> {
    return (await this.all<HouseRuleLink>('houserule')).map((r) => r.value)
  }

  linkHouseRule(link: HouseRuleLink): Promise<void> {
    return this.put('houserule', `${link.house.set}|${link.house.prop}|${link.house.hash}`, link)
  }

  unlinkHouseRule(house: EntryRef): Promise<void> {
    return this.put('houserule', `${house.set}|${house.prop}|${house.hash}`, null)
  }
}
