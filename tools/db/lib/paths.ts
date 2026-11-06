import { join } from 'node:path'
import { REFERENCE_ROOT } from '../../data/lib/io'

export { REFERENCE_ROOT }

/** 参考库（只读）。本目录下的代码只读它们，任何写入都只发生在 OUT_ROOT。 */
export const REF = {
  cn: join(REFERENCE_ROOT, '5etools-cn-main', 'data'),
  en: join(REFERENCE_ROOT, '5etools-src-main', 'data'),
  cnBak: join(REFERENCE_ROOT, '5etools-cn-main', 'data-bak'),
}
/** 5etools 两个仓库的根（data 的上一级）：代码（js、node、test）在这里。 */
export const REPO = { cn: join(REFERENCE_ROOT, '5etools-cn-main'), en: join(REFERENCE_ROOT, '5etools-src-main') }

/** 新库输出（本机文件夹，不建仓库）；换位置用环境变量 TRPG_DB_OUT。 */
export const OUT_ROOT = process.env.TRPG_DB_OUT ?? '/Users/xxx/tavern-trpg-data-next'
export const RAW_DB = join(OUT_ROOT, '原样库.sqlite')
export const REPORT_DIR = join(OUT_ROOT, 'report')
