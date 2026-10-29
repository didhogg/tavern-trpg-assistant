<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { errorText } from '../format'
import Segmented from '../kit/Segmented.vue'

const props = defineProps<{ ruleId: string; pack?: { id: string; name: string; description: string } }>()
const emit = defineEmits<{ done: [] }>()
const app = useAppStore()
const library = useLibraryStore()
const modal = useModalStore()
const toast = useToastStore()
const name = ref(props.pack?.name ?? '')
const description = ref(props.pack?.description ?? '')
const category = ref('rules')
const error = ref('')
const working = ref(false)

async function submit(): Promise<void> {
  working.value = true
  error.value = ''
  try {
    if (props.pack) {
      await app.svc().mine.rename(props.pack.id, { name: name.value, description: description.value })
      toast.success('已保存')
    } else {
      const created = await app.svc().mine.create({ ruleId: props.ruleId, name: name.value, category: category.value as 'rules', description: description.value })
      toast.success(`已建立「${created.name}」`)
    }
    await library.refreshInstalled()
    emit('done')
    modal.close(true)
  } catch (e) {
    error.value = errorText(e)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <form class="page-stack" @submit.prevent="submit">
    <label class="trpg-field"><span class="trpg-field__label">名称</span><input v-model="name" class="trpg-input" maxlength="80" aria-label="名称" data-autofocus autocomplete="off" /></label>
    <div v-if="!pack" class="trpg-field"><span class="trpg-field__label">分组</span><Segmented v-model="category" label="分组" :options="[{ value: 'rules', label: '资料与规则' }, { value: 'setting', label: '设定' }, { value: 'toolkit', label: '工具' }, { value: 'adventure', label: '冒险' }]" /></div>
    <label class="trpg-field"><span class="trpg-field__label">简介（可空）</span><textarea v-model="description" class="trpg-input" rows="3" maxlength="400" aria-label="简介" /></label>
    <p v-if="error" class="trpg-field__error" role="alert">{{ error }}</p>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" @click="modal.close(true)">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="working || !name.trim()">{{ pack ? '保存' : '建立' }}</button>
    </div>
  </form>
</template>
