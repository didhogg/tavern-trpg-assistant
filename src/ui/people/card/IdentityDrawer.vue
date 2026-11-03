<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Person } from '../../../schemas/people'
import type { MonsterData } from '../../../rules/dnd5e2014/data/entries/spell-monster'
import { CREATURE_LABELS, SIZE_LABELS } from '../../../rules/dnd5e2014/data/enums'
import type { CardData } from './cardData'
import AvatarFrame from '../../kit/AvatarFrame.vue'
import Combobox from '../../kit/Combobox.vue'
import SelectField from '../../kit/SelectField.vue'
import Icon from '../../kit/Icon.vue'
import { openEntry } from '../../library/openDetail'

const props = defineProps<{
  person: Person
  data: CardData
  avatarUrl?: string
  readOnly: boolean
  nameError?: string
  onName?: (value: string) => void
  onNameEn?: (value: string) => void
  onBlock?: (block: MonsterData) => void
  onUpload?: (file: File) => void
  onRecrop?: () => void
  onClear?: () => void
}>()
const name = ref(props.person.name)
const nameEn = ref(props.person.nameEn ?? '')
const localError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const alignments = [
  { value: 'L G', label: '守序善良' }, { value: 'N G', label: '中立善良' }, { value: 'C G', label: '混乱善良' },
  { value: 'L N', label: '守序中立' }, { value: 'N', label: '绝对中立' }, { value: 'C N', label: '混乱中立' },
  { value: 'L E', label: '守序邪恶' }, { value: 'N E', label: '中立邪恶' }, { value: 'C E', label: '混乱邪恶' },
  { value: 'U', label: '无阵营' }, { value: '__none', label: '未选' },
]
const sizeOptions = Object.entries(SIZE_LABELS).map(([value, label]) => ({ value, label }))
const creatureOptions = Object.entries(CREATURE_LABELS).map(([value, label]) => ({ value, label }))
const isTemplate = computed(() => props.person.block.cr !== undefined)
const subraceOptions = computed(() => props.data.subraceOptions(props.person.block.race))
const error = computed(() => localError.value || props.nameError || '')
function blockCopy(): MonsterData { return JSON.parse(JSON.stringify(props.person.block)) as MonsterData }
function setBlock(patch: (block: MonsterData) => void): void {
  const block = blockCopy()
  patch(block)
  props.onBlock?.(block)
}
function commitName(): void {
  const value = name.value.trim()
  if (!value) { localError.value = '名字不能为空'; return }
  if (value.length > 40) { localError.value = '名字最多 40 个字'; return }
  localError.value = ''
  props.onName?.(value)
}
function commitNameEn(): void {
  if (nameEn.value.length > 80) { localError.value = '英文名最多 80 个字'; return }
  localError.value = ''
  props.onNameEn?.(nameEn.value.trim())
}
function setRace(id?: string): void {
  setBlock((block) => {
    if (id) block.race = id
    else delete block.race
    if (block.subrace) {
      const selected = id ? props.data.subraceOptions(id).some((option) => option.value === block.subrace) : false
      if (!selected) delete block.subrace
    }
  })
}
function setSubrace(id?: string): void {
  setBlock((block) => { if (id) block.subrace = id; else delete block.subrace })
}
function setBackground(id?: string): void {
  setBlock((block) => { if (id) block.background = id; else delete block.background })
}
function setAlignment(value?: string): void {
  setBlock((block) => { if (value && value !== '__none') block.alignment = value; else delete block.alignment })
}
function setSize(value?: string): void {
  if (value) setBlock((block) => { block.size = [value as MonsterData['size'][number]] })
}
function setCreatureType(value?: string): void {
  if (value) setBlock((block) => { block.creatureType = { ...block.creatureType, type: value, tags: block.creatureType?.tags ?? [] } })
}
function pick(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) props.onUpload?.(file)
}
function look(id?: string): void {
  if (!id) return
  const row = props.data.entries.get(id)
  if (row) openEntry(row.packId, row.entry.id, row.entry.name)
}
</script>

