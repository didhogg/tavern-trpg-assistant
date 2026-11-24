import { _ as e, a as t, b as n, c as r, d as i, f as a, h as o, i as s, l as c, m as l, n as u, r as d, t as f, u as p } from "./tokens-BNrgT_1x.js";
import { a as m, o as h, t as g } from "./protocol-CoIo3UiI.js";
// src/rules/kernel/frame/request.ts
var _ = new URLSearchParams(location.search).get("frame") ?? "", v = 1, y = /* @__PURE__ */ new Map();
function b(e) {
	return new Promise((t, n) => {
		let r = 1e6 + v++;
		y.set(r, {
			resolve: t,
			reject: n
		}), parent.postMessage({
			channel: g,
			type: "request",
			frame: _,
			id: r,
			...e
		}, location.origin);
	});
}
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "response" || !y.has(t.id)) return;
	let n = y.get(t.id);
	y.delete(t.id), t.ok ? n.resolve(t.value) : n.reject(Error(t.error));
});
// src/rules/kernel/packages.ts
var x = [
	"esmodules",
	"scripts",
	"styles"
];
function ee(e, t) {
	let n = `${t}s/${e.id}/`, r = (e) => /^(?:[a-z]+:)?\/\//i.test(e) || e.startsWith(n) ? e : n + e.replace(/^\.?\//, ""), i = structuredClone(e);
	for (let e of x) {
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
function te(e) {
	let { CONST: t, CONFIG: n, foundry: r } = globalThis, i = ee(e.system, "system"), a = e.modules.map((e) => ({
		...ee(e, "module"),
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
function ne(e, t) {
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
			return i.map((e) => ne(e, t.indexFields));
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
var w = null, T = null;
function ie(e, t) {
	return T ? T(e, t) : t();
}
function E(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return t >>> 0;
}
function D(e) {
	w = e.crypto.getRandomValues.bind(e.crypto);
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
	}), T = async (e, n) => {
		let r = t;
		t = E(e);
		try {
			return await n();
		} finally {
			t = r;
		}
	}, (e) => {
		t = E(e);
	};
}
function O() {
	let e = /* @__PURE__ */ new Uint32Array(4);
	return w ? w(e) : crypto.getRandomValues(e), Array.from(e, (e) => e.toString(16).padStart(8, "0")).join("");
}
// src/rules/kernel/frame/seed.ts
var ae = D(globalThis);
function oe() {
	return O();
}
function k(e) {
	ae(e);
}
function se(e, t) {
	let n = t;
	return `entry:${e}:${String(n?.source ?? "")}:${String(n?.name ?? "")}:${A(JSON.stringify(t))}`;
}
function A(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return (t >>> 0).toString(16);
}
// src/rules/kernel/frame/writings.ts
var ce = [
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
], le = {
	rule: "no-target",
	reason: "目标路径既没有数据字段，人物身上也没有这个属性；原代码写进去也没有规则读取"
}, ue = globalThis, de = /* @__PURE__ */ new WeakMap(), j = !1, fe = (e) => e?.documentName === "Actor";
function pe(e, t, n) {
	let r = String(t.effect?.uuid ?? ""), i = String(t.key ?? ""), a = de.get(e);
	a || de.set(e, a = /* @__PURE__ */ new Map()), a.has(`${r}|${i}`) || a.set(`${r}|${i}`, {
		actor: e.id,
		effect: r,
		key: i,
		value: t.value,
		rule: n.rule,
		reason: n.reason,
		affects: i
	});
}
function me() {
	if (j) return;
	let e = ue.CONFIG?.ActiveEffect?.documentClass, t = ue.CONFIG?.Actor?.documentClass;
	if (!e || !t) return;
	j = !0;
	let n = t.prototype.applyActiveEffects;
	t.prototype.applyActiveEffects = function(e, ...t) {
		return (e === "initial" || e === void 0) && de.set(this, /* @__PURE__ */ new Map()), n.call(this, e, ...t);
	};
	let r = e.applyChange;
	e.applyChange = function(e, t, ...n) {
		let i = fe(e) && t?.effect ? ce.find((e) => e.test(String(t.key ?? ""))) : void 0;
		return i && pe(e, t, {
			rule: i.id,
			reason: i.reason
		}), r.call(this, e, t, ...n);
	};
	let i = e._applyChangeUnguided;
	e._applyChangeUnguided = function(e, t, ...n) {
		return fe(e) && t?.effect && ue.foundry.utils.getProperty(e, t.key) === void 0 && !ce.some((e) => e.test(String(t.key ?? ""))) && pe(e, t, le), i.call(this, e, t, ...n);
	};
}
function he(e) {
	return me(), de.has(e) || e.reset(), [...de.get(e)?.values() ?? []];
}
// src/rules/kernel/frame/commands-items.ts
var ge = globalThis;
function M(e) {
	return !e || e.max === void 0 || e.max === null || e.max === "" ? null : {
		value: e.value ?? null,
		max: e.max ?? null,
		spent: e.spent ?? null
	};
}
function _e(e) {
	return {
		id: e.id,
		name: e.name,
		type: e.type,
		equipped: "equipped" in e.system ? e.system.equipped : null,
		attuned: "attuned" in e.system ? e.system.attuned : null,
		attunement: e.system.attunement ?? null,
		uses: M(e.system.uses),
		activities: e.system.activities ? [...e.system.activities].map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			uses: M(e.uses)
		})) : []
	};
}
function ve(e) {
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
function ye(e) {
	return e.map((e) => ({
		formula: e.formula ?? null,
		total: e.total ?? null,
		dice: e.dice?.map((e) => ({
			faces: e.faces,
			results: e.results?.map((e) => e.result)
		})) ?? []
	}));
}
function be(e, t) {
	let n = (e, n) => t(e).items.get(n, { strict: !0 });
	return {
		equip: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.equipped": !!a }), {
				item: _e(o),
				actor: ve(e)
			};
		}, [r]),
		attune: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.attuned": !!a }), {
				item: _e(o),
				actor: ve(e)
			};
		}, [r]),
		useItem: (t, r, i = [], a = null) => {
			let o = [], s = ge.ui?.notifications, c = s?.error;
			return s && c && (s.error = function(e, ...t) {
				return o.push(String(e)), c.call(this, e, ...t);
			}), e(i, async () => {
				let e = n(t, r), i, s = null;
				if (a) {
					if (s = e.system.activities?.get(a), !s) throw Error(`Item has no activity: ${a}`);
					i = await s.use({}, { configure: !1 }, { create: !1 });
				} else i = await e.use({}, { configure: !1 }, { create: !1 });
				return {
					item: _e(e),
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
				})) : ge.foundry.utils.isEmpty(n.updates) || (await t.update(n.updates), i.push({
					id: t.id,
					name: t.name,
					updates: n.updates,
					rolls: ye(n.rolls ?? [])
				})));
			}
			return {
				period: r,
				items: i,
				actor: ve(e)
			};
		}, [n]),
		filterItems: (n, r) => e([], async () => {
			let e = t(n).sheet;
			if (!e?._filterChildren) throw Error(`人物 ${n} 没有官方人物表单实例`);
			return { ids: e._filterChildren("items", new Set(r)).map((e) => e.id) };
		}),
		splitStack: (r, i, a) => e([], async () => (await n(r, i).system.split(a), { actor: ve(t(r)) }), [r]),
		createScroll: (r, i, a) => e([], async () => {
			let e = t(r), o = await ge.CONFIG.Item.documentClass.createScrollFromSpell(n(r, i), {}, { dialog: !1 });
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
				actor: ve(e)
			};
		}, [r]),
		duplicateItem: (r, i, a) => e([], async () => ({
			created: (await n(r, i).clone({
				name: a,
				"flags.tavern-trpg.named": !0
			}, { save: !0 }))?.id ?? null,
			actor: ve(t(r))
		}), [r]),
		convertCurrency: (n) => e([], async () => {
			let e = t(n);
			return await ge.dnd5e.applications.CurrencyManager.convertCurrency(e), { currency: e.system.currency };
		}, [n])
	};
}
// src/rules/kernel/frame/author-classes.ts
var xe = [
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
], Se;
function Ce() {
	return Se ??= (async () => {
		let e = await (await fetch(new URL("modules/plutonium/js/Bundle.js", document.baseURI))).text(), t = Object.getPrototypeOf(async () => void 0).constructor, n = await new t(`${e}\n;return { ${xe.join(", ")} };`)();
		return n.Config._CONFIG_TEMP = {
			dataSources: { baseSiteUrl: new URL(".", document.baseURI).href },
			misc: { rulesVersion: "classic" }
		}, n.ConfigConsts.prePreInit({ implRegistryImportList: n.ImplementationRegistryImportList.get() }), n.Config._CONFIG = n.Config.api_getDefaults(), n.Config._CONFIG_PLAYER = n.Config._getDefaultPlayerConfig(), n.Vetools.prePreInit_preConfig(), n.VetoolsLinks.prePreInit_postConfig(), n.Vetools.prePreInit_postConfig(), n.UtilDamageTypes.init(), n.Dnd5eUtil.init(), n.Vetools.init(), n.SideDataInterfaces.init(), n;
	})();
}
var we = globalThis, Te;
function Ee() {
	return Te ??= (async () => {
		let e = (await we.game.modules.get("plutonium")?.api?.importer?.pGetImporter?.({ prop: "item" }))?.constructor?._DataConverter;
		if (!e?._getWeaponIdKey) throw Error("作者物品转换类不可用（Plutonium 物品导入器）");
		let t = we.Parser, n = (we.game?.settings?.get?.("dnd5e", "rulesVersion") === "modern" ? [
			t.SRC_XPHB,
			t.SRC_XDMG,
			t.SRC_PHB,
			t.SRC_DMG
		] : [
			t.SRC_PHB,
			t.SRC_DMG,
			t.SRC_XPHB,
			t.SRC_XDMG
		]).map((e) => String(e).toLowerCase()), r = we.Renderer.get().baseUrl, [i, a] = await Promise.all([we.DataUtil.loadJSON(`${r}data/items-base.json`), we.DataUtil.loadJSON(`${r}data/items.json`)]), o = [...i?.baseitem ?? [], ...a?.item ?? []].filter((e) => n.includes(String(e.source).toLowerCase())).sort((e, t) => n.indexOf(String(e.source).toLowerCase()) - n.indexOf(String(t.source).toLowerCase())), s = /* @__PURE__ */ new Map();
		for (let t of o) {
			let n = String(t.name).toLowerCase(), r = {
				propDroppable: "item",
				source: String(t.source),
				hash: we.UrlUtil.URL_TO_HASH_BUILDER[we.UrlUtil.PG_ITEMS](t)
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
var De = globalThis;
function Oe(e) {
	let t = e.system.spells;
	return t ? Object.fromEntries(Object.entries(t).map(([e, t]) => [e, {
		value: t.value ?? null,
		max: t.max ?? null,
		level: t.level ?? null,
		type: t.type ?? null
	}])) : null;
}
function ke(e) {
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
function Ae(e) {
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
function je(e) {
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
function Me(e) {
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
function Ne(e, t) {
	let n = null, r = () => n ?? De.game.combat, i = () => {
		let e = r();
		if (!e) throw Error("No active combat");
		return e;
	};
	return {
		combatStart: (t, r = []) => e(r, async () => {
			let e = await De.CONFIG.Combat.documentClass.create({
				name: "Kernel encounter",
				combatants: t.map((e) => ({ actorId: e }))
			});
			return await e.rollInitiative(e.combatants.map((e) => e.id), { dialog: !1 }), await e.startCombat(), n = e, je(e);
		}, t),
		combatNext: (t = []) => e(t, async () => {
			let e = i();
			return await e.nextTurn(), je(e);
		}),
		combatEnd: () => e([], async () => {
			let e = i();
			await e.endCombat();
			let t = je(e);
			return n = null, t;
		}),
		cast: (n, r, i, a = [], o = {}) => e(a, async () => {
			let e = t(n), a = e.items.get(r, { strict: !0 }), s = a.system.activities?.get(i);
			if (!s) throw Error(`Item has no activity: ${i}`);
			let c = await s.use(o, { configure: !1 }, { create: !1 });
			return {
				item: _e(a),
				activity: {
					id: s.id,
					name: s.name,
					type: s.type
				},
				slots: Oe(e),
				concentration: ke(e),
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
			return await e.toggleStatusEffect(r, { active: i }), Ae(e);
		}, [n]),
		concentrationCheck: (n, r, i = []) => e(i, async () => {
			let e = t(n);
			if (!e.concentration?.effects?.size) return {
				dc: null,
				skipped: "not concentrating",
				concentration: ke(e)
			};
			let i = e.getConcentrationDC(r), a = await e.rollConcentration({ target: i }, { configure: !1 }, { create: !1 }), o = a?.[0] ?? null, s = o ? o.total >= i : null;
			return s === !1 && await e.endConcentration(), {
				dc: i,
				success: s,
				rolls: (a ?? []).map(Me),
				concentration: ke(e)
			};
		}, [n]),
		concentration: (n) => e([], async () => ke(t(n)), [n])
	};
}
// src/rules/kernel/frame/plutonium-zh.ts
async function Pe(e, t, n = fetch) {
	try {
		let r = await n(new URL("fingerprints.json", t), { cache: "no-store" });
		if (r.status === 404) return null;
		if (!r.ok) throw Error(`读取中文构建指纹失败（${r.status}）`);
		let i = await r.json();
		if (i.original !== h(e)) throw Error("私人完整版已变化");
		let a = await n(new URL("Bundle.js", t), { cache: "no-store" });
		if (!a.ok) throw Error(`读取中文构建失败（${a.status}）`);
		let o = await a.text();
		if (i.localized !== h(o)) throw Error("中文构建文件与指纹不匹配");
		return o;
	} catch (e) {
		return console.warn("建卡使用私人完整版原文。可运行 npm run gen:plutonium-zh 重生成中文构建。", e), null;
	}
}
// src/rules/kernel/frame/plutonium-build.ts
var Fe = "13b1a03b99eab99f4b078e11075c7092c175a365d076d5319914f376c583e245", Ie = "608e0a5497354d1937c3d3e780f85a103c4ddffb846d4bb1cdcfb00bdffb0bf2", Le = [
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
	"UtilEntityItem",
	"UtilApplications",
	"InputUiUtil",
	"EquipmentApp",
	"ActorAbilityScoreIncrease",
	"UtilEntityBackgroundFeature"
], N = null, Re;
async function ze(e, t = !1) {
	if (!e.pathname.endsWith("/modules/plutonium/js/Bundle.js")) {
		await import(
			/* @vite-ignore */
			e.href
);
		return;
	}
	let n = await fetch(e);
	if (!n.ok) throw Error(`读取 Plutonium 失败：${n.status}`);
	let r = await n.text(), i = new URL(n.url || e.href), a = h(r);
	if (a !== Fe) {
		let e = new URL("../private/modules/plutonium/js/Bundle.js", location.href), n = t && i.href === e.href ? await Pe(r, new URL("../private/lang/zh/modules/plutonium/js/", location.href)) : null;
		if (i.href === e.href && a === Ie) {
			let { nativeBuilder: e } = await Be(n ?? r, i, "\nexport const nativeBuilder = { ActorCharactermancer, ComponentUiUtil, Charactermancer_Util, Charactermancer_Spell_Level, Charactermancer_AvailableEquipmentInfo };\n");
			Re = e;
		} else n === null ? await import(
			/* @vite-ignore */
			i.href
) : await Be(n, i);
	} else N = (await Be(r, e, `\nexport const buildAdapter = { ${Le.join(", ")} };\n`)).buildAdapter;
}
async function Be(e, t, n = "") {
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
var Ve = "tavern-trpg-assistant", He = "automaticTraitOrigins";
function Ue(e) {
	return e.flags?.[Ve]?.[He] ?? {};
}
function We(e) {
	let t = e.flags?.[Ve];
	t && He in t && (delete t[He], Object.keys(t).length || delete e.flags[Ve]);
}
var Ge = (e = []) => [...e].sort(), Ke = (e) => m({
	type: e.type,
	level: e.level ?? 0,
	restriction: e.classRestriction || null,
	name: e.name ?? "",
	hint: e.hint ?? "",
	mode: e.configuration?.mode ?? "default",
	grants: Ge(e.configuration?.grants),
	allowReplacements: !!e.configuration?.allowReplacements,
	choices: (e.configuration?.choices ?? []).map((e) => [e.count ?? 1, Ge(e.pool)])
});
async function qe(e) {
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
						input: m(t)
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
				signature: Ke(n)
			}) : s.delete(e);
		}
		return t;
	};
	try {
		let t = await e(), n = Object.fromEntries(Object.entries(t.system?.advancement ?? {}).flatMap(([e, t]) => {
			let n = s.get(e);
			return n && n.signature === Ke(t) ? [[e, n.origin]] : [];
		}));
		return We(t), Object.keys(n).length && (t.flags ??= {}, t.flags[Ve] ??= {}, t.flags[Ve][He] = n), t;
	} finally {
		n.getGenericAdvancements = i, r.getAdvancementsObject = a;
	}
}
// src/rules/kernel/frame/importer.ts
var Je = globalThis, Ye = {
	skillsChosenFvtt: [],
	languagesChosenFvtt: [],
	armorProficienciesChosenFvtt: [],
	weaponProficienciesChosenFvtt: [],
	toolProficienciesChosenFvtt: []
};
function Xe() {
	let e = Je.foundry?.documents?.collections?.CompendiumCollection;
	if (e?.prototype && !e.prototype.getDocuments.__seeded) for (let t of ["getDocuments", "getDocument"]) {
		let n = e.prototype[t], r = function(...e) {
			return ie(`pack:${this.collection}:${t}:${JSON.stringify(e)}`, () => n.apply(this, e));
		};
		r.__seeded = !0, e.prototype[t] = r;
	}
}
var Ze = Promise.resolve();
function P(e, t) {
	let n = Ze.then(() => Qe(e, t));
	return Ze = n.then(() => void 0, () => void 0), n;
}
async function Qe(e, t) {
	Xe();
	let n = Je.game.modules.get("plutonium")?.api;
	if (!n?.importer) throw Error("Plutonium importer is not available");
	let r = await n.importer.pGetImporter({ prop: e });
	if (!r) throw Error(`No Plutonium importer for ${e}`);
	let i = async () => {
		let i = structuredClone(t), a = new n.importer.ImportOpts({ isTemp: !0 }), o = (e === "class" && r.pImportEntryClass ? await r.pImportEntryClass(i, a) : await r.pImportEntry(i, a, structuredClone(Ye)))?.imported?.[0]?.document ?? null;
		if (!o) throw Error(`Plutonium import failed for ${t?.name ?? e}`);
		return o.toObject ? o.toObject() : o;
	};
	return k(se(e, t)), await i(), k(se(e, t)), qe(i);
}
async function $e(e) {
	return (await et(e)).map((e) => e.prop);
}
async function et(e) {
	let t = Je.game.modules.get("plutonium")?.api;
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
var tt = globalThis, nt = "trpgOffHidden000", rt = (e) => {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}, it = (e) => e.constructor?.typeName ?? e.type, at = (e) => JSON.parse(JSON.stringify(e ?? null, (e, t) => t instanceof Set ? [...t] : t));
function ot(e) {
	let t = e.system.details?.level ?? 1, n = [];
	for (let r of e.items) {
		let e = rt(r);
		if (e) for (let i of Object.values(r.advancement?.byId ?? {})) for (let a of i.levels ?? []) (a <= t || a === 0) && n.push({
			item: r,
			key: e,
			adv: i,
			type: it(i),
			level: a
		});
	}
	return n;
}
var st = () => tt.foundry.data.fields, ct = (e) => e instanceof st().ArrayField, lt = (e) => e instanceof st().TypedObjectField;
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
	let n = ft(e), r = [...ut(n.value, at(e.value)) ?? [], ...ut(n.configuration, at(e.configuration)) ?? []].map(([, e]) => e), i = typeof e.storagePath == "function" ? e.storagePath(t) : null, a = i ? at(tt.foundry.utils.getProperty(e, i)) : null, o = a && typeof a == "object" ? Object.values(a).filter((e) => typeof e == "string") : [];
	return [.../* @__PURE__ */ new Set([...r, ...o])];
}
function ht(e, t) {
	let n = [], r = (i, a) => {
		for (let [o, s] of Object.entries(i ?? {})) {
			let i = a ? `${a}.${o}` : o;
			s instanceof st().DocumentIdField && s.model?.documentName === "Item" && tt.foundry.utils.getProperty(e._source.system, i) === t ? n.push(`system.${i}`) : s.fields && r(s.fields, i);
		}
	};
	return r(e.system.schema?.fields, ""), n;
}
var gt = (e, t) => t.ref === e.key && t.advancement === e.adv.id && (t.level === void 0 || t.level === e.level), _t = (e) => e.advancement === void 0 && e.effect === void 0 && e.part !== void 0, vt = (e) => e.advancement === void 0 && e.effect === void 0 && e.part === void 0;
function yt(e, t, n) {
	let r = [];
	for (let i of n) {
		let n = [...e.items].find((e) => rt(e) === i.ref);
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
		if (_t(i)) {
			i.part.startsWith("system.") && n.system.schema?.getField?.(i.part.slice(7)) || r.push({
				off: i,
				reason: "这件条目的数据里没有这一项"
			});
			continue;
		}
		if (i.advancement === void 0) continue;
		let a = t.filter((e) => gt(e, i));
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
async function bt(e, t) {
	if (!t?.length) return {
		applied: !1,
		choices: {},
		problems: []
	};
	let n = ot(e), r = yt(e, n, t);
	if (r.length) return {
		applied: !1,
		choices: {},
		problems: r
	};
	let i = new Set(t.filter(vt).map((e) => e.ref)), a = (e) => i.has(e.key) ? [{ ref: e.key }] : t.filter((t) => gt(e, t)), o = (e) => new Set(a(e).flatMap((e) => e.part === void 0 ? [] : [e.part])), s = (e) => a(e).some((e) => e.part === void 0), c = new Set(n.filter((e) => a(e).length).map((e) => e.adv.constructor)), l = n.filter((e) => c.has(e.adv.constructor)), u = [];
	for (let e of [...l].reverse()) u.unshift({
		...e,
		data: at(await e.adv.reverse(e.level))
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
		let r = new Set((ut(t, at(e.adv.value)) ?? []).map(([, e]) => e)), i = o(e), a = (ut(t, at(n)) ?? []).filter(([, e]) => !r.has(e) && !i.has(e));
		if (!a.length) continue;
		let c = {};
		for (let [e, t] of a) (c[e] ??= []).push(t);
		await e.adv.apply(e.level, c);
	}
	for (let n of t.filter(_t)) [...e.items].find((e) => rt(e) === n.ref)?.updateSource({ [n.part]: null });
	for (let n of t) n.effect !== void 0 && [...e.items].find((e) => rt(e) === n.ref)?.effects.get(n.effect)?.updateSource({ disabled: !0 });
	let f = [...e.items].filter((e) => i.has(rt(e) ?? ""));
	for (let t of f) {
		for (let n of ht(e, t.id)) e.updateSource({ [n]: null });
		for (let e of t.effects) e.updateSource({ disabled: !0 });
	}
	return f.length && await e.createEmbeddedDocuments("ActiveEffect", [{
		_id: nt,
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
async function xt(e, t, n) {
	let r = await bt(e, t);
	if (r.problems.length) return {
		view: null,
		choices: {},
		problems: r.problems
	};
	let i = e.toObject();
	return await St(e, n), {
		view: i,
		choices: r.choices,
		problems: []
	};
}
async function St(e, t) {
	if (t) {
		t.actor && Object.keys(t.actor).length && await e.update(t.actor);
		for (let [r, i] of Object.entries(t.items ?? {})) {
			let t = n([...e.items], r);
			if (!t) throw Error(`状态差别指向的物品在重建结果里不存在：${r}`);
			await t.update(i);
		}
		for (let n of t.itemAdded ?? []) e.items.get(n._id) || await e.createEmbeddedDocuments("Item", [n], { keepId: !0 });
		for (let r of t.itemRemoved ?? []) {
			let t = n([...e.items], r);
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
var Ct = globalThis;
function wt(e) {
	return Object.fromEntries(Object.entries(e.abilities ?? {}).map(([e, t]) => [e, {
		value: t.value ?? null,
		mod: t.mod ?? null,
		save: t.save?.value ?? t.save ?? null,
		proficient: t.proficient ?? null
	}]));
}
function Tt(e) {
	return Object.fromEntries(Object.entries(e.skills ?? {}).map(([e, t]) => [e, {
		total: t.total ?? null,
		passive: t.passive ?? null,
		proficient: t.proficient ?? null
	}]));
}
function Et(e) {
	return e ? Array.isArray(e) ? e : typeof e[Symbol.iterator] == "function" ? [...e] : Object.values(e) : [];
}
function Dt(e) {
	return {
		id: e.id ?? e._id ?? null,
		name: e.name,
		type: e.type,
		activities: Et(e.system?.activities).map((e) => ({
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
function Ot(e) {
	let t = e.toObject ? e.toObject() : e, n = e.system ?? t.system ?? {}, r = e.items?.contents ?? e.items ?? t.items ?? [];
	return {
		name: e.name ?? t.name,
		type: e.type ?? t.type,
		ac: n.attributes?.ac?.value ?? null,
		hp: n.attributes?.hp ? {
			value: n.attributes.hp.value ?? null,
			max: n.attributes.hp.max ?? null
		} : null,
		abilities: wt(n),
		skills: Tt(n),
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
		items: [...r].map(Dt),
		validation: e.validationFailures ?? []
	};
}
async function kt(e) {
	let t = await P("monster", e);
	return {
		status: "complete",
		entity: {
			name: e.name,
			source: e.source
		},
		...Ot(t)
	};
}
function At(e) {
	return {
		importMonster: (t) => e([], async () => kt(t)),
		importMonsters: (t) => e([], async () => {
			let e = [];
			for (let n of t) try {
				e.push(await kt(n));
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
			let n = Ct.CONFIG.Actor.documentClass, r = t.id ? await n.create({
				...e,
				_id: t.id,
				name: t.name
			}, { keepId: !0 }) : await n.create({
				...e,
				name: t.name
			}), i = r.toObject();
			return await St(r, t.state), {
				status: "complete",
				id: r.id,
				...Ot(r),
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
			let n = await Ct.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...Ot(n)
			};
		}),
		importMonsterActor: (t) => e([], async () => {
			let e = await P("monster", t);
			delete e._id;
			for (let t of e.items ?? []) delete t._id;
			for (let t of e.effects ?? []) delete t._id;
			let n = await Ct.CONFIG.Actor.documentClass.create(e);
			return {
				status: "complete",
				id: n.id,
				...Ot(n)
			};
		})
	};
}
// src/rules/kernel/frame/system-text.ts
var jt = globalThis, Mt = null, Nt = /* @__PURE__ */ new Map(), Pt = (e) => e.trim().toLowerCase();
function Ft() {
	let e = jt.game.i18n;
	if (Mt === e) return;
	Mt = e, Nt.clear();
	let t = (e, n = []) => {
		for (let [r, i] of Object.entries(e ?? {})) {
			let e = [...n, r];
			if (typeof i == "string") {
				let t = Pt(i);
				Nt.set(t, [...Nt.get(t) ?? [], e.join(".")]);
			} else i && typeof i == "object" && t(i, e);
		}
	};
	t(e.translations), t(e._fallback);
}
function F(e, t) {
	Ft();
	let n = jt.game.i18n, i = (t ? [t] : [...new Set(Nt.get(Pt(e)) ?? [])]).filter((e) => n.has(e)), a = new Set(i.map((e) => n.localize(e)));
	if (i.length && a.size === 1) return {
		$t: "system",
		key: i[0],
		text: e
	};
	let o = e.split("、");
	return o.length > 1 ? r(o.map((e) => F(e)), "、") : s(e, null);
}
function It(e) {
	return {
		$t: "system",
		key: `TRPGAssistant.UpstreamText.${h(Pt(e)).slice(0, 24)}`,
		text: e
	};
}
function Lt(e) {
	let t = jt.game.i18n;
	return t.has(e) ? {
		$t: "system",
		key: e,
		text: t.localize(e)
	} : null;
}
function Rt(e, t) {
	return e.reduceRight((e, n) => ({
		$t: "system",
		key: n,
		text: t,
		...e ? { fallback: e } : {}
	}), null);
}
var zt = "TRPGAssistant.UpstreamSource.", Bt = null, Vt = [];
function Ht() {
	let e = jt.game.i18n;
	if (Bt === e) return Vt;
	Bt = e;
	let t = jt.foundry?.utils?.flattenObject?.(e.translations ?? {}) ?? {};
	return Vt = Object.entries(t).filter(([e, t]) => e.startsWith(zt) && typeof t == "string" && t.includes("{}")).map(([e, t]) => ({
		key: `TRPGAssistant.UpstreamText.${e.slice(29)}`,
		pattern: RegExp(`^${String(t).trim().split("{}").map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(.+?)")}$`, "i")
	})), Vt;
}
function Ut(e) {
	let t = e.trim(), n = It(t);
	if (jt.game.i18n.has(n.key)) return n;
	for (let e of Ht()) {
		let n = e.pattern.exec(t);
		if (n && jt.game.i18n.has(e.key)) return {
			$t: "system",
			key: e.key,
			text: t,
			args: n.slice(1).map((e) => d(e))
		};
	}
	return F(t);
}
var I = (e) => typeof e == "string" && e.trim() ? Ut(e) : null, Wt = globalThis, Gt = (e) => e ? Wt.game.i18n.localize(e) : null, Kt = (e) => {
	let t = [...new Set(e.filter((e) => !!e))];
	return t.length ? t.join("、") : null;
};
function qt(e) {
	let t = Wt.CONFIG?.DND5E?.[e] ?? {}, n = (e) => Gt(typeof e == "string" ? e : e?.label) ?? "";
	return Object.fromEntries(Object.entries(t).map(([e, t]) => [e, n(t) || e]));
}
function Jt(e) {
	return Gt(e ? Wt.CONFIG?.DND5E?.traits?.[e]?.labels?.title : void 0);
}
function Yt(e) {
	return e && e !== "default" ? Gt(Wt.CONFIG?.DND5E?.traitModes?.[e]?.label) : null;
}
function Xt(e) {
	let t = Wt.dnd5e?.documents?.Trait;
	if (!e?.length || !t) return null;
	let n = e.join(".");
	return Object.keys(Wt.CONFIG?.DND5E?.traits ?? {}).find((e) => t.actorKeyPath(e) === n) ?? null;
}
function Zt(e) {
	let t = Xt(e);
	if (t) return Jt(t);
	let n = e?.at(-1), r = Xt(e?.slice(0, -1));
	return r && n && Wt.CONFIG.DND5E.traits[r][n] === !0 ? Yt(n) : null;
}
function Qt(e) {
	return Kt([...new Set([...e].map((e) => String(e).split(":")[0]).filter(Boolean))].map(Jt));
}
function $t(e, t = [], n = []) {
	let r = e._subComps?.[0]?._getAllPossibleProps?.() ?? [];
	return Zt(e._propPathActorExistingProficiencies) || Yt(e._prop) || Kt(r.map((n) => Zt(t.find((t) => t !== e && t._prop === n)?._propPathActorExistingProficiencies))) || Qt(n);
}
function en(e) {
	let t = e.configuration ?? {};
	return Yt(t.mode) || (t.type ? Jt(t.type) : Qt([...t.grants ?? [], ...[...t.choices ?? []].flatMap((e) => [...e?.pool ?? []])]));
}
// src/rules/kernel/frame/asi.ts
var tn = globalThis;
function nn(e) {
	let t = e.configuration ?? {}, n = Number(t.points) || 0;
	return {
		points: n,
		cap: Number(t.cap) || n,
		fixed: Object.fromEntries(Object.entries(t.fixed ?? {}).filter(([, e]) => e)),
		locked: /* @__PURE__ */ new Set([...t.locked ?? []])
	};
}
function rn(e, t) {
	let n = nn(e), r = {}, i = 0;
	for (let [e, a] of Object.entries(t ?? {})) if (a) {
		if (!Number.isInteger(a) || a < 0 || a > n.cap || n.locked.has(e) || !(e in (tn.CONFIG?.DND5E?.abilities ?? {}))) return null;
		r[e] = a, i += a;
	}
	return i <= n.points ? r : null;
}
function an(e, t) {
	let n = nn(e);
	if (!n.points) return null;
	let r = rn(e, t?.chosen) ?? {}, i = n.points - Object.values(r).reduce((e, t) => e + t, 0), a = qt("abilities");
	return {
		kind: "asi",
		points: n.points,
		cap: n.cap,
		left: i,
		rows: Object.keys(a).map((e) => {
			let t = r[e] ?? 0;
			return {
				key: e,
				label: F(a[e]),
				fixed: n.fixed[e] ?? 0,
				chosen: t,
				canAdd: !n.locked.has(e) && i > 0 && t < n.cap,
				canRemove: t > 0
			};
		})
	};
}
function on(e, t) {
	if (t.assignments && !t.chosen) return {
		type: "asi",
		assignments: t.assignments
	};
	let n = rn(e, t.chosen);
	if (!n) return null;
	let r = { ...nn(e).fixed };
	for (let [e, t] of Object.entries(n)) r[e] = (r[e] ?? 0) + t;
	return {
		type: "asi",
		assignments: r
	};
}
// src/rules/kernel/frame/actor-types.ts
var sn = globalThis, cn = "character";
async function ln(e, t) {
	let n = Object.keys(sn.game.system?.documentTypes?.Actor ?? {}), r = (e) => {
		let t = sn.CONFIG?.Actor?.typeLabels?.[e] ?? `TYPES.Actor.${e}`;
		return sn.game.i18n?.localize?.(t) ?? e;
	}, i = await et([e]), a = /* @__PURE__ */ new Set();
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
		build: cn
	};
}
// src/rules/kernel/frame/commands-restore.ts
async function un(e, t, n = []) {
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
var dn = globalThis;
async function fn(e) {
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
async function pn(e) {
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
		let e = dn.game.packs.get("dnd5e.subclasses");
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
		for (let n of Object.keys(e.actor?.system?.abilities ?? t.actor?.system?.abilities ?? dn.CONFIG?.DND5E?.abilities ?? {})) {
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
var L = globalThis, mn = (e) => L.DataUtil.proxy.getUid("item", e), hn = (e, t, n) => c(e, {
	propDroppable: "item",
	source: t,
	hash: n
}), gn = (e) => {
	let [t, n] = e.split("|");
	return L.UrlUtil.URL_TO_HASH_BUILDER[L.UrlUtil.PG_ITEMS]({
		name: t,
		source: n
	});
}, _n = (e) => {
	let t = L.UrlUtil.URL_TO_HASH_BUILDER[L.UrlUtil.PG_ITEMS](e);
	return {
		uid: mn(e),
		name: hn(e.name, e.source, t),
		source: e.source,
		hash: t
	};
}, vn = (e) => L.Renderer.stripTags(e).toTitleCase(), yn = [
	"pCacheAndGetAllSite",
	"pCacheAndGetAllPrerelease",
	"pCacheAndGetAllBrew"
], bn = null, xn = async () => bn ??= (await Promise.all(yn.map(async (e) => await L.DataLoader[e]("item") ?? []))).flat(), Sn = (e) => {
	let t = N?.EQUIPMENT_TYPE_EXPANDERS;
	return t && Object.hasOwn(t, e) ? t[e] : null;
};
function Cn(e) {
	let t = `TRPGAssistant.EquipmentType.${e}`, n = L.game.i18n.localize(t);
	return n === t ? s(String(Sn(e)?.name ?? e), null) : F(n);
}
async function wn(e) {
	let t = Sn(e);
	if (!t) return [];
	let n = (await xn()).filter((e) => N.UtilEntityItem.isStartingEquipmentItem(e));
	return t._getAvailableItems({ itemDatas: n }).sort((e, t) => String(e.name).localeCompare(String(t.name))).map(_n);
}
var Tn = (e) => {
	let t = e?.startingEquipment;
	return Array.isArray(t) ? t : Array.isArray(t?.defaultData) ? t.defaultData : [];
};
function En(e) {
	let t = e?.startingEquipment?.goldAlternative;
	if (!t) return null;
	let n = /{@dice ([^|]+)/.exec(t);
	return n ? n[1].replace(/×/g, "*") : Number.isNaN(Number(`${t}`.trim())) ? null : `${t}`.trim();
}
async function Dn(e) {
	let n = async (e) => {
		let [t, n] = e.split("|"), r = await L.DataLoader.pCacheAndGetHash(L.UrlUtil.PG_ITEMS, gn(e));
		return {
			uid: e,
			name: hn(r?.name ?? t, r?.source ?? n, gn(e)),
			source: r?.source ?? n,
			hash: gn(e),
			found: !!r
		};
	};
	if (typeof e == "string") return {
		raw: e,
		kind: "item",
		quantity: 1,
		...await n(e)
	};
	if (e.item) return {
		raw: e,
		kind: "item",
		quantity: e.quantity || 1,
		...await n(e.item),
		...e.displayName ? { displayName: t(vn(e.displayName)) } : {},
		...e.containsValue ? { cp: e.containsValue } : {}
	};
	let r = e.equipmentTypes ?? (e.equipmentType ? [e.equipmentType] : []);
	if (r.length) {
		if (!r.every(Sn)) return { unsupported: r.filter((e) => !Sn(e)).join("、") };
		let t = /* @__PURE__ */ new Set(), n = (await Promise.all(r.map(wn))).flat().filter((e) => !t.has(e.uid) && !!t.add(e.uid));
		return n.length ? {
			raw: e,
			kind: "category",
			quantity: e.quantity || 1,
			types: r,
			typeNames: r.map(Cn),
			candidates: n
		} : null;
	}
	return e.special ? {
		raw: e,
		kind: "special",
		quantity: e.quantity || 1,
		text: t(vn(e.special)),
		...e.containsValue ? { cp: e.containsValue } : {}
	} : e.value ? {
		raw: e,
		kind: "value",
		quantity: 1,
		cp: e.value
	} : { unsupported: JSON.stringify(e).slice(0, 120) };
}
async function On(e) {
	let n = [], r = [], a = Tn(e.entry);
	for (let o = 0; o < a.length; o++) {
		let s = [];
		for (let [n, c] of Object.entries(a[o])) {
			let a = await Promise.all(c.map(Dn));
			for (let n of a) n && "unsupported" in n && r.push(i("{0}：{1}", t(String(e.entry.name)), d(n.unsupported)));
			let o = a.flatMap((e, t) => e && !("unsupported" in e) ? [{
				...e,
				index: t
			}] : []);
			o.length && s.push({
				key: n,
				entries: o
			});
		}
		s.length && n.push({
			index: o,
			choices: s
		});
	}
	let o = En(e.entry);
	return {
		refKey: e.refKey,
		prop: e.prop,
		name: t(String(e.entry.name)),
		source: e.entry.source,
		groups: n,
		unsupported: r,
		goldExpression: o,
		goldCoin: o ? "gp" : null
	};
}
function kn(e, t, n = /* @__PURE__ */ new Set()) {
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
	return Tn(e.entry).forEach((e, r) => {
		let o = Object.keys(e), s = t?.choice?.[String(r)] ?? (o.length === 1 ? o[0] : void 0);
		s !== void 0 && Array.isArray(e[s]) && e[s].forEach((e, o) => {
			if (typeof e == "string") return a(e, void 0, 1);
			if (e.item) return e.containsValue && !n.has(e.item) && (i += e.containsValue), a(e.item, void 0, e.quantity || 1, e.displayName ? vn(e.displayName) : void 0);
			if (e.equipmentType || e.equipmentTypes) for (let n = 0; n < (e.quantity || 1); n++) {
				let e = t?.pick?.[`${r}.${s}.${o}.${n}`];
				e && a(e, void 0, 1);
			}
			else {
				if (e.special) return e.containsValue && (i += e.containsValue), a(void 0, vn(e.special), e.quantity || 1);
				e.value && (i += e.value);
			}
		});
	}), {
		granted: r,
		cp: i
	};
}
function An(e) {
	let t = L.CONFIG.DND5E.currencies, n = t.cp?.conversion ?? 100, r = Object.entries(t).filter(([, e]) => e.conversion != null && e.conversion > 0).map(([e, t]) => ({
		coin: e,
		mult: t.conversion / n
	})).sort((e, t) => t.mult - e.mult), i = L.CurrencyUtil.doSimplifyCoins({ cp: e }, { currencyConversionTable: r });
	return Object.fromEntries(Object.keys(t).map((e) => [e, i[e] || 0]));
}
async function jn(e, t, n = {}) {
	let r = [], i = [], a = [], o = 0;
	for (let s of e) {
		let { granted: e, cp: c } = kn(s, t[s.refKey], new Set(n[s.refKey] ?? []));
		o += c;
		for (let t of e) {
			let e;
			if (t.special) e = {
				name: t.special,
				source: t.source,
				page: t.page,
				type: L.Parser.ITM_TYP__OTHER,
				rarity: "unknown"
			};
			else if (e = await L.DataLoader.pCacheAndGetHash(L.UrlUtil.PG_ITEMS, gn(t.uid)), !e) {
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
		currency: o > 0 ? An(o) : null,
		skipped: a
	};
}
async function Mn(e, n, r = {}) {
	let i = [], a = 0;
	for (let o of e) {
		let { granted: e, cp: s } = kn(o, n[o.refKey], new Set(r[o.refKey] ?? []));
		a += s;
		let c = [];
		for (let n of e) {
			if (n.special) {
				c.push({
					name: t(n.special),
					special: !0,
					quantity: n.quantity
				});
				continue;
			}
			let e = await L.DataLoader.pCacheAndGetHash(L.UrlUtil.PG_ITEMS, gn(n.uid)), r = e ? L.UrlUtil.URL_TO_HASH_BUILDER[L.UrlUtil.PG_ITEMS](e) : void 0;
			c.push(e ? {
				uid: n.uid,
				name: hn(e.name, e.source, r),
				source: e.source,
				hash: r,
				quantity: n.quantity,
				...n.displayName ? { displayName: t(n.displayName) } : {}
			} : {
				uid: n.uid,
				name: d(n.uid),
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
		currency: a > 0 ? An(a) : null
	};
}
function Nn(e) {
	return {
		startingEquipment: (t) => e([], async () => ({
			sections: await Promise.all(t.map(On)),
			coins: [...L.Parser?.COIN_ABVS ?? []]
		})),
		startingPreview: (t, n, r) => e([], async () => Mn(t, n, r))
	};
}
// src/rules/kernel/frame/author-ids.ts
var Pn = globalThis, Fn = /* @__PURE__ */ new Set([
	"skills",
	"tool",
	"saves"
]);
function In(e, t) {
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
async function Ln(e) {
	let t = N, n = Pn.dnd5e?.documents?.Trait;
	if (!t || !n) return {};
	let r = t.Charactermancer_OtherProficiencySelect, i = await t.Charactermancer_AvailableProficiencyManager.pGetInstance(), a = new Pn.CONFIG.Actor.documentClass({
		name: "Author ids",
		type: cn
	}), o = {};
	for (let t of new Set(e)) try {
		let e = t.split(":")[0], s = n.changeKeyPath(t);
		if (!s) continue;
		let c = t.split(":").pop(), l = a.clone(Pn.foundry.utils.expandObject({ [s]: Fn.has(e) ? 1 : [c] })), u = r.getExisting(r.getExistingFvttFromActor(l), { availableProficiencyManager: i }), d = Object.entries(u ?? {}).flatMap(([e, t]) => Object.entries(t ?? {}).filter(([e, t]) => e !== "other" && t).map(([t]) => ({
			prop: e,
			name: t
		}))).flatMap((e) => {
			let t = r._getRenderedStatic({
				...e,
				availableProficiencyManager: i
			}), n = typeof t == "string" ? In(t, Pn.UrlUtil.PAGE_TO_PROPS ?? {}) : null;
			return n ? [n] : [];
		});
		d.length && (o[t] = d);
	} catch (e) {
		console.warn("[trpg-assistant] 作者编号换不出", t, e);
	}
	return o;
}
// src/rules/kernel/frame/proficiency-text.ts
var Rn = globalThis;
function zn(e, t, n) {
	if (Rn.Renderer.generic.getMappedAnyProficiency({
		keyAny: n.name,
		countRaw: 1
	})) return a(n.name, 1);
	let r = e.Charactermancer_OtherProficiencySelect._getRenderedStatic({
		...n,
		availableProficiencyManager: t
	}), i = typeof r == "string" ? In(r, Rn.UrlUtil.PAGE_TO_PROPS) : null;
	return i ? c(n.name, i, !0) : l(n.name, [n.name], F(n.name));
}
function Bn(e, t, n) {
	let r = n.map((n) => zn(e, t, n));
	return r.map((e, t) => e.$t === "value" ? {
		...e,
		group: n.filter((e, i) => e.prop === n[t].prop && r[i].$t === "value").map((e) => e.name)
	} : e);
}
// src/rules/kernel/frame/trait-plans.ts
var Vn = globalThis;
function Hn(e, t, n, r, i) {
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
var Un = (e) => ({
	propDroppable: "item",
	source: e.source,
	hash: Vn.UrlUtil.URL_TO_HASH_BUILDER[Vn.UrlUtil.PG_ITEMS](e)
});
function Wn(e, t, n, r, i) {
	return (n.choose ?? []).map((n, a) => {
		if (n.fromFilter) {
			let { propState: e } = t._getPropsChooseFromFilter({
				ixChoose: a,
				ixCount: 0
			}), r = t._modalFilterItemsFvtt.getEntitiesMatchingFilterExpression({ filterExpression: n.fromFilter });
			return {
				count: n.count,
				options: r.filter((e) => !i || i.has(`${e.name}|${e.source}`.toLowerCase())).map((r) => Hn(t, e, {
					prop: n.prop,
					name: Vn.DataUtil.generic.getUid(r)
				}, r.name, c(r.name, Un(r), !0)))
			};
		}
		let { propState: o } = t._getPropsChooseFrom({ ixChoose: a }), s = t._getChooseFromGroupMeta(n), l = e.ComponentUiUtil.getMetaWrpMultipleChoice(t, o, {
			count: n.count,
			...s?.valueGroups ? { valueGroups: s.valueGroups } : { values: n.from },
			fnDisplay: () => ""
		});
		r.push(l.cleanup);
		let u = s?.valueGroupsFlat ?? n.from, d = Bn(e, t._availableProficiencyManager, u);
		return {
			count: n.count,
			hints: s?.valueGroups?.map((e) => e.text).filter(Boolean),
			options: l.rowMetas.map((e, n) => Hn(t, e.propIsActive, !0, u[n]?.name ?? String(n + 1), d[n]))
		};
	});
}
function Gn(e, t, n, r) {
	t._stgGroup = e.veE(document.createElement("div"));
	let i = [];
	return t._render_renderPtChooseAnyProficient = ({ profSet: e, propProfSet: n, propIxProps: r, fnGetValues: a }) => {
		let o = t._getProps(n, 0)[r], s = a().map((e) => Hn(t, o, e, e));
		i.push({
			count: Number(e[n] || 1),
			options: s
		});
	}, t._hk_ixSet_renderPts(n), r.push(() => t._lastMeta.cleanup()), i;
}
function Kn(e, t) {
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
async function qn(e, t, n, r) {
	let i = {}, a = await n._subComps[0].pGetFormData();
	await e.Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(t, i, { data: { [n._propFormDatas]: [a] } });
	let o = Vn.dnd5e.documents.Trait, s = Object.keys(Vn.CONFIG.DND5E.traits).filter((e) => Vn.foundry.utils.hasProperty(i, o.actorKeyPath(e))), c = t.clone(i), l = /* @__PURE__ */ new Set(), u = [];
	for (let e of s) {
		let n = o.actorKeyPath(e), a = Vn.foundry.utils.getProperty(i, n)?.custom;
		a && u.push({
			label: String(a),
			text: F(String(a))
		});
		let s = await o.actorValues(t, e), d = await o.actorValues(c, e);
		for (let [e, t] of Object.entries(d)) t === r && s[e] !== r && l.add(e);
	}
	return {
		keys: l,
		notes: u
	};
}
async function Jn(e, t, n, r, i, a, o) {
	let s = o ? 2 : 1, u = await qn(e, t, n, s), d = [], f = [...u.notes], p = /* @__PURE__ */ new Map();
	for (let i of r) {
		let r = /* @__PURE__ */ new Set();
		for (let a of i.options) {
			let o = a.text ?? l(a.label, i.options.map((e) => e.label), F(a.label));
			a.select();
			try {
				let i = [...(await qn(e, t, n, s)).keys].filter((e) => !u.keys.has(e));
				if (i.length === 1) {
					let e = i[0];
					r.add(e);
					let t = p.get(e);
					p.set(e, t?.$t === "name" && o.$t === "name" ? c(a.label, [...t.ids, ...o.ids], !0) : o);
				} else a.label && f.push({
					label: a.label,
					text: o
				});
			} finally {
				a.clear();
			}
		}
		r.size >= i.count || o && !i.options.length ? d.push({
			count: i.count,
			pool: [...r].sort()
		}) : i.options.length && f.push(...i.options.filter((e) => e.label).map((e) => ({
			label: e.label,
			text: e.text ?? l(e.label, i.options.map((e) => e.label), F(e.label))
		})));
	}
	return {
		index: i,
		extended: a,
		mode: o ? u.keys.size ? "forcedExpertise" : "expertise" : "default",
		grants: [...u.keys].sort(),
		choices: d,
		names: p,
		hints: [...new Set(r.flatMap((e) => e.hints ?? []))],
		withheld: f
	};
}
async function Yn(e, t, n, r, i) {
	let a = n._subComps[0];
	if (a instanceof e.Charactermancer_ImmResVulnSelect) {
		let r = Kn(e, a);
		return r ? [await Jn(e, t, n, r, 0, !1, !1)] : [];
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
			let d = o ? Gn(e, a, r, l) : Wn(e, a, r, l, i);
			c.push(await Jn(e, s, n, d, t, u, o));
		} finally {
			for (let e of l) e();
		}
	}
	return c;
}
// src/rules/kernel/frame/author-text.ts
var Xn = globalThis, Zn = ["Renderer"], Qn = 8, $n = null;
function er() {
	let e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new WeakSet(), n = (r, i) => {
		if (typeof r == "string") {
			let t = e.get(r) ?? [];
			t.push(i), e.set(r, t);
		} else if (!(!r || typeof r != "object" && typeof r != "function" || t.has(r) || i.length > Qn)) {
			t.add(r);
			for (let [e, t] of Object.entries(Object.getOwnPropertyDescriptors(r))) "value" in t && e !== "prototype" && n(t.value, [...i, e]);
		}
	};
	for (let e of Zn) n(Xn[e], [e]);
	return e;
}
function tr(e) {
	if (!e) return null;
	$n ??= er();
	let t = $n.get(e);
	return t?.length === 1 ? t[0] : null;
}
// src/rules/kernel/frame/build-traits.ts
var nr = globalThis, rr = "P6Tr", ir = (e) => typeof e == "string" && /^P6Tr[0-9a-f]{12}$/.test(e), ar = (...e) => rr + m(e).slice(0, 12);
function or(e, t) {
	return ie(`build-traits:check:${e?._id}`, () => sr(e, t));
}
async function sr(e, t) {
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
var cr = (e) => e.type === "Trait" && !e.configuration?.grants?.length && !e.configuration?.grants?.size && !e.configuration?.choices?.length;
async function lr(e, t, n) {
	let r = nr.dnd5e.documents.Trait, i = Object.values(e.system?.advancement ?? {}).filter((e) => e.type === "Trait" && !cr(e) && (e.level ?? 0) === t && (!e.classRestriction || e.classRestriction === (n ? "secondary" : "primary")));
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
function ur(e, t) {
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
async function dr(e, t, n, r, i) {
	let a = e.clone(), o = new nr.CONFIG.Item.documentClass({
		...t,
		system: {
			...t.system,
			advancement: n
		}
	}, { parent: a });
	for (let e of o.advancement.byType.Trait ?? []) {
		if (e.configuration.mode !== "default" || e.level !== i) continue;
		let t = r.previous?.find((t) => t.id === e.id)?.data, n = r.picks?.find((t) => t.id === e.id)?.value, a = await sr(e, t ?? n);
		a?.chosen.length && await e.apply(i, a);
	}
	return a;
}
var fr = (e) => s(e, tr(e)), pr = (e, t, n = []) => {
	let r = $t(e, t, n);
	return r ? F(r) : fr(String(e._title || e._subComps[0]?.modalTitle || e._prop));
}, mr = (e) => [...new Map(e.map((e) => [JSON.stringify(e), e])).values()];
function hr(e, t, n, r, i = {}) {
	return ie(`build-traits:fill:${n}:${r}`, () => gr(e, t, n, r, i));
}
async function gr(e, t, n, a, o) {
	let { replay: s, picks: c, plans: l, actor: u, scope: d, expertise: f } = o;
	if (!t.entry) return [];
	let p = N;
	if (!p) return [i("当前 Plutonium 版本缺少已验证的建卡接线")];
	let h = +(t.prop === "class"), g = t.prop === "class" ? p.Charactermancer_Class_Util.getStandardProficiencies(a ? t.entry.multiclassing?.proficienciesGained ?? {} : {
		proficiency: t.entry.proficiency,
		...t.entry.startingProficiencies
	}) : structuredClone(t.entry), _ = new nr.CONFIG.Actor.documentClass({
		name: "Trait preview",
		type: cn
	}), v = [{ entity: g }], y = await p.Charactermancer_AvailableProficiencyManager.pGetInstance(), b = new p.Charactermancer_FeatureOptionsSelect({
		actor: _,
		optionsSet: v,
		level: h,
		modalFilterSpells: {},
		availableProficiencyManager: y
	}), x = b._subCompManagers.filter((e) => e instanceof p.CharactermancerFeatureSubCompManagerProficiencyOtherBase), ee = await lr(e, h, a), te = Ue(t.data ?? e), ne = /* @__PURE__ */ new Set(), S = [], C = {};
	try {
		for (let y of x) try {
			if (await y._pInitSubComp({
				ix: 0,
				selectedLinkedEntityInfos: v
			}), !y._subComps[0]) continue;
			let b = u && y._subComps[0] instanceof p.Charactermancer_ExpertiseSelect, re = b ? await dr(u, e, {
				...Object.fromEntries(Object.entries(e.system?.advancement ?? {}).filter(([e]) => !ne.has(e))),
				...C
			}, o, h) : u, w = await Yn(p, _, y, re, d);
			if (!w.length) {
				S.push(pr(y, x));
				continue;
			}
			let T = w.map(({ index: e }) => ar(n, y._prop, h, a, "author-plan", e)), ie = s ?? c?.map((e) => e.id), E = T.findIndex((e) => ie?.includes(e)), D = E < 0 ? 0 : E, O = w[D];
			if (O.extended && s && E < 0) continue;
			let ae = w.map((e, t) => ({
				id: T[t],
				label: e.choices.length ? r(e.choices.map((e) => i(`{0} ×${e.count}`, Qt(e.pool) ? F(Qt(e.pool)) : pr(y, x))), " + ") : Qt(e.grants) ? F(Qt(e.grants)) : pr(y, x)
			})), oe = [...new Map(O.withheld.map((e) => [e.label, e])).values()].sort((e, t) => e.label.localeCompare(t.label));
			oe.length && S.push(i("{0}（暂时无法加到人物卡：{1}）", pr(y, x), r(oe.map((e) => e.text ?? fr(e.label)), "、")));
			let k = m(g[y._prop] || g.entryData?.[y._prop]), se = ee.filter((e) => e.mode === O.mode), A = se.filter(({ id: e }) => te[e]?.field === y._prop && te[e]?.input === k), ce = new Set(A.flatMap((e) => e.grants)), le = A.flatMap((e) => e.slots), ue = ce.size === O.grants.length && O.grants.every((e) => ce.has(e)) && le.length === O.choices.length && ur(O.choices, le)?.length === 0, de = ar(n, y._prop, h, a, "origin"), j = le.length > 0 && !ue && !O.withheld.length && (!s || s.includes(O.extended ? T[D] : de)), fe = j ? se.filter((e) => !A.includes(e)) : se, pe = new Set(fe.flatMap((e) => e.grants)), me = fe.flatMap((e) => e.slots), he = O.grants.filter((e) => !pe.has(e)), ge = j ? O.choices : ur(O.choices, me);
			if (j && O.choices.some((e) => me.some((t) => e.pool.some((e) => t.pool.has(e))))) {
				S.push(i("{0}（与资料附带的进阶重叠，已保留原进阶）", pr(y, x)));
				continue;
			}
			if (!ge) {
				S.push(pr(y, x));
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
			let M = O.extended ? T[D] : j ? de : ar(n, y._prop, h, a);
			if (l?.set(M, {
				choices: ae.length > 1 ? ae : [],
				names: O.names
			}), C[M] = {
				_id: M,
				type: "Trait",
				level: h,
				...t.prop === "class" ? { classRestriction: a ? "secondary" : "primary" } : {},
				...j && O.hints.length ? { hint: O.hints.join("\n") } : {},
				configuration: {
					mode: O.mode,
					grants: he,
					choices: ge,
					allowReplacements: !1
				},
				value: {}
			}, b && f) {
				let t = new nr.CONFIG.Item.documentClass({
					...e,
					system: {
						...e.system,
						advancement: { [M]: C[M] }
					}
				}, { parent: re });
				f.set(M, t.advancement.byId[M]);
			}
		} catch (e) {
			console.warn("[trpg-assistant] 建卡进阶暂无法处理", n, y._prop, e), S.push(pr(y, x));
		}
	} finally {
		b.unregisterSourceTracking();
	}
	if (e.system) {
		let t = Object.fromEntries(Object.entries(e.system.advancement ?? {}).filter(([e, t]) => !ne.has(e) && !cr(t)));
		e.system.advancement = {
			...t,
			...C
		};
	}
	return mr(S);
}
// src/rules/kernel/frame/commands-level.ts
var R = globalThis;
function _r() {
	let e = R.dnd5e?.applications?.advancement?.AdvancementManager;
	if (!e) throw Error("dnd5e AdvancementManager is not available");
	return e;
}
function vr(e, t, n, r = {}) {
	return _r().forLevelChange(e, t, n, r);
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
function yr(e) {
	let t = e?.toObject ? e.toObject() : structuredClone(e);
	for (let e of [
		"_id",
		"_key",
		"folder",
		"sort",
		"ownership",
		"_stats"
	]) delete t[e];
	return t.system && "container" in t.system && (t.system.container = null), We(t), t;
}
function br(e) {
	let t = e?.toObject ? e.toObject() : structuredClone(e);
	return t.flags ??= {}, t.flags.plutonium ??= {}, t.flags.plutonium.isStandardDragDrop = !0, t;
}
function xr(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
function Sr(e) {
	return JSON.parse(JSON.stringify(e, (e, t) => t instanceof Set ? [...t] : t));
}
async function Cr(e, t, { strict: n = !1, picks: r, blank: i = !1, expertise: a } = {}) {
	if (!e.steps.length) return { finished: !0 };
	for (let o of e.steps) {
		if (o.automatic || !o.flow) continue;
		let e = o.flow.advancement, s = t?.find((t) => t.id === e.id && t.level === o.flow.level), c = r?.find((t) => t.id === e.id && (t.level ?? null) === (o.flow.level ?? null));
		if (ir(e.id)) {
			if (s?.error || n && !s) return {
				finished: !1,
				step: {
					...wr(o),
					error: s?.error
				}
			};
			let t = await or(a?.get(e.id) ?? e, s?.data ?? c?.value);
			if (!t) return {
				finished: !1,
				step: {
					...wr(o),
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
					...wr(o),
					error: s.error
				}
			};
			o.type = "restore", o.flow.retainedData = s.data, o.automatic = !0;
			continue;
		}
		if (await o.flow.getAutomaticApplicationValue() !== !1) continue;
		if (c) {
			let t = c.value?.type === "asi" ? on(e, c.value) : c.value;
			if (!t) return {
				finished: !1,
				step: {
					...wr(o),
					error: "属性提升的选择不合规"
				}
			};
			o.flow.getAutomaticApplicationValue = async () => t;
			continue;
		}
		if (n) return {
			finished: !1,
			step: wr(o)
		};
		let l = (i ? await fn(o.flow) : void 0) ?? await pn(o.flow);
		l !== void 0 && (o.flow.getAutomaticApplicationValue = async () => l);
	}
	let o = new Promise((t) => {
		let n = R.Hooks.on("dnd5e.advancementManagerComplete", (r) => {
			r === e && (R.Hooks.off(n), t(!0));
		});
		setTimeout(() => {
			R.Hooks.off(n), t(!1);
		}, 3e3);
	});
	await e.render();
	let s = await o;
	return s && await C(), s ? { finished: !0 } : {
		finished: !1,
		step: wr(e.step)
	};
}
function wr(e) {
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
async function Tr(e) {
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
function Er(e) {
	return Object.fromEntries(Object.entries(e.system?.abilities ?? {}).map(([e, t]) => [e, t.value]));
}
async function Dr(e, t, n, r = {}, { strict: i = !1, seed: a, id: o, picks: s, blank: c = !1, traitScope: l, onManager: u } = {}) {
	a !== void 0 && k(a);
	let d = await R.CONFIG.Actor.documentClass.create({
		...o ? { _id: o } : {},
		name: e,
		type: cn,
		system: { details: { level: 1 } }
	}, { keepId: !!o }), f = l ? new Set(l) : void 0, p = Er(d), m = [];
	for (let e of t) {
		let t = yr(e?.data ?? e);
		R.CONFIG.Item.dataModels[t.type]?.resetData?.(t.system);
		let n = e?.refKey ?? xr(t), a = n ? r[n] : void 0, o = n && (!i || a?.some((e) => ir(e.id))), l = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), g = n ? s?.[n] : void 0, _ = o ? await hr(t, e, n, d.items.some((e) => e.type === "class"), {
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
		let v = [...a ?? [], ...n ? s?.[n] ?? [] : []].find((e) => ir(e.id) && !(e.id in (t.system?.advancement ?? {})));
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
		let y = _r().forNewItem(d, t, { automaticApplication: !0 });
		await u?.({
			manager: y,
			key: n,
			unsupported: _,
			picks: g,
			traitPlans: l,
			expertise: h
		});
		let b = await Cr(y, a, {
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
		d.items.contents.some((e) => e.type === t.type && e.flags?.plutonium?.hash === t.flags?.plutonium?.hash) || await d.createEmbeddedDocuments("Item", [br(yr(t))]);
	}
	return n.length && await d.createEmbeddedDocuments("Item", n.map((e) => br(yr(e?.data ?? e)))), {
		actor: d,
		initial: p,
		missingTraits: m
	};
}
function Or(e, t) {
	return {
		levelUpSteps: (n, r, i = 1) => e([], async () => {
			let e = await Tr(vr(t(n), r, i));
			return {
				status: e.length ? "pending" : "complete",
				steps: e
			};
		}, [n]),
		levelUpApply: (n, r, i = 1, a) => e([], async () => {
			let e = t(n), o = vr(e, r, i, { automaticApplication: !0 }), s = await Cr(o, a);
			return s.finished ? z(e) : {
				kernelStatus: "pending",
				reason: o.step ? "awaiting-choice" : "advancement-manager-not-complete",
				step: s.step
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
						data: Sr(n)
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
			let e = R.CONFIG.Actor.documentClass, n = await e.createDocuments(t.map((e) => ({
				...structuredClone(e.base),
				...e.id ? { _id: e.id } : {}
			})), { keepId: !0 }), r = [];
			for (let i = 0; i < n.length; i++) {
				let a = await xt(n[i], t[i].off, t[i].state);
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
			let e = t.seed ?? oe(), n = [];
			for (let e of t.items) n.push({
				...e,
				data: e.data ?? await P(e.prop, e.entry)
			});
			let r = [];
			for (let e of t.equipment ?? []) r.push({
				data: e.data ?? await P(e.prop, e.entry),
				refKey: e.refKey
			});
			let i = t.starting ? await jn(t.items.filter((e) => e.entry?.startingEquipment), t.starting, t.startingExcluded) : null, a = await Dr(t.name, n, [...r, ...i?.equipment ?? []], t.choices ?? {}, {
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
			let e = R.CONFIG.Actor.documentClass, n = new e({
				name: "Build preview",
				type: cn,
				system: { details: { level: 1 } }
			}), r = await Tr(_r().forNewItem(n, t));
			return {
				status: r.length ? "pending" : "complete",
				steps: r
			};
		}),
		importForBuild: (t, n) => e([], async () => P(t, n)),
		importerProps: $e,
		importerMeta: et,
		actorTypes: (t, n) => e([], async () => ln(t, n)),
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
			let i = await Dr(t.name, n, r, t.choices, {
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
			[...i.actor.items].filter((e) => e.type === "class").length > 1 && await un(i.actor, t.choices, [...t.items, ...t.equipment]);
			let a = i.actor.toObject(), o = await xt(i.actor, t.off, t.state);
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
var kr = globalThis;
function Ar(e) {
	let t = e?.flags?.plutonium;
	return t?.propDroppable && t.source && t.hash ? `${t.propDroppable}|${t.source}|${t.hash}` : null;
}
async function jr(e, t) {
	let n = e.items.get(t);
	if (!n) throw Error(`人物身上没有这件：${t}`);
	let r = _r().forDeletedItem(e, t, { automaticApplication: !0 });
	if (r.steps.length) {
		let e = await Cr(r, void 0);
		return e.finished ? null : e.step;
	}
	return await n.delete(), null;
}
function Mr(e, t) {
	return {
		addToActor: (n, r) => e([], async () => {
			let e = t(n), i = e.sheet;
			if (!i?._onDropSingleItem) throw Error(`人物 ${n} 没有官方人物表单实例`);
			let a = [];
			for (let t of r) {
				let n = br(yr(t.data ? structuredClone(t.data) : await P(t.prop, t.entry))), r = new Set(e.items.map((e) => e.id)), o = _r().forNewItem(e, n, { automaticApplication: !0 });
				if (o.steps.length) {
					let e = await Cr(o, t.choices, { strict: !1 });
					if (!e.finished) return {
						kernelStatus: "pending",
						reason: "add-step-not-complete",
						step: e.step,
						pending: { step: e.step }
					};
				} else {
					let t = await i._onDropSingleItem({ target: kr.document.createElement("div") }, n);
					if (t === !1 || t === void 0) continue;
					let r = await e.createEmbeddedDocuments("Item", [t], { keepId: !0 });
					a.push(...r.map((e) => e.toObject()));
				}
				for (let t of e.items) !r.has(t.id) && Ar(t) && a.push(t.toObject());
			}
			return {
				...z(e),
				added: a
			};
		}, [n]),
		removeItem: (n, r) => e([], async () => {
			let e = t(n), i = await jr(e, r);
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
var Nr = globalThis;
function Pr(e, t) {
	let n = structuredClone(e);
	delete n._id;
	for (let e of n.items ?? []) delete e._id;
	for (let e of n.effects ?? []) delete e._id;
	return t && (n.name = t), n;
}
function Fr(e) {
	return { createActorsBatch: (t) => e([], async () => {
		let e = [];
		for (let n of t) {
			let t = n.data ?? await P(n.prop, n.entry);
			e.push(Pr(t, n.name));
		}
		return (await Nr.CONFIG.Actor.documentClass.createDocuments(e)).map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			data: e.toObject()
		}));
	}) };
}
// src/rules/kernel/frame/build-extras.ts
var B = globalThis, Ir = (e) => (t) => B.UrlUtil.URL_TO_HASH_BUILDER[e](t), Lr = (e, t) => new Map(e.map((e) => [t(e.entry), e])), Rr = [{
	field: "featProgression",
	kind: "feat",
	primer: "DataPrimerFauxFeatureClassSubclassFeat"
}, {
	field: "optionalfeatureProgression",
	kind: "optionalfeature",
	primer: "DataPrimerFauxFeatureClassSubclassOptionalfeature"
}];
function zr(e, t) {
	let n = "dataSources", r = "isGmUseBlocklist", i = e.Config.get(n, r);
	e.Config.setTemp(n, r, !1, { isSkipPermissionCheck: !0 });
	try {
		return t();
	} finally {
		e.Config.setTemp(n, r, i, { isSkipPermissionCheck: !0 });
	}
}
function Br(e, t) {
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
function Vr(e, n, r, i, a, o) {
	let s = structuredClone(n.entry);
	if (s.classFeatures = Br(s, "classFeature"), s.subclasses = [], e.Charactermancer_Class_Util.getAllFeatures(s).find((e) => e.gainSubclassFeature)?.level === i) {
		let e = new Set([s, o].filter(Boolean).map((e) => B.UrlUtil.URL_TO_HASH_BUILDER.class(e))), c = (r.subclass ?? []).filter((t) => [t.entry, t.local].filter(Boolean).some((t) => e.has(B.UrlUtil.URL_TO_HASH_BUILDER.class({
			name: t.className,
			source: t.classSource
		}))));
		a.extras.push({
			id: `${n.refKey}|subclass|${i}`,
			kind: "subclass",
			title: s.subclassTitle ? t(String(s.subclassTitle)) : F(B.game.i18n.localize("DND5E.ADVANCEMENT.Subclass.Title")),
			count: 1,
			candidates: c.map(({ key: e }) => ({ key: e }))
		});
	}
}
function Hr(e, n, r, a, o) {
	let s = n.entry;
	for (let { field: c, kind: l, primer: u } of Rr) {
		if (!s[c]?.length) continue;
		let d = new e[u](), f = Ir(l), p = Lr(r[l] ?? [], f), m = d._addFauxFeatureFeatures_getFauxFeature, h = 0;
		d._addFauxFeatureFeatures_getFauxFeature = function(...e) {
			let r = m.apply(this, e);
			return r.level === a && e[5] > 0 && (e[6].length ? o.blocked.push(i("{0}：这组包含固定选项，暂时无法在这里应用", t(String(r.name)))) : o.extras.push({
				id: `${n.refKey}|${c}|${a}|${h++}`,
				kind: l,
				title: t(String(r.name)),
				count: e[5],
				candidates: r.linkedEntityInfos.flatMap(({ entity: e }) => {
					let t = p.get(f(e));
					return t ? [{ key: t.key }] : [];
				})
			})), r;
		};
		let g = {
			...structuredClone(s),
			subclasses: []
		};
		if (n.prop === "class" && (g.classFeatures = Br(g, "classFeature")), n.prop === "subclass") {
			g.subclassFeatures = Br(g, "subclassFeature");
			let t = {
				name: g.className,
				source: g.classSource,
				subclasses: [g]
			};
			zr(e, () => d.addFauxFeatureFeatures([t], [...p.values()].map(({ entry: e }) => e)));
		} else n.prop === "class" && zr(e, () => d.addFauxFeatureFeatures([g], [...p.values()].map(({ entry: e }) => e)));
	}
}
async function Ur(e, t, n, a, o) {
	let c = t.entry.feats;
	if (e.StatGenUtilAdditionalFeats.isNoChoice(c)) return;
	if (c.length !== 1) {
		o.blocked.push(i("专长有多套备选方案，建卡暂时无法在方案间切换"));
		return;
	}
	let l = await a(), u = Lr(n, Ir("feat")), d = new e.Charactermancer_AdditionalFeatsSelect({
		available: c,
		modalFilterFeats: l,
		modalFilterSpells: {},
		availableProficiencyManager: {}
	});
	d._render_renderPtStatic = () => void 0, d._render_renderPtChooseFromFilter = ({ count: e, filterExpression: n, titleNote: i, featsAdditionType: a }) => {
		let c = l.getEntitiesMatchingFilterExpression({ filterExpression: n }), d = i ? [...new Set(c.map((e) => e.category).filter((e) => !!e))] : [], f = r([s(B.Parser.getPropDisplayName("feat"), [
			"Parser",
			"CAT_ID_TO_FULL",
			String(B.Parser.CAT_ID_FEAT)
		]), ...d.map((e) => s(B.Parser.featCategoryToFull(e), [
			"Parser",
			"FEAT_CATEGORY_TO_FULL",
			e
		]))], " · ");
		o.extras.push({
			id: `${t.refKey}|feats|${a}`,
			kind: "feat",
			title: f,
			count: e,
			candidates: c.flatMap((e) => {
				let t = u.get(Ir("feat")(e));
				return t ? [{ key: t.key }] : [];
			})
		});
	};
	let f = e.veE(document.createElement("div"));
	d._hk_ixSet_renderPts({
		stgGroupLeft: f,
		stgGroupRight: f,
		featSet: c[0]
	});
}
function Wr(e, t, n, r) {
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
async function Gr(e, t, n, r) {
	if (!N) throw Error("此版本 Plutonium 缺少建卡选择入口");
	let i = N, a = t.feat ?? [], o = new Map(Object.values(t).flat().map((e) => [e.key, e])), s, c = () => s ??= i.Charactermancer_AdditionalFeatsSelect._pGetUserInput_pGetModalFilterFeats({ allData: { feat: a.map(({ entry: { prerequisite: e, ...t } }) => t) } }), l = [];
	for (let s of e) {
		let e = {
			refKey: s.refKey,
			extras: [],
			blocked: []
		};
		s.prop === "class" && Vr(i, s, t, 1, e, r[s.refKey]), (s.prop === "class" || s.prop === "subclass") && Hr(i, s, t, 1, e), s.entry.feats?.length && await Ur(i, s, a, c, e);
		for (let t of e.extras) Wr(i, t, n, o);
		l.push(e);
	}
	return l;
}
// src/rules/kernel/frame/commands-options.ts
var Kr = (e, t = []) => Object.entries(e ?? {}).flatMap(([e, n]) => n?.children ? Kr(n.children, [...t, F(String(n.label ?? e))]) : [{
	value: e,
	label: String(n?.label ?? e),
	path: t
}]), qr = {
	Trait: async (e, t, n) => {
		let { available: r } = await e.unfulfilledChoices(), i = r.filter((e) => e.type === "grant").flatMap((e) => Kr(e.choices)), a = /* @__PURE__ */ new Map();
		for (let e of r.filter((e) => e.type === "choice")) {
			let t = a.get(e.choiceIdx) ?? {
				count: 0,
				options: Kr(e.choices)
			};
			t.count++, a.set(e.choiceIdx, t);
		}
		let o = i[0]?.value ?? [...a.values()][0]?.options[0]?.value, s = n.get(e.id), l = s?.choices.length ? s.choices : void 0;
		if (!a.size && !l) return null;
		let u = [...a.values()], d = await Ln([...i, ...u.flatMap((e) => e.options)].map((e) => e.value)), f = (e) => {
			let t = s?.names.get(e.value) ?? (d[e.value] ? c(e.label, d[e.value], !0) : F(e.label)), n = t.$t === "name" ? t.ids : [];
			return {
				...e,
				label: t,
				...n.length === 1 ? { author: n[0] } : {}
			};
		};
		return {
			kind: "trait",
			trait: e.configuration?.type ?? o?.split(":")[0] ?? null,
			grants: i.map(f),
			slots: u.map((e) => ({
				...e,
				options: e.options.map(f)
			})),
			...l ? { plans: l } : {}
		};
	},
	AbilityScoreImprovement: async (e, t) => an(e, t)
}, Jr = /* @__PURE__ */ new Set([
	"HitPoints",
	"ScaleValue",
	"Size",
	"ItemGrant",
	"Subclass"
]);
async function Yr(e, n = [], i, a) {
	let o = [];
	for (let c of e.steps) {
		let e = c.flow?.advancement;
		if (!e) continue;
		let l = e.constructor?.typeName ?? e.type, u = await c.flow.getAutomaticApplicationValue?.() !== !1, d = null, f = !1, p = n.find((t) => t.id === e.id && (t.level ?? null) === (c.flow.level ?? null))?.value;
		qr[l] ? d = await qr[l](a.get(e.id) ?? e, p, i) : !u && !Jr.has(l) && (f = !0);
		let m = l === "Trait" ? en(e) : null, h = e._source?.name || e._source?.title, g = e.name ?? e.title, _ = m ? F(m) : h ? t(String(h), It(String(h))) : g ? F(String(g)) : null, v = l === "Trait" && e.hint ? r(String(e.hint).split("\n").map((e) => s(e, tr(e))), "\n") : void 0;
		o.push({
			id: e.id,
			level: c.flow.level ?? null,
			type: l,
			title: _,
			...v ? { hint: v } : {},
			automatic: u,
			options: d,
			...f ? { unsupported: !0 } : {}
		});
	}
	return o;
}
function Xr(e) {
	return { buildOptions: (t) => e([], async () => {
		let e = [];
		for (let n of t.items) e.push({
			...n,
			data: n.data ?? await P(n.prop, n.entry)
		});
		let n = [], r = await Dr("选项预览", e, [], t.choices ?? {}, {
			strict: !1,
			picks: t.picks,
			blank: t.blank,
			traitScope: t.traitScope,
			onManager: async ({ manager: e, key: t, unsupported: r, picks: i, traitPlans: a, expertise: o }) => {
				n.push({
					refKey: t,
					steps: await Yr(e, i, a, o),
					unsupported: r
				});
			}
		}), i = r.actor ?? r.created;
		try {
			let e = t.extraPools && Object.keys(t.extraPools).length ? await Gr(t.items, t.extraPools, i, t.local ?? {}) : [], a = new Map(n.map((e) => [e.refKey, e]));
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
					auto: Er(i),
					cap: globalThis.CONFIG?.DND5E?.maxAbilityScore ?? null,
					labels: Object.fromEntries(Object.entries(qt("abilities")).map(([e, t]) => [e, F(t)]))
				}
			};
		} finally {
			await (r.actor ?? r.created)?.delete?.();
		}
	}) };
}
// src/rules/kernel/frame/registry-keys.ts
var Zr = globalThis, Qr = null, $r = (e) => typeof e?.label == "string" ? e.label : typeof e?.name == "string" ? e.name : typeof e?.labels?.title == "string" ? e.labels.title : null;
function ei(e, t = []) {
	if (!e || typeof e != "object" || Array.isArray(e)) return t;
	for (let [n, r] of Object.entries(e)) t.push([n, r]), r?.children && ei(r.children, t);
	return t;
}
function ti() {
	let e = (e) => typeof e == "string" ? e : $r(e);
	Qr = {
		tables: Object.fromEntries(Object.entries(Zr.CONFIG.DND5E ?? {}).map(([t, n]) => [t, Object.fromEntries(ei(n).flatMap(([t, n]) => {
			let r = e(n);
			return r ? [[t, r]] : [];
		}))])),
		statuses: Object.fromEntries((Zr.CONFIG.statusEffects ?? []).filter((e) => typeof e?.name == "string").map((e) => [e.id, e.name]))
	};
}
var ni = () => Qr !== null, ri = null;
function ii(e) {
	let t = Zr.game.i18n, n = ri;
	if (!n || n.i18n !== t) {
		let e = /* @__PURE__ */ new Map(), r = (t, n) => {
			for (let [i, a] of Object.entries(t ?? {})) typeof a == "string" ? e.set(a, [...e.get(a) ?? [], [...n, i].join(".")]) : a && typeof a == "object" && r(a, [...n, i]);
		};
		r(t.translations, []), r(t._fallback, []), n = ri = {
			i18n: t,
			byText: e
		};
	}
	return (n.byText.get(e) ?? []).filter((e) => t.has(e));
}
function V(e, t) {
	return Rt([.../* @__PURE__ */ new Set([...t && Zr.game.i18n.has(t) ? [t] : [], ...ii(e)])], e);
}
function ai(e, t) {
	let n = {};
	for (let [r, i] of ei(t)) {
		let t = Qr?.tables[e]?.[r] ?? null, a = t && Zr.game.i18n.has(t) ? t : null, o = typeof i == "string" ? i : $r(i);
		if (!o || !a && typeof i == "string") continue;
		let s = V(a ? Zr.game.i18n.localize(a) : o, a);
		s && (n[r] = s);
	}
	return n;
}
function oi() {
	return Qr ? /* @__PURE__ */ new Set([...Object.values(Qr.tables).flatMap((e) => Object.keys(e)), ...Object.keys(Qr.statuses)]) : /* @__PURE__ */ new Set();
}
var si = (e) => Qr?.statuses[e] ?? null, ci = globalThis;
function li(e, t, n) {
	let r = [], i = [], a = [], o = (e) => String(ci.UrlUtil.encodeForHash(e)), s = n.replace(/\s*\.\.\.$/, "").trim().toLowerCase(), c = (e, n, l, u = !1) => {
		if (Array.isArray(e)) e.forEach((e, t) => c(e, n, [...l, t], u));
		else if (typeof e == "string") u && s.length >= 8 && String(ci.Renderer.stripTags(e)).trim().toLowerCase().startsWith(s) && a.push({
			entry: n,
			path: l
		});
		else if (e && typeof e == "object") {
			if (l.length && typeof e.name == "string") {
				let a = String(ci.Renderer.stripTags(e.name)), s = a.replace(/\s*\([^()]*\)\s*$/, "").replace(/\s*[.?!]$/, ""), c = N?.UtilEntityBackgroundFeature?._getEntityAliases_name_noFeature?.({ name: a }) ?? null;
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
function ui(e, n) {
	let r = e.flags?.plutonium, i = r && !r.propDroppable && typeof r.page == "string" && r.page.endsWith(".html") ? ci.UrlUtil?.PAGE_TO_PROPS?.[r.page]?.[0] : null, a = i ? {
		...r,
		propDroppable: i
	} : r, o = e.flags?.["tavern-trpg"]?.named === !0;
	if (a?.propDroppable && typeof a.hash == "string") {
		let n = {
			propDroppable: a.propDroppable,
			...a.source ? { source: a.source } : {},
			hash: a.hash
		};
		return o ? {
			name: d(String(e.name ?? "")),
			author: n
		} : {
			name: i ? t(e.name, p(e.name, n, V(String(e.name ?? ""), null) ?? Ut(String(e.name ?? "")))) : c(e.name, n),
			author: n
		};
	}
	if (o) return { name: d(String(e.name ?? "")) };
	let s = typeof a?.hash == "string" ? li(n, a.hash, String(e.name ?? "")) : null;
	return s ? { name: t(e.name, void 0, s) } : { name: V(String(e.name ?? ""), null) ?? t(e.name, Ut(String(e.name ?? ""))) };
}
// src/rules/kernel/frame/action-list.ts
var di = globalThis, fi = [
	"action",
	"bonus",
	"reaction",
	"legendary",
	"mythic",
	"lair",
	"crew",
	"special"
], pi = (e) => e.system.activities?.contents?.[0]?.activation?.type, mi = (e) => !!e && ![
	"minute",
	"hour",
	"day",
	"none"
].includes(e), hi = (e) => !!(e.system.hasLimitedUses && e.system.uses?.recovery?.length), gi = (e) => String(e.system.method ?? e.system.preparation?.mode ?? ""), _i = () => di.CONFIG.DND5E.spellPreparationStates ?? {};
function vi(e) {
	if (!(e.system.level > 0)) return !1;
	let t = e.system.prepared;
	return e.system.canPrepare && t === _i().prepared?.value || e.system.canPrepare && t === _i().always?.value || gi(e) === "atwill" && !hi(e) || gi(e) === "innate" && !hi(e) || hi(e) && e.system.uses?.value > 0 || !!e.system.linkedActivity?.item;
}
function yi(e) {
	let t = e.system.activities;
	return !!(t?.getByType?.("attack")?.[0] ?? t?.getByType?.("damage")?.[0] ?? t?.getByType?.("save")?.[0])?.damage?.parts?.length;
}
function bi(e) {
	let t = e.flags?.["tavern-trpg"]?.actionList;
	if (t === !0 || t === !1) return t;
	switch (e.type) {
		case "weapon": return !!e.system.equipped;
		case "equipment": return !!e.system.equipped && mi(pi(e));
		case "consumable": return mi(pi(e));
		case "spell": {
			let t = e.system.linkedActivity?.item, n = !!t && (t.system.attunement !== "required" || t.system.attuned), r = e.system.level === 0;
			if (!r && !(vi(e) || n) || t && r && !n) return !1;
			let i = pi(e), a = e.system.duration ?? {};
			return i === "reaction" || i === "bonus" || yi(e) || a.units === "minute" && Number(a.value) === 1 || a.units === "round" && Number(a.value) === 1 || !!e.effects?.size;
		}
		case "feat": return !!pi(e);
		default: return !1;
	}
}
function xi(e) {
	let t = new Map(fi.map((e) => [e, []]));
	for (let n of e.items) {
		if (!bi(n)) continue;
		let e = pi(n), r = e && fi.includes(e) ? e : "other";
		t.set(r, [...t.get(r) ?? [], n]);
	}
	let n = (e) => {
		let t = di.CONFIG.DND5E.activityActivationTypes?.[e]?.label;
		return F(t ? di.game.i18n.localize(t) : e === "other" ? "Other" : e);
	};
	return [...t.entries()].filter(([, e]) => e.length).map(([e, t]) => ({
		id: e,
		label: n(e),
		items: t
	}));
}
// src/rules/kernel/frame/sheet-view.ts
var H = globalThis, Si = (e) => !!e && e.constructor === H.foundry.data.fields.StringField;
function Ci(e, t, n) {
	if (e == null || !t) return n;
	if (typeof e == "string") return Si(t) && e.trim() && n.add(e), n;
	if (typeof e != "object") return n;
	let r = t.element ?? (t.model instanceof H.foundry.data.fields.DataField ? t.model : null), i = t.fields;
	for (let [t, a] of Object.entries(e)) {
		let e = i ? i[t] : r;
		e && Ci(a, e, n);
	}
	return n;
}
function wi(e, t, n, r = /* @__PURE__ */ new Set(), i = 0) {
	if (typeof e == "function") return;
	if (typeof e != "object" || !e) return e;
	if (i > 10 || r.has(e) || e === H.CONFIG || e === H.CONFIG?.DND5E || e === H.game || n.has(e)) return;
	let a = H.foundry;
	if (e instanceof a.abstract.Document) {
		if (e.documentName !== "Item") return {
			documentName: e.documentName,
			id: e.id ?? null
		};
		let a = e.labels ? wi(e.labels, t, n, r, i + 1) : void 0;
		return {
			documentName: "Item",
			id: e.id,
			...ui(e, t),
			...a ? { labels: a } : {}
		};
	}
	if (!(e instanceof a.data.fields.DataField || e instanceof a.applications.api.ApplicationV2)) {
		r.add(e);
		try {
			if (e instanceof Set) return [...e].map((e) => wi(e, t, n, r, i + 1));
			if (e instanceof Map) return Object.fromEntries([...Map.prototype.entries.call(e)].map(([e, a]) => [e, wi(a, t, n, r, i + 1)]));
			if (Array.isArray(e)) return e.map((e) => wi(e, t, n, r, i + 1));
			let a = {};
			for (let o of Object.keys(e)) {
				if (o.startsWith("_")) continue;
				let s = wi(e[o], t, n, r, i + 1);
				s !== void 0 && (a[o] = s);
			}
			return a;
		} finally {
			r.delete(e);
		}
	}
}
function Ti(e, t) {
	let n = /* @__PURE__ */ new Set();
	return [...e.items].map((e) => String(e.name ?? "")).filter((e) => e.length >= 3 && /[A-Za-z]/.test(e) && !n.has(e) && n.add(e)).sort((e, t) => t.length - e.length).map((n) => ({
		re: RegExp(`(?<![A-Za-z])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z])`),
		text: ui([...e.items].find((e) => e.name === n), t).name
	}));
}
async function Ei(e) {
	let t = H.CONFIG.DND5E, n = H.dnd5e.documents.Trait, r = /* @__PURE__ */ new Set([
		...[...e.system.traits?.weaponProf?.value ?? []].filter((e) => t.weaponIds?.[e]),
		...[...e.system.traits?.armorProf?.value ?? []].filter((e) => t.armorIds?.[e] || t.shieldIds?.[e]),
		...Object.keys(e.system.tools ?? {}).filter((e) => t.tools?.[e])
	]);
	if (!r.size) return [];
	let i = await Ee(), a = [];
	for (let e of r) {
		let r = String(n.getBaseItem(t.weaponIds?.[e] ?? t.armorIds?.[e] ?? t.shieldIds?.[e] ?? t.tools?.[e]?.id ?? e, { indexOnly: !0 })?.name ?? ""), o = i.get(e);
		r && /[A-Za-z]/.test(r) && o && a.push({
			re: RegExp(`(?<![A-Za-z])${r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z])`),
			text: c(r, o, !0)
		});
	}
	return a;
}
function Di(e, t) {
	if (!/[A-Za-z]/.test(e)) return null;
	for (let { re: n, text: i } of t) {
		let a = n.exec(e);
		if (!a) continue;
		let o = e.slice(0, a.index), s = e.slice(a.index + a[0].length), c = (e) => e ? [Di(e, t) ?? d(e)] : [];
		return r([
			...c(o),
			i,
			...c(s)
		], "");
	}
	return null;
}
function Oi(e, n, r, i) {
	if (typeof e == "string") {
		if (e.includes(".") && !/\s/.test(e) || /^[A-Z][A-Za-z]{2,}$/.test(e)) {
			let t = Lt(e);
			if (t) return t;
		}
		return n.has(e) && !r.has(e) && /\p{L}/u.test(e) ? V(e, null) ?? t(e) : Di(e, i) ?? e;
	}
	return !e || typeof e != "object" || typeof e.$t == "string" ? e : Array.isArray(e) ? e.map((e) => Oi(e, n, r, i)) : Object.fromEntries(Object.entries(e).map(([e, t]) => [e, e === "author" ? t : Oi(t, n, r, i)]));
}
async function ki(e, t) {
	let n = e.sheet, r = (e) => JSON.parse(JSON.stringify(e)), i = Object.keys(n.constructor.PARTS ?? {}), a = await n._prepareContext(r({ parts: i })), o = {};
	for (let e of i) {
		let t = await n._preparePartContext(e, Object.assign({}, a), r({}));
		o[e] = Object.fromEntries(Object.entries(t).filter(([e]) => !(e in a)));
	}
	let s = Ci(e.toObject().system, e.system.schema, /* @__PURE__ */ new Set());
	for (let t of e.items) Ci(t.toObject().system, t.system.schema, s);
	let c = oi(), l = new Set([e._source].filter(Boolean));
	o.actions = await Ai(e), await ji(e, a.itemContext);
	let u = [...Ti(e, t), ...await Ei(e)];
	return {
		sheet: n.constructor.name,
		base: Oi(wi(a, t, l), s, c, u),
		parts: Oi(wi(o, t, l), s, c, u)
	};
}
async function Ai(e) {
	return { sections: xi(e) };
}
async function ji(e, t) {
	if (!t) return;
	let n = new Set([...e.items].filter((e) => e.type === "subclass").map((e) => e.system?.classIdentifier));
	for (let r of [...e.items].filter((e) => e.type === "class")) {
		let e = t[r.id], i = r.flags?.plutonium;
		if (!e || e.needsSubclass || n.has(r.system?.identifier) || !i?.source || !i?.hash) continue;
		let a = [(await H.DataLoader.pCacheAndGet(H.UrlUtil.PG_CLASSES, i.source, i.hash).catch(() => null))?.classFeatures ?? []].flat(2).filter((e) => e?.gainSubclassFeature).map((e) => Number(e.level ?? H.DataUtil.class.unpackUidClassFeature(String(e.classFeature ?? ""))?.level)).filter((e) => Number.isFinite(e));
		a.length && Number(r.system?.levels ?? 0) >= Math.min(...a) && (e.needsSubclass = !0);
	}
}
// src/rules/kernel/frame/commands-sheet.ts
var U = globalThis, Mi = { configure: !1 }, Ni = { create: !1 }, Pi = [
	/^_id$/,
	/^_stats(\.|$)/,
	/^type$/,
	/^items(\.|$)/,
	/^effects(\.|$)/,
	/^flags\.plutonium(\.|$)/,
	/^system\.advancement(\.|$)/
];
function Fi(e, t) {
	return !t || Pi.some((e) => e.test(t)) ? !1 : t.startsWith("flags.") ? t.split(".").length >= 3 : t.startsWith("system.") ? !!e.system?.schema?.getField?.(t.slice(7)) : !!e.schema?.getField?.(t);
}
function Ii(e, t, n, r) {
	if (!Fi(e, t)) throw Error(`不能改这个字段：${t}`);
	if (!r) return { [t]: n };
	let i = t.lastIndexOf(".");
	return { [`${t.slice(0, i)}.-=${t.slice(i + 1)}`]: null };
}
var Li = (e, t) => t ? e.items.get(t, { strict: !0 }) : e, Ri = (e) => JSON.parse(JSON.stringify(e ?? null, (e, t) => e === "document" || e === "anchor" || e === "fields" || e === "field" || e === "parent" ? void 0 : t));
function zi(e) {
	let t = /* @__PURE__ */ new Set([Object.prototype, U.foundry.abstract.DataModel.prototype]), n = [];
	for (let r = Object.getPrototypeOf(e); r && !t.has(r); r = Object.getPrototypeOf(r)) for (let [e, t] of Object.entries(Object.getOwnPropertyDescriptors(r))) t.get && !n.some(([t]) => t === e) && n.push([e, t.get]);
	return n;
}
function W(e, t = 0, n = /* @__PURE__ */ new WeakSet()) {
	if (typeof e == "function") return;
	if (typeof e != "object" || !e) return e;
	if (t > 12 || n.has(e) || e instanceof U.foundry.abstract.Document) return;
	if (n.add(e), e instanceof Set) return [...e].map((e) => W(e, t + 1, n));
	if (e instanceof Map) return Object.fromEntries([...Map.prototype.entries.call(e)].map(([e, r]) => [e, W(r, t + 1, n)]));
	if (Array.isArray(e)) return e.map((e) => W(e, t + 1, n));
	let r = {};
	for (let i of Object.keys(e)) {
		if (i === "parent" || i.startsWith("_")) continue;
		let a = W(e[i], t + 1, n);
		a !== void 0 && (r[i] = a);
	}
	for (let [i, a] of zi(e)) {
		if (i in r || i === "parent" || i.startsWith("_")) continue;
		let o;
		try {
			o = a.call(e);
		} catch {
			o = void 0;
		}
		let s = W(o, t + 1, n);
		s !== void 0 && (r[i] = s);
	}
	return r;
}
async function Bi(e, t, n) {
	if (!e) return null;
	let r = new e({ document: t }), i = await r._prepareContext({ parts: [] }), a = await r._preparePartContext(Object.keys(e.PARTS ?? {})[0] ?? "config", i, {});
	return Object.fromEntries(n.filter((e) => e in a).map((e) => [e, Ri(a[e])]));
}
var Vi = {
	ability: (e, t) => e.rollAbilityCheck({ ability: t }, Mi, Ni),
	tool: (e, t) => e.rollToolCheck({ tool: t }, Mi, Ni),
	death: (e) => e.rollDeathSave({}, Mi, Ni),
	hitDie: (e, t) => e.rollHitDie(t ? { denomination: t } : {}, Mi, Ni),
	initiative: async (e) => {
		let t = e.getInitiativeRoll();
		return t ? (await t.evaluate({ allowInteractive: !1 }), [t]) : null;
	}
};
function Hi(e, r, i) {
	return {
		sheet: (n, i = []) => e([], async () => {
			let e = r(n), a = U.dnd5e?.applications?.actor ?? {};
			return {
				id: e.id,
				name: e.name,
				img: e.img,
				type: e.type,
				flags: Ri(e.flags ?? {}),
				system: W(e.system),
				statuses: [...e.statuses ?? []],
				items: [...e.items].map((e) => ({
					..._e(e),
					img: e.img,
					sort: e.sort,
					flags: Ri(e.flags ?? {}),
					system: W(e.system),
					labels: Ri(e.labels ?? {})
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
					duration: Ri(e.duration),
					durationSource: Ri(e._source?.duration ?? null),
					changes: Ri(e.system?.changes ?? e.changes ?? [])
				})),
				shown: {
					items: [...e.items].map((e) => ({
						id: e.id,
						...ui(e, i)
					})),
					effects: [...e.allApplicableEffects()].map((e) => ({
						id: e.id,
						name: V(String(e.name ?? ""), null) ?? t(e.name)
					}))
				},
				view: await ki(e, i),
				breakdown: {
					hp: await Bi(a.HitPointsConfig, e, [
						"classes",
						"ability",
						"effects",
						"levels"
					]),
					ac: await Bi(a.ArmorClassConfig, e, ["calculations", "formulaLabel"])
				}
			};
		}),
		roster: (t) => e([], async () => [...U.game.actors].filter((e) => !t || t.includes(e.id)).map((e) => ({
			id: e.id,
			name: e.name,
			img: e.img,
			type: e.type,
			system: W(e.system),
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
		edit: (t, n) => e([], async () => {
			let e = r(t);
			for (let t of n) if (t.kind === "set") await e.update(Ii(e, t.path, t.value, t.remove));
			else if (t.kind === "item") {
				let n = e.items.get(t.itemId, { strict: !0 });
				await n.update(Ii(n, t.path, t.value, t.remove));
			} else if (t.kind === "itemDelete") await e.deleteEmbeddedDocuments("Item", [t.itemId]);
			else if (t.kind === "effect") {
				let n = Li(e, t.itemId).effects.get(t.effectId, { strict: !0 });
				await n.update(Ii(n, t.path, t.value, t.remove));
			} else if (t.kind === "effectCreate") await Li(e, t.itemId).createEmbeddedDocuments("ActiveEffect", [t.data]);
			else if (t.kind === "effectDelete") await Li(e, t.itemId).deleteEmbeddedDocuments("ActiveEffect", [t.effectId]);
			else if (t.kind === "status") await e.toggleStatusEffect(t.statusId, t.levels === void 0 ? { active: t.active ?? !0 } : { levels: t.levels });
			else throw Error(`不认识的改动：${t.kind}`);
			return { edits: n.length };
		}, [t]),
		check: (t, n, a, o = []) => e(o, async () => {
			let e = Vi[n];
			if (!e) throw Error(`没有这种检定：${n}`);
			return (await e(r(t), a))?.map(i) ?? null;
		}, [t]),
		glossary: () => e([], async () => {
			if (!ni()) throw Error("开机时没有记下登记表原值（registry-keys.ts）");
			return {
				tables: Object.fromEntries(Object.entries(U.CONFIG.DND5E ?? {}).map(([e, t]) => [e, ai(e, t)]).filter(([, e]) => Object.keys(e).length)),
				statuses: (U.CONFIG.statusEffects ?? []).flatMap((e) => typeof e?.name == "string" ? [{
					id: e.id,
					name: V(e.name, si(e.id)) ?? s(e.name, null),
					img: e.img ?? null
				}] : [])
			};
		}),
		fieldLabels: (t) => e([], async () => t.map(({ actorId: e, path: t }) => {
			let r = U.game.actors.get(e), i = /^state\.(?:actor|items\.(.+?))\.((?:system|name|img|flags)(?:\..*)?)$/.exec(t);
			if (!r || !i) return null;
			let a = i[1] ? n([...r.items], i[1]) : r;
			if (!a) return null;
			let o = i[2].split(".");
			for (let e = o.length; e > 0; e--) {
				let t = o.slice(0, e).join("."), n = (t.startsWith("system.") ? a.system?.schema?.getField(t.slice(7)) : a.schema?.getField(t))?.label;
				if (typeof n == "string" && n) return {
					field: Lt(n) ?? V(n, null) ?? s(n, null),
					...i[1] ? { item: ui(a, []).name } : {}
				};
			}
			return null;
		})),
		deleteActors: (t) => e([], async () => {
			let e = t.filter((e) => U.game.actors.get(e));
			return e.length && await U.CONFIG.Actor.documentClass.deleteDocuments(e), { deleted: e };
		})
	};
}
// src/rules/kernel/frame/commands-fields.ts
var G = globalThis;
function K(e) {
	return typeof e != "string" || !e.trim() ? null : Lt(e) || (V(e, null) ?? s(e, null));
}
var Ui = [
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
		options: () => [0, 1].map((e) => [e, G.CONFIG.DND5E.proficiencyLevels[e]])
	},
	{
		path: /^system\.(skills|tools)\.[^.]+\.value$/,
		options: () => Object.entries(G.CONFIG.DND5E.proficiencyLevels).map(([e, t]) => [Number(e), t])
	},
	{
		path: /^system\.(skills|tools)\.[^.]+\.ability$|^system\.attributes\.spellcasting$/,
		options: () => Object.entries(G.CONFIG.DND5E.abilities).map(([e, t]) => [e, t.label])
	},
	{
		path: /^system\.attributes\.(init|concentration)\.ability$/,
		options: () => [["", "DND5E.Default"], ...Object.entries(G.CONFIG.DND5E.abilities).map(([e, t]) => [e, t.label])]
	},
	{
		path: /^system\.attributes\.ac\.calcs?$/,
		options: () => Object.entries(G.CONFIG.DND5E.armorClasses).map(([e, t]) => [e, t.label])
	},
	{
		path: /^system\.attributes\.(movement|senses)\.units$/,
		options: () => Object.entries(G.CONFIG.DND5E.movementUnits).map(([e, t]) => [e, t.label])
	}
], Wi = (e) => Ui.find((t) => t.path.test(e))?.options().map(([e, t]) => ({
	value: String(e),
	label: (typeof t == "string" ? K(t) : null) ?? d(String(e))
}));
function Gi(e) {
	let t = e?.choices;
	if (typeof t == "function" && (t = t()), t) return (Array.isArray(t) ? t.map((e) => [String(e), e]) : Object.entries(t)).map(([e, t]) => ({
		value: e,
		label: K(typeof t == "string" ? t : t?.label ?? t?.name ?? e) ?? d(e)
	}));
}
function Ki(e) {
	let t = G.foundry.data.fields, n = G.dnd5e?.dataModels?.fields ?? {};
	if (e instanceof t.BooleanField) return "boolean";
	if (e instanceof t.NumberField) return "number";
	if (e instanceof t.HTMLField) return "html";
	if (e instanceof t.SetField || e instanceof t.ArrayField) {
		let n = e.element;
		return n instanceof t.StringField ? Gi(n) ? "multi" : "tags" : null;
	}
	return n.FormulaField && e instanceof n.FormulaField ? "formula" : e instanceof t.StringField ? Gi(e) ? "select" : "text" : null;
}
function qi(e, t, n, r, i) {
	let a = G.foundry.data.fields, o = {
		path: t,
		label: K(e.label),
		hint: K(e.hint)
	};
	if (e instanceof a.SchemaField && !(e instanceof a.EmbeddedDataField && !e.fields)) {
		if (r > 4) return null;
		let a = Object.entries(e.fields ?? {}).map(([e, a]) => qi(a, `${t}.${e}`, n?.[e], r + 1, i)).filter((e) => !!e);
		return a.length ? {
			...o,
			children: a
		} : null;
	}
	if (e.model instanceof a.DataField && e instanceof a.ObjectField && n && typeof n == "object") {
		if (r > 4) return null;
		let a = Object.keys(n).map((a) => qi(e.model, `${t}.${a}`, n[a], r + 1, i)).filter((e) => !!e);
		return a.length ? {
			...o,
			children: a
		} : null;
	}
	let s = Wi(t), c = s && e instanceof a.SetField ? "multi" : s && (e instanceof a.StringField || e instanceof a.NumberField) ? "select" : Ki(e);
	if (!c) return null;
	let l = e.options?.persisted === !1, u = l ? Ji(i, t) : n, d = {
		...o,
		kind: c,
		value: u instanceof Set ? [...u] : u ?? null,
		...l ? { derived: !0 } : {}
	};
	return s ? (d.choices = s, e instanceof a.NumberField && (d.numeric = !0)) : c === "select" && (d.choices = Gi(e)), c === "multi" && (d.choices = Gi(e.element)), c === "number" && Object.assign(d, {
		min: e.min,
		max: e.max,
		step: e.step,
		integer: !!e.integer,
		nullable: !!e.nullable
	}), d;
}
var Ji = (e, t) => t.split(".").reduce((e, t) => e?.[t], e);
function Yi(e, t) {
	let n = t.split(".");
	for (let t = n.length; t > 0; t--) {
		let r = n.slice(0, t).join("."), i = (r.startsWith("system.") ? e.system?.schema?.getField(r.slice(7)) : e.schema?.getField(r))?.label;
		if (typeof i == "string" && i) return i;
	}
	return null;
}
function Xi(e, t) {
	return {
		fieldInfo: (n, r) => e([], async () => {
			let e = t(n), i = r.itemId ? e.items.get(r.itemId) : e;
			if (!i) throw Error(`没有这件物品：${r.itemId}`);
			let { path: a } = r, o = a === "system" ? i.system?.schema : a.startsWith("system.") ? i.system?.schema?.getField(a.slice(7)) : i.schema?.getField(a);
			if (!o) throw Error(`官方没有这个字段：${a}`);
			let s = qi(o, a, Ji(i._source, a), 0, i), c = G.CONFIG.ActiveEffect.documentClass.CHANGE_TYPES ?? {}, l = (e) => typeof e.type == "string" ? e.type : (Object.entries(G.CONST.ACTIVE_EFFECT_MODES ?? {}).find(([, t]) => t === e.mode)?.[0] ?? "").toLowerCase(), u = (e) => K(String(c[e]?.label ?? e));
			return {
				tree: s,
				effects: r.itemId ? [] : [...e.allApplicableEffects?.() ?? []].flatMap((t) => [...t.system?.changes ?? t.changes ?? []].filter((e) => e.key === a || e.key.startsWith(`${a}.`) || a.startsWith(`${e.key}.`)).map((n) => {
					let r = t.parent && t.parent !== e ? ui(t.parent, []).name : null, i = l(n);
					return {
						effect: t.id,
						itemId: t.parent && t.parent !== e ? t.parent.id : null,
						name: K(t.name),
						origin: r,
						active: !t.disabled && !t.isSuppressed,
						disabled: !!t.disabled,
						manual: !!t.flags?.["tavern-trpg"]?.manual,
						key: n.key,
						keyLabel: K(Yi(e, n.key)),
						mode: i ? u(i) : null,
						modeCode: i,
						value: n.value
					};
				})),
				attribution: null,
				derived: null,
				modes: Object.entries(c).map(([e, t]) => ({
					value: e,
					label: K(String(t.label ?? e)) ?? d(e)
				})),
				durationUnits: [...G.CONST.ACTIVE_EFFECT_DURATION_UNITS ?? []].map((e) => ({
					value: e,
					label: K(`EFFECT.DURATION.UNITS.${e}`) ?? d(e)
				}))
			};
		}),
		specialTraits: (n) => e([], async () => {
			let e = t(n)._source?.flags?.dnd5e ?? {}, r = /* @__PURE__ */ new Map();
			for (let [t, n] of Object.entries(G.CONFIG.DND5E.characterFlags ?? {})) {
				let i = G.foundry.utils.getProperty(e, t);
				if (n.deprecated && !i) continue;
				let a = n.type === Boolean ? "boolean" : n.type === Number ? "number" : "string", o = n.choices ? Object.entries(n.choices).map(([e, t]) => ({
					value: e,
					label: K(String(typeof t == "string" ? t : t?.label ?? e))
				})) : null, s = String(n.section ?? "");
				r.has(s) || r.set(s, {
					label: K(s),
					fields: []
				}), r.get(s).fields.push({
					key: t,
					path: `flags.dnd5e.${t}`,
					name: K(String(n.name ?? t)),
					hint: K(String(n.hint ?? "")),
					type: a,
					choices: o,
					value: i ?? null
				});
			}
			return { sections: [...r.values()] };
		}),
		traitChoices: (t) => e([], async () => {
			let e = G.dnd5e.documents.Trait, n = [
				"weapon",
				"armor",
				"tool"
			].includes(t) ? await Ee() : /* @__PURE__ */ new Map(), r = (e) => e.split(":").pop() ?? e, i = [], a = (e, t) => {
				for (let [o, s] of Object.entries(e ?? {})) {
					if (s?.wildcard) continue;
					let e = String(s.label ?? o), l = n.get(r(o));
					i.push({
						key: o,
						label: l && /[A-Za-z]/.test(e) ? c(e, l, !0) : K(e),
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
			].includes(t) ? Object.entries(G.CONFIG.DND5E.itemProperties ?? {}).filter(([, e]) => e.isPhysical).map(([e, t]) => ({
				key: e,
				label: K(String(t.label ?? e))
			})) : [], s = t === "languages" ? Object.entries(G.CONFIG.DND5E.communicationTypes ?? {}).map(([e, t]) => ({
				key: e,
				label: K(String(t.label ?? e))
			})) : [];
			return {
				trait: t,
				path: e.actorKeyPath(t),
				label: K(e.traitLabel(t)),
				rows: i,
				bypasses: o,
				communication: s
			};
		})
	};
}
// src/rules/kernel/frame/author-ask-forms.ts
var Zi = globalThis;
async function Qi(e, t) {
	let n = N, r = [];
	if (e instanceof n.Charactermancer_ImmResVulnSelect) return {
		slots: Kn(n, e) ?? [],
		cleanup: r
	};
	let i = (e._available ?? [])[t];
	return e._state.ixSet = t, e instanceof n.Charactermancer_ExpertiseSelect ? {
		slots: Gn(n, e, i, r),
		cleanup: r
	} : ((i?.all?.length || i?.choose?.some((e) => e.fromFilter)) && await e.pNotRender(), {
		slots: Wn(n, e, i ?? {}, r),
		cleanup: r
	});
}
var $i = (e) => ({
	title: e.hints?.length ? I(e.hints.join(" ")) : null,
	count: e.count,
	options: e.options.map((t) => ({ label: t.text ?? l(t.label, e.options.map((e) => e.label), F(t.label)) }))
}), ea = {
	async read({ comp: e, opts: t }, n) {
		let r = N.Charactermancer_ImmResVulnSelect && e instanceof N.Charactermancer_ImmResVulnSelect ? 1 : Math.max(1, (e._available ?? []).length), a = [];
		for (let t = 0; t < r; t++) {
			let { slots: n, cleanup: o } = await Qi(e, t);
			try {
				a.push({
					label: r > 1 ? i("方案 {0}", d(String(t + 1))) : null,
					groups: n.map($i)
				});
			} finally {
				for (let e of o) e();
			}
		}
		return {
			kind: n,
			title: I(e.modalTitle),
			note: null,
			form: {
				type: "choose",
				sets: a,
				set: 0
			},
			skippable: !t?.isUnskippable
		};
	},
	async write({ comp: e }, t) {
		if (t.default) return e.pGetFormData();
		let { slots: n, cleanup: r } = await Qi(e, t.set ?? 0);
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
}, ta = {
	read({ comp: e, opts: n }, r) {
		let i = e.constructor, a = i._PROP_METAS.map((n) => {
			let r = e._tables[n.prop];
			return {
				title: I(i._PROP_TO_FULL?.[n.prop]),
				count: n.count || 1,
				custom: !0,
				options: (r?.rows ?? []).map((e) => ({ label: t(Zi.Renderer.stripTags(String(e?.[1] ?? ""))) }))
			};
		});
		return {
			kind: r,
			title: I(e.modalTitle),
			note: null,
			form: {
				type: "texts",
				groups: a
			},
			skippable: !n?.isUnskippable
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
function na(e) {
	let n = String(e?.entity?.name ?? e?.name ?? ""), r = Zi.UrlUtil?.PAGE_TO_PROPS?.[e?.page]?.[0];
	return r && e?.hash && e?.source ? c(n, {
		propDroppable: r,
		source: e.source,
		hash: e.hash,
		page: e.page
	}) : t(n);
}
var ra = (e) => F(qt("abilities")[e] ?? e), ia = {
	read({ comp: e, opts: n }, r) {
		let { count: a, required: o } = e._getOptionsNameAndCount(), s = e._optionsSet.map((e, t) => ({
			label: na(e),
			disabled: o.includes(t)
		})), c = e._optionsSet[0]?.optionsMeta?.name;
		return {
			kind: r,
			title: i(e._level == null ? "{0}" : "{0}（{1} 级）", t(String(c ?? "")), d(String(e._level ?? ""))),
			note: null,
			form: {
				type: "choose",
				sets: [{
					label: null,
					groups: [{
						title: null,
						count: a - o.length,
						options: s
					}]
				}],
				set: 0
			},
			skippable: !n?.isUnskippable
		};
	},
	async write({ comp: e }, t) {
		if (t.default) return e.pGetFormData();
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
			return await e.pGetFormData();
		} finally {
			i.cleanup?.();
		}
	}
}, aa = {
	read({ comp: e, opts: t }, n) {
		let a = e.constructor, o = e._ability.map((t, n) => {
			let o = Object.keys(qt("abilities")).filter((e) => t[e]).map((e) => i("{0} {1}", ra(e), d(`${t[e] > 0 ? "+" : ""}${t[e]}`))), s = [];
			if (t.choose?.from) s.push({
				title: i("选 {0} 项，各 +{1}", d(String(t.choose.count || 1)), d(String(t.choose.amount || 1))),
				count: t.choose.count || 1,
				options: t.choose.from.map((e) => ({ label: ra(e) }))
			});
			else if (t.choose?.weighted) {
				let e = a._getSortedWeightedFrom(t);
				for (let n of a._getSortedWeights(t)) s.push({
					title: i("+{0}", d(String(n))),
					count: 1,
					options: e.map((e) => ({ label: ra(e) }))
				});
			}
			return {
				label: o.length ? r(o, "，") : e._ability.length > 1 ? i("方案 {0}", d(String(n + 1))) : null,
				groups: s
			};
		});
		return {
			kind: n,
			title: I(e.modalTitle),
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
}, oa = {
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
			label: ra(e),
			value: Number(n._state[e] ?? 0)
		}));
		return {
			kind: t,
			title: I("Ability Score Improvement"),
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
};
// src/rules/kernel/frame/author-ask-equipment.ts
async function sa(e) {
	let t = await Dn(e);
	return t ? "unsupported" in t ? {
		kind: "special",
		quantity: 1,
		text: d(String(t.unsupported))
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
		text: d(JSON.stringify(e).slice(0, 80))
	};
}
var ca = {
	async read({ comp: e }, t) {
		let n = e._compCurrency.startingEquipment?.defaultData ?? [], r = [];
		for (let e of n) {
			let t = [];
			for (let [, n] of Object.entries(e)) t.push({ entries: await Promise.all(n.map(sa)) });
			r.push({ choices: t });
		}
		let i = e._compGold?.isAvailable ? e._compCurrency.rollableExpressionGold ?? null : null;
		return {
			kind: t,
			title: I(e._compCurrency.rollableExpressionGold ? "Starting Equipment" : "Equipment"),
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
}, la = (e) => typeof e == "string" ? e.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "", ua = {
	read: ({ comp: e, opts: t }, n) => ({
		kind: n,
		title: I(e?.modalTitle ?? t?.title),
		note: I(la(t?.htmlDescription)),
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
}, da = globalThis, fa = (e, t, n, r, i) => ({
	kind: e,
	title: t,
	note: I(la(i ?? r?.htmlDescription)),
	form: n,
	skippable: !!r?.isSkippable || (r && "isUnskippable" in r ? !r.isUnskippable : !1)
});
function pa(e) {
	let t = document.createElement("div");
	return e.render(N.veE(t)), t;
}
var ma = (e) => [...e.querySelectorAll("select")], ha = {
	read: ({ comp: e, opts: t }, n) => {
		let r = ma(pa(e))[0];
		return r ? fa(n, I(e.modalTitle), {
			type: "enum",
			options: [...r.options].map((e) => ({
				label: I(e.text) ?? d(e.text),
				disabled: e.disabled
			})),
			selected: r.selectedIndex
		}, t) : ua.read({
			comp: e,
			opts: t
		}, n);
	},
	write: async ({ comp: e }, t) => {
		if (t.default) return e.pGetFormData();
		let n = ma(pa(e))[0], r = Number(t.value);
		if (!n || !Number.isInteger(r) || r < 0 || r >= n.options.length) throw Error("选项不在作者给的范围里");
		return n.selectedIndex = r, n.dispatchEvent(new Event("change")), e.pGetFormData();
	}
}, ga = (e) => {
	let t = e.subclassFeature || e.__prop === "subclassFeature" || e.subclassSource ? "subclassFeature" : "classFeature", n = t === "subclassFeature" ? e.subclassFeature : e.classFeature, r = typeof n == "string" ? da.DataUtil?.class?.[t === "subclassFeature" ? "unpackUidSubclassFeature" : "unpackUidClassFeature"]?.(n) : null, i = {
		...r ?? {},
		...e,
		...r ? {
			className: r.className,
			classSource: r.classSource,
			level: r.level,
			source: e.source ?? r.source
		} : {}
	}, a = da.UrlUtil?.URL_TO_HASH_BUILDER?.[t]?.(i), o = String(e.tableDisplayName || e.name || "");
	return a && i.source ? c(o, {
		propDroppable: t,
		source: i.source,
		hash: a,
		page: t
	}, !0) : I(o) ?? d(o);
}, _a = {
	"*": ua,
	"InputUiUtil.pGetUserBoolean": {
		read: ({ opts: e }, t) => fa(t, I(e.title), {
			type: "boolean",
			yes: I(e.textYes ?? "Yes"),
			no: I(e.textNo ?? "No")
		}, e),
		write: (e, t) => t.default ? !0 : !!t.value
	},
	"InputUiUtil.pGetUserEnum": {
		read: ({ opts: e }, t) => fa(t, I(e.title), {
			type: "enum",
			options: (e.values ?? []).map((t) => {
				let n = e.fnDisplay ? e.fnDisplay(t) : t;
				return { label: typeof n == "string" ? I(n) ?? d(n) : d(String(n)) };
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
		read: ({ opts: e }, t) => fa(t, I(e.title), {
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
		read: ({ opts: e }, t) => fa(t, I(e.title), {
			type: "string",
			value: String(e.default ?? "")
		}, e),
		write: ({ opts: e }, t) => String(t.default ? e.default ?? "" : t.value ?? "")
	},
	Charactermancer_Class_HpIncreaseModeSelect: ha,
	Charactermancer_OtherProficiencySelect: ea,
	Charactermancer_ExpertiseSelect: ea,
	Charactermancer_DamageResistanceSelect: ea,
	Charactermancer_DamageImmunitySelect: ea,
	Charactermancer_DamageVulnerabilitySelect: ea,
	Charactermancer_ConditionImmunitySelect: ea,
	Charactermancer_Background_Characteristics: ta,
	Charactermancer_FeatureOptionsSelect: ia,
	Charactermancer_AbilityScoreSelect: aa,
	Charactermancer_Background_Features: ha,
	EquipmentApp: ca,
	ActorAbilityScoreIncrease: oa,
	Charactermancer_Class_ProficiencyImportModeSelect: ha,
	Charactermancer_Class_LevelSelect: {
		read: ({ comp: e, opts: t }, n) => {
			let a = e._maxPreviousLevel || 0, o = e._featureArr.map((t, n) => ({
				label: i("{0} 级", d(String(n + 1))),
				note: t.length ? r(t.map(ga), "、") : null,
				disabled: !e._isSubclass && n < a
			}));
			return fa(n, I(e.modalTitle), {
				type: "levels",
				levels: o,
				radio: e._isRadio,
				from: a,
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
}, va = class extends Error {
	question;
	constructor(e) {
		super("KERNEL_NEEDS_ANSWER"), this.question = e;
	}
}, ya = () => globalThis.VeCt?.SYM_UI_SKIP, ba = [
	"pGetUserBoolean",
	"pGetUserEnum",
	"pGetUserNumber",
	"pGetUserString",
	"pGetUserGenericButton"
], xa = ["EquipmentApp", "ActorAbilityScoreIncrease"];
async function Sa(e, t) {
	let n = N;
	if (!n?.UtilApplications || !n?.InputUiUtil) throw Error("此版本 Plutonium 缺少提问入口（UtilApplications / InputUiUtil）");
	let r = [], i = null, a = async (t, n) => {
		if (i) return null;
		let a = _a[t] ?? _a["*"], o = r.length, s = {
			index: o,
			...await a.read(n, t)
		};
		r.push(s);
		let c = e[o];
		return c === void 0 ? (i = s, null) : c.skip ? a.skip ? a.skip() : ya() : a.write(n, c);
	}, o = n.UtilApplications, s = n.InputUiUtil, c = o.pGetImportCompApplicationFormData, l = Object.fromEntries(ba.map((e) => [e, s[e]]));
	o.pGetImportCompApplicationFormData = (e) => a(e?.comp?.constructor?.name ?? "?", {
		comp: e.comp,
		opts: e
	});
	for (let e of ba) s[e] = (t = {}) => a(`InputUiUtil.${e}`, { opts: t });
	let u = xa.map((e) => ({
		name: e,
		proto: n[e]?.prototype
	})).filter((e) => e.proto), d = u.map(({ proto: e }) => ({
		render: Object.getOwnPropertyDescriptor(e, "render"),
		wait: e.pWaitForUserInput
	}));
	for (let { name: e, proto: t } of u) t.render = async function() {
		return this;
	}, t.pWaitForUserInput = async function() {
		return "_cntModesAvailable" in this && !this._cntModesAvailable ? ya() : (typeof this.pInit == "function" && await this.pInit(), a(e, {
			comp: this,
			opts: {}
		}));
	};
	try {
		let e = await t();
		if (i) throw new va(i);
		return {
			value: e,
			asked: r
		};
	} finally {
		o.pGetImportCompApplicationFormData = c;
		for (let e of ba) s[e] = l[e];
		u.forEach(({ proto: e }, t) => {
			d[t].render ? Object.defineProperty(e, "render", d[t].render) : delete e.render, e.pWaitForUserInput = d[t].wait;
		});
	}
}
// src/rules/kernel/frame/commands-import.ts
var Ca = globalThis, wa = () => Ca.CONFIG.Actor.documentClass;
function Ta(e, t) {
	return {
		draftStart: (t) => e([], async () => {
			k(t.seed);
			let e = await wa().create({
				...t.id ? { _id: t.id } : {},
				name: t.name,
				type: cn
			}, { keepId: !!t.id });
			return {
				id: e.id,
				data: e.toObject()
			};
		}),
		draftLoad: (t) => e([], async () => {
			k(t.seed);
			let e = await wa().create(structuredClone(t.data), { keepId: !0 });
			return {
				id: e.id,
				data: e.toObject()
			};
		}),
		importToActor: (n, r, i = [], a) => e([], async () => {
			let e = t(n);
			if (a) {
				let t = await jr(e, a);
				if (t) return {
					kernelStatus: "pending",
					reason: "remove-step-not-complete",
					step: t
				};
			}
			let o = Ca.game.modules.get("plutonium")?.api, s = await o?.importer?.pGetImporter({ prop: r.prop });
			if (!s) throw Error(`作者没有「${r.prop}」的导入器`);
			let c = new Set(e.items.map((e) => e.id));
			try {
				let { value: t, asked: n } = await Sa(i, () => s.pImportEntry(structuredClone(r.entry), new o.importer.ImportOpts({ actor: e }))), a = e.items.filter((e) => !c.has(e.id)).map((e) => ({
					_id: e.id,
					name: e.name,
					label: ui(e, [r.entry]).name,
					type: e.type,
					typeLabel: Lt(String(Ca.CONFIG.Item.typeLabels?.[e.type] ?? "")),
					flags: { plutonium: e.flags?.plutonium ?? null }
				}));
				return {
					exit: typeof t?.status == "symbol" ? t.status.description ?? null : null,
					asked: n,
					added: a
				};
			} catch (e) {
				if (e instanceof va) return {
					kernelStatus: "pending",
					pending: { question: e.question },
					question: e.question
				};
				throw e;
			}
		}, [n])
	};
}
// src/rules/kernel/frame/native-builder-review.ts
function Ea(e) {
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
var Da = globalThis, Oa = (e) => e.trim().toLowerCase(), ka = /* @__PURE__ */ new WeakMap();
function Aa(e, t) {
	let n = Oa(e), r = Object.hasOwn(t.terms, n) ? t.terms[n] : void 0;
	if (r) return r;
	if (!/[a-zA-Z]/.test(e)) return e;
	let i = ka.get(t);
	i || (i = /* @__PURE__ */ new Map(), ka.set(t, i));
	let a = i.get(e);
	if (a !== void 0) return a;
	for (let { $t: t, ...n } of [It(e), F(e)]) {
		if (t !== "system" || !("key" in n) || !Da.game.i18n.has(n.key)) continue;
		let r = Da.game.i18n.localize(n.key);
		if (r !== e) return i.set(e, r), r;
	}
	return i.set(e, e), e;
}
function ja(e, t) {
	let n = Aa(e.trim(), t);
	if (n !== e.trim()) return e.replace(e.trim(), n);
	let r = /^\s*\((\w{3})\)\s*$/.exec(e);
	if (r) {
		let t = Da.CONFIG.DND5E.abilities[r[1].toLowerCase()]?.label;
		if (t) return e.replace(r[1], t);
	}
	if (e.includes(", ")) {
		let n = e.split(", "), r = n.map((e) => Aa(e, t));
		if (r.some((e, t) => e !== n[t])) return r.join("，");
	}
	return e;
}
function Ma(e, t) {
	for (let t of e.querySelectorAll(".p6-choice-group")) {
		let e = t.previousElementSibling;
		e?.classList.contains("ve-mb-1") && /^Choose\b/.test(e.textContent ?? "") && e.classList.add("p6-choice-instruction");
	}
	let n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), r;
	for (; r = n.nextNode();) {
		let e = r;
		if (!e.data.trim() || e.parentElement?.closest("script,style,textarea,.p6-builder-ui")) continue;
		let n = e.parentElement?.closest("option"), i = ja(e.data, t);
		i !== e.data && (n && !n.hasAttribute("value") && n.setAttribute("value", n.value), e.data = i);
	}
	for (let n of e.querySelectorAll("[title],[placeholder],[aria-label]")) for (let e of [
		"title",
		"placeholder",
		"aria-label"
	]) {
		let r = n.getAttribute(e);
		if (!r) continue;
		let i = ja(r, t);
		i !== r && n.setAttribute(e, i);
	}
	for (let t of e.querySelectorAll("button[name=\"btn-learn-cantrip\"],button[name=\"btn-learn-spell\"],button[name=\"btn-prepare\"]")) {
		let e = t.name === "btn-prepare" ? "准备" : "学习";
		t.textContent !== e && (t.textContent = e), t.setAttribute("aria-pressed", String(t.classList.contains("ve-active")));
	}
}
function Na(e, t) {
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
		let r = a.call(this, e, ...n), i = Da.UrlUtil.URL_TO_HASH_BUILDER.spell(e), o = t.labels.spell?.[i];
		if (o && r?.ele) {
			let e = r.ele.firstElementChild;
			e && (e.textContent = o.name, e.classList.add("p6-spell-name")), r.values.alias = [r.values.alias, o.name].filter(Boolean).join(" "), r.ele.dataset.p6Spell = i;
		}
		return r;
	}, () => {
		n.getMetaWrpMultipleChoice = r, i._getListItem = a;
	};
}
function Pa(e, t, n) {
	let r = e.querySelector(".ve-statgen-shared__wrp-header"), i = r?.querySelector("select"), a = t.compAbility.compStatgen, o = e.closest(".p6-builder-attributes");
	if (o && (o.dataset.mode = a.getMode()), !r || !i || r.querySelector(".p6-ability-methods")) return;
	let s = q("div", "p6-ability-methods p6-builder-ui");
	s.setAttribute("role", "group"), s.setAttribute("aria-label", "怎么定属性");
	let c = [...i.options].slice(1).map((e) => {
		let t = Number(e.value), r = J(Aa(e.textContent ?? "", n), () => {
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
var Fa = /* @__PURE__ */ new WeakSet();
function Ia(e) {
	for (let t of e.compClass.compsClassLevelSelect) {
		if (!t?._isRadio || Fa.has(t)) continue;
		let e = t._list?.items ?? [], n = e[0]?.ele.closest(".ve-min-h-0");
		if (!n || !e.length) continue;
		Fa.add(t);
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
var La = {
	race: "种族",
	background: "背景",
	class: "职业",
	subclass: "子职业"
};
function Ra(e, t, n) {
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
function za(e, t, n, r) {
	let i = La[n.category], a = q("section", "p6-picker"), o = q("input", "p6-picker-search");
	o.type = "search", o.placeholder = `搜索${i}`, o.setAttribute("aria-label", o.placeholder);
	let s = q("div", "p6-picker-list"), c = q("p", "p6-picker-status");
	c.setAttribute("aria-live", "polite"), a.append(o, s, c);
	let l = /* @__PURE__ */ new Map(), u, d = () => e.getSelected() == null ? void 0 : Ra(n, e.getSelected(), r), f = () => {
		let t = e.getSelected();
		for (let [e, n] of l) n.setAttribute("aria-pressed", String(t === e)), n.dataset.preview = String(u?.value === e);
		a.dispatchEvent(new Event("p6-picker-change", { bubbles: !0 }));
	}, p = () => {
		let t = o.value.trim().normalize("NFKC").toLocaleLowerCase(), i = e._rdState.getAvailableOptionMetas().flatMap(({ value: e }) => e == null ? [] : Ra(n, e, r) ?? []).filter((e) => `${e.label.name} ${e.name} ${e.source}`.normalize("NFKC").toLocaleLowerCase().includes(t));
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
function Ba(e, t, n) {
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
			return n(za(this, e.wrp, u, t)), e;
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
var Va = globalThis, Ha = (e) => e.normalize("NFKC").toLocaleLowerCase();
function Ua(e, t) {
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
		let o = Va.SortUtil, s = [...new Set(e.flatMap((e) => this._getSetChoices(e)))].sort(o.ascSortLower);
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
				let n = Va.DataUtil.proxy.unpackUid("item", e, "item"), r = Va.UrlUtil.URL_TO_HASH_BUILDER.item(n), i = t.labels.item?.[r]?.name ?? Aa(n.name, t), a = J("", () => c(!0, e), "p6-picker-row");
				return a.dataset.uid = e, a.append(q("span", "", i), q("small", "p6-picker-source", n.source)), {
					row: a,
					term: Ha(`${i} ${n.name} ${n.source}`)
				};
			}), d = () => {
				let e = Ha(i.value.trim()), t = u.filter((t) => t.term.includes(e));
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
var Wa = [
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
function Ga(e) {
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
function Ka(e, t) {
	let { heading: n, title: r, brief: i, form: a, source: o, action: s } = e;
	e.focus(t);
	let c = t?.preview(), l = t?.chosen(), u = c && l?.value === c.value, d = t && La[t.category];
	if (n.hidden = !t, a.hidden = !!t && !u, i.hidden = !t, r.textContent = c?.label.name ?? (t ? `选择${d}` : ""), o.textContent = c?.source ?? "", s.hidden = !c, !c || !t) {
		delete i.dataset.entry, i.textContent = t ? "请从左栏选择一条资料。" : "";
		return;
	}
	s.textContent = u ? "取消选它" : "选它", s.disabled = t.disabled();
	let f = `${t.category}|${c.hash}`;
	i.dataset.entry !== f && (i.dataset.entry = f, i.textContent = "正在读取资料…", b({
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
function qa(e, t, n, r, i) {
	let a = e._tabs, o = new Map(a.map((e) => [e.name, Ga(e)])), s = new Set(Wa.flatMap((e) => e.shop ? [e.name, e.shop] : [e.name])), c = [...Wa, ...a.filter((e) => !s.has(e.name)).map((e) => ({
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
	let v = c[0], y = !1, b = !1, x = 0, ee, te = /* @__PURE__ */ new Map(), ne = J("下一步", () => ie(1), "p6-builder-btn p6-builder-primary"), S = J("上一步", () => ie(-1)), C = String(e._actor?.name ?? ""), re = J(C ? `创建「${C}」` : "创建人物", () => {
		k();
	}, "p6-builder-btn p6-builder-primary");
	h.append(S, ne, re);
	let w = new Map([...c, null].map((e) => {
		let t = J("", () => D(e), "p6-builder-tab");
		return t.append(q("i"), q("span", "", e?.label ?? "完成")), [e, t];
	}));
	d.append(q("span", "p6-builder-tab p6-builder-past", "✓ 名字"), ...w.values());
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
		let t = w.get(e);
		(t && t.offsetLeft + t.offsetWidth > d.scrollLeft + d.clientWidth || t && t.offsetLeft < d.scrollLeft) && (d.scrollLeft = t.offsetLeft);
	}
	function O() {
		let t = v && (y ? v.shop : v.name), n = t ? o.get(t) : void 0;
		for (let e of o.values()) e.tab.wrpTab.classList.toggle("p6-builder-inactive", e !== n);
		n && e.activeTab_ !== n.tab && (e.activeTab_ = n.tab), f.hidden = !!v, ne.hidden = !v, re.hidden = !!v, S.disabled = v === c[0];
		for (let [e, t] of [...p.children].entries()) t.setAttribute("aria-pressed", String(!!e === y));
		se();
	}
	function ae() {
		let t = Ea(e), r = q("dl", "p6-builder-summary"), i = q("div", "p6-builder-todo"), a = q("div", "p6-builder-todo");
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
	async function k() {
		if (b) return;
		let t = Ea(e), n = c.filter(T).find((e) => t.get(E(e))?.pending), r = t.get("装备商店");
		if (n || r?.pending) {
			let e = n ?? c.find((e) => e.shop);
			D(e), !n && r?.pending && (y = !0, O()), g.textContent = (n ? t.get(E(e))?.text : r?.text) ?? "";
		} else {
			b = !0, re.disabled = !0;
			try {
				await i();
			} catch (e) {
				g.textContent = e instanceof Error ? e.message : "作者建卡失败";
			} finally {
				b = !1, re.disabled = !1;
			}
		}
	}
	function se() {
		Ia(e);
		for (let e = n.length - 1; e >= 0; e--) n[e].anchor.isConnected || (n[e].element.remove(), n.splice(e, 1));
		let t = Ea(e), i = 1;
		m.textContent = t.get("法术")?.text ?? "本次可在下方选择法术";
		for (let [e, r] of w) {
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
		a.rail.hidden = !u, a.tab.wrpTab.classList.toggle("p6-builder-split", !!u), ee !== v && (ee = v, a.tab.wrpTab.dataset.view = u?.chosen() ? "card" : "list"), a.tab.wrpTab.classList.toggle("p6-builder-spells", v.label === "法术"), a.tab.wrpTab.classList.toggle("p6-builder-attributes", v.label === "属性值"), a.tab.wrpTab.classList.toggle("p6-builder-equipment", !!v.shop && !y), Ka(a, u), Ma(a.form, r), v.label === "属性值" && Pa(a.form, e, r);
	}
	function A() {
		x ||= requestAnimationFrame(() => {
			x = 0, se();
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
function Ja(e, t) {
	let n = e.ActorCharactermancer.Component.prototype, r = n._pRender, i = n._pHandleSaveClick_postSave, a = !1, o, s = !1, c, l = [], u = t ? Na(e, t) : void 0, d = t ? Ua(e.Charactermancer_AvailableEquipmentInfo, t) : void 0, f = t ? Ba(e, t, (e) => l.push(e)) : void 0;
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
			c?.(), c = qa(this, e, l, t, async () => {
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
var Y = globalThis, Ya = (e) => new Promise((t) => setTimeout(t, e));
function Xa(e) {
	return { nativeBuild: (t) => e([], async () => {
		let e = Y.game.modules.get("plutonium")?.api;
		if (typeof e?.charactermancer?.pOpen != "function") throw Error("这份 Plutonium 没有完整建卡器（需要本机私人完整版，放在 vendor/private/modules/plutonium/）");
		let n = Y.game.actors.get(t.id);
		if (!n) throw Error(`草稿人不在：${t.id}`);
		if (t.presentation && !Re) throw Error("当前私人完整版和分步建卡支持的版本不一致");
		await Y.ExcludeUtil.pInitialise(), await Y.ExcludeUtil.pSetList([...Y.ExcludeUtil.getList(), ...structuredClone(t.excludes)]);
		let r = new URL(".", location.href).href;
		if (await e.config.setValue("dataSources", "localHomebrew", t.brewFiles.map((e) => r + e)) === !1) throw Error("作者不让登记本战役自制包（dataSources.localHomebrew）");
		let i = JSON.stringify(n.toObject()), a = Re && Ja(Re, t.presentation), o = /* @__PURE__ */ new Set(), s = () => void 0, c = Y.Hooks.on("renderApplicationV2", (e) => {
			o.add(e);
		}), l = Y.Hooks.on("closeApplicationV2", (e) => {
			o.delete(e), o.size || s();
		});
		try {
			for (await e.charactermancer.pOpen({ actor: n }); await Ya(500), o.size;) await new Promise((e) => {
				s = e, o.size || e();
			});
		} finally {
			Y.Hooks.off("renderApplicationV2", c), Y.Hooks.off("closeApplicationV2", l), a?.close();
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
var X = globalThis, Za = class extends Error {
	request;
	constructor(e) {
		super("KERNEL_NEEDS_DICE"), this.request = e;
	}
}, Qa = class extends Error {
	where;
	constructor(e) {
		super("KERNEL_NEEDS_INPUT"), this.where = e;
	}
};
function $a(e, t) {
	let n = X.CONFIG.Dice, r = n.randomUniform, i = X.foundry.dice.terms.Die.prototype, a = Object.hasOwn(i, "roll"), o = i.roll, s = 0, c = 0;
	i.roll = function(...e) {
		return c = this.faces, o.apply(this, e);
	}, n.randomUniform = () => {
		if (s >= e.length) throw new Za({
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
		if (l(), e instanceof Za) return {
			used: s,
			needs: e.request
		};
		if (e instanceof Qa) return {
			used: s,
			input: e.where
		};
		throw e;
	});
}
async function eo(e) {
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
function to(e) {
	let t = X.foundry.applications.api.ApplicationV2.prototype, n = X.foundry.applications.sidebar?.AbstractSidebarTab, r = t.render;
	return t.render = function() {
		if (n && this instanceof n) return Promise.resolve(this);
		throw new Qa(this.constructor.name);
	}, e().finally(() => {
		t.render = r;
	});
}
function no(e) {
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
function ro(e) {
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
		({value: i, changes: a} = await eo(() => $a(e, () => r ? t() : to(t)).then(async (e) => (await C(), e))));
	} catch (e) {
		return {
			status: "error",
			error: e instanceof Error ? e.message : String(e),
			stack: e instanceof Error ? e.stack ?? null : null,
			changes: a
		};
	}
	let o = n.flatMap((e) => he(Z(e))), s = i.value;
	return {
		status: i.needs ? "missing" : i.input ? "pending" : s?.kernelStatus ?? (o.length ? "unsupported" : "complete"),
		result: s ?? null,
		sources: ro(a),
		changes: a,
		diceUsed: i.used,
		missing: i.needs ? { dice: i.needs } : i.missing ?? null,
		pending: i.input ? { input: i.input } : s?.pending ?? null,
		unsupported: o
	};
}
var io = be(Q, Z), ao = Ne(Q, Z), oo = At(Q), so = Or(Q, Z), co = Mr(Q, Z), lo = Fr(Q), uo = Hi(Q, Z, no), fo = Xi(Q, Z), po = Xr(Q), mo = Nn(Q), ho = Ta(Q, Z), go = Xa(Q), _o = { configure: !1 }, vo = 15e3, yo = { create: !1 }, bo = {
	...ho,
	...go,
	...io,
	...ao,
	...oo,
	...so,
	...co,
	...lo,
	...uo,
	...fo,
	...po,
	...mo,
	roll: (e, t = {}, n = [], r = {}) => Q(n, async () => {
		let n = {
			basic: X.CONFIG.Dice.BasicRoll,
			d20: X.CONFIG.Dice.D20Roll,
			damage: X.CONFIG.Dice.DamageRoll
		}, i = new (r.kind ? n[r.kind] : X.Roll)(e, t, r.options ? structuredClone(r.options) : void 0);
		return await i.evaluate({ allowInteractive: !1 }), no(i);
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
	save: (e, t, n = []) => Q(n, async () => (await Z(e).rollSavingThrow({ ability: t }, _o, yo))?.map(no) ?? null, [e]),
	skill: (e, t, n = []) => Q(n, async () => (await Z(e).rollSkill({ skill: t }, _o, yo))?.map(no) ?? null, [e]),
	attack: (e, t, n = []) => Q(n, async () => {
		let n = Z(e).items.get(t, { strict: !0 }).system.activities.find((e) => e.type === "attack");
		if (!n) return null;
		let r = await n.rollAttack({}, _o, yo), i = await n.rollDamage({}, _o, yo);
		return {
			attack: r?.map(no) ?? null,
			damage: i?.map(no) ?? null
		};
	}, [e]),
	attribution: (e, t) => Object.fromEntries(t.map((t) => [t, (Z(e)._prepareActiveEffectAttributions(t) ?? []).map((e) => ({
		label: e.label,
		mode: e.mode,
		value: e.value
	}))])),
	unsupported: () => X.game.actors.contents.flatMap((e) => he(e)),
	convert: async (e, t, n = {}) => {
		let r = await Ce(), i = {
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
				t = setTimeout(() => n(Error(`PROBE_TIMEOUT ${vo}`)), vo);
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
}, xo = (e) => e instanceof Error ? e.message : String(e);
async function So(t, n, r) {
	let i = (e) => e.pack.docIdLocal, a = /* @__PURE__ */ new Map();
	if (await r(t) === null) return {
		accepted: t,
		errors: a
	};
	let s = (r, i, a) => {
		let s = new Set(i), c = (r) => {
			if (!s.has(r)) {
				s.add(r);
				for (let i of e(r.pack)) {
					if (o(i, n, [...s].map((e) => e.pack))) continue;
					let e = t.find((e) => !a.has(e) && o(i, n, [e.pack]));
					e && c(e);
				}
			}
		};
		return c(r), t.filter((e) => s.has(e));
	}, c = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = await r(s(e, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set()));
		t !== null && (c.add(e), a.set(i(e), t));
	}
	let l = /* @__PURE__ */ new Set(), u = async (e) => {
		if (l.has(e)) return;
		let t = s(e, l, c), n = await r(t);
		if (n !== null) a.set(i(e), n);
		else {
			l = new Set(t);
			for (let e of t) a.delete(i(e));
		}
	};
	for (let e of t) c.has(e) || await u(e);
	for (let e of t) c.has(e) && await u(e);
	return {
		accepted: t.filter((e) => l.has(e)),
		errors: a
	};
}
async function Co(e, t) {
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
	], l = c.map((e) => o[e]), u = new Set(Object.values(r).filter((e) => typeof e?.pMergeCopy == "function")), { accepted: d, errors: f } = await So(e, new Set(Object.keys(i.SOURCE_JSON_TO_FULL).map((e) => e.toLowerCase())), async (e) => {
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
			return xo(e);
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
var wo = globalThis;
function To(e, t) {
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
function Eo(e) {
	if (!e || !Object.keys(e).length) return;
	let t = wo.fetch.bind(wo);
	wo.fetch = async (n, r) => {
		let i = typeof n == "string" ? n : n instanceof URL ? n.href : n.url, a = To(e, new URL(i, location.href));
		if (!a) return t(n, r);
		let o = await t(n instanceof Request ? new Request(a, n) : a, r);
		return o.status === 404 ? t(n, r) : o;
	};
}
// src/ui/styles/build-frame.css?inline
var Do = "html,body{color:var(--text);font-family:var(--font-sans);font-size:var(--fs-md);line-height:var(--lh-ui);--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;background:var(--bg)!important}@media (prefers-color-scheme:dark){html,body{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark}}body,.application,.window-app{--background:var(--surface);--color-header-background:var(--head-bg);--color-border:var(--line);--color-tabs-border:var(--line);--color-fieldset-border:var(--line);--color-form-hint:var(--text3);--color-form-hint-hover:var(--text2);--color-form-label:var(--text2);--color-form-label-hover:var(--text);--color-text-emphatic:var(--text);--color-text-primary:var(--text);--color-text-secondary:var(--text2);--color-text-subtle:var(--text3);--color-text-selection:var(--text);--color-text-selection-bg:var(--primary-tint);--table-background-color:var(--surface);--table-header-bg-color:var(--bg-sunk);--table-header-border-color:var(--line);--table-header-text-color:var(--text);--table-row-color-even:var(--bg-sunk);--table-row-color-odd:transparent;--table-row-color-highlight:var(--primary-tint);--content-link-background:var(--primary-tint);--content-link-border-color:var(--primary-tint-line);--content-link-text-color:var(--primary-text);--content-link-icon-color:var(--primary-text);--color-text-dark-primary:var(--text);--hotbar-height:0px;--color-scheme:light}@media (prefers-color-scheme:dark){body,.application,.window-app{--color-scheme:dark}}.application,.window-app{overflow:hidden;color-scheme:var(--color-scheme)!important;background:var(--surface)!important;color:var(--text)!important;font-family:var(--font-sans)!important;border:var(--border) solid var(--line)!important;border-radius:var(--r-lg)!important;box-shadow:var(--shadow-3)!important}.application .window-header,.window-app .window-header{min-height:var(--hit);background:var(--head-bg)!important;color:var(--head-ink)!important;border:0!important;border-bottom:var(--border) solid var(--head-line)!important;font-family:var(--font-sans)!important;font-size:var(--fs-md)!important;padding:0 var(--sp-3)!important}.window-title{font-family:var(--font-sans)!important;font-size:var(--fs-md)!important;font-weight:var(--fw-semibold)!important;color:inherit!important}.window-header button,.window-header .header-control,.window-header a{box-shadow:none!important;color:var(--head-ink2)!important;background:0 0!important;border:0!important;min-height:0!important}.window-header button:hover,.window-header .header-control:hover,.window-header a:hover{color:var(--head-ink)!important;background:var(--head-hover)!important}.window-content{background:var(--surface)!important;color:var(--text)!important;-webkit-backdrop-filter:none!important;font-family:var(--font-sans)!important;font-size:var(--fs-md)!important}.window-resize-handle{opacity:.5;filter:none!important}.ve-app-window,.ve-window,.ve-ui-modal__overlay,.ve-hwin,.ve-ui-tab-side__wrp-tab{background:var(--surface)!important;color:var(--text)!important}.window-content a{color:var(--primary-text)!important}.window-content hr{border:0!important;border-top:var(--border) solid var(--line)!important;background:0 0!important}.window-content h1,.window-content h2,.window-content h3,.window-content h4,.window-content h5{border:0;color:var(--text)!important;font-family:var(--font-sans)!important;text-shadow:none!important}.window-content table,.window-content th,.window-content td{color:var(--text)!important;border-color:var(--line)!important}.window-content button,.window-content .ve-btn{font:inherit;min-height:30px;padding:0 var(--sp-3);cursor:pointer;font-size:var(--fs-sm)!important;border:var(--border) solid var(--line-ctrl)!important;border-radius:var(--r-sm)!important;background:var(--surface)!important;color:var(--text)!important;box-shadow:none!important;text-shadow:none!important;background-image:none!important}.window-content button:hover,.window-content .ve-btn:hover{background:var(--bg-hover)!important}.window-content .ve-btn-primary,.window-content button.ve-btn-primary{background:var(--primary)!important;border-color:var(--primary)!important;color:var(--on-primary)!important}.window-content .ve-btn-primary:hover{background:var(--primary-hover)!important}.window-content .ve-btn.active,.window-content button.active{background:var(--primary-tint)!important;border-color:var(--primary-tint-line)!important;color:var(--primary-text)!important}.window-content button:disabled,.window-content .ve-btn:disabled{opacity:.5;cursor:default}.window-content input[type=text],.window-content input[type=number],.window-content input[type=search],.window-content select,.window-content textarea{font:inherit;min-height:30px;font-size:var(--fs-sm)!important;color:var(--text)!important;background:var(--surface)!important;border:var(--border) solid var(--line-ctrl)!important;border-radius:var(--r-sm)!important;box-shadow:none!important}.window-content input[type=checkbox],.window-content input[type=radio]{accent-color:var(--primary)}.window-content button:focus-visible,.window-content input:focus-visible,.window-content select:focus-visible,.window-content textarea:focus-visible{outline-offset:1px;outline:2px solid var(--focus)!important}.window-content .ve-muted,.window-content .ve-text-muted{color:var(--text2)!important}", Oo = ".application.trpg-main{box-shadow:none!important;border:0!important;border-radius:0!important}.application.trpg-main>.window-header{display:none!important}.application.trpg-main>.window-content{padding:0!important}.application:not(.trpg-main)>.window-header{min-height:52px;background:var(--surface)!important;color:var(--text)!important;border-bottom:var(--border) solid var(--line)!important;padding:0 var(--sp-3) 0 var(--sp-5)!important}.application:not(.trpg-main) .window-title{font-size:var(--fs-xl)!important}.window-header [data-action=close]{border-radius:var(--r-sm);width:32px;height:32px;color:var(--text2)!important;font-size:0!important}.window-header [data-action=close]:before{content:\"✕\";font:16px/1 var(--font-sans)}.window-header [data-action=close]:hover{background:var(--bg-hover)!important;color:var(--text)!important}.ve-ui-tab__wrp-tab-heads--border{gap:var(--sp-1);counter-reset:trpg-step;flex-wrap:wrap;padding:var(--sp-3) var(--sp-4)!important;border:0!important;border-bottom:var(--border) solid var(--line)!important;background:var(--surface)!important;display:flex!important}.window-content .ve-ui-tab__btn-tab-head{counter-increment:trpg-step;align-items:center;gap:var(--sp-2);min-height:32px!important;padding:0 var(--sp-3)!important;border-radius:var(--r-pill)!important;color:var(--text2)!important;font-size:var(--fs-sm)!important;background:0 0!important;border:0!important;width:auto!important;transition:none!important;display:inline-flex!important}.window-content .ve-ui-tab__btn-tab-head:before{content:counter(trpg-step);border:var(--border) solid var(--line-ctrl);width:20px;height:20px;font-size:var(--fs-xs);border-radius:50%;place-items:center;display:inline-grid}.window-content .ve-ui-tab__btn-tab-head:hover{background:var(--bg-hover)!important}.window-content .ve-ui-tab__btn-tab-head.ve-active{font-weight:var(--fw-semibold);background:var(--primary)!important;color:var(--on-primary)!important}.window-content .ve-ui-tab__btn-tab-head.ve-active:before{border-color:currentColor}.window-content hr.ve-hr-1.ve-w-100:has(+.ve-flex-h-right){display:none}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary){gap:var(--sp-2);border-top:var(--border) solid var(--line-ctrl);padding:var(--sp-3) var(--sp-4)!important;background:var(--bg-side)!important}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary) .ve-btn{font-weight:var(--fw-semibold);min-height:var(--hit)!important;padding:0 var(--sp-5)!important;font-size:var(--fs-md)!important}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary) .ve-btn-group{gap:var(--sp-2)}.window-content .ve-flex-h-right.ve-no-shrink:has(>.ve-btn-primary) .ve-vr-2{display:none}.window-content .ve-flex-col:has(>hr.ve-hr-2:first-child){padding:var(--sp-3) 0;border:0;border-top:var(--border) solid var(--line);border-radius:0;margin:0;background:0 0!important}.window-content .ve-flex-col>hr.ve-hr-2:first-child{display:none}.window-content .ve-bold{font-weight:var(--fw-semibold)}.window-content .veapp__bg-foundry{background:var(--surface)!important}.window-content .stripe-even,.window-content .stripe-odd,.window-content .stripe-odd-table tr,.window-content .ve-cls-tbl__stripe-odd,.window-content .stripe-odd-table tbody tr:nth-child(odd){background:0 0!important}.window-content input[type=checkbox],.window-content input[type=radio]{accent-color:var(--primary);margin:0;appearance:auto!important;background:0 0!important;border:0!important;width:16px!important;height:16px!important}.window-content input[type=checkbox]:before,.window-content input[type=checkbox]:after,.window-content input[type=radio]:before,.window-content input[type=radio]:after{content:none!important;display:none!important}:is(.window-content label:not(.p6-choice-option):has(>label>input[type=checkbox]),.window-content label:not(.p6-choice-option):has(>label>input[type=radio])){margin:0 0 var(--sp-1);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);cursor:pointer;padding:var(--sp-1) var(--sp-2)!important;background:var(--surface)!important}.window-content label:not(.p6-choice-option):has(>label>input:checked){border-color:var(--primary);background:var(--primary-tint)!important}.window-content .veapp__list-row,.window-content .manc__list-row{border-bottom:var(--border) solid var(--line);align-items:center;min-height:36px;background:var(--surface)!important}.window-content .veapp__list-row-hoverable:hover,.window-content .manc__list-row:hover{background:var(--bg-hover)!important}.window-content .veapp__list-row:has(input:checked){box-shadow:inset 3px 0 0 var(--primary);font-weight:var(--fw-semibold);background:var(--primary-tint)!important}:is(.window-content .ve-input-group:has(>.ve-btn-5et)>.ve-btn,.window-content .sortlabel .ve-btn,.window-content .ve-btn.sort){font-weight:var(--fw-semibold);background:var(--bg-sunk)!important;border-color:var(--line)!important;color:var(--text2)!important;font-size:var(--fs-xs)!important;border-radius:0!important}.window-content .manc-sp__btn-learn-spell,.window-content .manc-sp__btn-prepare,.window-content .ve-fltr__mini-pill{border-radius:var(--r-sm)!important}.window-content .manc-sp__btn-learn-spell.ve-active,.window-content .manc-sp__btn-prepare.ve-active,.window-content .ve-btn.ve-active:not(.ve-ui-tab__btn-tab-head){background:var(--primary)!important;border-color:var(--primary)!important;color:var(--on-primary)!important}.window-content .ve-fltr__mini-pill{background:var(--primary-tint)!important;border:var(--border) solid var(--primary-tint-line)!important;color:var(--primary-text)!important}.window-content .ve-ui-sel2__ipt-display,.window-content .ve-ui-sel2__ipt-search{min-height:var(--hit)!important;padding:0 var(--sp-3)!important;background:var(--surface)!important;color:var(--text)!important;font-size:var(--fs-md)!important}.window-content .ve-ui-sel2__wrp-options{border-radius:var(--r-sm);box-shadow:var(--shadow-2);z-index:20;background:var(--surface)!important;border:var(--border) solid var(--line-ctrl)!important}.window-content .ve-ui-sel2__disp-option{border-bottom:var(--border) solid var(--line);min-height:40px;font-weight:var(--fw-semibold);padding:0 var(--sp-4)!important;background:var(--surface)!important;color:var(--text)!important}.window-content .ve-ui-sel2__disp-option:hover,.window-content .ve-ui-sel2__disp-option:focus{box-shadow:inset 3px 0 0 var(--primary);outline:0;background:var(--bg-hover)!important}.window-content .ve-rd__h,.window-content .entry-title-inner,.window-content .ve-rd__h .entry-title-inner{font-family:var(--font-sans)!important;font-variant:normal!important;font-weight:var(--fw-semibold)!important;letter-spacing:0!important;color:var(--text)!important}.window-content table th,.window-content .ve-rd__table thead th,.window-content .ve-cls-tbl th{font-weight:var(--fw-semibold);font-size:var(--fs-xs);background:var(--bg-sunk)!important;color:var(--text2)!important}.window-content table td,.window-content table th{padding:var(--sp-1) var(--sp-2);border:0!important;border-bottom:var(--border) solid var(--line)!important}.window-content table{background:var(--surface)!important;color:var(--text)!important;font-family:var(--font-sans)!important;border-color:var(--line)!important}.window-content table tr{background:0 0!important}.window-content .ve-tbl-border{background:var(--line)!important}.window-content .ve-stats__th-name{background:var(--surface)!important;border-bottom:var(--border) solid var(--line)!important}.window-content .ve-stats__h-name{font-family:var(--font-sans)!important;font-variant:normal!important;font-size:var(--fs-lg)!important;font-weight:var(--fw-semibold)!important;color:var(--text)!important}.window-content .ve-stats__wrp-h-source,.window-content .ve-stats__wrp-h-source a{font-family:var(--font-sans)!important;font-size:var(--fs-xs)!important;color:var(--text3)!important}.application.trpg-main .ve-ui-tab__wrp-tab-body{padding:var(--sp-3) var(--sp-4)!important;background:var(--surface)!important;border:0!important}.window-content input[readonly],.window-content input:disabled{background:var(--bg-sunk)!important;border-color:var(--line)!important;color:var(--text2)!important}", ko = ".p6-builder{width:100%;height:100%;min-height:0;font-family:var(--font-sans);flex-direction:column;display:flex}.p6-builder [hidden],.p6-builder .p6-builder-inactive{display:none!important}.p6-builder-nav{align-items:center;gap:var(--sp-1);padding:var(--sp-3) var(--sp-4);border-bottom:var(--border) solid var(--line);flex:none;display:flex;overflow-x:auto}.p6-builder button.p6-builder-tab,.p6-builder button.p6-builder-btn,.p6-builder button.p6-picker-row{color:var(--text);background:var(--surface);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);min-height:var(--hit);padding:0 var(--sp-3);font:inherit;cursor:pointer;transition:none}.p6-builder button.p6-builder-btn:hover,.p6-builder button.p6-builder-tab:hover,.p6-builder button.p6-picker-row:hover{background:var(--bg-hover)}.p6-builder .p6-builder-tab{align-items:center;gap:var(--sp-2);white-space:nowrap;flex:none;display:inline-flex}.p6-builder button.p6-builder-tab{min-height:32px;color:var(--text2);font-size:var(--fs-sm);border-radius:var(--r-pill)!important;background:0 0!important;border-color:#0000!important}.p6-builder button.p6-builder-tab:hover{background:var(--bg-hover)!important}.p6-builder-tab i{border:var(--border) solid var(--line-ctrl);border-radius:50%;place-items:center;width:20px;height:20px;font-style:normal;display:inline-grid}.p6-builder .p6-builder-tab[data-done=true] i{background:var(--primary);color:var(--on-primary);border-color:var(--primary)}.p6-builder .p6-builder-past{padding:0 var(--sp-3);color:var(--text2);font-size:var(--fs-sm)}.p6-builder button.p6-builder-tab[aria-current],.p6-builder button.p6-builder-primary,.p6-builder button.p6-builder-btn[aria-pressed=true]{background:var(--primary)!important;color:var(--on-primary)!important}.p6-builder button.p6-builder-tab[aria-current] i{border-color:currentColor}.p6-builder button:disabled{cursor:not-allowed}.p6-builder button.p6-builder-btn:disabled{opacity:.55}.p6-builder .p6-builder-step{flex-direction:column;flex:1;min-height:0;display:flex;overflow:hidden;padding:0!important}.p6-builder .p6-builder-split:not(.p6-builder-inactive){grid-template-columns:minmax(175px,5fr) minmax(0,7fr);display:grid!important}.p6-builder-panel{flex-direction:column;min-width:0;min-height:0;display:flex;overflow:auto}.p6-native-body{padding:var(--sp-3) var(--sp-4);min-width:0}.p6-builder-selection{align-items:center;gap:var(--sp-2);padding:var(--sp-2) var(--sp-3);z-index:2;background:var(--surface);border-bottom:var(--border) solid var(--line);flex-wrap:wrap;flex:none;display:flex;position:sticky;top:0}.p6-builder-selection-title{min-width:4em;font-size:var(--fs-lg);font-weight:var(--fw-semibold);flex:1;margin:0}.p6-builder-selection .p6-builder-btn{min-height:32px!important}.p6-builder-split .p6-native-body>.ve-flex{flex-direction:column;height:auto!important}.p6-builder-split .p6-native-body>.ve-flex>.ve-flex-col{width:100%!important;overflow:visible!important}.p6-builder-split .p6-native-body>.ve-flex>.ve-vr-1{display:none!important}.p6-builder-split .p6-native-body>.ve-flex:has(>.ve-vr-1)>.ve-vr-1+.ve-flex-col{display:none!important}.p6-builder-rail{border-right:var(--border) solid var(--line);min-width:0;min-height:0}.p6-picker{flex-direction:column;height:100%;min-height:0;display:flex}.p6-picker-search{min-height:var(--hit);width:auto;margin:var(--sp-3) var(--sp-4) var(--sp-2);color:var(--text);background:var(--surface);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);flex:none}.p6-picker-list{flex-direction:column;flex:1;min-height:0;display:flex;overflow:auto}.p6-builder button.p6-picker-row{justify-content:space-between;align-items:center;gap:var(--sp-2);text-align:left;flex:none;width:100%;display:flex;border:0!important;border-bottom:var(--border) solid var(--line)!important;border-radius:0!important}.p6-builder button.p6-picker-row[data-preview=true]{background:var(--primary-tint)!important;box-shadow:inset 2px 0 var(--accent)!important}.p6-builder .p6-picker-row[aria-pressed=true] .p6-picker-source:before{content:\"✓\";margin-right:var(--sp-2);color:var(--text)}.p6-picker-source,.p6-picker-status{color:var(--text2);font-size:var(--fs-xs)}.p6-picker-status{padding:var(--sp-2) var(--sp-4);flex:none;margin:0}.p6-builder-footer{justify-content:flex-end;align-items:center;gap:var(--sp-2);padding:var(--sp-3) var(--sp-4);background:var(--bg-side);border-top:var(--border) solid var(--line);flex-wrap:wrap;flex:none;display:flex}.p6-builder-hint{color:var(--text2);font-size:var(--fs-xs);margin-right:auto}.p6-builder-feedback{color:var(--danger-text);flex-basis:100%;margin:0}.p6-builder-feedback:empty{display:none}.p6-builder-switch{gap:var(--sp-2);padding:var(--sp-2) var(--sp-4);border-bottom:var(--border) solid var(--line);display:flex}.p6-builder-review{min-height:0;padding:var(--sp-4) var(--sp-5);flex:1;overflow:auto}.p6-builder-review h2{margin:0 0 var(--sp-4);font-size:var(--fs-xl)}.p6-builder-summary{gap:var(--sp-2) var(--sp-3);grid-template-columns:minmax(64px,100px) 1fr;margin:0;display:grid}.p6-builder-summary dt{color:var(--text2)}.p6-builder-summary dd{margin:0}.p6-builder-todo{margin-top:var(--sp-4);padding:var(--sp-3);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);background:var(--warn-bg)}.p6-builder-todo-row{justify-content:space-between;gap:var(--sp-2);padding-top:var(--sp-2);align-items:center;display:flex}.p6-level{justify-content:space-between;align-items:center;gap:var(--sp-2);padding:var(--sp-1) 0;display:flex}.p6-level select{width:auto;min-height:34px;padding:0 var(--sp-3)}.p6-choice-progress{color:var(--accent-text);width:100%}.p6-choice-progress[data-done=true]{color:var(--success-text)}.p6-builder button[title]:has(>.fa-magnifying-glass:only-child){width:auto!important;padding-inline:var(--sp-2)!important}.p6-builder button[title]:has(>.fa-magnifying-glass:only-child):after{content:attr(title)}.window-content button.ve-btn-xxs:has(>.fa-check:only-child){width:auto!important;padding-inline:var(--sp-2)!important}.window-content button.ve-btn-xxs:has(>.fa-check:only-child):after{content:\"选择\"}.p6-builder-spells .p6-native-body>.ve-flex{flex-direction:column;height:auto!important}.p6-builder-spells .p6-native-body>.ve-flex>.ve-flex-col{flex:none!important;height:auto!important;overflow:visible!important}.p6-builder-spells .p6-native-body>.ve-flex>.ve-vr-1,.p6-builder-spells .manc__list-row>:is(:nth-child(2),:nth-child(3),:nth-child(4),:nth-child(5),:nth-child(6)){display:none!important}.p6-builder-spells .p6-native-body .manc__list:has(.manc__list-row)~.ve-input-group{display:none!important}.p6-builder-spells .manc__list-row{gap:var(--sp-2);min-height:var(--hit);justify-content:space-between}.p6-builder-spells .manc__list-row>:first-child{flex:1;width:auto!important}.p6-builder-spells .manc__list-row>:nth-child(7){flex:0 0 4.5em;text-align:right!important;width:auto!important}.p6-builder-spells .manc__list-row>:last-child{gap:var(--sp-1);flex:none;display:flex;width:auto!important}@media (width<=520px){.p6-builder-rail{border-right:0}.p6-builder-nav,.p6-builder-footer,.p6-builder-review{padding-inline:var(--sp-3)}.p6-builder-attributes .p6-native-body{padding-inline:var(--sp-2);overflow-x:auto}.p6-builder-attributes .ve-statgen-pb__cell{min-width:0!important}.p6-builder-attributes .ve-statgen-shared__ipt:not(.ve-statgen-pb__ipt-budget){width:41px!important;padding-inline:var(--sp-1)!important}.p6-builder-attributes select.ve-statgen-shared__ipt{appearance:none;text-align:center;padding-inline:0!important}}.p6-choice-instruction{display:none!important}.p6-ability-methods{gap:var(--sp-1);flex-wrap:wrap;display:flex}.p6-builder-attributes .ve-statgen-shared__wrp-header{gap:var(--sp-3);flex-wrap:wrap}.p6-builder-attributes:not([data-mode=pointbuy]) .ve-mobile-sm__flex-col.ve-mb-2:has(.ve-statgen-pb__ipt-budget){display:none!important}.p6-builder [onmouseover*=Renderer\\.hover],.p6-builder [onclick*=Renderer\\.hover]{pointer-events:none!important;color:inherit!important;cursor:inherit!important;text-decoration:none!important}.p6-builder .veapp__btn-filter,.p6-builder .ve-fltr__mini-view{display:none!important}.p6-builder button:has(>.glyphicon-filter){display:none!important}.p6-builder button:has(>.glyphicon-resize-small){display:none!important}.p6-builder .ve-btn-group:has(>button>.glyphicon-refresh){display:none!important}:is(.p6-builder .ve-btn-group:has(.ve-ui-sel2__wrp[style*=none]),.p6-builder .ve-bold:has(+.ve-btn-group .ve-ui-sel2__wrp[style*=none])){display:none!important}.p6-builder-spells .manc__list-row>:nth-child(7),.p6-builder-spells .manc__list-row>:nth-child(7) *{font-size:var(--fs-xs);color:var(--text3)!important}.p6-builder-card{padding:var(--sp-3) var(--sp-4) var(--sp-5);border-top:var(--border) solid var(--line);color:var(--text);font-size:var(--fs-sm);line-height:1.65}.p6-builder-card>table{width:100%;border:0!important}.p6-builder-card td,.p6-builder-card th{padding:var(--sp-1) 0!important;border:0!important}.p6-builder-card-note{margin:0 0 var(--sp-2);color:var(--text2)}.p6-builder .p6-choice-group{align-items:center;gap:var(--sp-2);flex-wrap:wrap;background:0 0!important;border:0!important;height:auto!important;min-height:0!important;padding:0!important;display:flex!important;overflow:visible!important}.p6-builder .p6-choice-group>:not(.p6-choice-option){flex-basis:100%;width:100%!important}.p6-builder .p6-choice-group>hr{margin:var(--sp-1) 0}.p6-builder .p6-choice-progress{color:var(--accent-text);font-size:var(--fs-xs)}.p6-builder .p6-choice-progress[data-done=true]{color:var(--success-text)}.p6-builder .p6-choice-option{white-space:nowrap;align-items:center;gap:var(--sp-1);border-radius:var(--r-sm);min-height:36px;color:var(--text);cursor:pointer;flex:none;position:relative;width:auto!important;padding:0 var(--sp-3)!important;border:var(--border) solid var(--line-ctrl)!important;background:var(--surface)!important;justify-content:flex-start!important;margin:0!important;display:inline-flex!important}.p6-builder .p6-choice-option>label:has(>input){clip-path:inset(50%);margin:0;padding:0;overflow:hidden;width:1px!important;height:1px!important;position:absolute!important}.p6-builder .p6-choice-option>div,.p6-builder .p6-choice-option .ve-w-100{white-space:nowrap;flex:none!important;width:auto!important;max-width:none!important;padding:0!important}.p6-builder .p6-choice-option .ve-help{border-bottom:0!important;text-decoration:none!important}.p6-builder .p6-choice-option:hover{background:var(--bg-hover)!important}.p6-builder .p6-choice-option:has(input:checked){color:var(--on-primary);background:var(--primary)!important;border-color:var(--primary)!important}.p6-builder .p6-choice-option:has(input:checked):before{content:\"✓\";font-size:var(--fs-xs)}.p6-builder .p6-choice-option:has(input:checked) .ve-muted{opacity:.8;color:inherit!important}.p6-builder .p6-choice-option:has(input:disabled):not(:has(input:checked)){color:var(--disabled-text);cursor:not-allowed;background:var(--disabled-bg)!important}.p6-builder .p6-choice-option:has(input:focus-visible){outline:2px solid var(--focus);outline-offset:2px}.p6-builder .p6-choice-option .veapp__msg-warning:empty{display:none}.p6-builder .p6-choice-option .veapp__msg-warning:has(.fa-check){display:none!important}.p6-builder .p6-choice-option:has(.veapp__msg-warning .fa-check):after{content:\"已有\";margin-left:var(--sp-1);color:var(--text3);font-size:var(--fs-xs)}.p6-builder-equipment .imp-cls__wrp-equi-group{gap:var(--sp-2);padding:var(--sp-3) 0!important;border:0!important;border-top:var(--border) solid var(--line)!important;background:0 0!important;margin:0!important}.p6-builder-equipment .imp-cls__wrp-equi-group>div{min-height:var(--hit);padding:var(--sp-2) var(--sp-3) var(--sp-2) 40px;border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);background:var(--surface);position:relative;justify-content:flex-start!important}.p6-builder-equipment .imp-cls__wrp-equi-group>div:has(>.ve-active){border-color:var(--primary);background:var(--primary-tint)}.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key,.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key.ve-active{z-index:0;inset:0;border-radius:var(--r-sm)!important;color:#0000!important;width:auto!important;height:auto!important;box-shadow:none!important;background:0 0!important;border:0!important;margin:0!important;font-size:0!important;position:absolute!important}.p6-builder-equipment .imp-cls__disp-equi-choice-key:before{content:\"\";left:var(--sp-3);border:2px solid var(--line-ctrl);box-sizing:border-box;border-radius:50%;width:16px;height:16px;margin-top:-8px;position:absolute;top:50%}.p6-builder-equipment .imp-cls__disp-equi-choice-key.ve-active:before{border:5px solid var(--primary)}.p6-builder-equipment .imp-cls__disp-equi-choice-key:focus-visible{outline:2px solid var(--focus)!important}.p6-builder-equipment .imp-cls__wrp-equi-group>div>.ve-w-100{z-index:1;pointer-events:none;position:relative}.p6-builder-equipment .imp-cls__wrp-equi-group>div>.ve-w-100 :is(button,input,select){pointer-events:auto}.p6-builder-equipment .imp-cls__wrp-equi-group>div:has(>.imp-cls__disp-equi-choice-key:disabled){padding-left:var(--sp-3);border-color:var(--line);background:var(--bg-sunk)}.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key:disabled{visibility:hidden!important;display:none!important}.p6-builder-equipment .imp-cls__wrp-equi-group .ve-btn.imp-cls__disp-equi-choice-key:disabled:before{content:none!important}.p6-builder-equipment button:has(>.fa-magnifying-glass){align-items:center;gap:var(--sp-1);min-height:32px;width:auto!important;padding:0 var(--sp-2)!important;border:var(--border) solid var(--line-ctrl)!important;border-radius:var(--r-sm)!important;background:var(--surface)!important;color:var(--text)!important;display:inline-flex!important}.p6-builder-equipment button:has(>.fa-magnifying-glass)>.fa-magnifying-glass{display:none}.p6-builder-equipment button:has(>.fa-magnifying-glass):after{content:attr(title) \" ▾\"!important}.p6-equip-picker{z-index:30;pointer-events:auto;background:var(--surface);border:var(--border) solid var(--line-ctrl);border-radius:var(--r-sm);width:min(340px,100%);box-shadow:var(--shadow-2);flex-direction:column;display:flex;position:absolute;top:calc(100% + 4px);left:0}.p6-builder-equipment .imp-cls__wrp-equi-group>div>.ve-w-100:has(.p6-equip-picker){z-index:20}.p6-equip-picker .p6-picker-search{margin:var(--sp-2)}.p6-equip-picker-list{border-top:var(--border) solid var(--line);max-height:220px;overflow:auto}.p6-builder button.p6-equip-picker-clear{min-height:32px;margin:var(--sp-1) var(--sp-2);padding:0 var(--sp-2);color:var(--primary-text);font:inherit;font-size:var(--fs-sm);cursor:pointer;background:0 0;border:0;align-self:flex-start}.p6-builder-to-list{display:none}@media (width<=520px){.p6-builder .p6-builder-split:not(.p6-builder-inactive){grid-template-rows:minmax(0,1fr)!important;grid-template-columns:1fr!important}.p6-builder-split[data-view=list]>.p6-builder-panel,.p6-builder-split[data-view=card]>.p6-builder-rail{display:none!important}.p6-builder-split .p6-builder-rail{border-bottom:0}.p6-builder button.p6-builder-to-list{color:var(--primary-text);align-items:center;display:inline-flex;padding:0 var(--sp-1)!important;background:0 0!important;border:0!important}}", Ao = globalThis;
function jo(e = [
	f,
	u,
	Do,
	Oo,
	ko
]) {
	return e.join("\n").replace(/:host\b/g, ":root").replace(/^\s*all:\s*initial;\s*$/m, "").replace(/^\s*pointer-events:\s*inherit;.*$/m, "");
}
var Mo = JSON.stringify({ colorScheme: {
	applications: "",
	interface: ""
} });
function No(e) {
	return new Promise((t) => {
		let n = Object.assign(document.createElement("link"), {
			rel: "stylesheet",
			href: e
		});
		n.onload = n.onerror = () => t(), document.head.append(n);
	});
}
var Po = [
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
function Fo(e) {
	for (let t of Array.from(e)) {
		let e = t.style;
		if (e) {
			e.backgroundImage?.includes("url(") && (e.backgroundImage = "none");
			for (let t of Po) e.getPropertyPriority(t) === "important" && e.setProperty(t, e.getPropertyValue(t));
		}
		let n = t.cssRules;
		n && Fo(n);
	}
}
function Io(e) {
	let t = (e) => Array.from(e).some((e) => e.selectorText === ".ve-hidden"), n = Array.from(e.cssRules).filter((e) => typeof CSSLayerBlockRule < "u" && e instanceof CSSLayerBlockRule), r = new Set(n.filter((e) => t(e.cssRules)).map((e) => e.name));
	for (let e of r) {
		let t = n.filter((t) => t.name === e).at(-1);
		t?.insertRule(".ve-hidden { display: none !important; }", t.cssRules.length);
	}
	t(e.cssRules) && e.insertRule(".ve-hidden { display: none !important; }", e.cssRules.length);
}
var Lo = 0, Ro = 160, zo = () => Math.max(Ro, document.documentElement.clientHeight - Ro), Bo = /* @__PURE__ */ new WeakSet();
function Vo(e) {
	e.setPosition({
		left: Lo,
		top: Lo,
		width: innerWidth - 0,
		height: innerHeight - 0
	});
}
function Ho() {
	Ao.Hooks.on("renderApplicationV2", (e, t, n, r) => {
		r?.isFirstRender && e?.options?.window?.resizable && (Math.abs(Number(e.position?.height) - zo()) > 2 || (Bo.add(e), e.element?.classList.add("trpg-main"), Vo(e)));
	});
	let e = 0;
	addEventListener("resize", () => {
		clearTimeout(e), e = setTimeout(() => {
			for (let e of Ao.foundry.applications.instances.values()) e.rendered && Bo.has(e) && Vo(e);
		}, 150);
	});
}
async function Uo(e, t) {
	Ho();
	let n = [Ao.game.system, ...Ao.game.modules.filter((e) => e.active)].flatMap((e) => [...e.styles ?? []].map((e) => String(e.src ?? e))), r = [...e.styles, ...n].map((e) => {
		let n = new URL(e, location.href);
		return (To(t, n) ?? n).href;
	}), i = new Set(e.styles.map((e) => new URL(e, location.href).href)), a = r.map(async (e) => {
		if (await No(e), i.has(e)) return;
		let t = [...document.styleSheets].find((t) => t.href === e);
		t && (Fo(t.cssRules), Io(t));
	}), o = document.createElement("style");
	o.dataset.trpgTheme = "build", o.textContent = jo(), document.head.append(o), new MutationObserver(() => {
		document.head.lastElementChild !== o && document.head.append(o);
	}).observe(document.head, { childList: !0 }), await Promise.all(a);
}
// src/rules/kernel/frame/main.ts
var $ = globalThis, Wo = new URLSearchParams(location.search).get("frame") ?? "", Go = $.__trpgFrameErrors ?? [];
async function Ko(e) {
	let t = await fetch(new URL(e, location.href));
	if (!t.ok) throw Error(`${t.status}: ${e}`);
	return t.text();
}
async function qo(e) {
	let t = await b({
		op: "file",
		path: `packs/${e}.json`
	});
	if (typeof t != "string") throw Error(`Pack is not available: ${e}`);
	return JSON.parse(t);
}
var Jo;
async function Yo(e) {
	if (Jo) throw Error("Kernel is already booted");
	let t = [], { foundry: n, Hooks: r } = $;
	k(e.seed ?? "kernel"), Eo(e.moduleRoots), $.release = new n.config.ReleaseData(e.release);
	let i = te(e);
	$.packages = {
		System: new n.utils.Collection([[i.system.id, new n.packages.System(i.system)]]),
		Module: new n.utils.Collection(i.modules.map((e) => [e.id, new n.packages.Module(e)]))
	};
	let a = $.io({
		autoConnect: !1,
		forceNew: !0
	});
	Jo = {
		...re(a, {
			userId: e.userId,
			worldTime: e.worldTime,
			readPack: qo,
			readText: Ko
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
	}, $.game.nue && ($.game.nue.initialize = () => void 0), $.game.settings.storage.get("client").setItem("core.noCanvas", "true"), e.display && $.game.settings.storage.get("client").setItem("core.uiConfig", Mo), await $o(`systems/${i.system.id}/dnd5e.js`);
	let c = !!e.moduleRoots?.plutonium && e.language === "zh.core";
	for (let e of i.modules) for (let t of e.esmodules ?? []) await ze(new URL(t, location.href), c);
	r.once("init", ti), r.once("setup", () => {
		$.CONFIG.DND5E?.calendar && ($.CONFIG.DND5E.calendar.application = null), me();
	}), await $.game.initialize(), e.display && await Uo(e.display, e.moduleRoots);
	let l = Date.now() + 3e4;
	for (; i.modules.some((e) => e.id === "plutonium") && typeof $.game.modules.get("plutonium")?.api != "object";) {
		if (Date.now() > l) throw Error("Plutonium API was not ready within 30 seconds");
		await new Promise((e) => setTimeout(e, 50));
	}
	return Xo();
}
function Xo() {
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
		errors: [...Go]
	};
}
function Zo() {
	return $.game.actors.contents.map((e) => ({
		source: e.toObject(),
		system: e.system.toObject(!1),
		name: e.name,
		validation: e.validationFailures
	}));
}
var Qo = {
	...bo,
	boot: Yo,
	loadBrews: Co,
	status: Xo,
	preparedActors: Zo,
	reserveActorIds: (e) => {
		if (!Jo) throw Error("Kernel is not booted");
		Jo.reserve(e);
	},
	changes: () => Jo?.changes ?? [],
	calls: () => Jo?.calls ?? [],
	steps: () => Jo?.steps ?? []
};
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "call") return;
	let n = (e) => parent.postMessage({
		channel: g,
		type: "result",
		frame: Wo,
		id: t.id,
		...e
	}, location.origin), r = Qo[t.fn];
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
function $o(e) {
	return new Promise((t, n) => {
		let r = document.createElement("script");
		r.src = e, r.onload = () => t(), r.onerror = () => n(Error(`Failed to load ${e}`)), document.head.append(r);
	});
}
async function es() {
	$.SIGNED_EULA = !0, $.ROUTE_PREFIX = new URL(".", location.href).pathname.replace(/^\/+|\/+$/g, ""), $.MESSAGES = null, await import(
		/* @vite-ignore */
		new URL("scripts/foundry.mjs", location.href).href
);
	let e = {
		channel: g,
		type: "ready",
		frame: Wo,
		codeSet: "foundry",
		authorVersion: $.foundry?.CONST?.vtt ?? null,
		present: { foundry: !!$.foundry?.Game },
		errors: [...Go]
	};
	parent.postMessage(e, location.origin);
}
document.readyState === "complete" ? es() : addEventListener("load", () => {
	es();
}, { once: !0 });
