import { runSelfTest, type SelfTestStep } from '../core/selftest'
import { guard, setResult } from './store'
import type { ProbeModule } from './types'

const ID = 'm1'
const TITLE = 'M1 数据层自检'

export function createM1Probe(): ProbeModule {
  return {
    id: ID,
    title: TITLE,
    hint: '在独立的临时数据库里走完：安装内容包 → 新存档 → 保存 → 分支 → 读取 → 副本 → 删除与恢复 → 导出导入 → 备份恢复。只用合成数据，结束后自动删除，不影响你的真实数据。',
    actions: [
      {
        label: '运行 M1 数据层自检',
        run: () =>
          guard(ID, TITLE, async () => {
            setResult(ID, TITLE, 'waiting', '正在运行…')
            const steps: SelfTestStep[] = await runSelfTest((step) => setResult(ID, TITLE, 'waiting', `已完成 ${step.name}`))
            const failed = steps.find((s) => !s.ok)
            const total = 10
            setResult(
              ID,
              TITLE,
              failed ? 'fail' : 'pass',
              failed ? `未通过：${failed.name} — ${failed.detail ?? ''}` : `全部通过（${steps.length}/${total} 步）`,
              steps.map((s) => `${s.ok ? '✓' : '✗'} ${s.name}${s.detail ? ` — ${s.detail}` : ''}`),
            )
          }),
      },
    ],
  }
}
