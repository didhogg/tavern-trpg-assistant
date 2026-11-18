// p6-people-off.mjs 第 2 步场景：取下 / 装回经正式入口 people.setOff。
// 同名熟练两个来源（精灵 + 水手都给察觉）、子项粒度、三轮循环、原始选择不变、命中缓存读回、撤销、
// 指向不对 / 没有这一项的退回、期间别处改过存档退回、复制带上安排、属性提升（作者无单项程序 → 整条）、
// 整件取下、单个效果停用、体型、生命值。全部走作者自己的取下 / 装回程序。
// 授予 / 选择物品类成长同样走作者程序，但 5etools 经 Plutonium 建出的人身上没有这类成长（特性直接是物品），暂无实例可测。

export async function offStep2(page) {
  return page.evaluate(async () => {
    const { h, owner, rt, saves, people } = globalThis.offE
    const session = async () => (await rt.session(owner)).session
    const data = async (id) => h.actorData(await session(), id)
    const saved = async (id) => (await saves.read(owner)).actors.find((a) => a.id === id)
    const key = (item) => { const f = item.flags.plutonium; return `${f.propDroppable}|${f.source}|${f.hash}` }
    const traitOf = (item, grant) => Object.values(item.system.advancement ?? {}).find((a) => a.type === 'Trait' && (a.configuration?.grants ?? []).includes(grant))
    const prof = async (id, skill) => (await data(id)).system.skills[skill].value
    const out = {}

    // —— 同名熟练两个来源 ——
    const refs = await Promise.all([globalThis.offFind('race', 'Elf'), globalThis.offFind('background', 'Sailor'), globalThis.offFind('class', 'Fighter')])
    const made = await people.build(owner, { name: 'Overlap off', items: refs, blank: true })
    if (made.built.status !== 'complete') throw Error(JSON.stringify(made.built))
    const id = made.built.id
    const a0 = await data(id)
    const elf = a0.items.find((i) => i.type === 'race'), sailor = a0.items.find((i) => i.type === 'background')
    const elfAdv = traitOf(elf, 'skills:prc'), sailorAdv = traitOf(sailor, 'skills:prc')
    const elfOff = { ref: key(elf), advancement: elfAdv._id, part: 'skills:prc' }
    const sailorPrc = { ref: key(sailor), advancement: sailorAdv._id, part: 'skills:prc' }
    const sailorAth = { ref: key(sailor), advancement: sailorAdv._id, part: 'skills:ath' }
    const choices0 = JSON.stringify((await saved(id)).choices)
    out.overlap = { start: { prc: await prof(id, 'prc'), ath: await prof(id, 'ath') }, cycles: [] }
    for (let n = 0; n < 3; n++) {
      const one = await people.setOff(owner, id, [elfOff]); const elfOnly = { ok: one.ok, prc: await prof(id, 'prc') }
      const both = await people.setOff(owner, id, [elfOff, sailorPrc]); const bothOff = { ok: both.ok, prc: await prof(id, 'prc') }
      const back = await people.setOff(owner, id, []); const on = { ok: back.ok, prc: await prof(id, 'prc') }
      out.overlap.cycles.push({ elfOnly, bothOff, on })
    }
    const ath = await people.setOff(owner, id, [sailorAth])
    out.part = { ok: ath.ok, ath: await prof(id, 'ath'), prc: await prof(id, 'prc') }
    const roll = await people.check(owner, id, 'ability', 'wis', [10])
    const skill = (await (await session()).call('skill', id, 'ath', [10])).result?.[0]?.total
    out.part.athRoll = skill
    out.part.wisRoll = roll.outcome.result?.[0]?.total
    out.choicesKept = JSON.stringify((await saved(id)).choices) === choices0
    out.savedOff = (await saved(id)).off

    // —— 期间改生命：取下 / 装回不动游戏状态 ——
    await people.act(owner, id, 'damage', id, [{ value: 1, type: 'slashing' }], [], {})
    const hpHurt = (await data(id)).system.attributes.hp.value
    await people.setOff(owner, id, [sailorAth, elfOff])
    out.state = { hpHurt, afterOff: (await data(id)).system.attributes.hp.value, prc: await prof(id, 'prc'), ath: await prof(id, 'ath') }

    // —— 关小窗按存档读回（命中缓存）→ 撤销一步 ——
    await rt.close(owner)
    const loaded = await people.load(owner)
    out.cold = { loaded: loaded.map((l) => l.status), prc: await prof(id, 'prc'), ath: await prof(id, 'ath'), hp: (await data(id)).system.attributes.hp.value }
    await people.undo(owner)
    out.undo = { off: (await saved(id)).off, prc: await prof(id, 'prc'), ath: await prof(id, 'ath'), hp: (await data(id)).system.attributes.hp.value }

    // —— 指向不对 / 还不能取下：退回，存档不变 ——
    const before = JSON.stringify(await saved(id))
    const bad = await people.setOff(owner, id, [{ ref: 'race|PHB|no-such-race' }])
    const unsupported = await people.setOff(owner, id, [{ ...sailorAth, part: 'skills:no-such-skill' }])
    out.reject = { bad: [bad.ok, bad.problems.map((p) => p.reason)], unsupported: [unsupported.ok, unsupported.problems.map((p) => p.reason)],
      unchanged: JSON.stringify(await saved(id)) === before, stillThere: !!(await data(id)), ath: await prof(id, 'ath') }

    // —— 期间别处改过存档：不写，小窗按存档退回 ——
    const original = saves.setOff.bind(saves)
    saves.setOff = async (...args) => { await people.adjust(owner, [id], { pinned: true }); return original(...args) }
    let conflict = null
    try { await people.setOff(owner, id, []) } catch (error) { conflict = String(error.message ?? error) }
    saves.setOff = original
    out.conflict = { error: conflict, off: (await saved(id)).off, pinned: (await saved(id)).adjustments.pinned, ath: await prof(id, 'ath') }

    // —— 复制：带上取下安排 ——
    const copy = await people.copy(owner, id)
    out.copy = { status: copy.result.status, off: (await saved(copy.result.id)).off, ath: await prof(copy.result.id, 'ath') }

    // —— 属性提升的子项（矮人体质）、整件取下（警觉）：第 1 步那个人 ——
    const first = globalThis.offActor
    const f0 = await data(first)
    const dwarf = f0.items.find((i) => i.type === 'race')
    const asi = Object.values(dwarf.system.advancement).find((a) => a.type === 'AbilityScoreImprovement' && Object.keys(a.value?.assignments ?? {}).includes('con'))
    const alert = f0.items.find((i) => i.name === 'Alert')
    await people.edit(owner, first, [{ kind: 'effect', itemId: alert._id, effectId: alert.effects[0]._id, path: 'disabled', value: false }])
    const init = async () => (await people.check(owner, first, 'initiative', undefined, [10])).outcome.result?.[0]?.total
    out.asi = { con: f0.system.abilities.con.value, init: await init() }
    // 属性提升：作者没有按单项取下的程序 → 单项被拒；整条取下用作者 reverse
    const asiPart = await people.setOff(owner, first, [{ ref: key(dwarf), advancement: asi._id, part: 'con' }])
    out.asi.part = { ok: asiPart.ok, reasons: asiPart.problems.map((p) => p.reason) }
    const conOff = await people.setOff(owner, first, [{ ref: key(dwarf), advancement: asi._id }, { ref: key(alert) }])
    const f1 = await data(first)
    out.asi.off = { ok: conOff.ok, problems: conOff.problems, con: f1.system.abilities.con.value, init: await init(), alertKept: f1.items.some((i) => i._id === alert._id) }
    const conOn = await people.setOff(owner, first, [])
    out.asi.on = { ok: conOn.ok, con: (await data(first)).system.abilities.con.value, init: await init() }
    // 单个效果：作者的「停用」
    const fxOff = await people.setOff(owner, first, [{ ref: key(alert), effect: alert.effects[0]._id }])
    out.effect = { ok: fxOff.ok, init: await init() }
    await people.setOff(owner, first, [])
    out.effect.back = await init()
    // 体型、生命值：作者 reverse / restore（小体型的半身人看得出变化）
    const small = await people.build(owner, { name: 'Size off', items: await Promise.all([globalThis.offFind('race', 'Halfling'), globalThis.offFind('class', 'Fighter')]), blank: true })
    if (small.built.status !== 'complete') throw Error(JSON.stringify(small.built))
    const sid = small.built.id
    const s0 = await data(sid)
    const race = s0.items.find((i) => i.type === 'race'), cls = s0.items.find((i) => i.type === 'class')
    const sizeAdv = Object.values(race.system.advancement).find((a) => a.type === 'Size')
    const hpAdv = Object.values(cls.system.advancement).find((a) => a.type === 'HitPoints')
    const sizeOff = await people.setOff(owner, sid, [{ ref: key(race), advancement: sizeAdv._id }])
    const s1 = await data(sid)
    const hpOff = await people.setOff(owner, sid, [{ ref: key(race), advancement: sizeAdv._id }, { ref: key(cls), advancement: hpAdv._id, level: 1 }])
    const hpOffMax = (await people.sheet(owner, sid)).result.system.attributes.hp.max
    await people.setOff(owner, sid, [])
    const s2 = await data(sid)
    out.size = { start: s0.system.traits.size, ok: sizeOff.ok, problems: sizeOff.problems, off: s1.system.traits.size, back: s2.system.traits.size,
      hpStart: (await people.sheet(owner, sid)).result.system.attributes.hp.max, hpOk: hpOff.ok, hpOffMax }
    // 留一个取下状态给整页刷新后检查
    await people.setOff(owner, id, [elfOff, sailorPrc])
    globalThis.offReload = { id, prc: await prof(id, 'prc') }
    out.reloadExpect = globalThis.offReload
    return out
  })
}

