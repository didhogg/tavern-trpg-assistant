// 选版本（单条 / 整包）写到哪一层：本战役层改战役选书设置（返回新的，调用方写回），规则 / 全局层存进插件管理记录。
// 从 scoped.ts 拆出（P5.5 收尾按单文件 400 行拆开，行为不变）；单条和整包原来各写一遍，合成一处。
import type { ChoiceLevel, ManageStore } from './manage'
import type { CampaignLibrary } from './scopes'

export async function setChoiceAt(manage: ManageStore, c: CampaignLibrary, key: string, altId: string | null, level: 'campaign' | ChoiceLevel): Promise<CampaignLibrary> {
  if (level !== 'campaign') {
    await manage.setChoice(level, key, altId)
    return c
  }
  const choices = { ...c.choices }
  if (altId === null) delete choices[key]
  else choices[key] = altId
  return { ...c, choices }
}
