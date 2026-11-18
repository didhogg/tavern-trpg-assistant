<script setup lang="ts">
import { computed } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { useWizardStore } from '../../stores/wizard'
import Icon from '../kit/Icon.vue'
import AuthorWindowView from './AuthorWindowView.vue'

/**
 * 它要你做的选择：这件条目导入时作者（Plutonium「导入到人物」）开的窗口，按开的顺序整个搬到这里，玩家直接在作者窗口里答。
 * 全部作者窗口一个格式：标题 + 作者窗口本身；作者关了窗口 = 答完，收成一行打勾的标题。
 */
const props = defineProps<{ itemRef: EntryRef }>()
const w = useWizardStore()
const list = computed(() => w.author.of(props.itemRef))
const done = computed(() => list.value.filter((x) => x.closed))
const open = computed(() => list.value.filter((x) => !x.closed))
</script>

<template>
  <div class="wz-choices" data-testid="wz-choices">
    <ol v-if="done.length" class="wz-asked" data-testid="wz-asked">
      <li v-for="x in done" :key="x.win.token"><Icon name="check" :size="12" /><span>{{ x.win.title }}</span></li>
    </ol>
    <section v-for="x in open" :key="x.win.token" class="wz-ch" data-testid="wz-author-ask">
      <b>{{ x.win.title }}</b>
      <AuthorWindowView :item="x" />
    </section>
    <p v-if="!open.length && w.author.busy" class="wz-note" data-testid="wz-ask-busy">作者正在导入…</p>
    <p v-if="w.author.error" class="wz-err" role="alert">{{ w.author.error }}</p>
  </div>
</template>
