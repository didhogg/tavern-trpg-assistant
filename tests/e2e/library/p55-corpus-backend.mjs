// 书 / 冒险走普通条目那一套（驾驶员 2026-11-14：不另开入口），正文是「附属部分」（attached-parts.ts）：
// blankEntry（按包给编号建议）→ saveEntry({attached}) → 表单安排给出附属部分 → attachedPart 读回 → 改 → 撤销 → 撞号 → deleteEntries + 撤销
// → 草稿带附属部分 → 导入的书（没有 uniqueId、作者手选目录）按作者编号改 / 删 → 导出过作者校验。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-corpus-backend.mjs [作者自制包.json]（ENGINE=webkit 换 WebKit）
import { readFile } from 'node:fs/promises'
import { check, failures } from '../helpers.mjs'
import { openLibrary } from './p55-ui-common.mjs'

const file = process.argv[2]
const { ctx, page, server, svc, realErrors } = await openLibrary('corpus-backend', { width: 1000, height: 760 })
page.setDefaultTimeout(120000)
const fail = (fn, arg) => svc(async (s, [src, arg]) => { try { await (eval(src))(s, arg); return null } catch (e) { return String(e.message) } }, [fn.toString(), arg])
try {
  const settled = () => svc(async (s) => { const c = s.backend.library.custom; for (let i = 0; i < 120; i++) { const p = await c.pending('cn'); if (!p.packs.length && !p.busy) return true; await new Promise((r) => setTimeout(r, 500)) } return false })
  const corpora = () => svc(async (s) => s.backend.library.service.brewCorpora('cn-brew'))
  const pack = await svc(async (s) => (await s.backend.library.custom.createPack('cn', { json: 'CORPUSB', full: '书测试包', abbreviation: 'CB' }, { rule: 'dnd5e2014' })).id)

  // 表单安排：书多一节附属部分、目录不出现；附属部分那一类不出现 id / 来源
  const plans = await svc(async (s) => { const c = s.backend.library.custom; const [b, d] = await Promise.all([c.formPlan('cn', 'book'), c.formPlan('cn', 'bookData')]); return { attached: b.attached, hiddenBook: b.hidden, hiddenData: d.hidden, spell: (await c.formPlan('cn', 'spell')).attached ?? null } })
  check('表单安排：书有附属部分（bookData，跟着走的是 id、来源），法术没有', plans.attached?.prop === 'bookData' && plans.attached.linked.join() === 'id,source' && plans.spell === null, JSON.stringify(plans.attached))
  check('表单安排：书的目录不出现，正文那一类的 id 不出现', plans.hiddenBook.includes('contents') && plans.hiddenData.includes('id'), JSON.stringify(plans))

  // 新建：同一个 blankEntry，给了包就有编号建议
  const blank = await svc((s, pack) => s.backend.library.custom.blankEntry('cn', 'book', { pack }), pack)
  check('空白：编号 = 包的来源、分组自制、没有目录', blank.id === 'CORPUSB' && blank.group === 'homebrew' && !('contents' in blank), JSON.stringify(blank))
  const part0 = await svc((s, pack) => s.backend.library.custom.attachedPart('cn', 'book', pack, null), pack)
  check('附属部分起点：空白正文（没有 id / 来源）', part0?.prop === 'bookData' && Array.isArray(part0.entity.data) && !('id' in part0.entity), JSON.stringify(part0))
  const chapters = [
    { type: 'section', name: '第一章：港口', entries: ['港口很热闹。', { type: 'entries', name: '码头', entries: ['船。'] }, { type: 'entries', name: '集市', entries: ['货。'] }] },
    { type: 'section', name: '第二章：灯塔', entries: ['灯塔很高。'] },
  ]
  const noName = await fail(async (s, [pack, blank]) => s.backend.library.custom.saveEntry('cn', 'book', { ...blank, name: '港口手册' }, { pack, attached: { data: [{ type: 'section', entries: ['x'] }] } }), [pack, blank])
  check('没有章名的章不让存', /第 1 章没有章名/.test(noName ?? ''), noName ?? '存进去了')
  const saved = await svc((s, [pack, blank, chapters]) => s.backend.library.custom.saveEntry('cn', 'book', { ...blank, name: '港口手册' }, { pack, rule: 'dnd5e2014', attached: { data: chapters } }), [pack, blank, chapters])
  check('同一个 saveEntry 存好：主条目和附属部分都有 uniqueId，没有结构提示', !!saved.uniqueId && saved.attached?.prop === 'bookData' && !!saved.attached.uniqueId && !saved.issues.length, JSON.stringify(saved).slice(0, 300))
  check('后台整理完', await settled())
  check('自制书目里有这本', ((await corpora()).book ?? []).some((b) => b.id === 'CORPUSB' && b.name === '港口手册'))

  // 读回：同一个 packEntry + attachedPart
  const read = () => svc(async (s, pack) => { const c = s.backend.library.custom; const head = await c.packEntry('cn', pack, 'book', { hash: 'corpusb' }); return { head: head?.entity ?? null, part: await c.attachedPart('cn', 'book', pack, { hash: 'corpusb' }) } }, pack)
  const back = await read()
  check('读回：目录 = 每章 + 直接下一层小节', JSON.stringify(back.head.contents) === JSON.stringify([{ name: '第一章：港口', headers: ['码头', '集市'] }, { name: '第二章：灯塔' }]), JSON.stringify(back.head.contents))
  check('读回：附属部分两章、不带 id / 来源', back.part.entity.data.length === 2 && !('id' in back.part.entity) && !!back.part.entity.uniqueId)
  const next = await svc((s, pack) => s.backend.library.custom.blankEntry('cn', 'book', { pack }), pack)
  check('存过一本后，下一本编号建议加 -2', next.id === 'CORPUSB-2', next.id)

  // 改（同一个 saveEntry），再撤销（同一个 undo，附属部分一起撤回）
  const edited = structuredClone(back.part.entity)
  edited.data[0].entries.splice(2, 1)
  edited.data.push({ type: 'section', name: '第三章：海上', entries: [{ type: 'entries', name: '风暴', entries: ['浪很大。'] }] })
  await svc((s, [pack, head, edited]) => s.backend.library.custom.saveEntry('cn', 'book', head, { pack, attached: edited }), [pack, back.head, edited])
  const back2 = await read()
  check('改后：原来的章保留、删掉的小节去掉、新章自动算', JSON.stringify(back2.head.contents) === JSON.stringify([{ name: '第一章：港口', headers: ['码头'] }, { name: '第二章：灯塔' }, { name: '第三章：海上', headers: ['风暴'] }]), JSON.stringify(back2.head.contents))
  const steps = await svc((s, uid) => s.backend.library.custom.undoSteps('cn', 'book', uid), back.head.uniqueId)
  await svc((s, uid) => s.backend.library.custom.undo('cn', 'book', uid), back.head.uniqueId)
  const back3 = await read()
  check('撤销（同一个 undo）：正文和目录都回到改之前', steps >= 1 && back3.part.entity.data.length === 2 && back3.head.contents.length === 2, `${steps} 步；${JSON.stringify(back3.head.contents)}`)

  // 撞号
  const clash = await fail(async (s, [pack, next]) => s.backend.library.custom.saveEntry('cn', 'book', { ...next, id: 'PHB', name: '撞号' }, { pack, attached: { data: [] } }), [pack, next])
  check('编号和官方书撞了不让存', /PHB 已经有同类的条目在用/.test(clash ?? ''), clash ?? '存进去了')

  // 冒险（同一套）
  const adv = await svc((s, pack) => s.backend.library.custom.blankEntry('cn', 'adventure', { pack }), pack)
  await svc((s, [pack, adv]) => s.backend.library.custom.saveEntry('cn', 'adventure', { ...adv, name: '灯塔冒险', level: { start: 1, end: 3 }, storyline: '港口' }, { pack, attached: { data: [{ type: 'section', name: '开场', entries: ['你们到了。'] }] } }), [pack, adv])
  await settled()
  check('冒险走同一套存好，出现在自制冒险目录里', ((await corpora()).adventure ?? []).some((a) => a.id === adv.id), adv.id)

  // 草稿带附属部分
  const draft = await svc(async (s, pack) => { const c = s.backend.library.custom; const k = await c.saveDraft({ codeSet: 'cn', prop: 'book', s: { name: '草稿书' }, a: { data: [{ type: 'section', name: '一', entries: ['x'] }] }, target: { kind: 'new', pack } }); const d = await c.draft(k); await c.discardDraft(k); return d }, pack)
  check('草稿把附属部分一起存下', draft?.a?.data?.[0]?.name === '一', JSON.stringify(draft?.a))

  // 导出过作者校验（和导出按钮一样先写成文本）
  const exported = await svc(async (s, pack) => { const c = s.backend.library.custom; const out = await c.exportPack('cn', pack); const v = await c.validate('cn', JSON.stringify(out.body)); return { ok: v.ok, issues: v.issues.slice(0, 3), books: out.body.bookData?.length } }, pack)
  check('导出的包过作者结构校验，正文在里面', exported.ok && exported.books === 1, JSON.stringify(exported))

  // 删（同一个 deleteEntries）+ 撤销（同一个 undo）
  const del = await svc((s, [pack, uid]) => s.backend.library.custom.deleteEntries('cn', 'book', [uid], { pack }), [pack, back.head.uniqueId])
  const goneHead = await svc((s, pack) => s.backend.library.custom.packEntry('cn', pack, 'book', { hash: 'corpusb' }), pack)
  const goneBody = await svc((s, pack) => s.backend.library.custom.packEntry('cn', pack, 'bookData', { id: 'CORPUSB' }), pack)
  check('同一个 deleteEntries：书和正文一起删掉', del.removed === 1 && !goneHead && !goneBody, JSON.stringify(del))
  await svc((s, uid) => s.backend.library.custom.undo('cn', 'book', uid), del.uniqueIds[0])
  const again = await read()
  check('撤销删除：书和正文原样回来', again.head?.name === '港口手册' && again.part.entity.data.length === 2)

  // 导入的书（没有 uniqueId、目录是作者手选的）：按作者编号改，目录照原样；按作者编号删
  if (file) {
    const text = await readFile(file, 'utf8')
    const json = JSON.parse(text)
    const head = json.book?.[0]
    await svc((s, [name, text]) => s.backend.library.bilingual.importFiles([{ name, text }]), [file.split('/').pop(), text])
    await settled()
    const imported = (await svc((s) => s.backend.library.custom.packs('cn'))).find((p) => p.own.json === json._meta.sources.at(-1).json)
    check('导入的包在我的库里', !!imported)
    if (imported && head) {
      const hash = head.id.toLowerCase()
      const got = await svc(async (s, [id, hash]) => { const c = s.backend.library.custom; return { head: await c.packEntry('cn', id, 'book', { hash }), part: await c.attachedPart('cn', 'book', id, { hash }) } }, [imported.id, hash])
      check('导入的书：主条目没有 uniqueId，附属部分读得到', got.head.hadId === false && got.part.entity.data.length === json.bookData[0].data.length)
      got.part.entity.data[0].entries.push('补一句。')
      await svc((s, [id, got, hash]) => s.backend.library.custom.saveEntry('cn', 'book', got.head.entity, { pack: id, replaceHash: hash, attached: got.part.entity }), [imported.id, got, hash])
      const after = await svc(async (s, [id, hash]) => { const c = s.backend.library.custom; return { head: (await c.packEntry('cn', id, 'book', { hash })).entity, part: await c.attachedPart('cn', 'book', id, { hash }) } }, [imported.id, hash])
      check('导入的书改正文后，作者手选的目录不变', JSON.stringify(after.head.contents) === JSON.stringify(head.contents), JSON.stringify(after.head.contents).slice(0, 200))
      check('导入的书改正文后，正文只有一份且改到了', after.part.entity.data[0].entries.at(-1) === '补一句。' && (await svc(async (s, id) => (await s.backend.library.custom.exportPack('cn', id)).body.bookData.length, imported.id)) === 1)
      const adv0 = json.adventure?.[0]
      if (adv0) {
        const r = await svc((s, [id, hash]) => s.backend.library.custom.deleteEntries('cn', 'adventure', [{ hash }], { pack: id }), [imported.id, adv0.id.toLowerCase()])
        const left = await svc(async (s, id) => (await s.backend.library.custom.exportPack('cn', id)).body, imported.id)
        check('导入的冒险（没有 uniqueId）按作者编号删，正文一起删', r.removed === 1 && !(left.adventure ?? []).length && !(left.adventureData ?? []).length, JSON.stringify(r))
      }
    }
  }
  check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
} finally {
  await ctx.close()
  server.close()
}
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
