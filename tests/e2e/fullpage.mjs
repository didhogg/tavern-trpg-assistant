// 截图工具的「整页」模式：只在截图脚本里临时解除弹窗的固定高度，不改产品样式。
export async function expandModal(page) {
  await page.evaluate(() => {
    const root = document.getElementById('trpg-assistant-root')?.shadowRoot
    const win = root?.querySelector('.trpg-window')
    const shell = root?.querySelector('.trpg-shell')
    const modal = root?.querySelector('.trpg-modal')
    const card = root?.querySelector('.trpg-modal__card')
    const pages = root?.querySelector('.trpg-modal__pages')
    const pageEl = root?.querySelector('.trpg-modal__page:not(.is-under)')
    if (!(win instanceof HTMLElement) || !(shell instanceof HTMLElement) || !(modal instanceof HTMLElement) || !(card instanceof HTMLElement) || !(pages instanceof HTMLElement) || !(pageEl instanceof HTMLElement)) return
    win.style.overflow = 'visible'
    shell.style.height = '100%'
    modal.style.alignItems = 'flex-start'
    modal.style.overflow = 'visible'
    card.style.height = 'max-content'
    card.style.maxHeight = 'none'
    card.style.overflow = 'visible'
    pages.style.flex = 'none'
    pages.style.height = 'auto'
    pages.style.minHeight = '0'
    pageEl.style.position = 'relative'
    pageEl.style.inset = 'auto'
    pageEl.style.height = 'auto'
    pageEl.style.overflow = 'visible'
  })
  await page.waitForTimeout(120)
  await page.evaluate(() => {
    const root = document.getElementById('trpg-assistant-root')?.shadowRoot
    const win = root?.querySelector('.trpg-window')
    const card = root?.querySelector('.trpg-modal__card')
    const pageEl = root?.querySelector('.trpg-modal__page:not(.is-under)')
    if (!(card instanceof HTMLElement) || !(win instanceof HTMLElement)) return
    const needed = Math.max(900, card.scrollHeight, pageEl instanceof HTMLElement ? pageEl.scrollHeight : 0) + 300
    const pages = root?.querySelector('.trpg-modal__pages')
    if (pages instanceof HTMLElement) pages.style.height = `${needed - 52}px`
    if (pageEl instanceof HTMLElement) pageEl.style.height = `${needed - 52}px`
    card.style.height = `${needed}px`
    win.style.height = `${needed + 220}px`
  })
  await page.waitForTimeout(80)
}


/** 拍完整弹窗（含内容区滚动到下面的部分）。 */
export async function captureModal(page, path) {
  const saved = await page.evaluate(() => {
    const root = document.getElementById('trpg-assistant-root')?.shadowRoot
    const els = [root?.querySelector('.trpg-window'), root?.querySelector('.trpg-shell'), root?.querySelector('.trpg-modal'), root?.querySelector('.trpg-modal__card'), root?.querySelector('.trpg-modal__pages'), root?.querySelector('.trpg-modal__page:not(.is-under)')]
    return els.map((el) => (el instanceof HTMLElement ? el.getAttribute('style') : null))
  })
  await expandModal(page)
  const viewport = page.viewportSize()
  const box = await page.locator('.trpg-modal__card').boundingBox()
  const tall = !!viewport && !!box && box.height + 80 > viewport.height
  if (viewport && box && tall) {
    await page.setViewportSize({ width: viewport.width, height: Math.min(4200, Math.max(1600, Math.ceil(box.height + 80))) })
    await page.waitForTimeout(400)
  }
  try {
    await page.locator('.trpg-modal__card').screenshot({ path })
  } finally {
    if (viewport && tall) await page.setViewportSize(viewport).catch(() => undefined)
    await page.evaluate((styles) => {
      const root = document.getElementById('trpg-assistant-root')?.shadowRoot
      const els = [root?.querySelector('.trpg-window'), root?.querySelector('.trpg-shell'), root?.querySelector('.trpg-modal'), root?.querySelector('.trpg-modal__card'), root?.querySelector('.trpg-modal__pages'), root?.querySelector('.trpg-modal__page:not(.is-under)')]
      els.forEach((el, i) => { if (el instanceof HTMLElement) { if (styles[i] === null) el.removeAttribute('style'); else el.setAttribute('style', styles[i]) } })
    }, saved).catch(() => undefined)
  }
}
