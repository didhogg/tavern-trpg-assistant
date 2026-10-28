export const failures = []

export function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`)
  if (!ok) failures.push(name)
}

export const settle = (page, ms = 250) => page.waitForTimeout(ms)
export const bodyPointerEvents = (page) => page.evaluate(() => document.body.style.pointerEvents)

export async function clickCenter(page, locator) {
  const box = await locator.boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

/** 点击导航中的某个页面（侧栏、窄屏标签栏通用；按钮名称来自文字或 title）。 */
export async function gotoPage(page, name) {
  await page.locator('.trpg-window nav').getByRole('button', { name, exact: true }).click()
  await settle(page, 150)
}

/** 打开设置 › 诊断。 */
export async function openDiagnostics(page) {
  await gotoPage(page, '设置')
  await page.locator('.trpg-content').getByRole('button', { name: /^打开/ }).first().click()
  await page.getByTestId('diagnostics').waitFor()
}

export const modalCount = (page) => page.locator('.trpg-modal').count()

/** 当前页面为浅色或深色主题，供截图命名用。 */
export const theme = (page) => page.evaluate(() => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
