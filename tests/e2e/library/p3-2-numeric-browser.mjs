// 只调用真实作者骰子程序；统计表达式，不推断整条规则是否完整自动化。
export async function probeNumericCorpus(corpus) {
  const expressions = new Map(); const tagErrors = []; let tagCount = 0
  for (const [kind, entries] of Object.entries(corpus)) {
    if (kind === 'monsterFeature') continue // 已在父条目中；避免重复统计。
    for (const ent of entries) for (const match of JSON.stringify(ent).matchAll(/\{@(dice|damage|hit|scaledamage|scaledice|d20|autodice) ([^}]*)\}/g)) {
      const [, tag, text] = match
      tagCount++
      try {
        const value = ['scaledamage', 'scaledice'].includes(tag) ? Renderer.parseScaleDice(`@${tag}`, text) : Renderer.utils.getTagEntry(`@${tag}`, text)
        const str = value?.toRoll
        if (str) expressions.set(str, (expressions.get(str) ?? 0) + 1)
        else tagErrors.push({ tag, text, error: 'No toRoll from author tag parser' })
      } catch (e) { tagErrors.push({ tag, text, error: String(e.message) }) }
    }
  }
  const rows = []
  for (const [expression, occurrences] of expressions) {
    const row = { expression, occurrences }
    try {
      const parsed = Renderer.dice.lang.getTree3(expression)
      row.parsed = !!parsed
      if (!parsed) {
        // 作者点击骰式时先拆分分号选项（render-dice.js），每一支再交同一个解析器。
        if (expression.includes(';')) row.choiceBranches = expression.split(';').map(expression => ({ expression, parsed: !!Renderer.dice.lang.getTree3(expression) }))
        rows.push(row); continue
      }
      row.values = {}; row.errors = {}
      for (const method of ['avg', 'min', 'max']) {
        try { row.values[method] = parsed.tree[method]({ pb: 3 }) }
        catch (e) { row.errors[method] = String(e.message) }
      }
      const original = RollerUtil.randomise
      const rolls = []; let calls = 0
      try {
        RollerUtil.randomise = (faces, minimum = 1) => { if (++calls > 2048) throw Error('PROBE_ROLL_LIMIT'); rolls.push({ faces, value: minimum }); return minimum }
        row.first = parsed.tree.evl({ pb: 3 })
        let index = 0
        RollerUtil.randomise = faces => { if (index >= rolls.length || rolls[index].faces !== faces) throw Error('REPLAY_DICE_MISMATCH'); return rolls[index++].value }
        row.replay = parsed.tree.evl({ pb: 3 })
        row.sameResult = row.first === row.replay && index === rolls.length
        row.rollCount = rolls.length
      } finally { RollerUtil.randomise = original }
    } catch (e) { row.error = String(e.message) }
    rows.push(row)
  }
  const prepared = []; const preparedErrors = []
  for (const kind of ['class', 'subclass']) for (const ent of corpus[kind] ?? []) {
    if (!ent.preparedSpells) continue
    let cases = 0
    for (let level = 1; level <= 20; level++) for (let mod = -5; mod <= 10; mod++) {
      const expression = `max(1, floor(${ent.preparedSpells.replace(/<\$level\$>/g, String(level)).replace(/<\$(str|dex|con|int|wis|cha)_mod\$>/g, String(mod))}))`
      try {
        const parsed = Renderer.dice.lang.getTree3(expression)
        if (!parsed) throw Error('Unparsed prepared formula')
        const result = parsed.tree.evl({})
        if (!Number.isFinite(result) || !Number.isInteger(result) || result < 1) throw Error('Invalid prepared count')
        cases++
      } catch (e) { preparedErrors.push({ name: ent.name, source: ent.source, expression, error: String(e.message) }) }
    }
    prepared.push({ kind, name: ent.name, source: ent.source, formula: ent.preparedSpells, cases })
  }
  return { tagCount, uniqueExpressions: rows.length, tagErrors, rows, prepared, preparedErrors }
}
