import { computed, shallowRef } from 'vue'
import { derivePerson, effectSourcesOf, type PersonDerived, type SourcedEffect } from '../../../rules/dnd5e2014/derive'
import type { Person } from '../../../schemas/people'
import { useCampaignStore } from '../../../stores/campaign'
import { usePeopleStore } from '../../../stores/people'
import { deriveContextOf, loadCardData, type CardData } from '../../people/card/cardData'

/** 骰盘需要的人物与派生数据：打开骰盘时才读一次资料库（只读）。 */
export function useTrayData() {
  const people = usePeopleStore()
  const campaign = useCampaignStore()
  const data = shallowRef<CardData | null>(null)
  const loading = shallowRef(false)
  async function ensure(): Promise<void> {
    if (data.value || loading.value) return
    loading.value = true
    try { data.value = await loadCardData(undefined as unknown as Person, campaign.workspace?.enabledPacks.map((p) => p.id) ?? [], campaign.workspace?.ruleId ?? 'dnd5e2014') } finally { loading.value = false }
  }
  const actors = computed(() => people.people)
  const find = (id: string): Person | undefined => people.people.find((p) => p.id === id)
  function derivedOf(id: string): PersonDerived | null {
    const p = find(id)
    return p && data.value ? derivePerson(p, deriveContextOf(p, data.value)) : null
  }
  function sourcesOf(id: string): SourcedEffect[] {
    const p = find(id)
    return p && data.value ? effectSourcesOf(p.effects, p.exhaustion ?? 0, data.value.exhaustionLevels) : []
  }
  return { data, ensure, actors, find, derivedOf, sourcesOf }
}
