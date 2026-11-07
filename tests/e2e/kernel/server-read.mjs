// 只读验证官方匿名 socket 是否提供测试所需模板；不登录、不发送文档写入请求。
import { chromium } from 'playwright-core'
import { loadOfficial } from './official.mjs'
import { save, digest } from './assets.mjs'

const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await (await browser.newContext({ bypassCSP: true, viewport: { width: 1440, height: 900 } })).newPage()
const result = {}
try {
  await loadOfficial(page)
  const response = await page.evaluate(async () => {
    let timer
    const socket = await Promise.race([foundry.Game.connect(), new Promise((_, reject) => {
      timer = setTimeout(() => reject(Error('Anonymous connection timed out')), 10_000)
    })]).finally(() => clearTimeout(timer))
    try {
      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(Error('Anonymous template read timed out')), 10_000)
        socket.emit('template', 'templates/generic/tab-navigation.hbs', response => { clearTimeout(timeout); resolve(response) })
      })
    } finally {
      // Game.connect 自带断线通知依赖完整 UI；测试结束主动关闭时不触发该 UI。
      socket.removeAllListeners('disconnect')
      socket.disconnect()
    }
  })
  result.template = response
  result.status = response.error ? 'denied' : typeof response.html === 'string' ? 'available' : 'unexpected-response'
  if (response.html) result.sha256 = digest(response.html)
} catch (error) {
  result.status = 'failed'
  result.error = error.message
} finally {
  await save('anonymous-template-read.json', result)
  console.log(JSON.stringify({ status: result.status, error: result.error ?? result.template?.error,
    templateBytes: result.template?.html?.length, sha256: result.sha256 }))
  await browser.close()
}
