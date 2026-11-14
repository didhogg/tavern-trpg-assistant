// 结算适配器登记（P5.6）：规则数据里 kernel.adapter 写的名字在这里登记。
// 现在只有一个：插件自带的 Foundry 底座 + 规则系统 + Plutonium（vendor/foundry，kernel/input.ts 启动）。
// 以后换底座 = 再登记一个名字、实现它的启动入口；规则数据改指向它，别处不动。
import registry from '../../library/scopes.json'
import type { RuleKernel } from '../registry'

export const KERNEL_ADAPTERS = ['foundry'] as const
export type KernelAdapter = (typeof KERNEL_ADAPTERS)[number]

const RULES = registry.rules as Record<string, { kernel?: RuleKernel }>

/** 这个规则的结算设置；规则没登记、没写 kernel、或适配器没登记 → null。 */
export function ruleKernel(rule: string): (RuleKernel & { adapter: KernelAdapter }) | null {
  const k = RULES[rule]?.kernel
  return k && (KERNEL_ADAPTERS as readonly string[]).includes(k.adapter) ? (k as RuleKernel & { adapter: KernelAdapter }) : null
}

/** 结算内核支不支持这个规则版本；规则登记表据此判断能不能建战役。 */
export const kernelSupports = (rule: string): boolean => ruleKernel(rule) !== null
