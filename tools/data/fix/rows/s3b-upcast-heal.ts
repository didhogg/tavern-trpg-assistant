import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  {"id": "spell.aid.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "heal", "dice": "5", "step": 1}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.false-life.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "heal", "dice": "5", "step": 1}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.heal.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "heal", "dice": "10", "step": 1}], "basis": "条目 higherLevel 原文"},
]
