<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import Term from '../kit/Term.vue'
import { collectRefs, type Fact } from './facts'
import { parseInline } from './inline'
import TextBlocks from './TextBlocks.vue'

const props = defineProps<{ facts: Fact[] }>()
const emit = defineEmits<{ ref: [id: string] }>()
const app = useAppStore()
const library = useLibraryStore()
const names = ref<Record<string, string>>({})

async function resolve(): Promise<void> {
  const out: Record<string, string> = {}
  for (const id of collectRefs(props.facts)) {
    const packId = await library.packOfEntry(id)
    const row = packId ? await app.svc().db.entries.get([packId, id]) : undefined
    out[id] = row?.name ?? id
  }
  names.value = out
}
onMounted(resolve)
watch(() => props.facts, resolve)
const shown = computed(() => props.facts)
</script>

<template>
  <dl class="trpg-facts" data-testid="entry-facts">
    <template v-for="f in shown" :key="f.label">
      <dt class="trpg-facts__label">{{ f.label }}</dt>
      <dd class="trpg-facts__value">
        <template v-if="f.parts">
          <template v-for="(p, i) in f.parts" :key="i">
            <Term v-if="typeof p !== 'string'" @open="emit('ref', p.ref)">{{ names[p.ref] ?? '…' }}</Term>
            <template v-else>
              <template v-for="(s, j) in parseInline(p)" :key="j">
                <Term v-if="s.kind === 'ref'" @open="emit('ref', s.id)">{{ s.text }}</Term>
                <template v-else>{{ s.text }}</template>
              </template>
            </template>
          </template>
        </template>
        <div v-if="f.table" class="trpg-blocks__table">
          <table>
            <thead><tr><th v-for="c in f.table.cols" :key="c">{{ c }}</th></tr></thead>
            <tbody><tr v-for="(row, r) in f.table.rows" :key="r"><td v-for="(cell, c) in row" :key="c">{{ cell }}</td></tr></tbody>
          </table>
        </div>
        <div v-if="f.sections" class="trpg-facts__sections">
          <section v-for="s in f.sections" :key="s.name">
            <h4>{{ s.name }}</h4>
            <TextBlocks :blocks="s.text" @ref="emit('ref', $event)" />
          </section>
        </div>
      </dd>
    </template>
  </dl>
</template>
