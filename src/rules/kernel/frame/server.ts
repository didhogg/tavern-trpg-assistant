// 结算小窗里的“本地服务器”：官方客户端经 Socket.IO 发给服务器的请求在这里回答（蓝图 §2.3 的 ★ 处）。
// 只替换发送出口，客户端自己的文档生命周期照常运行。写入不保存，记进变更计划（蓝图 §3.3）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 请求体是官方客户端的原始结构。 */

export interface ChangeRecord { action: 'create' | 'update' | 'delete'; type: string; pack: string | null; parentUuid: string | null; data: any }

export interface ServerOptions {
  userId: string
  worldTime: number
  /** 原始资料包（只读）；按需向插件要。 */
  readPack(id: string): Promise<any[]>
  /** 读小窗目录下的文件原文（模板等）。 */
  readText(path: string): Promise<string>
}

/** 按官方请求给的索引字段取值，不手填字段表。 */
function indexEntry(document: any, fields: string[]): any {
  const entry: any = {}
  for (const path of fields) {
    const parts = path.split('.')
    if (parts.some(k => ['__proto__', 'constructor', 'prototype'].includes(k))) throw Error('Unsafe index path')
    const value = parts.reduce((v: any, k) => v?.[k], document)
    if (value === undefined) continue
    let target = entry
    const leaf = parts.pop() as string
    for (const key of parts) target = target[key] ??= {}
    target[leaf] = value
  }
  return entry
}

export function createServer(socket: any, options: ServerOptions): { changes: ChangeRecord[]; calls: any[] } {
  const g = globalThis as any
  const changes: ChangeRecord[] = []
  const calls: any[] = []
  const temporary = new Map<string, any[]>()
  const world = new Map<string, any[]>()
  let sequence = 0
  const emit = socket.emit.bind(socket)
  const packDocuments = async (id: string): Promise<any[]> => temporary.get(id) ?? options.readPack(id)

  async function modifyDocument(request: any): Promise<any> {
    const operation = request.operation
    const pack = operation.pack ?? null
    if (request.action === 'get') {
      if (!pack) return []
      const query = operation.query ?? {}
      if (Object.keys(query).some(k => k !== '_id')) throw Error(`Unsupported pack query: ${JSON.stringify(query)}`)
      const documents = await packDocuments(pack)
      const found = query._id ? documents.filter(d => d._id === query._id) : documents
      if (!operation.index) return structuredClone(found)
      if (!Array.isArray(operation.indexFields)) throw Error('Official index request has no fields')
      return found.map(d => indexEntry(d, operation.indexFields))
    }
    if (pack && !temporary.has(pack)) throw Error(`Original pack is read-only: ${pack}`)
    const parentUuid = operation.parentUuid ?? null
    const store = pack ? temporary.get(pack)! : (world.get(request.type) ?? world.set(request.type, []).get(request.type)!)
    if (request.action === 'create') {
      const created = operation.data.map((source: any) => {
        const data = structuredClone(source)
        // 与服务器一致：未要求保留编号时一律发新编号。
        if (!operation.keepId || !data._id) data._id = `kernel${String(++sequence).padStart(10, '0')}`
        return data
      })
      if (!parentUuid) store.push(...created)
      for (const data of created) changes.push({ action: 'create', type: request.type, pack, parentUuid, data })
      return created
    }
    if (request.action === 'update') {
      for (const data of operation.updates) changes.push({ action: 'update', type: request.type, pack, parentUuid, data: structuredClone(data) })
      return operation.updates
    }
    if (request.action === 'delete') {
      for (const id of operation.ids) changes.push({ action: 'delete', type: request.type, pack, parentUuid, data: { _id: id } })
      return operation.ids
    }
    throw Error(`Unsupported document operation: ${request.action}`)
  }

  socket.emit = function(event: string, ...args: any[]) {
    // 与真实 Socket.IO 一样在发送边界固定为 JSON，不保留之后会被生命周期改写的引用。
    const payload = JSON.parse(JSON.stringify(args.filter(a => typeof a !== 'function')))
    calls.push({ event, args: payload })
    const callback = typeof args.at(-1) === 'function' ? args.at(-1) : null
    const reply = (promise: Promise<any>, wrap: (value: any) => any): void => {
      promise.then(value => callback(wrap(value)), (error: Error) => callback({ error: { message: error.message } }))
    }
    if (event === 'template') return reply(options.readText(args[0]), html => ({ html }))
    if (event === 'time') return callback({ serverTime: Date.now(), worldTime: options.worldTime })
    if (event === 'modifyDocument') {
      const request = payload[0]
      return reply(modifyDocument(request), result => ({ ...request, userId: options.userId, result }))
    }
    if (event === 'modifyDocumentBatch') {
      // v14 批量写入：逐个按单个写入回答，结果放进 results。
      const requests: any[] = payload[0]
      return reply(Promise.all(requests.map(async r => ({ ...r, userId: options.userId, result: await modifyDocument(r) }))), results => ({ results }))
    }
    if (event === 'manageCompendium') {
      const request = payload[0]
      if (request.action !== 'create') return callback({ error: { message: `Unsupported compendium operation: ${request.action}` } })
      const definition = [...new g.foundry.packages.World({ ...g.game.world.toObject(), packs: [request.data] }).packs][0]
      const id = `${request.data.package}.${definition.name}`
      temporary.set(id, [])
      return callback({ request, result: { ...definition, id, packageType: 'world', packageName: g.game.world.id, system: g.game.system.id, index: [], folders: [] } })
    }
    // 一人世界没有其他客户端：不带回调的广播交给未连接的原件（只排队，不发出）。
    if (!callback) return emit(event, ...args)
    return callback({ error: { message: `Unsupported server request: ${event}` } })
  }
  return { changes, calls }
}
