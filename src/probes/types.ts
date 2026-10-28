export type ProbeStatus = 'idle' | 'waiting' | 'pass' | 'fail' | 'info' | 'error'

export interface ProbeResult {
  id: string
  title: string
  status: ProbeStatus
  summary: string
  detail?: unknown
  at: string
}

export interface ProbeAction {
  label: string
  run: () => void | Promise<void>
}

export interface ProbeModule {
  id: string
  title: string
  hint: string
  actions: ProbeAction[]
  start?: () => void | Promise<void>
}
