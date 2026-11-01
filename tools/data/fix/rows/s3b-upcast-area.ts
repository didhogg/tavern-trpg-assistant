import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  {"id": "spell.confusion.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "area", "add": 5, "unit": "ft", "step": 1}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.fog-cloud.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "area", "add": 20, "unit": "ft", "step": 1}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.mordenkainens-private-sanctum.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "area", "add": 100, "unit": "ft", "step": 1}], "basis": "条目 higherLevel 原文"},
]
