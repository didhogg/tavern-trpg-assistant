import { r as e } from "./state-CBed4Nnm.js";
import { t } from "./protocol-03CO7Rhf.js";
// src/rules/kernel/packages.ts
var n = [
	"esmodules",
	"scripts",
	"styles"
];
function r(e, t) {
	let r = `${t}s/${e.id}/`, i = (e) => /^(?:[a-z]+:)?\/\//i.test(e) || e.startsWith(r) ? e : r + e.replace(/^\.?\//, ""), a = structuredClone(e);
	for (let e of n) {
		let t = a[e];
		Array.isArray(t) && (a[e] = t.map((e) => typeof e == "string" ? i(e) : {
			...e,
			src: i(String(e.src))
		}));
	}
	return Array.isArray(a.languages) && (a.languages = a.languages.map((e) => ({
		...e,
		path: i(e.path)
	}))), a;
}
// src/rules/kernel/frame/world.ts
function i(e) {
	let { CONST: t, CONFIG: n, foundry: i } = globalThis, a = r(e.system, "system"), o = e.modules.map((e) => ({
		...r(e, "module"),
		active: !0
	})), s = `${e.release.generation}.${e.release.build}`, c = {
		coreVersion: s,
		systemId: a.id,
		systemVersion: a.version
	}, l = 0, u = Object.entries({
		...e.settings,
		"core.moduleConfiguration": Object.fromEntries(o.map((e) => [e.id, !0]))
	}).map(([e, t]) => ({
		_id: `kernelSetting${String(++l).padStart(3, "0")}`,
		key: e,
		value: JSON.stringify(t),
		_stats: c
	})), d = Object.fromEntries(t.ALL_DOCUMENT_TYPES.map((e) => {
		let r = /* @__PURE__ */ new Set([
			"base",
			...Object.keys(n[e]?.dataModels ?? {}),
			...Object.keys(n[e]?.typeLabels ?? {}),
			...Object.keys(a.documentTypes?.[e] ?? {}),
			...e === "Folder" ? t.FOLDER_DOCUMENT_TYPES : []
		]);
		return [e, Object.fromEntries([...r].map((e) => [e, {}]))];
	})), f = [...new i.packages.System(a).packs].map((e) => ({
		...e,
		id: `${a.id}.${e.name}`,
		packageType: "system",
		packageName: a.id,
		system: a.id,
		index: [],
		folders: []
	})), p = e.documents;
	return {
		userId: e.userId,
		release: e.release,
		system: a,
		modules: o,
		model: d,
		packs: f,
		settings: u,
		world: {
			id: e.world.id,
			title: e.world.title,
			system: a.id,
			coreVersion: s,
			systemVersion: a.version,
			flags: { [a.id]: { version: a.version } }
		},
		options: { language: e.language },
		users: [{
			_id: e.userId,
			name: "GM",
			role: t.USER_ROLES.GAMEMASTER
		}],
		actors: p.actors ?? [],
		items: p.items ?? [],
		folders: p.folders ?? [],
		scenes: p.scenes ?? [],
		combats: p.combats ?? [],
		journal: p.journal ?? [],
		macros: p.macros ?? [],
		tables: p.tables ?? [],
		playlists: [],
		cards: [],
		messages: []
	};
}
// src/rules/kernel/frame/server.ts
function a(e, t) {
	let n = {};
	for (let r of t) {
		let t = r.split(".");
		if (t.some((e) => [
			"__proto__",
			"constructor",
			"prototype"
		].includes(e))) throw Error("Unsafe index path");
		let i = t.reduce((e, t) => e?.[t], e);
		if (i === void 0) continue;
		let a = n, o = t.pop();
		for (let e of t) a = a[e] ??= {};
		a[o] = i;
	}
	return n;
}
function o(e, t) {
	let n = globalThis, r = [], i = [], o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), c = 0, l = e.emit.bind(e), u = async (e) => o.get(e) ?? t.readPack(e);
	async function d(e) {
		let t = e.operation, n = t.pack ?? null;
		if (e.action === "get") {
			if (!n) return [];
			let e = t.query ?? {};
			if (Object.keys(e).some((e) => e !== "_id")) throw Error(`Unsupported pack query: ${JSON.stringify(e)}`);
			let r = await u(n), i = e._id ? r.filter((t) => t._id === e._id) : r;
			if (!t.index) return structuredClone(i);
			if (!Array.isArray(t.indexFields)) throw Error("Official index request has no fields");
			return i.map((e) => a(e, t.indexFields));
		}
		if (n && !o.has(n)) throw Error(`Original pack is read-only: ${n}`);
		let i = t.parentUuid ?? null, l = n ? o.get(n) : s.get(e.type) ?? s.set(e.type, []).get(e.type);
		if (e.action === "create") {
			let a = t.data.map((e) => {
				let n = structuredClone(e);
				return t.keepId && n._id || (n._id = `kernel${String(++c).padStart(10, "0")}`), n;
			});
			i || l.push(...a);
			for (let t of a) r.push({
				action: "create",
				type: e.type,
				pack: n,
				parentUuid: i,
				data: t
			});
			return a;
		}
		if (e.action === "update") {
			for (let a of t.updates) r.push({
				action: "update",
				type: e.type,
				pack: n,
				parentUuid: i,
				data: structuredClone(a)
			});
			return t.updates;
		}
		if (e.action === "delete") {
			for (let a of t.ids) r.push({
				action: "delete",
				type: e.type,
				pack: n,
				parentUuid: i,
				data: { _id: a }
			});
			return t.ids;
		}
		throw Error(`Unsupported document operation: ${e.action}`);
	}
	return e.emit = function(e, ...r) {
		let a = JSON.parse(JSON.stringify(r.filter((e) => typeof e != "function")));
		i.push({
			event: e,
			args: a
		});
		let s = typeof r.at(-1) == "function" ? r.at(-1) : null, c = (e, t) => {
			e.then((e) => s(t(e)), (e) => s({ error: { message: e.message } }));
		};
		if (e === "template") return c(t.readText(r[0]), (e) => ({ html: e }));
		if (e === "time") return s({
			serverTime: Date.now(),
			worldTime: t.worldTime
		});
		if (e === "modifyDocument") {
			let e = a[0];
			return c(d(e), (n) => ({
				...e,
				userId: t.userId,
				result: n
			}));
		}
		if (e === "modifyDocumentBatch") {
			let e = a[0];
			return c(Promise.all(e.map(async (e) => ({
				...e,
				userId: t.userId,
				result: await d(e)
			}))), (e) => ({ results: e }));
		}
		if (e === "manageCompendium") {
			let e = a[0];
			if (e.action !== "create") return s({ error: { message: `Unsupported compendium operation: ${e.action}` } });
			let t = [...new n.foundry.packages.World({
				...n.game.world.toObject(),
				packs: [e.data]
			}).packs][0], r = `${e.data.package}.${t.name}`;
			return o.set(r, []), s({
				request: e,
				result: {
					...t,
					id: r,
					packageType: "world",
					packageName: n.game.world.id,
					system: n.game.system.id,
					index: [],
					folders: []
				}
			});
		}
		return s ? s({ error: { message: `Unsupported server request: ${e}` } }) : l(e, ...r);
	}, {
		changes: r,
		calls: i
	};
}
// src/rules/kernel/frame/random.ts
var s = null;
function c(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return t >>> 0;
}
function l(e) {
	s = e.crypto.getRandomValues.bind(e.crypto);
	let t = 0, n = () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), (e ^ e >>> 14) >>> 0;
	};
	return Object.defineProperty(e.crypto, "getRandomValues", {
		value: (e) => {
			if (!e) return e;
			let t = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
			for (let e = 0; e < t.length; e += 4) {
				let r = n();
				for (let n = 0; n < 4 && e + n < t.length; n++) t[e + n] = r >>> 8 * n & 255;
			}
			return e;
		},
		configurable: !0,
		writable: !0
	}), (e) => {
		t = c(e);
	};
}
function u() {
	let e = /* @__PURE__ */ new Uint32Array(4);
	return s ? s(e) : crypto.getRandomValues(e), Array.from(e, (e) => e.toString(16).padStart(8, "0")).join("");
}
// src/rules/kernel/frame/seed.ts
var d = l(globalThis);
function f() {
	return u();
}
function p(e) {
	d(e);
}
function ee(e, t) {
	let n = t;
	return `entry:${e}:${String(n?.source ?? "")}:${String(n?.name ?? "")}:${te(JSON.stringify(t))}`;
}
function te(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return (t >>> 0).toString(16);
}
// src/rules/kernel/frame/writings.ts
var ne = [
	{
		id: "midi-qol",
		test: (e) => e.startsWith("flags.midi-qol."),
		reason: "只有 midi-qol 认识的写法（驾驶员定不用 midi-qol）"
	},
	{
		id: "dae",
		test: (e) => e.startsWith("flags.dae."),
		reason: "只有 DAE 认识的写法（不用 DAE）"
	},
	{
		id: "macro",
		test: (e) => e.startsWith("macro."),
		reason: "宏写法：不执行任何 JS（蓝图决定 6）"
	}
];
function re(e, t) {
	let n = String(t.key ?? ""), r = ne.find((e) => e.test(n));
	if (r) return {
		key: n,
		value: t.value,
		rule: r.id,
		reason: r.reason,
		affects: n
	};
	let i = globalThis;
	return n.startsWith("token.") || typeof i.CONFIG?.ActiveEffect?.documentClass?.CHANGE_TYPES?.[t.type]?.handler == "function" || (n.startsWith("system.") ? e.system?.getFieldForProperty?.(n.slice(7)) : e.getFieldForProperty(n)) || i.foundry.utils.getProperty(e, n) !== void 0 ? null : {
		key: n,
		value: t.value,
		rule: "no-target",
		reason: "目标路径既没有数据字段，人物身上也没有这个属性；原代码写进去也没有规则读取",
		affects: n
	};
}
function m(e) {
	let t = [];
	for (let n of e.allApplicableEffects()) for (let r of n.system?.changes ?? n.changes ?? []) {
		let i = re(e, r);
		i && t.push({
			actor: e.id,
			effect: n.uuid,
			...i
		});
	}
	return t;
}
// src/rules/kernel/frame/commands-items.ts
var h = globalThis;
function g(e) {
	return !e || e.max === void 0 || e.max === null || e.max === "" ? null : {
		value: e.value ?? null,
		max: e.max ?? null,
		spent: e.spent ?? null
	};
}
function _(e) {
	return {
		id: e.id,
		name: e.name,
		type: e.type,
		equipped: "equipped" in e.system ? e.system.equipped : null,
		attuned: "attuned" in e.system ? e.system.attuned : null,
		attunement: e.system.attunement ?? null,
		uses: g(e.system.uses),
		activities: e.system.activities ? [...e.system.activities].map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			uses: g(e.uses)
		})) : []
	};
}
function v(e) {
	let t = e.system.attributes?.ac, n = e.system.attributes?.attunement;
	return {
		ac: t ? {
			value: t.value ?? null,
			calc: t.calc ?? null,
			formula: t.formula ?? null
		} : null,
		attunement: n ? {
			value: n.value ?? null,
			max: n.max ?? null
		} : null
	};
}
function ie(e) {
	return e.map((e) => ({
		formula: e.formula ?? null,
		total: e.total ?? null,
		dice: e.dice?.map((e) => ({
			faces: e.faces,
			results: e.results?.map((e) => e.result)
		})) ?? []
	}));
}
function ae(e, t) {
	let n = (e, n) => t(e).items.get(n, { strict: !0 });
	return {
		equip: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.equipped": !!a }), {
				item: _(o),
				actor: v(e)
			};
		}, [r]),
		attune: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.attuned": !!a }), {
				item: _(o),
				actor: v(e)
			};
		}, [r]),
		useItem: (t, r, i = [], a = null) => {
			let o = [], s = h.ui?.notifications, c = s?.error;
			return s && c && (s.error = function(e, ...t) {
				return o.push(String(e)), c.call(this, e, ...t);
			}), e(i, async () => {
				let e = n(t, r), i, s = null;
				if (a) {
					if (s = e.system.activities?.get(a), !s) throw Error(`Item has no activity: ${a}`);
					i = await s.use({}, { configure: !1 }, { create: !1 });
				} else i = await e.use({}, { configure: !1 }, { create: !1 });
				return {
					item: _(e),
					activity: s ? {
						id: s.id,
						name: s.name,
						type: s.type
					} : null,
					effects: (i?.effects ?? []).map((e) => ({
						id: e.id,
						name: e.name,
						uuid: e.uuid
					})),
					message: i?.message ? {
						title: i.message.title ?? null,
						type: i.message.type ?? null
					} : null,
					notifications: o
				};
			}, [t]).then((e) => e.status === "complete" && e.result?.notifications?.length && !e.result.message && !e.result.effects?.length ? {
				...e,
				status: "missing",
				missing: { reason: e.result.notifications }
			} : e).finally(() => {
				s && c && (s.error = c);
			});
		},
		recover: (n, r, i = []) => e(i, async () => {
			let e = t(n), i = [];
			for (let t of e.items) {
				if (t.isHidden || typeof t.system.recoverUses != "function") continue;
				let n = await t.system.recoverUses(/* @__PURE__ */ new Map([[r, 1]]));
				n && (n.destroy ? (await e.deleteEmbeddedDocuments("Item", [t.id]), i.push({
					id: t.id,
					name: t.name,
					destroy: !0
				})) : h.foundry.utils.isEmpty(n.updates) || (await t.update(n.updates), i.push({
					id: t.id,
					name: t.name,
					updates: n.updates,
					rolls: ie(n.rolls ?? [])
				})));
			}
			return {
				period: r,
				items: i,
				actor: v(e)
			};
		}, [n])
	};
}
// src/rules/kernel/frame/commands-combat.ts
var y = globalThis;
function oe(e) {
	let t = e.system.spells;
	return t ? Object.fromEntries(Object.entries(t).map(([e, t]) => [e, {
		value: t.value ?? null,
		max: t.max ?? null,
		level: t.level ?? null,
		type: t.type ?? null
	}])) : null;
}
function b(e) {
	let t = e.concentration?.effects;
	return {
		effects: t ? [...t].map((e) => ({
			id: e.id,
			name: e.name,
			statuses: e.statuses ?? []
		})) : [],
		limit: e.system.attributes?.concentration?.limit ?? null
	};
}
function se(e) {
	return {
		statuses: e.statuses ? [...e.statuses] : [],
		effects: e.effects.contents.map((e) => ({
			id: e.id,
			name: e.name,
			statuses: e.statuses ?? [],
			disabled: e.disabled
		}))
	};
}
function x(e) {
	return {
		id: e.id,
		name: e.name,
		round: e.round,
		turn: e.turn,
		started: e.started,
		ended: e.ended,
		current: e.combatant?.actor?.id ?? null,
		combatants: e.combatants.contents.map((e) => ({
			id: e.id,
			actorId: e.actorId,
			name: e.actor?.name ?? e.name,
			initiative: e.initiative ?? null,
			defeated: e.isDefeated ?? !1
		}))
	};
}
function ce(e) {
	return {
		formula: e.formula ?? null,
		total: e.total ?? null,
		isCritical: e.isCritical ?? null,
		isFumble: e.isFumble ?? null,
		dice: e.dice?.map((e) => ({
			faces: e.faces,
			results: e.results?.map((e) => e.result)
		})) ?? []
	};
}
function le(e, t) {
	let n = null, r = () => n ?? y.game.combat, i = () => {
		let e = r();
		if (!e) throw Error("No active combat");
		return e;
	};
	return {
		combatStart: (t, r = []) => e(r, async () => {
			let e = await y.CONFIG.Combat.documentClass.create({
				name: "Kernel encounter",
				combatants: t.map((e) => ({ actorId: e }))
			});
			return await e.rollInitiative(e.combatants.map((e) => e.id), { dialog: !1 }), await e.startCombat(), n = e, x(e);
		}, t),
		combatNext: (t = []) => e(t, async () => {
			let e = i();
			return await e.nextTurn(), x(e);
		}),
		combatEnd: () => e([], async () => {
			let e = i();
			await e.endCombat();
			let t = x(e);
			return n = null, t;
		}),
		cast: (n, r, i, a = [], o = {}) => e(a, async () => {
			let e = t(n), a = e.items.get(r, { strict: !0 }), s = a.system.activities?.get(i);
			if (!s) throw Error(`Item has no activity: ${i}`);
			let c = await s.use(o, { configure: !1 }, { create: !1 });
			return {
				item: _(a),
				activity: {
					id: s.id,
					name: s.name,
					type: s.type
				},
				slots: oe(e),
				concentration: b(e),
				effects: (c?.effects ?? []).map((e) => ({
					id: e.id,
					name: e.name,
					statuses: e.statuses ?? []
				})),
				message: c?.message ? {
					title: c.message.title ?? null,
					type: c.message.type ?? null
				} : null,
				deltas: c?.updates?.actor ?? null
			};
		}, [n]),
		condition: (n, r, i = !0) => e([], async () => {
			let e = t(n);
			return await e.toggleStatusEffect(r, { active: i }), se(e);
		}, [n]),
		concentrationCheck: (n, r, i = []) => e(i, async () => {
			let e = t(n);
			if (!e.concentration?.effects?.size) return {
				dc: null,
				skipped: "not concentrating",
				concentration: b(e)
			};
			let i = e.getConcentrationDC(r), a = await e.rollConcentration({ target: i }, { configure: !1 }, { create: !1 }), o = a?.[0] ?? null, s = o ? o.total >= i : null;
			return s === !1 && await e.endConcentration(), {
				dc: i,
				success: s,
				rolls: (a ?? []).map(ce),
				concentration: b(e)
			};
		}, [n]),
		concentration: (n) => e([], async () => b(t(n)), [n])
	};
}
// src/rules/kernel/frame/importer.ts
var S = globalThis, ue = {
	skillsChosenFvtt: [],
	languagesChosenFvtt: [],
	armorProficienciesChosenFvtt: [],
	weaponProficienciesChosenFvtt: [],
	toolProficienciesChosenFvtt: []
};
async function C(e, t) {
	let n = S.game.modules.get("plutonium")?.api;
	if (!n?.importer) throw Error("Plutonium importer is not available");
	let r = await n.importer.pGetImporter({ prop: e });
	if (!r) throw Error(`No Plutonium importer for ${e}`);
	p(ee(e, t));
	let i = structuredClone(t), a = new n.importer.ImportOpts({ isTemp: !0 }), o = (e === "class" && r.pImportEntryClass ? await r.pImportEntryClass(i, a) : await r.pImportEntry(i, a, structuredClone(ue)))?.imported?.[0]?.document ?? null;
	if (!o) throw Error(`Plutonium import failed for ${t?.name ?? e}`);
	return o.toObject ? o.toObject() : o;
}
async function de(e) {
	return (await w(e)).map((e) => e.prop);
}
async function w(e) {
	let t = S.game.modules.get("plutonium")?.api;
	if (!t?.importer) throw Error("Plutonium importer is not available");
	let n = [];
	for (let r of e) try {
		let e = await t.importer.pGetImporter({ prop: r });
		e && n.push({
			prop: r,
			folderType: e.constructor?.FOLDER_TYPE ?? e.FOLDER_TYPE ?? null
		});
	} catch {}
	return n;
}
// src/rules/kernel/frame/actor-state.ts
async function T(t, n) {
	if (n) {
		n.actor && Object.keys(n.actor).length && await t.update(n.actor);
		for (let [r, i] of Object.entries(n.items ?? {})) {
			let n = e([...t.items], r);
			if (!n) throw Error(`状态差别指向的物品在重建结果里不存在：${r}`);
			await n.update(i);
		}
		for (let e of n.itemAdded ?? []) t.items.get(e._id) || await t.createEmbeddedDocuments("Item", [e], { keepId: !0 });
		for (let r of n.itemRemoved ?? []) {
			let n = e([...t.items], r);
			n?._id && await t.deleteEmbeddedDocuments("Item", [n._id]);
		}
		for (let [e, r] of Object.entries(n.effects ?? {})) {
			let n = t.effects.get(e);
			if (!n) throw Error(`状态差别指向的效果在重建结果里不存在：${e}`);
			await n.update(r);
		}
		for (let e of n.effectAdded ?? []) t.effects.get(e._id) || await t.createEmbeddedDocuments("ActiveEffect", [e], { keepId: !0 });
		for (let e of n.effectRemoved ?? []) await t.deleteEmbeddedDocuments("ActiveEffect", [e]);
	}
}
// src/rules/kernel/frame/commands-monsters.ts
var E = globalThis;
function fe(e) {
	return Object.fromEntries(Object.entries(e.abilities ?? {}).map(([e, t]) => [e, {
		value: t.value ?? null,
		mod: t.mod ?? null,
		save: t.save?.value ?? t.save ?? null,
		proficient: t.proficient ?? null
	}]));
}
function pe(e) {
	return Object.fromEntries(Object.entries(e.skills ?? {}).map(([e, t]) => [e, {
		total: t.total ?? null,
		passive: t.passive ?? null,
		proficient: t.proficient ?? null
	}]));
}
function me(e) {
	return e ? Array.isArray(e) ? e : typeof e[Symbol.iterator] == "function" ? [...e] : Object.values(e) : [];
}
function he(e) {
	return {
		id: e.id ?? e._id ?? null,
		name: e.name,
		type: e.type,
		activities: me(e.system?.activities).map((e) => ({
			id: e.id ?? e._id,
			type: e.type,
			name: e.name
		})),
		uses: e.system?.uses?.max ? {
			max: e.system.uses.max,
			spent: e.system.uses.spent ?? null
		} : null
	};
}
function D(e) {
	let t = e.toObject ? e.toObject() : e, n = e.system ?? t.system ?? {}, r = e.items?.contents ?? e.items ?? t.items ?? [];
	return {
		name: e.name ?? t.name,
		type: e.type ?? t.type,
		ac: n.attributes?.ac?.value ?? null,
		hp: n.attributes?.hp ? {
			value: n.attributes.hp.value ?? null,
			max: n.attributes.hp.max ?? null
		} : null,
		abilities: fe(n),
		skills: pe(n),
		cr: n.details?.cr ?? null,
		legendary: {
			actions: n.resources?.legact ? {
				value: n.resources.legact.value ?? null,
				max: n.resources.legact.max ?? null
			} : null,
			resistances: n.resources?.legres ? {
				value: n.resources.legres.value ?? null,
				max: n.resources.legres.max ?? null
			} : null
		},
		items: [...r].map(he),
		validation: e.validationFailures ?? []
	};
}
async function O(e) {
	let t = await C("monster", e);
	return {
		status: "complete",
		entity: {
			name: e.name,
			source: e.source
		},
		...D(t)
	};
}
function ge(e) {
	return {
		importMonster: (t) => e([], async () => O(t)),
		importMonsters: (t) => e([], async () => {
			let e = [];
			for (let n of t) try {
				e.push(await O(n));
			} catch (t) {
				e.push({
					status: "error",
					entity: {
						name: n.name,
						source: n.source
					},
					error: t instanceof Error ? t.message : String(t)
				});
			}
			return e;
		}),
		rebuildMonster: (t) => e([], async () => {
			let e;
			e = t.data ? structuredClone(t.data) : await C("monster", t.entry), delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await E.CONFIG.Actor.documentClass.create({
				...e,
				name: t.name
			}), r = n.toObject();
			return await T(n, t.state), {
				status: "complete",
				id: n.id,
				...D(n),
				data: n.toObject(),
				base: r
			};
		}),
		importMonsterData: (t) => e([], async () => ({
			status: "complete",
			data: await C("monster", t)
		})),
		createActorFromData: (t) => e([], async () => {
			let e = structuredClone(t);
			delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await E.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...D(n)
			};
		}),
		importMonsterActor: (t) => e([], async () => {
			let e = await C("monster", t);
			delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await E.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...D(n)
			};
		})
	};
}
// src/rules/kernel/frame/commands-restore.ts
async function _e(e, t, n = []) {
	for (let r of e.items) {
		let e = r.flags?.plutonium;
		if (!e?.propDroppable || !e.source || !e.hash) continue;
		let i = n.find((e) => e.entry?.name === r.name), a = (i?.refKey ? t[i.refKey] : void 0) ?? t[`${e.propDroppable}|${e.source}|${e.hash}`] ?? [];
		for (let e of a) {
			let t = r.advancement?.byId?.[e.id];
			if (!t) continue;
			let n = r.toObject().system?.advancement?.[e.id]?.value ?? t.value?.toObject?.() ?? t.value;
			JSON.stringify(n) !== JSON.stringify(e.data) && await r.update({ [`system.advancement.${e.id}.value`]: e.data });
		}
	}
}
// src/rules/kernel/frame/commands-level.ts
var k = globalThis;
function A() {
	let e = k.dnd5e?.applications?.advancement?.AdvancementManager;
	if (!e) throw Error("dnd5e AdvancementManager is not available");
	return e;
}
function j(e, t, n, r = {}) {
	return A().forLevelChange(e, t, n, r);
}
function M(e) {
	return {
		level: e.system.details?.level ?? null,
		hp: e.system.attributes?.hp?.toObject?.() ?? e.system.attributes?.hp ?? null,
		items: e.items?.size ?? null,
		classes: e.items?.contents?.filter((e) => e.type === "class").map((e) => ({
			id: e.id,
			name: e.name,
			levels: e.system.levels ?? null
		})) ?? [],
		weapons: e.items?.contents?.filter((e) => e.type === "weapon").map((e) => ({
			id: e.id,
			name: e.name,
			activities: [...e.system.activities ?? []].map((e) => ({
				id: e.id,
				type: e.type
			})),
			damageType: e.system.damage?.base?.types?.[0] ?? null
		})) ?? []
	};
}
function N(e) {
	let t = e?.toObject ? e.toObject() : structuredClone(e);
	for (let e of [
		"_id",
		"_key",
		"folder",
		"sort",
		"ownership",
		"_stats"
	]) delete t[e];
	return t;
}
function P(e) {
	let t = e?.toObject ? e.toObject() : structuredClone(e);
	return t.flags ??= {}, t.flags.plutonium ??= {}, t.flags.plutonium.isStandardDragDrop = !0, t;
}
function ve(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
function ye(e) {
	return JSON.parse(JSON.stringify(e, (e, t) => t instanceof Set ? [...t] : t));
}
async function be(e) {
	let t = e.advancement, n = t.constructor?.typeName ?? t.type;
	if (n === "HitPoints") return { [e.level]: "avg" };
	if (n === "ItemGrant") {
		let n = await t.automaticApplicationValue?.(e.level);
		if (n !== !1) return n;
		let r = (t.configuration?.items ?? []).filter((e) => !e.optional);
		return {
			ability: t.configuration?.spell?.ability?.[0] ?? null,
			selected: (r.length ? r : t.configuration?.items ?? []).map((e) => e.uuid)
		};
	}
	if (n === "ItemChoice") {
		let n = t.configuration?.choices?.[e.level]?.count ?? 1;
		return { selected: (t.configuration?.pool ?? []).map((e) => e.uuid).slice(0, n) };
	}
	if (n === "Subclass") {
		let e = k.game.packs.get("dnd5e.subclasses");
		if (!e) return;
		let n = (await e.getIndex({ fields: ["system.classIdentifier", "type"] })).contents?.find((e) => e.type === "subclass" && e.system?.classIdentifier === t.item?.system?.identifier);
		return n ? `Compendium.${e.metadata.id}.Item.${n._id}` : void 0;
	}
	if (n === "Trait") {
		let n = await t.automaticApplicationValue?.(e.level);
		if (n !== !1) return n;
		let { available: r } = await t.unfulfilledChoices(), i = /* @__PURE__ */ new Set();
		for (let e of r) {
			let t = [...e.choices.asSet()].find((e) => !i.has(e));
			t && i.add(t);
		}
		return { chosen: [...i] };
	}
	if (n === "AbilityScoreImprovement") {
		let n = Object.entries(t.configuration?.fixed ?? {}).filter(([, e]) => e);
		if (n.length) return {
			type: "asi",
			assignments: Object.fromEntries(n)
		};
		let r = Object.keys(e.actor?.system?.abilities ?? {}).find((e) => t.canImprove?.(e) !== !1);
		return r ? {
			type: "asi",
			assignments: { [r]: 2 }
		} : void 0;
	}
	if (n === "Size") return { size: t.configuration?.sizes?.first?.() ?? "med" };
	if (n === "ScaleValue") return {};
}
async function F(e, t, { strict: n = !1 } = {}) {
	if (!e.steps.length) return { finished: !0 };
	for (let r of e.steps) {
		if (r.automatic || !r.flow) continue;
		let e = r.flow.advancement, i = t?.find((t) => t.id === e.id && t.level === r.flow.level);
		if (i) {
			if (i.error) return {
				finished: !1,
				step: {
					...I(r),
					error: i.error
				}
			};
			r.type = "restore", r.flow.retainedData = i.data, r.automatic = !0;
			continue;
		}
		if (await r.flow.getAutomaticApplicationValue() !== !1) continue;
		if (n) return {
			finished: !1,
			step: I(r)
		};
		let a = await be(r.flow);
		a !== void 0 && (r.flow.getAutomaticApplicationValue = async () => a);
	}
	let r = new Promise((t) => {
		let n = k.Hooks.on("dnd5e.advancementManagerComplete", (r) => {
			r === e && (k.Hooks.off(n), t(!0));
		});
		setTimeout(() => {
			k.Hooks.off(n), t(!1);
		}, 3e3);
	});
	return await e.render(), await r ? { finished: !0 } : {
		finished: !1,
		step: I(e.step)
	};
}
function I(e) {
	if (!e) return null;
	let t = e.flow, n = t?.advancement;
	return {
		type: e.type,
		level: e.level ?? null,
		automatic: !!e.automatic,
		error: e.error?.message ?? null,
		advancement: n ? {
			type: n.constructor?.typeName ?? n.type,
			id: n.id ?? null,
			title: n.title ?? null,
			level: t.level ?? null
		} : null
	};
}
async function L(e) {
	let t = [];
	for (let n of e.steps) {
		let e = n.flow, r = e?.advancement, i = null;
		if (typeof e?.getAutomaticApplicationValue == "function") try {
			let t = await e.getAutomaticApplicationValue();
			t !== !1 && t != null && (i = t);
		} catch {}
		t.push({
			type: n.type,
			level: n.level ?? null,
			automatic: !!n.automatic,
			class: n.class ? {
				itemId: n.class.item?.id ?? null,
				level: n.class.level ?? null
			} : null,
			advancement: r ? {
				type: r.constructor?.typeName ?? r.type,
				id: r.id ?? null,
				title: r.title ?? null,
				level: e.level ?? null
			} : null,
			automaticValue: i
		});
	}
	return t;
}
async function R(e, t, n, r = {}, { strict: i = !1, seed: a } = {}) {
	a !== void 0 && p(a);
	let o = await k.CONFIG.Actor.documentClass.create({
		name: e,
		type: "character",
		system: { details: { level: 1 } }
	});
	for (let e of t) {
		let t = N(e?.data ?? e);
		k.CONFIG.Item.dataModels[t.type]?.resetData?.(t.system);
		let n = e?.refKey ?? ve(t), a = await F(A().forNewItem(o, t, { automaticApplication: !0 }), n ? r[n] : void 0, { strict: i });
		if (!a.finished) return {
			pending: !0,
			step: a.step,
			built: M(o)
		};
		o.items.contents.some((e) => e.type === t.type && e.flags?.plutonium?.hash === t.flags?.plutonium?.hash) || await o.createEmbeddedDocuments("Item", [P(N(t))]);
	}
	return n.length && await o.createEmbeddedDocuments("Item", n.map((e) => P(N(e?.data ?? e)))), { actor: o };
}
function xe(e, t) {
	return {
		levelUpSteps: (n, r, i = 1) => e([], async () => {
			let e = await L(j(t(n), r, i));
			return {
				status: e.length ? "pending" : "complete",
				steps: e
			};
		}, [n]),
		levelUpApply: (n, r, i = 1) => e([], async () => {
			let e = t(n), a = j(e, r, i, { automaticApplication: !0 }), o = await F(a, void 0);
			return o.finished ? M(e) : {
				kernelStatus: "pending",
				reason: a.step ? "awaiting-choice" : "advancement-manager-not-complete",
				step: o.step
			};
		}, [n]),
		captureChoices: (n) => e([], async () => {
			let e = t(n).clone(), r = e.system.details?.level ?? 1, i = {}, a = Array.from(e.items);
			for (let e of a) {
				let t = e.flags?.plutonium;
				if (!t?.propDroppable || !t.source || !t.hash) continue;
				let n = `${t.propDroppable}|${t.source}|${t.hash}`, a = [];
				for (let t of Object.values(e.advancement?.byId ?? {})) for (let e of t.levels ?? []) {
					if (e > r && e !== 0) continue;
					let n = t.constructor?.typeName ?? t.type;
					try {
						let r = await t.reverse(e);
						r != null && a.push({
							id: t.id,
							type: n,
							level: e,
							data: ye(r)
						});
					} catch (r) {
						a.push({
							id: t.id,
							type: n,
							level: e,
							error: r instanceof Error ? r.message : String(r)
						});
					}
				}
				a.length && (i[n] = a);
			}
			return i;
		}, [n]),
		renameActor: (n, r) => e([], async () => {
			let e = t(n);
			return await e.update({
				name: r,
				"prototypeToken.name": r
			}), M(e);
		}, [n]),
		createActorsFromBase: (t) => e([], async () => {
			let e = await k.CONFIG.Actor.documentClass.createDocuments(t.map((e) => structuredClone(e.base)), { keepId: !0 }), n = [];
			for (let r = 0; r < e.length; r++) await T(e[r], t[r].state), n.push({
				id: e[r].id,
				...M(e[r]),
				data: e[r].toObject(),
				base: t[r].base
			});
			return n;
		}),
		buildCharacter: (t) => e([], async () => {
			let e = t.seed ?? f(), n = [];
			for (let e of t.items) n.push({
				data: e.data ?? await C(e.prop, e.entry),
				refKey: e.refKey,
				itemId: e.itemId
			});
			let r = [];
			for (let e of t.equipment ?? []) r.push({
				data: e.data ?? await C(e.prop, e.entry),
				refKey: e.refKey
			});
			let i = await R(t.name, n, r, t.choices ?? {}, {
				strict: !1,
				seed: e
			});
			return i.pending ? {
				kernelStatus: "pending",
				reason: "build-step-not-complete",
				seed: e,
				step: i.step,
				built: i.built
			} : {
				id: i.actor.id,
				seed: e,
				...M(i.actor)
			};
		}),
		buildSteps: (t) => e([], async () => {
			let e = k.CONFIG.Actor.documentClass, n = new e({
				name: "Build preview",
				type: "character",
				system: { details: { level: 1 } }
			}), r = await L(A().forNewItem(n, t));
			return {
				status: r.length ? "pending" : "complete",
				steps: r
			};
		}),
		importForBuild: (t, n) => e([], async () => C(t, n)),
		importerProps: de,
		importerMeta: w,
		rebuildCharacter: (t) => e([], async () => {
			let e = t.seed?.trim() || t.name;
			p(e);
			let n = [];
			for (let e of t.items) n.push({
				data: e.data ?? await C(e.prop, e.entry),
				refKey: e.refKey,
				itemId: e.itemId
			});
			let r = [];
			for (let e of t.equipment) r.push({
				data: e.data ?? await C(e.prop, e.entry),
				refKey: e.refKey,
				itemId: e.itemId
			});
			let i = await R(t.name, n, r, t.choices, {
				strict: !0,
				seed: e
			});
			if (i.pending) return {
				kernelStatus: "pending",
				reason: "rebuild-step-not-complete",
				step: i.step,
				built: i.built
			};
			let a = i.actor.toObject();
			return await T(i.actor, t.state), [...i.actor.items].filter((e) => e.type === "class").length > 1 && await _e(i.actor, t.choices, [...t.items, ...t.equipment]), {
				id: i.actor.id,
				seed: e,
				...M(i.actor),
				data: i.actor.toObject(),
				base: a
			};
		})
	};
}
// src/rules/kernel/frame/commands-add.ts
function Se(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
function Ce(e, t) {
	return { addToActor: (n, r) => e([], async () => {
		let e = t(n), i = e.sheet;
		if (!i?._onDropSingleItem) throw Error(`人物 ${n} 没有官方人物表单实例`);
		let a = [];
		for (let t of r) {
			let n = N(await C(t.prop, t.entry)), r = new Set(e.items.map((e) => e.id)), o = A().forNewItem(e, n, { automaticApplication: !0 });
			if (o.steps.length) {
				let e = await F(o, t.choices, { strict: !1 });
				if (!e.finished) return {
					kernelStatus: "pending",
					reason: "add-step-not-complete",
					step: e.step,
					pending: { step: e.step }
				};
			} else {
				let t = await i._onDropSingleItem(null, n);
				if (t === !1 || t === void 0) continue;
				let r = await e.createEmbeddedDocuments("Item", [t], { keepId: !0 });
				a.push(...r.map((e) => e.toObject()));
			}
			for (let t of e.items) !r.has(t.id) && Se(t) && a.push(t.toObject());
		}
		return {
			...M(e),
			added: a
		};
	}, [n]) };
}
// src/rules/kernel/frame/commands-batch.ts
var we = globalThis;
function Te(e, t) {
	let n = structuredClone(e);
	delete n._id;
	for (let e of n.items ?? []) delete e._id;
	for (let e of n.effects ?? []) delete e._id;
	return t && (n.name = t), n;
}
function Ee(e) {
	return { createActorsBatch: (t) => e([], async () => {
		let e = [];
		for (let n of t) {
			let t = n.data ?? await C(n.prop, n.entry);
			e.push(Te(t, n.name));
		}
		return (await we.CONFIG.Actor.documentClass.createDocuments(e)).map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			data: e.toObject()
		}));
	}) };
}
// src/rules/kernel/frame/commands.ts
var z = globalThis, B = class extends Error {
	request;
	constructor(e) {
		super("KERNEL_NEEDS_DICE"), this.request = e;
	}
}, V = class extends Error {
	where;
	constructor(e) {
		super("KERNEL_NEEDS_INPUT"), this.where = e;
	}
};
function De(e, t) {
	let n = z.CONFIG.Dice, r = n.randomUniform, i = z.foundry.dice.terms.Die.prototype, a = Object.hasOwn(i, "roll"), o = i.roll, s = 0, c = 0;
	i.roll = function(...e) {
		return c = this.faces, o.apply(this, e);
	}, n.randomUniform = () => {
		if (s >= e.length) throw new B({
			faces: c,
			index: s
		});
		let t = e[s++];
		if (!Number.isInteger(t) || t < 1 || c && t > c) throw Error(`Invalid die result ${t} for d${c}`);
		return 1 - (t - .5) / (c || 1);
	};
	let l = () => {
		n.randomUniform = r, a ? i.roll = o : delete i.roll;
	};
	return t().then((e) => (l(), {
		value: e,
		used: s
	}), (e) => {
		if (l(), e instanceof B) return {
			used: s,
			needs: e.request
		};
		if (e instanceof V) return {
			used: s,
			input: e.where
		};
		throw e;
	});
}
async function Oe(e) {
	let t = z.game.socket, n = t.emit, r = [];
	t.emit = function(e, ...t) {
		if (e === "modifyDocument" || e === "modifyDocumentBatch") {
			let n = JSON.parse(JSON.stringify(e === "modifyDocument" ? [t[0]] : t[0]));
			for (let e of n) {
				let t = e.operation, n = e.action === "create" ? t.data : e.action === "update" ? t.updates : t.ids;
				for (let i of n ?? []) r.push({
					action: e.action,
					type: e.type,
					pack: t.pack ?? null,
					parentUuid: t.parentUuid ?? null,
					data: i
				});
			}
		}
		return n.call(this, e, ...t);
	};
	try {
		return {
			value: await e(),
			changes: r.filter((e) => e.action !== "get" && e.type !== "ChatMessage")
		};
	} finally {
		t.emit = n;
	}
}
function ke(e) {
	let t = z.foundry.applications.api.ApplicationV2.prototype, n = t.render;
	return t.render = function() {
		throw new V(this.constructor.name);
	}, e().finally(() => {
		t.render = n;
	});
}
function H(e) {
	return e ? {
		formula: e.formula,
		total: e.total,
		isCritical: e.isCritical ?? null,
		isFumble: e.isFumble ?? null,
		dice: e.dice.map((e) => ({
			faces: e.faces,
			results: e.results.map((e) => ({
				result: e.result,
				active: e.active
			}))
		}))
	} : null;
}
var U = (e) => z.game.actors.get(e, { strict: !0 });
function Ae(e) {
	let t = {};
	for (let n of e) {
		if (n.action !== "update" || n.type !== "Actor" || n.parentUuid) continue;
		let e = z.game.actors.get(n.data._id);
		if (e?._prepareActiveEffectAttributions) for (let r of Object.keys(z.foundry.utils.flattenObject(n.data)).filter((e) => e.startsWith("system."))) {
			let n = e._prepareActiveEffectAttributions(r) ?? [];
			n.length && (t[`${e.id}:${r}`] = n.map((e) => ({
				label: e.label,
				mode: e.mode,
				value: e.value
			})));
		}
	}
	return t;
}
async function W(e, t, n = []) {
	let r, i = [];
	try {
		({value: r, changes: i} = await Oe(() => De(e, () => ke(t))));
	} catch (e) {
		return {
			status: "error",
			error: e instanceof Error ? e.message : String(e),
			stack: e instanceof Error ? e.stack ?? null : null,
			changes: i
		};
	}
	let a = n.flatMap((e) => m(U(e))), o = r.value;
	return {
		status: r.needs ? "missing" : r.input ? "pending" : o?.kernelStatus ?? (a.length ? "unsupported" : "complete"),
		result: o ?? null,
		sources: Ae(i),
		changes: i,
		diceUsed: r.used,
		missing: r.needs ? { dice: r.needs } : r.missing ?? null,
		pending: r.input ? { input: r.input } : o?.pending ?? null,
		unsupported: a
	};
}
var je = ae(W, U), Me = le(W, U), Ne = ge(W), Pe = xe(W, U), Fe = Ce(W, U), Ie = Ee(W), Le = [
	"Config",
	"ConfigConsts",
	"VetoolsLinks",
	"Vetools",
	"SideDataInterfaces",
	"Dnd5eUtil",
	"UtilDamageTypes",
	"ImplementationRegistryImportList",
	"DataConverterClassSubclassFeature",
	"DataConverterFeat",
	"DataConverterOptionalfeature",
	"DataConverterRaceFeature",
	"DataConverterSpell",
	"DataConverterItem",
	"DataConverterRace",
	"DataConverterBackground",
	"DataConverterCreature",
	"DataConverterCreatureFeature",
	"DataConverterClass",
	"SourceUtil",
	"MiscUtil"
], Re;
function ze() {
	return Re ??= (async () => {
		let e = await (await fetch(new URL("modules/plutonium/js/Bundle.js", document.baseURI))).text(), t = Object.getPrototypeOf(async () => void 0).constructor, n = await new t(`${e}\n;return { ${Le.join(", ")} };`)();
		return n.Config._CONFIG_TEMP = {
			dataSources: { baseSiteUrl: new URL(".", document.baseURI).href },
			misc: { rulesVersion: "classic" }
		}, n.ConfigConsts.prePreInit({ implRegistryImportList: n.ImplementationRegistryImportList.get() }), n.Config._CONFIG = n.Config.api_getDefaults(), n.Config._CONFIG_PLAYER = n.Config._getDefaultPlayerConfig(), n.Vetools.prePreInit_preConfig(), n.VetoolsLinks.prePreInit_postConfig(), n.Vetools.prePreInit_postConfig(), n.UtilDamageTypes.init(), n.Dnd5eUtil.init(), n.Vetools.init(), n.SideDataInterfaces.init(), n;
	})();
}
var G = { configure: !1 }, K = 15e3, q = { create: !1 }, Be = {
	...je,
	...Me,
	...Ne,
	...Pe,
	...Fe,
	...Ie,
	roll: (e, t = {}, n = [], r = {}) => W(n, async () => {
		let n = {
			basic: z.CONFIG.Dice.BasicRoll,
			d20: z.CONFIG.Dice.D20Roll,
			damage: z.CONFIG.Dice.DamageRoll
		}, i = new (r.kind ? n[r.kind] : z.Roll)(e, t, r.options ? structuredClone(r.options) : void 0);
		return await i.evaluate({ allowInteractive: !1 }), H(i);
	}),
	damage: (e, t, n = [], r = {}) => W(n, async () => {
		let n = U(e);
		return await n.applyDamage(t, r), { hp: n.system.attributes.hp.toObject?.() ?? { ...n.system.attributes.hp } };
	}, [e]),
	rest: (e, t, n = [], r = {}) => W(n, async () => {
		let n = await U(e)[t === "short" ? "shortRest" : "longRest"]({
			dialog: !1,
			chat: !1,
			...r
		});
		return n ? JSON.parse(JSON.stringify(n, (e, t) => e === "clone" ? void 0 : t)) : null;
	}, [e]),
	save: (e, t, n = []) => W(n, async () => (await U(e).rollSavingThrow({ ability: t }, G, q))?.map(H) ?? null, [e]),
	skill: (e, t, n = []) => W(n, async () => (await U(e).rollSkill({ skill: t }, G, q))?.map(H) ?? null, [e]),
	attack: (e, t, n = []) => W(n, async () => {
		let n = U(e).items.get(t, { strict: !0 }).system.activities.find((e) => e.type === "attack");
		if (!n) return null;
		let r = await n.rollAttack({}, G, q), i = await n.rollDamage({}, G, q);
		return {
			attack: r?.map(H) ?? null,
			damage: i?.map(H) ?? null
		};
	}, [e]),
	attribution: (e, t) => Object.fromEntries(t.map((t) => [t, (U(e)._prepareActiveEffectAttributions(t) ?? []).map((e) => ({
		label: e.label,
		mode: e.mode,
		value: e.value
	}))])),
	unsupported: () => z.game.actors.contents.flatMap((e) => m(e)),
	convert: async (e, t, n = {}) => {
		let r = await ze(), i = {
			classFeature: r.DataConverterClassSubclassFeature,
			subclassFeature: r.DataConverterClassSubclassFeature,
			feat: r.DataConverterFeat,
			optionalfeature: r.DataConverterOptionalfeature,
			spell: r.DataConverterSpell,
			item: r.DataConverterItem,
			race: r.DataConverterRace,
			raceFeature: r.DataConverterRaceFeature,
			monsterFeature: r.DataConverterCreatureFeature,
			background: r.DataConverterBackground
		}, a = (e) => {
			let t;
			return Promise.race([e, new Promise((e, n) => {
				t = setTimeout(() => n(Error(`PROBE_TIMEOUT ${K}`)), K);
			})]).finally(() => clearTimeout(t));
		}, o = (e) => r.MiscUtil.copyFast(e), s = [];
		for (let c of t) {
			let t = {
				kind: e,
				name: c.name,
				source: c.source
			};
			if (t.ownerCompatible = [c.classSource, c.subclassSource].filter(Boolean).every((e) => r.SourceUtil.isClassicSource(e)), !t.ownerCompatible) t.notAttempted = "所属职业/子职业来源不是作者判断的旧版；资料可见不代表兼容 2014 结算", s.push(t);
			else if (c.__prop === "monsterSpellcasting") t.notAttempted = "必须走作者完整 NPC 施法导入流程；不能把原始施法对象当普通特性", s.push(t);
			else {
				try {
					let l;
					if (e === "class") l = await a(r.DataConverterClass.pGetDocumentJsonClass(o(c), { isClsDereferenced: !0 }));
					else if (e === "subclass") {
						let e = (n.class ?? []).find((e) => e.name === c.className && e.source === c.classSource);
						if (!e) throw Error("Parent class outside input scope");
						l = await a(r.DataConverterClass.pGetDocumentJsonSubclass(o(e), o(c), { isScDereferenced: !0 }));
					} else if (e === "monster") {
						t.hpProbe = r.DataConverterCreature.getDataHp(o(c)), t.notAttempted = "完整怪物需 Actor 导入流程；本行只验证作者 HP 处理", s.push(t);
						continue;
					} else if (i[e]) l = await a(i[e].pGetDocumentJson(o(c), {}));
					else {
						t.notAttempted = "No standalone document converter in this probe", s.push(t);
						continue;
					}
					t.effects = l?.effects ?? [], t.system = l?.system ?? null, t.type = l?.type, JSON.parse(JSON.stringify(t));
				} catch (e) {
					t.error = String(e?.stack ?? e).split("\n").slice(0, 4).join(" | ");
				}
				s.push(t);
			}
		}
		return s;
	}
}, J = globalThis, Y = new URLSearchParams(location.search).get("frame") ?? "", X = J.__trpgFrameErrors ?? [], Ve = 1, Z = /* @__PURE__ */ new Map();
function He(e) {
	return new Promise((n, r) => {
		let i = 1e6 + Ve++;
		Z.set(i, {
			resolve: n,
			reject: r
		}), parent.postMessage({
			channel: t,
			type: "request",
			frame: Y,
			id: i,
			...e
		}, location.origin);
	});
}
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "response" || !Z.has(t.id)) return;
	let n = Z.get(t.id);
	Z.delete(t.id), t.ok ? n.resolve(t.value) : n.reject(Error(t.error));
});
async function Ue(e) {
	let t = await fetch(new URL(e, location.href));
	if (!t.ok) throw Error(`${t.status}: ${e}`);
	return t.text();
}
async function We(e) {
	let t = await He({
		op: "file",
		path: `packs/${e}.json`
	});
	if (typeof t != "string") throw Error(`Pack is not available: ${e}`);
	return JSON.parse(t);
}
var Q;
async function Ge(e) {
	if (Q) throw Error("Kernel is already booted");
	let t = [], { foundry: n, Hooks: r } = J;
	p(e.seed ?? "kernel"), J.release = new n.config.ReleaseData(e.release);
	let a = i(e);
	J.packages = {
		System: new n.utils.Collection([[a.system.id, new n.packages.System(a.system)]]),
		Module: new n.utils.Collection(a.modules.map((e) => [e.id, new n.packages.Module(e)]))
	};
	let s = J.io({
		autoConnect: !1,
		forceNew: !0
	});
	Q = {
		...o(s, {
			userId: e.userId,
			worldTime: e.worldTime,
			readPack: We,
			readText: Ue
		}),
		steps: t
	};
	let c = n.Game;
	class l extends c {
		activateListeners() {
			t.push("omit UI event listeners");
		}
		initializeUI() {
			for (let [e, t] of Object.entries(J.CONFIG.ui)) J.ui[e] = new t();
			J.ui.windows ??= {};
		}
		initializeMouse() {
			t.push("omit mouse");
		}
		initializeKeyboard() {
			t.push("omit keyboard");
		}
		initializeGamepads() {
			t.push("omit gamepads");
		}
		initializeRTC() {
			t.push("omit AV");
		}
		async initializeCanvas() {
			t.push("omit canvas");
		}
	}
	J.game = new l("game", a, s), J.game.nue && (J.game.nue.initialize = () => void 0), J.game.settings.storage.get("client").setItem("core.noCanvas", "true"), await Ye(`systems/${a.system.id}/dnd5e.js`);
	for (let e of a.modules) for (let t of e.esmodules ?? []) await import(
		/* @vite-ignore */
		new URL(t, location.href).href
);
	r.once("setup", () => {
		J.CONFIG.DND5E?.calendar && (J.CONFIG.DND5E.calendar.application = null);
	}), await J.game.initialize();
	let u = Date.now() + 3e4;
	for (; a.modules.some((e) => e.id === "plutonium") && typeof J.game.modules.get("plutonium")?.api != "object";) {
		if (Date.now() > u) throw Error("Plutonium API was not ready within 30 seconds");
		await new Promise((e) => setTimeout(e, 50));
	}
	return Ke();
}
function Ke() {
	let e = J.game;
	return {
		release: e.release.version,
		system: e.system.version,
		rules: e.settings.get("dnd5e", "rulesVersion"),
		worldTime: e.time.worldTime,
		actors: e.actors.size,
		invalid: [...e.actors.invalidDocumentIds],
		modules: Object.fromEntries(e.modules.map((e) => [e.id, {
			active: e.active,
			availability: e.availability
		}])),
		plutoniumApi: typeof e.modules.get("plutonium")?.api,
		errors: [...X]
	};
}
function qe() {
	return J.game.actors.contents.map((e) => ({
		source: e.toObject(),
		system: e.system.toObject(!1),
		name: e.name,
		validation: e.validationFailures
	}));
}
var Je = {
	...Be,
	boot: Ge,
	status: Ke,
	preparedActors: qe,
	changes: () => Q?.changes ?? [],
	calls: () => Q?.calls ?? [],
	steps: () => Q?.steps ?? []
};
addEventListener("message", (e) => {
	let n = e.data;
	if (e.source !== parent || n?.channel !== "trpg-library" || n.type !== "call") return;
	let r = (e) => parent.postMessage({
		channel: t,
		type: "result",
		frame: Y,
		id: n.id,
		...e
	}, location.origin), i = Je[n.fn];
	if (!i) return r({
		ok: !1,
		error: `Unknown kernel command: ${n.fn}`
	});
	Promise.resolve().then(() => i(...n.args)).then((e) => r({
		ok: !0,
		value: e
	}), (e) => r({
		ok: !1,
		error: e instanceof Error ? e.stack ?? e.message : String(e)
	}));
});
function Ye(e) {
	return new Promise((t, n) => {
		let r = document.createElement("script");
		r.src = e, r.onload = () => t(), r.onerror = () => n(Error(`Failed to load ${e}`)), document.head.append(r);
	});
}
async function $() {
	J.SIGNED_EULA = !0, J.ROUTE_PREFIX = new URL(".", location.href).pathname.replace(/^\/+|\/+$/g, ""), J.MESSAGES = null, await import(
		/* @vite-ignore */
		new URL("scripts/foundry.mjs", location.href).href
);
	let e = {
		channel: t,
		type: "ready",
		frame: Y,
		codeSet: "foundry",
		authorVersion: J.foundry?.CONST?.vtt ?? null,
		present: { foundry: !!J.foundry?.Game },
		errors: [...X]
	};
	parent.postMessage(e, location.origin);
}
document.readyState === "complete" ? $() : addEventListener("load", () => {
	$();
}, { once: !0 });
