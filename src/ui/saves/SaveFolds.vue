<script setup lang="ts">
import { ref } from 'vue'
import type { SaveSlot } from '../../schemas/campaign'
import { formatTime, summaryLine } from '../format'
import MoreMenu from '../kit/MoreMenu.vue'

defineProps<{ autos: SaveSlot[]; deleted: SaveSlot[]; others: SaveSlot[]; readOnly?: boolean; ruleName: (id: string) => string; ruleInstalled: (id: string) => boolean }>()
const emit = defineEmits<{
  load: [save: SaveSlot]
  'auto-as-manual': [save: SaveSlot]
  restore: [save: SaveSlot]
  purge: [save: SaveSlot]
  'purge-all': []
}>()
type Fold = 'auto' | 'deleted' | 'other'
const open = ref<Fold | null>(null)
const toggle = (fold: Fold) => (open.value = open.value === fold ? null : fold)
</script>

<template>
  <div v-if="autos.length || deleted.length || others.length" class="trpg-folds">
    <div class="trpg-folds__tabs" role="group" aria-label="更多存档">
      <button v-if="autos.length" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :aria-expanded="open === 'auto'" @click="toggle('auto')">{{ open === 'auto' ? '▾' : '▸' }} 自动存档 {{ autos.length }}</button>
      <button v-if="deleted.length" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :aria-expanded="open === 'deleted'" @click="toggle('deleted')">{{ open === 'deleted' ? '▾' : '▸' }} 最近删除 {{ deleted.length }}</button>
      <button v-if="others.length" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :aria-expanded="open === 'other'" @click="toggle('other')">{{ open === 'other' ? '▾' : '▸' }} 其他规则 {{ others.length }}</button>
    </div>
    <ul v-if="open === 'auto'" class="trpg-list">
      <li v-for="s in autos" :key="s.id" class="trpg-row">
        <div class="trpg-row__main">
          <div class="trpg-row__title">{{ formatTime(s.createdAt) }} · {{ s.autoReason }}</div>
          <div v-if="summaryLine(s)" class="trpg-row__meta">{{ summaryLine(s) }}</div>
        </div>
        <div class="trpg-row__end">
          <button class="trpg-btn" type="button" :disabled="readOnly" @click="emit('load', s)">读取</button>
          <MoreMenu :label="`自动存档 ${formatTime(s.createdAt)}`" :items="[{ key: 'manual', label: '另存为存档' }]" @select="emit('auto-as-manual', s)" />
        </div>
      </li>
    </ul>
    <template v-if="open === 'deleted'">
      <ul class="trpg-list">
        <li v-for="s in deleted" :key="s.id" class="trpg-row">
          <div class="trpg-row__main">
            <div class="trpg-row__title">{{ s.name }}</div>
            <div class="trpg-row__meta">删除于 {{ formatTime(s.deletedAt ?? 0) }}</div>
          </div>
          <div class="trpg-row__end">
            <button class="trpg-btn" type="button" :disabled="readOnly" @click="emit('restore', s)">恢复</button>
            <button class="trpg-btn" type="button" :disabled="readOnly" @click="emit('purge', s)">彻底删除</button>
          </div>
        </li>
      </ul>
      <button class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" @click="emit('purge-all')">清空最近删除</button>
    </template>
    <ul v-if="open === 'other'" class="trpg-list">
      <li v-for="s in others" :key="s.id" class="trpg-row">
        <div class="trpg-row__main">
          <div class="trpg-row__title">{{ s.name }} <span class="trpg-badge">{{ ruleName(s.ruleId) }}</span></div>
          <div class="trpg-row__meta">{{ s.ownerLabel }} · {{ formatTime(s.updatedAt) }}</div>
        </div>
        <div class="trpg-row__end">
          <button class="trpg-btn" type="button" :disabled="readOnly || !ruleInstalled(s.ruleId)" :title="ruleInstalled(s.ruleId) ? undefined : '规则未安装'" @click="emit('load', s)">
            {{ ruleInstalled(s.ruleId) ? '切换规则并读取' : '规则未安装' }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
