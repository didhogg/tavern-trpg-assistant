import { markRaw } from 'vue'
import type { InstallPlan, Resolution } from '../../core/packs/installer'
import type { RecognizedPack } from '../../core/packs/recognize'
import { useAppStore } from '../../stores/app'
import { askChoice } from '../kit/choice'
import NameConflictPage from './NameConflictPage.vue'
import OverwritePage from './OverwritePage.vue'

export type Decision = { ok: true; resolution?: Resolution } | { ok: false }

let counter = 0

/** 覆盖与同名：作为当前弹窗里的确认页显示，「‹」或 Esc 即取消。 */
export async function decideResolution(rec: RecognizedPack, plan: InstallPlan): Promise<Decision> {
  if (plan.action === 'install') return { ok: true }
  if (plan.action === 'overwrite') {
    const ok = await askChoice<boolean>(
      { key: `confirm:overwrite-${++counter}`, title: '覆盖扩展包？', component: markRaw(OverwritePage), props: (answer) => ({ plan, rec, onAnswer: answer }) },
      false,
    )
    return ok ? { ok: true, resolution: 'overwrite' } : { ok: false }
  }
  const usedBy = plan.existing ? (await useAppStore().svc().packs.referencingSaves(plan.existing.id)).length : 0
  const choice = await askChoice<'keep-both' | 'replace' | 'cancel'>(
    {
      key: `confirm:name-${++counter}`,
      title: '已有同名扩展包',
      component: markRaw(NameConflictPage),
      props: (answer) => ({ name: rec.manifest.name, canReplace: !!plan.canReplace, usedBy, onChoose: answer }),
    },
    'cancel',
  )
  return choice === 'cancel' ? { ok: false } : { ok: true, resolution: choice }
}
