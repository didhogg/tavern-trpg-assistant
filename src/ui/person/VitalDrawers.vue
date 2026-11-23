<script setup lang="ts">
// 生命骰 / 力竭 / 死亡豁免 三个抽屉（线框 u1-dice）：改数量、设级数、点圆点；掷骰等 P7 骰盘接线后再上（驾驶员 2026-11-23 选 A）。
// 每一步都是一条改动记录，可撤销；数字全来自读数，界面不算规则。
import { computed, onMounted, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import Stepper from '../kit/Stepper.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import { resolveTagOnce } from '../libview/useTags'
import { deathShown, exhaustionPips } from './view'

const props = defineProps<{ kind: 'hitDice' | 'exhaustion' | 'death' }>()
const person = usePersonStore()
const app = useAppStore()
const campaign = useCampaignStore()
const s = computed(() => person.sheet)
const ro = computed(() => person.readOnly)

/* eslint-disable @typescript-eslint/no-explicit-any -- 读数是官方数据，界面只读字段 */
// ---- 生命骰：玩家角色按职业一行（职业物品自己的已用数），怪物一行（人物的已用数）----
const hdRows = computed(() => {
  if (!s.value) return []
  const classes = (s.value.items ?? []).filter((i: any) => i.type === 'class' && i.system?.hd)
  if (classes.length) {
    const names = new Map((s.value.shown?.items ?? []).map((i: any) => [i.id, String(i.name)]))
    return classes.map((c: any) => ({ key: c.id, title: `${names.get(c.id) ?? c.name}  d${c.system.hd.denomination}`, value: c.system.hd.value, max: c.system.hd.max, spent: c.system.hd.spent ?? 0, itemId: c.id }))
  }
  const hd = s.value.system.attributes.hd
  return hd ? [{ key: 'actor', title: `d${hd.denomination ?? ''}`, value: hd.value, max: hd.max, spent: hd.spent ?? 0, itemId: null as string | null }] : []
})
function setSpent(row: { itemId: string | null; spent: number }, spent: number): void {
  const label = `生命骰已用设为 ${spent}`
  void person.edit(label, [row.itemId ? { kind: 'item', itemId: row.itemId, path: 'system.hd.spent', value: spent } : { kind: 'set', path: 'system.attributes.hd.spent', value: spent }])
}
const heal = ref('')
async function recordHeal(): Promise<void> {
  const n = Number(heal.value.normalize('NFKC'))
  if (!Number.isInteger(n) || n <= 0) return
  const p = await person.previewHp(-n)
  if (p) await person.confirmHp(`生命骰恢复：生命 ${p.from} → ${p.to}`, p)
  heal.value = ''
}

// ---- 力竭：级数上限按官方给的圆点（没有就不设上限，由结算内核限制）；每级效果看库里「力竭」的作者原文 ----
const pips = computed(() => (s.value ? exhaustionPips(s.value) : []))
const level = computed(() => Number(s.value?.system.attributes.exhaustion ?? 0))
const setLevel = (n: number): void => { void person.edit(`力竭设为 ${n} 级`, [{ kind: 'status', statusId: 'exhaustion', levels: n }]) }
const rule = ref<{ ref: any; label: string } | null>(null)
onMounted(async () => {
  if (props.kind !== 'exhaustion' || !campaign.owner) return
  const lib = await app.svc().backend.kernelSave.libraryOf(campaign.owner.ownerKey)
  const hit = await resolveTagOnce(app.svc(), lib.codeSet, '@condition', 'exhaustion')
  const located = hit.kind === 'link' ? hit.target.located : null
  if (located) rule.value = { ref: { set: located.set, prop: located.prop, hash: located.hash }, label: hit.label }
})

// ---- 死亡豁免：成功 / 失败各三个圆点，点哪个就设成几（再点同一个 = 少一个）----
const death = computed(() => s.value?.system.attributes.death ?? { success: 0, failure: 0 })
function setDeath(which: 'success' | 'failure', n: number): void {
  const now = Number(death.value[which] ?? 0)
  const next = now === n ? n - 1 : n
  void person.edit(`死亡豁免${which === 'success' ? '成功' : '失败'}设为 ${next}`, [{ kind: 'set', path: `system.attributes.death.${which}`, value: next }])
}
const resetDeath = (): void => { void person.edit('死亡豁免重置', [{ kind: 'set', path: 'system.attributes.death.success', value: 0 }, { kind: 'set', path: 'system.attributes.death.failure', value: 0 }]) }
</script>

<template>
  <div v-if="s" class="ps-drawer" :data-testid="`ps-drawer-${kind}`">
    <template v-if="kind === 'hitDice'">
      <div v-for="row in hdRows" :key="row.key" class="ps-drawer-row">
        <span class="ps-drawer-label">{{ row.title }}</span>
        <Stepper
:value="`${row.value} / ${row.max}`" minus-label="用掉一颗" plus-label="还回一颗" :minus-disabled="ro || row.value <= 0" :plus-disabled="ro || row.spent <= 0"
          @minus="setSpent(row, row.spent + 1)" @plus="setSpent(row, row.spent - 1)" />
      </div>
      <form class="ps-drawer-row" @submit.prevent="recordHeal">
        <label class="ps-drawer-label" for="ps-hd-heal">不掷，直接记录恢复</label>
        <input id="ps-hd-heal" v-model="heal" class="trpg-input ps-drawer-num" inputmode="numeric" placeholder="恢复多少" :disabled="ro">
        <button class="trpg-btn trpg-btn--small" type="submit" :disabled="ro || !heal">记录</button>
      </form>
      <p class="ps-drawer-note">掷生命骰等骰盘接好后再加（P7）。</p>
    </template>

    <template v-else-if="kind === 'exhaustion'">
      <div class="ps-drawer-row">
        <span class="ps-drawer-label">力竭等级</span>
        <Stepper
:value="level" minus-label="少一级" plus-label="多一级" :minus-disabled="ro || level <= 0" :plus-disabled="ro || (pips.length > 0 && level >= pips.length)"
          @minus="setLevel(level - 1)" @plus="setLevel(level + 1)" />
      </div>
      <p v-if="rule" class="ps-drawer-note">每一级的效果：<Term :label="`查看${rule.label}`" @open="openEntry(rule.ref, rule.label)">{{ rule.label }}</Term></p>
    </template>

    <template v-else>
      <p v-if="!deathShown(s)" class="ps-drawer-note">这个人物现在不需要死亡豁免。</p>
      <div v-for="which in (['success', 'failure'] as const)" :key="which" class="ps-drawer-row">
        <span class="ps-drawer-label">{{ which === 'success' ? '成功' : '失败' }}</span>
        <span class="ps-pips" role="group" :aria-label="which === 'success' ? '死亡豁免成功' : '死亡豁免失败'">
          <button v-for="n in 3" :key="n" type="button" class="ps-pip" :data-on="n <= Number(death[which] ?? 0) || undefined" :data-kind="which" :disabled="ro" :aria-label="`设为 ${n}`" @click="setDeath(which, n)">{{ n }}</button>
        </span>
      </div>
      <div class="ps-drawer-actions"><button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" @click="resetDeath">重置</button></div>
      <p class="ps-drawer-note">掷死亡豁免等骰盘接好后再加（P7）。</p>
    </template>
  </div>
</template>
