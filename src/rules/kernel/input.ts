// 结算小窗的启动输入（蓝图 §3.1）：系统、模块、版本信息全部从插件自带的 vendor/foundry/ 读，
// 由录制工具生成的 manifest.json 说了算（用哪个系统、启用哪些模块），这里不写死名单。
import type { KernelInput } from './frame/world'
import { hashValue } from '../../core/hash'
import { sha256Hex } from '../../core/hash'

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

/**
 * 结算模式：结算内核只算数、不要图片（图片只存链接，见设计）。Plutonium 导入时为了给条目配图，
 * 会把 dnd5e 自带资料包整包读进来逐条校验（怪物第一次导入约 8 秒，全花在这里）。
 * 这里只用 Plutonium 自己的官方选项关掉“为找图读资料包”，不碰规则数据的合并；
 * 已用 8 类 246 条真实条目比对：关前关后除图片外逐项一致（tests/e2e/library/kernel-mode.mjs）。
 * Plutonium 启动时读世界设置 plutonium.config，缺的项自动补默认值。加一项 = 加一行。
 */
const KERNEL_MODE_SETTINGS: Record<string, unknown> = {
  'plutonium.config': {
    // 结算小窗离线自足：不加载作者站点的 prerelease/homebrew 索引（会去 GitHub，断网报错）。
    // 放在 import 组里让作者自己的配置迁移搬到 dataSources；直接写 dataSources 会被默认值盖掉。
    import: { isSkipCompendiumImageFetch: true, isNoPrereleaseBrewIndexes: true },
    importCreature: { isUseTokenImageAsPortrait: true },
    importVehicle: { isUseTokenImageAsPortrait: true },
    importObject: { isUseTokenImageAsPortrait: true },
  },
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
  const allSettings = { ...KERNEL_MODE_SETTINGS, ...settings }
  const frame = await (await fetchImpl(new URL('dist/kernel-frame.js', opts.pluginRoot))).text()
  const cacheKey = hashValue({ release: manifest.release, system: manifest.system, modules: manifest.modules, settings: allSettings, rule: opts.rule, frame: sha256Hex(frame) })
  return {
    system, modules, release: manifest.release,
    world: opts.world,
    userId: 'kernelGM00000000', worldTime: 0, language: 'en.core',
    settings: allSettings,
    cacheKey,
    documents: { actors: [] },
  }
}
