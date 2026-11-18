// p6-people-off.mjs 的场景（页面里跑）。第 1 步：操作判定与物品内嵌效果；第 2 步：取下 / 装回。

export async function offScenarios(page) {
  const step1 = await page.evaluate(async () => {
    globalThis.offE ??= globalThis.offEnv()
    const { h, owner, rt, people } = globalThis.offE
    const refs = await Promise.all([globalThis.offFind('race', 'Dwarf'), globalThis.offFind('background', 'Acolyte'), globalThis.offFind('class', 'Fighter'), globalThis.offFind('feat', 'Alert')])
    const made = await people.build(owner, { name: 'Off proof', items: refs, blank: true })
    if (made.built.status !== 'complete') throw Error(JSON.stringify(made.built))
    const id = made.built.id
    globalThis.offActor = id
    const data = async () => h.actorData((await rt.session(owner)).session, id)
    const init = async () => (await people.check(owner, id, 'initiative', undefined, [10])).outcome
    const out = {}
    const a0 = await data()
    const alert = a0.items.find((i) => i.name === 'Alert')
    const fx = alert.effects[0]
    out.before = (await init()).result?.[0]?.total
    out.hp0 = a0.system.attributes.hp.value
    // 物品里的效果：正式入口带物品编号停用
    const off = await people.edit(owner, id, [{ kind: 'effect', itemId: alert._id, effectId: fx._id, path: 'disabled', value: true }])
    out.off = { status: off.outcome.status, error: off.outcome.error ?? null, written: !!off.kernel, roll: (await init()).result?.[0]?.total }
    // 停用以后的无关操作：照常写入，不被诊断拖垮
    const dmg = await people.act(owner, id, 'damage', id, [{ value: 2, type: 'slashing' }], [], {})
    out.damage = { status: dmg.outcome.status, unsupported: dmg.outcome.unsupported, written: !!dmg.kernel, hp: (await data()).system.attributes.hp.value }
    // 关小窗按存档读回（第二次打开命中换算缓存，走「从基准建」那条路）
    await rt.close(owner)
    const loaded = await people.load(owner)
    const cold = await data()
    out.cold = { loaded: loaded.map((l) => l.status), roll: (await init()).result?.[0]?.total, disabled: cold.items.find((i) => i._id === alert._id).effects.find((e) => e._id === fx._id).disabled, hp: cold.system.attributes.hp.value }
    await people.undo(owner)
    const undone = await data()
    out.undo = { hp: undone.system.attributes.hp.value, disabled: undone.items.find((i) => i._id === alert._id).effects.find((e) => e._id === fx._id).disabled }
    // 真不支持的写法：照旧报出来，但改动照常写入
    const midiData = { name: 'P6 midi probe', type: 'base', transfer: false, system: { changes: [{ key: 'flags.midi-qol.advantage.all', type: 'add', value: '1', priority: 20 }] } }
    const midi = await people.edit(owner, id, [{ kind: 'effectCreate', data: midiData }])
    const midiId = (await data()).effects.find((e) => e.name === midiData.name)?._id
    const midiOff = await people.edit(owner, id, [{ kind: 'effect', effectId: midiId, path: 'disabled', value: true }])
    out.midi = { status: midi.outcome.status, keys: (midi.outcome.unsupported ?? []).map((u) => u.key), written: !!midi.kernel, offStatus: midiOff.outcome.status, offUnsupported: midiOff.outcome.unsupported?.length ?? null }
    // dnd5e 自己接管的写法（隐藏条目）：不误报「没有目标」
    const hideData = { name: 'P6 hide probe', type: 'base', transfer: false, system: { changes: [{ key: 'items.hidden', type: 'add', value: alert._id, priority: 20 }] } }
    const hide = await people.edit(owner, id, [{ kind: 'effectCreate', data: hideData }])
    out.hide = { status: hide.outcome.status, unsupported: hide.outcome.unsupported ?? null, written: !!hide.kernel }
    return out
  })
  const s = step1
  const checks = {
    embeddedEffectOff: s.off.status === 'complete' && s.off.written && s.off.roll < s.before,
    damageNotBlocked: s.damage.status === 'complete' && s.damage.written && s.damage.hp === s.hp0 - 2,
    coldKeepsOff: s.cold.loaded.every((x) => x === 'complete') && s.cold.disabled === true && s.cold.roll === s.off.roll && s.cold.hp === s.damage.hp,
    undoKeepsOff: s.undo.hp === s.hp0 && s.undo.disabled === true,
    midiStillReported: s.midi.status === 'unsupported' && s.midi.keys.includes('flags.midi-qol.advantage.all') && s.midi.written,
    disabledMidiQuiet: s.midi.offStatus === 'complete' && s.midi.offUnsupported === 0,
    hiddenNotMisreported: s.hide.status === 'complete' && s.hide.written,
  }
  return { checks, step1 }
}
