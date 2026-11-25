<script setup lang="ts">
// 页头头像（照 GitHub「Edit ▾ Upload a photo… / Remove photo」、Tidy5e「点头像换图，锁定时看大图」）：
//   能改：点头像出菜单——上传图片… / 贴图片链接… / 重新截取 / 看大图 / 移除头像；图片直接拖到头像上 = 上传。
//   只读：点头像 = 看大图（没有头像就不能点）。
import { computed, defineComponent, h, inject, markRaw, ref } from 'vue'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'
import { usePersonStore } from '../../../stores/person'
import { useModalStore } from '../../../stores/modal'
import Icon from '../../kit/Icon.vue'
import AvatarCrop from './AvatarCrop.vue'
import AvatarLink from './AvatarLink.vue'
import { IMAGE_ACCEPT, PORTRAIT_FLAG, portraitSource, shownAvatar } from './portrait'

const person = usePersonStore()
const modal = useModalStore()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const ro = computed(() => person.readOnly)
const broken = ref(false)
const avatar = computed(() => (broken.value ? null : shownAvatar(person.sheet?.img)))
const source = computed(() => portraitSource(person.sheet?.flags))
const picker = ref<HTMLInputElement | null>(null)
const over = ref(false)

const cropPage = (props: Record<string, unknown>) => ({ key: 'person-avatar-crop', title: '截取头像', component: markRaw(AvatarCrop), props, variant: 'dialog' as const, width: 380, height: 520 })
const crop = (props: Record<string, unknown>) => modal.open(cropPage(props))

const BigView = defineComponent({
  props: { src: { type: String, required: true } },
  setup: (p) => () => h('div', { class: 'av-big', 'data-testid': 'avatar-big' }, [h('img', { src: p.src, alt: person.sheet?.name ?? '' })]),
})
const viewBig = (): void => {
  const src = source.value?.src ?? avatar.value
  if (src) modal.open({ key: 'person-avatar-big', title: person.sheet?.name ?? '头像', component: markRaw(BigView), props: { src }, variant: 'dialog', width: 640 })
}

function picked(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) crop({ file })
}
function dropped(e: DragEvent): void {
  over.value = false
  const file = [...(e.dataTransfer?.files ?? [])].find((f) => f.type.startsWith('image/'))
  if (file && !ro.value) crop({ file })
}

function select(key: string): void {
  if (key === 'upload') picker.value?.click()
  else if (key === 'link') modal.open({ key: 'person-avatar-link', title: '贴图片链接', component: markRaw(AvatarLink), props: { src: source.value && /^https?:/i.test(source.value.src) ? source.value.src : '', next: (src: string) => modal.replace(cropPage({ src })) }, variant: 'dialog', width: 440, height: 240 })
  else if (key === 'recrop' && source.value) crop({ src: source.value.src, rect: source.value })
  else if (key === 'view') viewBig()
  else if (key === 'remove') void person.edit('移除了头像', [{ kind: 'set', path: 'img', value: null }, ...(source.value ? [{ kind: 'set' as const, path: PORTRAIT_FLAG, remove: true }] : [])])
}
const items = computed(() => [
  { key: 'upload', label: '上传图片…' },
  { key: 'link', label: '贴图片链接…' },
  ...(source.value ? [{ key: 'recrop', label: '重新截取' }] : []),
  ...(avatar.value ? [{ key: 'view', label: '看大图' }, { key: 'remove', label: '移除头像', danger: true }] : []),
])
</script>

<template>
  <button v-if="ro" class="ps-portrait" type="button" :disabled="!avatar" aria-label="看大图" data-testid="ps-portrait" @click="viewBig">
    <img v-if="avatar" :src="avatar" alt="" @error="broken = true"><Icon v-else name="user" :size="44" />
  </button>
  <DropdownMenuRoot v-else>
    <DropdownMenuTrigger
      class="ps-portrait" :data-over="over || undefined" aria-label="换头像" data-testid="ps-portrait"
      @dragover.prevent="over = true" @dragleave="over = false" @drop.prevent="dropped"
    >
      <img v-if="avatar" :src="avatar" alt="" @error="broken = true"><Icon v-else name="user" :size="44" />
      <span class="ps-portrait-badge" aria-hidden="true"><Icon name="image" :size="12" /></span>
    </DropdownMenuTrigger>
    <DropdownMenuPortal :to="portalTarget">
      <DropdownMenuContent class="trpg-dropdown" align="start" :side-offset="4" :collision-padding="8" data-testid="avatar-menu">
        <DropdownMenuItem v-for="it in items" :key="it.key" class="trpg-dropdown__item" :class="{ 'trpg-dropdown__item--danger': it.danger }" :data-testid="`avatar-${it.key}`" @select="select(it.key)">
          <span>{{ it.label }}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
  <input ref="picker" type="file" :accept="IMAGE_ACCEPT" hidden data-testid="avatar-file" @change="picked">
</template>
