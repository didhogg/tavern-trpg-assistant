// P3 收尾真机验证入口（设置 › 诊断）：只经插件服务入口（createServices().backend）走一遍全线基础后端：
// 【库】装中英官方 → 打开结算内核 → 用【库】真实条目建英雄、导入怪物、真实攻击 → 预览 / 写入 / 撤销 / 再写
// → 存档（只存引用）→ 关书报缺 / 开书 0 缺 → 关掉结算内核 → 读档 → 按引用重建 → 和存档前逐项比。
// 用单独的用户数据库（不碰玩家真实战役）；【库】用正式库（装的官方数据本来就要用）。
import { storageEstimate } from '../library/install'
import { defaultCampaignLibrary } from '../library/scopes'
import { kernelCampaignSchema } from '../schemas/kernel'
import { differences, pickChain } from './backendChain'
import { probeServices } from './services'
import { guard, setResult } from './store'
import type { ProbeModule } from './types'

const ID = 'backend-p3'
const TITLE = 'P3 全线后端真机验证'
const OWNER = { ownerKey: 'probe:p3-backend', ownerLabel: 'P3 全线后端真机验证' }
const RULE = 'dnd5e2014'

const svc = probeServices

type Step = { step: string; ms: number; ok: boolean; note?: unknown }

async function timed<T>(steps: Step[], step: string, run: () => Promise<T>, check: (v: T) => boolean = () => true, note?: (v: T) => unknown): Promise<T> {
  const t = performance.now()
  setResult(ID, TITLE, 'waiting', `进行中：${step}…`)
  const value = await run()
  const ok = check(value)
  steps.push({ step, ms: Math.round(performance.now() - t), ok, note: note?.(value) })
  if (!ok) throw new Error(`${step} 没通过：${JSON.stringify(note?.(value) ?? value).slice(0, 300)}`)
  return value
}

function hpOf(data: Record<string, unknown> | null): unknown {
  return (data?.system as { attributes?: { hp?: { value?: unknown } } } | undefined)?.attributes?.hp?.value
}

