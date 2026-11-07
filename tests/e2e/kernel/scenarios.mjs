// 结算场景：由脚本从现成角色/怪物批量生成（蓝图 §4“不手写期望值”），标准答案与结算小窗跑同一串。
// 骰点是固定循环序列，只取 1～4（任何面数 ≥4 的骰子都合法）；够不够由内核自己报告“缺骰点”。
const POINTS = [3, 1, 4, 1, 2, 4, 2, 3, 4, 4, 1, 2, 3, 3, 2, 1]
const points = n => Array.from({ length: n }, (_, i) => POINTS[i % POINTS.length])

export function scenarioList(actors) {
  const list = []
  for (const a of actors) {
    const id = a._id
    list.push(['damage', id, [{ value: 5, type: 'slashing' }], [], {}])
    list.push(['save', id, 'dex', points(4)])
    list.push(['skill', id, 'prc', points(4)])
    const weapon = (a.items ?? []).find(i => Object.values(i.system?.activities ?? {}).some(x => x.type === 'attack'))
    if (weapon) list.push(['attack', id, weapon._id, points(12)])
    list.push(['rest', id, 'short', points(8)])
    list.push(['rest', id, 'long', points(8)])
    const cls = (a.items ?? []).find(i => i.type === 'class')
    if (cls) list.push(['levelUpSteps', id, cls._id, 1])
    list.push(['save', id, 'wis', []]) // 故意不给骰点：应得“缺骰点”
  }
  list.push(['unsupported'])
  return list
}

/** 在页面里按顺序跑：call(fn, ...args) 由调用方提供（原件页注入的命令，或结算小窗的 call）。 */
export const runScenarios = async (call, list) => {
  const out = []
  for (const [fn, ...args] of list) out.push(await call(fn, ...args))
  return out
}
