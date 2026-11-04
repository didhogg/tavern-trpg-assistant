import { markRaw } from 'vue'
import type { PersonEffect } from '../../../schemas/people'
import { useModalStore, type ModalPage } from '../../../stores/modal'
import type { ArchiveCardKey, ArchiveGroupKey, ArchiveItem } from './archive'
import type { CardCtx } from './cardCtx'
import { infoOfArchive, type InfoModel } from './info'
import RecropPage from './RecropPage.vue'
import AbilitiesDialog from './dialogs/AbilitiesDialog.vue'
import AddEffectDialog from './dialogs/AddEffectDialog.vue'
import ArchiveDialog from './dialogs/ArchiveDialog.vue'
import EntryPeek from './dialogs/EntryPeek.vue'
import HelpDialog from './dialogs/HelpDialog.vue'
import IdentityDialog from './dialogs/IdentityDialog.vue'
import InfoDialog from './dialogs/InfoDialog.vue'
import ReadoutDialog from './dialogs/ReadoutDialog.vue'
import SkillsDialog from './dialogs/SkillsDialog.vue'
import { removeItem } from './archiveOps'
import { CATEGORY_NOTE } from './info'
import { durationText } from './effectText'

type OpenPage = (page: ModalPage) => void
interface AvatarOps { uploadAvatar: (file: File) => Promise<void>; clearAvatar: () => void }

/** 人物详情的全部弹窗入口（U5R §10）：都是居中弹窗（手机底部整页），没有侧拉。 */
export function useCardDialogs(ctx: CardCtx, openPage: OpenPage, avatar: AvatarOps & { url?: () => string | undefined }) {
  const modal = useModalStore()
  const page = (key: string, title: string, component: unknown, width: number, props: Record<string, unknown>): ModalPage => ({ key: `${key}:${ctx.person.id}`, title, component: markRaw(component as never), variant: 'dialog', width, props })

  function openRecrop(): void {
    const source = ctx.person.avatarSource
    if (!source) return
    modal.push(page('recrop', '重新截取头像', RecropPage, 640, { avatarSource: source, readOnly: ctx.readOnly, onApply: (a: { $asset: string }, next: typeof source) => { ctx.commitDraft({ avatar: a as never, avatarSource: next }, ['avatar', 'avatarSource']); ctx.toast.success('头像已更新') } }))
  }
  function openIdentity(tab?: string): void {
    const wide = tab === 'race' || tab === 'class' || tab === 'background' || tab === 'levels'
    openPage(page('identity', '身份', IdentityDialog, wide ? 980 : 760, { ctx, tab, avatarUrl: avatar.url, onUpload: (f: File) => void avatar.uploadAvatar(f), onRecrop: openRecrop, onClear: () => avatar.clearAvatar() }))
  }
  async function peek(id: string | undefined, title: string, actions: Array<{ label: string; run: () => void }>): Promise<void> {
    if (!id) return
    openPage(page(`entry-${id}`, title, EntryPeek, 520, { entryId: id, actions }))
  }
  function openClass(id: string): void { void peek(id, ctx.data.nameOf(id), [{ label: '更换职业', run: () => openIdentity('class') }, { label: '等级管理', run: () => openIdentity('levels') }]) }
  function openRaceOrBackground(kind: 'race' | 'background'): void {
    const b = ctx.person.block
    const id = kind === 'race' ? b.subrace ?? b.race : b.background
    void peek(id, ctx.data.nameOf(id), [{ label: kind === 'race' ? '更换种族' : '更换背景', run: () => openIdentity(kind) }])
  }
  const openReadout = (tab: 'defense' | 'speed' | 'passive'): void => openPage(page('readout', '读数', ReadoutDialog, 720, { ctx, tab }))
  const openAbilities = (): void => openPage(page('abilities', '属性', AbilitiesDialog, 760, { ctx }))
  const openSkills = (): void => openPage(page('skills', '技能', SkillsDialog, 720, { ctx }))
  const openArchive = (card: ArchiveCardKey, tab?: ArchiveGroupKey): void => openPage(page(`archive-${card}`, { defense: '防御', senses: '感官', proficiency: '熟练' }[card], ArchiveDialog, 640, { ctx, card, tab }))
  function openArchiveItem(item: ArchiveItem): void {
    const key = item.id.slice(item.group.length + 1)
    openPage(page(`info-${item.id}`, item.label, InfoDialog, 520, { model: infoOfArchive(item, item.source !== '模板' && !ctx.readOnly), onRemove: () => ctx.commitBlock(removeItem(ctx.person.block, item.group, key)) }))
  }
  const openAddEffect = (): void => openPage(page('add-effect', '添加状态与效果', AddEffectDialog, 940, { ctx }))
  function openEffectInfo(effect: PersonEffect): void {
    const rows: InfoModel['rows'] = [{ label: '类别', value: ({ condition: '状态', status: '状态', disease: '疾病', spell: '法术效果', other: '其他' })[effect.category] }]
    const d = durationText(effect.duration); if (d) rows.push({ label: '时长', value: `${d}${effect.concentration ? ' · 专注' : ''}` })
    rows.push({ label: '加入时间', value: new Date(effect.addedAt || Date.now()).toLocaleString('zh-CN', { hour12: false }) })
    const model: InfoModel = { title: effect.name, titleEn: effect.nameEn, rows, ref: effect.ref, body: [effect.note || CATEGORY_NOTE.condition], removable: true }
    openPage(page(`effect-${effect.id}`, effect.name, InfoDialog, 520, { model, onRemove: () => ctx.commitLive({ effects: ctx.person.effects.filter((e) => e.id !== effect.id) }) }))
  }
  const openHelp = (blank: boolean): void => openPage(page('help', '这页怎么用', HelpDialog, 520, { blank }))
  return { openIdentity, openClass, openRaceOrBackground, openReadout, openAbilities, openSkills, openArchive, openArchiveItem, openAddEffect, openEffectInfo, openHelp }
}
