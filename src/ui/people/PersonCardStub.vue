<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Person } from '../../schemas/people'
import { useCampaignStore } from '../../stores/campaign'
import { usePeopleStore } from '../../stores/people'
import { errorText } from '../format'
import { useToastStore } from '../../stores/toast'
import AvatarFrame from '../kit/AvatarFrame.vue'
import Icon from '../kit/Icon.vue'

const props = defineProps<{ person?: Person; draft?: Person; from?: string }>()
const emit = defineEmits<{ back: []; saved: [person: Person] }>()
const campaign = useCampaignStore()
const people = usePeopleStore()
const toast = useToastStore()
const source = props.person ?? props.draft
const name = ref(source?.name ?? '')
const working = ref(false)
const avatar = typeof source?.avatar === 'string' ? source.avatar : undefined
const title = ref(props.from ? `来自模板「${props.from}」` : props.person ? props.person.name : '新人物')

onMounted(() => { if (props.person) people.touch(props.person.id) })
async function save(): Promise<void> {
  if (!name.value.trim() || working.value) return
  working.value = true
  try {
    let saved: Person
    if (props.person) saved = people.save(props.person.id, { name: name.value })
    else if (props.draft) saved = people.create({ ...props.draft, name: name.value })
    else return
    toast.success('已保存')
    emit('saved', saved)
  } catch (error) {
    toast.error(`没能保存：${errorText(error)}`)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="trpg-person-card" data-testid="person-card">
    <div class="trpg-person-card__head">
      <button class="trpg-btn trpg-btn--quiet" type="button" data-testid="person-card-back" @click="emit('back')"><Icon name="caret-left" :size="16" />人物</button>
      <h2>{{ title }}</h2>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!name.trim() || campaign.readOnly || working" data-testid="person-card-save" @click="save">保存</button>
    </div>
    <div class="trpg-person-card__body trpg-dialog">
      <div class="trpg-person-card__who">
        <AvatarFrame :w="96" :h="120" :label="name || '新人物'" :avatar="avatar" :art="source?.block.art" :creature-type="source?.block.creatureType?.type" :player="(source?.block.classes ?? []).length > 0" />
        <label class="trpg-field trpg-person-card__name">
          <span class="trpg-field__label">名字</span>
          <input v-model="name" class="trpg-input" maxlength="40" aria-label="人物名字" data-autofocus data-testid="person-card-name" @keydown.enter.prevent="save" />
        </label>
      </div>
      <p class="trpg-field__hint">人物卡的完整页面之后提供；保存后才进入人物列表。</p>
    </div>
  </div>
</template>
