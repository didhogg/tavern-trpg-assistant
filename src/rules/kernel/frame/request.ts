import { CHANNEL, FRAME_PARAM, type FrameRequestBody } from '../../../library/runtime/protocol'

const frameToken = new URLSearchParams(location.search).get(FRAME_PARAM) ?? ''
let nextId = 1
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()

export function request(body: FrameRequestBody): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = 1_000_000 + nextId++
    pending.set(id, { resolve, reject })
    parent.postMessage({ channel: CHANNEL, type: 'request', frame: frameToken, id, ...body }, location.origin)
  })
}
addEventListener('message', event => {
  const d = event.data
  if (event.source !== parent || d?.channel !== CHANNEL || d.type !== 'response' || !pending.has(d.id)) return
  const p = pending.get(d.id)!
  pending.delete(d.id)
  if (d.ok) p.resolve(d.value)
  else p.reject(new Error(d.error))
})
