<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '../../../schemas/people'
import AvatarFrame from '../../kit/AvatarFrame.vue'
import Icon from '../../kit/Icon.vue'

export interface ClassRowView { ref: string; name: string; level: number; subclass?: string }
const props = defineProps<{
  person: Person
  avatarUrl?: string
  classes: ClassRowView[]
  raceName: string
  backgroundName: string
  alignmentLabel: string
  crText?: string
  xpText?: string
  showCrBadges: boolean
  readOnly: boolean
}>()
const emit = defineEmits<{
  identity: [tab?: string]
  classOpen: [ref: string]
  entryOpen: [kind: 'race' | 'background']
  avatar: []
  template: []
  inspiration: []
}>()
const player = computed(() => props.classes.length > 0)
const level = computed(() => props.classes.reduce((sum, row) => sum + row.level, 0))
const showTemplate = computed(() => !props.readOnly && props.person.block.cr !== undefined)
</script>

<template>
  <section class="trpg-card-identity" data-testid="person-card-identity">
    <header class="trpg-card-head"><h2>身份</h2><button v-if="showTemplate" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" data-testid="person-card-template" @click="emit('template')">套用模板</button></header>
    <div class="trpg-card-identity__body">
      <button class="trpg-card-avatar" type="button" :aria-label="`选择 ${person.name || '人物'} 的头像`" data-testid="person-card-avatar" @click="readOnly ? undefined : emit('avatar')">
        <AvatarFrame :w="104" :h="130" :label="person.name || '新人物'" :avatar="avatarUrl" :art="person.block.art" :creature-type="person.block.creatureType?.type" :player="player" :badge="false" />
        <span class="trpg-card-avatar__hover"><Icon name="upload-simple" :size="24" /></span>
        <span v-if="player && level > 0" class="trpg-card-avatar__level" aria-label="总等级"><b>{{ level }}</b></span>
        <span class="trpg-card-avatar__touch"><Icon name="upload-simple" :size="16" /></span>
      </button>
      <div class="trpg-card-identity__main">
        <button class="trpg-card-identity__name" type="button" data-testid="person-card-name-open" @click="emit('identity', 'core')">
          <span class="trpg-card-identity__name-cn">{{ person.name || '新人物' }}</span>
          <span v-if="person.nameEn" class="trpg-card-identity__name-en">{{ person.nameEn }}</span>
        </button>
        <div v-if="showCrBadges && (crText || xpText)" class="trpg-card-identity__badges">
          <span v-if="crText" class="trpg-badge-gold">{{ crText }}</span><span v-if="xpText" class="trpg-badge-gold">{{ xpText }}</span>
        </div>
        <div class="trpg-card-identity__classrow">
          <button class="trpg-fieldbox" type="button" data-testid="person-card-class-box" :aria-label="classes.length ? `查看职业资料：${classes.map((c) => c.name).join('、')}` : '选择职业'" @click="classes.length ? emit('classOpen', classes[0]!.ref) : emit('identity', 'class')">
            <template v-if="classes.length"><template v-for="(row, i) in classes" :key="row.ref"><span v-if="i" class="trpg-fieldbox__sep" aria-hidden="true" /><span class="trpg-fieldbox__name">{{ row.name }}</span><span class="trpg-fieldbox__level">{{ row.level }} 级</span></template></template>
            <span v-else class="trpg-fieldbox__empty">未选职业</span>
          </button>
          <button v-if="!readOnly" class="trpg-btn trpg-btn--small" type="button" data-testid="person-card-levels" @click="emit('identity', classes.length ? 'levels' : 'class')">{{ classes.length ? '等级管理' : '选择职业' }}</button>
        </div>
        <div class="trpg-card-identity__pills">
          <button class="trpg-pill trpg-pill--sm" :class="{ 'is-empty': !raceName }" type="button" data-testid="person-card-race" @click="raceName ? emit('entryOpen', 'race') : emit('identity', 'race')">{{ raceName || '未选种族' }}</button>
          <button class="trpg-pill trpg-pill--sm" :class="{ 'is-empty': !backgroundName }" type="button" data-testid="person-card-background" @click="backgroundName ? emit('entryOpen', 'background') : emit('identity', 'background')">{{ backgroundName || '未选背景' }}</button>
          <span v-if="alignmentLabel" class="trpg-card-identity__align">{{ alignmentLabel }}</span>
        </div>
        <button class="trpg-inspiration" type="button" :aria-pressed="person.inspiration === true" :aria-label="`灵感：${person.inspiration ? '有' : '没有'}`" :disabled="readOnly" data-testid="person-card-inspiration" @click="emit('inspiration')">
          <Icon :name="person.inspiration ? 'star-fill' : 'star'" :size="16" /><span>灵感</span>
        </button>
      </div>
    </div>
  </section>
</template>
