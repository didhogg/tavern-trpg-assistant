<script setup lang="ts">
// 人物详情页头（线框 p6-6 ①–⑥，驾驶员 2026-11-23 批准的外壳预览）：头像 · 名字行 · 生命区 · 等级块 · 事实表 · 战斗块 · 属性块。
// 数值取读数，名字取官方显示数据 / 名字表；界面不算数。✎ 来源条目抽屉、短休 / 长休 / 等级管理在 E 批，这里不出现。
import { computed, markRaw, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import HpBlock from './HpBlock.vue'
import VitalDrawers from './VitalDrawers.vue'
import IdentityDrawer from './IdentityDrawer.vue'
import AvatarDrawer from './AvatarDrawer.vue'
import { alignment, background, classes, creatureType, crText, deathShown, isNpc, legendary, named, senses, showExperience, signed, size, species, speeds } from './view'

const person = usePersonStore()
const modal = useModalStore()
const s = computed(() => person.sheet!)
const g = computed(() => person.glossary)
const sys = computed(() => s.value.system)
const npc = computed(() => isNpc(s.value))
const english = computed(() => String(person.row?.adjustments.englishName ?? ''))
// 头像：和人物列表同一条规则——只显示网址形式的图，小窗里的相对路径、加载失败都用默认人像
const broken = ref(false)
const avatar = computed(() => !broken.value && /^(https?:|data:|blob:)/.test(String(s.value.img ?? '')) ? String(s.value.img) : null)

const subtitle = computed(() => {
  const cls = classes(s.value).map((c) => (c.levels ? `${c.name} ${c.levels}` : c.name))
  return [...cls, npc.value ? creatureType(s.value, g.value) : species(s.value)?.name, npc.value ? size(s.value, g.value) : null, alignment(s.value)].filter(Boolean) as string[]
})
const facts = computed(() => {
  const out: Array<{ label: string; text: string; ref?: unknown; parts?: string[] }> = []
  const sp = species(s.value)
  const bg = background(s.value)
  if (sp) out.push({ label: '种族', text: sp.name, ref: sp.ref })
  if (bg) out.push({ label: '背景', text: bg.name, ref: bg.ref })
  if (!npc.value) { out.push({ label: '体型', text: size(s.value, g.value) }); out.push({ label: '类型', text: creatureType(s.value, g.value) }) }
  const sv = speeds(s.value).filter((x) => x.value)
  if (sv.length) { const parts = sv.map((x) => `${x.label} ${x.value} 尺`); out.push({ label: '速度', text: parts.join('　'), parts }) }
  const se = senses(s.value).filter((x) => x.value !== null && x.value !== undefined && x.value !== '')
  if (se.length) { const parts = se.map((x) => `${x.label} ${x.value}${typeof x.value === 'number' && x.key !== 'passivePerception' ? ' 尺' : ''}`); out.push({ label: '感官', text: parts.join('　'), parts }) }
  const spell = sys.value.attributes.spell
  if (sys.value.attributes.spellcasting && spell?.dc) out.push({ label: '法术', text: `${spell.abilityLabel ?? named(g.value, 'abilities', sys.value.attributes.spellcasting)} DC ${spell.dc}` })
  return out
})
const abilities = computed(() => Object.keys(g.value?.tables.abilities ?? {}).filter((k) => sys.value.abilities?.[k]).map((k) => {
  const a = sys.value.abilities[k]
  return { key: k, label: named(g.value, 'abilities', k), mod: a.mod, value: a.value, save: a.save?.value ?? a.save, proficient: !!a.proficient }
}))
const hd = computed(() => sys.value.attributes.hd ?? null)
const death = computed(() => sys.value.attributes.death ?? { success: 0, failure: 0 })
const zero = computed(() => Number(sys.value.attributes.hp?.value) === 0)
const leg = computed(() => legendary(s.value))

const VITAL_TITLES = { hitDice: '生命骰', exhaustion: '力竭', death: '死亡豁免' } as const
function openVital(kind: keyof typeof VITAL_TITLES): void {
  modal.open({ key: `person-${kind}`, title: VITAL_TITLES[kind], component: markRaw(VitalDrawers), props: { kind }, variant: 'dialog', width: 480, height: 420 })
}
const openIdentity = () => modal.open({ key: 'person-identity', title: '身份', component: markRaw(IdentityDrawer), variant: 'dialog', width: 480, height: 420 })
const openAvatar = () => modal.open({ key: 'person-avatar', title: '人物头像', component: markRaw(AvatarDrawer), variant: 'dialog', width: 560, height: 420 })
const toggleInspiration = () => person.edit(sys.value.attributes.inspiration ? '取消灵感' : '获得灵感', [{ kind: 'set', path: 'system.attributes.inspiration', value: !sys.value.attributes.inspiration }])
</script>

<template>
  <section class="ps-head" data-testid="ps-head">
    <button class="ps-portrait" type="button" :disabled="person.readOnly" aria-label="换头像" data-testid="ps-portrait" @click="openAvatar">
      <img v-if="avatar" :src="avatar" alt="" @error="broken = true"><Icon v-else name="user" :size="40" />
    </button>

    <div class="ps-ident">
      <button class="ps-name" type="button" :disabled="person.readOnly" data-testid="ps-name" @click="openIdentity">
        <b>{{ s.name }}</b><small v-if="english">{{ english }}</small>
      </button>
      <p class="ps-sub" data-testid="ps-sub"><span v-for="t in subtitle" :key="t">{{ t }}</span></p>
    </div>

    <div class="ps-level" data-testid="ps-level">
      <template v-if="npc">
        <div><small>挑战等级</small><b>{{ crText(sys.details.cr) }}</b></div>
        <div><small>熟练加值</small><b>{{ signed(sys.attributes.prof) }}</b></div>
        <div v-if="sys.details.xp?.value"><small>经验</small><b>{{ Number(sys.details.xp.value).toLocaleString('zh-CN') }}</b></div>
      </template>
      <template v-else>
        <div><small>等级</small><b>{{ sys.details.level }}</b></div>
        <div><small>熟练加值</small><b>{{ signed(sys.attributes.prof) }}</b></div>
        <button class="ps-insp" type="button" :aria-pressed="!!sys.attributes.inspiration" :disabled="person.readOnly" data-testid="ps-insp" @click="toggleInspiration">
          <Icon :name="sys.attributes.inspiration ? 'star-fill' : 'star'" :size="16" />灵感
</button>
        <div v-if="showExperience(s) && sys.details.xp" class="ps-xp">
<small>经验 {{ Number(sys.details.xp.value).toLocaleString('zh-CN') }} / {{ Number(sys.details.xp.max).toLocaleString('zh-CN') }}</small>
          <span class="ps-bar" aria-hidden="true"><i :style="{ width: `${sys.details.xp.pct ?? 0}%` }" /></span>
</div>
      </template>
      <div v-if="leg.act.length || leg.res.length" class="ps-leg">
        <span v-if="leg.act.length"><small>传奇动作</small><i v-for="p in leg.act" :key="p.n" class="ps-dot" :data-on="p.filled || undefined" :title="p.label" /></span>
        <span v-if="leg.res.length"><small>传奇抗性</small><i v-for="p in leg.res" :key="p.n" class="ps-dot" :data-on="p.filled || undefined" :title="p.label" /></span>
      </div>
    </div>

    <div class="ps-vitals">
      <HpBlock />
      <div class="ps-vital-btns">
        <button v-if="hd && hd.max" class="trpg-btn trpg-btn--small" type="button" data-testid="ps-hd" @click="openVital('hitDice')">生命骰 {{ hd.value }}/{{ hd.max }}</button>
        <button class="trpg-btn trpg-btn--small" type="button" data-testid="ps-exh" @click="openVital('exhaustion')">力竭 {{ sys.attributes.exhaustion ?? 0 }} 级</button>
        <button v-if="deathShown(s)" class="trpg-btn trpg-btn--small" :data-alert="zero || undefined" type="button" data-testid="ps-death" @click="openVital('death')">
          死亡豁免<template v-if="zero || death.success || death.failure"><span class="ps-death-count">成功 {{ death.success ?? 0 }}，失败 {{ death.failure ?? 0 }}</span></template>
</button>
      </div>
    </div>

    <dl class="ps-facts" data-testid="ps-facts">
      <div v-for="f in facts" :key="f.label">
<dt>{{ f.label }}</dt>
        <dd><Term v-if="f.ref" :label="`查看${f.text}`" @open="openEntry(f.ref as never, f.text)">{{ f.text }}</Term><span v-for="(p, i) in f.parts" v-else-if="f.parts" :key="i" class="ps-fact-part">{{ p }}</span><template v-else>{{ f.text }}</template></dd>
</div>
    </dl>

    <div class="ps-stats">
      <div class="ps-combat" data-testid="ps-combat">
        <div><small>护甲等级</small><b>{{ sys.attributes.ac?.value }}</b></div>
        <div><small>先攻</small><b>{{ signed(sys.attributes.init?.total) }}</b></div>
        <div v-if="sys.attributes.spellcasting"><small>专注</small><b>{{ signed(sys.attributes.concentration?.save) }}</b></div>
      </div>

      <div class="ps-abilities" data-testid="ps-abilities">
        <div v-for="a in abilities" :key="a.key" class="ps-ability">
          <small>{{ a.label }}</small><b>{{ signed(a.mod) }}</b><span>{{ a.value }}</span>
          <em :data-prof="a.proficient || undefined">{{ a.proficient ? '● ' : '' }}豁免 {{ signed(a.save) }}</em>
        </div>
      </div>
    </div>
  </section>
</template>
