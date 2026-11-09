<script setup lang="ts">
import type { ImportResult } from '../../core/transfer/importer'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'

/** 导入结果：导入 N / 跳过 M / 缺书清单 / 自制·范围·房规恢复数 / 错误；没核对依赖时直说"依赖未核对"。 */
defineProps<{ result: ImportResult }>()
const modal = useModalStore()
</script>

<template>
  <div class="page-stack" data-testid="import-result">
    <p class="trpg-import__ok"><Icon name="check-circle" :size="16" /> 导入 {{ result.imported }} 个存档<template v-if="result.skipped"> · 跳过 {{ result.skipped }} 个</template></p>
    <div v-if="result.library" class="trpg-checks">
      <div>
<b>资料库恢复</b><span>自制包 {{ result.library.brews }} · 范围 {{ result.library.scopes }} · 房规 {{ result.library.houseRules }}</span>
        <span v-for="e in result.library.errors" :key="e" class="trpg-field__err"><Icon name="warning" :size="12" />{{ e }}</span>
</div>
    </div>
    <div class="trpg-checks">
      <div v-if="result.dependenciesUnchecked"><b>依赖未核对</b><span class="trpg-field__hint">这些存档用到的资料有没有装好，这次没有核对；读取时会再检查。</span></div>
      <div v-else-if="result.missing.length" data-testid="import-missing">
        <b>缺少 {{ result.missing.length }} 项资料</b>
        <span v-for="(m, i) in result.missing.slice(0, 8)" :key="i">{{ m.ref.hash }}（{{ m.reason }}）</span>
        <span class="trpg-field__hint">仍可读取和导出；用到它们的结算会暂停，数据不会丢。</span>
      </div>
      <div v-else><b>依赖齐全</b><span class="trpg-field__hint">共 {{ result.dependencies }} 项依赖，都能找到。</span></div>
    </div>
    <div class="trpg-confirm__actions"><button class="trpg-btn trpg-btn--primary" type="button" data-autofocus @click="modal.close(true)">完成</button></div>
  </div>
</template>
