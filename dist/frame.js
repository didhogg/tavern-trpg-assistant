import { S as e, a as t, j as n, n as r } from "./images-BZeOyqth.js";
import { t as i } from "./protocol-03CO7Rhf.js";
// src/library/runtime/frame/author.ts
var a = globalThis, o = null;
function s() {
	return o ??= (async () => {
		a.Renderer.get().setBaseUrl(""), await a.PrereleaseUtil.pInit(), await a.BrewUtil2.pInit(), await a.ExcludeUtil.pInitialise();
	})(), o;
}
function c(e, t) {
	return e ? e[t] ?? e[a.DataLoader.getPropPage(t)] ?? null : null;
}
function l(e, t) {
	let n = c(a.UrlUtil.URL_TO_HASH_BUILDER, e);
	try {
		return n ? n(t) : null;
	} catch {
		return null;
	}
}
function u(e, t) {
	let n = a.UrlUtil.URL_TO_ENG_HASH_BUILDER, r = a.DataLoader.getPropPage(e);
	return !n || !t?.ENG_name || !n[r] ? null : n[r](t);
}
function d(e) {
	return a.SourceUtil.getEntitySource(e) ?? null;
}
// src/library/runtime/frame/tag-commands.ts
function f(e) {
	let t = a.DataLoader._PROP_TO_HASH_PAGE, n = Object.entries(t).filter(([, t]) => t === e).map(([e]) => e);
	return n.length ? n : Object.keys(t).filter((t) => t.toLowerCase() === e.toLowerCase());
}
function p(e, t) {
	let n = e === "@book" ? "book.html" : "adventure.html", { displayText: r, id: i, ixChapter: o, sectionName: s, ixNamedSection: c } = a.UidUtil.unpackUidAdventureBook(t);
	return {
		tag: e,
		name: String(r ?? i ?? ""),
		displayText: String(r ?? i ?? ""),
		source: i ?? null,
		page: n,
		hash: String(i ?? "").toLowerCase(),
		props: f(n),
		part: {
			chapter: o ?? null,
			section: s ?? null,
			ixNamedSection: c ?? null
		}
	};
}
async function m(e, t) {
	await s();
	let n = e.startsWith("@") ? e : `@${e}`;
	if (n === "@book" || n === "@adventure") return p(n, t);
	let r;
	try {
		r = a.Renderer.utils.getTagMeta(n, t);
	} catch {
		return null;
	}
	if (!r) return null;
	let i = r.pageHover ?? r.page, o = r.hashHover ?? r.hash, c = r.sourceHover ?? r.source;
	return {
		tag: n,
		name: String(r.name ?? ""),
		displayText: String(r.displayText ?? r.linkText ?? r.name ?? ""),
		source: c ?? null,
		page: i,
		hash: o,
		props: f(i)
	};
}
async function h(e) {
	await s();
	let t = /* @__PURE__ */ new Map(), n = async (e, n) => {
		let r = `${e} ${n}`, i = t.get(r);
		if (!i) {
			let a = await m(e, n);
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
function g(e, t) {
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
			meta: p(r === "book.html" ? "@book" : "@adventure", [
				"",
				e,
				t,
				s,
				o
			].join("|"))
		};
	}
	let o = f(r);
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
function _(e, { tables: t = !0 } = {}) {
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
					let n = g(t, r._renderLink_getHref(t));
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
async function v(e, { tables: t = !0 } = {}) {
	await s();
	let { value: n, marker: r, links: i, tables: o } = _(() => String(a.Renderer.get().render(e)), { tables: t });
	return {
		html: n,
		marker: r,
		links: i,
		...o.length ? { tables: o } : {}
	};
}
// src/library/runtime/frame/field-commands.ts
var y = (e) => String(e ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(), ee = (e) => Array.isArray(e) ? e.map(y).filter(Boolean).join("、") : y(e), te = {
	spell: (e) => [["成分", e.components ? a.Parser.spComponentsToFull(e.components, e.level, { isPlainText: !0 }) : ""], ["持续时间", e.duration ? a.Parser.spDurationToFull(e.duration, { isPlainText: !0 }) : ""]],
	class: (e) => {
		let t = e.startingProficiencies ?? {}, n = { styleHint: e.edition ?? "classic" };
		return [
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
async function ne(e, t) {
	await s();
	let n = te[e], r = [];
	if (n) try {
		let { value: e, marker: i, links: a } = _(() => n(t), { tables: !1 });
		for (let [t, n] of e) {
			let e = Array.isArray(n) ? ee(n) : y(n), o = typeof n == "string" && n.includes(i) ? {
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
var re = {
	"bestiary.html": () => Promise.all([a.DataUtil.monster.pPreloadLegendaryGroupsSite(), a.DataUtil.monster.pUpdatePreloadLegendaryGroupsBrew()]),
	"items.html": () => a.Renderer.item.pPopulatePropertyAndTypeReference()
}, b = /* @__PURE__ */ new Map();
async function ie(e) {
	let t = re[e];
	if (!t) return;
	let n = b.get(e);
	n || (n = t().catch((t) => {
		throw b.delete(e), t;
	}), b.set(e, n)), await n;
}
async function x(e) {
	await s(), await ie(a.DataLoader.getPropPage(e) ?? "");
}
// src/library/runtime/frame/entity-render.ts
function ae(e) {
	let t = a.DataLoader.getPropPage(e);
	for (let n of [t, e]) if (n) try {
		if (a.Renderer.hover._getFnRenderCompact({
			page: n,
			isStatic: !0
		})) return a.Renderer.hover.getFnRenderCompact(n, { isStatic: !0 });
	} catch {}
	return null;
}
var oe = () => a.Renderer.hover.getFnRenderCompact("generic", { isStatic: !0 });
function se(e, t) {
	let { value: n, marker: r, links: i, tables: a } = _(() => String(e(t) ?? ""));
	if (!n.trim()) return null;
	let o = document.createElement("template");
	return o.innerHTML = `<table>${n}</table>`, o.content.querySelectorAll("th.ve-stats__th-name").forEach((e) => e.closest("tr")?.remove()), {
		html: o.innerHTML,
		marker: r,
		links: i,
		tables: a
	};
}
async function ce(e, t) {
	await s(), await x(e);
	let n = ae(e);
	if (n) try {
		return se(n, t);
	} catch (t) {
		console.warn(`[trpg-assistant] 作者的「${e}」整条渲染出错，改用通用渲染`, t);
	}
	return se(oe(), t);
}
// src/library/runtime/frame/entry-commands.ts
var le = { itemProperty: (e) => a.Renderer.itemProperty.getItemPropertyRenderableEntriesMeta(e).entryFaux.name };
async function ue(e, t) {
	await s();
	let n = le[e], r = n ? n(t) : t?.name;
	return typeof r == "string" && r ? r : null;
}
async function de(e) {
	await s();
	let t = a.Renderer.get().render(e), n = document.createElement("div");
	return n.innerHTML = t, (n.textContent ?? "").replace(/\s+/g, " ").trim();
}
async function fe(e) {
	await s();
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
var pe = (e) => ["js/filter-common.js", `js/filter-${e}.js`], me = /* @__PURE__ */ new Set();
async function he(e) {
	me.has(e) || (me.add(e), await new Promise((t) => {
		let n = document.createElement("script");
		n.src = e, n.onload = () => t(), n.onerror = () => t(), document.head.appendChild(n);
	}));
}
async function S(e) {
	await s();
	let t = String(a.DataLoader.getPropPage(e) ?? "").replace(/\.html$/, "");
	if (!t) return null;
	for (let e of pe(t)) await he(e);
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
	let t = await S(e);
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
	let r = await S(e);
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
		}, c = a.List.prototype.getSortedItems.call(r, { items: [...s] }), u = new Map(s.map((e, t) => [e, t])), d = {};
		return c.forEach((t, n) => {
			let r = l(e, o[u.get(t)]);
			r && !(r in d) && (d[r] = n);
		}), d;
	});
}
async function be(e) {
	let t = await S(e);
	if (!t) return null;
	let n = t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})), { entities: r, items: i } = await ve(t, e), a = {};
	return i.forEach((t, i) => {
		let o = l(e, r[i]);
		if (!o || o in a) return;
		let s = [...t.ele?.firstElementChild?.children ?? []].map((e) => String(e.textContent ?? "").replace(/\s+/g, " ").trim());
		a[o] = n.map((e, t) => s[s.length - n.length + t] ?? "");
	}), {
		columns: n,
		cells: a
	};
}
// src/library/runtime/frame/read-commands.ts
function C(e, t, n) {
	let r = d(t);
	return r ? a.DataLoader.getPropPage(e) === a.UrlUtil.PG_ITEMS && a.Renderer.item.isExcluded(t, { hash: n }) ? !0 : a.ExcludeUtil.isExcluded(n ?? "", t.__prop ?? e, r, { isNoCount: !0 }) : !1;
}
async function xe(e, t = "site") {
	if (await s(), !a.ExcludeUtil.getList().length) return {
		hashes: [],
		excluded: null
	};
	await x(e);
	let n = await (t === "brew" ? a.DataLoader.pCacheAndGetAllBrew(e) : a.DataLoader.pCacheAndGetAllSite(e)) ?? [], r = n.map((t) => l(e, t));
	return {
		hashes: r,
		excluded: n.map((t, n) => C(e, t, r[n]))
	};
}
async function Se(e, t, n) {
	await s(), await x(e);
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
		source: d(r),
		excluded: C(e, r, t),
		fluff: i,
		fluffError: o,
		engSiteHash: u(e, r)
	};
}
async function Ce(e, t = null) {
	await s();
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
	await s();
	let t = await we();
	for (let [n, r] of Object.entries(e)) {
		if (!(n in t._DEFAULT_STATE)) throw Error(`作者的搜索设置里没有这一项：${n}`);
		n === "partneredMode" ? t.setPartneredMode(r) : t[n] = r;
	}
	return t._getComp().toObject();
}
async function Ee() {
	await s();
	let e = a.OmnisearchBacking;
	return await e._pInit(), {
		json: JSON.stringify(e._searchIndex.toJSON()),
		maxId: e._maxId ?? null,
		categoryCounts: e._CATEGORY_COUNTS ?? {},
		adventureBookLookup: e._adventureBookLookup ?? {}
	};
}
async function De(e) {
	await s(), a.SearchUtil._initSearchIndex_getFnFold();
	let t = a.OmnisearchBacking;
	return t._searchIndex = a.elasticlunr.Index.load(JSON.parse(e.json)), t._maxId = e.maxId, t._CATEGORY_COUNTS = e.categoryCounts, t._adventureBookLookup = e.adventureBookLookup, t._pLoadSearch = Promise.resolve(), t._initReInCategory(), !0;
}
// src/library/runtime/frame/brew-commands.ts
async function w(e) {
	await s();
	let t = a.__trpgFrameErrors, n = t.length, r = await e();
	return await new Promise((e) => setTimeout(e, 50)), {
		value: r,
		errors: t.slice(n)
	};
}
var T = (e) => ({
	head: e.head,
	meta: e.body?._meta ?? null
});
function Oe() {
	return w(() => a.BrewUtil2.pGetCombinedIndexes());
}
async function ke() {
	return await s(), (await a.BrewUtil2.pGetBrew()).map(T);
}
async function Ae() {
	await s();
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
	let t = await w(() => a.BrewUtil2.pAddBrewFromUrl(e));
	return {
		...t,
		value: (t.value ?? []).map(T)
	};
}
async function Me() {
	await s();
	let e = a.BrewUtil2, t = await e._LOCK.pLock();
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
async function Ne(e) {
	return await s(), w(async () => {
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
	let t = await w(async () => {
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
			added: t.value.added.map(T),
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
	let r = await w(async () => {
		let [e, t] = n.segregate((e) => a.BrewUtil2.constructor._isPrereleaseDroppedJson(e.json)), r = [];
		return e.length && r.push(...await a.PrereleaseUtil.pAddBrewsFromFiles(e) ?? []), t.length && r.push(...await a.BrewUtil2.pAddBrewsFromFiles(t) ?? []), r;
	});
	return {
		errors: r.errors,
		value: {
			added: r.value.map(T),
			notJson: t
		}
	};
}
async function Ie(e) {
	return w(async () => {
		let t = new Set(e), n = (await a.BrewUtil2.pGetBrew()).filter((e) => t.has(e.head.docIdLocal));
		return await a.BrewUtil2.pDeleteBrews(n), n.length;
	});
}
async function Le(e = null) {
	let t = await w(async () => {
		let t = e ? (await a.BrewUtil2.pGetBrew()).filter((t) => e.includes(t.head.docIdLocal)) : null;
		return a.BrewUtil2.pPullAllBrews({ brews: t });
	});
	return {
		...t,
		value: (t.value ?? []).map(T)
	};
}
async function Re(e, t) {
	return await s(), ((await a.BrewUtil2.pGetBrewProcessed())?.[e] ?? []).map((e) => ({
		id: e.id,
		name: e.name,
		source: a.SourceUtil.getEntitySource(e),
		hash: a.UrlUtil.URL_TO_HASH_BUILDER[t](e)
	}));
}
async function ze(e = null) {
	return w(async () => {
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
	await s(), await x(e);
	let t = await a.DataLoader.pCacheAndGetAllBrew(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => l(e, t)),
		sources: t.map((e) => d(e))
	};
}
function Ve(e, t, n, r, i) {
	if (t._versionBase_hash) return r.has(t._versionBase_hash);
	if (t._isSubRace && t._subraceName) {
		let e = l("subrace", {
			name: t._subraceName,
			raceName: t._baseName,
			source: d(t)
		});
		return !!e && (i.subrace ?? []).includes(e);
	}
	if (t.genericVariant) {
		let e = l("magicvariant", t.genericVariant);
		return !!e && (i.magicvariant ?? []).includes(e);
	}
	return e === "item" && t._isItemGroup ? (i.itemGroup ?? []).includes(n) : r.has(n);
}
async function He(e) {
	await s();
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
				let r = l(n, t);
				return !r || !Ve(n, t, r, s, e) ? [] : [{
					hash: r,
					item: t,
					source: d(t),
					excluded: C(n, t, r)
				}];
			});
			c.length && (t[n] = c);
		}
	}
	return t;
}
// src/library/runtime/frame/english-commands.ts
async function Ue(e) {
	await s();
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
	await s();
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
		let i = t.locator, o = i ? a.Omnidexer.getProperty(e, i.prop) : null, s = (e) => e?.name === i.name && (i.source == null || e.source === i.source), c = o?.filter((e) => e.source === i.source && e.page === i.page) || [], u = null, f = o?.find(s);
		f ? u = "name" : (f = Object.values(e).filter(Array.isArray).flat().find(s)) ? u = "name-any-array" : (f = o?.length === i.count ? o[i.ix] : null) ? u = "position" : (f = c[i.ixSourcePage]) && (u = "source-page"), r.push({
			prop: t.prop,
			hash: t.hash,
			enHash: f ? l(i.prop, f) : null,
			enSource: f ? d(f) : null,
			via: u
		});
	}
	return r;
}
async function Ge() {
	return await s(), ((await a.DataUtil.item.loadRawJSON())?.magicvariant ?? []).map((e) => ({
		name: e.name,
		eng: e.ENG_name ?? null,
		source: e.inherits?.source ?? e.source ?? null
	}));
}
async function Ke(e) {
	await s();
	let t = {};
	for (let n of e) {
		let e = await a.DataLoader.pCacheAndGetAllSite(n) ?? [];
		for (let r of e) {
			if (!r?._versions?.length) continue;
			let e = l(n, r);
			if (!e) continue;
			let i = a.DataUtil.generic.getVersions(r);
			(t[n] ??= {})[e] = i.map((e) => l(n, e)).filter((e) => !!e);
		}
	}
	return t;
}
// src/library/runtime/frame/edit-commands.ts
var qe = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function Je(t) {
	await s();
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
async function Ye(e) {
	return await s(), Object.fromEntries(e.map((e) => [e, {
		full: a.Parser.sourceJsonToFull(e),
		abv: a.Parser.sourceJsonToAbv(e)
	}]));
}
var Xe = (e) => {
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
			hash: l(t, n)
		});
	}
	return t;
};
async function Ze() {
	return await s(), (await a.BrewUtil2.pGetBrew()).map((e, t) => ({
		docIdLocal: e.head.docIdLocal,
		filename: e.head.filename ?? null,
		url: e.head.url ?? null,
		timeAdded: e.head.timeAdded ?? 0,
		order: t,
		isEditable: !!e.head.isEditable,
		sources: (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
		props: Object.fromEntries(Object.entries(e.body ?? {}).filter(([e, t]) => !e.startsWith("_") && Array.isArray(t)).map(([e, t]) => [e, t.map((t) => t && typeof t == "object" ? l(e, t) : null)])),
		requires: Xe(e.body)
	}));
}
async function Qe(e = null) {
	await s();
	let t = await a.BrewUtil2.pGetBrew();
	return e ? t.filter((t) => e.includes(t.head.docIdLocal)) : t;
}
async function $e(e) {
	await s();
	let t = {};
	for (let { prop: n, hash: r } of e) {
		await x(n), await a.DataLoader.pCacheAndGetAllBrew(n);
		let e = await a.DataLoader.pCacheAndGetHash(n, r);
		e && ((await a.DataLoader.pCacheAndGetAllSite(n) ?? []).includes(e) || (t[`${n}|${r}`] = e));
	}
	return t;
}
async function E(e, t) {
	return await s(), `data/${e}/${e}-${a.UrlUtil.encodeForHash(t.toLowerCase())}.json`;
}
async function et(e) {
	let t = (await Qe([e]))[0];
	return t ? {
		filename: t.head.filename ?? null,
		body: t.body
	} : null;
}
async function tt(e, t) {
	await s();
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
async function nt(e, t) {
	await s();
	let n = {};
	for (let r of t) {
		let t = l(e, r);
		if (t) try {
			n[t] = {
				fluff: await a.Renderer.utils.pGetProxyFluff({
					entity: r,
					prop: e
				}) ?? null,
				fluffError: null,
				engSiteHash: u(e, r)
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
async function rt() {
	return await s(), a.ExcludeUtil.getList();
}
async function D() {
	return await s(), a.BrewUtil2.pGetOrCreateEditableBrewDoc();
}
async function it(e) {
	return ((await D()).body?._meta?.sources ?? []).some((t) => String(t.json).toLowerCase() === e.json.toLowerCase()) || await a.BrewUtil2.pAddSource({
		authors: [],
		convertedBy: [],
		version: "1",
		...e
	}), ((await D()).body?._meta?.sources ?? []).map((e) => e.json);
}
async function at(e, t) {
	await s();
	let n = t.uniqueId ? ((await a.BrewUtil2.pGetOrCreateEditableBrewDoc()).body?.[e] ?? []).find((e) => e?.uniqueId === t.uniqueId) : null, r = {
		...t,
		uniqueId: t.uniqueId ?? a.CryptUtil.uid()
	};
	return await a.BrewUtil2.pPersistEditableBrewEntity(e, r), {
		uniqueId: r.uniqueId,
		hash: l(e, r),
		previousHash: n ? l(e, n) : null,
		previous: n ? {
			name: String(n.name ?? ""),
			source: String(n.source ?? "")
		} : null,
		previousEntity: n ? a.MiscUtil.copyFast(n) : null
	};
}
async function ot(e) {
	await s();
	let t = e.toLowerCase();
	return Object.keys(a.Parser.SOURCE_JSON_TO_FULL ?? {}).some((e) => e.toLowerCase() === t) || !!a.BrewUtil2.hasSourceJson(e) || !!a.PrereleaseUtil.hasSourceJson(e);
}
async function st(e, t) {
	await s();
	let { PropOrder: n } = await qe("utils-proporder.js"), r = await D(), i = (t) => String(t ?? "").toLowerCase() === e.toLowerCase(), o = (r.body?._meta?.sources ?? []).find((e) => i(e?.json));
	if (!o) throw Error(`可编辑自制里没有来源 ${e}`);
	let c = Math.round(Date.now() / 1e3), l = { _meta: {
		sources: [a.MiscUtil.copyFast(o)],
		dateAdded: c,
		dateLastModified: c,
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
async function ct(e) {
	return await s(), a.DataUtil.cleanJson(a.MiscUtil.copyFast(e));
}
async function lt(e, t, n) {
	await s();
	let r = a.MiscUtil.copyFast(await D()), i = (e, t) => String(e ?? "").toLowerCase() === t.toLowerCase(), o = 0;
	for (let a of r.body?.[e] ?? []) {
		let e = a?._copy;
		e && i(e.name, t.name) && i(e.source, t.source) && (e.name = n.name, e.source = n.source, o++);
	}
	return o && await a.BrewUtil2.pSetEditableBrewDoc(r), o;
}
async function ut(e, t) {
	await s();
	let n = ((await a.BrewUtil2.pGetOrCreateEditableBrewDoc()).body?.[e] ?? []).filter((e) => t.includes(e?.uniqueId)).map((e) => a.MiscUtil.copyFast(e));
	return await a.BrewUtil2.pRemoveEditableBrewEntities(e, t), n;
}
async function dt(e) {
	let t = a.MiscUtil.copyFast(await D()), n = t.body._meta.dependencies ??= {};
	for (let [t, r] of Object.entries(e)) n[t] = [.../* @__PURE__ */ new Set([...n[t] ?? [], ...r])];
	return await a.BrewUtil2.pSetEditableBrewDoc(t), n;
}
// src/library/runtime/frame/directory-commands.ts
var ft = (e) => e instanceof Error ? e.message : String(e);
async function O() {
	await s();
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
	await s();
	let t = [];
	for (let n of e) try {
		let e = (await a.DataUtil.loadJSON(`data/${n.index}`))[n.prop] ?? [];
		t.push({
			prop: n.prop,
			items: e,
			files: await Promise.all(e.map((e) => E(n.prop, String(e.id)))),
			error: null
		});
	} catch (e) {
		t.push({
			prop: n.prop,
			items: [],
			files: [],
			error: ft(e).split("\n")[0]
		});
	}
	let n = [...new Set(t.flatMap((e) => e.items.map((e) => a.SourceUtil.getEntitySource(e))))], r = n.length ? await Je(n) : {}, i = {};
	for (let e of n) i[e] = {
		full: a.Parser.sourceJsonToFull(e),
		abv: a.Parser.sourceJsonToAbv(e),
		edition: r[e]
	};
	return {
		groups: a.SourceUtil.ADV_BOOK_GROUPS.map((e) => ({ ...e })),
		corpora: t,
		sources: i,
		sourceFiles: await O()
	};
}
// src/library/runtime/frame/dice-commands.ts
var mt = (e) => a.Renderer.dice.lang.getTree3(e)?.tree ?? null, ht = (e) => e.replace(/<[^>]+>/g, "");
async function gt(e, t) {
	return await s(), a.Renderer.utils.getTagEntry(e.startsWith("@") ? e : `@${e}`, t);
}
async function _t(e) {
	await s();
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
	if (await s(), !e.trim()) return {
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
	let t = a.Renderer.dice.tk, n = a.Renderer.dice.lang._lex3(e).lexed, r = (e) => e?.type === t.TYP_NUMBER && /^\d+$/.test(String(e.value)) ? Number(e.value) : null, i = [], o = 0, c = 0;
	for (; c < n.length;) {
		let e = 1;
		if (n[c] === t.ADD || n[c] === t.SUB) e = n[c] === t.SUB ? -1 : 1, c++;
		else if (c > 0) return {
			ok: !0,
			simple: !1
		};
		let a = r(n[c]);
		if (n[c] === t.DICE || n[c + 1] === t.DICE) {
			let o = n[c] === t.DICE ? c : c + 1, s = r(n[o + 1]);
			if (s === null) return {
				ok: !0,
				simple: !1
			};
			i.push({
				count: o === c ? 1 : a ?? 0,
				sides: s,
				sign: e
			}), c = o + 2;
		} else if (a !== null) o += e * a, c++;
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
	await s();
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
var bt = "#\\$prompt_number:?([^$]*)\\$#", k = (e, t) => {
	let n = Number(e);
	return e !== void 0 && e !== "" && Number.isFinite(n) ? n : t;
};
function A(e, t = bt) {
	return [...e.matchAll(new RegExp(t, "g"))].map((e) => {
		let t = {};
		for (let n of (e[1] ?? "").split(",").map((e) => e.trim()).filter(Boolean)) {
			let [e, r] = n.split("=").map((e) => e.trim());
			t[e] = r;
		}
		return {
			raw: e[0],
			title: t.title ?? null,
			default: k(t.default, 0),
			min: k(t.min, 0),
			max: t.max === void 0 || k(t.max, Infinity) === Infinity ? null : k(t.max, 0)
		};
	});
}
function xt(e, t, n = bt) {
	let r = A(e, n);
	if (t.length !== r.length) throw Error(`要填 ${r.length} 个数，给了 ${t.length} 个`);
	r.forEach((e, n) => {
		let r = t[n];
		if (!Number.isFinite(r)) throw Error(`第 ${n + 1} 个数不是数字`);
		if (r < e.min || e.max !== null && r > e.max) throw Error(`${e.title ?? `第 ${n + 1} 个数`}要在 ${e.min}～${e.max ?? "不限"} 之间`);
	});
	let i = 0;
	return e.replace(new RegExp(n, "g"), () => String(t[i++]));
}
function St(e) {
	return e.split(";").map((e) => e.trim()).filter(Boolean);
}
function Ct(e, t) {
	let n = e.findIndex((e) => {
		if (!e) return !1;
		let n = e.pad && t === 100 ? 0 : t;
		return e.exact == null ? e.min != null && e.max != null && e.min <= n && n <= e.max : e.exact === n;
	});
	return n >= 0 ? n : null;
}
// src/library/runtime/frame/table-roll-commands.ts
var j = (e) => e?.type === "row" ? e.row : e;
function wt(e, t) {
	let n = e.rows ?? [];
	return n.map((e, r) => {
		let i = j(e);
		return Array.isArray(i) ? a.Renderer.getRollableRow(i, {
			isForceInfiniteResults: t === a.RollerUtil.ROLL_COL_VARIABLE,
			isFirstRow: r === 0,
			isLastRow: r === n.length - 1
		})?.[0]?.roll ?? null : null;
	});
}
async function Tt(e, t) {
	await s();
	let n = a.Renderer.table.getAutoConvertedRollMode(e);
	return n ? {
		rollable: !0,
		mode: n,
		index: Ct(wt(e, n), t)
	} : {
		rollable: !1,
		mode: n,
		index: null
	};
}
function Et(e) {
	let t = a.Renderer.table.getHeaderRowMetas(e)?.at(-1)?.[0];
	if (typeof t != "string") return null;
	let n = a.RollerUtil.getFullRollCol(t), r = /^\{@dice (?<inner>.*)\}$/s.exec(n);
	return r?.groups ? a.Renderer.utils.getTagEntry("@dice", r.groups.inner)?.toRoll ?? null : null;
}
function M(e, t = []) {
	return typeof e == "string" ? t.push(e) : Array.isArray(e) ? e.forEach((e) => M(e, t)) : e && typeof e == "object" && Object.values(e).forEach((e) => M(e, t)), t;
}
function Dt(e) {
	let t = [];
	for (let n of M(e)) for (let e of n.matchAll(/\{@(\w+) ([^}]*)\}/g)) try {
		let n = a.Renderer.utils.getTagEntry(`@${e[1]}`, e[2]);
		typeof n?.toRoll == "string" && !/#\$prompt/.test(n.toRoll) && t.push({
			tag: `@${e[1]}`,
			text: e[2],
			formula: n.toRoll
		});
	} catch {}
	return t;
}
var Ot = (e) => e.replace(/<[^>]+>/g, "");
async function kt(e, t = {}) {
	await s();
	let n = a.Renderer.table.getAutoConvertedRollMode(e);
	if (!n) return { status: "not-rollable" };
	let r = Et(e);
	if (!r) return { status: "not-rollable" };
	let i = a.Renderer.dice.RE_PROMPT.source, o = St(r).map((e) => ({
		formula: e,
		prompts: A(e, i)
	}));
	if (o.length > 1 && t.formulaIndex === void 0) return {
		status: "choose",
		options: o
	};
	let c = o[t.formulaIndex ?? 0];
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
			l = xt(l, t.promptValues, i);
		} catch (e) {
			return {
				status: "error",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	let u = wt(e, n), d = !!e.isNameGenerator, f = a.Renderer.table.getHeaderRowMetas(e), p = d ? (f?.at(-1)?.length ?? 1) - 1 : 1, m = t.points ? [...t.points] : void 0, h = async (e) => {
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
		let r = Ct(u, n.total), i = r === null ? [] : j((e.rows ?? [])[r]).slice(1);
		g.push({
			label: d ? Ot(String(f.at(-1)[t + 1] ?? "")) : null,
			formula: l,
			total: n.total,
			used: n.used,
			detail: n.text,
			rowIndex: r,
			cells: d ? [i[t]].filter((e) => e !== void 0) : i
		});
	}
	let _ = [];
	for (let e of g) for (let t of Dt(e.cells)) {
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
var At = {
	monster: "monster",
	object: "object",
	vehicle: "vehicle"
};
async function jt(e, t) {
	await s();
	let n = At[e];
	if (!n || !a.Renderer[n]?.getTokenUrl || !a.Renderer.generic.hasToken(t)) return null;
	let i = a.Renderer[n].getTokenUrl(t);
	return i ? /^https?:/.test(i) ? i : r(i) : null;
}
// src/library/runtime/frame/table-extract-commands.ts
async function Mt() {
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
async function Nt(e, t, n = null) {
	await s();
	let { UtilGenTables: r, RecursiveSearchStateGeneric: i } = await Mt(), o = t ?? await a.DataLoader.pCacheAndGetAllSite(e) ?? [], c = [], u = [];
	for (let t of o) {
		let a = l(e, t);
		if (a) try {
			let o = new i({ isRequireIncludes: !1 }), s = t.source ?? n, l = {
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
					tmpMeta: l,
					section: t.name,
					entry: e
				});
			} catch (n) {
				u.push({
					name: `${t.name ?? a}.${e}`,
					error: n instanceof Error ? n.message : String(n)
				});
			}
			if (!o._tables.length) continue;
			let f = o._tables;
			o.getStacks().table.forEach((e, r) => c.push({
				parentHash: a,
				parentName: String(t.name ?? ""),
				parentSource: d(t) ?? n,
				table: e,
				path: f[r]?.path ?? [],
				sectionIndex: f[r]?.sectionIndex ?? null
			}));
		} catch (e) {
			u.push({
				name: String(t.name ?? a),
				error: e instanceof Error ? e.message : String(e)
			});
		}
	}
	return {
		tables: c,
		skipped: u
	};
}
// src/library/runtime/frame/entry-types-commands.ts
var N = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function Pt(e, t, n) {
	let r = await (await fetch(new URL(`js/${e}`, location.href))).text(), i = [];
	for (let e of r.matchAll(/import\s*\{\s*(\w+)\s*\}\s*from\s*["']\.\/([\w/.-]+\.js)["']/g)) e[2].startsWith(`${t}/`) && n.test(e[1]) && i.push({
		cls: e[1],
		file: e[2]
	});
	return i;
}
var P = null;
function F() {
	return P ??= (async () => {
		await s();
		let [{ TagCondition: e, TaggerUtils: t }, { TagJsons: n }, { AcConvert: r, AttachedItemTag: i, MiscTag: o, SpellcastingTraitConvert: c }, { ConverterItem: l }, { RaceTraitTag: u }, { InstrumentBaseItemTag: d }] = await Promise.all([
			N("converter/converterutils-tags.js"),
			N("converter/converterutils-entries.js"),
			N("converter/converterutils-creature.js"),
			N("converter/converter-item.js"),
			N("converter/converterutils-race.js"),
			N("converter/converterutils-item.js")
		]), [f, p, m, h, g, _] = await Promise.all([
			a.DataUtil.spell.pLoadAll(),
			a.Renderer.item.pBuildList(),
			a.DataUtil.item.loadRawJSON(),
			a.DataUtil.legendaryGroup.pLoadAll(),
			a.DataUtil.class.loadJSON(),
			a.BrewUtil2.pGetBrewProcessed()
		]), v = p.filter((e) => !e._isItemGroup);
		c.init(f), l.init(v, g), r.init(v), t.init({
			legendaryGroups: h,
			spells: f
		}), await n.pInit({ spells: f }), u.init({ itemsRaw: m }), o.init({ items: p }), i.init({ items: p }), await e.pInit({ conditionsBrew: _.condition }), d.init({ items: v });
	})(), P.catch(() => {
		P = null;
	}), P;
}
var I = null;
function L() {
	return I ??= (async () => {
		await s();
		let e = await a.DataUtil.loadJSON(`${a.Renderer.get().baseUrl}data/converter.json`).catch(() => ({ converterSample: [] })), t = { saveSettingsDebounced: () => void 0 }, n = [];
		for (let { cls: r, file: i } of await Pt("converter.js", "converter", /.ConverterUi$/)) {
			let a = (await N(i))[r];
			typeof a == "function" && n.push(new a({
				ui: t,
				converterData: e
			}));
		}
		return n;
	})(), I.catch(() => {
		I = null;
	}), I;
}
var R = (e, t) => {
	try {
		return e._getSample(t) ?? null;
	} catch {
		return null;
	}
};
async function z() {
	return (await L()).map((e) => ({
		id: e.converterId,
		prop: e.prop ?? null,
		modes: [...e._modes],
		canSave: !!e.canSaveLocal,
		samples: e._modes.filter((t) => !!R(e, t))
	}));
}
async function Ft(e, t, n) {
	let r = (await L()).find((t) => t.converterId === e);
	return r ? (n && (r._state.styleHint = n), R(r, t)) : null;
}
async function It(e, t, n, r) {
	let i = (await L()).find((t) => t.converterId === e);
	if (!i) throw Error(`作者没有这个转换器：${e}`);
	if (!i._modes.includes(t)) throw Error(`作者的 ${e} 转换器不支持这种格式：${t}（支持 ${i._modes.join("、")}）`);
	await F(), Object.assign(i._state, {
		mode: t,
		...r.styleHint ? { styleHint: r.styleHint } : {}
	}), "source" in i._state && (i._state.source = r.source), "page" in i._state && (i._state.page = r.page ?? 0);
	let a = [], o = [];
	return i.handleParse(n, (e) => a.push(e), (e) => o.push(String(e)), !1), {
		outputs: a,
		warnings: o
	};
}
var B = null;
function Lt() {
	return B ??= (async () => {
		await s();
		let e = [];
		for (let { cls: t, file: n } of await Pt("makebrew.js", "makebrew", /(?<!Base)Builder$/)) {
			let r = (await N(n))[t];
			if (typeof r != "function") continue;
			let i = new r()._prop;
			typeof i == "string" && e.push({
				prop: i,
				proto: r.prototype
			});
		}
		return e;
	})(), B.catch(() => {
		B = null;
	}), B;
}
async function Rt(e) {
	let t = (await Lt()).find((t) => t.prop === e);
	return t ? t.proto._getInitialState.call(Object.create(t.proto)) : null;
}
async function zt() {
	return await s(), Object.values(a.UrlUtil._PAGE_TO_PROPS_CORPUS ?? {}).map((e) => ({
		head: String(e.propHead),
		body: String(e.propBody)
	}));
}
async function Bt() {
	await s();
	let e = a.UrlUtil, t = await zt(), n = new Set(t.map((e) => e.body)), r = /* @__PURE__ */ new Map();
	for (let [t, n] of Object.entries(e.PAGE_TO_PROPS ?? {})) for (let e of n) r.has(e) || r.set(e, t);
	let i = new Set((await Lt()).map((e) => e.prop)), o = await z(), c = (e) => {
		let t = a.DataUtil?.[e]?._PAGE;
		return typeof t == "string" && t.endsWith(".html") ? t : void 0;
	};
	return Object.keys(e.URL_TO_HASH_BUILDER ?? {}).filter((e) => !n.has(e)).map((t) => {
		let n = r.get(t) ?? c(t);
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
async function Vt(e) {
	await s();
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
var Ht = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
), Ut = async (e) => (await fetch(new URL(`js/${e}`, location.href))).text();
async function V(e) {
	let t = e.slice(0, e.lastIndexOf("/") + 1), n = /* @__PURE__ */ new Map();
	for (let r of (await Ut(e)).matchAll(/import\s*\{([^}]+)\}\s*from\s*["']\.\/([\w./-]+\.js)["']/g)) for (let e of r[1].split(",").map((e) => e.trim().split(/\s+as\s+/).pop()).filter(Boolean)) n.set(e, `${t}${r[2]}`);
	return n;
}
async function Wt(e) {
	let t = (await L()).find((t) => t.prop === e);
	if (!t) return [];
	let n = /(Converter\w+)\.doParse/.exec(String(t.constructor))?.[1], r = [...await V("converter.js")].find(([e]) => e === t.constructor.name)?.[1];
	if (!n || !r) return [];
	let i = (await V(r)).get(n);
	if (!i) return [];
	let a = (await Ht(i))[n], o = await V(i), s = Object.getOwnPropertyNames(a).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(a))).filter((e) => /^_do\w*PostProcess$/.test(e) && typeof a[e] == "function"), c = /* @__PURE__ */ new Set(), l = [], u = async (e) => {
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
			let n = (await Ht(t))[e[1]], r = `${e[1]}.${e[2]}`;
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
var H = () => void 0, Gt = (e, n) => {
	let r = (e) => Array.isArray(e) && e.every((e) => typeof e != "object" || !e);
	return r(e) && r(n) ? t([...e].map(String).sort()) === t([...n].map(String).sort()) : t(e) === t(n);
};
async function Kt(e, t, n, r) {
	await s();
	let i = await Wt(e);
	if (!i.length) return {
		calls: [],
		fields: {}
	};
	await F();
	let a = {
		cbWarning: H,
		cbMan: H,
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
	await s();
	let i = await Wt(e);
	if (!i.length || !n.length) return {};
	await F();
	let a = structuredClone(t);
	for (let e of n) delete a[e];
	let o = {
		cbWarning: H,
		cbMan: H,
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
var U = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
), W = (e, t) => String(e ?? "").toLowerCase() === t.toLowerCase();
async function G(e) {
	await s();
	let t = (await a.BrewUtil2.pGetBrew()).find((t) => t.head.docIdLocal === e);
	if (!t) throw Error(`作者存储里没有这个包：${e}`);
	return a.MiscUtil.copyFast(t);
}
async function Jt(e, t, n) {
	let r = ((await G(e)).body?.[t] ?? []).find((e) => n.uniqueId && e?.uniqueId === n.uniqueId || n.hash && l(t, e) === n.hash || n.id && String(e?.id ?? "").toLowerCase() === n.id.toLowerCase());
	return r ? {
		entity: {
			...r,
			uniqueId: r.uniqueId ?? a.CryptUtil.uid()
		},
		hash: l(t, r),
		hadId: !!r.uniqueId
	} : null;
}
async function Yt(e, t, n, r = {}) {
	let i = await G(e), o = i.body[t] ??= [], s = n.uniqueId ? o.findIndex((e) => e?.uniqueId === n.uniqueId) : -1;
	s < 0 && r.replaceHash && (s = o.findIndex((e) => !e?.uniqueId && l(t, e) === r.replaceHash)), s < 0 && r.replaceId && (s = o.findIndex((e) => !e?.uniqueId && String(e?.id ?? "").toLowerCase() === r.replaceId.toLowerCase()));
	let c = s >= 0 ? a.MiscUtil.copyFast(o[s]) : null, u = {
		...n,
		uniqueId: n.uniqueId ?? a.CryptUtil.uid()
	};
	return s >= 0 ? o[s] = u : o.push(u), await a.BrewUtil2.pUpdateBrew(i), {
		uniqueId: u.uniqueId,
		hash: l(t, u),
		previousHash: c ? l(t, c) : null,
		previous: c ? {
			name: String(c.name ?? ""),
			source: String(c.source ?? "")
		} : null,
		previousEntity: c
	};
}
async function Xt(e, t, n, r = {}) {
	let i = await G(e), o = i.body?.[t] ?? [], s = new Set(n), c = new Set(r.hashes ?? []), u = new Set((r.ids ?? []).map((e) => e.toLowerCase())), d = (e) => s.has(e?.uniqueId) || c.size > 0 && c.has(l(t, e) ?? "") || u.size > 0 && u.has(String(e?.id ?? "").toLowerCase()), f = o.filter(d).map((e) => ({
		...a.MiscUtil.copyFast(e),
		uniqueId: e.uniqueId ?? a.CryptUtil.uid()
	}));
	return f.length ? (i.body[t] = o.filter((e) => !d(e)), await a.BrewUtil2.pUpdateBrew(i), f) : [];
}
async function Zt(e, t, n, r) {
	let i = await G(e), o = 0;
	for (let e of i.body?.[t] ?? []) {
		let t = e?._copy;
		t && W(t.name, n.name) && W(t.source, n.source) && (t.name = r.name, t.source = r.source, o++);
	}
	return o && await a.BrewUtil2.pUpdateBrew(i), o;
}
async function Qt(e, t, n) {
	let r = await G(e), i = (r.body?._meta?.sources ?? []).find((e) => W(e?.json, t));
	if (!i) throw Error(`这个包里没有来源 ${t}`);
	Object.assign(i, Object.fromEntries(Object.entries(n).filter(([, e]) => typeof e == "string" && e.trim()).map(([e, t]) => [e, t.trim()]))), r.body._meta.dateLastModified = Math.round(Date.now() / 1e3), await a.BrewUtil2.pUpdateBrew(r);
}
async function $t(e, t) {
	let { PropOrder: n } = await U("utils-proporder.js"), r = await G(e), i = { _meta: {
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
async function en() {
	await s();
	let [{ DataLoaderConst: e }, { DataLoaderInternalUtil: t }] = await Promise.all([U("utils-dataloader/utils-dataloader-const.js"), U("utils-dataloader/utils-dataloader-internal-util.js")]), n = [];
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
async function tn(e, t) {
	let n = await G(e), r = n.body._meta.dependencies ??= {}, i = !1;
	for (let [e, n] of Object.entries(t)) {
		let t = r[e] ?? [], a = [.../* @__PURE__ */ new Set([...t, ...n])];
		a.length !== t.length && (r[e] = a, i = !0);
	}
	i && await a.BrewUtil2.pUpdateBrew(n);
}
async function nn(e) {
	await s();
	let t = new Set(Object.keys(a.Parser.SOURCE_JSON_TO_FULL ?? {}).map((e) => e.toLowerCase()));
	return e.filter((e) => t.has(e.toLowerCase()));
}
async function rn(e) {
	await s();
	let t = a.MiscUtil.copyFast(await a.BrewUtil2.pGetOrCreateEditableBrewDoc()), n = (t.body._meta?.sources ?? []).find((t) => W(t?.json, e));
	if (!n) throw Error(`可编辑自制里没有来源 ${e}`);
	let r = Math.round(Date.now() / 1e3), i = { _meta: {
		sources: [n],
		dateAdded: r,
		dateLastModified: r
	} }, o = {}, c = /* @__PURE__ */ new Set(), l = [];
	for (let [n, r] of Object.entries(t.body)) {
		if (n.startsWith("_") || !Array.isArray(r)) continue;
		let a = r.filter((t) => W(t?.source, e));
		if (a.length) {
			i[n] = a, t.body[n] = r.filter((t) => !W(t?.source, e));
			for (let t of a) {
				t.uniqueId && l.push(t.uniqueId);
				let r = t?._copy?.source;
				typeof r == "string" && (W(r, e) ? c.add(n) : (o[n] ??= /* @__PURE__ */ new Set()).add(r));
			}
		}
	}
	return Object.keys(o).length && (i._meta.dependencies = Object.fromEntries(Object.entries(o).map(([e, t]) => [e, [...t]]))), c.size && (i._meta.internalCopies = [...c]), t.body._meta.sources = t.body._meta.sources.filter((e) => e !== n), await a.BrewUtil2.pSetEditableBrewDoc(t), {
		body: i,
		uniqueIds: l
	};
}
async function an(e, t) {
	let n = await G(e), r = new Set(t), i = (n.body._meta?.sources ?? []).map((e) => String(e?.json ?? "").toLowerCase()), o = new Set(n.body._meta?.internalCopies ?? []), s = 0;
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
var on = (e) => e.charAt(0).toUpperCase() + e.slice(1), K = (e) => String(e ?? "").toLowerCase(), sn = (e, t) => t.endsWith("ShortName") ? e.shortName ?? e.name : e.name;
function q(e, t) {
	let n = [`${t}ShortName`, `${t}Name`].find((t) => e?.[t] !== void 0);
	return n && e?.[`${t}Source`] !== void 0 ? {
		name: n,
		source: `${t}Source`
	} : null;
}
var cn = (e, t, n) => {
	let r = q(e, t);
	return !!r && K(e[r.name]) === K(sn(n, r.name)) && K(e[r.source]) === K(n.source);
};
async function ln(e, t, n, r) {
	let i = await G(e), a = {};
	for (let e of r) a[e] = (i.body?.[e] ?? []).filter((e) => cn(e, t, n)).map((t) => ({
		name: String(t.name ?? ""),
		hash: l(e, t),
		uniqueId: t.uniqueId ?? null,
		level: typeof t.level == "number" ? t.level : null
	})).sort((e, t) => (e.level ?? 0) - (t.level ?? 0) || e.name.localeCompare(t.name));
	return a;
}
function un(e) {
	let t = `packUid${on(e)}`, n = Object.values(a.DataUtil).find((e) => typeof e?.[t] == "function");
	return n ? (e) => n[t](e, { isMaintainCase: !0 }) : null;
}
async function dn(e, t, n, r) {
	await s();
	let i = un(t), o = r ?? n;
	if (!i || !o) return null;
	let c = await G(e), l = `${t}s`, u = Object.keys(c.body ?? {}).filter((e) => q(o, e)).map((e) => ({
		q: e,
		ent: (c.body[e] ?? []).find((t) => cn(o, e, t))
	})).filter((e) => e.ent), d = u.find((e) => !u.some((t) => t !== e && q(t.ent, e.q)));
	if (d) {
		let e = d.q, o = d.ent, s = (e) => K(typeof e == "string" ? e : e?.[t]), u = n ? K(i(n)) : null, f = (o[l] ?? []).filter((e) => s(e) !== u);
		return r && !f.some((e) => s(e) === K(i(r))) && f.push(i(r)), o[l] = f, await a.BrewUtil2.pUpdateBrew(c), {
			parentProp: e,
			field: l
		};
	}
	return null;
}
// src/library/runtime/frame/copy-flatten-commands.ts
var J = (e) => String(e ?? "").toLowerCase();
async function Y(e, t) {
	await s();
	let n = new Set(t.map(J)), r = a.MiscUtil.copyFast(e), i = 0, o = [];
	for (let [e, t] of Object.entries(r)) if (!e.startsWith("_") && Array.isArray(t)) for (let r = 0; r < t.length; r++) {
		let s = t[r], c = s?._copy?.source;
		if (!(typeof c != "string" || n.has(J(c)))) try {
			let n = await a.DataUtil.pDoMetaMergeSingle(e, { dependencies: { [e]: [c] } }, a.MiscUtil.copyFast(s));
			if (!n || n._copy) throw Error("作者没有拼出完整的一条");
			t[r] = a.DataUtil.cleanJson(n, { isDeleteUniqueId: !1 }), i++;
		} catch (t) {
			o.push({
				prop: e,
				name: String(s?.name ?? ""),
				reason: t instanceof Error ? t.message : String(t)
			});
		}
	}
	let c = r._meta?.dependencies;
	if (c) {
		for (let [e, t] of Object.entries(c)) {
			let n = t.filter((t) => (r[e] ?? []).some((e) => J(e?._copy?.source) === J(t)));
			n.length ? c[e] = n : delete c[e];
		}
		Object.keys(c).length || delete r._meta.dependencies;
	}
	return {
		json: r,
		flattened: i,
		failed: o
	};
}
async function fn(e) {
	let t = await G(e), n = (t.body._meta?.sources ?? []).map((e) => String(e?.json ?? "")), r = await Y(t.body, n);
	return r.flattened && (t.body = r.json, await a.BrewUtil2.pUpdateBrew(t)), {
		flattened: r.flattened,
		failed: r.failed
	};
}
async function pn(e, t) {
	await s();
	let n = t?._copy?.source;
	if (typeof n != "string") return a.DataUtil.cleanJson(a.MiscUtil.copyFast(t));
	let r = await a.DataUtil.pDoMetaMergeSingle(e, { dependencies: { [e]: [n] } }, a.MiscUtil.copyFast(t));
	if (!r || r._copy) throw Error("作者没有拼出完整的一条（原件找不到）");
	return a.DataUtil.cleanJson(r);
}
// src/library/runtime/frame/field-value-commands.ts
var X = /[㐀-鿿]/, Z = null;
function mn() {
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
function hn() {
	return Object.entries(a.Parser).filter(([e, t]) => /ToCn$/.test(e) && typeof t == "function").map(([e, t]) => ({
		name: e,
		fn: t
	}));
}
function gn(e) {
	let t = hn().flatMap(({ name: t, fn: n }) => {
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
async function _n(e) {
	await s();
	let t = mn();
	return e.map((e) => {
		if (!e.length) return null;
		let n = t.filter(({ map: t }) => e.every((e) => e in t));
		if (!n.length) return gn(e);
		n.sort((e, t) => Number(Object.values(t.map).some((e) => X.test(e))) - Number(Object.values(e.map).some((e) => X.test(e))) || Object.keys(e.map).length - Object.keys(t.map).length);
		let r = n[0].map;
		return Object.fromEntries(e.map((e) => [e, r[e]]));
	});
}
// src/library/runtime/frame/markdown-commands.ts
var vn = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function yn(e) {
	await s();
	let t = a.RendererMarkdown.get();
	return t._renderString = (e, t) => {
		t[0] += e;
	}, String(t.render({ entries: a.MiscUtil.copyFast(e) }) ?? "").trim();
}
async function bn(e) {
	await s();
	let t = a.MarkdownConverter.getEntries(e), { DiceConvert: n } = await vn("converter/converterutils-tags.js");
	return t.map((e) => n.getTaggedEntry(e));
}
var Q = (e) => Array.isArray(e) ? e.map(Q) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).sort().map((t) => [t, Q(e[t])])) : e, xn = (e, t) => JSON.stringify(Q(e)) === JSON.stringify(Q(t));
function Sn(e, t) {
	if (!e || !t || typeof e != "object" || typeof t != "object" || Array.isArray(e) || Array.isArray(t)) return e;
	let n = e, r = t;
	if (n.type !== r.type) return e;
	let i = { ...n };
	for (let [e, t] of Object.entries(r)) e in i || (i[e] = t);
	return i;
}
async function Cn(e) {
	let t = await yn([e]);
	try {
		let n = a.MarkdownConverter.getEntries(t);
		return n.length === 1 && xn(Sn(n[0], e), e) ? t : null;
	} catch (e) {
		return console.debug("[trpg-assistant] 这一段转不回来，留给 JSON", e), null;
	}
}
async function wn(e, t) {
	let n = await bn(e);
	return n.length === 1 && t !== void 0 ? [Sn(n[0], t)] : n;
}
// src/library/runtime/frame/commands.ts
async function Tn() {
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
async function En(e) {
	await s();
	let t = await a.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => l(e, t)),
		sources: t.map((e) => d(e))
	};
}
async function Dn(e, t, n) {
	return await s(), ((await a.DataUtil.loadJSON(`data/${e}`))[t] ?? []).map((e) => ({
		id: e.id,
		source: a.SourceUtil.getEntitySource(e),
		hash: a.UrlUtil.URL_TO_HASH_BUILDER[n](e),
		...typeof e.name == "string" ? { name: e.name } : {}
	}));
}
async function On(e, t, n) {
	return await s(), a.DataLoader.pCacheAndGet(e, t, n, { isRequired: !0 });
}
async function kn(e) {
	await s();
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
async function An(e, t) {
	await s();
	let n = a.ExcludeUtil.getList().filter((t) => t.hash !== "*" || t.category !== "*" || String(t.source).toLowerCase() !== e.toLowerCase()), r = t ? [...n, {
		displayName: e,
		hash: "*",
		category: "*",
		source: e,
		isAuto: !1
	}] : n;
	return await a.ExcludeUtil.pSetList(r), await a.ExcludeUtil._pSave(), a.ExcludeUtil.getList();
}
async function jn(e, t, n) {
	return await s(), a.ExcludeUtil.isExcluded(e, t, n, { isNoCount: !0 });
}
async function Mn(e, t) {
	return await s(), t.map((t) => l(e, t));
}
async function Nn() {
	return [...a.__trpgFrameErrors];
}
async function Pn() {
	let e = a.__trpgStorageFlush;
	return e ? e() : [];
}
var Fn = {
	frameErrors: Nn,
	init: s,
	loaders: Tn,
	parseProp: En,
	corpusList: Dn,
	parseCorpus: On,
	searchIndexHashes: kn,
	setSourceExcluded: An,
	isExcluded: jn,
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
	rawHashes: Mn,
	storageFlush: Pn,
	editionOf: Je,
	sourceNames: Ye,
	corpusFile: E,
	brewDocIndex: Ze,
	brewItemsByHash: $e,
	brewRaw: Qe,
	brewExport: et,
	fluffOf: tt,
	fluffOfMany: nt,
	excludeList: rt,
	editableDoc: D,
	editableEnsureSource: it,
	editablePut: at,
	editableRemove: ut,
	editableRetargetCopies: lt,
	editableAddDependencies: dt,
	cleanEntity: ct,
	editableExport: st,
	sourceTaken: ot,
	converters: z,
	converterSample: Ft,
	convertText: It,
	entryTemplate: Rt,
	entryTypes: Bt,
	corpusPairs: zt,
	rawProp: Vt,
	autoFieldProbe: Kt,
	autoTag: qt,
	packChildren: ln,
	linkParent: dn,
	packEntity: Jt,
	packPut: Yt,
	packRemove: Xt,
	packRetargetCopies: Zt,
	packRenameSource: Qt,
	packExport: $t,
	authorDataFiles: en,
	packAddDependencies: tn,
	officialSourcesOf: nn,
	editableTake: rn,
	packFixOldCopy: an,
	flattenCopies: Y,
	packFlattenCopies: fn,
	mergeOne: pn,
	valueLabels: _n,
	blockMarkdown: Cn,
	markdownBlocks: wn,
	diceTag: gt,
	diceStats: _t,
	diceRead: vt,
	diceRoll: yt,
	tableRow: Tt,
	tableRoll: kt,
	tagMeta: m,
	tagRefs: h,
	brewDependencyPreview: Ne,
	brewMergeCheck: Me,
	sortColumns: _e,
	sortRanks: ye,
	listCells: be,
	authorFields: ne,
	displayName: ue,
	renderText: de,
	renderContent: v,
	renderEntity: ce,
	statblockMeta: fe,
	tokenPath: jt,
	extractTables: Nt,
	directory: pt,
	sourceFiles: O
}, In = [
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
], $ = globalThis, Ln = new URLSearchParams(location.search).get("frame") ?? "";
addEventListener("message", (e) => {
	let t = e.data;
	if (e.source !== parent || !t || t.channel !== "trpg-library" || t.type !== "call") return;
	let n = (e) => parent.postMessage({
		channel: i,
		type: "result",
		frame: Ln,
		id: t.id,
		...e
	}, location.origin), r = Fn[t.fn];
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
var Rn = new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "", zn = {
	channel: i,
	type: "ready",
	frame: Ln,
	codeSet: Rn,
	authorVersion: typeof $.VERSION_NUMBER == "string" ? $.VERSION_NUMBER : null,
	present: Object.fromEntries(In.map((e) => [e, $[e] !== void 0])),
	errors: [...$.__trpgFrameErrors ?? []]
};
parent.postMessage(zn, location.origin);
