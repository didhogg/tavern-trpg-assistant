// 插件这一侧的结算小窗（蓝图 §2.2 第 5 条、§3.1）：复用作者小窗宿主开 vendor/foundry/frame.html，回答小窗要的文件。
//   packs/<包>.json      → 插件自带（vendor/foundry/packs/，构建时由 dnd5e 作者 YAML 原样转成，tools/vendor-kernel-data.mjs）
//   modules/<模块>/…      → 插件自带（vendor/foundry/modules/，录到的原包文件）
//   modules/plutonium/data/<路径> → 先问【库】的 data/<路径>（驾驶员定 A：不带 Plutonium 自带的 128MB 拷贝），
//                                   【库】没有的（Plutonium 独有的补充文件）再读插件自带
//   data/…               → 【库】（5etools 作者数据；中文战役喂英文对照条目，所以读英文官方原件）
// 作者存储只放内存：结算只算不存（上位设计 §3.1），关掉小窗就没了。
// 世界数据怎么从存档组出来属于 P3-3；这里只留输入接口（KernelInput）。
import type { FileProvider } from '../../library/files'
import type { LibraryView } from '../../library/revision'
import { startAuthorFrame, type AuthorFrame, type FrameHandlers } from '../../library/runtime/host'
import { kernelDataSource } from '../../library/sources'
import type { KERNEL_COMMANDS } from './frame/commands'
import type { KernelInput } from './frame/world'
import type { PreparedBrew } from './brews'
import type { KernelBrewReport } from './frame/brew-input'

export type { KernelInput }

/** 5etools 作者数据（data/…）从哪里来。 */
export type DataReader = (path: string) => Promise<string | null>

/** 【库】里的英文官方原件，只读本地。 */
/** 小窗里本战役自制包文件的地址前缀（brews/<包编号>/<原文件名>）。 */
export const BREW_FILE_DIR = 'brews/'

export function libraryData(files: FileProvider, view?: LibraryView): DataReader {
  const source = kernelDataSource()
  return (path) => files.get(source, path, { allowNetwork: false, ...(view ? { view } : {}) })
}

export function kernelHandlers({ pluginRoot, data, fetchImpl = fetch, ask, moduleRoots = {}, brewFiles }: { pluginRoot: URL; data: DataReader; fetchImpl?: typeof fetch; ask?: (question: unknown) => Promise<unknown>; moduleRoots?: Record<string, string>; brewFiles?: ReadonlyMap<string, string> }): FrameHandlers {
  /** 插件文件：登记了私人文件夹的模块先到那里取（和小窗里 module-roots.ts 同一条登记），没有再取自带的。 */
  const pluginFile = async (path: string): Promise<Response> => {
    const id = /^modules\/([^/]+)\//.exec(path)?.[1]
    const root = id ? moduleRoots[id] : undefined
    if (root) {
      const moved = await fetchImpl(new URL(`vendor/foundry/${root}${path.slice(`modules/${id}/`.length)}`, pluginRoot))
      if (moved.status !== 404) return moved
    }
    return fetchImpl(new URL(`vendor/foundry/${path}`, pluginRoot))
  }
  const kv = new Map<string, unknown>()
  const local = new Map<string, string>()
  return {
    file: async (path) => {
      if (path.startsWith('data/')) return data(path)
      // 本战役自制包（作者收下的那份，open.ts 登记）：作者按「额外自制文件」地址来读时交这份
      if (path.startsWith(BREW_FILE_DIR)) return brewFiles?.get(path) ?? null
      const fiveTools = /^modules\/plutonium\/data\/(.+)$/.exec(path)
      if (fiveTools) {
        const text = await data(`data/${fiveTools[1]}`)
        if (text !== null) return text
      }
      if (/^(packs|modules)\//.test(path)) {
        const response = await pluginFile(path)
        if (response.status === 404) return null
        if (!response.ok) throw new Error(`读取插件文件失败（${response.status}）：${path}`)
        return response.text()
      }
      return null
    },
    kvGet: async (key) => kv.get(key) ?? null,
    kvSet: async (key, value) => { kv.set(key, value) },
    kvRemove: async (key) => { kv.delete(key) },
    localSnapshot: async () => Object.fromEntries(local),
    localSet: async (key, value) => { local.set(key, value) },
    localRemove: async (key) => { local.delete(key) },
    ...(ask ? { ask } : {}),
  }
}

type Commands = typeof KERNEL_COMMANDS & {
  boot(input: KernelInput): unknown
  loadBrews(brews: PreparedBrew[], itemMasteries: unknown[]): KernelBrewReport
  status(): unknown
  preparedActors(): Array<{ source: Record<string, unknown>; system: Record<string, unknown> }>
}

/**
 * 结算命令算没算完（蓝图五种状态）：complete = 完整；unsupported = 已算完，另附官方实际用到的未支持写法（提示，不是失败）。
 * missing / pending / error 才是没算完。人物的改动、保存、加条目都按这一条判断，不各写各的。
 */
export const executed = (status: unknown): boolean => status === 'complete' || status === 'unsupported'

export interface KernelSession {
  frame: AuthorFrame
  /** 启动世界（官方 Game.initialize，见 frame/main.ts）。 */
  boot(input: KernelInput): Promise<unknown>
  /** 结算命令（frame/commands.ts），结果原样交回。 */
  call<K extends keyof Commands>(fn: K, ...args: Parameters<Commands[K]>): Promise<Awaited<ReturnType<Commands[K]>>>
  close(): void
}

/** 开一个结算小窗。一个战役一个小窗（各自的世界互不相见）。 */
export async function startKernel({ pluginRoot, container, data, fetchImpl, timeoutMs = 120_000, ask, moduleRoots, brewFiles, visible }: { pluginRoot: URL; container: HTMLElement; data: DataReader; fetchImpl?: typeof fetch; timeoutMs?: number; ask?: (question: unknown) => Promise<unknown>; moduleRoots?: Record<string, string>; brewFiles?: ReadonlyMap<string, string>; visible?: boolean }): Promise<KernelSession> {
  const frame = await startAuthorFrame({ codeSet: 'foundry', pluginRoot, container, timeoutMs, visible, handlers: kernelHandlers({ pluginRoot, data, fetchImpl, ask, moduleRoots, brewFiles }) })
  // 结算小窗的指令表与作者小窗不同（frame/main.ts），宿主的类型只认作者指令，这里按结算指令表转一下类型
  const call = frame.call as unknown as (fn: string, ...args: unknown[]) => Promise<never>
  return {
    frame,
    boot: (input) => call('boot', input),
    call: (fn, ...args) => call(fn, ...args),
    close: () => frame.close(),
  }
}
