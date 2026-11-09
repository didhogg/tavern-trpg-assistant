import { createPinia, type Pinia } from 'pinia'
import { createApp } from 'vue'
import type { StContext } from '../../host/types'
import App from '../App.vue'
import base from '../styles/base.css?inline'
import dice from '../styles/dice.css?inline'
import kit from '../styles/kit.css?inline'
import pages from '../styles/pages.css?inline'
import palette from '../styles/palette.css?inline'
import shell from '../styles/shell.css?inline'
import tokens from '../styles/tokens.css?inline'

const HOST_ID = 'trpg-assistant-root'

/** 在 Shadow DOM 中挂载界面；样式与酒馆互相隔离。重复调用不会重复挂载。 */
export function mountApp(ctx: StContext): Pinia | null {
  if (document.getElementById(HOST_ID)) return null
  const host = document.createElement('div')
  host.id = HOST_ID
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = [tokens, palette, base, shell, kit, pages, dice].join('\n')
  const portal = document.createElement('div')
  portal.className = 'trpg-portal'
  const container = document.createElement('div')
  shadow.append(style, container, portal)
  document.body.appendChild(host)
  const pinia = createPinia()
  createApp(App, { ctx, portalTarget: portal }).use(pinia).mount(container)
  return pinia
}
