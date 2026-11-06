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
	let r = i(t.UrlUtil.URL_TO_ENG_HASH_BUILDER, e);
	try {
		return r ? r(n) : null;
	} catch {
		return null;
	}
}
function s() {
	return !!t.UrlUtil.URL_TO_ENG_HASH_BUILDER;
}
function c(e) {
	return t.SourceUtil.getEntitySource(e) ?? null;
}
// src/library/runtime/frame/read-commands.ts
function l(e, n, r) {
	let i = c(n);
	return i ? t.DataLoader.getPropPage(e) === t.UrlUtil.PG_ITEMS && t.Renderer.item.isExcluded(n, { hash: r }) ? !0 : t.ExcludeUtil.isExcluded(r ?? "", n.__prop ?? e, i, { isNoCount: !0 }) : !1;
}
async function u(e) {
	if (await r(), !t.ExcludeUtil.getList().length) return {
		hashes: [],
		excluded: null
	};
	let n = await t.DataLoader.pCacheAndGetAllSite(e) ?? [], i = n.map((t) => a(e, t));
	return {
		hashes: i,
		excluded: n.map((t, n) => l(e, t, i[n]))
	};
}
async function d(e, n, i) {
	await r();
	let a = i ? await t.DataLoader.pCacheAndGet(e, i, n) : await t.DataLoader.pCacheAndGetHash(e, n);
	if (!a) return null;
	let s = null, u = null;
	try {
		s = await t.Renderer.utils.pGetProxyFluff({
			entity: a,
			prop: e
		}) ?? null;
	} catch (e) {
		u = e instanceof Error ? e.message : String(e);
	}
	return {
		item: a,
		hash: n,
		source: c(a),
		excluded: l(e, a, n),
		fluff: s,
		fluffError: u,
		engHash: o(e, a)
	};
}
async function f(e) {
	return await r(), (await t.OmnisearchBacking.pGetResults(t.CleanUtil.getCleanString(e))).map((e) => ({
		score: e.score,
		prop: t.Parser.pageCategoryToProp(e.doc.c),
		doc: e.doc
	}));
}
async function p() {
	return (await import(
		/* @vite-ignore */
		new URL("js/omnisearch/omnisearch-state.js", location.href).href
)).OmnisearchState;
}
async function m(e = {}) {
	await r();
	let t = await p();
	for (let [n, r] of Object.entries(e)) {
		if (!(n in t._DEFAULT_STATE)) throw Error(`作者的搜索设置里没有这一项：${n}`);
		n === "partneredMode" ? t.setPartneredMode(r) : t[n] = r;
	}
	return t._getComp().toObject();
}
// src/library/runtime/frame/commands.ts
async function h() {
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
async function g(e) {
	await r();
	let n = await t.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: n,
		hashes: n.map((t) => a(e, t)),
		sources: n.map((e) => c(e)),
		engHashes: s() ? n.map((t) => o(e, t)) : null
	};
}
async function _(e, n, i) {
	return await r(), ((await t.DataUtil.loadJSON(`data/${e}`))[n] ?? []).map((e) => ({
		id: e.id,
		source: t.SourceUtil.getEntitySource(e),
		hash: t.UrlUtil.URL_TO_HASH_BUILDER[i](e)
	}));
}
async function v(e, n, i) {
	return await r(), t.DataLoader.pCacheAndGet(e, n, i, { isRequired: !0 });
}
async function y() {
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
async function b(e, n) {
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
async function x(e, n, i) {
	return await r(), t.ExcludeUtil.isExcluded(e, n, i, { isNoCount: !0 });
}
var S = {
	init: r,
	loaders: h,
	parseProp: g,
	corpusList: _,
	parseCorpus: v,
	searchIndexHashes: y,
	setSourceExcluded: b,
	isExcluded: x,
	excludedFlags: u,
	detail: d,
	search: f,
	searchSettings: m
}, C = [
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
], w = globalThis, T = new URLSearchParams(location.search).get("frame") ?? "";
addEventListener("message", (t) => {
	let n = t.data;
	if (t.source !== parent || !n || n.channel !== "trpg-library" || n.type !== "call") return;
	let r = (t) => parent.postMessage({
		channel: e,
		type: "result",
		frame: T,
		id: n.id,
		...t
	}, location.origin), i = S[n.fn];
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
var E = {
	channel: e,
	type: "ready",
	frame: T,
	codeSet: new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "",
	authorVersion: typeof w.VERSION_NUMBER == "string" ? w.VERSION_NUMBER : null,
	present: Object.fromEntries(C.map((e) => [e, w[e] !== void 0])),
	errors: [...w.__trpgFrameErrors ?? []]
};
parent.postMessage(E, location.origin);
