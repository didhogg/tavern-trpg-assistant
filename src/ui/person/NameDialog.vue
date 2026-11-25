<script setup lang="ts">
// 名字单元（驾驶员 11-25：页头点名字框 → 只有名字和英文名）。名字写进人物；英文名是个人调整（选填，不改引擎数据）。
// 回车 = 保存，Esc = 取消（弹窗宿主）；没改就直接关；一次保存 = 一条撤销（名字、英文名各一条时按顺序写）。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'

const person = usePersonStore()
const modal = useModalStore()
const name = ref(String(person.sheet?.name ?? ''))
const english = ref(String(person.row?.adjustments.englishName ?? ''))
const busy = ref(false)
const trimmed = computed(() => name.value.trim())
const changed = computed(() => trimmed.value !== String(person.sheet?.name ?? '') || english.value.trim() !== String(person.row?.adjustments.englishName ?? ''))

async function save(): Promise<void> {
  if (busy.value || person.readOnly) return
  if (!trimmed.value) return
  if (!changed.value) { modal.done(); return }
  busy.value = true
  try {
    if (trimmed.value !== person.sheet?.name && !await person.edit(`改名为「${trimmed.value}」`, [{ kind: 'set', path: 'name', value: trimmed.value }])) return
    const en = english.value.trim()
    if (en !== String(person.row?.adjustments.englishName ?? '') && !await person.adjust('改了英文名', { englishName: en || null })) return
    modal.done()
  } finally { busy.value = false }
}
</script>

<template>
  <form class="pf" data-testid="ps-name-dialog" @submit.prevent="save">
    <div class="pf-body">
      <div class="pf-fields">
        <div class="pf-row">
          <label class="pf-label" for="ps-nd-name">名字</label>
          <div class="pf-control"><input id="ps-nd-name" v-model="name" class="trpg-input" maxlength="80" required :disabled="person.readOnly" data-autofocus data-testid="ps-name-input" @focus="($event.target as HTMLInputElement).select()"></div>
        </div>
        <div class="pf-row">
          <label class="pf-label" for="ps-nd-en">英文名<small class="pf-hint">选填</small></label>
          <div class="pf-control"><input id="ps-nd-en" v-model="english" class="trpg-input" maxlength="80" :disabled="person.readOnly" data-testid="ps-english-input"></div>
        </div>
      </div>
    </div>
    <div class="pf-foot">
      <span class="pf-gap" />
      <button class="trpg-btn" type="button" @click="modal.done()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="person.readOnly || busy || !trimmed" data-testid="ps-name-save">保存</button>
    </div>
  </form>
</template>
