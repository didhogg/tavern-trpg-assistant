<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue'
import type { ChildGroup } from '../../library/custom-children'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import { openEditMine, openEditor } from './edit-flow'
import type { Ent } from './edit-json'

/**
 * 主条目编辑器里的「从属条目」（§16.10 2c）：子职、职业特性……不在新建列表里单独新建，在这里加、点 ✎ 改。
 * 哪些类别、包里有哪几条全由后端给（custom.children），新条目的起点也由后端填好指向主条目的字段（custom.childStart）。
 * 主条目还没存过（新建的）：先存，存了才有来源可以指。存好一条从属条目后，后端已同步主条目的引用表（职业 classFeatures），
 * 通知编辑器把这几张表重新读进来（不然再存主条目会拿旧表盖掉）。
 */
const props = defineProps<{ codeSet: string; pack: { id: string; name: string }; prop: string; ent: Ent; saved: boolean }>()
const emit = defineEmits<{ linked: [fields: string[]] }>()
const app = useAppStore()
const toast = useToastStore()
const groups = shallowRef<ChildGroup[] | null>(null)
const failed = ref<string | null>(null)

async function load(): Promise<void> {
  failed.value = null
  try {
    const lib = app.svc().backend.library.custom
    if (props.saved) groups.value = await lib.children(props.codeSet, props.pack.id, props.prop, props.ent)
    else {
      // 还没存：只说有哪几类从属（名字从类型表来）
      const types = await lib.entryTypes(props.codeSet)
      groups.value = types.filter((t) => t.kind === 'child' && t.parent === props.prop).map((t) => ({ prop: t.prop, name: t.name, items: [] }))
    }
  } catch (e) { console.error('[trpg-assistant] 从属条目没读出来', e); failed.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void load())
watch(() => [props.ent.name, props.ent.shortName, props.saved], () => void load())

const after = (childProp: string) => () => { void load(); emit('linked', [`${childProp}s`]) }
async function edit(childProp: string, hash: string | null): Promise<void> {
  if (!hash) return
  try { await openEditMine(app.svc(), props.codeSet, props.pack, childProp, hash, { onSaved: after(childProp) }) } catch (e) { toast.error(e instanceof Error ? e.message : '没能打开') }
}
async function add(g: ChildGroup): Promise<void> {
  try {
    const start = await app.svc().backend.library.custom.childStart(props.codeSet, g.prop, props.prop, props.ent)
    if (!start) throw new Error(`这套资料不收${g.name}`)
    openEditor({ codeSet: props.codeSet, prop: g.prop, typeName: g.name, pack: props.pack, ent: start, target: { kind: 'new', pack: props.pack.id }, nested: true, onSaved: after(g.prop) })
  } catch (e) { toast.error(e instanceof Error ? e.message : '没能新建') }
}
</script>

<template>
  <section v-if="groups?.length || failed" class="lib-children" data-testid="editor-children">
    <div class="lib-fsec">属于这一条的</div>
    <p v-if="failed" class="lib-muted">没读出来：{{ failed }}</p>
    <p v-else-if="!saved" class="lib-muted">先点［完成］保存这一条，再在这里加{{ groups!.map((g) => g.name).join('、') }}。</p>
    <template v-else>
      <div v-for="g in groups" :key="g.prop" class="lib-children__grp" :data-child="g.prop">
        <b>{{ g.name }}</b>
        <span class="lib-children__items">
          <button v-for="c in g.items" :key="c.uniqueId ?? c.hash ?? c.name" class="trpg-pill" type="button" @click="edit(g.prop, c.hash)">{{ c.level != null ? `${c.level} 级 · ` : '' }}{{ c.name || '（没名字）' }}<Icon name="pencil-simple" :size="13" /></button>
          <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="child-add" @click="add(g)"><Icon name="plus" :size="14" />新{{ g.name }}</button>
        </span>
      </div>
    </template>
  </section>
</template>
