import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  {"id": "spell.aid.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用三环或更高法术位施展该法术时，你使用的法术位每比二环高一环，每个目标的生命值上限和当前生命值就额外提高 5 点。", "auto": false}], "basis": "条目 higherLevel 原文；加的是生命值上限与当前生命值，不是治疗量，没有合适的自动 kind（不许新增），只留文字（规划者 3b 核验改）"},
  {"id": "spell.false-life.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用二环或更高法术位施展该法术时，你使用的法术位每比一环高一环，其给予的临时生命值就增加 5。", "auto": false}], "basis": "条目 higherLevel 原文；加的是临时生命值，不是治疗量，没有合适的自动 kind（不许新增），只留文字（规划者 3b 核验改）"},
  {"id": "spell.heal.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "heal", "dice": "10", "step": 1}], "basis": "条目 higherLevel 原文"},
]
