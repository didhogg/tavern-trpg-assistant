<script setup lang="ts">
// 人物详情页头（线框 p6-6，照 Tidy5e 角色表；P6-R）。两行：
//   上：头像 | 三个单元框（驾驶员 11-25：名字 / 职业与出身 / 特征，各自右上 ✎，点框 = 打开这个单元的编辑弹窗；框里的下划线术语点了看资料）
//       + 短休 长休 | 等级卡 ✎
//   下：生命卡 ✎ | 战斗卡（AC 先攻 专注）✎ | 属性卡 ✎（按页面宽度：三块并排 / 属性单独一排 / 竖排）。
// 每张卡右上角 ✎ 固定，打开这一块的来源条目抽屉（通用编辑窗口，字段按官方定义生成）；数都取读数，界面不算数。
import { computed, markRaw } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import { useRosterStore } from '../../stores/roster'
import Icon from '../kit/Icon.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import HpBlock from './HpBlock.vue'
import VitalDrawers from './VitalDrawers.vue'
import PortraitButton from './avatar/PortraitButton.vue'
import { openFields } from './edit-open'
import { openName, openOrigins } from './unit-open'
import { classBuilds } from './view-tabs'
import { alignment, background, creatureType, crText, deathShown, exhaustionPips, isNpc, legendary, named, senses, showExperience, signed, size, species, speeds } from './view'
import NumIn from './table/NumIn.vue'

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
const abilityNames = computed(() => Object.fromEntries(Object.keys(g.value?.tables.abilities ?? {}).map((k) => [k, named(g.value, 'abilities', k)])))

/** 职业与出身框：职业（等级）、施法 DC、种族、背景；名字和库条目都取人物页统一取好的。 */
const cls = computed(() => classBuilds(s.value))
const sp = computed(() => species(s.value))
const bg = computed(() => background(s.value))
const spellDc = computed(() => {
  const spell = sys.value.attributes.spell
  return sys.value.attributes.spellcasting && spell?.dc ? `${named(g.value, 'abilities', sys.value.attributes.spellcasting)} DC ${spell.dc}` : ''
})
/** 特征框：体型、生物类型、速度、感官、阵营（只显示；编辑在特征单元）。 */
const traitLine = computed(() => [size(s.value, g.value), creatureType(s.value, g.value)].filter(Boolean))
const speedParts = computed(() => speeds(s.value).filter((x) => x.value).map((x) => `${x.label} ${x.value} 尺`))
const senseParts = computed(() => senses(s.value).filter((x) => x.value !== null && x.value !== undefined && x.value !== '')
  .map((x) => `${x.label} ${x.value}${typeof x.value === 'number' && x.key !== 'passivePerception' ? ' 尺' : ''}`))
const align = computed(() => alignment(s.value))
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
const toggleInspiration = () => person.edit(sys.value.attributes.inspiration ? '取消灵感' : '获得灵感', [{ kind: 'set', path: 'system.attributes.inspiration', value: !sys.value.attributes.inspiration }])
const togglePin = () => person.row && roster.pin([person.row.id], !pinned.value)
// 力竭（Tidy5e ActorExhaustionBar：逐级点）与死亡豁免（DeathSavesOverlay：逐格点）直接在页头改
const exPips = computed(() => exhaustionPips(s.value))
const exMax = computed(() => exPips.value.length || 6)
const setExhaustion = (n: number): void => { const cur = Number(sys.value.attributes.exhaustion ?? 0); const v = cur === n ? n - 1 : n; void person.edit(`力竭设为 ${v} 级`, [{ kind: 'set', path: 'system.attributes.exhaustion', value: Math.max(0, v) }]) }
const setDeath = (which: 'success' | 'failure', n: number): void => { const cur = Number(death.value[which] ?? 0); const v = cur === n ? n - 1 : n; void person.edit(`死亡豁免${which === 'success' ? '成功' : '失败'}设为 ${v}`, [{ kind: 'set', path: `system.attributes.death.${which}`, value: v }]) }
const setScore = (k: string, v: number): void => { void person.edit(`${named(g.value, 'abilities', k)}设为 ${v}`, [{ kind: 'set', path: `system.abilities.${k}.value`, value: v }]) }

