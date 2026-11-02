import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAppStore } from './app'
import { useCampaignStore } from './campaign'
import { useLibraryStore } from './library'
import { uuid } from '../core/ids'
import { TrpgError } from '../core/errors'
import type { Entry } from '../schemas/pack'
import type { WorkspaceData } from '../schemas/campaign'
import { personSchema, type PeopleCategoryId, type Person, type Tag } from '../schemas/people'
import { toEntry } from '../core/library/pins'
import { monsterDataSchema, type MonsterData } from '../rules/dnd5e2014/data/entries/spell-monster'
import { nextNames, serialOfName } from '../ui/people/naming'
import { personFromEntry, toLibraryEntry } from '../ui/people/fromEntry'
import { filterPeople, sortPeople, type CategoryFilter, type SortDir, type SortKey } from '../ui/people/list'
import type { StoreMode, StoreResult } from '../core/library/mine'

export interface PeopleViewOptions {
  categoryId: CategoryFilter
  search?: string
  tagIds?: string[]
  sortKey: SortKey
  sortDir: SortDir
}

/** 人物数据的唯一写入口；所有写入经 campaign.updateData 落盘。 */
export const usePeopleStore = defineStore('people', () => {
  const app = useAppStore()
  const campaign = useCampaignStore()
  const library = useLibraryStore()

  const people = computed<Person[]>(() => campaign.workspace?.data.people ?? [])
  const tags = computed<Tag[]>(() => campaign.workspace?.data.tags ?? [])
  const partyName = computed(() => campaign.workspace?.data.party?.name ?? '')
  const trashed = computed(() => people.value.filter((p) => p.trashedAt !== undefined))

  const tagNames = computed(() => Object.fromEntries(tags.value.map((t) => [t.id, t.name])))
  const counts = computed(() => {
    const visible = people.value.filter((p) => p.trashedAt === undefined)
    return { all: visible.length, party: visible.filter((p) => p.categoryId === 'party').length, npc: visible.filter((p) => p.categoryId === 'npc').length, enemy: visible.filter((p) => p.categoryId === 'enemy').length }
  })

  function requireWorkspace(): WorkspaceData {
    if (!campaign.workspace) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
    return campaign.workspace.data
  }
  function update(fn: (data: WorkspaceData) => WorkspaceData): void {
    campaign.updateData(fn)
  }
  function now(): number { return Date.now() }
  function assertName(name: string): string {
    const next = name.trim()
    if (!next || next.length > 40) throw new TrpgError('E_BAD_NAME', '名字需要 1–40 个字')
    return next
  }
  function find(id: string): Person {
    const person = people.value.find((p) => p.id === id)
    if (!person) throw new TrpgError('E_NOT_FOUND', '没有找到这个人物')
    return person
  }
  function replace(id: string, next: Person): void {
    update((data) => ({ ...data, people: (data.people ?? []).map((p) => (p.id === id ? personSchema.parse(next) : p)) }))
  }

  function create(person: Person): Person {
    const parsed = personSchema.parse({ ...person, name: assertName(person.name) })
    update((data) => ({ ...data, people: [...(data.people ?? []), parsed] }))
    return parsed
  }

  function save(id: string, patch: Partial<Person>): Person {
    const person = find(id)
    const next = personSchema.parse({ ...person, ...patch, name: patch.name === undefined ? person.name : assertName(patch.name), touchedAt: now() })
    replace(id, next)
    return next
  }

  async function blockOf(entry: Entry, packId: string): Promise<MonsterData> {
    if (entry.type === 'npc') {
      if (typeof entry.data.statblock !== 'string') throw new TrpgError('E_BAD_ENTRY', '这个 NPC 没有属性块')
      const statPack = await library.packOfEntry(entry.data.statblock)
      const stat = statPack ? await app.svc().db.entries.get([statPack, entry.data.statblock]) : undefined
      if (!stat) throw new TrpgError('E_NOT_FOUND', '它的数值所在的书没有安装')
      const parsed = monsterDataSchema.safeParse(stat.data)
      if (!parsed.success) throw new TrpgError('E_BAD_ENTRY', 'NPC 的属性块不合法')
      return parsed.data as MonsterData
    }
    const parsed = monsterDataSchema.safeParse(entry.data)
    if (!parsed.success) throw new TrpgError('E_BAD_ENTRY', `模板数据不合法：${parsed.error.issues[0]?.message ?? ''}`)
    void packId
    return parsed.data as MonsterData
  }

  async function addFromEntry(input: { ref: { packId: string; entryId: string }; count: number; categoryId?: PeopleCategoryId }): Promise<Person[]> {
    const count = Math.max(1, Math.min(30, Math.floor(input.count) || 1))
    requireWorkspace()
    const pack = await app.svc().db.packs.get(input.ref.packId)
    const entry = await app.svc().db.entries.get([input.ref.packId, input.ref.entryId])
    if (!pack || !entry) throw new TrpgError('E_NOT_FOUND', '没有找到这个模板')
    const block = await blockOf(toEntry(entry), input.ref.packId)
    const categoryId = input.categoryId ?? (entry.type === 'npc' ? 'npc' : 'enemy')
    const base = entry.name
    const names = nextNames(base, people.value.map((p) => p.name), count)
    const created = names.map((name) => {
      const serial = serialOfName(base, name)
      return personFromEntry(toEntry(entry), block, { name, categoryId, now: now(), serial, sourceRef: { packId: input.ref.packId, version: pack.version, entryId: input.ref.entryId } })
    })
    update((data) => ({ ...data, people: [...(data.people ?? []), ...created] }))
    return created
  }

  function duplicate(id: string): Person {
    const source = find(id)
    const names = nextNames(source.name, people.value.map((p) => p.name), 1)
    const name = names[0]
    const next = personSchema.parse({
      ...structuredClone(source),
      id: `p-${uuid()}`,
      name,
      serial: serialOfName(source.name, name),
      trashedAt: undefined,
      trashedFrom: undefined,
      createdAt: now(),
      touchedAt: now(),
    })
    update((data) => ({ ...data, people: [...(data.people ?? []), next] }))
    return next
  }

  function move(ids: string[], categoryId: PeopleCategoryId): void {
    update((data) => ({ ...data, people: (data.people ?? []).map((p) => ids.includes(p.id) ? { ...p, categoryId, touchedAt: now() } : p) }))
  }

  function setPinned(id: string, on: boolean): void {
    const person = find(id)
    replace(id, { ...person, pinned: on, touchedAt: now() })
  }

  function applyTags(ids: string[], patch: { add?: string[]; remove?: string[] }): void {
    const add = new Set(patch.add ?? [])
    const remove = new Set(patch.remove ?? [])
    update((data) => ({ ...data, people: (data.people ?? []).map((p) => ids.includes(p.id) ? { ...p, tags: [...new Set([...p.tags.filter((t) => !remove.has(t)), ...add])], touchedAt: now() } : p) }))
  }

  function createTag(name: string): Tag {
    const next = name.trim()
    if (!next || next.length > 24) throw new TrpgError('E_BAD_NAME', '标签名需要 1–24 个字')
    if (tags.value.some((t) => t.name.toLowerCase() === next.toLowerCase())) throw new TrpgError('E_BAD_NAME', '已经有这个标签了')
    const tag = { id: `tag-${uuid().slice(0, 8)}`, name: next }
    update((data) => ({ ...data, tags: [...(data.tags ?? []), tag] }))
    return tag
  }

  function renameTag(id: string, name: string): Tag {
    const next = name.trim()
    if (!next || next.length > 24) throw new TrpgError('E_BAD_NAME', '标签名需要 1–24 个字')
    if (tags.value.some((t) => t.id !== id && t.name.toLowerCase() === next.toLowerCase())) throw new TrpgError('E_BAD_NAME', '已经有这个标签了')
    const tag = tags.value.find((t) => t.id === id)
    if (!tag) throw new TrpgError('E_NOT_FOUND', '没有找到这个标签')
    const changed = { ...tag, name: next }
    update((data) => ({ ...data, tags: (data.tags ?? []).map((t) => (t.id === id ? changed : t)) }))
    return changed
  }

  function deleteTag(id: string): void {
    update((data) => ({
      ...data,
      tags: (data.tags ?? []).filter((t) => t.id !== id),
      people: (data.people ?? []).map((p) => ({ ...p, tags: p.tags.filter((t) => t !== id) })),
    }))
  }

  function renameParty(name: string): void {
    const next = name.trim()
    if (next.length > 40) throw new TrpgError('E_BAD_NAME', '队伍名最多 40 个字')
    update((data) => ({ ...data, party: { name: next } }))
  }

  function trash(ids: string[]): void {
    const stamp = now()
    update((data) => ({ ...data, people: (data.people ?? []).map((p) => ids.includes(p.id) ? { ...p, trashedAt: stamp, trashedFrom: p.categoryId, touchedAt: stamp } : p) }))
  }

  function restore(ids: string[]): void {
    update((data) => ({ ...data, people: (data.people ?? []).map((p) => ids.includes(p.id) ? { ...p, trashedAt: undefined, trashedFrom: undefined, categoryId: p.trashedFrom ?? p.categoryId, touchedAt: now() } : p) }))
  }

  function purge(ids: string[]): void {
    update((data) => ({ ...data, people: (data.people ?? []).filter((p) => !ids.includes(p.id)) }))
  }

  function touch(id: string): void {
    const person = find(id)
    replace(id, { ...person, touchedAt: now() })
  }

  async function saveToLibrary(idOrPerson: string | Person, options: { packId?: string; name: string; mode?: StoreMode }): Promise<StoreResult> {
    const person = typeof idOrPerson === 'string' ? find(idOrPerson) : idOrPerson
    const entry = toLibraryEntry(person, { name: options.name })
    const result = await app.svc().mine.store({ ruleId: campaign.workspace?.ruleId ?? 'dnd5e2014', packId: options.packId, entry, mode: options.mode })
    if (!result.conflict && result.packId && result.entryId && typeof idOrPerson === 'string') {
      update((data) => ({ ...data, people: (data.people ?? []).map((p) => p.id === idOrPerson ? { ...p, libraryRef: { packId: result.packId!, entryId: result.entryId! }, touchedAt: now() } : p) }))
    }
    return result
  }

  function view(options: PeopleViewOptions): Person[] {
    return sortPeople(filterPeople(people.value, { categoryId: options.categoryId, search: options.search, tagIds: options.tagIds, tagNames: tagNames.value }), { key: options.sortKey, dir: options.sortDir })
  }

  function rowOf(id: string): Person | undefined {
    return people.value.find((p) => p.id === id)
  }

  return { people, tags, partyName, trashed, tagNames, counts, create, save, addFromEntry, duplicate, move, setPinned, applyTags, createTag, renameTag, deleteTag, renameParty, trash, restore, purge, touch, saveToLibrary, view, rowOf }
})
