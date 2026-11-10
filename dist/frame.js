import { n as e } from "./images-B8OjnDg1.js";
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
var y = (e) => ["js/filter-common.js", `js/filter-${e}.js`], b = /* @__PURE__ */ new Set();
async function x(e) {
	b.has(e) || (b.add(e), await new Promise((t) => {
		let n = document.createElement("script");
		n.src = e, n.onload = () => t(), n.onerror = () => t(), document.head.appendChild(n);
	}));
}
async function S(e) {
	await i();
	let t = String(n.DataLoader.getPropPage(e) ?? "").replace(/\.html$/, "");
	if (!t) return null;
	for (let e of y(t)) await x(e);
	let r = Object.keys(n).find((e) => e.startsWith("ModalFilter") && e.toLowerCase() === `modalfilter${t}`);
	return r && typeof n[r] == "function" ? {
		Cls: n[r],
		page: t
	} : null;
}
function C(e, t) {
	let r = n.UrlUtil.getCurrentPage;
	n.UrlUtil.getCurrentPage = () => `${e}.html`;
	try {
		return t();
	} finally {
		n.UrlUtil.getCurrentPage = r;
	}
}
async function w(e) {
	let t = await S(e);
	return t ? t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})).filter((e) => !!e.sort) : [];
}
async function T(e, t) {
	let r = [...await n.DataLoader.pCacheAndGetAllSite(t) ?? [], ...await n.DataLoader.pCacheAndGetAllBrew(t) ?? []];
	return C(e.page, () => {
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
async function ee(e, t, r) {
	let i = await S(e);
	if (!i || !(await w(e)).some((e) => e.sort === t)) return null;
	let { inst: a, entities: s, items: c } = await T(i, e);
	return C(i.page, () => {
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
async function E(e) {
	let t = await S(e);
	if (!t) return null;
	let n = t.Cls.prototype._getColumnHeaders.call({}).map((e) => ({
		sort: e.getAttribute("data-sort"),
		text: e.textContent ?? "",
		title: e.getAttribute("title")
	})), { entities: r, items: i } = await T(t, e), a = {};
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
// src/library/runtime/frame/brew-commands.ts
async function D(e) {
	await i();
	let t = n.__trpgFrameErrors, r = t.length, a = await e();
	return await new Promise((e) => setTimeout(e, 50)), {
		value: a,
		errors: t.slice(r)
	};
}
var O = (e) => ({
	head: e.head,
	meta: e.body?._meta ?? null
});
function te() {
	return D(() => n.BrewUtil2.pGetCombinedIndexes());
}
async function ne() {
	return await i(), (await n.BrewUtil2.pGetBrew()).map(O);
}
async function re() {
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
async function ie(e) {
	let t = await D(() => n.BrewUtil2.pAddBrewFromUrl(e));
	return {
		...t,
		value: (t.value ?? []).map(O)
	};
}
async function ae(e) {
	let t = await D(async () => {
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
			added: t.value.added.map(O),
			notFound: t.value.notFound
		}
	};
}
async function oe(e) {
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
	let i = await D(async () => {
		let [e, t] = r.segregate((e) => n.BrewUtil2.constructor._isPrereleaseDroppedJson(e.json)), i = [];
		return e.length && i.push(...await n.PrereleaseUtil.pAddBrewsFromFiles(e) ?? []), t.length && i.push(...await n.BrewUtil2.pAddBrewsFromFiles(t) ?? []), i;
	});
	return {
		errors: i.errors,
		value: {
			added: i.value.map(O),
			notJson: t
		}
	};
}
async function se(e) {
	return D(async () => {
		let t = new Set(e), r = (await n.BrewUtil2.pGetBrew()).filter((e) => t.has(e.head.docIdLocal));
		return await n.BrewUtil2.pDeleteBrews(r), r.length;
	});
}
async function ce(e = null) {
	let t = await D(async () => {
		let t = e ? (await n.BrewUtil2.pGetBrew()).filter((t) => e.includes(t.head.docIdLocal)) : null;
		return n.BrewUtil2.pPullAllBrews({ brews: t });
	});
	return {
		...t,
		value: (t.value ?? []).map(O)
	};
}
async function le(e, t) {
	return await i(), ((await n.BrewUtil2.pGetBrewProcessed())?.[e] ?? []).map((e) => ({
		id: e.id,
		name: e.name,
		source: n.SourceUtil.getEntitySource(e),
		hash: n.UrlUtil.URL_TO_HASH_BUILDER[t](e)
	}));
}
async function ue(e = null) {
	return D(async () => {
		let t = n.BrewUtil2, r = (await t.pGetBrew()).filter((n) => t.isPullable(n) && (!e || e.includes(n.head.docIdLocal))), i = [];
		for (let e of r) {
			let t = e.body._meta?.dateLastModified ?? 0;
			try {
				let r = (await n.DataUtil.loadRawJSON(e.head.url, { isBustCache: !0 }))._meta?.dateLastModified ?? 0;
				i.push({
					docIdLocal: e.head.docIdLocal,
					filename: e.head.filename ?? null,
					url: e.head.url,
					local: t,
					remote: r,
					hasUpdate: r > t,
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
					error: n instanceof Error ? n.message : String(n)
				});
			}
		}
		return i;
	});
}
async function de(e) {
	await i();
	let t = await n.DataLoader.pCacheAndGetAllBrew(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => o(e, t)),
		sources: t.map((e) => c(e))
	};
}
// src/library/runtime/frame/english-commands.ts
async function fe() {
	await i();
	let e = [], t = async (t, r, i) => {
		let a = new n.Omnidexer();
		await a.pAddToIndex(t, r, {
			isNoFilter: !0,
			isIncludeEntityLocator: !0
		});
		for (let t of a.getIndex().x) t._entityLocator && e.push({
			prop: n.Parser.pageCategoryToProp(t.c),
			hash: t.u,
			file: i,
			locator: t._entityLocator
		});
	};
	for (let e of n.Omnidexer.TO_INDEX__FROM_INDEX_JSON) {
		let r = await n.DataUtil.loadRawJSON(`data/${e.dir}/index.json`);
		for (let i of Object.values(r)) {
			let r = `data/${e.dir}/${i}`;
			await t(e, await n.DataUtil.loadRawJSON(r), r);
		}
	}
	for (let e of n.Omnidexer.TO_INDEX) {
		let r = `data/${e.file}`;
		await t(e, await n.DataUtil.loadJSON(r), r);
	}
	return e;
}
async function pe(e) {
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
async function me() {
	return await i(), ((await n.DataUtil.item.loadRawJSON())?.magicvariant ?? []).map((e) => ({
		name: e.name,
		eng: e.ENG_name ?? null,
		source: e.inherits?.source ?? e.source ?? null
	}));
}
async function he(e) {
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
// src/library/runtime/frame/read-commands.ts
function k(e, t, r) {
	let i = c(t);
	return i ? n.DataLoader.getPropPage(e) === n.UrlUtil.PG_ITEMS && n.Renderer.item.isExcluded(t, { hash: r }) ? !0 : n.ExcludeUtil.isExcluded(r ?? "", t.__prop ?? e, i, { isNoCount: !0 }) : !1;
}
async function ge(e, t = "site") {
	if (await i(), !n.ExcludeUtil.getList().length) return {
		hashes: [],
		excluded: null
	};
	let r = await (t === "brew" ? n.DataLoader.pCacheAndGetAllBrew(e) : n.DataLoader.pCacheAndGetAllSite(e)) ?? [], a = r.map((t) => o(e, t));
	return {
		hashes: a,
		excluded: r.map((t, n) => k(e, t, a[n]))
	};
}
async function _e(e, t, r) {
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
		excluded: k(e, a, t),
		fluff: o,
		fluffError: l,
		engSiteHash: s(e, a)
	};
}
async function ve(e, t = null) {
	await i();
	let r = t === null ? null : await A(), a = r?.isShowLegacy;
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
async function A() {
	return (await import(
		/* @vite-ignore */
		new URL("js/omnisearch/omnisearch-state.js", location.href).href
)).OmnisearchState;
}
async function j(e = {}) {
	await i();
	let t = await A();
	for (let [n, r] of Object.entries(e)) {
		if (!(n in t._DEFAULT_STATE)) throw Error(`作者的搜索设置里没有这一项：${n}`);
		n === "partneredMode" ? t.setPartneredMode(r) : t[n] = r;
	}
	return t._getComp().toObject();
}
async function M() {
	await i();
	let e = n.OmnisearchBacking;
	return await e._pInit(), {
		json: JSON.stringify(e._searchIndex.toJSON()),
		maxId: e._maxId ?? null,
		categoryCounts: e._CATEGORY_COUNTS ?? {},
		adventureBookLookup: e._adventureBookLookup ?? {}
	};
}
async function N(e) {
	await i();
	let t = n.OmnisearchBacking;
	return t._searchIndex = n.elasticlunr.Index.load(JSON.parse(e.json)), t._maxId = e.maxId, t._CATEGORY_COUNTS = e.categoryCounts, t._adventureBookLookup = e.adventureBookLookup, t._pLoadSearch = Promise.resolve(), t._initReInCategory(), !0;
}
// src/library/runtime/frame/edit-commands.ts
var P = (e) => import(
	/* @vite-ignore */
	new URL(`js/${e}`, location.href).href
);
async function F(e) {
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
async function ye(e) {
	return await i(), Object.fromEntries(e.map((e) => [e, {
		full: n.Parser.sourceJsonToFull(e),
		abv: n.Parser.sourceJsonToAbv(e)
	}]));
}
async function be() {
	return await i(), (await n.BrewUtil2.pGetBrew()).map((e, t) => ({
		docIdLocal: e.head.docIdLocal,
		filename: e.head.filename ?? null,
		url: e.head.url ?? null,
		timeAdded: e.head.timeAdded ?? 0,
		order: t,
		isEditable: !!e.head.isEditable,
		sources: (e.body?._meta?.sources ?? []).map((e) => e?.json).filter(Boolean),
		props: Object.fromEntries(Object.entries(e.body ?? {}).filter(([e, t]) => !e.startsWith("_") && Array.isArray(t)).map(([e, t]) => [e, t.map((t) => t && typeof t == "object" ? o(e, t) : null)]))
	}));
}
async function I(e = null) {
	await i();
	let t = await n.BrewUtil2.pGetBrew();
	return e ? t.filter((t) => e.includes(t.head.docIdLocal)) : t;
}
async function xe(e) {
	await i();
	let t = {};
	for (let { prop: r, hash: i } of e) {
		await n.DataLoader.pCacheAndGetAllBrew(r);
		let e = await n.DataLoader.pCacheAndGetHash(r, i);
		e && ((await n.DataLoader.pCacheAndGetAllSite(r) ?? []).includes(e) || (t[`${r}|${i}`] = e));
	}
	return t;
}
async function L(e, t) {
	return await i(), `data/${e}/${e}-${n.UrlUtil.encodeForHash(t.toLowerCase())}.json`;
}
async function Se(e) {
	let t = (await I([e]))[0];
	return t ? {
		filename: t.head.filename ?? null,
		body: t.body
	} : null;
}
async function Ce(e, t) {
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
async function we(e, t) {
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
async function Te() {
	return await i(), n.ExcludeUtil.getList();
}
async function R() {
	return await i(), n.BrewUtil2.pGetOrCreateEditableBrewDoc();
}
async function Ee(e) {
	return ((await R()).body?._meta?.sources ?? []).some((t) => String(t.json).toLowerCase() === e.json.toLowerCase()) || await n.BrewUtil2.pAddSource({
		authors: [],
		convertedBy: [],
		version: "1",
		...e
	}), ((await R()).body?._meta?.sources ?? []).map((e) => e.json);
}
async function De(e, t) {
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
async function Oe(e, t) {
	await i(), await n.BrewUtil2.pRemoveEditableBrewEntities(e, t);
}
async function ke(e) {
	let t = n.MiscUtil.copyFast(await R()), r = t.body._meta.dependencies ??= {};
	for (let [t, n] of Object.entries(e)) r[t] = [.../* @__PURE__ */ new Set([...r[t] ?? [], ...n])];
	return await n.BrewUtil2.pSetEditableBrewDoc(t), r;
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
}, Ae = {
	text: "doParseText",
	markdown: "doParseMarkdown",
	html: "doParseHtml"
}, B = null;
function je() {
	return B ??= (async () => {
		await i();
		let [{ TagCondition: e, TaggerUtils: t }, { TagJsons: r }, { AcConvert: a, AttachedItemTag: o, MiscTag: s, SpellcastingTraitConvert: c }, { ConverterItem: l }, { RaceTraitTag: u }, { InstrumentBaseItemTag: d }] = await Promise.all([
			P("converter/converterutils-tags.js"),
			P("converter/converterutils-entries.js"),
			P("converter/converterutils-creature.js"),
			P("converter/converter-item.js"),
			P("converter/converterutils-race.js"),
			P("converter/converterutils-item.js")
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
	})(), B.catch(() => {
		B = null;
	}), B;
}
async function Me() {
	return Object.fromEntries(Object.entries(z).map(([e, t]) => [e, t.formats]));
}
async function Ne(e, t, n, r) {
	let i = z[e];
	if (!i) throw Error(`作者没有这一类的转换器：${e}`);
	if (!i.formats.includes(t)) throw Error(`作者的${e}转换器不支持这种格式：${t}（支持 ${i.formats.join("、")}）`);
	await je();
	let a = (await P(i.file))[i.cls], o = [], s = [];
	return a[Ae[t]](n, {
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
var Pe = {
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
async function Fe(e) {
	await i();
	let t = Pe[e];
	if (!t) return null;
	let n = (await P(t.file))[t.cls];
	return n.prototype._getInitialState.call(Object.create(n.prototype));
}
// src/library/runtime/frame/directory-commands.ts
var Ie = (e) => e instanceof Error ? e.message : String(e);
async function Le(e) {
	await i();
	let t = [];
	for (let r of e) try {
		let e = (await n.DataUtil.loadJSON(`data/${r.index}`))[r.prop] ?? [];
		t.push({
			prop: r.prop,
			items: e,
			files: await Promise.all(e.map((e) => L(r.prop, String(e.id)))),
			error: null
		});
	} catch (e) {
		t.push({
			prop: r.prop,
			items: [],
			files: [],
			error: Ie(e).split("\n")[0]
		});
	}
	let r = [...new Set(t.flatMap((e) => e.items.map((e) => n.SourceUtil.getEntitySource(e))))], a = r.length ? await F(r) : {}, o = {};
	for (let e of r) o[e] = {
		full: n.Parser.sourceJsonToFull(e),
		abv: n.Parser.sourceJsonToAbv(e),
		edition: a[e]
	};
	return {
		groups: n.SourceUtil.ADV_BOOK_GROUPS.map((e) => ({ ...e })),
		corpora: t,
		sources: o
	};
}
// src/library/runtime/frame/dice-commands.ts
var V = (e) => n.Renderer.dice.lang.getTree3(e)?.tree ?? null, Re = (e) => e.replace(/<[^>]+>/g, "");
async function ze(e, t) {
	return await i(), n.Renderer.utils.getTagEntry(e.startsWith("@") ? e : `@${e}`, t);
}
async function Be(e) {
	await i();
	let t = V(e);
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
async function Ve(e) {
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
			error: Re(e instanceof Error ? e.message : String(e))
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
async function H(e, t) {
	await i();
	let r = V(e);
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
var U = "#\\$prompt_number:?([^$]*)\\$#", W = (e, t) => {
	let n = Number(e);
	return e !== void 0 && e !== "" && Number.isFinite(n) ? n : t;
};
function G(e, t = U) {
	return [...e.matchAll(new RegExp(t, "g"))].map((e) => {
		let t = {};
		for (let n of (e[1] ?? "").split(",").map((e) => e.trim()).filter(Boolean)) {
			let [e, r] = n.split("=").map((e) => e.trim());
			t[e] = r;
		}
		return {
			raw: e[0],
			title: t.title ?? null,
			default: W(t.default, 0),
			min: W(t.min, 0),
			max: t.max === void 0 || W(t.max, Infinity) === Infinity ? null : W(t.max, 0)
		};
	});
}
function He(e, t, n = U) {
	let r = G(e, n);
	if (t.length !== r.length) throw Error(`要填 ${r.length} 个数，给了 ${t.length} 个`);
	r.forEach((e, n) => {
		let r = t[n];
		if (!Number.isFinite(r)) throw Error(`第 ${n + 1} 个数不是数字`);
		if (r < e.min || e.max !== null && r > e.max) throw Error(`${e.title ?? `第 ${n + 1} 个数`}要在 ${e.min}～${e.max ?? "不限"} 之间`);
	});
	let i = 0;
	return e.replace(new RegExp(n, "g"), () => String(t[i++]));
}
function Ue(e) {
	return e.split(";").map((e) => e.trim()).filter(Boolean);
}
function K(e, t) {
	let n = e.findIndex((e) => {
		if (!e) return !1;
		let n = e.pad && t === 100 ? 0 : t;
		return e.exact == null ? e.min != null && e.max != null && e.min <= n && n <= e.max : e.exact === n;
	});
	return n >= 0 ? n : null;
}
// src/library/runtime/frame/table-roll-commands.ts
var q = (e) => e?.type === "row" ? e.row : e;
function J(e, t) {
	let r = e.rows ?? [];
	return r.map((e, i) => {
		let a = q(e);
		return Array.isArray(a) ? n.Renderer.getRollableRow(a, {
			isForceInfiniteResults: t === n.RollerUtil.ROLL_COL_VARIABLE,
			isFirstRow: i === 0,
			isLastRow: i === r.length - 1
		})?.[0]?.roll ?? null : null;
	});
}
async function We(e, t) {
	await i();
	let r = n.Renderer.table.getAutoConvertedRollMode(e);
	return r ? {
		rollable: !0,
		mode: r,
		index: K(J(e, r), t)
	} : {
		rollable: !1,
		mode: r,
		index: null
	};
}
function Ge(e) {
	let t = n.Renderer.table.getHeaderRowMetas(e)?.at(-1)?.[0];
	if (typeof t != "string") return null;
	let r = n.RollerUtil.getFullRollCol(t), i = /^\{@dice (?<inner>.*)\}$/s.exec(r);
	return i?.groups ? n.Renderer.utils.getTagEntry("@dice", i.groups.inner)?.toRoll ?? null : null;
}
function Y(e, t = []) {
	return typeof e == "string" ? t.push(e) : Array.isArray(e) ? e.forEach((e) => Y(e, t)) : e && typeof e == "object" && Object.values(e).forEach((e) => Y(e, t)), t;
}
function Ke(e) {
	let t = [];
	for (let r of Y(e)) for (let e of r.matchAll(/\{@(\w+) ([^}]*)\}/g)) try {
		let r = n.Renderer.utils.getTagEntry(`@${e[1]}`, e[2]);
		typeof r?.toRoll == "string" && !/#\$prompt/.test(r.toRoll) && t.push({
			tag: `@${e[1]}`,
			text: e[2],
			formula: r.toRoll
		});
	} catch {}
	return t;
}
var qe = (e) => e.replace(/<[^>]+>/g, "");
async function Je(e, t = {}) {
	await i();
	let r = n.Renderer.table.getAutoConvertedRollMode(e);
	if (!r) return { status: "not-rollable" };
	let a = Ge(e);
	if (!a) return { status: "not-rollable" };
	let o = n.Renderer.dice.RE_PROMPT.source, s = Ue(a).map((e) => ({
		formula: e,
		prompts: G(e, o)
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
			l = He(l, t.promptValues, o);
		} catch (e) {
			return {
				status: "error",
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	let u = J(e, r), d = !!e.isNameGenerator, f = n.Renderer.table.getHeaderRowMetas(e), p = d ? (f?.at(-1)?.length ?? 1) - 1 : 1, m = t.points ? [...t.points] : void 0, h = async (e) => {
		let t = await H(e, m);
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
		let r = K(u, n.total), i = r === null ? [] : q((e.rows ?? [])[r]).slice(1);
		g.push({
			label: d ? qe(String(f.at(-1)[t + 1] ?? "")) : null,
			formula: l,
			total: n.total,
			used: n.used,
			detail: n.text,
			rowIndex: r,
			cells: d ? [i[t]].filter((e) => e !== void 0) : i
		});
	}
	let _ = [];
	for (let e of g) for (let t of Ke(e.cells)) {
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
function X(e) {
	let t = n.DataLoader._PROP_TO_HASH_PAGE, r = Object.entries(t).filter(([, t]) => t === e).map(([e]) => e);
	return r.length ? r : Object.keys(t).filter((t) => t.toLowerCase() === e.toLowerCase());
}
function Ye(e, t) {
	let r = e === "@book" ? "book.html" : "adventure.html", { displayText: i, id: a, ixChapter: o, sectionName: s } = n.UidUtil.unpackUidAdventureBook(t);
	return {
		tag: e,
		name: String(i ?? a ?? ""),
		displayText: String(i ?? a ?? ""),
		source: a ?? null,
		page: r,
		hash: String(a ?? "").toLowerCase(),
		props: X(r),
		part: {
			chapter: o ?? null,
			section: s ?? null
		}
	};
}
async function Xe(e, t) {
	await i();
	let r = e.startsWith("@") ? e : `@${e}`;
	if (r === "@book" || r === "@adventure") return Ye(r, t);
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
		props: X(o)
	};
}
// src/library/runtime/frame/image-commands.ts
var Ze = {
	monster: "monster",
	object: "object",
	vehicle: "vehicle"
};
async function Qe(t, r) {
	await i();
	let a = Ze[t];
	if (!a || !n.Renderer[a]?.getTokenUrl || !n.Renderer.generic.hasToken(r)) return null;
	let o = n.Renderer[a].getTokenUrl(r);
	return o ? /^https?:/.test(o) ? o : e(o) : null;
}
// src/library/runtime/frame/table-extract-commands.ts
async function $e() {
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
async function et(e) {
	await i();
	let { UtilGenTables: t, RecursiveSearchStateGeneric: r } = await $e(), a = await n.DataLoader.pCacheAndGetAllSite(e) ?? [], s = [], l = [];
	for (let n of a) {
		let i = o(e, n);
		if (i) try {
			let a = new r({ isRequireIncludes: !1 }), o = {
				metaType: e,
				name: n.name,
				source: n.source,
				className: n.className ?? n.name,
				classSource: n.classSource ?? n.source,
				subclassName: n.name,
				subclassShortName: n.shortName,
				subclassSource: n.source ?? n.classSource
			};
			for (let [e, r] of Object.entries(n)) if (Array.isArray(r) && !e.startsWith("_")) try {
				for (let e of r) t._doSearch({
					state: a,
					tmpMeta: o,
					section: n.name,
					entry: e
				});
			} catch (t) {
				l.push({
					name: `${n.name ?? i}.${e}`,
					error: t instanceof Error ? t.message : String(t)
				});
			}
			if (!a._tables.length) continue;
			let u = a._tables;
			a.getStacks().table.forEach((e, t) => s.push({
				parentHash: i,
				parentName: String(n.name ?? ""),
				parentSource: c(n),
				table: e,
				path: u[t]?.path ?? [],
				sectionIndex: u[t]?.sectionIndex ?? null
			}));
		} catch (e) {
			l.push({
				name: String(n.name ?? i),
				error: e instanceof Error ? e.message : String(e)
			});
		}
	}
	return {
		tables: s,
		skipped: l
	};
}
// src/library/runtime/frame/commands.ts
async function tt() {
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
async function nt(e) {
	await i();
	let t = await n.DataLoader.pCacheAndGetAllSite(e) ?? [];
	return {
		items: t,
		hashes: t.map((t) => o(e, t)),
		sources: t.map((e) => c(e))
	};
}
async function rt(e, t, r) {
	return await i(), ((await n.DataUtil.loadJSON(`data/${e}`))[t] ?? []).map((e) => ({
		id: e.id,
		source: n.SourceUtil.getEntitySource(e),
		hash: n.UrlUtil.URL_TO_HASH_BUILDER[r](e)
	}));
}
async function Z(e, t, r) {
	return await i(), n.DataLoader.pCacheAndGet(e, t, r, { isRequired: !0 });
}
async function it() {
	await i();
	let e = {};
	for (let t of ["search/index.json", "search/index-item.json"]) {
		let r = n.Omnidexer.decompressIndex(await n.DataUtil.loadRawJSON(t));
		for (let t of r) {
			let r = n.Parser.CAT_ID_TO_PROP[t.c] ?? `cat:${t.c}`;
			(e[r] ??= []).push(t.u);
		}
	}
	return e;
}
async function at(e, t) {
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
async function ot(e, t, r) {
	return await i(), n.ExcludeUtil.isExcluded(e, t, r, { isNoCount: !0 });
}
async function st(e, t) {
	return await i(), t.map((t) => o(e, t));
}
async function ct() {
	return [...n.__trpgFrameErrors];
}
var lt = {
	frameErrors: ct,
	init: i,
	loaders: tt,
	parseProp: nt,
	corpusList: rt,
	parseCorpus: Z,
	searchIndexHashes: it,
	setSourceExcluded: at,
	isExcluded: ot,
	excludedFlags: ge,
	detail: _e,
	search: ve,
	searchIndexDump: M,
	searchIndexLoad: N,
	searchSettings: j,
	englishLocators: fe,
	englishMatch: pe,
	variantTemplateNames: me,
	versionOrder: he,
	brewCatalog: te,
	brewInstalled: ne,
	brewStorage: re,
	brewAddUrl: ie,
	brewAddSources: ae,
	brewAddFiles: oe,
	brewDelete: se,
	brewPull: ce,
	brewCheckUpdates: ue,
	brewCorpusList: le,
	parseBrewProp: de,
	rawHashes: st,
	editionOf: F,
	sourceNames: ye,
	corpusFile: L,
	brewDocIndex: be,
	brewItemsByHash: xe,
	brewRaw: I,
	brewExport: Se,
	fluffOf: Ce,
	fluffOfMany: we,
	excludeList: Te,
	editableDoc: R,
	editableEnsureSource: Ee,
	editablePut: De,
	editableRemove: Oe,
	editableAddDependencies: ke,
	converters: Me,
	convertText: Ne,
	entryTemplate: Fe,
	diceTag: ze,
	diceStats: Be,
	diceRead: Ve,
	diceRoll: H,
	tableRow: We,
	tableRoll: Je,
	tagMeta: Xe,
	sortColumns: w,
	sortRanks: ee,
	listCells: E,
	authorFields: f,
	displayName: m,
	renderText: h,
	statblockMeta: g,
	summaryEntry: v,
	tokenPath: Qe,
	extractTables: et,
	directory: Le
}, ut = [
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
	}, location.origin), i = lt[n.fn];
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
var dt = new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "", ft = {
	channel: t,
	type: "ready",
	frame: $,
	codeSet: dt,
	authorVersion: typeof Q.VERSION_NUMBER == "string" ? Q.VERSION_NUMBER : null,
	present: Object.fromEntries(ut.map((e) => [e, Q[e] !== void 0])),
	errors: [...Q.__trpgFrameErrors ?? []]
};
parent.postMessage(ft, location.origin);
