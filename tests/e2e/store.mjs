// 测试用：直接读写页面里的 Pinia store（只用来制造「有未保存改动」这类界面上暂时没有入口的状态）。
export function callStore(page, id, fn, arg) {
  return page.evaluate(
    async ({ id, fn, arg }) => {
      const root = document.getElementById('trpg-assistant-root').shadowRoot
      const app = [...root.children].map((c) => c.__vue_app__).find(Boolean)
      const store = app.config.globalProperties.$pinia._s.get(id)
      return await new Function('store', 'arg', `return (${fn})(store, arg)`)(store, arg)
    },
    { id, fn: fn.toString(), arg },
  )
}

/** 往当前战役里加一个实例，让它变成「有未保存改动」。 */
export const makeDirty = (page, name = '测试怪') =>
  callStore(page, 'campaign', (s, n) => { s.updateData((d) => ({ ...d, instances: [...d.instances, { id: `x-${Date.now()}`, type: 'monster', name: n, data: {} }] })) }, name)
