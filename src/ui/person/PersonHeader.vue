<script setup lang="ts">
// 人物详情页头（线框 p6-6，照 Tidy5e 角色表；P6-R）：头像 · 身份（名字 ★ 英文名 ✎ / 职业种族阵营 / 短休 长休）· 等级卡 ✎
//   · 事实表（种族 背景 体型 类型 速度 感官 法术）· 生命卡 ✎ · 战斗卡（AC 先攻 专注）✎ · 属性卡 ✎。
// 每张卡右上角 ✎ 固定，打开这一块的来源条目抽屉（通用编辑窗口，字段按官方定义生成）；数都取读数，界面不算数。
import { computed, markRaw, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import { useRosterStore } from '../../stores/roster'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import HpBlock from './HpBlock.vue'
import VitalDrawers from './VitalDrawers.vue'
import IdentityDrawer from './IdentityDrawer.vue'
import AvatarDrawer from './AvatarDrawer.vue'
import { openFields, openLevel } from './edit-open'
import { alignment, background, classes, creatureType, crText, deathShown, isNpc, legendary, named, senses, showExperience, signed, size, species, speeds } from './view'

const person = usePersonStore()
const modal = useModalStore()
const roster = useRosterStore()
const s = computed(() => person.sheet!)
const g = computed(() => person.glossary)
const sys = computed(() => s.value.system)
const npc = computed(() => isNpc(s.value))
const ro = computed(() => person.readOnly)
const english = computed(() => String(person.row?.adjustments.englishName ?? ''))
const pinned = computed(() => !!person.row?.adjustments.pinned)
const broken = ref(false)
const avatar = computed(() => !broken.value && /^(https?:|data:|blob:)/.test(String(s.value.img ?? '')) ? String(s.value.img) : null)
const abilityNames = computed(() => Object.fromEntries(Object.keys(g.value?.tables.abilities ?? {}).map((k) => [k, named(g.value, 'abilities', k)])))

const subtitle = computed(() => {
  const cls = classes(s.value).map((c) => (c.levels ? `${c.name} ${c.levels}` : c.name))
  return [...cls, npc.value ? creatureType(s.value, g.value) : species(s.value)?.name, npc.value ? size(s.value, g.value) : null, alignment(s.value)].filter(Boolean) as string[]
})
interface Fact { label: string; text: string; ref?: unknown; parts?: string[]; edit?: () => void }
const facts = computed(() => {
  const out: Fact[] = []
  const sp = species(s.value)
  const bg = background(s.value)
  if (!npc.value) out.push({ label: '种族', text: sp?.name ?? '—', ref: sp?.ref })
  if (!npc.value) out.push({ label: '背景', text: bg?.name ?? '—', ref: bg?.ref })
  out.push({ label: '体型', text: size(s.value, g.value) || '—', edit: () => openFields('体型', { path: 'system.traits.size' }) })
  out.push({ label: '类型', text: creatureType(s.value, g.value) || '—', edit: () => openFields('生物类型', { path: 'system.details.type' }) })
  const sv = speeds(s.value).filter((x) => x.value)
  const speedParts = sv.map((x) => `${x.label} ${x.value} 尺`)
  out.push({ label: '速度', text: speedParts.join('　') || '—', parts: speedParts, edit: () => openFields('速度', { path: 'system.attributes.movement' }) })
  const se = senses(s.value).filter((x) => x.value !== null && x.value !== undefined && x.value !== '')
  const senseParts = se.map((x) => `${x.label} ${x.value}${typeof x.value === 'number' && x.key !== 'passivePerception' ? ' 尺' : ''}`)
  out.push({ label: '感官', text: senseParts.join('　') || '—', parts: senseParts, edit: () => openFields('感官', { path: 'system.attributes.senses' }) })
  const spell = sys.value.attributes.spell
  // 法术：会施法（官方读数里有施法属性）才显示
  if (sys.value.attributes.spellcasting) out.push({ label: '法术', text: spell?.dc ? `${named(g.value, 'abilities', sys.value.attributes.spellcasting)} DC ${spell.dc}` : '—', edit: () => openFields('施法', { path: 'system.attributes.spellcasting' }) })
  return out
})
const abilities = computed(() => Object.keys(g.value?.tables.abilities ?? {}).filter((k) => sys.value.abilities?.[k]).map((k) => {
  const a = sys.value.abilities[k]
  return { key: k, label: named(g.value, 'abilities', k), mod: a.mod, value: a.value, save: a.save?.value ?? a.save, proficient: !!a.proficient }
}))
const hd = computed(() => sys.value.attributes.hd ?? null)
const death = computed(() => sys.value.attributes.death ?? { success: 0, failure: 0 })
// 0 血提醒只在设过最大生命时（空白人物最大生命还是 0，不算倒地）
const zero = computed(() => Number(sys.value.attributes.hp?.max) > 0 && Number(sys.value.attributes.hp?.value) === 0)
const leg = computed(() => legendary(s.value))
const xp = computed(() => sys.value.details?.xp ?? null)

const VITAL_TITLES = { hitDice: '生命骰', exhaustion: '力竭', death: '死亡豁免' } as const
const openVital = (kind: keyof typeof VITAL_TITLES): void => modal.open({ key: `person-${kind}`, title: VITAL_TITLES[kind], component: markRaw(VitalDrawers), props: { kind }, variant: 'dialog', width: 480, height: 420 })
const openIdentity = () => modal.open({ key: 'person-identity', title: '身份', component: markRaw(IdentityDrawer), variant: 'dialog', width: 560, height: 620 })
const openAvatar = () => modal.open({ key: 'person-avatar', title: '人物头像', component: markRaw(AvatarDrawer), variant: 'dialog', width: 560, height: 420 })
const toggleInspiration = () => person.edit(sys.value.attributes.inspiration ? '取消灵感' : '获得灵感', [{ kind: 'set', path: 'system.attributes.inspiration', value: !sys.value.attributes.inspiration }])
const togglePin = () => person.row && roster.pin([person.row.id], !pinned.value)

const editHp = () => openFields('最大生命', { path: 'system.attributes.hp' }, { hint: '当前生命、临时生命在卡上点数字直接改；这里管最大生命怎么来的。', total: { label: '最大生命', value: String(sys.value.attributes.hp?.max ?? '') }, addKey: 'system.attributes.hp.bonuses.overall' })
const editAc = () => openFields('护甲等级', { path: 'system.attributes.ac' }, { total: { label: 'AC', value: String(sys.value.attributes.ac?.value ?? '') }, addKey: 'system.attributes.ac.bonus' })
const editInit = () => openFields('先攻', { path: 'system.attributes.init' }, { total: { label: '先攻', value: signed(sys.value.attributes.init?.total) }, addKey: 'system.attributes.init.bonus' })
const editConc = () => openFields('专注', { path: 'system.attributes.concentration' }, { total: { label: '专注豁免', value: signed(sys.value.attributes.concentration?.save) }, addKey: 'system.attributes.concentration.bonuses.save' })
const editAbility = (k: string) => openFields(named(g.value, 'abilities', k), { path: `system.abilities.${k}` }, { total: { label: named(g.value, 'abilities', k), value: String(sys.value.abilities[k]?.value ?? '') }, addKey: `system.abilities.${k}.value` })
const editAbilities = () => openFields('属性值', { path: 'system.abilities' }, { hint: '每个属性的底值、豁免熟练与加值；种族、专长、物品带来的加成在「效果」里。', names: abilityNames.value, width: 620 })
const editLevel = () => (npc.value
  ? openFields('挑战等级与经验', { path: 'system.details.cr' })
  : openFields('经验', { path: 'system.details.xp' }, { total: { label: '等级', value: String(sys.value.details.level ?? '') } }))
// 等级管理：作者建卡器（升级、兼职、带选择的成长，职业特性一起加）在最上面；下面是每个职业的快速升 / 降一级（官方成长，自动选第一项）
const levelItems = computed(() => [
  { key: 'native', label: classes(s.value).length ? '用建卡器升级 / 兼职…' : '用建卡器建这个人…', disabled: ro.value },
  ...classes(s.value).flatMap((c) => [
    { key: `up:${c.id}`, label: `${c.name} 快速升一级`, disabled: ro.value },
    { key: `down:${c.id}`, label: `${c.name} 降一级`, disabled: ro.value || (c.levels ?? 0) <= 1 },
  ]),
])
function onLevel(key: string): void {
  if (key === 'native') { openLevel(classes(s.value).length ? '用建卡器升级 / 兼职' : '用建卡器建这个人'); return }
  const [dir, id] = key.split(':')
  const c = classes(s.value).find((x) => x.id === id)
  if (c) void person.level(`${c.name}${dir === 'up' ? '升' : '降'}一级`, id, dir === 'up' ? 1 : -1)
}
</script>

<template>
  <section class="ps-head" data-testid="ps-head">
    <button class="ps-portrait" type="button" :disabled="ro" aria-label="换头像" data-testid="ps-portrait" @click="openAvatar">
      <img v-if="avatar" :src="avatar" alt="" @error="broken = true"><Icon v-else name="user" :size="44" />
      <span class="ps-portrait-badge" aria-hidden="true"><Icon name="image" :size="12" /></span>
    </button>

    <div class="ps-ident">
      <div class="ps-name-line">
        <h2 class="ps-name" data-testid="ps-name">{{ s.name }}</h2>
        <button class="ps-pin" type="button" :aria-pressed="pinned" :aria-label="pinned ? '取消置顶' : '置顶'" :disabled="ro" @click="togglePin"><Icon :name="pinned ? 'star-fill' : 'star'" :size="16" /></button>
        <small v-if="english" class="ps-english">{{ english }}</small>
        <button class="ps-pen ps-pen--inline" type="button" aria-label="改身份" :disabled="ro" data-testid="ps-ident-edit" @click="openIdentity"><Icon name="pencil-simple" :size="14" /></button>
      </div>
      <p class="ps-sub" data-testid="ps-sub"><span v-for="(t, i) in subtitle" :key="t" :class="{ 'ps-sub-strong': i === 0 }">{{ t }}</span></p>
      <button v-if="!npc && !classes(s).length" class="ps-blank-cta" type="button" :disabled="ro" data-testid="ps-blank-build" @click="openLevel('用建卡器建这个人')">
        <b>这个人还是空白的</b><span>用建卡器建：种族、背景、职业、属性一起选，特性都会加上</span>
      </button>
      <div class="ps-rests">
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-short-rest" @click="person.rest('short')">短休</button>
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-long-rest" @click="person.rest('long')">长休</button>
      </div>
    </div>

    <div class="ps-card ps-level" data-testid="ps-level">
      <button class="ps-pen" type="button" :aria-label="npc ? '改挑战等级' : '改经验'" :disabled="ro" @click="editLevel"><Icon name="pencil-simple" :size="14" /></button>
      <div class="ps-level-nums">
        <template v-if="npc">
          <div><small>挑战等级</small><b>{{ crText(sys.details.cr) }}</b></div>
          <div><small>熟练加值</small><b>{{ signed(sys.attributes.prof) }}</b></div>
          <div v-if="xp?.value"><small>经验</small><b class="ps-num-md">{{ Number(xp.value).toLocaleString('zh-CN') }}</b></div>
        </template>
        <template v-else>
          <div><small>等级</small><b>{{ sys.details.level }}</b></div>
          <div><small>熟练加值</small><b>{{ signed(sys.attributes.prof) }}</b></div>
          <button class="ps-insp" type="button" :aria-pressed="!!sys.attributes.inspiration" :disabled="ro" data-testid="ps-insp" @click="toggleInspiration"><Icon :name="sys.attributes.inspiration ? 'star-fill' : 'star'" :size="14" />灵感</button>
        </template>
      </div>
      <div v-if="!npc && showExperience(s) && xp" class="ps-xp">
        <small>经验 <b>{{ Number(xp.value).toLocaleString('zh-CN') }}</b> / {{ Number(xp.max).toLocaleString('zh-CN') }}</small>
        <span class="ps-meter" aria-hidden="true"><i :style="{ width: `${xp.pct ?? 0}%` }" /></span>
      </div>
      <div v-if="leg.act.length || leg.res.length" class="ps-leg">
        <span v-if="leg.act.length"><small>传奇动作</small><i v-for="p in leg.act" :key="p.n" class="ps-dot" :data-on="p.filled || undefined" :title="p.label" /></span>
        <span v-if="leg.res.length"><small>传奇抗性</small><i v-for="p in leg.res" :key="p.n" class="ps-dot" :data-on="p.filled || undefined" :title="p.label" /></span>
      </div>
      <div v-if="!npc" class="ps-level-foot"><MoreMenu label="等级管理" text="等级管理" :items="levelItems" @select="onLevel" /></div>
    </div>

    <dl class="ps-facts" data-testid="ps-facts">
      <div v-for="f in facts" :key="f.label" class="ps-fact">
        <dt>{{ f.label }}</dt>
        <dd>
          <Term v-if="f.ref" :label="`查看${f.text}`" @open="openEntry(f.ref as never, f.text)">{{ f.text }}</Term>
          <button v-else-if="f.edit" class="ps-fact-btn" type="button" :disabled="ro" @click="f.edit()">
            <template v-if="f.parts?.length"><span v-for="(p, i) in f.parts" :key="i" class="ps-fact-part">{{ p }}</span></template>
            <template v-else>{{ f.text }}</template>
          </button>
          <template v-else>{{ f.text }}</template>
        </dd>
      </div>
    </dl>

    <div class="ps-card ps-vitals">
      <button class="ps-pen" type="button" aria-label="改最大生命" :disabled="ro" data-testid="ps-hp-edit" @click="editHp"><Icon name="pencil-simple" :size="14" /></button>
      <small class="ps-card-label">生命值</small>
      <HpBlock />
      <div class="ps-vital-rows">
        <button v-if="hd && hd.max" class="ps-vital-row" type="button" data-testid="ps-hd" @click="openVital('hitDice')"><span>生命骰</span><b>{{ hd.value }}/{{ hd.max }}</b></button>
        <button class="ps-vital-row" type="button" data-testid="ps-exh" @click="openVital('exhaustion')"><span>力竭</span><b>{{ sys.attributes.exhaustion ?? 0 }} 级</b></button>
        <button v-if="deathShown(s)" class="ps-vital-row" :data-alert="zero || undefined" type="button" data-testid="ps-death" @click="openVital('death')">
          <span>死亡豁免</span><b><template v-if="zero || death.success || death.failure"><span class="ps-death-count">成功 {{ death.success ?? 0 }}，失败 {{ death.failure ?? 0 }}</span></template><template v-else>—</template></b>
        </button>
      </div>
    </div>

    <div class="ps-stats">
      <div class="ps-card ps-combat" data-testid="ps-combat">
        <button class="ps-pen" type="button" aria-label="改护甲等级" :disabled="ro" @click="editAc"><Icon name="pencil-simple" :size="14" /></button>
        <button class="ps-box" type="button" data-testid="ps-ac" @click="editAc"><small>AC</small><b>{{ sys.attributes.ac?.value }}</b></button>
        <button class="ps-box" type="button" data-testid="ps-init" @click="editInit"><small>先攻</small><b>{{ signed(sys.attributes.init?.total) }}</b></button>
        <button v-if="sys.attributes.spellcasting" class="ps-box" type="button" data-testid="ps-conc" @click="editConc"><small>专注</small><b>{{ signed(sys.attributes.concentration?.save) }}</b></button>
      </div>
      <div class="ps-card ps-abilities" data-testid="ps-abilities">
        <button class="ps-pen" type="button" aria-label="改属性值" :disabled="ro" data-testid="ps-abilities-edit" @click="editAbilities"><Icon name="pencil-simple" :size="14" /></button>
        <button v-for="a in abilities" :key="a.key" class="ps-ability" type="button" :data-testid="`ps-ability-${a.key}`" @click="editAbility(a.key)">
          <small>{{ a.label }}</small><b>{{ signed(a.mod) }}</b><span>{{ a.value }}</span>
          <em :data-prof="a.proficient || undefined">{{ a.proficient ? '● ' : '' }}豁免 {{ signed(a.save) }}</em>
        </button>
      </div>
    </div>
  </section>
</template>
