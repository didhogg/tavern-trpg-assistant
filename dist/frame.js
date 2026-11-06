// src/library/runtime/protocol.ts
var e = "trpg-library", t = globalThis, n = null;
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
async function x(e, n = "site") {
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
async function S(e, n, i) {
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
async function C(e) {
	return await r(), (await t.OmnisearchBacking.pGetResults(t.CleanUtil.getCleanString(e))).map((e) => ({
		score: e.score,
		prop: t.Parser.pageCategoryToProp(e.doc.c),
		doc: e.doc
	}));
}
async function w() {
	return (await import(
		/* @vite-ignore */
		new URL("js/omnisearch/omnisearch-state.js", location.href).href
)).OmnisearchState;
}
async function T(e = {}) {
	await r();
	let t = await w();
	for (let [n, r] of Object.entries(e)) {
		if (!(n in t._DEFAULT_STATE)) throw Error(`作者的搜索设置里没有这一项：${n}`);
		n === "partneredMode" ? t.setPartneredMode(r) : t[n] = r;
	}
	return t._getComp().toObject();
}
// src/library/runtime/frame/commands.ts
async function E() {
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
async function D(e) {
	await r();
	let n = await t.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: n,
		hashes: n.map((t) => a(e, t)),
		sources: n.map((e) => s(e))
	};
}
async function O(e, n, i) {
	return await r(), ((await t.DataUtil.loadJSON(`data/${e}`))[n] ?? []).map((e) => ({
		id: e.id,
		source: t.SourceUtil.getEntitySource(e),
		hash: t.UrlUtil.URL_TO_HASH_BUILDER[i](e)
	}));
}
async function k(e, n, i) {
	return await r(), t.DataLoader.pCacheAndGet(e, n, i, { isRequired: !0 });
}
async function A() {
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
async function j(e, n) {
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
async function M(e, n, i) {
	return await r(), t.ExcludeUtil.isExcluded(e, n, i, { isNoCount: !0 });
}
async function N(e, t) {
	return await r(), t.map((t) => a(e, t));
}
async function P() {
	return [...t.__trpgFrameErrors];
}
var F = {
	frameErrors: P,
	init: r,
	loaders: E,
	parseProp: D,
	corpusList: O,
	parseCorpus: k,
	searchIndexHashes: A,
	setSourceExcluded: j,
	isExcluded: M,
	excludedFlags: x,
	detail: S,
	search: C,
	searchSettings: T,
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
	rawHashes: N
}, I = [
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
], L = globalThis, R = new URLSearchParams(location.search).get("frame") ?? "";
addEventListener("message", (t) => {
	let n = t.data;
	if (t.source !== parent || !n || n.channel !== "trpg-library" || n.type !== "call") return;
	let r = (t) => parent.postMessage({
		channel: e,
		type: "result",
		frame: R,
		id: n.id,
		...t
	}, location.origin), i = F[n.fn];
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
var z = {
	channel: e,
	type: "ready",
	frame: R,
	codeSet: new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "",
	authorVersion: typeof L.VERSION_NUMBER == "string" ? L.VERSION_NUMBER : null,
	present: Object.fromEntries(I.map((e) => [e, L[e] !== void 0])),
	errors: [...L.__trpgFrameErrors ?? []]
};
parent.postMessage(z, location.origin);
