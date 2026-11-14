// 【我的库】只有一种语言的包 ⋯ 菜单：「导入英文版文件…」弹文件选择 → 走和【导入】同一条路（预览、按语言放、配对）→ 对面语言真的有内容；
// 「新建空的英文版（用来翻译）」仍是空壳。真实构建的插件 + 已装中英官方数据的测试资料夹副本（openLibrary，端口 47318），断网。
// 用法：SKIP_BUILD=1 [ENGINE=webkit] node tests/e2e/library/p66-pack-lang-import.mjs（截图 work/e2e-lib/p55-ui-shots/66/）
import { writeFile } from 'node:fs/promises'
import { check, failures, settle } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'
import { work } from './chain-common.mjs'

const { ctx, page, server, shots, tab, closeAll, realErrors } = await openLibrary('66')
const spell = (name, eng) => ({ name, ...(eng ? { ENG_name: eng } : {}), source: 'P66PAIR', level: 1, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'feet', amount: 30 } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['x'] })
const meta = (full) => ({ sources: [{ json: 'P66PAIR', full, abbreviation: 'P66', authors: [], version: '1' }], dateAdded: 0, dateLastModified: 0, edition: 'classic' })
const zh = { name: 'p66-zh.json', text: JSON.stringify({ _meta: { ...meta('配对测试包'), translators: ['测试'] }, spell: [spell('配对术', 'Pair Spell')] }) }
const en = { path: `${work}/p66-en.json`, text: JSON.stringify({ _meta: meta('Pair Test Pack'), spell: [spell('Pair Spell')] }) }
await writeFile(en.path, en.text)
const count = (set) => page.evaluate(async ([P, set]) => (await eval(P)._s.get('app').svc().backend.library.service.query(set, 'spell')).filter((x) => x.source === 'P66PAIR').length, [P, set])

// 只导入中文那一个文件 → 【我的库】一行，只有「中」
await page.evaluate(async ([P, zh]) => { const lib = eval(P)._s.get('app').svc().backend.library; await lib.bilingual.importFiles([zh]); await lib.brewQueue.settled(); await eval(P)._s.get('library').loadPairs(eval(P)._s.get('app').svc()) }, [P, zh])
await tab('我的库')
const row = page.locator('[data-testid="mylib-row"]', { hasText: '配对测试包' }).first()
await row.waitFor()
await row.locator('.trpg-more').click()
const items = await page.locator('.trpg-dropdown__item').allInnerTexts()
await page.screenshot({ path: `${shots}/1-menu.png` })
check('只有中文的包 ⋯ 菜单：有「导入英文版文件…」和「新建空的英文版（用来翻译）」，没有旧的「加英文版」', items.some((t) => /导入英文版文件/.test(t)) && items.some((t) => /新建空的英文版/.test(t)) && !items.some((t) => t.trim() === '加英文版'), JSON.stringify(items))

// 导入英文版文件…：弹文件选择，选英文文件 → 导入预览 → 确认
const chooser = page.waitForEvent('filechooser')
await page.locator('.trpg-dropdown__item', { hasText: '导入英文版文件' }).click()
await (await chooser).setFiles(en.path)
await page.waitForSelector('[data-testid="import-preview"]')
await settle(page, 400)
await page.screenshot({ path: `${shots}/2-import-preview.png` })
const pre = await page.getByTestId('import-preview').innerText()
check('选完文件弹出导入预览，认出是英文文件', /英文|English/.test(pre), pre.replace(/\n/g, ' | ').slice(0, 200))
await page.getByTestId('import-confirm').click()
await page.locator('.trpg-toast', { hasText: /已导入/ }).waitFor()
await page.evaluate(async (P) => { await eval(P)._s.get('app').svc().backend.library.brewQueue.settled() }, P)
await settle(page, 800)
const rowText = await row.innerText()
await page.screenshot({ path: `${shots}/3-after-import.png` })
check('导入后：同一行「中」「En」都有，英文那一套真的有内容', /中/.test(rowText) && /En/.test(rowText) && (await count('en-brew')) === 1 && (await count('cn-brew')) === 1, JSON.stringify({ rowText: rowText.replace(/\n/g, ' | '), en: await count('en-brew'), zh: await count('cn-brew') }))
await row.locator('.trpg-more').click()
const items2 = await page.locator('.trpg-dropdown__item').allInnerTexts()
check('两种语言都有之后，菜单里不再出现导入 / 新建对面语言', !items2.some((t) => /导入英文版|新建空的英文版/.test(t)), JSON.stringify(items2))
await page.keyboard.press('Escape')
await closeAll()

check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