async function chain(): Promise<void> {
  const s = svc()
  const { library: L, kernel, kernelSave } = s.backend
  const steps: Step[] = []
  const library = defaultCampaignLibrary(RULE, 'cn')

  await kernel.close(OWNER.ownerKey)
  await s.db.workspaces.clear()
  await s.db.saves.clear()
  await timed(steps, '新战役并绑定结算内核', async () => {
    await s.campaign.startNewCampaign({ ...OWNER, ruleId: RULE, name: TITLE })
    return kernelSave.bind(OWNER.ownerKey, kernelCampaignSchema.parse({ rule: RULE, kernelVersion: 1, library, dataVersion: await L.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] }))
  })
  const picked = await timed(steps, '从【库】挑真实条目', () => pickChain(L.service, L.scoped, library), () => true,
    (v) => [...v.build, ...v.equipment, v.monster].map((r) => r.label))
  const { session, bootMs } = await timed(steps, '打开结算内核（官方 Foundry + dnd5e + Plutonium）', () => kernel.session(OWNER.ownerKey), () => true, (v) => ({ bootMs: v.bootMs }))
  steps.push({ step: '结算内核启动耗时', ms: bootMs, ok: true })

  const imported = await timed(steps, '导入条目（Plutonium）', async () => {
    const out: unknown[] = []
    for (const row of [...picked.build, ...picked.equipment]) {
      const r = await session.call('importForBuild', row.ref.prop, row.entry)
      if (r.status !== 'complete') throw new Error(`导入 ${row.label} 失败：${r.error ?? r.status}`)
      out.push(r.result)
    }
    return out
  })
  const keyOf = (r: { set: string; prop: string; hash: string }) => `${r.set}|${r.prop}|${r.hash}`
  const rows = [
    ...picked.build.map((row: { ref: { set: string; prop: string; hash: string }; entry: unknown }, i: number) => ({ prop: row.ref.prop, refKey: keyOf(row.ref), entry: row.entry, data: imported[i] })),
    ...picked.equipment.map((row: { ref: { set: string; prop: string; hash: string }; entry: unknown }, i: number) => ({ prop: row.ref.prop, refKey: keyOf(row.ref), entry: row.entry, data: imported[picked.build.length + i] })),
  ]
  const built = await timed(steps, '建英雄（dnd5e 成长流程）', () => session.call('buildCharacter', { name: '真机英雄', items: rows.slice(0, 3), equipment: rows.slice(3) }),
    (r) => r.status === 'complete', (r) => ({ status: r.status, level: r.result?.level }))
  const heroId = built.result.id as string
  await kernel.remember(OWNER.ownerKey, heroId)
  const monster = await timed(steps, '导入怪物', () => session.call('importMonsterActor', picked.monster.entry), (r) => r.status === 'complete')
  const monsterId = monster.result.id as string
  await kernel.remember(OWNER.ownerKey, monsterId)

  await timed(steps, '人物写进存档（只存引用）', async () => {
    const actors = await kernel.compact(OWNER.ownerKey, [heroId, monsterId])
    const bound = await kernelSave.read(OWNER.ownerKey)
    if (!bound) throw new Error('绑定丢了')
    return kernelSave.bind(OWNER.ownerKey, kernelCampaignSchema.parse({ ...bound, actors: actors.map((a) => ({ ...a, adjustments: {}, dice: [] })) }))
  }, (k) => k.actors.every((a) => a.refs.length > 0), (k) => k.actors.map((a) => ({ name: a.name, refs: a.refs.length })))

  const fight = await timed(steps, '英雄攻击怪物（真实伤害）', async () => {
    const hero = (await session.call('preparedActors')).find((a) => a.source._id === heroId)?.source as { items: Array<{ _id: string; type: string; system?: { damage?: { base?: { types?: string[] } } } }> }
    const weapon = hero.items.find((i) => i.type === 'weapon')
    if (!weapon) throw new Error('英雄没有武器')
    const attack = await session.call('attack', heroId, weapon._id, [20, 4, 4, 4, 4, 4, 4, 4])
    const total = (attack.result as { damage?: Array<{ total?: number }> } | null)?.damage?.[0]?.total
    if (!total) throw new Error(`攻击没有伤害：${attack.status}`)
    const damage = await session.call('damage', monsterId, [{ value: total, type: weapon.system?.damage?.base?.types?.[0] ?? 'slashing' }], [], {})
    // 一次操作的全部改动（攻击本身也会改武器上的记录）一起交给存档
    return { total, status: damage.status, changes: [...attack.changes, ...damage.changes] }
  }, (r) => r.status === 'complete' && r.changes.length > 0, (r) => ({ damage: r.total, changes: r.changes.length }))

  await timed(steps, '预览 → 写入 → 撤销 → 再写（经服务入口拆人物）', async () => {
    const preview = await kernelSave.preview(OWNER.ownerKey, fight.changes)
    const applied = await kernelSave.apply(OWNER.ownerKey, fight.changes, preview.revision)
    const undone = await kernelSave.undo(OWNER.ownerKey, applied.kernel.revision)
    const again = await kernelSave.apply(OWNER.ownerKey, fight.changes, undone?.kernel.revision ?? -1)
    return { rows: preview.rows.length, revisions: [preview.revision, applied.kernel.revision, undone?.kernel.revision, again.kernel.revision] }
  }, (r) => r.rows > 0 && r.revisions.join() === '0,1,2,3', (r) => r)

  const before = {
    hero: (await session.call('preparedActors')).find((a) => a.source._id === heroId)?.source ?? null,
    monster: (await session.call('preparedActors')).find((a) => a.source._id === monsterId)?.source ?? null,
  }
  const saved = await timed(steps, '保存存档', async () => {
    await kernelSave.save(OWNER.ownerKey)
    const ws = await s.campaign.getWorkspace(OWNER.ownerKey)
    const slot = ws?.currentSaveId ? await s.campaign.getSave(ws.currentSaveId) : null
    if (!slot) throw new Error('没有存档')
    return { id: slot.id, kernelBytes: JSON.stringify((slot.snapshot as Record<string, unknown>).kernel).length, fullBytes: JSON.stringify(before).length }
  }, (r) => r.kernelBytes < r.fullBytes, (r) => ({ kernelBytes: r.kernelBytes, fullActorBytes: r.fullBytes }))

  await timed(steps, '关书报缺（本战役排除 PHB、MM）→ 开书 0 缺', async () => {
    await kernelSave.setLibrary(OWNER.ownerKey, { ...library, exclude: ['src:phb', 'src:mm'] })
    const closed = await kernelSave.check(OWNER.ownerKey)
    await kernelSave.setLibrary(OWNER.ownerKey, library)
    const open = await kernelSave.check(OWNER.ownerKey)
    return { closed: closed.missing.length, labels: closed.missing.map((m) => m.ref.label), open: open.missing.length, checked: open.checked }
  }, (r) => r.closed === r.checked && r.closed > 0 && r.open === 0, (r) => r)

  await timed(steps, '关掉结算内核 → 读档（读前检查）', async () => {
    await kernel.close(OWNER.ownerKey)
    return s.campaign.loadSave(OWNER, saved.id, { precheck: async (slot) => {
      const c = await kernelSave.checkSave(slot.id)
      if (c.missing.length) throw new Error(`缺 ${c.missing.length} 条`)
    } })
  })
  const stored = await kernelSave.read(OWNER.ownerKey)
  if (!stored) throw new Error('读档后没有内核段')
  const rebuilt: Array<{ name: string; sameId: boolean; diffs: number; sample: unknown; hp: [unknown, unknown] }> = []
  for (const actor of stored.actors) {
    const r = await timed(steps, `按引用重建：${actor.name}`, () => kernel.rebuild(OWNER.ownerKey, actor), (v) => v.status === 'complete', (v) => ({ status: v.status, error: v.error, missing: v.missing?.length }))
    const original = actor.id === heroId ? before.hero : before.monster
    const diffs = differences(original, r.data ?? null)
    rebuilt.push({ name: actor.name, sameId: r.id === actor.id, diffs: diffs.length, sample: diffs.slice(0, 3), hp: [hpOf(original), hpOf(r.data ?? null)] })
  }
  const pass = rebuilt.every((r) => r.sameId && r.diffs === 0)
  const total = steps.reduce((n, x) => n + x.ms, 0)
  setResult(ID, TITLE, pass ? 'pass' : 'fail',
    `${pass ? '全线通过' : '重建有差别'}：${rebuilt.map((r) => `${r.name} 差 ${r.diffs} 处、HP ${String(r.hp[0])}→${String(r.hp[1])}`).join('；')}；存档内核段 ${saved.kernelBytes} 字节；结算内核启动 ${Math.round(bootMs / 1000)} 秒；合计 ${Math.round(total / 1000)} 秒；当前${navigator.onLine ? '联网' : '断网'}`,
    { steps, rebuilt })
}

