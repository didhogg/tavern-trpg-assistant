import { t as e } from "./protocol-03CO7Rhf.js";
// src/library/runtime/frame/author.ts
var t = globalThis, n = null;
function r() {
	return n ??= (async () => {
		t.Renderer.get().setBaseUrl(""), await t.PrereleaseUtil.pInit(), await t.BrewUtil2.pInit(), await t.ExcludeUtil.pInitialise();
	})(), n;
}
function i(e, n) {
	return e ? e[n] ?? e[t.DataLoader.getPropPage(n)] ?? null : null;
}
function a(e, n) {
	let r = i(t.UrlUtil.URL_TO_HASH_BUILDER, e);
	try {
		return r ? r(n) : null;
	} catch {
		return null;
	}
}
function o(e, n) {
	let r = t.UrlUtil.URL_TO_ENG_HASH_BUILDER, i = t.DataLoader.getPropPage(e);
	return !r || !n?.ENG_name || !r[i] ? null : r[i](n);
}
function s(e) {
	return t.SourceUtil.getEntitySource(e) ?? null;
}
// src/library/runtime/frame/brew-commands.ts
async function c(e) {
	await r();
	let n = t.__trpgFrameErrors, i = n.length, a = await e();
	return await new Promise((e) => setTimeout(e, 50)), {
		value: a,
		errors: n.slice(i)
	};
}
var l = (e) => ({
	head: e.head,
	meta: e.body?._meta ?? null
});
function u() {
	return c(() => t.BrewUtil2.pGetCombinedIndexes());
}
async function d() {
	return await r(), (await t.BrewUtil2.pGetBrew()).map(l);
}
async function f() {
	await r();
	let e = [];
	for (let [n, r] of [["brew", t.BrewUtil2], ["prerelease", t.PrereleaseUtil]]) {
		let t = new Set((await r.pGetBrew()).map((e) => e.head.docIdLocal));
		for (let i of await r._pGetBrewRaw() ?? []) e.push({
			kind: n,
			head: i.head,
			sources: (i.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
			shown: t.has(i.head.docIdLocal)
		});
	}
	return e;
}
async function p(e) {
	let n = await c(() => t.BrewUtil2.pAddBrewFromUrl(e));
	return {
		...n,
		value: (n.value ?? []).map(l)
	};
}
async function m(e) {
	let n = [], r = [];
	for (let t of e) try {
		r.push({
			name: t.name,
			json: JSON.parse(t.text)
		});
	} catch (e) {
		n.push({
			name: t.name,
			error: e instanceof Error ? e.message : String(e)
		});
	}
	let i = await c(async () => {
		let [e, n] = r.segregate((e) => t.BrewUtil2.constructor._isPrereleaseDroppedJson(e.json)), i = [];
		return e.length && i.push(...await t.PrereleaseUtil.pAddBrewsFromFiles(e) ?? []), n.length && i.push(...await t.BrewUtil2.pAddBrewsFromFiles(n) ?? []), i;
	});
	return {
		errors: i.errors,
		value: {
			added: i.value.map(l),
			notJson: n
		}
	};
}
async function h(e) {
	return c(async () => {
		let n = new Set(e), r = (await t.BrewUtil2.pGetBrew()).filter((e) => n.has(e.head.docIdLocal));
		return await t.BrewUtil2.pDeleteBrews(r), r.length;
	});
}
async function g(e = null) {
	let n = await c(async () => {
		let n = e ? (await t.BrewUtil2.pGetBrew()).filter((t) => e.includes(t.head.docIdLocal)) : null;
		return t.BrewUtil2.pPullAllBrews({ brews: n });
	});
	return {
		...n,
		value: (n.value ?? []).map(l)
	};
}
async function _(e) {
	await r();
	let n = await t.DataLoader.pCacheAndGetAllBrew(e) ?? [];
	return {
		items: n,
		hashes: n.map((t) => a(e, t)),
		sources: n.map((e) => s(e))
	};
}
// src/library/runtime/frame/english-commands.ts
async function v() {
	await r();
	let e = [], n = async (n, r, i) => {
		let a = new t.Omnidexer();
		await a.pAddToIndex(n, r, {
			isNoFilter: !0,
			isIncludeEntityLocator: !0
		});
		for (let n of a.getIndex().x) n._entityLocator && e.push({
			prop: t.Parser.pageCategoryToProp(n.c),
			hash: n.u,
			file: i,
			locator: n._entityLocator
		});
	};
	for (let e of t.Omnidexer.TO_INDEX__FROM_INDEX_JSON) {
		let r = await t.DataUtil.loadRawJSON(`data/${e.dir}/index.json`);
		for (let i of Object.values(r)) {
			let r = `data/${e.dir}/${i}`;
			await n(e, await t.DataUtil.loadRawJSON(r), r);
		}
	}
	for (let e of t.Omnidexer.TO_INDEX) {
		let r = `data/${e.file}`;
		await n(e, await t.DataUtil.loadJSON(r), r);
	}
	return e;
}
async function y(e) {
	await r();
	let n = /* @__PURE__ */ new Map(), i = (e) => {
		let r = n.get(e);
		return r || (r = t.DataUtil.loadRawJSON(e), n.set(e, r)), r;
	}, o = [];
	for (let n of e) {
		let e;
		try {
			e = await i(n.file);
		} catch (e) {
			o.push({
				prop: n.prop,
				hash: n.hash,
				enHash: null,
				enSource: null,
				via: null,
				error: e instanceof Error ? e.message : String(e)
			});
			continue;
		}
		let r = n.locator, c = r ? t.Omnidexer.getProperty(e, r.prop) : null, l = (e) => e?.name === r.name && (r.source == null || e.source === r.source), u = c?.filter((e) => e.source === r.source && e.page === r.page) || [], d = null, f = c?.find(l);
		f ? d = "name" : (f = Object.values(e).filter(Array.isArray).flat().find(l)) ? d = "name-any-array" : (f = c?.length === r.count ? c[r.ix] : null) ? d = "position" : (f = u[r.ixSourcePage]) && (d = "source-page"), o.push({
			prop: n.prop,
			hash: n.hash,
			enHash: f ? a(r.prop, f) : null,
			enSource: f ? s(f) : null,
			via: d
		});
	}
	return o;
}
// src/library/runtime/frame/read-commands.ts
function b(e, n, r) {
	let i = s(n);
	return i ? t.DataLoader.getPropPage(e) === t.UrlUtil.PG_ITEMS && t.Renderer.item.isExcluded(n, { hash: r }) ? !0 : t.ExcludeUtil.isExcluded(r ?? "", n.__prop ?? e, i, { isNoCount: !0 }) : !1;
}
async function ee(e, n = "site") {
	if (await r(), !t.ExcludeUtil.getList().length) return {
		hashes: [],
		excluded: null
	};
	let i = await (n === "brew" ? t.DataLoader.pCacheAndGetAllBrew(e) : t.DataLoader.pCacheAndGetAllSite(e)) ?? [], o = i.map((t) => a(e, t));
	return {
		hashes: o,
		excluded: i.map((t, n) => b(e, t, o[n]))
	};
}
async function x(e, n, i) {
	await r();
	let a = i ? await t.DataLoader.pCacheAndGet(e, i, n) : await t.DataLoader.pCacheAndGetHash(e, n);
	if (!a) return null;
	let c = null, l = null;
	try {
		c = await t.Renderer.utils.pGetProxyFluff({
			entity: a,
			prop: e
		}) ?? null;
	} catch (e) {
		l = e instanceof Error ? e.message : String(e);
	}
	return {
		item: a,
		hash: n,
		source: s(a),
		excluded: b(e, a, n),
		fluff: c,
		fluffError: l,
		engSiteHash: o(e, a)
	};
}
async function S(e, n = null) {
	await r();
	let i = n === null ? null : await C(), a = i?.isShowLegacy;
	i && (i.isShowLegacy = n);
	try {
		return (await t.OmnisearchBacking.pGetResults(t.CleanUtil.getCleanString(e))).map((e) => ({
			score: e.score,
			prop: t.Parser.pageCategoryToProp(e.doc.c),
			doc: e.doc
		}));
	} finally {
		i && (i.isShowLegacy = a);
	}
}
async function C() {
	return (await import(
		/* @vite-ignore */
		new URL("js/omnisearch/omnisearch-state.js", location.href).href
)).OmnisearchState;
}
async function w(e = {}) {
	await r();
	let t = await C();
	for (let [n, r] of Object.entries(e)) {
		if (!(n in t._DEFAULT_STATE)) throw Error(`作者的搜索设置里没有这一项：${n}`);
		n === "partneredMode" ? t.setPartneredMode(r) : t[n] = r;
	}
	return t._getComp().toObject();
}
async function T() {
	await r();
	let e = t.OmnisearchBacking;
	return await e._pInit(), {
		json: JSON.stringify(e._searchIndex.toJSON()),
		maxId: e._maxId ?? null,
		categoryCounts: e._CATEGORY_COUNTS ?? {},
		adventureBookLookup: e._adventureBookLookup ?? {}
	};
}
async function te(e) {
	await r();
	let n = t.OmnisearchBacking;
	return n._searchIndex = t.elasticlunr.Index.load(JSON.parse(e.json)), n._maxId = e.maxId, n._CATEGORY_COUNTS = e.categoryCounts, n._adventureBookLookup = e.adventureBookLookup, n._pLoadSearch = Promise.resolve(), n._initReInCategory(), !0;
}
// src/library/runtime/frame/dice-commands.ts
var E = (e) => t.Renderer.dice.lang.getTree3(e)?.tree ?? null, ne = (e) => e.replace(/<[^>]+>/g, "");
async function D(e, n) {
	return await r(), t.Renderer.utils.getTagEntry(e.startsWith("@") ? e : `@${e}`, n);
}
async function O(e) {
	await r();
	let t = E(e);
	return t ? {
		ok: !0,
		average: t.avg({}),
		min: t.min({}),
		max: t.max({})
	} : {
		ok: !1,
		average: null,
		min: null,
		max: null
	};
}
async function k(e) {
	if (await r(), !e.trim()) return {
		ok: !0,
		simple: !0,
		dice: [],
		mod: 0
	};
	try {
		if (!t.Renderer.dice.lang.getTree3(e, !1)?.tree) return {
			ok: !1,
			error: "作者骰子程序读不了这个骰式"
		};
	} catch (e) {
		return {
			ok: !1,
			error: ne(e instanceof Error ? e.message : String(e))
		};
	}
	let n = t.Renderer.dice.tk, i = t.Renderer.dice.lang._lex3(e).lexed, a = (e) => e?.type === n.TYP_NUMBER && /^\d+$/.test(String(e.value)) ? Number(e.value) : null, o = [], s = 0, c = 0;
	for (; c < i.length;) {
		let e = 1;
		if (i[c] === n.ADD || i[c] === n.SUB) e = i[c] === n.SUB ? -1 : 1, c++;
		else if (c > 0) return {
			ok: !0,
			simple: !1
		};
		let t = a(i[c]);
		if (i[c] === n.DICE || i[c + 1] === n.DICE) {
			let r = i[c] === n.DICE ? c : c + 1, s = a(i[r + 1]);
			if (s === null) return {
				ok: !0,
				simple: !1
			};
			o.push({
				count: r === c ? 1 : t ?? 0,
				sides: s,
				sign: e
			}), c = r + 2;
		} else if (t !== null) s += e * t, c++;
		else return {
			ok: !0,
			simple: !1
		};
		if (o.some((e) => !e.count)) return {
			ok: !0,
			simple: !1
		};
	}
	return {
		ok: !0,
		simple: !0,
		dice: o,
		mod: s
	};
}
async function A(e, n) {
	await r();
	let i = E(e);
	if (!i) return {
		status: "unsupported",
		reason: "作者骰子程序读不了这个骰式",
		formula: e
	};
	let a = t.RollerUtil._randomise, o = [], s = null;
	t.RollerUtil._randomise = (e) => {
		let { min: r = 1, max: i } = e;
		if (r > i) return 0;
		if (r === i) return i;
		if (!n) {
			let n = a.call(t.RollerUtil, e);
			return o.push({
				min: r,
				max: i,
				value: n
			}), n;
		}
		if (o.length >= n.length) throw s = {
			min: r,
			max: i
		}, Error("KERNEL_NEEDS_DICE");
		let c = n[o.length];
		if (!Number.isInteger(c) || c < r || c > i) throw Error(`骰点 ${c} 不在 ${r}～${i} 之间`);
		return o.push({
			min: r,
			max: i,
			value: c
		}), c;
	};
	try {
		let t = {};
		return {
			status: "complete",
			formula: e,
			total: i.evl(t),
			used: o,
			text: t.text?.join?.("").replace(/\s+/g, " ").trim() ?? null
		};
	} catch (t) {
		return s ? {
			status: "missing",
			formula: e,
			used: o,
			missing: { dice: s }
		} : {
			status: "error",
			formula: e,
			error: t instanceof Error ? t.message : String(t)
		};
	} finally {
		t.RollerUtil._randomise = a;
	}
}
async function j(e, n) {
	await r();
	let i = t.Renderer.table.getAutoConvertedRollMode(e);
	if (!i) return {
		rollable: !1,
		mode: i,
		index: null
	};
	let a = (e.rows ?? []).findIndex((e) => {
		let r = t.Renderer.getRollableRow(e)?.[0]?.roll;
		if (!r) return !1;
		let i = r.pad && n === 100 ? 0 : n;
		return r.exact == null ? r.min <= i && i <= r.max : r.exact === i;
	});
	return {
		rollable: !0,
		mode: i,
		index: a >= 0 ? a : null
	};
}
// src/library/runtime/frame/edit-commands.ts
var M = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function N(e) {
	await r();
	let n = {};
	for (let r of e) n[r] = t.BrewUtil2.hasSourceJson(r) || t.PrereleaseUtil.hasSourceJson(r) ? {
		classic: !!t.SourceUtil.isClassicSource(r),
		basis: "brew-meta"
	} : t.Parser.sourceJsonToDate(r) ? {
		classic: !!t.SourceUtil.isClassicSource(r),
		basis: "date"
	} : {
		classic: null,
		basis: null
	};
	return n;
}
async function P(e) {
	return await r(), Object.fromEntries(e.map((e) => [e, {
		full: t.Parser.sourceJsonToFull(e),
		abv: t.Parser.sourceJsonToAbv(e)
	}]));
}
async function F() {
	return await r(), (await t.BrewUtil2.pGetBrew()).map((e, t) => ({
		docIdLocal: e.head.docIdLocal,
		filename: e.head.filename ?? null,
		timeAdded: e.head.timeAdded ?? 0,
		order: t,
		isEditable: !!e.head.isEditable,
		sources: (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
		props: Object.fromEntries(Object.entries(e.body ?? {}).filter(([e, t]) => !e.startsWith("_") && Array.isArray(t)).map(([e, t]) => [e, t.map((t) => t && typeof t == "object" ? a(e, t) : null)]))
	}));
}
async function I(e = null) {
	await r();
	let n = await t.BrewUtil2.pGetBrew();
	return e ? n.filter((t) => e.includes(t.head.docIdLocal)) : n;
}
async function L(e) {
	await r();
	let n = {};
	for (let { prop: r, hash: i } of e) {
		await t.DataLoader.pCacheAndGetAllBrew(r);
		let e = await t.DataLoader.pCacheAndGetHash(r, i);
		e && ((await t.DataLoader.pCacheAndGetAllSite(r) ?? []).includes(e) || (n[`${r}|${i}`] = e));
	}
	return n;
}
async function R(e, n) {
	return await r(), `data/${e}/${e}-${t.UrlUtil.encodeForHash(n.toLowerCase())}.json`;
}
async function z(e) {
	let t = (await I([e]))[0];
	return t ? {
		filename: t.head.filename ?? null,
		body: t.body
	} : null;
}
async function B(e, n) {
	await r();
	try {
		return {
			fluff: await t.Renderer.utils.pGetProxyFluff({
				entity: n,
				prop: e
			}) ?? null,
			fluffError: null
		};
	} catch (e) {
		return {
			fluff: null,
			fluffError: e instanceof Error ? e.message : String(e)
		};
	}
}
async function V(e, n) {
	await r();
	let i = {};
	for (let r of n) {
		let n = a(e, r);
		if (n) try {
			i[n] = {
				fluff: await t.Renderer.utils.pGetProxyFluff({
					entity: r,
					prop: e
				}) ?? null,
				fluffError: null,
				engSiteHash: o(e, r)
			};
		} catch (e) {
			i[n] = {
				fluff: null,
				fluffError: e instanceof Error ? e.message : String(e),
				engSiteHash: null
			};
		}
	}
	return i;
}
async function H() {
	return await r(), t.ExcludeUtil.getList();
}
async function U() {
	return await r(), t.BrewUtil2.pGetOrCreateEditableBrewDoc();
}
async function W(e) {
	return ((await U()).body?._meta?.sources ?? []).some((t) => String(t.json).toLowerCase() === e.json.toLowerCase()) || await t.BrewUtil2.pAddSource({
		authors: [],
		convertedBy: [],
		version: "1",
		...e
	}), ((await U()).body?._meta?.sources ?? []).map((e) => e.json);
}
async function G(e, n) {
	await r();
	let i = {
		...n,
		uniqueId: n.uniqueId ?? t.CryptUtil.uid()
	};
	return await t.BrewUtil2.pPersistEditableBrewEntity(e, i), {
		uniqueId: i.uniqueId,
		hash: a(e, i)
	};
}
async function K(e, n) {
	await r(), await t.BrewUtil2.pRemoveEditableBrewEntities(e, n);
}
async function re(e) {
	let n = t.MiscUtil.copyFast(await U()), r = n.body._meta.dependencies ??= {};
	for (let [t, n] of Object.entries(e)) r[t] = [.../* @__PURE__ */ new Set([...r[t] ?? [], ...n])];
	return await t.BrewUtil2.pSetEditableBrewDoc(n), r;
}
var q = {
	spell: {
		file: "converter/converter-spell.js",
		cls: "ConverterSpell",
		formats: ["text"]
	},
	monster: {
		file: "converter/converter-creature.js",
		cls: "ConverterCreature",
		formats: ["text", "markdown"]
	},
	item: {
		file: "converter/converter-item.js",
		cls: "ConverterItem",
		formats: ["text"]
	},
	feat: {
		file: "converter/converter-feat.js",
		cls: "ConverterFeat",
		formats: ["text"]
	},
	race: {
		file: "converter/converter-race.js",
		cls: "ConverterRace",
		formats: ["text", "markdown"]
	},
	background: {
		file: "converter/converter-background.js",
		cls: "ConverterBackground",
		formats: ["text"]
	},
	table: {
		file: "converter/converter-table.js",
		cls: "ConverterTable",
		formats: ["markdown", "html"]
	},
	entries: {
		file: "converter/converter-entries.js",
		cls: "ConverterEntries",
		formats: ["markdown"]
	}
}, J = {
	text: "doParseText",
	markdown: "doParseMarkdown",
	html: "doParseHtml"
}, Y = null;
function X() {
	return Y ??= (async () => {
		await r();
		let [{ TagCondition: e, TaggerUtils: n }, { TagJsons: i }, { AcConvert: a, AttachedItemTag: o, MiscTag: s, SpellcastingTraitConvert: c }, { ConverterItem: l }, { RaceTraitTag: u }, { InstrumentBaseItemTag: d }] = await Promise.all([
			M("converter/converterutils-tags.js"),
			M("converter/converterutils-entries.js"),
			M("converter/converterutils-creature.js"),
			M("converter/converter-item.js"),
			M("converter/converterutils-race.js"),
			M("converter/converterutils-item.js")
		]), [f, p, m, h, g, _] = await Promise.all([
			t.DataUtil.spell.pLoadAll(),
			t.Renderer.item.pBuildList(),
			t.DataUtil.item.loadRawJSON(),
			t.DataUtil.legendaryGroup.pLoadAll(),
			t.DataUtil.class.loadJSON(),
			t.BrewUtil2.pGetBrewProcessed()
		]), v = p.filter((e) => !e._isItemGroup);
		c.init(f), l.init(v, g), a.init(v), n.init({
			legendaryGroups: h,
			spells: f
		}), await i.pInit({ spells: f }), u.init({ itemsRaw: m }), s.init({ items: p }), o.init({ items: p }), await e.pInit({ conditionsBrew: _.condition }), d.init({ items: v });
	})(), Y.catch(() => {
		Y = null;
	}), Y;
}
async function ie() {
	return Object.fromEntries(Object.entries(q).map(([e, t]) => [e, t.formats]));
}
async function ae(e, t, n, r) {
	let i = q[e];
	if (!i) throw Error(`作者没有这一类的转换器：${e}`);
	if (!i.formats.includes(t)) throw Error(`作者的${e}转换器不支持这种格式：${t}（支持 ${i.formats.join("、")}）`);
	await X();
	let a = (await M(i.file))[i.cls], o = [], s = [];
	return a[J[t]](n, {
		cbOutput: (e) => o.push(e),
		cbWarning: (e) => s.push(String(e)),
		isAppend: !1,
		source: r.source,
		page: r.page ?? 0,
		...r.styleHint ? { styleHint: r.styleHint } : {}
	}), {
		outputs: o,
		warnings: s
	};
}
var oe = {
	spell: {
		file: "makebrew/makebrew-spell.js",
		cls: "SpellBuilder"
	},
	monster: {
		file: "makebrew/makebrew-creature.js",
		cls: "CreatureBuilder"
	},
	legendaryGroup: {
		file: "makebrew/makebrew-legendarygroup.js",
		cls: "LegendaryGroupBuilder"
	}
};
async function se(e) {
	await r();
	let t = oe[e];
	if (!t) return null;
	let n = (await M(t.file))[t.cls];
	return n.prototype._getInitialState.call(Object.create(n.prototype));
}
// src/library/runtime/frame/commands.ts
async function ce() {
	let e = /* @__PURE__ */ new Set(), n = [];
	for (let r of t.DataLoader._DATA_TYPE_LOADER_LIST) {
		if (e.has(r)) continue;
		e.add(r);
		let t = [...r.constructor.PROPS], i = r.constructor.PAGE ?? null;
		t.some((e) => e === "bookData" || e === "adventureData") ? n.push({
			props: t,
			page: i,
			kind: "corpus",
			index: r._filename
		}) : n.push({
			props: t,
			page: i,
			kind: "site"
		});
	}
	return n;
}
async function le(e) {
	await r();
	let n = await t.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: n,
		hashes: n.map((t) => a(e, t)),
		sources: n.map((e) => s(e))
	};
}
async function ue(e, n, i) {
	return await r(), ((await t.DataUtil.loadJSON(`data/${e}`))[n] ?? []).map((e) => ({
		id: e.id,
		source: t.SourceUtil.getEntitySource(e),
		hash: t.UrlUtil.URL_TO_HASH_BUILDER[i](e)
	}));
}
async function de(e, n, i) {
	return await r(), t.DataLoader.pCacheAndGet(e, n, i, { isRequired: !0 });
}
async function fe() {
	await r();
	let e = {};
	for (let n of ["search/index.json", "search/index-item.json"]) {
		let r = t.Omnidexer.decompressIndex(await t.DataUtil.loadRawJSON(n));
		for (let n of r) {
			let r = t.Parser.CAT_ID_TO_PROP[n.c] ?? `cat:${n.c}`;
			(e[r] ??= []).push(n.u);
		}
	}
	return e;
}
async function pe(e, n) {
	await r();
	let i = t.ExcludeUtil.getList().filter((t) => t.hash !== "*" || t.category !== "*" || String(t.source).toLowerCase() !== e.toLowerCase()), a = n ? [...i, {
		displayName: e,
		hash: "*",
		category: "*",
		source: e,
		isAuto: !1
	}] : i;
	return await t.ExcludeUtil.pSetList(a), await t.ExcludeUtil._pSave(), t.ExcludeUtil.getList();
}
async function me(e, n, i) {
	return await r(), t.ExcludeUtil.isExcluded(e, n, i, { isNoCount: !0 });
}
async function he(e, t) {
	return await r(), t.map((t) => a(e, t));
}
async function Z() {
	return [...t.__trpgFrameErrors];
}
var ge = {
	frameErrors: Z,
	init: r,
	loaders: ce,
	parseProp: le,
	corpusList: ue,
	parseCorpus: de,
	searchIndexHashes: fe,
	setSourceExcluded: pe,
	isExcluded: me,
	excludedFlags: ee,
	detail: x,
	search: S,
	searchIndexDump: T,
	searchIndexLoad: te,
	searchSettings: w,
	englishLocators: v,
	englishMatch: y,
	brewCatalog: u,
	brewInstalled: d,
	brewStorage: f,
	brewAddUrl: p,
	brewAddFiles: m,
	brewDelete: h,
	brewPull: g,
	parseBrewProp: _,
	rawHashes: he,
	editionOf: N,
	sourceNames: P,
	corpusFile: R,
	brewDocIndex: F,
	brewItemsByHash: L,
	brewRaw: I,
	brewExport: z,
	fluffOf: B,
	fluffOfMany: V,
	excludeList: H,
	editableDoc: U,
	editableEnsureSource: W,
	editablePut: G,
	editableRemove: K,
	editableAddDependencies: re,
	converters: ie,
	convertText: ae,
	entryTemplate: se,
	diceTag: D,
	diceStats: O,
	diceRead: k,
	diceRoll: A,
	tableRow: j
}, _e = [
	"DataLoader",
	"DataUtil",
	"BrewUtil2",
	"PrereleaseUtil",
	"ExcludeUtil",
	"StorageUtil",
	"Renderer",
	"Omnidexer",
	"UrlUtil",
	"Hist",
	"Parser",
	"SourceUtil"
], Q = globalThis, $ = new URLSearchParams(location.search).get("frame") ?? "";
addEventListener("message", (t) => {
	let n = t.data;
	if (t.source !== parent || !n || n.channel !== "trpg-library" || n.type !== "call") return;
	let r = (t) => parent.postMessage({
		channel: e,
		type: "result",
		frame: $,
		id: n.id,
		...t
	}, location.origin), i = ge[n.fn];
	i ? i(...n.args).then((e) => r({
		ok: !0,
		value: e
	}), (e) => r({
		ok: !1,
		error: e instanceof Error ? e.stack ?? e.message : String(e)
	})) : r({
		ok: !1,
		error: `小窗没有这个指令：${n.fn}`
	});
});
var ve = new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "", ye = {
	channel: e,
	type: "ready",
	frame: $,
	codeSet: ve,
	authorVersion: typeof Q.VERSION_NUMBER == "string" ? Q.VERSION_NUMBER : null,
	present: Object.fromEntries(_e.map((e) => [e, Q[e] !== void 0])),
	errors: [...Q.__trpgFrameErrors ?? []]
};
parent.postMessage(ye, location.origin);
