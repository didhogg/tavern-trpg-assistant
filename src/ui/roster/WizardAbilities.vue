<script setup lang="ts">
import { computed } from 'vue'
import type { AbilityMethod } from '../../rules/kernel/ability-rules'
import { useWizardStore } from '../../stores/wizard'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import { METHOD_LABELS, problemLabel } from './wizard-labels'

/** 属性值：方式（标准数组 / 购点 / 手填）+ 每项「基础 + 加成 = 合计」。规则、加成、检查全由后端给，这里只摆放和记玩家放了什么。 */
const w = useWizardStore()
const check = computed(() => w.abil?.check ?? null)
const rows = computed(() => w.abil?.rows ?? [])
const problemsOf = (key: string): string[] => (check.value?.problems ?? []).filter((p) => p.key === key).map((p) => problemLabel(p.code, w.abil?.cap ?? null))
const general = computed(() => (check.value?.problems ?? []).filter((p) => p.key === null).map((p) => problemLabel(p.code, null)))
const onInput = (key: string, e: Event): void => {
  const raw = (e.target as HTMLInputElement).value.trim()
  w.setBase(key, raw === '' ? null : Number(raw))
}
</script>

<template>
  <div class="wz-ab" data-testid="wz-abilities">
    <div class="wz-ab__head">
    <div class="wz-ab__top">
      <span class="trpg-field__label">怎么定属性？</span>
      <Segmented :model-value="w.abilMethod" label="定属性的方式" :options="Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label }))" @update:model-value="(v) => void w.setMethod(v as AbilityMethod)" />
    </div>

    <div v-if="w.abilMethod === 'standardArray'" class="wz-ab__pool" data-testid="wz-ab-pool">
      <span class="wz-note">待放的数：</span>
      <button v-for="(n, i) in check?.pool ?? []" :key="`${n}-${i}`" type="button" class="wz-opt" :data-on="w.holding === n || undefined" data-testid="wz-ab-chip" :aria-pressed="w.holding === n" @click="w.hold(n)">{{ n }}</button>
      <span v-if="!(check?.pool ?? []).length" class="wz-note">都放完了</span>
      <span v-else class="wz-note">点一个数，再点一项属性放进去；点已放的属性可收回。</span>
    </div>
    <div v-else-if="w.abilMethod === 'pointBuy'" class="wz-ab__pool" data-testid="wz-ab-budget">
      <b>已用 {{ check?.cost ?? 0 }} / {{ check?.budget ?? 0 }}，剩 {{ check?.left ?? 0 }}</b>
      <span class="wz-note">钱不够时 [＋] 变灰。</span>
    </div>
    <p v-else class="wz-note">自己填，范围 0 到 {{ w.abil?.cap ?? '上限' }}。</p>
    </div>

    <table class="wz-ab__tbl">
      <thead><tr><th scope="col">属性</th><th scope="col">基础</th><th scope="col">种族等加成</th><th scope="col">合计</th><th v-if="w.abilMethod === 'pointBuy'" scope="col">这一档花</th></tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.key" :data-testid="`wz-ab-row-${r.key}`">
          <th scope="row">{{ r.label }}</th>
          <td>
            <template v-if="w.abilMethod === 'standardArray'">
              <button type="button" class="wz-ab__cell" :data-set="r.set || undefined" :data-ready="w.holding !== null || undefined" :aria-label="`${r.label}：${r.set ? `现在是 ${r.base}，点一下收回` : w.holding !== null ? `放入 ${w.holding}` : '还没放'}`" data-testid="wz-ab-place" @click="w.place(r.key)">{{ r.set ? r.base : '—' }}</button>
            </template>
            <template v-else-if="w.abilMethod === 'pointBuy'">
              <span class="wz-ab__step">
                <button type="button" class="trpg-icon-btn" :aria-label="`${r.label} 少一档`" :disabled="w.optLoading || check?.rows?.[r.key]?.down == null" @click="w.setBase(r.key, check!.rows![r.key].down!)"><Icon name="minus" :size="14" /></button>
                <b data-testid="wz-ab-base">{{ r.set ? r.base : '—' }}</b>
                <button type="button" class="trpg-icon-btn" :aria-label="`${r.label} 多一档`" :disabled="w.optLoading || check?.rows?.[r.key]?.up == null" @click="w.setBase(r.key, check!.rows![r.key].up!)"><Icon name="plus" :size="14" /></button>
              </span>
            </template>
            <input v-else class="trpg-input wz-ab__ipt" type="number" inputmode="numeric" step="1" :value="r.set ? r.base : ''" :aria-label="`${r.label} 基础值`" data-testid="wz-ab-input" @input="onInput(r.key, $event)" />
            <div v-if="problemsOf(r.key).length" class="wz-ab__err" role="alert">{{ problemsOf(r.key).join('、') }}</div>
          </td>
          <td>{{ r.bonus > 0 ? `+${r.bonus}` : r.bonus }}</td>
          <td class="wz-ab__total" :data-set="r.set || undefined" data-testid="wz-ab-total">{{ r.total }}</td>
          <td v-if="w.abilMethod === 'pointBuy'">{{ check?.rows?.[r.key]?.cost ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-for="m in general" :key="m" class="wz-err" role="alert">{{ m }}</p>
    <p v-if="w.unsetAbilities.length" class="wz-note">没放的属性，创建后是官方初值加种族等加成（上表「合计」里淡色的数）。</p>
  </div>
</template>
