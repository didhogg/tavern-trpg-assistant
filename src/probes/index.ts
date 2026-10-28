import type { StContext } from '../host/types'
import { createEnvProbe } from './envProbe'
import { createEventsProbe } from './eventsProbe'
import { createIdentityProbe } from './identityProbe'
import { createPromptProbes } from './promptProbes'
import { createStorageProbe } from './storageProbe'
import { createTauriProbe } from './tauriProbe'
import type { ProbeModule } from './types'

export function createProbes(ctx: StContext): ProbeModule[] {
  return [
    createEnvProbe(ctx),
    ...createPromptProbes(ctx),
    createStorageProbe(ctx),
    createIdentityProbe(ctx),
    createEventsProbe(ctx),
    createTauriProbe(),
  ]
}
