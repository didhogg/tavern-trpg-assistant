<script setup lang="ts">
import { inject } from 'vue'
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
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger class="trpg-icon-btn trpg-more" :aria-label="`${label} 的更多操作`">
      <Icon name="dots-three" :size="20" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal :to="portalTarget">
      <DropdownMenuContent class="trpg-menu" align="end" :side-offset="4" :collision-padding="8">
        <DropdownMenuItem
          v-for="item in items"
          :key="item.key"
          class="trpg-menu__item"
          :class="{ 'trpg-menu__item--danger': item.danger }"
          :disabled="item.disabled"
          @select="$emit('select', item.key)"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.disabled && item.reason" class="trpg-menu__reason">{{ item.reason }}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
