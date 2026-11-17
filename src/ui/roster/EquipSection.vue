<script setup lang="ts">
import { computed } from 'vue'
import type { StartingSection } from '../../rules/kernel/starting-options'
import { useWizardStore } from '../../stores/wizard'
import EquipEntry from './EquipEntry.vue'

/** 一个来源（职业 / 背景）的起始装备：固定给的 · 选一个的各组 · 不要装备改拿金币。 */
const props = defineProps<{ section: StartingSection }>()
const eq = useWizardStore().equip
const key = computed(() => props.section.refKey)
const gold = computed(() => eq.goldOf(key.value))
const goldOn = computed(() => gold.value !== null)
const fixed = computed(() => props.section.groups.filter((g) => g.choices.length === 1))
const pickGroups = computed(() => props.section.groups.filter((g) => g.choices.length > 1))
function toggleGold(on: boolean): void { eq.setGold(key.value, on ? 0 : null, on ? '' : '') }
function onGoldInput(e: Event): void { const raw = (e.target as HTMLInputElement).value.trim(); eq.setGold(key.value, raw === '' ? 0 : Number(raw), '自己填') }
</script>

<template>
  <details class="wz-eqs" open :data-testid="`wz-eq-section`">
    <summary>来自：{{ eq.nameOf(key) }}</summary>
    <div class="wz-eqs__body" :data-gold="goldOn || undefined">
      <div v-if="fixed.length" class="wz-eqg">
        <b class="wz-eqg__h">固定给</b>
        <div class="wz-eqg__fixed">
          <EquipEntry v-for="e in fixed.flatMap((g) => g.choices[0].entries.map((en) => ({ g: g.index, c: g.choices[0].key, en })))" :key="`${e.g}.${e.en.index}`" :section="key" :group="e.g" :choice="e.c" :entry="e.en" :disabled="goldOn" />
        </div>
      </div>
      <fieldset v-for="g in pickGroups" :key="g.index" class="wz-eqg" :disabled="goldOn" data-testid="wz-eq-group">
        <legend class="wz-eqg__h">选一个</legend>
        <div v-for="c in g.choices" :key="c.key" class="wz-eqo" role="radio" :aria-checked="eq.chosenKey(key, g) === c.key" :data-on="eq.chosenKey(key, g) === c.key || undefined" data-testid="wz-eq-option" @click="eq.chooseOption(key, g.index, c.key)">
          <input type="radio" :name="`eq-${key}-${g.index}`" :checked="eq.chosenKey(key, g) === c.key" :aria-label="c.entries.map((e) => e.label ?? e.text ?? e.name ?? '').join('、')" @change="eq.chooseOption(key, g.index, c.key)" />
          <span class="wz-eqo__list"><EquipEntry v-for="e in c.entries" :key="e.index" :section="key" :group="g.index" :choice="c.key" :entry="e" :disabled="goldOn" /></span>
        </div>
      </fieldset>
      <div v-if="section.goldExpression" class="wz-eqgold" data-testid="wz-eq-gold">
        <label class="wz-eqgold__on"><input type="checkbox" :checked="goldOn" data-testid="wz-eq-gold-on" @change="toggleGold(($event.target as HTMLInputElement).checked)" />不要装备，改拿起始金币<small>（骰式 {{ section.goldExpression }}）</small></label>
        <div v-if="goldOn" class="wz-eqgold__row">
          <button type="button" class="trpg-btn" data-testid="wz-eq-roll" @click="eq.rollGold(key, section.goldExpression!)">掷 {{ section.goldExpression }}</button>
          <span class="wz-note">或自己填</span>
          <input class="trpg-input wz-eqgold__ipt" type="number" min="0" step="1" inputmode="numeric" :value="gold || ''" :aria-label="`起始金币（${section.goldUnit ?? ''}）`" data-testid="wz-eq-gold-input" @input="onGoldInput" />
          <span class="wz-note">{{ section.goldUnit }}</span>
          <b v-if="gold" data-testid="wz-eq-gold-note">{{ eq.goldNote[key] ? `${eq.goldNote[key]}：` : '' }}{{ gold }} {{ section.goldUnit }}</b>
          <button v-if="gold" type="button" class="trpg-btn trpg-btn--small" @click="eq.setGold(key, 0)">清除</button>
        </div>
      </div>
    </div>
  </details>
</template>
