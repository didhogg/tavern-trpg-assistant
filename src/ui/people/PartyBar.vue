<script setup lang="ts">
import { ref } from 'vue'
import { useCampaignStore } from '../../stores/campaign'
import { usePeopleStore } from '../../stores/people'
import { errorText } from '../format'

const props = defineProps<{ name: string; count: number }>()
const campaign = useCampaignStore()
const people = usePeopleStore()
const editing = ref(false)
const value = ref(props.name)
const error = ref('')
function start(): void { value.value = props.name; editing.value = true; error.value = '' }
function save(): void {
  try {
    people.renameParty(value.value)
    editing.value = false
  } catch (e) { error.value = errorText(e) }
}
</script>

<template>
  <div class="trpg-partybar">
    <template v-if="editing">
      <input v-model="value" class="trpg-input trpg-partybar__input" maxlength="40" aria-label="队伍名" data-autofocus @keydown.enter.prevent="save" @keydown.esc.prevent="editing = false" />
      <button class="trpg-btn trpg-btn--small" type="button" @click="save">保存</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="editing = false">取消</button>
    </template>
    <template v-else>
      <strong class="trpg-partybar__name" data-testid="people-party-name">{{ name || '队伍' }}</strong>
      <button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :disabled="campaign.readOnly" @click="start">改名</button>
      <span class="trpg-row__meta">{{ count }} 人</span>
    </template>
    <span v-if="error" class="trpg-field__error" role="alert">{{ error }}</span>
  </div>
</template>

<style scoped>
.trpg-partybar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 2px 0 10px; }
.trpg-partybar__name { font-family: var(--font-serif); font-size: 16px; }
.trpg-partybar__input { width: 220px; min-height: 32px; }
</style>
