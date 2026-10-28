import { waitForTauriTavern } from '../host/context'
import { MARKER_COMMENT, MARKER_INJECT, scanPayload } from './promptScan'
import type { ProbeStatus } from './types'

type Dict = Record<string, unknown>
type LlmLogs = {
  index?: (a?: unknown) => Promise<unknown>
  getRaw?: (id: unknown) => Promise<unknown>
  getPreview?: (id: unknown) => Promise<unknown>
}

function entryId(entry: unknown): unknown {
  if (entry && typeof entry === 'object') {
    const e = entry as Dict
    return e.id ?? e.key ?? e.logId ?? e.name
  }
  return entry
}

/** 读取 TauriTavern 记录的最近一次 LLM 请求原文，检查测试标记。 */
export async function auditLlmLogs(): Promise<{ status: ProbeStatus; summary: string; detail: unknown }> {
  const host = await waitForTauriTavern()
  const logs = (host?.api?.dev as Dict | undefined)?.llmApiLogs as LlmLogs | undefined
  if (!logs?.index || !logs.getRaw) {
    return { status: 'info', summary: '宿主没有请求日志接口，只能依靠事件判定', detail: null }
  }
  const index = await logs.index()
  const entries = Array.isArray(index) ? index : []
  const latest = entries[entries.length - 1] ?? entries[0]
  const meta = (latest && typeof latest === 'object' ? latest : {}) as Dict
  // 日志条目含接口地址与模型名，报告中只保留与判定有关的字段
  const detail: Dict = { count: entries.length, latestEntry: { id: meta.id, ok: meta.ok, stream: meta.stream, durationMs: meta.durationMs } }
  if (latest === undefined) return { status: 'info', summary: '请求日志为空（可能未开启记录，或还没有发过请求）', detail }
  const raw = await logs.getRaw(entryId(latest))
  const scan = scanPayload(raw)
  detail.scan = scan
  detail.markers = [MARKER_COMMENT, MARKER_INJECT]
  return {
    status: 'info',
    summary: `最近一次请求原文：${scan.comment ? `含注释标记${scan.commentIntact ? '（符号完整）' : '（符号被改）'}` : '无注释标记'}；${scan.inject ? '含注入标记' : '无注入标记'}`,
    detail,
  }
}
