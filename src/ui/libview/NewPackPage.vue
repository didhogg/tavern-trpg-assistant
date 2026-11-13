<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import { ruleOptions, suggestJson } from './mine'

/** P5.5 u7-2 新建包：名字 · 编号（按名字给建议，建好不能改）· 缩写 · 规则（默认当前战役）。建好直接打开这个包。 */
const props = defineProps<{ codeSet: string; onCreated: (id: string, name: string) => void }>()
const app = useAppStore()
const lib = useLibViewStore()
const modal = useModalStore()
const toast = useToastStore()
const name = ref('')
const json = ref('')
const abv = ref('')
const rules = computed(() => ruleOptions(app.svc()).filter((o) => o.value))
const rule = ref(lib.campaignLib?.rule ?? rules.value[0]?.value ?? '')
const err = ref<string | null>(null)
const busy = ref(false)
const touched = ref(false)
watch(name, (n) => { if (!touched.value) json.value = n.trim() ? suggestJson(n) : '' })
const jsonOk = computed(() => /^[A-Za-z0-9_-]+$/.test(json.value.trim()))
const canSave = computed(() => !!name.value.trim() && jsonOk.value && !busy.value)

async function create(): Promise<void> {
  if (!canSave.value) return
  busy.value = true
  err.value = null
  try {
    const made = await app.svc().backend.library.custom.createPack(props.codeSet, { json: json.value.trim(), full: name.value.trim(), abbreviation: abv.value.trim() }, rule.value ? { rule: rule.value } : {})
    toast.success(`已建好《${made.full}》`)
    modal.close(true)
    props.onCreated(made.id, made.full)
  } catch (e) {
    err.value = e instanceof Error ? e.message : String(e)
  } finally { busy.value = false }
}
</script>

<template>
  <form class="lib-dialog" data-testid="newpack-page" @submit.prevent="create">
    <div class="lib-dialog__body">
      <label class="trpg-field"><span class="trpg-field__label">名字</span><input v-model="name" class="trpg-input" type="text" placeholder="例如：海盗战役" data-autofocus data-testid="newpack-name" /></label>
      <label class="trpg-field">
        <span class="trpg-field__label">编号</span>
        <input v-model="json" class="trpg-input" type="text" :aria-invalid="!!err || (!!json && !jsonOk)" data-testid="newpack-json" @input="touched = true" />
        <span v-if="err" class="trpg-field__err" data-testid="newpack-err"><Icon name="warning" :size="14" />{{ err }}</span>
        <span v-else-if="json && !jsonOk" class="trpg-field__err"><Icon name="warning" :size="14" />只能用英文字母、数字、_ 和 -</span>
        <span v-else class="trpg-field__hint">只能用英文字母、数字、_ 和 -；按名字给了一个建议，建好不能改</span>
      </label>
      <label class="trpg-field"><span class="trpg-field__label">缩写</span><input v-model="abv" class="trpg-input" type="text" placeholder="不填就用编号" /></label>
      <div class="trpg-field">
        <span class="trpg-field__label">规则</span>
        <SelectField v-model="rule" label="规则" :options="rules" />
        <span class="trpg-field__hint">版本标签按规则自动打上，之后可在包的 ⋯ → 管理 里改</span>
      </div>
    </div>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" @click="modal.close(true)">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="!canSave" data-testid="newpack-create">{{ busy ? '正在建…' : '建好并打开' }}</button>
    </div>
  </form>
</template>
