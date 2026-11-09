import { a as e, i as t, n, o as r, s as i, t as a } from "./state-CBed4Nnm.js";
import { i as o, n as s, r as c, t as l } from "./protocol-03CO7Rhf.js";
// \0rolldown/runtime.js
var u = Object.create, d = Object.defineProperty, f = Object.getOwnPropertyDescriptor, p = Object.getOwnPropertyNames, m = Object.getPrototypeOf, h = Object.prototype.hasOwnProperty, g = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), _ = (e, t) => {
	let n = {};
	for (var r in e) d(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || d(n, Symbol.toStringTag, { value: "Module" }), n;
}, v = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = p(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !h.call(e, s) && s !== n && d(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = f(t, s)) || r.enumerable
	});
	return e;
}, y = (e, t, n) => (n = e == null ? {} : u(m(e)), v(t || !e || !e.__esModule || !h.call(e, "default") ? d(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), b = "tavern-trpg-assistant";
function x() {
	let e = window.SillyTavern;
	if (!e?.getContext) throw Error("SillyTavern 宿主未就绪");
	return e.getContext();
}
function S() {
	return document.getElementById("send_textarea");
}
function C(e = 3e4) {
	return new Promise((t, n) => {
		let r = () => !!window.SillyTavern?.getContext && !!S();
		if (r()) {
			t();
			return;
		}
		let i = new MutationObserver(() => {
			r() && (window.clearTimeout(a), i.disconnect(), t());
		}), a = window.setTimeout(() => {
			i.disconnect(), n(/* @__PURE__ */ Error("等待酒馆界面超时"));
		}, e);
		i.observe(document.documentElement, {
			childList: !0,
			subtree: !0
		});
	});
}
async function w(e = 5e3) {
	let t = window.__TAURITAVERN__;
	if (!t) return null;
	let n = t.ready ?? window.__TAURITAVERN_MAIN_READY__;
	return n && await Promise.race([n, new Promise((t, n) => window.setTimeout(() => n(/* @__PURE__ */ Error("TauriTavern ready 超时")), e))]), t;
}
function T(e, t, n) {
	return e.event_types?.[t] ?? n;
}
function E(e, t, n) {
	return e.eventSource.on(t, n), () => {
		(e.eventSource.removeListener ?? e.eventSource.off)?.call(e.eventSource, t, n);
	};
}
function D(e, t) {
	let n = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
	if (!n) throw Error("无法获取输入框 value 写入器");
	n.call(e, t), e.dispatchEvent(new Event("input", { bubbles: !0 }));
}
// node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function ee(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var O = {}, te = [], ne = () => {}, re = () => !1, ie = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), ae = (e) => e.startsWith("onUpdate:"), oe = Object.assign, se = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, ce = Object.prototype.hasOwnProperty, le = (e, t) => ce.call(e, t), k = Array.isArray, ue = (e) => ve(e) === "[object Map]", A = (e) => ve(e) === "[object Set]", de = (e) => ve(e) === "[object Date]", fe = (e) => ve(e) === "[object RegExp]", j = (e) => typeof e == "function", pe = (e) => typeof e == "string", me = (e) => typeof e == "symbol", he = (e) => typeof e == "object" && !!e, ge = (e) => (he(e) || j(e)) && j(e.then) && j(e.catch), _e = Object.prototype.toString, ve = (e) => _e.call(e), ye = (e) => ve(e).slice(8, -1), be = (e) => ve(e) === "[object Object]", M = (e) => pe(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, xe = /* @__PURE__ */ ee(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), Se = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, Ce = /-\w/g, N = Se((e) => e.replace(Ce, (e) => e.slice(1).toUpperCase())), we = /\B([A-Z])/g, Te = Se((e) => e.replace(we, "-$1").toLowerCase()), Ee = Se((e) => e.charAt(0).toUpperCase() + e.slice(1)), De = Se((e) => e ? `on${Ee(e)}` : ""), Oe = (e, t) => !Object.is(e, t), ke = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, Ae = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, je = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, Me = (e) => {
	let t = pe(e) ? Number(e) : NaN;
	return isNaN(t) ? e : t;
}, Ne, Pe = () => Ne ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {}, Fe = /* @__PURE__ */ ee("Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol");
function Ie(e) {
	if (k(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = pe(r) ? Be(r) : Ie(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (pe(e) || he(e)) return e;
}
var Le = /;(?![^(]*\))/g, Re = /:([^]+)/, ze = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function Be(e) {
	let t = {};
	return e.replace(ze, (e) => e.startsWith("/*") ? "" : e).split(Le).forEach((e) => {
		if (e) {
			let n = e.split(Re);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function Ve(e) {
	let t = "";
	if (pe(e)) t = e;
	else if (k(e)) for (let n = 0; n < e.length; n++) {
		let r = Ve(e[n]);
		r && (t += r + " ");
	}
	else if (he(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
function He(e) {
	if (!e) return null;
	let { class: t, style: n } = e;
	return t && !pe(t) && (e.class = Ve(t)), n && (e.style = Ie(n)), e;
}
var Ue = /* @__PURE__ */ ee("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function We(e) {
	return !!e || e === "";
}
function Ge(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = Ye(e[i], t[i], n);
	return r;
}
function Ke(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && Ye(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function qe(e, t, n) {
	let r = ue(e), i = ue(t);
	if (r || i || (r = A(e), i = A(t), r || i)) return r && i ? Ke(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !Ye(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function Je(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function Ye(e, t, n) {
	if (e === t) return !0;
	let r = de(e), i = de(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = me(e), i = me(t), r || i ? e === t : (r = k(e), i = k(t), r || i ? r && i ? Je(e, t, n, Ge) : !1 : (r = he(e), i = he(t), r || i ? !r || !i ? !1 : Je(e, t, n, qe) : String(e) === String(t))));
}
function Xe(e, t) {
	return e.findIndex((e) => Ye(e, t));
}
var P = (e) => !!(e && e.__v_isRef === !0), F = (e) => pe(e) ? e : e == null ? "" : k(e) || he(e) && (e.toString === _e || !j(e.toString)) ? P(e) ? F(e.value) : JSON.stringify(e, Ze, 2) : String(e), Ze = (e, t) => P(t) ? Ze(e, t.value) : ue(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[Qe(t, r) + " =>"] = n, e), {}) } : A(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => Qe(e)) } : me(t) ? Qe(t) : he(t) && !k(t) && !be(t) ? String(t) : t, Qe = (e, t = "") => me(e) ? `Symbol(${e.description ?? t})` : e;
function I(e) {
	return e == null ? "initial" : typeof e == "string" ? e === "" ? " " : e : String(e);
}
// node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var $e, et = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && $e && ($e.active ? (this.parent = $e, this.index = ($e.scopes || ($e.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = !0;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].pause();
			}
			for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].pause();
		}
	}
	resume() {
		if (this._active && this._isPaused) {
			this._isPaused = !1;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].resume();
			}
			let n = this.effects.slice();
			for (e = 0, t = n.length; e < t; e++) n[e].resume();
		}
	}
	run(e) {
		if (this._active) {
			let t = $e;
			try {
				return $e = this, e();
			} finally {
				$e = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = $e, $e = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if ($e === this) $e = this.prevScope;
			else {
				let e = $e;
				for (; e;) {
					if (e.prevScope === this) {
						e.prevScope = this.prevScope;
						break;
					}
					e = e.prevScope;
				}
			}
			this.prevScope = void 0;
		}
	}
	stop(e) {
		if (this._active) {
			this._active = !1;
			let t, n;
			for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].stop();
			for (this.effects.length = 0, t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
			if (this.cleanups.length = 0, this.scopes) {
				let e = this.scopes.slice();
				for (t = 0, n = e.length; t < n; t++) e[t].stop(!0);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !e) {
				let e = this.parent.scopes.pop();
				e && e !== this && (this.parent.scopes[this.index] = e, e.index = this.index);
			}
			this.parent = void 0;
		}
	}
};
function tt(e) {
	return new et(e);
}
function nt() {
	return $e;
}
function rt(e, t = !1) {
	$e && $e.cleanups.push(e);
}
var it, at = /* @__PURE__ */ new WeakSet(), ot = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, $e && ($e.active ? $e.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, at.has(this) && (at.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || ut(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, Tt(this), pt(this);
		let e = it, t = xt;
		it = this, xt = !0;
		try {
			return this.fn();
		} finally {
			mt(this), it = e, xt = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) _t(e);
			this.deps = this.depsTail = void 0, Tt(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? at.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		ht(this) && this.run();
	}
	get dirty() {
		return ht(this);
	}
}, st = 0, ct, lt;
function ut(e, t = !1) {
	e.flags |= 8, t ? (e.next = lt, lt = e) : (e.next = ct, ct = e);
}
function dt() {
	st++;
}
function ft() {
	if (--st > 0) return;
	if (lt) {
		let e = lt;
		for (lt = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; ct;) {
		let t = ct;
		for (ct = void 0; t;) {
			let n = t.next;
			if (t.next = void 0, t.flags &= -9, t.flags & 1) try {
				t.trigger();
			} catch (t) {
				e ||= t;
			}
			t = n;
		}
	}
	if (e) throw e;
}
function pt(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function mt(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), _t(r), vt(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function ht(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (gt(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function gt(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Et) || (e.globalVersion = Et, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !ht(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = it, r = xt;
	it = e, xt = !0;
	try {
		pt(e);
		let n = e.fn(e._value);
		(t.version === 0 || Oe(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		it = n, xt = r, mt(e), e.flags &= -3;
	}
}
function _t(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) _t(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function vt(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
function yt(e, t) {
	e.effect instanceof ot && (e = e.effect.fn);
	let n = new ot(e);
	t && oe(n, t);
	try {
		n.run();
	} catch (e) {
		throw n.stop(), e;
	}
	let r = n.run.bind(n);
	return r.effect = n, r;
}
function bt(e) {
	e.effect.stop();
}
var xt = !0, St = [];
function Ct() {
	St.push(xt), xt = !1;
}
function wt() {
	let e = St.pop();
	xt = e === void 0 || e;
}
function Tt(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = it;
		it = void 0;
		try {
			t();
		} finally {
			it = e;
		}
	}
}
var Et = 0, Dt = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, Ot = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!it || !xt || it === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== it) t = this.activeLink = new Dt(it, this), it.deps ? (t.prevDep = it.depsTail, it.depsTail.nextDep = t, it.depsTail = t) : it.deps = it.depsTail = t, kt(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = it.depsTail, t.nextDep = void 0, it.depsTail.nextDep = t, it.depsTail = t, it.deps === t && (it.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, Et++, this.notify(e);
	}
	notify(e) {
		dt();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			ft();
		}
	}
};
function kt(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) kt(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var At = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ Symbol(""), Mt = /* @__PURE__ */ Symbol(""), Nt = /* @__PURE__ */ Symbol("");
function Pt(e, t, n) {
	if (xt && it) {
		let t = At.get(e);
		t || At.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new Ot()), r.map = t, r.key = n), r.track();
	}
}
function Ft(e, t, n, r, i, a) {
	let o = At.get(e);
	if (!o) {
		Et++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (dt(), t === "clear") o.forEach(s);
	else {
		let i = k(e), a = i && M(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === Nt || !me(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(Nt)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(jt)), ue(e) && s(o.get(Mt)));
				break;
			case "delete":
				i || (s(o.get(jt)), ue(e) && s(o.get(Mt)));
				break;
			case "set": ue(e) && s(o.get(jt));
		}
	}
	ft();
}
function It(e, t) {
	let n = At.get(e);
	return n && n.get(t);
}
function Lt(e) {
	let t = /* @__PURE__ */ kn(e);
	return t === e || (Pt(t, "iterate", Nt), /* @__PURE__ */ Dn(e)) ? t : /* @__PURE__ */ En(e) ? /* @__PURE__ */ Tn(e) ? t.map((e) => Mn(jn(e))) : t.map(Mn) : t.map(jn);
}
function Rt(e) {
	return Pt(e = /* @__PURE__ */ kn(e), "iterate", Nt), e;
}
function zt(e, t) {
	return /* @__PURE__ */ En(e) ? Mn(/* @__PURE__ */ Tn(e) ? jn(t) : t) : jn(t);
}
var Bt = {
	__proto__: null,
	[Symbol.iterator]() {
		return Vt(this, Symbol.iterator, (e) => zt(this, e));
	},
	concat(...e) {
		return Lt(this).concat(...e.map((e) => k(e) ? Lt(e) : e));
	},
	entries() {
		return Vt(this, "entries", (e) => (e[1] = zt(this, e[1]), e));
	},
	every(e, t) {
		return Wt(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return Wt(this, "filter", e, t, (e) => e.map((e) => zt(this, e)), arguments);
	},
	find(e, t) {
		return Wt(this, "find", e, t, (e) => zt(this, e), arguments);
	},
	findIndex(e, t) {
		return Wt(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return Wt(this, "findLast", e, t, (e) => zt(this, e), arguments);
	},
	findLastIndex(e, t) {
		return Wt(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return Wt(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return Kt(this, "includes", e);
	},
	indexOf(...e) {
		return Kt(this, "indexOf", e);
	},
	join(e) {
		return Lt(this).join(e);
	},
	lastIndexOf(...e) {
		return Kt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return Wt(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return qt(this, "pop");
	},
	push(...e) {
		return qt(this, "push", e);
	},
	reduce(e, ...t) {
		return Gt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return Gt(this, "reduceRight", e, t);
	},
	shift() {
		return qt(this, "shift");
	},
	some(e, t) {
		return Wt(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return qt(this, "splice", e);
	},
	toReversed() {
		return Lt(this).toReversed();
	},
	toSorted(e) {
		return Lt(this).toSorted(e);
	},
	toSpliced(...e) {
		return Lt(this).toSpliced(...e);
	},
	unshift(...e) {
		return qt(this, "unshift", e);
	},
	values() {
		return Vt(this, "values", (e) => zt(this, e));
	}
};
function Vt(e, t, n) {
	let r = Rt(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ Dn(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => Ht(a.next(), n), i !== Ut[t] && Object.defineProperties(e, {
				return: { get() {
					let e = a.return;
					return typeof e == "function" ? e.bind(a) : e;
				} },
				throw: { get() {
					let e = a.throw;
					return typeof e == "function" ? e.bind(a) : e;
				} }
			}), e;
		}
		a._next = a.next, a.next = () => Ht(a._next(), n);
	}
	return a;
}
function Ht(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var Ut = Array.prototype;
function Wt(e, t, n, r, i, a) {
	let o = Rt(e), s = o !== e && !/* @__PURE__ */ Dn(e), c = o[t];
	if (c !== Ut[t]) {
		let t = c.apply(e, a);
		return s ? jn(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, zt(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function Gt(e, t, n, r) {
	let i = Rt(e), a = i !== e && !/* @__PURE__ */ Dn(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = zt(e, t)), n.call(this, t, zt(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? zt(e, c) : c;
}
function Kt(e, t, n) {
	let r = /* @__PURE__ */ kn(e);
	Pt(r, "iterate", Nt);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ On(n[0]) ? (n[0] = /* @__PURE__ */ kn(n[0]), r[t](...n)) : i;
}
function qt(e, t, n = []) {
	Ct(), dt();
	let r = (/* @__PURE__ */ kn(e))[t].apply(e, n);
	return ft(), wt(), r;
}
var Jt = /* @__PURE__ */ ee("__proto__,__v_isRef,__isVue"), Yt = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(me));
function Xt(e) {
	me(e) || (e = String(e));
	let t = /* @__PURE__ */ kn(this);
	return Pt(t, "has", e), t.hasOwnProperty(e);
}
var Zt = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? vn : _n : i ? gn : hn).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = k(e);
		if (!r) {
			let e;
			if (a && (e = Bt[t])) return e;
			if (t === "hasOwnProperty") return Xt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ Nn(e) ? e : n);
		if ((me(t) ? Yt.has(t) : Jt(t)) || (r || Pt(e, "get", t), i)) return o;
		if (/* @__PURE__ */ Nn(o)) {
			let e = a && M(t) ? o : o.value;
			return r && he(e) ? /* @__PURE__ */ Sn(e) : e;
		}
		return he(o) ? r ? /* @__PURE__ */ Sn(o) : /* @__PURE__ */ bn(o) : o;
	}
}, Qt = class extends Zt {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = k(e) && M(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ En(i);
			if (!/* @__PURE__ */ Dn(n) && !/* @__PURE__ */ En(n) && (i = /* @__PURE__ */ kn(i), n = /* @__PURE__ */ kn(n)), !a && /* @__PURE__ */ Nn(i) && !/* @__PURE__ */ Nn(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : le(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ Nn(e) ? e : r);
		return e === /* @__PURE__ */ kn(r) && s && (o ? Oe(n, i) && Ft(e, "set", t, n, i) : Ft(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = le(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && Ft(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return me(t) && Yt.has(t) || Pt(e, "has", t), n;
	}
	ownKeys(e) {
		return Pt(e, "iterate", k(e) ? "length" : jt), Reflect.ownKeys(e);
	}
}, $t = class extends Zt {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, en = /* @__PURE__ */ new Qt(), tn = /* @__PURE__ */ new $t(), nn = /* @__PURE__ */ new Qt(!0), rn = /* @__PURE__ */ new $t(!0), an = (e) => e, on = (e) => Reflect.getPrototypeOf(e);
function sn(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ kn(i), o = ue(a), s = e === "entries" || e === Symbol.iterator && o, c = e === "keys" && o, l = i[e](...r), u = n ? an : t ? Mn : jn;
		return !t && Pt(a, "iterate", c ? Mt : jt), oe(Object.create(l), { next() {
			let { value: e, done: t } = l.next();
			return t ? {
				value: e,
				done: t
			} : {
				value: s ? [u(e[0]), u(e[1])] : u(e),
				done: t
			};
		} });
	};
}
function cn(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function ln(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ kn(r), a = /* @__PURE__ */ kn(n);
			e || (Oe(n, a) && Pt(i, "get", n), Pt(i, "get", a));
			let { has: o } = on(i), s = t ? an : e ? Mn : jn;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && Pt(/* @__PURE__ */ kn(t), "iterate", jt), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ kn(n), i = /* @__PURE__ */ kn(t);
			return e || (Oe(t, i) && Pt(r, "has", t), Pt(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ kn(a), s = t ? an : e ? Mn : jn;
			return !e && Pt(o, "iterate", jt), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return oe(n, e ? {
		add: cn("add"),
		set: cn("set"),
		delete: cn("delete"),
		clear: cn("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ kn(this), r = on(n), i = /* @__PURE__ */ kn(e), a = !t && !/* @__PURE__ */ Dn(e) && !/* @__PURE__ */ En(e) ? i : e;
			return r.has.call(n, a) || Oe(e, a) && r.has.call(n, e) || Oe(i, a) && r.has.call(n, i) || (n.add(a), Ft(n, "add", a, a)), this;
		},
		set(e, n) {
			t || /* @__PURE__ */ Dn(n) || /* @__PURE__ */ En(n) || (n = /* @__PURE__ */ kn(n));
			let r = /* @__PURE__ */ kn(this), { has: i, get: a } = on(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ kn(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? Oe(n, s) && Ft(r, "set", e, n, s) : Ft(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ kn(this), { has: n, get: r } = on(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ kn(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && Ft(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ kn(this), t = e.size !== 0, n = e.clear();
			return t && Ft(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = sn(r, e, t);
	}), n;
}
function un(e, t) {
	let n = ln(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(le(n, i) && i in r ? n : r, i, a);
}
var dn = { get: /* @__PURE__ */ un(!1, !1) }, fn = { get: /* @__PURE__ */ un(!1, !0) }, pn = { get: /* @__PURE__ */ un(!0, !1) }, mn = { get: /* @__PURE__ */ un(!0, !0) }, hn = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap();
function yn(e) {
	switch (e) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
// @__NO_SIDE_EFFECTS__
function bn(e) {
	return /* @__PURE__ */ En(e) ? e : wn(e, !1, en, dn, hn);
}
// @__NO_SIDE_EFFECTS__
function xn(e) {
	return wn(e, !1, nn, fn, gn);
}
// @__NO_SIDE_EFFECTS__
function Sn(e) {
	return wn(e, !0, tn, pn, _n);
}
// @__NO_SIDE_EFFECTS__
function Cn(e) {
	return wn(e, !0, rn, mn, vn);
}
function wn(e, t, n, r, i) {
	if (!he(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = yn(ye(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function Tn(e) {
	return /* @__PURE__ */ En(e) ? /* @__PURE__ */ Tn(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function En(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Dn(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function On(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function kn(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ kn(t) : e;
}
function An(e) {
	return !le(e, "__v_skip") && Object.isExtensible(e) && Ae(e, "__v_skip", !0), e;
}
var jn = (e) => he(e) ? /* @__PURE__ */ bn(e) : e, Mn = (e) => he(e) ? /* @__PURE__ */ Sn(e) : e;
// @__NO_SIDE_EFFECTS__
function Nn(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function L(e) {
	return Fn(e, !1);
}
// @__NO_SIDE_EFFECTS__
function Pn(e) {
	return Fn(e, !0);
}
function Fn(e, t) {
	return /* @__PURE__ */ Nn(e) ? e : new In(e, t);
}
var In = class {
	constructor(e, t) {
		this.dep = new Ot(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ kn(e), this._value = t ? e : jn(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ Dn(e) || /* @__PURE__ */ En(e);
		e = n ? e : /* @__PURE__ */ kn(e), Oe(e, t) && (this._rawValue = e, this._value = n ? e : jn(e), this.dep.trigger());
	}
};
function Ln(e) {
	e.dep && e.dep.trigger();
}
function R(e) {
	return /* @__PURE__ */ Nn(e) ? e.value : e;
}
function Rn(e) {
	return j(e) ? e() : R(e);
}
var zn = {
	get: (e, t, n) => t === "__v_raw" ? e : R(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ Nn(i) && !/* @__PURE__ */ Nn(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Bn(e) {
	return /* @__PURE__ */ Tn(e) ? e : new Proxy(e, zn);
}
var Vn = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new Ot(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function Hn(e) {
	return new Vn(e);
}
// @__NO_SIDE_EFFECTS__
function Un(e) {
	let t = k(e) ? Array(e.length) : {};
	for (let n in e) t[n] = qn(e, n);
	return t;
}
var Wn = class {
	constructor(e, t, n) {
		this._object = e, this._defaultValue = n, this.__v_isRef = !0, this._value = void 0, this._key = me(t) ? t : String(t), this._raw = /* @__PURE__ */ kn(e);
		let r = !0, i = e;
		if (!k(e) || me(this._key) || !M(this._key)) do
			r = !/* @__PURE__ */ On(i) || /* @__PURE__ */ Dn(i);
		while (r && (i = i.__v_raw));
		this._shallow = r;
	}
	get value() {
		let e = this._object[this._key];
		return this._shallow && (e = R(e)), this._value = e === void 0 ? this._defaultValue : e;
	}
	set value(e) {
		if (this._shallow && /* @__PURE__ */ Nn(this._raw[this._key])) {
			let t = this._object[this._key];
			if (/* @__PURE__ */ Nn(t)) {
				t.value = e;
				return;
			}
		}
		this._object[this._key] = e;
	}
	get dep() {
		return It(this._raw, this._key);
	}
}, Gn = class {
	constructor(e) {
		this._getter = e, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
	}
	get value() {
		return this._value = this._getter();
	}
};
// @__NO_SIDE_EFFECTS__
function Kn(e, t, n) {
	return /* @__PURE__ */ Nn(e) ? e : j(e) ? new Gn(e) : he(e) && arguments.length > 1 ? qn(e, t, n) : /* @__PURE__ */ L(e);
}
function qn(e, t, n) {
	return new Wn(e, t, n);
}
var Jn = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new Ot(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Et - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && it !== this) return ut(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return gt(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function Yn(e, t, n = !1) {
	let r, i;
	return j(e) ? r = e : (r = e.get, i = e.set), new Jn(r, i, n);
}
var Xn = {
	GET: "get",
	HAS: "has",
	ITERATE: "iterate"
}, Zn = {
	SET: "set",
	ADD: "add",
	DELETE: "delete",
	CLEAR: "clear"
}, Qn = {}, $n = /* @__PURE__ */ new WeakMap(), er = void 0;
function tr() {
	return er;
}
function nr(e, t = !1, n = er) {
	if (n) {
		let t = $n.get(n);
		t || $n.set(n, t = []), t.push(e);
	}
}
function rr(e, t, n = O) {
	let { immediate: r, deep: i, once: a, scheduler: o, augmentJob: s, call: c } = n, l = (e) => i ? e : /* @__PURE__ */ Dn(e) || i === !1 || i === 0 ? ir(e, 1) : ir(e), u, d, f, p, m = !1, h = !1;
	if (/* @__PURE__ */ Nn(e) ? (d = () => e.value, m = /* @__PURE__ */ Dn(e)) : /* @__PURE__ */ Tn(e) ? (d = () => l(e), m = !0) : k(e) ? (h = !0, m = e.some((e) => /* @__PURE__ */ Tn(e) || /* @__PURE__ */ Dn(e)), d = () => e.map((e) => {
		if (/* @__PURE__ */ Nn(e)) return e.value;
		if (/* @__PURE__ */ Tn(e)) return l(e);
		if (j(e)) return c ? c(e, 2) : e();
	})) : d = j(e) ? t ? c ? () => c(e, 2) : e : () => {
		if (f) {
			Ct();
			try {
				f();
			} finally {
				wt();
			}
		}
		let t = er;
		er = u;
		try {
			return c ? c(e, 3, [p]) : e(p);
		} finally {
			er = t;
		}
	} : ne, t && i) {
		let e = d, t = i === !0 ? Infinity : i;
		d = () => ir(e(), t);
	}
	let g = nt(), _ = () => {
		u.stop(), g && g.active && se(g.effects, u);
	};
	if (a && t) {
		let e = t;
		t = (...t) => {
			try {
				return e(...t);
			} finally {
				_();
			}
		};
	}
	let v = h ? Array(e.length).fill(Qn) : Qn, y = (e) => {
		if (u.flags & 1 && (u.dirty || e)) {
			if (t) {
				let n = u.run();
				if (e || i || m || (h ? n.some((e, t) => Oe(e, v[t])) : Oe(n, v))) {
					let e = er;
					Ct();
					try {
						f && f(), er = u;
						let e = [
							n,
							v === Qn ? void 0 : h && v[0] === Qn ? [] : v,
							p
						];
						v = n, c ? c(t, 3, e) : t(...e);
					} finally {
						er = e, wt();
					}
				}
			} else u.run();
		}
	};
	return s && s(y), u = new ot(d), u.scheduler = o ? () => o(y, !1) : y, p = (e) => nr(e, !1, u), f = u.onStop = () => {
		let e = $n.get(u);
		if (e) {
			if (c) c(e, 4);
			else for (let t of e) t();
			$n.delete(u);
		}
	}, t ? r ? y(!0) : v = u.run() : o ? o(y.bind(null, !0), !0) : u.run(), _.pause = u.pause.bind(u), _.resume = u.resume.bind(u), _.stop = _, _;
}
function ir(e, t = Infinity, n) {
	if (t <= 0 || !he(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ Nn(e)) ir(e.value, t, n);
	else if (k(e)) for (let r = 0; r < e.length; r++) ir(e[r], t, n);
	else if (A(e) || ue(e)) e.forEach((e) => {
		ir(e, t, n);
	});
	else if (be(e)) {
		for (let r in e) ir(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && ir(e[r], t, n);
	}
	return e;
}
// node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var ar = [];
function or(e) {
	ar.push(e);
}
function sr() {
	ar.pop();
}
function cr(e, t) {}
var lr = {
	SETUP_FUNCTION: 0,
	0: "SETUP_FUNCTION",
	RENDER_FUNCTION: 1,
	1: "RENDER_FUNCTION",
	NATIVE_EVENT_HANDLER: 5,
	5: "NATIVE_EVENT_HANDLER",
	COMPONENT_EVENT_HANDLER: 6,
	6: "COMPONENT_EVENT_HANDLER",
	VNODE_HOOK: 7,
	7: "VNODE_HOOK",
	DIRECTIVE_HOOK: 8,
	8: "DIRECTIVE_HOOK",
	TRANSITION_HOOK: 9,
	9: "TRANSITION_HOOK",
	APP_ERROR_HANDLER: 10,
	10: "APP_ERROR_HANDLER",
	APP_WARN_HANDLER: 11,
	11: "APP_WARN_HANDLER",
	FUNCTION_REF: 12,
	12: "FUNCTION_REF",
	ASYNC_COMPONENT_LOADER: 13,
	13: "ASYNC_COMPONENT_LOADER",
	SCHEDULER: 14,
	14: "SCHEDULER",
	COMPONENT_UPDATE: 15,
	15: "COMPONENT_UPDATE",
	APP_UNMOUNT_CLEANUP: 16,
	16: "APP_UNMOUNT_CLEANUP"
}, ur = {
	sp: "serverPrefetch hook",
	bc: "beforeCreate hook",
	c: "created hook",
	bm: "beforeMount hook",
	m: "mounted hook",
	bu: "beforeUpdate hook",
	u: "updated",
	bum: "beforeUnmount hook",
	um: "unmounted hook",
	a: "activated hook",
	da: "deactivated hook",
	ec: "errorCaptured hook",
	rtc: "renderTracked hook",
	rtg: "renderTriggered hook",
	0: "setup function",
	1: "render function",
	2: "watcher getter",
	3: "watcher callback",
	4: "watcher cleanup function",
	5: "native event handler",
	6: "component event handler",
	7: "vnode hook",
	8: "directive hook",
	9: "transition hook",
	10: "app errorHandler",
	11: "app warnHandler",
	12: "ref function",
	13: "async component loader",
	14: "scheduler flush",
	15: "component update",
	16: "app unmount cleanup function"
};
function dr(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		pr(e, t, n);
	}
}
function fr(e, t, n, r) {
	if (j(e)) {
		let i = dr(e, t, n, r);
		return i && ge(i) && i.catch((e) => {
			pr(e, t, n);
		}), i;
	}
	if (k(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(fr(e[a], t, n, r));
		return i;
	}
}
function pr(e, t, n, r = !0) {
	let i = t ? t.vnode : null, { errorHandler: a, throwUnhandledErrorInProduction: o } = t && t.appContext.config || O;
	if (t) {
		let r = t.parent, i = t.proxy, o = `https://vuejs.org/error-reference/#runtime-${n}`;
		for (; r;) {
			let t = r.ec;
			if (t) {
				for (let n = 0; n < t.length; n++) if (t[n](e, i, o) === !1) return;
			}
			r = r.parent;
		}
		if (a) {
			Ct(), dr(a, null, 10, [
				e,
				i,
				o
			]), wt();
			return;
		}
	}
	mr(e, n, i, r, o);
}
function mr(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var hr = [], gr = -1, _r = [], vr = null, yr = 0, br = /* @__PURE__ */ Promise.resolve(), xr = null;
function Sr(e) {
	let t = xr || br;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function Cr(e) {
	let t = gr + 1, n = hr.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = hr[r], a = jr(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function wr(e) {
	if (!(e.flags & 1)) {
		let t = jr(e), n = hr[hr.length - 1];
		!n || !(e.flags & 2) && t >= jr(n) ? hr.push(e) : hr.splice(Cr(t), 0, e), e.flags |= 1, Tr();
	}
}
function Tr() {
	xr ||= br.then(Mr);
}
function Er(e) {
	if (!k(e)) vr && e.id === -1 ? vr.splice(yr + 1, 0, e) : e.flags & 1 || (_r.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) _r.push(e[t]);
	Tr();
}
function Dr(e, t, n, r = gr + 1) {
	for (; r < hr.length; r++) {
		let n = hr[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			hr.splice(r, 1), r = e ? r - 1 : gr, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function Or(e, t, n = 0) {
	if (_r.length) {
		let e = _r, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < _r.length; i++) {
				let a = _r[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? _r[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => jr(e) - jr(t));
		if (_r.length = r, vr) {
			for (let e = 0; e < i.length; e++) vr.push(i[e]);
			return;
		}
		for (vr = i, yr = 0; yr < vr.length; yr++) {
			let e = vr[yr];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		vr = null, yr = 0;
	}
}
var kr = !1;
function Ar(e, t) {
	if (kr) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(_r);
	e(), kr = !0;
	try {
		Dr(void 0, t), Or(void 0, n, t);
	} finally {
		kr = !1;
	}
}
var jr = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function Mr(e) {
	try {
		for (gr = 0; gr < hr.length; gr++) {
			let e = hr[gr];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), dr(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; gr < hr.length; gr++) {
			let e = hr[gr];
			e && (e.flags &= -2);
		}
		gr = -1, hr.length = 0, Or(e), xr = null, (hr.length || _r.length) && Mr(e);
	}
}
var Nr, Pr = [];
function Fr(e, t) {
	Nr = e, Nr ? (Nr.enabled = !0, Pr.forEach(({ event: e, args: t }) => Nr.emit(e, ...t)), Pr = []) : typeof window < "u" && window.HTMLElement && !(window.navigator?.userAgent)?.includes("jsdom") ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((e) => {
		Fr(e, t);
	}), setTimeout(() => {
		Nr || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, Pr = []);
	}, 3e3)) : Pr = [];
}
var Ir = null, Lr = null;
function Rr(e) {
	let t = Ir;
	return Ir = e, Lr = e && e.type.__scopeId || null, t;
}
function zr(e) {
	Lr = e;
}
function Br() {
	Lr = null;
}
var Vr = (e) => z;
function z(e, t = Ir, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && Bs(-1);
		let i = Rr(t), a = Is.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Is.length; e > a; e--) Rs();
			Rr(i), r._d && Bs(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function Hr(e, t) {
	if (Ir === null) return e;
	let n = Tc(Ir), r = e.dirs ||= [];
	for (let e = 0; e < t.length; e++) {
		let [i, a, o, s = O] = t[e];
		i && (j(i) && (i = {
			mounted: i,
			updated: i
		}), i.deep && ir(a), r.push({
			dir: i,
			instance: n,
			value: a,
			oldValue: void 0,
			arg: o,
			modifiers: s
		}));
	}
	return e;
}
function Ur(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (Ct(), fr(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), wt());
	}
}
function Wr(e, t) {
	if (sc) {
		let n = sc.provides, r = sc.parent && sc.parent.provides;
		r === n && (n = sc.provides = Object.create(r)), n[e] = t;
	}
}
function Gr(e, t, n = !1) {
	let r = cc();
	if (r || ko) {
		let i = ko ? ko._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && j(t) ? t.call(r && r.proxy) : t;
	}
}
function Kr() {
	return !!(cc() || ko);
}
var qr = /* @__PURE__ */ Symbol.for("v-scx"), Jr = () => Gr(qr);
function Yr(e, t) {
	return $r(e, null, t);
}
function Xr(e, t) {
	return $r(e, null, { flush: "post" });
}
function Zr(e, t) {
	return $r(e, null, { flush: "sync" });
}
function Qr(e, t, n) {
	return $r(e, t, n);
}
function $r(e, t, n = O) {
	let { immediate: r, deep: i, flush: a, once: o } = n, s = oe({}, n), c = t && r || !t && a !== "post", l;
	if (mc) {
		if (a === "sync") {
			let e = Jr();
			l = e.__watcherHandles ||= [];
		} else if (!c) {
			let e = () => {};
			return e.stop = ne, e.resume = ne, e.pause = ne, e;
		}
	}
	let u = sc;
	s.call = (e, t, n) => fr(e, u, t, n);
	let d = !1;
	a === "post" ? s.scheduler = (e) => {
		e.i = u, cs(e, u && u.suspense);
	} : a !== "sync" && (d = !0, s.scheduler = (e, t) => {
		t ? e() : wr(e);
	}), s.augmentJob = (e) => {
		t && (e.flags |= 4), d && (e.flags |= 2, u && (e.id = u.uid, e.i = u));
	};
	let f = rr(e, t, s);
	return mc && (l ? l.push(f) : c && f()), f;
}
function ei(e, t, n) {
	let r = this.proxy, i = pe(e) ? e.includes(".") ? ti(r, e) : () => r[e] : e.bind(r, r), a;
	j(t) ? a = t : (a = t.handler, n = t);
	let o = dc(this), s = $r(i, a.bind(r), n);
	return o(), s;
}
function ti(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var ni = /* @__PURE__ */ new WeakMap(), ri = /* @__PURE__ */ Symbol("_vte"), ii = (e) => e.__isTeleport, ai = (e) => e && (e.disabled || e.disabled === ""), oi = (e) => e && (e.defer || e.defer === ""), si = (e) => typeof SVGElement < "u" && e instanceof SVGElement, ci = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, li = (e, t) => {
	let n = e && e.to;
	return pe(n) ? t ? t(n) : null : n;
}, ui = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = ai(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = ai(e.props), r = e.target = li(e.props, m), a = hi(r, e, h, p);
			r && (o !== "svg" && si(r) ? o = "svg" : o !== "mathml" && ci(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), mi(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (ni.get(e) === t) {
					if (ni.delete(e), ai(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), mi(e, !0);
					}
					x(e);
				}
			};
			ni.set(e, t), cs(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), oi(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), mi(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = ni.get(e);
			if (u) {
				u.flags |= 8, ni.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = ai(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || si(p) ? o = "svg" : (o === "mathml" || ci(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), hs(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : di(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = li(t.props, m);
				e && (t.target = e, di(t, e, null, l, 0));
			} else g && di(t, p, h, l, 1);
			mi(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = ai(f), m = a || !p, h = ni.get(e);
		if (h && (h.flags |= 8, ni.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: di,
	hydrate: fi
};
function di(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !ni.has(e) && (!d || ai(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function fi(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
	function f(e, n) {
		let r = n;
		for (; r;) {
			if (r && r.nodeType === 8) {
				if (r.data === "teleport start anchor") t.targetStart = r;
				else if (r.data === "teleport anchor") {
					t.targetAnchor = r, e._lpa = t.targetAnchor && o(t.targetAnchor);
					break;
				}
			}
			r = o(r);
		}
	}
	function p(e, t) {
		t.anchor = d(o(e), t, s(e), n, r, i, a);
	}
	let m = t.target = li(t.props, c), h = ai(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || hi(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || hi(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), mi(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var pi = ui;
function mi(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function hi(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[ri] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var gi = /* @__PURE__ */ Symbol("_leaveCb"), _i = /* @__PURE__ */ Symbol("_enterCb");
function vi() {
	let e = {
		isMounted: !1,
		isLeaving: !1,
		isUnmounting: !1,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	return Ca(() => {
		e.isMounted = !0;
	}), Ea(() => {
		e.isUnmounting = !0;
	}), e;
}
var yi = [Function, Array], bi = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: yi,
	onEnter: yi,
	onAfterEnter: yi,
	onEnterCancelled: yi,
	onBeforeLeave: yi,
	onLeave: yi,
	onAfterLeave: yi,
	onLeaveCancelled: yi,
	onBeforeAppear: yi,
	onAppear: yi,
	onAfterAppear: yi,
	onAppearCancelled: yi
}, xi = {
	name: "BaseTransition",
	props: bi,
	setup(e, { slots: t }) {
		let n = cc(), r = vi();
		return () => {
			let i = t.default && ki(t.default(), !0), a = i && i.length ? Si(i) : n.subTree ? J() : void 0;
			if (!a) return;
			let o = /* @__PURE__ */ kn(e), { mode: s } = o;
			if (r.isLeaving) return Ei(a);
			let c = Di(a);
			if (!c) return Ei(a);
			let l = Ti(c, o, r, n, (e) => l = e);
			c.type !== Ps && Oi(c, l);
			let u = n.subTree && Di(n.subTree);
			if (u && u.type !== Ps && !Us(u, c) && Ai(n.subTree)) {
				let e = Ti(u, o, r, n);
				if (Oi(u, e), s === "out-in" && c.type !== Ps) return r.isLeaving = !0, e.afterLeave = () => {
					r.isLeaving = !1, n.job.flags & 8 || n.update(), delete e.afterLeave, u = void 0;
				}, Ei(a);
				s === "in-out" && c.type !== Ps ? e.delayLeave = (e, t, n) => {
					let i = wi(r, u);
					i[String(u.key)] = u, e[gi] = () => {
						t(), e[gi] = void 0, delete l.delayedLeave, u = void 0;
					}, l.delayedLeave = () => {
						n(), delete l.delayedLeave, u = void 0;
					};
				} : u = void 0;
			} else u &&= void 0;
			return a;
		};
	}
};
function Si(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Ps) {
			t = n;
			break;
		}
	}
	return t;
}
var Ci = xi;
function wi(e, t) {
	let { leavingVNodes: n } = e, r = n.get(t.type);
	return r || (r = /* @__PURE__ */ Object.create(null), n.set(t.type, r)), r;
}
function Ti(e, t, n, r, i) {
	let { appear: a, mode: o, persisted: s = !1, onBeforeEnter: c, onEnter: l, onAfterEnter: u, onEnterCancelled: d, onBeforeLeave: f, onLeave: p, onAfterLeave: m, onLeaveCancelled: h, onBeforeAppear: g, onAppear: _, onAfterAppear: v, onAppearCancelled: y } = t, b = String(e.key), x = wi(n, e), S = (e, t) => {
		e && fr(e, r, 9, t);
	}, C = (e, t) => {
		let n = t[1];
		S(e, t), k(e) ? e.every((e) => e.length <= 1) && n() : e.length <= 1 && n();
	}, w = {
		mode: o,
		persisted: s,
		beforeEnter(t) {
			let r = c;
			if (!n.isMounted) {
				if (a) r = g || c;
				else return;
			}
			t[gi] && t[gi](!0);
			let i = x[b];
			if (i && Us(e, i)) {
				let e = i.el[gi];
				if (!e) {
					let t = Ai(i);
					e = t && t.el[gi];
				}
				e && e();
			}
			S(r, [t]);
		},
		enter(t) {
			if (x[b] === e) return;
			let r = l, i = u, o = d;
			if (!n.isMounted) {
				if (a) r = _ || l, i = v || u, o = y || d;
				else return;
			}
			let s = !1;
			t[_i] = (e) => {
				s || (s = !0, S(e ? o : i, [t]), w.delayedLeave && w.delayedLeave(), t[_i] = void 0);
			};
			let c = t[_i].bind(null, !1);
			r ? C(r, [t, c]) : c();
		},
		leave(t, r) {
			let i = String(e.key);
			if (t[_i] && t[_i](!0), n.isUnmounting) return r();
			S(f, [t]);
			let a = !1;
			t[gi] = (n) => {
				a || (a = !0, r(), S(n ? h : m, [t]), t[gi] = void 0, x[i] === e && delete x[i]);
			};
			let o = t[gi].bind(null, !1);
			x[i] = e, p ? C(p, [t, o]) : o();
		},
		clone(e) {
			let a = Ti(e, t, n, r, i);
			return i && i(a), a;
		}
	};
	return w;
}
function Ei(e) {
	if (da(e)) return e = Ys(e), e.children = null, e;
}
function Di(e) {
	if (!da(e)) return ii(e.type) && e.children ? Si(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && j(n.default)) return n.default();
	}
}
function Oi(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		Oi(ii(n.type) && Di(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === H && k(e.children)) {
		let n = Lo(e.children, !1);
		n && Oi(n, t);
	}
}
function ki(e, t = !1, n) {
	let r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a], s = n == null ? o.key : String(n) + String(o.key == null ? a : o.key);
		o.type === H ? (o.patchFlag & 128 && i++, r = r.concat(ki(o.children, t, s))) : (t || o.type !== Ps) && r.push(s == null ? o : Ys(o, { key: s }));
	}
	if (i > 1) for (let e = 0; e < r.length; e++) r[e].patchFlag = -2;
	return r;
}
function Ai(e) {
	if (e.component) return Ai(e.component.subTree);
	if (e.type === H) {
		let t = k(e.children) && Lo(e.children, !1);
		return t ? Ai(t) : void 0;
	}
	if (e.type !== Ps) return e;
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
	return j(e) ? /* @__PURE__ */ oe({ name: e.name }, t, { setup: e }) : e;
}
function ji() {
	let e = cc();
	return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : "";
}
function Mi(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function Ni(e) {
	let t = cc(), n = /* @__PURE__ */ Pn(null);
	if (t) {
		let r = t.refs === O ? t.refs = {} : t.refs;
		Object.defineProperty(r, e, {
			enumerable: !0,
			get: () => n.value,
			set: (e) => n.value = e
		});
	}
	return n;
}
function Pi(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var Fi = /* @__PURE__ */ new WeakMap();
function Ii(e, t, n, r, i = !1) {
	if (k(e)) {
		e.forEach((e, a) => Ii(e, t && (k(t) ? t[a] : t), n, r, i));
		return;
	}
	if (ca(r) && !i) {
		r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && Ii(e, t, n, r.component.subTree);
		return;
	}
	let a = r.shapeFlag & 4 ? Tc(r.component) : r.el, o = i ? null : a, { i: s, r: c } = e, l = t && t.r, u = s.refs === O ? s.refs = {} : s.refs, d = s.setupState, f = /* @__PURE__ */ kn(d), p = d === O ? re : (e) => !Pi(u, e) && le(f, e), m = (e, t) => !(t && Pi(u, t));
	if (l != null && l !== c) {
		if (Li(t), pe(l)) u[l] = null, p(l) && (d[l] = null);
		else if (/* @__PURE__ */ Nn(l)) {
			let e = t;
			m(l, e.k) && (l.value = null), e.k && (u[e.k] = null);
		}
	}
	if (j(c)) dr(c, s, 12, [o, u]);
	else {
		let t = pe(c), r = /* @__PURE__ */ Nn(c);
		if (t || r) {
			let s = () => {
				if (e.f) {
					let n = t ? p(c) ? d[c] : u[c] : m(c) || !e.k ? c.value : u[e.k];
					if (i) k(n) && se(n, a);
					else if (k(n)) n.includes(a) || n.push(a);
					else if (t) u[c] = [a], p(c) && (d[c] = u[c]);
					else {
						let t = [a];
						m(c, e.k) && (c.value = t), e.k && (u[e.k] = t);
					}
				} else t ? (u[c] = o, p(c) && (d[c] = o)) : r && (m(c, e.k) && (c.value = o), e.k && (u[e.k] = o));
			};
			if (o) {
				let t = () => {
					s(), Fi.delete(e);
				};
				t.id = -1, Fi.set(e, t), cs(t, n);
			} else Li(e), s();
		}
	}
}
function Li(e) {
	let t = Fi.get(e);
	t && (t.flags |= 8, Fi.delete(e));
}
var Ri = !1, zi = () => {
	Ri ||= (console.error("Hydration completed but contains mismatches."), !0);
}, Bi = (e) => e.namespaceURI.includes("svg") && e.tagName !== "foreignObject", Vi = (e) => e.namespaceURI.includes("MathML"), Hi = (e) => {
	if (e.nodeType === 1) {
		if (Bi(e)) return "svg";
		if (Vi(e)) return "mathml";
	}
}, Ui = (e) => e.nodeType === 8;
function Wi(e) {
	let { mt: t, p: n, o: { patchProp: r, createText: i, nextSibling: a, parentNode: o, remove: s, insert: c, createComment: l } } = e, u = (e, t) => {
		t.hasChildNodes() ? (d(t.firstChild, e, null, null, null), Or(), t._vnode = e) : (n(null, e, t), Or(), t._vnode = e);
	}, d = (n, r, s, l, u, y = !1) => {
		y ||= !!r.dynamicChildren;
		let b = Ui(n) && n.data === "[", x = () => h(n, r, s, l, u, b), { type: S, ref: C, shapeFlag: w, patchFlag: T } = r, E = n.nodeType;
		r.el = n, T === -2 && (y = !1, r.dynamicChildren = null);
		let D = null;
		switch (S) {
			case Ns:
				E === 3 ? (n.data !== r.children && (zi(), n.data = r.children), D = a(n)) : r.children === "" ? (c(r.el = i(""), o(n), n), D = n) : D = x();
				break;
			case Ps:
				v(n) ? (D = a(n), _(r.el = n.content.firstChild, n, s)) : D = E !== 8 || b ? x() : a(n);
				break;
			case Fs:
				if (b && (n = a(n), E = n.nodeType), E === 1 || E === 3) {
					D = n;
					let e = !r.children.length;
					for (let t = 0; t < r.staticCount; t++) e && (r.children += D.nodeType === 1 ? D.outerHTML : D.data), t === r.staticCount - 1 && (r.anchor = D), D = a(D);
					return b ? a(D) : D;
				}
				x();
				break;
			case H:
				D = b ? m(n, r, s, l, u, y) : x();
				break;
			default: if (w & 1) D = (E !== 1 || r.type.toLowerCase() !== n.tagName.toLowerCase()) && !v(n) ? x() : f(n, r, s, l, u, y);
			else if (w & 6) {
				r.slotScopeIds = u;
				let e = o(n);
				if (D = b ? g(n) : Ui(n) && n.data === "teleport start" ? g(n, n.data, "teleport end") : a(n), t(r, e, null, s, l, Hi(e), y), (ca(r) || r.component.asyncDep) && !r.component.subTree) {
					let t;
					b ? (t = q(Fs), t.anchor = D ? D.previousSibling : e.lastChild) : t = n.nodeType === 3 ? Xs("") : q(n.nodeType === 8 ? Ps : "div"), t.el = n, r.component.subTree = t;
				}
			} else w & 64 ? D = E === 8 ? r.type.hydrate(n, r, s, l, u, y, e, p) : x() : w & 128 && (D = r.type.hydrate(n, r, s, l, Hi(o(n)), u, y, e, d));
		}
		return C != null && Ii(C, null, l, r), D;
	}, f = (e, t, n, i, a, o) => {
		o ||= !!t.dynamicChildren;
		let { type: c, dynamicProps: l, props: u, patchFlag: d, shapeFlag: f, dirs: m, transition: h } = t, g = c === "input" || c === "option", y = !!l;
		if (g || y || d !== -1) {
			m && Ur(t, null, n, "created");
			let c = !1;
			if (v(e)) {
				c = ms(null, h) && n && n.vnode.props && n.vnode.props.appear;
				let r = e.content.firstChild;
				if (c) {
					let e = r.getAttribute("class");
					e && (r.$cls = e), h.beforeEnter(r);
				}
				_(r, e, n), t.el = e = r;
			}
			if (f & 16 && !(u && (u.innerHTML || u.textContent))) {
				let r = p(e.firstChild, t, e, n, i, a, o);
				for (r && !Yi(e, 1) && zi(); r;) {
					let e = r;
					r = r.nextSibling, s(e);
				}
			} else if (f & 8) {
				let n = t.children;
				n[0] === "\n" && (e.tagName === "PRE" || e.tagName === "TEXTAREA") && (n = n.slice(1));
				let { textContent: r } = e;
				r !== n && r !== n.replace(/\r\n|\r/g, "\n") && (Yi(e, 0) || zi(), e.textContent = t.children);
			}
			if (u) {
				if (g || y || !o || d & 48) {
					let t = e.tagName.includes("-"), i = e.namespaceURI.includes("svg") ? "svg" : e.namespaceURI.includes("MathML") ? "mathml" : void 0;
					for (let a in u) if (g && (a.endsWith("value") || a === "indeterminate") || ie(a) && !xe(a) || a[0] === "." || t && !xe(a) || l && l.includes(a)) {
						if (Ki(e, a, u[a])) continue;
						r(e, a, null, u[a], i, n);
					}
				} else if (u.onClick) r(e, "onClick", null, u.onClick, void 0, n);
				else if (d & 4 && /* @__PURE__ */ Tn(u.style)) for (let e in u.style) u.style[e];
			}
			let b;
			(b = u && u.onVnodeBeforeMount) && nc(b, n, t), m && Ur(t, null, n, "beforeMount"), ((b = u && u.onVnodeMounted) || m || c) && As(() => {
				b && nc(b, n, t), c && h.enter(e), m && Ur(t, null, n, "mounted");
			}, i);
		}
		return e.nextSibling;
	}, p = (e, t, r, o, s, l, u) => {
		u ||= !!t.dynamicChildren;
		let f = t.children, p = f.length, m = !1;
		for (let t = 0; t < p; t++) {
			let h = u ? f[t] : f[t] = Qs(f[t]), g = h.type === Ns;
			e ? (g && !u && t + 1 < p && Qs(f[t + 1]).type === Ns && (c(i(e.data.slice(h.children.length)), r, a(e)), e.data = h.children), e = d(e, h, o, s, l, u)) : g && !h.children ? c(h.el = i(""), r) : (m || (m = !0, Yi(r, 1) || zi()), n(null, h, r, null, o, s, Hi(r), l));
		}
		return e;
	}, m = (e, t, n, r, i, s) => {
		let { slotScopeIds: u } = t;
		u && (i = i ? i.concat(u) : u);
		let d = o(e), f = p(a(e), t, d, n, r, i, s);
		return f && Ui(f) && f.data === "]" ? a(t.anchor = f) : (zi(), c(t.anchor = l("]"), d, f), f);
	}, h = (e, t, r, i, c, l) => {
		if (Zi(e, t) || zi(), t.el = null, l) {
			let t = g(e);
			for (;;) {
				let n = a(e);
				if (n && n !== t) s(n);
				else break;
			}
		}
		let u = a(e), d = o(e);
		return s(e), n(null, t, d, u, r, i, Hi(d), c), r && (r.vnode.el = t.el, Uo(r, t.el)), u;
	}, g = (e, t = "[", n = "]") => {
		let r = 0;
		for (; e;) if (e = a(e), e && Ui(e) && (e.data === t && r++, e.data === n)) {
			if (r === 0) return a(e);
			r--;
		}
		return e;
	}, _ = (e, t, n) => {
		let r = t.parentNode;
		r && r.replaceChild(e, t);
		let i = n;
		for (; i;) i.vnode.el === t && (i.vnode.el = i.subTree.el = e), i = i.parent;
	}, v = (e) => e.nodeType === 1 && e.tagName === "TEMPLATE";
	return [u, d];
}
var Gi = /* @__PURE__ */ new Set([
	"src",
	"srcset",
	"href",
	"poster"
]);
function Ki(e, t, n) {
	return Gi.has(t) ? e.getAttribute(t) === (n == null ? null : `${n}`) : !1;
}
var qi = "data-allow-mismatch", Ji = {
	0: "text",
	1: "children",
	2: "class",
	3: "style",
	4: "attribute"
};
function Yi(e, t) {
	if (t === 0 || t === 1) for (; e && !e.hasAttribute(qi);) e = e.parentElement;
	return Xi(e && e.getAttribute(qi), t);
}
function Xi(e, t) {
	if (e == null) return !1;
	if (e === "") return !0;
	{
		let n = e.split(",");
		return t === 0 && n.includes("children") ? !0 : n.includes(Ji[t]);
	}
}
function Zi(e, t) {
	return Yi(e.parentElement, 1) || Qi(e) || $i(t);
}
function Qi(e) {
	return e.nodeType === 1 && Xi(e.getAttribute(qi), 1);
}
function $i({ props: e }) {
	let t = e && e[qi];
	return typeof t == "string" && Xi(t, 1);
}
var ea = Pe().requestIdleCallback || ((e) => setTimeout(e, 1)), ta = Pe().cancelIdleCallback || ((e) => clearTimeout(e)), na = (e = 1e4) => (t) => {
	let n = ea(t, { timeout: e });
	return () => ta(n);
};
function ra(e) {
	let { top: t, left: n, bottom: r, right: i } = e.getBoundingClientRect(), { innerHeight: a, innerWidth: o } = window;
	return (t > 0 && t < a || r > 0 && r < a) && (n > 0 && n < o || i > 0 && i < o);
}
var ia = (e) => (t, n) => {
	let r = new IntersectionObserver((e) => {
		for (let n of e) if (n.isIntersecting) {
			r.disconnect(), t();
			break;
		}
	}, e), i = (e) => {
		if (ra(e)) return t(), r.disconnect(), !1;
		if (getComputedStyle(e).display === "contents") {
			for (let t = 0; t < e.children.length; t++) if (i(e.children[t]) === !1) return !1;
		}
		r.observe(e);
	};
	return n((e) => {
		if (e instanceof Element) return i(e);
	}), () => r.disconnect();
}, aa = (e) => (t) => {
	if (e) {
		let n = matchMedia(e);
		if (n.matches) t();
		else return n.addEventListener("change", t, { once: !0 }), () => n.removeEventListener("change", t);
	}
}, oa = (e = []) => (t, n) => {
	pe(e) && (e = [e]);
	let r = !1, i = (e) => {
		r || (r = !0, a(), t(), e.target.dispatchEvent(new e.constructor(e.type, e)));
	}, a = () => {
		n((t) => {
			for (let n of e) t.removeEventListener(n, i);
		});
	};
	return n((t) => {
		for (let n of e) t.addEventListener(n, i, { once: !0 });
	}), a;
};
function sa(e, t) {
	if (Ui(e) && e.data === "[") {
		let n = 1, r = e.nextSibling;
		for (; r;) {
			if (r.nodeType === 1) {
				if (t(r) === !1) break;
			} else if (Ui(r)) {
				if (r.data === "]") {
					if (--n === 0) break;
				} else r.data === "[" && n++;
			}
			r = r.nextSibling;
		}
	} else t(e);
}
var ca = (e) => !!e.type.__asyncLoader;
// @__NO_SIDE_EFFECTS__
function la(e) {
	j(e) && (e = { loader: e });
	let { loader: t, loadingComponent: n, errorComponent: r, delay: i = 200, hydrate: a, timeout: o, suspensible: s = !0, onError: c } = e, l = null, u, d = 0, f = () => (d++, l = null, p()), p = () => {
		let e;
		return l || (e = l = t().catch((e) => {
			if (e = e instanceof Error ? e : Error(String(e)), c) return new Promise((t, n) => {
				c(e, () => t(f()), () => n(e), d + 1);
			});
			throw e;
		}).then((t) => e !== l && l ? l : (t && (t.__esModule || t[Symbol.toStringTag] === "Module") && (t = t.default), u = t, t)));
	};
	return /* @__PURE__ */ B({
		name: "AsyncComponentWrapper",
		__asyncLoader: p,
		__asyncHydrate(e, t, n) {
			let r = e.isConnected, i = !1;
			(t.bu ||= []).push(() => i = !0);
			let o = () => {
				i || !e.parentNode || r && !e.isConnected || n();
			}, s = a ? () => {
				let n = a(o, (t) => sa(e, t));
				n && (t.bum ||= []).push(n);
			} : o;
			u ? s() : p().then(() => !t.isUnmounted && s());
		},
		get __asyncResolved() {
			return u;
		},
		setup() {
			let e = sc;
			if (Mi(e), u) return () => ua(u, e);
			let t = (t) => {
				l = null, pr(t, e, 13, !r);
			};
			if (s && e.suspense || mc) return p().then((t) => () => ua(t, e)).catch((e) => (t(e), () => r ? q(r, { error: e }) : null));
			let a = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(), d = /* @__PURE__ */ L(!!i), f, m;
			return Da(() => {
				f != null && clearTimeout(f), m != null && clearTimeout(m);
			}), i && (m = setTimeout(() => {
				e.isUnmounted || (d.value = !1);
			}, i)), o != null && (f = setTimeout(() => {
				if (!e.isUnmounted && !a.value && !c.value) {
					let e = /* @__PURE__ */ Error(`Async component timed out after ${o}ms.`);
					t(e), c.value = e;
				}
			}, o)), p().then(() => {
				e.isUnmounted || (a.value = !0, e.parent && da(e.parent.vnode) && e.parent.update());
			}).catch((n) => {
				e.isUnmounted ? l = null : (t(n), c.value = n);
			}), () => {
				if (a.value && u) return ua(u, e);
				if (c.value && r) return q(r, { error: c.value });
				if (n && !d.value) return ua(n, e);
			};
		}
	});
}
function ua(e, t) {
	let { ref: n, props: r, children: i, ce: a } = t.vnode, o = q(e, r, i);
	return o.ref = n, o.ce = a, delete t.vnode.ce, o;
}
var da = (e) => e.type.__isKeepAlive, fa = {
	name: "KeepAlive",
	__isKeepAlive: !0,
	props: {
		include: [
			String,
			RegExp,
			Array
		],
		exclude: [
			String,
			RegExp,
			Array
		],
		max: [String, Number]
	},
	setup(e, { slots: t }) {
		let n = cc(), r = n.ctx;
		if (!r.renderer) return () => {
			let e = t.default && t.default();
			return e && e.length === 1 ? e[0] : e;
		};
		let i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = null, s = n.suspense, { renderer: { p: c, m: l, um: u, o: { createElement: d } } } = r, f = d("div");
		r.activate = (e, t, n, r, i) => {
			let a = e.component;
			l(e, t, n, 0, s), c(a.vnode, e, t, n, a, s, r, e.slotScopeIds, i), cs(() => {
				a.isDeactivated = !1, a.a && ke(a.a);
				let t = e.props && e.props.onVnodeMounted;
				t && nc(t, a.parent, e);
			}, s);
		}, r.deactivate = (e) => {
			let t = e.component;
			vs(t.m), vs(t.a), l(e, f, null, 1, s), cs(() => {
				t.da && ke(t.da);
				let n = e.props && e.props.onVnodeUnmounted;
				n && nc(n, t.parent, e), t.isDeactivated = !0;
			}, s);
		};
		function p(e) {
			va(e), u(e, n, s, !0);
		}
		function m(e) {
			i.forEach((t, n) => {
				let r = Ec(ca(t) ? t.type.__asyncResolved || {} : t.type);
				r && !e(r) && h(n);
			});
		}
		function h(e) {
			let t = i.get(e);
			t && (!o || !Us(t, o)) ? p(t) : o && (va(o), t && va(t)), i.delete(e), a.delete(e);
		}
		Qr(() => [e.include, e.exclude], ([e, t]) => {
			e && m((t) => pa(e, t)), t && m((e) => !pa(t, e));
		}, {
			flush: "post",
			deep: !0
		});
		let g = null, _ = () => {
			g != null && (bs(n.subTree.type) ? cs(() => {
				let e = ya(n.subTree);
				e.component && i.set(g, e);
			}, n.subTree.suspense) : i.set(g, ya(n.subTree)));
		};
		return Ca(_), Ta(_), Ea(() => {
			i.forEach((e) => {
				let { subTree: t, suspense: r } = n, i = ya(t);
				if (e.type === i.type && e.key === i.key) {
					va(i);
					let e = i.component.da;
					e && cs(e, r);
				} else p(e);
			});
		}), () => {
			if (g = null, !t.default) return o = null;
			let n = t.default(), r = n[0];
			if (n.length > 1) return o = null, n;
			if (!Hs(r) || !(r.shapeFlag & 4) && !(r.shapeFlag & 128)) return o = null, r;
			let s = ya(r);
			if (s.type === Ps) return o = null, s;
			let c = s.type, l = Ec(ca(s) ? s.type.__asyncResolved || {} : c), { include: u, exclude: d, max: f } = e;
			if (u && (!l || !pa(u, l)) || d && l && pa(d, l)) return s.shapeFlag &= -257, o = s, r;
			let p = s.key == null ? c : s.key, m = i.get(p);
			return s.el && (s = Ys(s), r.shapeFlag & 128 && (r.ssContent = s)), g = p, m ? (s.el = m.el, s.component = m.component, s.transition && Oi(s, s.transition), s.shapeFlag |= 512, a.delete(p), a.add(p)) : (a.add(p), f && a.size > parseInt(f, 10) && h(a.values().next().value)), s.shapeFlag |= 256, o = s, bs(r.type) ? r : s;
		};
	}
};
function pa(e, t) {
	return k(e) ? e.some((e) => pa(e, t)) : pe(e) ? e.split(",").includes(t) : fe(e) ? (e.lastIndex = 0, e.test(t)) : !1;
}
function ma(e, t) {
	ga(e, "a", t);
}
function ha(e, t) {
	ga(e, "da", t);
}
function ga(e, t, n = sc) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (ba(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) da(e.parent.vnode) && _a(r, t, n, e), e = e.parent;
	}
}
function _a(e, t, n, r) {
	let i = ba(t, e, r, !0);
	Da(() => {
		se(r[t], i);
	}, n);
}
function va(e) {
	e.shapeFlag &= -257, e.shapeFlag &= -513;
}
function ya(e) {
	return e.shapeFlag & 128 ? e.ssContent : e;
}
function ba(e, t, n = sc, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			Ct();
			let i = dc(n), a = fr(t, n, e, r);
			return i(), wt(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var xa = (e) => (t, n = sc) => {
	mc && e !== "sp" || ba(e, (...e) => t(...e), n);
}, Sa = xa("bm"), Ca = xa("m"), wa = xa("bu"), Ta = xa("u"), Ea = xa("bum"), Da = xa("um"), Oa = xa("sp"), ka = xa("rtg"), Aa = xa("rtc");
function ja(e, t = sc) {
	ba("ec", e, t);
}
var Ma = "components", Na = "directives";
function Pa(e, t) {
	return Ra(Ma, e, !0, t) || e;
}
var Fa = /* @__PURE__ */ Symbol.for("v-ndc");
function Ia(e) {
	return pe(e) ? Ra(Ma, e, !1) || e : e || Fa;
}
function La(e) {
	return Ra(Na, e);
}
function Ra(e, t, n = !0, r = !1) {
	let i = Ir || sc;
	if (i) {
		let n = i.type;
		if (e === Ma) {
			let e = Ec(n, !1);
			if (e && (e === t || e === N(t) || e === Ee(N(t)))) return n;
		}
		let a = za(i[e] || n[e], t) || za(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function za(e, t) {
	return e && (e[t] || e[N(t)] || e[Ee(N(t))]);
}
function Ba(e, t, n, r) {
	let i, a = n && n[r], o = k(e);
	if (o || pe(e)) {
		let n = o && /* @__PURE__ */ Tn(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ Dn(e), s = /* @__PURE__ */ En(e), e = Rt(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Mn(jn(e[n])) : jn(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		if (!Number.isInteger(e) || e < 0) i = [];
		else {
			i = Array(e);
			for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
		}
	} else if (he(e)) {
		if (e[Symbol.iterator]) i = Array.from(e, (e, n) => t(e, n, void 0, a && a[n]));
		else {
			let n = Object.keys(e);
			i = Array(n.length);
			for (let r = 0, o = n.length; r < o; r++) {
				let o = n[r];
				i[r] = t(e[o], o, r, a && a[r]);
			}
		}
	} else i = [];
	return n && (n[r] = i), i;
}
function Va(e, t) {
	for (let n = 0; n < t.length; n++) {
		let r = t[n];
		if (k(r)) for (let t = 0; t < r.length; t++) e[r[t].name] = r[t].fn;
		else r && (e[r.name] = r.key ? (...e) => {
			let t = r.fn(...e);
			return t && (t.key = r.key), t;
		} : r.fn);
	}
	return e;
}
function V(e, t, n, r, i, a) {
	if (n ??= {}, Ir.ce || Ir.parent && ca(Ir.parent) && Ir.parent.ce) {
		let e = a != null && n.key == null ? oe({}, n, { key: a }) : n, i = Object.keys(e).length > 0;
		return t !== "default" && (e.name = t), U(), G(H, null, [q("slot", e, r && r())], i ? -2 : 64);
	}
	let o = e[t];
	o && o._c && (o._d = !1);
	let s = Is.length;
	U();
	let c;
	try {
		let i = o && Ha(o(n)), s = n.key || a || i && i.key;
		c = G(H, { key: (s && !me(s) ? s : `_${t}`) + (!i && r ? "_fb" : "") }, i || (r ? r() : []), i && e._ === 1 ? 64 : -2);
	} catch (e) {
		for (let e = Is.length; e > s; e--) Rs();
		throw e;
	} finally {
		o && o._c && (o._d = !0);
	}
	return !i && c.scopeId && (c.slotScopeIds = [c.scopeId + "-s"]), c;
}
function Ha(e) {
	return e.some((e) => !Hs(e) || !(e.type === Ps || e.type === H && !Ha(e.children))) ? e : null;
}
function Ua(e, t) {
	let n = {};
	for (let r in e) n[t && /[A-Z]/.test(r) ? `on:${r}` : De(r)] = e[r];
	return n;
}
var Wa = (e) => e ? pc(e) ? Tc(e) : Wa(e.parent) : null, Ga = /* @__PURE__ */ oe(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Wa(e.parent),
	$root: (e) => Wa(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => go(e),
	$forceUpdate: (e) => e.f ||= () => {
		wr(e.update);
	},
	$nextTick: (e) => e.n ||= Sr.bind(e.proxy),
	$watch: (e) => ei.bind(e)
}), Ka = (e, t) => e !== O && !e.__isScriptSetup && le(e, t), qa = {
	get({ _: e }, t) {
		if (t === "__v_skip") return !0;
		let { ctx: n, setupState: r, data: i, props: a, accessCache: o, type: s, appContext: c } = e;
		if (t[0] !== "$") {
			let e = o[t];
			if (e !== void 0) switch (e) {
				case 1: return r[t];
				case 2: return i[t];
				case 4: return n[t];
				case 3: return a[t];
			}
			else if (Ka(r, t)) return o[t] = 1, r[t];
			else if (i !== O && le(i, t)) return o[t] = 2, i[t];
			else if (le(a, t)) return o[t] = 3, a[t];
			else if (n !== O && le(n, t)) return o[t] = 4, n[t];
			else uo && (o[t] = 0);
		}
		let l = Ga[t], u, d;
		if (l) return t === "$attrs" && Pt(e.attrs, "get", ""), l(e);
		if ((u = s.__cssModules) && (u = u[t])) return u;
		if (n !== O && le(n, t)) return o[t] = 4, n[t];
		if (d = c.config.globalProperties, le(d, t)) return d[t];
	},
	set({ _: e }, t, n) {
		let { data: r, setupState: i, ctx: a } = e;
		return Ka(i, t) ? (i[t] = n, !0) : r !== O && le(r, t) ? (r[t] = n, !0) : le(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (a[t] = n, !0);
	},
	has({ _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: i, props: a, type: o } }, s) {
		let c;
		return !!(n[s] || e !== O && s[0] !== "$" && le(e, s) || Ka(t, s) || le(a, s) || le(r, s) || le(Ga, s) || le(i.config.globalProperties, s) || (c = o.__cssModules) && c[s]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? le(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
}, Ja = /* @__PURE__ */ oe({}, qa, {
	get(e, t) {
		if (t !== Symbol.unscopables) return qa.get(e, t, e);
	},
	has(e, t) {
		return t[0] !== "_" && !Fe(t);
	}
});
function Ya() {
	return null;
}
function Xa() {
	return null;
}
function Za(e) {}
function Qa(e) {}
function $a() {
	return null;
}
function eo() {}
function to(e, t) {
	return null;
}
function no() {
	return io("useSlots").slots;
}
function ro() {
	return io("useAttrs").attrs;
}
function io(e) {
	let t = cc();
	return t.setupContext ||= wc(t);
}
function ao(e) {
	return k(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function oo(e, t) {
	let n = ao(e);
	for (let e in t) {
		if (e.startsWith("__skip")) continue;
		let r = n[e];
		r ? k(r) || j(r) ? r = n[e] = {
			type: r,
			default: t[e]
		} : r.default = t[e] : r === null && (r = n[e] = { default: t[e] }), r && t[`__skip_${e}`] && (r.skipFactory = !0);
	}
	return n;
}
function so(e, t) {
	return !e || !t ? e || t : k(e) && k(t) ? e.concat(t) : oe({}, ao(e), ao(t));
}
function co(e, t) {
	let n = {};
	for (let r in e) t.includes(r) || Object.defineProperty(n, r, {
		enumerable: !0,
		get: () => e[r]
	});
	return n;
}
function lo(e) {
	let t = cc(), n = mc, r = e();
	fc(), n && uc(!1);
	let i = () => {
		dc(t), n && uc(!0);
	}, a = () => {
		cc() !== t && t.scope.off(), fc(), n && uc(!1);
	};
	return ge(r) && (r = r.catch((e) => {
		throw i(), Promise.resolve().then(() => Promise.resolve().then(a)), e;
	})), [r, () => {
		i(), Promise.resolve().then(a);
	}];
}
var uo = !0;
function fo(e) {
	let t = go(e), n = e.proxy, r = e.ctx;
	uo = !1, t.beforeCreate && mo(t.beforeCreate, e, "bc");
	let { data: i, computed: a, methods: o, watch: s, provide: c, inject: l, created: u, beforeMount: d, mounted: f, beforeUpdate: p, updated: m, activated: h, deactivated: g, beforeDestroy: _, beforeUnmount: v, destroyed: y, unmounted: b, render: x, renderTracked: S, renderTriggered: C, errorCaptured: w, serverPrefetch: T, expose: E, inheritAttrs: D, components: ee, directives: O, filters: te } = t;
	if (l && po(l, r, null), o) for (let e in o) {
		let t = o[e];
		j(t) && (r[e] = t.bind(n));
	}
	if (i) {
		let t = i.call(n, n);
		he(t) && (e.data = /* @__PURE__ */ bn(t));
	}
	if (uo = !0, a) for (let e in a) {
		let t = a[e], i = Y({
			get: j(t) ? t.bind(n, n) : j(t.get) ? t.get.bind(n, n) : ne,
			set: !j(t) && j(t.set) ? t.set.bind(n) : ne
		});
		Object.defineProperty(r, e, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		});
	}
	if (s) for (let e in s) ho(s[e], r, n, e);
	if (c) {
		let e = j(c) ? c.call(n) : c;
		Reflect.ownKeys(e).forEach((t) => {
			Wr(t, e[t]);
		});
	}
	u && mo(u, e, "c");
	function re(e, t) {
		k(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (re(Sa, d), re(Ca, f), re(wa, p), re(Ta, m), re(ma, h), re(ha, g), re(ja, w), re(Aa, S), re(ka, C), re(Ea, v), re(Da, b), re(Oa, T), k(E)) {
		if (E.length) {
			let t = e.exposed ||= {};
			E.forEach((e) => {
				Object.defineProperty(t, e, {
					get: () => n[e],
					set: (t) => n[e] = t,
					enumerable: !0
				});
			});
		} else e.exposed ||= {};
	}
	x && e.render === ne && (e.render = x), D != null && (e.inheritAttrs = D), ee && (e.components = ee), O && (e.directives = O), T && Mi(e);
}
function po(e, t, n = ne) {
	k(e) && (e = xo(e));
	for (let n in e) {
		let r = e[n], i;
		i = he(r) ? "default" in r ? Gr(r.from || n, r.default, !0) : Gr(r.from || n) : Gr(r), /* @__PURE__ */ Nn(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function mo(e, t, n) {
	fr(k(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function ho(e, t, n, r) {
	let i = r.includes(".") ? ti(n, r) : () => n[r];
	if (pe(e)) {
		let n = t[e];
		j(n) && Qr(i, n);
	} else if (j(e)) Qr(i, e.bind(n));
	else if (he(e)) {
		if (k(e)) e.forEach((e) => ho(e, t, n, r));
		else {
			let r = j(e.handler) ? e.handler.bind(n) : t[e.handler];
			j(r) && Qr(i, r, e);
		}
	}
}
function go(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => _o(c, e, o, !0)), _o(c, t, o)), he(t) && a.set(t, c), c;
}
function _o(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && _o(e, a, n, !0), i && i.forEach((t) => _o(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = vo[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var vo = {
	data: yo,
	props: wo,
	emits: wo,
	methods: Co,
	computed: Co,
	beforeCreate: So,
	created: So,
	beforeMount: So,
	mounted: So,
	beforeUpdate: So,
	updated: So,
	beforeDestroy: So,
	beforeUnmount: So,
	destroyed: So,
	unmounted: So,
	activated: So,
	deactivated: So,
	errorCaptured: So,
	serverPrefetch: So,
	components: Co,
	directives: Co,
	watch: To,
	provide: yo,
	inject: bo
};
function yo(e, t) {
	return t ? e ? function() {
		return oe(j(e) ? e.call(this, this) : e, j(t) ? t.call(this, this) : t);
	} : t : e;
}
function bo(e, t) {
	return Co(xo(e), xo(t));
}
function xo(e) {
	if (k(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function So(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function Co(e, t) {
	return e ? oe(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function wo(e, t) {
	return e ? k(e) && k(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : oe(/* @__PURE__ */ Object.create(null), ao(e), ao(t ?? {})) : t;
}
function To(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = oe(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = So(e[r], t[r]);
	return n;
}
function Eo() {
	return {
		app: null,
		config: {
			isNativeTag: re,
			performance: !1,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var Do = 0;
function Oo(e, t) {
	return function(n, r = null) {
		j(n) || (n = oe({}, n)), r != null && !he(r) && (r = null);
		let i = Eo(), a = /* @__PURE__ */ new WeakSet(), o = [], s = !1, c = i.app = {
			_uid: Do++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Mc,
			get config() {
				return i.config;
			},
			set config(e) {},
			use(e, ...t) {
				return a.has(e) || (e && j(e.install) ? (a.add(e), e.install(c, ...t)) : j(e) && (a.add(e), e(c, ...t))), c;
			},
			mixin(e) {
				return i.mixins.includes(e) || i.mixins.push(e), c;
			},
			component(e, t) {
				return t ? (i.components[e] = t, c) : i.components[e];
			},
			directive(e, t) {
				return t ? (i.directives[e] = t, c) : i.directives[e];
			},
			mount(a, o, l) {
				if (!s) {
					let u = c._ceVNode || q(n, r);
					return u.appContext = i, l === !0 ? l = "svg" : l === !1 && (l = void 0), o && t ? t(u, a) : e(u, a, l), s = !0, c._container = a, a.__vue_app__ = c, Tc(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				s && (fr(o, c._instance, 16), e(null, c._container), delete c._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, c;
			},
			runWithContext(e) {
				let t = ko;
				ko = c;
				try {
					return e();
				} finally {
					ko = t;
				}
			}
		};
		return c;
	};
}
var ko = null;
function Ao(e, t, n = O) {
	let r = cc(), i = N(t), a = Te(t), o = jo(e, i), s = Hn((o, s) => {
		let c, l = O, u;
		return Zr(() => {
			let t = e[i];
			Oe(c, t) && (c = t, s());
		}), {
			get() {
				return o(), n.get ? n.get(c) : c;
			},
			set(e) {
				let o = n.set ? n.set(e) : e;
				if (!Oe(o, c) && !(l !== O && Oe(e, l))) return;
				let d = r.vnode.props, f = !!(d && (t in d || i in d || a in d) && (`onUpdate:${t}` in d || `onUpdate:${i}` in d || `onUpdate:${a}` in d));
				f || (c = e, s()), r.emit(`update:${t}`, o), Oe(e, l) && (Oe(e, o) && !Oe(o, u) || f && l !== O && !Oe(o, c)) && s(), l = e, u = o;
			}
		};
	});
	return s[Symbol.iterator] = () => {
		let e = 0;
		return { next() {
			return e < 2 ? {
				value: e++ ? o || O : s,
				done: !1
			} : { done: !0 };
		} };
	}, s;
}
var jo = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${N(t)}Modifiers`] || e[`${Te(t)}Modifiers`];
function Mo(e, t, ...n) {
	if (e.isUnmounted) return;
	let r = e.vnode.props || O, i = n, a = t.startsWith("update:"), o = a && jo(r, t.slice(7));
	o && (o.trim && (i = n.map((e) => pe(e) ? e.trim() : e)), o.number && (i = i.map(je)));
	let s, c = r[s = De(t)] || r[s = De(N(t))];
	!c && a && (c = r[s = De(Te(t))]), c && fr(c, e, 6, i);
	let l = r[s + "Once"];
	if (l) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[s]) return;
		e.emitted[s] = !0, fr(l, e, 6, i);
	}
}
var No = /* @__PURE__ */ new WeakMap();
function Po(e, t, n = !1) {
	let r = n ? No : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, s = !1;
	if (!j(e)) {
		let r = (e) => {
			let n = Po(e, t, !0);
			n && (s = !0, oe(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !s ? (he(e) && r.set(e, null), null) : (k(a) ? a.forEach((e) => o[e] = null) : oe(o, a), he(e) && r.set(e, o), o);
}
function Fo(e, t) {
	return !e || !ie(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), le(e, t[0].toLowerCase() + t.slice(1)) || le(e, Te(t)) || le(e, t));
}
function Io(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: o, attrs: s, emit: c, render: l, renderCache: u, props: d, data: f, setupState: p, ctx: m, inheritAttrs: h } = e, g = Rr(e), _, v;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			_ = Qs(l.call(t, e, u, d, p, f, m)), v = s;
		} else {
			let e = t;
			_ = Qs(e.length > 1 ? e(d, {
				attrs: s,
				slots: o,
				emit: c
			}) : e(d, null)), v = t.props ? s : Ro(s);
		}
	} catch (t) {
		Is.length = 0, pr(t, e, 1), _ = q(Ps);
	}
	let y = _;
	if (v && h !== !1) {
		let e = Object.keys(v), { shapeFlag: t } = y;
		e.length && t & 7 && (a && e.some(ae) && (v = zo(v, a)), y = Ys(y, v, !1, !0));
	}
	return n.dirs && (y = Ys(y, null, !1, !0), y.dirs = y.dirs ? y.dirs.concat(n.dirs) : n.dirs), n.transition && Oi(ii(y.type) && Di(y) || y, n.transition), _ = y, Rr(g), _;
}
function Lo(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (Hs(r)) {
			if (r.type !== Ps || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var Ro = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || ie(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, zo = (e, t) => {
	let n = {};
	for (let r in e) ae(r) && r.slice(9) in t || (n[r] = e[r]);
	return n;
};
function Bo(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? Vo(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (Ho(o, r, n) && !Fo(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || Vo(r, o, l) : !!o;
	return !1;
}
function Vo(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!le(e, a) || Ho(t, e, a) && !Fo(n, a)) return !0;
	}
	return !1;
}
function Ho(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && he(r) && he(i) ? !Ye(r, i) : r !== i;
}
function Uo({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var Wo = {}, Go = () => Object.create(Wo), Ko = (e) => Object.getPrototypeOf(e) === Wo;
function qo(e, t, n, r = !1) {
	let i = {}, a = Go();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Yo(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ xn(i) : e.type.props ? i : a, e.attrs = a;
}
function Jo(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ kn(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (Fo(e.emitsOptions, o)) continue;
				let u = t[o];
				if (c) {
					if (le(a, o)) u !== a[o] && (a[o] = u, l = !0);
					else {
						let t = N(o);
						i[t] = Xo(c, s, t, u, e, !1);
					}
				} else u !== a[o] && (a[o] = u, l = !0);
			}
		}
	} else {
		Yo(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) t && (le(t, a) || (r = Te(a)) !== a && le(t, r)) || (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Xo(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) t && le(t, e) || (delete a[e], l = !0);
	}
	l && Ft(e.attrs, "set", "");
}
function Yo(e, t, n, r) {
	let [i, a] = e.propsOptions, o = !1, s;
	if (t) for (let c in t) {
		if (xe(c)) continue;
		let l = t[c], u;
		i && le(i, u = N(c)) ? !a || !a.includes(u) ? n[u] = l : (s ||= {})[u] = l : Fo(e.emitsOptions, c) || c in r && l === r[c] || (r[c] = l, o = !0);
	}
	if (a) {
		let t = /* @__PURE__ */ kn(n), r = s || O;
		for (let o = 0; o < a.length; o++) {
			let s = a[o];
			n[s] = Xo(i, t, s, r[s], e, !le(r, s));
		}
	}
	return o;
}
function Xo(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = le(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && j(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = dc(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === Te(n)) && (r = !0));
	}
	return r;
}
var Zo = /* @__PURE__ */ new WeakMap();
function Qo(e, t, n = !1) {
	let r = n ? Zo : t.propsCache, i = r.get(e);
	if (i) return i;
	let a = e.props, o = {}, s = [], c = !1;
	if (!j(e)) {
		let r = (e) => {
			c = !0;
			let [n, r] = Qo(e, t, !0);
			oe(o, n), r && s.push(...r);
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	if (!a && !c) return he(e) && r.set(e, te), te;
	if (k(a)) for (let e = 0; e < a.length; e++) {
		let t = N(a[e]);
		$o(t) && (o[t] = O);
	}
	else if (a) for (let e in a) {
		let t = N(e);
		if ($o(t)) {
			let n = a[e], r = o[t] = k(n) || j(n) ? { type: n } : oe({}, n), i = r.type, c = !1, l = !0;
			if (k(i)) for (let e = 0; e < i.length; ++e) {
				let t = i[e], n = j(t) && t.name;
				if (n === "Boolean") {
					c = !0;
					break;
				}
				n === "String" && (l = !1);
			}
			else c = j(i) && i.name === "Boolean";
			r[0] = c, r[1] = l, (c || le(r, "default")) && s.push(t);
		}
	}
	let l = [o, s];
	return he(e) && r.set(e, l), l;
}
function $o(e) {
	return e[0] !== "$" && !xe(e);
}
var es = (e) => e === "_" || e === "_ctx" || e === "$stable", ts = (e) => k(e) ? e.map(Qs) : [Qs(e)], ns = (e, t, n) => {
	if (t._n) return t;
	let r = z((...e) => ts(t(...e)), n);
	return r._c = !1, r;
}, rs = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (es(n)) continue;
		let i = e[n];
		if (j(i)) t[n] = ns(n, i, r);
		else if (i != null) {
			let e = ts(i);
			t[n] = () => e;
		}
	}
}, is = (e, t) => {
	let n = ts(t);
	e.slots.default = () => n;
}, as = (e, t, n) => {
	for (let r in t) (n || !es(r)) && (e[r] = t[r]);
}, os = (e, t, n) => {
	let r = e.slots = Go();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (as(r, t, n), n && Ae(r, "_", e, !0)) : rs(t, r);
	} else t && is(e, t);
}, ss = (e, t, n) => {
	let { vnode: r, slots: i } = e, a = !0, o = O;
	if (r.shapeFlag & 32) {
		let e = t._;
		e ? n && e === 1 ? a = !1 : as(i, t, n) : (a = !t.$stable, rs(t, i)), o = t;
	} else t && (is(e, t), o = { default: 1 });
	if (a) for (let e in i) !es(e) && o[e] == null && delete i[e];
}, cs = As;
function ls(e) {
	return ds(e);
}
function us(e) {
	return ds(e, Wi);
}
function ds(e, t) {
	let n = Pe();
	n.__VUE__ = !0;
	let { insert: r, remove: i, patchProp: a, createElement: o, createText: s, createComment: c, setText: l, setElementText: u, parentNode: d, nextSibling: f, setScopeId: p = ne, insertStaticContent: m } = e, h = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !Us(e, t) && (r = me(e), A(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === te && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case Ns:
				g(e, t, n, r);
				break;
			case Ps:
				_(e, t, n, r);
				break;
			case Fs:
				e ?? v(t, n, r, o);
				break;
			case H:
				ee(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? x(e, t, n, r, i, a, o, s, c) : d & 6 ? re(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, ge);
		}
		u != null && i ? Ii(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && Ii(e.ref, null, a, e, !0);
	}, g = (e, t, n, i) => {
		if (e == null) r(t.el = s(t.children), n, i);
		else {
			let n = t.el = e.el;
			t.children !== e.children && l(n, t.children);
		}
	}, _ = (e, t, n, i) => {
		e == null ? r(t.el = c(t.children || ""), n, i) : t.el = e.el;
	}, v = (e, t, n, r) => {
		[e.el, e.anchor] = m(e.children, t, n, r, e.el, e.anchor);
	}, y = ({ el: e, anchor: t }, n, i) => {
		let a;
		for (; e && e !== t;) a = f(e), r(e, n, i), e = a;
		r(t, n, i);
	}, b = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = f(e), i(e), e = n;
		i(t);
	}, x = (e, t, n, r, i, a, o, s, c) => {
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) S(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), T(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, S = (e, t, n, i, s, c, l, d) => {
		let f, p, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (f = e.el = o(e.type, c, m && m.is, m), h & 8 ? u(f, e.children) : h & 16 && w(e.children, f, null, i, s, fs(e, c), l, d), _ && Ur(e, null, i, "created"), C(f, e, e.scopeId, l, i), m) {
			for (let e in m) e !== "value" && !xe(e) && a(f, e, null, m[e], c, i);
			"value" in m && a(f, "value", null, m.value, c), (p = m.onVnodeBeforeMount) && nc(p, i, e);
		}
		_ && Ur(e, null, i, "beforeMount");
		let v = ms(s, g);
		v && g.beforeEnter(f), r(f, t, n), ((p = m && m.onVnodeMounted) || v || _) && cs(() => {
			try {
				p && nc(p, i, e), v && g.enter(f), _ && Ur(e, null, i, "mounted");
			} finally {}
		}, s);
	}, C = (e, t, n, r, i) => {
		if (n && p(e, n), r) for (let t = 0; t < r.length; t++) p(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || bs(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				C(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, w = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? $s(e[l]) : Qs(e[l]);
			h(null, c, t, n, r, i, a, o, s);
		}
	}, T = (e, t, n, r, i, o, s) => {
		let c = t.el = e.el, { patchFlag: l, dynamicChildren: d, dirs: f } = t;
		l |= e.patchFlag & 16;
		let p = e.props || O, m = t.props || O, h;
		if (n && ps(n, !1), (h = m.onVnodeBeforeUpdate) && nc(h, n, t, e), f && Ur(t, e, n, "beforeUpdate"), n && ps(n, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (l = 0, s = !1, d = null), (p.innerHTML && m.innerHTML == null || p.textContent && m.textContent == null) && u(c, ""), d ? E(e.dynamicChildren, d, c, n, r, fs(t, i), o) : s || ce(e, t, c, null, n, r, fs(t, i), o, !1), l > 0) {
			if (l & 16) D(c, p, m, n, i);
			else if (l & 2 && p.class !== m.class && a(c, "class", null, m.class, i), l & 4 && a(c, "style", p.style, m.style, i), l & 8) {
				let e = t.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let r = e[t], o = p[r], s = m[r];
					(s !== o || r === "value") && a(c, r, o, s, i, n);
				}
			}
			l & 1 && e.children !== t.children && u(c, t.children);
		} else !s && d == null && D(c, p, m, n, i);
		((h = m.onVnodeUpdated) || f) && cs(() => {
			h && nc(h, n, t, e), f && Ur(t, e, n, "updated");
		}, r);
	}, E = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || ys(c), f = u && (c.type === H || !Us(c, l) || c.shapeFlag & 198) ? d(u) : n;
			h(c, l, f, null, r, i, a, o, !0);
		}
	}, D = (e, t, n, r, i) => {
		if (t !== n) {
			if (t !== O) for (let o in t) !xe(o) && !(o in n) && a(e, o, t[o], null, i, r);
			for (let o in n) {
				if (xe(o)) continue;
				let s = n[o], c = t[o];
				s !== c && o !== "value" && a(e, o, c, s, i, r);
			}
			"value" in n && a(e, "value", t.value, n.value, i);
		}
	}, ee = (e, t, n, i, a, o, c, l, u) => {
		let d = t.el = e ? e.el : s(""), f = t.anchor = e ? e.anchor : s(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (l = l ? l.concat(h) : h), e == null ? (r(d, n, i), r(f, n, i), w(t.children || [], n, f, a, o, c, l, u)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (E(e.dynamicChildren, m, n, a, o, c, l), (t.key != null || a && t === a.subTree) && hs(e, t, !0)) : ce(e, t, n, f, a, o, c, l, u);
	}, re = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : ie(t, n, r, i, a, o, c) : ae(e, t, c);
	}, ie = (e, t, n, r, i, a, o) => {
		let s = e.component = oc(e, r, i);
		if (da(e) && (s.ctx.renderer = ge), hc(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, oe, o, a), !e.el) {
				let r = s.subTree = q(Ps);
				_(null, r, t, n), e.placeholder = r.el;
			}
		} else oe(s, e, t, n, i, a, o);
	}, ae = (e, t, n) => {
		let r = t.component = e.component;
		if (Bo(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, se(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, oe = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = _s(e);
					if (n) {
						t && (t.el = c.el, se(e, t, o)), n.asyncDep.then(() => {
							cs(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, f;
				ps(e, !1), t ? (t.el = c.el, se(e, t, o)) : t = c, n && ke(n), (f = t.props && t.props.onVnodeBeforeUpdate) && nc(f, s, t, c), ps(e, !0);
				let p = Io(e), m = e.subTree;
				e.subTree = p, h(m, p, d(m.el), me(m), e, i, a), t.el = p.el, u === null && Uo(e, p.el), r && cs(r, i), (f = t.props && t.props.onVnodeUpdated) && cs(() => nc(f, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = ca(t);
				if (ps(e, !1), l && ke(l), !m && (o = c && c.onVnodeBeforeMount) && nc(o, d, t), ps(e, !0), s && ve) {
					let t = () => {
						e.subTree = Io(e), ve(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = Io(e);
					h(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && cs(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					cs(() => nc(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && ca(d.vnode) && d.vnode.shapeFlag & 256) && e.a && cs(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new ot(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => wr(u), ps(e, !0), l();
	}, se = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Jo(e, t.props, r, n), ss(e, t.children, n), Ct(), Dr(e), wt();
	}, ce = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, d = e ? e.shapeFlag : 0, f = t.children, { patchFlag: p, shapeFlag: m } = t;
		if (p > 0) {
			if (p & 128) {
				k(l, f, n, r, i, a, o, s, c);
				return;
			}
			if (p & 256) {
				le(l, f, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (d & 16 && pe(l, i, a), f !== l && u(n, f)) : d & 16 ? m & 16 ? k(l, f, n, r, i, a, o, s, c) : pe(l, i, a, !0) : (d & 8 && u(n, ""), m & 16 && w(f, n, r, i, a, o, s, c));
	}, le = (e, t, n, r, i, a, o, s, c) => {
		e ||= te, t ||= te;
		let l = e.length, u = t.length, d = Math.min(l, u), f = 0;
		for (; f < d; f++) {
			let r = t[f] = c ? $s(t[f]) : Qs(t[f]);
			h(e[f], r, n, null, i, a, o, s, c);
		}
		l > u ? pe(e, i, a, !0, !1, d) : w(t, n, r, i, a, o, s, c, d);
	}, k = (e, t, n, r, i, a, o, s, c) => {
		let l = 0, u = t.length, d = e.length - 1, f = u - 1;
		for (; l <= d && l <= f;) {
			let r = e[l], u = t[l] = c ? $s(t[l]) : Qs(t[l]);
			if (Us(r, u)) h(r, u, n, null, i, a, o, s, c);
			else break;
			l++;
		}
		for (; l <= d && l <= f;) {
			let r = e[d], l = t[f] = c ? $s(t[f]) : Qs(t[f]);
			if (Us(r, l)) h(r, l, n, null, i, a, o, s, c);
			else break;
			d--, f--;
		}
		if (l > d) {
			if (l <= f) {
				let e = f + 1, d = e < u ? t[e].el : r;
				for (; l <= f;) h(null, t[l] = c ? $s(t[l]) : Qs(t[l]), n, d, i, a, o, s, c), l++;
			}
		} else if (l > f) for (; l <= d;) A(e[l], i, a, !0), l++;
		else {
			let p = l, m = l, g = /* @__PURE__ */ new Map();
			for (l = m; l <= f; l++) {
				let e = t[l] = c ? $s(t[l]) : Qs(t[l]);
				e.key != null && g.set(e.key, l);
			}
			let _, v = 0, y = f - m + 1, b = !1, x = 0, S = Array(y);
			for (l = 0; l < y; l++) S[l] = 0;
			for (l = p; l <= d; l++) {
				let r = e[l];
				if (v >= y) {
					A(r, i, a, !0);
					continue;
				}
				let u;
				if (r.key != null) u = g.get(r.key);
				else for (_ = m; _ <= f; _++) if (S[_ - m] === 0 && Us(r, t[_])) {
					u = _;
					break;
				}
				u === void 0 ? A(r, i, a, !0) : (S[u - m] = l + 1, u >= x ? x = u : b = !0, h(r, t[u], n, null, i, a, o, s, c), v++);
			}
			let C = b ? gs(S) : te;
			for (_ = C.length - 1, l = y - 1; l >= 0; l--) {
				let e = m + l, d = t[e], f = t[e + 1], p = e + 1 < u ? f.el || ys(f) : r;
				S[l] === 0 ? h(null, d, n, p, i, a, o, s, c) : b && (_ < 0 || l !== C[_] ? ue(d, n, p, 2) : _--);
			}
		}
	}, ue = (e, t, n, a, o = null) => {
		let { el: s, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) ue(e.component.subTree, t, n, a);
		else if (d & 128) e.suspense.move(t, n, a);
		else if (d & 64) c.move(e, t, n, ge);
		else if (c === H) {
			r(s, t, n);
			for (let e = 0; e < u.length; e++) ue(u[e], t, n, a);
			r(e.anchor, t, n);
		} else if (c === Fs) y(e, t, n);
		else if (a !== 2 && d & 1 && l) {
			if (a === 0) l.persisted && !s[gi] ? r(s, t, n) : (l.beforeEnter(s), r(s, t, n), cs(() => l.enter(s), o));
			else {
				let { leave: a, delayLeave: o, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? i(s) : r(s, t, n);
				}, d = () => {
					let e = s._isLeaving || !!s[gi];
					s._isLeaving && s[gi](!0), l.persisted && !e ? u() : a(s, () => {
						u(), c && c();
					});
				};
				o ? o(s, u, d) : d();
			}
		} else r(s, t, n);
	}, A = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (Ct(), Ii(s, null, n, e, !0), wt()), p == null || e.ctx && e.ctx !== t || (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !ca(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && nc(_, t, e), u & 6) j(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Ur(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ge, r) : l && !l.hasOnce && (a !== H || d > 0 && d & 64) ? pe(l, t, n, !1, !0) : (a === H && d & 384 || !i && u & 16) && pe(c, t, n), r && de(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && cs(() => {
			_ && nc(_, t, e), h && Ur(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, de = (e) => {
		let { type: t, el: n, anchor: r, transition: a } = e, o = t === H;
		if (o && !a) {
			fe(n, r);
			return;
		}
		if (t === Fs) {
			b(e), a && !a.persisted && a.afterLeave && a.afterLeave();
			return;
		}
		let s = o ? Ai(e) : e, c = () => {
			o ? d(n) && fe(n, r) : i(n), a && !a.persisted && a.afterLeave && a.afterLeave();
		};
		if (s && s.shapeFlag & 1 && a && !a.persisted) {
			let { leave: e, delayLeave: t } = a, n = s.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, fe = (e, t) => {
		let n;
		for (; e !== t;) n = f(e), i(e), e = n;
		i(t);
	}, j = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		vs(c), vs(l), r && ke(r), i.stop(), a ? (a.flags |= 8, A(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, A(o, e, t, n)), s && cs(s, t), cs(() => {
			e.isUnmounted = !0;
		}, t);
	}, pe = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) A(e[o], t, n, r, i);
	}, me = (e) => {
		if (e.shapeFlag & 6) return me(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = f(e.anchor || e.el), n = t && t[ri];
		return n ? f(n) : t;
	}, he = (e, t, n) => {
		Ar(() => {
			e == null ? t._vnode && A(t._vnode, null, null, !0) : h(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : ac());
	}, ge = {
		p: h,
		um: A,
		m: ue,
		r: de,
		mt: ie,
		mc: w,
		pc: ce,
		pbc: E,
		n: me,
		o: e
	}, _e, ve;
	return t && ([_e, ve] = t(ge)), {
		render: he,
		hydrate: _e,
		createApp: Oo(he, _e)
	};
}
function fs({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function ps({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function ms(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function hs(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (k(r) && k(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = $s(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && hs(t, a)), a.type === Ns && (a.patchFlag === -1 && (a = i[e] = $s(a)), a.el = t.el), a.type === Ps && !a.el && (a.el = t.el);
	}
}
function gs(e) {
	let t = e.slice(), n = [0], r, i, a, o, s, c = e.length;
	for (r = 0; r < c; r++) {
		let c = e[r];
		if (c !== 0) {
			if (i = n[n.length - 1], e[i] < c) {
				t[r] = i, n.push(r);
				continue;
			}
			for (a = 0, o = n.length - 1; a < o;) s = a + o >> 1, e[n[s]] < c ? a = s + 1 : o = s;
			c < e[n[a]] && (a > 0 && (t[r] = n[a - 1]), n[a] = r);
		}
	}
	for (a = n.length, o = n[a - 1]; a-- > 0;) n[a] = o, o = t[o];
	return n;
}
function _s(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : _s(t);
}
function vs(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function ys(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? ys(t.subTree) : null;
}
var bs = (e) => e.__isSuspense, xs = 0, Ss = {
	name: "Suspense",
	__isSuspense: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		if (e == null) ws(t, n, r, i, a, o, s, c, l);
		else {
			if (a && a.deps > 0 && !e.suspense.isInFallback && !a.isHydrating) {
				t.suspense = e.suspense, t.suspense.vnode = t, t.el = e.el;
				return;
			}
			Ts(e, t, n, r, i, o, s, c, l);
		}
	},
	hydrate: Ds,
	normalize: Os
};
function Cs(e, t) {
	let n = e.props && e.props[t];
	j(n) && n();
}
function ws(e, t, n, r, i, a, o, s, c) {
	let { p: l, o: { createElement: u } } = c, d = u("div"), f = e.suspense = Es(e, i, r, t, d, n, a, o, s, c);
	l(null, f.pendingBranch = e.ssContent, d, null, r, f, a, o), f.deps > 0 ? (Cs(e, "onPending"), Cs(e, "onFallback"), l(null, e.ssFallback, t, n, r, null, a, o), js(f, e.ssFallback)) : f.resolve(!1, !0);
}
function Ts(e, t, n, r, i, a, o, s, { p: c, um: l, o: { createElement: u } }) {
	let d = t.suspense = e.suspense;
	d.vnode = t, t.el = e.el;
	let f = t.ssContent, p = t.ssFallback, { activeBranch: m, pendingBranch: h, isInFallback: g, isHydrating: _ } = d;
	if (h) d.pendingBranch = f, Us(h, f) ? (d.deps++, c(h, f, _ ? n : d.hiddenContainer, null, i, d, a, o, s), d.deps--, d.deps <= 0 ? d.resolve() : g && !_ && !d.isFallbackMountPending && (c(m, p, n, r, i, null, a, o, s), js(d, p))) : (d.pendingId = xs++, _ ? (d.isHydrating = !1, d.activeBranch = h) : l(h, i, d), d.deps = 0, d.effects.length = 0, d.hiddenContainer = u("div"), g ? (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 ? d.resolve() : d.isFallbackMountPending || (c(m, p, n, r, i, null, a, o, s), js(d, p))) : m && Us(m, f) ? (c(m, f, n, r, i, d, a, o, s), d.resolve(!0)) : (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 && d.resolve()));
	else if (m && Us(m, f)) c(m, f, n, r, i, d, a, o, s), js(d, f);
	else if (Cs(t, "onPending"), d.pendingBranch = f, d.pendingId = f.shapeFlag & 512 ? f.component.suspenseId : xs++, c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0) d.resolve();
	else {
		let { timeout: e, pendingId: t } = d;
		e > 0 ? setTimeout(() => {
			d.pendingId === t && d.fallback(p);
		}, e) : e === 0 && d.fallback(p);
	}
}
function Es(e, t, n, r, i, a, o, s, c, l, u = !1) {
	let { p: d, m: f, um: p, n: m, o: { parentNode: h, remove: g } } = l, _, v = Ms(e);
	v && t && t.pendingBranch && (_ = t.pendingId, t.deps++);
	let y = e.props ? Me(e.props.timeout) : void 0, b = a, x = {
		vnode: e,
		parent: t,
		parentComponent: n,
		namespace: o,
		container: r,
		hiddenContainer: i,
		deps: 0,
		pendingId: xs++,
		timeout: typeof y == "number" ? y : -1,
		activeBranch: null,
		isFallbackMountPending: !1,
		pendingBranch: null,
		isInFallback: !u,
		isHydrating: u,
		isUnmounted: !1,
		effects: [],
		resolve(e = !1, n = !1) {
			let { vnode: r, activeBranch: i, pendingBranch: o, pendingId: s, effects: c, parentComponent: l, container: u, isInFallback: d } = x, g = !1;
			if (x.isHydrating) x.isHydrating = !1;
			else if (!e) {
				g = i && o.transition && o.transition.mode === "out-in";
				let e = !1;
				g && (i.transition.afterLeave = () => {
					s === x.pendingId && (f(o, u, a === b && !e ? m(i) : a, 0), Er(c), d && r.ssFallback && (r.ssFallback.el = null));
				}), i && !x.isFallbackMountPending && (h(i.el) === u && (a = m(i), e = !0), p(i, l, x, !0), !g && d && r.ssFallback && cs(() => r.ssFallback.el = null, x)), g || f(o, u, a, 0);
			}
			x.isFallbackMountPending = !1, js(x, o), x.pendingBranch = null, x.isInFallback = !1;
			let y = x.parent, S = !1;
			for (; y;) {
				if (y.pendingBranch) {
					for (let e = 0; e < c.length; e++) y.effects.push(c[e]);
					S = !0;
					break;
				}
				y = y.parent;
			}
			!S && !g && Er(c), x.effects = [], v && t && t.pendingBranch && _ === t.pendingId && (_ = void 0, t.deps--, t.deps === 0 && !n && t.resolve()), Cs(r, "onResolve");
		},
		fallback(e) {
			if (!x.pendingBranch) return;
			let { vnode: t, activeBranch: n, parentComponent: r, container: i, namespace: a } = x;
			Cs(t, "onFallback");
			let o = m(n), l = () => {
				if (x.isFallbackMountPending = !1, !x.isInFallback) return;
				let e = x.vnode.ssFallback;
				d(null, e, i, o, r, null, a, s, c), js(x, e);
			}, u = e.transition && e.transition.mode === "out-in";
			u && (x.isFallbackMountPending = !0, n.transition.afterLeave = l), x.isInFallback = !0, p(n, r, null, !0), u || l();
		},
		move(e, t, n) {
			x.activeBranch && f(x.activeBranch, e, t, n), x.container = e;
		},
		next() {
			return x.activeBranch && m(x.activeBranch);
		},
		registerDep(e, t, n, r) {
			let i = !!x.pendingBranch;
			i && x.deps++;
			let a = e.vnode.el;
			e.asyncDep.catch((t) => {
				pr(t, e, 0);
			}).then((o) => {
				if (e.isUnmounted || x.isUnmounted || x.pendingId !== e.suspenseId) return;
				if (fc(), !e.scope.active) {
					i && --x.deps === 0 && x.resolve();
					return;
				}
				e.asyncResolved = !0;
				let { vnode: s } = e;
				_c(e, o, !1), a && (s.el = a);
				let c = !a && e.subTree.el;
				t(e, s, h(a || e.subTree.el), a ? null : m(e.subTree), x, r, n), c && (s.placeholder = null, g(c)), Uo(e, s.el), i && --x.deps === 0 && x.resolve();
			});
		},
		unmount(e, t) {
			x.isUnmounted = !0, x.activeBranch && p(x.activeBranch, n, e, t), x.pendingBranch && p(x.pendingBranch, n, e, t);
		}
	};
	return x;
}
function Ds(e, t, n, r, i, a, o, s, c) {
	let l = t.suspense = Es(t, r, n, e.parentNode, document.createElement("div"), null, i, a, o, s, !0), u = c(e, l.pendingBranch = t.ssContent, n, l, a, o);
	return l.deps === 0 && l.resolve(!1, !0), u;
}
function Os(e) {
	let { shapeFlag: t, children: n } = e, r = t & 32;
	e.ssContent = ks(r ? n.default : n), e.ssFallback = r ? ks(n.fallback) : q(Ps);
}
function ks(e) {
	let t;
	if (j(e)) {
		let n = zs && e._c;
		n && (e._d = !1, U()), e = e(), n && (e._d = !0, t = Ls, Rs());
	}
	return k(e) && (e = Lo(e)), e = Qs(e), t && !e.dynamicChildren && (e.dynamicChildren = t.filter((t) => t !== e)), e;
}
function As(e, t) {
	t && t.pendingBranch ? k(e) ? t.effects.push(...e) : t.effects.push(e) : Er(e);
}
function js(e, t) {
	e.activeBranch = t;
	let { vnode: n, parentComponent: r } = e, i = t.el;
	for (; !i && t.component;) t = t.component.subTree, i = t.el;
	n.el = i, r && r.subTree === n && (r.vnode.el = i, Uo(r, i));
}
function Ms(e) {
	let t = e.props && e.props.suspensible;
	return t != null && t !== !1;
}
var H = /* @__PURE__ */ Symbol.for("v-fgt"), Ns = /* @__PURE__ */ Symbol.for("v-txt"), Ps = /* @__PURE__ */ Symbol.for("v-cmt"), Fs = /* @__PURE__ */ Symbol.for("v-stc"), Is = [], Ls = null;
function U(e = !1) {
	Is.push(Ls = e ? null : []);
}
function Rs() {
	Is.pop(), Ls = Is[Is.length - 1] || null;
}
var zs = 1;
function Bs(e, t = !1) {
	zs += e, e < 0 && Ls && t && (Ls.hasOnce = !0);
}
function Vs(e) {
	return e.dynamicChildren = zs > 0 ? Ls || te : null, Rs(), zs > 0 && Ls && Ls.push(e), e;
}
function W(e, t, n, r, i, a) {
	return Vs(K(e, t, n, r, i, a, !0));
}
function G(e, t, n, r, i) {
	return Vs(q(e, t, n, r, i, !0));
}
function Hs(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function Us(e, t) {
	return e.type === t.type && e.key === t.key;
}
function Ws(e) {}
var Gs = ({ key: e }) => e ?? null, Ks = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : pe(e) || /* @__PURE__ */ Nn(e) || j(e) ? {
	i: Ir,
	r: e,
	k: t,
	f: !!n
} : e);
function K(e, t = null, n = null, r = 0, i = null, a = e === H ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && Gs(t),
		ref: t && Ks(t),
		scopeId: Lr,
		slotScopeIds: null,
		children: n,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag: a,
		patchFlag: r,
		dynamicProps: i,
		dynamicChildren: null,
		appContext: null,
		ctx: Ir
	};
	return s ? (ec(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= pe(n) ? 8 : 16), zs > 0 && !o && Ls && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Ls.push(c), c;
}
var q = qs;
function qs(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== Fa || (e = Ps), Hs(e)) {
		let r = Ys(e, t, !0);
		return n && ec(r, n), zs > 0 && !a && Ls && (r.shapeFlag & 6 ? Ls[Ls.indexOf(e)] = r : Ls.push(r)), r.patchFlag = -2, r;
	}
	if (Dc(e) && (e = e.__vccOpts), t) {
		t = Js(t);
		let { class: e, style: n } = t;
		e && !pe(e) && (t.class = Ve(e)), he(n) && (/* @__PURE__ */ On(n) && !k(n) && (n = oe({}, n)), t.style = Ie(n));
	}
	let o = pe(e) ? 1 : bs(e) ? 128 : ii(e) ? 64 : he(e) ? 4 : j(e) ? 2 : 0;
	return K(e, t, n, r, i, o, a, !0);
}
function Js(e) {
	return e ? /* @__PURE__ */ On(e) || Ko(e) ? oe({}, e) : e : null;
}
function Ys(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? tc(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && Gs(l),
		ref: t && t.ref ? n && a ? k(a) ? a.concat(Ks(t)) : [a, Ks(t)] : Ks(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== H ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && Ys(e.ssContent),
		ssFallback: e.ssFallback && Ys(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && Oi(u, c.clone(u)), u;
}
function Xs(e = " ", t = 0) {
	return q(Ns, null, e, t);
}
function Zs(e, t) {
	let n = q(Fs, null, e);
	return n.staticCount = t, n;
}
function J(e = "", t = !1) {
	return t ? (U(), G(Ps, null, e)) : q(Ps, null, e);
}
function Qs(e) {
	return e == null || typeof e == "boolean" ? q(Ps) : k(e) ? q(H, null, e.slice()) : Hs(e) ? $s(e) : q(Ns, null, String(e));
}
function $s(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : Ys(e);
}
function ec(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (k(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), ec(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !Ko(t) ? t._ctx = Ir : r === 3 && Ir && (Ir.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (j(t)) {
		if (r & 65) {
			ec(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: Ir
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [Xs(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function tc(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = Ve([t.class, r.class]));
		else if (e === "style") t.style = Ie([t.style, r.style]);
		else if (ie(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(k(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !ae(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function nc(e, t, n, r = null) {
	fr(e, t, 7, [n, r]);
}
var rc = Eo(), ic = 0;
function ac() {
	return ic;
}
function oc(e, t, n) {
	let r = e.type, i = (t ? t.appContext : e.appContext) || rc, a = {
		uid: ic++,
		vnode: e,
		type: r,
		parent: t,
		appContext: i,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new et(!0),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: t ? t.provides : Object.create(i.provides),
		ids: t ? t.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: Qo(r, i),
		emitsOptions: Po(r, i),
		emit: null,
		emitted: null,
		propsDefaults: O,
		inheritAttrs: r.inheritAttrs,
		ctx: O,
		data: O,
		props: O,
		attrs: O,
		slots: O,
		refs: O,
		setupState: O,
		setupContext: null,
		suspense: n,
		suspenseId: n ? n.pendingId : 0,
		asyncDep: null,
		asyncResolved: !1,
		isMounted: !1,
		isUnmounted: !1,
		isDeactivated: !1,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	return a.ctx = { _: a }, a.root = t ? t.root : a, a.emit = Mo.bind(null, a), e.ce && e.ce(a), a;
}
var sc = null, cc = () => sc || Ir, lc, uc;
{
	let e = Pe(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	lc = t("__VUE_INSTANCE_SETTERS__", (e) => sc = e), uc = t("__VUE_SSR_SETTERS__", (e) => mc = e);
}
var dc = (e) => {
	let t = sc;
	return lc(e), e.scope.on(), () => {
		e.scope.off(), lc(t);
	};
}, fc = () => {
	sc && sc.scope.off(), lc(null);
};
function pc(e) {
	return e.vnode.shapeFlag & 4;
}
var mc = !1;
function hc(e, t = !1, n = !1) {
	t && uc(t);
	let { props: r, children: i } = e.vnode, a = pc(e);
	qo(e, r, a, t), os(e, i, n || t);
	let o = a ? gc(e, t) : void 0;
	return t && uc(!1), o;
}
function gc(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, qa);
	let { setup: r } = n;
	if (r) {
		Ct();
		let n = e.setupContext = r.length > 1 ? wc(e) : null, i = dc(e), a = dr(r, e, 0, [e.props, n]), o = ge(a);
		if (wt(), i(), (o || e.sp) && !ca(e) && Mi(e), o) {
			if (a.then(fc, fc), t) return a.then((n) => {
				uc(!0);
				try {
					_c(e, n, t);
				} finally {
					uc(!1);
				}
			}).catch((t) => {
				pr(t, e, 0);
			});
			e.asyncDep = a;
		} else _c(e, a, t);
	} else Sc(e, t);
}
function _c(e, t, n) {
	j(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : he(t) && (e.setupState = Bn(t)), Sc(e, n);
}
var vc, yc;
function bc(e) {
	vc = e, yc = (e) => {
		e.render._rc && (e.withProxy = new Proxy(e.ctx, Ja));
	};
}
var xc = () => !vc;
function Sc(e, t, n) {
	let r = e.type;
	if (!e.render) {
		if (!t && vc && !r.render) {
			let t = r.template || go(e).template;
			if (t) {
				let { isCustomElement: n, compilerOptions: i } = e.appContext.config, { delimiters: a, compilerOptions: o } = r, s = oe(oe({
					isCustomElement: n,
					delimiters: a
				}, i), o);
				r.render = vc(t, s);
			}
		}
		e.render = r.render || ne, yc && yc(e);
	}
	{
		let t = dc(e);
		Ct();
		try {
			fo(e);
		} finally {
			wt(), t();
		}
	}
}
var Cc = { get(e, t) {
	return Pt(e, "get", ""), e[t];
} };
function wc(e) {
	return {
		attrs: new Proxy(e.attrs, Cc),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function Tc(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Bn(An(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Ga) return Ga[n](e);
		},
		has(e, t) {
			return t in e || t in Ga;
		}
	}) : e.proxy;
}
function Ec(e, t = !0) {
	return j(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Dc(e) {
	return j(e) && "__vccOpts" in e;
}
var Y = (e, t) => /* @__PURE__ */ Yn(e, t, mc);
function Oc(e, t, n) {
	try {
		Bs(-1);
		let r = arguments.length;
		return r === 2 ? he(t) && !k(t) ? Hs(t) ? q(e, null, [t]) : q(e, t) : q(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && Hs(n) && (n = [n]), q(e, t, n));
	} finally {
		Bs(1);
	}
}
function kc() {}
function Ac(e, t, n, r) {
	let i = n[r];
	if (i && jc(i, e)) return i;
	let a = t();
	return a.memo = e.slice(), a.cacheIndex = r, n[r] = a;
}
function jc(e, t) {
	let n = e.memo;
	if (n.length != t.length) return !1;
	for (let e = 0; e < n.length; e++) if (Oe(n[e], t[e])) return !1;
	return zs > 0 && Ls && Ls.push(e), !0;
}
var Mc = "3.5.44", Nc = ne, Pc = ur, Fc = Nr, Ic = Fr, Lc = {
	createComponentInstance: oc,
	setupComponent: hc,
	renderComponentRoot: Io,
	setCurrentRenderingInstance: Rr,
	isVNode: Hs,
	normalizeVNode: Qs,
	getComponentPublicInstance: Tc,
	ensureValidVNode: Ha,
	pushWarningContext: or,
	popWarningContext: sr
}, Rc = void 0, zc = typeof window < "u" && window.trustedTypes;
if (zc) try {
	Rc = /* @__PURE__ */ zc.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Bc = Rc ? (e) => Rc.createHTML(e) : (e) => e, Vc = "http://www.w3.org/2000/svg", Hc = "http://www.w3.org/1998/Math/MathML", Uc = typeof document < "u" ? document : null, Wc = Uc && /* @__PURE__ */ Uc.createElement("template"), Gc = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Uc.createElementNS(Vc, e) : t === "mathml" ? Uc.createElementNS(Hc, e) : n ? Uc.createElement(e, { is: n }) : Uc.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Uc.createTextNode(e),
	createComment: (e) => Uc.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Uc.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Wc.innerHTML = Bc(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Wc.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Kc = "transition", qc = "animation", Jc = /* @__PURE__ */ Symbol("_vtc"), Yc = {
	name: String,
	type: String,
	css: {
		type: Boolean,
		default: !0
	},
	duration: [
		String,
		Number,
		Object
	],
	enterFromClass: String,
	enterActiveClass: String,
	enterToClass: String,
	appearFromClass: String,
	appearActiveClass: String,
	appearToClass: String,
	leaveFromClass: String,
	leaveActiveClass: String,
	leaveToClass: String
}, Xc = /* @__PURE__ */ oe({}, bi, Yc), Zc = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = Xc, e))((e, { slots: t }) => Oc(Ci, el(e), t)), Qc = (e, t = []) => {
	k(e) ? e.forEach((e) => e(...t)) : e && e(...t);
}, $c = (e) => e ? k(e) ? e.some((e) => e.length > 1) : e.length > 1 : !1;
function el(e) {
	let t = {};
	for (let n in e) n in Yc || (t[n] = e[n]);
	if (e.css === !1) return t;
	let { name: n = "v", type: r, duration: i, enterFromClass: a = `${n}-enter-from`, enterActiveClass: o = `${n}-enter-active`, enterToClass: s = `${n}-enter-to`, appearFromClass: c = a, appearActiveClass: l = o, appearToClass: u = s, leaveFromClass: d = `${n}-leave-from`, leaveActiveClass: f = `${n}-leave-active`, leaveToClass: p = `${n}-leave-to` } = e, m = tl(i), h = m && m[0], g = m && m[1], { onBeforeEnter: _, onEnter: v, onEnterCancelled: y, onLeave: b, onLeaveCancelled: x, onBeforeAppear: S = _, onAppear: C = v, onAppearCancelled: w = y } = t, T = (e, t, n, r) => {
		e._enterCancelled = r, il(e, t ? u : s), il(e, t ? l : o), n && n();
	}, E = (e, t) => {
		e._isLeaving = !1, il(e, d), il(e, p), il(e, f), t && t();
	}, D = (e) => (t, n) => {
		let i = e ? C : v, o = () => T(t, e, n);
		Qc(i, [t, o]), al(() => {
			il(t, e ? c : a), rl(t, e ? u : s), $c(i) || sl(t, r, h, o);
		});
	};
	return oe(t, {
		onBeforeEnter(e) {
			Qc(_, [e]), rl(e, a), rl(e, o);
		},
		onBeforeAppear(e) {
			Qc(S, [e]), rl(e, c), rl(e, l);
		},
		onEnter: D(!1),
		onAppear: D(!0),
		onLeave(e, t) {
			e._isLeaving = !0;
			let n = () => E(e, t);
			rl(e, d), e._enterCancelled ? (rl(e, f), dl(e)) : (dl(e), rl(e, f)), al(() => {
				e._isLeaving && (il(e, d), rl(e, p), $c(b) || sl(e, r, g, n));
			}), Qc(b, [e, n]);
		},
		onEnterCancelled(e) {
			T(e, !1, void 0, !0), Qc(y, [e]);
		},
		onAppearCancelled(e) {
			T(e, !0, void 0, !0), Qc(w, [e]);
		},
		onLeaveCancelled(e) {
			E(e), Qc(x, [e]);
		}
	});
}
function tl(e) {
	if (e == null) return null;
	if (he(e)) return [nl(e.enter), nl(e.leave)];
	{
		let t = nl(e);
		return [t, t];
	}
}
function nl(e) {
	return Me(e);
}
function rl(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.add(t)), (e[Jc] || (e[Jc] = /* @__PURE__ */ new Set())).add(t);
}
function il(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.remove(t));
	let n = e[Jc];
	n && (n.delete(t), n.size || (e[Jc] = void 0));
}
function al(e) {
	requestAnimationFrame(() => {
		requestAnimationFrame(e);
	});
}
var ol = 0;
function sl(e, t, n, r) {
	let i = e._endId = ++ol, a = () => {
		i === e._endId && r();
	};
	if (n != null) return setTimeout(a, n);
	let { type: o, timeout: s, propCount: c } = cl(e, t);
	if (!o) return r();
	let l = o + "end", u = 0, d = () => {
		e.removeEventListener(l, f), a();
	}, f = (t) => {
		t.target === e && ++u >= c && d();
	};
	setTimeout(() => {
		u < c && d();
	}, s + 1), e.addEventListener(l, f);
}
function cl(e, t) {
	let n = window.getComputedStyle(e), r = (e) => (n[e] || "").split(", "), i = r(`${Kc}Delay`), a = r(`${Kc}Duration`), o = ll(i, a), s = r(`${qc}Delay`), c = r(`${qc}Duration`), l = ll(s, c), u = null, d = 0, f = 0;
	t === Kc ? o > 0 && (u = Kc, d = o, f = a.length) : t === qc ? l > 0 && (u = qc, d = l, f = c.length) : (d = Math.max(o, l), u = d > 0 ? o > l ? Kc : qc : null, f = u ? u === Kc ? a.length : c.length : 0);
	let p = u === Kc && /\b(?:transform|all)(?:,|$)/.test(r(`${Kc}Property`).toString());
	return {
		type: u,
		timeout: d,
		propCount: f,
		hasTransform: p
	};
}
function ll(e, t) {
	for (; e.length < t.length;) e = e.concat(e);
	return Math.max(...t.map((t, n) => ul(t) + ul(e[n])));
}
function ul(e) {
	return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function dl(e) {
	return (e ? e.ownerDocument : document).body.offsetHeight;
}
function fl(e, t, n) {
	let r = e[Jc];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var pl = /* @__PURE__ */ Symbol("_vod"), ml = /* @__PURE__ */ Symbol("_vsh"), hl = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[pl] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : gl(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), gl(e, !0), r.enter(e)) : r.leave(e, () => {
			gl(e, !1);
		}) : gl(e, t));
	},
	beforeUnmount(e, { value: t }) {
		gl(e, t);
	}
};
function gl(e, t) {
	e.style.display = t ? e[pl] : "none", e[ml] = !t;
}
function _l() {
	hl.getSSRProps = ({ value: e }) => {
		if (!e) return { style: { display: "none" } };
	};
}
var vl = /* @__PURE__ */ Symbol("");
function yl(e) {
	let t = cc();
	if (!t) return;
	let n = t.ut = (n = e(t.proxy)) => {
		Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach((e) => xl(e, n));
	}, r = () => {
		let r = e(t.proxy);
		t.ce ? xl(t.ce, r) : bl(t.subTree, r), n(r);
	};
	wa(() => {
		Er(r);
	}), Ca(() => {
		Qr(r, ne, { flush: "post" });
		let e = new MutationObserver(r);
		e.observe(t.subTree.el.parentNode, { childList: !0 }), Da(() => e.disconnect());
	});
}
function bl(e, t) {
	if (e.shapeFlag & 128) {
		let n = e.suspense;
		e = n.activeBranch, n.pendingBranch && !n.isHydrating && n.effects.push(() => {
			bl(n.activeBranch, t);
		});
	}
	for (; e.component;) e = e.component.subTree;
	if (e.shapeFlag & 1 && e.el) xl(e.el, t);
	else if (e.type === H) e.children.forEach((e) => bl(e, t));
	else if (e.type === Fs) {
		let { el: n, anchor: r } = e;
		for (; n && (xl(n, t), n !== r);) n = n.nextSibling;
	}
}
function xl(e, t) {
	if (e.nodeType === 1) {
		let n = e.style, r = "";
		for (let e in t) {
			let i = I(t[e]);
			n.setProperty(`--${e}`, i), r += `--${e}: ${i};`;
		}
		n[vl] = r;
	}
}
var Sl = /(?:^|;)\s*display\s*:/;
function Cl(e, t, n) {
	let r = e.style, i = pe(n), a = !1;
	if (n && !i) {
		if (t) {
			if (pe(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? Tl(r, t, "");
			}
			else for (let e in t) n[e] ?? Tl(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? Tl(r, i, "") : kl(e, i, !pe(t) && t ? t[i] : void 0, o) || Tl(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[vl];
			e && (n += ";" + e), r.cssText = n, a = Sl.test(n);
		}
	} else t && e.removeAttribute("style");
	pl in e && (i && t === n || (e[pl] = a ? r.display : ""), e[ml] && (r.display = "none"));
}
var wl = /\s*!important$/;
function Tl(e, t, n) {
	if (k(n)) n.forEach((n) => Tl(e, t, n));
	else if (n ??= "", t.startsWith("--")) wl.test(n) ? e.setProperty(t, n.replace(wl, ""), "important") : e.setProperty(t, n);
	else {
		let r = Ol(e, t);
		wl.test(n) ? e.setProperty(Te(r), n.replace(wl, ""), "important") : e[r] = n;
	}
}
var El = [
	"Webkit",
	"Moz",
	"ms"
], Dl = {};
function Ol(e, t) {
	let n = Dl[t];
	if (n) return n;
	let r = N(t);
	if (r !== "filter" && r in e) return Dl[t] = r;
	r = Ee(r);
	for (let n = 0; n < El.length; n++) {
		let i = El[n] + r;
		if (i in e) return Dl[t] = i;
	}
	return t;
}
function kl(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && pe(r) && n === r;
}
var Al = "http://www.w3.org/1999/xlink";
function jl(e, t, n, r, i, a = Ue(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Al, t.slice(6, t.length)) : e.setAttributeNS(Al, t, n) : n == null || a && !We(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : me(n) ? String(n) : n);
}
function Ml(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Bc(n) : n);
		return;
	}
	let a = e.tagName;
	if (t === "value" && a !== "PROGRESS" && !a.includes("-")) {
		let r = a === "OPTION" ? e.getAttribute("value") || "" : e.value, i = n == null ? e.type === "checkbox" ? "on" : "" : String(n);
		r === i && "_value" in e || (e.value = i), n ?? e.removeAttribute(t), e._value = n;
		return;
	}
	let o = !1;
	if (n === "" || n == null) {
		let r = typeof e[t];
		r === "boolean" ? n = We(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function Nl(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function Pl(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var Fl = /* @__PURE__ */ Symbol("_vei");
function Il(e, t, n, r, i = null) {
	let a = e[Fl] || (e[Fl] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = zl(t);
		r ? Nl(e, n, a[t] = Ul(r, i), s) : o && (Pl(e, n, o, s), a[t] = void 0);
	}
}
var Ll = /(Once|Passive|Capture)$/, Rl = /^on:?(?:Once|Passive|Capture)$/;
function zl(e) {
	let t, n;
	for (; (n = e.match(Ll)) && !Rl.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : Te(e.slice(2)), t];
}
var Bl = 0, Vl = /* @__PURE__ */ Promise.resolve(), Hl = () => Bl ||= (Vl.then(() => Bl = 0), Date.now());
function Ul(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		let r = n.value;
		if (k(r)) {
			let n = e.stopImmediatePropagation;
			e.stopImmediatePropagation = () => {
				n.call(e), e._stopped = !0;
			};
			let i = r.slice(), a = [e];
			for (let n = 0; n < i.length && !e._stopped; n++) {
				let e = i[n];
				e && fr(e, t, 5, a);
			}
		} else fr(r, t, 5, [e]);
	};
	return n.value = e, n.attached = Hl(), n;
}
var Wl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Gl = (e, t, n, r, i, a) => {
	let o = i === "svg";
	t === "class" ? fl(e, r, o) : t === "style" ? Cl(e, n, r) : ie(t) ? ae(t) || Il(e, t, n, r, a) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : Kl(e, t, r, o)) ? (Ml(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || jl(e, t, r, o, a, t !== "value")) : e._isVueCE && (ql(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !pe(r))) ? Ml(e, N(t), r, a, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), jl(e, t, r, o));
};
function Kl(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && Wl(t) && j(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return Wl(t) && pe(n) ? !1 : t in e;
}
function ql(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = N(t);
	return Array.isArray(n) ? n.some((e) => N(e) === r) : Object.keys(n).some((e) => N(e) === r);
}
var Jl = {};
// @__NO_SIDE_EFFECTS__
function Yl(e, t, n) {
	let r = /* @__PURE__ */ B(e, t);
	be(r) && (r = oe({}, r, t));
	class i extends Ql {
		constructor(e) {
			super(r, e, n);
		}
	}
	return i.def = r, i;
}
var Xl = /* @__NO_SIDE_EFFECTS__ */ ((e, t) => /* @__PURE__ */ Yl(e, t, Yu)), Zl = typeof HTMLElement < "u" ? HTMLElement : class {}, Ql = class e extends Zl {
	constructor(e, t = {}, n = Ju) {
		super(), this._def = e, this._props = t, this._createApp = n, this._isVueCE = !0, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = !1, this._resolved = !1, this._patching = !1, this._dirty = !1, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._styleAnchors = /* @__PURE__ */ new WeakMap(), this._ob = null, this.shadowRoot && n !== Ju ? this._root = this.shadowRoot : e.shadowRoot === !1 ? this._root = this : (this.attachShadow(oe({}, e.shadowRootOptions, { mode: "open" })), this._root = this.shadowRoot);
	}
	connectedCallback() {
		if (!this.isConnected) return;
		!this.shadowRoot && !this._resolved && this._parseSlots(), this._connected = !0;
		let t = this;
		for (; t &&= t.assignedSlot || t.parentNode || t.host;) if (t instanceof e) {
			this._parent = t;
			break;
		}
		this._instance || (this._resolved ? this._mount(this._def) : t && t._pendingResolve ? this._pendingResolve = t._pendingResolve.then(() => {
			if (this._pendingResolve = void 0, this.isConnected) return this._resolveDef();
		}) : this._resolveDef());
	}
	_setParent(e = this._parent) {
		e && (this._instance.parent = e._instance, this._inheritParentContext(e));
	}
	_inheritParentContext(e = this._parent) {
		e && this._app && Object.setPrototypeOf(this._app._context.provides, e._instance.provides);
	}
	disconnectedCallback() {
		this._connected = !1, Sr(() => {
			this._connected || (this._ob &&= (this._ob.disconnect(), null), this._app && this._app.unmount(), this._instance && (this._instance.ce = void 0), this._app = this._instance = null, this._teleportTargets &&= (this._teleportTargets.clear(), void 0));
		});
	}
	_processMutations(e) {
		for (let t of e) this._setAttr(t.attributeName);
	}
	_resolveDef() {
		if (this._pendingResolve) return this._pendingResolve;
		for (let e = 0; e < this.attributes.length; e++) this._setAttr(this.attributes[e].name);
		this._ob = new MutationObserver(this._processMutations.bind(this)), this._ob.observe(this, { attributes: !0 });
		let e = (e, t = !1) => {
			this._resolved = !0, this._pendingResolve = void 0;
			let { props: n, styles: r } = e, i;
			if (n && !k(n)) for (let e in n) {
				let t = n[e];
				(t === Number || t && t.type === Number) && (e in this._props && (this._props[e] = Me(this._props[e])), (i ||= /* @__PURE__ */ Object.create(null))[N(e)] = !0);
			}
			this._numberProps = i, this._resolveProps(e), this.shadowRoot && this._applyStyles(r), this._connected && this._mount(e);
		}, t = this._def.__asyncLoader;
		if (t) return this._pendingResolve = t().then((t) => {
			t.configureApp = this._def.configureApp, e(this._def = t, !0);
		}), this._pendingResolve;
		e(this._def);
	}
	_mount(e) {
		this._app = this._createApp(e), this._inheritParentContext(), e.configureApp && e.configureApp(this._app), this._app._ceVNode = this._createVNode(), this._app.mount(this._root);
		let t = this._instance && this._instance.exposed;
		if (t) for (let e in t) le(this, e) || Object.defineProperty(this, e, { get: () => R(t[e]) });
	}
	_resolveProps(e) {
		let { props: t } = e, n = k(t) ? t : Object.keys(t || {});
		for (let e of Object.keys(this)) e[0] !== "_" && n.includes(e) && this._setProp(e, this[e]);
		for (let e of n.map(N)) Object.defineProperty(this, e, {
			get() {
				return this._getProp(e);
			},
			set(t) {
				this._setProp(e, t, !0, !this._patching);
			}
		});
	}
	_setAttr(e) {
		if (e.startsWith("data-v-")) return;
		let t = this.hasAttribute(e), n = t ? this.getAttribute(e) : Jl, r = N(e);
		t && this._numberProps && this._numberProps[r] && (n = Me(n)), this._setProp(r, n, !1, !0);
	}
	_getProp(e) {
		return this._props[e];
	}
	_setProp(e, t, n = !0, r = !1) {
		if (t !== this._props[e] && (this._dirty = !0, t === Jl ? delete this._props[e] : (this._props[e] = t, e === "key" && this._app && (this._app._ceVNode.key = t)), r && this._instance && this._update(), n)) {
			let n = this._ob;
			n && (this._processMutations(n.takeRecords()), n.disconnect()), t === !0 ? this.setAttribute(Te(e), "") : typeof t == "string" || typeof t == "number" ? this.setAttribute(Te(e), t + "") : t || this.removeAttribute(Te(e)), n && n.observe(this, { attributes: !0 });
		}
	}
	_update() {
		let e = this._createVNode();
		this._app && (e.appContext = this._app._context), Ku(e, this._root);
	}
	_createVNode() {
		let e = {};
		this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
		let t = q(this._def, oe(e, this._props));
		return this._instance || (t.ce = (e) => {
			this._instance = e, e.ce = this, e.isCE = !0;
			let t = (e, t) => {
				this.dispatchEvent(new CustomEvent(e, be(t[0]) ? oe({ detail: t }, t[0]) : { detail: t }));
			};
			e.emit = (e, ...n) => {
				t(e, n), Te(e) !== e && t(Te(e), n);
			}, this._setParent();
		}), t;
	}
	_applyStyles(e, t, n) {
		if (!e) return;
		if (t) {
			if (t === this._def || this._styleChildren.has(t)) return;
			this._styleChildren.add(t);
		}
		let r = this._nonce, i = this.shadowRoot, a = n ? this._getStyleAnchor(n) || this._getStyleAnchor(this._def) : this._getRootStyleInsertionAnchor(i), o = null;
		for (let s = e.length - 1; s >= 0; s--) {
			let c = document.createElement("style");
			r && c.setAttribute("nonce", r), c.textContent = e[s], i.insertBefore(c, o || a), o = c, s === 0 && (n || this._styleAnchors.set(this._def, c), t && this._styleAnchors.set(t, c));
		}
	}
	_getStyleAnchor(e) {
		if (!e) return null;
		let t = this._styleAnchors.get(e);
		return t && t.parentNode === this.shadowRoot ? t : (t && this._styleAnchors.delete(e), null);
	}
	_getRootStyleInsertionAnchor(e) {
		for (let t = 0; t < e.childNodes.length; t++) {
			let n = e.childNodes[t];
			if (!(n instanceof HTMLStyleElement)) return n;
		}
		return null;
	}
	_parseSlots() {
		let e = this._slots = {}, t;
		for (; t = this.firstChild;) {
			let n = t.nodeType === 1 && t.getAttribute("slot") || "default";
			(e[n] || (e[n] = [])).push(t), this.removeChild(t);
		}
	}
	_renderSlots() {
		let e = this._getSlots(), t = this._instance.type.__scopeId;
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = r.getAttribute("name") || "default", a = this._slots[i], o = r.parentNode;
			if (a) for (let e of a) {
				if (t && e.nodeType === 1) {
					let n = t + "-s", r = document.createTreeWalker(e, 1);
					e.setAttribute(n, "");
					let i;
					for (; i = r.nextNode();) i.setAttribute(n, "");
				}
				o.insertBefore(e, r);
			}
			else for (; r.firstChild;) o.insertBefore(r.firstChild, r);
			o.removeChild(r);
		}
	}
	_getSlots() {
		let e = [this];
		this._teleportTargets && e.push(...this._teleportTargets);
		let t = /* @__PURE__ */ new Set();
		for (let n of e) {
			let e = n.querySelectorAll("slot");
			for (let n = 0; n < e.length; n++) t.add(e[n]);
		}
		return Array.from(t);
	}
	_injectChildStyle(e, t) {
		this._applyStyles(e.styles, e, t);
	}
	_beginPatch() {
		this._patching = !0, this._dirty = !1;
	}
	_endPatch() {
		this._patching = !1, this._dirty && this._instance && this._update();
	}
	_hasShadowRoot() {
		return this._def.shadowRoot !== !1;
	}
	_removeChildStyle(e) {}
};
function $l(e) {
	let t = cc();
	return t && t.ce || null;
}
function eu() {
	let e = $l();
	return e && e.shadowRoot;
}
function tu(e = "$style") {
	{
		let t = cc();
		if (!t) return O;
		let n = t.type.__cssModules;
		return n && n[e] || O;
	}
}
var nu = /* @__PURE__ */ new WeakMap(), ru = /* @__PURE__ */ new WeakMap(), iu = /* @__PURE__ */ Symbol("_moveCb"), au = /* @__PURE__ */ Symbol("_enterCb"), ou = /* @__PURE__ */ new WeakMap(), su = /* @__PURE__ */ ((e) => (delete e.props.mode, e))({
	name: "TransitionGroup",
	props: /* @__PURE__ */ oe({}, Xc, {
		tag: String,
		moveClass: String
	}),
	setup(e, { slots: t }) {
		let n = cc(), r = vi(), i, a, o, s, c = () => (s === void 0 && (s = i.length > 0 && gu(i[0].el, n.vnode.el, lu(e))), s);
		return Ta(() => {
			if (ou.delete(n), !c()) {
				i = [], o = void 0;
				return;
			}
			let t = lu(e);
			i.forEach(cu);
			let r = o && hu(o, n.vnode.el);
			o = void 0, i.forEach((e) => uu(e, r));
			let a = i.filter(du);
			dl(n.vnode.el), a.forEach((e) => {
				let n = e.el, r = n.style;
				rl(n, t), r.transform = r.webkitTransform = r.transitionDuration = "";
				let i = n[iu] = (e) => {
					e && e.target !== n || (!e || e.propertyName.endsWith("transform")) && (n.removeEventListener("transitionend", i), n[iu] = null, il(n, t));
				};
				n.addEventListener("transitionend", i);
			}), i = [];
		}), () => {
			let l = /* @__PURE__ */ kn(e), u = el(l), d = l.tag || H;
			if (i = [], s = void 0, a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && !t.el[ml] && (i.push(t), Oi(t, Ti(t, u, r, n)), nu.set(t, fu(t.el)));
			}
			a = t.default ? ki(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && Oi(t, Ti(t, u, r, n));
			}
			return i.length && (o = pu(n), ou.set(n, c)), q(d, null, a);
		};
	}
});
function cu(e) {
	let t = e.el;
	t[iu] && t[iu](), t[au] && t[au]();
}
function lu(e) {
	return e.moveClass || `${e.name || "v"}-move`;
}
function uu(e, t) {
	ru.set(e, fu(e.el, t));
}
function du(e) {
	let t = nu.get(e), n = ru.get(e), r = t.left - n.left, i = t.top - n.top;
	if (r || i) {
		let t = e.el, n = t.style, a = t.getBoundingClientRect(), o = 1, s = 1;
		return t.offsetWidth && (o = a.width / t.offsetWidth), t.offsetHeight && (s = a.height / t.offsetHeight), Number.isFinite(o) && o !== 0 || (o = 1), Number.isFinite(s) && s !== 0 || (s = 1), Math.abs(o - 1) < .01 && (o = 1), Math.abs(s - 1) < .01 && (s = 1), n.transform = n.webkitTransform = `translate(${r / o}px,${i / s}px)`, n.transitionDuration = "0s", e;
	}
}
function fu(e, t) {
	let n = e.getBoundingClientRect();
	return {
		left: n.left - (t ? t.left : 0),
		top: n.top - (t ? t.top : 0)
	};
}
function pu(e) {
	let t;
	for (let n = e.parent; n; n = n.parent) {
		let r = ou.get(n);
		if (r) {
			let i = mu(n.vnode.el, e.vnode.el);
			i && (t ||= []).push(oe(fu(i), {
				item: i,
				willMove: r
			}));
		}
	}
	return t;
}
function mu(e, t) {
	let n = e.nodeType === 1 ? e : e.parentNode;
	for (; t && t.parentNode !== n;) t = t.parentNode;
	if (t && t.nodeType === 1) return t;
}
function hu(e, t) {
	let n = e.find((e) => e.willMove() && e.item.contains(t));
	return n && fu(n.item, n);
}
function gu(e, t, n) {
	let r = e.cloneNode(), i = e[Jc];
	i && i.forEach((e) => {
		e.split(/\s+/).forEach((e) => e && r.classList.remove(e));
	}), n.split(/\s+/).forEach((e) => e && r.classList.add(e)), r.style.display = "none";
	let a = t.nodeType === 1 ? t : t.parentNode;
	a.appendChild(r);
	let { hasTransform: o } = cl(r);
	return a.removeChild(r), o;
}
var _u = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return k(t) ? (e) => ke(t, e) : t;
};
function vu(e) {
	e.target.composing = !0;
}
function yu(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var bu = /* @__PURE__ */ Symbol("_assign"), xu = /* @__PURE__ */ Symbol("_initialValue");
function Su(e, t, n) {
	return t && (e = e.trim()), n && (e = je(e)), e;
}
var Cu = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[xu] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[xu] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[bu] = _u(i);
		let a = r || i.props && i.props.type === "number";
		Nl(e, t ? "change" : "input", (t) => {
			t.target.composing || e[bu](Su(e.value, n, a));
		}), (n || a) && Nl(e, "change", () => {
			e.value = Su(e.value, n, a);
		}), t || (Nl(e, "compositionstart", vu), Nl(e, "compositionend", yu), Nl(e, "change", yu));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[xu];
		delete e[xu], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[bu](Su(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[bu] = _u(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? je(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, wu = {
	deep: !0,
	created(e, t, n) {
		e[bu] = _u(n), Nl(e, "change", () => {
			let t = e._modelValue, n = Au(e), r = e.checked, i = e[bu];
			if (k(t)) {
				let e = Xe(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (A(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(ju(e, r));
		});
	},
	mounted: Tu,
	beforeUpdate(e, t, n) {
		e[bu] = _u(n), Tu(e, t, n);
	}
};
function Tu(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (k(t)) i = Xe(t, r.props.value) > -1;
	else if (A(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = Ye(t, ju(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var Eu = {
	created(e, { value: t }, n) {
		e.checked = Ye(t, n.props.value), e[bu] = _u(n), Nl(e, "change", () => {
			e[bu](Au(e));
		});
	},
	beforeUpdate(e, { value: t, oldValue: n }, r) {
		e[bu] = _u(r), t !== n && (e.checked = Ye(t, r.props.value));
	}
}, Du = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, Nl(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? je(Au(e)) : Au(e)), r = e.multiple, i = r ? A(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? k(i) ? t.slice() : t : i];
			try {
				e[bu](i);
			} finally {
				Sr(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[bu] = _u(r);
	},
	mounted(e, { value: t }) {
		ku(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[bu] = _u(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, n && n[0] === e.multiple && Ou(t, n[1], n[0]) || ku(e, t);
	}
};
function Ou(e, t, n) {
	if (!n || k(e)) return Ye(e, t);
	if (A(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function ku(e, t) {
	let n = e.multiple, r = k(t);
	if (!n || r || A(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = Au(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : Xe(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (Ye(Au(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function Au(e) {
	return "_value" in e ? e._value : e.value;
}
function ju(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Mu = {
	created(e, t, n) {
		Pu(e, t, n, null, "created");
	},
	mounted(e, t, n) {
		Pu(e, t, n, null, "mounted");
	},
	beforeUpdate(e, t, n, r) {
		Pu(e, t, n, r, "beforeUpdate");
	},
	updated(e, t, n, r) {
		Pu(e, t, n, r, "updated");
	}
};
function Nu(e, t) {
	switch (e) {
		case "SELECT": return Du;
		case "TEXTAREA": return Cu;
		default: switch (t) {
			case "checkbox": return wu;
			case "radio": return Eu;
			default: return Cu;
		}
	}
}
function Pu(e, t, n, r, i) {
	let a = Nu(e.tagName, n.props && n.props.type)[i];
	a && a(e, t, n, r);
}
function Fu() {
	Cu.getSSRProps = ({ value: e }) => ({ value: e }), Eu.getSSRProps = ({ value: e }, t) => {
		if (t.props && Ye(t.props.value, e)) return { checked: !0 };
	}, wu.getSSRProps = ({ value: e }, t) => {
		if (k(e)) {
			if (t.props && Xe(e, t.props.value) > -1) return { checked: !0 };
		} else if (A(e)) {
			if (t.props && e.has(t.props.value)) return { checked: !0 };
		} else if (e) return { checked: !0 };
	}, Mu.getSSRProps = (e, t) => {
		if (typeof t.type != "string") return;
		let n = Nu(t.type.toUpperCase(), t.props && t.props.type);
		if (n.getSSRProps) return n.getSSRProps(e, t);
	};
}
var Iu = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Lu = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, t) => Iu.some((n) => e[`${n}Key`] && !t.includes(n))
}, Ru = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Lu[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, zu = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, Bu = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = Te(n.key);
		if (t.some((e) => e === r || zu[e] === r)) return e(n);
	}));
}, Vu = /* @__PURE__ */ oe({ patchProp: Gl }, Gc), Hu, Uu = !1;
function Wu() {
	return Hu ||= ls(Vu);
}
function Gu() {
	return Hu = Uu ? Hu : us(Vu), Uu = !0, Hu;
}
var Ku = ((...e) => {
	Wu().render(...e);
}), qu = ((...e) => {
	Gu().hydrate(...e);
}), Ju = ((...e) => {
	let t = Wu().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Zu(e);
		if (!r) return;
		let i = t._component;
		j(i) || i.render || i.template || (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Xu(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
}), Yu = ((...e) => {
	let t = Gu().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let t = Zu(e);
		if (t) return n(t, !0, Xu(t));
	}, t;
});
function Xu(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Zu(e) {
	return pe(e) ? document.querySelector(e) : e;
}
var Qu = !1, $u = () => {
	Qu || (Qu = !0, Fu(), _l());
}, ed = /* @__PURE__ */ _({
	BaseTransition: () => Ci,
	BaseTransitionPropsValidators: () => bi,
	Comment: () => Ps,
	DeprecationTypes: () => null,
	EffectScope: () => et,
	ErrorCodes: () => lr,
	ErrorTypeStrings: () => Pc,
	Fragment: () => H,
	KeepAlive: () => fa,
	ReactiveEffect: () => ot,
	Static: () => Fs,
	Suspense: () => Ss,
	Teleport: () => pi,
	Text: () => Ns,
	TrackOpTypes: () => Xn,
	Transition: () => Zc,
	TransitionGroup: () => su,
	TriggerOpTypes: () => Zn,
	VueElement: () => Ql,
	assertNumber: () => cr,
	callWithAsyncErrorHandling: () => fr,
	callWithErrorHandling: () => dr,
	camelize: () => N,
	capitalize: () => Ee,
	cloneVNode: () => Ys,
	compatUtils: () => null,
	compile: () => td,
	computed: () => Y,
	createApp: () => Ju,
	createBlock: () => G,
	createCommentVNode: () => J,
	createElementBlock: () => W,
	createElementVNode: () => K,
	createHydrationRenderer: () => us,
	createPropsRestProxy: () => co,
	createRenderer: () => ls,
	createSSRApp: () => Yu,
	createSlots: () => Va,
	createStaticVNode: () => Zs,
	createTextVNode: () => Xs,
	createVNode: () => q,
	customRef: () => Hn,
	defineAsyncComponent: () => la,
	defineComponent: () => B,
	defineCustomElement: () => Yl,
	defineEmits: () => Xa,
	defineExpose: () => Za,
	defineModel: () => eo,
	defineOptions: () => Qa,
	defineProps: () => Ya,
	defineSSRCustomElement: () => Xl,
	defineSlots: () => $a,
	devtools: () => Fc,
	effect: () => yt,
	effectScope: () => tt,
	getCurrentInstance: () => cc,
	getCurrentScope: () => nt,
	getCurrentWatcher: () => tr,
	getTransitionRawChildren: () => ki,
	guardReactiveProps: () => Js,
	h: () => Oc,
	handleError: () => pr,
	hasInjectionContext: () => Kr,
	hydrate: () => qu,
	hydrateOnIdle: () => na,
	hydrateOnInteraction: () => oa,
	hydrateOnMediaQuery: () => aa,
	hydrateOnVisible: () => ia,
	initCustomFormatter: () => kc,
	initDirectivesForSSR: () => $u,
	inject: () => Gr,
	isMemoSame: () => jc,
	isProxy: () => On,
	isReactive: () => Tn,
	isReadonly: () => En,
	isRef: () => Nn,
	isRuntimeOnly: () => xc,
	isShallow: () => Dn,
	isVNode: () => Hs,
	markRaw: () => An,
	mergeDefaults: () => oo,
	mergeModels: () => so,
	mergeProps: () => tc,
	nextTick: () => Sr,
	nodeOps: () => Gc,
	normalizeClass: () => Ve,
	normalizeProps: () => He,
	normalizeStyle: () => Ie,
	onActivated: () => ma,
	onBeforeMount: () => Sa,
	onBeforeUnmount: () => Ea,
	onBeforeUpdate: () => wa,
	onDeactivated: () => ha,
	onErrorCaptured: () => ja,
	onMounted: () => Ca,
	onRenderTracked: () => Aa,
	onRenderTriggered: () => ka,
	onScopeDispose: () => rt,
	onServerPrefetch: () => Oa,
	onUnmounted: () => Da,
	onUpdated: () => Ta,
	onWatcherCleanup: () => nr,
	openBlock: () => U,
	patchProp: () => Gl,
	popScopeId: () => Br,
	provide: () => Wr,
	proxyRefs: () => Bn,
	pushScopeId: () => zr,
	queuePostFlushCb: () => Er,
	reactive: () => bn,
	readonly: () => Sn,
	ref: () => L,
	registerRuntimeCompiler: () => bc,
	render: () => Ku,
	renderList: () => Ba,
	renderSlot: () => V,
	resolveComponent: () => Pa,
	resolveDirective: () => La,
	resolveDynamicComponent: () => Ia,
	resolveFilter: () => null,
	resolveTransitionHooks: () => Ti,
	setBlockTracking: () => Bs,
	setDevtoolsHook: () => Ic,
	setTransitionHooks: () => Oi,
	shallowReactive: () => xn,
	shallowReadonly: () => Cn,
	shallowRef: () => Pn,
	ssrContextKey: () => qr,
	ssrUtils: () => Lc,
	stop: () => bt,
	toDisplayString: () => F,
	toHandlerKey: () => De,
	toHandlers: () => Ua,
	toRaw: () => kn,
	toRef: () => Kn,
	toRefs: () => Un,
	toValue: () => Rn,
	transformVNodeArgs: () => Ws,
	triggerRef: () => Ln,
	unref: () => R,
	useAttrs: () => ro,
	useCssModule: () => tu,
	useCssVars: () => yl,
	useHost: () => $l,
	useId: () => ji,
	useModel: () => Ao,
	useSSRContext: () => Jr,
	useShadowRoot: () => eu,
	useSlots: () => no,
	useTemplateRef: () => Ni,
	useTransitionState: () => vi,
	vModelCheckbox: () => wu,
	vModelDynamic: () => Mu,
	vModelRadio: () => Eu,
	vModelSelect: () => Du,
	vModelText: () => Cu,
	vShow: () => hl,
	version: () => Mc,
	warn: () => Nc,
	watch: () => Qr,
	watchEffect: () => Yr,
	watchPostEffect: () => Xr,
	watchSyncEffect: () => Zr,
	withAsyncContext: () => lo,
	withCtx: () => z,
	withDefaults: () => to,
	withDirectives: () => Hr,
	withKeys: () => Bu,
	withMemo: () => Ac,
	withModifiers: () => Ru,
	withScopeId: () => Vr
}), td = () => {};
// node_modules/zod/v4/core/util.js
function nd(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function rd(e, t = "|") {
	return e.map((e) => Od(e)).join(t);
}
function id(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var ad = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function od(e) {
	return new ad(e);
}
function sd(e) {
	return e == null;
}
function cd(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function ld(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function ud(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function dd(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function fd(e) {
	return dd(e._zod.def) ?? e._zod.def.shape;
}
function pd(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return ud(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function md(e, t, n) {
	t in e ? ud(e, t, n) : e[t] = n;
}
function hd(e, t, n, r) {
	let i = fd(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? pd(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : md(e, a, r ? r(n.value, a) : n.value));
	}
}
function gd(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? pd(e, n, () => t[n]) : md(e, n, r.value));
	}
}
function _d(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function vd(e) {
	return JSON.stringify(e);
}
function yd(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var bd = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function xd(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var Sd = /* @__PURE__*/ od(() => {
	if (yf.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function Cd(e) {
	if (xd(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return xd(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function wd(e) {
	return Cd(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var Td = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function Ed(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Dd(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function X(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if (t?.message !== void 0) {
		if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function Od(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function kd(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var Ad = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, jd = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function Md(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return hd(i, e, Nd(e, t)), Dd(e, _d(n, {
		shape: i,
		checks: []
	}));
}
function Nd(e, t) {
	let n = fd(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function Pd(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Nd(e, t)), a = {};
	return hd(a, e, Reflect.ownKeys(fd(e)).filter((e) => !i.has(e))), Dd(e, _d(n, {
		shape: a,
		checks: []
	}));
}
function Fd(e, t) {
	if (!Cd(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = fd(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return Dd(e, _d(e._zod.def, { shape: Id(e, t) }));
}
function Id(e, t) {
	let n = {};
	return hd(n, e, Reflect.ownKeys(fd(e))), gd(n, t), n;
}
function Ld(e, t) {
	if (!Cd(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return Dd(e, _d(e._zod.def, { shape: Id(e, t) }));
}
function Rd(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return hd(n, e, Reflect.ownKeys(fd(e))), hd(n, t, Reflect.ownKeys(fd(t))), Dd(e, _d(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function zd(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(Nd(t, n)) : void 0, o = {};
	return hd(o, t, Reflect.ownKeys(fd(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), Dd(t, _d(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Bd(e, t, n) {
	let r = n ? new Set(Nd(t, n)) : void 0, i = {};
	return hd(i, t, Reflect.ownKeys(fd(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), Dd(t, _d(t._zod.def, { shape: i }));
}
function Vd(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function Hd(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function Ud(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Wd(e) {
	return typeof e == "string" ? e : e?.message;
}
function Gd(e) {
	let t = [];
	for (let n of e ?? []) {
		let e = n._zod.def;
		if (!/_(length|size)$|_equals$/.test(e.check)) break;
		let r = e.maximum ?? e.length ?? e.size;
		r >= 0 && t.push([r, n]);
	}
	return t;
}
function Kd(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function qd(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Wd(e.inst?._zod.def?.error?.(e)) ?? Wd(a?.(e)) ?? Wd(t?.error?.(e)) ?? Wd(n.customError?.(e)) ?? Wd(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var Jd = /[\uD800-\uDBFF]/;
function Yd(e) {
	let t = e.length;
	if (!Jd.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function Xd(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Zd(e) {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "nan" : "number";
		case "object": {
			if (e === null) return "null";
			if (Array.isArray(e)) return "array";
			let t = e;
			if (t && Object.getPrototypeOf(t) !== Object.prototype && "constructor" in t && t.constructor) return t.constructor.name;
		}
	}
	return t;
}
function Qd(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function $d(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : rf(e, n, r.value);
	}
}
function ef(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function tf(e, t, n) {
	return ef(e, t, n, !1);
}
/* @__NO_SIDE_EFFECTS__ */
function nf(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return ef(this, n, r(this));
			},
			set(e) {
				ef(this, n, e);
			}
		});
	}
	return t;
}
function rf(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : ef(this, t, n.bind(this));
		},
		set(e) {
			ef(this, t, e);
		}
	});
}
function af(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var of, sf = !1, cf = {
	configurable: !0,
	get() {
		sf = !0;
	}
};
function lf(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	t in r && of !== e._zod ? of = void 0 : (of = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, cf);
			let e = sf;
			sf = !1;
			try {
				let r = n(this);
				return sf ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), sf ||= e, r;
			} catch (n) {
				throw delete this[t], sf ||= e, n;
			}
		},
		set(e) {
			Object.defineProperty(this, t, {
				configurable: !0,
				writable: !0,
				value: e
			});
		}
	}));
}
function uf(e, t, n, r) {
	let i = af(e, t);
	i && Object.defineProperty(i, t, {
		configurable: !0,
		get() {
			let e = {
				configurable: !0,
				writable: !0,
				enumerable: r,
				value: void 0
			};
			return Object.defineProperty(this, t, e), e.value = n(this), Object.defineProperty(this, t, e), e.value;
		},
		set(e) {
			Object.defineProperty(this, t, {
				configurable: !0,
				writable: !0,
				enumerable: r,
				value: e
			});
		}
	});
}
var df = "~constantCatch";
function ff(e) {
	let t = () => e;
	return t[df] = !0, t;
}
// node_modules/zod/v4/core/core.js
var pf, mf = {
	value: void 0,
	enumerable: !1
}, hf = "captureStackTrace" in Error ? Error : null;
function gf(e) {
	let t = hf;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return hf = null, new e();
			}
			try {
				return new e();
			} finally {
				t.stackTraceLimit = n;
			}
		}
	}
	return new e();
}
/* @__NO_SIDE_EFFECTS__ */
function Z(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			mf.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", mf);
			} finally {
				mf.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), $d(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? gf(u) : this;
		c(t, e);
		let n = t._zod.deferred;
		if (n) {
			for (let e of n) e();
			t._zod.deferred = void 0;
		}
		let i = globalThis.__zod_globalConfig?.postProcessor;
		return i && i(t), t;
	}
	return Object.defineProperty(d, "init", { value: c }), Object.defineProperty(d, Symbol.hasInstance, { value: (t) => r?.Parent && t instanceof r.Parent ? !0 : t?._zod?.traits?.has(e) }), Object.defineProperty(d, "name", { value: e }), d;
}
var _f = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, vf = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(pf = globalThis).__zod_globalConfig ?? (pf.__zod_globalConfig = {});
var yf = globalThis.__zod_globalConfig;
function bf(e) {
	return e && Object.assign(yf, e), yf;
}
// node_modules/zod/v4/core/errors.js
function xf() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, id, 2), e.message;
}
function Sf(e) {
	this._zod.message = e;
}
var Cf = {
	get: xf,
	set: Sf,
	enumerable: !0,
	configurable: !0
}, wf = {
	value: void 0,
	enumerable: !1
}, Tf = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), Ef = /* @__PURE__ */ Z("$ZodError", (e, t) => {
	e.name = "$ZodError", wf.value = t, Object.defineProperty(e, "issues", wf), wf.value = void 0, Object.defineProperty(e, "message", Cf);
	let n = Object.getPrototypeOf(e);
	Tf.has(n) || (Tf.add(n), Object.defineProperty(n, "toString", {
		configurable: !0,
		enumerable: !1,
		get() {
			let e = () => this.message;
			return Object.defineProperty(this, "toString", {
				value: e,
				configurable: !0,
				writable: !0
			}), e;
		},
		set(e) {
			Object.defineProperty(this, "toString", {
				value: e,
				configurable: !0,
				writable: !0
			});
		}
	}));
});
function Df(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function Of(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? Df(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function kf(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e, i = []) => {
		for (let a of e.issues) if (a.code === "invalid_union" && a.errors.length) a.errors.map((e) => r({ issues: e }, [...i, ...a.path]));
		else if (a.code === "invalid_key") r({ issues: a.issues }, [...i, ...a.path]);
		else if (a.code === "invalid_element") r({ issues: a.issues }, [...i, ...a.path]);
		else {
			let e = [...i, ...a.path];
			if (e.length === 0) n._errors.push(t(a));
			else {
				let r = n, i = 0;
				for (; i < e.length;) {
					let n = e[i], o = i === e.length - 1;
					if (n === "_errors") {
						o && r._errors.push(t(a)), i++;
						continue;
					}
					Object.prototype.hasOwnProperty.call(r, n) || Object.defineProperty(r, n, {
						value: { _errors: [] },
						enumerable: !0,
						writable: !0,
						configurable: !0
					});
					let s = r[n];
					o && s._errors.push(t(a)), r = s, i++;
				}
			}
		}
	};
	return r(e), n;
}
// node_modules/zod/v4/core/parse.js
function Af(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var jf = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new _f();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => qd(e, o, bf())));
			throw bd(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Mf = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => qd(e, o, bf())));
			throw bd(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Nf = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new _f();
	return a.issues.length ? Pf(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function Pf(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => qd(e, n, bf()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var Ff = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? Pf(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, If = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Lf = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Rf = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== If) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return zf(e, t, n);
});
function zf(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[Lf] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new _f();
	return a.issues.length === 0;
}
var Bf = async (e, t, n) => {
	let r = n ? {
		...n,
		async: !0,
		abortEarly: !0
	} : {
		async: !0,
		abortEarly: !0
	}, i = e._zod.run({
		value: t,
		issues: []
	}, r);
	return i instanceof Promise && (i = await i), i.issues.length === 0;
}, Vf = (e) => {
	let t = jf(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, Af(n, a));
	};
	return n;
}, Hf = (e) => {
	let t = jf(e), n = (e, r, i, a) => t(e, r, i, Af(n, a));
	return n;
}, Uf = (e) => {
	let t = Mf(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, Af(n, a));
	};
	return n;
}, Wf = (e) => {
	let t = Mf(e), n = async (e, r, i, a) => await t(e, r, i, Af(n, a));
	return n;
}, Gf = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Nf(e)(t, n, i);
}, Kf = (e) => (t, n, r) => Nf(e)(t, n, r), qf = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Ff(e)(t, n, i);
}, Jf = (e) => async (t, n, r) => Ff(e)(t, n, r), Yf = /^[cC][0-9a-z]{6,}$/, Xf = /^[0-9a-z]+$/, Zf = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Qf = /^[0-9a-vA-V]{20}$/, $f = /^[A-Za-z0-9]{27}$/, ep = /^[a-zA-Z0-9_-]{21}$/;
function tp(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var np = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, rp = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, ip = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, ap = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, op = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function sp() {
	return new RegExp(op, "u");
}
var cp = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, lp = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, up = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, dp = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, fp = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, pp = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, mp = /^https?$/, hp = /^\+[1-9]\d{6,14}$/, gp = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function _p(e) {
	return RegExp(`^${e}$`);
}
var vp = /*@__PURE__*/ _p(gp);
function yp(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function bp(e) {
	return RegExp(`^${yp(e)}$`);
}
function xp(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${yp({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${yp({ precision: e.precision })}` : n;
	return RegExp(`^${gp}T(?:${r})$`);
}
var Sp = /^[\s\S]{0,}$/, Cp = /^-?\d+$/, wp = /^-?\d+(?:\.\d+)?$/, Tp = /^(?:true|false)$/i, Ep = /^[^A-Z]*$/, Dp = /^[^a-z]*$/, Op = /*@__PURE__*/ Z("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), kp = (e) => {
	let t = e.value;
	return !sd(t) && t.length !== void 0;
}, Ap = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, jp = /*@__PURE__*/ Z("$ZodCheckLessThan", (e, t) => {
	Op.init(e, t);
	let n = Ap[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: Ap[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Mp = /*@__PURE__*/ Z("$ZodCheckGreaterThan", (e, t) => {
	Op.init(e, t);
	let n = Ap[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: Ap[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Np = /*@__PURE__*/ Z("$ZodCheckMultipleOf", (e, t) => {
	Op.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : ld(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Pp = /*@__PURE__*/ Z("$ZodCheckNumberFormat", (e, t) => {
	Op.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = Ad[t.format];
	e._zod.check = (o) => {
		let s = o.value;
		if (n) {
			if (!Number.isInteger(s)) {
				o.issues.push({
					expected: r,
					format: t.format,
					code: "invalid_type",
					continue: !1,
					input: s,
					inst: e
				});
				return;
			}
			if (!Number.isSafeInteger(s)) {
				s > 0 ? o.issues.push({
					input: s,
					code: "too_big",
					maximum: 2 ** 53 - 1,
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				}) : o.issues.push({
					input: s,
					code: "too_small",
					minimum: -(2 ** 53 - 1),
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				});
				return;
			}
		}
		s < i && o.issues.push({
			origin: "number",
			input: s,
			code: "too_small",
			minimum: i,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), s > a && o.issues.push({
			origin: "number",
			input: s,
			code: "too_big",
			maximum: a,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		});
	};
}), Fp = /*@__PURE__*/ Z("$ZodCheckMaxLength", (e, t) => {
	var n;
	Op.init(e, t), (n = e._zod.def).when ?? (n.when = kp), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? Yd(r) : i) <= t.maximum) return;
		let a = Xd(r);
		n.issues.push({
			origin: a,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Ip = /*@__PURE__*/ Z("$ZodCheckMinLength", (e, t) => {
	var n;
	Op.init(e, t), (n = e._zod.def).when ?? (n.when = kp), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? Yd(r) : i) >= t.minimum) return;
		let a = Xd(r);
		n.issues.push({
			origin: a,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Lp = /*@__PURE__*/ Z("$ZodCheckLengthEquals", (e, t) => {
	var n;
	Op.init(e, t), (n = e._zod.def).when ?? (n.when = kp), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? Yd(r) : i;
		if (a === t.length) return;
		let o = Xd(r), s = a > t.length;
		n.issues.push({
			origin: o,
			...s ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Rp = /*@__PURE__*/ Z("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	Op.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), zp = /*@__PURE__*/ Z("$ZodCheckRegex", (e, t) => {
	Rp.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), Bp = /*@__PURE__*/ Z("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= Ep, Rp.init(e, t);
}), Vp = /*@__PURE__*/ Z("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= Dp, Rp.init(e, t);
}), Hp = /*@__PURE__*/ Z("$ZodCheckIncludes", (e, t) => {
	Op.init(e, t);
	let n = Ed(t.includes);
	t.pattern = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${n}` : n), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Up = /*@__PURE__*/ Z("$ZodCheckStartsWith", (e, t) => {
	Op.init(e, t);
	let n = RegExp(`^${Ed(t.prefix)}.*`);
	t.pattern ??= n, e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Wp = /*@__PURE__*/ Z("$ZodCheckEndsWith", (e, t) => {
	Op.init(e, t);
	let n = RegExp(`.*${Ed(t.suffix)}$`);
	t.pattern ??= n, e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Gp = /*@__PURE__*/ Z("$ZodCheckOverwrite", (e, t) => {
	Op.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Kp = class {
	constructor(e = [], t = {}) {
		this.content = [], this.indent = 0, this.args = e, this.closed = t;
	}
	indented(e) {
		this.indent += 1;
		try {
			e(this);
		} finally {
			--this.indent;
		}
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		let e = Function, t = this?.content ?? [""];
		return new e(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${t.join("\n")}\n};`)(...Object.values(this.closed));
	}
}, qp = {
	major: 4,
	minor: 6,
	patch: 7
}, Jp = /*@__PURE__*/ Z("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = qp;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = Vd(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (Hd(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new _f();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (Kd(t.issues, n, e), i ||= Vd(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					Kd(t.issues, n, e), i ||= Vd(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (Vd(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new _f();
				return o.then((t) => e._zod.parse(t, a));
			}
			return e._zod.parse(o, a);
		};
		e._zod.run = (r, a) => {
			if (a.skipChecks) return e._zod.parse(r, a);
			if (a.direction === "backward") {
				let t = e._zod.parse({
					value: r.value,
					issues: []
				}, {
					...a,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => n(e, r, a)) : n(t, r, a);
			}
			let o = e._zod.parse(r, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new _f();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return tf(this, "~standard", Zp(this));
	},
	set "~standard"(e) {
		ef(this, "~standard", e);
	}
}), Yp = (e, t) => e.issues.length ? { issues: e.issues.map((e) => qd(e, t, bf())) } : { value: e.value };
async function Xp(e, t) {
	let n = { async: !0 };
	return Yp(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function Zp(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return Yp(r, n);
			} catch {}
			return Xp(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var Qp = /*@__PURE__*/ Z("$ZodString", (e, t) => {
	Jp.init(e, t), e._zod.pattern = t.pattern ?? Sp, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), $p = /*@__PURE__*/ Z("$ZodStringFormat", (e, t) => {
	Rp.init(e, t), Qp.init(e, t);
}), em = /*@__PURE__*/ Z("$ZodGUID", (e, t) => {
	t.pattern ??= rp, $p.init(e, t);
}), tm = /*@__PURE__*/ Z("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= ip(e);
	} else t.pattern ??= ip();
	$p.init(e, t);
}), nm = /*@__PURE__*/ Z("$ZodEmail", (e, t) => {
	t.pattern ??= ap, $p.init(e, t);
});
function rm(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function im(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? rm(e) || 2 : am(e, t);
}
function am(e, t) {
	if (!t.normalize && t.protocol?.source === mp.source && !/^https?:\/\//i.test(e)) return 1;
	try {
		if (typeof URL < "u") {
			let t = URL;
			if (typeof t.parse == "function") return t.parse(e) ?? 2;
		}
		return new URL(e);
	} catch {
		return 2;
	}
}
var om = /[\t\n\r]/g;
function sm(e) {
	return e.replace(om, "");
}
function cm(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function lm(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var um = /*@__PURE__*/ Z("$ZodURL", (e, t) => {
	$p.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = im(r, t);
			if (i === 1) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			if (i === 2) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			if (i === !0) {
				n.value = sm(r);
				return;
			}
			t.hostname && !cm(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !lm(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : sm(r);
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), dm = /*@__PURE__*/ Z("$ZodEmoji", (e, t) => {
	t.pattern ??= sp(), $p.init(e, t);
}), fm = /*@__PURE__*/ Z("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? ep : tp(t.length), $p.init(e, t);
}), pm = /*@__PURE__*/ Z("$ZodCUID", (e, t) => {
	t.pattern ??= Yf, $p.init(e, t);
}), mm = /*@__PURE__*/ Z("$ZodCUID2", (e, t) => {
	t.pattern ??= Xf, $p.init(e, t);
}), hm = /*@__PURE__*/ Z("$ZodULID", (e, t) => {
	t.pattern ??= Zf, $p.init(e, t);
}), gm = /*@__PURE__*/ Z("$ZodXID", (e, t) => {
	t.pattern ??= Qf, $p.init(e, t);
}), _m = /*@__PURE__*/ Z("$ZodKSUID", (e, t) => {
	t.pattern ??= $f, $p.init(e, t);
}), vm = /*@__PURE__*/ Z("$ZodISODateTime", (e, t) => {
	t.pattern ??= xp(t), $p.init(e, t);
}), ym = /*@__PURE__*/ Z("$ZodISODate", (e, t) => {
	t.pattern ??= vp, $p.init(e, t);
}), bm = /*@__PURE__*/ Z("$ZodISOTime", (e, t) => {
	t.pattern ??= bp(t), $p.init(e, t);
}), xm = /*@__PURE__*/ Z("$ZodISODuration", (e, t) => {
	t.pattern ??= np, $p.init(e, t);
}), Sm = /*@__PURE__*/ Z("$ZodIPv4", (e, t) => {
	t.pattern ??= cp, $p.init(e, t);
}), Cm = /^[0-9a-fA-F:.]+$/;
function wm(e) {
	return Cm.test(e) ? rm(`http://[${e}]`) : !1;
}
var Tm = /*@__PURE__*/ Z("$ZodIPv6", (e, t) => {
	t.pattern ??= lp, $p.init(e, t), e._zod.check = (n) => {
		wm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Em = /*@__PURE__*/ Z("$ZodCIDRv4", (e, t) => {
	t.pattern ??= up, $p.init(e, t);
});
function Dm(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : wm(n);
}
var Om = /*@__PURE__*/ Z("$ZodCIDRv6", (e, t) => {
	t.pattern ??= dp, $p.init(e, t), e._zod.check = (n) => {
		Dm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function km(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var Am = /^[0-9a-zA-Z+/]*={0,2}$/, jm = /*@__PURE__*/ Z("$ZodBase64", (e, t) => {
	t.pattern ??= Am, $p.init(e, t), e._zod.check = (n) => {
		km(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Mm = /^[A-Za-z0-9_-]*$/;
function Nm(e) {
	if (!Mm.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return km(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var Pm = /*@__PURE__*/ Z("$ZodBase64URL", (e, t) => {
	t.pattern ??= Mm, $p.init(e, t), e._zod.check = (n) => {
		Nm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Fm = /*@__PURE__*/ Z("$ZodE164", (e, t) => {
	t.pattern ??= hp, $p.init(e, t);
});
function Im(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && i?.typ !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
var Lm = /*@__PURE__*/ Z("$ZodJWT", (e, t) => {
	$p.init(e, t), e._zod.check = (n) => {
		Im(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Rm = /*@__PURE__*/ Z("$ZodNumber", (e, t) => {
	Jp.init(e, t), e._zod.pattern = wp, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = Number(n.value);
		} catch {}
		let i = n.value;
		if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i)) return n;
		let a = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : String(i) : void 0;
		return n.issues.push({
			expected: "number",
			code: "invalid_type",
			input: i,
			inst: e,
			...a ? { received: a } : {}
		}), n;
	};
}), zm = /*@__PURE__*/ Z("$ZodNumberFormat", (e, t) => {
	Pp.init(e, t), Rm.init(e, t);
}), Bm = /*@__PURE__*/ Z("$ZodBoolean", (e, t) => {
	Jp.init(e, t), e._zod.pattern = Tp, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), Vm = /*@__PURE__*/ Z("$ZodUnknown", (e, t) => {
	Jp.init(e, t), e._zod.parse = (e) => e;
}), Hm = /*@__PURE__*/ Z("$ZodNever", (e, t) => {
	Jp.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Um(e, t) {
	let n = Gd(e._zod.def.checks);
	if (!n.length) return;
	let r = Math.min(...n.map((e) => e[0])), i = e._zod.parse;
	e._zod.parse = (n, a) => {
		let o = t(n.value);
		if (o > r && !a?.skipChecks && a?.direction !== "backward") {
			for (let [t, r] of Gd(e._zod.def.checks)) if (o > t && r._zod.def.when(n)) {
				let t = n.issues.length;
				return r._zod.check(n), n.issues[t].continue = !1, Kd(n.issues, t, e), n;
			}
		}
		return i(n, a);
	};
}
var Wm = (e) => Array.isArray(e) ? e.length : -1;
function Gm(e, t, n) {
	e.issues.length && t.issues.push(...Ud(n, e.issues)), t.value[n] = e.value;
}
var Km = /*@__PURE__*/ Z("$ZodArray", (e, t) => {
	Jp.init(e, t);
	let n = yf.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!Array.isArray(a)) return r.issues.push({
			expected: "array",
			code: "invalid_type",
			input: a,
			inst: e
		}), r;
		r.value = n ? n.alloc(e, r, Array(a.length), i) : Array(a.length);
		let o = [], s = i?.abortEarly;
		for (let e = 0; e < a.length; e++) {
			let n = a[e], c = t.element._zod.run({
				value: n,
				issues: []
			}, i);
			if (c instanceof Promise) o.push(c.then((t) => Gm(t, r, e)));
			else if (Gm(c, r, e), s && c.issues.length !== 0 && Vd(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	}, Um(e, Wm);
});
function qm(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...Ud(n, e.issues));
		}
		!o && i === void 0 ? e.issues.length || t.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [n]
		}) : e.value === void 0 ? (o || i === "defaulted" && !s) && (t.value[n] = void 0) : t.value[n] = e.value;
	}
}
var Jm = [];
function Ym(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Jm, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = kd(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function Xm(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (Vd(n, p)) break;
			p = n.issues.length;
		}
		if (c.has(i)) continue;
		if (i === "__proto__") {
			u === "never" && s.push(i);
			continue;
		}
		if (u === "never") {
			s.push(i);
			continue;
		}
		let a = l.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => qm(e, n, i, t, d, f))) : qm(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Zm = /*@__PURE__*/ Z("$ZodObject", (e, t) => {
	Jp.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = od(() => Ym(t));
	lf(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || ud(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = xd, o = t.catchall, s, c = yf.memoizer;
	c?.attach(e), e._zod.parse = (t, n) => {
		s ??= i.value;
		let r = t.value;
		if (!a(r)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
		t.value = c ? c.alloc(e, t, {}, n) : {};
		let l = [], u = s.shape, d = n?.abortEarly, f = t.issues.length;
		for (let e of s.allKeys) {
			if (d && t.issues.length !== f) {
				if (Vd(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => qm(n, t, e, r, a, o))) : qm(s, t, e, r, a, o);
		}
		return o ? Xm(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), Qm = /*@__PURE__*/ Z("$ZodObjectJIT", (e, t) => {
	Zm.init(e, t);
	let n = e._zod.parse, r = od(() => Ym(t)), i = yf.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new Kp(["payload", "ctx"], {
			shape: t,
			inst: e,
			memo: i,
			syms: a
		}), s = (e) => `shape[${e}]._zod.run({ value: input[${e}], issues: [] }, ctx)`, c = (e, t) => `
          let ${e}_ab = false;
          for (let i = 0; i < ${e}.issues.length; i++) {
            const iss = ${e}.issues[i];
            iss.path = iss.path ? [${t}, ...iss.path] : [${t}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${e}_ab = true;
          }
          if (${e}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
		o.write("const input = payload.value;");
		let l = Object.create(null), u = 0;
		for (let e of n.allKeys) l[e] = `key_${u++}`;
		o.write(i ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
		for (let e of n.allKeys) {
			if (e === "__proto__") continue;
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : vd(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
			if (o.write(`const ${n} = ${s(r)};`), f && p) {
				let e = d === "optional" ? `${n}_present` : `${n}.value !== undefined || ${n}_present`;
				o.write(`
        const ${n}_present = ${i};
        if (!${n}.issues.length || ${n}_present) {
          if (${n}.issues.length) {${c(n, r)}
          }

          if (${e}) {
            newResult[${r}] = ${n}.value;
          }
        }

      `);
			} else f ? (o.write(`
        if (${n}.issues.length) {${c(n, r)}
        }
      `), d === "defaulted" ? o.write(`newResult[${r}] = ${n}.value;`) : o.write(`
        if (${n}.value !== undefined || ${i}) {
          newResult[${r}] = ${n}.value;
        }
      `)) : o.write(`
        const ${n}_present = ${i};
        if (${n}.issues.length) {${c(n, r)}
        }
        if (!${n}_present && !${n}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${r}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${n}_present) {
          newResult[${r}] = ${n}.value;
        }

      `);
		}
		return o.write("payload.value = newResult;"), o.write("return payload;"), o.compile();
	}, o, s = xd, c = !yf.jitless, l = c && Sd.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? Xm([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function $m(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !Vd(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => qd(e, r, bf())))
	}), t);
}
var eh = /*@__PURE__*/ Z("$ZodUnion", (e, t) => {
	Jp.init(e, t), lf(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), lf(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), lf(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), lf(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => cd(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1 ? t.options[0]._zod.run : null;
	e._zod.parse = (r, i) => {
		if (n) return n(r, i);
		let a = !1, o = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: r.value,
				issues: []
			}, i);
			if (t instanceof Promise) o.push(t), a = !0;
			else {
				if (t.issues.length === 0) return t;
				o.push(t);
			}
		}
		return a ? Promise.all(o).then((t) => $m(t, r, e, i)) : $m(o, r, e, i);
	};
}), th = /*@__PURE__*/ Z("$ZodIntersection", (e, t) => {
	Jp.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => rh(e, t, n)) : rh(e, i, a);
	};
});
function nh(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (Cd(e) && Cd(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = nh(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = nh(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function rh(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i, a = /* @__PURE__ */ new Map(), o = (e, t) => {
		let n;
		if (e.code === "unrecognized_keys" && !e.path?.length) i ??= e, n = e.keys;
		else if (e.code === "invalid_key" && e.origin === "record" && e.path?.length === 1) {
			let t = String(e.path[0]);
			a.has(t) || a.set(t, e), n = [t];
		} else return !1;
		for (let e of n) r.has(e) || r.set(e, {}), r.get(e)[t] = !0;
		return !0;
	};
	for (let n of t.issues) o(n, "l") || e.issues.push(n);
	for (let t of n.issues) o(t, "r") || e.issues.push(t);
	let s = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
	if (s.length) {
		let t = i ? s.filter((e) => i.keys.includes(e)) : [];
		t.length && e.issues.push({
			...i,
			keys: t
		});
		for (let n of s) !t.includes(n) && a.has(n) && e.issues.push(a.get(n));
	}
	let c = nh(t.value, n.value);
	if (!c.valid) {
		if (Vd(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var ih = /*@__PURE__*/ Z("$ZodRecord", (e, t) => {
	Jp.init(e, t);
	let n = yf.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!Cd(a)) return r.issues.push({
			expected: "record",
			code: "invalid_type",
			input: a,
			inst: e
		}), r;
		let o = [], s = t.keyType._zod.values;
		if (s && !t.partial) {
			r.value = n ? n.alloc(e, r, {}, i) : {};
			let c = /* @__PURE__ */ new Set();
			for (let n of s) if (typeof n == "string" || typeof n == "number" || typeof n == "symbol") {
				if (c.add(typeof n == "number" ? n.toString() : n), n === "__proto__") continue;
				let s = t.keyType._zod.run({
					value: n,
					issues: []
				}, i);
				if (s instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (s.issues.length) {
					r.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: s.issues.map((e) => qd(e, i, bf())),
						input: n,
						path: [n],
						inst: e
					});
					continue;
				}
				let l = s.value;
				if (l === "__proto__") continue;
				let u = t.valueType._zod.run({
					value: a[n],
					issues: []
				}, i);
				u instanceof Promise ? o.push(u.then((e) => {
					e.issues.length && r.issues.push(...Ud(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...Ud(n, u.issues)), r.value[l] = u.value);
			}
			let l;
			for (let e in a) if (!c.has(e)) {
				if (t.mode === "loose") {
					if (e === "__proto__") continue;
					r.value[e] = a[e];
				} else l ??= [], l.push(e);
			}
			l && l.length > 0 && r.issues.push({
				code: "unrecognized_keys",
				input: a,
				inst: e,
				keys: l,
				continue: !0
			});
		} else {
			r.value = n ? n.alloc(e, r, {}, i) : {};
			let c;
			for (let n of Reflect.ownKeys(a)) {
				if (n === "__proto__" || !Object.prototype.propertyIsEnumerable.call(a, n)) continue;
				let l = t.keyType._zod.run({
					value: n,
					issues: []
				}, i);
				if (l instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (typeof n == "string" && wp.test(n) && l.issues.length) {
					let e = t.keyType._zod.run({
						value: Number(n),
						issues: []
					}, i);
					if (e instanceof Promise) throw Error("Async schemas not supported in object keys currently");
					e.issues.length === 0 && (l = e);
				}
				if (l.issues.length) {
					t.mode === "loose" ? r.value[n] = a[n] : s ? (c ??= [], c.push(n)) : r.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: l.issues.map((e) => qd(e, i, bf())),
						input: n,
						path: [n],
						inst: e
					});
					continue;
				}
				let u = l.value;
				if (u === "__proto__") continue;
				let d = t.valueType._zod.run({
					value: a[n],
					issues: []
				}, i);
				d instanceof Promise ? o.push(d.then((e) => {
					e.issues.length && r.issues.push(...Ud(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...Ud(n, d.issues)), r.value[u] = d.value);
			}
			c && c.length > 0 && r.issues.push({
				code: "unrecognized_keys",
				input: a,
				inst: e,
				keys: c,
				continue: !0
			});
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
}), ah = /*@__PURE__*/ Z("$ZodEnum", (e, t) => {
	Jp.init(e, t);
	let n = nd(t.entries), r = new Set(n);
	e._zod.values = r, lf(e, "pattern", (e) => {
		let t = nd(e.def.entries).filter((e) => Td.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => Ed(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), oh = /*@__PURE__*/ Z("$ZodTransform", (e, t) => {
	Jp.init(e, t), e._zod.optin = "optional", yf.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new vf(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new _f();
		return n.value = i, n;
	};
});
function sh(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var ch = /*@__PURE__*/ Z("$ZodOptional", (e, t) => {
	Jp.init(e, t), lf(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", lf(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), lf(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${cd(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => sh(e, t)) : sh(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), lh = /*@__PURE__*/ Z("$ZodExactOptional", (e, t) => {
	ch.init(e, t), lf(e, "values", (e) => e.def.innerType._zod.values), lf(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), uh = /*@__PURE__*/ Z("$ZodNullable", (e, t) => {
	Jp.init(e, t), lf(e, "optin", (e) => e.def.innerType._zod.optin), lf(e, "optout", (e) => e.def.innerType._zod.optout), lf(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${cd(t.source)}|null)$`) : void 0;
	}), lf(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), dh = /*@__PURE__*/ Z("$ZodDefault", (e, t) => {
	Jp.init(e, t), e._zod.optin = "defaulted", lf(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => fh(e, t)) : fh(r, t);
	};
});
function fh(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var ph = /*@__PURE__*/ Z("$ZodPrefault", (e, t) => {
	Jp.init(e, t), e._zod.optin = "defaulted", lf(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), mh = /*@__PURE__*/ Z("$ZodNonOptional", (e, t) => {
	Jp.init(e, t), lf(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => hh(t, e)) : hh(i, e);
	};
});
function hh(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function gh(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => qd(e, r, bf())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var _h = /*@__PURE__*/ Z("$ZodCatch", (e, t) => {
	Jp.init(e, t), lf(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), lf(e, "optout", (e) => e.def.innerType._zod.optout), lf(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => gh(e, r, t, n)) : gh(e, r, t, n);
	};
}), vh = /*@__PURE__*/ Z("$ZodPipe", (e, t) => {
	Jp.init(e, t), lf(e, "values", (e) => e.def.in._zod.values), lf(e, "optin", (e) => e.def.in._zod.optin), lf(e, "optout", (e) => e.def.out._zod.optout), lf(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => yh(e, t.in, n)) : yh(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => yh(e, t.out, n)) : yh(r, t.out, n);
	};
});
function yh(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var bh = /*@__PURE__*/ Z("$ZodReadonly", (e, t) => {
	Jp.init(e, t), lf(e, "propValues", (e) => e.def.innerType._zod.propValues), lf(e, "values", (e) => e.def.innerType._zod.values), lf(e, "optin", (e) => e.def.innerType?._zod?.optin), lf(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(xh) : xh(r);
	};
});
function xh(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var Sh = /*@__PURE__*/ Z("$ZodCustom", (e, t) => {
	Op.init(e, t), Jp.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => Ch(t, n, r, e));
		Ch(i, n, r, e);
	};
});
function Ch(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Qd(e));
	}
}
// node_modules/zod/v4/core/memoizer.js
var wh = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, Th = "~memo", Eh = [];
function Dh(e) {
	return typeof e == "object" && !!e;
}
function Oh(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var kh = /*@__PURE__*/ new WeakMap(), Ah = 0, jh = 1, Mh = 2;
function Nh(e, t, n) {
	let r = kh.get(e);
	if (r !== void 0) return r ? Mh : Ah;
	if (t.has(e)) return Mh;
	t.add(e);
	let i = Ah, a = (e) => {
		if (i !== Mh && e?._zod) {
			let r = Nh(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = Ah;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? jh : o.value?._zod ? Nh(o.value, t, n) : Ah;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = dd(c);
			s(e ? o(e, !0) : jh), a(c.catchall);
			break;
		}
		case "array":
			a(c.element);
			break;
		case "tuple":
			for (let e of c.items) a(e);
			a(c.rest);
			break;
		case "record":
		case "map":
			a(c.keyType), a(c.valueType);
			break;
		case "set":
			a(c.valueType);
			break;
		case "union":
			for (let e of c.options) a(e);
			break;
		case "intersection":
			a(c.left), a(c.right);
			break;
		case "optional":
		case "nullable":
		case "default":
		case "prefault":
		case "catch":
		case "readonly":
		case "nonoptional":
		case "promise":
		case "success":
			a(c.innerType);
			break;
		case "pipe":
			a(c.in), a(c.out);
			break;
		case "function":
			a(c.input), a(c.output);
			break;
		case "lazy": {
			let r = c._cachedInner ?? (n ? e._zod.innerType : void 0);
			s(r ? Nh(r, t, !1) : jh);
			break;
		}
		case "template_literal":
		case "string":
		case "number":
		case "int":
		case "boolean":
		case "bigint":
		case "symbol":
		case "undefined":
		case "null":
		case "void":
		case "never":
		case "any":
		case "unknown":
		case "date":
		case "nan":
		case "enum":
		case "literal":
		case "file":
		case "transform":
		case "custom": break;
		default: for (let e in c) {
			let t = Object.getOwnPropertyDescriptor(c, e);
			if (!t || t.get) continue;
			let n = t.value;
			if (n && typeof n == "object") {
				if (n._zod) a(n);
				else if (Array.isArray(n)) for (let e of n) a(e);
			}
		}
	}
	return t.delete(e), Ph(e, i);
}
function Ph(e, t) {
	return t !== jh && kh.set(e, t === Mh), t;
}
function Fh(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var Ih, Lh = [], Rh = {
	alloc(e, t, n) {
		let r = Ih;
		if (!r) return n;
		Ih = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), Lh.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && Bh(n, e.value)) throw new wh();
				return t(e, n);
			};
			e._zod.parse = n, e._zod.run === t && (e._zod.run = n);
		});
	},
	attach(e) {
		var t;
		let n, r = !1, i, a;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, o = (s, c) => {
				if (n === void 0) {
					let i = Nh(e, /* @__PURE__ */ new Set(), !1);
					if (i === Ah) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === Mh || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!Dh(l)) return t(s, c);
				let u = c[Th];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[Th] = u);
				let d;
				i === c ? d = a : (d = Fh(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...Oh(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				Ih = d;
				let p = Lh.length, m = t(s, c);
				Ih = void 0;
				let h = Lh.length > p ? Lh.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? Oh(e.issues) : Eh), e)) : (h && (h.issues = m.issues.length ? Oh(m.issues) : Eh), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function zh() {
	return Rh;
}
function Bh(e, t) {
	let n = e[Th]?.backEdges;
	return n !== void 0 && Dh(t) && n.has(t);
}
// node_modules/zod/v4/locales/en.js
var Vh = () => {
	let e = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		},
		map: {
			unit: "entries",
			verb: "to have"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		mac: "MAC address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		currency_code: "currency code",
		credit_card: "credit card number",
		iban: "IBAN",
		jwt: "JWT",
		template_literal: "input"
	}, r = { nan: "NaN" };
	function i(e, t) {
		return e === "number" && typeof t == "number" && !Number.isFinite(t) ? String(t) : r[e] ?? e;
	}
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(Zd(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${Od(e.values[0])}` : `Invalid option: expected one of ${rd(e.values, "|")}`;
			case "too_big": {
				let n = e.exact ? "exactly " : e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Too big: expected ${e.origin ?? "value"} to have ${n}${e.maximum.toString()} ${r.unit ?? "elements"}` : `Too big: expected ${e.origin ?? "value"} to be ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.exact ? "exactly " : e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Too small: expected ${e.origin} to have ${n}${e.minimum.toString()} ${r.unit}` : `Too small: expected ${e.origin} to be ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Invalid string: must start with "${t.prefix}"` : t.format === "ends_with" ? `Invalid string: must end with "${t.suffix}"` : t.format === "includes" ? `Invalid string: must include "${t.includes}"` : t.format === "regex" ? `Invalid string: must match pattern ${t.pattern}` : `Invalid ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${e.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${rd(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function Hh() {
	return { localeError: Vh() };
}
// node_modules/zod/v4/core/registries.js
var Uh, Wh = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function Gh() {
	return new Wh();
}
(Uh = globalThis).__zod_globalRegistry ?? (Uh.__zod_globalRegistry = Gh());
var Kh = globalThis.__zod_globalRegistry;
// node_modules/zod/v4/core/api.js
function qh(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function Jh(e, t) {
	return new e(qh({
		type: "string",
		...X(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Yh(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xh(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $h(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function eg(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function tg(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ng(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function rg(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ig(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ag(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function og(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sg(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function cg(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function lg(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ug(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function dg(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fg(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pg(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function mg(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function hg(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function gg(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function _g(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function vg(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function yg(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function bg(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xg(e, t) {
	return new e(qh({
		type: "number",
		checks: [],
		...X(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Sg(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Cg(e, t) {
	return new e({
		type: "boolean",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function wg(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function Tg(e, t) {
	return new e({
		type: "never",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Eg(e, t) {
	return new jp({
		check: "less_than",
		...X(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Dg(e, t) {
	return new jp({
		check: "less_than",
		...X(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Og(e, t) {
	return new Mp({
		check: "greater_than",
		...X(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function kg(e, t) {
	return new Mp({
		check: "greater_than",
		...X(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Ag(e, t) {
	return new Np({
		check: "multiple_of",
		...X(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function jg(e, t) {
	return new Fp({
		check: "max_length",
		...X(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Mg(e, t) {
	return new Ip({
		check: "min_length",
		...X(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ng(e, t) {
	return new Lp({
		check: "length_equals",
		...X(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function Pg(e, t) {
	return new zp({
		check: "string_format",
		format: "regex",
		...X(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Fg(e) {
	return new Bp({
		check: "string_format",
		format: "lowercase",
		...X(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Ig(e) {
	return new Vp({
		check: "string_format",
		format: "uppercase",
		...X(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Lg(e, t) {
	return new Hp({
		check: "string_format",
		format: "includes",
		...X(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Rg(e, t) {
	return new Up({
		check: "string_format",
		format: "starts_with",
		...X(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function zg(e, t) {
	return new Wp({
		check: "string_format",
		format: "ends_with",
		...X(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Bg(e) {
	return new Gp({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Vg(e) {
	return /* @__PURE__ */ Bg((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Hg() {
	return /* @__PURE__ */ Bg((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Ug() {
	return /* @__PURE__ */ Bg((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Wg() {
	return /* @__PURE__ */ Bg((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Gg() {
	return /* @__PURE__ */ Bg((e) => yd(e));
}
// @__NO_SIDE_EFFECTS__
function Kg(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...X(n)
	});
}
// @__NO_SIDE_EFFECTS__
function qg(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...X(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Jg(e, t) {
	let n = /* @__PURE__ */ Yg((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(Qd(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(Qd(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function Yg(e, t) {
	let n = new Op({
		check: "custom",
		...X(t)
	});
	return n._zod.check = e, n;
}
// node_modules/zod/v4/core/to-json-schema.js
function Xg(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && ud(e, t, n[t]);
	return e;
}
function Zg(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Kh,
		target: t,
		unrepresentable: e?.unrepresentable ?? "throw",
		override: e?.override ?? (() => {}),
		io: e?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		sharedDefsExtractedFor: void 0,
		sharedEmitDoneFor: void 0,
		cycles: e?.cycles ?? "ref",
		reused: e?.reused ?? "inline",
		intersections: [],
		deferred: [],
		external: e?.external ?? void 0
	};
}
function Qg(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function $g(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r;
	let i = e._zod.def, a = t.seen.get(e);
	if (a) return a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema;
	let o = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, o), t.sharedDefsExtractedFor = void 0, t.sharedEmitDoneFor = void 0;
	let s = e._zod.toJSONSchema?.();
	if (s) o.schema = s;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		};
		if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
		else {
			let n = o.schema, a = t.processors[i.type];
			if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
			a(e, t, n, r);
		}
		let a = e._zod.parent;
		a && (o.ref ||= a, $g(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Xg(o.schema, c), t.io === "input" && l_(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function e_(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function t_(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	if (e.external && e.sharedDefsExtractedFor === e.external) return;
	let r = /* @__PURE__ */ new Map();
	for (let t of e.seen.entries()) {
		let n = e.metadataRegistry.get(t[0])?.id;
		if (n) {
			let e = r.get(n);
			if (e && e !== t[0]) throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			r.set(n, t[0]);
		}
	}
	let i = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			let n = e.external.registry.get(t[0])?.id, i = e.external.uri ?? ((e) => e);
			if (n) return { ref: i(n) };
			let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = a, {
				defId: a,
				ref: `${i("__shared")}#/${r}/${e_(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + e_(a)
		};
	}, a = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: r } = i(e);
		t.def = { ...t.schema }, r && (t.defId = r);
		let a = t.schema;
		for (let e in a) delete a[e];
		a.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) throw Error(`Cycle detected: #/${e.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (let n of e.seen.entries()) {
		let r = n[1];
		if (t === n[0]) a(n);
		else {
			if (e.external) {
				let r = e.external.registry.get(n[0])?.id;
				if (t !== n[0] && r) {
					a(n);
					continue;
				}
			}
			(e.metadataRegistry.get(n[0])?.id || r.cycle || r.count > 1 && e.reused === "ref") && a(n);
		}
	}
	e.external && (e.sharedDefsExtractedFor = e.external);
}
function n_(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		n_(e);
		let t = Object.keys(e);
		if (t.length !== 1 || t[0] !== "type") return;
		let r = e.type;
		for (let e of Array.isArray(r) ? r : [r]) {
			if (typeof e != "string") return;
			n.includes(e) || n.push(e);
		}
	}
	delete e.anyOf, e.type = n.length === 1 ? n[0] : n;
}
var r_ = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), i_ = ["oneOf", "anyOf"];
function a_(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function o_(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!r_.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? a_(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			ud(n, r, e.length === 1 ? e[0] : o_(e) ?? { allOf: e });
		}
		for (let t of e.required ?? []) r.add(t);
	}
	let i = {
		type: "object",
		properties: n
	};
	if (r.size && (i.required = [...r]), t.every((e) => e.additionalProperties === !1)) i.additionalProperties = !1;
	else {
		let e = [];
		for (let n of t) {
			let t = a_(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function s_(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of r_) if (t in e) return;
	let n = t.filter((e) => i_.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = o_(t);
	else {
		let e = n[0], i = i_.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => o_([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, Xg(e, r));
}
function c_(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Xg(i, s), Xg(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
			if (s.$ref && n.def) for (let e in i) e !== "$ref" && e !== "allOf" && e in n.def && JSON.stringify(i[e]) === JSON.stringify(n.def[e]) && delete i[e];
		}
		let s = t._zod.parent;
		if (s && s !== o) {
			r(s);
			let t = e.seen.get(s);
			if (t?.schema.$ref && (i.$ref = t.schema.$ref, t.def)) for (let e in i) e !== "$ref" && e !== "allOf" && e in t.def && JSON.stringify(i[e]) === JSON.stringify(t.def[e]) && delete i[e];
		}
		e.override({
			zodSchema: t,
			jsonSchema: i,
			path: n.path ?? []
		});
	};
	if (!e.external || e.sharedEmitDoneFor !== e.external) {
		for (let t of [...e.seen.entries()].reverse()) r(t[0]);
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) n_(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) s_(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Xg(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, ud(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: d_(t, "input", e.processors),
					output: d_(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function l_(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return l_(r.element, n);
	if (r.type === "set") return l_(r.valueType, n);
	if (r.type === "lazy") return l_(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return l_(r.innerType, n);
	if (r.type === "intersection") return l_(r.left, n) || l_(r.right, n);
	if (r.type === "record" || r.type === "map") return l_(r.keyType, n) || l_(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : l_(r.in, n) || l_(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (l_(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (l_(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (l_(e, n)) return !0;
		return !!(r.rest && l_(r.rest, n));
	}
	return !1;
}
var u_ = (e, t = {}) => (n) => {
	let r = Zg({
		...n,
		processors: t
	});
	return $g(e, r), t_(r, e), c_(r, e);
}, d_ = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Zg({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return $g(e, o), t_(o, e), c_(o, e);
}, f_ = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, p_ = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, m_ = (e, t) => {
	f_(e, "minimum", t), p_(e, "maximum", t);
}, h_ = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, g_ = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, __ = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, v_ = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, y_ = (e, t) => f_(e, "minimum", t.minimum), b_ = (e, t) => p_(e, "maximum", t.maximum), x_ = (e) => (t, n) => {
	v_(t, n.format);
	let [r, i] = e[n.format];
	f_(t, "minimum", r), p_(t, "maximum", i);
}, S_ = {
	greater_than: (e, t) => f_(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => p_(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => h_(e, t.value),
	number_format: x_(Ad),
	bigint_format: x_(jd),
	min_length: y_,
	max_length: b_,
	length_equals: (e, t) => m_(e, t.length),
	min_size: y_,
	max_size: b_,
	size_equals: (e, t) => m_(e, t.size),
	string_format: (e, t) => {
		v_(e, t.format), t.pattern && g_(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => __(e, t.mime)
};
function C_(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) S_[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && f_(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && f_(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && p_(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && p_(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && h_(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && __(t, i.mime);
	for (let e of i.patterns ?? []) g_(t, e);
	return t;
}
var w_ = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, T_ = /* @__PURE__ */ new Map([[Am, fp], [Mm, pp]]), E_ = (e) => T_.get(e) ?? e, D_ = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = C_(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = w_[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(E_);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, O_ = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = C_(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : Qg(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, k_ = (e, t, n, r) => {
	n.type = "boolean";
}, A_ = (e, t, n, r) => {
	n.not = {};
}, j_ = (e, t, n, r) => {
	let i = e._zod.def, a = nd(i.entries);
	a.length === 0 ? n.not = {} : (a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a);
}, M_ = (e, t, n, r) => {
	Qg(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, N_ = (e, t, n, r) => {
	Qg(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, P_ = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = C_(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = $g(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function F_(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? F_(t.out) : t.type === "catch" ? F_(t.innerType) : e._zod.optin;
}
var I_ = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && Qg(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) ud(i.properties, e, $g(o[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	}));
	let s = [];
	for (let e of Object.keys(o)) {
		let n = a.shape[e];
		(t.io === "input" ? F_(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = $g(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, L_ = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => $g(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, R_ = (e, t, n, r) => {
	let i = e._zod.def, a = $g(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = $g(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function z_(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = z_(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => z_(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i && (p.type = "string", a || (p.pattern = (r.includes("number") ? wp : Cp).source)), p;
}
var B_ = /* @__PURE__ */ new WeakMap();
function V_(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of B_.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = z_(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var H_ = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = C_(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = $g(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) ud(i.patternProperties, E_(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = $g(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = B_.get(t);
			n || (n = [], B_.set(t, n), t.deferred.push(() => V_(t))), n.push(e);
		}
		i.additionalProperties = $g(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && F_(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, U_ = (e, t, n, r) => {
	let i = e._zod.def, a = $g(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, W_ = (e, t, n, r) => {
	let i = e._zod.def;
	$g(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, G_ = Symbol();
function K_(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (Qg(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), G_) : JSON.parse(o);
}
var q_ = (e, t, n, r) => {
	let i = e._zod.def;
	$g(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = K_(i.defaultValue, e, t, n, r);
	o !== G_ && (n.default = o);
}, J_ = (e, t, n, r) => {
	let i = e._zod.def;
	$g(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = K_(i.defaultValue, e, t, n, r);
	o !== G_ && (n._prefault = o);
}, Y_ = (e, t, n, r) => {
	let i = e._zod.def;
	$g(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		Qg(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, X_ = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	$g(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Z_ = (e, t, n, r) => {
	let i = e._zod.def;
	$g(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Q_ = (e, t, n, r) => {
	let i = e._zod.def;
	$g(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, $_ = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function ev(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		get() {
			let e = n(this);
			return Object.defineProperty(this, t, {
				value: e,
				configurable: !0,
				writable: !0
			}), e;
		},
		set(e) {
			Object.defineProperty(this, t, {
				value: e,
				configurable: !0,
				writable: !0
			});
		}
	});
}
var tv = /*@__PURE__*/ Z("ZodError", (e, t) => {
	Ef.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	$_.has(n) || ($_.add(n), ev(n, "format", (e) => (t) => kf(e, t)), ev(n, "flatten", (e) => (t) => Of(e, t)), ev(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, id, 2);
	}), ev(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, id, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), nv = /* @__PURE__ */ jf(tv), rv = /* @__PURE__ */ Mf(tv), iv = /* @__PURE__ */ Nf(tv), av = /* @__PURE__ */ Ff(tv), ov = /* @__PURE__ */ Vf(tv), sv = /* @__PURE__ */ Hf(tv), cv = /* @__PURE__ */ Uf(tv), lv = /* @__PURE__ */ Wf(tv), uv = /* @__PURE__ */ Gf(tv), dv = /* @__PURE__ */ Kf(tv), fv = /* @__PURE__ */ qf(tv), pv = /* @__PURE__ */ Jf(tv);
// node_modules/zod/v4/classic/schemas.js
function mv() {
	yf.localeError || bf(Hh());
}
function hv() {
	yf.memoizer || bf({ memoizer: zh() });
}
var gv = /*@__PURE__*/ Z("ZodType", (e, t) => (mv(), Jp.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(_d(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return Dd(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(Ny(e, t));
	},
	superRefine(e, t) {
		return this.check(Py(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ Bg(e));
	},
	optional() {
		return hy(this);
	},
	exactOptional() {
		return _y(this);
	},
	nullable() {
		return yy(this);
	},
	nullish() {
		return hy(yy(this));
	},
	nonoptional(e) {
		return Ty(this, e);
	},
	array() {
		return ey(this);
	},
	or(e) {
		return ay([this, e]);
	},
	and(e) {
		return sy(this, e);
	},
	transform(e) {
		return ky(this, py(e));
	},
	default(e) {
		return xy(this, e);
	},
	prefault(e) {
		return Cy(this, e);
	},
	catch(e) {
		return Dy(this, e);
	},
	pipe(e) {
		return ky(this, e);
	},
	readonly() {
		return jy(this);
	},
	describe(e) {
		let t = this.clone();
		return Kh.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return Kh.get(this);
		let t = this.clone();
		return Kh.add(t, e[0]), t;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(e, ...t) {
		return t.length === 0 ? e(this) : e(this, ...t);
	},
	get "~standard"() {
		return tf(this, "~standard", {
			...Zp(this),
			jsonSchema: {
				input: d_(this, "input"),
				output: d_(this, "output")
			}
		});
	},
	set "~standard"(e) {
		ef(this, "~standard", e);
	},
	parse: function e(t, n) {
		return nv(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await rv(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return iv(this, e, t);
	},
	async safeParseAsync(e, t) {
		return av(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		ef(this, "spa", e);
	},
	validate(e, t) {
		return Rf(this, e, t);
	},
	validateAsync(e, t) {
		return Bf(this, e, t);
	},
	encode: function e(t, n) {
		return ov(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return sv(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await cv(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await lv(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return uv(this, e, t);
	},
	safeDecode(e, t) {
		return dv(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return fv(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return pv(this, e, t);
	},
	toJSONSchema(e) {
		return u_(this, {})(e);
	},
	get description() {
		return Kh.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), _v = /*@__PURE__*/ Z("_ZodString", (e, t) => {
	Qp.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => D_(e, t, n, r);
}, /*@__PURE__*/ nf({
	format: (e) => C_(e).format ?? null,
	minLength: (e) => C_(e).minimum ?? null,
	maxLength: (e) => C_(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ Pg(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ Lg(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ Rg(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ zg(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ Mg(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ jg(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ Ng(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ Mg(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ Fg(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ Ig(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ Hg());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ Vg(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ Ug());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ Wg());
	},
	slugify() {
		return this.check(/* @__PURE__ */ Gg());
	}
})), vv = /*@__PURE__*/ Z("ZodString", (e, t) => {
	Qp.init(e, t), _v.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ Yh(wv, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ tg(Dv, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ gg(Hv, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ ng(Ov, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ Xh(Tv, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Zh(Ev, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ Qh(Ev, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ $h(Ev, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ eg(Ev, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ rg(kv, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ ig(Av, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ ag(jv, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ og(Mv, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ pg(zv, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ mg(Bv, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ sg(Nv, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ cg(Pv, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ lg(Fv, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ ug(Iv, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ dg(Lv, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ fg(Rv, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ hg(Vv, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ _g(bv, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ vg(xv, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ yg(Sv, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ bg(Cv, e));
	}
});
function Q(e) {
	return /* @__PURE__ */ Jh(vv, e);
}
var yv = /*@__PURE__*/ Z("ZodStringFormat", (e, t) => {
	$p.init(e, t), _v.init(e, t);
}), bv = /*@__PURE__*/ Z("ZodISODateTime", (e, t) => {
	vm.init(e, t), yv.init(e, t);
}), xv = /*@__PURE__*/ Z("ZodISODate", (e, t) => {
	ym.init(e, t), yv.init(e, t);
}), Sv = /*@__PURE__*/ Z("ZodISOTime", (e, t) => {
	bm.init(e, t), yv.init(e, t);
}), Cv = /*@__PURE__*/ Z("ZodISODuration", (e, t) => {
	xm.init(e, t), yv.init(e, t);
}), wv = /*@__PURE__*/ Z("ZodEmail", (e, t) => {
	nm.init(e, t), yv.init(e, t);
}), Tv = /*@__PURE__*/ Z("ZodGUID", (e, t) => {
	em.init(e, t), yv.init(e, t);
}), Ev = /*@__PURE__*/ Z("ZodUUID", (e, t) => {
	tm.init(e, t), yv.init(e, t);
}), Dv = /*@__PURE__*/ Z("ZodURL", (e, t) => {
	um.init(e, t), yv.init(e, t);
}), Ov = /*@__PURE__*/ Z("ZodEmoji", (e, t) => {
	dm.init(e, t), yv.init(e, t);
}), kv = /*@__PURE__*/ Z("ZodNanoID", (e, t) => {
	fm.init(e, t), yv.init(e, t);
}), Av = /*@__PURE__*/ Z("ZodCUID", (e, t) => {
	pm.init(e, t), yv.init(e, t);
}), jv = /*@__PURE__*/ Z("ZodCUID2", (e, t) => {
	mm.init(e, t), yv.init(e, t);
}), Mv = /*@__PURE__*/ Z("ZodULID", (e, t) => {
	hm.init(e, t), yv.init(e, t);
}), Nv = /*@__PURE__*/ Z("ZodXID", (e, t) => {
	gm.init(e, t), yv.init(e, t);
}), Pv = /*@__PURE__*/ Z("ZodKSUID", (e, t) => {
	_m.init(e, t), yv.init(e, t);
}), Fv = /*@__PURE__*/ Z("ZodIPv4", (e, t) => {
	Sm.init(e, t), yv.init(e, t);
}), Iv = /*@__PURE__*/ Z("ZodIPv6", (e, t) => {
	Tm.init(e, t), yv.init(e, t);
}), Lv = /*@__PURE__*/ Z("ZodCIDRv4", (e, t) => {
	Em.init(e, t), yv.init(e, t);
}), Rv = /*@__PURE__*/ Z("ZodCIDRv6", (e, t) => {
	Om.init(e, t), yv.init(e, t);
}), zv = /*@__PURE__*/ Z("ZodBase64", (e, t) => {
	jm.init(e, t), yv.init(e, t);
}), Bv = /*@__PURE__*/ Z("ZodBase64URL", (e, t) => {
	Pm.init(e, t), yv.init(e, t);
}), Vv = /*@__PURE__*/ Z("ZodE164", (e, t) => {
	Fm.init(e, t), yv.init(e, t);
}), Hv = /*@__PURE__*/ Z("ZodJWT", (e, t) => {
	Lm.init(e, t), yv.init(e, t);
}), Uv = /*@__PURE__*/ Z("ZodNumber", (e, t) => {
	Rm.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => O_(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ nf({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = C_(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = C_(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = C_(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => C_(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ Og(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ kg(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ kg(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ Eg(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ Dg(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Dg(e, t));
	},
	int(e) {
		return this.check(Kv(e));
	},
	safe(e) {
		return this.check(Kv(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ Og(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ kg(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ Eg(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ Dg(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ Ag(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ Ag(e, t));
	},
	finite() {
		return this;
	}
}));
function Wv(e) {
	return /* @__PURE__ */ xg(Uv, e);
}
var Gv = /*@__PURE__*/ Z("ZodNumberFormat", (e, t) => {
	zm.init(e, t), Uv.init(e, t);
});
function Kv(e) {
	return /* @__PURE__ */ Sg(Gv, e);
}
var qv = /*@__PURE__*/ Z("ZodBoolean", (e, t) => {
	Bm.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => k_(e, t, n, r);
});
function Jv(e) {
	return /* @__PURE__ */ Cg(qv, e);
}
var Yv = /*@__PURE__*/ Z("ZodUnknown", (e, t) => {
	Vm.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Xv() {
	return /* @__PURE__ */ wg(Yv);
}
var Zv = /*@__PURE__*/ Z("ZodNever", (e, t) => {
	Hm.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => A_(e, t, n, r);
});
function Qv(e) {
	return /* @__PURE__ */ Tg(Zv, e);
}
var $v = /*@__PURE__*/ Z("ZodArray", (e, t) => {
	hv(), Km.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => P_(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ Mg(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ Mg(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ jg(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ Ng(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function ey(e, t) {
	return /* @__PURE__ */ Kg($v, e, t);
}
var ty = /*@__PURE__*/ Z("ZodObject", (e, t) => {
	hv(), Qm.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => I_(e, t, n, r), uf(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return dy(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(_d(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(_d(this._zod.def, { catchall: Xv() }));
	},
	loose() {
		return this.clone(_d(this._zod.def, { catchall: Xv() }));
	},
	strict() {
		return this.clone(_d(this._zod.def, { catchall: Qv() }));
	},
	strip() {
		return this.clone(_d(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Fd(this, e);
	},
	safeExtend(e) {
		return Ld(this, e);
	},
	merge(e) {
		return Rd(this, e);
	},
	pick(e) {
		return Md(this, e);
	},
	omit(e) {
		return Pd(this, e);
	},
	partial(...e) {
		return zd(my, this, e[0]);
	},
	exactPartial(...e) {
		return zd(gy, this, e[0], "exactPartial");
	},
	required(...e) {
		return Bd(wy, this, e[0]);
	}
});
function ny(e, t) {
	return new ty({
		type: "object",
		shape: e ?? {},
		...X(t)
	});
}
function ry(e, t) {
	return new ty({
		type: "object",
		shape: e,
		catchall: Xv(),
		...X(t)
	});
}
var iy = /*@__PURE__*/ Z("ZodUnion", (e, t) => {
	eh.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => L_(e, t, n, r), e.options = t.options;
});
function ay(e, t) {
	return new iy({
		type: "union",
		options: e,
		...X(t)
	});
}
var oy = /*@__PURE__*/ Z("ZodIntersection", (e, t) => {
	th.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => R_(e, t, n, r);
});
function sy(e, t) {
	return new oy({
		type: "intersection",
		left: e,
		right: t
	});
}
var cy = /*@__PURE__*/ Z("ZodRecord", (e, t) => {
	hv(), ih.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => H_(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function ly(e, t, n) {
	return !t || !t._zod ? new cy({
		type: "record",
		keyType: Q(),
		valueType: e,
		...X(t)
	}) : new cy({
		type: "record",
		keyType: e,
		valueType: t,
		...X(n)
	});
}
var uy = /*@__PURE__*/ Z("ZodEnum", (e, t) => {
	ah.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => j_(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new uy({
			...t,
			checks: [],
			...X(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new uy({
			...t,
			checks: [],
			...X(r),
			entries: i
		});
	};
});
function dy(e, t) {
	return new uy({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...X(t)
	});
}
var fy = /*@__PURE__*/ Z("ZodTransform", (e, t) => {
	hv(), oh.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => N_(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new vf(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Qd(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(Qd(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function py(e) {
	return new fy({
		type: "transform",
		transform: e
	});
}
var my = /*@__PURE__*/ Z("ZodOptional", (e, t) => {
	ch.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => Q_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function hy(e) {
	return new my({
		type: "optional",
		innerType: e
	});
}
var gy = /*@__PURE__*/ Z("ZodExactOptional", (e, t) => {
	lh.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => Q_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function _y(e) {
	return new gy({
		type: "optional",
		innerType: e
	});
}
var vy = /*@__PURE__*/ Z("ZodNullable", (e, t) => {
	uh.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => U_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function yy(e) {
	return new vy({
		type: "nullable",
		innerType: e
	});
}
var by = /*@__PURE__*/ Z("ZodDefault", (e, t) => {
	dh.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => q_(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function xy(e, t) {
	return new by({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : wd(t);
		}
	});
}
var Sy = /*@__PURE__*/ Z("ZodPrefault", (e, t) => {
	ph.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => J_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Cy(e, t) {
	return new Sy({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : wd(t);
		}
	});
}
var wy = /*@__PURE__*/ Z("ZodNonOptional", (e, t) => {
	mh.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => W_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ty(e, t) {
	return new wy({
		type: "nonoptional",
		innerType: e,
		...X(t)
	});
}
var Ey = /*@__PURE__*/ Z("ZodCatch", (e, t) => {
	_h.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => Y_(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Dy(e, t) {
	return new Ey({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : ff(t)
	});
}
var Oy = /*@__PURE__*/ Z("ZodPipe", (e, t) => {
	vh.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => X_(e, t, n, r), e.in = t.in, e.out = t.out;
});
function ky(e, t) {
	return new Oy({
		type: "pipe",
		in: e,
		out: t
	});
}
var Ay = /*@__PURE__*/ Z("ZodReadonly", (e, t) => {
	bh.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => Z_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function jy(e) {
	return new Ay({
		type: "readonly",
		innerType: e
	});
}
var My = /*@__PURE__*/ Z("ZodCustom", (e, t) => {
	Sh.init(e, t), gv.init(e, t), e._zod.processJSONSchema = (t, n, r) => M_(e, t, n, r);
});
function Ny(e, t = {}) {
	return /* @__PURE__ */ qg(My, e, t);
}
function Py(e, t) {
	return /* @__PURE__ */ Jg(e, t);
}
// src/schemas/common.ts
var Fy = {
	workspace: 8,
	save: 8
}, Iy = Q().regex(/^[a-z0-9][a-z0-9-]*$/, "必须是小写字母、数字与短横线").max(64);
Q().regex(/^\d+\.\d+\.\d+$/, "必须是 x.y.z 形式的版本号");
var Ly = Wv().int().nonnegative(), Ry = ry({}), zy = ny({
	ownerKey: Q().min(1),
	ownerLabel: Q(),
	ruleId: Iy,
	currentSaveId: Q().nullable(),
	data: Ry,
	savedHash: Q(),
	schemaVersion: Wv().int(),
	updatedAt: Ly
}), By = ny({
	partyNames: ey(Q()).default([]),
	partyCount: Wv().int().nonnegative().default(0),
	location: Q().optional(),
	round: Wv().int().optional()
}), Vy = dy([
	"读档前",
	"新存档前",
	"切换规则前",
	"恢复备份前",
	"改动模组前"
]), Hy = ny({
	id: Q().min(1),
	ownerKey: Q().min(1),
	ownerLabel: Q(),
	ruleId: Iy,
	name: Q().min(1).max(80),
	note: Q().max(400).default(""),
	kind: dy(["manual", "auto"]),
	autoReason: Vy.optional(),
	branchedFrom: Q().optional(),
	createdAt: Ly,
	updatedAt: Ly,
	deletedAt: Ly.optional(),
	summary: By,
	snapshot: Ry,
	hash: Q(),
	schemaVersion: Wv().int()
}), Uy = ny({
	reminderDays: Wv().int().positive().default(7),
	reminderSaves: Wv().int().positive().default(10),
	undoLimit: Wv().int().min(1).max(500).default(50)
}), Wy = ny({
	lastExportAt: Ly.nullable().default(null),
	savesSinceExport: Wv().int().nonnegative().default(0),
	persistRequested: Jv().default(!1),
	persistGranted: Jv().default(!1)
}), Gy = 864e5;
function Ky(e) {
	return e < 1024 ? `${e} B` : e < 1048576 ? `${Math.ceil(e / 1024)} KB` : `${(e / 1024 / 1024).toFixed(1)} MB`;
}
function qy(e, t, n, r) {
	let i = r === void 0 ? "" : ` · 约 ${Ky(r)}`;
	if (e.lastExportAt === null) return {
		kind: "never",
		daysSince: null,
		savesSince: e.savesSinceExport,
		...r === void 0 ? {} : { estimatedBytes: r },
		text: `还没有导出过备份${i}`
	};
	let a = Math.max(0, Math.floor((n - e.lastExportAt) / Gy)), o = a >= t.reminderDays || e.savesSinceExport >= t.reminderSaves, s = a === 0 ? "今天" : `${a} 天前`, c = (o ? `建议导出备份 · 上次完整备份：${s}，之后保存 ${e.savesSinceExport} 次` : `上次完整备份：${s} · 之后保存 ${e.savesSinceExport} 次`) + i;
	return {
		kind: o ? "due" : "ok",
		daysSince: a,
		savesSince: e.savesSinceExport,
		...r === void 0 ? {} : { estimatedBytes: r },
		text: c
	};
}
async function Jy(e) {
	return Wy.parse(await e.getMeta("backup") ?? {});
}
async function Yy(e) {
	return Uy.parse(await e.getMeta("settings") ?? {});
}
async function Xy(e, t) {
	let n = await Jy(e);
	await e.setMeta("backup", {
		...n,
		lastExportAt: t,
		savesSinceExport: 0
	});
}
async function Zy(e, t = globalThis.navigator?.storage) {
	let n = await Jy(e);
	if (n.persistRequested) return n;
	let r = t?.persist ? await t.persist() : !1, i = {
		...n,
		persistRequested: !0,
		persistGranted: r
	};
	return await e.setMeta("backup", i), i;
}
// src/core/ids.ts
function Qy() {
	let e = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(e), e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
	let t = Array.from(e, (e) => e.toString(16).padStart(2, "0"));
	return `${t.slice(0, 4).join("")}-${t.slice(4, 6).join("")}-${t.slice(6, 8).join("")}-${t.slice(8, 10).join("")}-${t.slice(10).join("")}`;
}
function $y(e) {
	if (e.groupId) {
		let t = e.groups?.find((t) => t.id === e.groupId);
		return {
			ownerKey: `group:${e.groupId}`,
			ownerLabel: t?.name ?? "群组"
		};
	}
	if (e.characterId !== void 0 && e.characterId !== null) {
		let t = e.characters?.[Number(e.characterId)];
		if (t?.avatar) return {
			ownerKey: `char:${t.avatar}`,
			ownerLabel: t.name ?? t.avatar
		};
	}
	return null;
}
// src/core/errors.ts
var $ = class extends Error {
	code;
	details;
	constructor(e, t, n) {
		super(t), this.name = "TrpgError", this.code = e, this.details = n;
	}
}, eb = ny({
	kind: Q().min(1),
	set: Q().min(1),
	prop: Q().min(1),
	hash: Q().min(1),
	label: Q().optional(),
	author: Q().optional(),
	itemId: Q().optional()
}), tb = ny({
	rule: Q().min(1),
	codeSet: Q().min(1),
	scopes: ey(Q()).default([]),
	include: ey(Q()).default([]),
	exclude: ey(Q()).default([]),
	choices: ly(Q(), Q()).default({})
}), nb = ny({
	actor: ly(Q(), Xv()).default({}),
	items: ly(Q(), ly(Q(), Xv())).default({}),
	effects: ly(Q(), ly(Q(), Xv())).default({}),
	itemAdded: ey(ly(Q(), Xv())).default([]),
	itemRemoved: ey(Q()).default([]),
	effectAdded: ey(ly(Q(), Xv())).default([]),
	effectRemoved: ey(Q()).default([])
}), rb = ny({
	id: Q().min(1),
	name: Q(),
	seed: Q().default(""),
	refs: ey(eb).default([]),
	choices: ly(Q(), Xv()).default({}),
	state: nb.default({
		actor: {},
		items: {},
		effects: {},
		itemAdded: [],
		itemRemoved: [],
		effectAdded: [],
		effectRemoved: []
	}),
	adjustments: ly(Q(), Xv()).default({}),
	dice: ey(Wv().int()).default([]),
	legacy: Jv().default(!1),
	legacyState: ly(Q(), Xv()).optional()
}), ib = ny({
	official: Q().default(""),
	brews: ly(Q(), Q()).default({})
});
ny({
	action: dy([
		"create",
		"update",
		"delete"
	]),
	type: Q().min(1),
	pack: Q().nullable().default(null),
	parentUuid: Q().nullable().default(null),
	data: Xv()
});
var ab = ny({
	at: Wv().int().nonnegative(),
	revision: Wv().int().nonnegative(),
	actorIds: ey(Q()),
	before: ly(Q(), Xv()),
	combatBefore: ly(Q(), Xv()).optional()
}), ob = ny({
	target: eb,
	house: eb,
	digest: Q()
}), sb = ny({
	id: Q().min(1),
	actorId: Q().min(1),
	name: Q().optional(),
	initiative: Wv().nullable().default(null),
	defeated: Jv().default(!1),
	hidden: Jv().default(!1)
}), cb = ny({
	id: Q().nullable().default(null),
	name: Q().default(""),
	round: Wv().int().nonnegative().default(0),
	turn: Wv().int().nullable().default(null),
	active: Jv().default(!1),
	combatants: ey(sb).default([])
}), lb = ny({
	rule: Q().min(1),
	kernelVersion: Wv().int().nonnegative(),
	library: tb,
	dataVersion: ib.default({
		official: "",
		brews: {}
	}),
	overrides: ey(ob).default([]),
	actors: ey(rb).default([]),
	combat: cb.default({
		id: null,
		name: "",
		round: 0,
		turn: null,
		active: !1,
		combatants: []
	}),
	revision: Wv().int().nonnegative().default(0),
	undo: ey(ab).default([]),
	legacy: Jv().default(!1)
});
// src/core/saves/split.ts
function ub(e) {
	return `${e.set}|${e.prop}|${e.hash}`;
}
var db = (e) => {
	let t = /* @__PURE__ */ new Map();
	if (!Array.isArray(e)) return t;
	for (let r of e) n(r) && typeof r._id == "string" && t.set(r._id, r);
	return t;
}, fb = (e) => {
	let t = a(e);
	return delete t.items, delete t.effects, t;
};
function pb(e, t) {
	let r = n(e.flags) && n(e.flags.plutonium) ? e.flags.plutonium : null;
	if (r?.source && r?.hash && (r.page === "bestiary.html" || r.propDroppable === "creature" || e.type !== "character")) {
		let n = t({
			...r,
			propDroppable: "creature"
		});
		if (!n) throw Error(`无法把作者编号对应到【库】条目：${r.source}/${r.hash}`);
		return [{
			...n,
			label: n.label ?? (typeof e.name == "string" ? e.name : void 0)
		}];
	}
	let i = [];
	if (!Array.isArray(e.items)) return i;
	for (let r of e.items) {
		if (!n(r) || typeof r._id != "string") continue;
		let e = n(r.flags) && n(r.flags.plutonium) ? r.flags.plutonium : null;
		if (!e) continue;
		let a = t(e);
		if (!a) throw Error(`无法把作者编号对应到【库】条目：${e.source}/${e.hash}`);
		i.push({
			...a,
			itemId: r._id,
			label: a.label ?? (typeof r.name == "string" ? r.name : void 0)
		});
	}
	return i;
}
function mb(e, o, s, c, l = t) {
	let u = e.data, d = o.data, f = nb.parse({});
	f.actor = l(fb(d), fb(u));
	let p = pb(u, s), m = /* @__PURE__ */ new Map();
	for (let e of p) if (e.itemId) {
		let t = i(e);
		t && m.set(e.itemId, t);
	}
	let h = db(d.items), g = db(u.items);
	for (let [e, t] of g) {
		let i = h.get(e), o = n(t.flags) && n(t.flags.plutonium) ? t.flags.plutonium : null, s = r(o) ?? m.get(e) ?? e;
		if (!i) {
			s.startsWith("ref:") || f.itemAdded.push(a(t));
			continue;
		}
		let c = l(i, t);
		Object.keys(c).length && (f.items[s] = c);
	}
	for (let [e, t] of h) {
		if (g.has(e)) continue;
		let a = n(t.flags) && n(t.flags.plutonium) ? t.flags.plutonium : null, o = r(a), c = a ? s(a) : null;
		f.itemRemoved.push(o ?? i(c) ?? e);
	}
	let _ = db(d.effects), v = db(u.effects);
	for (let [e, t] of v) {
		let n = _.get(e);
		if (!n) {
			f.effectAdded.push(a(t));
			continue;
		}
		let r = l(n, t);
		Object.keys(r).length && (f.effects[e] = r);
	}
	for (let e of _.keys()) v.has(e) || f.effectRemoved.push(e);
	return {
		refs: p,
		choices: c,
		state: f
	};
}
function hb() {
	return {
		id: null,
		name: "",
		round: 0,
		turn: null,
		active: !1,
		combatants: []
	};
}
var gb = (e) => typeof e._id != "string" || typeof e.actorId != "string" ? null : {
	id: e._id,
	actorId: e.actorId,
	name: typeof e.name == "string" ? e.name : void 0,
	initiative: typeof e.initiative == "number" ? e.initiative : null,
	defeated: e.defeated === !0,
	hidden: e.hidden === !0
};
function _b(e, t) {
	let r = a(e), i = n(t.data) ? t.data : {};
	if (t.type === "Combat") {
		if (t.action === "delete") return hb();
		if (t.action === "create") return r.id = typeof i._id == "string" ? i._id : null, r.name = typeof i.name == "string" ? i.name : r.name, r.round = typeof i.round == "number" ? i.round : 0, r.turn = typeof i.turn == "number" ? i.turn : null, r.active = i.active === !0, r.combatants = Array.isArray(i.combatants) ? i.combatants.map(gb).filter((e) => !!e) : [], r;
		if (typeof i._id == "string" && (r.id = i._id), typeof i.name == "string" && (r.name = i.name), typeof i.round == "number" && (r.round = i.round), (typeof i.turn == "number" || i.turn === null) && (r.turn = i.turn), typeof i.active == "boolean" && (r.active = i.active), Array.isArray(i.combatants)) for (let e of i.combatants) {
			if (!n(e)) continue;
			let t = gb(e);
			if (!t) continue;
			let i = r.combatants.findIndex((e) => e.id === t.id);
			i < 0 ? r.combatants.push(t) : r.combatants[i] = {
				...r.combatants[i],
				...t
			};
		}
		return r;
	}
	if (t.type !== "Combatant") return r;
	let o = typeof i._id == "string" ? i._id : null;
	if (t.action === "delete") {
		let e = Array.isArray(t.data) ? t.data.filter((e) => typeof e == "string") : o ? [o] : [];
		return r.combatants = r.combatants.filter((t) => !e.includes(t.id)), r;
	}
	let s = gb({
		...i,
		_id: o ?? i._id,
		actorId: i.actorId ?? r.combatants.find((e) => e.id === o)?.actorId
	});
	if (!s) return r;
	let c = r.combatants.findIndex((e) => e.id === s.id);
	return c < 0 ? r.combatants.push(s) : r.combatants[c] = {
		...r.combatants[c],
		...s
	}, r;
}
function vb(e) {
	return e.type === "Combat" || e.type === "Combatant";
}
function yb(e) {
	return e.parentUuid?.startsWith("Actor.") ? e.parentUuid.slice(6) : e.type === "Actor" && n(e.data) && typeof e.data._id == "string" ? e.data._id : null;
}
function bb(t, n) {
	e(t, n);
}
function xb(e, t, r) {
	let i = a(e), o = i.state, s = n(t.data) ? t.data : {};
	if (t.type === "Actor") {
		if (t.action === "delete") return o.actor = { __deleted: !0 }, i;
		if (t.action === "create") throw Error("没有 compactActors：不能把 Actor.create 直接塞进存档");
		return bb(o.actor, s), i;
	}
	if (t.type === "Item") {
		let e = typeof s._id == "string" ? s._id : null;
		if (t.action === "delete") {
			let n = Array.isArray(t.data) ? t.data.filter((e) => typeof e == "string") : e ? [e] : [];
			return o.itemRemoved.push(...n), i;
		}
		if (t.action === "create") {
			let t = n(s.flags) && n(s.flags.plutonium) ? s.flags.plutonium : null, a = t ? r(t) : null;
			if (n(s.system) && n(s.system.advancement) && Object.values(s.system.advancement).some((e) => n(e) && n(e.value) && Object.keys(e.value).length)) throw Error("没有 compactActors：不能从 Item.create 推回成长选择");
			if (!a || !e) throw Error("没有 compactActors：不能把没有作者编号的物品整份存进存档");
			return i.refs.push({
				...a,
				itemId: e,
				label: a.label ?? (typeof s.name == "string" ? s.name : void 0)
			}), i;
		}
		if (!e) return i;
		let c = a(s);
		if (delete c._id, n(c.system) && n(c.system.advancement)) throw Error("没有 compactActors：不能从物品更新推回成长选择");
		return o.items[e] = o.items[e] ? {
			...o.items[e],
			...c
		} : c, i;
	}
	if (t.type === "ActiveEffect") {
		let e = typeof s._id == "string" ? s._id : null;
		if (t.action === "delete") {
			let n = Array.isArray(t.data) ? t.data.filter((e) => typeof e == "string") : e ? [e] : [];
			return o.effectRemoved.push(...n), i;
		}
		return t.action === "create" ? (o.effectAdded.push(a(s)), i) : (e && (o.effects[e] = o.effects[e] ? {
			...o.effects[e],
			...a(s)
		} : a(s)), i);
	}
	return i;
}
function Sb(e, t, n) {
	let r = a(e);
	for (let e of t) vb(e) || (r = xb(r, e, n));
	return r;
}
// src/core/saves/kernel.ts
var Cb = 50, wb = class {
	deps;
	constructor(e) {
		this.deps = e;
	}
	async refMapper(e) {
		return this.deps.mapRef ? this.deps.mapRef(e) : () => {
			throw new $("E_NO_REF_MAPPER", "没有提供作者编号到【库】条目的对照");
		};
	}
	async workspace(e) {
		let t = await this.deps.campaign.getWorkspace(e);
		if (!t) throw new $("E_NO_WORKSPACE", "还没有当前战役");
		return t;
	}
	parse(e) {
		if (!e) return null;
		try {
			return lb.parse(e);
		} catch {
			throw new $("E_BAD_KERNEL", "存档里的结算内核段损坏");
		}
	}
	async read(e) {
		let t = await this.workspace(e);
		return this.parse(t.data.kernel);
	}
	async bind(e, t) {
		let n = await this.workspace(e), r = this.parse(t) ?? lb.parse(t);
		if (r.rule !== n.ruleId) throw new $("E_RULE_MISMATCH", `结算内核规则 ${r.rule} 与战役规则 ${n.ruleId} 不一致`);
		return await this.deps.campaign.updateData(e, (e) => ({
			...e,
			kernel: r,
			library: r.library
		})), r;
	}
	async setLibrary(e, t) {
		let n = await this.read(e);
		if (!n) throw new $("E_NO_KERNEL", "这个战役还没有绑定结算内核");
		let r = {
			...n,
			library: tb.parse(t)
		};
		return await this.deps.campaign.updateData(e, (e) => ({
			...e,
			library: r.library,
			kernel: r
		})), r;
	}
	unboundCheck() {
		return {
			bound: !1,
			rule: null,
			ruleMissing: !1,
			missing: [],
			checked: 0,
			dataVersion: null,
			dataVersionChanged: !1,
			dataVersionChanges: {
				official: null,
				brews: []
			},
			overridesChanged: !1,
			overrideChanges: []
		};
	}
	async check(e) {
		let t = await this.workspace(e), n = this.parse(t.data.kernel);
		if (!n) return this.unboundCheck();
		let r = tb.parse(t.data.library ?? n.library);
		return this.checkKernel(n, r);
	}
	async checkSave(e) {
		let t = await this.deps.campaign.getSave(e);
		if (!t || t.deletedAt !== void 0) throw new $("E_NOT_FOUND", "没有找到这个存档");
		let n = t.snapshot, r = this.parse(n.kernel);
		if (!r) return this.unboundCheck();
		let i = tb.parse(n.library ?? r.library);
		return this.checkKernel(r, i);
	}
	async checkKernel(e, t) {
		let n = !this.deps.rules.get(e.rule), r = [];
		for (let t of e.actors) for (let e of t.refs) r.push({
			actorId: t.id,
			actorName: t.name,
			ref: e
		});
		let i = r.length ? await this.deps.checkRefs(r.map((e) => e.ref), t) : [], a = [];
		i.forEach((e, t) => {
			if (e.ok) return;
			let n = r[t];
			a.push({
				...n,
				ref: {
					...n.ref,
					label: n.ref.label
				},
				reason: e.reason ?? "missing"
			});
		});
		let o = this.deps.currentVersion ? await this.deps.currentVersion() : void 0, s = {
			official: o && o.official !== e.dataVersion.official ? {
				before: e.dataVersion.official,
				after: o.official
			} : null,
			brews: []
		};
		if (o) {
			let t = /* @__PURE__ */ new Set([...Object.keys(e.dataVersion.brews), ...Object.keys(o.brews)]);
			for (let n of [...t].sort()) {
				let t = e.dataVersion.brews[n] ?? null, r = o.brews[n] ?? null;
				t !== r && s.brews.push({
					id: n,
					before: t,
					after: r,
					change: t === null ? "added" : r === null ? "removed" : "changed"
				});
			}
		}
		let c = this.deps.currentOverrides ? await this.deps.currentOverrides() : void 0, l = [];
		if (c) {
			let t = (e) => `${e.set}|${e.prop}|${e.hash}`, n = new Map(e.overrides.map((e) => [t(e.target), e])), r = new Map(c.map((e) => [t(e.target), e]));
			for (let e of /* @__PURE__ */ new Set([...n.keys(), ...r.keys()])) {
				let i = n.get(e), a = r.get(e);
				!i && a ? l.push({
					target: a.target,
					change: "added",
					before: null,
					after: a.digest
				}) : i && !a ? l.push({
					target: i.target,
					change: "removed",
					before: i.digest,
					after: null
				}) : i && a && (i.digest !== a.digest || t(i.house) !== t(a.house)) && l.push({
					target: a.target,
					change: "changed",
					before: i.digest,
					after: a.digest
				});
			}
		}
		return {
			bound: !0,
			rule: e.rule,
			ruleMissing: n,
			missing: a,
			checked: r.length,
			dataVersion: e.dataVersion,
			dataVersionChanged: !!o && (s.official !== null || s.brews.length > 0),
			dataVersionChanges: s,
			overridesChanged: l.length > 0,
			overrideChanges: l
		};
	}
	async keepSaved(e) {
		let t = await this.read(e);
		if (!t) throw new $("E_NO_KERNEL", "这个战役还没有绑定结算内核");
		return t;
	}
	async adoptCurrent(e, t = {}) {
		let n = await this.read(e);
		if (!n) throw new $("E_NO_KERNEL", "这个战役还没有绑定结算内核");
		let r = t.dataVersion ?? (this.deps.currentVersion ? await this.deps.currentVersion() : n.dataVersion), i = t.overrides ?? (this.deps.currentOverrides ? await this.deps.currentOverrides() : n.overrides), a = {
			...n,
			dataVersion: r,
			overrides: i,
			revision: n.revision + 1
		};
		await this.deps.campaign.updateData(e, (e) => ({
			...e,
			kernel: a
		}));
		let { save: o } = await this.deps.campaign.branch(e, "采用现在的");
		return {
			kernel: a,
			save: o
		};
	}
	async save(e) {
		let t = await this.read(e);
		if (t) {
			let n = this.deps.currentVersion ? await this.deps.currentVersion() : t.dataVersion, r = this.deps.currentOverrides ? await this.deps.currentOverrides() : t.overrides;
			if (JSON.stringify(n) !== JSON.stringify(t.dataVersion) || JSON.stringify(r) !== JSON.stringify(t.overrides)) {
				let i = {
					...t,
					dataVersion: n,
					overrides: r
				};
				await this.deps.campaign.updateData(e, (e) => ({
					...e,
					kernel: i
				}));
			}
		}
		return this.deps.campaign.saveCurrent(e);
	}
	async preview(e, t) {
		let n = await this.read(e);
		if (!n) throw new $("E_NO_KERNEL", "这个战役还没有绑定结算内核");
		let r = await this.refMapper(e), i = t.map((e) => {
			let t = yb(e), i = n.actors.find((e) => e.id === t) ?? null, o = vb(e) ? a(n.combat) : i ? a(i.state) : null, s = vb(e) ? _b(n.combat, e) : i ? Sb(i, [e], r).state : null;
			return {
				actorId: t,
				actorName: i?.name ?? null,
				change: e,
				before: o,
				after: s
			};
		});
		return {
			revision: n.revision,
			rows: i
		};
	}
	async apply(e, t, n) {
		if (!await this.read(e)) throw new $("E_NO_KERNEL", "这个战役还没有绑定结算内核");
		let r = [...new Set(t.map(yb).filter((e) => !!e))], i = this.deps.compactActors && r.length ? await this.deps.compactActors(e, r) : [], o = await this.refMapper(e), s = new Map(i.map((e) => [e.id, e])), c = this.deps.undoLimit ? await this.deps.undoLimit() : Cb;
		return this.deps.db.transaction("rw", this.deps.db.workspaces, async () => {
			let r = await this.deps.db.workspaces.get(e);
			if (!r) throw new $("E_NO_WORKSPACE", "还没有当前战役");
			let i = this.parse(r.data.kernel);
			if (!i) throw new $("E_NO_KERNEL", "这个战役还没有绑定结算内核");
			if (i.revision !== n) throw new $("E_REVISION_CONFLICT", "存档已被其他窗口修改，请重新预览");
			let l = {}, u = i.actors.map((e) => a(e)), d = a(i.combat), f = !1;
			for (let e of t) {
				if (vb(e)) {
					d = _b(d, e), f = !0;
					continue;
				}
				let t = yb(e);
				if (!t) continue;
				let n = u.findIndex((e) => e.id === t);
				if (n < 0) continue;
				t in l || (l[t] = a(u[n]));
				let r = s.get(t);
				if (this.deps.compactActors && !r) throw new $("E_NO_COMPACTOR", `没有拿到人物 ${t} 的重建结果`);
				if (r) {
					let e = u[n];
					u[n] = {
						...e,
						...a(r),
						adjustments: e.adjustments,
						dice: e.dice,
						legacy: e.legacy,
						legacyState: e.legacyState
					};
				} else u[n] = Sb(u[n], [e], o);
			}
			let p = {
				...i,
				actors: u,
				combat: d,
				revision: i.revision + 1,
				undo: [...i.undo, {
					at: this.deps.now(),
					revision: i.revision,
					actorIds: Object.keys(l),
					before: l,
					...f ? { combatBefore: a(i.combat) } : {}
				}].slice(-c)
			}, m = {
				...r,
				data: {
					...r.data,
					kernel: p
				},
				updatedAt: this.deps.now()
			};
			return await this.deps.db.workspaces.put(m), {
				workspace: m,
				kernel: p
			};
		});
	}
	async undo(e, t) {
		return this.deps.db.transaction("rw", this.deps.db.workspaces, async () => {
			let r = await this.deps.db.workspaces.get(e);
			if (!r) throw new $("E_NO_WORKSPACE", "还没有当前战役");
			let i = this.parse(r.data.kernel);
			if (!i) throw new $("E_NO_KERNEL", "这个战役还没有绑定结算内核");
			if (i.revision !== t) throw new $("E_REVISION_CONFLICT", "存档已被其他窗口修改，请重新读取");
			let o = i.undo.at(-1);
			if (!o) return null;
			let s = i.actors.map((e) => {
				if (!o.actorIds.includes(e.id)) return a(e);
				let t = o.before[e.id];
				return n(t) && "refs" in t && "state" in t ? a(t) : {
					...a(e),
					state: t ?? e.state
				};
			}), c = o.combatBefore ? cb.parse(o.combatBefore) : i.combat, l = {
				...i,
				actors: s,
				combat: c,
				revision: i.revision + 1,
				undo: i.undo.slice(0, -1)
			}, u = {
				...r,
				data: {
					...r.data,
					kernel: l
				},
				updatedAt: this.deps.now()
			};
			return await this.deps.db.workspaces.put(u), {
				workspace: u,
				kernel: l
			};
		});
	}
}, Tb = /* @__PURE__ */ y((/* @__PURE__ */ g(((e, t, n) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r() : typeof define == "function" && define.amd ? define(r) : (n = typeof globalThis < "u" ? globalThis : n || self, n.Dexie = r());
	})(n, (function() {
		var e = function(t, n) {
			return e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(e, t) {
				e.__proto__ = t;
			} || function(e, t) {
				for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
			}, e(t, n);
		};
		function t(t, n) {
			if (typeof n != "function" && n !== null) throw TypeError("Class extends value " + String(n) + " is not a constructor or null");
			e(t, n);
			function r() {
				this.constructor = t;
			}
			t.prototype = n === null ? Object.create(n) : (r.prototype = n.prototype, new r());
		}
		var n = function() {
			return n = Object.assign || function(e) {
				for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
				return e;
			}, n.apply(this, arguments);
		};
		function r(e, t, n) {
			if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a ||= Array.prototype.slice.call(t, 0, r), a[r] = t[r]);
			return e.concat(a || Array.prototype.slice.call(t));
		}
		var i = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, a = Object.keys, o = Array.isArray;
		typeof Promise < "u" && !i.Promise && (i.Promise = Promise);
		function s(e, t) {
			return typeof t == "object" && a(t).forEach(function(n) {
				e[n] = t[n];
			}), e;
		}
		var c = Object.getPrototypeOf, l = {}.hasOwnProperty;
		function u(e, t) {
			return l.call(e, t);
		}
		function d(e, t) {
			typeof t == "function" && (t = t(c(e))), (typeof Reflect > "u" ? a : Reflect.ownKeys)(t).forEach(function(n) {
				p(e, n, t[n]);
			});
		}
		var f = Object.defineProperty;
		function p(e, t, n, r) {
			f(e, t, s(n && u(n, "get") && typeof n.get == "function" ? {
				get: n.get,
				set: n.set,
				configurable: !0
			} : {
				value: n,
				configurable: !0,
				writable: !0
			}, r));
		}
		function m(e) {
			return { from: function(t) {
				return e.prototype = Object.create(t.prototype), p(e.prototype, "constructor", e), { extend: d.bind(null, e.prototype) };
			} };
		}
		var h = Object.getOwnPropertyDescriptor;
		function g(e, t) {
			var n = h(e, t), r;
			return n || (r = c(e)) && g(r, t);
		}
		var _ = [].slice;
		function v(e, t, n) {
			return _.call(e, t, n);
		}
		function y(e, t) {
			return t(e);
		}
		function b(e) {
			if (!e) throw Error("Assertion Failed");
		}
		function x(e) {
			i.setImmediate ? setImmediate(e) : setTimeout(e, 0);
		}
		function S(e, t) {
			return e.reduce(function(e, n, r) {
				var i = t(n, r);
				return i && (e[i[0]] = i[1]), e;
			}, {});
		}
		function C(e, t) {
			if (typeof t == "string" && u(e, t)) return e[t];
			if (!t) return e;
			if (typeof t != "string") {
				for (var n = [], r = 0, i = t.length; r < i; ++r) {
					var a = C(e, t[r]);
					n.push(a);
				}
				return n;
			}
			var o = t.indexOf(".");
			if (o !== -1) {
				var s = e[t.substr(0, o)];
				return s == null ? void 0 : C(s, t.substr(o + 1));
			}
		}
		function w(e, t, n) {
			if (e && t !== void 0 && !("isFrozen" in Object && Object.isFrozen(e))) {
				if (typeof t != "string" && "length" in t) {
					b(typeof n != "string" && "length" in n);
					for (var r = 0, i = t.length; r < i; ++r) w(e, t[r], n[r]);
				} else {
					var a = t.indexOf(".");
					if (a !== -1) {
						var s = t.substr(0, a), c = t.substr(a + 1);
						if (c === "") n === void 0 ? o(e) && !isNaN(parseInt(s)) ? e.splice(s, 1) : delete e[s] : e[s] = n;
						else {
							var l = e[s];
							if (!l || !u(e, s)) {
								if (n === void 0) return;
								l = e[s] = {};
							}
							w(l, c, n);
						}
					} else n === void 0 ? o(e) && !isNaN(parseInt(t)) ? e.splice(t, 1) : delete e[t] : e[t] = n;
				}
			}
		}
		function T(e, t) {
			typeof t == "string" ? w(e, t, void 0) : "length" in t && [].map.call(t, function(t) {
				w(e, t, void 0);
			});
		}
		function E(e) {
			var t = {};
			for (var n in e) u(e, n) && (t[n] = e[n]);
			return t;
		}
		var D = [].concat;
		function ee(e) {
			return D.apply([], e);
		}
		var O = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(ee([
			8,
			16,
			32,
			64
		].map(function(e) {
			return [
				"Int",
				"Uint",
				"Float"
			].map(function(t) {
				return t + e + "Array";
			});
		}))).filter(function(e) {
			return i[e];
		}), te = new Set(O.map(function(e) {
			return i[e];
		}));
		function ne(e) {
			var t = {};
			for (var n in e) if (u(e, n)) {
				var r = e[n];
				t[n] = !r || typeof r != "object" || te.has(r.constructor) ? r : ne(r);
			}
			return t;
		}
		var re = null;
		function ie(e) {
			re = /* @__PURE__ */ new WeakMap();
			var t = ae(e);
			return re = null, t;
		}
		function ae(e) {
			if (!e || typeof e != "object") return e;
			var t = re.get(e);
			if (t) return t;
			if (o(e)) {
				t = [], re.set(e, t);
				for (var n = 0, r = e.length; n < r; ++n) t.push(ae(e[n]));
			} else if (te.has(e.constructor)) t = e;
			else {
				var i = c(e);
				for (var a in t = i === Object.prototype ? {} : Object.create(i), re.set(e, t), e) u(e, a) && (t[a] = ae(e[a]));
			}
			return t;
		}
		var oe = {}.toString;
		function se(e) {
			return oe.call(e).slice(8, -1);
		}
		var ce = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", le = typeof ce == "symbol" ? function(e) {
			var t;
			return e != null && (t = e[ce]) && t.apply(e);
		} : function() {
			return null;
		};
		function k(e, t) {
			var n = e.indexOf(t);
			return n >= 0 && e.splice(n, 1), n >= 0;
		}
		var ue = {};
		function A(e) {
			var t, n, r, i;
			if (arguments.length === 1) {
				if (o(e)) return e.slice();
				if (this === ue && typeof e == "string") return [e];
				if (i = le(e)) {
					for (n = []; r = i.next(), !r.done;) n.push(r.value);
					return n;
				}
				if (e == null) return [e];
				if (t = e.length, typeof t == "number") {
					for (n = Array(t); t--;) n[t] = e[t];
					return n;
				}
				return [e];
			}
			for (t = arguments.length, n = Array(t); t--;) n[t] = arguments[t];
			return n;
		}
		var de = typeof Symbol < "u" ? function(e) {
			return e[Symbol.toStringTag] === "AsyncFunction";
		} : function() {
			return !1;
		}, fe = [
			"Modify",
			"Bulk",
			"OpenFailed",
			"VersionChange",
			"Schema",
			"Upgrade",
			"InvalidTable",
			"MissingAPI",
			"NoSuchDatabase",
			"InvalidArgument",
			"SubTransaction",
			"Unsupported",
			"Internal",
			"DatabaseClosed",
			"PrematureCommit",
			"ForeignAwait"
		], j = [
			"Unknown",
			"Constraint",
			"Data",
			"TransactionInactive",
			"ReadOnly",
			"Version",
			"NotFound",
			"InvalidState",
			"InvalidAccess",
			"Abort",
			"Timeout",
			"QuotaExceeded",
			"Syntax",
			"DataClone"
		], pe = fe.concat(j), me = {
			VersionChanged: "Database version changed by other database connection",
			DatabaseClosed: "Database has been closed",
			Abort: "Transaction aborted",
			TransactionInactive: "Transaction has already completed or failed",
			MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
		};
		function he(e, t) {
			this.name = e, this.message = t;
		}
		m(he).from(Error).extend({ toString: function() {
			return this.name + ": " + this.message;
		} });
		function ge(e, t) {
			return e + ". Errors: " + Object.keys(t).map(function(e) {
				return t[e].toString();
			}).filter(function(e, t, n) {
				return n.indexOf(e) === t;
			}).join("\n");
		}
		function _e(e, t, n, r) {
			this.failures = t, this.failedKeys = r, this.successCount = n, this.message = ge(e, t);
		}
		m(_e).from(he);
		function ve(e, t) {
			this.name = "BulkError", this.failures = Object.keys(t).map(function(e) {
				return t[e];
			}), this.failuresByPos = t, this.message = ge(e, this.failures);
		}
		m(ve).from(he);
		var ye = pe.reduce(function(e, t) {
			return e[t] = t + "Error", e;
		}, {}), be = he, M = pe.reduce(function(e, t) {
			var n = t + "Error";
			function r(e, r) {
				this.name = n, e ? typeof e == "string" ? (this.message = `${e}${r ? "\n " + r : ""}`, this.inner = r || null) : typeof e == "object" && (this.message = `${e.name} ${e.message}`, this.inner = e) : (this.message = me[t] || n, this.inner = null);
			}
			return m(r).from(be), e[t] = r, e;
		}, {});
		M.Syntax = SyntaxError, M.Type = TypeError, M.Range = RangeError;
		var xe = j.reduce(function(e, t) {
			return e[t + "Error"] = M[t], e;
		}, {});
		function Se(e, t) {
			if (!e || e instanceof he || e instanceof TypeError || e instanceof SyntaxError || !e.name || !xe[e.name]) return e;
			var n = new xe[e.name](t || e.message, e);
			return "stack" in e && p(n, "stack", { get: function() {
				return this.inner.stack;
			} }), n;
		}
		var Ce = pe.reduce(function(e, t) {
			return [
				"Syntax",
				"Type",
				"Range"
			].indexOf(t) === -1 && (e[t + "Error"] = M[t]), e;
		}, {});
		Ce.ModifyError = _e, Ce.DexieError = he, Ce.BulkError = ve;
		function N() {}
		function we(e) {
			return e;
		}
		function Te(e, t) {
			return e == null || e === we ? t : function(n) {
				return t(e(n));
			};
		}
		function Ee(e, t) {
			return function() {
				e.apply(this, arguments), t.apply(this, arguments);
			};
		}
		function De(e, t) {
			return e === N ? t : function() {
				var n = e.apply(this, arguments);
				n !== void 0 && (arguments[0] = n);
				var r = this.onsuccess, i = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var a = t.apply(this, arguments);
				return r && (this.onsuccess = this.onsuccess ? Ee(r, this.onsuccess) : r), i && (this.onerror = this.onerror ? Ee(i, this.onerror) : i), a === void 0 ? n : a;
			};
		}
		function Oe(e, t) {
			return e === N ? t : function() {
				e.apply(this, arguments);
				var n = this.onsuccess, r = this.onerror;
				this.onsuccess = this.onerror = null, t.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? Ee(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? Ee(r, this.onerror) : r);
			};
		}
		function ke(e, t) {
			return e === N ? t : function() {
				var n = e.apply(this, arguments), r = arguments[0];
				s(r, n);
				var i = this.onsuccess, a = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var o = t.apply(this, arguments);
				return i && (this.onsuccess = this.onsuccess ? Ee(i, this.onsuccess) : i), a && (this.onerror = this.onerror ? Ee(a, this.onerror) : a), n === void 0 ? o === void 0 ? void 0 : o : s(n, o);
			};
		}
		function Ae(e, t) {
			return e === N ? t : function() {
				return t.apply(this, arguments) !== !1 && e.apply(this, arguments);
			};
		}
		function je(e, t) {
			return e === N ? t : function() {
				var n = e.apply(this, arguments);
				if (n && typeof n.then == "function") {
					for (var r = this, i = arguments.length, a = Array(i); i--;) a[i] = arguments[i];
					return n.then(function() {
						return t.apply(r, a);
					});
				}
				return t.apply(this, arguments);
			};
		}
		var Me = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
		function Ne(e, t) {
			Me = e;
		}
		var Pe = {}, Fe = 100, Ie = typeof Promise > "u" ? [] : (function() {
			var e = Promise.resolve();
			if (typeof crypto > "u" || !crypto.subtle) return [
				e,
				c(e),
				e
			];
			var t = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
			return [
				t,
				c(t),
				e
			];
		})(), Le = Ie[0], Re = Ie[1], ze = Ie[2], Be = Re && Re.then, Ve = Le && Le.constructor, He = !!ze;
		function Ue() {
			queueMicrotask(ot);
		}
		var We = function(e, t) {
			F.push([e, t]), Ke &&= (Ue(), !1);
		}, Ge = !0, Ke = !0, qe = [], Je = [], Ye = we, Xe = {
			id: "global",
			global: !0,
			ref: 0,
			unhandleds: [],
			onunhandled: N,
			pgp: !1,
			env: {},
			finalize: N
		}, P = Xe, F = [], Ze = 0, Qe = [];
		function I(e) {
			if (typeof this != "object") throw TypeError("Promises must be constructed via new");
			this._listeners = [], this._lib = !1;
			var t = this._PSD = P;
			if (typeof e != "function") {
				if (e !== Pe) throw TypeError("Not a function");
				this._state = arguments[1], this._value = arguments[2], this._state === !1 && nt(this, this._value);
			} else this._state = null, this._value = null, ++t.ref, tt(this, e);
		}
		var $e = {
			get: function() {
				var e = P, t = yt;
				function n(n, r) {
					var i = this, a = !e.global && (e !== P || t !== yt), o = a && !Ct(), s = new I(function(t, s) {
						it(i, new et(At(n, e, a, o), At(r, e, a, o), t, s, e));
					});
					return this._consoleTask && (s._consoleTask = this._consoleTask), s;
				}
				return n.prototype = Pe, n;
			},
			set: function(e) {
				p(this, "then", e && e.prototype === Pe ? $e : {
					get: function() {
						return e;
					},
					set: $e.set
				});
			}
		};
		d(I.prototype, {
			then: $e,
			_then: function(e, t) {
				it(this, new et(null, null, e, t, P));
			},
			catch: function(e) {
				if (arguments.length === 1) return this.then(null, e);
				var t = arguments[0], n = arguments[1];
				return typeof t == "function" ? this.then(null, function(e) {
					return e instanceof t ? n(e) : pt(e);
				}) : this.then(null, function(e) {
					return e && e.name === t ? n(e) : pt(e);
				});
			},
			finally: function(e) {
				return this.then(function(t) {
					return I.resolve(e()).then(function() {
						return t;
					});
				}, function(t) {
					return I.resolve(e()).then(function() {
						return pt(t);
					});
				});
			},
			timeout: function(e, t) {
				var n = this;
				return e < Infinity ? new I(function(r, i) {
					var a = setTimeout(function() {
						return i(new M.Timeout(t));
					}, e);
					n.then(r, i).finally(clearTimeout.bind(null, a));
				}) : this;
			}
		}), typeof Symbol < "u" && Symbol.toStringTag && p(I.prototype, Symbol.toStringTag, "Dexie.Promise"), Xe.env = Ot();
		function et(e, t, n, r, i) {
			this.onFulfilled = typeof e == "function" ? e : null, this.onRejected = typeof t == "function" ? t : null, this.resolve = n, this.reject = r, this.psd = i;
		}
		d(I, {
			all: function() {
				var e = A.apply(null, arguments).map(wt);
				return new I(function(t, n) {
					e.length === 0 && t([]);
					var r = e.length;
					e.forEach(function(i, a) {
						return I.resolve(i).then(function(n) {
							e[a] = n, --r || t(e);
						}, n);
					});
				});
			},
			resolve: function(e) {
				return e instanceof I ? e : e && typeof e.then == "function" ? new I(function(t, n) {
					e.then(t, n);
				}) : new I(Pe, !0, e);
			},
			reject: pt,
			race: function() {
				var e = A.apply(null, arguments).map(wt);
				return new I(function(t, n) {
					e.map(function(e) {
						return I.resolve(e).then(t, n);
					});
				});
			},
			PSD: {
				get: function() {
					return P;
				},
				set: function(e) {
					return P = e;
				}
			},
			totalEchoes: { get: function() {
				return yt;
			} },
			newPSD: xt,
			usePSD: kt,
			scheduler: {
				get: function() {
					return We;
				},
				set: function(e) {
					We = e;
				}
			},
			rejectionMapper: {
				get: function() {
					return Ye;
				},
				set: function(e) {
					Ye = e;
				}
			},
			follow: function(e, t) {
				return new I(function(n, r) {
					return xt(function(t, n) {
						var r = P;
						r.unhandleds = [], r.onunhandled = n, r.finalize = Ee(function() {
							var e = this;
							ut(function() {
								e.unhandleds.length === 0 ? t() : n(e.unhandleds[0]);
							});
						}, r.finalize), e();
					}, t, n, r);
				});
			}
		}), Ve && (Ve.allSettled && p(I, "allSettled", function() {
			var e = A.apply(null, arguments).map(wt);
			return new I(function(t) {
				e.length === 0 && t([]);
				var n = e.length, r = Array(n);
				e.forEach(function(e, i) {
					return I.resolve(e).then(function(e) {
						return r[i] = {
							status: "fulfilled",
							value: e
						};
					}, function(e) {
						return r[i] = {
							status: "rejected",
							reason: e
						};
					}).then(function() {
						return --n || t(r);
					});
				});
			});
		}), Ve.any && typeof AggregateError < "u" && p(I, "any", function() {
			var e = A.apply(null, arguments).map(wt);
			return new I(function(t, n) {
				e.length === 0 && n(/* @__PURE__ */ AggregateError([]));
				var r = e.length, i = Array(r);
				e.forEach(function(e, a) {
					return I.resolve(e).then(function(e) {
						return t(e);
					}, function(e) {
						i[a] = e, --r || n(AggregateError(i));
					});
				});
			});
		}), Ve.withResolvers && (I.withResolvers = Ve.withResolvers));
		function tt(e, t) {
			try {
				t(function(t) {
					if (e._state === null) {
						if (t === e) throw TypeError("A promise cannot be resolved with itself.");
						var n = e._lib && st();
						t && typeof t.then == "function" ? tt(e, function(e, n) {
							t instanceof I ? t._then(e, n) : t.then(e, n);
						}) : (e._state = !0, e._value = t, rt(e)), n && ct();
					}
				}, nt.bind(null, e));
			} catch (t) {
				nt(e, t);
			}
		}
		function nt(e, t) {
			if (Je.push(t), e._state === null) {
				var n = e._lib && st();
				t = Ye(t), e._state = !1, e._value = t, dt(e), rt(e), n && ct();
			}
		}
		function rt(e) {
			var t = e._listeners;
			e._listeners = [];
			for (var n = 0, r = t.length; n < r; ++n) it(e, t[n]);
			var i = e._PSD;
			--i.ref || i.finalize(), Ze === 0 && (++Ze, We(function() {
				--Ze === 0 && lt();
			}, []));
		}
		function it(e, t) {
			if (e._state === null) e._listeners.push(t);
			else {
				var n = e._state ? t.onFulfilled : t.onRejected;
				if (n === null) return (e._state ? t.resolve : t.reject)(e._value);
				++t.psd.ref, ++Ze, We(at, [
					n,
					e,
					t
				]);
			}
		}
		function at(e, t, n) {
			try {
				var r, i = t._value;
				!t._state && Je.length && (Je = []), r = Me && t._consoleTask ? t._consoleTask.run(function() {
					return e(i);
				}) : e(i), !t._state && Je.indexOf(i) === -1 && ft(t), n.resolve(r);
			} catch (e) {
				n.reject(e);
			} finally {
				--Ze === 0 && lt(), --n.psd.ref || n.psd.finalize();
			}
		}
		function ot() {
			kt(Xe, function() {
				st() && ct();
			});
		}
		function st() {
			var e = Ge;
			return Ge = !1, Ke = !1, e;
		}
		function ct() {
			var e, t, n;
			do
				for (; F.length > 0;) for (e = F, F = [], n = e.length, t = 0; t < n; ++t) {
					var r = e[t];
					r[0].apply(null, r[1]);
				}
			while (F.length > 0);
			Ge = !0, Ke = !0;
		}
		function lt() {
			var e = qe;
			qe = [], e.forEach(function(e) {
				e._PSD.onunhandled.call(null, e._value, e);
			});
			for (var t = Qe.slice(0), n = t.length; n;) t[--n]();
		}
		function ut(e) {
			function t() {
				e(), Qe.splice(Qe.indexOf(t), 1);
			}
			Qe.push(t), ++Ze, We(function() {
				--Ze === 0 && lt();
			}, []);
		}
		function dt(e) {
			qe.some(function(t) {
				return t._value === e._value;
			}) || qe.push(e);
		}
		function ft(e) {
			for (var t = qe.length; t;) if (qe[--t]._value === e._value) {
				qe.splice(t, 1);
				return;
			}
		}
		function pt(e) {
			return new I(Pe, !1, e);
		}
		function mt(e, t) {
			var n = P;
			return function() {
				var r = st(), i = P;
				try {
					return Dt(n, !0), e.apply(this, arguments);
				} catch (e) {
					t && t(e);
				} finally {
					Dt(i, !1), r && ct();
				}
			};
		}
		var ht = {
			awaits: 0,
			echoes: 0,
			id: 0
		}, gt = 0, _t = [], vt = 0, yt = 0, bt = 0;
		function xt(e, t, n, r) {
			var i = P, a = Object.create(i);
			a.parent = i, a.ref = 0, a.global = !1, a.id = ++bt, Xe.env, a.env = He ? {
				Promise: I,
				PromiseProp: {
					value: I,
					configurable: !0,
					writable: !0
				},
				all: I.all,
				race: I.race,
				allSettled: I.allSettled,
				any: I.any,
				resolve: I.resolve,
				reject: I.reject
			} : {}, t && s(a, t), ++i.ref, a.finalize = function() {
				--this.parent.ref || this.parent.finalize();
			};
			var o = kt(a, e, n, r);
			return a.ref === 0 && a.finalize(), o;
		}
		function St() {
			return ht.id ||= ++gt, ++ht.awaits, ht.echoes += Fe, ht.id;
		}
		function Ct() {
			return ht.awaits ? (--ht.awaits === 0 && (ht.id = 0), ht.echoes = ht.awaits * Fe, !0) : !1;
		}
		("" + Be).indexOf("[native code]") === -1 && (St = Ct = N);
		function wt(e) {
			return ht.echoes && e && e.constructor === Ve ? (St(), e.then(function(e) {
				return Ct(), e;
			}, function(e) {
				return Ct(), Mt(e);
			})) : e;
		}
		function Tt(e) {
			++yt, ht.echoes && --ht.echoes !== 0 || (ht.echoes = ht.awaits = ht.id = 0), _t.push(P), Dt(e, !0);
		}
		function Et() {
			var e = _t[_t.length - 1];
			_t.pop(), Dt(e, !1);
		}
		function Dt(e, t) {
			var n = P;
			if ((t ? ht.echoes && (!vt++ || e !== P) : vt && (!--vt || e !== P)) && queueMicrotask(t ? Tt.bind(null, e) : Et), e !== P && (P = e, n === Xe && (Xe.env = Ot()), He)) {
				var r = Xe.env.Promise, a = e.env;
				(n.global || e.global) && (Object.defineProperty(i, "Promise", a.PromiseProp), r.all = a.all, r.race = a.race, r.resolve = a.resolve, r.reject = a.reject, a.allSettled && (r.allSettled = a.allSettled), a.any && (r.any = a.any));
			}
		}
		function Ot() {
			var e = i.Promise;
			return He ? {
				Promise: e,
				PromiseProp: Object.getOwnPropertyDescriptor(i, "Promise"),
				all: e.all,
				race: e.race,
				allSettled: e.allSettled,
				any: e.any,
				resolve: e.resolve,
				reject: e.reject
			} : {};
		}
		function kt(e, t, n, r, i) {
			var a = P;
			try {
				return Dt(e, !0), t(n, r, i);
			} finally {
				Dt(a, !1);
			}
		}
		function At(e, t, n, r) {
			return typeof e == "function" ? function() {
				var i = P;
				n && St(), Dt(t, !0);
				try {
					return e.apply(this, arguments);
				} finally {
					Dt(i, !1), r && queueMicrotask(Ct);
				}
			} : e;
		}
		function jt(e) {
			Promise === Ve && ht.echoes === 0 ? vt === 0 ? e() : enqueueNativeMicroTask(e) : setTimeout(e, 0);
		}
		var Mt = I.reject;
		function Nt(e, t, n, r) {
			if (!e.idbdb || !e._state.openComplete && !P.letThrough && !e._vip) {
				if (e._state.openComplete) return Mt(new M.DatabaseClosed(e._state.dbOpenError));
				if (!e._state.isBeingOpened) {
					if (!e._state.autoOpen) return Mt(new M.DatabaseClosed());
					e.open().catch(N);
				}
				return e._state.dbReadyPromise.then(function() {
					return Nt(e, t, n, r);
				});
			}
			var i = e._createTransaction(t, n, e._dbSchema);
			try {
				i.create(), e._state.PR1398_maxLoop = 3;
			} catch (i) {
				return i.name === ye.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
					return Nt(e, t, n, r);
				})) : Mt(i);
			}
			return i._promise(t, function(e, t) {
				return xt(function() {
					return P.trans = i, r(e, t, i);
				});
			}).then(function(e) {
				if (t === "readwrite") try {
					i.idbtrans.commit();
				} catch {}
				return t === "readonly" ? e : i._completion.then(function() {
					return e;
				});
			});
		}
		var Pt = "4.4.7", Ft = "￿", It = -Infinity, Lt = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", Rt = "String expected.", zt = 1e3, Bt = "__dbnames", Vt = "readonly", Ht = "readwrite";
		function Ut(e, t) {
			return e ? t ? function() {
				return e.apply(this, arguments) && t.apply(this, arguments);
			} : e : t;
		}
		var Wt = {
			type: 3,
			lower: -Infinity,
			lowerOpen: !1,
			upper: [[]],
			upperOpen: !1
		};
		function Gt(e) {
			return typeof e == "string" && !/\./.test(e) ? function(t) {
				return t[e] === void 0 && e in t && (t = ie(t), delete t[e]), t;
			} : function(e) {
				return e;
			};
		}
		function Kt() {
			throw M.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
		}
		function qt(e, t) {
			try {
				var n = Xt(e), r = Xt(t);
				if (n !== r) return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r === "Date" ? -1 : NaN;
				switch (n) {
					case "number":
					case "Date":
					case "string": return e > t ? 1 : e < t ? -1 : 0;
					case "binary": return Yt(Zt(e), Zt(t));
					case "Array": return Jt(e, t);
				}
			} catch {}
			return NaN;
		}
		function Jt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) {
				var o = qt(e[a], t[a]);
				if (o !== 0) return o;
			}
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function Yt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) if (e[a] !== t[a]) return e[a] < t[a] ? -1 : 1;
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function Xt(e) {
			var t = typeof e;
			if (t !== "object") return t;
			if (ArrayBuffer.isView(e)) return "binary";
			var n = se(e);
			return n === "ArrayBuffer" ? "binary" : n;
		}
		function Zt(e) {
			return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : new Uint8Array(e);
		}
		function Qt(e, t, n) {
			var r = e.schema.yProps;
			return r ? (t && n.numFailures > 0 && (t = t.filter(function(e, t) {
				return !n.failures[t];
			})), Promise.all(r.map(function(n) {
				var r = n.updatesTable;
				return t ? e.db.table(r).where("k").anyOf(t).delete() : e.db.table(r).clear();
			})).then(function() {
				return n;
			})) : n;
		}
		var $t = function() {
			function e(e) {
				this["@@propmod"] = e;
			}
			return e.prototype.execute = function(e) {
				var t = this["@@propmod"];
				if (t.add !== void 0) {
					var n = t.add;
					if (o(n)) return r(r([], o(e) ? e : [], !0), n, !0).sort();
					if (typeof n == "number") return (Number(e) || 0) + n;
					if (typeof n == "bigint") try {
						return BigInt(e) + n;
					} catch {
						return BigInt(0) + n;
					}
					throw TypeError(`Invalid term ${n}`);
				}
				if (t.remove !== void 0) {
					var i = t.remove;
					if (o(i)) return o(e) ? e.filter(function(e) {
						return !i.includes(e);
					}).sort() : [];
					if (typeof i == "number") return Number(e) - i;
					if (typeof i == "bigint") try {
						return BigInt(e) - i;
					} catch {
						return BigInt(0) - i;
					}
					throw TypeError(`Invalid subtrahend ${i}`);
				}
				var a = t.replacePrefix?.[0];
				return a && typeof e == "string" && e.startsWith(a) ? t.replacePrefix[1] + e.substring(a.length) : e;
			}, e;
		}();
		function en(e, t) {
			for (var n = a(t), r = n.length, i = !1, o = 0; o < r; ++o) {
				var s = n[o], c = t[s], l = C(e, s);
				c instanceof $t ? (w(e, s, c.execute(l)), i = !0) : l !== c && (w(e, s, c), i = !0);
			}
			return i;
		}
		var tn = function() {
			function e() {}
			return e.prototype._trans = function(e, t, n) {
				var r = this._tx || P.trans, i = this.name, a = Me && typeof console < "u" && console.createTask && console.createTask(`Dexie: ${e === "readonly" ? "read" : "write"} ${this.name}`);
				function o(e, n, r) {
					if (!r.schema[i]) throw new M.NotFound("Table " + i + " not part of transaction");
					return t(r.idbtrans, r);
				}
				var s = st();
				try {
					var c = r && r.db._novip === this.db._novip ? r === P.trans ? r._promise(e, o, n) : xt(function() {
						return r._promise(e, o, n);
					}, {
						trans: r,
						transless: P.transless || P
					}) : Nt(this.db, e, [this.name], o);
					return a && (c._consoleTask = a, c = c.catch(function(e) {
						return console.trace(e), Mt(e);
					})), c;
				} finally {
					s && ct();
				}
			}, e.prototype.get = function(e, t) {
				var n = this;
				return e && e.constructor === Object ? this.where(e).first(t) : e == null ? Mt(new M.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(t) {
					return n.core.get({
						trans: t,
						key: e
					}).then(function(e) {
						return n.hook.reading.fire(e);
					});
				}).then(t);
			}, e.prototype.where = function(e) {
				if (typeof e == "string") return new this.db.WhereClause(this, e);
				if (o(e)) return new this.db.WhereClause(this, `[${e.join("+")}]`);
				var t = a(e);
				if (t.length === 1) return this.where(t[0]).equals(e[t[0]]);
				var n = this.schema.indexes.concat(this.schema.primKey).filter(function(e) {
					if (e.compound && t.every(function(t) {
						return e.keyPath.indexOf(t) >= 0;
					})) {
						for (var n = 0; n < t.length; ++n) if (t.indexOf(e.keyPath[n]) === -1) return !1;
						return !0;
					}
					return !1;
				}).sort(function(e, t) {
					return e.keyPath.length - t.keyPath.length;
				})[0];
				if (n && this.db._maxKey !== Ft) {
					var r = n.keyPath.slice(0, t.length);
					return this.where(r).equals(r.map(function(t) {
						return e[t];
					}));
				}
				!n && Me && console.warn(`The query ${JSON.stringify(e)} on ${this.name} would benefit from a compound index [${t.join("+")}]`);
				var i = this.schema.idxByName;
				function s(e, t) {
					return qt(e, t) === 0;
				}
				var c = t.reduce(function(t, n) {
					var r = t[0], a = t[1], c = i[n], l = e[n];
					return [r || c, r || !c ? Ut(a, c && c.multi ? function(e) {
						var t = C(e, n);
						return o(t) && t.some(function(e) {
							return s(l, e);
						});
					} : function(e) {
						return s(l, C(e, n));
					}) : a];
				}, [null, null]), l = c[0], u = c[1];
				return l ? this.where(l.name).equals(e[l.keyPath]).filter(u) : n ? this.filter(u) : this.where(t).equals("");
			}, e.prototype.filter = function(e) {
				return this.toCollection().and(e);
			}, e.prototype.count = function(e) {
				return this.toCollection().count(e);
			}, e.prototype.offset = function(e) {
				return this.toCollection().offset(e);
			}, e.prototype.limit = function(e) {
				return this.toCollection().limit(e);
			}, e.prototype.each = function(e) {
				return this.toCollection().each(e);
			}, e.prototype.toArray = function(e) {
				return this.toCollection().toArray(e);
			}, e.prototype.toCollection = function() {
				return new this.db.Collection(new this.db.WhereClause(this));
			}, e.prototype.orderBy = function(e) {
				return new this.db.Collection(new this.db.WhereClause(this, o(e) ? `[${e.join("+")}]` : e));
			}, e.prototype.reverse = function() {
				return this.toCollection().reverse();
			}, e.prototype.mapToClass = function(e) {
				var n = this, r = n.db, i = n.name;
				this.schema.mappedClass = e, e.prototype instanceof Kt && (e = function(e) {
					t(n, e);
					function n() {
						return e !== null && e.apply(this, arguments) || this;
					}
					return Object.defineProperty(n.prototype, "db", {
						get: function() {
							return r;
						},
						enumerable: !1,
						configurable: !0
					}), n.prototype.table = function() {
						return i;
					}, n;
				}(e));
				for (var a = /* @__PURE__ */ new Set(), o = e.prototype; o; o = c(o)) Object.getOwnPropertyNames(o).forEach(function(e) {
					return a.add(e);
				});
				var s = function(t) {
					if (!t) return t;
					var n = Object.create(e.prototype);
					for (var r in t) if (!a.has(r)) try {
						n[r] = t[r];
					} catch {}
					return n;
				};
				return this.schema.readHook && this.hook.reading.unsubscribe(this.schema.readHook), this.schema.readHook = s, this.hook("reading", s), e;
			}, e.prototype.defineClass = function() {
				function e(e) {
					s(this, e);
				}
				return this.mapToClass(e);
			}, e.prototype.add = function(e, t) {
				var n = this, r = this.schema.primKey, i = r.auto, a = r.keyPath, o = e;
				return a && i && (o = Gt(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "add",
						keys: t == null ? null : [t],
						values: [o]
					});
				}).then(function(e) {
					return e.numFailures ? I.reject(e.failures[0]) : e.lastResult;
				}).then(function(t) {
					if (a) try {
						w(e, a, t);
					} catch {}
					return t;
				});
			}, e.prototype.upsert = function(e, t) {
				var n = this, r = this.schema.primKey.keyPath;
				return this._trans("readwrite", function(i) {
					return n.core.get({
						trans: i,
						key: e
					}).then(function(a) {
						var o = a ?? {};
						return en(o, t), r && w(o, r, e), n.core.mutate({
							trans: i,
							type: "put",
							values: [o],
							keys: [e],
							upsert: !0,
							updates: {
								keys: [e],
								changeSpecs: [t]
							}
						}).then(function(e) {
							return e.numFailures ? I.reject(e.failures[0]) : !!a;
						});
					});
				});
			}, e.prototype.update = function(e, t) {
				if (typeof e == "object" && !o(e)) {
					var n = C(e, this.schema.primKey.keyPath);
					return n === void 0 ? Mt(new M.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(n).modify(t);
				}
				return this.where(":id").equals(e).modify(t);
			}, e.prototype.put = function(e, t) {
				var n = this, r = this.schema.primKey, i = r.auto, a = r.keyPath, o = e;
				return a && i && (o = Gt(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "put",
						values: [o],
						keys: t == null ? null : [t]
					});
				}).then(function(e) {
					return e.numFailures ? I.reject(e.failures[0]) : e.lastResult;
				}).then(function(t) {
					if (a) try {
						w(e, a, t);
					} catch {}
					return t;
				});
			}, e.prototype.delete = function(e) {
				var t = this;
				return this._trans("readwrite", function(n) {
					return t.core.mutate({
						trans: n,
						type: "delete",
						keys: [e]
					}).then(function(n) {
						return Qt(t, [e], n);
					}).then(function(e) {
						return e.numFailures ? I.reject(e.failures[0]) : void 0;
					});
				});
			}, e.prototype.clear = function() {
				var e = this;
				return this._trans("readwrite", function(t) {
					return e.core.mutate({
						trans: t,
						type: "deleteRange",
						range: Wt
					}).then(function(t) {
						return Qt(e, null, t);
					});
				}).then(function(e) {
					return e.numFailures ? I.reject(e.failures[0]) : void 0;
				});
			}, e.prototype.bulkGet = function(e) {
				var t = this;
				return this._trans("readonly", function(n) {
					return t.core.getMany({
						keys: e,
						trans: n
					}).then(function(e) {
						return e.map(function(e) {
							return t.hook.reading.fire(e);
						});
					});
				});
			}, e.prototype.bulkAdd = function(e, t, n) {
				var r = this, i = Array.isArray(t) ? t : void 0;
				n ||= i ? void 0 : t;
				var a = n ? n.allKeys : void 0;
				return this._trans("readwrite", function(t) {
					var n = r.schema.primKey, o = n.auto, s = n.keyPath;
					if (s && i) throw new M.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new M.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(Gt(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "add",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new ve(`${r.name}.bulkAdd(): ${t} of ${c} operations failed`, o);
					});
				});
			}, e.prototype.bulkPut = function(e, t, n) {
				var r = this, i = Array.isArray(t) ? t : void 0;
				n ||= i ? void 0 : t;
				var a = n ? n.allKeys : void 0;
				return this._trans("readwrite", function(t) {
					var n = r.schema.primKey, o = n.auto, s = n.keyPath;
					if (s && i) throw new M.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new M.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(Gt(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "put",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new ve(`${r.name}.bulkPut(): ${t} of ${c} operations failed`, o);
					});
				});
			}, e.prototype.bulkUpdate = function(e) {
				var t = this, n = e.map(function(e) {
					return e.key;
				}), r = e.map(function(e) {
					return e.changes;
				}), i = [];
				return this._trans("readwrite", function(a) {
					var o = t.core;
					return o.getMany({
						trans: a,
						keys: n,
						cache: "clone"
					}).then(function(s) {
						var c = o.schema.primaryKey, l = c.outbound, u = c.extractKey, d = [], f = [];
						e.forEach(function(e, t) {
							var n = e.key, r = e.changes, a = s[t];
							if (a) {
								for (var o = 0, c = Object.keys(r); o < c.length; o++) {
									var p = c[o];
									w(a, p, r[p]);
								}
								if (!l && qt(u(a), n) !== 0) throw new M.Constraint("Cannot update primary key in bulkUpdate()");
								i.push(t), d.push(n), f.push(a);
							}
						});
						var p = d.length;
						return o.mutate({
							trans: a,
							type: "put",
							keys: d,
							values: f,
							updates: {
								keys: n,
								changeSpecs: r
							}
						}).then(function(e) {
							var n = e.numFailures, r = e.failures;
							if (n === 0) return p;
							for (var a = 0, o = Object.keys(r); a < o.length; a++) {
								var s = o[a], c = i[Number(s)];
								if (c != null) {
									var l = r[s];
									delete r[s], r[c] = l;
								}
							}
							throw new ve(`${t.name}.bulkUpdate(): ${n} of ${p} operations failed`, r);
						});
					});
				});
			}, e.prototype.bulkDelete = function(e) {
				var t = this, n = e.length;
				return this._trans("readwrite", function(n) {
					return t.core.mutate({
						trans: n,
						type: "delete",
						keys: e
					}).then(function(n) {
						return Qt(t, e, n);
					});
				}).then(function(e) {
					var r = e.numFailures, i = e.lastResult, a = e.failures;
					if (r === 0) return i;
					throw new ve(`${t.name}.bulkDelete(): ${r} of ${n} operations failed`, a);
				});
			}, e;
		}();
		function nn(e) {
			var t = {}, n = function(n, r) {
				if (r) {
					for (var i = arguments.length, a = Array(i - 1); --i;) a[i - 1] = arguments[i];
					return t[n].subscribe.apply(null, a), e;
				}
				if (typeof n == "string") return t[n];
			};
			n.addEventType = s;
			for (var r = 1, i = arguments.length; r < i; ++r) s(arguments[r]);
			return n;
			function s(e, r, i) {
				if (typeof e == "object") return c(e);
				r ||= Ae, i ||= N;
				var a = {
					subscribers: [],
					fire: i,
					subscribe: function(e) {
						a.subscribers.indexOf(e) === -1 && (a.subscribers.push(e), a.fire = r(a.fire, e));
					},
					unsubscribe: function(e) {
						a.subscribers = a.subscribers.filter(function(t) {
							return t !== e;
						}), a.fire = a.subscribers.reduce(r, i);
					}
				};
				return t[e] = n[e] = a, a;
			}
			function c(e) {
				a(e).forEach(function(t) {
					var n = e[t];
					if (o(n)) s(t, e[t][0], e[t][1]);
					else if (n === "asap") var r = s(t, we, function() {
						for (var e = arguments.length, t = Array(e); e--;) t[e] = arguments[e];
						r.subscribers.forEach(function(e) {
							x(function() {
								e.apply(null, t);
							});
						});
					});
					else throw new M.InvalidArgument("Invalid event config");
				});
			}
		}
		function rn(e, t) {
			return m(t).from({ prototype: e }), t;
		}
		function an(e) {
			return rn(tn.prototype, function(t, n, r) {
				this.db = e, this._tx = r, this.name = t, this.schema = n, this.hook = e._allTables[t] ? e._allTables[t].hook : nn(null, {
					creating: [De, N],
					reading: [Te, we],
					updating: [ke, N],
					deleting: [Oe, N]
				});
			});
		}
		function on(e, t) {
			return !(e.filter || e.algorithm || e.or) && (t ? e.justLimit : !e.replayFilter);
		}
		function sn(e, t) {
			e.filter = Ut(e.filter, t);
		}
		function cn(e, t, n) {
			var r = e.replayFilter;
			e.replayFilter = r ? function() {
				return Ut(r(), t());
			} : t, e.justLimit = n && !r;
		}
		function ln(e, t) {
			e.isMatch = Ut(e.isMatch, t);
		}
		function un(e, t) {
			if (e.isPrimKey) return t.primaryKey;
			var n = t.getIndexByKeyPath(e.index);
			if (!n) throw new M.Schema("KeyPath " + e.index + " on object store " + t.name + " is not indexed");
			return n;
		}
		function dn(e, t, n) {
			var r = un(e, t.schema);
			return t.openCursor({
				trans: n,
				values: !e.keysOnly,
				reverse: e.dir === "prev",
				unique: !!e.unique,
				query: {
					index: r,
					range: e.range
				}
			});
		}
		function fn(e, t, n, r) {
			var i = e.replayFilter ? Ut(e.filter, e.replayFilter()) : e.filter;
			if (e.or) {
				var a = {}, o = function(e, n, r) {
					if (!i || i(n, r, function(e) {
						return n.stop(e);
					}, function(e) {
						return n.fail(e);
					})) {
						var o = n.primaryKey, s = "" + o;
						s === "[object ArrayBuffer]" && (s = "" + new Uint8Array(o)), u(a, s) || (a[s] = !0, t(e, n, r));
					}
				};
				return Promise.all([e.or._iterate(o, n), pn(dn(e, r, n), e.algorithm, o, !e.keysOnly && e.valueMapper)]);
			}
			return pn(dn(e, r, n), Ut(e.algorithm, i), t, !e.keysOnly && e.valueMapper);
		}
		function pn(e, t, n, r) {
			var i = mt(r ? function(e, t, i) {
				return n(r(e), t, i);
			} : n);
			return e.then(function(e) {
				if (e) return e.start(function() {
					var n = function() {
						return e.continue();
					};
					(!t || t(e, function(e) {
						return n = e;
					}, function(t) {
						e.stop(t), n = N;
					}, function(t) {
						e.fail(t), n = N;
					})) && i(e.value, e, function(e) {
						return n = e;
					}), n();
				});
			});
		}
		var mn = function() {
			function e() {}
			return e.prototype._read = function(e, t) {
				var n = this._ctx;
				return n.error ? n.table._trans(null, Mt.bind(null, n.error)) : n.table._trans("readonly", e).then(t);
			}, e.prototype._write = function(e) {
				var t = this._ctx;
				return t.error ? t.table._trans(null, Mt.bind(null, t.error)) : t.table._trans("readwrite", e, "locked");
			}, e.prototype._addAlgorithm = function(e) {
				var t = this._ctx;
				t.algorithm = Ut(t.algorithm, e);
			}, e.prototype._iterate = function(e, t) {
				return fn(this._ctx, e, t, this._ctx.table.core);
			}, e.prototype.clone = function(e) {
				var t = Object.create(this.constructor.prototype), n = Object.create(this._ctx);
				return e && s(n, e), t._ctx = n, t;
			}, e.prototype.raw = function() {
				return this._ctx.valueMapper = null, this;
			}, e.prototype.each = function(e) {
				var t = this._ctx;
				return this._read(function(n) {
					return fn(t, e, n, t.table.core);
				});
			}, e.prototype.count = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx, r = n.table.core;
					if (on(n, !0)) return r.count({
						trans: e,
						query: {
							index: un(n, r.schema),
							range: n.range
						}
					}).then(function(e) {
						return Math.min(e, n.limit);
					});
					var i = 0;
					return fn(n, function() {
						return ++i, !1;
					}, e, r).then(function() {
						return i;
					});
				}).then(e);
			}, e.prototype.sortBy = function(e, t) {
				var n = e.split(".").reverse(), r = n[0], i = n.length - 1;
				function a(e, t) {
					return t ? a(e[n[t]], t - 1) : e[r];
				}
				var o = this._ctx.dir === "next" ? 1 : -1;
				function s(e, t) {
					return qt(a(e, i), a(t, i)) * o;
				}
				return this.toArray(function(e) {
					return e.slice().sort(s);
				}).then(t);
			}, e.prototype.toArray = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx;
					if (on(n, !0) && n.limit > 0) {
						var r = n.valueMapper, i = un(n, n.table.core.schema);
						return n.table.core.query({
							trans: e,
							limit: n.limit,
							values: !0,
							direction: n.dir === "prev" ? "prev" : void 0,
							query: {
								index: i,
								range: n.range
							}
						}).then(function(e) {
							var t = e.result;
							return r ? t.map(r) : t;
						});
					}
					var a = [];
					return fn(n, function(e) {
						return a.push(e);
					}, e, n.table.core).then(function() {
						return a;
					});
				}, e);
			}, e.prototype.offset = function(e) {
				var t = this._ctx;
				return e <= 0 || (t.offset += e, on(t) ? cn(t, function() {
					var t = e;
					return function(e, n) {
						return t === 0 ? !0 : t === 1 ? (--t, !1) : (n(function() {
							e.advance(t), t = 0;
						}), !1);
					};
				}) : cn(t, function() {
					var t = e;
					return function() {
						return --t < 0;
					};
				})), this;
			}, e.prototype.limit = function(e) {
				return this._ctx.limit = Math.min(this._ctx.limit, e), cn(this._ctx, function() {
					var t = e;
					return function(e, n, r) {
						return --t <= 0 && n(r), t >= 0;
					};
				}, !0), this;
			}, e.prototype.until = function(e, t) {
				return sn(this._ctx, function(n, r, i) {
					return !e(n.value) || (r(i), t);
				}), this;
			}, e.prototype.first = function(e) {
				return this.limit(1).toArray(function(e) {
					return e[0];
				}).then(e);
			}, e.prototype.last = function(e) {
				return this.reverse().first(e);
			}, e.prototype.filter = function(e) {
				return sn(this._ctx, function(t) {
					return e(t.value);
				}), ln(this._ctx, e), this;
			}, e.prototype.and = function(e) {
				return this.filter(e);
			}, e.prototype.or = function(e) {
				return new this.db.WhereClause(this._ctx.table, e, this);
			}, e.prototype.reverse = function() {
				return this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev", this._ondirectionchange && this._ondirectionchange(this._ctx.dir), this;
			}, e.prototype.desc = function() {
				return this.reverse();
			}, e.prototype.eachKey = function(e) {
				var t = this._ctx;
				return t.keysOnly = !t.isMatch, this.each(function(t, n) {
					e(n.key, n);
				});
			}, e.prototype.eachUniqueKey = function(e) {
				return this._ctx.unique = "unique", this.eachKey(e);
			}, e.prototype.eachPrimaryKey = function(e) {
				var t = this._ctx;
				return t.keysOnly = !t.isMatch, this.each(function(t, n) {
					e(n.primaryKey, n);
				});
			}, e.prototype.keys = function(e) {
				var t = this._ctx;
				t.keysOnly = !t.isMatch;
				var n = [];
				return this.each(function(e, t) {
					n.push(t.key);
				}).then(function() {
					return n;
				}).then(e);
			}, e.prototype.primaryKeys = function(e) {
				var t = this._ctx;
				if (on(t, !0) && t.limit > 0) return this._read(function(e) {
					var n = un(t, t.table.core.schema);
					return t.table.core.query({
						trans: e,
						values: !1,
						limit: t.limit,
						direction: t.dir === "prev" ? "prev" : void 0,
						query: {
							index: n,
							range: t.range
						}
					});
				}).then(function(e) {
					return e.result;
				}).then(e);
				t.keysOnly = !t.isMatch;
				var n = [];
				return this.each(function(e, t) {
					n.push(t.primaryKey);
				}).then(function() {
					return n;
				}).then(e);
			}, e.prototype.uniqueKeys = function(e) {
				return this._ctx.unique = "unique", this.keys(e);
			}, e.prototype.firstKey = function(e) {
				return this.limit(1).keys(function(e) {
					return e[0];
				}).then(e);
			}, e.prototype.lastKey = function(e) {
				return this.reverse().firstKey(e);
			}, e.prototype.distinct = function() {
				var e = this._ctx, t = e.index && e.table.schema.idxByName[e.index];
				if (!t || !t.multi) return this;
				var n = {};
				return sn(this._ctx, function(e) {
					var t = e.primaryKey.toString(), r = u(n, t);
					return n[t] = !0, !r;
				}), this;
			}, e.prototype.modify = function(e) {
				var t = this, n = this._ctx;
				return this._write(function(r) {
					var i = typeof e == "function" ? e : function(t) {
						return en(t, e);
					}, o = n.table.core, s = o.schema.primaryKey, c = s.outbound, l = s.extractKey, u = 200, d = t.db._options.modifyChunkSize;
					d && (u = typeof d == "object" ? d[o.name] || d["*"] || 200 : d);
					var f = [], p = 0, m = [], h = function(e, t) {
						var n = t.failures, r = t.numFailures;
						p += e - r;
						for (var i = 0, o = a(n); i < o.length; i++) {
							var s = o[i];
							f.push(n[s]);
						}
					}, g = e === hn;
					return t.clone().primaryKeys().then(function(t) {
						var a = on(n) && n.limit === Infinity && (typeof e != "function" || g) && {
							index: n.index,
							range: n.range
						}, s = function(d) {
							var f = Math.min(u, t.length - d), p = t.slice(d, d + f);
							return (g ? Promise.resolve([]) : o.getMany({
								trans: r,
								keys: p,
								cache: "immutable"
							})).then(function(m) {
								var _ = [], v = [], y = c ? [] : null, b = g ? p : [];
								if (!g) for (var x = 0; x < f; ++x) {
									var S = m[x], C = {
										value: ie(S),
										primKey: t[d + x]
									};
									i.call(C, C.value, C) !== !1 && (C.value == null ? b.push(t[d + x]) : !c && qt(l(S), l(C.value)) !== 0 ? (b.push(t[d + x]), _.push(C.value)) : (v.push(C.value), c && y.push(t[d + x])));
								}
								return Promise.resolve(_.length > 0 && o.mutate({
									trans: r,
									type: "add",
									values: _
								}).then(function(e) {
									for (var t in e.failures) b.splice(parseInt(t), 1);
									h(_.length, e);
								})).then(function() {
									return (v.length > 0 || a && typeof e == "object") && o.mutate({
										trans: r,
										type: "put",
										keys: y,
										values: v,
										criteria: a,
										changeSpec: typeof e != "function" && e,
										isAdditionalChunk: d > 0
									}).then(function(e) {
										return h(v.length, e);
									});
								}).then(function() {
									return (b.length > 0 || a && g) && o.mutate({
										trans: r,
										type: "delete",
										keys: b,
										criteria: a,
										isAdditionalChunk: d > 0
									}).then(function(e) {
										return Qt(n.table, b, e);
									}).then(function(e) {
										return h(b.length, e);
									});
								}).then(function() {
									return t.length > d + f && s(d + u);
								});
							});
						};
						return s(0).then(function() {
							if (f.length > 0) throw new _e("Error modifying one or more objects", f, p, m);
							return t.length;
						});
					});
				});
			}, e.prototype.delete = function() {
				var e = this._ctx, t = e.range;
				return on(e) && !e.table.schema.yProps && (e.isPrimKey || t.type === 3) ? this._write(function(n) {
					var r = e.table.core.schema.primaryKey, i = t;
					return e.table.core.count({
						trans: n,
						query: {
							index: r,
							range: i
						}
					}).then(function(t) {
						return e.table.core.mutate({
							trans: n,
							type: "deleteRange",
							range: i
						}).then(function(e) {
							var n = e.failures, r = e.numFailures;
							if (r) throw new _e("Could not delete some values", Object.keys(n).map(function(e) {
								return n[e];
							}), t - r);
							return t - r;
						});
					});
				}) : this.modify(hn);
			}, e;
		}(), hn = function(e, t) {
			return t.value = null;
		};
		function gn(e) {
			return rn(mn.prototype, function(t, n) {
				this.db = e;
				var r = Wt, i = null;
				if (n) try {
					r = n();
				} catch (e) {
					i = e;
				}
				var a = t._ctx, o = a.table, s = o.hook.reading.fire;
				this._ctx = {
					table: o,
					index: a.index,
					isPrimKey: !a.index || o.schema.primKey.keyPath && a.index === o.schema.primKey.name,
					range: r,
					keysOnly: !1,
					dir: "next",
					unique: "",
					algorithm: null,
					filter: null,
					replayFilter: null,
					justLimit: !0,
					isMatch: null,
					offset: 0,
					limit: Infinity,
					error: i,
					or: a.or,
					valueMapper: s === we ? null : s
				};
			});
		}
		function _n(e, t) {
			return e < t ? -1 : e === t ? 0 : 1;
		}
		function vn(e, t) {
			return e > t ? -1 : e === t ? 0 : 1;
		}
		function yn(e, t, n) {
			var r = e instanceof Dn ? new e.Collection(e) : e;
			return r._ctx.error = n ? new n(t) : TypeError(t), r;
		}
		function bn(e) {
			var t = new e.Collection(e, function() {
				return En("");
			});
			return t._addAlgorithm(function() {
				return !1;
			}), t;
		}
		function xn(e) {
			return e === "next" ? function(e) {
				return e.toUpperCase();
			} : function(e) {
				return e.toLowerCase();
			};
		}
		function Sn(e) {
			return e === "next" ? function(e) {
				return e.toLowerCase();
			} : function(e) {
				return e.toUpperCase();
			};
		}
		function Cn(e, t, n, r, i, a) {
			for (var o = Math.min(e.length, r.length), s = -1, c = 0; c < o; ++c) {
				var l = t[c];
				if (l !== r[c]) return i(e[c], n[c]) < 0 ? e.substr(0, c) + n[c] + n.substr(c + 1) : i(e[c], r[c]) < 0 ? e.substr(0, c) + r[c] + n.substr(c + 1) : s >= 0 ? e.substr(0, s) + t[s] + n.substr(s + 1) : null;
				i(e[c], l) < 0 && (s = c);
			}
			return o < r.length && a === "next" ? e + n.substr(e.length) : o < e.length && a === "prev" ? e.substr(0, n.length) : s < 0 ? null : e.substr(0, s) + r[s] + n.substr(s + 1);
		}
		function wn(e, t, n, r) {
			var i, a, o, s, c, l, u, d = n.length;
			if (!n.every(function(e) {
				return typeof e == "string";
			})) return yn(e, Rt);
			function f(e) {
				i = xn(e), a = Sn(e), o = e === "next" ? _n : vn;
				var t = n.map(function(e) {
					return {
						lower: a(e),
						upper: i(e)
					};
				}).sort(function(e, t) {
					return o(e.lower, t.lower);
				});
				s = t.map(function(e) {
					return e.upper;
				}), c = t.map(function(e) {
					return e.lower;
				}), l = e, u = e === "next" ? "" : r;
			}
			f("next");
			var p = new e.Collection(e, function() {
				return Tn(s[0], c[d - 1] + r);
			});
			p._ondirectionchange = function(e) {
				f(e);
			};
			var m = 0;
			return p._addAlgorithm(function(e, n, r) {
				var i = e.key;
				if (typeof i != "string") return !1;
				var f = a(i);
				if (t(f, c, m)) return !0;
				for (var p = null, h = m; h < d; ++h) {
					var g = Cn(i, f, s[h], c[h], o, l);
					g === null && p === null ? m = h + 1 : (p === null || o(p, g) > 0) && (p = g);
				}
				return n(p === null ? r : function() {
					e.continue(p + u);
				}), !1;
			}), p;
		}
		function Tn(e, t, n, r) {
			return {
				type: 2,
				lower: e,
				upper: t,
				lowerOpen: n,
				upperOpen: r
			};
		}
		function En(e) {
			return {
				type: 1,
				lower: e,
				upper: e
			};
		}
		var Dn = function() {
			function e() {}
			return Object.defineProperty(e.prototype, "Collection", {
				get: function() {
					return this._ctx.table.db.Collection;
				},
				enumerable: !1,
				configurable: !0
			}), e.prototype.between = function(e, t, n, r) {
				n = n !== !1, r = r === !0;
				try {
					return this._cmp(e, t) > 0 || this._cmp(e, t) === 0 && (n || r) && !(n && r) ? bn(this) : new this.Collection(this, function() {
						return Tn(e, t, !n, !r);
					});
				} catch {
					return yn(this, Lt);
				}
			}, e.prototype.equals = function(e) {
				return e == null ? yn(this, Lt) : new this.Collection(this, function() {
					return En(e);
				});
			}, e.prototype.above = function(e) {
				return e == null ? yn(this, Lt) : new this.Collection(this, function() {
					return Tn(e, void 0, !0);
				});
			}, e.prototype.aboveOrEqual = function(e) {
				return e == null ? yn(this, Lt) : new this.Collection(this, function() {
					return Tn(e, void 0, !1);
				});
			}, e.prototype.below = function(e) {
				return e == null ? yn(this, Lt) : new this.Collection(this, function() {
					return Tn(void 0, e, !1, !0);
				});
			}, e.prototype.belowOrEqual = function(e) {
				return e == null ? yn(this, Lt) : new this.Collection(this, function() {
					return Tn(void 0, e);
				});
			}, e.prototype.startsWith = function(e) {
				return typeof e == "string" ? this.between(e, e + Ft, !0, !0) : yn(this, Rt);
			}, e.prototype.startsWithIgnoreCase = function(e) {
				return e === "" ? this.startsWith(e) : wn(this, function(e, t) {
					return e.indexOf(t[0]) === 0;
				}, [e], Ft);
			}, e.prototype.equalsIgnoreCase = function(e) {
				return wn(this, function(e, t) {
					return e === t[0];
				}, [e], "");
			}, e.prototype.anyOfIgnoreCase = function() {
				var e = A.apply(ue, arguments);
				return e.length === 0 ? bn(this) : wn(this, function(e, t) {
					return t.indexOf(e) !== -1;
				}, e, "");
			}, e.prototype.startsWithAnyOfIgnoreCase = function() {
				var e = A.apply(ue, arguments);
				return e.length === 0 ? bn(this) : wn(this, function(e, t) {
					return t.some(function(t) {
						return e.indexOf(t) === 0;
					});
				}, e, Ft);
			}, e.prototype.anyOf = function() {
				var e = this, t = A.apply(ue, arguments), n = this._cmp;
				try {
					t.sort(n);
				} catch {
					return yn(this, Lt);
				}
				if (t.length === 0) return bn(this);
				var r = new this.Collection(this, function() {
					return Tn(t[0], t[t.length - 1]);
				});
				r._ondirectionchange = function(r) {
					n = r === "next" ? e._ascending : e._descending, t.sort(n);
				};
				var i = 0;
				return r._addAlgorithm(function(e, r, a) {
					for (var o = e.key; n(o, t[i]) > 0;) if (++i, i === t.length) return r(a), !1;
					return n(o, t[i]) === 0 || (r(function() {
						e.continue(t[i]);
					}), !1);
				}), r;
			}, e.prototype.notEqual = function(e) {
				return this.inAnyRange([[It, e], [e, this.db._maxKey]], {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.noneOf = function() {
				var e = A.apply(ue, arguments);
				if (e.length === 0) return new this.Collection(this);
				try {
					e.sort(this._ascending);
				} catch {
					return yn(this, Lt);
				}
				var t = e.reduce(function(e, t) {
					return e ? e.concat([[e[e.length - 1][1], t]]) : [[It, t]];
				}, null);
				return t.push([e[e.length - 1], this.db._maxKey]), this.inAnyRange(t, {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.inAnyRange = function(e, t) {
				var n = this, r = this._cmp, i = this._ascending, a = this._descending, o = this._min, s = this._max;
				if (e.length === 0) return bn(this);
				if (!e.every(function(e) {
					return e[0] !== void 0 && e[1] !== void 0 && i(e[0], e[1]) <= 0;
				})) return yn(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", M.InvalidArgument);
				var c = !t || t.includeLowers !== !1, l = t && t.includeUppers === !0;
				function u(e, t) {
					for (var n = 0, i = e.length; n < i; ++n) {
						var a = e[n];
						if (r(t[0], a[1]) < 0 && r(t[1], a[0]) > 0) {
							a[0] = o(a[0], t[0]), a[1] = s(a[1], t[1]);
							break;
						}
					}
					return n === i && e.push(t), e;
				}
				var d = i;
				function f(e, t) {
					return d(e[0], t[0]);
				}
				var p;
				try {
					p = e.reduce(u, []), p.sort(f);
				} catch {
					return yn(this, Lt);
				}
				var m = 0, h = l ? function(e) {
					return i(e, p[m][1]) > 0;
				} : function(e) {
					return i(e, p[m][1]) >= 0;
				}, g = c ? function(e) {
					return a(e, p[m][0]) > 0;
				} : function(e) {
					return a(e, p[m][0]) >= 0;
				};
				function _(e) {
					return !h(e) && !g(e);
				}
				var v = h, y = new this.Collection(this, function() {
					return Tn(p[0][0], p[p.length - 1][1], !c, !l);
				});
				return y._ondirectionchange = function(e) {
					e === "next" ? (v = h, d = i) : (v = g, d = a), p.sort(f);
				}, y._addAlgorithm(function(e, t, r) {
					for (var a = e.key; v(a);) if (++m, m === p.length) return t(r), !1;
					return _(a) ? !0 : (n._cmp(a, p[m][1]) === 0 || n._cmp(a, p[m][0]) === 0 || t(function() {
						d === i ? e.continue(p[m][0]) : e.continue(p[m][1]);
					}), !1);
				}), y;
			}, e.prototype.startsWithAnyOf = function() {
				var e = A.apply(ue, arguments);
				return e.every(function(e) {
					return typeof e == "string";
				}) ? e.length === 0 ? bn(this) : this.inAnyRange(e.map(function(e) {
					return [e, e + Ft];
				})) : yn(this, "startsWithAnyOf() only works with strings");
			}, e;
		}();
		function On(e) {
			return rn(Dn.prototype, function(t, n, r) {
				if (this.db = e, this._ctx = {
					table: t,
					index: n === ":id" ? null : n,
					or: r
				}, this._cmp = this._ascending = qt, this._descending = function(e, t) {
					return qt(t, e);
				}, this._max = function(e, t) {
					return qt(e, t) > 0 ? e : t;
				}, this._min = function(e, t) {
					return qt(e, t) < 0 ? e : t;
				}, this._IDBKeyRange = e._deps.IDBKeyRange, !this._IDBKeyRange) throw new M.MissingAPI();
			});
		}
		function kn(e) {
			return mt(function(t) {
				return An(t), e(t.target.error), !1;
			});
		}
		function An(e) {
			e.stopPropagation && e.stopPropagation(), e.preventDefault && e.preventDefault();
		}
		var jn = "storagemutated", Mn = "x-storagemutated-1", Nn = nn(null, jn), L = function() {
			function e() {}
			return e.prototype._lock = function() {
				return b(!P.global), ++this._reculock, this._reculock === 1 && !P.global && (P.lockOwnerFor = this), this;
			}, e.prototype._unlock = function() {
				if (b(!P.global), --this._reculock === 0) for (P.global || (P.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked();) {
					var e = this._blockedFuncs.shift();
					try {
						kt(e[1], e[0]);
					} catch {}
				}
				return this;
			}, e.prototype._locked = function() {
				return this._reculock && P.lockOwnerFor !== this;
			}, e.prototype.create = function(e) {
				var t = this;
				if (!this.mode) return this;
				var n = this.db.idbdb, r = this.db._state.dbOpenError;
				if (b(!this.idbtrans), !e && !n) switch (r && r.name) {
					case "DatabaseClosedError": throw new M.DatabaseClosed(r);
					case "MissingAPIError": throw new M.MissingAPI(r.message, r);
					default: throw new M.OpenFailed(r);
				}
				if (!this.active) throw new M.TransactionInactive();
				return b(this._completion._state === null), e = this.idbtrans = e || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : n.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })), e.onerror = mt(function(n) {
					An(n), t._reject(e.error);
				}), e.onabort = mt(function(n) {
					An(n), t.active && t._reject(new M.Abort(e.error)), t.active = !1, t.on("abort").fire(n);
				}), e.oncomplete = mt(function() {
					t.active = !1, t._resolve(), "mutatedParts" in e && Nn.storagemutated.fire(e.mutatedParts);
				}), this;
			}, e.prototype._promise = function(e, t, n) {
				var r = this;
				if (e === "readwrite" && this.mode !== "readwrite") return Mt(new M.ReadOnly("Transaction is readonly"));
				if (!this.active) return Mt(new M.TransactionInactive());
				if (this._locked()) return new I(function(i, a) {
					r._blockedFuncs.push([function() {
						r._promise(e, t, n).then(i, a);
					}, P]);
				});
				if (n) return xt(function() {
					var e = new I(function(e, n) {
						r._lock();
						var i = t(e, n, r);
						i && i.then && i.then(e, n);
					});
					return e.finally(function() {
						return r._unlock();
					}), e._lib = !0, e;
				});
				var i = new I(function(e, n) {
					var i = t(e, n, r);
					i && i.then && i.then(e, n);
				});
				return i._lib = !0, i;
			}, e.prototype._root = function() {
				return this.parent ? this.parent._root() : this;
			}, e.prototype.waitFor = function(e) {
				var t = this._root(), n = I.resolve(e);
				if (t._waitingFor) t._waitingFor = t._waitingFor.then(function() {
					return n;
				});
				else {
					t._waitingFor = n, t._waitingQueue = [];
					var r = t.idbtrans.objectStore(t.storeNames[0]);
					(function e() {
						for (++t._spinCount; t._waitingQueue.length;) t._waitingQueue.shift()();
						t._waitingFor && (r.get(-Infinity).onsuccess = e);
					})();
				}
				var i = t._waitingFor;
				return new I(function(e, r) {
					n.then(function(n) {
						return t._waitingQueue.push(mt(e.bind(null, n)));
					}, function(e) {
						return t._waitingQueue.push(mt(r.bind(null, e)));
					}).finally(function() {
						t._waitingFor === i && (t._waitingFor = null);
					});
				});
			}, e.prototype.abort = function() {
				this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new M.Abort()));
			}, e.prototype.table = function(e) {
				var t = this._memoizedTables ||= {};
				if (u(t, e)) return t[e];
				var n = this.schema[e];
				if (!n) throw new M.NotFound("Table " + e + " not part of transaction");
				var r = new this.db.Table(e, n, this);
				return r.core = this.db.core.table(e), t[e] = r, r;
			}, e;
		}();
		function Pn(e) {
			return rn(L.prototype, function(t, n, r, i, a) {
				var o = this;
				t !== "readonly" && n.forEach(function(e) {
					var t = r[e]?.yProps;
					t && (n = n.concat(t.map(function(e) {
						return e.updatesTable;
					})));
				}), this.db = e, this.mode = t, this.storeNames = n, this.schema = r, this.chromeTransactionDurability = i, this.idbtrans = null, this.on = nn(this, "complete", "error", "abort"), this.parent = a || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new I(function(e, t) {
					o._resolve = e, o._reject = t;
				}), this._completion.then(function() {
					o.active = !1, o.on.complete.fire();
				}, function(e) {
					var t = o.active;
					return o.active = !1, o.on.error.fire(e), o.parent ? o.parent._reject(e) : t && o.idbtrans && o.idbtrans.abort(), Mt(e);
				});
			});
		}
		function Fn(e, t, n, r, i, a, o, s) {
			return {
				name: e,
				keyPath: t,
				unique: n,
				multi: r,
				auto: i,
				compound: a,
				src: (n && !o ? "&" : "") + (r ? "*" : "") + (i ? "++" : "") + In(t),
				type: s
			};
		}
		function In(e) {
			return typeof e == "string" ? e : e ? "[" + [].join.call(e, "+") + "]" : "";
		}
		function Ln(e, t, n) {
			return {
				name: e,
				primKey: t,
				indexes: n,
				mappedClass: null,
				idxByName: S(n, function(e) {
					return [e.name, e];
				})
			};
		}
		function R(e) {
			return e.length === 1 ? e[0] : e;
		}
		var Rn = function(e) {
			try {
				return e.only([[]]), Rn = function() {
					return [[]];
				}, [[]];
			} catch {
				return Rn = function() {
					return Ft;
				}, Ft;
			}
		};
		function zn(e) {
			return e == null ? function() {} : typeof e == "string" ? Bn(e) : function(t) {
				return C(t, e);
			};
		}
		function Bn(e) {
			return e.split(".").length === 1 ? function(t) {
				return t[e];
			} : function(t) {
				return C(t, e);
			};
		}
		function Vn(e) {
			return [].slice.call(e);
		}
		var Hn = 0;
		function Un(e) {
			return e == null ? ":id" : typeof e == "string" ? e : `[${e.join("+")}]`;
		}
		function Wn(e, t, n) {
			function r(e, t) {
				var n = Vn(e.objectStoreNames), r = n.length > 0 ? t.objectStore(n[0]) : {};
				return {
					schema: {
						name: e.name,
						tables: n.map(function(e) {
							return t.objectStore(e);
						}).map(function(e) {
							var t = e.keyPath, n = e.autoIncrement, r = o(t), i = t == null, a = {}, s = {
								name: e.name,
								primaryKey: {
									name: null,
									isPrimaryKey: !0,
									outbound: i,
									compound: r,
									keyPath: t,
									autoIncrement: n,
									unique: !0,
									extractKey: zn(t)
								},
								indexes: Vn(e.indexNames).map(function(t) {
									return e.index(t);
								}).map(function(e) {
									var t = e.name, n = e.unique, r = e.multiEntry, i = e.keyPath, s = {
										name: t,
										compound: o(i),
										keyPath: i,
										unique: n,
										multiEntry: r,
										extractKey: zn(i)
									};
									return a[Un(i)] = s, s;
								}),
								getIndexByKeyPath: function(e) {
									return a[Un(e)];
								}
							};
							return a[":id"] = s.primaryKey, t != null && (a[Un(t)] = s.primaryKey), s;
						})
					},
					hasGetAll: n.length > 0 && "getAll" in r && !(typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604),
					hasIdb3Features: "getAllRecords" in r
				};
			}
			function i(e) {
				if (e.type === 3) return null;
				if (e.type === 4) throw Error("Cannot convert never type to IDBKeyRange");
				var n = e.lower, r = e.upper, i = e.lowerOpen, a = e.upperOpen;
				return n === void 0 ? r === void 0 ? null : t.upperBound(r, !!a) : r === void 0 ? t.lowerBound(n, !!i) : t.bound(n, r, !!i, !!a);
			}
			function a(e) {
				var t = e.name;
				function n(e) {
					var n = e.trans, r = e.type, a = e.keys, o = e.values, s = e.range;
					return new Promise(function(e, c) {
						e = mt(e);
						var l = n.objectStore(t), u = l.keyPath == null, d = r === "put" || r === "add";
						if (!d && r !== "delete" && r !== "deleteRange") throw Error("Invalid operation type: " + r);
						var f = (a || o || { length: 1 }).length;
						if (a && o && a.length !== o.length) throw Error("Given keys array must have same length as given values array.");
						if (f === 0) return e({
							numFailures: 0,
							failures: {},
							results: [],
							lastResult: void 0
						});
						var p, m = [], h = [], g = 0, _ = function(e) {
							++g, An(e);
						};
						if (r === "deleteRange") {
							if (s.type === 4) return e({
								numFailures: g,
								failures: h,
								results: [],
								lastResult: void 0
							});
							s.type === 3 ? m.push(p = l.clear()) : m.push(p = l.delete(i(s)));
						} else {
							var v = d ? u ? [o, a] : [o, null] : [a, null], y = v[0], b = v[1];
							if (d) for (var x = 0; x < f; ++x) m.push(p = b && b[x] !== void 0 ? l[r](y[x], b[x]) : l[r](y[x])), p.onerror = _;
							else for (var x = 0; x < f; ++x) m.push(p = l[r](y[x])), p.onerror = _;
						}
						var S = function(t) {
							var n = t.target.result;
							m.forEach(function(e, t) {
								return e.error != null && (h[t] = e.error);
							}), e({
								numFailures: g,
								failures: h,
								results: r === "delete" ? a : m.map(function(e) {
									return e.result;
								}),
								lastResult: n
							});
						};
						p.onerror = function(e) {
							_(e), S(e);
						}, p.onsuccess = S;
					});
				}
				function r(e) {
					var n = e.trans, r = e.values, a = e.query, o = e.reverse, s = e.unique;
					return new Promise(function(e, c) {
						e = mt(e);
						var l = a.index, u = a.range, d = n.objectStore(t), f = l.isPrimaryKey ? d : d.index(l.name), p = o ? s ? "prevunique" : "prev" : s ? "nextunique" : "next", m = r || !("openKeyCursor" in f) ? f.openCursor(i(u), p) : f.openKeyCursor(i(u), p);
						m.onerror = kn(c), m.onsuccess = mt(function(t) {
							var r = m.result;
							if (!r) e(null);
							else {
								r.___id = ++Hn, r.done = !1;
								var i = r.continue.bind(r), a = r.continuePrimaryKey;
								a &&= a.bind(r);
								var o = r.advance.bind(r), s = function() {
									throw Error("Cursor not started");
								}, l = function() {
									throw Error("Cursor not stopped");
								};
								r.trans = n, r.stop = r.continue = r.continuePrimaryKey = r.advance = s, r.fail = mt(c), r.next = function() {
									var e = this, t = 1;
									return this.start(function() {
										return t-- ? e.continue() : e.stop();
									}).then(function() {
										return e;
									});
								}, r.start = function(e) {
									var t = new Promise(function(e, t) {
										e = mt(e), m.onerror = kn(t), r.fail = t, r.stop = function(t) {
											r.stop = r.continue = r.continuePrimaryKey = r.advance = l, e(t);
										};
									}), n = function() {
										if (m.result) try {
											e();
										} catch (e) {
											r.fail(e);
										}
										else r.done = !0, r.start = function() {
											throw Error("Cursor behind last entry");
										}, r.stop();
									};
									return m.onsuccess = mt(function(e) {
										m.onsuccess = n, n();
									}), r.continue = i, r.continuePrimaryKey = a, r.advance = o, n(), t;
								}, e(r);
							}
						}, c);
					});
				}
				function a(e, n) {
					return function(r) {
						return new Promise(function(a, o) {
							a = mt(a);
							var s = r.trans, c = r.values, l = r.limit, u = r.query, d = r.direction ?? "next", f = l === Infinity ? void 0 : l, p = u.index, m = u.range, h = s.objectStore(t), g = p.isPrimaryKey ? h : h.index(p.name), _ = i(m);
							if (l === 0) return a({ result: [] });
							if (n) {
								var v = {
									query: _,
									count: f,
									direction: d
								}, y = c ? g.getAll(v) : g.getAllKeys(v);
								y.onsuccess = function(e) {
									return a({ result: e.target.result });
								}, y.onerror = kn(o);
							} else if (e && d === "next") {
								var y = c ? g.getAll(_, f) : g.getAllKeys(_, f);
								y.onsuccess = function(e) {
									return a({ result: e.target.result });
								}, y.onerror = kn(o);
							} else {
								var b = 0, x = c || !("openKeyCursor" in g) ? g.openCursor(_, d) : g.openKeyCursor(_, d), S = [];
								x.onsuccess = function() {
									var e = x.result;
									if (!e || (S.push(c ? e.value : e.primaryKey), ++b === l)) return a({ result: S });
									e.continue();
								}, x.onerror = kn(o);
							}
						});
					};
				}
				return {
					name: t,
					schema: e,
					mutate: n,
					getMany: function(e) {
						var n = e.trans, r = e.keys;
						return new Promise(function(e, i) {
							e = mt(e);
							for (var a = n.objectStore(t), o = r.length, s = Array(o), c = 0, l = 0, u, d = function(t) {
								var n = t.target;
								s[n._pos] = n.result, ++l === c && e(s);
							}, f = kn(i), p = 0; p < o; ++p) r[p] != null && (u = a.get(r[p]), u._pos = p, u.onsuccess = d, u.onerror = f, ++c);
							c === 0 && e(s);
						});
					},
					get: function(e) {
						var n = e.trans, r = e.key;
						return new Promise(function(e, i) {
							e = mt(e);
							var a = n.objectStore(t).get(r);
							a.onsuccess = function(t) {
								return e(t.target.result);
							}, a.onerror = kn(i);
						});
					},
					query: a(l, u),
					openCursor: r,
					count: function(e) {
						var n = e.query, r = e.trans, a = n.index, o = n.range;
						return new Promise(function(e, n) {
							var s = r.objectStore(t), c = a.isPrimaryKey ? s : s.index(a.name), l = i(o), u = l ? c.count(l) : c.count();
							u.onsuccess = mt(function(t) {
								return e(t.target.result);
							}), u.onerror = kn(n);
						});
					}
				};
			}
			var s = r(e, n), c = s.schema, l = s.hasGetAll, u = s.hasIdb3Features, d = c.tables.map(function(e) {
				return a(e);
			}), f = {};
			return d.forEach(function(e) {
				return f[e.name] = e;
			}), {
				stack: "dbcore",
				transaction: e.transaction.bind(e),
				table: function(e) {
					if (!f[e]) throw Error(`Table '${e}' not found`);
					return f[e];
				},
				MIN_KEY: -Infinity,
				MAX_KEY: Rn(t),
				schema: c
			};
		}
		function Gn(e, t) {
			return t.reduce(function(e, t) {
				var r = t.create;
				return n(n({}, e), r(e));
			}, e);
		}
		function Kn(e, t, n, r) {
			var i = n.IDBKeyRange;
			return n.indexedDB, { dbcore: Gn(Wn(t, i, r), e.dbcore) };
		}
		function qn(e, t) {
			var n = t.db;
			e.core = Kn(e._middlewares, n, e._deps, t).dbcore, e.tables.forEach(function(t) {
				var n = t.name;
				e.core.schema.tables.some(function(e) {
					return e.name === n;
				}) && (t.core = e.core.table(n), e[n] instanceof e.Table && (e[n].core = t.core));
			});
		}
		function Jn(e, t, n, r) {
			n.forEach(function(n) {
				var i = r[n];
				t.forEach(function(t) {
					var r = g(t, n);
					(!r || "value" in r && r.value === void 0) && (t === e.Transaction.prototype || t instanceof e.Transaction ? p(t, n, {
						get: function() {
							return this.table(n);
						},
						set: function(e) {
							f(this, n, {
								value: e,
								writable: !0,
								configurable: !0,
								enumerable: !0
							});
						}
					}) : t[n] = new e.Table(n, i));
				});
			});
		}
		function Yn(e, t) {
			t.forEach(function(t) {
				for (var n in t) t[n] instanceof e.Table && delete t[n];
			});
		}
		function Xn(e, t) {
			return e._cfg.version - t._cfg.version;
		}
		function Zn(e, t, n, r) {
			var i = e._dbSchema;
			n.objectStoreNames.contains("$meta") && !i.$meta && (i.$meta = Ln("$meta", ur("")[0], []), e._storeNames.push("$meta"));
			var o = e._createTransaction("readwrite", e._storeNames, i);
			o.create(n), o._completion.catch(r);
			var s = o._reject.bind(o), c = P.transless || P;
			xt(function() {
				if (P.trans = o, P.transless = c, t === 0) a(i).forEach(function(e) {
					nr(n, e, i[e].primKey, i[e].indexes);
				}), qn(e, n), I.follow(function() {
					return e.on.populate.fire(o);
				}).catch(s);
				else return qn(e, n), $n(e, o, t).then(function(t) {
					return er(e, t, o, n);
				}).catch(s);
			});
		}
		function Qn(e, t) {
			rr(e._dbSchema, t), t.db.version % 10 == 0 && !t.objectStoreNames.contains("$meta") && t.db.createObjectStore("$meta").add(Math.ceil(t.db.version / 10 - 1), "version");
			var n = or(e, e.idbdb, t);
			lr(e, e._dbSchema, t);
			for (var r = tr(n, e._dbSchema), i = function(e) {
				if (e.change.length || e.recreate) return console.warn(`Unable to patch indexes of table ${e.name} because it has changes on the type of index or primary key.`), { value: void 0 };
				var n = t.objectStore(e.name);
				e.add.forEach(function(t) {
					Me && console.debug(`Dexie upgrade patch: Creating missing index ${e.name}.${t.src}`), ar(n, t);
				});
			}, a = 0, o = r.change; a < o.length; a++) {
				var s = o[a], c = i(s);
				if (typeof c == "object") return c.value;
			}
		}
		function $n(e, t, n) {
			return t.storeNames.includes("$meta") ? t.table("$meta").get("version").then(function(e) {
				return e ?? n;
			}) : I.resolve(n);
		}
		function er(e, t, n, r) {
			var i = [], o = e._versions, s = e._dbSchema = or(e, e.idbdb, r), c = o.filter(function(e) {
				return e._cfg.version >= t;
			});
			if (c.length === 0) return I.resolve();
			c.forEach(function(o) {
				i.push(function() {
					var i = s, c = o._cfg.dbschema;
					lr(e, i, r), lr(e, c, r), s = e._dbSchema = c;
					var l = tr(i, c);
					l.add.forEach(function(e) {
						nr(r, e[0], e[1].primKey, e[1].indexes);
					}), l.change.forEach(function(e) {
						if (e.recreate) throw new M.Upgrade("Not yet support for changing primary key");
						var t = r.objectStore(e.name);
						e.add.forEach(function(e) {
							return ar(t, e);
						}), e.change.forEach(function(e) {
							t.deleteIndex(e.name), ar(t, e);
						}), e.del.forEach(function(e) {
							return t.deleteIndex(e);
						});
					});
					var u = o._cfg.contentUpgrade;
					if (u && o._cfg.version > t) {
						qn(e, r), n._memoizedTables = {};
						var d = E(c);
						l.del.forEach(function(e) {
							d[e] = i[e];
						}), Yn(e, [e.Transaction.prototype]), Jn(e, [e.Transaction.prototype], a(d), d), n.schema = d;
						var f = de(u);
						f && St();
						var p, m = I.follow(function() {
							if (p = u(n), p && f) {
								var e = Ct.bind(null, null);
								p.then(e, e);
							}
						});
						return p && typeof p.then == "function" ? I.resolve(p) : m.then(function() {
							return p;
						});
					}
				}), i.push(function(t) {
					var r = o._cfg.dbschema;
					ir(r, t), Yn(e, [e.Transaction.prototype]), Jn(e, [e.Transaction.prototype], e._storeNames, e._dbSchema), n.schema = e._dbSchema;
				}), i.push(function(t) {
					e.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(e.idbdb.version / 10) === o._cfg.version ? (e.idbdb.deleteObjectStore("$meta"), delete e._dbSchema.$meta, e._storeNames = e._storeNames.filter(function(e) {
						return e !== "$meta";
					})) : t.objectStore("$meta").put(o._cfg.version, "version"));
				});
			});
			function l() {
				return i.length ? I.resolve(i.shift()(n.idbtrans)).then(l) : I.resolve();
			}
			return l().then(function() {
				rr(s, r);
			});
		}
		function tr(e, t) {
			var n = {
				del: [],
				add: [],
				change: []
			}, r;
			for (r in e) t[r] || n.del.push(r);
			for (r in t) {
				var i = e[r], a = t[r];
				if (!i) n.add.push([r, a]);
				else {
					var o = {
						name: r,
						def: a,
						recreate: !1,
						del: [],
						add: [],
						change: []
					};
					if ("" + (i.primKey.keyPath || "") != "" + (a.primKey.keyPath || "") || i.primKey.auto !== a.primKey.auto) o.recreate = !0, n.change.push(o);
					else {
						var s = i.idxByName, c = a.idxByName, l = void 0;
						for (l in s) c[l] || o.del.push(l);
						for (l in c) {
							var u = s[l], d = c[l];
							u ? u.src !== d.src && o.change.push(d) : o.add.push(d);
						}
						(o.del.length > 0 || o.add.length > 0 || o.change.length > 0) && n.change.push(o);
					}
				}
			}
			return n;
		}
		function nr(e, t, n, r) {
			var i = e.db.createObjectStore(t, n.keyPath ? {
				keyPath: n.keyPath,
				autoIncrement: n.auto
			} : { autoIncrement: n.auto });
			return r.forEach(function(e) {
				return ar(i, e);
			}), i;
		}
		function rr(e, t) {
			a(e).forEach(function(n) {
				t.db.objectStoreNames.contains(n) || (Me && console.debug("Dexie: Creating missing table", n), nr(t, n, e[n].primKey, e[n].indexes));
			});
		}
		function ir(e, t) {
			[].slice.call(t.db.objectStoreNames).forEach(function(n) {
				return e[n] == null && t.db.deleteObjectStore(n);
			});
		}
		function ar(e, t) {
			e.createIndex(t.name, t.keyPath, {
				unique: t.unique,
				multiEntry: t.multi
			});
		}
		function or(e, t, n) {
			var r = {};
			return v(t.objectStoreNames, 0).forEach(function(e) {
				for (var t = n.objectStore(e), i = t.keyPath, a = Fn(In(i), i || "", !0, !1, !!t.autoIncrement, i && typeof i != "string", !0), o = [], s = 0; s < t.indexNames.length; ++s) {
					var c = t.index(t.indexNames[s]);
					i = c.keyPath;
					var l = Fn(c.name, i, !!c.unique, !!c.multiEntry, !1, i && typeof i != "string", !1);
					o.push(l);
				}
				r[e] = Ln(e, a, o);
			}), r;
		}
		function sr(e, t, n) {
			e.verno = t.version / 10;
			var r = e._dbSchema = or(e, t, n);
			e._storeNames = v(t.objectStoreNames, 0), Jn(e, [e._allTables], a(r), r);
		}
		function cr(e, t) {
			var n = tr(or(e, e.idbdb, t), e._dbSchema);
			return !(n.add.length || n.change.some(function(e) {
				return e.add.length || e.change.length;
			}));
		}
		function lr(e, t, n) {
			for (var r = n.db.objectStoreNames, a = 0; a < r.length; ++a) {
				var o = r[a], s = n.objectStore(o);
				e._hasGetAll = "getAll" in s;
				for (var c = 0; c < s.indexNames.length; ++c) {
					var l = s.indexNames[c], u = s.index(l).keyPath, d = typeof u == "string" ? u : "[" + v(u).join("+") + "]";
					if (t[o]) {
						var f = t[o].idxByName[d];
						f && (f.name = l, delete t[o].idxByName[d], t[o].idxByName[l] = f);
					}
				}
			}
			typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && i.WorkerGlobalScope && i instanceof i.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 && (e._hasGetAll = !1);
		}
		function ur(e) {
			return e.split(",").map(function(e, t) {
				var n = e.split(":"), r = n[1]?.trim();
				e = n[0].trim();
				var i = e.replace(/([&*]|\+\+)/g, ""), a = /^\[/.test(i) ? i.match(/^\[(.*)\]$/)[1].split("+") : i;
				return Fn(i, a || null, /\&/.test(e), /\*/.test(e), /\+\+/.test(e), o(a), t === 0, r);
			});
		}
		var dr = function() {
			function e() {}
			return e.prototype._createTableSchema = function(e, t, n) {
				return Ln(e, t, n);
			}, e.prototype._parseIndexSyntax = function(e) {
				return ur(e);
			}, e.prototype._parseStoresSpec = function(e, t) {
				var n = this;
				a(e).forEach(function(r) {
					if (e[r] !== null) {
						var i = n._parseIndexSyntax(e[r]), a = i.shift();
						if (!a) throw new M.Schema("Invalid schema for table " + r + ": " + e[r]);
						if (a.unique = !0, a.multi) throw new M.Schema("Primary key cannot be multiEntry*");
						i.forEach(function(e) {
							if (e.auto) throw new M.Schema("Only primary key can be marked as autoIncrement (++)");
							if (!e.keyPath) throw new M.Schema("Index must have a name and cannot be an empty string");
						}), t[r] = n._createTableSchema(r, a, i);
					}
				});
			}, e.prototype.stores = function(e) {
				var t = this.db;
				this._cfg.storesSource = this._cfg.storesSource ? s(this._cfg.storesSource, e) : e;
				var n = t._versions, r = {}, i = {};
				return n.forEach(function(e) {
					s(r, e._cfg.storesSource), i = e._cfg.dbschema = {}, e._parseStoresSpec(r, i);
				}), t._dbSchema = i, Yn(t, [
					t._allTables,
					t,
					t.Transaction.prototype
				]), Jn(t, [
					t._allTables,
					t,
					t.Transaction.prototype,
					this._cfg.tables
				], a(i), i), t._storeNames = a(i), this;
			}, e.prototype.upgrade = function(e) {
				return this._cfg.contentUpgrade = je(this._cfg.contentUpgrade || N, e), this;
			}, e;
		}();
		function fr(e) {
			return rn(dr.prototype, function(t) {
				this.db = e, this._cfg = {
					version: t,
					storesSource: null,
					dbschema: {},
					tables: {},
					contentUpgrade: null
				};
			});
		}
		var pr = mr();
		function mr() {
			if (typeof FinalizationRegistry < "u" && typeof WeakRef < "u") {
				var e = /* @__PURE__ */ new Set(), t = new FinalizationRegistry(function(t) {
					e.delete(t);
				}), n = function() {
					return Array.from(e).map(function(e) {
						return e.deref();
					}).filter(function(e) {
						return e !== void 0;
					});
				}, r = function(n) {
					var r = new WeakRef(n._novip);
					if (e.add(r), t.register(n._novip, r, r), e.size > n._options.maxConnections) {
						var i = e.values().next().value;
						e.delete(i), t.unregister(i);
					}
				}, i = function(n) {
					if (n) for (var r = e.values(), i = r.next(); !i.done;) {
						var a = i.value;
						if (a.deref() === n._novip) {
							e.delete(a), t.unregister(a);
							return;
						}
						i = r.next();
					}
				};
				return {
					toArray: n,
					add: r,
					remove: i
				};
			}
			var a = [], n = function() {
				return a;
			}, r = function(e) {
				a.push(e._novip);
			}, i = function(e) {
				if (e) {
					var t = a.indexOf(e._novip);
					t !== -1 && a.splice(t, 1);
				}
			};
			return {
				toArray: n,
				add: r,
				remove: i
			};
		}
		function hr(e, t) {
			var n = e._dbNamesDB;
			return n || (n = e._dbNamesDB = new hi(Bt, {
				addons: [],
				indexedDB: e,
				IDBKeyRange: t
			}), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
		}
		function gr(e) {
			return e && typeof e.databases == "function";
		}
		function _r(e) {
			var t = e.indexedDB, n = e.IDBKeyRange;
			return gr(t) ? Promise.resolve(t.databases()).then(function(e) {
				return e.map(function(e) {
					return e.name;
				}).filter(function(e) {
					return e !== Bt;
				});
			}) : hr(t, n).toCollection().primaryKeys();
		}
		function vr(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!gr(n) && t !== Bt && hr(n, r).put({ name: t }).catch(N);
		}
		function yr(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!gr(n) && t !== Bt && hr(n, r).delete(t).catch(N);
		}
		function br(e) {
			return xt(function() {
				return P.letThrough = !0, e();
			});
		}
		function xr() {
			if (navigator.userAgentData || !/Safari\//.test(navigator.userAgent) || /Chrom(e|ium)\//.test(navigator.userAgent) || !indexedDB.databases) return Promise.resolve();
			var e;
			return new Promise(function(t) {
				var n = function() {
					return indexedDB.databases().finally(t);
				};
				e = setInterval(n, 100), n();
			}).finally(function() {
				return clearInterval(e);
			});
		}
		var Sr;
		function Cr(e) {
			return !("from" in e);
		}
		var wr = function(e, t) {
			if (this) s(this, arguments.length ? {
				d: 1,
				from: e,
				to: arguments.length > 1 ? t : e
			} : { d: 0 });
			else {
				var n = new wr();
				return e && "d" in e && s(n, e), n;
			}
		};
		d(wr.prototype, (Sr = {
			add: function(e) {
				return Er(this, e), this;
			},
			addKey: function(e) {
				return Tr(this, e, e), this;
			},
			addKeys: function(e) {
				var t = this;
				return e.forEach(function(e) {
					return Tr(t, e, e);
				}), this;
			},
			hasKey: function(e) {
				var t = Or(this).next(e).value;
				return t && qt(t.from, e) <= 0 && qt(t.to, e) >= 0;
			}
		}, Sr[ce] = function() {
			return Or(this);
		}, Sr));
		function Tr(e, t, n) {
			var r = qt(t, n);
			if (!isNaN(r)) {
				if (r > 0) throw RangeError();
				if (Cr(e)) return s(e, {
					from: t,
					to: n,
					d: 1
				});
				var i = e.l, a = e.r;
				if (qt(n, e.from) < 0) return i ? Tr(i, t, n) : e.l = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, kr(e);
				if (qt(t, e.to) > 0) return a ? Tr(a, t, n) : e.r = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, kr(e);
				qt(t, e.from) < 0 && (e.from = t, e.l = null, e.d = a ? a.d + 1 : 1), qt(n, e.to) > 0 && (e.to = n, e.r = null, e.d = e.l ? e.l.d + 1 : 1);
				var o = !e.r;
				i && !e.l && Er(e, i), a && o && Er(e, a);
			}
		}
		function Er(e, t) {
			function n(e, t) {
				var r = t.from, i = t.to, a = t.l, o = t.r;
				Tr(e, r, i), a && n(e, a), o && n(e, o);
			}
			Cr(t) || n(e, t);
		}
		function Dr(e, t) {
			var n = Or(t), r = n.next();
			if (r.done) return !1;
			for (var i = r.value, a = Or(e), o = a.next(i.from), s = o.value; !r.done && !o.done;) {
				if (qt(s.from, i.to) <= 0 && qt(s.to, i.from) >= 0) return !0;
				qt(i.from, s.from) < 0 ? i = (r = n.next(s.from)).value : s = (o = a.next(i.from)).value;
			}
			return !1;
		}
		function Or(e) {
			var t = Cr(e) ? null : {
				s: 0,
				n: e
			};
			return { next: function(e) {
				for (var n = arguments.length > 0; t;) switch (t.s) {
					case 0: if (t.s = 1, n) for (; t.n.l && qt(e, t.n.from) < 0;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					else for (; t.n.l;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					case 1: if (t.s = 2, !n || qt(e, t.n.to) <= 0) return {
						value: t.n,
						done: !1
					};
					case 2: if (t.n.r) {
						t.s = 3, t = {
							up: t,
							n: t.n.r,
							s: 0
						};
						continue;
					}
					case 3: t = t.up;
				}
				return { done: !0 };
			} };
		}
		function kr(e) {
			var t = (e.r?.d || 0) - (e.l?.d || 0), r = t > 1 ? "r" : t < -1 ? "l" : "";
			if (r) {
				var i = r === "r" ? "l" : "r", a = n({}, e), o = e[r];
				e.from = o.from, e.to = o.to, e[r] = o[r], a[r] = o[i], e[i] = a, a.d = Ar(a);
			}
			e.d = Ar(e);
		}
		function Ar(e) {
			var t = e.r, n = e.l;
			return (t ? n ? Math.max(t.d, n.d) : t.d : n ? n.d : 0) + 1;
		}
		function jr(e, t) {
			return a(t).forEach(function(n) {
				e[n] ? Er(e[n], t[n]) : e[n] = ne(t[n]);
			}), e;
		}
		function Mr(e, t) {
			return e.all || t.all || Object.keys(e).some(function(n) {
				return t[n] && Dr(t[n], e[n]);
			});
		}
		var Nr = {}, Pr = {}, Fr = !1;
		function Ir(e, t) {
			jr(Pr, e), Fr || (Fr = !0, setTimeout(function() {
				Fr = !1;
				var e = Pr;
				Pr = {}, Lr(e, !1);
			}, 0));
		}
		function Lr(e, t) {
			t === void 0 && (t = !1);
			var n = /* @__PURE__ */ new Set();
			if (e.all) for (var r = 0, i = Object.values(Nr); r < i.length; r++) {
				var a = i[r];
				Rr(a, e, n, t);
			}
			else for (var o in e) {
				var s = /^idb\:\/\/(.*)\/(.*)\//.exec(o);
				if (s) {
					var a = Nr[`idb://${s[1]}/${s[2]}`];
					a && Rr(a, e, n, t);
				}
			}
			n.forEach(function(e) {
				return e();
			});
		}
		function Rr(e, t, n, r) {
			for (var i = [], a = 0, o = Object.entries(e.queries.query); a < o.length; a++) {
				for (var s = o[a], c = s[0], l = s[1], u = [], d = 0, f = l; d < f.length; d++) {
					var p = f[d];
					Mr(t, p.obsSet) ? p.subscribers.forEach(function(e) {
						return n.add(e);
					}) : r && u.push(p);
				}
				r && i.push([c, u]);
			}
			if (r) for (var m = 0, h = i; m < h.length; m++) {
				var g = h[m], c = g[0], u = g[1];
				e.queries.query[c] = u;
			}
		}
		function zr(e) {
			var t = e._state, n = e._deps.indexedDB;
			if (t.isBeingOpened || e.idbdb) return t.dbReadyPromise.then(function() {
				return t.dbOpenError ? Mt(t.dbOpenError) : e;
			});
			t.isBeingOpened = !0, t.dbOpenError = null, t.openComplete = !1;
			var r = t.openCanceller, a = Math.round(e.verno * 10), o = !1;
			function s() {
				if (t.openCanceller !== r) throw new M.DatabaseClosed("db.open() was cancelled");
			}
			var c = t.dbReadyResolve, l = null, u = !1, d = function() {
				return new I(function(r, i) {
					if (s(), !n) throw new M.MissingAPI();
					var c = e.name, f = t.autoSchema || !a ? n.open(c) : n.open(c, a);
					if (!f) throw new M.MissingAPI();
					f.onerror = kn(i), f.onblocked = mt(e._fireOnBlocked), f.onupgradeneeded = mt(function(r) {
						if (l = f.transaction, t.autoSchema && !e._options.allowEmptyDB) {
							f.onerror = An, l.abort(), f.result.close();
							var a = n.deleteDatabase(c);
							a.onsuccess = a.onerror = mt(function() {
								i(new M.NoSuchDatabase(`Database ${c} doesnt exist`));
							});
						} else {
							l.onerror = kn(i);
							var s = r.oldVersion > 2 ** 62 ? 0 : r.oldVersion;
							u = s < 1, e.idbdb = f.result, o && Qn(e, l), Zn(e, s / 10, l, i);
						}
					}, i), f.onsuccess = mt(function() {
						l = null;
						var n = e.idbdb = f.result, i = v(n.objectStoreNames);
						if (i.length > 0) try {
							var s = n.transaction(R(i), "readonly");
							if (t.autoSchema) sr(e, n, s);
							else if (lr(e, e._dbSchema, s), !cr(e, s) && !o) return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), n.close(), a = n.version + 1, o = !0, r(d());
							qn(e, s);
						} catch {}
						pr.add(e), n.onversionchange = mt(function(n) {
							t.vcFired = !0, e.on("versionchange").fire(n);
						}), n.onclose = mt(function() {
							e.close({ disableAutoOpen: !1 });
						}), u && vr(e._deps, c), r();
					}, i);
				}).catch(function(e) {
					switch (e?.name) {
						case "UnknownError":
							if (t.PR1398_maxLoop > 0) return t.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), d();
							break;
						case "VersionError": if (a > 0) return a = 0, d();
					}
					return I.reject(e);
				});
			}, f = typeof navigator < "u" && !!n && n === i.indexedDB;
			return I.race([r, (f ? xr() : I.resolve()).then(d)]).then(function() {
				return s(), t.onReadyBeingFired = [], I.resolve(br(function() {
					return e.on.ready.fire(e.vip);
				})).then(function n() {
					if (t.onReadyBeingFired.length > 0) {
						var r = t.onReadyBeingFired.reduce(je, N);
						return t.onReadyBeingFired = [], I.resolve(br(function() {
							return r(e.vip);
						})).then(n);
					}
				});
			}).finally(function() {
				t.openCanceller === r && (t.onReadyBeingFired = null, t.isBeingOpened = !1);
			}).catch(function(n) {
				t.dbOpenError = n;
				try {
					l && l.abort();
				} catch {}
				return r === t.openCanceller && e._close(), Mt(n);
			}).finally(function() {
				t.openComplete = !0, c();
			}).then(function() {
				if (u) {
					var t = {};
					e.tables.forEach(function(n) {
						n.schema.indexes.forEach(function(r) {
							r.name && (t[`idb://${e.name}/${n.name}/${r.name}`] = new wr(-Infinity, [[[]]]));
						}), t[`idb://${e.name}/${n.name}/`] = t[`idb://${e.name}/${n.name}/:dels`] = new wr(-Infinity, [[[]]]);
					}), Nn(jn).fire(t), Lr(t, !0);
				}
				return e;
			});
		}
		function Br(e) {
			var t = function(t) {
				return e.next(t);
			}, n = function(t) {
				return e.throw(t);
			}, r = a(t), i = a(n);
			function a(e) {
				return function(t) {
					var n = e(t), a = n.value;
					return n.done ? a : !a || typeof a.then != "function" ? o(a) ? Promise.all(a).then(r, i) : r(a) : a.then(r, i);
				};
			}
			return a(t)();
		}
		function Vr(e, t, n) {
			var r = arguments.length;
			if (r < 2) throw new M.InvalidArgument("Too few arguments");
			for (var i = Array(r - 1); --r;) i[r - 1] = arguments[r];
			return n = i.pop(), [
				e,
				ee(i),
				n
			];
		}
		function z(e, t, n, r, i) {
			return I.resolve().then(function() {
				var a = P.transless || P, o = e._createTransaction(t, n, e._dbSchema, r);
				o.explicit = !0;
				var s = {
					trans: o,
					transless: a
				};
				if (r) o.idbtrans = r.idbtrans;
				else try {
					o.create(), o.idbtrans._explicit = !0, e._state.PR1398_maxLoop = 3;
				} catch (r) {
					return r.name === ye.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
						return z(e, t, n, null, i);
					})) : Mt(r);
				}
				var c = de(i);
				c && St();
				var l, u = I.follow(function() {
					if (l = i.call(o, o), l) {
						if (c) {
							var e = Ct.bind(null, null);
							l.then(e, e);
						} else typeof l.next == "function" && typeof l.throw == "function" && (l = Br(l));
					}
				}, s);
				return (l && typeof l.then == "function" ? I.resolve(l).then(function(e) {
					return o.active ? e : Mt(new M.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
				}) : u.then(function() {
					return l;
				})).then(function(e) {
					return r && o._resolve(), o._completion.then(function() {
						return e;
					});
				}).catch(function(e) {
					return o._reject(e), Mt(e);
				});
			});
		}
		function Hr(e, t, n) {
			for (var r = o(e) ? e.slice() : [e], i = 0; i < n; ++i) r.push(t);
			return r;
		}
		function Ur(e) {
			return n(n({}, e), { table: function(t) {
				var r = e.table(t), i = r.schema, a = Object.create(null), o = [];
				function s(e, t, r) {
					var i = Un(e), c = a[i] = a[i] || [], l = e == null ? 0 : typeof e == "string" ? 1 : e.length, u = t > 0, d = n(n({}, r), {
						name: u ? `${i}(virtual-from:${r.name})` : r.name,
						lowLevelIndex: r,
						isVirtual: u,
						keyTail: t,
						keyLength: l,
						extractKey: zn(e),
						unique: !u && r.unique
					});
					return c.push(d), d.isPrimaryKey || o.push(d), l > 1 && s(l === 2 ? e[0] : e.slice(0, l - 1), t + 1, r), c.sort(function(e, t) {
						return e.keyTail - t.keyTail;
					}), d;
				}
				var c = s(i.primaryKey.keyPath, 0, i.primaryKey);
				a[":id"] = [c];
				for (var l = 0, u = i.indexes; l < u.length; l++) {
					var d = u[l];
					s(d.keyPath, 0, d);
				}
				function f(e) {
					var t = a[Un(e)];
					return t && t[0];
				}
				function p(t, n) {
					return {
						type: t.type === 1 ? 2 : t.type,
						lower: Hr(t.lower, t.lowerOpen ? e.MAX_KEY : e.MIN_KEY, n),
						lowerOpen: !0,
						upper: Hr(t.upper, t.upperOpen ? e.MIN_KEY : e.MAX_KEY, n),
						upperOpen: !0
					};
				}
				function m(e) {
					var t = e.query.index;
					return t.isVirtual ? n(n({}, e), { query: {
						index: t.lowLevelIndex,
						range: p(e.query.range, t.keyTail)
					} }) : e;
				}
				return n(n({}, r), {
					schema: n(n({}, i), {
						primaryKey: c,
						indexes: o,
						getIndexByKeyPath: f
					}),
					count: function(e) {
						return r.count(m(e));
					},
					query: function(e) {
						return r.query(m(e));
					},
					openCursor: function(t) {
						var n = t.query.index, i = n.keyTail, a = n.isVirtual, o = n.keyLength;
						if (!a) return r.openCursor(t);
						function s(n) {
							function r(r) {
								r == null ? t.unique ? n.continue(n.key.slice(0, o).concat(t.reverse ? e.MIN_KEY : e.MAX_KEY, i)) : n.continue() : n.continue(Hr(r, t.reverse ? e.MAX_KEY : e.MIN_KEY, i));
							}
							return Object.create(n, {
								continue: { value: r },
								continuePrimaryKey: { value: function(t, r) {
									n.continuePrimaryKey(Hr(t, e.MAX_KEY, i), r);
								} },
								primaryKey: { get: function() {
									return n.primaryKey;
								} },
								key: { get: function() {
									var e = n.key;
									return o === 1 ? e[0] : e.slice(0, o);
								} },
								value: { get: function() {
									return n.value;
								} }
							});
						}
						return r.openCursor(m(t)).then(function(e) {
							return e && s(e);
						});
					}
				});
			} });
		}
		var Wr = {
			stack: "dbcore",
			name: "VirtualIndexMiddleware",
			level: 1,
			create: Ur
		};
		function Gr(e, t, n, r) {
			return n ||= {}, r ||= "", a(e).forEach(function(i) {
				if (!u(t, i)) n[r + i] = void 0;
				else {
					var a = e[i], o = t[i];
					if (typeof a == "object" && typeof o == "object" && a && o) {
						var s = se(a);
						s === se(o) ? s === "Object" ? Gr(a, o, n, r + i + ".") : a !== o && (n[r + i] = t[i]) : n[r + i] = t[i];
					} else a !== o && (n[r + i] = t[i]);
				}
			}), a(t).forEach(function(i) {
				u(e, i) || (n[r + i] = t[i]);
			}), n;
		}
		function Kr(e, t) {
			return t.type === "delete" ? t.keys : t.keys || t.values.map(e.extractKey);
		}
		var qr = {
			stack: "dbcore",
			name: "HooksMiddleware",
			level: 2,
			create: function(e) {
				return n(n({}, e), { table: function(t) {
					var i = e.table(t), a = i.schema.primaryKey;
					return n(n({}, i), { mutate: function(e) {
						var o = P.trans, s = o.table(t).hook, c = s.deleting, l = s.creating, d = s.updating;
						switch (e.type) {
							case "add":
								if (l.fire === N) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "put":
								if (l.fire === N && d.fire === N) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "delete":
								if (c.fire === N) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "deleteRange":
								if (c.fire === N) break;
								return o._promise("readwrite", function() {
									return p(e);
								}, !0);
						}
						return i.mutate(e);
						function f(e) {
							var t = P.trans, o = e.keys || Kr(a, e);
							if (!o) throw Error("Keys missing");
							return e = e.type === "add" || e.type === "put" ? n(n({}, e), { keys: o }) : n({}, e), e.type !== "delete" && (e.values = r([], e.values, !0)), e.keys && (e.keys = r([], e.keys, !0)), Jr(i, e, o).then(function(n) {
								var r = o.map(function(r, i) {
									var o = n[i], s = {
										onerror: null,
										onsuccess: null
									};
									if (e.type === "delete") c.fire.call(s, r, o, t);
									else if (e.type === "add" || o === void 0) {
										var f = l.fire.call(s, r, e.values[i], t);
										r == null && f != null && (r = f, e.keys[i] = r, a.outbound || w(e.values[i], a.keyPath, r));
									} else {
										var p = Gr(o, e.values[i]), m = d.fire.call(s, p, r, o, t);
										if (m) {
											var h = e.values[i];
											Object.keys(m).forEach(function(e) {
												u(h, e) ? h[e] = m[e] : w(h, e, m[e]);
											});
										}
									}
									return s;
								});
								return i.mutate(e).then(function(t) {
									for (var i = t.failures, a = t.results, s = t.numFailures, c = t.lastResult, l = 0; l < o.length; ++l) {
										var u = a ? a[l] : o[l], d = r[l];
										u == null ? d.onerror && d.onerror(i[l]) : d.onsuccess && d.onsuccess(e.type === "put" && n[l] ? e.values[l] : u);
									}
									return {
										failures: i,
										results: a,
										numFailures: s,
										lastResult: c
									};
								}).catch(function(e) {
									return r.forEach(function(t) {
										return t.onerror && t.onerror(e);
									}), Promise.reject(e);
								});
							});
						}
						function p(e) {
							return m(e.trans, e.range, 1e4);
						}
						function m(e, t, r) {
							return i.query({
								trans: e,
								values: !1,
								query: {
									index: a,
									range: t
								},
								limit: r
							}).then(function(i) {
								var a = i.result;
								return f({
									type: "delete",
									keys: a,
									trans: e
								}).then(function(i) {
									return i.numFailures > 0 ? Promise.reject(i.failures[0]) : a.length < r ? {
										failures: [],
										numFailures: 0,
										lastResult: void 0
									} : m(e, n(n({}, t), {
										lower: a[a.length - 1],
										lowerOpen: !0
									}), r);
								});
							});
						}
					} });
				} });
			}
		};
		function Jr(e, t, n) {
			return t.type === "add" ? Promise.resolve([]) : e.getMany({
				trans: t.trans,
				keys: n,
				cache: "immutable"
			});
		}
		function Yr(e, t, n) {
			try {
				if (!t || t.keys.length < e.length) return null;
				for (var r = [], i = 0, a = 0; i < t.keys.length && a < e.length; ++i) qt(t.keys[i], e[a]) === 0 && (r.push(n ? ie(t.values[i]) : t.values[i]), ++a);
				return r.length === e.length ? r : null;
			} catch {
				return null;
			}
		}
		var Xr = {
			stack: "dbcore",
			level: -1,
			create: function(e) {
				return { table: function(t) {
					var r = e.table(t);
					return n(n({}, r), {
						getMany: function(e) {
							if (!e.cache) return r.getMany(e);
							var t = Yr(e.keys, e.trans._cache, e.cache === "clone");
							return t ? I.resolve(t) : r.getMany(e).then(function(t) {
								return e.trans._cache = {
									keys: e.keys,
									values: e.cache === "clone" ? ie(t) : t
								}, t;
							});
						},
						mutate: function(e) {
							return e.type !== "add" && (e.trans._cache = null), r.mutate(e);
						}
					});
				} };
			}
		};
		function Zr(e, t) {
			return e.trans.mode === "readonly" && !!e.subscr && !e.trans.explicit && e.trans.db._options.cache !== "disabled" && !t.schema.primaryKey.outbound;
		}
		function Qr(e, t) {
			switch (e) {
				case "query": return t.values && !t.unique;
				case "get": return !1;
				case "getMany": return !1;
				case "count": return !1;
				case "openCursor": return !1;
			}
		}
		var $r = {
			stack: "dbcore",
			level: 0,
			name: "Observability",
			create: function(e) {
				var t = e.schema.name, r = new wr(e.MIN_KEY, e.MAX_KEY);
				return n(n({}, e), {
					transaction: function(t, n, r) {
						if (P.subscr && n !== "readonly") throw new M.ReadOnly(`Readwrite transaction in liveQuery context. Querier source: ${P.querier}`);
						return e.transaction(t, n, r);
					},
					table: function(i) {
						var s = e.table(i), c = s.schema, l = c.primaryKey, u = c.indexes, d = l.extractKey, f = l.outbound, p = l.autoIncrement && u.filter(function(e) {
							return e.compound && e.keyPath.includes(l.keyPath);
						}), m = n(n({}, s), { mutate: function(n) {
							var a = n.trans, u = n.mutatedParts ||= {}, d = function(e) {
								var n = `idb://${t}/${i}/${e}`;
								return u[n] || (u[n] = new wr());
							}, f = d(""), m = d(":dels"), h = n.type, g = n.type === "deleteRange" ? [n.range] : n.type === "delete" ? [n.keys] : n.values.length < 50 ? [Kr(l, n).filter(function(e) {
								return e != null;
							}), n.values] : [], _ = g[0], v = g[1], y = n.trans._cache;
							if (o(_)) {
								f.addKeys(_);
								var b = h === "delete" || _.length === v.length ? Yr(_, y) : null;
								b || m.addKeys(_), (b || v) && ei(d, c, b, v);
							} else if (_) {
								var x = {
									from: _.lower ?? e.MIN_KEY,
									to: _.upper ?? e.MAX_KEY
								};
								m.add(x), f.add(x);
							} else f.add(r), m.add(r), c.indexes.forEach(function(e) {
								return d(e.name).add(r);
							});
							return s.mutate(n).then(function(e) {
								return _ && (n.type === "add" || n.type === "put") && (f.addKeys(e.results), p && p.forEach(function(t) {
									for (var r = n.values.map(function(e) {
										return t.extractKey(e);
									}), i = t.keyPath.findIndex(function(e) {
										return e === l.keyPath;
									}), a = 0, o = e.results.length; a < o; ++a) r[a][i] = e.results[a];
									d(t.name).addKeys(r);
								})), a.mutatedParts = jr(a.mutatedParts || {}, u), e;
							});
						} }), h = function(t) {
							var n = t.query, r = n.index, i = n.range;
							return [r, new wr(i.lower ?? e.MIN_KEY, i.upper ?? e.MAX_KEY)];
						}, g = {
							get: function(e) {
								return [l, new wr(e.key)];
							},
							getMany: function(e) {
								return [l, new wr().addKeys(e.keys)];
							},
							count: h,
							query: h,
							openCursor: h
						};
						return a(g).forEach(function(e) {
							m[e] = function(a) {
								var o = P.subscr, c = !!o, l = Zr(P, s) && Qr(e, a) ? a.obsSet = {} : o;
								if (c) {
									var u = function(e) {
										var n = `idb://${t}/${i}/${e}`;
										return l[n] || (l[n] = new wr());
									}, p = u(""), m = u(":dels"), h = g[e](a), _ = h[0], v = h[1];
									if (e === "query" && _.isPrimaryKey && !a.values ? m.add(v) : u(_.name || "").add(v), !_.isPrimaryKey) {
										if (e === "count") m.add(r);
										else {
											var y = e === "query" && f && a.values && s.query(n(n({}, a), { values: !1 }));
											return s[e].apply(this, arguments).then(function(t) {
												if (e === "query") {
													if (f && a.values) return y.then(function(e) {
														var n = e.result;
														return p.addKeys(n), t;
													});
													var n = a.values ? t.result.map(d) : t.result;
													a.values ? p.addKeys(n) : m.addKeys(n);
												} else if (e === "openCursor") {
													var r = t, i = a.values;
													return r && Object.create(r, {
														key: { get: function() {
															return m.addKey(r.primaryKey), r.key;
														} },
														primaryKey: { get: function() {
															var e = r.primaryKey;
															return m.addKey(e), e;
														} },
														value: { get: function() {
															return i && p.addKey(r.primaryKey), r.value;
														} }
													});
												}
												return t;
											});
										}
									}
								}
								return s[e].apply(this, arguments);
							};
						}), m;
					}
				});
			}
		};
		function ei(e, t, n, r) {
			function i(t) {
				var i = e(t.name || "");
				function a(e) {
					return e == null ? null : t.extractKey(e);
				}
				var s = function(e) {
					return t.multiEntry && o(e) ? e.forEach(function(e) {
						return i.addKey(e);
					}) : i.addKey(e);
				};
				(n || r).forEach(function(e, t) {
					var i = n && a(n[t]), o = r && a(r[t]);
					qt(i, o) !== 0 && (i != null && s(i), o != null && s(o));
				});
			}
			t.indexes.forEach(i);
		}
		function ti(e, t, r) {
			if (r.numFailures === 0) return t;
			if (t.type === "deleteRange") return null;
			var i = t.keys ? t.keys.length : "values" in t && t.values ? t.values.length : 1;
			if (r.numFailures === i) return null;
			var a = n({}, t);
			return o(a.keys) && (a.keys = a.keys.filter(function(e, t) {
				return !(t in r.failures);
			})), "values" in a && o(a.values) && (a.values = a.values.filter(function(e, t) {
				return !(t in r.failures);
			})), a;
		}
		function ni(e, t) {
			return t.lower === void 0 ? !0 : t.lowerOpen ? qt(e, t.lower) > 0 : qt(e, t.lower) >= 0;
		}
		function ri(e, t) {
			return t.upper === void 0 ? !0 : t.upperOpen ? qt(e, t.upper) < 0 : qt(e, t.upper) <= 0;
		}
		function ii(e, t) {
			return ni(e, t) && ri(e, t);
		}
		function ai(e, t, n, r, i, a) {
			if (!n || n.length === 0) return e;
			var s = t.query.index, c = s.multiEntry, l = t.query.range, u = r.schema.primaryKey.extractKey, d = s.extractKey, f = (s.lowLevelIndex || s).extractKey, p = n.reduce(function(e, n) {
				var r = e, i = [];
				if (n.type === "add" || n.type === "put") for (var a = new wr(), s = n.values.length - 1; s >= 0; --s) {
					var f = n.values[s], p = u(f);
					if (!a.hasKey(p)) {
						var m = d(f);
						(c && o(m) ? m.some(function(e) {
							return ii(e, l);
						}) : ii(m, l)) && (a.addKey(p), i.push(f));
					}
				}
				switch (n.type) {
					case "add":
						var h = new wr().addKeys(t.values ? e.map(function(e) {
							return u(e);
						}) : e);
						r = e.concat(t.values ? i.filter(function(e) {
							var t = u(e);
							return !h.hasKey(t) && (h.addKey(t), !0);
						}) : i.map(function(e) {
							return u(e);
						}).filter(function(e) {
							return !h.hasKey(e) && (h.addKey(e), !0);
						}));
						break;
					case "put":
						var g = new wr().addKeys(n.values.map(function(e) {
							return u(e);
						}));
						r = e.filter(function(e) {
							return !g.hasKey(t.values ? u(e) : e);
						}).concat(t.values ? i : i.map(function(e) {
							return u(e);
						}));
						break;
					case "delete":
						var _ = new wr().addKeys(n.keys);
						r = e.filter(function(e) {
							return !_.hasKey(t.values ? u(e) : e);
						});
						break;
					case "deleteRange":
						var v = n.range;
						r = e.filter(function(e) {
							return !ii(u(e), v);
						});
				}
				return r;
			}, e);
			if (p === e) return e;
			var m = function(e, t) {
				return qt(f(e), f(t)) || qt(u(e), u(t));
			};
			return p.sort(t.direction === "prev" || t.direction === "prevunique" ? function(e, t) {
				return m(t, e);
			} : m), t.limit && t.limit < Infinity && (p.length > t.limit ? p.length = t.limit : e.length === t.limit && p.length < t.limit && (i.dirty = !0)), a ? Object.freeze(p) : p;
		}
		function oi(e, t) {
			return qt(e.lower, t.lower) === 0 && qt(e.upper, t.upper) === 0 && !!e.lowerOpen == !!t.lowerOpen && !!e.upperOpen == !!t.upperOpen;
		}
		function si(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : -1;
			if (t === void 0) return 1;
			var i = qt(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return 1;
				if (r) return -1;
			}
			return i;
		}
		function ci(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : 1;
			if (t === void 0) return -1;
			var i = qt(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return -1;
				if (r) return 1;
			}
			return i;
		}
		function li(e, t) {
			return si(e.lower, t.lower, e.lowerOpen, t.lowerOpen) <= 0 && ci(e.upper, t.upper, e.upperOpen, t.upperOpen) >= 0;
		}
		function ui(e, t, n, r) {
			var i = Nr[`idb://${e}/${t}`];
			if (!i) return [];
			var a = i.queries[n];
			if (!a) return [
				null,
				!1,
				i,
				null
			];
			var o = a[(r.query ? r.query.index.name : null) || ""];
			if (!o) return [
				null,
				!1,
				i,
				null
			];
			switch (n) {
				case "query":
					var s = r.direction ?? "next", c = o.find(function(e) {
						return e.req.limit === r.limit && e.req.values === r.values && (e.req.direction ?? "next") === s && oi(e.req.query.range, r.query.range);
					});
					return c ? [
						c,
						!0,
						i,
						o
					] : [
						o.find(function(e) {
							return ("limit" in e.req ? e.req.limit : Infinity) >= r.limit && (e.req.direction ?? "next") === s && (!r.values || e.req.values) && li(e.req.query.range, r.query.range);
						}),
						!1,
						i,
						o
					];
				case "count":
					var l = o.find(function(e) {
						return oi(e.req.query.range, r.query.range);
					});
					return [
						l,
						!!l,
						i,
						o
					];
			}
		}
		function di(e, t, n, r) {
			e.subscribers.add(n), r.addEventListener("abort", function() {
				e.subscribers.delete(n), e.subscribers.size === 0 && fi(e, t);
			});
		}
		function fi(e, t) {
			setTimeout(function() {
				e.subscribers.size === 0 && k(t, e);
			}, 3e3);
		}
		var pi = {
			stack: "dbcore",
			level: 0,
			name: "Cache",
			create: function(e) {
				var t = e.schema.name;
				return n(n({}, e), {
					transaction: function(n, r, i) {
						var a = e.transaction(n, r, i);
						if (r === "readwrite") {
							var o = new AbortController(), s = o.signal, c = function(i) {
								return function() {
									if (o.abort(), r === "readwrite") {
										for (var s = /* @__PURE__ */ new Set(), c = 0, l = n; c < l.length; c++) {
											var u = l[c], d = Nr[`idb://${t}/${u}`];
											if (d) {
												var f = e.table(u), p = d.optimisticOps.filter(function(e) {
													return e.trans === a;
												});
												if (a._explicit && i && a.mutatedParts) for (var m = 0, h = Object.values(d.queries.query); m < h.length; m++) for (var g = h[m], _ = 0, v = g.slice(); _ < v.length; _++) {
													var y = v[_];
													Mr(y.obsSet, a.mutatedParts) && (k(g, y), y.subscribers.forEach(function(e) {
														return s.add(e);
													}));
												}
												else if (p.length > 0) {
													d.optimisticOps = d.optimisticOps.filter(function(e) {
														return e.trans !== a;
													});
													for (var b = 0, x = Object.values(d.queries.query); b < x.length; b++) for (var g = x[b], S = 0, C = g.slice(); S < C.length; S++) {
														var y = C[S];
														if (y.res != null && a.mutatedParts) {
															if (i && !y.dirty) {
																var w = Object.isFrozen(y.res), T = ai(y.res, y.req, p, f, y, w);
																y.dirty ? (k(g, y), y.subscribers.forEach(function(e) {
																	return s.add(e);
																})) : T !== y.res && (y.res = T, y.promise = I.resolve({ result: T }));
															} else y.dirty && k(g, y), y.subscribers.forEach(function(e) {
																return s.add(e);
															});
														}
													}
												}
											}
										}
										s.forEach(function(e) {
											return e();
										});
									}
								};
							};
							a.addEventListener("abort", c(!1), { signal: s }), a.addEventListener("error", c(!1), { signal: s }), a.addEventListener("complete", c(!0), { signal: s });
						}
						return a;
					},
					table: function(r) {
						var i = e.table(r), a = i.schema.primaryKey;
						return n(n({}, i), {
							mutate: function(e) {
								var o = P.trans;
								if (a.outbound || o.db._options.cache === "disabled" || o.explicit || o.idbtrans.mode !== "readwrite") return i.mutate(e);
								var s = Nr[`idb://${t}/${r}`];
								if (!s) return i.mutate(e);
								var c = i.mutate(e);
								return (e.type === "add" || e.type === "put") && (e.values.length >= 50 || Kr(a, e).some(function(e) {
									return e == null;
								})) ? c.then(function(t) {
									var r = ti(s, n(n({}, e), { values: e.values.map(function(e, r) {
										if (t.failures[r]) return e;
										var i = a.keyPath?.includes(".") ? ie(e) : n({}, e);
										return w(i, a.keyPath, t.results[r]), i;
									}) }), t);
									s.optimisticOps.push(r), queueMicrotask(function() {
										return e.mutatedParts && Ir(e.mutatedParts);
									});
								}) : (s.optimisticOps.push(e), e.mutatedParts && Ir(e.mutatedParts), c.then(function(t) {
									if (t.numFailures > 0) {
										k(s.optimisticOps, e);
										var n = ti(s, e, t);
										n && s.optimisticOps.push(n), e.mutatedParts && Ir(e.mutatedParts);
									}
								}), c.catch(function() {
									k(s.optimisticOps, e), e.mutatedParts && Ir(e.mutatedParts);
								})), c;
							},
							query: function(e) {
								if (!Zr(P, i) || !Qr("query", e)) return i.query(e);
								var n = P.trans?.db._options.cache === "immutable", a = P, o = a.requery, s = a.signal, c = ui(t, r, "query", e), l = c[0], u = c[1], d = c[2], f = c[3];
								if (l && u) l.obsSet = e.obsSet;
								else {
									var p = i.query(e).then(function(e) {
										var t = e.result;
										if (l && (l.res = t), n) {
											for (var r = 0, i = t.length; r < i; ++r) Object.freeze(t[r]);
											Object.freeze(t);
										}
										return e;
									}).catch(function(e) {
										return f && l && k(f, l), Promise.reject(e);
									});
									l = {
										obsSet: e.obsSet,
										promise: p,
										subscribers: /* @__PURE__ */ new Set(),
										type: "query",
										req: e,
										dirty: !1
									}, f ? f.push(l) : (f = [l], d ||= Nr[`idb://${t}/${r}`] = {
										queries: {
											query: {},
											count: {}
										},
										objs: /* @__PURE__ */ new Map(),
										optimisticOps: [],
										unsignaledParts: {}
									}, d.queries.query[e.query.index.name || ""] = f);
								}
								return di(l, f, o, s), l.promise.then(function(t) {
									var r = ai(t.result, e, d?.optimisticOps, i, l, n);
									return { result: n ? r : ie(r) };
								});
							}
						});
					}
				});
			}
		};
		function mi(e, t) {
			return new Proxy(e, { get: function(e, n, r) {
				return n === "db" ? t : Reflect.get(e, n, r);
			} });
		}
		var hi = function() {
			function e(t, r) {
				var i = this;
				this._middlewares = {}, this.verno = 0;
				var a = e.dependencies;
				this._options = r = n({
					addons: e.addons,
					autoOpen: !0,
					indexedDB: a.indexedDB,
					IDBKeyRange: a.IDBKeyRange,
					cache: "cloned",
					maxConnections: zt
				}, r), this._deps = {
					indexedDB: r.indexedDB,
					IDBKeyRange: r.IDBKeyRange
				};
				var o = r.addons;
				this._dbSchema = {}, this._versions = [], this._storeNames = [], this._allTables = {}, this.idbdb = null, this._novip = this;
				var s = {
					dbOpenError: null,
					isBeingOpened: !1,
					onReadyBeingFired: null,
					openComplete: !1,
					dbReadyResolve: N,
					dbReadyPromise: null,
					cancelOpen: N,
					openCanceller: null,
					autoSchema: !0,
					PR1398_maxLoop: 3,
					autoOpen: r.autoOpen
				};
				s.dbReadyPromise = new I(function(e) {
					s.dbReadyResolve = e;
				}), s.openCanceller = new I(function(e, t) {
					s.cancelOpen = t;
				}), this._state = s, this.name = t, this.on = nn(this, "populate", "blocked", "versionchange", "close", { ready: [je, N] }), this.once = function(e, t) {
					var n = function() {
						var r = [...arguments];
						i.on(e).unsubscribe(n), t.apply(i, r);
					};
					return i.on(e, n);
				}, this.on.ready.subscribe = y(this.on.ready.subscribe, function(t) {
					return function(n, r) {
						e.vip(function() {
							var e = i._state;
							if (e.openComplete) e.dbOpenError || I.resolve().then(n), r && t(n);
							else if (e.onReadyBeingFired) e.onReadyBeingFired.push(n), r && t(n);
							else {
								t(n);
								var a = i;
								r || t(function e() {
									a.on.ready.unsubscribe(n), a.on.ready.unsubscribe(e);
								});
							}
						});
					};
				}), this.Collection = gn(this), this.Table = an(this), this.Transaction = Pn(this), this.Version = fr(this), this.WhereClause = On(this), this.on("versionchange", function(e) {
					e.newVersion > 0 ? console.warn(`Another connection wants to upgrade database '${i.name}'. Closing db now to resume the upgrade.`) : console.warn(`Another connection wants to delete database '${i.name}'. Closing db now to resume the delete request.`), i.close({ disableAutoOpen: !1 });
				}), this.on("blocked", function(e) {
					!e.newVersion || e.newVersion < e.oldVersion ? console.warn(`Dexie.delete('${i.name}') was blocked`) : console.warn(`Upgrade '${i.name}' blocked by other connection holding version ${e.oldVersion / 10}`);
				}), this._maxKey = Rn(r.IDBKeyRange), this._createTransaction = function(e, t, n, r) {
					return new i.Transaction(e, t, n, i._options.chromeTransactionDurability, r);
				}, this._fireOnBlocked = function(e) {
					i.on("blocked").fire(e), pr.toArray().filter(function(e) {
						return e.name === i.name && e !== i && !e._state.vcFired;
					}).map(function(t) {
						return t.on("versionchange").fire(e);
					});
				}, this.use(Xr), this.use(pi), this.use($r), this.use(Wr), this.use(qr);
				var c = new Proxy(this, { get: function(e, t, n) {
					if (t === "_vip") return !0;
					if (t === "table") return function(e) {
						return mi(i.table(e), c);
					};
					var r = Reflect.get(e, t, n);
					return r instanceof tn ? mi(r, c) : t === "tables" ? r.map(function(e) {
						return mi(e, c);
					}) : t === "_createTransaction" ? function() {
						return mi(r.apply(this, arguments), c);
					} : r;
				} });
				this.vip = c, o.forEach(function(e) {
					return e(i);
				});
			}
			return e.prototype.version = function(e) {
				if (isNaN(e) || e < .1) throw new M.Type("Given version is not a positive number");
				if (e = Math.round(e * 10) / 10, this.idbdb || this._state.isBeingOpened) throw new M.Schema("Cannot add version when database is open");
				this.verno = Math.max(this.verno, e);
				var t = this._versions, n = t.filter(function(t) {
					return t._cfg.version === e;
				})[0];
				return n || (n = new this.Version(e), t.push(n), t.sort(Xn), n.stores({}), this._state.autoSchema = !1, n);
			}, e.prototype._whenReady = function(e) {
				var t = this;
				return this.idbdb && (this._state.openComplete || P.letThrough || this._vip) ? e() : new I(function(e, n) {
					if (t._state.openComplete) return n(new M.DatabaseClosed(t._state.dbOpenError));
					if (!t._state.isBeingOpened) {
						if (!t._state.autoOpen) {
							n(new M.DatabaseClosed());
							return;
						}
						t.open().catch(N);
					}
					t._state.dbReadyPromise.then(e, n);
				}).then(e);
			}, e.prototype.use = function(e) {
				var t = e.stack, n = e.create, r = e.level, i = e.name;
				i && this.unuse({
					stack: t,
					name: i
				});
				var a = this._middlewares[t] || (this._middlewares[t] = []);
				return a.push({
					stack: t,
					create: n,
					level: r ?? 10,
					name: i
				}), a.sort(function(e, t) {
					return e.level - t.level;
				}), this;
			}, e.prototype.unuse = function(e) {
				var t = e.stack, n = e.name, r = e.create;
				return t && this._middlewares[t] && (this._middlewares[t] = this._middlewares[t].filter(function(e) {
					return r ? e.create !== r : n ? e.name !== n : !1;
				})), this;
			}, e.prototype.open = function() {
				var e = this;
				return kt(Xe, function() {
					return zr(e);
				});
			}, e.prototype._close = function() {
				this.on.close.fire(new CustomEvent("close"));
				var e = this._state;
				if (pr.remove(this), this.idbdb) {
					try {
						this.idbdb.close();
					} catch {}
					this.idbdb = null;
				}
				e.isBeingOpened || (e.dbReadyPromise = new I(function(t) {
					e.dbReadyResolve = t;
				}), e.openCanceller = new I(function(t, n) {
					e.cancelOpen = n;
				}));
			}, e.prototype.close = function(e) {
				var t = (e === void 0 ? { disableAutoOpen: !0 } : e).disableAutoOpen, n = this._state;
				t ? (n.isBeingOpened && n.cancelOpen(new M.DatabaseClosed()), this._close(), n.autoOpen = !1, n.dbOpenError = new M.DatabaseClosed()) : (this._close(), n.autoOpen = this._options.autoOpen || n.isBeingOpened, n.openComplete = !1, n.dbOpenError = null);
			}, e.prototype.delete = function(e) {
				var t = this;
				e === void 0 && (e = { disableAutoOpen: !0 });
				var n = arguments.length > 0 && typeof arguments[0] != "object", r = this._state;
				return new I(function(i, a) {
					var o = function() {
						t.close(e);
						var n = t._deps.indexedDB.deleteDatabase(t.name);
						n.onsuccess = mt(function() {
							yr(t._deps, t.name), i();
						}), n.onerror = kn(a), n.onblocked = t._fireOnBlocked;
					};
					if (n) throw new M.InvalidArgument("Invalid closeOptions argument to db.delete()");
					r.isBeingOpened ? r.dbReadyPromise.then(o) : o();
				});
			}, e.prototype.backendDB = function() {
				return this.idbdb;
			}, e.prototype.isOpen = function() {
				return this.idbdb !== null;
			}, e.prototype.hasBeenClosed = function() {
				var e = this._state.dbOpenError;
				return e && e.name === "DatabaseClosedError";
			}, e.prototype.hasFailed = function() {
				return this._state.dbOpenError !== null;
			}, e.prototype.dynamicallyOpened = function() {
				return this._state.autoSchema;
			}, Object.defineProperty(e.prototype, "tables", {
				get: function() {
					var e = this;
					return a(this._allTables).map(function(t) {
						return e._allTables[t];
					});
				},
				enumerable: !1,
				configurable: !0
			}), e.prototype.transaction = function() {
				var e = Vr.apply(this, arguments);
				return this._transaction.apply(this, e);
			}, e.prototype._transaction = function(e, t, n) {
				var r = this, i = P.trans;
				i && i.db === this && e.indexOf("!") === -1 || (i = null);
				var a = e.indexOf("?") !== -1;
				e = e.replace("!", "").replace("?", "");
				var o, s;
				try {
					if (s = t.map(function(e) {
						var t = e instanceof r.Table ? e.name : e;
						if (typeof t != "string") throw TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
						return t;
					}), e == "r" || e === Vt) o = Vt;
					else if (e == "rw" || e == Ht) o = Ht;
					else throw new M.InvalidArgument("Invalid transaction mode: " + e);
					if (i) {
						if (i.mode === Vt && o === Ht) {
							if (a) i = null;
							else throw new M.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
						}
						i && s.forEach(function(e) {
							if (i && i.storeNames.indexOf(e) === -1) {
								if (a) i = null;
								else throw new M.SubTransaction("Table " + e + " not included in parent transaction.");
							}
						}), a && i && !i.active && (i = null);
					}
				} catch (e) {
					return i ? i._promise(null, function(t, n) {
						n(e);
					}) : Mt(e);
				}
				var c = z.bind(null, this, o, s, i, n);
				return i ? i._promise(o, c, "lock") : P.trans ? kt(P.transless, function() {
					return r._whenReady(c);
				}) : this._whenReady(c);
			}, e.prototype.table = function(e) {
				if (!u(this._allTables, e)) throw new M.InvalidTable(`Table ${e} does not exist`);
				return this._allTables[e];
			}, e;
		}(), gi = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable", _i = function() {
			function e(e) {
				this._subscribe = e;
			}
			return e.prototype.subscribe = function(e, t, n) {
				return this._subscribe(!e || typeof e == "function" ? {
					next: e,
					error: t,
					complete: n
				} : e);
			}, e.prototype[gi] = function() {
				return this;
			}, e;
		}(), vi;
		try {
			vi = {
				indexedDB: i.indexedDB || i.mozIndexedDB || i.webkitIndexedDB || i.msIndexedDB,
				IDBKeyRange: i.IDBKeyRange || i.webkitIDBKeyRange
			};
		} catch {
			vi = {
				indexedDB: null,
				IDBKeyRange: null
			};
		}
		function yi(e) {
			var t = !1, n, r = new _i(function(r) {
				var i = de(e);
				function a(t) {
					var n = st();
					try {
						i && St();
						var r = xt(e, t);
						return i && (r = r.finally(Ct)), r;
					} finally {
						n && ct();
					}
				}
				var o = !1, s, c = {}, l = {}, u = {
					get closed() {
						return o;
					},
					unsubscribe: function() {
						o || (o = !0, s && s.abort(), d && Nn.storagemutated.unsubscribe(m));
					}
				};
				r.start && r.start(u);
				var d = !1, f = function() {
					return jt(h);
				};
				function p() {
					return Mr(l, c);
				}
				var m = function(e) {
					jr(c, e), p() && f();
				}, h = function() {
					if (!o && vi.indexedDB) {
						c = {};
						var i = {};
						s && s.abort(), s = new AbortController();
						var u = {
							subscr: i,
							signal: s.signal,
							requery: f,
							querier: e,
							trans: null
						}, h = a(u);
						d ||= (Nn.storagemutated.subscribe(m), !0), Promise.resolve(h).then(function(e) {
							t = !0, n = e, !(o || u.signal.aborted) && (p() ? f() : (l = i, p() ? f() : (c = {}, jt(function() {
								return !o && r.next && r.next(e);
							}))));
						}, function(e) {
							o || u.signal.aborted || (t = !1, ["DatabaseClosedError", "AbortError"].includes(e?.name) || o || jt(function() {
								o || r.error && r.error(e);
							}));
						});
					}
				};
				return setTimeout(f, 0), u;
			});
			return r.hasValue = function() {
				return t;
			}, r.getValue = function() {
				return n;
			}, r;
		}
		var bi = hi;
		d(bi, n(n({}, Ce), {
			delete: function(e) {
				return new bi(e, { addons: [] }).delete();
			},
			exists: function(e) {
				return new bi(e, { addons: [] }).open().then(function(e) {
					return e.close(), !0;
				}).catch("NoSuchDatabaseError", function() {
					return !1;
				});
			},
			getDatabaseNames: function(e) {
				try {
					return _r(bi.dependencies).then(e);
				} catch {
					return Mt(new M.MissingAPI());
				}
			},
			defineClass: function() {
				function e(e) {
					s(this, e);
				}
				return e;
			},
			ignoreTransaction: function(e) {
				return P.trans ? kt(P.transless || Xe, e) : e();
			},
			vip: br,
			async: function(e) {
				return function() {
					try {
						var t = Br(e.apply(this, arguments));
						return !t || typeof t.then != "function" ? I.resolve(t) : t;
					} catch (e) {
						return Mt(e);
					}
				};
			},
			spawn: function(e, t, n) {
				try {
					var r = Br(e.apply(n, t || []));
					return !r || typeof r.then != "function" ? I.resolve(r) : r;
				} catch (e) {
					return Mt(e);
				}
			},
			currentTransaction: { get: function() {
				return P.trans || null;
			} },
			waitFor: function(e, t) {
				var n = I.resolve(typeof e == "function" ? bi.ignoreTransaction(e) : e).timeout(t || 6e4);
				return P.trans ? P.trans.waitFor(n) : n;
			},
			Promise: I,
			debug: {
				get: function() {
					return Me;
				},
				set: function(e) {
					Ne(e);
				}
			},
			derive: m,
			extend: s,
			props: d,
			override: y,
			Events: nn,
			on: Nn,
			liveQuery: yi,
			extendObservabilitySet: jr,
			getByKeyPath: C,
			setByKeyPath: w,
			delByKeyPath: T,
			shallowClone: E,
			deepClone: ie,
			getObjectDiff: Gr,
			cmp: qt,
			asap: x,
			minKey: It,
			addons: [],
			connections: { get: pr.toArray },
			errnames: ye,
			dependencies: vi,
			cache: Nr,
			semVer: Pt,
			version: Pt.split(".").map(function(e) {
				return parseInt(e);
			}).reduce(function(e, t, n) {
				return e + t / 10 ** (n * 2);
			})
		})), bi.maxKey = Rn(bi.dependencies.IDBKeyRange), typeof dispatchEvent < "u" && typeof addEventListener < "u" && (Nn(jn, function(e) {
			if (!Si) {
				var t = new CustomEvent(Mn, { detail: e });
				Si = !0, dispatchEvent(t), Si = !1;
			}
		}), addEventListener(Mn, function(e) {
			var t = e.detail;
			Si || xi(t);
		}));
		function xi(e) {
			var t = Si;
			try {
				Si = !0, Nn.storagemutated.fire(e), Lr(e, !0);
			} finally {
				Si = t;
			}
		}
		var Si = !1, Ci, wi = function() {};
		typeof BroadcastChannel < "u" && (wi = function() {
			Ci = new BroadcastChannel(Mn), Ci.onmessage = function(e) {
				return e.data && xi(e.data);
			};
		}, wi(), typeof Ci.unref == "function" && Ci.unref(), Nn(jn, function(e) {
			Si || Ci.postMessage(e);
		})), typeof addEventListener < "u" && (addEventListener("pagehide", function(e) {
			if (!hi.disableBfCache && e.persisted) {
				Me && console.debug("Dexie: handling persisted pagehide"), Ci?.close();
				for (var t = 0, n = pr.toArray(); t < n.length; t++) n[t].close({ disableAutoOpen: !1 });
			}
		}), addEventListener("pageshow", function(e) {
			!hi.disableBfCache && e.persisted && (Me && console.debug("Dexie: handling persisted pageshow"), wi(), xi({ all: new wr(-Infinity, [[]]) }));
		}));
		function Ti(e) {
			return new $t({ add: e });
		}
		function Ei(e) {
			return new $t({ remove: e });
		}
		function Di(e, t) {
			return new $t({ replacePrefix: [e, t] });
		}
		return I.rejectionMapper = Se, Ne(Me), n(hi, /* @__PURE__ */ Object.freeze({
			__proto__: null,
			DEFAULT_MAX_CONNECTIONS: zt,
			Dexie: hi,
			Entity: Kt,
			PropModification: $t,
			RangeSet: wr,
			add: Ti,
			cmp: qt,
			default: hi,
			liveQuery: yi,
			mergeRanges: Er,
			rangesOverlap: Dr,
			remove: Ei,
			replacePrefix: Di
		}), { default: hi }), hi;
	}));
})))(), 1), Eb = Symbol.for("Dexie"), Db = globalThis[Eb] || (globalThis[Eb] = Tb.default);
if (Tb.default.semVer !== Db.semVer) throw Error(`Two different versions of Dexie loaded in the same app: ${Tb.default.semVer} and ${Db.semVer}`);
var { liveQuery: Ob, mergeRanges: kb, rangesOverlap: Ab, RangeSet: jb, cmp: Mb, Entity: Nb, PropModification: Pb, replacePrefix: Fb, add: Ib, remove: Lb, DexieYProvider: Rb } = Db, zb = "tavern-trpg-library", Bb = class extends Db {
	files;
	kv;
	sets;
	derived;
	manage;
	constructor(e = zb) {
		super(e), this.version(1).stores({
			files: "[source+path], source",
			kv: "[scope+key], scope",
			sets: "id",
			derived: "key"
		}), this.version(2).stores({ manage: "[kind+key], kind" }), this.version(3).stores({}).upgrade((e) => e.table("derived").where("key").startsWith("pre:").delete());
	}
}, Vb = (e) => e / 2 ** 32 | 0, Hb = (e) => e >>> 0;
function Ub(e, t, n, r) {
	let i = Vb(n), a = Hb(n);
	e.setUint32(t, r ? a : i, r), e.setUint32(t + 4, r ? i : a, r);
}
// node_modules/@noble/hashes/utils.js
function Wb(e) {
	return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
var Gb = (e) => e ? `"${e}" ` : "";
function Kb(e, t = "") {
	if (typeof e != "number") throw TypeError(Gb(t) + "expected number, got " + typeof e);
	if (!Number.isSafeInteger(e) || e < 0) throw RangeError(Gb(t) + "expected integer >= 0, got " + e);
	return e;
}
function qb(e, t, n = "") {
	if (Wb(e) && (t === void 0 || e.length === t)) return e;
	t !== void 0 && Kb(t, "length");
	let r = Wb(e), i = t === void 0 ? "" : ` of length ${t}`, a = r ? `length=${e.length}` : `type=${typeof e}`, o = Gb(n) + "expected Uint8Array" + i + ", got " + a;
	throw r ? RangeError(o) : TypeError(o);
}
var Jb = (e, t) => {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError((t === "object" ? "" : `"${t}" `) + "expected object, got type=" + typeof e);
}, Yb = (e, t) => {
	Jb(e, t);
	let n = Object.getPrototypeOf(e);
	if (n !== Object.prototype && n !== null) throw TypeError(`"${t}" expected plain object`);
	if (Object.hasOwn(e, "__proto__")) throw TypeError(`"${t}.__proto__" is not allowed`);
};
function Xb(e, t = !0) {
	if (e.destroyed) throw Error("hash was destroyed");
	if (t && e.finished) throw Error("digest() was already called");
}
function Zb(e, t) {
	qb(e, void 0, "output");
	let n = t.outputLen;
	if (!(e.length >= n)) throw RangeError("\"output\" expected length >= " + n);
}
function Qb(...e) {
	for (let t = 0; t < e.length; t++) e[t].fill(0);
}
function $b(e) {
	return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function ex(e, t) {
	return e << 32 - t | e >>> t;
}
function tx(e, t) {
	return e << t | e >>> 32 - t >>> 0;
}
var nx = typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", rx = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function ix(e) {
	if (qb(e), nx) return e.toHex();
	let t = "";
	for (let n = 0; n < e.length; n++) t += rx[e[n]];
	return t;
}
function ax(e) {
	if (typeof e != "string") throw TypeError("string expected");
	let t = new TextEncoder().encode(e);
	try {
		return new Uint8Array(t);
	} finally {
		Qb(t);
	}
}
function ox(e, t, n = "opts") {
	return Yb(e, "defaults"), t !== void 0 && Yb(t, n), Object.assign(Object.create(null), e, t);
}
function sx(e, t = {}) {
	if (typeof e != "function") throw TypeError("\"hashCons\" expected function, got type=" + typeof e);
	t = ox({}, t, "info");
	let n = (t, n) => e(n).update(t).digest(), r = e(void 0);
	return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.canXOF = r.canXOF, n.create = (t) => e(t), Object.assign(n, t), Object.freeze(n);
}
var cx = (e) => ({ oid: Uint8Array.from([
	6,
	9,
	96,
	134,
	72,
	1,
	101,
	3,
	4,
	2,
	e
]) });
// node_modules/@noble/hashes/_md.js
function lx(e, t, n) {
	return e & t ^ ~e & n;
}
function ux(e, t, n) {
	return e & t ^ e & n ^ t & n;
}
var dx = class {
	blockLen;
	outputLen;
	canXOF = !1;
	padOffset;
	isLE;
	buffer;
	view;
	finished = !1;
	length = 0;
	pos = 0;
	destroyed = !1;
	constructor(e, t, n, r) {
		this.blockLen = e, this.outputLen = t, this.padOffset = n, this.isLE = r, this.buffer = new Uint8Array(e), this.view = $b(this.buffer);
	}
	update(e) {
		Xb(this), qb(e);
		let { view: t, buffer: n, blockLen: r } = this, i = e.length, a = !1;
		for (let o = 0; o < i;) {
			let s = Math.min(r - this.pos, i - o);
			if (s === r) {
				let t = $b(e);
				for (; r <= i - o; o += r) this.process(t, o);
				a = !0;
			} else n.set(o === 0 && s === i ? e : e.subarray(o, o + s), this.pos), this.pos += s, o += s, this.pos === r && (this.process(t, 0), this.pos = 0, a = !0);
		}
		return this.length += e.length, a && this.roundClean(), this;
	}
	digestInto(e) {
		Xb(this), Zb(e, this), this.finished = !0;
		let { buffer: t, view: n, blockLen: r, isLE: i } = this, { pos: a } = this;
		t[a++] = 128, t.fill(0, a), this.padOffset > r - a && (this.process(n, 0), t.fill(0)), Ub(n, r - 8, this.length * 8, i), this.process(n, 0), this.roundClean();
		let o = e === t ? n : $b(e), s = this.outputLen, c = s / 4, l = this.get();
		if (s % 4 || c > l.length) throw Error("invalid outputLen");
		for (let e = 0; e < c; e++) o.setUint32(4 * e, l[e], i);
	}
	digest() {
		let { buffer: e, outputLen: t } = this;
		this.digestInto(e);
		let n = e.slice(0, t);
		return this.destroy(), n;
	}
	_cloneIntoMeta(e) {
		let { buffer: t, length: n, finished: r, destroyed: i, pos: a } = this;
		return e.destroyed = i, e.finished = r, e.length = n, e.pos = a, a && e.buffer.set(t), e;
	}
	clone() {
		return this._cloneInto();
	}
}, fx = /* @__PURE__ */ Uint32Array.from([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]), px = /* @__PURE__ */ Uint32Array.from([
	1732584193,
	4023233417,
	2562383102,
	271733878,
	3285377520
]), mx = /* @__PURE__ */ new Uint32Array(80), hx = class extends dx {
	A = px[0] | 0;
	B = px[1] | 0;
	C = px[2] | 0;
	D = px[3] | 0;
	E = px[4] | 0;
	constructor() {
		super(64, 20, 8, !1);
	}
	get() {
		let { A: e, B: t, C: n, D: r, E: i } = this;
		return [
			e,
			t,
			n,
			r,
			i
		];
	}
	set(e, t, n, r, i) {
		this.A = e | 0, this.B = t | 0, this.C = n | 0, this.D = r | 0, this.E = i | 0;
	}
	_cloneInto(e) {
		return (e ||= new this.constructor()).set(...this.get()), this._cloneIntoMeta(e);
	}
	process(e, t) {
		for (let n = 0; n < 16; n++, t += 4) mx[n] = e.getUint32(t, !1);
		for (let e = 16; e < 80; e++) mx[e] = tx(mx[e - 3] ^ mx[e - 8] ^ mx[e - 14] ^ mx[e - 16], 1);
		let { A: n, B: r, C: i, D: a, E: o } = this;
		for (let e = 0; e < 80; e++) {
			let t, s;
			e < 20 ? (t = lx(r, i, a), s = 1518500249) : e < 40 ? (t = r ^ i ^ a, s = 1859775393) : e < 60 ? (t = ux(r, i, a), s = 2400959708) : (t = r ^ i ^ a, s = 3395469782);
			let c = tx(n, 5) + t + o + s + mx[e] | 0;
			o = a, a = i, i = tx(r, 30), r = n, n = c;
		}
		n = n + this.A | 0, r = r + this.B | 0, i = i + this.C | 0, a = a + this.D | 0, o = o + this.E | 0, this.set(n, r, i, a, o);
	}
	roundClean() {
		Qb(mx);
	}
	destroy() {
		this.destroyed = !0, this.set(0, 0, 0, 0, 0), Qb(this.buffer);
	}
}, gx = /* @__PURE__ */ sx(() => new hx());
// src/library/fetcher.ts
function _x(e) {
	let t = ax(`blob ${e.length}\0`), n = new Uint8Array(t.length + e.length);
	return n.set(t), n.set(e, t.length), ix(gx(n));
}
async function vx(e, t, n, r = fetch) {
	let i = [];
	for (let a of e) {
		let e = `${a}${t}`;
		try {
			let t = await r(e);
			if (!t.ok) {
				i.push({
					url: e,
					reason: `HTTP ${t.status}`
				});
				continue;
			}
			let a = new Uint8Array(await t.arrayBuffer()), o = _x(a);
			if (n && o !== n.sha) {
				i.push({
					url: e,
					reason: `指纹不符：${o} ≠ ${n.sha}`
				});
				continue;
			}
			return {
				bytes: a,
				url: e,
				gitSha: o,
				skipped: i
			};
		} catch (t) {
			i.push({
				url: e,
				reason: t instanceof Error ? t.message : String(t)
			});
		}
	}
	throw Error(`所有地址都取不到 ${t}：${i.map((e) => `${e.url}（${e.reason}）`).join("；")}`);
}
async function yx(e, t = fetch) {
	let n = await t(e);
	if (!n.ok) throw Error(`取文件清单失败：HTTP ${n.status} ${e}`);
	let r = await n.json();
	if (r.truncated) throw Error(`文件清单被截断：${e}`);
	let i = {};
	for (let e of r.tree ?? []) e.type === "blob" && (i[e.path] = {
		sha: e.sha,
		size: e.size ?? 0
	});
	return i;
}
var bx = {
	codeSets: {
		cn: {
			repo: "tjliqy/5etools-cn",
			commit: "774a320e4a92d71d100673bc0df965661d9e8c1b",
			version: "2.39.0-cn.3",
			lang: "zh"
		},
		en: {
			repo: "5etools-mirror-3/5etools-src",
			commit: "8790755429c346d20020eed7826d312d484c393f",
			version: "2.39.0",
			lang: "en"
		}
	},
	sources: [
		{
			id: "cn-official",
			kind: "official",
			lang: "zh",
			codeSet: "cn",
			pair: "en-official",
			fileList: "https://api.github.com/repos/{repo}/git/trees/{commit}?recursive=1",
			mirrors: [
				"https://cdn.jsdelivr.net/gh/{repo}@{commit}/",
				"https://raw.githubusercontent.com/{repo}/{commit}/",
				"https://5e.kiwee.top/"
			]
		},
		{
			id: "en-official",
			kind: "official",
			lang: "en",
			codeSet: "en",
			pair: "cn-official",
			fileList: "https://api.github.com/repos/{repo}/git/trees/{commit}?recursive=1",
			mirrors: ["https://cdn.jsdelivr.net/gh/{repo}@{commit}/", "https://raw.githubusercontent.com/{repo}/{commit}/"]
		},
		{
			id: "cn-brew",
			kind: "brew",
			lang: "zh",
			codeSet: "cn",
			repo: "tjliqy/homebrew-deploy",
			mirrors: ["https://homebrew.kiwee.top/", "https://cdn.jsdelivr.net/gh/tjliqy/homebrew-deploy@master/"]
		},
		{
			id: "en-brew",
			kind: "brew",
			lang: "en",
			codeSet: "en",
			repo: "TheGiddyLimit/homebrew",
			mirrors: ["https://raw.githubusercontent.com/TheGiddyLimit/homebrew/master/", "https://cdn.jsdelivr.net/gh/TheGiddyLimit/homebrew@master/"]
		}
	]
}, xx = bx.codeSets, Sx = bx.sources;
function Cx(e) {
	let t = Sx.find((t) => t.id === e);
	if (!t) throw Error(`源登记表里没有：${e}`);
	return t;
}
function wx(e) {
	let t = Sx.find((t) => t.kind === "official" && t.codeSet === e);
	if (!t) throw Error(`作者程序 ${e} 没有登记对应的官方数据源`);
	return t;
}
function Tx(e, t) {
	let n = xx[t.codeSet];
	return e.replaceAll("{repo}", n.repo).replaceAll("{commit}", n.commit);
}
function Ex(e) {
	return e.mirrors.map((t) => Tx(t, e));
}
function Dx(e) {
	if (!e.fileList) throw Error(`${e.id} 没有登记文件清单地址`);
	return Tx(e.fileList, e);
}
function Ox(e) {
	return xx[e.codeSet].commit;
}
// src/library/files.ts
var kx = class {
	db;
	fetchImpl;
	lists = /* @__PURE__ */ new Map();
	constructor({ db: e, fetchImpl: t }) {
		this.db = e, this.fetchImpl = t ?? ((e) => fetch(e));
	}
	fileList(e) {
		let t = `filelist:${e.id}@${Ox(e)}`, n = this.lists.get(t);
		return n || (n = (async () => {
			let n = await this.db.derived.get(t);
			if (n) return n.value;
			let r = await yx(Dx(e), this.fetchImpl);
			return await this.db.derived.put({
				key: t,
				fingerprint: Ox(e),
				value: r,
				savedAt: Date.now()
			}), r;
		})(), n.catch(() => this.lists.delete(t)), this.lists.set(t, n)), n;
	}
	async local(e, t) {
		let n = await this.db.files.get([e.id, t]);
		return n && n.commit === Ox(e) ? n.text : null;
	}
	async get(e, t, { allowNetwork: n }) {
		let r = await this.local(e, t);
		if (r !== null || !n) return r;
		let i = (await this.fileList(e))[t];
		if (!i) return null;
		let a = await vx(Ex(e), t, i, this.fetchImpl), o = new TextDecoder("utf-8", { fatal: !0 }).decode(a.bytes);
		return await this.db.files.put({
			source: e.id,
			path: t,
			commit: Ox(e),
			text: o,
			gitSha: a.gitSha,
			size: a.bytes.length,
			savedAt: Date.now()
		}), o;
	}
};
// src/library/kernel-check.ts
function Ax(e) {
	return async (t, n) => (await e.fetch(n, t)).map((e) => ({
		ok: e.ok,
		ref: e.ref,
		reason: e.ok ? void 0 : e.reason
	}));
}
function jx(e) {
	return () => e.activeOverrides();
}
function Mx(e, t) {
	return async () => {
		let n = "", r = {};
		for (let i of Sx.filter((e) => e.kind === "official")) {
			let a = await e.sets.get(i.id);
			if (a?.status === "installed") {
				n ||= String(a.commit ?? a.updatedAt ?? "");
				for (let e of Sx.filter((e) => e.kind === "brew" && e.codeSet === i.codeSet)) for (let n of await t.brewInstalled(e.id)) {
					let t = `${e.id}:${String(n.head.docIdLocal ?? n.head.filename ?? "")}`;
					r[t] = String(n.head.checksum ?? n.head.version ?? n.head.dateAdded ?? n.head.filename ?? "");
				}
			}
		}
		return {
			official: n,
			brews: r
		};
	};
}
// src/library/runtime/handlers.ts
function Nx({ codeSet: e, db: t, files: n, allowNetwork: r, kvScope: i = e }) {
	let a = wx(e);
	return {
		file: (e) => n.get(a, e, { allowNetwork: r() }),
		kvGet: async (e) => (await t.kv.get([i, e]))?.value ?? null,
		kvSet: async (e, n) => {
			await t.kv.put({
				scope: i,
				key: e,
				value: n
			});
		},
		kvRemove: async (e) => {
			await t.kv.delete([i, e]);
		},
		localSnapshot: async () => Object.fromEntries((await t.kv.where("scope").equals(`${i}:local`).toArray()).map((e) => [e.key, e.value])),
		localSet: async (e, n) => {
			await t.kv.put({
				scope: `${i}:local`,
				key: e,
				value: n
			});
		},
		localRemove: async (e) => {
			await t.kv.delete([`${i}:local`, e]);
		}
	};
}
// src/library/runtime/host.ts
function Px(e, t) {
	return new URL(`vendor/${t}/frame.html`, e);
}
async function Fx(e, t) {
	switch (t.op) {
		case "file": return e.file(t.path);
		case "kv-get": return e.kvGet(t.key);
		case "kv-set": return e.kvSet(t.key, t.value);
		case "kv-remove": return e.kvRemove(t.key);
		case "local-set": return e.localSet(t.key, t.value);
		case "local-remove": return e.localRemove(t.key);
	}
}
async function Ix({ codeSet: e, pluginRoot: t, container: n, handlers: r, timeoutMs: i = 6e4 }) {
	let a = document.createElement("iframe");
	a.name = c + JSON.stringify(await r.localSnapshot()), a.dataset.trpgAuthorFrame = e, a.setAttribute("aria-hidden", "true"), a.tabIndex = -1, a.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden;pointer-events:none";
	let u = Px(t, e), d = `${e}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
	u.searchParams.set(s, d);
	let f = (e) => e.origin === u.origin && o(e.data) && "frame" in e.data && e.data.frame === d ? e.data : null, p = [];
	function m(e) {
		let t = f(e);
		if (!t || t.type !== "request") return;
		let n = t, i = (e) => {
			a.contentWindow?.postMessage({
				channel: l,
				type: "response",
				id: n.id,
				...e
			}, u.origin);
		};
		Fx(r, n).then((e) => i({
			ok: !0,
			value: e ?? null
		}), (e) => {
			let t = e instanceof Error ? e.message : String(e);
			p.push(`${n.op} ${"path" in n ? n.path : "key" in n ? n.key : ""}：${t}`), console.error("[trpg-library] 小窗要求处理失败", n, e), i({
				ok: !1,
				error: t
			});
		});
	}
	let h = 1, g = /* @__PURE__ */ new Map();
	function _(e) {
		let t = f(e);
		if (!t || t.type !== "result") return;
		let n = t, r = g.get(n.id);
		r && (g.delete(n.id), n.ok ? r.resolve(n.value) : r.reject(Error(n.error)));
	}
	addEventListener("message", m), addEventListener("message", _);
	let v = () => {
		removeEventListener("message", m), removeEventListener("message", _);
		for (let t of g.values()) t.reject(/* @__PURE__ */ Error(`作者小窗 ${e} 已关闭`));
		g.clear(), a.remove();
	}, y = ((e, ...t) => new Promise((n, r) => {
		let i = h++;
		g.set(i, {
			resolve: n,
			reject: r
		}), a.contentWindow?.postMessage({
			channel: l,
			type: "call",
			id: i,
			fn: e,
			args: t
		}, u.origin);
	}));
	return new Promise((t, r) => {
		let o = setTimeout(() => {
			removeEventListener("message", s), v(), r(/* @__PURE__ */ Error(`作者小窗 ${e} 在 ${i}ms 内没有就绪`));
		}, i);
		function s(n) {
			let r = f(n);
			r && r.type === "ready" && (clearTimeout(o), removeEventListener("message", s), t({
				codeSet: e,
				frame: a,
				ready: r,
				failures: p,
				call: y,
				close: v
			}));
		}
		addEventListener("message", s), a.src = u.href, n.append(a);
	});
}
// src/library/plan.ts
var Lx = (e) => e.endsWith(".json"), Rx = (e) => e.split("/").at(-2) ?? "";
function zx(e) {
	if (!Lx(e)) return !1;
	let t = e.split("/");
	return t[0] === "search" ? t.length === 2 : t[0] === "data" ? t.length === 2 || Rx(e) !== "adventure" : !1;
}
function Bx(e) {
	let t = Object.keys(e).filter(zx).sort();
	return {
		files: t,
		bytes: t.reduce((t, n) => t + e[n].size, 0)
	};
}
// node_modules/@noble/hashes/sha2.js
var Vx = /* @__PURE__ */ Uint32Array.from([
	1116352408,
	1899447441,
	3049323471,
	3921009573,
	961987163,
	1508970993,
	2453635748,
	2870763221,
	3624381080,
	310598401,
	607225278,
	1426881987,
	1925078388,
	2162078206,
	2614888103,
	3248222580,
	3835390401,
	4022224774,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	2554220882,
	2821834349,
	2952996808,
	3210313671,
	3336571891,
	3584528711,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	2177026350,
	2456956037,
	2730485921,
	2820302411,
	3259730800,
	3345764771,
	3516065817,
	3600352804,
	4094571909,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	2227730452,
	2361852424,
	2428436474,
	2756734187,
	3204031479,
	3329325298
]), Hx = /* @__PURE__ */ new Uint32Array(64), Ux = class extends dx {
	A = 0;
	B = 0;
	C = 0;
	D = 0;
	E = 0;
	F = 0;
	G = 0;
	H = 0;
	constructor(e, t) {
		super(64, e, 8, !1), this.A = t[0] | 0, this.B = t[1] | 0, this.C = t[2] | 0, this.D = t[3] | 0, this.E = t[4] | 0, this.F = t[5] | 0, this.G = t[6] | 0, this.H = t[7] | 0;
	}
	get() {
		let { A: e, B: t, C: n, D: r, E: i, F: a, G: o, H: s } = this;
		return [
			e,
			t,
			n,
			r,
			i,
			a,
			o,
			s
		];
	}
	set(e, t, n, r, i, a, o, s) {
		this.A = e | 0, this.B = t | 0, this.C = n | 0, this.D = r | 0, this.E = i | 0, this.F = a | 0, this.G = o | 0, this.H = s | 0;
	}
	_cloneInto(e) {
		return (e ||= new this.constructor()).set(...this.get()), this._cloneIntoMeta(e);
	}
	process(e, t) {
		for (let n = 0; n < 16; n++, t += 4) Hx[n] = e.getUint32(t, !1);
		for (let e = 16; e < 64; e++) {
			let t = Hx[e - 15], n = Hx[e - 2], r = ex(t, 7) ^ ex(t, 18) ^ t >>> 3, i = ex(n, 17) ^ ex(n, 19) ^ n >>> 10;
			Hx[e] = i + Hx[e - 7] + r + Hx[e - 16] | 0;
		}
		let { A: n, B: r, C: i, D: a, E: o, F: s, G: c, H: l } = this;
		for (let e = 0; e < 64; e++) {
			let t = ex(o, 6) ^ ex(o, 11) ^ ex(o, 25), u = l + t + lx(o, s, c) + Vx[e] + Hx[e] | 0, d = (ex(n, 2) ^ ex(n, 13) ^ ex(n, 22)) + ux(n, r, i) | 0;
			l = c, c = s, s = o, o = a + u | 0, a = i, i = r, r = n, n = u + d | 0;
		}
		n = n + this.A | 0, r = r + this.B | 0, i = i + this.C | 0, a = a + this.D | 0, o = o + this.E | 0, s = s + this.F | 0, c = c + this.G | 0, l = l + this.H | 0, this.set(n, r, i, a, o, s, c, l);
	}
	roundClean() {
		Qb(Hx);
	}
	destroy() {
		this.destroyed = !0, this.set(0, 0, 0, 0, 0, 0, 0, 0), Qb(this.buffer);
	}
}, Wx = class extends Ux {
	constructor() {
		super(32, fx);
	}
}, Gx = /* @__PURE__ */ sx(() => new Wx(), /* @__PURE__ */ cx(1));
// src/core/hash.ts
function Kx(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e) ?? "null";
	if (Array.isArray(e)) return `[${e.map((e) => Kx(e === void 0 ? null : e)).join(",")}]`;
	let t = e;
	return `{${Object.keys(t).filter((e) => t[e] !== void 0).sort().map((e) => `${JSON.stringify(e)}:${Kx(t[e])}`).join(",")}}`;
}
function qx(e) {
	return ix(Gx(typeof e == "string" ? ax(e) : e));
}
function Jx(e) {
	return qx(Kx(e));
}
// src/library/cache.ts
var Yx = (e, t, n) => n ? `pre:${e}:${t}:${n}` : `pre:${e}:${t}`, Xx = (e) => !!e && typeof e == "object" && !Array.isArray(e);
async function Zx(e, t) {
	let n = await t.derived.get(`audit:${e.codeSet}-brew`), r = Jx((Xx(n?.value) && Array.isArray(n.value.installed) ? n.value.installed : []).map((e) => `${String(e.docIdLocal ?? "")}:${String(e.checksum ?? "")}`).sort());
	return `${Ox(e)}|${r}`;
}
async function Qx(e) {
	return Jx((await e.manage.toArray()).map((e) => `${e.kind}|${e.key}|${Kx(e.value)}`).sort());
}
async function $x(e, t) {
	let n = `parsed:${t}:`;
	return (await e.derived.where("key").startsWith(n).toArray()).filter((e) => !e.key.includes(":corpus:")).map((e) => e.key.slice(n.length));
}
async function eS(e, t, n, r) {
	await e.derived.put({
		key: t,
		fingerprint: n,
		value: r,
		savedAt: Date.now()
	});
}
async function tS(e) {
	let t = Date.now(), { source: n, db: r, frame: i } = e, a = await Zx(n, r), o = await Qx(r), s = e.excluded || e.search ? await i.call("excludeList") : null, c = s ? Jx(s) : "", l = e.prop ? [e.prop] : await $x(r, n.id), u = {
		source: n.id,
		base: a,
		props: l.length,
		fluff: 0,
		excluded: 0,
		search: !1,
		searchBytes: 0,
		ms: 0
	};
	for (let t of l) {
		let s = (await r.derived.get(dS(n.id, t)))?.value;
		if (s?.items.length) {
			if (e.fluff) {
				let e = await i.call("fluffOfMany", t, s.items);
				await eS(r, Yx(n.id, "fluff", t), a, e), u.fluff += Object.keys(e).length;
			}
			if (e.excluded) {
				let e = await i.call("excludedFlags", t, n.kind === "brew" ? "brew" : "site");
				if (e.excluded) {
					let n = (e) => {
						let t = /* @__PURE__ */ new Map();
						for (let n of e) n && t.set(n, (t.get(n) ?? 0) + 1);
						return t;
					}, r = n(e.hashes), i = n(s.hashes);
					if (r.size !== i.size || [...i].some(([e, t]) => r.get(e) !== t)) throw Error(`作者程序现场展开的「${t}」和库里存的解析结果对不上：现场 ${e.hashes.length} 条、库里 ${s.hashes.length} 条`);
				}
				let l = {};
				e.excluded && e.hashes.forEach((t, n) => {
					t && (l[t] = e.excluded[n]);
				}), await eS(r, Yx(n.id, "excluded", t), `${a}|${c}|${o}`, {
					excluded: e.excluded ? l : null,
					base: a,
					exclude: c,
					manage: o
				}), u.excluded++;
			}
		}
	}
	if (e.search && n.kind === "official") {
		let e = await i.call("searchIndexDump");
		await eS(r, Yx(n.id, "search"), `${a}|${c}|${o}`, {
			...e,
			base: a,
			exclude: c,
			manage: o
		}), u.search = !0, u.searchBytes = e.json.length;
	}
	return u.ms = Date.now() - t, u;
}
async function nS(e, t) {
	return e.derived.get(t);
}
async function rS(e) {
	let { source: t, db: n, openFrame: r } = e, i = await Zx(t, n), a = await Qx(n), o = !1, s = !1, c = !1;
	if (e.fluff) {
		let r = await nS(n, Yx(t.id, "fluff", e.prop));
		o = !r || r.fingerprint !== i;
	}
	if (e.excluded) {
		let r = await nS(n, Yx(t.id, "excluded", e.prop)), o = Xx(r?.value) ? r.value : null;
		s = !o || o.base !== i || o.manage !== a;
	}
	if (e.search) {
		let e = await nS(n, Yx(t.id, "search")), r = Xx(e?.value) ? e.value : null;
		c = !r || r.base !== i || r.manage !== a;
	}
	if (!o && !s && !c) return;
	let l = await r(t.codeSet);
	try {
		await tS({
			source: t,
			db: n,
			frame: l,
			prop: e.prop,
			fluff: o,
			excluded: s,
			search: c
		});
	} finally {
		l.close();
	}
}
async function iS(e, t, n) {
	for (let r of n) {
		let n = Yx(t, r);
		await e.derived.where("key").startsWith(n).delete();
	}
}
async function aS(e, t, n, r) {
	let i = await nS(e, Yx(t, "fluff", n)), a = (Xx(i?.value) ? i.value : null)?.[r];
	return Xx(a) ? a : null;
}
async function oS(e, t, n) {
	let r = await nS(e, Yx(t, "excluded", n)), i = (Xx(r?.value) ? r.value : null)?.excluded;
	return Xx(i) ? i : null;
}
async function sS(e, t) {
	let n = await nS(e, Yx(t, "search"));
	return Xx(n?.value) ? n.value : null;
}
// src/library/install.ts
async function cS() {
	let e = typeof navigator < "u" ? navigator.storage : void 0;
	if (!e) return {
		persisted: null,
		quota: null,
		usage: null
	};
	let t = await e.persist?.() ?? null, { quota: n = null, usage: r = null } = await e.estimate?.() ?? {};
	return {
		persisted: t,
		quota: n,
		usage: r
	};
}
var lS = (e) => e instanceof Error ? e.message : String(e);
async function uS(e, t, n) {
	let r = 0;
	await Promise.all(Array.from({ length: Math.min(t, e.length) }, async () => {
		for (; r < e.length;) await n(e[r++]);
	}));
}
function dS(e, t, n) {
	return n ? `parsed:${e}:corpus:${t}:${n}` : `parsed:${e}:${t}`;
}
async function fS({ source: e, db: t, files: n, openFrame: r, onProgress: i, concurrency: a = 6, signal: o }) {
	let s = Date.now(), c = Ox(e), l = await cS(), u = await n.fileList(e), d = Bx(u), f = {
		source: e.id,
		commit: c,
		storage: l,
		plan: {
			files: d.files.length,
			bytes: d.bytes
		},
		download: {
			fetched: 0,
			reused: 0,
			failed: []
		},
		mirror: {
			checked: 0,
			missing: [],
			mismatched: []
		},
		parse: {
			props: {},
			corpora: {},
			notRun: [],
			errors: []
		},
		index: {},
		ms: 0
	}, p = (n, r = {}) => t.sets.put({
		id: e.id,
		commit: c,
		status: n,
		plan: f.plan,
		updatedAt: Date.now(),
		...r
	});
	await p("downloading");
	let m = 0;
	if (await uS(d.files, a, async (t) => {
		if (!o?.aborted) {
			try {
				await n.local(e, t) === null ? (await n.get(e, t, { allowNetwork: !0 }), f.download.fetched++) : f.download.reused++;
			} catch (e) {
				f.download.failed.push({
					path: t,
					error: lS(e)
				});
			}
			i?.({
				stage: "download",
				done: ++m,
				total: d.files.length,
				item: t
			});
		}
	}), o?.aborted) return f.cancelled = !0, f.ms = Date.now() - s, await p("cancelled", { ms: f.ms }), f;
	i?.({
		stage: "mirror",
		done: 0,
		total: d.files.length
	});
	for (let n of d.files) {
		let r = await t.files.get([e.id, n]);
		f.mirror.checked++, !r || r.commit !== c ? f.mirror.missing.push(n) : (r.gitSha !== u[n].sha || r.size !== u[n].size) && f.mirror.mismatched.push(n);
	}
	await p("parsing"), i?.({
		stage: "open-frame",
		done: 0,
		total: 0
	});
	let h = await r();
	try {
		let n = {};
		try {
			i?.({
				stage: "author-init",
				done: 0,
				total: 0
			}), await h.call("init");
		} catch (e) {
			throw f.parse.errors.push({
				prop: "(作者程序初始化)",
				error: lS(e)
			}), e;
		}
		i?.({
			stage: "loaders",
			done: 0,
			total: 0
		});
		let r = await h.call("loaders"), a = 0;
		for (let o of r) if (i?.({
			stage: "parse",
			done: a++,
			total: r.length,
			item: o.props.join("/")
		}), o.kind === "corpus") {
			let n = o.props[0];
			if (o.props.includes("adventureData")) {
				f.parse.notRun.push({
					props: o.props,
					reason: "冒险正文按需下载（作者离线规则），用到哪本再解析哪本"
				});
				continue;
			}
			let r = f.parse.corpora[n] = {
				count: 0,
				failed: []
			};
			try {
				for (let a of await h.call("corpusList", o.index, n, o.page)) try {
					i?.({
						stage: "parse-corpus",
						done: r.count,
						total: 0,
						item: a.id
					});
					let s = await h.call("parseCorpus", o.page, a.source, a.hash);
					await t.derived.put({
						key: dS(e.id, n, a.id),
						fingerprint: c,
						value: s,
						savedAt: Date.now()
					}), r.count++;
				} catch (e) {
					r.failed.push({
						id: a.id,
						error: lS(e)
					});
				}
			} catch (e) {
				f.parse.errors.push({
					prop: n,
					error: lS(e)
				});
			}
		} else for (let r of o.props) if (r.startsWith("raw_")) f.parse.notRun.push({
			props: [r],
			reason: "作者加载器的中间草稿层（raw_ 前缀），不是最终输出"
		});
		else try {
			i?.({
				stage: "parse-prop",
				done: 0,
				total: 0,
				item: r
			});
			let a = await h.call("parseProp", r), { items: o, hashes: s } = a;
			await t.derived.put({
				key: dS(e.id, r),
				fingerprint: c,
				value: a,
				savedAt: Date.now()
			}), f.parse.props[r] = {
				count: o.length,
				noHash: s.filter((e) => e === null).length
			}, n[r] = new Set(s.filter((e) => e !== null));
		} catch (e) {
			f.parse.errors.push({
				prop: r,
				error: lS(e)
			});
		}
		try {
			i?.({
				stage: "index",
				done: 0,
				total: 0
			});
			let e = await h.call("searchIndexHashes");
			for (let t of /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(n)])) {
				let r = n[t] ?? /* @__PURE__ */ new Set(), i = new Set(e[t] ?? []), a = [...r].filter((e) => !i.has(e)), o = [...i].filter((e) => !r.has(e));
				f.index[t] = {
					parsed: r.size,
					index: i.size,
					onlyParsed: a.length,
					onlyIndex: o.length,
					samplesOnlyParsed: a.slice(0, 5),
					samplesOnlyIndex: o.slice(0, 5)
				};
			}
		} catch (e) {
			f.parse.errors.push({
				prop: "(search index)",
				error: lS(e)
			});
		}
		try {
			i?.({
				stage: "precompute",
				done: 0,
				total: 0
			}), f.precompute = await tS({
				source: e,
				db: t,
				frame: h,
				fluff: !0,
				excluded: !0,
				search: !0
			});
		} catch (e) {
			f.parse.errors.push({
				prop: "(预计算缓存)",
				error: lS(e)
			});
		}
	} catch (e) {
		f.parse.errors.length || f.parse.errors.push({
			prop: "(解析)",
			error: lS(e)
		});
	} finally {
		h.close();
	}
	i?.({
		stage: "save",
		done: 0,
		total: 0
	}), f.ms = Date.now() - s;
	let g = !f.download.failed.length && !f.mirror.missing.length && !f.mirror.mismatched.length && !f.parse.errors.length && Object.values(f.parse.corpora).every((e) => !e.failed.length);
	return await t.derived.put({
		key: `audit:${e.id}`,
		fingerprint: c,
		value: f,
		savedAt: Date.now()
	}), await p(g ? "installed" : "failed", { ms: f.ms }), f;
}
var pS = {
	scopes: [{
		id: "5e2014",
		name: "5e 2014",
		edition: "classic"
	}, {
		id: "5e2024",
		name: "5e 2024",
		edition: "one"
	}],
	rules: { dnd5e2014: {
		defaultScopes: ["5e2014"],
		showLegacy: !0,
		style: "classic"
	} }
}, mS = pS.scopes, hS = pS.rules;
function gS(e) {
	let t = hS[e];
	if (!t) throw Error(`范围登记表里没有这套规则：${e}`);
	return t;
}
var _S = (e) => `src:${e.toLowerCase()}`, vS = (e) => `ent:${e.set}:${e.prop}:${e.hash}`, yS = (e) => `${e.set}|${e.prop}|${e.hash}`;
function bS(e, t = mS) {
	if (!e || e.classic === null) return null;
	let n = e.classic ? "classic" : "one", r = t.filter((e) => e.edition === n).map((e) => e.id);
	return r.length ? {
		scopes: r,
		global: !1
	} : null;
}
function xS(e, t, n) {
	return e ? {
		assignment: e,
		basis: "entry"
	} : t ? {
		assignment: t,
		basis: "user"
	} : n ? {
		assignment: n,
		basis: "author"
	} : {
		assignment: null,
		basis: "none"
	};
}
function SS(e, t) {
	return {
		rule: e,
		codeSet: t,
		scopes: [...gS(e).defaultScopes],
		include: [],
		exclude: [],
		choices: {}
	};
}
function CS(e, t, n) {
	let r = (e) => e.includes(t.entry) || t.source !== null && e.includes(t.source);
	return r(e.exclude) ? {
		visible: !1,
		reason: "excluded"
	} : r(e.include) ? {
		visible: !0,
		reason: "included"
	} : n.assignment ? n.assignment.global ? {
		visible: !0,
		reason: "global"
	} : n.assignment.scopes.some((t) => e.scopes.includes(t)) ? {
		visible: !0,
		reason: "scope"
	} : {
		visible: !1,
		reason: "out-of-scope"
	} : {
		visible: !1,
		reason: "unclassified"
	};
}
// src/library/versions.ts
function wS(e, t) {
	let n = [...t].sort((e, t) => e.timeAdded - t.timeAdded || e.order - t.order), r = /* @__PURE__ */ new Map();
	for (let e of n) for (let [t, n] of Object.entries(e.props)) for (let i of new Set(n)) {
		if (!i) continue;
		let n = `${t}\u0000${i}`, a = r.get(n);
		a ? a.push(e.docIdLocal) : r.set(n, [e.docIdLocal]);
	}
	let i = [];
	for (let [t, n] of r) {
		let [r, a] = t.split("\0");
		e[r]?.has(a) ? i.push({
			prop: r,
			hash: a,
			base: { kind: "official" },
			others: n
		}) : n.length > 1 && i.push({
			prop: r,
			hash: a,
			base: {
				kind: "doc",
				docIdLocal: n[0]
			},
			others: n.slice(1)
		});
	}
	return i;
}
function TS(e, t) {
	let n = new Set(e.map((e) => e.altId));
	for (let e of [
		"campaign",
		"rule",
		"global"
	]) {
		let r = t[e];
		if (r !== void 0) return r === "base" ? {
			altId: "base",
			by: e,
			missing: null
		} : n.has(r) ? {
			altId: r,
			by: e,
			missing: null
		} : {
			altId: "base",
			by: e,
			missing: r
		};
	}
	return {
		altId: "base",
		by: "default",
		missing: null
	};
}
// src/library/alternatives.ts
var ES = "HOMEBREW_2_STORAGE", DS = (e) => `alts:${e}`;
function OS(e, t) {
	let n = new Set(Object.values(e.body._meta?.dependencies ?? {}).flat().map((e) => e.toLowerCase()));
	return [...t.filter((t) => t !== e && (t.body._meta?.sources ?? []).some((e) => e.json && n.has(e.json.toLowerCase()))), e];
}
async function kS(e, t, n) {
	let { db: r, source: i } = e, a = `${i.codeSet}:iso:${t.at(-1).head.docIdLocal}`, o = await r.kv.where("scope").equals(i.codeSet).toArray();
	await r.kv.bulkPut(o.map((e) => ({
		...e,
		scope: a,
		value: e.key === ES ? t : e.value
	}))), o.some((e) => e.key === ES) || await r.kv.put({
		scope: a,
		key: ES,
		value: t
	});
	let s = await e.openFrameIn(a);
	try {
		return await s.call("brewItemsByHash", n);
	} finally {
		s.close(), await r.kv.where("scope").anyOf(a, `${a}:local`).delete();
	}
}
async function AS(e) {
	let { source: t, db: n, frame: r } = e, i = wx(t.codeSet), a = await r.call("brewDocIndex"), o = {}, s = /* @__PURE__ */ new Map();
	for (let e of new Set(a.flatMap((e) => Object.keys(e.props)))) {
		let t = await n.derived.get(dS(i.id, e));
		t && (s.set(e, t.value), o[e] = new Set(t.value.hashes.filter((e) => !!e)));
	}
	let c = wS(o, a), l = {
		source: t.id,
		targets: {},
		errors: []
	};
	if (!c.length) return await n.derived.put({
		key: DS(t.id),
		fingerprint: "brew",
		value: l,
		savedAt: Date.now()
	}), l;
	let u = (await n.kv.get([t.codeSet, ES]))?.value ?? [], d = new Map(u.map((e) => [e.head.docIdLocal, e])), f = /* @__PURE__ */ new Map(), p = (e, t, n) => (f.get(e) ?? f.set(e, []).get(e)).push({
		prop: t,
		hash: n
	});
	for (let e of c) {
		for (let t of e.others) p(t, e.prop, e.hash);
		e.base.kind === "doc" && p(e.base.docIdLocal, e.prop, e.hash);
	}
	let m = /* @__PURE__ */ new Map();
	for (let [t, n] of f) {
		let r = d.get(t);
		if (r) try {
			m.set(t, await kS(e, OS(r, u), n));
		} catch (e) {
			for (let r of n) l.errors.push({
				docIdLocal: t,
				...r,
				error: e instanceof Error ? e.message : String(e)
			});
		}
		else for (let e of n) l.errors.push({
			docIdLocal: t,
			...e,
			error: "作者存储里找不到这个包"
		});
	}
	let h = (e) => d.get(e)?.head.filename ?? null, g = /* @__PURE__ */ new Map();
	for (let e of c) {
		let r = `${e.prop}|${e.hash}`, a = {
			set: e.base.kind === "official" ? i.id : t.id,
			prop: e.prop,
			hash: e.hash
		}, o = [];
		for (let n of e.others) {
			let i = m.get(n)?.[r];
			i === void 0 ? m.has(n) && l.errors.push({
				docIdLocal: n,
				prop: e.prop,
				hash: e.hash,
				error: "隔离解析后作者没有交出这一条"
			}) : o.push({
				altId: `doc:${n}`,
				kind: "collision",
				filename: h(n),
				ref: {
					set: t.id,
					prop: e.prop,
					hash: e.hash
				},
				item: i
			});
		}
		let c = g.get(e.prop) ?? (await n.derived.get(dS(t.id, e.prop)))?.value;
		c && g.set(e.prop, c);
		let u = c ? c.hashes.indexOf(e.hash) : -1, d = s.get(e.prop), f = e.base.kind === "official" ? d?.sources[d.hashes.indexOf(e.hash)] ?? null : c?.sources[u] ?? null;
		if (l.targets[yS(a)] = {
			target: a,
			source: f,
			base: e.base.kind === "official" ? "official" : e.base.docIdLocal,
			alts: o
		}, !(!c || u < 0)) {
			if (e.base.kind === "official") c.items.splice(u, 1), c.hashes.splice(u, 1), c.sources.splice(u, 1);
			else {
				let t = m.get(e.base.docIdLocal)?.[r];
				t !== void 0 && (c.items[u] = t);
			}
		}
	}
	for (let [e, r] of g) await n.derived.put({
		key: dS(t.id, e),
		fingerprint: "brew",
		value: r,
		savedAt: Date.now()
	});
	return await n.derived.put({
		key: DS(t.id),
		fingerprint: "brew",
		value: l,
		savedAt: Date.now()
	}), l;
}
// src/library/manage.ts
var jS = class {
	db;
	constructor(e) {
		this.db = e;
	}
	async all(e) {
		return (await this.db.manage.where("kind").equals(e).toArray()).map((e) => ({
			key: e.key,
			value: e.value
		}));
	}
	async put(e, t, n) {
		n === null ? await this.db.manage.delete([e, t]) : await this.db.manage.put({
			kind: e,
			key: t,
			value: n,
			updatedAt: Date.now()
		});
	}
	async assignments() {
		return new Map((await this.all("assign")).map((e) => [e.key, e.value]));
	}
	setAssignment(e, t) {
		return this.put("assign", e, t);
	}
	async userScopes() {
		return (await this.all("scope")).map((e) => e.value);
	}
	addScope(e) {
		return this.put("scope", e.id, {
			id: e.id,
			name: e.name
		});
	}
	async removeScope(e) {
		await this.db.transaction("rw", this.db.manage, async () => {
			await this.put("scope", e, null);
			for (let [t, n] of await this.assignments()) n.scopes.includes(e) && await this.setAssignment(t, {
				...n,
				scopes: n.scopes.filter((t) => t !== e)
			});
		});
	}
	async choices(e) {
		let t = `${e}|`;
		return Object.fromEntries((await this.all("choice")).filter((e) => e.key.startsWith(t)).map((e) => [e.key.slice(t.length), e.value]));
	}
	setChoice(e, t, n) {
		return this.put("choice", `${e}|${t}`, n);
	}
	async houseRules() {
		return (await this.all("houserule")).map((e) => e.value);
	}
	linkHouseRule(e) {
		return this.put("houserule", `${e.house.set}|${e.house.prop}|${e.house.hash}`, e);
	}
	unlinkHouseRule(e) {
		return this.put("houserule", `${e.set}|${e.prop}|${e.hash}`, null);
	}
}, MS = class {
	lib;
	db;
	manage;
	editionCache = /* @__PURE__ */ new Map();
	constructor(e, t) {
		this.lib = e, this.db = t, this.manage = new jS(t);
	}
	setsOf(e) {
		return Sx.filter((t) => t.codeSet === e);
	}
	async installed(e) {
		return e.kind === "brew" ? !!await this.db.derived.get(`audit:${e.id}`) : (await this.db.sets.get(e.id))?.status === "installed";
	}
	async scopes() {
		return [...mS, ...await this.manage.userScopes()];
	}
	async editions(e, t) {
		let n = [...new Set(t)].filter((t) => !this.editionCache.has(`${e}|${t.toLowerCase()}`));
		if (n.length) {
			let t = await (await this.lib.frameOf(e)).call("editionOf", n);
			for (let [n, r] of Object.entries(t)) this.editionCache.set(`${e}|${n.toLowerCase()}`, r);
		}
		return Object.fromEntries(t.map((t) => [t, this.editionCache.get(`${e}|${t.toLowerCase()}`)]));
	}
	reset() {
		this.editionCache.clear();
	}
	async alts(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n of this.setsOf(e).filter((e) => e.kind === "brew")) {
			let e = (await this.db.derived.get(DS(n.id)))?.value;
			for (let [n, r] of Object.entries(e?.targets ?? {})) t.set(n, r);
		}
		return t;
	}
	async alternativesOf(e, t) {
		let n = [...t.get(yS(e))?.alts ?? []];
		for (let t of await this.manage.houseRules()) {
			if (yS(t.target) !== yS(e)) continue;
			let r = await this.lib.storedItem(t.house.set, t.house.prop, t.house.hash);
			r && n.push({
				altId: `house:${t.house.hash}`,
				kind: "houserule",
				filename: null,
				ref: t.house,
				item: r.item
			});
		}
		return n;
	}
	async choicesFor(e) {
		return {
			rule: await this.manage.choices(`rule:${e.rule}`),
			global: await this.manage.choices("global")
		};
	}
	version(e, t, n, r) {
		let i = TS(n, {
			campaign: e.choices[t],
			rule: r.rule[t],
			global: r.global[t]
		}), a = n.find((e) => e.altId === i.altId);
		return {
			chosen: {
				...i,
				count: n.length
			},
			item: a?.item
		};
	}
	async viewFor(e, t, n, r) {
		let i = r ?? await this.manage.assignments(), a = n ? bS((await this.editions(e.codeSet, [n]))[n]) : null, o = xS(i.get(vS(t)), n ? i.get(_S(n)) : void 0, a);
		return {
			...CS(e, {
				entry: vS(t),
				source: n ? _S(n) : null
			}, o),
			membership: o
		};
	}
	async houseUnits() {
		return new Set((await this.manage.houseRules()).map((e) => yS(e.house)));
	}
	async activeOverrides() {
		let e = [];
		for (let t of await this.manage.houseRules()) {
			let n = await this.lib.storedItem(t.house.set, t.house.prop, t.house.hash);
			n && e.push({
				target: {
					kind: "entry",
					...t.target
				},
				house: {
					kind: "houserule",
					...t.house
				},
				digest: Jx(n.item)
			});
		}
		return e;
	}
	async query(e, t, { source: n } = {}) {
		let r = await this.manage.assignments(), i = await this.alts(e.codeSet), a = await this.choicesFor(e), o = await this.houseUnits(), s = [];
		for (let c of this.setsOf(e.codeSet)) {
			if (!await this.installed(c)) continue;
			let l = await this.lib.query(c.id, t, { source: n }).catch((e) => {
				if (e instanceof Error && e.message.includes("没有这一类的解析结果")) return [];
				throw e;
			}), u = [...new Set(l.map((e) => e.source).filter((e) => !!e))];
			await this.editions(e.codeSet, u);
			for (let n of l) {
				if (!n.hash) continue;
				let l = {
					set: c.id,
					prop: t,
					hash: n.hash
				};
				if (o.has(yS(l))) continue;
				let u = await this.viewFor(e, l, n.source, r);
				if (!u.visible) continue;
				let { chosen: d, item: f } = this.version(e, yS(l), await this.alternativesOf(l, i), a);
				s.push({
					ref: l,
					source: n.source,
					reason: u.reason,
					item: f ?? n.item,
					version: d
				});
			}
		}
		return s;
	}
	async storedItem(e) {
		return this.lib.storedItem(e.set, e.prop, e.hash);
	}
	async englishOf(e, t = {}) {
		let n = Sx.find((t) => t.id === e.set);
		return n ? this.lib.english(n, e.prop, e.hash, t) : null;
	}
	async englishPairs(e) {
		return this.lib.englishPairs(wx(e).id);
	}
	async detail(e, t) {
		let n = await this.lib.detail(t.set, t.prop, t.hash);
		if (!n) return null;
		let r = await this.viewFor(e, t, n.source);
		if (!r.visible) return { hidden: r.reason };
		let i = await this.alternativesOf(t, await this.alts(e.codeSet)), { chosen: a, item: o } = this.version(e, yS(t), i, await this.choicesFor(e)), s = o ?? n.item, c = o === void 0 ? null : i.find((e) => e.item === s), l = c?.ref ? await this.lib.fluff(c.ref.set, c.ref.prop, c.ref.hash) : null, u = o === void 0 ? {
			fluff: n.fluff,
			fluffError: n.fluffError
		} : {
			fluff: l?.fluff ?? null,
			fluffError: l?.fluffError ?? null
		};
		return {
			...n,
			...u,
			ref: t,
			reason: r.reason,
			item: s,
			base: n.item,
			version: a,
			alternatives: i,
			english: o === void 0 ? n.english : null
		};
	}
	async fetch(e, t) {
		let n = await this.manage.assignments(), r = await this.alts(e.codeSet), i = await this.choicesFor(e), a = [];
		for (let o of t) {
			let t = Sx.find((e) => e.id === o.set);
			if (!t || !await this.installed(t)) {
				a.push({
					ok: !1,
					ref: o,
					reason: "not-installed"
				});
				continue;
			}
			let s = await this.lib.storedItem(o.set, o.prop, o.hash);
			if (!s) {
				a.push({
					ok: !1,
					ref: o,
					reason: "not-found"
				});
				continue;
			}
			let c = await this.viewFor(e, o, s.source, n);
			if (!c.visible) {
				a.push({
					ok: !1,
					ref: o,
					reason: c.reason
				});
				continue;
			}
			let { chosen: l, item: u } = this.version(e, yS(o), await this.alternativesOf(o, r), i);
			a.push({
				ok: !0,
				ref: o,
				source: s.source,
				item: u ?? s.item,
				version: l
			});
		}
		return a;
	}
	async search(e, t) {
		let n = this.setsOf(e.codeSet).find((e) => e.kind === "official"), r = this.setsOf(e.codeSet).find((e) => e.kind === "brew");
		if (!n || !await this.installed(n)) return [];
		let i = await this.lib.search(n.id, t, { showLegacy: gS(e.rule).showLegacy }), a = await this.manage.assignments(), o = await this.houseUnits(), s = [];
		for (let t of i) {
			let i = String(t.doc.u ?? ""), c = typeof t.doc.s == "string" ? t.doc.s : null, l = {
				set: await this.lib.storedItem(n.id, t.prop, i) || !r ? n.id : r.id,
				prop: t.prop,
				hash: i
			};
			if (o.has(yS(l))) continue;
			let u = await this.viewFor(e, l, c, a);
			u.visible && s.push({
				...t,
				ref: l,
				reason: u.reason
			});
		}
		return s;
	}
	async catalog(e) {
		let t = await this.manage.assignments(), n = await this.alts(e.codeSet), r = /* @__PURE__ */ new Map();
		for (let e of n.values()) e.source && r.set(e.source.toLowerCase(), (r.get(e.source.toLowerCase()) ?? 0) + 1);
		let i = [];
		for (let t of this.setsOf(e.codeSet)) if (await this.installed(t)) {
			for (let [e, n] of Object.entries(await this.sourceCounts(t.id))) i.push({
				kind: "book",
				set: t.id,
				source: e,
				id: null,
				count: n,
				downloaded: !0,
				alternatives: r.get(e.toLowerCase()) ?? 0
			});
			if (t.kind === "official") for (let e of await this.adventures(t)) i.push({
				kind: "adventure",
				set: t.id,
				source: e.source,
				id: e.id,
				count: 0,
				downloaded: e.downloaded,
				alternatives: 0
			});
		}
		let a = [...new Set(i.map((e) => e.source))], o = a.length ? await (await this.lib.frameOf(e.codeSet)).call("sourceNames", a) : {}, s = await this.editions(e.codeSet, a);
		return i.map((n) => {
			let r = _S(n.source), i = xS(void 0, t.get(r), bS(s[n.source]));
			return {
				...n,
				name: o[n.source]?.full ?? n.source,
				abv: o[n.source]?.abv ?? n.source,
				edition: s[n.source] ?? null,
				membership: i,
				view: CS(e, {
					entry: r,
					source: r
				}, i)
			};
		});
	}
	async sourceCounts(e) {
		let t = String((await this.db.derived.get(`audit:${e}`))?.savedAt ?? ""), n = await this.db.derived.get(`sources:${e}`);
		if (n && n.fingerprint === t) return n.value;
		let r = {}, i = dS(e, "");
		return await this.db.derived.where("key").startsWith(i).each((e) => {
			if (!e.key.slice(i.length).startsWith("corpus:")) for (let t of e.value.sources) t && (r[t] = (r[t] ?? 0) + 1);
		}), await this.db.derived.put({
			key: `sources:${e}`,
			fingerprint: t,
			value: r,
			savedAt: Date.now()
		}), r;
	}
	async adventures(e) {
		let t = await this.lib.frameOf(e.codeSet), n = (await t.call("loaders")).find((e) => e.kind === "corpus" && e.props.includes("adventureData"));
		if (!n?.index || !n.page) return [];
		let r = [];
		for (let i of await t.call("corpusList", n.index, n.props[0], n.page)) r.push({
			...i,
			downloaded: !!await this.db.derived.get(dS(e.id, n.props[0], i.id))
		});
		return r;
	}
	async previewAssignment(e, t, n) {
		let r = await this.manage.assignments(), i = t.startsWith("src:") ? t.slice(4) : null, a = i ? bS((await this.editions(e, [i]))[i]) : null;
		return {
			unit: t,
			before: xS(void 0, r.get(t), a),
			after: xS(void 0, n ?? void 0, a)
		};
	}
	setAssignment(e, t) {
		return this.manage.setAssignment(e, t);
	}
	async choose(e, t, n, r = "campaign") {
		let i = yS(t);
		if (r === "campaign") {
			let t = { ...e.choices };
			return n === null ? delete t[i] : t[i] = n, {
				...e,
				choices: t
			};
		}
		return await this.manage.setChoice(r, i, n), e;
	}
}, NS = { sources: {
	house: {
		json: "TRPGHOUSE",
		full: "我的房规",
		abbreviation: "房规"
	},
	mine: {
		json: "TRPGMINE",
		full: "我的资料",
		abbreviation: "我的"
	}
} }.sources, PS = (e) => {
	let t = Sx.find((t) => t.kind === "brew" && t.codeSet === e);
	if (!t) throw Error(`作者程序 ${e} 没有登记自制数据集`);
	return t;
}, FS = class {
	lib;
	scoped;
	db;
	constructor(e, t, n) {
		this.lib = e, this.scoped = t, this.db = n;
	}
	get manage() {
		return this.scoped.manage;
	}
	async frame(e) {
		return this.lib.frameOf(e);
	}
	async after(e) {
		return this.scoped.reset(), this.lib.reparseBrew(PS(e).id);
	}
	async template(e, t) {
		return (await this.frame(e)).call("entryTemplate", t);
	}
	async converters(e) {
		return (await this.frame(e)).call("converters");
	}
	async convert(e, t, n, r) {
		return (await this.frame(e.codeSet)).call("convertText", t, n, r, {
			source: NS.mine.json,
			styleHint: gS(e.rule).style
		});
	}
	async saveEntry(e, t, n) {
		let r = await this.frame(e);
		return await r.call("editableEnsureSource", NS.mine), {
			...await r.call("editablePut", t, {
				source: NS.mine.json,
				...n
			}),
			parse: await this.after(e)
		};
	}
	async deleteEntries(e, t, n) {
		return await (await this.frame(e)).call("editableRemove", t, n), this.after(e);
	}
	async createHouseRule(e, t, n, { activate: r = !0 } = {}) {
		let i = await this.lib.storedItem(t.set, t.prop, t.hash);
		if (!i) throw Error(`找不到要改的条目：${yS(t)}`);
		let a = i.item;
		if (!a.name || !a.source) throw Error(`原件没有名字或来源，作者的 _copy 指不到它：${yS(t)}`);
		let o = /* @__PURE__ */ new Set();
		for (let e of await this.manage.houseRules()) {
			let n = (await this.lib.storedItem(e.house.set, e.house.prop, e.house.hash))?.item;
			e.house.prop === t.prop && n?.name && o.add(n.name);
		}
		let s = o.has(a.name) ? `${a.name}（${a.source}）` : a.name, c = n.entity ? {
			...n.entity,
			name: s,
			source: NS.house.json
		} : {
			name: s,
			source: NS.house.json,
			_copy: {
				name: a.name,
				source: a.source,
				...n.mod ? { _mod: n.mod } : {}
			}
		}, l = await this.frame(e.codeSet);
		await l.call("editableEnsureSource", NS.house), n.entity || await l.call("editableAddDependencies", { [t.prop]: [a.source] });
		let u = await l.call("editablePut", t.prop, c);
		if (!u.hash) throw Error("作者算不出房规条目的编号");
		let d = {
			set: PS(e.codeSet).id,
			prop: t.prop,
			hash: u.hash
		};
		await this.manage.linkHouseRule({
			house: d,
			target: t
		});
		let f = await this.after(e.codeSet), p = `house:${u.hash}`;
		return {
			house: d,
			altId: p,
			uniqueId: u.uniqueId,
			parse: f,
			campaign: r ? await this.scoped.choose(e, t, p) : e
		};
	}
	async deleteHouseRule(e, t, n) {
		return await this.manage.unlinkHouseRule(t), this.deleteEntries(e, t.prop, [n]);
	}
	async exportBrew(e, t) {
		return (await this.frame(e)).call("brewExport", t);
	}
	async exportBackup() {
		let e = {};
		for (let t of ["cn", "en"]) {
			let n = Sx.find((e) => e.kind === "official" && e.codeSet === t);
			if (!n || (await this.db.sets.get(n.id))?.status !== "installed") continue;
			let r = Sx.find((e) => e.kind === "brew" && e.codeSet === t);
			if (r) for (let n of await this.lib.brewInstalled(r.id)) {
				let r = String(n.head.docIdLocal ?? n.head.docId ?? "");
				if (!r) continue;
				let i = await this.exportBrew(t, r);
				i && (e[`brew/${t}/${i.filename ?? `${r}.json`}`] = JSON.stringify(i.body));
			}
		}
		return e["scopes.json"] = JSON.stringify(await this.exportScopes()), e["house-rules.json"] = JSON.stringify(await this.manage.houseRules()), e;
	}
	async importBackup(e) {
		let t = [], n = 0, r = 0, i = 0;
		for (let [r, i] of Object.entries(e)) {
			if (!r.startsWith("brew/")) continue;
			let [, e, ...a] = r.split("/"), o = Sx.find((t) => t.kind === "brew" && t.codeSet === e);
			if (!o) t.push(`不认识的自制来源：${e}`);
			else try {
				let e = await this.lib.brewImport(o.id, [{
					name: a.join("/"),
					text: i
				}]);
				n += e.value?.added?.length ?? 0, t.push(...e.errors);
			} catch (e) {
				t.push(`${r}: ${e instanceof Error ? e.message : String(e)}`);
			}
		}
		let a = e["scopes.json"];
		if (a) try {
			let e = JSON.parse(a), t = await this.importScopes(e);
			r = t.scopes + t.assignments;
		} catch (e) {
			t.push(`scopes.json: ${e instanceof Error ? e.message : String(e)}`);
		}
		let o = e["house-rules.json"];
		if (o) try {
			let e = JSON.parse(o);
			for (let t of e) await this.manage.linkHouseRule(t), i++;
		} catch (e) {
			t.push(`house-rules.json: ${e instanceof Error ? e.message : String(e)}`);
		}
		return this.scoped.reset(), {
			brews: n,
			scopes: r,
			houseRules: i,
			errors: t
		};
	}
	async exportScopes(e) {
		let t = await this.manage.assignments(), n = Object.fromEntries([...t].filter(([t]) => !e || e.includes(t)));
		return {
			format: "trpg-library-scopes",
			version: 1,
			scopes: await this.manage.userScopes(),
			assignments: n
		};
	}
	async importScopes(e) {
		if (e.format !== "trpg-library-scopes" || e.version !== 1) throw Error("不是范围设置文件，或版本不认识");
		for (let t of e.scopes) await this.manage.addScope(t);
		for (let [t, n] of Object.entries(e.assignments)) await this.manage.setAssignment(t, n);
		return this.scoped.reset(), {
			scopes: e.scopes.length,
			assignments: Object.keys(e.assignments).length
		};
	}
	async previewImport(e, t) {
		let n = PS(e), r = `${e}:preview:${Date.now()}`, i = await this.db.kv.where("scope").equals(e).toArray();
		await this.db.kv.bulkPut(i.map((e) => ({
			...e,
			scope: r
		})));
		let a = await this.lib.openFrameIn(e, r);
		try {
			let r = new Set((await a.call("brewDocIndex")).map((e) => e.docIdLocal)), i = await a.call("brewAddFiles", t), o = await a.call("brewDocIndex"), s = wx(e), c = {};
			for (let e of new Set(o.flatMap((e) => Object.keys(e.props)))) {
				let t = await this.db.derived.get(dS(s.id, e));
				t && (c[e] = new Set(t.value.hashes.filter((e) => !!e)));
			}
			let l = o.filter((e) => !r.has(e.docIdLocal)), u = new Set(l.map((e) => e.docIdLocal)), d = wS(c, o).filter((e) => e.others.some((e) => u.has(e)));
			return {
				set: n.id,
				files: l.map((e) => ({
					filename: e.filename,
					entries: Object.values(e.props).reduce((e, t) => e + t.filter(Boolean).length, 0)
				})),
				newEntries: l.reduce((e, t) => e + Object.values(t.props).reduce((e, t) => e + t.filter(Boolean).length, 0), 0) - d.length,
				alternatives: d.map((e) => ({
					prop: e.prop,
					hash: e.hash,
					base: e.base.kind === "official" ? "official" : e.base.docIdLocal
				})),
				notJson: i.value.notJson,
				authorErrors: i.errors
			};
		} finally {
			a.close(), await this.db.kv.where("scope").anyOf(r, `${r}:local`).delete();
		}
	}
}, IS = (e) => String(e ?? "").toLowerCase();
function LS(e) {
	return typeof e?._versionBase_hash == "string" ? "version" : e?._isSubRace && e._baseName ? "subrace" : e?.genericVariant?.name && typeof e.baseItem == "string" ? "variant" : null;
}
function RS(e, t, n) {
	if (t === "version") return e._versionBase_hash;
	if (t === "subrace") return n.get(`${IS(e._baseName)}|${IS(e._baseSource ?? e.source)}`) ?? null;
	let [r, i] = String(e.baseItem).split("|");
	return n.get(`${IS(r)}|${IS(i)}`) ?? null;
}
function zS(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let t of [!0, !1]) e.items.forEach((r, i) => {
		let a = e.hashes[i];
		!LS(r) === t && r?.name && a && n.set(`${IS(r._rawName ?? r.name)}|${IS(r.source)}`, a);
	});
	let r = [];
	return e.items.forEach((i, a) => {
		let o = LS(i), s = e.hashes[a];
		if (!o || !s) return;
		let c = RS(i, o, n), l = c ? t(c) : null;
		c && l && r.push({
			hash: s,
			kind: o,
			mother: l,
			ownMother: c,
			it: i
		});
	}), r;
}
var BS = (e) => `${IS(e.it.genericVariant.name)}|${IS(e.it.genericVariant.source)}`;
function VS(e, t, n, r, i = {}) {
	let a = i.templates ?? [], o = new Map(a.filter((e) => e.eng).map((e) => [`${IS(e.name)}|${IS(e.source)}`, `${IS(e.eng)}|${IS(e.source)}`])), s = new Set(n.hashes.filter((e) => !!e)), c = (t) => {
		let n = r[e]?.[t]?.enHash;
		return n && s.has(n) ? n : null;
	}, l = zS(n, (e) => e), u = {
		generated: t.items.filter((e) => LS(e)).length,
		paired: 0,
		kept: 0,
		unmatched: 0,
		noMother: 0
	}, d = /* @__PURE__ */ new Set();
	for (let e of zS(t, () => "any")) c(e.hash) && (d.add(e.hash), u.kept++);
	let f = (e, t) => `${e.kind}|${e.mother}|${IS(e.it.source)}|${t ?? ""}`, p = /* @__PURE__ */ new Map();
	for (let e of l) {
		let t = f(e, e.kind === "variant" ? BS(e) : null);
		p.set(t, [...p.get(t) ?? [], e]);
	}
	let m = (e) => IS(e.kind === "subrace" ? e.it._subraceName : e.it.name);
	for (let n = 0; n < 2; n++) {
		let n = zS(t, c), a = /* @__PURE__ */ new Map();
		for (let e of n) {
			let t = e.kind === "variant" ? o.get(BS(e)) ?? null : null;
			if (e.kind === "variant" && !t) continue;
			let n = f(e, t);
			a.set(n, [...a.get(n) ?? [], e]);
		}
		for (let [t, n] of a) {
			let a = p.get(t) ?? [];
			for (let t of n) {
				if (d.has(t.hash)) continue;
				let o, s = t.kind === "version" ? i.versions?.cn[e]?.[t.ownMother] : void 0, c = t.kind === "version" ? i.versions?.en[e]?.[t.mother] : void 0, l = s?.indexOf(t.hash) ?? -1;
				if (s && c && s.length === c.length && l >= 0 && (o = a.find((e) => e.hash === c[l])), !o && n.length === 1 && a.length === 1 && (o = a[0]), !o) {
					let e = a.filter((e) => m(e) === IS(t.it.ENG_name));
					e.length === 1 && (o = e[0]);
				}
				o && ((r[e] ??= {})[t.hash] = {
					enHash: o.hash,
					enSource: o.it.source ?? null,
					via: "generated"
				}, d.add(t.hash), u.paired++);
			}
		}
	}
	return u.noMother = u.generated - zS(t, c).length, u.unmatched = u.generated - d.size - u.noMother, u;
}
async function HS(e, t) {
	let n = [];
	for (let r of Object.keys(e)) {
		let [e, i] = await Promise.all([t.parsed("cn", r), t.parsed("en", r)]);
		e && i && e.items.some((e) => LS(e)) && n.push({
			prop: r,
			cn: e,
			en: i
		});
	}
	let r = n.filter((e) => e.cn.items.some((e) => LS(e) === "version")).map((e) => e.prop), i = {
		templates: n.some((e) => e.cn.items.some((e) => LS(e) === "variant")) ? await t.templates() : [],
		versions: r.length ? {
			cn: await t.versions("cn", r),
			en: await t.versions("en", r)
		} : {
			cn: {},
			en: {}
		}
	}, a = {};
	for (let t of n) a[t.prop] = VS(t.prop, t.cn, t.en, e, i);
	return a;
}
// src/library/parsed-memo.ts
var US = 4, WS = class {
	db;
	memo = /* @__PURE__ */ new Map();
	constructor(e) {
		this.db = e;
		let t = `idb://${e.name}/derived/`;
		Db.on("storagemutated", (e) => {
			Object.keys(e).some((e) => e.startsWith(t)) && this.memo.clear();
		});
	}
	get(e) {
		let t = this.memo.get(e);
		if (t) return this.memo.delete(e), this.memo.set(e, t), t;
		let n = this.db.derived.get(e).then((e) => e?.value);
		return n.catch(() => this.memo.delete(e)), this.memo.set(e, n), this.memo.size > US && this.memo.delete(this.memo.keys().next().value), n;
	}
}, GS = (e) => e instanceof Error ? e.message : String(e);
async function KS({ source: e, db: t, openFrame: n, openFrameIn: r }) {
	let i = Date.now(), a = {
		source: e.id,
		installed: [],
		parse: {
			props: {},
			notRun: [],
			errors: [],
			authorErrors: []
		},
		alternatives: {
			targets: 0,
			errors: []
		},
		ms: 0
	};
	await t.derived.where("key").startsWith(`parsed:${e.id}:`).delete(), await iS(t, e.id, ["fluff", "excluded"]);
	let o = await n();
	try {
		a.installed = (await o.call("brewInstalled")).map((e) => e.head);
		for (let n of await o.call("loaders")) if (n.kind === "corpus") a.parse.notRun.push({
			props: n.props,
			reason: "自制里的书和冒险正文按本取，用到再解析（B2-7 未做）"
		});
		else for (let r of n.props) if (!r.startsWith("raw_")) try {
			let n = await o.call("parseBrewProp", r);
			if (!n.items.length) continue;
			await t.derived.put({
				key: dS(e.id, r),
				fingerprint: "brew",
				value: n,
				savedAt: Date.now()
			}), a.parse.props[r] = {
				count: n.items.length,
				noHash: n.hashes.filter((e) => e === null).length
			};
		} catch (e) {
			a.parse.errors.push({
				prop: r,
				error: GS(e)
			});
		}
		a.parse.authorErrors = await o.call("frameErrors");
		let n = await AS({
			source: e,
			db: t,
			frame: o,
			openFrameIn: r
		});
		a.alternatives = {
			targets: Object.keys(n.targets).length,
			errors: n.errors
		};
		try {
			a.precompute = await tS({
				source: e,
				db: t,
				frame: o,
				fluff: !0,
				excluded: !0,
				search: !1
			});
		} catch (e) {
			a.parse.errors.push({
				prop: "(预计算缓存)",
				error: GS(e)
			});
		}
	} finally {
		o.close();
	}
	return a.ms = Date.now() - i, await t.derived.put({
		key: `audit:${e.id}`,
		fingerprint: "brew",
		value: a,
		savedAt: Date.now()
	}), a;
}
// src/library/health.ts
var qS = 50;
function JS(e, t, n, r, i, a = {}) {
	return {
		source: e,
		check: t,
		level: n,
		title: r,
		count: i.length,
		details: i.slice(0, qS),
		...a
	};
}
var YS = (e, t) => e.length ? t : "ok";
function XS(e, { value: t, stale: n }) {
	let r = n ? { stale: n } : {}, i = Object.entries(t.parse.corpora).flatMap(([e, t]) => t.failed.map((t) => ({
		prop: e,
		...t
	}))), a = Object.entries(t.parse.props).filter(([, e]) => e.noHash).map(([e, t]) => ({
		prop: e,
		noHash: t.noHash,
		count: t.count
	})), o = Object.entries(t.index).filter(([, e]) => e.onlyParsed || e.onlyIndex).map(([e, t]) => ({
		prop: e,
		...t
	}));
	return [
		JS(e, "download", YS(t.download.failed, "error"), "下载失败的文件", t.download.failed, {
			layer: 1,
			...r
		}),
		JS(e, "mirror", YS([...t.mirror.missing, ...t.mirror.mismatched], "error"), `本地和云端对不上的文件（核对了 ${t.mirror.checked} 个）`, [...t.mirror.missing.map((e) => ({
			path: e,
			problem: "missing"
		})), ...t.mirror.mismatched.map((e) => ({
			path: e,
			problem: "mismatched"
		}))], {
			layer: 1,
			...r
		}),
		JS(e, "parse", YS([...t.parse.errors, ...i], "error"), `作者加载器解析出错的类别或书（解析了 ${Object.keys(t.parse.props).length} 类）`, [...t.parse.errors, ...i], {
			layer: 2,
			...r
		}),
		JS(e, "no-hash", YS(a, "warn"), "作者编号规则算不出编号的条目（按类别）", a, {
			layer: 2,
			...r
		}),
		JS(e, "not-run", YS(t.parse.notRun, "info"), "没有整类解析的（作者规则，附原因）", t.parse.notRun, {
			layer: 2,
			...r
		}),
		JS(e, "index", YS(o, "info"), "解析结果和作者搜索索引的差异（辅助参考，不当作漏解析的证明）", o, {
			layer: 5,
			...r
		})
	];
}
function ZS(e, { value: t, stale: n }) {
	let r = n ? { stale: n } : {}, i = {};
	for (let e of t.unpaired) i[e.reason] = (i[e.reason] ?? 0) + 1;
	let a = Object.values(t.props).reduce((e, t) => e + t.total, 0), o = Object.values(t.props).reduce((e, t) => e + t.paired, 0);
	return [JS(e, "english", YS(t.unpaired, "info"), `没配上英文的条目（${o}/${a} 配上；按原因：${Object.entries(i).map(([e, t]) => `${e} ${t}`).join("、") || "无"}）`, t.unpaired, r), JS(e, "english-name", YS(t.nameMismatch, "warn"), "配上的中英两条里，中文的英文名和英文条目名字不一样（只列不改）", t.nameMismatch, r)];
}
function QS(e, { value: t, stale: n }) {
	let r = { ...n ? { stale: n } : {} }, i = Object.entries(t.layer3).filter(([, e]) => e.d.rawOnly + e.d.parsedOnly + e.d.rawNoHash).map(([e, t]) => ({
		prop: e,
		rawOnly: t.d.rawOnly,
		parsedOnly: t.d.parsedOnly,
		rawNoHash: t.d.rawNoHash,
		samples: t.d.samples
	})), a = Object.entries(t.layer4).flatMap(([e, t]) => Object.entries(t.suspicious).map(([t, n]) => ({
		prop: e,
		diff: t,
		count: n.count,
		samples: n.samples
	})));
	return [JS(e, "layer3", YS(i, "warn"), `审计第 3 层（不漏）：原始和解析后对不上、又没有解析标记能解释的（按类别；结构定义 ${t.schemaVersion}）`, i, {
		layer: 3,
		...r
	}), JS(e, "layer4", YS(a, "warn"), "审计第 4 层（只有解析处不同）：解析前后不一样、又不是加载器加的字段或带解析标记的（按类别、字段）", a, {
		layer: 4,
		...r
	})];
}
function $S(e) {
	let t = e.source.id, n = [];
	if (e.brew) {
		let { value: r, stale: i } = e.brew, a = i ? { stale: i } : {};
		n.push(JS(t, "brew-parse", YS(r.parse.errors, "error"), `自制内容解析出错的类别（已装 ${r.installed.length} 个包）`, r.parse.errors, {
			layer: 2,
			...a
		}), JS(t, "brew-author-errors", YS(r.parse.authorErrors, "warn"), "解析时作者报的错（自制内容本身的问题，例如引用了找不到的条目）", r.parse.authorErrors, a), JS(t, "not-run", YS(r.parse.notRun, "info"), "没有解析的（附原因）", r.parse.notRun, a));
		let o = r.alternatives ?? {
			targets: 0,
			errors: []
		};
		n.push(JS(t, "brew-alternatives", "info", `和官方或先装的包同编号、挂成备选的条目：${o.targets} 条（原件照常生效，用户选了才换）`, [], {
			count: o.targets,
			...a
		})), o.errors.length && n.push(JS(t, "brew-alternatives-errors", "warn", "同编号的条目，取备选版本失败的", o.errors, a));
	}
	if (e.officialMissing && n.push(JS(t, "brew-skipped", "info", `${e.officialMissing} 还没安装，作者程序开不起来，自制的检查跳过`, [])), e.brewStorage) {
		let r = e.brewStorage.filter((e) => !e.shown);
		n.push(JS(t, "brew-hidden", YS(r, "warn"), "存进了作者包管理器、但作者不显示也不加载的包（作者规则：没有来源 _meta.sources 的包被滤掉）", r));
	}
	if (e.brewStorage && e.brewSourceCounts) {
		let r = e.brewSourceCounts, i = e.brewStorage.filter((e) => e.shown && e.sources.every((e) => !r[e.toLowerCase()])).map((e) => ({
			...e.head,
			sources: e.sources
		}));
		n.push(JS(t, "brew-empty", YS(i, "warn"), "显示了、但它声明的来源一条内容都没解析出来的包", i));
	}
	return n;
}
function eC(e) {
	let t = e.source.id;
	if (!e.installed && e.source.kind === "official") return [JS(t, "not-installed", "info", "还没安装", [])];
	let n = [];
	return e.install && n.push(...XS(t, e.install)), e.english ? n.push(...ZS(t, e.english)) : e.source.pair && e.installed && n.push(JS(t, "english", "info", "还没算中英配对覆盖率", [])), e.layers34 ? n.push(...QS(t, e.layers34)) : e.source.kind === "official" && n.push(JS(t, "layer3", "info", "审计第 3、4 层只在验证程序里跑（要用作者结构定义 5etools-utils，不随插件发布），这里没有结果", [], { layer: 3 })), e.source.kind === "brew" && n.push(...$S(e)), n;
}
function tC(e, t = Date.now()) {
	let n = {
		ok: 0,
		info: 0,
		warn: 0,
		error: 0
	};
	for (let t of e) n[t.level]++;
	return {
		at: t,
		items: e,
		summary: n
	};
}
// src/library/service.ts
var nC = class {
	opts;
	frames = /* @__PURE__ */ new Map();
	pairsCache = /* @__PURE__ */ new Map();
	searchLoaded = /* @__PURE__ */ new Map();
	parsedMemo;
	constructor(e) {
		this.opts = e, this.parsedMemo = new WS(e.db);
	}
	frameOf(e) {
		return this.frame(e);
	}
	frame(e) {
		let t = this.frames.get(e);
		return t || (t = this.opts.openFrame(e), t.catch(() => this.frames.delete(e)), this.frames.set(e, t)), t;
	}
	reset() {
		for (let e of this.frames.values()) e.then((e) => e.close(), (e) => console.warn("[trpg-library] 小窗本来就没开成", e));
		this.frames.clear(), this.pairsCache.clear(), this.searchLoaded.clear();
	}
	async precompute(e, t = {}) {
		let n = Cx(e), r = await this.frame(n.codeSet);
		return tS({
			source: n,
			db: this.opts.db,
			frame: r,
			prop: t.prop,
			fluff: t.fluff ?? !0,
			excluded: t.excluded ?? !0,
			search: t.search ?? n.kind === "official"
		});
	}
	async ensure(e, t) {
		await rS({
			source: Cx(e),
			db: this.opts.db,
			openFrame: (e) => this.opts.openFrame(e),
			...t
		});
	}
	async parsed(e, t) {
		let n = await this.parsedMemo.get(dS(e, t)), r = n === void 0 ? void 0 : { value: n };
		if (!r && Cx(e).kind === "brew") {
			let n = await this.opts.db.derived.get(`audit:${e}`), r = (n?.value)?.parse.errors ?? [];
			if (n && !r.some((e) => e.prop === t)) return {
				items: [],
				hashes: [],
				sources: []
			};
		}
		if (!r) throw Error(`${e} 没有这一类的解析结果：${t}（未安装，或这一类解析失败，见体检）`);
		return r.value;
	}
	async report(e) {
		let t = await this.opts.db.derived.get(`audit:${e}`);
		if (!t) throw Error(`${e} 还没安装`);
		return t.value;
	}
	async categories(e) {
		let t = await this.report(e);
		return Object.fromEntries(Object.entries(t.parse.props).map(([e, t]) => [e, t.count]));
	}
	async query(e, t, { source: n, includeExcluded: r = !1 } = {}) {
		await this.ensure(e, {
			prop: t,
			excluded: !0
		});
		let i = await this.parsed(e, t), a = await oS(this.opts.db, e, t);
		if (a && i.hashes.some((e) => e && a[e] === void 0)) throw Error(`缓存里的「${t}」屏蔽表和解析结果对不上，不猜`);
		let o = n?.toLowerCase(), s = [];
		return i.items.forEach((e, t) => {
			let n = a?.[i.hashes[t] ?? ""] ?? !1;
			n && !r || o !== void 0 && i.sources[t]?.toLowerCase() !== o || s.push({
				hash: i.hashes[t],
				source: i.sources[t],
				excluded: n,
				item: e
			});
		}), s;
	}
	async corpus(e, t, n) {
		let r = await this.opts.db.derived.get(dS(e, t, n));
		if (!r) throw Error(`${e} 没有这本的全文：${t} ${n}`);
		return r.value;
	}
	async storedItem(e, t, n) {
		let r = await this.parsed(e, t).catch(() => null), i = r ? r.hashes.indexOf(n) : -1;
		return r && i >= 0 ? {
			item: r.items[i],
			source: r.sources[i]
		} : null;
	}
	async detail(e, t, n, r) {
		await this.ensure(e, {
			prop: t,
			fluff: !0,
			excluded: !0
		});
		let i = await this.storedItem(e, t, n);
		if (!i) return null;
		let a = await aS(this.opts.db, e, t, n), o = await oS(this.opts.db, e, t);
		return {
			item: i.item,
			hash: n,
			source: i.source,
			excluded: o?.[n] ?? !1,
			fluff: a?.fluff ?? null,
			fluffError: a?.fluffError ?? null,
			engSiteHash: a?.engSiteHash ?? null,
			english: await this.english(Cx(e), t, n)
		};
	}
	async fluff(e, t, n) {
		return aS(this.opts.db, e, t, n);
	}
	async english(e, t, n, { fluff: r = !0 } = {}) {
		if (!e.pair) return null;
		let i = Cx(e.pair);
		if (!await this.bothInstalled(e, i)) return { status: "not-installed" };
		let a = (await this.englishPairs(e.id)).pairs[t]?.[n];
		if (!a) return { status: "not-paired" };
		let o = await this.storedItem(i.id, t, a.enHash);
		if (!o) return {
			status: "not-found",
			hash: a.enHash
		};
		let s = r ? await aS(this.opts.db, i.id, t, a.enHash) : null;
		return {
			status: "found",
			hash: a.enHash,
			via: a.via,
			item: o.item,
			fluff: s?.fluff ?? null
		};
	}
	async bothInstalled(e, t) {
		let [n, r] = await Promise.all([this.opts.db.sets.get(e.id), this.opts.db.sets.get(t.id)]);
		return n?.status === "installed" && r?.status === "installed";
	}
	englishPairs(e) {
		let t = this.pairsCache.get(e);
		return t || (t = this.buildEnglishPairs(e), t.catch(() => this.pairsCache.delete(e)), this.pairsCache.set(e, t)), t;
	}
	async buildEnglishPairs(e) {
		let t = Cx(e);
		if (!t.pair) throw Error(`${e} 没有登记配对的另一种语言`);
		let n = Cx(t.pair);
		if (!await this.bothInstalled(t, n)) throw Error(`${t.id} 或 ${n.id} 还没安装，不能配对`);
		let r = `english:${t.id}`, i = `${Ox(t)}+${Ox(n)}+gen4`, a = await this.opts.db.derived.get(r);
		if (a?.fingerprint === i) return a.value;
		let o = await this.opts.openFrame(t.codeSet), s = await this.opts.openFrame(n.codeSet).catch((e) => {
			throw o.close(), e;
		});
		try {
			let e = await o.call("englishLocators"), a = await s.call("englishMatch", e), c = {
				source: t.id,
				pair: n.id,
				pairs: {},
				unmatched: [],
				via: {},
				located: e.length
			};
			for (let e of a) e.enHash ? ((c.pairs[e.prop] ??= {})[e.hash] = {
				enHash: e.enHash,
				enSource: e.enSource,
				via: e.via
			}, c.via[e.via ?? "none"] = (c.via[e.via ?? "none"] ?? 0) + 1) : c.unmatched.push({
				prop: e.prop,
				hash: e.hash,
				...e.error ? { error: e.error } : {}
			});
			return c.generated = await HS(c.pairs, {
				parsed: (e, r) => this.parsed(e === "cn" ? t.id : n.id, r).catch(() => null),
				templates: () => o.call("variantTemplateNames"),
				versions: (e, t) => (e === "cn" ? o : s).call("versionOrder", t)
			}), c.via.generated = Object.values(c.generated).reduce((e, t) => e + t.paired, 0), await this.opts.db.derived.put({
				key: r,
				fingerprint: i,
				value: c,
				savedAt: Date.now()
			}), c;
		} finally {
			o.close(), s.close();
		}
	}
	async search(e, t, { showLegacy: n } = {}) {
		await this.ensure(e, { search: !0 });
		let r = Cx(e), i = await this.frame(r.codeSet), a = await sS(this.opts.db, e);
		if (a) {
			let e = `${String(a.base ?? "")}|${String(a.exclude ?? "")}|${String(a.manage ?? "")}`;
			this.searchLoaded.get(r.codeSet) !== e && (await i.call("searchIndexLoad", a), this.searchLoaded.set(r.codeSet, e));
		}
		return i.call("search", t, n ?? null);
	}
	async searchSettings(e, t = {}) {
		return (await this.frame(Cx(e).codeSet)).call("searchSettings", t);
	}
	async setBookExcluded(e, t, n) {
		let r = Cx(e);
		await (await this.frame(r.codeSet)).call("setSourceExcluded", t, n), await iS(this.opts.db, e, ["excluded"]), await iS(this.opts.db, wx(r.codeSet).id, ["search"]), this.searchLoaded.delete(r.codeSet);
	}
	brewSource(e) {
		let t = Cx(e);
		if (t.kind !== "brew") throw Error(`${e} 不是自制源`);
		return t;
	}
	async brewCatalog(e) {
		return (await this.frame(this.brewSource(e).codeSet)).call("brewCatalog");
	}
	async brewInstalled(e) {
		return (await this.frame(this.brewSource(e).codeSet)).call("brewInstalled");
	}
	openFrameIn(e, t) {
		return this.opts.openFrame(e, t);
	}
	reparseBrew(e) {
		return this.afterBrewChange(this.brewSource(e));
	}
	async afterBrewChange(e) {
		this.reset();
		let t = await KS({
			source: e,
			db: this.opts.db,
			openFrame: () => this.opts.openFrame(e.codeSet),
			openFrameIn: (t) => this.opts.openFrame(e.codeSet, t)
		});
		await iS(this.opts.db, wx(e.codeSet).id, ["search"]), this.searchLoaded.delete(e.codeSet);
		try {
			await this.opts.onDataChanged?.(e.codeSet);
		} catch (e) {
			t.precomputeError = e instanceof Error ? e.message : String(e);
		}
		return t;
	}
	async brewAddUrl(e, t) {
		let n = this.brewSource(e);
		return {
			...await (await this.frame(n.codeSet)).call("brewAddUrl", t),
			parse: await this.afterBrewChange(n)
		};
	}
	async brewImport(e, t) {
		let n = this.brewSource(e);
		return {
			...await (await this.frame(n.codeSet)).call("brewAddFiles", t),
			parse: await this.afterBrewChange(n)
		};
	}
	async brewDelete(e, t) {
		let n = this.brewSource(e);
		return {
			...await (await this.frame(n.codeSet)).call("brewDelete", t),
			parse: await this.afterBrewChange(n)
		};
	}
	async brewPull(e, t = null) {
		let n = this.brewSource(e), r = await (await this.frame(n.codeSet)).call("brewPull", t);
		return {
			...r,
			parse: r.value.length ? await this.afterBrewChange(n) : null
		};
	}
	async englishCoverage(e) {
		let t = Cx(e), n = await this.englishPairs(t.id), r = new Set(n.unmatched.map((e) => `${e.prop}\u0000${e.hash}`)), i = {
			source: t.id,
			pair: n.pair,
			props: {},
			via: n.via,
			unpaired: [],
			nameMismatch: []
		};
		for (let e of Object.keys((await this.report(t.id)).parse.props)) {
			let a = await this.parsed(t.id, e), o = await this.opts.db.derived.get(dS(n.pair, e)), s = o ? o.value : null, c = new Map((s?.hashes ?? []).map((e, t) => [e, t])), l = i.props[e] = {
				total: a.items.length,
				paired: 0,
				nameMismatch: 0
			};
			a.hashes.forEach((t, o) => {
				let u = t ? n.pairs[e]?.[t] : void 0, d = null;
				if (u ? c.has(u.enHash) || (d = "english-not-in-parsed") : d = t && r.has(`${e}\u0000${t}`) ? "no-english-record" : "not-in-index", !d) {
					l.paired++;
					let n = a.items[o].ENG_name, r = s.items[c.get(u.enHash)].name;
					n !== void 0 && n !== r && (l.nameMismatch++, i.nameMismatch.push({
						prop: e,
						hash: t,
						enHash: u.enHash,
						via: u.via,
						engName: n,
						enName: r
					}));
				} else l[d] = (l[d] ?? 0) + 1, i.unpaired.push({
					prop: e,
					hash: t,
					reason: d,
					...u ? { enHash: u.enHash } : {}
				});
			});
		}
		return await this.opts.db.derived.put({
			key: `audit:english:${t.id}`,
			fingerprint: `${Ox(t)}+${Ox(Cx(n.pair))}`,
			value: i,
			savedAt: Date.now()
		}), i;
	}
	async stored(e, t) {
		let n = await this.opts.db.derived.get(e);
		return n ? {
			value: n.value,
			stale: !t(n.fingerprint)
		} : void 0;
	}
	async health() {
		let e = [];
		for (let t of Sx) {
			let n = Ox(t), r = await this.opts.db.sets.get(t.id), i = t.pair ? Ox(Cx(t.pair)) : "", a = {
				source: t,
				installed: r?.status === "installed",
				install: t.kind === "official" ? await this.stored(`audit:${t.id}`, (e) => e === n) : void 0,
				brew: t.kind === "brew" ? await this.stored(`audit:${t.id}`, () => !0) : void 0,
				english: await this.stored(`audit:english:${t.id}`, (e) => e === `${n}+${i}`),
				layers34: await this.stored(`audit:layers34:${t.id}`, (e) => e.startsWith(`${n}+`))
			};
			t.kind === "brew" && (await this.opts.db.sets.get(wx(t.codeSet).id))?.status !== "installed" ? a.officialMissing = wx(t.codeSet).id : t.kind === "brew" && (a.brewStorage = await (await this.frame(t.codeSet)).call("brewStorage"), a.brewSourceCounts = await this.brewSourceCounts(t.id)), e.push(...eC(a));
		}
		return tC(e);
	}
	async brewSourceCounts(e) {
		let t = {};
		for (let n of await this.opts.db.derived.where("key").startsWith(`parsed:${e}:`).toArray()) for (let e of n.value.sources) e && (t[e.toLowerCase()] = (t[e.toLowerCase()] ?? 0) + 1);
		return t;
	}
}, rC = (e) => e instanceof Error ? e.message : String(e), iC = class {
	opts;
	tasks = /* @__PURE__ */ new Map();
	seq = 0;
	constructor(e) {
		this.opts = e;
	}
	list() {
		return [...this.tasks.values()].map((e) => ({ ...e.state }));
	}
	get(e) {
		let t = this.tasks.get(e);
		return t ? { ...t.state } : null;
	}
	wait(e) {
		let t = this.tasks.get(e);
		if (!t) throw Error(`没有这个任务：${e}`);
		return t.done;
	}
	cancel(e) {
		this.tasks.get(e)?.abort.abort();
	}
	start(e, t, n, r) {
		let i = [...this.tasks.values()].find((r) => r.state.status === "running" && r.state.kind === e && r.state.set === t && r.state.item === n);
		if (i) return i.state.id;
		let a = `task-${++this.seq}`, o = new AbortController(), s = {
			id: a,
			kind: e,
			set: t,
			item: n,
			status: "running",
			progress: {
				stage: "start",
				done: 0,
				total: 0
			},
			error: null,
			result: null
		}, c = (async () => {
			try {
				s.result = await r(s, o.signal), s.status = o.signal.aborted ? "cancelled" : "done";
			} catch (e) {
				s.status = o.signal.aborted ? "cancelled" : "failed", s.error = rC(e);
			}
			return this.opts.onChange?.({ ...s }), { ...s };
		})();
		return this.tasks.set(a, {
			state: s,
			abort: o,
			done: c
		}), a;
	}
	progress(e, t) {
		e.progress = t, this.opts.onChange?.({ ...e });
	}
	startOfficial(e) {
		let t = Cx(e);
		return this.start("official", e, null, async (n, r) => {
			let i = await fS({
				source: t,
				db: this.opts.db,
				files: this.opts.files,
				openFrame: () => this.opts.openFrame(t.codeSet),
				signal: r,
				onProgress: (e) => this.progress(n, e)
			});
			if (!i.cancelled && i.download.failed.length) throw Error(`有 ${i.download.failed.length} 个文件没下载下来：${i.download.failed[0].path}`);
			if (!i.cancelled && this.opts.precompute) try {
				n.convert = await this.opts.precompute(e, r, (e) => this.progress(n, e));
			} catch (e) {
				n.convertError = rC(e);
			}
			return i;
		});
	}
	startPrecompute(e) {
		return this.start("precompute", e, null, async (t, n) => {
			if (!this.opts.precompute) throw Error("没有接换算后端");
			return t.convert = await this.opts.precompute(e, n, (e) => this.progress(t, e)), t.convert;
		});
	}
	startAdventure(e, t) {
		let n = Cx(e);
		return this.start("adventure", e, t, async (r, i) => {
			if ((await this.opts.db.sets.get(e))?.status !== "installed") throw Error(`${e} 还没安装，先装官方数据`);
			let a = await this.opts.openFrame(n.codeSet);
			try {
				let o = (await a.call("loaders")).find((e) => e.kind === "corpus" && e.props.includes("adventureData"));
				if (!o?.index || !o.page) throw Error("作者加载器登记表里没有冒险");
				let s = o.props[0], c = (await a.call("corpusList", o.index, s, o.page)).find((e) => e.id === t);
				if (!c) throw Error(`作者冒险书目里没有：${t}`);
				let l = await a.call("corpusFile", s, t);
				if (this.progress(r, {
					stage: "download",
					done: 0,
					total: 1,
					item: l
				}), i.aborted) return null;
				if (await this.opts.files.get(n, l, { allowNetwork: !0 }) === null) throw Error(`锁定版本的文件清单里没有这本冒险的正文：${l}`);
				if (i.aborted) return {
					path: l,
					parsed: !1
				};
				this.progress(r, {
					stage: "parse",
					done: 1,
					total: 1,
					item: t
				});
				let u = await a.call("parseCorpus", o.page, c.source, c.hash);
				return await this.opts.db.derived.put({
					key: dS(e, s, t),
					fingerprint: (await this.opts.db.sets.get(e))?.commit,
					value: u,
					savedAt: Date.now()
				}), {
					path: l,
					parsed: !0
				};
			} finally {
				a.close();
			}
		});
	}
};
// src/rules/kernel/host.ts
function aC(e) {
	let t = wx("en");
	return (n) => e.get(t, n, { allowNetwork: !1 });
}
function oC({ pluginRoot: e, data: t, fetchImpl: n = fetch }) {
	let r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
	return {
		file: async (r) => {
			if (r.startsWith("data/")) return t(r);
			let i = /^modules\/plutonium\/data\/(.+)$/.exec(r);
			if (i) {
				let e = await t(`data/${i[1]}`);
				if (e !== null) return e;
			}
			if (/^(packs|modules)\//.test(r)) {
				let t = await n(new URL(`vendor/foundry/${r}`, e));
				if (t.status === 404) return null;
				if (!t.ok) throw Error(`读取插件文件失败（${t.status}）：${r}`);
				return t.text();
			}
			return null;
		},
		kvGet: async (e) => r.get(e) ?? null,
		kvSet: async (e, t) => {
			r.set(e, t);
		},
		kvRemove: async (e) => {
			r.delete(e);
		},
		localSnapshot: async () => Object.fromEntries(i),
		localSet: async (e, t) => {
			i.set(e, t);
		},
		localRemove: async (e) => {
			i.delete(e);
		}
	};
}
async function sC({ pluginRoot: e, container: t, data: n, fetchImpl: r, timeoutMs: i = 12e4 }) {
	let a = await Ix({
		codeSet: "foundry",
		pluginRoot: e,
		container: t,
		timeoutMs: i,
		handlers: oC({
			pluginRoot: e,
			data: n,
			fetchImpl: r
		})
	}), o = a.call;
	return {
		frame: a,
		boot: (e) => o("boot", e),
		call: (e, ...t) => o(e, ...t),
		close: () => a.close()
	};
}
// src/rules/kernel/input.ts
var cC = { dnd5e2014: {
	"dnd5e.rulesVersion": "legacy",
	"dnd5e.firstRun": !1
} }, lC = { "plutonium.config": {
	import: {
		isSkipCompendiumImageFetch: !0,
		isNoPrereleaseBrewIndexes: !0
	},
	importCreature: { isUseTokenImageAsPortrait: !0 },
	importVehicle: { isUseTokenImageAsPortrait: !0 },
	importObject: { isUseTokenImageAsPortrait: !0 }
} };
async function uC(e, t, n) {
	let r = await n(new URL(`vendor/foundry/${t}`, e));
	if (!r.ok) throw Error(`读取结算内核文件失败（${r.status}）：${t}`);
	return r.json();
}
async function dC(e) {
	let t = e.fetchImpl ?? fetch, n = cC[e.rule];
	if (!n) throw Error(`结算内核还不支持这个规则：${e.rule}`);
	let r = await uC(e.pluginRoot, "manifest.json", t), i = r.system.split(" ")[0], a = await uC(e.pluginRoot, `systems/${i}/system.json`, t), o = await Promise.all(Object.keys(r.modules).map((n) => uC(e.pluginRoot, `modules/${n}/module.json`, t))), s = {
		...lC,
		...n
	}, c = await (await t(new URL("dist/kernel-frame.js", e.pluginRoot))).text(), l = Jx({
		release: r.release,
		system: r.system,
		modules: r.modules,
		settings: s,
		rule: e.rule,
		frame: qx(c)
	});
	return {
		system: a,
		modules: o,
		release: r.release,
		world: e.world,
		userId: "kernelGM00000000",
		worldTime: 0,
		language: "en.core",
		settings: s,
		cacheKey: l,
		documents: { actors: [] }
	};
}
// src/core/compress.ts
async function fC(e) {
	let t = new Blob([e]).stream().pipeThrough(new CompressionStream("gzip"));
	return new Uint8Array(await new Response(t).arrayBuffer());
}
async function pC(e) {
	let t = new Blob([e]).stream().pipeThrough(new DecompressionStream("gzip"));
	return new Response(t).text();
}
// src/rules/kernel/cache.ts
var mC = class {
	db;
	constructor(e) {
		this.db = e;
	}
	async get(e) {
		let t = (await this.db.derived.get(`kc:${e}`))?.value;
		return t ? t.z ? JSON.parse(await pC(t.z)) : "data" in t ? t.data ?? null : null : null;
	}
	async put(e, t, n) {
		let r = JSON.stringify(t), i = await fC(r);
		return await this.db.derived.put({
			key: `kc:${e}`,
			fingerprint: e,
			value: {
				z: i,
				raw: r.length,
				scope: n,
				savedAt: Date.now()
			},
			savedAt: Date.now()
		}), {
			raw: r.length,
			compressed: i.byteLength
		};
	}
	async sweep(e) {
		let t = [];
		return await this.db.derived.where("key").startsWith("kc:").each((n) => {
			let r = n.value?.scope;
			r && (r.rule !== e.rule || r.base === e.base && r.official === e.official) || t.push(n.key);
		}), await this.db.derived.bulkDelete(t), t.length;
	}
};
async function hC(e) {
	return Jx({
		base: e.base,
		dataVersion: e.dataVersion,
		kind: "base",
		id: e.actor.id ?? null,
		name: e.actor.name ?? null,
		seed: e.actor.seed ?? null,
		refs: e.actor.refs,
		choices: e.actor.choices
	});
}
async function gC(e) {
	return Jx({
		base: e.base,
		official: e.dataVersion.official,
		kind: e.kind,
		prop: e.prop,
		entry: Jx(e.entry)
	});
}
var _C = (e) => ({
	status: "complete",
	result: e,
	sources: {},
	changes: [],
	diceUsed: 0,
	missing: null,
	pending: null,
	unsupported: []
}), vC = {
	buildCharacter: (e) => [...e[0]?.items ?? [], ...e[0]?.equipment ?? []],
	rebuildCharacter: (e) => [...e[0]?.items ?? [], ...e[0]?.equipment ?? []],
	addToActor: (e) => e[1] ?? [],
	createActorsBatch: (e) => e[0] ?? []
};
function yC(e, t, n, r, i = "") {
	let a = e.call, o = async (e, r, o) => {
		let s = await o(), c = await gC({
			base: n,
			dataVersion: s,
			kind: e === "monster" ? "monster" : "build",
			prop: e,
			entry: r
		}), l = await t.get(c);
		if (l !== null) return _C(l);
		let u = await a("importForBuild", e, r);
		return u.status === "complete" && u.result && await t.put(c, u.result, {
			rule: i,
			base: n,
			official: s.official
		}), u;
	}, s = async (e, ...t) => {
		let n = null, i = () => n ??= r();
		if (e === "importForBuild") return o(t[0], t[1], i);
		if (e === "importMonsterActor" || e === "rebuildMonster") {
			let n = e === "rebuildMonster" ? t[0]?.entry : t[0], r = await o("monster", n, i);
			return r.status !== "complete" || !r.result ? r : e === "rebuildMonster" ? a(e, {
				...t[0],
				data: r.result
			}) : a("createActorFromData", r.result);
		}
		let s = vC[e]?.(t);
		for (let e of s ?? []) {
			if (e.data || !e.entry) continue;
			let t = await o(e.prop, e.entry, i);
			if (t.status !== "complete" || !t.result) return t;
			e.data = t.result;
		}
		return a(e, ...t);
	};
	return {
		...e,
		call: s
	};
}
// src/rules/kernel/entry.ts
async function bC(e, t, n, r, i) {
	if (wx(t).lang !== "zh") return {
		entry: r,
		noEnglish: !1
	};
	if (i !== "base") return {
		entry: r,
		noEnglish: !0,
		reason: "alternative"
	};
	let a = await e.englishOf(n, { fluff: !1 });
	return a?.status === "found" ? {
		entry: a.item,
		noEnglish: !1
	} : {
		entry: r,
		noEnglish: !0,
		reason: a?.status ?? "english-missing"
	};
}
// src/rules/kernel/rebuild.ts
var xC = { creature: "monster" }, SC = /* @__PURE__ */ new Set([
	"race",
	"background",
	"class",
	"subclass",
	"feat",
	"optionalfeature"
]);
async function CC(e, t) {
	let n = wx(t.codeSet);
	if (n.lang !== "zh") return (e) => {
		let t = e.propDroppable ? xC[e.propDroppable] ?? e.propDroppable : null;
		return t && e.source && e.hash ? {
			kind: e.propDroppable,
			set: n.id,
			prop: t,
			hash: e.hash
		} : null;
	};
	let r = await e.englishPairs(t.codeSet).catch(() => null), i = /* @__PURE__ */ new Map();
	if (r) for (let [e, t] of Object.entries(r.pairs)) for (let [n, r] of Object.entries(t)) i.set(`${e}|${r.enHash}`, n);
	return (e) => {
		let t = e.propDroppable ? xC[e.propDroppable] ?? e.propDroppable : null;
		if (!t || !e.source || !e.hash) return null;
		let r = i.get(`${t}|${e.hash}`);
		return r ? {
			kind: e.propDroppable,
			set: n.id,
			prop: t,
			hash: r
		} : null;
	};
}
async function wC(e, t) {
	return (await e.call("preparedActors")).find((e) => e.source._id === t)?.source ?? null;
}
async function TC(e) {
	let t = e.actor.refs;
	if (!t.length) return {
		status: "error",
		error: "这个人物没有引用，无法重建"
	};
	let n = await e.lib.fetch(e.library, t.map((e) => ({
		set: e.set,
		prop: e.prop,
		hash: e.hash
	}))), r = [], i = [], a = [];
	for (let o = 0; o < t.length; o++) {
		let s = t[o], c = n[o];
		if (!c.ok) {
			r.push({
				ref: s,
				reason: c.reason
			});
			continue;
		}
		let l = await bC(e.lib, e.library.codeSet, c.ref, c.item, c.version.altId);
		l.noEnglish && a.push(s), i.push({
			ref: s,
			entry: l.entry
		});
	}
	if (r.length) return {
		status: "missing",
		missing: r
	};
	let o = i.filter((e) => e.ref.prop === "monster" || e.ref.kind === "creature");
	if (o.length) {
		if (i.length !== 1) return {
			status: "error",
			error: "怪物人物同时带其他顶层条目，无法判断怎么重建"
		};
		let t = await e.session.call("rebuildMonster", {
			entry: o[0].entry,
			name: e.actor.name,
			state: e.actor.state
		});
		if (t.status === "pending") return {
			status: "pending",
			error: "重建怪物需要玩家选择"
		};
		let n = t.result;
		return t.status !== "complete" || !n?.data ? {
			status: "error",
			error: t.error ?? `重建状态：${t.status}`,
			detail: t
		} : {
			status: "complete",
			id: n.id,
			data: n.data,
			base: n.base,
			seed: n.seed,
			noEnglish: a
		};
	}
	let s = i.filter((e) => SC.has(e.ref.prop)).map((e) => ({
		prop: e.ref.prop,
		entry: e.entry,
		refKey: ub(e.ref)
	})), c = i.filter((e) => !SC.has(e.ref.prop)).map((e) => ({
		prop: e.ref.prop,
		entry: e.entry,
		refKey: ub(e.ref)
	})), l = await e.session.call("rebuildCharacter", {
		name: e.actor.name,
		seed: e.actor.seed || e.actor.name,
		items: s,
		equipment: c,
		choices: e.actor.choices,
		state: e.actor.state
	});
	if (l.status === "pending") return {
		status: "pending",
		error: "重建需要玩家选择"
	};
	let u = l.result;
	return l.status !== "complete" || !u?.data ? {
		status: "error",
		error: l.error ?? `重建状态：${l.status}`,
		detail: l
	} : {
		status: "complete",
		id: u.id,
		data: u.data,
		base: u.base,
		noEnglish: a
	};
}
async function EC(e) {
	let t = await CC(e.lib, e.library), n = mb({
		id: e.actor.id,
		name: e.actor.name,
		data: e.current
	}, {
		id: e.actor.id,
		name: e.actor.name,
		data: e.base
	}, t, e.choices);
	for (let t of n.refs) {
		let n = (await e.lib.storedItem(t))?.item?.name;
		n && (t.label = n);
	}
	let r = Array.isArray(e.current.items) ? e.current.items : [], i = /* @__PURE__ */ new Map();
	for (let e of n.refs) {
		let t = r.find((t) => t._id === e.itemId), n = t && typeof t.flags == "object" && t.flags ? t.flags.plutonium : void 0;
		n?.propDroppable && n.source && n.hash && i.set(`${n.propDroppable}|${n.source}|${n.hash}`, ub(e));
	}
	let a = {};
	for (let [e, t] of Object.entries(n.choices)) {
		let n = i.get(e);
		if (!n) throw Error(`选择记录没有对应的引用：${e}`);
		a[n] = t;
	}
	return {
		id: e.actor.id,
		name: e.actor.name,
		seed: e.seed ?? e.actor.name,
		...n,
		choices: a
	};
}
// src/rules/kernel/runtime.ts
function DC(e) {
	return `trpg-${qx(e).slice(0, 16)}`;
}
var OC = class {
	deps;
	open = /* @__PURE__ */ new Map();
	constructor(e) {
		this.deps = e;
	}
	async session(e) {
		let t = await this.get(e);
		return {
			session: t.session,
			boot: t.boot,
			bootMs: t.bootMs
		};
	}
	get(e) {
		let t = this.open.get(e);
		if (t) return t;
		let n = (async () => {
			let t = await this.deps.campaignOf(e), n = performance.now(), r = await sC({
				pluginRoot: this.deps.pluginRoot,
				container: this.deps.container(),
				data: aC(this.deps.files),
				fetchImpl: this.deps.fetchImpl,
				timeoutMs: this.deps.timeoutMs ?? 18e4
			}), i = await dC({
				pluginRoot: this.deps.pluginRoot,
				rule: t.rule,
				world: {
					id: DC(e),
					title: t.title
				},
				fetchImpl: this.deps.fetchImpl
			}), a = await r.boot(i), o = this.deps.cache ? new mC(this.deps.cache.db) : null, s = i.cacheKey ?? Jx(i);
			return {
				session: o ? yC(r, o, s, this.deps.cache.dataVersion, t.rule) : r,
				rule: t.rule,
				bases: /* @__PURE__ */ new Map(),
				seeds: /* @__PURE__ */ new Map(),
				boot: a,
				bootMs: Math.round(performance.now() - n),
				cache: o,
				cacheBase: s,
				dataVersion: this.deps.cache?.dataVersion ?? (async () => ({
					official: "",
					brews: {}
				}))
			};
		})();
		return this.open.set(e, n), n.catch(() => this.open.delete(e)), n;
	}
	async enter(e) {
		this.deps.hasKernel && !await this.deps.hasKernel(e) ? await this.closeAllExcept(null) : (await this.closeAllExcept(e), await this.get(e));
	}
	async closeAllExcept(e) {
		for (let t of [...this.open.keys()]) t !== e && await this.close(t);
	}
	async close(e) {
		let t = this.open.get(e);
		t && (this.open.delete(e), (await t).session.close());
	}
	async remember(e, t) {
		let n = await this.get(e), r = await wC(n.session, t);
		if (!r) throw Error(`结算小窗里没有这个人物：${t}`);
		n.bases.set(t, r);
	}
	async buildCharacter(e, t) {
		let n = await this.get(e), r = await this.entries(e, [...t.items, ...t.equipment ?? []]);
		if (r.status !== "complete") return {
			status: r.status,
			error: r.error,
			detail: r
		};
		let i = new Map(r.rows.map((e) => [ub(e.ref), e])), a = t.items.map((e) => ({
			prop: e.prop,
			refKey: ub(e),
			entry: i.get(ub(e)).entry
		})), o = (t.equipment ?? []).map((e) => ({
			prop: e.prop,
			refKey: ub(e),
			entry: i.get(ub(e)).entry
		})), s = await n.session.call("buildCharacter", {
			name: t.name,
			items: a,
			equipment: o,
			choices: t.choices ?? {}
		});
		if (s.status !== "complete" || !s.result?.id) return {
			status: s.status,
			error: s.error ?? `建卡状态：${s.status}`,
			detail: s
		};
		n.seeds.set(s.result.id, s.result.seed);
		let c = await wC(n.session, s.result.id);
		return c && n.bases.set(s.result.id, c), {
			status: "complete",
			id: s.result.id,
			seed: s.result.seed,
			noEnglish: r.noEnglish
		};
	}
	async addToActor(e, t, n) {
		let r = await this.get(e), i = await this.entries(e, n);
		if (i.status !== "complete") return {
			status: i.status,
			error: i.error,
			detail: i
		};
		let a = await r.session.call("addToActor", t, i.rows.map((e) => ({
			prop: e.ref.prop,
			refKey: ub(e.ref),
			entry: e.entry
		})));
		if (a.status !== "complete") return {
			status: a.status,
			error: a.error ?? `加条目状态：${a.status}`,
			detail: a
		};
		let o = r.bases.get(t);
		if (o && Array.isArray(a.result?.added) && Array.isArray(o.items)) {
			let e = await wC(r.session, t), n = new Map((e?.items ?? []).map((e) => [e._id, e]));
			for (let e of a.result.added) {
				let t = n.get(e._id) ?? e, r = o.items.findIndex((e) => e._id === t._id);
				r >= 0 ? o.items[r] = t : o.items.push(t);
			}
		}
		return {
			status: "complete",
			result: a.result,
			noEnglish: i.noEnglish
		};
	}
	async createActors(e, t) {
		let n = await this.get(e), r = await this.entries(e, t);
		if (r.status !== "complete") return {
			status: r.status,
			error: r.error,
			detail: r
		};
		let i = [];
		for (let e of r.rows) {
			let t = await n.session.call("importForBuild", e.ref.prop, e.entry);
			if (t.status !== "complete" || !t.result) return {
				status: t.status,
				error: t.error ?? `换算状态：${t.status}`,
				detail: t
			};
			i.push({
				prop: e.ref.prop,
				entry: e.entry,
				data: t.result
			});
		}
		let a = await n.session.call("createActorsBatch", i);
		return a.status === "complete" ? {
			status: "complete",
			actors: a.result,
			noEnglish: r.noEnglish
		} : {
			status: a.status,
			error: a.error ?? `批量建状态：${a.status}`,
			detail: a
		};
	}
	async entries(e, t) {
		let n = await this.library(e), r = await this.deps.scoped.fetch(n, t), i = [], a = [];
		for (let e = 0; e < t.length; e++) {
			let o = r[e];
			if (!o.ok) return {
				status: "missing",
				error: `取不到 ${t[e].hash}：${o.reason}`,
				rows: [],
				noEnglish: []
			};
			let s = await bC(this.deps.scoped, n.codeSet, o.ref, o.item, o.version.altId);
			s.noEnglish && a.push(t[e]), i.push({
				ref: t[e],
				entry: s.entry
			});
		}
		return {
			status: "complete",
			rows: i,
			noEnglish: a
		};
	}
	async rebuild(e, t, n) {
		return (await this.rebuildMany(e, [t], n))[0];
	}
	async rebuildMany(e, t, n) {
		let r = await this.get(e), i = n ?? await this.library(e), a = r.cache ? await r.dataVersion() : null, o = Array(t.length), s = [], c = [];
		if (r.cache && a) for (let e = 0; e < t.length; e++) {
			let n = await hC({
				base: r.cacheBase,
				dataVersion: a,
				actor: t[e]
			}), i = await r.cache.get(n);
			i ? s.push({
				index: e,
				base: i
			}) : c.push(e);
		}
		else for (let e = 0; e < t.length; e++) c.push(e);
		if (s.length) {
			let e = await r.session.call("createActorsFromBase", s.map((e) => ({
				base: e.base,
				state: t[e.index].state
			}))), n = e.result ?? [];
			if (e.status !== "complete" || n.length !== s.length) for (let t of s) o[t.index] = {
				status: "error",
				error: e.error ?? `批量重建状态：${e.status}`,
				detail: e
			};
			else s.forEach((e, t) => {
				let i = n[t];
				!i?.id || !i.data ? o[e.index] = {
					status: "error",
					error: "批量重建没有交回人物数据"
				} : (o[e.index] = {
					status: "complete",
					id: i.id,
					data: i.data,
					base: i.base ?? e.base
				}, r.bases.set(i.id, i.base ?? e.base));
			});
		}
		for (let e of c) {
			let n = t[e], s = await TC({
				lib: this.deps.scoped,
				session: r.session,
				library: i,
				actor: n
			});
			if (o[e] = s, s.status === "complete") {
				if (!s.id || !s.base) throw Error(`重建 ${n.name} 没有交回人物编号或重建基准`);
				if (r.bases.set(s.id, s.base), r.seeds.set(s.id, s.seed ?? n.seed ?? n.name), r.cache && a) {
					let e = await hC({
						base: r.cacheBase,
						dataVersion: a,
						actor: n
					});
					await r.cache.put(e, s.base, {
						rule: r.rule,
						base: r.cacheBase,
						official: a.official
					});
				}
			}
		}
		return o;
	}
	async library(e) {
		return (await this.deps.campaignOf(e)).library;
	}
	async mapRef(e) {
		return CC(this.deps.scoped, await this.library(e));
	}
	async compact(e, t) {
		let n = await this.get(e), r = await this.library(e), i = [];
		for (let e of t) {
			let t = n.bases.get(e);
			if (!t) throw Error(`人物 ${e} 没有重建基准：先建卡后记住，或从存档重建`);
			let a = await wC(n.session, e);
			if (!a) throw Error(`结算小窗里没有这个人物：${e}`);
			let o = await n.session.call("captureChoices", e);
			if (o.status !== "complete") throw Error(`记下 ${e} 的成长选择失败：${o.error ?? o.status}`);
			let s = typeof a.name == "string" ? a.name : e, c = await EC({
				lib: this.deps.scoped,
				library: r,
				actor: {
					id: e,
					name: s
				},
				seed: n.seeds.get(e) ?? s,
				current: a,
				base: t,
				choices: o.result ?? {}
			});
			if (n.cache) {
				let e = await n.dataVersion(), r = await hC({
					base: n.cacheBase,
					dataVersion: e,
					actor: c
				});
				await n.cache.put(r, t, {
					rule: n.rule,
					base: n.cacheBase,
					official: e.official
				});
			}
			i.push(c);
		}
		return i;
	}
}, kC = (e) => e instanceof Error ? e.message : String(e), AC = class {
	opts;
	constructor(e) {
		this.opts = e;
	}
	rule() {
		return this.opts.rule ?? "dnd5e2014";
	}
	markerKey(e) {
		return `kc-meta:${this.rule()}:${e}`;
	}
	async status(e = "cn") {
		let t = (await this.input(e)).cacheKey ?? "", n = await this.opts.dataVersion(), r = (await this.opts.db.derived.get(this.markerKey(e)))?.value;
		return {
			kernelFingerprint: t,
			dataVersion: n,
			marker: r,
			needsUpdate: r?.kernelFingerprint !== t || JSON.stringify(r?.dataVersion) !== JSON.stringify(n) || r?.complete !== !0
		};
	}
	async run({ codeSet: e = "cn", signal: t, onProgress: n, limit: r } = {}) {
		let i = Date.now(), a = await this.input(e), o = a.cacheKey ?? "", s = await this.opts.dataVersion(), c = {
			codeSet: e,
			rule: this.rule(),
			kernelFingerprint: o,
			dataVersion: s
		}, l = (e) => ({
			...c,
			skippedReason: e,
			total: 0,
			done: 0,
			converted: 0,
			cached: 0,
			failed: [],
			noEnglish: [],
			swept: 0,
			rawBytes: 0,
			compressedBytes: 0,
			ms: Date.now() - i,
			cancelled: !1,
			complete: !1
		}), u = Sx.find((e) => e.kind === "official" && e.codeSet === "en"), d = Sx.find((t) => t.kind === "official" && t.codeSet === e);
		if (!d || (await this.opts.db.sets.get(d.id))?.status !== "installed") return l(`${d?.id ?? e} 还没装好`);
		if (!u || (await this.opts.db.sets.get(u.id))?.status !== "installed") return l("英文官方数据还没装好，换算需要英文对照原件");
		n?.({
			stage: "open-kernel",
			done: 0,
			total: 0
		});
		let f = await sC({
			pluginRoot: this.opts.pluginRoot,
			container: this.opts.container?.() ?? document.body,
			data: aC(this.opts.files),
			fetchImpl: this.opts.fetchImpl,
			timeoutMs: this.opts.timeoutMs ?? 18e4
		}), p, m = 0, h = 0, g = 0, _ = 0, v = 0, y = !1, b = [];
		try {
			await f.boot(a);
			let l = [], u = await this.candidates(f, e, l, t, r);
			p = u.length, n?.({
				stage: "convert",
				done: 0,
				total: p
			});
			let d = new mC(this.opts.db), x = {
				rule: this.rule(),
				base: o,
				official: s.official
			};
			for (let e of u) {
				if (t?.aborted) {
					y = !0;
					break;
				}
				let r = await gC({
					base: o,
					dataVersion: s,
					kind: e.prop === "monster" ? "monster" : "build",
					prop: e.prop,
					entry: e.entry
				});
				if (await d.get(r) !== null) g++, m++, n?.({
					stage: "convert",
					done: m,
					total: p,
					item: e.prop
				});
				else {
					try {
						let t = await f.call("importForBuild", e.prop, e.entry);
						if (t.status !== "complete" || !t.result) throw Error(t.error ?? `换算状态：${t.status}`);
						let n = await d.put(r, t.result, x);
						_ += n.raw, v += n.compressed, h++;
					} catch (t) {
						b.push({
							prop: e.prop,
							name: e.name,
							error: kC(t)
						});
					}
					m++, m % 10 == 0 && n?.({
						stage: "convert",
						done: m,
						total: p,
						item: e.prop
					});
				}
			}
			let S = !y && b.length === 0 && m === p, C = S && !r ? await d.sweep(x) : 0;
			return await this.opts.db.derived.put({
				key: this.markerKey(e),
				fingerprint: o,
				value: {
					kernelFingerprint: o,
					dataVersion: s,
					total: p,
					done: m,
					complete: S,
					at: Date.now()
				},
				savedAt: Date.now()
			}), {
				...c,
				skippedReason: null,
				total: p,
				done: m,
				converted: h,
				cached: g,
				failed: b,
				noEnglish: l,
				swept: C,
				rawBytes: _,
				compressedBytes: v,
				ms: Date.now() - i,
				cancelled: y,
				complete: S
			};
		} finally {
			f.close();
		}
	}
	async input(e) {
		return dC({
			pluginRoot: this.opts.pluginRoot,
			rule: this.rule(),
			world: {
				id: `precompute-${e}`,
				title: `precompute ${e}`
			},
			fetchImpl: this.opts.fetchImpl
		});
	}
	async candidates(e, t, n, r, i) {
		let a = /* @__PURE__ */ new Set();
		for (let e of Sx.filter((e) => e.codeSet === t)) await this.opts.db.derived.where("key").startsWith(`parsed:${e.id}:`).each((t) => {
			let n = t.key.slice(`parsed:${e.id}:`.length);
			if (n.startsWith("corpus:") || n.startsWith("raw_")) return;
			let r = n.split(":")[0];
			r && Cx(e.id) && a.add(r);
		});
		if (r?.aborted) return [];
		let o = await e.call("importerMeta", [...a]), s = new Set(o.filter((e) => e.folderType === "Item" || e.folderType === "Actor").map((e) => e.prop)), c = SS(this.rule(), t), l = [];
		for (let e of s) {
			if (r?.aborted) break;
			let t = await this.opts.scoped.query(c, e).catch(() => []);
			for (let r of t) {
				if (i && l.length >= i) break;
				let t = r.item;
				if (typeof t?.name != "string" || !t.name) continue;
				let a = await bC(this.opts.scoped, c.codeSet, r.ref, r.item, r.version.altId);
				if (a.noEnglish && n.push({
					prop: e,
					name: t.name,
					reason: a.reason ?? "english-missing"
				}), l.push({
					prop: e,
					entry: a.entry,
					name: t.name
				}), r.version.count > 0) {
					let i = await this.opts.scoped.detail(c, r.ref);
					for (let a of i && !("hidden" in i) ? i.alternatives : []) {
						if (a.item === r.item) continue;
						let i = await bC(this.opts.scoped, c.codeSet, r.ref, a.item, a.altId);
						i.noEnglish && n.push({
							prop: e,
							name: t.name,
							reason: i.reason ?? "alternative"
						}), l.push({
							prop: e,
							entry: i.entry,
							name: t.name
						});
					}
				}
			}
			if (i && l.length >= i) break;
		}
		return l;
	}
}, jC = class {
	run;
	running = null;
	pending = /* @__PURE__ */ new Set();
	last = null;
	constructor(e) {
		this.run = e;
	}
	trigger(e) {
		this.pending.add(e), this.running ||= this.loop().finally(() => {
			this.running = null;
		});
	}
	async settled() {
		for (; this.running;) await this.running;
		return this.last;
	}
	async loop() {
		for (; this.pending.size;) {
			let [e] = this.pending;
			this.pending.delete(e);
			try {
				this.last = await this.run(e);
			} catch (t) {
				this.last = {
					codeSet: e,
					error: t instanceof Error ? t.message : String(t)
				};
			}
		}
	}
}, MC = (e) => !!e && typeof e == "object" && !Array.isArray(e);
function NC(e, t) {
	let n = MC(e[t]) ? e[t] : null, r = n && MC(n.kernel) ? n.kernel : null;
	if (!n || !r) return e;
	let i = Array.isArray(r.actors) ? r.actors : [], a = r.legacy === !0, o = i.map((e) => {
		if (!MC(e)) return e;
		let t = e.state;
		return !MC(t) || !(Array.isArray(t.items) || Array.isArray(t.effects) || Array.isArray(t.actor)) ? e : (a = !0, {
			...e,
			state: {},
			legacy: !0,
			legacyState: t
		});
	});
	return {
		...e,
		[t]: {
			...n,
			kernel: {
				...r,
				actors: o,
				legacy: a
			}
		}
	};
}
function PC(e, t) {
	let n = MC(e[t]) ? e[t] : null, r = n && MC(n.kernel) ? n.kernel : null;
	if (!n || !r || !Array.isArray(r.actors)) return e;
	let i = r.actors.map((e) => MC(e) ? {
		...e,
		seed: typeof e.seed == "string" && e.seed ? e.seed : String(e.name ?? e.id ?? "")
	} : e);
	return {
		...e,
		[t]: {
			...n,
			kernel: {
				...r,
				actors: i
			}
		}
	};
}
function FC(e, t) {
	let n = MC(e[t]) ? e[t] : null, r = n && MC(n.kernel) ? n.kernel : null;
	if (!n || !r || !Array.isArray(r.actors)) return e;
	let i = r.actors.map((e) => {
		if (!MC(e) || !MC(e.state) || !Array.isArray(e.refs)) return e;
		let t = /* @__PURE__ */ new Map();
		for (let n of e.refs) MC(n) && typeof n.itemId == "string" && typeof n.kind == "string" && typeof n.hash == "string" && t.set(n.itemId, `ref:${n.kind}|${n.hash}`);
		if (!t.size) return e;
		let n = e.state, r = MC(n.items) ? n.items : {}, i = {};
		for (let [e, n] of Object.entries(r)) i[t.get(e) ?? e] = n;
		let a = Array.isArray(n.itemRemoved) ? n.itemRemoved.map((e) => typeof e == "string" ? t.get(e) ?? e : e) : n.itemRemoved;
		return {
			...e,
			state: {
				...n,
				items: i,
				itemRemoved: a
			}
		};
	});
	return {
		...e,
		[t]: {
			...n,
			kernel: {
				...r,
				actors: i
			}
		}
	};
}
var IC = {
	workspace: {
		4: (e) => e,
		5: (e) => NC(e, "data"),
		6: (e) => PC(e, "data"),
		7: (e) => FC(e, "data")
	},
	save: {
		4: (e) => e,
		5: (e) => NC(e, "snapshot"),
		6: (e) => PC(e, "snapshot"),
		7: (e) => FC(e, "snapshot")
	}
}, LC = "这个存档由更新版本的扩展创建，请先更新扩展";
function RC(e, t, n = {}) {
	let r = n.current ?? Fy[e], i = n.migrations ?? IC[e], a = Number(t.schemaVersion);
	if (!Number.isInteger(a) || a < 0) throw new $("E_BAD_VERSION", "文件内容损坏：缺少有效的版本号");
	if (a > r) throw new $("E_NEWER_DATA", LC, {
		kind: e,
		version: a,
		current: r
	});
	if (!n.migrations && a < 4) throw new $("E_OLD_DATA", "这是旧版扩展的存档（旧扩展包格式），新版不再读取", {
		kind: e,
		version: a
	});
	let o = t;
	for (; a < r;) {
		let t = i[a];
		if (!t) throw new $("E_BAD_VERSION", `无法升级版本 ${a} 的数据`, {
			kind: e,
			version: a
		});
		o = {
			...t(o),
			schemaVersion: a + 1
		}, a += 1;
	}
	return o;
}
// src/core/saves/helpers.ts
function zC(e) {
	return Jx({ d: e });
}
function BC(e) {
	return e.savedHash !== zC(e.data);
}
function VC(e, t) {
	return t.reduce((t, n) => ({
		...t,
		...n(e)
	}), {
		partyNames: [],
		partyCount: 0
	});
}
function HC(e) {
	let t = e.trim();
	if (t.length < 1 || t.length > 40) throw new $("E_BAD_NAME", "存档名需要 1–40 个字");
	return t;
}
function UC(e, t, n = (e) => ` ${e}`) {
	if (!t.has(e)) return e;
	for (let r = 2;; r++) {
		let i = `${e}${n(r)}`;
		if (!t.has(i)) return i;
	}
}
function WC(e) {
	return RC("save", e);
}
function GC(e) {
	return RC("workspace", e);
}
function KC(e, t) {
	return t.updatedAt - e.updatedAt || t.createdAt - e.createdAt || e.id.localeCompare(t.id);
}
// src/core/start-campaign.ts
var qC = 1, JC = (e) => e instanceof Error ? e.message : String(e), YC = class {
	deps;
	constructor(e) {
		this.deps = e;
	}
	libraryOf(e, t, n = {}) {
		let r = SS(e, t);
		return tb.parse({
			...r,
			scopes: n.scopes ?? r.scopes,
			include: n.include ?? r.include,
			exclude: n.exclude ?? r.exclude,
			choices: n.choices ?? r.choices
		});
	}
	neededSets(e) {
		return [.../* @__PURE__ */ new Set([wx(e).id, wx("en").id])];
	}
	async installed(e) {
		return (await this.deps.library.db.sets.get(e))?.status === "installed";
	}
	runningTask(e) {
		return this.deps.library.tasks.list().find((t) => t.kind === "official" && t.set === e && t.status === "running") ?? null;
	}
	async wizardOptions(e, t, n = {}) {
		let r = this.deps.rules.get(e);
		if (!r) throw new $("E_RULE_MISSING", `没有这套规则：${e}`);
		let i = this.libraryOf(e, t, n), { scoped: a } = this.deps.library, o = [];
		for (let e of Sx.filter((e) => e.kind === "official")) o.push({
			codeSet: e.codeSet,
			lang: e.lang,
			setId: e.id,
			installed: await this.installed(e.id),
			task: this.runningTask(e.id)
		});
		let s = o.find((e) => e.codeSet === t)?.installed ? await a.catalog(i) : [];
		return {
			rule: {
				id: r.id,
				name: r.name
			},
			scopes: await a.scopes(),
			defaultScopes: [...gS(e).defaultScopes],
			data: o,
			books: s.filter((e) => e.kind === "book"),
			adventures: s.filter((e) => e.kind === "adventure"),
			library: i
		};
	}
	async startCampaign(e) {
		let { campaign: t, rules: n } = this.deps, { scoped: r, tasks: i, dataVersion: a } = this.deps.library;
		if (!n.has(e.ruleId)) throw new $("E_RULE_MISSING", `没有这套规则：${e.ruleId}`);
		let o = HC(e.name), s = this.neededSets(e.codeSet), c = this.libraryOf(e.ruleId, e.codeSet, e.library), l = lb.parse({
			rule: e.ruleId,
			kernelVersion: qC,
			library: c,
			dataVersion: await a(),
			overrides: await r.activeOverrides(),
			actors: [],
			revision: 0,
			undo: []
		}), { workspace: u, save: d } = await t.startNewCampaign({
			ownerKey: e.ownerKey,
			ownerLabel: e.ownerLabel,
			ruleId: e.ruleId,
			name: o,
			note: e.note,
			initialData: {
				kernel: l,
				library: l.library
			}
		}), f = [], p = [], m = [], h = /* @__PURE__ */ new Map();
		for (let e of s) {
			if (await this.installed(e)) continue;
			let t = i.startOfficial(e);
			h.set(e, t), f.push({
				kind: "official",
				set: e,
				item: null,
				taskId: t
			}), m.push(i.wait(t));
		}
		let g = [];
		for (let t of e.adventures ?? []) {
			let e = h.get(t.set);
			if (e) g.push(i.wait(e).then((e) => {
				if (e.status !== "done") {
					p.push(`冒险 ${t.id} 没下载：${t.set} 没装好（${e.error ?? e.status}）`);
					return;
				}
				let n = i.startAdventure(t.set, t.id);
				return f.push({
					kind: "adventure",
					set: t.set,
					item: t.id,
					taskId: n
				}), i.wait(n).then((e) => {
					e.status !== "done" && p.push(`冒险 ${t.id} 下载失败：${e.error ?? e.status}`);
				});
			}));
			else {
				let e = i.startAdventure(t.set, t.id);
				f.push({
					kind: "adventure",
					set: t.set,
					item: t.id,
					taskId: e
				}), m.push(i.wait(e));
			}
		}
		return {
			workspace: u,
			save: d,
			downloads: f,
			finished: (async () => {
				try {
					for (let e of await Promise.all(m)) e.status !== "done" && p.push(`${e.kind} ${e.set}${e.item ? `/${e.item}` : ""}：${e.error ?? e.status}`);
					await Promise.all(g), h.size && await this.refreshFreshVersion(e.ownerKey, d.id);
				} catch (e) {
					p.push(JC(e));
				}
				return { errors: p };
			})()
		};
	}
	async refreshFreshVersion(e, t) {
		let { campaign: n, kernelSave: r } = this.deps, i = await n.getWorkspace(e);
		if (!i || i.currentSaveId !== t || n.isDirty(i)) return;
		let a = await r.read(e);
		!a || a.revision !== 0 || a.actors.length || a.undo.length || await r.save(e);
	}
}, XC = () => new URL("../", "" + import.meta.url);
function ZC(e) {
	let t = e.pluginRoot ?? XC(), n = e.container ?? (() => document.body), r = new Bb(e.libraryDbName), i = new kx({ db: r }), a = (e, a) => Ix({
		codeSet: e,
		pluginRoot: t,
		container: n(),
		handlers: Nx({
			codeSet: e,
			db: r,
			files: i,
			allowNetwork: () => !1,
			kvScope: a
		})
	}), o = null, s = async (e, t, n) => {
		if (!o) return null;
		let r = [];
		for (let i of [...new Set(e)]) r.push(await o.run({
			codeSet: i,
			signal: t,
			onProgress: n
		}));
		return r;
	}, c = new jC(async (e) => o?.run({ codeSet: e }) ?? null), l = new nC({
		db: r,
		openFrame: a,
		onDataChanged: async (e) => c.trigger(e)
	}), u = new MS(l, r), d = new FS(l, u, r), f = new iC({
		db: r,
		files: i,
		openFrame: (e) => a(e),
		precompute: (e, t, n) => s([Cx(e).codeSet], t, n)
	}), p = Mx(r, l);
	o = new AC({
		pluginRoot: t,
		files: i,
		scoped: u,
		db: r,
		dataVersion: p,
		container: n
	});
	let m = null, h = new OC({
		pluginRoot: t,
		files: i,
		scoped: u,
		container: n,
		cache: {
			db: r,
			dataVersion: p
		},
		hasKernel: async (e) => !!(m && await m.read(e)),
		campaignOf: async (t) => {
			let n = await e.campaign.getWorkspace(t);
			if (!n) throw new $("E_NO_WORKSPACE", "还没有当前战役");
			let r = m ? await m.read(t) : null;
			if (!r) throw new $("E_NO_KERNEL", "这个战役还没有绑定结算内核");
			return {
				rule: r.rule,
				library: n.data.library ?? r.library,
				title: n.ownerLabel
			};
		}
	});
	m = new wb({
		db: e.db,
		campaign: e.campaign,
		rules: e.rules,
		now: e.now,
		checkRefs: Ax(u),
		currentVersion: p,
		currentOverrides: jx(u),
		mapRef: (e) => h.mapRef(e),
		compactActors: (e, t) => h.compact(e, t),
		undoLimit: async () => (await Yy(e.db)).undoLimit
	});
	let g = {
		db: r,
		files: i,
		service: l,
		scoped: u,
		custom: d,
		tasks: f,
		precompute: o,
		precomputeQueue: c,
		dataVersion: p
	}, _ = new YC({
		campaign: e.campaign,
		kernelSave: m,
		rules: e.rules,
		library: g
	});
	return {
		library: g,
		kernel: h,
		kernelSave: m,
		starter: _
	};
}
// src/core/db.ts
var QC = "tavern-trpg-assistant", $C = class extends Db {
	blobs;
	workspaces;
	saves;
	meta;
	constructor(e = QC) {
		super(e), this.version(1).stores({
			packs: "id, ruleId, kind, name",
			entries: "[packId+entryId], packId, [ruleId+type]",
			searchIndex: "packId",
			assets: "[packId+path], packId",
			workspaces: "ownerKey, ruleId",
			saves: "id, [ownerKey+ruleId], ruleId, kind, deletedAt",
			meta: "key"
		}), this.version(2).stores({
			packs: "id, ruleId, category, name",
			entries: "[packId+entryId], packId, [ruleId+type]",
			searchIndex: "packId",
			assets: null,
			blobs: "hash",
			workspaces: "ownerKey, ruleId",
			saves: "id, [ownerKey+ruleId], ruleId, kind, deletedAt",
			packTrash: "id",
			meta: "key"
		}), this.version(3).stores({
			packs: null,
			entries: null,
			searchIndex: null,
			packTrash: null
		}).upgrade(async (e) => {
			await e.table("workspaces").clear(), await e.table("saves").clear(), await e.table("blobs").clear();
		});
	}
	async getMeta(e) {
		return (await this.meta.get(e))?.value;
	}
	async setMeta(e, t) {
		await this.meta.put({
			key: e,
			value: t
		});
	}
}, ew = (e, t) => ({
	id: e.id,
	name: e.name,
	note: e.note,
	ownerKey: e.ownerKey,
	ownerLabel: e.ownerLabel,
	ruleId: e.ruleId,
	parentId: t,
	updatedAt: e.updatedAt,
	summary: e.summary
});
function tw(e, t) {
	let n = e.filter((e) => e.kind === "manual" && e.deletedAt === void 0), r = new Map(n.map((e) => [e.id, e])), i = (e) => e.branchedFrom && e.branchedFrom !== e.id && r.has(e.branchedFrom) ? e.branchedFrom : null, a = (e) => {
		let t = /* @__PURE__ */ new Set([e.id]), n = e;
		for (let e = i(n); e && !t.has(e); e = i(n)) t.add(e), n = r.get(e);
		return n;
	}, o = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = a(e).id;
		o.set(t, [...o.get(t) ?? [], e]);
	}
	let s = t.currentSaveId ? r.get(t.currentSaveId) ?? null : null, c = s ? a(s) : null, l = c ? o.get(c.id) ?? [] : [], u = [];
	for (let [e, n] of o) {
		if (e === c?.id) continue;
		let i = r.get(e);
		i.ruleId === t.ruleId && u.push({
			root: ew(i, null),
			saves: n.length,
			updatedAt: Math.max(...n.map((e) => e.updatedAt)),
			sameCard: i.ownerKey === t.ownerKey
		});
	}
	u.sort((e, t) => t.updatedAt - e.updatedAt);
	let d = n.filter((e) => e.ruleId === t.ruleId);
	return {
		name: c?.name ?? null,
		root: c ? ew(c, null) : null,
		current: s ? ew(s, i(s)) : null,
		branches: l.filter((e) => e.id !== c?.id).sort(KC).map((e) => ew(e, i(e))),
		otherCampaigns: u,
		counts: {
			tree: l.length,
			thisCard: d.filter((e) => e.ownerKey === t.ownerKey).length,
			allCards: d.length,
			auto: e.filter((e) => e.kind === "auto" && e.deletedAt === void 0 && e.ownerKey === t.ownerKey && e.ruleId === t.ruleId).length,
			deleted: e.filter((e) => e.deletedAt !== void 0 && e.ruleId === t.ruleId).length,
			otherRules: n.length - d.length
		}
	};
}
// src/core/saves/campaign.ts
var nw = class {
	db;
	deps;
	uuid;
	constructor(e, t) {
		this.db = e, this.deps = t, this.uuid = t.uuid ?? Qy;
	}
	async getWorkspace(e) {
		let t = await this.db.workspaces.get(e);
		if (!t) return null;
		let n = GC(t);
		return n !== t && await this.db.workspaces.put(n), n;
	}
	isDirty(e) {
		return BC(e);
	}
	async getSave(e) {
		let t = await this.db.saves.get(e);
		return t ? WC(t) : null;
	}
	async listManual(e, t) {
		return (await this.db.saves.where("ruleId").equals(e.ruleId).toArray()).map(WC).filter((n) => n.kind === "manual" && n.deletedAt === void 0 && (t === "all" || n.ownerKey === e.ownerKey)).sort(KC);
	}
	async listAuto(e, t) {
		return (await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray()).map(WC).filter((e) => e.kind === "auto").sort(KC);
	}
	async listDeleted(e) {
		return (await this.db.saves.where("ruleId").equals(e).toArray()).map(WC).filter((e) => e.deletedAt !== void 0).sort((e, t) => (t.deletedAt ?? 0) - (e.deletedAt ?? 0));
	}
	async listOtherRules(e) {
		return (await this.db.saves.toArray()).map(WC).filter((t) => t.ruleId !== e && t.kind === "manual" && t.deletedAt === void 0).sort(KC);
	}
	async getCampaignView(e, t) {
		let n = (await this.db.saves.toArray()).map(WC), r = await this.db.workspaces.get(e);
		return tw(n, {
			ownerKey: e,
			ruleId: t,
			currentSaveId: r && r.ruleId === t ? r.currentSaveId : null
		});
	}
	async startNewCampaign(e) {
		this.requireRule(e.ruleId);
		let t = HC(e.name);
		return this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta
		], async () => {
			let n = await this.getWorkspace(e.ownerKey);
			n && await this.writeAutoSave(n, "新存档前");
			let r = e.initialData ? structuredClone(e.initialData) : {}, i = {
				ownerKey: e.ownerKey,
				ownerLabel: e.ownerLabel,
				ruleId: e.ruleId,
				currentSaveId: null,
				data: r,
				savedHash: "",
				schemaVersion: Fy.workspace,
				updatedAt: this.deps.now()
			}, a = await this.buildSave(i, {
				id: this.uuid(),
				name: t,
				note: e.note ?? "",
				kind: "manual"
			});
			return i.currentSaveId = a.id, i.savedHash = a.hash, await this.db.saves.put(a), await this.db.workspaces.put(i), await this.bumpSaves(), {
				workspace: i,
				save: a
			};
		});
	}
	async saveCurrent(e) {
		return this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta
		], async () => {
			let t = await this.requireWorkspace(e);
			if (!BC(t)) return {
				changed: !1,
				workspace: t
			};
			let n = t.currentSaveId ? await this.getSave(t.currentSaveId) : null, r = await this.buildSave(t, {
				id: n?.id ?? this.uuid(),
				name: n?.name ?? "存档",
				note: n?.note ?? "",
				kind: "manual"
			}), i = n ? {
				...n,
				snapshot: r.snapshot,
				summary: r.summary,
				hash: r.hash,
				updatedAt: r.updatedAt
			} : r, a = {
				...t,
				currentSaveId: i.id,
				savedHash: i.hash,
				updatedAt: i.updatedAt
			};
			return await this.db.saves.put(i), await this.db.workspaces.put(a), await this.bumpSaves(), {
				changed: !0,
				workspace: a
			};
		});
	}
	async branch(e, t) {
		return this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta
		], async () => {
			let n = await this.requireWorkspace(e), r = n.currentSaveId ? await this.getSave(n.currentSaveId) : null, i = await this.manualNames(n.ownerKey, n.ruleId), a = t === void 0 ? UC(`${r?.name ?? "存档"} 分支`, i) : HC(t), o = await this.buildSave(n, {
				id: this.uuid(),
				name: a,
				note: "",
				kind: "manual",
				branchedFrom: r?.id
			}), s = {
				...n,
				currentSaveId: o.id,
				savedHash: o.hash,
				updatedAt: o.updatedAt
			};
			return await this.db.saves.put(o), await this.db.workspaces.put(s), await this.bumpSaves(), {
				workspace: s,
				save: o
			};
		});
	}
	async loadSave(e, t, n = {}) {
		let r = await this.getSave(t);
		if (!r || r.deletedAt !== void 0) throw new $("E_NOT_FOUND", "没有找到这个存档");
		return this.requireRule(r.ruleId), n.precheck && await n.precheck(r), this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta
		], async () => {
			let t = await this.getWorkspace(e.ownerKey), i = !!t && t.ruleId !== r.ruleId;
			if (i && !n.allowRuleSwitch) throw new $("E_RULE_SWITCH_REQUIRED", "这个存档属于其他规则，需要确认切换规则");
			t && await this.writeAutoSave(t, i ? "切换规则前" : "读档前");
			let a = r;
			if (r.ownerKey !== e.ownerKey) {
				let t = await this.manualNames(e.ownerKey, r.ruleId), n = this.deps.now();
				a = {
					...r,
					id: this.uuid(),
					ownerKey: e.ownerKey,
					ownerLabel: e.ownerLabel,
					name: UC(`${r.name}（来自 ${r.ownerLabel}）`, t),
					branchedFrom: void 0,
					createdAt: n,
					updatedAt: n
				}, await this.db.saves.put(a);
			}
			let o = {
				ownerKey: e.ownerKey,
				ownerLabel: e.ownerLabel,
				ruleId: a.ruleId,
				currentSaveId: a.id,
				data: structuredClone(a.snapshot),
				savedHash: a.hash,
				schemaVersion: Fy.workspace,
				updatedAt: this.deps.now()
			};
			return await this.db.workspaces.put(o), o;
		});
	}
	async deleteSave(e) {
		let t = await this.getSave(e);
		if (!t) throw new $("E_NOT_FOUND", "没有找到这个存档");
		if (t.kind === "auto") throw new $("E_AUTO_NOT_DELETABLE", "自动存档会自动滚动保留，不能单独删除");
		if ((await this.db.workspaces.get(t.ownerKey))?.currentSaveId === t.id) throw new $("E_SAVE_IN_USE", "正在使用的存档不能删除，请先读取或新建其他存档");
		let n = {
			...t,
			deletedAt: this.deps.now()
		};
		return await this.db.saves.put(n), n;
	}
	async restoreSave(e) {
		let t = await this.getSave(e);
		if (!t || t.deletedAt === void 0) throw new $("E_NOT_FOUND", "没有找到这个已删除的存档");
		let { deletedAt: n, ...r } = t, i = await this.manualNames(t.ownerKey, t.ruleId), a = {
			...r,
			name: UC(t.name, i, (e) => `（恢复 ${e}）`)
		};
		return await this.db.saves.put(a), a;
	}
	async purgeSaves(e) {
		let t = 0;
		for (let n of e) (await this.getSave(n))?.deletedAt !== void 0 && (await this.db.saves.delete(n), t++);
		return t;
	}
	async renameSave(e, t) {
		return this.patchManual(e, { name: HC(t) });
	}
	async setNote(e, t) {
		return this.patchManual(e, { note: t.slice(0, 200) });
	}
	async saveAutoAsManual(e) {
		let t = await this.getSave(e);
		if (!t || t.kind !== "auto") throw new $("E_NOT_FOUND", "没有找到这个自动存档");
		let n = await this.manualNames(t.ownerKey, t.ruleId), r = this.deps.now(), i = new Date(t.createdAt), a = `${i.getMonth() + 1}月${i.getDate()}日 ${String(i.getHours()).padStart(2, "0")}:${String(i.getMinutes()).padStart(2, "0")}`, o = {
			...t,
			id: this.uuid(),
			kind: "manual",
			autoReason: void 0,
			name: UC(`自动存档 · ${a}`, n),
			createdAt: r,
			updatedAt: r
		};
		return await this.db.saves.put(o), o;
	}
	async putWorkspace(e) {
		await this.db.workspaces.put({
			...e,
			updatedAt: this.deps.now()
		});
	}
	async updateData(e, t) {
		let n = await this.requireWorkspace(e), r = {
			...n,
			data: t(n.data),
			updatedAt: this.deps.now()
		};
		return await this.db.workspaces.put(r), r;
	}
	async writeAutoSave(e, t) {
		let n = await this.buildSave(e, {
			id: this.uuid(),
			name: `自动存档 · ${t}`,
			note: "",
			kind: "auto",
			autoReason: t
		});
		await this.db.saves.put(n);
		let r = await this.listAuto(e.ownerKey, e.ruleId);
		for (let e of r.slice(3)) await this.db.saves.delete(e.id);
		return n;
	}
	async pruneAutoSaves(e, t) {
		let n = await this.listAuto(e, t);
		for (let e of n.slice(3)) await this.db.saves.delete(e.id);
	}
	async buildSave(e, t) {
		let n = this.deps.now();
		return {
			id: t.id,
			ownerKey: e.ownerKey,
			ownerLabel: e.ownerLabel,
			ruleId: e.ruleId,
			name: t.name,
			note: t.note,
			kind: t.kind,
			...t.autoReason ? { autoReason: t.autoReason } : {},
			...t.branchedFrom ? { branchedFrom: t.branchedFrom } : {},
			createdAt: n,
			updatedAt: n,
			summary: VC(e.data, this.deps.summaryContributors ?? []),
			snapshot: structuredClone(e.data),
			hash: zC(e.data),
			schemaVersion: Fy.save
		};
	}
	async manualNames(e, t) {
		let n = await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray();
		return new Set(n.filter((e) => e.kind === "manual" && e.deletedAt === void 0).map((e) => e.name));
	}
	async bumpSaves() {
		let e = Wy.parse(await this.db.getMeta("backup") ?? {});
		await this.db.setMeta("backup", {
			...e,
			savesSinceExport: e.savesSinceExport + 1
		});
	}
	async patchManual(e, t) {
		let n = await this.getSave(e);
		if (!n || n.deletedAt !== void 0) throw new $("E_NOT_FOUND", "没有找到这个存档");
		if (n.kind === "auto") throw new $("E_AUTO_NOT_DELETABLE", "自动存档不能改名或加备注");
		let r = {
			...n,
			...t
		};
		return await this.db.saves.put(r), r;
	}
	async requireWorkspace(e) {
		let t = await this.getWorkspace(e);
		if (!t) throw new $("E_NO_WORKSPACE", "还没有当前战役");
		return t;
	}
	requireRule(e) {
		let t = this.deps.rules.get(e);
		if (!t) throw new $("E_RULE_MISSING", `需要先安装规则『${e}』`);
		return t;
	}
}, rw = class {
	name;
	id;
	channel = null;
	listeners = /* @__PURE__ */ new Set();
	_readOnly = !1;
	startedAt;
	constructor(e = "tavern-trpg-assistant-lock", t = Date.now, n = Qy()) {
		this.name = e, this.id = n, this.startedAt = t();
	}
	get readOnly() {
		return this._readOnly;
	}
	onChange(e) {
		return this.listeners.add(e), () => this.listeners.delete(e);
	}
	start() {
		typeof BroadcastChannel > "u" || this.channel || (this.channel = new BroadcastChannel(this.name), this.channel.onmessage = (e) => this.receive(e.data), this.send("hello"));
	}
	stop() {
		this.channel?.close(), this.channel = null;
	}
	send(e) {
		this.channel?.postMessage({
			type: e,
			id: this.id,
			startedAt: this.startedAt
		});
	}
	receive(e) {
		if (e && e.id !== this.id) {
			if ((e.startedAt < this.startedAt || e.startedAt === this.startedAt && e.id < this.id) && !this._readOnly) {
				this._readOnly = !0;
				for (let e of this.listeners) e(!0);
			}
			e.type === "hello" && this.send("here");
		}
	}
}, iw = class {
	rules = /* @__PURE__ */ new Map();
	register(e) {
		if (this.rules.has(e.id)) throw Error(`规则已注册：${e.id}`);
		this.rules.set(e.id, e);
	}
	get(e) {
		return this.rules.get(e);
	}
	has(e) {
		return this.rules.has(e);
	}
	list() {
		return [...this.rules.values()];
	}
};
function aw(e) {
	return e.list().map((e) => ({
		id: e.id,
		name: e.name,
		nameShort: e.nameShort,
		description: e.description,
		status: "installed"
	}));
}
var ow = {
	id: "dnd5e2014",
	name: "D&D 5e（2014）",
	nameShort: "D&D 5e",
	description: "龙与地下城第五版（2014 规则），核心规则含玩家手册、地下城主指南与怪物图鉴",
	defaultBanner: {
		wide: "https://a1.ax1x.com/2026/10/28/wwHs9.png",
		narrow: "https://a1.ax1x.com/2026/10/28/wwHs9.md.png",
		alt: "D&D 5e 默认战役横幅"
	}
};
// src/rules/index.ts
function sw() {
	let e = new iw();
	return e.register(ow), e;
}
// src/core/services.ts
var cw = "0.6.0";
function lw(e = {}) {
	let t = e.now ?? Date.now, n = e.rules ?? sw(), r = new $C(e.dbName ?? "tavern-trpg-assistant"), i = new nw(r, {
		rules: n,
		now: t,
		...e.campaign
	}), a = ZC({
		db: r,
		campaign: i,
		rules: n,
		now: t,
		...e.backend
	});
	return {
		db: r,
		rules: n,
		campaign: i,
		lock: new rw(),
		now: t,
		backend: a
	};
}
// node_modules/pinia/dist/pinia.js
var uw = typeof window < "u", dw, fw = (e) => dw = e, pw = Symbol();
function mw(e) {
	return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function";
}
var hw = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof global == "object" && global.global === global ? global : typeof globalThis == "object" ? globalThis : { HTMLElement: null };
function gw(e, { autoBom: t = !1 } = {}) {
	return t && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["﻿", e], { type: e.type }) : e;
}
function _w(e, t, n) {
	let r = new XMLHttpRequest();
	r.open("GET", e), r.responseType = "blob", r.onload = function() {
		Sw(r.response, t, n);
	}, r.onerror = function() {
		console.error("could not download file");
	}, r.send();
}
function vw(e) {
	let t = new XMLHttpRequest();
	t.open("HEAD", e, !1);
	try {
		t.send();
	} catch {}
	return t.status >= 200 && t.status <= 299;
}
function yw(e) {
	try {
		e.dispatchEvent(new MouseEvent("click"));
	} catch {
		let t = new MouseEvent("click", {
			bubbles: !0,
			cancelable: !0,
			view: window,
			detail: 0,
			screenX: 80,
			screenY: 20,
			clientX: 80,
			clientY: 20,
			ctrlKey: !1,
			altKey: !1,
			shiftKey: !1,
			metaKey: !1,
			button: 0,
			relatedTarget: null
		});
		e.dispatchEvent(t);
	}
}
var bw = typeof navigator == "object" ? navigator : { userAgent: "" }, xw = /Macintosh/.test(bw.userAgent) && /AppleWebKit/.test(bw.userAgent) && !/Safari/.test(bw.userAgent), Sw = uw ? typeof HTMLAnchorElement < "u" && "download" in HTMLAnchorElement.prototype && !xw ? Cw : "msSaveOrOpenBlob" in bw ? ww : Tw : () => {};
function Cw(e, t = "download", n) {
	let r = document.createElement("a");
	r.download = t, r.rel = "noopener", typeof e == "string" ? (r.href = e, r.origin === location.origin ? yw(r) : vw(r.href) ? _w(e, t, n) : (r.target = "_blank", yw(r))) : (r.href = URL.createObjectURL(e), setTimeout(function() {
		URL.revokeObjectURL(r.href);
	}, 4e4), setTimeout(function() {
		yw(r);
	}, 0));
}
function ww(e, t = "download", n) {
	if (typeof e == "string") {
		if (vw(e)) _w(e, t, n);
		else {
			let t = document.createElement("a");
			t.href = e, t.target = "_blank", setTimeout(function() {
				yw(t);
			});
		}
	} else navigator.msSaveOrOpenBlob(gw(e, n), t);
}
function Tw(e, t, n, r) {
	if (r ||= open("", "_blank"), r && (r.document.title = r.document.body.innerText = "downloading..."), typeof e == "string") return _w(e, t, n);
	let i = e.type === "application/octet-stream", a = /constructor/i.test(String(hw.HTMLElement)) || "safari" in hw, o = /CriOS\/[\d]+/.test(navigator.userAgent);
	if ((o || i && a || xw) && typeof FileReader < "u") {
		let t = new FileReader();
		t.onloadend = function() {
			let e = t.result;
			if (typeof e != "string") throw r = null, Error("Wrong reader.result type");
			e = o ? e : e.replace(/^data:[^;]*;/, "data:attachment/file;"), r ? r.location.href = e : location.assign(e), r = null;
		}, t.readAsDataURL(e);
	} else {
		let t = URL.createObjectURL(e);
		r ? r.location.assign(t) : location.href = t, r = null, setTimeout(function() {
			URL.revokeObjectURL(t);
		}, 4e4);
	}
}
var { assign: Ew } = Object;
function Dw() {
	let e = tt(!0), t = e.run(() => /* @__PURE__ */ L({})), n = [], r = [], i = An({
		install(e) {
			fw(i), i._a = e, e.provide(pw, i), e.config.globalProperties.$pinia = i, r.forEach((e) => n.push(e)), r = [];
		},
		use(e) {
			return this._a ? n.push(e) : r.push(e), this;
		},
		_p: n,
		_a: null,
		_e: e,
		_s: /* @__PURE__ */ new Map(),
		state: t
	});
	return i;
}
var Ow = () => {};
function kw(e, t, n, r = Ow) {
	e.add(t);
	let i = () => {
		e.delete(t) && r();
	};
	return !n && nt() && rt(i), i;
}
function Aw(e, ...t) {
	e.forEach((e) => {
		e(...t);
	});
}
var jw = (e) => e(), Mw = Symbol(), Nw = Symbol();
function Pw(e, t) {
	e instanceof Map && t instanceof Map ? t.forEach((t, n) => e.set(n, t)) : e instanceof Set && t instanceof Set && t.forEach(e.add, e);
	for (let n in t) {
		if (!Object.hasOwn(t, n)) continue;
		let r = t[n], i = e[n];
		if (mw(i) && mw(r) && Object.hasOwn(e, n) && !/* @__PURE__ */ Nn(r) && !/* @__PURE__ */ Tn(r)) {
			e[n] = Pw(i, r);
			let t = (/* @__PURE__ */ kn(e))[n];
			/* @__PURE__ */ Nn(t) && /* @__PURE__ */ Dn(t) && Ln(t);
		} else e[n] = r;
	}
	return e;
}
var Fw = Symbol();
function Iw(e) {
	return !e || typeof e != "object" || !Object.hasOwn(e, Fw);
}
var { assign: Lw } = Object;
function Rw(e) {
	return !!(/* @__PURE__ */ Nn(e) && e.effect);
}
function zw(e, t, n, r) {
	let { state: i, actions: a, getters: o } = t, s = n.state.value[e], c;
	function l() {
		return s || 
		/* istanbul ignore if */
		(n.state.value[e] = i ? i() : {}), Lw(/* @__PURE__ */ Un(n.state.value[e]), a, Object.keys(o || {}).reduce((t, r) => (t[r] = An(Y(() => {
			fw(n);
			let t = n._s.get(e);
			return o[r].call(t, t);
		})), t), {}));
	}
	return c = Bw(e, l, t, n, r, !0), c;
}
function Bw(e, t, n = {}, r, i, a) {
	let o, s = Lw({ actions: {} }, n), c = { deep: !0 }, l, u, d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), p, m = r.state.value[e];
	!a && !m && 
	/* istanbul ignore if */
	(r.state.value[e] = {});
	let h;
	function g(t) {
		let n;
		l = u = !1, typeof t == "function" ? (t(r.state.value[e]), n = {
			type: "patch function",
			storeId: e,
			events: p
		}) : (Pw(r.state.value[e], t), n = {
			type: "patch object",
			payload: t,
			storeId: e,
			events: p
		});
		let i = h = Symbol();
		Sr().then(() => {
			h === i && (l = !0);
		}), u = !0, Aw(d, n, r.state.value[e]);
	}
	let _ = a ? function() {
		let { state: e } = n, t = e ? e() : {};
		this.$patch((e) => {
			Lw(e, t);
		});
	} : Ow;
	function v() {
		o.stop(), d.clear(), f.clear(), r._s.delete(e);
	}
	let y = (t, n = "") => {
		if (Mw in t) return t[Nw] = n, t;
		let i = function() {
			fw(r);
			let n = Array.from(arguments), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
			function s(e) {
				a.add(e);
			}
			function c(e) {
				o.add(e);
			}
			Aw(f, {
				args: n,
				name: i[Nw],
				store: b,
				after: s,
				onError: c
			});
			let l;
			try {
				l = t.apply(this && this.$id === e ? this : b, n);
			} catch (e) {
				throw Aw(o, e), e;
			}
			return l instanceof Promise ? l.then((e) => (Aw(a, e), e)).catch((e) => (Aw(o, e), Promise.reject(e))) : (Aw(a, l), l);
		};
		return i[Mw] = !0, i[Nw] = n, i;
	}, b = /* @__PURE__ */ bn({
		_p: r,
		$id: e,
		$onAction: kw.bind(null, f),
		$patch: g,
		$reset: _,
		$subscribe(t, n = {}) {
			if (d.has(t)) return Ow;
			let i = kw(d, t, n.detached, () => a()), a = o.run(() => Qr(() => r.state.value[e], (r) => {
				(n.flush === "sync" ? u : l) && t({
					storeId: e,
					type: "direct",
					events: p
				}, r);
			}, Lw({}, c, n)));
			return i;
		},
		$dispose: v
	});
	r._s.set(e, b);
	let x = (r._a && r._a.runWithContext || jw)(() => r._e.run(() => (o = tt()).run(() => t({ action: y }))));
	for (let t in x) {
		let n = x[t];
		/* @__PURE__ */ Nn(n) && !Rw(n) || /* @__PURE__ */ Tn(n) ? a || (m && Iw(n) && (/* @__PURE__ */ Nn(n) ? n.value = m[t] : ((n instanceof Set || n instanceof Map) && n.clear(), Pw(n, m[t]))), r.state.value[e][t] = n) : typeof n == "function" && (x[t] = y(n, t), s.actions[t] = n);
	}
	return Lw(b, x), Lw(/* @__PURE__ */ kn(b), x), Object.defineProperty(b, "$state", {
		get: () => r.state.value[e],
		set: (e) => {
			g((t) => {
				Lw(t, e);
			});
		}
	}), r._p.forEach((e) => {
		let t = o.run(() => e({
			store: b,
			app: r._a,
			pinia: r,
			options: s
		}));
		Lw(b, t);
	}), m && a && n.hydrate && n.hydrate(b.$state, m), l = !0, u = !0, b;
}
function Vw(e, t, n) {
	let r, i = typeof t == "function";
	r = i ? n : t;
	function a(n, a) {
		let o = Kr();
		return n ||= o ? Gr(pw, null) : null, n && fw(n), n = dw, n._s.has(e) || (i ? Bw(e, t, r, n) : zw(e, r, n)), n._s.get(e);
	}
	return a.$id = e, a;
}
// src/stores/app.ts
var Hw = Vw("app", () => {
	let e = /* @__PURE__ */ Pn(null), t = /* @__PURE__ */ L(!1), n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L(null), i = /* @__PURE__ */ L(null);
	function a() {
		if (!e.value) throw Error("助手尚未启动完成");
		return e.value;
	}
	function o(t) {
		e.value = t;
	}
	async function s() {
		let e = await Yy(a().db);
		return r.value = e, e;
	}
	async function c(e) {
		let t = Uy.parse({
			...await Yy(a().db),
			...e
		});
		await a().db.setMeta("settings", t), r.value = t;
	}
	async function l() {
		let e = a(), [t, n] = await Promise.all([Jy(e.db), Yy(e.db)]);
		r.value = n, i.value = qy(t, n, e.now());
	}
	return {
		services: e,
		booted: t,
		bootError: n,
		settings: r,
		reminder: i,
		svc: a,
		setServices: o,
		refreshSettings: s,
		updateSettings: c,
		refreshBackup: l
	};
}), Uw = 500, Ww = Vw("campaign", () => {
	let e = null, t, n = /* @__PURE__ */ Pn(null), r = /* @__PURE__ */ Pn(null), i = /* @__PURE__ */ L(!1), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(!1), s = Y(() => r.value !== null), c = /* @__PURE__ */ Pn(null), l = 0;
	function u() {
		if (!e) throw Error("存档服务尚未初始化");
		return e;
	}
	function d() {
		if (i.value) throw new $("E_READ_ONLY", "另一个窗口正在使用助手，此窗口为只读");
	}
	function f(e) {
		r.value = e, o.value = e ? BC(e) : !1;
	}
	async function p() {
		let t = ++l, n = r.value?.currentSaveId, i = n && e ? await e.campaign.getSave(n) : null;
		t === l && (c.value = i);
	}
	async function m(t, r) {
		e = t, n.value = r, t.lock.onChange((e) => {
			i.value = e;
		}), t.lock.start(), i.value = t.lock.readOnly, f(r ? await t.campaign.getWorkspace(r.ownerKey) : null), a.value = !0;
	}
	async function h(t) {
		await g(), n.value = t, f(t && e ? await e.campaign.getWorkspace(t.ownerKey) : null);
	}
	async function g() {
		t !== void 0 && (clearTimeout(t), t = void 0), r.value && !i.value && await u().campaign.putWorkspace(r.value);
	}
	function _(e) {
		if (d(), !r.value) throw new $("E_NO_WORKSPACE", "还没有当前战役");
		f({
			...r.value,
			data: e(r.value.data)
		}), t !== void 0 && clearTimeout(t), t = setTimeout(() => void g(), Uw);
	}
	async function v(e) {
		if (d(), !n.value) throw new $("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
		await g();
		let t = await u().campaign.startNewCampaign({
			...n.value,
			...e
		});
		return f(t.workspace), t.save;
	}
	async function y() {
		if (d(), !n.value) return !1;
		await g();
		let e = await u().campaign.saveCurrent(n.value.ownerKey);
		return f(e.workspace), e.changed;
	}
	async function b(e) {
		if (d(), !n.value) throw new $("E_NO_WORKSPACE", "还没有当前战役");
		await g();
		let t = await u().campaign.branch(n.value.ownerKey, e);
		return f(t.workspace), t.save;
	}
	async function x(e, t = {}) {
		if (d(), !n.value) throw new $("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
		await g(), f(await u().campaign.loadSave(n.value, e, t));
	}
	async function S(e) {
		if (!n.value) throw new $("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
		return await g(), e(u(), n.value.ownerKey);
	}
	async function C(e) {
		if (d(), !n.value) throw new $("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
		await g();
		let t = await e(u(), n.value.ownerKey);
		return f(t.workspace), t;
	}
	return {
		owner: n,
		workspace: r,
		readOnly: i,
		ready: a,
		dirty: o,
		hasCampaign: s,
		currentSave: c,
		mutate: C,
		inspect: S,
		init: m,
		switchOwner: h,
		refreshCurrentSave: p,
		flush: g,
		updateData: _,
		startNew: v,
		save: y,
		branch: b,
		load: x
	};
});
// src/host/input.ts
function Gw(e) {
	let t = S();
	if (!t) return !1;
	let n = t.value, r = n ? `${n}${n.endsWith("\n") ? "" : "\n"}${e}` : e;
	return D(t, r), t.value === r;
}
// src/host/clipboard.ts
async function Kw(e) {
	try {
		return await navigator.clipboard.writeText(e), !0;
	} catch (e) {
		console.warn("[trpg-assistant] 剪贴板接口不可用，改用备用方式", e);
	}
	let t = document.createElement("textarea");
	t.value = e, t.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0", document.body.appendChild(t), t.select();
	try {
		return document.execCommand("copy");
	} finally {
		t.remove();
	}
}
// src/library/runtime/dice.ts
var qw = "en", Jw = null;
function Yw() {
	return Jw ??= (async () => {
		let e = new Bb(), t = new kx({ db: e });
		return Ix({
			codeSet: qw,
			pluginRoot: new URL("../", "" + import.meta.url),
			container: document.body,
			handlers: Nx({
				codeSet: qw,
				db: e,
				files: t,
				allowNetwork: () => !1
			})
		});
	})().catch((e) => {
		throw Jw = null, e;
	}), Jw;
}
var Xw = {
	read: async (e) => (await Yw()).call("diceRead", e),
	roll: async (e, t) => (await Yw()).call("diceRoll", e, t)
}, Zw = {
	normal: "",
	adv: " 优势",
	dis: " 劣势"
};
function Qw(e, t) {
	let { groups: n, mod: r, mode: i } = e, a = n?.reduce((e, t) => e + (t.pair ? 2 : t.count), 0);
	if (n && a === t.used.length) {
		let e = [], a = [], o = 0, s, c = !1, l = r;
		for (let r of n) {
			let n = t.used.slice(o, o + (r.pair ? 2 : r.count)).map((e) => e.value);
			o += n.length;
			let u = r.sign === -1 ? "- " : a.length ? "+ " : "", d = n.reduce((e, t) => e + t, 0);
			if (r.pair) {
				let t = i === "adv" ? n[0] >= n[1] ? 0 : 1 : n[0] <= n[1] ? 0 : 1;
				d = n[t], n.forEach((n, r) => e.push({
					sides: 20,
					value: n,
					dim: r !== t
				})), a.push(`${u}取${i === "adv" ? "高" : "低"} ${n.join("/")}`);
			} else n.forEach((t) => e.push({
				sides: r.sides,
				value: t,
				dim: !1
			})), a.push(`${u}${n.join(" + ")}`);
			!c && r.sides === 20 && r.count === 1 && r.sign === 1 && (c = !0, s = d === 20 ? 20 : d === 1 ? 1 : void 0), l += r.sign * d;
		}
		if (r && a.push(`${r < 0 ? "- " : a.length ? "+ " : ""}${Math.abs(r)}`), l === t.total) return {
			expression: n.map((e, t) => `${e.sign === -1 ? "-" : t === 0 ? "" : "+"}${e.count}d${e.sides}`).join("") + (r ? `${r > 0 ? n.length ? "+" : "" : "-"}${Math.abs(r)}` : ""),
			mode: i,
			total: t.total,
			dice: e,
			mod: r,
			detail: a.join(" "),
			...s ? { natural: s } : {}
		};
	}
	return {
		expression: e.formula.replace(/\s+/g, ""),
		mode: "normal",
		total: t.total,
		dice: t.used.map((e) => ({
			sides: e.max,
			value: e.value,
			dim: !1
		})),
		mod: 0,
		detail: t.text ?? ""
	};
}
function $w(e) {
	return `${e.expression}${Zw[e.mode]} = ${e.total}（${e.detail}）`;
}
function eT(e, t) {
	let n = t.trim().replace(/-{2,}/g, "—").replace(/[<>]/g, "");
	return `<!-- [掷骰] ${n ? `${n}：` : ""}${e} -->`;
}
// src/rules/dice/builder.ts
var tT = [
	4,
	6,
	8,
	10,
	12,
	20,
	100
], nT = {
	dice: [],
	mod: 0
};
function rT(e, t) {
	let n = [];
	for (let t of e) {
		let e = n.find((e) => e.sides === t.sides && e.sign === t.sign);
		e ? e.count += t.count : n.push({ ...t });
	}
	return {
		dice: n,
		mod: t
	};
}
var iT = (e) => [...e.dice].sort((e, t) => t.sign - e.sign || e.sides - t.sides);
function aT(e) {
	let t = iT(e).map((e, t) => `${t === 0 ? e.sign === -1 ? "-" : "" : e.sign === -1 ? "- " : "+ "}${e.count}d${e.sides}`).join(" ");
	return e.mod && (t += `${t ? " " : ""}${e.mod > 0 ? t ? "+ " : "+" : "- "}${Math.abs(e.mod)}`), t;
}
function oT(e, t) {
	let n = iT(e).map((e) => ({
		...e,
		pair: t !== "normal" && e.sides === 20 && e.count === 1 && e.sign === 1
	})), r = n.map((e, n) => `${e.sign === -1 ? "-" : n === 0 ? "" : "+"}${e.pair ? `2d20${t === "adv" ? "kh1" : "kl1"}` : `${e.count}d${e.sides}`}`);
	return {
		formula: r.join("") + (e.mod ? `${e.mod > 0 ? r.length ? "+" : "" : "-"}${Math.abs(e.mod)}` : ""),
		groups: n
	};
}
function sT(e, t) {
	let n = e.dice.map((e) => ({ ...e })), r = n.find((e) => e.sides === t && e.sign === 1);
	return r ? r.count = Math.min(100, r.count + 1) : n.push({
		count: 1,
		sides: t,
		sign: 1
	}), {
		...e,
		dice: n
	};
}
function cT(e, t) {
	return {
		...e,
		dice: e.dice.map((e) => e.sides === t && e.sign === 1 ? {
			...e,
			count: e.count - 1
		} : { ...e }).filter((e) => e.count > 0)
	};
}
function lT(e, t, n = -20, r = 30) {
	return {
		...e,
		mod: Math.min(r, Math.max(n, e.mod + t))
	};
}
function uT(e, t) {
	return e.dice.filter((e) => e.sides === t && e.sign === 1).reduce((e, t) => e + t.count, 0);
}
function dT(e) {
	let t = e.dice.filter((e) => e.sides === 20);
	return t.length === 1 && t[0].count === 1 && t[0].sign === 1;
}
function fT(e) {
	return e.dice.reduce((e, t) => e + t.count, 0);
}
function pT(e) {
	let t = e || 20;
	return tT.find((e) => t <= e) ?? 100;
}
var mT = "trpg-assistant:dice", hT = (e) => e ? `${mT}:${e}` : mT;
function gT(e) {
	let t = {
		history: [],
		text: "",
		mode: "normal",
		note: ""
	};
	try {
		let n = localStorage.getItem(hT(e));
		if (!n) return t;
		let r = JSON.parse(n);
		return {
			history: Array.isArray(r.history) ? r.history.filter((e) => typeof e?.formula == "string").slice(0, 20) : [],
			text: typeof r.text == "string" ? r.text : "",
			mode: r.mode === "adv" || r.mode === "dis" ? r.mode : "normal",
			note: typeof r.note == "string" ? r.note : ""
		};
	} catch (e) {
		return console.warn("[trpg-assistant] 读取掷骰记录失败", e), t;
	}
}
var _T = Vw("dice", () => {
	let e = null, t = Xw, n = null, r = 1, i = 0, a = Promise.resolve(), o, s = gT(null), c = /* @__PURE__ */ L(s.text), l = /* @__PURE__ */ L(s.mode), u = /* @__PURE__ */ L(s.note), d = /* @__PURE__ */ L(s.history), f = /* @__PURE__ */ L(null), p = /* @__PURE__ */ Pn(null), m = /* @__PURE__ */ L("idle"), h = /* @__PURE__ */ L(!1), g = /* @__PURE__ */ Pn({
		ok: !0,
		builder: nT
	}), _ = /* @__PURE__ */ L(!1), v = /* @__PURE__ */ L(""), y = Y(() => g.value.ok ? v.value : g.value.error), b = Y(() => g.value.ok && g.value.builder || nT), x = Y(() => g.value.ok && !!g.value.builder && dT(g.value.builder)), S = Y(() => g.value.ok && (!g.value.builder || fT(g.value.builder) > 0));
	function C() {
		let e = ++i, n = c.value;
		_.value = !0, v.value = "", a = t.read(n).then((t) => {
			e === i && (g.value = t.ok ? t.simple ? {
				ok: !0,
				builder: rT(t.dice, t.mod)
			} : {
				ok: !0,
				builder: null
			} : {
				ok: !1,
				error: `骰式看不懂：${t.error}`
			});
		}, (t) => {
			e === i && (console.error("[trpg-assistant] 作者骰子程序读骰式失败", t), g.value = {
				ok: !1,
				error: `骰子程序没有响应：${t instanceof Error ? t.message : String(t)}`
			});
		}).finally(() => {
			e === i && (_.value = !1);
		});
	}
	function w() {
		try {
			localStorage.setItem(hT(e), JSON.stringify({
				history: d.value,
				text: c.value,
				mode: l.value,
				note: u.value
			}));
		} catch (e) {
			console.warn("[trpg-assistant] 保存掷骰记录失败", e);
		}
	}
	function T(t) {
		e = t;
		let n = gT(t);
		d.value = n.history, c.value = n.text, l.value = n.mode, u.value = n.note, f.value = null, p.value = null, C();
	}
	let E = (e) => {
		n = e;
	}, D = (e) => {
		t = e ?? Xw, C();
	};
	function ee(e, t) {
		c.value = e, w(), C(), t && (g.value = {
			ok: !0,
			builder: t
		});
	}
	let O = (e, t) => {
		let n = g.value.ok ? g.value.builder : nT;
		if (n) {
			let t = e(n);
			ee(aT(t), t);
		} else t && ee(t());
	}, te = (e) => O((t) => sT(t, e), () => `${c.value.trim()} + 1d${e}`), ne = (e) => O((t) => cT(t, e)), re = (e) => O((t) => lT(t, e)), ie = () => {
		c.value = "", l.value = "normal", w(), C(), g.value = {
			ok: !0,
			builder: nT
		};
	}, ae = (e) => ee(e);
	function oe(e) {
		l.value = e, w();
	}
	function se(e) {
		u.value = e, w();
	}
	async function ce() {
		if (await a, !S.value || !g.value.ok) return null;
		let e = x.value ? l.value : "normal", i = g.value.builder, o = i ? oT(i, e) : {
			formula: c.value,
			groups: null
		}, s = i ? aT(i) : c.value.trim(), _;
		try {
			_ = await t.roll(o.formula, n ?? void 0);
		} catch (e) {
			return console.error("[trpg-assistant] 作者骰子程序掷骰失败", e), v.value = `骰子程序没有响应：${e instanceof Error ? e.message : String(e)}`, null;
		}
		if (_.status !== "complete") return v.value = _.status === "missing" ? `已给的骰点不够，还要一颗 d${_.missing.dice.max}` : _.status === "unsupported" ? _.reason : `掷骰出错：${_.error}`, null;
		v.value = "";
		let y = Qw({
			formula: o.formula,
			groups: o.groups,
			mod: i?.mod ?? 0,
			mode: e
		}, _), b = {
			id: r++,
			at: Date.now(),
			note: u.value.trim(),
			expression: y.expression,
			formula: s,
			mode: e,
			total: y.total,
			line: $w(y),
			...y.natural ? { natural: y.natural } : {}
		};
		return f.value = b, p.value = y, d.value = [b, ...d.value].slice(0, 20), m.value = "idle", h.value = !1, w(), b;
	}
	function le(e) {
		c.value = e.formula, l.value = e.mode, w(), C();
	}
	function k() {
		d.value = [], w();
	}
	let ue = (e) => eT(e.line, u.value.trim() || e.note);
	function A() {
		if (!f.value) return !1;
		let e = Gw(ue(f.value));
		return m.value = e ? "done" : "failed", o !== void 0 && clearTimeout(o), e && (o = setTimeout(() => m.value = "idle", 2e3)), e;
	}
	async function de() {
		return f.value ? (h.value = await Kw(ue(f.value)), h.value) : !1;
	}
	return {
		text: c,
		mode: l,
		note: u,
		history: d,
		last: f,
		lastResult: p,
		fillState: m,
		copied: h,
		error: y,
		builder: b,
		canMode: x,
		canRoll: S,
		pending: _,
		setOwner: T,
		setPoints: E,
		setBackend: D,
		addOne: te,
		removeOne: ne,
		step: re,
		clear: ie,
		setText: ae,
		setMode: oe,
		setNote: se,
		roll: ce,
		loadRecord: le,
		clearHistory: k,
		fill: A,
		copy: de,
		commentOf: ue
	};
}), vT = {
	success: 4e3,
	info: 4e3,
	undo: 6e3,
	error: 8e3,
	status: 6e3
}, yT = Vw("toast", () => {
	let e = /* @__PURE__ */ L([]), t = /* @__PURE__ */ new Map(), n = 1;
	function r(n) {
		let r = t.get(n);
		r?.handle !== void 0 && clearTimeout(r.handle), t.delete(n), e.value = e.value.filter((e) => e.id !== n);
	}
	function i(e, n) {
		let i = {
			handle: void 0,
			remaining: n,
			startedAt: Date.now()
		};
		i.handle = setTimeout(() => r(e), n), t.set(e, i);
	}
	function a(t, a, o) {
		let s = n++, c = typeof o == "function" ? { undo: o } : o ?? {};
		for (e.value = [...e.value, {
			id: s,
			kind: t,
			message: a,
			...c
		}]; e.value.length > 3;) r(e.value[0].id);
		return i(s, vT[t]), s;
	}
	function o(e) {
		let n = t.get(e);
		n && n.handle !== void 0 && (clearTimeout(n.handle), n.handle = void 0, n.remaining = Math.max(500, n.remaining - (Date.now() - n.startedAt)));
	}
	function s(e) {
		let n = t.get(e);
		n && n.handle === void 0 && i(e, n.remaining);
	}
	async function c(t) {
		let n = e.value.find((e) => e.id === t);
		r(t), await n?.undo?.();
	}
	let l = (e) => a("success", e), u = (e) => a("info", e), d = (e) => a("status", e), f = (e, t) => a("undo", e, { undo: t });
	async function p(e, t) {
		r(e), await t.run();
	}
	return {
		toasts: e,
		push: a,
		dismiss: r,
		pause: o,
		resume: s,
		runUndo: c,
		runAction: p,
		success: l,
		info: u,
		status: d,
		undoable: f,
		error: (e) => a("error", e)
	};
});
// src/ui/shell/boot.ts
async function bT(e, t) {
	let n = Hw(t), r = yT(t), i = Ww(t), a = _T(t);
	try {
		let e = lw();
		n.setServices(e), await Zy(e.db), await n.refreshBackup();
		let t = $y(x());
		await i.init(e, t), a.setOwner(t?.ownerKey ?? null), n.booted = !0;
	} catch (e) {
		return console.error("[trpg-assistant] 启动失败", e), n.bootError = e instanceof Error ? e.message : String(e), () => void 0;
	}
	let o = Qr(() => [i.workspace?.currentSaveId, i.workspace?.savedHash], () => void i.refreshCurrentSave().catch((e) => console.error("[trpg-assistant] 读取当前存档信息失败", e)), { immediate: !0 }), s = 0, c = () => {
		let e = i.owner?.ownerKey ?? null, t = !!i.workspace?.data?.kernel;
		++s, (async () => {
			let r = n.svc();
			!e || !t || i.readOnly ? await r.backend.kernel.closeAllExcept(null) : await r.backend.kernel.enter(e);
		})().catch((e) => {
			console.error("[trpg-assistant] 结算内核启动失败", e), r.error(`结算内核启动失败：${e instanceof Error ? e.message : String(e)}`);
		});
	};
	c();
	let l = Qr(() => [
		i.owner?.ownerKey ?? "",
		!!i.workspace?.data?.kernel,
		i.readOnly
	], () => c()), u = Qr(() => i.readOnly, (e) => {
		e && r.status("另一个窗口正在使用助手，这里只能查看");
	}, { immediate: !0 }), d = E(e, T(e, "CHAT_CHANGED", "chat_id_changed"), () => {
		let e = $y(x());
		i.switchOwner(e).catch((e) => {
			console.error("[trpg-assistant] 切换聊天后载入战役数据失败", e), r.error("切换聊天后载入战役数据失败，请重新打开助手");
		}), a.setOwner(e?.ownerKey ?? null);
	});
	return () => {
		u(), o(), l(), d(), i.owner && n.svc().backend.kernel.closeAllExcept(null);
	};
}
// src/stores/ui.ts
var xT = {
	home: "首页",
	settings: "设置"
}, ST = Vw("ui", () => {
	let e = /* @__PURE__ */ L(!1), t = /* @__PURE__ */ L("home"), n = /* @__PURE__ */ L(!1);
	function r(e) {
		t.value = e;
	}
	return {
		windowOpen: e,
		page: t,
		diceOpen: n,
		go: r
	};
}), CT = [
	"data-kind",
	"onPointerenter",
	"onPointerleave",
	"onFocusin",
	"onFocusout"
], wT = { class: "trpg-toast__text" }, TT = ["onClick"], ET = ["onClick"], DT = /* @__PURE__ */ B({
	__name: "ToastHost",
	setup(e) {
		let t = yT();
		return (e, n) => (U(), G(su, {
			name: "trpg-toast",
			tag: "div",
			class: "trpg-toasts",
			role: "status",
			"aria-live": "polite"
		}, {
			default: z(() => [(U(!0), W(H, null, Ba(R(t).toasts, (e) => (U(), W("div", {
				key: e.id,
				class: "trpg-toast",
				"data-kind": e.kind,
				onPointerenter: (n) => R(t).pause(e.id),
				onPointerleave: (n) => R(t).resume(e.id),
				onFocusin: (n) => R(t).pause(e.id),
				onFocusout: (n) => R(t).resume(e.id)
			}, [
				K("span", wT, F(e.message), 1),
				e.undo ? (U(), W("button", {
					key: 0,
					type: "button",
					onClick: (n) => R(t).runUndo(e.id)
				}, "撤销", 8, TT)) : J("", !0),
				(U(!0), W(H, null, Ba(e.actions ?? [], (n, r) => (U(), W("button", {
					key: r,
					type: "button",
					onClick: (r) => R(t).runAction(e.id, n)
				}, F(n.label), 9, ET))), 128))
			], 40, CT))), 128))]),
			_: 1
		}));
	}
}), OT = {
	class: "trpg-die",
	viewBox: "0 0 100 100",
	"aria-hidden": "true",
	focusable: "false"
}, kT = {
	key: 0,
	points: "50,8 94,86 6,86"
}, AT = {
	key: 1,
	class: "trpg-die__body",
	d: "M24 14h52a10 10 0 0 1 10 10v52a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V24a10 10 0 0 1 10-10z"
}, jT = ["y", "font-size"], MT = /* @__PURE__ */ B({
	__name: "DieIcon",
	props: {
		sides: {},
		value: {}
	},
	setup(e) {
		let t = e, n = Y(() => [
			4,
			6,
			8,
			10,
			12,
			20,
			100
		].find((e) => t.sides <= e) ?? 100), r = Y(() => t.value === void 0 ? "" : String(t.value)), i = Y(() => r.value.length >= 3 ? 24 : r.value.length === 2 ? 32 : 38), a = Y(() => n.value === 4 ? 64 : 53);
		return (e, t) => (U(), W("svg", OT, [n.value === 4 ? (U(), W("polygon", kT)) : n.value === 6 ? (U(), W("path", AT)) : n.value === 8 ? (U(), W(H, { key: 2 }, [t[0] ||= K("polygon", { points: "50,6 92,50 50,94 8,50" }, null, -1), t[1] ||= K("path", {
			class: "trpg-die__facet",
			d: "M8 50h84"
		}, null, -1)], 64)) : n.value === 10 || n.value === 100 ? (U(), W(H, { key: 3 }, [t[2] ||= K("polygon", { points: "50,5 91,38 50,95 9,38" }, null, -1), t[3] ||= K("path", {
			class: "trpg-die__facet",
			d: "M50 5v90M9 38h82"
		}, null, -1)], 64)) : n.value === 12 ? (U(), W(H, { key: 4 }, [t[4] ||= K("polygon", { points: "50,7 92,38 76,88 24,88 8,38" }, null, -1), t[5] ||= K("path", {
			class: "trpg-die__facet",
			d: "M50 30l22 16-8 26H36l-8-26z"
		}, null, -1)], 64)) : (U(), W(H, { key: 5 }, [t[6] ||= K("polygon", { points: "50,5 90,27 90,73 50,95 10,73 10,27" }, null, -1), t[7] ||= K("path", {
			class: "trpg-die__facet",
			d: "M50 22l26 46H24z"
		}, null, -1)], 64)), r.value ? (U(), W("text", {
			key: 6,
			x: "50",
			y: a.value,
			"font-size": i.value,
			"text-anchor": "middle",
			"dominant-baseline": "central"
		}, F(r.value), 9, jT)) : J("", !0)]));
	}
}), NT = {
	user: "<path d=\"M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.51-31.9,48-50.59,80.57-50.59s62.06,18.69,80.57,50.59a8,8,0,0,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z\"/>",
	users: "<path d=\"M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z\"/>",
	tag: "<path d=\"M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z\"/>",
	"push-pin-fill": "<path d=\"M235.33,104l-53.47,53.65c4.56,12.67,6.45,33.89-13.19,60A15.93,15.93,0,0,1,157,224c-.38,0-.75,0-1.13,0a16,16,0,0,1-11.32-4.69L96.29,171,53.66,213.66a8,8,0,0,1-11.32-11.32L85,159.71l-48.3-48.3A16,16,0,0,1,38,87.63c25.42-20.51,49.75-16.48,60.4-13.14L152,20.7a16,16,0,0,1,22.63,0l60.69,60.68A16,16,0,0,1,235.33,104Z\"/>",
	"sort-ascending": "<path d=\"M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H184a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Zm56,112H48a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm125.66-21.66a8,8,0,0,0-11.32,0L192,188.69V112a8,8,0,0,0-16,0v76.69l-26.34-26.35a8,8,0,0,0-11.32,11.32l40,40a8,8,0,0,0,11.32,0l40-40A8,8,0,0,0,229.66,162.34Z\"/>",
	"sort-descending": "<path d=\"M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H184a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Zm56,112H48a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm125.66,11.32-40-40a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,11.32,11.32L176,168.69V64a8,8,0,0,0-16,0v104.69l-26.34-26.35a8,8,0,0,0-11.32,11.32l40,40A8,8,0,0,0,229.66,195.32Z\"/>",
	archive: "<path d=\"M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104H208ZM224,88H32V64H224V88ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z\"/>",
	"arrow-clockwise": "<path d=\"M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z\"/>",
	"arrow-counter-clockwise": "<path d=\"M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z\"/>",
	"arrow-right": "<path d=\"M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z\"/>",
	"book-open": "<path d=\"M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z\"/>",
	books: "<path d=\"M231.65,194.55,198.46,36.75a16,16,0,0,0-19-12.39L132.65,34.42a16.08,16.08,0,0,0-12.3,19l33.19,157.8A16,16,0,0,0,169.16,224a16.25,16.25,0,0,0,3.38-.36l46.81-10.06A16.09,16.09,0,0,0,231.65,194.55ZM136,50.15c0-.06,0-.09,0-.09l46.8-10,3.33,15.87L139.33,66Zm6.62,31.47,46.82-10.05,3.34,15.9L146,97.53Zm6.64,31.57,46.82-10.06,13.3,63.24-46.82,10.06ZM216,197.94l-46.8,10-3.33-15.87L212.67,182,216,197.85C216,197.91,216,197.94,216,197.94ZM104,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,104,32ZM56,48h48V64H56Zm0,32h48v96H56Zm48,128H56V192h48v16Z\"/>",
	"caret-down": "<path d=\"M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z\"/>",
	"caret-left": "<path d=\"M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z\"/>",
	"caret-right": "<path d=\"M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z\"/>",
	check: "<path d=\"M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z\"/>",
	"check-circle": "<path d=\"M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z\"/>",
	"circle-notch": "<path d=\"M232,128a104,104,0,0,1-208,0c0-41,23.81-78.36,60.66-95.27a8,8,0,0,1,6.68,14.54C60.15,61.59,40,93.27,40,128a88,88,0,0,0,176,0c0-34.73-20.15-66.41-51.34-80.73a8,8,0,0,1,6.68-14.54C208.19,49.64,232,87,232,128Z\"/>",
	copy: "<path d=\"M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z\"/>",
	"dice-five": "<path d=\"M192,32H64A32,32,0,0,0,32,64V192a32,32,0,0,0,32,32H192a32,32,0,0,0,32-32V64A32,32,0,0,0,192,32Zm16,160a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V64A16,16,0,0,1,64,48H192a16,16,0,0,1,16,16ZM104,92A12,12,0,1,1,92,80,12,12,0,0,1,104,92Zm72,0a12,12,0,1,1-12-12A12,12,0,0,1,176,92Zm-72,72a12,12,0,1,1-12-12A12,12,0,0,1,104,164Zm36-36a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm36,36a12,12,0,1,1-12-12A12,12,0,0,1,176,164Z\"/>",
	"dots-three": "<path d=\"M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z\"/>",
	"download-simple": "<path d=\"M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z\"/>",
	"file-arrow-down": "<path d=\"M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-42.34-61.66a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L120,164.69V120a8,8,0,0,1,16,0v44.69l10.34-10.35A8,8,0,0,1,157.66,154.34Z\"/>",
	flask: "<path d=\"M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z\"/>",
	"floppy-disk": "<path d=\"M219.31,72,184,36.69A15.86,15.86,0,0,0,172.69,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V83.31A15.86,15.86,0,0,0,219.31,72ZM168,208H88V152h80Zm40,0H184V152a16,16,0,0,0-16-16H88a16,16,0,0,0-16,16v56H48V48H172.69L208,83.31ZM160,72a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h56A8,8,0,0,1,160,72Z\"/>",
	gear: "<path d=\"M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z\"/>",
	house: "<path d=\"M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z\"/>",
	info: "<path d=\"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z\"/>",
	lock: "<path d=\"M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z\"/>",
	"magnifying-glass": "<path d=\"M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z\"/>",
	"pencil-simple": "<path d=\"M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z\"/>",
	plus: "<path d=\"M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z\"/>",
	stack: "<path d=\"M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z\"/>",
	trash: "<path d=\"M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z\"/>",
	"upload-simple": "<path d=\"M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z\"/>",
	warning: "<path d=\"M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z\"/>",
	"users-three": "<path d=\"M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z\"/>",
	list: "<path d=\"M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z\"/>",
	skull: "<path d=\"M92,104a28,28,0,1,0,28,28A28,28,0,0,0,92,104Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,92,144Zm72-40a28,28,0,1,0,28,28A28,28,0,0,0,164,104Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,164,144ZM128,16C70.65,16,24,60.86,24,116c0,34.1,18.27,66,48,84.28V216a16,16,0,0,0,16,16h80a16,16,0,0,0,16-16V200.28C213.73,182,232,150.1,232,116,232,60.86,185.35,16,128,16Zm44.12,172.69a8,8,0,0,0-4.12,7V216H152V192a8,8,0,0,0-16,0v24H120V192a8,8,0,0,0-16,0v24H88V195.69a8,8,0,0,0-4.12-7C56.81,173.69,40,145.84,40,116c0-46.32,39.48-84,88-84s88,37.68,88,84C216,145.83,199.19,173.69,172.12,188.69Z\"/>",
	x: "<path d=\"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z\"/>",
	question: "<path d=\"M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z\"/>",
	star: "<path d=\"M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z\"/>",
	"star-fill": "<path d=\"M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z\"/>",
	moon: "<path d=\"M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z\"/>",
	minus: "<path d=\"M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z\"/>"
}, PT = [
	"width",
	"height",
	"innerHTML"
], FT = /* @__PURE__ */ B({
	__name: "Icon",
	props: {
		name: {},
		size: {}
	},
	setup(e) {
		let t = e, n = Y(() => NT[t.name] ?? ""), r = Y(() => `${t.size ?? 18}px`);
		return (e, t) => (U(), W("svg", {
			class: "trpg-icon",
			viewBox: "0 0 256 256",
			fill: "currentColor",
			"aria-hidden": "true",
			focusable: "false",
			width: r.value,
			height: r.value,
			innerHTML: n.value
		}, null, 8, PT));
	}
});
// src/ui/shell/storage.ts
function IT(e, t) {
	try {
		let n = localStorage.getItem(e);
		if (!n) return t;
		let r = JSON.parse(n);
		return Number.isFinite(r.x) && Number.isFinite(r.y) ? r : t;
	} catch (e) {
		return console.warn("[trpg-assistant] 读取窗口位置失败", e), t;
	}
}
function LT(e, t) {
	try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/useDrag.ts
function RT(e, t, n) {
	return Math.min(Math.max(e, t), Math.max(t, n));
}
function zT(e) {
	let t = e.threshold ?? 5;
	function n(n) {
		if (n.button !== 0) return;
		let r = n.target.closest("button");
		if (r && r !== n.currentTarget) return;
		let i = n.currentTarget;
		i.setPointerCapture(n.pointerId);
		let a = n.clientX, o = n.clientY, s = { ...e.position.value }, c = !1, l = (n) => {
			let r = n.clientX - a, i = n.clientY - o;
			if (!c && Math.hypot(r, i) < t) return;
			c = !0;
			let { w: l, h: u } = e.size();
			e.position.value = {
				x: (typeof e.lockX == "function" ? e.lockX() : e.lockX) ? s.x : RT(s.x + r, 0, window.innerWidth - l),
				y: RT(s.y + i, 0, window.innerHeight - u - (e.bottomGap?.() ?? 0))
			};
		}, u = (t) => {
			i.removeEventListener("pointermove", l), i.removeEventListener("pointerup", u), i.removeEventListener("pointercancel", u), i.hasPointerCapture(t.pointerId) && i.releasePointerCapture(t.pointerId), c ? e.onEnd?.() : e.onTap?.();
		};
		i.addEventListener("pointermove", l), i.addEventListener("pointerup", u), i.addEventListener("pointercancel", u);
	}
	return { onPointerDown: n };
}
// src/ui/shell/DiceTray.vue?vue&type=script&setup=true&lang.ts
var BT = ["data-narrow"], VT = { class: "trpg-dice__shell" }, HT = { class: "trpg-dice__main" }, UT = { class: "trpg-dice__body" }, WT = { class: "trpg-dice__row" }, GT = [
	"value",
	"aria-invalid",
	"onKeydown"
], KT = ["disabled"], qT = {
	class: "trpg-field__error trpg-dice__err",
	role: "alert"
}, JT = {
	class: "trpg-dice__faces",
	role: "group",
	"aria-label": "骰子"
}, YT = [
	"data-n",
	"aria-label",
	"onClick"
], XT = {
	key: 0,
	class: "trpg-dice__cnt"
}, ZT = ["aria-label", "onClick"], QT = { class: "trpg-dice__adjust" }, $T = {
	class: "trpg-dice__step",
	role: "group",
	"aria-label": "加减值"
}, eE = { "data-testid": "dice-mod" }, tE = [
	"disabled",
	"aria-pressed",
	"onClick"
], nE = {
	class: "trpg-dice__small",
	"data-testid": "dice-hint"
}, rE = ["disabled", "title"], iE = {
	class: "trpg-dice__result",
	"aria-label": "结果",
	"aria-live": "polite"
}, aE = {
	class: "trpg-dice__line",
	"data-testid": "dice-line"
}, oE = ["data-tone"], sE = {
	class: "trpg-sr-only",
	"data-testid": "dice-total"
}, cE = { class: "trpg-dice__minis" }, lE = {
	key: 0,
	class: "trpg-dice__const"
}, uE = ["title"], dE = { class: "trpg-dice__send" }, fE = ["value"], pE = ["disabled"], mE = ["disabled"], hE = { "aria-label": "最近记录" }, gE = ["aria-expanded"], _E = {
	key: 0,
	class: "trpg-dice__list"
}, vE = ["aria-label", "onClick"], yE = {
	key: 1,
	class: "trpg-dice__clear"
}, bE = /* @__PURE__ */ B({
	__name: "DiceTray",
	setup(e) {
		let t = (e) => e.dice.reduce((e, t) => Math.max(e, t.sides), 0), n = ST(), r = _T(), i = [
			{
				value: "adv",
				label: "优势"
			},
			{
				value: "normal",
				label: "普通"
			},
			{
				value: "dis",
				label: "劣势"
			}
		], a = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches, o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(window.innerWidth), c = /* @__PURE__ */ L(window.innerHeight), l = Y(() => s.value <= 480), u = /* @__PURE__ */ L(IT("trpg-assistant:dice", {
			x: Math.max(8, window.innerWidth - 384),
			y: Math.max(8, window.innerHeight - 700)
		})), d = /* @__PURE__ */ L(!1), f = () => l.value ? 64 : 0, p = () => ({
			w: o.value?.offsetWidth ?? 360,
			h: o.value?.offsetHeight ?? 480
		});
		function m() {
			s.value = window.innerWidth, c.value = window.innerHeight;
			let { w: e, h: t } = p();
			u.value = {
				x: l.value ? Math.round(s.value * .04) : Math.min(Math.max(u.value.x, 0), Math.max(0, s.value - e)),
				y: Math.min(Math.max(u.value.y, 0), Math.max(0, c.value - t - f()))
			};
		}
		let h = zT({
			position: u,
			size: p,
			lockX: () => l.value,
			bottomGap: f,
			onEnd: () => LT("trpg-assistant:dice", u.value)
		}), g = Y(() => l.value ? {
			left: "4vw",
			width: "92vw",
			top: `${u.value.y}px`
		} : {
			left: `${u.value.x}px`,
			top: `${u.value.y}px`
		});
		Ca(() => {
			window.addEventListener("resize", m), Sr(m);
		}), Ea(() => {
			window.removeEventListener("resize", m), clearInterval(b);
		}), Qr(() => n.diceOpen, (e) => e && void Sr(m)), Qr(() => r.lastResult, () => void Sr(m));
		let _ = /* @__PURE__ */ L(!1), v = /* @__PURE__ */ L(null), y = /* @__PURE__ */ L(20), b;
		async function x() {
			if (_.value || !r.canRoll) return;
			let e = v.value, n = pT(t(r.builder)), i = Date.now();
			_.value = !0, v.value = null, a || (y.value = Math.ceil(Math.random() * n), b = setInterval(() => y.value = Math.ceil(Math.random() * n), 70));
			let o = await r.roll(), s = () => {
				clearInterval(b), _.value = !1, v.value = o ? o.id : e;
			};
			!o || a ? s() : setTimeout(s, Math.max(0, 460 - (Date.now() - i)));
		}
		let S = Y(() => r.last && r.lastResult && v.value === r.last.id ? {
			rec: r.last,
			result: r.lastResult
		} : null), C = Y(() => !S.value || _.value ? pT(t(r.builder)) : pT(Math.max(0, ...S.value.result.dice.map((e) => e.sides)))), w = Y(() => r.history.filter((e) => !(_.value && e.id === r.last?.id))), T = Y(() => {
			if (!S.value) return [];
			let e = [];
			return S.value.result.dice.forEach((t, n) => e.push({
				key: `${t.sides}-${n}`,
				kind: "die",
				sides: t.sides,
				value: t.value,
				dim: t.dim
			})), S.value.result.mod && e.push({
				key: "c",
				kind: "const",
				value: S.value.result.mod
			}), e;
		}), E = (e) => `${e > 0 ? "+" : "−"}${Math.abs(e)}`, D = Y(() => r.builder.mod > 0 ? `+${r.builder.mod}` : String(r.builder.mod)), ee = Y(() => r.fillState === "done" ? "已填入 ✓" : r.fillState === "failed" ? "尚未填入，再试一次" : "填入输入框"), O = (e) => new Date(e).toLocaleTimeString("zh-CN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: !1
		}), te = Y(() => r.canMode ? "" : "优势劣势只对单个 1d20 有效"), ne = (e) => r.setText(e.target.value), re = (e) => r.loadRecord(e);
		return (e, t) => R(n).diceOpen ? (U(), W("aside", {
			key: 0,
			ref_key: "el",
			ref: o,
			class: "trpg-dice",
			style: Ie(g.value),
			"data-narrow": l.value,
			role: "dialog",
			"aria-label": "掷骰",
			"aria-modal": "false"
		}, [K("header", {
			class: "trpg-dice__head",
			onPointerdown: t[1] ||= (...e) => R(h).onPointerDown && R(h).onPointerDown(...e)
		}, [
			q(FT, {
				name: "dice-five",
				size: 20
			}),
			t[12] ||= K("span", { class: "trpg-dice__title" }, "掷骰", -1),
			K("button", {
				class: "trpg-icon-btn",
				type: "button",
				"aria-label": "关闭掷骰",
				onClick: t[0] ||= (e) => R(n).diceOpen = !1
			}, [q(FT, {
				name: "x",
				size: 18
			})])
		], 32), K("div", VT, [K("div", HT, [K("div", UT, [
			K("div", null, [
				t[13] ||= K("div", { class: "trpg-dice__lbl" }, [K("label", { for: "trpg-dice-formula" }, "骰式"), K("span", null, "点下面的骰子加进骰式，也可以直接写")], -1),
				K("div", WT, [K("input", {
					id: "trpg-dice-formula",
					value: R(r).text,
					class: "trpg-input trpg-dice__formula",
					type: "text",
					autocomplete: "off",
					spellcheck: "false",
					placeholder: "点骰子，或写 2d6+3",
					"aria-invalid": !!R(r).error,
					onInput: ne,
					onKeydown: [t[2] ||= Ru(() => {}, ["stop"]), Bu(Ru(x, ["prevent"]), ["enter"])]
				}, null, 40, GT), K("button", {
					class: "trpg-btn trpg-btn--quiet",
					type: "button",
					disabled: !R(r).text,
					onClick: t[3] ||= (e) => R(r).clear()
				}, "清空", 8, KT)]),
				K("div", qT, F(R(r).error), 1)
			]),
			K("div", JT, [(U(!0), W(H, null, Ba(R(tT), (e) => (U(), W("div", {
				key: e,
				class: "trpg-dice__face"
			}, [K("button", {
				class: "trpg-dice__die",
				type: "button",
				"data-n": R(uT)(R(r).builder, e),
				"aria-label": `加一颗 d${e}${R(uT)(R(r).builder, e) ? `，现有 ${R(uT)(R(r).builder, e)} 颗` : ""}`,
				onClick: (t) => R(r).addOne(e)
			}, [
				q(MT, { sides: e }, null, 8, ["sides"]),
				K("span", null, "d" + F(e), 1),
				R(uT)(R(r).builder, e) ? (U(), W("span", XT, "×" + F(R(uT)(R(r).builder, e)), 1)) : J("", !0)
			], 8, YT), R(uT)(R(r).builder, e) ? (U(), W("button", {
				key: 0,
				class: "trpg-dice__minus",
				type: "button",
				"aria-label": `减一颗 d${e}`,
				onClick: (t) => R(r).removeOne(e)
			}, "−", 8, ZT)) : J("", !0)]))), 128))]),
			K("div", QT, [K("div", $T, [
				t[14] ||= K("span", { class: "trpg-dice__small" }, "加减值", -1),
				K("button", {
					type: "button",
					"aria-label": "减 1",
					onClick: t[4] ||= (e) => R(r).step(-1)
				}, "−"),
				K("output", eE, F(D.value), 1),
				K("button", {
					type: "button",
					"aria-label": "加 1",
					onClick: t[5] ||= (e) => R(r).step(1)
				}, "+")
			]), K("div", null, [K("div", {
				class: Ve(["trpg-seg", { "is-off": !R(r).canMode }]),
				role: "group",
				"aria-label": "d20 掷法"
			}, [(U(), W(H, null, Ba(i, (e) => K("button", {
				key: e.value,
				type: "button",
				disabled: !R(r).canMode,
				"aria-pressed": (R(r).canMode ? R(r).mode : "normal") === e.value,
				onClick: (t) => R(r).setMode(e.value)
			}, F(e.label), 9, tE)), 64))], 2), K("div", nE, F(te.value), 1)])]),
			K("button", {
				class: "trpg-btn trpg-btn--primary trpg-dice__roll",
				type: "button",
				disabled: !R(r).canRoll || _.value,
				title: R(r).canRoll ? void 0 : "先选一个骰子",
				"data-testid": "dice-roll",
				onClick: x
			}, [q(FT, {
				name: "dice-five",
				size: 22
			}), t[15] ||= Xs("掷骰", -1)], 8, rE),
			K("section", iE, [
				K("div", {
					class: Ve(["trpg-dice__hero", {
						"is-rolling": _.value,
						"is-nat20": S.value?.rec.natural === 20,
						"is-nat1": S.value?.rec.natural === 1
					}]),
					"data-testid": "dice-hero"
				}, [q(MT, {
					sides: C.value,
					value: _.value ? y.value : S.value?.rec.total
				}, null, 8, ["sides", "value"])], 2),
				K("div", aE, [S.value ? (U(), W(H, { key: 0 }, [Xs(F(S.value.rec.line) + " ", 1), S.value.rec.natural ? (U(), W("span", {
					key: 0,
					class: "trpg-badge",
					"data-tone": S.value.rec.natural === 20 ? "gold" : "danger"
				}, "天然 " + F(S.value.rec.natural), 9, oE)) : J("", !0)], 64)) : _.value ? J("", !0) : (U(), W(H, { key: 1 }, [Xs("点「掷骰」，结果会落在这里")], 64))]),
				K("span", sE, F(S.value?.rec.total), 1),
				K("div", cE, [(U(!0), W(H, null, Ba(T.value, (e) => (U(), W(H, { key: e.key }, [e.kind === "const" ? (U(), W("span", lE, F(E(e.value)), 1)) : (U(), W("span", {
					key: 1,
					class: Ve(["trpg-dice__mini", { "is-dim": e.dim }]),
					title: e.dim ? "没有采用" : void 0
				}, [q(MT, {
					sides: e.sides,
					value: e.value
				}, null, 8, ["sides", "value"])], 10, uE))], 64))), 128))]),
				K("div", dE, [
					K("input", {
						value: R(r).note,
						class: "trpg-input",
						type: "text",
						placeholder: "说明（可空），如：感知检定",
						"aria-label": "说明",
						autocomplete: "off",
						onInput: t[6] ||= (e) => R(r).setNote(e.target.value),
						onKeydown: t[7] ||= Ru(() => {}, ["stop"])
					}, null, 40, fE),
					K("button", {
						class: "trpg-btn trpg-btn--primary",
						type: "button",
						disabled: !S.value,
						onClick: t[8] ||= (e) => R(r).fill()
					}, F(ee.value), 9, pE),
					K("button", {
						class: "trpg-btn",
						type: "button",
						disabled: !S.value,
						onClick: t[9] ||= (e) => R(r).copy()
					}, F(R(r).copied ? "已复制 ✓" : "复制"), 9, mE)
				])
			]),
			K("section", hE, [K("button", {
				class: "trpg-dice__recent",
				type: "button",
				"aria-expanded": d.value,
				onClick: t[10] ||= (e) => d.value = !d.value
			}, [K("span", null, [Xs("最近 " + F(w.value.length) + " 次", 1), w.value.length ? (U(), W(H, { key: 0 }, [t[16] ||= Xs(" · 上一次 ", -1), K("b", null, F(w.value[0].total), 1)], 64)) : J("", !0)]), q(FT, {
				name: d.value ? "caret-down" : "caret-right",
				size: 14
			}, null, 8, ["name"])], 8, gE), d.value ? (U(), W(H, { key: 0 }, [w.value.length ? (U(), W("ul", _E, [(U(!0), W(H, null, Ba(w.value, (e) => (U(), W("li", { key: e.id }, [K("button", {
				type: "button",
				"aria-label": `载入骰式 ${e.formula}`,
				onClick: (t) => re(e)
			}, [
				K("b", null, F(e.total), 1),
				K("span", null, [Xs(F(e.formula), 1), e.note ? (U(), W(H, { key: 0 }, [Xs(" · " + F(e.note), 1)], 64)) : J("", !0)]),
				K("time", null, F(O(e.at)), 1)
			], 8, vE)]))), 128))])) : J("", !0), w.value.length ? (U(), W("div", yE, [K("button", {
				class: "trpg-btn trpg-btn--quiet trpg-btn--small",
				type: "button",
				onClick: t[11] ||= (e) => R(r).clearHistory()
			}, "清空记录")])) : J("", !0)], 64)) : J("", !0)])
		])])])], 12, BT)) : J("", !0);
	}
}), xE = ["aria-expanded"], SE = 48, CE = /* @__PURE__ */ B({
	__name: "FloatingBall",
	setup(e) {
		let t = ST(), n = /* @__PURE__ */ L(IT("trpg-assistant:ball", {
			x: 16,
			y: Math.round(window.innerHeight / 2)
		}));
		function r() {
			n.value = {
				x: Math.min(Math.max(n.value.x, 0), Math.max(0, window.innerWidth - SE)),
				y: Math.min(Math.max(n.value.y, 0), Math.max(0, window.innerHeight - SE))
			};
		}
		Ca(() => {
			r(), window.addEventListener("resize", r);
		}), Ea(() => window.removeEventListener("resize", r));
		let i = zT({
			position: n,
			size: () => ({
				w: SE,
				h: SE
			}),
			onTap: () => {
				t.windowOpen = !t.windowOpen;
			},
			onEnd: () => LT("trpg-assistant:ball", n.value)
		}), a = Y(() => ({
			left: `${n.value.x}px`,
			top: `${n.value.y}px`
		}));
		return (e, n) => (U(), W("button", {
			class: "trpg-ball",
			type: "button",
			"aria-label": "打开或收起 TRPG 跑团助手",
			"aria-expanded": R(t).windowOpen,
			style: Ie(a.value),
			onPointerdown: n[0] ||= (...e) => R(i).onPointerDown && R(i).onPointerDown(...e),
			onKeydown: [n[1] ||= Bu(Ru((e) => R(t).windowOpen = !R(t).windowOpen, ["prevent"]), ["enter"]), n[2] ||= Bu(Ru((e) => R(t).windowOpen = !R(t).windowOpen, ["prevent"]), ["space"])]
		}, [q(FT, {
			name: "dice-five",
			size: 26
		})], 44, xE));
	}
}), wE = Vw("modal", () => {
	let e = /* @__PURE__ */ Pn([]), t = /* @__PURE__ */ Pn("forward"), n = Y(() => e.value.length > 0), r = Y(() => e.value[e.value.length - 1]), i = Y(() => e.value.length), a = Y(() => e.value[0]?.variant ?? "dialog");
	function o(e) {
		e?.onLeave?.();
	}
	function s() {
		let t = [...e.value].reverse();
		e.value = [];
		for (let e of t) o(e);
	}
	function c(n) {
		e.value.length && s(), t.value = "forward", e.value = [n];
	}
	function l(n) {
		e.value.length ? (t.value = "forward", e.value = [...e.value, n]) : c(n);
	}
	function u() {
		if (e.value.length <= 1) {
			s();
			return;
		}
		t.value = "back";
		let n = e.value[e.value.length - 1];
		e.value = e.value.slice(0, -1), o(n);
	}
	function d() {
		for (; e.value.length > 1;) u();
	}
	function f(t = !1) {
		return e.value.length ? !t && e.value[0].guard && e.value[0].guard() === !1 ? !1 : (s(), !0) : !0;
	}
	function p() {
		let t = r.value;
		t && t.key.startsWith("confirm:") && e.value.length > 1 ? u() : t && t.key.startsWith("confirm:") ? f(!0) : f();
	}
	function m() {
		e.value.length > 1 ? u() : p();
	}
	function h(t, n) {
		e.value = e.value.map((e) => e.key === t ? {
			...e,
			title: n
		} : e);
	}
	function g(t) {
		let n = e.value[e.value.length - 1];
		n && n.height !== t && (e.value = [...e.value.slice(0, -1), {
			...n,
			height: t
		}]);
	}
	return {
		stack: e,
		direction: t,
		isOpen: n,
		top: r,
		depth: i,
		variant: a,
		open: c,
		push: l,
		pop: u,
		popToRoot: d,
		close: f,
		requestClose: p,
		escape: m,
		setTitle: h,
		setTopHeight: g
	};
}), TE = ["data-variant"], EE = ["data-sized"], DE = {
	key: 0,
	class: "trpg-modal__head"
}, OE = ["aria-label"], kE = ["inert", "aria-hidden"], AE = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])", jE = /* @__PURE__ */ B({
	__name: "ModalHost",
	setup(e) {
		let t = wE(), n = /* @__PURE__ */ L(null), r = /* @__PURE__ */ L(null), i = `trpg-modal-title-${Math.random().toString(36).slice(2, 8)}`, a = null, o = [], s = /* @__PURE__ */ new Map(), c = Y(() => t.depth > 1 ? t.stack[t.depth - 2].title : ""), l = null;
		function u(e) {
			let t = e.composedPath()[0];
			l = t instanceof HTMLElement ? t.closest("button, a[href], input, select, textarea, [tabindex]") : null;
		}
		let d;
		Ca(() => {
			d = n.value?.getRootNode(), d?.addEventListener("pointerdown", u, !0);
		}), Ea(() => d?.removeEventListener("pointerdown", u, !0));
		function f() {
			let e = n.value?.getRootNode(), t = e instanceof ShadowRoot ? e.activeElement : document.activeElement, r = l && l.isConnected ? l : null;
			return r && (!t || t === document.body || t !== r && t.contains(r)) ? r : t && t !== document.body ? t : null;
		}
		function p() {
			let e = r.value;
			return e ? [e.querySelector(".trpg-modal__head"), e.querySelector(".trpg-modal__page:not(.is-under)")].flatMap((e) => e ? [...e.querySelectorAll(AE)] : []).filter((e) => e.getClientRects().length > 0 && e.tabIndex >= 0 && e.getAttribute("aria-hidden") !== "true") : [];
		}
		function m() {
			let e = r.value?.querySelector(".trpg-modal__page:not(.is-under)");
			(e?.querySelector("[data-autofocus]") ?? e?.querySelector(AE) ?? r.value)?.focus({ preventScroll: !0 });
		}
		function h() {
			return r.value ? [...r.value.querySelectorAll(".trpg-modal__page")] : [];
		}
		function g() {
			h().forEach((e, n) => {
				let r = t.stack[n]?.key;
				r && !e.classList.contains("is-under") && s.set(r, e.scrollTop);
			});
		}
		function _() {
			h().forEach((e, n) => {
				let r = t.stack[n]?.key, i = r ? s.get(r) : void 0;
				i !== void 0 && !e.classList.contains("is-under") && (e.scrollTop = i);
			});
		}
		function v(e) {
			e && e.isConnected && e.getClientRects().length > 0 && e.focus({ preventScroll: !0 });
		}
		Qr(() => [t.depth, t.top?.key], async ([e, t], [n, r]) => {
			if (g(), e === 0) {
				s.clear();
				let e = a;
				a = null, o.length = 0, await Sr(), v(e);
			} else if (n === 0 ? a = f() : e > n && o.push(f()), await Sr(), e < n && _(), e < n && n > 0) {
				let e = o.pop() ?? null;
				e && e.isConnected && e.getClientRects().length > 0 ? v(e) : m();
			} else (e !== n || t !== r) && m();
		});
		function y(e) {
			if (e.key === "Escape") {
				e.preventDefault(), e.stopPropagation(), t.escape();
				return;
			}
			if (e.key !== "Tab") return;
			e.preventDefault();
			let n = p();
			if (!n.length) return;
			let r = f(), i = r ? n.indexOf(r) : -1;
			n[e.shiftKey ? i <= 0 ? n.length - 1 : i - 1 : i === -1 || i === n.length - 1 ? 0 : i + 1].focus();
		}
		return (e, a) => (U(), W("div", {
			ref_key: "rootEl",
			ref: n,
			class: "trpg-modal-root"
		}, [R(t).isOpen ? (U(), W("div", {
			key: 0,
			class: "trpg-modal",
			"data-variant": R(t).variant,
			onClick: a[2] ||= Ru((e) => R(t).requestClose(), ["self"]),
			onKeydown: Ru(y, ["stop"])
		}, [K("section", {
			ref_key: "cardEl",
			ref: r,
			class: "trpg-modal__card",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": i,
			"data-sized": R(t).variant !== "confirm" && R(t).top?.width ? "true" : void 0,
			style: Ie(R(t).variant !== "confirm" && R(t).top?.width ? {
				"--trpg-drawer-width": `${R(t).top.width}px`,
				...R(t).top.height ? { "--trpg-dlg-h": `${R(t).top.height}px` } : {}
			} : void 0),
			tabindex: "-1"
		}, [R(t).top?.bare ? J("", !0) : (U(), W("header", DE, [
			R(t).depth > 1 ? (U(), W("button", {
				key: 0,
				class: "trpg-modal__back",
				type: "button",
				"aria-label": `返回：${c.value}`,
				onClick: a[0] ||= (e) => R(t).pop()
			}, [q(FT, {
				name: "caret-left",
				size: 16
			}), K("span", null, F(c.value), 1)], 8, OE)) : J("", !0),
			K("h2", {
				id: i,
				class: "trpg-modal__title"
			}, F(R(t).top?.title), 1),
			R(t).top?.header ? (U(), G(Ia(R(t).top.header), He(tc({ key: 1 }, R(t).top.props)), null, 16)) : J("", !0),
			K("button", {
				class: "trpg-icon-btn trpg-modal__close",
				type: "button",
				"aria-label": "关闭",
				onClick: a[1] ||= (e) => R(t).requestClose()
			}, [q(FT, {
				name: "x",
				size: 18
			})])
		])), q(su, {
			tag: "div",
			name: "trpg-page",
			class: "trpg-modal__pages"
		}, {
			default: z(() => [(U(!0), W(H, null, Ba(R(t).stack, (e, n) => (U(), W("div", {
				key: e.key,
				class: Ve(["trpg-modal__page", { "is-under": n < R(t).depth - 1 }]),
				inert: n < R(t).depth - 1,
				"aria-hidden": n < R(t).depth - 1 ? "true" : void 0
			}, [(U(), G(Ia(e.component), tc({ ref_for: !0 }, e.props), null, 16))], 10, kE))), 128))]),
			_: 1
		})], 12, EE)], 40, TE)) : J("", !0)], 512));
	}
}), ME = {
	src: null,
	alt: "",
	source: "pattern"
};
function NE(e) {
	let t = (e.providers ?? []).flatMap((t) => t(e.data));
	for (let e = 0; e < t.length; e++) {
		let n = t[e];
		if (n.imageUrl) return {
			src: n.imageUrl,
			alt: n.name,
			source: e === 0 ? "location" : "parentLocation"
		};
	}
	let n = e.rule?.defaultBanner;
	return n ? {
		src: e.narrow ? n.narrow : n.wide,
		alt: n.alt,
		source: "default"
	} : ME;
}
// src/ui/format.ts
var PE = (e) => String(e).padStart(2, "0");
function FE(e) {
	let t = new Date(e);
	return `${t.getMonth() + 1}月${t.getDate()}日 ${PE(t.getHours())}:${PE(t.getMinutes())}`;
}
function IE(e) {
	let t = new Date(e);
	return `${PE(t.getHours())}:${PE(t.getMinutes())}`;
}
function LE(e) {
	return e >= 1048576 ? `${(e / 1024 / 1024).toFixed(1).replace(/\.0$/, "")}MB` : e >= 1024 ? `${Math.round(e / 1024)}KB` : `${e}B`;
}
function RE(e) {
	let { partyNames: t, location: n, round: r } = e.summary;
	return [
		t.slice(0, 3).join("、"),
		n,
		r ? `第 ${r} 轮` : ""
	].filter(Boolean).join(" · ");
}
function zE(e) {
	return e instanceof Error ? e.message : String(e);
}
// src/stores/saves.ts
var BE = Vw("saves", () => {
	let e = Hw(), t = Ww(), n = /* @__PURE__ */ L("card"), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L([]), a = /* @__PURE__ */ L([]), o = /* @__PURE__ */ L([]), s = /* @__PURE__ */ L([]), c = /* @__PURE__ */ L(!1);
	async function l() {
		let l = e.svc();
		c.value = !0;
		try {
			let e = t.workspace;
			if (!e) {
				s.value = (await l.db.saves.toArray()).filter((e) => e.kind === "manual" && e.deletedAt === void 0).sort((e, t) => t.updatedAt - e.updatedAt), r.value = i.value = a.value = o.value = [];
				return;
			}
			let c = {
				ownerKey: e.ownerKey,
				ruleId: e.ruleId
			};
			r.value = await l.campaign.listManual(c, n.value), i.value = await l.campaign.listAuto(e.ownerKey, e.ruleId), a.value = await l.campaign.listDeleted(e.ruleId), o.value = await l.campaign.listOtherRules(e.ruleId);
		} finally {
			c.value = !1;
		}
	}
	async function u(e) {
		n.value = e, await l();
	}
	async function d() {
		return (await e.svc().db.saves.toArray()).filter((e) => e.kind === "manual" && e.deletedAt === void 0).length;
	}
	async function f(e) {
		let t = await e();
		return await l(), t;
	}
	return {
		scope: n,
		manual: r,
		autos: i,
		deleted: a,
		otherRules: o,
		everything: s,
		loading: c,
		refresh: l,
		setScope: u,
		count: d,
		rename: (n, r) => f(async () => {
			let i = await e.svc().campaign.renameSave(n, r);
			return await t.refreshCurrentSave(), i;
		}),
		setNote: (t, n) => f(() => e.svc().campaign.setNote(t, n)),
		remove: (t) => f(() => e.svc().campaign.deleteSave(t)),
		restore: (t) => f(() => e.svc().campaign.restoreSave(t)),
		purge: (t) => f(() => e.svc().campaign.purgeSaves(t)),
		autoAsManual: (t) => f(() => e.svc().campaign.saveAutoAsManual(t))
	};
});
// src/ui/kit/choice.ts
function VE(e, t) {
	let n = wE();
	return new Promise((r) => {
		let i = !1, a = {
			key: e.key,
			title: e.title,
			component: e.component,
			props: e.props((e) => {
				i || (i = !0, r(e), n.pop());
			}),
			variant: "confirm",
			onLeave: () => {
				i || (i = !0, r(t));
			}
		};
		n.push(a);
	});
}
// src/ui/kit/ConfirmPage.vue?vue&type=script&setup=true&lang.ts
var HE = { class: "trpg-confirm" }, UE = { class: "trpg-confirm__message" }, WE = {
	key: 0,
	class: "trpg-confirm__details"
}, GE = { class: "trpg-confirm__actions" }, KE = ["data-autofocus"], qE = ["data-autofocus"], JE = /* @__PURE__ */ B({
	__name: "ConfirmPage",
	props: {
		message: {},
		details: {},
		confirmLabel: {},
		cancelLabel: {},
		danger: { type: Boolean },
		onAnswer: { type: Function }
	},
	setup(e) {
		let t = e;
		return (e, n) => (U(), W("div", HE, [
			K("p", UE, F(t.message), 1),
			t.details?.length ? (U(), W("ul", WE, [(U(!0), W(H, null, Ba(t.details, (e) => (U(), W("li", { key: e }, F(e), 1))), 128))])) : J("", !0),
			K("div", GE, [K("button", {
				class: "trpg-btn",
				type: "button",
				"data-autofocus": t.danger ? "" : void 0,
				onClick: n[0] ||= (e) => t.onAnswer(!1)
			}, F(t.cancelLabel ?? "取消"), 9, KE), K("button", {
				class: Ve(["trpg-btn", t.danger ? "trpg-btn--danger" : "trpg-btn--primary"]),
				type: "button",
				"data-autofocus": t.danger ? void 0 : "",
				onClick: n[1] ||= (e) => t.onAnswer(!0)
			}, F(t.confirmLabel), 11, qE)])
		]));
	}
}), YE = 0;
function XE(e) {
	return VE({
		key: `confirm:${++YE}`,
		title: e.title,
		component: An(JE),
		props: (t) => ({
			...e,
			onAnswer: t
		})
	}, !1);
}
// src/ui/kit/Segmented.vue?vue&type=script&setup=true&lang.ts
var ZE = ["aria-label"], QE = [
	"aria-pressed",
	"disabled",
	"title",
	"onClick"
], $E = /* @__PURE__ */ B({
	__name: "Segmented",
	props: /*@__PURE__*/ so({
		options: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = Ao(e, "modelValue");
		return (n, r) => (U(), W("div", {
			class: "trpg-seg",
			role: "group",
			"aria-label": e.label
		}, [(U(!0), W(H, null, Ba(e.options, (e) => (U(), W("button", {
			key: e.value,
			type: "button",
			"aria-pressed": t.value === e.value,
			disabled: e.disabled,
			title: e.disabled ? e.hint : void 0,
			onClick: (n) => t.value = e.value
		}, F(e.label), 9, QE))), 128))], 8, ZE));
	}
}), eD = Uint8Array, tD = Uint16Array, nD = Int32Array, rD = new eD([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	0,
	0,
	0,
	0
]), iD = new eD([
	0,
	0,
	0,
	0,
	1,
	1,
	2,
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	7,
	7,
	8,
	8,
	9,
	9,
	10,
	10,
	11,
	11,
	12,
	12,
	13,
	13,
	0,
	0
]), aD = new eD([
	16,
	17,
	18,
	0,
	8,
	7,
	9,
	6,
	10,
	5,
	11,
	4,
	12,
	3,
	13,
	2,
	14,
	1,
	15
]), oD = function(e, t) {
	for (var n = new tD(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new nD(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, sD = oD(rD, 2), cD = sD.b, lD = sD.r;
cD[28] = 258, lD[258] = 28;
for (var uD = oD(iD, 0), dD = uD.b, fD = uD.r, pD = new tD(32768), mD = 0; mD < 32768; ++mD) {
	var hD = (mD & 43690) >> 1 | (mD & 21845) << 1;
	hD = (hD & 52428) >> 2 | (hD & 13107) << 2, hD = (hD & 61680) >> 4 | (hD & 3855) << 4, pD[mD] = ((hD & 65280) >> 8 | (hD & 255) << 8) >> 1;
}
for (var gD = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new tD(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new tD(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new tD(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[pD[d] >> c] = l;
	} else for (s = new tD(r), i = 0; i < r; ++i) e[i] && (s[i] = pD[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), _D = new eD(288), mD = 0; mD < 144; ++mD) _D[mD] = 8;
for (var mD = 144; mD < 256; ++mD) _D[mD] = 9;
for (var mD = 256; mD < 280; ++mD) _D[mD] = 7;
for (var mD = 280; mD < 288; ++mD) _D[mD] = 8;
for (var vD = new eD(32), mD = 0; mD < 32; ++mD) vD[mD] = 5;
var yD = /*#__PURE__*/ gD(_D, 9, 0), bD = /*#__PURE__*/ gD(_D, 9, 1), xD = /*#__PURE__*/ gD(vD, 5, 0), SD = /*#__PURE__*/ gD(vD, 5, 1), CD = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, wD = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, TD = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, ED = function(e) {
	return (e + 7) / 8 | 0;
}, DD = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new eD(e.subarray(t, n));
}, OD = [
	"unexpected EOF",
	"invalid block type",
	"invalid length/literal",
	"invalid distance",
	"stream finished",
	"no stream handler",
	,
	"no callback",
	"invalid UTF-8 data",
	"extra field too long",
	"date not in range 1980-2099",
	"filename too long",
	"stream finishing",
	"invalid zip data"
], kD = function(e, t, n) {
	var r = Error(t || OD[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, kD), !n) throw r;
	return r;
}, AD = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new eD(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new eD(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new eD(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = wD(e, d, 1);
			var v = wD(e, d + 1, 3);
			if (d += 3, !v) {
				var y = ED(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && kD(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = bD, m = SD, h = 9, g = 5;
			else if (v == 2) {
				var S = wD(e, d, 31) + 257, C = wD(e, d + 10, 15) + 4, w = S + wD(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new eD(w), E = new eD(19), D = 0; D < C; ++D) E[aD[D]] = wD(e, d + D * 3, 7);
				d += C * 3;
				for (var ee = CD(E), O = (1 << ee) - 1, te = gD(E, ee, 1), D = 0; D < w;) {
					var ne = te[wD(e, d, O)];
					d += ne & 15;
					var y = ne >> 4;
					if (y < 16) T[D++] = y;
					else {
						var re = 0, ie = 0;
						for (y == 16 ? (ie = 3 + wD(e, d, 3), d += 2, re = T[D - 1]) : y == 17 ? (ie = 3 + wD(e, d, 7), d += 3) : y == 18 && (ie = 11 + wD(e, d, 127), d += 7); ie--;) T[D++] = re;
					}
				}
				var ae = T.subarray(0, S), oe = T.subarray(S);
				h = CD(ae), g = CD(oe), p = gD(ae, h, 1), m = gD(oe, g, 1);
			} else kD(1);
			if (d > _) {
				c && kD(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var se = (1 << h) - 1, ce = (1 << g) - 1, le = d;; le = d) {
			var re = p[TD(e, d) & se], k = re >> 4;
			if (d += re & 15, d > _) {
				c && kD(0);
				break;
			}
			if (re || kD(2), k < 256) n[f++] = k;
			else if (k == 256) {
				le = d, p = null;
				break;
			} else {
				var ue = k - 254;
				if (k > 264) {
					var D = k - 257, A = rD[D];
					ue = wD(e, d, (1 << A) - 1) + cD[D], d += A;
				}
				var de = m[TD(e, d) & ce], fe = de >> 4;
				de || kD(3), d += de & 15;
				var oe = dD[fe];
				if (fe > 3) {
					var A = iD[fe];
					oe += TD(e, d) & (1 << A) - 1, d += A;
				}
				if (d > _) {
					c && kD(0);
					break;
				}
				s && l(f + 131072);
				var j = f + ue;
				if (f < oe) {
					var pe = a - oe, me = Math.min(oe, j);
					for (pe + f < 0 && kD(3); f < me; ++f) n[f] = r[pe + f];
				}
				for (; f < j; ++f) n[f] = n[f - oe];
			}
		}
		t.l = p, t.p = le, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? DD(n, 0, f) : n.subarray(0, f);
}, jD = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8;
}, MD = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, ND = function(e, t) {
	for (var n = [], r = 0; r < e.length; ++r) e[r] && n.push({
		s: r,
		f: e[r]
	});
	var i = n.length, a = n.slice();
	if (!i) return {
		t: BD,
		l: 0
	};
	if (i == 1) {
		var o = new eD(n[0].s + 1);
		return o[n[0].s] = 1, {
			t: o,
			l: 1
		};
	}
	n.sort(function(e, t) {
		return e.f - t.f;
	}), n.push({
		s: -1,
		f: 25001
	});
	var s = n[0], c = n[1], l = 0, u = 1, d = 2;
	for (n[0] = {
		s: -1,
		f: s.f + c.f,
		l: s,
		r: c
	}; u != i - 1;) s = n[n[l].f < n[d].f ? l++ : d++], c = n[l != u && n[l].f < n[d].f ? l++ : d++], n[u++] = {
		s: -1,
		f: s.f + c.f,
		l: s,
		r: c
	};
	for (var f = a[0].s, r = 1; r < i; ++r) a[r].s > f && (f = a[r].s);
	var p = new tD(f + 1), m = PD(n[u - 1], p, 0);
	if (m > t) {
		var r = 0, h = 0, g = m - t, _ = 1 << g;
		for (a.sort(function(e, t) {
			return p[t.s] - p[e.s] || e.f - t.f;
		}); r < i; ++r) {
			var v = a[r].s;
			if (p[v] > t) h += _ - (1 << m - p[v]), p[v] = t;
			else break;
		}
		for (h >>= g; h > 0;) {
			var y = a[r].s;
			p[y] < t ? h -= 1 << t - p[y]++ - 1 : ++r;
		}
		for (; r >= 0 && h; --r) {
			var b = a[r].s;
			p[b] == t && (--p[b], ++h);
		}
		m = t;
	}
	return {
		t: new eD(p),
		l: m
	};
}, PD = function(e, t, n) {
	return e.s == -1 ? Math.max(PD(e.l, t, n + 1), PD(e.r, t, n + 1)) : t[e.s] = n;
}, FD = function(e) {
	for (var t = e.length; t && !e[--t];);
	for (var n = new tD(++t), r = 0, i = e[0], a = 1, o = function(e) {
		n[r++] = e;
	}, s = 1; s <= t; ++s) if (e[s] == i && s != t) ++a;
	else {
		if (!i && a > 2) {
			for (; a > 138; a -= 138) o(32754);
			a > 2 && (o(a > 10 ? a - 11 << 5 | 28690 : a - 3 << 5 | 12305), a = 0);
		} else if (a > 3) {
			for (o(i), --a; a > 6; a -= 6) o(8304);
			a > 2 && (o(a - 3 << 5 | 8208), a = 0);
		}
		for (; a--;) o(i);
		a = 1, i = e[s];
	}
	return {
		c: n.subarray(0, r),
		n: t
	};
}, ID = function(e, t) {
	for (var n = 0, r = 0; r < t.length; ++r) n += e[r] * t[r];
	return n;
}, LD = function(e, t, n) {
	var r = n.length, i = ED(t + 2);
	e[i] = r & 255, e[i + 1] = r >> 8, e[i + 2] = e[i] ^ 255, e[i + 3] = e[i + 1] ^ 255;
	for (var a = 0; a < r; ++a) e[i + a + 4] = n[a];
	return (i + 4 + r) * 8;
}, RD = function(e, t, n, r, i, a, o, s, c, l, u) {
	jD(t, u++, n), ++i[256];
	for (var d = ND(i, 15), f = d.t, p = d.l, m = ND(a, 15), h = m.t, g = m.l, _ = FD(f), v = _.c, y = _.n, b = FD(h), x = b.c, S = b.n, C = new tD(19), w = 0; w < v.length; ++w) ++C[v[w] & 31];
	for (var w = 0; w < x.length; ++w) ++C[x[w] & 31];
	for (var T = ND(C, 7), E = T.t, D = T.l, ee = 19; ee > 4 && !E[aD[ee - 1]]; --ee);
	var O = l + 5 << 3, te = ID(i, _D) + ID(a, vD) + o, ne = ID(i, f) + ID(a, h) + o + 14 + 3 * ee + ID(C, E) + 2 * C[16] + 3 * C[17] + 7 * C[18];
	if (c >= 0 && O <= te && O <= ne) return LD(t, u, e.subarray(c, c + l));
	var re, ie, ae, oe;
	if (jD(t, u, 1 + (ne < te)), u += 2, ne < te) {
		re = gD(f, p, 0), ie = f, ae = gD(h, g, 0), oe = h;
		var se = gD(E, D, 0);
		jD(t, u, y - 257), jD(t, u + 5, S - 1), jD(t, u + 10, ee - 4), u += 14;
		for (var w = 0; w < ee; ++w) jD(t, u + 3 * w, E[aD[w]]);
		u += 3 * ee;
		for (var ce = [v, x], le = 0; le < 2; ++le) for (var k = ce[le], w = 0; w < k.length; ++w) {
			var ue = k[w] & 31;
			jD(t, u, se[ue]), u += E[ue], ue > 15 && (jD(t, u, k[w] >> 5 & 127), u += k[w] >> 12);
		}
	} else re = yD, ie = _D, ae = xD, oe = vD;
	for (var w = 0; w < s; ++w) {
		var A = r[w];
		if (A > 255) {
			var ue = A >> 18 & 31;
			MD(t, u, re[ue + 257]), u += ie[ue + 257], ue > 7 && (jD(t, u, A >> 23 & 31), u += rD[ue]);
			var de = A & 31;
			MD(t, u, ae[de]), u += oe[de], de > 3 && (MD(t, u, A >> 5 & 8191), u += iD[de]);
		} else MD(t, u, re[A]), u += ie[A];
	}
	return MD(t, u, re[256]), u + ie[256];
}, zD = /*#__PURE__*/ new nD([
	65540,
	131080,
	131088,
	131104,
	262176,
	1048704,
	1048832,
	2114560,
	2117632
]), BD = /*#__PURE__*/ new eD(0), VD = function(e, t, n, r, i, a) {
	var o = a.z || e.length, s = new eD(r + o + 5 * (1 + Math.ceil(o / 7e3)) + i), c = s.subarray(r, s.length - i), l = a.l, u = (a.r || 0) & 7;
	if (t) {
		u && (c[0] = a.r >> 3);
		for (var d = zD[t - 1], f = d >> 13, p = d & 8191, m = (1 << n) - 1, h = a.p || new tD(32768), g = a.h || new tD(m + 1), _ = Math.ceil(n / 3), v = 2 * _, y = function(t) {
			return (e[t] ^ e[t + 1] << _ ^ e[t + 2] << v) & m;
		}, b = new nD(25e3), x = new tD(288), S = new tD(32), C = 0, w = 0, T = a.i || 0, E = 0, D = a.w || 0, ee = 0; T + 2 < o; ++T) {
			var O = y(T), te = T & 32767, ne = g[O];
			if (h[te] = ne, g[O] = te, D <= T) {
				var re = o - T;
				if ((C > 7e3 || E > 24576) && (re > 423 || !l)) {
					u = RD(e, c, 0, b, x, S, w, E, ee, T - ee, u), E = C = w = 0, ee = T;
					for (var ie = 0; ie < 286; ++ie) x[ie] = 0;
					for (var ie = 0; ie < 30; ++ie) S[ie] = 0;
				}
				var ae = 2, oe = 0, se = p, ce = te - ne & 32767;
				if (re > 2 && O == y(T - ce)) for (var le = Math.min(f, re) - 1, k = Math.min(32767, T), ue = Math.min(258, re); ce <= k && --se && te != ne;) {
					if (e[T + ae] == e[T + ae - ce]) {
						for (var A = 0; A < ue && e[T + A] == e[T + A - ce]; ++A);
						if (A > ae) {
							if (ae = A, oe = ce, A > le) break;
							for (var de = Math.min(ce, A - 2), fe = 0, ie = 0; ie < de; ++ie) {
								var j = T - ce + ie & 32767, pe = j - h[j] & 32767;
								pe > fe && (fe = pe, ne = j);
							}
						}
					}
					te = ne, ne = h[te], ce += te - ne & 32767;
				}
				if (oe) {
					b[E++] = 268435456 | lD[ae] << 18 | fD[oe];
					var me = lD[ae] & 31, he = fD[oe] & 31;
					w += rD[me] + iD[he], ++x[257 + me], ++S[he], D = T + ae, ++C;
				} else b[E++] = e[T], ++x[e[T]];
			}
		}
		for (T = Math.max(T, D); T < o; ++T) b[E++] = e[T], ++x[e[T]];
		u = RD(e, c, l, b, x, S, w, E, ee, T - ee, u), l || (a.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, a.h = g, a.p = h, a.i = T, a.w = D);
	} else {
		for (var T = a.w || 0; T < o + l; T += 65535) {
			var ge = T + 65535;
			ge >= o && (c[u / 8 | 0] = l, ge = o), u = LD(c, u + 1, e.subarray(T, ge));
		}
		a.i = o;
	}
	return DD(s, 0, r + ED(u) + i);
}, HD = /*#__PURE__*/ (function() {
	for (var e = /* @__PURE__ */ new Int32Array(256), t = 0; t < 256; ++t) {
		for (var n = t, r = 9; --r;) n = (n & 1 && -306674912) ^ n >>> 1;
		e[t] = n;
	}
	return e;
})(), UD = function() {
	var e = -1;
	return {
		p: function(t) {
			for (var n = e, r = 0; r < t.length; ++r) n = HD[n & 255 ^ t[r]] ^ n >>> 8;
			e = n;
		},
		d: function() {
			return ~e;
		}
	};
}, WD = function(e, t, n, r, i) {
	if (!i && (i = { l: 1 }, t.dictionary)) {
		var a = t.dictionary.subarray(-32768), o = new eD(a.length + e.length);
		o.set(a), o.set(e, a.length), e = o, i.w = a.length;
	}
	return VD(e, t.level == null ? 6 : t.level, t.mem == null ? i.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, i);
}, GD = function(e, t) {
	var n = {};
	for (var r in e) n[r] = e[r];
	for (var r in t) n[r] = t[r];
	return n;
}, KD = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, qD = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, JD = function(e, t) {
	return qD(e, t) + qD(e, t + 4) * 4294967296;
}, YD = function(e, t, n) {
	for (; n; ++t) e[t] = n, n >>>= 8;
};
function XD(e, t) {
	return WD(e, t || {}, 0, 0);
}
function ZD(e, t) {
	return AD(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var QD = function(e, t, n, r) {
	for (var i in e) {
		var a = e[i], o = t + i, s = r;
		Array.isArray(a) && (s = GD(r, a[1]), a = a[0]), ArrayBuffer.isView(a) ? n[o] = [a, s] : (n[o += "/"] = [new eD(0), s], QD(a, o, n, r));
	}
}, $D = typeof TextEncoder < "u" && /*#__PURE__*/ new TextEncoder(), eO = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	eO.decode(BD, { stream: !0 });
} catch {}
var tO = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: DD(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function nO(e, t) {
	if (t) {
		for (var n = new eD(e.length), r = 0; r < e.length; ++r) n[r] = e.charCodeAt(r);
		return n;
	}
	if ($D) return $D.encode(e);
	for (var i = e.length, a = new eD(e.length + (e.length >> 1)), o = 0, s = function(e) {
		a[o++] = e;
	}, r = 0; r < i; ++r) {
		if (o + 5 > a.length) {
			var c = new eD(o + 8 + (i - r << 1));
			c.set(a), a = c;
		}
		var l = e.charCodeAt(r);
		l < 128 || t ? s(l) : l < 2048 ? (s(192 | l >> 6), s(128 | l & 63)) : l > 55295 && l < 57344 ? (l = 65536 + (l & 1047552) | e.charCodeAt(++r) & 1023, s(240 | l >> 18), s(128 | l >> 12 & 63), s(128 | l >> 6 & 63), s(128 | l & 63)) : (s(224 | l >> 12), s(128 | l >> 6 & 63), s(128 | l & 63));
	}
	return DD(a, 0, o);
}
function rO(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	}
	if (eO) return eO.decode(e);
	var i = tO(e), a = i.s, n = i.r;
	return n.length && kD(8), a;
}
var iO = function(e, t) {
	return t + 30 + KD(e, t + 26) + KD(e, t + 28);
}, aO = function(e, t, n) {
	var r = KD(e, t + 28), i = KD(e, t + 30), a = rO(e.subarray(t + 46, t + 46 + r), !(KD(e, t + 8) & 2048)), o = t + 46 + r, s = oO(e, o, i, n, qD(e, t + 20), qD(e, t + 24), qD(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		KD(e, t + 10),
		c,
		l,
		a,
		o + i + KD(e, t + 32),
		u
	];
}, oO = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + KD(e, t + 2)) if (KD(e, t) == 1) return [
			s ? JD(e, t + 4 + 8 * c) : i,
			c ? JD(e, t + 4) : a,
			l ? JD(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && kD(13);
	}
	return [
		i,
		a,
		o,
		0
	];
}, sO = function(e) {
	var t = 0;
	if (e) for (var n in e) {
		var r = e[n].length;
		r > 65535 && kD(9), t += r + 4;
	}
	return t;
}, cO = function(e, t, n, r, i, a, o, s) {
	var c = r.length, l = n.extra, u = s && s.length, d = sO(l);
	YD(e, t, o == null ? 67324752 : 33639248), t += 4, o != null && (e[t++] = 20, e[t++] = n.os), e[t] = 20, t += 2, e[t++] = n.flag << 1 | (a < 0 && 8), e[t++] = i && 8, e[t++] = n.compression & 255, e[t++] = n.compression >> 8;
	var f = new Date(n.mtime == null ? Date.now() : n.mtime), p = f.getFullYear() - 1980;
	if ((p < 0 || p > 119) && kD(10), YD(e, t, p << 25 | f.getMonth() + 1 << 21 | f.getDate() << 16 | f.getHours() << 11 | f.getMinutes() << 5 | f.getSeconds() >> 1), t += 4, a != -1 && (YD(e, t, n.crc), YD(e, t + 4, a < 0 ? -a - 2 : a), YD(e, t + 8, n.size)), YD(e, t + 12, c), YD(e, t + 14, d), t += 16, o != null && (YD(e, t, u), YD(e, t + 6, n.attrs), YD(e, t + 10, o), t += 14), e.set(r, t), t += c, d) for (var m in l) {
		var h = l[m], g = h.length;
		YD(e, t, +m), YD(e, t + 2, g), e.set(h, t + 4), t += 4 + g;
	}
	return u && (e.set(s, t), t += u), t;
}, lO = function(e, t, n, r, i) {
	YD(e, t, 101010256), YD(e, t + 8, n), YD(e, t + 10, n), YD(e, t + 12, r), YD(e, t + 16, i);
};
function uO(e, t) {
	t ||= {};
	var n = {}, r = [];
	QD(e, "", n, t);
	var i = 0, a = 0;
	for (var o in n) {
		var s = n[o], c = s[0], l = s[1], u = l.level == 0 ? 0 : 8, d = nO(o), f = d.length, p = l.comment, m = p && nO(p), h = m && m.length, g = sO(l.extra);
		f > 65535 && kD(11);
		var _ = u ? XD(c, l) : c, v = _.length, y = UD();
		y.p(c), r.push(GD(l, {
			size: c.length,
			crc: y.d(),
			c: _,
			f: d,
			m,
			u: f != o.length || m && p.length != h,
			o: i,
			compression: u
		})), i += 30 + f + g + v, a += 76 + 2 * (f + g) + (h || 0) + v;
	}
	for (var b = new eD(a + 22), x = i, S = a - i, C = 0; C < r.length; ++C) {
		var d = r[C];
		cO(b, d.o, d, d.f, d.u, d.c.length);
		var w = 30 + d.f.length + sO(d.extra);
		b.set(d.c, d.o + w), cO(b, i, d, d.f, d.u, d.c.length, d.o, d.m), i += 16 + w + (d.m ? d.m.length : 0);
	}
	return lO(b, i, r.length, S, x), b;
}
function dO(e, t) {
	for (var n = {}, r = e.length - 22; qD(e, r) != 101010256; --r) (!r || e.length - r > 65558) && kD(13);
	var i = KD(e, r + 8);
	if (!i) return {};
	var a = qD(e, r + 16), o = qD(e, r - 20) == 117853008;
	if (o) {
		var s = qD(e, r - 12);
		o = qD(e, s) == 101075792, o && (i = qD(e, s + 32), a = qD(e, s + 48));
	}
	for (var c = t && t.filter, l = 0; l < i; ++l) {
		var u = aO(e, a, o), d = u[0], f = u[1], p = u[2], m = u[3], h = u[4], g = u[5], _ = iO(e, g);
		a = h, (!c || c({
			name: m,
			size: f,
			originalSize: p,
			compression: d
		})) && (d ? d == 8 ? n[m] = ZD(e.subarray(_, _ + f), { out: new eD(p) }) : kD(14, "unknown compression type " + d) : n[m] = DD(e, _, _ + f));
	}
	return n;
}
var fO = [
	{
		mime: "image/png",
		test: (e) => e.length >= 8 && e[0] === 137 && e[1] === 80 && e[2] === 78 && e[3] === 71
	},
	{
		mime: "image/jpeg",
		test: (e) => e.length >= 3 && e[0] === 255 && e[1] === 216 && e[2] === 255
	},
	{
		mime: "image/gif",
		test: (e) => e.length >= 6 && String.fromCharCode(...e.slice(0, 6)).match(/^GIF8[79]a$/) !== null
	},
	{
		mime: "image/webp",
		test: (e) => e.length >= 12 && String.fromCharCode(...e.slice(0, 4)) === "RIFF" && String.fromCharCode(...e.slice(8, 12)) === "WEBP"
	}
];
function pO(e) {
	return fO.find((t) => t.test(e))?.mime;
}
function mO(e, t) {
	if (t.length > 10485760) throw new $("E_BAD_CONTENT", `文件内容损坏：图片「${e}」过大`);
	let n = pO(t);
	if (!n) throw new $("E_BAD_CONTENT", `文件内容损坏：图片「${e}」不合法`);
	return n;
}
// src/core/files/zip.ts
function hO(e) {
	try {
		return dO(e);
	} catch {
		throw new $("E_NOT_ZIP", "无法识别：这不是 TRPG 跑团助手的文件");
	}
}
function gO(e) {
	let t = {};
	for (let n of Object.keys(e).sort()) {
		let r = e[n];
		t[n] = typeof r == "string" ? nO(r) : r;
	}
	return uO(t, {
		level: 6,
		mtime: new Date(1980, 0, 1, 0, 0, 0)
	});
}
function _O(e, t) {
	let n = e[t];
	if (n) try {
		return JSON.parse(rO(n));
	} catch {
		throw new $("E_BAD_CONTENT", `文件内容损坏：${t} 无法解析`);
	}
}
// src/core/transfer/saveFile.ts
var vO = ny({
	format: dy(["trpg-save", "trpg-backup"]),
	formatVersion: Wv().int().positive(),
	appVersion: Q(),
	exportedAt: Q(),
	ruleIds: ey(Q()),
	dependencies: ey(ny({
		set: Q(),
		prop: Q(),
		hash: Q(),
		rule: Q().optional()
	})).default([]),
	kernelVersions: ey(ny({
		saveId: Q(),
		rule: Q(),
		official: Q(),
		brews: ly(Q(), Q())
	})).default([])
});
function yO(e) {
	return new $("E_BAD_CONTENT", `文件内容损坏：${e}`);
}
function bO(e) {
	return e?.path.map(String).join(".") || "整体";
}
function xO(e, t, n, r) {
	let i = [];
	for (let a of Object.keys(e).filter((e) => e.startsWith(t) && e.endsWith(".json")).sort()) {
		let t = _O(e, a);
		if (!t || typeof t != "object") throw yO(`${a} 不是有效的记录`);
		let o = r.safeParse(RC(n, t));
		if (!o.success) throw yO(`${a} 的 ${bO(o.error.issues[0])} 不合法`);
		i.push(o.data);
	}
	return i;
}
function SO(e) {
	let t = hO(e), n = t["trpg-manifest.json"];
	if (!n) throw new $("E_NO_MANIFEST", "无法识别：缺少说明文件，可能不是本扩展导出的文件");
	let r;
	try {
		r = JSON.parse(rO(n));
	} catch {
		throw yO("说明文件无法解析");
	}
	let i = r;
	if (i.format === "trpg-pack") throw new $("E_UNKNOWN_FORMAT", "这是旧版的扩展包文件（.trpgpack），新版已不再使用；自制内容请用【库】导入作者格式的文件");
	if (i.format !== "trpg-save" && i.format !== "trpg-backup") throw new $("E_UNKNOWN_FORMAT", "无法识别：未知的文件类型");
	if (typeof i.formatVersion != "number" || i.formatVersion > 4) throw new $("E_NEWER_FORMAT", "这个文件由更新版本的扩展创建，请先更新扩展");
	if (i.formatVersion < 3) throw new $("E_OLD_DATA", "这是旧版扩展导出的存档（旧扩展包格式），新版不再读取");
	let a = vO.safeParse(r);
	if (!a.success) throw yO(`说明文件的 ${bO(a.error.issues[0])} 不合法`);
	let o = xO(t, "saves/", "save", Hy), s = xO(t, "workspaces/", "workspace", zy), c, l = _O(t, "settings.json");
	if (l !== void 0) {
		let e = Uy.safeParse(l);
		if (!e.success) throw yO(`settings.json 的 ${bO(e.error.issues[0])} 不合法`);
		c = e.data;
	}
	let u = /* @__PURE__ */ new Map();
	for (let e of Object.keys(t).filter((e) => e.startsWith("blobs/") && !e.endsWith("/"))) {
		let n = e.slice(6);
		if (!/^[a-f0-9]{64}$/.test(n)) throw yO(`图片「${n}」的文件名不是哈希`);
		let r = t[e];
		if (qx(r) !== n) throw yO(`图片「${n.slice(0, 12)}」的哈希不一致`);
		mO(n, r), u.set(n, r);
	}
	let d = {};
	for (let e of Object.keys(t).filter((e) => e.startsWith("library/") && !e.endsWith("/"))) d[e.slice(8)] = rO(t[e]);
	return {
		type: a.data.format === "trpg-backup" ? "backup" : "save",
		manifest: a.data,
		saves: o,
		workspaces: s,
		settings: c,
		blobs: u,
		libraryFiles: d
	};
}
// src/core/transfer/importer.ts
function CO(e, t) {
	return e.saves.map((e) => t(e.ruleId) ? {
		save: e,
		selectable: !0
	} : {
		save: e,
		selectable: !1,
		reason: "规则未安装"
	});
}
function wO(e, t) {
	if (!t.has(e)) return e;
	let n = `${e}（导入）`;
	if (!t.has(n)) return n;
	for (let n = 2;; n++) {
		let r = `${e}（导入 ${n}）`;
		if (!t.has(r)) return r;
	}
}
async function TO(e, t, n) {
	let { db: r, campaign: i } = e, a = e.uuid ?? Qy, o = t.saves.filter((t) => e.hasRule(t.ruleId)), s = new Set(n.selectedIds), c = 0, l = t.manifest.dependencies ?? [], u = t.type === "backup" && e.library && Object.keys(t.libraryFiles).length ? await e.library.importFiles(t.libraryFiles) : null, d = (e.checkRefs ? await e.checkRefs(l) : []).filter((e) => !e.ok).map((e) => ({
		ref: e.ref,
		reason: e.reason ?? "missing"
	})), f = !e.checkRefs;
	return r.transaction("rw", [
		r.saves,
		r.workspaces,
		r.meta,
		r.blobs
	], async () => {
		let p = e.now();
		for (let [e, n] of t.blobs) await r.blobs.get(e) || await r.blobs.put({
			hash: e,
			bytes: n,
			mime: pO(n) ?? "application/octet-stream",
			size: n.length,
			createdAt: p
		});
		if (t.type === "save") {
			for (let t of o.filter((e) => s.has(e.id))) {
				let o = await i.manualNames(n.owner.ownerKey, t.ruleId), s = e.now(), { deletedAt: l, autoReason: u, branchedFrom: d, ...f } = t;
				await r.saves.put({
					...f,
					id: a(),
					ownerKey: n.owner.ownerKey,
					ownerLabel: n.owner.ownerLabel,
					kind: "manual",
					name: wO(t.name, o),
					createdAt: s,
					updatedAt: s
				}), c++;
			}
			return {
				imported: c,
				skipped: t.saves.length - c,
				dependencies: l.length,
				missing: d,
				dependenciesUnchecked: f,
				library: u
			};
		}
		let m = n.mode === "overwrite", h = t.workspaces.filter((t) => e.hasRule(t.ruleId)), g = m ? (await r.workspaces.toArray()).filter((t) => e.hasRule(t.ruleId)) : [];
		if (m) {
			for (let t of (await r.saves.toArray()).filter((t) => e.hasRule(t.ruleId))) await r.saves.delete(t.id);
			for (let e of g) await r.workspaces.delete(e.ownerKey);
			t.settings && await r.setMeta("settings", Uy.parse(t.settings));
		}
		let _ = m ? o : o.filter((e) => s.has(e.id));
		for (let e of _) (m || !await r.saves.get(e.id)) && (await r.saves.put(e), c++);
		for (let e of h) (m || !await r.workspaces.get(e.ownerKey)) && await r.workspaces.put(e);
		for (let e of g) await i.writeAutoSave(e, "恢复备份前");
		let v = new Set(_.filter((e) => e.kind === "auto").map((e) => `${e.ownerKey}\u0000${e.ruleId}`));
		for (let e of v) {
			let [t, n] = e.split("\0");
			await i.pruneAutoSaves(t, n);
		}
		return {
			imported: c,
			skipped: t.saves.length - c,
			dependencies: l.length,
			missing: d,
			dependenciesUnchecked: f,
			library: u
		};
	});
}
// src/ui/kit/Checkbox.vue?vue&type=script&setup=true&lang.ts
var EO = ["data-disabled"], DO = [
	"disabled",
	"indeterminate",
	"aria-label"
], OO = { class: "trpg-check__text" }, kO = /* @__PURE__ */ B({
	__name: "Checkbox",
	props: /*@__PURE__*/ so({
		disabled: { type: Boolean },
		indeterminate: { type: Boolean },
		label: {}
	}, {
		modelValue: {
			type: Boolean,
			default: !1
		},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = Ao(e, "modelValue");
		return (n, r) => (U(), W("label", {
			class: "trpg-check",
			"data-disabled": e.disabled
		}, [Hr(K("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			type: "checkbox",
			disabled: e.disabled,
			indeterminate: e.indeterminate,
			"aria-label": e.label
		}, null, 8, DO), [[wu, t.value]]), K("span", OO, [V(n.$slots, "default")])], 8, EO));
	}
}), AO = {
	class: "page-stack",
	"data-testid": "import-save"
}, jO = { class: "trpg-import__ok" }, MO = {
	key: 0,
	class: "trpg-field"
}, NO = { class: "trpg-field__hint" }, PO = { class: "trpg-list" }, FO = { class: "trpg-row__title" }, IO = { class: "trpg-row__meta" }, LO = { class: "trpg-field__hint" }, RO = { class: "trpg-confirm__actions" }, zO = ["disabled"], BO = /* @__PURE__ */ B({
	__name: "SavePreview",
	props: { rec: {} },
	setup(e) {
		let t = e, n = Hw(), r = Ww(), i = wE(), a = BE(), o = yT(), s = Y(() => CO(t.rec, (e) => n.svc().rules.has(e))), c = /* @__PURE__ */ L(s.value.filter((e) => e.selectable).map((e) => e.save.id)), l = /* @__PURE__ */ L("merge"), u = /* @__PURE__ */ L(!1), d = Y(() => t.rec.type === "backup"), f = (e) => n.svc().rules.get(e)?.nameShort ?? e, p = Y(() => d.value && l.value === "overwrite" ? s.value.filter((e) => e.selectable).length : c.value.length), m = Y(() => d.value ? `完整备份 · ${t.rec.saves.length} 个存档` : `存档文件 · ${t.rec.saves.length} 个存档`);
		function h(e, t) {
			c.value = t ? [...c.value, e] : c.value.filter((t) => t !== e);
		}
		async function g() {
			let e = r.owner;
			if (!e) o.error("请先在酒馆中打开一个聊天");
			else if (!d.value || l.value !== "overwrite" || await XE({
				title: "覆盖并恢复",
				message: "先写入自动存档，再用备份替换全部存档、当前数据与设置。",
				confirmLabel: "覆盖并恢复",
				danger: !0
			})) {
				u.value = !0;
				try {
					let s = n.svc(), u = await TO({
						db: s.db,
						campaign: s.campaign,
						now: s.now,
						hasRule: (e) => s.rules.has(e)
					}, t.rec, {
						owner: e,
						selectedIds: c.value,
						mode: d.value ? l.value : void 0
					});
					await r.switchOwner(e), await a.refresh(), o.success(`已导入 ${u.imported} 个存档`), i.close(!0);
				} catch (e) {
					console.error("[trpg-assistant] 导入存档失败", e), o.error(`导入失败：${zE(e)}`);
				} finally {
					u.value = !1;
				}
			}
		}
		return (e, t) => (U(), W("div", AO, [
			K("p", jO, "✓ 已识别：" + F(m.value), 1),
			d.value ? (U(), W("div", MO, [q($E, {
				modelValue: l.value,
				"onUpdate:modelValue": t[0] ||= (e) => l.value = e,
				label: "恢复方式",
				options: [{
					value: "merge",
					label: "合并"
				}, {
					value: "overwrite",
					label: "覆盖"
				}]
			}, null, 8, ["modelValue"]), K("span", NO, F(l.value === "merge" ? "只添加尚不存在的存档与当前数据。" : "先写自动存档，再用备份替换全部存档、当前数据与设置。"), 1)])) : J("", !0),
			K("ul", PO, [(U(!0), W(H, null, Ba(s.value, (e) => (U(), W("li", {
				key: e.save.id,
				class: "trpg-row"
			}, [q(kO, {
				"model-value": c.value.includes(e.save.id),
				disabled: !e.selectable || d.value && l.value === "overwrite",
				"onUpdate:modelValue": (t) => h(e.save.id, t)
			}, {
				default: z(() => [K("span", FO, F(e.save.name), 1)]),
				_: 2
			}, 1032, [
				"model-value",
				"disabled",
				"onUpdate:modelValue"
			]), K("span", IO, [Xs(F(f(e.save.ruleId)) + " · " + F(R(FE)(e.save.updatedAt)), 1), e.reason ? (U(), W(H, { key: 0 }, [Xs(" · " + F(e.reason) + "（不可选）", 1)], 64)) : J("", !0)])]))), 128))]),
			K("p", LO, "导入为「" + F(R(r).owner?.ownerLabel ?? "当前角色卡") + "」的存档；重名时名称后加\"（导入）\"。", 1),
			K("div", RO, [K("button", {
				class: "trpg-btn",
				type: "button",
				onClick: t[1] ||= (e) => R(i).close(!0)
			}, "取消"), K("button", {
				class: Ve(["trpg-btn", d.value && l.value === "overwrite" ? "trpg-btn--danger" : "trpg-btn--primary"]),
				type: "button",
				disabled: u.value || p.value === 0,
				onClick: g
			}, F(d.value && l.value === "overwrite" ? "覆盖并恢复" : `导入 ${p.value} 个`), 11, zO)])
		]));
	}
}), VO = { class: "page-stack" }, HO = {
	class: "trpg-row__meta",
	"data-testid": "import-filename"
}, UO = {
	key: 0,
	class: "page-stack",
	role: "alert"
}, WO = { class: "trpg-field__error" }, GO = { class: "trpg-confirm__actions" }, KO = {
	key: 1,
	class: "page-intro",
	role: "status"
}, qO = /* @__PURE__ */ B({
	__name: "ImportPage",
	props: { file: {} },
	setup(e) {
		let t = e, n = wE(), r = /* @__PURE__ */ Pn(null), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(null);
		Ca(async () => {
			try {
				r.value = SO(new Uint8Array(await t.file.arrayBuffer()));
			} catch (e) {
				e instanceof $ || console.error("[trpg-assistant] 识别文件失败", e), i.value = zE(e);
			}
		});
		function o(e) {
			let t = e.target, n = t.files?.[0];
			t.value = "", n && JO(n);
		}
		return (e, s) => (U(), W("div", VO, [K("p", HO, F(t.file.name), 1), i.value ? (U(), W("div", UO, [K("p", WO, "⚠ " + F(i.value), 1), K("div", GO, [
			K("button", {
				class: "trpg-btn",
				type: "button",
				onClick: s[0] ||= (e) => a.value?.click()
			}, "选择其他文件"),
			K("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				onClick: s[1] ||= (e) => R(n).close(!0)
			}, "关闭"),
			K("input", {
				ref_key: "picker",
				ref: a,
				class: "trpg-sr-only",
				type: "file",
				accept: ".trpgsave,.zip",
				tabindex: "-1",
				"aria-hidden": "true",
				onChange: o
			}, null, 544)
		])])) : r.value ? (U(), G(BO, {
			key: 2,
			rec: r.value
		}, null, 8, ["rec"])) : (U(), W("p", KO, "正在识别…"))]));
	}
});
// src/ui/imports/openImport.ts
function JO(e) {
	wE().open({
		key: "import",
		title: "导入文件",
		component: An(qO),
		props: { file: e },
		variant: "dialog"
	});
}
// src/core/files/assets.ts
function YO(e, t = /* @__PURE__ */ new Set()) {
	if (Array.isArray(e)) for (let n of e) YO(n, t);
	else if (e && typeof e == "object") {
		let n = e;
		typeof n.$asset == "string" && t.add(n.$asset);
		for (let e of Object.values(n)) YO(e, t);
	}
	return t;
}
// src/core/transfer/exporter.ts
function XO(e) {
	let t = new Date(e);
	return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function ZO(e) {
	return e.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "") || "存档";
}
function QO(e, t) {
	let n = /* @__PURE__ */ new Map(), r = (e, t) => {
		let r = `${e.set}|${e.prop}|${e.hash}`;
		n.has(r) || n.set(r, {
			...e,
			rule: t
		});
	}, i = (e) => {
		if (!e || typeof e != "object") return;
		let t = e;
		for (let e of t.actors ?? []) for (let n of e.refs ?? []) r(n, t.rule);
		for (let e of t.overrides ?? []) r(e.target, t.rule), r(e.house, t.rule);
	};
	for (let t of e) i(t.snapshot.kernel);
	for (let e of t) i(e.data.kernel);
	return [...n.values()].sort((e, t) => `${e.set}|${e.prop}|${e.hash}`.localeCompare(`${t.set}|${t.prop}|${t.hash}`));
}
function $O(e) {
	return e.flatMap((e) => {
		let t = e.snapshot.kernel;
		return t ? [{
			saveId: e.id,
			rule: t.rule,
			official: t.dataVersion?.official ?? "",
			brews: t.dataVersion?.brews ?? {}
		}] : [];
	});
}
async function ek(e, t) {
	if (t.type === "save") {
		let n = await e.saves.get(t.saveId);
		if (!n || n.deletedAt !== void 0) throw new $("E_NOT_FOUND", "没有找到这个存档");
		return [n];
	}
	return (await e.saves.toArray()).filter((e) => e.deletedAt === void 0);
}
async function tk(e, t) {
	let n = (await ek(e.db, t)).reduce((e, t) => e + JSON.stringify(t).length, 0), r = 0;
	if (t.type === "backup" && e.library) {
		let t = await e.library.exportFiles();
		r = Object.values(t).reduce((e, t) => e + t.length, 0);
	}
	return {
		saveBytes: n,
		libraryBytes: r,
		totalBytes: n + r
	};
}
async function nk(e, t) {
	let n = await ek(e.db, t), r = {};
	for (let e of n) r[`saves/${e.id}.json`] = JSON.stringify(e);
	let i = [];
	if (t.type === "backup") {
		i = await e.db.workspaces.toArray();
		for (let e of i) r[`workspaces/${encodeURIComponent(e.ownerKey)}.json`] = JSON.stringify(e);
		if (r["settings.json"] = JSON.stringify(await Yy(e.db)), e.library) {
			let t = await e.library.exportFiles();
			for (let [e, n] of Object.entries(t)) r[`library/${e}`] = n;
		}
	}
	let a = YO([n, i]);
	for (let t of [...a].sort()) {
		let n = await e.db.blobs.get(t);
		n && (r[`blobs/${t}`] = n.bytes);
	}
	r["trpg-manifest.json"] = JSON.stringify({
		format: t.type === "backup" ? "trpg-backup" : "trpg-save",
		formatVersion: 4,
		appVersion: e.appVersion,
		exportedAt: new Date(e.now()).toISOString(),
		ruleIds: [...new Set(n.map((e) => e.ruleId))],
		dependencies: QO(n, i),
		kernelVersions: $O(n)
	});
	let o = XO(e.now()), s = t.type === "backup" ? `TRPG备份_${o}.trpgsave` : `${ZO(n[0].name)}_${o}.trpgsave`;
	return {
		bytes: gO(r),
		filename: s
	};
}
// src/ui/download.ts
function rk(e, t) {
	let n = new Blob([e], { type: "application/octet-stream" }), r = URL.createObjectURL(n), i = document.createElement("a");
	i.href = r, i.download = t, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e4);
}
// src/ui/saves/ExportPage.vue?vue&type=script&setup=true&lang.ts
var ik = { class: "page-stack" }, ak = { class: "trpg-field" }, ok = { class: "trpg-field__hint" }, sk = { class: "trpg-confirm__actions" }, ck = ["disabled"], lk = /* @__PURE__ */ B({
	__name: "ExportPage",
	props: { saveId: {} },
	setup(e) {
		let t = e, n = Hw(), r = Ww(), i = wE(), a = yT(), o = /* @__PURE__ */ L(t.saveId ?? r.currentSave?.id ?? ""), s = /* @__PURE__ */ L(t.saveId || r.currentSave ? "save" : "backup"), c = /* @__PURE__ */ L("存档"), l = /* @__PURE__ */ L(null), u = /* @__PURE__ */ L(!1), d = Y(() => s.value === "backup" ? { type: "backup" } : {
			type: "save",
			saveId: o.value
		}), f = () => ({
			db: n.svc().db,
			now: n.svc().now,
			appVersion: cw
		}), p = Y(() => LE(l.value?.saveBytes ?? 0)), m = Y(() => new Date(n.svc().now()).toISOString().slice(0, 10)), h = Y(() => s.value === "backup" ? `TRPG备份_${m.value}.trpgsave` : `${c.value.replace(/\s+/g, "_")}_${m.value}.trpgsave`);
		async function g() {
			try {
				s.value === "save" && (c.value = (await n.svc().campaign.getSave(o.value))?.name ?? "存档"), l.value = await tk(f(), d.value);
			} catch (e) {
				console.error("[trpg-assistant] 估算导出大小失败", e), l.value = null;
			}
		}
		Ca(g), Qr(s, g);
		async function _() {
			u.value = !0;
			try {
				let { bytes: e, filename: t } = await nk(f(), d.value);
				rk(e, t), s.value === "backup" && (await Xy(n.svc().db, n.svc().now()), await n.refreshBackup()), a.success(`已导出「${t}」`), i.close(!0);
			} catch (e) {
				console.error("[trpg-assistant] 导出失败", e), a.error(`导出失败：${zE(e)}`);
			} finally {
				u.value = !1;
			}
		}
		return (e, t) => (U(), W("div", ik, [
			K("div", ak, [t[2] ||= K("span", { class: "trpg-field__label" }, "范围", -1), q($E, {
				modelValue: s.value,
				"onUpdate:modelValue": t[0] ||= (e) => s.value = e,
				label: "导出范围",
				options: [{
					value: "save",
					label: c.value
				}, {
					value: "backup",
					label: "全部（完整备份）"
				}]
			}, null, 8, ["modelValue", "options"])]),
			K("p", ok, "文件名 " + F(h.value) + " · 约 " + F(p.value), 1),
			K("div", sk, [K("button", {
				class: "trpg-btn",
				type: "button",
				onClick: t[1] ||= (e) => R(i).close(!0)
			}, "取消"), K("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: u.value || s.value === "save" && !o.value,
				onClick: _
			}, F(u.value ? "打包中…" : "导出"), 9, ck)])
		]));
	}
});
// src/ui/saves/fileActions.ts
function uk(e) {
	wE().open({
		key: "export",
		title: "导出",
		component: An(lk),
		props: { saveId: e },
		variant: "dialog"
	});
}
async function dk(e) {
	JO(e);
}
// node_modules/ohash/dist/_chunks/is-equal.mjs
function fk(e) {
	return typeof e == "string" ? `'${e}'` : new gk().serialize(e);
}
var pk = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz", mk = /*@__PURE__*/ (function() {
	let e = /* @__PURE__ */ new Uint8Array(128);
	for (let t = 0; t < 69; t++) e[pk.charCodeAt(t)] = t + 1;
	for (let t = 65; t <= 90; t++) e[t] = e[t + 32];
	return e;
})();
function hk(e, t) {
	if (e === t) return 0;
	let n = Math.min(e.length, t.length), r = 0;
	for (let i = 0; i < n; i++) {
		let n = e.charCodeAt(i), a = t.charCodeAt(i);
		if (n === a) continue;
		let o = n < 128 && mk[n] ? mk[n] : n + 128, s = a < 128 && mk[a] ? mk[a] : a + 128;
		if (o !== s) return o < s ? -1 : 1;
		r === 0 && (r = n > a ? -1 : 1);
	}
	return e.length === t.length ? r : e.length < t.length ? -1 : 1;
}
var gk = /*@__PURE__*/ (function() {
	class e {
		#e = /* @__PURE__ */ new Map();
		compare(e, t) {
			let n = typeof e, r = typeof t;
			return n === "string" && r === "string" ? hk(e, t) : n === "number" && r === "number" ? e - t : hk(this.serialize(e, !0), this.serialize(t, !0));
		}
		serialize(e, t) {
			if (e === null) return "null";
			switch (typeof e) {
				case "string": return t ? e : `'${e}'`;
				case "bigint": return `${e}n`;
				case "object": return this.$object(e);
				case "function": return this.$function(e);
			}
			return String(e);
		}
		serializeObject(e) {
			let t = Object.prototype.toString.call(e);
			if (t !== "[object Object]") return this.serializeBuiltInType(t.length < 10 ? `unknown:${t}` : t.slice(8, -1), e);
			let n = e.constructor, r = n === Object || n === void 0 ? "" : n.name;
			if (r !== "" && globalThis[r] === n) return this.serializeBuiltInType(r, e);
			if ("toJSON" in e && typeof e.toJSON == "function") {
				let t = e.toJSON();
				return r + (typeof t == "object" && t ? this.$object(t) : `(${this.serialize(t)})`);
			}
			let i = Object.keys(e).sort(hk), a = `${r}{`;
			for (let t = 0; t < i.length; t++) {
				let n = i[t];
				a += `${n}:${this.serialize(e[n])}`, t < i.length - 1 && (a += ",");
			}
			return a + "}";
		}
		serializeBuiltInType(e, t) {
			let n = this["$" + e];
			if (n) return n.call(this, t);
			if (typeof t.entries == "function") return this.serializeObjectEntries(e, t.entries());
			throw Error(`Cannot serialize ${e}`);
		}
		serializeObjectEntries(e, t) {
			let n = Array.from(t).sort((e, t) => this.compare(e[0], t[0])), r = `${e}{`;
			for (let e = 0; e < n.length; e++) {
				let [t, i] = n[e];
				r += `${this.serialize(t, !0)}:${this.serialize(i)}`, e < n.length - 1 && (r += ",");
			}
			return r + "}";
		}
		$object(e) {
			let t = this.#e.get(e);
			return t === void 0 && (this.#e.set(e, `#${this.#e.size}`), t = this.serializeObject(e), this.#e.set(e, t)), t;
		}
		$function(e) {
			let t = Function.prototype.toString.call(e);
			return t.slice(-15) === "[native code] }" ? `${e.name || ""}()[native]` : `${e.name}(${e.length})${t.replace(/\s*\n\s*/g, "")}`;
		}
		$Array(e) {
			let t = "[";
			for (let n = 0; n < e.length; n++) t += this.serialize(e[n]), n < e.length - 1 && (t += ",");
			return t + "]";
		}
		$Date(e) {
			try {
				return `Date(${e.toISOString()})`;
			} catch {
				return "Date(null)";
			}
		}
		$ArrayBuffer(e) {
			return `ArrayBuffer[${new Uint8Array(e).join(",")}]`;
		}
		$Set(e) {
			return `Set${this.$Array(Array.from(e).sort((e, t) => this.compare(e, t)))}`;
		}
		$Map(e) {
			return this.serializeObjectEntries("Map", e.entries());
		}
	}
	for (let t of [
		"Error",
		"RegExp",
		"URL"
	]) e.prototype["$" + t] = function(e) {
		return `${t}(${e})`;
	};
	for (let t of [
		"Int8Array",
		"Uint8Array",
		"Uint8ClampedArray",
		"Int16Array",
		"Uint16Array",
		"Int32Array",
		"Uint32Array",
		"Float32Array",
		"Float64Array"
	]) e.prototype["$" + t] = function(e) {
		return `${t}[${e.join(",")}]`;
	};
	for (let t of ["BigInt64Array", "BigUint64Array"]) e.prototype["$" + t] = function(e) {
		return `${t}[${e.join("n,")}${e.length > 0 ? "n" : ""}]`;
	};
	return e;
})();
function _k(e, t) {
	return e === t || fk(e) === fk(t);
}
// node_modules/reka-ui/dist/shared/arrays.js
function vk(e, t, n) {
	let r = e.findIndex((e) => _k(e, t)), i = e.findIndex((e) => _k(e, n));
	if (r === -1 || i === -1) return [];
	let [a, o] = [r, i].sort((e, t) => e - t);
	return e.slice(a, o + 1);
}
// node_modules/reka-ui/dist/shared/clamp.js
function yk(e, t = -Infinity, n = Infinity) {
	return Math.min(n, Math.max(t, e));
}
// node_modules/reka-ui/dist/shared/createContext.js
function bk(e, t) {
	let n = typeof e == "string" && !t ? `${e}Context` : t, r = Symbol(n);
	return [(t) => {
		let n = Gr(r, t);
		if (n || n === null) return n;
		throw Error(`Injection \`${r.toString()}\` not found. Component must be used within ${Array.isArray(e) ? `one of the following components: ${e.join(", ")}` : `\`${e}\``}`);
	}, (e) => (Wr(r, e), e)];
}
// node_modules/reka-ui/dist/shared/getActiveElement.js
function xk() {
	let e = document.activeElement;
	if (e == null) return null;
	for (; e != null && e.shadowRoot != null && e.shadowRoot.activeElement != null;) e = e.shadowRoot.activeElement;
	return e;
}
// node_modules/reka-ui/dist/shared/handleAndDispatchCustomEvent.js
function Sk(e, t, n) {
	let r = n.originalEvent.target, i = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && r.addEventListener(e, t, { once: !0 }), r.dispatchEvent(i);
}
// node_modules/reka-ui/dist/shared/nullish.js
function Ck(e) {
	return e == null;
}
// node_modules/@vueuse/shared/dist/index.js
function wk(e, t) {
	return nt() ? (rt(e, t), !0) : !1;
}
function Tk() {
	let e = /* @__PURE__ */ new Set(), t = (t) => {
		e.delete(t);
	};
	return {
		on: (n) => {
			e.add(n);
			let r = () => t(n);
			return wk(r), { off: r };
		},
		off: t,
		trigger: (...t) => Promise.all(Array.from(e).map((e) => e(...t))),
		clear: () => {
			e.clear();
		}
	};
}
function Ek(e) {
	let t = !1, n, r = tt(!0);
	return ((...i) => (t ||= (n = r.run(() => e(...i)), !0), n));
}
var Dk = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
var Ok = (e) => e !== void 0, kk = Object.prototype.toString, Ak = (e) => kk.call(e) === "[object Object]", jk = /* #__PURE__ */ Mk();
function Mk() {
	var e, t;
	return Dk && !!((e = window) != null && (e = e.navigator) != null && e.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((t = window) == null || (t = t.navigator) == null ? void 0 : t.maxTouchPoints) > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function Nk(e) {
	return Array.isArray(e) ? e : [e];
}
function Pk(e) {
	return e || cc();
}
function Fk(e) {
	if (!Dk) return e;
	let t = 0, n, r, i = () => {
		--t, r && t <= 0 && (r.stop(), n = void 0, r = void 0);
	};
	return ((...a) => (t += 1, r || (r = tt(!0), n = r.run(() => e(...a))), wk(i), n));
}
function Ik(e) {
	return /* @__PURE__ */ bn(/* @__PURE__ */ Nn(e) ? new Proxy({}, {
		get(t, n, r) {
			return R(Reflect.get(e.value, n, r));
		},
		set(t, n, r) {
			return /* @__PURE__ */ Nn(e.value[n]) && !/* @__PURE__ */ Nn(r) ? e.value[n].value = r : e.value[n] = r, !0;
		},
		deleteProperty(t, n) {
			return Reflect.deleteProperty(e.value, n);
		},
		has(t, n) {
			return Reflect.has(e.value, n);
		},
		ownKeys() {
			return Object.keys(e.value);
		},
		getOwnPropertyDescriptor() {
			return {
				enumerable: !0,
				configurable: !0
			};
		}
	}) : e);
}
function Lk(e) {
	return Ik(Y(e));
}
function Rk(e, ...t) {
	let n = t.flat(), r = n[0];
	return Lk(() => Object.fromEntries(typeof r == "function" ? Object.entries(/* @__PURE__ */ Un(e)).filter(([e, t]) => !r(Rn(t), e)) : Object.entries(/* @__PURE__ */ Un(e)).filter((e) => !n.includes(e[0]))));
}
function zk(e, t = 1e4) {
	return Hn((n, r) => {
		let i = Rn(e), a, o = () => setTimeout(() => {
			i = Rn(e), r();
		}, Rn(t));
		return wk(() => {
			clearTimeout(a);
		}), {
			get() {
				return n(), i;
			},
			set(e) {
				i = e, r(), clearTimeout(a), a = o();
			}
		};
	});
}
function Bk(e, t) {
	Pk(t) && Ea(e, t);
}
function Vk(e, t, n) {
	return Qr(e, t, {
		...n,
		immediate: !0
	});
}
// node_modules/@vueuse/core/dist/index.js
var Hk = Dk ? window : void 0;
Dk && window.document, Dk && window.navigator, Dk && window.location;
function Uk(e) {
	let t = Rn(e);
	return t?.$el ?? t;
}
function Wk(...e) {
	let t = (e, t, n, r) => (e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r)), n = Y(() => {
		let t = Nk(Rn(e[0])).filter((e) => e != null);
		return t.every((e) => typeof e != "string") ? t : void 0;
	});
	return Vk(() => [
		n.value?.map((e) => Uk(e)) ?? [Hk].filter((e) => e != null),
		Nk(Rn(n.value ? e[1] : e[0])),
		Nk(R(n.value ? e[2] : e[1])),
		Rn(n.value ? e[3] : e[2])
	], ([e, n, r, i], a, o) => {
		if (!e?.length || !n?.length || !r?.length) return;
		let s = Ak(i) ? { ...i } : i, c = e.flatMap((e) => n.flatMap((n) => r.map((r) => t(e, n, r, s))));
		o(() => {
			c.forEach((e) => e());
		});
	}, { flush: "post" });
}
function Gk() {
	let e = /* @__PURE__ */ Pn(!1), t = cc();
	return t && Ca(() => {
		e.value = !0;
	}, t), e;
}
/* @__NO_SIDE_EFFECTS__ */
function Kk(e) {
	let t = Gk();
	return Y(() => (t.value, !!e()));
}
function qk(e) {
	return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function Jk(...e) {
	let t, n, r = {};
	e.length === 3 ? (t = e[0], n = e[1], r = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], r = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
	let { target: i = Hk, eventName: a = "keydown", passive: o = !1, dedupe: s = !1 } = r, c = qk(t);
	return Wk(i, a, (e) => {
		e.repeat && Rn(s) || c(e) && n(e);
	}, o);
}
function Yk(e) {
	return JSON.parse(JSON.stringify(e));
}
function Xk(e, t, n = {}) {
	let { window: r = Hk, ...i } = n, a, o = /* @__PURE__ */ Kk(() => r && "ResizeObserver" in r), s = () => {
		a &&= (a.disconnect(), void 0);
	}, c = Qr(Y(() => {
		let t = Rn(e);
		return Array.isArray(t) ? t.map((e) => Uk(e)) : [Uk(t)];
	}), (e) => {
		if (s(), o.value && r) {
			a = new ResizeObserver(t);
			for (let t of e) t && a.observe(t, i);
		}
	}, {
		immediate: !0,
		flush: "post"
	}), l = () => {
		s(), c();
	};
	return wk(l), {
		isSupported: o,
		stop: l
	};
}
function Zk(e, t, n, r = {}) {
	var i, a;
	let { clone: o = !1, passive: s = !1, eventName: c, deep: l = !1, defaultValue: u, shouldEmit: d } = r, f = cc(), p = n || f?.emit || (f == null || (i = f.$emit) == null ? void 0 : i.bind(f)) || (f == null || (a = f.proxy) == null || (a = a.$emit) == null ? void 0 : a.bind(f?.proxy)), m = c;
	t ||= "modelValue", m ||= `update:${t.toString()}`;
	let h = (e) => o ? typeof o == "function" ? o(e) : Yk(e) : e, g = () => Ok(e[t]) ? h(e[t]) : u, _ = (e) => {
		d ? d(e) && p(m, e) : p(m, e);
	};
	if (s) {
		let n = /* @__PURE__ */ L(g()), r = !1;
		return Qr(() => e[t], (e) => {
			r || (r = !0, n.value = h(e), Sr(() => r = !1));
		}), Qr(n, (n) => {
			!r && (n !== e[t] || l) && _(n);
		}, { deep: l }), n;
	}
	return Y({
		get() {
			return g();
		},
		set(e) {
			_(e);
		}
	});
}
// node_modules/reka-ui/dist/shared/renderSlotFragments.js
function Qk(e) {
	return e ? e.flatMap((e) => e.type === H ? Qk(e.children) : [e]) : [];
}
// node_modules/reka-ui/dist/shared/useArrowNavigation.js
var $k = ["INPUT", "TEXTAREA"];
function eA(e, t, n, r = {}) {
	if (!t || r.enableIgnoredElement && $k.includes(t.nodeName)) return null;
	let { arrowKeyOptions: i = "both", attributeName: a = "[data-reka-collection-item]", itemsArray: o = [], loop: s = !0, dir: c = "ltr", preventScroll: l = !0, focus: u = !1 } = r, [d, f, p, m, h, g] = [
		e.key === "ArrowRight",
		e.key === "ArrowLeft",
		e.key === "ArrowUp",
		e.key === "ArrowDown",
		e.key === "Home",
		e.key === "End"
	], _ = p || m, v = d || f;
	if (!h && !g && (!_ && !v || i === "vertical" && v || i === "horizontal" && _)) return null;
	let y = n ? Array.from(n.querySelectorAll(a)) : o;
	if (!y.length) return null;
	l && e.preventDefault();
	let b = null;
	return v || _ ? b = tA(y, t, {
		goForward: _ ? m : c === "ltr" ? d : f,
		loop: s
	}) : h ? b = y.at(0) || null : g && (b = y.at(-1) || null), u && b?.focus(), b;
}
function tA(e, t, n, r = e.includes(t) ? e.length : e.length + 1) {
	if (--r === 0) return null;
	let i = e.indexOf(t), a;
	if (a = i === -1 ? n.goForward ? 0 : e.length - 1 : n.goForward ? i + 1 : i - 1, !n.loop && (a < 0 || a >= e.length)) return null;
	let o = e[(a + e.length) % e.length];
	return o ? o.hasAttribute("disabled") && o.getAttribute("disabled") !== "false" ? tA(e, o, n, r) : o : null;
}
// node_modules/reka-ui/dist/ConfigProvider/ConfigProvider.js
var [nA, rA] = /*#__PURE__*/ bk("ConfigProvider"), iA = /* @__PURE__ */ new WeakMap();
function aA(e, t) {
	let n = iA.get(e);
	n || (n = {
		owners: /* @__PURE__ */ new Set(),
		original: e.body.style.pointerEvents
	}, iA.set(e, n)), n.owners.add(t), e.body.style.pointerEvents = "none";
}
function oA(e, t) {
	let n = iA.get(e);
	n?.owners.delete(t) && n.owners.size === 0 && (iA.delete(e), e.body.style.pointerEvents = n.original);
}
// node_modules/defu/dist/defu.mjs
function sA(e) {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null || Symbol.iterator in e ? !1 : Symbol.toStringTag in e ? Object.prototype.toString.call(e) === "[object Module]" : !0;
}
function cA(e, t, n = ".", r) {
	if (!sA(t)) return cA(e, {}, n, r);
	let i = { ...t };
	for (let t of Object.keys(e)) {
		if (t === "__proto__" || t === "constructor") continue;
		let a = e[t];
		a != null && (r && r(i, t, a, n) || (i[t] = Array.isArray(a) && Array.isArray(i[t]) ? [...a, ...i[t]] : sA(a) && sA(i[t]) ? cA(a, i[t], (n ? `${n}.` : "") + t.toString(), r) : a));
	}
	return i;
}
function lA(e) {
	return (...t) => t.reduce((t, n) => cA(t, n, "", e), {});
}
var uA = lA(), dA = Symbol("useBodyScrollLock"), fA = Fk(() => {
	let e = /* @__PURE__ */ L(/* @__PURE__ */ new Map()), t = /* @__PURE__ */ L(), n = Y(() => {
		for (let t of e.value.values()) if (t) return !0;
		return !1;
	}), r = nA({ scrollBody: /* @__PURE__ */ L(!0) }), i = null, a = () => {
		document.body.style.paddingRight = "", document.body.style.marginRight = "", oA(document, dA), document.documentElement.style.removeProperty("--scrollbar-width"), document.body.style.overflow = t.value ?? "", jk && i?.(), t.value = void 0;
	};
	return Qr(n, (e, o) => {
		if (!Dk) return;
		if (!e) {
			o && a();
			return;
		}
		t.value === void 0 && (t.value = document.body.style.overflow);
		let s = window.innerWidth - document.documentElement.clientWidth, c = {
			padding: s,
			margin: 0
		}, l = r.scrollBody?.value ? typeof r.scrollBody.value == "object" ? uA({
			padding: r.scrollBody.value.padding === !0 ? s : r.scrollBody.value.padding,
			margin: r.scrollBody.value.margin === !0 ? s : r.scrollBody.value.margin
		}, c) : c : {
			padding: 0,
			margin: 0
		};
		s > 0 && (document.body.style.paddingRight = typeof l.padding == "number" ? `${l.padding}px` : String(l.padding), document.body.style.marginRight = typeof l.margin == "number" ? `${l.margin}px` : String(l.margin), document.documentElement.style.setProperty("--scrollbar-width", `${s}px`), document.body.style.overflow = "hidden"), jk && (i = Wk(document, "touchmove", (e) => hA(e), { passive: !1 })), Sr(() => {
			n.value && (aA(document, dA), document.body.style.overflow = "hidden");
		});
	}, {
		immediate: !0,
		flush: "sync"
	}), e;
});
function pA(e) {
	let t = Math.random().toString(36).substring(2, 7), n = fA();
	n.value.set(t, e ?? !1);
	let r = Y({
		get: () => n.value.get(t) ?? !1,
		set: (e) => n.value.set(t, e)
	});
	return Bk(() => {
		n.value.delete(t);
	}), r;
}
function mA(e) {
	let t = window.getComputedStyle(e);
	if (t.overflowX === "scroll" || t.overflowY === "scroll" || t.overflowX === "auto" && e.clientWidth < e.scrollWidth || t.overflowY === "auto" && e.clientHeight < e.scrollHeight) return !0;
	{
		let t = e.parentNode;
		return !(t instanceof Element) || t.tagName === "BODY" ? !1 : mA(t);
	}
}
function hA(e) {
	let t = e || window.event, n = t.target;
	return n instanceof Element && mA(n) ? !1 : t.touches.length > 1 || (t.preventDefault && t.cancelable && t.preventDefault(), !1);
}
// node_modules/reka-ui/dist/shared/useComposing.js
var gA = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}]/u, _A = /android/i;
function vA() {
	return typeof navigator < "u" && _A.test(navigator.userAgent);
}
function yA(e) {
	let t = /* @__PURE__ */ L(!1), n = /* @__PURE__ */ L(!0), r = /* @__PURE__ */ L(!1), i = Y(() => t.value && n.value);
	function a() {
		t.value = !0, n.value = !0, r.value = !1;
	}
	function o(e) {
		e.data && (gA.test(e.data) ? (n.value = !0, r.value = !0) : vA() && !r.value && (n.value = !1));
	}
	function s(n) {
		Sr(() => {
			t.value = !1, e?.(n);
		});
	}
	return {
		isComposing: t,
		shouldDeferInput: i,
		handleCompositionStart: a,
		handleCompositionUpdate: o,
		handleCompositionEnd: s
	};
}
// node_modules/reka-ui/dist/shared/useDirection.js
function bA(e) {
	let t = nA({ dir: /* @__PURE__ */ L("ltr") });
	return Y(() => e?.value || t.dir?.value || "ltr");
}
// node_modules/reka-ui/dist/shared/useEmitAsProps.js
function xA(e) {
	let t = cc(), n = t?.type.emits, r = {};
	return n?.length || console.warn(`No emitted event found. Please check component: ${t?.type.__name}`), n?.forEach((t) => {
		r[De(N(t))] = (...n) => e(t, ...n);
	}), r;
}
// node_modules/reka-ui/dist/shared/useFilter.js
function SA(e) {
	let t = Y(() => R(e)), n = Y(() => new Intl.Collator("en", {
		usage: "search",
		...t.value
	}));
	return {
		startsWith: (e, t) => t.length === 0 || (e = e.normalize("NFC"), t = t.normalize("NFC"), n.value.compare(e.slice(0, t.length), t) === 0),
		endsWith: (e, t) => t.length === 0 || (e = e.normalize("NFC"), t = t.normalize("NFC"), n.value.compare(e.slice(-t.length), t) === 0),
		contains: (e, t) => {
			if (t.length === 0) return !0;
			if (e = e.normalize("NFC"), t = t.normalize("NFC"), t.length > e.length) return !1;
			let r = n.value.compare;
			if (e.includes(t)) return !0;
			let i = t.length;
			for (let n = 0; n + i <= e.length; n++) if (r(t, e.slice(n, n + i)) === 0) return !0;
			return !1;
		}
	};
}
// node_modules/reka-ui/dist/shared/useFocusGuards.js
var CA = 0;
function wA() {
	Yr((e) => {
		if (!Dk) return;
		let t = document.querySelectorAll("[data-reka-focus-guard]");
		document.body.insertAdjacentElement("afterbegin", t[0] ?? TA()), document.body.insertAdjacentElement("beforeend", t[1] ?? TA()), CA++, e(() => {
			CA === 1 && document.querySelectorAll("[data-reka-focus-guard]").forEach((e) => e.remove()), CA--;
		});
	});
}
function TA() {
	let e = document.createElement("span");
	return e.setAttribute("data-reka-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
// node_modules/reka-ui/dist/shared/useFormControl.js
function EA(e) {
	return Y(() => !Rn(e) || !!Uk(e)?.closest("form"));
}
// node_modules/reka-ui/dist/shared/useForwardExpose.js
function DA() {
	let e = cc(), t = /* @__PURE__ */ L(), n = Y(() => r());
	Ta(() => {
		n.value !== r() && Ln(t);
	});
	function r() {
		return t.value && "$el" in t.value && ["#text", "#comment"].includes(t.value.$el.nodeName) ? t.value.$el.nextElementSibling : Uk(t);
	}
	let i = Object.assign({}, e.exposed), a = {};
	for (let t in e.props) Object.defineProperty(a, t, {
		enumerable: !0,
		configurable: !0,
		get: () => e.props[t]
	});
	if (Object.keys(i).length > 0) for (let e in i) Object.defineProperty(a, e, {
		enumerable: !0,
		configurable: !0,
		get: () => i[e]
	});
	Object.defineProperty(a, "$el", {
		enumerable: !0,
		configurable: !0,
		get: () => e.vnode.el
	}), e.exposed = a;
	function o(n) {
		if (t.value = n, n && (Object.defineProperty(a, "$el", {
			enumerable: !0,
			configurable: !0,
			get: () => n instanceof Element ? n : n.$el
		}), !(n instanceof Element) && !Object.hasOwn(n, "$el"))) {
			let t = n.$.exposed, r = Object.assign({}, a);
			for (let e in t) Object.defineProperty(r, e, {
				enumerable: !0,
				configurable: !0,
				get: () => t[e]
			});
			e.exposed = r;
		}
	}
	return {
		forwardRef: o,
		currentRef: t,
		currentElement: n
	};
}
// node_modules/reka-ui/dist/shared/useForwardProps.js
function OA(e) {
	let t = cc(), n = Object.keys(t?.type.props ?? {}).reduce((e, n) => {
		let r = (t?.type.props[n]).default;
		return r !== void 0 && (e[n] = r), e;
	}, {}), r = /* @__PURE__ */ Kn(e);
	return Y(() => {
		let e = {}, i = t?.vnode.props ?? {};
		return Object.keys(i).forEach((t) => {
			e[N(t)] = i[t];
		}), Object.keys({
			...n,
			...e
		}).reduce((e, t) => (r.value[t] !== void 0 && (e[t] = r.value[t]), e), {});
	});
}
// node_modules/reka-ui/dist/shared/useForwardPropsEmits.js
function kA(e, t) {
	let n = OA(e), r = t ? xA(t) : {};
	return Y(() => ({
		...n.value,
		...r
	}));
}
// node_modules/aria-hidden/dist/es2015/index.js
var AA = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, jA = /* @__PURE__ */ new WeakMap(), MA = /* @__PURE__ */ new WeakMap(), NA = {}, PA = 0, FA = function(e) {
	return e && (e.host || FA(e.parentNode));
}, IA = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = FA(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, LA = function(e, t, n, r) {
	var i = IA(t, Array.isArray(e) ? e : [e]);
	NA[n] || (NA[n] = /* @__PURE__ */ new WeakMap());
	var a = NA[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		e && !s.has(e) && (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		e && !c.has(e) && Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (jA.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				jA.set(e, c), a.set(e, l), o.push(e), c === 1 && i && MA.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), PA++, function() {
		o.forEach(function(e) {
			var t = jA.get(e) - 1, i = a.get(e) - 1;
			jA.set(e, t), a.set(e, i), t || (MA.has(e) || e.removeAttribute(r), MA.delete(e)), i || e.removeAttribute(n);
		}), PA--, PA || (jA = /* @__PURE__ */ new WeakMap(), jA = /* @__PURE__ */ new WeakMap(), MA = /* @__PURE__ */ new WeakMap(), NA = {});
	};
}, RA = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || AA(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), LA(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
// node_modules/reka-ui/dist/shared/useHideOthers.js
function zA(e) {
	let t;
	Qr(() => Uk(e), (e) => {
		let n = !1;
		try {
			n = !!e?.closest("[popover]:not(:popover-open)");
		} catch {}
		e && !n ? t = RA(e) : t && t();
	}), Da(() => {
		t && t();
	});
}
// node_modules/reka-ui/dist/shared/useId.js
var BA = 0;
function VA(e, t = "reka") {
	if (e) return e;
	let n, r = nA({ useId: void 0 });
	return n = r.useId ? r.useId() : "useId" in ed ? ji?.() : `${++BA}`, t ? `${t}-${n}` : n;
}
// node_modules/reka-ui/dist/shared/useKbd.js
function HA() {
	return {
		ALT: "Alt",
		ARROW_DOWN: "ArrowDown",
		ARROW_LEFT: "ArrowLeft",
		ARROW_RIGHT: "ArrowRight",
		ARROW_UP: "ArrowUp",
		BACKSPACE: "Backspace",
		CAPS_LOCK: "CapsLock",
		CONTROL: "Control",
		DELETE: "Delete",
		END: "End",
		ENTER: "Enter",
		ESCAPE: "Escape",
		F1: "F1",
		F10: "F10",
		F11: "F11",
		F12: "F12",
		F2: "F2",
		F3: "F3",
		F4: "F4",
		F5: "F5",
		F6: "F6",
		F7: "F7",
		F8: "F8",
		F9: "F9",
		HOME: "Home",
		META: "Meta",
		PAGE_DOWN: "PageDown",
		PAGE_UP: "PageUp",
		SHIFT: "Shift",
		SPACE: " ",
		TAB: "Tab",
		CTRL: "Control",
		ASTERISK: "*",
		SPACE_CODE: "Space"
	};
}
// node_modules/reka-ui/dist/shared/useSize.js
function UA(e) {
	let t = /* @__PURE__ */ L(), n = Y(() => t.value?.width ?? 0), r = Y(() => t.value?.height ?? 0), i;
	return Ca(() => {
		let n = Uk(e);
		n ? (t.value = {
			width: n.offsetWidth,
			height: n.offsetHeight
		}, i = new ResizeObserver((e) => {
			if (!Array.isArray(e) || !e.length) return;
			let r = e[0], i, a;
			if ("borderBoxSize" in r) {
				let e = r.borderBoxSize, t = Array.isArray(e) ? e[0] : e;
				i = t.inlineSize, a = t.blockSize;
			} else i = n.offsetWidth, a = n.offsetHeight;
			t.value = {
				width: i,
				height: a
			};
		}), i.observe(n, { box: "border-box" })) : t.value = void 0;
	}), Da(() => {
		i?.disconnect(), i = void 0;
	}), {
		width: n,
		height: r
	};
}
// node_modules/reka-ui/dist/shared/useStateMachine.js
function WA(e, t) {
	let n = /* @__PURE__ */ L(e);
	function r(e) {
		return t[n.value][e] ?? n.value;
	}
	return {
		state: n,
		dispatch: (e) => {
			n.value = r(e);
		}
	};
}
// node_modules/reka-ui/dist/shared/useTypeahead.js
function GA(e) {
	let t = zk("", 1e3);
	return {
		search: t,
		handleTypeaheadSearch: (n, r) => {
			if (t.value += n, e) e(n);
			else {
				let e = xk(), n = r.map((e) => ({
					...e,
					textValue: e.value?.textValue ?? e.ref.textContent?.trim() ?? ""
				})), i = n.find((t) => t.ref === e), a = qA(n.map((e) => e.textValue), t.value, i?.textValue), o = n.find((e) => e.textValue === a);
				return o && o.ref.focus(), o?.ref;
			}
		},
		resetTypeahead: () => {
			t.value = "";
		}
	};
}
function KA(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
function qA(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = KA(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
// node_modules/reka-ui/dist/Presence/usePresence.js
function JA(e, t) {
	let n = /* @__PURE__ */ L({}), r = /* @__PURE__ */ L("none"), i = /* @__PURE__ */ L(e), a = e.value ? "mounted" : "unmounted", o, s = t.value?.ownerDocument.defaultView ?? Hk, { state: c, dispatch: l } = WA(a, {
		mounted: {
			UNMOUNT: "unmounted",
			ANIMATION_OUT: "unmountSuspended"
		},
		unmountSuspended: {
			MOUNT: "mounted",
			ANIMATION_END: "unmounted"
		},
		unmounted: { MOUNT: "mounted" }
	}), u = (e) => {
		if (Dk) {
			let n = new CustomEvent(e, {
				bubbles: !1,
				cancelable: !1
			});
			t.value?.dispatchEvent(n);
		}
	};
	Qr(e, async (e, i) => {
		let a = i !== e;
		if (await Sr(), a) {
			let a = r.value, o = YA(t.value);
			e ? (l("MOUNT"), u("enter"), o === "none" && u("after-enter")) : o === "none" || o === "undefined" || n.value?.display === "none" ? (l("UNMOUNT"), u("leave"), u("after-leave")) : i && a !== o ? (l("ANIMATION_OUT"), u("leave")) : (l("UNMOUNT"), u("after-leave"));
		}
	}, { immediate: !0 });
	let d = (e) => {
		if (e.target !== t.value) return;
		let n = YA(t.value), r = n.includes(CSS.escape(e.animationName)), a = c.value === "mounted" ? "enter" : "leave";
		if (r && (u(`after-${a}`), l("ANIMATION_END"), !i.value)) {
			let e = t.value.style.animationFillMode;
			t.value.style.animationFillMode = "forwards", o = s?.setTimeout(() => {
				t.value?.style.animationFillMode === "forwards" && (t.value.style.animationFillMode = e);
			});
		}
		n === "none" && l("ANIMATION_END");
	}, f = (e) => {
		e.target === t.value && (r.value = YA(t.value));
	}, p = Qr(t, (e, t) => {
		e ? (n.value = getComputedStyle(e), e.addEventListener("animationstart", f), e.addEventListener("animationcancel", d), e.addEventListener("animationend", d)) : (l("ANIMATION_END"), o !== void 0 && s?.clearTimeout(o), t?.removeEventListener("animationstart", f), t?.removeEventListener("animationcancel", d), t?.removeEventListener("animationend", d));
	}, { immediate: !0 }), m = Qr(c, () => {
		let e = YA(t.value);
		r.value = c.value === "mounted" ? e : "none";
	});
	return Da(() => {
		p(), m(), t.value && (t.value.removeEventListener("animationstart", f), t.value.removeEventListener("animationcancel", d), t.value.removeEventListener("animationend", d)), o !== void 0 && s?.clearTimeout(o);
	}), { isPresent: Y(() => ["mounted", "unmountSuspended"].includes(c.value)) };
}
function YA(e) {
	return e && getComputedStyle(e).animationName || "none";
}
// node_modules/reka-ui/dist/Presence/Presence.js
var XA = /*#__PURE__*/ B({
	name: "Presence",
	props: {
		present: {
			type: Boolean,
			required: !0
		},
		forceMount: { type: Boolean }
	},
	slots: {},
	setup(e, { slots: t, expose: n }) {
		let { present: r, forceMount: i } = /* @__PURE__ */ Un(e), a = /* @__PURE__ */ L(), { isPresent: o } = JA(r, a);
		n({ present: o });
		let s = t.default({ present: o.value });
		s = Qk(s || []);
		let c = cc();
		if (s && s?.length > 1) {
			let e = c?.parent?.type.name ? `<${c.parent.type.name} />` : "component";
			throw Error([
				`Detected an invalid children for \`${e}\` for  \`Presence\` component.`,
				"",
				"Note: Presence works similarly to `v-if` directly, but it waits for animation/transition to finished before unmounting. So it expect only one direct child of valid VNode type.",
				"You can apply a few solutions:",
				["Provide a single child element so that `presence` directive attach correctly.", "Ensure the first child is an actual element instead of a raw text node or comment node."].map((e) => `  - ${e}`).join("\n")
			].join("\n"));
		}
		return () => i.value || r.value || o.value ? Oc(t.default({ present: o.value })[0], { ref: (e) => {
			let t = Uk(e);
			return t?.hasAttribute === void 0 || (t?.hasAttribute("data-reka-popper-content-wrapper") ? a.value = t.firstElementChild : a.value = t), t;
		} }) : null;
	}
}), ZA = /*#__PURE__*/ B({
	name: "PrimitiveSlot",
	inheritAttrs: !1,
	setup(e, { attrs: t, slots: n }) {
		return () => {
			if (!n.default) return null;
			let e = Qk(n.default()), r = e.findIndex((e) => e.type !== Ps);
			if (r === -1) return e;
			let i = e[r];
			delete i.props?.ref;
			let a = i.props ? tc(t, i.props) : t, o = Ys({
				...i,
				props: {}
			}, a);
			return e.length === 1 ? o : (e[r] = o, e);
		};
	}
}), QA = [
	"area",
	"img",
	"input"
], $A = /*#__PURE__*/ B({
	name: "Primitive",
	inheritAttrs: !1,
	props: {
		asChild: {
			type: Boolean,
			default: !1
		},
		as: {
			type: [String, Object],
			default: "div"
		}
	},
	setup(e, { attrs: t, slots: n }) {
		let r = e.asChild ? "template" : e.as;
		return typeof r == "string" && QA.includes(r) ? () => Oc(r, t) : r === "template" ? () => Oc(ZA, t, { default: n.default }) : () => Oc(e.as, t, { default: n.default });
	}
});
// node_modules/reka-ui/dist/Primitive/usePrimitiveElement.js
function ej() {
	let e = /* @__PURE__ */ L();
	return {
		primitiveElement: e,
		currentElement: Y(() => ["#text", "#comment"].includes(e.value?.$el.nodeName) ? e.value?.$el.nextElementSibling : Uk(e))
	};
}
// node_modules/reka-ui/dist/DismissableLayer/utils.js
var tj = "dismissableLayer.pointerDownOutside", nj = "dismissableLayer.focusOutside";
function rj(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e.ownerDocument?.defaultView;
	return typeof Element < "u" && e instanceof Element || !!t && e instanceof t.Element;
}
function ij(e, t) {
	if (!rj(t)) return !1;
	if (e.contains(t)) return !0;
	let n = t.closest("[data-dismissable-layer]"), r = e.dataset.dismissableLayer === "" ? e : e.querySelector("[data-dismissable-layer]"), i = Array.from(e.ownerDocument.querySelectorAll("[data-dismissable-layer]"));
	return !!(n && (r === n || i.indexOf(r) < i.indexOf(n)));
}
function aj(e, t, n = !0) {
	let r = /* @__PURE__ */ L(!1), i = /* @__PURE__ */ L(() => {});
	return Yr((a) => {
		if (!Dk || !Rn(n)) return;
		let o = t?.value?.ownerDocument ?? globalThis.document, s = async (n) => {
			let a = n.target;
			if (t?.value && a) {
				if (ij(t.value, a)) o.removeEventListener("click", i.value), r.value = !1;
				else {
					if (n.target && !r.value) {
						let t = { originalEvent: n };
						function r() {
							Sk(tj, e, t);
						}
						n.pointerType === "touch" ? (o.removeEventListener("click", i.value), i.value = r, o.addEventListener("click", i.value, { once: !0 })) : r();
					} else o.removeEventListener("click", i.value);
					r.value = !1;
				}
			}
		}, c = window.setTimeout(() => {
			o.addEventListener("pointerdown", s);
		}, 0);
		a(() => {
			window.clearTimeout(c), o.removeEventListener("pointerdown", s), o.removeEventListener("click", i.value);
		});
	}), { onPointerDownCapture: () => {
		Rn(n) && (r.value = !0);
	} };
}
function oj(e, t, n = !0) {
	let r = /* @__PURE__ */ L(!1);
	return Yr((i) => {
		if (!Dk || !Rn(n)) return;
		let a = t?.value?.ownerDocument ?? globalThis.document, o = async (n) => {
			if (!t?.value) return;
			await Sr(), await Sr();
			let i = n.target;
			t.value && i && !ij(t.value, i) && n.target && !r.value && Sk(nj, e, { originalEvent: n });
		};
		a.addEventListener("focusin", o), i(() => a.removeEventListener("focusin", o));
	}), {
		onFocusCapture: () => {
			Rn(n) && (r.value = !0);
		},
		onBlurCapture: () => {
			Rn(n) && (r.value = !1);
		}
	};
}
// node_modules/reka-ui/dist/DismissableLayer/context.js
var sj = /*#__PURE__*/ bn({
	layersRoot: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), cj = /* @__PURE__ */ B({
	__name: "DismissableLayer",
	props: {
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1,
			default: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		present: {
			type: Boolean,
			required: !1,
			default: !0
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"dismiss"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, { forwardRef: i, currentElement: a } = DA(), o = Y(() => a.value?.ownerDocument ?? globalThis.document), s = Y(() => sj.layersRoot), c = Y(() => a.value ? Array.from(s.value).indexOf(a.value) : -1), l = Y(() => sj.layersWithOutsidePointerEventsDisabled.size > 0), u = Y(() => {
			let e = Array.from(s.value), [t] = [...sj.layersWithOutsidePointerEventsDisabled].slice(-1), n = e.indexOf(t);
			return c.value >= n;
		}), d = aj(async (e) => {
			let t = [...sj.branches].some((t) => t?.contains(e.target));
			n.present && u.value && !t && (r("pointerDownOutside", e), r("interactOutside", e), await Sr(), e.defaultPrevented || r("dismiss"));
		}, a, () => n.present), f = oj((e) => {
			let t = [...sj.branches].some((t) => t?.contains(e.target));
			n.present && !t && (r("focusOutside", e), r("interactOutside", e), e.defaultPrevented || r("dismiss"));
		}, a);
		return Jk("Escape", (e) => {
			n.present && c.value === s.value.size - 1 && (r("escapeKeyDown", e), e.defaultPrevented || r("dismiss"));
		}, { target: () => o.value?.defaultView ?? globalThis.window }), Qr([
			a,
			() => n.disableOutsidePointerEvents,
			() => n.present
		], ([e, t, n], r, i) => {
			if (e && n && t) {
				let t = e.ownerDocument;
				aA(t, e), sj.layersWithOutsidePointerEventsDisabled.add(e), i(() => {
					sj.layersWithOutsidePointerEventsDisabled.delete(e), oA(t, e);
				});
			}
		}, { immediate: !0 }), Qr([a, () => n.present], ([e, t], n, r) => {
			e && t && (s.value.add(e), r(() => {
				s.value.delete(e);
			}));
		}, { immediate: !0 }), Yr((e) => {
			e(() => {
				a.value && (s.value.delete(a.value), sj.layersWithOutsidePointerEventsDisabled.delete(a.value));
			});
		}), (t, n) => (U(), G(R($A), {
			ref: R(i),
			"as-child": e.asChild,
			as: e.as,
			"data-dismissable-layer": "",
			style: Ie({ pointerEvents: l.value ? u.value ? "auto" : "none" : void 0 }),
			onFocusCapture: R(f).onFocusCapture,
			onBlurCapture: R(f).onBlurCapture,
			onPointerdownCapture: R(d).onPointerDownCapture
		}, {
			default: z(() => [V(t.$slots, "default")]),
			_: 3
		}, 8, [
			"as-child",
			"as",
			"style",
			"onFocusCapture",
			"onBlurCapture",
			"onPointerdownCapture"
		]));
	}
}), lj = Ek(() => /* @__PURE__ */ L([]));
function uj() {
	let e = lj();
	return {
		add(t) {
			let n = e.value[0];
			t !== n && n?.pause(), e.value = dj(e.value, t), e.value.unshift(t);
		},
		remove(t) {
			e.value = dj(e.value, t), e.value[0]?.resume();
		}
	};
}
function dj(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
// node_modules/reka-ui/dist/FocusScope/utils.js
var fj = "focusScope.autoFocusOnMount", pj = "focusScope.autoFocusOnUnmount", mj = {
	bubbles: !1,
	cancelable: !0
};
function hj(e, t) {
	let n = t;
	for (; n;) {
		if (e.contains(n)) return !0;
		n = n.getRootNode().host ?? null;
	}
	return !1;
}
function gj(e, { select: t = !1 } = {}) {
	let n = xk();
	for (let r of e) if (Sj(r, { select: t }), xk() !== n) return !0;
}
function _j(e) {
	let t = vj(e);
	return [yj(t, e), yj(t.reverse(), e)];
}
function vj(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t.sort((e, t) => e.tabIndex === t.tabIndex ? 0 : e.tabIndex === 0 ? 1 : t.tabIndex === 0 ? -1 : e.tabIndex - t.tabIndex);
}
function yj(e, t) {
	for (let n of e) if (!bj(n, { upTo: t })) return n;
}
function bj(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function xj(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function Sj(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = xk();
		e.focus({ preventScroll: !0 }), e !== n && xj(e) && t && e.select();
	}
}
// node_modules/reka-ui/dist/FocusScope/FocusScope.js
var Cj = /* @__PURE__ */ B({
	__name: "FocusScope",
	props: {
		loop: {
			type: Boolean,
			required: !1,
			default: !1
		},
		trapped: {
			type: Boolean,
			required: !1,
			default: !1
		},
		present: {
			type: Boolean,
			required: !1,
			default: !0
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: ["mountAutoFocus", "unmountAutoFocus"],
	setup(e, { emit: t }) {
		let n = e, r = t, { currentRef: i, currentElement: a } = DA(), o = /* @__PURE__ */ L(null), s = uj(), c = /*#__PURE__*/ bn({
			paused: !1,
			pause() {
				this.paused = !0;
			},
			resume() {
				this.paused = !1;
			}
		});
		Yr((e) => {
			if (!Dk) return;
			let t = a.value;
			if (!n.trapped) return;
			let r = t?.ownerDocument ?? document, i = t ? t.getRootNode() : r;
			function s(e) {
				if (c.paused || !t) return;
				let n = e.target;
				t.contains(n) ? o.value = n : Sj(o.value, { select: !0 });
			}
			function l(e) {
				if (c.paused || !t) return;
				let n = e.relatedTarget;
				n !== null && (t.contains(n) || Sj(o.value, { select: !0 }));
			}
			function u(e) {
				let n = o.value;
				if (n === null || !e.some((e) => e.removedNodes.length > 0)) return;
				let r = xk();
				r && t.contains(r) || t.contains(n) || Sj(t);
			}
			function d(e) {
				if (c.paused || !t) return;
				let n = e.composedPath()[0];
				hj(t, n) || Sj(o.value, { select: !0 });
			}
			i.addEventListener("focusin", s), i.addEventListener("focusout", l), i !== r && r.addEventListener("focusin", d);
			let f = new MutationObserver(u);
			t && f.observe(t, {
				childList: !0,
				subtree: !0
			}), e(() => {
				i.removeEventListener("focusin", s), i.removeEventListener("focusout", l), i !== r && r.removeEventListener("focusin", d), f.disconnect();
			});
		});
		function l(e, t) {
			let n = new CustomEvent(fj, mj), i = (e) => r("mountAutoFocus", e);
			e.addEventListener(fj, i), e.dispatchEvent(n), e.removeEventListener(fj, i), n.defaultPrevented || (gj(vj(e), { select: !0 }), xk() === t && Sj(e));
		}
		Yr(async (e) => {
			let t = a.value;
			if (await Sr(), !t) return;
			n.present !== !1 && s.add(c);
			let i = xk();
			!t.contains(i) && n.present !== !1 && l(t, i), e(() => {
				let e = new CustomEvent(pj, mj), n = (e) => {
					r("unmountAutoFocus", e);
				};
				t.addEventListener(pj, n), t.dispatchEvent(e), t.setAttribute("data-focus-scope-unmounting", ""), setTimeout(() => {
					e.defaultPrevented || Sj(i ?? document.body, { select: !0 }), t.removeEventListener(pj, n), s.remove(c), t.removeAttribute("data-focus-scope-unmounting");
				}, 0);
			});
		}), Qr(() => n.present, async (e, t) => {
			if (!Dk) return;
			if (e === !1 && t === !0) {
				s.remove(c);
				return;
			}
			if (e !== !0 || t !== !1) return;
			s.add(c), await Sr();
			let n = a.value;
			if (!n) return;
			let r = xk();
			n.contains(r) || l(n, r);
		});
		function u(e) {
			if (!n.loop && !n.trapped || c.paused) return;
			let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, r = xk();
			if (t && r) {
				let t = e.currentTarget, [i, a] = _j(t);
				i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n.loop && Sj(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n.loop && Sj(a, { select: !0 })) : r === t && e.preventDefault();
			}
		}
		return (t, n) => (U(), G(R($A), {
			ref_key: "currentRef",
			ref: i,
			tabindex: "-1",
			"as-child": e.asChild,
			as: e.as,
			onKeydown: u
		}, {
			default: z(() => [V(t.$slots, "default")]),
			_: 3
		}, 8, ["as-child", "as"]));
	}
}), wj = "menu.itemSelect", Tj = ["Enter", " "], Ej = [
	"ArrowDown",
	"PageUp",
	"Home"
], Dj = [
	"ArrowUp",
	"PageDown",
	"End"
], Oj = [...Ej, ...Dj];
[...Tj], [...Tj];
function kj(e) {
	return e ? "open" : "closed";
}
function Aj(e) {
	let { onEntryFocus: t, onEntryFocusOnce: n, ...r } = e;
	return r;
}
function jj(e) {
	let t = xk();
	for (let n of e) if (n === t || (n.focus(), xk() !== t)) return;
}
function Mj(e, t) {
	let { x: n, y: r } = e, i = !1;
	for (let e = 0, a = t.length - 1; e < t.length; a = e++) {
		let o = t[e].x, s = t[e].y, c = t[a].x, l = t[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
function Nj(e, t) {
	return t ? Mj({
		x: e.clientX,
		y: e.clientY
	}, t) : !1;
}
function Pj(e) {
	return e.pointerType === "mouse";
}
// node_modules/reka-ui/dist/Teleport/Teleport.js
var Fj = /* @__PURE__ */ B({
	__name: "Teleport",
	props: {
		to: {
			type: null,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		defer: {
			type: Boolean,
			required: !1
		},
		forceMount: {
			type: Boolean,
			required: !1
		}
	},
	setup(e) {
		let t = e, n = nA({}), r = Y(() => t.to ?? n.teleportTo?.value ?? "body"), i = Gk();
		return (t, n) => R(i) || e.forceMount ? (U(), G(pi, {
			key: 0,
			to: r.value,
			disabled: e.disabled,
			defer: e.defer
		}, [V(t.$slots, "default")], 8, [
			"to",
			"disabled",
			"defer"
		])) : J("v-if", !0);
	}
}), Ij = "data-reka-collection-item";
function Lj(e = {}) {
	let { key: t = "", isProvider: n = !1 } = e, r = `${t}CollectionProvider`, i;
	n ? (i = {
		collectionRef: /* @__PURE__ */ L(),
		itemMap: /* @__PURE__ */ L(/* @__PURE__ */ new Map())
	}, Wr(r, i)) : i = Gr(r);
	let a = (e, t = !1) => {
		if (!i.collectionRef.value) return;
		let n = i.itemMap.value.get(e);
		return n && (t || n.ref.dataset.disabled !== "") ? n : void 0;
	}, o = (e = !1) => {
		let t = i.collectionRef.value;
		if (!t) return [];
		let n = Array.from(t.querySelectorAll(`[${Ij}]`)), r = new Map(n.map((e, t) => [e, t])), a = Array.from(i.itemMap.value.values()).sort((e, t) => (r.get(e.ref) ?? -1) - (r.get(t.ref) ?? -1));
		return e ? a : a.filter((e) => e.ref.dataset.disabled !== "");
	}, s = /*#__PURE__*/ B({
		name: "CollectionSlot",
		inheritAttrs: !1,
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = ej();
			return Qr(a, () => {
				i.collectionRef.value = a.value;
			}), () => Oc(ZA, {
				ref: r,
				...n
			}, t);
		}
	}), c = /*#__PURE__*/ B({
		name: "CollectionItem",
		inheritAttrs: !1,
		props: { value: { validator: () => !0 } },
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = ej();
			return Yr((t) => {
				if (a.value) {
					let n = An(a.value);
					i.itemMap.value.set(n, {
						ref: a.value,
						value: e.value
					}), t(() => i.itemMap.value.delete(n));
				}
			}), () => Oc(ZA, {
				...n,
				[Ij]: "",
				ref: r
			}, t);
		}
	});
	return {
		getItems: o,
		getItem: a,
		reactiveItems: Y(() => Array.from(i.itemMap.value.values())),
		itemMapSize: Y(() => i.itemMap.value.size),
		CollectionSlot: s,
		CollectionItem: c
	};
}
// node_modules/reka-ui/dist/VisuallyHidden/VisuallyHidden.js
var Rj = /* @__PURE__ */ B({
	__name: "VisuallyHidden",
	props: {
		feature: {
			type: String,
			required: !1,
			default: "focusable"
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "span"
		}
	},
	setup(e) {
		return (t, n) => (U(), G(R($A), {
			as: e.as,
			"as-child": e.asChild,
			"aria-hidden": e.feature === "fully-hidden" ? "true" : void 0,
			"data-hidden": e.feature === "fully-hidden" ? "" : void 0,
			tabindex: e.feature === "fully-hidden" ? "-1" : void 0,
			style: {
				position: "absolute",
				border: 0,
				width: "1px",
				height: "1px",
				padding: 0,
				margin: "-1px",
				overflow: "hidden",
				clip: "rect(0, 0, 0, 0)",
				clipPath: "inset(50%)",
				whiteSpace: "nowrap",
				wordWrap: "normal",
				top: "-1px",
				left: "-1px"
			}
		}, {
			default: z(() => [V(t.$slots, "default")]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"aria-hidden",
			"data-hidden",
			"tabindex"
		]));
	}
}), zj = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "VisuallyHiddenInputBubble",
	props: {
		name: {
			type: String,
			required: !0
		},
		value: {
			type: null,
			required: !0
		},
		checked: {
			type: Boolean,
			required: !1,
			default: void 0
		},
		required: {
			type: Boolean,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		feature: {
			type: String,
			required: !1,
			default: "fully-hidden"
		}
	},
	setup(e) {
		let t = e, { primitiveElement: n, currentElement: r } = ej();
		return Qr(Y(() => t.checked ?? t.value), (e, t) => {
			if (!r.value) return;
			let n = r.value, i = window.HTMLInputElement.prototype, a = Object.getOwnPropertyDescriptor(i, "value").set;
			if (a && e !== t) {
				let t = new Event("input", { bubbles: !0 }), r = new Event("change", { bubbles: !0 });
				a.call(n, e), n.dispatchEvent(t), n.dispatchEvent(r);
			}
		}), (e, r) => (U(), G(Rj, tc({
			ref_key: "primitiveElement",
			ref: n
		}, {
			...t,
			...e.$attrs
		}, { as: "input" }), null, 16));
	}
}), Bj = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "VisuallyHiddenInput",
	props: {
		name: {
			type: String,
			required: !0
		},
		value: {
			type: null,
			required: !0
		},
		checked: {
			type: Boolean,
			required: !1,
			default: void 0
		},
		required: {
			type: Boolean,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		feature: {
			type: String,
			required: !1,
			default: "fully-hidden"
		}
	},
	setup(e) {
		let t = e, n = Y(() => typeof t.value == "object" && Array.isArray(t.value) && t.value.length === 0 && t.required), r = Y(() => typeof t.value == "string" || typeof t.value == "number" || typeof t.value == "boolean" || t.value === null || t.value === void 0 ? [{
			name: t.name,
			value: t.value
		}] : typeof t.value == "object" && Array.isArray(t.value) ? t.value.flatMap((e, n) => typeof e == "object" ? Object.entries(e).map(([e, r]) => ({
			name: `${t.name}[${n}][${e}]`,
			value: r
		})) : {
			name: `${t.name}[${n}]`,
			value: e
		}) : t.value !== null && typeof t.value == "object" && !Array.isArray(t.value) ? Object.entries(t.value).map(([e, n]) => ({
			name: `${t.name}[${e}]`,
			value: n
		})) : []);
		return (i, a) => (U(), W(H, null, [J(" We render single input if it's required "), n.value ? (U(), G(zj, tc({ key: e.name }, {
			...t,
			...i.$attrs
		}, {
			name: e.name,
			value: e.value
		}), null, 16, ["name", "value"])) : (U(!0), W(H, { key: 1 }, Ba(r.value, (e) => (U(), G(zj, tc({ key: e.name }, { ref_for: !0 }, {
			...t,
			...i.$attrs
		}, {
			name: e.name,
			value: e.value
		}), null, 16, ["name", "value"]))), 128))], 2112));
	}
});
// node_modules/reka-ui/dist/Listbox/utils.js
function Vj(e, t, n) {
	return e === void 0 ? !1 : Array.isArray(e) ? e.some((e) => Hj(e, t, n)) : Hj(e, t, n);
}
function Hj(e, t, n) {
	return e === void 0 || t === void 0 ? !1 : typeof e == "string" ? e === t : typeof n == "function" ? n(e, t) : typeof n == "string" ? e?.[n] === t?.[n] : _k(e, t);
}
// node_modules/reka-ui/dist/RovingFocus/utils.js
var Uj = "rovingFocusGroup.onEntryFocus", Wj = {
	bubbles: !1,
	cancelable: !0
}, Gj = {
	ArrowLeft: "prev",
	ArrowUp: "prev",
	ArrowRight: "next",
	ArrowDown: "next",
	PageUp: "first",
	Home: "first",
	PageDown: "last",
	End: "last"
};
function Kj(e, t) {
	return t === "rtl" ? e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e : e;
}
function qj(e, t, n) {
	let r = Kj(e.key, n);
	if (!(t === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(t === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r))) return Gj[r];
}
function Jj(e, t = !1) {
	let n = xk();
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), xk() !== n)) return;
}
// node_modules/reka-ui/dist/Listbox/ListboxRoot.js
var [Yj, Xj] = /*#__PURE__*/ bk("ListboxRoot"), [Zj, Qj] = /*#__PURE__*/ bk("ListboxHighlightScroll"), $j = /* @__PURE__ */ B({
	__name: "ListboxRoot",
	props: {
		modelValue: {
			type: null,
			required: !1
		},
		defaultValue: {
			type: null,
			required: !1
		},
		multiple: {
			type: Boolean,
			required: !1
		},
		orientation: {
			type: String,
			required: !1,
			default: "vertical"
		},
		dir: {
			type: String,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		selectionBehavior: {
			type: String,
			required: !1,
			default: "toggle"
		},
		highlightOnHover: {
			type: Boolean,
			required: !1
		},
		loop: {
			type: Boolean,
			required: !1
		},
		by: {
			type: [String, Function],
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		name: {
			type: String,
			required: !1
		},
		required: {
			type: Boolean,
			required: !1
		}
	},
	emits: [
		"update:modelValue",
		"highlight",
		"entryFocus",
		"leave"
	],
	setup(e, { expose: t, emit: n }) {
		let r = e, i = n, { multiple: a, highlightOnHover: o, loop: s, orientation: c, disabled: l, selectionBehavior: u, dir: d } = /* @__PURE__ */ Un(r), { getItems: f, getItem: p } = Lj({ isProvider: !0 }), { handleTypeaheadSearch: m } = GA(), { primitiveElement: h, currentElement: g } = ej(), _ = HA(), v = bA(d), y = Zj(null);
		Qj({
			suppressHighlightScroll: /* @__PURE__ */ L(!1),
			onHighlightScrollRequest: () => {}
		});
		let b = EA(g), x = /* @__PURE__ */ L(), S = /* @__PURE__ */ L(!1), C = /* @__PURE__ */ L(!0), w = Zk(r, "modelValue", i, {
			defaultValue: r.defaultValue ?? (a.value ? [] : void 0),
			passive: r.modelValue === void 0,
			deep: !0
		});
		function T(e) {
			if (S.value = !0, r.multiple) {
				let t = Array.isArray(w.value) ? [...w.value] : [], n = t.findIndex((t) => Hj(t, e, r.by));
				r.selectionBehavior === "toggle" ? (n === -1 ? t.push(e) : t.splice(n, 1), w.value = t) : (w.value = [e], x.value = e);
			} else r.selectionBehavior === "toggle" && Hj(w.value, e, r.by) ? w.value = void 0 : w.value = e;
			setTimeout(() => {
				S.value = !1;
			}, 1);
		}
		let E = /* @__PURE__ */ L(null), D = /* @__PURE__ */ L(null), ee = /* @__PURE__ */ L(!1), O = /* @__PURE__ */ L(!1), te = Tk(), ne = Tk(), re = Tk();
		function ie() {
			return f().map((e) => e.ref).filter((e) => e.dataset.disabled !== "");
		}
		function ae(e, t = !0, n) {
			if (!e) return;
			E.value = e;
			let r = y?.suppressHighlightScroll.value ?? !1;
			(n ?? C.value) && (r ? E.value.focus({ preventScroll: !0 }) : E.value.focus()), r ? y?.onHighlightScrollRequest(t ? () => {
				let e = E.value;
				e?.isConnected && e.scrollIntoView({ block: "nearest" });
			} : void 0) : t && E.value.scrollIntoView({ block: "nearest" });
			let a = p(e);
			i("highlight", a);
		}
		function oe(e) {
			if (ee.value) re.trigger(e);
			else {
				let t = f().find((t) => Hj(t.value, e, r.by));
				t && (E.value = t.ref, ae(t.ref));
			}
		}
		function se(e) {
			if (E.value && E.value.isConnected) {
				if (e.ctrlKey || e.metaKey || e.altKey) return;
				e.preventDefault(), e.stopPropagation(), O.value || E.value.click();
			}
		}
		function ce(e) {
			if (C.value) {
				if (S.value = !0, ee.value) ne.trigger(e);
				else {
					let t = e.altKey || e.ctrlKey || e.metaKey;
					if (t && e.key === "a" && a.value) {
						let t = f(), n = t.map((e) => e.value);
						w.value = [...n], e.preventDefault();
						let r = t.at(-1);
						r && ae(r.ref);
					} else if (!t) {
						let t = m(e.key, f());
						t && ae(t);
					}
				}
				setTimeout(() => {
					S.value = !1;
				}, 1);
			}
		}
		function le() {
			O.value = !0;
		}
		function k() {
			Sr(() => {
				O.value = !1;
			});
		}
		function ue() {
			Sr(() => {
				j(new KeyboardEvent("keydown", { key: "PageUp" }));
			});
		}
		function A(e) {
			let t = E.value;
			t?.isConnected && (D.value = t), E.value = null, i("leave", e);
		}
		function de(e) {
			let t = new CustomEvent("listbox.entryFocus", {
				bubbles: !1,
				cancelable: !0
			});
			if (e.currentTarget?.dispatchEvent(t), i("entryFocus", t), !t.defaultPrevented) {
				if (D.value) ae(D.value);
				else {
					let e = ie()?.[0];
					ae(e);
				}
			}
		}
		function fe(e) {
			let t = f(!0).map((e) => e.ref), n = e === "next" ? t.at(-1) : t[0];
			if (!n) return !1;
			let r = Number(n.getAttribute("aria-posinset")), i = Number(n.getAttribute("aria-setsize"));
			return e === "next" ? r === i : r === 1;
		}
		function j(e) {
			let t = qj(e, c.value, v.value);
			if (!t) return;
			let n = ie();
			if (E.value) {
				if (t === "last") n.reverse();
				else if (t === "prev" || t === "next") {
					t === "prev" && n.reverse();
					let r = n.indexOf(E.value), i = s.value && r === n.length - 1;
					if (i && ee.value) {
						if (fe(t)) {
							let n = t === "next" ? _.HOME : _.END;
							return ne.trigger(new KeyboardEvent("keydown", {
								key: n,
								shiftKey: e.shiftKey
							}));
						}
						n = [];
					} else n = i ? n.slice(0, 1) : n.slice(r + 1);
				}
				pe(e, n[0]);
			}
			if (n.length) {
				let e = !E.value && t === "prev" ? n.length - 1 : 0;
				ae(n[e]);
			}
			if (ee.value) return ne.trigger(e);
		}
		function pe(e, t) {
			if (!ee.value && r.selectionBehavior === "replace" && a.value && Array.isArray(w.value) && (!e.altKey && !e.ctrlKey && !e.metaKey || e.shiftKey) && e.shiftKey) {
				let n = f().filter((e) => e.ref.dataset.disabled !== ""), r = n.find((e) => e.ref === t)?.value;
				if (e.key === _.END ? r = n.at(-1)?.value : e.key === _.HOME && (r = n[0]?.value), !r || !x.value) return;
				let i = vk(n.map((e) => e.value), x.value, r);
				w.value = i;
			}
		}
		async function me(e, t = !0) {
			if (Dk) {
				if (await Sr(), ee.value) te.trigger({
					event: e,
					scroll: t
				});
				else {
					let e = ie(), n = e.find((e) => e.dataset.state === "checked"), r = t ? void 0 : !1;
					n ? ae(n, t, r) : e.length && ae(e[0], t, r);
				}
			}
		}
		let he = !1;
		return Qr(w, () => {
			if (!S.value) {
				let e = he;
				he = !0, Sr(() => {
					me(void 0, e);
				});
			}
		}, {
			immediate: !0,
			deep: !0
		}), t({
			highlightedElement: E,
			highlightItem: oe,
			highlightFirstItem: ue,
			highlightSelected: me,
			getItems: f
		}), Xj({
			modelValue: w,
			onValueChange: T,
			multiple: a,
			orientation: c,
			dir: v,
			disabled: l,
			highlightOnHover: o,
			loop: s,
			highlightedElement: E,
			isVirtual: ee,
			virtualFocusHook: te,
			virtualKeydownHook: ne,
			virtualHighlightHook: re,
			by: r.by,
			firstValue: x,
			selectionBehavior: u,
			focusable: C,
			onLeave: A,
			onEnter: de,
			changeHighlight: ae,
			onKeydownEnter: se,
			onKeydownNavigation: j,
			onKeydownTypeAhead: ce,
			onCompositionStart: le,
			onCompositionEnd: k,
			highlightFirstItem: ue
		}), (t, n) => (U(), G(R($A), {
			ref_key: "primitiveElement",
			ref: h,
			as: e.as,
			"as-child": e.asChild,
			dir: R(v),
			"data-disabled": R(l) ? "" : void 0,
			onPointerleave: A,
			onFocusout: n[0] ||= async (e) => {
				let t = e.relatedTarget || e.target;
				await Sr(), E.value && R(g) && !R(g).contains(t) && A(e);
			}
		}, {
			default: z(() => [V(t.$slots, "default", { modelValue: R(w) }), R(b) && e.name ? (U(), G(R(Bj), {
				key: 0,
				name: e.name,
				value: R(w),
				disabled: R(l),
				required: e.required
			}, null, 8, [
				"name",
				"value",
				"disabled",
				"required"
			])) : J("v-if", !0)]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"dir",
			"data-disabled"
		]));
	}
}), eM = /* @__PURE__ */ B({
	__name: "ListboxContent",
	props: {
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let { CollectionSlot: t } = Lj(), n = Yj(), r = zk(!1, 10);
		return (i, a) => (U(), G(R(t), null, {
			default: z(() => [q(R($A), {
				role: "listbox",
				as: e.as,
				"as-child": e.asChild,
				tabindex: R(n).focusable.value ? R(n).highlightedElement.value ? "-1" : "0" : "-1",
				"aria-orientation": R(n).orientation.value,
				"aria-multiselectable": !!R(n).multiple.value,
				"data-orientation": R(n).orientation.value,
				onMousedown: a[0] ||= Ru((e) => r.value = !0, ["left"]),
				onFocus: a[1] ||= (e) => {
					R(r) || R(n).onEnter(e);
				},
				onKeydown: [
					a[2] ||= Bu((e) => {
						(R(n).orientation.value !== "vertical" || e.key !== "ArrowLeft" && e.key !== "ArrowRight") && (R(n).orientation.value !== "horizontal" || e.key !== "ArrowUp" && e.key !== "ArrowDown") && (e.preventDefault(), R(n).focusable.value && R(n).onKeydownNavigation(e));
					}, [
						"down",
						"up",
						"left",
						"right",
						"home",
						"end"
					]),
					Bu(R(n).onKeydownEnter, ["enter"]),
					R(n).onKeydownTypeAhead
				]
			}, {
				default: z(() => [V(i.$slots, "default")]),
				_: 3
			}, 8, [
				"as",
				"as-child",
				"tabindex",
				"aria-orientation",
				"aria-multiselectable",
				"data-orientation",
				"onKeydown"
			])]),
			_: 3
		}));
	}
}), tM = /* @__PURE__ */ B({
	__name: "ListboxFilter",
	props: {
		modelValue: {
			type: String,
			required: !1
		},
		autoFocus: {
			type: Boolean,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "input"
		}
	},
	emits: ["update:modelValue"],
	setup(e, { emit: t }) {
		let n = e, r = Zk(n, "modelValue", t, {
			defaultValue: "",
			passive: n.modelValue === void 0
		}), i = Yj(), { primitiveElement: a, currentElement: o } = ej(), s = Y(() => n.disabled || i.disabled.value || !1), c = /* @__PURE__ */ L();
		Zr(() => c.value = i.highlightedElement.value?.id), Ca(() => {
			i.focusable.value = !1, setTimeout(() => {
				n.autoFocus && o.value?.focus();
			}, 1);
		}), Da(() => {
			i.focusable.value = !0;
		});
		let { isComposing: l, shouldDeferInput: u, handleCompositionStart: d, handleCompositionUpdate: f, handleCompositionEnd: p } = yA((e) => {
			r.value = e.target.value, i.onCompositionEnd(), i.highlightFirstItem();
		});
		function m() {
			i.onCompositionStart(), d();
		}
		function h(e) {
			u.value || (r.value = e.target.value, i.highlightFirstItem());
		}
		function g(e) {
			l.value || (e.preventDefault(), i.onKeydownNavigation(e));
		}
		function _(e) {
			l.value || i.onKeydownEnter(e);
		}
		return (t, n) => (U(), G(R($A), {
			ref_key: "primitiveElement",
			ref: a,
			as: e.as,
			"as-child": e.asChild,
			value: R(r),
			disabled: s.value ? "" : void 0,
			"data-disabled": s.value ? "" : void 0,
			"aria-disabled": s.value ?? void 0,
			"aria-activedescendant": c.value,
			type: "text",
			onKeydown: [Bu(g, [
				"down",
				"up",
				"home",
				"end"
			]), Bu(_, ["enter"])],
			onInput: h,
			onCompositionstart: m,
			onCompositionupdate: R(f),
			onCompositionend: R(p)
		}, {
			default: z(() => [V(t.$slots, "default", { modelValue: R(r) })]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"value",
			"disabled",
			"data-disabled",
			"aria-disabled",
			"aria-activedescendant",
			"onCompositionupdate",
			"onCompositionend"
		]));
	}
}), nM = "listbox.select", [rM, iM] = /*#__PURE__*/ bk("ListboxItem"), aM = /* @__PURE__ */ B({
	__name: "ListboxItem",
	props: {
		value: {
			type: null,
			required: !0
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "div"
		}
	},
	emits: ["select"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = VA(void 0, "reka-listbox-item"), { CollectionItem: a } = Lj(), { forwardRef: o, currentElement: s } = DA(), c = Yj(), l = Y(() => s.value != null && s.value === c.highlightedElement.value), u = Y(() => Vj(c.modelValue.value, n.value, c.by)), d = Y(() => c.disabled.value || n.disabled);
		async function f(e) {
			r("select", e), !e?.defaultPrevented && !d.value && e && (c.onValueChange(n.value), c.changeHighlight(s.value));
		}
		function p(e) {
			Sk(nM, f, {
				originalEvent: e,
				value: n.value
			});
		}
		return iM({ isSelected: u }), (t, n) => (U(), G(R(a), { value: e.value }, {
			default: z(() => [Ac([
				l.value,
				u.value,
				d.value,
				R(c).focusable.value,
				...Object.entries(t.$attrs).flat()
			], () => q(R($A), tc({ id: R(i) }, t.$attrs, {
				ref: R(o),
				role: "option",
				tabindex: R(c).focusable.value ? l.value ? "0" : "-1" : -1,
				"aria-selected": u.value,
				as: e.as,
				"as-child": e.asChild,
				disabled: d.value ? "" : void 0,
				"data-disabled": d.value ? "" : void 0,
				"data-highlighted": l.value ? "" : void 0,
				"data-state": u.value ? "checked" : "unchecked",
				onClick: p,
				onKeydown: Bu(Ru(p, ["prevent"]), ["space"]),
				onPointermove: n[0] ||= () => {
					R(c).highlightedElement.value !== R(s) && R(c).highlightOnHover.value && R(c).changeHighlight(R(s), !1, !1);
				}
			}), {
				default: z(() => [V(t.$slots, "default", { selected: u.value })]),
				_: 3
			}, 16, [
				"id",
				"tabindex",
				"aria-selected",
				"as",
				"as-child",
				"disabled",
				"data-disabled",
				"data-highlighted",
				"data-state",
				"onKeydown"
			]), n, 1)]),
			_: 3
		}, 8, ["value"]));
	}
}), [oM, sM] = /*#__PURE__*/ bk("PopperRoot"), cM = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "PopperRoot",
	setup(e) {
		let t = /* @__PURE__ */ L();
		return sM({
			anchor: t,
			onAnchorChange: (e) => t.value = e
		}), (e, t) => V(e.$slots, "default");
	}
}), lM = /* @__PURE__ */ B({
	__name: "PopperAnchor",
	props: {
		reference: {
			type: null,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let t = e, { forwardRef: n, currentElement: r } = DA(), i = oM();
		return Xr(() => {
			i.onAnchorChange(t.reference ?? r.value);
		}), (t, r) => (U(), G(R($A), {
			ref: R(n),
			as: e.as,
			"as-child": e.asChild
		}, {
			default: z(() => [V(t.$slots, "default")]),
			_: 3
		}, 8, ["as", "as-child"]));
	}
});
// node_modules/reka-ui/dist/Popper/utils.js
function uM(e) {
	return e !== null;
}
function dM(e) {
	return {
		name: "transformOrigin",
		options: e,
		fn(t) {
			let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = fM(n), u = {
				start: e.dir === "rtl" ? "100%" : "0%",
				center: "50%",
				end: e.dir === "rtl" ? "0%" : "100%"
			}[l], d = {
				start: "0%",
				center: "50%",
				end: "100%"
			}[l], f = (i.arrow?.x ?? 0) + o / 2, p = (i.arrow?.y ?? 0) + s / 2, m = "", h = "";
			return c === "bottom" ? (m = a ? u : `${f}px`, h = `${-s}px`) : c === "top" ? (m = a ? u : `${f}px`, h = `${r.floating.height + s}px`) : c === "right" ? (m = `${-s}px`, h = a ? d : `${p}px`) : c === "left" && (m = `${r.floating.width + s}px`, h = a ? d : `${p}px`), { data: {
				x: m,
				y: h
			} };
		}
	};
}
function fM(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var pM = [
	"top",
	"right",
	"bottom",
	"left"
], mM = Math.min, hM = Math.max, gM = Math.round, _M = Math.floor, vM = (e) => ({
	x: e,
	y: e
}), yM = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function bM(e, t, n) {
	return hM(e, mM(t, n));
}
function xM(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function SM(e) {
	return e.split("-")[0];
}
function CM(e) {
	return e.split("-")[1];
}
function wM(e) {
	return e === "x" ? "y" : "x";
}
function TM(e) {
	return e === "y" ? "height" : "width";
}
function EM(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function DM(e) {
	return wM(EM(e));
}
function OM(e, t, n) {
	n === void 0 && (n = !1);
	let r = CM(e), i = DM(e), a = TM(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = LM(o)), [o, LM(o)];
}
function kM(e) {
	let t = LM(e);
	return [
		AM(e),
		t,
		AM(t)
	];
}
function AM(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var jM = ["left", "right"], MM = ["right", "left"], NM = ["top", "bottom"], PM = ["bottom", "top"];
function FM(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? MM : jM : t ? jM : MM;
		case "left":
		case "right": return t ? NM : PM;
		default: return [];
	}
}
function IM(e, t, n, r) {
	let i = CM(e), a = FM(SM(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(AM)))), a;
}
function LM(e) {
	let t = SM(e);
	return yM[t] + e.slice(t.length);
}
function RM(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function zM(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : RM(e);
}
function BM(e) {
	let { x: t, y: n, width: r, height: i } = e;
	return {
		width: r,
		height: i,
		top: n,
		left: t,
		right: t + r,
		bottom: n + i,
		x: t,
		y: n
	};
}
// node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function VM(e, t, n) {
	let { reference: r, floating: i } = e, a = EM(t), o = DM(t), s = TM(o), c = SM(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
	switch (c) {
		case "top":
			p = {
				x: u,
				y: r.y - i.height
			};
			break;
		case "bottom":
			p = {
				x: u,
				y: r.y + r.height
			};
			break;
		case "right":
			p = {
				x: r.x + r.width,
				y: d
			};
			break;
		case "left":
			p = {
				x: r.x - i.width,
				y: d
			};
			break;
		default: p = {
			x: r.x,
			y: r.y
		};
	}
	let m = CM(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function HM(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = xM(t, e), p = zM(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = BM(await i.getClippingRect({
		element: await (i.isElement == null ? void 0 : i.isElement(m)) ?? !0 ? m : m.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(o.floating)),
		boundary: c,
		rootBoundary: l,
		strategy: s
	})), g = u === "floating" ? {
		x: n,
		y: r,
		width: a.floating.width,
		height: a.floating.height
	} : a.reference, _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(o.floating)), v = await (i.isElement == null ? void 0 : i.isElement(_)) && await (i.getScale == null ? void 0 : i.getScale(_)) || {
		x: 1,
		y: 1
	}, y = BM(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements: o,
		rect: g,
		offsetParent: _,
		strategy: s
	}) : g);
	return {
		top: (h.top - y.top + p.top) / v.y,
		bottom: (y.bottom - h.bottom + p.bottom) / v.y,
		left: (h.left - y.left + p.left) / v.x,
		right: (y.right - h.right + p.right) / v.x
	};
}
var UM = 50, WM = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: HM
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = VM(l, r, c), f = r, p = 0, m = {};
	for (let n = 0; n < a.length; n++) {
		let h = a[n];
		if (!h) continue;
		let { name: g, fn: _ } = h, { x: v, y, data: b, reset: x } = await _({
			x: u,
			y: d,
			initialPlacement: r,
			placement: f,
			strategy: i,
			middlewareData: m,
			rects: l,
			platform: s,
			elements: {
				reference: e,
				floating: t
			}
		});
		u = v ?? u, d = y ?? d, m[g] = {
			...m[g],
			...b
		}, x && p < UM && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = VM(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, GM = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = xM(e, t) || {};
		if (l == null) return {};
		let d = zM(u), f = {
			x: n,
			y: r
		}, p = DM(i), m = TM(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		C && await (o.isElement == null ? void 0 : o.isElement(S)) || (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = mM(d[_], T), D = mM(d[v], T), ee = C - h[m] - D, O = C / 2 - h[m] / 2 + w, te = bM(E, O, ee), ne = !c.arrow && CM(i) != null && O !== te && a.reference[m] / 2 - (O < E ? E : D) - h[m] / 2 < 0, re = ne ? O < E ? O - E : O - ee : 0;
		return {
			[p]: f[p] + re,
			data: {
				[p]: te,
				centerOffset: O - te - re,
				...ne && { alignmentOffset: re }
			},
			reset: ne
		};
	}
}), KM = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = xM(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = SM(r), _ = EM(o), v = SM(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [LM(o)] : kM(o)), x = p !== "none";
			!d && x && b.push(...IM(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = OM(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === EM(t) || T.every((e) => EM(e.placement) !== _ || e.overflows[0] > 0))) return {
					data: {
						index: e,
						overflows: T
					},
					reset: { placement: t }
				};
				let n = T.filter((e) => e.overflows[0] <= 0).sort((e, t) => e.overflows[1] - t.overflows[1])[0]?.placement;
				if (!n) switch (f) {
					case "bestFit": {
						let e = T.filter((e) => {
							if (x) {
								let t = EM(e.placement);
								return t === _ || t === "y";
							}
							return !0;
						}).map((e) => [e.placement, e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0)]).sort((e, t) => e[1] - t[1])[0]?.[0];
						e && (n = e);
						break;
					}
					case "initialPlacement": n = o;
				}
				if (r !== n) return { reset: { placement: n } };
			}
			return {};
		}
	};
};
function qM(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function JM(e) {
	return pM.some((t) => e[t] >= 0);
}
var YM = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = xM(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = qM(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: JM(e)
					} };
				}
				case "escaped": {
					let e = qM(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: JM(e)
					} };
				}
				default: return {};
			}
		}
	};
}, XM = /*#__PURE__*/ new Set(["left", "top"]);
async function ZM(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = SM(n), s = CM(n), c = EM(n) === "y", l = XM.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = xM(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
		mainAxis: d,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: d.mainAxis || 0,
		crossAxis: d.crossAxis || 0,
		alignmentAxis: d.alignmentAxis
	};
	return s && typeof m == "number" && (p = s === "end" ? m * -1 : m), c ? {
		x: p * u,
		y: f * l
	} : {
		x: f * l,
		y: p * u
	};
}
var QM = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await ZM(t, e);
			return a === o.offset?.placement && (n = o.arrow) != null && n.alignmentOffset ? {} : {
				x: r + s.x,
				y: i + s.y,
				data: {
					...s,
					placement: a
				}
			};
		}
	};
}, $M = function(e) {
	return e === void 0 && (e = {}), {
		name: "shift",
		options: e,
		async fn(t) {
			let { x: n, y: r, placement: i, platform: a } = t, { mainAxis: o = !0, crossAxis: s = !1, limiter: c = { fn: (e) => {
				let { x: t, y: n } = e;
				return {
					x: t,
					y: n
				};
			} }, ...l } = xM(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = EM(i), p = wM(f), m = u[p], h = u[f], g = (e, t) => bM(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
			o && (m = g(p, m)), s && (h = g(f, h));
			let _ = c.fn({
				...t,
				[p]: m,
				[f]: h
			});
			return {
				..._,
				data: {
					x: _.x - n,
					y: _.y - r,
					enabled: {
						[p]: o,
						[f]: s
					}
				}
			};
		}
	};
}, eN = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = xM(e, t), u = {
				x: n,
				y: r
			}, d = EM(i), f = wM(d), p = u[f], m = u[d], h = xM(s, t), g = typeof h == "number" ? {
				mainAxis: h,
				crossAxis: 0
			} : {
				mainAxis: h.mainAxis ?? 0,
				crossAxis: h.crossAxis ?? 0
			};
			if (c) {
				let e = f === "y" ? "height" : "width", t = a.reference[f] - a.floating[e] + g.mainAxis, n = a.reference[f] + a.reference[e] - g.mainAxis;
				p < t ? p = t : p > n && (p = n);
			}
			if (l) {
				let e = f === "y" ? "width" : "height", t = XM.has(SM(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, tN = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = xM(e, t), c = await i.detectOverflow(t, s), l = SM(n), u = CM(n), d = EM(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = mM(p - c[m], g), y = mM(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * hM(c.left, c.right) : S = p - 2 * hM(c.top, c.bottom)), await o({
				...t,
				availableWidth: C,
				availableHeight: S
			});
			let w = await i.getDimensions(a.floating);
			return f !== w.width || p !== w.height ? { reset: { rects: !0 } } : {};
		}
	};
};
// node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function nN() {
	return typeof window < "u";
}
function rN(e) {
	return oN(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function iN(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function aN(e) {
	return ((oN(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function oN(e) {
	return nN() ? e instanceof Node || e instanceof iN(e).Node : !1;
}
function sN(e) {
	return nN() ? e instanceof Element || e instanceof iN(e).Element : !1;
}
function cN(e) {
	return nN() ? e instanceof HTMLElement || e instanceof iN(e).HTMLElement : !1;
}
function lN(e) {
	return !nN() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof iN(e).ShadowRoot;
}
function uN(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = xN(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function dN(e) {
	return /^(table|td|th)$/.test(rN(e));
}
function fN(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var pN = /transform|translate|scale|rotate|perspective|filter/, mN = /paint|layout|strict|content/, hN = (e) => !!e && e !== "none", gN;
function _N(e) {
	let t = sN(e) ? xN(e) : e;
	return hN(t.transform) || hN(t.translate) || hN(t.scale) || hN(t.rotate) || hN(t.perspective) || !yN() && (hN(t.backdropFilter) || hN(t.filter)) || pN.test(t.willChange || "") || mN.test(t.contain || "");
}
function vN(e) {
	let t = CN(e);
	for (; cN(t) && !bN(t);) {
		if (_N(t)) return t;
		if (fN(t)) return null;
		t = CN(t);
	}
	return null;
}
function yN() {
	return gN ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), gN;
}
function bN(e) {
	return /^(html|body|#document)$/.test(rN(e));
}
function xN(e) {
	return iN(e).getComputedStyle(e);
}
function SN(e) {
	return sN(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function CN(e) {
	if (rN(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || lN(e) && e.host || aN(e);
	return lN(t) ? t.host : t;
}
function wN(e) {
	let t = CN(e);
	return bN(t) ? (e.ownerDocument || e).body : cN(t) && uN(t) ? t : wN(t);
}
function TN(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = wN(e), i = r === e.ownerDocument?.body, a = iN(r);
	if (i) {
		let e = EN(a);
		return t.concat(a, a.visualViewport || [], uN(r) ? r : [], e && n ? TN(e) : []);
	}
	return t.concat(r, TN(r, [], n));
}
function EN(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function DN(e) {
	let t = xN(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = cN(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = gM(n) !== a || gM(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function ON(e) {
	return sN(e) ? e : e.contextElement;
}
function kN(e) {
	let t = ON(e);
	if (!cN(t)) return vM(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = DN(t), o = (a ? gM(n.width) : n.width) / r, s = (a ? gM(n.height) : n.height) / i;
	return o && Number.isFinite(o) || (o = 1), s && Number.isFinite(s) || (s = 1), {
		x: o,
		y: s
	};
}
var AN = /*#__PURE__*/ vM(0);
function jN(e) {
	let t = iN(e);
	return !yN() || !t.visualViewport ? AN : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function MN(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === iN(e);
}
function NN(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = ON(e), o = vM(1);
	t && (r ? sN(r) && (o = kN(r)) : o = kN(e));
	let s = MN(a, n, r) ? jN(a) : vM(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = iN(a), t = sN(r) ? iN(r) : r, n = e, i = EN(n);
		for (; i && t !== n;) {
			let e = kN(i), t = i.getBoundingClientRect(), r = xN(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = iN(i), i = EN(n);
		}
	}
	return BM({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function PN(e, t) {
	let n = SN(e).scrollLeft;
	return t ? t.left + n : NN(aN(e)).left + n;
}
function FN(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - PN(e, n),
		y: n.top + t.scrollTop
	};
}
function IN(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = aN(r), s = t ? fN(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = vM(1), u = vM(0), d = cN(r);
	if ((d || !a) && ((rN(r) !== "body" || uN(o)) && (c = SN(r)), d)) {
		let e = NN(r);
		l = kN(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? FN(o, c) : vM(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function LN(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function RN(e) {
	let t = SN(e), n = e.ownerDocument.body, r = hM(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = hM(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + PN(e), o = -t.scrollTop;
	return xN(n).direction === "rtl" && (a += hM(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var zN = 25;
function BN(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = iN(e), a = aN(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !yN() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (PN(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= zN && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function VN(e, t) {
	let n = NN(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = kN(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function HN(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = BN(e, n, t);
	else if (t === "document") r = RN(aN(e));
	else if (sN(t)) r = VN(t, n);
	else {
		let n = jN(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return BM(r);
}
function UN(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = TN(e, [], !1).filter((e) => sN(e) && rN(e) !== "body"), i = null, a = xN(e).position === "fixed", o = a ? CN(e) : e;
	for (; sN(o) && !bN(o);) {
		let e = xN(o), t = _N(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = CN(o);
	}
	return t.set(e, r), r;
}
function WN(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? fN(t) ? [] : UN(t, this._c) : [].concat(n), r], o = HN(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = HN(t, a[e], i);
		s = hM(n.top, s), c = mM(n.right, c), l = mM(n.bottom, l), u = hM(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function GN(e) {
	let { width: t, height: n } = DN(e);
	return {
		width: t,
		height: n
	};
}
function KN(e, t, n) {
	let r = cN(t), i = aN(t), a = n === "fixed", o = NN(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = vM(0);
	if ((r || !a) && ((rN(t) !== "body" || uN(i)) && (s = SN(t)), r)) {
		let e = NN(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = PN(i));
	let l = i && !r && !a ? FN(i, s) : vM(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function qN(e) {
	return xN(e).position === "static";
}
function JN(e, t) {
	if (!cN(e) || xN(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return aN(e) === n && (n = n.ownerDocument.body), n;
}
function YN(e, t) {
	let n = iN(e);
	if (fN(e)) return n;
	if (!cN(e)) {
		let t = CN(e);
		for (; t && !bN(t);) {
			if (sN(t) && !qN(t)) return t;
			t = CN(t);
		}
		return n;
	}
	let r = JN(e, t);
	for (; r && dN(r) && qN(r);) r = JN(r, t);
	return r && bN(r) && qN(r) && !_N(r) ? n : r || vN(e) || n;
}
var XN = async function(e) {
	let t = this.getOffsetParent || YN, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: KN(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function ZN(e) {
	return xN(e).direction === "rtl";
}
var QN = {
	convertOffsetParentRelativeRectToViewportRelativeRect: IN,
	getDocumentElement: aN,
	getClippingRect: WN,
	getOffsetParent: YN,
	getElementRects: XN,
	getClientRects: LN,
	getDimensions: GN,
	getScale: kN,
	isElement: sN,
	isRTL: ZN
};
function $N(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function eP(e, t, n) {
	let r = null, i, a = aN(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = _M(d), h = _M(a.clientWidth - (u + f)), g = _M(a.clientHeight - (d + p)), _ = _M(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: hM(0, mM(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!$N(l, e.getBoundingClientRect())) return s();
			if (n !== c) {
				if (!y) return s();
				n ? s(!1, n) : i = setTimeout(() => {
					s(!1, 1e-7);
				}, 1e3);
			}
			y = !1;
		}
		try {
			r = new IntersectionObserver(b, {
				...v,
				root: a.ownerDocument
			});
		} catch {
			r = new IntersectionObserver(b, v);
		}
		r.observe(e);
	}
	let c = iN(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function tP(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = ON(e), u = i || a ? [...l ? TN(l) : [], ...t ? TN(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? eP(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? NN(e) : null;
	c && g();
	function g() {
		let t = NN(e);
		h && !$N(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var nP = QM, rP = $M, iP = KM, aP = tN, oP = YM, sP = GM, cP = eN, lP = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...QN,
		...i.platform,
		_c: r
	};
	return WM(e, t, {
		...i,
		platform: a
	});
};
// node_modules/@floating-ui/vue/dist/floating-ui.vue.mjs
function uP(e) {
	return typeof e == "object" && !!e && "$el" in e;
}
function dP(e) {
	if (uP(e)) {
		let t = e.$el;
		return oN(t) && rN(t) === "#comment" ? null : t;
	}
	return e;
}
function fP(e) {
	return {
		name: "arrow",
		options: e,
		fn(t) {
			let n = dP(Rn(e.element));
			return n == null ? {} : sP({
				element: n,
				padding: e.padding
			}).fn(t);
		}
	};
}
function pP(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function mP(e, t) {
	let n = pP(e);
	return Math.round(t * n) / n;
}
function hP(e, t, n) {
	n === void 0 && (n = {});
	let r = n.whileElementsMounted, i = Y(() => Rn(n.open) ?? !0), a = Y(() => Rn(n.middleware)), o = Y(() => Rn(n.placement) ?? "bottom"), s = Y(() => Rn(n.strategy) ?? "absolute"), c = Y(() => Rn(n.transform) ?? !0), l = Y(() => dP(e.value)), u = Y(() => dP(t.value)), d = /* @__PURE__ */ L(0), f = /* @__PURE__ */ L(0), p = /* @__PURE__ */ L(s.value), m = /* @__PURE__ */ L(o.value), h = /* @__PURE__ */ Pn({}), g = /* @__PURE__ */ L(!1), _ = Y(() => {
		let e = {
			position: p.value,
			left: "0",
			top: "0"
		};
		if (!u.value) return e;
		let t = mP(u.value, d.value), n = mP(u.value, f.value);
		return c.value ? {
			...e,
			transform: "translate(" + t + "px, " + n + "px)",
			...pP(u.value) >= 1.5 && { willChange: "transform" }
		} : {
			position: p.value,
			left: t + "px",
			top: n + "px"
		};
	}), v;
	function y() {
		if (l.value == null || u.value == null) return;
		let e = i.value;
		lP(l.value, u.value, {
			middleware: a.value,
			placement: o.value,
			strategy: s.value
		}).then((t) => {
			d.value = t.x, f.value = t.y, p.value = t.strategy, m.value = t.placement, h.value = t.middlewareData, g.value = e !== !1;
		});
	}
	function b() {
		typeof v == "function" && (v(), v = void 0);
	}
	function x() {
		b(), r === void 0 ? y() : l.value != null && u.value != null && (v = r(l.value, u.value, y));
	}
	function S() {
		i.value || (g.value = !1);
	}
	return Qr([
		a,
		o,
		s,
		i
	], y, { flush: "sync" }), Qr([l, u], x, { flush: "sync" }), Qr(i, S, { flush: "sync" }), nt() && rt(b), {
		x: /* @__PURE__ */ Cn(d),
		y: /* @__PURE__ */ Cn(f),
		strategy: /* @__PURE__ */ Cn(p),
		placement: /* @__PURE__ */ Cn(m),
		middlewareData: /* @__PURE__ */ Cn(h),
		isPositioned: /* @__PURE__ */ Cn(g),
		floatingStyles: _,
		update: y
	};
}
// node_modules/reka-ui/dist/Popper/PopperContent.js
var gP = ["dir"], _P = {
	side: "bottom",
	sideOffset: 0,
	sideFlip: !0,
	align: "center",
	alignOffset: 0,
	alignFlip: !0,
	arrowPadding: 0,
	hideShiftedArrow: !0,
	avoidCollisions: !0,
	collisionBoundary: () => [],
	collisionPadding: 0,
	sticky: "partial",
	hideWhenDetached: !1,
	positionStrategy: "fixed",
	updatePositionStrategy: "optimized",
	prioritizePosition: !1
}, [vP, yP] = /*#__PURE__*/ bk("PopperContent"), bP = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "PopperContent",
	props: /* @__PURE__ */ oo({
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	}, { ..._P }),
	emits: ["placed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = oM(), { forwardRef: a, currentElement: o } = DA(), s = bA(Y(() => n.dir)), c = /* @__PURE__ */ L(), l = /* @__PURE__ */ L(), { width: u, height: d } = UA(l), f = Y(() => n.side + (n.align === "center" ? "" : `-${n.align}`)), p = Y(() => typeof n.collisionPadding == "number" ? n.collisionPadding : {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			...n.collisionPadding
		}), m = Y(() => Array.isArray(n.collisionBoundary) ? n.collisionBoundary : [n.collisionBoundary]), h = Y(() => ({
			padding: p.value,
			boundary: m.value.filter(uM),
			altBoundary: m.value.length > 0
		})), g = Y(() => ({
			mainAxis: n.sideFlip,
			crossAxis: n.alignFlip
		})), _ = Y(() => [
			nP({
				mainAxis: n.sideOffset + d.value,
				alignmentAxis: n.alignOffset
			}),
			n.prioritizePosition && n.avoidCollisions && iP({
				...h.value,
				...g.value
			}),
			n.avoidCollisions && rP({
				mainAxis: !0,
				crossAxis: !!n.prioritizePosition,
				limiter: n.sticky === "partial" ? cP() : void 0,
				...h.value
			}),
			!n.prioritizePosition && n.avoidCollisions && iP({
				...h.value,
				...g.value
			}),
			aP({
				...h.value,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--reka-popper-available-width", `${n}px`), o.setProperty("--reka-popper-available-height", `${r}px`), o.setProperty("--reka-popper-anchor-width", `${i}px`), o.setProperty("--reka-popper-anchor-height", `${a}px`);
				}
			}),
			l.value && fP({
				element: l.value,
				padding: n.arrowPadding
			}),
			dM({
				arrowWidth: u.value,
				arrowHeight: d.value,
				dir: s.value
			}),
			n.hideWhenDetached && oP({
				strategy: "referenceHidden",
				...h.value
			})
		]), { floatingStyles: v, placement: y, isPositioned: b, middlewareData: x, update: S } = hP(Y(() => n.reference ?? i.anchor.value), c, {
			strategy: n.positionStrategy,
			placement: f,
			whileElementsMounted: (...e) => tP(...e, {
				layoutShift: !n.disableUpdateOnLayoutShift,
				animationFrame: n.updatePositionStrategy === "always"
			}),
			middleware: _
		}), C = Y(() => fM(y.value)[0]), w = Y(() => fM(y.value)[1]);
		Xr(() => {
			b.value && r("placed");
		});
		let T = Y(() => {
			let e = x.value.arrow?.centerOffset !== 0;
			return n.hideShiftedArrow && e;
		}), E = /* @__PURE__ */ L("");
		return Yr(() => {
			o.value && (E.value = window.getComputedStyle(o.value).zIndex);
		}), yP({
			placedSide: C,
			onArrowChange: (e) => l.value = e,
			arrowX: Y(() => x.value.arrow?.x ?? 0),
			arrowY: Y(() => x.value.arrow?.y ?? 0),
			shouldHideArrow: T
		}), (e, t) => (U(), W("div", {
			ref_key: "floatingRef",
			ref: c,
			"data-reka-popper-content-wrapper": "",
			dir: R(s),
			style: Ie({
				...R(v),
				transform: R(b) ? R(v).transform : "translate(0, -200%)",
				minWidth: "max-content",
				zIndex: E.value,
				"--reka-popper-transform-origin": [R(x).transformOrigin?.x, R(x).transformOrigin?.y].join(" "),
				...R(x).hide?.referenceHidden && {
					visibility: "hidden",
					pointerEvents: "none"
				}
			})
		}, [n.memoDependencies ? Ac([
			n.asChild,
			n.as,
			C.value,
			w.value,
			R(b),
			...Object.values(e.$attrs),
			...n.memoDependencies
		], () => (U(), G(R($A), tc({
			key: 0,
			ref: R(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			style: { animation: R(b) ? void 0 : "none" }
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"style"
		])), t, 0) : (U(), G(R($A), tc({
			key: 1,
			ref: R(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			dir: R(s),
			style: { animation: R(b) ? void 0 : "none" }
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"dir",
			"style"
		]))], 12, gP));
	}
});
// node_modules/reka-ui/dist/Combobox/useComboboxContentPositioning.js
function xP(e) {
	let t = /* @__PURE__ */ L("inline"), n = /* @__PURE__ */ L(!1), r = /* @__PURE__ */ L(), i = Y(() => t.value === "popper" && !n.value), a;
	Qj({
		suppressHighlightScroll: i,
		onHighlightScrollRequest(e) {
			a = e;
		}
	});
	function o(e, i) {
		(r.value !== e || t.value !== i) && (n.value = !1, a = void 0), r.value = e, t.value = i;
	}
	function s(i) {
		if (r.value !== i || t.value !== "popper" || n.value) return;
		n.value = !0;
		let o = a;
		a = void 0, e.value && o?.();
	}
	function c(e) {
		r.value === e && (r.value = void 0, t.value = "inline", n.value = !1, a = void 0);
	}
	return {
		onContentPositionChange: o,
		onContentPlaced: s,
		onContentUnmount: c
	};
}
// node_modules/reka-ui/dist/Combobox/ComboboxRoot.js
var [SP, CP] = /*#__PURE__*/ bk("ComboboxRoot"), wP = /* @__PURE__ */ B({
	__name: "ComboboxRoot",
	props: {
		open: {
			type: Boolean,
			required: !1,
			default: void 0
		},
		defaultOpen: {
			type: Boolean,
			required: !1
		},
		resetSearchTermOnBlur: {
			type: Boolean,
			required: !1,
			default: !0
		},
		resetSearchTermOnSelect: {
			type: Boolean,
			required: !1,
			default: !0
		},
		openOnFocus: {
			type: Boolean,
			required: !1,
			default: !1
		},
		openOnClick: {
			type: Boolean,
			required: !1,
			default: !1
		},
		ignoreFilter: {
			type: Boolean,
			required: !1
		},
		resetModelValueOnClear: {
			type: Boolean,
			required: !1,
			default: !1
		},
		unmountOnHide: {
			type: Boolean,
			required: !1,
			default: !0
		},
		modelValue: {
			type: null,
			required: !1
		},
		defaultValue: {
			type: null,
			required: !1
		},
		multiple: {
			type: Boolean,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		highlightOnHover: {
			type: Boolean,
			required: !1,
			default: !0
		},
		loop: {
			type: Boolean,
			required: !1
		},
		by: {
			type: [String, Function],
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		name: {
			type: String,
			required: !1
		},
		required: {
			type: Boolean,
			required: !1
		}
	},
	emits: [
		"update:modelValue",
		"highlight",
		"update:open"
	],
	setup(e, { expose: t, emit: n }) {
		let r = e, i = n, { primitiveElement: a, currentElement: o } = ej(), { multiple: s, disabled: c, ignoreFilter: l, resetSearchTermOnSelect: u, openOnFocus: d, openOnClick: f, dir: p, resetModelValueOnClear: m, highlightOnHover: h, loop: g, unmountOnHide: _ } = /* @__PURE__ */ Un(r), v = bA(p), y = Zk(r, "modelValue", i, {
			defaultValue: r.defaultValue ?? (s.value ? [] : void 0),
			passive: r.modelValue === void 0,
			deep: !0
		}), b = Zk(r, "open", i, {
			defaultValue: r.defaultOpen,
			passive: r.open === void 0
		});
		async function x(e) {
			b.value = e, re.value = "", e ? (await Sr(), a.value?.highlightSelected(), C.value = !0, T.value?.focus()) : (C.value = !1, setTimeout(() => {
				!e && r.resetSearchTermOnBlur && S.trigger();
			}, 1));
		}
		let S = Tk(), C = /* @__PURE__ */ L(!1), w = /* @__PURE__ */ L(!1), T = /* @__PURE__ */ L(), E = /* @__PURE__ */ L(), D = Y(() => a.value?.highlightedElement ?? void 0), ee = xP(b), O = /* @__PURE__ */ L(/* @__PURE__ */ new Map()), te = /* @__PURE__ */ L(/* @__PURE__ */ new Map()), { contains: ne } = SA({ sensitivity: "base" }), re = /* @__PURE__ */ L(""), ie = Y((e) => {
			if (!re.value || r.ignoreFilter || w.value) return {
				count: O.value.size,
				items: e?.items ?? /* @__PURE__ */ new Map(),
				groups: e?.groups ?? new Set(te.value.keys())
			};
			let t = 0, n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
			for (let [e, r] of O.value) {
				let i = ne(r, re.value);
				n.set(e, +!!i), i && t++;
			}
			for (let [e, t] of te.value) for (let r of t) if (n.get(r) > 0) {
				i.add(e);
				break;
			}
			return {
				count: t,
				items: n,
				groups: i
			};
		}), ae = cc();
		return Ca(() => {
			ae?.exposed && (ae.exposed.highlightItem = a.value?.highlightItem, ae.exposed.highlightFirstItem = a.value?.highlightFirstItem, ae.exposed.highlightSelected = a.value?.highlightSelected);
		}), t({
			filtered: ie,
			highlightedElement: D,
			highlightItem: a.value?.highlightItem,
			highlightFirstItem: a.value?.highlightFirstItem,
			highlightSelected: a.value?.highlightSelected
		}), CP({
			modelValue: y,
			multiple: s,
			disabled: c,
			open: b,
			onOpenChange: x,
			...ee,
			contentId: "",
			isUserInputted: C,
			isVirtual: w,
			inputElement: T,
			highlightedElement: D,
			onInputElementChange: (e) => T.value = e,
			triggerElement: E,
			onTriggerElementChange: (e) => E.value = e,
			parentElement: o,
			resetSearchTermOnSelect: u,
			onResetSearchTerm: S.on,
			allItems: O,
			allGroups: te,
			filterSearch: re,
			filterState: ie,
			ignoreFilter: l,
			openOnFocus: d,
			openOnClick: f,
			resetModelValueOnClear: m,
			unmountOnHide: _
		}), (t, n) => (U(), G(R(cM), null, {
			default: z(() => [q(R($j), tc({
				ref_key: "primitiveElement",
				ref: a
			}, t.$attrs, {
				modelValue: R(y),
				"onUpdate:modelValue": n[0] ||= (e) => /* @__PURE__ */ Nn(y) ? y.value = e : null,
				style: { pointerEvents: R(b) ? "auto" : void 0 },
				as: e.as,
				"as-child": e.asChild,
				dir: R(v),
				multiple: R(s),
				name: e.name,
				required: e.required,
				disabled: R(c),
				"highlight-on-hover": R(h),
				loop: R(g),
				by: r.by,
				onHighlight: n[1] ||= (e) => i("highlight", e)
			}), {
				default: z(() => [V(t.$slots, "default", {
					open: R(b),
					modelValue: R(y)
				})]),
				_: 3
			}, 16, [
				"modelValue",
				"style",
				"as",
				"as-child",
				"dir",
				"multiple",
				"name",
				"required",
				"disabled",
				"highlight-on-hover",
				"loop",
				"by"
			])]),
			_: 3
		}));
	}
}), TP = /* @__PURE__ */ B({
	__name: "ComboboxAnchor",
	props: {
		reference: {
			type: null,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let { forwardRef: t } = DA();
		return (n, r) => (U(), G(R(lM), {
			"as-child": "",
			reference: e.reference
		}, {
			default: z(() => [q(R($A), tc({
				ref: R(t),
				"as-child": e.asChild,
				as: e.as
			}, n.$attrs), {
				default: z(() => [V(n.$slots, "default")]),
				_: 3
			}, 16, ["as-child", "as"])]),
			_: 3
		}, 8, ["reference"]));
	}
}), [EP, DP] = /*#__PURE__*/ bk("ComboboxContent"), OP = /* @__PURE__ */ B({
	__name: "ComboboxContentImpl",
	props: {
		position: {
			type: String,
			required: !1,
			default: "inline"
		},
		bodyLock: {
			type: Boolean,
			required: !1
		},
		hideWhenEmpty: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1
		},
		present: {
			type: Boolean,
			required: !1,
			default: !0
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, { position: i } = /* @__PURE__ */ Un(n), a = SP(), o = Symbol("ComboboxContent");
		Qr(i, (e) => a.onContentPositionChange(o, e), { immediate: !0 });
		let s = Y(() => a.ignoreFilter.value ? a.allItems.value.size === 0 : a.filterState.value.count === 0), { forwardRef: c, currentElement: l } = DA(), u = pA(n.present && n.bodyLock);
		Qr([() => n.present, () => n.bodyLock], ([e, t]) => u.value = e && t), wA(), zA(Y(() => n.present ? a.parentElement.value : void 0));
		let d = OA(Y(() => {
			if (n.position === "popper") {
				let { present: e, ...t } = n;
				return t;
			}
			return {};
		})), f = {
			boxSizing: "border-box",
			"--reka-combobox-content-transform-origin": "var(--reka-popper-transform-origin)",
			"--reka-combobox-content-available-width": "var(--reka-popper-available-width)",
			"--reka-combobox-content-available-height": "var(--reka-popper-available-height)",
			"--reka-combobox-trigger-width": "var(--reka-popper-anchor-width)",
			"--reka-combobox-trigger-height": "var(--reka-popper-anchor-height)"
		};
		DP({ position: i });
		let p = /* @__PURE__ */ L(!1);
		Ca(() => {
			a.inputElement.value && (p.value = l.value.contains(a.inputElement.value), n.present && p.value && a.inputElement.value.focus());
		}), Qr(() => n.present, async (e, t) => {
			if (e || !t) return;
			let n = xk();
			n && l.value.contains(n) && (await Sr(), a.triggerElement.value?.focus());
		}), Da(() => {
			a.onContentUnmount(o);
			let e = xk();
			p.value && (!e || e === document.body) && a.triggerElement.value?.focus();
		});
		function m(e) {
			if (a.parentElement.value?.contains(e)) return !0;
			let t = (e instanceof Element ? e.closest("label") : null)?.control;
			return !!t && !!a.parentElement.value?.contains(t);
		}
		let h = { placed: () => a.onContentPlaced(o) };
		return (t, o) => (U(), G(R(eM), { "as-child": "" }, {
			default: z(() => [q(R(Cj), {
				"as-child": "",
				present: n.present,
				onMountAutoFocus: o[5] ||= Ru(() => {}, ["prevent"]),
				onUnmountAutoFocus: o[6] ||= Ru(() => {}, ["prevent"])
			}, {
				default: z(() => [q(R(cj), {
					"as-child": "",
					present: n.present,
					"disable-outside-pointer-events": e.disableOutsidePointerEvents,
					onDismiss: o[0] ||= (e) => R(a).onOpenChange(!1),
					onFocusOutside: o[1] ||= (e) => {
						m(e.target) && e.preventDefault(), r("focusOutside", e);
					},
					onInteractOutside: o[2] ||= (e) => r("interactOutside", e),
					onEscapeKeyDown: o[3] ||= (e) => r("escapeKeyDown", e),
					onPointerDownOutside: o[4] ||= (e) => {
						m(e.target) && e.preventDefault(), r("pointerDownOutside", e);
					}
				}, {
					default: z(() => [(U(), G(Ia(R(i) === "popper" ? R(bP) : R($A)), tc({
						...t.$attrs,
						...R(d)
					}, {
						id: R(a).contentId,
						ref: R(c),
						"memo-dependencies": R(i) === "popper" ? [R(a).filterSearch.value, R(a).filterState.value] : void 0,
						"data-state": R(a).open.value ? "open" : "closed",
						"data-empty": s.value ? "" : void 0,
						style: {
							display: n.hideWhenEmpty && s.value ? "none" : "flex",
							flexDirection: "column",
							outline: "none",
							...R(i) === "popper" ? f : {}
						}
					}, Ua(R(i) === "popper" ? h : {})), {
						default: z(() => [V(t.$slots, "default")]),
						_: 3
					}, 16, [
						"id",
						"memo-dependencies",
						"data-state",
						"data-empty",
						"style"
					]))]),
					_: 3
				}, 8, ["present", "disable-outside-pointer-events"])]),
				_: 3
			}, 8, ["present"])]),
			_: 3
		}));
	}
}), kP = /* @__PURE__ */ B({
	__name: "ComboboxContent",
	props: {
		forceMount: {
			type: Boolean,
			required: !1
		},
		position: {
			type: String,
			required: !1
		},
		bodyLock: {
			type: Boolean,
			required: !1
		},
		hideWhenEmpty: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside"
	],
	setup(e, { emit: t }) {
		let n = kA(e, t), { forwardRef: r } = DA(), i = SP();
		return i.contentId ||= VA(void 0, "reka-combobox-content"), (t, a) => (U(), G(R(XA), {
			present: e.forceMount || R(i).open.value,
			"force-mount": e.forceMount || !R(i).unmountOnHide.value
		}, {
			default: z(({ present: e }) => [Hr(q(OP, tc({
				...R(n),
				...t.$attrs
			}, {
				ref: R(r),
				present: R(i).unmountOnHide.value || e
			}), {
				default: z(() => [V(t.$slots, "default")]),
				_: 3
			}, 16, ["present"]), [[hl, R(i).unmountOnHide.value || e]])]),
			_: 3
		}, 8, ["present", "force-mount"]));
	}
}), AP = /* @__PURE__ */ B({
	__name: "ComboboxEmpty",
	props: {
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let t = e, n = SP(), r = Y(() => n.ignoreFilter.value ? n.allItems.value.size === 0 : n.filterState.value.count === 0);
		return (e, n) => r.value ? (U(), G(R($A), He(tc({ key: 0 }, t)), {
			default: z(() => [V(e.$slots, "default", {}, () => [n[0] ||= Xs("No options", -1)])]),
			_: 3
		}, 16)) : J("v-if", !0);
	}
}), [jP, MP] = /*#__PURE__*/ bk("ComboboxGroup"), NP = /* @__PURE__ */ B({
	__name: "ComboboxInput",
	props: {
		displayValue: {
			type: Function,
			required: !1
		},
		modelValue: {
			type: String,
			required: !1
		},
		autoFocus: {
			type: Boolean,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "input"
		}
	},
	emits: ["update:modelValue"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = SP(), a = Yj(), { primitiveElement: o, currentElement: s } = ej(), c = Zk(n, "modelValue", r, { passive: n.modelValue === void 0 });
		Ca(() => {
			s.value && i.onInputElementChange(s.value);
		});
		let { isComposing: l, shouldDeferInput: u, handleCompositionStart: d, handleCompositionUpdate: f, handleCompositionEnd: p } = yA((e) => {
			let t = e.target;
			t && h(t.value);
		});
		function m(e) {
			l.value || (e.preventDefault(), i.open.value || i.onOpenChange(!0));
		}
		function h(e) {
			i.open.value ? i.filterSearch.value = e : (i.onOpenChange(!0), Sr(() => {
				e && (i.filterSearch.value = e, a.highlightFirstItem());
			}));
		}
		function g(e) {
			u.value || h(e.target.value);
		}
		function _() {
			i.openOnFocus.value && !i.open.value && i.onOpenChange(!0);
		}
		function v(e) {
			if (!i.open.value) return;
			let t = e.relatedTarget;
			if (!t) return;
			let n = i.parentElement.value?.contains(t), r = document.getElementById(i.contentId)?.contains(t);
			!n && !r && requestAnimationFrame(() => {
				if (!i.open.value) return;
				let e = document.activeElement;
				!i.parentElement.value?.contains(e) && !document.getElementById(i.contentId)?.contains(e) && i.onOpenChange(!1);
			});
		}
		function y() {
			i.openOnClick.value && !i.open.value && i.onOpenChange(!0);
		}
		function b() {
			let e = i.modelValue.value;
			n.displayValue ? c.value = n.displayValue(e) : !i.multiple.value && e && !Array.isArray(e) ? typeof e == "object" ? c.value = "" : c.value = e.toString() : c.value = "", Sr(() => {
				c.value = c.value;
			});
		}
		return i.onResetSearchTerm(() => {
			b();
		}), Qr(i.modelValue, async () => {
			!i.isUserInputted.value && i.resetSearchTermOnSelect.value && b();
		}, {
			immediate: !0,
			deep: !0
		}), Qr(i.filterState, (e, t) => {
			!i.isVirtual.value && t.count === 0 && a.highlightFirstItem();
		}), (t, n) => (U(), G(R(tM), {
			ref_key: "primitiveElement",
			ref: o,
			modelValue: R(c),
			"onUpdate:modelValue": n[0] ||= (e) => /* @__PURE__ */ Nn(c) ? c.value = e : null,
			as: e.as,
			"as-child": e.asChild,
			"auto-focus": e.autoFocus,
			disabled: e.disabled,
			"aria-expanded": R(i).open.value,
			"aria-controls": R(i).contentId,
			"aria-autocomplete": "list",
			role: "combobox",
			autocomplete: "off",
			onClick: y,
			onInput: g,
			onKeydown: Bu(m, ["down", "up"]),
			onFocus: _,
			onBlur: v,
			onCompositionstart: R(d),
			onCompositionupdate: R(f),
			onCompositionend: R(p)
		}, {
			default: z(() => [V(t.$slots, "default")]),
			_: 3
		}, 8, [
			"modelValue",
			"as",
			"as-child",
			"auto-focus",
			"disabled",
			"aria-expanded",
			"aria-controls",
			"onCompositionstart",
			"onCompositionupdate",
			"onCompositionend"
		]));
	}
}), PP = /* @__PURE__ */ B({
	__name: "ComboboxItem",
	props: {
		textValue: {
			type: String,
			required: !1
		},
		value: {
			type: null,
			required: !0
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: ["select"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = VA(void 0, "reka-combobox-item"), a = SP(), o = jP(null), { primitiveElement: s, currentElement: c } = ej();
		if (n.value === "") throw Error("A <ComboboxItem /> must have a value prop that is not an empty string. This is because the Combobox value can be set to an empty string to clear the selection and show the placeholder.");
		let l = Y(() => {
			if (a.isVirtual.value || a.ignoreFilter.value || !a.filterSearch.value) return !0;
			{
				let e = a.filterState.value.items.get(i);
				return e === void 0 || e > 0;
			}
		});
		return Ca(() => {
			a.allItems.value.set(i, n.textValue || c.value.textContent || c.value.innerText);
			let e = o?.id;
			e && (a.allGroups.value.has(e) ? a.allGroups.value.get(e)?.add(i) : a.allGroups.value.set(e, /* @__PURE__ */ new Set([i])));
		}), Da(() => {
			a.allItems.value.delete(i);
		}), (t, o) => l.value ? Ac([
			l.value,
			R(a).filterSearch.value,
			R(a).disabled.value,
			e.disabled,
			n.value,
			n.as,
			n.asChild,
			...Object.values(t.$attrs)
		], () => (U(), G(R(aM), tc({ key: 0 }, n, {
			id: R(i),
			ref_key: "primitiveElement",
			ref: s,
			disabled: R(a).disabled.value || e.disabled,
			onSelect: o[0] ||= (t) => {
				r("select", t), !t.defaultPrevented && (!R(a).multiple.value && !e.disabled && !R(a).disabled.value ? (t.preventDefault(), R(a).onOpenChange(!1), R(a).modelValue.value = n.value) : R(a).multiple.value && R(a).inputElement.value?.focus());
			}
		}), {
			default: z((n) => [V(t.$slots, "default", He(Js(n)), () => [Xs(F(e.value), 1)])]),
			_: 3
		}, 16, ["id", "disabled"])), o, 1) : J("v-if", !0);
	}
}), FP = /* @__PURE__ */ B({
	__name: "ComboboxPortal",
	props: {
		to: {
			type: null,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		defer: {
			type: Boolean,
			required: !1
		},
		forceMount: {
			type: Boolean,
			required: !1
		}
	},
	setup(e) {
		let t = e;
		return (e, n) => (U(), G(R(Fj), He(Js(t)), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), IP = /* @__PURE__ */ B({
	__name: "ComboboxTrigger",
	props: {
		disabled: {
			type: Boolean,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "button"
		}
	},
	setup(e) {
		let t = e, { forwardRef: n, currentElement: r } = DA(), i = SP(), a = Y(() => t.disabled || i.disabled.value || !1);
		return Ca(() => {
			r.value && i.onTriggerElementChange(r.value);
		}), (r, o) => (U(), G(R($A), tc(t, {
			ref: R(n),
			type: e.as === "button" ? "button" : void 0,
			tabindex: "-1",
			"aria-label": "Show popup",
			"aria-haspopup": "listbox",
			"aria-expanded": R(i).open.value,
			"aria-controls": R(i).contentId,
			"data-state": R(i).open.value ? "open" : "closed",
			disabled: a.value,
			"data-disabled": a.value ? "" : void 0,
			"aria-disabled": a.value ?? void 0,
			onClick: o[0] ||= (e) => R(i).onOpenChange(!R(i).open.value)
		}), {
			default: z(() => [V(r.$slots, "default")]),
			_: 3
		}, 16, [
			"type",
			"aria-expanded",
			"aria-controls",
			"data-state",
			"disabled",
			"data-disabled",
			"aria-disabled"
		]));
	}
});
// node_modules/reka-ui/dist/shared/useNonce.js
function LP(e) {
	let t = nA({ nonce: /* @__PURE__ */ L() });
	return Y(() => e?.value || t.nonce?.value);
}
// node_modules/reka-ui/dist/Combobox/ComboboxViewport.js
var RP = /* @__PURE__ */ B({
	__name: "ComboboxViewport",
	props: {
		nonce: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let t = e, { forwardRef: n } = DA(), { nonce: r } = /* @__PURE__ */ Un(t), i = LP(r), a = SP();
		return (e, r) => (U(), W(H, null, [q(R($A), tc({
			...e.$attrs,
			...t
		}, {
			ref: R(n),
			"data-reka-combobox-viewport": "",
			role: "presentation",
			style: {
				position: "relative",
				flex: R(a).isVirtual.value ? void 0 : 1,
				overflow: "auto"
			}
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16, ["style"]), q(R($A), {
			as: "style",
			nonce: R(i)
		}, {
			default: z(() => [...r[0] ||= [Xs(" /* Hide scrollbars cross-browser and enable momentum scroll for touch devices */ [data-reka-combobox-viewport] { scrollbar-width:none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; } [data-reka-combobox-viewport]::-webkit-scrollbar { display: none; } ", -1)]]),
			_: 1
		}, 8, ["nonce"])], 64));
	}
}), [zP, BP] = /*#__PURE__*/ bk("RovingFocusGroup"), VP = /* @__PURE__ */ B({
	__name: "RovingFocusGroup",
	props: {
		orientation: {
			type: String,
			required: !1,
			default: void 0
		},
		dir: {
			type: String,
			required: !1
		},
		loop: {
			type: Boolean,
			required: !1,
			default: !1
		},
		currentTabStopId: {
			type: [String, null],
			required: !1
		},
		defaultCurrentTabStopId: {
			type: String,
			required: !1
		},
		preventScrollOnEntryFocus: {
			type: Boolean,
			required: !1,
			default: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: ["entryFocus", "update:currentTabStopId"],
	setup(e, { expose: t, emit: n }) {
		let r = e, i = n, { loop: a, orientation: o, dir: s } = /* @__PURE__ */ Un(r), c = bA(s), l = Zk(r, "currentTabStopId", i, {
			defaultValue: r.defaultCurrentTabStopId,
			passive: r.currentTabStopId === void 0
		}), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(0), { getItems: p, CollectionSlot: m } = Lj({ isProvider: !0 });
		function h(e) {
			let t = !d.value;
			if (e.currentTarget && e.target === e.currentTarget && t && !u.value) {
				let t = new CustomEvent(Uj, Wj);
				if (e.currentTarget.dispatchEvent(t), i("entryFocus", t), !t.defaultPrevented) {
					let e = p().map((e) => e.ref).filter((e) => e.dataset.disabled !== "");
					Jj([
						e.find((e) => e.getAttribute("data-active") === ""),
						e.find((e) => e.getAttribute("data-highlighted") === ""),
						e.find((e) => e.id === l.value),
						...e
					].filter(Boolean), r.preventScrollOnEntryFocus);
				}
			}
			d.value = !1;
		}
		function g() {
			setTimeout(() => {
				d.value = !1;
			}, 1);
		}
		return t({ getItems: p }), BP({
			loop: a,
			dir: c,
			orientation: o,
			currentTabStopId: l,
			onItemFocus: (e) => {
				l.value = e;
			},
			onItemShiftTab: () => {
				u.value = !0;
			},
			onFocusableItemAdd: () => {
				f.value++;
			},
			onFocusableItemRemove: () => {
				f.value--;
			}
		}), (t, n) => (U(), G(R(m), null, {
			default: z(() => [q(R($A), {
				tabindex: u.value || f.value === 0 ? -1 : 0,
				"data-orientation": R(o),
				as: e.as,
				"as-child": e.asChild,
				dir: R(c),
				style: { outline: "none" },
				onMousedown: n[0] ||= (e) => d.value = !0,
				onMouseup: g,
				onFocus: h,
				onBlur: n[1] ||= (e) => u.value = !1
			}, {
				default: z(() => [V(t.$slots, "default")]),
				_: 3
			}, 8, [
				"tabindex",
				"data-orientation",
				"as",
				"as-child",
				"dir"
			])]),
			_: 3
		}));
	}
}), [HP, UP] = /*#__PURE__*/ bk("FieldRoot"), WP = /* @__PURE__ */ B({
	__name: "MenuAnchor",
	props: {
		reference: {
			type: null,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let t = e;
		return (e, n) => (U(), G(R(lM), He(Js(t)), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
});
// node_modules/reka-ui/dist/shared/useIsUsingKeyboard.js
function GP() {
	let e = /* @__PURE__ */ L(!1);
	return Ca(() => {
		Wk("keydown", () => {
			e.value = !0;
		}, {
			capture: !0,
			passive: !0
		}), Wk(["pointerdown", "pointermove"], () => {
			e.value = !1;
		}, {
			capture: !0,
			passive: !0
		});
	}), e;
}
var KP = Fk(GP), [qP, JP] = /*#__PURE__*/ bk(["MenuRoot", "MenuSub"], "MenuContext"), [YP, XP] = /*#__PURE__*/ bk("MenuRoot"), ZP = /* @__PURE__ */ B({
	__name: "MenuRoot",
	props: {
		open: {
			type: Boolean,
			required: !1,
			default: !1
		},
		dir: {
			type: String,
			required: !1
		},
		modal: {
			type: Boolean,
			required: !1,
			default: !0
		}
	},
	emits: ["update:open"],
	setup(e, { emit: t }) {
		let n = e, r = t, { modal: i, dir: a } = /* @__PURE__ */ Un(n), o = bA(a), s = Zk(n, "open", r), c = /* @__PURE__ */ L(), l = KP();
		return JP({
			open: s,
			onOpenChange: (e) => {
				s.value = e;
			},
			content: c,
			onContentChange: (e) => {
				c.value = e;
			}
		}), XP({
			onClose: () => {
				s.value = !1;
			},
			isUsingKeyboardRef: l,
			dir: o,
			modal: i
		}), (e, t) => (U(), G(R(cM), null, {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}));
	}
}), [QP, $P] = /*#__PURE__*/ bk("MenuContent"), eF = /* @__PURE__ */ B({
	__name: "MenuContentImpl",
	props: /* @__PURE__ */ oo({
		loop: {
			type: Boolean,
			required: !1
		},
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1
		},
		disableOutsideScroll: {
			type: Boolean,
			required: !1
		},
		trapFocus: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	}, { ..._P }),
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"entryFocus",
		"openAutoFocus",
		"closeAutoFocus",
		"dismiss"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = qP(), a = YP(), { trapFocus: o, disableOutsidePointerEvents: s, loop: c } = /* @__PURE__ */ Un(n);
		wA(), pA(s.value);
		let l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(0), d = /* @__PURE__ */ L(0), f = /* @__PURE__ */ L(null), p = /* @__PURE__ */ L("right"), m = /* @__PURE__ */ L(0), h = /* @__PURE__ */ L(null), g = /* @__PURE__ */ L(), { forwardRef: _, currentElement: v } = DA(), { handleTypeaheadSearch: y } = GA(), b = /* @__PURE__ */ L();
		function x(e) {
			let t = eA(e, b.value || xk(), v.value, {
				loop: c.value,
				arrowKeyOptions: "vertical",
				dir: a?.dir.value,
				focus: !1,
				attributeName: "[data-reka-collection-item]:not([data-disabled])"
			});
			t && (b.value = t, t.scrollIntoView({ block: "nearest" }));
		}
		function S() {
			b.value && b.value.click();
		}
		let C = /* @__PURE__ */ L(), w = /* @__PURE__ */ L();
		Qr(b, (e) => {
			if (w.value && (e === void 0 || e !== w.value.trigger.value)) {
				if (e === void 0) return;
				w.value.onOpenChange(!1), w.value = void 0;
			}
		}), Qr(v, (e) => {
			i.onContentChange(e);
		}), Da(() => {
			window.clearTimeout(u.value);
		});
		function T(e) {
			return p.value === f.value?.side && Nj(e, f.value?.area);
		}
		async function E(e) {
			r("openAutoFocus", e), !e.defaultPrevented && (e.preventDefault(), v.value?.focus({ preventScroll: !0 }));
		}
		function D(e) {
			if (e.defaultPrevented) return;
			let t = e.target, n = t.closest("[data-reka-menu-content]") === e.currentTarget, r = ["input", "textarea"].includes(t.tagName.toLowerCase()), i = e.ctrlKey || e.altKey || e.metaKey, o = e.key.length === 1, s = eA(e, xk(), v.value, {
				loop: c.value,
				arrowKeyOptions: "vertical",
				dir: a?.dir.value,
				focus: !0,
				attributeName: "[data-reka-collection-item]:not([data-disabled])"
			});
			if (s) return s?.focus();
			if (e.code === "Space") return;
			let l = g.value?.getItems() ?? [];
			if (n && (e.key === "Tab" && a.modal.value && e.preventDefault(), !i && o && !r && y(e.key, l)), e.target !== v.value || !Oj.includes(e.key)) return;
			e.preventDefault();
			let u = [...l.map((e) => e.ref)];
			Dj.includes(e.key) && u.reverse(), jj(u);
		}
		function ee(e) {
			e?.currentTarget?.contains?.(e.target) || (window.clearTimeout(u.value), l.value = "");
		}
		function O(e) {
			if (!Pj(e)) return;
			let t = e.target, n = m.value !== e.clientX;
			if ((e?.currentTarget)?.contains(t) && n) {
				let t = e.clientX > m.value ? "right" : "left";
				p.value = t, m.value = e.clientX;
			}
		}
		function te(e) {
			Pj(e) && C.value && C.value.focus();
		}
		return $P({
			onItemEnter: (e) => !!T(e),
			onItemLeave: (e) => T(e) ? !0 : (["INPUT", "TEXTAREA"].includes(xk()?.tagName || "") || v.value?.focus(), h.value = null, !1),
			onTriggerLeave: (e) => !!T(e),
			searchRef: l,
			highlightedElement: b,
			onKeydownNavigation: x,
			onKeydownEnter: S,
			filterElement: C,
			onFilterElementChange: (e) => {
				C.value = e;
			},
			activeSubmenuContext: w,
			pointerGraceTimerRef: d,
			onPointerGraceIntentChange: (e) => {
				f.value = e;
			}
		}), (t, n) => (U(), G(R(Cj), {
			"as-child": "",
			trapped: R(o),
			onMountAutoFocus: E,
			onUnmountAutoFocus: n[7] ||= (e) => r("closeAutoFocus", e)
		}, {
			default: z(() => [q(R(cj), {
				"as-child": "",
				"disable-outside-pointer-events": R(s),
				onEscapeKeyDown: n[2] ||= (e) => r("escapeKeyDown", e),
				onPointerDownOutside: n[3] ||= (e) => r("pointerDownOutside", e),
				onFocusOutside: n[4] ||= (e) => r("focusOutside", e),
				onInteractOutside: n[5] ||= (e) => r("interactOutside", e),
				onDismiss: n[6] ||= (e) => r("dismiss")
			}, {
				default: z(() => [q(R(VP), {
					ref_key: "rovingFocusGroupRef",
					ref: g,
					"current-tab-stop-id": h.value,
					"onUpdate:currentTabStopId": n[0] ||= (e) => h.value = e,
					"as-child": "",
					orientation: "vertical",
					dir: R(a).dir.value,
					loop: R(c),
					onEntryFocus: n[1] ||= (e) => {
						r("entryFocus", e), R(a).isUsingKeyboardRef.value || e.preventDefault();
					}
				}, {
					default: z(() => [q(R(bP), {
						ref: R(_),
						role: "menu",
						as: e.as,
						"as-child": e.asChild,
						"aria-orientation": "vertical",
						"data-reka-menu-content": "",
						"data-state": R(kj)(R(i).open.value),
						dir: R(a).dir.value,
						side: e.side,
						"side-offset": e.sideOffset,
						align: e.align,
						"align-offset": e.alignOffset,
						"avoid-collisions": e.avoidCollisions,
						"collision-boundary": e.collisionBoundary,
						"collision-padding": e.collisionPadding,
						"arrow-padding": e.arrowPadding,
						"prioritize-position": e.prioritizePosition,
						"position-strategy": e.positionStrategy,
						"update-position-strategy": e.updatePositionStrategy,
						sticky: e.sticky,
						"hide-when-detached": e.hideWhenDetached,
						reference: e.reference,
						onKeydown: D,
						onBlur: ee,
						onPointermove: O,
						onPointerenter: te
					}, {
						default: z(() => [V(t.$slots, "default")]),
						_: 3
					}, 8, [
						"as",
						"as-child",
						"data-state",
						"dir",
						"side",
						"side-offset",
						"align",
						"align-offset",
						"avoid-collisions",
						"collision-boundary",
						"collision-padding",
						"arrow-padding",
						"prioritize-position",
						"position-strategy",
						"update-position-strategy",
						"sticky",
						"hide-when-detached",
						"reference"
					])]),
					_: 3
				}, 8, [
					"current-tab-stop-id",
					"dir",
					"loop"
				])]),
				_: 3
			}, 8, ["disable-outside-pointer-events"])]),
			_: 3
		}, 8, ["trapped"]));
	}
}), tF = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "MenuItemImpl",
	props: {
		disabled: {
			type: Boolean,
			required: !1
		},
		textValue: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let t = e, n = QP(), { forwardRef: r, currentElement: i } = DA(), { CollectionItem: a } = Lj(), o = /* @__PURE__ */ L(!1), s = Y(() => o.value || i.value != null && n.highlightedElement.value === i.value);
		async function c(e) {
			if (!e.defaultPrevented && Pj(e)) {
				if (t.disabled) n.onItemLeave(e);
				else if (!n.onItemEnter(e)) {
					let t = e.currentTarget;
					n.highlightedElement.value = t, ["INPUT", "TEXTAREA"].includes(xk()?.tagName || "") || t.focus({ preventScroll: !0 });
				}
			}
		}
		async function l(e) {
			await Sr(), !e.defaultPrevented && Pj(e) && n.highlightedElement.value === i.value && !n.onItemLeave(e) && n.highlightedElement.value === i.value && (n.highlightedElement.value = void 0);
		}
		return (t, i) => (U(), G(R(a), { value: { textValue: e.textValue } }, {
			default: z(() => [q(R($A), tc({
				ref: R(r),
				role: "menuitem",
				tabindex: "-1"
			}, t.$attrs, {
				as: e.as,
				"as-child": e.asChild,
				"aria-disabled": e.disabled || void 0,
				"data-disabled": e.disabled ? "" : void 0,
				"data-highlighted": s.value ? "" : void 0,
				onPointermove: c,
				onPointerleave: l,
				onFocus: i[0] ||= async (t) => {
					let r = t.currentTarget;
					await Sr(), !(t.defaultPrevented || e.disabled) && (o.value = !0, R(n).highlightedElement.value = r);
				},
				onBlur: i[1] ||= async (e) => {
					await Sr(), !e.defaultPrevented && (o.value = !1);
				}
			}), {
				default: z(() => [V(t.$slots, "default")]),
				_: 3
			}, 16, [
				"as",
				"as-child",
				"aria-disabled",
				"data-disabled",
				"data-highlighted"
			])]),
			_: 3
		}, 8, ["value"]));
	}
}), nF = /* @__PURE__ */ B({
	__name: "MenuItem",
	props: {
		disabled: {
			type: Boolean,
			required: !1
		},
		textValue: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: ["select"],
	setup(e, { emit: t }) {
		let n = e, r = t, { forwardRef: i, currentElement: a } = DA(), o = YP(), s = QP(), c = /* @__PURE__ */ L(!1);
		async function l() {
			let e = a.value;
			if (!n.disabled && e) {
				let e = new CustomEvent(wj, {
					bubbles: !0,
					cancelable: !0
				});
				r("select", e), await Sr(), e.defaultPrevented ? c.value = !1 : o.onClose();
			}
		}
		return (t, r) => (U(), G(tF, tc(n, {
			ref: R(i),
			onClick: l,
			onPointerdown: r[0] ||= () => {
				c.value = !0;
			},
			onPointerup: r[1] ||= async (e) => {
				await Sr(), e.defaultPrevented || c.value || e.currentTarget?.click();
			},
			onKeydown: r[2] ||= async (t) => {
				let n = R(s).searchRef.value !== "";
				e.disabled || n && t.key === " " || R(Tj).includes(t.key) && (t.currentTarget?.click(), t.preventDefault());
			}
		}), {
			default: z(() => [V(t.$slots, "default")]),
			_: 3
		}, 16));
	}
}), rF = /* @__PURE__ */ B({
	__name: "MenuRootContentModal",
	props: {
		loop: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"entryFocus",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = kA(n, r), a = qP(), { forwardRef: o, currentElement: s } = DA();
		return zA(s), (e, t) => (U(), G(eF, tc(R(i), {
			ref: R(o),
			"trap-focus": R(a).open.value,
			"disable-outside-pointer-events": R(a).open.value,
			"disable-outside-scroll": !0,
			onDismiss: t[0] ||= (e) => R(a).onOpenChange(!1),
			onFocusOutside: t[1] ||= Ru((e) => r("focusOutside", e), ["prevent"])
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16, ["trap-focus", "disable-outside-pointer-events"]));
	}
}), iF = /* @__PURE__ */ B({
	__name: "MenuRootContentNonModal",
	props: {
		loop: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"entryFocus",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(e, { emit: t }) {
		let n = kA(e, t), r = qP();
		return (e, t) => (U(), G(eF, tc(R(n), {
			"trap-focus": !1,
			"disable-outside-pointer-events": !1,
			"disable-outside-scroll": !1,
			onDismiss: t[0] ||= (e) => R(r).onOpenChange(!1)
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), aF = /* @__PURE__ */ B({
	__name: "MenuContent",
	props: {
		forceMount: {
			type: Boolean,
			required: !1
		},
		loop: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"entryFocus",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(e, { emit: t }) {
		let n = kA(e, t), r = qP(), i = YP();
		return (t, a) => (U(), G(R(XA), { present: e.forceMount || R(r).open.value }, {
			default: z(() => [R(i).modal.value ? (U(), G(rF, He(tc({ key: 0 }, {
				...t.$attrs,
				...R(n)
			})), {
				default: z(() => [V(t.$slots, "default")]),
				_: 3
			}, 16)) : (U(), G(iF, He(tc({ key: 1 }, {
				...t.$attrs,
				...R(n)
			})), {
				default: z(() => [V(t.$slots, "default")]),
				_: 3
			}, 16))]),
			_: 3
		}, 8, ["present"]));
	}
}), oF = /* @__PURE__ */ B({
	__name: "MenuPortal",
	props: {
		to: {
			type: null,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		defer: {
			type: Boolean,
			required: !1
		},
		forceMount: {
			type: Boolean,
			required: !1
		}
	},
	setup(e) {
		let t = e;
		return (e, n) => (U(), G(R(Fj), He(Js(t)), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), [sF, cF] = /*#__PURE__*/ bk("PopoverRoot"), lF = /* @__PURE__ */ B({
	__name: "PopoverRoot",
	props: {
		defaultOpen: {
			type: Boolean,
			required: !1,
			default: !1
		},
		open: {
			type: Boolean,
			required: !1,
			default: void 0
		},
		modal: {
			type: Boolean,
			required: !1,
			default: !1
		}
	},
	emits: ["update:open"],
	setup(e, { emit: t }) {
		let n = e, r = t, { modal: i } = /* @__PURE__ */ Un(n), a = Zk(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		});
		return cF({
			contentId: "",
			triggerId: "",
			modal: i,
			open: a,
			onOpenChange: (e) => {
				a.value = e;
			},
			onOpenToggle: () => {
				a.value = !a.value;
			},
			triggerElement: /* @__PURE__ */ L(),
			hasCustomAnchor: /* @__PURE__ */ L(!1)
		}), (e, t) => (U(), G(R(cM), null, {
			default: z(() => [V(e.$slots, "default", {
				open: R(a),
				close: () => a.value = !1
			})]),
			_: 3
		}));
	}
}), uF = /* @__PURE__ */ B({
	__name: "PopoverContentImpl",
	props: {
		trapFocus: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = OA(Rk(n, "trapFocus", "disableOutsidePointerEvents")), { forwardRef: a } = DA(), o = sF();
		return wA(), (t, n) => (U(), G(R(Cj), {
			"as-child": "",
			loop: "",
			trapped: e.trapFocus,
			onMountAutoFocus: n[5] ||= (e) => r("openAutoFocus", e),
			onUnmountAutoFocus: n[6] ||= (e) => r("closeAutoFocus", e)
		}, {
			default: z(() => [q(R(cj), {
				"as-child": "",
				"disable-outside-pointer-events": e.disableOutsidePointerEvents,
				onPointerDownOutside: n[0] ||= (e) => r("pointerDownOutside", e),
				onInteractOutside: n[1] ||= (e) => r("interactOutside", e),
				onEscapeKeyDown: n[2] ||= (e) => r("escapeKeyDown", e),
				onFocusOutside: n[3] ||= (e) => r("focusOutside", e),
				onDismiss: n[4] ||= (e) => R(o).onOpenChange(!1)
			}, {
				default: z(() => [q(R(bP), tc(R(i), {
					id: R(o).contentId,
					ref: R(a),
					"data-state": R(o).open.value ? "open" : "closed",
					"aria-labelledby": R(o).triggerId,
					style: {
						"--reka-popover-content-transform-origin": "var(--reka-popper-transform-origin)",
						"--reka-popover-content-available-width": "var(--reka-popper-available-width)",
						"--reka-popover-content-available-height": "var(--reka-popper-available-height)",
						"--reka-popover-trigger-width": "var(--reka-popper-anchor-width)",
						"--reka-popover-trigger-height": "var(--reka-popper-anchor-height)"
					},
					role: "dialog"
				}), {
					default: z(() => [V(t.$slots, "default")]),
					_: 3
				}, 16, [
					"id",
					"data-state",
					"aria-labelledby"
				])]),
				_: 3
			}, 8, ["disable-outside-pointer-events"])]),
			_: 3
		}, 8, ["trapped"]));
	}
}), dF = /* @__PURE__ */ B({
	__name: "PopoverContentModal",
	props: {
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = sF(), a = /* @__PURE__ */ L(!1);
		pA(!0);
		let o = kA(n, r), { forwardRef: s, currentElement: c } = DA();
		return zA(c), (e, t) => (U(), G(uF, tc(R(o), {
			ref: R(s),
			"trap-focus": R(i).open.value,
			"disable-outside-pointer-events": "",
			onCloseAutoFocus: t[0] ||= Ru((e) => {
				r("closeAutoFocus", e), a.value || R(i).triggerElement.value?.focus();
			}, ["prevent"]),
			onPointerDownOutside: t[1] ||= (e) => {
				r("pointerDownOutside", e);
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, i = t.button === 2 || n;
				a.value = i;
			},
			onFocusOutside: t[2] ||= Ru(() => {}, ["prevent"])
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16, ["trap-focus"]));
	}
}), fF = /* @__PURE__ */ B({
	__name: "PopoverContentNonModal",
	props: {
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = sF(), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(!1), s = kA(n, r);
		return (e, t) => (U(), G(uF, tc(R(s), {
			"trap-focus": !1,
			"disable-outside-pointer-events": !1,
			onCloseAutoFocus: t[0] ||= (e) => {
				r("closeAutoFocus", e), e.defaultPrevented || (a.value || R(i).triggerElement.value?.focus(), e.preventDefault()), a.value = !1, o.value = !1;
			},
			onInteractOutside: t[1] ||= async (e) => {
				r("interactOutside", e), e.defaultPrevented || (a.value = !0, e.detail.originalEvent.type === "pointerdown" && (o.value = !0));
				let t = e.target;
				R(i).triggerElement.value?.contains(t) && e.preventDefault(), e.detail.originalEvent.type === "focusin" && o.value && e.preventDefault();
			}
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), pF = /* @__PURE__ */ B({
	__name: "PopoverContent",
	props: {
		forceMount: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = sF(), a = kA(n, r), { forwardRef: o } = DA();
		return i.contentId ||= VA(void 0, "reka-popover-content"), (t, n) => (U(), G(R(XA), { present: e.forceMount || R(i).open.value }, {
			default: z(() => [R(i).modal.value ? (U(), G(dF, tc({ key: 0 }, R(a), { ref: R(o) }), {
				default: z(() => [V(t.$slots, "default")]),
				_: 3
			}, 16)) : (U(), G(fF, tc({ key: 1 }, R(a), { ref: R(o) }), {
				default: z(() => [V(t.$slots, "default")]),
				_: 3
			}, 16))]),
			_: 3
		}, 8, ["present"]));
	}
}), mF = /* @__PURE__ */ B({
	__name: "PopoverPortal",
	props: {
		to: {
			type: null,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		defer: {
			type: Boolean,
			required: !1
		},
		forceMount: {
			type: Boolean,
			required: !1
		}
	},
	setup(e) {
		let t = e;
		return (e, n) => (U(), G(R(Fj), He(Js(t)), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), hF = /* @__PURE__ */ B({
	__name: "PopoverTrigger",
	props: {
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "button"
		}
	},
	setup(e) {
		let t = e, n = sF(), { forwardRef: r, currentElement: i } = DA();
		return n.triggerId ||= VA(void 0, "reka-popover-trigger"), n.contentId ||= VA(void 0, "reka-popover-content"), Ca(() => {
			n.triggerElement.value = i.value;
		}), (i, a) => (U(), G(Ia(R(n).hasCustomAnchor.value ? R($A) : R(lM)), { "as-child": "" }, {
			default: z(() => [q(R($A), {
				id: R(n).triggerId,
				ref: R(r),
				type: e.as === "button" ? "button" : void 0,
				"aria-haspopup": "dialog",
				"aria-expanded": R(n).open.value,
				"aria-controls": R(n).open.value ? R(n).contentId : void 0,
				"data-state": R(n).open.value ? "open" : "closed",
				as: e.as,
				"as-child": t.asChild,
				onClick: R(n).onOpenToggle
			}, {
				default: z(() => [V(i.$slots, "default")]),
				_: 3
			}, 8, [
				"id",
				"type",
				"aria-expanded",
				"aria-controls",
				"data-state",
				"as",
				"as-child",
				"onClick"
			])]),
			_: 3
		}));
	}
}), [gF, _F] = /*#__PURE__*/ bk("DropdownMenuRoot"), vF = /* @__PURE__ */ B({
	__name: "DropdownMenuRoot",
	props: {
		defaultOpen: {
			type: Boolean,
			required: !1
		},
		open: {
			type: Boolean,
			required: !1,
			default: void 0
		},
		dir: {
			type: String,
			required: !1
		},
		modal: {
			type: Boolean,
			required: !1,
			default: !0
		}
	},
	emits: ["update:open"],
	setup(e, { emit: t }) {
		let n = e, r = t;
		DA();
		let i = Zk(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), a = /* @__PURE__ */ L(), { modal: o, dir: s } = /* @__PURE__ */ Un(n), c = bA(s);
		return _F({
			open: i,
			onOpenChange: (e) => {
				i.value = e;
			},
			onOpenToggle: () => {
				i.value = !i.value;
			},
			triggerId: "",
			triggerElement: a,
			contentId: "",
			modal: o,
			dir: c
		}), (e, t) => (U(), G(R(ZP), {
			open: R(i),
			"onUpdate:open": t[0] ||= (e) => /* @__PURE__ */ Nn(i) ? i.value = e : null,
			dir: R(c),
			modal: R(o)
		}, {
			default: z(() => [V(e.$slots, "default", { open: R(i) })]),
			_: 3
		}, 8, [
			"open",
			"dir",
			"modal"
		]));
	}
}), yF = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "DropdownMenuContent",
	props: {
		forceMount: {
			type: Boolean,
			required: !1
		},
		loop: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(e, { emit: t }) {
		let n = kA(e, t);
		DA();
		let r = gF(), i = /* @__PURE__ */ L(!1);
		function a(e) {
			e.defaultPrevented || (i.value || setTimeout(() => {
				r.triggerElement.value?.focus();
			}, 0), i.value = !1, e.preventDefault());
		}
		return r.contentId ||= VA(void 0, "reka-dropdown-menu-content"), (e, t) => (U(), G(R(aF), tc({
			id: R(r).contentId,
			"aria-labelledby": R(r)?.triggerId,
			style: {
				"--reka-dropdown-menu-content-transform-origin": "var(--reka-popper-transform-origin)",
				"--reka-dropdown-menu-content-available-width": "var(--reka-popper-available-width)",
				"--reka-dropdown-menu-content-available-height": "var(--reka-popper-available-height)",
				"--reka-dropdown-menu-trigger-width": "var(--reka-popper-anchor-width)",
				"--reka-dropdown-menu-trigger-height": "var(--reka-popper-anchor-height)"
			}
		}, {
			...R(n),
			...R(Aj)(e.$attrs)
		}, {
			onCloseAutoFocus: a,
			onInteractOutside: t[0] ||= (e) => {
				if (e.defaultPrevented) return;
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, a = t.button === 2 || n;
				(!R(r).modal.value || a) && (i.value = !0), R(r).triggerElement.value?.contains(e.target) && e.preventDefault();
			}
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16, ["id", "aria-labelledby"]));
	}
}), bF = /* @__PURE__ */ B({
	__name: "DropdownMenuItem",
	props: {
		disabled: {
			type: Boolean,
			required: !1
		},
		textValue: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: ["select"],
	setup(e, { emit: t }) {
		let n = e, r = xA(t);
		return DA(), (e, t) => (U(), G(R(nF), He(Js({
			...n,
			...R(r)
		})), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), xF = /* @__PURE__ */ B({
	__name: "DropdownMenuPortal",
	props: {
		to: {
			type: null,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		defer: {
			type: Boolean,
			required: !1
		},
		forceMount: {
			type: Boolean,
			required: !1
		}
	},
	setup(e) {
		let t = e;
		return (e, n) => (U(), G(R(oF), He(Js(t)), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), SF = /* @__PURE__ */ B({
	__name: "DropdownMenuTrigger",
	props: {
		disabled: {
			type: Boolean,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "button"
		}
	},
	setup(e) {
		let t = e, n = gF(), { forwardRef: r, currentElement: i } = DA();
		return Ca(() => {
			n.triggerElement = i;
		}), n.triggerId ||= VA(void 0, "reka-dropdown-menu-trigger"), (i, a) => (U(), G(R(WP), { "as-child": "" }, {
			default: z(() => [q(R($A), {
				id: R(n).triggerId,
				ref: R(r),
				type: e.as === "button" ? "button" : void 0,
				"as-child": t.asChild,
				as: e.as,
				"aria-haspopup": "menu",
				"aria-expanded": R(n).open.value,
				"aria-controls": R(n).open.value ? R(n).contentId : void 0,
				"data-disabled": e.disabled ? "" : void 0,
				disabled: e.disabled,
				"data-state": R(n).open.value ? "open" : "closed",
				onClick: a[0] ||= async (t) => {
					t.defaultPrevented || !e.disabled && t.button === 0 && t.ctrlKey === !1 && (R(n)?.onOpenToggle(), await Sr(), R(n).open.value && t.preventDefault());
				},
				onKeydown: a[1] ||= Bu((t) => {
					e.disabled || t.defaultPrevented || (["Enter", " "].includes(t.key) && R(n).onOpenToggle(), t.key === "ArrowDown" && R(n).onOpenChange(!0), [
						"Enter",
						" ",
						"ArrowDown"
					].includes(t.key) && t.preventDefault());
				}, [
					"enter",
					"space",
					"arrow-down"
				])
			}, {
				default: z(() => [V(i.$slots, "default")]),
				_: 3
			}, 8, [
				"id",
				"type",
				"as-child",
				"as",
				"aria-expanded",
				"aria-controls",
				"data-disabled",
				"disabled",
				"data-state"
			])]),
			_: 3
		}));
	}
}), CF = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], wF = [" ", "Enter"];
function TF(e, t, n) {
	return e === void 0 ? !1 : Array.isArray(e) ? e.some((e) => EF(e, t, n)) : EF(e, t, n);
}
function EF(e, t, n) {
	return e === void 0 || t === void 0 ? !1 : typeof e == "string" ? e === t : typeof n == "function" ? n(e, t) : typeof n == "string" ? e?.[n] === t?.[n] : _k(e, t);
}
function DF(e) {
	return e == null || e === "" || Array.isArray(e) && e.length === 0;
}
// node_modules/reka-ui/dist/Select/SelectRoot.js
var OF = ["value"], [kF, AF] = /*#__PURE__*/ bk("SelectRoot"), jF = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "SelectRoot",
	props: {
		open: {
			type: Boolean,
			required: !1,
			default: void 0
		},
		defaultOpen: {
			type: Boolean,
			required: !1
		},
		defaultValue: {
			type: null,
			required: !1
		},
		modelValue: {
			type: null,
			required: !1,
			default: void 0
		},
		nullableValue: {
			type: String,
			required: !1,
			default: ""
		},
		by: {
			type: [String, Function],
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		multiple: {
			type: Boolean,
			required: !1
		},
		autocomplete: {
			type: String,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		name: {
			type: String,
			required: !1
		},
		required: {
			type: Boolean,
			required: !1
		}
	},
	emits: ["update:modelValue", "update:open"],
	setup(e, { emit: t }) {
		let n = e, r = t, { multiple: i, dir: a } = /* @__PURE__ */ Un(n), o = HP(null), s = Y(() => n.name ?? o?.name.value), c = Y(() => o ? n.required || o.required.value : n.required), l = Y(() => !!(n.disabled || o?.disabled.value)), u = Zk(n, "modelValue", r, {
			defaultValue: n.defaultValue ?? (i.value ? [] : void 0),
			passive: n.modelValue === void 0,
			deep: !0
		}), d = Zk(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), f = /* @__PURE__ */ L(), p = /* @__PURE__ */ L(), m = /* @__PURE__ */ L({
			x: 0,
			y: 0
		}), h = Y(() => i.value && Array.isArray(u.value) ? u.value?.length === 0 : Ck(u.value));
		Qr(u, () => {
			o?.reportControlState({ filled: !h.value });
		}), Lj({ isProvider: !0 });
		let g = bA(a), _ = EA(f), v = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), y = Y(() => Array.from(v.value).map((e) => e.value).join(";"));
		function b(e) {
			let t;
			if (i.value) {
				let r = Array.isArray(u.value) ? [...u.value] : [], i = r.findIndex((t) => EF(t, e, n.by));
				i === -1 ? r.push(e) : r.splice(i, 1), t = [...r];
			} else t = e;
			u.value = t, o?.handleControlInput({ value: t });
		}
		function x(e) {
			return Array.from(v.value).find((t) => TF(e, t.value, n.by));
		}
		return AF({
			triggerElement: f,
			onTriggerChange: (e) => {
				f.value = e;
			},
			valueElement: p,
			onValueElementChange: (e) => {
				p.value = e;
			},
			contentId: "",
			modelValue: u,
			onValueChange: b,
			by: n.by,
			open: d,
			multiple: i,
			required: c,
			onOpenChange: (e) => {
				d.value = e;
			},
			dir: g,
			triggerPointerDownPosRef: m,
			disabled: l,
			isEmptyModelValue: h,
			optionsSet: v,
			onOptionAdd: (e) => {
				let t = x(e.value);
				t && v.value.delete(t), v.value.add(e);
			},
			onOptionRemove: (e) => {
				let t = x(e.value);
				t && v.value.delete(t);
			}
		}), (t, n) => (U(), G(R(cM), null, {
			default: z(() => [V(t.$slots, "default", {
				modelValue: R(u),
				open: R(d)
			}), R(_) && s.value ? (U(), G(MF, {
				key: y.value,
				"aria-hidden": "true",
				tabindex: "-1",
				multiple: R(i),
				required: c.value,
				name: s.value,
				autocomplete: e.autocomplete,
				disabled: l.value,
				value: R(u)
			}, {
				default: z(() => [R(Ck)(R(u)) ? (U(), W("option", {
					key: 0,
					value: e.nullableValue
				}, null, 8, OF)) : J("v-if", !0), (U(!0), W(H, null, Ba(Array.from(v.value), (e) => (U(), W("option", tc({ key: e.value ?? "" }, { ref_for: !0 }, e), null, 16))), 128))]),
				_: 1
			}, 8, [
				"multiple",
				"required",
				"name",
				"autocomplete",
				"disabled",
				"value"
			])) : J("v-if", !0)]),
			_: 3
		}));
	}
}), MF = /* @__PURE__ */ B({
	__name: "BubbleSelect",
	props: {
		autocomplete: {
			type: String,
			required: !1
		},
		autofocus: {
			type: Boolean,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		form: {
			type: String,
			required: !1
		},
		multiple: {
			type: Boolean,
			required: !1
		},
		name: {
			type: String,
			required: !1
		},
		required: {
			type: Boolean,
			required: !1
		},
		size: {
			type: Number,
			required: !1
		},
		value: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let t = e, n = /* @__PURE__ */ L(), r = kF();
		Qr(() => t.value, (e, t) => {
			let r = window.HTMLSelectElement.prototype, i = Object.getOwnPropertyDescriptor(r, "value").set;
			if (e !== t && i && n.value) {
				let t = new Event("change", { bubbles: !0 });
				i.call(n.value, e), n.value.dispatchEvent(t);
			}
		});
		function i(e) {
			r.onValueChange(e.target.value);
		}
		return (e, r) => (U(), G(R(Rj), { "as-child": "" }, {
			default: z(() => [K("select", tc({
				ref_key: "selectElement",
				ref: n
			}, t, { onInput: i }), [V(e.$slots, "default")], 16)]),
			_: 3
		}));
	}
}), NF = /* @__PURE__ */ B({
	__name: "SelectPopperPosition",
	props: {
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1,
			default: "start"
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1,
			default: 10
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let t = OA(e);
		return (e, n) => (U(), G(R(bP), tc(R(t), { style: {
			boxSizing: "border-box",
			"--reka-select-content-transform-origin": "var(--reka-popper-transform-origin)",
			"--reka-select-content-available-width": "var(--reka-popper-available-width)",
			"--reka-select-content-available-height": "var(--reka-popper-available-height)",
			"--reka-select-trigger-width": "var(--reka-popper-anchor-width)",
			"--reka-select-trigger-height": "var(--reka-popper-anchor-height)"
		} }), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), PF = {
	onViewportChange: () => {},
	itemTextRefCallback: () => {},
	itemRefCallback: () => {}
}, [FF, IF] = /*#__PURE__*/ bk("SelectContent"), LF = /* @__PURE__ */ B({
	__name: "SelectContentImpl",
	props: {
		position: {
			type: String,
			required: !1,
			default: "item-aligned"
		},
		bodyLock: {
			type: Boolean,
			required: !1,
			default: !0
		},
		loop: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1,
			default: "start"
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1,
			default: !0
		}
	},
	emits: [
		"closeAutoFocus",
		"escapeKeyDown",
		"pointerDownOutside"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = kF();
		wA(), pA(n.bodyLock);
		let { CollectionSlot: a, getItems: o } = Lj(), s = /* @__PURE__ */ L();
		zA(s);
		let { search: c, handleTypeaheadSearch: l } = GA(), u = /* @__PURE__ */ L(), d = /* @__PURE__ */ L(), f = /* @__PURE__ */ L(), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ L(!1), h = /* @__PURE__ */ L(!1);
		function g() {
			d.value && s.value && jj([d.value, s.value]);
		}
		Qr(p, () => {
			g();
		});
		let { onOpenChange: _, triggerPointerDownPosRef: v } = i;
		Yr((e) => {
			if (!s.value) return;
			let t = {
				x: 0,
				y: 0
			}, n = (e) => {
				t = {
					x: Math.abs(Math.round(e.pageX) - (v.value?.x ?? 0)),
					y: Math.abs(Math.round(e.pageY) - (v.value?.y ?? 0))
				};
			}, r = (e) => {
				e.pointerType !== "touch" && (t.x <= 10 && t.y <= 10 ? e.preventDefault() : s.value?.contains(e.target) || _(!1), document.removeEventListener("pointermove", n), v.value = null);
			};
			v.value !== null && (document.addEventListener("pointermove", n), document.addEventListener("pointerup", r, {
				capture: !0,
				once: !0
			})), e(() => {
				document.removeEventListener("pointermove", n), document.removeEventListener("pointerup", r, { capture: !0 });
			});
		});
		function y(e) {
			let t = e.ctrlKey || e.altKey || e.metaKey;
			if (e.key === "Tab" && e.preventDefault(), e.code === "Space") {
				if (c.value === "") return;
				e.preventDefault();
			}
			if (!t && e.key.length === 1 && l(e.key, o()), [
				"ArrowUp",
				"ArrowDown",
				"Home",
				"End"
			].includes(e.key)) {
				let t = [...o().map((e) => e.ref)];
				if (["ArrowUp", "End"].includes(e.key) && (t = t.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(e.key)) {
					let r = e.target, i = t.indexOf(r);
					t = n.loop ? KA(t, i + 1) : t.slice(i + 1);
				}
				setTimeout(() => jj(t)), e.preventDefault();
			}
		}
		let b = Rk(n, "loop"), x = OA(Y(() => n.position === "popper" ? b : {}).value);
		return IF({
			content: s,
			viewport: u,
			onViewportChange: (e) => {
				u.value = e;
			},
			itemRefCallback: (e, t, n) => {
				let r = !m.value && !n, a = TF(i.modelValue.value, t, i.by);
				if (i.multiple.value) {
					if (h.value) return;
					(a || r) && (d.value = e, a && (h.value = !0));
				} else (a || r) && (d.value = e);
				r && (m.value = !0);
			},
			selectedItem: d,
			selectedItemText: f,
			onItemLeave: () => {
				s.value?.focus();
			},
			itemTextRefCallback: (e, t, n) => {
				let r = !m.value && !n;
				(TF(i.modelValue.value, t, i.by) || r) && (f.value = e);
			},
			focusSelectedItem: g,
			position: n.position,
			isPositioned: p,
			searchRef: c
		}), (t, n) => (U(), G(R(a), null, {
			default: z(() => [q(R(Cj), {
				"as-child": "",
				onMountAutoFocus: n[6] ||= Ru(() => {}, ["prevent"]),
				onUnmountAutoFocus: n[7] ||= (e) => {
					r("closeAutoFocus", e), !e.defaultPrevented && (R(i).triggerElement.value?.focus({ preventScroll: !0 }), e.preventDefault());
				}
			}, {
				default: z(() => [q(R(cj), {
					"as-child": "",
					"disable-outside-pointer-events": e.disableOutsidePointerEvents,
					onFocusOutside: n[2] ||= Ru(() => {}, ["prevent"]),
					onDismiss: n[3] ||= (e) => R(i).onOpenChange(!1),
					onEscapeKeyDown: n[4] ||= (e) => r("escapeKeyDown", e),
					onPointerDownOutside: n[5] ||= (e) => r("pointerDownOutside", e)
				}, {
					default: z(() => [(U(), G(Ia(e.position === "popper" ? NF : BF), tc({
						...t.$attrs,
						...R(x)
					}, {
						id: R(i).contentId,
						ref: (e) => {
							if (!e) return;
							let t = R(Uk)(e);
							t?.hasAttribute("data-reka-popper-content-wrapper") ? s.value = t.firstElementChild : s.value = t;
						},
						role: "listbox",
						"data-state": R(i).open.value ? "open" : "closed",
						dir: R(i).dir.value,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none"
						},
						onContextmenu: n[0] ||= Ru(() => {}, ["prevent"]),
						onPlaced: n[1] ||= (e) => p.value = !0,
						onKeydown: y
					}), {
						default: z(() => [V(t.$slots, "default")]),
						_: 3
					}, 16, [
						"id",
						"data-state",
						"dir",
						"onKeydown"
					]))]),
					_: 3
				}, 8, ["disable-outside-pointer-events"])]),
				_: 3
			})]),
			_: 3
		}));
	}
}), [RF, zF] = /*#__PURE__*/ bk("SelectItemAlignedPosition"), BF = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "SelectItemAlignedPosition",
	props: {
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: ["placed"],
	setup(e, { emit: t }) {
		let n = e, r = t, { getItems: i } = Lj(), a = kF(), o = FF(), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(!0), l = /* @__PURE__ */ L(), { forwardRef: u, currentElement: d } = DA(), { viewport: f, selectedItem: p, selectedItemText: m, focusSelectedItem: h } = o;
		function g() {
			if (a.triggerElement.value && a.valueElement.value && l.value && d.value && f?.value && p?.value && m?.value) {
				let e = a.triggerElement.value.getBoundingClientRect(), t = d.value.getBoundingClientRect(), n = a.valueElement.value.getBoundingClientRect(), o = m.value.getBoundingClientRect();
				if (a.dir.value !== "rtl") {
					let r = o.left - t.left, i = n.left - r, a = e.left - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = yk(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.left = `${d}px`;
				} else {
					let r = t.right - o.right, i = window.innerWidth - n.right - r, a = window.innerWidth - e.right - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = yk(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.right = `${d}px`;
				}
				let c = i().map((e) => e.ref), u = window.innerHeight - 20, h = f.value.scrollHeight, g = window.getComputedStyle(d.value), _ = Number.parseInt(g.borderTopWidth, 10), v = Number.parseInt(g.paddingTop, 10), y = Number.parseInt(g.borderBottomWidth, 10), b = Number.parseInt(g.paddingBottom, 10), x = _ + v + h + b + y, S = Math.min(p.value.offsetHeight * 5, x), C = window.getComputedStyle(f.value), w = Number.parseInt(C.paddingTop, 10), T = Number.parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - 10, D = u - E, ee = p.value.offsetHeight / 2, O = p.value.offsetTop + ee, te = _ + v + O, ne = x - te;
				if (te <= E) {
					let e = p.value === c.at(-1);
					l.value.style.bottom = "0px";
					let t = d.value.clientHeight - f.value.offsetTop - f.value.offsetHeight, n = te + Math.max(D, ee + (e ? T : 0) + t + y);
					l.value.style.height = `${n}px`;
				} else {
					let e = p.value === c[0];
					l.value.style.top = "0px";
					let t = Math.max(E, _ + f.value.offsetTop + (e ? w : 0) + ee) + ne;
					l.value.style.height = `${t}px`, f.value.scrollTop = te - E + f.value.offsetTop;
				}
				l.value.style.margin = "10px 0", l.value.style.minHeight = `${S}px`, l.value.style.maxHeight = `${u}px`, r("placed"), requestAnimationFrame(() => s.value = !0);
			}
		}
		let _ = /* @__PURE__ */ L("");
		Ca(async () => {
			await Sr(), g(), d.value && (_.value = window.getComputedStyle(d.value).zIndex);
		});
		function v(e) {
			e && c.value === !0 && (g(), h?.(), c.value = !1);
		}
		return Xk(a.triggerElement, () => {
			g();
		}), zF({
			contentWrapper: l,
			shouldExpandOnScrollRef: s,
			onScrollButtonChange: v
		}), (e, t) => (U(), W("div", {
			ref_key: "contentWrapperElement",
			ref: l,
			style: Ie({
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: _.value
			})
		}, [q(R($A), tc({
			ref: R(u),
			style: {
				boxSizing: "border-box",
				maxHeight: "100%"
			}
		}, {
			...e.$attrs,
			...n
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16)], 4));
	}
}), VF = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "SelectProvider",
	props: { context: {
		type: Object,
		required: !0
	} },
	setup(e) {
		return AF(e.context), IF(PF), (e, t) => V(e.$slots, "default");
	}
}), HF = { key: 1 }, UF = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "SelectContent",
	props: {
		forceMount: {
			type: Boolean,
			required: !1
		},
		position: {
			type: String,
			required: !1
		},
		bodyLock: {
			type: Boolean,
			required: !1
		},
		loop: {
			type: Boolean,
			required: !1
		},
		memoDependencies: {
			type: Array,
			required: !1
		},
		side: {
			type: null,
			required: !1
		},
		sideOffset: {
			type: Number,
			required: !1
		},
		sideFlip: {
			type: Boolean,
			required: !1
		},
		align: {
			type: null,
			required: !1
		},
		alignOffset: {
			type: Number,
			required: !1
		},
		alignFlip: {
			type: Boolean,
			required: !1
		},
		avoidCollisions: {
			type: Boolean,
			required: !1
		},
		collisionBoundary: {
			type: null,
			required: !1
		},
		collisionPadding: {
			type: [Number, Object],
			required: !1
		},
		arrowPadding: {
			type: Number,
			required: !1
		},
		hideShiftedArrow: {
			type: Boolean,
			required: !1
		},
		sticky: {
			type: String,
			required: !1
		},
		hideWhenDetached: {
			type: Boolean,
			required: !1
		},
		positionStrategy: {
			type: String,
			required: !1
		},
		updatePositionStrategy: {
			type: String,
			required: !1
		},
		disableUpdateOnLayoutShift: {
			type: Boolean,
			required: !1
		},
		prioritizePosition: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		dir: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		},
		disableOutsidePointerEvents: {
			type: Boolean,
			required: !1
		}
	},
	emits: [
		"closeAutoFocus",
		"escapeKeyDown",
		"pointerDownOutside"
	],
	setup(e, { emit: t }) {
		let n = e, r = kA(n, t), i = kF(), a = /* @__PURE__ */ L();
		Ca(() => {
			a.value = new DocumentFragment();
		});
		let o = /* @__PURE__ */ L(), s = Y(() => n.forceMount || i.open.value), c = /* @__PURE__ */ L(s.value), l;
		function u() {
			l &&= (clearTimeout(l), void 0);
		}
		return Qr(s, (e, t, n) => {
			u(), l = setTimeout(() => {
				c.value = s.value, l = void 0;
			}), n(u);
		}), Da(u), (e, t) => s.value || c.value || o.value?.present ? (U(), G(R(XA), {
			key: 0,
			ref_key: "presenceRef",
			ref: o,
			present: s.value
		}, {
			default: z(() => [q(LF, He(Js({
				...R(r),
				...e.$attrs
			})), {
				default: z(() => [V(e.$slots, "default")]),
				_: 3
			}, 16)]),
			_: 3
		}, 8, ["present"])) : a.value ? (U(), W("div", HF, [(U(), G(pi, { to: a.value }, [q(VF, { context: R(i) }, {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 8, ["context"])], 8, ["to"]))])) : J("v-if", !0);
	}
}), [WF, GF] = /*#__PURE__*/ bk("SelectItem"), KF = /* @__PURE__ */ B({
	__name: "SelectItem",
	props: {
		value: {
			type: null,
			required: !0
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		textValue: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	emits: ["select"],
	setup(e, { emit: t }) {
		let n = e, r = t, { disabled: i } = /* @__PURE__ */ Un(n), a = kF(), o = FF(), { forwardRef: s, currentElement: c } = DA(), { CollectionItem: l } = Lj(), u = Y(() => TF(a.modelValue?.value, n.value, a.by)), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(n.textValue ?? ""), p = VA(void 0, "reka-select-item-text");
		async function m(e) {
			e.defaultPrevented || Sk("select.select", h, {
				originalEvent: e,
				value: n.value
			});
		}
		async function h(e) {
			await Sr(), r("select", e), e.defaultPrevented || i.value || (a.onValueChange(n.value), a.multiple.value || a.onOpenChange(!1));
		}
		async function g(e) {
			await Sr(), !e.defaultPrevented && (i.value ? o.onItemLeave?.() : e.currentTarget?.focus({ preventScroll: !0 }));
		}
		async function _(e) {
			await Sr(), !e.defaultPrevented && e.currentTarget === xk() && o.onItemLeave?.();
		}
		async function v(e) {
			await Sr(), e.defaultPrevented || o.searchRef?.value !== "" && e.key === " " || (wF.includes(e.key) && m(e), e.key === " " && e.preventDefault());
		}
		if (n.value === "") throw Error("A <SelectItem /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
		return Ca(() => {
			c.value && o.itemRefCallback(c.value, n.value, n.disabled);
		}), GF({
			value: n.value,
			disabled: i,
			textId: p,
			isSelected: u,
			onItemTextChange: (e) => {
				f.value = ((f.value || e?.textContent) ?? "").trim();
			}
		}), (t, n) => (U(), G(R(l), { value: { textValue: f.value } }, {
			default: z(() => [q(R($A), {
				ref: R(s),
				role: "option",
				"aria-labelledby": R(p),
				"data-highlighted": d.value ? "" : void 0,
				"aria-selected": u.value,
				"data-state": u.value ? "checked" : "unchecked",
				"aria-disabled": R(i) || void 0,
				"data-disabled": R(i) ? "" : void 0,
				tabindex: R(i) ? void 0 : -1,
				as: e.as,
				"as-child": e.asChild,
				onFocus: n[0] ||= (e) => d.value = !0,
				onBlur: n[1] ||= (e) => d.value = !1,
				onPointerup: m,
				onPointerdown: n[2] ||= (e) => {
					e.currentTarget.focus({ preventScroll: !0 });
				},
				onTouchend: n[3] ||= Ru(() => {}, ["prevent", "stop"]),
				onPointermove: g,
				onPointerleave: _,
				onKeydown: v
			}, {
				default: z(() => [V(t.$slots, "default", { selected: u.value })]),
				_: 3
			}, 8, [
				"aria-labelledby",
				"data-highlighted",
				"aria-selected",
				"data-state",
				"aria-disabled",
				"data-disabled",
				"tabindex",
				"as",
				"as-child"
			])]),
			_: 3
		}, 8, ["value"]));
	}
}), qF = /* @__PURE__ */ B({
	inheritAttrs: !1,
	__name: "SelectItemText",
	props: {
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "span"
		}
	},
	setup(e) {
		let t = e, n = kF(), r = FF(), i = WF(), { forwardRef: a, currentElement: o } = DA(), s = Y(() => ({
			value: i.value,
			disabled: i.disabled.value,
			textContent: o.value?.textContent ?? i.value?.toString() ?? ""
		}));
		return Ca(() => {
			o.value && (i.onItemTextChange(o.value), r.itemTextRefCallback(o.value, i.value, i.disabled.value), n.onOptionAdd(s.value));
		}), Da(() => {
			n.onOptionRemove(s.value);
		}), (e, n) => (U(), G(R($A), tc({
			id: R(i).textId,
			ref: R(a)
		}, {
			...t,
			...e.$attrs
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16, ["id"]));
	}
}), JF = /* @__PURE__ */ B({
	__name: "SelectPortal",
	props: {
		to: {
			type: null,
			required: !1
		},
		disabled: {
			type: Boolean,
			required: !1
		},
		defer: {
			type: Boolean,
			required: !1
		},
		forceMount: {
			type: Boolean,
			required: !1
		}
	},
	setup(e) {
		let t = e;
		return (e, n) => (U(), G(R(Fj), He(Js(t)), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), YF = /* @__PURE__ */ B({
	__name: "SelectTrigger",
	props: {
		disabled: {
			type: Boolean,
			required: !1
		},
		reference: {
			type: null,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "button"
		}
	},
	setup(e) {
		let t = e, n = kF(), { forwardRef: r, currentElement: i } = DA(), a = Y(() => n.disabled?.value || t.disabled);
		n.contentId ||= VA(void 0, "reka-select-content"), Ca(() => {
			n.onTriggerChange(i.value);
		});
		let o = HP(null), s = ro();
		function c() {
			return s.id ?? o?.fieldId.value;
		}
		function l() {
			let e = (e, t) => [e, t].filter(Boolean).join(" ") || void 0;
			return {
				...o?.dataAttributes.value,
				id: c(),
				"aria-labelledby": e(s["aria-labelledby"], o?.labelId.value),
				"aria-describedby": e(s["aria-describedby"], o?.describedBy.value),
				"aria-invalid": s["aria-invalid"] ?? (o?.invalid.value || void 0)
			};
		}
		function u() {
			o?.handleControlFocus();
		}
		function d() {
			o?.handleControlBlur();
		}
		let f;
		Ca(() => {
			f = o?.registerControl({
				id: c,
				element: () => i.value,
				getValue: () => n.modelValue.value,
				required: () => !!n.required?.value
			});
		}), Ea(() => f?.());
		let { getItems: p } = Lj(), { search: m, handleTypeaheadSearch: h, resetTypeahead: g } = GA();
		function _() {
			a.value || (n.onOpenChange(!0), g());
		}
		function v(e) {
			_(), n.triggerPointerDownPosRef.value = {
				x: Math.round(e.pageX),
				y: Math.round(e.pageY)
			};
		}
		function y(e) {
			return e.button === 0 && e.ctrlKey === !1;
		}
		let b = !1;
		function x(e) {
			if (e.defaultPrevented) return;
			if (e.pointerType === "touch") return e.preventDefault();
			let t = e.target;
			t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), y(e) && (v(e), b = !0);
		}
		function S(e) {
			e.defaultPrevented || y(e) && e.preventDefault();
		}
		function C(e) {
			e.defaultPrevented || b || e.currentTarget?.focus(), b = !1;
		}
		function w(e) {
			e.defaultPrevented || (e.preventDefault(), e.pointerType === "touch" && v(e));
		}
		function T(e) {
			if (e.defaultPrevented) return;
			let t = m.value !== "";
			!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && h(e.key, p()), !(t && e.key === " ") && CF.includes(e.key) && (_(), e.preventDefault());
		}
		return (t, i) => (U(), G(R(lM), {
			"as-child": "",
			reference: e.reference
		}, {
			default: z(() => [q(R($A), tc(l(), {
				ref: R(r),
				role: "combobox",
				type: e.as === "button" ? "button" : void 0,
				"aria-controls": R(n).open.value ? R(n).contentId : void 0,
				"aria-expanded": R(n).open.value || !1,
				"aria-required": R(n).required?.value,
				"aria-autocomplete": "none",
				disabled: a.value,
				dir: R(n)?.dir.value,
				"data-state": R(n)?.open.value ? "open" : "closed",
				"data-disabled": a.value ? "" : void 0,
				"data-placeholder": R(DF)(R(n).modelValue?.value) ? "" : void 0,
				"as-child": e.asChild,
				as: e.as,
				onClick: C,
				onPointerdown: x,
				onMousedown: S,
				onFocus: u,
				onBlur: d,
				onPointerup: w,
				onKeydown: T
			}), {
				default: z(() => [V(t.$slots, "default")]),
				_: 3
			}, 16, [
				"type",
				"aria-controls",
				"aria-expanded",
				"aria-required",
				"disabled",
				"dir",
				"data-state",
				"data-disabled",
				"data-placeholder",
				"as-child",
				"as"
			])]),
			_: 3
		}, 8, ["reference"]));
	}
}), XF = /* @__PURE__ */ B({
	__name: "SelectValue",
	props: {
		placeholder: {
			type: String,
			required: !1,
			default: ""
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1,
			default: "span"
		}
	},
	setup(e) {
		let t = e, { forwardRef: n, currentElement: r } = DA(), i = kF();
		Ca(() => {
			i.valueElement = r;
		});
		let a = Y(() => {
			let e = [], t = Array.from(i.optionsSet.value), n = (e) => t.find((t) => TF(e, t.value, i.by));
			return e = Array.isArray(i.modelValue.value) ? i.modelValue.value.map((e) => n(e)?.textContent ?? "") : [n(i.modelValue.value)?.textContent ?? ""], e.filter(Boolean);
		}), o = Y(() => a.value.length ? a.value.join(", ") : t.placeholder);
		return (r, s) => (U(), G(R($A), {
			ref: R(n),
			as: e.as,
			"as-child": e.asChild,
			style: { pointerEvents: "none" },
			"data-placeholder": a.value.length ? void 0 : t.placeholder
		}, {
			default: z(() => [V(r.$slots, "default", {
				selectedLabel: a.value,
				modelValue: R(i).modelValue.value
			}, () => [Xs(F(o.value), 1)])]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"data-placeholder"
		]));
	}
}), ZF = /* @__PURE__ */ B({
	__name: "SelectViewport",
	props: {
		nonce: {
			type: String,
			required: !1
		},
		asChild: {
			type: Boolean,
			required: !1
		},
		as: {
			type: null,
			required: !1
		}
	},
	setup(e) {
		let t = e, { nonce: n } = /* @__PURE__ */ Un(t), r = LP(n), i = FF(), a = i.position === "item-aligned" ? RF() : void 0, { forwardRef: o, currentElement: s } = DA();
		Ca(() => {
			i?.onViewportChange(s.value);
		});
		let c = /* @__PURE__ */ L(0);
		function l(e) {
			let t = e.currentTarget, { shouldExpandOnScrollRef: n, contentWrapper: r } = a ?? {};
			if (n?.value && r?.value) {
				let e = Math.abs(c.value - t.scrollTop);
				if (e > 0) {
					let n = window.innerHeight - 20, i = Number.parseFloat(r.value.style.minHeight), a = Number.parseFloat(r.value.style.height), o = Math.max(i, a);
					if (o < n) {
						let i = o + e, a = Math.min(n, i), s = i - a;
						r.value.style.height = `${a}px`, r.value.style.bottom === "0px" && (t.scrollTop = s > 0 ? s : 0, r.value.style.justifyContent = "flex-end");
					}
				}
			}
			c.value = t.scrollTop;
		}
		return (e, n) => (U(), W(H, null, [q(R($A), tc({
			ref: R(o),
			"data-reka-select-viewport": "",
			role: "presentation"
		}, {
			...e.$attrs,
			...t
		}, {
			style: {
				position: "relative",
				flex: 1,
				overflow: "hidden auto"
			},
			onScroll: l
		}), {
			default: z(() => [V(e.$slots, "default")]),
			_: 3
		}, 16), q(R($A), {
			as: "style",
			nonce: R(r)
		}, {
			default: z(() => [...n[0] ||= [Xs(" /* Hide scrollbars cross-browser and enable momentum scroll for touch devices */ [data-reka-select-viewport] { scrollbar-width:none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; } [data-reka-select-viewport]::-webkit-scrollbar { display: none; } ", -1)]]),
			_: 1
		}, 8, ["nonce"])], 64));
	}
}), QF = ["maxlength"], $F = { class: "trpg-confirm__actions" }, eI = ["disabled"], tI = /* @__PURE__ */ B({
	__name: "BranchPopover",
	props: {
		defaultName: {},
		disabled: { type: Boolean }
	},
	emits: ["create"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = Gr("portalTarget", void 0), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(null);
		async function c(e) {
			a.value = e, e && (o.value = n.defaultName, await Sr(), s.value?.focus(), s.value?.select());
		}
		function l() {
			let e = o.value.trim();
			e && (a.value = !1, r("create", e));
		}
		return (t, n) => (U(), G(R(lF), {
			open: a.value,
			"onUpdate:open": c
		}, {
			default: z(() => [q(R(hF), {
				class: "trpg-btn",
				disabled: e.disabled
			}, {
				default: z(() => [...n[4] ||= [Xs("分支存档", -1)]]),
				_: 1
			}, 8, ["disabled"]), q(R(mF), { to: R(i) }, {
				default: z(() => [q(R(pF), {
					class: "trpg-popover",
					align: "start",
					"side-offset": 6,
					"collision-padding": 8,
					onOpenAutoFocus: n[3] ||= Ru(() => {}, ["prevent"])
				}, {
					default: z(() => [K("form", {
						class: "trpg-field",
						onSubmit: Ru(l, ["prevent"])
					}, [
						n[5] ||= K("label", {
							class: "trpg-field__label",
							for: "trpg-branch-name"
						}, "新存档名", -1),
						Hr(K("input", {
							id: "trpg-branch-name",
							ref_key: "input",
							ref: s,
							"onUpdate:modelValue": n[0] ||= (e) => o.value = e,
							class: "trpg-input",
							maxlength: R(40),
							autocomplete: "off",
							onKeydown: n[1] ||= Bu(Ru((e) => a.value = !1, ["stop", "prevent"]), ["esc"])
						}, null, 40, QF), [[Cu, o.value]]),
						n[6] ||= K("span", { class: "trpg-field__hint" }, "原存档保持上次保存的样子；当前未保存的改动会进入新分支。", -1),
						K("div", $F, [K("button", {
							class: "trpg-btn",
							type: "button",
							onClick: n[2] ||= (e) => a.value = !1
						}, "取消"), K("button", {
							class: "trpg-btn trpg-btn--primary",
							type: "submit",
							disabled: !o.value.trim()
						}, "创建并切换", 8, eI)])
					], 32)]),
					_: 1
				})]),
				_: 1
			}, 8, ["to"])]),
			_: 1
		}, 8, ["open"]));
	}
}), nI = {
	key: 0,
	class: "trpg-menu__reason"
}, rI = /* @__PURE__ */ B({
	__name: "MoreMenu",
	props: {
		label: {},
		items: {}
	},
	emits: ["select"],
	setup(e) {
		let t = Gr("portalTarget", void 0);
		return (n, r) => (U(), G(R(vF), null, {
			default: z(() => [q(R(SF), {
				class: "trpg-icon-btn trpg-more",
				"aria-label": `${e.label} 的更多操作`
			}, {
				default: z(() => [q(FT, {
					name: "dots-three",
					size: 20
				})]),
				_: 1
			}, 8, ["aria-label"]), q(R(xF), { to: R(t) }, {
				default: z(() => [q(R(yF), {
					class: "trpg-menu",
					align: "end",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: z(() => [(U(!0), W(H, null, Ba(e.items, (e) => (U(), G(R(bF), {
						key: e.key,
						class: Ve(["trpg-menu__item", { "trpg-menu__item--danger": e.danger }]),
						disabled: e.disabled,
						onSelect: (t) => n.$emit("select", e.key)
					}, {
						default: z(() => [K("span", null, F(e.label), 1), e.disabled && e.reason ? (U(), W("span", nI, F(e.reason), 1)) : J("", !0)]),
						_: 2
					}, 1032, [
						"class",
						"disabled",
						"onSelect"
					]))), 128))]),
					_: 1
				})]),
				_: 1
			}, 8, ["to"])]),
			_: 1
		}));
	}
}), iI = {
	key: 0,
	class: "trpg-folds"
}, aI = {
	class: "trpg-folds__tabs",
	role: "group",
	"aria-label": "更多存档"
}, oI = ["aria-expanded"], sI = ["aria-expanded"], cI = ["aria-expanded"], lI = {
	key: 0,
	class: "trpg-list"
}, uI = { class: "trpg-row__main" }, dI = { class: "trpg-row__title" }, fI = {
	key: 0,
	class: "trpg-row__meta"
}, pI = { class: "trpg-row__end" }, mI = ["disabled", "onClick"], hI = { class: "trpg-list" }, gI = { class: "trpg-row__main" }, _I = { class: "trpg-row__title" }, vI = { class: "trpg-row__meta" }, yI = { class: "trpg-row__end" }, bI = ["disabled", "onClick"], xI = ["disabled", "onClick"], SI = ["disabled"], CI = {
	key: 2,
	class: "trpg-list"
}, wI = { class: "trpg-row__main" }, TI = { class: "trpg-row__title" }, EI = { class: "trpg-badge" }, DI = { class: "trpg-row__meta" }, OI = { class: "trpg-row__end" }, kI = [
	"disabled",
	"title",
	"onClick"
], AI = /* @__PURE__ */ B({
	__name: "SaveFolds",
	props: {
		autos: {},
		deleted: {},
		others: {},
		readOnly: { type: Boolean },
		ruleName: { type: Function },
		ruleInstalled: { type: Function }
	},
	emits: [
		"load",
		"auto-as-manual",
		"restore",
		"purge",
		"purge-all"
	],
	setup(e, { emit: t }) {
		let n = t, r = /* @__PURE__ */ L(null), i = (e) => r.value = r.value === e ? null : e;
		return (t, a) => e.autos.length || e.deleted.length || e.others.length ? (U(), W("div", iI, [
			K("div", aI, [
				e.autos.length ? (U(), W("button", {
					key: 0,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "auto",
					onClick: a[0] ||= (e) => i("auto")
				}, F(r.value === "auto" ? "▾" : "▸") + " 自动存档 " + F(e.autos.length), 9, oI)) : J("", !0),
				e.deleted.length ? (U(), W("button", {
					key: 1,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "deleted",
					onClick: a[1] ||= (e) => i("deleted")
				}, F(r.value === "deleted" ? "▾" : "▸") + " 最近删除 " + F(e.deleted.length), 9, sI)) : J("", !0),
				e.others.length ? (U(), W("button", {
					key: 2,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "other",
					onClick: a[2] ||= (e) => i("other")
				}, F(r.value === "other" ? "▾" : "▸") + " 其他规则 " + F(e.others.length), 9, cI)) : J("", !0)
			]),
			r.value === "auto" ? (U(), W("ul", lI, [(U(!0), W(H, null, Ba(e.autos, (t) => (U(), W("li", {
				key: t.id,
				class: "trpg-row"
			}, [K("div", uI, [K("div", dI, F(R(FE)(t.createdAt)) + " · " + F(t.autoReason), 1), R(RE)(t) ? (U(), W("div", fI, F(R(RE)(t)), 1)) : J("", !0)]), K("div", pI, [K("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("load", t)
			}, "读取", 8, mI), q(rI, {
				label: `自动存档 ${R(FE)(t.createdAt)}`,
				items: [{
					key: "manual",
					label: "另存为存档"
				}],
				onSelect: (e) => n("auto-as-manual", t)
			}, null, 8, ["label", "onSelect"])])]))), 128))])) : J("", !0),
			r.value === "deleted" ? (U(), W(H, { key: 1 }, [K("ul", hI, [(U(!0), W(H, null, Ba(e.deleted, (t) => (U(), W("li", {
				key: t.id,
				class: "trpg-row"
			}, [K("div", gI, [K("div", _I, F(t.name), 1), K("div", vI, "删除于 " + F(R(FE)(t.deletedAt ?? 0)), 1)]), K("div", yI, [K("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("restore", t)
			}, "恢复", 8, bI), K("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("purge", t)
			}, "彻底删除", 8, xI)])]))), 128))]), K("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				disabled: e.readOnly,
				onClick: a[3] ||= (e) => n("purge-all")
			}, "清空最近删除", 8, SI)], 64)) : J("", !0),
			r.value === "other" ? (U(), W("ul", CI, [(U(!0), W(H, null, Ba(e.others, (t) => (U(), W("li", {
				key: t.id,
				class: "trpg-row"
			}, [K("div", wI, [K("div", TI, [Xs(F(t.name) + " ", 1), K("span", EI, F(e.ruleName(t.ruleId)), 1)]), K("div", DI, F(t.ownerLabel) + " · " + F(R(FE)(t.updatedAt)), 1)]), K("div", OI, [K("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly || !e.ruleInstalled(t.ruleId),
				title: e.ruleInstalled(t.ruleId) ? void 0 : "规则未安装",
				onClick: (e) => n("load", t)
			}, F(e.ruleInstalled(t.ruleId) ? "切换规则并读取" : "规则未安装"), 9, kI)])]))), 128))])) : J("", !0)
		])) : J("", !0);
	}
}), jI = ["data-current", "data-testid"], MI = { class: "trpg-save__main" }, NI = { class: "trpg-save__top" }, PI = ["maxlength", "onKeydown"], FI = {
	key: 1,
	class: "trpg-save__name"
}, II = {
	key: 2,
	class: "trpg-badge",
	"data-tone": "gold"
}, LI = {
	key: 3,
	class: "trpg-badge"
}, RI = { class: "trpg-save__time" }, zI = {
	key: 0,
	class: "trpg-row__meta"
}, BI = {
	key: 1,
	class: "trpg-row__meta trpg-save__note"
}, VI = {
	key: 2,
	class: "trpg-save__noteedit"
}, HI = ["maxlength"], UI = { class: "trpg-save__noteactions" }, WI = { class: "trpg-row__end" }, GI = ["disabled"], KI = /* @__PURE__ */ B({
	__name: "SaveRow",
	props: {
		save: {},
		current: { type: Boolean },
		cardBadge: { type: Boolean },
		readOnly: { type: Boolean }
	},
	emits: [
		"load",
		"rename",
		"note",
		"export",
		"remove"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ L(!1), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(null), l = () => [
			{
				key: "rename",
				label: "改名",
				disabled: n.readOnly,
				reason: "只读窗口不能修改"
			},
			{
				key: "note",
				label: "备注",
				disabled: n.readOnly,
				reason: "只读窗口不能修改"
			},
			{
				key: "export",
				label: "导出"
			},
			...n.current ? [] : [{
				key: "remove",
				label: "删除",
				danger: !0,
				disabled: n.readOnly,
				reason: "只读窗口不能修改"
			}]
		];
		async function u(e) {
			e === "rename" ? (a.value = n.save.name, i.value = !0, await Sr(), c.value?.focus(), c.value?.select()) : e === "note" ? (s.value = n.save.note, o.value = !0) : e === "export" ? r("export") : e === "remove" && r("remove");
		}
		function d() {
			if (!i.value) return;
			i.value = !1;
			let e = a.value.trim();
			e && e !== n.save.name && r("rename", e);
		}
		function f() {
			o.value = !1, s.value !== n.save.note && r("note", s.value);
		}
		return (t, n) => (U(), W("li", {
			class: "trpg-save",
			"data-current": e.current,
			"data-testid": `save-${e.save.name}`
		}, [K("div", MI, [
			K("div", NI, [
				i.value ? Hr((U(), W("input", {
					key: 0,
					ref_key: "nameInput",
					ref: c,
					"onUpdate:modelValue": n[0] ||= (e) => a.value = e,
					class: "trpg-input trpg-save__rename",
					maxlength: R(40),
					"aria-label": "存档名",
					onKeydown: [Bu(Ru(d, ["prevent"]), ["enter"]), n[1] ||= Bu(Ru((e) => i.value = !1, ["stop", "prevent"]), ["esc"])],
					onBlur: d
				}, null, 40, PI)), [[Cu, a.value]]) : (U(), W("span", FI, F(e.save.name), 1)),
				e.current ? (U(), W("span", II, "当前")) : J("", !0),
				e.cardBadge ? (U(), W("span", LI, F(e.save.ownerLabel), 1)) : J("", !0),
				K("span", RI, F(R(FE)(e.save.updatedAt)), 1)
			]),
			R(RE)(e.save) ? (U(), W("div", zI, F(R(RE)(e.save)), 1)) : J("", !0),
			e.save.note && !o.value ? (U(), W("div", BI, F(e.save.note.split("\n")[0]), 1)) : J("", !0),
			o.value ? (U(), W("div", VI, [Hr(K("textarea", {
				"onUpdate:modelValue": n[2] ||= (e) => s.value = e,
				class: "trpg-input",
				maxlength: R(200),
				"aria-label": "备注",
				rows: "2",
				onKeydown: n[3] ||= Bu(Ru((e) => o.value = !1, ["stop", "prevent"]), ["esc"])
			}, null, 40, HI), [[Cu, s.value]]), K("div", UI, [K("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: n[4] ||= (e) => o.value = !1
			}, "取消"), K("button", {
				class: "trpg-btn trpg-btn--small trpg-btn--primary",
				type: "button",
				onClick: f
			}, "保存")])])) : J("", !0)
		]), K("div", WI, [e.current ? J("", !0) : (U(), W("button", {
			key: 0,
			class: "trpg-btn",
			type: "button",
			disabled: e.readOnly,
			onClick: n[5] ||= (e) => r("load")
		}, "读取", 8, GI)), q(rI, {
			label: e.save.name,
			items: l(),
			onSelect: u
		}, null, 8, ["label", "items"])])], 8, jI));
	}
}), qI = ["data-dragging"], JI = {
	key: 0,
	class: "trpg-drawer__current"
}, YI = { class: "trpg-drawer__name" }, XI = { class: "trpg-drawer__title" }, ZI = {
	key: 0,
	class: "trpg-badge",
	"data-tone": "warn"
}, QI = { class: "trpg-drawer__buttons" }, $I = ["disabled"], eL = {
	key: 1,
	class: "trpg-drawer__current"
}, tL = { class: "trpg-drawer__filter" }, nL = {
	key: 1,
	class: "trpg-field__hint"
}, rL = {
	key: 0,
	class: "trpg-saves"
}, iL = {
	key: 1,
	class: "trpg-empty"
}, aL = { class: "trpg-group" }, oL = { class: "trpg-saves" }, sL = { class: "trpg-drawer__bottom" }, cL = ["disabled"], lL = ["disabled"], uL = /* @__PURE__ */ B({
	__name: "SaveDrawerPage",
	setup(e) {
		let t = Hw(), n = Ww(), r = BE(), i = yT(), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(!1);
		Ca(() => void r.refresh().catch((e) => console.error("[trpg-assistant] 读取存档列表失败", e)));
		let c = Y(() => n.currentSave), l = Y(() => t.services?.rules), u = (e) => l.value?.get(e)?.nameShort ?? e, d = (e) => !!l.value?.has(e), f = Y(() => {
			let e = a.value.trim();
			return e ? r.manual.filter((t) => t.name.includes(e) || t.note.includes(e)) : r.manual;
		}), p = Y(() => {
			let e = /* @__PURE__ */ new Map();
			for (let t of r.everything) e.set(t.ruleId, [...e.get(t.ruleId) ?? [], t]);
			return [...e];
		});
		async function m(e, t) {
			try {
				return await e();
			} catch (e) {
				console.error(`[trpg-assistant] ${t}`, e), i.error(`${t}：${zE(e)}`);
				return;
			}
		}
		async function h(e) {
			let t = await m(() => n.branch(e), "创建分支失败");
			t && (await r.refresh(), i.success(`已切换到「${t.name}」`));
		}
		async function g(e, t) {
			await m(() => r.remove(e), "删除失败") && i.undoable(`已删除「${t}」`, async () => void await m(() => r.restore(e), "撤销失败"));
		}
		async function _(e, t) {
			await XE({
				title: "彻底删除存档",
				message: `「${t}」将被永久删除，无法恢复。`,
				confirmLabel: "彻底删除",
				danger: !0
			}) && await m(() => r.purge([e]), "删除失败");
		}
		async function v() {
			let e = r.deleted.length;
			await XE({
				title: "清空最近删除",
				message: `最近删除中的 ${e} 个存档将被永久删除，无法恢复。`,
				confirmLabel: "彻底删除",
				danger: !0
			}) && await m(() => r.purge(r.deleted.map((e) => e.id)), "清空失败");
		}
		async function y(e) {
			s.value = !1;
			let t = e.dataTransfer?.files?.[0];
			t && !n.readOnly && await dk(t);
		}
		async function b(e) {
			let t = e.target, n = t.files?.[0];
			t.value = "", n && await dk(n);
		}
		return (e, i) => (U(), W("div", {
			class: "trpg-drawer",
			"data-testid": "save-drawer",
			"data-dragging": s.value,
			onDragover: i[11] ||= Ru((e) => s.value = !0, ["prevent"]),
			onDragleave: i[12] ||= Ru((e) => s.value = !1, ["self"]),
			onDrop: Ru(y, ["prevent"])
		}, [
			R(n).hasCampaign ? (U(), W("section", JI, [
				K("div", YI, [K("span", XI, F(c.value?.name ?? "当前存档"), 1), R(n).dirty ? (U(), W("span", ZI, "● 有未保存到存档的改动")) : J("", !0)]),
				K("div", QI, [
					K("button", {
						class: "trpg-btn trpg-btn--primary",
						type: "button",
						disabled: R(n).readOnly || !R(n).dirty,
						onClick: i[0] ||= (e) => R(ZL)()
					}, F(R(n).dirty ? "保存存档" : "已是最新"), 9, $I),
					q(tI, {
						"default-name": `${c.value?.name ?? "存档"} 分支`,
						disabled: R(n).readOnly,
						onCreate: h
					}, null, 8, ["default-name", "disabled"]),
					c.value ? (U(), W("button", {
						key: 0,
						class: "trpg-btn",
						type: "button",
						onClick: i[1] ||= (e) => R(uk)(c.value.id)
					}, "导出…")) : J("", !0)
				]),
				R(t).reminder ? (U(), W("p", {
					key: 0,
					class: Ve(["trpg-field__hint", { "trpg-warn": R(t).reminder.kind === "due" }])
				}, F(R(t).reminder.text), 3)) : J("", !0)
			])) : (U(), W("section", eL, [...i[13] ||= [K("p", { class: "page-intro" }, "还没有当前战役", -1)]])),
			R(n).hasCampaign ? (U(), W(H, { key: 2 }, [
				K("div", tL, [
					q($E, {
						"model-value": R(r).scope,
						label: "存档范围",
						options: [{
							value: "card",
							label: "本卡"
						}, {
							value: "all",
							label: "全部"
						}],
						"onUpdate:modelValue": i[2] ||= (e) => R(r).setScope(e)
					}, null, 8, ["model-value"]),
					R(r).manual.length > 8 ? Hr((U(), W("input", {
						key: 0,
						"onUpdate:modelValue": i[3] ||= (e) => a.value = e,
						class: "trpg-input",
						type: "search",
						placeholder: "按存档名或备注搜索",
						"aria-label": "搜索存档"
					}, null, 512)), [[Cu, a.value]]) : J("", !0),
					R(r).manual.length > 8 ? (U(), W("span", nL, "共 " + F(f.value.length) + " 个", 1)) : J("", !0)
				]),
				f.value.length ? (U(), W("ul", rL, [(U(!0), W(H, null, Ba(f.value, (e) => (U(), G(KI, {
					key: e.id,
					save: e,
					current: e.id === c.value?.id,
					"card-badge": R(r).scope === "all",
					"read-only": R(n).readOnly,
					onLoad: (t) => R(QL)(e),
					onRename: (t) => m(() => R(r).rename(e.id, t), "改名失败"),
					onNote: (t) => m(() => R(r).setNote(e.id, t), "保存备注失败"),
					onExport: (t) => R(uk)(e.id),
					onRemove: (t) => g(e.id, e.name)
				}, null, 8, [
					"save",
					"current",
					"card-badge",
					"read-only",
					"onLoad",
					"onRename",
					"onNote",
					"onExport",
					"onRemove"
				]))), 128))])) : R(r).loading ? J("", !0) : (U(), W("div", iL, [K("p", null, F(a.value ? "没有符合的存档" : "这张卡还没有存档"), 1), a.value ? (U(), W("button", {
					key: 0,
					class: "trpg-btn",
					type: "button",
					onClick: i[4] ||= (e) => a.value = ""
				}, "清除搜索")) : (U(), W("button", {
					key: 1,
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: i[5] ||= (e) => R(XL)()
				}, "＋ 新存档"))])),
				q(AI, {
					autos: R(r).autos,
					deleted: R(r).deleted,
					others: R(r).otherRules,
					"read-only": R(n).readOnly,
					"rule-name": u,
					"rule-installed": d,
					onLoad: R(QL),
					onAutoAsManual: i[6] ||= (e) => m(() => R(r).autoAsManual(e.id), "另存失败"),
					onRestore: i[7] ||= (e) => m(() => R(r).restore(e.id), "恢复失败"),
					onPurge: i[8] ||= (e) => _(e.id, e.name),
					onPurgeAll: v
				}, null, 8, [
					"autos",
					"deleted",
					"others",
					"read-only",
					"onLoad"
				])
			], 64)) : (U(!0), W(H, { key: 3 }, Ba(p.value, ([e, t]) => (U(), W("div", {
				key: e,
				class: "trpg-group-block"
			}, [K("h3", aL, F(u(e)) + "（" + F(t.length) + "）", 1), K("ul", oL, [(U(!0), W(H, null, Ba(t, (e) => (U(), G(KI, {
				key: e.id,
				save: e,
				"card-badge": "",
				onLoad: (t) => R(QL)(e),
				onRename: (t) => m(() => R(r).rename(e.id, t), "改名失败"),
				onNote: (t) => m(() => R(r).setNote(e.id, t), "保存备注失败"),
				onExport: (t) => R(uk)(e.id),
				onRemove: (t) => g(e.id, e.name)
			}, null, 8, [
				"save",
				"onLoad",
				"onRename",
				"onNote",
				"onExport",
				"onRemove"
			]))), 128))])]))), 128)),
			K("footer", sL, [
				R(n).hasCampaign && R(r).manual.length ? (U(), W("button", {
					key: 0,
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					disabled: R(n).readOnly,
					onClick: i[9] ||= (e) => R(XL)()
				}, "＋ 新存档", 8, cL)) : J("", !0),
				K("button", {
					class: "trpg-btn",
					type: "button",
					disabled: R(n).readOnly,
					onClick: i[10] ||= (e) => o.value?.click()
				}, "导入存档文件", 8, lL),
				K("input", {
					ref_key: "picker",
					ref: o,
					class: "trpg-sr-only",
					type: "file",
					accept: ".trpgsave,.zip",
					tabindex: "-1",
					"aria-hidden": "true",
					onChange: b
				}, null, 544)
			])
		], 40, qI));
	}
}), dL = { class: "trpg-confirm" }, fL = { class: "trpg-confirm__message" }, pL = { class: "trpg-confirm__actions trpg-confirm__actions--stack" }, mL = /* @__PURE__ */ B({
	__name: "UnsavedLoadPage",
	props: {
		current: {},
		target: {},
		onChoose: { type: Function }
	},
	setup(e) {
		let t = e;
		return (e, n) => (U(), W("div", dL, [
			K("p", fL, "「" + F(t.current) + "」有未保存到存档的改动。读取「" + F(t.target) + "」前：", 1),
			K("div", pL, [
				K("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[0] ||= (e) => t.onChoose("cancel")
				}, "取消"),
				K("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[1] ||= (e) => t.onChoose("discard")
				}, "不保存存档，直接读取"),
				K("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					"data-autofocus": "",
					onClick: n[2] ||= (e) => t.onChoose("save")
				}, "保存存档后读取")
			]),
			n[3] ||= K("p", { class: "trpg-field__hint" }, "无论选哪一项，当前状态都会先写入自动存档。", -1)
		]));
	}
}), hL = () => ({
	step: 1,
	ruleId: "",
	name: "",
	note: "",
	nameEdited: !1,
	touched: !1
}), gL = /* @__PURE__ */ bn(hL());
function _L() {
	Object.assign(gL, hL());
}
// src/ui/wizard/StepName.vue?vue&type=script&setup=true&lang.ts
var vL = { class: "trpg-field" }, yL = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, bL = {
	key: 1,
	class: "trpg-field__error",
	role: "alert"
}, xL = { class: "trpg-field" }, SL = {
	class: "trpg-field__hint",
	"data-testid": "wizard-summary"
}, CL = /* @__PURE__ */ B({
	__name: "StepName",
	emits: ["submit"],
	setup(e, { emit: t }) {
		let n = t, r = Hw(), i = /* @__PURE__ */ L(null), a = Y(() => r.svc().rules.get(gL.ruleId)), o = Y(() => gL.name.trim().length > 40), s = Y(() => gL.name.trim().length === 0), c = Y(() => `将建立：${a.value?.name ?? ""}`);
		return Ca(() => {
			if (!gL.nameEdited || !gL.name) {
				let e = new Date(r.svc().now());
				gL.name = `${a.value?.nameShort ?? "战役"} · ${e.getMonth() + 1}月${e.getDate()}日`;
			}
			i.value?.focus(), i.value?.select();
		}), (e, t) => (U(), W("form", {
			class: "page-stack",
			onSubmit: t[4] ||= Ru((e) => n("submit"), ["prevent"])
		}, [
			t[7] ||= K("h3", { class: "trpg-step-title" }, "给战役起个名字", -1),
			K("label", vL, [
				t[5] ||= K("span", { class: "trpg-field__label" }, "战役名称", -1),
				Hr(K("input", {
					ref_key: "input",
					ref: i,
					"onUpdate:modelValue": t[0] ||= (e) => R(gL).name = e,
					class: "trpg-input",
					type: "text",
					autocomplete: "off",
					"aria-label": "战役名称",
					onInput: t[1] ||= (e) => {
						R(gL).nameEdited = !0, R(gL).touched = !0;
					}
				}, null, 544), [[Cu, R(gL).name]]),
				s.value ? (U(), W("span", yL, "请输入战役名称")) : o.value ? (U(), W("span", bL, "名称最多 " + F(R(40)) + " 个字", 1)) : J("", !0)
			]),
			K("label", xL, [t[6] ||= K("span", { class: "trpg-field__label" }, "备注（可空）", -1), Hr(K("textarea", {
				"onUpdate:modelValue": t[2] ||= (e) => R(gL).note = e,
				class: "trpg-input",
				rows: "2",
				maxlength: "200",
				"aria-label": "备注",
				onInput: t[3] ||= (e) => R(gL).touched = !0
			}, null, 544), [[Cu, R(gL).note]])]),
			K("p", SL, F(c.value), 1)
		], 32));
	}
}), wL = { class: "page-stack" }, TL = /* @__PURE__ */ B({
	__name: "InfoPage",
	props: { lines: {} },
	setup(e) {
		return (t, n) => (U(), W("div", wL, [(U(!0), W(H, null, Ba(e.lines, (e) => (U(), W("p", {
			key: e,
			class: "trpg-info__line"
		}, F(e), 1))), 128))]));
	}
}), EL = ["aria-label"], DL = /* @__PURE__ */ B({
	__name: "Term",
	props: { label: {} },
	emits: ["open"],
	setup(e) {
		return (t, n) => (U(), W("button", {
			class: "trpg-term",
			type: "button",
			"aria-label": e.label,
			"aria-haspopup": "dialog",
			onClick: n[0] ||= Ru((e) => t.$emit("open"), ["stop"])
		}, [V(t.$slots, "default")], 8, EL));
	}
}), OL = { class: "page-stack" }, kL = {
	class: "trpg-rulecards",
	role: "radiogroup",
	"aria-label": "规则"
}, AL = [
	"aria-checked",
	"aria-disabled",
	"tabindex",
	"data-status",
	"onClick",
	"onKeydown"
], jL = {
	class: "trpg-rulecard__mark",
	"aria-hidden": "true"
}, ML = { class: "trpg-rulecard__body" }, NL = { class: "trpg-row__meta" }, PL = {
	key: 0,
	class: "trpg-badge"
}, FL = {
	key: 1,
	class: "trpg-badge",
	"data-tone": "warn"
}, IL = /* @__PURE__ */ B({
	__name: "StepRule",
	setup(e) {
		let t = Hw(), n = wE(), r = Y(() => aw(t.svc().rules));
		function i(e, t) {
			t === "installed" && (gL.ruleId = e, gL.touched = !0);
		}
		function a(e, t, r) {
			n.push({
				key: `rule:${e}`,
				title: t,
				component: An(TL),
				props: { lines: [r] }
			});
		}
		return (e, t) => (U(), W("div", OL, [t[0] ||= K("h3", { class: "trpg-step-title" }, "选择这场战役用的规则", -1), K("div", kL, [(U(!0), W(H, null, Ba(r.value, (e) => (U(), W("div", {
			key: e.id,
			class: "trpg-rulecard",
			role: "radio",
			"aria-checked": R(gL).ruleId === e.id,
			"aria-disabled": e.status !== "installed",
			tabindex: e.status === "installed" ? 0 : -1,
			"data-status": e.status,
			onClick: (t) => i(e.id, e.status),
			onKeydown: [Bu(Ru((t) => i(e.id, e.status), ["prevent"]), ["enter"]), Bu(Ru((t) => i(e.id, e.status), ["prevent"]), ["space"])]
		}, [K("span", jL, F(R(gL).ruleId === e.id ? "◉" : "○"), 1), K("span", ML, [
			q(DL, { onOpen: (t) => a(e.id, e.name, e.description) }, {
				default: z(() => [Xs(F(e.name), 1)]),
				_: 2
			}, 1032, ["onOpen"]),
			K("span", NL, F(e.description), 1),
			e.status === "coming" ? (U(), W("span", PL, "即将推出")) : e.status === "installable" ? (U(), W("span", FL, "可安装")) : J("", !0)
		])], 40, AL))), 128))])]));
	}
}), LL = {
	class: "trpg-wizard",
	"data-testid": "wizard"
}, RL = {
	class: "trpg-steps",
	"aria-label": "步骤"
}, zL = ["data-state"], BL = [
	"aria-current",
	"disabled",
	"onClick"
], VL = { class: "trpg-steps__n" }, HL = { class: "trpg-steps__label" }, UL = {
	class: "trpg-steps__compact",
	"aria-hidden": "true"
}, WL = { class: "trpg-wizard__body" }, GL = { class: "trpg-wizard__foot" }, KL = ["disabled"], qL = ["disabled"], JL = /* @__PURE__ */ B({
	__name: "WizardPage",
	setup(e) {
		let t = Hw(), n = Ww(), r = wE(), i = yT(), a = ST(), o = /* @__PURE__ */ L(!1), s = [{
			n: 1,
			label: "规则"
		}, {
			n: 2,
			label: "命名"
		}], c = Y(() => gL.name.trim().length > 0 && gL.name.trim().length <= 40), l = Y(() => gL.step === 1 ? !!gL.ruleId : c.value && !o.value), u = Y(() => s.find((e) => e.n === gL.step)?.label);
		Ca(() => {
			let e = t.svc().rules.list();
			!gL.ruleId && e.length === 1 && (gL.ruleId = e[0].id);
		});
		function d(e) {
			e < gL.step && (gL.step = e);
		}
		function f() {
			gL.step === 1 ? gL.step = 2 : m();
		}
		function p() {
			gL.step > 1 && (gL.step = 1);
		}
		async function m() {
			if (c.value && !o.value) {
				o.value = !0;
				try {
					let e = await n.startNew({
						ruleId: gL.ruleId,
						name: gL.name.trim(),
						note: gL.note
					});
					await t.refreshBackup(), r.close(!0), a.go("home"), i.success(`已开始「${e.name}」`);
				} catch (e) {
					console.error("[trpg-assistant] 开始冒险失败", e), i.error(`没能开始：${zE(e)}`);
				} finally {
					o.value = !1;
				}
			}
		}
		return (e, t) => (U(), W("div", LL, [
			K("ol", RL, [(U(), W(H, null, Ba(s, (e) => K("li", {
				key: e.n,
				"data-state": e.n === R(gL).step ? "current" : e.n < R(gL).step ? "done" : "todo"
			}, [K("button", {
				type: "button",
				"aria-current": e.n === R(gL).step ? "step" : void 0,
				disabled: e.n >= R(gL).step,
				onClick: (t) => d(e.n)
			}, [K("span", VL, F(e.n), 1), K("span", HL, F(e.label), 1)], 8, BL)], 8, zL)), 64))]),
			K("p", UL, F(R(gL).step) + "/" + F(s.length) + " · " + F(u.value), 1),
			K("div", WL, [R(gL).step === 1 ? (U(), G(IL, { key: 0 })) : (U(), G(CL, {
				key: 1,
				onSubmit: m
			}))]),
			K("footer", GL, [K("button", {
				class: "trpg-btn",
				type: "button",
				disabled: R(gL).step === 1 || o.value,
				onClick: p
			}, "上一步", 8, KL), K("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: !l.value,
				"data-testid": "wizard-next",
				onClick: f
			}, F(R(gL).step === 2 ? o.value ? "正在准备…" : "开始冒险" : "下一步"), 9, qL)])
		]));
	}
});
// src/ui/saves/actions.ts
function YL() {
	wE().open({
		key: "saves",
		title: "存档",
		component: An(uL),
		variant: "drawer"
	});
}
function XL() {
	let e = wE();
	_L(), e.open({
		key: "wizard",
		title: "开始新冒险",
		component: An(JL),
		variant: "dialog",
		guard: () => !gL.touched || (XE({
			title: "放弃这次新建？",
			message: "已经选好的内容不会保存。",
			confirmLabel: "放弃",
			cancelLabel: "继续填写",
			danger: !0
		}).then((t) => {
			t && e.close(!0);
		}), !1)
	});
}
async function ZL() {
	let e = Ww(), t = yT();
	if (e.hasCampaign && !e.readOnly) try {
		let n = await e.save();
		await Hw().refreshBackup(), t.success(n ? "已保存存档" : "已是最新");
	} catch (e) {
		console.error("[trpg-assistant] 保存存档失败", e), t.error(`保存存档失败：${zE(e)}`);
	}
}
async function QL(e) {
	let t = Ww(), n = wE(), r = yT(), i = BE();
	if (t.readOnly) return { loaded: !1 };
	try {
		let a = !!t.workspace && t.workspace.ruleId !== e.ruleId;
		if (a) {
			let n = Hw().svc().rules.get(e.ruleId);
			if (!await XE({
				title: "切换规则",
				message: `「${e.name}」使用 ${n?.name ?? e.ruleId}。读取后，整个助手会切换为该规则的界面与资料；当前的「${t.currentSave?.name ?? "存档"}」会先写入自动存档。`,
				confirmLabel: "切换并读取"
			})) return { loaded: !1 };
		} else if (t.hasCampaign && t.dirty) {
			let n = await VE({
				key: "confirm:unsaved",
				title: "有未保存到存档的改动",
				component: An(mL),
				props: (n) => ({
					current: t.currentSave?.name ?? "当前存档",
					target: e.name,
					onChoose: n
				})
			}, "cancel");
			if (n === "cancel") return { loaded: !1 };
			n === "save" && await t.save();
		} else if (t.hasCampaign && e.ownerKey !== t.owner?.ownerKey && !await XE({
			title: "读取其他角色卡的存档",
			message: `「${e.name}」属于其他角色卡，读取时会复制为这张卡的新存档。`,
			confirmLabel: "读取"
		})) return { loaded: !1 };
		return await t.load(e.id, { allowRuleSwitch: a || !t.hasCampaign }), await i.refresh(), r.success(`已读取「${e.name}」`), n.close(!0), { loaded: !0 };
	} catch (e) {
		return console.error("[trpg-assistant] 读取存档失败", e), r.error(e instanceof $ ? e.message : `读取失败：${zE(e)}`), { loaded: !1 };
	}
}
// src/ui/home/HomeCampaign.vue?vue&type=script&setup=true&lang.ts
var $L = { class: "page-stack" }, eR = ["src", "alt"], tR = { class: "trpg-banner__text" }, nR = { class: "trpg-banner__line" }, rR = ["data-dirty"], iR = { class: "trpg-empty trpg-empty--tight" }, aR = /* @__PURE__ */ B({
	__name: "HomeCampaign",
	setup(e) {
		let t = Hw(), n = Ww(), r = ST(), i = /* @__PURE__ */ L(!1), a = /* @__PURE__ */ L(!1), o = Y(() => n.workspace ? t.svc().rules.get(n.workspace.ruleId) : void 0), s = Y(() => NE({
			rule: o.value,
			data: n.workspace.data,
			narrow: window.innerWidth <= 480
		})), c = Y(() => !!s.value.src && !i.value), l = Y(() => n.currentSave?.name ?? "存档"), u = Y(() => n.dirty ? "● 有未保存到存档的改动" : n.currentSave ? `存档已保存 ${IE(n.currentSave.updatedAt)}` : "");
		return (e, t) => (U(), W("div", $L, [
			K("section", {
				class: Ve(["trpg-banner", { "trpg-banner--pattern": !c.value }]),
				"aria-label": "战役横幅"
			}, [c.value ? (U(), W("img", {
				key: 0,
				class: Ve(["trpg-banner__img", { "is-loaded": a.value }]),
				src: s.value.src,
				alt: s.value.alt,
				onLoad: t[0] ||= (e) => a.value = !0,
				onError: t[1] ||= (e) => i.value = !0
			}, null, 42, eR)) : J("", !0), K("div", tR, [K("button", {
				class: "trpg-banner__title",
				type: "button",
				"data-testid": "banner-title",
				onClick: t[2] ||= (...e) => R(YL) && R(YL)(...e)
			}, F(l.value), 1), K("div", nR, [K("span", null, F(o.value?.name), 1), K("button", {
				class: "trpg-banner__state",
				type: "button",
				"data-dirty": R(n).dirty,
				onClick: t[3] ||= (...e) => R(YL) && R(YL)(...e)
			}, F(u.value), 9, rR)])])], 2),
			t[6] ||= K("h2", { class: "trpg-group" }, "最近记录", -1),
			K("p", iR, [t[5] ||= Xs("还没有记录，", -1), K("button", {
				class: "trpg-link",
				type: "button",
				onClick: t[4] ||= (e) => R(r).diceOpen = !0
			}, "掷一次骰子试试")])
		]));
	}
}), oR = { class: "page-stack" }, sR = ["disabled"], cR = { class: "trpg-hero__sub" }, lR = {
	key: 1,
	class: "trpg-hero trpg-hero--idle",
	"data-testid": "no-chat"
}, uR = /* @__PURE__ */ B({
	__name: "HomeEmpty",
	setup(e) {
		let t = Ww(), n = Hw(), r = BE(), i = /* @__PURE__ */ L(0);
		return Ca(async () => {
			i.value = await r.count(), await n.refreshBackup();
		}), (e, n) => (U(), W("div", oR, [R(t).owner ? (U(), W("button", {
			key: 0,
			class: "trpg-hero",
			type: "button",
			"data-testid": "start-banner",
			disabled: R(t).readOnly,
			onClick: n[0] ||= (e) => R(XL)()
		}, [
			n[2] ||= K("span", { class: "trpg-hero__title" }, "开始一场新的冒险", -1),
			K("span", cR, "为「" + F(R(t).owner.ownerLabel) + "」建立一个战役：选规则、资料与冒险，再起个名字。", 1),
			n[3] ||= K("span", {
				class: "trpg-hero__go",
				"aria-hidden": "true"
			}, "开始新冒险 →", -1)
		], 8, sR)) : (U(), W("div", lR, [...n[4] ||= [K("span", { class: "trpg-hero__title" }, "请先在酒馆中打开一个聊天", -1)]])), R(t).owner && i.value > 0 ? (U(), W("button", {
			key: 2,
			class: "trpg-link",
			type: "button",
			"data-testid": "load-existing",
			onClick: n[1] ||= (...e) => R(YL) && R(YL)(...e)
		}, "读取已有存档（" + F(i.value) + "）", 1)) : J("", !0)]));
	}
}), dR = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, fR = {
	key: 1,
	class: "page-stack",
	"aria-busy": "true"
}, pR = /* @__PURE__ */ B({
	__name: "HomeView",
	setup(e) {
		let t = Hw(), n = Ww();
		return (e, r) => R(t).bootError ? (U(), W("p", dR, "无法打开本机存储：" + F(R(t).bootError), 1)) : !R(t).booted || !R(n).ready ? (U(), W("div", fR, [...r[0] ||= [K("div", {
			class: "trpg-skeleton",
			style: { height: "140px" }
		}, null, -1), K("div", {
			class: "trpg-skeleton",
			style: { width: "40%" }
		}, null, -1)]])) : R(n).hasCampaign ? (U(), G(aR, { key: 3 })) : (U(), G(uR, { key: 2 }));
	}
}), mR = /* @__PURE__ */ bn({});
function hR(e, t, n, r, i) {
	mR[e] = {
		id: e,
		title: t,
		status: n,
		summary: r,
		detail: i,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function gR(e, t, n) {
	try {
		await n();
	} catch (n) {
		console.error(`[trpg-assistant] 探针 ${e} 出错`, n), hR(e, t, "error", n instanceof Error ? n.message : String(n));
	}
}
function _R(e) {
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		env: e,
		results: Object.values(mR)
	};
}
// src/probes/envProbe.ts
var vR = "env", yR = "宿主与设备环境";
function bR() {
	let e = document.createElement("div");
	e.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top)", document.body.appendChild(e);
	let t = getComputedStyle(e).paddingTop;
	return e.remove(), t;
}
async function xR(e) {
	let t = { present: !1 };
	if (window.__TAURITAVERN__) try {
		let e = await w();
		t = {
			present: !0,
			ready: !0,
			apiKeys: Object.keys(e?.api ?? {})
		};
	} catch (e) {
		console.error("[trpg-assistant] TauriTavern 就绪等待失败", e), t = {
			present: !0,
			ready: !1,
			error: String(e)
		};
	}
	return {
		userAgent: navigator.userAgent,
		viewport: {
			w: window.innerWidth,
			h: window.innerHeight,
			dpr: window.devicePixelRatio
		},
		coarsePointer: window.matchMedia("(pointer: coarse)").matches,
		safeAreaTop: bR(),
		contextKeys: Object.keys(e).sort(),
		libsKeys: Object.keys(window.SillyTavern?.libs ?? {}).sort(),
		hasSetExtensionPrompt: typeof e.setExtensionPrompt == "function",
		hasPromptEnums: !!e.extension_prompt_types,
		eventTypeCount: Object.keys(e.event_types ?? {}).length,
		tauri: t
	};
}
function SR(e) {
	let t = () => gR(vR, yR, async () => {
		let t = await xR(e), n = t.tauri;
		hR(vR, yR, "info", n.present ? "检测到 TauriTavern 宿主" : "未检测到 TauriTavern（普通 SillyTavern）", t);
	});
	return {
		id: vR,
		title: yR,
		hint: "自动检测。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/backendChain.ts
async function CR(e, t, n, r, i, a) {
	let o = `${n.codeSet}-official`, s = await e.parsed(o, r);
	for (let e = 0; e < s.items.length; e++) {
		let c = s.items[e], l = s.hashes[e];
		if (!l || s.sources[e] !== i || !a(c)) continue;
		let u = {
			set: o,
			prop: r,
			hash: l
		}, d = await t.detail(n, u);
		if (!(!d || "hidden" in d || !d.english || d.english.status !== "found")) return {
			ref: u,
			label: String(c.name),
			entry: d.english.item
		};
	}
	throw Error(`【库】里找不到带英文对照的 ${i} ${r}（先装中英官方）`);
}
async function wR(e, t, n) {
	let r = (r, i, a) => CR(e, t, n, r, i, a);
	return {
		build: [
			await r("race", "PHB", (e) => !!e.size && !String(e.name).includes("(")),
			await r("background", "PHB", (e) => !!e.skillProficiencies || !!e.entries),
			await r("class", "PHB", (e) => !!e.hd)
		],
		equipment: [await r("item", "PHB", (e) => e.weaponCategory === "martial"), await r("spell", "PHB", (e) => e.level === 0)],
		monster: await r("monster", "MM", (e) => !!e.name)
	};
}
function TR(e, t, n = "", r = [], i = 20) {
	if (r.length >= i || e === t) return r;
	let a = (e) => e === null ? "null" : Array.isArray(e) ? "array" : typeof e;
	if (a(e) !== a(t)) return r.push({
		path: n,
		before: e,
		after: t
	}), r;
	if (Array.isArray(e) && Array.isArray(t)) return e.length === t.length ? (e.forEach((e, a) => TR(e, t[a], `${n}[${a}]`, r, i)), r) : (r.push({
		path: `${n}.length`,
		before: e.length,
		after: t.length
	}), r);
	if (e && t && typeof e == "object") {
		let a = e, o = t;
		for (let e of /* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(o)])) TR(a[e], o[e], n ? `${n}.${e}` : e, r, i);
		return r;
	}
	return r.push({
		path: n,
		before: e,
		after: t
	}), r;
}
// src/probes/services.ts
var ER = null;
function DR() {
	return ER ??= lw({ dbName: "tavern-trpg-probe" }), ER;
}
// src/probes/backendProbe.ts
var OR = "backend-p3", kR = "P3 全线后端真机验证", AR = {
	ownerKey: "probe:p3-backend",
	ownerLabel: "P3 全线后端真机验证"
}, jR = "dnd5e2014", MR = DR;
async function NR(e, t, n, r = () => !0, i) {
	let a = performance.now();
	hR(OR, kR, "waiting", `进行中：${t}…`);
	let o = await n(), s = r(o);
	if (e.push({
		step: t,
		ms: Math.round(performance.now() - a),
		ok: s,
		note: i?.(o)
	}), !s) throw Error(`${t} 没通过：${JSON.stringify(i?.(o) ?? o).slice(0, 300)}`);
	return o;
}
function PR(e) {
	return (e?.system)?.attributes?.hp?.value;
}
async function FR() {
	let e = MR(), { library: t, kernel: n, kernelSave: r } = e.backend, i = [], a = SS(jR, "cn");
	await n.close(AR.ownerKey), await e.db.workspaces.clear(), await e.db.saves.clear(), await NR(i, "新战役并绑定结算内核", async () => (await e.campaign.startNewCampaign({
		...AR,
		ruleId: jR,
		name: kR
	}), r.bind(AR.ownerKey, lb.parse({
		rule: jR,
		kernelVersion: 1,
		library: a,
		dataVersion: await t.dataVersion(),
		overrides: [],
		actors: [],
		revision: 0,
		undo: []
	}))));
	let o = await NR(i, "从【库】挑真实条目", () => wR(t.service, t.scoped, a), () => !0, (e) => [
		...e.build,
		...e.equipment,
		e.monster
	].map((e) => e.label)), { session: s, bootMs: c } = await NR(i, "打开结算内核（官方 Foundry + dnd5e + Plutonium）", () => n.session(AR.ownerKey), () => !0, (e) => ({ bootMs: e.bootMs }));
	i.push({
		step: "结算内核启动耗时",
		ms: c,
		ok: !0
	});
	let l = (await NR(i, "建英雄（正式入口：引用 → 预换算结果 → dnd5e 成长流程）", () => n.buildCharacter(AR.ownerKey, {
		name: "真机英雄",
		items: o.build.map((e) => e.ref),
		equipment: o.equipment.map((e) => e.ref)
	}), (e) => e.status === "complete" && !!e.id, (e) => ({
		status: e.status,
		error: e.error
	}))).id, u = (await NR(i, "加怪物（正式入口：批量建）", () => n.createActors(AR.ownerKey, [o.monster.ref]), (e) => e.status === "complete" && !!e.actors?.[0]?.id, (e) => ({
		status: e.status,
		error: e.error
	}))).actors[0].id;
	await n.remember(AR.ownerKey, u), await NR(i, "人物写进存档（只存引用）", async () => {
		let e = await n.compact(AR.ownerKey, [l, u]), t = await r.read(AR.ownerKey);
		if (!t) throw Error("绑定丢了");
		return r.bind(AR.ownerKey, lb.parse({
			...t,
			actors: e.map((e) => ({
				...e,
				adjustments: {},
				dice: []
			}))
		}));
	}, (e) => e.actors.every((e) => e.refs.length > 0), (e) => e.actors.map((e) => ({
		name: e.name,
		refs: e.refs.length
	})));
	let d = await NR(i, "英雄攻击怪物（真实伤害）", async () => {
		let e = ((await s.call("preparedActors")).find((e) => e.source._id === l)?.source).items.find((e) => e.type === "weapon");
		if (!e) throw Error("英雄没有武器");
		let t = await s.call("attack", l, e._id, [
			20,
			4,
			4,
			4,
			4,
			4,
			4,
			4
		]), n = t.result?.damage?.[0]?.total;
		if (!n) throw Error(`攻击没有伤害：${t.status}`);
		let r = await s.call("damage", u, [{
			value: n,
			type: e.system?.damage?.base?.types?.[0] ?? "slashing"
		}], [], {});
		return {
			total: n,
			status: r.status,
			changes: [...t.changes, ...r.changes]
		};
	}, (e) => e.status === "complete" && e.changes.length > 0, (e) => ({
		damage: e.total,
		changes: e.changes.length
	}));
	await NR(i, "预览 → 写入 → 撤销 → 再写（经服务入口拆人物）", async () => {
		let e = await r.preview(AR.ownerKey, d.changes), t = await r.apply(AR.ownerKey, d.changes, e.revision), n = await r.undo(AR.ownerKey, t.kernel.revision), i = await r.apply(AR.ownerKey, d.changes, n?.kernel.revision ?? -1);
		return {
			rows: e.rows.length,
			revisions: [
				e.revision,
				t.kernel.revision,
				n?.kernel.revision,
				i.kernel.revision
			]
		};
	}, (e) => e.rows > 0 && e.revisions.join() === "0,1,2,3", (e) => e);
	let f = {
		hero: (await s.call("preparedActors")).find((e) => e.source._id === l)?.source ?? null,
		monster: (await s.call("preparedActors")).find((e) => e.source._id === u)?.source ?? null
	}, p = await NR(i, "保存存档", async () => {
		await r.save(AR.ownerKey);
		let t = await e.campaign.getWorkspace(AR.ownerKey), n = t?.currentSaveId ? await e.campaign.getSave(t.currentSaveId) : null;
		if (!n) throw Error("没有存档");
		return {
			id: n.id,
			kernelBytes: JSON.stringify(n.snapshot.kernel).length,
			fullBytes: JSON.stringify(f).length
		};
	}, (e) => e.kernelBytes < e.fullBytes, (e) => ({
		kernelBytes: e.kernelBytes,
		fullActorBytes: e.fullBytes
	}));
	await NR(i, "关书报缺（本战役排除 PHB、MM）→ 开书 0 缺", async () => {
		await r.setLibrary(AR.ownerKey, {
			...a,
			exclude: ["src:phb", "src:mm"]
		});
		let e = await r.check(AR.ownerKey);
		await r.setLibrary(AR.ownerKey, a);
		let t = await r.check(AR.ownerKey);
		return {
			closed: e.missing.length,
			labels: e.missing.map((e) => e.ref.label),
			open: t.missing.length,
			checked: t.checked
		};
	}, (e) => e.closed === e.checked && e.closed > 0 && e.open === 0, (e) => e), await NR(i, "关掉结算内核 → 读档（读前检查）", async () => (await n.close(AR.ownerKey), e.campaign.loadSave(AR, p.id, { precheck: async (e) => {
		let t = await r.checkSave(e.id);
		if (t.missing.length) throw Error(`缺 ${t.missing.length} 条`);
	} })));
	let m = await r.read(AR.ownerKey);
	if (!m) throw Error("读档后没有内核段");
	let h = [];
	for (let e of m.actors) {
		let t = await NR(i, `按引用重建：${e.name}`, () => n.rebuild(AR.ownerKey, e), (e) => e.status === "complete", (e) => ({
			status: e.status,
			error: e.error,
			missing: e.missing?.length
		})), r = e.id === l ? f.hero : f.monster, a = TR(r, t.data ?? null);
		h.push({
			name: e.name,
			sameId: t.id === e.id,
			diffs: a.length,
			sample: a.slice(0, 3),
			hp: [PR(r), PR(t.data ?? null)]
		});
	}
	let g = h.every((e) => e.sameId && e.diffs === 0), _ = i.reduce((e, t) => e + t.ms, 0);
	hR(OR, kR, g ? "pass" : "fail", `${g ? "全线通过" : "重建有差别"}：${h.map((e) => `${e.name} 差 ${e.diffs} 处、HP ${String(e.hp[0])}→${String(e.hp[1])}`).join("；")}；存档内核段 ${p.kernelBytes} 字节；结算内核启动 ${Math.round(c / 1e3)} 秒；合计 ${Math.round(_ / 1e3)} 秒；当前${navigator.onLine ? "联网" : "断网"}`, {
		steps: i,
		rebuilt: h
	});
}
async function IR() {
	let { tasks: e } = MR().backend.library, t = {};
	for (let n of ["cn-official", "en-official"]) {
		let r = performance.now(), i = e.startOfficial(n), a = setInterval(() => {
			let t = e.get(i);
			t && hR(OR, kR, "waiting", `安装 ${n}：${t.progress.stage} ${t.progress.done}/${t.progress.total}`);
		}, 1e3), o = await e.wait(i).finally(() => clearInterval(a));
		if (t[n] = {
			status: o.status,
			error: o.error,
			seconds: Math.round((performance.now() - r) / 1e3)
		}, o.status !== "done") {
			hR(OR, kR, "fail", `安装 ${n} 没完成：${o.error ?? o.status}`, t);
			return;
		}
	}
	hR(OR, kR, "pass", `中英官方都装好：${Object.entries(t).map(([e, t]) => `${e} ${t.seconds} 秒`).join("，")}`, t);
}
async function LR() {
	let e = await cS(), t = (e) => e === null ? "未知" : `${Math.round(e / 1048576)}MB`;
	hR(OR, kR, "info", `存储：已用 ${t(e.usage)} / 可用上限 ${t(e.quota)}；持久存储 ${e.persisted === null ? "未知" : e.persisted ? "已授予" : "未授予"}`, e);
}
function RR() {
	return {
		id: OR,
		title: kR,
		hint: "依次点：①装中英官方（联网，第一次要几分钟；装过的会跳过）②全线验证（建英雄、打怪物、写入撤销、存档、关书开书、读档重建）③存储空间 ④关掉网络、完全退出酒馆再打开，再点②（断网全线验证）。最后点“复制报告”发给开发者。",
		actions: [
			{
				label: "①装中英官方",
				run: () => gR(OR, kR, IR)
			},
			{
				label: "②全线验证（断网时即断网验证）",
				run: () => gR(OR, kR, FR)
			},
			{
				label: "③存储空间",
				run: () => gR(OR, kR, LR)
			}
		]
	};
}
// src/probes/eventsProbe.ts
var zR = "events", BR = "聊天事件", VR = [
	["CHAT_CHANGED", "chat_id_changed"],
	["MESSAGE_SENT", "message_sent"],
	["MESSAGE_RECEIVED", "message_received"],
	["MESSAGE_SWIPED", "message_swiped"],
	["MESSAGE_EDITED", "message_edited"],
	["MESSAGE_DELETED", "message_deleted"],
	["GENERATION_STARTED", "generation_started"],
	["GENERATION_ENDED", "generation_ended"]
];
function HR(e) {
	let t = {}, n = [], r = () => {
		let e = VR.map(([e]) => e).filter((e) => !t[e]);
		hR(zR, BR, "info", e.length ? `尚未观察到：${e.join("、")}` : "全部事件都已观察到", {
			counts: t,
			recent: n.slice(-30)
		});
	};
	return {
		id: zR,
		title: BR,
		hint: "依次做：发送消息、等回复、切换回复（左右箭头）、编辑一条消息、删除一条消息、切换聊天，观察事件是否都能收到。",
		actions: [{
			label: "刷新",
			run: r
		}],
		start: () => {
			for (let [i, a] of VR) E(e, T(e, i, a), (...e) => {
				t[i] = (t[i] ?? 0) + 1, n.push({
					at: (/* @__PURE__ */ new Date()).toISOString(),
					event: i,
					args: JSON.stringify(e).slice(0, 120)
				}), r();
			});
			r();
		}
	};
}
// src/probes/identityProbe.ts
var UR = "identity", WR = "角色卡 / 群组 / 聊天标识";
function GR(e) {
	let t = e.characterId === void 0 ? void 0 : e.characters?.[Number(e.characterId)];
	return {
		characterId: e.characterId ?? null,
		characterName: t?.name ?? null,
		avatarFile: t?.avatar ?? null,
		groupId: e.groupId ?? null,
		chatId: e.getCurrentChatId?.() ?? e.chatId ?? null,
		chatLength: e.chat?.length ?? 0,
		chatMetadataKeys: Object.keys(e.chatMetadata ?? {}).length,
		user: e.name1 ?? null
	};
}
function KR(e) {
	let t = [], n = () => {
		let n = GR(e), r = JSON.stringify([
			n.characterId,
			n.groupId,
			n.chatId
		]);
		t.some((e) => e.key === r) || t.push({
			key: r,
			...n
		}), hR(UR, WR, "info", `当前：${n.groupId ? "群组聊天" : n.characterId === null ? "没有打开聊天" : "角色卡聊天"}；已观察 ${t.length} 种上下文`, {
			current: n,
			observed: t
		});
	};
	return {
		id: UR,
		title: WR,
		hint: "在角色卡聊天、群组聊天、未打开聊天三种状态之间切换，观察标识是否都能取到。",
		actions: [{
			label: "刷新",
			run: n
		}],
		start: () => {
			n(), E(e, T(e, "CHAT_CHANGED", "chat_id_changed"), n);
		}
	};
}
// src/probes/libraryProbe.ts
var qR = "library-b3", JR = "【库】真机验证（B3）", YR = () => DR().backend.library;
function XR() {
	return {
		id: qR,
		title: JR,
		hint: "依次点：①装中文官方（联网，几分钟）②体检 ③查一本书 ④关掉网络、刷新页面后再点\"查一本书\"（断网读取）⑤存储空间。英文原文要英文官方也装上，这里不装，显示 not-installed 是正常的。",
		actions: [
			{
				label: "①装中文官方",
				run: () => gR(qR, JR, async () => {
					let { tasks: e } = YR(), t = e.startOfficial("cn-official"), n = setInterval(() => {
						let n = e.get(t);
						n && hR(qR, JR, "waiting", `安装中：${n.progress.stage} ${n.progress.done}/${n.progress.total} ${n.progress.item ?? ""}`);
					}, 1e3), r = await e.wait(t).finally(() => clearInterval(n));
					YR().service.reset();
					let i = r.result;
					if (r.status !== "done" || !i) {
						hR(qR, JR, "fail", `安装没完成：${r.error ?? r.status}`);
						return;
					}
					let a = !i.download.failed.length && !i.mirror.missing.length && !i.mirror.mismatched.length && !i.parse.errors.length;
					hR(qR, JR, a ? "pass" : "fail", `安装${a ? "成功" : "有问题"}：${i.plan.files} 个文件，解析 ${Object.keys(i.parse.props).length} 类，用时 ${Math.round(i.ms / 1e3)} 秒`, {
						download: {
							fetched: i.download.fetched,
							reused: i.download.reused,
							failed: i.download.failed
						},
						mirror: {
							checked: i.mirror.checked,
							missing: i.mirror.missing.length,
							mismatched: i.mirror.mismatched.length
						},
						parseErrors: i.parse.errors,
						storage: i.storage
					});
				})
			},
			{
				label: "②体检",
				run: () => gR(qR, JR, async () => {
					let e = await YR().service.health();
					hR(qR, JR, e.items.filter((e) => e.level === "error").length ? "fail" : "pass", `体检：ok ${e.summary.ok} · info ${e.summary.info} · warn ${e.summary.warn} · error ${e.summary.error}`, e.items.map((e) => ({
						source: e.source,
						check: e.check,
						level: e.level,
						count: e.count,
						title: e.title
					})));
				})
			},
			{
				label: "③查一本书（断网时即断网读取）",
				run: () => gR(qR, JR, async () => {
					let { service: e } = YR(), t = await e.query("cn-official", "spell", { source: "XPHB" }), n = t.find((e) => e.item.ENG_name === "Fireball"), r = n?.hash ? await e.detail("cn-official", "spell", n.hash, "XPHB") : null, i = await e.search("cn-official", "火球");
					hR(qR, JR, t.length && r ? "pass" : "fail", `XPHB 法术 ${t.length} 条；火球术详情${r ? "取到" : "没取到"}；英文原文：${r?.english?.status ?? "无"}；搜索"火球" ${i.length} 条；当前${navigator.onLine ? "联网" : "断网"}`, {
						fireball: r?.item,
						english: r?.english,
						searchTop: i.slice(0, 5).map((e) => e.doc)
					});
				})
			},
			{
				label: "⑤存储空间",
				run: () => gR(qR, JR, async () => {
					let e = await cS(), t = (e) => e === null ? "未知" : `${Math.round(e / 1048576)}MB`;
					hR(qR, JR, "info", `存储：已用 ${t(e.usage)} / 可用上限 ${t(e.quota)}；持久存储 ${e.persisted === null ? "未知" : e.persisted ? "已授予" : "未授予"}`, e);
				})
			}
		]
	};
}
// src/probes/promptScan.ts
var ZR = "TRPG-PROBE-COMMENT", QR = "TRPG-PROBE-INJECT";
function $R(e) {
	if (typeof e == "string") return e;
	try {
		return JSON.stringify(e) ?? "";
	} catch (e) {
		return console.error("[trpg-assistant] 请求内容无法序列化", e), "";
	}
}
function ez(e, t) {
	let n = e.indexOf(t);
	if (!(n < 0)) return e.slice(Math.max(0, n - 6), n + t.length + 12);
}
function tz(e, t) {
	let n = e?.chat;
	if (Array.isArray(n)) for (let e = 0; e < n.length; e++) {
		let r = n[e];
		if ((typeof r?.content == "string" ? r.content : $R(r?.content)).includes(t)) return {
			role: String(r.role ?? "?"),
			indexFromEnd: n.length - 1 - e
		};
	}
}
function nz(e) {
	let t = $R(e);
	return {
		length: t.length,
		comment: t.includes(ZR),
		commentIntact: t.includes("<!--TRPG-PROBE-COMMENT") && t.includes("-->"),
		inject: t.includes(QR),
		commentSnippet: ez(t, ZR),
		injectSnippet: ez(t, QR),
		injectAt: tz(e, QR)
	};
}
// src/probes/llmLogAudit.ts
function rz(e) {
	if (e && typeof e == "object") {
		let t = e;
		return t.id ?? t.key ?? t.logId ?? t.name;
	}
	return e;
}
async function iz() {
	let e = (await w())?.api?.dev?.llmApiLogs;
	if (!e?.index || !e.getRaw) return {
		status: "info",
		summary: "宿主没有请求日志接口，只能依靠事件判定",
		detail: null
	};
	let t = await e.index(), n = Array.isArray(t) ? t : [], r = n[n.length - 1] ?? n[0], i = r && typeof r == "object" ? r : {}, a = {
		count: n.length,
		latestEntry: {
			id: i.id,
			ok: i.ok,
			stream: i.stream,
			durationMs: i.durationMs
		}
	};
	if (r === void 0) return {
		status: "info",
		summary: "请求日志为空（可能未开启记录，或还没有发过请求）",
		detail: a
	};
	let o = nz(await e.getRaw(rz(r)));
	return a.scan = o, a.markers = [ZR, QR], {
		status: "info",
		summary: `最近一次请求原文：${o.comment ? `含注释标记${o.commentIntact ? "（符号完整）" : "（符号被改）"}` : "无注释标记"}；${o.inject ? "含注入标记" : "无注入标记"}`,
		detail: a
	};
}
// src/probes/promptProbes.ts
var az = "comment", oz = "注释是否进入发给 AI 的请求", sz = "inject", cz = "提示词注入是否生效", lz = "input", uz = "写入与读取输入框", dz = "tavern-trpg-assistant_probe", fz = 1, pz = 0;
function mz(e) {
	return e?.dryRun === !0;
}
function hz(e) {
	let t = !1, n = !1, r = "", i = [], a = {}, o = (e) => (t) => {
		i.push({
			event: e,
			dryRun: mz(t),
			...nz(t)
		});
	}, s = () => {
		let e = i.filter((e) => !e.dryRun);
		if (r !== "quiet") {
			if (!e.length) t && hR(az, oz, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）"), n && hR(sz, cz, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）");
			else {
				if (t) {
					let n = e.find((e) => e.comment), i = e.some((e) => e.commentIntact);
					hR(az, oz, n && i ? "pass" : "fail", n ? i ? "注释原样进入了请求（<!-- --> 完整保留）" : "标记文字进入了请求，但 <!-- --> 符号被改动或删除" : "请求中没有找到注释内容（注释被删除）", {
						runType: r,
						captures: e,
						message: a
					}), t = !1;
				}
				if (n) {
					let t = e.find((e) => e.inject);
					hR(sz, cz, t ? "pass" : "fail", t ? `注入文本进入了请求${t.injectAt ? `（${t.injectAt.role} 消息，距末尾 ${t.injectAt.indexFromEnd} 条）` : ""}` : "请求中没有找到注入文本", {
						runType: r,
						captures: e
					}), n = !1, c();
				}
			}
		}
	}, c = () => {
		let t = e.extension_prompt_types?.IN_CHAT ?? fz, n = e.extension_prompt_roles?.SYSTEM ?? pz;
		e.setExtensionPrompt?.(dz, "", t, 0, !1, n);
	}, l = () => {
		let t = T(e, "CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready"), n = T(e, "GENERATE_AFTER_COMBINE_PROMPTS", "generate_after_combine_prompts"), c = T(e, "GENERATE_AFTER_DATA", "generate_after_data");
		E(e, t, o(t)), E(e, n, o(n)), E(e, c, o(c)), E(e, T(e, "GENERATION_STARTED", "generation_started"), (e, t, n) => {
			n !== !0 && (r = String(e ?? ""), i = []);
		});
		let l = () => s();
		E(e, T(e, "GENERATION_ENDED", "generation_ended"), l), E(e, T(e, "GENERATION_STOPPED", "generation_stopped"), l), E(e, T(e, "MESSAGE_SENT", "message_sent"), (t) => {
			let n = e.chat[Number(t)];
			a.storedInChat = !!n?.mes?.includes(ZR);
		}), E(e, T(e, "USER_MESSAGE_RENDERED", "user_message_rendered"), (e) => {
			let t = document.querySelector(`.mes[mesid="${Number(e)}"] .mes_text`);
			t && (a.visibleTextHasMarker = !!t.textContent?.includes(ZR), a.htmlHasComment = t.innerHTML.includes(`<!--${ZR}`));
		});
	}, u = {
		id: az,
		title: oz,
		hint: "点「写入测试注释」后，自己发送这条消息（需要已连接模型）。发送完成后自动判定；楼层里应看不到注释文字。",
		actions: [{
			label: "写入测试注释到输入框",
			run: () => gR(az, oz, () => {
				let e = S();
				if (!e) throw Error("找不到输入框");
				let n = `<!--${ZR} 探针-->`;
				D(e, e.value ? `${e.value}\n${n}` : `测试 ${n}`), t = !0, hR(az, oz, "waiting", "已写入。请发送这条消息，等 AI 回复结束后自动判定");
			})
		}]
	};
	u.actions.push({
		label: "从 TauriTavern 请求日志核对",
		run: () => gR(az, oz, async () => {
			let e = await iz();
			hR(az, oz, e.status, e.summary, {
				runType: r,
				audit: e.detail,
				message: a
			});
		})
	});
	let d = {
		id: sz,
		title: cz,
		hint: "点「注入探针」后发送任意消息。可以和上一项同一次发送完成判定。测完请点「清除注入」。",
		actions: [{
			label: "注入探针",
			run: () => gR(sz, cz, () => {
				if (!e.setExtensionPrompt) throw Error("宿主没有 setExtensionPrompt");
				let t = e.extension_prompt_types?.IN_CHAT ?? fz, r = e.extension_prompt_roles?.SYSTEM ?? pz;
				e.setExtensionPrompt(dz, `[${QR}] 这是探针注入文本`, t, 0, !1, r), n = !0, hR(sz, cz, "waiting", "已注入（IN_CHAT，深度 0）。请发送一条消息，判定后会自动清除", { enumsFromContext: !!e.extension_prompt_types });
			})
		}, {
			label: "清除注入",
			run: () => gR(sz, cz, () => {
				c(), n = !1, hR(sz, cz, "idle", "已清除注入");
			})
		}]
	}, f = {
		id: lz,
		title: uz,
		hint: "自动写入一段文字、读回校验，然后恢复原内容（不会发送）。",
		actions: [{
			label: "运行输入框测试",
			run: () => gR(lz, uz, () => {
				let e = S();
				if (!e) throw Error("找不到输入框");
				let t = e.value, n = `${t}[TRPG-PROBE-INPUT]`;
				D(e, n);
				let r = e.value;
				D(e, t);
				let i = e.value === t;
				hR(lz, uz, r === n && i ? "pass" : "fail", r === n ? i ? "写入、读回、恢复都正常" : "写入正常，但恢复失败" : "写入后读回的内容不一致", {
					readBackMatches: r === n,
					restored: i
				});
			})
		}]
	};
	return [
		{
			...u,
			start: l
		},
		d,
		f
	];
}
// src/probes/storageProbe.ts
var gz = "storage", _z = "本地存储与持久性", vz = `${b}-m0`, yz = 4194304;
function bz() {
	return new Promise((e, t) => {
		let n = indexedDB.open(vz, 1);
		n.onupgradeneeded = () => n.result.createObjectStore("kv"), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
	});
}
function xz(e, t, n) {
	return new Promise((r, i) => {
		let a = n(e.transaction("kv", t).objectStore("kv"));
		a.onsuccess = () => r(a.result), a.onerror = () => i(a.error);
	});
}
function Sz(e) {
	let t = () => gR(gz, _z, async () => {
		let t = await bz(), n = await xz(t, "readonly", (e) => e.get("boot")), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			count: (n?.count ?? 0) + 1,
			firstAt: n?.firstAt ?? r,
			lastAt: r
		};
		await xz(t, "readwrite", (e) => e.put(i, "boot"));
		let a = !!await xz(t, "readonly", (e) => e.get("blob"));
		a || await xz(t, "readwrite", (e) => e.put(new Uint8Array(yz), "blob"));
		let o = await xz(t, "readonly", (e) => e.get("blob"));
		t.close();
		let s = await navigator.storage?.persisted?.() ?? null, c = await navigator.storage?.estimate?.() ?? null, l = e.extensionSettings[b] ??= {}, u = Number(l.probeBootCount ?? 0);
		l.probeBootCount = u + 1, e.saveSettingsDebounced(), hR(gz, _z, "info", `IndexedDB 第 ${i.count} 次启动读写正常；刷新页面后次数应增加`, {
			idb: {
				bootCount: i.count,
				firstAt: i.firstAt,
				blobBytes: o?.byteLength ?? 0,
				blobWasAlreadyStored: a
			},
			navigatorStorage: {
				persisted: s,
				usage: c?.usage,
				quota: c?.quota
			},
			extensionSettings: {
				previousBootCount: u,
				nowBootCount: u + 1
			},
			localforagePresent: !!window.SillyTavern?.libs?.localforage
		});
	});
	return {
		id: gz,
		title: _z,
		hint: "每次启动自动读写 IndexedDB（含 4MB 数据）与扩展设置。完全退出再打开应用后，启动次数应继续累加，4MB 数据应已存在。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/tauriProbe.ts
var Cz = "tauri", wz = "TauriTavern 扩展接口", Tz = `${b}-m0`, Ez = "/scripts/tauritavern/layout-kit.js", Dz = [
	"current",
	"getCurrent",
	"active",
	"handle",
	"currentChat"
];
function Oz(e, t) {
	if (typeof e == "function") return "function";
	if (typeof e != "object" || !e) return typeof e;
	if (t <= 0) return "object";
	let n = {};
	for (let r of Object.keys(e)) n[r] = Oz(e[r], t - 1);
	return n;
}
async function kz(e, t) {
	try {
		return {
			ok: !0,
			value: await t()
		};
	} catch (t) {
		return console.error(`[trpg-assistant] ${e} 调用失败`, t), {
			ok: !1,
			error: t instanceof Error ? t.message : String(t)
		};
	}
}
function Az(e) {
	if (Array.isArray(e)) {
		let t = e[0];
		return {
			count: e.length,
			itemKeys: t && typeof t == "object" ? Object.keys(t) : typeof t,
			textLengths: e.map((e) => typeof e?.text == "string" ? String(e.text).length : null)
		};
	}
	return e && typeof e == "object" ? {
		keys: Object.keys(e),
		approxBytes: JSON.stringify(e).length
	} : {
		type: typeof e,
		length: typeof e == "string" ? e.length : null
	};
}
function jz(e) {
	let t = e;
	return t.ok ? {
		ok: !0,
		shape: Az(t.value)
	} : t;
}
async function Mz(e) {
	if (typeof e.searchMessages == "function" || e.store) return {
		handle: e,
		via: "api.chat 本身"
	};
	let t = e.current;
	if (t && typeof t.handle == "function") {
		let e = await kz("api.chat.current.handle()", () => t.handle.call(t));
		if (e.ok && e.value && typeof e.value == "object") return {
			handle: e.value,
			via: "api.chat.current.handle()"
		};
	}
	for (let t of Dz) {
		let n = e[t];
		if (typeof n == "function") {
			let r = await kz(`api.chat.${t}()`, () => n.call(e)), i = r.value;
			if (r.ok && i && typeof i == "object") return {
				handle: i,
				via: `api.chat.${t}()`
			};
		} else if (n && typeof n == "object") return {
			handle: n,
			via: `api.chat.${t}`
		};
	}
	return {
		handle: null,
		via: null
	};
}
function Nz() {
	let e = () => gR(Cz, wz, async () => {
		if (!window.__TAURITAVERN__) {
			hR(Cz, wz, "info", "不是 TauriTavern，跳过（扩展将使用酒馆通用能力）");
			return;
		}
		let e = (await w())?.api ?? {}, t = e.chat ?? {}, n = { apiShape: Oz(e, 3) };
		n.layoutKitExports = await kz("layout-kit 导入", () => import(
			/* @vite-ignore */
			Ez
).then((e) => Object.keys(e)));
		let { handle: r, via: i } = await Mz(t);
		if (n.handleVia = i, r) {
			let e = r;
			n.handleShape = Oz(r, 2), e.searchMessages && (n.searchMessages = jz(await kz("searchMessages", () => e.searchMessages({
				query: "你",
				limit: 3
			}))));
			let t = e.locate?.findLastMessage;
			if (t && (n.findLastMessage = jz(await kz("findLastMessage", () => t.call(e.locate, {
				role: "user",
				scanLimit: 50
			})))), e.store?.setJson && e.store.getJson) {
				let t = { at: (/* @__PURE__ */ new Date()).toISOString() };
				n.storeSet = await kz("store.setJson", () => e.store.setJson({
					namespace: Tz,
					key: "probe",
					value: t
				})), n.storeGet = await kz("store.getJson", () => e.store.getJson({
					namespace: Tz,
					key: "probe"
				})), e.store.listKeys && (n.storeKeys = await kz("store.listKeys", () => e.store.listKeys({ namespace: Tz }))), e.store.deleteJson && (n.storeDelete = await kz("store.deleteJson", () => e.store.deleteJson({
					namespace: Tz,
					key: "probe"
				})));
			}
			e.metadata?.get && (n.metadata = jz(await kz("metadata.get", () => e.metadata.get()))), typeof e.stableId == "function" && (n.stableId = jz(await kz("stableId", () => e.stableId.call(e)))), typeof e.summary == "function" && (n.summary = jz(await kz("summary", () => e.summary.call(e))));
		}
		let a = e.extension?.store;
		if (a?.setJson && a.getJson) {
			let e = { at: (/* @__PURE__ */ new Date()).toISOString() }, t = {
				namespace: Tz,
				key: "probe"
			};
			n.extStoreSet = await kz("extension.store.setJson", () => a.setJson({
				...t,
				value: e
			})), n.extStoreGet = await kz("extension.store.getJson", () => a.getJson(t)), a.listKeys && (n.extStoreKeys = await kz("extension.store.listKeys", () => a.listKeys({ namespace: Tz }))), a.deleteJson && (n.extStoreDelete = await kz("extension.store.deleteJson", () => a.deleteJson(t)));
		}
		hR(Cz, wz, "info", r ? `找到 handle（${i}）；各接口调用结果见详情` : "没有找到获取 handle 的方式；接口结构见详情", n);
	});
	return {
		id: Cz,
		title: wz,
		hint: "仅 TauriTavern 有效。请分别在「已打开聊天」和「未打开聊天」两种状态下点「重新检测」各测一次。",
		actions: [{
			label: "重新检测",
			run: e
		}],
		start: e
	};
}
// src/probes/index.ts
function Pz(e) {
	return [
		XR(),
		RR(),
		SR(e),
		...hz(e),
		Sz(e),
		KR(e),
		HR(e),
		Nz()
	];
}
// src/ui/kit/SelectField.vue?vue&type=script&setup=true&lang.ts
var Fz = { class: "trpg-select-trigger__text" }, Iz = {
	key: 0,
	class: "trpg-select-trigger__prefix"
}, Lz = /* @__PURE__ */ B({
	__name: "SelectField",
	props: /*@__PURE__*/ so({
		options: {},
		placeholder: {},
		label: {},
		prefix: {},
		disabled: { type: Boolean }
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = e, n = Ao(e, "modelValue"), r = Gr("portalTarget", void 0), i = Y(() => t.options.map((e) => typeof e == "string" ? {
			value: e,
			label: e
		} : e));
		return (t, a) => (U(), G(R(jF), {
			modelValue: n.value,
			"onUpdate:modelValue": a[0] ||= (e) => n.value = e,
			disabled: e.disabled
		}, {
			default: z(() => [q(R(YF), {
				class: "trpg-select-trigger",
				disabled: e.disabled,
				"aria-label": e.label
			}, {
				default: z(() => [K("span", Fz, [e.prefix ? (U(), W("span", Iz, F(e.prefix), 1)) : J("", !0), q(R(XF), { placeholder: e.placeholder ?? "请选择" }, null, 8, ["placeholder"])]), q(FT, {
					name: "caret-down",
					size: 14
				})]),
				_: 1
			}, 8, ["disabled", "aria-label"]), q(R(JF), { to: R(r) }, {
				default: z(() => [q(R(UF), {
					class: "trpg-select-content",
					position: "popper",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: z(() => [q(R(ZF), { class: "trpg-select-viewport" }, {
						default: z(() => [(U(!0), W(H, null, Ba(i.value, (e) => (U(), G(R(KF), {
							key: e.value,
							value: e.value,
							class: "trpg-select-item"
						}, {
							default: z(() => [q(R(qF), null, {
								default: z(() => [Xs(F(e.label), 1)]),
								_: 2
							}, 1024)]),
							_: 2
						}, 1032, ["value"]))), 128))]),
						_: 1
					})]),
					_: 1
				})]),
				_: 1
			}, 8, ["to"])]),
			_: 1
		}, 8, ["modelValue", "disabled"]));
	}
}), Rz = {
	class: "trpg-combo__count",
	role: "status"
}, zz = {
	key: 0,
	class: "trpg-row__meta"
}, Bz = {
	key: 0,
	class: "trpg-badge"
}, Vz = 200, Hz = /* @__PURE__ */ B({
	__name: "Combobox",
	props: /*@__PURE__*/ so({
		options: {},
		label: {},
		placeholder: {},
		disabled: { type: Boolean }
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = e, n = Ao(e, "modelValue"), r = Gr("portalTarget", void 0), i = /* @__PURE__ */ L(""), a = Y(() => {
			let e = i.value.trim().toLowerCase();
			return e ? t.options.filter((t) => t.label.toLowerCase().includes(e) || (t.en ?? "").toLowerCase().includes(e)) : t.options;
		}), o = Y(() => a.value.slice(0, Vz)), s = Y(() => t.options.find((e) => e.value === n.value)), c = (e) => t.options.find((t) => t.value === e)?.label ?? "";
		return (t, l) => (U(), G(R(wP), {
			modelValue: n.value,
			"onUpdate:modelValue": l[2] ||= (e) => n.value = e,
			disabled: e.disabled,
			"ignore-filter": "",
			"open-on-click": "",
			class: "trpg-combo"
		}, {
			default: z(() => [q(R(TP), { class: "trpg-combo__anchor" }, {
				default: z(() => [q(R(NP), {
					modelValue: i.value,
					"onUpdate:modelValue": l[0] ||= (e) => i.value = e,
					class: "trpg-combo__input",
					"display-value": c,
					disabled: e.disabled,
					"aria-label": e.label,
					placeholder: s.value?.label ?? e.placeholder ?? "搜索…"
				}, null, 8, [
					"modelValue",
					"disabled",
					"aria-label",
					"placeholder"
				]), q(R(IP), {
					class: "trpg-icon-btn trpg-combo__trigger",
					disabled: e.disabled,
					"aria-label": "展开列表"
				}, {
					default: z(() => [q(FT, {
						name: "caret-down",
						size: 14
					})]),
					_: 1
				}, 8, ["disabled"])]),
				_: 1
			}), q(R(FP), { to: R(r) }, {
				default: z(() => [q(R(kP), {
					class: "trpg-select-content trpg-combo__content",
					position: "popper",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: z(() => [K("div", Rz, [Xs("共 " + F(a.value.length) + " 条", 1), a.value.length > Vz ? (U(), W(H, { key: 0 }, [Xs("，只显示前 " + F(Vz) + " 条，继续输入可缩小范围")], 64)) : J("", !0)]), q(R(RP), {
						class: "trpg-select-viewport",
						onMousedown: l[1] ||= Ru(() => {}, ["prevent"])
					}, {
						default: z(() => [q(R(AP), { class: "trpg-combo__empty" }, {
							default: z(() => [...l[3] ||= [Xs("没有符合的条目", -1)]]),
							_: 1
						}), (U(!0), W(H, null, Ba(o.value, (e) => (U(), G(R(PP), {
							key: e.value,
							value: e.value,
							class: "trpg-select-item"
						}, {
							default: z(() => [K("span", null, [Xs(F(e.label), 1), e.en ? (U(), W("span", zz, " · " + F(e.en), 1)) : J("", !0)]), e.badge ? (U(), W("span", Bz, F(e.badge), 1)) : J("", !0)]),
							_: 2
						}, 1032, ["value"]))), 128))]),
						_: 1
					})]),
					_: 1
				})]),
				_: 1
			}, 8, ["to"])]),
			_: 1
		}, 8, ["modelValue", "disabled"]));
	}
}), Uz = ["title"], Wz = [
	"aria-checked",
	"aria-label",
	"aria-description",
	"disabled",
	"data-on"
], Gz = /* @__PURE__ */ B({
	__name: "Switch",
	props: /*@__PURE__*/ so({
		label: {},
		disabled: { type: Boolean },
		lockedReason: {}
	}, {
		modelValue: {
			type: Boolean,
			default: !1
		},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = Ao(e, "modelValue");
		function n() {
			t.value = !t.value;
		}
		return (r, i) => (U(), W("span", {
			class: "trpg-switch-wrap",
			title: e.lockedReason
		}, [e.lockedReason ? (U(), G(FT, {
			key: 0,
			name: "lock",
			size: 14
		})) : J("", !0), K("button", {
			class: "trpg-switch",
			type: "button",
			role: "switch",
			"aria-checked": t.value,
			"aria-label": e.label,
			"aria-description": e.lockedReason,
			disabled: e.disabled,
			"data-on": t.value,
			onClick: n
		}, [...i[0] ||= [K("span", { class: "trpg-switch__thumb" }, null, -1)]], 8, Wz)], 8, Uz));
	}
}), Kz = { class: "trpg-pill trpg-tag" }, qz = ["aria-label"], Jz = /* @__PURE__ */ B({
	__name: "TagPill",
	props: {
		label: {},
		owner: {}
	},
	emits: ["remove"],
	setup(e) {
		return (t, n) => (U(), W("span", Kz, [K("span", null, F(e.label), 1), K("button", {
			class: "trpg-tag__x",
			type: "button",
			"aria-label": `移除${e.owner ? `${e.owner}的` : ""}『${e.label}』标签`,
			onClick: n[0] ||= (e) => t.$emit("remove")
		}, "×", 8, qz)]));
	}
}), Yz = ["data-testid"], Xz = { class: "trpg-list" }, Zz = /* @__PURE__ */ B({
	__name: "LabModalPage",
	props: { level: {} },
	setup(e) {
		let t = e, n = wE();
		function r() {
			n.push({
				key: `lab:${t.level + 1}`,
				title: `第 ${t.level + 1} 页`,
				component: An(Zz),
				props: { level: t.level + 1 }
			});
		}
		async function i() {
			await XE({
				title: "测试确认",
				message: "这是弹窗内的确认页，「‹」或 Esc 即取消。",
				confirmLabel: "确认"
			});
		}
		return (t, n) => (U(), W("div", {
			class: "page-stack",
			"data-testid": `lab-page-${e.level}`
		}, [
			K("p", null, [
				Xs("这是演示弹窗的第 " + F(e.level) + " 页。点下面的术语在", 1),
				q(DL, { onOpen: r }, {
					default: z(() => [...n[0] ||= [Xs("同一个弹窗里", -1)]]),
					_: 1
				}),
				n[1] ||= Xs("前进一页。", -1)
			]),
			K("ul", Xz, [(U(), W(H, null, Ba(30, (e) => K("li", {
				key: e,
				class: "trpg-row"
			}, [K("span", null, "演示行 " + F(e), 1)])), 64))]),
			K("button", {
				class: "trpg-btn",
				type: "button",
				onClick: i
			}, "弹窗内确认")
		], 8, Yz));
	}
}), Qz = { class: "probe" }, $z = { class: "lab" }, eB = { class: "lab__row" }, tB = {
	class: "probe__hint",
	"data-testid": "select-model"
}, nB = { class: "lab__row" }, rB = { class: "trpg-check" }, iB = { class: "lab__row" }, aB = {
	class: "probe__hint",
	"data-testid": "combo-model"
}, oB = { class: "probe__actions" }, sB = { class: "lab__row" }, cB = { class: "trpg-row" }, lB = { class: "trpg-row__main" }, uB = { "data-testid": "switch-state" }, dB = {
	class: "probe__hint",
	"data-testid": "menu-pick"
}, fB = { class: "probe__actions" }, pB = { class: "probe__head" }, mB = { class: "probe__title" }, hB = ["data-status"], gB = { class: "probe__hint" }, _B = { class: "probe__actions" }, vB = ["onClick"], yB = ["onClick"], bB = /* @__PURE__ */ B({
	__name: "UiLab",
	setup(e) {
		let t = [
			{
				id: "ui.ball",
				title: "悬浮球可拖动（鼠标/手指）",
				how: "拖动悬浮球到屏幕各处，松手后停在松手位置；单击能开关窗口。"
			},
			{
				id: "ui.window",
				title: "窗口可拖动且不会拖出屏幕",
				how: "拖动本窗口标题栏，尝试拖出屏幕边缘。"
			},
			{
				id: "ui.dropdown",
				title: "下拉列表完整显示",
				how: "把本窗口拖到屏幕底部或右侧边缘，再打开下面的下拉：列表应自动翻转、完整可见、不被裁切。"
			},
			{
				id: "ui.checkbox",
				title: "勾选框与按钮样式正常",
				how: "看下面的勾选框、输入框、按钮：应该是正常的方框，不是深色竖条或变形。"
			},
			{
				id: "ui.input",
				title: "输入框可输入且不触发酒馆快捷键",
				how: "在下面输入框里输入中文和英文，按回车：文字正常显示，酒馆不会因此发送消息或弹出其他东西。"
			}
		], n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L("a"), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = Array.from({ length: 300 }, (e, t) => ({
			value: `s${t}`,
			label: `法术-${String(t + 1).padStart(3, "0")}`,
			en: `Spell ${t + 1}`,
			badge: t % 2 ? "PHB" : "XGE"
		})), u = /* @__PURE__ */ L(["队伍成员", "风暴岛"]), d = /* @__PURE__ */ L(""), f = wE(), p = yT();
		function m() {
			f.open({
				key: "lab:1",
				title: "演示弹窗",
				component: An(Zz),
				props: { level: 1 }
			});
		}
		async function h() {
			let e = await XE({
				title: "卸载演示",
				message: "确定要卸载吗？",
				confirmLabel: "卸载",
				danger: !0
			});
			p.info(e ? "已确认" : "已取消");
		}
		function g(e, t, n) {
			hR(e, t, n, n === "pass" ? "人工确认：通过" : "人工确认：不通过");
		}
		return (e, f) => (U(), W("section", Qz, [
			f[15] ||= K("h3", { class: "probe__title" }, "界面实测（需要你目测后点结果）", -1),
			K("div", $z, [
				K("div", eB, [
					q(Lz, {
						modelValue: n.value,
						"onUpdate:modelValue": f[0] ||= (e) => n.value = e,
						label: "测试下拉（8 项）",
						options: [
							"戏法",
							"1 环",
							"2 环",
							"3 环",
							"4 环",
							"5 环",
							"6 环",
							"7 环",
							"8 环",
							"9 环"
						],
						placeholder: "下拉测试：选择环阶"
					}, null, 8, ["modelValue"]),
					K("p", tB, "下拉当前值：" + F(n.value || "未选") + " / " + F(r.value || "未选"), 1),
					q(Lz, {
						modelValue: r.value,
						"onUpdate:modelValue": f[1] ||= (e) => r.value = e,
						label: "测试下拉（3 项）",
						options: [
							"红",
							"金",
							"墨"
						],
						placeholder: "下拉测试：选择颜色"
					}, null, 8, ["modelValue"])
				]),
				K("div", nB, [
					q($E, {
						modelValue: i.value,
						"onUpdate:modelValue": f[2] ||= (e) => i.value = e,
						label: "分段按钮",
						options: [
							{
								value: "a",
								label: "优势"
							},
							{
								value: "b",
								label: "普通"
							},
							{
								value: "c",
								label: "劣势"
							}
						]
					}, null, 8, ["modelValue"]),
					K("label", rB, [Hr(K("input", {
						"onUpdate:modelValue": f[3] ||= (e) => a.value = e,
						type: "checkbox"
					}, null, 512), [[wu, a.value]]), f[11] ||= Xs(" 勾选框测试", -1)]),
					Hr(K("input", {
						"onUpdate:modelValue": f[4] ||= (e) => o.value = e,
						class: "trpg-input",
						type: "text",
						placeholder: "输入测试：中文 / English"
					}, null, 512), [[Cu, o.value]])
				]),
				K("div", iB, [
					q(Hz, {
						modelValue: c.value,
						"onUpdate:modelValue": f[5] ||= (e) => c.value = e,
						options: R(l),
						label: "可搜索下拉演示",
						placeholder: "搜索 300 条法术"
					}, null, 8, ["modelValue", "options"]),
					K("p", aB, "可搜索下拉当前值：" + F(c.value || "未选"), 1),
					K("div", oB, [(U(!0), W(H, null, Ba(u.value, (e) => (U(), G(Jz, {
						key: e,
						label: e,
						owner: "盖尔",
						onRemove: (t) => u.value = u.value.filter((t) => t !== e)
					}, null, 8, ["label", "onRemove"]))), 128))])
				]),
				K("div", sB, [
					K("div", cB, [
						K("span", lB, [f[12] ||= Xs("开关演示：", -1), K("span", uB, F(s.value ? "开" : "关"), 1)]),
						q(Gz, {
							modelValue: s.value,
							"onUpdate:modelValue": f[6] ||= (e) => s.value = e,
							label: "演示开关"
						}, null, 8, ["modelValue"]),
						q(rI, {
							label: "演示条目",
							items: [
								{
									key: "copy",
									label: "复制为我的包"
								},
								{
									key: "x",
									label: "不可用项",
									disabled: !0,
									reason: "演示"
								},
								{
									key: "del",
									label: "卸载",
									danger: !0
								}
							],
							onSelect: f[7] ||= (e) => d.value = e
						})
					]),
					K("p", dB, "菜单选择：" + F(d.value || "无"), 1),
					K("p", null, [f[14] ||= Xs("下划线术语：", -1), q(DL, { onOpen: m }, {
						default: z(() => [...f[13] ||= [Xs("点我打开演示弹窗", -1)]]),
						_: 1
					})]),
					K("div", fB, [
						K("button", {
							class: "trpg-btn",
							type: "button",
							onClick: h
						}, "危险确认"),
						K("button", {
							class: "trpg-btn",
							type: "button",
							onClick: f[8] ||= (e) => R(p).success("已保存")
						}, "成功提示"),
						K("button", {
							class: "trpg-btn",
							type: "button",
							onClick: f[9] ||= (e) => R(p).undoable("已删除一项", () => {
								R(p).info("已撤销");
							})
						}, "可撤销提示"),
						K("button", {
							class: "trpg-btn",
							type: "button",
							onClick: f[10] ||= (e) => R(p).error("下载失败：网络中断")
						}, "失败提示")
					])
				])
			]),
			(U(), W(H, null, Ba(t, (e) => K("div", {
				key: e.id,
				class: "probe"
			}, [
				K("div", pB, [K("h4", mB, F(e.title), 1), K("span", {
					class: "trpg-badge",
					"data-status": R(mR)[e.id]?.status ?? "idle"
				}, F(R(mR)[e.id]?.status ?? "待测"), 9, hB)]),
				K("p", gB, F(e.how), 1),
				K("div", _B, [K("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => g(e.id, e.title, "pass")
				}, "通过", 8, vB), K("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => g(e.id, e.title, "fail")
				}, "不通过", 8, yB)])
			])), 64))
		]));
	}
}), xB = { class: "probe__head" }, SB = { class: "probe__title" }, CB = ["data-status"], wB = { class: "probe__hint" }, TB = {
	key: 0,
	class: "probe__summary"
}, EB = { class: "probe__actions" }, DB = ["onClick"], OB = { key: 1 }, kB = { class: "report-bar" }, AB = { role: "status" }, jB = /* @__PURE__ */ B({
	__name: "ProbeList",
	props: { ctx: {} },
	setup(e) {
		let t = e.ctx, n = Pz(t), r = /* @__PURE__ */ L("");
		async function i() {
			return JSON.stringify(_R(await xR(t)), null, 2);
		}
		async function a() {
			let e = await i();
			try {
				await navigator.clipboard.writeText(e), r.value = "已复制报告";
			} catch (e) {
				console.error("[trpg-assistant] 复制失败", e), r.value = "复制失败，已保存到扩展设置（见下一个按钮）";
			}
		}
		async function o() {
			let e = t.extensionSettings[b] ??= {};
			e.m0Report = JSON.parse(await i()), t.saveSettingsDebounced(), r.value = "已保存到扩展设置";
		}
		for (let e of n) e.start?.();
		return (e, t) => (U(), W("div", null, [
			(U(!0), W(H, null, Ba(R(n), (e) => (U(), W("section", {
				key: e.id,
				class: "probe"
			}, [
				K("div", xB, [K("h3", SB, F(e.title), 1), K("span", {
					class: "trpg-badge",
					"data-status": R(mR)[e.id]?.status ?? "idle"
				}, F(R(mR)[e.id]?.status ?? "待测"), 9, CB)]),
				K("p", wB, F(e.hint), 1),
				R(mR)[e.id] ? (U(), W("p", TB, F(R(mR)[e.id].summary), 1)) : J("", !0),
				K("div", EB, [(U(!0), W(H, null, Ba(e.actions, (e) => (U(), W("button", {
					key: e.label,
					class: "trpg-btn",
					type: "button",
					onClick: (t) => e.run()
				}, F(e.label), 9, DB))), 128))]),
				R(mR)[e.id]?.detail === void 0 ? J("", !0) : (U(), W("details", OB, [t[2] ||= K("summary", null, "详情", -1), K("pre", null, F(JSON.stringify(R(mR)[e.id].detail, null, 2)), 1)]))
			]))), 128)),
			q(bB),
			K("div", kB, [
				K("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: t[0] ||= (e) => a()
				}, "复制测试报告"),
				K("button", {
					class: "trpg-btn",
					type: "button",
					onClick: t[1] ||= (e) => o()
				}, "保存报告到扩展设置"),
				K("span", AB, F(r.value), 1)
			])
		]));
	}
}), MB = {
	key: 0,
	class: "page-stack"
}, NB = { class: "trpg-list" }, PB = { class: "trpg-row" }, FB = { class: "trpg-row" }, IB = { class: "trpg-row__main" }, LB = { class: "trpg-row__meta" }, RB = { key: 1 }, zB = {
	key: 0,
	class: "trpg-diag",
	"data-testid": "diagnostics"
}, BB = {
	key: 1,
	class: "page-stack"
}, VB = { class: "trpg-group" }, HB = /* @__PURE__ */ B({
	__name: "SettingsView",
	setup(e) {
		let t = Gr("stCtx"), n = /* @__PURE__ */ L(null), r = Hw();
		return Ca(() => void (r.booted && r.refreshSettings().catch((e) => console.error("[trpg-assistant] 读取设置失败", e)))), (e, r) => n.value === null ? (U(), W("div", MB, [K("ul", NB, [K("li", PB, [r[4] ||= K("div", { class: "trpg-row__main" }, [K("div", { class: "trpg-row__title" }, "诊断"), K("div", { class: "trpg-row__meta" }, "自检与兼容性测试，遇到问题时用来收集信息")], -1), K("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[0] ||= (e) => n.value = "diag"
		}, [r[3] ||= Xs("打开", -1), q(FT, {
			name: "caret-right",
			size: 14
		})])]), K("li", FB, [K("div", IB, [r[5] ||= K("div", { class: "trpg-row__title" }, "关于", -1), K("div", LB, "版本 " + F(R(cw)) + " · 开源许可与致谢", 1)]), K("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[1] ||= (e) => n.value = "about"
		}, [r[6] ||= Xs("打开", -1), q(FT, {
			name: "caret-right",
			size: 14
		})])])])])) : (U(), W("div", RB, [K("button", {
			class: "subpage-back",
			type: "button",
			onClick: r[2] ||= (e) => n.value = null
		}, [q(FT, {
			name: "caret-left",
			size: 16
		}), r[7] ||= Xs("设置", -1)]), n.value === "diag" ? (U(), W("div", zB, [R(t) ? (U(), G(jB, {
			key: 0,
			ctx: R(t)
		}, null, 8, ["ctx"])) : J("", !0)])) : (U(), W("div", BB, [
			K("h2", VB, "TRPG 跑团助手 " + F(R(cw)), 1),
			r[8] ||= K("p", { class: "page-intro" }, "代码以 AGPL-3.0 许可发布，源码在 GitHub：didhogg/tavern-trpg-assistant。", -1),
			r[9] ||= K("p", { class: "page-intro" }, "界面图标：Phosphor Icons（MIT）。规则数据的来源与许可见各条目的出处标注与随包附带的数据声明。", -1)
		]))]));
	}
}), UB = { class: "trpg-head__chips" }, WB = { class: "trpg-chip__name" }, GB = /* @__PURE__ */ B({
	__name: "HeaderChips",
	props: { layout: {} },
	setup(e) {
		let t = e, n = Hw(), r = Ww(), i = yT(), a = ST(), o = Y(() => n.booted && r.hasCampaign), s = Y(() => [...o.value ? [{
			key: "saves",
			label: "存档"
		}] : [], {
			key: "close",
			label: "收起助手"
		}]), c = Y(() => r.currentSave?.name ?? "存档");
		function l(e) {
			e === "saves" ? YL() : a.windowOpen = !1;
		}
		let u = () => i.info("另一个窗口正在使用这份数据，这里只能查看");
		return (e, n) => (U(), W("div", UB, [o.value ? (U(), W(H, { key: 0 }, [
			t.layout === "narrow" ? J("", !0) : (U(), W("button", {
				key: 0,
				class: "trpg-pill trpg-chip",
				type: "button",
				"data-testid": "save-chip",
				"aria-haspopup": "dialog",
				onClick: n[0] ||= (...e) => R(YL) && R(YL)(...e)
			}, [K("span", WB, F(c.value), 1), q(FT, {
				name: "caret-down",
				size: 14
			})])),
			R(r).dirty && !R(r).readOnly ? (U(), W("button", {
				key: 1,
				class: "trpg-btn trpg-btn--small trpg-btn--primary",
				type: "button",
				"data-testid": "save-button",
				onClick: n[1] ||= (e) => R(ZL)()
			}, "● 保存存档")) : J("", !0),
			R(r).readOnly ? (U(), W("button", {
				key: 2,
				class: "trpg-badge trpg-badge--button",
				"data-tone": "warn",
				type: "button",
				onClick: u
			}, "只读")) : J("", !0)
		], 64)) : J("", !0), t.layout === "narrow" ? (U(), G(rI, {
			key: 1,
			label: "助手",
			items: s.value,
			onSelect: l
		}, null, 8, ["items"])) : J("", !0)]));
	}
}), KB = "trpg-assistant:window";
function qB(e, t, n) {
	let r = Math.min(Math.max(e.w, 360), Math.max(360, t)), i = Math.min(Math.max(e.h, 480), Math.max(480, n));
	return {
		w: r,
		h: i,
		x: Math.min(Math.max(e.x, 0), Math.max(0, t - r)),
		y: Math.min(Math.max(e.y, 0), Math.max(0, n - i))
	};
}
function JB(e, t) {
	let n = Math.min(960, e - 32), r = Math.min(640, t - 32);
	return qB({
		w: n,
		h: r,
		x: Math.round((e - n) / 2),
		y: Math.round((t - r) / 2)
	}, e, t);
}
function YB(e, t) {
	try {
		let n = localStorage.getItem(KB);
		if (n) {
			let r = JSON.parse(n);
			if ([
				r.x,
				r.y,
				r.w,
				r.h
			].every(Number.isFinite)) return qB(r, e, t);
		}
	} catch (e) {
		console.warn("[trpg-assistant] 读取窗口位置失败", e);
	}
	return JB(e, t);
}
function XB(e) {
	try {
		localStorage.setItem(KB, JSON.stringify(e));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/MainWindow.vue?vue&type=script&setup=true&lang.ts
var ZB = ["data-layout", "data-fullscreen"], QB = ["inert"], $B = {
	key: 0,
	class: "trpg-side",
	"aria-label": "主导航"
}, eV = {
	key: 0,
	class: "trpg-side__name"
}, tV = { class: "trpg-side__list" }, nV = [
	"aria-current",
	"title",
	"onClick"
], rV = { key: 0 }, iV = { class: "trpg-side__list trpg-side__bottom" }, aV = [
	"aria-current",
	"title",
	"onClick"
], oV = { key: 0 }, sV = { class: "trpg-main" }, cV = { class: "trpg-head__title" }, lV = { class: "trpg-body" }, uV = {
	class: "trpg-content",
	tabindex: "-1"
}, dV = ["aria-pressed"], fV = {
	key: 0,
	class: "trpg-tabs",
	"aria-label": "主导航"
}, pV = ["aria-current", "onClick"], mV = /* @__PURE__ */ B({
	__name: "MainWindow",
	setup(e) {
		let t = ST(), n = wE(), r = Y(() => [{
			id: "home",
			label: "首页",
			icon: "house"
		}, {
			id: "settings",
			label: "设置",
			icon: "gear",
			bottom: !0
		}]), i = {
			home: pR,
			settings: HB
		}, a = /* @__PURE__ */ L(window.innerWidth), o = /* @__PURE__ */ L(window.innerHeight), s = /* @__PURE__ */ L(YB(a.value, o.value)), c = /* @__PURE__ */ L(null), l = /* @__PURE__ */ L(s.value.w), u = Y(() => a.value <= 480), d = Y(() => l.value >= 720 ? "wide" : l.value > 480 ? "mid" : "narrow"), f = Y(() => u.value ? {} : {
			left: `${s.value.x}px`,
			top: `${s.value.y}px`,
			width: `${s.value.w}px`,
			height: `${s.value.h}px`
		}), p = Y(() => xT[t.page]), m = Y(() => r.value.filter((e) => !e.bottom)), h = Y(() => r.value.filter((e) => e.bottom)), g = zT({
			position: Y({
				get: () => ({
					x: s.value.x,
					y: s.value.y
				}),
				set: (e) => {
					s.value = {
						...s.value,
						x: e.x,
						y: e.y
					};
				}
			}),
			size: () => ({
				w: s.value.w,
				h: s.value.h
			}),
			onEnd: () => XB(s.value)
		});
		function _(e) {
			u.value || g.onPointerDown(e);
		}
		function v(e) {
			let t = e.currentTarget;
			t.setPointerCapture(e.pointerId);
			let n = e.clientX, r = e.clientY, i = { ...s.value }, c = (e) => {
				s.value = {
					...i,
					w: Math.min(Math.max(i.w + e.clientX - n, 360), Math.max(360, a.value - i.x)),
					h: Math.min(Math.max(i.h + e.clientY - r, 480), Math.max(480, o.value - i.y))
				};
			}, l = () => {
				t.removeEventListener("pointermove", c), t.removeEventListener("pointerup", l), t.removeEventListener("pointercancel", l), XB(s.value);
			};
			t.addEventListener("pointermove", c), t.addEventListener("pointerup", l), t.addEventListener("pointercancel", l);
		}
		function y() {
			a.value = window.innerWidth, o.value = window.innerHeight, s.value = qB(s.value, a.value, o.value);
		}
		function b(e) {
			(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s" && (e.preventDefault(), ZL());
		}
		let x;
		return Ca(() => {
			window.addEventListener("resize", y), x = new ResizeObserver((e) => {
				let t = e[0]?.contentRect.width;
				t && (l.value = t);
			}), c.value && x.observe(c.value);
		}), Ea(() => {
			window.removeEventListener("resize", y), x?.disconnect();
		}), (e, a) => (U(), W("section", {
			ref_key: "winEl",
			ref: c,
			class: "trpg-window",
			style: Ie(f.value),
			"data-layout": d.value,
			"data-fullscreen": u.value,
			role: "dialog",
			"aria-label": "TRPG 跑团助手",
			onKeydown: b
		}, [
			K("div", {
				class: "trpg-shell",
				inert: R(n).isOpen
			}, [d.value === "narrow" ? J("", !0) : (U(), W("nav", $B, [
				K("div", {
					class: "trpg-side__brand",
					title: "拖动窗口",
					onPointerdown: _
				}, [q(FT, {
					name: "dice-five",
					size: 22
				}), d.value === "wide" ? (U(), W("span", eV, "TRPG 跑团助手")) : J("", !0)], 32),
				K("ul", tV, [(U(!0), W(H, null, Ba(m.value, (e) => (U(), W("li", { key: e.id }, [K("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": R(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => R(t).go(e.id)
				}, [q(FT, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (U(), W("span", rV, F(e.label), 1)) : J("", !0)], 8, nV)]))), 128))]),
				K("ul", iV, [(U(!0), W(H, null, Ba(h.value, (e) => (U(), W("li", { key: e.id }, [K("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": R(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => R(t).go(e.id)
				}, [q(FT, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (U(), W("span", oV, F(e.label), 1)) : J("", !0)], 8, aV)]))), 128))])
			])), K("div", sV, [
				K("header", {
					class: "trpg-head",
					title: "拖动窗口",
					onPointerdown: _
				}, [
					K("h1", cV, F(p.value), 1),
					q(GB, { layout: d.value }, null, 8, ["layout"]),
					d.value === "narrow" ? J("", !0) : (U(), W("button", {
						key: 0,
						class: "trpg-icon-btn",
						type: "button",
						"aria-label": "收起助手",
						onClick: a[0] ||= (e) => R(t).windowOpen = !1
					}, [q(FT, {
						name: "x",
						size: 18
					})]))
				], 32),
				K("div", lV, [K("main", uV, [(U(), G(Ia(i[R(t).page])))]), K("button", {
					class: "trpg-dice-btn",
					type: "button",
					"aria-label": "掷骰",
					"aria-pressed": R(t).diceOpen,
					onClick: a[1] ||= (e) => R(t).diceOpen = !R(t).diceOpen
				}, [q(FT, {
					name: "dice-five",
					size: 28
				})], 8, dV)]),
				d.value === "narrow" ? (U(), W("nav", fV, [(U(!0), W(H, null, Ba(r.value, (e) => (U(), W("button", {
					key: e.id,
					class: "trpg-tab",
					type: "button",
					"aria-current": R(t).page === e.id ? "page" : void 0,
					onClick: (n) => R(t).go(e.id)
				}, [q(FT, {
					name: e.icon,
					size: 22
				}, null, 8, ["name"]), K("span", null, F(e.label), 1)], 8, pV))), 128))])) : J("", !0)
			])], 8, QB),
			q(jE),
			u.value ? J("", !0) : (U(), W("div", {
				key: 0,
				class: "trpg-resize",
				"aria-hidden": "true",
				onPointerdown: v
			}, null, 32))
		], 44, ZB));
	}
}), hV = { class: "trpg-root" }, gV = /* @__PURE__ */ B({
	__name: "App",
	props: {
		ctx: {},
		portalTarget: {}
	},
	setup(e) {
		let t = e;
		Wr("portalTarget", t.portalTarget), Wr("stCtx", t.ctx);
		let n = ST();
		return (e, t) => (U(), W("div", hV, [
			q(CE),
			R(n).windowOpen ? (U(), G(mV, { key: 0 })) : J("", !0),
			q(bE),
			q(DT)
		]));
	}
}), _V = ".trpg-btn{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);min-height:36px;color:var(--ink);font:inherit;cursor:pointer;white-space:nowrap;justify-content:center;align-items:center;gap:6px;padding:4px 14px;display:inline-flex}.trpg-btn:hover:not(:disabled){border-color:var(--primary)}.trpg-btn:disabled{opacity:.5;cursor:not-allowed}.trpg-btn--primary{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-btn--danger{background:var(--danger);color:#fffcf6;border-color:var(--danger)}.trpg-btn--quiet{background:0 0;border-color:#0000}.trpg-btn--small{min-height:30px;padding:2px 10px;font-size:13px}.trpg-icon-btn{border-radius:var(--radius-sm);min-width:36px;min-height:36px;color:inherit;cursor:pointer;background:0 0;border:1px solid #0000;justify-content:center;align-items:center;display:inline-flex}.trpg-icon-btn:hover{border-color:currentColor}.trpg-input{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);padding:4px 10px}.trpg-input:disabled{opacity:.6}textarea.trpg-input{resize:vertical;min-height:72px}.trpg-field{gap:4px;display:grid}.trpg-field__label{color:var(--ink-2);font-size:13px}.trpg-field__hint{color:var(--ink-2);font-size:12.5px}.trpg-field__error{color:var(--danger);font-size:12.5px}.trpg-select-trigger{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);cursor:pointer;justify-content:space-between;align-items:center;gap:8px;padding:4px 10px;display:inline-flex}.trpg-select-content,.trpg-menu{min-width:var(--reka-select-trigger-width,160px);background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);box-shadow:var(--shadow-float);z-index:100003;color:var(--ink)}.trpg-select-content{max-height:min(8 * 36px, var(--reka-select-content-available-height));overflow:hidden}.trpg-select-viewport{max-height:inherit;padding:4px;overflow-y:auto}.trpg-select-item,.trpg-menu__item{border-radius:var(--radius-xs);cursor:pointer;min-height:40px;color:var(--ink);justify-content:space-between;align-items:center;gap:12px;padding:4px 10px;display:flex}.trpg-menu{min-width:168px;padding:4px}.trpg-select-item[data-highlighted],.trpg-menu__item[data-highlighted]{background:var(--panel);outline:none}.trpg-select-item[data-state=checked]{color:var(--primary);font-weight:600}.trpg-menu__item--danger{color:var(--danger)}.trpg-menu__item[data-disabled]{opacity:.5;cursor:not-allowed}.trpg-menu__reason{color:var(--ink-2);font-size:12px}.trpg-seg{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);display:inline-flex;overflow:hidden}.trpg-seg button{min-height:34px;color:var(--ink);background:0 0;border:0;padding:2px 14px}.trpg-seg button+button{border-left:1px solid var(--line)}.trpg-seg button[aria-pressed=true]{background:var(--primary);color:var(--primary-ink)}.trpg-badge{border-radius:var(--radius-xs);background:var(--panel);border:1px solid var(--line);color:var(--ink-2);white-space:nowrap;padding:0 8px;font-size:12px;font-weight:600;line-height:20px;display:inline-block}.trpg-badge[data-tone=gold]{color:var(--ink);border-color:var(--gold);background:color-mix(in srgb, var(--gold) 28%, transparent)}.trpg-badge[data-tone=ok],.trpg-badge[data-status=pass]{color:var(--ok);border-color:var(--ok)}.trpg-badge[data-tone=danger],.trpg-badge[data-status=fail],.trpg-badge[data-status=error]{color:var(--danger);border-color:var(--danger)}.trpg-badge[data-tone=warn],.trpg-badge[data-status=waiting]{color:var(--unsaved);border-color:var(--unsaved)}.trpg-badge[data-tone=gold]{color:var(--gold);border-color:var(--gold)}.trpg-pill{border:1px solid var(--line);background:var(--card);border-radius:999px;align-items:center;gap:4px;min-height:30px;padding:0 12px;display:inline-flex}.trpg-switch-wrap{color:var(--ink-2);align-items:center;gap:6px;min-height:44px;display:inline-flex}.trpg-switch{border:2px solid var(--line);background:0 0;border-radius:999px;width:42px;height:24px;padding:0;transition:background .16s,border-color .16s;position:relative}.trpg-switch__thumb{background:var(--ink-2);border-radius:50%;width:16px;height:16px;transition:transform .16s,background .16s;position:absolute;top:2px;left:2px}.trpg-switch[data-on=true]{background:var(--primary);border-color:var(--primary)}.trpg-switch[data-on=true] .trpg-switch__thumb{background:var(--primary-ink);transform:translate(18px)}.trpg-switch:disabled{opacity:.55;cursor:not-allowed}.trpg-check{cursor:pointer;align-items:center;gap:8px;min-height:36px;display:inline-flex}.trpg-check[data-disabled=true]{opacity:.6;cursor:not-allowed}.trpg-check input{width:18px;height:18px;accent-color:var(--primary);flex:none;margin:0}.trpg-term{color:var(--ink);text-align:left;text-underline-offset:4px;cursor:pointer;background:0 0;border:0;padding:0;-webkit-text-decoration:underline dotted;text-decoration:underline dotted;text-decoration-thickness:1.5px;display:inline}.trpg-term:hover,.trpg-term:focus-visible{text-decoration-style:solid;-webkit-text-decoration-color:var(--gold);text-decoration-color:var(--gold)}.trpg-list{margin:0;padding:0;list-style:none}.trpg-row{border-bottom:1px solid var(--line);align-items:center;gap:12px;min-height:52px;padding:6px 4px;display:flex}.trpg-row__main{flex:1;min-width:0}.trpg-row__title{overflow-wrap:anywhere;font-weight:600}.trpg-row__meta{color:var(--ink-2);font-size:12.5px}.trpg-row__end{flex:none;align-items:center;gap:8px;display:flex}.trpg-group{font-family:var(--font-serif);color:var(--ink-2);margin:16px 0 4px;font-size:15px}.trpg-skeleton{background:linear-gradient(90deg, var(--panel), var(--line), var(--panel));opacity:.6;border-radius:4px;height:14px}.trpg-empty{text-align:center;color:var(--ink-2);padding:24px 8px}.trpg-progress{background:var(--panel);border-radius:3px;width:120px;height:6px;overflow:hidden}.trpg-progress>span{background:var(--primary);height:100%;transition:width .2s;display:block}.trpg-icon{vertical-align:-3px;flex:none}.trpg-toasts{left:50%;bottom:max(16px, env(safe-area-inset-bottom));z-index:100005;gap:8px;width:min(92vw,420px);display:grid;position:fixed;transform:translate(-50%)}.trpg-toast{border-radius:var(--radius-sm);background:var(--chrome);color:var(--chrome-ink);border-left:4px solid var(--gold);box-shadow:var(--shadow-float);align-items:center;gap:10px;padding:10px 12px;display:flex}.trpg-toast[data-kind=error]{border-left-color:var(--danger)}.trpg-toast[data-kind=success]{border-left-color:var(--ok)}.trpg-toast__text{flex:1}.trpg-toast button{color:var(--gold);background:0 0;border:0;min-height:32px;padding:0 8px;font-weight:600}@media (width<=480px){.trpg-toasts{bottom:calc(64px + env(safe-area-inset-bottom))}}.trpg-toast-enter-from,.trpg-toast-leave-to{opacity:0;transform:translateY(8px)}.trpg-toast-enter-active,.trpg-toast-leave-active{transition:opacity .16s,transform .16s}.trpg-modal-root{display:contents}.trpg-modal{background:var(--scrim);z-index:20;justify-content:center;align-items:center;padding:16px;display:flex;position:absolute;inset:0}.trpg-modal__card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:min(640px,100%);height:min(80%,640px);box-shadow:var(--shadow-float);flex-direction:column;animation:.16s ease-out trpg-pop;display:flex;overflow:hidden}.trpg-modal[data-variant=drawer]{justify-content:flex-end;padding:0}.trpg-modal[data-variant=drawer] .trpg-modal__card{border-radius:0;width:min(440px,100%);height:100%;animation:.2s ease-out trpg-slide}.trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true]{width:min(var(--trpg-drawer-width,440px), 100%)}.trpg-modal[data-variant=confirm] .trpg-modal__card{width:min(440px,100%);height:auto;max-height:90%}.trpg-modal[data-variant=confirm] .trpg-modal__page{position:relative}.trpg-modal__card:has(.trpg-library-card){width:min(1180px,100%);height:92%}.trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true]{width:min(var(--trpg-drawer-width,640px), 100%);height:min(86%, var(--trpg-dlg-h,800px));background:var(--card);border-radius:16px}.trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__page{flex-direction:column;padding:0;display:flex;overflow:hidden}.trpg-modal__head{border-bottom:1px solid var(--line);background:var(--panel);flex:none;align-items:center;gap:8px;min-height:52px;padding:4px 8px 4px 16px;display:flex}.trpg-modal__title{min-width:0;font-family:var(--font-serif);text-overflow:ellipsis;white-space:nowrap;flex:1;margin:0;font-size:17px;overflow:hidden}.trpg-modal__back{border-radius:var(--radius-sm);max-width:40%;min-height:36px;color:var(--primary);white-space:nowrap;background:0 0;border:0;align-items:center;gap:2px;margin-left:-8px;padding:0 8px;display:inline-flex}.trpg-modal__back span{text-overflow:ellipsis;overflow:hidden}.trpg-modal__back:hover{background:var(--card)}.trpg-modal__pages{flex:1;min-height:0;position:relative}.trpg-modal__page{padding:16px;transition:opacity .16s,transform .16s,visibility;position:absolute;inset:0;overflow:auto}.trpg-modal__page.is-under{opacity:0;visibility:hidden;transition:opacity .16s,transform .16s,visibility 0s .16s;transform:translate(-24px)}.trpg-page-enter-from,.trpg-page-leave-to{opacity:0;transform:translate(24px)}.trpg-page-enter-active,.trpg-page-leave-active{transition:opacity .16s,transform .16s}.trpg-modal[data-variant=confirm] .trpg-page-leave-active{position:absolute;inset:0}@keyframes trpg-pop{0%{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}@keyframes trpg-slide{0%{opacity:0;transform:translate(32px)}to{opacity:1;transform:none}}.trpg-confirm{gap:12px;display:grid}.trpg-confirm__message{margin:0}.trpg-confirm__details{color:var(--ink-2);margin:0;padding-left:18px}.trpg-confirm__actions{justify-content:flex-end;gap:8px;margin-top:4px;display:flex}.trpg-window[data-layout=narrow] .trpg-modal{background:var(--paper);align-items:stretch;padding:0}.trpg-window[data-layout=narrow] .trpg-modal__card{border:0;border-radius:0;width:100%;height:100%}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer]:has(.trpg-modal__card[data-sized=true]){background:var(--scrim);align-items:flex-end}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true]{border:1px solid var(--line);border-radius:var(--radius) var(--radius) 0 0;width:100%;height:92%}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true] .trpg-modal__head{background:var(--panel);min-height:56px;color:var(--ink);padding-top:10px;position:relative}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true] .trpg-modal__head:before{content:\"\";background:var(--line);border-radius:2px;width:36px;height:4px;position:absolute;top:6px;left:50%;transform:translate(-50%)}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true] .trpg-modal__back{color:var(--primary)}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog]:has(.trpg-modal__card[data-sized=true]){background:var(--scrim);align-items:flex-end}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true]{border:1px solid var(--line);border-radius:16px 16px 0 0;width:100%;height:92%;animation:.2s ease-out trpg-sheet}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__head{background:var(--card);min-height:56px;color:var(--ink);border-bottom:1px solid var(--line);padding-top:10px;position:relative}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__head:before{content:\"\";background:var(--line);border-radius:2px;width:36px;height:4px;position:absolute;top:6px;left:50%;transform:translate(-50%)}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__back{color:var(--primary)}@keyframes trpg-sheet{0%{opacity:0;transform:translateY(100%)}to{opacity:1;transform:none}}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm]{background:var(--scrim);align-items:flex-end}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm] .trpg-modal__card{border-radius:var(--radius) var(--radius) 0 0;height:auto}.trpg-window[data-layout=narrow] .trpg-confirm__actions{flex-direction:column-reverse}.trpg-window[data-layout=narrow] .trpg-confirm__actions .trpg-btn{min-height:44px}.trpg-window[data-layout=narrow] .trpg-modal__card:has(.trpg-library-card){width:min(1180px,100%);height:92%}.trpg-modal__card:has(.trpg-library-card) .trpg-modal__page{padding:0}.trpg-modal__head{background:var(--chrome);min-height:48px;color:var(--chrome-ink);border-bottom:0}.trpg-window[data-layout=narrow] .trpg-modal__back{color:var(--gold)}.trpg-window[data-layout=narrow] .trpg-modal__back,.trpg-window[data-layout=narrow] .trpg-modal__close{min-width:44px;min-height:44px}.trpg-drawer{align-content:start;gap:14px;min-height:100%;display:grid}.trpg-drawer__current{border-bottom:1px solid var(--line);gap:8px;padding-bottom:12px;display:grid}.trpg-drawer__name{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-drawer__title{font-family:var(--font-serif);overflow-wrap:anywhere;font-size:20px;font-weight:600}.trpg-drawer__buttons{flex-wrap:wrap;gap:8px;display:flex}.trpg-drawer__filter{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-drawer__filter .trpg-input{flex:1;min-width:140px}.trpg-drawer__bottom{border-top:1px solid var(--line);background:var(--paper);justify-content:space-between;gap:8px;margin:0 -16px -16px;padding:12px 16px;display:flex;position:sticky;bottom:-16px}.trpg-warn{color:var(--unsaved)}.trpg-saves{margin:0;padding:0;list-style:none}.trpg-save{border-bottom:1px solid var(--line);align-items:flex-start;gap:8px;padding:10px 4px;display:flex}.trpg-save[data-current=true]{background:color-mix(in srgb, var(--gold) 14%, transparent)}.trpg-save__main{flex:1;gap:2px;min-width:0;display:grid}.trpg-save__top{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.trpg-save__name{overflow-wrap:anywhere;font-weight:600}.trpg-save__time{color:var(--ink-2);margin-left:auto;font-size:12.5px}.trpg-save__rename{flex:1;min-height:32px}.trpg-save__noteedit{gap:6px;display:grid}.trpg-save__noteactions{justify-content:flex-end;gap:6px;display:flex}.trpg-folds{gap:6px;display:grid}.trpg-folds__tabs{flex-wrap:wrap;gap:4px;display:flex}.trpg-popover{z-index:100003;background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);width:min(320px,92vw);box-shadow:var(--shadow-float);padding:12px}.trpg-confirm__actions--stack{flex-wrap:wrap;justify-content:flex-end}.trpg-import__ok{color:var(--ok);margin:0;font-weight:600}.trpg-compare{border-collapse:collapse;width:100%;font-size:13px}.trpg-compare th,.trpg-compare td{border-bottom:1px solid var(--line);text-align:left;padding:4px 8px;font-weight:400}.trpg-compare thead th{color:var(--ink-2)}.trpg-window[data-layout=narrow] .trpg-confirm__actions--stack{flex-direction:column-reverse}.trpg-window[data-layout=narrow] .trpg-confirm__actions--stack .trpg-btn{min-height:44px}.trpg-wizard{flex-direction:column;min-height:100%;display:flex}.trpg-wizard__body{flex:1;padding:8px 0 16px}.trpg-wizard__foot{border-top:1px solid var(--line);background:var(--paper);justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:12px 16px;display:flex;position:sticky;bottom:-16px}.trpg-steps{gap:4px;margin:0;padding:0;list-style:none;display:flex}.trpg-steps li{flex:1}.trpg-steps button{border:0;border-bottom:2px solid var(--line);width:100%;min-height:36px;color:var(--ink-2);background:0 0;justify-content:center;align-items:center;gap:6px;padding:0 6px;display:flex}.trpg-steps button:disabled{cursor:default}.trpg-steps li[data-state=current] button{color:var(--primary);border-bottom-color:var(--primary);font-weight:600}.trpg-steps li[data-state=done] button{color:var(--ink);border-bottom-color:var(--gold);cursor:pointer}.trpg-steps li[data-skipped=true] button{opacity:.45}.trpg-steps__n{border:1px solid;border-radius:50%;place-items:center;width:20px;height:20px;font-size:12px;display:inline-grid}.trpg-steps__compact{color:var(--ink-2);margin:0;font-size:13px;display:none}.trpg-window[data-layout=narrow] .trpg-steps{display:none}.trpg-window[data-layout=narrow] .trpg-steps__compact{display:block}.trpg-step-title{font-family:var(--font-serif);margin:0;font-size:17px}.trpg-step-head{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;display:flex}.trpg-step-actions{gap:6px;display:inline-flex}.trpg-rulecards{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;display:grid}.trpg-rulecard{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow-card);cursor:pointer;gap:10px;padding:14px;display:flex}.trpg-rulecard[aria-checked=true]{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary), var(--shadow-card)}.trpg-rulecard[data-status=coming]{opacity:.55;cursor:default}.trpg-rulecard__mark{color:var(--primary);font-size:18px;line-height:1.3}.trpg-rulecard__body{justify-items:start;gap:4px;display:grid}.trpg-radio{cursor:pointer}.trpg-radio input{width:18px;height:18px;accent-color:var(--primary)}.trpg-detail-links{gap:6px;margin:0;padding:0;list-style:none;display:grid}.trpg-info__line{margin:0}.trpg-vlist{height:100%;min-height:160px;position:relative;overflow-y:auto}.trpg-vlist__space{position:relative}.trpg-vlist__row{border-bottom:1px solid var(--line);align-items:center;gap:10px;padding:0 4px;display:flex;position:absolute;left:0;right:0}.trpg-blocks{gap:8px;display:grid}.trpg-blocks__p{margin:0}.trpg-blocks__h h4{font-family:var(--font-serif);margin:8px 0 4px;font-size:15px}.trpg-blocks__list{margin:0;padding-left:20px}.trpg-blocks__table{overflow-x:auto}.trpg-blocks__table table{border-collapse:collapse;min-width:100%;font-size:13px}.trpg-blocks__table th,.trpg-blocks__table td{border:1px solid var(--line);text-align:left;padding:4px 8px}.trpg-blocks__table caption{text-align:left;padding:4px 0;font-weight:600}.trpg-blocks__quote{border-left:3px solid var(--gold);color:var(--ink-2);margin:0;padding-left:12px}.trpg-blocks__read{background:var(--panel);border-radius:var(--radius-sm);padding:8px 12px}.trpg-blocks__mark{color:var(--primary)}.trpg-variantbar{border:1px solid var(--gold);border-radius:var(--radius-sm);background:color-mix(in srgb, var(--gold) 12%, transparent);flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;display:flex}.trpg-variantbar__text{flex:1;min-width:200px}.trpg-variantbar__actions{gap:6px;display:flex}.trpg-variantpick{border:0;gap:6px;margin:0;padding:0;display:grid}.trpg-variantpick .trpg-radio{align-items:flex-start;gap:8px;min-height:36px;display:flex}.trpg-pack-actions{align-items:center;gap:6px;display:inline-flex}.trpg-packdetail{flex-direction:column;gap:10px;height:100%;display:flex}.trpg-packdetail__desc{margin:0}.trpg-packdetail__filter{grid-template-columns:minmax(140px,200px) 1fr auto;align-items:center;gap:8px;display:grid}.trpg-packdetail__list{flex:1;min-height:200px}.trpg-entryrow{flex:1;align-items:baseline;gap:10px;min-width:0;display:flex}.trpg-entryrow .trpg-term{white-space:nowrap;flex:none}.trpg-entryrow__sum{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.trpg-entry__summary{color:var(--ink-2);margin:0}.trpg-entry__lore{gap:6px;display:grid}.trpg-entry__lore-title{font-family:var(--font-serif);margin:8px 0 0;font-size:15px}.trpg-window[data-layout=narrow] .trpg-packdetail__filter{grid-template-columns:1fr}.trpg-modal__page:has(.trpg-packdetail){flex-direction:column;display:flex;overflow:hidden}.trpg-toolbar{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-toolbar__search{flex:1;min-width:160px;max-width:280px}.trpg-pill[aria-pressed=true]{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-row--series{background:var(--panel);min-height:36px}.trpg-row--nested{padding-left:20px}.trpg-packdetail{flex:1;min-height:0}.trpg-issuerow{border:1px solid var(--unsaved);border-radius:var(--radius-sm);background:color-mix(in srgb, var(--unsaved) 12%, transparent);justify-content:space-between;align-items:center;gap:8px;padding:8px 12px;display:flex}.trpg-variantrow{margin-top:8px}.trpg-group--first{margin-top:0}.trpg-row__end--select{width:180px}.trpg-row__end--wrap{flex-wrap:wrap;justify-content:flex-end}.trpg-toolbar--between{justify-content:space-between}.trpg-toolbar__end{align-items:center;gap:10px;display:inline-flex}.trpg-minesub{flex-direction:column;gap:10px;height:100%;min-height:420px;display:flex}.trpg-minesub__list{flex:1;min-height:220px}.trpg-drawer[data-dragging=true]:after{content:\"松开以导入\";z-index:5;border:2px dashed var(--primary);border-radius:var(--radius);background:color-mix(in srgb, var(--paper) 88%, transparent);color:var(--primary);place-items:center;font-weight:600;display:grid;position:absolute;inset:0}.trpg-drawer{position:relative}.trpg-combo__anchor{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);align-items:center;display:flex}.trpg-combo__input{min-width:0;min-height:36px;color:var(--ink);background:0 0;border:0;flex:1;padding:4px 10px}.trpg-combo__input:focus-visible{outline:none}.trpg-combo__anchor:focus-within{outline:2px solid var(--primary);outline-offset:1px}.trpg-combo__content{width:var(--reka-combobox-trigger-width);min-width:260px}.trpg-combo__count{border-bottom:1px solid var(--line);color:var(--ink-2);padding:6px 10px;font-size:12.5px}.trpg-combo__empty{color:var(--ink-2);padding:12px 10px}.trpg-tag{gap:2px;padding-right:2px}.trpg-tag__x{min-width:28px;min-height:28px;color:var(--ink-2);background:0 0;border:0;border-radius:999px;font-size:16px;line-height:1}.trpg-tag__x:hover{color:var(--danger)}.trpg-facts{grid-template-columns:max-content 1fr;gap:6px 14px;margin:0;display:grid}.trpg-facts__label{color:var(--ink-2);white-space:nowrap;padding-top:1px;font-size:13px}.trpg-facts__value{white-space:pre-line;overflow-wrap:anywhere;margin:0}.trpg-facts__sections,.trpg-facts__members{white-space:normal;gap:8px;display:grid}.trpg-facts__members h4{font-family:var(--font-serif);margin:0 0 2px;font-size:14px}.trpg-row__warn{color:var(--accent,#b45309)}.trpg-facts__sub{margin-left:4px;font-size:12px}.trpg-facts__member-row{flex-wrap:wrap;align-items:baseline;gap:2px 14px;display:flex}.trpg-facts__member-label{min-width:4.5em;font-weight:600}.trpg-facts__sections h4{font-family:var(--font-serif);margin:0 0 2px;font-size:14px}.trpg-window[data-layout=narrow] .trpg-facts{grid-template-columns:1fr;gap:2px}.trpg-window[data-layout=narrow] .trpg-facts__value{margin-bottom:8px}.trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__head{background:var(--card);min-height:52px;color:var(--ink);border-bottom:1px solid var(--line)}.trpg-tip{max-width:100%;display:inline-flex;position:relative}.trpg-tip.is-inline{display:inline}.trpg-tip__bubble{z-index:60;background:var(--ink);max-width:260px;color:var(--paper);text-align:left;white-space:pre-line;pointer-events:none;box-shadow:var(--shadow-float);border-radius:9px;gap:1px;padding:8px 11px;font-size:12.5px;line-height:1.5;animation:.12s ease-out trpg-tip;display:grid;position:fixed}.trpg-tip__line{font-variant-numeric:tabular-nums;display:block}@keyframes trpg-tip{0%{opacity:0}to{opacity:1}}.trpg-btabs{background:var(--panel);border-bottom:1px solid var(--line);scrollbar-width:none;flex:none;gap:2px;padding:8px 14px 0;display:flex;overflow-x:auto}.trpg-btabs::-webkit-scrollbar{display:none}.trpg-btabs__tab{min-height:40px;color:var(--ink-2);white-space:nowrap;background:0 0;border:1px solid #0000;border-bottom:0;border-radius:10px 10px 0 0;flex:none;align-items:center;gap:6px;margin-bottom:-1px;padding:0 16px;font-size:14px;font-weight:500;display:inline-flex}.trpg-btabs__tab:hover:not(:disabled){background:var(--card)}.trpg-btabs__tab[aria-selected=true]{background:var(--card);border-color:var(--line);color:var(--ink);padding-bottom:1px;font-weight:700}.trpg-btabs__tab:disabled{opacity:.45;cursor:not-allowed}.trpg-btabs__count{background:color-mix(in srgb, var(--ink) 12%, transparent);border-radius:999px;place-items:center;min-width:20px;height:20px;padding:0 6px;font-size:12px;font-weight:600;display:inline-grid}.trpg-item{border:1px solid var(--line);background:var(--card);border-radius:12px;gap:8px;padding:14px 16px;display:grid}.trpg-item__head{align-items:baseline;gap:8px;display:flex}.trpg-item__title{min-width:0;font:700 17px/1.3 var(--font-serif);flex:1;margin:0}.trpg-item__hint{min-width:24px;min-height:24px;color:var(--ink-2);place-items:center;display:inline-grid}button.trpg-rulelink.trpg-item__hint{appearance:none;cursor:pointer;background:0 0;border:0;border-radius:6px;padding:0}button.trpg-rulelink.trpg-item__hint:hover{color:var(--primary);background:var(--panel)}.trpg-item__value{font:700 24px/1 var(--font-serif);font-variant-numeric:tabular-nums}.trpg-item__auto{color:var(--ink-2);text-align:right;margin:0;font-size:12px}.trpg-item__sources{color:var(--ink-2);gap:2px;margin:0;padding:0;font-size:13px;list-style:none;display:grid}.trpg-item__sources li{align-items:baseline;gap:10px;min-width:0;display:flex}.trpg-item__sources li.is-overridden{opacity:.6;text-decoration:line-through}.trpg-item__label{flex:1;min-width:0}.trpg-item__num{font-variant-numeric:tabular-nums}.trpg-item__note{font-size:12px}.trpg-item__edit{flex-wrap:wrap;align-items:center;gap:10px 16px;display:flex}.trpg-stepper{justify-content:center;align-items:center;gap:10px;display:inline-flex}.trpg-stepper__btn{border:1px solid var(--line);background:var(--card);width:28px;height:28px;color:var(--ink);cursor:pointer;border-radius:50%;place-items:center;padding:0;display:inline-grid}.trpg-stepper__btn:hover:not(:disabled){border-color:var(--primary);color:var(--primary)}.trpg-stepper__btn:disabled{opacity:.35;cursor:not-allowed}.trpg-stepper__val{text-align:center;min-width:2ch;font:700 20px/1 var(--font-serif);font-variant-numeric:tabular-nums}.trpg-seg button:disabled{opacity:.4;cursor:not-allowed}", vV = ".probe{border-bottom:1px solid var(--line);padding:10px 0}.probe__head{justify-content:space-between;align-items:center;gap:8px;display:flex}.probe__title{font-family:var(--font-serif);margin:0;font-size:15px}.probe__hint{color:var(--ink-2);margin:4px 0;font-size:12.5px}.probe__summary{margin:4px 0}.probe__actions{flex-wrap:wrap;gap:6px;margin-top:6px;display:flex}.probe pre{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);white-space:pre-wrap;word-break:break-all;max-height:200px;margin:6px 0 0;padding:8px;font-size:11.5px;overflow:auto}.probe summary{cursor:pointer;color:var(--ink-2);font-size:12.5px}.lab{background:var(--panel);border-radius:var(--radius);gap:10px;margin-top:8px;padding:10px;display:grid}.lab__row{gap:6px;display:grid}.report-bar{flex-wrap:wrap;align-items:center;gap:8px;padding:10px 0;display:flex}", yV = ".trpg-btn,.trpg-icon-btn,.trpg-tabs2__tab,.trpg-person,.trpg-tplcard{transition:transform .16s cubic-bezier(0,0,.2,1),box-shadow .16s cubic-bezier(0,0,.2,1)}.trpg-btn:active:not(:disabled),.trpg-icon-btn:active:not(:disabled),.trpg-tabs2__tab:active,.trpg-tplcard:active{transition-duration:80ms;transform:scale(.97)}.trpg-tplcard:hover:not(:active){box-shadow:var(--shadow-card-hover);transform:translateY(-1px)}.trpg-person:hover{box-shadow:var(--shadow-card-hover)}@media (prefers-reduced-motion:reduce){.trpg-btn,.trpg-icon-btn,.trpg-tabs2__tab,.trpg-person,.trpg-tplcard{transition:none}.trpg-btn:active:not(:disabled),.trpg-icon-btn:active:not(:disabled),.trpg-tabs2__tab:active,.trpg-tplcard:active,.trpg-tplcard:hover:not(:active){transform:none}}.trpg-frame{width:var(--fw,72px);height:var(--fh,90px);border:1px solid var(--frame);background:var(--paper);border-radius:8px;flex:none;padding:1px;display:inline-block;position:relative}.trpg-frame__gold{border:2px solid var(--gold);background:var(--paper);border-radius:6px;width:100%;height:100%;padding:2px;display:block}.trpg-frame__pic{background:linear-gradient(180deg, var(--panel), var(--card));border-radius:3px;justify-content:center;align-items:center;width:100%;height:100%;display:flex;overflow:hidden}.trpg-frame__img{object-fit:cover;width:100%;height:100%;display:block}.trpg-frame__ph{width:var(--ficon,36px);height:var(--ficon,36px);fill:currentColor;color:color-mix(in srgb, var(--ink-2) 60%, transparent)}.trpg-frame__badge{border:1px solid var(--frame);background:var(--card);width:22px;height:22px;color:var(--ink);border-radius:50%;place-items:center;display:grid;position:absolute;bottom:-5px;right:-5px}.trpg-stat{text-align:center;font-variant-numeric:tabular-nums;display:block}.trpg-stat__label{width:100%;color:var(--ink-2);font-size:12px;line-height:16px;display:inline-block}.trpg-stat__sp{white-space:pre;font-size:0}.trpg-stat__value{font-family:var(--font-serif);color:var(--ink);font-size:24px;font-weight:700;line-height:30px;display:inline-block}.trpg-stat--md .trpg-stat__value{font-size:20px;font-weight:600;line-height:26px}.trpg-stat__unit{font-family:var(--font-sans);color:var(--ink-2);font-size:14px;font-weight:400}.trpg-hpm{font-variant-numeric:tabular-nums;width:100%;display:block}.trpg-hpm__top{align-items:baseline;gap:8px;margin-bottom:4px;display:flex}.trpg-hpm__top .trpg-stat__label{text-align:left;white-space:nowrap;flex:1 0 auto;width:auto}.trpg-hpm__num{font-family:var(--font-serif);color:var(--ink);white-space:nowrap;font-size:18px;font-weight:600;line-height:24px}.trpg-hpm__num b{font-weight:600}.trpg-hpm__num i{color:var(--ink-2);margin:0 3px;font-size:14px;font-style:normal}.trpg-hpm__num span{color:var(--ink-2);font-size:14px}.trpg-hpm__track{background:var(--hp-track);border-radius:4px;width:100%;height:8px;display:block;position:relative;overflow:hidden}.trpg-hpm__fill{background:var(--hp);border-radius:4px;position:absolute;inset:0 auto 0 0}.trpg-hpm__temp{background:var(--gold);position:absolute;top:0;bottom:0}.trpg-tabs2{background:var(--panel);scrollbar-width:none;border-radius:14px;gap:4px;max-width:100%;padding:4px;display:inline-flex;overflow-x:auto}.trpg-tabs2::-webkit-scrollbar{display:none}.trpg-tabs2__tab{height:44px;color:var(--ink);white-space:nowrap;background:0 0;border:0;border-radius:10px;flex:none;justify-content:center;align-items:center;gap:8px;padding:0 16px;font-size:15px;font-weight:600;display:inline-flex}.trpg-tabs2__tab:hover:not([aria-selected=true]){background:color-mix(in srgb, var(--card) 60%, transparent)}.trpg-tabs2__tab[aria-selected=true]{background:var(--primary);color:var(--primary-ink)}.trpg-tabs2__count{background:var(--card);min-width:22px;color:var(--ink-2);text-align:center;font-variant-numeric:tabular-nums;border-radius:999px;padding:0 7px;font-size:12px;font-weight:600;line-height:20px;display:inline-block}.trpg-tabs2__tab[aria-selected=true] .trpg-tabs2__count{background:color-mix(in srgb, var(--primary-ink) 22%, transparent);color:var(--primary-ink)}.trpg-search{min-width:0;color:var(--ink-2);flex:160px;align-items:center;display:flex;position:relative}.trpg-search>.trpg-icon{pointer-events:none;position:absolute;left:13px}.trpg-search__input{border:1px solid var(--line);background:var(--card);width:100%;height:40px;color:var(--ink);border-radius:10px;padding:0 36px 0 38px}.trpg-search__input::placeholder{color:var(--ink-2)}.trpg-search__input::-webkit-search-cancel-button{appearance:none;display:none}.trpg-search__input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb, var(--primary) 16%, transparent);outline:none}.trpg-search__clear{width:28px;height:28px;color:var(--ink-2);background:0 0;border:0;border-radius:50%;place-items:center;display:grid;position:absolute;right:6px}.trpg-search__clear:hover{background:var(--panel)}.trpg-search__clear:after{content:\"\";position:absolute;inset:-8px}.trpg-toolrow{flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:12px;display:flex}.trpg-toolrow .trpg-btn,.trpg-toolrow .trpg-select-trigger,.trpg-toolrow .trpg-combo__anchor{border-radius:10px;height:40px;min-height:40px}.trpg-toolrow .trpg-btn{padding:0 14px}.trpg-toolrow .trpg-btn--square{width:40px;padding:0}.trpg-toolrow__tag{flex:none;width:104px;min-width:0}.trpg-toolrow__sort{flex:none;width:164px;min-width:0}.trpg-toolrow__count{color:var(--ink-2);white-space:nowrap;font-variant-numeric:tabular-nums;margin-left:auto;font-size:13px}.trpg-select-trigger__text{white-space:nowrap;align-items:baseline;gap:2px;min-width:0;display:inline-flex;overflow:hidden}.trpg-select-trigger__prefix{color:var(--ink-2)}.trpg-toolrow__tag .trpg-combo__input::placeholder{color:var(--ink);opacity:1}.trpg-combo__anchor{border-radius:10px}.trpg-pill.trpg-tag{border-color:var(--line);background:var(--panel);min-height:26px;color:var(--ink);padding:0 2px 0 10px;font-size:12px}.trpg-tag__x{width:24px;min-width:24px;min-height:24px;position:relative}.trpg-tag__x:after{content:\"\";position:absolute;inset:-4px}.trpg-emptystate{color:color-mix(in srgb, var(--ink-2) 50%, transparent);text-align:center;justify-items:center;gap:12px;padding:48px 16px;display:grid}.trpg-emptystate__text{color:var(--ink-2);margin:0;font-size:15px}.trpg-emptystate .trpg-btn{color:var(--ink)}.trpg-modal__head{background:var(--paper);color:var(--ink)}.trpg-modal__title{font-size:20px;font-weight:700}.trpg-window[data-layout=narrow] .trpg-modal__head{background:var(--chrome);color:var(--chrome-ink)}.trpg-dialog{border:1px solid var(--line);background:var(--card);border-radius:12px;gap:12px;padding:16px;display:grid}.trpg-dialog__foot{justify-content:flex-end;gap:8px;padding-top:4px;display:flex}.trpg-dialog__foot .trpg-btn,.trpg-dialog .trpg-input,.trpg-dialog .trpg-select-trigger{border-radius:10px;min-height:40px}.trpg-btn--danger{color:var(--primary-ink)}.trpg-inline-confirm{border-left:3px solid var(--danger);background:var(--panel);border-radius:0 10px 10px 0;flex-wrap:wrap;align-items:center;gap:8px;min-height:44px;padding:8px 12px;display:flex}.trpg-inline-confirm>span:first-child{flex:200px}.trpg-mini{align-items:center;gap:12px;min-width:0;display:flex}.trpg-mini__main{flex:1;min-width:0}.trpg-mini__name{font-family:var(--font-serif);text-overflow:ellipsis;white-space:nowrap;font-size:16px;font-weight:700;display:block;overflow:hidden}.trpg-mini__sub{color:var(--ink-2);text-overflow:ellipsis;white-space:nowrap;font-size:13px;display:block;overflow:hidden}.trpg-mini__sub .is-strong{color:var(--ink);font-weight:600}@media (prefers-color-scheme:dark){.trpg-check input{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark}}", bV = ".trpg-root{z-index:100000;width:0;height:0;position:fixed;top:0;left:0}.trpg-ball{border:2px solid var(--gold);background:var(--chrome);width:48px;height:48px;color:var(--chrome-ink);cursor:grab;touch-action:none;border-radius:50%;place-items:center;padding:0;display:grid;position:fixed;box-shadow:0 2px 8px #00000059}.trpg-window{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow-float);color:var(--ink);position:fixed;overflow:hidden}.trpg-window[data-fullscreen=true]{border:0;border-radius:0;height:100dvh;inset:0}.trpg-shell{width:100%;height:100%;display:flex}.trpg-window[data-layout=narrow] .trpg-shell{padding-bottom:env(safe-area-inset-bottom);background:var(--paper);flex-direction:column}.trpg-window[data-fullscreen=true] .trpg-shell{padding-top:env(safe-area-inset-top);background:var(--chrome)}.trpg-side{background:var(--chrome);width:176px;color:var(--chrome-ink);flex-direction:column;flex:none;display:flex}.trpg-window[data-layout=mid] .trpg-side{width:56px}.trpg-side__brand{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;height:52px;font-family:var(--font-serif);border-bottom:1px solid var(--chrome-hover);color:var(--gold);align-items:center;gap:10px;padding:0 16px;font-size:16px;display:flex}.trpg-window[data-layout=mid] .trpg-side__brand{justify-content:center;padding:0}.trpg-side__list{gap:4px;margin:0;padding:8px;list-style:none;display:grid}.trpg-side__bottom{margin-top:auto}.trpg-nav{border-radius:var(--radius-sm);width:100%;min-height:44px;color:var(--chrome-ink);text-align:left;background:0 0;border:0;align-items:center;gap:12px;padding:0 12px;display:flex}.trpg-window[data-layout=mid] .trpg-nav{justify-content:center;padding:0}.trpg-nav:hover{background:var(--chrome-hover)}.trpg-nav[aria-current=page]{background:var(--chrome-hover);box-shadow:inset 3px 0 0 var(--gold)}.trpg-nav:focus-visible,.trpg-tab:focus-visible,.trpg-side__brand:focus-visible{outline-color:var(--gold)}.trpg-main{background:var(--paper);flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.trpg-head{border-bottom:1px solid var(--line);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;flex:none;align-items:center;gap:12px;height:52px;padding:0 12px 0 20px;display:flex}.trpg-head__title{font-family:var(--font-serif);flex:1;margin:0;font-size:19px;font-weight:600}.trpg-head__chips{align-items:center;gap:8px;display:flex}.trpg-content{outline:none;flex:1;min-height:0;padding:16px 20px 88px;position:relative;overflow:auto}.trpg-window[data-layout=narrow] .trpg-head{background:var(--chrome);height:48px;color:var(--chrome-ink);border-bottom:0;padding:0 8px 0 16px}.trpg-window[data-fullscreen=true] .trpg-head{cursor:default}.trpg-window[data-layout=narrow] .trpg-content{padding:12px 16px 88px}.trpg-tabs{background:var(--chrome);height:56px;color:var(--chrome-ink);flex:none;display:flex}.trpg-tab{min-width:64px;color:var(--chrome-ink);background:0 0;border:0;flex-direction:column;flex:1;justify-content:center;align-items:center;gap:2px;font-size:12px;display:flex}.trpg-tab[aria-current=page]{color:var(--gold);box-shadow:inset 0 3px 0 var(--gold)}.trpg-resize{cursor:nwse-resize;touch-action:none;z-index:30;background:linear-gradient(135deg, transparent 50%, var(--line) 50%, var(--line) 58%, transparent 58%, transparent 70%, var(--line) 70%, var(--line) 78%, transparent 78%);width:22px;height:22px;position:absolute;bottom:0;right:0}.page-stack{gap:16px;display:grid}.page-intro{color:var(--ink-2);margin:0}.subpage-back{border-radius:var(--radius-sm);min-height:36px;color:var(--primary);background:0 0;border:0;align-items:center;gap:2px;margin:0 0 8px -8px;padding:0 8px;display:inline-flex}.subpage-back:hover{background:var(--panel)}.trpg-body{flex:1;min-height:0;display:flex;position:relative}.trpg-body .trpg-content{flex:1}.trpg-dice-btn{z-index:6;border:2px solid var(--gold);background:var(--primary);width:52px;height:52px;color:var(--primary-ink);box-shadow:var(--shadow-float);border-radius:50%;place-items:center;padding:0;display:grid;position:absolute;bottom:20px;right:20px}.trpg-dice-btn[aria-pressed=true]{box-shadow:0 0 0 3px var(--gold), var(--shadow-float)}.trpg-window[data-layout=narrow] .trpg-dice-btn{bottom:16px;right:16px}.trpg-dice{z-index:30;background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:360px;max-height:calc(100dvh - 16px);box-shadow:var(--shadow-float);flex-direction:column;display:flex;position:fixed;overflow:hidden}.trpg-dice__head{background:var(--chrome);min-height:44px;color:var(--chrome-ink);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;flex:none;align-items:center;gap:8px;padding:0 6px 0 14px;display:flex}.trpg-dice__title{font-family:var(--font-serif);flex:1;font-size:16px}.trpg-dice__body{gap:14px;padding:14px 12px;display:grid;overflow-y:auto}.trpg-dice__lbl{color:var(--ink-2);justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px;font-size:12.5px;display:flex}.trpg-dice__row{align-items:center;gap:8px;display:flex}.trpg-dice__formula{min-height:44px;font-family:var(--font-serif);letter-spacing:.02em;font-size:20px}.trpg-dice__formula[aria-invalid=true]{border-color:var(--danger)}.trpg-dice__err{min-height:18px;margin-top:4px}.trpg-dice__faces{grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;display:grid}.trpg-dice__face{min-width:0;position:relative}.trpg-dice__die{border:1px solid var(--line);background:var(--card);width:100%;min-height:58px;color:var(--ink);border-radius:8px;align-content:center;justify-items:center;gap:2px;padding:4px 0 3px;font-size:12px;display:grid;position:relative}.trpg-dice__die:hover{border-color:var(--primary)}.trpg-dice__die[data-n]:not([data-n=\"0\"]){border-color:var(--primary);background:var(--panel)}.trpg-dice__die .trpg-die{width:28px;height:28px}.trpg-dice__cnt{background:var(--primary);min-width:20px;height:20px;color:var(--primary-ink);font-variant-numeric:tabular-nums;border-radius:10px;padding:0 5px;font-size:12px;line-height:20px;position:absolute;top:-6px;right:-4px}.trpg-dice__minus{border:1px solid var(--line);background:var(--card);width:22px;height:22px;color:var(--ink);border-radius:50%;padding:0;font-size:14px;line-height:18px;position:absolute;top:-8px;left:-6px}.trpg-dice__minus:after{content:\"\";position:absolute;inset:-10px}.trpg-die polygon,.trpg-die .trpg-die__body{fill:var(--card);stroke:var(--ink-2);stroke-width:3px;stroke-linejoin:round}.trpg-die .trpg-die__facet{fill:none;stroke:var(--line);stroke-width:2px;stroke-linejoin:round}.trpg-die text{fill:var(--ink);font-family:var(--font-serif);font-weight:600}.trpg-dice__die .trpg-die polygon,.trpg-dice__die .trpg-die .trpg-die__body{fill:none}.trpg-dice__die[data-n]:not([data-n=\"0\"]) .trpg-die polygon,.trpg-dice__die[data-n]:not([data-n=\"0\"]) .trpg-die .trpg-die__body{stroke:var(--primary)}.trpg-dice__adjust{flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:10px 16px;display:flex}.trpg-dice__step{align-items:center;gap:4px;display:inline-flex}.trpg-dice__step button{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:40px;height:40px;color:var(--ink);font-size:18px}.trpg-dice__step output{text-align:center;font-variant-numeric:tabular-nums;min-width:2.6em;font-weight:600}.trpg-dice__small{color:var(--ink-2);font-size:12px}.trpg-dice__step .trpg-dice__small{margin-right:4px}.trpg-dice .trpg-seg button{min-height:40px}.trpg-seg.is-off{opacity:.45}.trpg-seg.is-off button{cursor:not-allowed}.trpg-dice__roll{width:100%;min-height:54px;font-family:var(--font-serif);letter-spacing:.3em;text-indent:.3em;font-size:19px}.trpg-dice__result{border:1px solid var(--line);background:var(--card);border-radius:10px;justify-items:center;gap:8px;padding:14px 12px 12px;display:grid}.trpg-dice__hero{width:124px;height:124px}.trpg-dice__hero .trpg-die{width:100%;height:100%;overflow:visible}.trpg-dice__hero.is-rolling .trpg-die{animation:.46s ease-in-out trpg-tumble}.trpg-dice__hero.is-nat20 .trpg-die polygon,.trpg-dice__hero.is-nat20 .trpg-die .trpg-die__body{stroke:var(--gold);stroke-width:5px;fill:color-mix(in srgb, var(--gold) 22%, var(--card))}.trpg-dice__hero.is-nat1 .trpg-die polygon,.trpg-dice__hero.is-nat1 .trpg-die .trpg-die__body{stroke:var(--danger);stroke-width:5px;fill:color-mix(in srgb, var(--danger) 18%, var(--card))}.trpg-dice__line{min-height:22px;color:var(--ink-2);text-align:center;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}.trpg-dice__minis{flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;min-height:36px;display:flex}.trpg-dice__mini{width:38px;height:38px}.trpg-dice__mini.is-dim{opacity:.35}.trpg-dice__mini .trpg-die{width:100%;height:100%}.trpg-dice__const{background:var(--panel);border:1px solid var(--line);font-variant-numeric:tabular-nums;border-radius:15px;place-items:center;min-width:38px;height:30px;padding:0 8px;font-weight:600;display:inline-grid}.trpg-dice__send{grid-template-columns:1.5fr 1fr;gap:8px;width:100%;display:grid}.trpg-dice__send .trpg-input{grid-column:1/-1}.trpg-dice__send .trpg-btn{min-height:44px}.trpg-dice__recent{border:1px solid var(--line);width:100%;min-height:44px;color:var(--ink-2);text-align:left;background:0 0;border-radius:8px;justify-content:space-between;align-items:center;gap:8px;padding:0 10px;display:flex}.trpg-dice__recent b{color:var(--ink);font-family:var(--font-serif);font-size:16px}.trpg-dice__list{max-height:180px;margin:4px 0 0;padding:0;list-style:none;overflow-y:auto}.trpg-dice__list button{border:0;border-bottom:1px solid var(--line);text-align:left;background:0 0;align-items:baseline;gap:10px;width:100%;min-height:44px;padding:4px 10px;display:flex}.trpg-dice__list button:hover{background:var(--panel)}.trpg-dice__list b{min-width:2em;font-family:var(--font-serif);font-size:17px}.trpg-dice__list span{overflow-wrap:anywhere;min-width:0;color:var(--ink-2);flex:1;font-size:13px}.trpg-dice__list time{color:var(--ink-2);font-size:12px}.trpg-dice__clear{justify-content:flex-end;display:flex}@keyframes trpg-tumble{0%{transform:rotate(0)scale(1)}45%{transform:rotate(200deg)scale(.88)}to{transform:rotate(360deg)scale(1)}}.trpg-hero{border-radius:var(--radius);background:var(--primary);width:100%;min-height:170px;color:var(--primary-ink);text-align:left;box-shadow:var(--shadow-card);border:0;align-content:end;gap:8px;padding:22px 24px;transition:transform .12s,box-shadow .12s;display:grid}button.trpg-hero:hover:not(:disabled){box-shadow:var(--shadow-float);transform:translateY(-1px)}button.trpg-hero:active{transform:none}button.trpg-hero:disabled{opacity:.6;cursor:not-allowed}.trpg-hero--idle{background:var(--panel);color:var(--ink-2)}.trpg-hero__title{font-family:var(--font-serif);font-size:26px;font-weight:600}.trpg-hero__sub{opacity:.9}.trpg-hero__go{justify-self:end;font-weight:600}.trpg-window[data-layout=narrow] .trpg-hero{min-height:140px;padding:18px}.trpg-link{color:var(--primary);background:0 0;border:0;justify-self:start;min-height:36px;padding:0;text-decoration:underline}.trpg-banner{border-radius:var(--radius);background:var(--chrome);color:#f4ecdd;height:200px;position:relative;overflow:hidden}.trpg-banner--pattern{background:repeating-linear-gradient(45deg, var(--chrome) 0 14px, color-mix(in srgb, var(--chrome) 88%, var(--gold)) 14px 28px)}.trpg-banner__img{object-fit:cover;object-position:70% 50%;opacity:0;width:100%;height:100%;transition:opacity .24s;position:absolute;inset:0}.trpg-banner__img.is-loaded{opacity:1}.trpg-banner__text{background:linear-gradient(#0000,#2b211cbf);gap:2px;padding:40px 20px 14px;display:grid;position:absolute;inset:auto 0 0}.trpg-banner__title{color:inherit;font-family:var(--font-serif);text-align:left;background:0 0;border:0;justify-self:start;padding:0;font-size:26px;font-weight:600}.trpg-banner__line{flex-wrap:wrap;align-items:center;gap:10px;font-size:14px;display:flex}.trpg-banner__state{color:inherit;background:0 0;border:0;padding:0}.trpg-banner__state[data-dirty=true]{color:#f3b45a}.trpg-window[data-layout=narrow] .trpg-banner{height:140px}.trpg-overview{grid-template-columns:repeat(4,1fr);gap:12px;display:grid}.trpg-window[data-layout=mid] .trpg-overview,.trpg-window[data-layout=narrow] .trpg-overview{grid-template-columns:repeat(2,1fr)}.trpg-cell{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);min-height:88px;box-shadow:var(--shadow-card);text-align:left;align-content:start;gap:4px;padding:12px 14px;transition:transform .12s,border-color .12s;display:grid}.trpg-cell:hover{border-color:var(--primary);transform:translateY(-1px)}.trpg-cell:active{transform:none}.trpg-cell__title{align-items:center;gap:6px;font-weight:600;display:flex}.trpg-cell__line{color:var(--ink-2);font-size:13px}.trpg-empty--tight{text-align:left;padding:8px 0}.trpg-chip{max-width:260px}.trpg-chip__name{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.trpg-badge--button{cursor:pointer}.trpg-dice__shell{flex:1;min-height:0;display:flex}.trpg-dice__main{flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.trpg-dice__main>.trpg-dice__body{overflow-y:auto}.trpg-dice[data-narrow=true]{max-height:calc(100dvh - 76px)}.trpg-dice[data-narrow=true] .trpg-dice__shell{flex-direction:column}.trpg-rp{background:var(--card);flex-direction:column;flex:1;min-height:0;display:flex}.trpg-rp__body{flex:1;align-content:start;gap:8px;min-height:0;padding:8px 14px;display:grid;overflow-y:auto}.trpg-rp .trpg-seg{width:fit-content;max-width:100%}.trpg-rp .trpg-seg button{min-height:32px;padding:2px 12px}.trpg-rp__sec{border-bottom:1px dotted color-mix(in srgb, var(--line) 60%, transparent);gap:6px;padding-bottom:8px;display:grid}.trpg-rp__sec:last-child{border-bottom:0}.trpg-rp__sec h4{color:var(--ink-2);margin:0;font-size:12px;font-weight:600}.trpg-rp__title{font:700 17px/1.3 var(--font-serif);margin:0}.trpg-rp__pair{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;display:grid}.trpg-rp__rows{gap:0;margin:0;padding:0;list-style:none;display:grid}.trpg-rp__row{border-bottom:1px dotted color-mix(in srgb, var(--line) 60%, transparent);align-items:center;gap:8px;min-height:30px;font-size:14px;display:flex}.trpg-rp__row:last-child{border-bottom:0}.trpg-rp__row>span{flex:1;min-width:0}.trpg-rp__row b{font-variant-numeric:tabular-nums}.trpg-rp__row.is-off{opacity:.4;text-decoration:line-through}.trpg-rp__hint{color:var(--ink-2);font-size:12px;font-weight:400}.trpg-rp__warn{background:color-mix(in srgb, var(--gold) 16%, var(--card));border-radius:8px;margin:0;padding:6px 10px;font-size:13px}.trpg-rp__addrow{gap:4px;display:flex}.trpg-rp__form{grid-template-columns:1fr 1fr auto;align-items:center;gap:6px;display:grid}.trpg-rp__form .trpg-field__error{grid-column:1/-1}.trpg-rp__passive{color:var(--ink-2);align-items:center;gap:8px;font-size:13px;display:flex}.trpg-rp__dc{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-input.trpg-rp__dcnum{text-align:center;width:72px;min-height:44px;font:700 22px var(--font-serif);flex:none}.trpg-rp__round{border:1px solid var(--line);background:var(--card);border-radius:50%;place-items:center;width:34px;height:34px;padding:0;display:inline-grid}.trpg-rp__chips{flex-wrap:wrap;gap:6px;width:100%;display:flex}.trpg-rp__chip{border:1px solid var(--line);background:var(--card);font-variant-numeric:tabular-nums;border-radius:8px;width:40px;height:34px;padding:0}.trpg-rp__chip[aria-pressed=true]{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-rp__contest{gap:8px;display:grid}.trpg-rp__final{margin:0;font-size:14px;font-weight:600}.trpg-rp__final .trpg-rp__hint{margin-top:2px;display:block}.trpg-rp__foot{padding:10px 14px calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);background:var(--card);flex:none;gap:8px;display:grid}.trpg-rp__formula{margin:0;font:700 15px ui-monospace,SF Mono,Menlo,monospace}.trpg-rp__result{border:1px dashed var(--line);border-radius:10px;align-items:center;gap:14px;height:104px;padding:0 14px;display:flex;overflow:hidden}.trpg-rp__total{border:2px solid var(--frame);min-width:64px;height:64px;font:700 28px var(--font-serif);border-radius:14px;place-items:center;padding:0 6px;display:inline-grid}.trpg-rp__verdict{gap:2px;min-width:0;display:grid}.trpg-rp__verdict span{font:700 15px var(--font-serif)}.trpg-rp__verdict .is-pass,.trpg-rp__verdict .is-win{color:var(--primary)}.trpg-rp__verdict .is-fail,.trpg-rp__verdict .is-lose{color:var(--danger)}.trpg-rp__verdict small{color:var(--ink-2);overflow-wrap:anywhere;font-size:12.5px}.trpg-rp__roll{width:100%;min-height:46px;font:700 17px var(--font-serif);letter-spacing:.2em}.trpg-rp input[type=checkbox]{appearance:none;border:1.5px solid var(--line);background:var(--card);cursor:pointer;border-radius:6px;flex:none;width:22px;height:22px;margin:0;position:relative}.trpg-rp input[type=checkbox]:checked{background:var(--primary);border-color:var(--primary)}.trpg-rp input[type=checkbox]:checked:after{content:\"\";border:solid var(--primary-ink);border-width:0 2px 2px 0;width:6px;height:11px;position:absolute;top:2px;left:6px;transform:rotate(45deg)}.trpg-rp__act{align-items:center;gap:12px;display:flex}.trpg-rp__act .trpg-rp__formula{overflow-wrap:anywhere;flex:1;min-width:0}.trpg-rp__act .trpg-rp__roll{flex:none;width:auto;min-width:140px;padding:0 22px}.trpg-rp__result{height:92px}.trpg-rp__sec h4{color:var(--ink);font-size:13px}.trpg-rp__body{padding-bottom:20px}.trpg-input.trpg-rp__dcnum{appearance:textfield;box-shadow:none}.trpg-rp__dcnum::-webkit-inner-spin-button{appearance:none;margin:0}.trpg-rp__dcnum::-webkit-outer-spin-button{appearance:none;margin:0}.trpg-rp__roll{letter-spacing:.08em}.trpg-rp__result.is-empty{height:44px}.trpg-rp__dcline{color:var(--ink-2);margin:0;font-size:12.5px}", xV = ":host{all:initial;pointer-events:inherit;--paper:#f4ecdd;--panel:#eee5d3;--card:#fffcf6;--line:#cbbca3;--ink:#2b211c;--ink-2:#6c6255;--primary:#7a2e26;--primary-ink:#fffcf6;--gold:#b8954a;--danger:#a3352b;--unsaved:#d9892b;--chrome:#2b211c;--chrome-ink:#f1ebdc;--chrome-hover:#3a2d26;--ok:#3f7a3a;--scrim:#2b211c73;--radius:10px;--radius-sm:6px;--radius-xs:4px;--shadow-card:0 1px 2px #2b211c14, 0 2px 8px #2b211c0f;--shadow-float:0 8px 28px #00000047;--hp:#8c2f2a;--hp-track:color-mix(in srgb, var(--line) 55%, var(--card));--frame:color-mix(in srgb, var(--ink) 75%, var(--gold));--shadow-card-hover:0 2px 4px #2b211c1a, 0 6px 16px #2b211c1a;--font-serif:\"Songti SC\", \"Noto Serif SC\", Georgia, serif;--font-sans:\"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;font-family:var(--font-sans);color:var(--ink);font-size:14px;line-height:1.5}@media (prefers-color-scheme:dark){:host{--paper:#20231f;--panel:#2b3029;--card:#181c18;--line:#515849;--ink:#f1ebdc;--ink-2:#bcbbaa;--primary:#e6bf73;--primary-ink:#20231f;--gold:#e6bf73;--danger:#e07a6e;--unsaved:#e8a13a;--chrome:#121411;--chrome-ink:#f1ebdc;--chrome-hover:#232720;--ok:#8cc47f;--scrim:#0000008c;--hp:#c8574c;--frame:color-mix(in srgb, var(--gold) 60%, var(--chrome))}}*,:before,:after{box-sizing:border-box}button,input,textarea,select{font:inherit;color:inherit}button{cursor:pointer}:focus-visible{outline:2px solid var(--primary);outline-offset:2px}.trpg-sr-only{clip:rect(0 0 0 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}@media (prefers-reduced-motion:reduce){*,:before,:after{transition-duration:.01ms!important;animation-duration:.01ms!important}}", SV = "trpg-assistant-root";
function CV(e) {
	if (document.getElementById(SV)) return null;
	let t = document.createElement("div");
	t.id = SV;
	let n = t.attachShadow({ mode: "open" }), r = document.createElement("style");
	r.textContent = [
		xV,
		bV,
		_V,
		yV,
		vV
	].join("\n");
	let i = document.createElement("div");
	i.className = "trpg-portal";
	let a = document.createElement("div");
	n.append(r, a, i), document.body.appendChild(t);
	let o = Dw();
	return Ju(gV, {
		ctx: e,
		portalTarget: i
	}).use(o).mount(a), o;
}
// src/main.ts
async function wV() {
	if (window.__trpgAssistantBooted) return;
	window.__trpgAssistantBooted = !0, await C();
	let e = x(), t = CV(e);
	t && await bT(e, t);
}
wV().catch((e) => {
	window.__trpgAssistantBooted = !1, console.error("[trpg-assistant] 启动失败", e);
});
