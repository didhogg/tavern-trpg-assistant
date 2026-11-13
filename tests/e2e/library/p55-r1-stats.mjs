// P5.5 §16.10 表单返工第 1 步（后端）：类别从属（1d）、官方用法统计（1a）、自动字段实测（1b）。真实官方数据（测试资料夹已装中英）。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-r1-stats.mjs（结果 work/e2e-lib/p55-r1-stats.json）
import { writeFile } from 'node:fs/promises'
import { check, failures } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'
import { work } from './chain-common.mjs'

const { ctx, page, server, realErrors } = await openLibrary('r1')
page.setDefaultTimeout(600000)
const r = await page.evaluate(async (P) => {
  const c = eval(P)._s.get('app').svc().backend.library.custom
  const types = await c.entryTypes('cn')
  const usage = {}
  for (const p of ['monster', 'race', 'class', 'item', 'baseitem', 'magicvariant', 'itemGroup', 'subrace']) {
    const a = performance.now(); const u = await c.usage('cn', p); const b = performance.now(); await c.usage('cn', p)
    usage[p] = { items: u?.items ?? 0, fields: u?.fields ?? {}, firstMs: Math.round(b - a), cachedMs: Math.round(performance.now() - b), at: Object.fromEntries(Object.entries(u?.at ?? {}).filter(([k]) => ['alignment', 'alignment[]', 'type'].includes(k))) }
  }
  const auto = {}
  for (const p of ['monster', 'spell', 'item', 'race', 'background', 'feat']) auto[p] = await c.autoFields('cn', p)
  return { types: types.map((t) => ({ prop: t.prop, name: t.name, kind: t.kind, parent: t.parent, group: t.group?.name ?? null })), usage, auto }
}, P)
await writeFile(`${work}/p55-r1-stats.json`, JSON.stringify(r, null, 1))
const t = (p) => r.types.find((x) => x.prop === p)
const fluff = r.types.filter((x) => x.kind === 'fluff')
check('描述类型都挂到主条目（作者规矩：主类别名 + Fluff）', fluff.length >= 20 && fluff.every((x) => x.parent && x.prop === `${x.parent}Fluff`), `${fluff.length} 个`)
check('从属：子种族 → 种族、子职 → 职业、职业特性 → 职业、子职特性 → 子职', t('subrace')?.parent === 'race' && t('subclass')?.parent === 'class' && t('classFeature')?.parent === 'class' && t('subclassFeature')?.parent === 'subclass', JSON.stringify([t('subrace'), t('subclassFeature')]))
check('渲染器示例、引用不出现（驾驶员定）', !t('renderdemo') && !t('citation'))
const names = r.types.map((x) => x.name)
check('没有重名的类型', new Set(names).size === names.length, names.filter((n, i) => names.indexOf(n) !== i).join('、'))
check('神祇、载具、食谱有自己的分组（作者 DataUtil 页面）', !!t('deity')?.group && !!t('vehicle')?.group && !!t('recipe')?.group, JSON.stringify([t('deity')?.group, t('vehicle')?.group]))
const u = r.usage
check('统计：怪物阵营的写法，简单代号占绝大多数；常见组合有「混乱邪恶」', (u.monster.at['alignment[]']?.branches?.[0] ?? 0) > 50 * ((u.monster.at['alignment[]']?.branches?.[1] ?? 0) + 1) && (u.monster.at.alignment?.values ?? []).some(([v]) => v === '["C","E"]'), JSON.stringify(u.monster.at['alignment[]']?.branches))
check('统计：并进别类的基础物品 / 魔法物品变体 / 物品分组 / 子种族改读作者原文件，有条目', ['baseitem', 'magicvariant', 'itemGroup', 'subrace'].every((p) => u[p].items > 0), ['baseitem', 'magicvariant', 'itemGroup', 'subrace'].map((p) => `${p} ${u[p].items}`).join('，'))
check('统计第二次读缓存（≤ 20 ms）', Object.values(u).every((x) => x.cachedMs <= 20), Object.entries(u).map(([p, x]) => `${p} ${x.firstMs}/${x.cachedMs}`).join('，'))
const a = r.auto
check('自动字段：怪物的伤害 / 特性 / 动作 / 语言标签、法术的伤害类型和豁免', ['damageTags', 'traitTags', 'actionTags', 'languageTags'].every((f) => a.monster?.auto.includes(f)) && ['damageInflict', 'savingThrow'].every((f) => a.spell?.auto.includes(f)), JSON.stringify({ monster: a.monster?.auto, spell: a.spell?.auto }))
check('自动字段不收人填的结构化数据（种族抗性、背景熟练）', !a.race?.auto.includes('resist') && !a.background?.auto.some((f) => /Proficiencies$/.test(f)), JSON.stringify({ race: a.race?.auto, background: a.background?.auto }))
check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
