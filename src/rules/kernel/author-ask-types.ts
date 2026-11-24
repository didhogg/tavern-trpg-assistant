// 作者「导入到人物」问答桥的题目 / 回答格式（小窗 frame/author-ask*.ts ⇄ 主线 runtime / people / 界面共用）。
// 题目只交编号和出处（FrameText），中文由主线唯一显示出口按编号取；回答只交序号 / 值，转接件按作者组件自己的状态写回。
import type { FrameText } from './shown'

/** 一个可选项：label = 名字；note = 补充说明（例：这一级有哪些特性）；disabled = 作者不让选（已有 / 不满足条件）。 */
export interface AskOption { label: FrameText; note?: FrameText | null; disabled?: boolean }
/** 一组「选 count 项」：title = 这组在问什么（例：技能熟练）。 */
export interface AskGroup { title: FrameText | null; count: number; options: AskOption[] }

/** 题目的样子（界面按 form.type 画）。 */
export type AskForm =
  | { type: 'unknown' }
  | { type: 'boolean'; yes: FrameText | null; no: FrameText | null }
  | { type: 'enum'; options: AskOption[]; selected: number | null }
  | { type: 'number'; min: number | null; max: number | null; value: number | null }
  | { type: 'string'; value: string }
  /** 选到第几级（radio = 选第 n 级自动含前面各级；from = 已有的等级数；
   *  subclass = 加子职业：要把到现在为止的各级都选上（作者按选中的等级补子职业特性，已有的职业特性自动跳过），否则已有的等级不能再选）。 */
  | { type: 'levels'; levels: AskOption[]; radio: boolean; from: number; subclass: boolean }
  /** 几组勾选；sets = 作者给了几套方案时先选一套（每套各自的组），没有 = 只有一套。 */
  | { type: 'choose'; sets: Array<{ label: FrameText | null; groups: AskGroup[] }>; set: number }
  /** 每组从表里选几行或自己写（背景个性特征）：count = 这组要几条；custom = 可以自己写。 */
  | { type: 'texts'; groups: Array<AskGroup & { custom: boolean }> }
  /** 起始装备：每组选一个方案（方案里「任选一件」的空位再选物品）；gold = 可以改拿起始金币（骰式）。 */
  | { type: 'equipment'; groups: Array<{ choices: Array<{ entries: AskEquip[] }> }>; gold: string | null }
  /** 属性提升或专长：points 点加到属性上（单项结果不超过 max），或改选一个专长（从库里选）。 */
  | { type: 'asi'; abilities: Array<{ key: string; label: FrameText; value: number }>; points: number; max: number }

export interface AskQuestion {
  index: number
  kind: string
  title: FrameText | null
  /** 作者的说明文字（有就带）。 */
  note: FrameText | null
  form: AskForm
  skippable: boolean
  /** 摸底用：作者组件状态里有哪些字段（只在未登记种类上给）。 */
  raw?: unknown
}

/**
 * 玩家的回答：skip = 跳过；default = 照作者默认；
 * value = 是否（boolean）/ 选项序号（enum）/ 数字 / 文字 / 选到的等级序号（levels，0 起；多选时是序号数组）；
 * set + picks = choose：选哪一套 + 每组选了哪几项（picks[组序号] = [选项序号…]）。
 */
export interface AskAnswer {
  skip?: true; default?: true; value?: unknown; set?: number; picks?: number[][]
  /** texts：每组自己写的文字（picks 选表里的行，texts 补自己写的）。 */
  texts?: string[][]
  /** equipment：每组选第几个方案；slots[「组.方案.条目.第几个」] = 选的物品 uid；gold = 改拿金币（金币数，此时不要装备）。 */
  choice?: number[]; slots?: Record<string, string>; gold?: number
  /** asi：bonus = 每项加几点；featRef = 改选的专长（库编号，界面给）→ 主线换成作者认得的条目 featEntry 再交小窗。 */
  bonus?: Record<string, number>; featRef?: { set: string; prop: string; hash: string }; featEntry?: unknown
}

/** 起始装备里的一条：一件物品 / 任选一件（candidates）/ 杂项文字 / 钱（铜币）。 */
export interface AskEquip { kind: 'item' | 'category' | 'special' | 'value'; quantity: number; name?: FrameText; text?: FrameText; cp?: number; typeNames?: FrameText[]; candidates?: Array<{ uid: string; name: FrameText }> }
