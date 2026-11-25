import { a as e, d as t, f as n, g as r, h as i, i as a, l as o, n as s, o as c, p as l, r as u, t as d, u as f, v as p, x as m } from "./tokens-CBS86fSg.js";
import { a as h, o as g, t as _ } from "./protocol-CoIo3UiI.js";
// src/rules/kernel/frame/request.ts
var v = new URLSearchParams(location.search).get("frame") ?? "", y = 1, b = /* @__PURE__ */ new Map();
function x(e) {
	return new Promise((t, n) => {
		let r = 1e6 + y++;
		b.set(r, {
			resolve: t,
			reject: n
		}), parent.postMessage({
			channel: _,
			type: "request",
			frame: v,
			id: r,
			...e
		}, location.origin);
	});
}
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "response" || !b.has(t.id)) return;
	let n = b.get(t.id);
	b.delete(t.id), t.ok ? n.resolve(t.value) : n.reject(Error(t.error));
});
// src/rules/kernel/packages.ts
var ee = [
	"esmodules",
	"scripts",
	"styles"
];
function te(e, t) {
	let n = `${t}s/${e.id}/`, r = (e) => /^(?:[a-z]+:)?\/\//i.test(e) || e.startsWith(n) ? e : n + e.replace(/^\.?\//, ""), i = structuredClone(e);
	for (let e of ee) {
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
function ne(e) {
	let { CONST: t, CONFIG: n, foundry: r } = globalThis, i = te(e.system, "system"), a = e.modules.map((e) => ({
		...te(e, "module"),
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
function S(e, t) {
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
var C = 0;
async function w(e = 2e3) {
	let t = Date.now() + e, n = 0;
	for (; n < 2 && Date.now() < t;) await new Promise((e) => setTimeout(e, 0)), n = C === 0 ? n + 1 : 0;
}
function re(e, t) {
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
			return i.map((e) => S(e, t.indexFields));
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
			C++, e.then((e) => s(t(e)), (e) => s({ error: { message: e.message } })).finally(() => {
				C--;
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
var T = null, ie = null;
function E(e, t) {
	return ie ? ie(e, t) : t();
}
function D(e) {
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
	}), ie = async (e, n) => {
		let r = t;
		t = D(e);
		try {
			return await n();
		} finally {
			t = r;
		}
	}, (e) => {
		t = D(e);
	};
}
function ae() {
	let e = /* @__PURE__ */ new Uint32Array(4);
	return T ? T(e) : crypto.getRandomValues(e), Array.from(e, (e) => e.toString(16).padStart(8, "0")).join("");
}
// src/rules/kernel/frame/seed.ts
var oe = O(globalThis);
function se() {
	return ae();
}
function k(e) {
	oe(e);
}
function A(e, t) {
	let n = t;
	return `entry:${e}:${String(n?.source ?? "")}:${String(n?.name ?? "")}:${ce(JSON.stringify(t))}`;
}
function ce(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return (t >>> 0).toString(16);
}
// src/rules/kernel/frame/writings.ts
var le = [
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
], ue = {
	rule: "no-target",
	reason: "目标路径既没有数据字段，人物身上也没有这个属性；原代码写进去也没有规则读取"
}, de = globalThis, j = /* @__PURE__ */ new WeakMap(), fe = !1, pe = (e) => e?.documentName === "Actor";
function me(e, t, n) {
	let r = String(t.effect?.uuid ?? ""), i = String(t.key ?? ""), a = j.get(e);
	a || j.set(e, a = /* @__PURE__ */ new Map()), a.has(`${r}|${i}`) || a.set(`${r}|${i}`, {
		actor: e.id,
		effect: r,
		key: i,
		value: t.value,
		rule: n.rule,
		reason: n.reason,
		affects: i
	});
}
function he() {
	if (fe) return;
	let e = de.CONFIG?.ActiveEffect?.documentClass, t = de.CONFIG?.Actor?.documentClass;
	if (!e || !t) return;
	fe = !0;
	let n = t.prototype.applyActiveEffects;
	t.prototype.applyActiveEffects = function(e, ...t) {
		return (e === "initial" || e === void 0) && j.set(this, /* @__PURE__ */ new Map()), n.call(this, e, ...t);
	};
	let r = e.applyChange;
	e.applyChange = function(e, t, ...n) {
		let i = pe(e) && t?.effect ? le.find((e) => e.test(String(t.key ?? ""))) : void 0;
		return i && me(e, t, {
			rule: i.id,
			reason: i.reason
		}), r.call(this, e, t, ...n);
	};
	let i = e._applyChangeUnguided;
	e._applyChangeUnguided = function(e, t, ...n) {
		return pe(e) && t?.effect && de.foundry.utils.getProperty(e, t.key) === void 0 && !le.some((e) => e.test(String(t.key ?? ""))) && me(e, t, ue), i.call(this, e, t, ...n);
	};
}
function ge(e) {
	return he(), j.has(e) || e.reset(), [...j.get(e)?.values() ?? []];
}
// src/rules/kernel/frame/commands-items.ts
var M = globalThis;
function _e(e) {
	return !e || e.max === void 0 || e.max === null || e.max === "" ? null : {
		value: e.value ?? null,
		max: e.max ?? null,
		spent: e.spent ?? null
	};
}
function ve(e) {
	return {
		id: e.id,
		name: e.name,
		type: e.type,
		equipped: "equipped" in e.system ? e.system.equipped : null,
		attuned: "attuned" in e.system ? e.system.attuned : null,
		attunement: e.system.attunement ?? null,
		uses: _e(e.system.uses),
		activities: e.system.activities ? [...e.system.activities].map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			uses: _e(e.uses)
		})) : []
	};
}
function ye(e) {
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
function be(e) {
	return e.map((e) => ({
		formula: e.formula ?? null,
		total: e.total ?? null,
		dice: e.dice?.map((e) => ({
			faces: e.faces,
			results: e.results?.map((e) => e.result)
		})) ?? []
	}));
}
function xe(e, t) {
	let n = (e, n) => t(e).items.get(n, { strict: !0 });
	return {
		equip: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.equipped": !!a }), {
				item: ve(o),
				actor: ye(e)
			};
		}, [r]),
		attune: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.attuned": !!a }), {
				item: ve(o),
				actor: ye(e)
			};
		}, [r]),
		useItem: (t, r, i = [], a = null) => {
			let o = [], s = M.ui?.notifications, c = s?.error;
			return s && c && (s.error = function(e, ...t) {
				return o.push(String(e)), c.call(this, e, ...t);
			}), e(i, async () => {
				let e = n(t, r), i, s = null;
				if (a) {
					if (s = e.system.activities?.get(a), !s) throw Error(`Item has no activity: ${a}`);
					i = await s.use({}, { configure: !1 }, { create: !1 });
				} else i = await e.use({}, { configure: !1 }, { create: !1 });
				return {
					item: ve(e),
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
				})) : M.foundry.utils.isEmpty(n.updates) || (await t.update(n.updates), i.push({
					id: t.id,
					name: t.name,
					updates: n.updates,
					rolls: be(n.rolls ?? [])
				})));
			}
			return {
				period: r,
				items: i,
				actor: ye(e)
			};
		}, [n]),
		filterItems: (n, r) => e([], async () => {
			let e = t(n).sheet;
			if (!e?._filterChildren) throw Error(`人物 ${n} 没有官方人物表单实例`);
			return { ids: e._filterChildren("items", new Set(r)).map((e) => e.id) };
		}),
		splitStack: (r, i, a) => e([], async () => (await n(r, i).system.split(a), { actor: ye(t(r)) }), [r]),
		createScroll: (r, i, a) => e([], async () => {
			let e = t(r), o = await M.CONFIG.Item.documentClass.createScrollFromSpell(n(r, i), {}, { dialog: !1 });
			if (!o) throw Error("官方没有生成卷轴");
			let s = o.toObject ? o.toObject() : o;
			return a && (s.name = a, s.flags = {
				...s.flags ?? {},
				"tavern-trpg": {
					...s.flags?.["tavern-trpg"] ?? {},
					named: !0
				}
			}), {
				created: (await e.createEmbeddedDocuments("Item", [s])).map((e) => e.id),
				actor: ye(e)
			};
		}, [r]),
		duplicateItem: (r, i, a) => e([], async () => ({
			created: (await n(r, i).clone({
				name: a,
				"flags.tavern-trpg.named": !0
			}, { save: !0 }))?.id ?? null,
			actor: ye(t(r))
		}), [r]),
		convertCurrency: (n) => e([], async () => {
			let e = t(n);
			return await M.dnd5e.applications.CurrencyManager.convertCurrency(e), { currency: e.system.currency };
		}, [n])
	};
}
// src/rules/kernel/frame/author-classes.ts
var Se = [
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
], Ce;
function we() {
	return Ce ??= (async () => {
		let e = await (await fetch(new URL("modules/plutonium/js/Bundle.js", document.baseURI))).text(), t = Object.getPrototypeOf(async () => void 0).constructor, n = await new t(`${e}\n;return { ${Se.join(", ")} };`)();
		return n.Config._CONFIG_TEMP = {
			dataSources: { baseSiteUrl: new URL(".", document.baseURI).href },
			misc: { rulesVersion: "classic" }
		}, n.ConfigConsts.prePreInit({ implRegistryImportList: n.ImplementationRegistryImportList.get() }), n.Config._CONFIG = n.Config.api_getDefaults(), n.Config._CONFIG_PLAYER = n.Config._getDefaultPlayerConfig(), n.Vetools.prePreInit_preConfig(), n.VetoolsLinks.prePreInit_postConfig(), n.Vetools.prePreInit_postConfig(), n.UtilDamageTypes.init(), n.Dnd5eUtil.init(), n.Vetools.init(), n.SideDataInterfaces.init(), n;
	})();
}
var Te = globalThis, Ee;
function De() {
	return Ee ??= (async () => {
		let e = (await Te.game.modules.get("plutonium")?.api?.importer?.pGetImporter?.({ prop: "item" }))?.constructor?._DataConverter;
		if (!e?._getWeaponIdKey) throw Error("作者物品转换类不可用（Plutonium 物品导入器）");
		let t = Te.Parser, n = (Te.game?.settings?.get?.("dnd5e", "rulesVersion") === "modern" ? [
			t.SRC_XPHB,
			t.SRC_XDMG,
			t.SRC_PHB,
			t.SRC_DMG
		] : [
			t.SRC_PHB,
			t.SRC_DMG,
			t.SRC_XPHB,
			t.SRC_XDMG
		]).map((e) => String(e).toLowerCase()), r = Te.Renderer.get().baseUrl, [i, a] = await Promise.all([Te.DataUtil.loadJSON(`${r}data/items-base.json`), Te.DataUtil.loadJSON(`${r}data/items.json`)]), o = [...i?.baseitem ?? [], ...a?.item ?? []].filter((e) => n.includes(String(e.source).toLowerCase())).sort((e, t) => n.indexOf(String(e.source).toLowerCase()) - n.indexOf(String(t.source).toLowerCase())), s = /* @__PURE__ */ new Map();
		for (let t of o) {
			let n = String(t.name).toLowerCase(), r = {
				propDroppable: "item",
				source: String(t.source),
				hash: Te.UrlUtil.URL_TO_HASH_BUILDER[Te.UrlUtil.PG_ITEMS](t)
			};
			for (let t of /* @__PURE__ */ new Set([
				e._getWeaponIdKey({ nameLower: n }),
				e._getArmorShieldIdKey({ nameLower: n }),
				e._getToolIdKey({ nameLower: n })
			])) t && !s.has(t) && s.set(t, r);
		}
		return s;
	})();
}
// src/rules/kernel/frame/commands-combat.ts
var Oe = globalThis;
function ke(e) {
	let t = e.system.spells;
	return t ? Object.fromEntries(Object.entries(t).map(([e, t]) => [e, {
		value: t.value ?? null,
		max: t.max ?? null,
		level: t.level ?? null,
		type: t.type ?? null
	}])) : null;
}
function Ae(e) {
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
function je(e) {
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
function Me(e) {
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
function Ne(e) {
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
function Pe(e, t) {
	let n = null, r = () => n ?? Oe.game.combat, i = () => {
		let e = r();
		if (!e) throw Error("No active combat");
		return e;
	};
	return {
		combatStart: (t, r = []) => e(r, async () => {
			let e = await Oe.CONFIG.Combat.documentClass.create({
				name: "Kernel encounter",
				combatants: t.map((e) => ({ actorId: e }))
			});
			return await e.rollInitiative(e.combatants.map((e) => e.id), { dialog: !1 }), await e.startCombat(), n = e, Me(e);
		}, t),
		combatNext: (t = []) => e(t, async () => {
			let e = i();
			return await e.nextTurn(), Me(e);
		}),
		combatEnd: () => e([], async () => {
			let e = i();
			await e.endCombat();
			let t = Me(e);
			return n = null, t;
		}),
		cast: (n, r, i, a = [], o = {}) => e(a, async () => {
			let e = t(n), a = e.items.get(r, { strict: !0 }), s = a.system.activities?.get(i);
			if (!s) throw Error(`Item has no activity: ${i}`);
			let c = await s.use(o, { configure: !1 }, { create: !1 });
			return {
				item: ve(a),
				activity: {
					id: s.id,
					name: s.name,
					type: s.type
				},
				slots: ke(e),
				concentration: Ae(e),
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
			return await e.toggleStatusEffect(r, { active: i }), je(e);
		}, [n]),
		concentrationCheck: (n, r, i = []) => e(i, async () => {
			let e = t(n);
			if (!e.concentration?.effects?.size) return {
				dc: null,
				skipped: "not concentrating",
				concentration: Ae(e)
			};
			let i = e.getConcentrationDC(r), a = await e.rollConcentration({ target: i }, { configure: !1 }, { create: !1 }), o = a?.[0] ?? null, s = o ? o.total >= i : null;
			return s === !1 && await e.endConcentration(), {
				dc: i,
				success: s,
				rolls: (a ?? []).map(Ne),
				concentration: Ae(e)
			};
		}, [n]),
		concentration: (n) => e([], async () => Ae(t(n)), [n])
	};
}
// src/rules/kernel/frame/plutonium-zh.ts
async function Fe(e, t, n = fetch) {
	try {
		let r = await n(new URL("fingerprints.json", t), { cache: "no-store" });
		if (r.status === 404) return null;
		if (!r.ok) throw Error(`读取中文构建指纹失败（${r.status}）`);
		let i = await r.json();
		if (i.original !== g(e)) throw Error("私人完整版已变化");
		let a = await n(new URL("Bundle.js", t), { cache: "no-store" });
		if (!a.ok) throw Error(`读取中文构建失败（${a.status}）`);
		let o = await a.text();
		if (i.localized !== g(o)) throw Error("中文构建文件与指纹不匹配");
		return o;
	} catch (e) {
		return console.warn("建卡使用私人完整版原文。可运行 npm run gen:plutonium-zh 重生成中文构建。", e), null;
	}
}
// src/rules/kernel/frame/plutonium-build.ts
var Ie = "13b1a03b99eab99f4b078e11075c7092c175a365d076d5319914f376c583e245", Le = "608e0a5497354d1937c3d3e780f85a103c4ddffb846d4bb1cdcfb00bdffb0bf2", Re = /* @__PURE__ */ "Charactermancer_FeatureOptionsSelect.Charactermancer_AdditionalFeatsSelect.StatGenUtilAdditionalFeats.DataPrimerFauxFeatureClassSubclassFeat.DataPrimerFauxFeatureClassSubclassOptionalfeature.UtilDataConverter.Config.Charactermancer_AvailableProficiencyManager.CharactermancerFeatureSubCompManagerProficiencyOtherBase.Charactermancer_ItemMasteries_Util.Charactermancer_Class_Util.Charactermancer_OtherProficiencySelect.Charactermancer_ExpertiseSelect.Charactermancer_ImmResVulnSelect.UtilAdvancementsEntry.UtilAdvancements.ComponentUiUtil.veE.EQUIPMENT_TYPE_EXPANDERS.UtilEntityItem.UtilApplications.InputUiUtil.EquipmentApp.ActorAbilityScoreIncrease.UtilEntityBackgroundFeature.UtilsEntityBackground.CompendiumCacheUtil.VET_SIZE_TO_ABV.SheetLevelUpButtonManager.DataPrimer.Charactermancer_Class_ProficiencyImportModeSelect.ConfigConsts.UtilDocumentItem".split("."), N = null, ze;
async function Be(e, t = !1) {
	if (!e.pathname.endsWith("/modules/plutonium/js/Bundle.js")) {
		await import(
			/* @vite-ignore */
			e.href
);
		return;
	}
	let n = await fetch(e);
	if (!n.ok) throw Error(`读取 Plutonium 失败：${n.status}`);
	let r = await n.text(), i = new URL(n.url || e.href), a = g(r);
	if (a !== Ie) {
		let e = new URL("../private/modules/plutonium/js/Bundle.js", location.href), n = t && i.href === e.href ? await Fe(r, new URL("../private/lang/zh/modules/plutonium/js/", location.href)) : null;
		if (i.href === e.href && a === Le) {
			let { nativeBuilder: e } = await Ve(n ?? r, i, "\nexport const nativeBuilder = { ActorCharactermancer, ComponentUiUtil, Charactermancer_Util, Charactermancer_Spell_Level, Charactermancer_AvailableEquipmentInfo };\n");
			ze = e;
		} else n === null ? await import(
			/* @vite-ignore */
			i.href
) : await Ve(n, i);
	} else N = (await Ve(r, e, `\nexport const buildAdapter = { ${Re.join(", ")} };\n`)).buildAdapter;
}
async function Ve(e, t, n = "") {
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
var He = "tavern-trpg-assistant", Ue = "automaticTraitOrigins";
function We(e) {
	return e.flags?.[He]?.[Ue] ?? {};
}
function Ge(e) {
	let t = e.flags?.[He];
	t && Ue in t && (delete t[Ue], Object.keys(t).length || delete e.flags[He]);
}
var Ke = (e = []) => [...e].sort(), qe = (e) => h({
	type: e.type,
	level: e.level ?? 0,
	restriction: e.classRestriction || null,
	name: e.name ?? "",
	hint: e.hint ?? "",
	mode: e.configuration?.mode ?? "default",
	grants: Ke(e.configuration?.grants),
	allowReplacements: !!e.configuration?.allowReplacements,
	choices: (e.configuration?.choices ?? []).map((e) => [e.count ?? 1, Ke(e.pool)])
});
async function Je(e) {
	let t = N;
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
						input: h(t)
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
				signature: qe(n)
			}) : s.delete(e);
		}
		return t;
	};
	try {
		let t = await e(), n = Object.fromEntries(Object.entries(t.system?.advancement ?? {}).flatMap(([e, t]) => {
			let n = s.get(e);
			return n && n.signature === qe(t) ? [[e, n.origin]] : [];
		}));
		return Ge(t), Object.keys(n).length && (t.flags ??= {}, t.flags[He] ??= {}, t.flags[He][Ue] = n), t;
	} finally {
		n.getGenericAdvancements = i, r.getAdvancementsObject = a;
	}
}
// src/rules/kernel/frame/importer.ts
var Ye = globalThis, Xe = {
	skillsChosenFvtt: [],
	languagesChosenFvtt: [],
	armorProficienciesChosenFvtt: [],
	weaponProficienciesChosenFvtt: [],
	toolProficienciesChosenFvtt: []
};
function Ze() {
	let e = Ye.foundry?.documents?.collections?.CompendiumCollection;
	if (e?.prototype && !e.prototype.getDocuments.__seeded) for (let t of ["getDocuments", "getDocument"]) {
		let n = e.prototype[t], r = function(...e) {
			return E(`pack:${this.collection}:${t}:${JSON.stringify(e)}`, () => n.apply(this, e));
		};
		r.__seeded = !0, e.prototype[t] = r;
	}
}
var Qe = Promise.resolve();
function P(e, t) {
	let n = Qe.then(() => $e(e, t));
	return Qe = n.then(() => void 0, () => void 0), n;
}
async function $e(e, t) {
	Ze();
	let n = Ye.game.modules.get("plutonium")?.api;
	if (!n?.importer) throw Error("Plutonium importer is not available");
	let r = await n.importer.pGetImporter({ prop: e });
	if (!r) throw Error(`No Plutonium importer for ${e}`);
	let i = async () => {
		let i = structuredClone(t), a = new n.importer.ImportOpts({ isTemp: !0 }), o = (e === "class" && r.pImportEntryClass ? await r.pImportEntryClass(i, a) : await r.pImportEntry(i, a, structuredClone(Xe)))?.imported?.[0]?.document ?? null;
		if (!o) throw Error(`Plutonium import failed for ${t?.name ?? e}`);
		return o.toObject ? o.toObject() : o;
	};
	return k(A(e, t)), await i(), k(A(e, t)), Je(i);
}
async function et(e) {
	return (await tt(e)).map((e) => e.prop);
}
async function tt(e) {
	let t = Ye.game.modules.get("plutonium")?.api;
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
var nt = globalThis, rt = "trpgOffHidden000", it = (e) => {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}, at = (e) => e.constructor?.typeName ?? e.type, F = (e) => JSON.parse(JSON.stringify(e ?? null, (e, t) => t instanceof Set ? [...t] : t));
function ot(e) {
	let t = e.system.details?.level ?? 1, n = [];
	for (let r of e.items) {
		let e = it(r);
		if (e) for (let i of Object.values(r.advancement?.byId ?? {})) for (let a of i.levels ?? []) (a <= t || a === 0) && n.push({
			item: r,
			key: e,
			adv: i,
			type: at(i),
			level: a
		});
	}
	return n;
}
var st = () => nt.foundry.data.fields, ct = (e) => e instanceof st().ArrayField, lt = (e) => e instanceof st().TypedObjectField;
function ut(e, t) {
	let n = e?.schema?.fields;
	if (!n || !t || typeof t != "object") return null;
	let r = [];
	for (let [e, i] of Object.entries(n)) {
		let n = t[e];
		if (ct(i) && Array.isArray(n)) for (let t of n) typeof t == "string" && r.push([e, t]);
		else if (lt(i) && n && typeof n == "object") for (let [t, i] of Object.entries(n)) r.push([e, t]), typeof i == "string" && r.push([e, i]);
	}
	return r;
}
function dt(e, t, n) {
	let r = { ...t };
	for (let [i, a] of Object.entries(e.schema.fields)) {
		let e = t?.[i];
		ct(a) && Array.isArray(e) ? r[i] = e.filter((e) => !(typeof e == "string" && n.has(e))) : lt(a) && e && typeof e == "object" && (r[i] = Object.fromEntries(Object.entries(e).filter(([e, t]) => !n.has(e) && !(typeof t == "string" && n.has(t)))));
	}
	return r;
}
var ft = (e) => ({
	value: e.constructor?.metadata?.dataModels?.value,
	configuration: e.constructor?.metadata?.dataModels?.configuration
}), pt = (e, t) => {
	let n = ft(e).value;
	return !!n?.schema?.fields && !!t && typeof t == "object" && Object.keys(t).every((e) => e in n.schema.fields);
};
function mt(e, t) {
	let n = ft(e), r = [...ut(n.value, F(e.value)) ?? [], ...ut(n.configuration, F(e.configuration)) ?? []].map(([, e]) => e), i = typeof e.storagePath == "function" ? e.storagePath(t) : null, a = i ? F(nt.foundry.utils.getProperty(e, i)) : null, o = a && typeof a == "object" ? Object.values(a).filter((e) => typeof e == "string") : [];
	return [.../* @__PURE__ */ new Set([...r, ...o])];
}
function ht(e, t) {
	let n = typeof e.storagePath == "function" ? e.storagePath(t) : null, r = n ? F(nt.foundry.utils.getProperty(e, n)) : null, i = ft(e).value, a = (ut(i, F(e.value)) ?? []).filter(([e]) => ct(i.schema.fields[e])).map(([, e]) => e), o = r && typeof r == "object" ? Object.entries(r).filter((e) => typeof e[1] == "string").map(([e, t]) => ({
		id: e,
		part: t
	})) : [], s = [];
	for (let [t, n] of Object.entries(i?.schema?.fields ?? {})) {
		let r = F(e.value)?.[t];
		if (lt(n) && r && typeof r == "object") for (let [e, t] of Object.entries(r)) typeof t == "number" && t && s.push({
			key: e,
			value: t
		});
	}
	return {
		items: o,
		keys: [...new Set(a)],
		amounts: s
	};
}
function gt(e, t) {
	let n = [], r = (i, a) => {
		for (let [o, s] of Object.entries(i ?? {})) {
			let i = a ? `${a}.${o}` : o;
			s instanceof st().DocumentIdField && s.model?.documentName === "Item" && nt.foundry.utils.getProperty(e._source.system, i) === t ? n.push(`system.${i}`) : s.fields && r(s.fields, i);
		}
	};
	return r(e.system.schema?.fields, ""), n;
}
var _t = (e, t) => t.ref === e.key && t.advancement === e.adv.id && (t.level === void 0 || t.level === e.level), vt = (e) => e.advancement === void 0 && e.effect === void 0 && e.part !== void 0, yt = (e) => e.advancement === void 0 && e.effect === void 0 && e.part === void 0;
function bt(e, t, n) {
	let r = [];
	for (let i of n) {
		let n = [...e.items].find((e) => it(e) === i.ref);
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
		if (vt(i)) {
			i.part.startsWith("system.") && n.system.schema?.getField?.(i.part.slice(7)) || r.push({
				off: i,
				reason: "这件条目的数据里没有这一项"
			});
			continue;
		}
		if (i.advancement === void 0) continue;
		let a = t.filter((e) => _t(e, i));
		a.length ? i.part !== void 0 && !a.some((e) => mt(e.adv, e.level).includes(i.part)) && r.push({
			off: i,
			reason: "这条成长的记录里没有这一项"
		}) : r.push({
			off: i,
			reason: "这件条目没有这一条成长"
		});
	}
	return r;
}
async function xt(e, t) {
	if (!t?.length) return {
		applied: !1,
		choices: {},
		problems: []
	};
	let n = ot(e), r = bt(e, n, t);
	if (r.length) return {
		applied: !1,
		choices: {},
		problems: r
	};
	let i = new Set(t.filter(yt).map((e) => e.ref)), a = (e) => i.has(e.key) ? [{ ref: e.key }] : t.filter((t) => _t(e, t)), o = (e) => new Set(a(e).flatMap((e) => e.part === void 0 ? [] : [e.part])), s = (e) => a(e).some((e) => e.part === void 0), c = new Set(n.filter((e) => a(e).length).map((e) => e.adv.constructor)), l = n.filter((e) => c.has(e.adv.constructor)), u = [];
	for (let e of [...l].reverse()) u.unshift({
		...e,
		data: F(await e.adv.reverse(e.level))
	});
	let d = {};
	for (let e of u) {
		if ((d[e.key] ??= []).push({
			id: e.adv.id,
			type: e.type,
			level: e.level,
			data: e.data
		}), s(e)) continue;
		let t = o(e), n = t.size > 0 && pt(e.adv, e.data);
		if (await e.adv.restore(e.level, n ? dt(ft(e.adv).value, e.data, t) : e.data), !n) for (let n of t) await e.adv.reverse(e.level, {
			key: n,
			uuid: n
		});
	}
	for (let e of u) {
		if (s(e)) continue;
		let t = ft(e.adv).value, n = await e.adv.automaticApplicationValue(e.level, { initial: !0 });
		if (!t?.schema?.fields || !n || typeof n != "object") continue;
		let r = new Set((ut(t, F(e.adv.value)) ?? []).map(([, e]) => e)), i = o(e), a = (ut(t, F(n)) ?? []).filter(([, e]) => !r.has(e) && !i.has(e));
		if (!a.length) continue;
		let c = {};
		for (let [e, t] of a) (c[e] ??= []).push(t);
		await e.adv.apply(e.level, c);
	}
	for (let n of t.filter(vt)) [...e.items].find((e) => it(e) === n.ref)?.updateSource({ [n.part]: null });
	for (let n of t) n.effect !== void 0 && [...e.items].find((e) => it(e) === n.ref)?.effects.get(n.effect)?.updateSource({ disabled: !0 });
	let f = [...e.items].filter((e) => i.has(it(e) ?? ""));
	for (let t of f) {
		for (let n of gt(e, t.id)) e.updateSource({ [n]: null });
		for (let e of t.effects) e.updateSource({ disabled: !0 });
	}
	return f.length && await e.createEmbeddedDocuments("ActiveEffect", [{
		_id: rt,
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
async function St(e, t, n) {
	let r = await xt(e, t);
	if (r.problems.length) return {
		view: null,
		choices: {},
		problems: r.problems
	};
	let i = e.toObject();
	return await Ct(e, n), {
		view: i,
		choices: r.choices,
		problems: []
	};
}
async function Ct(e, t) {
	if (t) {
		t.actor && Object.keys(t.actor).length && await e.update(t.actor);
		for (let [n, r] of Object.entries(t.items ?? {})) {
			let t = m([...e.items], n);
			if (!t) throw Error(`状态差别指向的物品在重建结果里不存在：${n}`);
			await t.update(r);
		}
		for (let n of t.itemAdded ?? []) e.items.get(n._id) || await e.createEmbeddedDocuments("Item", [n], { keepId: !0 });
		for (let n of t.itemRemoved ?? []) {
			let t = m([...e.items], n);
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
var wt = globalThis;
function Tt(e) {
	return Object.fromEntries(Object.entries(e.abilities ?? {}).map(([e, t]) => [e, {
		value: t.value ?? null,
		mod: t.mod ?? null,
		save: t.save?.value ?? t.save ?? null,
		proficient: t.proficient ?? null
	}]));
}
function Et(e) {
	return Object.fromEntries(Object.entries(e.skills ?? {}).map(([e, t]) => [e, {
		total: t.total ?? null,
		passive: t.passive ?? null,
		proficient: t.proficient ?? null
	}]));
}
function Dt(e) {
	return e ? Array.isArray(e) ? e : typeof e[Symbol.iterator] == "function" ? [...e] : Object.values(e) : [];
}
function Ot(e) {
	return {
		id: e.id ?? e._id ?? null,
		name: e.name,
		type: e.type,
		activities: Dt(e.system?.activities).map((e) => ({
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
function kt(e) {
	let t = e.toObject ? e.toObject() : e, n = e.system ?? t.system ?? {}, r = e.items?.contents ?? e.items ?? t.items ?? [];
	return {
		name: e.name ?? t.name,
		type: e.type ?? t.type,
		ac: n.attributes?.ac?.value ?? null,
		hp: n.attributes?.hp ? {
			value: n.attributes.hp.value ?? null,
			max: n.attributes.hp.max ?? null
		} : null,
		abilities: Tt(n),
		skills: Et(n),
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
		items: [...r].map(Ot),
		validation: e.validationFailures ?? []
	};
}
async function At(e) {
	let t = await P("monster", e);
	return {
		status: "complete",
		entity: {
			name: e.name,
			source: e.source
		},
		...kt(t)
	};
}
function jt(e) {
	return {
		importMonster: (t) => e([], async () => At(t)),
		importMonsters: (t) => e([], async () => {
			let e = [];
			for (let n of t) try {
				e.push(await At(n));
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
			e = t.data ? structuredClone(t.data) : await P("monster", t.entry), delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = wt.CONFIG.Actor.documentClass, r = t.id ? await n.create({
				...e,
				_id: t.id,
				name: t.name
			}, { keepId: !0 }) : await n.create({
				...e,
				name: t.name
			}), i = r.toObject();
			return await Ct(r, t.state), {
				status: "complete",
				id: r.id,
				...kt(r),
				data: r.toObject(),
				base: i
			};
		}),
		importMonsterData: (t) => e([], async () => ({
			status: "complete",
			data: await P("monster", t)
		})),
		createActorFromData: (t) => e([], async () => {
			let e = structuredClone(t);
			delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await wt.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...kt(n)
			};
		}),
		importMonsterActor: (t) => e([], async () => {
			let e = await P("monster", t);
			delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await wt.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...kt(n)
			};
		})
	};
}
// src/rules/kernel/frame/system-text.ts
var Mt = globalThis, Nt = null, Pt = /* @__PURE__ */ new Map(), Ft = (e) => e.trim().toLowerCase();
function It() {
	let e = Mt.game.i18n;
	if (Nt === e) return;
	Nt = e, Pt.clear();
	let t = (e, n = []) => {
		for (let [r, i] of Object.entries(e ?? {})) {
			let e = [...n, r];
			if (typeof i == "string") {
				let t = Ft(i);
				Pt.set(t, [...Pt.get(t) ?? [], e.join(".")]);
			} else i && typeof i == "object" && t(i, e);
		}
	};
	t(e.translations), t(e._fallback);
}
function I(t, n) {
	It();
	let r = Mt.game.i18n, i = (n ? [n] : [...new Set(Pt.get(Ft(t)) ?? [])]).filter((e) => r.has(e)), a = new Set(i.map((e) => r.localize(e)));
	if (i.length && a.size === 1) return {
		$t: "system",
		key: i[0],
		text: t
	};
	let s = t.split("、");
	return s.length > 1 ? o(s.map((e) => I(e)), "、") : e(t, null);
}
function Lt(e) {
	return {
		$t: "system",
		key: `TRPGAssistant.UpstreamText.${g(Ft(e)).slice(0, 24)}`,
		text: e
	};
}
function Rt(e) {
	let t = Mt.game.i18n;
	return t.has(e) ? {
		$t: "system",
		key: e,
		text: t.localize(e)
	} : null;
}
function zt(e, t) {
	return e.reduceRight((e, n) => ({
		$t: "system",
		key: n,
		text: t,
		...e ? { fallback: e } : {}
	}), null);
}
var Bt = "TRPGAssistant.UpstreamSource.", Vt = null, Ht = [];
function Ut() {
	let e = Mt.game.i18n;
	if (Vt === e) return Ht;
	Vt = e;
	let t = Mt.foundry?.utils?.flattenObject?.(e.translations ?? {}) ?? {};
	return Ht = Object.entries(t).filter(([e, t]) => e.startsWith(Bt) && typeof t == "string" && t.includes("{}")).map(([e, t]) => ({
		key: `TRPGAssistant.UpstreamText.${e.slice(29)}`,
		pattern: RegExp(`^${String(t).trim().split("{}").map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(.+?)")}$`, "i")
	})), Ht;
}
function Wt(e) {
	let t = e.trim(), n = Lt(t);
	if (Mt.game.i18n.has(n.key)) return n;
	for (let e of Ut()) {
		let n = e.pattern.exec(t);
		if (n && Mt.game.i18n.has(e.key)) return {
			$t: "system",
			key: e.key,
			text: t,
			args: n.slice(1).map((e) => a(e))
		};
	}
	return I(t);
}
var L = (e) => typeof e == "string" && e.trim() ? Wt(e) : null, Gt = globalThis, Kt = (e) => e ? Gt.game.i18n.localize(e) : null, qt = (e) => {
	let t = [...new Set(e.filter((e) => !!e))];
	return t.length ? t.join("、") : null;
};
function Jt(e) {
	let t = Gt.CONFIG?.DND5E?.[e] ?? {}, n = (e) => Kt(typeof e == "string" ? e : e?.label) ?? "";
	return Object.fromEntries(Object.entries(t).map(([e, t]) => [e, n(t) || e]));
}
function Yt(e) {
	return Kt(e ? Gt.CONFIG?.DND5E?.traits?.[e]?.labels?.title : void 0);
}
function Xt(e) {
	return e && e !== "default" ? Kt(Gt.CONFIG?.DND5E?.traitModes?.[e]?.label) : null;
}
function Zt(e) {
	let t = Gt.dnd5e?.documents?.Trait;
	if (!e?.length || !t) return null;
	let n = e.join(".");
	return Object.keys(Gt.CONFIG?.DND5E?.traits ?? {}).find((e) => t.actorKeyPath(e) === n) ?? null;
}
function Qt(e) {
	let t = Zt(e);
	if (t) return Yt(t);
	let n = e?.at(-1), r = Zt(e?.slice(0, -1));
	return r && n && Gt.CONFIG.DND5E.traits[r][n] === !0 ? Xt(n) : null;
}
function $t(e) {
	return qt([...new Set([...e].map((e) => String(e).split(":")[0]).filter(Boolean))].map(Yt));
}
function en(e, t = [], n = []) {
	let r = e._subComps?.[0]?._getAllPossibleProps?.() ?? [];
	return Qt(e._propPathActorExistingProficiencies) || Xt(e._prop) || qt(r.map((n) => Qt(t.find((t) => t !== e && t._prop === n)?._propPathActorExistingProficiencies))) || $t(n);
}
function tn(e) {
	let t = e.configuration ?? {};
	return Xt(t.mode) || (t.type ? Yt(t.type) : $t([...t.grants ?? [], ...[...t.choices ?? []].flatMap((e) => [...e?.pool ?? []])]));
}
// src/rules/kernel/frame/asi.ts
var nn = globalThis;
function rn(e) {
	let t = e.configuration ?? {}, n = Number(t.points) || 0;
	return {
		points: n,
		cap: Number(t.cap) || n,
		fixed: Object.fromEntries(Object.entries(t.fixed ?? {}).filter(([, e]) => e)),
		locked: /* @__PURE__ */ new Set([...t.locked ?? []])
	};
}
function an(e, t) {
	let n = rn(e), r = {}, i = 0;
	for (let [e, a] of Object.entries(t ?? {})) if (a) {
		if (!Number.isInteger(a) || a < 0 || a > n.cap || n.locked.has(e) || !(e in (nn.CONFIG?.DND5E?.abilities ?? {}))) return null;
		r[e] = a, i += a;
	}
	return i <= n.points ? r : null;
}
function on(e, t) {
	let n = rn(e);
	if (!n.points) return null;
	let r = an(e, t?.chosen) ?? {}, i = n.points - Object.values(r).reduce((e, t) => e + t, 0), a = Jt("abilities");
	return {
		kind: "asi",
		points: n.points,
		cap: n.cap,
		left: i,
		rows: Object.keys(a).map((e) => {
			let t = r[e] ?? 0;
			return {
				key: e,
				label: I(a[e]),
				fixed: n.fixed[e] ?? 0,
				chosen: t,
				canAdd: !n.locked.has(e) && i > 0 && t < n.cap,
				canRemove: t > 0
			};
		})
	};
}
function sn(e, t) {
	if (t.assignments && !t.chosen) return {
		type: "asi",
		assignments: t.assignments
	};
	let n = an(e, t.chosen);
	if (!n) return null;
	let r = { ...rn(e).fixed };
	for (let [e, t] of Object.entries(n)) r[e] = (r[e] ?? 0) + t;
	return {
		type: "asi",
		assignments: r
	};
}
// src/rules/kernel/frame/actor-types.ts
var cn = globalThis, ln = "character";
async function un(e, t) {
	let n = Object.keys(cn.game.system?.documentTypes?.Actor ?? {}), r = (e) => {
		let t = cn.CONFIG?.Actor?.typeLabels?.[e] ?? `TYPES.Actor.${e}`;
		return cn.game.i18n?.localize?.(t) ?? e;
	}, i = await tt([e]), a = /* @__PURE__ */ new Set();
	if (i.some((e) => e.folderType === "Actor")) for (let n of t) {
		let t = await P(e, n);
		typeof t?.type == "string" && a.add(t.type);
	}
	return {
		declared: n.map((e) => ({
			type: e,
			label: r(e)
		})),
		fromStore: [...a],
		build: ln
	};
}
// src/rules/kernel/frame/commands-restore.ts
async function dn(e, t, n = []) {
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
var fn = globalThis;
async function pn(e) {
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
async function mn(e) {
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
		let e = fn.game.packs.get("dnd5e.subclasses");
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
		for (let n of Object.keys(e.actor?.system?.abilities ?? t.actor?.system?.abilities ?? fn.CONFIG?.DND5E?.abilities ?? {})) {
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
var R = globalThis, hn = (e) => R.DataUtil.proxy.getUid("item", e), gn = (e, t, n) => f(e, {
	propDroppable: "item",
	source: t,
	hash: n
}), _n = (e) => {
	let [t, n] = e.split("|");
	return R.UrlUtil.URL_TO_HASH_BUILDER[R.UrlUtil.PG_ITEMS]({
		name: t,
		source: n
	});
}, vn = (e) => {
	let t = R.UrlUtil.URL_TO_HASH_BUILDER[R.UrlUtil.PG_ITEMS](e);
	return {
		uid: hn(e),
		name: gn(e.name, e.source, t),
		source: e.source,
		hash: t
	};
}, yn = (e) => R.Renderer.stripTags(e).toTitleCase(), bn = [
	"pCacheAndGetAllSite",
	"pCacheAndGetAllPrerelease",
	"pCacheAndGetAllBrew"
], xn = null;
function Sn() {
	if (xn) return xn;
	let e = Promise.all(bn.map(async (e) => await R.DataLoader[e]("item") ?? [])).then((e) => e.flat());
	return xn = e, e.catch(() => {
		xn === e && (xn = null);
	}), e;
}
var Cn = [
	"class",
	"subclass",
	"classFeature",
	"subclassFeature",
	"race",
	"raceFeature",
	"background",
	"backgroundFeature",
	"feat",
	"optionalfeature",
	"item",
	"spell"
], wn = async () => {
	let e = await Sn(), t = N?.CompendiumCacheUtil, n = /* @__PURE__ */ new Map();
	for (let e of Cn) for (let r of t?.getAdditionalDataCompendiums?.({ entityType: e }) ?? []) n.set(r.collection, r);
	for (let e of n.values()) await new Promise((e) => setTimeout(e, 0)), await t.pGetCompendiumData(e, { isContent: !0 });
	return e.length;
}, Tn = (e) => {
	let t = N?.EQUIPMENT_TYPE_EXPANDERS;
	return t && Object.hasOwn(t, e) ? t[e] : null;
};
function En(t) {
	let n = `TRPGAssistant.EquipmentType.${t}`, r = R.game.i18n.localize(n);
	return r === n ? e(String(Tn(t)?.name ?? t), null) : I(r);
}
async function Dn(e) {
	let t = Tn(e);
	if (!t) return [];
	let n = (await Sn()).filter((e) => N.UtilEntityItem.isStartingEquipmentItem(e));
	return t._getAvailableItems({ itemDatas: n }).sort((e, t) => String(e.name).localeCompare(String(t.name))).map(vn);
}
var On = (e) => {
	let t = e?.startingEquipment;
	return Array.isArray(t) ? t : Array.isArray(t?.defaultData) ? t.defaultData : [];
};
function kn(e) {
	let t = e?.startingEquipment?.goldAlternative;
	if (!t) return null;
	let n = /{@dice ([^|]+)/.exec(t);
	return n ? n[1].replace(/×/g, "*") : Number.isNaN(Number(`${t}`.trim())) ? null : `${t}`.trim();
}
async function An(e) {
	let t = async (e) => {
		let [t, n] = e.split("|"), r = await R.DataLoader.pCacheAndGetHash(R.UrlUtil.PG_ITEMS, _n(e));
		return {
			uid: e,
			name: gn(r?.name ?? t, r?.source ?? n, _n(e)),
			source: r?.source ?? n,
			hash: _n(e),
			found: !!r
		};
	};
	if (typeof e == "string") return {
		raw: e,
		kind: "item",
		quantity: 1,
		...await t(e)
	};
	if (e.item) return {
		raw: e,
		kind: "item",
		quantity: e.quantity || 1,
		...await t(e.item),
		...e.displayName ? { displayName: c(yn(e.displayName)) } : {},
		...e.containsValue ? { cp: e.containsValue } : {}
	};
	let n = e.equipmentTypes ?? (e.equipmentType ? [e.equipmentType] : []);
	if (n.length) {
		if (!n.every(Tn)) return { unsupported: n.filter((e) => !Tn(e)).join("、") };
		let t = /* @__PURE__ */ new Set(), r = (await Promise.all(n.map(Dn))).flat().filter((e) => !t.has(e.uid) && !!t.add(e.uid));
		return r.length ? {
			raw: e,
			kind: "category",
			quantity: e.quantity || 1,
			types: n,
			typeNames: n.map(En),
			candidates: r
		} : null;
	}
	return e.special ? {
		raw: e,
		kind: "special",
		quantity: e.quantity || 1,
		text: c(yn(e.special)),
		...e.containsValue ? { cp: e.containsValue } : {}
	} : e.value ? {
		raw: e,
		kind: "value",
		quantity: 1,
		cp: e.value
	} : { unsupported: JSON.stringify(e).slice(0, 120) };
}
async function jn(e) {
	let t = [], r = [], i = On(e.entry);
	for (let o = 0; o < i.length; o++) {
		let s = [];
		for (let [t, l] of Object.entries(i[o])) {
			let i = await Promise.all(l.map(An));
			for (let t of i) t && "unsupported" in t && r.push(n("{0}：{1}", c(String(e.entry.name)), a(t.unsupported)));
			let o = i.flatMap((e, t) => e && !("unsupported" in e) ? [{
				...e,
				index: t
			}] : []);
			o.length && s.push({
				key: t,
				entries: o
			});
		}
		s.length && t.push({
			index: o,
			choices: s
		});
	}
	let o = kn(e.entry);
	return {
		refKey: e.refKey,
		prop: e.prop,
		name: c(String(e.entry.name)),
		source: e.entry.source,
		groups: t,
		unsupported: r,
		goldExpression: o,
		goldCoin: o ? "gp" : null
	};
}
function Mn(e, t, n = /* @__PURE__ */ new Set()) {
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
	return On(e.entry).forEach((e, r) => {
		let o = Object.keys(e), s = t?.choice?.[String(r)] ?? (o.length === 1 ? o[0] : void 0);
		s !== void 0 && Array.isArray(e[s]) && e[s].forEach((e, o) => {
			if (typeof e == "string") return a(e, void 0, 1);
			if (e.item) return e.containsValue && !n.has(e.item) && (i += e.containsValue), a(e.item, void 0, e.quantity || 1, e.displayName ? yn(e.displayName) : void 0);
			if (e.equipmentType || e.equipmentTypes) for (let n = 0; n < (e.quantity || 1); n++) {
				let e = t?.pick?.[`${r}.${s}.${o}.${n}`];
				e && a(e, void 0, 1);
			}
			else {
				if (e.special) return e.containsValue && (i += e.containsValue), a(void 0, yn(e.special), e.quantity || 1);
				e.value && (i += e.value);
			}
		});
	}), {
		granted: r,
		cp: i
	};
}
function Nn(e) {
	let t = R.CONFIG.DND5E.currencies, n = t.cp?.conversion ?? 100, r = Object.entries(t).filter(([, e]) => e.conversion != null && e.conversion > 0).map(([e, t]) => ({
		coin: e,
		mult: t.conversion / n
	})).sort((e, t) => t.mult - e.mult), i = R.CurrencyUtil.doSimplifyCoins({ cp: e }, { currencyConversionTable: r });
	return Object.fromEntries(Object.keys(t).map((e) => [e, i[e] || 0]));
}
async function Pn(e, t, n = {}) {
	let r = [], i = [], a = [], o = 0;
	for (let s of e) {
		let { granted: e, cp: c } = Mn(s, t[s.refKey], new Set(n[s.refKey] ?? []));
		o += c;
		for (let t of e) {
			let e;
			if (t.special) e = {
				name: t.special,
				source: t.source,
				page: t.page,
				type: R.Parser.ITM_TYP__OTHER,
				rarity: "unknown"
			};
			else if (e = await R.DataLoader.pCacheAndGetHash(R.UrlUtil.PG_ITEMS, _n(t.uid)), !e) {
				a.push(t.uid);
				continue;
			}
			let n = await P("item", e);
			n.system = {
				...n.system,
				quantity: t.quantity
			}, t.displayName && (n.name = t.displayName), t.special ? (delete n.flags?.plutonium, i.push(n)) : r.push({ data: n });
		}
	}
	return {
		equipment: r,
		specials: i,
		currency: o > 0 ? Nn(o) : null,
		skipped: a
	};
}
async function Fn(e, t, n = {}) {
	let r = [], i = 0;
	for (let o of e) {
		let { granted: e, cp: s } = Mn(o, t[o.refKey], new Set(n[o.refKey] ?? []));
		i += s;
		let l = [];
		for (let t of e) {
			if (t.special) {
				l.push({
					name: c(t.special),
					special: !0,
					quantity: t.quantity
				});
				continue;
			}
			let e = await R.DataLoader.pCacheAndGetHash(R.UrlUtil.PG_ITEMS, _n(t.uid)), n = e ? R.UrlUtil.URL_TO_HASH_BUILDER[R.UrlUtil.PG_ITEMS](e) : void 0;
			l.push(e ? {
				uid: t.uid,
				name: gn(e.name, e.source, n),
				source: e.source,
				hash: n,
				quantity: t.quantity,
				...t.displayName ? { displayName: c(t.displayName) } : {}
			} : {
				uid: t.uid,
				name: a(t.uid),
				quantity: t.quantity
			});
		}
		r.push({
			refKey: o.refKey,
			granted: l,
			cp: s
		});
	}
	return {
		sections: r,
		currency: i > 0 ? Nn(i) : null
	};
}
function In(e) {
	return {
		startingEquipment: (t) => e([], async () => ({
			sections: await Promise.all(t.map(jn)),
			coins: [...R.Parser?.COIN_ABVS ?? []]
		})),
		startingPreview: (t, n, r) => e([], async () => Fn(t, n, r))
	};
}
// src/rules/kernel/frame/author-ids.ts
var Ln = globalThis, Rn = /* @__PURE__ */ new Set([
	"skills",
	"tool",
	"saves"
]);
function zn(e, t) {
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
async function Bn(e) {
	let t = N, n = Ln.dnd5e?.documents?.Trait;
	if (!t || !n) return {};
	let r = t.Charactermancer_OtherProficiencySelect, i = await t.Charactermancer_AvailableProficiencyManager.pGetInstance(), a = new Ln.CONFIG.Actor.documentClass({
		name: "Author ids",
		type: ln
	}), o = {};
	for (let t of new Set(e)) try {
		let e = t.split(":")[0], s = n.changeKeyPath(t);
		if (!s) continue;
		let c = t.split(":").pop(), l = a.clone(Ln.foundry.utils.expandObject({ [s]: Rn.has(e) ? 1 : [c] })), u = r.getExisting(r.getExistingFvttFromActor(l), { availableProficiencyManager: i }), d = Object.entries(u ?? {}).flatMap(([e, t]) => Object.entries(t ?? {}).filter(([e, t]) => e !== "other" && t).map(([t]) => ({
			prop: e,
			name: t
		}))).flatMap((e) => {
			let t = r._getRenderedStatic({
				...e,
				availableProficiencyManager: i
			}), n = typeof t == "string" ? zn(t, Ln.UrlUtil.PAGE_TO_PROPS ?? {}) : null;
			return n ? [n] : [];
		});
		d.length && (o[t] = d);
	} catch (e) {
		console.warn("[trpg-assistant] 作者编号换不出", t, e);
	}
	return o;
}
// src/rules/kernel/frame/proficiency-text.ts
var Vn = globalThis;
function Hn(e, t, n) {
	if (Vn.Renderer.generic.getMappedAnyProficiency({
		keyAny: n.name,
		countRaw: 1
	})) return l(n.name, 1);
	let r = e.Charactermancer_OtherProficiencySelect._getRenderedStatic({
		...n,
		availableProficiencyManager: t
	}), a = typeof r == "string" ? zn(r, Vn.UrlUtil.PAGE_TO_PROPS) : null;
	return a ? f(n.name, a, !0) : i(n.name, [n.name], I(n.name));
}
function Un(e, t, n) {
	let r = n.map((n) => Hn(e, t, n));
	return r.map((e, t) => e.$t === "value" ? {
		...e,
		group: n.filter((e, i) => e.prop === n[t].prop && r[i].$t === "value").map((e) => e.name)
	} : e);
}
// src/rules/kernel/frame/trait-plans.ts
var Wn = globalThis;
function Gn(e, t, n, r, i) {
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
var Kn = (e) => ({
	propDroppable: "item",
	source: e.source,
	hash: Wn.UrlUtil.URL_TO_HASH_BUILDER[Wn.UrlUtil.PG_ITEMS](e)
});
function qn(e, t, n, r, i) {
	return (n.choose ?? []).map((n, a) => {
		if (n.fromFilter) {
			let { propState: e } = t._getPropsChooseFromFilter({
				ixChoose: a,
				ixCount: 0
			}), r = t._modalFilterItemsFvtt.getEntitiesMatchingFilterExpression({ filterExpression: n.fromFilter });
			return {
				count: n.count,
				options: r.filter((e) => !i || i.has(`${e.name}|${e.source}`.toLowerCase())).map((r) => Gn(t, e, {
					prop: n.prop,
					name: Wn.DataUtil.generic.getUid(r)
				}, r.name, f(r.name, Kn(r), !0)))
			};
		}
		let { propState: o } = t._getPropsChooseFrom({ ixChoose: a }), s = t._getChooseFromGroupMeta(n), c = e.ComponentUiUtil.getMetaWrpMultipleChoice(t, o, {
			count: n.count,
			...s?.valueGroups ? { valueGroups: s.valueGroups } : { values: n.from },
			fnDisplay: () => ""
		});
		r.push(c.cleanup);
		let l = s?.valueGroupsFlat ?? n.from, u = Un(e, t._availableProficiencyManager, l);
		return {
			count: n.count,
			hints: s?.valueGroups?.map((e) => e.text).filter(Boolean),
			options: c.rowMetas.map((e, n) => Gn(t, e.propIsActive, !0, l[n]?.name ?? String(n + 1), u[n]))
		};
	});
}
function Jn(e, t, n, r) {
	t._stgGroup = e.veE(document.createElement("div"));
	let i = [];
	return t._render_renderPtChooseAnyProficient = ({ profSet: e, propProfSet: n, propIxProps: r, fnGetValues: a }) => {
		let o = t._getProps(n, 0)[r], s = a().map((e) => Gn(t, o, e, e));
		i.push({
			count: Number(e[n] || 1),
			options: s
		});
	}, t._hk_ixSet_renderPts(n), r.push(() => t._lastMeta.cleanup()), i;
}
function Yn(e, t) {
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
async function Xn(e, t, n, r) {
	let i = {}, a = await n._subComps[0].pGetFormData();
	await e.Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(t, i, { data: { [n._propFormDatas]: [a] } });
	let o = Wn.dnd5e.documents.Trait, s = Object.keys(Wn.CONFIG.DND5E.traits).filter((e) => Wn.foundry.utils.hasProperty(i, o.actorKeyPath(e))), c = t.clone(i), l = /* @__PURE__ */ new Set(), u = [];
	for (let e of s) {
		let n = o.actorKeyPath(e), a = Wn.foundry.utils.getProperty(i, n)?.custom;
		a && u.push({
			label: String(a),
			text: I(String(a))
		});
		let s = await o.actorValues(t, e), d = await o.actorValues(c, e);
		for (let [e, t] of Object.entries(d)) t === r && s[e] !== r && l.add(e);
	}
	return {
		keys: l,
		notes: u
	};
}
async function Zn(e, t, n, r, a, o, s) {
	let c = s ? 2 : 1, l = await Xn(e, t, n, c), u = [], d = [...l.notes], p = /* @__PURE__ */ new Map();
	for (let a of r) {
		let r = /* @__PURE__ */ new Set();
		for (let o of a.options) {
			let s = o.text ?? i(o.label, a.options.map((e) => e.label), I(o.label));
			o.select();
			try {
				let i = [...(await Xn(e, t, n, c)).keys].filter((e) => !l.keys.has(e));
				if (i.length === 1) {
					let e = i[0];
					r.add(e);
					let t = p.get(e);
					p.set(e, t?.$t === "name" && s.$t === "name" ? f(o.label, [...t.ids, ...s.ids], !0) : s);
				} else o.label && d.push({
					label: o.label,
					text: s
				});
			} finally {
				o.clear();
			}
		}
		r.size >= a.count || s && !a.options.length ? u.push({
			count: a.count,
			pool: [...r].sort()
		}) : a.options.length && d.push(...a.options.filter((e) => e.label).map((e) => ({
			label: e.label,
			text: e.text ?? i(e.label, a.options.map((e) => e.label), I(e.label))
		})));
	}
	return {
		index: a,
		extended: o,
		mode: s ? l.keys.size ? "forcedExpertise" : "expertise" : "default",
		grants: [...l.keys].sort(),
		choices: u,
		names: p,
		hints: [...new Set(r.flatMap((e) => e.hints ?? []))],
		withheld: d
	};
}
async function Qn(e, t, n, r, i) {
	let a = n._subComps[0];
	if (a instanceof e.Charactermancer_ImmResVulnSelect) {
		let r = Yn(e, a);
		return r ? [await Zn(e, t, n, r, 0, !1, !1)] : [];
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
			let d = o ? Jn(e, a, r, l) : qn(e, a, r, l, i);
			c.push(await Zn(e, s, n, d, t, u, o));
		} finally {
			for (let e of l) e();
		}
	}
	return c;
}
// src/rules/kernel/frame/author-text.ts
var $n = globalThis, er = ["Renderer"], tr = 8, nr = null;
function rr() {
	let e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new WeakSet(), n = (r, i) => {
		if (typeof r == "string") {
			let t = e.get(r) ?? [];
			t.push(i), e.set(r, t);
		} else if (!(!r || typeof r != "object" && typeof r != "function" || t.has(r) || i.length > tr)) {
			t.add(r);
			for (let [e, t] of Object.entries(Object.getOwnPropertyDescriptors(r))) "value" in t && e !== "prototype" && n(t.value, [...i, e]);
		}
	};
	for (let e of er) n($n[e], [e]);
	return e;
}
function ir(e) {
	if (!e) return null;
	nr ??= rr();
	let t = nr.get(e);
	return t?.length === 1 ? t[0] : null;
}
// src/rules/kernel/frame/build-traits.ts
var ar = globalThis, or = "P6Tr", sr = (e) => typeof e == "string" && /^P6Tr[0-9a-f]{12}$/.test(e), cr = (...e) => or + h(e).slice(0, 12);
function lr(e, t) {
	return E(`build-traits:check:${e?._id}`, () => ur(e, t));
}
async function ur(e, t) {
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
var dr = (e) => e.type === "Trait" && !e.configuration?.grants?.length && !e.configuration?.grants?.size && !e.configuration?.choices?.length;
async function fr(e, t, n) {
	let r = ar.dnd5e.documents.Trait, i = Object.values(e.system?.advancement ?? {}).filter((e) => e.type === "Trait" && !dr(e) && (e.level ?? 0) === t && (!e.classRestriction || e.classRestriction === (n ? "secondary" : "primary")));
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
function pr(e, t) {
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
async function mr(e, t, n, r, i) {
	let a = e.clone(), o = new ar.CONFIG.Item.documentClass({
		...t,
		system: {
			...t.system,
			advancement: n
		}
	}, { parent: a });
	for (let e of o.advancement.byType.Trait ?? []) {
		if (e.configuration.mode !== "default" || e.level !== i) continue;
		let t = r.previous?.find((t) => t.id === e.id)?.data, n = r.picks?.find((t) => t.id === e.id)?.value, a = await ur(e, t ?? n);
		a?.chosen.length && await e.apply(i, a);
	}
	return a;
}
var hr = (t) => e(t, ir(t)), gr = (e, t, n = []) => {
	let r = en(e, t, n);
	return r ? I(r) : hr(String(e._title || e._subComps[0]?.modalTitle || e._prop));
}, _r = (e) => [...new Map(e.map((e) => [JSON.stringify(e), e])).values()];
function vr(e, t, n, r, i = {}) {
	return E(`build-traits:fill:${n}:${r}`, () => yr(e, t, n, r, i));
}
async function yr(e, t, r, i, a) {
	let { replay: s, picks: c, plans: l, actor: u, scope: d, expertise: f } = a;
	if (!t.entry) return [];
	let p = N;
	if (!p) return [n("当前 Plutonium 版本缺少已验证的建卡接线")];
	let m = +(t.prop === "class"), g = t.prop === "class" ? p.Charactermancer_Class_Util.getStandardProficiencies(i ? t.entry.multiclassing?.proficienciesGained ?? {} : {
		proficiency: t.entry.proficiency,
		...t.entry.startingProficiencies
	}) : structuredClone(t.entry), _ = new ar.CONFIG.Actor.documentClass({
		name: "Trait preview",
		type: ln
	}), v = [{ entity: g }], y = await p.Charactermancer_AvailableProficiencyManager.pGetInstance(), b = new p.Charactermancer_FeatureOptionsSelect({
		actor: _,
		optionsSet: v,
		level: m,
		modalFilterSpells: {},
		availableProficiencyManager: y
	}), x = b._subCompManagers.filter((e) => e instanceof p.CharactermancerFeatureSubCompManagerProficiencyOtherBase), ee = await fr(e, m, i), te = We(t.data ?? e), ne = /* @__PURE__ */ new Set(), S = [], C = {};
	try {
		for (let y of x) try {
			if (await y._pInitSubComp({
				ix: 0,
				selectedLinkedEntityInfos: v
			}), !y._subComps[0]) continue;
			let b = u && y._subComps[0] instanceof p.Charactermancer_ExpertiseSelect, w = b ? await mr(u, e, {
				...Object.fromEntries(Object.entries(e.system?.advancement ?? {}).filter(([e]) => !ne.has(e))),
				...C
			}, a, m) : u, re = await Qn(p, _, y, w, d);
			if (!re.length) {
				S.push(gr(y, x));
				continue;
			}
			let T = re.map(({ index: e }) => cr(r, y._prop, m, i, "author-plan", e)), ie = s ?? c?.map((e) => e.id), E = T.findIndex((e) => ie?.includes(e)), D = E < 0 ? 0 : E, O = re[D];
			if (O.extended && s && E < 0) continue;
			let ae = re.map((e, t) => ({
				id: T[t],
				label: e.choices.length ? o(e.choices.map((e) => n(`{0} ×${e.count}`, $t(e.pool) ? I($t(e.pool)) : gr(y, x))), " + ") : $t(e.grants) ? I($t(e.grants)) : gr(y, x)
			})), oe = [...new Map(O.withheld.map((e) => [e.label, e])).values()].sort((e, t) => e.label.localeCompare(t.label));
			oe.length && S.push(n("{0}（暂时无法加到人物卡：{1}）", gr(y, x), o(oe.map((e) => e.text ?? hr(e.label)), "、")));
			let se = h(g[y._prop] || g.entryData?.[y._prop]), k = ee.filter((e) => e.mode === O.mode), A = k.filter(({ id: e }) => te[e]?.field === y._prop && te[e]?.input === se), ce = new Set(A.flatMap((e) => e.grants)), le = A.flatMap((e) => e.slots), ue = ce.size === O.grants.length && O.grants.every((e) => ce.has(e)) && le.length === O.choices.length && pr(O.choices, le)?.length === 0, de = cr(r, y._prop, m, i, "origin"), j = le.length > 0 && !ue && !O.withheld.length && (!s || s.includes(O.extended ? T[D] : de)), fe = j ? k.filter((e) => !A.includes(e)) : k, pe = new Set(fe.flatMap((e) => e.grants)), me = fe.flatMap((e) => e.slots), he = O.grants.filter((e) => !pe.has(e)), ge = j ? O.choices : pr(O.choices, me);
			if (j && O.choices.some((e) => me.some((t) => e.pool.some((e) => t.pool.has(e))))) {
				S.push(n("{0}（与资料附带的进阶重叠，已保留原进阶）", gr(y, x)));
				continue;
			}
			if (!ge) {
				S.push(gr(y, x));
				continue;
			}
			if (!he.length && !ge.length) {
				for (let e of A) l?.set(e.id, {
					choices: [],
					names: O.names
				});
				continue;
			}
			if (j) for (let e of A) ne.add(e.id);
			let M = O.extended ? T[D] : j ? de : cr(r, y._prop, m, i);
			if (l?.set(M, {
				choices: ae.length > 1 ? ae : [],
				names: O.names
			}), C[M] = {
				_id: M,
				type: "Trait",
				level: m,
				...t.prop === "class" ? { classRestriction: i ? "secondary" : "primary" } : {},
				...j && O.hints.length ? { hint: O.hints.join("\n") } : {},
				configuration: {
					mode: O.mode,
					grants: he,
					choices: ge,
					allowReplacements: !1
				},
				value: {}
			}, b && f) {
				let t = new ar.CONFIG.Item.documentClass({
					...e,
					system: {
						...e.system,
						advancement: { [M]: C[M] }
					}
				}, { parent: w });
				f.set(M, t.advancement.byId[M]);
			}
		} catch (e) {
			console.warn("[trpg-assistant] 建卡进阶暂无法处理", r, y._prop, e), S.push(gr(y, x));
		}
	} finally {
		b.unregisterSourceTracking();
	}
	if (e.system) {
		let t = Object.fromEntries(Object.entries(e.system.advancement ?? {}).filter(([e, t]) => !ne.has(e) && !dr(t)));
		e.system.advancement = {
			...t,
			...C
		};
	}
	return _r(S);
}
// src/rules/kernel/frame/import-grants.ts
var br = "tavern-trpg", xr = (e) => N.UtilDocumentItem.getNameAsIdentifier(e), Sr = (e) => e.flags?.[br]?.grants ?? [];
async function Cr(e, t, n, r) {
	let i = r.filter((t) => {
		let n = e.items.get(t)?.type;
		return n && n !== "class" && n !== "subclass";
	});
	i.length && n.length && await e.update({ [`flags.${br}.grants`]: [...Sr(e), {
		cls: t,
		levels: [...n].sort((e, t) => e - t),
		items: i
	}] });
}
async function wr(e, t, n, r = !1, i = Infinity) {
	let a = Sr(e), o = a.filter((e) => e.cls === t && Math.min(...e.levels) > n && Math.max(...e.levels) <= i);
	if (!o.length) return [];
	let s = [...new Set(o.flatMap((e) => e.items))].filter((t) => e.items.get(t));
	return r || (s.length && await e.deleteEmbeddedDocuments("Item", s), await e.update({ [`flags.${br}.grants`]: a.filter((e) => !o.includes(e)) })), s;
}
// src/rules/kernel/frame/commands-level.ts
var Tr = globalThis;
function Er() {
	let e = Tr.dnd5e?.applications?.advancement?.AdvancementManager;
	if (!e) throw Error("dnd5e AdvancementManager is not available");
	return e;
}
function Dr(e, t, n, r = {}) {
	return Er().forLevelChange(e, t, n, r);
}
function z(e) {
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
function Or(e) {
	let t = e?.toObject ? e.toObject() : structuredClone(e);
	for (let e of [
		"_id",
		"_key",
		"folder",
		"sort",
		"ownership",
		"_stats"
	]) delete t[e];
	return t.system && "container" in t.system && (t.system.container = null), Ge(t), t;
}
function kr(e) {
	let t = e?.toObject ? e.toObject() : structuredClone(e);
	return t.flags ??= {}, t.flags.plutonium ??= {}, t.flags.plutonium.isStandardDragDrop = !0, t;
}
function Ar(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
function jr(e) {
	return JSON.parse(JSON.stringify(e, (e, t) => t instanceof Set ? [...t] : t));
}
async function Mr(e, t, { strict: n = !1, picks: r, blank: i = !1, expertise: a } = {}) {
	if (!e.steps.length) return { finished: !0 };
	for (let o of e.steps) {
		if (o.automatic || !o.flow) continue;
		let e = o.flow.advancement, s = t?.find((t) => t.id === e.id && t.level === o.flow.level), c = r?.find((t) => t.id === e.id && (t.level ?? null) === (o.flow.level ?? null));
		if (sr(e.id)) {
			if (s?.error || n && !s) return {
				finished: !1,
				step: {
					...Nr(o),
					error: s?.error
				}
			};
			let t = await lr(a?.get(e.id) ?? e, s?.data ?? c?.value);
			if (!t) return {
				finished: !1,
				step: {
					...Nr(o),
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
					...Nr(o),
					error: s.error
				}
			};
			o.type = "restore", o.flow.retainedData = s.data, o.automatic = !0;
			continue;
		}
		if (await o.flow.getAutomaticApplicationValue() !== !1) continue;
		if (c) {
			let t = c.value?.type === "asi" ? sn(e, c.value) : c.value;
			if (!t) return {
				finished: !1,
				step: {
					...Nr(o),
					error: "属性提升的选择不合规"
				}
			};
			o.flow.getAutomaticApplicationValue = async () => t;
			continue;
		}
		if (n) return {
			finished: !1,
			step: Nr(o)
		};
		let l = (i ? await pn(o.flow) : void 0) ?? await mn(o.flow);
		l !== void 0 && (o.flow.getAutomaticApplicationValue = async () => l);
	}
	let o = new Promise((t) => {
		let n = Tr.Hooks.on("dnd5e.advancementManagerComplete", (r) => {
			r === e && (Tr.Hooks.off(n), t(!0));
		});
		setTimeout(() => {
			Tr.Hooks.off(n), t(!1);
		}, 3e3);
	});
	await e.render();
	let s = await o;
	return s && await w(), s ? { finished: !0 } : {
		finished: !1,
		step: Nr(e.step)
	};
}
function Nr(e) {
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
async function Pr(e) {
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
function Fr(e) {
	return Object.fromEntries(Object.entries(e.system?.abilities ?? {}).map(([e, t]) => [e, t.value]));
}
async function Ir(e, t, n, r = {}, { strict: i = !1, seed: a, id: o, picks: s, blank: c = !1, traitScope: l, onManager: u } = {}) {
	a !== void 0 && k(a);
	let d = await Tr.CONFIG.Actor.documentClass.create({
		...o ? { _id: o } : {},
		name: e,
		type: ln,
		system: { details: { level: 1 } }
	}, { keepId: !!o }), f = l ? new Set(l) : void 0, p = Fr(d), m = [];
	for (let e of t) {
		let t = Or(e?.data ?? e);
		Tr.CONFIG.Item.dataModels[t.type]?.resetData?.(t.system);
		let n = e?.refKey ?? Ar(t), a = n ? r[n] : void 0, o = n && (!i || a?.some((e) => sr(e.id))), l = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), g = n ? s?.[n] : void 0, _ = o ? await vr(t, e, n, d.items.some((e) => e.type === "class"), {
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
		let v = [...a ?? [], ...n ? s?.[n] ?? [] : []].find((e) => sr(e.id) && !(e.id in (t.system?.advancement ?? {})));
		if (v) return {
			pending: !0,
			step: {
				error: "存档中的建卡步骤已变更",
				id: v.id,
				refKey: n
			},
			built: z(d),
			actor: d,
			initial: p,
			missingTraits: m
		};
		let y = Er().forNewItem(d, t, { automaticApplication: !0 });
		await u?.({
			manager: y,
			key: n,
			unsupported: _,
			picks: g,
			traitPlans: l,
			expertise: h
		});
		let b = await Mr(y, a, {
			strict: i,
			blank: c,
			picks: g,
			expertise: h
		});
		if (!b.finished) return {
			pending: !0,
			step: b.step,
			built: z(d),
			actor: d,
			initial: p,
			missingTraits: m
		};
		d.items.contents.some((e) => e.type === t.type && e.flags?.plutonium?.hash === t.flags?.plutonium?.hash) || await d.createEmbeddedDocuments("Item", [kr(Or(t))]);
	}
	return n.length && await d.createEmbeddedDocuments("Item", n.map((e) => kr(Or(e?.data ?? e)))), {
		actor: d,
		initial: p,
		missingTraits: m
	};
}
function Lr(e, t) {
	return {
		levelUpSteps: (n, r, i = 1) => e([], async () => {
			let e = await Pr(Dr(t(n), r, i));
			return {
				status: e.length ? "pending" : "complete",
				steps: e
			};
		}, [n]),
		levelUpApply: (n, r, i = 1, a, o) => e([], async () => {
			let e = t(n), s = e.items.get(r);
			if (!s) throw Error(`人物身上没有这件职业（${r}）`);
			let c = String(s.system?.identifier ?? ""), l = Number(s.system?.levels ?? 0) + i, u = Dr(e, r, i, { automaticApplication: !0 }), d = await Mr(u, a);
			return d.finished ? (i < 0 && c && await wr(e, c, l, !1, o ?? Infinity), z(e)) : {
				kernelStatus: "pending",
				reason: u.step ? "awaiting-choice" : "advancement-manager-not-complete",
				step: d.step
			};
		}, [n]),
		captureChoices: (n) => e([], async () => {
			let e = t(n).clone(), r = {};
			for (let t of ot(e)) {
				let e = t.item.advancement.byId[t.adv.id];
				try {
					let n = await e.reverse(t.level);
					n != null && (r[t.key] ??= []).push({
						id: t.adv.id,
						type: t.type,
						level: t.level,
						data: jr(n)
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
			}), z(e);
		}, [n]),
		createActorsFromBase: (t) => e([], async () => {
			let e = Tr.CONFIG.Actor.documentClass, n = await e.createDocuments(t.map((e) => ({
				...structuredClone(e.base),
				...e.id ? { _id: e.id } : {}
			})), { keepId: !0 }), r = [];
			for (let i = 0; i < n.length; i++) {
				let a = await St(n[i], t[i].off, t[i].state);
				if (a.problems.length) return await e.deleteDocuments(n.map((e) => e.id)), {
					kernelStatus: "error",
					problems: a.problems
				};
				r.push({
					id: n[i].id,
					...z(n[i]),
					data: n[i].toObject(),
					base: t[i].base,
					view: a.view,
					offChoices: a.choices
				});
			}
			return r;
		}),
		buildCharacter: (t) => e([], async () => {
			let e = t.seed ?? se(), n = [];
			for (let e of t.items) n.push({
				...e,
				data: e.data ?? await P(e.prop, e.entry)
			});
			let r = [];
			for (let e of t.equipment ?? []) r.push({
				data: e.data ?? await P(e.prop, e.entry),
				refKey: e.refKey
			});
			let i = t.starting ? await Pn(t.items.filter((e) => e.entry?.startingEquipment), t.starting, t.startingExcluded) : null, a = await Ir(t.name, n, [...r, ...i?.equipment ?? []], t.choices ?? {}, {
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
				...z(a.actor)
			});
		}),
		buildSteps: (t) => e([], async () => {
			let e = Tr.CONFIG.Actor.documentClass, n = new e({
				name: "Build preview",
				type: ln,
				system: { details: { level: 1 } }
			}), r = await Pr(Er().forNewItem(n, t));
			return {
				status: r.length ? "pending" : "complete",
				steps: r
			};
		}),
		importForBuild: (t, n) => e([], async () => P(t, n)),
		importerProps: et,
		importerMeta: tt,
		actorTypes: (t, n) => e([], async () => un(t, n)),
		rebuildCharacter: (t) => e([], async () => {
			let e = t.seed?.trim() || t.name;
			k(e);
			let n = [];
			for (let e of t.items) n.push({
				...e,
				data: e.data ?? await P(e.prop, e.entry)
			});
			let r = [];
			for (let e of t.equipment) r.push({
				data: e.data ?? await P(e.prop, e.entry),
				refKey: e.refKey,
				itemId: e.itemId
			});
			let i = await Ir(t.name, n, r, t.choices, {
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
			[...i.actor.items].filter((e) => e.type === "class").length > 1 && await dn(i.actor, t.choices, [...t.items, ...t.equipment]);
			let a = i.actor.toObject(), o = await St(i.actor, t.off, t.state);
			return o.problems.length ? (await i.actor.delete(), {
				kernelStatus: "error",
				problems: o.problems
			}) : {
				id: i.actor.id,
				seed: e,
				...z(i.actor),
				data: i.actor.toObject(),
				base: a,
				view: o.view,
				offChoices: o.choices
			};
		})
	};
}
// src/rules/kernel/frame/commands-add.ts
var Rr = globalThis;
function zr(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
async function Br(e, t) {
	let n = e.items.get(t);
	if (!n) throw Error(`人物身上没有这件：${t}`);
	let r = Er().forDeletedItem(e, t, { automaticApplication: !0 });
	if (r.steps.length) {
		let e = await Mr(r, void 0);
		return e.finished ? null : e.step;
	}
	return await n.delete(), null;
}
function Vr(e, t) {
	return {
		addToActor: (n, r) => e([], async () => {
			let e = t(n), i = e.sheet;
			if (!i?._onDropSingleItem) throw Error(`人物 ${n} 没有官方人物表单实例`);
			let a = [];
			for (let t of r) {
				let n = kr(Or(t.data ? structuredClone(t.data) : await P(t.prop, t.entry))), r = new Set(e.items.map((e) => e.id)), o = Er().forNewItem(e, n, { automaticApplication: !0 });
				if (o.steps.length) {
					let e = await Mr(o, t.choices, { strict: !1 });
					if (!e.finished) return {
						kernelStatus: "pending",
						reason: "add-step-not-complete",
						step: e.step,
						pending: { step: e.step }
					};
				} else {
					let t = await i._onDropSingleItem({ target: Rr.document.createElement("div") }, n);
					if (t === !1 || t === void 0) continue;
					let r = await e.createEmbeddedDocuments("Item", [t], { keepId: !0 });
					a.push(...r.map((e) => e.toObject()));
				}
				for (let t of e.items) !r.has(t.id) && zr(t) && a.push(t.toObject());
			}
			return {
				...z(e),
				added: a
			};
		}, [n]),
		removeItem: (n, r) => e([], async () => {
			let e = t(n), i = await Br(e, r);
			return i ? {
				kernelStatus: "pending",
				reason: "remove-step-not-complete",
				step: i,
				pending: { step: i }
			} : {
				...z(e),
				removed: r
			};
		}, [n])
	};
}
// src/rules/kernel/frame/commands-batch.ts
var Hr = globalThis;
function Ur(e, t) {
	let n = structuredClone(e);
	delete n._id;
	for (let e of n.items ?? []) delete e._id;
	for (let e of n.effects ?? []) delete e._id;
	return t && (n.name = t), n;
}
function Wr(e) {
	return { createActorsBatch: (t) => e([], async () => {
		let e = [];
		for (let n of t) {
			let t = n.data ?? await P(n.prop, n.entry);
			e.push(Ur(t, n.name));
		}
		return (await Hr.CONFIG.Actor.documentClass.createDocuments(e)).map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			data: e.toObject()
		}));
	}) };
}
// src/rules/kernel/frame/build-extras.ts
var B = globalThis, Gr = (e) => (t) => B.UrlUtil.URL_TO_HASH_BUILDER[e](t), Kr = (e, t) => new Map(e.map((e) => [t(e.entry), e])), qr = [{
	field: "featProgression",
	kind: "feat",
	primer: "DataPrimerFauxFeatureClassSubclassFeat"
}, {
	field: "optionalfeatureProgression",
	kind: "optionalfeature",
	primer: "DataPrimerFauxFeatureClassSubclassOptionalfeature"
}];
function Jr(e, t) {
	let n = "dataSources", r = "isGmUseBlocklist", i = e.Config.get(n, r);
	e.Config.setTemp(n, r, !1, { isSkipPermissionCheck: !0 });
	try {
		return t();
	} finally {
		e.Config.setTemp(n, r, i, { isSkipPermissionCheck: !0 });
	}
}
function Yr(e, t) {
	let n = t === "classFeature" ? B.DataUtil.class.unpackUidClassFeature : B.DataUtil.class.unpackUidSubclassFeature;
	return (e[`${t}s`] ?? []).flat(Infinity).map((e) => {
		let r = e?.[t] ?? e;
		return typeof r == "string" ? {
			...n.call(B.DataUtil.class, r),
			...typeof e == "object" ? e : {},
			[t]: r
		} : e;
	});
}
function Xr(e, t, n, r, i, a) {
	let o = structuredClone(t.entry);
	if (o.classFeatures = Yr(o, "classFeature"), o.subclasses = [], e.Charactermancer_Class_Util.getAllFeatures(o).find((e) => e.gainSubclassFeature)?.level === r) {
		let e = new Set([o, a].filter(Boolean).map((e) => B.UrlUtil.URL_TO_HASH_BUILDER.class(e))), s = (n.subclass ?? []).filter((t) => [t.entry, t.local].filter(Boolean).some((t) => e.has(B.UrlUtil.URL_TO_HASH_BUILDER.class({
			name: t.className,
			source: t.classSource
		}))));
		i.extras.push({
			id: `${t.refKey}|subclass|${r}`,
			kind: "subclass",
			title: o.subclassTitle ? c(String(o.subclassTitle)) : I(B.game.i18n.localize("DND5E.ADVANCEMENT.Subclass.Title")),
			count: 1,
			candidates: s.map(({ key: e }) => ({ key: e }))
		});
	}
}
function Zr(e, t, r, i, a) {
	let o = t.entry;
	for (let { field: s, kind: l, primer: u } of qr) {
		if (!o[s]?.length) continue;
		let d = new e[u](), f = Gr(l), p = Kr(r[l] ?? [], f), m = d._addFauxFeatureFeatures_getFauxFeature, h = 0;
		d._addFauxFeatureFeatures_getFauxFeature = function(...e) {
			let r = m.apply(this, e);
			return r.level === i && e[5] > 0 && (e[6].length ? a.blocked.push(n("{0}：这组包含固定选项，暂时无法在这里应用", c(String(r.name)))) : a.extras.push({
				id: `${t.refKey}|${s}|${i}|${h++}`,
				kind: l,
				title: c(String(r.name)),
				count: e[5],
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
		if (t.prop === "class" && (g.classFeatures = Yr(g, "classFeature")), t.prop === "subclass") {
			g.subclassFeatures = Yr(g, "subclassFeature");
			let t = {
				name: g.className,
				source: g.classSource,
				subclasses: [g]
			};
			Jr(e, () => d.addFauxFeatureFeatures([t], [...p.values()].map(({ entry: e }) => e)));
		} else t.prop === "class" && Jr(e, () => d.addFauxFeatureFeatures([g], [...p.values()].map(({ entry: e }) => e)));
	}
}
async function Qr(t, r, i, a, s) {
	let c = r.entry.feats;
	if (t.StatGenUtilAdditionalFeats.isNoChoice(c)) return;
	if (c.length !== 1) {
		s.blocked.push(n("专长有多套备选方案，建卡暂时无法在方案间切换"));
		return;
	}
	let l = await a(), u = Kr(i, Gr("feat")), d = new t.Charactermancer_AdditionalFeatsSelect({
		available: c,
		modalFilterFeats: l,
		modalFilterSpells: {},
		availableProficiencyManager: {}
	});
	d._render_renderPtStatic = () => void 0, d._render_renderPtChooseFromFilter = ({ count: t, filterExpression: n, titleNote: i, featsAdditionType: a }) => {
		let c = l.getEntitiesMatchingFilterExpression({ filterExpression: n }), d = i ? [...new Set(c.map((e) => e.category).filter((e) => !!e))] : [], f = o([e(B.Parser.getPropDisplayName("feat"), [
			"Parser",
			"CAT_ID_TO_FULL",
			String(B.Parser.CAT_ID_FEAT)
		]), ...d.map((t) => e(B.Parser.featCategoryToFull(t), [
			"Parser",
			"FEAT_CATEGORY_TO_FULL",
			t
		]))], " · ");
		s.extras.push({
			id: `${r.refKey}|feats|${a}`,
			kind: "feat",
			title: f,
			count: t,
			candidates: c.flatMap((e) => {
				let t = u.get(Gr("feat")(e));
				return t ? [{ key: t.key }] : [];
			})
		});
	};
	let f = t.veE(document.createElement("div"));
	d._hk_ixSet_renderPts({
		stgGroupLeft: f,
		stgGroupRight: f,
		featSet: c[0]
	});
}
function $r(e, t, n, r) {
	t.candidates = t.candidates.filter((t) => {
		let i = r.get(t.key)?.entry, a = i?.prerequisite;
		if (!Array.isArray(a) || !a.length) return !0;
		let [o] = a;
		if (a.length === 1 && typeof o?.level == "number" && Object.keys(o).length === 1) {
			let t = e.UtilDataConverter.getPrerequisiteLevelNumber({ prereqs: a });
			return new B.CONFIG.Item.documentClass({
				name: i?.name,
				type: "feat",
				system: { prerequisites: { level: t } }
			}).system.assertPrerequisites(n) === !0;
		}
		return t.needsCheck = !0, !0;
	});
}
async function ei(e, t, n, r) {
	if (!N) throw Error("此版本 Plutonium 缺少建卡选择入口");
	let i = N, a = t.feat ?? [], o = new Map(Object.values(t).flat().map((e) => [e.key, e])), s, c = () => s ??= i.Charactermancer_AdditionalFeatsSelect._pGetUserInput_pGetModalFilterFeats({ allData: { feat: a.map(({ entry: { prerequisite: e, ...t } }) => t) } }), l = [];
	for (let s of e) {
		let e = {
			refKey: s.refKey,
			extras: [],
			blocked: []
		};
		s.prop === "class" && Xr(i, s, t, 1, e, r[s.refKey]), (s.prop === "class" || s.prop === "subclass") && Zr(i, s, t, 1, e), s.entry.feats?.length && await Qr(i, s, a, c, e);
		for (let t of e.extras) $r(i, t, n, o);
		l.push(e);
	}
	return l;
}
// src/rules/kernel/frame/advancement-title.ts
function ti(e) {
	let t = (e?.constructor?.typeName ?? e?.type) === "Trait" ? tn(e) : null, n = e?._source?.name || e?._source?.title, r = e?.name ?? e?.title;
	return t ? I(t) : n ? c(String(n), Lt(String(n))) : r ? I(String(r)) : null;
}
// src/rules/kernel/frame/commands-options.ts
var ni = (e, t = []) => Object.entries(e ?? {}).flatMap(([e, n]) => n?.children ? ni(n.children, [...t, I(String(n.label ?? e))]) : [{
	value: e,
	label: String(n?.label ?? e),
	path: t
}]), ri = {
	Trait: async (e, t, n) => {
		let { available: r } = await e.unfulfilledChoices(), i = r.filter((e) => e.type === "grant").flatMap((e) => ni(e.choices)), a = /* @__PURE__ */ new Map();
		for (let e of r.filter((e) => e.type === "choice")) {
			let t = a.get(e.choiceIdx) ?? {
				count: 0,
				options: ni(e.choices)
			};
			t.count++, a.set(e.choiceIdx, t);
		}
		let o = i[0]?.value ?? [...a.values()][0]?.options[0]?.value, s = n.get(e.id), c = s?.choices.length ? s.choices : void 0;
		if (!a.size && !c) return null;
		let l = [...a.values()], u = await Bn([...i, ...l.flatMap((e) => e.options)].map((e) => e.value)), d = (e) => {
			let t = s?.names.get(e.value) ?? (u[e.value] ? f(e.label, u[e.value], !0) : I(e.label)), n = t.$t === "name" ? t.ids : [];
			return {
				...e,
				label: t,
				...n.length === 1 ? { author: n[0] } : {}
			};
		};
		return {
			kind: "trait",
			trait: e.configuration?.type ?? o?.split(":")[0] ?? null,
			grants: i.map(d),
			slots: l.map((e) => ({
				...e,
				options: e.options.map(d)
			})),
			...c ? { plans: c } : {}
		};
	},
	AbilityScoreImprovement: async (e, t) => on(e, t)
}, ii = /* @__PURE__ */ new Set([
	"HitPoints",
	"ScaleValue",
	"Size",
	"ItemGrant",
	"Subclass"
]);
async function ai(t, n = [], r, i) {
	let a = [];
	for (let s of t.steps) {
		let t = s.flow?.advancement;
		if (!t) continue;
		let c = t.constructor?.typeName ?? t.type, l = await s.flow.getAutomaticApplicationValue?.() !== !1, u = null, d = !1, f = n.find((e) => e.id === t.id && (e.level ?? null) === (s.flow.level ?? null))?.value;
		ri[c] ? u = await ri[c](i.get(t.id) ?? t, f, r) : !l && !ii.has(c) && (d = !0);
		let p = ti(t), m = c === "Trait" && t.hint ? o(String(t.hint).split("\n").map((t) => e(t, ir(t))), "\n") : void 0;
		a.push({
			id: t.id,
			level: s.flow.level ?? null,
			type: c,
			title: p,
			...m ? { hint: m } : {},
			automatic: l,
			options: u,
			...d ? { unsupported: !0 } : {}
		});
	}
	return a;
}
function oi(e) {
	return { buildOptions: (t) => e([], async () => {
		let e = [];
		for (let n of t.items) e.push({
			...n,
			data: n.data ?? await P(n.prop, n.entry)
		});
		let n = [], r = await Ir("选项预览", e, [], t.choices ?? {}, {
			strict: !1,
			picks: t.picks,
			blank: t.blank,
			traitScope: t.traitScope,
			onManager: async ({ manager: e, key: t, unsupported: r, picks: i, traitPlans: a, expertise: o }) => {
				n.push({
					refKey: t,
					steps: await ai(e, i, a, o),
					unsupported: r
				});
			}
		}), i = r.actor ?? r.created;
		try {
			let e = t.extraPools && Object.keys(t.extraPools).length ? await ei(t.items, t.extraPools, i, t.local ?? {}) : [], a = new Map(n.map((e) => [e.refKey, e]));
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
					auto: Fr(i),
					cap: globalThis.CONFIG?.DND5E?.maxAbilityScore ?? null,
					labels: Object.fromEntries(Object.entries(Jt("abilities")).map(([e, t]) => [e, I(t)]))
				}
			};
		} finally {
			await (r.actor ?? r.created)?.delete?.();
		}
	}) };
}
// src/rules/kernel/frame/registry-keys.ts
var si = globalThis, ci = null, li = (e) => typeof e?.label == "string" ? e.label : typeof e?.name == "string" ? e.name : typeof e?.labels?.title == "string" ? e.labels.title : null;
function ui(e, t = []) {
	if (!e || typeof e != "object" || Array.isArray(e)) return t;
	for (let [n, r] of Object.entries(e)) t.push([n, r]), r?.children && ui(r.children, t);
	return t;
}
function di() {
	let e = (e) => typeof e == "string" ? e : li(e);
	ci = {
		tables: Object.fromEntries(Object.entries(si.CONFIG.DND5E ?? {}).map(([t, n]) => [t, Object.fromEntries(ui(n).flatMap(([t, n]) => {
			let r = e(n);
			return r ? [[t, r]] : [];
		}))])),
		statuses: Object.fromEntries((si.CONFIG.statusEffects ?? []).filter((e) => typeof e?.name == "string").map((e) => [e.id, e.name]))
	};
}
var fi = () => ci !== null, pi = null;
function mi(e) {
	let t = si.game.i18n, n = pi;
	if (!n || n.i18n !== t) {
		let e = /* @__PURE__ */ new Map(), r = (t, n) => {
			for (let [i, a] of Object.entries(t ?? {})) typeof a == "string" ? e.set(a, [...e.get(a) ?? [], [...n, i].join(".")]) : a && typeof a == "object" && r(a, [...n, i]);
		};
		r(t.translations, []), r(t._fallback, []), n = pi = {
			i18n: t,
			byText: e
		};
	}
	return (n.byText.get(e) ?? []).filter((e) => t.has(e));
}
function hi(e, t) {
	return zt([.../* @__PURE__ */ new Set([...t && si.game.i18n.has(t) ? [t] : [], ...mi(e)])], e);
}
function gi(e, t) {
	let n = {};
	for (let [r, i] of ui(t)) {
		let t = ci?.tables[e]?.[r] ?? null, a = t && si.game.i18n.has(t) ? t : null, o = typeof i == "string" ? i : li(i);
		if (!o || !a && typeof i == "string") continue;
		let s = hi(a ? si.game.i18n.localize(a) : o, a);
		s && (n[r] = s);
	}
	return n;
}
function _i() {
	return ci ? /* @__PURE__ */ new Set([...Object.values(ci.tables).flatMap((e) => Object.keys(e)), ...Object.keys(ci.statuses)]) : /* @__PURE__ */ new Set();
}
var vi = (e) => ci?.statuses[e] ?? null, yi = globalThis;
function bi(e, t, n) {
	let r = [], i = [], a = [], o = (e) => String(yi.UrlUtil.encodeForHash(e)), s = n.replace(/\s*\.\.\.$/, "").trim().toLowerCase(), c = (e, n, l, u = !1) => {
		if (Array.isArray(e)) e.forEach((e, t) => c(e, n, [...l, t], u));
		else if (typeof e == "string") u && s.length >= 8 && String(yi.Renderer.stripTags(e)).trim().toLowerCase().startsWith(s) && a.push({
			entry: n,
			path: l
		});
		else if (e && typeof e == "object") {
			if (l.length && typeof e.name == "string") {
				let a = String(yi.Renderer.stripTags(e.name)), s = a.replace(/\s*\([^()]*\)\s*$/, "").replace(/\s*[.?!]$/, ""), c = N?.UtilEntityBackgroundFeature?._getEntityAliases_name_noFeature?.({ name: a }) ?? null;
				t.startsWith(`${o(a)}_`) ? r.push({
					entry: n,
					path: [...l, "name"]
				}) : (s !== a && t.startsWith(`${o(s)}_`) || c && t.startsWith(`${o(c)}_`)) && i.push({
					entry: n,
					path: [...l, "name"]
				});
			}
			for (let [t, r] of Object.entries(e)) r && typeof r == "object" && c(r, n, [...l, t], e.type === "list" && t === "items");
		}
	};
	return e.forEach((e, t) => c(e, t, [])), r.length ? r.length === 1 ? r[0] : null : i.length ? i.length === 1 ? i[0] : null : a.length === 1 ? a[0] : null;
}
function xi(e, n) {
	let r = e.flags?.plutonium, i = r && !r.propDroppable && typeof r.page == "string" && r.page.endsWith(".html") ? yi.UrlUtil?.PAGE_TO_PROPS?.[r.page]?.[0] : null, o = i ? {
		...r,
		propDroppable: i
	} : r, s = !!o?.propDroppable && typeof o.page == "string" && o.page.endsWith(".html") && !o.isDirectImport, l = e.flags?.["tavern-trpg"]?.named === !0;
	if (o?.propDroppable && typeof o.hash == "string") {
		let n = {
			propDroppable: o.propDroppable,
			...o.source ? { source: o.source } : {},
			hash: o.hash
		};
		return l ? {
			name: a(String(e.name ?? "")),
			author: n
		} : {
			name: s ? c(e.name, t(e.name, n, hi(String(e.name ?? ""), null) ?? Wt(String(e.name ?? "")))) : f(e.name, n),
			author: n
		};
	}
	if (l) return { name: a(String(e.name ?? "")) };
	let u = typeof o?.hash == "string" ? bi(n, o.hash, String(e.name ?? "")) : null;
	return u ? { name: c(e.name, void 0, u) } : { name: hi(String(e.name ?? ""), null) ?? c(e.name, Wt(String(e.name ?? ""))) };
}
// src/rules/kernel/frame/action-list.ts
var Si = globalThis, Ci = [
	"action",
	"bonus",
	"reaction",
	"legendary",
	"mythic",
	"lair",
	"crew",
	"special"
], wi = (e) => e.system.activities?.contents?.[0]?.activation?.type, Ti = (e) => !!e && ![
	"minute",
	"hour",
	"day",
	"none"
].includes(e), Ei = (e) => !!(e.system.hasLimitedUses && e.system.uses?.recovery?.length), Di = (e) => String(e.system.method ?? e.system.preparation?.mode ?? ""), Oi = () => Si.CONFIG.DND5E.spellPreparationStates ?? {};
function ki(e) {
	if (!(e.system.level > 0)) return !1;
	let t = e.system.prepared;
	return e.system.canPrepare && t === Oi().prepared?.value || e.system.canPrepare && t === Oi().always?.value || Di(e) === "atwill" && !Ei(e) || Di(e) === "innate" && !Ei(e) || Ei(e) && e.system.uses?.value > 0 || !!e.system.linkedActivity?.item;
}
function Ai(e) {
	let t = e.system.activities;
	return !!(t?.getByType?.("attack")?.[0] ?? t?.getByType?.("damage")?.[0] ?? t?.getByType?.("save")?.[0])?.damage?.parts?.length;
}
function ji(e) {
	let t = e.flags?.["tavern-trpg"]?.actionList;
	if (t === !0 || t === !1) return t;
	switch (e.type) {
		case "weapon": return !!e.system.equipped;
		case "equipment": return !!e.system.equipped && Ti(wi(e));
		case "consumable": return Ti(wi(e));
		case "spell": {
			let t = e.system.linkedActivity?.item, n = !!t && (t.system.attunement !== "required" || t.system.attuned), r = e.system.level === 0;
			if (!r && !(ki(e) || n) || t && r && !n) return !1;
			let i = wi(e), a = e.system.duration ?? {};
			return i === "reaction" || i === "bonus" || Ai(e) || a.units === "minute" && Number(a.value) === 1 || a.units === "round" && Number(a.value) === 1 || !!e.effects?.size;
		}
		case "feat": return !!wi(e);
		default: return !1;
	}
}
function Mi(e) {
	let t = new Map(Ci.map((e) => [e, []]));
	for (let n of e.items) {
		if (!ji(n)) continue;
		let e = wi(n), r = e && Ci.includes(e) ? e : "other";
		t.set(r, [...t.get(r) ?? [], n]);
	}
	let n = (e) => {
		let t = Si.CONFIG.DND5E.activityActivationTypes?.[e]?.label;
		return I(t ? Si.game.i18n.localize(t) : e === "other" ? "Other" : e);
	};
	return [...t.entries()].filter(([, e]) => e.length).map(([e, t]) => ({
		id: e,
		label: n(e),
		items: t
	}));
}
// src/rules/kernel/frame/sheet-view.ts
var V = globalThis, Ni = (e) => !!e && e.constructor === V.foundry.data.fields.StringField;
function Pi(e, t, n) {
	if (e == null || !t) return n;
	if (typeof e == "string") return Ni(t) && e.trim() && n.add(e), n;
	if (typeof e != "object") return n;
	let r = t.element ?? (t.model instanceof V.foundry.data.fields.DataField ? t.model : null), i = t.fields;
	for (let [t, a] of Object.entries(e)) {
		let e = i ? i[t] : r;
		e && Pi(a, e, n);
	}
	return n;
}
function Fi(e, t, n, r = /* @__PURE__ */ new Set(), i = 0) {
	if (typeof e == "function") return;
	if (typeof e != "object" || !e) return e;
	if (i > 10 || r.has(e) || e === V.CONFIG || e === V.CONFIG?.DND5E || e === V.game || n.has(e)) return;
	let a = V.foundry;
	if (e instanceof a.abstract.Document) {
		if (e.documentName !== "Item") return {
			documentName: e.documentName,
			id: e.id ?? null
		};
		let a = e.labels ? Fi(e.labels, t, n, r, i + 1) : void 0;
		return {
			documentName: "Item",
			id: e.id,
			...xi(e, t),
			...a ? { labels: a } : {}
		};
	}
	if (!(e instanceof a.data.fields.DataField || e instanceof a.applications.api.ApplicationV2)) {
		r.add(e);
		try {
			if (e instanceof Set) return [...e].map((e) => Fi(e, t, n, r, i + 1));
			if (e instanceof Map) return Object.fromEntries([...Map.prototype.entries.call(e)].map(([e, a]) => [e, Fi(a, t, n, r, i + 1)]));
			if (Array.isArray(e)) return e.map((e) => Fi(e, t, n, r, i + 1));
			let a = {};
			for (let o of Object.keys(e)) {
				if (o.startsWith("_")) continue;
				let s = Fi(e[o], t, n, r, i + 1);
				s !== void 0 && (a[o] = s);
			}
			return a;
		} finally {
			r.delete(e);
		}
	}
}
function Ii(e, t) {
	let n = /* @__PURE__ */ new Set();
	return [...e.items].map((e) => String(e.name ?? "")).filter((e) => e.length >= 3 && /[A-Za-z]/.test(e) && !n.has(e) && n.add(e)).sort((e, t) => t.length - e.length).map((n) => ({
		re: RegExp(`(?<![A-Za-z])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z])`),
		text: xi([...e.items].find((e) => e.name === n), t).name
	}));
}
async function Li(e) {
	let t = V.CONFIG.DND5E, n = V.dnd5e.documents.Trait, r = /* @__PURE__ */ new Set([
		...[...e.system.traits?.weaponProf?.value ?? []].filter((e) => t.weaponIds?.[e]),
		...[...e.system.traits?.armorProf?.value ?? []].filter((e) => t.armorIds?.[e] || t.shieldIds?.[e]),
		...Object.keys(e.system.tools ?? {}).filter((e) => t.tools?.[e])
	]);
	if (!r.size) return [];
	let i = await De(), a = [];
	for (let e of r) {
		let r = String(n.getBaseItem(t.weaponIds?.[e] ?? t.armorIds?.[e] ?? t.shieldIds?.[e] ?? t.tools?.[e]?.id ?? e, { indexOnly: !0 })?.name ?? ""), o = i.get(e);
		r && /[A-Za-z]/.test(r) && o && a.push({
			re: RegExp(`(?<![A-Za-z])${r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z])`),
			text: f(r, o, !0)
		});
	}
	return a;
}
function Ri(e, t) {
	if (!/[A-Za-z]/.test(e)) return null;
	for (let { re: n, text: r } of t) {
		let i = n.exec(e);
		if (!i) continue;
		let s = e.slice(0, i.index), c = e.slice(i.index + i[0].length), l = (e) => e ? [Ri(e, t) ?? a(e)] : [];
		return o([
			...l(s),
			r,
			...l(c)
		], "");
	}
	return null;
}
function zi(e, t, n, r) {
	if (typeof e == "string") {
		if (e.includes(".") && !/\s/.test(e) || /^[A-Z][A-Za-z]{2,}$/.test(e)) {
			let t = Rt(e);
			if (t) return t;
		}
		return t.has(e) && !n.has(e) && /\p{L}/u.test(e) ? hi(e, null) ?? c(e) : Ri(e, r) ?? e;
	}
	return !e || typeof e != "object" || typeof e.$t == "string" ? e : Array.isArray(e) ? e.map((e) => zi(e, t, n, r)) : Object.fromEntries(Object.entries(e).map(([e, i]) => [e, e === "author" ? i : zi(i, t, n, r)]));
}
async function Bi(e, t) {
	let n = e.sheet, r = (e) => JSON.parse(JSON.stringify(e)), i = Object.keys(n.constructor.PARTS ?? {}), a = await n._prepareContext(r({ parts: i })), o = {};
	for (let e of i) {
		let t = await n._preparePartContext(e, Object.assign({}, a), r({}));
		o[e] = Object.fromEntries(Object.entries(t).filter(([e]) => !(e in a)));
	}
	let s = Pi(e.toObject().system, e.system.schema, /* @__PURE__ */ new Set());
	for (let t of e.items) Pi(t.toObject().system, t.system.schema, s);
	let c = _i(), l = new Set([e._source].filter(Boolean));
	o.actions = await Vi(e, n, o), await Hi(e, a.itemContext);
	let u = [...Ii(e, t), ...await Li(e)];
	return {
		sheet: n.constructor.name,
		base: zi(Fi(a, t, l), s, c, u),
		parts: zi(Fi(o, t, l), s, c, u)
	};
}
async function Vi(e, t, n) {
	return t instanceof V.dnd5e.applications.actor.NPCActorSheet ? { sections: n.features?.sections ?? [] } : { sections: Mi(e) };
}
async function Hi(e, t) {
	if (!t) return;
	let n = new Set([...e.items].filter((e) => e.type === "subclass").map((e) => e.system?.classIdentifier));
	for (let r of [...e.items].filter((e) => e.type === "class")) {
		let e = t[r.id], i = r.flags?.plutonium;
		if (!e || e.needsSubclass || n.has(r.system?.identifier) || !i?.source || !i?.hash) continue;
		let a = [(await V.DataLoader.pCacheAndGet(V.UrlUtil.PG_CLASSES, i.source, i.hash).catch(() => null))?.classFeatures ?? []].flat(2).filter((e) => e?.gainSubclassFeature).map((e) => Number(e.level ?? V.DataUtil.class.unpackUidClassFeature(String(e.classFeature ?? ""))?.level)).filter((e) => Number.isFinite(e));
		a.length && Number(r.system?.levels ?? 0) >= Math.min(...a) && (e.needsSubclass = !0);
	}
}
// src/rules/kernel/frame/sheet-traits.ts
var Ui = (e) => typeof e == "number" && Number.isFinite(e) ? e : Number(e) || 0, Wi = (e) => e.constructor?.typeName ?? e.type;
function Gi(e) {
	let t = e.system, n = e._source?.system ?? {}, r = e.type === "character" && t.details?.race && typeof t.details.race == "object" ? t.details.race : null, i = r ? it(r) : null, a = r ? Object.values(r.advancement?.byId ?? {}).find((e) => Wi(e) === "Size") : null, o = (e, t, n, r) => Object.keys(e ?? {}).map((a) => {
		let o = Ui(n?.[a]);
		return {
			key: a,
			value: Ui(e?.[a]),
			own: Ui(t?.[a]),
			species: o,
			off: i && o ? {
				ref: i,
				part: `${r}.${a}`
			} : null
		};
	}).filter((e) => e.value || e.own || e.species), s = r ? r.system?.type ?? {} : t.details?.type ?? {};
	return {
		species: r ? {
			id: r.id,
			name: r.name
		} : null,
		size: {
			value: String(t.traits?.size ?? ""),
			species: a?.value?.size ?? null,
			off: i && a ? {
				ref: i,
				advancement: a.id
			} : null,
			codes: { ...N?.VET_SIZE_TO_ABV ?? {} }
		},
		type: {
			value: String(s.value ?? ""),
			subtype: String(s.subtype ?? ""),
			custom: String(s.custom ?? ""),
			target: r ? {
				itemId: r.id,
				path: "system.type"
			} : e.type === "character" ? null : { path: "system.details.type" }
		},
		movement: {
			units: String(t.attributes?.movement?.units ?? ""),
			hover: !!t.attributes?.movement?.hover,
			keys: Object.keys(t.attributes?.movement?.speeds ?? {}),
			rows: o(t.attributes?.movement?.speeds, n.attributes?.movement?.speeds, r?.system?.movement?.speeds, "system.movement.speeds")
		},
		senses: {
			units: String(t.attributes?.senses?.units ?? ""),
			special: String(n.attributes?.senses?.special ?? ""),
			keys: Object.keys(t.attributes?.senses?.ranges ?? {}),
			rows: o(t.attributes?.senses?.ranges, n.attributes?.senses?.ranges, r?.system?.senses?.ranges, "system.senses.ranges")
		},
		alignment: String(n.details?.alignment ?? "")
	};
}
// src/rules/kernel/frame/sheet-levels.ts
var Ki = globalThis;
function qi(t) {
	return typeof t != "string" || !t.trim() ? null : Rt(t) ?? hi(t, null) ?? e(t, null);
}
function Ji(e) {
	let t = Ki.dnd5e?.documents?.Trait, n = typeof t?.keyLabel == "function" ? t.keyLabel(e) : null;
	return n && n !== e ? n : Ki.CONFIG?.DND5E?.abilities?.[e]?.label ?? e;
}
async function Yi(e) {
	let t = ot(e).map((e) => ({
		r: e,
		parts: ht(e.adv, e.level)
	})), n = await Bn(t.flatMap((e) => e.parts.keys)), r = (e) => {
		let t = Ji(e), r = n[e] ?? [];
		return r.length ? {
			key: e,
			label: f(t, r, !0),
			...r.length === 1 ? { author: r[0] } : {}
		} : {
			key: e,
			label: qi(t)
		};
	};
	return t.map(({ r: t, parts: { items: n, keys: i, amounts: a } }) => ({
		itemId: t.item.id,
		ref: t.key,
		level: t.level,
		advancement: t.adv.id,
		type: t.type,
		title: ti(t.adv),
		items: n.filter((t) => e.items.has(t.id)),
		keys: [...i.map(r), ...a.map((e) => ({
			key: e.key,
			label: qi(Ji(e.key)),
			value: e.value
		}))]
	}));
}
// src/rules/kernel/frame/commands-sheet.ts
var H = globalThis, Xi = { configure: !1 }, Zi = { create: !1 }, Qi = [
	/^_id$/,
	/^_stats(\.|$)/,
	/^type$/,
	/^items(\.|$)/,
	/^effects(\.|$)/,
	/^flags\.plutonium(\.|$)/,
	/^system\.advancement(\.|$)/
];
function $i(e, t) {
	return !t || Qi.some((e) => e.test(t)) ? !1 : t.startsWith("flags.") ? t.split(".").length >= 3 : t.startsWith("system.") ? !!e.system?.schema?.getField?.(t.slice(7)) : !!e.schema?.getField?.(t);
}
function ea(e, t, n, r) {
	if (!$i(e, t)) throw Error(`不能改这个字段：${t}`);
	if (!r) return { [t]: n };
	let i = t.lastIndexOf(".");
	return { [`${t.slice(0, i)}.-=${t.slice(i + 1)}`]: null };
}
var ta = (e, t) => t ? e.items.get(t, { strict: !0 }) : e, na = (e) => JSON.parse(JSON.stringify(e ?? null, (e, t) => e === "document" || e === "anchor" || e === "fields" || e === "field" || e === "parent" ? void 0 : t));
function ra(e) {
	let t = /* @__PURE__ */ new Set([Object.prototype, H.foundry.abstract.DataModel.prototype]), n = [];
	for (let r = Object.getPrototypeOf(e); r && !t.has(r); r = Object.getPrototypeOf(r)) for (let [e, t] of Object.entries(Object.getOwnPropertyDescriptors(r))) t.get && !n.some(([t]) => t === e) && n.push([e, t.get]);
	return n;
}
function ia(e, t = 0, n = /* @__PURE__ */ new WeakSet()) {
	if (typeof e == "function") return;
	if (typeof e != "object" || !e) return e;
	if (t > 12 || n.has(e) || e instanceof H.foundry.abstract.Document) return;
	if (n.add(e), e instanceof Set) return [...e].map((e) => ia(e, t + 1, n));
	if (e instanceof Map) return Object.fromEntries([...Map.prototype.entries.call(e)].map(([e, r]) => [e, ia(r, t + 1, n)]));
	if (Array.isArray(e)) return e.map((e) => ia(e, t + 1, n));
	let r = {};
	for (let i of Object.keys(e)) {
		if (i === "parent" || i.startsWith("_")) continue;
		let a = ia(e[i], t + 1, n);
		a !== void 0 && (r[i] = a);
	}
	for (let [i, a] of ra(e)) {
		if (i in r || i === "parent" || i.startsWith("_")) continue;
		let o;
		try {
			o = a.call(e);
		} catch {
			o = void 0;
		}
		let s = ia(o, t + 1, n);
		s !== void 0 && (r[i] = s);
	}
	return r;
}
async function aa(e, t, n) {
	if (!e) return null;
	let r = new e({ document: t }), i = await r._prepareContext({ parts: [] }), a = await r._preparePartContext(Object.keys(e.PARTS ?? {})[0] ?? "config", i, {});
	return Object.fromEntries(n.filter((e) => e in a).map((e) => [e, na(a[e])]));
}
var oa = {
	ability: (e, t) => e.rollAbilityCheck({ ability: t }, Xi, Zi),
	tool: (e, t) => e.rollToolCheck({ tool: t }, Xi, Zi),
	death: (e) => e.rollDeathSave({}, Xi, Zi),
	hitDie: (e, t) => e.rollHitDie(t ? { denomination: t } : {}, Xi, Zi),
	initiative: async (e) => {
		let t = e.getInitiativeRoll();
		return t ? (await t.evaluate({ allowInteractive: !1 }), [t]) : null;
	}
};
function sa(t, n, r) {
	return {
		sheet: (e, r = []) => t([], async () => {
			let t = n(e), i = H.dnd5e?.applications?.actor ?? {}, a = u(), o = {
				id: t.id,
				name: t.name,
				img: t.img,
				type: t.type,
				flags: na(t.flags ?? {}),
				system: ia(t.system),
				statuses: [...t.statuses ?? []],
				items: [...t.items].map((e) => ({
					...ve(e),
					img: e.img,
					sort: e.sort,
					flags: na(e.flags ?? {}),
					system: ia(e.system),
					labels: na(e.labels ?? {})
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
					duration: na(e.duration),
					durationSource: na(e._source?.duration ?? null),
					changes: na(e.system?.changes ?? e.changes ?? [])
				}))
			};
			a.lap("data");
			let s = {
				items: [...t.items].map((e) => ({
					id: e.id,
					...xi(e, r)
				})),
				effects: [...t.allApplicableEffects()].map((e) => ({
					id: e.id,
					name: hi(String(e.name ?? ""), null) ?? c(e.name)
				}))
			};
			a.lap("names");
			let l = await Bi(t, r);
			a.lap("view");
			let d = Gi(t);
			a.lap("traits");
			let f = await Yi(t);
			a.lap("levels");
			let p = {
				hp: await aa(i.HitPointsConfig, t, [
					"classes",
					"ability",
					"effects",
					"levels"
				]),
				ac: await aa(i.ArmorClassConfig, t, ["calculations", "formulaLabel"])
			};
			return a.lap("breakdown"), {
				...o,
				shown: s,
				view: l,
				traits: d,
				levels: f,
				breakdown: p,
				ms: a.done()
			};
		}),
		roster: (e) => t([], async () => [...H.game.actors].filter((t) => !e || e.includes(t.id)).map((e) => ({
			id: e.id,
			name: e.name,
			img: e.img,
			type: e.type,
			system: ia(e.system),
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
			for (let e of r) if (e.kind === "set") await t.update(ea(t, e.path, e.value, e.remove));
			else if (e.kind === "item") {
				let n = t.items.get(e.itemId, { strict: !0 });
				await n.update(ea(n, e.path, e.value, e.remove));
			} else if (e.kind === "itemDelete") await t.deleteEmbeddedDocuments("Item", [e.itemId]);
			else if (e.kind === "effect") {
				let n = ta(t, e.itemId).effects.get(e.effectId, { strict: !0 });
				await n.update(ea(n, e.path, e.value, e.remove));
			} else if (e.kind === "effectCreate") await ta(t, e.itemId).createEmbeddedDocuments("ActiveEffect", [e.data]);
			else if (e.kind === "effectDelete") await ta(t, e.itemId).deleteEmbeddedDocuments("ActiveEffect", [e.effectId]);
			else if (e.kind === "status") await t.toggleStatusEffect(e.statusId, e.levels === void 0 ? { active: e.active ?? !0 } : { levels: e.levels });
			else throw Error(`不认识的改动：${e.kind}`);
			return { edits: r.length };
		}, [e]),
		check: (e, i, a, o = []) => t(o, async () => {
			let t = oa[i];
			if (!t) throw Error(`没有这种检定：${i}`);
			return (await t(n(e), a))?.map(r) ?? null;
		}, [e]),
		glossary: () => t([], async () => {
			if (!fi()) throw Error("开机时没有记下登记表原值（registry-keys.ts）");
			return {
				tables: Object.fromEntries(Object.entries(H.CONFIG.DND5E ?? {}).map(([e, t]) => [e, gi(e, t)]).filter(([, e]) => Object.keys(e).length)),
				statuses: (H.CONFIG.statusEffects ?? []).flatMap((t) => typeof t?.name == "string" ? [{
					id: t.id,
					name: hi(t.name, vi(t.id)) ?? e(t.name, null),
					img: t.img ?? null
				}] : [])
			};
		}),
		fieldLabels: (n) => t([], async () => n.map(({ actorId: t, path: n }) => {
			let r = H.game.actors.get(t), i = /^state\.(?:actor|items\.(.+?))\.((?:system|name|img|flags)(?:\..*)?)$/.exec(n);
			if (!r || !i) return null;
			let a = i[1] ? m([...r.items], i[1]) : r;
			if (!a) return null;
			let o = i[2].split(".");
			for (let t = o.length; t > 0; t--) {
				let n = o.slice(0, t).join("."), r = (n.startsWith("system.") ? a.system?.schema?.getField(n.slice(7)) : a.schema?.getField(n))?.label;
				if (typeof r == "string" && r) return {
					field: Rt(r) ?? hi(r, null) ?? e(r, null),
					...i[1] ? { item: xi(a, []).name } : {}
				};
			}
			return null;
		})),
		deleteActors: (e) => t([], async () => {
			let t = e.filter((e) => H.game.actors.get(e));
			return t.length && await H.CONFIG.Actor.documentClass.deleteDocuments(t), { deleted: t };
		})
	};
}
// src/rules/kernel/frame/commands-preview.ts
function ca(e, t) {
	return { levelPreview: (n, r, i, a = []) => e([], async () => {
		let e = t(n), o = [...e.items].map((e) => ({
			id: e.id,
			type: e.type,
			name: xi(e, a).name
		})), s = Number(e.system.attributes?.hp?.max ?? 0), c = Number(e.system.details?.level ?? 0), l = e.items.get(r), u = String(l?.system?.identifier ?? ""), d = Number(l?.system?.levels ?? 0) + i;
		if (!(await Mr(Er().forLevelChange(e, r, i, { automaticApplication: !0 }), void 0)).finished) return {
			kernelStatus: "pending",
			reason: "advancement-manager-not-complete"
		};
		i < 0 && u && await wr(e, u, d);
		let f = new Set([...e.items].map((e) => e.id));
		return {
			removed: o.filter((e) => !f.has(e.id)),
			hp: {
				from: s,
				to: Number(e.system.attributes?.hp?.max ?? 0)
			},
			level: {
				from: c,
				to: Number(e.system.details?.level ?? 0)
			}
		};
	}, [n]) };
}
// src/rules/kernel/frame/commands-fields.ts
var U = globalThis;
function W(t) {
	return typeof t != "string" || !t.trim() ? null : Rt(t) || (hi(t, null) ?? e(t, null));
}
var la = [
	{
		path: /\.roll\.mode$/,
		options: () => [
			[-1, "DND5E.Disadvantage"],
			[0, "DND5E.Normal"],
			[1, "DND5E.Advantage"]
		]
	},
	{
		path: /^system\.abilities\.[^.]+\.proficient$/,
		options: () => [0, 1].map((e) => [e, U.CONFIG.DND5E.proficiencyLevels[e]])
	},
	{
		path: /^system\.(skills|tools)\.[^.]+\.value$/,
		options: () => Object.entries(U.CONFIG.DND5E.proficiencyLevels).map(([e, t]) => [Number(e), t])
	},
	{
		path: /^system\.(skills|tools)\.[^.]+\.ability$|^system\.attributes\.spellcasting$/,
		options: () => Object.entries(U.CONFIG.DND5E.abilities).map(([e, t]) => [e, t.label])
	},
	{
		path: /^system\.attributes\.(init|concentration)\.ability$/,
		options: () => [["", "DND5E.Default"], ...Object.entries(U.CONFIG.DND5E.abilities).map(([e, t]) => [e, t.label])]
	},
	{
		path: /^system\.attributes\.ac\.calcs?$/,
		options: () => Object.entries(U.CONFIG.DND5E.armorClasses).map(([e, t]) => [e, t.label])
	},
	{
		path: /^system\.attributes\.(movement|senses)\.units$/,
		options: () => Object.entries(U.CONFIG.DND5E.movementUnits).map(([e, t]) => [e, t.label])
	}
], ua = (e) => la.find((t) => t.path.test(e))?.options().map(([e, t]) => ({
	value: String(e),
	label: (typeof t == "string" ? W(t) : null) ?? a(String(e))
}));
function da(e) {
	let t = e?.choices;
	if (typeof t == "function" && (t = t()), t) return (Array.isArray(t) ? t.map((e) => [String(e), e]) : Object.entries(t)).map(([e, t]) => ({
		value: e,
		label: W(typeof t == "string" ? t : t?.label ?? t?.name ?? e) ?? a(e)
	}));
}
function fa(e) {
	let t = U.foundry.data.fields, n = U.dnd5e?.dataModels?.fields ?? {};
	if (e instanceof t.BooleanField) return "boolean";
	if (e instanceof t.NumberField) return "number";
	if (e instanceof t.HTMLField) return "html";
	if (e instanceof t.SetField || e instanceof t.ArrayField) {
		let n = e.element;
		return n instanceof t.StringField ? da(n) ? "multi" : "tags" : null;
	}
	return n.FormulaField && e instanceof n.FormulaField ? "formula" : e instanceof t.StringField ? da(e) ? "select" : "text" : null;
}
function pa(e, t, n, r, i) {
	let a = U.foundry.data.fields, o = {
		path: t,
		label: W(e.label),
		hint: W(e.hint)
	};
	if (e instanceof a.SchemaField && !(e instanceof a.EmbeddedDataField && !e.fields)) {
		if (r > 4) return null;
		let a = Object.entries(e.fields ?? {}).map(([e, a]) => pa(a, `${t}.${e}`, n?.[e], r + 1, i)).filter((e) => !!e);
		return a.length ? {
			...o,
			children: a
		} : null;
	}
	if (e.model instanceof a.DataField && e instanceof a.ObjectField && n && typeof n == "object") {
		if (r > 4) return null;
		let a = Object.keys(n).map((a) => pa(e.model, `${t}.${a}`, n[a], r + 1, i)).filter((e) => !!e);
		return a.length ? {
			...o,
			children: a
		} : null;
	}
	let s = ua(t), c = s && e instanceof a.SetField ? "multi" : s && (e instanceof a.StringField || e instanceof a.NumberField) ? "select" : fa(e);
	if (!c) return null;
	let l = e.options?.persisted === !1, u = l ? ma(i, t) : n, d = {
		...o,
		kind: c,
		value: u instanceof Set ? [...u] : u ?? null,
		...l ? { derived: !0 } : {}
	};
	return s ? (d.choices = s, e instanceof a.NumberField && (d.numeric = !0)) : c === "select" && (d.choices = da(e)), c === "multi" && (d.choices = da(e.element)), c === "number" && Object.assign(d, {
		min: e.min,
		max: e.max,
		step: e.step,
		integer: !!e.integer,
		nullable: !!e.nullable
	}), d;
}
var ma = (e, t) => t.split(".").reduce((e, t) => e?.[t], e);
function ha(e, t) {
	let n = t.split(".");
	for (let t = n.length; t > 0; t--) {
		let r = n.slice(0, t).join("."), i = (r.startsWith("system.") ? e.system?.schema?.getField(r.slice(7)) : e.schema?.getField(r))?.label;
		if (typeof i == "string" && i) return i;
	}
	return null;
}
function ga(e, t) {
	return {
		fieldInfo: (n, r) => e([], async () => {
			let e = t(n), i = r.itemId ? e.items.get(r.itemId) : e;
			if (!i) throw Error(`没有这件物品：${r.itemId}`);
			let { path: o } = r, s = o === "system" ? i.system?.schema : o.startsWith("system.") ? i.system?.schema?.getField(o.slice(7)) : i.schema?.getField(o);
			if (!s) throw Error(`官方没有这个字段：${o}`);
			let c = pa(s, o, ma(i._source, o), 0, i), l = U.CONFIG.ActiveEffect.documentClass.CHANGE_TYPES ?? {}, u = (e) => typeof e.type == "string" ? e.type : (Object.entries(U.CONST.ACTIVE_EFFECT_MODES ?? {}).find(([, t]) => t === e.mode)?.[0] ?? "").toLowerCase(), d = (e) => W(String(l[e]?.label ?? e));
			return {
				tree: c,
				effects: r.itemId ? [] : [...e.allApplicableEffects?.() ?? []].flatMap((t) => [...t.system?.changes ?? t.changes ?? []].filter((e) => e.key === o || e.key.startsWith(`${o}.`) || o.startsWith(`${e.key}.`)).map((n) => {
					let r = t.parent && t.parent !== e ? xi(t.parent, []).name : null, i = u(n);
					return {
						effect: t.id,
						itemId: t.parent && t.parent !== e ? t.parent.id : null,
						name: W(t.name),
						origin: r,
						active: !t.disabled && !t.isSuppressed,
						disabled: !!t.disabled,
						manual: !!t.flags?.["tavern-trpg"]?.manual,
						key: n.key,
						keyLabel: W(ha(e, n.key)),
						mode: i ? d(i) : null,
						modeCode: i,
						value: n.value
					};
				})),
				attribution: null,
				derived: null,
				modes: Object.entries(l).map(([e, t]) => ({
					value: e,
					label: W(String(t.label ?? e)) ?? a(e)
				})),
				durationUnits: [...U.CONST.ACTIVE_EFFECT_DURATION_UNITS ?? []].map((e) => ({
					value: e,
					label: W(`EFFECT.DURATION.UNITS.${e}`) ?? a(e)
				}))
			};
		}),
		specialTraits: (n) => e([], async () => {
			let e = t(n)._source?.flags?.dnd5e ?? {}, r = /* @__PURE__ */ new Map();
			for (let [t, n] of Object.entries(U.CONFIG.DND5E.characterFlags ?? {})) {
				let i = U.foundry.utils.getProperty(e, t);
				if (n.deprecated && !i) continue;
				let a = n.type === Boolean ? "boolean" : n.type === Number ? "number" : "string", o = n.choices ? Object.entries(n.choices).map(([e, t]) => ({
					value: e,
					label: W(String(typeof t == "string" ? t : t?.label ?? e))
				})) : null, s = String(n.section ?? "");
				r.has(s) || r.set(s, {
					label: W(s),
					fields: []
				}), r.get(s).fields.push({
					key: t,
					path: `flags.dnd5e.${t}`,
					name: W(String(n.name ?? t)),
					hint: W(String(n.hint ?? "")),
					type: a,
					choices: o,
					value: i ?? null
				});
			}
			return { sections: [...r.values()] };
		}),
		traitChoices: (t) => e([], async () => {
			let e = U.dnd5e.documents.Trait, n = [
				"weapon",
				"armor",
				"tool"
			].includes(t) ? await De() : /* @__PURE__ */ new Map(), r = (e) => e.split(":").pop() ?? e, i = [], a = (e, t) => {
				for (let [o, s] of Object.entries(e ?? {})) {
					if (s?.wildcard) continue;
					let e = String(s.label ?? o), c = n.get(r(o));
					i.push({
						key: o,
						label: c && /[A-Za-z]/.test(e) ? f(e, c, !0) : W(e),
						depth: t,
						selectable: s.selectable !== !1
					}), s.children && a(s.children, t + 1);
				}
			};
			a(await e.choices(t), 0);
			let o = [
				"dr",
				"di",
				"dv",
				"dm"
			].includes(t) ? Object.entries(U.CONFIG.DND5E.itemProperties ?? {}).filter(([, e]) => e.isPhysical).map(([e, t]) => ({
				key: e,
				label: W(String(t.label ?? e))
			})) : [], s = t === "languages" ? Object.entries(U.CONFIG.DND5E.communicationTypes ?? {}).map(([e, t]) => ({
				key: e,
				label: W(String(t.label ?? e))
			})) : [];
			return {
				trait: t,
				path: e.actorKeyPath(t),
				label: W(e.traitLabel(t)),
				rows: i,
				bypasses: o,
				communication: s
			};
		})
	};
}
// src/rules/kernel/frame/author-ask-forms.ts
var _a = globalThis;
async function va(e, t) {
	let n = N, r = [];
	if (e instanceof n.Charactermancer_ImmResVulnSelect) return {
		slots: Yn(n, e) ?? [],
		cleanup: r
	};
	let i = (e._available ?? [])[t];
	return e._state.ixSet = t, e instanceof n.Charactermancer_ExpertiseSelect ? {
		slots: Jn(n, e, i, r),
		cleanup: r
	} : ((i?.all?.length || i?.choose?.some((e) => e.fromFilter)) && await e.pNotRender(), {
		slots: qn(n, e, i ?? {}, r),
		cleanup: r
	});
}
var ya = (e) => ({
	title: e.hints?.length ? L(e.hints.join(" ")) : null,
	count: e.count,
	options: e.options.map((t) => ({ label: t.text ?? i(t.label, e.options.map((e) => e.label), I(t.label)) }))
}), ba = {
	async read({ comp: e, opts: t }, r) {
		let i = N.Charactermancer_ImmResVulnSelect && e instanceof N.Charactermancer_ImmResVulnSelect ? 1 : Math.max(1, (e._available ?? []).length), o = [];
		for (let t = 0; t < i; t++) {
			let { slots: r, cleanup: s } = await va(e, t);
			try {
				o.push({
					label: i > 1 ? n("方案 {0}", a(String(t + 1))) : null,
					groups: r.map(ya)
				});
			} finally {
				for (let e of s) e();
			}
		}
		return {
			kind: r,
			title: L(e.modalTitle),
			note: null,
			form: {
				type: "choose",
				sets: o,
				set: 0
			},
			skippable: !t?.isUnskippable
		};
	},
	async write({ comp: e }, t) {
		if (t.default) return e.pGetFormData();
		let { slots: n, cleanup: r } = await va(e, t.set ?? 0);
		try {
			for (let [e, r] of (t.picks ?? []).entries()) {
				let t = n[e];
				if (!t) throw Error("选项组不在作者给的范围里");
				if (r.length > t.count) throw Error(`这组最多选 ${t.count} 项`);
				for (let e of r) {
					let n = t.options[e];
					if (!n) throw Error("选项不在作者给的范围里");
					n.select();
				}
			}
			return await e.pGetFormData();
		} finally {
			for (let e of r) e();
		}
	}
}, xa = {
	read({ comp: e, opts: t }, n) {
		let r = e.constructor, i = r._PROP_METAS.map((t) => {
			let n = e._tables[t.prop];
			return {
				title: L(r._PROP_TO_FULL?.[t.prop]),
				count: t.count || 1,
				custom: !0,
				options: (n?.rows ?? []).map((e) => ({ label: c(_a.Renderer.stripTags(String(e?.[1] ?? ""))) }))
			};
		});
		return {
			kind: n,
			title: L(e.modalTitle),
			note: null,
			form: {
				type: "texts",
				groups: i
			},
			skippable: !t?.isUnskippable
		};
	},
	write({ comp: e }, t) {
		if (t.default) return e.pGetFormData();
		let n = e.constructor;
		return n._PROP_METAS.forEach((r, i) => {
			let a = r.count || 1, o = [...(t.picks?.[i] ?? []).map((t) => n._getCpyTableCell(e._tables[r.prop], t)), ...(t.texts?.[i] ?? []).map((e) => String(e).trim())].filter(Boolean);
			if (o.length > a) throw Error(`这一类最多 ${a} 条`);
			for (let t = 0; t < a; t++) e._state[n._getProps(r.prop, t).propValue] = o[t] ?? null;
		}), e.pGetFormData();
	}
};
function Sa(e) {
	let t = String(e?.entity?.name ?? e?.name ?? ""), n = _a.UrlUtil?.PAGE_TO_PROPS?.[e?.page]?.[0];
	return n && e?.hash && e?.source ? f(t, {
		propDroppable: n,
		source: e.source,
		hash: e.hash,
		page: e.page
	}) : c(t);
}
var Ca = (e) => I(Jt("abilities")[e] ?? e), wa = {
	read({ comp: e, opts: t }, r) {
		let { count: i, required: o } = e._getOptionsNameAndCount(), s = e._optionsSet.map((e, t) => ({
			label: Sa(e),
			disabled: o.includes(t)
		})), l = e._optionsSet[0]?.optionsMeta?.name;
		return {
			kind: r,
			title: n(e._level == null ? "{0}" : "{0}（{1} 级）", c(String(l ?? "")), a(String(e._level ?? ""))),
			note: null,
			form: {
				type: "choose",
				sets: [{
					label: null,
					groups: [{
						title: null,
						count: i - o.length,
						options: s
					}]
				}],
				set: 0
			},
			skippable: !t?.isUnskippable
		};
	},
	async write({ comp: e }, t) {
		return t.default || await wa.select(e, t), e.pGetFormData();
	},
	async select(e, t) {
		let { count: n, required: r } = e._getOptionsNameAndCount(), i = N.ComponentUiUtil.getMetaWrpMultipleChoice(e, "ixsChosen", {
			values: e._optionsSet,
			ixsRequired: r,
			count: n,
			fnDisplay: () => ""
		});
		try {
			let a = t.picks?.[0] ?? [];
			if (a.length > n - r.length) throw Error(`最多选 ${n - r.length} 项`);
			for (let t of a) {
				let n = i.rowMetas[t];
				if (!n) throw Error("选项不在作者给的范围里");
				e._state[n.propIsActive] = !0;
			}
		} finally {
			i.cleanup?.();
		}
	}
}, Ta = {
	read({ comp: e, opts: t }, r) {
		let i = e.constructor, s = e._ability.map((t, r) => {
			let s = Object.keys(Jt("abilities")).filter((e) => t[e]).map((e) => n("{0} {1}", Ca(e), a(`${t[e] > 0 ? "+" : ""}${t[e]}`))), c = [];
			if (t.choose?.from) c.push({
				title: n("选 {0} 项，各 +{1}", a(String(t.choose.count || 1)), a(String(t.choose.amount || 1))),
				count: t.choose.count || 1,
				options: t.choose.from.map((e) => ({ label: Ca(e) }))
			});
			else if (t.choose?.weighted) {
				let e = i._getSortedWeightedFrom(t);
				for (let r of i._getSortedWeights(t)) c.push({
					title: n("+{0}", a(String(r))),
					count: 1,
					options: e.map((e) => ({ label: Ca(e) }))
				});
			}
			return {
				label: s.length ? o(s, "，") : e._ability.length > 1 ? n("方案 {0}", a(String(r + 1))) : null,
				groups: c
			};
		});
		return {
			kind: r,
			title: L(e.modalTitle),
			note: null,
			form: {
				type: "choose",
				sets: s,
				set: 0
			},
			skippable: !t?.isUnskippable
		};
	},
	async write({ comp: e }, t) {
		if (t.default) return e.pGetFormData();
		let n = t.set ?? 0, r = e._ability[n];
		if (!r) throw Error("方案不在作者给的范围里");
		if (e._state.ixSet = n, e.render(N.veE(document.createElement("div"))), r.choose?.from) {
			let n = e._lastMeta?.rowMetas ?? [];
			for (let r of t.picks?.[0] ?? []) {
				if (!n[r]) throw Error("选项不在作者给的范围里");
				e._state[n[r].propIsActive] = !0;
			}
		} else if (r.choose?.weighted) for (let [n, r] of (t.picks ?? []).entries()) for (let t of r) e._state[e._getWeightedProps(t, n).propWeightAbility] = !0;
		return e.pGetFormData();
	}
}, Ea = {
	read({ comp: e }, t) {
		let n = e._comp, r = [
			"str",
			"dex",
			"con",
			"int",
			"wis",
			"cha"
		].map((e) => ({
			key: e,
			label: Ca(e),
			value: Number(n._state[e] ?? 0)
		}));
		return {
			kind: t,
			title: L("Ability Score Improvement"),
			note: null,
			form: {
				type: "asi",
				abilities: r,
				points: 2,
				max: 20
			},
			skippable: !0
		};
	},
	skip: () => null,
	async write({ comp: e }, t) {
		let n = e._comp;
		if (t.featEntry) return n._state.mode = "feat", n._state.feat = t.featEntry, n.getFeat();
		let r = t.bonus ?? {};
		if (Object.values(r).reduce((e, t) => e + Number(t || 0), 0) !== 2) throw Error("属性提升要正好加 2 点");
		n._state.mode = "ability";
		for (let e of [
			"str",
			"dex",
			"con",
			"int",
			"wis",
			"cha"
		]) {
			let t = Number(r[e] || 0);
			if (t < 0 || n._state[e] + t > 20) throw Error("单项属性不能超过 20");
			n._state[`${e}Bonus`] = t;
		}
		let i = n._getActorUpdate();
		return i && await n._actor.update(i), n.getFeat();
	}
}, Da = (e) => f(String(e.name), {
	propDroppable: "spell",
	source: e.source,
	hash: _a.UrlUtil.URL_TO_HASH_BUILDER[_a.UrlUtil.PG_SPELLS](e)
}, !0);
function Oa(e) {
	let t = [];
	return e._spellDatas.forEach((n, r) => {
		n.level === 0 && (e.isAvailableClassSpell_(n) || e.isAvailableSubclassSpell_(n) || e.isAvailableExpandedSpell_(n)) && (e.isAlwaysKnownSpell_?.(n) || e.getExistingSpellMeta_?.(n) || t.push(r));
	}), t.sort((t, n) => String(e._spellDatas[t].name).localeCompare(String(e._spellDatas[n].name)));
}
var ka = {
	read({ comp: e, opts: t }, n) {
		let r = Oa(e), i = Number(e._state.maxLearnedCantrips ?? 0) - Number(e._state.cntLearnedCantrips ?? 0);
		return {
			kind: n,
			title: L(e.modalTitle),
			note: null,
			form: {
				type: "choose",
				sets: [{
					label: null,
					groups: [{
						title: null,
						count: Math.max(0, i),
						options: r.map((t) => ({ label: Da(e._spellDatas[t]) }))
					}]
				}],
				set: 0
			},
			skippable: !t?.isUnskippable
		};
	},
	async write({ comp: e }, t) {
		if (t.default) return e.pGetFormData();
		let n = Oa(e), r = e._compsLevel[0], i = t.picks?.[0] ?? [];
		for (let e of i) {
			let t = n[e];
			if (t == null) throw Error("戏法不在作者给的候选里");
			r._state[r.constructor._getProps(t).ixLearned] = !0;
		}
		return e.cntLearnedCantrips = Number(e.cntLearnedCantrips ?? 0) + i.length, e.pGetFormData();
	}
};
// src/rules/kernel/frame/author-ask-equipment.ts
async function Aa(e) {
	let t = await An(e);
	return t ? "unsupported" in t ? {
		kind: "special",
		quantity: 1,
		text: a(String(t.unsupported))
	} : {
		kind: t.kind,
		quantity: t.quantity,
		...t.name ? { name: t.displayName ?? t.name } : {},
		...t.text ? { text: t.text } : {},
		...t.cp ? { cp: t.cp } : {},
		...t.candidates ? {
			candidates: t.candidates.map((e) => ({
				uid: e.uid,
				name: e.name
			})),
			typeNames: t.typeNames ?? []
		} : {}
	} : {
		kind: "special",
		quantity: 1,
		text: a(JSON.stringify(e).slice(0, 80))
	};
}
var ja = {
	async read({ comp: e }, t) {
		let n = e._compCurrency.startingEquipment?.defaultData ?? [], r = [];
		for (let e of n) {
			let t = [];
			for (let [, n] of Object.entries(e)) t.push({ entries: await Promise.all(n.map(Aa)) });
			r.push({ choices: t });
		}
		let i = e._compGold?.isAvailable ? e._compCurrency.rollableExpressionGold ?? null : null;
		return {
			kind: t,
			title: L(e._compCurrency.rollableExpressionGold ? "Starting Equipment" : "Equipment"),
			note: null,
			form: {
				type: "equipment",
				groups: r,
				gold: i
			},
			skippable: !0
		};
	},
	async write({ comp: e }, t) {
		let n = e._compDefault;
		if (t.gold != null) e._compCurrency.cpRolled = Math.round(Number(t.gold) * 100);
		else if (!t.default) {
			(e._compCurrency.startingEquipment?.defaultData ?? []).forEach((e, r) => {
				let i = Object.keys(e).length, a = t.choice?.[r] ?? (i === 1 ? 0 : null);
				if (a == null || a < 0 || a >= i) throw Error(`第 ${r + 1} 组还没选`);
				n._state[`std__choice__${r}`] = a;
			});
			for (let [e, r] of Object.entries(t.slots ?? {})) {
				let [t, i, a] = e.split(".").map(Number);
				n._state[`std__equi__${t}__${i}__${a}`] = r;
			}
		}
		let r = [e._compDefault, e._compGold].filter((e) => e?.isAvailable), i = await Promise.all(r.map((e) => e.pGetFormData()));
		if (i.find((e) => !e.isFormComplete)) throw Error("起始装备还有没选的");
		let a = await e._compCurrency.pGetFormData();
		return {
			isFormComplete: !0,
			data: {
				equipmentItemEntries: i.flatMap((e) => e.data?.equipmentItemEntries ?? []),
				currency: a?.data?.currency
			}
		};
	}
}, G = globalThis, Ma = () => N.veE(document.createElement("div"));
function Na(e) {
	return e.type === "choose" ? e.sets.length > 1 || e.sets.some((e) => e.groups.some((e) => e.count > 0 && e.options.length > 0)) : e.type !== "enum" || e.options.length > 1;
}
var Pa = (e) => !!e._isChooseOptionsFeatures?.() && !!e._optionsSet?.[0]?.optionsMeta, Fa = /* @__PURE__ */ new WeakSet();
async function Ia(e, t = !1) {
	(!Fa.has(e) || t) && (Fa.add(e), await e.pRender(Ma()));
}
function La(e) {
	async function t(t) {
		let n = [];
		for (let r of t._subCompManagers ?? []) for (let t of r._subComps ?? []) {
			if (!t) continue;
			let r = t.constructor?.name ?? "?", i = await (e()[r] ?? e()["*"]).read({
				comp: t,
				opts: {}
			}, r);
			Na(i.form) && n.push({
				sub: t,
				kind: r,
				part: i
			});
		}
		return n;
	}
	let n = {
		read: async ({ comp: e }, n) => {
			await Ia(e);
			let r = await t(e), i = e._getSelectedLoadeds?.()?.[0] ?? e._optionsSet?.[0];
			return {
				kind: n,
				title: i ? Sa(i) : L(e.modalTitle),
				note: null,
				form: {
					type: "parts",
					parts: r.map((e) => e.part)
				},
				skippable: !1
			};
		},
		write: async ({ comp: n }, r) => {
			await Ia(n);
			let i = await t(n);
			for (let [t, { sub: n, kind: a }] of i.entries()) await (e()[a] ?? e()["*"]).write({
				comp: n,
				opts: {}
			}, r.parts?.[t] ?? { default: !0 });
			return n.pGetFormData();
		}
	}, r = "Charactermancer_FeatureOptionsSelect.parts";
	return {
		Charactermancer_FeatureOptionsSelect: {
			auto: async ({ comp: e }) => Pa(e) ? $a : (await Ia(e), (await t(e)).length ? $a : e.pGetFormData()),
			read: async (e, t) => Pa(e.comp) ? wa.read(e, t) : {
				...await n.read(e, r),
				kind: t
			},
			write: async (e, i) => {
				let { comp: a } = e;
				return Pa(a) ? i.default ? a.pGetFormData() : (await wa.select(a, i), await Ia(a, !0), (await t(a)).length ? new Qa(r, {
					comp: a,
					opts: {}
				}) : a.pGetFormData()) : n.write(e, i);
			}
		},
		[r]: n
	};
}
var Ra = (e) => G.DataUtil.proxy.unpackUid("spell", e, "spell");
function za(e, t) {
	let r = [], i = e._getFlatSpellsInRange(t).filter((e) => !e.isExpanded), o = /* @__PURE__ */ new Map();
	for (let e of i.filter((e) => e.type !== "all" && e.filterExpression != null && !e.chooseFromGroup)) o.set(e.filterExpression, [...o.get(e.filterExpression) ?? [], e]);
	let s = [...o].map(([t, n]) => ({
		same: n,
		ents: e._modalFilterSpells.getEntitiesMatchingFilterExpression({ filterExpression: t }).slice().sort((e, t) => String(e.name).localeCompare(String(t.name)))
	})).sort((e, t) => Math.min(...e.ents.map((e) => Number(e.level))) - Math.min(...t.ents.map((e) => Number(e.level))));
	for (let { same: e, ents: t } of s) {
		let i = [...new Set(t.map((e) => Number(e.level)))], o = i.length === 1 ? i[0] === 0 ? n("戏法") : n("{0} 环法术", a(String(i[0]))) : n("法术");
		r.push({
			group: {
				title: n("{1}任选 {0} 条", a(String(e.length)), o),
				count: e.length,
				options: t.map((e) => ({ label: Da(e) }))
			},
			apply: (n, r) => r.forEach((r, i) => {
				let a = t[r];
				if (!a || !e[i]) throw Error("法术不在作者给的候选里");
				n._state[e[i].key] = G.DataUtil.proxy.getUid("spell", a);
			})
		});
	}
	let c = /* @__PURE__ */ new Map();
	for (let e of i.filter((e) => e.chooseFromGroup)) c.set(e.chooseFromGroup, [...c.get(e.chooseFromGroup) ?? [], e]);
	for (let [e, t] of c) {
		let i = t[0].chooseFromCount ?? 1;
		r.push({
			group: {
				title: n("选 {0} 条法术", a(String(i))),
				count: i,
				options: t.map((e) => ({ label: Da(Ra(e.uid)) }))
			},
			apply: (n, r) => {
				let { propBase: a } = n._getProps_chooseFrom({ groupUid: e }), o = N.ComponentUiUtil.getMetaWrpMultipleChoice(n, a, {
					values: t.map((e) => e.uid),
					count: i,
					fnDisplay: () => ""
				});
				for (let e of r) {
					let t = o.rowMetas[e];
					if (!t) throw Error("法术不在作者给的候选里");
					n._state[t.propIsActive] = !0;
				}
			}
		});
	}
	let l = e._additionalSpellsFlat[t]?.meta?.ability?.choose ?? [];
	return l.length && r.push({
		group: {
			title: L("Spellcasting Ability"),
			count: 1,
			options: l.map((e) => ({ label: Ca(e) }))
		},
		apply: (e, t) => {
			if (t.length) {
				let n = l[t[0]];
				if (!n) throw Error("属性不在作者给的范围里");
				e._state.ability = n;
			}
		}
	}), r;
}
var Ba = (e, t, r) => e > 1 ? typeof r == "string" && r ? c(r) : n("方案 {0}", a(String(t + 1))) : null, Va = {
	read: ({ comp: e, opts: t }, n) => {
		let r = e._additionalSpellsFlat.map((t, n) => ({
			label: Ba(e._additionalSpellsFlat.length, n, t?.meta?.name),
			groups: za(e, n).map((e) => e.group)
		}));
		return {
			kind: n,
			title: L(e.modalTitle),
			note: null,
			form: {
				type: "choose",
				sets: r,
				set: 0
			},
			skippable: !t?.isUnskippable
		};
	},
	write: ({ comp: e }, t) => {
		if (t.default) return e.pGetFormData();
		let n = t.set ?? 0;
		if (!e._additionalSpellsFlat[n]) throw Error("方案不在作者给的范围里");
		return e._state.ixSet = n, za(e, n).forEach((n, r) => n.apply(e, t.picks?.[r] ?? [])), e.pGetFormData();
	}
}, Ha = {
	read: ({ comp: e, opts: t }, n) => ({
		kind: n,
		title: L(e.modalTitle),
		note: null,
		skippable: !t?.isUnskippable,
		form: {
			type: "enum",
			options: e._sizes.map((e) => {
				let t = G.Parser.sizeAbvToFull(e);
				return { label: L(t) ?? a(t) };
			}),
			selected: null
		}
	}),
	write: ({ comp: e }, t) => {
		if (t.default) return e.pGetFormData();
		let n = e._sizes[Number(t.value)];
		if (!n) throw Error("体型不在作者给的范围里");
		return e._state.size = n, e.pGetFormData();
	}
}, Ua = (e) => f(String(e.name), {
	propDroppable: "feat",
	source: e.source,
	hash: G.UrlUtil.URL_TO_HASH_BUILDER[G.UrlUtil.PG_FEATS](e)
}, !0);
function Wa(e, t) {
	let r = e._available[t] ?? {}, i = [], o = (t, n, r, a) => {
		let o = new Set(e._modalFilterFeats.getEntitiesMatchingFilterExpression({ filterExpression: r }).map((e) => G.UrlUtil.URL_TO_HASH_BUILDER[G.UrlUtil.PG_FEATS](e))), s = e._featDatas.map((e, t) => o.has(e._hash) ? t : -1).filter((e) => e >= 0).sort((t, n) => String(e._featDatas[t].name).localeCompare(String(e._featDatas[n].name)));
		i.push({
			type: t,
			ixs: s,
			group: {
				title: a,
				count: n,
				options: s.map((t) => ({ label: Ua(e._featDatas[t]) }))
			}
		});
	};
	if (r.any && o("choose", r.any, "Category=", n("任选 {0} 个专长", a(String(r.any)))), r.anyFromCategory) {
		let e = r.anyFromCategory.count || 1;
		o("chooseCategory", e, `Category=${r.anyFromCategory.category.join(";")}`, n("选 {0} 个专长", a(String(e))));
	}
	return i;
}
var Ga = {
	read: ({ comp: e, opts: t }, r) => {
		let i = e._available.map((t, r) => {
			let i = (N.StatGenUtilAdditionalFeats?.getUidsStatic?.(t) ?? []).map((e) => Ua(G.DataUtil.proxy.unpackUid("feat", e, "feat")));
			return {
				label: i.length ? n("固定：{0}", o(i, "、")) : Ba(e._available.length, r),
				groups: Wa(e, r).map((e) => e.group)
			};
		});
		return {
			kind: r,
			title: L(e.modalTitle),
			note: null,
			form: {
				type: "choose",
				sets: i,
				set: 0
			},
			skippable: !t?.isUnskippable
		};
	},
	write: ({ comp: e }, t) => {
		if (t.default) return e.pGetFormData();
		let n = t.set ?? 0;
		if (!e._available[n]) throw Error("方案不在作者给的范围里");
		return e._state.ixSet = n, Wa(e, n).forEach(({ type: n, ixs: r, group: i }, a) => {
			let o = t.picks?.[a] ?? [];
			if (o.length > i.count) throw Error(`最多选 ${i.count} 个`);
			o.forEach((t, i) => {
				let a = r[t];
				if (a == null) throw Error("专长不在作者给的候选里");
				e._state[e._getProps({
					ix: i,
					featsAdditionType: n
				}).propIxFeat] = a;
			});
		}), e.pGetFormData();
	}
}, Ka = "Charactermancer_Background_Features.other", qa = "Charactermancer_Background_Features.manual", Ja = (e) => {
	let t = e.constructor;
	return [
		N.UtilsEntityBackground?.isCustomBackground?.(e._background) ? null : t._MODE_DEFAULT,
		t._MODE_OTHER_BACKGROUND,
		t._MODE_MANUAL
	].filter((e) => e != null);
}, Ya = (e) => f(String(e.name), {
	propDroppable: "background",
	source: e.source,
	hash: G.UrlUtil.URL_TO_HASH_BUILDER[G.UrlUtil.PG_BACKGROUNDS](e)
}, !0), Xa = (e) => (e._modalFilter?.allData ?? []).map((e, t) => t).filter((t) => e._modalFilter.allData[t] !== e._background && e.constructor.getFeatureEntries(e._modalFilter.allData[t]).length).sort((t, n) => String(e._modalFilter.allData[t].name).localeCompare(String(e._modalFilter.allData[n].name))), Za = {
	Charactermancer_Background_Features: {
		read: ({ comp: e, opts: t }, n) => {
			let r = Ja(e), i = r.indexOf(e._state.mode);
			return {
				kind: n,
				title: L(e.modalTitle),
				note: null,
				skippable: !t?.isUnskippable,
				form: {
					type: "enum",
					options: r.map((t) => ({ label: L(e.constructor._MODE_TO_FULL[t]) ?? a(String(t)) })),
					selected: i >= 0 ? i : null
				}
			};
		},
		write: ({ comp: e }, t) => {
			if (t.default) return e.getFormData();
			let n = Ja(e)[Number(t.value)];
			if (n == null) throw Error("选项不在作者给的范围里");
			e._state.mode = n;
			let r = e.constructor;
			return n === r._MODE_OTHER_BACKGROUND ? new Qa(Ka, {
				comp: e,
				opts: {}
			}) : n === r._MODE_MANUAL ? new Qa(qa, {
				comp: e,
				opts: {}
			}) : e.getFormData();
		}
	},
	[Ka]: {
		read: ({ comp: e }, t) => ({
			kind: t,
			title: L("Choose Background"),
			note: null,
			skippable: !1,
			form: {
				type: "choose",
				set: 0,
				sets: [{
					label: null,
					groups: [{
						title: null,
						count: 1,
						options: Xa(e).map((t) => ({ label: Ya(e._modalFilter.allData[t]) }))
					}]
				}]
			}
		}),
		write: ({ comp: e }, t) => {
			let n = Xa(e)[t.picks?.[0]?.[0] ?? -1];
			if (n == null) throw Error("背景不在作者给的候选里");
			return e._state.ixBackgroundOther = n, e.getFormData();
		}
	},
	[qa]: {
		read: (e, t) => ({
			kind: t,
			title: n("自定义特性"),
			note: null,
			skippable: !1,
			form: {
				type: "texts",
				groups: [{
					title: n("名称"),
					count: 1,
					custom: !0,
					options: []
				}, {
					title: n("内容"),
					count: 1,
					custom: !0,
					options: []
				}]
			}
		}),
		write: ({ comp: e }, t) => {
			let n = String(t.texts?.[0]?.[0] ?? "").trim(), r = String(t.texts?.[1]?.[0] ?? "").trim();
			if (!r) throw Error("自定义特性要写内容");
			let i = e._getDefaultState_manualEntryMeta();
			return i.data = {
				name: n,
				entries: [r]
			}, e._state.manualEntryMetas = [i], e.getFormData();
		}
	}
}, Qa = class {
	kind;
	subject;
	constructor(e, t) {
		this.kind = e, this.subject = t;
	}
}, $a = Symbol("ask"), eo = (e) => typeof e == "string" ? e.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "", to = {
	read: ({ comp: e, opts: t }, n) => ({
		kind: n,
		title: L(e?.modalTitle ?? t?.title),
		note: L(eo(t?.htmlDescription)),
		form: { type: "unknown" },
		skippable: !t?.isUnskippable,
		raw: e ? {
			state: Object.keys(e._state ?? e.__state ?? {}).slice(0, 60),
			props: Object.keys(e).slice(0, 40)
		} : { opts: Object.keys(t ?? {}) }
	}),
	write: ({ comp: e, opts: t }, n) => {
		if (!e && n.value !== void 0) return n.value;
		if (!n.default) throw Error("这种提问还没登记，只能照作者默认或跳过");
		return e ? e.pGetFormData() : t?.default ?? null;
	}
}, no = globalThis, ro = (e, t, n, r, i) => ({
	kind: e,
	title: t,
	note: L(eo(i ?? r?.htmlDescription)),
	form: n,
	skippable: !!r?.isSkippable || (r && "isUnskippable" in r ? !r.isUnskippable : !1)
});
function io(e) {
	let t = document.createElement("div");
	return e.render(N.veE(t)), t;
}
var ao = (e) => [...e.querySelectorAll("select")], oo = {
	read: ({ comp: e, opts: t }, n) => {
		let r = ao(io(e))[0];
		return r ? ro(n, L(e.modalTitle), {
			type: "enum",
			options: [...r.options].map((e) => ({
				label: L(e.text) ?? a(e.text),
				disabled: e.disabled
			})),
			selected: r.selectedIndex
		}, t) : to.read({
			comp: e,
			opts: t
		}, n);
	},
	write: async ({ comp: e }, t) => {
		if (t.default) return e.pGetFormData();
		let n = ao(io(e))[0], r = Number(t.value);
		if (!n || !Number.isInteger(r) || r < 0 || r >= n.options.length) throw Error("选项不在作者给的范围里");
		return n.selectedIndex = r, n.dispatchEvent(new Event("change")), e.pGetFormData();
	}
}, so = (e) => {
	let t = e.subclassFeature || e.__prop === "subclassFeature" || e.subclassSource ? "subclassFeature" : "classFeature", n = t === "subclassFeature" ? e.subclassFeature : e.classFeature, r = typeof n == "string" ? no.DataUtil?.class?.[t === "subclassFeature" ? "unpackUidSubclassFeature" : "unpackUidClassFeature"]?.(n) : null, i = {
		...r ?? {},
		...e,
		...r ? {
			className: r.className,
			classSource: r.classSource,
			level: r.level,
			source: e.source ?? r.source
		} : {}
	}, o = no.UrlUtil?.URL_TO_HASH_BUILDER?.[t]?.(i), s = String(e.tableDisplayName || e.name || "");
	return o && i.source ? f(s, {
		propDroppable: t,
		source: i.source,
		hash: o,
		page: t
	}, !0) : L(s) ?? a(s);
}, co = {
	"*": to,
	"InputUiUtil.pGetUserBoolean": {
		read: ({ opts: e }, t) => ro(t, L(e.title), {
			type: "boolean",
			yes: L(e.textYes ?? "Yes"),
			no: L(e.textNo ?? "No")
		}, e),
		write: (e, t) => t.default ? !0 : !!t.value
	},
	"InputUiUtil.pGetUserEnum": {
		read: ({ opts: e }, t) => ro(t, L(e.title), {
			type: "enum",
			options: (e.values ?? []).map((t) => {
				let n = e.fnDisplay ? e.fnDisplay(t) : t;
				return { label: typeof n == "string" ? L(n) ?? a(n) : a(String(n)) };
			}),
			selected: Number.isInteger(e.default) ? e.default : null
		}, e),
		write: ({ opts: e }, t) => {
			let n = t.default ? e.default ?? 0 : Number(t.value);
			if (!Number.isInteger(n) || n < 0 || n >= (e.values ?? []).length) throw Error("选项不在作者给的范围里");
			return e.isResolveItem ? e.values[n] : n;
		}
	},
	"InputUiUtil.pGetUserNumber": {
		read: ({ opts: e }, t) => ro(t, L(e.title), {
			type: "number",
			min: e.min ?? null,
			max: e.max ?? null,
			value: e.default ?? null
		}, e),
		write: ({ opts: e }, t) => {
			let n = Number(t.default ? e.default : t.value);
			if (!Number.isFinite(n) || e.min != null && n < e.min || e.max != null && n > e.max) throw Error("数字不在作者给的范围里");
			return e.int ? Math.round(n) : n;
		}
	},
	"InputUiUtil.pGetUserString": {
		read: ({ opts: e }, t) => ro(t, L(e.title), {
			type: "string",
			value: String(e.default ?? "")
		}, e),
		write: ({ opts: e }, t) => String(t.default ? e.default ?? "" : t.value ?? "")
	},
	Charactermancer_Class_HpIncreaseModeSelect: oo,
	Charactermancer_OtherProficiencySelect: ba,
	Charactermancer_ExpertiseSelect: ba,
	Charactermancer_DamageResistanceSelect: ba,
	Charactermancer_DamageImmunitySelect: ba,
	Charactermancer_DamageVulnerabilitySelect: ba,
	Charactermancer_ConditionImmunitySelect: ba,
	Charactermancer_Background_Characteristics: xa,
	Charactermancer_AdditionalSpellsSelect: Va,
	Charactermancer_Race_SizeSelect: Ha,
	Charactermancer_AdditionalFeatsSelect: Ga,
	Charactermancer_AbilityScoreSelect: Ta,
	EquipmentApp: ja,
	Charactermancer_Spell_Modal: ka,
	ActorAbilityScoreIncrease: Ea,
	Charactermancer_Class_ProficiencyImportModeSelect: oo,
	Charactermancer_Class_LevelSelect: {
		read: ({ comp: e, opts: t }, r) => {
			let i = e._maxPreviousLevel || 0, s = e._featureArr.map((t, r) => ({
				label: n("{0} 级", a(String(r + 1))),
				note: t.length ? o(t.map(so), "、") : null,
				disabled: !e._isSubclass && r < i
			}));
			return ro(r, L(e.modalTitle), {
				type: "levels",
				levels: s,
				radio: e._isRadio,
				from: i,
				subclass: !!e._isSubclass
			}, t);
		},
		write: ({ comp: e }, t) => {
			let n = e._maxPreviousLevel || 0, r = (Array.isArray(t.value) ? t.value : [t.value]).map(Number).filter((t) => Number.isInteger(t) && t >= 0 && t < e._featureArr.length);
			if (!r.length) throw Error("没有选等级");
			if (!e._isRadio) return {
				isFormComplete: !0,
				data: [...new Set(r)].sort((e, t) => e - t)
			};
			let i = Math.max(...r);
			if (i < n) throw Error("不能选已有的等级");
			return {
				isFormComplete: !0,
				data: Array.from({ length: i - n + 1 }, (e, t) => n + t)
			};
		}
	}
};
Object.assign(co, La(() => co), Za);
// src/rules/kernel/frame/author-ask.ts
var lo = () => globalThis.VeCt?.SYM_UI_SKIP, uo = [
	"pGetUserBoolean",
	"pGetUserEnum",
	"pGetUserNumber",
	"pGetUserString",
	"pGetUserGenericButton"
], fo = ["EquipmentApp", "ActorAbilityScoreIncrease"];
function po(e, t) {
	let n = N;
	if (!n?.UtilApplications || !n?.InputUiUtil) throw Error("此版本 Plutonium 缺少提问入口（UtilApplications / InputUiUtil）");
	let r = 0, i = !1, a = null, o = [], s = null, c = (e) => {
		if (s) {
			let t = s;
			s = null, t(e);
		} else o.push(e);
	}, l = async (e, t, n) => n.skip ? e.skip ? e.skip() : lo() : e.write(t, n), u = async (e) => {
		let t = e;
		for (; t instanceof Qa;) t = await d(t.kind, t.subject);
		return t;
	}, d = async (t, n) => {
		if (i) return null;
		let o = co[t] ?? co["*"];
		if (o.auto) {
			let e = await o.auto(n);
			if (e !== $a) return e;
		}
		let s = r++;
		if (e[s] !== void 0) return u(await l(o, n, e[s]));
		let d = {
			index: s,
			...await o.read(n, t)
		};
		return new Promise((e) => {
			a = {
				adapter: o,
				subject: n,
				resolve: e
			}, c({ question: d });
		});
	}, f = n.UtilApplications, p = n.InputUiUtil, m = f.pGetImportCompApplicationFormData, h = Object.fromEntries(uo.map((e) => [e, p[e]]));
	f.pGetImportCompApplicationFormData = (e) => d(e?.comp?.constructor?.name ?? "?", {
		comp: e.comp,
		opts: e
	});
	for (let e of uo) p[e] = (t = {}) => d(`InputUiUtil.${e}`, { opts: t });
	let g = fo.map((e) => ({
		name: e,
		proto: n[e]?.prototype
	})).filter((e) => e.proto), _ = g.map(({ proto: e }) => ({
		render: Object.getOwnPropertyDescriptor(e, "render"),
		wait: e.pWaitForUserInput
	}));
	for (let { name: e, proto: t } of g) t.render = async function() {
		return this;
	}, t.pWaitForUserInput = async function() {
		return "_cntModesAvailable" in this && !this._cntModesAvailable ? lo() : (typeof this.pInit == "function" && await this.pInit(), d(e, {
			comp: this,
			opts: {}
		}));
	};
	let v = n.Config, y = [["isGmForceSelectAllowedSources", !0], ["isGmUseBlocklist", !1]], b = y.map(([e]) => v?.get?.("dataSources", e));
	for (let [e, t] of y) v?.setTemp?.("dataSources", e, t, { isSkipPermissionCheck: !0 });
	let x = () => {
		y.forEach(([e], t) => v?.setTemp?.("dataSources", e, b[t], { isSkipPermissionCheck: !0 })), f.pGetImportCompApplicationFormData = m;
		for (let e of uo) p[e] = h[e];
		g.forEach(({ proto: e }, t) => {
			_[t].render ? Object.defineProperty(e, "render", _[t].render) : delete e.render, e.pWaitForUserInput = _[t].wait;
		});
	};
	return t().then((e) => {
		x(), c({
			done: !0,
			value: e
		});
	}, (e) => {
		x(), c({ error: e });
	}), {
		next: () => o.length ? Promise.resolve(o.shift()) : new Promise((e) => {
			s = e;
		}),
		async answer(e) {
			let t = a;
			if (!t) throw Error("作者现在没有在等回答");
			let n = await l(t.adapter, t.subject, e);
			a = null, t.resolve(n instanceof Qa ? u(n) : n);
		},
		abort() {
			i = !0;
			let e = a;
			a = null, e?.resolve(null);
		}
	};
}
// src/rules/kernel/frame/class-import.ts
var mo = globalThis, ho = (e, t) => Array.from({ length: Math.max(0, t - e + 1) }, (t, n) => e + n);
async function go(e) {
	let t = mo.UrlUtil, n = await mo.DataLoader.pCacheAndGet("raw_class", e.source, t.URL_TO_HASH_BUILDER[t.PG_CLASSES]({
		name: e.name,
		source: e.source
	}), { isCopy: !0 });
	if (!n) throw Error(`作者资料里找不到职业「${e.name}」（${e.source}）`);
	return n;
}
async function _o(e) {
	let t = await mo.DataLoader.pCacheAndGet("raw_subclass", e.source, mo.UrlUtil.URL_TO_HASH_BUILDER.subclass({
		name: e.name,
		shortName: e.shortName,
		source: e.source,
		className: e.className,
		classSource: e.classSource
	}), { isCopy: !0 });
	if (!t) throw Error(`作者资料里找不到子职业「${e.name}」（${e.source}）`);
	return t;
}
function vo(e) {
	let t = (e.classFeatures ?? []).filter((e) => e?.gainSubclassFeature && e.classFeature).map((e) => Number(mo.DataUtil.class.unpackUidClassFeature(e.classFeature).level));
	return t.length ? Math.min(...t) : null;
}
var yo = (e, t) => N.Charactermancer_Class_Util.getExistingClassItems(e, t)?.[0] ?? null, bo = (e, t) => e.items.find((e) => e.type === "subclass" && e.system?.classIdentifier === t.system?.identifier) ?? null, xo = (e) => e.items.filter((e) => e.type === "class").reduce((e, t) => e + Number(t.system?.levels ?? 0), 0);
async function So(e, t) {
	if (t.prop === "subclass") {
		let n = await go({
			name: t.entry.className,
			source: t.entry.classSource
		}), r = yo(e, n);
		return {
			kind: "subclass",
			classId: r?.id ?? null,
			classLevel: Number(r?.system?.levels ?? 0),
			total: xo(e),
			className: n.name,
			classSource: n.source
		};
	}
	let n = await go(t.entry), r = yo(e, n), i = r ? bo(e, r) : null;
	return {
		kind: "class",
		classId: r?.id ?? null,
		classLevel: Number(r?.system?.levels ?? 0),
		hasSubclass: !!i,
		total: xo(e),
		subclassLevel: vo(n),
		className: n.name,
		classSource: n.source
	};
}
async function Co(e, t, n, r, i) {
	if (!n.levels?.length && !n.subclass) return null;
	let a = N;
	if (t.prop === "subclass") {
		let o = await _o(t.entry), s = await go({
			name: o.className,
			source: o.classSource
		});
		delete s.subclasses;
		let c = (await a.DataPrimer.pGetPrimedJson({
			class: [s],
			subclass: [o]
		})).class[0], l = c.subclasses[0];
		return c.subclasses = [], c._foundryHpIncreaseMode = a.ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__DO_NOT_INCREASE, () => r._pImportEntrySubclass(c, l, new i({
			actor: e,
			levels: n.levels
		}));
	}
	let o = await go(t.entry), s = yo(e, o), c = null, l;
	if (s) {
		let t = a.Charactermancer_Class_Util.getClassSubclassItemTuples({
			classItems: [s],
			subclassItems: e.items.filter((e) => e.type === "subclass")
		})[0], r = await a.SheetLevelUpButtonManager._pGetAvailableClassSubclass(t);
		if (r.errors?.length) throw Error(r.errors.join("；"));
		if (o = r.cls, c = r.sc ?? null, l = r.filterValues, n.fresh) {
			let t = bo(e, s);
			await wr(e, String(s.system?.identifier ?? ""), 0);
			for (let n of [s.id, t?.id].filter(Boolean)) if (e.items.get(n) && await Br(e, n)) throw Error("官方拿掉这个职业的步骤没走完，不能重选第 1 级");
			s = null;
		}
	} else l = await r.constructor.pGetDefaultFilterValues();
	!c && n.subclass && (c = await _o(n.subclass.entry)), o = structuredClone(o), delete o.subclasses;
	let u = (await a.DataPrimer.pGetPrimedJson({
		class: [o],
		subclass: [c].filter(Boolean)
	})).class[0];
	!s && xo(e) > 0 && (u._foundryStartingProficiencyMode = a.Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS);
	let d = n.levels ?? (s ? ho(Number(s.system.levels) + 1, Number(s.system.levels) + 1) : [1]);
	return () => r.pImportEntryClass(u, new i({
		actor: e,
		levels: d,
		filterValues: l
	}));
}
// src/rules/kernel/frame/import-summary.ts
var wo = globalThis, To = (e) => ({
	$t: "data",
	text: String(e)
}), Eo = (e, ...t) => ({
	$t: "plugin",
	text: e,
	args: t
}), Do = (e) => [...e instanceof Set || Array.isArray(e) ? e : []].map(String);
function Oo(e) {
	let t = e.system ?? {}, n = (t) => {
		let n = wo.dnd5e?.documents?.Trait?.actorKeyPath?.(t);
		if (!n) return [];
		let r = ko(e, n);
		return t === "skills" || t === "tool" ? Object.entries(r ?? {}).filter(([, e]) => Number(e?.value ?? e?.proficient ?? 0) > 0).map(([e]) => e) : Do(r?.value);
	};
	return {
		abilities: Object.fromEntries(Object.entries(t.abilities ?? {}).map(([e, t]) => [e, Number(t?.value ?? 0)])),
		hpMax: Number(t.attributes?.hp?.max ?? 0),
		traits: Object.fromEntries([
			"skills",
			"tool",
			"languages",
			"armor",
			"weapon"
		].map((e) => [e, n(e)])),
		currency: Object.fromEntries(Object.entries(t.currency ?? {}).map(([e, t]) => [e, Number(t ?? 0)]))
	};
}
var ko = (e, t) => wo.foundry?.utils?.getProperty?.(e, t) ?? t.split(".").reduce((e, t) => e?.[t], e);
async function Ao(e, t) {
	let n = Oo(t), r = [], i = Jt("abilities"), a = Object.keys(n.abilities).filter((t) => n.abilities[t] !== e.abilities[t]);
	a.length && r.push({
		title: Eo("属性值"),
		text: o(a.map((t) => Eo("{0} {1} → {2}", I(i[t] ?? t), To(e.abilities[t] ?? 0), To(n.abilities[t]))), "、")
	}), n.hpMax !== e.hpMax && r.push({
		title: Eo("生命上限"),
		text: Eo("{0} → {1}", To(e.hpMax), To(n.hpMax))
	});
	let s = wo.dnd5e?.documents?.Trait;
	for (let t of Object.keys(n.traits)) {
		let i = n.traits[t].filter((n) => !e.traits[t]?.includes(n));
		if (!i.length) continue;
		let a = wo.CONFIG?.DND5E?.traits?.[t]?.labels?.title, c = [
			"weapon",
			"armor",
			"tool"
		].includes(t) ? await De() : null;
		r.push({
			title: a ? I(wo.game.i18n.localize(a), a) : To(t),
			text: o(i.map((e) => {
				let n = String(s?.keyLabel?.(e, { trait: t }) ?? e), r = c?.get(e);
				return r ? f(n, r, !0) : qi(n) ?? To(n);
			}), "、")
		});
	}
	let c = Jt("currencies"), l = Object.keys(n.currency).filter((t) => n.currency[t] !== (e.currency[t] ?? 0));
	return l.length && r.push({
		title: Eo("钱币"),
		text: o(l.map((t) => Eo("{0} {1}", I(c[t] ?? t), To(`${n.currency[t] - (e.currency[t] ?? 0) > 0 ? "+" : ""}${n.currency[t] - (e.currency[t] ?? 0)}`))), "、")
	}), r;
}
// src/rules/kernel/frame/commands-import.ts
var jo = globalThis, Mo = () => jo.CONFIG.Actor.documentClass, K = null;
function No(e, t) {
	async function n(e) {
		if ("question" in e) return {
			kernelStatus: "pending",
			pending: { question: e.question },
			question: e.question
		};
		let { actorId: n, entry: r, before: i, grant: a, snap: o } = K;
		if (K = null, "error" in e) throw e.error;
		let s = t(n), c = e.value;
		a && typeof c?.status == "symbol" && c.status.description === "taskExitComplete" && await Cr(s, a.cls, a.levels, s.items.filter((e) => !i.has(e.id)).map((e) => e.id));
		let l = () => s.items.filter((e) => !i.has(e.id)), u = l().flatMap((e) => {
			let t = e.flags?.plutonium, n = t && !t.propDroppable && typeof t.page == "string" && t.page.endsWith(".html") ? jo.UrlUtil?.PAGE_TO_PROPS?.[t.page]?.[0] : null;
			return n ? [{
				_id: e.id,
				"flags.plutonium.propDroppable": n
			}] : [];
		});
		u.length && await s.updateEmbeddedDocuments("Item", u);
		let d = l().map((e) => ({
			_id: e.id,
			name: e.name,
			label: xi(e, [r]).name,
			type: e.type,
			typeLabel: Rt(String(jo.CONFIG.Item.typeLabels?.[e.type] ?? "")),
			flags: { plutonium: e.flags?.plutonium ?? null }
		}));
		return {
			exit: typeof c?.status == "symbol" ? c.status.description ?? null : null,
			added: d,
			facts: await Ao(o, s)
		};
	}
	return {
		draftStart: (t) => e([], async () => {
			k(t.seed);
			let e = await Mo().create({
				...t.id ? { _id: t.id } : {},
				name: t.name,
				type: ln
			}, { keepId: !!t.id });
			return {
				id: e.id,
				data: e.toObject()
			};
		}),
		draftLoad: (t) => e([], async () => {
			k(t.seed);
			let e = await Mo().create(structuredClone(t.data), { keepId: !0 });
			return {
				id: e.id,
				data: e.toObject()
			};
		}),
		importPlan: (n, r) => e([], async () => So(t(n), r)),
		importBegin: (r, i, a = [], o, s) => e([], async () => {
			if (K) throw Error("上一次导入还没结束");
			let e = t(r);
			if (o) {
				let t = await Br(e, o);
				if (t) return {
					kernelStatus: "pending",
					reason: "remove-step-not-complete",
					step: t
				};
			}
			let c = jo.game.modules.get("plutonium")?.api, l = await c?.importer?.pGetImporter({ prop: i.prop });
			if (!l) throw Error(`作者没有「${i.prop}」的导入器`);
			let u = new Set(e.items.map((e) => e.id)), d = Oo(e), f = s ? await Co(e, i, s, l, c.importer.ImportOpts) : null, p = structuredClone(i.entry);
			p && typeof p == "object" && !Array.isArray(p.entries) && (p.entries = []);
			let m = po(a, f ?? (() => l.pImportEntry(p, new c.importer.ImportOpts({ actor: e })))), h = s?.levels, g = i.prop === "class" ? i.entry?.name : i.prop === "subclass" ? i.entry?.className : null;
			return K = {
				run: m,
				actorId: r,
				entry: i.entry,
				before: u,
				snap: d,
				...h?.length && g ? { grant: {
					cls: xr(String(g)),
					levels: h
				} } : {}
			}, n(await m.next());
		}, [r]),
		importAnswer: (t) => e([], async () => {
			if (!K) throw Error("没有进行中的导入");
			return await K.run.answer(t), n(await K.run.next());
		}),
		importAbort: () => e([], async () => {
			if (!K) return { actorId: null };
			let { run: e, actorId: t } = K;
			e.abort();
			for (let t = await e.next(); "question" in t; t = await e.next()) e.abort();
			return K = null, { actorId: t };
		})
	};
}
// src/rules/kernel/frame/native-builder-review.ts
function Po(e) {
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
function q(e, t = "", n = "") {
	let r = document.createElement(e);
	return r.className = t, r.textContent = n, r;
}
function J(e, t, n = "p6-builder-btn") {
	let r = q("button", n, e);
	return r.type = "button", r.addEventListener("click", t), r;
}
// src/rules/kernel/frame/native-builder-controls.ts
var Fo = globalThis, Io = (e) => e.trim().toLowerCase(), Lo = /* @__PURE__ */ new WeakMap();
function Ro(e, t) {
	let n = Io(e), r = Object.hasOwn(t.terms, n) ? t.terms[n] : void 0;
	if (r) return r;
	if (!/[a-zA-Z]/.test(e)) return e;
	let i = Lo.get(t);
	i || (i = /* @__PURE__ */ new Map(), Lo.set(t, i));
	let a = i.get(e);
	if (a !== void 0) return a;
	for (let { $t: t, ...n } of [Lt(e), I(e)]) {
		if (t !== "system" || !("key" in n) || !Fo.game.i18n.has(n.key)) continue;
		let r = Fo.game.i18n.localize(n.key);
		if (r !== e) return i.set(e, r), r;
	}
	return i.set(e, e), e;
}
function zo(e, t) {
	let n = Ro(e.trim(), t);
	if (n !== e.trim()) return e.replace(e.trim(), n);
	let r = /^\s*\((\w{3})\)\s*$/.exec(e);
	if (r) {
		let t = Fo.CONFIG.DND5E.abilities[r[1].toLowerCase()]?.label;
		if (t) return e.replace(r[1], t);
	}
	if (e.includes(", ")) {
		let n = e.split(", "), r = n.map((e) => Ro(e, t));
		if (r.some((e, t) => e !== n[t])) return r.join("，");
	}
	return e;
}
function Bo(e, t) {
	for (let t of e.querySelectorAll(".p6-choice-group")) {
		let e = t.previousElementSibling;
		e?.classList.contains("ve-mb-1") && /^Choose\b/.test(e.textContent ?? "") && e.classList.add("p6-choice-instruction");
	}
	let n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), r;
	for (; r = n.nextNode();) {
		let e = r;
		if (!e.data.trim() || e.parentElement?.closest("script,style,textarea,.p6-builder-ui")) continue;
		let n = e.parentElement?.closest("option"), i = zo(e.data, t);
		i !== e.data && (n && !n.hasAttribute("value") && n.setAttribute("value", n.value), e.data = i);
	}
	for (let n of e.querySelectorAll("[title],[placeholder],[aria-label]")) for (let e of [
		"title",
		"placeholder",
		"aria-label"
	]) {
		let r = n.getAttribute(e);
		if (!r) continue;
		let i = zo(r, t);
		i !== r && n.setAttribute(e, i);
	}
	for (let t of e.querySelectorAll("button[name=\"btn-learn-cantrip\"],button[name=\"btn-learn-spell\"],button[name=\"btn-prepare\"]")) {
		let e = t.name === "btn-prepare" ? "准备" : "学习";
		t.textContent !== e && (t.textContent = e), t.setAttribute("aria-pressed", String(t.classList.contains("ve-active")));
	}
}
function Vo(e, t) {
	let n = e.ComponentUiUtil, r = n.getMetaWrpMultipleChoice, i = e.Charactermancer_Spell_Level.prototype, a = i._getListItem;
	return n.getMetaWrpMultipleChoice = function(e, t, n) {
		let i = r.call(this, e, t, n);
		if (n?.count == null || !i.rowMetas?.length) return i;
		let a = q("small", "p6-choice-progress p6-builder-ui");
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
		let r = a.call(this, e, ...n), i = Fo.UrlUtil.URL_TO_HASH_BUILDER.spell(e), o = t.labels.spell?.[i];
		if (o && r?.ele) {
			let e = r.ele.firstElementChild;
			e && (e.textContent = o.name, e.classList.add("p6-spell-name")), r.values.alias = [r.values.alias, o.name].filter(Boolean).join(" "), r.ele.dataset.p6Spell = i;
		}
		return r;
	}, () => {
		n.getMetaWrpMultipleChoice = r, i._getListItem = a;
	};
}
function Ho(e, t, n) {
	let r = e.querySelector(".ve-statgen-shared__wrp-header"), i = r?.querySelector("select"), a = t.compAbility.compStatgen, o = e.closest(".p6-builder-attributes");
	if (o && (o.dataset.mode = a.getMode()), !r || !i || r.querySelector(".p6-ability-methods")) return;
	let s = q("div", "p6-ability-methods p6-builder-ui");
	s.setAttribute("role", "group"), s.setAttribute("aria-label", "怎么定属性");
	let c = [...i.options].slice(1).map((e) => {
		let t = Number(e.value), r = J(Ro(e.textContent ?? "", n), () => {
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
	i.style.setProperty("display", "none", "important"), r.replaceChildren(i, q("b", "", "怎么定属性？"), s), l();
}
var Uo = /* @__PURE__ */ new WeakSet();
function Wo(e) {
	for (let t of e.compClass.compsClassLevelSelect) {
		if (!t?._isRadio || Uo.has(t)) continue;
		let e = t._list?.items ?? [], n = e[0]?.ele.closest(".ve-min-h-0");
		if (!n || !e.length) continue;
		Uo.add(t);
		let r = q("label", "p6-level p6-builder-ui", "目标等级"), i = q("select");
		i.setAttribute("aria-label", "目标等级");
		for (let t of e) {
			let e = t.getId() + 1, n = q("option", "", `${e} 级`);
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
var Go = {
	race: "种族",
	background: "背景",
	class: "职业",
	subclass: "子职业"
};
function Ko(e, t, n) {
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
function qo(e, t, n, r) {
	let i = Go[n.category], a = q("section", "p6-picker"), o = q("input", "p6-picker-search");
	o.type = "search", o.placeholder = `搜索${i}`, o.setAttribute("aria-label", o.placeholder);
	let s = q("div", "p6-picker-list"), c = q("p", "p6-picker-status");
	c.setAttribute("aria-live", "polite"), a.append(o, s, c);
	let l = /* @__PURE__ */ new Map(), u, d = () => e.getSelected() == null ? void 0 : Ko(n, e.getSelected(), r), f = () => {
		let t = e.getSelected();
		for (let [e, n] of l) n.setAttribute("aria-pressed", String(t === e)), n.dataset.preview = String(u?.value === e);
		a.dispatchEvent(new Event("p6-picker-change", { bubbles: !0 }));
	}, p = () => {
		let t = o.value.trim().normalize("NFKC").toLocaleLowerCase(), i = e._rdState.getAvailableOptionMetas().flatMap(({ value: e }) => e == null ? [] : Ko(n, e, r) ?? []).filter((e) => `${e.label.name} ${e.name} ${e.source}`.normalize("NFKC").toLocaleLowerCase().includes(t));
		u && i.some((e) => e.value === u?.value) || (u = i.find((t) => t.value === e.getSelected()) ?? i[0]), l = new Map(i.map((e) => {
			let t = J("", () => {
				u = e, a.dispatchEvent(new Event("p6-picker-preview", { bubbles: !0 })), f();
			}, "p6-picker-row");
			return t.dataset.source = e.source, t.append(q("span", "p6-picker-name", e.label.name), q("small", "p6-picker-source", e.source)), [e.value, t];
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
function Jo(e, t, n) {
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
			return n(qo(this, e.wrp, u, t)), e;
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
var Yo = globalThis, Xo = (e) => e.normalize("NFKC").toLocaleLowerCase();
function Zo(e, t) {
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
		let o = Yo.SortUtil, s = [...new Set(e.flatMap((e) => this._getSetChoices(e)))].sort(o.ascSortLower);
		return new Promise((e) => {
			let r = q("div", "p6-equip-picker p6-builder-ui"), i = q("input", "p6-picker-search");
			i.type = "search", i.placeholder = "搜索装备", i.setAttribute("aria-label", i.placeholder);
			let o = q("div", "p6-equip-picker-list");
			r.append(i, o);
			function c(t, i = null) {
				document.removeEventListener("pointerdown", l, !0), a = void 0, r.remove(), n?.setAttribute("aria-expanded", "false"), n?.focus(), e([t, i]);
			}
			function l(e) {
				e.target instanceof Node && !r.contains(e.target) && !n?.contains(e.target) && c(!1);
			}
			a = () => c(!1);
			let u = s.map((e) => {
				let n = Yo.DataUtil.proxy.unpackUid("item", e, "item"), r = Yo.UrlUtil.URL_TO_HASH_BUILDER.item(n), i = t.labels.item?.[r]?.name ?? Ro(n.name, t), a = J("", () => c(!0, e), "p6-picker-row");
				return a.dataset.uid = e, a.append(q("span", "", i), q("small", "p6-picker-source", n.source)), {
					row: a,
					term: Xo(`${i} ${n.name} ${n.source}`)
				};
			}), d = () => {
				let e = Xo(i.value.trim()), t = u.filter((t) => t.term.includes(e));
				o.replaceChildren(...t.map(({ row: e }) => e)), t.length || o.append(q("p", "p6-picker-status", "没有匹配的装备"));
			};
			i.addEventListener("input", d), r.addEventListener("keydown", (e) => {
				e.key === "Escape" && (e.stopPropagation(), c(!1));
			}), r.append(J("清除这一格", () => c(!0), "p6-equip-picker-clear")), r.setAttribute("role", "dialog"), r.setAttribute("aria-label", n.title || "选择一件物品"), n.setAttribute("aria-expanded", "true"), n.after(r), document.addEventListener("pointerdown", l, !0), d(), i.focus();
		});
	}, () => {
		a?.(), document.removeEventListener("click", o, !0), n.pGetUserChoiceFromEquipmentTypes = r;
	};
}
// src/rules/kernel/frame/native-builder-ui.ts
var Qo = [
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
function $o(e) {
	let t = e.wrpTab;
	t.classList.remove("ve-flex-col"), t.classList.add("p6-builder-step");
	let n = q("aside", "p6-builder-rail");
	n.hidden = !0;
	let r = q("div", "p6-builder-panel"), i = q("div", "p6-builder-selection p6-builder-ui"), a = q("h2", "p6-builder-selection-title"), o = q("div", "p6-native-body"), s = q("div", "p6-builder-card p6-builder-ui"), c = q("small", "p6-picker-source"), l, u = J("选它", () => l?.toggle(), "p6-builder-btn p6-builder-primary"), d = J("‹ 列表", () => {
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
function es(e, t) {
	let { heading: n, title: r, brief: i, form: a, source: o, action: s } = e;
	e.focus(t);
	let c = t?.preview(), l = t?.chosen(), u = c && l?.value === c.value, d = t && Go[t.category];
	if (n.hidden = !t, a.hidden = !!t && !u, i.hidden = !t, r.textContent = c?.label.name ?? (t ? `选择${d}` : ""), o.textContent = c?.source ?? "", s.hidden = !c, !c || !t) {
		delete i.dataset.entry, i.textContent = t ? "请从左栏选择一条资料。" : "";
		return;
	}
	s.textContent = u ? "取消选它" : "选它", s.disabled = t.disabled();
	let f = `${t.category}|${c.hash}`;
	i.dataset.entry !== f && (i.dataset.entry = f, i.textContent = "正在读取资料…", x({
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
function ts(e, t, n, r, i) {
	let a = e._tabs, o = new Map(a.map((e) => [e.name, $o(e)])), s = new Set(Qo.flatMap((e) => e.shop ? [e.name, e.shop] : [e.name])), c = [...Qo, ...a.filter((e) => !s.has(e.name)).map((e) => ({
		name: e.name,
		label: e.btnTab.textContent?.trim() || "作者选项"
	}))], l = a[0].btnTab.parentElement, u = t.lastElementChild;
	l.hidden = !0, u.hidden = !0, u.previousElementSibling instanceof HTMLHRElement && (u.previousElementSibling.hidden = !0), t.classList.add("p6-builder");
	let d = q("nav", "p6-builder-nav p6-builder-ui");
	d.setAttribute("aria-label", "建卡步骤"), t.prepend(d);
	let f = q("section", "p6-builder-review p6-builder-ui");
	t.append(f);
	let p = q("div", "p6-builder-switch p6-builder-ui");
	d.after(p);
	let m = q("span", "p6-builder-spell-status"), h = q("div", "p6-builder-footer p6-builder-ui"), g = q("p", "p6-builder-feedback");
	g.setAttribute("aria-live", "polite");
	let _ = q("small", "p6-builder-hint", "关掉窗口会丢掉这次选择");
	h.append(_, g), t.append(h);
	let v = c[0], y = !1, b = !1, x = 0, ee, te = /* @__PURE__ */ new Map(), ne = J("下一步", () => ie(1), "p6-builder-btn p6-builder-primary"), S = J("上一步", () => ie(-1)), C = String(e._actor?.name ?? ""), w = J(C ? `创建「${C}」` : "创建人物", () => {
		se();
	}, "p6-builder-btn p6-builder-primary");
	h.append(S, ne, w);
	let re = new Map([...c, null].map((e) => {
		let t = J("", () => D(e), "p6-builder-tab");
		return t.append(q("i"), q("span", "", e?.label ?? "完成")), [e, t];
	}));
	d.append(q("span", "p6-builder-tab p6-builder-past", "✓ 名字"), ...re.values());
	function T(t) {
		let r = o.get(t.name);
		if (!r) return !1;
		switch (t.optional) {
			case "subclass": return n.some((e) => e.category === "subclass" && !!e.preview());
			case "spells": return e.compSpell.compsSpellSpells.some(Boolean) || !!r.form.querySelector(".manc__list-row, [name=\"btn-learn-cantrip\"], [name=\"btn-prepare\"]");
			case "controls": return [...r.form.querySelectorAll("button,input,select")].some((e) => !e.closest(".ve-hidden,[hidden]"));
			default: return !0;
		}
	}
	function ie(e) {
		let t = [...c.filter(T), null], n = t[t.indexOf(v) + e];
		n !== void 0 && D(n);
	}
	function E(e) {
		return e.label === "装备" ? "起始装备" : e.label;
	}
	function D(e) {
		if (b || e && !T(e)) return;
		if (v = e, y = !1, g.textContent = "", p.replaceChildren(), p.hidden = !e?.shop && e?.label !== "法术", e?.shop) {
			let e = J("起始装备", () => {
				y = !1, O();
			}), t = J("装备商店", () => {
				y = !0, O();
			});
			p.append(e, t);
		}
		e?.label === "法术" && p.append(m), O();
		let t = re.get(e);
		(t && t.offsetLeft + t.offsetWidth > d.scrollLeft + d.clientWidth || t && t.offsetLeft < d.scrollLeft) && (d.scrollLeft = t.offsetLeft);
	}
	function O() {
		let t = v && (y ? v.shop : v.name), n = t ? o.get(t) : void 0;
		for (let e of o.values()) e.tab.wrpTab.classList.toggle("p6-builder-inactive", e !== n);
		n && e.activeTab_ !== n.tab && (e.activeTab_ = n.tab), f.hidden = !!v, ne.hidden = !v, w.hidden = !!v, S.disabled = v === c[0];
		for (let [e, t] of [...p.children].entries()) t.setAttribute("aria-pressed", String(!!e === y));
		k();
	}
	function ae() {
		let t = Po(e), r = q("dl", "p6-builder-summary"), i = q("div", "p6-builder-todo"), a = q("div", "p6-builder-todo");
		for (let e of c.filter(T)) {
			let o = t.get(E(e)), s = n.filter((t) => t.category === e.prop).flatMap((e) => e.chosen()?.label.name ?? []);
			(s.length || o?.text) && r.append(q("dt", "", e.label), q("dd", "", [...s, o?.text].filter(Boolean).join(" · ")));
			let c = o?.pending || e.prop && !s.length;
			if (c || o?.text.includes("可继续选择")) {
				let t = q("div", "p6-builder-todo-row");
				t.append(q("span", "", c ? o?.text ?? `还没选${e.label}` : o?.text), J("去填", () => D(e))), (o?.pending ? i : a).append(t);
			}
			for (let t of oe(e)) {
				if (Number(t.dataset.missing) < 1) continue;
				let n = q("div", "p6-builder-todo-row");
				n.append(q("span", "", `${e.label} · ${t.textContent}`), J("去填", () => D(e))), a.append(n);
			}
		}
		f.replaceChildren(q("h2", "", C || "检查后创建"), r);
		for (let [e, t] of [[i, "创建前要处理"], [a, "还可以选择"]]) e.childElementCount && (e.prepend(q("b", "", `${t}（${e.childElementCount}）`)), f.append(e));
	}
	function oe(e) {
		return e.prop === "subclass" ? [] : [...o.get(e.name)?.form.querySelectorAll(".p6-choice-progress") ?? []].filter((e) => !e.closest(".ve-hidden"));
	}
	async function se() {
		if (b) return;
		let t = Po(e), n = c.filter(T).find((e) => t.get(E(e))?.pending), r = t.get("装备商店");
		if (n || r?.pending) {
			let e = n ?? c.find((e) => e.shop);
			D(e), !n && r?.pending && (y = !0, O()), g.textContent = (n ? t.get(E(e))?.text : r?.text) ?? "";
		} else {
			b = !0, w.disabled = !0;
			try {
				await i();
			} catch (e) {
				g.textContent = e instanceof Error ? e.message : "作者建卡失败";
			} finally {
				b = !1, w.disabled = !1;
			}
		}
	}
	function k() {
		Wo(e);
		for (let e = n.length - 1; e >= 0; e--) n[e].anchor.isConnected || (n[e].element.remove(), n.splice(e, 1));
		let t = Po(e), i = 1;
		m.textContent = t.get("法术")?.text ?? "本次可在下方选择法术";
		for (let [e, r] of re) {
			r.hidden = !!e && !T(e), e === v ? r.setAttribute("aria-current", "step") : r.removeAttribute("aria-current");
			let a = e && n.some((t) => t.category === e.prop && t.chosen()), o = e && t.get(E(e)), s = !!(o?.pending === !1 || o && !o.pending && !o.text.includes("可继续选择") || a && !o) && !!e && oe(e).every((e) => e.dataset.done === "true");
			r.dataset.done = String(s), r.hidden || (i += 1, r.firstElementChild.textContent = s && e !== v ? "✓" : String(i));
		}
		if (!v) {
			ae();
			return;
		}
		let a = o.get(y ? v.shop : v.name);
		if (!a) return;
		let s = n.filter((e) => a.form.contains(e.anchor));
		for (let e of s) e.element.isConnected || e.mount(a.rail), e.element.hidden = e.category !== v.prop;
		let c = s.filter((e) => e.category === v.prop), l = te.get(v.prop ?? ""), u = l && c.includes(l) ? l : c[0];
		a.rail.hidden = !u, a.tab.wrpTab.classList.toggle("p6-builder-split", !!u), ee !== v && (ee = v, a.tab.wrpTab.dataset.view = u?.chosen() ? "card" : "list"), a.tab.wrpTab.classList.toggle("p6-builder-spells", v.label === "法术"), a.tab.wrpTab.classList.toggle("p6-builder-attributes", v.label === "属性值"), a.tab.wrpTab.classList.toggle("p6-builder-equipment", !!v.shop && !y), es(a, u), Bo(a.form, r), v.label === "属性值" && Ho(a.form, e, r);
	}
	function A() {
		x ||= requestAnimationFrame(() => {
			x = 0, k();
		});
	}
	function ce(e) {
		let t = n.find((t) => t.element === e.target);
		t && te.set(t.category, t);
		let r = e.target.closest(".p6-builder-step");
		r && (r.dataset.view = "card");
	}
	let le = new MutationObserver(A);
	for (let e of o.values()) le.observe(e.form, {
		childList: !0,
		subtree: !0
	});
	return t.addEventListener("p6-picker-change", A), t.addEventListener("p6-picker-preview", ce), t.addEventListener("p6-choice-change", A), t.addEventListener("change", A), t.addEventListener("click", A), D(v), () => {
		le.disconnect(), cancelAnimationFrame(x), t.removeEventListener("p6-picker-change", A), t.removeEventListener("p6-picker-preview", ce), t.removeEventListener("p6-choice-change", A), t.removeEventListener("change", A), t.removeEventListener("click", A);
	};
}
function ns(e, t) {
	let n = e.ActorCharactermancer.Component.prototype, r = n._pRender, i = n._pHandleSaveClick_postSave, a = !1, o, s = !1, c, l = [], u = t ? Vo(e, t) : void 0, d = t ? Zo(e.Charactermancer_AvailableEquipmentInfo, t) : void 0, f = t ? Jo(e, t, (e) => l.push(e)) : void 0;
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
			c?.(), c = ts(this, e, l, t, async () => {
				if (await this._pHandleSaveClick(), s) throw Error("作者未完成建卡，请关掉本次草稿重试。");
			});
		} catch (t) {
			o = t, console.error("完整建卡器界面加载失败", t);
			let n = q("p", "p6-builder-feedback", "无法加载分步建卡，请关闭草稿后重试。");
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
var Y = globalThis, rs = (e) => new Promise((t) => setTimeout(t, e));
function is(e) {
	return { nativeBuild: (t) => e([], async () => {
		let e = Y.game.modules.get("plutonium")?.api;
		if (typeof e?.charactermancer?.pOpen != "function") throw Error("这份 Plutonium 没有完整建卡器（需要本机私人完整版，放在 vendor/private/modules/plutonium/）");
		let n = Y.game.actors.get(t.id);
		if (!n) throw Error(`草稿人不在：${t.id}`);
		if (t.presentation && !ze) throw Error("当前私人完整版和分步建卡支持的版本不一致");
		await Y.ExcludeUtil.pInitialise(), await Y.ExcludeUtil.pSetList([...Y.ExcludeUtil.getList(), ...structuredClone(t.excludes)]);
		let r = new URL(".", location.href).href;
		if (await e.config.setValue("dataSources", "localHomebrew", t.brewFiles.map((e) => r + e)) === !1) throw Error("作者不让登记本战役自制包（dataSources.localHomebrew）");
		let i = JSON.stringify(n.toObject()), a = ze && ns(ze, t.presentation), o = /* @__PURE__ */ new Set(), s = () => void 0, c = Y.Hooks.on("renderApplicationV2", (e) => {
			o.add(e);
		}), l = Y.Hooks.on("closeApplicationV2", (e) => {
			o.delete(e), o.size || s();
		});
		try {
			for (await e.charactermancer.pOpen({ actor: n }); await rs(500), o.size;) await new Promise((e) => {
				s = e, o.size || e();
			});
		} finally {
			Y.Hooks.off("renderApplicationV2", c), Y.Hooks.off("closeApplicationV2", l), a?.close();
		}
		await w();
		let u = n.toObject(), d = a?.error();
		if (d) throw d;
		return (a ? a.completed() : JSON.stringify(u) !== i) ? {
			built: !0,
			data: u
		} : { built: !1 };
	}, [], { ui: !0 }) };
}
// src/rules/kernel/frame/commands.ts
var X = globalThis, as = class extends Error {
	request;
	constructor(e) {
		super("KERNEL_NEEDS_DICE"), this.request = e;
	}
}, os = class extends Error {
	where;
	constructor(e) {
		super("KERNEL_NEEDS_INPUT"), this.where = e;
	}
};
function ss(e, t) {
	let n = X.CONFIG.Dice, r = n.randomUniform, i = X.foundry.dice.terms.Die.prototype, a = Object.hasOwn(i, "roll"), o = i.roll, s = 0, c = 0;
	i.roll = function(...e) {
		return c = this.faces, o.apply(this, e);
	}, n.randomUniform = () => {
		if (s >= e.length) throw new as({
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
		if (l(), e instanceof as) return {
			used: s,
			needs: e.request
		};
		if (e instanceof os) return {
			used: s,
			input: e.where
		};
		throw e;
	});
}
async function cs(e) {
	let t = X.game.socket, n = t.emit, r = [];
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
function ls(e) {
	let t = X.foundry.applications.api.ApplicationV2.prototype, n = X.foundry.applications.sidebar?.AbstractSidebarTab, r = t.render;
	return t.render = function() {
		if (n && this instanceof n) return Promise.resolve(this);
		throw new os(this.constructor.name);
	}, e().finally(() => {
		t.render = r;
	});
}
function us(e) {
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
var Z = (e) => X.game.actors.get(e, { strict: !0 });
function ds(e) {
	let t = {};
	for (let n of e) {
		if (n.action !== "update" || n.type !== "Actor" || n.parentUuid) continue;
		let e = X.game.actors.get(n.data._id);
		if (e?._prepareActiveEffectAttributions) for (let r of Object.keys(X.foundry.utils.flattenObject(n.data)).filter((e) => e.startsWith("system."))) {
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
async function Q(e, t, n = [], { ui: r = !1 } = {}) {
	let i, a = [];
	try {
		({value: i, changes: a} = await cs(() => ss(e, () => r ? t() : ls(t)).then(async (e) => (await w(), e))));
	} catch (e) {
		return {
			status: "error",
			error: e instanceof Error ? e.message : String(e),
			stack: e instanceof Error ? e.stack ?? null : null,
			changes: a
		};
	}
	let o = n.flatMap((e) => ge(Z(e))), s = i.value;
	return {
		status: i.needs ? "missing" : i.input ? "pending" : s?.kernelStatus ?? (o.length ? "unsupported" : "complete"),
		result: s ?? null,
		sources: ds(a),
		changes: a,
		diceUsed: i.used,
		missing: i.needs ? { dice: i.needs } : i.missing ?? null,
		pending: i.input ? { input: i.input } : s?.pending ?? null,
		unsupported: o
	};
}
var fs = xe(Q, Z), ps = Pe(Q, Z), ms = jt(Q), hs = Lr(Q, Z), gs = Vr(Q, Z), _s = Wr(Q), vs = sa(Q, Z, us), ys = ca(Q, Z), bs = ga(Q, Z), xs = oi(Q), Ss = In(Q), Cs = No(Q, Z), ws = is(Q), Ts = { configure: !1 }, Es = 15e3, Ds = { create: !1 }, Os = {
	warmImport: () => wn(),
	...Cs,
	...ws,
	...fs,
	...ps,
	...ms,
	...hs,
	...gs,
	..._s,
	...vs,
	...ys,
	...bs,
	...xs,
	...Ss,
	roll: (e, t = {}, n = [], r = {}) => Q(n, async () => {
		let n = {
			basic: X.CONFIG.Dice.BasicRoll,
			d20: X.CONFIG.Dice.D20Roll,
			damage: X.CONFIG.Dice.DamageRoll
		}, i = new (r.kind ? n[r.kind] : X.Roll)(e, t, r.options ? structuredClone(r.options) : void 0);
		return await i.evaluate({ allowInteractive: !1 }), us(i);
	}),
	damage: (e, t, n = [], r = {}) => Q(n, async () => {
		let n = Z(e);
		return await n.applyDamage(t, r), { hp: n.system.attributes.hp.toObject?.() ?? { ...n.system.attributes.hp } };
	}, [e]),
	rest: (e, t, n = [], r = {}) => Q(n, async () => {
		let n = await Z(e)[t === "short" ? "shortRest" : "longRest"]({
			dialog: !1,
			chat: !1,
			...r
		});
		return n ? JSON.parse(JSON.stringify(n, (e, t) => e === "clone" ? void 0 : t)) : null;
	}, [e]),
	save: (e, t, n = []) => Q(n, async () => (await Z(e).rollSavingThrow({ ability: t }, Ts, Ds))?.map(us) ?? null, [e]),
	skill: (e, t, n = []) => Q(n, async () => (await Z(e).rollSkill({ skill: t }, Ts, Ds))?.map(us) ?? null, [e]),
	attack: (e, t, n = []) => Q(n, async () => {
		let n = Z(e).items.get(t, { strict: !0 }).system.activities.find((e) => e.type === "attack");
		if (!n) return null;
		let r = await n.rollAttack({}, Ts, Ds), i = await n.rollDamage({}, Ts, Ds);
		return {
			attack: r?.map(us) ?? null,
			damage: i?.map(us) ?? null
		};
	}, [e]),
	attribution: (e, t) => Object.fromEntries(t.map((t) => [t, (Z(e)._prepareActiveEffectAttributions(t) ?? []).map((e) => ({
		label: e.label,
		mode: e.mode,
		value: e.value
	}))])),
	unsupported: () => X.game.actors.contents.flatMap((e) => ge(e)),
	convert: async (e, t, n = {}) => {
		let r = await we(), i = {
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
				t = setTimeout(() => n(Error(`PROBE_TIMEOUT ${Es}`)), Es);
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
}, ks = (e) => e instanceof Error ? e.message : String(e);
async function As(e, t, n) {
	let i = (e) => e.pack.docIdLocal, a = /* @__PURE__ */ new Map();
	if (await n(e) === null) return {
		accepted: e,
		errors: a
	};
	let o = (n, i, a) => {
		let o = new Set(i), s = (n) => {
			if (!o.has(n)) {
				o.add(n);
				for (let i of p(n.pack)) {
					if (r(i, t, [...o].map((e) => e.pack))) continue;
					let n = e.find((e) => !a.has(e) && r(i, t, [e.pack]));
					n && s(n);
				}
			}
		};
		return s(n), e.filter((e) => o.has(e));
	}, s = /* @__PURE__ */ new Set();
	for (let t of e) {
		let e = await n(o(t, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set()));
		e !== null && (s.add(t), a.set(i(t), e));
	}
	let c = /* @__PURE__ */ new Set(), l = async (e) => {
		if (c.has(e)) return;
		let t = o(e, c, s), r = await n(t);
		if (r !== null) a.set(i(e), r);
		else {
			c = new Set(t);
			for (let e of t) a.delete(i(e));
		}
	};
	for (let t of e) s.has(t) || await l(t);
	for (let t of e) s.has(t) && await l(t);
	return {
		accepted: e.filter((e) => c.has(e)),
		errors: a
	};
}
async function js(e, t) {
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
	], l = c.map((e) => o[e]), u = new Set(Object.values(r).filter((e) => typeof e?.pMergeCopy == "function")), { accepted: d, errors: f } = await As(e, new Set(Object.keys(i.SOURCE_JSON_TO_FULL).map((e) => e.toLowerCase())), async (e) => {
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
			return ks(e);
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
var Ms = globalThis;
function Ns(e, t) {
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
function Ps(e) {
	if (!e || !Object.keys(e).length) return;
	let t = Ms.fetch.bind(Ms);
	Ms.fetch = async (n, r) => {
		let i = typeof n == "string" ? n : n instanceof URL ? n.href : n.url, a = Ns(e, new URL(i, location.href));
		if (!a) return t(n, r);
		let o = await t(n instanceof Request ? new Request(a, n) : a, r);
		return o.status === 404 ? t(n, r) : o;
	};
}
// src/ui/styles/build-frame.css?inline
var Fs = "html,body{color:var(--text);font-family:var(--font-sans);font-size:var(--fs-md);line-height:var(--lh-ui);--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;background:var(--bg)!important}@media (prefers-color-scheme:dark){html,body{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark}}body,.application,.window-app{--background:var(--surface);--color-header-background:var(--head-bg);--color-border:var(--line);--color-tabs-border:var(--line);--color-fieldset-border:var(--line);--color-form-hint:var(--text3);--color-form-hint-hover:var(--text2);--color-form-label:var(--text2);--color-form-label-hover:var(--text);--color-text-emphatic:var(--text);--color-text-primary:var(--text);--color-text-secondary:var(--text2);--color-text-subtle:var(--text3);--color-text-selection:var(--text);--color-text-selection-bg:var(--primary-tint);--table-background-color:var(--surface);--table-header-bg-color:var(--bg-sunk);--table-header-border-color:var(--line);--table-header-text-color:var(--text);--table-row-color-even:var(--bg-sunk);--table-row-color-odd:transparent;--table-row-color-highlight:var(--primary-tint);--content-link-background:var(--primary-tint);--content-link-border-color:var(--primary-tint-line);--content-link-text-color:var(--primary-text);--content-link-icon-color:var(--primary-text);--color-text-dark-primary:var(--text);--hotbar-height:0px;--color-scheme:light}@media (prefers-color-scheme:dark){body,.application,.window-app{--color-scheme:dark}}.application,.window-app{overflow:hidden;color-scheme:var(--color-scheme)!important;background:var(--surface)!important;color:var(--text)!important;font-family:var(--font-sans)!important;border:var(--border) solid var(--line)!important;border-radius:var(--r-lg)!important;box-shadow:var(--shadow-3)!important}.application .window-header,.window-app .window-header{min-height:var(--hit);background:var(--head-bg)!important;color:var(--head-ink)!important;border:0!important;border-bottom:var(--border) solid var(--head-line)!important;font-family:var(--font-sans)!important;font-size:var(--fs-md)!important;padding:0 var(--sp-3)!important}.window-title{font-family:var(--font-sans)!important;font-size:var(--fs-md)!important;font-weight:var(--fw-semibold)!important;color:inherit!important}.window-header button,.window-header .header-control,.window-header a{box-shadow:none!important;color:var(--head-ink2)!important;background:0 0!important;border:0!important;min-height:0!important}.window-header button:hover,.window-header .header-control:hover,.window-header a:hover{color:var(--head-ink)!important;background:var(--head-hover)!important}.window-content{background:var(--surface)!important;color:var(--text)!important;-webkit-backdrop-filter:none!important;font-family:var(--font-sans)!important;font-size:var(--fs-md)!important}.window-resize-handle{opacity:.5;filter:none!important}.ve-app-window,.ve-window,.ve-ui-modal__overlay,.ve-hwin,.ve-ui-tab-side__wrp-tab{background:var(--surface)!important;color:var(--text)!important}.window-content a{color:var(--primary-text)!important}.window-content hr{border:0!important;border-top:var(--border) solid var(--line)!important;background:0 0!important}.window-content h1,.window-content h2,.window-content h3,.window-content h4,.window-content h5{border:0;color:var(--text)!important;font-family:var(--font-sans)!important;text-shadow:none!important}.window-content table,.window-content th,.window-content td{color:var(--text)!important;border-color:var(--line)!important}.window-content button,.window-content .ve-btn{font:inherit;min-height:30px;padding:0 var(--sp-3);cursor:pointer;font-size:var(--fs-sm)!important;border:var(--border) solid var(--line-ctrl)!important;border-radius:var(--r-sm)!important;background:var(--surface)!important;color:var(--text)!important;box-shadow:none!important;text-shadow:none!important;background-image:none!important}.window-content button:hover,.window-content .ve-btn:hover{background:var(--bg-hover)!important}.window-content .ve-btn-primary,.window-content button.ve-btn-primary{background:var(--primary)!important;border-color:var(--primary)!important;color:var(--on-primary)!important}.window-content .ve-btn-primary:hover{background:var(--primary-hover)!important}.window-content .ve-btn.active,.window-content button.active{background:var(--primary-tint)!important;border-color:var(--primary-tint-line)!important;color:var(--primary-text)!important}.window-content button:disabled,.window-content .ve-btn:disabled{opacity:.5;cursor:default}.window-content input[type=text],.window-content input[type=number],.window-content input[type=search],.window-content select,.window-content textarea{font:inherit;min-height:30px;font-size:var(--fs-sm)!important;color:var(--text)!important;background:var(--surface)!important;border:var(--border) solid var(--line-ctrl)!important;border-radius:var(--r-sm)!important;box-shadow:none!important}.window-content input[type=checkbox],.window-content input[type=radio]{accent-color:var(--primary)}.window-content button:focus-visible,.window-content input:focus-visible,.window-content select:focus-visible,.window-content textarea:focus-visible{outline-offset:1px;outline:2px solid var(--focus)!important}.window-content .ve-muted,.window-content .ve-text-muted{color:var(--text2)!important}", Is = ".application.trpg-main{box-shadow:none!important;border:0!important;border-radius:0!important}.application.trpg-main>.window-header{display:none!important}.application.trpg-main>.window-content{padding:0!important}.application:not(.trpg-main)>.window-header{min-height:52px;background:var(--surface)!important;color:var(--text)!important;border-bottom:var(--border) solid var(--line)!important;padding:0 var(--sp-3) 0 var(--sp-5)!important}.application:not(.trpg-main) .window-title{font-size:var(--fs-xl)!important}.window-header [data-action=close]{border-radius:var(--r-sm);width:32px;height:32px;color:var(--text2)!important;font-size:0!important}.window-header [data-action=close]:before{content:\"✕\";font:16px/1 var(--font-sans)}.window-header [data-action=close]:hover{background:var(--bg-hover)!important;color:var(--text)!important}.ve-ui-tab__wrp-tab-heads--border{gap:var(--sp-1);counter-reset:trpg-step;flex-wrap:wrap;padding:var(--sp-3) var(--sp-4)!important;border:0!important;border-bottom:var(--border) solid var(--line)!important;background:var(--surface)!important;display:flex!important}.window-content .ve-ui-tab__btn-tab-head{counter-increment:trpg-step;align-items:center;gap:var(--sp-2);min-height:32px!important;padding:0 var(--sp-3)!important;border-radius:var(--r-pill)!important;color:var(--text2)!important;font-size:var(--fs-sm)!important;background:0 0!important;border:0!important;width:auto!important;transition:none!important;display:inline-flex!important}.window-content .ve-ui-tab__btn-tab-head:before{content:counter(trpg-step);border:var(--border) solid var(--line-ctrl);width:20px;height:20px;font-size:var(--fs-xs);border-radius:50%;place-items:center;display:inline-grid}.window-content .ve-ui-tab__btn-tab-head:hover{background:var(--bg-hover)!important}.window-content .ve-ui-tab__btn-tab-head.ve-active{font-weight:var(--fw-semibold);background:var(--primary)!important;color:var(--on-primary)!important}.window-content .ve-ui-tab__btn-tab-head.ve-active:before{border-color:currentColor}.window-content hr.ve-hr-1.ve-w-100:has(+.ve-flex-h-right){display:none}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary){gap:var(--sp-2);border-top:var(--border) solid var(--line-ctrl);padding:var(--sp-3) var(--sp-4)!important;background:var(--bg-side)!important}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary) .ve-btn{font-weight:var(--fw-semibold);min-height:var(--hit)!important;padding:0 var(--sp-5)!important;font-size:var(--fs-md)!important}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary) .ve-btn-group{gap:var(--sp-2)}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary) .ve-vr-2{display:none}.window-content .ve-flex-col:has(>hr.ve-hr-2:first-child){padding:var(--sp-3) 0;border:0;border-top:var(--border) solid var(--line);border-radius:0;margin:0;background:0 0!important}.window-content .ve-flex-col>hr.ve-hr-2:first-child{display:none}.window-content .ve-bold{font-weight:var(--fw-semibold)}.window-content .veapp__bg-foundry{background:var(--surface)!important}.window-content .stripe-even,.window-content .stripe-odd,.window-content .stripe-odd-table tr,.window-content .ve-cls-tbl__stripe-odd,.window-content .stripe-odd-table tbody tr:nth-child(odd){background:0 0!important}.window-content input[type=checkbox],.window-content input[type=radio]{accent-color:var(--primary);margin:0;appearance:auto!important;background:0 0!important;border:0!important;width:16px!important;height:16px!important}.window-content input[type=checkbox]:before,.window-content input[type=checkbox]:after,.window-content input[type=radio]:before,.window-content input[type=radio]:after{content:none!important;display:none!important}:is(.window-content label:not(.p6-choice-option):has(>label>input[type=checkbox]),.window-content label:not(.p6-choice-option):has(>label>input[type=radio])){margin:0 0 var(--sp-1);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);cursor:pointer;padding:var(--sp-1) var(--sp-2)!important;background:var(--surface)!important}.window-content label:not(.p6-choice-option):has(>label>input:checked){border-color:var(--primary);background:var(--primary-tint)!important}.window-content .veapp__list-row,.window-content .manc__list-row{border-bottom:var(--border) solid var(--line);align-items:center;min-height:36px;background:var(--surface)!important}.window-content .veapp__list-row-hoverable:hover,.window-content .manc__list-row:hover{background:var(--bg-hover)!important}.window-content .veapp__list-row:has(input:checked){box-shadow:inset 3px 0 0 var(--primary);font-weight:var(--fw-semibold);background:var(--primary-tint)!important}:is(.window-content .ve-input-group:has(>.ve-btn-5et)>.ve-btn,.window-content .sortlabel .ve-btn,.window-content .ve-btn.sort){font-weight:var(--fw-semibold);background:var(--bg-sunk)!important;border-color:var(--line)!important;color:var(--text2)!important;font-size:var(--fs-xs)!important;border-radius:0!important}.window-content .manc-sp__btn-learn-spell,.window-content .manc-sp__btn-prepare,.window-content .ve-fltr__mini-pill{border-radius:var(--r-sm)!important}.window-content .manc-sp__btn-learn-spell.ve-active,.window-content .manc-sp__btn-prepare.ve-active,.window-content .ve-btn.ve-active:not(.ve-ui-tab__btn-tab-head){background:var(--primary)!important;border-color:var(--primary)!important;color:var(--on-primary)!important}.window-content .ve-fltr__mini-pill{background:var(--primary-tint)!important;border:var(--border) solid var(--primary-tint-line)!important;color:var(--primary-text)!important}.window-content .ve-ui-sel2__ipt-display,.window-content .ve-ui-sel2__ipt-search{min-height:var(--hit)!important;padding:0 var(--sp-3)!important;background:var(--surface)!important;color:var(--text)!important;font-size:var(--fs-md)!important}.window-content .ve-ui-sel2__wrp-options{border-radius:var(--r-sm);box-shadow:var(--shadow-2);z-index:20;background:var(--surface)!important;border:var(--border) solid var(--line-ctrl)!important}.window-content .ve-ui-sel2__disp-option{border-bottom:var(--border) solid var(--line);min-height:40px;font-weight:var(--fw-semibold);padding:0 var(--sp-4)!important;background:var(--surface)!important;color:var(--text)!important}.window-content .ve-ui-sel2__disp-option:hover,.window-content .ve-ui-sel2__disp-option:focus{box-shadow:inset 3px 0 0 var(--primary);outline:0;background:var(--bg-hover)!important}.window-content .ve-rd__h,.window-content .entry-title-inner,.window-content .ve-rd__h .entry-title-inner{font-family:var(--font-sans)!important;font-variant:normal!important;font-weight:var(--fw-semibold)!important;letter-spacing:0!important;color:var(--text)!important}.window-content table th,.window-content .ve-rd__table thead th,.window-content .ve-cls-tbl th{font-weight:var(--fw-semibold);font-size:var(--fs-xs);background:var(--bg-sunk)!important;color:var(--text2)!important}.window-content table td,.window-content table th{padding:var(--sp-1) var(--sp-2);border:0!important;border-bottom:var(--border) solid var(--line)!important}.window-content table{background:var(--surface)!important;color:var(--text)!important;font-family:var(--font-sans)!important;border-color:var(--line)!important}.window-content table tr{background:0 0!important}.window-content .ve-tbl-border{background:var(--line)!important}.window-content .ve-stats__th-name{background:var(--surface)!important;border-bottom:var(--border) solid var(--line)!important}.window-content .ve-stats__h-name{font-family:var(--font-sans)!important;font-variant:normal!important;font-size:var(--fs-lg)!important;font-weight:var(--fw-semibold)!important;color:var(--text)!important}.window-content .ve-stats__wrp-h-source,.window-content .ve-stats__wrp-h-source a{font-family:var(--font-sans)!important;font-size:var(--fs-xs)!important;color:var(--text3)!important}.application.trpg-main .ve-ui-tab__wrp-tab-body{padding:var(--sp-3) var(--sp-4)!important;background:var(--surface)!important;border:0!important}.window-content input[readonly],.window-content input:disabled{background:var(--bg-sunk)!important;border-color:var(--line)!important;color:var(--text2)!important}", Ls = ".p6-builder{width:100%;height:100%;min-height:0;font-family:var(--font-sans);flex-direction:column;display:flex}.p6-builder [hidden],.p6-builder .p6-builder-inactive{display:none!important}.p6-builder-nav{align-items:center;gap:var(--sp-1);padding:var(--sp-3) var(--sp-4);border-bottom:var(--border) solid var(--line);flex:none;display:flex;overflow-x:auto}.p6-builder button.p6-builder-tab,.p6-builder button.p6-builder-btn,.p6-builder button.p6-picker-row{color:var(--text);background:var(--surface);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);min-height:var(--hit);padding:0 var(--sp-3);font:inherit;cursor:pointer;transition:none}.p6-builder button.p6-builder-btn:hover,.p6-builder button.p6-builder-tab:hover,.p6-builder button.p6-picker-row:hover{background:var(--bg-hover)}.p6-builder .p6-builder-tab{align-items:center;gap:var(--sp-2);white-space:nowrap;flex:none;display:inline-flex}.p6-builder button.p6-builder-tab{min-height:32px;color:var(--text2);font-size:var(--fs-sm);border-radius:var(--r-pill)!important;background:0 0!important;border-color:#0000!important}.p6-builder button.p6-builder-tab:hover{background:var(--bg-hover)!important}.p6-builder-tab i{border:var(--border) solid var(--line-ctrl);border-radius:50%;place-items:center;width:20px;height:20px;font-style:normal;display:inline-grid}.p6-builder .p6-builder-tab[data-done=true] i{background:var(--primary);color:var(--on-primary);border-color:var(--primary)}.p6-builder .p6-builder-past{padding:0 var(--sp-3);color:var(--text2);font-size:var(--fs-sm)}.p6-builder button.p6-builder-tab[aria-current],.p6-builder button.p6-builder-primary,.p6-builder button.p6-builder-btn[aria-pressed=true]{background:var(--primary)!important;color:var(--on-primary)!important}.p6-builder button.p6-builder-tab[aria-current] i{border-color:currentColor}.p6-builder button:disabled{cursor:not-allowed}.p6-builder button.p6-builder-btn:disabled{opacity:.55}.p6-builder .p6-builder-step{flex-direction:column;flex:1;min-height:0;display:flex;overflow:hidden;padding:0!important}.p6-builder .p6-builder-split:not(.p6-builder-inactive){grid-template-columns:minmax(175px,5fr) minmax(0,7fr);display:grid!important}.p6-builder-panel{flex-direction:column;min-width:0;min-height:0;display:flex;overflow:auto}.p6-native-body{padding:var(--sp-3) var(--sp-4);min-width:0}.p6-builder-selection{align-items:center;gap:var(--sp-2);padding:var(--sp-2) var(--sp-3);z-index:2;background:var(--surface);border-bottom:var(--border) solid var(--line);flex-wrap:wrap;flex:none;display:flex;position:sticky;top:0}.p6-builder-selection-title{min-width:4em;font-size:var(--fs-lg);font-weight:var(--fw-semibold);flex:1;margin:0}.p6-builder-selection .p6-builder-btn{min-height:32px!important}.p6-builder-split .p6-native-body>.ve-flex{flex-direction:column;height:auto!important}.p6-builder-split .p6-native-body>.ve-flex>.ve-flex-col{width:100%!important;overflow:visible!important}.p6-builder-split .p6-native-body>.ve-flex>.ve-vr-1{display:none!important}.p6-builder-split .p6-native-body>.ve-flex:has(>.ve-vr-1)>.ve-vr-1+.ve-flex-col{display:none!important}.p6-builder-rail{border-right:var(--border) solid var(--line);min-width:0;min-height:0}.p6-picker{flex-direction:column;height:100%;min-height:0;display:flex}.p6-picker-search{min-height:var(--hit);width:auto;margin:var(--sp-3) var(--sp-4) var(--sp-2);color:var(--text);background:var(--surface);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);flex:none}.p6-picker-list{flex-direction:column;flex:1;min-height:0;display:flex;overflow:auto}.p6-builder button.p6-picker-row{justify-content:space-between;align-items:center;gap:var(--sp-2);text-align:left;flex:none;width:100%;display:flex;border:0!important;border-bottom:var(--border) solid var(--line)!important;border-radius:0!important}.p6-builder button.p6-picker-row[data-preview=true]{background:var(--primary-tint)!important;box-shadow:inset 2px 0 var(--accent)!important}.p6-builder .p6-picker-row[aria-pressed=true] .p6-picker-source:before{content:\"✓\";margin-right:var(--sp-2);color:var(--text)}.p6-picker-source,.p6-picker-status{color:var(--text2);font-size:var(--fs-xs)}.p6-picker-status{padding:var(--sp-2) var(--sp-4);flex:none;margin:0}.p6-builder-footer{justify-content:flex-end;align-items:center;gap:var(--sp-2);padding:var(--sp-3) var(--sp-4);background:var(--bg-side);border-top:var(--border) solid var(--line);flex-wrap:wrap;flex:none;display:flex}.p6-builder-hint{color:var(--text2);font-size:var(--fs-xs);margin-right:auto}.p6-builder-feedback{color:var(--danger-text);flex-basis:100%;margin:0}.p6-builder-feedback:empty{display:none}.p6-builder-switch{gap:var(--sp-2);padding:var(--sp-2) var(--sp-4);border-bottom:var(--border) solid var(--line);display:flex}.p6-builder-review{min-height:0;padding:var(--sp-4) var(--sp-5);flex:1;overflow:auto}.p6-builder-review h2{margin:0 0 var(--sp-4);font-size:var(--fs-xl)}.p6-builder-summary{gap:var(--sp-2) var(--sp-3);grid-template-columns:minmax(64px,100px) 1fr;margin:0;display:grid}.p6-builder-summary dt{color:var(--text2)}.p6-builder-summary dd{margin:0}.p6-builder-todo{margin-top:var(--sp-4);padding:var(--sp-3);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);background:var(--warn-bg)}.p6-builder-todo-row{justify-content:space-between;gap:var(--sp-2);padding-top:var(--sp-2);align-items:center;display:flex}.p6-level{justify-content:space-between;align-items:center;gap:var(--sp-2);padding:var(--sp-1) 0;display:flex}.p6-level select{width:auto;min-height:34px;padding:0 var(--sp-3)}.p6-choice-progress{color:var(--accent-text);width:100%}.p6-choice-progress[data-done=true]{color:var(--success-text)}.p6-builder button[title]:has(>.fa-magnifying-glass:only-child){width:auto!important;padding-inline:var(--sp-2)!important}.p6-builder button[title]:has(>.fa-magnifying-glass:only-child):after{content:attr(title)}.window-content button.ve-btn-xxs:has(>.fa-check:only-child){width:auto!important;padding-inline:var(--sp-2)!important}.window-content button.ve-btn-xxs:has(>.fa-check:only-child):after{content:\"选择\"}.p6-builder-spells .p6-native-body>.ve-flex{flex-direction:column;height:auto!important}.p6-builder-spells .p6-native-body>.ve-flex>.ve-flex-col{flex:none!important;height:auto!important;overflow:visible!important}.p6-builder-spells .p6-native-body>.ve-flex>.ve-vr-1,.p6-builder-spells .manc__list-row>:is(:nth-child(2),:nth-child(3),:nth-child(4),:nth-child(5),:nth-child(6)){display:none!important}.p6-builder-spells .p6-native-body .manc__list:has(.manc__list-row)~.ve-input-group{display:none!important}.p6-builder-spells .manc__list-row{gap:var(--sp-2);min-height:var(--hit);justify-content:space-between}.p6-builder-spells .manc__list-row>:first-child{flex:1;width:auto!important}.p6-builder-spells .manc__list-row>:nth-child(7){flex:0 0 4.5em;text-align:right!important;width:auto!important}.p6-builder-spells .manc__list-row>:last-child{gap:var(--sp-1);flex:none;display:flex;width:auto!important}@media (width<=520px){.p6-builder-rail{border-right:0}.p6-builder-nav,.p6-builder-footer,.p6-builder-review{padding-inline:var(--sp-3)}.p6-builder-attributes .p6-native-body{padding-inline:var(--sp-2);overflow-x:auto}.p6-builder-attributes .ve-statgen-pb__cell{min-width:0!important}.p6-builder-attributes .ve-statgen-shared__ipt:not(.ve-statgen-pb__ipt-budget){width:41px!important;padding-inline:var(--sp-1)!important}.p6-builder-attributes select.ve-statgen-shared__ipt{appearance:none;text-align:center;padding-inline:0!important}}.p6-choice-instruction{display:none!important}.p6-ability-methods{gap:var(--sp-1);flex-wrap:wrap;display:flex}.p6-builder-attributes .ve-statgen-shared__wrp-header{gap:var(--sp-3);flex-wrap:wrap}.p6-builder-attributes:not([data-mode=pointbuy]) .ve-mobile-sm__flex-col.ve-mb-2:has(.ve-statgen-pb__ipt-budget){display:none!important}.p6-builder [onmouseover*=Renderer\\.hover],.p6-builder [onclick*=Renderer\\.hover]{pointer-events:none!important;color:inherit!important;cursor:inherit!important;text-decoration:none!important}.p6-builder .veapp__btn-filter,.p6-builder .ve-fltr__mini-view{display:none!important}.p6-builder button:has(>.glyphicon-filter){display:none!important}.p6-builder button:has(>.glyphicon-resize-small){display:none!important}.p6-builder .ve-btn-group:has(>button>.glyphicon-refresh){display:none!important}:is(.p6-builder .ve-btn-group:has(.ve-ui-sel2__wrp[style*=none]),.p6-builder .ve-bold:has(+.ve-btn-group .ve-ui-sel2__wrp[style*=none])){display:none!important}.p6-builder-spells .manc__list-row>:nth-child(7),.p6-builder-spells .manc__list-row>:nth-child(7) *{font-size:var(--fs-xs);color:var(--text3)!important}.p6-builder-card{padding:var(--sp-3) var(--sp-4) var(--sp-5);border-top:var(--border) solid var(--line);color:var(--text);font-size:var(--fs-sm);line-height:1.65}.p6-builder-card>table{width:100%;border:0!important}.p6-builder-card td,.p6-builder-card th{padding:var(--sp-1) 0!important;border:0!important}.p6-builder-card-note{margin:0 0 var(--sp-2);color:var(--text2)}.p6-builder .p6-choice-group{align-items:center;gap:var(--sp-2);flex-wrap:wrap;background:0 0!important;border:0!important;height:auto!important;min-height:0!important;padding:0!important;display:flex!important;overflow:visible!important}.p6-builder .p6-choice-group>:not(.p6-choice-option){flex-basis:100%;width:100%!important}.p6-builder .p6-choice-group>hr{margin:var(--sp-1) 0}.p6-builder .p6-choice-progress{color:var(--accent-text);font-size:var(--fs-xs)}.p6-builder .p6-choice-progress[data-done=true]{color:var(--success-text)}.p6-builder .p6-choice-option{white-space:nowrap;align-items:center;gap:var(--sp-1);border-radius:var(--r-sm);min-height:36px;color:var(--text);cursor:pointer;flex:none;position:relative;width:auto!important;padding:0 var(--sp-3)!important;border:var(--border) solid var(--line-ctrl)!important;background:var(--surface)!important;justify-content:flex-start!important;margin:0!important;display:inline-flex!important}.p6-builder .p6-choice-option>label:has(>input){clip-path:inset(50%);margin:0;padding:0;overflow:hidden;width:1px!important;height:1px!important;position:absolute!important}.p6-builder .p6-choice-option>div,.p6-builder .p6-choice-option .ve-w-100{white-space:nowrap;flex:none!important;width:auto!important;max-width:none!important;padding:0!important}.p6-builder .p6-choice-option .ve-help{border-bottom:0!important;text-decoration:none!important}.p6-builder .p6-choice-option:hover{background:var(--bg-hover)!important}.p6-builder .p6-choice-option:has(input:checked){color:var(--on-primary);background:var(--primary)!important;border-color:var(--primary)!important}.p6-builder .p6-choice-option:has(input:checked):before{content:\"✓\";font-size:var(--fs-xs)}.p6-builder .p6-choice-option:has(input:checked) .ve-muted{opacity:.8;color:inherit!important}.p6-builder .p6-choice-option:has(input:disabled):not(:has(input:checked)){color:var(--disabled-text);cursor:not-allowed;background:var(--disabled-bg)!important}.p6-builder .p6-choice-option:has(input:focus-visible){outline:2px solid var(--focus);outline-offset:2px}.p6-builder .p6-choice-option .veapp__msg-warning:empty{display:none}.p6-builder .p6-choice-option .veapp__msg-warning:has(.fa-check){display:none!important}.p6-builder .p6-choice-option:has(.veapp__msg-warning .fa-check):after{content:\"已有\";margin-left:var(--sp-1);color:var(--text3);font-size:var(--fs-xs)}.p6-builder-equipment .imp-cls__wrp-equi-group{gap:var(--sp-2);padding:var(--sp-3) 0!important;border:0!important;border-top:var(--border) solid var(--line)!important;background:0 0!important;margin:0!important}.p6-builder-equipment .imp-cls__wrp-equi-group>div{min-height:var(--hit);padding:var(--sp-2) var(--sp-3) var(--sp-2) 40px;border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);background:var(--surface);position:relative;justify-content:flex-start!important}.p6-builder-equipment .imp-cls__wrp-equi-group>div:has(>.ve-active){border-color:var(--primary);background:var(--primary-tint)}.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key,.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key.ve-active{z-index:0;inset:0;border-radius:var(--r-sm)!important;color:#0000!important;width:auto!important;height:auto!important;box-shadow:none!important;background:0 0!important;border:0!important;margin:0!important;font-size:0!important;position:absolute!important}.p6-builder-equipment .imp-cls__disp-equi-choice-key:before{content:\"\";left:var(--sp-3);border:2px solid var(--line-ctrl);box-sizing:border-box;border-radius:50%;width:16px;height:16px;margin-top:-8px;position:absolute;top:50%}.p6-builder-equipment .imp-cls__disp-equi-choice-key.ve-active:before{border:5px solid var(--primary)}.p6-builder-equipment .imp-cls__disp-equi-choice-key:focus-visible{outline:2px solid var(--focus)!important}.p6-builder-equipment .imp-cls__wrp-equi-group>div>.ve-w-100{z-index:1;pointer-events:none;position:relative}.p6-builder-equipment .imp-cls__wrp-equi-group>div>.ve-w-100 :is(button,input,select){pointer-events:auto}.p6-builder-equipment .imp-cls__wrp-equi-group>div:has(>.imp-cls__disp-equi-choice-key:disabled){padding-left:var(--sp-3);border-color:var(--line);background:var(--bg-sunk)}.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key:disabled{visibility:hidden!important;display:none!important}.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key:disabled:before{content:none!important}.p6-builder-equipment button:has(>.fa-magnifying-glass){align-items:center;gap:var(--sp-1);min-height:32px;width:auto!important;padding:0 var(--sp-2)!important;border:var(--border) solid var(--line-ctrl)!important;border-radius:var(--r-sm)!important;background:var(--surface)!important;color:var(--text)!important;display:inline-flex!important}.p6-builder-equipment button:has(>.fa-magnifying-glass)>.fa-magnifying-glass{display:none}.p6-builder-equipment button:has(>.fa-magnifying-glass):after{content:attr(title) \" ▾\"!important}.p6-equip-picker{z-index:30;pointer-events:auto;background:var(--surface);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);width:min(340px,100%);box-shadow:var(--shadow-2);flex-direction:column;display:flex;position:absolute;top:calc(100% + 4px);left:0}.p6-builder-equipment .imp-cls__wrp-equi-group>div>.ve-w-100:has(.p6-equip-picker){z-index:20}.p6-equip-picker .p6-picker-search{margin:var(--sp-2)}.p6-equip-picker-list{border-top:var(--border) solid var(--line);max-height:220px;overflow:auto}.p6-builder button.p6-equip-picker-clear{min-height:32px;margin:var(--sp-1) var(--sp-2);padding:0 var(--sp-2);color:var(--primary-text);font:inherit;font-size:var(--fs-sm);cursor:pointer;background:0 0;border:0;align-self:flex-start}.p6-builder-to-list{display:none}@media (width<=520px){.p6-builder .p6-builder-split:not(.p6-builder-inactive){grid-template-rows:minmax(0,1fr)!important;grid-template-columns:1fr!important}.p6-builder-split[data-view=list]>.p6-builder-panel,.p6-builder-split[data-view=card]>.p6-builder-rail{display:none!important}.p6-builder-split .p6-builder-rail{border-bottom:0}.p6-builder button.p6-builder-to-list{color:var(--primary-text);align-items:center;display:inline-flex;padding:0 var(--sp-1)!important;background:0 0!important;border:0!important}}", Rs = globalThis;
function zs(e = [
	d,
	s,
	Fs,
	Is,
	Ls
]) {
	return e.join("\n").replace(/:host\b/g, ":root").replace(/^\s*all:\s*initial;\s*$/m, "").replace(/^\s*pointer-events:\s*inherit;.*$/m, "");
}
var Bs = JSON.stringify({ colorScheme: {
	applications: "",
	interface: ""
} });
function Vs(e) {
	return new Promise((t) => {
		let n = Object.assign(document.createElement("link"), {
			rel: "stylesheet",
			href: e
		});
		n.onload = n.onerror = () => t(), document.head.append(n);
	});
}
var Hs = [
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
function Us(e) {
	for (let t of Array.from(e)) {
		let e = t.style;
		if (e) {
			e.backgroundImage?.includes("url(") && (e.backgroundImage = "none");
			for (let t of Hs) e.getPropertyPriority(t) === "important" && e.setProperty(t, e.getPropertyValue(t));
		}
		let n = t.cssRules;
		n && Us(n);
	}
}
function Ws(e) {
	let t = (e) => Array.from(e).some((e) => e.selectorText === ".ve-hidden"), n = Array.from(e.cssRules).filter((e) => typeof CSSLayerBlockRule < "u" && e instanceof CSSLayerBlockRule), r = new Set(n.filter((e) => t(e.cssRules)).map((e) => e.name));
	for (let e of r) {
		let t = n.filter((t) => t.name === e).at(-1);
		t?.insertRule(".ve-hidden { display: none !important; }", t.cssRules.length);
	}
	t(e.cssRules) && e.insertRule(".ve-hidden { display: none !important; }", e.cssRules.length);
}
var Gs = 0, Ks = 160, qs = () => Math.max(Ks, document.documentElement.clientHeight - Ks), Js = /* @__PURE__ */ new WeakSet();
function Ys(e) {
	e.setPosition({
		left: Gs,
		top: Gs,
		width: innerWidth - 0,
		height: innerHeight - 0
	});
}
function Xs() {
	Rs.Hooks.on("renderApplicationV2", (e, t, n, r) => {
		r?.isFirstRender && e?.options?.window?.resizable && (Math.abs(Number(e.position?.height) - qs()) > 2 || (Js.add(e), e.element?.classList.add("trpg-main"), Ys(e)));
	});
	let e = 0;
	addEventListener("resize", () => {
		clearTimeout(e), e = setTimeout(() => {
			for (let e of Rs.foundry.applications.instances.values()) e.rendered && Js.has(e) && Ys(e);
		}, 150);
	});
}
async function Zs(e, t) {
	Xs();
	let n = [Rs.game.system, ...Rs.game.modules.filter((e) => e.active)].flatMap((e) => [...e.styles ?? []].map((e) => String(e.src ?? e))), r = [...e.styles, ...n].map((e) => {
		let n = new URL(e, location.href);
		return (Ns(t, n) ?? n).href;
	}), i = new Set(e.styles.map((e) => new URL(e, location.href).href)), a = r.map(async (e) => {
		if (await Vs(e), i.has(e)) return;
		let t = [...document.styleSheets].find((t) => t.href === e);
		t && (Us(t.cssRules), Ws(t));
	}), o = document.createElement("style");
	o.dataset.trpgTheme = "build", o.textContent = zs(), document.head.append(o), new MutationObserver(() => {
		document.head.lastElementChild !== o && document.head.append(o);
	}).observe(document.head, { childList: !0 }), await Promise.all(a);
}
// src/rules/kernel/frame/main.ts
var $ = globalThis, Qs = new URLSearchParams(location.search).get("frame") ?? "", $s = $.__trpgFrameErrors ?? [];
async function ec(e) {
	let t = await fetch(new URL(e, location.href));
	if (!t.ok) throw Error(`${t.status}: ${e}`);
	return t.text();
}
async function tc(e) {
	let t = await x({
		op: "file",
		path: `packs/${e}.json`
	});
	if (typeof t != "string") throw Error(`Pack is not available: ${e}`);
	return JSON.parse(t);
}
var nc;
async function rc(e) {
	if (nc) throw Error("Kernel is already booted");
	let t = [], { foundry: n, Hooks: r } = $;
	k(e.seed ?? "kernel"), Ps(e.moduleRoots), $.release = new n.config.ReleaseData(e.release);
	let i = ne(e);
	$.packages = {
		System: new n.utils.Collection([[i.system.id, new n.packages.System(i.system)]]),
		Module: new n.utils.Collection(i.modules.map((e) => [e.id, new n.packages.Module(e)]))
	};
	let a = $.io({
		autoConnect: !1,
		forceNew: !0
	});
	nc = {
		...re(a, {
			userId: e.userId,
			worldTime: e.worldTime,
			readPack: tc,
			readText: ec
		}),
		steps: t
	};
	let o = n.Game;
	class s extends o {
		activateListeners() {
			t.push("omit UI event listeners");
		}
		initializeUI() {
			for (let [e, t] of Object.entries($.CONFIG.ui)) $.ui[e] = new t();
			$.ui.windows ??= {};
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
	$.game = new s("game", i, a), $.game.issues._detectUsabilityIssues = () => {
		t.push("omit usability warnings");
	}, $.game.nue && ($.game.nue.initialize = () => void 0), $.game.settings.storage.get("client").setItem("core.noCanvas", "true"), e.display && $.game.settings.storage.get("client").setItem("core.uiConfig", Bs), await sc(`systems/${i.system.id}/dnd5e.js`);
	let c = !!e.moduleRoots?.plutonium && e.language === "zh.core";
	for (let e of i.modules) for (let t of e.esmodules ?? []) await Be(new URL(t, location.href), c);
	r.once("init", di), r.once("setup", () => {
		$.CONFIG.DND5E?.calendar && ($.CONFIG.DND5E.calendar.application = null), he();
	}), await $.game.initialize(), e.display && await Zs(e.display, e.moduleRoots);
	let l = Date.now() + 3e4;
	for (; i.modules.some((e) => e.id === "plutonium") && typeof $.game.modules.get("plutonium")?.api != "object";) {
		if (Date.now() > l) throw Error("Plutonium API was not ready within 30 seconds");
		await new Promise((e) => setTimeout(e, 50));
	}
	return ic();
}
function ic() {
	let e = $.game;
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
		errors: [...$s]
	};
}
function ac() {
	return $.game.actors.contents.map((e) => ({
		source: e.toObject(),
		system: e.system.toObject(!1),
		name: e.name,
		validation: e.validationFailures
	}));
}
var oc = {
	...Os,
	boot: rc,
	loadBrews: js,
	status: ic,
	preparedActors: ac,
	reserveActorIds: (e) => {
		if (!nc) throw Error("Kernel is not booted");
		nc.reserve(e);
	},
	changes: () => nc?.changes ?? [],
	calls: () => nc?.calls ?? [],
	steps: () => nc?.steps ?? []
};
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "call") return;
	let n = (e) => parent.postMessage({
		channel: _,
		type: "result",
		frame: Qs,
		id: t.id,
		...e
	}, location.origin), r = oc[t.fn];
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
function sc(e) {
	return new Promise((t, n) => {
		let r = document.createElement("script");
		r.src = e, r.onload = () => t(), r.onerror = () => n(Error(`Failed to load ${e}`)), document.head.append(r);
	});
}
async function cc() {
	$.SIGNED_EULA = !0, $.ROUTE_PREFIX = new URL(".", location.href).pathname.replace(/^\/+|\/+$/g, ""), $.MESSAGES = null, await import(
		/* @vite-ignore */
		new URL("scripts/foundry.mjs", location.href).href
);
	let e = {
		channel: _,
		type: "ready",
		frame: Qs,
		codeSet: "foundry",
		authorVersion: $.foundry?.CONST?.vtt ?? null,
		present: { foundry: !!$.foundry?.Game },
		errors: [...$s]
	};
	parent.postMessage(e, location.origin);
}
document.readyState === "complete" ? cc() : addEventListener("load", () => {
	cc();
}, { once: !0 });
