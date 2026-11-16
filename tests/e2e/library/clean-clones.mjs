// npm run clean:profiles —— 删掉"登记过、但进程已经死了"的 e2e 资料副本（被 kill -9、崩溃留下的）。
// 只按 freshProfile 的登记删，不猜名字；进程还活着的不动；底座从来没登记过，所以不会被删。
// 克隆中途被杀时，孤儿 cp 还会再写几秒：这种暂时删不掉，保留登记并提示稍后再跑一次（退出码 1）。
import { sweepStale } from './profile-clone.mjs'

const { removed, busy } = sweepStale()
if (removed.length) console.log(`已删 ${removed.length} 个残留副本：\n${removed.map((p) => `  ${p}`).join('\n')}`)
if (busy.length) console.log(`还有 ${busy.length} 个暂时删不掉（可能是被杀的克隆里孤儿 cp 还在写，几秒后再跑一次）：\n${busy.map((p) => `  ${p}`).join('\n')}`)
if (!removed.length && !busy.length) console.log('没有残留副本。')
process.exit(busy.length ? 1 : 0)
