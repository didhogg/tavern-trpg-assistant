<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '../../../schemas/people'
import AvatarFrame from '../../kit/AvatarFrame.vue'
import Icon from '../../kit/Icon.vue'

export interface IdentityPart {
  text: string
  strong: boolean
  kind: 'class' | 'race'
}

const props = defineProps<{
  person: Person
  avatarUrl?: string
  identity: IdentityPart[]
  templateName?: string
  crText?: string
  readOnly: boolean
}>()
const emit = defineEmits<{
  identity: []
  avatar: []
  template: []
  inspiration: []
  placeholder: [kind: 'upgrade' | 'level']
  tab: [id: string]
}>()
const classes = computed(() => props.person.block.classes ?? [])
const player = computed(() => classes.value.length > 0)
const level = computed(() => classes.value.reduce((sum, row) => sum + row.level, 0))
const showTemplate = computed(() => props.person.block.cr !== undefined)
</script>

<template>
  <section class="trpg-card-identity" data-testid="person-card-identity">
    <div class="trpg-card-identity__avatar-col">
      <button class="trpg-card-avatar" type="button" :aria-label="`选择 ${person.name || '人物'} 的头像`" data-testid="person-card-avatar" @click="readOnly ? undefined : emit('avatar')">
        <AvatarFrame :w="96" :h="120" :label="person.name || '新人物'" :avatar="avatarUrl" :art="person.block.art" :creature-type="person.block.creatureType?.type" :player="player" :badge="!player" />
        <span class="trpg-card-avatar__hover"><Icon name="upload-simple" :size="24" /></span>
        <span v-if="player && level > 0" class="trpg-card-avatar__level"><b>{{ level }}</b></span>
        <span class="trpg-card-avatar__touch"><Icon name="upload-simple" :size="14" /></span>
      </button>
      <div v-if="!showTemplate" class="trpg-card-identity__level-buttons">
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" @click="emit('placeholder', 'upgrade')">升级</button>
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" @click="emit('placeholder', 'level')">降级</button>
      </div>
    </div>
    <div class="trpg-card-identity__main">
      <button class="trpg-card-identity__name" type="button" data-testid="person-card-name-open" @click="emit('identity')">
        <span class="trpg-card-identity__name-cn">{{ person.name || '新人物' }}</span>
        <span v-if="person.nameEn" class="trpg-card-identity__name-en">{{ person.nameEn }}</span>
      </button>
      <div class="trpg-card-identity__line">
        <template v-if="identity.length">
          <template v-for="(part, index) in identity" :key="`${part.kind}-${index}`"><span v-if="index" class="trpg-card-identity__sep">·</span><button class="trpg-card-identity__part" :class="{ 'is-strong': part.strong }" type="button" @click="part.kind === 'race' ? emit('identity') : emit('tab', 'classes')">{{ part.text }}</button></template>
        </template>
        <button v-else-if="showTemplate" class="trpg-card-identity__part is-strong" type="button">{{ templateName || person.name }}</button>
        <template v-if="showTemplate && crText"><span class="trpg-card-identity__sep">·</span><span class="trpg-card-identity__part">{{ crText }}</span></template>
        <template v-else-if="!showTemplate && !person.block.race"><span class="trpg-card-identity__sep">·</span><button class="trpg-card-identity__pick" type="button" @click="emit('identity')">选种族 ›</button></template>
      </div>
      <div class="trpg-card-identity__tools">
        <button class="trpg-inspiration" type="button" :aria-pressed="person.inspiration === true" :aria-label="`灵感：${person.inspiration ? '有' : '没有'}`" :disabled="readOnly" data-testid="person-card-inspiration" @click="emit('inspiration')">
          <Icon :name="person.inspiration ? 'star-fill' : 'star'" :size="18" /><span>灵感</span>
        </button>
        <button v-if="!readOnly" class="trpg-btn trpg-btn--small" type="button" data-testid="person-card-template" @click="emit('template')">套用模板</button>
      </div>
    </div>
  </section>
</template>
