// 人物页向小窗取数的结果形状（编辑窗口字段、效果条目、特质选项、特殊特质）：只放类型，逻辑在 people.ts。
import type { Displayed, FrameText } from './shown'
import type { FieldNode } from './frame/commands-fields'

/** 特殊特质页：官方 characterFlags 按分组。 */
export interface SpecialTraits { sections: Array<{ label: string; fields: Array<{ key: string; path: string; name: string; hint: string; type: 'boolean' | 'number' | 'string'; choices: Array<{ value: string; label: string }> | null; value: unknown }> }> }
/** 特质勾选页的选项（官方 Trait.choices 摊平，depth = 层级）。 */
export interface TraitChoices { trait: string; path: string; label: string; rows: Array<{ key: string; label: string; depth: number; selectable: boolean }>; bypasses: Array<{ key: string; label: string }>; communication: Array<{ key: string; label: string }> }
/** 编辑窗口信息（小窗原样，FrameText 过出口后成字）。 */
/** 改到某一块的效果（一条效果里的一项改动）：manual = 人物页“添加条目”加的手动效果。 */
export interface FieldEffect { effect: string; itemId: string | null; name: FrameText | null; origin: FrameText | null; active: boolean; disabled: boolean; manual: boolean; key: string; keyLabel: FrameText | null; mode: FrameText | null; modeCode: string; value: string }
export interface FieldInfo { tree: FieldNode | null; effects: FieldEffect[]; attribution: string | null; derived: unknown; modes: Array<{ value: string; label: FrameText }>; durationUnits?: Array<{ value: string; label: FrameText }> }
export type ShownField = Displayed<FieldNode>
export type ShownFieldInfo = Displayed<FieldInfo>
