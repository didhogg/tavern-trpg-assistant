/** 英文名转写成 id 片段：小写、空格改短横线、+1 写成 plus-1、去掉撇号与其他符号。 */
export function slug(input: string): string {
  const value = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\+\s*(\d+)/g, ' plus $1 ')
    .replace(/['’`]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  return value || 'entry'
}

export function titleCaseBook(source: string): string {
  return source.toLowerCase()
}
