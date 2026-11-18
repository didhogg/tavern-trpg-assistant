<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { AuthorWindow } from '../../stores/wizard-author'
import theme from '../styles/author-window.css?inline'

/**
 * 作者开的一个窗口，整个搬到这里（建卡作者窗口桥）：窗口还是作者自己的（作者的控件、作者的确定 / 取消、作者的校验），
 * 放进它自己的影子层：先加载作者声明的样式表（排版），再盖一层插件主题（ui/styles/author-window.css）。界面不读、不改窗口内容。
 */
const props = defineProps<{ item: AuthorWindow }>()
const host = ref<HTMLElement | null>(null)
const lost = ref(false)
onMounted(() => {
  const el = host.value
  const node = props.item.win.node()
  if (!el || !node) { lost.value = true; return }
  const shadow = el.shadowRoot ?? el.attachShadow({ mode: 'open' })
  const links = props.item.win.styles.map((href) => Object.assign(document.createElement('link'), { rel: 'stylesheet', href }))
  const style = Object.assign(document.createElement('style'), { textContent: theme })
  shadow.replaceChildren(...links, style, node.ownerDocument === document ? node : document.adoptNode(node))
})
</script>

<template>
  <div ref="host" class="wz-author" data-testid="wz-author-window" />
  <p v-if="lost" class="wz-err" role="alert">作者的窗口没找到（可能已经关了）。</p>
</template>
