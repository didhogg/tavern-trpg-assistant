<script setup lang="ts">
import { useWizardStore } from '../../stores/wizard'
import { currencyText } from './wizard-labels'

/** 检查后创建：看一眼选了什么，没选完的列在「待填」里，[去填] 跳回那一步；不填也能创建（没选的位置留空）。 */
const w = useWizardStore()
const names = (prop: string): string => (w.chosen[prop] ?? []).map((r) => w.optionsFor(r)?.name ?? '…').join('、')
</script>

<template>
  <div class="wz-done" data-testid="wz-done">
    <h3>{{ w.name.trim() || '（还没起名）' }}</h3>
    <dl class="wz-sum">
      <template v-for="p in w.build" :key="p">
        <template v-if="(w.chosen[p] ?? []).length">
          <dt>{{ w.label(p) }}</dt><dd>{{ names(p) }}</dd>
        </template>
      </template>
    </dl>
    <div v-if="w.equip.preview" class="wz-eqdone" data-testid="wz-eq-done">
      <b>装备</b>
      <p v-for="s in w.equip.preview.sections" :key="s.refKey" class="wz-note">{{ w.equip.nameOf(s.refKey) }}：{{ s.items.length }} 种物品<template v-if="s.items.length">（{{ s.items.map((i) => `${i.label}${i.quantity > 1 ? '×' + i.quantity : ''}`).join('、') }}）</template></p>
      <p class="wz-note">钱：{{ currencyText(w.equip.preview.currency) }}</p>
    </div>
    <div v-if="w.todo.length" class="wz-todo" data-testid="wz-todo">
      <b>待填（{{ w.todo.length }}）</b>
      <p class="wz-note">不填也能创建：没选的位置创建后会空着，不会替你选。</p>
      <div v-for="t in w.todo" :key="t.text" class="wz-todo__row"><span>{{ t.text }}</span><button class="trpg-btn trpg-btn--small" type="button" @click="w.go(t.go)">去填</button></div>
    </div>
    <p v-else class="wz-note">都选好了，点「创建」。</p>
    <p v-if="w.createError" class="wz-err" role="alert">{{ w.createError }}</p>
  </div>
</template>
