// 熟练候选沿作者自己的渲染入口取身份；分组代码交本战役作者程序解释。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者选择组件没有类型声明 */
import { authorIdFromHtml } from './author-ids'
import { systemText } from './system-text'
import { named, proficiencyText, valueText, type FrameText } from '../shown'

const g = globalThis as any
function proficiencyName(api: Record<string, any>, manager: any, value: { prop: string; name: string }): FrameText {
  if (g.Renderer.generic.getMappedAnyProficiency({ keyAny: value.name, countRaw: 1 })) return proficiencyText(value.name, 1)
  const html = api.Charactermancer_OtherProficiencySelect._getRenderedStatic({ ...value, availableProficiencyManager: manager })
  const id = typeof html === 'string' ? authorIdFromHtml(html, g.UrlUtil.PAGE_TO_PROPS) : null
  if (id) return named(value.name, id, true)
  return valueText(value.name, [value.name], systemText(value.name))
}

/** 有链接的条目已用完整编号；余下同类配置值作为一组交已有 valueLabels，不能被物品 UID 干扰。 */
export function proficiencyNames(api: Record<string, any>, manager: any, values: Array<{ prop: string; name: string }>): FrameText[] {
  const texts = values.map(value => proficiencyName(api, manager, value))
  return texts.map((text, i) => text.$t === 'value'
    ? { ...text, group: values.filter((value, j) => value.prop === values[i].prop && texts[j].$t === 'value').map(value => value.name) }
    : text)
}
