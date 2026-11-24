<script setup lang="ts">
// 行动页（照 Tidy5e tabs/CharacterSheetTab.svelte 的行动列表）：工具条（搜索 · 排序 · 全部展开）· 按动作类型分组（官方：动作 / 附赠 / 反应 / 传奇 / 巢穴…，被动最后）
// · 列照 Tidy5e 行动页：次数 · 命中 · 公式 · 射程 · 目标 · 时间；行按钮 编辑 · 删除 · ⋯。点名字展开说明与活动。点了掷 = P7。
import { computed } from 'vue'
import DocTable from './table/DocTable.vue'
import TableBar from './table/TableBar.vue'
import { useTable } from './table/use-table'
import type { DocGroup } from './table/rows'

const t = useTable('actions')
/** 被动放最后（官方 NPC 表的顺序把被动放在中间；Tidy5e 行动页把它排在最后）。 */
const groups = computed<DocGroup[]>(() => [...t.groups.value.filter((g) => g.key !== 'passive'), ...t.groups.value.filter((g) => g.key === 'passive')])
</script>

<template>
  <div class="ps-actions" data-testid="ps-actions">
    <TableBar v-model:query="t.query.value" v-model:sort="t.sort.value" v-model:grouping="t.grouping.value" v-model:expand="t.expand.value" v-model:filters="t.filters.value" :controls="t.controls.value" placeholder="搜行动" testid="ps-actions" />
    <p v-if="!groups.length" class="ps-drawer-note">{{ t.query.value ? '没有符合的行动。' : '还没有行动。武器、法术、特性带来的动作会出现在这里。' }}</p>
    <DocTable domain="action" tab="action" :groups="groups" :expand="t.expand.value" testid="ps-act" @section="t.section" />
  </div>
</template>
