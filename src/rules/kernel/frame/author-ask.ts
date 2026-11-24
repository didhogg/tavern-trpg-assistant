// 作者「导入到人物」的问答桥（P6-R 空白卡建人）：作者程序原样跑，作者要问玩家时只走两个总入口——
//   UtilApplications.pGetImportCompApplicationFormData（一个选择组件画成弹窗，交回组件的表单数据）、
//   InputUiUtil.pGetUser*（是 / 否、选一项、填数字、填文字），外加作者自己画窗口等输入的两个类（起始装备、属性提升）。
// 这里接住这些入口，不画作者窗口：作者问到一题就停在那里（和真窗口等玩家一样），把题目交给主线；玩家答了再按登记的转接件
// 写进作者组件 / 交回作者要的值，作者接着往下跑——不从头重跑（以前每答一题整条导入重跑一遍，题越往后越慢）。
// 开头可以带一串已答的回答（回到前面某题重答时：从头按这些回答快速跑到那一题）。
// 每种提问一个转接件（ASK_KINDS 登记表：读题 = 交编号和原文，写答 = 按作者组件自己的状态写）；没登记的种类交「未登记」题，界面不硬答。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者运行时对象没有类型声明 */
import { plutoniumBuild } from './plutonium-build'
import { ASK_KINDS, FollowUp, NO_AUTO, type AskAnswer, type AskQuestion } from './author-ask-kinds'

export type { AskAnswer, AskQuestion } from './author-ask-kinds'

/** 作者的跳过记号（作者按“玩家点了跳过”处理）。 */
const skipMark = (): unknown => (globalThis as any).VeCt?.SYM_UI_SKIP

const INPUT_FNS = ['pGetUserBoolean', 'pGetUserEnum', 'pGetUserNumber', 'pGetUserString', 'pGetUserGenericButton'] as const
/** 作者自己画窗口等玩家的类（先 render(true) 再 pWaitForUserInput）：问答期间不画，等输入改成问答桥。 */
const APP_CLASSES = ['EquipmentApp', 'ActorAbilityScoreIncrease'] as const

/** 作者流程跑到哪了：停在一道题上 / 跑完（作者的结果）/ 出错。 */
export type AuthorEvent<T> = { question: AskQuestion } | { done: true; value: T } | { error: unknown }

export interface AuthorRun<T> {
  /** 等作者跑到下一题或跑完。 */
  next(): Promise<AuthorEvent<T>>
  /** 回答停着的那题（写进作者组件 / 交回作者要的值），作者接着跑；之后用 next() 等下一步。 */
  answer(a: AskAnswer): Promise<void>
  /** 不答了：停着的题和之后的题都当玩家关掉弹窗（作者自己的取消，正常收尾）。 */
  abort(): void
}

