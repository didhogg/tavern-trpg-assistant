import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { materialize } from './trial'

type Lib = 'cn' | 'en'
const CORE = ['js/locale.js', 'js/parser.js', 'js/utils.js', 'js/utils-ui.js', 'js/render.js', 'js/render-dice.js', 'js/hist.js', 'js/utils-dataloader.js', 'js/utils-config.js']

/** 把上游代码（原样库里的 code 表）还原并加载进本进程，返回它挂在全局上的对象。一个进程只能加载一个库。 */
export async function loadUpstream(lib: Lib): Promise<Record<string, any>> {
  const root = materialize(lib)
  for (const m of CORE) {
    try { await import(pathToFileURL(join(root, m)).href) } catch (e) { if (!/locale/.test(m)) throw new Error(`加载上游 ${m} 失败：${(e as Error).message}`) }
  }
  return globalThis as unknown as Record<string, any>
}
