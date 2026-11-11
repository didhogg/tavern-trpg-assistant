import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { OfficialUpdateCheck } from '../library/official-update'
import type { BrewUpdateCheck } from '../library/runtime/frame/brew-commands'

/**
 * 书架【拉取更新】的结果（P5 T6 B3）：只存界面要显示的检查结果，书架行据此显示【有更新】。
 * 有没有更新、能不能单本更新全由后端判断（updates.check / apply、brewCheckUpdates）。
 */
export const useUpdatesStore = defineStore('updates', () => {
  const checking = ref(false)
  const official = shallowRef<OfficialUpdateCheck[]>([])
  const brew = shallowRef<Array<BrewUpdateCheck & { setId: string }>>([])
  const available = computed(() => official.value.filter((o) => o.status === 'available'))
  const count = computed(() => available.value.reduce((n, o) => n + Math.max(1, (o.objects ?? []).filter((x) => x.added || x.changed || x.removed).length), 0) + brew.value.length)
  function set(o: OfficialUpdateCheck[], b: Array<BrewUpdateCheck & { setId: string }>): void { official.value = o; brew.value = b }
  /** 官方某一行（书 / 冒险）在检查结果里的变化；没有变化为 null。 */
  function officialOf(setId: string, kind: 'book' | 'adventure', id: string | null, source: string): { check: OfficialUpdateCheck; name: string } | null {
    const check = available.value.find((o) => o.setId === setId)
    const obj = check?.objects?.find((x) => x.kind === kind && (id ? x.id === id : x.source === source) && (x.added || x.changed || x.removed))
    return check && obj ? { check, name: obj.name || obj.id } : null
  }
  function brewOf(docIdLocal: string | undefined): (BrewUpdateCheck & { setId: string }) | null { return docIdLocal ? brew.value.find((b) => b.docIdLocal === docIdLocal) ?? null : null }
  function done(setId: string, docIdLocal?: string): void {
    if (docIdLocal) brew.value = brew.value.filter((b) => b.docIdLocal !== docIdLocal)
    else official.value = official.value.filter((o) => o.setId !== setId)
  }
  return { checking, official, brew, available, count, set, officialOf, brewOf, done }
})
