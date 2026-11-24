// 作者「导入到人物」的问答桥（P6-R 空白卡建人）：作者程序原样跑，作者要问玩家时只走两个总入口——
//   UtilApplications.pGetImportCompApplicationFormData（一个选择组件画成弹窗，交回组件的表单数据）、
//   InputUiUtil.pGetUser*（是 / 否、选一项、填数字、填文字）。
// 这里接住这两个入口，不画作者窗口：第 n 次提问 = answers[n]；有回答就按登记的转接件写进作者组件 / 交回作者要的值，
// 没有回答 = 当作玩家关掉了这个弹窗（作者自己的取消：交回 null，作者按取消正常收尾、不报错），记下这道题；
// 作者收尾后交回 NeedsAnswer(题目)，界面问玩家，玩家答完带着全部回答重跑（和「已掷点数」同一个规矩：同输入同结果）。
// 每种提问一个转接件（ASK_KINDS 登记表：读题 = 交编号和原文，写答 = 按作者组件自己的状态写）；没登记的种类交「未登记」题，界面不硬答。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者运行时对象没有类型声明 */
import { plutoniumBuild } from './plutonium-build'
import { ASK_KINDS, type AskAnswer, type AskQuestion } from './author-ask-kinds'

export type { AskAnswer, AskQuestion } from './author-ask-kinds'

export class NeedsAnswer extends Error {
  constructor(readonly question: AskQuestion) { super('KERNEL_NEEDS_ANSWER') }
}

/** 作者的跳过记号（作者按“玩家点了跳过”处理）。 */
const skipMark = (): unknown => (globalThis as any).VeCt?.SYM_UI_SKIP

const INPUT_FNS = ['pGetUserBoolean', 'pGetUserEnum', 'pGetUserNumber', 'pGetUserString', 'pGetUserGenericButton'] as const
/** 作者自己画窗口等玩家的类（先 render(true) 再 pWaitForUserInput）：问答期间不画，等输入改成问答桥。 */
const APP_CLASSES = ['EquipmentApp', 'ActorAbilityScoreIncrease'] as const

/** 跑 run；期间作者的每次提问按顺序取 answers。交回作者结果 + 这次一共问了哪些题（界面显示“已答”摘要用）。 */
export async function withAuthorAnswers<T>(answers: AskAnswer[], run: () => Promise<T>): Promise<{ value: T; asked: AskQuestion[] }> {
  const api = plutoniumBuild
  if (!api?.UtilApplications || !api?.InputUiUtil) throw Error('此版本 Plutonium 缺少提问入口（UtilApplications / InputUiUtil）')
  const asked: AskQuestion[] = []
  let needs: AskQuestion | null = null
  const answer = async (kind: string, subject: any): Promise<unknown> => {
    if (needs) return null
    const adapter = ASK_KINDS[kind] ?? ASK_KINDS['*']
    const index = asked.length
    const question = { index, ...(await adapter.read(subject, kind)) } as AskQuestion
    asked.push(question)
    const given = answers[index]
    if (given === undefined) { needs = question; return null }
    if (given.skip) return adapter.skip ? adapter.skip() : skipMark()
    return adapter.write(subject, given)
  }
  const Apps = api.UtilApplications
  const Input = api.InputUiUtil
  const originalApp = Apps.pGetImportCompApplicationFormData
  const originalInputs = Object.fromEntries(INPUT_FNS.map((fn) => [fn, Input[fn]]))
  Apps.pGetImportCompApplicationFormData = (opts: any) => answer(opts?.comp?.constructor?.name ?? '?', { comp: opts.comp, opts })
  for (const fn of INPUT_FNS) Input[fn] = (opts: any = {}) => answer(`InputUiUtil.${fn}`, { opts })
  const apps = APP_CLASSES.map((name) => ({ name, proto: api[name]?.prototype })).filter((a) => a.proto)
  const originalApps = apps.map(({ proto }) => ({ render: Object.getOwnPropertyDescriptor(proto, 'render'), wait: proto.pWaitForUserInput }))
  for (const { name, proto } of apps) {
    proto.render = async function (this: any) { return this }
    proto.pWaitForUserInput = async function (this: any) {
      // 作者自己的「没有可选的就跳过」（起始装备没有可用方案）
      if ('_cntModesAvailable' in this && !this._cntModesAvailable) return skipMark()
      if (typeof this.pInit === 'function') await this.pInit()
      return answer(name, { comp: this, opts: {} })
    }
  }
  try {
    const value = await run()
    if (needs) throw new NeedsAnswer(needs)
    return { value, asked }
  } finally {
    Apps.pGetImportCompApplicationFormData = originalApp
    for (const fn of INPUT_FNS) Input[fn] = originalInputs[fn]
    apps.forEach(({ proto }, i) => {
      if (originalApps[i].render) Object.defineProperty(proto, 'render', originalApps[i].render!)
      else delete proto.render
      proto.pWaitForUserInput = originalApps[i].wait
    })
  }
}
