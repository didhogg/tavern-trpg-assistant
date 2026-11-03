<script setup lang="ts">
import { ref } from 'vue'
import { useCampaignStore } from '../../stores/campaign'
import { usePeopleStore } from '../../stores/people'
import { errorText } from '../format'
import Icon from '../kit/Icon.vue'

const props = defineProps<{ name: string; count: number; avgHp?: number }>()
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
    <Icon name="users-three" :size="20" class="trpg-partybar__icon" />
    <template v-if="editing">
      <input v-model="value" class="trpg-input trpg-partybar__input" maxlength="40" aria-label="队伍名" data-autofocus @keydown.enter.prevent="save" @keydown.esc.prevent="editing = false" />
      <button class="trpg-btn trpg-btn--small" type="button" @click="save">保存</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="editing = false">取消</button>
    </template>
    <template v-else>
      <strong class="trpg-partybar__name" data-testid="people-party-name">{{ name || '队伍' }}</strong>
      <button class="trpg-icon-btn trpg-partybar__edit" type="button" aria-label="改名" title="改名" :disabled="campaign.readOnly" @click="start"><Icon name="pencil-simple" :size="16" /></button>
      <span class="trpg-partybar__count">{{ count }} 人</span>
    </template>
    <span v-if="avgHp !== undefined" class="trpg-partybar__avg">队伍平均生命 {{ avgHp }}%</span>
    <span v-if="error" class="trpg-field__error" role="alert">{{ error }}</span>
  </div>
</template>
