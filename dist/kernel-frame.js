import { o as e, r as t, t as n } from "./brew-health-Cnp1A9fm.js";
import { t as r } from "./protocol-03CO7Rhf.js";
// src/rules/kernel/packages.ts
var i = [
	"esmodules",
	"scripts",
	"styles"
];
function a(e, t) {
	let n = `${t}s/${e.id}/`, r = (e) => /^(?:[a-z]+:)?\/\//i.test(e) || e.startsWith(n) ? e : n + e.replace(/^\.?\//, ""), a = structuredClone(e);
	for (let e of i) {
		let t = a[e];
		Array.isArray(t) && (a[e] = t.map((e) => typeof e == "string" ? r(e) : {
			...e,
			src: r(String(e.src))
		}));
	}
	return Array.isArray(a.languages) && (a.languages = a.languages.map((e) => ({
		...e,
		path: r(e.path)
	}))), a;
}
// src/rules/kernel/frame/world.ts
function o(e) {
	let { CONST: t, CONFIG: n, foundry: r } = globalThis, i = a(e.system, "system"), o = e.modules.map((e) => ({
		...a(e, "module"),
		active: !0
	})), s = `${e.release.generation}.${e.release.build}`, c = {
		coreVersion: s,
		systemId: i.id,
		systemVersion: i.version
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
			...Object.keys(i.documentTypes?.[e] ?? {}),
			...e === "Folder" ? t.FOLDER_DOCUMENT_TYPES : []
		]);
		return [e, Object.fromEntries([...r].map((e) => [e, {}]))];
	})), f = [...new r.packages.System(i).packs].map((e) => ({
		...e,
		id: `${i.id}.${e.name}`,
		packageType: "system",
		packageName: i.id,
		system: i.id,
		index: [],
		folders: []
	})), p = e.documents;
	return {
		userId: e.userId,
		release: e.release,
		system: i,
		modules: o,
		model: d,
		packs: f,
		settings: u,
		world: {
			id: e.world.id,
			title: e.world.title,
			system: i.id,
			coreVersion: s,
			systemVersion: i.version,
			flags: { [i.id]: { version: i.version } }
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
function s(e, t) {
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
var c = 0;
async function l(e = 2e3) {
	let t = Date.now() + e, n = 0;
	for (; n < 2 && Date.now() < t;) await new Promise((e) => setTimeout(e, 0)), n = c === 0 ? n + 1 : 0;
}
function u(e, t) {
	let n = globalThis, r = [], i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), l = 0, u = e.emit.bind(e), d = async (e) => a.get(e) ?? t.readPack(e);
	async function f(e) {
		let t = e.operation, n = t.pack ?? null;
		if (e.action === "get") {
			if (!n) return [];
			let e = t.query ?? {};
			if (Object.keys(e).some((e) => e !== "_id")) throw Error(`Unsupported pack query: ${JSON.stringify(e)}`);
			let r = await d(n), i = e._id ? r.filter((t) => t._id === e._id) : r;
			if (!t.index) return structuredClone(i);
			if (!Array.isArray(t.indexFields)) throw Error("Official index request has no fields");
			return i.map((e) => s(e, t.indexFields));
		}
		if (n && !a.has(n)) throw Error(`Original pack is read-only: ${n}`);
		let i = t.parentUuid ?? null, c = n ? a.get(n) : o.get(e.type) ?? o.set(e.type, []).get(e.type);
		if (e.action === "create") {
			let a = t.data.map((e) => {
				let n = structuredClone(e);
				return t.keepId && n._id || (n._id = `kernel${String(++l).padStart(10, "0")}`), n;
			});
			i || c.push(...a);
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
		let o = JSON.parse(JSON.stringify(r.filter((e) => typeof e != "function")));
		i.push({
			event: e,
			args: o
		});
		let s = typeof r.at(-1) == "function" ? r.at(-1) : null, l = (e, t) => {
			c++, e.then((e) => s(t(e)), (e) => s({ error: { message: e.message } })).finally(() => {
				c--;
			});
		};
		if (e === "template") return l(t.readText(r[0]), (e) => ({ html: e }));
		if (e === "time") return s({
			serverTime: Date.now(),
			worldTime: t.worldTime
		});
		if (e === "modifyDocument") {
			let e = o[0];
			return l(f(e), (n) => ({
				...e,
				userId: t.userId,
				result: n
			}));
		}
		if (e === "modifyDocumentBatch") {
			let e = o[0];
			return l(Promise.all(e.map(async (e) => ({
				...e,
				userId: t.userId,
				result: await f(e)
			}))), (e) => ({ results: e }));
		}
		if (e === "manageCompendium") {
			let e = o[0];
			if (e.action !== "create") return s({ error: { message: `Unsupported compendium operation: ${e.action}` } });
			let t = [...new n.foundry.packages.World({
				...n.game.world.toObject(),
				packs: [e.data]
			}).packs][0], r = `${e.data.package}.${t.name}`;
			return a.set(r, []), s({
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
		return s ? s({ error: { message: `Unsupported server request: ${e}` } }) : u(e, ...r);
	}, {
		changes: r,
		calls: i
	};
}
// src/rules/kernel/frame/random.ts
var d = null, f = null;
function p(e, t) {
	return f ? f(e, t) : t();
}
function m(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return t >>> 0;
}
function ee(e) {
	d = e.crypto.getRandomValues.bind(e.crypto);
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
	}), f = async (e, n) => {
		let r = t;
		t = m(e);
		try {
			return await n();
		} finally {
			t = r;
		}
	}, (e) => {
		t = m(e);
	};
}
function te() {
	let e = /* @__PURE__ */ new Uint32Array(4);
	return d ? d(e) : crypto.getRandomValues(e), Array.from(e, (e) => e.toString(16).padStart(8, "0")).join("");
}
// src/rules/kernel/frame/seed.ts
var ne = ee(globalThis);
function re() {
	return te();
}
function h(e) {
	ne(e);
}
function ie(e, t) {
	let n = t;
	return `entry:${e}:${String(n?.source ?? "")}:${String(n?.name ?? "")}:${ae(JSON.stringify(t))}`;
}
function ae(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return (t >>> 0).toString(16);
}
// src/rules/kernel/frame/writings.ts
var oe = [
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
function se(e, t) {
	let n = String(t.key ?? ""), r = oe.find((e) => e.test(n));
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
function ce(e) {
	let t = [];
	for (let n of e.allApplicableEffects()) for (let r of n.system?.changes ?? n.changes ?? []) {
		let i = se(e, r);
		i && t.push({
			actor: e.id,
			effect: n.uuid,
			...i
		});
	}
	return t;
}
// src/rules/kernel/frame/commands-items.ts
var le = globalThis;
function ue(e) {
	return !e || e.max === void 0 || e.max === null || e.max === "" ? null : {
		value: e.value ?? null,
		max: e.max ?? null,
		spent: e.spent ?? null
	};
}
function g(e) {
	return {
		id: e.id,
		name: e.name,
		type: e.type,
		equipped: "equipped" in e.system ? e.system.equipped : null,
		attuned: "attuned" in e.system ? e.system.attuned : null,
		attunement: e.system.attunement ?? null,
		uses: ue(e.system.uses),
		activities: e.system.activities ? [...e.system.activities].map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			uses: ue(e.uses)
		})) : []
	};
}
function _(e) {
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
function de(e) {
	return e.map((e) => ({
		formula: e.formula ?? null,
		total: e.total ?? null,
		dice: e.dice?.map((e) => ({
			faces: e.faces,
			results: e.results?.map((e) => e.result)
		})) ?? []
	}));
}
function fe(e, t) {
	let n = (e, n) => t(e).items.get(n, { strict: !0 });
	return {
		equip: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.equipped": !!a }), {
				item: g(o),
				actor: _(e)
			};
		}, [r]),
		attune: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.attuned": !!a }), {
				item: g(o),
				actor: _(e)
			};
		}, [r]),
		useItem: (t, r, i = [], a = null) => {
			let o = [], s = le.ui?.notifications, c = s?.error;
			return s && c && (s.error = function(e, ...t) {
				return o.push(String(e)), c.call(this, e, ...t);
			}), e(i, async () => {
				let e = n(t, r), i, s = null;
				if (a) {
					if (s = e.system.activities?.get(a), !s) throw Error(`Item has no activity: ${a}`);
					i = await s.use({}, { configure: !1 }, { create: !1 });
				} else i = await e.use({}, { configure: !1 }, { create: !1 });
				return {
					item: g(e),
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
				})) : le.foundry.utils.isEmpty(n.updates) || (await t.update(n.updates), i.push({
					id: t.id,
					name: t.name,
					updates: n.updates,
					rolls: de(n.rolls ?? [])
				})));
			}
			return {
				period: r,
				items: i,
				actor: _(e)
			};
		}, [n])
	};
}
// src/rules/kernel/frame/commands-combat.ts
var pe = globalThis;
function me(e) {
	let t = e.system.spells;
	return t ? Object.fromEntries(Object.entries(t).map(([e, t]) => [e, {
		value: t.value ?? null,
		max: t.max ?? null,
		level: t.level ?? null,
		type: t.type ?? null
	}])) : null;
}
function v(e) {
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
function he(e) {
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
function y(e) {
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
function ge(e) {
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
function _e(e, t) {
	let n = null, r = () => n ?? pe.game.combat, i = () => {
		let e = r();
		if (!e) throw Error("No active combat");
		return e;
	};
	return {
		combatStart: (t, r = []) => e(r, async () => {
			let e = await pe.CONFIG.Combat.documentClass.create({
				name: "Kernel encounter",
				combatants: t.map((e) => ({ actorId: e }))
			});
			return await e.rollInitiative(e.combatants.map((e) => e.id), { dialog: !1 }), await e.startCombat(), n = e, y(e);
		}, t),
		combatNext: (t = []) => e(t, async () => {
			let e = i();
			return await e.nextTurn(), y(e);
		}),
		combatEnd: () => e([], async () => {
			let e = i();
			await e.endCombat();
			let t = y(e);
			return n = null, t;
		}),
		cast: (n, r, i, a = [], o = {}) => e(a, async () => {
			let e = t(n), a = e.items.get(r, { strict: !0 }), s = a.system.activities?.get(i);
			if (!s) throw Error(`Item has no activity: ${i}`);
			let c = await s.use(o, { configure: !1 }, { create: !1 });
			return {
				item: g(a),
				activity: {
					id: s.id,
					name: s.name,
					type: s.type
				},
				slots: me(e),
				concentration: v(e),
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
			return await e.toggleStatusEffect(r, { active: i }), he(e);
		}, [n]),
		concentrationCheck: (n, r, i = []) => e(i, async () => {
			let e = t(n);
			if (!e.concentration?.effects?.size) return {
				dc: null,
				skipped: "not concentrating",
				concentration: v(e)
			};
			let i = e.getConcentrationDC(r), a = await e.rollConcentration({ target: i }, { configure: !1 }, { create: !1 }), o = a?.[0] ?? null, s = o ? o.total >= i : null;
			return s === !1 && await e.endConcentration(), {
				dc: i,
				success: s,
				rolls: (a ?? []).map(ge),
				concentration: v(e)
			};
		}, [n]),
		concentration: (n) => e([], async () => v(t(n)), [n])
	};
}
// src/rules/kernel/frame/importer.ts
var b = globalThis, ve = {
	skillsChosenFvtt: [],
	languagesChosenFvtt: [],
	armorProficienciesChosenFvtt: [],
	weaponProficienciesChosenFvtt: [],
	toolProficienciesChosenFvtt: []
};
function ye() {
	let e = b.foundry?.documents?.collections?.CompendiumCollection;
	if (e?.prototype && !e.prototype.getDocuments.__seeded) for (let t of ["getDocuments", "getDocument"]) {
		let n = e.prototype[t], r = function(...e) {
			return p(`pack:${this.collection}:${t}:${JSON.stringify(e)}`, () => n.apply(this, e));
		};
		r.__seeded = !0, e.prototype[t] = r;
	}
}
async function x(e, t) {
	ye();
	let n = b.game.modules.get("plutonium")?.api;
	if (!n?.importer) throw Error("Plutonium importer is not available");
	let r = await n.importer.pGetImporter({ prop: e });
	if (!r) throw Error(`No Plutonium importer for ${e}`);
	let i = async () => {
		let i = structuredClone(t), a = new n.importer.ImportOpts({ isTemp: !0 }), o = (e === "class" && r.pImportEntryClass ? await r.pImportEntryClass(i, a) : await r.pImportEntry(i, a, structuredClone(ve)))?.imported?.[0]?.document ?? null;
		if (!o) throw Error(`Plutonium import failed for ${t?.name ?? e}`);
		return o.toObject ? o.toObject() : o;
	};
	return h(ie(e, t)), await i(), h(ie(e, t)), i();
}
async function be(e) {
	return (await S(e)).map((e) => e.prop);
}
async function S(e) {
	let t = b.game.modules.get("plutonium")?.api;
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
async function C(t, n) {
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
var w = globalThis;
function xe(e) {
	return Object.fromEntries(Object.entries(e.abilities ?? {}).map(([e, t]) => [e, {
		value: t.value ?? null,
		mod: t.mod ?? null,
		save: t.save?.value ?? t.save ?? null,
		proficient: t.proficient ?? null
	}]));
}
function Se(e) {
	return Object.fromEntries(Object.entries(e.skills ?? {}).map(([e, t]) => [e, {
		total: t.total ?? null,
		passive: t.passive ?? null,
		proficient: t.proficient ?? null
	}]));
}
function Ce(e) {
	return e ? Array.isArray(e) ? e : typeof e[Symbol.iterator] == "function" ? [...e] : Object.values(e) : [];
}
function we(e) {
	return {
		id: e.id ?? e._id ?? null,
		name: e.name,
		type: e.type,
		activities: Ce(e.system?.activities).map((e) => ({
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
function T(e) {
	let t = e.toObject ? e.toObject() : e, n = e.system ?? t.system ?? {}, r = e.items?.contents ?? e.items ?? t.items ?? [];
	return {
		name: e.name ?? t.name,
		type: e.type ?? t.type,
		ac: n.attributes?.ac?.value ?? null,
		hp: n.attributes?.hp ? {
			value: n.attributes.hp.value ?? null,
			max: n.attributes.hp.max ?? null
		} : null,
		abilities: xe(n),
		skills: Se(n),
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
		items: [...r].map(we),
		validation: e.validationFailures ?? []
	};
}
async function E(e) {
	let t = await x("monster", e);
	return {
		status: "complete",
		entity: {
			name: e.name,
			source: e.source
		},
		...T(t)
	};
}
function Te(e) {
	return {
		importMonster: (t) => e([], async () => E(t)),
		importMonsters: (t) => e([], async () => {
			let e = [];
			for (let n of t) try {
				e.push(await E(n));
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
			e = t.data ? structuredClone(t.data) : await x("monster", t.entry), delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await w.CONFIG.Actor.documentClass.create({
				...e,
				name: t.name
			}), r = n.toObject();
			return await C(n, t.state), {
				status: "complete",
				id: n.id,
				...T(n),
				data: n.toObject(),
				base: r
			};
		}),
		importMonsterData: (t) => e([], async () => ({
			status: "complete",
			data: await x("monster", t)
		})),
		createActorFromData: (t) => e([], async () => {
			let e = structuredClone(t);
			delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await w.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...T(n)
			};
		}),
		importMonsterActor: (t) => e([], async () => {
			let e = await x("monster", t);
			delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await w.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...T(n)
			};
		})
	};
}
// src/rules/kernel/frame/actor-types.ts
var D = globalThis, O = "character";
async function Ee(e, t) {
	let n = Object.keys(D.game.system?.documentTypes?.Actor ?? {}), r = (e) => {
		let t = D.CONFIG?.Actor?.typeLabels?.[e] ?? `TYPES.Actor.${e}`;
		return D.game.i18n?.localize?.(t) ?? e;
	}, i = await S([e]), a = /* @__PURE__ */ new Set();
	if (i.some((e) => e.folderType === "Actor")) for (let n of t) {
		let t = await x(e, n);
		typeof t?.type == "string" && a.add(t.type);
	}
	return {
		declared: n.map((e) => ({
			type: e,
			label: r(e)
		})),
		fromStore: [...a],
		build: O
	};
}
// src/rules/kernel/frame/commands-restore.ts
async function De(e, t, n = []) {
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
function Oe(e, t, n, r = {}) {
	return A().forLevelChange(e, t, n, r);
}
function j(e) {
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
function M(e) {
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
function N(e) {
	let t = e?.toObject ? e.toObject() : structuredClone(e);
	return t.flags ??= {}, t.flags.plutonium ??= {}, t.flags.plutonium.isStandardDragDrop = !0, t;
}
function ke(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
function Ae(e) {
	return JSON.parse(JSON.stringify(e, (e, t) => t instanceof Set ? [...t] : t));
}
async function je(e) {
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
		let r = t.configuration?.points ?? 0, i = t.configuration?.cap || r, a = {}, o = r;
		for (let n of Object.keys(e.actor?.system?.abilities ?? t.actor?.system?.abilities ?? k.CONFIG?.DND5E?.abilities ?? {})) {
			if (o <= 0) break;
			if (t.canImprove?.(n) === !1) continue;
			let e = Math.min(i, o);
			a[n] = e, o -= e;
		}
		return Object.keys(a).length ? {
			type: "asi",
			assignments: a
		} : void 0;
	}
	if (n === "Size") return { size: t.configuration?.sizes?.first?.() ?? "med" };
	if (n === "ScaleValue") return {};
}
async function P(e, t, { strict: n = !1, picks: r } = {}) {
	if (!e.steps.length) return { finished: !0 };
	for (let i of e.steps) {
		if (i.automatic || !i.flow) continue;
		let e = i.flow.advancement, a = t?.find((t) => t.id === e.id && t.level === i.flow.level);
		if (a) {
			if (a.error) return {
				finished: !1,
				step: {
					...F(i),
					error: a.error
				}
			};
			i.type = "restore", i.flow.retainedData = a.data, i.automatic = !0;
			continue;
		}
		if (await i.flow.getAutomaticApplicationValue() !== !1) continue;
		let o = r?.find((t) => t.id === e.id && (t.level ?? null) === (i.flow.level ?? null));
		if (o) {
			i.flow.getAutomaticApplicationValue = async () => o.value;
			continue;
		}
		if (n) return {
			finished: !1,
			step: F(i)
		};
		let s = await je(i.flow);
		s !== void 0 && (i.flow.getAutomaticApplicationValue = async () => s);
	}
	let i = new Promise((t) => {
		let n = k.Hooks.on("dnd5e.advancementManagerComplete", (r) => {
			r === e && (k.Hooks.off(n), t(!0));
		});
		setTimeout(() => {
			k.Hooks.off(n), t(!1);
		}, 3e3);
	});
	await e.render();
	let a = await i;
	return a && await l(), a ? { finished: !0 } : {
		finished: !1,
		step: F(e.step)
	};
}
function F(e) {
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
async function I(e) {
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
async function L(e, t, n, r = {}, { strict: i = !1, seed: a, picks: o, onManager: s } = {}) {
	a !== void 0 && h(a);
	let c = await k.CONFIG.Actor.documentClass.create({
		name: e,
		type: O,
		system: { details: { level: 1 } }
	});
	for (let e of t) {
		let t = M(e?.data ?? e);
		k.CONFIG.Item.dataModels[t.type]?.resetData?.(t.system);
		let n = e?.refKey ?? ke(t), a = A().forNewItem(c, t, { automaticApplication: !0 });
		await s?.({
			manager: a,
			key: n
		});
		let l = await P(a, n ? r[n] : void 0, {
			strict: i,
			picks: n ? o?.[n] : void 0
		});
		if (!l.finished) return {
			pending: !0,
			step: l.step,
			built: j(c),
			actor: c
		};
		c.items.contents.some((e) => e.type === t.type && e.flags?.plutonium?.hash === t.flags?.plutonium?.hash) || await c.createEmbeddedDocuments("Item", [N(M(t))]);
	}
	return n.length && await c.createEmbeddedDocuments("Item", n.map((e) => N(M(e?.data ?? e)))), { actor: c };
}
function Me(e, t) {
	return {
		levelUpSteps: (n, r, i = 1) => e([], async () => {
			let e = await I(Oe(t(n), r, i));
			return {
				status: e.length ? "pending" : "complete",
				steps: e
			};
		}, [n]),
		levelUpApply: (n, r, i = 1, a) => e([], async () => {
			let e = t(n), o = Oe(e, r, i, { automaticApplication: !0 }), s = await P(o, a);
			return s.finished ? j(e) : {
				kernelStatus: "pending",
				reason: o.step ? "awaiting-choice" : "advancement-manager-not-complete",
				step: s.step
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
							data: Ae(r)
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
			}), j(e);
		}, [n]),
		createActorsFromBase: (t) => e([], async () => {
			let e = await k.CONFIG.Actor.documentClass.createDocuments(t.map((e) => structuredClone(e.base)), { keepId: !0 }), n = [];
			for (let r = 0; r < e.length; r++) await C(e[r], t[r].state), n.push({
				id: e[r].id,
				...j(e[r]),
				data: e[r].toObject(),
				base: t[r].base
			});
			return n;
		}),
		buildCharacter: (t) => e([], async () => {
			let e = t.seed ?? re(), n = [];
			for (let e of t.items) n.push({
				data: e.data ?? await x(e.prop, e.entry),
				refKey: e.refKey,
				itemId: e.itemId
			});
			let r = [];
			for (let e of t.equipment ?? []) r.push({
				data: e.data ?? await x(e.prop, e.entry),
				refKey: e.refKey
			});
			let i = await L(t.name, n, r, t.choices ?? {}, {
				strict: !1,
				seed: e,
				picks: t.picks
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
				...j(i.actor)
			};
		}),
		buildSteps: (t) => e([], async () => {
			let e = k.CONFIG.Actor.documentClass, n = new e({
				name: "Build preview",
				type: O,
				system: { details: { level: 1 } }
			}), r = await I(A().forNewItem(n, t));
			return {
				status: r.length ? "pending" : "complete",
				steps: r
			};
		}),
		importForBuild: (t, n) => e([], async () => x(t, n)),
		importerProps: be,
		importerMeta: S,
		actorTypes: (t, n) => e([], async () => Ee(t, n)),
		rebuildCharacter: (t) => e([], async () => {
			let e = t.seed?.trim() || t.name;
			h(e);
			let n = [];
			for (let e of t.items) n.push({
				data: e.data ?? await x(e.prop, e.entry),
				refKey: e.refKey,
				itemId: e.itemId
			});
			let r = [];
			for (let e of t.equipment) r.push({
				data: e.data ?? await x(e.prop, e.entry),
				refKey: e.refKey,
				itemId: e.itemId
			});
			let i = await L(t.name, n, r, t.choices, {
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
			return await C(i.actor, t.state), [...i.actor.items].filter((e) => e.type === "class").length > 1 && await De(i.actor, t.choices, [...t.items, ...t.equipment]), {
				id: i.actor.id,
				seed: e,
				...j(i.actor),
				data: i.actor.toObject(),
				base: a
			};
		})
	};
}
// src/rules/kernel/frame/commands-add.ts
function Ne(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
function Pe(e, t) {
	return { addToActor: (n, r) => e([], async () => {
		let e = t(n), i = e.sheet;
		if (!i?._onDropSingleItem) throw Error(`人物 ${n} 没有官方人物表单实例`);
		let a = [];
		for (let t of r) {
			let n = M(t.data ? structuredClone(t.data) : await x(t.prop, t.entry)), r = new Set(e.items.map((e) => e.id)), o = A().forNewItem(e, n, { automaticApplication: !0 });
			if (o.steps.length) {
				let e = await P(o, t.choices, { strict: !1 });
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
			for (let t of e.items) !r.has(t.id) && Ne(t) && a.push(t.toObject());
		}
		return {
			...j(e),
			added: a
		};
	}, [n]) };
}
// src/rules/kernel/frame/commands-batch.ts
var Fe = globalThis;
function Ie(e, t) {
	let n = structuredClone(e);
	delete n._id;
	for (let e of n.items ?? []) delete e._id;
	for (let e of n.effects ?? []) delete e._id;
	return t && (n.name = t), n;
}
function Le(e) {
	return { createActorsBatch: (t) => e([], async () => {
		let e = [];
		for (let n of t) {
			let t = n.data ?? await x(n.prop, n.entry);
			e.push(Ie(t, n.name));
		}
		return (await Fe.CONFIG.Actor.documentClass.createDocuments(e)).map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			data: e.toObject()
		}));
	}) };
}
// src/rules/kernel/frame/commands-options.ts
var Re = (e) => ({
	value: String(e.value),
	label: String(e.label ?? e.value),
	...e.group ? { group: String(e.group) } : {}
}), ze = {
	Trait: async (e) => {
		let { available: t } = await e.unfulfilledChoices(), n = t.filter((e) => e.type === "grant").flatMap((e) => [...e.choices.asOptions()].map(Re)), r = /* @__PURE__ */ new Map();
		for (let e of t.filter((e) => e.type === "choice")) {
			let t = r.get(e.choiceIdx) ?? {
				count: 0,
				options: [...e.choices.asOptions()].map(Re)
			};
			t.count++, r.set(e.choiceIdx, t);
		}
		let i = n[0]?.value ?? [...r.values()][0]?.options[0]?.value;
		return r.size ? {
			kind: "trait",
			trait: e.configuration?.type ?? i?.split(":")[0] ?? null,
			grants: n,
			slots: [...r.values()]
		} : null;
	},
	AbilityScoreImprovement: async (e) => {
		let t = e.configuration ?? {}, n = Object.fromEntries(Object.entries(t.fixed ?? {}).filter(([, e]) => e));
		return t.points ? {
			kind: "asi",
			points: t.points,
			cap: t.cap ?? null,
			fixed: n,
			locked: [...t.locked ?? []]
		} : null;
	}
}, Be = /* @__PURE__ */ new Set([
	"HitPoints",
	"ScaleValue",
	"Size",
	"ItemGrant",
	"Subclass"
]);
async function Ve(e) {
	let t = [];
	for (let n of e.steps) {
		let e = n.flow?.advancement;
		if (!e) continue;
		let r = e.constructor?.typeName ?? e.type, i = await n.flow.getAutomaticApplicationValue?.() !== !1, a = null, o = !1;
		ze[r] ? a = await ze[r](e) : !i && !Be.has(r) && (o = !0), t.push({
			id: e.id,
			level: n.flow.level ?? null,
			type: r,
			title: e.title ?? null,
			automatic: i,
			options: a,
			...o ? { unsupported: !0 } : {}
		});
	}
	return t;
}
function He(e) {
	return { buildOptions: (t) => e([], async () => {
		let e = [];
		for (let n of t.items) e.push({
			data: n.data ?? await x(n.prop, n.entry),
			refKey: n.refKey
		});
		let n = [], r = await L("选项预览", e, [], t.choices ?? {}, {
			strict: !1,
			picks: t.picks,
			onManager: async ({ manager: e, key: t }) => {
				n.push({
					refKey: t,
					steps: await Ve(e)
				});
			}
		});
		try {
			return {
				items: n,
				complete: !r.pending
			};
		} finally {
			await (r.actor ?? r.created)?.delete?.();
		}
	}) };
}
// src/rules/kernel/frame/commands-sheet.ts
var R = globalThis, z = { configure: !1 }, B = { create: !1 }, Ue = [
	/^_id$/,
	/^_stats(\.|$)/,
	/^type$/,
	/^items(\.|$)/,
	/^effects(\.|$)/,
	/^flags\.plutonium(\.|$)/,
	/^system\.advancement(\.|$)/
];
function We(e, t) {
	return !t || Ue.some((e) => e.test(t)) ? !1 : t.startsWith("flags.") ? t.split(".").length >= 3 : t.startsWith("system.") ? !!e.system?.schema?.getField?.(t.slice(7)) : !!e.schema?.getField?.(t);
}
function V(e, t, n, r) {
	if (!We(e, t)) throw Error(`不能改这个字段：${t}`);
	if (!r) return { [t]: n };
	let i = t.lastIndexOf(".");
	return { [`${t.slice(0, i)}.-=${t.slice(i + 1)}`]: null };
}
var H = (e) => JSON.parse(JSON.stringify(e ?? null, (e, t) => e === "document" || e === "anchor" || e === "fields" || e === "field" || e === "parent" ? void 0 : t));
function U(e, t = 0, n = /* @__PURE__ */ new WeakSet()) {
	if (typeof e == "function") return;
	if (typeof e != "object" || !e) return e;
	if (t > 12 || n.has(e) || e instanceof R.foundry.abstract.Document) return;
	if (n.add(e), e instanceof Set) return [...e].map((e) => U(e, t + 1, n));
	if (e instanceof Map) return Object.fromEntries([...Map.prototype.entries.call(e)].map(([e, r]) => [e, U(r, t + 1, n)]));
	if (Array.isArray(e)) return e.map((e) => U(e, t + 1, n));
	let r = {};
	for (let i of Object.keys(e)) {
		if (i === "parent" || i.startsWith("_")) continue;
		let a = U(e[i], t + 1, n);
		a !== void 0 && (r[i] = a);
	}
	return r;
}
async function Ge(e, t, n) {
	if (!e) return null;
	let r = new e({ document: t }), i = await r._prepareContext({ parts: [] }), a = await r._preparePartContext(Object.keys(e.PARTS ?? {})[0] ?? "config", i, {});
	return Object.fromEntries(n.filter((e) => e in a).map((e) => [e, H(a[e])]));
}
var Ke = {
	ability: (e, t) => e.rollAbilityCheck({ ability: t }, z, B),
	tool: (e, t) => e.rollToolCheck({ tool: t }, z, B),
	death: (e) => e.rollDeathSave({}, z, B),
	hitDie: (e, t) => e.rollHitDie(t ? { denomination: t } : {}, z, B),
	initiative: async (e) => {
		let t = e.getInitiativeRoll();
		return t ? (await t.evaluate({ allowInteractive: !1 }), [t]) : null;
	}
};
function qe(e, t, n) {
	return {
		sheet: (n) => e([], async () => {
			let e = t(n), r = R.dnd5e?.applications?.actor ?? {};
			return {
				id: e.id,
				name: e.name,
				img: e.img,
				type: e.type,
				flags: H(e.flags ?? {}),
				system: U(e.system),
				statuses: [...e.statuses ?? []],
				items: [...e.items].map((e) => ({
					...g(e),
					img: e.img,
					sort: e.sort,
					system: U(e.system),
					labels: H(e.labels ?? {})
				})),
				effects: [...e.allApplicableEffects()].map((e) => ({
					id: e.id,
					name: e.name,
					img: e.img,
					disabled: e.disabled,
					suppressed: e.isSuppressed ?? !1,
					origin: e.origin ?? null,
					from: e.parent?.documentName === "Item" ? {
						itemId: e.parent.id,
						name: e.parent.name
					} : null,
					statuses: [...e.statuses ?? []],
					duration: H(e.duration),
					changes: H(e.system?.changes ?? e.changes ?? [])
				})),
				breakdown: {
					hp: await Ge(r.HitPointsConfig, e, [
						"classes",
						"ability",
						"effects",
						"levels"
					]),
					ac: await Ge(r.ArmorClassConfig, e, ["calculations", "formulaLabel"])
				}
			};
		}),
		roster: (t) => e([], async () => [...R.game.actors].filter((e) => !t || t.includes(e.id)).map((e) => ({
			id: e.id,
			name: e.name,
			img: e.img,
			type: e.type,
			system: U(e.system),
			items: [...e.items].filter((e) => [
				"class",
				"race",
				"background"
			].includes(e.type)).map((e) => ({
				id: e.id,
				type: e.type,
				name: e.name,
				levels: e.system?.levels ?? null
			})),
			conditions: [...e.effects].filter((e) => e.active && e.statuses?.size).map((e) => e.name)
		}))),
		edit: (n, r) => e([], async () => {
			let e = t(n);
			for (let t of r) if (t.kind === "set") await e.update(V(e, t.path, t.value, t.remove));
			else if (t.kind === "item") {
				let n = e.items.get(t.itemId, { strict: !0 });
				await n.update(V(n, t.path, t.value, t.remove));
			} else if (t.kind === "itemDelete") await e.deleteEmbeddedDocuments("Item", [t.itemId]);
			else if (t.kind === "effect") {
				let n = e.effects.get(t.effectId, { strict: !0 });
				await n.update(V(n, t.path, t.value, t.remove));
			} else if (t.kind === "effectCreate") await e.createEmbeddedDocuments("ActiveEffect", [t.data]);
			else if (t.kind === "effectDelete") await e.deleteEmbeddedDocuments("ActiveEffect", [t.effectId]);
			else if (t.kind === "status") await e.toggleStatusEffect(t.statusId, t.levels === void 0 ? { active: t.active ?? !0 } : { levels: t.levels });
			else throw Error(`不认识的改动：${t.kind}`);
			return { edits: r.length };
		}, [n]),
		check: (r, i, a, o = []) => e(o, async () => {
			let e = Ke[i];
			if (!e) throw Error(`没有这种检定：${i}`);
			return (await e(t(r), a))?.map(n) ?? null;
		}, [r]),
		deleteActors: (t) => e([], async () => {
			let e = t.filter((e) => R.game.actors.get(e));
			return e.length && await R.CONFIG.Actor.documentClass.deleteDocuments(e), { deleted: e };
		})
	};
}
// src/rules/kernel/frame/commands.ts
var W = globalThis, Je = class extends Error {
	request;
	constructor(e) {
		super("KERNEL_NEEDS_DICE"), this.request = e;
	}
}, Ye = class extends Error {
	where;
	constructor(e) {
		super("KERNEL_NEEDS_INPUT"), this.where = e;
	}
};
function Xe(e, t) {
	let n = W.CONFIG.Dice, r = n.randomUniform, i = W.foundry.dice.terms.Die.prototype, a = Object.hasOwn(i, "roll"), o = i.roll, s = 0, c = 0;
	i.roll = function(...e) {
		return c = this.faces, o.apply(this, e);
	}, n.randomUniform = () => {
		if (s >= e.length) throw new Je({
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
		if (l(), e instanceof Je) return {
			used: s,
			needs: e.request
		};
		if (e instanceof Ye) return {
			used: s,
			input: e.where
		};
		throw e;
	});
}
async function Ze(e) {
	let t = W.game.socket, n = t.emit, r = [];
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
function Qe(e) {
	let t = W.foundry.applications.api.ApplicationV2.prototype, n = t.render;
	return t.render = function() {
		throw new Ye(this.constructor.name);
	}, e().finally(() => {
		t.render = n;
	});
}
function G(e) {
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
var K = (e) => W.game.actors.get(e, { strict: !0 });
function $e(e) {
	let t = {};
	for (let n of e) {
		if (n.action !== "update" || n.type !== "Actor" || n.parentUuid) continue;
		let e = W.game.actors.get(n.data._id);
		if (e?._prepareActiveEffectAttributions) for (let r of Object.keys(W.foundry.utils.flattenObject(n.data)).filter((e) => e.startsWith("system."))) {
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
async function q(e, t, n = []) {
	let r, i = [];
	try {
		({value: r, changes: i} = await Ze(() => Xe(e, () => Qe(t)).then(async (e) => (await l(), e))));
	} catch (e) {
		return {
			status: "error",
			error: e instanceof Error ? e.message : String(e),
			stack: e instanceof Error ? e.stack ?? null : null,
			changes: i
		};
	}
	let a = n.flatMap((e) => ce(K(e))), o = r.value;
	return {
		status: r.needs ? "missing" : r.input ? "pending" : o?.kernelStatus ?? (a.length ? "unsupported" : "complete"),
		result: o ?? null,
		sources: $e(i),
		changes: i,
		diceUsed: r.used,
		missing: r.needs ? { dice: r.needs } : r.missing ?? null,
		pending: r.input ? { input: r.input } : o?.pending ?? null,
		unsupported: a
	};
}
var et = fe(q, K), tt = _e(q, K), nt = Te(q), rt = Me(q, K), it = Pe(q, K), at = Le(q), ot = qe(q, K, G), st = He(q), ct = [
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
], lt;
function ut() {
	return lt ??= (async () => {
		let e = await (await fetch(new URL("modules/plutonium/js/Bundle.js", document.baseURI))).text(), t = Object.getPrototypeOf(async () => void 0).constructor, n = await new t(`${e}\n;return { ${ct.join(", ")} };`)();
		return n.Config._CONFIG_TEMP = {
			dataSources: { baseSiteUrl: new URL(".", document.baseURI).href },
			misc: { rulesVersion: "classic" }
		}, n.ConfigConsts.prePreInit({ implRegistryImportList: n.ImplementationRegistryImportList.get() }), n.Config._CONFIG = n.Config.api_getDefaults(), n.Config._CONFIG_PLAYER = n.Config._getDefaultPlayerConfig(), n.Vetools.prePreInit_preConfig(), n.VetoolsLinks.prePreInit_postConfig(), n.Vetools.prePreInit_postConfig(), n.UtilDamageTypes.init(), n.Dnd5eUtil.init(), n.Vetools.init(), n.SideDataInterfaces.init(), n;
	})();
}
var J = { configure: !1 }, dt = 15e3, Y = { create: !1 }, ft = {
	...et,
	...tt,
	...nt,
	...rt,
	...it,
	...at,
	...ot,
	...st,
	roll: (e, t = {}, n = [], r = {}) => q(n, async () => {
		let n = {
			basic: W.CONFIG.Dice.BasicRoll,
			d20: W.CONFIG.Dice.D20Roll,
			damage: W.CONFIG.Dice.DamageRoll
		}, i = new (r.kind ? n[r.kind] : W.Roll)(e, t, r.options ? structuredClone(r.options) : void 0);
		return await i.evaluate({ allowInteractive: !1 }), G(i);
	}),
	damage: (e, t, n = [], r = {}) => q(n, async () => {
		let n = K(e);
		return await n.applyDamage(t, r), { hp: n.system.attributes.hp.toObject?.() ?? { ...n.system.attributes.hp } };
	}, [e]),
	rest: (e, t, n = [], r = {}) => q(n, async () => {
		let n = await K(e)[t === "short" ? "shortRest" : "longRest"]({
			dialog: !1,
			chat: !1,
			...r
		});
		return n ? JSON.parse(JSON.stringify(n, (e, t) => e === "clone" ? void 0 : t)) : null;
	}, [e]),
	save: (e, t, n = []) => q(n, async () => (await K(e).rollSavingThrow({ ability: t }, J, Y))?.map(G) ?? null, [e]),
	skill: (e, t, n = []) => q(n, async () => (await K(e).rollSkill({ skill: t }, J, Y))?.map(G) ?? null, [e]),
	attack: (e, t, n = []) => q(n, async () => {
		let n = K(e).items.get(t, { strict: !0 }).system.activities.find((e) => e.type === "attack");
		if (!n) return null;
		let r = await n.rollAttack({}, J, Y), i = await n.rollDamage({}, J, Y);
		return {
			attack: r?.map(G) ?? null,
			damage: i?.map(G) ?? null
		};
	}, [e]),
	attribution: (e, t) => Object.fromEntries(t.map((t) => [t, (K(e)._prepareActiveEffectAttributions(t) ?? []).map((e) => ({
		label: e.label,
		mode: e.mode,
		value: e.value
	}))])),
	unsupported: () => W.game.actors.contents.flatMap((e) => ce(e)),
	convert: async (e, t, n = {}) => {
		let r = await ut(), i = {
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
				t = setTimeout(() => n(Error(`PROBE_TIMEOUT ${dt}`)), dt);
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
}, pt = (e) => e instanceof Error ? e.message : String(e);
async function mt(e, r, i) {
	let a = (e) => e.pack.docIdLocal, o = /* @__PURE__ */ new Map();
	if (await i(e) === null) return {
		accepted: e,
		errors: o
	};
	let s = (i, a, o) => {
		let s = new Set(a), c = (i) => {
			if (!s.has(i)) {
				s.add(i);
				for (let a of t(i.pack)) {
					if (n(a, r, [...s].map((e) => e.pack))) continue;
					let t = e.find((e) => !o.has(e) && n(a, r, [e.pack]));
					t && c(t);
				}
			}
		};
		return c(i), e.filter((e) => s.has(e));
	}, c = /* @__PURE__ */ new Set();
	for (let t of e) {
		let e = await i(s(t, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set()));
		e !== null && (c.add(t), o.set(a(t), e));
	}
	let l = /* @__PURE__ */ new Set(), u = async (e) => {
		if (l.has(e)) return;
		let t = s(e, l, c), n = await i(t);
		if (n !== null) o.set(a(e), n);
		else {
			l = new Set(t);
			for (let e of t) o.delete(a(e));
		}
	};
	for (let t of e) c.has(t) || await u(t);
	for (let t of e) c.has(t) && await u(t);
	return {
		accepted: e.filter((e) => l.has(e)),
		errors: o
	};
}
async function ht(e, t) {
	let { BrewUtil2: n, DataUtil: r, Parser: i, Renderer: a } = globalThis;
	await n.pGetBrew(), r.brew.pLoadSourceIndex = async () => ({}), r.prerelease.pLoadSourceIndex = async () => ({});
	let o = a.item;
	await o.pPopulatePropertyAndTypeReference();
	let s = await o._pGetCacheSiteGenericVariants(), c = [
		"_propertyMap",
		"_typeMap",
		"entryMap",
		"_additionalTypeEntriesMap",
		"_masteryMap"
	], l = c.map((e) => o[e]), u = new Set(Object.values(r).filter((e) => typeof e?.pMergeCopy == "function")), { accepted: d, errors: f } = await mt(e, new Set(Object.keys(i.SOURCE_JSON_TO_FULL).map((e) => e.toLowerCase())), async (e) => {
		let i = structuredClone(e.map((e) => e.doc)), a = "trpg-kernel-brew-check", d = [...u].map((e) => [e, e._mergeCache]), f = /* @__PURE__ */ new Set(), p = ["pLoadByMeta", "_pDoMetaMerge_handleCopyProp"].map((e) => [e, r[e]]);
		try {
			for (let [e] of d) e._mergeCache = {};
			for (let [e, t] of p) r[e] = (...e) => {
				let n = t.apply(r, e);
				if (n instanceof Promise) {
					f.add(n);
					let e = () => {
						f.delete(n);
					};
					n.then(e, e);
				}
				return n;
			};
			await n.pSetBrew(i);
			let e = n._pGetBrewProcessed_getMergedOutput({ cpyBrews: i });
			r._mutAddProps(e), await r._pDoMetaMerge(a, e);
			for (let [t, n] of Object.entries(e)) {
				if (!Array.isArray(n)) continue;
				let e = n.find((e) => e?._copy);
				if (e) return `${t}：${e.name ?? ""} 的 _copy 没有展开（${e._copy.source ?? ""}）`;
			}
			c.forEach((e, t) => {
				o[e] = structuredClone(l[t]);
			});
			let u = o._pGettingSiteGenericVariants;
			o._pGettingSiteGenericVariants = Promise.resolve(structuredClone(s)), o.addPrereleaseBrewPropertiesAndTypesFrom({ data: { itemMastery: t } });
			try {
				await o.pGetSiteUnresolvedRefItemsFromPrereleaseBrew({ brew: e });
			} finally {
				o._pGettingSiteGenericVariants = u;
			}
			return null;
		} catch (e) {
			return pt(e);
		} finally {
			for (; f.size;) await Promise.allSettled(f);
			for (let [e, t] of p) r[e] = t;
			delete r._merged[a], c.forEach((e, t) => {
				o[e] = l[t];
			});
			for (let [e, t] of d) t === void 0 ? delete e._mergeCache : e._mergeCache = t;
		}
	}), p = d.map((e) => e.doc);
	await n.pSetBrew(p), p.length && o.addPrereleaseBrewPropertiesAndTypesFrom({ data: { itemMastery: t } });
	let m = await n._LOCK.pLock();
	try {
		await n._pGetBrewProcessed_({ lockToken: m });
	} finally {
		n._LOCK.unlock();
	}
	return {
		loaded: p.map((e) => e.head.docIdLocal),
		flattened: d.reduce((e, t) => e + t.flattened, 0),
		excluded: e.flatMap(({ pack: e, failures: t }) => {
			let n = f.get(e.docIdLocal);
			if (n === void 0) return [];
			let r = t.map(({ name: e, reason: t }) => `${e}：${t}`);
			return [{
				docIdLocal: e.docIdLocal,
				filename: e.filename,
				sources: e.sources,
				reason: [n, ...r].join("\n")
			}];
		})
	};
}
// src/rules/kernel/frame/main.ts
var X = globalThis, Z = new URLSearchParams(location.search).get("frame") ?? "", gt = X.__trpgFrameErrors ?? [], _t = 1, Q = /* @__PURE__ */ new Map();
function vt(e) {
	return new Promise((t, n) => {
		let i = 1e6 + _t++;
		Q.set(i, {
			resolve: t,
			reject: n
		}), parent.postMessage({
			channel: r,
			type: "request",
			frame: Z,
			id: i,
			...e
		}, location.origin);
	});
}
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "response" || !Q.has(t.id)) return;
	let n = Q.get(t.id);
	Q.delete(t.id), t.ok ? n.resolve(t.value) : n.reject(Error(t.error));
});
async function yt(e) {
	let t = await fetch(new URL(e, location.href));
	if (!t.ok) throw Error(`${t.status}: ${e}`);
	return t.text();
}
async function bt(e) {
	let t = await vt({
		op: "file",
		path: `packs/${e}.json`
	});
	if (typeof t != "string") throw Error(`Pack is not available: ${e}`);
	return JSON.parse(t);
}
var $;
async function xt(e) {
	if ($) throw Error("Kernel is already booted");
	let t = [], { foundry: n, Hooks: r } = X;
	h(e.seed ?? "kernel"), X.release = new n.config.ReleaseData(e.release);
	let i = o(e);
	X.packages = {
		System: new n.utils.Collection([[i.system.id, new n.packages.System(i.system)]]),
		Module: new n.utils.Collection(i.modules.map((e) => [e.id, new n.packages.Module(e)]))
	};
	let a = X.io({
		autoConnect: !1,
		forceNew: !0
	});
	$ = {
		...u(a, {
			userId: e.userId,
			worldTime: e.worldTime,
			readPack: bt,
			readText: yt
		}),
		steps: t
	};
	let s = n.Game;
	class c extends s {
		activateListeners() {
			t.push("omit UI event listeners");
		}
		initializeUI() {
			for (let [e, t] of Object.entries(X.CONFIG.ui)) X.ui[e] = new t();
			X.ui.windows ??= {};
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
	X.game = new c("game", i, a), X.game.nue && (X.game.nue.initialize = () => void 0), X.game.settings.storage.get("client").setItem("core.noCanvas", "true"), await Tt(`systems/${i.system.id}/dnd5e.js`);
	for (let e of i.modules) for (let t of e.esmodules ?? []) await import(
		/* @vite-ignore */
		new URL(t, location.href).href
);
	r.once("setup", () => {
		X.CONFIG.DND5E?.calendar && (X.CONFIG.DND5E.calendar.application = null);
	}), await X.game.initialize();
	let l = Date.now() + 3e4;
	for (; i.modules.some((e) => e.id === "plutonium") && typeof X.game.modules.get("plutonium")?.api != "object";) {
		if (Date.now() > l) throw Error("Plutonium API was not ready within 30 seconds");
		await new Promise((e) => setTimeout(e, 50));
	}
	return St();
}
function St() {
	let e = X.game;
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
		errors: [...gt]
	};
}
function Ct() {
	return X.game.actors.contents.map((e) => ({
		source: e.toObject(),
		system: e.system.toObject(!1),
		name: e.name,
		validation: e.validationFailures
	}));
}
var wt = {
	...ft,
	boot: xt,
	loadBrews: ht,
	status: St,
	preparedActors: Ct,
	changes: () => $?.changes ?? [],
	calls: () => $?.calls ?? [],
	steps: () => $?.steps ?? []
};
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "call") return;
	let n = (e) => parent.postMessage({
		channel: r,
		type: "result",
		frame: Z,
		id: t.id,
		...e
	}, location.origin), i = wt[t.fn];
	if (!i) return n({
		ok: !1,
		error: `Unknown kernel command: ${t.fn}`
	});
	Promise.resolve().then(() => i(...t.args)).then((e) => n({
		ok: !0,
		value: e
	}), (e) => n({
		ok: !1,
		error: e instanceof Error ? e.stack ?? e.message : String(e)
	}));
});
function Tt(e) {
	return new Promise((t, n) => {
		let r = document.createElement("script");
		r.src = e, r.onload = () => t(), r.onerror = () => n(Error(`Failed to load ${e}`)), document.head.append(r);
	});
}
async function Et() {
	X.SIGNED_EULA = !0, X.ROUTE_PREFIX = new URL(".", location.href).pathname.replace(/^\/+|\/+$/g, ""), X.MESSAGES = null, await import(
		/* @vite-ignore */
		new URL("scripts/foundry.mjs", location.href).href
);
	let e = {
		channel: r,
		type: "ready",
		frame: Z,
		codeSet: "foundry",
		authorVersion: X.foundry?.CONST?.vtt ?? null,
		present: { foundry: !!X.foundry?.Game },
		errors: [...gt]
	};
	parent.postMessage(e, location.origin);
}
document.readyState === "complete" ? Et() : addEventListener("load", () => {
	Et();
}, { once: !0 });
