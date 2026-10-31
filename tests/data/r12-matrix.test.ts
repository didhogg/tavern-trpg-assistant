import { describe, expect, it } from 'vitest'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'

const paths = Object.entries(FIELD_COVERAGE).filter(([path]) => path.startsWith('book.'))
const IMAGE_FIELDS = new Set(['href', 'path', 'hrefThumbnail', 'width', 'height', 'maxWidth', 'maxHeight', 'imageType', 'grid', 'distance', 'size', 'units', 'offsetX', 'offsetY', 'scale', 'mapParent', 'mapRegions', 'area', 'points', 'title', 'altText', 'credit', 'expectsLightBackground', 'quickrefKeep'])

describe('R12 覆盖矩阵', () => {
  it('464 条 book.* 路径全部登记，lost 为 0', () => {
    expect(paths).toHaveLength(464)
    expect(paths.filter(([, entry]) => entry.how === 'lost')).toEqual([])
  })

  it('text 路径不指向图片字段，且 to 全是 data.text', () => {
    const bad = paths.filter(([path, entry]) => entry.how === 'text' && entry.wp === 'R12' && (entry.to !== 'data.text' || IMAGE_FIELDS.has(path.split('.').pop()!.replace(/\[\]$/, ''))))
    expect(bad).toEqual([])
  })

  it('章节与节点 id/page、内部标记各有明确去向', () => {
    expect(FIELD_COVERAGE['book.data[].id']).toMatchObject({ how: 'mapped', to: 'data.anchor', wp: 'R12' })
    expect(FIELD_COVERAGE['book.data[].page']).toMatchObject({ how: 'mapped', to: 'data.src', wp: 'R12' })
    expect(FIELD_COVERAGE['book.data[].entries[].id']).toMatchObject({ how: 'mapped', to: 'data.outline', wp: 'R12' })
    expect(FIELD_COVERAGE['book.data[].entries[].page']).toMatchObject({ how: 'mapped', to: 'data.outline', wp: 'R12' })
    expect(FIELD_COVERAGE['book.data[].entries[].data']).toMatchObject({ how: 'dropped', kind: 'internal-meta' })
  })
})
