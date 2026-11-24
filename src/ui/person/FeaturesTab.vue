<script setup lang="ts">
// 特性页（照 Tidy5e tabs/CharacterFeaturesTab.svelte）：工具条（搜索 · 排序 · 分组方式 按来源 / 按主动被动 · 全部展开）
// · 分组表（官方 sections：各职业特性 / 主动 / 被动 / 种族 / 背景 / 其他；列 次数 · 时间 · 恢复 · 来源）· 组头 ＋ 新建特性 · 页底 新建 / 从库里加。
// 职业 / 子职业的增删改在「属性」页特质卡（Tidy5e 同样放在那里）。
import { computed } from 'vue'
import { usePersonStore } from '../../stores/person'
import Icon from '../kit/Icon.vue'
import { openPick } from './edit-open'
import DocTable from './table/DocTable.vue'
import TableBar from './table/TableBar.vue'
import { useTable } from './table/use-table'

const person = usePersonStore()
const t = useTable('features')
const ro = computed(() => person.readOnly)
</script>

<template>
  <div class="ps-features" data-testid="ps-features">
    <TableBar v-model:query="t.query.value" v-model:sort="t.sort.value" v-model:grouping="t.grouping.value" v-model:expand="t.expand.value" v-model:filters="t.filters.value" :controls="t.controls.value" placeholder="搜特性" testid="ps-features">
      <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="ro" data-testid="ps-features-add" @click="openPick('feats')"><Icon name="plus" :size="14" />从库里加专长 / 特性</button>
    </TableBar>
    <p v-if="!t.groups.value.length" class="ps-drawer-note">{{ t.query.value ? '没有符合的特性。' : '还没有特性。建卡、升级，或从库里加专长后出现在这里。' }}</p>
    <DocTable domain="feature" :groups="t.groups.value" :expand="t.expand.value" creatable testid="ps-feat" @create="() => t.create('feat', '特性')" @section="t.section" />
    <footer class="dt-foot">
      <span class="dt-bar-gap" />
      <button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ps-features-create" @click="t.create('feat', '特性')"><Icon name="plus" :size="14" />新建特性</button>
    </footer>
  </div>
</template>