<template>
  <div class="trpg-identity-drawer" data-testid="identity-drawer">
    <div class="trpg-identity-drawer__avatar">
      <AvatarFrame :w="96" :h="120" :label="name || '新人物'" :avatar="avatarUrl" :art="person.block.art" :creature-type="person.block.creatureType?.type" :player="(person.block.classes ?? []).length > 0" />
      <div class="trpg-identity-drawer__avatar-actions">
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" @click="fileInput?.click()">上传图片</button>
        <button v-if="person.avatarSource" class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" data-testid="identity-recrop" @click="props.onRecrop?.()">重新截取</button>
        <button v-if="person.avatar" class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly" data-testid="identity-clear" @click="props.onClear?.()">清除</button>
      </div>
      <input ref="fileInput" class="trpg-sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" tabindex="-1" aria-hidden="true" @change="pick" />
    </div>
    <label class="trpg-field"><span class="trpg-field__label">名字</span><input v-model="name" class="trpg-input" maxlength="40" aria-label="名字" data-testid="identity-name" :disabled="readOnly" @change="commitName" @keydown.enter.prevent="commitName" /><span v-if="error" class="trpg-field__error" role="alert">{{ error }}</span></label>
    <label class="trpg-field"><span class="trpg-field__label">英文名</span><input v-model="nameEn" class="trpg-input" maxlength="80" aria-label="英文名" :disabled="readOnly" @change="commitNameEn" @keydown.enter.prevent="commitNameEn" /></label>
    <div class="trpg-field"><span class="trpg-field__label">阵营</span><SelectField :model-value="person.block.alignment ?? '__none'" :options="alignments" label="阵营" placeholder="未选" :disabled="readOnly" @update:model-value="setAlignment" /></div>
    <div class="trpg-field">
      <span class="trpg-field__label">种族</span>
      <div class="trpg-identity-drawer__combo"><Combobox :model-value="person.block.race ?? ''" :options="data.raceOptions" label="种族" placeholder="未选" :disabled="readOnly" @update:model-value="setRace" /><button v-if="person.block.race" class="trpg-icon-btn" type="button" aria-label="清除种族" :disabled="readOnly" @click="setRace()"><Icon name="x" :size="14" /></button></div>
      <button v-if="person.block.race" class="trpg-term" type="button" @click="look(person.block.race)">看资料</button>
      <span v-if="data.raceOptions.length === 0" class="trpg-field__hint">没有可选的种族，请先到「库」里安装资料</span>
    </div>
    <div class="trpg-field">
      <span class="trpg-field__label">亚种族</span>
      <div class="trpg-identity-drawer__combo"><Combobox :model-value="person.block.subrace ?? ''" :options="subraceOptions" label="亚种族" :disabled="readOnly || !person.block.race" :placeholder="person.block.race ? '未选' : '先选种族'" @update:model-value="setSubrace" /><button v-if="person.block.subrace" class="trpg-icon-btn" type="button" aria-label="清除亚种族" :disabled="readOnly" @click="setSubrace()"><Icon name="x" :size="14" /></button></div>
      <button v-if="person.block.subrace" class="trpg-term" type="button" @click="look(person.block.subrace)">看资料</button>
      <span v-if="person.block.race && subraceOptions.length === 0" class="trpg-field__hint">这个种族没有亚种族</span>
    </div>
    <div class="trpg-field">
      <span class="trpg-field__label">背景</span>
      <div class="trpg-identity-drawer__combo"><Combobox :model-value="person.block.background ?? ''" :options="data.backgroundOptions" label="背景" placeholder="未选" :disabled="readOnly" @update:model-value="setBackground" /><button v-if="person.block.background" class="trpg-icon-btn" type="button" aria-label="清除背景" :disabled="readOnly" @click="setBackground()"><Icon name="x" :size="14" /></button></div>
      <button v-if="person.block.background" class="trpg-term" type="button" @click="look(person.block.background)">看资料</button>
    </div>
    <div v-if="isTemplate" class="trpg-identity-drawer__template">
      <div class="trpg-field"><span class="trpg-field__label">体型</span><SelectField :model-value="person.block.size?.[0] ?? 'M'" :options="sizeOptions" label="体型" :disabled="readOnly" @update:model-value="setSize" /></div>
      <div class="trpg-field"><span class="trpg-field__label">类型</span><SelectField :model-value="person.block.creatureType?.type ?? 'humanoid'" :options="creatureOptions" label="生物类型" :disabled="readOnly" @update:model-value="setCreatureType" /></div>
    </div>
    <p class="trpg-identity-drawer__note">改动进入草稿，点右上「保存」后生效</p>
  </div>
</template>
