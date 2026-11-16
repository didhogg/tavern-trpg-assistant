// static.mjs 的类型声明（单元测试是 TypeScript，需要它才能直接引用 .mjs）。
import type { Server } from 'node:http'
export const root: string
export function startStatic(options?: { port?: number }): Promise<{ server: Server; requests: Array<{ path: string; status: number }>; url: string }>
