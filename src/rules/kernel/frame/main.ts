// 结算小窗入口（vendor/foundry/frame.html）。官方 foundry.mjs 原样加载、无界面运行（蓝图决定 8、§2.3）：
// 只做三件事：① 页面就绪后才加载 foundry.mjs（否则它会自己连服务器启动）；② 组世界数据、接本地服务器；
// ③ 按官方 Game.initialize 启动，省去画布、键鼠、音视频与界面渲染。规则计算全部是 dnd5e / Plutonium 原代码。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方全局对象没有类型声明。 */
import { CHANNEL, FRAME_PARAM, type FrameCall, type FrameReady, type FrameResult } from '../../../library/runtime/protocol'
import { assembleWorld, type KernelInput } from './world'
import { createServer, type ChangeRecord } from './server'
import { reseedKernel } from './seed'
import { KERNEL_COMMANDS } from './commands'

const g = globalThis as any
const frameToken = new URLSearchParams(location.search).get(FRAME_PARAM) ?? ''
const errors: string[] = g.__trpgFrameErrors ?? []
let nextId = 1
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()

function request(body: Record<string, unknown>): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = 1_000_000 + nextId++
    pending.set(id, { resolve, reject })
    parent.postMessage({ channel: CHANNEL, type: 'request', frame: frameToken, id, ...body }, location.origin)
  })
}
addEventListener('message', event => {
  const d = event.data
  if (event.source !== parent || d?.channel !== CHANNEL || d.type !== 'response' || !pending.has(d.id)) return
  const p = pending.get(d.id)!
  pending.delete(d.id)
  if (d.ok) p.resolve(d.value)
  else p.reject(new Error(d.error))
})

async function readText(path: string): Promise<string> {
  const response = await fetch(new URL(path, location.href))
  if (!response.ok) throw Error(`${response.status}: ${path}`)
  return response.text()
}
async function readPack(id: string): Promise<any[]> {
  const text = await request({ op: 'file', path: `packs/${id}.json` })
  if (typeof text !== 'string') throw Error(`Pack is not available: ${id}`)
  return JSON.parse(text)
}

let kernel: { changes: ChangeRecord[]; calls: any[]; steps: string[] } | undefined

