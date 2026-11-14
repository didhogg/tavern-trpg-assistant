// 自制书 / 冒险后端（custom.corpusStart / corpusEntry / saveCorpus / deleteCorpus）：
// 新建 → 存 → 后台整理完出现在自制书目 → 读回 → 改 → 撞号报错 → 导入的书改了保留原目录 → 删 → 导出过作者校验。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-corpus-backend.mjs [作者自制包.json]（ENGINE=webkit 换 WebKit）
import { readFile } from 'node:fs/promises'
import { check, failures } from '../helpers.mjs'
import { openLibrary } from './p55-ui-common.mjs'

const file = process.argv[2]
const { ctx, page, server, svc, shots, realErrors } = await openLibrary('corpus-backend', { width: 1000, height: 760 })
page.setDefaultTimeout(120000)
try {
  const settled = () => svc(async (s) => { const c = s.backend.library.custom; for (let i = 0; i < 120; i++) { const p = await c.pending('cn'); if (!p.packs.length && !p.busy) return true; await new Promise((r) => setTimeout(r, 500)) } return false })
  const corpora = () => svc(async (s) => s.backend.library.service.brewCorpora('cn-brew'))
  const pack = await svc(async (s) => (await s.backend.library.custom.createPack('cn', { json: 'CORPUSB', full: '书测试包', abbreviation: 'CB' }, { rule: 'dnd5e2014' })).id)

  // 新建
  const start = await svc((s, pack) => s.backend.library.custom.corpusStart('cn', 'book', pack), pack)
  check('起点：编号 = 包的来源、分组自制、没有目录、正文没有章', start.head.id === 'CORPUSB' && start.head.group === 'homebrew' && !('contents' in start.head) && Array.isArray(start.body.data) && !start.body.data.length, JSON.stringify(start))
  const advStart = await svc((s, pack) => s.backend.library.custom.corpusStart('cn', 'adventure', pack), pack)
  check('冒险起点：同一个包里编号也先给来源编号（还没存，没用掉）', advStart.head.id === 'CORPUSB', advStart.head.id)
  const chapters = [
    { type: 'section', name: '第一章：港口', entries: ['港口很热闹。', { type: 'entries', name: '码头', entries: ['船。'] }, { type: 'entries', name: '集市', entries: ['货。'] }] },
    { type: 'section', name: '第二章：灯塔', entries: ['灯塔很高。'] },
  ]
  const noName = await svc(async (s, [pack, start]) => { try { await s.backend.library.custom.saveCorpus('cn', 'book', { head: { ...start.head, name: '港口手册' }, body: { data: [{ type: 'section', entries: [] }] } }, { pack }); return null } catch (e) { return String(e.message) } }, [pack, start])
  check('没有章名的章不让存', /第 1 章没有章名/.test(noName ?? ''), noName ?? '存进去了')
  const saved = await svc((s, [pack, start, chapters]) => s.backend.library.custom.saveCorpus('cn', 'book', { head: { ...start.head, name: '港口手册' }, body: { data: chapters } }, { pack, rule: 'dnd5e2014' }), [pack, start, chapters])
  check('存好：目录和正文都有 uniqueId', !!saved.head.uniqueId && !!saved.body.uniqueId, JSON.stringify(saved).slice(0, 200))
  check('后台整理完', await settled())
  const books = (await corpora()).book ?? []
  check('自制书目里有这本', books.some((b) => b.id === 'CORPUSB' && b.name === '港口手册'), JSON.stringify(books))

  // 读回：目录按正文算好
  const back = await svc((s, pack) => s.backend.library.custom.corpusEntry('cn', pack, 'book', 'CORPUSB'), pack)
  check('读回：目录 = 每章 + 直接下一层小节', JSON.stringify(back.head.contents) === JSON.stringify([{ name: '第一章：港口', headers: ['码头', '集市'] }, { name: '第二章：灯塔' }]), JSON.stringify(back.head.contents))
  check('读回：正文两章、同来源', back.body.data.length === 2 && back.body.source === back.head.source, JSON.stringify(back.body).slice(0, 200))
  const adv2 = await svc((s, pack) => s.backend.library.custom.corpusStart('cn', 'adventure', pack), pack)
  check('存过一本后，下一本编号建议加 -2', adv2.head.id === 'CORPUSB-2', adv2.head.id)

  // 改：加一章、删一个小节
  back.body.data[0].entries.splice(2, 1)
  back.body.data.push({ type: 'section', name: '第三章：海上', entries: [{ type: 'entries', name: '风暴', entries: ['浪很大。'] }] })
  await svc((s, [pack, back]) => s.backend.library.custom.saveCorpus('cn', 'book', back, { pack }), [pack, back])
  await settled()
  const back2 = await svc((s, pack) => s.backend.library.custom.corpusEntry('cn', pack, 'book', 'CORPUSB'), pack)
  check('改后：原来的章保留、删掉的小节去掉、新章自动算', JSON.stringify(back2.head.contents) === JSON.stringify([{ name: '第一章：港口', headers: ['码头'] }, { name: '第二章：灯塔' }, { name: '第三章：海上', headers: ['风暴'] }]), JSON.stringify(back2.head.contents))
  check('改后：没多出第二本', (await svc((s, pack) => s.backend.library.custom.packEntry('cn', pack, 'bookData', { uniqueId: 'x' }), pack)) === null && ((await corpora()).book ?? []).filter((b) => b.id === 'CORPUSB').length === 1)

  // 撞号
  const clash = await svc(async (s, [pack, adv2]) => { try { await s.backend.library.custom.saveCorpus('cn', 'adventure', { head: { ...adv2.head, id: 'PHB', name: '撞号' }, body: { data: [] } }, { pack }); return null } catch (e) { return String(e.message) } }, [pack, adv2])
  check('编号和官方书撞了不让存', /PHB 已经有/.test(clash ?? ''), clash ?? '存进去了')

  // 冒险
  await svc((s, [pack, adv2]) => s.backend.library.custom.saveCorpus('cn', 'adventure', { head: { ...adv2.head, name: '灯塔冒险', level: { start: 1, end: 3 }, storyline: '港口' }, body: { data: [{ type: 'section', name: '开场', entries: ['你们到了。'] }] } }, { pack }), [pack, adv2])
  await settled()
  check('自制冒险目录里有这个冒险', ((await corpora()).adventure ?? []).some((a) => a.id === 'CORPUSB-2'))

  // 导出过作者校验
  const exported = await svc(async (s, pack) => { const c = s.backend.library.custom; const out = await c.exportPack('cn', pack); const v = await c.validate('cn', JSON.stringify(out.body)); /* 和导出按钮一样先写成文本（作者排字段时留下的空键在文本里没有） */ return { ok: v.ok, issues: v.issues.slice(0, 3), adv: out.body.adventureData, books: JSON.parse(typeof out.body === 'string' ? out.body : JSON.stringify(out.body)).bookData?.length } }, pack)
  check('导出的包过作者结构校验，正文在里面', exported.ok && exported.books === 1, JSON.stringify(exported))
  if (!exported.ok) await import('node:fs/promises').then(async ({ writeFile }) => writeFile(`${shots}/export.json`, JSON.stringify(await svc(async (s, pack) => (await s.backend.library.custom.exportPack('cn', pack)).body, pack), null, 1)))

  // 删
  await svc((s, pack) => s.backend.library.custom.deleteCorpus('cn', pack, 'book', 'CORPUSB'), pack)
  await settled()
  const gone = await svc(async (s, pack) => { try { await s.backend.library.custom.corpusEntry('cn', pack, 'book', 'CORPUSB'); return false } catch { return true } }, pack)
  check('删掉：目录和正文都没了', gone && !((await corpora()).book ?? []).some((b) => b.id === 'CORPUSB'))

  // 导入的书（没有 uniqueId、目录是作者手选的）：改一处正文，目录照原样
  if (file) {
    const text = await readFile(file, 'utf8')
    const json = JSON.parse(text)
    const head = json.book?.[0]
    await svc((s, [name, text]) => s.backend.library.bilingual.importFiles([{ name, text }]), [file.split('/').pop(), text])
    await settled()
    const packs = await svc((s) => s.backend.library.custom.packs('cn'))
    const imported = packs.find((p) => p.own.json === json._meta.sources.at(-1).json)
    check('导入的包在我的库里', !!imported, packs.map((p) => p.own.json).join(','))
    if (imported && head) {
      const got = await svc((s, [id, bid]) => s.backend.library.custom.corpusEntry('cn', id, 'book', bid), [imported.id, head.id])
      got.body.data[0].entries.push('补一句。')
      await svc((s, [id, got]) => s.backend.library.custom.saveCorpus('cn', 'book', got, { pack: id }), [imported.id, got])
      await settled()
      const after = await svc((s, [id, bid]) => s.backend.library.custom.corpusEntry('cn', id, 'book', bid), [imported.id, head.id])
      check('导入的书改正文后，作者手选的目录不变', JSON.stringify(after.head.contents) === JSON.stringify(head.contents), JSON.stringify(after.head.contents).slice(0, 300))
      check('导入的书改正文后，正文只有一份且改到了', after.body.data[0].entries.at(-1) === '补一句。' && !!after.body.uniqueId)
    }
  }
  check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
} finally {
  await ctx.close()
  server.close()
}
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
