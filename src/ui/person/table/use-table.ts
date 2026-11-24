// 一页表格的状态（行动 / 背包 / 法术 / 特性共用）：搜索词 · 排序 · 分组方式 · 全部展开；分组 = 官方分组 + 自定义分组，再按搜索 / 排序整理。
// 新建这一类（Tidy5e 组头 ＋ / 页底「新建」= createItem）：按组的物品类型给一份最小数据（名字 + 类型 + 组自带的分组值），走现成的按数据新建。
import { computed, markRaw, ref, watch } from 'vue'
import { usePersonStore } from '../../../stores/person'
import { useModalStore } from '../../../stores/modal'
import SectionPage from './SectionPage.vue'
import { docGroups, listControls, refine, sectionOf, withSections, type DocGroup, type DocRow } from './rows'

export function useTable(part: string) {
  const person = usePersonStore()
  const modal = useModalStore()
  const query = ref('')
  const sort = ref('')
  const grouping = ref('')
  const expand = ref<boolean | null>(null)
  /** 官方筛选条件（key = 只看这类，!key = 排除这类）和小窗按官方判断交回的通过编号。 */
  const filters = ref<string[]>([])
  const passing = ref<Set<string> | null>(null)
  watch([filters, () => person.sheet], async ([f]) => { passing.value = f.length ? await person.filterIds(f) : null }, { deep: true })
  const controls = computed(() => person.sheet ? listControls(person.sheet, part) : null)
  const groups = computed<DocGroup[]>(() => {
    if (!person.sheet) return []
    const g = docGroups(person.sheet, part, grouping.value || undefined)
    return refine(withSections(g), query.value, sort.value || controls.value?.sorting[0]?.key || '', passing.value)
  })
  const total = computed(() => groups.value.reduce((n, g) => n + g.rows.length, 0))
  function section(r: DocRow): void {
    modal.open({ key: `person-section:${r.id}`, title: `「${r.name}」放进哪个分组`, component: markRaw(SectionPage), props: { itemId: r.id, name: r.name, current: sectionOf(r.item) }, variant: 'dialog', width: 480, height: 360 })
  }
  /** 新建一件空白条目：type = 物品类型；extra = 这一组要带的字段（法术的环与施法方式）。 */
  function create(type: string, label: string, extra: Record<string, unknown> = {}): void {
    void person.create(`新建了${label}`, [{ name: `新${label}`, type, flags: { 'tavern-trpg': { named: true } }, ...(Object.keys(extra).length ? { system: extra } : {}) }])
  }
  return { query, sort, grouping, expand, filters, controls, groups, total, section, create }
}
