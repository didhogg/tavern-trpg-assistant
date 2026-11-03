<script setup lang="ts">
import AvatarFrame from '../kit/AvatarFrame.vue'
import StatCell from '../kit/StatCell.vue'
import type { TemplateRow } from './templates'
import { acText, alignmentText, crText, hpText, isNpc, sizeCreature, speedText } from './templateView'

/** 右栏的摘要头（60×75 类型图块 + 名字 + 一行分类 + 挑战等级与经验）和 AC / 生命 / 速度数值条。 */
defineProps<{ row: TemplateRow }>()
</script>

<template>
  <section class="trpg-tplsum">
    <div class="trpg-tplsum__head">
      <AvatarFrame :w="60" :h="75" :label="row.entry.name" :creature-type="row.block?.creatureType.type" />
      <div class="trpg-tplsum__main">
        <h3 class="trpg-tplsum__name">{{ row.entry.name }}<span v-if="row.entry.nameEn" class="trpg-tplsum__en">{{ row.entry.nameEn }}</span></h3>
        <p v-if="row.block" class="trpg-tplsum__line">{{ [sizeCreature(row), alignmentText(row)].filter(Boolean).join(' ・ ') }}</p>
        <p class="trpg-tplsum__meta">
          <span v-if="crText(row)" class="trpg-tplcard__cr">{{ crText(row) }}</span>
          <span v-if="row.block?.xp">经验 {{ row.block.xp }}</span>
          <span v-if="isNpc(row)">具名 NPC</span>
          <span class="trpg-tplsum__book">{{ row.packName }}</span>
        </p>
      </div>
    </div>
    <div v-if="row.block" class="trpg-tplsum__stats">
      <StatCell label="AC" :value="acText(row)" />
      <StatCell label="生命" :value="hpText(row)" />
      <StatCell label="速度" :value="speedText(row)" unit="尺" />
    </div>
  </section>
</template>
