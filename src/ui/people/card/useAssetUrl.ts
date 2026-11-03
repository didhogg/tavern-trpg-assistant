import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import type { AssetRef } from '../../../schemas/text'
import { useAppStore } from '../../../stores/app'

/** 把字符串地址或图片仓库引用变成可显示的 URL；组件卸载时回收 object URL。 */
export function useAssetUrl(source: Ref<string | AssetRef | undefined>): Ref<string | undefined> {
  const app = useAppStore()
  const url = ref<string>()
  let objectUrl: string | undefined
  const revoke = (): void => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = undefined
  }
  watch(source, async (value) => {
    revoke()
    if (!value) { url.value = undefined; return }
    if (typeof value === 'string') { url.value = value; return }
    try {
      const blob = await app.svc().db.blobs.get(value.$asset)
      if (!blob) { url.value = undefined; return }
      const copy = new Uint8Array(blob.bytes.length)
      copy.set(blob.bytes)
      objectUrl = URL.createObjectURL(new Blob([copy.buffer], { type: blob.mime }))
      url.value = objectUrl
    } catch (error) {
      console.warn('[trpg-assistant] 读取图片失败', error)
      url.value = undefined
    }
  }, { immediate: true })
  onBeforeUnmount(revoke)
  return url
}
