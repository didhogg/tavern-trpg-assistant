import { i as e, n as t } from "./images-CXj1lnTx.js";
import { t as n } from "./protocol-03CO7Rhf.js";
// src/library/runtime/frame/author.ts
var r = globalThis, i = null;
function a() {
	return i ??= (async () => {
		r.Renderer.get().setBaseUrl(""), await r.PrereleaseUtil.pInit(), await r.BrewUtil2.pInit(), await r.ExcludeUtil.pInitialise();
	})(), i;
}
function o(e, t) {
	return e ? e[t] ?? e[r.DataLoader.getPropPage(t)] ?? null : null;
}
function s(e, t) {
	let n = o(r.UrlUtil.URL_TO_HASH_BUILDER, e);
	try {
		return n ? n(t) : null;
	} catch {
		return null;
	}
}
function c(e, t) {
	let n = r.UrlUtil.URL_TO_ENG_HASH_BUILDER, i = r.DataLoader.getPropPage(e);
	return !n || !t?.ENG_name || !n[i] ? null : n[i](t);
}
function l(e) {
	return r.SourceUtil.getEntitySource(e) ?? null;
}
// src/library/runtime/frame/tag-commands.ts
function u(e) {
	let t = r.DataLoader._PROP_TO_HASH_PAGE, n = Object.entries(t).filter(([, t]) => t === e).map(([e]) => e);
	return n.length ? n : Object.keys(t).filter((t) => t.toLowerCase() === e.toLowerCase());
}
function d(e, t) {
	let n = e === "@book" ? "book.html" : "adventure.html", { displayText: i, id: a, ixChapter: o, sectionName: s, ixNamedSection: c } = r.UidUtil.unpackUidAdventureBook(t);
	return {
		tag: e,
		name: String(i ?? a ?? ""),
		displayText: String(i ?? a ?? ""),
		source: a ?? null,
		page: n,
		hash: String(a ?? "").toLowerCase(),
		props: u(n),
		part: {
			chapter: o ?? null,
			section: s ?? null,
			ixNamedSection: c ?? null
		}
	};
}
async function f(e, t) {
	await a();
	let n = e.startsWith("@") ? e : `@${e}`;
	if (n === "@book" || n === "@adventure") return d(n, t);
	let i;
	try {
		i = r.Renderer.utils.getTagMeta(n, t);
	} catch {
		return null;
	}
	if (!i) return null;
	let o = i.pageHover ?? i.page, s = i.hashHover ?? i.hash, c = i.sourceHover ?? i.source;
	return {
		tag: n,
		name: String(i.name ?? ""),
		displayText: String(i.displayText ?? i.linkText ?? i.name ?? ""),
		source: c ?? null,
		page: o,
		hash: s,
		props: u(o)
	};
}
async function p(e) {
	await a();
	let t = /* @__PURE__ */ new Map(), n = async (e, n) => {
		let r = `${e} ${n}`, i = t.get(r);
		if (!i) {
			let a = await f(e, n);
			i = a && a.hash ? a.props.map((e) => `${e}|${a.hash}`) : [], t.set(r, i);
		}
		return i;
	}, i = async (e, t) => {
		if (e.includes("{@")) for (let a of r.Renderer.splitByTags(e)) {
			if (!a.startsWith("{@")) continue;
			let [e, o] = r.Renderer.splitFirstSpace(a.slice(1, -1));
			for (let r of await n(e, o)) t.add(r);
			await i(o, t);
		}
	}, o = async (e, t) => {
		if (typeof e == "string") return i(e, t);
		if (Array.isArray(e)) for (let n of e) await o(n, t);
		else if (e && typeof e == "object") for (let n of Object.values(e)) await o(n, t);
	}, s = [];
	for (let t of e) {
		let e = /* @__PURE__ */ new Set();
		await o(t, e), s.push([...e]);
	}
	return s;
}
// src/library/runtime/frame/author-markup.ts
function m(e, t) {
	let n = e.href;
	if (n.type === "external") return n.url ? {
		kind: "external",
		url: n.url
	} : null;
	if (n.type !== "internal" || !n.path) return null;
	if (n.hash === r.HASH_BLANK) return {
		kind: "filter",
		path: t
	};
	let i = n.hover?.page ?? n.path, a = n.hover?.hash ?? n.hash;
	if (!a) return null;
	if (i === "book.html" || i === "adventure.html") {
		let [e, t, n, o] = a.split(r.HASH_PART_SEP), s = n ?? "";
		try {
			s = decodeURIComponent(s);
		} catch {
			return null;
		}
		return {
			kind: "library",
			meta: d(i === "book.html" ? "@book" : "@adventure", [
				"",
				e,
				t,
				s,
				o
			].join("|"))
		};
	}
	let o = u(i);
	if (!o.length) return null;
	let s = n.hover?.hash ? n.hover.hashPreEncoded : n.hashPreEncoded;
	return {
		kind: "library",
		meta: {
			tag: "",
			name: "",
			displayText: "",
			page: i,
			props: o,
			source: n.hover?.source ?? null,
			hash: s ? a : r.UrlUtil.encodeForHash(a)
		}
	};
}
function h(t) {
	let n = r.Renderer.get(), i = e(), a = [];
	return {
		value: n.withPlugin({
			pluginTypes: ["link"],
			fnPlugin: (e, { input: t }) => {
				let r = m(t, n._renderLink_getHref(t));
				if (!r) return { isDisableEvents: !0 };
				let o = a.push(r) - 1;
				return {
					isDisableEvents: !0,
					attributes: `data-trpg-link="${i}:${o}"`
				};
			},
			fn: t
		}),
		marker: i,
		links: a
	};
}
async function g(e) {
	await a();
	let { value: t, marker: n, links: i } = h(() => String(r.Renderer.get().render(e)));
	return {
		html: t,
		marker: n,
		links: i
	};
}
// src/library/runtime/frame/field-commands.ts
var _ = (e) => String(e ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(), v = (e) => Array.isArray(e) ? e.map(_).filter(Boolean).join("、") : _(e), ee = {
	spell: (e) => [["成分", e.components ? r.Parser.spComponentsToFull(e.components, e.level, { isPlainText: !0 }) : ""], ["持续时间", e.duration ? r.Parser.spDurationToFull(e.duration, { isPlainText: !0 }) : ""]],
	class: (e) => {
		let t = e.startingProficiencies ?? {}, n = { styleHint: e.edition ?? "classic" };
		return [
			["护甲受训", t.armor ? r.Renderer.class.getRenderedArmorProfs(t.armor, n) : ""],
			["武器熟练", t.weapons ? r.Renderer.class.getRenderedWeaponProfs(t.weapons, n) : ""],
			["工具熟练", t.tools ? r.Renderer.class.getRenderedToolProfs(t.tools, n) : ""],
			["技能熟练", t.skills ? r.Renderer.class.getRenderedSkillProfs(t.skills, n) : ""],
			["起始装备", Array.isArray(e.startingEquipment?.default) ? e.startingEquipment.default.join("；") : ""]
		];
	},
	deity: (e) => [
		["神系", e.pantheon],
		["阵营", Array.isArray(e.alignment) ? r.Parser.alignmentListToFull(e.alignment) : ""],
		["类别", e.category],
		["领域", Array.isArray(e.domains) ? e.domains.join("、") : ""],
		["权能", e.province],
		["象征", e.symbol]
	]
};
async function te(e, t) {
	await a();
	let n = ee[e], i = [];
	if (n) try {
		let { value: e, marker: r, links: a } = h(() => n(t));
		for (let [t, n] of e) {
			let e = Array.isArray(n) ? v(n) : _(n), o = typeof n == "string" && n.includes(r) ? {
				html: n,
				marker: r,
				links: a
			} : void 0;
			(e || o) && i.push({
				label: t,
				value: e,
				...o ? { markup: o } : {}
			});
		}
	} catch (e) {
		i.push({
			label: "读取失败",
			value: e instanceof Error ? e.message : String(e)
		});
	}
	let o = null;
	if (e === "class") try {
		o = Array.from({ length: 20 }, (e, t) => `+${r.Parser.levelToPb(t + 1)}`);
	} catch {
		o = null;
	}
	return {
		lines: i,
		pb: o
	};
}
// src/library/runtime/frame/entry-commands.ts
var ne = { itemProperty: (e) => r.Renderer.itemProperty.getItemPropertyRenderableEntriesMeta(e).entryFaux.name };
async function re(e, t) {
	await a();
	let n = ne[e], r = n ? n(t) : t?.name;
	return typeof r == "string" && r ? r : null;
}
async function ie(e) {
	await a();
	let t = r.Renderer.get().render(e), n = document.createElement("div");
	return n.innerHTML = t, (n.textContent ?? "").replace(/\s+/g, " ").trim();
}
async function ae(e) {
	await a();
	let t = r.Renderer.utils.getStatblockEntryMeta(e), n = String(t.prop ?? ""), i = !!t.isFluff;
	return {
		prop: n,
		target: i ? n.replace(/Fluff$/, "") : n,
		source: t.source ?? null,
		hash: t.hash ?? null,
		displayName: t.displayName ?? null,
		isFluff: i
	};
}
var oe = { legendaryGroup: (e) => r.Renderer.legendaryGroup.getSummaryEntry(e) };
async function se(e, t) {
	await a();
	let n = oe[e];
	return (n ? n(t) : null) ?? null;
}
// src/library/runtime/frame/sort-commands.ts
var ce = (e) => ["js/filter-common.js", `js/filter-${e}.js`], y = /* @__PURE__ */ new Set();
async function le(e) {
	y.has(e) || (y.add(e), await new Promise((t) => {
		let n = document.createElement("script");
		n.src = e, n.onload = () => t(), n.onerror = () => t(), document.head.appendChild(n);
	}));
}
async function b(e) {
	await a();
	let t = String(r.DataLoader.getPropPage(e) ?? "").replace(/\.html$/, "");
	if (!t) return null;
	for (let e of ce(t)) await le(e);
	let n = Object.keys(r).find((e) => e.startsWith("ModalFilter") && e.toLowerCase() === `modalfilter${t}`);
	return n && typeof r[n] == "function" ? {
		Cls: r[n],
		page: t
	} : null;
}
function x(e, t) {
	let n = r.UrlUtil.getCurrentPage;
	r.UrlUtil.getCurrentPage = () => `${e}.html`;
	try {
		return t();
	} finally {
		r.UrlUtil.getCurrentPage = n;
	}
}
async function S(e) {
	let t = await b(e);
	return t ? t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})).filter((e) => !!e.sort) : [];
}
async function C(e, t) {
	let n = [...await r.DataLoader.pCacheAndGetAllSite(t) ?? [], ...await r.DataLoader.pCacheAndGetAllBrew(t) ?? []];
	return x(e.page, () => {
		let t = new e.Cls({ namespace: "trpg-sort" }), r = n.map((e) => structuredClone(e));
		r.forEach((e) => t._pageFilter.mutateAndAddToFilters(e));
		let i = {
			_previewButtonHandler: { bindPreviewButton() {} },
			_isRadio: !1,
			_getNameStyle: () => ""
		};
		return {
			inst: t,
			entities: r,
			items: r.map((n, r) => e.Cls.prototype._getListItem.call(i, t._pageFilter, n, r))
		};
	});
}
async function ue(e, t, n) {
	let i = await b(e);
	if (!i || !(await S(e)).some((e) => e.sort === t)) return null;
	let { inst: a, entities: o, items: c } = await C(i, e);
	return x(i.page, () => {
		let i = {
			_filteredItems: c,
			_sortBy: t,
			_sortDir: n,
			_fnSort: a._fnSort,
			_wrpList: { previousElementSibling: { querySelector: () => ({}) } },
			constructor: r.List
		}, l = r.List.prototype.getSortedItems.call(i, { items: [...c] }), u = new Map(c.map((e, t) => [e, t])), d = {};
		return l.forEach((t, n) => {
			let r = s(e, o[u.get(t)]);
			r && !(r in d) && (d[r] = n);
		}), d;
	});
}
async function de(e) {
	let t = await b(e);
	if (!t) return null;
	let n = t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})), { entities: r, items: i } = await C(t, e), a = {};
	return i.forEach((t, i) => {
		let o = s(e, r[i]);
		if (!o || o in a) return;
		let c = [...t.ele?.firstElementChild?.children ?? []].map((e) => String(e.textContent ?? "").replace(/\s+/g, " ").trim());
		a[o] = n.map((e, t) => c[c.length - n.length + t] ?? "");
	}), {
		columns: n,
		cells: a
	};
}
// src/library/runtime/frame/read-commands.ts
function w(e, t, n) {
	let i = l(t);
	return i ? r.DataLoader.getPropPage(e) === r.UrlUtil.PG_ITEMS && r.Renderer.item.isExcluded(t, { hash: n }) ? !0 : r.ExcludeUtil.isExcluded(n ?? "", t.__prop ?? e, i, { isNoCount: !0 }) : !1;
}
async function fe(e, t = "site") {
	if (await a(), !r.ExcludeUtil.getList().length) return {
		hashes: [],
		excluded: null
	};
	let n = await (t === "brew" ? r.DataLoader.pCacheAndGetAllBrew(e) : r.DataLoader.pCacheAndGetAllSite(e)) ?? [], i = n.map((t) => s(e, t));
	return {
		hashes: i,
		excluded: n.map((t, n) => w(e, t, i[n]))
	};
}
async function pe(e, t, n) {
	await a();
	let i = n ? await r.DataLoader.pCacheAndGet(e, n, t) : await r.DataLoader.pCacheAndGetHash(e, t);
	if (!i) return null;
	let o = null, s = null;
	try {
		o = await r.Renderer.utils.pGetProxyFluff({
			entity: i,
			prop: e
		}) ?? null;
	} catch (e) {
		s = e instanceof Error ? e.message : String(e);
	}
	return {
		item: i,
		hash: t,
		source: l(i),
		excluded: w(e, i, t),
		fluff: o,
		fluffError: s,
		engSiteHash: c(e, i)
	};
}
async function me(e, t = null) {
	await a();
	let n = t === null ? null : await T(), i = n?.isShowLegacy;
	n && (n.isShowLegacy = t);
	try {
		return (await r.OmnisearchBacking.pGetResults(r.CleanUtil.getCleanString(e))).map((e) => ({
			score: e.score,
			prop: r.Parser.pageCategoryToProp(e.doc.c),
			doc: e.doc
		}));
	} finally {
		n && (n.isShowLegacy = i);
	}
}
async function T() {
	return (await import(
		/* @vite-ignore */
		new URL("js/omnisearch/omnisearch-state.js", location.href).href
)).OmnisearchState;
}
async function he(e = {}) {
	await a();
	let t = await T();
	for (let [n, r] of Object.entries(e)) {
		if (!(n in t._DEFAULT_STATE)) throw Error(`作者的搜索设置里没有这一项：${n}`);
		n === "partneredMode" ? t.setPartneredMode(r) : t[n] = r;
	}
	return t._getComp().toObject();
}
async function ge() {
	await a();
	let e = r.OmnisearchBacking;
	return await e._pInit(), {
		json: JSON.stringify(e._searchIndex.toJSON()),
		maxId: e._maxId ?? null,
		categoryCounts: e._CATEGORY_COUNTS ?? {},
		adventureBookLookup: e._adventureBookLookup ?? {}
	};
}
async function _e(e) {
	await a(), r.SearchUtil._initSearchIndex_getFnFold();
	let t = r.OmnisearchBacking;
	return t._searchIndex = r.elasticlunr.Index.load(JSON.parse(e.json)), t._maxId = e.maxId, t._CATEGORY_COUNTS = e.categoryCounts, t._adventureBookLookup = e.adventureBookLookup, t._pLoadSearch = Promise.resolve(), t._initReInCategory(), !0;
}
// src/library/runtime/frame/brew-commands.ts
async function E(e) {
	await a();
	let t = r.__trpgFrameErrors, n = t.length, i = await e();
	return await new Promise((e) => setTimeout(e, 50)), {
		value: i,
		errors: t.slice(n)
	};
}
var D = (e) => ({
	head: e.head,
	meta: e.body?._meta ?? null
});
function ve() {
	return E(() => r.BrewUtil2.pGetCombinedIndexes());
}
async function ye() {
	return await a(), (await r.BrewUtil2.pGetBrew()).map(D);
}
async function be() {
	await a();
	let e = [];
	for (let [t, n] of [["brew", r.BrewUtil2], ["prerelease", r.PrereleaseUtil]]) {
		let r = new Set((await n.pGetBrew()).map((e) => e.head.docIdLocal));
		for (let i of await n._pGetBrewRaw() ?? []) e.push({
			kind: t,
			head: i.head,
			sources: (i.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
			shown: r.has(i.head.docIdLocal)
		});
	}
	return e;
}
async function O(e) {
	let t = await E(() => r.BrewUtil2.pAddBrewFromUrl(e));
	return {
		...t,
		value: (t.value ?? []).map(D)
	};
}
async function k() {
	await a();
	let e = r.BrewUtil2, t = await e._LOCK.pLock();
	try {
		return e._cache_brewsProc = null, await e._pGetBrewProcessed_({ lockToken: t }), {
			ok: !0,
			error: null,
			missing: []
		};
	} catch (n) {
		e._cache_brewsProc = null;
		let r = n instanceof Error ? n.message : String(n), i = new Set([...r.matchAll(/source "([^"]+)"/g)].map((e) => e[1].toLowerCase())), a = await e.pGetBrew({ lockToken: t }), o = new Set(a.flatMap((e) => (e.body?._meta?.sources ?? []).map((e) => String(e?.json ?? "").toLowerCase()))), s = /* @__PURE__ */ new Map();
		for (let t of a) {
			let { available: n, unavailable: r } = e._getBrewDependencySources({
				brewDoc: t,
				brewIndex: {}
			});
			for (let e of [...n, ...r]) {
				let n = e.toLowerCase();
				if (o.has(n) && !i.has(n) || i.size && !i.has(n)) continue;
				let r = s.get(n) ?? {
					source: e,
					packs: []
				};
				r.packs.push({
					docIdLocal: String(t.head?.docIdLocal ?? ""),
					filename: t.head?.filename ?? null
				}), s.set(n, r);
			}
		}
		return {
			ok: !1,
			error: r,
			missing: [...s.values()]
		};
	} finally {
		e._LOCK.unlock();
	}
}
async function A(e) {
	return await a(), E(async () => {
		let t = r.BrewUtil2, n = await t._pGetBrewDocFromUrl({ url: e }), i = await t._pGetBrewDependencies_getBrewIndex({
			urlRoot: await t.pGetCustomUrl(),
			isIgnoreNetworkErrors: !0
		}), { available: a, unavailable: o } = t._getBrewDependencySources({
			brewDoc: n,
			brewIndex: i
		}), s = new Set((await t.pGetBrew()).flatMap((e) => (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean)));
		return {
			sources: (n.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
			dependencies: a.map((e) => ({
				source: e,
				file: String(i[e] ?? "").split("/").pop() ?? e,
				installed: s.has(e)
			})),
			unavailable: o
		};
	});
}
async function j(e) {
	let t = await E(async () => {
		let t = [], n = [], i = new Set((await r.BrewUtil2.pGetBrew()).map((e) => e.head.docIdLocal));
		return await Promise.all(e.map(async (e) => {
			let i = await r.BrewUtil2.pGetSourceUrl(e);
			if (!i) t.push(e);
			else try {
				await r.BrewUtil2.pAddBrewFromUrl(i, { isLazy: !0 });
			} catch {
				n.push(e);
			}
		})), await r.BrewUtil2.pAddBrewsLazyFinalize(), {
			added: (await r.BrewUtil2.pGetBrew()).filter((e) => !i.has(e.head.docIdLocal)),
			notFound: [...t, ...n]
		};
	});
	return {
		errors: t.errors,
		value: {
			added: t.value.added.map(D),
			notFound: t.value.notFound
		}
	};
}
async function M(e) {
	let t = [], n = [];
	for (let r of e) try {
		n.push({
			name: r.name,
			json: JSON.parse(r.text)
		});
	} catch (e) {
		t.push({
			name: r.name,
			error: e instanceof Error ? e.message : String(e)
		});
	}
	let i = await E(async () => {
		let [e, t] = n.segregate((e) => r.BrewUtil2.constructor._isPrereleaseDroppedJson(e.json)), i = [];
		return e.length && i.push(...await r.PrereleaseUtil.pAddBrewsFromFiles(e) ?? []), t.length && i.push(...await r.BrewUtil2.pAddBrewsFromFiles(t) ?? []), i;
	});
	return {
		errors: i.errors,
		value: {
			added: i.value.map(D),
			notJson: t
		}
	};
}
async function N(e) {
	return E(async () => {
		let t = new Set(e), n = (await r.BrewUtil2.pGetBrew()).filter((e) => t.has(e.head.docIdLocal));
		return await r.BrewUtil2.pDeleteBrews(n), n.length;
	});
}
async function xe(e = null) {
	let t = await E(async () => {
		let t = e ? (await r.BrewUtil2.pGetBrew()).filter((t) => e.includes(t.head.docIdLocal)) : null;
		return r.BrewUtil2.pPullAllBrews({ brews: t });
	});
	return {
		...t,
		value: (t.value ?? []).map(D)
	};
}
async function Se(e, t) {
	return await a(), ((await r.BrewUtil2.pGetBrewProcessed())?.[e] ?? []).map((e) => ({
		id: e.id,
		name: e.name,
		source: r.SourceUtil.getEntitySource(e),
		hash: r.UrlUtil.URL_TO_HASH_BUILDER[t](e)
	}));
}
async function Ce(e = null) {
	return E(async () => {
		let t = r.BrewUtil2, n = (await t.pGetBrew()).filter((n) => t.isPullable(n) && (!e || e.includes(n.head.docIdLocal))), i = [];
		for (let e of n) {
			let t = e.body._meta?.dateLastModified ?? 0;
			try {
				let n = await r.DataUtil.loadRawJSON(e.head.url, { isBustCache: !0 }), a = n._meta?.dateLastModified ?? 0;
				i.push({
					docIdLocal: e.head.docIdLocal,
					filename: e.head.filename ?? null,
					url: e.head.url,
					local: t,
					remote: a,
					hasUpdate: a > t,
					approxBytes: new TextEncoder().encode(JSON.stringify(n)).length,
					error: null
				});
			} catch (n) {
				i.push({
					docIdLocal: e.head.docIdLocal,
					filename: e.head.filename ?? null,
					url: e.head.url,
					local: t,
					remote: 0,
					hasUpdate: !1,
					approxBytes: null,
					error: n instanceof Error ? n.message : String(n)
				});
			}
		}
		return i;
	});
}
async function we(e) {
	await a();
	let t = await r.DataLoader.pCacheAndGetAllBrew(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => s(e, t)),
		sources: t.map((e) => l(e))
	};
}
function Te(e, t, n, r, i) {
	if (t._versionBase_hash) return r.has(t._versionBase_hash);
	if (t._isSubRace && t._subraceName) {
		let e = s("subrace", {
			name: t._subraceName,
			raceName: t._baseName,
			source: l(t)
		});
		return !!e && (i.subrace ?? []).includes(e);
	}
	if (t.genericVariant) {
		let e = s("magicvariant", t.genericVariant);
		return !!e && (i.magicvariant ?? []).includes(e);
	}
	return e === "item" && t._isItemGroup ? (i.itemGroup ?? []).includes(n) : r.has(n);
}
async function Ee(e) {
	await a();
	let t = {};
	for (let n of new Set(r.DataLoader._DATA_TYPE_LOADER_LIST)) {
		let i = n.constructor.PAGE;
		if (r.UrlUtil._PAGE_TO_PROPS_CORPUS[i]) continue;
		let a = n.constructor.PROPS, o = i === r.UrlUtil.PG_ITEMS || i === r.UrlUtil.PG_RACES ? r.UrlUtil.PAGE_TO_PROPS[i] ?? [] : [];
		for (let n of a) {
			if (n.startsWith("raw_")) continue;
			let a = n === o[0];
			if (!e[n]?.length && !(a && o.some((t) => e[t]?.length))) continue;
			let c = new Set(e[n] ?? []);
			if (a && i === r.UrlUtil.PG_ITEMS) for (let t of o.filter((e) => r.UrlUtil.URL_TO_HASH_BUILDER[e] === r.UrlUtil.URL_TO_HASH_BUILDER[i])) for (let n of e[t] ?? []) c.add(n);
			let u = (await r.DataLoader.pCacheAndGetAllBrew(n) ?? []).flatMap((t) => {
				let r = s(n, t);
				return !r || !Te(n, t, r, c, e) ? [] : [{
					hash: r,
					item: t,
					source: l(t),
					excluded: w(n, t, r)
				}];
			});
			u.length && (t[n] = u);
		}
	}
	return t;
}
// src/library/runtime/frame/english-commands.ts
async function De(e) {
	await a();
	let t = e ? new Set(e.map((e) => e.toUpperCase())) : null, n = [], i = async (e, i, a) => {
		let o = new r.Omnidexer();
		await o.pAddToIndex(e, i, {
			isNoFilter: !0,
			isIncludeEntityLocator: !0
		});
		for (let e of o.getIndex().x) {
			if (!e._entityLocator) continue;
			let i = e._entityLocator.source ? String(e._entityLocator.source).toUpperCase() : null;
			t && i && !t.has(i) || n.push({
				prop: r.Parser.pageCategoryToProp(e.c),
				hash: e.u,
				file: a,
				locator: e._entityLocator
			});
		}
	};
	for (let e of r.Omnidexer.TO_INDEX__FROM_INDEX_JSON) {
		let t = await r.DataUtil.loadRawJSON(`data/${e.dir}/index.json`);
		for (let n of Object.values(t)) {
			let t = `data/${e.dir}/${n}`;
			await i(e, await r.DataUtil.loadRawJSON(t), t);
		}
	}
	for (let e of r.Omnidexer.TO_INDEX) {
		let t = `data/${e.file}`;
		await i(e, await r.DataUtil.loadJSON(t), t);
	}
	return n;
}
async function Oe(e) {
	await a();
	let t = /* @__PURE__ */ new Map(), n = (e) => {
		let n = t.get(e);
		return n || (n = r.DataUtil.loadRawJSON(e), t.set(e, n)), n;
	}, i = [];
	for (let t of e) {
		let e;
		try {
			e = await n(t.file);
		} catch (e) {
			i.push({
				prop: t.prop,
				hash: t.hash,
				enHash: null,
				enSource: null,
				via: null,
				error: e instanceof Error ? e.message : String(e)
			});
			continue;
		}
		let a = t.locator, o = a ? r.Omnidexer.getProperty(e, a.prop) : null, c = (e) => e?.name === a.name && (a.source == null || e.source === a.source), u = o?.filter((e) => e.source === a.source && e.page === a.page) || [], d = null, f = o?.find(c);
		f ? d = "name" : (f = Object.values(e).filter(Array.isArray).flat().find(c)) ? d = "name-any-array" : (f = o?.length === a.count ? o[a.ix] : null) ? d = "position" : (f = u[a.ixSourcePage]) && (d = "source-page"), i.push({
			prop: t.prop,
			hash: t.hash,
			enHash: f ? s(a.prop, f) : null,
			enSource: f ? l(f) : null,
			via: d
		});
	}
	return i;
}
async function ke() {
	return await a(), ((await r.DataUtil.item.loadRawJSON())?.magicvariant ?? []).map((e) => ({
		name: e.name,
		eng: e.ENG_name ?? null,
		source: e.inherits?.source ?? e.source ?? null
	}));
}
async function Ae(e) {
	await a();
	let t = {};
	for (let n of e) {
		let e = await r.DataLoader.pCacheAndGetAllSite(n) ?? [];
		for (let i of e) {
			if (!i?._versions?.length) continue;
			let e = s(n, i);
			if (!e) continue;
			let a = r.DataUtil.generic.getVersions(i);
			(t[n] ??= {})[e] = a.map((e) => s(n, e)).filter((e) => !!e);
		}
	}
	return t;
}
// src/library/runtime/frame/edit-commands.ts
var P = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function F(e) {
	await a();
	let t = {};
	for (let n of e) t[n] = r.BrewUtil2.hasSourceJson(n) || r.PrereleaseUtil.hasSourceJson(n) ? {
		classic: !!r.SourceUtil.isClassicSource(n),
		basis: "brew-meta"
	} : r.Parser.sourceJsonToDate(n) ? {
		classic: !!r.SourceUtil.isClassicSource(n),
		basis: "date"
	} : {
		classic: null,
		basis: null
	};
	return t;
}
async function je(e) {
	return await a(), Object.fromEntries(e.map((e) => [e, {
		full: r.Parser.sourceJsonToFull(e),
		abv: r.Parser.sourceJsonToAbv(e)
	}]));
}
var Me = (e) => {
	let t = [], n = /* @__PURE__ */ new Set(), r = (e) => {
		let r = `${e.kind}|${e.prop}|${String(e.source).toLowerCase()}|${e.hash ?? ""}`;
		n.has(r) || (n.add(r), t.push(e));
	};
	for (let t of ["dependencies", "includes"]) for (let [n, i] of Object.entries(e?._meta?.[t] ?? {})) for (let e of Array.isArray(i) ? i : []) r({
		kind: t === "dependencies" ? "dependency" : "include",
		prop: n,
		source: String(e)
	});
	for (let [t, n] of Object.entries(e?._meta?.otherSources ?? {})) for (let e of Object.keys(n ?? {})) r({
		kind: "otherSource",
		prop: t,
		source: e
	});
	for (let [t, n] of Object.entries(e ?? {})) if (!t.startsWith("_") && Array.isArray(n)) for (let e of n) {
		let n = e?._copy;
		if (!n || typeof n != "object") continue;
		let i = String(n.source ?? "");
		i && r({
			kind: "copy",
			prop: t,
			source: i,
			hash: s(t, n)
		});
	}
	return t;
};
async function Ne() {
	return await a(), (await r.BrewUtil2.pGetBrew()).map((e, t) => ({
		docIdLocal: e.head.docIdLocal,
		filename: e.head.filename ?? null,
		url: e.head.url ?? null,
		timeAdded: e.head.timeAdded ?? 0,
		order: t,
		isEditable: !!e.head.isEditable,
		sources: (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
		props: Object.fromEntries(Object.entries(e.body ?? {}).filter(([e, t]) => !e.startsWith("_") && Array.isArray(t)).map(([e, t]) => [e, t.map((t) => t && typeof t == "object" ? s(e, t) : null)])),
		requires: Me(e.body)
	}));
}
async function I(e = null) {
	await a();
	let t = await r.BrewUtil2.pGetBrew();
	return e ? t.filter((t) => e.includes(t.head.docIdLocal)) : t;
}
async function Pe(e) {
	await a();
	let t = {};
	for (let { prop: n, hash: i } of e) {
		await r.DataLoader.pCacheAndGetAllBrew(n);
		let e = await r.DataLoader.pCacheAndGetHash(n, i);
		e && ((await r.DataLoader.pCacheAndGetAllSite(n) ?? []).includes(e) || (t[`${n}|${i}`] = e));
	}
	return t;
}
async function L(e, t) {
	return await a(), `data/${e}/${e}-${r.UrlUtil.encodeForHash(t.toLowerCase())}.json`;
}
async function Fe(e) {
	let t = (await I([e]))[0];
	return t ? {
		filename: t.head.filename ?? null,
		body: t.body
	} : null;
}
async function Ie(e, t) {
	await a();
	try {
		return {
			fluff: await r.Renderer.utils.pGetProxyFluff({
				entity: t,
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
async function Le(e, t) {
	await a();
	let n = {};
	for (let i of t) {
		let t = s(e, i);
		if (t) try {
			n[t] = {
				fluff: await r.Renderer.utils.pGetProxyFluff({
					entity: i,
					prop: e
				}) ?? null,
				fluffError: null,
				engSiteHash: c(e, i)
			};
		} catch (e) {
			n[t] = {
				fluff: null,
				fluffError: e instanceof Error ? e.message : String(e),
				engSiteHash: null
			};
		}
	}
	return n;
}
async function Re() {
	return await a(), r.ExcludeUtil.getList();
}
async function R() {
	return await a(), r.BrewUtil2.pGetOrCreateEditableBrewDoc();
}
async function ze(e) {
	return ((await R()).body?._meta?.sources ?? []).some((t) => String(t.json).toLowerCase() === e.json.toLowerCase()) || await r.BrewUtil2.pAddSource({
		authors: [],
		convertedBy: [],
		version: "1",
		...e
	}), ((await R()).body?._meta?.sources ?? []).map((e) => e.json);
}
async function Be(e, t) {
	await a();
	let n = {
		...t,
		uniqueId: t.uniqueId ?? r.CryptUtil.uid()
	};
	return await r.BrewUtil2.pPersistEditableBrewEntity(e, n), {
		uniqueId: n.uniqueId,
		hash: s(e, n)
	};
}
async function Ve(e, t) {
	await a(), await r.BrewUtil2.pRemoveEditableBrewEntities(e, t);
}
async function He(e) {
	let t = r.MiscUtil.copyFast(await R()), n = t.body._meta.dependencies ??= {};
	for (let [t, r] of Object.entries(e)) n[t] = [.../* @__PURE__ */ new Set([...n[t] ?? [], ...r])];
	return await r.BrewUtil2.pSetEditableBrewDoc(t), n;
}
var z = {
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
}, Ue = {
	text: "doParseText",
	markdown: "doParseMarkdown",
	html: "doParseHtml"
}, B = null;
function We() {
	return B ??= (async () => {
		await a();
		let [{ TagCondition: e, TaggerUtils: t }, { TagJsons: n }, { AcConvert: i, AttachedItemTag: o, MiscTag: s, SpellcastingTraitConvert: c }, { ConverterItem: l }, { RaceTraitTag: u }, { InstrumentBaseItemTag: d }] = await Promise.all([
			P("converter/converterutils-tags.js"),
			P("converter/converterutils-entries.js"),
			P("converter/converterutils-creature.js"),
			P("converter/converter-item.js"),
			P("converter/converterutils-race.js"),
			P("converter/converterutils-item.js")
		]), [f, p, m, h, g, _] = await Promise.all([
			r.DataUtil.spell.pLoadAll(),
			r.Renderer.item.pBuildList(),
			r.DataUtil.item.loadRawJSON(),
			r.DataUtil.legendaryGroup.pLoadAll(),
			r.DataUtil.class.loadJSON(),
			r.BrewUtil2.pGetBrewProcessed()
		]), v = p.filter((e) => !e._isItemGroup);
		c.init(f), l.init(v, g), i.init(v), t.init({
			legendaryGroups: h,
			spells: f
		}), await n.pInit({ spells: f }), u.init({ itemsRaw: m }), s.init({ items: p }), o.init({ items: p }), await e.pInit({ conditionsBrew: _.condition }), d.init({ items: v });
	})(), B.catch(() => {
		B = null;
	}), B;
}
async function Ge() {
	return Object.fromEntries(Object.entries(z).map(([e, t]) => [e, t.formats]));
}
async function Ke(e, t, n, r) {
	let i = z[e];
	if (!i) throw Error(`作者没有这一类的转换器：${e}`);
	if (!i.formats.includes(t)) throw Error(`作者的${e}转换器不支持这种格式：${t}（支持 ${i.formats.join("、")}）`);
	await We();
	let a = (await P(i.file))[i.cls], o = [], s = [];
	return a[Ue[t]](n, {
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
var qe = {
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
async function Je(e) {
	await a();
	let t = qe[e];
	if (!t) return null;
	let n = (await P(t.file))[t.cls];
	return n.prototype._getInitialState.call(Object.create(n.prototype));
}
// src/library/runtime/frame/directory-commands.ts
var Ye = (e) => e instanceof Error ? e.message : String(e);
async function V() {
	await a();
	let e = {}, t = /* @__PURE__ */ new Set();
	for (let n of r.DataLoader._DATA_TYPE_LOADER_LIST) for (let i of n.constructor.PROPS) {
		if (t.has(i) || i.startsWith("raw_")) continue;
		t.add(i);
		let n = r.DataUtil[i];
		if (!n || typeof n.pLoadIndex != "function") continue;
		let a = String(n._DIR ?? "");
		if (a) try {
			e[i] = {
				dir: a,
				indexPath: `data/${a}/${i.endsWith("Fluff") ? "fluff-" : ""}index.json`,
				index: await n.pLoadIndex()
			};
		} catch {}
	}
	let n;
	try {
		let e = await r.DataUtil.loadRawJSON("data/class/index.json");
		n = [...new Set(Object.values(e ?? {}).map((e) => `data/class/${String(e)}`))];
	} catch {
		n = [];
	}
	return {
		maps: e,
		classFiles: n
	};
}
async function Xe(e) {
	await a();
	let t = [];
	for (let n of e) try {
		let e = (await r.DataUtil.loadJSON(`data/${n.index}`))[n.prop] ?? [];
		t.push({
			prop: n.prop,
			items: e,
			files: await Promise.all(e.map((e) => L(n.prop, String(e.id)))),
			error: null
		});
	} catch (e) {
		t.push({
			prop: n.prop,
			items: [],
			files: [],
			error: Ye(e).split("\n")[0]
		});
	}
	let n = [...new Set(t.flatMap((e) => e.items.map((e) => r.SourceUtil.getEntitySource(e))))], i = n.length ? await F(n) : {}, o = {};
	for (let e of n) o[e] = {
		full: r.Parser.sourceJsonToFull(e),
		abv: r.Parser.sourceJsonToAbv(e),
		edition: i[e]
	};
	return {
		groups: r.SourceUtil.ADV_BOOK_GROUPS.map((e) => ({ ...e })),
		corpora: t,
		sources: o,
		sourceFiles: await V()
	};
}
// src/library/runtime/frame/dice-commands.ts
var H = (e) => r.Renderer.dice.lang.getTree3(e)?.tree ?? null, Ze = (e) => e.replace(/<[^>]+>/g, "");
async function Qe(e, t) {
	return await a(), r.Renderer.utils.getTagEntry(e.startsWith("@") ? e : `@${e}`, t);
}
async function $e(e) {
	await a();
	let t = H(e);
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
async function et(e) {
	if (await a(), !e.trim()) return {
		ok: !0,
		simple: !0,
		dice: [],
		mod: 0
	};
	try {
		if (!r.Renderer.dice.lang.getTree3(e, !1)?.tree) return {
			ok: !1,
			error: "作者骰子程序读不了这个骰式"
		};
	} catch (e) {
		return {
			ok: !1,
			error: Ze(e instanceof Error ? e.message : String(e))
		};
	}
	let t = r.Renderer.dice.tk, n = r.Renderer.dice.lang._lex3(e).lexed, i = (e) => e?.type === t.TYP_NUMBER && /^\d+$/.test(String(e.value)) ? Number(e.value) : null, o = [], s = 0, c = 0;
	for (; c < n.length;) {
		let e = 1;
		if (n[c] === t.ADD || n[c] === t.SUB) e = n[c] === t.SUB ? -1 : 1, c++;
		else if (c > 0) return {
			ok: !0,
			simple: !1
		};
		let r = i(n[c]);
		if (n[c] === t.DICE || n[c + 1] === t.DICE) {
			let a = n[c] === t.DICE ? c : c + 1, s = i(n[a + 1]);
			if (s === null) return {
				ok: !0,
				simple: !1
			};
			o.push({
				count: a === c ? 1 : r ?? 0,
				sides: s,
				sign: e
			}), c = a + 2;
		} else if (r !== null) s += e * r, c++;
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
async function U(e, t) {
	await a();
	let n = H(e);
	if (!n) return {
		status: "unsupported",
		reason: "作者骰子程序读不了这个骰式",
		formula: e
	};
	let i = r.RollerUtil._randomise, o = [], s = null;
	r.RollerUtil._randomise = (e) => {
		let { min: n = 1, max: a } = e;
		if (n > a) return 0;
		if (n === a) return a;
		if (!t) {
			let t = i.call(r.RollerUtil, e);
			return o.push({
				min: n,
				max: a,
				value: t
			}), t;
		}
		if (o.length >= t.length) throw s = {
			min: n,
			max: a
		}, Error("KERNEL_NEEDS_DICE");
		let c = t[o.length];
		if (!Number.isInteger(c) || c < n || c > a) throw Error(`骰点 ${c} 不在 ${n}～${a} 之间`);
		return o.push({
			min: n,
			max: a,
			value: c
		}), c;
	};
	try {
		let t = {};
		return {
			status: "complete",
			formula: e,
			total: n.evl(t),
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
		r.RollerUtil._randomise = i;
	}
}
// src/library/table-roll.ts
var W = "#\\$prompt_number:?([^$]*)\\$#", G = (e, t) => {
	let n = Number(e);
	return e !== void 0 && e !== "" && Number.isFinite(n) ? n : t;
};
function K(e, t = W) {
	return [...e.matchAll(new RegExp(t, "g"))].map((e) => {
		let t = {};
		for (let n of (e[1] ?? "").split(",").map((e) => e.trim()).filter(Boolean)) {
			let [e, r] = n.split("=").map((e) => e.trim());
			t[e] = r;
		}
		return {
			raw: e[0],
			title: t.title ?? null,
			default: G(t.default, 0),
			min: G(t.min, 0),
			max: t.max === void 0 || G(t.max, Infinity) === Infinity ? null : G(t.max, 0)
		};
	});
}
function tt(e, t, n = W) {
	let r = K(e, n);
	if (t.length !== r.length) throw Error(`要填 ${r.length} 个数，给了 ${t.length} 个`);
	r.forEach((e, n) => {
		let r = t[n];
		if (!Number.isFinite(r)) throw Error(`第 ${n + 1} 个数不是数字`);
		if (r < e.min || e.max !== null && r > e.max) throw Error(`${e.title ?? `第 ${n + 1} 个数`}要在 ${e.min}～${e.max ?? "不限"} 之间`);
	});
	let i = 0;
	return e.replace(new RegExp(n, "g"), () => String(t[i++]));
}
function nt(e) {
	return e.split(";").map((e) => e.trim()).filter(Boolean);
}
function q(e, t) {
	let n = e.findIndex((e) => {
		if (!e) return !1;
		let n = e.pad && t === 100 ? 0 : t;
		return e.exact == null ? e.min != null && e.max != null && e.min <= n && n <= e.max : e.exact === n;
	});
	return n >= 0 ? n : null;
}
// src/library/runtime/frame/table-roll-commands.ts
var J = (e) => e?.type === "row" ? e.row : e;
function Y(e, t) {
	let n = e.rows ?? [];
	return n.map((e, i) => {
		let a = J(e);
		return Array.isArray(a) ? r.Renderer.getRollableRow(a, {
			isForceInfiniteResults: t === r.RollerUtil.ROLL_COL_VARIABLE,
			isFirstRow: i === 0,
			isLastRow: i === n.length - 1
		})?.[0]?.roll ?? null : null;
	});
}
async function rt(e, t) {
	await a();
	let n = r.Renderer.table.getAutoConvertedRollMode(e);
	return n ? {
		rollable: !0,
		mode: n,
		index: q(Y(e, n), t)
	} : {
		rollable: !1,
		mode: n,
		index: null
	};
}
function it(e) {
	let t = r.Renderer.table.getHeaderRowMetas(e)?.at(-1)?.[0];
	if (typeof t != "string") return null;
	let n = r.RollerUtil.getFullRollCol(t), i = /^\{@dice (?<inner>.*)\}$/s.exec(n);
	return i?.groups ? r.Renderer.utils.getTagEntry("@dice", i.groups.inner)?.toRoll ?? null : null;
}
function X(e, t = []) {
	return typeof e == "string" ? t.push(e) : Array.isArray(e) ? e.forEach((e) => X(e, t)) : e && typeof e == "object" && Object.values(e).forEach((e) => X(e, t)), t;
}
function at(e) {
	let t = [];
	for (let n of X(e)) for (let e of n.matchAll(/\{@(\w+) ([^}]*)\}/g)) try {
		let n = r.Renderer.utils.getTagEntry(`@${e[1]}`, e[2]);
		typeof n?.toRoll == "string" && !/#\$prompt/.test(n.toRoll) && t.push({
			tag: `@${e[1]}`,
			text: e[2],
			formula: n.toRoll
		});
	} catch {}
	return t;
}
var ot = (e) => e.replace(/<[^>]+>/g, "");
async function st(e, t = {}) {
	await a();
	let n = r.Renderer.table.getAutoConvertedRollMode(e);
	if (!n) return { status: "not-rollable" };
	let i = it(e);
	if (!i) return { status: "not-rollable" };
	let o = r.Renderer.dice.RE_PROMPT.source, s = nt(i).map((e) => ({
		formula: e,
		prompts: K(e, o)
	}));
	if (s.length > 1 && t.formulaIndex === void 0) return {
		status: "choose",
		options: s
	};
	let c = s[t.formulaIndex ?? 0];
	if (!c) return {
		status: "error",
		error: `没有第 ${t.formulaIndex} 种骰式`
	};
	let l = c.formula;
	if (c.prompts.length) {
		if (!t.promptValues) return {
			status: "needs-input",
			formula: l,
			prompts: c.prompts
		};
		try {
			l = tt(l, t.promptValues, o);
		} catch (e) {
			return {
				status: "error",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	let u = Y(e, n), d = !!e.isNameGenerator, f = r.Renderer.table.getHeaderRowMetas(e), p = d ? (f?.at(-1)?.length ?? 1) - 1 : 1, m = t.points ? [...t.points] : void 0, h = async (e) => {
		let t = await U(e, m);
		return m && t.status === "complete" && (m = m.slice(t.used.length)), t;
	}, g = [];
	for (let t = 0; t < p; t++) {
		let n = await h(l);
		if (n.status === "missing") return {
			status: "missing",
			reason: `已给的骰点不够，还要一颗 d${n.missing.dice.max}`
		};
		if (n.status !== "complete") return {
			status: "error",
			error: n.status === "unsupported" ? n.reason : n.status === "error" ? n.error : "掷骰失败"
		};
		let r = q(u, n.total), i = r === null ? [] : J((e.rows ?? [])[r]).slice(1);
		g.push({
			label: d ? ot(String(f.at(-1)[t + 1] ?? "")) : null,
			formula: l,
			total: n.total,
			used: n.used,
			detail: n.text,
			rowIndex: r,
			cells: d ? [i[t]].filter((e) => e !== void 0) : i
		});
	}
	let _ = [];
	for (let e of g) for (let t of at(e.cells)) {
		let e = await h(t.formula);
		if (e.status === "missing") return {
			status: "missing",
			reason: `已给的骰点不够，还要一颗 d${e.missing.dice.max}`
		};
		e.status === "complete" && _.push({
			...t,
			total: e.total,
			used: e.used,
			detail: e.text
		});
	}
	return {
		status: "complete",
		mode: n,
		nameGenerator: d,
		rolls: g,
		inline: _
	};
}
// src/library/runtime/frame/image-commands.ts
var ct = {
	monster: "monster",
	object: "object",
	vehicle: "vehicle"
};
async function lt(e, n) {
	await a();
	let i = ct[e];
	if (!i || !r.Renderer[i]?.getTokenUrl || !r.Renderer.generic.hasToken(n)) return null;
	let o = r.Renderer[i].getTokenUrl(n);
	return o ? /^https?:/.test(o) ? o : t(o) : null;
}
// src/library/runtime/frame/table-extract-commands.ts
async function ut() {
	let e = new URL("js/generate-tables-data/", location.href).href, [t, n] = await Promise.all([import(
		/* @vite-ignore */
		`${e}generate-tables-data-utils.js`
), import(
		/* @vite-ignore */
		`${e}generate-tables-data-models.js`
)]);
	return {
		UtilGenTables: t.UtilGenTables,
		RecursiveSearchStateGeneric: n.RecursiveSearchStateGeneric
	};
}
async function dt(e, t, n = null) {
	await a();
	let { UtilGenTables: i, RecursiveSearchStateGeneric: o } = await ut(), c = t ?? await r.DataLoader.pCacheAndGetAllSite(e) ?? [], u = [], d = [];
	for (let t of c) {
		let r = s(e, t);
		if (r) try {
			let a = new o({ isRequireIncludes: !1 }), s = t.source ?? n, c = {
				metaType: e,
				name: t.name,
				source: s,
				className: t.className ?? t.name,
				classSource: t.classSource ?? t.source,
				subclassName: t.name,
				subclassShortName: t.shortName,
				subclassSource: t.source ?? t.classSource
			};
			for (let [e, n] of Object.entries(t)) if (Array.isArray(n) && !e.startsWith("_")) try {
				for (let e of n) i._doSearch({
					state: a,
					tmpMeta: c,
					section: t.name,
					entry: e
				});
			} catch (n) {
				d.push({
					name: `${t.name ?? r}.${e}`,
					error: n instanceof Error ? n.message : String(n)
				});
			}
			if (!a._tables.length) continue;
			let f = a._tables;
			a.getStacks().table.forEach((e, i) => u.push({
				parentHash: r,
				parentName: String(t.name ?? ""),
				parentSource: l(t) ?? n,
				table: e,
				path: f[i]?.path ?? [],
				sectionIndex: f[i]?.sectionIndex ?? null
			}));
		} catch (e) {
			d.push({
				name: String(t.name ?? r),
				error: e instanceof Error ? e.message : String(e)
			});
		}
	}
	return {
		tables: u,
		skipped: d
	};
}
// src/library/runtime/frame/commands.ts
async function ft() {
	let e = /* @__PURE__ */ new Set(), t = [];
	for (let n of r.DataLoader._DATA_TYPE_LOADER_LIST) {
		if (e.has(n)) continue;
		e.add(n);
		let r = [...n.constructor.PROPS], i = n.constructor.PAGE ?? null;
		r.some((e) => e === "bookData" || e === "adventureData") ? t.push({
			props: r,
			page: i,
			kind: "corpus",
			index: n._filename
		}) : t.push({
			props: r,
			page: i,
			kind: "site"
		});
	}
	return t;
}
async function pt(e) {
	await a();
	let t = await r.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => s(e, t)),
		sources: t.map((e) => l(e))
	};
}
async function mt(e, t, n) {
	return await a(), ((await r.DataUtil.loadJSON(`data/${e}`))[t] ?? []).map((e) => ({
		id: e.id,
		source: r.SourceUtil.getEntitySource(e),
		hash: r.UrlUtil.URL_TO_HASH_BUILDER[n](e)
	}));
}
async function Z(e, t, n) {
	return await a(), r.DataLoader.pCacheAndGet(e, t, n, { isRequired: !0 });
}
async function ht(e) {
	await a();
	let t = e ? new Set(e.map((e) => e.toUpperCase())) : null, n = {};
	for (let e of ["search/index.json", "search/index-item.json"]) {
		let i = r.Omnidexer.decompressIndex(await r.DataUtil.loadRawJSON(e));
		for (let e of i) {
			if (t && e.s && !t.has(String(e.s).toUpperCase())) continue;
			let i = r.Parser.CAT_ID_TO_PROP[e.c] ?? `cat:${e.c}`;
			(n[i] ??= []).push(e.u);
		}
	}
	return n;
}
async function gt(e, t) {
	await a();
	let n = r.ExcludeUtil.getList().filter((t) => t.hash !== "*" || t.category !== "*" || String(t.source).toLowerCase() !== e.toLowerCase()), i = t ? [...n, {
		displayName: e,
		hash: "*",
		category: "*",
		source: e,
		isAuto: !1
	}] : n;
	return await r.ExcludeUtil.pSetList(i), await r.ExcludeUtil._pSave(), r.ExcludeUtil.getList();
}
async function _t(e, t, n) {
	return await a(), r.ExcludeUtil.isExcluded(e, t, n, { isNoCount: !0 });
}
async function vt(e, t) {
	return await a(), t.map((t) => s(e, t));
}
async function yt() {
	return [...r.__trpgFrameErrors];
}
async function bt() {
	let e = r.__trpgStorageFlush;
	return e ? e() : [];
}
var xt = {
	frameErrors: yt,
	init: a,
	loaders: ft,
	parseProp: pt,
	corpusList: mt,
	parseCorpus: Z,
	searchIndexHashes: ht,
	setSourceExcluded: gt,
	isExcluded: _t,
	excludedFlags: fe,
	detail: pe,
	search: me,
	searchIndexDump: ge,
	searchIndexLoad: _e,
	searchSettings: he,
	englishLocators: De,
	englishMatch: Oe,
	variantTemplateNames: ke,
	versionOrder: Ae,
	brewCatalog: ve,
	brewInstalled: ye,
	brewStorage: be,
	brewAddUrl: O,
	brewAddSources: j,
	brewAddFiles: M,
	brewDelete: N,
	brewPull: xe,
	brewCheckUpdates: Ce,
	brewCorpusList: Se,
	brewPackRows: Ee,
	parseBrewProp: we,
	rawHashes: vt,
	storageFlush: bt,
	editionOf: F,
	sourceNames: je,
	corpusFile: L,
	brewDocIndex: Ne,
	brewItemsByHash: Pe,
	brewRaw: I,
	brewExport: Fe,
	fluffOf: Ie,
	fluffOfMany: Le,
	excludeList: Re,
	editableDoc: R,
	editableEnsureSource: ze,
	editablePut: Be,
	editableRemove: Ve,
	editableAddDependencies: He,
	converters: Ge,
	convertText: Ke,
	entryTemplate: Je,
	diceTag: Qe,
	diceStats: $e,
	diceRead: et,
	diceRoll: U,
	tableRow: rt,
	tableRoll: st,
	tagMeta: f,
	tagRefs: p,
	brewDependencyPreview: A,
	brewMergeCheck: k,
	sortColumns: S,
	sortRanks: ue,
	listCells: de,
	authorFields: te,
	displayName: re,
	renderText: ie,
	renderContent: g,
	statblockMeta: ae,
	summaryEntry: se,
	tokenPath: lt,
	extractTables: dt,
	directory: Xe,
	sourceFiles: V
}, St = [
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
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || !t || t.channel !== "trpg-library" || t.type !== "call") return;
	let r = (e) => parent.postMessage({
		channel: n,
		type: "result",
		frame: $,
		id: t.id,
		...e
	}, location.origin), i = xt[t.fn];
	i ? i(...t.args).then((e) => r({
		ok: !0,
		value: e
	}), (e) => r({
		ok: !1,
		error: e instanceof Error ? e.stack ?? e.message : String(e)
	})) : r({
		ok: !1,
		error: `小窗没有这个指令：${t.fn}`
	});
});
var Ct = new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "", wt = {
	channel: n,
	type: "ready",
	frame: $,
	codeSet: Ct,
	authorVersion: typeof Q.VERSION_NUMBER == "string" ? Q.VERSION_NUMBER : null,
	present: Object.fromEntries(St.map((e) => [e, Q[e] !== void 0])),
	errors: [...Q.__trpgFrameErrors ?? []]
};
parent.postMessage(wt, location.origin);
