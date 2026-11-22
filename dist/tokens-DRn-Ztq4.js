// src/core/saves/state.ts
function e(e) {
	return e?.propDroppable && e.hash ? `ref:${String(e.propDroppable)}|${String(e.hash)}` : null;
}
function t(e) {
	return e?.kind && e.hash ? `ref:${String(e.kind)}|${String(e.hash)}` : null;
}
function n(t, n) {
	return t._id === n ? !0 : n.startsWith("ref:") ? e(i(t.flags) && i(t.flags.plutonium) ? t.flags.plutonium : null) === n : !1;
}
function r(e, t) {
	return e.find((e) => n(e, t)) ?? null;
}
var i = (e) => !!e && typeof e == "object" && !Array.isArray(e), a = (e) => structuredClone(e);
function o(e, t) {
	if (i(e) && i(t)) {
		let n = {};
		for (let r of Object.keys(t)) JSON.stringify(e[r]) !== JSON.stringify(t[r]) && (n[r] = i(e[r]) && i(t[r]) ? o(e[r], t[r]) : a(t[r]));
		for (let r of Object.keys(e)) r in t || (n[`-=${r}`] = null);
		return n;
	}
	return JSON.stringify(e) === JSON.stringify(t) ? {} : a(t);
}
function s(e, t) {
	for (let [n, r] of Object.entries(t)) n.startsWith("-=") ? delete e[n.slice(2)] : i(r) && i(e[n]) ? s(e[n], r) : e[n] = a(r);
}
// src/library/brew-health.ts
function c(e) {
	if (e.requires?.length) return e.requires;
	let t = [];
	for (let n of ["dependencies", "includes"]) for (let [r, i] of Object.entries(e[n] ?? {})) for (let e of Array.isArray(i) ? i : []) t.push({
		kind: n === "dependencies" ? "dependency" : "include",
		prop: r,
		source: String(e)
	});
	for (let [n, r] of Object.entries(e.otherSources ?? {})) for (let e of Object.keys(r ?? {})) t.push({
		kind: "otherSource",
		prop: n,
		source: e
	});
	return t;
}
var l = (e) => e.sources.map((e) => e.toLowerCase());
function u(e, t, n) {
	let r = e.source.toLowerCase();
	return t.has(r) ? !0 : n.some((t) => l(t).includes(r) ? e.hash ? (t.hashes[e.prop] ?? []).includes(e.hash) : (t.props[e.prop] ?? 0) > 0 || (t.hashes[e.prop]?.length ?? 0) > 0 : !1);
}
function d(e, t, n, r) {
	let i = new Set(l(e)), a = n.filter((t) => t.docIdLocal !== e.docIdLocal), o = /* @__PURE__ */ new Map();
	for (let n of c(e)) {
		let e = n.source.toLowerCase();
		if (i.has(e)) continue;
		let s = u(n, t, a), c = o.get(e) ?? {
			source: n.source,
			props: [],
			kind: r(n.source) || t.has(e) ? "official" : "brew",
			ok: !0
		};
		c.props.includes(n.prop) || c.props.push(n.prop), c.ok = c.ok && s, c.kind === "brew" && c.ok && (c.provider = a.find((t) => l(t).includes(e))?.filename ?? null), o.set(e, c);
	}
	return [...o.values()];
}
// src/rules/kernel/shown.ts
var f = (e) => !!e && typeof e == "object" && typeof e.$t == "string", p = (e) => ({
	$t: "library",
	text: e
}), m = (e, t) => ({
	$t: "entry",
	text: e,
	...t ? { fallback: t } : {}
}), h = (e, t) => ({
	$t: "author",
	text: e,
	at: t
});
function g(e, t, n = !1) {
	return {
		$t: "name",
		text: e,
		ids: [...new Map((Array.isArray(t) ? t : [t]).map((e) => [`${e.propDroppable}|${e.source?.toLowerCase()}|${e.hash}`, e])).values()],
		...n ? { strict: !0 } : {}
	};
}
var _ = (e) => ({
	$t: "requirement",
	key: e
}), v = (e) => ({
	$t: "data",
	text: e
}), y = (e, ...t) => ({
	$t: "plugin",
	text: e,
	...t.length ? { args: t } : {}
}), b = (e, t) => ({
	$t: "join",
	parts: e,
	sep: t
}), x = (e, t) => ({
	$t: "proficiency",
	text: e,
	key: e,
	count: t
}), S = (e, t, n) => ({
	$t: "value",
	text: e,
	group: [...new Set(t)],
	...n ? { fallback: n } : {}
}), C = ":host{--surface:#fff9f0;--bg:#fff9f0;--bg-side:#f4ecdd;--bg-sunk:#faf5ec;--bg-hover:#e9ddcb;--line:#ded3c2;--text:#39291a;--text2:#73634e;--text3:#857c6e;--line-ctrl:#ded3c2;--side:#30342e;--side-ink:#f8f2e7;--side-ink2:#d0c9bb;--side-hover:#4a5045;--side-active:#8a3529;--side-line:#555a4d;--head-bg:#30342e;--head-ink:#f8f2e7;--head-ink2:#d0c9bb;--head-line:#555a4d;--head-hover:#4a5045;--primary:#8a3529;--primary-hover:#a44736;--primary-pressed:#6d291f;--primary-text:#8a3529;--primary-tint:#ede3d3;--primary-tint-line:#ded3c2;--hero-bg:#30342e;--hero-ink:#f8f2e7;--hero-ink2:#d0c9bb;--danger-text:#a33b2b;--danger-bg:#f4ecdd;--danger-line:#a33b2b;--success-text:#4f8050;--success-bg:#f4ecdd;--warn-text:#73634e;--warn-bg:#ede3d3;--accent:#b89a54;--accent-text:#b89a54;--on-accent:#39291a;--focus:#b89a54;--on-primary:#fff;--disabled-bg:#faf5ec;--disabled-text:#857c6e}@media (prefers-color-scheme:dark){:host{--surface:#3b332b;--bg:#302a24;--bg-side:#26221e;--bg-sunk:#26221e;--bg-hover:#493e34;--line:#5b4d40;--text:#f2e1ca;--text2:#dbb594;--line-ctrl:#ad7f58;--side:#26221e;--side-ink:#f2e1ca;--side-ink2:#dbb594;--side-hover:#302a24;--side-active:#3b332b;--side-line:#3b332b;--primary:#d13415;--primary-hover:#d73c1d;--primary-pressed:#b43118;--primary-text:#f67c60;--primary-tint:#302a24;--primary-tint-line:#73614e;--hero-bg:#1c1917;--hero-ink:#f2e1ca;--hero-ink2:#dbb594;--head-bg:#3b332b;--head-ink:#f2e1ca;--head-ink2:#dbb594;--head-line:#5b4d40;--head-hover:#493e34;--danger-text:#ec5d5e;--danger-bg:#26221e;--danger-line:#e5484d;--success-text:#5fbf71;--success-bg:#26221e;--warn-text:#edc055;--warn-bg:#26221e;--text3:#ad7f58;--accent:#e9c162;--accent-text:#dbb594;--on-accent:#4f3422;--on-primary:#fff;--disabled-bg:#26221e;--disabled-text:#ad7f58;--focus:#f67c60}}", w = ":host{all:initial;pointer-events:inherit;--font-sans:\"PingFang SC\", \"Hiragino Sans GB\", \"Noto Sans SC\", \"Source Han Sans SC\", \"Microsoft YaHei UI\", \"Microsoft YaHei\", system-ui, sans-serif;--font-serif:\"Noto Serif SC\", \"Source Han Serif SC\", \"Songti SC\", \"STSong\", \"SimSun\", Georgia, serif;--fs-xs:12px;--fs-sm:13px;--fs-md:14px;--fs-lg:16px;--fs-xl:18px;--fs-2xl:22px;--fs-3xl:28px;--lh-body:1.6;--lh-tight:1.3;--lh-ui:1.4;--fw-regular:400;--fw-medium:500;--fw-semibold:600;--fw-bold:700;--sp-1:4px;--sp-2:8px;--sp-3:12px;--sp-4:16px;--sp-5:20px;--sp-6:24px;--sp-8:32px;--sp-10:40px;--r-xs:4px;--r-sm:6px;--r-md:8px;--r-lg:12px;--r-pill:999px;--hit:36px;--hit-touch:44px;--icon-sm:16px;--icon-md:18px;--icon-lg:24px;--border:1px;--border-strong:1.5px;--side-w:200px;--head-h:48px;--window-w:960px;--window-h:640px;--shadow-rgb:60 46 28;--shadow-1:0 1px 2px rgb(var(--shadow-rgb) / 10%), 0 0 0 1px rgb(var(--shadow-rgb) / 3%);--shadow-2:0 4px 14px rgb(var(--shadow-rgb) / 16%), 0 1px 3px rgb(var(--shadow-rgb) / 10%);--shadow-3:0 14px 40px rgb(var(--shadow-rgb) / 26%), 0 2px 6px rgb(var(--shadow-rgb) / 12%);--dur-press:80ms;--dur-fast:.14s;--dur-base:.2s;--dur-slow:.28s;--dur-spin:.9s;--dur-ring:.42s;--ease-out:cubic-bezier(.2, .8, .2, 1);--ease-in:cubic-bezier(.4, 0, 1, 1);--ease-std:cubic-bezier(.4, 0, .2, 1);--z-window:10;--z-modal:20;--z-pop:30;--z-toast:60;font-family:var(--font-sans);font-size:var(--fs-md);line-height:var(--lh-body);color:var(--text);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}@media (prefers-color-scheme:dark){:host{--shadow-rgb:0 0 0}}";
export { t as C, e as S, a as _, m as a, o as b, b as c, x as d, _ as f, c as g, d as h, h as i, g as l, u as m, C as n, p as o, S as p, v as r, f as s, w as t, y as u, i as v, s as x, r as y };
