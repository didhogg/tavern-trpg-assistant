// 「它要你做的选择」的组件登记表：后端每一步给 options.kind，界面按它挑组件（开发规范 §0 第 13 条：一种规则类型一个组件，经注册表拼装）。
// 加一种选择 = 后端多一种 kind + 这里加一行；没登记的 kind 由 WizardChoices 显示「这一步建卡里还选不了」，不静默丢。
import type { Component } from 'vue'
import ChoicePick from './ChoicePick.vue'
import ChoicePoints from './ChoicePoints.vue'

export const CHOICE_COMPONENTS: Record<string, Component> = {
  trait: ChoicePick,
  asi: ChoicePoints,
}
