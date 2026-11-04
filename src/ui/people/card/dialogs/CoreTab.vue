<script setup lang="ts">
import { computed, ref } from 'vue'
import { CREATURE_LABELS, SIZE_LABELS } from '../../../../rules/dnd5e2014/data/enums'
import type { MonsterData } from '../../../../rules/dnd5e2014/data/entries/spell-monster'
import AvatarFrame from '../../../kit/AvatarFrame.vue'
import SelectField from '../../../kit/SelectField.vue'
import Icon from '../../../kit/Icon.vue'
import type { CardCtx } from '../cardCtx'

const props = defineProps<{ ctx: CardCtx; avatarUrl?: string; onUpload: (file: File) => void; onRecrop: () => void; onClear: () => void }>()
const p = computed(() => props.ctx.person)
const name = ref(p.value.name)
const nameEn = ref(p.value.nameEn ?? '')
const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const ro = computed(() => props.ctx.readOnly)
const alignments = [
  { value: 'L G', label: '守序善良' }, { value: 'N G', label: '中立善良' }, { value: 'C G', label: '混乱善良' },
  { value: 'L N', label: '守序中立' }, { value: 'N', label: '绝对中立' }, { value: 'C N', label: '混乱中立' },
  { value: 'L E', label: '守序邪恶' }, { value: 'N E', label: '中立邪恶' }, { value: 'C E', label: '混乱邪恶' }, { value: 'U', label: '无阵营' },
]
const sizeOptions = Object.entries(SIZE_LABELS).map(([value, label]) => ({ value, label }))
const creatureOptions = Object.entries(CREATURE_LABELS).map(([value, label]) => ({ value, label }))
const isTemplate = computed(() => p.value.block.cr !== undefined)
function blockCopy(): MonsterData { return JSON.parse(JSON.stringify(p.value.block)) as MonsterData }
function setBlock(fn: (b: MonsterData) => void): void { const b = blockCopy(); fn(b); props.ctx.commitBlock(b) }
function commitName(): void {
  const v = name.value.trim()
  if (!v) { error.value = '名字不能为空'; return }
  if (v.length > 40) { error.value = '名字最多 40 个字'; return }
  error.value = ''
  props.ctx.commitDraft({ name: v }, ['name'])
}
function commitNameEn(): void {
  if (nameEn.value.length > 80) { error.value = '英文名最多 80 个字'; return }
  error.value = ''
  props.ctx.commitDraft({ nameEn: nameEn.value.trim() || undefined }, ['nameEn'])
}
function setAlignment(v?: string): void { setBlock((b) => { if (v) b.alignment = v; else delete b.alignment }) }
function pick(e: Event): void { const i = e.target as HTMLInputElement; const f = i.files?.[0]; i.value = ''; if (f) props.onUpload(f) }
</script>

<template>
  <div class="trpg-core" data-testid="identity-core">
    <div class="trpg-core__avatar">
      <AvatarFrame :w="96" :h="120" :label="name || '新人物'" :avatar="avatarUrl" :art="p.block.art" :creature-type="p.block.creatureType?.type" :player="(p.block.classes ?? []).length > 0" />
      <div class="trpg-core__btns">
        <button class="trpg-btn" type="button" :disabled="ro" data-testid="identity-upload" @click="fileInput?.click()">上传图片</button>
        <button class="trpg-btn" type="button" :disabled="ro || !p.avatarSource" data-testid="identity-recrop" @click="onRecrop()">重新截取</button>
        <button class="trpg-btn" type="button" :disabled="ro || !p.avatar" data-testid="identity-clear" @click="onClear()">清除</button>
      </div>
      <input ref="fileInput" class="trpg-sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" tabindex="-1" aria-hidden="true" @change="pick" />
    </div>
    <div class="trpg-core__form">
      <label class="trpg-field"><span class="trpg-field__label">名字</span><input v-model="name" class="trpg-input" maxlength="40" aria-label="名字" data-testid="identity-name" :disabled="ro" @change="commitName" @keydown.enter.prevent="commitName" /></label>
      <label class="trpg-field"><span class="trpg-field__label">英文名</span><input v-model="nameEn" class="trpg-input" maxlength="80" aria-label="英文名" :disabled="ro" @change="commitNameEn" @keydown.enter.prevent="commitNameEn" /></label>
      <div class="trpg-field"><span class="trpg-field__label">阵营</span><div class="trpg-core__clearable"><SelectField :model-value="p.block.alignment" :options="alignments" label="阵营" placeholder="未选" :disabled="ro" @update:model-value="setAlignment" /><button v-if="p.block.alignment" class="trpg-icon-btn trpg-core__x" type="button" :disabled="ro" aria-label="清除阵营" @click="setAlignment()"><Icon name="x" :size="16" /></button></div></div>
      <template v-if="isTemplate">
        <div class="trpg-field"><span class="trpg-field__label">体型</span><SelectField :model-value="p.block.size?.[0] ?? 'M'" :options="sizeOptions" label="体型" :disabled="ro" @update:model-value="(v) => v && setBlock((b) => { b.size = [v as MonsterData['size'][number]] })" /></div>
        <div class="trpg-field"><span class="trpg-field__label">类型</span><SelectField :model-value="p.block.creatureType?.type ?? 'humanoid'" :options="creatureOptions" label="生物类型" :disabled="ro" @update:model-value="(v) => v && setBlock((b) => { b.creatureType = { ...b.creatureType, type: v, tags: b.creatureType?.tags ?? [] } })" /></div>
      </template>
      <p v-if="error" class="trpg-field__error" role="alert">{{ error }}</p>
    </div>
  </div>
</template>
