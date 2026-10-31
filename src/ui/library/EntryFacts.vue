<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import Term from '../kit/Term.vue'
import { collectRefs, type Fact, type Part } from './facts'
import { parseInline } from './inline'
import { groupMembers, type MemberInfo } from './series'
import TextBlocks from './TextBlocks.vue'
import { BOOK_NAME } from './typeLabels'

const props = defineProps<{ facts: Fact[] }>()
const emit = defineEmits<{ ref: [id: string, packId?: string] }>()
const app = useAppStore()
const library = useLibraryStore()
const info = ref<Record<string, { name: string; baseItem?: string; category?: string } | undefined>>({})

async function resolve(): Promise<void> {
  const out: Record<string, { name: string; baseItem?: string; category?: string } | undefined> = {}
  const wanted = new Set(collectRefs(props.facts))
  for (let round = 0; round < 2; round++) {
    for (const id of [...wanted]) {
      if (id in out) continue
      const packId = await library.packOfEntry(id)
      const row = packId ? await app.svc().db.entries.get([packId, id]) : undefined
      out[id] = row ? { name: row.name, baseItem: typeof row.data.baseItem === 'string' ? row.data.baseItem : undefined, category: typeof row.data.category === 'string' ? row.data.category : undefined } : undefined
    }
    // 第二轮：成员的基础物品（用来给表格的行命名）
    for (const f of props.facts) for (const id of f.members ?? []) { const b = out[id]?.baseItem; if (b) wanted.add(b) }
  }
  info.value = out
}
onMounted(resolve)
watch(() => props.facts, resolve)
const shown = computed(() => props.facts)

/** 目标所在的包的名字（没装的包：优先用目录里的名字，其次按书代号查，最后用包编号）。 */
function packName(packId: string): string {
  return library.catalog?.packs.find((p) => p.id === packId)?.name ?? BOOK_NAME[packId.split('-').pop()?.toUpperCase() ?? ''] ?? packId
}
const isMissing = (id: string): boolean => id in info.value && info.value[id] === undefined

/** 引用显示的文字：显示名优先；没装的目标写明需要哪本书，绝不显示编号。 */
function refText(p: Exclude<Part, string>): string {
  const base = p.label ?? info.value[p.ref]?.name ?? (isMissing(p.ref) ? '未安装的条目' : '…')
  const need = isMissing(p.ref) && p.packId ? `需要《${packName(p.packId)}》` : ''
  const extra = [p.note, need].filter(Boolean).join(' · ')
  return extra ? `${base}（${extra}）` : base
}

function sectionsOf(f: Fact): ReturnType<typeof groupMembers> {
  const members: MemberInfo[] = (f.members ?? []).flatMap((id) => { const m = info.value[id]; return m ? [{ id, name: m.name, baseItem: m.baseItem, category: m.category }] : [] })
  const baseNames = Object.fromEntries(members.flatMap((m) => (m.baseItem && info.value[m.baseItem] ? [[m.baseItem, info.value[m.baseItem]!.name]] : [])))
  return groupMembers(members, baseNames)
}
</script>

<template>
  <dl class="trpg-facts" data-testid="entry-facts">
    <template v-for="f in shown" :key="f.label">
      <dt class="trpg-facts__label">{{ f.label }}</dt>
      <dd class="trpg-facts__value">
        <template v-if="f.parts">
          <template v-for="(p, i) in f.parts" :key="i">
            <Term v-if="typeof p !== 'string'" @open="emit('ref', p.ref, p.packId)">{{ refText(p) }}</Term>
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
            <tbody>
              <tr v-for="(row, r) in f.table.rows" :key="r">
                <td v-for="(cell, c) in row" :key="c">
                  <template v-for="(s, j) in parseInline(cell)" :key="j">
                    <Term v-if="s.kind === 'ref'" @open="emit('ref', s.id)">{{ s.text }}</Term>
                    <template v-else>{{ s.text }}</template>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="f.members" class="trpg-facts__members" data-testid="family-members">
          <section v-for="sec in sectionsOf(f)" :key="sec.title">
            <h4>{{ sec.title }}<span v-if="sec.rows.length > 1" class="trpg-row__meta">（{{ sec.rows.length }} 种）</span></h4>
            <div v-for="(row, r) in sec.rows" :key="r" class="trpg-facts__member-row">
              <span v-if="row.label" class="trpg-facts__member-label">{{ row.label }}</span>
              <Term v-for="l in row.links" :key="l.id" @open="emit('ref', l.id)">{{ l.text }}</Term>
            </div>
          </section>
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
