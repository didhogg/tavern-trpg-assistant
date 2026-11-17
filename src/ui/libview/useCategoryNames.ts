import { onMounted, shallowRef } from 'vue'
import { distinctNames } from '../../library/entry-kinds'
import type { LibraryService } from '../../library/service'
import { authorTextFor } from '../../rules/kernel/author-text'
import { useAppStore } from '../../stores/app'
import { CATEGORY_ORDER } from './registry'

const pending = new WeakMap<LibraryService, Promise<Record<string, string>>>()

async function loadNames(service: LibraryService): Promise<Record<string, string>> {
  const labels = await authorTextFor(service, 'cn').labels(CATEGORY_ORDER, 'category')
  const categories = Object.entries(labels).map(([prop, name]) => ({ prop, name }))
  const repeated = categories.filter(({ name }) => categories.filter((row) => row.name === name).length > 1).map(({ prop }) => prop)
  const other = repeated.length ? await authorTextFor(service, 'en').labels(repeated, 'category').catch(() => ({} as Record<string, string>)) : {}
  return Object.fromEntries(distinctNames(categories, (prop) => other[prop] && Object.values(other).filter(name => name === other[prop]).length === 1 ? other[prop] : undefined)
    .map(({ prop, name }) => [prop, name]))
}

/** 中文界面的类名全从作者中文资料程序取，同一个库只取一次。 */
export function useCategoryNames() {
  const app = useAppStore()
  const names = shallowRef<Record<string, string>>({})
  onMounted(async () => {
    const service = app.svc().backend.library.service
    let promise = pending.get(service)
    if (!promise) {
      promise = loadNames(service)
      pending.set(service, promise)
    }
    try { names.value = await promise } catch (error) {
      if (pending.get(service) === promise) pending.delete(service)
      console.warn('[trpg-assistant] 作者的中文类别名没取到', error)
    }
  })
  return (prop: string): string => names.value[prop] ?? prop
}
