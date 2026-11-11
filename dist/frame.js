import { n as e } from "./images-9osTC28w.js";
import { t } from "./protocol-03CO7Rhf.js";
// src/library/runtime/frame/author.ts
var n = globalThis, r = null;
function i() {
	return r ??= (async () => {
		n.Renderer.get().setBaseUrl(""), await n.PrereleaseUtil.pInit(), await n.BrewUtil2.pInit(), await n.ExcludeUtil.pInitialise();
	})(), r;
}
function a(e, t) {
	return e ? e[t] ?? e[n.DataLoader.getPropPage(t)] ?? null : null;
}
function o(e, t) {
	let r = a(n.UrlUtil.URL_TO_HASH_BUILDER, e);
	try {
		return r ? r(t) : null;
	} catch {
		return null;
	}
}
function s(e, t) {
	let r = n.UrlUtil.URL_TO_ENG_HASH_BUILDER, i = n.DataLoader.getPropPage(e);
	return !r || !t?.ENG_name || !r[i] ? null : r[i](t);
}
function c(e) {
	return n.SourceUtil.getEntitySource(e) ?? null;
}
// src/library/runtime/frame/field-commands.ts
var l = (e) => String(e ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(), u = (e) => Array.isArray(e) ? e.map(l).filter(Boolean).join("、") : l(e), d = {
	spell: (e) => [["成分", e.components ? n.Parser.spComponentsToFull(e.components, e.level, { isPlainText: !0 }) : ""], ["持续时间", e.duration ? n.Parser.spDurationToFull(e.duration, { isPlainText: !0 }) : ""]],
	class: (e) => {
		let t = e.startingProficiencies ?? {}, r = { styleHint: e.edition ?? "classic" };
		return [
			["护甲受训", t.armor ? n.Renderer.class.getRenderedArmorProfs(t.armor, r) : ""],
			["武器熟练", t.weapons ? n.Renderer.class.getRenderedWeaponProfs(t.weapons, r) : ""],
			["工具熟练", t.tools ? n.Renderer.class.getRenderedToolProfs(t.tools, r) : ""],
			["技能熟练", t.skills ? n.Renderer.class.getRenderedSkillProfs(t.skills, r) : ""],
			["起始装备", Array.isArray(e.startingEquipment?.default) ? e.startingEquipment.default.join("；") : ""]
		];
	},
	deity: (e) => [
		["神系", e.pantheon],
		["阵营", Array.isArray(e.alignment) ? n.Parser.alignmentListToFull(e.alignment) : ""],
		["类别", e.category],
		["领域", Array.isArray(e.domains) ? e.domains.join("、") : ""],
		["权能", e.province],
		["象征", e.symbol]
	]
};
async function f(e, t) {
	await i();
	let r = d[e], a = [];
	if (r) try {
		for (let [e, n] of r(t)) {
			let t = Array.isArray(n) ? u(n) : l(n);
			t && a.push({
				label: e,
				value: t
			});
		}
	} catch (e) {
		a.push({
			label: "读取失败",
			value: e instanceof Error ? e.message : String(e)
		});
	}
	let o = null;
	if (e === "class") try {
		o = Array.from({ length: 20 }, (e, t) => `+${n.Parser.levelToPb(t + 1)}`);
	} catch {
		o = null;
	}
	return {
		lines: a,
		pb: o
	};
}
// src/library/runtime/frame/entry-commands.ts
var p = { itemProperty: (e) => n.Renderer.itemProperty.getItemPropertyRenderableEntriesMeta(e).entryFaux.name };
async function m(e, t) {
	await i();
	let n = p[e], r = n ? n(t) : t?.name;
	return typeof r == "string" && r ? r : null;
}
async function h(e) {
	await i();
	let t = n.Renderer.get().render(e), r = document.createElement("div");
	return r.innerHTML = t, (r.textContent ?? "").replace(/\s+/g, " ").trim();
}
async function g(e) {
	await i();
	let t = n.Renderer.utils.getStatblockEntryMeta(e), r = String(t.prop ?? ""), a = !!t.isFluff;
	return {
		prop: r,
		target: a ? r.replace(/Fluff$/, "") : r,
		source: t.source ?? null,
		hash: t.hash ?? null,
		displayName: t.displayName ?? null,
		isFluff: a
	};
}
var _ = { legendaryGroup: (e) => n.Renderer.legendaryGroup.getSummaryEntry(e) };
async function v(e, t) {
	await i();
	let n = _[e];
	return (n ? n(t) : null) ?? null;
}
// src/library/runtime/frame/sort-commands.ts
var ee = (e) => ["js/filter-common.js", `js/filter-${e}.js`], y = /* @__PURE__ */ new Set();
async function te(e) {
	y.has(e) || (y.add(e), await new Promise((t) => {
		let n = document.createElement("script");
		n.src = e, n.onload = () => t(), n.onerror = () => t(), document.head.appendChild(n);
	}));
}
async function b(e) {
	await i();
	let t = String(n.DataLoader.getPropPage(e) ?? "").replace(/\.html$/, "");
	if (!t) return null;
	for (let e of ee(t)) await te(e);
	let r = Object.keys(n).find((e) => e.startsWith("ModalFilter") && e.toLowerCase() === `modalfilter${t}`);
	return r && typeof n[r] == "function" ? {
		Cls: n[r],
		page: t
	} : null;
}
function x(e, t) {
	let r = n.UrlUtil.getCurrentPage;
	n.UrlUtil.getCurrentPage = () => `${e}.html`;
	try {
		return t();
	} finally {
		n.UrlUtil.getCurrentPage = r;
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
	let r = [...await n.DataLoader.pCacheAndGetAllSite(t) ?? [], ...await n.DataLoader.pCacheAndGetAllBrew(t) ?? []];
	return x(e.page, () => {
		let t = new e.Cls({ namespace: "trpg-sort" }), n = r.map((e) => structuredClone(e));
		n.forEach((e) => t._pageFilter.mutateAndAddToFilters(e));
		let i = {
			_previewButtonHandler: { bindPreviewButton() {} },
			_isRadio: !1,
			_getNameStyle: () => ""
		};
		return {
			inst: t,
			entities: n,
			items: n.map((n, r) => e.Cls.prototype._getListItem.call(i, t._pageFilter, n, r))
		};
	});
}
async function ne(e, t, r) {
	let i = await b(e);
	if (!i || !(await S(e)).some((e) => e.sort === t)) return null;
	let { inst: a, entities: s, items: c } = await C(i, e);
	return x(i.page, () => {
		let i = {
			_filteredItems: c,
			_sortBy: t,
			_sortDir: r,
			_fnSort: a._fnSort,
			_wrpList: { previousElementSibling: { querySelector: () => ({}) } },
			constructor: n.List
		}, l = n.List.prototype.getSortedItems.call(i, { items: [...c] }), u = new Map(c.map((e, t) => [e, t])), d = {};
		return l.forEach((t, n) => {
			let r = o(e, s[u.get(t)]);
			r && !(r in d) && (d[r] = n);
		}), d;
	});
}
async function re(e) {
	let t = await b(e);
	if (!t) return null;
	let n = t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})), { entities: r, items: i } = await C(t, e), a = {};
	return i.forEach((t, i) => {
		let s = o(e, r[i]);
		if (!s || s in a) return;
		let c = [...t.ele?.firstElementChild?.children ?? []].map((e) => String(e.textContent ?? "").replace(/\s+/g, " ").trim());
		a[s] = n.map((e, t) => c[c.length - n.length + t] ?? "");
	}), {
		columns: n,
		cells: a
	};
}
// src/library/runtime/frame/read-commands.ts
function w(e, t, r) {
	let i = c(t);
	return i ? n.DataLoader.getPropPage(e) === n.UrlUtil.PG_ITEMS && n.Renderer.item.isExcluded(t, { hash: r }) ? !0 : n.ExcludeUtil.isExcluded(r ?? "", t.__prop ?? e, i, { isNoCount: !0 }) : !1;
}
async function ie(e, t = "site") {
	if (await i(), !n.ExcludeUtil.getList().length) return {
		hashes: [],
		excluded: null
	};
	let r = await (t === "brew" ? n.DataLoader.pCacheAndGetAllBrew(e) : n.DataLoader.pCacheAndGetAllSite(e)) ?? [], a = r.map((t) => o(e, t));
	return {
		hashes: a,
		excluded: r.map((t, n) => w(e, t, a[n]))
	};
}
async function ae(e, t, r) {
	await i();
	let a = r ? await n.DataLoader.pCacheAndGet(e, r, t) : await n.DataLoader.pCacheAndGetHash(e, t);
	if (!a) return null;
	let o = null, l = null;
	try {
		o = await n.Renderer.utils.pGetProxyFluff({
			entity: a,
			prop: e
		}) ?? null;
	} catch (e) {
		l = e instanceof Error ? e.message : String(e);
	}
	return {
		item: a,
		hash: t,
		source: c(a),
		excluded: w(e, a, t),
		fluff: o,
		fluffError: l,
		engSiteHash: s(e, a)
	};
}
async function oe(e, t = null) {
	await i();
	let r = t === null ? null : await T(), a = r?.isShowLegacy;
	r && (r.isShowLegacy = t);
	try {
		return (await n.OmnisearchBacking.pGetResults(n.CleanUtil.getCleanString(e))).map((e) => ({
			score: e.score,
			prop: n.Parser.pageCategoryToProp(e.doc.c),
			doc: e.doc
		}));
	} finally {
		r && (r.isShowLegacy = a);
	}
}
async function T() {
	return (await import(
		/* @vite-ignore */
		new URL("js/omnisearch/omnisearch-state.js", location.href).href
)).OmnisearchState;
}
async function se(e = {}) {
	await i();
	let t = await T();
	for (let [n, r] of Object.entries(e)) {
		if (!(n in t._DEFAULT_STATE)) throw Error(`作者的搜索设置里没有这一项：${n}`);
		n === "partneredMode" ? t.setPartneredMode(r) : t[n] = r;
	}
	return t._getComp().toObject();
}
async function ce() {
	await i();
	let e = n.OmnisearchBacking;
	return await e._pInit(), {
		json: JSON.stringify(e._searchIndex.toJSON()),
		maxId: e._maxId ?? null,
		categoryCounts: e._CATEGORY_COUNTS ?? {},
		adventureBookLookup: e._adventureBookLookup ?? {}
	};
}
async function le(e) {
	await i(), n.SearchUtil._initSearchIndex_getFnFold();
	let t = n.OmnisearchBacking;
	return t._searchIndex = n.elasticlunr.Index.load(JSON.parse(e.json)), t._maxId = e.maxId, t._CATEGORY_COUNTS = e.categoryCounts, t._adventureBookLookup = e.adventureBookLookup, t._pLoadSearch = Promise.resolve(), t._initReInCategory(), !0;
}
// src/library/runtime/frame/brew-commands.ts
async function E(e) {
	await i();
	let t = n.__trpgFrameErrors, r = t.length, a = await e();
	return await new Promise((e) => setTimeout(e, 50)), {
		value: a,
		errors: t.slice(r)
	};
}
var D = (e) => ({
	head: e.head,
	meta: e.body?._meta ?? null
});
function ue() {
	return E(() => n.BrewUtil2.pGetCombinedIndexes());
}
async function de() {
	return await i(), (await n.BrewUtil2.pGetBrew()).map(D);
}
async function fe() {
	await i();
	let e = [];
	for (let [t, r] of [["brew", n.BrewUtil2], ["prerelease", n.PrereleaseUtil]]) {
		let n = new Set((await r.pGetBrew()).map((e) => e.head.docIdLocal));
		for (let i of await r._pGetBrewRaw() ?? []) e.push({
			kind: t,
			head: i.head,
			sources: (i.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
			shown: n.has(i.head.docIdLocal)
		});
	}
	return e;
}
async function pe(e) {
	let t = await E(() => n.BrewUtil2.pAddBrewFromUrl(e));
	return {
		...t,
		value: (t.value ?? []).map(D)
	};
}
async function me(e) {
	return await i(), E(async () => {
		let t = n.BrewUtil2, r = await t._pGetBrewDocFromUrl({ url: e }), i = await t._pGetBrewDependencies_getBrewIndex({
			urlRoot: await t.pGetCustomUrl(),
			isIgnoreNetworkErrors: !0
		}), { available: a, unavailable: o } = t._getBrewDependencySources({
			brewDoc: r,
			brewIndex: i
		}), s = new Set((await t.pGetBrew()).flatMap((e) => (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean)));
		return {
			sources: (r.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
			dependencies: a.map((e) => ({
				source: e,
				file: String(i[e] ?? "").split("/").pop() ?? e,
				installed: s.has(e)
			})),
			unavailable: o
		};
	});
}
async function he(e) {
	let t = await E(async () => {
		let t = [], r = [], i = new Set((await n.BrewUtil2.pGetBrew()).map((e) => e.head.docIdLocal));
		return await Promise.all(e.map(async (e) => {
			let i = await n.BrewUtil2.pGetSourceUrl(e);
			if (!i) t.push(e);
			else try {
				await n.BrewUtil2.pAddBrewFromUrl(i, { isLazy: !0 });
			} catch {
				r.push(e);
			}
		})), await n.BrewUtil2.pAddBrewsLazyFinalize(), {
			added: (await n.BrewUtil2.pGetBrew()).filter((e) => !i.has(e.head.docIdLocal)),
			notFound: [...t, ...r]
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
async function ge(e) {
	let t = [], r = [];
	for (let n of e) try {
		r.push({
			name: n.name,
			json: JSON.parse(n.text)
		});
	} catch (e) {
		t.push({
			name: n.name,
			error: e instanceof Error ? e.message : String(e)
		});
	}
	let i = await E(async () => {
		let [e, t] = r.segregate((e) => n.BrewUtil2.constructor._isPrereleaseDroppedJson(e.json)), i = [];
		return e.length && i.push(...await n.PrereleaseUtil.pAddBrewsFromFiles(e) ?? []), t.length && i.push(...await n.BrewUtil2.pAddBrewsFromFiles(t) ?? []), i;
	});
	return {
		errors: i.errors,
		value: {
			added: i.value.map(D),
			notJson: t
		}
	};
}
async function _e(e) {
	return E(async () => {
		let t = new Set(e), r = (await n.BrewUtil2.pGetBrew()).filter((e) => t.has(e.head.docIdLocal));
		return await n.BrewUtil2.pDeleteBrews(r), r.length;
	});
}
async function ve(e = null) {
	let t = await E(async () => {
		let t = e ? (await n.BrewUtil2.pGetBrew()).filter((t) => e.includes(t.head.docIdLocal)) : null;
		return n.BrewUtil2.pPullAllBrews({ brews: t });
	});
	return {
		...t,
		value: (t.value ?? []).map(D)
	};
}
async function ye(e, t) {
	return await i(), ((await n.BrewUtil2.pGetBrewProcessed())?.[e] ?? []).map((e) => ({
		id: e.id,
		name: e.name,
		source: n.SourceUtil.getEntitySource(e),
		hash: n.UrlUtil.URL_TO_HASH_BUILDER[t](e)
	}));
}
async function be(e = null) {
	return E(async () => {
		let t = n.BrewUtil2, r = (await t.pGetBrew()).filter((n) => t.isPullable(n) && (!e || e.includes(n.head.docIdLocal))), i = [];
		for (let e of r) {
			let t = e.body._meta?.dateLastModified ?? 0;
			try {
				let r = await n.DataUtil.loadRawJSON(e.head.url, { isBustCache: !0 }), a = r._meta?.dateLastModified ?? 0;
				i.push({
					docIdLocal: e.head.docIdLocal,
					filename: e.head.filename ?? null,
					url: e.head.url,
					local: t,
					remote: a,
					hasUpdate: a > t,
					approxBytes: new TextEncoder().encode(JSON.stringify(r)).length,
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
async function xe(e) {
	await i();
	let t = await n.DataLoader.pCacheAndGetAllBrew(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => o(e, t)),
		sources: t.map((e) => c(e))
	};
}
function Se(e, t, n, r, i) {
	if (t._versionBase_hash) return r.has(t._versionBase_hash);
	if (t._isSubRace && t._subraceName) {
		let e = o("subrace", {
			name: t._subraceName,
			raceName: t._baseName,
			source: c(t)
		});
		return !!e && (i.subrace ?? []).includes(e);
	}
	if (t.genericVariant) {
		let e = o("magicvariant", t.genericVariant);
		return !!e && (i.magicvariant ?? []).includes(e);
	}
	return e === "item" && t._isItemGroup ? (i.itemGroup ?? []).includes(n) : r.has(n);
}
async function O(e) {
	await i();
	let t = {};
	for (let r of new Set(n.DataLoader._DATA_TYPE_LOADER_LIST)) {
		let i = r.constructor.PAGE;
		if (n.UrlUtil._PAGE_TO_PROPS_CORPUS[i]) continue;
		let a = r.constructor.PROPS, s = i === n.UrlUtil.PG_ITEMS || i === n.UrlUtil.PG_RACES ? n.UrlUtil.PAGE_TO_PROPS[i] ?? [] : [];
		for (let r of a) {
			if (r.startsWith("raw_")) continue;
			let a = r === s[0];
			if (!e[r]?.length && !(a && s.some((t) => e[t]?.length))) continue;
			let l = new Set(e[r] ?? []);
			if (a && i === n.UrlUtil.PG_ITEMS) for (let t of s.filter((e) => n.UrlUtil.URL_TO_HASH_BUILDER[e] === n.UrlUtil.URL_TO_HASH_BUILDER[i])) for (let n of e[t] ?? []) l.add(n);
			let u = (await n.DataLoader.pCacheAndGetAllBrew(r) ?? []).flatMap((t) => {
				let n = o(r, t);
				return !n || !Se(r, t, n, l, e) ? [] : [{
					hash: n,
					item: t,
					source: c(t),
					excluded: w(r, t, n)
				}];
			});
			u.length && (t[r] = u);
		}
	}
	return t;
}
// src/library/runtime/frame/english-commands.ts
async function k(e) {
	await i();
	let t = e ? new Set(e.map((e) => e.toUpperCase())) : null, r = [], a = async (e, i, a) => {
		let o = new n.Omnidexer();
		await o.pAddToIndex(e, i, {
			isNoFilter: !0,
			isIncludeEntityLocator: !0
		});
		for (let e of o.getIndex().x) {
			if (!e._entityLocator) continue;
			let i = e._entityLocator.source ? String(e._entityLocator.source).toUpperCase() : null;
			t && i && !t.has(i) || r.push({
				prop: n.Parser.pageCategoryToProp(e.c),
				hash: e.u,
				file: a,
				locator: e._entityLocator
			});
		}
	};
	for (let e of n.Omnidexer.TO_INDEX__FROM_INDEX_JSON) {
		let t = await n.DataUtil.loadRawJSON(`data/${e.dir}/index.json`);
		for (let r of Object.values(t)) {
			let t = `data/${e.dir}/${r}`;
			await a(e, await n.DataUtil.loadRawJSON(t), t);
		}
	}
	for (let e of n.Omnidexer.TO_INDEX) {
		let t = `data/${e.file}`;
		await a(e, await n.DataUtil.loadJSON(t), t);
	}
	return r;
}
async function A(e) {
	await i();
	let t = /* @__PURE__ */ new Map(), r = (e) => {
		let r = t.get(e);
		return r || (r = n.DataUtil.loadRawJSON(e), t.set(e, r)), r;
	}, a = [];
	for (let t of e) {
		let e;
		try {
			e = await r(t.file);
		} catch (e) {
			a.push({
				prop: t.prop,
				hash: t.hash,
				enHash: null,
				enSource: null,
				via: null,
				error: e instanceof Error ? e.message : String(e)
			});
			continue;
		}
		let i = t.locator, s = i ? n.Omnidexer.getProperty(e, i.prop) : null, l = (e) => e?.name === i.name && (i.source == null || e.source === i.source), u = s?.filter((e) => e.source === i.source && e.page === i.page) || [], d = null, f = s?.find(l);
		f ? d = "name" : (f = Object.values(e).filter(Array.isArray).flat().find(l)) ? d = "name-any-array" : (f = s?.length === i.count ? s[i.ix] : null) ? d = "position" : (f = u[i.ixSourcePage]) && (d = "source-page"), a.push({
			prop: t.prop,
			hash: t.hash,
			enHash: f ? o(i.prop, f) : null,
			enSource: f ? c(f) : null,
			via: d
		});
	}
	return a;
}
async function j() {
	return await i(), ((await n.DataUtil.item.loadRawJSON())?.magicvariant ?? []).map((e) => ({
		name: e.name,
		eng: e.ENG_name ?? null,
		source: e.inherits?.source ?? e.source ?? null
	}));
}
async function Ce(e) {
	await i();
	let t = {};
	for (let r of e) {
		let e = await n.DataLoader.pCacheAndGetAllSite(r) ?? [];
		for (let i of e) {
			if (!i?._versions?.length) continue;
			let e = o(r, i);
			if (!e) continue;
			let a = n.DataUtil.generic.getVersions(i);
			(t[r] ??= {})[e] = a.map((e) => o(r, e)).filter((e) => !!e);
		}
	}
	return t;
}
// src/library/runtime/frame/edit-commands.ts
var M = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function N(e) {
	await i();
	let t = {};
	for (let r of e) t[r] = n.BrewUtil2.hasSourceJson(r) || n.PrereleaseUtil.hasSourceJson(r) ? {
		classic: !!n.SourceUtil.isClassicSource(r),
		basis: "brew-meta"
	} : n.Parser.sourceJsonToDate(r) ? {
		classic: !!n.SourceUtil.isClassicSource(r),
		basis: "date"
	} : {
		classic: null,
		basis: null
	};
	return t;
}
async function we(e) {
	return await i(), Object.fromEntries(e.map((e) => [e, {
		full: n.Parser.sourceJsonToFull(e),
		abv: n.Parser.sourceJsonToAbv(e)
	}]));
}
var Te = (e) => {
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
			hash: o(t, n)
		});
	}
	return t;
};
async function Ee() {
	return await i(), (await n.BrewUtil2.pGetBrew()).map((e, t) => ({
		docIdLocal: e.head.docIdLocal,
		filename: e.head.filename ?? null,
		url: e.head.url ?? null,
		timeAdded: e.head.timeAdded ?? 0,
		order: t,
		isEditable: !!e.head.isEditable,
		sources: (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
		props: Object.fromEntries(Object.entries(e.body ?? {}).filter(([e, t]) => !e.startsWith("_") && Array.isArray(t)).map(([e, t]) => [e, t.map((t) => t && typeof t == "object" ? o(e, t) : null)])),
		requires: Te(e.body)
	}));
}
async function P(e = null) {
	await i();
	let t = await n.BrewUtil2.pGetBrew();
	return e ? t.filter((t) => e.includes(t.head.docIdLocal)) : t;
}
async function De(e) {
	await i();
	let t = {};
	for (let { prop: r, hash: i } of e) {
		await n.DataLoader.pCacheAndGetAllBrew(r);
		let e = await n.DataLoader.pCacheAndGetHash(r, i);
		e && ((await n.DataLoader.pCacheAndGetAllSite(r) ?? []).includes(e) || (t[`${r}|${i}`] = e));
	}
	return t;
}
async function F(e, t) {
	return await i(), `data/${e}/${e}-${n.UrlUtil.encodeForHash(t.toLowerCase())}.json`;
}
async function Oe(e) {
	let t = (await P([e]))[0];
	return t ? {
		filename: t.head.filename ?? null,
		body: t.body
	} : null;
}
async function ke(e, t) {
	await i();
	try {
		return {
			fluff: await n.Renderer.utils.pGetProxyFluff({
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
async function Ae(e, t) {
	await i();
	let r = {};
	for (let i of t) {
		let t = o(e, i);
		if (t) try {
			r[t] = {
				fluff: await n.Renderer.utils.pGetProxyFluff({
					entity: i,
					prop: e
				}) ?? null,
				fluffError: null,
				engSiteHash: s(e, i)
			};
		} catch (e) {
			r[t] = {
				fluff: null,
				fluffError: e instanceof Error ? e.message : String(e),
				engSiteHash: null
			};
		}
	}
	return r;
}
async function je() {
	return await i(), n.ExcludeUtil.getList();
}
async function I() {
	return await i(), n.BrewUtil2.pGetOrCreateEditableBrewDoc();
}
async function Me(e) {
	return ((await I()).body?._meta?.sources ?? []).some((t) => String(t.json).toLowerCase() === e.json.toLowerCase()) || await n.BrewUtil2.pAddSource({
		authors: [],
		convertedBy: [],
		version: "1",
		...e
	}), ((await I()).body?._meta?.sources ?? []).map((e) => e.json);
}
async function Ne(e, t) {
	await i();
	let r = {
		...t,
		uniqueId: t.uniqueId ?? n.CryptUtil.uid()
	};
	return await n.BrewUtil2.pPersistEditableBrewEntity(e, r), {
		uniqueId: r.uniqueId,
		hash: o(e, r)
	};
}
async function Pe(e, t) {
	await i(), await n.BrewUtil2.pRemoveEditableBrewEntities(e, t);
}
async function Fe(e) {
	let t = n.MiscUtil.copyFast(await I()), r = t.body._meta.dependencies ??= {};
	for (let [t, n] of Object.entries(e)) r[t] = [.../* @__PURE__ */ new Set([...r[t] ?? [], ...n])];
	return await n.BrewUtil2.pSetEditableBrewDoc(t), r;
}
var L = {
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
}, Ie = {
	text: "doParseText",
	markdown: "doParseMarkdown",
	html: "doParseHtml"
}, R = null;
function Le() {
	return R ??= (async () => {
		await i();
		let [{ TagCondition: e, TaggerUtils: t }, { TagJsons: r }, { AcConvert: a, AttachedItemTag: o, MiscTag: s, SpellcastingTraitConvert: c }, { ConverterItem: l }, { RaceTraitTag: u }, { InstrumentBaseItemTag: d }] = await Promise.all([
			M("converter/converterutils-tags.js"),
			M("converter/converterutils-entries.js"),
			M("converter/converterutils-creature.js"),
			M("converter/converter-item.js"),
			M("converter/converterutils-race.js"),
			M("converter/converterutils-item.js")
		]), [f, p, m, h, g, _] = await Promise.all([
			n.DataUtil.spell.pLoadAll(),
			n.Renderer.item.pBuildList(),
			n.DataUtil.item.loadRawJSON(),
			n.DataUtil.legendaryGroup.pLoadAll(),
			n.DataUtil.class.loadJSON(),
			n.BrewUtil2.pGetBrewProcessed()
		]), v = p.filter((e) => !e._isItemGroup);
		c.init(f), l.init(v, g), a.init(v), t.init({
			legendaryGroups: h,
			spells: f
		}), await r.pInit({ spells: f }), u.init({ itemsRaw: m }), s.init({ items: p }), o.init({ items: p }), await e.pInit({ conditionsBrew: _.condition }), d.init({ items: v });
	})(), R.catch(() => {
		R = null;
	}), R;
}
async function Re() {
	return Object.fromEntries(Object.entries(L).map(([e, t]) => [e, t.formats]));
}
async function ze(e, t, n, r) {
	let i = L[e];
	if (!i) throw Error(`作者没有这一类的转换器：${e}`);
	if (!i.formats.includes(t)) throw Error(`作者的${e}转换器不支持这种格式：${t}（支持 ${i.formats.join("、")}）`);
	await Le();
	let a = (await M(i.file))[i.cls], o = [], s = [];
	return a[Ie[t]](n, {
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
var Be = {
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
async function Ve(e) {
	await i();
	let t = Be[e];
	if (!t) return null;
	let n = (await M(t.file))[t.cls];
	return n.prototype._getInitialState.call(Object.create(n.prototype));
}
// src/library/runtime/frame/directory-commands.ts
var He = (e) => e instanceof Error ? e.message : String(e);
async function z() {
	await i();
	let e = {}, t = /* @__PURE__ */ new Set();
	for (let r of n.DataLoader._DATA_TYPE_LOADER_LIST) for (let i of r.constructor.PROPS) {
		if (t.has(i) || i.startsWith("raw_")) continue;
		t.add(i);
		let r = n.DataUtil[i];
		if (!r || typeof r.pLoadIndex != "function") continue;
		let a = String(r._DIR ?? "");
		if (a) try {
			e[i] = {
				dir: a,
				indexPath: `data/${a}/${i.endsWith("Fluff") ? "fluff-" : ""}index.json`,
				index: await r.pLoadIndex()
			};
		} catch {}
	}
	let r;
	try {
		let e = await n.DataUtil.loadRawJSON("data/class/index.json");
		r = [...new Set(Object.values(e ?? {}).map((e) => `data/class/${String(e)}`))];
	} catch {
		r = [];
	}
	return {
		maps: e,
		classFiles: r
	};
}
async function Ue(e) {
	await i();
	let t = [];
	for (let r of e) try {
		let e = (await n.DataUtil.loadJSON(`data/${r.index}`))[r.prop] ?? [];
		t.push({
			prop: r.prop,
			items: e,
			files: await Promise.all(e.map((e) => F(r.prop, String(e.id)))),
			error: null
		});
	} catch (e) {
		t.push({
			prop: r.prop,
			items: [],
			files: [],
			error: He(e).split("\n")[0]
		});
	}
	let r = [...new Set(t.flatMap((e) => e.items.map((e) => n.SourceUtil.getEntitySource(e))))], a = r.length ? await N(r) : {}, o = {};
	for (let e of r) o[e] = {
		full: n.Parser.sourceJsonToFull(e),
		abv: n.Parser.sourceJsonToAbv(e),
		edition: a[e]
	};
	return {
		groups: n.SourceUtil.ADV_BOOK_GROUPS.map((e) => ({ ...e })),
		corpora: t,
		sources: o,
		sourceFiles: await z()
	};
}
// src/library/runtime/frame/dice-commands.ts
var B = (e) => n.Renderer.dice.lang.getTree3(e)?.tree ?? null, We = (e) => e.replace(/<[^>]+>/g, "");
async function Ge(e, t) {
	return await i(), n.Renderer.utils.getTagEntry(e.startsWith("@") ? e : `@${e}`, t);
}
async function Ke(e) {
	await i();
	let t = B(e);
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
async function qe(e) {
	if (await i(), !e.trim()) return {
		ok: !0,
		simple: !0,
		dice: [],
		mod: 0
	};
	try {
		if (!n.Renderer.dice.lang.getTree3(e, !1)?.tree) return {
			ok: !1,
			error: "作者骰子程序读不了这个骰式"
		};
	} catch (e) {
		return {
			ok: !1,
			error: We(e instanceof Error ? e.message : String(e))
		};
	}
	let t = n.Renderer.dice.tk, r = n.Renderer.dice.lang._lex3(e).lexed, a = (e) => e?.type === t.TYP_NUMBER && /^\d+$/.test(String(e.value)) ? Number(e.value) : null, o = [], s = 0, c = 0;
	for (; c < r.length;) {
		let e = 1;
		if (r[c] === t.ADD || r[c] === t.SUB) e = r[c] === t.SUB ? -1 : 1, c++;
		else if (c > 0) return {
			ok: !0,
			simple: !1
		};
		let n = a(r[c]);
		if (r[c] === t.DICE || r[c + 1] === t.DICE) {
			let i = r[c] === t.DICE ? c : c + 1, s = a(r[i + 1]);
			if (s === null) return {
				ok: !0,
				simple: !1
			};
			o.push({
				count: i === c ? 1 : n ?? 0,
				sides: s,
				sign: e
			}), c = i + 2;
		} else if (n !== null) s += e * n, c++;
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
async function V(e, t) {
	await i();
	let r = B(e);
	if (!r) return {
		status: "unsupported",
		reason: "作者骰子程序读不了这个骰式",
		formula: e
	};
	let a = n.RollerUtil._randomise, o = [], s = null;
	n.RollerUtil._randomise = (e) => {
		let { min: r = 1, max: i } = e;
		if (r > i) return 0;
		if (r === i) return i;
		if (!t) {
			let t = a.call(n.RollerUtil, e);
			return o.push({
				min: r,
				max: i,
				value: t
			}), t;
		}
		if (o.length >= t.length) throw s = {
			min: r,
			max: i
		}, Error("KERNEL_NEEDS_DICE");
		let c = t[o.length];
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
			total: r.evl(t),
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
		n.RollerUtil._randomise = a;
	}
}
// src/library/table-roll.ts
var H = "#\\$prompt_number:?([^$]*)\\$#", U = (e, t) => {
	let n = Number(e);
	return e !== void 0 && e !== "" && Number.isFinite(n) ? n : t;
};
function W(e, t = H) {
	return [...e.matchAll(new RegExp(t, "g"))].map((e) => {
		let t = {};
		for (let n of (e[1] ?? "").split(",").map((e) => e.trim()).filter(Boolean)) {
			let [e, r] = n.split("=").map((e) => e.trim());
			t[e] = r;
		}
		return {
			raw: e[0],
			title: t.title ?? null,
			default: U(t.default, 0),
			min: U(t.min, 0),
			max: t.max === void 0 || U(t.max, Infinity) === Infinity ? null : U(t.max, 0)
		};
	});
}
function Je(e, t, n = H) {
	let r = W(e, n);
	if (t.length !== r.length) throw Error(`要填 ${r.length} 个数，给了 ${t.length} 个`);
	r.forEach((e, n) => {
		let r = t[n];
		if (!Number.isFinite(r)) throw Error(`第 ${n + 1} 个数不是数字`);
		if (r < e.min || e.max !== null && r > e.max) throw Error(`${e.title ?? `第 ${n + 1} 个数`}要在 ${e.min}～${e.max ?? "不限"} 之间`);
	});
	let i = 0;
	return e.replace(new RegExp(n, "g"), () => String(t[i++]));
}
function Ye(e) {
	return e.split(";").map((e) => e.trim()).filter(Boolean);
}
function G(e, t) {
	let n = e.findIndex((e) => {
		if (!e) return !1;
		let n = e.pad && t === 100 ? 0 : t;
		return e.exact == null ? e.min != null && e.max != null && e.min <= n && n <= e.max : e.exact === n;
	});
	return n >= 0 ? n : null;
}
// src/library/runtime/frame/table-roll-commands.ts
var K = (e) => e?.type === "row" ? e.row : e;
function q(e, t) {
	let r = e.rows ?? [];
	return r.map((e, i) => {
		let a = K(e);
		return Array.isArray(a) ? n.Renderer.getRollableRow(a, {
			isForceInfiniteResults: t === n.RollerUtil.ROLL_COL_VARIABLE,
			isFirstRow: i === 0,
			isLastRow: i === r.length - 1
		})?.[0]?.roll ?? null : null;
	});
}
async function Xe(e, t) {
	await i();
	let r = n.Renderer.table.getAutoConvertedRollMode(e);
	return r ? {
		rollable: !0,
		mode: r,
		index: G(q(e, r), t)
	} : {
		rollable: !1,
		mode: r,
		index: null
	};
}
function Ze(e) {
	let t = n.Renderer.table.getHeaderRowMetas(e)?.at(-1)?.[0];
	if (typeof t != "string") return null;
	let r = n.RollerUtil.getFullRollCol(t), i = /^\{@dice (?<inner>.*)\}$/s.exec(r);
	return i?.groups ? n.Renderer.utils.getTagEntry("@dice", i.groups.inner)?.toRoll ?? null : null;
}
function J(e, t = []) {
	return typeof e == "string" ? t.push(e) : Array.isArray(e) ? e.forEach((e) => J(e, t)) : e && typeof e == "object" && Object.values(e).forEach((e) => J(e, t)), t;
}
function Qe(e) {
	let t = [];
	for (let r of J(e)) for (let e of r.matchAll(/\{@(\w+) ([^}]*)\}/g)) try {
		let r = n.Renderer.utils.getTagEntry(`@${e[1]}`, e[2]);
		typeof r?.toRoll == "string" && !/#\$prompt/.test(r.toRoll) && t.push({
			tag: `@${e[1]}`,
			text: e[2],
			formula: r.toRoll
		});
	} catch {}
	return t;
}
var $e = (e) => e.replace(/<[^>]+>/g, "");
async function et(e, t = {}) {
	await i();
	let r = n.Renderer.table.getAutoConvertedRollMode(e);
	if (!r) return { status: "not-rollable" };
	let a = Ze(e);
	if (!a) return { status: "not-rollable" };
	let o = n.Renderer.dice.RE_PROMPT.source, s = Ye(a).map((e) => ({
		formula: e,
		prompts: W(e, o)
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
			l = Je(l, t.promptValues, o);
		} catch (e) {
			return {
				status: "error",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	let u = q(e, r), d = !!e.isNameGenerator, f = n.Renderer.table.getHeaderRowMetas(e), p = d ? (f?.at(-1)?.length ?? 1) - 1 : 1, m = t.points ? [...t.points] : void 0, h = async (e) => {
		let t = await V(e, m);
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
		let r = G(u, n.total), i = r === null ? [] : K((e.rows ?? [])[r]).slice(1);
		g.push({
			label: d ? $e(String(f.at(-1)[t + 1] ?? "")) : null,
			formula: l,
			total: n.total,
			used: n.used,
			detail: n.text,
			rowIndex: r,
			cells: d ? [i[t]].filter((e) => e !== void 0) : i
		});
	}
	let _ = [];
	for (let e of g) for (let t of Qe(e.cells)) {
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
		mode: r,
		nameGenerator: d,
		rolls: g,
		inline: _
	};
}
// src/library/runtime/frame/tag-commands.ts
function Y(e) {
	let t = n.DataLoader._PROP_TO_HASH_PAGE, r = Object.entries(t).filter(([, t]) => t === e).map(([e]) => e);
	return r.length ? r : Object.keys(t).filter((t) => t.toLowerCase() === e.toLowerCase());
}
function tt(e, t) {
	let r = e === "@book" ? "book.html" : "adventure.html", { displayText: i, id: a, ixChapter: o, sectionName: s, ixNamedSection: c } = n.UidUtil.unpackUidAdventureBook(t);
	return {
		tag: e,
		name: String(i ?? a ?? ""),
		displayText: String(i ?? a ?? ""),
		source: a ?? null,
		page: r,
		hash: String(a ?? "").toLowerCase(),
		props: Y(r),
		part: {
			chapter: o ?? null,
			section: s ?? null,
			ixNamedSection: c ?? null
		}
	};
}
async function X(e, t) {
	await i();
	let r = e.startsWith("@") ? e : `@${e}`;
	if (r === "@book" || r === "@adventure") return tt(r, t);
	let a;
	try {
		a = n.Renderer.utils.getTagMeta(r, t);
	} catch {
		return null;
	}
	if (!a) return null;
	let o = a.pageHover ?? a.page, s = a.hashHover ?? a.hash, c = a.sourceHover ?? a.source;
	return {
		tag: r,
		name: String(a.name ?? ""),
		displayText: String(a.displayText ?? a.linkText ?? a.name ?? ""),
		source: c ?? null,
		page: o,
		hash: s,
		props: Y(o)
	};
}
async function nt(e) {
	await i();
	let t = /* @__PURE__ */ new Map(), r = async (e, n) => {
		let r = `${e} ${n}`, i = t.get(r);
		if (!i) {
			let a = await X(e, n);
			i = a && a.hash ? a.props.map((e) => `${e}|${a.hash}`) : [], t.set(r, i);
		}
		return i;
	}, a = async (e, t) => {
		if (e.includes("{@")) for (let i of n.Renderer.splitByTags(e)) {
			if (!i.startsWith("{@")) continue;
			let [e, o] = n.Renderer.splitFirstSpace(i.slice(1, -1));
			for (let n of await r(e, o)) t.add(n);
			await a(o, t);
		}
	}, o = async (e, t) => {
		if (typeof e == "string") return a(e, t);
		if (Array.isArray(e)) for (let n of e) await o(n, t);
		else if (e && typeof e == "object") for (let n of Object.values(e)) await o(n, t);
	}, s = [];
	for (let t of e) {
		let e = /* @__PURE__ */ new Set();
		await o(t, e), s.push([...e]);
	}
	return s;
}
// src/library/runtime/frame/image-commands.ts
var rt = {
	monster: "monster",
	object: "object",
	vehicle: "vehicle"
};
async function it(t, r) {
	await i();
	let a = rt[t];
	if (!a || !n.Renderer[a]?.getTokenUrl || !n.Renderer.generic.hasToken(r)) return null;
	let o = n.Renderer[a].getTokenUrl(r);
	return o ? /^https?:/.test(o) ? o : e(o) : null;
}
// src/library/runtime/frame/table-extract-commands.ts
async function at() {
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
async function ot(e, t, r = null) {
	await i();
	let { UtilGenTables: a, RecursiveSearchStateGeneric: s } = await at(), l = t ?? await n.DataLoader.pCacheAndGetAllSite(e) ?? [], u = [], d = [];
	for (let t of l) {
		let n = o(e, t);
		if (n) try {
			let i = new s({ isRequireIncludes: !1 }), o = t.source ?? r, l = {
				metaType: e,
				name: t.name,
				source: o,
				className: t.className ?? t.name,
				classSource: t.classSource ?? t.source,
				subclassName: t.name,
				subclassShortName: t.shortName,
				subclassSource: t.source ?? t.classSource
			};
			for (let [e, r] of Object.entries(t)) if (Array.isArray(r) && !e.startsWith("_")) try {
				for (let e of r) a._doSearch({
					state: i,
					tmpMeta: l,
					section: t.name,
					entry: e
				});
			} catch (r) {
				d.push({
					name: `${t.name ?? n}.${e}`,
					error: r instanceof Error ? r.message : String(r)
				});
			}
			if (!i._tables.length) continue;
			let f = i._tables;
			i.getStacks().table.forEach((e, i) => u.push({
				parentHash: n,
				parentName: String(t.name ?? ""),
				parentSource: c(t) ?? r,
				table: e,
				path: f[i]?.path ?? [],
				sectionIndex: f[i]?.sectionIndex ?? null
			}));
		} catch (e) {
			d.push({
				name: String(t.name ?? n),
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
async function st() {
	let e = /* @__PURE__ */ new Set(), t = [];
	for (let r of n.DataLoader._DATA_TYPE_LOADER_LIST) {
		if (e.has(r)) continue;
		e.add(r);
		let n = [...r.constructor.PROPS], i = r.constructor.PAGE ?? null;
		n.some((e) => e === "bookData" || e === "adventureData") ? t.push({
			props: n,
			page: i,
			kind: "corpus",
			index: r._filename
		}) : t.push({
			props: n,
			page: i,
			kind: "site"
		});
	}
	return t;
}
async function ct(e) {
	await i();
	let t = await n.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => o(e, t)),
		sources: t.map((e) => c(e))
	};
}
async function lt(e, t, r) {
	return await i(), ((await n.DataUtil.loadJSON(`data/${e}`))[t] ?? []).map((e) => ({
		id: e.id,
		source: n.SourceUtil.getEntitySource(e),
		hash: n.UrlUtil.URL_TO_HASH_BUILDER[r](e)
	}));
}
async function ut(e, t, r) {
	return await i(), n.DataLoader.pCacheAndGet(e, t, r, { isRequired: !0 });
}
async function dt(e) {
	await i();
	let t = e ? new Set(e.map((e) => e.toUpperCase())) : null, r = {};
	for (let e of ["search/index.json", "search/index-item.json"]) {
		let i = n.Omnidexer.decompressIndex(await n.DataUtil.loadRawJSON(e));
		for (let e of i) {
			if (t && e.s && !t.has(String(e.s).toUpperCase())) continue;
			let i = n.Parser.CAT_ID_TO_PROP[e.c] ?? `cat:${e.c}`;
			(r[i] ??= []).push(e.u);
		}
	}
	return r;
}
async function ft(e, t) {
	await i();
	let r = n.ExcludeUtil.getList().filter((t) => t.hash !== "*" || t.category !== "*" || String(t.source).toLowerCase() !== e.toLowerCase()), a = t ? [...r, {
		displayName: e,
		hash: "*",
		category: "*",
		source: e,
		isAuto: !1
	}] : r;
	return await n.ExcludeUtil.pSetList(a), await n.ExcludeUtil._pSave(), n.ExcludeUtil.getList();
}
async function pt(e, t, r) {
	return await i(), n.ExcludeUtil.isExcluded(e, t, r, { isNoCount: !0 });
}
async function mt(e, t) {
	return await i(), t.map((t) => o(e, t));
}
async function Z() {
	return [...n.__trpgFrameErrors];
}
async function ht() {
	let e = n.__trpgStorageFlush;
	return e ? e() : [];
}
var gt = {
	frameErrors: Z,
	init: i,
	loaders: st,
	parseProp: ct,
	corpusList: lt,
	parseCorpus: ut,
	searchIndexHashes: dt,
	setSourceExcluded: ft,
	isExcluded: pt,
	excludedFlags: ie,
	detail: ae,
	search: oe,
	searchIndexDump: ce,
	searchIndexLoad: le,
	searchSettings: se,
	englishLocators: k,
	englishMatch: A,
	variantTemplateNames: j,
	versionOrder: Ce,
	brewCatalog: ue,
	brewInstalled: de,
	brewStorage: fe,
	brewAddUrl: pe,
	brewAddSources: he,
	brewAddFiles: ge,
	brewDelete: _e,
	brewPull: ve,
	brewCheckUpdates: be,
	brewCorpusList: ye,
	brewPackRows: O,
	parseBrewProp: xe,
	rawHashes: mt,
	storageFlush: ht,
	editionOf: N,
	sourceNames: we,
	corpusFile: F,
	brewDocIndex: Ee,
	brewItemsByHash: De,
	brewRaw: P,
	brewExport: Oe,
	fluffOf: ke,
	fluffOfMany: Ae,
	excludeList: je,
	editableDoc: I,
	editableEnsureSource: Me,
	editablePut: Ne,
	editableRemove: Pe,
	editableAddDependencies: Fe,
	converters: Re,
	convertText: ze,
	entryTemplate: Ve,
	diceTag: Ge,
	diceStats: Ke,
	diceRead: qe,
	diceRoll: V,
	tableRow: Xe,
	tableRoll: et,
	tagMeta: X,
	tagRefs: nt,
	brewDependencyPreview: me,
	sortColumns: S,
	sortRanks: ne,
	listCells: re,
	authorFields: f,
	displayName: m,
	renderText: h,
	statblockMeta: g,
	summaryEntry: v,
	tokenPath: it,
	extractTables: ot,
	directory: Ue,
	sourceFiles: z
}, _t = [
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
	let n = e.data;
	if (e.source !== parent || !n || n.channel !== "trpg-library" || n.type !== "call") return;
	let r = (e) => parent.postMessage({
		channel: t,
		type: "result",
		frame: $,
		id: n.id,
		...e
	}, location.origin), i = gt[n.fn];
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
var vt = new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "", yt = {
	channel: t,
	type: "ready",
	frame: $,
	codeSet: vt,
	authorVersion: typeof Q.VERSION_NUMBER == "string" ? Q.VERSION_NUMBER : null,
	present: Object.fromEntries(_t.map((e) => [e, Q[e] !== void 0])),
	errors: [...Q.__trpgFrameErrors ?? []]
};
parent.postMessage(yt, location.origin);
