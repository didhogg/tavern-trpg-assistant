<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useToastStore } from '../../stores/toast'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import MoreMenu, { type MenuItem } from '../kit/MoreMenu.vue'
import { openSaveDrawer, saveNow } from '../saves/actions'

const props = defineProps<{ layout: 'wide' | 'mid' | 'narrow' }>()
const app = useAppStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const ui = useUiStore()

const visible = computed(() => app.booted && campaign.hasCampaign)
const menu = computed<MenuItem[]>(() => [...(visible.value ? [{ key: 'saves', label: '存档' }] : []), { key: 'close', label: '收起助手' }])
const name = computed(() => campaign.currentSave?.name ?? '存档')

function onMenu(key: string): void {
  if (key === 'saves') openSaveDrawer()
  else ui.windowOpen = false
}
const explainReadOnly = () => toast.info('另一个窗口正在使用这份数据，这里只能查看')
</script>

<template>
  <div class="trpg-head__chips">
    <template v-if="visible">
      <button v-if="props.layout !== 'narrow'" class="trpg-pill trpg-chip" type="button" data-testid="save-chip" aria-haspopup="dialog" @click="openSaveDrawer">
        <span class="trpg-chip__name">{{ name }}</span><Icon name="caret-down" :size="14" />
      </button>
      <button v-if="campaign.dirty && !campaign.readOnly" class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" data-testid="save-button" @click="saveNow()">● 保存</button>
      <button v-if="campaign.readOnly" class="trpg-badge trpg-badge--button" data-tone="warn" type="button" @click="explainReadOnly">只读</button>
    </template>
    <MoreMenu v-if="props.layout === 'narrow'" label="助手" :items="menu" @select="onMenu" />
  </div>
</template>
