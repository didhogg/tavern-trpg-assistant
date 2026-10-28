import { reactive } from 'vue'
import type { ProbeResult, ProbeStatus } from './types'

export const results = reactive<Record<string, ProbeResult>>({})

export function setResult(
  id: string,
  title: string,
  status: ProbeStatus,
  summary: string,
  detail?: unknown,
): void {
  results[id] = { id, title, status, summary, detail, at: new Date().toISOString() }
}

/** 执行探针步骤；出错时记录为 error 并输出到控制台。 */
export async function guard(id: string, title: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
  } catch (error) {
    console.error(`[trpg-assistant] 探针 ${id} 出错`, error)
    setResult(id, title, 'error', error instanceof Error ? error.message : String(error))
  }
}

export function buildReport(env: unknown): unknown {
  return {
    generatedAt: new Date().toISOString(),
    env,
    results: Object.values(results),
  }
}
