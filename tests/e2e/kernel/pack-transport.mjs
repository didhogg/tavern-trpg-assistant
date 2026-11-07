// 官方测试页向服务器读取资料包的出口。资料来自作者原件；索引字段由官方请求指定。
export async function exposePackReads(page, packs) {
  const transient = new Map()
  const world = new Map()
  let sequence = 0
  await page.exposeFunction('__kernelCreateTemporaryPack', metadata => {
    if (packs[metadata.id] || transient.has(metadata.id)) throw Error(`Pack already exists: ${metadata.id}`)
    transient.set(metadata.id, [])
    return metadata
  })
  await page.exposeFunction('__kernelReadOriginalPack', (request, updatedSources = []) => {
    const operation = request.operation
    const original = operation.pack && packs[operation.pack]
    if (original && request.action !== 'get') throw Error(`Original pack is read-only: ${operation.pack}`)
    // 内嵌文档写入（parentUuid）与结算小窗 server.ts 一致：只回答，不另存。
    const embedded = Boolean(operation.parentUuid)
    if (!operation.pack && !world.has(request.type)) world.set(request.type, [])
    const documents = original ?? (operation.pack ? transient.get(operation.pack) : world.get(request.type))
    if (!documents) throw Error(`Missing pack: ${operation.pack}`)
    if (request.action === 'create') {
      const added = operation.data.map(source => {
        const data = structuredClone(source)
        if (!operation.keepId || !data._id) data._id = `kernel${String(++sequence).padStart(10, '0')}`
        return data
      })
      if (!embedded) documents.push(...added)
      return added
    }
    if (request.action === 'update' && embedded) return operation.updates
    if (request.action === 'delete') return operation.ids
    if (request.action === 'update') {
      // 批量写入不带快照：与结算小窗一致只回答改动；单个写入仍保存快照供之后读取。
      if (!updatedSources.length) return operation.updates
      if (updatedSources.length !== operation.updates.length) throw Error('Missing canonical update sources')
      for (const source of updatedSources) {
        const index = documents.findIndex(d => d._id === source._id)
        if (index < 0) documents.push(source)
        else documents[index] = source
      }
      return operation.updates
    }
    if (request.action !== 'get') throw Error(`Unimplemented oracle storage operation: ${request.action}`)
    const query = operation.query ?? {}
    if (Object.keys(query).some(k => k !== '_id')) throw Error(`Unsupported oracle query: ${JSON.stringify(query)}`)
    if (query._id && typeof query._id !== 'string') throw Error(`Unsupported oracle id query: ${JSON.stringify(query._id)}`)
    const found = query._id ? documents.filter(d => d._id === query._id) : documents
    if (!operation.index) return found
    if (!Array.isArray(operation.indexFields)) throw Error('Official index request has no fields')
    return found.map(document => {
      const entry = {}
      for (const path of operation.indexFields) {
        const parts = path.split('.')
        if (parts.some(k => ['__proto__', 'constructor', 'prototype'].includes(k))) throw Error('Unsafe index path')
        const value = parts.reduce((v, k) => v?.[k], document)
        if (value === undefined) continue
        let target = entry
        const leaf = parts.pop()
        for (const key of parts) target = target[key] ??= {}
        target[leaf] = value
      }
      return entry
    })
  })
}
