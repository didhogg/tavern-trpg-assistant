// 只在已核对的 Plutonium 版本借建卡组件。原件仍在 vendor；附给小窗的模块只增加出口。
/* eslint-disable @typescript-eslint/no-explicit-any -- 锁定的作者模块没有类型声明 */
import { sha256Hex } from '../../../core/hash'
import { readPrivatePlutoniumZh } from './plutonium-zh'

const BUNDLE_SHA = '13b1a03b99eab99f4b078e11075c7092c175a365d076d5319914f376c583e245'
const EXPORTS = [
  'Charactermancer_FeatureOptionsSelect',
  'Charactermancer_AdditionalFeatsSelect',
  'StatGenUtilAdditionalFeats',
  'DataPrimerFauxFeatureClassSubclassFeat',
  'DataPrimerFauxFeatureClassSubclassOptionalfeature',
  'UtilDataConverter',
  'Config',
  'Charactermancer_AvailableProficiencyManager',
  'CharactermancerFeatureSubCompManagerProficiencyOtherBase',
  'Charactermancer_ItemMasteries_Util',
  'Charactermancer_Class_Util',
  'Charactermancer_OtherProficiencySelect',
  'Charactermancer_ExpertiseSelect',
  'Charactermancer_ImmResVulnSelect',
  'UtilAdvancementsEntry',
  'UtilAdvancements',
  'ComponentUiUtil',
  'veE',
  'EQUIPMENT_TYPE_EXPANDERS',
  'UtilEntityItem',
]

export let plutoniumBuild: Record<string, any> | null = null

export async function loadKernelModule(url: URL, usePrivateZh = false): Promise<void> {
  if (!url.pathname.endsWith('/modules/plutonium/js/Bundle.js')) {
    await import(/* @vite-ignore */ url.href)
    return
  }
  const response = await fetch(url)
  if (!response.ok) throw Error(`读取 Plutonium 失败：${response.status}`)
  const text = await response.text()
  const actualUrl = new URL(response.url || url.href)
  if (sha256Hex(text) !== BUNDLE_SHA) {
    // 只有中文建卡小窗可以加载经指纹校验的本机中文构建。模块的其他文件仍按原路径读取。
    const privateBundle = new URL('../private/modules/plutonium/js/Bundle.js', location.href)
    const localized = usePrivateZh && actualUrl.href === privateBundle.href
      ? await readPrivatePlutoniumZh(text, new URL('../private/lang/zh/modules/plutonium/js/', location.href))
      : null
    if (localized !== null) await importBundle(localized, actualUrl)
    else await import(/* @vite-ignore */ actualUrl.href)
    return
  }
  plutoniumBuild = (await importBundle(text, url, `\nexport const buildAdapter = { ${EXPORTS.join(', ')} };\n`)).buildAdapter
}

async function importBundle(text: string, url: URL, extra = '') {
  // 临时模块没有脚本原来的相对目录。此版本唯一的相对 import 是作者的编辑器，
  // 仍指向原目录；规则、数据及作者其余代码原样执行。
  const source = text.replace("import('../lib/ace.js')", `import(${JSON.stringify(new URL('../lib/ace.js', url).href)})`)
  const blob = URL.createObjectURL(new Blob([source, extra, `\n//# sourceURL=${url.href}\n`], { type: 'text/javascript' }))
  try { return await import(/* @vite-ignore */ blob) } finally { URL.revokeObjectURL(blob) }
}
