// 三个宽度各画不同内容（同一屏里展示几种状态）：tri({ '1440': (L)=>屏, '900': …, '390': … }, { '1440': '说明文字', … })
import { frameHtml } from './frame.mjs'
export const tri = (fns, captions = {}) => () => ['1440', '900', '390'].map((k) => frameHtml(k, { render: (L) => fns[k](L), captions })).join('')