export function step2Checks(r) {
  const o = r.overlap
  return {
    overlapStart: o.start.prc === 1 && o.start.ath === 1,
    overlapOneSourceStays: o.cycles.every((c) => c.elfOnly.ok && c.elfOnly.prc === 1),
    overlapBothOff: o.cycles.every((c) => c.bothOff.ok && c.bothOff.prc === 0),
    overlapBackNoStack: o.cycles.every((c) => c.on.ok && c.on.prc === 1),
    partOnlyThatPart: r.part.ok && r.part.ath === 0 && r.part.prc === 1,
    choicesKept: r.choicesKept,
    stateKept: r.state.afterOff === r.state.hpHurt && r.state.prc === 1 && r.state.ath === 0,
    coldCacheKeepsOff: r.cold.loaded.every((x) => x === 'complete') && r.cold.prc === 1 && r.cold.ath === 0 && r.cold.hp === r.state.hpHurt,
    undoBackToPrevOff: r.undo.off.length === 1 && r.undo.ath === 0 && r.undo.hp === r.state.hpHurt,
    rejectBadRef: r.reject.bad[0] === false && r.reject.bad[1].length > 0,
    rejectMissingPart: r.reject.unsupported[0] === false && r.reject.unsupported[1].some((x) => x.includes('这一项')),
    rejectLeavesSave: r.reject.unchanged && r.reject.stillThere && r.reject.ath === 0,
    conflictNoHalfWrite: !!r.conflict.error && r.conflict.off.length === 1 && r.conflict.pinned === true && r.conflict.ath === 0,
    copyCarriesOff: r.copy.status === 'complete' && r.copy.off.length === 1 && r.copy.ath === 0,
    asiPartNoAuthorProgram: r.asi.part.ok === false && r.asi.part.reasons.some((x) => x.includes('整条')),
    asiRowOff: r.asi.off.ok && r.asi.off.con === r.asi.con - 2 && r.asi.on.ok && r.asi.on.con === r.asi.con,
    effectOff: r.effect.ok && r.effect.init < r.asi.init && r.effect.back === r.asi.init,
    sizeOff: r.size.ok && r.size.start !== 'med' && r.size.off === 'med' && r.size.back === r.size.start,
    hpLevelOff: r.size.hpOk && r.size.hpOffMax < r.size.hpStart,
    wholeItemOff: r.asi.off.init < r.asi.init && r.asi.off.alertKept && r.asi.on.init === r.asi.init,
  }
}
