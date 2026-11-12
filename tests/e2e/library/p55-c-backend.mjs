// P5.5 阶段 C 后端（B5 类型清单 / 起点、B6 空白条目、B7 草稿）的本机局部验证：真实构建的插件 + 已装中英官方数据的旧测试资料夹副本，断网。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-c-backend.mjs（不设 SKIP_BUILD 会先构建）。结果写进 work/e2e-lib/p55-c-backend-chrome.json。
import { cp, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p55c-chrome`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-chrome`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(300000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })

const r = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
  const c = { rule: 'dnd5e2014', codeSet: 'cn', scopes: ['5e2014'], include: [], exclude: [], choices: {} }
  const out = {}
  // B5：类型清单从作者读
  const types = await lib.custom.entryTypes('cn')
  const by = Object.fromEntries(types.map((t) => [t.prop, t]))
  out.types = { n: types.length, spell: by.spell ?? null, monster: by.monster ?? null, deity: by.deity ?? null, hasBook: 'book' in by, hasBookData: 'bookData' in by, groups: [...new Set(types.map((t) => t.group?.name ?? '其他'))] }
  out.converters = await lib.custom.converters('cn')
  const conv = await lib.custom.convert(c, 'spell', 'txt', '测试冰锥\n1环 塑能\n施法时间：1 动作\n射程：60 尺\n成分：V、S\n持续时间：立即\n一道冰锥射出，造成 {@damage 2d6} 冷冻伤害。')
  out.convert = { n: conv.outputs.length, name: conv.outputs[0]?.name ?? null, warnings: conv.warnings.length }
  out.sample = (await lib.custom.converterSample(c, 'spell', 'txt'))?.slice(0, 40) ?? null
  out.template = { spell: (await lib.custom.template('cn', 'spell'))?.name ?? null, feat: await lib.custom.template('cn', 'feat') }
  // B6：空白条目
  out.blank = await lib.custom.blankEntry('cn', 'spell')
  out.blankIssues = (await lib.custom.validateEntry('cn', 'spell', { ...out.blank, source: 'TRPGMINE' })).length
  // B7：草稿不碰条目
  const before = (await (await lib.service.frameOf('cn')).call('editableDoc')).body?.spell?.length ?? 0
  const key = await lib.custom.saveDraft({ codeSet: 'cn', prop: 'spell', s: { name: 'P55草稿术' }, target: { kind: 'new', pack: null } })
  const after = (await (await lib.service.frameOf('cn')).call('editableDoc')).body?.spell?.length ?? 0
  out.draft = { key, got: (await lib.custom.draft(key))?.s ?? null, listed: (await lib.custom.drafts('cn')).length, entriesUnchanged: before === after }
  await lib.custom.discardDraft(key)
  out.draftGone = (await lib.custom.draft(key)) === null
  return out
})

const o = r
await writeFile(`${work}/p55-c-backend-chrome.json`, JSON.stringify({ r, pageErrors }, null, 1))
check('B5 类型清单：几十类，法术带作者中文名、分组、构建器和转换器；书 / 冒险正文不在里面', o.types.n > 30 && o.types.spell?.name === '法术' && o.types.spell?.group && o.types.spell?.starts.template === true && o.types.spell?.starts.convert.includes('spell') && o.types.spell?.starts.existing > 0 && !o.types.hasBook && !o.types.hasBookData, JSON.stringify(o.types).slice(0, 600))
check('B5 没有构建器 / 转换器的类别（神祇）：只给空白、已有、JSON', o.types.deity && o.types.deity.starts.template === false && o.types.deity.starts.convert.length === 0, JSON.stringify(o.types.deity))
check('B5 转换器从作者登记读：法术 txt、怪物有 md、通用正文没有类别', o.converters.some((x) => x.id === 'spell' && x.prop === 'spell' && x.modes.includes('txt')) && o.converters.some((x) => x.prop === 'monster' && x.modes.includes('md')) && o.converters.some((x) => x.id === 'generic' && x.prop === null), JSON.stringify(o.converters))
check('B5 文字转条目走作者转换器', o.convert.n === 1 && !!o.convert.name, JSON.stringify(o.convert))
check('B5 作者模板：法术有、专长没有', !!o.template.spell && o.template.feat === null, JSON.stringify(o.template))
check('B6 空白法术：只有必填项，结构检查会指出没填好的', !!o.blank && 'level' in o.blank && !('source' in o.blank) && o.blankIssues > 0, JSON.stringify(o.blank) + ' issues ' + o.blankIssues)
check('B7 草稿：存得进、读得回、列得出，条目本身没变；丢掉后没了', JSON.stringify(o.draft.got) === '{"name":"P55草稿术"}' && o.draft.listed >= 1 && o.draft.entriesUnchanged && o.draftGone, JSON.stringify(o.draft))
console.log('converter sample:', o.sample)
const realErrors = pageErrors.filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index/.test(m))
check('页面没有未处理的错误（断网预期的除外）', realErrors.length === 0, realErrors.slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
