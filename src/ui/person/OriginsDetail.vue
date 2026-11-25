<script setup lang="ts">
// 职业与出身弹窗的右边（窄屏是翻进来的一页）：选中那一行的资料，或改等级的流程（驾驶员 11-25：升级 / 降级在右边显示 / 选择）。
//   资料：库里同一张资料卡（没有库条目的自定义条目只给「编辑」）。
//   升级：作者「导入到人物」同一个职业、选到目标等级，作者要问的题一题一题在这里答，答完列出会加上什么再确认（一条撤销）。
//   降级：官方退回成长（forLevelChange），先在这里确认。
import { computed, markRaw } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { useLibViewStore } from '../../stores/libview'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import EntryPage from '../libview/EntryPage.vue'
import ImportAsk from './ask/ImportAsk.vue'
import LevelParts from './LevelParts.vue'
import { openFields } from './edit-open'

export type OriginsView =
  | { kind: 'entry'; key: string; itemId: string | null; name: string; ref: EntryRef | null; /** 种族 / 背景：资料卡上方列出它带来的（可取下）。 */ parts?: boolean }
  /** 职业的某一级：这一级每条成长给了什么（itemIds = 职业和它的子职业）。 */
  | { kind: 'levels'; key: string; itemIds: string[]; name: string; level: number }
  | { kind: 'level'; key: string; classId: string; name: string; ref: EntryRef | null; from: number; to: number }

const props = defineProps<{ view: OriginsView; page?: boolean }>()
const emit = defineEmits<{ back: [] }>()
const person = usePersonStore()
const modal = useModalStore()
const lib = useLibViewStore()
const CardPane = markRaw(EntryPage)
const v = computed(() => props.view)
/** 流程做完 / 返回：宽屏回到这一行的资料，窄屏退回列表。 */
const leave = (): void => { if (props.page) modal.done(); else emit('back') }
async function down(): Promise<void> {
  if (v.value.kind !== 'level') return
  if (await person.level(`${v.value.name}降到 ${v.value.to} 级`, v.value.classId, v.value.to - v.value.from)) leave()
}
</script>

<template>
  <div class="od" data-testid="origins-detail">
    <template v-if="v.kind === 'levels'">
      <h3 class="od-title" data-testid="origins-detail-title">{{ v.name }} {{ v.level }} 级</h3>
      <LevelParts :item-ids="v.itemIds" :level="v.level" :source="`${v.name}-${v.level} 级`" />
    </template>
    <template v-else-if="v.kind === 'entry'">
      <h3 class="od-title" data-testid="origins-detail-title">{{ v.name }}</h3>
      <template v-if="v.parts && v.itemId"><h4 class="od-sub">它带来的</h4><LevelParts :item-ids="[v.itemId]" :source="v.name" /><h4 class="od-sub">资料</h4></template>
      <component :is="CardPane" v-if="v.ref && lib.campaignLib" :key="v.key" :entry-ref="v.ref" :page-key="`origins:${v.key}`" body-only />
      <div v-else class="od-empty">
        <p>{{ v.name }} 是自定义条目，库里没有它的资料。</p>
        <button v-if="v.itemId" class="trpg-btn trpg-btn--small" type="button" :disabled="person.readOnly" @click="openFields(v.name, { itemId: v.itemId, path: 'system' }, { width: 680, itemName: v.name })">编辑</button>
      </div>
    </template>
    <template v-else-if="v.to > v.from && v.ref">
      <ImportAsk :key="v.key" :entry-ref="v.ref" :name="v.name" :level="v.to" embedded back-text="取消升级" @back="leave" @done="leave" />
    </template>
    <div v-else-if="v.to > v.from" class="od-empty"><p>{{ v.name }} 是自定义职业，库里没有它的成长资料，不能按作者升级。</p></div>
    <div v-else class="od-confirm" data-testid="origins-level-down">
      <h3>{{ v.name }}：{{ v.from }} 级改到 {{ v.to }} 级</h3>
      <p>第 {{ v.to + 1 }} 到 {{ v.from }} 级得到的特性、生命值和当时做的选择，会由官方一起收回。可以撤销。</p>
      <div class="od-actions">
        <button class="trpg-btn" type="button" @click="leave">取消</button>
        <button class="trpg-btn trpg-btn--primary" type="button" :disabled="person.readOnly" data-testid="origins-level-down-ok" @click="down">确认降到 {{ v.to }} 级</button>
      </div>
    </div>
  </div>
</template>
