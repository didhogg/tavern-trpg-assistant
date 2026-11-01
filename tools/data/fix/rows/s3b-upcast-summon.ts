import type { Fix } from '../engine'

export const ROWS: Fix[] = [
  {"id": "spell.conjure-animals.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用更高法术位施展该法术时，选择上文所述召唤选项之一，并显现更多生物：五环法术位显现两倍生物，七环法术位显现三倍生物，九环法术位显现四倍生物。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.conjure-celestial.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用九环法术位施展该法术时，你将召唤一个 挑战等级 5或更低的天界生物。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.conjure-elemental.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用六环或更高法术位施展该法术时，你使用的法术位每比五环高一环，召唤生物挑战等级就增加 1。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.conjure-fey.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用七环或更高法术位施展该法术时，你使用的法术位每比六环高一环，召唤生物挑战等级就增加 1。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.conjure-minor-elementals.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用更高法术位施展该法术时，选择上文所述召唤选项之一，并显现更多生物：六环法术位显现两倍生物，八环法术位显现三倍生物。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.conjure-woodland-beings.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用更高法术位施展该法术时，选择上文所述召唤选项之一，并显现更多生物：六环法术位显现两倍生物，八环法术位显现三倍生物。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.creation.phb", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用六环或更高法术位施展该法术时，你使用的法术位每比五环高一环，创造物尺寸的立方边长就加大 5 尺。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.infernal-calling.xge", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用六环或更高法术位施展该法术时，你使用的法术位每比五环高一环，召唤生物挑战等级就增加 1。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.spirit-of-death.bmt", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用5环或更高法术位施放本法术时，该法术召唤的收割者灵魄数据中使用更高的法术环阶。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-aberration.tce", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用五环或更高法术位施展该法术时，该生物数据中使用更高的法术环数。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-beast.tce", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用三环或更高法术位施展该法术时，该生物数据中使用更高的法术环数。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-celestial.tce", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 当你用6环或更高的法术位施展此法术时，用对应的环数决定数据栏中与法术环数有关的数据。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-construct.tce", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用4环或更高法术位施展该法术时，该生物数据中使用更高的法术环数。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-elemental.tce", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用五环或更高法术位施展该法术时，该生物数据中使用更高的法术环数。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-fey.tce", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用4环或更高法术位施展该法术时，该生物数据中使用更高的法术环数。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-fiend.tce", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用七环或更高法术位施展该法术时，该生物数据中使用更高的法术环数。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-greater-demon.xge", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 当你使用五环或更高的法术位施放该法术时，使用的法术位每高一环，允许召唤的恶魔挑战等级就+1。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-lesser-demons.xge", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 当你使用六环或七环的法术位施放该法术时，被召唤的恶魔数量变为两倍。当你使用八环或九环的法术位施放该法术时，被召唤的恶魔数量变为三倍。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-shadowspawn.tce", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用4环或更高法术位施展该法术时，该生物数据中使用更高的法术环数。", "auto": false}], "basis": "条目 higherLevel 原文"},
  {"id": "spell.summon-undead.tce", "path": "/data/upcast", "op": "set", before: undefined, "after": [{"kind": "note", "text": "升环施法 使用4环或更高法术位施展该法术时，该生物数据中使用更高的法术环数。", "auto": false}], "basis": "条目 higherLevel 原文"},
]
