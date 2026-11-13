// P5.5【我的库】界面用的小工具：一对包（中 / En）怎么显示、导出成文件、整理中轮询。只排版后端给的包信息，不改数据。
import { onBeforeUnmount, ref } from 'vue'
import type { Services } from '../../core/services'
import type { PackPair } from '../../library/custom-lang'
import type { MyPack } from '../../library/custom-packs'
import { BUILTIN_SCOPES } from '../../library/scopes'
import { categoryLabel } from './registry'

type Toast = { success: (m: string) => void; error: (m: string) => void }

/** 界面语言那一边优先；没有就用另一边。 */
export const sideOf = (p: PackPair, codeSet: string): MyPack => (codeSet === 'en' ? p.en ?? p.zh : p.zh ?? p.en)!
/** 这个包在哪一套资料里。 */
export const codeSetOf = (p: PackPair, pack: MyPack): string => (pack === p.en ? 'en' : 'cn')

export const packTitle = (p: MyPack): string => p.own.full ?? p.own.json

/** 复制件：包头前面那几行来源是原书（B8-3），写「复制自 xx」。 */
export const copiedFrom = (p: MyPack): string | null => (p.sourceInfo.length > 1 ? p.sourceInfo.slice(0, -1).map((s) => s.full ?? s.json).join('、') : null)

/** 每类几条：「法术 3 · 怪物 12」，类别多时只列前几类。 */
export function catsText(p: MyPack, max = 4): string {
  const parts = Object.entries(p.props).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([prop, n]) => `${categoryLabel(prop) ?? prop} ${n}`)
  if (!parts.length) return '还没有条目'
  return parts.length > max ? `${parts.slice(0, max).join(' · ')} 等 ${parts.length} 类` : parts.join(' · ')
}

export interface RuleOption { value: string; label: string }

/** 「属于规则」的选项：每套规则的默认范围（范围登记表），外加「未归类」。规则名取规则登记表。 */
export function ruleOptions(s: Services): RuleOption[] {
  const out: RuleOption[] = s.rules.list().map((r) => ({ value: r.id, label: r.name }))
  return [...out, { value: '', label: '未归类' }]
}

/** 行上的小标签：包属于的规则（后端判断，MyPack.rule）的版本短名（5e / 5.5e）；没归类写范围名或「未归类」。 */
export function versionTag(s: Services, pack: MyPack): string {
  if (!pack.rule) return pack.scopes.length ? pack.scopes.map((id) => BUILTIN_SCOPES.find((x) => x.id === id)?.name ?? id).join(' / ') : '未归类'
  const r = s.rules.list().find((x) => x.id === pack.rule)
  return r?.versionLabel ?? r?.name ?? pack.rule
}

/** 把一份作者格式内容存成文件下载。 */
export function downloadJson(filename: string, body: unknown): void {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' }))
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

/** 导出一对包：有中英两边就给两个文件（C5）。 */
export async function exportPair(s: Services, id: string, label: string, toast: Toast): Promise<void> {
  try {
    const files = await s.backend.library.bilingual.exportBoth(id)
    if (!files.length) { toast.error('没有找到这个包'); return }
    // 两个文件同名（作者按来源编号起名）：加上语言，免得下载时互相顶掉
    for (const f of files) { const base = (f.filename ?? `${id}.json`).replace(/\.json$/i, ''); downloadJson(files.length > 1 ? `${base}.${f.lang}.json` : `${base}.json`, f.body) }
    toast.success(files.length > 1 ? `已导出《${label}》中文、英文两个文件` : `已导出《${label}》`)
  } catch (e) { console.error('[trpg-assistant] 导出失败', e); toast.error(e instanceof Error ? e.message : '导出没有成功') }
}

/** 新建包时按名字给的编号建议：名字里的英文字母和数字；没有就给一个随机的，用户可以改。 */
export function suggestJson(name: string): string {
  const ascii = name.normalize('NFKD').replace(/[^A-Za-z0-9]+/g, '').toUpperCase().slice(0, 16)
  return ascii || `MY${Date.now().toString(36).slice(-5).toUpperCase()}`
}

/**
 * 后台「整理中」（U2 解析队列）：问后端哪些包还在整理，在整理就每 2 秒再问一次，整理完回调一次（重读列表）。
 * 组件卸载时停。
 */
export function usePending(s: () => Services, codeSets: () => string[], onDone: () => void) {
  const packs = ref<Set<string>>(new Set())
  /** 后台整理没成功（例如缺依赖）：原因；存的原文还在，[重试] 再整理一次。 */
  const failed = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null
  let stopped = false
  async function check(): Promise<void> {
    if (timer) { clearTimeout(timer); timer = null }
    if (stopped) return
    try {
      const rs = await Promise.all(codeSets().map((c) => s().backend.library.custom.pending(c)))
      const was = packs.value.size
      packs.value = new Set(rs.flatMap((r) => r.packs))
      const busy = rs.some((r) => r.busy || r.packs.length)
      if (busy) timer = setTimeout(() => void check(), 2000)
      else {
        const last = codeSets().map((c) => s().backend.library.brewQueue.last.get(c) as { error?: string; aborted?: boolean } | undefined).find((x) => x?.error && !x.aborted)
        failed.value = last?.error ?? null
        if (was) onDone()
      }
    } catch (e) { console.warn('[trpg-assistant] 读取整理状态没成功（不影响使用）', e) }
  }
  onBeforeUnmount(() => { stopped = true; if (timer) clearTimeout(timer) })
  async function retry(): Promise<void> {
    failed.value = null
    for (const c of codeSets()) s().backend.library.brewQueue.trigger(c)
    await check()
  }
  return { packs, failed, check, retry }
}
