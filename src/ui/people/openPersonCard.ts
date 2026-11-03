import type { Person } from '../../schemas/people'

export interface PersonCardInput {
  id?: string
  draft?: Person
  from?: string
}

let handler: ((input: PersonCardInput) => void) | null = null

export function registerPersonCard(fn: (input: PersonCardInput) => void): () => void {
  handler = fn
  return () => { if (handler === fn) handler = null }
}

/** UNIT2 替换 PersonCardStub 时，调用方仍用这个入口。 */
export function openPersonCard(input: PersonCardInput): void {
  if (!handler) throw new Error('人物页面还没有打开')
  handler(input)
}