async function install(): Promise<void> {
  const { tasks } = svc().backend.library
  const report: Record<string, unknown> = {}
  for (const id of ['cn-official', 'en-official']) {
    const t = performance.now()
    const task = tasks.startOfficial(id)
    const timer = setInterval(() => {
      const st = tasks.get(task)
      if (st) setResult(ID, TITLE, 'waiting', `安装 ${id}：${st.progress.stage} ${st.progress.done}/${st.progress.total}`)
    }, 1000)
    const done = await tasks.wait(task).finally(() => clearInterval(timer))
    report[id] = { status: done.status, error: done.error, seconds: Math.round((performance.now() - t) / 1000) }
    if (done.status !== 'done') {
      setResult(ID, TITLE, 'fail', `安装 ${id} 没完成：${done.error ?? done.status}`, report)
      return
    }
  }
  setResult(ID, TITLE, 'pass', `中英官方都装好：${Object.entries(report).map(([k, v]) => `${k} ${(v as { seconds: number }).seconds} 秒`).join('，')}`, report)
}

async function space(): Promise<void> {
  const e = await storageEstimate()
  const mb = (n: number | null) => (n === null ? '未知' : `${Math.round(n / 1048576)}MB`)
  setResult(ID, TITLE, 'info', `存储：已用 ${mb(e.usage)} / 可用上限 ${mb(e.quota)}；持久存储 ${e.persisted === null ? '未知' : e.persisted ? '已授予' : '未授予'}`, e)
}

export function createBackendProbe(): ProbeModule {
  return {
    id: ID,
    title: TITLE,
    hint: '依次点：①装中英官方（联网，第一次要几分钟；装过的会跳过）②全线验证（建英雄、打怪物、写入撤销、存档、关书开书、读档重建）③存储空间 ④关掉网络、完全退出酒馆再打开，再点②（断网全线验证）。最后点“复制报告”发给开发者。',
    actions: [
      { label: '①装中英官方', run: () => guard(ID, TITLE, install) },
      { label: '②全线验证（断网时即断网验证）', run: () => guard(ID, TITLE, chain) },
      { label: '③存储空间', run: () => guard(ID, TITLE, space) },
    ],
  }
}
