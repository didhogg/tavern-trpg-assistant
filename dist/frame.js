import { d as e, n as t, v as n } from "./images-CyV_UyST.js";
import { t as r } from "./protocol-03CO7Rhf.js";
// src/library/runtime/frame/author.ts
var i = globalThis, a = null;
function o() {
	return a ??= (async () => {
		i.Renderer.get().setBaseUrl(""), await i.PrereleaseUtil.pInit(), await i.BrewUtil2.pInit(), await i.ExcludeUtil.pInitialise();
	})(), a;
}
function s(e, t) {
	return e ? e[t] ?? e[i.DataLoader.getPropPage(t)] ?? null : null;
}
function c(e, t) {
	let n = s(i.UrlUtil.URL_TO_HASH_BUILDER, e);
	try {
		return n ? n(t) : null;
	} catch {
		return null;
	}
}
function l(e, t) {
	let n = i.UrlUtil.URL_TO_ENG_HASH_BUILDER, r = i.DataLoader.getPropPage(e);
	return !n || !t?.ENG_name || !n[r] ? null : n[r](t);
}
function u(e) {
	return i.SourceUtil.getEntitySource(e) ?? null;
}
// src/library/runtime/frame/tag-commands.ts
function d(e) {
	let t = i.DataLoader._PROP_TO_HASH_PAGE, n = Object.entries(t).filter(([, t]) => t === e).map(([e]) => e);
	return n.length ? n : Object.keys(t).filter((t) => t.toLowerCase() === e.toLowerCase());
}
function f(e, t) {
	let n = e === "@book" ? "book.html" : "adventure.html", { displayText: r, id: a, ixChapter: o, sectionName: s, ixNamedSection: c } = i.UidUtil.unpackUidAdventureBook(t);
	return {
		tag: e,
		name: String(r ?? a ?? ""),
		displayText: String(r ?? a ?? ""),
		source: a ?? null,
		page: n,
		hash: String(a ?? "").toLowerCase(),
		props: d(n),
		part: {
			chapter: o ?? null,
			section: s ?? null,
			ixNamedSection: c ?? null
		}
	};
}
async function p(e, t) {
	await o();
	let n = e.startsWith("@") ? e : `@${e}`;
	if (n === "@book" || n === "@adventure") return f(n, t);
	let r;
	try {
		r = i.Renderer.utils.getTagMeta(n, t);
	} catch {
		return null;
	}
	if (!r) return null;
	let a = r.pageHover ?? r.page, s = r.hashHover ?? r.hash, c = r.sourceHover ?? r.source;
	return {
		tag: n,
		name: String(r.name ?? ""),
		displayText: String(r.displayText ?? r.linkText ?? r.name ?? ""),
		source: c ?? null,
		page: a,
		hash: s,
		props: d(a)
	};
}
async function m(e) {
	await o();
	let t = /* @__PURE__ */ new Map(), n = async (e, n) => {
		let r = `${e} ${n}`, i = t.get(r);
		if (!i) {
			let a = await p(e, n);
			i = a && a.hash ? a.props.map((e) => `${e}|${a.hash}`) : [], t.set(r, i);
		}
		return i;
	}, r = async (e, t) => {
		if (e.includes("{@")) for (let a of i.Renderer.splitByTags(e)) {
			if (!a.startsWith("{@")) continue;
			let [e, o] = i.Renderer.splitFirstSpace(a.slice(1, -1));
			for (let r of await n(e, o)) t.add(r);
			await r(o, t);
		}
	}, a = async (e, t) => {
		if (typeof e == "string") return r(e, t);
		if (Array.isArray(e)) for (let n of e) await a(n, t);
		else if (e && typeof e == "object") for (let n of Object.values(e)) await a(n, t);
	}, s = [];
	for (let t of e) {
		let e = /* @__PURE__ */ new Set();
		await a(t, e), s.push([...e]);
	}
	return s;
}
// src/library/runtime/frame/author-markup.ts
function h(e, t) {
	let n = e.href;
	if (n.type === "external") return n.url ? {
		kind: "external",
		url: n.url
	} : null;
	if (n.type !== "internal" || !n.path) return null;
	if (n.hash === i.HASH_BLANK) return {
		kind: "filter",
		path: t
	};
	let r = n.hover?.page ?? n.path, a = n.hover?.hash ?? n.hash;
	if (!a) return null;
	if (r === "book.html" || r === "adventure.html") {
		let [e, t, n, o] = a.split(i.HASH_PART_SEP), s = n ?? "";
		try {
			s = decodeURIComponent(s);
		} catch {
			return null;
		}
		return {
			kind: "library",
			meta: f(r === "book.html" ? "@book" : "@adventure", [
				"",
				e,
				t,
				s,
				o
			].join("|"))
		};
	}
	let o = d(r);
	if (!o.length) return null;
	let s = n.hover?.hash ? n.hover.hashPreEncoded : n.hashPreEncoded;
	return {
		kind: "library",
		meta: {
			tag: "",
			name: "",
			displayText: "",
			page: r,
			props: o,
			source: n.hover?.source ?? null,
			hash: s ? a : i.UrlUtil.encodeForHash(a)
		}
	};
}
function g(e, { tables: t = !0 } = {}) {
	let r = i.Renderer.get(), a = n(), o = [], s = [], c = r._renderTable;
	t && (r._renderTable = function(e, t, n, r) {
		let i = s.push(JSON.parse(JSON.stringify(e))) - 1;
		t[0] += `<div data-trpg-table="${a}:${i}">`, c.call(this, e, t, n, r), t[0] += "</div>";
	});
	try {
		return {
			value: r.withPlugin({
				pluginTypes: ["link"],
				fnPlugin: (e, { input: t }) => {
					let n = h(t, r._renderLink_getHref(t));
					if (!n) return { isDisableEvents: !0 };
					let i = o.push(n) - 1;
					return {
						isDisableEvents: !0,
						attributes: `data-trpg-link="${a}:${i}"`
					};
				},
				fn: e
			}),
			marker: a,
			links: o,
			tables: s
		};
	} finally {
		t && (r._renderTable = c);
	}
}
async function _(e, { tables: t = !0 } = {}) {
	await o();
	let { value: n, marker: r, links: a, tables: s } = g(() => String(i.Renderer.get().render(e)), { tables: t });
	return {
		html: n,
		marker: r,
		links: a,
		...s.length ? { tables: s } : {}
	};
}
// src/library/runtime/frame/field-commands.ts
var v = (e) => String(e ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(), ee = (e) => Array.isArray(e) ? e.map(v).filter(Boolean).join("、") : v(e), te = {
	spell: (e) => [["成分", e.components ? i.Parser.spComponentsToFull(e.components, e.level, { isPlainText: !0 }) : ""], ["持续时间", e.duration ? i.Parser.spDurationToFull(e.duration, { isPlainText: !0 }) : ""]],
	class: (e) => {
		let t = e.startingProficiencies ?? {}, n = { styleHint: e.edition ?? "classic" };
		return [
			["护甲受训", t.armor ? i.Renderer.class.getRenderedArmorProfs(t.armor, n) : ""],
			["武器熟练", t.weapons ? i.Renderer.class.getRenderedWeaponProfs(t.weapons, n) : ""],
			["工具熟练", t.tools ? i.Renderer.class.getRenderedToolProfs(t.tools, n) : ""],
			["技能熟练", t.skills ? i.Renderer.class.getRenderedSkillProfs(t.skills, n) : ""],
			["起始装备", Array.isArray(e.startingEquipment?.default) ? e.startingEquipment.default.join("；") : ""]
		];
	},
	deity: (e) => [
		["神系", e.pantheon],
		["阵营", Array.isArray(e.alignment) ? i.Parser.alignmentListToFull(e.alignment) : ""],
		["类别", e.category],
		["领域", Array.isArray(e.domains) ? e.domains.join("、") : ""],
		["权能", e.province],
		["象征", e.symbol]
	]
};
async function ne(e, t) {
	await o();
	let n = te[e], r = [];
	if (n) try {
		let { value: e, marker: i, links: a } = g(() => n(t), { tables: !1 });
		for (let [t, n] of e) {
			let e = Array.isArray(n) ? ee(n) : v(n), o = typeof n == "string" && n.includes(i) ? {
				html: n,
				marker: i,
				links: a
			} : void 0;
			(e || o) && r.push({
				label: t,
				value: e,
				...o ? { markup: o } : {}
			});
		}
	} catch (e) {
		r.push({
			label: "读取失败",
			value: e instanceof Error ? e.message : String(e)
		});
	}
	let a = null;
	if (e === "class") try {
		a = Array.from({ length: 20 }, (e, t) => `+${i.Parser.levelToPb(t + 1)}`);
	} catch {
		a = null;
	}
	return {
		lines: r,
		pb: a
	};
}
// src/library/runtime/frame/page-prepare.ts
var re = {
	"bestiary.html": () => Promise.all([i.DataUtil.monster.pPreloadLegendaryGroupsSite(), i.DataUtil.monster.pUpdatePreloadLegendaryGroupsBrew()]),
	"items.html": () => i.Renderer.item.pPopulatePropertyAndTypeReference()
}, y = /* @__PURE__ */ new Map();
async function ie(e) {
	let t = re[e];
	if (!t) return;
	let n = y.get(e);
	n || (n = t().catch((t) => {
		throw y.delete(e), t;
	}), y.set(e, n)), await n;
}
async function b(e) {
	await o(), await ie(i.DataLoader.getPropPage(e) ?? "");
}
// src/library/runtime/frame/entity-render.ts
function ae(e) {
	let t = i.DataLoader.getPropPage(e);
	for (let n of [t, e]) if (n) try {
		if (i.Renderer.hover._getFnRenderCompact({
			page: n,
			isStatic: !0
		})) return i.Renderer.hover.getFnRenderCompact(n, { isStatic: !0 });
	} catch {}
	return null;
}
var oe = () => i.Renderer.hover.getFnRenderCompact("generic", { isStatic: !0 });
function x(e, t) {
	let { value: n, marker: r, links: i, tables: a } = g(() => String(e(t) ?? ""));
	if (!n.trim()) return null;
	let o = document.createElement("template");
	return o.innerHTML = `<table>${n}</table>`, o.content.querySelectorAll("th.ve-stats__th-name").forEach((e) => e.closest("tr")?.remove()), {
		html: o.innerHTML,
		marker: r,
		links: i,
		tables: a
	};
}
async function se(e, t) {
	await o(), await b(e);
	let n = ae(e);
	if (n) try {
		return x(n, t);
	} catch (t) {
		console.warn(`[trpg-assistant] 作者的「${e}」整条渲染出错，改用通用渲染`, t);
	}
	return x(oe(), t);
}
// src/library/runtime/frame/entry-commands.ts
var ce = { itemProperty: (e) => i.Renderer.itemProperty.getItemPropertyRenderableEntriesMeta(e).entryFaux.name };
async function le(e, t) {
	await o();
	let n = ce[e], r = n ? n(t) : t?.name;
	return typeof r == "string" && r ? r : null;
}
async function ue(e) {
	await o();
	let t = i.Renderer.get().render(e), n = document.createElement("div");
	return n.innerHTML = t, (n.textContent ?? "").replace(/\s+/g, " ").trim();
}
async function de(e) {
	await o();
	let t = i.Renderer.utils.getStatblockEntryMeta(e), n = String(t.prop ?? ""), r = !!t.isFluff;
	return {
		prop: n,
		target: r ? n.replace(/Fluff$/, "") : n,
		source: t.source ?? null,
		hash: t.hash ?? null,
		displayName: t.displayName ?? null,
		isFluff: r
	};
}
// src/library/runtime/frame/sort-commands.ts
var fe = (e) => ["js/filter-common.js", `js/filter-${e}.js`], S = /* @__PURE__ */ new Set();
async function pe(e) {
	S.has(e) || (S.add(e), await new Promise((t) => {
		let n = document.createElement("script");
		n.src = e, n.onload = () => t(), n.onerror = () => t(), document.head.appendChild(n);
	}));
}
async function C(e) {
	await o();
	let t = String(i.DataLoader.getPropPage(e) ?? "").replace(/\.html$/, "");
	if (!t) return null;
	for (let e of fe(t)) await pe(e);
	let n = Object.keys(i).find((e) => e.startsWith("ModalFilter") && e.toLowerCase() === `modalfilter${t}`);
	return n && typeof i[n] == "function" ? {
		Cls: i[n],
		page: t
	} : null;
}
function w(e, t) {
	let n = i.UrlUtil.getCurrentPage;
	i.UrlUtil.getCurrentPage = () => `${e}.html`;
	try {
		return t();
	} finally {
		i.UrlUtil.getCurrentPage = n;
	}
}
async function T(e) {
	let t = await C(e);
	return t ? t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})).filter((e) => !!e.sort) : [];
}
async function E(e, t) {
	await b(t);
	let n = [...await i.DataLoader.pCacheAndGetAllSite(t) ?? [], ...await i.DataLoader.pCacheAndGetAllBrew(t) ?? []];
	return w(e.page, () => {
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
async function me(e, t, n) {
	let r = await C(e);
	if (!r || !(await T(e)).some((e) => e.sort === t)) return null;
	let { inst: a, entities: o, items: s } = await E(r, e);
	return w(r.page, () => {
		let r = {
			_filteredItems: s,
			_sortBy: t,
			_sortDir: n,
			_fnSort: a._fnSort,
			_wrpList: { previousElementSibling: { querySelector: () => ({}) } },
			constructor: i.List
		}, l = i.List.prototype.getSortedItems.call(r, { items: [...s] }), u = new Map(s.map((e, t) => [e, t])), d = {};
		return l.forEach((t, n) => {
			let r = c(e, o[u.get(t)]);
			r && !(r in d) && (d[r] = n);
		}), d;
	});
}
async function he(e) {
	let t = await C(e);
	if (!t) return null;
	let n = t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})), { entities: r, items: i } = await E(t, e), a = {};
	return i.forEach((t, i) => {
		let o = c(e, r[i]);
		if (!o || o in a) return;
		let s = [...t.ele?.firstElementChild?.children ?? []].map((e) => String(e.textContent ?? "").replace(/\s+/g, " ").trim());
		a[o] = n.map((e, t) => s[s.length - n.length + t] ?? "");
	}), {
		columns: n,
		cells: a
	};
}
// src/library/runtime/frame/read-commands.ts
function D(e, t, n) {
	let r = u(t);
	return r ? i.DataLoader.getPropPage(e) === i.UrlUtil.PG_ITEMS && i.Renderer.item.isExcluded(t, { hash: n }) ? !0 : i.ExcludeUtil.isExcluded(n ?? "", t.__prop ?? e, r, { isNoCount: !0 }) : !1;
}
async function ge(e, t = "site") {
	if (await o(), !i.ExcludeUtil.getList().length) return {
		hashes: [],
		excluded: null
	};
	await b(e);
	let n = await (t === "brew" ? i.DataLoader.pCacheAndGetAllBrew(e) : i.DataLoader.pCacheAndGetAllSite(e)) ?? [], r = n.map((t) => c(e, t));
	return {
		hashes: r,
		excluded: n.map((t, n) => D(e, t, r[n]))
	};
}
async function _e(e, t, n) {
	await o(), await b(e);
	let r = n ? await i.DataLoader.pCacheAndGet(e, n, t) : await i.DataLoader.pCacheAndGetHash(e, t);
	if (!r) return null;
	let a = null, s = null;
	try {
		a = await i.Renderer.utils.pGetProxyFluff({
			entity: r,
			prop: e
		}) ?? null;
	} catch (e) {
		s = e instanceof Error ? e.message : String(e);
	}
	return {
		item: r,
		hash: t,
		source: u(r),
		excluded: D(e, r, t),
		fluff: a,
		fluffError: s,
		engSiteHash: l(e, r)
	};
}
async function ve(e, t = null) {
	await o();
	let n = t === null ? null : await O(), r = n?.isShowLegacy;
	n && (n.isShowLegacy = t);
	try {
		return (await i.OmnisearchBacking.pGetResults(i.CleanUtil.getCleanString(e))).map((e) => ({
			score: e.score,
			prop: i.Parser.pageCategoryToProp(e.doc.c),
			doc: e.doc
		}));
	} finally {
		n && (n.isShowLegacy = r);
	}
}
async function O() {
	return (await import(
		/* @vite-ignore */
		new URL("js/omnisearch/omnisearch-state.js", location.href).href
)).OmnisearchState;
}
async function ye(e = {}) {
	await o();
	let t = await O();
	for (let [n, r] of Object.entries(e)) {
		if (!(n in t._DEFAULT_STATE)) throw Error(`作者的搜索设置里没有这一项：${n}`);
		n === "partneredMode" ? t.setPartneredMode(r) : t[n] = r;
	}
	return t._getComp().toObject();
}
async function be() {
	await o();
	let e = i.OmnisearchBacking;
	return await e._pInit(), {
		json: JSON.stringify(e._searchIndex.toJSON()),
		maxId: e._maxId ?? null,
		categoryCounts: e._CATEGORY_COUNTS ?? {},
		adventureBookLookup: e._adventureBookLookup ?? {}
	};
}
async function xe(e) {
	await o(), i.SearchUtil._initSearchIndex_getFnFold();
	let t = i.OmnisearchBacking;
	return t._searchIndex = i.elasticlunr.Index.load(JSON.parse(e.json)), t._maxId = e.maxId, t._CATEGORY_COUNTS = e.categoryCounts, t._adventureBookLookup = e.adventureBookLookup, t._pLoadSearch = Promise.resolve(), t._initReInCategory(), !0;
}
// src/library/runtime/frame/brew-commands.ts
async function k(e) {
	await o();
	let t = i.__trpgFrameErrors, n = t.length, r = await e();
	return await new Promise((e) => setTimeout(e, 50)), {
		value: r,
		errors: t.slice(n)
	};
}
var A = (e) => ({
	head: e.head,
	meta: e.body?._meta ?? null
});
function Se() {
	return k(() => i.BrewUtil2.pGetCombinedIndexes());
}
async function Ce() {
	return await o(), (await i.BrewUtil2.pGetBrew()).map(A);
}
async function we() {
	await o();
	let e = [];
	for (let [t, n] of [["brew", i.BrewUtil2], ["prerelease", i.PrereleaseUtil]]) {
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
async function Te(e) {
	let t = await k(() => i.BrewUtil2.pAddBrewFromUrl(e));
	return {
		...t,
		value: (t.value ?? []).map(A)
	};
}
async function Ee() {
	await o();
	let e = i.BrewUtil2, t = await e._LOCK.pLock();
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
async function De(e) {
	return await o(), k(async () => {
		let t = i.BrewUtil2, n = await t._pGetBrewDocFromUrl({ url: e }), r = await t._pGetBrewDependencies_getBrewIndex({
			urlRoot: await t.pGetCustomUrl(),
			isIgnoreNetworkErrors: !0
		}), { available: a, unavailable: o } = t._getBrewDependencySources({
			brewDoc: n,
			brewIndex: r
		}), s = new Set((await t.pGetBrew()).flatMap((e) => (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean)));
		return {
			sources: (n.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
			dependencies: a.map((e) => ({
				source: e,
				file: String(r[e] ?? "").split("/").pop() ?? e,
				installed: s.has(e)
			})),
			unavailable: o
		};
	});
}
async function Oe(e) {
	let t = await k(async () => {
		let t = [], n = [], r = new Set((await i.BrewUtil2.pGetBrew()).map((e) => e.head.docIdLocal));
		return await Promise.all(e.map(async (e) => {
			let r = await i.BrewUtil2.pGetSourceUrl(e);
			if (!r) t.push(e);
			else try {
				await i.BrewUtil2.pAddBrewFromUrl(r, { isLazy: !0 });
			} catch {
				n.push(e);
			}
		})), await i.BrewUtil2.pAddBrewsLazyFinalize(), {
			added: (await i.BrewUtil2.pGetBrew()).filter((e) => !r.has(e.head.docIdLocal)),
			notFound: [...t, ...n]
		};
	});
	return {
		errors: t.errors,
		value: {
			added: t.value.added.map(A),
			notFound: t.value.notFound
		}
	};
}
async function ke(e) {
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
	let r = await k(async () => {
		let [e, t] = n.segregate((e) => i.BrewUtil2.constructor._isPrereleaseDroppedJson(e.json)), r = [];
		return e.length && r.push(...await i.PrereleaseUtil.pAddBrewsFromFiles(e) ?? []), t.length && r.push(...await i.BrewUtil2.pAddBrewsFromFiles(t) ?? []), r;
	});
	return {
		errors: r.errors,
		value: {
			added: r.value.map(A),
			notJson: t
		}
	};
}
async function Ae(e) {
	return k(async () => {
		let t = new Set(e), n = (await i.BrewUtil2.pGetBrew()).filter((e) => t.has(e.head.docIdLocal));
		return await i.BrewUtil2.pDeleteBrews(n), n.length;
	});
}
async function je(e = null) {
	let t = await k(async () => {
		let t = e ? (await i.BrewUtil2.pGetBrew()).filter((t) => e.includes(t.head.docIdLocal)) : null;
		return i.BrewUtil2.pPullAllBrews({ brews: t });
	});
	return {
		...t,
		value: (t.value ?? []).map(A)
	};
}
async function Me(e, t) {
	return await o(), ((await i.BrewUtil2.pGetBrewProcessed())?.[e] ?? []).map((e) => ({
		id: e.id,
		name: e.name,
		source: i.SourceUtil.getEntitySource(e),
		hash: i.UrlUtil.URL_TO_HASH_BUILDER[t](e)
	}));
}
async function Ne(e = null) {
	return k(async () => {
		let t = i.BrewUtil2, n = (await t.pGetBrew()).filter((n) => t.isPullable(n) && (!e || e.includes(n.head.docIdLocal))), r = [];
		for (let e of n) {
			let t = e.body._meta?.dateLastModified ?? 0;
			try {
				let n = await i.DataUtil.loadRawJSON(e.head.url, { isBustCache: !0 }), a = n._meta?.dateLastModified ?? 0;
				r.push({
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
				r.push({
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
		return r;
	});
}
async function Pe(e) {
	await o(), await b(e);
	let t = await i.DataLoader.pCacheAndGetAllBrew(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => c(e, t)),
		sources: t.map((e) => u(e))
	};
}
function Fe(e, t, n, r, i) {
	if (t._versionBase_hash) return r.has(t._versionBase_hash);
	if (t._isSubRace && t._subraceName) {
		let e = c("subrace", {
			name: t._subraceName,
			raceName: t._baseName,
			source: u(t)
		});
		return !!e && (i.subrace ?? []).includes(e);
	}
	if (t.genericVariant) {
		let e = c("magicvariant", t.genericVariant);
		return !!e && (i.magicvariant ?? []).includes(e);
	}
	return e === "item" && t._isItemGroup ? (i.itemGroup ?? []).includes(n) : r.has(n);
}
async function Ie(e) {
	await o();
	let t = {};
	for (let n of new Set(i.DataLoader._DATA_TYPE_LOADER_LIST)) {
		let r = n.constructor.PAGE;
		if (i.UrlUtil._PAGE_TO_PROPS_CORPUS[r]) continue;
		let a = n.constructor.PROPS, o = r === i.UrlUtil.PG_ITEMS || r === i.UrlUtil.PG_RACES ? i.UrlUtil.PAGE_TO_PROPS[r] ?? [] : [];
		for (let n of a) {
			if (n.startsWith("raw_")) continue;
			let a = n === o[0];
			if (!e[n]?.length && !(a && o.some((t) => e[t]?.length))) continue;
			let s = new Set(e[n] ?? []);
			if (a && r === i.UrlUtil.PG_ITEMS) for (let t of o.filter((e) => i.UrlUtil.URL_TO_HASH_BUILDER[e] === i.UrlUtil.URL_TO_HASH_BUILDER[r])) for (let n of e[t] ?? []) s.add(n);
			await b(n);
			let l = (await i.DataLoader.pCacheAndGetAllBrew(n) ?? []).flatMap((t) => {
				let r = c(n, t);
				return !r || !Fe(n, t, r, s, e) ? [] : [{
					hash: r,
					item: t,
					source: u(t),
					excluded: D(n, t, r)
				}];
			});
			l.length && (t[n] = l);
		}
	}
	return t;
}
// src/library/runtime/frame/english-commands.ts
async function Le(e) {
	await o();
	let t = e ? new Set(e.map((e) => e.toUpperCase())) : null, n = [], r = async (e, r, a) => {
		let o = new i.Omnidexer();
		await o.pAddToIndex(e, r, {
			isNoFilter: !0,
			isIncludeEntityLocator: !0
		});
		for (let e of o.getIndex().x) {
			if (!e._entityLocator) continue;
			let r = e._entityLocator.source ? String(e._entityLocator.source).toUpperCase() : null;
			t && r && !t.has(r) || n.push({
				prop: i.Parser.pageCategoryToProp(e.c),
				hash: e.u,
				file: a,
				locator: e._entityLocator
			});
		}
	};
	for (let e of i.Omnidexer.TO_INDEX__FROM_INDEX_JSON) {
		let t = await i.DataUtil.loadRawJSON(`data/${e.dir}/index.json`);
		for (let n of Object.values(t)) {
			let t = `data/${e.dir}/${n}`;
			await r(e, await i.DataUtil.loadRawJSON(t), t);
		}
	}
	for (let e of i.Omnidexer.TO_INDEX) {
		let t = `data/${e.file}`;
		await r(e, await i.DataUtil.loadJSON(t), t);
	}
	return n;
}
async function Re(e) {
	await o();
	let t = /* @__PURE__ */ new Map(), n = (e) => {
		let n = t.get(e);
		return n || (n = i.DataUtil.loadRawJSON(e), t.set(e, n)), n;
	}, r = [];
	for (let t of e) {
		let e;
		try {
			e = await n(t.file);
		} catch (e) {
			r.push({
				prop: t.prop,
				hash: t.hash,
				enHash: null,
				enSource: null,
				via: null,
				error: e instanceof Error ? e.message : String(e)
			});
			continue;
		}
		let a = t.locator, o = a ? i.Omnidexer.getProperty(e, a.prop) : null, s = (e) => e?.name === a.name && (a.source == null || e.source === a.source), l = o?.filter((e) => e.source === a.source && e.page === a.page) || [], d = null, f = o?.find(s);
		f ? d = "name" : (f = Object.values(e).filter(Array.isArray).flat().find(s)) ? d = "name-any-array" : (f = o?.length === a.count ? o[a.ix] : null) ? d = "position" : (f = l[a.ixSourcePage]) && (d = "source-page"), r.push({
			prop: t.prop,
			hash: t.hash,
			enHash: f ? c(a.prop, f) : null,
			enSource: f ? u(f) : null,
			via: d
		});
	}
	return r;
}
async function ze() {
	return await o(), ((await i.DataUtil.item.loadRawJSON())?.magicvariant ?? []).map((e) => ({
		name: e.name,
		eng: e.ENG_name ?? null,
		source: e.inherits?.source ?? e.source ?? null
	}));
}
async function Be(e) {
	await o();
	let t = {};
	for (let n of e) {
		let e = await i.DataLoader.pCacheAndGetAllSite(n) ?? [];
		for (let r of e) {
			if (!r?._versions?.length) continue;
			let e = c(n, r);
			if (!e) continue;
			let a = i.DataUtil.generic.getVersions(r);
			(t[n] ??= {})[e] = a.map((e) => c(n, e)).filter((e) => !!e);
		}
	}
	return t;
}
// src/library/runtime/frame/edit-commands.ts
var Ve = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function j(t) {
	await o();
	let n = {}, r = await i.BrewUtil2.pGetBrew();
	for (let a of t) n[a] = i.BrewUtil2.hasSourceJson(a) && e(r, a) ? {
		classic: null,
		basis: "brew-meta"
	} : i.BrewUtil2.hasSourceJson(a) || i.PrereleaseUtil.hasSourceJson(a) ? {
		classic: !!i.SourceUtil.isClassicSource(a),
		basis: "brew-meta"
	} : i.Parser.sourceJsonToDate(a) ? {
		classic: !!i.SourceUtil.isClassicSource(a),
		basis: "date"
	} : {
		classic: null,
		basis: null
	};
	return n;
}
async function He(e) {
	return await o(), Object.fromEntries(e.map((e) => [e, {
		full: i.Parser.sourceJsonToFull(e),
		abv: i.Parser.sourceJsonToAbv(e)
	}]));
}
var Ue = (e) => {
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
			hash: c(t, n)
		});
	}
	return t;
};
async function We() {
	return await o(), (await i.BrewUtil2.pGetBrew()).map((e, t) => ({
		docIdLocal: e.head.docIdLocal,
		filename: e.head.filename ?? null,
		url: e.head.url ?? null,
		timeAdded: e.head.timeAdded ?? 0,
		order: t,
		isEditable: !!e.head.isEditable,
		sources: (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
		props: Object.fromEntries(Object.entries(e.body ?? {}).filter(([e, t]) => !e.startsWith("_") && Array.isArray(t)).map(([e, t]) => [e, t.map((t) => t && typeof t == "object" ? c(e, t) : null)])),
		requires: Ue(e.body)
	}));
}
async function M(e = null) {
	await o();
	let t = await i.BrewUtil2.pGetBrew();
	return e ? t.filter((t) => e.includes(t.head.docIdLocal)) : t;
}
async function Ge(e) {
	await o();
	let t = {};
	for (let { prop: n, hash: r } of e) {
		await b(n), await i.DataLoader.pCacheAndGetAllBrew(n);
		let e = await i.DataLoader.pCacheAndGetHash(n, r);
		e && ((await i.DataLoader.pCacheAndGetAllSite(n) ?? []).includes(e) || (t[`${n}|${r}`] = e));
	}
	return t;
}
async function N(e, t) {
	return await o(), `data/${e}/${e}-${i.UrlUtil.encodeForHash(t.toLowerCase())}.json`;
}
async function Ke(e) {
	let t = (await M([e]))[0];
	return t ? {
		filename: t.head.filename ?? null,
		body: t.body
	} : null;
}
async function qe(e, t) {
	await o();
	try {
		return {
			fluff: await i.Renderer.utils.pGetProxyFluff({
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
async function Je(e, t) {
	await o();
	let n = {};
	for (let r of t) {
		let t = c(e, r);
		if (t) try {
			n[t] = {
				fluff: await i.Renderer.utils.pGetProxyFluff({
					entity: r,
					prop: e
				}) ?? null,
				fluffError: null,
				engSiteHash: l(e, r)
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
async function Ye() {
	return await o(), i.ExcludeUtil.getList();
}
async function P() {
	return await o(), i.BrewUtil2.pGetOrCreateEditableBrewDoc();
}
async function Xe(e) {
	return ((await P()).body?._meta?.sources ?? []).some((t) => String(t.json).toLowerCase() === e.json.toLowerCase()) || await i.BrewUtil2.pAddSource({
		authors: [],
		convertedBy: [],
		version: "1",
		...e
	}), ((await P()).body?._meta?.sources ?? []).map((e) => e.json);
}
async function Ze(e, t) {
	await o();
	let n = t.uniqueId ? ((await i.BrewUtil2.pGetOrCreateEditableBrewDoc()).body?.[e] ?? []).find((e) => e?.uniqueId === t.uniqueId) : null, r = {
		...t,
		uniqueId: t.uniqueId ?? i.CryptUtil.uid()
	};
	return await i.BrewUtil2.pPersistEditableBrewEntity(e, r), {
		uniqueId: r.uniqueId,
		hash: c(e, r),
		previousHash: n ? c(e, n) : null,
		previous: n ? {
			name: String(n.name ?? ""),
			source: String(n.source ?? "")
		} : null,
		previousEntity: n ? i.MiscUtil.copyFast(n) : null
	};
}
async function Qe(e) {
	await o();
	let t = e.toLowerCase();
	return Object.keys(i.Parser.SOURCE_JSON_TO_FULL ?? {}).some((e) => e.toLowerCase() === t) || !!i.BrewUtil2.hasSourceJson(e) || !!i.PrereleaseUtil.hasSourceJson(e);
}
async function $e(e, t) {
	await o();
	let { PropOrder: n } = await Ve("utils-proporder.js"), r = await P(), a = (t) => String(t ?? "").toLowerCase() === e.toLowerCase(), s = (r.body?._meta?.sources ?? []).find((e) => a(e?.json));
	if (!s) throw Error(`可编辑自制里没有来源 ${e}`);
	let c = Math.round(Date.now() / 1e3), l = { _meta: {
		sources: [i.MiscUtil.copyFast(s)],
		dateAdded: c,
		dateLastModified: c,
		edition: t
	} }, u = {};
	for (let [e, t] of Object.entries(r.body ?? {})) {
		if (e.startsWith("_") || !Array.isArray(t)) continue;
		let r = t.filter((e) => a(e?.source));
		if (r.length) {
			l[e] = r.map((t) => n.getOrdered(i.DataUtil.cleanJson(i.MiscUtil.copyFast(t)), e));
			for (let t of r) t?._copy?.source && !a(t._copy.source) && (u[e] ??= /* @__PURE__ */ new Set()).add(String(t._copy.source));
		}
	}
	return Object.keys(u).length && (l._meta.dependencies = Object.fromEntries(Object.entries(u).map(([e, t]) => [e, [...t]]))), {
		filename: `${i.DataUtil.getCleanFilename(s.full ?? s.json)}.json`,
		body: l
	};
}
async function et(e) {
	return await o(), i.DataUtil.cleanJson(i.MiscUtil.copyFast(e));
}
async function tt(e, t, n) {
	await o();
	let r = i.MiscUtil.copyFast(await P()), a = (e, t) => String(e ?? "").toLowerCase() === t.toLowerCase(), s = 0;
	for (let i of r.body?.[e] ?? []) {
		let e = i?._copy;
		e && a(e.name, t.name) && a(e.source, t.source) && (e.name = n.name, e.source = n.source, s++);
	}
	return s && await i.BrewUtil2.pSetEditableBrewDoc(r), s;
}
async function nt(e, t) {
	await o();
	let n = ((await i.BrewUtil2.pGetOrCreateEditableBrewDoc()).body?.[e] ?? []).filter((e) => t.includes(e?.uniqueId)).map((e) => i.MiscUtil.copyFast(e));
	return await i.BrewUtil2.pRemoveEditableBrewEntities(e, t), n;
}
async function rt(e) {
	let t = i.MiscUtil.copyFast(await P()), n = t.body._meta.dependencies ??= {};
	for (let [t, r] of Object.entries(e)) n[t] = [.../* @__PURE__ */ new Set([...n[t] ?? [], ...r])];
	return await i.BrewUtil2.pSetEditableBrewDoc(t), n;
}
// src/library/runtime/frame/directory-commands.ts
var it = (e) => e instanceof Error ? e.message : String(e);
async function at() {
	await o();
	let e = {}, t = /* @__PURE__ */ new Set();
	for (let n of i.DataLoader._DATA_TYPE_LOADER_LIST) for (let r of n.constructor.PROPS) {
		if (t.has(r) || r.startsWith("raw_")) continue;
		t.add(r);
		let n = i.DataUtil[r];
		if (!n || typeof n.pLoadIndex != "function") continue;
		let a = String(n._DIR ?? "");
		if (!a) continue;
		let o = await n.pLoadIndex();
		e[r] = {
			dir: a,
			indexPath: `data/${a}/${n._isFluff ? "fluff-" : ""}index.json`,
			index: o,
			bySource: Object.keys(o).some((e) => i.Parser.hasSourceJson(e))
		};
	}
	return {
		maps: e,
		classFiles: [...new Set(Object.values(e).filter((e) => !e.bySource).flatMap(({ dir: e, index: t }) => Object.values(t).map((t) => `data/${e}/${t}`)))]
	};
}
async function ot(e) {
	await o();
	let t = [];
	for (let n of e) try {
		let e = (await i.DataUtil.loadJSON(`data/${n.index}`))[n.prop] ?? [];
		t.push({
			prop: n.prop,
			items: e,
			files: await Promise.all(e.map((e) => N(n.prop, String(e.id)))),
			error: null
		});
	} catch (e) {
		t.push({
			prop: n.prop,
			items: [],
			files: [],
			error: it(e).split("\n")[0]
		});
	}
	let n = [...new Set(t.flatMap((e) => e.items.map((e) => i.SourceUtil.getEntitySource(e))))], r = n.length ? await j(n) : {}, a = {};
	for (let e of n) a[e] = {
		full: i.Parser.sourceJsonToFull(e),
		abv: i.Parser.sourceJsonToAbv(e),
		edition: r[e]
	};
	return {
		groups: i.SourceUtil.ADV_BOOK_GROUPS.map((e) => ({ ...e })),
		corpora: t,
		sources: a,
		sourceFiles: await at()
	};
}
// src/library/runtime/frame/dice-commands.ts
var F = (e) => i.Renderer.dice.lang.getTree3(e)?.tree ?? null, st = (e) => e.replace(/<[^>]+>/g, "");
async function ct(e, t) {
	return await o(), i.Renderer.utils.getTagEntry(e.startsWith("@") ? e : `@${e}`, t);
}
async function lt(e) {
	await o();
	let t = F(e);
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
async function ut(e) {
	if (await o(), !e.trim()) return {
		ok: !0,
		simple: !0,
		dice: [],
		mod: 0
	};
	try {
		if (!i.Renderer.dice.lang.getTree3(e, !1)?.tree) return {
			ok: !1,
			error: "作者骰子程序读不了这个骰式"
		};
	} catch (e) {
		return {
			ok: !1,
			error: st(e instanceof Error ? e.message : String(e))
		};
	}
	let t = i.Renderer.dice.tk, n = i.Renderer.dice.lang._lex3(e).lexed, r = (e) => e?.type === t.TYP_NUMBER && /^\d+$/.test(String(e.value)) ? Number(e.value) : null, a = [], s = 0, c = 0;
	for (; c < n.length;) {
		let e = 1;
		if (n[c] === t.ADD || n[c] === t.SUB) e = n[c] === t.SUB ? -1 : 1, c++;
		else if (c > 0) return {
			ok: !0,
			simple: !1
		};
		let i = r(n[c]);
		if (n[c] === t.DICE || n[c + 1] === t.DICE) {
			let o = n[c] === t.DICE ? c : c + 1, s = r(n[o + 1]);
			if (s === null) return {
				ok: !0,
				simple: !1
			};
			a.push({
				count: o === c ? 1 : i ?? 0,
				sides: s,
				sign: e
			}), c = o + 2;
		} else if (i !== null) s += e * i, c++;
		else return {
			ok: !0,
			simple: !1
		};
		if (a.some((e) => !e.count)) return {
			ok: !0,
			simple: !1
		};
	}
	return {
		ok: !0,
		simple: !0,
		dice: a,
		mod: s
	};
}
async function I(e, t) {
	await o();
	let n = F(e);
	if (!n) return {
		status: "unsupported",
		reason: "作者骰子程序读不了这个骰式",
		formula: e
	};
	let r = i.RollerUtil._randomise, a = [], s = null;
	i.RollerUtil._randomise = (e) => {
		let { min: n = 1, max: o } = e;
		if (n > o) return 0;
		if (n === o) return o;
		if (!t) {
			let t = r.call(i.RollerUtil, e);
			return a.push({
				min: n,
				max: o,
				value: t
			}), t;
		}
		if (a.length >= t.length) throw s = {
			min: n,
			max: o
		}, Error("KERNEL_NEEDS_DICE");
		let c = t[a.length];
		if (!Number.isInteger(c) || c < n || c > o) throw Error(`骰点 ${c} 不在 ${n}～${o} 之间`);
		return a.push({
			min: n,
			max: o,
			value: c
		}), c;
	};
	try {
		let t = {};
		return {
			status: "complete",
			formula: e,
			total: n.evl(t),
			used: a,
			text: t.text?.join?.("").replace(/\s+/g, " ").trim() ?? null
		};
	} catch (t) {
		return s ? {
			status: "missing",
			formula: e,
			used: a,
			missing: { dice: s }
		} : {
			status: "error",
			formula: e,
			error: t instanceof Error ? t.message : String(t)
		};
	} finally {
		i.RollerUtil._randomise = r;
	}
}
// src/library/table-roll.ts
var L = "#\\$prompt_number:?([^$]*)\\$#", R = (e, t) => {
	let n = Number(e);
	return e !== void 0 && e !== "" && Number.isFinite(n) ? n : t;
};
function z(e, t = L) {
	return [...e.matchAll(new RegExp(t, "g"))].map((e) => {
		let t = {};
		for (let n of (e[1] ?? "").split(",").map((e) => e.trim()).filter(Boolean)) {
			let [e, r] = n.split("=").map((e) => e.trim());
			t[e] = r;
		}
		return {
			raw: e[0],
			title: t.title ?? null,
			default: R(t.default, 0),
			min: R(t.min, 0),
			max: t.max === void 0 || R(t.max, Infinity) === Infinity ? null : R(t.max, 0)
		};
	});
}
function dt(e, t, n = L) {
	let r = z(e, n);
	if (t.length !== r.length) throw Error(`要填 ${r.length} 个数，给了 ${t.length} 个`);
	r.forEach((e, n) => {
		let r = t[n];
		if (!Number.isFinite(r)) throw Error(`第 ${n + 1} 个数不是数字`);
		if (r < e.min || e.max !== null && r > e.max) throw Error(`${e.title ?? `第 ${n + 1} 个数`}要在 ${e.min}～${e.max ?? "不限"} 之间`);
	});
	let i = 0;
	return e.replace(new RegExp(n, "g"), () => String(t[i++]));
}
function ft(e) {
	return e.split(";").map((e) => e.trim()).filter(Boolean);
}
function B(e, t) {
	let n = e.findIndex((e) => {
		if (!e) return !1;
		let n = e.pad && t === 100 ? 0 : t;
		return e.exact == null ? e.min != null && e.max != null && e.min <= n && n <= e.max : e.exact === n;
	});
	return n >= 0 ? n : null;
}
// src/library/runtime/frame/table-roll-commands.ts
var V = (e) => e?.type === "row" ? e.row : e;
function H(e, t) {
	let n = e.rows ?? [];
	return n.map((e, r) => {
		let a = V(e);
		return Array.isArray(a) ? i.Renderer.getRollableRow(a, {
			isForceInfiniteResults: t === i.RollerUtil.ROLL_COL_VARIABLE,
			isFirstRow: r === 0,
			isLastRow: r === n.length - 1
		})?.[0]?.roll ?? null : null;
	});
}
async function pt(e, t) {
	await o();
	let n = i.Renderer.table.getAutoConvertedRollMode(e);
	return n ? {
		rollable: !0,
		mode: n,
		index: B(H(e, n), t)
	} : {
		rollable: !1,
		mode: n,
		index: null
	};
}
function mt(e) {
	let t = i.Renderer.table.getHeaderRowMetas(e)?.at(-1)?.[0];
	if (typeof t != "string") return null;
	let n = i.RollerUtil.getFullRollCol(t), r = /^\{@dice (?<inner>.*)\}$/s.exec(n);
	return r?.groups ? i.Renderer.utils.getTagEntry("@dice", r.groups.inner)?.toRoll ?? null : null;
}
function U(e, t = []) {
	return typeof e == "string" ? t.push(e) : Array.isArray(e) ? e.forEach((e) => U(e, t)) : e && typeof e == "object" && Object.values(e).forEach((e) => U(e, t)), t;
}
function ht(e) {
	let t = [];
	for (let n of U(e)) for (let e of n.matchAll(/\{@(\w+) ([^}]*)\}/g)) try {
		let n = i.Renderer.utils.getTagEntry(`@${e[1]}`, e[2]);
		typeof n?.toRoll == "string" && !/#\$prompt/.test(n.toRoll) && t.push({
			tag: `@${e[1]}`,
			text: e[2],
			formula: n.toRoll
		});
	} catch {}
	return t;
}
var gt = (e) => e.replace(/<[^>]+>/g, "");
async function _t(e, t = {}) {
	await o();
	let n = i.Renderer.table.getAutoConvertedRollMode(e);
	if (!n) return { status: "not-rollable" };
	let r = mt(e);
	if (!r) return { status: "not-rollable" };
	let a = i.Renderer.dice.RE_PROMPT.source, s = ft(r).map((e) => ({
		formula: e,
		prompts: z(e, a)
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
			l = dt(l, t.promptValues, a);
		} catch (e) {
			return {
				status: "error",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	let u = H(e, n), d = !!e.isNameGenerator, f = i.Renderer.table.getHeaderRowMetas(e), p = d ? (f?.at(-1)?.length ?? 1) - 1 : 1, m = t.points ? [...t.points] : void 0, h = async (e) => {
		let t = await I(e, m);
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
		let r = B(u, n.total), i = r === null ? [] : V((e.rows ?? [])[r]).slice(1);
		g.push({
			label: d ? gt(String(f.at(-1)[t + 1] ?? "")) : null,
			formula: l,
			total: n.total,
			used: n.used,
			detail: n.text,
			rowIndex: r,
			cells: d ? [i[t]].filter((e) => e !== void 0) : i
		});
	}
	let _ = [];
	for (let e of g) for (let t of ht(e.cells)) {
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
var vt = {
	monster: "monster",
	object: "object",
	vehicle: "vehicle"
};
async function yt(e, n) {
	await o();
	let r = vt[e];
	if (!r || !i.Renderer[r]?.getTokenUrl || !i.Renderer.generic.hasToken(n)) return null;
	let a = i.Renderer[r].getTokenUrl(n);
	return a ? /^https?:/.test(a) ? a : t(a) : null;
}
// src/library/runtime/frame/table-extract-commands.ts
async function bt() {
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
async function xt(e, t, n = null) {
	await o();
	let { UtilGenTables: r, RecursiveSearchStateGeneric: a } = await bt(), s = t ?? await i.DataLoader.pCacheAndGetAllSite(e) ?? [], l = [], d = [];
	for (let t of s) {
		let i = c(e, t);
		if (i) try {
			let o = new a({ isRequireIncludes: !1 }), s = t.source ?? n, c = {
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
				for (let e of n) r._doSearch({
					state: o,
					tmpMeta: c,
					section: t.name,
					entry: e
				});
			} catch (n) {
				d.push({
					name: `${t.name ?? i}.${e}`,
					error: n instanceof Error ? n.message : String(n)
				});
			}
			if (!o._tables.length) continue;
			let f = o._tables;
			o.getStacks().table.forEach((e, r) => l.push({
				parentHash: i,
				parentName: String(t.name ?? ""),
				parentSource: u(t) ?? n,
				table: e,
				path: f[r]?.path ?? [],
				sectionIndex: f[r]?.sectionIndex ?? null
			}));
		} catch (e) {
			d.push({
				name: String(t.name ?? i),
				error: e instanceof Error ? e.message : String(e)
			});
		}
	}
	return {
		tables: l,
		skipped: d
	};
}
// src/library/runtime/frame/entry-types-commands.ts
var W = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function G(e, t, n) {
	let r = await (await fetch(new URL(`js/${e}`, location.href))).text(), i = [];
	for (let e of r.matchAll(/import\s*\{\s*(\w+)\s*\}\s*from\s*["']\.\/([\w/.-]+\.js)["']/g)) e[2].startsWith(`${t}/`) && n.test(e[1]) && i.push({
		cls: e[1],
		file: e[2]
	});
	return i;
}
var K = null;
function St() {
	return K ??= (async () => {
		await o();
		let [{ TagCondition: e, TaggerUtils: t }, { TagJsons: n }, { AcConvert: r, AttachedItemTag: a, MiscTag: s, SpellcastingTraitConvert: c }, { ConverterItem: l }, { RaceTraitTag: u }, { InstrumentBaseItemTag: d }] = await Promise.all([
			W("converter/converterutils-tags.js"),
			W("converter/converterutils-entries.js"),
			W("converter/converterutils-creature.js"),
			W("converter/converter-item.js"),
			W("converter/converterutils-race.js"),
			W("converter/converterutils-item.js")
		]), [f, p, m, h, g, _] = await Promise.all([
			i.DataUtil.spell.pLoadAll(),
			i.Renderer.item.pBuildList(),
			i.DataUtil.item.loadRawJSON(),
			i.DataUtil.legendaryGroup.pLoadAll(),
			i.DataUtil.class.loadJSON(),
			i.BrewUtil2.pGetBrewProcessed()
		]), v = p.filter((e) => !e._isItemGroup);
		c.init(f), l.init(v, g), r.init(v), t.init({
			legendaryGroups: h,
			spells: f
		}), await n.pInit({ spells: f }), u.init({ itemsRaw: m }), s.init({ items: p }), a.init({ items: p }), await e.pInit({ conditionsBrew: _.condition }), d.init({ items: v });
	})(), K.catch(() => {
		K = null;
	}), K;
}
var q = null;
function J() {
	return q ??= (async () => {
		await o();
		let e = await i.DataUtil.loadJSON(`${i.Renderer.get().baseUrl}data/converter.json`).catch(() => ({ converterSample: [] })), t = { saveSettingsDebounced: () => void 0 }, n = [];
		for (let { cls: r, file: i } of await G("converter.js", "converter", /.ConverterUi$/)) {
			let a = (await W(i))[r];
			typeof a == "function" && n.push(new a({
				ui: t,
				converterData: e
			}));
		}
		return n;
	})(), q.catch(() => {
		q = null;
	}), q;
}
var Y = (e, t) => {
	try {
		return e._getSample(t) ?? null;
	} catch {
		return null;
	}
};
async function X() {
	return (await J()).map((e) => ({
		id: e.converterId,
		prop: e.prop ?? null,
		modes: [...e._modes],
		canSave: !!e.canSaveLocal,
		samples: e._modes.filter((t) => !!Y(e, t))
	}));
}
async function Ct(e, t, n) {
	let r = (await J()).find((t) => t.converterId === e);
	return r ? (n && (r._state.styleHint = n), Y(r, t)) : null;
}
async function wt(e, t, n, r) {
	let i = (await J()).find((t) => t.converterId === e);
	if (!i) throw Error(`作者没有这个转换器：${e}`);
	if (!i._modes.includes(t)) throw Error(`作者的 ${e} 转换器不支持这种格式：${t}（支持 ${i._modes.join("、")}）`);
	await St(), Object.assign(i._state, {
		mode: t,
		...r.styleHint ? { styleHint: r.styleHint } : {}
	}), "source" in i._state && (i._state.source = r.source), "page" in i._state && (i._state.page = r.page ?? 0);
	let a = [], o = [];
	return i.handleParse(n, (e) => a.push(e), (e) => o.push(String(e)), !1), {
		outputs: a,
		warnings: o
	};
}
var Z = null;
function Q() {
	return Z ??= (async () => {
		await o();
		let e = [];
		for (let { cls: t, file: n } of await G("makebrew.js", "makebrew", /(?<!Base)Builder$/)) {
			let r = (await W(n))[t];
			if (typeof r != "function") continue;
			let i = new r()._prop;
			typeof i == "string" && e.push({
				prop: i,
				proto: r.prototype
			});
		}
		return e;
	})(), Z.catch(() => {
		Z = null;
	}), Z;
}
async function Tt(e) {
	let t = (await Q()).find((t) => t.prop === e);
	return t ? t.proto._getInitialState.call(Object.create(t.proto)) : null;
}
async function Et() {
	await o();
	let e = i.UrlUtil, t = new Set(Object.values(e._PAGE_TO_PROPS_CORPUS ?? {}).flatMap((e) => [e.propHead, e.propBody])), n = /* @__PURE__ */ new Map();
	for (let [t, r] of Object.entries(e.PAGE_TO_PROPS ?? {})) for (let e of r) n.has(e) || n.set(e, t);
	let r = new Set((await Q()).map((e) => e.prop)), a = await X();
	return Object.keys(e.URL_TO_HASH_BUILDER ?? {}).filter((e) => !t.has(e)).map((t) => {
		let o = n.get(t);
		return {
			prop: t,
			name: String(i.Parser.getPropDisplayName(t)),
			group: o ? {
				page: o,
				name: String(e.PG_TO_NAME?.[o] ?? o)
			} : null,
			builder: r.has(t),
			converters: a.filter((e) => e.prop === t).map((e) => e.id)
		};
	});
}
// src/library/runtime/frame/commands.ts
async function Dt() {
	let e = /* @__PURE__ */ new Set(), t = [];
	for (let n of i.DataLoader._DATA_TYPE_LOADER_LIST) {
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
async function Ot(e) {
	await o();
	let t = await i.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => c(e, t)),
		sources: t.map((e) => u(e))
	};
}
async function kt(e, t, n) {
	return await o(), ((await i.DataUtil.loadJSON(`data/${e}`))[t] ?? []).map((e) => ({
		id: e.id,
		source: i.SourceUtil.getEntitySource(e),
		hash: i.UrlUtil.URL_TO_HASH_BUILDER[n](e)
	}));
}
async function At(e, t, n) {
	return await o(), i.DataLoader.pCacheAndGet(e, t, n, { isRequired: !0 });
}
async function jt(e) {
	await o();
	let t = e ? new Set(e.map((e) => e.toUpperCase())) : null, n = {};
	for (let e of ["search/index.json", "search/index-item.json"]) {
		let r = i.Omnidexer.decompressIndex(await i.DataUtil.loadRawJSON(e));
		for (let e of r) {
			if (t && e.s && !t.has(String(e.s).toUpperCase())) continue;
			let r = i.Parser.CAT_ID_TO_PROP[e.c] ?? `cat:${e.c}`;
			(n[r] ??= []).push(e.u);
		}
	}
	return n;
}
async function Mt(e, t) {
	await o();
	let n = i.ExcludeUtil.getList().filter((t) => t.hash !== "*" || t.category !== "*" || String(t.source).toLowerCase() !== e.toLowerCase()), r = t ? [...n, {
		displayName: e,
		hash: "*",
		category: "*",
		source: e,
		isAuto: !1
	}] : n;
	return await i.ExcludeUtil.pSetList(r), await i.ExcludeUtil._pSave(), i.ExcludeUtil.getList();
}
async function Nt(e, t, n) {
	return await o(), i.ExcludeUtil.isExcluded(e, t, n, { isNoCount: !0 });
}
async function Pt(e, t) {
	return await o(), t.map((t) => c(e, t));
}
async function Ft() {
	return [...i.__trpgFrameErrors];
}
async function It() {
	let e = i.__trpgStorageFlush;
	return e ? e() : [];
}
var Lt = {
	frameErrors: Ft,
	init: o,
	loaders: Dt,
	parseProp: Ot,
	corpusList: kt,
	parseCorpus: At,
	searchIndexHashes: jt,
	setSourceExcluded: Mt,
	isExcluded: Nt,
	excludedFlags: ge,
	detail: _e,
	search: ve,
	searchIndexDump: be,
	searchIndexLoad: xe,
	searchSettings: ye,
	englishLocators: Le,
	englishMatch: Re,
	variantTemplateNames: ze,
	versionOrder: Be,
	brewCatalog: Se,
	brewInstalled: Ce,
	brewStorage: we,
	brewAddUrl: Te,
	brewAddSources: Oe,
	brewAddFiles: ke,
	brewDelete: Ae,
	brewPull: je,
	brewCheckUpdates: Ne,
	brewCorpusList: Me,
	brewPackRows: Ie,
	parseBrewProp: Pe,
	rawHashes: Pt,
	storageFlush: It,
	editionOf: j,
	sourceNames: He,
	corpusFile: N,
	brewDocIndex: We,
	brewItemsByHash: Ge,
	brewRaw: M,
	brewExport: Ke,
	fluffOf: qe,
	fluffOfMany: Je,
	excludeList: Ye,
	editableDoc: P,
	editableEnsureSource: Xe,
	editablePut: Ze,
	editableRemove: nt,
	editableRetargetCopies: tt,
	editableAddDependencies: rt,
	cleanEntity: et,
	editableExport: $e,
	sourceTaken: Qe,
	converters: X,
	converterSample: Ct,
	convertText: wt,
	entryTemplate: Tt,
	entryTypes: Et,
	diceTag: ct,
	diceStats: lt,
	diceRead: ut,
	diceRoll: I,
	tableRow: pt,
	tableRoll: _t,
	tagMeta: p,
	tagRefs: m,
	brewDependencyPreview: De,
	brewMergeCheck: Ee,
	sortColumns: T,
	sortRanks: me,
	listCells: he,
	authorFields: ne,
	displayName: le,
	renderText: ue,
	renderContent: _,
	renderEntity: se,
	statblockMeta: de,
	tokenPath: yt,
	extractTables: xt,
	directory: ot,
	sourceFiles: at
}, Rt = [
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
], $ = globalThis, zt = new URLSearchParams(location.search).get("frame") ?? "";
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || !t || t.channel !== "trpg-library" || t.type !== "call") return;
	let n = (e) => parent.postMessage({
		channel: r,
		type: "result",
		frame: zt,
		id: t.id,
		...e
	}, location.origin), i = Lt[t.fn];
	i ? i(...t.args).then((e) => n({
		ok: !0,
		value: e
	}), (e) => n({
		ok: !1,
		error: e instanceof Error ? e.stack ?? e.message : String(e)
	})) : n({
		ok: !1,
		error: `小窗没有这个指令：${t.fn}`
	});
});
var Bt = new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "", Vt = {
	channel: r,
	type: "ready",
	frame: zt,
	codeSet: Bt,
	authorVersion: typeof $.VERSION_NUMBER == "string" ? $.VERSION_NUMBER : null,
	present: Object.fromEntries(Rt.map((e) => [e, $[e] !== void 0])),
	errors: [...$.__trpgFrameErrors ?? []]
};
parent.postMessage(Vt, location.origin);
