// B3 真机验证入口（设置 › 诊断）：在真实酒馆里调用【库】后端——装中文官方、体检、查一本书、断网读取、存储空间。
// 只是诊断按钮，不是【库】界面（界面在 P4 做）。结果原样显示在诊断页，可以整份复制给开发者。
import { LibraryDatabase } from '../library/db'
import { FileProvider } from '../library/files'
import { installOfficial, storageEstimate } from '../library/install'
import { libraryHandlers } from '../library/runtime/handlers'
import { startAuthorFrame } from '../library/runtime/host'
import { LibraryService } from '../library/service'
import { getSource } from '../library/sources'
import { guard, setResult } from './store'
import type { ProbeModule } from './types'

const ID = 'library-b3'
const TITLE = '【库】真机验证（B3）'

/** 插件根目录：本文件打包进 dist/index.js，根目录是它的上一级。 */
const pluginRoot = (): URL => new URL('../', import.meta.url)

let lib: { db: LibraryDatabase; files: FileProvider; service: LibraryService } | null = null

function library() {
  if (lib) return lib
  const db = new LibraryDatabase()
  const files = new FileProvider({ db })
  const openFrame = (codeSet: string, kvScope?: string) => startAuthorFrame({ codeSet, pluginRoot: pluginRoot(), container: document.body, handlers: libraryHandlers({ codeSet, db, files, allowNetwork: () => false, kvScope }) })
  lib = { db, files, service: new LibraryService({ db, openFrame }) }
  return lib
}

export function createLibraryProbe(): ProbeModule {
  const install = () =>
    guard(ID, TITLE, async () => {
      const { db, files, service } = library()
      const source = getSource('cn-official')
      setResult(ID, TITLE, 'waiting', '正在下载并解析中文官方数据（约几分钟，请保持页面打开）…')
      const report = await installOfficial({
        source, db, files,
        openFrame: () => startAuthorFrame({ codeSet: source.codeSet, pluginRoot: pluginRoot(), container: document.body, handlers: libraryHandlers({ codeSet: source.codeSet, db, files, allowNetwork: () => false }) }),
        onProgress: (p) => setResult(ID, TITLE, 'waiting', `安装中：${p.stage} ${p.done}/${p.total} ${p.item ?? ''}`),
      })
      service.reset()
      const ok = !report.download.failed.length && !report.mirror.missing.length && !report.mirror.mismatched.length && !report.parse.errors.length
      setResult(ID, TITLE, ok ? 'pass' : 'fail', `安装${ok ? '成功' : '有问题'}：${report.plan.files} 个文件，解析 ${Object.keys(report.parse.props).length} 类，用时 ${Math.round(report.ms / 1000)} 秒`, {
        download: { fetched: report.download.fetched, reused: report.download.reused, failed: report.download.failed },
        mirror: { checked: report.mirror.checked, missing: report.mirror.missing.length, mismatched: report.mirror.mismatched.length },
        parseErrors: report.parse.errors, storage: report.storage,
      })
    })

  const health = () =>
    guard(ID, TITLE, async () => {
      const r = await library().service.health()
      const bad = r.items.filter((i) => i.level === 'error')
      setResult(ID, TITLE, bad.length ? 'fail' : 'pass', `体检：ok ${r.summary.ok} · info ${r.summary.info} · warn ${r.summary.warn} · error ${r.summary.error}`,
        r.items.map((i) => ({ source: i.source, check: i.check, level: i.level, count: i.count, title: i.title })))
    })

  /** 查一本书：XPHB 的法术条数、火球术详情（含英文原文）、搜索"火球"。断网时按这个按钮就是"断网读取"。 */
  const book = () =>
    guard(ID, TITLE, async () => {
      const { service } = library()
      const spells = await service.query('cn-official', 'spell', { source: 'XPHB' })
      const fireball = spells.find((r) => (r.item as { ENG_name?: string }).ENG_name === 'Fireball')
      const detail = fireball?.hash ? await service.detail('cn-official', 'spell', fireball.hash, 'XPHB') : null
      const hits = await service.search('cn-official', '火球')
      setResult(ID, TITLE, spells.length && detail ? 'pass' : 'fail', `XPHB 法术 ${spells.length} 条；火球术详情${detail ? '取到' : '没取到'}；英文原文：${detail?.english?.status ?? '无'}；搜索"火球" ${hits.length} 条；当前${navigator.onLine ? '联网' : '断网'}`, {
        fireball: detail?.item, english: detail?.english, searchTop: hits.slice(0, 5).map((h) => h.doc),
      })
    })

  const space = () =>
    guard(ID, TITLE, async () => {
      const e = await storageEstimate()
      const mb = (n: number | null) => (n === null ? '未知' : `${Math.round(n / 1048576)}MB`)
      setResult(ID, TITLE, 'info', `存储：已用 ${mb(e.usage)} / 可用上限 ${mb(e.quota)}；持久存储 ${e.persisted === null ? '未知' : e.persisted ? '已授予' : '未授予'}`, e)
    })

  return {
    id: ID,
    title: TITLE,
    hint: '依次点：①装中文官方（联网，几分钟）②体检 ③查一本书 ④关掉网络、刷新页面后再点"查一本书"（断网读取）⑤存储空间。英文原文要英文官方也装上，这里不装，显示 not-installed 是正常的。',
    actions: [
      { label: '①装中文官方', run: install },
      { label: '②体检', run: health },
      { label: '③查一本书（断网时即断网读取）', run: book },
      { label: '⑤存储空间', run: space },
    ],
  }
}
