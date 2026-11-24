<script setup lang="ts">
// 身份抽屉（线框 u1-id）：上半直接填写——名字 · 英文名（个人调整，驾驶员 D2）· 阵营（名字表里的阵营名作建议）；
// 下半来源条目——种族 / 背景 [换…]（官方拿掉旧的 + 加新的，一条撤销）· 职业（每个职业一行）[加兼职…]。都从库里选，和加物品同一个两栏页。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'
import { openPick } from './edit-open'
import { alignment, background, classes, isNpc, species } from './view'

const person = usePersonStore()
const modal = useModalStore()
const s = computed(() => person.sheet)
const name = ref(String(s.value?.name ?? ''))
const english = ref(String(person.row?.adjustments.englishName ?? ''))
const align = ref(s.value ? alignment(s.value) : '')
const suggestions = computed(() => Object.values(person.glossary?.tables.alignments ?? {}).map(String))
const busy = ref(false)
const npc = computed(() => (s.value ? isNpc(s.value) : false))
/** 种族 / 背景物品（换的时候要知道旧的是哪件）。 */
const originItem = (type: string) => (s.value?.items ?? []).find((i: { type: string }) => i.type === type) as { id: string; name: string } | undefined
const sp = computed(() => (s.value ? species(s.value) : null))
const bg = computed(() => (s.value ? background(s.value) : null))
const cls = computed(() => (s.value ? classes(s.value) : []))
function change(kind: 'races' | 'backgrounds', type: 'race' | 'background', shown: string | undefined): void {
  const old = originItem(type)
  openPick(kind, old ? { id: old.id, name: shown || old.name } : undefined)
}

async function save(): Promise<void> {
  if (!s.value || busy.value) return
  busy.value = true
  try {
    const edits = [
      ...(name.value.trim() && name.value.trim() !== s.value.name ? [{ kind: 'set' as const, path: 'name', value: name.value.trim() }] : []),
      ...(align.value.trim() !== alignment(s.value) ? [{ kind: 'set' as const, path: 'system.details.alignment', value: align.value.trim() }] : []),
    ]
    if (edits.length) await person.edit('改了身份', edits)
    const en = english.value.trim()
    if (en !== String(person.row?.adjustments.englishName ?? '')) await person.adjust('改了英文名', { englishName: en || null })
    modal.close()
  } finally { busy.value = false }
}
</script>

<template>
  <form class="pf" data-testid="ps-drawer-identity" @submit.prevent="save">
    <div class="pf-body">
      <section class="pf-card">
<div class="pf-fields" style="padding: var(--sp-3)">
        <div class="pf-row"><label class="pf-label" for="id-name">名字</label><div class="pf-control"><input id="id-name" v-model="name" class="trpg-input" maxlength="80" :disabled="person.readOnly" data-testid="ps-id-name"></div></div>
        <div class="pf-row"><label class="pf-label" for="id-en">英文名<small class="pf-hint">选填</small></label><div class="pf-control"><input id="id-en" v-model="english" class="trpg-input" maxlength="80" :disabled="person.readOnly"></div></div>
        <div class="pf-row"><label class="pf-label" for="id-align">阵营</label><div class="pf-control"><input id="id-align" v-model="align" class="trpg-input" list="ps-align-list" maxlength="60" :disabled="person.readOnly"></div></div>
        <datalist id="ps-align-list"><option v-for="a in suggestions" :key="a" :value="a" /></datalist>
      </div>
</section>
      <section v-if="!npc" class="pf-card" data-testid="ps-id-origins">
        <h4>来源条目<small>换掉旧的会把它带来的东西一起退回</small></h4>
        <div class="pf-entry"><span>种族</span><b>{{ sp?.name || '—' }}</b><span /><button class="trpg-btn trpg-btn--small" type="button" :disabled="person.readOnly" data-testid="ps-id-race" @click="change('races', 'race', sp?.name)">{{ sp ? '换…' : '选…' }}</button></div>
        <div class="pf-entry"><span>背景</span><b>{{ bg?.name || '—' }}</b><span /><button class="trpg-btn trpg-btn--small" type="button" :disabled="person.readOnly" data-testid="ps-id-bg" @click="change('backgrounds', 'background', bg?.name)">{{ bg ? '换…' : '选…' }}</button></div>
        <div v-for="c in cls" :key="c.id" class="pf-entry"><span>职业</span><b>{{ c.name }} {{ c.levels }} 级</b><span /><span /></div>
        <div class="pf-id-actions">
          <button class="trpg-btn trpg-btn--small pf-add" type="button" :disabled="person.readOnly" data-testid="ps-id-class" @click="openPick('classes')"><Icon name="plus" :size="14" />{{ cls.length ? '兼职（再加一个职业）…' : '选职业…' }}</button>
        </div>
        <p class="pf-intro pf-id-note">选或换种族、背景、职业时，它带来的特性、熟练和起始装备会一起加上，要做的选择会一题一题问；换掉的会把它带来的东西一起退回。</p>
      </section>
    </div>
    <div class="pf-foot">
      <span class="pf-gap" />
      <button class="trpg-btn" type="button" @click="modal.close()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="person.readOnly || busy">保存</button>
    </div>
  </form>
</template>
