// P5.5【我的库】包的动作：列表行的 ⋯ 和包弹窗标题栏的 ⋯ 共用。只调后端、拼提示。
import type { Services } from '../../core/services'
import type { PackPair } from '../../library/custom-lang'
import type { MyPack } from '../../library/custom-packs'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import { removeTarget } from './actions'
import { codeSetOf, exportPair, packTitle, sideOf } from './mine'
import NewPackPage from './NewPackPage.vue'
import { openManage, openPack } from './open'

type Toast = { success: (m: string) => void; error: (m: string) => void }

/** 包弹窗要的参数（我的库的包：带 mine，标题栏换成我的库的 ⋯）。 */
export function packProps(lib: ReturnType<typeof useLibViewStore>, pair: PackPair, codeSet: string) {
  const pack = sideOf(pair, codeSet)
  const cs = codeSetOf(pair, pack)
  return { set: lib.brewSetId(cs) ?? '', source: pack.own.json, name: packTitle(pack), docIdLocal: pack.docIdLocal, mine: { id: pair.id, codeSet: cs } }
}

export function openMyPack(lib: ReturnType<typeof useLibViewStore>, pair: PackPair, codeSet: string): void {
  openPack(packProps(lib, pair, codeSet))
}

export function openNewPack(s: Services, codeSet: string): void {
  const lib = useLibViewStore()
  useModalStore().open({
    key: 'newpack', title: '新建包', component: NewPackPage, variant: 'dialog', width: 480, height: 500,
    props: {
      codeSet,
      onCreated: async (id: string) => {
        await lib.loadPairs(s)
        const pair = lib.pairs?.find((p) => p.id === id)
        if (pair) openMyPack(lib, pair, codeSet)
      },
    },
  })
}

/** ⋯ 菜单的项（列表行和标题栏一样；窄屏列表行多一个「导出」）。 */
export function packMenu(pair: PackPair, { withExport = false } = {}) {
  return [
    { key: 'manage', label: '管理' },
    { key: 'copy', label: '再复制一份' },
    ...(!pair.en ? [{ key: 'lang', label: '加英文版' }] : !pair.zh ? [{ key: 'lang', label: '加中文版' }] : []),
    ...(withExport ? [{ key: 'export', label: '导出' }] : []),
    { key: 'rm', label: '删除…', danger: true },
  ]
}

export async function runPackMenu(s: Services, key: string, pair: PackPair, codeSet: string, toast: Toast, skipRemovePrompt = false): Promise<void> {
  const lib = useLibViewStore()
  const pack = sideOf(pair, codeSet)
  const cs = codeSetOf(pair, pack)
  const label = packTitle(pack)
  const reload = async () => { await lib.loadPairs(s); await lib.refresh(s) }
  try {
    if (key === 'manage') { if (!useModalStore().isOpen) openMyPack(lib, pair, codeSet); openManage(packProps(lib, pair, codeSet)) }
    else if (key === 'export') await exportPair(s, pair.id, label, toast)
    else if (key === 'copy') {
      const r = await s.backend.library.custom.saveToMine(cs, { kind: 'pack', docIdLocal: pack.docIdLocal })
      toast.success(`已复制一份：${(r as { full?: string } | null)?.full ?? label}`)
      await reload()
    } else if (key === 'lang') {
      const r = await s.backend.library.bilingual.addLanguage(cs, pair.id)
      toast.success(r.codeSet === 'en' ? `已加英文版：《${label}》` : `已加中文版：《${label}》`)
      await reload()
    } else if (key === 'rm') {
      const sides = [pair.zh, pair.en].filter((x): x is MyPack => !!x)
      const setId = lib.brewSetId(cs)
      if (!setId) return
      // 另一种语言那份由后端补上（removalImpactMany）
      if (await removeTarget(s, { kind: 'brew', setId, docIdLocals: [pack.docIdLocal] }, sides.length > 1 ? `${label}（中文、英文）` : label, skipRemovePrompt, toast)) {
        if (useModalStore().isOpen) useModalStore().close(true)
        await reload()
      }
    }
  } catch (e) {
    console.error('[trpg-assistant] 包的操作没有成功', key, e)
    toast.error(e instanceof Error ? e.message : '没有成功')
  }
}
