import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { loadBackupState, loadSettings, reminderStatus, type ReminderStatus } from '../core/backup'
import { OpQueue } from '../core/libraryQueue'
import { resolveCatalogUrl } from '../core/packs/catalogUrl'
import type { Services } from '../core/services'
import type { Settings } from '../schemas/campaign'

/** 应用级状态：服务（数据库、安装器、存档）、设置、备份提醒与库操作队列。 */
export const useAppStore = defineStore('app', () => {
  const services = shallowRef<Services | null>(null)
  const booted = ref(false)
  const bootError = ref('')
  const settings = ref<Settings | null>(null)
  const reminder = ref<ReminderStatus | null>(null)
  const queue = new OpQueue()

  function svc(): Services {
    if (!services.value) throw new Error('助手尚未启动完成')
    return services.value
  }

  function setServices(next: Services): void {
    services.value = next
  }

  async function refreshSettings(): Promise<Settings> {
    const loaded = await loadSettings(svc().db)
    settings.value = loaded
    return loaded
  }

  async function refreshBackup(): Promise<void> {
    const s = svc()
    const [state, config] = await Promise.all([loadBackupState(s.db), loadSettings(s.db)])
    settings.value = config
    reminder.value = reminderStatus(state, config, s.now())
  }

  function catalogUrl(): string {
    return resolveCatalogUrl(settings.value ?? { catalogUrl: 'https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json' })
  }

  return { services, booted, bootError, settings, reminder, queue, svc, setServices, refreshSettings, refreshBackup, catalogUrl }
})
