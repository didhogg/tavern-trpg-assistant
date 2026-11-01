import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { lib } from '../../tests/data/consumer/load'
import { raw5e } from '../../tests/data/consumer/ref5etools'
import { rec } from '../../tests/data/consumer/util'

/**
 * 生成 tools/data/fix/rows/s1-artificer-list.ts：奇械师（TCE）的完整法术表，来源 5etools 生成数据 gendata-spell-source-lookup
 * （TCE 里 class=奇械师 的全部法术，以及 classVariant 里记的 XGE 定义的法术——霜咬术、投石术等 15 个，原来只看 class 会漏掉）→ 库里同名法术的编号。第 1 站用过一次；产出文件已提交，不要重新生成。
 * 注意：要在「还没有这条锚点」的库上跑（lib() 读的是已构建的包）。
 */
const l = lib()
const lookup = rec(raw5e('generated/gendata-spell-source-lookup.json'))
const byCn = new Map(l.of('spell').map((s) => [s.name, s]))
const ids: string[] = []
for (const bucket of Object.values(lookup)) for (const [cn, info] of Object.entries(rec(bucket))) if (rec(rec(rec(info).class).TCE)['奇械师'] || rec(rec(rec(info).classVariant).TCE)['奇械师']) { const sp = byCn.get(cn); if (sp) ids.push(sp.id) }
const sorted = [...new Set(ids)].sort()
const body = `import type { Fix } from '../engine'
import type { Entry } from '../../../../src/schemas/pack'

/**
 * 奇械师（TCE）的完整法术表：PHB、XGE 的法术包不能指向塔莎里的奇械师（依赖只能向下），所以由塔莎包里的一个「锚点」特性登记（spellLists，见 01 C4）。
 * 来源：5etools 生成数据 gendata-spell-source-lookup 里 TCE 的奇械师法术表；${sorted.length} 个，库里都有（另有 5 个出自没收录的书，不列，见登记 a16b-artificer-source-not-in-library）。
 * 核对：TCE 英文原书第 2 章奇械师法术列表（第 1 站报告里逐环对过）。
 */
const SPELLS = ${JSON.stringify(sorted, null, 2)}

const entry: Entry = {
  id: 'feature.artificer-spell-list.tce',
  type: 'feature',
  name: '奇械师法术列表',
  nameEn: 'Artificer Spell List',
  keywords: ['奇械师法术列表', 'Artificer Spell List'],
  unique: false,
  summary: '奇械师法术列表｜把玩家手册、珊娜萨的万事指南里的法术登记进奇械师的法术表。',
  data: {
    activities: [],
    credit: { by: '本项目', license: 'CC-BY-NC-SA-4.0', machine: false, missing: [], srd: false },
    role: 'procedure',
    src: { book: 'TCE', page: 12 },
    text: [{ p: '本条目把下列法术登记进奇械师的法术表（奇械师的法术表由塔莎的万事坩埚收录；玩家手册、珊娜萨的万事指南里的法术不能反过来指向奇械师）。' }],
    spellLists: [{ to: 'class.artificer.tce', spells: SPELLS }],
  },
  i18n: { en: { name: 'Artificer Spell List', summary: 'Artificer Spell List | Registers spells from the Player’s Handbook and Xanathar’s Guide to Everything into the artificer spell list.', fields: { text: [{ p: 'This entry registers the spells below into the artificer spell list (the artificer lives in Tasha’s Cauldron of Everything; spells in the Player’s Handbook and Xanathar’s Guide cannot point back to it).' }] } } },
} as unknown as Entry

export const ROWS: Fix[] = [{ op: 'add', pack: 'dnd5e2014-tce', entry, basis: '5etools gendata-spell-source-lookup（TCE 奇械师法术表）；TCE 第 2 章奇械师法术列表' }]
`
writeFileSync(join(process.cwd(), 'tools/data/fix/rows/s1-artificer-list.ts'), body)
console.log('奇械师法术', sorted.length)
