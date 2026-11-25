<script setup lang="ts">
// 职业与出身弹窗的右边（窄屏是翻进来的一页）：选中那一行的资料，或改等级的流程（驾驶员 11-25：升级 / 降级在右边显示 / 选择）。
//   资料：库里同一张资料卡（没有库条目的自定义条目只给「编辑」）。
//   升级：作者「导入到人物」同一个职业、选到目标等级，作者要问的题一题一题在这里答，答完列出会加上什么再确认（一条撤销）。
//   降级：官方退回成长（forLevelChange），先在这里确认。
import { computed, markRaw, onMounted, ref, shallowRef } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { useLibViewStore } from '../../stores/libview'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import EntryPage from '../libview/EntryPage.vue'
import ImportAsk from './ask/ImportAsk.vue'
import LevelParts from './LevelParts.vue'
import OriginsDetailSelf from './OriginsDetail.vue'
import { openFields } from './edit-open'

export type OriginsView =
  | { kind: 'entry'; key: string; itemId: string | null; name: string; ref: EntryRef | null; /** 种族 / 背景：资料卡上方列出它带来的（可取下）。 */ parts?: boolean }
  /** 职业的某一级：这一级每条成长给了什么（itemIds = 职业和它的子职业）。 */
  /** 职业的某一级（class = 这个职业：可以重新选这一级，top = 它现在几级）。 */
  | { kind: 'levels'; key: string; itemIds: string[]; name: string; level: number; class?: { classId: string; ref: EntryRef | null; top: number; /** 第 1 级能重选（OriginsDialog 定）。 */ firstOk?: boolean } }
  /** 改等级：to > from 升级（作者问答），to < from 降级（先演练再确认）；redo = 重新选第 to 级（top = 职业现在几级，更高的几级按原选择升回）。 */
  | { kind: 'level'; key: string; classId: string; name: string; ref: EntryRef | null; from: number; to: number; redo?: { top: number } }

const props = defineProps<{ view: OriginsView; page?: boolean }>()
const emit = defineEmits<{ back: []; go: [view: OriginsView] }>()
const person = usePersonStore()
const modal = useModalStore()
const lib = useLibViewStore()
const CardPane = markRaw(EntryPage)
const v = computed(() => props.view)
/** 流程做完 / 返回：宽屏回到这一行的资料，窄屏退回列表。 */
const leave = (): void => { if (props.page) modal.done(); else emit('back') }
/** 去另一页（重新选）：宽屏换右边，窄屏在弹窗里翻一页。 */
function go(next: OriginsView): void {
  if (!props.page) { emit('go', next); return }
  modal.push({ key: `origins-page:${next.key}`, title: `${next.name} 重新选`, component: markRaw(OriginsDetailSelf), props: { view: next, page: true }, variant: 'dialog', width: 920, height: 720 })
}
const redo = (): void => { const x = v.value; if (x.kind === 'levels' && x.class) go({ kind: 'level', key: `redo:${x.class.classId}:${x.level}`, classId: x.class.classId, name: x.name, ref: x.class.ref, from: x.level, to: x.level, redo: { top: x.class.top } }) }
// 降级：先在小窗里演练（官方真降一次再按存档退回），列出会收回什么
const preview = shallowRef<Awaited<ReturnType<typeof person.levelPreview>>>(null)
const previewing = ref(false)
onMounted(async () => {
  const x = v.value
  if (x.kind !== 'level' || x.to >= x.from) return
  previewing.value = true
  preview.value = await person.levelPreview(x.classId, x.to - x.from)
  previewing.value = false
})
async function down(): Promise<void> {
  if (v.value.kind !== 'level') return
  if (await person.level(`${v.value.name}降到 ${v.value.to} 级`, v.value.classId, v.value.to - v.value.from)) leave()
}
</script>

<template>
  <div class="od" data-testid="origins-detail">
    <template v-if="v.kind === 'levels'">
      <h3 class="od-title" data-testid="origins-detail-title">
{{ v.name }} {{ v.level }} 级
        <button v-if="v.class" type="button" class="trpg-btn trpg-btn--small" :disabled="person.readOnly || !v.class.ref || (v.level < 2 && !v.class.firstOk)" data-testid="origins-redo" @click="redo">重新选这一级</button>
      </h3>
      <p v-if="v.class && v.level < 2 && !v.class.firstOk" class="lp-none" data-testid="origins-redo-why">{{ v.class.top > 1 ? `第 1 级在 2～${v.class.top} 级下面，要重选它先把${v.name}降到 1 级。` : '这是带着兼职的原始职业：重新导入会被当成兼职、熟练给法不同，不能单独重选第 1 级。' }}</p>
      <p v-else-if="v.class && v.level === 1" class="od-hint">重选第 1 级会先拿掉这个职业（连同它当时加的起始装备、戏法等），再按作者问答重新加 1 级；子职业照旧带上。</p>
      <LevelParts :item-ids="v.itemIds" :level="v.level" :source="`${v.name}-${v.level} 级`" />
    </template>
    <template v-else-if="v.kind === 'level' && v.redo && v.ref">
      <p v-if="v.redo.top > v.to" class="od-hint" data-testid="origins-redo-note">只重选第 {{ v.to }} 级；第 {{ v.to + 1 }} 到 {{ v.redo.top }} 级按原来的选择原样升回。</p>
      <ImportAsk :key="v.key" :entry-ref="v.ref" :name="v.name" :level="v.to" :redo-level="{ classId: v.classId, level: v.to, top: v.redo.top }" embedded back-text="取消重新选" @back="leave" @done="leave" />
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
      <p v-if="previewing" class="od-hint">正在算会收回什么…</p>
      <template v-else-if="preview">
        <p>会收回（官方退回第 {{ v.to + 1 }} 到 {{ v.from }} 级的成长）：</p>
        <ul class="od-removed" data-testid="origins-level-down-list">
          <li v-for="it in preview.removed" :key="it.id">{{ it.name }}</li>
          <li v-if="!preview.removed.length" class="od-hint">没有特性或物品会被收回</li>
        </ul>
        <p>生命上限 {{ preview.hp.from }} → {{ preview.hp.to }}，总等级 {{ preview.level.from }} → {{ preview.level.to }}</p>
      </template>
      <p v-else class="od-hint">没算出会收回什么；确认后由官方按成长记录退回，可以撤销。</p>
      <div class="od-actions">
        <button class="trpg-btn" type="button" @click="leave">取消</button>
        <button class="trpg-btn trpg-btn--primary" type="button" :disabled="person.readOnly" data-testid="origins-level-down-ok" @click="down">确认降到 {{ v.to }} 级</button>
      </div>
    </div>
  </div>
</template>
