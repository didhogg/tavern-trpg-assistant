<script setup lang="ts">
// 人物详情页头（线框 p6-6，照 Tidy5e 角色表；P6-R）。两行：
//   上：头像 | 身份（名字 ★ 英文名 ✎ / 职业等级 阵营 / 事实行：种族 背景 体型 类型 速度 感官 法术 / 短休 长休）| 等级卡 ✎
//   下：生命卡 ✎ | 战斗卡（AC 先攻 专注）✎ | 属性卡 ✎（按页面宽度：三块并排 / 属性单独一排 / 竖排）。
// 每张卡右上角 ✎ 固定，打开这一块的来源条目抽屉（通用编辑窗口，字段按官方定义生成）；数都取读数，界面不算数。
import { computed, markRaw, nextTick, ref } from 'vue'
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
import { openFields, openImport, openPick } from './edit-open'
import { classBuilds } from './view-tabs'
import { alignment, background, classes, creatureType, crText, deathShown, exhaustionPips, isNpc, legendary, named, senses, showExperience, signed, size, species, speeds } from './view'
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
const broken = ref(false)
const avatar = computed(() => !broken.value && /^(https?:|data:|blob:)/.test(String(s.value.img ?? '')) ? String(s.value.img) : null)
const abilityNames = computed(() => Object.fromEntries(Object.keys(g.value?.tables.abilities ?? {}).map((k) => [k, named(g.value, 'abilities', k)])))

const subtitle = computed(() => {
  const cls = classes(s.value).map((c) => (c.levels ? `${c.name} ${c.levels}` : c.name))
  // 种族、体型、类型在下面的事实行里，这里不重复
  return [...cls, alignment(s.value)].filter(Boolean) as string[]
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
// 名字原地改（Tidy5e 页头名字栏）+ 复制名字（Tidy5e copyInnerText）
const naming = ref(false)
const nameText = ref('')
const nameInput = ref<HTMLInputElement | null>(null)
const copied = ref(false)
async function startName(): Promise<void> { nameText.value = String(s.value.name ?? ''); naming.value = true; await nextTick(); nameInput.value?.select() }
async function saveName(): Promise<void> {
  if (!naming.value) return
  naming.value = false
  const v = nameText.value.trim()
  if (v && v !== s.value.name) await person.edit(`改名为「${v}」`, [{ kind: 'set', path: 'name', value: v }])
}
async function copyName(): Promise<void> {
  try { await navigator.clipboard.writeText(String(s.value.name ?? '')); copied.value = true; setTimeout(() => { copied.value = false }, 1500) } catch (e) { console.warn('复制名字没成功', e) }
}
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
// 等级管理（照 Tidy5e 等级下拉）：每个职业「升级」= 作者「导入到人物」同一个职业（选到第几级，要做的选择一题一题问）；「降一级」= 官方退回；最后「加职业 / 兼职」从库里选
const levelItems = computed(() => [
  ...classBuilds(s.value).flatMap((c) => [
    { key: `up:${c.id}`, label: `${c.name} 升级…`, disabled: ro.value || !c.ref },
    { key: `down:${c.id}`, label: `${c.name} 降一级`, disabled: ro.value || c.levels <= 1 },
  ]),
  { key: 'add', label: classBuilds(s.value).length ? '兼职（再加一个职业）…' : '选职业…', disabled: ro.value },
])
function onLevel(key: string): void {
  if (key === 'add') { openPick('classes'); return }
  const [dir, id] = key.split(':')
  const c = classBuilds(s.value).find((x) => x.id === id)
  if (!c) return
  if (dir === 'up' && c.ref) openImport(c.ref, c.name, `${c.name}升级`, c.levels + 1)
  else void person.level(`${c.name}降一级`, id, -1)
}
</script>

<template>
  <section class="ps-head" data-testid="ps-head">
   <div class="ps-top">
    <button class="ps-portrait" type="button" :disabled="ro" aria-label="换头像" data-testid="ps-portrait" @click="openAvatar">
      <img v-if="avatar" :src="avatar" alt="" @error="broken = true"><Icon v-else name="user" :size="44" />
      <span class="ps-portrait-badge" aria-hidden="true"><Icon name="image" :size="12" /></span>
    </button>

    <div class="ps-ident">
      <div class="ps-name-line">
        <input v-if="naming" ref="nameInput" v-model="nameText" class="trpg-input ps-name-input" maxlength="80" aria-label="名字" data-testid="ps-name-input" @keydown.enter.prevent="saveName" @keydown.esc.prevent="naming = false" @blur="saveName">
        <h2 v-else class="ps-name" data-testid="ps-name"><button class="ps-name-btn" type="button" :disabled="ro" title="点了改名字" @click="startName">{{ s.name }}</button></h2>
        <button class="ps-pin" type="button" aria-label="复制名字" title="复制名字" data-testid="ps-name-copy" @click="copyName"><Icon :name="copied ? 'check' : 'copy'" :size="14" /></button>
        <button class="ps-pin" type="button" :aria-pressed="pinned" :aria-label="pinned ? '取消置顶' : '置顶'" :disabled="ro" @click="togglePin"><Icon :name="pinned ? 'star-fill' : 'star'" :size="16" /></button>
        <small v-if="english" class="ps-english">{{ english }}</small>
        <button class="ps-pen ps-pen--inline" type="button" aria-label="改身份" :disabled="ro" data-testid="ps-ident-edit" @click="openIdentity"><Icon name="pencil-simple" :size="14" /></button>
        <span class="ps-rests">
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-short-rest" @click="person.rest('short')"><Icon name="hourglass" :size="13" />短休</button>
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-long-rest" @click="person.rest('long')"><Icon name="moon" :size="13" />长休</button>
        </span>
      </div>
      <p v-if="subtitle.length" class="ps-sub" data-testid="ps-sub"><span v-for="(t, i) in subtitle" :key="t" :class="{ 'ps-sub-strong': i === 0 }">{{ t }}</span></p>
      <dl class="ps-facts" data-testid="ps-facts">
        <div v-for="f in facts" :key="f.label" class="ps-fact">
          <dt>{{ f.label }}</dt>
          <dd>
            <Term v-if="f.ref" :label="`查看${f.text}`" @open="openEntry(f.ref as never, f.text)">{{ f.text }}</Term>
            <button v-else-if="f.edit" class="ps-fact-btn" type="button" :disabled="ro" :aria-label="`改${f.label}`" @click="f.edit()">
              <template v-if="f.parts?.length"><span v-for="(p, i) in f.parts" :key="i" class="ps-fact-part">{{ p }}</span></template>
              <template v-else>{{ f.text }}</template>
            </button>
            <template v-else>{{ f.text }}</template>
          </dd>
        </div>
      </dl>
      <div v-if="!npc && !classes(s).length" class="ps-blank-cta" data-testid="ps-blank-build">
        <b><Icon name="sparkle" :size="15" />从空白开始</b>
        <span>依次选种族、背景、职业，特性、熟练和起始装备会一起加上；属性值在下面直接填。</span>
        <span class="ps-blank-steps">
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-blank-race" @click="openPick('races')"><Icon name="plus" :size="13" />选种族</button>
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-blank-bg" @click="openPick('backgrounds')"><Icon name="plus" :size="13" />选背景</button>
          <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-blank-class" @click="openPick('classes')"><Icon name="plus" :size="13" />选职业</button>
        </span>
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
