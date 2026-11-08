// 插件这一侧的结算小窗（蓝图 §2.2 第 5 条、§3.1）：复用作者小窗宿主开 vendor/foundry/frame.html，回答小窗要的文件。
//   packs/<包>.json      → 插件自带（vendor/foundry/packs/，构建时由 dnd5e 作者 YAML 原样转成，tools/vendor-kernel-data.mjs）
//   modules/<模块>/…      → 插件自带（vendor/foundry/modules/，录到的原包文件）
//   modules/plutonium/data/<路径> → 先问【库】的 data/<路径>（驾驶员定 A：不带 Plutonium 自带的 128MB 拷贝），
//                                   【库】没有的（Plutonium 独有的补充文件）再读插件自带
//   data/…               → 【库】（5etools 作者数据；中文战役喂英文对照条目，所以读英文官方原件）
// 作者存储只放内存：结算只算不存（上位设计 §3.1），关掉小窗就没了。
// 世界数据怎么从存档组出来属于 P3-3；这里只留输入接口（KernelInput）。
import type { FileProvider } from '../../library/files'
import { startAuthorFrame, type AuthorFrame, type FrameHandlers } from '../../library/runtime/host'
import { officialSourceOf } from '../../library/sources'
import type { KERNEL_COMMANDS } from './frame/commands'
import type { KernelInput } from './frame/world'

export type { KernelInput }

/** 5etools 作者数据（data/…）从哪里来。 */
export type DataReader = (path: string) => Promise<string | null>

/** 【库】里的英文官方原件，只读本地。 */
export function libraryData(files: FileProvider): DataReader {
  const source = officialSourceOf('en')
  return (path) => files.get(source, path, { allowNetwork: false })
}

export function kernelHandlers({ pluginRoot, data, fetchImpl = fetch }: { pluginRoot: URL; data: DataReader; fetchImpl?: typeof fetch }): FrameHandlers {
  const kv = new Map<string, unknown>()
  const local = new Map<string, string>()
  return {
    file: async (path) => {
      if (path.startsWith('data/')) return data(path)
      const fiveTools = /^modules\/plutonium\/data\/(.+)$/.exec(path)
      if (fiveTools) {
        const text = await data(`data/${fiveTools[1]}`)
        if (text !== null) return text
      }
      if (/^(packs|modules)\//.test(path)) {
        const response = await fetchImpl(new URL(`vendor/foundry/${path}`, pluginRoot))
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
  }
}

type Commands = typeof KERNEL_COMMANDS & {
  boot(input: KernelInput): unknown
  status(): unknown
  preparedActors(): Array<{ source: Record<string, unknown> }>
}

export interface KernelSession {
  frame: AuthorFrame
  /** 启动世界（官方 Game.initialize，见 frame/main.ts）。 */
  boot(input: KernelInput): Promise<unknown>
  /** 结算命令（frame/commands.ts），结果原样交回。 */
  call<K extends keyof Commands>(fn: K, ...args: Parameters<Commands[K]>): Promise<Awaited<ReturnType<Commands[K]>>>
  close(): void
}

/** 开一个结算小窗。一个战役一个小窗（各自的世界互不相见）。 */
export async function startKernel({ pluginRoot, container, data, fetchImpl, timeoutMs = 120_000 }: { pluginRoot: URL; container: HTMLElement; data: DataReader; fetchImpl?: typeof fetch; timeoutMs?: number }): Promise<KernelSession> {
  const frame = await startAuthorFrame({ codeSet: 'foundry', pluginRoot, container, timeoutMs, handlers: kernelHandlers({ pluginRoot, data, fetchImpl }) })
  // 结算小窗的指令表与作者小窗不同（frame/main.ts），宿主的类型只认作者指令，这里按结算指令表转一下类型
  const call = frame.call as unknown as (fn: string, ...args: unknown[]) => Promise<never>
  return {
    frame,
    boot: (input) => call('boot', input),
    call: (fn, ...args) => call(fn, ...args),
    close: () => frame.close(),
  }
}
