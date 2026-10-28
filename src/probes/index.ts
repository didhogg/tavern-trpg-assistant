import type { StContext } from '../host/types'
import { createEnvProbe } from './envProbe'
import { createEventsProbe } from './eventsProbe'
import { createIdentityProbe } from './identityProbe'
import { createM1Probe } from './m1Probe'
import { createM2Probe } from './m2Probe'
import { createPromptProbes } from './promptProbes'
import { createStorageProbe } from './storageProbe'
import { createTauriProbe } from './tauriProbe'
import type { ProbeModule } from './types'

export function createProbes(ctx: StContext): ProbeModule[] {
  return [
    createM1Probe(),
    createM2Probe(),
    createEnvProbe(ctx),
    ...createPromptProbes(ctx),
    createStorageProbe(ctx),
    createIdentityProbe(ctx),
    createEventsProbe(ctx),
    createTauriProbe(),
  ]
}
