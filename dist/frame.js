// src/library/runtime/protocol.ts
var e = "trpg-library", t = globalThis, n = null;
function r() {
	return n ??= (async () => {
		t.Renderer.get().setBaseUrl(""), await t.PrereleaseUtil.pInit(), await t.BrewUtil2.pInit(), await t.ExcludeUtil.pInitialise();
	})(), n;
}
async function i() {
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
function a(e, n) {
	let r = t.UrlUtil.URL_TO_HASH_BUILDER[e] ?? t.UrlUtil.URL_TO_HASH_BUILDER[t.DataLoader.getPropPage(e)];
	try {
		return r ? r(n) : null;
	} catch {
		return null;
	}
}
async function o(e) {
	await r();
	let n = await t.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: n,
		hashes: n.map((t) => a(e, t))
	};
}
async function s(e, n, i) {
	return await r(), ((await t.DataUtil.loadJSON(`data/${e}`))[n] ?? []).map((e) => ({
		id: e.id,
		source: t.SourceUtil.getEntitySource(e),
		hash: t.UrlUtil.URL_TO_HASH_BUILDER[i](e)
	}));
}
async function c(e, n, i) {
	return await r(), t.DataLoader.pCacheAndGet(e, n, i, { isRequired: !0 });
}
async function l() {
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
async function u(e, n) {
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
async function d(e, n, i) {
	return await r(), t.ExcludeUtil.isExcluded(e, n, i, { isNoCount: !0 });
}
var f = {
	init: r,
	loaders: i,
	parseProp: o,
	corpusList: s,
	parseCorpus: c,
	searchIndexHashes: l,
	setSourceExcluded: u,
	isExcluded: d
}, p = [
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
], m = globalThis, h = new URLSearchParams(location.search).get("frame") ?? "";
addEventListener("message", (t) => {
	let n = t.data;
	if (t.source !== parent || !n || n.channel !== "trpg-library" || n.type !== "call") return;
	let r = (t) => parent.postMessage({
		channel: e,
		type: "result",
		frame: h,
		id: n.id,
		...t
	}, location.origin), i = f[n.fn];
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
var g = {
	channel: e,
	type: "ready",
	frame: h,
	codeSet: new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "",
	authorVersion: typeof m.VERSION_NUMBER == "string" ? m.VERSION_NUMBER : null,
	present: Object.fromEntries(p.map((e) => [e, m[e] !== void 0])),
	errors: [...m.__trpgFrameErrors ?? []]
};
parent.postMessage(g, location.origin);