const editHp = () => openFields('最大生命', { path: 'system.attributes.hp' }, { hint: '当前生命、临时生命在卡上点数字直接改；这里管最大生命怎么来的。', total: { label: '最大生命', value: String(sys.value.attributes.hp?.max ?? '') }, addKey: 'system.attributes.hp.bonuses.overall' })
const editAc = () => openFields('护甲等级', { path: 'system.attributes.ac' }, { total: { label: 'AC', value: String(sys.value.attributes.ac?.value ?? '') }, addKey: 'system.attributes.ac.bonus' })
const editInit = () => openFields('先攻', { path: 'system.attributes.init' }, { total: { label: '先攻', value: signed(sys.value.attributes.init?.total) }, addKey: 'system.attributes.init.bonus' })
const editConc = () => openFields('专注', { path: 'system.attributes.concentration' }, { total: { label: '专注豁免', value: signed(sys.value.attributes.concentration?.save) }, addKey: 'system.attributes.concentration.bonuses.save' })
const editAbility = (k: string) => openFields(named(g.value, 'abilities', k), { path: `system.abilities.${k}` }, { total: { label: named(g.value, 'abilities', k), value: String(sys.value.abilities[k]?.value ?? '') }, addKey: `system.abilities.${k}.value` })
const editAbilities = () => openFields('属性值', { path: 'system.abilities' }, { hint: '每个属性的底值、豁免熟练与加值；种族、专长、物品带来的加成在「效果」里。', names: abilityNames.value, width: 620 })
const editLevel = () => (npc.value
  ? openFields('挑战等级与经验', { path: 'system.details.cr' })
  : openFields('经验', { path: 'system.details.xp' }, { total: { label: '等级', value: String(sys.value.details.level ?? '') } }))
</script>

<template>
  <section class="ps-head" data-testid="ps-head">
   <div class="ps-top">
    <PortraitButton />

    <div class="ps-ident">
      <div class="ps-name-row">
        <div class="ps-card ps-unit ps-unit--name" data-testid="ps-unit-name" @click="!ro && openName()">
          <button class="ps-pen" type="button" aria-label="改名字" :disabled="ro" data-testid="ps-name-edit" @click.stop="openName()"><Icon name="pencil-simple" :size="14" /></button>
          <h2 class="ps-name" data-testid="ps-name">{{ s.name }}</h2>
          <small v-if="english" class="ps-english" data-testid="ps-english">{{ english }}</small>
          <button class="ps-pin" type="button" :aria-pressed="pinned" :aria-label="pinned ? '取消置顶' : '置顶'" :disabled="ro" @click.stop="togglePin"><Icon :name="pinned ? 'star-fill' : 'star'" :size="16" /></button>
        </div>
        <span class="ps-rests">
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-short-rest" @click="person.rest('short')"><Icon name="hourglass" :size="13" />短休</button>
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-long-rest" @click="person.rest('long')"><Icon name="moon" :size="13" />长休</button>
        </span>
      </div>
      <div class="ps-units">
        <div v-if="!npc" class="ps-card ps-unit" data-testid="ps-unit-origins" @click="!ro && openOrigins()">
          <button class="ps-pen" type="button" aria-label="改职业与出身" :disabled="ro" data-testid="ps-origins-edit" @click.stop="openOrigins()"><Icon name="pencil-simple" :size="14" /></button>
          <small class="ps-card-label">职业与出身</small>
          <template v-if="cls.length || sp || bg">
            <p v-if="cls.length" class="ps-unit-line" data-testid="ps-unit-classes">
              <span v-for="c in cls" :key="c.id" class="ps-unit-item"><Term v-if="c.ref" :label="`查看${c.name}`" @open="openEntry(c.ref as never, c.name)">{{ c.name }}</Term><b v-else>{{ c.name }}</b><span class="ps-unit-num">{{ c.levels }}</span></span>
              <span v-if="spellDc" class="ps-unit-item ps-unit-quiet">{{ spellDc }}</span>
            </p>
            <p v-if="sp || bg" class="ps-unit-line" data-testid="ps-unit-origin">
              <span v-if="sp" class="ps-unit-item"><Term v-if="sp.ref" :label="`查看${sp.name}`" @open="openEntry(sp.ref as never, sp.name)">{{ sp.name }}</Term><span v-else>{{ sp.name }}</span></span>
              <span v-if="bg" class="ps-unit-item"><Term v-if="bg.ref" :label="`查看${bg.name}`" @open="openEntry(bg.ref as never, bg.name)">{{ bg.name }}</Term><span v-else>{{ bg.name }}</span></span>
            </p>
          </template>
          <p v-else class="ps-unit-empty" data-testid="ps-unit-origins-empty">还没有职业、种族、背景</p>
        </div>
        <div class="ps-card ps-unit" data-testid="ps-unit-traits">
          <small class="ps-card-label">特征</small>
          <p v-if="traitLine.length" class="ps-unit-line"><span v-for="t in traitLine" :key="t" class="ps-unit-item">{{ t }}</span></p>
          <p v-if="speedParts.length" class="ps-unit-line"><span v-for="t in speedParts" :key="t" class="ps-unit-item">{{ t }}</span></p>
          <p v-if="senseParts.length" class="ps-unit-line"><span v-for="t in senseParts" :key="t" class="ps-unit-item">{{ t }}</span></p>
          <p v-if="align" class="ps-unit-line"><span class="ps-unit-item">{{ align }}</span></p>
        </div>
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
      <div v-if="!npc" class="ps-level-foot"><button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-level-manage" @click="openOrigins()">等级管理</button></div>
    </div>
