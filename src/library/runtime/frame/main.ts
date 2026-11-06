// 小窗里在作者脚本之后运行：① 向插件报告作者程序是否就绪；② 接插件的指令，转调作者函数（commands.ts）。
import { CHANNEL, FRAME_PARAM, type FrameCall, type FrameReady, type FrameResult } from '../protocol'
import { COMMANDS } from './commands'

const AUTHOR_GLOBALS = ['DataLoader', 'DataUtil', 'BrewUtil2', 'PrereleaseUtil', 'ExcludeUtil', 'StorageUtil', 'Renderer', 'Omnidexer', 'UrlUtil', 'Hist', 'Parser', 'SourceUtil']

const g = globalThis as Record<string, unknown>
const frameToken = new URLSearchParams(location.search).get(FRAME_PARAM) ?? ''

addEventListener('message', (event) => {
  const d = event.data as FrameCall | null
  if (event.source !== parent || !d || d.channel !== CHANNEL || d.type !== 'call') return
  const reply = (body: Omit<FrameResult, 'channel' | 'type' | 'id' | 'frame'>): void => parent.postMessage({ channel: CHANNEL, type: 'result', frame: frameToken, id: d.id, ...body } satisfies FrameResult, location.origin)
  const fn = (COMMANDS as Record<string, (...args: unknown[]) => Promise<unknown>>)[d.fn]
  if (!fn) {
    reply({ ok: false, error: `小窗没有这个指令：${d.fn}` })
    return
  }
  fn(...d.args).then(
    (value) => reply({ ok: true, value }),
    (error: unknown) => reply({ ok: false, error: error instanceof Error ? error.stack ?? error.message : String(error) }),
  )
})

const codeSet = new URL('.', location.href).pathname.split('/').filter(Boolean).at(-1) ?? ''
const message: FrameReady = {
  channel: CHANNEL,
  type: 'ready',
  frame: frameToken,
  codeSet,
  authorVersion: typeof g.VERSION_NUMBER === 'string' ? g.VERSION_NUMBER : null,
  present: Object.fromEntries(AUTHOR_GLOBALS.map((name) => [name, typeof g[name] !== 'undefined'])),
  errors: [...((g.__trpgFrameErrors as string[] | undefined) ?? [])],
}
parent.postMessage(message, location.origin)
