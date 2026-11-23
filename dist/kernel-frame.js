import { a as e, c as t, d as n, g as r, i, l as a, m as o, n as s, p as c, r as l, t as u, u as d, y as f } from "./tokens-DRn-Ztq4.js";
import { a as p, o as m, t as h } from "./protocol-CoIo3UiI.js";
// src/rules/kernel/frame/request.ts
var g = new URLSearchParams(location.search).get("frame") ?? "", _ = 1, v = /* @__PURE__ */ new Map();
function y(e) {
	return new Promise((t, n) => {
		let r = 1e6 + _++;
		v.set(r, {
			resolve: t,
			reject: n
		}), parent.postMessage({
			channel: h,
			type: "request",
			frame: g,
			id: r,
			...e
		}, location.origin);
	});
}
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "response" || !v.has(t.id)) return;
	let n = v.get(t.id);
	v.delete(t.id), t.ok ? n.resolve(t.value) : n.reject(Error(t.error));
});
// src/rules/kernel/packages.ts
var b = [
	"esmodules",
	"scripts",
	"styles"
];
function x(e, t) {
	let n = `${t}s/${e.id}/`, r = (e) => /^(?:[a-z]+:)?\/\//i.test(e) || e.startsWith(n) ? e : n + e.replace(/^\.?\//, ""), i = structuredClone(e);
	for (let e of b) {
		let t = i[e];
		Array.isArray(t) && (i[e] = t.map((e) => typeof e == "string" ? r(e) : {
			...e,
			src: r(String(e.src))
		}));
	}
	return Array.isArray(i.languages) && (i.languages = i.languages.map((e) => ({
		...e,
		path: r(e.path)
	}))), i;
}
// src/rules/kernel/frame/world.ts
function ee(e) {
	let { CONST: t, CONFIG: n, foundry: r } = globalThis, i = x(e.system, "system"), a = e.modules.map((e) => ({
		...x(e, "module"),
		active: !0
	})), o = `${e.release.generation}.${e.release.build}`, s = {
		coreVersion: o,
		systemId: i.id,
		systemVersion: i.version
	}, c = 0, l = Object.entries({
		...e.settings,
		"core.moduleConfiguration": Object.fromEntries(a.map((e) => [e.id, !0]))
	}).map(([e, t]) => ({
		_id: `kernelSetting${String(++c).padStart(3, "0")}`,
		key: e,
		value: JSON.stringify(t),
		_stats: s
	})), u = Object.fromEntries(t.ALL_DOCUMENT_TYPES.map((e) => {
		let r = /* @__PURE__ */ new Set([
			"base",
			...Object.keys(n[e]?.dataModels ?? {}),
			...Object.keys(n[e]?.typeLabels ?? {}),
			...Object.keys(i.documentTypes?.[e] ?? {}),
			...e === "Folder" ? t.FOLDER_DOCUMENT_TYPES : []
		]);
		return [e, Object.fromEntries([...r].map((e) => [e, {}]))];
	})), d = [...new r.packages.System(i).packs].map((e) => ({
		...e,
		id: `${i.id}.${e.name}`,
		packageType: "system",
		packageName: i.id,
		system: i.id,
		index: [],
		folders: []
	})), f = e.documents;
	return {
		userId: e.userId,
		release: e.release,
		system: i,
		modules: a,
		model: u,
		packs: d,
		settings: l,
		world: {
			id: e.world.id,
			title: e.world.title,
			system: i.id,
			coreVersion: o,
			systemVersion: i.version,
			flags: { [i.id]: { version: i.version } }
		},
		options: { language: e.language },
		users: [{
			_id: e.userId,
			name: "GM",
			role: t.USER_ROLES.GAMEMASTER
		}],
		actors: f.actors ?? [],
		items: f.items ?? [],
		folders: f.folders ?? [],
		scenes: f.scenes ?? [],
		combats: f.combats ?? [],
		journal: f.journal ?? [],
		macros: f.macros ?? [],
		tables: f.tables ?? [],
		playlists: [],
		cards: [],
		messages: []
	};
}
// src/rules/kernel/frame/server.ts
function te(e, t) {
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
		a[o] = typeof i == "object" && i ? structuredClone(i) : i;
	}
	return n;
}
var S = 0;
async function C(e = 2e3) {
	let t = Date.now() + e, n = 0;
	for (; n < 2 && Date.now() < t;) await new Promise((e) => setTimeout(e, 0)), n = S === 0 ? n + 1 : 0;
}
function w(e, t) {
	let n = globalThis, r = [], i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), c = 0, l = (e) => {
		for (let t of e) {
			let e = /^kernel(\d{10})$/.exec(t);
			e && (c = Math.max(c, Number(e[1])));
		}
	}, u = e.emit.bind(e), d = async (e) => {
		let n = a.get(e);
		if (n) return n;
		let r = o.get(e);
		return r || (r = t.readPack(e), o.set(e, r), r.catch(() => {
			o.delete(e);
		})), r;
	};
	async function f(e) {
		let t = e.operation, n = t.pack ?? null;
		if (e.action === "get") {
			if (!n) return [];
			let e = t.query ?? {};
			if (Object.keys(e).some((e) => e !== "_id")) throw Error(`Unsupported pack query: ${JSON.stringify(e)}`);
			let r = await d(n), i = e._id ? r.filter((t) => t._id === e._id) : r;
			if (!t.index) return structuredClone(i);
			if (!Array.isArray(t.indexFields)) throw Error("Official index request has no fields");
			return i.map((e) => te(e, t.indexFields));
		}
		if (n && !a.has(n)) throw Error(`Original pack is read-only: ${n}`);
		let i = t.parentUuid ?? null, o = n ? a.get(n) : s.get(e.type) ?? s.set(e.type, []).get(e.type);
		if (e.action === "create") {
			let a = t.data.map((e) => {
				let n = structuredClone(e);
				return !t.keepId || !n._id ? n._id = `kernel${String(++c).padStart(10, "0")}` : l([n._id]), n;
			});
			i || o.push(...a);
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
		let s = typeof r.at(-1) == "function" ? r.at(-1) : null, c = (e, t) => {
			S++, e.then((e) => s(t(e)), (e) => s({ error: { message: e.message } })).finally(() => {
				S--;
			});
		};
		if (e === "template") return c(t.readText(r[0]), (e) => ({ html: e }));
		if (e === "time") return s({
			serverTime: Date.now(),
			worldTime: t.worldTime
		});
		if (e === "modifyDocument") {
			let e = o[0];
			return c(f(e), (n) => ({
				...e,
				userId: t.userId,
				result: n
			}));
		}
		if (e === "modifyDocumentBatch") {
			let e = o[0];
			return c(Promise.all(e.map(async (e) => ({
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
		calls: i,
		reserve: l
	};
}
// src/rules/kernel/frame/random.ts
var T = null, E = null;
function D(e, t) {
	return E ? E(e, t) : t();
}
function ne(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return t >>> 0;
}
function O(e) {
	T = e.crypto.getRandomValues.bind(e.crypto);
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
	}), E = async (e, n) => {
		let r = t;
		t = ne(e);
		try {
			return await n();
		} finally {
			t = r;
		}
	}, (e) => {
		t = ne(e);
	};
}
function k() {
	let e = /* @__PURE__ */ new Uint32Array(4);
	return T ? T(e) : crypto.getRandomValues(e), Array.from(e, (e) => e.toString(16).padStart(8, "0")).join("");
}
// src/rules/kernel/frame/seed.ts
var A = O(globalThis);
function re() {
	return k();
}
function j(e) {
	A(e);
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
var M = [
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
], oe = {
	rule: "no-target",
	reason: "目标路径既没有数据字段，人物身上也没有这个属性；原代码写进去也没有规则读取"
}, N = globalThis, se = /* @__PURE__ */ new WeakMap(), ce = !1, P = (e) => e?.documentName === "Actor";
function le(e, t, n) {
	let r = String(t.effect?.uuid ?? ""), i = String(t.key ?? ""), a = se.get(e);
	a || se.set(e, a = /* @__PURE__ */ new Map()), a.has(`${r}|${i}`) || a.set(`${r}|${i}`, {
		actor: e.id,
		effect: r,
		key: i,
		value: t.value,
		rule: n.rule,
		reason: n.reason,
		affects: i
	});
}
function ue() {
	if (ce) return;
	let e = N.CONFIG?.ActiveEffect?.documentClass, t = N.CONFIG?.Actor?.documentClass;
	if (!e || !t) return;
	ce = !0;
	let n = t.prototype.applyActiveEffects;
	t.prototype.applyActiveEffects = function(e, ...t) {
		return (e === "initial" || e === void 0) && se.set(this, /* @__PURE__ */ new Map()), n.call(this, e, ...t);
	};
	let r = e.applyChange;
	e.applyChange = function(e, t, ...n) {
		let i = P(e) && t?.effect ? M.find((e) => e.test(String(t.key ?? ""))) : void 0;
		return i && le(e, t, {
			rule: i.id,
			reason: i.reason
		}), r.call(this, e, t, ...n);
	};
	let i = e._applyChangeUnguided;
	e._applyChangeUnguided = function(e, t, ...n) {
		return P(e) && t?.effect && N.foundry.utils.getProperty(e, t.key) === void 0 && !M.some((e) => e.test(String(t.key ?? ""))) && le(e, t, oe), i.call(this, e, t, ...n);
	};
}
function de(e) {
	return ue(), se.has(e) || e.reset(), [...se.get(e)?.values() ?? []];
}
// src/rules/kernel/frame/commands-items.ts
var fe = globalThis;
function pe(e) {
	return !e || e.max === void 0 || e.max === null || e.max === "" ? null : {
		value: e.value ?? null,
		max: e.max ?? null,
		spent: e.spent ?? null
	};
}
function F(e) {
	return {
		id: e.id,
		name: e.name,
		type: e.type,
		equipped: "equipped" in e.system ? e.system.equipped : null,
		attuned: "attuned" in e.system ? e.system.attuned : null,
		attunement: e.system.attunement ?? null,
		uses: pe(e.system.uses),
		activities: e.system.activities ? [...e.system.activities].map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			uses: pe(e.uses)
		})) : []
	};
}
function me(e) {
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
function he(e) {
	return e.map((e) => ({
		formula: e.formula ?? null,
		total: e.total ?? null,
		dice: e.dice?.map((e) => ({
			faces: e.faces,
			results: e.results?.map((e) => e.result)
		})) ?? []
	}));
}
function ge(e, t) {
	let n = (e, n) => t(e).items.get(n, { strict: !0 });
	return {
		equip: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.equipped": !!a }), {
				item: F(o),
				actor: me(e)
			};
		}, [r]),
		attune: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.attuned": !!a }), {
				item: F(o),
				actor: me(e)
			};
		}, [r]),
		useItem: (t, r, i = [], a = null) => {
			let o = [], s = fe.ui?.notifications, c = s?.error;
			return s && c && (s.error = function(e, ...t) {
				return o.push(String(e)), c.call(this, e, ...t);
			}), e(i, async () => {
				let e = n(t, r), i, s = null;
				if (a) {
					if (s = e.system.activities?.get(a), !s) throw Error(`Item has no activity: ${a}`);
					i = await s.use({}, { configure: !1 }, { create: !1 });
				} else i = await e.use({}, { configure: !1 }, { create: !1 });
				return {
					item: F(e),
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
				})) : fe.foundry.utils.isEmpty(n.updates) || (await t.update(n.updates), i.push({
					id: t.id,
					name: t.name,
					updates: n.updates,
					rolls: he(n.rolls ?? [])
				})));
			}
			return {
				period: r,
				items: i,
				actor: me(e)
			};
		}, [n])
	};
}
// src/rules/kernel/frame/commands-combat.ts
var _e = globalThis;
function ve(e) {
	let t = e.system.spells;
	return t ? Object.fromEntries(Object.entries(t).map(([e, t]) => [e, {
		value: t.value ?? null,
		max: t.max ?? null,
		level: t.level ?? null,
		type: t.type ?? null
	}])) : null;
}
function ye(e) {
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
function be(e) {
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
function xe(e) {
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
function Se(e) {
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
function Ce(e, t) {
	let n = null, r = () => n ?? _e.game.combat, i = () => {
		let e = r();
		if (!e) throw Error("No active combat");
		return e;
	};
	return {
		combatStart: (t, r = []) => e(r, async () => {
			let e = await _e.CONFIG.Combat.documentClass.create({
				name: "Kernel encounter",
				combatants: t.map((e) => ({ actorId: e }))
			});
			return await e.rollInitiative(e.combatants.map((e) => e.id), { dialog: !1 }), await e.startCombat(), n = e, xe(e);
		}, t),
		combatNext: (t = []) => e(t, async () => {
			let e = i();
			return await e.nextTurn(), xe(e);
		}),
		combatEnd: () => e([], async () => {
			let e = i();
			await e.endCombat();
			let t = xe(e);
			return n = null, t;
		}),
		cast: (n, r, i, a = [], o = {}) => e(a, async () => {
			let e = t(n), a = e.items.get(r, { strict: !0 }), s = a.system.activities?.get(i);
			if (!s) throw Error(`Item has no activity: ${i}`);
			let c = await s.use(o, { configure: !1 }, { create: !1 });
			return {
				item: F(a),
				activity: {
					id: s.id,
					name: s.name,
					type: s.type
				},
				slots: ve(e),
				concentration: ye(e),
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
			return await e.toggleStatusEffect(r, { active: i }), be(e);
		}, [n]),
		concentrationCheck: (n, r, i = []) => e(i, async () => {
			let e = t(n);
			if (!e.concentration?.effects?.size) return {
				dc: null,
				skipped: "not concentrating",
				concentration: ye(e)
			};
			let i = e.getConcentrationDC(r), a = await e.rollConcentration({ target: i }, { configure: !1 }, { create: !1 }), o = a?.[0] ?? null, s = o ? o.total >= i : null;
			return s === !1 && await e.endConcentration(), {
				dc: i,
				success: s,
				rolls: (a ?? []).map(Se),
				concentration: ye(e)
			};
		}, [n]),
		concentration: (n) => e([], async () => ye(t(n)), [n])
	};
}
// src/rules/kernel/frame/plutonium-zh.ts
async function we(e, t, n = fetch) {
	try {
		let r = await n(new URL("fingerprints.json", t), { cache: "no-store" });
		if (r.status === 404) return null;
		if (!r.ok) throw Error(`读取中文构建指纹失败（${r.status}）`);
		let i = await r.json();
		if (i.original !== m(e)) throw Error("私人完整版已变化");
		let a = await n(new URL("Bundle.js", t), { cache: "no-store" });
		if (!a.ok) throw Error(`读取中文构建失败（${a.status}）`);
		let o = await a.text();
		if (i.localized !== m(o)) throw Error("中文构建文件与指纹不匹配");
		return o;
	} catch (e) {
		return console.warn("建卡使用私人完整版原文。可运行 npm run gen:plutonium-zh 重生成中文构建。", e), null;
	}
}
// src/rules/kernel/frame/plutonium-build.ts
var Te = "13b1a03b99eab99f4b078e11075c7092c175a365d076d5319914f376c583e245", Ee = "608e0a5497354d1937c3d3e780f85a103c4ddffb846d4bb1cdcfb00bdffb0bf2", De = [
	"Charactermancer_FeatureOptionsSelect",
	"Charactermancer_AdditionalFeatsSelect",
	"StatGenUtilAdditionalFeats",
	"DataPrimerFauxFeatureClassSubclassFeat",
	"DataPrimerFauxFeatureClassSubclassOptionalfeature",
	"UtilDataConverter",
	"Config",
	"Charactermancer_AvailableProficiencyManager",
	"CharactermancerFeatureSubCompManagerProficiencyOtherBase",
	"Charactermancer_ItemMasteries_Util",
	"Charactermancer_Class_Util",
	"Charactermancer_OtherProficiencySelect",
	"Charactermancer_ExpertiseSelect",
	"Charactermancer_ImmResVulnSelect",
	"UtilAdvancementsEntry",
	"UtilAdvancements",
	"ComponentUiUtil",
	"veE",
	"EQUIPMENT_TYPE_EXPANDERS",
	"UtilEntityItem"
], I = null, Oe;
async function ke(e, t = !1) {
	if (!e.pathname.endsWith("/modules/plutonium/js/Bundle.js")) {
		await import(
			/* @vite-ignore */
			e.href
);
		return;
	}
	let n = await fetch(e);
	if (!n.ok) throw Error(`读取 Plutonium 失败：${n.status}`);
	let r = await n.text(), i = new URL(n.url || e.href), a = m(r);
	if (a !== Te) {
		let e = new URL("../private/modules/plutonium/js/Bundle.js", location.href), n = t && i.href === e.href ? await we(r, new URL("../private/lang/zh/modules/plutonium/js/", location.href)) : null;
		if (i.href === e.href && a === Ee) {
			let { nativeBuilder: e } = await Ae(n ?? r, i, "\nexport const nativeBuilder = { ActorCharactermancer, ComponentUiUtil, Charactermancer_Util, Charactermancer_Spell_Level, Charactermancer_AvailableEquipmentInfo };\n");
			Oe = e;
		} else n === null ? await import(
			/* @vite-ignore */
			i.href
) : await Ae(n, i);
	} else I = (await Ae(r, e, `\nexport const buildAdapter = { ${De.join(", ")} };\n`)).buildAdapter;
}
async function Ae(e, t, n = "") {
	let r = e.replace("import('../lib/ace.js')", `import(${JSON.stringify(new URL("../lib/ace.js", t).href)})`), i = URL.createObjectURL(new Blob([
		r,
		n,
		`\n//# sourceURL=${t.href}\n`
	], { type: "text/javascript" }));
	try {
		return await import(
			/* @vite-ignore */
			i
);
	} finally {
		URL.revokeObjectURL(i);
	}
}
// src/rules/kernel/frame/trait-origins.ts
var je = "tavern-trpg-assistant", Me = "automaticTraitOrigins";
function Ne(e) {
	return e.flags?.[je]?.[Me] ?? {};
}
function Pe(e) {
	let t = e.flags?.[je];
	t && Me in t && (delete t[Me], Object.keys(t).length || delete e.flags[je]);
}
var Fe = (e = []) => [...e].sort(), Ie = (e) => p({
	type: e.type,
	level: e.level ?? 0,
	restriction: e.classRestriction || null,
	name: e.name ?? "",
	hint: e.hint ?? "",
	mode: e.configuration?.mode ?? "default",
	grants: Fe(e.configuration?.grants),
	allowReplacements: !!e.configuration?.allowReplacements,
	choices: (e.configuration?.choices ?? []).map((e) => [e.count ?? 1, Fe(e.pool)])
});
async function Le(e) {
	let t = I;
	if (!t) return e();
	let n = t.UtilAdvancementsEntry, r = t.UtilAdvancements, i = n.getGenericAdvancements, a = r.getAdvancementsObject, o = /* @__PURE__ */ new WeakMap(), s = /* @__PURE__ */ new Map();
	n.getGenericAdvancements = function(e, ...t) {
		let n = new Proxy(this, { get(e, t, n) {
			let r = Reflect.get(e, t, n);
			return typeof r != "function" || typeof t != "string" || !t.startsWith("_getGenericAdvancements_") ? r : (t, ...n) => {
				let i = /* @__PURE__ */ new Map(), a = r.call(e, new Proxy(t, { get(e, t, n) {
					let r = Reflect.get(e, t, n);
					return typeof t == "string" && Array.isArray(r) && i.set(t, r), r;
				} }), ...n);
				if (i.size === 1 && a.some((e) => e.type === "Trait")) {
					let [[e, t]] = i, n = {
						field: e,
						input: p(t)
					};
					for (let e of a) e.type === "Trait" && o.set(e, n);
				}
				return a;
			};
		} });
		return i.call(n, e, ...t);
	}, r.getAdvancementsObject = function(...e) {
		let t = a.apply(this, e);
		for (let [e, n] of Object.entries(t)) {
			let t = o.get(n);
			t ? s.set(e, {
				origin: t,
				signature: Ie(n)
			}) : s.delete(e);
		}
		return t;
	};
	try {
		let t = await e(), n = Object.fromEntries(Object.entries(t.system?.advancement ?? {}).flatMap(([e, t]) => {
			let n = s.get(e);
			return n && n.signature === Ie(t) ? [[e, n.origin]] : [];
		}));
		return Pe(t), Object.keys(n).length && (t.flags ??= {}, t.flags[je] ??= {}, t.flags[je][Me] = n), t;
	} finally {
		n.getGenericAdvancements = i, r.getAdvancementsObject = a;
	}
}
// src/rules/kernel/frame/importer.ts
var Re = globalThis, ze = {
	skillsChosenFvtt: [],
	languagesChosenFvtt: [],
	armorProficienciesChosenFvtt: [],
	weaponProficienciesChosenFvtt: [],
	toolProficienciesChosenFvtt: []
};
function Be() {
	let e = Re.foundry?.documents?.collections?.CompendiumCollection;
	if (e?.prototype && !e.prototype.getDocuments.__seeded) for (let t of ["getDocuments", "getDocument"]) {
		let n = e.prototype[t], r = function(...e) {
			return D(`pack:${this.collection}:${t}:${JSON.stringify(e)}`, () => n.apply(this, e));
		};
		r.__seeded = !0, e.prototype[t] = r;
	}
}
var Ve = Promise.resolve();
function L(e, t) {
	let n = Ve.then(() => He(e, t));
	return Ve = n.then(() => void 0, () => void 0), n;
}
async function He(e, t) {
	Be();
	let n = Re.game.modules.get("plutonium")?.api;
	if (!n?.importer) throw Error("Plutonium importer is not available");
	let r = await n.importer.pGetImporter({ prop: e });
	if (!r) throw Error(`No Plutonium importer for ${e}`);
	let i = async () => {
		let i = structuredClone(t), a = new n.importer.ImportOpts({ isTemp: !0 }), o = (e === "class" && r.pImportEntryClass ? await r.pImportEntryClass(i, a) : await r.pImportEntry(i, a, structuredClone(ze)))?.imported?.[0]?.document ?? null;
		if (!o) throw Error(`Plutonium import failed for ${t?.name ?? e}`);
		return o.toObject ? o.toObject() : o;
	};
	return j(ie(e, t)), await i(), j(ie(e, t)), Le(i);
}
async function Ue(e) {
	return (await We(e)).map((e) => e.prop);
}
async function We(e) {
	let t = Re.game.modules.get("plutonium")?.api;
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
// src/rules/kernel/frame/off.ts
var Ge = globalThis, Ke = "trpgOffHidden000", qe = (e) => {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}, Je = (e) => e.constructor?.typeName ?? e.type, Ye = (e) => JSON.parse(JSON.stringify(e ?? null, (e, t) => t instanceof Set ? [...t] : t));
function Xe(e) {
	let t = e.system.details?.level ?? 1, n = [];
	for (let r of e.items) {
		let e = qe(r);
		if (e) for (let i of Object.values(r.advancement?.byId ?? {})) for (let a of i.levels ?? []) (a <= t || a === 0) && n.push({
			item: r,
			key: e,
			adv: i,
			type: Je(i),
			level: a
		});
	}
	return n;
}
var Ze = () => Ge.foundry.data.fields, Qe = (e) => e instanceof Ze().ArrayField, $e = (e) => e instanceof Ze().TypedObjectField;
function et(e, t) {
	let n = e?.schema?.fields;
	if (!n || !t || typeof t != "object") return null;
	let r = [];
	for (let [e, i] of Object.entries(n)) {
		let n = t[e];
		if (Qe(i) && Array.isArray(n)) for (let t of n) typeof t == "string" && r.push([e, t]);
		else if ($e(i) && n && typeof n == "object") for (let [t, i] of Object.entries(n)) r.push([e, t]), typeof i == "string" && r.push([e, i]);
	}
	return r;
}
function tt(e, t, n) {
	let r = { ...t };
	for (let [i, a] of Object.entries(e.schema.fields)) {
		let e = t?.[i];
		Qe(a) && Array.isArray(e) ? r[i] = e.filter((e) => !(typeof e == "string" && n.has(e))) : $e(a) && e && typeof e == "object" && (r[i] = Object.fromEntries(Object.entries(e).filter(([e, t]) => !n.has(e) && !(typeof t == "string" && n.has(t)))));
	}
	return r;
}
var nt = (e) => ({
	value: e.constructor?.metadata?.dataModels?.value,
	configuration: e.constructor?.metadata?.dataModels?.configuration
}), rt = (e, t) => {
	let n = nt(e).value;
	return !!n?.schema?.fields && !!t && typeof t == "object" && Object.keys(t).every((e) => e in n.schema.fields);
};
function it(e, t) {
	let n = nt(e), r = [...et(n.value, Ye(e.value)) ?? [], ...et(n.configuration, Ye(e.configuration)) ?? []].map(([, e]) => e), i = typeof e.storagePath == "function" ? e.storagePath(t) : null, a = i ? Ye(Ge.foundry.utils.getProperty(e, i)) : null, o = a && typeof a == "object" ? Object.values(a).filter((e) => typeof e == "string") : [];
	return [.../* @__PURE__ */ new Set([...r, ...o])];
}
function at(e, t) {
	let n = [], r = (i, a) => {
		for (let [o, s] of Object.entries(i ?? {})) {
			let i = a ? `${a}.${o}` : o;
			s instanceof Ze().DocumentIdField && s.model?.documentName === "Item" && Ge.foundry.utils.getProperty(e._source.system, i) === t ? n.push(`system.${i}`) : s.fields && r(s.fields, i);
		}
	};
	return r(e.system.schema?.fields, ""), n;
}
var ot = (e, t) => t.ref === e.key && t.advancement === e.adv.id && (t.level === void 0 || t.level === e.level), st = (e) => e.advancement === void 0 && e.effect === void 0 && e.part !== void 0, ct = (e) => e.advancement === void 0 && e.effect === void 0 && e.part === void 0;
function lt(e, t, n) {
	let r = [];
	for (let i of n) {
		let n = [...e.items].find((e) => qe(e) === i.ref);
		if (!n) {
			r.push({
				off: i,
				reason: "人物身上没有这件作者条目"
			});
			continue;
		}
		if (i.effect !== void 0) {
			n.effects.has(i.effect) || r.push({
				off: i,
				reason: "这件条目上没有这个效果"
			});
			continue;
		}
		if (st(i)) {
			i.part.startsWith("system.") && n.system.schema?.getField?.(i.part.slice(7)) || r.push({
				off: i,
				reason: "这件条目的数据里没有这一项"
			});
			continue;
		}
		if (i.advancement === void 0) continue;
		let a = t.filter((e) => ot(e, i));
		a.length ? i.part !== void 0 && !a.some((e) => it(e.adv, e.level).includes(i.part)) && r.push({
			off: i,
			reason: "这条成长的记录里没有这一项"
		}) : r.push({
			off: i,
			reason: "这件条目没有这一条成长"
		});
	}
	return r;
}
async function ut(e, t) {
	if (!t?.length) return {
		applied: !1,
		choices: {},
		problems: []
	};
	let n = Xe(e), r = lt(e, n, t);
	if (r.length) return {
		applied: !1,
		choices: {},
		problems: r
	};
	let i = new Set(t.filter(ct).map((e) => e.ref)), a = (e) => i.has(e.key) ? [{ ref: e.key }] : t.filter((t) => ot(e, t)), o = (e) => new Set(a(e).flatMap((e) => e.part === void 0 ? [] : [e.part])), s = (e) => a(e).some((e) => e.part === void 0), c = new Set(n.filter((e) => a(e).length).map((e) => e.adv.constructor)), l = n.filter((e) => c.has(e.adv.constructor)), u = [];
	for (let e of [...l].reverse()) u.unshift({
		...e,
		data: Ye(await e.adv.reverse(e.level))
	});
	let d = {};
	for (let e of u) {
		if ((d[e.key] ??= []).push({
			id: e.adv.id,
			type: e.type,
			level: e.level,
			data: e.data
		}), s(e)) continue;
		let t = o(e), n = t.size > 0 && rt(e.adv, e.data);
		if (await e.adv.restore(e.level, n ? tt(nt(e.adv).value, e.data, t) : e.data), !n) for (let n of t) await e.adv.reverse(e.level, {
			key: n,
			uuid: n
		});
	}
	for (let e of u) {
		if (s(e)) continue;
		let t = nt(e.adv).value, n = await e.adv.automaticApplicationValue(e.level, { initial: !0 });
		if (!t?.schema?.fields || !n || typeof n != "object") continue;
		let r = new Set((et(t, Ye(e.adv.value)) ?? []).map(([, e]) => e)), i = o(e), a = (et(t, Ye(n)) ?? []).filter(([, e]) => !r.has(e) && !i.has(e));
		if (!a.length) continue;
		let c = {};
		for (let [e, t] of a) (c[e] ??= []).push(t);
		await e.adv.apply(e.level, c);
	}
	for (let n of t.filter(st)) [...e.items].find((e) => qe(e) === n.ref)?.updateSource({ [n.part]: null });
	for (let n of t) n.effect !== void 0 && [...e.items].find((e) => qe(e) === n.ref)?.effects.get(n.effect)?.updateSource({ disabled: !0 });
	let f = [...e.items].filter((e) => i.has(qe(e) ?? ""));
	for (let t of f) {
		for (let n of at(e, t.id)) e.updateSource({ [n]: null });
		for (let e of t.effects) e.updateSource({ disabled: !0 });
	}
	return f.length && await e.createEmbeddedDocuments("ActiveEffect", [{
		_id: Ke,
		name: "TRPG 已取下",
		type: "base",
		transfer: !1,
		flags: { trpg: { offController: !0 } },
		system: { changes: f.map((e) => ({
			key: "items.hidden",
			type: "add",
			value: e.id,
			priority: 0
		})) }
	}], { keepId: !0 }), e.reset(), {
		applied: !0,
		choices: d,
		problems: []
	};
}
// src/rules/kernel/frame/actor-state.ts
async function dt(e, t, n) {
	let r = await ut(e, t);
	if (r.problems.length) return {
		view: null,
		choices: {},
		problems: r.problems
	};
	let i = e.toObject();
	return await ft(e, n), {
		view: i,
		choices: r.choices,
		problems: []
	};
}
async function ft(e, t) {
	if (t) {
		t.actor && Object.keys(t.actor).length && await e.update(t.actor);
		for (let [n, r] of Object.entries(t.items ?? {})) {
			let t = f([...e.items], n);
			if (!t) throw Error(`状态差别指向的物品在重建结果里不存在：${n}`);
			await t.update(r);
		}
		for (let n of t.itemAdded ?? []) e.items.get(n._id) || await e.createEmbeddedDocuments("Item", [n], { keepId: !0 });
		for (let n of t.itemRemoved ?? []) {
			let t = f([...e.items], n);
			t?._id && await e.deleteEmbeddedDocuments("Item", [t._id]);
		}
		for (let [n, r] of Object.entries(t.effects ?? {})) {
			let t = e.effects.get(n);
			if (!t) throw Error(`状态差别指向的效果在重建结果里不存在：${n}`);
			await t.update(r);
		}
		for (let n of t.effectAdded ?? []) e.effects.get(n._id) || await e.createEmbeddedDocuments("ActiveEffect", [n], { keepId: !0 });
		for (let n of t.effectRemoved ?? []) await e.deleteEmbeddedDocuments("ActiveEffect", [n]);
	}
}
// src/rules/kernel/frame/commands-monsters.ts
var pt = globalThis;
function mt(e) {
	return Object.fromEntries(Object.entries(e.abilities ?? {}).map(([e, t]) => [e, {
		value: t.value ?? null,
		mod: t.mod ?? null,
		save: t.save?.value ?? t.save ?? null,
		proficient: t.proficient ?? null
	}]));
}
function ht(e) {
	return Object.fromEntries(Object.entries(e.skills ?? {}).map(([e, t]) => [e, {
		total: t.total ?? null,
		passive: t.passive ?? null,
		proficient: t.proficient ?? null
	}]));
}
function gt(e) {
	return e ? Array.isArray(e) ? e : typeof e[Symbol.iterator] == "function" ? [...e] : Object.values(e) : [];
}
function _t(e) {
	return {
		id: e.id ?? e._id ?? null,
		name: e.name,
		type: e.type,
		activities: gt(e.system?.activities).map((e) => ({
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
function vt(e) {
	let t = e.toObject ? e.toObject() : e, n = e.system ?? t.system ?? {}, r = e.items?.contents ?? e.items ?? t.items ?? [];
	return {
		name: e.name ?? t.name,
		type: e.type ?? t.type,
		ac: n.attributes?.ac?.value ?? null,
		hp: n.attributes?.hp ? {
			value: n.attributes.hp.value ?? null,
			max: n.attributes.hp.max ?? null
		} : null,
		abilities: mt(n),
		skills: ht(n),
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
		items: [...r].map(_t),
		validation: e.validationFailures ?? []
	};
}
async function yt(e) {
	let t = await L("monster", e);
	return {
		status: "complete",
		entity: {
			name: e.name,
			source: e.source
		},
		...vt(t)
	};
}
function bt(e) {
	return {
		importMonster: (t) => e([], async () => yt(t)),
		importMonsters: (t) => e([], async () => {
			let e = [];
			for (let n of t) try {
				e.push(await yt(n));
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
			e = t.data ? structuredClone(t.data) : await L("monster", t.entry), delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = pt.CONFIG.Actor.documentClass, r = t.id ? await n.create({
				...e,
				_id: t.id,
				name: t.name
			}, { keepId: !0 }) : await n.create({
				...e,
				name: t.name
			}), i = r.toObject();
			return await ft(r, t.state), {
				status: "complete",
				id: r.id,
				...vt(r),
				data: r.toObject(),
				base: i
			};
		}),
		importMonsterData: (t) => e([], async () => ({
			status: "complete",
			data: await L("monster", t)
		})),
		createActorFromData: (t) => e([], async () => {
			let e = structuredClone(t);
			delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await pt.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...vt(n)
			};
		}),
		importMonsterActor: (t) => e([], async () => {
			let e = await L("monster", t);
			delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await pt.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...vt(n)
			};
		})
	};
}
// src/rules/kernel/frame/system-text.ts
var xt = globalThis, St = null, Ct = /* @__PURE__ */ new Map(), wt = (e) => e.trim().toLowerCase();
function Tt() {
	let e = xt.game.i18n;
	if (St === e) return;
	St = e, Ct.clear();
	let t = (e, n = []) => {
		for (let [r, i] of Object.entries(e ?? {})) {
			let e = [...n, r];
			if (typeof i == "string") {
				let t = wt(i);
				Ct.set(t, [...Ct.get(t) ?? [], e.join(".")]);
			} else i && typeof i == "object" && t(i, e);
		}
	};
	t(e.translations), t(e._fallback);
}
function R(e, n) {
	Tt();
	let r = xt.game.i18n, a = (n ? [n] : [...new Set(Ct.get(wt(e)) ?? [])]).filter((e) => r.has(e)), o = new Set(a.map((e) => r.localize(e)));
	if (a.length && o.size === 1) return {
		$t: "system",
		key: a[0],
		text: e
	};
	let s = e.split("、");
	return s.length > 1 ? t(s.map((e) => R(e)), "、") : i(e, null);
}
function Et(e) {
	return {
		$t: "system",
		key: `TRPGAssistant.UpstreamText.${m(wt(e)).slice(0, 24)}`,
		text: e
	};
}
// src/rules/kernel/frame/trait-title.ts
var z = globalThis, Dt = (e) => e ? z.game.i18n.localize(e) : null, Ot = (e) => {
	let t = [...new Set(e.filter((e) => !!e))];
	return t.length ? t.join("、") : null;
};
function kt(e) {
	let t = z.CONFIG?.DND5E?.[e] ?? {}, n = (e) => Dt(typeof e == "string" ? e : e?.label) ?? "";
	return Object.fromEntries(Object.entries(t).map(([e, t]) => [e, n(t) || e]));
}
function At(e) {
	return Dt(e ? z.CONFIG?.DND5E?.traits?.[e]?.labels?.title : void 0);
}
function jt(e) {
	return e && e !== "default" ? Dt(z.CONFIG?.DND5E?.traitModes?.[e]?.label) : null;
}
function Mt(e) {
	let t = z.dnd5e?.documents?.Trait;
	if (!e?.length || !t) return null;
	let n = e.join(".");
	return Object.keys(z.CONFIG?.DND5E?.traits ?? {}).find((e) => t.actorKeyPath(e) === n) ?? null;
}
function Nt(e) {
	let t = Mt(e);
	if (t) return At(t);
	let n = e?.at(-1), r = Mt(e?.slice(0, -1));
	return r && n && z.CONFIG.DND5E.traits[r][n] === !0 ? jt(n) : null;
}
function Pt(e) {
	return Ot([...new Set([...e].map((e) => String(e).split(":")[0]).filter(Boolean))].map(At));
}
function Ft(e, t = [], n = []) {
	let r = e._subComps?.[0]?._getAllPossibleProps?.() ?? [];
	return Nt(e._propPathActorExistingProficiencies) || jt(e._prop) || Ot(r.map((n) => Nt(t.find((t) => t !== e && t._prop === n)?._propPathActorExistingProficiencies))) || Pt(n);
}
function It(e) {
	let t = e.configuration ?? {};
	return jt(t.mode) || (t.type ? At(t.type) : Pt([...t.grants ?? [], ...[...t.choices ?? []].flatMap((e) => [...e?.pool ?? []])]));
}
// src/rules/kernel/frame/asi.ts
var Lt = globalThis;
function Rt(e) {
	let t = e.configuration ?? {}, n = Number(t.points) || 0;
	return {
		points: n,
		cap: Number(t.cap) || n,
		fixed: Object.fromEntries(Object.entries(t.fixed ?? {}).filter(([, e]) => e)),
		locked: /* @__PURE__ */ new Set([...t.locked ?? []])
	};
}
function zt(e, t) {
	let n = Rt(e), r = {}, i = 0;
	for (let [e, a] of Object.entries(t ?? {})) if (a) {
		if (!Number.isInteger(a) || a < 0 || a > n.cap || n.locked.has(e) || !(e in (Lt.CONFIG?.DND5E?.abilities ?? {}))) return null;
		r[e] = a, i += a;
	}
	return i <= n.points ? r : null;
}
function Bt(e, t) {
	let n = Rt(e);
	if (!n.points) return null;
	let r = zt(e, t?.chosen) ?? {}, i = n.points - Object.values(r).reduce((e, t) => e + t, 0), a = kt("abilities");
	return {
		kind: "asi",
		points: n.points,
		cap: n.cap,
		left: i,
		rows: Object.keys(a).map((e) => {
			let t = r[e] ?? 0;
			return {
				key: e,
				label: R(a[e]),
				fixed: n.fixed[e] ?? 0,
				chosen: t,
				canAdd: !n.locked.has(e) && i > 0 && t < n.cap,
				canRemove: t > 0
			};
		})
	};
}
function Vt(e, t) {
	if (t.assignments && !t.chosen) return {
		type: "asi",
		assignments: t.assignments
	};
	let n = zt(e, t.chosen);
	if (!n) return null;
	let r = { ...Rt(e).fixed };
	for (let [e, t] of Object.entries(n)) r[e] = (r[e] ?? 0) + t;
	return {
		type: "asi",
		assignments: r
	};
}
// src/rules/kernel/frame/actor-types.ts
var Ht = globalThis, Ut = "character";
async function Wt(e, t) {
	let n = Object.keys(Ht.game.system?.documentTypes?.Actor ?? {}), r = (e) => {
		let t = Ht.CONFIG?.Actor?.typeLabels?.[e] ?? `TYPES.Actor.${e}`;
		return Ht.game.i18n?.localize?.(t) ?? e;
	}, i = await We([e]), a = /* @__PURE__ */ new Set();
	if (i.some((e) => e.folderType === "Actor")) for (let n of t) {
		let t = await L(e, n);
		typeof t?.type == "string" && a.add(t.type);
	}
	return {
		declared: n.map((e) => ({
			type: e,
			label: r(e)
		})),
		fromStore: [...a],
		build: Ut
	};
}
// src/rules/kernel/frame/commands-restore.ts
async function Gt(e, t, n = []) {
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
// src/rules/kernel/frame/commands-choice.ts
var Kt = globalThis;
async function qt(e) {
	let t = e.advancement, n = t.constructor?.typeName ?? t.type;
	if (n === "Trait") {
		let n = await t.automaticApplicationValue?.(e.level);
		if (n !== !1) return n;
		let { available: r } = await t.unfulfilledChoices();
		return { chosen: r.filter((e) => e.type === "grant").flatMap((e) => [...e.choices.asSet()]) };
	}
	if (n === "AbilityScoreImprovement") {
		let e = Object.entries(t.configuration?.fixed ?? {}).filter(([, e]) => e);
		return {
			type: "asi",
			assignments: Object.fromEntries(e)
		};
	}
	if (n === "ItemChoice") return { selected: [] };
}
async function Jt(e) {
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
		let e = Kt.game.packs.get("dnd5e.subclasses");
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
		for (let n of Object.keys(e.actor?.system?.abilities ?? t.actor?.system?.abilities ?? Kt.CONFIG?.DND5E?.abilities ?? {})) {
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
// src/rules/kernel/frame/commands-equipment.ts
var B = globalThis, Yt = (e) => B.DataUtil.proxy.getUid("item", e), Xt = (e, t, n) => a(e, {
	propDroppable: "item",
	source: t,
	hash: n
}), Zt = (e) => {
	let [t, n] = e.split("|");
	return B.UrlUtil.URL_TO_HASH_BUILDER[B.UrlUtil.PG_ITEMS]({
		name: t,
		source: n
	});
}, Qt = (e) => {
	let t = B.UrlUtil.URL_TO_HASH_BUILDER[B.UrlUtil.PG_ITEMS](e);
	return {
		uid: Yt(e),
		name: Xt(e.name, e.source, t),
		source: e.source,
		hash: t
	};
}, $t = (e) => B.Renderer.stripTags(e).toTitleCase(), en = [
	"pCacheAndGetAllSite",
	"pCacheAndGetAllPrerelease",
	"pCacheAndGetAllBrew"
], tn = null, nn = async () => tn ??= (await Promise.all(en.map(async (e) => await B.DataLoader[e]("item") ?? []))).flat(), rn = (e) => {
	let t = I?.EQUIPMENT_TYPE_EXPANDERS;
	return t && Object.hasOwn(t, e) ? t[e] : null;
};
function an(e) {
	let t = `TRPGAssistant.EquipmentType.${e}`, n = B.game.i18n.localize(t);
	return n === t ? i(String(rn(e)?.name ?? e), null) : R(n);
}
async function on(e) {
	let t = rn(e);
	if (!t) return [];
	let n = (await nn()).filter((e) => I.UtilEntityItem.isStartingEquipmentItem(e));
	return t._getAvailableItems({ itemDatas: n }).sort((e, t) => String(e.name).localeCompare(String(t.name))).map(Qt);
}
var sn = (e) => {
	let t = e?.startingEquipment;
	return Array.isArray(t) ? t : Array.isArray(t?.defaultData) ? t.defaultData : [];
};
function cn(e) {
	let t = e?.startingEquipment?.goldAlternative;
	if (!t) return null;
	let n = /{@dice ([^|]+)/.exec(t);
	return n ? n[1].replace(/×/g, "*") : Number.isNaN(Number(`${t}`.trim())) ? null : `${t}`.trim();
}
async function ln(t) {
	let n = async (e) => {
		let [t, n] = e.split("|"), r = await B.DataLoader.pCacheAndGetHash(B.UrlUtil.PG_ITEMS, Zt(e));
		return {
			uid: e,
			name: Xt(r?.name ?? t, r?.source ?? n, Zt(e)),
			source: r?.source ?? n,
			hash: Zt(e),
			found: !!r
		};
	};
	if (typeof t == "string") return {
		raw: t,
		kind: "item",
		quantity: 1,
		...await n(t)
	};
	if (t.item) return {
		raw: t,
		kind: "item",
		quantity: t.quantity || 1,
		...await n(t.item),
		...t.displayName ? { displayName: e($t(t.displayName)) } : {},
		...t.containsValue ? { cp: t.containsValue } : {}
	};
	let r = t.equipmentTypes ?? (t.equipmentType ? [t.equipmentType] : []);
	if (r.length) {
		if (!r.every(rn)) return { unsupported: r.filter((e) => !rn(e)).join("、") };
		let e = /* @__PURE__ */ new Set(), n = (await Promise.all(r.map(on))).flat().filter((t) => !e.has(t.uid) && !!e.add(t.uid));
		return n.length ? {
			raw: t,
			kind: "category",
			quantity: t.quantity || 1,
			types: r,
			typeNames: r.map(an),
			candidates: n
		} : null;
	}
	return t.special ? {
		raw: t,
		kind: "special",
		quantity: t.quantity || 1,
		text: e($t(t.special)),
		...t.containsValue ? { cp: t.containsValue } : {}
	} : t.value ? {
		raw: t,
		kind: "value",
		quantity: 1,
		cp: t.value
	} : { unsupported: JSON.stringify(t).slice(0, 120) };
}
async function un(t) {
	let n = [], r = [], i = sn(t.entry);
	for (let a = 0; a < i.length; a++) {
		let o = [];
		for (let [n, s] of Object.entries(i[a])) {
			let i = await Promise.all(s.map(ln));
			for (let n of i) n && "unsupported" in n && r.push(d("{0}：{1}", e(String(t.entry.name)), l(n.unsupported)));
			let a = i.flatMap((e, t) => e && !("unsupported" in e) ? [{
				...e,
				index: t
			}] : []);
			a.length && o.push({
				key: n,
				entries: a
			});
		}
		o.length && n.push({
			index: a,
			choices: o
		});
	}
	let a = cn(t.entry);
	return {
		refKey: t.refKey,
		prop: t.prop,
		name: e(String(t.entry.name)),
		source: t.entry.source,
		groups: n,
		unsupported: r,
		goldExpression: a,
		goldCoin: a ? "gp" : null
	};
}
function dn(e, t, n = /* @__PURE__ */ new Set()) {
	let r = [], i = 0;
	if (t?.gold != null) return {
		granted: r,
		cp: Math.round(t.gold * 100)
	};
	let a = (t, i, a, o) => {
		if (t && n.has(t)) return;
		let s = r.find((e) => e.uid === t && e.special === i && e.displayName === o);
		s ? s.quantity += a : r.push({
			...t ? { uid: t } : {},
			...i ? {
				special: i,
				source: e.entry.source,
				page: e.entry.page
			} : {},
			quantity: a,
			...o ? { displayName: o } : {}
		});
	};
	return sn(e.entry).forEach((e, r) => {
		let o = Object.keys(e), s = t?.choice?.[String(r)] ?? (o.length === 1 ? o[0] : void 0);
		s !== void 0 && Array.isArray(e[s]) && e[s].forEach((e, o) => {
			if (typeof e == "string") return a(e, void 0, 1);
			if (e.item) return e.containsValue && !n.has(e.item) && (i += e.containsValue), a(e.item, void 0, e.quantity || 1, e.displayName ? $t(e.displayName) : void 0);
			if (e.equipmentType || e.equipmentTypes) for (let n = 0; n < (e.quantity || 1); n++) {
				let e = t?.pick?.[`${r}.${s}.${o}.${n}`];
				e && a(e, void 0, 1);
			}
			else {
				if (e.special) return e.containsValue && (i += e.containsValue), a(void 0, $t(e.special), e.quantity || 1);
				e.value && (i += e.value);
			}
		});
	}), {
		granted: r,
		cp: i
	};
}
function fn(e) {
	let t = B.CONFIG.DND5E.currencies, n = t.cp?.conversion ?? 100, r = Object.entries(t).filter(([, e]) => e.conversion != null && e.conversion > 0).map(([e, t]) => ({
		coin: e,
		mult: t.conversion / n
	})).sort((e, t) => t.mult - e.mult), i = B.CurrencyUtil.doSimplifyCoins({ cp: e }, { currencyConversionTable: r });
	return Object.fromEntries(Object.keys(t).map((e) => [e, i[e] || 0]));
}
async function pn(e, t, n = {}) {
	let r = [], i = [], a = [], o = 0;
	for (let s of e) {
		let { granted: e, cp: c } = dn(s, t[s.refKey], new Set(n[s.refKey] ?? []));
		o += c;
		for (let t of e) {
			let e;
			if (t.special) e = {
				name: t.special,
				source: t.source,
				page: t.page,
				type: B.Parser.ITM_TYP__OTHER,
				rarity: "unknown"
			};
			else if (e = await B.DataLoader.pCacheAndGetHash(B.UrlUtil.PG_ITEMS, Zt(t.uid)), !e) {
				a.push(t.uid);
				continue;
			}
			let n = await L("item", e);
			n.system = {
				...n.system,
				quantity: t.quantity
			}, t.displayName && (n.name = t.displayName), t.special ? (delete n.flags?.plutonium, i.push(n)) : r.push({ data: n });
		}
	}
	return {
		equipment: r,
		specials: i,
		currency: o > 0 ? fn(o) : null,
		skipped: a
	};
}
async function mn(t, n, r = {}) {
	let i = [], a = 0;
	for (let o of t) {
		let { granted: t, cp: s } = dn(o, n[o.refKey], new Set(r[o.refKey] ?? []));
		a += s;
		let c = [];
		for (let n of t) {
			if (n.special) {
				c.push({
					name: e(n.special),
					special: !0,
					quantity: n.quantity
				});
				continue;
			}
			let t = await B.DataLoader.pCacheAndGetHash(B.UrlUtil.PG_ITEMS, Zt(n.uid)), r = t ? B.UrlUtil.URL_TO_HASH_BUILDER[B.UrlUtil.PG_ITEMS](t) : void 0;
			c.push(t ? {
				uid: n.uid,
				name: Xt(t.name, t.source, r),
				source: t.source,
				hash: r,
				quantity: n.quantity,
				...n.displayName ? { displayName: e(n.displayName) } : {}
			} : {
				uid: n.uid,
				name: l(n.uid),
				quantity: n.quantity
			});
		}
		i.push({
			refKey: o.refKey,
			granted: c,
			cp: s
		});
	}
	return {
		sections: i,
		currency: a > 0 ? fn(a) : null
	};
}
function hn(e) {
	return {
		startingEquipment: (t) => e([], async () => ({
			sections: await Promise.all(t.map(un)),
			coins: [...B.Parser?.COIN_ABVS ?? []]
		})),
		startingPreview: (t, n, r) => e([], async () => mn(t, n, r))
	};
}
// src/rules/kernel/frame/author-ids.ts
var gn = globalThis, _n = /* @__PURE__ */ new Set([
	"skills",
	"tool",
	"saves"
]);
function vn(e, t) {
	let n = document.createElement("div");
	n.innerHTML = e;
	let r = [...n.querySelectorAll("[data-vet-page][data-vet-hash]")];
	if (r.length !== 1) return null;
	let i = r[0].getAttribute("data-vet-page") ?? "", a = r[0].getAttribute("data-vet-hash") ?? "", o = r[0].getAttribute("data-vet-source") ?? "", s = t[i]?.[0];
	return i && a && s ? {
		page: i,
		source: o,
		hash: a,
		propDroppable: s
	} : null;
}
async function yn(e) {
	let t = I, n = gn.dnd5e?.documents?.Trait;
	if (!t || !n) return {};
	let r = t.Charactermancer_OtherProficiencySelect, i = await t.Charactermancer_AvailableProficiencyManager.pGetInstance(), a = new gn.CONFIG.Actor.documentClass({
		name: "Author ids",
		type: Ut
	}), o = {};
	for (let t of new Set(e)) try {
		let e = t.split(":")[0], s = n.changeKeyPath(t);
		if (!s) continue;
		let c = t.split(":").pop(), l = a.clone(gn.foundry.utils.expandObject({ [s]: _n.has(e) ? 1 : [c] })), u = r.getExisting(r.getExistingFvttFromActor(l), { availableProficiencyManager: i }), d = Object.entries(u ?? {}).flatMap(([e, t]) => Object.entries(t ?? {}).filter(([e, t]) => e !== "other" && t).map(([t]) => ({
			prop: e,
			name: t
		}))).flatMap((e) => {
			let t = r._getRenderedStatic({
				...e,
				availableProficiencyManager: i
			}), n = typeof t == "string" ? vn(t, gn.UrlUtil.PAGE_TO_PROPS ?? {}) : null;
			return n ? [n] : [];
		});
		d.length && (o[t] = d);
	} catch (e) {
		console.warn("[trpg-assistant] 作者编号换不出", t, e);
	}
	return o;
}
// src/rules/kernel/frame/proficiency-text.ts
var bn = globalThis;
function xn(e, t, r) {
	if (bn.Renderer.generic.getMappedAnyProficiency({
		keyAny: r.name,
		countRaw: 1
	})) return n(r.name, 1);
	let i = e.Charactermancer_OtherProficiencySelect._getRenderedStatic({
		...r,
		availableProficiencyManager: t
	}), o = typeof i == "string" ? vn(i, bn.UrlUtil.PAGE_TO_PROPS) : null;
	return o ? a(r.name, o, !0) : c(r.name, [r.name], R(r.name));
}
function Sn(e, t, n) {
	let r = n.map((n) => xn(e, t, n));
	return r.map((e, t) => e.$t === "value" ? {
		...e,
		group: n.filter((e, i) => e.prop === n[t].prop && r[i].$t === "value").map((e) => e.name)
	} : e);
}
// src/rules/kernel/frame/trait-plans.ts
var Cn = globalThis;
function wn(e, t, n, r, i) {
	let a = e._state[t];
	return {
		label: r,
		...i ? { text: i } : {},
		select: () => {
			e._state[t] = n;
		},
		clear: () => {
			e._state[t] = a;
		}
	};
}
var Tn = (e) => ({
	propDroppable: "item",
	source: e.source,
	hash: Cn.UrlUtil.URL_TO_HASH_BUILDER[Cn.UrlUtil.PG_ITEMS](e)
});
function En(e, t, n, r, i) {
	return (n.choose ?? []).map((n, o) => {
		if (n.fromFilter) {
			let { propState: e } = t._getPropsChooseFromFilter({
				ixChoose: o,
				ixCount: 0
			}), r = t._modalFilterItemsFvtt.getEntitiesMatchingFilterExpression({ filterExpression: n.fromFilter });
			return {
				count: n.count,
				options: r.filter((e) => !i || i.has(`${e.name}|${e.source}`.toLowerCase())).map((r) => wn(t, e, {
					prop: n.prop,
					name: Cn.DataUtil.generic.getUid(r)
				}, r.name, a(r.name, Tn(r), !0)))
			};
		}
		let { propState: s } = t._getPropsChooseFrom({ ixChoose: o }), c = t._getChooseFromGroupMeta(n), l = e.ComponentUiUtil.getMetaWrpMultipleChoice(t, s, {
			count: n.count,
			...c?.valueGroups ? { valueGroups: c.valueGroups } : { values: n.from },
			fnDisplay: () => ""
		});
		r.push(l.cleanup);
		let u = c?.valueGroupsFlat ?? n.from, d = Sn(e, t._availableProficiencyManager, u);
		return {
			count: n.count,
			hints: c?.valueGroups?.map((e) => e.text).filter(Boolean),
			options: l.rowMetas.map((e, n) => wn(t, e.propIsActive, !0, u[n]?.name ?? String(n + 1), d[n]))
		};
	});
}
function Dn(e, t, n, r) {
	t._stgGroup = e.veE(document.createElement("div"));
	let i = [];
	return t._render_renderPtChooseAnyProficient = ({ profSet: e, propProfSet: n, propIxProps: r, fnGetValues: a }) => {
		let o = t._getProps(n, 0)[r], s = a().map((e) => wn(t, o, e, e));
		i.push({
			count: Number(e[n] || 1),
			options: s
		});
	}, t._hk_ixSet_renderPts(n), r.push(() => t._lastMeta.cleanup()), i;
}
function On(e, t) {
	t.render(e.veE(document.createElement("div")));
	let n = t._lastChoiceMeta.children.filter((e) => e.children);
	if (n.some((e) => !e.children.every((e) => e.isChoosable))) return null;
	let r = () => {
		t._state.readonly_selectedValues = t._getOutputObject();
	};
	return r(), n.map((e) => ({
		count: e.count,
		options: e.children.map((e) => ({
			label: String(e.name ?? ""),
			select: () => {
				e.setActive(!0), r();
			},
			clear: () => {
				e.setActive(!1), r();
			}
		}))
	}));
}
async function kn(e, t, n, r) {
	let i = {}, a = await n._subComps[0].pGetFormData();
	await e.Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(t, i, { data: { [n._propFormDatas]: [a] } });
	let o = Cn.dnd5e.documents.Trait, s = Object.keys(Cn.CONFIG.DND5E.traits).filter((e) => Cn.foundry.utils.hasProperty(i, o.actorKeyPath(e))), c = t.clone(i), l = /* @__PURE__ */ new Set(), u = [];
	for (let e of s) {
		let n = o.actorKeyPath(e), a = Cn.foundry.utils.getProperty(i, n)?.custom;
		a && u.push({
			label: String(a),
			text: R(String(a))
		});
		let s = await o.actorValues(t, e), d = await o.actorValues(c, e);
		for (let [e, t] of Object.entries(d)) t === r && s[e] !== r && l.add(e);
	}
	return {
		keys: l,
		notes: u
	};
}
async function An(e, t, n, r, i, o, s) {
	let l = s ? 2 : 1, u = await kn(e, t, n, l), d = [], f = [...u.notes], p = /* @__PURE__ */ new Map();
	for (let i of r) {
		let r = /* @__PURE__ */ new Set();
		for (let o of i.options) {
			let s = o.text ?? c(o.label, i.options.map((e) => e.label), R(o.label));
			o.select();
			try {
				let i = [...(await kn(e, t, n, l)).keys].filter((e) => !u.keys.has(e));
				if (i.length === 1) {
					let e = i[0];
					r.add(e);
					let t = p.get(e);
					p.set(e, t?.$t === "name" && s.$t === "name" ? a(o.label, [...t.ids, ...s.ids], !0) : s);
				} else o.label && f.push({
					label: o.label,
					text: s
				});
			} finally {
				o.clear();
			}
		}
		r.size >= i.count || s && !i.options.length ? d.push({
			count: i.count,
			pool: [...r].sort()
		}) : i.options.length && f.push(...i.options.filter((e) => e.label).map((e) => ({
			label: e.label,
			text: e.text ?? c(e.label, i.options.map((e) => e.label), R(e.label))
		})));
	}
	return {
		index: i,
		extended: o,
		mode: s ? u.keys.size ? "forcedExpertise" : "expertise" : "default",
		grants: [...u.keys].sort(),
		choices: d,
		names: p,
		hints: [...new Set(r.flatMap((e) => e.hints ?? []))],
		withheld: f
	};
}
async function jn(e, t, n, r, i) {
	let a = n._subComps[0];
	if (a instanceof e.Charactermancer_ImmResVulnSelect) {
		let r = On(e, a);
		return r ? [await An(e, t, n, r, 0, !1, !1)] : [];
	}
	let o = a instanceof e.Charactermancer_ExpertiseSelect;
	if (!o && !(a instanceof e.Charactermancer_OtherProficiencySelect)) return [];
	let s = o && r ? r : t;
	o && (a._existingFvtt = a.constructor.getExistingFvttFromActor(s));
	let c = [], l = a._available, u = o || l.length > 1 || l.some((e) => e.all?.length || e.choose?.some?.((e) => e.fromFilter));
	for (let [t, r] of l.entries()) {
		a._state.ixSet = t, !o && (r.all?.length || r.choose?.some((e) => e.fromFilter)) && await a.pNotRender();
		let l = [];
		try {
			let d = o ? Dn(e, a, r, l) : En(e, a, r, l, i);
			c.push(await An(e, s, n, d, t, u, o));
		} finally {
			for (let e of l) e();
		}
	}
	return c;
}
// src/rules/kernel/frame/author-text.ts
var Mn = globalThis, Nn = ["Renderer"], Pn = 8, Fn = null;
function In() {
	let e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new WeakSet(), n = (r, i) => {
		if (typeof r == "string") {
			let t = e.get(r) ?? [];
			t.push(i), e.set(r, t);
		} else if (!(!r || typeof r != "object" && typeof r != "function" || t.has(r) || i.length > Pn)) {
			t.add(r);
			for (let [e, t] of Object.entries(Object.getOwnPropertyDescriptors(r))) "value" in t && e !== "prototype" && n(t.value, [...i, e]);
		}
	};
	for (let e of Nn) n(Mn[e], [e]);
	return e;
}
function Ln(e) {
	if (!e) return null;
	Fn ??= In();
	let t = Fn.get(e);
	return t?.length === 1 ? t[0] : null;
}
// src/rules/kernel/frame/build-traits.ts
var Rn = globalThis, zn = "P6Tr", Bn = (e) => typeof e == "string" && /^P6Tr[0-9a-f]{12}$/.test(e), Vn = (...e) => zn + p(e).slice(0, 12);
function Hn(e, t) {
	return D(`build-traits:check:${e?._id}`, () => Un(e, t));
}
async function Un(e, t) {
	let { available: n } = await e.unfulfilledChoices(), r = new Set(n.filter((e) => e.type === "grant").flatMap((e) => [...e.choices.asSet()])), i = /* @__PURE__ */ new Set([...r, ...e.configuration.grants ?? []]), a = n.filter((e) => e.type === "choice").map((e) => e.choices.asSet()), o = t?.chosen ?? [];
	if (!Array.isArray(o)) return null;
	let s = /* @__PURE__ */ new Map(), c = (e, t) => a.some((n, r) => {
		if (!n.has(e) || t.has(r)) return !1;
		t.add(r);
		let i = s.get(r);
		return i && !c(i, t) ? !1 : (s.set(r, e), !0);
	}), l = o.filter((e) => !i.has(e));
	return l.length !== new Set(l).size || !l.every((e) => c(e, /* @__PURE__ */ new Set())) ? null : { chosen: [...r, ...l.sort()] };
}
var Wn = (e) => e.type === "Trait" && !e.configuration?.grants?.length && !e.configuration?.grants?.size && !e.configuration?.choices?.length;
async function Gn(e, t, n) {
	let r = Rn.dnd5e.documents.Trait, i = Object.values(e.system?.advancement ?? {}).filter((e) => e.type === "Trait" && !Wn(e) && (e.level ?? 0) === t && (!e.classRestriction || e.classRestriction === (n ? "secondary" : "primary")));
	return Promise.all(i.map(async (e) => ({
		id: e._id,
		mode: e.configuration?.mode ?? "default",
		grants: [...e.configuration?.grants ?? []],
		slots: await Promise.all((e.configuration?.choices ?? []).map(async (e) => {
			let t = [...e.pool ?? []], n = t.some((e) => e.includes("*")) ? await r.mixedChoices(new Set(t)) : null;
			return {
				count: e.count ?? 1,
				pool: new Set(n?.asSet?.() ?? t)
			};
		}))
	})));
}
function Kn(e, t) {
	let n = [...t], r = [];
	for (let i of e) {
		let e = n.findIndex((e) => e.count === i.count && e.pool.size === i.pool.length && i.pool.every((t) => e.pool.has(t)));
		if (e >= 0) n.splice(e, 1);
		else {
			if (t.some((e) => i.pool.some((t) => e.pool.has(t)))) return null;
			r.push(i);
		}
	}
	return r;
}
async function qn(e, t, n, r, i) {
	let a = e.clone(), o = new Rn.CONFIG.Item.documentClass({
		...t,
		system: {
			...t.system,
			advancement: n
		}
	}, { parent: a });
	for (let e of o.advancement.byType.Trait ?? []) {
		if (e.configuration.mode !== "default" || e.level !== i) continue;
		let t = r.previous?.find((t) => t.id === e.id)?.data, n = r.picks?.find((t) => t.id === e.id)?.value, a = await Un(e, t ?? n);
		a?.chosen.length && await e.apply(i, a);
	}
	return a;
}
var Jn = (e) => i(e, Ln(e)), Yn = (e, t, n = []) => {
	let r = Ft(e, t, n);
	return r ? R(r) : Jn(String(e._title || e._subComps[0]?.modalTitle || e._prop));
}, Xn = (e) => [...new Map(e.map((e) => [JSON.stringify(e), e])).values()];
function Zn(e, t, n, r, i = {}) {
	return D(`build-traits:fill:${n}:${r}`, () => Qn(e, t, n, r, i));
}
async function Qn(e, n, r, i, a) {
	let { replay: o, picks: s, plans: c, actor: l, scope: u, expertise: f } = a;
	if (!n.entry) return [];
	let m = I;
	if (!m) return [d("当前 Plutonium 版本缺少已验证的建卡接线")];
	let h = +(n.prop === "class"), g = n.prop === "class" ? m.Charactermancer_Class_Util.getStandardProficiencies(i ? n.entry.multiclassing?.proficienciesGained ?? {} : {
		proficiency: n.entry.proficiency,
		...n.entry.startingProficiencies
	}) : structuredClone(n.entry), _ = new Rn.CONFIG.Actor.documentClass({
		name: "Trait preview",
		type: Ut
	}), v = [{ entity: g }], y = await m.Charactermancer_AvailableProficiencyManager.pGetInstance(), b = new m.Charactermancer_FeatureOptionsSelect({
		actor: _,
		optionsSet: v,
		level: h,
		modalFilterSpells: {},
		availableProficiencyManager: y
	}), x = b._subCompManagers.filter((e) => e instanceof m.CharactermancerFeatureSubCompManagerProficiencyOtherBase), ee = await Gn(e, h, i), te = Ne(n.data ?? e), S = /* @__PURE__ */ new Set(), C = [], w = {};
	try {
		for (let y of x) try {
			if (await y._pInitSubComp({
				ix: 0,
				selectedLinkedEntityInfos: v
			}), !y._subComps[0]) continue;
			let b = l && y._subComps[0] instanceof m.Charactermancer_ExpertiseSelect, T = b ? await qn(l, e, {
				...Object.fromEntries(Object.entries(e.system?.advancement ?? {}).filter(([e]) => !S.has(e))),
				...w
			}, a, h) : l, E = await jn(m, _, y, T, u);
			if (!E.length) {
				C.push(Yn(y, x));
				continue;
			}
			let D = E.map(({ index: e }) => Vn(r, y._prop, h, i, "author-plan", e)), ne = o ?? s?.map((e) => e.id), O = D.findIndex((e) => ne?.includes(e)), k = O < 0 ? 0 : O, A = E[k];
			if (A.extended && o && O < 0) continue;
			let re = E.map((e, n) => ({
				id: D[n],
				label: e.choices.length ? t(e.choices.map((e) => d(`{0} ×${e.count}`, Pt(e.pool) ? R(Pt(e.pool)) : Yn(y, x))), " + ") : Pt(e.grants) ? R(Pt(e.grants)) : Yn(y, x)
			})), j = [...new Map(A.withheld.map((e) => [e.label, e])).values()].sort((e, t) => e.label.localeCompare(t.label));
			j.length && C.push(d("{0}（暂时无法加到人物卡：{1}）", Yn(y, x), t(j.map((e) => e.text ?? Jn(e.label)), "、")));
			let ie = p(g[y._prop] || g.entryData?.[y._prop]), ae = ee.filter((e) => e.mode === A.mode), M = ae.filter(({ id: e }) => te[e]?.field === y._prop && te[e]?.input === ie), oe = new Set(M.flatMap((e) => e.grants)), N = M.flatMap((e) => e.slots), se = oe.size === A.grants.length && A.grants.every((e) => oe.has(e)) && N.length === A.choices.length && Kn(A.choices, N)?.length === 0, ce = Vn(r, y._prop, h, i, "origin"), P = N.length > 0 && !se && !A.withheld.length && (!o || o.includes(A.extended ? D[k] : ce)), le = P ? ae.filter((e) => !M.includes(e)) : ae, ue = new Set(le.flatMap((e) => e.grants)), de = le.flatMap((e) => e.slots), fe = A.grants.filter((e) => !ue.has(e)), pe = P ? A.choices : Kn(A.choices, de);
			if (P && A.choices.some((e) => de.some((t) => e.pool.some((e) => t.pool.has(e))))) {
				C.push(d("{0}（与资料附带的进阶重叠，已保留原进阶）", Yn(y, x)));
				continue;
			}
			if (!pe) {
				C.push(Yn(y, x));
				continue;
			}
			if (!fe.length && !pe.length) {
				for (let e of M) c?.set(e.id, {
					choices: [],
					names: A.names
				});
				continue;
			}
			if (P) for (let e of M) S.add(e.id);
			let F = A.extended ? D[k] : P ? ce : Vn(r, y._prop, h, i);
			if (c?.set(F, {
				choices: re.length > 1 ? re : [],
				names: A.names
			}), w[F] = {
				_id: F,
				type: "Trait",
				level: h,
				...n.prop === "class" ? { classRestriction: i ? "secondary" : "primary" } : {},
				...P && A.hints.length ? { hint: A.hints.join("\n") } : {},
				configuration: {
					mode: A.mode,
					grants: fe,
					choices: pe,
					allowReplacements: !1
				},
				value: {}
			}, b && f) {
				let t = new Rn.CONFIG.Item.documentClass({
					...e,
					system: {
						...e.system,
						advancement: { [F]: w[F] }
					}
				}, { parent: T });
				f.set(F, t.advancement.byId[F]);
			}
		} catch (e) {
			console.warn("[trpg-assistant] 建卡进阶暂无法处理", r, y._prop, e), C.push(Yn(y, x));
		}
	} finally {
		b.unregisterSourceTracking();
	}
	if (e.system) {
		let t = Object.fromEntries(Object.entries(e.system.advancement ?? {}).filter(([e, t]) => !S.has(e) && !Wn(t)));
		e.system.advancement = {
			...t,
			...w
		};
	}
	return Xn(C);
}
// src/rules/kernel/frame/commands-level.ts
var V = globalThis;
function $n() {
	let e = V.dnd5e?.applications?.advancement?.AdvancementManager;
	if (!e) throw Error("dnd5e AdvancementManager is not available");
	return e;
}
function er(e, t, n, r = {}) {
	return $n().forLevelChange(e, t, n, r);
}
function H(e) {
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
function tr(e) {
	let t = e?.toObject ? e.toObject() : structuredClone(e);
	for (let e of [
		"_id",
		"_key",
		"folder",
		"sort",
		"ownership",
		"_stats"
	]) delete t[e];
	return Pe(t), t;
}
function nr(e) {
	let t = e?.toObject ? e.toObject() : structuredClone(e);
	return t.flags ??= {}, t.flags.plutonium ??= {}, t.flags.plutonium.isStandardDragDrop = !0, t;
}
function rr(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
function ir(e) {
	return JSON.parse(JSON.stringify(e, (e, t) => t instanceof Set ? [...t] : t));
}
async function ar(e, t, { strict: n = !1, picks: r, blank: i = !1, expertise: a } = {}) {
	if (!e.steps.length) return { finished: !0 };
	for (let o of e.steps) {
		if (o.automatic || !o.flow) continue;
		let e = o.flow.advancement, s = t?.find((t) => t.id === e.id && t.level === o.flow.level), c = r?.find((t) => t.id === e.id && (t.level ?? null) === (o.flow.level ?? null));
		if (Bn(e.id)) {
			if (s?.error || n && !s) return {
				finished: !1,
				step: {
					...or(o),
					error: s?.error
				}
			};
			let t = await Hn(a?.get(e.id) ?? e, s?.data ?? c?.value);
			if (!t) return {
				finished: !1,
				step: {
					...or(o),
					error: "建卡选择已不在当前候选内"
				}
			};
			s ? (o.type = "restore", o.flow.retainedData = t, o.automatic = !0) : o.flow.getAutomaticApplicationValue = async () => t;
			continue;
		}
		if (s) {
			if (s.error) return {
				finished: !1,
				step: {
					...or(o),
					error: s.error
				}
			};
			o.type = "restore", o.flow.retainedData = s.data, o.automatic = !0;
			continue;
		}
		if (await o.flow.getAutomaticApplicationValue() !== !1) continue;
		if (c) {
			let t = c.value?.type === "asi" ? Vt(e, c.value) : c.value;
			if (!t) return {
				finished: !1,
				step: {
					...or(o),
					error: "属性提升的选择不合规"
				}
			};
			o.flow.getAutomaticApplicationValue = async () => t;
			continue;
		}
		if (n) return {
			finished: !1,
			step: or(o)
		};
		let l = (i ? await qt(o.flow) : void 0) ?? await Jt(o.flow);
		l !== void 0 && (o.flow.getAutomaticApplicationValue = async () => l);
	}
	let o = new Promise((t) => {
		let n = V.Hooks.on("dnd5e.advancementManagerComplete", (r) => {
			r === e && (V.Hooks.off(n), t(!0));
		});
		setTimeout(() => {
			V.Hooks.off(n), t(!1);
		}, 3e3);
	});
	await e.render();
	let s = await o;
	return s && await C(), s ? { finished: !0 } : {
		finished: !1,
		step: or(e.step)
	};
}
function or(e) {
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
async function sr(e) {
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
function cr(e) {
	return Object.fromEntries(Object.entries(e.system?.abilities ?? {}).map(([e, t]) => [e, t.value]));
}
async function lr(e, t, n, r = {}, { strict: i = !1, seed: a, id: o, picks: s, blank: c = !1, traitScope: l, onManager: u } = {}) {
	a !== void 0 && j(a);
	let d = await V.CONFIG.Actor.documentClass.create({
		...o ? { _id: o } : {},
		name: e,
		type: Ut,
		system: { details: { level: 1 } }
	}, { keepId: !!o }), f = l ? new Set(l) : void 0, p = cr(d), m = [];
	for (let e of t) {
		let t = tr(e?.data ?? e);
		V.CONFIG.Item.dataModels[t.type]?.resetData?.(t.system);
		let n = e?.refKey ?? rr(t), a = n ? r[n] : void 0, o = n && (!i || a?.some((e) => Bn(e.id))), l = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), g = n ? s?.[n] : void 0, _ = o ? await Zn(t, e, n, d.items.some((e) => e.type === "class"), {
			actor: d,
			plans: l,
			scope: f,
			picks: g,
			previous: a,
			expertise: h,
			replay: i ? a?.map((e) => e.id) : void 0
		}) : [];
		n && _.length && m.push({
			refKey: n,
			titles: _
		});
		let v = [...a ?? [], ...n ? s?.[n] ?? [] : []].find((e) => Bn(e.id) && !(e.id in (t.system?.advancement ?? {})));
		if (v) return {
			pending: !0,
			step: {
				error: "存档中的建卡步骤已变更",
				id: v.id,
				refKey: n
			},
			built: H(d),
			actor: d,
			initial: p,
			missingTraits: m
		};
		let y = $n().forNewItem(d, t, { automaticApplication: !0 });
		await u?.({
			manager: y,
			key: n,
			unsupported: _,
			picks: g,
			traitPlans: l,
			expertise: h
		});
		let b = await ar(y, a, {
			strict: i,
			blank: c,
			picks: g,
			expertise: h
		});
		if (!b.finished) return {
			pending: !0,
			step: b.step,
			built: H(d),
			actor: d,
			initial: p,
			missingTraits: m
		};
		d.items.contents.some((e) => e.type === t.type && e.flags?.plutonium?.hash === t.flags?.plutonium?.hash) || await d.createEmbeddedDocuments("Item", [nr(tr(t))]);
	}
	return n.length && await d.createEmbeddedDocuments("Item", n.map((e) => nr(tr(e?.data ?? e)))), {
		actor: d,
		initial: p,
		missingTraits: m
	};
}
function ur(e, t) {
	return {
		levelUpSteps: (n, r, i = 1) => e([], async () => {
			let e = await sr(er(t(n), r, i));
			return {
				status: e.length ? "pending" : "complete",
				steps: e
			};
		}, [n]),
		levelUpApply: (n, r, i = 1, a) => e([], async () => {
			let e = t(n), o = er(e, r, i, { automaticApplication: !0 }), s = await ar(o, a);
			return s.finished ? H(e) : {
				kernelStatus: "pending",
				reason: o.step ? "awaiting-choice" : "advancement-manager-not-complete",
				step: s.step
			};
		}, [n]),
		captureChoices: (n) => e([], async () => {
			let e = t(n).clone(), r = {};
			for (let t of Xe(e)) {
				let e = t.item.advancement.byId[t.adv.id];
				try {
					let n = await e.reverse(t.level);
					n != null && (r[t.key] ??= []).push({
						id: t.adv.id,
						type: t.type,
						level: t.level,
						data: ir(n)
					});
				} catch (e) {
					(r[t.key] ??= []).push({
						id: t.adv.id,
						type: t.type,
						level: t.level,
						error: e instanceof Error ? e.message : String(e)
					});
				}
			}
			return r;
		}, [n]),
		renameActor: (n, r) => e([], async () => {
			let e = t(n);
			return await e.update({
				name: r,
				"prototypeToken.name": r
			}), H(e);
		}, [n]),
		createActorsFromBase: (t) => e([], async () => {
			let e = V.CONFIG.Actor.documentClass, n = await e.createDocuments(t.map((e) => ({
				...structuredClone(e.base),
				...e.id ? { _id: e.id } : {}
			})), { keepId: !0 }), r = [];
			for (let i = 0; i < n.length; i++) {
				let a = await dt(n[i], t[i].off, t[i].state);
				if (a.problems.length) return await e.deleteDocuments(n.map((e) => e.id)), {
					kernelStatus: "error",
					problems: a.problems
				};
				r.push({
					id: n[i].id,
					...H(n[i]),
					data: n[i].toObject(),
					base: t[i].base,
					view: a.view,
					offChoices: a.choices
				});
			}
			return r;
		}),
		buildCharacter: (t) => e([], async () => {
			let e = t.seed ?? re(), n = [];
			for (let e of t.items) n.push({
				...e,
				data: e.data ?? await L(e.prop, e.entry)
			});
			let r = [];
			for (let e of t.equipment ?? []) r.push({
				data: e.data ?? await L(e.prop, e.entry),
				refKey: e.refKey
			});
			let i = t.starting ? await pn(t.items.filter((e) => e.entry?.startingEquipment), t.starting, t.startingExcluded) : null, a = await lr(t.name, n, [...r, ...i?.equipment ?? []], t.choices ?? {}, {
				strict: !1,
				seed: e,
				picks: t.picks,
				blank: t.blank,
				traitScope: t.traitScope
			});
			return a.pending ? (await a.actor.delete(), {
				kernelStatus: "pending",
				reason: "build-step-not-complete",
				seed: e,
				step: a.step,
				built: a.built
			}) : (i?.specials.length && await a.actor.createEmbeddedDocuments("Item", i.specials), i?.currency && await a.actor.update({ "system.currency": i.currency }), {
				id: a.actor.id,
				seed: e,
				initial: a.initial,
				skipped: i?.skipped ?? [],
				missingTraits: a.missingTraits,
				...H(a.actor)
			});
		}),
		buildSteps: (t) => e([], async () => {
			let e = V.CONFIG.Actor.documentClass, n = new e({
				name: "Build preview",
				type: Ut,
				system: { details: { level: 1 } }
			}), r = await sr($n().forNewItem(n, t));
			return {
				status: r.length ? "pending" : "complete",
				steps: r
			};
		}),
		importForBuild: (t, n) => e([], async () => L(t, n)),
		importerProps: Ue,
		importerMeta: We,
		actorTypes: (t, n) => e([], async () => Wt(t, n)),
		rebuildCharacter: (t) => e([], async () => {
			let e = t.seed?.trim() || t.name;
			j(e);
			let n = [];
			for (let e of t.items) n.push({
				...e,
				data: e.data ?? await L(e.prop, e.entry)
			});
			let r = [];
			for (let e of t.equipment) r.push({
				data: e.data ?? await L(e.prop, e.entry),
				refKey: e.refKey,
				itemId: e.itemId
			});
			let i = await lr(t.name, n, r, t.choices, {
				strict: !0,
				seed: e,
				id: t.id
			});
			if (i.pending) return await i.actor.delete(), {
				kernelStatus: "pending",
				reason: "rebuild-step-not-complete",
				step: i.step,
				built: i.built
			};
			[...i.actor.items].filter((e) => e.type === "class").length > 1 && await Gt(i.actor, t.choices, [...t.items, ...t.equipment]);
			let a = i.actor.toObject(), o = await dt(i.actor, t.off, t.state);
			return o.problems.length ? (await i.actor.delete(), {
				kernelStatus: "error",
				problems: o.problems
			}) : {
				id: i.actor.id,
				seed: e,
				...H(i.actor),
				data: i.actor.toObject(),
				base: a,
				view: o.view,
				offChoices: o.choices
			};
		})
	};
}
// src/rules/kernel/frame/commands-add.ts
function dr(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
function fr(e, t) {
	return { addToActor: (n, r) => e([], async () => {
		let e = t(n), i = e.sheet;
		if (!i?._onDropSingleItem) throw Error(`人物 ${n} 没有官方人物表单实例`);
		let a = [];
		for (let t of r) {
			let n = tr(t.data ? structuredClone(t.data) : await L(t.prop, t.entry)), r = new Set(e.items.map((e) => e.id)), o = $n().forNewItem(e, n, { automaticApplication: !0 });
			if (o.steps.length) {
				let e = await ar(o, t.choices, { strict: !1 });
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
			for (let t of e.items) !r.has(t.id) && dr(t) && a.push(t.toObject());
		}
		return {
			...H(e),
			added: a
		};
	}, [n]) };
}
// src/rules/kernel/frame/commands-batch.ts
var pr = globalThis;
function mr(e, t) {
	let n = structuredClone(e);
	delete n._id;
	for (let e of n.items ?? []) delete e._id;
	for (let e of n.effects ?? []) delete e._id;
	return t && (n.name = t), n;
}
function hr(e) {
	return { createActorsBatch: (t) => e([], async () => {
		let e = [];
		for (let n of t) {
			let t = n.data ?? await L(n.prop, n.entry);
			e.push(mr(t, n.name));
		}
		return (await pr.CONFIG.Actor.documentClass.createDocuments(e)).map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			data: e.toObject()
		}));
	}) };
}
// src/rules/kernel/frame/build-extras.ts
var U = globalThis, gr = (e) => (t) => U.UrlUtil.URL_TO_HASH_BUILDER[e](t), _r = (e, t) => new Map(e.map((e) => [t(e.entry), e])), vr = [{
	field: "featProgression",
	kind: "feat",
	primer: "DataPrimerFauxFeatureClassSubclassFeat"
}, {
	field: "optionalfeatureProgression",
	kind: "optionalfeature",
	primer: "DataPrimerFauxFeatureClassSubclassOptionalfeature"
}];
function yr(e, t) {
	let n = "dataSources", r = "isGmUseBlocklist", i = e.Config.get(n, r);
	e.Config.setTemp(n, r, !1, { isSkipPermissionCheck: !0 });
	try {
		return t();
	} finally {
		e.Config.setTemp(n, r, i, { isSkipPermissionCheck: !0 });
	}
}
function br(e, t) {
	let n = t === "classFeature" ? U.DataUtil.class.unpackUidClassFeature : U.DataUtil.class.unpackUidSubclassFeature;
	return (e[`${t}s`] ?? []).flat(Infinity).map((e) => {
		let r = e?.[t] ?? e;
		return typeof r == "string" ? {
			...n.call(U.DataUtil.class, r),
			...typeof e == "object" ? e : {},
			[t]: r
		} : e;
	});
}
function xr(t, n, r, i, a, o) {
	let s = structuredClone(n.entry);
	if (s.classFeatures = br(s, "classFeature"), s.subclasses = [], t.Charactermancer_Class_Util.getAllFeatures(s).find((e) => e.gainSubclassFeature)?.level === i) {
		let t = new Set([s, o].filter(Boolean).map((e) => U.UrlUtil.URL_TO_HASH_BUILDER.class(e))), c = (r.subclass ?? []).filter((e) => [e.entry, e.local].filter(Boolean).some((e) => t.has(U.UrlUtil.URL_TO_HASH_BUILDER.class({
			name: e.className,
			source: e.classSource
		}))));
		a.extras.push({
			id: `${n.refKey}|subclass|${i}`,
			kind: "subclass",
			title: s.subclassTitle ? e(String(s.subclassTitle)) : R(U.game.i18n.localize("DND5E.ADVANCEMENT.Subclass.Title")),
			count: 1,
			candidates: c.map(({ key: e }) => ({ key: e }))
		});
	}
}
function Sr(t, n, r, i, a) {
	let o = n.entry;
	for (let { field: s, kind: c, primer: l } of vr) {
		if (!o[s]?.length) continue;
		let u = new t[l](), f = gr(c), p = _r(r[c] ?? [], f), m = u._addFauxFeatureFeatures_getFauxFeature, h = 0;
		u._addFauxFeatureFeatures_getFauxFeature = function(...t) {
			let r = m.apply(this, t);
			return r.level === i && t[5] > 0 && (t[6].length ? a.blocked.push(d("{0}：这组包含固定选项，暂时无法在这里应用", e(String(r.name)))) : a.extras.push({
				id: `${n.refKey}|${s}|${i}|${h++}`,
				kind: c,
				title: e(String(r.name)),
				count: t[5],
				candidates: r.linkedEntityInfos.flatMap(({ entity: e }) => {
					let t = p.get(f(e));
					return t ? [{ key: t.key }] : [];
				})
			})), r;
		};
		let g = {
			...structuredClone(o),
			subclasses: []
		};
		if (n.prop === "class" && (g.classFeatures = br(g, "classFeature")), n.prop === "subclass") {
			g.subclassFeatures = br(g, "subclassFeature");
			let e = {
				name: g.className,
				source: g.classSource,
				subclasses: [g]
			};
			yr(t, () => u.addFauxFeatureFeatures([e], [...p.values()].map(({ entry: e }) => e)));
		} else n.prop === "class" && yr(t, () => u.addFauxFeatureFeatures([g], [...p.values()].map(({ entry: e }) => e)));
	}
}
async function Cr(e, n, r, a, o) {
	let s = n.entry.feats;
	if (e.StatGenUtilAdditionalFeats.isNoChoice(s)) return;
	if (s.length !== 1) {
		o.blocked.push(d("专长有多套备选方案，建卡暂时无法在方案间切换"));
		return;
	}
	let c = await a(), l = _r(r, gr("feat")), u = new e.Charactermancer_AdditionalFeatsSelect({
		available: s,
		modalFilterFeats: c,
		modalFilterSpells: {},
		availableProficiencyManager: {}
	});
	u._render_renderPtStatic = () => void 0, u._render_renderPtChooseFromFilter = ({ count: e, filterExpression: r, titleNote: a, featsAdditionType: s }) => {
		let u = c.getEntitiesMatchingFilterExpression({ filterExpression: r }), d = a ? [...new Set(u.map((e) => e.category).filter((e) => !!e))] : [], f = t([i(U.Parser.getPropDisplayName("feat"), [
			"Parser",
			"CAT_ID_TO_FULL",
			String(U.Parser.CAT_ID_FEAT)
		]), ...d.map((e) => i(U.Parser.featCategoryToFull(e), [
			"Parser",
			"FEAT_CATEGORY_TO_FULL",
			e
		]))], " · ");
		o.extras.push({
			id: `${n.refKey}|feats|${s}`,
			kind: "feat",
			title: f,
			count: e,
			candidates: u.flatMap((e) => {
				let t = l.get(gr("feat")(e));
				return t ? [{ key: t.key }] : [];
			})
		});
	};
	let f = e.veE(document.createElement("div"));
	u._hk_ixSet_renderPts({
		stgGroupLeft: f,
		stgGroupRight: f,
		featSet: s[0]
	});
}
function wr(e, t, n, r) {
	t.candidates = t.candidates.filter((t) => {
		let i = r.get(t.key)?.entry, a = i?.prerequisite;
		if (!Array.isArray(a) || !a.length) return !0;
		let [o] = a;
		if (a.length === 1 && typeof o?.level == "number" && Object.keys(o).length === 1) {
			let t = e.UtilDataConverter.getPrerequisiteLevelNumber({ prereqs: a });
			return new U.CONFIG.Item.documentClass({
				name: i?.name,
				type: "feat",
				system: { prerequisites: { level: t } }
			}).system.assertPrerequisites(n) === !0;
		}
		return t.needsCheck = !0, !0;
	});
}
async function Tr(e, t, n, r) {
	if (!I) throw Error("此版本 Plutonium 缺少建卡选择入口");
	let i = I, a = t.feat ?? [], o = new Map(Object.values(t).flat().map((e) => [e.key, e])), s, c = () => s ??= i.Charactermancer_AdditionalFeatsSelect._pGetUserInput_pGetModalFilterFeats({ allData: { feat: a.map(({ entry: { prerequisite: e, ...t } }) => t) } }), l = [];
	for (let s of e) {
		let e = {
			refKey: s.refKey,
			extras: [],
			blocked: []
		};
		s.prop === "class" && xr(i, s, t, 1, e, r[s.refKey]), (s.prop === "class" || s.prop === "subclass") && Sr(i, s, t, 1, e), s.entry.feats?.length && await Cr(i, s, a, c, e);
		for (let t of e.extras) wr(i, t, n, o);
		l.push(e);
	}
	return l;
}
// src/rules/kernel/frame/commands-options.ts
var Er = (e, t = []) => Object.entries(e ?? {}).flatMap(([e, n]) => n?.children ? Er(n.children, [...t, R(String(n.label ?? e))]) : [{
	value: e,
	label: String(n?.label ?? e),
	path: t
}]), Dr = {
	Trait: async (e, t, n) => {
		let { available: r } = await e.unfulfilledChoices(), i = r.filter((e) => e.type === "grant").flatMap((e) => Er(e.choices)), o = /* @__PURE__ */ new Map();
		for (let e of r.filter((e) => e.type === "choice")) {
			let t = o.get(e.choiceIdx) ?? {
				count: 0,
				options: Er(e.choices)
			};
			t.count++, o.set(e.choiceIdx, t);
		}
		let s = i[0]?.value ?? [...o.values()][0]?.options[0]?.value, c = n.get(e.id), l = c?.choices.length ? c.choices : void 0;
		if (!o.size && !l) return null;
		let u = [...o.values()], d = await yn([...i, ...u.flatMap((e) => e.options)].map((e) => e.value)), f = (e) => {
			let t = c?.names.get(e.value) ?? (d[e.value] ? a(e.label, d[e.value], !0) : R(e.label)), n = t.$t === "name" ? t.ids : [];
			return {
				...e,
				label: t,
				...n.length === 1 ? { author: n[0] } : {}
			};
		};
		return {
			kind: "trait",
			trait: e.configuration?.type ?? s?.split(":")[0] ?? null,
			grants: i.map(f),
			slots: u.map((e) => ({
				...e,
				options: e.options.map(f)
			})),
			...l ? { plans: l } : {}
		};
	},
	AbilityScoreImprovement: async (e, t) => Bt(e, t)
}, Or = /* @__PURE__ */ new Set([
	"HitPoints",
	"ScaleValue",
	"Size",
	"ItemGrant",
	"Subclass"
]);
async function kr(n, r = [], a, o) {
	let s = [];
	for (let c of n.steps) {
		let n = c.flow?.advancement;
		if (!n) continue;
		let l = n.constructor?.typeName ?? n.type, u = await c.flow.getAutomaticApplicationValue?.() !== !1, d = null, f = !1, p = r.find((e) => e.id === n.id && (e.level ?? null) === (c.flow.level ?? null))?.value;
		Dr[l] ? d = await Dr[l](o.get(n.id) ?? n, p, a) : !u && !Or.has(l) && (f = !0);
		let m = l === "Trait" ? It(n) : null, h = n._source?.name || n._source?.title, g = n.name ?? n.title, _ = m ? R(m) : h ? e(String(h), Et(String(h))) : g ? R(String(g)) : null, v = l === "Trait" && n.hint ? t(String(n.hint).split("\n").map((e) => i(e, Ln(e))), "\n") : void 0;
		s.push({
			id: n.id,
			level: c.flow.level ?? null,
			type: l,
			title: _,
			...v ? { hint: v } : {},
			automatic: u,
			options: d,
			...f ? { unsupported: !0 } : {}
		});
	}
	return s;
}
function Ar(e) {
	return { buildOptions: (t) => e([], async () => {
		let e = [];
		for (let n of t.items) e.push({
			...n,
			data: n.data ?? await L(n.prop, n.entry)
		});
		let n = [], r = await lr("选项预览", e, [], t.choices ?? {}, {
			strict: !1,
			picks: t.picks,
			blank: t.blank,
			traitScope: t.traitScope,
			onManager: async ({ manager: e, key: t, unsupported: r, picks: i, traitPlans: a, expertise: o }) => {
				n.push({
					refKey: t,
					steps: await kr(e, i, a, o),
					unsupported: r
				});
			}
		}), i = r.actor ?? r.created;
		try {
			let e = t.extraPools && Object.keys(t.extraPools).length ? await Tr(t.items, t.extraPools, i, t.local ?? {}) : [], a = new Map(n.map((e) => [e.refKey, e]));
			return {
				items: e.length ? e.map((e) => ({
					steps: [],
					unsupported: [],
					...a.get(e.refKey),
					...e
				})) : n,
				complete: !r.pending && !r.missingTraits.length,
				abilities: {
					initial: r.initial,
					auto: cr(i),
					cap: globalThis.CONFIG?.DND5E?.maxAbilityScore ?? null,
					labels: Object.fromEntries(Object.entries(kt("abilities")).map(([e, t]) => [e, R(t)]))
				}
			};
		} finally {
			await (r.actor ?? r.created)?.delete?.();
		}
	}) };
}
// src/rules/kernel/frame/commands-sheet.ts
var W = globalThis, jr = { configure: !1 }, Mr = { create: !1 }, Nr = [
	/^_id$/,
	/^_stats(\.|$)/,
	/^type$/,
	/^items(\.|$)/,
	/^effects(\.|$)/,
	/^flags\.plutonium(\.|$)/,
	/^system\.advancement(\.|$)/
];
function Pr(e, t) {
	return !t || Nr.some((e) => e.test(t)) ? !1 : t.startsWith("flags.") ? t.split(".").length >= 3 : t.startsWith("system.") ? !!e.system?.schema?.getField?.(t.slice(7)) : !!e.schema?.getField?.(t);
}
function Fr(e, t, n, r) {
	if (!Pr(e, t)) throw Error(`不能改这个字段：${t}`);
	if (!r) return { [t]: n };
	let i = t.lastIndexOf(".");
	return { [`${t.slice(0, i)}.-=${t.slice(i + 1)}`]: null };
}
var Ir = (e, t) => t ? e.items.get(t, { strict: !0 }) : e, Lr = (e) => JSON.parse(JSON.stringify(e ?? null, (e, t) => e === "document" || e === "anchor" || e === "fields" || e === "field" || e === "parent" ? void 0 : t));
function Rr(e) {
	let t = /* @__PURE__ */ new Set([Object.prototype, W.foundry.abstract.DataModel.prototype]), n = [];
	for (let r = Object.getPrototypeOf(e); r && !t.has(r); r = Object.getPrototypeOf(r)) for (let [e, t] of Object.entries(Object.getOwnPropertyDescriptors(r))) t.get && !n.some(([t]) => t === e) && n.push([e, t.get]);
	return n;
}
function G(e, t = 0, n = /* @__PURE__ */ new WeakSet()) {
	if (typeof e == "function") return;
	if (typeof e != "object" || !e) return e;
	if (t > 12 || n.has(e) || e instanceof W.foundry.abstract.Document) return;
	if (n.add(e), e instanceof Set) return [...e].map((e) => G(e, t + 1, n));
	if (e instanceof Map) return Object.fromEntries([...Map.prototype.entries.call(e)].map(([e, r]) => [e, G(r, t + 1, n)]));
	if (Array.isArray(e)) return e.map((e) => G(e, t + 1, n));
	let r = {};
	for (let i of Object.keys(e)) {
		if (i === "parent" || i.startsWith("_")) continue;
		let a = G(e[i], t + 1, n);
		a !== void 0 && (r[i] = a);
	}
	for (let [i, a] of Rr(e)) {
		if (i in r || i === "parent" || i.startsWith("_")) continue;
		let o;
		try {
			o = a.call(e);
		} catch {
			o = void 0;
		}
		let s = G(o, t + 1, n);
		s !== void 0 && (r[i] = s);
	}
	return r;
}
function zr(t) {
	let n = t.flags?.plutonium;
	if (n?.propDroppable && typeof n.hash == "string") {
		let e = {
			propDroppable: n.propDroppable,
			...n.source ? { source: n.source } : {},
			hash: n.hash
		};
		return {
			name: a(t.name, e),
			author: e
		};
	}
	return { name: e(t.name) };
}
function Br(e, t = {}) {
	if (!e || typeof e != "object" || Array.isArray(e)) return t;
	for (let [n, r] of Object.entries(e)) {
		let e = typeof r == "string" ? r : typeof r?.label == "string" ? r.label : null;
		if (e) {
			let r = W.game.i18n.has(e) ? R(W.game.i18n.localize(e), e) : R(e);
			r.$t === "system" && (t[n] = r);
		}
		r?.children && Br(r.children, t);
	}
	return t;
}
async function Vr(e, t, n) {
	if (!e) return null;
	let r = new e({ document: t }), i = await r._prepareContext({ parts: [] }), a = await r._preparePartContext(Object.keys(e.PARTS ?? {})[0] ?? "config", i, {});
	return Object.fromEntries(n.filter((e) => e in a).map((e) => [e, Lr(a[e])]));
}
var Hr = {
	ability: (e, t) => e.rollAbilityCheck({ ability: t }, jr, Mr),
	tool: (e, t) => e.rollToolCheck({ tool: t }, jr, Mr),
	death: (e) => e.rollDeathSave({}, jr, Mr),
	hitDie: (e, t) => e.rollHitDie(t ? { denomination: t } : {}, jr, Mr),
	initiative: async (e) => {
		let t = e.getInitiativeRoll();
		return t ? (await t.evaluate({ allowInteractive: !1 }), [t]) : null;
	}
};
function Ur(t, n, r) {
	return {
		sheet: (r) => t([], async () => {
			let t = n(r), i = W.dnd5e?.applications?.actor ?? {};
			return {
				id: t.id,
				name: t.name,
				img: t.img,
				type: t.type,
				flags: Lr(t.flags ?? {}),
				system: G(t.system),
				statuses: [...t.statuses ?? []],
				items: [...t.items].map((e) => ({
					...F(e),
					img: e.img,
					sort: e.sort,
					system: G(e.system),
					labels: Lr(e.labels ?? {})
				})),
				effects: [...t.allApplicableEffects()].map((e) => ({
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
					duration: Lr(e.duration),
					changes: Lr(e.system?.changes ?? e.changes ?? [])
				})),
				shown: {
					items: [...t.items].map((e) => ({
						id: e.id,
						...zr(e)
					})),
					effects: [...t.allApplicableEffects()].map((t) => {
						let n = R(t.name);
						return {
							id: t.id,
							name: n.$t === "system" ? n : e(t.name)
						};
					})
				},
				breakdown: {
					hp: await Vr(i.HitPointsConfig, t, [
						"classes",
						"ability",
						"effects",
						"levels"
					]),
					ac: await Vr(i.ArmorClassConfig, t, ["calculations", "formulaLabel"])
				}
			};
		}),
		roster: (e) => t([], async () => [...W.game.actors].filter((t) => !e || e.includes(t.id)).map((e) => ({
			id: e.id,
			name: e.name,
			img: e.img,
			type: e.type,
			system: G(e.system),
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
		edit: (e, r) => t([], async () => {
			let t = n(e);
			for (let e of r) if (e.kind === "set") await t.update(Fr(t, e.path, e.value, e.remove));
			else if (e.kind === "item") {
				let n = t.items.get(e.itemId, { strict: !0 });
				await n.update(Fr(n, e.path, e.value, e.remove));
			} else if (e.kind === "itemDelete") await t.deleteEmbeddedDocuments("Item", [e.itemId]);
			else if (e.kind === "effect") {
				let n = Ir(t, e.itemId).effects.get(e.effectId, { strict: !0 });
				await n.update(Fr(n, e.path, e.value, e.remove));
			} else if (e.kind === "effectCreate") await Ir(t, e.itemId).createEmbeddedDocuments("ActiveEffect", [e.data]);
			else if (e.kind === "effectDelete") await Ir(t, e.itemId).deleteEmbeddedDocuments("ActiveEffect", [e.effectId]);
			else if (e.kind === "status") await t.toggleStatusEffect(e.statusId, e.levels === void 0 ? { active: e.active ?? !0 } : { levels: e.levels });
			else throw Error(`不认识的改动：${e.kind}`);
			return { edits: r.length };
		}, [e]),
		check: (e, i, a, o = []) => t(o, async () => {
			let t = Hr[i];
			if (!t) throw Error(`没有这种检定：${i}`);
			return (await t(n(e), a))?.map(r) ?? null;
		}, [e]),
		glossary: () => t([], async () => ({
			tables: Object.fromEntries(Object.entries(W.CONFIG.DND5E ?? {}).map(([e, t]) => [e, Br(t)]).filter(([, e]) => Object.keys(e).length)),
			statuses: (W.CONFIG.statusEffects ?? []).map((e) => ({
				id: e.id,
				name: R(String(e.name ?? e.id)),
				img: e.img ?? null
			}))
		})),
		deleteActors: (e) => t([], async () => {
			let t = e.filter((e) => W.game.actors.get(e));
			return t.length && await W.CONFIG.Actor.documentClass.deleteDocuments(t), { deleted: t };
		})
	};
}
// src/rules/kernel/frame/commands-import.ts
var Wr = globalThis, Gr = () => Wr.CONFIG.Actor.documentClass;
function Kr(e) {
	return { draftStart: (t) => e([], async () => {
		j(t.seed);
		let e = await Gr().create({
			...t.id ? { _id: t.id } : {},
			name: t.name,
			type: Ut
		}, { keepId: !!t.id });
		return {
			id: e.id,
			data: e.toObject()
		};
	}) };
}
// src/rules/kernel/frame/native-builder-review.ts
function qr(e) {
	let t = /* @__PURE__ */ new Map(), n = e.compClass.compsClassLevelSelect.flatMap((e) => e?.getTargetLevel() ?? []);
	t.set("职业", n.length ? { text: n.map((e) => `${e} 级`).join(" / ") } : {
		text: "待选职业和等级",
		pending: !0
	});
	let r = e.compAbility.compStatgen, { mode: i, totals: a } = r.getTotals(), o = Object.values(a[i] ?? {}), s = r._state, c = globalThis.Parser.ABIL_ABVS.filter((e) => {
		switch (i) {
			case "array": return s[r.constructor._array_getProps(e).propAbilSelectedScoreIx] == null;
			case "rolled": return s[r.constructor._rolled_getProps(e).propAbilSelectedRollIx] == null;
			case "manual": return !s[r.constructor._manual_getProps(e).propAbilValue];
			default: return !1;
		}
	}).length;
	t.set("属性值", o.length ? c ? {
		text: `还有 ${c} 项属性未分配`,
		pending: !0
	} : { text: o.join(" / ") } : {
		text: "待选属性分配方式",
		pending: !0
	});
	let l = e.compEquipment, u = l.compEquipmentStartingDefault;
	u?.isAvailable && l.isStandardStartingEquipmentActive_() && t.set("起始装备", u._isValid_standard() ? { text: "已选好" } : {
		text: "还有装备未选择",
		pending: !0
	});
	let d = l.compEquipmentShopGold;
	d?.isAvailable && !d._isValid_gold() && t.set("装备商店", {
		text: "超出可用金币",
		pending: !0
	});
	let f = [], p = !1;
	for (let t of e.compSpell.compsSpellSpells) {
		let e = t?._state;
		if (e) for (let [t, n, r] of [[
			"戏法",
			e.cntLearnedCantrips,
			e.maxLearnedCantrips
		], [
			"准备法术",
			e.cntPrepared,
			e.maxPrepared
		]]) r && (f.push(`${t} ${n}/${r}`), n < r && (p = !0));
	}
	return f.length && t.set("法术", { text: f.join(" · ") + (p ? " · 可继续选择" : "") }), t;
}
// src/rules/kernel/frame/native-builder-elements.ts
function K(e, t = "", n = "") {
	let r = document.createElement(e);
	return r.className = t, r.textContent = n, r;
}
function q(e, t, n = "p6-builder-btn") {
	let r = K("button", n, e);
	return r.type = "button", r.addEventListener("click", t), r;
}
// src/rules/kernel/frame/native-builder-controls.ts
var Jr = globalThis, Yr = (e) => e.trim().toLowerCase(), Xr = /* @__PURE__ */ new WeakMap();
function Zr(e, t) {
	let n = Yr(e), r = Object.hasOwn(t.terms, n) ? t.terms[n] : void 0;
	if (r) return r;
	if (!/[a-zA-Z]/.test(e)) return e;
	let i = Xr.get(t);
	i || (i = /* @__PURE__ */ new Map(), Xr.set(t, i));
	let a = i.get(e);
	if (a !== void 0) return a;
	for (let { $t: t, ...n } of [Et(e), R(e)]) {
		if (t !== "system" || !("key" in n) || !Jr.game.i18n.has(n.key)) continue;
		let r = Jr.game.i18n.localize(n.key);
		if (r !== e) return i.set(e, r), r;
	}
	return i.set(e, e), e;
}
function Qr(e, t) {
	let n = Zr(e.trim(), t);
	if (n !== e.trim()) return e.replace(e.trim(), n);
	let r = /^\s*\((\w{3})\)\s*$/.exec(e);
	if (r) {
		let t = Jr.CONFIG.DND5E.abilities[r[1].toLowerCase()]?.label;
		if (t) return e.replace(r[1], t);
	}
	if (e.includes(", ")) {
		let n = e.split(", "), r = n.map((e) => Zr(e, t));
		if (r.some((e, t) => e !== n[t])) return r.join("，");
	}
	return e;
}
function $r(e, t) {
	for (let t of e.querySelectorAll(".p6-choice-group")) {
		let e = t.previousElementSibling;
		e?.classList.contains("ve-mb-1") && /^Choose\b/.test(e.textContent ?? "") && e.classList.add("p6-choice-instruction");
	}
	let n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), r;
	for (; r = n.nextNode();) {
		let e = r;
		if (!e.data.trim() || e.parentElement?.closest("script,style,textarea,.p6-builder-ui")) continue;
		let n = e.parentElement?.closest("option"), i = Qr(e.data, t);
		i !== e.data && (n && !n.hasAttribute("value") && n.setAttribute("value", n.value), e.data = i);
	}
	for (let n of e.querySelectorAll("[title],[placeholder],[aria-label]")) for (let e of [
		"title",
		"placeholder",
		"aria-label"
	]) {
		let r = n.getAttribute(e);
		if (!r) continue;
		let i = Qr(r, t);
		i !== r && n.setAttribute(e, i);
	}
	for (let t of e.querySelectorAll("button[name=\"btn-learn-cantrip\"],button[name=\"btn-learn-spell\"],button[name=\"btn-prepare\"]")) {
		let e = t.name === "btn-prepare" ? "准备" : "学习";
		t.textContent !== e && (t.textContent = e), t.setAttribute("aria-pressed", String(t.classList.contains("ve-active")));
	}
}
function ei(e, t) {
	let n = e.ComponentUiUtil, r = n.getMetaWrpMultipleChoice, i = e.Charactermancer_Spell_Level.prototype, a = i._getListItem;
	return n.getMetaWrpMultipleChoice = function(e, t, n) {
		let i = r.call(this, e, t, n);
		if (n?.count == null || !i.rowMetas?.length) return i;
		let a = K("small", "p6-choice-progress p6-builder-ui");
		a.setAttribute("aria-live", "polite"), i.ele.classList.add("p6-choice-group"), i.ele.classList.remove("ve-flex-col");
		for (let e of i.rowMetas) {
			let t = e.cb.closest("label")?.parentElement;
			if (t) {
				t.classList.add("p6-choice-option");
				for (let e of t.children) e.classList.remove(...[...e.classList].filter((e) => e.startsWith("ve-col-")));
			}
		}
		i.ele.prepend(a);
		let o = () => {
			let e = i.rowMetas.filter((e) => e.cb.checked).map((e) => e.cb.closest("label")?.parentElement?.querySelector(".ve-inline-flex-v-center")?.textContent?.trim() ?? "").filter(Boolean), t = n.count - e.length, r = e.length ? ` · 已选：${e.join("、")}` : "";
			a.textContent = (t > 0 ? `选 ${n.count} 项 · 还差 ${t} 项` : `已选好 ${n.count} 项`) + r, a.dataset.done = String(t <= 0), a.dataset.missing = String(Math.max(0, t)), i.ele.isConnected && !i.ele.closest(".application:not(.trpg-main)") && i.ele.dispatchEvent(new Event("p6-choice-change", { bubbles: !0 }));
		}, s = i.cleanup;
		return e._addHookBase(i.propPulse, o), i.cleanup = function(...t) {
			return e._removeHookBase(i.propPulse, o), s.apply(this, t);
		}, o(), i;
	}, i._getListItem = function(e, ...n) {
		let r = a.call(this, e, ...n), i = Jr.UrlUtil.URL_TO_HASH_BUILDER.spell(e), o = t.labels.spell?.[i];
		if (o && r?.ele) {
			let e = r.ele.firstElementChild;
			e && (e.textContent = o.name, e.classList.add("p6-spell-name")), r.values.alias = [r.values.alias, o.name].filter(Boolean).join(" "), r.ele.dataset.p6Spell = i;
		}
		return r;
	}, () => {
		n.getMetaWrpMultipleChoice = r, i._getListItem = a;
	};
}
function ti(e, t, n) {
	let r = e.querySelector(".ve-statgen-shared__wrp-header"), i = r?.querySelector("select"), a = t.compAbility.compStatgen, o = e.closest(".p6-builder-attributes");
	if (o && (o.dataset.mode = a.getMode()), !r || !i || r.querySelector(".p6-ability-methods")) return;
	let s = K("div", "p6-ability-methods p6-builder-ui");
	s.setAttribute("role", "group"), s.setAttribute("aria-label", "怎么定属性");
	let c = [...i.options].slice(1).map((e) => {
		let t = Number(e.value), r = q(Zr(e.textContent ?? "", n), () => {
			a.ixActiveTab = t, l();
		});
		return r.disabled = e.disabled, s.append(r), {
			index: t,
			optionButton: r
		};
	});
	function l() {
		for (let { index: e, optionButton: t } of c) t.setAttribute("aria-pressed", String(a.ixActiveTab === e));
		let t = e.closest(".p6-builder-attributes");
		t && (t.dataset.mode = a.getMode());
	}
	i.style.setProperty("display", "none", "important"), r.replaceChildren(i, K("b", "", "怎么定属性？"), s), l();
}
var ni = /* @__PURE__ */ new WeakSet();
function ri(e) {
	for (let t of e.compClass.compsClassLevelSelect) {
		if (!t?._isRadio || ni.has(t)) continue;
		let e = t._list?.items ?? [], n = e[0]?.ele.closest(".ve-min-h-0");
		if (!n || !e.length) continue;
		ni.add(t);
		let r = K("label", "p6-level p6-builder-ui", "目标等级"), i = K("select");
		i.setAttribute("aria-label", "目标等级");
		for (let t of e) {
			let e = t.getId() + 1, n = K("option", "", `${e} 级`);
			n.value = String(e), n.disabled = t.data.cbSel.disabled, i.append(n);
		}
		i.value = String(t.getTargetLevel() ?? ""), i.addEventListener("change", (n) => {
			let a = e.find((e) => e.getId() + 1 === Number(i.value));
			a && !a.data.cbSel.checked && t._handleSelectClick(a, n), i.value = String(t.getTargetLevel() ?? ""), r.dispatchEvent(new Event("p6-choice-change", { bubbles: !0 }));
		}), r.append(i);
		let a = n.closest(".ve-flex-col.ve-w-100.ve-mt-2");
		a ? a.prepend(r) : n.before(r), n.style.setProperty("display", "none", "important");
	}
}
// src/rules/kernel/frame/native-builder-pickers.ts
var ii = {
	race: "种族",
	background: "背景",
	class: "职业",
	subclass: "子职业"
};
function ai(e, t, n) {
	let r = e.entry(t);
	if (!r?.name || !r.source) return;
	let i = globalThis.UrlUtil.URL_TO_HASH_BUILDER[e.category]?.(r), a = n.labels[e.category]?.[i];
	return a ? {
		value: t,
		name: r.name,
		source: r.source,
		hash: i,
		label: a
	} : void 0;
}
function oi(e, t, n, r) {
	let i = ii[n.category], a = K("section", "p6-picker"), o = K("input", "p6-picker-search");
	o.type = "search", o.placeholder = `搜索${i}`, o.setAttribute("aria-label", o.placeholder);
	let s = K("div", "p6-picker-list"), c = K("p", "p6-picker-status");
	c.setAttribute("aria-live", "polite"), a.append(o, s, c);
	let l = /* @__PURE__ */ new Map(), u, d = () => e.getSelected() == null ? void 0 : ai(n, e.getSelected(), r), f = () => {
		let t = e.getSelected();
		for (let [e, n] of l) n.setAttribute("aria-pressed", String(t === e)), n.dataset.preview = String(u?.value === e);
		a.dispatchEvent(new Event("p6-picker-change", { bubbles: !0 }));
	}, p = () => {
		let t = o.value.trim().normalize("NFKC").toLocaleLowerCase(), i = e._rdState.getAvailableOptionMetas().flatMap(({ value: e }) => e == null ? [] : ai(n, e, r) ?? []).filter((e) => `${e.label.name} ${e.name} ${e.source}`.normalize("NFKC").toLocaleLowerCase().includes(t));
		u && i.some((e) => e.value === u?.value) || (u = i.find((t) => t.value === e.getSelected()) ?? i[0]), l = new Map(i.map((e) => {
			let t = q("", () => {
				u = e, a.dispatchEvent(new Event("p6-picker-preview", { bubbles: !0 })), f();
			}, "p6-picker-row");
			return t.dataset.source = e.source, t.append(K("span", "p6-picker-name", e.label.name), K("small", "p6-picker-source", e.source)), [e.value, t];
		})), s.replaceChildren(...l.values()), f(), c.textContent = i.length ? `共 ${i.length} 条` : t ? "没找到匹配的资料" : "当前没有可选资料";
	};
	o.addEventListener("input", p), e.addHookSelected(f);
	for (let t of [
		"values",
		"pulse_fnFilter",
		"isDisabled"
	]) e._addHookBase(t, p);
	return {
		element: a,
		anchor: t,
		category: n.category,
		chosen: d,
		preview: () => u,
		disabled: () => !!e._state.isDisabled,
		toggle() {
			u && !this.disabled() && e._addToSelection(d()?.value === u.value ? null : u.value);
		},
		mount(e) {
			e.append(a), t.style.setProperty("display", "none", "important"), p();
		}
	};
}
function si(e, t, n) {
	let r = e.ComponentUiUtil, i = e.Charactermancer_Util, a = r.getSelSearchable, o = i.getFilterSearchMeta, s = r._SearchableDropdownComponent.prototype, c = s.render, l;
	return i.getFilterSearchMeta = function(e) {
		let t = {
			race_ixRace: "race",
			background_ixBackground: "background"
		}[e.prop], n = l;
		t && (l = {
			category: t,
			entry: (t) => e.data[t]
		});
		try {
			return o.call(this, e);
		} finally {
			l = n;
		}
	}, r.getSelSearchable = function(e, r, i) {
		let o = l;
		if (typeof e.getClass_ == "function" && /_ixClass$/.test(r) && (o = {
			category: "class",
			entry: (t) => e.getClass_({ ix: t })
		}), typeof e.getSubclass_ == "function" && /_ixSubclass$/.test(r)) {
			let t = e.getClass_({ propIxClass: r.replace(/_subclass_ixSubclass$/, "_ixClass") });
			t && (o = {
				category: "subclass",
				entry: (n) => e.getSubclass_({
					cls: t,
					ix: n
				})
			});
		}
		if (!o) return a.call(this, e, r, i);
		let u = o;
		s.render = function() {
			let e = c.call(this);
			return n(oi(this, e.wrp, u, t)), e;
		};
		try {
			return a.call(this, e, r, i);
		} finally {
			s.render = c;
		}
	}, () => {
		r.getSelSearchable = a, i.getFilterSearchMeta = o;
	};
}
// src/rules/kernel/frame/native-equipment-picker.ts
var ci = globalThis, li = (e) => e.normalize("NFKC").toLocaleLowerCase();
function ui(e, t) {
	let n = e.prototype, r = n.pGetUserChoiceFromEquipmentTypes, i = null, a;
	function o(e) {
		let t = e.target instanceof Element && e.target.closest(".p6-builder-equipment button:has(.fa-magnifying-glass)");
		t && (i = t, setTimeout(() => {
			i === t && (i = null);
		}, 0));
	}
	return document.addEventListener("click", o, !0), n.pGetUserChoiceFromEquipmentTypes = function(e) {
		let n = i;
		if (!n || (a?.(), !n.closest(".imp-cls__wrp-equi-group"))) return r.call(this, e);
		let o = ci.SortUtil, s = [...new Set(e.flatMap((e) => this._getSetChoices(e)))].sort(o.ascSortLower);
		return new Promise((e) => {
			let r = K("div", "p6-equip-picker p6-builder-ui"), i = K("input", "p6-picker-search");
			i.type = "search", i.placeholder = "搜索装备", i.setAttribute("aria-label", i.placeholder);
			let o = K("div", "p6-equip-picker-list");
			r.append(i, o);
			function c(t, i = null) {
				document.removeEventListener("pointerdown", l, !0), a = void 0, r.remove(), n?.setAttribute("aria-expanded", "false"), n?.focus(), e([t, i]);
			}
			function l(e) {
				e.target instanceof Node && !r.contains(e.target) && !n?.contains(e.target) && c(!1);
			}
			a = () => c(!1);
			let u = s.map((e) => {
				let n = ci.DataUtil.proxy.unpackUid("item", e, "item"), r = ci.UrlUtil.URL_TO_HASH_BUILDER.item(n), i = t.labels.item?.[r]?.name ?? Zr(n.name, t), a = q("", () => c(!0, e), "p6-picker-row");
				return a.dataset.uid = e, a.append(K("span", "", i), K("small", "p6-picker-source", n.source)), {
					row: a,
					term: li(`${i} ${n.name} ${n.source}`)
				};
			}), d = () => {
				let e = li(i.value.trim()), t = u.filter((t) => t.term.includes(e));
				o.replaceChildren(...t.map(({ row: e }) => e)), t.length || o.append(K("p", "p6-picker-status", "没有匹配的装备"));
			};
			i.addEventListener("input", d), r.addEventListener("keydown", (e) => {
				e.key === "Escape" && (e.stopPropagation(), c(!1));
			}), r.append(q("清除这一格", () => c(!0), "p6-equip-picker-clear")), r.setAttribute("role", "dialog"), r.setAttribute("aria-label", n.title || "选择一件物品"), n.setAttribute("aria-expanded", "true"), n.after(r), document.addEventListener("pointerdown", l, !0), d(), i.focus();
		});
	}, () => {
		a?.(), document.removeEventListener("click", o, !0), n.pGetUserChoiceFromEquipmentTypes = r;
	};
}
// src/rules/kernel/frame/native-builder-ui.ts
var di = [
	{
		name: "Origin (Species)",
		label: "种族",
		prop: "race"
	},
	{
		name: "Origin (Background)",
		label: "背景",
		prop: "background"
	},
	{
		name: "Class",
		label: "职业",
		prop: "class"
	},
	{
		name: "Class",
		label: "子职",
		prop: "subclass",
		optional: "subclass"
	},
	{
		name: "Origin (Other)",
		label: "其他出身",
		optional: "controls"
	},
	{
		name: "Feats",
		label: "专长"
	},
	{
		name: "Abilities",
		label: "属性值"
	},
	{
		name: "Starting Equipment",
		label: "装备",
		shop: "Equipment Shop"
	},
	{
		name: "Spells",
		label: "法术",
		optional: "spells"
	}
];
function fi(e) {
	let t = e.wrpTab;
	t.classList.remove("ve-flex-col"), t.classList.add("p6-builder-step");
	let n = K("aside", "p6-builder-rail");
	n.hidden = !0;
	let r = K("div", "p6-builder-panel"), i = K("div", "p6-builder-selection p6-builder-ui"), a = K("h2", "p6-builder-selection-title"), o = K("div", "p6-native-body"), s = K("div", "p6-builder-card p6-builder-ui"), c = K("small", "p6-picker-source"), l, u = q("选它", () => l?.toggle(), "p6-builder-btn p6-builder-primary"), d = q("‹ 列表", () => {
		t.dataset.view = "list";
	}, "p6-builder-btn p6-builder-to-list");
	return o.append(...t.childNodes), i.append(d, a, c, u), r.append(i, o, s), t.append(n, r), {
		tab: e,
		rail: n,
		form: o,
		heading: i,
		title: a,
		brief: s,
		source: c,
		action: u,
		focus: (e) => {
			l = e;
		}
	};
}
function pi(e, t) {
	let { heading: n, title: r, brief: i, form: a, source: o, action: s } = e;
	e.focus(t);
	let c = t?.preview(), l = t?.chosen(), u = c && l?.value === c.value, d = t && ii[t.category];
	if (n.hidden = !t, a.hidden = !!t && !u, i.hidden = !t, r.textContent = c?.label.name ?? (t ? `选择${d}` : ""), o.textContent = c?.source ?? "", s.hidden = !c, !c || !t) {
		delete i.dataset.entry, i.textContent = t ? "请从左栏选择一条资料。" : "";
		return;
	}
	s.textContent = u ? "取消选它" : "选它", s.disabled = t.disabled();
	let f = `${t.category}|${c.hash}`;
	i.dataset.entry !== f && (i.dataset.entry = f, i.textContent = "正在读取资料…", y({
		op: "build-card",
		prop: t.category,
		hash: c.hash
	}).then((e) => {
		if (i.dataset.entry !== f) return;
		let t = e;
		t?.html ? i.innerHTML = `${t.chinese ? "" : "<p class=\"p6-builder-card-note\">这一条只有英文资料。</p>"}${t.html}` : i.textContent = "这一条没有资料卡正文。";
	}).catch(() => {
		i.dataset.entry === f && (i.textContent = "资料卡读取失败，关掉重开建卡再试。");
	}));
}
function mi(e, t, n, r, i) {
	let a = e._tabs, o = new Map(a.map((e) => [e.name, fi(e)])), s = new Set(di.flatMap((e) => e.shop ? [e.name, e.shop] : [e.name])), c = [...di, ...a.filter((e) => !s.has(e.name)).map((e) => ({
		name: e.name,
		label: e.btnTab.textContent?.trim() || "作者选项"
	}))], l = a[0].btnTab.parentElement, u = t.lastElementChild;
	l.hidden = !0, u.hidden = !0, u.previousElementSibling instanceof HTMLHRElement && (u.previousElementSibling.hidden = !0), t.classList.add("p6-builder");
	let d = K("nav", "p6-builder-nav p6-builder-ui");
	d.setAttribute("aria-label", "建卡步骤"), t.prepend(d);
	let f = K("section", "p6-builder-review p6-builder-ui");
	t.append(f);
	let p = K("div", "p6-builder-switch p6-builder-ui");
	d.after(p);
	let m = K("span", "p6-builder-spell-status"), h = K("div", "p6-builder-footer p6-builder-ui"), g = K("p", "p6-builder-feedback");
	g.setAttribute("aria-live", "polite");
	let _ = K("small", "p6-builder-hint", "关掉窗口会丢掉这次选择");
	h.append(_, g), t.append(h);
	let v = c[0], y = !1, b = !1, x = 0, ee, te = /* @__PURE__ */ new Map(), S = q("下一步", () => ne(1), "p6-builder-btn p6-builder-primary"), C = q("上一步", () => ne(-1)), w = String(e._actor?.name ?? ""), T = q(w ? `创建「${w}」` : "创建人物", () => {
		ie();
	}, "p6-builder-btn p6-builder-primary");
	h.append(C, S, T);
	let E = new Map([...c, null].map((e) => {
		let t = q("", () => k(e), "p6-builder-tab");
		return t.append(K("i"), K("span", "", e?.label ?? "完成")), [e, t];
	}));
	d.append(K("span", "p6-builder-tab p6-builder-past", "✓ 名字"), ...E.values());
	function D(t) {
		let r = o.get(t.name);
		if (!r) return !1;
		switch (t.optional) {
			case "subclass": return n.some((e) => e.category === "subclass" && !!e.preview());
			case "spells": return e.compSpell.compsSpellSpells.some(Boolean) || !!r.form.querySelector(".manc__list-row, [name=\"btn-learn-cantrip\"], [name=\"btn-prepare\"]");
			case "controls": return [...r.form.querySelectorAll("button,input,select")].some((e) => !e.closest(".ve-hidden,[hidden]"));
			default: return !0;
		}
	}
	function ne(e) {
		let t = [...c.filter(D), null], n = t[t.indexOf(v) + e];
		n !== void 0 && k(n);
	}
	function O(e) {
		return e.label === "装备" ? "起始装备" : e.label;
	}
	function k(e) {
		if (b || e && !D(e)) return;
		if (v = e, y = !1, g.textContent = "", p.replaceChildren(), p.hidden = !e?.shop && e?.label !== "法术", e?.shop) {
			let e = q("起始装备", () => {
				y = !1, A();
			}), t = q("装备商店", () => {
				y = !0, A();
			});
			p.append(e, t);
		}
		e?.label === "法术" && p.append(m), A();
		let t = E.get(e);
		(t && t.offsetLeft + t.offsetWidth > d.scrollLeft + d.clientWidth || t && t.offsetLeft < d.scrollLeft) && (d.scrollLeft = t.offsetLeft);
	}
	function A() {
		let t = v && (y ? v.shop : v.name), n = t ? o.get(t) : void 0;
		for (let e of o.values()) e.tab.wrpTab.classList.toggle("p6-builder-inactive", e !== n);
		n && e.activeTab_ !== n.tab && (e.activeTab_ = n.tab), f.hidden = !!v, S.hidden = !v, T.hidden = !!v, C.disabled = v === c[0];
		for (let [e, t] of [...p.children].entries()) t.setAttribute("aria-pressed", String(!!e === y));
		ae();
	}
	function re() {
		let t = qr(e), r = K("dl", "p6-builder-summary"), i = K("div", "p6-builder-todo"), a = K("div", "p6-builder-todo");
		for (let e of c.filter(D)) {
			let o = t.get(O(e)), s = n.filter((t) => t.category === e.prop).flatMap((e) => e.chosen()?.label.name ?? []);
			(s.length || o?.text) && r.append(K("dt", "", e.label), K("dd", "", [...s, o?.text].filter(Boolean).join(" · ")));
			let c = o?.pending || e.prop && !s.length;
			if (c || o?.text.includes("可继续选择")) {
				let t = K("div", "p6-builder-todo-row");
				t.append(K("span", "", c ? o?.text ?? `还没选${e.label}` : o?.text), q("去填", () => k(e))), (o?.pending ? i : a).append(t);
			}
			for (let t of j(e)) {
				if (Number(t.dataset.missing) < 1) continue;
				let n = K("div", "p6-builder-todo-row");
				n.append(K("span", "", `${e.label} · ${t.textContent}`), q("去填", () => k(e))), a.append(n);
			}
		}
		f.replaceChildren(K("h2", "", w || "检查后创建"), r);
		for (let [e, t] of [[i, "创建前要处理"], [a, "还可以选择"]]) e.childElementCount && (e.prepend(K("b", "", `${t}（${e.childElementCount}）`)), f.append(e));
	}
	function j(e) {
		return e.prop === "subclass" ? [] : [...o.get(e.name)?.form.querySelectorAll(".p6-choice-progress") ?? []].filter((e) => !e.closest(".ve-hidden"));
	}
	async function ie() {
		if (b) return;
		let t = qr(e), n = c.filter(D).find((e) => t.get(O(e))?.pending), r = t.get("装备商店");
		if (n || r?.pending) {
			let e = n ?? c.find((e) => e.shop);
			k(e), !n && r?.pending && (y = !0, A()), g.textContent = (n ? t.get(O(e))?.text : r?.text) ?? "";
		} else {
			b = !0, T.disabled = !0;
			try {
				await i();
			} catch (e) {
				g.textContent = e instanceof Error ? e.message : "作者建卡失败";
			} finally {
				b = !1, T.disabled = !1;
			}
		}
	}
	function ae() {
		ri(e);
		for (let e = n.length - 1; e >= 0; e--) n[e].anchor.isConnected || (n[e].element.remove(), n.splice(e, 1));
		let t = qr(e), i = 1;
		m.textContent = t.get("法术")?.text ?? "本次可在下方选择法术";
		for (let [e, r] of E) {
			r.hidden = !!e && !D(e), e === v ? r.setAttribute("aria-current", "step") : r.removeAttribute("aria-current");
			let a = e && n.some((t) => t.category === e.prop && t.chosen()), o = e && t.get(O(e)), s = !!(o?.pending === !1 || o && !o.pending && !o.text.includes("可继续选择") || a && !o) && !!e && j(e).every((e) => e.dataset.done === "true");
			r.dataset.done = String(s), r.hidden || (i += 1, r.firstElementChild.textContent = s && e !== v ? "✓" : String(i));
		}
		if (!v) {
			re();
			return;
		}
		let a = o.get(y ? v.shop : v.name);
		if (!a) return;
		let s = n.filter((e) => a.form.contains(e.anchor));
		for (let e of s) e.element.isConnected || e.mount(a.rail), e.element.hidden = e.category !== v.prop;
		let c = s.filter((e) => e.category === v.prop), l = te.get(v.prop ?? ""), u = l && c.includes(l) ? l : c[0];
		a.rail.hidden = !u, a.tab.wrpTab.classList.toggle("p6-builder-split", !!u), ee !== v && (ee = v, a.tab.wrpTab.dataset.view = u?.chosen() ? "card" : "list"), a.tab.wrpTab.classList.toggle("p6-builder-spells", v.label === "法术"), a.tab.wrpTab.classList.toggle("p6-builder-attributes", v.label === "属性值"), a.tab.wrpTab.classList.toggle("p6-builder-equipment", !!v.shop && !y), pi(a, u), $r(a.form, r), v.label === "属性值" && ti(a.form, e, r);
	}
	function M() {
		x ||= requestAnimationFrame(() => {
			x = 0, ae();
		});
	}
	function oe(e) {
		let t = n.find((t) => t.element === e.target);
		t && te.set(t.category, t);
		let r = e.target.closest(".p6-builder-step");
		r && (r.dataset.view = "card");
	}
	let N = new MutationObserver(M);
	for (let e of o.values()) N.observe(e.form, {
		childList: !0,
		subtree: !0
	});
	return t.addEventListener("p6-picker-change", M), t.addEventListener("p6-picker-preview", oe), t.addEventListener("p6-choice-change", M), t.addEventListener("change", M), t.addEventListener("click", M), k(v), () => {
		N.disconnect(), cancelAnimationFrame(x), t.removeEventListener("p6-picker-change", M), t.removeEventListener("p6-picker-preview", oe), t.removeEventListener("p6-choice-change", M), t.removeEventListener("change", M), t.removeEventListener("click", M);
	};
}
function hi(e, t) {
	let n = e.ActorCharactermancer.Component.prototype, r = n._pRender, i = n._pHandleSaveClick_postSave, a = !1, o, s = !1, c, l = [], u = t ? ei(e, t) : void 0, d = t ? ui(e.Charactermancer_AvailableEquipmentInfo, t) : void 0, f = t ? si(e, t, (e) => l.push(e)) : void 0;
	n._pHandleSaveClick_postSave = async function(...e) {
		let t = await i.apply(this, e);
		return a = !0, t;
	};
	let p = n._pHandleSaveClick_getClosure_handleFailure;
	return n._pHandleSaveClick_getClosure_handleFailure = function(...e) {
		return s = !0, p.apply(this, e);
	}, t && (n._pRender = async function(e) {
		await r.call(this, e);
		try {
			c?.(), c = mi(this, e, l, t, async () => {
				if (await this._pHandleSaveClick(), s) throw Error("作者未完成建卡，请关掉本次草稿重试。");
			});
		} catch (t) {
			o = t, console.error("完整建卡器界面加载失败", t);
			let n = K("p", "p6-builder-feedback", "无法加载分步建卡，请关闭草稿后重试。");
			n.setAttribute("role", "alert"), e.prepend(n);
		}
	}), {
		completed: () => a && !s,
		error: () => o ?? (s ? /* @__PURE__ */ Error("作者中断了建卡，草稿未存入战役。") : void 0),
		close() {
			c?.(), f?.(), u?.(), d?.(), n._pRender = r, n._pHandleSaveClick_postSave = i, n._pHandleSaveClick_getClosure_handleFailure = p;
		}
	};
}
// src/rules/kernel/frame/commands-native.ts
var J = globalThis, gi = (e) => new Promise((t) => setTimeout(t, e));
function _i(e) {
	return { nativeBuild: (t) => e([], async () => {
		let e = J.game.modules.get("plutonium")?.api;
		if (typeof e?.charactermancer?.pOpen != "function") throw Error("这份 Plutonium 没有完整建卡器（需要本机私人完整版，放在 vendor/private/modules/plutonium/）");
		let n = J.game.actors.get(t.id);
		if (!n) throw Error(`草稿人不在：${t.id}`);
		if (t.presentation && !Oe) throw Error("当前私人完整版和分步建卡支持的版本不一致");
		await J.ExcludeUtil.pInitialise(), await J.ExcludeUtil.pSetList([...J.ExcludeUtil.getList(), ...structuredClone(t.excludes)]);
		let r = new URL(".", location.href).href;
		if (await e.config.setValue("dataSources", "localHomebrew", t.brewFiles.map((e) => r + e)) === !1) throw Error("作者不让登记本战役自制包（dataSources.localHomebrew）");
		let i = JSON.stringify(n.toObject()), a = Oe && hi(Oe, t.presentation), o = /* @__PURE__ */ new Set(), s = () => void 0, c = J.Hooks.on("renderApplicationV2", (e) => {
			o.add(e);
		}), l = J.Hooks.on("closeApplicationV2", (e) => {
			o.delete(e), o.size || s();
		});
		try {
			for (await e.charactermancer.pOpen({ actor: n }); await gi(500), o.size;) await new Promise((e) => {
				s = e, o.size || e();
			});
		} finally {
			J.Hooks.off("renderApplicationV2", c), J.Hooks.off("closeApplicationV2", l), a?.close();
		}
		await C();
		let u = n.toObject(), d = a?.error();
		if (d) throw d;
		return (a ? a.completed() : JSON.stringify(u) !== i) ? {
			built: !0,
			data: u
		} : { built: !1 };
	}, [], { ui: !0 }) };
}
// src/rules/kernel/frame/commands.ts
var Y = globalThis, vi = class extends Error {
	request;
	constructor(e) {
		super("KERNEL_NEEDS_DICE"), this.request = e;
	}
}, yi = class extends Error {
	where;
	constructor(e) {
		super("KERNEL_NEEDS_INPUT"), this.where = e;
	}
};
function bi(e, t) {
	let n = Y.CONFIG.Dice, r = n.randomUniform, i = Y.foundry.dice.terms.Die.prototype, a = Object.hasOwn(i, "roll"), o = i.roll, s = 0, c = 0;
	i.roll = function(...e) {
		return c = this.faces, o.apply(this, e);
	}, n.randomUniform = () => {
		if (s >= e.length) throw new vi({
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
		if (l(), e instanceof vi) return {
			used: s,
			needs: e.request
		};
		if (e instanceof yi) return {
			used: s,
			input: e.where
		};
		throw e;
	});
}
async function xi(e) {
	let t = Y.game.socket, n = t.emit, r = [];
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
function Si(e) {
	let t = Y.foundry.applications.api.ApplicationV2.prototype, n = t.render;
	return t.render = function() {
		throw new yi(this.constructor.name);
	}, e().finally(() => {
		t.render = n;
	});
}
function Ci(e) {
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
var X = (e) => Y.game.actors.get(e, { strict: !0 });
function wi(e) {
	let t = {};
	for (let n of e) {
		if (n.action !== "update" || n.type !== "Actor" || n.parentUuid) continue;
		let e = Y.game.actors.get(n.data._id);
		if (e?._prepareActiveEffectAttributions) for (let r of Object.keys(Y.foundry.utils.flattenObject(n.data)).filter((e) => e.startsWith("system."))) {
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
async function Z(e, t, n = [], { ui: r = !1 } = {}) {
	let i, a = [];
	try {
		({value: i, changes: a} = await xi(() => bi(e, () => r ? t() : Si(t)).then(async (e) => (await C(), e))));
	} catch (e) {
		return {
			status: "error",
			error: e instanceof Error ? e.message : String(e),
			stack: e instanceof Error ? e.stack ?? null : null,
			changes: a
		};
	}
	let o = n.flatMap((e) => de(X(e))), s = i.value;
	return {
		status: i.needs ? "missing" : i.input ? "pending" : s?.kernelStatus ?? (o.length ? "unsupported" : "complete"),
		result: s ?? null,
		sources: wi(a),
		changes: a,
		diceUsed: i.used,
		missing: i.needs ? { dice: i.needs } : i.missing ?? null,
		pending: i.input ? { input: i.input } : s?.pending ?? null,
		unsupported: o
	};
}
var Ti = ge(Z, X), Ei = Ce(Z, X), Di = bt(Z), Oi = ur(Z, X), ki = fr(Z, X), Ai = hr(Z), ji = Ur(Z, X, Ci), Mi = Ar(Z), Ni = hn(Z), Pi = Kr(Z), Fi = _i(Z), Ii = [
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
], Li;
function Ri() {
	return Li ??= (async () => {
		let e = await (await fetch(new URL("modules/plutonium/js/Bundle.js", document.baseURI))).text(), t = Object.getPrototypeOf(async () => void 0).constructor, n = await new t(`${e}\n;return { ${Ii.join(", ")} };`)();
		return n.Config._CONFIG_TEMP = {
			dataSources: { baseSiteUrl: new URL(".", document.baseURI).href },
			misc: { rulesVersion: "classic" }
		}, n.ConfigConsts.prePreInit({ implRegistryImportList: n.ImplementationRegistryImportList.get() }), n.Config._CONFIG = n.Config.api_getDefaults(), n.Config._CONFIG_PLAYER = n.Config._getDefaultPlayerConfig(), n.Vetools.prePreInit_preConfig(), n.VetoolsLinks.prePreInit_postConfig(), n.Vetools.prePreInit_postConfig(), n.UtilDamageTypes.init(), n.Dnd5eUtil.init(), n.Vetools.init(), n.SideDataInterfaces.init(), n;
	})();
}
var zi = { configure: !1 }, Bi = 15e3, Vi = { create: !1 }, Hi = {
	...Pi,
	...Fi,
	...Ti,
	...Ei,
	...Di,
	...Oi,
	...ki,
	...Ai,
	...ji,
	...Mi,
	...Ni,
	roll: (e, t = {}, n = [], r = {}) => Z(n, async () => {
		let n = {
			basic: Y.CONFIG.Dice.BasicRoll,
			d20: Y.CONFIG.Dice.D20Roll,
			damage: Y.CONFIG.Dice.DamageRoll
		}, i = new (r.kind ? n[r.kind] : Y.Roll)(e, t, r.options ? structuredClone(r.options) : void 0);
		return await i.evaluate({ allowInteractive: !1 }), Ci(i);
	}),
	damage: (e, t, n = [], r = {}) => Z(n, async () => {
		let n = X(e);
		return await n.applyDamage(t, r), { hp: n.system.attributes.hp.toObject?.() ?? { ...n.system.attributes.hp } };
	}, [e]),
	rest: (e, t, n = [], r = {}) => Z(n, async () => {
		let n = await X(e)[t === "short" ? "shortRest" : "longRest"]({
			dialog: !1,
			chat: !1,
			...r
		});
		return n ? JSON.parse(JSON.stringify(n, (e, t) => e === "clone" ? void 0 : t)) : null;
	}, [e]),
	save: (e, t, n = []) => Z(n, async () => (await X(e).rollSavingThrow({ ability: t }, zi, Vi))?.map(Ci) ?? null, [e]),
	skill: (e, t, n = []) => Z(n, async () => (await X(e).rollSkill({ skill: t }, zi, Vi))?.map(Ci) ?? null, [e]),
	attack: (e, t, n = []) => Z(n, async () => {
		let n = X(e).items.get(t, { strict: !0 }).system.activities.find((e) => e.type === "attack");
		if (!n) return null;
		let r = await n.rollAttack({}, zi, Vi), i = await n.rollDamage({}, zi, Vi);
		return {
			attack: r?.map(Ci) ?? null,
			damage: i?.map(Ci) ?? null
		};
	}, [e]),
	attribution: (e, t) => Object.fromEntries(t.map((t) => [t, (X(e)._prepareActiveEffectAttributions(t) ?? []).map((e) => ({
		label: e.label,
		mode: e.mode,
		value: e.value
	}))])),
	unsupported: () => Y.game.actors.contents.flatMap((e) => de(e)),
	convert: async (e, t, n = {}) => {
		let r = await Ri(), i = {
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
				t = setTimeout(() => n(Error(`PROBE_TIMEOUT ${Bi}`)), Bi);
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
}, Ui = (e) => e instanceof Error ? e.message : String(e);
async function Wi(e, t, n) {
	let i = (e) => e.pack.docIdLocal, a = /* @__PURE__ */ new Map();
	if (await n(e) === null) return {
		accepted: e,
		errors: a
	};
	let s = (n, i, a) => {
		let s = new Set(i), c = (n) => {
			if (!s.has(n)) {
				s.add(n);
				for (let i of r(n.pack)) {
					if (o(i, t, [...s].map((e) => e.pack))) continue;
					let n = e.find((e) => !a.has(e) && o(i, t, [e.pack]));
					n && c(n);
				}
			}
		};
		return c(n), e.filter((e) => s.has(e));
	}, c = /* @__PURE__ */ new Set();
	for (let t of e) {
		let e = await n(s(t, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set()));
		e !== null && (c.add(t), a.set(i(t), e));
	}
	let l = /* @__PURE__ */ new Set(), u = async (e) => {
		if (l.has(e)) return;
		let t = s(e, l, c), r = await n(t);
		if (r !== null) a.set(i(e), r);
		else {
			l = new Set(t);
			for (let e of t) a.delete(i(e));
		}
	};
	for (let t of e) c.has(t) || await u(t);
	for (let t of e) c.has(t) && await u(t);
	return {
		accepted: e.filter((e) => l.has(e)),
		errors: a
	};
}
async function Gi(e, t) {
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
	], l = c.map((e) => o[e]), u = new Set(Object.values(r).filter((e) => typeof e?.pMergeCopy == "function")), { accepted: d, errors: f } = await Wi(e, new Set(Object.keys(i.SOURCE_JSON_TO_FULL).map((e) => e.toLowerCase())), async (e) => {
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
			return Ui(e);
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
// src/rules/kernel/frame/module-roots.ts
var Ki = globalThis;
function qi(e, t) {
	if (!e) return null;
	let n = new URL(".", location.href);
	if (t.origin !== n.origin || !t.pathname.startsWith(n.pathname)) return null;
	let r = decodeURIComponent(t.pathname.slice(n.pathname.length));
	for (let [i, a] of Object.entries(e)) {
		let e = `modules/${i}/`;
		if (r.startsWith(e)) return new URL(a + r.slice(e.length) + t.search, n);
	}
	return null;
}
function Ji(e) {
	if (!e || !Object.keys(e).length) return;
	let t = Ki.fetch.bind(Ki);
	Ki.fetch = async (n, r) => {
		let i = typeof n == "string" ? n : n instanceof URL ? n.href : n.url, a = qi(e, new URL(i, location.href));
		if (!a) return t(n, r);
		let o = await t(n instanceof Request ? new Request(a, n) : a, r);
		return o.status === 404 ? t(n, r) : o;
	};
}
// src/ui/styles/build-frame.css?inline
var Yi = "html,body{color:var(--text);font-family:var(--font-sans);font-size:var(--fs-md);line-height:var(--lh-ui);--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;background:var(--bg)!important}@media (prefers-color-scheme:dark){html,body{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark}}body,.application,.window-app{--background:var(--surface);--color-header-background:var(--head-bg);--color-border:var(--line);--color-tabs-border:var(--line);--color-fieldset-border:var(--line);--color-form-hint:var(--text3);--color-form-hint-hover:var(--text2);--color-form-label:var(--text2);--color-form-label-hover:var(--text);--color-text-emphatic:var(--text);--color-text-primary:var(--text);--color-text-secondary:var(--text2);--color-text-subtle:var(--text3);--color-text-selection:var(--text);--color-text-selection-bg:var(--primary-tint);--table-background-color:var(--surface);--table-header-bg-color:var(--bg-sunk);--table-header-border-color:var(--line);--table-header-text-color:var(--text);--table-row-color-even:var(--bg-sunk);--table-row-color-odd:transparent;--table-row-color-highlight:var(--primary-tint);--content-link-background:var(--primary-tint);--content-link-border-color:var(--primary-tint-line);--content-link-text-color:var(--primary-text);--content-link-icon-color:var(--primary-text);--color-text-dark-primary:var(--text);--hotbar-height:0px;--color-scheme:light}@media (prefers-color-scheme:dark){body,.application,.window-app{--color-scheme:dark}}.application,.window-app{overflow:hidden;color-scheme:var(--color-scheme)!important;background:var(--surface)!important;color:var(--text)!important;font-family:var(--font-sans)!important;border:var(--border) solid var(--line)!important;border-radius:var(--r-lg)!important;box-shadow:var(--shadow-3)!important}.application .window-header,.window-app .window-header{min-height:var(--hit);background:var(--head-bg)!important;color:var(--head-ink)!important;border:0!important;border-bottom:var(--border) solid var(--head-line)!important;font-family:var(--font-sans)!important;font-size:var(--fs-md)!important;padding:0 var(--sp-3)!important}.window-title{font-family:var(--font-sans)!important;font-size:var(--fs-md)!important;font-weight:var(--fw-semibold)!important;color:inherit!important}.window-header button,.window-header .header-control,.window-header a{box-shadow:none!important;color:var(--head-ink2)!important;background:0 0!important;border:0!important;min-height:0!important}.window-header button:hover,.window-header .header-control:hover,.window-header a:hover{color:var(--head-ink)!important;background:var(--head-hover)!important}.window-content{background:var(--surface)!important;color:var(--text)!important;-webkit-backdrop-filter:none!important;font-family:var(--font-sans)!important;font-size:var(--fs-md)!important}.window-resize-handle{opacity:.5;filter:none!important}.ve-app-window,.ve-window,.ve-ui-modal__overlay,.ve-hwin,.ve-ui-tab-side__wrp-tab{background:var(--surface)!important;color:var(--text)!important}.window-content a{color:var(--primary-text)!important}.window-content hr{border:0!important;border-top:var(--border) solid var(--line)!important;background:0 0!important}.window-content h1,.window-content h2,.window-content h3,.window-content h4,.window-content h5{border:0;color:var(--text)!important;font-family:var(--font-sans)!important;text-shadow:none!important}.window-content table,.window-content th,.window-content td{color:var(--text)!important;border-color:var(--line)!important}.window-content button,.window-content .ve-btn{font:inherit;min-height:30px;padding:0 var(--sp-3);cursor:pointer;font-size:var(--fs-sm)!important;border:var(--border) solid var(--line-ctrl)!important;border-radius:var(--r-sm)!important;background:var(--surface)!important;color:var(--text)!important;box-shadow:none!important;text-shadow:none!important;background-image:none!important}.window-content button:hover,.window-content .ve-btn:hover{background:var(--bg-hover)!important}.window-content .ve-btn-primary,.window-content button.ve-btn-primary{background:var(--primary)!important;border-color:var(--primary)!important;color:var(--on-primary)!important}.window-content .ve-btn-primary:hover{background:var(--primary-hover)!important}.window-content .ve-btn.active,.window-content button.active{background:var(--primary-tint)!important;border-color:var(--primary-tint-line)!important;color:var(--primary-text)!important}.window-content button:disabled,.window-content .ve-btn:disabled{opacity:.5;cursor:default}.window-content input[type=text],.window-content input[type=number],.window-content input[type=search],.window-content select,.window-content textarea{font:inherit;min-height:30px;font-size:var(--fs-sm)!important;color:var(--text)!important;background:var(--surface)!important;border:var(--border) solid var(--line-ctrl)!important;border-radius:var(--r-sm)!important;box-shadow:none!important}.window-content input[type=checkbox],.window-content input[type=radio]{accent-color:var(--primary)}.window-content button:focus-visible,.window-content input:focus-visible,.window-content select:focus-visible,.window-content textarea:focus-visible{outline-offset:1px;outline:2px solid var(--focus)!important}.window-content .ve-muted,.window-content .ve-text-muted{color:var(--text2)!important}", Xi = ".application.trpg-main{box-shadow:none!important;border:0!important;border-radius:0!important}.application.trpg-main>.window-header{display:none!important}.application.trpg-main>.window-content{padding:0!important}.application:not(.trpg-main)>.window-header{min-height:52px;background:var(--surface)!important;color:var(--text)!important;border-bottom:var(--border) solid var(--line)!important;padding:0 var(--sp-3) 0 var(--sp-5)!important}.application:not(.trpg-main) .window-title{font-size:var(--fs-xl)!important}.window-header [data-action=close]{border-radius:var(--r-sm);width:32px;height:32px;color:var(--text2)!important;font-size:0!important}.window-header [data-action=close]:before{content:\"✕\";font:16px/1 var(--font-sans)}.window-header [data-action=close]:hover{background:var(--bg-hover)!important;color:var(--text)!important}.ve-ui-tab__wrp-tab-heads--border{gap:var(--sp-1);counter-reset:trpg-step;flex-wrap:wrap;padding:var(--sp-3) var(--sp-4)!important;border:0!important;border-bottom:var(--border) solid var(--line)!important;background:var(--surface)!important;display:flex!important}.window-content .ve-ui-tab__btn-tab-head{counter-increment:trpg-step;align-items:center;gap:var(--sp-2);min-height:32px!important;padding:0 var(--sp-3)!important;border-radius:var(--r-pill)!important;color:var(--text2)!important;font-size:var(--fs-sm)!important;background:0 0!important;border:0!important;width:auto!important;transition:none!important;display:inline-flex!important}.window-content .ve-ui-tab__btn-tab-head:before{content:counter(trpg-step);border:var(--border) solid var(--line-ctrl);width:20px;height:20px;font-size:var(--fs-xs);border-radius:50%;place-items:center;display:inline-grid}.window-content .ve-ui-tab__btn-tab-head:hover{background:var(--bg-hover)!important}.window-content .ve-ui-tab__btn-tab-head.ve-active{font-weight:var(--fw-semibold);background:var(--primary)!important;color:var(--on-primary)!important}.window-content .ve-ui-tab__btn-tab-head.ve-active:before{border-color:currentColor}.window-content hr.ve-hr-1.ve-w-100:has(+.ve-flex-h-right){display:none}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary){gap:var(--sp-2);border-top:var(--border) solid var(--line-ctrl);padding:var(--sp-3) var(--sp-4)!important;background:var(--bg-side)!important}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary) .ve-btn{font-weight:var(--fw-semibold);min-height:var(--hit)!important;padding:0 var(--sp-5)!important;font-size:var(--fs-md)!important}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary) .ve-btn-group{gap:var(--sp-2)}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary) .ve-vr-2{display:none}.window-content .ve-flex-col:has(>hr.ve-hr-2:first-child){padding:var(--sp-3) 0;border:0;border-top:var(--border) solid var(--line);border-radius:0;margin:0;background:0 0!important}.window-content .ve-flex-col>hr.ve-hr-2:first-child{display:none}.window-content .ve-bold{font-weight:var(--fw-semibold)}.window-content .veapp__bg-foundry{background:var(--surface)!important}.window-content .stripe-even,.window-content .stripe-odd,.window-content .stripe-odd-table tr,.window-content .ve-cls-tbl__stripe-odd,.window-content .stripe-odd-table tbody tr:nth-child(odd){background:0 0!important}.window-content input[type=checkbox],.window-content input[type=radio]{accent-color:var(--primary);margin:0;appearance:auto!important;background:0 0!important;border:0!important;width:16px!important;height:16px!important}.window-content input[type=checkbox]:before,.window-content input[type=checkbox]:after,.window-content input[type=radio]:before,.window-content input[type=radio]:after{content:none!important;display:none!important}:is(.window-content label:not(.p6-choice-option):has(>label>input[type=checkbox]),.window-content label:not(.p6-choice-option):has(>label>input[type=radio])){margin:0 0 var(--sp-1);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);cursor:pointer;padding:var(--sp-1) var(--sp-2)!important;background:var(--surface)!important}.window-content label:not(.p6-choice-option):has(>label>input:checked){border-color:var(--primary);background:var(--primary-tint)!important}.window-content .veapp__list-row,.window-content .manc__list-row{border-bottom:var(--border) solid var(--line);align-items:center;min-height:36px;background:var(--surface)!important}.window-content .veapp__list-row-hoverable:hover,.window-content .manc__list-row:hover{background:var(--bg-hover)!important}.window-content .veapp__list-row:has(input:checked){box-shadow:inset 3px 0 0 var(--primary);font-weight:var(--fw-semibold);background:var(--primary-tint)!important}:is(.window-content .ve-input-group:has(>.ve-btn-5et)>.ve-btn,.window-content .sortlabel .ve-btn,.window-content .ve-btn.sort){font-weight:var(--fw-semibold);background:var(--bg-sunk)!important;border-color:var(--line)!important;color:var(--text2)!important;font-size:var(--fs-xs)!important;border-radius:0!important}.window-content .manc-sp__btn-learn-spell,.window-content .manc-sp__btn-prepare,.window-content .ve-fltr__mini-pill{border-radius:var(--r-sm)!important}.window-content .manc-sp__btn-learn-spell.ve-active,.window-content .manc-sp__btn-prepare.ve-active,.window-content .ve-btn.ve-active:not(.ve-ui-tab__btn-tab-head){background:var(--primary)!important;border-color:var(--primary)!important;color:var(--on-primary)!important}.window-content .ve-fltr__mini-pill{background:var(--primary-tint)!important;border:var(--border) solid var(--primary-tint-line)!important;color:var(--primary-text)!important}.window-content .ve-ui-sel2__ipt-display,.window-content .ve-ui-sel2__ipt-search{min-height:var(--hit)!important;padding:0 var(--sp-3)!important;background:var(--surface)!important;color:var(--text)!important;font-size:var(--fs-md)!important}.window-content .ve-ui-sel2__wrp-options{border-radius:var(--r-sm);box-shadow:var(--shadow-2);z-index:20;background:var(--surface)!important;border:var(--border) solid var(--line-ctrl)!important}.window-content .ve-ui-sel2__disp-option{border-bottom:var(--border) solid var(--line);min-height:40px;font-weight:var(--fw-semibold);padding:0 var(--sp-4)!important;background:var(--surface)!important;color:var(--text)!important}.window-content .ve-ui-sel2__disp-option:hover,.window-content .ve-ui-sel2__disp-option:focus{box-shadow:inset 3px 0 0 var(--primary);outline:0;background:var(--bg-hover)!important}.window-content .ve-rd__h,.window-content .entry-title-inner,.window-content .ve-rd__h .entry-title-inner{font-family:var(--font-sans)!important;font-variant:normal!important;font-weight:var(--fw-semibold)!important;letter-spacing:0!important;color:var(--text)!important}.window-content table th,.window-content .ve-rd__table thead th,.window-content .ve-cls-tbl th{font-weight:var(--fw-semibold);font-size:var(--fs-xs);background:var(--bg-sunk)!important;color:var(--text2)!important}.window-content table td,.window-content table th{padding:var(--sp-1) var(--sp-2);border:0!important;border-bottom:var(--border) solid var(--line)!important}.window-content table{background:var(--surface)!important;color:var(--text)!important;font-family:var(--font-sans)!important;border-color:var(--line)!important}.window-content table tr{background:0 0!important}.window-content .ve-tbl-border{background:var(--line)!important}.window-content .ve-stats__th-name{background:var(--surface)!important;border-bottom:var(--border) solid var(--line)!important}.window-content .ve-stats__h-name{font-family:var(--font-sans)!important;font-variant:normal!important;font-size:var(--fs-lg)!important;font-weight:var(--fw-semibold)!important;color:var(--text)!important}.window-content .ve-stats__wrp-h-source,.window-content .ve-stats__wrp-h-source a{font-family:var(--font-sans)!important;font-size:var(--fs-xs)!important;color:var(--text3)!important}.application.trpg-main .ve-ui-tab__wrp-tab-body{padding:var(--sp-3) var(--sp-4)!important;background:var(--surface)!important;border:0!important}.window-content input[readonly],.window-content input:disabled{background:var(--bg-sunk)!important;border-color:var(--line)!important;color:var(--text2)!important}", Zi = ".p6-builder{width:100%;height:100%;min-height:0;font-family:var(--font-sans);flex-direction:column;display:flex}.p6-builder [hidden],.p6-builder .p6-builder-inactive{display:none!important}.p6-builder-nav{align-items:center;gap:var(--sp-1);padding:var(--sp-3) var(--sp-4);border-bottom:var(--border) solid var(--line);flex:none;display:flex;overflow-x:auto}.p6-builder button.p6-builder-tab,.p6-builder button.p6-builder-btn,.p6-builder button.p6-picker-row{color:var(--text);background:var(--surface);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);min-height:var(--hit);padding:0 var(--sp-3);font:inherit;cursor:pointer;transition:none}.p6-builder button.p6-builder-btn:hover,.p6-builder button.p6-builder-tab:hover,.p6-builder button.p6-picker-row:hover{background:var(--bg-hover)}.p6-builder .p6-builder-tab{align-items:center;gap:var(--sp-2);white-space:nowrap;flex:none;display:inline-flex}.p6-builder button.p6-builder-tab{min-height:32px;color:var(--text2);font-size:var(--fs-sm);border-radius:var(--r-pill)!important;background:0 0!important;border-color:#0000!important}.p6-builder button.p6-builder-tab:hover{background:var(--bg-hover)!important}.p6-builder-tab i{border:var(--border) solid var(--line-ctrl);border-radius:50%;place-items:center;width:20px;height:20px;font-style:normal;display:inline-grid}.p6-builder .p6-builder-tab[data-done=true] i{background:var(--primary);color:var(--on-primary);border-color:var(--primary)}.p6-builder .p6-builder-past{padding:0 var(--sp-3);color:var(--text2);font-size:var(--fs-sm)}.p6-builder button.p6-builder-tab[aria-current],.p6-builder button.p6-builder-primary,.p6-builder button.p6-builder-btn[aria-pressed=true]{background:var(--primary)!important;color:var(--on-primary)!important}.p6-builder button.p6-builder-tab[aria-current] i{border-color:currentColor}.p6-builder button:disabled{cursor:not-allowed}.p6-builder button.p6-builder-btn:disabled{opacity:.55}.p6-builder .p6-builder-step{flex-direction:column;flex:1;min-height:0;display:flex;overflow:hidden;padding:0!important}.p6-builder .p6-builder-split:not(.p6-builder-inactive){grid-template-columns:minmax(175px,5fr) minmax(0,7fr);display:grid!important}.p6-builder-panel{flex-direction:column;min-width:0;min-height:0;display:flex;overflow:auto}.p6-native-body{padding:var(--sp-3) var(--sp-4);min-width:0}.p6-builder-selection{align-items:center;gap:var(--sp-2);padding:var(--sp-2) var(--sp-3);z-index:2;background:var(--surface);border-bottom:var(--border) solid var(--line);flex-wrap:wrap;flex:none;display:flex;position:sticky;top:0}.p6-builder-selection-title{min-width:4em;font-size:var(--fs-lg);font-weight:var(--fw-semibold);flex:1;margin:0}.p6-builder-selection .p6-builder-btn{min-height:32px!important}.p6-builder-split .p6-native-body>.ve-flex{flex-direction:column;height:auto!important}.p6-builder-split .p6-native-body>.ve-flex>.ve-flex-col{width:100%!important;overflow:visible!important}.p6-builder-split .p6-native-body>.ve-flex>.ve-vr-1{display:none!important}.p6-builder-split .p6-native-body>.ve-flex:has(>.ve-vr-1)>.ve-vr-1+.ve-flex-col{display:none!important}.p6-builder-rail{border-right:var(--border) solid var(--line);min-width:0;min-height:0}.p6-picker{flex-direction:column;height:100%;min-height:0;display:flex}.p6-picker-search{min-height:var(--hit);width:auto;margin:var(--sp-3) var(--sp-4) var(--sp-2);color:var(--text);background:var(--surface);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);flex:none}.p6-picker-list{flex-direction:column;flex:1;min-height:0;display:flex;overflow:auto}.p6-builder button.p6-picker-row{justify-content:space-between;align-items:center;gap:var(--sp-2);text-align:left;flex:none;width:100%;display:flex;border:0!important;border-bottom:var(--border) solid var(--line)!important;border-radius:0!important}.p6-builder button.p6-picker-row[data-preview=true]{background:var(--primary-tint)!important;box-shadow:inset 2px 0 var(--accent)!important}.p6-builder .p6-picker-row[aria-pressed=true] .p6-picker-source:before{content:\"✓\";margin-right:var(--sp-2);color:var(--text)}.p6-picker-source,.p6-picker-status{color:var(--text2);font-size:var(--fs-xs)}.p6-picker-status{padding:var(--sp-2) var(--sp-4);flex:none;margin:0}.p6-builder-footer{justify-content:flex-end;align-items:center;gap:var(--sp-2);padding:var(--sp-3) var(--sp-4);background:var(--bg-side);border-top:var(--border) solid var(--line);flex-wrap:wrap;flex:none;display:flex}.p6-builder-hint{color:var(--text2);font-size:var(--fs-xs);margin-right:auto}.p6-builder-feedback{color:var(--danger-text);flex-basis:100%;margin:0}.p6-builder-feedback:empty{display:none}.p6-builder-switch{gap:var(--sp-2);padding:var(--sp-2) var(--sp-4);border-bottom:var(--border) solid var(--line);display:flex}.p6-builder-review{min-height:0;padding:var(--sp-4) var(--sp-5);flex:1;overflow:auto}.p6-builder-review h2{margin:0 0 var(--sp-4);font-size:var(--fs-xl)}.p6-builder-summary{gap:var(--sp-2) var(--sp-3);grid-template-columns:minmax(64px,100px) 1fr;margin:0;display:grid}.p6-builder-summary dt{color:var(--text2)}.p6-builder-summary dd{margin:0}.p6-builder-todo{margin-top:var(--sp-4);padding:var(--sp-3);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);background:var(--warn-bg)}.p6-builder-todo-row{justify-content:space-between;gap:var(--sp-2);padding-top:var(--sp-2);align-items:center;display:flex}.p6-level{justify-content:space-between;align-items:center;gap:var(--sp-2);padding:var(--sp-1) 0;display:flex}.p6-level select{width:auto;min-height:34px;padding:0 var(--sp-3)}.p6-choice-progress{color:var(--accent-text);width:100%}.p6-choice-progress[data-done=true]{color:var(--success-text)}.p6-builder button[title]:has(>.fa-magnifying-glass:only-child){width:auto!important;padding-inline:var(--sp-2)!important}.p6-builder button[title]:has(>.fa-magnifying-glass:only-child):after{content:attr(title)}.window-content button.ve-btn-xxs:has(>.fa-check:only-child){width:auto!important;padding-inline:var(--sp-2)!important}.window-content button.ve-btn-xxs:has(>.fa-check:only-child):after{content:\"选择\"}.p6-builder-spells .p6-native-body>.ve-flex{flex-direction:column;height:auto!important}.p6-builder-spells .p6-native-body>.ve-flex>.ve-flex-col{flex:none!important;height:auto!important;overflow:visible!important}.p6-builder-spells .p6-native-body>.ve-flex>.ve-vr-1,.p6-builder-spells .manc__list-row>:is(:nth-child(2),:nth-child(3),:nth-child(4),:nth-child(5),:nth-child(6)){display:none!important}.p6-builder-spells .p6-native-body .manc__list:has(.manc__list-row)~.ve-input-group{display:none!important}.p6-builder-spells .manc__list-row{gap:var(--sp-2);min-height:var(--hit);justify-content:space-between}.p6-builder-spells .manc__list-row>:first-child{flex:1;width:auto!important}.p6-builder-spells .manc__list-row>:nth-child(7){flex:0 0 4.5em;text-align:right!important;width:auto!important}.p6-builder-spells .manc__list-row>:last-child{gap:var(--sp-1);flex:none;display:flex;width:auto!important}@media (width<=520px){.p6-builder-rail{border-right:0}.p6-builder-nav,.p6-builder-footer,.p6-builder-review{padding-inline:var(--sp-3)}.p6-builder-attributes .p6-native-body{padding-inline:var(--sp-2);overflow-x:auto}.p6-builder-attributes .ve-statgen-pb__cell{min-width:0!important}.p6-builder-attributes .ve-statgen-shared__ipt:not(.ve-statgen-pb__ipt-budget){width:41px!important;padding-inline:var(--sp-1)!important}.p6-builder-attributes select.ve-statgen-shared__ipt{appearance:none;text-align:center;padding-inline:0!important}}.p6-choice-instruction{display:none!important}.p6-ability-methods{gap:var(--sp-1);flex-wrap:wrap;display:flex}.p6-builder-attributes .ve-statgen-shared__wrp-header{gap:var(--sp-3);flex-wrap:wrap}.p6-builder-attributes:not([data-mode=pointbuy]) .ve-mobile-sm__flex-col.ve-mb-2:has(.ve-statgen-pb__ipt-budget){display:none!important}.p6-builder [onmouseover*=Renderer\\.hover],.p6-builder [onclick*=Renderer\\.hover]{pointer-events:none!important;color:inherit!important;cursor:inherit!important;text-decoration:none!important}.p6-builder .veapp__btn-filter,.p6-builder .ve-fltr__mini-view{display:none!important}.p6-builder button:has(>.glyphicon-filter){display:none!important}.p6-builder button:has(>.glyphicon-resize-small){display:none!important}.p6-builder .ve-btn-group:has(>button>.glyphicon-refresh){display:none!important}:is(.p6-builder .ve-btn-group:has(.ve-ui-sel2__wrp[style*=none]),.p6-builder .ve-bold:has(+.ve-btn-group .ve-ui-sel2__wrp[style*=none])){display:none!important}.p6-builder-spells .manc__list-row>:nth-child(7),.p6-builder-spells .manc__list-row>:nth-child(7) *{font-size:var(--fs-xs);color:var(--text3)!important}.p6-builder-card{padding:var(--sp-3) var(--sp-4) var(--sp-5);border-top:var(--border) solid var(--line);color:var(--text);font-size:var(--fs-sm);line-height:1.65}.p6-builder-card>table{width:100%;border:0!important}.p6-builder-card td,.p6-builder-card th{padding:var(--sp-1) 0!important;border:0!important}.p6-builder-card-note{margin:0 0 var(--sp-2);color:var(--text2)}.p6-builder .p6-choice-group{align-items:center;gap:var(--sp-2);flex-wrap:wrap;background:0 0!important;border:0!important;height:auto!important;min-height:0!important;padding:0!important;display:flex!important;overflow:visible!important}.p6-builder .p6-choice-group>:not(.p6-choice-option){flex-basis:100%;width:100%!important}.p6-builder .p6-choice-group>hr{margin:var(--sp-1) 0}.p6-builder .p6-choice-progress{color:var(--accent-text);font-size:var(--fs-xs)}.p6-builder .p6-choice-progress[data-done=true]{color:var(--success-text)}.p6-builder .p6-choice-option{white-space:nowrap;align-items:center;gap:var(--sp-1);border-radius:var(--r-sm);min-height:36px;color:var(--text);cursor:pointer;flex:none;position:relative;width:auto!important;padding:0 var(--sp-3)!important;border:var(--border) solid var(--line-ctrl)!important;background:var(--surface)!important;justify-content:flex-start!important;margin:0!important;display:inline-flex!important}.p6-builder .p6-choice-option>label:has(>input){clip-path:inset(50%);margin:0;padding:0;overflow:hidden;width:1px!important;height:1px!important;position:absolute!important}.p6-builder .p6-choice-option>div,.p6-builder .p6-choice-option .ve-w-100{white-space:nowrap;flex:none!important;width:auto!important;max-width:none!important;padding:0!important}.p6-builder .p6-choice-option .ve-help{border-bottom:0!important;text-decoration:none!important}.p6-builder .p6-choice-option:hover{background:var(--bg-hover)!important}.p6-builder .p6-choice-option:has(input:checked){color:var(--on-primary);background:var(--primary)!important;border-color:var(--primary)!important}.p6-builder .p6-choice-option:has(input:checked):before{content:\"✓\";font-size:var(--fs-xs)}.p6-builder .p6-choice-option:has(input:checked) .ve-muted{opacity:.8;color:inherit!important}.p6-builder .p6-choice-option:has(input:disabled):not(:has(input:checked)){color:var(--disabled-text);cursor:not-allowed;background:var(--disabled-bg)!important}.p6-builder .p6-choice-option:has(input:focus-visible){outline:2px solid var(--focus);outline-offset:2px}.p6-builder .p6-choice-option .veapp__msg-warning:empty{display:none}.p6-builder .p6-choice-option .veapp__msg-warning:has(.fa-check){display:none!important}.p6-builder .p6-choice-option:has(.veapp__msg-warning .fa-check):after{content:\"已有\";margin-left:var(--sp-1);color:var(--text3);font-size:var(--fs-xs)}.p6-builder-equipment .imp-cls__wrp-equi-group{gap:var(--sp-2);padding:var(--sp-3) 0!important;border:0!important;border-top:var(--border) solid var(--line)!important;background:0 0!important;margin:0!important}.p6-builder-equipment .imp-cls__wrp-equi-group>div{min-height:var(--hit);padding:var(--sp-2) var(--sp-3) var(--sp-2) 40px;border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);background:var(--surface);position:relative;justify-content:flex-start!important}.p6-builder-equipment .imp-cls__wrp-equi-group>div:has(>.ve-active){border-color:var(--primary);background:var(--primary-tint)}.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key,.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key.ve-active{z-index:0;inset:0;border-radius:var(--r-sm)!important;color:#0000!important;width:auto!important;height:auto!important;box-shadow:none!important;background:0 0!important;border:0!important;margin:0!important;font-size:0!important;position:absolute!important}.p6-builder-equipment .imp-cls__disp-equi-choice-key:before{content:\"\";left:var(--sp-3);border:2px solid var(--line-ctrl);box-sizing:border-box;border-radius:50%;width:16px;height:16px;margin-top:-8px;position:absolute;top:50%}.p6-builder-equipment .imp-cls__disp-equi-choice-key.ve-active:before{border:5px solid var(--primary)}.p6-builder-equipment .imp-cls__disp-equi-choice-key:focus-visible{outline:2px solid var(--focus)!important}.p6-builder-equipment .imp-cls__wrp-equi-group>div>.ve-w-100{z-index:1;pointer-events:none;position:relative}.p6-builder-equipment .imp-cls__wrp-equi-group>div>.ve-w-100 :is(button,input,select){pointer-events:auto}.p6-builder-equipment .imp-cls__wrp-equi-group>div:has(>.imp-cls__disp-equi-choice-key:disabled){padding-left:var(--sp-3);border-color:var(--line);background:var(--bg-sunk)}.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key:disabled{visibility:hidden!important;display:none!important}.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key:disabled:before{content:none!important}.p6-builder-equipment button:has(>.fa-magnifying-glass){align-items:center;gap:var(--sp-1);min-height:32px;width:auto!important;padding:0 var(--sp-2)!important;border:var(--border) solid var(--line-ctrl)!important;border-radius:var(--r-sm)!important;background:var(--surface)!important;color:var(--text)!important;display:inline-flex!important}.p6-builder-equipment button:has(>.fa-magnifying-glass)>.fa-magnifying-glass{display:none}.p6-builder-equipment button:has(>.fa-magnifying-glass):after{content:attr(title) \" ▾\"!important}.p6-equip-picker{z-index:30;pointer-events:auto;background:var(--surface);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);width:min(340px,100%);box-shadow:var(--shadow-2);flex-direction:column;display:flex;position:absolute;top:calc(100% + 4px);left:0}.p6-builder-equipment .imp-cls__wrp-equi-group>div>.ve-w-100:has(.p6-equip-picker){z-index:20}.p6-equip-picker .p6-picker-search{margin:var(--sp-2)}.p6-equip-picker-list{border-top:var(--border) solid var(--line);max-height:220px;overflow:auto}.p6-builder button.p6-equip-picker-clear{min-height:32px;margin:var(--sp-1) var(--sp-2);padding:0 var(--sp-2);color:var(--primary-text);font:inherit;font-size:var(--fs-sm);cursor:pointer;background:0 0;border:0;align-self:flex-start}.p6-builder-to-list{display:none}@media (width<=520px){.p6-builder .p6-builder-split:not(.p6-builder-inactive){grid-template-rows:minmax(0,1fr)!important;grid-template-columns:1fr!important}.p6-builder-split[data-view=list]>.p6-builder-panel,.p6-builder-split[data-view=card]>.p6-builder-rail{display:none!important}.p6-builder-split .p6-builder-rail{border-bottom:0}.p6-builder button.p6-builder-to-list{color:var(--primary-text);align-items:center;display:inline-flex;padding:0 var(--sp-1)!important;background:0 0!important;border:0!important}}", Qi = globalThis;
function $i(e = [
	u,
	s,
	Yi,
	Xi,
	Zi
]) {
	return e.join("\n").replace(/:host\b/g, ":root").replace(/^\s*all:\s*initial;\s*$/m, "").replace(/^\s*pointer-events:\s*inherit;.*$/m, "");
}
var ea = JSON.stringify({ colorScheme: {
	applications: "",
	interface: ""
} });
function ta(e) {
	return new Promise((t) => {
		let n = Object.assign(document.createElement("link"), {
			rel: "stylesheet",
			href: e
		});
		n.onload = n.onerror = () => t(), document.head.append(n);
	});
}
var na = [
	"background",
	"background-color",
	"color",
	"border-color",
	"border-top-color",
	"border-right-color",
	"border-bottom-color",
	"border-left-color",
	"box-shadow"
];
function ra(e) {
	for (let t of Array.from(e)) {
		let e = t.style;
		if (e) {
			e.backgroundImage?.includes("url(") && (e.backgroundImage = "none");
			for (let t of na) e.getPropertyPriority(t) === "important" && e.setProperty(t, e.getPropertyValue(t));
		}
		let n = t.cssRules;
		n && ra(n);
	}
}
function ia(e) {
	let t = (e) => Array.from(e).some((e) => e.selectorText === ".ve-hidden"), n = Array.from(e.cssRules).filter((e) => typeof CSSLayerBlockRule < "u" && e instanceof CSSLayerBlockRule), r = new Set(n.filter((e) => t(e.cssRules)).map((e) => e.name));
	for (let e of r) {
		let t = n.filter((t) => t.name === e).at(-1);
		t?.insertRule(".ve-hidden { display: none !important; }", t.cssRules.length);
	}
	t(e.cssRules) && e.insertRule(".ve-hidden { display: none !important; }", e.cssRules.length);
}
var aa = 0, oa = 160, sa = () => Math.max(oa, document.documentElement.clientHeight - oa), ca = /* @__PURE__ */ new WeakSet();
function la(e) {
	e.setPosition({
		left: aa,
		top: aa,
		width: innerWidth - 0,
		height: innerHeight - 0
	});
}
function ua() {
	Qi.Hooks.on("renderApplicationV2", (e, t, n, r) => {
		r?.isFirstRender && e?.options?.window?.resizable && (Math.abs(Number(e.position?.height) - sa()) > 2 || (ca.add(e), e.element?.classList.add("trpg-main"), la(e)));
	});
	let e = 0;
	addEventListener("resize", () => {
		clearTimeout(e), e = setTimeout(() => {
			for (let e of Qi.foundry.applications.instances.values()) e.rendered && ca.has(e) && la(e);
		}, 150);
	});
}
async function da(e, t) {
	ua();
	let n = [Qi.game.system, ...Qi.game.modules.filter((e) => e.active)].flatMap((e) => [...e.styles ?? []].map((e) => String(e.src ?? e))), r = [...e.styles, ...n].map((e) => {
		let n = new URL(e, location.href);
		return (qi(t, n) ?? n).href;
	}), i = new Set(e.styles.map((e) => new URL(e, location.href).href)), a = r.map(async (e) => {
		if (await ta(e), i.has(e)) return;
		let t = [...document.styleSheets].find((t) => t.href === e);
		t && (ra(t.cssRules), ia(t));
	}), o = document.createElement("style");
	o.dataset.trpgTheme = "build", o.textContent = $i(), document.head.append(o), new MutationObserver(() => {
		document.head.lastElementChild !== o && document.head.append(o);
	}).observe(document.head, { childList: !0 }), await Promise.all(a);
}
// src/rules/kernel/frame/main.ts
var Q = globalThis, fa = new URLSearchParams(location.search).get("frame") ?? "", pa = Q.__trpgFrameErrors ?? [];
async function ma(e) {
	let t = await fetch(new URL(e, location.href));
	if (!t.ok) throw Error(`${t.status}: ${e}`);
	return t.text();
}
async function ha(e) {
	let t = await y({
		op: "file",
		path: `packs/${e}.json`
	});
	if (typeof t != "string") throw Error(`Pack is not available: ${e}`);
	return JSON.parse(t);
}
var $;
async function ga(e) {
	if ($) throw Error("Kernel is already booted");
	let t = [], { foundry: n, Hooks: r } = Q;
	j(e.seed ?? "kernel"), Ji(e.moduleRoots), Q.release = new n.config.ReleaseData(e.release);
	let i = ee(e);
	Q.packages = {
		System: new n.utils.Collection([[i.system.id, new n.packages.System(i.system)]]),
		Module: new n.utils.Collection(i.modules.map((e) => [e.id, new n.packages.Module(e)]))
	};
	let a = Q.io({
		autoConnect: !1,
		forceNew: !0
	});
	$ = {
		...w(a, {
			userId: e.userId,
			worldTime: e.worldTime,
			readPack: ha,
			readText: ma
		}),
		steps: t
	};
	let o = n.Game;
	class s extends o {
		activateListeners() {
			t.push("omit UI event listeners");
		}
		initializeUI() {
			for (let [e, t] of Object.entries(Q.CONFIG.ui)) Q.ui[e] = new t();
			Q.ui.windows ??= {};
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
	Q.game = new s("game", i, a), Q.game.issues._detectUsabilityIssues = () => {
		t.push("omit usability warnings");
	}, Q.game.nue && (Q.game.nue.initialize = () => void 0), Q.game.settings.storage.get("client").setItem("core.noCanvas", "true"), e.display && Q.game.settings.storage.get("client").setItem("core.uiConfig", ea), await ba(`systems/${i.system.id}/dnd5e.js`);
	let c = !!e.moduleRoots?.plutonium && e.language === "zh.core";
	for (let e of i.modules) for (let t of e.esmodules ?? []) await ke(new URL(t, location.href), c);
	r.once("setup", () => {
		Q.CONFIG.DND5E?.calendar && (Q.CONFIG.DND5E.calendar.application = null), ue();
	}), await Q.game.initialize(), e.display && await da(e.display, e.moduleRoots);
	let l = Date.now() + 3e4;
	for (; i.modules.some((e) => e.id === "plutonium") && typeof Q.game.modules.get("plutonium")?.api != "object";) {
		if (Date.now() > l) throw Error("Plutonium API was not ready within 30 seconds");
		await new Promise((e) => setTimeout(e, 50));
	}
	return _a();
}
function _a() {
	let e = Q.game;
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
		errors: [...pa]
	};
}
function va() {
	return Q.game.actors.contents.map((e) => ({
		source: e.toObject(),
		system: e.system.toObject(!1),
		name: e.name,
		validation: e.validationFailures
	}));
}
var ya = {
	...Hi,
	boot: ga,
	loadBrews: Gi,
	status: _a,
	preparedActors: va,
	reserveActorIds: (e) => {
		if (!$) throw Error("Kernel is not booted");
		$.reserve(e);
	},
	changes: () => $?.changes ?? [],
	calls: () => $?.calls ?? [],
	steps: () => $?.steps ?? []
};
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "call") return;
	let n = (e) => parent.postMessage({
		channel: h,
		type: "result",
		frame: fa,
		id: t.id,
		...e
	}, location.origin), r = ya[t.fn];
	if (!r) return n({
		ok: !1,
		error: `Unknown kernel command: ${t.fn}`
	});
	Promise.resolve().then(() => r(...t.args)).then((e) => n({
		ok: !0,
		value: e
	}), (e) => n({
		ok: !1,
		error: e instanceof Error ? e.stack ?? e.message : String(e)
	}));
});
function ba(e) {
	return new Promise((t, n) => {
		let r = document.createElement("script");
		r.src = e, r.onload = () => t(), r.onerror = () => n(Error(`Failed to load ${e}`)), document.head.append(r);
	});
}
async function xa() {
	Q.SIGNED_EULA = !0, Q.ROUTE_PREFIX = new URL(".", location.href).pathname.replace(/^\/+|\/+$/g, ""), Q.MESSAGES = null, await import(
		/* @vite-ignore */
		new URL("scripts/foundry.mjs", location.href).href
);
	let e = {
		channel: h,
		type: "ready",
		frame: fa,
		codeSet: "foundry",
		authorVersion: Q.foundry?.CONST?.vtt ?? null,
		present: { foundry: !!Q.foundry?.Game },
		errors: [...pa]
	};
	parent.postMessage(e, location.origin);
}
document.readyState === "complete" ? xa() : addEventListener("load", () => {
	xa();
}, { once: !0 });
