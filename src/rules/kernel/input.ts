// 结算小窗的启动输入（蓝图 §3.1）：系统、模块、版本信息全部从插件自带的 vendor/foundry/ 读，
// 由录制工具生成的 manifest.json 说了算（用哪个系统、启用哪些模块），这里不写死名单。
import type { KernelInput } from './frame/world'

interface VendorManifest {
  release: KernelInput['release']
  /** 例："dnd5e 6.1.0"。 */
  system: string
  /** 模块编号 → 版本。 */
  modules: Record<string, string>
}

/** 规则档设置：2014 规则在 dnd5e 里叫 legacy。加一种规则 = 加一行。 */
const RULE_SETTINGS: Record<string, Record<string, unknown>> = {
  dnd5e2014: { 'dnd5e.rulesVersion': 'legacy', 'dnd5e.firstRun': false },
}

async function readJson<T>(pluginRoot: URL, path: string, fetchImpl: typeof fetch): Promise<T> {
  const response = await fetchImpl(new URL(`vendor/foundry/${path}`, pluginRoot))
  if (!response.ok) throw new Error(`读取结算内核文件失败（${response.status}）：${path}`)
  return response.json() as Promise<T>
}

/** 一个战役一个世界：世界编号用战役的 ownerKey，人物由重建/建卡放进去，所以启动时世界是空的。 */
export async function kernelInput(opts: {
  pluginRoot: URL
  rule: string
  world: { id: string; title: string }
  fetchImpl?: typeof fetch
}): Promise<KernelInput> {
  const fetchImpl = opts.fetchImpl ?? fetch
  const settings = RULE_SETTINGS[opts.rule]
  if (!settings) throw new Error(`结算内核还不支持这个规则：${opts.rule}`)
  const manifest = await readJson<VendorManifest>(opts.pluginRoot, 'manifest.json', fetchImpl)
  const systemId = manifest.system.split(' ')[0]
  const system = await readJson<unknown>(opts.pluginRoot, `systems/${systemId}/system.json`, fetchImpl)
  const modules = await Promise.all(Object.keys(manifest.modules).map((id) => readJson<unknown>(opts.pluginRoot, `modules/${id}/module.json`, fetchImpl)))
  return {
    system, modules, release: manifest.release,
    world: opts.world,
    userId: 'kernelGM00000000', worldTime: 0, language: 'en.core',
    settings,
    documents: { actors: [] },
  }
}
