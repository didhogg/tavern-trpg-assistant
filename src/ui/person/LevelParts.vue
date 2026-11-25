<script setup lang="ts">
// 一件条目（职业 / 子职业 / 种族 / 背景）在某一级（或全部级）的成长给了什么（后端读数 sheet.levels，已过显示出口）：
//   授予的物品：名字（下划线术语，点了看资料）+ 取下；熟练 / 语言这类键：药丸 + ×，库里有条目的名字是下划线术语；取下的：虚线留在原位，点它补回（sheet.off）。
//   取下 / 补回 = 存档取下安排加一行 / 去掉一行（frame/off.ts 同一入口，一条撤销）。悬停只出一行小注释（来源）。
import { computed } from 'vue'
import type { OffRow } from '../../rules/kernel/frame/off'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import { shownItemName, shownItemRef } from './view-tabs'

export interface LevelRowShown { itemId: string; ref: string; level: number; advancement: string; type: string; title: string | null; items: Array<{ id: string; part: string }>; keys: Array<{ key: string; label: string | null; value?: number; ref?: unknown }> }

/** itemIds = 这些条目的成长；level = 只看这一级（不给 = 全部级）；source = 悬停注释里的来源（如「牧师-2 级」）。 */
const props = defineProps<{ itemIds: string[]; level?: number; source: string }>()
const person = usePersonStore()
const ro = computed(() => person.readOnly)
const s = computed(() => person.sheet!)
const off = computed(() => (s.value.off ?? []) as OffRow[])
const rows = computed(() => ((s.value.levels ?? []) as LevelRowShown[]).filter((r) => props.itemIds.includes(r.itemId) && (props.level === undefined || r.level === props.level)))
const same = (a: OffRow, b: OffRow): boolean => a.ref === b.ref && (a.advancement ?? '') === (b.advancement ?? '') && (a.level ?? -1) === (b.level ?? -1) && (a.part ?? '') === (b.part ?? '')
const rowOff = (r: LevelRowShown, part: string, label: string): OffRow => ({ ref: r.ref, advancement: r.advancement, level: r.level, part, label })
const gone = (r: LevelRowShown) => off.value.filter((o) => o.ref === r.ref && o.advancement === r.advancement && o.level === r.level && o.part)
const itemName = (id: string): string => shownItemName(s.value, id) ?? id
/** 键药丸上的字：属性提升带上加多少（力量 +2）。 */
const chipText = (k: { key: string; label: string | null; value?: number }): string => `${k.label ?? k.key}${k.value ? ` ${k.value > 0 ? '+' : ''}${k.value}` : ''}`
const take = (r: LevelRowShown, part: string, label: string): void => { void person.setOff(`取下${label}`, [...off.value, rowOff(r, part, label)]) }
const back = (o: OffRow): void => { void person.setOff(`补回${o.label ?? '这一项'}`, off.value.filter((x) => !same(x, o))) }
</script>

<template>
  <div class="lp" data-testid="level-parts">
    <section v-for="r in rows" :key="`${r.advancement}:${r.level}`" class="lp-adv" :data-testid="`level-adv-${r.type}`">
      <h5>{{ r.title ?? r.type }}<small v-if="level === undefined && r.level">{{ r.level }} 级</small></h5>
      <ul v-if="r.items.length" class="lp-items">
        <li v-for="it in r.items" :key="it.id" class="lp-item" :data-src="`来源：${source}`">
          <Term v-if="shownItemRef(s, it.id)" :label="`查看${itemName(it.id)}`" @open="openEntry(shownItemRef(s, it.id) as never, itemName(it.id))">{{ itemName(it.id) }}</Term><span v-else>{{ itemName(it.id) }}</span>
          <button type="button" class="trpg-btn trpg-btn--small trpg-btn--quiet" :disabled="ro" :data-testid="`level-take-${it.id}`" @click="take(r, it.part, itemName(it.id))">取下</button>
        </li>
      </ul>
      <div v-if="r.keys.length" class="tr-pills">
        <span v-for="k in r.keys" :key="k.key" class="tr-chip" :data-src="`来源：${source}`" data-testid="level-key"><Term v-if="k.ref" :label="`查看${k.label ?? k.key}`" @open="openEntry(k.ref as never, k.label ?? k.key)">{{ chipText(k) }}</Term><template v-else>{{ chipText(k) }}</template><button type="button" class="tr-chip-x" :aria-label="`${k.value ? '不计入' : '取下'}${chipText(k)}`" :disabled="ro" @click="take(r, k.key, chipText(k))"><Icon name="x" :size="12" /></button></span>
      </div>
      <div v-if="gone(r).length" class="tr-pills">
        <button v-for="o in gone(r)" :key="o.part" type="button" class="tr-chip tr-chip--gone" :data-src="`来源：${source}，已取下，点了补回`" :disabled="ro" data-testid="level-gone" @click="back(o)">{{ o.label ?? '已取下的一项' }}<Icon name="arrow-counter-clockwise" :size="12" /></button>
      </div>
      <p v-if="!r.items.length && !r.keys.length && !gone(r).length" class="lp-none">{{ r.type === 'HitPoints' ? '生命值按官方随等级算，不单项取下' : '这一条没有可单项取下的东西' }}</p>
    </section>
    <p v-if="!rows.length" class="lp-none">这一级没有新的成长记录。</p>
  </div>
</template>
