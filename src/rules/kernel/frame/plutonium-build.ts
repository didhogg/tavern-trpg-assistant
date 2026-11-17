// 只在已核对的 Plutonium 版本借建卡组件。原件仍在 vendor；附给小窗的模块只增加出口。
/* eslint-disable @typescript-eslint/no-explicit-any -- 锁定的作者模块没有类型声明 */
import { sha256Hex } from '../../../core/hash'

const BUNDLE_SHA = '05e6e89fe53681d238db3024a23a24268dc69993b72ebe16591a6a3d8df98cf5'
const EXPORTS = [
  'Charactermancer_FeatureOptionsSelect',
  'Charactermancer_AvailableProficiencyManager',
  'CharactermancerFeatureSubCompManagerProficiencyOtherBase',
  'Charactermancer_ItemMasteries_Util',
  'Charactermancer_Class_Util',
  'Charactermancer_OtherProficiencySelect',
  'Charactermancer_ImmResVulnSelect',
  'ComponentUiUtil',
  'veE',
]

export let plutoniumBuild: Record<string, any> | null = null

export async function loadKernelModule(url: URL): Promise<void> {
  if (!url.pathname.endsWith('/modules/plutonium/js/Bundle.js')) {
    await import(/* @vite-ignore */ url.href)
    return
  }
  const response = await fetch(url)
  if (!response.ok) throw Error(`读取 Plutonium 失败：${response.status}`)
  const text = await response.text()
  if (sha256Hex(text) !== BUNDLE_SHA) {
    await import(/* @vite-ignore */ url.href)
    return
  }
  // 临时模块没有脚本原来的相对目录。此版本唯一的相对 import 是作者的编辑器，
  // 仍指向原目录；规则、数据及作者其余代码原样执行。
  const source = text.replace("import('../lib/ace.js')", `import(${JSON.stringify(new URL('../lib/ace.js', url).href)})`)
  const blob = URL.createObjectURL(new Blob([source, `\nexport const buildAdapter = { ${EXPORTS.join(', ')} };\n//# sourceURL=${url.href}\n`], { type: 'text/javascript' }))
  try { plutoniumBuild = (await import(/* @vite-ignore */ blob)).buildAdapter } finally { URL.revokeObjectURL(blob) }
}