async function boot(input: KernelInput): Promise<unknown> {
  if (kernel) throw Error('Kernel is already booted')
  const steps: string[] = []
  const { foundry, Hooks } = g
  reseedKernel(input.seed ?? 'kernel')
  // 版本信息必须先建：包对象构造时就要判断可用性。
  g.release = new foundry.config.ReleaseData(input.release)
  const data = assembleWorld(input)
  g.packages = {
    System: new foundry.utils.Collection([[data.system.id, new foundry.packages.System(data.system)]]),
    Module: new foundry.utils.Collection(data.modules.map((m: any) => [m.id, new foundry.packages.Module(m)])),
  }
  const socket = g.io({ autoConnect: false, forceNew: true })
  const server = createServer(socket, { userId: input.userId, worldTime: input.worldTime, readPack, readText })
  kernel = { ...server, steps }
  const OfficialGame: new (...args: any[]) => any = foundry.Game
  class KernelGame extends OfficialGame {
    activateListeners(): void { steps.push('omit UI event listeners') }
    initializeUI(): void {
      // 通知等接口用官方登记的界面原类，只构造不渲染。
      for (const [name, Class] of Object.entries(g.CONFIG.ui) as [string, any][]) g.ui[name] = new Class()
      g.ui.windows ??= {}
    }
    initializeMouse(): void { steps.push('omit mouse') }
    initializeKeyboard(): void { steps.push('omit keyboard') }
    initializeGamepads(): void { steps.push('omit gamepads') }
    initializeRTC(): void { steps.push('omit AV') }
    async initializeCanvas(): Promise<void> { steps.push('omit canvas') }
  }
  g.game = new KernelGame('game', data, socket)
  // 结算小窗不要新手引导/欢迎场景：那是界面，而且会向服务器取我们没带的默认场景。
  if (g.game.nue) g.game.nue.initialize = () => undefined
  // 官方声明的 client 设置，放客户端存储才生效。
  g.game.settings.storage.get('client').setItem('core.noCanvas', 'true')
  await loadClassic(`systems/${data.system.id}/dnd5e.js`)
  for (const m of data.modules) for (const path of m.esmodules ?? []) await import(/* @vite-ignore */ new URL(path, location.href).href)
  Hooks.once('setup', () => {
    // 只关闭显示用的日历 HUD；时间规则仍由官方程序执行。
    if (g.CONFIG.DND5E?.calendar) g.CONFIG.DND5E.calendar.application = null
  })
  await g.game.initialize()
  // 模块接口在各自 ready 处理末尾才赋值（Plutonium 是异步的）；等启用模块的接口就绪再报告。
  const deadline = Date.now() + 30_000
  while (data.modules.some((m: any) => m.id === 'plutonium') && typeof g.game.modules.get('plutonium')?.api !== 'object') {
    if (Date.now() > deadline) throw Error('Plutonium API was not ready within 30 seconds')
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  return status()
}

function status(): unknown {
  const game = g.game
  return {
    release: game.release.version, system: game.system.version, rules: game.settings.get('dnd5e', 'rulesVersion'),
    worldTime: game.time.worldTime, actors: game.actors.size, invalid: [...game.actors.invalidDocumentIds],
    modules: Object.fromEntries(game.modules.map((m: any) => [m.id, { active: m.active, availability: m.availability }])),
    plutoniumApi: typeof game.modules.get('plutonium')?.api, errors: [...errors],
  }
}

/** 对答案用：各角色/怪物准备后的数据（源数据 + 系统准备结果 + 校验失败）。 */
function preparedActors(): unknown {
  return g.game.actors.contents.map((a: any) => ({ source: a.toObject(), system: a.system.toObject(false), name: a.name, validation: a.validationFailures }))
}

const COMMANDS: Record<string, (...args: any[]) => unknown> = {
  ...KERNEL_COMMANDS,
  boot,
  status,
  preparedActors,
  changes: () => kernel?.changes ?? [],
  calls: () => kernel?.calls ?? [],
  steps: () => kernel?.steps ?? [],
}

addEventListener('message', event => {
  const d = event.data as FrameCall | null
  if (event.source !== parent || d?.channel !== CHANNEL || d.type !== 'call') return
  const reply = (body: Omit<FrameResult, 'channel' | 'type' | 'id' | 'frame'>): void =>
    parent.postMessage({ channel: CHANNEL, type: 'result', frame: frameToken, id: d.id, ...body } satisfies FrameResult, location.origin)
  const fn = COMMANDS[d.fn]
  if (!fn) return reply({ ok: false, error: `Unknown kernel command: ${d.fn}` })
  Promise.resolve().then(() => fn(...d.args)).then(
    value => reply({ ok: true, value }),
    (error: unknown) => reply({ ok: false, error: error instanceof Error ? error.stack ?? error.message : String(error) }),
  )
})

function loadClassic(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.onload = () => resolve()
    el.onerror = () => reject(Error(`Failed to load ${src}`))
    document.head.append(el)
  })
}

async function start(): Promise<void> {
  g.SIGNED_EULA = true
  g.ROUTE_PREFIX = new URL('.', location.href).pathname.replace(/^\/+|\/+$/g, '')
  g.MESSAGES = null
  // 页面已就绪后才加载：官方 foundry.mjs 在“页面就绪”事件里自动连服务器启动，晚加载就不会触发。
  await import(/* @vite-ignore */ new URL('scripts/foundry.mjs', location.href).href)
  const message: FrameReady = { channel: CHANNEL, type: 'ready', frame: frameToken, codeSet: 'foundry',
    authorVersion: g.foundry?.CONST?.vtt ?? null, present: { foundry: Boolean(g.foundry?.Game) }, errors: [...errors] }
  parent.postMessage(message, location.origin)
}

// 模块脚本在“页面就绪”之前执行，所以等到整页加载完再开始。
if (document.readyState === 'complete') void start()
else addEventListener('load', () => { void start() }, { once: true })
