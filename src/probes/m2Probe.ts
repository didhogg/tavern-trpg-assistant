import { runM2SelfTest, type M2Step } from '../core/m2selftest'
import { guard, setResult } from './store'
import type { ProbeModule } from './types'

const ID = 'm2'
const TITLE = 'M2 数据自检'

export function createM2Probe(): ProbeModule {
  return {
    id: ID,
    title: TITLE,
    hint: '在临时数据库里安装内置 SRD 包、从数据仓库下载一个书籍包、显示条数与抽样来源、对每种数据做一次往返，按依赖层级安装和卸载全部书籍包，最后清理测试数据库。数据仓库尚未发布时下载一步会跳过；只用临时库，不影响真实数据。',
    actions: [
      {
        label: '运行 M2 数据自检',
        run: () =>
          guard(ID, TITLE, async () => {
            setResult(ID, TITLE, 'waiting', '正在运行…')
            const steps: M2Step[] = await runM2SelfTest((step) => setResult(ID, TITLE, 'waiting', `已完成 ${step.name}`))
            const failed = steps.find((s) => !s.ok)
            const skipped = steps.filter((s) => s.skipped).length
            const total = 7
            setResult(
              ID,
              TITLE,
              failed ? 'fail' : 'pass',
              failed
                ? `未通过：${failed.name} — ${failed.detail ?? ''}`
                : `全部通过（${steps.length}/${total} 步${skipped ? `，${skipped} 步跳过` : ''}）`,
              steps.map((s) => `${s.ok ? (s.skipped ? '↷' : '✓') : '✗'} ${s.name}${s.detail ? ` — ${s.detail}` : ''}`),
            )
          }),
      },
    ],
  }
}
