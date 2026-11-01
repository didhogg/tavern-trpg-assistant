import type { Entry } from '../../../../src/schemas/pack'

export function newSrdItem(id: string, name: string, nameEn: string, page: number, value?: number, weight?: number): Entry {
  return {
    id,
    type: 'item',
    name,
    nameEn,
    keywords: [name, nameEn],
    unique: false,
    summary: `${name}｜装备·普通`,
    i18n: { en: { name: nameEn, fields: {} } },
    data: {
      src: { book: 'PHB', page },
      credit: { by: '不全书', license: 'GPL-3.0', machine: false, missing: [], srd: true, structured: { by: '5etools', license: 'MIT' } },
      text: [],
      category: 'gear',
      rarity: 'none',
      attunement: { required: false },
      tags: ['G'],
      properties: [],
      lootTables: [],
      ...(value === undefined ? {} : { value }),
      ...(weight === undefined ? {} : { weight }),
    },
  }
}
