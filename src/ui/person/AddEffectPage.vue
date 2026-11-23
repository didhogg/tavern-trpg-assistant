<script setup lang="ts">
// 添加自定义效果（线框 p6-11「＋」）：名字 · 改哪一项（这个人身上官方的数字 / 公式字段，名字取官方）· 怎么改（官方改法）· 改多少 · 持续几轮。
// 加上后在效果页「生效中」，可停用 / 删除，可撤销。
import { computed, onMounted, ref } from 'vue'
import type { ShownField, ShownFieldInfo } from '../../rules/kernel/people'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import Combobox from '../kit/Combobox.vue'
import SelectField from '../kit/SelectField.vue'

const person = usePersonStore()
const modal = useModalStore()
const info = ref<ShownFieldInfo | null>(null)
const name = ref('')
const key = ref('')
const mode = ref('2')
const value = ref('')
const rounds = ref('')
const busy = ref(false)
onMounted(async () => { info.value = await person.fields({ path: 'system' }) })

/** 能改的项：官方存的数字 / 公式字段，名字 = 上一层名字 · 本项名字。 */
const targets = computed(() => {
  const out: Array<{ value: string; label: string }> = []
  // 官方没给名字的分组（每个属性、每个技能、每种工具）按名字表取名
  const tables = person.glossary?.tables ?? {}
  const names: Record<string, string> = { ...(tables.abilities ?? {}), ...(tables.skills ?? {}), ...(tables.tools ?? {}) } as Record<string, string>
  const walk = (n: ShownField, prefix: string): void => {
    const here = n.label ? String(n.label) : names[n.path.split('.').pop() ?? ''] ?? ''
    if (n.children) { n.children.forEach((c) => walk(c, here || prefix)); return }
    if (n.derived || !(n.kind === 'number' || n.kind === 'formula') || !n.label) return
    out.push({ value: n.path, label: prefix && prefix !== here ? `${prefix} · ${here}` : here })
  }
  if (info.value?.tree) walk(info.value.tree, '')
  return out
})
const modes = computed(() => (info.value?.modes ?? []).map((m) => ({ value: String(m.value), label: String(m.label) })))
const ok = computed(() => !!name.value.trim() && !!key.value && value.value.trim() !== '')
async function save(): Promise<void> {
  if (!ok.value || busy.value) return
  busy.value = true
  try {
    const n = Number(rounds.value)
    const data = { name: name.value.trim(), changes: [{ key: key.value, mode: Number(mode.value), value: value.value.trim() }], ...(Number.isFinite(n) && n > 0 ? { duration: { rounds: n } } : {}), flags: { 'tavern-trpg': { manual: true } } }
    if (await person.edit(`加了效果「${data.name}」`, [{ kind: 'effectCreate', data }])) modal.close()
  } finally { busy.value = false }
}
</script>

<template>
  <form class="pf" data-testid="add-effect" @submit.prevent="save">
    <div class="pf-body">
      <p class="pf-intro">给这个人加一条效果，比如法术带来的加值、主持人的临时奖励。改的是哪一项、怎么改，都用官方的写法。</p>
      <div class="pf-card">
<div class="pf-fields" style="padding: var(--sp-3)">
        <div class="pf-row"><label class="pf-label" for="ae-name">名字</label><div class="pf-control"><input id="ae-name" v-model="name" class="trpg-input" placeholder="如：祝福术" data-testid="ae-name"></div></div>
        <div class="pf-row"><span class="pf-label">改哪一项</span><div class="pf-control"><Combobox v-model="key" label="改哪一项" :options="targets" placeholder="搜：护甲、力量、速度…" /></div></div>
        <div class="pf-row"><span class="pf-label">怎么改</span><div class="pf-control"><SelectField v-model="mode" label="怎么改" :options="modes" /></div></div>
        <div class="pf-row"><label class="pf-label" for="ae-value">改多少</label><div class="pf-control"><input id="ae-value" v-model="value" class="trpg-input pf-num" placeholder="如：1 或 1d4" data-testid="ae-value"></div></div>
        <div class="pf-row"><label class="pf-label" for="ae-rounds">持续几轮<small class="pf-hint">不填 = 一直有效，直到停用或删除</small></label><div class="pf-control"><input id="ae-rounds" v-model="rounds" class="trpg-input pf-num" type="number" min="1"></div></div>
      </div>
</div>
    </div>
    <div class="pf-foot">
      <span class="pf-gap" />
      <button class="trpg-btn" type="button" @click="modal.close()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="!ok || busy || person.readOnly" data-testid="ae-save">加上</button>
    </div>
  </form>
</template>
