<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PickRow } from '../../stores/wizard'
import Icon from '../kit/Icon.vue'
import { useVirtual } from '../libview/useVirtual'

/** 左边的条目列表（搜名字 + 虚拟滚动）：点一行 = 看它；已选的带 ✓。 */
const props = defineProps<{ rows: PickRow[] | null; picked: string | null; marked: string[]; placeholder: string }>()
const emit = defineEmits<{ pick: [row: PickRow] }>()
const q = ref('')
const scrollEl = ref<HTMLElement | null>(null)
const shown = computed(() => { const n = q.value.trim().toLowerCase(); return (props.rows ?? []).filter((r) => !n || r.name.toLowerCase().includes(n)) })
const { range } = useVirtual(scrollEl, computed(() => shown.value.length))
const visible = computed(() => shown.value.slice(range.value.start, range.value.end))
</script>

<template>
  <div class="wz-list">
    <div class="lib-filter"><input v-model="q" class="trpg-input" type="search" :placeholder="placeholder" :aria-label="placeholder" data-testid="wz-search" /></div>
    <div v-if="!rows" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
    <div v-else ref="scrollEl" class="lib-mscroll">
      <div v-if="!shown.length" class="lib-state"><h3>{{ q.trim() ? `没找到「${q.trim()}」` : '这里还没有可选的条目' }}</h3></div>
      <div v-else class="lib-list" role="list" :style="{ paddingTop: `${range.padTop}px`, paddingBottom: `${range.padBottom}px` }">
        <button v-for="r in visible" :key="r.key" class="lib-list__row tp-row" type="button" role="listitem" :data-picked="r.key === picked || undefined" data-testid="wz-row" @click="emit('pick', r)">
          <span class="lib-name">{{ r.name }}</span><Icon v-if="marked.includes(r.key)" name="check" :size="14" /><span class="lib-src lib-end">{{ r.source ?? '' }}</span>
        </button>
      </div>
    </div>
    <div class="lib-count">{{ rows ? `共 ${shown.length} 条` : '正在读取…' }}</div>
  </div>
</template>
