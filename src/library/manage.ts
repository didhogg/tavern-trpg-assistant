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

/**
 * 一步撤销记录（P5.5 B2）：改之前这一条在可编辑自制里的作者原文；null = 之前没有这一条（撤销 = 删掉）。
 * link：这一条是房规时它的链接（删房规的撤销要连链接一起恢复，建房规的撤销要连链接一起去掉）。
 */
export interface EditStep {
  at: number
  prop: string
  before: Record<string, unknown> | null
  link?: HouseRuleLink
}

/**
 * 编辑器草稿（P5.5 B7）。结构照作者构建器的草稿（makebrew-builder-base.js getSaveableState：s = 条目原文，
 * m = _getInitialMetaState 的 isModified / isPersisted / nameOriginal / styleHint），另记在哪个数据集、哪一类、改的是谁。
 * 草稿只是草稿：不写作者内容，保存条目时才写。
 */
export interface EditDraft {
  at: number
  codeSet: string
  prop: string
  s: Record<string, unknown>
  m: { isModified: boolean; isPersisted: boolean; nameOriginal: string | null; styleHint: 'classic' | 'one' | null }
  /** new：新条目，存进哪个包（来源编号）；mine：改自己的条目（作者 uniqueId）；house：改官方 / 下载的条目（存成房规）。 */
  target: { kind: 'new'; pack: string | null } | { kind: 'mine'; uniqueId: string } | { kind: 'house'; ref: EntryRef }
}

/** 每条最多留几步撤销（驾驶员 2026-11-12 定 20）。 */
export const HISTORY_LIMIT = 20

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

  /** 所有层级的版本选择（删除影响预览用）：层级、目标 refKey、选的备选编号。 */
  async allChoices(): Promise<Array<{ level: string; target: string; altId: string }>> {
    return (await this.all<string>('choice')).map((r) => {
      const at = r.key.indexOf('|')
      return { level: r.key.slice(0, at), target: r.key.slice(at + 1), altId: r.value }
    })
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

  /** 一条自制条目的撤销记录（键 = 数据集|类别|作者 uniqueId：改名不变），旧的在前。 */
  async history(key: string): Promise<EditStep[]> {
    return ((await this.db.manage.get(['history', key]))?.value as EditStep[] | undefined) ?? []
  }

  /** 记一步；超过上限丢最早的。 */
  async pushHistory(key: string, step: EditStep, limit = HISTORY_LIMIT): Promise<void> {
    await this.put('history', key, [...(await this.history(key)), step].slice(-limit))
  }

  /** 取出最近一步（取出即从记录里去掉）；没有就是 null。 */
  async popHistory(key: string): Promise<EditStep | null> {
    const list = await this.history(key)
    const step = list.pop() ?? null
    await this.put('history', key, list.length ? list : null)
    return step
  }

  /** 全部草稿（键 → 草稿）。 */
  async drafts(): Promise<Map<string, EditDraft>> {
    return new Map((await this.all<EditDraft>('draft')).map((r) => [r.key, r.value]))
  }

  async draft(key: string): Promise<EditDraft | null> {
    return ((await this.db.manage.get(['draft', key]))?.value as EditDraft | undefined) ?? null
  }

  /** 写草稿（同键覆盖，只留最新一份）；null = 丢掉。 */
  putDraft(key: string, draft: EditDraft | null): Promise<void> {
    return this.put('draft', key, draft)
  }
}
