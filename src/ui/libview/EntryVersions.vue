<script setup lang="ts">
import { computed } from 'vue'
import type { ScopedDetail } from '../../library/scoped'
import type { EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import { askConfirm } from '../kit/confirm'

/** 条目的变体 / 同编号版本 / 覆盖（U1f）：变体紧挨着条目显示；同编号的版本可以【覆盖】（先预览再确认），覆盖后可【复原】；生效层级来自设置（默认本战役）。 */
const props = defineProps<{ detail: ScopedDetail | null; entryRef: EntryRef; previewCopy?: boolean }>()
const emit = defineEmits<{ changed: [] }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()

const level = computed(() => app.settings?.library.overrideLevel ?? 'campaign')
const levelWord = computed(() => (level.value === 'campaign' ? '本战役' : level.value === 'rule' ? '当前规则' : '全局'))
const alts = computed(() => props.detail?.alternatives ?? [])
const effective = computed(() => props.detail?.version.altId ?? 'base')
const label = (a: { filename: string | null; kind: string }): string => (a.kind === 'houserule' ? '房规' : a.filename ?? '自制包')

async function pick(altId: string | null, name: string): Promise<void> {
  const c = lib.campaignLib
  if (!c) return
  const ok = await askConfirm({ title: altId === null ? '复原为原件？' : `用「${name}」覆盖这一条？`, message: altId === null ? '回到原件。' : `覆盖后这一条显示「${name}」的内容，生效在：${levelWord.value}。可以随时复原。`, confirmLabel: altId === null ? '复原' : '确认覆盖' })
  if (!ok) return
  try {
    const lvl = level.value === 'rule' ? (`rule:${c.rule}` as const) : level.value
    const next = await app.svc().backend.library.scoped.choose(c, props.entryRef, altId, lvl)
    const owner = campaign.owner?.ownerKey
    if (level.value === 'campaign') {
      if (!owner || !lib.bound) { toast.error('先创建战役，才能在本战役里覆盖'); return }
      const ks = app.svc().backend.kernelSave
      await ks.setLibrary(owner, { ...(await ks.libraryOf(owner)), choices: next.choices })
      await lib.load(app.svc(), owner)
    }
    toast.success(altId === null ? '已复原' : '已覆盖')
    emit('changed')
  } catch (e) { console.error('[trpg-assistant] 覆盖失败', e); toast.error('没有保存成功') }
}
</script>

<template>
  <div v-if="alts.length" class="lib-versions" data-testid="entry-versions">
    <div v-if="effective !== 'base'" class="lib-banner" data-testid="override-banner"><Icon name="info" :size="16" /><span>已被覆盖（生效处：{{ detail?.version.by === 'campaign' ? '本战役' : detail?.version.by === 'global' ? '全局' : '当前规则' }}）。{{ previewCopy ? '当前页显示你点中的版本。' : '下面是覆盖后的内容。' }}</span><span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" data-testid="override-restore" @click="pick(null, '原件')"><Icon name="arrow-counter-clockwise" :size="14" />复原</button></span></div>
    <div v-if="alts.length" class="lib-block" data-testid="alt-list">
      <b>此条有 {{ alts.length + 1 }} 个版本</b>
      <div class="lib-alt-row"><span>原件</span><span v-if="effective === 'base'" class="trpg-badge" data-tone="success">生效中</span><button v-else class="trpg-btn trpg-btn--small" type="button" @click="pick(null, '原件')">选用原件</button></div>
      <div v-for="a in alts" :key="a.docIdLocal ?? a.altId" class="lib-alt-row"><span>{{ label(a) }}<span class="trpg-badge" data-tone="primary" style="margin-left: 6px">同名</span></span><span v-if="effective === a.altId" class="trpg-badge" data-tone="success">生效中</span><button v-else class="trpg-btn trpg-btn--small" type="button" :aria-label="`覆盖：用${label(a)}的版本`" title="覆盖这个项目" @click="pick(a.altId, label(a))"><Icon name="arrow-counter-clockwise" :size="14" />覆盖</button></div>
    </div>
  </div>
</template>
