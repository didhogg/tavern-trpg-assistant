// 插件本体的骰子后端（上位设计 §3.7）：骰式读取与掷骰都交给作者小窗里的作者骰子程序（frame/dice-commands.ts）。
// 第一次用时开一个英文作者小窗（作者骰子语言中英两站相同），之后复用；只读本地，不联网。
import { LibraryDatabase } from '../db'
import { FileProvider } from '../files'
import type { DiceRead, DiceRollResult } from './frame/dice-commands'
import { libraryHandlers } from './handlers'
import { startAuthorFrame, type AuthorFrame } from './host'

export type { DiceRead, DiceRollResult }

/** 骰盘用到的两件事；测试可换成别的实现。 */
export interface DiceBackend {
  read(text: string): Promise<DiceRead>
  roll(formula: string, points?: number[]): Promise<DiceRollResult>
}

const CODE_SET = 'en'
let opening: Promise<AuthorFrame> | null = null

function frame(): Promise<AuthorFrame> {
  opening ??= (async () => {
    const db = new LibraryDatabase()
    const files = new FileProvider({ db })
    return startAuthorFrame({
      codeSet: CODE_SET,
      // 本文件打包进 dist/index.js，插件根目录是它的上一级
      pluginRoot: new URL('../', import.meta.url),
      container: document.body,
      handlers: libraryHandlers({ codeSet: CODE_SET, db, files, allowNetwork: () => false }),
    })
  })().catch((error: unknown) => {
    opening = null
    throw error
  })
  return opening
}

export const authorDice: DiceBackend = {
  read: async (text) => (await frame()).call('diceRead', text),
  roll: async (formula, points) => (await frame()).call('diceRoll', formula, points),
}
