import type { Person } from '../../../schemas/people'
import type { MenuItem } from '../../kit/MoreMenu.vue'

/** 人物卡顶栏「⋯」：存库、复制、回收站与给 AI 级别。 */
export function cardMenuItems(person: Person, personId: string | undefined, readOnly: boolean, libraryMode: boolean): MenuItem[] {
  const disabled = libraryMode || !personId || readOnly
  return [
    { key: 'save-lib', label: '存入我的库...', disabled: libraryMode || !personId || readOnly },
    { key: 'copy', label: '复制一个', disabled },
    { key: 'trash', label: '移入回收站', danger: true, disabled },
    { key: 'give:auto', label: `给 AI：自动${person.giveAi === 'auto' ? '（当前）' : ''}`, disabled: libraryMode || readOnly },
    { key: 'give:nameOnly', label: `给 AI：只给名字${person.giveAi === 'nameOnly' ? '（当前）' : ''}`, disabled: libraryMode || readOnly },
    { key: 'give:full', label: `给 AI：完整${person.giveAi === 'full' ? '（当前）' : ''}`, disabled: libraryMode || readOnly },
    { key: 'give:none', label: `给 AI：不提供${person.giveAi === 'none' ? '（当前）' : ''}`, disabled: libraryMode || readOnly },
  ]
}
