// 物品的 ⋯ 菜单（照搬 Tidy5e context-menu/tidy5e-item-context-menu.ts：每项的出现条件、写的字段都照它）。
// 写入全经人物 store（可撤销）；界面只读物品字段决定显示哪些项。没有现成后端的几项见搬运清单 §11，不在这里。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方物品数据没有类型声明，界面只读字段 */
import { markRaw } from 'vue'
import { usePersonStore } from '../../../stores/person'
import { useModalStore } from '../../../stores/modal'
import SplitPage from './SplitPage.vue'
import { openFields } from '../edit-open'
import { shownName, type DocRow } from './rows'

export interface MenuEntry { key: string; label: string; danger?: boolean; disabled?: boolean }

/** 官方收藏（system.favorites）里这件物品的编号写法。 */
const favId = (id: string): string => `.Item.${id}`

export function useItemMenu() {
  const person = usePersonStore()
  const modal = useModalStore()
  /** 这件物品现在在不在行动页（官方 NPC 特性分组 + 我们的显示 / 拿掉标记，小窗算好的）。 */
  const inActions = (r: DocRow): boolean => ((person.sheet?.view?.parts?.actions?.sections ?? []) as any[]).some((sec) => (sec.items ?? []).some((i: any) => i.id === r.id))
  const favs = (): Array<{ type: string; id: string; sort?: number }> => (person.sheet?.system.favorites ?? []) as never
  const isFav = (r: DocRow): boolean => favs().some((f) => f.id === favId(r.id))
  const set = (label: string, r: DocRow, path: string, value: unknown) => person.edit(label, [{ kind: 'item', itemId: r.id, path, value }])

  /** 这件物品现在有哪些菜单项（顺序 = Tidy5e：常用 → 动作 → 自定义 → 危险）。open = 看说明（展开这一行）。 */
  function entries(r: DocRow, opts: { open?: boolean } = {}): MenuEntry[] {
    const s = r.item?.system ?? {}
    const ro = person.readOnly
    const npc = person.sheet?.view?.base?.isNPC === true
    const out: MenuEntry[] = [
      { key: 'view', label: opts.open ? '收起说明' : '查看说明' },
      { key: 'edit', label: '编辑', disabled: ro },
    ]
    if (s.attunement && r.ctx?.attunement?.applicable !== false && s.identified !== false) out.push({ key: 'attune', label: s.attuned ? '取消同调' : '同调', disabled: ro })
    if ('equipped' in s) out.push({ key: 'equip', label: s.equipped ? '卸下' : '装备', disabled: ro })
    if (r.type === 'spell' && r.ctx?.preparation?.applicable && !r.ctx.preparation.disabled && !s.linkedActivity) out.push({ key: 'prepare', label: Number(s.prepared) === 1 ? '取消准备' : '准备', disabled: ro })
    if (r.ctx?.uses?.hasRecharge) out.push({ key: 'charge', label: r.ctx.uses.isOnCooldown ? '充能（恢复）' : '消耗充能', disabled: ro })
    if (!npc) out.push({ key: 'fav', label: isFav(r) ? '取消收藏' : '收藏到侧栏', disabled: ro })
    if (npc && 'quantity' in s) out.push({ key: 'gear', label: (s.properties ?? []).includes('gear') ? '取消随身装备' : '标为随身装备', disabled: ro })
    if (Number(s.quantity) > 1) out.push({ key: 'split', label: '拆分堆叠…', disabled: ro })
    if (r.type === 'spell' && !s.linkedActivity) out.push({ key: 'scroll', label: '做成卷轴', disabled: ro })
    if (r.type === 'spell' && s.linkedActivity) out.push({ key: 'activity', label: '活动设置', disabled: ro })
    if (s.identified === false) out.push({ key: 'identify', label: '鉴定', disabled: ro })
    if (r.type !== 'class' && r.type !== 'subclass') out.push({ key: 'duplicate', label: '复制一份', disabled: ro })
    // 放进 / 拿出容器（Tidy5e 用拖动；我们没有拖放，放进菜单）
    if ('container' in s) {
      for (const c of (person.sheet?.items ?? []) as any[]) if (c.type === 'container' && (c.id ?? c._id) !== r.id && (c.id ?? c._id) !== s.container) out.push({ key: `into:${c.id ?? c._id}`, label: `放进「${shownName(person.sheet!, String(c.id ?? c._id))}」`, disabled: ro })
      if (s.container) out.push({ key: 'out', label: '从容器里拿出来', disabled: ro })
    }
    if (!npc && r.type !== 'facility') out.push({ key: 'actionList', label: inActions(r) ? '从行动页拿掉' : '显示到行动页', disabled: ro })
    out.push({ key: 'section', label: '移到自定义分组…', disabled: ro })
    out.push({ key: 'remove', label: '删除', danger: true, disabled: ro })
    return out
  }

  /** 执行菜单项；view / section 由表格自己处理（返回 false）。 */
  function run(r: DocRow, key: string): boolean {
    const s = r.item?.system ?? {}
    switch (key) {
      case 'edit': openFields(r.name, { itemId: r.id, path: 'system' }, { width: 680, itemName: r.name }); return true
      case 'attune': void set(`${s.attuned ? '取消同调' : '同调'}${r.name}`, r, 'system.attuned', !s.attuned); return true
      case 'equip': void set(`${s.equipped ? '卸下' : '装备'}${r.name}`, r, 'system.equipped', !s.equipped); return true
      case 'prepare': void set(`${Number(s.prepared) === 1 ? '不再准备' : '准备'}${r.name}`, r, 'system.prepared', (Number(s.prepared ?? 0) + 1) % 2); return true
      case 'charge': void set(`${r.ctx.uses.isOnCooldown ? '充能' : '消耗充能'}：${r.name}`, r, 'system.uses.spent', r.ctx.uses.isOnCooldown ? 0 : Number(r.ctx.uses.max)); return true
      case 'fav': {
        const next = isFav(r) ? favs().filter((f) => f.id !== favId(r.id)) : [...favs(), { type: 'item', id: favId(r.id), sort: (favs().length + 1) * 100000 }]
        void person.edit(isFav(r) ? `取消收藏${r.name}` : `收藏了${r.name}`, [{ kind: 'set', path: 'system.favorites', value: next }]); return true
      }
      case 'gear': {
        const props = (s.properties ?? []) as string[]
        void set(`${props.includes('gear') ? '取消随身装备' : '标为随身装备'}：${r.name}`, r, 'system.properties', props.includes('gear') ? props.filter((p) => p !== 'gear') : [...props, 'gear']); return true
      }
      case 'activity': openFields(`${r.name} · 活动`, { itemId: r.id, path: 'system.activities' }, { width: 680 }); return true
      case 'split':
        if (Number(s.quantity) === 2) void person.splitStack(`把${r.name}拆出 1 个`, r.id, 1)
        else modal.open({ key: `person-split:${r.id}`, title: `拆分「${r.name}」`, component: markRaw(SplitPage), props: { itemId: r.id, name: r.name, quantity: Number(s.quantity) }, variant: 'dialog', width: 440, height: 320 })
        return true
      case 'scroll': void person.createScroll(`把${r.name}做成卷轴`, r.id, `法术卷轴：${r.name}`); return true
      case 'actionList': void set(inActions(r) ? `把${r.name}从行动页拿掉` : `把${r.name}显示到行动页`, r, 'flags.tavern-trpg.actionList', !inActions(r)); return true
      case 'identify': void set(`鉴定了${r.name}`, r, 'system.identified', true); return true
      case 'duplicate': void person.duplicate(`复制了${r.name}`, r.id, `${r.name}（副本）`); return true
      case 'out': void set(`把${r.name}拿出容器`, r, 'system.container', null); return true
      case 'remove': void person.remove(`删除了${r.name}`, r.id); return true
      default: {
        if (!key.startsWith('into:')) return false
        const box = ((person.sheet?.items ?? []) as any[]).find((c) => (c.id ?? c._id) === key.slice(5))
        void set(`把${r.name}放进${box ? shownName(person.sheet!, key.slice(5)) : '容器'}`, r, 'system.container', key.slice(5)); return true
      }
    }
  }
  return { entries, run, isFav }
}