</div>

   <div class="ps-mid">
<div class="ps-card ps-vitals">
      <button class="ps-pen" type="button" aria-label="改最大生命" :disabled="ro" data-testid="ps-hp-edit" @click="editHp"><Icon name="pencil-simple" :size="14" /></button>
      <small class="ps-card-label">生命值</small>
      <HpBlock />
      <div class="ps-vital-rows">
        <button v-if="hd && hd.max" class="ps-vital-row" type="button" data-testid="ps-hd" @click="openVital('hitDice')"><span>生命骰</span><b>{{ hd.value }}/{{ hd.max }}</b></button>
        <div class="ps-vital-row ps-vital-row--pips" data-testid="ps-exh">
          <button class="ps-vital-name" type="button" title="力竭每一级的效果" @click="openVital('exhaustion')">力竭</button>
          <span class="ps-pips" role="group" aria-label="力竭等级"><button v-for="n in exMax" :key="n" type="button" class="ps-pip ps-pip--sq" :data-on="n <= Number(sys.attributes.exhaustion ?? 0) || undefined" :aria-label="`力竭 ${n} 级`" :disabled="ro" @click="setExhaustion(n)" /></span>
          <b>{{ sys.attributes.exhaustion ?? 0 }}</b>
        </div>
        <div v-if="deathShown(s)" class="ps-vital-row ps-vital-row--pips" :data-alert="zero || undefined" data-testid="ps-death">
          <button class="ps-vital-name" type="button" title="死亡豁免（重置等）" @click="openVital('death')">死亡豁免</button>
          <span v-for="which in (['success', 'failure'] as const)" :key="which" class="ps-pips" role="group" :aria-label="which === 'success' ? '死亡豁免成功' : '死亡豁免失败'">
            <small>{{ which === 'success' ? '成' : '败' }}</small>
            <button v-for="n in 3" :key="n" type="button" class="ps-pip" :data-kind="which" :data-on="n <= Number(death[which] ?? 0) || undefined" :aria-label="`${which === 'success' ? '成功' : '失败'} ${n}`" :disabled="ro" @click="setDeath(which, n)" />
          </span>
        </div>
      </div>
    </div>

      <div class="ps-card ps-combat" data-testid="ps-combat">
        <button class="ps-pen" type="button" aria-label="改护甲等级" :disabled="ro" @click="editAc"><Icon name="pencil-simple" :size="14" /></button>
        <button class="ps-box" type="button" data-testid="ps-ac" @click="editAc"><small>AC</small><b>{{ sys.attributes.ac?.value }}</b></button>
        <button class="ps-box" type="button" data-testid="ps-init" @click="editInit"><small>先攻</small><b>{{ signed(sys.attributes.init?.total) }}</b></button>
        <button v-if="sys.attributes.spellcasting" class="ps-box" type="button" data-testid="ps-conc" @click="editConc"><small>专注</small><b>{{ signed(sys.attributes.concentration?.save) }}</b></button>
      </div>
      <div class="ps-card ps-abilities" data-testid="ps-abilities">
        <button class="ps-pen" type="button" aria-label="改属性值" :disabled="ro" data-testid="ps-abilities-edit" @click="editAbilities"><Icon name="pencil-simple" :size="14" /></button>
        <div v-for="a in abilities" :key="a.key" class="ps-ability" :data-testid="`ps-ability-${a.key}`">
          <button class="ps-ability-cfg" type="button" :title="`${a.label}设置（加值、豁免熟练）`" @click="editAbility(a.key)"><small>{{ a.label }}</small><b>{{ signed(a.mod) }}</b></button>
          <NumIn class="ps-ability-score" :value="Number(a.value ?? 0)" :max="99" :label="`${a.label}属性值`" :disabled="ro" @set="(v) => setScore(a.key, v)" />
          <em :data-prof="a.proficient || undefined" :title="a.proficient ? '豁免熟练' : undefined">豁免 {{ signed(a.save) }}</em>
        </div>
      </div>
   </div>
  </section>
</template>
