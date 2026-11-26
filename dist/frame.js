import { d as e, n as t, x as n } from "./images-DNVcAmDw.js";
import { s as r, t as i } from "./protocol-CoIo3UiI.js";
// src/library/runtime/frame/author.ts
var a = globalThis, o = null;
function s() {
	let e = a.UrlUtil.URL_TO_HASH_BUILDER;
	for (let [t, n] of Object.entries(e)) {
		let r = a.DataUtil[t];
		if (r?._PAGE !== null || typeof r.pMergeCopy != "function") continue;
		let i = a.DataLoader.getPropPage(t);
		i && typeof n == "function" && n === e[i] && (r._PAGE = i);
	}
}
function c() {
	return o ??= (async () => {
		a.Renderer.get().setBaseUrl(""), s(), await a.PrereleaseUtil.pInit(), await a.BrewUtil2.pInit(), await a.ExcludeUtil.pInitialise();
	})(), o;
}
function l(e, t) {
	return e ? e[t] ?? e[a.DataLoader.getPropPage(t)] ?? null : null;
}
function u(e, t) {
	let n = l(a.UrlUtil.URL_TO_HASH_BUILDER, e);
	try {
		return n ? n(t) : null;
	} catch {
		return null;
	}
}
function d(e, t) {
	let n = a.UrlUtil.URL_TO_ENG_HASH_BUILDER, r = a.DataLoader.getPropPage(e);
	return !n || !t?.ENG_name || !n[r] ? null : n[r](t);
}
function f(e) {
	return a.SourceUtil.getEntitySource(e) ?? null;
}
// src/library/runtime/frame/tag-commands.ts
function p(e) {
	let t = a.DataLoader._PROP_TO_HASH_PAGE, n = Object.entries(t).filter(([, t]) => t === e).map(([e]) => e);
	return n.length ? n : Object.keys(t).filter((t) => t.toLowerCase() === e.toLowerCase());
}
function m(e, t) {
	let n = e === "@book" ? "book.html" : "adventure.html", { displayText: r, id: i, ixChapter: o, sectionName: s, ixNamedSection: c } = a.UidUtil.unpackUidAdventureBook(t);
	return {
		tag: e,
		name: String(r ?? i ?? ""),
		displayText: String(r ?? i ?? ""),
		source: i ?? null,
		page: n,
		hash: String(i ?? "").toLowerCase(),
		props: p(n),
		part: {
			chapter: o ?? null,
			section: s ?? null,
			ixNamedSection: c ?? null
		}
	};
}
async function h(e, t) {
	await c();
	let n = e.startsWith("@") ? e : `@${e}`;
	if (n === "@book" || n === "@adventure") return m(n, t);
	let r;
	try {
		r = a.Renderer.utils.getTagMeta(n, t);
	} catch {
		return null;
	}
	if (!r) return null;
	let i = r.pageHover ?? r.page, o = r.hashHover ?? r.hash, s = r.sourceHover ?? r.source;
	return {
		tag: n,
		name: String(r.name ?? ""),
		displayText: String(r.displayText ?? r.linkText ?? r.name ?? ""),
		source: s ?? null,
		page: i,
		hash: o,
		props: p(i)
	};
}
async function g(e) {
	await c();
	let t = /* @__PURE__ */ new Map(), n = async (e, n) => {
		let r = `${e} ${n}`, i = t.get(r);
		if (!i) {
			let a = await h(e, n);
			i = a && a.hash ? a.props.map((e) => `${e}|${a.hash}`) : [], t.set(r, i);
		}
		return i;
	}, r = async (e, t) => {
		if (e.includes("{@")) for (let i of a.Renderer.splitByTags(e)) {
			if (!i.startsWith("{@")) continue;
			let [e, o] = a.Renderer.splitFirstSpace(i.slice(1, -1));
			for (let r of await n(e, o)) t.add(r);
			await r(o, t);
		}
	}, i = async (e, t) => {
		if (typeof e == "string") return r(e, t);
		if (Array.isArray(e)) for (let n of e) await i(n, t);
		else if (e && typeof e == "object") for (let n of Object.values(e)) await i(n, t);
	}, o = [];
	for (let t of e) {
		let e = /* @__PURE__ */ new Set();
		await i(t, e), o.push([...e]);
	}
	return o;
}
// src/library/runtime/frame/author-markup.ts
function _(e, t) {
	let n = e.href;
	if (n.type === "external") return n.url ? {
		kind: "external",
		url: n.url
	} : null;
	if (n.type !== "internal" || !n.path) return null;
	if (n.hash === a.HASH_BLANK) return {
		kind: "filter",
		path: t
	};
	let r = n.hover?.page ?? n.path, i = n.hover?.hash ?? n.hash;
	if (!i) return null;
	if (r === "book.html" || r === "adventure.html") {
		let [e, t, n, o] = i.split(a.HASH_PART_SEP), s = n ?? "";
		try {
			s = decodeURIComponent(s);
		} catch {
			return null;
		}
		return {
			kind: "library",
			meta: m(r === "book.html" ? "@book" : "@adventure", [
				"",
				e,
				t,
				s,
				o
			].join("|"))
		};
	}
	let o = p(r);
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
			hash: s ? i : a.UrlUtil.encodeForHash(i)
		}
	};
}
function v(e, { tables: t = !0 } = {}) {
	let r = a.Renderer.get(), i = n(), o = [], s = [], c = r._renderTable;
	t && (r._renderTable = function(e, t, n, r) {
		let a = s.push(JSON.parse(JSON.stringify(e))) - 1;
		t[0] += `<div data-trpg-table="${i}:${a}">`, c.call(this, e, t, n, r), t[0] += "</div>";
	});
	try {
		return {
			value: r.withPlugin({
				pluginTypes: ["link"],
				fnPlugin: (e, { input: t }) => {
					let n = _(t, r._renderLink_getHref(t));
					if (!n) return { isDisableEvents: !0 };
					let a = o.push(n) - 1;
					return {
						isDisableEvents: !0,
						attributes: `data-trpg-link="${i}:${a}"`
					};
				},
				fn: e
			}),
			marker: i,
			links: o,
			tables: s
		};
	} finally {
		t && (r._renderTable = c);
	}
}
async function ee(e, { tables: t = !0 } = {}) {
	await c();
	let { value: n, marker: r, links: i, tables: o } = v(() => String(a.Renderer.get().render(e)), { tables: t });
	return {
		html: n,
		marker: r,
		links: i,
		...o.length ? { tables: o } : {}
	};
}
// src/library/runtime/frame/field-commands.ts
var y = (e) => String(e ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(), te = (e) => Array.isArray(e) ? e.map(y).filter(Boolean).join("、") : y(e), ne = {
	spell: (e) => [["成分", e.components ? a.Parser.spComponentsToFull(e.components, e.level, { isPlainText: !0 }) : ""], ["持续时间", e.duration ? a.Parser.spDurationToFull(e.duration, { isPlainText: !0 }) : ""]],
	class: (e) => {
		let t = e.startingProficiencies ?? {}, n = { styleHint: e.edition ?? "classic" };
		return [
			["豁免熟练", Array.isArray(e.proficiency) ? e.proficiency.map((e) => a.Parser.attAbvToFull(e)) : ""],
			["护甲受训", t.armor ? a.Renderer.class.getRenderedArmorProfs(t.armor, n) : ""],
			["武器熟练", t.weapons ? a.Renderer.class.getRenderedWeaponProfs(t.weapons, n) : ""],
			["工具熟练", t.tools ? a.Renderer.class.getRenderedToolProfs(t.tools, n) : ""],
			["技能熟练", t.skills ? a.Renderer.class.getRenderedSkillProfs(t.skills, n) : ""],
			["起始装备", Array.isArray(e.startingEquipment?.default) ? e.startingEquipment.default.join("；") : ""]
		];
	},
	deity: (e) => [
		["神系", e.pantheon],
		["阵营", Array.isArray(e.alignment) ? a.Parser.alignmentListToFull(e.alignment) : ""],
		["类别", e.category],
		["领域", Array.isArray(e.domains) ? e.domains.join("、") : ""],
		["权能", e.province],
		["象征", e.symbol]
	]
};
async function re(e, t) {
	await c();
	let n = ne[e], r = [];
	if (n) try {
		let { value: e, marker: i, links: a } = v(() => n(t), { tables: !1 });
		for (let [t, n] of e) {
			let e = Array.isArray(n) ? te(n) : y(n), o = typeof n == "string" && n.includes(i) ? {
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
	let i = null;
	if (e === "class") try {
		i = Array.from({ length: 20 }, (e, t) => `+${a.Parser.levelToPb(t + 1)}`);
	} catch {
		i = null;
	}
	return {
		lines: r,
		pb: i
	};
}
// src/library/runtime/frame/page-prepare.ts
var ie = {
	"bestiary.html": () => Promise.all([a.DataUtil.monster.pPreloadLegendaryGroupsSite(), a.DataUtil.monster.pUpdatePreloadLegendaryGroupsBrew()]),
	"items.html": () => a.Renderer.item.pPopulatePropertyAndTypeReference()
}, b = /* @__PURE__ */ new Map();
async function ae(e) {
	let t = ie[e];
	if (!t) return;
	let n = b.get(e);
	n || (n = t().catch((t) => {
		throw b.delete(e), t;
	}), b.set(e, n)), await n;
}
async function x(e) {
	await c(), await ae(a.DataLoader.getPropPage(e) ?? "");
}
// src/library/runtime/frame/entity-render.ts
function oe(e) {
	let t = a.DataLoader.getPropPage(e);
	for (let n of [t, e]) if (n) try {
		if (a.Renderer.hover._getFnRenderCompact({
			page: n,
			isStatic: !0
		})) return a.Renderer.hover.getFnRenderCompact(n, { isStatic: !0 });
	} catch {}
	return null;
}
var se = () => a.Renderer.hover.getFnRenderCompact("generic", { isStatic: !0 });
function ce(e, t) {
	let { value: n, marker: r, links: i, tables: a } = v(() => String(e(t) ?? ""));
	if (!n.trim()) return null;
	let o = document.createElement("template");
	return o.innerHTML = `<table>${n}</table>`, o.content.querySelectorAll("th.ve-stats__th-name").forEach((e) => e.closest("tr")?.remove()), {
		html: o.innerHTML,
		marker: r,
		links: i,
		tables: a
	};
}
async function le(e, t) {
	await c(), await x(e);
	let n = oe(e);
	if (n) try {
		return ce(n, t);
	} catch (t) {
		console.warn(`[trpg-assistant] 作者的「${e}」整条渲染出错，改用通用渲染`, t);
	}
	return ce(se(), t);
}
// src/library/runtime/frame/entry-commands.ts
var ue = { itemProperty: (e) => a.Renderer.itemProperty.getItemPropertyRenderableEntriesMeta(e).entryFaux.name };
async function de(e, t) {
	await c();
	let n = ue[e], r = n ? n(t) : t?.name;
	return typeof r == "string" && r ? r : null;
}
async function fe(e) {
	await c();
	let t = a.Renderer.get().render(e), n = document.createElement("div");
	return n.innerHTML = t, (n.textContent ?? "").replace(/\s+/g, " ").trim();
}
async function pe(e) {
	await c();
	let t = a.Renderer.utils.getStatblockEntryMeta(e), n = String(t.prop ?? ""), r = !!t.isFluff;
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
var me = (e) => ["js/filter-common.js", `js/filter-${e}.js`], S = /* @__PURE__ */ new Set();
async function he(e) {
	S.has(e) || (S.add(e), await new Promise((t) => {
		let n = document.createElement("script");
		n.src = e, n.onload = () => t(), n.onerror = () => t(), document.head.appendChild(n);
	}));
}
async function C(e) {
	await c();
	let t = String(a.DataLoader.getPropPage(e) ?? "").replace(/\.html$/, "");
	if (!t) return null;
	for (let e of me(t)) await he(e);
	let n = Object.keys(a).find((e) => e.startsWith("ModalFilter") && e.toLowerCase() === `modalfilter${t}`);
	return n && typeof a[n] == "function" ? {
		Cls: a[n],
		page: t
	} : null;
}
function ge(e, t) {
	let n = a.UrlUtil.getCurrentPage;
	a.UrlUtil.getCurrentPage = () => `${e}.html`;
	try {
		return t();
	} finally {
		a.UrlUtil.getCurrentPage = n;
	}
}
async function _e(e) {
	let t = await C(e);
	return t ? t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})).filter((e) => !!e.sort) : [];
}
async function ve(e, t) {
	await x(t);
	let n = [...await a.DataLoader.pCacheAndGetAllSite(t) ?? [], ...await a.DataLoader.pCacheAndGetAllBrew(t) ?? []];
	return ge(e.page, () => {
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
async function ye(e, t, n) {
	let r = await C(e);
	if (!r || !(await _e(e)).some((e) => e.sort === t)) return null;
	let { inst: i, entities: o, items: s } = await ve(r, e);
	return ge(r.page, () => {
		let r = {
			_filteredItems: s,
			_sortBy: t,
			_sortDir: n,
			_fnSort: i._fnSort,
			_wrpList: { previousElementSibling: { querySelector: () => ({}) } },
			constructor: a.List
		}, c = a.List.prototype.getSortedItems.call(r, { items: [...s] }), l = new Map(s.map((e, t) => [e, t])), d = {};
		return c.forEach((t, n) => {
			let r = u(e, o[l.get(t)]);
			r && !(r in d) && (d[r] = n);
		}), d;
	});
}
async function be(e) {
	let t = await C(e);
	if (!t) return null;
	let n = t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})), { entities: r, items: i } = await ve(t, e), a = {};
	return i.forEach((t, i) => {
		let o = u(e, r[i]);
		if (!o || o in a) return;
		let s = [...t.ele?.firstElementChild?.children ?? []].map((e) => String(e.textContent ?? "").replace(/\s+/g, " ").trim());
		a[o] = n.map((e, t) => s[s.length - n.length + t] ?? "");
	}), {
		columns: n,
		cells: a
	};
}
// src/library/runtime/frame/read-commands.ts
function w(e, t, n) {
	let r = f(t);
	return r ? a.DataLoader.getPropPage(e) === a.UrlUtil.PG_ITEMS && a.Renderer.item.isExcluded(t, { hash: n }) ? !0 : a.ExcludeUtil.isExcluded(n ?? "", t.__prop ?? e, r, { isNoCount: !0 }) : !1;
}
async function xe(e, t = "site") {
	if (await c(), !a.ExcludeUtil.getList().length) return {
		hashes: [],
		excluded: null
	};
	await x(e);
	let n = await (t === "brew" ? a.DataLoader.pCacheAndGetAllBrew(e) : a.DataLoader.pCacheAndGetAllSite(e)) ?? [], r = n.map((t) => u(e, t));
	return {
		hashes: r,
		excluded: n.map((t, n) => w(e, t, r[n]))
	};
}
async function Se(e, t, n) {
	await c(), await x(e);
	let r = n ? await a.DataLoader.pCacheAndGet(e, n, t) : await a.DataLoader.pCacheAndGetHash(e, t);
	if (!r) return null;
	let i = null, o = null;
	try {
		i = await a.Renderer.utils.pGetProxyFluff({
			entity: r,
			prop: e
		}) ?? null;
	} catch (e) {
		o = e instanceof Error ? e.message : String(e);
	}
	return {
		item: r,
		hash: t,
		source: f(r),
		excluded: w(e, r, t),
		fluff: i,
		fluffError: o,
		engSiteHash: d(e, r)
	};
}
async function Ce(e, t = null) {
	await c();
	let n = t === null ? null : await we(), r = n?.isShowLegacy;
	n && (n.isShowLegacy = t);
	try {
		return (await a.OmnisearchBacking.pGetResults(a.CleanUtil.getCleanString(e))).map((e) => ({
			score: e.score,
			prop: a.Parser.pageCategoryToProp(e.doc.c),
			doc: e.doc
		}));
	} finally {
		n && (n.isShowLegacy = r);
	}
}
async function we() {
	return (await import(
		/* @vite-ignore */
		new URL("js/omnisearch/omnisearch-state.js", location.href).href
)).OmnisearchState;
}
async function Te(e = {}) {
	await c();
	let t = await we();
	for (let [n, r] of Object.entries(e)) {
		if (!(n in t._DEFAULT_STATE)) throw Error(`作者的搜索设置里没有这一项：${n}`);
		n === "partneredMode" ? t.setPartneredMode(r) : t[n] = r;
	}
	return t._getComp().toObject();
}
async function Ee() {
	await c();
	let e = a.OmnisearchBacking;
	return await e._pInit(), {
		json: JSON.stringify(e._searchIndex.toJSON()),
		maxId: e._maxId ?? null,
		categoryCounts: e._CATEGORY_COUNTS ?? {},
		adventureBookLookup: e._adventureBookLookup ?? {}
	};
}
async function De(e) {
	await c(), a.SearchUtil._initSearchIndex_getFnFold();
	let t = a.OmnisearchBacking;
	return t._searchIndex = a.elasticlunr.Index.load(JSON.parse(e.json)), t._maxId = e.maxId, t._CATEGORY_COUNTS = e.categoryCounts, t._adventureBookLookup = e.adventureBookLookup, t._pLoadSearch = Promise.resolve(), t._initReInCategory(), !0;
}
// src/library/runtime/frame/brew-commands.ts
async function T(e) {
	await c();
	let t = a.__trpgFrameErrors, n = t.length, r = await e();
	return await new Promise((e) => setTimeout(e, 50)), {
		value: r,
		errors: t.slice(n)
	};
}
var E = (e) => ({
	head: e.head,
	meta: e.body?._meta ?? null
});
function Oe() {
	return T(() => a.BrewUtil2.pGetCombinedIndexes());
}
async function ke() {
	return await c(), (await a.BrewUtil2.pGetBrew()).map(E);
}
async function Ae() {
	await c();
	let e = [];
	for (let [t, n] of [["brew", a.BrewUtil2], ["prerelease", a.PrereleaseUtil]]) {
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
async function je(e) {
	let t = await T(() => a.BrewUtil2.pAddBrewFromUrl(e));
	return {
		...t,
		value: (t.value ?? []).map(E)
	};
}
async function Me() {
	await c();
	let e = a.BrewUtil2, t = await e._LOCK.pLock();
	try {
		return e._cache_brewsProc = null, await e._pGetBrewProcessed_({ lockToken: t }), {
			ok: !0,
			error: null,
			missing: []
		};
	} catch (n) {
		e._cache_brewsProc = null;
		let r = n instanceof Error ? n.message : String(n), i = /^Could not find prerelease\/brew URL for source "([^"]+)"$/.exec(r)?.[1];
		if (!i) return {
			ok: !1,
			error: r,
			missing: []
		};
		let a = {
			source: i,
			packs: []
		};
		for (let n of await e.pGetBrew({ lockToken: t })) {
			let { available: t, unavailable: r } = e._getBrewDependencySources({
				brewDoc: n,
				brewIndex: {}
			});
			[...t, ...r].some((e) => e.toLowerCase() === i.toLowerCase()) && a.packs.push({
				docIdLocal: String(n.head?.docIdLocal ?? ""),
				filename: n.head?.filename ?? null
			});
		}
		return {
			ok: !1,
			error: r,
			missing: [a]
		};
	} finally {
		e._LOCK.unlock();
	}
}
async function Ne(e) {
	return await c(), T(async () => {
		let t = a.BrewUtil2, n = await t._pGetBrewDocFromUrl({ url: e }), r = await t._pGetBrewDependencies_getBrewIndex({
			urlRoot: await t.pGetCustomUrl(),
			isIgnoreNetworkErrors: !0
		}), { available: i, unavailable: o } = t._getBrewDependencySources({
			brewDoc: n,
			brewIndex: r
		}), s = new Set((await t.pGetBrew()).flatMap((e) => (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean)));
		return {
			sources: (n.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
			dependencies: i.map((e) => ({
				source: e,
				file: String(r[e] ?? "").split("/").pop() ?? e,
				installed: s.has(e)
			})),
			unavailable: o
		};
	});
}
async function Pe(e) {
	let t = await T(async () => {
		let t = [], n = [], r = new Set((await a.BrewUtil2.pGetBrew()).map((e) => e.head.docIdLocal));
		return await Promise.all(e.map(async (e) => {
			let r = await a.BrewUtil2.pGetSourceUrl(e);
			if (!r) t.push(e);
			else try {
				await a.BrewUtil2.pAddBrewFromUrl(r, { isLazy: !0 });
			} catch {
				n.push(e);
			}
		})), await a.BrewUtil2.pAddBrewsLazyFinalize(), {
			added: (await a.BrewUtil2.pGetBrew()).filter((e) => !r.has(e.head.docIdLocal)),
			notFound: [...t, ...n]
		};
	});
	return {
		errors: t.errors,
		value: {
			added: t.value.added.map(E),
			notFound: t.value.notFound
		}
	};
}
async function Fe(e) {
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
	let r = await T(async () => {
		let [e, t] = n.segregate((e) => a.BrewUtil2.constructor._isPrereleaseDroppedJson(e.json)), r = [];
		return e.length && r.push(...await a.PrereleaseUtil.pAddBrewsFromFiles(e) ?? []), t.length && r.push(...await a.BrewUtil2.pAddBrewsFromFiles(t) ?? []), r;
	});
	return {
		errors: r.errors,
		value: {
			added: r.value.map(E),
			notJson: t
		}
	};
}
async function Ie(e) {
	return T(async () => {
		let t = new Set(e), n = (await a.BrewUtil2.pGetBrew()).filter((e) => t.has(e.head.docIdLocal));
		return await a.BrewUtil2.pDeleteBrews(n), n.length;
	});
}
async function Le(e = null) {
	let t = await T(async () => {
		let t = e ? (await a.BrewUtil2.pGetBrew()).filter((t) => e.includes(t.head.docIdLocal)) : null;
		return a.BrewUtil2.pPullAllBrews({ brews: t });
	});
	return {
		...t,
		value: (t.value ?? []).map(E)
	};
}
async function Re(e, t) {
	return await c(), ((await a.BrewUtil2.pGetBrewProcessed())?.[e] ?? []).map((e) => ({
		id: e.id,
		name: e.name,
		source: a.SourceUtil.getEntitySource(e),
		hash: a.UrlUtil.URL_TO_HASH_BUILDER[t](e)
	}));
}
async function ze(e = null) {
	return T(async () => {
		let t = a.BrewUtil2, n = (await t.pGetBrew()).filter((n) => t.isPullable(n) && (!e || e.includes(n.head.docIdLocal))), r = [];
		for (let e of n) {
			let t = e.body._meta?.dateLastModified ?? 0;
			try {
				let n = await a.DataUtil.loadRawJSON(e.head.url, { isBustCache: !0 }), i = n._meta?.dateLastModified ?? 0;
				r.push({
					docIdLocal: e.head.docIdLocal,
					filename: e.head.filename ?? null,
					url: e.head.url,
					local: t,
					remote: i,
					hasUpdate: i > t,
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
async function Be(e) {
	await c(), await x(e);
	let t = await a.DataLoader.pCacheAndGetAllBrew(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => u(e, t)),
		sources: t.map((e) => f(e))
	};
}
function Ve(e, t, n, r, i) {
	if (t._versionBase_hash) return r.has(t._versionBase_hash);
	if (t._isSubRace && t._subraceName) {
		let e = u("subrace", {
			name: t._subraceName,
			raceName: t._baseName,
			source: f(t)
		});
		return !!e && (i.subrace ?? []).includes(e);
	}
	if (t.genericVariant) {
		let e = u("magicvariant", t.genericVariant);
		return !!e && (i.magicvariant ?? []).includes(e);
	}
	return e === "item" && t._isItemGroup ? (i.itemGroup ?? []).includes(n) : r.has(n);
}
async function He(e) {
	await c();
	let t = {};
	for (let n of new Set(a.DataLoader._DATA_TYPE_LOADER_LIST)) {
		let r = n.constructor.PAGE;
		if (a.UrlUtil._PAGE_TO_PROPS_CORPUS[r]) continue;
		let i = n.constructor.PROPS, o = r === a.UrlUtil.PG_ITEMS || r === a.UrlUtil.PG_RACES ? a.UrlUtil.PAGE_TO_PROPS[r] ?? [] : [];
		for (let n of i) {
			if (n.startsWith("raw_")) continue;
			let i = n === o[0];
			if (!e[n]?.length && !(i && o.some((t) => e[t]?.length))) continue;
			let s = new Set(e[n] ?? []);
			if (i && r === a.UrlUtil.PG_ITEMS) for (let t of o.filter((e) => a.UrlUtil.URL_TO_HASH_BUILDER[e] === a.UrlUtil.URL_TO_HASH_BUILDER[r])) for (let n of e[t] ?? []) s.add(n);
			await x(n);
			let c = (await a.DataLoader.pCacheAndGetAllBrew(n) ?? []).flatMap((t) => {
				let r = u(n, t);
				return !r || !Ve(n, t, r, s, e) ? [] : [{
					hash: r,
					item: t,
					source: f(t),
					excluded: w(n, t, r)
				}];
			});
			c.length && (t[n] = c);
		}
	}
	return t;
}
// src/library/runtime/frame/english-commands.ts
async function Ue(e) {
	await c();
	let t = e ? new Set(e.map((e) => e.toUpperCase())) : null, n = [], r = async (e, r, i) => {
		let o = new a.Omnidexer();
		await o.pAddToIndex(e, r, {
			isNoFilter: !0,
			isIncludeEntityLocator: !0
		});
		for (let e of o.getIndex().x) {
			if (!e._entityLocator) continue;
			let r = e._entityLocator.source ? String(e._entityLocator.source).toUpperCase() : null;
			t && r && !t.has(r) || n.push({
				prop: a.Parser.pageCategoryToProp(e.c),
				hash: e.u,
				file: i,
				locator: e._entityLocator
			});
		}
	};
	for (let e of a.Omnidexer.TO_INDEX__FROM_INDEX_JSON) {
		let t = await a.DataUtil.loadRawJSON(`data/${e.dir}/index.json`);
		for (let n of Object.values(t)) {
			let t = `data/${e.dir}/${n}`;
			await r(e, await a.DataUtil.loadRawJSON(t), t);
		}
	}
	for (let e of a.Omnidexer.TO_INDEX) {
		let t = `data/${e.file}`;
		await r(e, await a.DataUtil.loadJSON(t), t);
	}
	return n;
}
async function We(e) {
	await c();
	let t = /* @__PURE__ */ new Map(), n = (e) => {
		let n = t.get(e);
		return n || (n = a.DataUtil.loadRawJSON(e), t.set(e, n)), n;
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
		let i = t.locator, o = i ? a.Omnidexer.getProperty(e, i.prop) : null, s = (e) => e?.name === i.name && (i.source == null || e.source === i.source), c = o?.filter((e) => e.source === i.source && e.page === i.page) || [], l = null, d = o?.filter(s) ?? [], p = d.length > 1 && o?.length === i.count && d.includes(o[i.ix]) ? o[i.ix] : d[0];
		p ? l = "name" : (p = Object.values(e).filter(Array.isArray).flat().find(s)) ? l = "name-any-array" : (p = o?.length === i.count ? o[i.ix] : null) ? l = "position" : (p = c[i.ixSourcePage]) && (l = "source-page"), r.push({
			prop: t.prop,
			hash: t.hash,
			enHash: p ? u(i.prop, p) : null,
			enSource: p ? f(p) : null,
			via: l
		});
	}
	return r;
}
async function Ge() {
	return await c(), ((await a.DataUtil.item.loadRawJSON())?.magicvariant ?? []).map((e) => ({
		name: e.name,
		eng: e.ENG_name ?? null,
		source: e.inherits?.source ?? e.source ?? null
	}));
}
async function Ke(e) {
	await c();
	let t = {};
	for (let n of e) {
		let e = await a.DataLoader.pCacheAndGetAllSite(n) ?? [];
		for (let r of e) {
			if (!r?._versions?.length) continue;
			let e = u(n, r);
			if (!e) continue;
			let i = a.DataUtil.generic.getVersions(r);
			(t[n] ??= {})[e] = i.map((e) => u(n, e)).filter((e) => !!e);
		}
	}
	return t;
}
// src/library/runtime/frame/edit-commands.ts
var qe = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function D(t) {
	await c();
	let n = {}, r = await a.BrewUtil2.pGetBrew();
	for (let i of t) n[i] = a.BrewUtil2.hasSourceJson(i) && e(r, i) ? {
		classic: null,
		basis: "brew-meta"
	} : a.BrewUtil2.hasSourceJson(i) || a.PrereleaseUtil.hasSourceJson(i) ? {
		classic: !!a.SourceUtil.isClassicSource(i),
		basis: "brew-meta"
	} : a.Parser.sourceJsonToDate(i) ? {
		classic: !!a.SourceUtil.isClassicSource(i),
		basis: "date"
	} : {
		classic: null,
		basis: null
	};
	return n;
}
async function Je(e) {
	return await c(), Object.fromEntries(e.map((e) => [e, {
		full: a.Parser.sourceJsonToFull(e),
		abv: a.Parser.sourceJsonToAbv(e)
	}]));
}
var Ye = (e) => {
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
			hash: u(t, n)
		});
	}
	return t;
};
async function Xe() {
	return await c(), (await a.BrewUtil2.pGetBrew()).map((e, t) => ({
		docIdLocal: e.head.docIdLocal,
		filename: e.head.filename ?? null,
		url: e.head.url ?? null,
		timeAdded: e.head.timeAdded ?? 0,
		order: t,
		isEditable: !!e.head.isEditable,
		sources: (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
		props: Object.fromEntries(Object.entries(e.body ?? {}).filter(([e, t]) => !e.startsWith("_") && Array.isArray(t)).map(([e, t]) => [e, t.map((t) => t && typeof t == "object" ? u(e, t) : null)])),
		requires: Ye(e.body)
	}));
}
async function Ze(e = null) {
	await c();
	let t = await a.BrewUtil2.pGetBrew();
	return e ? t.filter((t) => e.includes(t.head.docIdLocal)) : t;
}
async function Qe(e) {
	await c();
	let t = {};
	for (let { prop: n, hash: r } of e) {
		await x(n), await a.DataLoader.pCacheAndGetAllBrew(n);
		let e = await a.DataLoader.pCacheAndGetHash(n, r);
		e && ((await a.DataLoader.pCacheAndGetAllSite(n) ?? []).includes(e) || (t[`${n}|${r}`] = e));
	}
	return t;
}
async function O(e, t) {
	return await c(), `data/${e}/${e}-${a.UrlUtil.encodeForHash(t.toLowerCase())}.json`;
}
async function $e(e) {
	let t = (await Ze([e]))[0];
	return t ? {
		filename: t.head.filename ?? null,
		body: t.body
	} : null;
}
async function et(e, t) {
	await c();
	try {
		return {
			fluff: await a.Renderer.utils.pGetProxyFluff({
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
async function tt(e, t) {
	await c();
	let n = {};
	for (let r of t) {
		let t = u(e, r);
		if (t) try {
			n[t] = {
				fluff: await a.Renderer.utils.pGetProxyFluff({
					entity: r,
					prop: e
				}) ?? null,
				fluffError: null,
				engSiteHash: d(e, r)
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
async function nt() {
	return await c(), a.ExcludeUtil.getList();
}
async function k() {
	return await c(), a.BrewUtil2.pGetOrCreateEditableBrewDoc();
}
async function rt(e) {
	return ((await k()).body?._meta?.sources ?? []).some((t) => String(t.json).toLowerCase() === e.json.toLowerCase()) || await a.BrewUtil2.pAddSource({
		authors: [],
		convertedBy: [],
		version: "1",
		...e
	}), ((await k()).body?._meta?.sources ?? []).map((e) => e.json);
}
async function it(e, t) {
	await c();
	let n = t.uniqueId ? ((await a.BrewUtil2.pGetOrCreateEditableBrewDoc()).body?.[e] ?? []).find((e) => e?.uniqueId === t.uniqueId) : null, r = {
		...t,
		uniqueId: t.uniqueId ?? a.CryptUtil.uid()
	};
	return await a.BrewUtil2.pPersistEditableBrewEntity(e, r), {
		uniqueId: r.uniqueId,
		hash: u(e, r),
		previousHash: n ? u(e, n) : null,
		previous: n ? {
			name: String(n.name ?? ""),
			source: String(n.source ?? "")
		} : null,
		previousEntity: n ? a.MiscUtil.copyFast(n) : null
	};
}
async function at(e) {
	await c();
	let t = e.toLowerCase();
	return Object.keys(a.Parser.SOURCE_JSON_TO_FULL ?? {}).some((e) => e.toLowerCase() === t) || !!a.BrewUtil2.hasSourceJson(e) || !!a.PrereleaseUtil.hasSourceJson(e);
}
async function ot(e, t) {
	await c();
	let { PropOrder: n } = await qe("utils-proporder.js"), r = await k(), i = (t) => String(t ?? "").toLowerCase() === e.toLowerCase(), o = (r.body?._meta?.sources ?? []).find((e) => i(e?.json));
	if (!o) throw Error(`可编辑自制里没有来源 ${e}`);
	let s = Math.round(Date.now() / 1e3), l = { _meta: {
		sources: [a.MiscUtil.copyFast(o)],
		dateAdded: s,
		dateLastModified: s,
		edition: t
	} }, u = {};
	for (let [e, t] of Object.entries(r.body ?? {})) {
		if (e.startsWith("_") || !Array.isArray(t)) continue;
		let r = t.filter((e) => i(e?.source));
		if (r.length) {
			l[e] = r.map((t) => n.getOrdered(a.DataUtil.cleanJson(a.MiscUtil.copyFast(t)), e));
			for (let t of r) t?._copy?.source && !i(t._copy.source) && (u[e] ??= /* @__PURE__ */ new Set()).add(String(t._copy.source));
		}
	}
	return Object.keys(u).length && (l._meta.dependencies = Object.fromEntries(Object.entries(u).map(([e, t]) => [e, [...t]]))), {
		filename: `${a.DataUtil.getCleanFilename(o.full ?? o.json)}.json`,
		body: l
	};
}
async function st(e) {
	return await c(), a.DataUtil.cleanJson(a.MiscUtil.copyFast(e));
}
async function ct(e, t, n) {
	await c();
	let r = a.MiscUtil.copyFast(await k()), i = (e, t) => String(e ?? "").toLowerCase() === t.toLowerCase(), o = 0;
	for (let a of r.body?.[e] ?? []) {
		let e = a?._copy;
		e && i(e.name, t.name) && i(e.source, t.source) && (e.name = n.name, e.source = n.source, o++);
	}
	return o && await a.BrewUtil2.pSetEditableBrewDoc(r), o;
}
async function lt(e, t) {
	await c();
	let n = ((await a.BrewUtil2.pGetOrCreateEditableBrewDoc()).body?.[e] ?? []).filter((e) => t.includes(e?.uniqueId)).map((e) => a.MiscUtil.copyFast(e));
	return await a.BrewUtil2.pRemoveEditableBrewEntities(e, t), n;
}
async function ut(e) {
	let t = a.MiscUtil.copyFast(await k()), n = t.body._meta.dependencies ??= {};
	for (let [t, r] of Object.entries(e)) n[t] = [.../* @__PURE__ */ new Set([...n[t] ?? [], ...r])];
	return await a.BrewUtil2.pSetEditableBrewDoc(t), n;
}
// src/library/runtime/frame/directory-commands.ts
var dt = (e) => e instanceof Error ? e.message : String(e);
async function ft() {
	await c();
	let e = {}, t = /* @__PURE__ */ new Set();
	for (let n of a.DataLoader._DATA_TYPE_LOADER_LIST) for (let r of n.constructor.PROPS) {
		if (t.has(r) || r.startsWith("raw_")) continue;
		t.add(r);
		let n = a.DataUtil[r];
		if (!n || typeof n.pLoadIndex != "function") continue;
		let i = String(n._DIR ?? "");
		if (!i) continue;
		let o = await n.pLoadIndex();
		e[r] = {
			dir: i,
			indexPath: `data/${i}/${n._isFluff ? "fluff-" : ""}index.json`,
			index: o,
			bySource: Object.keys(o).some((e) => a.Parser.hasSourceJson(e))
		};
	}
	return {
		maps: e,
		classFiles: [...new Set(Object.values(e).filter((e) => !e.bySource).flatMap(({ dir: e, index: t }) => Object.values(t).map((t) => `data/${e}/${t}`)))]
	};
}
async function pt(e) {
	await c();
	let t = [];
	for (let n of e) try {
		let e = (await a.DataUtil.loadJSON(`data/${n.index}`))[n.prop] ?? [];
		t.push({
			prop: n.prop,
			items: e,
			files: await Promise.all(e.map((e) => O(n.prop, String(e.id)))),
			error: null
		});
	} catch (e) {
		t.push({
			prop: n.prop,
			items: [],
			files: [],
			error: dt(e).split("\n")[0]
		});
	}
	let n = [...new Set(t.flatMap((e) => e.items.map((e) => a.SourceUtil.getEntitySource(e))))], r = n.length ? await D(n) : {}, i = {};
	for (let e of n) i[e] = {
		full: a.Parser.sourceJsonToFull(e),
		abv: a.Parser.sourceJsonToAbv(e),
		edition: r[e]
	};
	return {
		groups: a.SourceUtil.ADV_BOOK_GROUPS.map((e) => ({ ...e })),
		corpora: t,
		sources: i,
		sourceFiles: await ft()
	};
}
// src/library/runtime/frame/dice-commands.ts
var mt = (e) => a.Renderer.dice.lang.getTree3(e)?.tree ?? null, ht = (e) => e.replace(/<[^>]+>/g, "");
async function gt(e, t) {
	return await c(), a.Renderer.utils.getTagEntry(e.startsWith("@") ? e : `@${e}`, t);
}
async function _t(e) {
	await c();
	let t = mt(e);
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
async function vt(e) {
	if (await c(), !e.trim()) return {
		ok: !0,
		simple: !0,
		dice: [],
		mod: 0
	};
	try {
		if (!a.Renderer.dice.lang.getTree3(e, !1)?.tree) return {
			ok: !1,
			error: "作者骰子程序读不了这个骰式"
		};
	} catch (e) {
		return {
			ok: !1,
			error: ht(e instanceof Error ? e.message : String(e))
		};
	}
	let t = a.Renderer.dice.tk, n = a.Renderer.dice.lang._lex3(e).lexed, r = (e) => e?.type === t.TYP_NUMBER && /^\d+$/.test(String(e.value)) ? Number(e.value) : null, i = [], o = 0, s = 0;
	for (; s < n.length;) {
		let e = 1;
		if (n[s] === t.ADD || n[s] === t.SUB) e = n[s] === t.SUB ? -1 : 1, s++;
		else if (s > 0) return {
			ok: !0,
			simple: !1
		};
		let a = r(n[s]);
		if (n[s] === t.DICE || n[s + 1] === t.DICE) {
			let o = n[s] === t.DICE ? s : s + 1, c = r(n[o + 1]);
			if (c === null) return {
				ok: !0,
				simple: !1
			};
			i.push({
				count: o === s ? 1 : a ?? 0,
				sides: c,
				sign: e
			}), s = o + 2;
		} else if (a !== null) o += e * a, s++;
		else return {
			ok: !0,
			simple: !1
		};
		if (i.some((e) => !e.count)) return {
			ok: !0,
			simple: !1
		};
	}
	return {
		ok: !0,
		simple: !0,
		dice: i,
		mod: o
	};
}
async function yt(e, t) {
	await c();
	let n = mt(e);
	if (!n) return {
		status: "unsupported",
		reason: "作者骰子程序读不了这个骰式",
		formula: e
	};
	let r = a.RollerUtil._randomise, i = [], o = null;
	a.RollerUtil._randomise = (e) => {
		let { min: n = 1, max: s } = e;
		if (n > s) return 0;
		if (n === s) return s;
		if (!t) {
			let t = r.call(a.RollerUtil, e);
			return i.push({
				min: n,
				max: s,
				value: t
			}), t;
		}
		if (i.length >= t.length) throw o = {
			min: n,
			max: s
		}, Error("KERNEL_NEEDS_DICE");
		let c = t[i.length];
		if (!Number.isInteger(c) || c < n || c > s) throw Error(`骰点 ${c} 不在 ${n}～${s} 之间`);
		return i.push({
			min: n,
			max: s,
			value: c
		}), c;
	};
	try {
		let t = {};
		return {
			status: "complete",
			formula: e,
			total: n.evl(t),
			used: i,
			text: t.text?.join?.("").replace(/\s+/g, " ").trim() ?? null
		};
	} catch (t) {
		return o ? {
			status: "missing",
			formula: e,
			used: i,
			missing: { dice: o }
		} : {
			status: "error",
			formula: e,
			error: t instanceof Error ? t.message : String(t)
		};
	} finally {
		a.RollerUtil._randomise = r;
	}
}
// src/library/table-roll.ts
var bt = "#\\$prompt_number:?([^$]*)\\$#", A = (e, t) => {
	let n = Number(e);
	return e !== void 0 && e !== "" && Number.isFinite(n) ? n : t;
};
function xt(e, t = bt) {
	return [...e.matchAll(new RegExp(t, "g"))].map((e) => {
		let t = {};
		for (let n of (e[1] ?? "").split(",").map((e) => e.trim()).filter(Boolean)) {
			let [e, r] = n.split("=").map((e) => e.trim());
			t[e] = r;
		}
		return {
			raw: e[0],
			title: t.title ?? null,
			default: A(t.default, 0),
			min: A(t.min, 0),
			max: t.max === void 0 || A(t.max, Infinity) === Infinity ? null : A(t.max, 0)
		};
	});
}
function St(e, t, n = bt) {
	let r = xt(e, n);
	if (t.length !== r.length) throw Error(`要填 ${r.length} 个数，给了 ${t.length} 个`);
	r.forEach((e, n) => {
		let r = t[n];
		if (!Number.isFinite(r)) throw Error(`第 ${n + 1} 个数不是数字`);
		if (r < e.min || e.max !== null && r > e.max) throw Error(`${e.title ?? `第 ${n + 1} 个数`}要在 ${e.min}～${e.max ?? "不限"} 之间`);
	});
	let i = 0;
	return e.replace(new RegExp(n, "g"), () => String(t[i++]));
}
function Ct(e) {
	return e.split(";").map((e) => e.trim()).filter(Boolean);
}
function wt(e, t) {
	let n = e.findIndex((e) => {
		if (!e) return !1;
		let n = e.pad && t === 100 ? 0 : t;
		return e.exact == null ? e.min != null && e.max != null && e.min <= n && n <= e.max : e.exact === n;
	});
	return n >= 0 ? n : null;
}
// src/library/runtime/frame/table-roll-commands.ts
var Tt = (e) => e?.type === "row" ? e.row : e;
function Et(e, t) {
	let n = e.rows ?? [];
	return n.map((e, r) => {
		let i = Tt(e);
		return Array.isArray(i) ? a.Renderer.getRollableRow(i, {
			isForceInfiniteResults: t === a.RollerUtil.ROLL_COL_VARIABLE,
			isFirstRow: r === 0,
			isLastRow: r === n.length - 1
		})?.[0]?.roll ?? null : null;
	});
}
async function Dt(e, t) {
	await c();
	let n = a.Renderer.table.getAutoConvertedRollMode(e);
	return n ? {
		rollable: !0,
		mode: n,
		index: wt(Et(e, n), t)
	} : {
		rollable: !1,
		mode: n,
		index: null
	};
}
function Ot(e) {
	let t = a.Renderer.table.getHeaderRowMetas(e)?.at(-1)?.[0];
	if (typeof t != "string") return null;
	let n = a.RollerUtil.getFullRollCol(t), r = /^\{@dice (?<inner>.*)\}$/s.exec(n);
	return r?.groups ? a.Renderer.utils.getTagEntry("@dice", r.groups.inner)?.toRoll ?? null : null;
}
function j(e, t = []) {
	return typeof e == "string" ? t.push(e) : Array.isArray(e) ? e.forEach((e) => j(e, t)) : e && typeof e == "object" && Object.values(e).forEach((e) => j(e, t)), t;
}
function kt(e) {
	let t = [];
	for (let n of j(e)) for (let e of n.matchAll(/\{@(\w+) ([^}]*)\}/g)) try {
		let n = a.Renderer.utils.getTagEntry(`@${e[1]}`, e[2]);
		typeof n?.toRoll == "string" && !/#\$prompt/.test(n.toRoll) && t.push({
			tag: `@${e[1]}`,
			text: e[2],
			formula: n.toRoll
		});
	} catch {}
	return t;
}
var At = (e) => e.replace(/<[^>]+>/g, "");
async function jt(e, t = {}) {
	await c();
	let n = a.Renderer.table.getAutoConvertedRollMode(e);
	if (!n) return { status: "not-rollable" };
	let r = Ot(e);
	if (!r) return { status: "not-rollable" };
	let i = a.Renderer.dice.RE_PROMPT.source, o = Ct(r).map((e) => ({
		formula: e,
		prompts: xt(e, i)
	}));
	if (o.length > 1 && t.formulaIndex === void 0) return {
		status: "choose",
		options: o
	};
	let s = o[t.formulaIndex ?? 0];
	if (!s) return {
		status: "error",
		error: `没有第 ${t.formulaIndex} 种骰式`
	};
	let l = s.formula;
	if (s.prompts.length) {
		if (!t.promptValues) return {
			status: "needs-input",
			formula: l,
			prompts: s.prompts
		};
		try {
			l = St(l, t.promptValues, i);
		} catch (e) {
			return {
				status: "error",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	let u = Et(e, n), d = !!e.isNameGenerator, f = a.Renderer.table.getHeaderRowMetas(e), p = d ? (f?.at(-1)?.length ?? 1) - 1 : 1, m = t.points ? [...t.points] : void 0, h = async (e) => {
		let t = await yt(e, m);
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
		let r = wt(u, n.total), i = r === null ? [] : Tt((e.rows ?? [])[r]).slice(1);
		g.push({
			label: d ? At(String(f.at(-1)[t + 1] ?? "")) : null,
			formula: l,
			total: n.total,
			used: n.used,
			detail: n.text,
			rowIndex: r,
			cells: d ? [i[t]].filter((e) => e !== void 0) : i
		});
	}
	let _ = [];
	for (let e of g) for (let t of kt(e.cells)) {
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
var Mt = {
	monster: "monster",
	object: "object",
	vehicle: "vehicle"
};
async function Nt(e, n) {
	await c();
	let r = Mt[e];
	if (!r || !a.Renderer[r]?.getTokenUrl || !a.Renderer.generic.hasToken(n)) return null;
	let i = a.Renderer[r].getTokenUrl(n);
	return i ? /^https?:/.test(i) ? i : t(i) : null;
}
// src/library/runtime/frame/table-extract-commands.ts
async function Pt() {
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
async function Ft(e, t, n = null) {
	await c();
	let { UtilGenTables: r, RecursiveSearchStateGeneric: i } = await Pt(), o = t ?? await a.DataLoader.pCacheAndGetAllSite(e) ?? [], s = [], l = [];
	for (let t of o) {
		let a = u(e, t);
		if (a) try {
			let o = new i({ isRequireIncludes: !1 }), c = t.source ?? n, u = {
				metaType: e,
				name: t.name,
				source: c,
				className: t.className ?? t.name,
				classSource: t.classSource ?? t.source,
				subclassName: t.name,
				subclassShortName: t.shortName,
				subclassSource: t.source ?? t.classSource
			};
			for (let [e, n] of Object.entries(t)) if (Array.isArray(n) && !e.startsWith("_")) try {
				for (let e of n) r._doSearch({
					state: o,
					tmpMeta: u,
					section: t.name,
					entry: e
				});
			} catch (n) {
				l.push({
					name: `${t.name ?? a}.${e}`,
					error: n instanceof Error ? n.message : String(n)
				});
			}
			if (!o._tables.length) continue;
			let d = o._tables;
			o.getStacks().table.forEach((e, r) => s.push({
				parentHash: a,
				parentName: String(t.name ?? ""),
				parentSource: f(t) ?? n,
				table: e,
				path: d[r]?.path ?? [],
				sectionIndex: d[r]?.sectionIndex ?? null
			}));
		} catch (e) {
			l.push({
				name: String(t.name ?? a),
				error: e instanceof Error ? e.message : String(e)
			});
		}
	}
	return {
		tables: s,
		skipped: l
	};
}
// src/library/runtime/frame/entry-types-commands.ts
var M = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function It(e, t, n) {
	let r = await (await fetch(new URL(`js/${e}`, location.href))).text(), i = [];
	for (let e of r.matchAll(/import\s*\{\s*(\w+)\s*\}\s*from\s*["']\.\/([\w/.-]+\.js)["']/g)) e[2].startsWith(`${t}/`) && n.test(e[1]) && i.push({
		cls: e[1],
		file: e[2]
	});
	return i;
}
var N = null;
function P() {
	return N ??= (async () => {
		await c();
		let [{ TagCondition: e, TaggerUtils: t }, { TagJsons: n }, { AcConvert: r, AttachedItemTag: i, MiscTag: o, SpellcastingTraitConvert: s }, { ConverterItem: l }, { RaceTraitTag: u }, { InstrumentBaseItemTag: d }] = await Promise.all([
			M("converter/converterutils-tags.js"),
			M("converter/converterutils-entries.js"),
			M("converter/converterutils-creature.js"),
			M("converter/converter-item.js"),
			M("converter/converterutils-race.js"),
			M("converter/converterutils-item.js")
		]), [f, p, m, h, g, _] = await Promise.all([
			a.DataUtil.spell.pLoadAll(),
			a.Renderer.item.pBuildList(),
			a.DataUtil.item.loadRawJSON(),
			a.DataUtil.legendaryGroup.pLoadAll(),
			a.DataUtil.class.loadJSON(),
			a.BrewUtil2.pGetBrewProcessed()
		]), v = p.filter((e) => !e._isItemGroup);
		s.init(f), l.init(v, g), r.init(v), t.init({
			legendaryGroups: h,
			spells: f
		}), await n.pInit({ spells: f }), u.init({ itemsRaw: m }), o.init({ items: p }), i.init({ items: p }), await e.pInit({ conditionsBrew: _.condition }), d.init({ items: v });
	})(), N.catch(() => {
		N = null;
	}), N;
}
var F = null;
function I() {
	return F ??= (async () => {
		await c();
		let e = await a.DataUtil.loadJSON(`${a.Renderer.get().baseUrl}data/converter.json`).catch(() => ({ converterSample: [] })), t = { saveSettingsDebounced: () => void 0 }, n = [];
		for (let { cls: r, file: i } of await It("converter.js", "converter", /.ConverterUi$/)) {
			let a = (await M(i))[r];
			typeof a == "function" && n.push(new a({
				ui: t,
				converterData: e
			}));
		}
		return n;
	})(), F.catch(() => {
		F = null;
	}), F;
}
var L = (e, t) => {
	try {
		return e._getSample(t) ?? null;
	} catch {
		return null;
	}
};
async function R() {
	return (await I()).map((e) => ({
		id: e.converterId,
		prop: e.prop ?? null,
		modes: [...e._modes],
		canSave: !!e.canSaveLocal,
		samples: e._modes.filter((t) => !!L(e, t))
	}));
}
async function Lt(e, t, n) {
	let r = (await I()).find((t) => t.converterId === e);
	return r ? (n && (r._state.styleHint = n), L(r, t)) : null;
}
async function Rt(e, t, n, r) {
	let i = (await I()).find((t) => t.converterId === e);
	if (!i) throw Error(`作者没有这个转换器：${e}`);
	if (!i._modes.includes(t)) throw Error(`作者的 ${e} 转换器不支持这种格式：${t}（支持 ${i._modes.join("、")}）`);
	await P(), Object.assign(i._state, {
		mode: t,
		...r.styleHint ? { styleHint: r.styleHint } : {}
	}), "source" in i._state && (i._state.source = r.source), "page" in i._state && (i._state.page = r.page ?? 0);
	let a = [], o = [];
	return i.handleParse(n, (e) => a.push(e), (e) => o.push(String(e)), !1), {
		outputs: a,
		warnings: o
	};
}
var z = null;
function zt() {
	return z ??= (async () => {
		await c();
		let e = [];
		for (let { cls: t, file: n } of await It("makebrew.js", "makebrew", /(?<!Base)Builder$/)) {
			let r = (await M(n))[t];
			if (typeof r != "function") continue;
			let i = new r()._prop;
			typeof i == "string" && e.push({
				prop: i,
				proto: r.prototype
			});
		}
		return e;
	})(), z.catch(() => {
		z = null;
	}), z;
}
async function Bt(e) {
	let t = (await zt()).find((t) => t.prop === e);
	return t ? t.proto._getInitialState.call(Object.create(t.proto)) : null;
}
async function B() {
	return await c(), Object.values(a.UrlUtil._PAGE_TO_PROPS_CORPUS ?? {}).map((e) => ({
		head: String(e.propHead),
		body: String(e.propBody)
	}));
}
async function Vt() {
	await c();
	let e = a.UrlUtil, t = await B(), n = new Set(t.map((e) => e.body)), r = /* @__PURE__ */ new Map();
	for (let [t, n] of Object.entries(e.PAGE_TO_PROPS ?? {})) for (let e of n) r.has(e) || r.set(e, t);
	let i = new Set((await zt()).map((e) => e.prop)), o = await R(), s = (e) => {
		let t = a.DataUtil?.[e]?._PAGE;
		return typeof t == "string" && t.endsWith(".html") ? t : void 0;
	};
	return Object.keys(e.URL_TO_HASH_BUILDER ?? {}).filter((e) => !n.has(e)).map((t) => {
		let n = r.get(t) ?? s(t);
		return {
			prop: t,
			name: String(a.Parser.getPropDisplayName(t)),
			group: n ? {
				page: n,
				name: String(e.PG_TO_NAME?.[n] ?? n)
			} : null,
			builder: i.has(t),
			converters: o.filter((e) => e.prop === t).map((e) => e.id)
		};
	});
}
async function Ht(e) {
	await c();
	let t = a.UrlUtil, n = a.DataUtil, r = Object.entries(t.PAGE_TO_PROPS ?? {}).find(([, t]) => t.includes(e))?.[0];
	for (let i of [e, ...r ? t.PAGE_TO_PROPS[r] : []]) {
		let t = n?.[i];
		if (typeof t?.loadRawJSON == "function") try {
			let n = await t.loadRawJSON();
			if (Array.isArray(n?.[e])) return n[e];
		} catch (e) {
			console.debug(`[trpg-assistant] 作者 ${i} 原文件没读到`, e);
		}
	}
	return null;
}
// src/library/runtime/frame/auto-field-commands.ts
var Ut = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
), Wt = async (e) => (await fetch(new URL(`js/${e}`, location.href))).text();
async function V(e) {
	let t = e.slice(0, e.lastIndexOf("/") + 1), n = /* @__PURE__ */ new Map();
	for (let r of (await Wt(e)).matchAll(/import\s*\{([^}]+)\}\s*from\s*["']\.\/([\w./-]+\.js)["']/g)) for (let e of r[1].split(",").map((e) => e.trim().split(/\s+as\s+/).pop()).filter(Boolean)) n.set(e, `${t}${r[2]}`);
	return n;
}
async function H(e) {
	let t = (await I()).find((t) => t.prop === e);
	if (!t) return [];
	let n = /(Converter\w+)\.doParse/.exec(String(t.constructor))?.[1], r = [...await V("converter.js")].find(([e]) => e === t.constructor.name)?.[1];
	if (!n || !r) return [];
	let i = (await V(r)).get(n);
	if (!i) return [];
	let a = (await Ut(i))[n], o = await V(i), s = Object.getOwnPropertyNames(a).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(a))).filter((e) => /^_do\w*PostProcess$/.test(e) && typeof a[e] == "function"), c = /* @__PURE__ */ new Set(), l = [], u = async (e) => {
		if (c.has(e) || typeof a[e] != "function") return;
		c.add(e);
		let t = String(a[e]);
		for (let e of t.matchAll(/\b(Tag\w*|[A-Z]\w*(?:Tag|Tagger|Tags))\.(try\w+)\(|\bthis\.(_\w+)\(/g)) {
			if (e[3]) {
				await u(e[3]);
				continue;
			}
			let t = o.get(e[1]);
			if (!t || !/converterutils/.test(t)) continue;
			let n = (await Ut(t))[e[1]], r = `${e[1]}.${e[2]}`;
			typeof n?.[e[2]] == "function" && !l.some((e) => e.label === r) && l.push({
				cls: n,
				method: e[2],
				label: r
			});
		}
	};
	for (let e of s) await u(e);
	return l;
}
var U = () => void 0, Gt = (e, t) => {
	let n = (e) => Array.isArray(e) && e.every((e) => typeof e != "object" || !e);
	return n(e) && n(t) ? r([...e].map(String).sort()) === r([...t].map(String).sort()) : r(e) === r(t);
};
async function Kt(e, t, n, r) {
	await c();
	let i = await H(e);
	if (!i.length) return {
		calls: [],
		fields: {}
	};
	await P();
	let a = {
		cbWarning: U,
		cbMan: U,
		styleHint: r,
		isTagInflicted: !0
	}, o = {};
	for (let e of t) for (let t of n) {
		if (e[t] === void 0) continue;
		let n = structuredClone(e);
		delete n[t];
		for (let e of i) try {
			e.cls[e.method](n, a);
		} catch (t) {
			console.debug(`[trpg-assistant] 打标签 ${e.label} 没跑通`, t);
		}
		let r = o[t] ??= {
			tried: 0,
			back: 0
		};
		r.tried++, n[t] !== void 0 && Gt(n[t], e[t]) && r.back++;
	}
	return {
		calls: i.map((e) => e.label),
		fields: o
	};
}
async function qt(e, t, n, r) {
	await c();
	let i = await H(e);
	if (!i.length || !n.length) return {};
	await P();
	let a = structuredClone(t);
	for (let e of n) delete a[e];
	let o = {
		cbWarning: U,
		cbMan: U,
		styleHint: r,
		isTagInflicted: !0
	};
	for (let e of i) try {
		e.cls[e.method](a, o);
	} catch (t) {
		console.debug(`[trpg-assistant] 打标签 ${e.label} 没跑通`, t);
	}
	return Object.fromEntries(n.map((e) => [e, a[e] ?? null]));
}
// src/library/runtime/frame/pack-commands.ts
var W = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
), G = (e, t) => String(e ?? "").toLowerCase() === t.toLowerCase();
async function K(e) {
	await c();
	let t = (await a.BrewUtil2.pGetBrew()).find((t) => t.head.docIdLocal === e);
	if (!t) throw Error(`作者存储里没有这个包：${e}`);
	return a.MiscUtil.copyFast(t);
}
async function Jt(e, t, n) {
	let r = ((await K(e)).body?.[t] ?? []).find((e) => n.uniqueId && e?.uniqueId === n.uniqueId || n.hash && u(t, e) === n.hash || n.id && String(e?.id ?? "").toLowerCase() === n.id.toLowerCase());
	return r ? {
		entity: {
			...r,
			uniqueId: r.uniqueId ?? a.CryptUtil.uid()
		},
		hash: u(t, r),
		hadId: !!r.uniqueId
	} : null;
}
async function Yt(e, t, n, r = {}) {
	let i = await K(e), o = i.body[t] ??= [], s = n.uniqueId ? o.findIndex((e) => e?.uniqueId === n.uniqueId) : -1;
	s < 0 && r.replaceHash && (s = o.findIndex((e) => !e?.uniqueId && u(t, e) === r.replaceHash)), s < 0 && r.replaceId && (s = o.findIndex((e) => !e?.uniqueId && String(e?.id ?? "").toLowerCase() === r.replaceId.toLowerCase()));
	let c = s >= 0 ? a.MiscUtil.copyFast(o[s]) : null, l = {
		...n,
		uniqueId: n.uniqueId ?? a.CryptUtil.uid()
	};
	return s >= 0 ? o[s] = l : o.push(l), await a.BrewUtil2.pUpdateBrew(i), {
		uniqueId: l.uniqueId,
		hash: u(t, l),
		previousHash: c ? u(t, c) : null,
		previous: c ? {
			name: String(c.name ?? ""),
			source: String(c.source ?? "")
		} : null,
		previousEntity: c
	};
}
async function Xt(e, t, n, r = {}) {
	let i = await K(e), o = i.body?.[t] ?? [], s = new Set(n), c = new Set(r.hashes ?? []), l = new Set((r.ids ?? []).map((e) => e.toLowerCase())), d = (e) => s.has(e?.uniqueId) || c.size > 0 && c.has(u(t, e) ?? "") || l.size > 0 && l.has(String(e?.id ?? "").toLowerCase()), f = o.filter(d).map((e) => ({
		...a.MiscUtil.copyFast(e),
		uniqueId: e.uniqueId ?? a.CryptUtil.uid()
	}));
	return f.length ? (i.body[t] = o.filter((e) => !d(e)), await a.BrewUtil2.pUpdateBrew(i), f) : [];
}
async function Zt(e, t, n, r) {
	let i = await K(e), o = 0;
	for (let e of i.body?.[t] ?? []) {
		let t = e?._copy;
		t && G(t.name, n.name) && G(t.source, n.source) && (t.name = r.name, t.source = r.source, o++);
	}
	return o && await a.BrewUtil2.pUpdateBrew(i), o;
}
async function Qt(e, t, n) {
	let r = await K(e), i = (r.body?._meta?.sources ?? []).find((e) => G(e?.json, t));
	if (!i) throw Error(`这个包里没有来源 ${t}`);
	Object.assign(i, Object.fromEntries(Object.entries(n).filter(([, e]) => typeof e == "string" && e.trim()).map(([e, t]) => [e, t.trim()]))), r.body._meta.dateLastModified = Math.round(Date.now() / 1e3), await a.BrewUtil2.pUpdateBrew(r);
}
async function $t(e, t) {
	let { PropOrder: n } = await W("utils-proporder.js"), r = await K(e), i = { _meta: {
		...a.MiscUtil.copyFast(r.body._meta ?? {}),
		dateLastModified: Math.round(Date.now() / 1e3),
		...t ? { edition: t } : {}
	} };
	for (let [e, t] of Object.entries(r.body ?? {})) !e.startsWith("_") && Array.isArray(t) && (i[e] = t.map((t) => n.getOrdered(a.DataUtil.cleanJson(a.MiscUtil.copyFast(t)), e)));
	let o = r.body._meta?.sources?.at(-1);
	return {
		filename: r.head.filename ?? `${a.DataUtil.getCleanFilename(o?.full ?? o?.json ?? "pack")}.json`,
		body: i
	};
}
async function en(e, t, n, r) {
	let i = await K(e), o = a.DataLoader.getPropPage(t), s = a.UrlUtil.PAGE_TO_PROPS?.[o] ?? [], c, l = t;
	for (let e of /* @__PURE__ */ new Set([t, ...s])) {
		let r = (i.body?.[e] ?? []).filter((e) => u(t, e) === n);
		if (r.length > 1) throw Error("这个包内有多个相同编号，无法确认要导出哪一条");
		if (r.length === 1) {
			c = r[0], l = e;
			break;
		}
	}
	if (c ||= r, !c || !i.body?._meta?.sources?.length) throw Error("这个条目没有可导出的作者数据");
	let d = a.MiscUtil.copyFast(i.body._meta), f = c._copy?.source;
	f && d.sources.some((e) => G(e.json, f)) && r && !r._copy && (c = r, l = t);
	let p = {
		_meta: d,
		[l]: [a.DataUtil.cleanJson(a.MiscUtil.copyFast(c))]
	}, m = (await B()).find((e) => e.head === l), h = m && c.id ? i.body[m.body]?.find((e) => G(e?.id, String(c.id))) : void 0;
	return m && h && (p[m.body] = [a.DataUtil.cleanJson(a.MiscUtil.copyFast(h))]), p;
}
async function tn() {
	await c();
	let [{ DataLoaderConst: e }, { DataLoaderInternalUtil: t }] = await Promise.all([W("utils-dataloader/utils-dataloader-const.js"), W("utils-dataloader/utils-dataloader-internal-util.js")]), n = [];
	for (let r of new Set(a.DataLoader._DATA_TYPE_LOADER_LIST)) {
		let i = [...r.constructor.PROPS ?? []];
		if (!i.length) continue;
		let a = t.getCleanPage({ page: i[0] });
		try {
			await x(i[0]), await r.pGetSiteData({
				pageClean: a,
				sourceClean: e.SOURCE_SITE_ALL
			});
		} catch (e) {
			n.push({
				props: i,
				error: e instanceof Error ? e.message : String(e)
			});
		}
	}
	return {
		paths: [...a.__trpgSitePaths ?? /* @__PURE__ */ new Set()].filter((e) => e.startsWith("data/")).sort(),
		failed: n
	};
}
async function nn(e, t) {
	let n = await K(e), r = n.body._meta.dependencies ??= {}, i = !1;
	for (let [e, n] of Object.entries(t)) {
		let t = r[e] ?? [], a = [.../* @__PURE__ */ new Set([...t, ...n])];
		a.length !== t.length && (r[e] = a, i = !0);
	}
	i && await a.BrewUtil2.pUpdateBrew(n);
}
async function rn(e) {
	await c();
	let t = new Set(Object.keys(a.Parser.SOURCE_JSON_TO_FULL ?? {}).map((e) => e.toLowerCase()));
	return e.filter((e) => t.has(e.toLowerCase()));
}
async function an(e) {
	await c();
	let t = a.MiscUtil.copyFast(await a.BrewUtil2.pGetOrCreateEditableBrewDoc()), n = (t.body._meta?.sources ?? []).find((t) => G(t?.json, e));
	if (!n) throw Error(`可编辑自制里没有来源 ${e}`);
	let r = Math.round(Date.now() / 1e3), i = { _meta: {
		sources: [n],
		dateAdded: r,
		dateLastModified: r
	} }, o = {}, s = /* @__PURE__ */ new Set(), l = [];
	for (let [n, r] of Object.entries(t.body)) {
		if (n.startsWith("_") || !Array.isArray(r)) continue;
		let a = r.filter((t) => G(t?.source, e));
		if (a.length) {
			i[n] = a, t.body[n] = r.filter((t) => !G(t?.source, e));
			for (let t of a) {
				t.uniqueId && l.push(t.uniqueId);
				let r = t?._copy?.source;
				typeof r == "string" && (G(r, e) ? s.add(n) : (o[n] ??= /* @__PURE__ */ new Set()).add(r));
			}
		}
	}
	return Object.keys(o).length && (i._meta.dependencies = Object.fromEntries(Object.entries(o).map(([e, t]) => [e, [...t]]))), s.size && (i._meta.internalCopies = [...s]), t.body._meta.sources = t.body._meta.sources.filter((e) => e !== n), await a.BrewUtil2.pSetEditableBrewDoc(t), {
		body: i,
		uniqueIds: l
	};
}
async function on(e, t) {
	let n = await K(e), r = new Set(t), i = (n.body._meta?.sources ?? []).map((e) => String(e?.json ?? "").toLowerCase()), o = new Set(n.body._meta?.internalCopies ?? []), s = 0;
	for (let [e, t] of Object.entries(n.body)) {
		if (e.startsWith("_") || !Array.isArray(t)) continue;
		let a = t.filter((e) => !r.has(JSON.stringify(e)));
		s += t.length - a.length, n.body[e] = a, a.some((e) => typeof e?._copy?.source == "string" && i.includes(e._copy.source.toLowerCase())) && o.add(e);
	}
	return o.size && (n.body._meta.internalCopies = [...o]), await a.BrewUtil2.pUpdateBrew(n), {
		removed: s,
		internalCopies: [...o]
	};
}
// src/library/runtime/frame/child-commands.ts
var sn = (e) => e.charAt(0).toUpperCase() + e.slice(1), q = (e) => String(e ?? "").toLowerCase(), cn = (e, t) => t.endsWith("ShortName") ? e.shortName ?? e.name : e.name;
function J(e, t) {
	let n = [`${t}ShortName`, `${t}Name`].find((t) => e?.[t] !== void 0);
	return n && e?.[`${t}Source`] !== void 0 ? {
		name: n,
		source: `${t}Source`
	} : null;
}
var ln = (e, t, n) => {
	let r = J(e, t);
	return !!r && q(e[r.name]) === q(cn(n, r.name)) && q(e[r.source]) === q(n.source);
};
async function un(e, t, n, r) {
	let i = await K(e), a = {};
	for (let e of r) a[e] = (i.body?.[e] ?? []).filter((e) => ln(e, t, n)).map((t) => ({
		name: String(t.name ?? ""),
		hash: u(e, t),
		uniqueId: t.uniqueId ?? null,
		level: typeof t.level == "number" ? t.level : null
	})).sort((e, t) => (e.level ?? 0) - (t.level ?? 0) || e.name.localeCompare(t.name));
	return a;
}
function dn(e) {
	let t = `packUid${sn(e)}`, n = Object.values(a.DataUtil).find((e) => typeof e?.[t] == "function");
	return n ? (e) => n[t](e, { isMaintainCase: !0 }) : null;
}
async function fn(e, t, n, r) {
	await c();
	let i = dn(t), o = r ?? n;
	if (!i || !o) return null;
	let s = await K(e), l = `${t}s`, u = Object.keys(s.body ?? {}).filter((e) => J(o, e)).map((e) => ({
		q: e,
		ent: (s.body[e] ?? []).find((t) => ln(o, e, t))
	})).filter((e) => e.ent), d = u.find((e) => !u.some((t) => t !== e && J(t.ent, e.q)));
	if (d) {
		let e = d.q, o = d.ent, c = (e) => q(typeof e == "string" ? e : e?.[t]), u = n ? q(i(n)) : null, f = (o[l] ?? []).filter((e) => c(e) !== u);
		return r && !f.some((e) => c(e) === q(i(r))) && f.push(i(r)), o[l] = f, await a.BrewUtil2.pUpdateBrew(s), {
			parentProp: e,
			field: l
		};
	}
	return null;
}
// src/library/runtime/frame/copy-flatten-commands.ts
var Y = (e) => String(e ?? "").toLowerCase();
async function pn(e, t, { officialOnly: n = !1, includedSources: r = [] } = {}) {
	await c();
	let i = new Set(t.map(Y)), o = a.MiscUtil.copyFast(e), s = 0, l = /* @__PURE__ */ new Map(), u = [];
	for (let [e, t] of Object.entries(o)) if (!e.startsWith("_") && Array.isArray(t)) for (let r = 0; r < t.length; r++) {
		let o = t[r], c = o?._copy?.source;
		if (!(typeof c != "string" || i.has(Y(c)) || n && !a.SourceUtil.isSiteSource(c))) try {
			let n = await a.DataUtil.pDoMetaMergeSingle(e, { dependencies: { [e]: [c] } }, a.MiscUtil.copyFast(o));
			if (!n || n._copy) throw Error("作者没有拼出完整的一条");
			t[r] = a.DataUtil.cleanJson(n, { isDeleteUniqueId: !1 }), s++;
			let i = l.get(e) ?? /* @__PURE__ */ new Set();
			i.add(Y(c)), l.set(e, i);
		} catch (t) {
			u.push({
				prop: e,
				name: String(o?.name ?? ""),
				reason: t instanceof Error ? t.message : String(t)
			});
		}
	}
	let d = o._meta?.dependencies;
	if (d) {
		let e = new Set([...r, ...Object.values(o._meta?.includes ?? {}).flat()].map(Y));
		for (let [t, r] of Object.entries(d)) {
			let i = r.filter((r) => n && (!l.get(t)?.has(Y(r)) || e.has(Y(r))) || (o[t] ?? []).some((e) => Y(e?._copy?.source) === Y(r)));
			i.length ? d[t] = i : delete d[t];
		}
		Object.keys(d).length || delete o._meta.dependencies;
	}
	return {
		json: o,
		flattened: s,
		failed: u
	};
}
async function mn(e) {
	let t = await K(e), n = (t.body._meta?.sources ?? []).map((e) => String(e?.json ?? "")), r = await pn(t.body, n);
	return r.flattened && (t.body = r.json, await a.BrewUtil2.pUpdateBrew(t)), {
		flattened: r.flattened,
		failed: r.failed
	};
}
async function hn(e, t) {
	await c();
	let n = t?._copy?.source;
	if (typeof n != "string") return a.DataUtil.cleanJson(a.MiscUtil.copyFast(t));
	let r = await a.DataUtil.pDoMetaMergeSingle(e, { dependencies: { [e]: [n] } }, a.MiscUtil.copyFast(t));
	if (!r || r._copy) throw Error("作者没有拼出完整的一条（原件找不到）");
	return a.DataUtil.cleanJson(r);
}
// src/library/runtime/frame/field-value-commands.ts
var X = /[㐀-鿿]/, Z = null;
function gn() {
	if (Z) return Z;
	Z = [];
	for (let [e, t] of Object.entries(a.Parser)) {
		if (!t || typeof t != "object" || Array.isArray(t)) continue;
		let n = Object.entries(t);
		n.length < 2 || !n.every(([, e]) => typeof e == "string") || Z.push({
			name: e,
			map: t
		});
	}
	let e = a.SourceUtil?.ADV_BOOK_GROUPS;
	return Array.isArray(e) && Z.push({
		name: "SourceUtil.ADV_BOOK_GROUPS",
		map: Object.fromEntries(e.filter((e) => typeof e.group == "string" && typeof e.displayName == "string").map((e) => [e.group, e.displayName]))
	}), Z;
}
function _n() {
	return Object.entries(a.Parser).filter(([e, t]) => /ToCn$/.test(e) && typeof t == "function").map(([e, t]) => ({
		name: e,
		fn: t
	}));
}
function vn(e) {
	let t = _n().flatMap(({ name: t, fn: n }) => {
		try {
			let r = e.map((e) => [e, n(e)]);
			if (!r.every(([, e]) => typeof e == "string" && e && e !== void 0)) return [];
			let i = r.map(([, e]) => String(e));
			return i.some((t, n) => t !== e[n] && X.test(t)) ? [{
				name: t,
				labels: i
			}] : [];
		} catch {
			return [];
		}
	});
	t.sort((e, t) => t.labels.filter((e) => X.test(e)).length - e.labels.filter((e) => X.test(e)).length || e.name.localeCompare(t.name));
	let n = t[0];
	return n ? Object.fromEntries(e.map((e, t) => [e, n.labels[t]])) : null;
}
async function yn(e, t) {
	if (await c(), t === "category") {
		let t = new Map(Object.entries(a.Parser.CAT_ID_TO_PROP).map(([e, t]) => [t, e]));
		return e.map((e) => Object.fromEntries(e.map((e) => {
			let n = t.get(e);
			return [e, a.Parser.PROP_TO_DISPLAY_NAME[e] ?? (n ? a.Parser.pageCategoryToFull(Number(n)) : a.Parser.getPropDisplayName(e))];
		})));
	}
	let n = gn();
	return e.map((e) => {
		if (!e.length) return null;
		let t = n.filter(({ map: t }) => e.every((e) => e in t));
		if (!t.length) return vn(e);
		t.sort((e, t) => Number(Object.values(t.map).some((e) => X.test(e))) - Number(Object.values(e.map).some((e) => X.test(e))) || Object.keys(e.map).length - Object.keys(t.map).length);
		let r = t[0].map;
		return Object.fromEntries(e.map((e) => [e, r[e]]));
	});
}
async function bn(e) {
	return await c(), e.map((e) => {
		let t = e.reduce((e, t) => e && (typeof e == "object" || typeof e == "function") ? e[t] : void 0, a);
		return typeof t == "string" ? t : null;
	});
}
async function xn(e) {
	return await c(), e.map((e) => {
		let t = Array.isArray(e) ? a.Renderer.utils.prerequisite.getText(e, { isSkipPrefix: !0 }) : null;
		return typeof t == "string" && t.trim() ? t.trim() : null;
	});
}
async function Sn(e) {
	await c();
	let t = /* @__PURE__ */ new Map(), n = {
		author: async (e) => (await bn([e.path]))[0] ?? null,
		requirement: async (e) => (await xn([e.raw]))[0] ?? null,
		render: async (e) => await fe(e.text) || null,
		proficiency: async (e) => a.Renderer.generic.getMappedAnyProficiency({
			keyAny: e.key,
			countRaw: e.count
		})?.name ?? null,
		value: async (e) => {
			let n = JSON.stringify([e.group, e.kind]);
			return t.has(n) || t.set(n, yn([e.group], e.kind).then((e) => e[0])), (await t.get(n))?.[e.key] ?? null;
		}
	}, r = (e) => n[e.source](e);
	return Promise.all(e.map((e) => r(e)));
}
// src/library/runtime/frame/markdown-commands.ts
var Cn = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function wn(e) {
	await c();
	let t = a.RendererMarkdown.get();
	return t._renderString = (e, t) => {
		t[0] += e;
	}, String(t.render({ entries: a.MiscUtil.copyFast(e) }) ?? "").trim();
}
async function Tn(e) {
	await c();
	let t = a.MarkdownConverter.getEntries(e), { DiceConvert: n } = await Cn("converter/converterutils-tags.js");
	return t.map((e) => n.getTaggedEntry(e));
}
var Q = (e) => Array.isArray(e) ? e.map(Q) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).sort().map((t) => [t, Q(e[t])])) : e, En = (e, t) => JSON.stringify(Q(e)) === JSON.stringify(Q(t));
function Dn(e, t) {
	if (!e || !t || typeof e != "object" || typeof t != "object" || Array.isArray(e) || Array.isArray(t)) return e;
	let n = e, r = t;
	if (n.type !== r.type) return e;
	let i = { ...n };
	for (let [e, t] of Object.entries(r)) e in i || (i[e] = t);
	return i;
}
async function On(e) {
	let t = await wn([e]);
	try {
		let n = a.MarkdownConverter.getEntries(t);
		return n.length === 1 && En(Dn(n[0], e), e) ? t : null;
	} catch (e) {
		return console.debug("[trpg-assistant] 这一段转不回来，留给 JSON", e), null;
	}
}
async function kn(e, t) {
	let n = await Tn(e);
	return n.length === 1 && t !== void 0 ? [Dn(n[0], t)] : n;
}
// src/library/runtime/frame/commands.ts
async function An() {
	let e = /* @__PURE__ */ new Set(), t = [];
	for (let n of a.DataLoader._DATA_TYPE_LOADER_LIST) {
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
async function jn(e) {
	await c();
	let t = await a.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => u(e, t)),
		sources: t.map((e) => f(e))
	};
}
async function Mn(e, t, n) {
	return await c(), ((await a.DataUtil.loadJSON(`data/${e}`))[t] ?? []).map((e) => ({
		id: e.id,
		source: a.SourceUtil.getEntitySource(e),
		hash: a.UrlUtil.URL_TO_HASH_BUILDER[n](e),
		...typeof e.name == "string" ? { name: e.name } : {}
	}));
}
async function Nn(e, t, n) {
	return await c(), a.DataLoader.pCacheAndGet(e, t, n, { isRequired: !0 });
}
async function Pn(e) {
	await c();
	let t = e ? new Set(e.map((e) => e.toUpperCase())) : null, n = {};
	for (let e of ["search/index.json", "search/index-item.json"]) {
		let r = a.Omnidexer.decompressIndex(await a.DataUtil.loadRawJSON(e));
		for (let e of r) {
			if (t && e.s && !t.has(String(e.s).toUpperCase())) continue;
			let r = a.Parser.CAT_ID_TO_PROP[e.c] ?? `cat:${e.c}`;
			(n[r] ??= []).push(e.u);
		}
	}
	return n;
}
async function Fn(e, t) {
	await c();
	let n = a.ExcludeUtil.getList().filter((t) => t.hash !== "*" || t.category !== "*" || String(t.source).toLowerCase() !== e.toLowerCase()), r = t ? [...n, {
		displayName: e,
		hash: "*",
		category: "*",
		source: e,
		isAuto: !1
	}] : n;
	return await a.ExcludeUtil.pSetList(r), await a.ExcludeUtil._pSave(), a.ExcludeUtil.getList();
}
async function In(e, t, n) {
	return await c(), a.ExcludeUtil.isExcluded(e, t, n, { isNoCount: !0 });
}
async function Ln(e, t) {
	return await c(), t.map((t) => u(e, t));
}
async function Rn() {
	return [...a.__trpgFrameErrors];
}
async function zn() {
	let e = a.__trpgStorageFlush;
	return e ? e() : [];
}
var Bn = {
	frameErrors: Rn,
	init: c,
	loaders: An,
	parseProp: jn,
	corpusList: Mn,
	parseCorpus: Nn,
	searchIndexHashes: Pn,
	setSourceExcluded: Fn,
	isExcluded: In,
	excludedFlags: xe,
	detail: Se,
	search: Ce,
	searchIndexDump: Ee,
	searchIndexLoad: De,
	searchSettings: Te,
	englishLocators: Ue,
	englishMatch: We,
	variantTemplateNames: Ge,
	versionOrder: Ke,
	brewCatalog: Oe,
	brewInstalled: ke,
	brewStorage: Ae,
	brewAddUrl: je,
	brewAddSources: Pe,
	brewAddFiles: Fe,
	brewDelete: Ie,
	brewPull: Le,
	brewCheckUpdates: ze,
	brewCorpusList: Re,
	brewPackRows: He,
	parseBrewProp: Be,
	rawHashes: Ln,
	storageFlush: zn,
	editionOf: D,
	sourceNames: Je,
	corpusFile: O,
	brewDocIndex: Xe,
	brewItemsByHash: Qe,
	brewRaw: Ze,
	brewExport: $e,
	fluffOf: et,
	fluffOfMany: tt,
	excludeList: nt,
	editableDoc: k,
	editableEnsureSource: rt,
	editablePut: it,
	editableRemove: lt,
	editableRetargetCopies: ct,
	editableAddDependencies: ut,
	cleanEntity: st,
	editableExport: ot,
	sourceTaken: at,
	converters: R,
	converterSample: Lt,
	convertText: Rt,
	entryTemplate: Bt,
	entryTypes: Vt,
	corpusPairs: B,
	rawProp: Ht,
	autoFieldProbe: Kt,
	autoTag: qt,
	packChildren: un,
	linkParent: fn,
	packEntity: Jt,
	packPut: Yt,
	packRemove: Xt,
	packRetargetCopies: Zt,
	packRenameSource: Qt,
	packExport: $t,
	packExportEntry: en,
	authorDataFiles: tn,
	packAddDependencies: nn,
	officialSourcesOf: rn,
	editableTake: an,
	packFixOldCopy: on,
	flattenCopies: pn,
	packFlattenCopies: mn,
	mergeOne: hn,
	valueLabels: yn,
	authorAt: bn,
	authorTexts: Sn,
	prerequisiteText: xn,
	blockMarkdown: On,
	markdownBlocks: kn,
	diceTag: gt,
	diceStats: _t,
	diceRead: vt,
	diceRoll: yt,
	tableRow: Dt,
	tableRoll: jt,
	tagMeta: h,
	tagRefs: g,
	brewDependencyPreview: Ne,
	brewMergeCheck: Me,
	sortColumns: _e,
	sortRanks: ye,
	listCells: be,
	authorFields: re,
	displayName: de,
	renderText: fe,
	renderContent: ee,
	renderEntity: le,
	statblockMeta: pe,
	tokenPath: Nt,
	extractTables: Ft,
	directory: pt,
	sourceFiles: ft
}, Vn = [
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
], $ = globalThis, Hn = new URLSearchParams(location.search).get("frame") ?? "";
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || !t || t.channel !== "trpg-library" || t.type !== "call") return;
	let n = (e) => parent.postMessage({
		channel: i,
		type: "result",
		frame: Hn,
		id: t.id,
		...e
	}, location.origin), r = Bn[t.fn];
	r ? r(...t.args).then((e) => n({
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
var Un = new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "", Wn = {
	channel: i,
	type: "ready",
	frame: Hn,
	codeSet: Un,
	authorVersion: typeof $.VERSION_NUMBER == "string" ? $.VERSION_NUMBER : null,
	present: Object.fromEntries(Vn.map((e) => [e, $[e] !== void 0])),
	errors: [...$.__trpgFrameErrors ?? []]
};
parent.postMessage(Wn, location.origin);
