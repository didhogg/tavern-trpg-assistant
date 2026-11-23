<script setup lang="ts">
// 身份抽屉（线框 u1-id 上半）：名字 · 英文名 · 阵营，都是直接填写；阵营给名字表里的阵营名作建议，不强制。
// 名字、阵营写人物数据；英文名存“个人调整”（驾驶员 D2）。种族 / 背景 / 体型等来源条目属于 E 批。
import { computed, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import { alignment } from './view'

const person = usePersonStore()
const modal = useModalStore()
const s = computed(() => person.sheet)
const name = ref(String(s.value?.name ?? ''))
const english = ref(String(person.row?.adjustments.englishName ?? ''))
const align = ref(s.value ? alignment(s.value) : '')
const suggestions = computed(() => Object.values(person.glossary?.tables.alignments ?? {}).map(String))
const busy = ref(false)

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
  <form class="ps-drawer" data-testid="ps-drawer-identity" @submit.prevent="save">
    <label class="ps-field"><span>名字</span><input v-model="name" class="trpg-input" maxlength="80" :disabled="person.readOnly" data-testid="ps-id-name"></label>
    <label class="ps-field"><span>英文名（选填）</span><input v-model="english" class="trpg-input" maxlength="80" :disabled="person.readOnly"></label>
    <label class="ps-field"><span>阵营</span><input v-model="align" class="trpg-input" list="ps-align-list" maxlength="60" :disabled="person.readOnly"></label>
    <datalist id="ps-align-list"><option v-for="a in suggestions" :key="a" :value="a" /></datalist>
    <div class="ps-drawer-actions">
      <button class="trpg-btn" type="button" @click="modal.close()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="person.readOnly || busy">保存</button>
    </div>
  </form>
</template>
