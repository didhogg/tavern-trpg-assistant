<script setup lang="ts">
import { inject, ref } from 'vue'
import {
  DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger,
} from 'reka-ui'
import Icon from './Icon.vue'

export interface MenuItem {
  key: string
  label: string
  danger?: boolean
  disabled?: boolean
  /** 不可用时的原因，作为提示文字显示在菜单项里。 */
  reason?: string
}

defineProps<{ label: string; items: MenuItem[] }>()
defineEmits<{ select: [key: string] }>()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const trigger = ref<{ $el?: HTMLElement } | null>(null)
/** 选了菜单项后如果打开了新的一页（确认页等），触发按钮已被盖到下面（inert），焦点不能还给它，否则键盘焦点丢到页面外（Esc 就没用了）。 */
function onCloseAutoFocus(event: Event): void {
  if (trigger.value?.$el?.closest('[inert]')) event.preventDefault()
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger ref="trigger" class="trpg-icon-btn trpg-more" :aria-label="`${label} 的更多操作`">
      <Icon name="dots-three" :size="20" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal :to="portalTarget">
      <DropdownMenuContent class="trpg-dropdown" align="end" :side-offset="4" :collision-padding="8" @close-auto-focus="onCloseAutoFocus">
        <DropdownMenuItem
          v-for="item in items"
          :key="item.key"
          class="trpg-dropdown__item"
          :class="{ 'trpg-dropdown__item--danger': item.danger }"
          :disabled="item.disabled"
          @select="$emit('select', item.key)"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.disabled && item.reason" class="trpg-dropdown__reason">{{ item.reason }}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
