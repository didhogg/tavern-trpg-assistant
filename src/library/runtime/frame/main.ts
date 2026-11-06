// 小窗里在作者脚本之后运行：向插件报告作者程序是否就绪。
// 这里只检查作者的全局对象在不在，不调用、不改作者程序。
import { CHANNEL, type FrameReady } from '../protocol'

const AUTHOR_GLOBALS = ['DataLoader', 'DataUtil', 'BrewUtil2', 'PrereleaseUtil', 'ExcludeUtil', 'StorageUtil', 'Renderer', 'Omnidexer', 'UrlUtil', 'Hist', 'Parser', 'SourceUtil']

const g = globalThis as Record<string, unknown>
const codeSet = new URL('.', location.href).pathname.split('/').filter(Boolean).at(-1) ?? ''
const message: FrameReady = {
  channel: CHANNEL,
  type: 'ready',
  codeSet,
  authorVersion: typeof g.VERSION_NUMBER === 'string' ? g.VERSION_NUMBER : null,
  present: Object.fromEntries(AUTHOR_GLOBALS.map((name) => [name, typeof g[name] !== 'undefined'])),
  errors: [...((g.__trpgFrameErrors as string[] | undefined) ?? [])],
}
parent.postMessage(message, location.origin)
