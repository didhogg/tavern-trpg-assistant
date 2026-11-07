import { t as e } from "./protocol-03CO7Rhf.js";
// src/rules/kernel/packages.ts
var t = [
	"esmodules",
	"scripts",
	"styles"
];
function n(e, n) {
	let r = `${n}s/${e.id}/`, i = (e) => /^(?:[a-z]+:)?\/\//i.test(e) || e.startsWith(r) ? e : r + e.replace(/^\.?\//, ""), a = structuredClone(e);
	for (let e of t) {
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
function r(e) {
	let { CONST: t, CONFIG: r, foundry: i } = globalThis, a = n(e.system, "system"), o = e.modules.map((e) => ({
		...n(e, "module"),
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
		let n = /* @__PURE__ */ new Set([
			"base",
			...Object.keys(r[e]?.dataModels ?? {}),
			...Object.keys(r[e]?.typeLabels ?? {}),
			...Object.keys(a.documentTypes?.[e] ?? {}),
			...e === "Folder" ? t.FOLDER_DOCUMENT_TYPES : []
		]);
		return [e, Object.fromEntries([...n].map((e) => [e, {}]))];
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
function i(e, t) {
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
function a(e, t) {
	let n = globalThis, r = [], a = [], o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), c = 0, l = e.emit.bind(e), u = async (e) => o.get(e) ?? t.readPack(e);
	async function d(e) {
		let t = e.operation, n = t.pack ?? null;
		if (e.action === "get") {
			if (!n) return [];
			let e = t.query ?? {};
			if (Object.keys(e).some((e) => e !== "_id")) throw Error(`Unsupported pack query: ${JSON.stringify(e)}`);
			let r = await u(n), a = e._id ? r.filter((t) => t._id === e._id) : r;
			if (!t.index) return structuredClone(a);
			if (!Array.isArray(t.indexFields)) throw Error("Official index request has no fields");
			return a.map((e) => i(e, t.indexFields));
		}
		if (n && !o.has(n)) throw Error(`Original pack is read-only: ${n}`);
		let a = t.parentUuid ?? null, l = n ? o.get(n) : s.get(e.type) ?? s.set(e.type, []).get(e.type);
		if (e.action === "create") {
			let i = t.data.map((e) => {
				let n = structuredClone(e);
				return t.keepId && n._id || (n._id = `kernel${String(++c).padStart(10, "0")}`), n;
			});
			a || l.push(...i);
			for (let t of i) r.push({
				action: "create",
				type: e.type,
				pack: n,
				parentUuid: a,
				data: t
			});
			return i;
		}
		if (e.action === "update") {
			for (let i of t.updates) r.push({
				action: "update",
				type: e.type,
				pack: n,
				parentUuid: a,
				data: structuredClone(i)
			});
			return t.updates;
		}
		if (e.action === "delete") {
			for (let i of t.ids) r.push({
				action: "delete",
				type: e.type,
				pack: n,
				parentUuid: a,
				data: { _id: i }
			});
			return t.ids;
		}
		throw Error(`Unsupported document operation: ${e.action}`);
	}
	return e.emit = function(e, ...r) {
		let i = JSON.parse(JSON.stringify(r.filter((e) => typeof e != "function")));
		a.push({
			event: e,
			args: i
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
			let e = i[0];
			return c(d(e), (n) => ({
				...e,
				userId: t.userId,
				result: n
			}));
		}
		if (e === "modifyDocumentBatch") {
			let e = i[0];
			return c(Promise.all(e.map(async (e) => ({
				...e,
				userId: t.userId,
				result: await d(e)
			}))), (e) => ({ results: e }));
		}
		if (e === "manageCompendium") {
			let e = i[0];
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
		calls: a
	};
}
// src/rules/kernel/frame/random.ts
function o(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return t >>> 0;
}
function s(e) {
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
		t = o(e);
	};
}
// src/rules/kernel/frame/writings.ts
var c = [
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
function l(e, t) {
	let n = String(t.key ?? ""), r = c.find((e) => e.test(n));
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
function u(e) {
	let t = [];
	for (let n of e.allApplicableEffects()) for (let r of n.system?.changes ?? n.changes ?? []) {
		let i = l(e, r);
		i && t.push({
			actor: e.id,
			effect: n.uuid,
			...i
		});
	}
	return t;
}
// src/rules/kernel/frame/commands-items.ts
var d = globalThis;
function f(e) {
	return !e || e.max === void 0 || e.max === null || e.max === "" ? null : {
		value: e.value ?? null,
		max: e.max ?? null,
		spent: e.spent ?? null
	};
}
function p(e) {
	return {
		id: e.id,
		name: e.name,
		type: e.type,
		equipped: "equipped" in e.system ? e.system.equipped : null,
		attuned: "attuned" in e.system ? e.system.attuned : null,
		attunement: e.system.attunement ?? null,
		uses: f(e.system.uses),
		activities: e.system.activities ? [...e.system.activities].map((e) => ({
			id: e.id,
			name: e.name,
			type: e.type,
			uses: f(e.uses)
		})) : []
	};
}
function m(e) {
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
function h(e) {
	return e.map((e) => ({
		formula: e.formula ?? null,
		total: e.total ?? null,
		dice: e.dice?.map((e) => ({
			faces: e.faces,
			results: e.results?.map((e) => e.result)
		})) ?? []
	}));
}
function g(e, t) {
	let n = (e, n) => t(e).items.get(n, { strict: !0 });
	return {
		equip: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.equipped": !!a }), {
				item: p(o),
				actor: m(e)
			};
		}, [r]),
		attune: (r, i, a) => e([], async () => {
			let e = t(r), o = n(r, i);
			return await o.update({ "system.attuned": !!a }), {
				item: p(o),
				actor: m(e)
			};
		}, [r]),
		useItem: (t, r, i = [], a = null) => {
			let o = [], s = d.ui?.notifications, c = s?.error;
			return s && c && (s.error = function(e, ...t) {
				return o.push(String(e)), c.call(this, e, ...t);
			}), e(i, async () => {
				let e = n(t, r), i, s = null;
				if (a) {
					if (s = e.system.activities?.get(a), !s) throw Error(`Item has no activity: ${a}`);
					i = await s.use({}, { configure: !1 }, { create: !1 });
				} else i = await e.use({}, { configure: !1 }, { create: !1 });
				return {
					item: p(e),
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
				})) : d.foundry.utils.isEmpty(n.updates) || (await t.update(n.updates), i.push({
					id: t.id,
					name: t.name,
					updates: n.updates,
					rolls: h(n.rolls ?? [])
				})));
			}
			return {
				period: r,
				items: i,
				actor: m(e)
			};
		}, [n])
	};
}
// src/rules/kernel/frame/commands.ts
var _ = globalThis, v = class extends Error {
	request;
	constructor(e) {
		super("KERNEL_NEEDS_DICE"), this.request = e;
	}
}, y = class extends Error {
	where;
	constructor(e) {
		super("KERNEL_NEEDS_INPUT"), this.where = e;
	}
};
function b(e, t) {
	let n = _.CONFIG.Dice, r = n.randomUniform, i = _.foundry.dice.terms.Die.prototype, a = Object.hasOwn(i, "roll"), o = i.roll, s = 0, c = 0;
	i.roll = function(...e) {
		return c = this.faces, o.apply(this, e);
	}, n.randomUniform = () => {
		if (s >= e.length) throw new v({
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
		if (l(), e instanceof v) return {
			used: s,
			needs: e.request
		};
		if (e instanceof y) return {
			used: s,
			input: e.where
		};
		throw e;
	});
}
async function x(e) {
	let t = _.game.socket, n = t.emit, r = [];
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
			changes: r.filter((e) => e.action !== "get")
		};
	} finally {
		t.emit = n;
	}
}
function S(e) {
	let t = _.foundry.applications.api.ApplicationV2.prototype, n = t.render;
	return t.render = function() {
		throw new y(this.constructor.name);
	}, e().finally(() => {
		t.render = n;
	});
}
function C(e) {
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
var w = (e) => _.game.actors.get(e, { strict: !0 });
function T(e) {
	let t = {};
	for (let n of e) {
		if (n.action !== "update" || n.type !== "Actor" || n.parentUuid) continue;
		let e = _.game.actors.get(n.data._id);
		if (e?._prepareActiveEffectAttributions) for (let r of Object.keys(_.foundry.utils.flattenObject(n.data)).filter((e) => e.startsWith("system."))) {
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
async function E(e, t, n = []) {
	let r, i = [];
	try {
		({value: r, changes: i} = await x(() => b(e, () => S(t))));
	} catch (e) {
		return {
			status: "error",
			error: e instanceof Error ? e.message : String(e),
			stack: e instanceof Error ? e.stack ?? null : null,
			changes: i
		};
	}
	let a = n.flatMap((e) => u(w(e)));
	return {
		status: r.needs ? "missing" : r.input ? "pending" : a.length ? "unsupported" : "complete",
		result: r.value ?? null,
		sources: T(i),
		changes: i,
		diceUsed: r.used,
		missing: r.needs ? { dice: r.needs } : null,
		pending: r.input ? { input: r.input } : null,
		unsupported: a
	};
}
var D = g(E, w), O = [
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
], k;
function A() {
	return k ??= (async () => {
		let e = await (await fetch(new URL("modules/plutonium/js/Bundle.js", document.baseURI))).text(), t = Object.getPrototypeOf(async () => void 0).constructor, n = await new t(`${e}\n;return { ${O.join(", ")} };`)();
		return n.Config._CONFIG_TEMP = {
			dataSources: { baseSiteUrl: new URL(".", document.baseURI).href },
			misc: { rulesVersion: "classic" }
		}, n.ConfigConsts.prePreInit({ implRegistryImportList: n.ImplementationRegistryImportList.get() }), n.Config._CONFIG = n.Config.api_getDefaults(), n.Config._CONFIG_PLAYER = n.Config._getDefaultPlayerConfig(), n.Vetools.prePreInit_preConfig(), n.VetoolsLinks.prePreInit_postConfig(), n.Vetools.prePreInit_postConfig(), n.UtilDamageTypes.init(), n.Dnd5eUtil.init(), n.Vetools.init(), n.SideDataInterfaces.init(), n;
	})();
}
var j = { configure: !1 }, M = 15e3, N = { create: !1 }, P = {
	...D,
	roll: (e, t = {}, n = [], r = {}) => E(n, async () => {
		let n = {
			basic: _.CONFIG.Dice.BasicRoll,
			d20: _.CONFIG.Dice.D20Roll,
			damage: _.CONFIG.Dice.DamageRoll
		}, i = new (r.kind ? n[r.kind] : _.Roll)(e, t, r.options ? structuredClone(r.options) : void 0);
		return await i.evaluate({ allowInteractive: !1 }), C(i);
	}),
	damage: (e, t, n = [], r = {}) => E(n, async () => {
		let n = w(e);
		return await n.applyDamage(t, r), { hp: n.system.attributes.hp.toObject?.() ?? { ...n.system.attributes.hp } };
	}, [e]),
	rest: (e, t, n = [], r = {}) => E(n, async () => {
		let n = await w(e)[t === "short" ? "shortRest" : "longRest"]({
			dialog: !1,
			chat: !1,
			...r
		});
		return n ? JSON.parse(JSON.stringify(n, (e, t) => e === "clone" ? void 0 : t)) : null;
	}, [e]),
	save: (e, t, n = []) => E(n, async () => (await w(e).rollSavingThrow({ ability: t }, j, N))?.map(C) ?? null, [e]),
	skill: (e, t, n = []) => E(n, async () => (await w(e).rollSkill({ skill: t }, j, N))?.map(C) ?? null, [e]),
	attack: (e, t, n = []) => E(n, async () => {
		let n = w(e).items.get(t, { strict: !0 }).system.activities.find((e) => e.type === "attack");
		if (!n) return null;
		let r = await n.rollAttack({}, j, N), i = await n.rollDamage({}, j, N);
		return {
			attack: r?.map(C) ?? null,
			damage: i?.map(C) ?? null
		};
	}, [e]),
	levelUpSteps: (e, t, n = 1) => {
		let r = _.dnd5e.applications.advancement.AdvancementManager.forLevelChange(w(e), t, n);
		return {
			status: r.steps.length ? "pending" : "complete",
			steps: r.steps.map((e) => ({
				type: e.type,
				level: e.level ?? null,
				advancement: e.advancement ? {
					type: e.advancement.constructor.typeName ?? e.advancement.type,
					id: e.advancement.id,
					title: e.advancement.title
				} : null
			}))
		};
	},
	attribution: (e, t) => Object.fromEntries(t.map((t) => [t, (w(e)._prepareActiveEffectAttributions(t) ?? []).map((e) => ({
		label: e.label,
		mode: e.mode,
		value: e.value
	}))])),
	unsupported: () => _.game.actors.contents.flatMap((e) => u(e)),
	convert: async (e, t, n = {}) => {
		let r = await A(), i = {
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
				t = setTimeout(() => n(Error(`PROBE_TIMEOUT ${M}`)), M);
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
}, F = globalThis, I = new URLSearchParams(location.search).get("frame") ?? "", L = F.__trpgFrameErrors ?? [], R = 1, z = /* @__PURE__ */ new Map();
function B(t) {
	return new Promise((n, r) => {
		let i = 1e6 + R++;
		z.set(i, {
			resolve: n,
			reject: r
		}), parent.postMessage({
			channel: e,
			type: "request",
			frame: I,
			id: i,
			...t
		}, location.origin);
	});
}
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || t?.channel !== "trpg-library" || t.type !== "response" || !z.has(t.id)) return;
	let n = z.get(t.id);
	z.delete(t.id), t.ok ? n.resolve(t.value) : n.reject(Error(t.error));
});
async function V(e) {
	let t = await fetch(new URL(e, location.href));
	if (!t.ok) throw Error(`${t.status}: ${e}`);
	return t.text();
}
async function H(e) {
	let t = await B({
		op: "file",
		path: `packs/${e}.json`
	});
	if (typeof t != "string") throw Error(`Pack is not available: ${e}`);
	return JSON.parse(t);
}
var U = s(globalThis), W;
async function G(e) {
	if (W) throw Error("Kernel is already booted");
	let t = [], { foundry: n, Hooks: i } = F;
	U(e.seed ?? "kernel"), F.release = new n.config.ReleaseData(e.release);
	let o = r(e);
	F.packages = {
		System: new n.utils.Collection([[o.system.id, new n.packages.System(o.system)]]),
		Module: new n.utils.Collection(o.modules.map((e) => [e.id, new n.packages.Module(e)]))
	};
	let s = F.io({
		autoConnect: !1,
		forceNew: !0
	});
	W = {
		...a(s, {
			userId: e.userId,
			worldTime: e.worldTime,
			readPack: H,
			readText: V
		}),
		steps: t
	};
	let c = n.Game;
	class l extends c {
		activateListeners() {
			t.push("omit UI event listeners");
		}
		initializeUI() {
			for (let [e, t] of Object.entries(F.CONFIG.ui)) F.ui[e] = new t();
			F.ui.windows ??= {};
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
	F.game = new l("game", o, s), F.game.settings.storage.get("client").setItem("core.noCanvas", "true"), await Y(`systems/${o.system.id}/dnd5e.js`);
	for (let e of o.modules) for (let t of e.esmodules ?? []) await import(
		/* @vite-ignore */
		new URL(t, location.href).href
);
	i.once("setup", () => {
		F.CONFIG.DND5E?.calendar && (F.CONFIG.DND5E.calendar.application = null);
	}), await F.game.initialize();
	let u = Date.now() + 3e4;
	for (; o.modules.some((e) => e.id === "plutonium") && typeof F.game.modules.get("plutonium")?.api != "object";) {
		if (Date.now() > u) throw Error("Plutonium API was not ready within 30 seconds");
		await new Promise((e) => setTimeout(e, 50));
	}
	return K();
}
function K() {
	let e = F.game;
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
		errors: [...L]
	};
}
function q() {
	return F.game.actors.contents.map((e) => ({
		source: e.toObject(),
		system: e.system.toObject(!1),
		name: e.name,
		validation: e.validationFailures
	}));
}
var J = {
	...P,
	boot: G,
	status: K,
	preparedActors: q,
	changes: () => W?.changes ?? [],
	calls: () => W?.calls ?? [],
	steps: () => W?.steps ?? []
};
addEventListener("message", (t) => {
	let n = t.data;
	if (t.source !== parent || n?.channel !== "trpg-library" || n.type !== "call") return;
	let r = (t) => parent.postMessage({
		channel: e,
		type: "result",
		frame: I,
		id: n.id,
		...t
	}, location.origin), i = J[n.fn];
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
function Y(e) {
	return new Promise((t, n) => {
		let r = document.createElement("script");
		r.src = e, r.onload = () => t(), r.onerror = () => n(Error(`Failed to load ${e}`)), document.head.append(r);
	});
}
async function X() {
	F.SIGNED_EULA = !0, F.ROUTE_PREFIX = new URL(".", location.href).pathname.replace(/^\/+|\/+$/g, ""), F.MESSAGES = null, await import(
		/* @vite-ignore */
		new URL("scripts/foundry.mjs", location.href).href
);
	let t = {
		channel: e,
		type: "ready",
		frame: I,
		codeSet: "foundry",
		authorVersion: F.foundry?.CONST?.vtt ?? null,
		present: { foundry: !!F.foundry?.Game },
		errors: [...L]
	};
	parent.postMessage(t, location.origin);
}
document.readyState === "complete" ? X() : addEventListener("load", () => {
	X();
}, { once: !0 });
