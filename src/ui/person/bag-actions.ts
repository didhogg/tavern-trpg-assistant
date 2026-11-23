// 背包 / 行动页对一件物品的写入（都经人物 store 的改动记录，可撤销）：数量、装备、同调、次数、删除。界面不算规则，只写字段。
import { usePersonStore } from '../../stores/person'

export function useItemWrites() {
  const person = usePersonStore()
  const set = (label: string, itemId: string, path: string, value: unknown) => person.edit(label, [{ kind: 'item', itemId, path, value }])
  return {
    quantity: (name: string, id: string, n: number) => set(`${name} 数量 ${n}`, id, 'system.quantity', Math.max(0, n)),
    equip: (name: string, id: string, on: boolean) => set(`${on ? '装备' : '卸下'}${name}`, id, 'system.equipped', on),
    attune: (name: string, id: string, on: boolean) => set(`${on ? '同调' : '取消同调'}${name}`, id, 'system.attuned', on),
    /** 剩余次数设为 value（官方存的是“已用”）。 */
    uses: (name: string, id: string, value: number, max: number) => set(`${name} 剩余次数 ${value}`, id, 'system.uses.spent', Math.min(max, Math.max(0, max - value))),
    /** 删除走官方拿掉（带成长的条目把成长一起退回）。 */
    remove: (name: string, id: string) => person.remove(`删除了${name}`, id),
  }
}
