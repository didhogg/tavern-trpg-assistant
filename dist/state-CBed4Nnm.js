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
export { s as a, o as i, i as n, e as o, r, t as s, a as t };
