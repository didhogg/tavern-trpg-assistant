<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Person } from '../../../schemas/people'
import type { Entry } from '../../../schemas/pack'
import { monsterDataSchema } from '../../../rules/dnd5e2014/data/entries/spell-monster'
import { useAppStore } from '../../../stores/app'
import { useLibraryStore } from '../../../stores/library'
import { useModalStore } from '../../../stores/modal'
import { useToastStore } from '../../../stores/toast'
import { uuid } from '../../../core/ids'
import { errorText } from '../../format'
import { emptyPerson, toLibraryEntry } from '../fromEntry'
import { hpFromEntry } from '../hp'
import PersonCard from './PersonCard.vue'
import EmptyState from '../../kit/EmptyState.vue'

const props = defineProps<{ packId: string; entryId: string }>()
const app = useAppStore()
const library = useLibraryStore()
const modal = useModalStore()
const toast = useToastStore()
const person = ref<Person | null>(null)
const error = ref('')

onMounted(async () => {
  try {
    const row = await app.svc().db.entries.get([props.packId, props.entryId])
    if (!row) throw new Error('没有找到这条人物资料')
    const parsed = monsterDataSchema.safeParse(row.data)
    if (!parsed.success) throw new Error(`人物资料不合法：${parsed.error.issues[0]?.message ?? ''}`)
    const value = emptyPerson({ id: `p-${uuid()}`, name: row.name, categoryId: 'enemy', now: app.svc().now() })
    value.block = parsed.data
    const hp = hpFromEntry(parsed.data)
    value.hp.current = hp.current
    value.nameEn = row.nameEn
    value.libraryRef = { packId: props.packId, entryId: props.entryId }
    person.value = value
  } catch (err) {
    error.value = errorText(err)
  }
})
async function save(draft: Person): Promise<void> {
  try {
    const entry: Entry = toLibraryEntry(draft, { name: draft.name })
    entry.id = props.entryId
    const pack = await app.svc().mine.saveEntry(props.packId, entry)
    await library.refreshInstalled()
    toast.success(`已保存到《${pack.name}》v${pack.version}`)
    modal.close(true)
  } catch (err) {
    toast.error(`没能保存到库：${errorText(err)}`)
  }
}
</script>

<template>
  <div class="trpg-library-card" data-testid="library-person-card">
    <PersonCard v-if="person" :person="person" library-mode @back="modal.close(true)" @saved="save" />
    <EmptyState v-else-if="error" icon="warning" :text="error" />
    <div v-else class="trpg-card-skeleton" aria-busy="true"><span class="trpg-skeleton" /><span class="trpg-skeleton" /></div>
  </div>
</template>
