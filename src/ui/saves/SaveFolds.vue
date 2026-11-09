<script setup lang="ts">
import type { SaveSlot } from '../../schemas/campaign'
import { formatTime, summaryLine } from '../format'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'

/** 三个折叠区：自动存档（只有[读取][存为手动存档]，不能单独删）/ 最近删除（[恢复][彻底删除]）/ 其他规则。 */
defineProps<{ autos: SaveSlot[]; deleted: SaveSlot[]; others: SaveSlot[]; readOnly?: boolean; ruleName: (id: string) => string; ruleInstalled: (id: string) => boolean }>()
const emit = defineEmits<{
  load: [save: SaveSlot]
  'auto-as-manual': [save: SaveSlot]
  restore: [save: SaveSlot]
  purge: [save: SaveSlot]
  'purge-all': []
}>()
</script>

<template>
  <details v-if="autos.length" class="trpg-fold" data-testid="fold-auto">
    <summary><Icon class="trpg-fold__chev-open" name="caret-down" :size="16" /><Icon class="trpg-fold__chev-closed" name="caret-right" :size="16" />自动存档<small>{{ autos.length }}</small></summary>
    <ul class="trpg-saves">
      <li v-for="s in autos" :key="s.id">
        <div class="trpg-saves__main">
          <div class="trpg-saves__top"><b>{{ s.autoReason }}</b></div>
          <div class="trpg-saves__meta">{{ formatTime(s.createdAt) }} · 自动<template v-if="summaryLine(s)"> · {{ summaryLine(s) }}</template></div>
        </div>
        <div class="trpg-saves__end">
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" @click="emit('load', s)">读取</button>
          <MoreMenu :label="`自动存档 ${formatTime(s.createdAt)}`" :items="[{ key: 'manual', label: '存为手动存档' }]" @select="emit('auto-as-manual', s)" />
        </div>
      </li>
    </ul>
  </details>
  <details v-if="deleted.length" class="trpg-fold" data-testid="fold-deleted">
    <summary><Icon class="trpg-fold__chev-open" name="caret-down" :size="16" /><Icon class="trpg-fold__chev-closed" name="caret-right" :size="16" />最近删除<small>{{ deleted.length }}</small></summary>
    <ul class="trpg-saves">
      <li v-for="s in deleted" :key="s.id">
        <div class="trpg-saves__main">
          <div class="trpg-saves__top"><b>{{ s.name }}</b></div>
          <div class="trpg-saves__meta">删除于 {{ formatTime(s.deletedAt ?? 0) }} · {{ s.ownerLabel }}</div>
        </div>
        <div class="trpg-saves__end">
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :disabled="readOnly" @click="emit('restore', s)">恢复</button>
          <button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" :disabled="readOnly" @click="emit('purge', s)">彻底删除</button>
        </div>
      </li>
    </ul>
    <div class="trpg-fold__actions"><button class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" @click="emit('purge-all')">清空最近删除</button></div>
  </details>
  <details v-if="others.length" class="trpg-fold" data-testid="fold-others">
    <summary><Icon class="trpg-fold__chev-open" name="caret-down" :size="16" /><Icon class="trpg-fold__chev-closed" name="caret-right" :size="16" />其他规则<small>{{ others.length }}</small></summary>
    <ul class="trpg-saves">
      <li v-for="s in others" :key="s.id">
        <div class="trpg-saves__main">
          <div class="trpg-saves__top"><b>{{ s.name }}</b><span class="trpg-badge">{{ ruleName(s.ruleId) }}</span></div>
          <div class="trpg-saves__meta">{{ s.ownerLabel }} · {{ formatTime(s.updatedAt) }}</div>
        </div>
        <div class="trpg-saves__end">
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly || !ruleInstalled(s.ruleId)" :title="ruleInstalled(s.ruleId) ? undefined : '规则未安装'" @click="emit('load', s)">{{ ruleInstalled(s.ruleId) ? '切换规则并读取' : '规则未安装' }}</button>
        </div>
      </li>
    </ul>
  </details>
</template>
