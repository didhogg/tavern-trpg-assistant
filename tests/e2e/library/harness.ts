// 测试用入口：在模拟宿主页里调用插件的小窗启动代码（不经界面）。
import { startAuthorFrame } from '../../../src/library/runtime/host'

export async function startFrames(codeSets: string[]) {
  const pluginRoot = new URL('/', location.href)
  const out = []
  for (const codeSet of codeSets) {
    const t = performance.now()
    const { ready } = await startAuthorFrame({ codeSet, pluginRoot, container: document.body })
    out.push({ ...ready, ms: Math.round(performance.now() - t) })
  }
  return out
}
