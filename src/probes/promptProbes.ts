import { eventName, getTextarea, onEvent, setTextareaValue } from '../host/context'
import type { ChatMessage, StContext } from '../host/types'
import { guard, setResult } from './store'
import { MARKER_COMMENT, MARKER_INJECT, scanPayload, type ScanResult } from './promptScan'
import type { ProbeModule } from './types'

const COMMENT_ID = 'comment'
const COMMENT_TITLE = '注释是否进入发给 AI 的请求'
const INJECT_ID = 'inject'
const INJECT_TITLE = '提示词注入是否生效'
const INPUT_ID = 'input'
const INPUT_TITLE = '写入与读取输入框'
const INJECT_KEY = 'tavern-trpg-assistant_probe'
const FALLBACK_IN_CHAT = 1
const FALLBACK_ROLE_SYSTEM = 0

interface CaptureRecord extends ScanResult {
  event: string
  dryRun: boolean
}

function isDryRun(payload: unknown): boolean {
  return (payload as { dryRun?: boolean } | null)?.dryRun === true
}

export function createPromptProbes(ctx: StContext): ProbeModule[] {
  let commentArmed = false
  let injectArmed = false
  let runType = ''
  let captures: CaptureRecord[] = []
  const messageChecks: Record<string, unknown> = {}

  const capture = (event: string) => (payload: unknown) => {
    captures.push({ event, dryRun: isDryRun(payload), ...scanPayload(payload) })
  }

  const evaluate = () => {
    const live = captures.filter((c) => !c.dryRun)
    if (runType === 'quiet') return
    if (!live.length) {
      if (commentArmed) setResult(COMMENT_ID, COMMENT_TITLE, 'waiting', '这次生成没有捕获到请求事件（模型已连接吗？）')
      if (injectArmed) setResult(INJECT_ID, INJECT_TITLE, 'waiting', '这次生成没有捕获到请求事件（模型已连接吗？）')
      return
    }
    if (commentArmed) {
      const hit = live.find((c) => c.comment)
      const intact = live.some((c) => c.commentIntact)
      setResult(
        COMMENT_ID,
        COMMENT_TITLE,
        hit ? (intact ? 'pass' : 'fail') : 'fail',
        hit
          ? intact
            ? '注释原样进入了请求（<!-- --> 完整保留）'
            : '标记文字进入了请求，但 <!-- --> 符号被改动或删除'
          : '请求中没有找到注释内容（注释被删除）',
        { runType, captures: live, message: messageChecks },
      )
      commentArmed = false
    }
    if (injectArmed) {
      const hit = live.find((c) => c.inject)
      setResult(
        INJECT_ID,
        INJECT_TITLE,
        hit ? 'pass' : 'fail',
        hit
          ? `注入文本进入了请求${hit.injectAt ? `（${hit.injectAt.role} 消息，距末尾 ${hit.injectAt.indexFromEnd} 条）` : ''}`
          : '请求中没有找到注入文本',
        { runType, captures: live },
      )
      injectArmed = false
    }
  }

  const start = () => {
    const prompt = eventName(ctx, 'CHAT_COMPLETION_PROMPT_READY', 'chat_completion_prompt_ready')
    const combine = eventName(ctx, 'GENERATE_AFTER_COMBINE_PROMPTS', 'generate_after_combine_prompts')
    const data = eventName(ctx, 'GENERATE_AFTER_DATA', 'generate_after_data')
    onEvent(ctx, prompt, capture(prompt))
    onEvent(ctx, combine, capture(combine))
    onEvent(ctx, data, capture(data))
    onEvent(ctx, eventName(ctx, 'GENERATION_STARTED', 'generation_started'), (type, _params, dry) => {
      if (dry === true) return
      runType = String(type ?? '')
      captures = []
    })
    const finish = () => evaluate()
    onEvent(ctx, eventName(ctx, 'GENERATION_ENDED', 'generation_ended'), finish)
    onEvent(ctx, eventName(ctx, 'GENERATION_STOPPED', 'generation_stopped'), finish)
    onEvent(ctx, eventName(ctx, 'MESSAGE_SENT', 'message_sent'), (id) => {
      const message = ctx.chat[Number(id)] as ChatMessage | undefined
      messageChecks.storedInChat = !!message?.mes?.includes(MARKER_COMMENT)
    })
    onEvent(ctx, eventName(ctx, 'USER_MESSAGE_RENDERED', 'user_message_rendered'), (id) => {
      const el = document.querySelector(`.mes[mesid="${Number(id)}"] .mes_text`)
      if (!el) return
      messageChecks.visibleTextHasMarker = !!el.textContent?.includes(MARKER_COMMENT)
      messageChecks.htmlHasComment = el.innerHTML.includes(`<!--${MARKER_COMMENT}`)
    })
  }

  const commentModule: ProbeModule = {
    id: COMMENT_ID,
    title: COMMENT_TITLE,
    hint: '点「写入测试注释」后，自己发送这条消息（需要已连接模型）。发送完成后自动判定；楼层里应看不到注释文字。',
    actions: [
      {
        label: '写入测试注释到输入框',
        run: () =>
          guard(COMMENT_ID, COMMENT_TITLE, () => {
            const textarea = getTextarea()
            if (!textarea) throw new Error('找不到输入框')
            const comment = `<!--${MARKER_COMMENT} 探针-->`
            setTextareaValue(textarea, textarea.value ? `${textarea.value}\n${comment}` : `测试 ${comment}`)
            commentArmed = true
            setResult(COMMENT_ID, COMMENT_TITLE, 'waiting', '已写入。请发送这条消息，等 AI 回复结束后自动判定')
          }),
      },
    ],
  }

  const injectModule: ProbeModule = {
    id: INJECT_ID,
    title: INJECT_TITLE,
    hint: '点「注入探针」后发送任意消息。可以和上一项同一次发送完成判定。测完请点「清除注入」。',
    actions: [
      {
        label: '注入探针',
        run: () =>
          guard(INJECT_ID, INJECT_TITLE, () => {
            if (!ctx.setExtensionPrompt) throw new Error('宿主没有 setExtensionPrompt')
            const inChat = ctx.extension_prompt_types?.IN_CHAT ?? FALLBACK_IN_CHAT
            const roleSystem = ctx.extension_prompt_roles?.SYSTEM ?? FALLBACK_ROLE_SYSTEM
            ctx.setExtensionPrompt(INJECT_KEY, `[${MARKER_INJECT}] 这是探针注入文本`, inChat, 0, false, roleSystem)
            injectArmed = true
            setResult(INJECT_ID, INJECT_TITLE, 'waiting', '已注入（IN_CHAT，深度 0）。请发送一条消息', {
              enumsFromContext: !!ctx.extension_prompt_types,
            })
          }),
      },
      {
        label: '清除注入',
        run: () =>
          guard(INJECT_ID, INJECT_TITLE, () => {
            const inChat = ctx.extension_prompt_types?.IN_CHAT ?? FALLBACK_IN_CHAT
            const roleSystem = ctx.extension_prompt_roles?.SYSTEM ?? FALLBACK_ROLE_SYSTEM
            ctx.setExtensionPrompt?.(INJECT_KEY, '', inChat, 0, false, roleSystem)
            injectArmed = false
            setResult(INJECT_ID, INJECT_TITLE, 'idle', '已清除注入')
          }),
      },
    ],
  }

  const inputModule: ProbeModule = {
    id: INPUT_ID,
    title: INPUT_TITLE,
    hint: '自动写入一段文字、读回校验，然后恢复原内容（不会发送）。',
    actions: [
      {
        label: '运行输入框测试',
        run: () =>
          guard(INPUT_ID, INPUT_TITLE, () => {
            const textarea = getTextarea()
            if (!textarea) throw new Error('找不到输入框')
            const original = textarea.value
            const probe = `${original}[TRPG-PROBE-INPUT]`
            setTextareaValue(textarea, probe)
            const readBack = textarea.value
            setTextareaValue(textarea, original)
            const restored = textarea.value === original
            setResult(
              INPUT_ID,
              INPUT_TITLE,
              readBack === probe && restored ? 'pass' : 'fail',
              readBack === probe ? (restored ? '写入、读回、恢复都正常' : '写入正常，但恢复失败') : '写入后读回的内容不一致',
              { readBackMatches: readBack === probe, restored },
            )
          }),
      },
    ],
  }

  return [{ ...commentModule, start }, injectModule, inputModule]
}
