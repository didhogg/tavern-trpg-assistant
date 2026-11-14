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
export { i as a, s as c, a as i, e as l, d as n, r as o, c as r, o as s, u as t, t as u };
