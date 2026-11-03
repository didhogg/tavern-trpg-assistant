<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Person } from '../../schemas/people'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { usePeopleStore } from '../../stores/people'
import { useLibraryStore } from '../../stores/library'
import { useToastStore } from '../../stores/toast'
import { errorText } from '../format'
import SelectField from '../kit/SelectField.vue'

const props = defineProps<{ person: Person }>()
const app = useAppStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const people = usePeopleStore()
const library = useLibraryStore()
const toast = useToastStore()
const name = ref(props.person.name)
const packs = ref<Array<{ id: string; name: string }>>([])
const packId = ref('')
const mode = ref<'update' | 'new' | undefined>()
const conflict = ref<{ entryId: string } | null>(null)
const error = ref('')
const working = ref(false)

onMounted(async () => {
  packs.value = (await app.svc().mine.list(campaign.workspace?.ruleId)).map((p) => ({ id: p.id, name: p.name }))
  packId.value = (props.person.libraryRef && packs.value.some((p) => p.id === props.person.libraryRef?.packId)) ? props.person.libraryRef.packId : (packs.value.find((p) => p.id.startsWith('u-unsorted-'))?.id ?? packs.value[0]?.id ?? '')
})
async function submit(): Promise<void> {
  if (!name.value.trim()) { error.value = '名字不能为空'; return }
  working.value = true
  error.value = ''
  try {
    const target = people.rowOf(props.person.id) ? props.person.id : props.person
    const result = await people.saveToLibrary(target, { packId: packId.value || undefined, name: name.value, mode: mode.value })
    if (result.conflict) {
      conflict.value = result.conflict
      mode.value = props.person.libraryRef?.entryId === result.conflict.entryId ? 'update' : 'new'
      return
    }
    const pack = packs.value.find((p) => p.id === result.packId)
    await library.refreshInstalled()
    toast.success(`已存到《${pack?.name ?? '我的库'}》${result.version ? ` v${result.version}` : ''}：${name.value.trim()}`)
    modal.close(true)
  } catch (e) {
    error.value = errorText(e)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="trpg-save-lib" data-testid="save-to-library">
    <label class="trpg-field">
      <span class="trpg-field__label">名字</span>
      <input v-model="name" class="trpg-input" maxlength="40" aria-label="存入名字" data-autofocus />
    </label>
    <label class="trpg-field">
      <span class="trpg-field__label">存进</span>
      <SelectField v-model="packId" :options="packs.map((p) => ({ value: p.id, label: p.name }))" label="存进哪个我的包" />
    </label>
    <p class="trpg-field__hint">存成：怪物条目（和库里的怪物同一个结构）。不带：当前生命、临时生命、死亡豁免、已用次数、效果；分类、标签、置顶。</p>
    <div v-if="conflict" class="trpg-save-lib__conflict" role="group" aria-label="同名处理">
      <p>「{{ packs.find((p) => p.id === packId)?.name ?? '我的库' }}」里已经有怪物「{{ name.trim() }}」</p>
      <label class="trpg-check"><input v-model="mode" type="radio" value="update" />更新它</label>
      <label class="trpg-check"><input v-model="mode" type="radio" value="new" />另存一份</label>
    </div>
    <p v-if="error" class="trpg-field__error" role="alert">{{ error }}</p>
    <div class="trpg-save-lib__foot">
      <button class="trpg-btn" type="button" @click="modal.requestClose()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="working || !name.trim()" data-testid="save-to-library-submit" @click="submit">存到库</button>
    </div>
  </div>
</template>

<style scoped>
.trpg-save-lib { display: grid; gap: 10px; }
.trpg-save-lib__conflict { display: grid; gap: 4px; padding: 8px 10px; background: var(--panel); border-left: 3px solid var(--primary); }
.trpg-save-lib__conflict p { margin: 0 0 2px; font-size: 13px; }
.trpg-save-lib__foot { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
</style>
