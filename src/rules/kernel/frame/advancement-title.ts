// 成长（advancement）的显示标题，建卡步骤和人物逐级细节共用这一处（不各写一套）：
//   Trait 按类别编号取 dnd5e 语言包的名字；数据里写了标题的是条目原文（主线按同编号条目同位置换），
//   取不到再按原文生成的语言键（tools/build-kernel-lang：作者译名表 + 驾驶员批准的译文）；
//   没写的由 dnd5e 用语言包里的默认标题补上（Advancement.prepareData：name ||= _defaultTitle），已是本战役语言。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { fromEntry, type FrameText } from '../shown'
import { generatedText, systemText } from './system-text'
import { traitTitle } from './trait-title'

export function advancementTitle(advancement: any): FrameText | null {
  const type = advancement?.constructor?.typeName ?? advancement?.type
  const own = type === 'Trait' ? traitTitle(advancement) : null
  const written = advancement?._source?.name || advancement?._source?.title
  const shownName = advancement?.name ?? advancement?.title
  return own ? systemText(own) : written ? fromEntry(String(written), generatedText(String(written))) : shownName ? systemText(String(shownName)) : null
}