/** 开始跑作者流程：given = 开头已答的回答（按顺序直接交）。期间接管作者的提问入口，跑完 / 出错时还原。 */
export function startAuthorRun<T>(given: AskAnswer[], run: () => Promise<T>): AuthorRun<T> {
  const api = plutoniumBuild
  if (!api?.UtilApplications || !api?.InputUiUtil) throw Error('此版本 Plutonium 缺少提问入口（UtilApplications / InputUiUtil）')
  let nextIndex = 0
  let aborting = false
  let paused: { adapter: (typeof ASK_KINDS)[string]; subject: any; resolve: (v: unknown) => void } | null = null
  const queue: Array<AuthorEvent<T>> = []
  let waiter: ((e: AuthorEvent<T>) => void) | null = null
  const emit = (e: AuthorEvent<T>): void => { if (waiter) { const w = waiter; waiter = null; w(e) } else queue.push(e) }
  const answerOf = async (adapter: (typeof ASK_KINDS)[string], subject: any, a: AskAnswer): Promise<unknown> =>
    a.skip ? (adapter.skip ? adapter.skip() : skipMark()) : adapter.write(subject, a)
  /** 转接件说同一题还有下一层：一层层问下去（每层一题、照常编号），最后一层的结果交给作者。 */
  const follow = async (value: unknown): Promise<unknown> => {
    let v = value
    while (v instanceof FollowUp) v = await ask(v.kind, v.subject)
    return v
  }
  const ask = async (kind: string, subject: any): Promise<unknown> => {
    if (aborting) return null
    const adapter = ASK_KINDS[kind] ?? ASK_KINDS['*']
    if (adapter.auto) { const auto = await adapter.auto(subject); if (auto !== NO_AUTO) return auto }
    const index = nextIndex++
    if (given[index] !== undefined) return follow(await answerOf(adapter, subject, given[index]))
    const question = { index, ...(await adapter.read(subject, kind)) } as AskQuestion
    return new Promise((resolve) => { paused = { adapter, subject, resolve }; emit({ question }) })
  }
  const Apps = api.UtilApplications
  const Input = api.InputUiUtil
  const originalApp = Apps.pGetImportCompApplicationFormData
  const originalInputs = Object.fromEntries(INPUT_FNS.map((fn) => [fn, Input[fn]]))
  Apps.pGetImportCompApplicationFormData = (opts: any) => ask(opts?.comp?.constructor?.name ?? '?', { comp: opts.comp, opts })
  for (const fn of INPUT_FNS) Input[fn] = (opts: any = {}) => ask(`InputUiUtil.${fn}`, { opts })
  const apps = APP_CLASSES.map((name) => ({ name, proto: api[name]?.prototype })).filter((a) => a.proto)
  const originalApps = apps.map(({ proto }) => ({ render: Object.getOwnPropertyDescriptor(proto, 'render'), wait: proto.pWaitForUserInput }))
  for (const { name, proto } of apps) {
    proto.render = async function (this: any) { return this }
    proto.pWaitForUserInput = async function (this: any) {
      // 作者自己的「没有可选的就跳过」（起始装备没有可用方案）
      if ('_cntModesAvailable' in this && !this._cntModesAvailable) return skipMark()
      if (typeof this.pInit === 'function') await this.pInit()
      return ask(name, { comp: this, opts: {} })
    }
  }
  // 本战役看得见哪些书已由【库】定好（小窗读资料时按已装来源过滤，host.ts libraryData），作者这两项设置在导入期间照此改：
  //   isGmForceSelectAllowedSources = 选专长等要先挑数据来源时，主持人直接用全部允许的来源，不弹作者的来源窗口；
  //   isGmUseBlocklist = 关掉作者自己的屏蔽表（经典规则下它会自动屏蔽 2024 各书，连带 2024 背景的起源专长版本取不到）——同 build-extras.ts campaignCandidates
  const Config = api.Config
  const temps: Array<[string, unknown]> = [['isGmForceSelectAllowedSources', true], ['isGmUseBlocklist', false]]
  const previous = temps.map(([name]) => Config?.get?.('dataSources', name))
  for (const [name, value] of temps) Config?.setTemp?.('dataSources', name, value, { isSkipPermissionCheck: true })
  const restore = (): void => {
    temps.forEach(([name], i) => Config?.setTemp?.('dataSources', name, previous[i], { isSkipPermissionCheck: true }))
    Apps.pGetImportCompApplicationFormData = originalApp
    for (const fn of INPUT_FNS) Input[fn] = originalInputs[fn]
    apps.forEach(({ proto }, i) => {
      if (originalApps[i].render) Object.defineProperty(proto, 'render', originalApps[i].render!)
      else delete proto.render
      proto.pWaitForUserInput = originalApps[i].wait
    })
  }
  run().then((value) => { restore(); emit({ done: true, value }) }, (error: unknown) => { restore(); emit({ error }) })
  return {
    next: () => (queue.length ? Promise.resolve(queue.shift()!) : new Promise((resolve) => { waiter = resolve })),
    async answer(a) {
      const p = paused
      if (!p) throw Error('作者现在没有在等回答')
      // 回答写不进去（超出范围等）：作者仍停在这题，可以重答
      const value = await answerOf(p.adapter, p.subject, a)
      paused = null
      // 还有下一层：作者等着，下一层的题照常停下来问（这里不等它，免得和下一次回答互相等）
      p.resolve(value instanceof FollowUp ? follow(value) : value)
    },
    abort() { aborting = true; const p = paused; paused = null; p?.resolve(null) },
  }
}
