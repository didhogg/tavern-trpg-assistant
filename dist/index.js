// \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), s = (e, n) => {
	let r = {};
	for (var i in e) t(r, i, {
		get: e[i],
		enumerable: !0
	});
	return n || t(r, Symbol.toStringTag, { value: "Module" }), r;
}, c = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, l = (n, r, o) => (o = n == null ? {} : e(i(n)), c(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), u = "tavern-trpg-assistant";
function d() {
	let e = window.SillyTavern;
	if (!e?.getContext) throw Error("SillyTavern 宿主未就绪");
	return e.getContext();
}
function f() {
	return document.getElementById("send_textarea");
}
function p(e = 3e4) {
	return new Promise((t, n) => {
		let r = () => !!window.SillyTavern?.getContext && !!f();
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
async function m(e = 5e3) {
	let t = window.__TAURITAVERN__;
	if (!t) return null;
	let n = t.ready ?? window.__TAURITAVERN_MAIN_READY__;
	return n && await Promise.race([n, new Promise((t, n) => window.setTimeout(() => n(/* @__PURE__ */ Error("TauriTavern ready 超时")), e))]), t;
}
function h(e, t, n) {
	return e.event_types?.[t] ?? n;
}
function g(e, t, n) {
	return e.eventSource.on(t, n), () => {
		(e.eventSource.removeListener ?? e.eventSource.off)?.call(e.eventSource, t, n);
	};
}
function _(e, t) {
	let n = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
	if (!n) throw Error("无法获取输入框 value 写入器");
	n.call(e, t), e.dispatchEvent(new Event("input", { bubbles: !0 }));
}
// node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function v(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var y = {}, b = [], x = () => {}, S = () => !1, C = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), w = (e) => e.startsWith("onUpdate:"), T = Object.assign, ee = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, E = Object.prototype.hasOwnProperty, D = (e, t) => E.call(e, t), O = Array.isArray, te = (e) => le(e) === "[object Map]", ne = (e) => le(e) === "[object Set]", re = (e) => le(e) === "[object Date]", ie = (e) => le(e) === "[object RegExp]", k = (e) => typeof e == "function", ae = (e) => typeof e == "string", oe = (e) => typeof e == "symbol", A = (e) => typeof e == "object" && !!e, se = (e) => (A(e) || k(e)) && k(e.then) && k(e.catch), ce = Object.prototype.toString, le = (e) => ce.call(e), ue = (e) => le(e).slice(8, -1), de = (e) => le(e) === "[object Object]", fe = (e) => ae(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, pe = /* @__PURE__ */ v(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), me = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, he = /-\w/g, ge = me((e) => e.replace(he, (e) => e.slice(1).toUpperCase())), _e = /\B([A-Z])/g, ve = me((e) => e.replace(_e, "-$1").toLowerCase()), ye = me((e) => e.charAt(0).toUpperCase() + e.slice(1)), be = me((e) => e ? `on${ye(e)}` : ""), xe = (e, t) => !Object.is(e, t), j = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, Se = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, Ce = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, we = (e) => {
	let t = ae(e) ? Number(e) : NaN;
	return isNaN(t) ? e : t;
}, Te, Ee = () => Te ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {}, De = /* @__PURE__ */ v("Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol");
function Oe(e) {
	if (O(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = ae(r) ? Me(r) : Oe(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (ae(e) || A(e)) return e;
}
var ke = /;(?![^(]*\))/g, Ae = /:([^]+)/, je = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function Me(e) {
	let t = {};
	return e.replace(je, (e) => e.startsWith("/*") ? "" : e).split(ke).forEach((e) => {
		if (e) {
			let n = e.split(Ae);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function Ne(e) {
	let t = "";
	if (ae(e)) t = e;
	else if (O(e)) for (let n = 0; n < e.length; n++) {
		let r = Ne(e[n]);
		r && (t += r + " ");
	}
	else if (A(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
function Pe(e) {
	if (!e) return null;
	let { class: t, style: n } = e;
	return t && !ae(t) && (e.class = Ne(t)), n && (e.style = Oe(n)), e;
}
var Fe = /* @__PURE__ */ v("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function Ie(e) {
	return !!e || e === "";
}
function Le(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = Ve(e[i], t[i], n);
	return r;
}
function Re(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && Ve(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function ze(e, t, n) {
	let r = te(e), i = te(t);
	if (r || i || (r = ne(e), i = ne(t), r || i)) return r && i ? Re(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !Ve(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function Be(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function Ve(e, t, n) {
	if (e === t) return !0;
	let r = re(e), i = re(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = oe(e), i = oe(t), r || i ? e === t : (r = O(e), i = O(t), r || i ? r && i ? Be(e, t, n, Le) : !1 : (r = A(e), i = A(t), r || i ? !r || !i ? !1 : Be(e, t, n, ze) : String(e) === String(t))));
}
function He(e, t) {
	return e.findIndex((e) => Ve(e, t));
}
var Ue = (e) => !!(e && e.__v_isRef === !0), M = (e) => ae(e) ? e : e == null ? "" : O(e) || A(e) && (e.toString === ce || !k(e.toString)) ? Ue(e) ? M(e.value) : JSON.stringify(e, We, 2) : String(e), We = (e, t) => Ue(t) ? We(e, t.value) : te(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[Ge(t, r) + " =>"] = n, e), {}) } : ne(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => Ge(e)) } : oe(t) ? Ge(t) : A(t) && !O(t) && !de(t) ? String(t) : t, Ge = (e, t = "") => oe(e) ? `Symbol(${e.description ?? t})` : e;
function Ke(e) {
	return e == null ? "initial" : typeof e == "string" ? e === "" ? " " : e : String(e);
}
// node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var qe, Je = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && qe && (qe.active ? (this.parent = qe, this.index = (qe.scopes || (qe.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = qe;
			try {
				return qe = this, e();
			} finally {
				qe = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = qe, qe = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (qe === this) qe = this.prevScope;
			else {
				let e = qe;
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
function Ye(e) {
	return new Je(e);
}
function Xe() {
	return qe;
}
function Ze(e, t = !1) {
	qe && qe.cleanups.push(e);
}
var N, Qe = /* @__PURE__ */ new WeakSet(), $e = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, qe && (qe.active ? qe.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, Qe.has(this) && (Qe.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || nt(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, _t(this), at(this);
		let e = N, t = pt;
		N = this, pt = !0;
		try {
			return this.fn();
		} finally {
			ot(this), N = e, pt = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) lt(e);
			this.deps = this.depsTail = void 0, _t(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? Qe.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		st(this) && this.run();
	}
	get dirty() {
		return st(this);
	}
}, et = 0, P, tt;
function nt(e, t = !1) {
	e.flags |= 8, t ? (e.next = tt, tt = e) : (e.next = P, P = e);
}
function rt() {
	et++;
}
function it() {
	if (--et > 0) return;
	if (tt) {
		let e = tt;
		for (tt = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; P;) {
		let t = P;
		for (P = void 0; t;) {
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
function at(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function ot(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), lt(r), ut(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function st(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (ct(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function ct(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === vt) || (e.globalVersion = vt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !st(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = N, r = pt;
	N = e, pt = !0;
	try {
		at(e);
		let n = e.fn(e._value);
		(t.version === 0 || xe(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		N = n, pt = r, ot(e), e.flags &= -3;
	}
}
function lt(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) lt(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function ut(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
function dt(e, t) {
	e.effect instanceof $e && (e = e.effect.fn);
	let n = new $e(e);
	t && T(n, t);
	try {
		n.run();
	} catch (e) {
		throw n.stop(), e;
	}
	let r = n.run.bind(n);
	return r.effect = n, r;
}
function ft(e) {
	e.effect.stop();
}
var pt = !0, mt = [];
function ht() {
	mt.push(pt), pt = !1;
}
function gt() {
	let e = mt.pop();
	pt = e === void 0 || e;
}
function _t(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = N;
		N = void 0;
		try {
			t();
		} finally {
			N = e;
		}
	}
}
var vt = 0, yt = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, bt = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!N || !pt || N === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== N) t = this.activeLink = new yt(N, this), N.deps ? (t.prevDep = N.depsTail, N.depsTail.nextDep = t, N.depsTail = t) : N.deps = N.depsTail = t, xt(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = N.depsTail, t.nextDep = void 0, N.depsTail.nextDep = t, N.depsTail = t, N.deps === t && (N.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, vt++, this.notify(e);
	}
	notify(e) {
		rt();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			it();
		}
	}
};
function xt(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) xt(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var St = /* @__PURE__ */ new WeakMap(), Ct = /* @__PURE__ */ Symbol(""), wt = /* @__PURE__ */ Symbol(""), Tt = /* @__PURE__ */ Symbol("");
function Et(e, t, n) {
	if (pt && N) {
		let t = St.get(e);
		t || St.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new bt()), r.map = t, r.key = n), r.track();
	}
}
function Dt(e, t, n, r, i, a) {
	let o = St.get(e);
	if (!o) {
		vt++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (rt(), t === "clear") o.forEach(s);
	else {
		let i = O(e), a = i && fe(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === Tt || !oe(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(Tt)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(Ct)), te(e) && s(o.get(wt)));
				break;
			case "delete":
				i || (s(o.get(Ct)), te(e) && s(o.get(wt)));
				break;
			case "set": te(e) && s(o.get(Ct));
		}
	}
	it();
}
function Ot(e, t) {
	let n = St.get(e);
	return n && n.get(t);
}
function kt(e) {
	let t = /* @__PURE__ */ F(e);
	return t === e || (Et(t, "iterate", Tt), /* @__PURE__ */ yn(e)) ? t : /* @__PURE__ */ vn(e) ? /* @__PURE__ */ _n(e) ? t.map((e) => Cn(Sn(e))) : t.map(Cn) : t.map(Sn);
}
function At(e) {
	return Et(e = /* @__PURE__ */ F(e), "iterate", Tt), e;
}
function jt(e, t) {
	return /* @__PURE__ */ vn(e) ? Cn(/* @__PURE__ */ _n(e) ? Sn(t) : t) : Sn(t);
}
var Mt = {
	__proto__: null,
	[Symbol.iterator]() {
		return Nt(this, Symbol.iterator, (e) => jt(this, e));
	},
	concat(...e) {
		return kt(this).concat(...e.map((e) => O(e) ? kt(e) : e));
	},
	entries() {
		return Nt(this, "entries", (e) => (e[1] = jt(this, e[1]), e));
	},
	every(e, t) {
		return It(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return It(this, "filter", e, t, (e) => e.map((e) => jt(this, e)), arguments);
	},
	find(e, t) {
		return It(this, "find", e, t, (e) => jt(this, e), arguments);
	},
	findIndex(e, t) {
		return It(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return It(this, "findLast", e, t, (e) => jt(this, e), arguments);
	},
	findLastIndex(e, t) {
		return It(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return It(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return Rt(this, "includes", e);
	},
	indexOf(...e) {
		return Rt(this, "indexOf", e);
	},
	join(e) {
		return kt(this).join(e);
	},
	lastIndexOf(...e) {
		return Rt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return It(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return zt(this, "pop");
	},
	push(...e) {
		return zt(this, "push", e);
	},
	reduce(e, ...t) {
		return Lt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return Lt(this, "reduceRight", e, t);
	},
	shift() {
		return zt(this, "shift");
	},
	some(e, t) {
		return It(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return zt(this, "splice", e);
	},
	toReversed() {
		return kt(this).toReversed();
	},
	toSorted(e) {
		return kt(this).toSorted(e);
	},
	toSpliced(...e) {
		return kt(this).toSpliced(...e);
	},
	unshift(...e) {
		return zt(this, "unshift", e);
	},
	values() {
		return Nt(this, "values", (e) => jt(this, e));
	}
};
function Nt(e, t, n) {
	let r = At(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ yn(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => Pt(a.next(), n), i !== Ft[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => Pt(a._next(), n);
	}
	return a;
}
function Pt(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var Ft = Array.prototype;
function It(e, t, n, r, i, a) {
	let o = At(e), s = o !== e && !/* @__PURE__ */ yn(e), c = o[t];
	if (c !== Ft[t]) {
		let t = c.apply(e, a);
		return s ? Sn(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, jt(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function Lt(e, t, n, r) {
	let i = At(e), a = i !== e && !/* @__PURE__ */ yn(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = jt(e, t)), n.call(this, t, jt(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? jt(e, c) : c;
}
function Rt(e, t, n) {
	let r = /* @__PURE__ */ F(e);
	Et(r, "iterate", Tt);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ bn(n[0]) ? (n[0] = /* @__PURE__ */ F(n[0]), r[t](...n)) : i;
}
function zt(e, t, n = []) {
	ht(), rt();
	let r = (/* @__PURE__ */ F(e))[t].apply(e, n);
	return it(), gt(), r;
}
var Bt = /* @__PURE__ */ v("__proto__,__v_isRef,__isVue"), Vt = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(oe));
function Ht(e) {
	oe(e) || (e = String(e));
	let t = /* @__PURE__ */ F(this);
	return Et(t, "has", e), t.hasOwnProperty(e);
}
var Ut = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? un : ln : i ? cn : sn).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = O(e);
		if (!r) {
			let e;
			if (a && (e = Mt[t])) return e;
			if (t === "hasOwnProperty") return Ht;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ wn(e) ? e : n);
		if ((oe(t) ? Vt.has(t) : Bt(t)) || (r || Et(e, "get", t), i)) return o;
		if (/* @__PURE__ */ wn(o)) {
			let e = a && fe(t) ? o : o.value;
			return r && A(e) ? /* @__PURE__ */ mn(e) : e;
		}
		return A(o) ? r ? /* @__PURE__ */ mn(o) : /* @__PURE__ */ fn(o) : o;
	}
}, Wt = class extends Ut {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = O(e) && fe(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ vn(i);
			if (!/* @__PURE__ */ yn(n) && !/* @__PURE__ */ vn(n) && (i = /* @__PURE__ */ F(i), n = /* @__PURE__ */ F(n)), !a && /* @__PURE__ */ wn(i) && !/* @__PURE__ */ wn(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : D(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ wn(e) ? e : r);
		return e === /* @__PURE__ */ F(r) && s && (o ? xe(n, i) && Dt(e, "set", t, n, i) : Dt(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = D(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && Dt(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return oe(t) && Vt.has(t) || Et(e, "has", t), n;
	}
	ownKeys(e) {
		return Et(e, "iterate", O(e) ? "length" : Ct), Reflect.ownKeys(e);
	}
}, Gt = class extends Ut {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, Kt = /* @__PURE__ */ new Wt(), qt = /* @__PURE__ */ new Gt(), Jt = /* @__PURE__ */ new Wt(!0), Yt = /* @__PURE__ */ new Gt(!0), Xt = (e) => e, Zt = (e) => Reflect.getPrototypeOf(e);
function Qt(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ F(i), o = te(a), s = e === "entries" || e === Symbol.iterator && o, c = e === "keys" && o, l = i[e](...r), u = n ? Xt : t ? Cn : Sn;
		return !t && Et(a, "iterate", c ? wt : Ct), T(Object.create(l), { next() {
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
function $t(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function en(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ F(r), a = /* @__PURE__ */ F(n);
			e || (xe(n, a) && Et(i, "get", n), Et(i, "get", a));
			let { has: o } = Zt(i), s = t ? Xt : e ? Cn : Sn;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && Et(/* @__PURE__ */ F(t), "iterate", Ct), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ F(n), i = /* @__PURE__ */ F(t);
			return e || (xe(t, i) && Et(r, "has", t), Et(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ F(a), s = t ? Xt : e ? Cn : Sn;
			return !e && Et(o, "iterate", Ct), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return T(n, e ? {
		add: $t("add"),
		set: $t("set"),
		delete: $t("delete"),
		clear: $t("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ F(this), r = Zt(n), i = /* @__PURE__ */ F(e), a = !t && !/* @__PURE__ */ yn(e) && !/* @__PURE__ */ vn(e) ? i : e;
			return r.has.call(n, a) || xe(e, a) && r.has.call(n, e) || xe(i, a) && r.has.call(n, i) || (n.add(a), Dt(n, "add", a, a)), this;
		},
		set(e, n) {
			t || /* @__PURE__ */ yn(n) || /* @__PURE__ */ vn(n) || (n = /* @__PURE__ */ F(n));
			let r = /* @__PURE__ */ F(this), { has: i, get: a } = Zt(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ F(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? xe(n, s) && Dt(r, "set", e, n, s) : Dt(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ F(this), { has: n, get: r } = Zt(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ F(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && Dt(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ F(this), t = e.size !== 0, n = e.clear();
			return t && Dt(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = Qt(r, e, t);
	}), n;
}
function tn(e, t) {
	let n = en(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(D(n, i) && i in r ? n : r, i, a);
}
var nn = { get: /* @__PURE__ */ tn(!1, !1) }, rn = { get: /* @__PURE__ */ tn(!1, !0) }, an = { get: /* @__PURE__ */ tn(!0, !1) }, on = { get: /* @__PURE__ */ tn(!0, !0) }, sn = /* @__PURE__ */ new WeakMap(), cn = /* @__PURE__ */ new WeakMap(), ln = /* @__PURE__ */ new WeakMap(), un = /* @__PURE__ */ new WeakMap();
function dn(e) {
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
function fn(e) {
	return /* @__PURE__ */ vn(e) ? e : gn(e, !1, Kt, nn, sn);
}
// @__NO_SIDE_EFFECTS__
function pn(e) {
	return gn(e, !1, Jt, rn, cn);
}
// @__NO_SIDE_EFFECTS__
function mn(e) {
	return gn(e, !0, qt, an, ln);
}
// @__NO_SIDE_EFFECTS__
function hn(e) {
	return gn(e, !0, Yt, on, un);
}
function gn(e, t, n, r, i) {
	if (!A(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = dn(ue(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function _n(e) {
	return /* @__PURE__ */ vn(e) ? /* @__PURE__ */ _n(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function vn(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function yn(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function bn(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function F(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ F(t) : e;
}
function xn(e) {
	return !D(e, "__v_skip") && Object.isExtensible(e) && Se(e, "__v_skip", !0), e;
}
var Sn = (e) => A(e) ? /* @__PURE__ */ fn(e) : e, Cn = (e) => A(e) ? /* @__PURE__ */ mn(e) : e;
// @__NO_SIDE_EFFECTS__
function wn(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function I(e) {
	return En(e, !1);
}
// @__NO_SIDE_EFFECTS__
function Tn(e) {
	return En(e, !0);
}
function En(e, t) {
	return /* @__PURE__ */ wn(e) ? e : new Dn(e, t);
}
var Dn = class {
	constructor(e, t) {
		this.dep = new bt(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ F(e), this._value = t ? e : Sn(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ yn(e) || /* @__PURE__ */ vn(e);
		e = n ? e : /* @__PURE__ */ F(e), xe(e, t) && (this._rawValue = e, this._value = n ? e : Sn(e), this.dep.trigger());
	}
};
function On(e) {
	e.dep && e.dep.trigger();
}
function L(e) {
	return /* @__PURE__ */ wn(e) ? e.value : e;
}
function kn(e) {
	return k(e) ? e() : L(e);
}
var An = {
	get: (e, t, n) => t === "__v_raw" ? e : L(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ wn(i) && !/* @__PURE__ */ wn(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function jn(e) {
	return /* @__PURE__ */ _n(e) ? e : new Proxy(e, An);
}
var Mn = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new bt(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function Nn(e) {
	return new Mn(e);
}
// @__NO_SIDE_EFFECTS__
function Pn(e) {
	let t = O(e) ? Array(e.length) : {};
	for (let n in e) t[n] = Rn(e, n);
	return t;
}
var Fn = class {
	constructor(e, t, n) {
		this._object = e, this._defaultValue = n, this.__v_isRef = !0, this._value = void 0, this._key = oe(t) ? t : String(t), this._raw = /* @__PURE__ */ F(e);
		let r = !0, i = e;
		if (!O(e) || oe(this._key) || !fe(this._key)) do
			r = !/* @__PURE__ */ bn(i) || /* @__PURE__ */ yn(i);
		while (r && (i = i.__v_raw));
		this._shallow = r;
	}
	get value() {
		let e = this._object[this._key];
		return this._shallow && (e = L(e)), this._value = e === void 0 ? this._defaultValue : e;
	}
	set value(e) {
		if (this._shallow && /* @__PURE__ */ wn(this._raw[this._key])) {
			let t = this._object[this._key];
			if (/* @__PURE__ */ wn(t)) {
				t.value = e;
				return;
			}
		}
		this._object[this._key] = e;
	}
	get dep() {
		return Ot(this._raw, this._key);
	}
}, In = class {
	constructor(e) {
		this._getter = e, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
	}
	get value() {
		return this._value = this._getter();
	}
};
// @__NO_SIDE_EFFECTS__
function Ln(e, t, n) {
	return /* @__PURE__ */ wn(e) ? e : k(e) ? new In(e) : A(e) && arguments.length > 1 ? Rn(e, t, n) : /* @__PURE__ */ I(e);
}
function Rn(e, t, n) {
	return new Fn(e, t, n);
}
var zn = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new bt(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = vt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && N !== this) return nt(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return ct(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function Bn(e, t, n = !1) {
	let r, i;
	return k(e) ? r = e : (r = e.get, i = e.set), new zn(r, i, n);
}
var Vn = {
	GET: "get",
	HAS: "has",
	ITERATE: "iterate"
}, Hn = {
	SET: "set",
	ADD: "add",
	DELETE: "delete",
	CLEAR: "clear"
}, Un = {}, Wn = /* @__PURE__ */ new WeakMap(), Gn = void 0;
function Kn() {
	return Gn;
}
function qn(e, t = !1, n = Gn) {
	if (n) {
		let t = Wn.get(n);
		t || Wn.set(n, t = []), t.push(e);
	}
}
function Jn(e, t, n = y) {
	let { immediate: r, deep: i, once: a, scheduler: o, augmentJob: s, call: c } = n, l = (e) => i ? e : /* @__PURE__ */ yn(e) || i === !1 || i === 0 ? Yn(e, 1) : Yn(e), u, d, f, p, m = !1, h = !1;
	if (/* @__PURE__ */ wn(e) ? (d = () => e.value, m = /* @__PURE__ */ yn(e)) : /* @__PURE__ */ _n(e) ? (d = () => l(e), m = !0) : O(e) ? (h = !0, m = e.some((e) => /* @__PURE__ */ _n(e) || /* @__PURE__ */ yn(e)), d = () => e.map((e) => {
		if (/* @__PURE__ */ wn(e)) return e.value;
		if (/* @__PURE__ */ _n(e)) return l(e);
		if (k(e)) return c ? c(e, 2) : e();
	})) : d = k(e) ? t ? c ? () => c(e, 2) : e : () => {
		if (f) {
			ht();
			try {
				f();
			} finally {
				gt();
			}
		}
		let t = Gn;
		Gn = u;
		try {
			return c ? c(e, 3, [p]) : e(p);
		} finally {
			Gn = t;
		}
	} : x, t && i) {
		let e = d, t = i === !0 ? Infinity : i;
		d = () => Yn(e(), t);
	}
	let g = Xe(), _ = () => {
		u.stop(), g && g.active && ee(g.effects, u);
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
	let v = h ? Array(e.length).fill(Un) : Un, b = (e) => {
		if (u.flags & 1 && (u.dirty || e)) {
			if (t) {
				let n = u.run();
				if (e || i || m || (h ? n.some((e, t) => xe(e, v[t])) : xe(n, v))) {
					let e = Gn;
					ht();
					try {
						f && f(), Gn = u;
						let e = [
							n,
							v === Un ? void 0 : h && v[0] === Un ? [] : v,
							p
						];
						v = n, c ? c(t, 3, e) : t(...e);
					} finally {
						Gn = e, gt();
					}
				}
			} else u.run();
		}
	};
	return s && s(b), u = new $e(d), u.scheduler = o ? () => o(b, !1) : b, p = (e) => qn(e, !1, u), f = u.onStop = () => {
		let e = Wn.get(u);
		if (e) {
			if (c) c(e, 4);
			else for (let t of e) t();
			Wn.delete(u);
		}
	}, t ? r ? b(!0) : v = u.run() : o ? o(b.bind(null, !0), !0) : u.run(), _.pause = u.pause.bind(u), _.resume = u.resume.bind(u), _.stop = _, _;
}
function Yn(e, t = Infinity, n) {
	if (t <= 0 || !A(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ wn(e)) Yn(e.value, t, n);
	else if (O(e)) for (let r = 0; r < e.length; r++) Yn(e[r], t, n);
	else if (ne(e) || te(e)) e.forEach((e) => {
		Yn(e, t, n);
	});
	else if (de(e)) {
		for (let r in e) Yn(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && Yn(e[r], t, n);
	}
	return e;
}
// node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var Xn = [];
function Zn(e) {
	Xn.push(e);
}
function Qn() {
	Xn.pop();
}
function $n(e, t) {}
var er = {
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
}, tr = {
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
function nr(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		ir(e, t, n);
	}
}
function rr(e, t, n, r) {
	if (k(e)) {
		let i = nr(e, t, n, r);
		return i && se(i) && i.catch((e) => {
			ir(e, t, n);
		}), i;
	}
	if (O(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(rr(e[a], t, n, r));
		return i;
	}
}
function ir(e, t, n, r = !0) {
	let i = t ? t.vnode : null, { errorHandler: a, throwUnhandledErrorInProduction: o } = t && t.appContext.config || y;
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
			ht(), nr(a, null, 10, [
				e,
				i,
				o
			]), gt();
			return;
		}
	}
	ar(e, n, i, r, o);
}
function ar(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var or = [], sr = -1, cr = [], lr = null, ur = 0, dr = /* @__PURE__ */ Promise.resolve(), fr = null;
function pr(e) {
	let t = fr || dr;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function mr(e) {
	let t = sr + 1, n = or.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = or[r], a = Sr(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function hr(e) {
	if (!(e.flags & 1)) {
		let t = Sr(e), n = or[or.length - 1];
		!n || !(e.flags & 2) && t >= Sr(n) ? or.push(e) : or.splice(mr(t), 0, e), e.flags |= 1, gr();
	}
}
function gr() {
	fr ||= dr.then(Cr);
}
function _r(e) {
	if (!O(e)) lr && e.id === -1 ? lr.splice(ur + 1, 0, e) : e.flags & 1 || (cr.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) cr.push(e[t]);
	gr();
}
function vr(e, t, n, r = sr + 1) {
	for (; r < or.length; r++) {
		let n = or[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			or.splice(r, 1), r = e ? r - 1 : sr, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function yr(e, t, n = 0) {
	if (cr.length) {
		let e = cr, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < cr.length; i++) {
				let a = cr[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? cr[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => Sr(e) - Sr(t));
		if (cr.length = r, lr) {
			for (let e = 0; e < i.length; e++) lr.push(i[e]);
			return;
		}
		for (lr = i, ur = 0; ur < lr.length; ur++) {
			let e = lr[ur];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		lr = null, ur = 0;
	}
}
var br = !1;
function xr(e, t) {
	if (br) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(cr);
	e(), br = !0;
	try {
		vr(void 0, t), yr(void 0, n, t);
	} finally {
		br = !1;
	}
}
var Sr = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function Cr(e) {
	try {
		for (sr = 0; sr < or.length; sr++) {
			let e = or[sr];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), nr(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; sr < or.length; sr++) {
			let e = or[sr];
			e && (e.flags &= -2);
		}
		sr = -1, or.length = 0, yr(e), fr = null, (or.length || cr.length) && Cr(e);
	}
}
var wr, Tr = [];
function Er(e, t) {
	wr = e, wr ? (wr.enabled = !0, Tr.forEach(({ event: e, args: t }) => wr.emit(e, ...t)), Tr = []) : typeof window < "u" && window.HTMLElement && !(window.navigator?.userAgent)?.includes("jsdom") ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((e) => {
		Er(e, t);
	}), setTimeout(() => {
		wr || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, Tr = []);
	}, 3e3)) : Tr = [];
}
var Dr = null, Or = null;
function kr(e) {
	let t = Dr;
	return Dr = e, Or = e && e.type.__scopeId || null, t;
}
function Ar(e) {
	Or = e;
}
function jr() {
	Or = null;
}
var Mr = (e) => R;
function R(e, t = Dr, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && js(-1);
		let i = kr(t), a = Ds.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Ds.length; e > a; e--) ks();
			kr(i), r._d && js(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function Nr(e, t) {
	if (Dr === null) return e;
	let n = gc(Dr), r = e.dirs ||= [];
	for (let e = 0; e < t.length; e++) {
		let [i, a, o, s = y] = t[e];
		i && (k(i) && (i = {
			mounted: i,
			updated: i
		}), i.deep && Yn(a), r.push({
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
function Pr(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (ht(), rr(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), gt());
	}
}
function Fr(e, t) {
	if (Qs) {
		let n = Qs.provides, r = Qs.parent && Qs.parent.provides;
		r === n && (n = Qs.provides = Object.create(r)), n[e] = t;
	}
}
function Ir(e, t, n = !1) {
	let r = $s();
	if (r || bo) {
		let i = bo ? bo._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && k(t) ? t.call(r && r.proxy) : t;
	}
}
function Lr() {
	return !!($s() || bo);
}
var Rr = /* @__PURE__ */ Symbol.for("v-scx"), zr = () => Ir(Rr);
function Br(e, t) {
	return Wr(e, null, t);
}
function Vr(e, t) {
	return Wr(e, null, { flush: "post" });
}
function Hr(e, t) {
	return Wr(e, null, { flush: "sync" });
}
function Ur(e, t, n) {
	return Wr(e, t, n);
}
function Wr(e, t, n = y) {
	let { immediate: r, deep: i, flush: a, once: o } = n, s = T({}, n), c = t && r || !t && a !== "post", l;
	if (ac) {
		if (a === "sync") {
			let e = zr();
			l = e.__watcherHandles ||= [];
		} else if (!c) {
			let e = () => {};
			return e.stop = x, e.resume = x, e.pause = x, e;
		}
	}
	let u = Qs;
	s.call = (e, t, n) => rr(e, u, t, n);
	let d = !1;
	a === "post" ? s.scheduler = (e) => {
		e.i = u, $o(e, u && u.suspense);
	} : a !== "sync" && (d = !0, s.scheduler = (e, t) => {
		t ? e() : hr(e);
	}), s.augmentJob = (e) => {
		t && (e.flags |= 4), d && (e.flags |= 2, u && (e.id = u.uid, e.i = u));
	};
	let f = Jn(e, t, s);
	return ac && (l ? l.push(f) : c && f()), f;
}
function Gr(e, t, n) {
	let r = this.proxy, i = ae(e) ? e.includes(".") ? Kr(r, e) : () => r[e] : e.bind(r, r), a;
	k(t) ? a = t : (a = t.handler, n = t);
	let o = nc(this), s = Wr(i, a.bind(r), n);
	return o(), s;
}
function Kr(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var qr = /* @__PURE__ */ new WeakMap(), Jr = /* @__PURE__ */ Symbol("_vte"), Yr = (e) => e.__isTeleport, Xr = (e) => e && (e.disabled || e.disabled === ""), Zr = (e) => e && (e.defer || e.defer === ""), Qr = (e) => typeof SVGElement < "u" && e instanceof SVGElement, $r = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, ei = (e, t) => {
	let n = e && e.to;
	return ae(n) ? t ? t(n) : null : n;
}, ti = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = Xr(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = Xr(e.props), r = e.target = ei(e.props, m), a = oi(r, e, h, p);
			r && (o !== "svg" && Qr(r) ? o = "svg" : o !== "mathml" && $r(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), ai(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (qr.get(e) === t) {
					if (qr.delete(e), Xr(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), ai(e, !0);
					}
					x(e);
				}
			};
			qr.set(e, t), $o(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), Zr(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), ai(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = qr.get(e);
			if (u) {
				u.flags |= 8, qr.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = Xr(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || Qr(p) ? o = "svg" : (o === "mathml" || $r(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), os(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : ni(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = ei(t.props, m);
				e && (t.target = e, ni(t, e, null, l, 0));
			} else g && ni(t, p, h, l, 1);
			ai(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = Xr(f), m = a || !p, h = qr.get(e);
		if (h && (h.flags |= 8, qr.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: ni,
	hydrate: ri
};
function ni(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !qr.has(e) && (!d || Xr(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function ri(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
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
	let m = t.target = ei(t.props, c), h = Xr(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || oi(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || oi(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), ai(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var ii = ti;
function ai(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function oi(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Jr] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var si = /* @__PURE__ */ Symbol("_leaveCb"), ci = /* @__PURE__ */ Symbol("_enterCb");
function li() {
	let e = {
		isMounted: !1,
		isLeaving: !1,
		isUnmounting: !1,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	return ma(() => {
		e.isMounted = !0;
	}), _a(() => {
		e.isUnmounting = !0;
	}), e;
}
var ui = [Function, Array], di = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: ui,
	onEnter: ui,
	onAfterEnter: ui,
	onEnterCancelled: ui,
	onBeforeLeave: ui,
	onLeave: ui,
	onAfterLeave: ui,
	onLeaveCancelled: ui,
	onBeforeAppear: ui,
	onAppear: ui,
	onAfterAppear: ui,
	onAppearCancelled: ui
}, fi = {
	name: "BaseTransition",
	props: di,
	setup(e, { slots: t }) {
		let n = $s(), r = li();
		return () => {
			let i = t.default && bi(t.default(), !0), a = i && i.length ? pi(i) : n.subTree ? q() : void 0;
			if (!a) return;
			let o = /* @__PURE__ */ F(e), { mode: s } = o;
			if (r.isLeaving) return _i(a);
			let c = vi(a);
			if (!c) return _i(a);
			let l = gi(c, o, r, n, (e) => l = e);
			c.type !== Ts && yi(c, l);
			let u = n.subTree && vi(n.subTree);
			if (u && u.type !== Ts && !Ps(u, c) && xi(n.subTree)) {
				let e = gi(u, o, r, n);
				if (yi(u, e), s === "out-in" && c.type !== Ts) return r.isLeaving = !0, e.afterLeave = () => {
					r.isLeaving = !1, n.job.flags & 8 || n.update(), delete e.afterLeave, u = void 0;
				}, _i(a);
				s === "in-out" && c.type !== Ts ? e.delayLeave = (e, t, n) => {
					let i = hi(r, u);
					i[String(u.key)] = u, e[si] = () => {
						t(), e[si] = void 0, delete l.delayedLeave, u = void 0;
					}, l.delayedLeave = () => {
						n(), delete l.delayedLeave, u = void 0;
					};
				} : u = void 0;
			} else u &&= void 0;
			return a;
		};
	}
};
function pi(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Ts) {
			t = n;
			break;
		}
	}
	return t;
}
var mi = fi;
function hi(e, t) {
	let { leavingVNodes: n } = e, r = n.get(t.type);
	return r || (r = /* @__PURE__ */ Object.create(null), n.set(t.type, r)), r;
}
function gi(e, t, n, r, i) {
	let { appear: a, mode: o, persisted: s = !1, onBeforeEnter: c, onEnter: l, onAfterEnter: u, onEnterCancelled: d, onBeforeLeave: f, onLeave: p, onAfterLeave: m, onLeaveCancelled: h, onBeforeAppear: g, onAppear: _, onAfterAppear: v, onAppearCancelled: y } = t, b = String(e.key), x = hi(n, e), S = (e, t) => {
		e && rr(e, r, 9, t);
	}, C = (e, t) => {
		let n = t[1];
		S(e, t), O(e) ? e.every((e) => e.length <= 1) && n() : e.length <= 1 && n();
	}, w = {
		mode: o,
		persisted: s,
		beforeEnter(t) {
			let r = c;
			if (!n.isMounted) {
				if (a) r = g || c;
				else return;
			}
			t[si] && t[si](!0);
			let i = x[b];
			if (i && Ps(e, i)) {
				let e = i.el[si];
				if (!e) {
					let t = xi(i);
					e = t && t.el[si];
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
			t[ci] = (e) => {
				s || (s = !0, S(e ? o : i, [t]), w.delayedLeave && w.delayedLeave(), t[ci] = void 0);
			};
			let c = t[ci].bind(null, !1);
			r ? C(r, [t, c]) : c();
		},
		leave(t, r) {
			let i = String(e.key);
			if (t[ci] && t[ci](!0), n.isUnmounting) return r();
			S(f, [t]);
			let a = !1;
			t[si] = (n) => {
				a || (a = !0, r(), S(n ? h : m, [t]), t[si] = void 0, x[i] === e && delete x[i]);
			};
			let o = t[si].bind(null, !1);
			x[i] = e, p ? C(p, [t, o]) : o();
		},
		clone(e) {
			let a = gi(e, t, n, r, i);
			return i && i(a), a;
		}
	};
	return w;
}
function _i(e) {
	if (na(e)) return e = Bs(e), e.children = null, e;
}
function vi(e) {
	if (!na(e)) return Yr(e.type) && e.children ? pi(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && k(n.default)) return n.default();
	}
}
function yi(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		yi(Yr(n.type) && vi(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === V && O(e.children)) {
		let n = Oo(e.children, !1);
		n && yi(n, t);
	}
}
function bi(e, t = !1, n) {
	let r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a], s = n == null ? o.key : String(n) + String(o.key == null ? a : o.key);
		o.type === V ? (o.patchFlag & 128 && i++, r = r.concat(bi(o.children, t, s))) : (t || o.type !== Ts) && r.push(s == null ? o : Bs(o, { key: s }));
	}
	if (i > 1) for (let e = 0; e < r.length; e++) r[e].patchFlag = -2;
	return r;
}
function xi(e) {
	if (e.component) return xi(e.component.subTree);
	if (e.type === V) {
		let t = O(e.children) && Oo(e.children, !1);
		return t ? xi(t) : void 0;
	}
	if (e.type !== Ts) return e;
}
// @__NO_SIDE_EFFECTS__
function z(e, t) {
	return k(e) ? /* @__PURE__ */ T({ name: e.name }, t, { setup: e }) : e;
}
function Si() {
	let e = $s();
	return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : "";
}
function Ci(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function wi(e) {
	let t = $s(), n = /* @__PURE__ */ Tn(null);
	if (t) {
		let r = t.refs === y ? t.refs = {} : t.refs;
		Object.defineProperty(r, e, {
			enumerable: !0,
			get: () => n.value,
			set: (e) => n.value = e
		});
	}
	return n;
}
function Ti(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var Ei = /* @__PURE__ */ new WeakMap();
function Di(e, t, n, r, i = !1) {
	if (O(e)) {
		e.forEach((e, a) => Di(e, t && (O(t) ? t[a] : t), n, r, i));
		return;
	}
	if ($i(r) && !i) {
		r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && Di(e, t, n, r.component.subTree);
		return;
	}
	let a = r.shapeFlag & 4 ? gc(r.component) : r.el, o = i ? null : a, { i: s, r: c } = e, l = t && t.r, u = s.refs === y ? s.refs = {} : s.refs, d = s.setupState, f = /* @__PURE__ */ F(d), p = d === y ? S : (e) => !Ti(u, e) && D(f, e), m = (e, t) => !(t && Ti(u, t));
	if (l != null && l !== c) {
		if (Oi(t), ae(l)) u[l] = null, p(l) && (d[l] = null);
		else if (/* @__PURE__ */ wn(l)) {
			let e = t;
			m(l, e.k) && (l.value = null), e.k && (u[e.k] = null);
		}
	}
	if (k(c)) nr(c, s, 12, [o, u]);
	else {
		let t = ae(c), r = /* @__PURE__ */ wn(c);
		if (t || r) {
			let s = () => {
				if (e.f) {
					let n = t ? p(c) ? d[c] : u[c] : m(c) || !e.k ? c.value : u[e.k];
					if (i) O(n) && ee(n, a);
					else if (O(n)) n.includes(a) || n.push(a);
					else if (t) u[c] = [a], p(c) && (d[c] = u[c]);
					else {
						let t = [a];
						m(c, e.k) && (c.value = t), e.k && (u[e.k] = t);
					}
				} else t ? (u[c] = o, p(c) && (d[c] = o)) : r && (m(c, e.k) && (c.value = o), e.k && (u[e.k] = o));
			};
			if (o) {
				let t = () => {
					s(), Ei.delete(e);
				};
				t.id = -1, Ei.set(e, t), $o(t, n);
			} else Oi(e), s();
		}
	}
}
function Oi(e) {
	let t = Ei.get(e);
	t && (t.flags |= 8, Ei.delete(e));
}
var ki = !1, Ai = () => {
	ki ||= (console.error("Hydration completed but contains mismatches."), !0);
}, ji = (e) => e.namespaceURI.includes("svg") && e.tagName !== "foreignObject", Mi = (e) => e.namespaceURI.includes("MathML"), Ni = (e) => {
	if (e.nodeType === 1) {
		if (ji(e)) return "svg";
		if (Mi(e)) return "mathml";
	}
}, Pi = (e) => e.nodeType === 8;
function Fi(e) {
	let { mt: t, p: n, o: { patchProp: r, createText: i, nextSibling: a, parentNode: o, remove: s, insert: c, createComment: l } } = e, u = (e, t) => {
		t.hasChildNodes() ? (d(t.firstChild, e, null, null, null), yr(), t._vnode = e) : (n(null, e, t), yr(), t._vnode = e);
	}, d = (n, r, s, l, u, y = !1) => {
		y ||= !!r.dynamicChildren;
		let b = Pi(n) && n.data === "[", x = () => h(n, r, s, l, u, b), { type: S, ref: C, shapeFlag: w, patchFlag: T } = r, ee = n.nodeType;
		r.el = n, T === -2 && (y = !1, r.dynamicChildren = null);
		let E = null;
		switch (S) {
			case ws:
				ee === 3 ? (n.data !== r.children && (Ai(), n.data = r.children), E = a(n)) : r.children === "" ? (c(r.el = i(""), o(n), n), E = n) : E = x();
				break;
			case Ts:
				v(n) ? (E = a(n), _(r.el = n.content.firstChild, n, s)) : E = ee !== 8 || b ? x() : a(n);
				break;
			case Es:
				if (b && (n = a(n), ee = n.nodeType), ee === 1 || ee === 3) {
					E = n;
					let e = !r.children.length;
					for (let t = 0; t < r.staticCount; t++) e && (r.children += E.nodeType === 1 ? E.outerHTML : E.data), t === r.staticCount - 1 && (r.anchor = E), E = a(E);
					return b ? a(E) : E;
				}
				x();
				break;
			case V:
				E = b ? m(n, r, s, l, u, y) : x();
				break;
			default: if (w & 1) E = (ee !== 1 || r.type.toLowerCase() !== n.tagName.toLowerCase()) && !v(n) ? x() : f(n, r, s, l, u, y);
			else if (w & 6) {
				r.slotScopeIds = u;
				let e = o(n);
				if (E = b ? g(n) : Pi(n) && n.data === "teleport start" ? g(n, n.data, "teleport end") : a(n), t(r, e, null, s, l, Ni(e), y), ($i(r) || r.component.asyncDep) && !r.component.subTree) {
					let t;
					b ? (t = K(Es), t.anchor = E ? E.previousSibling : e.lastChild) : t = n.nodeType === 3 ? Vs("") : K(n.nodeType === 8 ? Ts : "div"), t.el = n, r.component.subTree = t;
				}
			} else w & 64 ? E = ee === 8 ? r.type.hydrate(n, r, s, l, u, y, e, p) : x() : w & 128 && (E = r.type.hydrate(n, r, s, l, Ni(o(n)), u, y, e, d));
		}
		return C != null && Di(C, null, l, r), E;
	}, f = (e, t, n, i, a, o) => {
		o ||= !!t.dynamicChildren;
		let { type: c, dynamicProps: l, props: u, patchFlag: d, shapeFlag: f, dirs: m, transition: h } = t, g = c === "input" || c === "option", y = !!l;
		if (g || y || d !== -1) {
			m && Pr(t, null, n, "created");
			let c = !1;
			if (v(e)) {
				c = as(null, h) && n && n.vnode.props && n.vnode.props.appear;
				let r = e.content.firstChild;
				if (c) {
					let e = r.getAttribute("class");
					e && (r.$cls = e), h.beforeEnter(r);
				}
				_(r, e, n), t.el = e = r;
			}
			if (f & 16 && !(u && (u.innerHTML || u.textContent))) {
				let r = p(e.firstChild, t, e, n, i, a, o);
				for (r && !Bi(e, 1) && Ai(); r;) {
					let e = r;
					r = r.nextSibling, s(e);
				}
			} else if (f & 8) {
				let n = t.children;
				n[0] === "\n" && (e.tagName === "PRE" || e.tagName === "TEXTAREA") && (n = n.slice(1));
				let { textContent: r } = e;
				r !== n && r !== n.replace(/\r\n|\r/g, "\n") && (Bi(e, 0) || Ai(), e.textContent = t.children);
			}
			if (u) {
				if (g || y || !o || d & 48) {
					let t = e.tagName.includes("-"), i = e.namespaceURI.includes("svg") ? "svg" : e.namespaceURI.includes("MathML") ? "mathml" : void 0;
					for (let a in u) if (g && (a.endsWith("value") || a === "indeterminate") || C(a) && !pe(a) || a[0] === "." || t && !pe(a) || l && l.includes(a)) {
						if (Li(e, a, u[a])) continue;
						r(e, a, null, u[a], i, n);
					}
				} else if (u.onClick) r(e, "onClick", null, u.onClick, void 0, n);
				else if (d & 4 && /* @__PURE__ */ _n(u.style)) for (let e in u.style) u.style[e];
			}
			let b;
			(b = u && u.onVnodeBeforeMount) && qs(b, n, t), m && Pr(t, null, n, "beforeMount"), ((b = u && u.onVnodeMounted) || m || c) && xs(() => {
				b && qs(b, n, t), c && h.enter(e), m && Pr(t, null, n, "mounted");
			}, i);
		}
		return e.nextSibling;
	}, p = (e, t, r, o, s, l, u) => {
		u ||= !!t.dynamicChildren;
		let f = t.children, p = f.length, m = !1;
		for (let t = 0; t < p; t++) {
			let h = u ? f[t] : f[t] = Us(f[t]), g = h.type === ws;
			e ? (g && !u && t + 1 < p && Us(f[t + 1]).type === ws && (c(i(e.data.slice(h.children.length)), r, a(e)), e.data = h.children), e = d(e, h, o, s, l, u)) : g && !h.children ? c(h.el = i(""), r) : (m || (m = !0, Bi(r, 1) || Ai()), n(null, h, r, null, o, s, Ni(r), l));
		}
		return e;
	}, m = (e, t, n, r, i, s) => {
		let { slotScopeIds: u } = t;
		u && (i = i ? i.concat(u) : u);
		let d = o(e), f = p(a(e), t, d, n, r, i, s);
		return f && Pi(f) && f.data === "]" ? a(t.anchor = f) : (Ai(), c(t.anchor = l("]"), d, f), f);
	}, h = (e, t, r, i, c, l) => {
		if (Hi(e, t) || Ai(), t.el = null, l) {
			let t = g(e);
			for (;;) {
				let n = a(e);
				if (n && n !== t) s(n);
				else break;
			}
		}
		let u = a(e), d = o(e);
		return s(e), n(null, t, d, u, r, i, Ni(d), c), r && (r.vnode.el = t.el, Po(r, t.el)), u;
	}, g = (e, t = "[", n = "]") => {
		let r = 0;
		for (; e;) if (e = a(e), e && Pi(e) && (e.data === t && r++, e.data === n)) {
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
var Ii = /* @__PURE__ */ new Set([
	"src",
	"srcset",
	"href",
	"poster"
]);
function Li(e, t, n) {
	return Ii.has(t) ? e.getAttribute(t) === (n == null ? null : `${n}`) : !1;
}
var Ri = "data-allow-mismatch", zi = {
	0: "text",
	1: "children",
	2: "class",
	3: "style",
	4: "attribute"
};
function Bi(e, t) {
	if (t === 0 || t === 1) for (; e && !e.hasAttribute(Ri);) e = e.parentElement;
	return Vi(e && e.getAttribute(Ri), t);
}
function Vi(e, t) {
	if (e == null) return !1;
	if (e === "") return !0;
	{
		let n = e.split(",");
		return t === 0 && n.includes("children") ? !0 : n.includes(zi[t]);
	}
}
function Hi(e, t) {
	return Bi(e.parentElement, 1) || Ui(e) || Wi(t);
}
function Ui(e) {
	return e.nodeType === 1 && Vi(e.getAttribute(Ri), 1);
}
function Wi({ props: e }) {
	let t = e && e[Ri];
	return typeof t == "string" && Vi(t, 1);
}
var Gi = Ee().requestIdleCallback || ((e) => setTimeout(e, 1)), Ki = Ee().cancelIdleCallback || ((e) => clearTimeout(e)), qi = (e = 1e4) => (t) => {
	let n = Gi(t, { timeout: e });
	return () => Ki(n);
};
function Ji(e) {
	let { top: t, left: n, bottom: r, right: i } = e.getBoundingClientRect(), { innerHeight: a, innerWidth: o } = window;
	return (t > 0 && t < a || r > 0 && r < a) && (n > 0 && n < o || i > 0 && i < o);
}
var Yi = (e) => (t, n) => {
	let r = new IntersectionObserver((e) => {
		for (let n of e) if (n.isIntersecting) {
			r.disconnect(), t();
			break;
		}
	}, e), i = (e) => {
		if (Ji(e)) return t(), r.disconnect(), !1;
		if (getComputedStyle(e).display === "contents") {
			for (let t = 0; t < e.children.length; t++) if (i(e.children[t]) === !1) return !1;
		}
		r.observe(e);
	};
	return n((e) => {
		if (e instanceof Element) return i(e);
	}), () => r.disconnect();
}, Xi = (e) => (t) => {
	if (e) {
		let n = matchMedia(e);
		if (n.matches) t();
		else return n.addEventListener("change", t, { once: !0 }), () => n.removeEventListener("change", t);
	}
}, Zi = (e = []) => (t, n) => {
	ae(e) && (e = [e]);
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
function Qi(e, t) {
	if (Pi(e) && e.data === "[") {
		let n = 1, r = e.nextSibling;
		for (; r;) {
			if (r.nodeType === 1) {
				if (t(r) === !1) break;
			} else if (Pi(r)) {
				if (r.data === "]") {
					if (--n === 0) break;
				} else r.data === "[" && n++;
			}
			r = r.nextSibling;
		}
	} else t(e);
}
var $i = (e) => !!e.type.__asyncLoader;
// @__NO_SIDE_EFFECTS__
function ea(e) {
	k(e) && (e = { loader: e });
	let { loader: t, loadingComponent: n, errorComponent: r, delay: i = 200, hydrate: a, timeout: o, suspensible: s = !0, onError: c } = e, l = null, u, d = 0, f = () => (d++, l = null, p()), p = () => {
		let e;
		return l || (e = l = t().catch((e) => {
			if (e = e instanceof Error ? e : Error(String(e)), c) return new Promise((t, n) => {
				c(e, () => t(f()), () => n(e), d + 1);
			});
			throw e;
		}).then((t) => e !== l && l ? l : (t && (t.__esModule || t[Symbol.toStringTag] === "Module") && (t = t.default), u = t, t)));
	};
	return /* @__PURE__ */ z({
		name: "AsyncComponentWrapper",
		__asyncLoader: p,
		__asyncHydrate(e, t, n) {
			let r = e.isConnected, i = !1;
			(t.bu ||= []).push(() => i = !0);
			let o = () => {
				i || !e.parentNode || r && !e.isConnected || n();
			}, s = a ? () => {
				let n = a(o, (t) => Qi(e, t));
				n && (t.bum ||= []).push(n);
			} : o;
			u ? s() : p().then(() => !t.isUnmounted && s());
		},
		get __asyncResolved() {
			return u;
		},
		setup() {
			let e = Qs;
			if (Ci(e), u) return () => ta(u, e);
			let t = (t) => {
				l = null, ir(t, e, 13, !r);
			};
			if (s && e.suspense || ac) return p().then((t) => () => ta(t, e)).catch((e) => (t(e), () => r ? K(r, { error: e }) : null));
			let a = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(), d = /* @__PURE__ */ I(!!i), f, m;
			return va(() => {
				f != null && clearTimeout(f), m != null && clearTimeout(m);
			}), i && (m = setTimeout(() => {
				e.isUnmounted || (d.value = !1);
			}, i)), o != null && (f = setTimeout(() => {
				if (!e.isUnmounted && !a.value && !c.value) {
					let e = /* @__PURE__ */ Error(`Async component timed out after ${o}ms.`);
					t(e), c.value = e;
				}
			}, o)), p().then(() => {
				e.isUnmounted || (a.value = !0, e.parent && na(e.parent.vnode) && e.parent.update());
			}).catch((n) => {
				e.isUnmounted ? l = null : (t(n), c.value = n);
			}), () => {
				if (a.value && u) return ta(u, e);
				if (c.value && r) return K(r, { error: c.value });
				if (n && !d.value) return ta(n, e);
			};
		}
	});
}
function ta(e, t) {
	let { ref: n, props: r, children: i, ce: a } = t.vnode, o = K(e, r, i);
	return o.ref = n, o.ce = a, delete t.vnode.ce, o;
}
var na = (e) => e.type.__isKeepAlive, ra = {
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
		let n = $s(), r = n.ctx;
		if (!r.renderer) return () => {
			let e = t.default && t.default();
			return e && e.length === 1 ? e[0] : e;
		};
		let i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = null, s = n.suspense, { renderer: { p: c, m: l, um: u, o: { createElement: d } } } = r, f = d("div");
		r.activate = (e, t, n, r, i) => {
			let a = e.component;
			l(e, t, n, 0, s), c(a.vnode, e, t, n, a, s, r, e.slotScopeIds, i), $o(() => {
				a.isDeactivated = !1, a.a && j(a.a);
				let t = e.props && e.props.onVnodeMounted;
				t && qs(t, a.parent, e);
			}, s);
		}, r.deactivate = (e) => {
			let t = e.component;
			ls(t.m), ls(t.a), l(e, f, null, 1, s), $o(() => {
				t.da && j(t.da);
				let n = e.props && e.props.onVnodeUnmounted;
				n && qs(n, t.parent, e), t.isDeactivated = !0;
			}, s);
		};
		function p(e) {
			la(e), u(e, n, s, !0);
		}
		function m(e) {
			i.forEach((t, n) => {
				let r = _c($i(t) ? t.type.__asyncResolved || {} : t.type);
				r && !e(r) && h(n);
			});
		}
		function h(e) {
			let t = i.get(e);
			t && (!o || !Ps(t, o)) ? p(t) : o && (la(o), t && la(t)), i.delete(e), a.delete(e);
		}
		Ur(() => [e.include, e.exclude], ([e, t]) => {
			e && m((t) => ia(e, t)), t && m((e) => !ia(t, e));
		}, {
			flush: "post",
			deep: !0
		});
		let g = null, _ = () => {
			g != null && (ds(n.subTree.type) ? $o(() => {
				let e = ua(n.subTree);
				e.component && i.set(g, e);
			}, n.subTree.suspense) : i.set(g, ua(n.subTree)));
		};
		return ma(_), ga(_), _a(() => {
			i.forEach((e) => {
				let { subTree: t, suspense: r } = n, i = ua(t);
				if (e.type === i.type && e.key === i.key) {
					la(i);
					let e = i.component.da;
					e && $o(e, r);
				} else p(e);
			});
		}), () => {
			if (g = null, !t.default) return o = null;
			let n = t.default(), r = n[0];
			if (n.length > 1) return o = null, n;
			if (!Ns(r) || !(r.shapeFlag & 4) && !(r.shapeFlag & 128)) return o = null, r;
			let s = ua(r);
			if (s.type === Ts) return o = null, s;
			let c = s.type, l = _c($i(s) ? s.type.__asyncResolved || {} : c), { include: u, exclude: d, max: f } = e;
			if (u && (!l || !ia(u, l)) || d && l && ia(d, l)) return s.shapeFlag &= -257, o = s, r;
			let p = s.key == null ? c : s.key, m = i.get(p);
			return s.el && (s = Bs(s), r.shapeFlag & 128 && (r.ssContent = s)), g = p, m ? (s.el = m.el, s.component = m.component, s.transition && yi(s, s.transition), s.shapeFlag |= 512, a.delete(p), a.add(p)) : (a.add(p), f && a.size > parseInt(f, 10) && h(a.values().next().value)), s.shapeFlag |= 256, o = s, ds(r.type) ? r : s;
		};
	}
};
function ia(e, t) {
	return O(e) ? e.some((e) => ia(e, t)) : ae(e) ? e.split(",").includes(t) : ie(e) ? (e.lastIndex = 0, e.test(t)) : !1;
}
function aa(e, t) {
	sa(e, "a", t);
}
function oa(e, t) {
	sa(e, "da", t);
}
function sa(e, t, n = Qs) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (da(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) na(e.parent.vnode) && ca(r, t, n, e), e = e.parent;
	}
}
function ca(e, t, n, r) {
	let i = da(t, e, r, !0);
	va(() => {
		ee(r[t], i);
	}, n);
}
function la(e) {
	e.shapeFlag &= -257, e.shapeFlag &= -513;
}
function ua(e) {
	return e.shapeFlag & 128 ? e.ssContent : e;
}
function da(e, t, n = Qs, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			ht();
			let i = nc(n), a = rr(t, n, e, r);
			return i(), gt(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var fa = (e) => (t, n = Qs) => {
	ac && e !== "sp" || da(e, (...e) => t(...e), n);
}, pa = fa("bm"), ma = fa("m"), ha = fa("bu"), ga = fa("u"), _a = fa("bum"), va = fa("um"), ya = fa("sp"), ba = fa("rtg"), xa = fa("rtc");
function Sa(e, t = Qs) {
	da("ec", e, t);
}
var Ca = "components", wa = "directives";
function Ta(e, t) {
	return ka(Ca, e, !0, t) || e;
}
var Ea = /* @__PURE__ */ Symbol.for("v-ndc");
function Da(e) {
	return ae(e) ? ka(Ca, e, !1) || e : e || Ea;
}
function Oa(e) {
	return ka(wa, e);
}
function ka(e, t, n = !0, r = !1) {
	let i = Dr || Qs;
	if (i) {
		let n = i.type;
		if (e === Ca) {
			let e = _c(n, !1);
			if (e && (e === t || e === ge(t) || e === ye(ge(t)))) return n;
		}
		let a = Aa(i[e] || n[e], t) || Aa(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function Aa(e, t) {
	return e && (e[t] || e[ge(t)] || e[ye(ge(t))]);
}
function ja(e, t, n, r) {
	let i, a = n && n[r], o = O(e);
	if (o || ae(e)) {
		let n = o && /* @__PURE__ */ _n(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ yn(e), s = /* @__PURE__ */ vn(e), e = At(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Cn(Sn(e[n])) : Sn(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		if (!Number.isInteger(e) || e < 0) i = [];
		else {
			i = Array(e);
			for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
		}
	} else if (A(e)) {
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
function Ma(e, t) {
	for (let n = 0; n < t.length; n++) {
		let r = t[n];
		if (O(r)) for (let t = 0; t < r.length; t++) e[r[t].name] = r[t].fn;
		else r && (e[r.name] = r.key ? (...e) => {
			let t = r.fn(...e);
			return t && (t.key = r.key), t;
		} : r.fn);
	}
	return e;
}
function B(e, t, n, r, i, a) {
	if (n ??= {}, Dr.ce || Dr.parent && $i(Dr.parent) && Dr.parent.ce) {
		let e = a != null && n.key == null ? T({}, n, { key: a }) : n, i = Object.keys(e).length > 0;
		return t !== "default" && (e.name = t), H(), W(V, null, [K("slot", e, r && r())], i ? -2 : 64);
	}
	let o = e[t];
	o && o._c && (o._d = !1);
	let s = Ds.length;
	H();
	let c;
	try {
		let i = o && Na(o(n)), s = n.key || a || i && i.key;
		c = W(V, { key: (s && !oe(s) ? s : `_${t}`) + (!i && r ? "_fb" : "") }, i || (r ? r() : []), i && e._ === 1 ? 64 : -2);
	} catch (e) {
		for (let e = Ds.length; e > s; e--) ks();
		throw e;
	} finally {
		o && o._c && (o._d = !0);
	}
	return !i && c.scopeId && (c.slotScopeIds = [c.scopeId + "-s"]), c;
}
function Na(e) {
	return e.some((e) => !Ns(e) || !(e.type === Ts || e.type === V && !Na(e.children))) ? e : null;
}
function Pa(e, t) {
	let n = {};
	for (let r in e) n[t && /[A-Z]/.test(r) ? `on:${r}` : be(r)] = e[r];
	return n;
}
var Fa = (e) => e ? ic(e) ? gc(e) : Fa(e.parent) : null, Ia = /* @__PURE__ */ T(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Fa(e.parent),
	$root: (e) => Fa(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => oo(e),
	$forceUpdate: (e) => e.f ||= () => {
		hr(e.update);
	},
	$nextTick: (e) => e.n ||= pr.bind(e.proxy),
	$watch: (e) => Gr.bind(e)
}), La = (e, t) => e !== y && !e.__isScriptSetup && D(e, t), Ra = {
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
			else if (La(r, t)) return o[t] = 1, r[t];
			else if (i !== y && D(i, t)) return o[t] = 2, i[t];
			else if (D(a, t)) return o[t] = 3, a[t];
			else if (n !== y && D(n, t)) return o[t] = 4, n[t];
			else to && (o[t] = 0);
		}
		let l = Ia[t], u, d;
		if (l) return t === "$attrs" && Et(e.attrs, "get", ""), l(e);
		if ((u = s.__cssModules) && (u = u[t])) return u;
		if (n !== y && D(n, t)) return o[t] = 4, n[t];
		if (d = c.config.globalProperties, D(d, t)) return d[t];
	},
	set({ _: e }, t, n) {
		let { data: r, setupState: i, ctx: a } = e;
		return La(i, t) ? (i[t] = n, !0) : r !== y && D(r, t) ? (r[t] = n, !0) : D(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (a[t] = n, !0);
	},
	has({ _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: i, props: a, type: o } }, s) {
		let c;
		return !!(n[s] || e !== y && s[0] !== "$" && D(e, s) || La(t, s) || D(a, s) || D(r, s) || D(Ia, s) || D(i.config.globalProperties, s) || (c = o.__cssModules) && c[s]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? D(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
}, za = /* @__PURE__ */ T({}, Ra, {
	get(e, t) {
		if (t !== Symbol.unscopables) return Ra.get(e, t, e);
	},
	has(e, t) {
		return t[0] !== "_" && !De(t);
	}
});
function Ba() {
	return null;
}
function Va() {
	return null;
}
function Ha(e) {}
function Ua(e) {}
function Wa() {
	return null;
}
function Ga() {}
function Ka(e, t) {
	return null;
}
function qa() {
	return Ya("useSlots").slots;
}
function Ja() {
	return Ya("useAttrs").attrs;
}
function Ya(e) {
	let t = $s();
	return t.setupContext ||= hc(t);
}
function Xa(e) {
	return O(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Za(e, t) {
	let n = Xa(e);
	for (let e in t) {
		if (e.startsWith("__skip")) continue;
		let r = n[e];
		r ? O(r) || k(r) ? r = n[e] = {
			type: r,
			default: t[e]
		} : r.default = t[e] : r === null && (r = n[e] = { default: t[e] }), r && t[`__skip_${e}`] && (r.skipFactory = !0);
	}
	return n;
}
function Qa(e, t) {
	return !e || !t ? e || t : O(e) && O(t) ? e.concat(t) : T({}, Xa(e), Xa(t));
}
function $a(e, t) {
	let n = {};
	for (let r in e) t.includes(r) || Object.defineProperty(n, r, {
		enumerable: !0,
		get: () => e[r]
	});
	return n;
}
function eo(e) {
	let t = $s(), n = ac, r = e();
	rc(), n && tc(!1);
	let i = () => {
		nc(t), n && tc(!0);
	}, a = () => {
		$s() !== t && t.scope.off(), rc(), n && tc(!1);
	};
	return se(r) && (r = r.catch((e) => {
		throw i(), Promise.resolve().then(() => Promise.resolve().then(a)), e;
	})), [r, () => {
		i(), Promise.resolve().then(a);
	}];
}
var to = !0;
function no(e) {
	let t = oo(e), n = e.proxy, r = e.ctx;
	to = !1, t.beforeCreate && io(t.beforeCreate, e, "bc");
	let { data: i, computed: a, methods: o, watch: s, provide: c, inject: l, created: u, beforeMount: d, mounted: f, beforeUpdate: p, updated: m, activated: h, deactivated: g, beforeDestroy: _, beforeUnmount: v, destroyed: y, unmounted: b, render: S, renderTracked: C, renderTriggered: w, errorCaptured: T, serverPrefetch: ee, expose: E, inheritAttrs: D, components: te, directives: ne, filters: re } = t;
	if (l && ro(l, r, null), o) for (let e in o) {
		let t = o[e];
		k(t) && (r[e] = t.bind(n));
	}
	if (i) {
		let t = i.call(n, n);
		A(t) && (e.data = /* @__PURE__ */ fn(t));
	}
	if (to = !0, a) for (let e in a) {
		let t = a[e], i = J({
			get: k(t) ? t.bind(n, n) : k(t.get) ? t.get.bind(n, n) : x,
			set: !k(t) && k(t.set) ? t.set.bind(n) : x
		});
		Object.defineProperty(r, e, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		});
	}
	if (s) for (let e in s) ao(s[e], r, n, e);
	if (c) {
		let e = k(c) ? c.call(n) : c;
		Reflect.ownKeys(e).forEach((t) => {
			Fr(t, e[t]);
		});
	}
	u && io(u, e, "c");
	function ie(e, t) {
		O(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (ie(pa, d), ie(ma, f), ie(ha, p), ie(ga, m), ie(aa, h), ie(oa, g), ie(Sa, T), ie(xa, C), ie(ba, w), ie(_a, v), ie(va, b), ie(ya, ee), O(E)) {
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
	S && e.render === x && (e.render = S), D != null && (e.inheritAttrs = D), te && (e.components = te), ne && (e.directives = ne), ee && Ci(e);
}
function ro(e, t, n = x) {
	O(e) && (e = fo(e));
	for (let n in e) {
		let r = e[n], i;
		i = A(r) ? "default" in r ? Ir(r.from || n, r.default, !0) : Ir(r.from || n) : Ir(r), /* @__PURE__ */ wn(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function io(e, t, n) {
	rr(O(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function ao(e, t, n, r) {
	let i = r.includes(".") ? Kr(n, r) : () => n[r];
	if (ae(e)) {
		let n = t[e];
		k(n) && Ur(i, n);
	} else if (k(e)) Ur(i, e.bind(n));
	else if (A(e)) {
		if (O(e)) e.forEach((e) => ao(e, t, n, r));
		else {
			let r = k(e.handler) ? e.handler.bind(n) : t[e.handler];
			k(r) && Ur(i, r, e);
		}
	}
}
function oo(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => so(c, e, o, !0)), so(c, t, o)), A(t) && a.set(t, c), c;
}
function so(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && so(e, a, n, !0), i && i.forEach((t) => so(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = co[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var co = {
	data: lo,
	props: ho,
	emits: ho,
	methods: mo,
	computed: mo,
	beforeCreate: po,
	created: po,
	beforeMount: po,
	mounted: po,
	beforeUpdate: po,
	updated: po,
	beforeDestroy: po,
	beforeUnmount: po,
	destroyed: po,
	unmounted: po,
	activated: po,
	deactivated: po,
	errorCaptured: po,
	serverPrefetch: po,
	components: mo,
	directives: mo,
	watch: go,
	provide: lo,
	inject: uo
};
function lo(e, t) {
	return t ? e ? function() {
		return T(k(e) ? e.call(this, this) : e, k(t) ? t.call(this, this) : t);
	} : t : e;
}
function uo(e, t) {
	return mo(fo(e), fo(t));
}
function fo(e) {
	if (O(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function po(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function mo(e, t) {
	return e ? T(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function ho(e, t) {
	return e ? O(e) && O(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : T(/* @__PURE__ */ Object.create(null), Xa(e), Xa(t ?? {})) : t;
}
function go(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = T(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = po(e[r], t[r]);
	return n;
}
function _o() {
	return {
		app: null,
		config: {
			isNativeTag: S,
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
var vo = 0;
function yo(e, t) {
	return function(n, r = null) {
		k(n) || (n = T({}, n)), r != null && !A(r) && (r = null);
		let i = _o(), a = /* @__PURE__ */ new WeakSet(), o = [], s = !1, c = i.app = {
			_uid: vo++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Cc,
			get config() {
				return i.config;
			},
			set config(e) {},
			use(e, ...t) {
				return a.has(e) || (e && k(e.install) ? (a.add(e), e.install(c, ...t)) : k(e) && (a.add(e), e(c, ...t))), c;
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
					let u = c._ceVNode || K(n, r);
					return u.appContext = i, l === !0 ? l = "svg" : l === !1 && (l = void 0), o && t ? t(u, a) : e(u, a, l), s = !0, c._container = a, a.__vue_app__ = c, gc(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				s && (rr(o, c._instance, 16), e(null, c._container), delete c._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, c;
			},
			runWithContext(e) {
				let t = bo;
				bo = c;
				try {
					return e();
				} finally {
					bo = t;
				}
			}
		};
		return c;
	};
}
var bo = null;
function xo(e, t, n = y) {
	let r = $s(), i = ge(t), a = ve(t), o = So(e, i), s = Nn((o, s) => {
		let c, l = y, u;
		return Hr(() => {
			let t = e[i];
			xe(c, t) && (c = t, s());
		}), {
			get() {
				return o(), n.get ? n.get(c) : c;
			},
			set(e) {
				let o = n.set ? n.set(e) : e;
				if (!xe(o, c) && !(l !== y && xe(e, l))) return;
				let d = r.vnode.props, f = !!(d && (t in d || i in d || a in d) && (`onUpdate:${t}` in d || `onUpdate:${i}` in d || `onUpdate:${a}` in d));
				f || (c = e, s()), r.emit(`update:${t}`, o), xe(e, l) && (xe(e, o) && !xe(o, u) || f && l !== y && !xe(o, c)) && s(), l = e, u = o;
			}
		};
	});
	return s[Symbol.iterator] = () => {
		let e = 0;
		return { next() {
			return e < 2 ? {
				value: e++ ? o || y : s,
				done: !1
			} : { done: !0 };
		} };
	}, s;
}
var So = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${ge(t)}Modifiers`] || e[`${ve(t)}Modifiers`];
function Co(e, t, ...n) {
	if (e.isUnmounted) return;
	let r = e.vnode.props || y, i = n, a = t.startsWith("update:"), o = a && So(r, t.slice(7));
	o && (o.trim && (i = n.map((e) => ae(e) ? e.trim() : e)), o.number && (i = i.map(Ce)));
	let s, c = r[s = be(t)] || r[s = be(ge(t))];
	!c && a && (c = r[s = be(ve(t))]), c && rr(c, e, 6, i);
	let l = r[s + "Once"];
	if (l) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[s]) return;
		e.emitted[s] = !0, rr(l, e, 6, i);
	}
}
var wo = /* @__PURE__ */ new WeakMap();
function To(e, t, n = !1) {
	let r = n ? wo : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, s = !1;
	if (!k(e)) {
		let r = (e) => {
			let n = To(e, t, !0);
			n && (s = !0, T(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !s ? (A(e) && r.set(e, null), null) : (O(a) ? a.forEach((e) => o[e] = null) : T(o, a), A(e) && r.set(e, o), o);
}
function Eo(e, t) {
	return !e || !C(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), D(e, t[0].toLowerCase() + t.slice(1)) || D(e, ve(t)) || D(e, t));
}
function Do(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: o, attrs: s, emit: c, render: l, renderCache: u, props: d, data: f, setupState: p, ctx: m, inheritAttrs: h } = e, g = kr(e), _, v;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			_ = Us(l.call(t, e, u, d, p, f, m)), v = s;
		} else {
			let e = t;
			_ = Us(e.length > 1 ? e(d, {
				attrs: s,
				slots: o,
				emit: c
			}) : e(d, null)), v = t.props ? s : ko(s);
		}
	} catch (t) {
		Ds.length = 0, ir(t, e, 1), _ = K(Ts);
	}
	let y = _;
	if (v && h !== !1) {
		let e = Object.keys(v), { shapeFlag: t } = y;
		e.length && t & 7 && (a && e.some(w) && (v = Ao(v, a)), y = Bs(y, v, !1, !0));
	}
	return n.dirs && (y = Bs(y, null, !1, !0), y.dirs = y.dirs ? y.dirs.concat(n.dirs) : n.dirs), n.transition && yi(Yr(y.type) && vi(y) || y, n.transition), _ = y, kr(g), _;
}
function Oo(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (Ns(r)) {
			if (r.type !== Ts || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var ko = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || C(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, Ao = (e, t) => {
	let n = {};
	for (let r in e) w(r) && r.slice(9) in t || (n[r] = e[r]);
	return n;
};
function jo(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? Mo(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (No(o, r, n) && !Eo(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || Mo(r, o, l) : !!o;
	return !1;
}
function Mo(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!D(e, a) || No(t, e, a) && !Eo(n, a)) return !0;
	}
	return !1;
}
function No(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && A(r) && A(i) ? !Ve(r, i) : r !== i;
}
function Po({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var Fo = {}, Io = () => Object.create(Fo), Lo = (e) => Object.getPrototypeOf(e) === Fo;
function Ro(e, t, n, r = !1) {
	let i = {}, a = Io();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Bo(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ pn(i) : e.type.props ? i : a, e.attrs = a;
}
function zo(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ F(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (Eo(e.emitsOptions, o)) continue;
				let u = t[o];
				if (c) {
					if (D(a, o)) u !== a[o] && (a[o] = u, l = !0);
					else {
						let t = ge(o);
						i[t] = Vo(c, s, t, u, e, !1);
					}
				} else u !== a[o] && (a[o] = u, l = !0);
			}
		}
	} else {
		Bo(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) t && (D(t, a) || (r = ve(a)) !== a && D(t, r)) || (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Vo(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) t && D(t, e) || (delete a[e], l = !0);
	}
	l && Dt(e.attrs, "set", "");
}
function Bo(e, t, n, r) {
	let [i, a] = e.propsOptions, o = !1, s;
	if (t) for (let c in t) {
		if (pe(c)) continue;
		let l = t[c], u;
		i && D(i, u = ge(c)) ? !a || !a.includes(u) ? n[u] = l : (s ||= {})[u] = l : Eo(e.emitsOptions, c) || c in r && l === r[c] || (r[c] = l, o = !0);
	}
	if (a) {
		let t = /* @__PURE__ */ F(n), r = s || y;
		for (let o = 0; o < a.length; o++) {
			let s = a[o];
			n[s] = Vo(i, t, s, r[s], e, !D(r, s));
		}
	}
	return o;
}
function Vo(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = D(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && k(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = nc(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === ve(n)) && (r = !0));
	}
	return r;
}
var Ho = /* @__PURE__ */ new WeakMap();
function Uo(e, t, n = !1) {
	let r = n ? Ho : t.propsCache, i = r.get(e);
	if (i) return i;
	let a = e.props, o = {}, s = [], c = !1;
	if (!k(e)) {
		let r = (e) => {
			c = !0;
			let [n, r] = Uo(e, t, !0);
			T(o, n), r && s.push(...r);
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	if (!a && !c) return A(e) && r.set(e, b), b;
	if (O(a)) for (let e = 0; e < a.length; e++) {
		let t = ge(a[e]);
		Wo(t) && (o[t] = y);
	}
	else if (a) for (let e in a) {
		let t = ge(e);
		if (Wo(t)) {
			let n = a[e], r = o[t] = O(n) || k(n) ? { type: n } : T({}, n), i = r.type, c = !1, l = !0;
			if (O(i)) for (let e = 0; e < i.length; ++e) {
				let t = i[e], n = k(t) && t.name;
				if (n === "Boolean") {
					c = !0;
					break;
				}
				n === "String" && (l = !1);
			}
			else c = k(i) && i.name === "Boolean";
			r[0] = c, r[1] = l, (c || D(r, "default")) && s.push(t);
		}
	}
	let l = [o, s];
	return A(e) && r.set(e, l), l;
}
function Wo(e) {
	return e[0] !== "$" && !pe(e);
}
var Go = (e) => e === "_" || e === "_ctx" || e === "$stable", Ko = (e) => O(e) ? e.map(Us) : [Us(e)], qo = (e, t, n) => {
	if (t._n) return t;
	let r = R((...e) => Ko(t(...e)), n);
	return r._c = !1, r;
}, Jo = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Go(n)) continue;
		let i = e[n];
		if (k(i)) t[n] = qo(n, i, r);
		else if (i != null) {
			let e = Ko(i);
			t[n] = () => e;
		}
	}
}, Yo = (e, t) => {
	let n = Ko(t);
	e.slots.default = () => n;
}, Xo = (e, t, n) => {
	for (let r in t) (n || !Go(r)) && (e[r] = t[r]);
}, Zo = (e, t, n) => {
	let r = e.slots = Io();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Xo(r, t, n), n && Se(r, "_", e, !0)) : Jo(t, r);
	} else t && Yo(e, t);
}, Qo = (e, t, n) => {
	let { vnode: r, slots: i } = e, a = !0, o = y;
	if (r.shapeFlag & 32) {
		let e = t._;
		e ? n && e === 1 ? a = !1 : Xo(i, t, n) : (a = !t.$stable, Jo(t, i)), o = t;
	} else t && (Yo(e, t), o = { default: 1 });
	if (a) for (let e in i) !Go(e) && o[e] == null && delete i[e];
}, $o = xs;
function es(e) {
	return ns(e);
}
function ts(e) {
	return ns(e, Fi);
}
function ns(e, t) {
	let n = Ee();
	n.__VUE__ = !0;
	let { insert: r, remove: i, patchProp: a, createElement: o, createText: s, createComment: c, setText: l, setElementText: u, parentNode: d, nextSibling: f, setScopeId: p = x, insertStaticContent: m } = e, h = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !Ps(e, t) && (r = ge(e), ue(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === b && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case ws:
				g(e, t, n, r);
				break;
			case Ts:
				_(e, t, n, r);
				break;
			case Es:
				e ?? v(t, n, r, o);
				break;
			case V:
				ne(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? w(e, t, n, r, i, a, o, s, c) : d & 6 ? re(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, ve);
		}
		u != null && i ? Di(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && Di(e.ref, null, a, e, !0);
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
	}, S = ({ el: e, anchor: t }, n, i) => {
		let a;
		for (; e && e !== t;) a = f(e), r(e, n, i), e = a;
		r(t, n, i);
	}, C = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = f(e), i(e), e = n;
		i(t);
	}, w = (e, t, n, r, i, a, o, s, c) => {
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) T(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), D(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, T = (e, t, n, i, s, c, l, d) => {
		let f, p, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (f = e.el = o(e.type, c, m && m.is, m), h & 8 ? u(f, e.children) : h & 16 && E(e.children, f, null, i, s, rs(e, c), l, d), _ && Pr(e, null, i, "created"), ee(f, e, e.scopeId, l, i), m) {
			for (let e in m) e !== "value" && !pe(e) && a(f, e, null, m[e], c, i);
			"value" in m && a(f, "value", null, m.value, c), (p = m.onVnodeBeforeMount) && qs(p, i, e);
		}
		_ && Pr(e, null, i, "beforeMount");
		let v = as(s, g);
		v && g.beforeEnter(f), r(f, t, n), ((p = m && m.onVnodeMounted) || v || _) && $o(() => {
			try {
				p && qs(p, i, e), v && g.enter(f), _ && Pr(e, null, i, "mounted");
			} finally {}
		}, s);
	}, ee = (e, t, n, r, i) => {
		if (n && p(e, n), r) for (let t = 0; t < r.length; t++) p(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || ds(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				ee(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, E = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? Ws(e[l]) : Us(e[l]);
			h(null, c, t, n, r, i, a, o, s);
		}
	}, D = (e, t, n, r, i, o, s) => {
		let c = t.el = e.el, { patchFlag: l, dynamicChildren: d, dirs: f } = t;
		l |= e.patchFlag & 16;
		let p = e.props || y, m = t.props || y, h;
		if (n && is(n, !1), (h = m.onVnodeBeforeUpdate) && qs(h, n, t, e), f && Pr(t, e, n, "beforeUpdate"), n && is(n, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (l = 0, s = !1, d = null), (p.innerHTML && m.innerHTML == null || p.textContent && m.textContent == null) && u(c, ""), d ? O(e.dynamicChildren, d, c, n, r, rs(t, i), o) : s || A(e, t, c, null, n, r, rs(t, i), o, !1), l > 0) {
			if (l & 16) te(c, p, m, n, i);
			else if (l & 2 && p.class !== m.class && a(c, "class", null, m.class, i), l & 4 && a(c, "style", p.style, m.style, i), l & 8) {
				let e = t.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let r = e[t], o = p[r], s = m[r];
					(s !== o || r === "value") && a(c, r, o, s, i, n);
				}
			}
			l & 1 && e.children !== t.children && u(c, t.children);
		} else !s && d == null && te(c, p, m, n, i);
		((h = m.onVnodeUpdated) || f) && $o(() => {
			h && qs(h, n, t, e), f && Pr(t, e, n, "updated");
		}, r);
	}, O = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || us(c), f = u && (c.type === V || !Ps(c, l) || c.shapeFlag & 198) ? d(u) : n;
			h(c, l, f, null, r, i, a, o, !0);
		}
	}, te = (e, t, n, r, i) => {
		if (t !== n) {
			if (t !== y) for (let o in t) !pe(o) && !(o in n) && a(e, o, t[o], null, i, r);
			for (let o in n) {
				if (pe(o)) continue;
				let s = n[o], c = t[o];
				s !== c && o !== "value" && a(e, o, c, s, i, r);
			}
			"value" in n && a(e, "value", t.value, n.value, i);
		}
	}, ne = (e, t, n, i, a, o, c, l, u) => {
		let d = t.el = e ? e.el : s(""), f = t.anchor = e ? e.anchor : s(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (l = l ? l.concat(h) : h), e == null ? (r(d, n, i), r(f, n, i), E(t.children || [], n, f, a, o, c, l, u)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (O(e.dynamicChildren, m, n, a, o, c, l), (t.key != null || a && t === a.subTree) && os(e, t, !0)) : A(e, t, n, f, a, o, c, l, u);
	}, re = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : ie(t, n, r, i, a, o, c) : k(e, t, c);
	}, ie = (e, t, n, r, i, a, o) => {
		let s = e.component = Zs(e, r, i);
		if (na(e) && (s.ctx.renderer = ve), oc(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, ae, o, a), !e.el) {
				let r = s.subTree = K(Ts);
				_(null, r, t, n), e.placeholder = r.el;
			}
		} else ae(s, e, t, n, i, a, o);
	}, k = (e, t, n) => {
		let r = t.component = e.component;
		if (jo(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, oe(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, ae = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = cs(e);
					if (n) {
						t && (t.el = c.el, oe(e, t, o)), n.asyncDep.then(() => {
							$o(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, f;
				is(e, !1), t ? (t.el = c.el, oe(e, t, o)) : t = c, n && j(n), (f = t.props && t.props.onVnodeBeforeUpdate) && qs(f, s, t, c), is(e, !0);
				let p = Do(e), m = e.subTree;
				e.subTree = p, h(m, p, d(m.el), ge(m), e, i, a), t.el = p.el, u === null && Po(e, p.el), r && $o(r, i), (f = t.props && t.props.onVnodeUpdated) && $o(() => qs(f, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = $i(t);
				if (is(e, !1), l && j(l), !m && (o = c && c.onVnodeBeforeMount) && qs(o, d, t), is(e, !0), s && be) {
					let t = () => {
						e.subTree = Do(e), be(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = Do(e);
					h(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && $o(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					$o(() => qs(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && $i(d.vnode) && d.vnode.shapeFlag & 256) && e.a && $o(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new $e(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => hr(u), is(e, !0), l();
	}, oe = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, zo(e, t.props, r, n), Qo(e, t.children, n), ht(), vr(e), gt();
	}, A = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, d = e ? e.shapeFlag : 0, f = t.children, { patchFlag: p, shapeFlag: m } = t;
		if (p > 0) {
			if (p & 128) {
				ce(l, f, n, r, i, a, o, s, c);
				return;
			}
			if (p & 256) {
				se(l, f, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (d & 16 && he(l, i, a), f !== l && u(n, f)) : d & 16 ? m & 16 ? ce(l, f, n, r, i, a, o, s, c) : he(l, i, a, !0) : (d & 8 && u(n, ""), m & 16 && E(f, n, r, i, a, o, s, c));
	}, se = (e, t, n, r, i, a, o, s, c) => {
		e ||= b, t ||= b;
		let l = e.length, u = t.length, d = Math.min(l, u), f = 0;
		for (; f < d; f++) {
			let r = t[f] = c ? Ws(t[f]) : Us(t[f]);
			h(e[f], r, n, null, i, a, o, s, c);
		}
		l > u ? he(e, i, a, !0, !1, d) : E(t, n, r, i, a, o, s, c, d);
	}, ce = (e, t, n, r, i, a, o, s, c) => {
		let l = 0, u = t.length, d = e.length - 1, f = u - 1;
		for (; l <= d && l <= f;) {
			let r = e[l], u = t[l] = c ? Ws(t[l]) : Us(t[l]);
			if (Ps(r, u)) h(r, u, n, null, i, a, o, s, c);
			else break;
			l++;
		}
		for (; l <= d && l <= f;) {
			let r = e[d], l = t[f] = c ? Ws(t[f]) : Us(t[f]);
			if (Ps(r, l)) h(r, l, n, null, i, a, o, s, c);
			else break;
			d--, f--;
		}
		if (l > d) {
			if (l <= f) {
				let e = f + 1, d = e < u ? t[e].el : r;
				for (; l <= f;) h(null, t[l] = c ? Ws(t[l]) : Us(t[l]), n, d, i, a, o, s, c), l++;
			}
		} else if (l > f) for (; l <= d;) ue(e[l], i, a, !0), l++;
		else {
			let p = l, m = l, g = /* @__PURE__ */ new Map();
			for (l = m; l <= f; l++) {
				let e = t[l] = c ? Ws(t[l]) : Us(t[l]);
				e.key != null && g.set(e.key, l);
			}
			let _, v = 0, y = f - m + 1, x = !1, S = 0, C = Array(y);
			for (l = 0; l < y; l++) C[l] = 0;
			for (l = p; l <= d; l++) {
				let r = e[l];
				if (v >= y) {
					ue(r, i, a, !0);
					continue;
				}
				let u;
				if (r.key != null) u = g.get(r.key);
				else for (_ = m; _ <= f; _++) if (C[_ - m] === 0 && Ps(r, t[_])) {
					u = _;
					break;
				}
				u === void 0 ? ue(r, i, a, !0) : (C[u - m] = l + 1, u >= S ? S = u : x = !0, h(r, t[u], n, null, i, a, o, s, c), v++);
			}
			let w = x ? ss(C) : b;
			for (_ = w.length - 1, l = y - 1; l >= 0; l--) {
				let e = m + l, d = t[e], f = t[e + 1], p = e + 1 < u ? f.el || us(f) : r;
				C[l] === 0 ? h(null, d, n, p, i, a, o, s, c) : x && (_ < 0 || l !== w[_] ? le(d, n, p, 2) : _--);
			}
		}
	}, le = (e, t, n, a, o = null) => {
		let { el: s, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) le(e.component.subTree, t, n, a);
		else if (d & 128) e.suspense.move(t, n, a);
		else if (d & 64) c.move(e, t, n, ve);
		else if (c === V) {
			r(s, t, n);
			for (let e = 0; e < u.length; e++) le(u[e], t, n, a);
			r(e.anchor, t, n);
		} else if (c === Es) S(e, t, n);
		else if (a !== 2 && d & 1 && l) {
			if (a === 0) l.persisted && !s[si] ? r(s, t, n) : (l.beforeEnter(s), r(s, t, n), $o(() => l.enter(s), o));
			else {
				let { leave: a, delayLeave: o, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? i(s) : r(s, t, n);
				}, d = () => {
					let e = s._isLeaving || !!s[si];
					s._isLeaving && s[si](!0), l.persisted && !e ? u() : a(s, () => {
						u(), c && c();
					});
				};
				o ? o(s, u, d) : d();
			}
		} else r(s, t, n);
	}, ue = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (ht(), Di(s, null, n, e, !0), gt()), p == null || e.ctx && e.ctx !== t || (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !$i(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && qs(_, t, e), u & 6) me(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Pr(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ve, r) : l && !l.hasOnce && (a !== V || d > 0 && d & 64) ? he(l, t, n, !1, !0) : (a === V && d & 384 || !i && u & 16) && he(c, t, n), r && de(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && $o(() => {
			_ && qs(_, t, e), h && Pr(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, de = (e) => {
		let { type: t, el: n, anchor: r, transition: a } = e, o = t === V;
		if (o && !a) {
			fe(n, r);
			return;
		}
		if (t === Es) {
			C(e), a && !a.persisted && a.afterLeave && a.afterLeave();
			return;
		}
		let s = o ? xi(e) : e, c = () => {
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
	}, me = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		ls(c), ls(l), r && j(r), i.stop(), a ? (a.flags |= 8, ue(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, ue(o, e, t, n)), s && $o(s, t), $o(() => {
			e.isUnmounted = !0;
		}, t);
	}, he = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) ue(e[o], t, n, r, i);
	}, ge = (e) => {
		if (e.shapeFlag & 6) return ge(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = f(e.anchor || e.el), n = t && t[Jr];
		return n ? f(n) : t;
	}, _e = (e, t, n) => {
		xr(() => {
			e == null ? t._vnode && ue(t._vnode, null, null, !0) : h(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : Xs());
	}, ve = {
		p: h,
		um: ue,
		m: le,
		r: de,
		mt: ie,
		mc: E,
		pc: A,
		pbc: O,
		n: ge,
		o: e
	}, ye, be;
	return t && ([ye, be] = t(ve)), {
		render: _e,
		hydrate: ye,
		createApp: yo(_e, ye)
	};
}
function rs({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function is({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function as(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function os(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (O(r) && O(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = Ws(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && os(t, a)), a.type === ws && (a.patchFlag === -1 && (a = i[e] = Ws(a)), a.el = t.el), a.type === Ts && !a.el && (a.el = t.el);
	}
}
function ss(e) {
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
function cs(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : cs(t);
}
function ls(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function us(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? us(t.subTree) : null;
}
var ds = (e) => e.__isSuspense, fs = 0, ps = {
	name: "Suspense",
	__isSuspense: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		if (e == null) hs(t, n, r, i, a, o, s, c, l);
		else {
			if (a && a.deps > 0 && !e.suspense.isInFallback && !a.isHydrating) {
				t.suspense = e.suspense, t.suspense.vnode = t, t.el = e.el;
				return;
			}
			gs(e, t, n, r, i, o, s, c, l);
		}
	},
	hydrate: vs,
	normalize: ys
};
function ms(e, t) {
	let n = e.props && e.props[t];
	k(n) && n();
}
function hs(e, t, n, r, i, a, o, s, c) {
	let { p: l, o: { createElement: u } } = c, d = u("div"), f = e.suspense = _s(e, i, r, t, d, n, a, o, s, c);
	l(null, f.pendingBranch = e.ssContent, d, null, r, f, a, o), f.deps > 0 ? (ms(e, "onPending"), ms(e, "onFallback"), l(null, e.ssFallback, t, n, r, null, a, o), Ss(f, e.ssFallback)) : f.resolve(!1, !0);
}
function gs(e, t, n, r, i, a, o, s, { p: c, um: l, o: { createElement: u } }) {
	let d = t.suspense = e.suspense;
	d.vnode = t, t.el = e.el;
	let f = t.ssContent, p = t.ssFallback, { activeBranch: m, pendingBranch: h, isInFallback: g, isHydrating: _ } = d;
	if (h) d.pendingBranch = f, Ps(h, f) ? (d.deps++, c(h, f, _ ? n : d.hiddenContainer, null, i, d, a, o, s), d.deps--, d.deps <= 0 ? d.resolve() : g && !_ && !d.isFallbackMountPending && (c(m, p, n, r, i, null, a, o, s), Ss(d, p))) : (d.pendingId = fs++, _ ? (d.isHydrating = !1, d.activeBranch = h) : l(h, i, d), d.deps = 0, d.effects.length = 0, d.hiddenContainer = u("div"), g ? (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 ? d.resolve() : d.isFallbackMountPending || (c(m, p, n, r, i, null, a, o, s), Ss(d, p))) : m && Ps(m, f) ? (c(m, f, n, r, i, d, a, o, s), d.resolve(!0)) : (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 && d.resolve()));
	else if (m && Ps(m, f)) c(m, f, n, r, i, d, a, o, s), Ss(d, f);
	else if (ms(t, "onPending"), d.pendingBranch = f, d.pendingId = f.shapeFlag & 512 ? f.component.suspenseId : fs++, c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0) d.resolve();
	else {
		let { timeout: e, pendingId: t } = d;
		e > 0 ? setTimeout(() => {
			d.pendingId === t && d.fallback(p);
		}, e) : e === 0 && d.fallback(p);
	}
}
function _s(e, t, n, r, i, a, o, s, c, l, u = !1) {
	let { p: d, m: f, um: p, n: m, o: { parentNode: h, remove: g } } = l, _, v = Cs(e);
	v && t && t.pendingBranch && (_ = t.pendingId, t.deps++);
	let y = e.props ? we(e.props.timeout) : void 0, b = a, x = {
		vnode: e,
		parent: t,
		parentComponent: n,
		namespace: o,
		container: r,
		hiddenContainer: i,
		deps: 0,
		pendingId: fs++,
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
					s === x.pendingId && (f(o, u, a === b && !e ? m(i) : a, 0), _r(c), d && r.ssFallback && (r.ssFallback.el = null));
				}), i && !x.isFallbackMountPending && (h(i.el) === u && (a = m(i), e = !0), p(i, l, x, !0), !g && d && r.ssFallback && $o(() => r.ssFallback.el = null, x)), g || f(o, u, a, 0);
			}
			x.isFallbackMountPending = !1, Ss(x, o), x.pendingBranch = null, x.isInFallback = !1;
			let y = x.parent, S = !1;
			for (; y;) {
				if (y.pendingBranch) {
					for (let e = 0; e < c.length; e++) y.effects.push(c[e]);
					S = !0;
					break;
				}
				y = y.parent;
			}
			!S && !g && _r(c), x.effects = [], v && t && t.pendingBranch && _ === t.pendingId && (_ = void 0, t.deps--, t.deps === 0 && !n && t.resolve()), ms(r, "onResolve");
		},
		fallback(e) {
			if (!x.pendingBranch) return;
			let { vnode: t, activeBranch: n, parentComponent: r, container: i, namespace: a } = x;
			ms(t, "onFallback");
			let o = m(n), l = () => {
				if (x.isFallbackMountPending = !1, !x.isInFallback) return;
				let e = x.vnode.ssFallback;
				d(null, e, i, o, r, null, a, s, c), Ss(x, e);
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
				ir(t, e, 0);
			}).then((o) => {
				if (e.isUnmounted || x.isUnmounted || x.pendingId !== e.suspenseId) return;
				if (rc(), !e.scope.active) {
					i && --x.deps === 0 && x.resolve();
					return;
				}
				e.asyncResolved = !0;
				let { vnode: s } = e;
				cc(e, o, !1), a && (s.el = a);
				let c = !a && e.subTree.el;
				t(e, s, h(a || e.subTree.el), a ? null : m(e.subTree), x, r, n), c && (s.placeholder = null, g(c)), Po(e, s.el), i && --x.deps === 0 && x.resolve();
			});
		},
		unmount(e, t) {
			x.isUnmounted = !0, x.activeBranch && p(x.activeBranch, n, e, t), x.pendingBranch && p(x.pendingBranch, n, e, t);
		}
	};
	return x;
}
function vs(e, t, n, r, i, a, o, s, c) {
	let l = t.suspense = _s(t, r, n, e.parentNode, document.createElement("div"), null, i, a, o, s, !0), u = c(e, l.pendingBranch = t.ssContent, n, l, a, o);
	return l.deps === 0 && l.resolve(!1, !0), u;
}
function ys(e) {
	let { shapeFlag: t, children: n } = e, r = t & 32;
	e.ssContent = bs(r ? n.default : n), e.ssFallback = r ? bs(n.fallback) : K(Ts);
}
function bs(e) {
	let t;
	if (k(e)) {
		let n = As && e._c;
		n && (e._d = !1, H()), e = e(), n && (e._d = !0, t = Os, ks());
	}
	return O(e) && (e = Oo(e)), e = Us(e), t && !e.dynamicChildren && (e.dynamicChildren = t.filter((t) => t !== e)), e;
}
function xs(e, t) {
	t && t.pendingBranch ? O(e) ? t.effects.push(...e) : t.effects.push(e) : _r(e);
}
function Ss(e, t) {
	e.activeBranch = t;
	let { vnode: n, parentComponent: r } = e, i = t.el;
	for (; !i && t.component;) t = t.component.subTree, i = t.el;
	n.el = i, r && r.subTree === n && (r.vnode.el = i, Po(r, i));
}
function Cs(e) {
	let t = e.props && e.props.suspensible;
	return t != null && t !== !1;
}
var V = /* @__PURE__ */ Symbol.for("v-fgt"), ws = /* @__PURE__ */ Symbol.for("v-txt"), Ts = /* @__PURE__ */ Symbol.for("v-cmt"), Es = /* @__PURE__ */ Symbol.for("v-stc"), Ds = [], Os = null;
function H(e = !1) {
	Ds.push(Os = e ? null : []);
}
function ks() {
	Ds.pop(), Os = Ds[Ds.length - 1] || null;
}
var As = 1;
function js(e, t = !1) {
	As += e, e < 0 && Os && t && (Os.hasOnce = !0);
}
function Ms(e) {
	return e.dynamicChildren = As > 0 ? Os || b : null, ks(), As > 0 && Os && Os.push(e), e;
}
function U(e, t, n, r, i, a) {
	return Ms(G(e, t, n, r, i, a, !0));
}
function W(e, t, n, r, i) {
	return Ms(K(e, t, n, r, i, !0));
}
function Ns(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function Ps(e, t) {
	return e.type === t.type && e.key === t.key;
}
function Fs(e) {}
var Is = ({ key: e }) => e ?? null, Ls = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : ae(e) || /* @__PURE__ */ wn(e) || k(e) ? {
	i: Dr,
	r: e,
	k: t,
	f: !!n
} : e);
function G(e, t = null, n = null, r = 0, i = null, a = e === V ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && Is(t),
		ref: t && Ls(t),
		scopeId: Or,
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
		ctx: Dr
	};
	return s ? (Gs(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= ae(n) ? 8 : 16), As > 0 && !o && Os && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Os.push(c), c;
}
var K = Rs;
function Rs(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== Ea || (e = Ts), Ns(e)) {
		let r = Bs(e, t, !0);
		return n && Gs(r, n), As > 0 && !a && Os && (r.shapeFlag & 6 ? Os[Os.indexOf(e)] = r : Os.push(r)), r.patchFlag = -2, r;
	}
	if (vc(e) && (e = e.__vccOpts), t) {
		t = zs(t);
		let { class: e, style: n } = t;
		e && !ae(e) && (t.class = Ne(e)), A(n) && (/* @__PURE__ */ bn(n) && !O(n) && (n = T({}, n)), t.style = Oe(n));
	}
	let o = ae(e) ? 1 : ds(e) ? 128 : Yr(e) ? 64 : A(e) ? 4 : k(e) ? 2 : 0;
	return G(e, t, n, r, i, o, a, !0);
}
function zs(e) {
	return e ? /* @__PURE__ */ bn(e) || Lo(e) ? T({}, e) : e : null;
}
function Bs(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? Ks(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && Is(l),
		ref: t && t.ref ? n && a ? O(a) ? a.concat(Ls(t)) : [a, Ls(t)] : Ls(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== V ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && Bs(e.ssContent),
		ssFallback: e.ssFallback && Bs(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && yi(u, c.clone(u)), u;
}
function Vs(e = " ", t = 0) {
	return K(ws, null, e, t);
}
function Hs(e, t) {
	let n = K(Es, null, e);
	return n.staticCount = t, n;
}
function q(e = "", t = !1) {
	return t ? (H(), W(Ts, null, e)) : K(Ts, null, e);
}
function Us(e) {
	return e == null || typeof e == "boolean" ? K(Ts) : O(e) ? K(V, null, e.slice()) : Ns(e) ? Ws(e) : K(ws, null, String(e));
}
function Ws(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : Bs(e);
}
function Gs(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (O(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), Gs(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !Lo(t) ? t._ctx = Dr : r === 3 && Dr && (Dr.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (k(t)) {
		if (r & 65) {
			Gs(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: Dr
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [Vs(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function Ks(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = Ne([t.class, r.class]));
		else if (e === "style") t.style = Oe([t.style, r.style]);
		else if (C(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(O(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !w(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function qs(e, t, n, r = null) {
	rr(e, t, 7, [n, r]);
}
var Js = _o(), Ys = 0;
function Xs() {
	return Ys;
}
function Zs(e, t, n) {
	let r = e.type, i = (t ? t.appContext : e.appContext) || Js, a = {
		uid: Ys++,
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
		scope: new Je(!0),
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
		propsOptions: Uo(r, i),
		emitsOptions: To(r, i),
		emit: null,
		emitted: null,
		propsDefaults: y,
		inheritAttrs: r.inheritAttrs,
		ctx: y,
		data: y,
		props: y,
		attrs: y,
		slots: y,
		refs: y,
		setupState: y,
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
	return a.ctx = { _: a }, a.root = t ? t.root : a, a.emit = Co.bind(null, a), e.ce && e.ce(a), a;
}
var Qs = null, $s = () => Qs || Dr, ec, tc;
{
	let e = Ee(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	ec = t("__VUE_INSTANCE_SETTERS__", (e) => Qs = e), tc = t("__VUE_SSR_SETTERS__", (e) => ac = e);
}
var nc = (e) => {
	let t = Qs;
	return ec(e), e.scope.on(), () => {
		e.scope.off(), ec(t);
	};
}, rc = () => {
	Qs && Qs.scope.off(), ec(null);
};
function ic(e) {
	return e.vnode.shapeFlag & 4;
}
var ac = !1;
function oc(e, t = !1, n = !1) {
	t && tc(t);
	let { props: r, children: i } = e.vnode, a = ic(e);
	Ro(e, r, a, t), Zo(e, i, n || t);
	let o = a ? sc(e, t) : void 0;
	return t && tc(!1), o;
}
function sc(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Ra);
	let { setup: r } = n;
	if (r) {
		ht();
		let n = e.setupContext = r.length > 1 ? hc(e) : null, i = nc(e), a = nr(r, e, 0, [e.props, n]), o = se(a);
		if (gt(), i(), (o || e.sp) && !$i(e) && Ci(e), o) {
			if (a.then(rc, rc), t) return a.then((n) => {
				tc(!0);
				try {
					cc(e, n, t);
				} finally {
					tc(!1);
				}
			}).catch((t) => {
				ir(t, e, 0);
			});
			e.asyncDep = a;
		} else cc(e, a, t);
	} else pc(e, t);
}
function cc(e, t, n) {
	k(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : A(t) && (e.setupState = jn(t)), pc(e, n);
}
var lc, uc;
function dc(e) {
	lc = e, uc = (e) => {
		e.render._rc && (e.withProxy = new Proxy(e.ctx, za));
	};
}
var fc = () => !lc;
function pc(e, t, n) {
	let r = e.type;
	if (!e.render) {
		if (!t && lc && !r.render) {
			let t = r.template || oo(e).template;
			if (t) {
				let { isCustomElement: n, compilerOptions: i } = e.appContext.config, { delimiters: a, compilerOptions: o } = r, s = T(T({
					isCustomElement: n,
					delimiters: a
				}, i), o);
				r.render = lc(t, s);
			}
		}
		e.render = r.render || x, uc && uc(e);
	}
	{
		let t = nc(e);
		ht();
		try {
			no(e);
		} finally {
			gt(), t();
		}
	}
}
var mc = { get(e, t) {
	return Et(e, "get", ""), e[t];
} };
function hc(e) {
	return {
		attrs: new Proxy(e.attrs, mc),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function gc(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(jn(xn(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Ia) return Ia[n](e);
		},
		has(e, t) {
			return t in e || t in Ia;
		}
	}) : e.proxy;
}
function _c(e, t = !0) {
	return k(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function vc(e) {
	return k(e) && "__vccOpts" in e;
}
var J = (e, t) => /* @__PURE__ */ Bn(e, t, ac);
function yc(e, t, n) {
	try {
		js(-1);
		let r = arguments.length;
		return r === 2 ? A(t) && !O(t) ? Ns(t) ? K(e, null, [t]) : K(e, t) : K(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && Ns(n) && (n = [n]), K(e, t, n));
	} finally {
		js(1);
	}
}
function bc() {}
function xc(e, t, n, r) {
	let i = n[r];
	if (i && Sc(i, e)) return i;
	let a = t();
	return a.memo = e.slice(), a.cacheIndex = r, n[r] = a;
}
function Sc(e, t) {
	let n = e.memo;
	if (n.length != t.length) return !1;
	for (let e = 0; e < n.length; e++) if (xe(n[e], t[e])) return !1;
	return As > 0 && Os && Os.push(e), !0;
}
var Cc = "3.5.44", wc = x, Tc = tr, Ec = wr, Dc = Er, Oc = {
	createComponentInstance: Zs,
	setupComponent: oc,
	renderComponentRoot: Do,
	setCurrentRenderingInstance: kr,
	isVNode: Ns,
	normalizeVNode: Us,
	getComponentPublicInstance: gc,
	ensureValidVNode: Na,
	pushWarningContext: Zn,
	popWarningContext: Qn
}, kc = void 0, Ac = typeof window < "u" && window.trustedTypes;
if (Ac) try {
	kc = /* @__PURE__ */ Ac.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var jc = kc ? (e) => kc.createHTML(e) : (e) => e, Mc = "http://www.w3.org/2000/svg", Nc = "http://www.w3.org/1998/Math/MathML", Pc = typeof document < "u" ? document : null, Fc = Pc && /* @__PURE__ */ Pc.createElement("template"), Ic = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Pc.createElementNS(Mc, e) : t === "mathml" ? Pc.createElementNS(Nc, e) : n ? Pc.createElement(e, { is: n }) : Pc.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Pc.createTextNode(e),
	createComment: (e) => Pc.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Pc.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Fc.innerHTML = jc(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Fc.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Lc = "transition", Rc = "animation", zc = /* @__PURE__ */ Symbol("_vtc"), Bc = {
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
}, Vc = /* @__PURE__ */ T({}, di, Bc), Hc = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = Vc, e))((e, { slots: t }) => yc(mi, Gc(e), t)), Uc = (e, t = []) => {
	O(e) ? e.forEach((e) => e(...t)) : e && e(...t);
}, Wc = (e) => e ? O(e) ? e.some((e) => e.length > 1) : e.length > 1 : !1;
function Gc(e) {
	let t = {};
	for (let n in e) n in Bc || (t[n] = e[n]);
	if (e.css === !1) return t;
	let { name: n = "v", type: r, duration: i, enterFromClass: a = `${n}-enter-from`, enterActiveClass: o = `${n}-enter-active`, enterToClass: s = `${n}-enter-to`, appearFromClass: c = a, appearActiveClass: l = o, appearToClass: u = s, leaveFromClass: d = `${n}-leave-from`, leaveActiveClass: f = `${n}-leave-active`, leaveToClass: p = `${n}-leave-to` } = e, m = Kc(i), h = m && m[0], g = m && m[1], { onBeforeEnter: _, onEnter: v, onEnterCancelled: y, onLeave: b, onLeaveCancelled: x, onBeforeAppear: S = _, onAppear: C = v, onAppearCancelled: w = y } = t, ee = (e, t, n, r) => {
		e._enterCancelled = r, Yc(e, t ? u : s), Yc(e, t ? l : o), n && n();
	}, E = (e, t) => {
		e._isLeaving = !1, Yc(e, d), Yc(e, p), Yc(e, f), t && t();
	}, D = (e) => (t, n) => {
		let i = e ? C : v, o = () => ee(t, e, n);
		Uc(i, [t, o]), Xc(() => {
			Yc(t, e ? c : a), Jc(t, e ? u : s), Wc(i) || Qc(t, r, h, o);
		});
	};
	return T(t, {
		onBeforeEnter(e) {
			Uc(_, [e]), Jc(e, a), Jc(e, o);
		},
		onBeforeAppear(e) {
			Uc(S, [e]), Jc(e, c), Jc(e, l);
		},
		onEnter: D(!1),
		onAppear: D(!0),
		onLeave(e, t) {
			e._isLeaving = !0;
			let n = () => E(e, t);
			Jc(e, d), e._enterCancelled ? (Jc(e, f), nl(e)) : (nl(e), Jc(e, f)), Xc(() => {
				e._isLeaving && (Yc(e, d), Jc(e, p), Wc(b) || Qc(e, r, g, n));
			}), Uc(b, [e, n]);
		},
		onEnterCancelled(e) {
			ee(e, !1, void 0, !0), Uc(y, [e]);
		},
		onAppearCancelled(e) {
			ee(e, !0, void 0, !0), Uc(w, [e]);
		},
		onLeaveCancelled(e) {
			E(e), Uc(x, [e]);
		}
	});
}
function Kc(e) {
	if (e == null) return null;
	if (A(e)) return [qc(e.enter), qc(e.leave)];
	{
		let t = qc(e);
		return [t, t];
	}
}
function qc(e) {
	return we(e);
}
function Jc(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.add(t)), (e[zc] || (e[zc] = /* @__PURE__ */ new Set())).add(t);
}
function Yc(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.remove(t));
	let n = e[zc];
	n && (n.delete(t), n.size || (e[zc] = void 0));
}
function Xc(e) {
	requestAnimationFrame(() => {
		requestAnimationFrame(e);
	});
}
var Zc = 0;
function Qc(e, t, n, r) {
	let i = e._endId = ++Zc, a = () => {
		i === e._endId && r();
	};
	if (n != null) return setTimeout(a, n);
	let { type: o, timeout: s, propCount: c } = $c(e, t);
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
function $c(e, t) {
	let n = window.getComputedStyle(e), r = (e) => (n[e] || "").split(", "), i = r(`${Lc}Delay`), a = r(`${Lc}Duration`), o = el(i, a), s = r(`${Rc}Delay`), c = r(`${Rc}Duration`), l = el(s, c), u = null, d = 0, f = 0;
	t === Lc ? o > 0 && (u = Lc, d = o, f = a.length) : t === Rc ? l > 0 && (u = Rc, d = l, f = c.length) : (d = Math.max(o, l), u = d > 0 ? o > l ? Lc : Rc : null, f = u ? u === Lc ? a.length : c.length : 0);
	let p = u === Lc && /\b(?:transform|all)(?:,|$)/.test(r(`${Lc}Property`).toString());
	return {
		type: u,
		timeout: d,
		propCount: f,
		hasTransform: p
	};
}
function el(e, t) {
	for (; e.length < t.length;) e = e.concat(e);
	return Math.max(...t.map((t, n) => tl(t) + tl(e[n])));
}
function tl(e) {
	return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function nl(e) {
	return (e ? e.ownerDocument : document).body.offsetHeight;
}
function rl(e, t, n) {
	let r = e[zc];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var il = /* @__PURE__ */ Symbol("_vod"), al = /* @__PURE__ */ Symbol("_vsh"), ol = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[il] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : sl(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), sl(e, !0), r.enter(e)) : r.leave(e, () => {
			sl(e, !1);
		}) : sl(e, t));
	},
	beforeUnmount(e, { value: t }) {
		sl(e, t);
	}
};
function sl(e, t) {
	e.style.display = t ? e[il] : "none", e[al] = !t;
}
function cl() {
	ol.getSSRProps = ({ value: e }) => {
		if (!e) return { style: { display: "none" } };
	};
}
var ll = /* @__PURE__ */ Symbol("");
function ul(e) {
	let t = $s();
	if (!t) return;
	let n = t.ut = (n = e(t.proxy)) => {
		Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach((e) => fl(e, n));
	}, r = () => {
		let r = e(t.proxy);
		t.ce ? fl(t.ce, r) : dl(t.subTree, r), n(r);
	};
	ha(() => {
		_r(r);
	}), ma(() => {
		Ur(r, x, { flush: "post" });
		let e = new MutationObserver(r);
		e.observe(t.subTree.el.parentNode, { childList: !0 }), va(() => e.disconnect());
	});
}
function dl(e, t) {
	if (e.shapeFlag & 128) {
		let n = e.suspense;
		e = n.activeBranch, n.pendingBranch && !n.isHydrating && n.effects.push(() => {
			dl(n.activeBranch, t);
		});
	}
	for (; e.component;) e = e.component.subTree;
	if (e.shapeFlag & 1 && e.el) fl(e.el, t);
	else if (e.type === V) e.children.forEach((e) => dl(e, t));
	else if (e.type === Es) {
		let { el: n, anchor: r } = e;
		for (; n && (fl(n, t), n !== r);) n = n.nextSibling;
	}
}
function fl(e, t) {
	if (e.nodeType === 1) {
		let n = e.style, r = "";
		for (let e in t) {
			let i = Ke(t[e]);
			n.setProperty(`--${e}`, i), r += `--${e}: ${i};`;
		}
		n[ll] = r;
	}
}
var pl = /(?:^|;)\s*display\s*:/;
function ml(e, t, n) {
	let r = e.style, i = ae(n), a = !1;
	if (n && !i) {
		if (t) {
			if (ae(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? gl(r, t, "");
			}
			else for (let e in t) n[e] ?? gl(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? gl(r, i, "") : bl(e, i, !ae(t) && t ? t[i] : void 0, o) || gl(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[ll];
			e && (n += ";" + e), r.cssText = n, a = pl.test(n);
		}
	} else t && e.removeAttribute("style");
	il in e && (i && t === n || (e[il] = a ? r.display : ""), e[al] && (r.display = "none"));
}
var hl = /\s*!important$/;
function gl(e, t, n) {
	if (O(n)) n.forEach((n) => gl(e, t, n));
	else if (n ??= "", t.startsWith("--")) hl.test(n) ? e.setProperty(t, n.replace(hl, ""), "important") : e.setProperty(t, n);
	else {
		let r = yl(e, t);
		hl.test(n) ? e.setProperty(ve(r), n.replace(hl, ""), "important") : e[r] = n;
	}
}
var _l = [
	"Webkit",
	"Moz",
	"ms"
], vl = {};
function yl(e, t) {
	let n = vl[t];
	if (n) return n;
	let r = ge(t);
	if (r !== "filter" && r in e) return vl[t] = r;
	r = ye(r);
	for (let n = 0; n < _l.length; n++) {
		let i = _l[n] + r;
		if (i in e) return vl[t] = i;
	}
	return t;
}
function bl(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && ae(r) && n === r;
}
var xl = "http://www.w3.org/1999/xlink";
function Sl(e, t, n, r, i, a = Fe(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(xl, t.slice(6, t.length)) : e.setAttributeNS(xl, t, n) : n == null || a && !Ie(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : oe(n) ? String(n) : n);
}
function Cl(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? jc(n) : n);
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
		r === "boolean" ? n = Ie(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function wl(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function Tl(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var El = /* @__PURE__ */ Symbol("_vei");
function Dl(e, t, n, r, i = null) {
	let a = e[El] || (e[El] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = Al(t);
		r ? wl(e, n, a[t] = Pl(r, i), s) : o && (Tl(e, n, o, s), a[t] = void 0);
	}
}
var Ol = /(Once|Passive|Capture)$/, kl = /^on:?(?:Once|Passive|Capture)$/;
function Al(e) {
	let t, n;
	for (; (n = e.match(Ol)) && !kl.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : ve(e.slice(2)), t];
}
var jl = 0, Ml = /* @__PURE__ */ Promise.resolve(), Nl = () => jl ||= (Ml.then(() => jl = 0), Date.now());
function Pl(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		let r = n.value;
		if (O(r)) {
			let n = e.stopImmediatePropagation;
			e.stopImmediatePropagation = () => {
				n.call(e), e._stopped = !0;
			};
			let i = r.slice(), a = [e];
			for (let n = 0; n < i.length && !e._stopped; n++) {
				let e = i[n];
				e && rr(e, t, 5, a);
			}
		} else rr(r, t, 5, [e]);
	};
	return n.value = e, n.attached = Nl(), n;
}
var Fl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Il = (e, t, n, r, i, a) => {
	let o = i === "svg";
	t === "class" ? rl(e, r, o) : t === "style" ? ml(e, n, r) : C(t) ? w(t) || Dl(e, t, n, r, a) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : Ll(e, t, r, o)) ? (Cl(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || Sl(e, t, r, o, a, t !== "value")) : e._isVueCE && (Rl(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !ae(r))) ? Cl(e, ge(t), r, a, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), Sl(e, t, r, o));
};
function Ll(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && Fl(t) && k(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return Fl(t) && ae(n) ? !1 : t in e;
}
function Rl(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = ge(t);
	return Array.isArray(n) ? n.some((e) => ge(e) === r) : Object.keys(n).some((e) => ge(e) === r);
}
var zl = {};
// @__NO_SIDE_EFFECTS__
function Bl(e, t, n) {
	let r = /* @__PURE__ */ z(e, t);
	de(r) && (r = T({}, r, t));
	class i extends Ul {
		constructor(e) {
			super(r, e, n);
		}
	}
	return i.def = r, i;
}
var Vl = /* @__NO_SIDE_EFFECTS__ */ ((e, t) => /* @__PURE__ */ Bl(e, t, Bu)), Hl = typeof HTMLElement < "u" ? HTMLElement : class {}, Ul = class e extends Hl {
	constructor(e, t = {}, n = zu) {
		super(), this._def = e, this._props = t, this._createApp = n, this._isVueCE = !0, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = !1, this._resolved = !1, this._patching = !1, this._dirty = !1, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._styleAnchors = /* @__PURE__ */ new WeakMap(), this._ob = null, this.shadowRoot && n !== zu ? this._root = this.shadowRoot : e.shadowRoot === !1 ? this._root = this : (this.attachShadow(T({}, e.shadowRootOptions, { mode: "open" })), this._root = this.shadowRoot);
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
		this._connected = !1, pr(() => {
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
			if (n && !O(n)) for (let e in n) {
				let t = n[e];
				(t === Number || t && t.type === Number) && (e in this._props && (this._props[e] = we(this._props[e])), (i ||= /* @__PURE__ */ Object.create(null))[ge(e)] = !0);
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
		if (t) for (let e in t) D(this, e) || Object.defineProperty(this, e, { get: () => L(t[e]) });
	}
	_resolveProps(e) {
		let { props: t } = e, n = O(t) ? t : Object.keys(t || {});
		for (let e of Object.keys(this)) e[0] !== "_" && n.includes(e) && this._setProp(e, this[e]);
		for (let e of n.map(ge)) Object.defineProperty(this, e, {
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
		let t = this.hasAttribute(e), n = t ? this.getAttribute(e) : zl, r = ge(e);
		t && this._numberProps && this._numberProps[r] && (n = we(n)), this._setProp(r, n, !1, !0);
	}
	_getProp(e) {
		return this._props[e];
	}
	_setProp(e, t, n = !0, r = !1) {
		if (t !== this._props[e] && (this._dirty = !0, t === zl ? delete this._props[e] : (this._props[e] = t, e === "key" && this._app && (this._app._ceVNode.key = t)), r && this._instance && this._update(), n)) {
			let n = this._ob;
			n && (this._processMutations(n.takeRecords()), n.disconnect()), t === !0 ? this.setAttribute(ve(e), "") : typeof t == "string" || typeof t == "number" ? this.setAttribute(ve(e), t + "") : t || this.removeAttribute(ve(e)), n && n.observe(this, { attributes: !0 });
		}
	}
	_update() {
		let e = this._createVNode();
		this._app && (e.appContext = this._app._context), Lu(e, this._root);
	}
	_createVNode() {
		let e = {};
		this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
		let t = K(this._def, T(e, this._props));
		return this._instance || (t.ce = (e) => {
			this._instance = e, e.ce = this, e.isCE = !0;
			let t = (e, t) => {
				this.dispatchEvent(new CustomEvent(e, de(t[0]) ? T({ detail: t }, t[0]) : { detail: t }));
			};
			e.emit = (e, ...n) => {
				t(e, n), ve(e) !== e && t(ve(e), n);
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
function Wl(e) {
	let t = $s();
	return t && t.ce || null;
}
function Gl() {
	let e = Wl();
	return e && e.shadowRoot;
}
function Kl(e = "$style") {
	{
		let t = $s();
		if (!t) return y;
		let n = t.type.__cssModules;
		return n && n[e] || y;
	}
}
var ql = /* @__PURE__ */ new WeakMap(), Jl = /* @__PURE__ */ new WeakMap(), Yl = /* @__PURE__ */ Symbol("_moveCb"), Xl = /* @__PURE__ */ Symbol("_enterCb"), Zl = /* @__PURE__ */ new WeakMap(), Ql = /* @__PURE__ */ ((e) => (delete e.props.mode, e))({
	name: "TransitionGroup",
	props: /* @__PURE__ */ T({}, Vc, {
		tag: String,
		moveClass: String
	}),
	setup(e, { slots: t }) {
		let n = $s(), r = li(), i, a, o, s, c = () => (s === void 0 && (s = i.length > 0 && su(i[0].el, n.vnode.el, eu(e))), s);
		return ga(() => {
			if (Zl.delete(n), !c()) {
				i = [], o = void 0;
				return;
			}
			let t = eu(e);
			i.forEach($l);
			let r = o && ou(o, n.vnode.el);
			o = void 0, i.forEach((e) => tu(e, r));
			let a = i.filter(nu);
			nl(n.vnode.el), a.forEach((e) => {
				let n = e.el, r = n.style;
				Jc(n, t), r.transform = r.webkitTransform = r.transitionDuration = "";
				let i = n[Yl] = (e) => {
					e && e.target !== n || (!e || e.propertyName.endsWith("transform")) && (n.removeEventListener("transitionend", i), n[Yl] = null, Yc(n, t));
				};
				n.addEventListener("transitionend", i);
			}), i = [];
		}), () => {
			let l = /* @__PURE__ */ F(e), u = Gc(l), d = l.tag || V;
			if (i = [], s = void 0, a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && !t.el[al] && (i.push(t), yi(t, gi(t, u, r, n)), ql.set(t, ru(t.el)));
			}
			a = t.default ? bi(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && yi(t, gi(t, u, r, n));
			}
			return i.length && (o = iu(n), Zl.set(n, c)), K(d, null, a);
		};
	}
});
function $l(e) {
	let t = e.el;
	t[Yl] && t[Yl](), t[Xl] && t[Xl]();
}
function eu(e) {
	return e.moveClass || `${e.name || "v"}-move`;
}
function tu(e, t) {
	Jl.set(e, ru(e.el, t));
}
function nu(e) {
	let t = ql.get(e), n = Jl.get(e), r = t.left - n.left, i = t.top - n.top;
	if (r || i) {
		let t = e.el, n = t.style, a = t.getBoundingClientRect(), o = 1, s = 1;
		return t.offsetWidth && (o = a.width / t.offsetWidth), t.offsetHeight && (s = a.height / t.offsetHeight), Number.isFinite(o) && o !== 0 || (o = 1), Number.isFinite(s) && s !== 0 || (s = 1), Math.abs(o - 1) < .01 && (o = 1), Math.abs(s - 1) < .01 && (s = 1), n.transform = n.webkitTransform = `translate(${r / o}px,${i / s}px)`, n.transitionDuration = "0s", e;
	}
}
function ru(e, t) {
	let n = e.getBoundingClientRect();
	return {
		left: n.left - (t ? t.left : 0),
		top: n.top - (t ? t.top : 0)
	};
}
function iu(e) {
	let t;
	for (let n = e.parent; n; n = n.parent) {
		let r = Zl.get(n);
		if (r) {
			let i = au(n.vnode.el, e.vnode.el);
			i && (t ||= []).push(T(ru(i), {
				item: i,
				willMove: r
			}));
		}
	}
	return t;
}
function au(e, t) {
	let n = e.nodeType === 1 ? e : e.parentNode;
	for (; t && t.parentNode !== n;) t = t.parentNode;
	if (t && t.nodeType === 1) return t;
}
function ou(e, t) {
	let n = e.find((e) => e.willMove() && e.item.contains(t));
	return n && ru(n.item, n);
}
function su(e, t, n) {
	let r = e.cloneNode(), i = e[zc];
	i && i.forEach((e) => {
		e.split(/\s+/).forEach((e) => e && r.classList.remove(e));
	}), n.split(/\s+/).forEach((e) => e && r.classList.add(e)), r.style.display = "none";
	let a = t.nodeType === 1 ? t : t.parentNode;
	a.appendChild(r);
	let { hasTransform: o } = $c(r);
	return a.removeChild(r), o;
}
var cu = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return O(t) ? (e) => j(t, e) : t;
};
function lu(e) {
	e.target.composing = !0;
}
function uu(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var du = /* @__PURE__ */ Symbol("_assign"), fu = /* @__PURE__ */ Symbol("_initialValue");
function pu(e, t, n) {
	return t && (e = e.trim()), n && (e = Ce(e)), e;
}
var mu = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[fu] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[fu] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[du] = cu(i);
		let a = r || i.props && i.props.type === "number";
		wl(e, t ? "change" : "input", (t) => {
			t.target.composing || e[du](pu(e.value, n, a));
		}), (n || a) && wl(e, "change", () => {
			e.value = pu(e.value, n, a);
		}), t || (wl(e, "compositionstart", lu), wl(e, "compositionend", uu), wl(e, "change", uu));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[fu];
		delete e[fu], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[du](pu(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[du] = cu(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? Ce(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, hu = {
	deep: !0,
	created(e, t, n) {
		e[du] = cu(n), wl(e, "change", () => {
			let t = e._modelValue, n = xu(e), r = e.checked, i = e[du];
			if (O(t)) {
				let e = He(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (ne(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(Su(e, r));
		});
	},
	mounted: gu,
	beforeUpdate(e, t, n) {
		e[du] = cu(n), gu(e, t, n);
	}
};
function gu(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (O(t)) i = He(t, r.props.value) > -1;
	else if (ne(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = Ve(t, Su(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var _u = {
	created(e, { value: t }, n) {
		e.checked = Ve(t, n.props.value), e[du] = cu(n), wl(e, "change", () => {
			e[du](xu(e));
		});
	},
	beforeUpdate(e, { value: t, oldValue: n }, r) {
		e[du] = cu(r), t !== n && (e.checked = Ve(t, r.props.value));
	}
}, vu = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, wl(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? Ce(xu(e)) : xu(e)), r = e.multiple, i = r ? ne(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? O(i) ? t.slice() : t : i];
			try {
				e[du](i);
			} finally {
				pr(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[du] = cu(r);
	},
	mounted(e, { value: t }) {
		bu(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[du] = cu(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, n && n[0] === e.multiple && yu(t, n[1], n[0]) || bu(e, t);
	}
};
function yu(e, t, n) {
	if (!n || O(e)) return Ve(e, t);
	if (ne(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function bu(e, t) {
	let n = e.multiple, r = O(t);
	if (!n || r || ne(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = xu(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : He(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (Ve(xu(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function xu(e) {
	return "_value" in e ? e._value : e.value;
}
function Su(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Cu = {
	created(e, t, n) {
		Tu(e, t, n, null, "created");
	},
	mounted(e, t, n) {
		Tu(e, t, n, null, "mounted");
	},
	beforeUpdate(e, t, n, r) {
		Tu(e, t, n, r, "beforeUpdate");
	},
	updated(e, t, n, r) {
		Tu(e, t, n, r, "updated");
	}
};
function wu(e, t) {
	switch (e) {
		case "SELECT": return vu;
		case "TEXTAREA": return mu;
		default: switch (t) {
			case "checkbox": return hu;
			case "radio": return _u;
			default: return mu;
		}
	}
}
function Tu(e, t, n, r, i) {
	let a = wu(e.tagName, n.props && n.props.type)[i];
	a && a(e, t, n, r);
}
function Eu() {
	mu.getSSRProps = ({ value: e }) => ({ value: e }), _u.getSSRProps = ({ value: e }, t) => {
		if (t.props && Ve(t.props.value, e)) return { checked: !0 };
	}, hu.getSSRProps = ({ value: e }, t) => {
		if (O(e)) {
			if (t.props && He(e, t.props.value) > -1) return { checked: !0 };
		} else if (ne(e)) {
			if (t.props && e.has(t.props.value)) return { checked: !0 };
		} else if (e) return { checked: !0 };
	}, Cu.getSSRProps = (e, t) => {
		if (typeof t.type != "string") return;
		let n = wu(t.type.toUpperCase(), t.props && t.props.type);
		if (n.getSSRProps) return n.getSSRProps(e, t);
	};
}
var Du = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Ou = {
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
	exact: (e, t) => Du.some((n) => e[`${n}Key`] && !t.includes(n))
}, ku = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Ou[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, Au = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, ju = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = ve(n.key);
		if (t.some((e) => e === r || Au[e] === r)) return e(n);
	}));
}, Mu = /* @__PURE__ */ T({ patchProp: Il }, Ic), Nu, Pu = !1;
function Fu() {
	return Nu ||= es(Mu);
}
function Iu() {
	return Nu = Pu ? Nu : ts(Mu), Pu = !0, Nu;
}
var Lu = ((...e) => {
	Fu().render(...e);
}), Ru = ((...e) => {
	Iu().hydrate(...e);
}), zu = ((...e) => {
	let t = Fu().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Hu(e);
		if (!r) return;
		let i = t._component;
		k(i) || i.render || i.template || (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Vu(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
}), Bu = ((...e) => {
	let t = Iu().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let t = Hu(e);
		if (t) return n(t, !0, Vu(t));
	}, t;
});
function Vu(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Hu(e) {
	return ae(e) ? document.querySelector(e) : e;
}
var Uu = !1, Wu = () => {
	Uu || (Uu = !0, Eu(), cl());
}, Gu = /* @__PURE__ */ s({
	BaseTransition: () => mi,
	BaseTransitionPropsValidators: () => di,
	Comment: () => Ts,
	DeprecationTypes: () => null,
	EffectScope: () => Je,
	ErrorCodes: () => er,
	ErrorTypeStrings: () => Tc,
	Fragment: () => V,
	KeepAlive: () => ra,
	ReactiveEffect: () => $e,
	Static: () => Es,
	Suspense: () => ps,
	Teleport: () => ii,
	Text: () => ws,
	TrackOpTypes: () => Vn,
	Transition: () => Hc,
	TransitionGroup: () => Ql,
	TriggerOpTypes: () => Hn,
	VueElement: () => Ul,
	assertNumber: () => $n,
	callWithAsyncErrorHandling: () => rr,
	callWithErrorHandling: () => nr,
	camelize: () => ge,
	capitalize: () => ye,
	cloneVNode: () => Bs,
	compatUtils: () => null,
	compile: () => Ku,
	computed: () => J,
	createApp: () => zu,
	createBlock: () => W,
	createCommentVNode: () => q,
	createElementBlock: () => U,
	createElementVNode: () => G,
	createHydrationRenderer: () => ts,
	createPropsRestProxy: () => $a,
	createRenderer: () => es,
	createSSRApp: () => Bu,
	createSlots: () => Ma,
	createStaticVNode: () => Hs,
	createTextVNode: () => Vs,
	createVNode: () => K,
	customRef: () => Nn,
	defineAsyncComponent: () => ea,
	defineComponent: () => z,
	defineCustomElement: () => Bl,
	defineEmits: () => Va,
	defineExpose: () => Ha,
	defineModel: () => Ga,
	defineOptions: () => Ua,
	defineProps: () => Ba,
	defineSSRCustomElement: () => Vl,
	defineSlots: () => Wa,
	devtools: () => Ec,
	effect: () => dt,
	effectScope: () => Ye,
	getCurrentInstance: () => $s,
	getCurrentScope: () => Xe,
	getCurrentWatcher: () => Kn,
	getTransitionRawChildren: () => bi,
	guardReactiveProps: () => zs,
	h: () => yc,
	handleError: () => ir,
	hasInjectionContext: () => Lr,
	hydrate: () => Ru,
	hydrateOnIdle: () => qi,
	hydrateOnInteraction: () => Zi,
	hydrateOnMediaQuery: () => Xi,
	hydrateOnVisible: () => Yi,
	initCustomFormatter: () => bc,
	initDirectivesForSSR: () => Wu,
	inject: () => Ir,
	isMemoSame: () => Sc,
	isProxy: () => bn,
	isReactive: () => _n,
	isReadonly: () => vn,
	isRef: () => wn,
	isRuntimeOnly: () => fc,
	isShallow: () => yn,
	isVNode: () => Ns,
	markRaw: () => xn,
	mergeDefaults: () => Za,
	mergeModels: () => Qa,
	mergeProps: () => Ks,
	nextTick: () => pr,
	nodeOps: () => Ic,
	normalizeClass: () => Ne,
	normalizeProps: () => Pe,
	normalizeStyle: () => Oe,
	onActivated: () => aa,
	onBeforeMount: () => pa,
	onBeforeUnmount: () => _a,
	onBeforeUpdate: () => ha,
	onDeactivated: () => oa,
	onErrorCaptured: () => Sa,
	onMounted: () => ma,
	onRenderTracked: () => xa,
	onRenderTriggered: () => ba,
	onScopeDispose: () => Ze,
	onServerPrefetch: () => ya,
	onUnmounted: () => va,
	onUpdated: () => ga,
	onWatcherCleanup: () => qn,
	openBlock: () => H,
	patchProp: () => Il,
	popScopeId: () => jr,
	provide: () => Fr,
	proxyRefs: () => jn,
	pushScopeId: () => Ar,
	queuePostFlushCb: () => _r,
	reactive: () => fn,
	readonly: () => mn,
	ref: () => I,
	registerRuntimeCompiler: () => dc,
	render: () => Lu,
	renderList: () => ja,
	renderSlot: () => B,
	resolveComponent: () => Ta,
	resolveDirective: () => Oa,
	resolveDynamicComponent: () => Da,
	resolveFilter: () => null,
	resolveTransitionHooks: () => gi,
	setBlockTracking: () => js,
	setDevtoolsHook: () => Dc,
	setTransitionHooks: () => yi,
	shallowReactive: () => pn,
	shallowReadonly: () => hn,
	shallowRef: () => Tn,
	ssrContextKey: () => Rr,
	ssrUtils: () => Oc,
	stop: () => ft,
	toDisplayString: () => M,
	toHandlerKey: () => be,
	toHandlers: () => Pa,
	toRaw: () => F,
	toRef: () => Ln,
	toRefs: () => Pn,
	toValue: () => kn,
	transformVNodeArgs: () => Fs,
	triggerRef: () => On,
	unref: () => L,
	useAttrs: () => Ja,
	useCssModule: () => Kl,
	useCssVars: () => ul,
	useHost: () => Wl,
	useId: () => Si,
	useModel: () => xo,
	useSSRContext: () => zr,
	useShadowRoot: () => Gl,
	useSlots: () => qa,
	useTemplateRef: () => wi,
	useTransitionState: () => li,
	vModelCheckbox: () => hu,
	vModelDynamic: () => Cu,
	vModelRadio: () => _u,
	vModelSelect: () => vu,
	vModelText: () => mu,
	vShow: () => ol,
	version: () => Cc,
	warn: () => wc,
	watch: () => Ur,
	watchEffect: () => Br,
	watchPostEffect: () => Vr,
	watchSyncEffect: () => Hr,
	withAsyncContext: () => eo,
	withCtx: () => R,
	withDefaults: () => Ka,
	withDirectives: () => Nr,
	withKeys: () => ju,
	withMemo: () => xc,
	withModifiers: () => ku,
	withScopeId: () => Mr
}), Ku = () => {};
// node_modules/zod/v4/core/util.js
function qu(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function Ju(e, t = "|") {
	return e.map((e) => xd(e)).join(t);
}
function Yu(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var Xu = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function Zu(e) {
	return new Xu(e);
}
function Qu(e) {
	return e == null;
}
function $u(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function ed(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
var td = /* @__PURE__*/ Symbol("evaluating");
function nd(e, t, n) {
	let r;
	Object.defineProperty(e, t, {
		get() {
			if (r !== td) return r === void 0 && (r = td, r = n()), r;
		},
		set(n) {
			Object.defineProperty(e, t, { value: n });
		},
		configurable: !0
	});
}
function rd(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function id(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function ad(e) {
	return id(e._zod.def) ?? e._zod.def.shape;
}
function od(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return rd(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function sd(e, t, n) {
	t in e ? rd(e, t, n) : e[t] = n;
}
function cd(e, t, n, r) {
	let i = ad(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? od(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : sd(e, a, r ? r(n.value, a) : n.value));
	}
}
function ld(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? od(e, n, () => t[n]) : sd(e, n, r.value));
	}
}
function ud(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function dd(e) {
	return JSON.stringify(e);
}
function fd(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var pd = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function md(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var hd = /* @__PURE__*/ Zu(() => {
	if (ff.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function gd(e) {
	if (md(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return md(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function _d(e) {
	return gd(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var vd = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function yd(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function bd(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function Y(e) {
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
function xd(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function Sd(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var Cd = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, wd = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function Td(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return cd(i, e, Ed(e, t)), bd(e, ud(n, {
		shape: i,
		checks: []
	}));
}
function Ed(e, t) {
	let n = ad(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function Dd(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Ed(e, t)), a = {};
	return cd(a, e, Reflect.ownKeys(ad(e)).filter((e) => !i.has(e))), bd(e, ud(n, {
		shape: a,
		checks: []
	}));
}
function Od(e, t) {
	if (!gd(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = ad(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return bd(e, ud(e._zod.def, { shape: kd(e, t) }));
}
function kd(e, t) {
	let n = {};
	return cd(n, e, Reflect.ownKeys(ad(e))), ld(n, t), n;
}
function Ad(e, t) {
	if (!gd(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return bd(e, ud(e._zod.def, { shape: kd(e, t) }));
}
function jd(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return cd(n, e, Reflect.ownKeys(ad(e))), cd(n, t, Reflect.ownKeys(ad(t))), bd(e, ud(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function Md(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(Ed(t, n)) : void 0, o = {};
	return cd(o, t, Reflect.ownKeys(ad(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), bd(t, ud(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Nd(e, t, n) {
	let r = n ? new Set(Ed(t, n)) : void 0, i = {};
	return cd(i, t, Reflect.ownKeys(ad(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), bd(t, ud(t._zod.def, { shape: i }));
}
function Pd(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function Fd(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function Id(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Ld(e) {
	return typeof e == "string" ? e : e?.message;
}
function Rd(e) {
	let t = [];
	for (let n of e ?? []) {
		let e = n._zod.def;
		if (!/_(length|size)$|_equals$/.test(e.check)) break;
		let r = e.maximum ?? e.length ?? e.size;
		r >= 0 && t.push([r, n]);
	}
	return t;
}
function zd(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function Bd(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Ld(e.inst?._zod.def?.error?.(e)) ?? Ld(a?.(e)) ?? Ld(t?.error?.(e)) ?? Ld(n.customError?.(e)) ?? Ld(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var Vd = /[\uD800-\uDBFF]/;
function Hd(e) {
	let t = e.length;
	if (!Vd.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function Ud(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Wd(e) {
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
function Gd(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function Kd(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : Xd(e, n, r.value);
	}
}
function qd(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function Jd(e, t, n) {
	return qd(e, t, n, !1);
}
/* @__NO_SIDE_EFFECTS__ */
function Yd(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return qd(this, n, r(this));
			},
			set(e) {
				qd(this, n, e);
			}
		});
	}
	return t;
}
function Xd(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : qd(this, t, n.bind(this));
		},
		set(e) {
			qd(this, t, e);
		}
	});
}
function Zd(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var Qd, $d = !1, ef = {
	configurable: !0,
	get() {
		$d = !0;
	}
};
function tf(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	t in r && Qd !== e._zod ? Qd = void 0 : (Qd = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, ef);
			let e = $d;
			$d = !1;
			try {
				let r = n(this);
				return $d ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), $d ||= e, r;
			} catch (n) {
				throw delete this[t], $d ||= e, n;
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
function nf(e, t, n, r) {
	let i = Zd(e, t);
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
var rf = "~constantCatch";
function af(e) {
	let t = () => e;
	return t[rf] = !0, t;
}
// node_modules/zod/v4/core/core.js
var of, sf = {
	value: void 0,
	enumerable: !1
}, cf = "captureStackTrace" in Error ? Error : null;
function lf(e) {
	let t = cf;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return cf = null, new e();
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
function X(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			sf.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", sf);
			} finally {
				sf.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), Kd(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? lf(u) : this;
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
var uf = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, df = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(of = globalThis).__zod_globalConfig ?? (of.__zod_globalConfig = {});
var ff = globalThis.__zod_globalConfig;
function pf(e) {
	return e && Object.assign(ff, e), ff;
}
// node_modules/zod/v4/core/errors.js
function mf() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, Yu, 2), e.message;
}
function hf(e) {
	this._zod.message = e;
}
var gf = {
	get: mf,
	set: hf,
	enumerable: !0,
	configurable: !0
}, _f = {
	value: void 0,
	enumerable: !1
}, vf = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), yf = /* @__PURE__ */ X("$ZodError", (e, t) => {
	e.name = "$ZodError", _f.value = t, Object.defineProperty(e, "issues", _f), _f.value = void 0, Object.defineProperty(e, "message", gf);
	let n = Object.getPrototypeOf(e);
	vf.has(n) || (vf.add(n), Object.defineProperty(n, "toString", {
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
function bf(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function xf(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? bf(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Sf(e, t = (e) => e.message) {
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
function Cf(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var wf = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new uf();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => Bd(e, o, pf())));
			throw pd(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Tf = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => Bd(e, o, pf())));
			throw pd(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Ef = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new uf();
	return a.issues.length ? Df(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function Df(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => Bd(e, n, pf()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var Of = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? Df(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, kf = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Af = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), jf = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== kf) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return Mf(e, t, n);
});
function Mf(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[Af] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new uf();
	return a.issues.length === 0;
}
var Nf = async (e, t, n) => {
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
}, Pf = (e) => {
	let t = wf(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, Cf(n, a));
	};
	return n;
}, Ff = (e) => {
	let t = wf(e), n = (e, r, i, a) => t(e, r, i, Cf(n, a));
	return n;
}, If = (e) => {
	let t = Tf(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, Cf(n, a));
	};
	return n;
}, Lf = (e) => {
	let t = Tf(e), n = async (e, r, i, a) => await t(e, r, i, Cf(n, a));
	return n;
}, Rf = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Ef(e)(t, n, i);
}, zf = (e) => (t, n, r) => Ef(e)(t, n, r), Bf = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Of(e)(t, n, i);
}, Vf = (e) => async (t, n, r) => Of(e)(t, n, r), Hf = /^[cC][0-9a-z]{6,}$/, Uf = /^[0-9a-z]+$/, Wf = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Gf = /^[0-9a-vA-V]{20}$/, Kf = /^[A-Za-z0-9]{27}$/, qf = /^[a-zA-Z0-9_-]{21}$/;
function Jf(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var Yf = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Xf = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Zf = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Qf = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, $f = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function ep() {
	return new RegExp($f, "u");
}
var tp = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, np = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, rp = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, ip = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, ap = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, op = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, sp = /^https?$/, cp = /^\+[1-9]\d{6,14}$/, lp = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function up(e) {
	return RegExp(`^${e}$`);
}
var dp = /*@__PURE__*/ up(lp);
function fp(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function pp(e) {
	return RegExp(`^${fp(e)}$`);
}
function mp(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${fp({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${fp({ precision: e.precision })}` : n;
	return RegExp(`^${lp}T(?:${r})$`);
}
var hp = /^[\s\S]{0,}$/, gp = /^-?\d+$/, _p = /^-?\d+(?:\.\d+)?$/, vp = /^(?:true|false)$/i, yp = /^[^A-Z]*$/, bp = /^[^a-z]*$/, xp = /*@__PURE__*/ X("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Sp = (e) => {
	let t = e.value;
	return !Qu(t) && t.length !== void 0;
}, Cp = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, wp = /*@__PURE__*/ X("$ZodCheckLessThan", (e, t) => {
	xp.init(e, t);
	let n = Cp[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: Cp[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Tp = /*@__PURE__*/ X("$ZodCheckGreaterThan", (e, t) => {
	xp.init(e, t);
	let n = Cp[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: Cp[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Ep = /*@__PURE__*/ X("$ZodCheckMultipleOf", (e, t) => {
	xp.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : ed(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Dp = /*@__PURE__*/ X("$ZodCheckNumberFormat", (e, t) => {
	xp.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = Cd[t.format];
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
}), Op = /*@__PURE__*/ X("$ZodCheckMaxLength", (e, t) => {
	var n;
	xp.init(e, t), (n = e._zod.def).when ?? (n.when = Sp), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? Hd(r) : i) <= t.maximum) return;
		let a = Ud(r);
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
}), kp = /*@__PURE__*/ X("$ZodCheckMinLength", (e, t) => {
	var n;
	xp.init(e, t), (n = e._zod.def).when ?? (n.when = Sp), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? Hd(r) : i) >= t.minimum) return;
		let a = Ud(r);
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
}), Ap = /*@__PURE__*/ X("$ZodCheckLengthEquals", (e, t) => {
	var n;
	xp.init(e, t), (n = e._zod.def).when ?? (n.when = Sp), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? Hd(r) : i;
		if (a === t.length) return;
		let o = Ud(r), s = a > t.length;
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
}), jp = /*@__PURE__*/ X("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	xp.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
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
}), Mp = /*@__PURE__*/ X("$ZodCheckRegex", (e, t) => {
	jp.init(e, t), e._zod.check = (n) => {
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
}), Np = /*@__PURE__*/ X("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= yp, jp.init(e, t);
}), Pp = /*@__PURE__*/ X("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= bp, jp.init(e, t);
}), Fp = /*@__PURE__*/ X("$ZodCheckIncludes", (e, t) => {
	xp.init(e, t);
	let n = yd(t.includes);
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
}), Ip = /*@__PURE__*/ X("$ZodCheckStartsWith", (e, t) => {
	xp.init(e, t);
	let n = RegExp(`^${yd(t.prefix)}.*`);
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
}), Lp = /*@__PURE__*/ X("$ZodCheckEndsWith", (e, t) => {
	xp.init(e, t);
	let n = RegExp(`.*${yd(t.suffix)}$`);
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
}), Rp = /*@__PURE__*/ X("$ZodCheckOverwrite", (e, t) => {
	xp.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), zp = class {
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
}, Bp = {
	major: 4,
	minor: 6,
	patch: 7
}, Vp = /*@__PURE__*/ X("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Bp;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = Pd(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (Fd(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new uf();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (zd(t.issues, n, e), i ||= Pd(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					zd(t.issues, n, e), i ||= Pd(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (Pd(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new uf();
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
				if (a.async === !1) throw new uf();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return Jd(this, "~standard", Wp(this));
	},
	set "~standard"(e) {
		qd(this, "~standard", e);
	}
}), Hp = (e, t) => e.issues.length ? { issues: e.issues.map((e) => Bd(e, t, pf())) } : { value: e.value };
async function Up(e, t) {
	let n = { async: !0 };
	return Hp(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function Wp(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return Hp(r, n);
			} catch {}
			return Up(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var Gp = /*@__PURE__*/ X("$ZodString", (e, t) => {
	Vp.init(e, t), e._zod.pattern = t.pattern ?? hp, e._zod.parse = (n, r) => {
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
}), Kp = /*@__PURE__*/ X("$ZodStringFormat", (e, t) => {
	jp.init(e, t), Gp.init(e, t);
}), qp = /*@__PURE__*/ X("$ZodGUID", (e, t) => {
	t.pattern ??= Xf, Kp.init(e, t);
}), Jp = /*@__PURE__*/ X("$ZodUUID", (e, t) => {
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
		t.pattern ??= Zf(e);
	} else t.pattern ??= Zf();
	Kp.init(e, t);
}), Yp = /*@__PURE__*/ X("$ZodEmail", (e, t) => {
	t.pattern ??= Qf, Kp.init(e, t);
});
function Xp(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function Zp(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? Xp(e) || 2 : Qp(e, t);
}
function Qp(e, t) {
	if (!t.normalize && t.protocol?.source === sp.source && !/^https?:\/\//i.test(e)) return 1;
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
var $p = /[\t\n\r]/g;
function em(e) {
	return e.replace($p, "");
}
function tm(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function nm(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var rm = /*@__PURE__*/ X("$ZodURL", (e, t) => {
	Kp.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = Zp(r, t);
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
				n.value = em(r);
				return;
			}
			t.hostname && !tm(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !nm(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : em(r);
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
}), im = /*@__PURE__*/ X("$ZodEmoji", (e, t) => {
	t.pattern ??= ep(), Kp.init(e, t);
}), am = /*@__PURE__*/ X("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? qf : Jf(t.length), Kp.init(e, t);
}), om = /*@__PURE__*/ X("$ZodCUID", (e, t) => {
	t.pattern ??= Hf, Kp.init(e, t);
}), sm = /*@__PURE__*/ X("$ZodCUID2", (e, t) => {
	t.pattern ??= Uf, Kp.init(e, t);
}), cm = /*@__PURE__*/ X("$ZodULID", (e, t) => {
	t.pattern ??= Wf, Kp.init(e, t);
}), lm = /*@__PURE__*/ X("$ZodXID", (e, t) => {
	t.pattern ??= Gf, Kp.init(e, t);
}), um = /*@__PURE__*/ X("$ZodKSUID", (e, t) => {
	t.pattern ??= Kf, Kp.init(e, t);
}), dm = /*@__PURE__*/ X("$ZodISODateTime", (e, t) => {
	t.pattern ??= mp(t), Kp.init(e, t);
}), fm = /*@__PURE__*/ X("$ZodISODate", (e, t) => {
	t.pattern ??= dp, Kp.init(e, t);
}), pm = /*@__PURE__*/ X("$ZodISOTime", (e, t) => {
	t.pattern ??= pp(t), Kp.init(e, t);
}), mm = /*@__PURE__*/ X("$ZodISODuration", (e, t) => {
	t.pattern ??= Yf, Kp.init(e, t);
}), hm = /*@__PURE__*/ X("$ZodIPv4", (e, t) => {
	t.pattern ??= tp, Kp.init(e, t);
}), gm = /^[0-9a-fA-F:.]+$/;
function _m(e) {
	return gm.test(e) ? Xp(`http://[${e}]`) : !1;
}
var vm = /*@__PURE__*/ X("$ZodIPv6", (e, t) => {
	t.pattern ??= np, Kp.init(e, t), e._zod.check = (n) => {
		_m(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), ym = /*@__PURE__*/ X("$ZodCIDRv4", (e, t) => {
	t.pattern ??= rp, Kp.init(e, t);
});
function bm(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : _m(n);
}
var xm = /*@__PURE__*/ X("$ZodCIDRv6", (e, t) => {
	t.pattern ??= ip, Kp.init(e, t), e._zod.check = (n) => {
		bm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function Sm(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var Cm = /^[0-9a-zA-Z+/]*={0,2}$/, wm = /*@__PURE__*/ X("$ZodBase64", (e, t) => {
	t.pattern ??= Cm, Kp.init(e, t), e._zod.check = (n) => {
		Sm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Tm = /^[A-Za-z0-9_-]*$/;
function Em(e) {
	if (!Tm.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return Sm(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var Dm = /*@__PURE__*/ X("$ZodBase64URL", (e, t) => {
	t.pattern ??= Tm, Kp.init(e, t), e._zod.check = (n) => {
		Em(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Om = /*@__PURE__*/ X("$ZodE164", (e, t) => {
	t.pattern ??= cp, Kp.init(e, t);
});
function km(e, t = null) {
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
var Am = /*@__PURE__*/ X("$ZodJWT", (e, t) => {
	Kp.init(e, t), e._zod.check = (n) => {
		km(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), jm = /*@__PURE__*/ X("$ZodNumber", (e, t) => {
	Vp.init(e, t), e._zod.pattern = _p, e._zod.parse = (n, r) => {
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
}), Mm = /*@__PURE__*/ X("$ZodNumberFormat", (e, t) => {
	Dp.init(e, t), jm.init(e, t);
}), Nm = /*@__PURE__*/ X("$ZodBoolean", (e, t) => {
	Vp.init(e, t), e._zod.pattern = vp, e._zod.parse = (n, r) => {
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
}), Pm = /*@__PURE__*/ X("$ZodUnknown", (e, t) => {
	Vp.init(e, t), e._zod.parse = (e) => e;
}), Fm = /*@__PURE__*/ X("$ZodNever", (e, t) => {
	Vp.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Im(e, t) {
	let n = Rd(e._zod.def.checks);
	if (!n.length) return;
	let r = Math.min(...n.map((e) => e[0])), i = e._zod.parse;
	e._zod.parse = (n, a) => {
		let o = t(n.value);
		if (o > r && !a?.skipChecks && a?.direction !== "backward") {
			for (let [t, r] of Rd(e._zod.def.checks)) if (o > t && r._zod.def.when(n)) {
				let t = n.issues.length;
				return r._zod.check(n), n.issues[t].continue = !1, zd(n.issues, t, e), n;
			}
		}
		return i(n, a);
	};
}
var Lm = (e) => Array.isArray(e) ? e.length : -1;
function Rm(e, t, n) {
	e.issues.length && t.issues.push(...Id(n, e.issues)), t.value[n] = e.value;
}
var zm = /*@__PURE__*/ X("$ZodArray", (e, t) => {
	Vp.init(e, t);
	let n = ff.memoizer;
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
			if (c instanceof Promise) o.push(c.then((t) => Rm(t, r, e)));
			else if (Rm(c, r, e), s && c.issues.length !== 0 && Pd(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	}, Im(e, Lm);
});
function Bm(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...Id(n, e.issues));
		}
		!o && i === void 0 ? e.issues.length || t.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [n]
		}) : e.value === void 0 ? (o || i === "defaulted" && !s) && (t.value[n] = void 0) : t.value[n] = e.value;
	}
}
var Vm = [];
function Hm(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Vm, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = Sd(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function Um(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (Pd(n, p)) break;
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
		a instanceof Promise ? e.push(a.then((e) => Bm(e, n, i, t, d, f))) : Bm(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Wm = /*@__PURE__*/ X("$ZodObject", (e, t) => {
	Vp.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = Zu(() => Hm(t));
	tf(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || rd(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = md, o = t.catchall, s, c = ff.memoizer;
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
				if (Pd(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => Bm(n, t, e, r, a, o))) : Bm(s, t, e, r, a, o);
		}
		return o ? Um(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), Gm = /*@__PURE__*/ X("$ZodObjectJIT", (e, t) => {
	Wm.init(e, t);
	let n = e._zod.parse, r = Zu(() => Hm(t)), i = ff.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new zp(["payload", "ctx"], {
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
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : dd(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
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
	}, o, s = md, c = !ff.jitless, l = c && hd.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? Um([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function Km(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !Pd(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => Bd(e, r, pf())))
	}), t);
}
var qm = /*@__PURE__*/ X("$ZodUnion", (e, t) => {
	Vp.init(e, t), tf(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), tf(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), tf(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), tf(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => $u(e.source)).join("|")})$`);
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
		return a ? Promise.all(o).then((t) => Km(t, r, e, i)) : Km(o, r, e, i);
	};
}), Jm = /*@__PURE__*/ X("$ZodIntersection", (e, t) => {
	Vp.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Xm(e, t, n)) : Xm(e, i, a);
	};
});
function Ym(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (gd(e) && gd(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = Ym(e[n], t[n]);
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
			let i = e[r], a = t[r], o = Ym(i, a);
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
function Xm(e, t, n) {
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
	let c = Ym(t.value, n.value);
	if (!c.valid) {
		if (Pd(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var Zm = /*@__PURE__*/ X("$ZodRecord", (e, t) => {
	Vp.init(e, t);
	let n = ff.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!gd(a)) return r.issues.push({
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
						issues: s.issues.map((e) => Bd(e, i, pf())),
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
					e.issues.length && r.issues.push(...Id(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...Id(n, u.issues)), r.value[l] = u.value);
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
				if (typeof n == "string" && _p.test(n) && l.issues.length) {
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
						issues: l.issues.map((e) => Bd(e, i, pf())),
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
					e.issues.length && r.issues.push(...Id(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...Id(n, d.issues)), r.value[u] = d.value);
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
}), Qm = /*@__PURE__*/ X("$ZodEnum", (e, t) => {
	Vp.init(e, t);
	let n = qu(t.entries), r = new Set(n);
	e._zod.values = r, tf(e, "pattern", (e) => {
		let t = qu(e.def.entries).filter((e) => vd.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => yd(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), $m = /*@__PURE__*/ X("$ZodLiteral", (e, t) => {
	Vp.init(e, t);
	let n = new Set(t.values);
	e._zod.values = n, tf(e, "pattern", (e) => {
		let t = e.def.values;
		return RegExp(t.length ? `^(${t.map((e) => typeof e == "string" ? yd(e) : e ? yd(e.toString()) : String(e)).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), eh = /*@__PURE__*/ X("$ZodTransform", (e, t) => {
	Vp.init(e, t), e._zod.optin = "optional", ff.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new df(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new uf();
		return n.value = i, n;
	};
});
function th(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var nh = /*@__PURE__*/ X("$ZodOptional", (e, t) => {
	Vp.init(e, t), tf(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", tf(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), tf(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${$u(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => th(e, t)) : th(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), rh = /*@__PURE__*/ X("$ZodExactOptional", (e, t) => {
	nh.init(e, t), tf(e, "values", (e) => e.def.innerType._zod.values), tf(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), ih = /*@__PURE__*/ X("$ZodNullable", (e, t) => {
	Vp.init(e, t), tf(e, "optin", (e) => e.def.innerType._zod.optin), tf(e, "optout", (e) => e.def.innerType._zod.optout), tf(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${$u(t.source)}|null)$`) : void 0;
	}), tf(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), ah = /*@__PURE__*/ X("$ZodDefault", (e, t) => {
	Vp.init(e, t), e._zod.optin = "defaulted", tf(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => oh(e, t)) : oh(r, t);
	};
});
function oh(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var sh = /*@__PURE__*/ X("$ZodPrefault", (e, t) => {
	Vp.init(e, t), e._zod.optin = "defaulted", tf(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), ch = /*@__PURE__*/ X("$ZodNonOptional", (e, t) => {
	Vp.init(e, t), tf(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => lh(t, e)) : lh(i, e);
	};
});
function lh(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function uh(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => Bd(e, r, pf())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var dh = /*@__PURE__*/ X("$ZodCatch", (e, t) => {
	Vp.init(e, t), tf(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), tf(e, "optout", (e) => e.def.innerType._zod.optout), tf(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => uh(e, r, t, n)) : uh(e, r, t, n);
	};
}), fh = /*@__PURE__*/ X("$ZodPipe", (e, t) => {
	Vp.init(e, t), tf(e, "values", (e) => e.def.in._zod.values), tf(e, "optin", (e) => e.def.in._zod.optin), tf(e, "optout", (e) => e.def.out._zod.optout), tf(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => ph(e, t.in, n)) : ph(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => ph(e, t.out, n)) : ph(r, t.out, n);
	};
});
function ph(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var mh = /*@__PURE__*/ X("$ZodReadonly", (e, t) => {
	Vp.init(e, t), tf(e, "propValues", (e) => e.def.innerType._zod.propValues), tf(e, "values", (e) => e.def.innerType._zod.values), tf(e, "optin", (e) => e.def.innerType?._zod?.optin), tf(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(hh) : hh(r);
	};
});
function hh(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var gh = /*@__PURE__*/ X("$ZodLazy", (e, t) => {
	Vp.init(e, t), nd(e._zod, "innerType", () => {
		let e = t;
		return e._cachedInner ||= t.getter(), e._cachedInner;
	}), tf(e, "pattern", (e) => e.innerType?._zod?.pattern), tf(e, "propValues", (e) => e.innerType?._zod?.propValues), tf(e, "optin", (e) => e.innerType?._zod?.optin ?? void 0), tf(e, "optout", (e) => e.innerType?._zod?.optout ?? void 0), e._zod.parse = (t, n) => e._zod.innerType._zod.run(t, n);
}), _h = /*@__PURE__*/ X("$ZodCustom", (e, t) => {
	xp.init(e, t), Vp.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => vh(t, n, r, e));
		vh(i, n, r, e);
	};
});
function vh(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Gd(e));
	}
}
// node_modules/zod/v4/core/memoizer.js
var yh = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, bh = "~memo", xh = [];
function Sh(e) {
	return typeof e == "object" && !!e;
}
function Ch(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var wh = /*@__PURE__*/ new WeakMap(), Th = 0, Eh = 1, Dh = 2;
function Oh(e, t, n) {
	let r = wh.get(e);
	if (r !== void 0) return r ? Dh : Th;
	if (t.has(e)) return Dh;
	t.add(e);
	let i = Th, a = (e) => {
		if (i !== Dh && e?._zod) {
			let r = Oh(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = Th;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? Eh : o.value?._zod ? Oh(o.value, t, n) : Th;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = id(c);
			s(e ? o(e, !0) : Eh), a(c.catchall);
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
			s(r ? Oh(r, t, !1) : Eh);
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
	return t.delete(e), kh(e, i);
}
function kh(e, t) {
	return t !== Eh && wh.set(e, t === Dh), t;
}
function Ah(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var jh, Mh = [], Nh = {
	alloc(e, t, n) {
		let r = jh;
		if (!r) return n;
		jh = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), Mh.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && Fh(n, e.value)) throw new yh();
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
					let i = Oh(e, /* @__PURE__ */ new Set(), !1);
					if (i === Th) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === Dh || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!Sh(l)) return t(s, c);
				let u = c[bh];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[bh] = u);
				let d;
				i === c ? d = a : (d = Ah(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...Ch(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				jh = d;
				let p = Mh.length, m = t(s, c);
				jh = void 0;
				let h = Mh.length > p ? Mh.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? Ch(e.issues) : xh), e)) : (h && (h.issues = m.issues.length ? Ch(m.issues) : xh), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function Ph() {
	return Nh;
}
function Fh(e, t) {
	let n = e[bh]?.backEdges;
	return n !== void 0 && Sh(t) && n.has(t);
}
// node_modules/zod/v4/locales/en.js
var Ih = () => {
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
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(Wd(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${xd(e.values[0])}` : `Invalid option: expected one of ${Ju(e.values, "|")}`;
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
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${Ju(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function Lh() {
	return { localeError: Ih() };
}
// node_modules/zod/v4/core/registries.js
var Rh, zh = class {
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
function Bh() {
	return new zh();
}
(Rh = globalThis).__zod_globalRegistry ?? (Rh.__zod_globalRegistry = Bh());
var Vh = globalThis.__zod_globalRegistry;
// node_modules/zod/v4/core/api.js
function Hh(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function Uh(e, t) {
	return new e(Hh({
		type: "string",
		...Y(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Wh(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Gh(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Kh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function qh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Jh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Yh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xh(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zh(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qh(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $h(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function eg(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function tg(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ng(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function rg(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ig(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ag(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function og(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sg(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function cg(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function lg(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ug(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function dg(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fg(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pg(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function mg(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function hg(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function gg(e, t) {
	return new e(Hh({
		type: "number",
		checks: [],
		...Y(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function _g(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function vg(e, t) {
	return new e({
		type: "boolean",
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function yg(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function bg(e, t) {
	return new e({
		type: "never",
		...Y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xg(e, t) {
	return new wp({
		check: "less_than",
		...Y(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Sg(e, t) {
	return new wp({
		check: "less_than",
		...Y(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Cg(e, t) {
	return new Tp({
		check: "greater_than",
		...Y(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function wg(e, t) {
	return new Tp({
		check: "greater_than",
		...Y(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Tg(e, t) {
	return new Ep({
		check: "multiple_of",
		...Y(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function Eg(e, t) {
	return new Op({
		check: "max_length",
		...Y(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Dg(e, t) {
	return new kp({
		check: "min_length",
		...Y(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Og(e, t) {
	return new Ap({
		check: "length_equals",
		...Y(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function kg(e, t) {
	return new Mp({
		check: "string_format",
		format: "regex",
		...Y(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ag(e) {
	return new Np({
		check: "string_format",
		format: "lowercase",
		...Y(e)
	});
}
// @__NO_SIDE_EFFECTS__
function jg(e) {
	return new Pp({
		check: "string_format",
		format: "uppercase",
		...Y(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Mg(e, t) {
	return new Fp({
		check: "string_format",
		format: "includes",
		...Y(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ng(e, t) {
	return new Ip({
		check: "string_format",
		format: "starts_with",
		...Y(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Pg(e, t) {
	return new Lp({
		check: "string_format",
		format: "ends_with",
		...Y(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Fg(e) {
	return new Rp({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ig(e) {
	return /* @__PURE__ */ Fg((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Lg() {
	return /* @__PURE__ */ Fg((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Rg() {
	return /* @__PURE__ */ Fg((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function zg() {
	return /* @__PURE__ */ Fg((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Bg() {
	return /* @__PURE__ */ Fg((e) => fd(e));
}
// @__NO_SIDE_EFFECTS__
function Vg(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...Y(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Hg(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...Y(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Ug(e, t) {
	let n = /* @__PURE__ */ Wg((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(Gd(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(Gd(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function Wg(e, t) {
	let n = new xp({
		check: "custom",
		...Y(t)
	});
	return n._zod.check = e, n;
}
// node_modules/zod/v4/core/to-json-schema.js
function Gg(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && rd(e, t, n[t]);
	return e;
}
function Kg(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Vh,
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
function qg(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function Jg(e, t, n = {
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
		a && (o.ref ||= a, Jg(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Gg(o.schema, c), t.io === "input" && i_(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Yg(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Xg(e, t) {
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
				ref: `${i("__shared")}#/${r}/${Yg(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + Yg(a)
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
function Zg(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		Zg(e);
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
var Qg = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), $g = ["oneOf", "anyOf"];
function e_(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function t_(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!Qg.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? e_(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			rd(n, r, e.length === 1 ? e[0] : t_(e) ?? { allOf: e });
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
			let t = e_(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function n_(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of Qg) if (t in e) return;
	let n = t.filter((e) => $g.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = t_(t);
	else {
		let e = n[0], i = $g.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => t_([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, Gg(e, r));
}
function r_(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Gg(i, s), Gg(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) Zg(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) n_(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Gg(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, rd(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: o_(t, "input", e.processors),
					output: o_(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function i_(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return i_(r.element, n);
	if (r.type === "set") return i_(r.valueType, n);
	if (r.type === "lazy") return i_(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return i_(r.innerType, n);
	if (r.type === "intersection") return i_(r.left, n) || i_(r.right, n);
	if (r.type === "record" || r.type === "map") return i_(r.keyType, n) || i_(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : i_(r.in, n) || i_(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (i_(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (i_(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (i_(e, n)) return !0;
		return !!(r.rest && i_(r.rest, n));
	}
	return !1;
}
var a_ = (e, t = {}) => (n) => {
	let r = Kg({
		...n,
		processors: t
	});
	return Jg(e, r), Xg(r, e), r_(r, e);
}, o_ = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Kg({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return Jg(e, o), Xg(o, e), r_(o, e);
}, s_ = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, c_ = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, l_ = (e, t) => {
	s_(e, "minimum", t), c_(e, "maximum", t);
}, u_ = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, d_ = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, f_ = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, p_ = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, m_ = (e, t) => s_(e, "minimum", t.minimum), h_ = (e, t) => c_(e, "maximum", t.maximum), g_ = (e) => (t, n) => {
	p_(t, n.format);
	let [r, i] = e[n.format];
	s_(t, "minimum", r), c_(t, "maximum", i);
}, __ = {
	greater_than: (e, t) => s_(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => c_(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => u_(e, t.value),
	number_format: g_(Cd),
	bigint_format: g_(wd),
	min_length: m_,
	max_length: h_,
	length_equals: (e, t) => l_(e, t.length),
	min_size: m_,
	max_size: h_,
	size_equals: (e, t) => l_(e, t.size),
	string_format: (e, t) => {
		p_(e, t.format), t.pattern && d_(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => f_(e, t.mime)
};
function v_(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) __[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && s_(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && s_(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && c_(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && c_(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && u_(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && f_(t, i.mime);
	for (let e of i.patterns ?? []) d_(t, e);
	return t;
}
var y_ = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, b_ = /* @__PURE__ */ new Map([[Cm, ap], [Tm, op]]), x_ = (e) => b_.get(e) ?? e, S_ = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = v_(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = y_[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(x_);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, C_ = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = v_(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : qg(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, w_ = (e, t, n, r) => {
	n.type = "boolean";
}, T_ = (e, t, n, r) => {
	n.not = {};
}, E_ = (e, t, n, r) => {
	let i = e._zod.def, a = qu(i.entries);
	a.length === 0 ? n.not = {} : (a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a);
}, D_ = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (qg(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (qg(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, O_ = (e, t, n, r) => {
	qg(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, k_ = (e, t, n, r) => {
	qg(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, A_ = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = v_(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = Jg(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function j_(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? j_(t.out) : t.type === "catch" ? j_(t.innerType) : e._zod.optin;
}
var M_ = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && qg(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) rd(i.properties, e, Jg(o[e], t, {
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
		(t.io === "input" ? j_(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = Jg(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, N_ = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => Jg(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, P_ = (e, t, n, r) => {
	let i = e._zod.def, a = Jg(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = Jg(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function F_(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = F_(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => F_(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i && (p.type = "string", a || (p.pattern = (r.includes("number") ? _p : gp).source)), p;
}
var I_ = /* @__PURE__ */ new WeakMap();
function L_(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of I_.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = F_(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var R_ = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = v_(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = Jg(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) rd(i.patternProperties, x_(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = Jg(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = I_.get(t);
			n || (n = [], I_.set(t, n), t.deferred.push(() => L_(t))), n.push(e);
		}
		i.additionalProperties = Jg(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && j_(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, z_ = (e, t, n, r) => {
	let i = e._zod.def, a = Jg(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, B_ = (e, t, n, r) => {
	let i = e._zod.def;
	Jg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, V_ = Symbol();
function H_(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (qg(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), V_) : JSON.parse(o);
}
var U_ = (e, t, n, r) => {
	let i = e._zod.def;
	Jg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = H_(i.defaultValue, e, t, n, r);
	o !== V_ && (n.default = o);
}, W_ = (e, t, n, r) => {
	let i = e._zod.def;
	Jg(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = H_(i.defaultValue, e, t, n, r);
	o !== V_ && (n._prefault = o);
}, G_ = (e, t, n, r) => {
	let i = e._zod.def;
	Jg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		qg(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, K_ = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	Jg(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, q_ = (e, t, n, r) => {
	let i = e._zod.def;
	Jg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, J_ = (e, t, n, r) => {
	let i = e._zod.def;
	Jg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Y_ = (e, t, n, r) => {
	let i = e._zod.innerType;
	Jg(i, t, r);
	let a = t.seen.get(e);
	a.ref = i;
}, X_ = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function Z_(e, t, n) {
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
var Q_ = /*@__PURE__*/ X("ZodError", (e, t) => {
	yf.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	X_.has(n) || (X_.add(n), Z_(n, "format", (e) => (t) => Sf(e, t)), Z_(n, "flatten", (e) => (t) => xf(e, t)), Z_(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, Yu, 2);
	}), Z_(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, Yu, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), $_ = /* @__PURE__ */ wf(Q_), ev = /* @__PURE__ */ Tf(Q_), tv = /* @__PURE__ */ Ef(Q_), nv = /* @__PURE__ */ Of(Q_), rv = /* @__PURE__ */ Pf(Q_), iv = /* @__PURE__ */ Ff(Q_), av = /* @__PURE__ */ If(Q_), ov = /* @__PURE__ */ Lf(Q_), sv = /* @__PURE__ */ Rf(Q_), cv = /* @__PURE__ */ zf(Q_), lv = /* @__PURE__ */ Bf(Q_), uv = /* @__PURE__ */ Vf(Q_);
// node_modules/zod/v4/classic/schemas.js
function dv() {
	ff.localeError || pf(Lh());
}
function fv() {
	ff.memoizer || pf({ memoizer: Ph() });
}
var pv = /*@__PURE__*/ X("ZodType", (e, t) => (dv(), Vp.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(ud(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return bd(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(Py(e, t));
	},
	superRefine(e, t) {
		return this.check(Fy(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ Fg(e));
	},
	optional() {
		return my(this);
	},
	exactOptional() {
		return gy(this);
	},
	nullable() {
		return vy(this);
	},
	nullish() {
		return my(vy(this));
	},
	nonoptional(e) {
		return wy(this, e);
	},
	array() {
		return Zv(this);
	},
	or(e) {
		return ny([this, e]);
	},
	and(e) {
		return iy(this, e);
	},
	transform(e) {
		return Oy(this, fy(e));
	},
	default(e) {
		return by(this, e);
	},
	prefault(e) {
		return Sy(this, e);
	},
	catch(e) {
		return Ey(this, e);
	},
	pipe(e) {
		return Oy(this, e);
	},
	readonly() {
		return Ay(this);
	},
	describe(e) {
		let t = this.clone();
		return Vh.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return Vh.get(this);
		let t = this.clone();
		return Vh.add(t, e[0]), t;
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
		return Jd(this, "~standard", {
			...Wp(this),
			jsonSchema: {
				input: o_(this, "input"),
				output: o_(this, "output")
			}
		});
	},
	set "~standard"(e) {
		qd(this, "~standard", e);
	},
	parse: function e(t, n) {
		return $_(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await ev(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return tv(this, e, t);
	},
	async safeParseAsync(e, t) {
		return nv(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		qd(this, "spa", e);
	},
	validate(e, t) {
		return jf(this, e, t);
	},
	validateAsync(e, t) {
		return Nf(this, e, t);
	},
	encode: function e(t, n) {
		return rv(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return iv(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await av(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await ov(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return sv(this, e, t);
	},
	safeDecode(e, t) {
		return cv(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return lv(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return uv(this, e, t);
	},
	toJSONSchema(e) {
		return a_(this, {})(e);
	},
	get description() {
		return Vh.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), mv = /*@__PURE__*/ X("_ZodString", (e, t) => {
	Gp.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => S_(e, t, n, r);
}, /*@__PURE__*/ Yd({
	format: (e) => v_(e).format ?? null,
	minLength: (e) => v_(e).minimum ?? null,
	maxLength: (e) => v_(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ kg(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ Mg(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ Ng(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ Pg(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ Dg(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ Eg(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ Og(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ Dg(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ Ag(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ jg(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ Lg());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ Ig(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ Rg());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ zg());
	},
	slugify() {
		return this.check(/* @__PURE__ */ Bg());
	}
})), hv = /*@__PURE__*/ X("ZodString", (e, t) => {
	Gp.init(e, t), mv.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ Wh(xv, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ Xh(wv, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ dg(zv, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ Zh(Tv, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ Gh(Sv, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Kh(Cv, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ qh(Cv, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ Jh(Cv, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Yh(Cv, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ Qh(Ev, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ $h(Dv, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ eg(Ov, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ tg(kv, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ cg(Iv, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ lg(Lv, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ ng(Av, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ rg(jv, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ ig(Mv, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ ag(Nv, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ og(Pv, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ sg(Fv, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ ug(Rv, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ fg(_v, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ pg(vv, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ mg(yv, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ hg(bv, e));
	}
});
function Z(e) {
	return /* @__PURE__ */ Uh(hv, e);
}
var gv = /*@__PURE__*/ X("ZodStringFormat", (e, t) => {
	Kp.init(e, t), mv.init(e, t);
}), _v = /*@__PURE__*/ X("ZodISODateTime", (e, t) => {
	dm.init(e, t), gv.init(e, t);
}), vv = /*@__PURE__*/ X("ZodISODate", (e, t) => {
	fm.init(e, t), gv.init(e, t);
}), yv = /*@__PURE__*/ X("ZodISOTime", (e, t) => {
	pm.init(e, t), gv.init(e, t);
}), bv = /*@__PURE__*/ X("ZodISODuration", (e, t) => {
	mm.init(e, t), gv.init(e, t);
}), xv = /*@__PURE__*/ X("ZodEmail", (e, t) => {
	Yp.init(e, t), gv.init(e, t);
}), Sv = /*@__PURE__*/ X("ZodGUID", (e, t) => {
	qp.init(e, t), gv.init(e, t);
}), Cv = /*@__PURE__*/ X("ZodUUID", (e, t) => {
	Jp.init(e, t), gv.init(e, t);
}), wv = /*@__PURE__*/ X("ZodURL", (e, t) => {
	rm.init(e, t), gv.init(e, t);
}), Tv = /*@__PURE__*/ X("ZodEmoji", (e, t) => {
	im.init(e, t), gv.init(e, t);
}), Ev = /*@__PURE__*/ X("ZodNanoID", (e, t) => {
	am.init(e, t), gv.init(e, t);
}), Dv = /*@__PURE__*/ X("ZodCUID", (e, t) => {
	om.init(e, t), gv.init(e, t);
}), Ov = /*@__PURE__*/ X("ZodCUID2", (e, t) => {
	sm.init(e, t), gv.init(e, t);
}), kv = /*@__PURE__*/ X("ZodULID", (e, t) => {
	cm.init(e, t), gv.init(e, t);
}), Av = /*@__PURE__*/ X("ZodXID", (e, t) => {
	lm.init(e, t), gv.init(e, t);
}), jv = /*@__PURE__*/ X("ZodKSUID", (e, t) => {
	um.init(e, t), gv.init(e, t);
}), Mv = /*@__PURE__*/ X("ZodIPv4", (e, t) => {
	hm.init(e, t), gv.init(e, t);
}), Nv = /*@__PURE__*/ X("ZodIPv6", (e, t) => {
	vm.init(e, t), gv.init(e, t);
}), Pv = /*@__PURE__*/ X("ZodCIDRv4", (e, t) => {
	ym.init(e, t), gv.init(e, t);
}), Fv = /*@__PURE__*/ X("ZodCIDRv6", (e, t) => {
	xm.init(e, t), gv.init(e, t);
}), Iv = /*@__PURE__*/ X("ZodBase64", (e, t) => {
	wm.init(e, t), gv.init(e, t);
}), Lv = /*@__PURE__*/ X("ZodBase64URL", (e, t) => {
	Dm.init(e, t), gv.init(e, t);
}), Rv = /*@__PURE__*/ X("ZodE164", (e, t) => {
	Om.init(e, t), gv.init(e, t);
}), zv = /*@__PURE__*/ X("ZodJWT", (e, t) => {
	Am.init(e, t), gv.init(e, t);
}), Bv = /*@__PURE__*/ X("ZodNumber", (e, t) => {
	jm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => C_(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ Yd({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = v_(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = v_(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = v_(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => v_(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ Cg(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ wg(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ wg(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ xg(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ Sg(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Sg(e, t));
	},
	int(e) {
		return this.check(Uv(e));
	},
	safe(e) {
		return this.check(Uv(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ Cg(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ wg(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ xg(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ Sg(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ Tg(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ Tg(e, t));
	},
	finite() {
		return this;
	}
}));
function Vv(e) {
	return /* @__PURE__ */ gg(Bv, e);
}
var Hv = /*@__PURE__*/ X("ZodNumberFormat", (e, t) => {
	Mm.init(e, t), Bv.init(e, t);
});
function Uv(e) {
	return /* @__PURE__ */ _g(Hv, e);
}
var Wv = /*@__PURE__*/ X("ZodBoolean", (e, t) => {
	Nm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => w_(e, t, n, r);
});
function Gv(e) {
	return /* @__PURE__ */ vg(Wv, e);
}
var Kv = /*@__PURE__*/ X("ZodUnknown", (e, t) => {
	Pm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function qv() {
	return /* @__PURE__ */ yg(Kv);
}
var Jv = /*@__PURE__*/ X("ZodNever", (e, t) => {
	Fm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => T_(e, t, n, r);
});
function Yv(e) {
	return /* @__PURE__ */ bg(Jv, e);
}
var Xv = /*@__PURE__*/ X("ZodArray", (e, t) => {
	fv(), zm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => A_(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ Dg(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ Dg(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Eg(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ Og(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function Zv(e, t) {
	return /* @__PURE__ */ Vg(Xv, e, t);
}
var Qv = /*@__PURE__*/ X("ZodObject", (e, t) => {
	fv(), Gm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => M_(e, t, n, r), nf(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return cy(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(ud(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(ud(this._zod.def, { catchall: qv() }));
	},
	loose() {
		return this.clone(ud(this._zod.def, { catchall: qv() }));
	},
	strict() {
		return this.clone(ud(this._zod.def, { catchall: Yv() }));
	},
	strip() {
		return this.clone(ud(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Od(this, e);
	},
	safeExtend(e) {
		return Ad(this, e);
	},
	merge(e) {
		return jd(this, e);
	},
	pick(e) {
		return Td(this, e);
	},
	omit(e) {
		return Dd(this, e);
	},
	partial(...e) {
		return Md(py, this, e[0]);
	},
	exactPartial(...e) {
		return Md(hy, this, e[0], "exactPartial");
	},
	required(...e) {
		return Nd(Cy, this, e[0]);
	}
});
function $v(e, t) {
	return new Qv({
		type: "object",
		shape: e ?? {},
		...Y(t)
	});
}
function ey(e, t) {
	return new Qv({
		type: "object",
		shape: e,
		catchall: qv(),
		...Y(t)
	});
}
var ty = /*@__PURE__*/ X("ZodUnion", (e, t) => {
	qm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => N_(e, t, n, r), e.options = t.options;
});
function ny(e, t) {
	return new ty({
		type: "union",
		options: e,
		...Y(t)
	});
}
var ry = /*@__PURE__*/ X("ZodIntersection", (e, t) => {
	Jm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => P_(e, t, n, r);
});
function iy(e, t) {
	return new ry({
		type: "intersection",
		left: e,
		right: t
	});
}
var ay = /*@__PURE__*/ X("ZodRecord", (e, t) => {
	fv(), Zm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => R_(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function oy(e, t, n) {
	return !t || !t._zod ? new ay({
		type: "record",
		keyType: Z(),
		valueType: e,
		...Y(t)
	}) : new ay({
		type: "record",
		keyType: e,
		valueType: t,
		...Y(n)
	});
}
var sy = /*@__PURE__*/ X("ZodEnum", (e, t) => {
	Qm.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => E_(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new sy({
			...t,
			checks: [],
			...Y(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new sy({
			...t,
			checks: [],
			...Y(r),
			entries: i
		});
	};
});
function cy(e, t) {
	return new sy({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...Y(t)
	});
}
var ly = /*@__PURE__*/ X("ZodLiteral", (e, t) => {
	$m.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => D_(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function uy(e, t) {
	return new ly({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...Y(t)
	});
}
var dy = /*@__PURE__*/ X("ZodTransform", (e, t) => {
	fv(), eh.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => k_(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new df(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Gd(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(Gd(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function fy(e) {
	return new dy({
		type: "transform",
		transform: e
	});
}
var py = /*@__PURE__*/ X("ZodOptional", (e, t) => {
	nh.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => J_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function my(e) {
	return new py({
		type: "optional",
		innerType: e
	});
}
var hy = /*@__PURE__*/ X("ZodExactOptional", (e, t) => {
	rh.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => J_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function gy(e) {
	return new hy({
		type: "optional",
		innerType: e
	});
}
var _y = /*@__PURE__*/ X("ZodNullable", (e, t) => {
	ih.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => z_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function vy(e) {
	return new _y({
		type: "nullable",
		innerType: e
	});
}
var yy = /*@__PURE__*/ X("ZodDefault", (e, t) => {
	ah.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => U_(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function by(e, t) {
	return new yy({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : _d(t);
		}
	});
}
var xy = /*@__PURE__*/ X("ZodPrefault", (e, t) => {
	sh.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => W_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Sy(e, t) {
	return new xy({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : _d(t);
		}
	});
}
var Cy = /*@__PURE__*/ X("ZodNonOptional", (e, t) => {
	ch.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => B_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function wy(e, t) {
	return new Cy({
		type: "nonoptional",
		innerType: e,
		...Y(t)
	});
}
var Ty = /*@__PURE__*/ X("ZodCatch", (e, t) => {
	dh.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => G_(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Ey(e, t) {
	return new Ty({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : af(t)
	});
}
var Dy = /*@__PURE__*/ X("ZodPipe", (e, t) => {
	fh.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => K_(e, t, n, r), e.in = t.in, e.out = t.out;
});
function Oy(e, t) {
	return new Dy({
		type: "pipe",
		in: e,
		out: t
	});
}
var ky = /*@__PURE__*/ X("ZodReadonly", (e, t) => {
	mh.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => q_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ay(e) {
	return new ky({
		type: "readonly",
		innerType: e
	});
}
var jy = /*@__PURE__*/ X("ZodLazy", (e, t) => {
	gh.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => Y_(e, t, n, r), e.unwrap = () => e._zod.def.getter();
});
function My(e) {
	return new jy({
		type: "lazy",
		getter: e
	});
}
var Ny = /*@__PURE__*/ X("ZodCustom", (e, t) => {
	_h.init(e, t), pv.init(e, t), e._zod.processJSONSchema = (t, n, r) => O_(e, t, n, r);
});
function Py(e, t = {}) {
	return /* @__PURE__ */ Hg(Ny, e, t);
}
function Fy(e, t) {
	return /* @__PURE__ */ Ug(e, t);
}
// src/schemas/common.ts
var Iy = {
	workspace: 1,
	save: 1,
	pack: 2
}, Ly = Z().regex(/^[a-z0-9][a-z0-9-]*$/, "必须是小写字母、数字与短横线").max(64), Ry = Z().regex(/^[a-z0-9][a-z0-9.-]*$/, "必须是小写字母、数字、点与短横线").max(200), zy = Z().regex(/^\d+\.\d+\.\d+$/, "必须是 x.y.z 形式的版本号"), By = Vv().int().nonnegative(), Vy = My(() => ny([
	$v({ p: Z() }),
	$v({
		h: Z(),
		body: Zv(Vy)
	}),
	$v({ list: Zv(Z()) }),
	$v({ table: $v({
		caption: Z().optional(),
		cols: Zv(Z()),
		rows: Zv(Zv(Z()))
	}) }),
	$v({
		quote: Z(),
		by: Z().optional()
	}),
	$v({ read: Zv(Vy) })
])), Hy = /\{\{(roll|hit|dc|ref|atk|em):([^{}|]*(?:\\\|[^{}|]*)*)(?:\|([^{}]*))?\}\}/g;
Z().refine((e) => {
	let t = e.replace(Hy, "");
	return !t.includes("{{") && !t.includes("}}");
}, "行内标记必须写成 {{种类:参数|显示文字}}");
var Uy = $v({ $asset: Z().min(1) }), Wy = cy([
	"rules",
	"adventure",
	"setting",
	"toolkit"
]);
cy(["data", "module"]);
var Gy = cy([
	"builtin",
	"download",
	"import",
	"user"
]), Ky = $v({
	id: Ly,
	lineage: Z().min(1).max(80).optional(),
	minVersion: zy.optional()
}), qy = $v({
	requires: Zv(Ky).default([]),
	recommends: Zv(Ky).default([]),
	conflicts: Zv($v({
		id: Ly,
		reason: Z().max(300).default("")
	})).default([])
}), Jy = $v({
	hash: Z().regex(/^[a-f0-9]{64}$/),
	mime: Z().min(1).max(40),
	size: Vv().int().nonnegative()
}), Yy = $v({
	id: Z().min(1).max(80),
	name: Z().min(1).max(120),
	order: Vv().int().min(1)
}), Xy = ey({
	id: Ly,
	ruleId: Ly,
	category: Wy,
	name: Z().min(1).max(80),
	nameEn: Z().max(120).optional(),
	version: zy,
	minAppVersion: zy.optional(),
	license: Z().max(200).default(""),
	attribution: Z().max(4e3).default(""),
	description: Z().max(400).default(""),
	author: Z().max(120).optional(),
	lineage: Z().min(1).max(80).optional(),
	entryCount: Vv().int().nonnegative(),
	typeCounts: oy(Z(), Vv().int().nonnegative()).default({}),
	contributes: oy(Z(), Vv().int().nonnegative()).default({}),
	relationships: qy.default({
		requires: [],
		recommends: [],
		conflicts: []
	}),
	series: Yy.optional(),
	blobs: Zv(Jy).default([]),
	dataVersion: Vv().int().positive().default(1)
}), Zy = $v({
	features: Zv(qv()).default([]),
	adventure: oy(Z(), qv()).default({}),
	fallback: Zv(qv()).default([])
});
Xy.extend({
	source: Gy,
	byteSize: Vv().int().nonnegative(),
	sha256: Z(),
	installedAt: By,
	schemaVersion: Vv().int(),
	blobHashes: Zv(Z()).default([]),
	content: Zy.default({
		features: [],
		adventure: {},
		fallback: []
	})
});
var Qy = ey({
	id: Z().min(1).max(160),
	type: Z().min(1).max(40),
	name: Z().min(1).max(200),
	nameEn: Z().max(240).optional(),
	keywords: Zv(Z()).default([]),
	unique: Gv().default(!1),
	summary: Z().default(""),
	data: oy(Z(), qv()).default({}),
	image: ny([Z(), Uy]).optional()
}), $y = $v({
	format: uy("trpg-pack"),
	formatVersion: Vv().int().positive(),
	pack: oy(Z(), qv())
}), eb = $v({
	format: cy(["trpg-save", "trpg-backup"]),
	formatVersion: Vv().int().positive(),
	appVersion: Z(),
	exportedAt: Z(),
	ruleIds: Zv(Z())
}), tb = $v({
	id: Ly,
	version: zy,
	name: Z()
}), nb = $v({
	formatVersion: Vv().int(),
	rules: Zv($v({
		id: Ly,
		name: Z(),
		nameShort: Z(),
		status: cy(["installable", "coming"]),
		description: Z().default("")
	})).default([]),
	packs: Zv($v({
		id: Ly,
		ruleId: Ly,
		category: Wy,
		name: Z(),
		nameEn: Z().optional(),
		version: zy,
		license: Z().default(""),
		description: Z().default(""),
		typeCounts: oy(Z(), Vv().int().nonnegative()).default({}),
		contributes: oy(Z(), Vv().int().nonnegative()).default({}),
		relationships: qy.default({
			requires: [],
			recommends: [],
			conflicts: []
		}),
		lineage: Z().optional(),
		series: Yy.optional(),
		byteSize: Vv().int().nonnegative(),
		sha256: Z(),
		url: Z(),
		updatedAt: Z().optional(),
		recommended: Gv().default(!1),
		group: Z().optional()
	})).default([])
}), rb = ey({ instances: Zv($v({
	id: Z().min(1),
	type: Z().min(1),
	name: Z().min(1),
	label: Z().optional(),
	sourceRef: $v({
		packId: Ly,
		version: zy,
		entryId: Z()
	}).optional(),
	data: oy(Z(), qv()).default({})
})).default([]) }), ib = $v({
	id: Ly,
	version: zy
}), ab = $v({
	ownerKey: Z().min(1),
	ownerLabel: Z(),
	ruleId: Ly,
	currentSaveId: Z().nullable(),
	enabledPacks: Zv(ib),
	data: rb,
	savedHash: Z(),
	schemaVersion: Vv().int(),
	updatedAt: By
}), ob = $v({
	partyNames: Zv(Z()).default([]),
	partyCount: Vv().int().nonnegative().default(0),
	location: Z().optional(),
	round: Vv().int().optional()
}), sb = cy([
	"读档前",
	"新存档前",
	"切换规则前",
	"恢复备份前",
	"改动模组前"
]), cb = $v({
	id: Z().min(1),
	ownerKey: Z().min(1),
	ownerLabel: Z(),
	ruleId: Ly,
	name: Z().min(1).max(80),
	note: Z().max(400).default(""),
	kind: cy(["manual", "auto"]),
	autoReason: sb.optional(),
	branchedFrom: Z().optional(),
	createdAt: By,
	updatedAt: By,
	deletedAt: By.optional(),
	summary: ob,
	packs: Zv(tb),
	snapshot: rb,
	hash: Z(),
	schemaVersion: Vv().int()
}), lb = $v({
	reminderDays: Vv().int().positive().default(7),
	reminderSaves: Vv().int().positive().default(10),
	catalogUrl: Z().default("https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json")
}), ub = $v({
	lastExportAt: By.nullable().default(null),
	savesSinceExport: Vv().int().nonnegative().default(0),
	persistRequested: Gv().default(!1),
	persistGranted: Gv().default(!1)
}), db = 864e5;
function fb(e, t, n) {
	if (e.lastExportAt === null) return {
		kind: "never",
		daysSince: null,
		savesSince: e.savesSinceExport,
		text: "还没有导出过备份"
	};
	let r = Math.max(0, Math.floor((n - e.lastExportAt) / db)), i = r >= t.reminderDays || e.savesSinceExport >= t.reminderSaves, a = r === 0 ? "今天" : `${r} 天前`, o = i ? `建议导出备份 · 上次完整备份：${a}，之后保存 ${e.savesSinceExport} 次` : `上次完整备份：${a} · 之后保存 ${e.savesSinceExport} 次`;
	return {
		kind: i ? "due" : "ok",
		daysSince: r,
		savesSince: e.savesSinceExport,
		text: o
	};
}
async function pb(e) {
	return ub.parse(await e.getMeta("backup") ?? {});
}
async function mb(e) {
	return lb.parse(await e.getMeta("settings") ?? {});
}
async function hb(e, t) {
	let n = await pb(e);
	await e.setMeta("backup", {
		...n,
		lastExportAt: t,
		savesSinceExport: 0
	});
}
async function gb(e, t = globalThis.navigator?.storage) {
	let n = await pb(e);
	if (n.persistRequested) return n;
	let r = t?.persist ? await t.persist() : !1, i = {
		...n,
		persistRequested: !0,
		persistGranted: r
	};
	return await e.setMeta("backup", i), i;
}
// src/core/ids.ts
function _b() {
	let e = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(e), e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
	let t = Array.from(e, (e) => e.toString(16).padStart(2, "0"));
	return `${t.slice(0, 4).join("")}-${t.slice(4, 6).join("")}-${t.slice(6, 8).join("")}-${t.slice(8, 10).join("")}-${t.slice(10).join("")}`;
}
function vb(e) {
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
function yb(e) {
	let t = e, n = "";
	do
		n = String.fromCharCode(65 + t % 26) + n, t = Math.floor(t / 26) - 1;
	while (t >= 0);
	return n;
}
// src/core/packs/builtinFile.ts
var bb = { "dnd5e2014-srd": new URL("../packs/dnd5e2014-srd.trpgpack", "" + import.meta.url) };
async function xb(e) {
	let t = bb[e];
	if (!t) throw Error(`没有找到内置内容包：${e}`);
	let n = await fetch(t);
	if (!n.ok) throw Error(`内置内容包读取失败（${n.status}）`);
	return new Uint8Array(await n.arrayBuffer());
}
// src/core/errors.ts
var Q = class extends Error {
	code;
	details;
	constructor(e, t, n) {
		super(t), this.name = "TrpgError", this.code = e, this.details = n;
	}
};
function Sb(e) {
	return e?.name === "QuotaExceededError";
}
var Cb = "存储空间不足：可以删除不用的内容包，或清空最近删除";
// src/core/semver.ts
function wb(e) {
	let t = /^(\d+)\.(\d+)\.(\d+)$/.exec(e);
	if (!t) throw Error(`版本号格式不正确：${e}`);
	return [
		Number(t[1]),
		Number(t[2]),
		Number(t[3])
	];
}
function Tb(e, t) {
	let n = wb(e), r = wb(t);
	for (let e = 0; e < 3; e++) if (n[e] !== r[e]) return n[e] < r[e] ? -1 : 1;
	return 0;
}
// node_modules/fflate/esm/browser.js
var Eb = Uint8Array, Db = Uint16Array, Ob = Int32Array, kb = new Eb([
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
]), Ab = new Eb([
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
]), jb = new Eb([
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
]), Mb = function(e, t) {
	for (var n = new Db(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new Ob(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, Nb = Mb(kb, 2), Pb = Nb.b, Fb = Nb.r;
Pb[28] = 258, Fb[258] = 28;
for (var Ib = Mb(Ab, 0), Lb = Ib.b, Rb = Ib.r, zb = new Db(32768), Bb = 0; Bb < 32768; ++Bb) {
	var Vb = (Bb & 43690) >> 1 | (Bb & 21845) << 1;
	Vb = (Vb & 52428) >> 2 | (Vb & 13107) << 2, Vb = (Vb & 61680) >> 4 | (Vb & 3855) << 4, zb[Bb] = ((Vb & 65280) >> 8 | (Vb & 255) << 8) >> 1;
}
for (var Hb = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new Db(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new Db(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new Db(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[zb[d] >> c] = l;
	} else for (s = new Db(r), i = 0; i < r; ++i) e[i] && (s[i] = zb[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), Ub = new Eb(288), Bb = 0; Bb < 144; ++Bb) Ub[Bb] = 8;
for (var Bb = 144; Bb < 256; ++Bb) Ub[Bb] = 9;
for (var Bb = 256; Bb < 280; ++Bb) Ub[Bb] = 7;
for (var Bb = 280; Bb < 288; ++Bb) Ub[Bb] = 8;
for (var Wb = new Eb(32), Bb = 0; Bb < 32; ++Bb) Wb[Bb] = 5;
var Gb = /*#__PURE__*/ Hb(Ub, 9, 0), Kb = /*#__PURE__*/ Hb(Ub, 9, 1), qb = /*#__PURE__*/ Hb(Wb, 5, 0), Jb = /*#__PURE__*/ Hb(Wb, 5, 1), Yb = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, Xb = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, Zb = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, Qb = function(e) {
	return (e + 7) / 8 | 0;
}, $b = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new Eb(e.subarray(t, n));
}, ex = [
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
], tx = function(e, t, n) {
	var r = Error(t || ex[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, tx), !n) throw r;
	return r;
}, nx = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new Eb(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new Eb(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new Eb(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = Xb(e, d, 1);
			var v = Xb(e, d + 1, 3);
			if (d += 3, !v) {
				var y = Qb(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && tx(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = Kb, m = Jb, h = 9, g = 5;
			else if (v == 2) {
				var S = Xb(e, d, 31) + 257, C = Xb(e, d + 10, 15) + 4, w = S + Xb(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new Eb(w), ee = new Eb(19), E = 0; E < C; ++E) ee[jb[E]] = Xb(e, d + E * 3, 7);
				d += C * 3;
				for (var D = Yb(ee), O = (1 << D) - 1, te = Hb(ee, D, 1), E = 0; E < w;) {
					var ne = te[Xb(e, d, O)];
					d += ne & 15;
					var y = ne >> 4;
					if (y < 16) T[E++] = y;
					else {
						var re = 0, ie = 0;
						for (y == 16 ? (ie = 3 + Xb(e, d, 3), d += 2, re = T[E - 1]) : y == 17 ? (ie = 3 + Xb(e, d, 7), d += 3) : y == 18 && (ie = 11 + Xb(e, d, 127), d += 7); ie--;) T[E++] = re;
					}
				}
				var k = T.subarray(0, S), ae = T.subarray(S);
				h = Yb(k), g = Yb(ae), p = Hb(k, h, 1), m = Hb(ae, g, 1);
			} else tx(1);
			if (d > _) {
				c && tx(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var oe = (1 << h) - 1, A = (1 << g) - 1, se = d;; se = d) {
			var re = p[Zb(e, d) & oe], ce = re >> 4;
			if (d += re & 15, d > _) {
				c && tx(0);
				break;
			}
			if (re || tx(2), ce < 256) n[f++] = ce;
			else if (ce == 256) {
				se = d, p = null;
				break;
			} else {
				var le = ce - 254;
				if (ce > 264) {
					var E = ce - 257, ue = kb[E];
					le = Xb(e, d, (1 << ue) - 1) + Pb[E], d += ue;
				}
				var de = m[Zb(e, d) & A], fe = de >> 4;
				de || tx(3), d += de & 15;
				var ae = Lb[fe];
				if (fe > 3) {
					var ue = Ab[fe];
					ae += Zb(e, d) & (1 << ue) - 1, d += ue;
				}
				if (d > _) {
					c && tx(0);
					break;
				}
				s && l(f + 131072);
				var pe = f + le;
				if (f < ae) {
					var me = a - ae, he = Math.min(ae, pe);
					for (me + f < 0 && tx(3); f < he; ++f) n[f] = r[me + f];
				}
				for (; f < pe; ++f) n[f] = n[f - ae];
			}
		}
		t.l = p, t.p = se, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? $b(n, 0, f) : n.subarray(0, f);
}, rx = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8;
}, ix = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, ax = function(e, t) {
	for (var n = [], r = 0; r < e.length; ++r) e[r] && n.push({
		s: r,
		f: e[r]
	});
	var i = n.length, a = n.slice();
	if (!i) return {
		t: fx,
		l: 0
	};
	if (i == 1) {
		var o = new Eb(n[0].s + 1);
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
	var p = new Db(f + 1), m = ox(n[u - 1], p, 0);
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
		t: new Eb(p),
		l: m
	};
}, ox = function(e, t, n) {
	return e.s == -1 ? Math.max(ox(e.l, t, n + 1), ox(e.r, t, n + 1)) : t[e.s] = n;
}, sx = function(e) {
	for (var t = e.length; t && !e[--t];);
	for (var n = new Db(++t), r = 0, i = e[0], a = 1, o = function(e) {
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
}, cx = function(e, t) {
	for (var n = 0, r = 0; r < t.length; ++r) n += e[r] * t[r];
	return n;
}, lx = function(e, t, n) {
	var r = n.length, i = Qb(t + 2);
	e[i] = r & 255, e[i + 1] = r >> 8, e[i + 2] = e[i] ^ 255, e[i + 3] = e[i + 1] ^ 255;
	for (var a = 0; a < r; ++a) e[i + a + 4] = n[a];
	return (i + 4 + r) * 8;
}, ux = function(e, t, n, r, i, a, o, s, c, l, u) {
	rx(t, u++, n), ++i[256];
	for (var d = ax(i, 15), f = d.t, p = d.l, m = ax(a, 15), h = m.t, g = m.l, _ = sx(f), v = _.c, y = _.n, b = sx(h), x = b.c, S = b.n, C = new Db(19), w = 0; w < v.length; ++w) ++C[v[w] & 31];
	for (var w = 0; w < x.length; ++w) ++C[x[w] & 31];
	for (var T = ax(C, 7), ee = T.t, E = T.l, D = 19; D > 4 && !ee[jb[D - 1]]; --D);
	var O = l + 5 << 3, te = cx(i, Ub) + cx(a, Wb) + o, ne = cx(i, f) + cx(a, h) + o + 14 + 3 * D + cx(C, ee) + 2 * C[16] + 3 * C[17] + 7 * C[18];
	if (c >= 0 && O <= te && O <= ne) return lx(t, u, e.subarray(c, c + l));
	var re, ie, k, ae;
	if (rx(t, u, 1 + (ne < te)), u += 2, ne < te) {
		re = Hb(f, p, 0), ie = f, k = Hb(h, g, 0), ae = h;
		var oe = Hb(ee, E, 0);
		rx(t, u, y - 257), rx(t, u + 5, S - 1), rx(t, u + 10, D - 4), u += 14;
		for (var w = 0; w < D; ++w) rx(t, u + 3 * w, ee[jb[w]]);
		u += 3 * D;
		for (var A = [v, x], se = 0; se < 2; ++se) for (var ce = A[se], w = 0; w < ce.length; ++w) {
			var le = ce[w] & 31;
			rx(t, u, oe[le]), u += ee[le], le > 15 && (rx(t, u, ce[w] >> 5 & 127), u += ce[w] >> 12);
		}
	} else re = Gb, ie = Ub, k = qb, ae = Wb;
	for (var w = 0; w < s; ++w) {
		var ue = r[w];
		if (ue > 255) {
			var le = ue >> 18 & 31;
			ix(t, u, re[le + 257]), u += ie[le + 257], le > 7 && (rx(t, u, ue >> 23 & 31), u += kb[le]);
			var de = ue & 31;
			ix(t, u, k[de]), u += ae[de], de > 3 && (ix(t, u, ue >> 5 & 8191), u += Ab[de]);
		} else ix(t, u, re[ue]), u += ie[ue];
	}
	return ix(t, u, re[256]), u + ie[256];
}, dx = /*#__PURE__*/ new Ob([
	65540,
	131080,
	131088,
	131104,
	262176,
	1048704,
	1048832,
	2114560,
	2117632
]), fx = /*#__PURE__*/ new Eb(0), px = function(e, t, n, r, i, a) {
	var o = a.z || e.length, s = new Eb(r + o + 5 * (1 + Math.ceil(o / 7e3)) + i), c = s.subarray(r, s.length - i), l = a.l, u = (a.r || 0) & 7;
	if (t) {
		u && (c[0] = a.r >> 3);
		for (var d = dx[t - 1], f = d >> 13, p = d & 8191, m = (1 << n) - 1, h = a.p || new Db(32768), g = a.h || new Db(m + 1), _ = Math.ceil(n / 3), v = 2 * _, y = function(t) {
			return (e[t] ^ e[t + 1] << _ ^ e[t + 2] << v) & m;
		}, b = new Ob(25e3), x = new Db(288), S = new Db(32), C = 0, w = 0, T = a.i || 0, ee = 0, E = a.w || 0, D = 0; T + 2 < o; ++T) {
			var O = y(T), te = T & 32767, ne = g[O];
			if (h[te] = ne, g[O] = te, E <= T) {
				var re = o - T;
				if ((C > 7e3 || ee > 24576) && (re > 423 || !l)) {
					u = ux(e, c, 0, b, x, S, w, ee, D, T - D, u), ee = C = w = 0, D = T;
					for (var ie = 0; ie < 286; ++ie) x[ie] = 0;
					for (var ie = 0; ie < 30; ++ie) S[ie] = 0;
				}
				var k = 2, ae = 0, oe = p, A = te - ne & 32767;
				if (re > 2 && O == y(T - A)) for (var se = Math.min(f, re) - 1, ce = Math.min(32767, T), le = Math.min(258, re); A <= ce && --oe && te != ne;) {
					if (e[T + k] == e[T + k - A]) {
						for (var ue = 0; ue < le && e[T + ue] == e[T + ue - A]; ++ue);
						if (ue > k) {
							if (k = ue, ae = A, ue > se) break;
							for (var de = Math.min(A, ue - 2), fe = 0, ie = 0; ie < de; ++ie) {
								var pe = T - A + ie & 32767, me = pe - h[pe] & 32767;
								me > fe && (fe = me, ne = pe);
							}
						}
					}
					te = ne, ne = h[te], A += te - ne & 32767;
				}
				if (ae) {
					b[ee++] = 268435456 | Fb[k] << 18 | Rb[ae];
					var he = Fb[k] & 31, ge = Rb[ae] & 31;
					w += kb[he] + Ab[ge], ++x[257 + he], ++S[ge], E = T + k, ++C;
				} else b[ee++] = e[T], ++x[e[T]];
			}
		}
		for (T = Math.max(T, E); T < o; ++T) b[ee++] = e[T], ++x[e[T]];
		u = ux(e, c, l, b, x, S, w, ee, D, T - D, u), l || (a.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, a.h = g, a.p = h, a.i = T, a.w = E);
	} else {
		for (var T = a.w || 0; T < o + l; T += 65535) {
			var _e = T + 65535;
			_e >= o && (c[u / 8 | 0] = l, _e = o), u = lx(c, u + 1, e.subarray(T, _e));
		}
		a.i = o;
	}
	return $b(s, 0, r + Qb(u) + i);
}, mx = /*#__PURE__*/ (function() {
	for (var e = /* @__PURE__ */ new Int32Array(256), t = 0; t < 256; ++t) {
		for (var n = t, r = 9; --r;) n = (n & 1 && -306674912) ^ n >>> 1;
		e[t] = n;
	}
	return e;
})(), hx = function() {
	var e = -1;
	return {
		p: function(t) {
			for (var n = e, r = 0; r < t.length; ++r) n = mx[n & 255 ^ t[r]] ^ n >>> 8;
			e = n;
		},
		d: function() {
			return ~e;
		}
	};
}, gx = function(e, t, n, r, i) {
	if (!i && (i = { l: 1 }, t.dictionary)) {
		var a = t.dictionary.subarray(-32768), o = new Eb(a.length + e.length);
		o.set(a), o.set(e, a.length), e = o, i.w = a.length;
	}
	return px(e, t.level == null ? 6 : t.level, t.mem == null ? i.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, i);
}, _x = function(e, t) {
	var n = {};
	for (var r in e) n[r] = e[r];
	for (var r in t) n[r] = t[r];
	return n;
}, vx = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, yx = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, bx = function(e, t) {
	return yx(e, t) + yx(e, t + 4) * 4294967296;
}, xx = function(e, t, n) {
	for (; n; ++t) e[t] = n, n >>>= 8;
};
function Sx(e, t) {
	return gx(e, t || {}, 0, 0);
}
function Cx(e, t) {
	return nx(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var wx = function(e, t, n, r) {
	for (var i in e) {
		var a = e[i], o = t + i, s = r;
		Array.isArray(a) && (s = _x(r, a[1]), a = a[0]), ArrayBuffer.isView(a) ? n[o] = [a, s] : (n[o += "/"] = [new Eb(0), s], wx(a, o, n, r));
	}
}, Tx = typeof TextEncoder < "u" && /*#__PURE__*/ new TextEncoder(), Ex = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	Ex.decode(fx, { stream: !0 });
} catch {}
var Dx = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: $b(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function Ox(e, t) {
	if (t) {
		for (var n = new Eb(e.length), r = 0; r < e.length; ++r) n[r] = e.charCodeAt(r);
		return n;
	}
	if (Tx) return Tx.encode(e);
	for (var i = e.length, a = new Eb(e.length + (e.length >> 1)), o = 0, s = function(e) {
		a[o++] = e;
	}, r = 0; r < i; ++r) {
		if (o + 5 > a.length) {
			var c = new Eb(o + 8 + (i - r << 1));
			c.set(a), a = c;
		}
		var l = e.charCodeAt(r);
		l < 128 || t ? s(l) : l < 2048 ? (s(192 | l >> 6), s(128 | l & 63)) : l > 55295 && l < 57344 ? (l = 65536 + (l & 1047552) | e.charCodeAt(++r) & 1023, s(240 | l >> 18), s(128 | l >> 12 & 63), s(128 | l >> 6 & 63), s(128 | l & 63)) : (s(224 | l >> 12), s(128 | l >> 6 & 63), s(128 | l & 63));
	}
	return $b(a, 0, o);
}
function kx(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	}
	if (Ex) return Ex.decode(e);
	var i = Dx(e), a = i.s, n = i.r;
	return n.length && tx(8), a;
}
var Ax = function(e, t) {
	return t + 30 + vx(e, t + 26) + vx(e, t + 28);
}, jx = function(e, t, n) {
	var r = vx(e, t + 28), i = vx(e, t + 30), a = kx(e.subarray(t + 46, t + 46 + r), !(vx(e, t + 8) & 2048)), o = t + 46 + r, s = Mx(e, o, i, n, yx(e, t + 20), yx(e, t + 24), yx(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		vx(e, t + 10),
		c,
		l,
		a,
		o + i + vx(e, t + 32),
		u
	];
}, Mx = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + vx(e, t + 2)) if (vx(e, t) == 1) return [
			s ? bx(e, t + 4 + 8 * c) : i,
			c ? bx(e, t + 4) : a,
			l ? bx(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && tx(13);
	}
	return [
		i,
		a,
		o,
		0
	];
}, Nx = function(e) {
	var t = 0;
	if (e) for (var n in e) {
		var r = e[n].length;
		r > 65535 && tx(9), t += r + 4;
	}
	return t;
}, Px = function(e, t, n, r, i, a, o, s) {
	var c = r.length, l = n.extra, u = s && s.length, d = Nx(l);
	xx(e, t, o == null ? 67324752 : 33639248), t += 4, o != null && (e[t++] = 20, e[t++] = n.os), e[t] = 20, t += 2, e[t++] = n.flag << 1 | (a < 0 && 8), e[t++] = i && 8, e[t++] = n.compression & 255, e[t++] = n.compression >> 8;
	var f = new Date(n.mtime == null ? Date.now() : n.mtime), p = f.getFullYear() - 1980;
	if ((p < 0 || p > 119) && tx(10), xx(e, t, p << 25 | f.getMonth() + 1 << 21 | f.getDate() << 16 | f.getHours() << 11 | f.getMinutes() << 5 | f.getSeconds() >> 1), t += 4, a != -1 && (xx(e, t, n.crc), xx(e, t + 4, a < 0 ? -a - 2 : a), xx(e, t + 8, n.size)), xx(e, t + 12, c), xx(e, t + 14, d), t += 16, o != null && (xx(e, t, u), xx(e, t + 6, n.attrs), xx(e, t + 10, o), t += 14), e.set(r, t), t += c, d) for (var m in l) {
		var h = l[m], g = h.length;
		xx(e, t, +m), xx(e, t + 2, g), e.set(h, t + 4), t += 4 + g;
	}
	return u && (e.set(s, t), t += u), t;
}, Fx = function(e, t, n, r, i) {
	xx(e, t, 101010256), xx(e, t + 8, n), xx(e, t + 10, n), xx(e, t + 12, r), xx(e, t + 16, i);
};
function Ix(e, t) {
	t ||= {};
	var n = {}, r = [];
	wx(e, "", n, t);
	var i = 0, a = 0;
	for (var o in n) {
		var s = n[o], c = s[0], l = s[1], u = l.level == 0 ? 0 : 8, d = Ox(o), f = d.length, p = l.comment, m = p && Ox(p), h = m && m.length, g = Nx(l.extra);
		f > 65535 && tx(11);
		var _ = u ? Sx(c, l) : c, v = _.length, y = hx();
		y.p(c), r.push(_x(l, {
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
	for (var b = new Eb(a + 22), x = i, S = a - i, C = 0; C < r.length; ++C) {
		var d = r[C];
		Px(b, d.o, d, d.f, d.u, d.c.length);
		var w = 30 + d.f.length + Nx(d.extra);
		b.set(d.c, d.o + w), Px(b, i, d, d.f, d.u, d.c.length, d.o, d.m), i += 16 + w + (d.m ? d.m.length : 0);
	}
	return Fx(b, i, r.length, S, x), b;
}
function Lx(e, t) {
	for (var n = {}, r = e.length - 22; yx(e, r) != 101010256; --r) (!r || e.length - r > 65558) && tx(13);
	var i = vx(e, r + 8);
	if (!i) return {};
	var a = yx(e, r + 16), o = yx(e, r - 20) == 117853008;
	if (o) {
		var s = yx(e, r - 12);
		o = yx(e, s) == 101075792, o && (i = yx(e, s + 32), a = yx(e, s + 48));
	}
	for (var c = t && t.filter, l = 0; l < i; ++l) {
		var u = jx(e, a, o), d = u[0], f = u[1], p = u[2], m = u[3], h = u[4], g = u[5], _ = Ax(e, g);
		a = h, (!c || c({
			name: m,
			size: f,
			originalSize: p,
			compression: d
		})) && (d ? d == 8 ? n[m] = Cx(e.subarray(_, _ + f), { out: new Eb(p) }) : tx(14, "unknown compression type " + d) : n[m] = $b(e, _, _ + f));
	}
	return n;
}
// node_modules/@noble/hashes/_u64.js
var Rx = (e) => e / 2 ** 32 | 0, zx = (e) => e >>> 0;
function Bx(e, t, n, r) {
	let i = Rx(n), a = zx(n);
	e.setUint32(t, r ? a : i, r), e.setUint32(t + 4, r ? i : a, r);
}
// node_modules/@noble/hashes/utils.js
function Vx(e) {
	return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
var Hx = (e) => e ? `"${e}" ` : "";
function Ux(e, t = "") {
	if (typeof e != "number") throw TypeError(Hx(t) + "expected number, got " + typeof e);
	if (!Number.isSafeInteger(e) || e < 0) throw RangeError(Hx(t) + "expected integer >= 0, got " + e);
	return e;
}
function Wx(e, t, n = "") {
	if (Vx(e) && (t === void 0 || e.length === t)) return e;
	t !== void 0 && Ux(t, "length");
	let r = Vx(e), i = t === void 0 ? "" : ` of length ${t}`, a = r ? `length=${e.length}` : `type=${typeof e}`, o = Hx(n) + "expected Uint8Array" + i + ", got " + a;
	throw r ? RangeError(o) : TypeError(o);
}
var Gx = (e, t) => {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError((t === "object" ? "" : `"${t}" `) + "expected object, got type=" + typeof e);
}, Kx = (e, t) => {
	Gx(e, t);
	let n = Object.getPrototypeOf(e);
	if (n !== Object.prototype && n !== null) throw TypeError(`"${t}" expected plain object`);
	if (Object.hasOwn(e, "__proto__")) throw TypeError(`"${t}.__proto__" is not allowed`);
};
function qx(e, t = !0) {
	if (e.destroyed) throw Error("hash was destroyed");
	if (t && e.finished) throw Error("digest() was already called");
}
function Jx(e, t) {
	Wx(e, void 0, "output");
	let n = t.outputLen;
	if (!(e.length >= n)) throw RangeError("\"output\" expected length >= " + n);
}
function Yx(...e) {
	for (let t = 0; t < e.length; t++) e[t].fill(0);
}
function Xx(e) {
	return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function Zx(e, t) {
	return e << 32 - t | e >>> t;
}
var Qx = typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", $x = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function eS(e) {
	if (Wx(e), Qx) return e.toHex();
	let t = "";
	for (let n = 0; n < e.length; n++) t += $x[e[n]];
	return t;
}
function tS(e) {
	if (typeof e != "string") throw TypeError("string expected");
	let t = new TextEncoder().encode(e);
	try {
		return new Uint8Array(t);
	} finally {
		Yx(t);
	}
}
function nS(e, t, n = "opts") {
	return Kx(e, "defaults"), t !== void 0 && Kx(t, n), Object.assign(Object.create(null), e, t);
}
function rS(e, t = {}) {
	if (typeof e != "function") throw TypeError("\"hashCons\" expected function, got type=" + typeof e);
	t = nS({}, t, "info");
	let n = (t, n) => e(n).update(t).digest(), r = e(void 0);
	return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.canXOF = r.canXOF, n.create = (t) => e(t), Object.assign(n, t), Object.freeze(n);
}
var iS = (e) => ({ oid: Uint8Array.from([
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
function aS(e, t, n) {
	return e & t ^ ~e & n;
}
function oS(e, t, n) {
	return e & t ^ e & n ^ t & n;
}
var sS = class {
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
		this.blockLen = e, this.outputLen = t, this.padOffset = n, this.isLE = r, this.buffer = new Uint8Array(e), this.view = Xx(this.buffer);
	}
	update(e) {
		qx(this), Wx(e);
		let { view: t, buffer: n, blockLen: r } = this, i = e.length, a = !1;
		for (let o = 0; o < i;) {
			let s = Math.min(r - this.pos, i - o);
			if (s === r) {
				let t = Xx(e);
				for (; r <= i - o; o += r) this.process(t, o);
				a = !0;
			} else n.set(o === 0 && s === i ? e : e.subarray(o, o + s), this.pos), this.pos += s, o += s, this.pos === r && (this.process(t, 0), this.pos = 0, a = !0);
		}
		return this.length += e.length, a && this.roundClean(), this;
	}
	digestInto(e) {
		qx(this), Jx(e, this), this.finished = !0;
		let { buffer: t, view: n, blockLen: r, isLE: i } = this, { pos: a } = this;
		t[a++] = 128, t.fill(0, a), this.padOffset > r - a && (this.process(n, 0), t.fill(0)), Bx(n, r - 8, this.length * 8, i), this.process(n, 0), this.roundClean();
		let o = e === t ? n : Xx(e), s = this.outputLen, c = s / 4, l = this.get();
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
}, cS = /* @__PURE__ */ Uint32Array.from([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]), lS = /* @__PURE__ */ Uint32Array.from([
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
]), uS = /* @__PURE__ */ new Uint32Array(64), dS = class extends sS {
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
		for (let n = 0; n < 16; n++, t += 4) uS[n] = e.getUint32(t, !1);
		for (let e = 16; e < 64; e++) {
			let t = uS[e - 15], n = uS[e - 2], r = Zx(t, 7) ^ Zx(t, 18) ^ t >>> 3, i = Zx(n, 17) ^ Zx(n, 19) ^ n >>> 10;
			uS[e] = i + uS[e - 7] + r + uS[e - 16] | 0;
		}
		let { A: n, B: r, C: i, D: a, E: o, F: s, G: c, H: l } = this;
		for (let e = 0; e < 64; e++) {
			let t = Zx(o, 6) ^ Zx(o, 11) ^ Zx(o, 25), u = l + t + aS(o, s, c) + lS[e] + uS[e] | 0, d = (Zx(n, 2) ^ Zx(n, 13) ^ Zx(n, 22)) + oS(n, r, i) | 0;
			l = c, c = s, s = o, o = a + u | 0, a = i, i = r, r = n, n = u + d | 0;
		}
		n = n + this.A | 0, r = r + this.B | 0, i = i + this.C | 0, a = a + this.D | 0, o = o + this.E | 0, s = s + this.F | 0, c = c + this.G | 0, l = l + this.H | 0, this.set(n, r, i, a, o, s, c, l);
	}
	roundClean() {
		Yx(uS);
	}
	destroy() {
		this.destroyed = !0, this.set(0, 0, 0, 0, 0, 0, 0, 0), Yx(this.buffer);
	}
}, fS = class extends dS {
	constructor() {
		super(32, cS);
	}
}, pS = /* @__PURE__ */ rS(() => new fS(), /* @__PURE__ */ iS(1));
// src/core/hash.ts
function mS(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e) ?? "null";
	if (Array.isArray(e)) return `[${e.map((e) => mS(e === void 0 ? null : e)).join(",")}]`;
	let t = e;
	return `{${Object.keys(t).filter((e) => t[e] !== void 0).sort().map((e) => `${JSON.stringify(e)}:${mS(t[e])}`).join(",")}}`;
}
function hS(e) {
	return eS(pS(typeof e == "string" ? tS(e) : e));
}
function gS(e) {
	return hS(mS(e));
}
// src/core/migrate.ts
var _S = {
	workspace: {},
	save: {},
	pack: {}
}, vS = "这个存档由更新版本的扩展创建，请先更新扩展";
function yS(e, t, n = {}) {
	let r = n.current ?? Iy[e], i = n.migrations ?? _S[e], a = Number(t.schemaVersion);
	if (!Number.isInteger(a) || a < 0) throw new Q("E_BAD_VERSION", "文件内容损坏：缺少有效的版本号");
	if (a > r) throw new Q("E_NEWER_DATA", vS, {
		kind: e,
		version: a,
		current: r
	});
	let o = t;
	for (; a < r;) {
		let t = i[a];
		if (!t) throw new Q("E_BAD_VERSION", `无法升级版本 ${a} 的数据`, {
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
// src/schemas/credit.ts
var bS = $v({
	book: Z().min(1).max(20),
	page: Vv().int().nonnegative()
}), xS = cy([
	"不全书",
	"共库",
	"共库机翻",
	"dnd-data",
	"本项目"
]), SS = cy([
	"GPL-3.0",
	"CC-BY-NC-SA-4.0",
	"CC-BY-4.0",
	"MIT"
]), CS = {
	不全书: "GPL-3.0",
	共库: "CC-BY-NC-SA-4.0",
	共库机翻: "CC-BY-NC-SA-4.0",
	"dnd-data": "MIT",
	本项目: "CC-BY-NC-SA-4.0"
}, wS = $v({
	by: xS,
	license: SS,
	machine: Gv().default(!1),
	missing: Zv(Z()).default([]),
	srd: Gv().default(!1)
}).superRefine((e, t) => {
	CS[e.by] !== e.license && t.addIssue({
		code: "custom",
		path: ["license"],
		message: `credit.by 为 ${e.by} 时许可必须是 ${CS[e.by]}`
	}), e.by !== "共库机翻" && e.machine && t.addIssue({
		code: "custom",
		path: ["machine"],
		message: "只有「共库机翻」可以标记为机翻"
	});
}), TS = ey({
	kind: Z().min(1).max(40),
	id: Ry,
	name: Z().min(1).max(200),
	description: Zv(Vy).default([]),
	dmSecret: Zv(Vy).default([]),
	keywords: Zv(Z()).default([]),
	src: bS.optional(),
	credit: wS.optional(),
	data: oy(Z(), qv()).default({})
}), ES = ey({
	name: Z().min(1),
	dmNotes: Zv(Vy).optional(),
	itemIds: Zv(Ry).default([])
}), DS = ey({
	id: Ry,
	name: Z().min(1).max(120),
	description: Z().max(4e3).default(""),
	dmNotes: Zv(Vy).optional(),
	levelMin: Vv().int().min(1).max(20).optional(),
	levelMax: Vv().int().min(1).max(20).optional(),
	start: $v({
		locationId: Ry.optional(),
		intro: Zv(Vy).optional()
	}),
	chapters: Zv(ES).default([]),
	itemIds: Zv(Ry).default([])
}), OS = ey({
	cover: Uy.optional(),
	description: Z().default(""),
	adventures: Zv(DS),
	shared: Zv(Ry).default([])
}), kS = $v({ items: Zv(TS).default([]) }), AS = [
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
function jS(e) {
	return AS.find((t) => t.test(e))?.mime;
}
function MS(e, t) {
	if (t.length > 10485760) throw new Q("E_BAD_CONTENT", `文件内容损坏：图片「${e}」过大`);
	let n = jS(t);
	if (!n) throw new Q("E_BAD_CONTENT", `文件内容损坏：图片「${e}」不合法`);
	return n;
}
// src/core/packs/manifest.ts
function NS(e) {
	return e?.path.map(String).join(".") || "整体";
}
function PS(e) {
	return hS(new TextEncoder().encode(`trpg-pack-lineage:${e}`)).slice(0, 32);
}
function FS(e, t) {
	let n = { ...e };
	t <= 1 && (n.category = n.kind === "module" ? "adventure" : "rules", n.relationships = {
		requires: Array.isArray(n.dependsOn) ? n.dependsOn : [],
		recommends: [],
		conflicts: []
	}, delete n.kind, delete n.dependsOn), typeof n.lineage == "string" && n.lineage || (n.lineage = PS(String(n.id))), n.blobs = Array.isArray(n.blobs) ? n.blobs : [], n.contributes = n.contributes ?? {}, n.relationships = n.relationships ?? {
		requires: [],
		recommends: [],
		conflicts: []
	}, n.dataVersion = n.dataVersion ?? 1;
	let r = Xy.safeParse(n);
	if (!r.success) throw new Q("E_BAD_CONTENT", `文件内容损坏：说明文件的 ${NS(r.error.issues[0])} 不合法`);
	return r.data;
}
var IS = /^[a-z0-9/._-]+$/, LS = /\.(?:js|mjs|html?|svg)$/i, RS = /* @__PURE__ */ new Set([
	"trpg-manifest.json",
	"entries",
	"features",
	"adventure",
	"blobs"
]), zS = /* @__PURE__ */ new Set([
	"trpg-manifest.json",
	"entries",
	"assets"
]);
function BS(e) {
	return e.includes("/") ? e.slice(0, e.indexOf("/")) : e;
}
function VS(e, t, n) {
	let r = 0;
	for (let i of e) {
		if (r += t[i].length, i.startsWith("/") || i.includes("\\") || i.split("/").includes("..") || !IS.test(i)) throw new Q("E_BAD_CONTENT", "文件内容损坏：包含不合法的路径");
		if (LS.test(i)) throw new Q("E_FORBIDDEN_FILE", `不能安装：包里含有不允许的文件「${i}」`);
		let e = n <= 1 ? zS : RS, a = BS(i);
		if (!e.has(a)) throw new Q("E_FORBIDDEN_FILE", `不能安装：包里含有不允许的文件「${i}」`);
	}
	if (e.length > 2e4 || r > 268435456) throw new Q("E_TOO_LARGE", "文件过大或文件数过多，无法导入");
}
// src/core/packs/refs.ts
function HS(e, t = /* @__PURE__ */ new Set()) {
	if (Array.isArray(e)) for (let n of e) HS(n, t);
	else if (e && typeof e == "object") {
		let n = e;
		typeof n.$asset == "string" && t.add(n.$asset);
		for (let e of Object.values(n)) HS(e, t);
	}
	return t;
}
function US(e, t = []) {
	if (Array.isArray(e)) for (let n of e) US(n, t);
	else if (e && typeof e == "object") {
		let n = e;
		typeof n.$ref == "string" && t.push(n);
		for (let e of Object.values(n)) US(e, t);
	}
	return t;
}
function WS(e) {
	return new Q("E_BAD_CONTENT", `文件内容损坏：${e}`);
}
function GS(e) {
	let { manifest: t, entries: n, adventure: r, fallback: i, blobHashes: a } = e, o = new Set(n.map((e) => e.id)), s = [];
	for (let e of Object.values(r)) if (Array.isArray(e)) for (let t of e) t && typeof t == "object" && s.push(t);
	for (let e of s) typeof e.id == "string" && o.add(e.id);
	let c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
	for (let e of i) {
		if (!e || typeof e != "object") continue;
		let t = e;
		typeof t.id == "string" && c.add(t.id), typeof t.data?.origin?.lineage == "string" && typeof t.data.origin.itemId == "string" && l.add(`${t.data.origin.lineage}\u0000${t.data.origin.itemId}`);
	}
	let u = new Set(t.relationships.requires.map((e) => e.id)), d = 0, f = /* @__PURE__ */ new Set();
	for (let e of n) {
		let t = e.override;
		if (t) {
			let n = t.target;
			if (!n || typeof n.packId != "string" || typeof n.entryId != "string") throw WS(`「${e.name}」的修改目标不合法`);
			if (!u.has(n.packId)) throw WS(`「${e.name}」修改的条目所在的包未声明为依赖`);
			let r = `${n.packId}\u0000${n.entryId}`;
			if (f.has(r)) throw WS(`「${e.name}」修改的条目被修改了两次`);
			f.add(r);
		}
	}
	let p = [
		n.map((e) => e.data),
		r,
		i
	];
	for (let e of US(p)) {
		let n = e.$ref;
		if (n === "item" || n === "local") {
			if (typeof e.id != "string" || !o.has(e.id)) throw WS(`「${String(e.id ?? "")}」引用了不存在的内容`);
		} else if (n === "ext") {
			let t = typeof e.id == "string" ? e.id : "", n = typeof e.lineage == "string" ? e.lineage : "";
			if (!c.has(t) && !l.has(`${n}\u0000${t}`)) throw WS(`「${t}」引用了不存在的内容`);
		} else if (n === "pack") {
			if (typeof e.packId != "string" || !(e.packId === t.id || u.has(e.packId))) throw WS(`「${String(e.entryId ?? "")}」引用了不存在的包`);
		} else throw WS(`未知的引用类型「${String(n)}」`);
		d++;
	}
	for (let e of HS(p)) if (!a.has(e)) throw WS(`缺少图片「${e.slice(0, 12)}」`);
	return { softRefs: d };
}
// src/core/packs/zip.ts
function KS(e) {
	try {
		return Lx(e);
	} catch {
		throw new Q("E_NOT_ZIP", "无法识别：这不是 TRPG 跑团助手的文件");
	}
}
function qS(e) {
	let t = {};
	for (let n of Object.keys(e).sort()) {
		let r = e[n];
		t[n] = typeof r == "string" ? Ox(r) : r;
	}
	return Ix(t, {
		level: 6,
		mtime: new Date(1980, 0, 1, 0, 0, 0)
	});
}
function JS(e, t) {
	let n = e[t];
	if (n) try {
		return JSON.parse(kx(n));
	} catch {
		throw new Q("E_BAD_CONTENT", `文件内容损坏：${t} 无法解析`);
	}
}
// src/core/packs/recognize.ts
function YS(e) {
	return new Q("E_BAD_CONTENT", `文件内容损坏：${e}`);
}
function XS(e) {
	return Object.keys(e).filter((e) => !e.endsWith("/"));
}
function ZS(e) {
	let t = [], n = XS(e).filter((e) => e.startsWith("entries/") && e.endsWith(".json")).sort();
	for (let r of n) {
		let n = JS(e, r);
		if (!Array.isArray(n)) throw YS(`${r} 不是条目列表`);
		for (let e of n) {
			let n = Qy.safeParse(e);
			if (!n.success) {
				let r = e?.name;
				throw YS(`第 ${t.length + 1} 项「${typeof r == "string" ? r : "未命名"}」的 ${NS(n.error.issues[0])} 不合法`);
			}
			t.push(n.data);
		}
	}
	return t;
}
function QS(e) {
	let t = [];
	for (let n of XS(e).filter((e) => e.startsWith("features/") && e.endsWith(".json")).sort()) {
		let r = JS(e, n);
		if (!Array.isArray(r)) throw YS(`${n} 不是功能列表`);
		for (let e of r) {
			let r = e;
			if (!r || typeof r.id != "string" || typeof r.kind != "string" || typeof r.name != "string" || typeof r.data != "object" || r.data === null) throw YS(`${n} 的功能定义不合法`);
			t.push({
				defaultEnabled: !1,
				description: "",
				...r
			});
		}
	}
	return t;
}
function $S(e) {
	let t = {};
	for (let n of XS(e).filter((e) => e.startsWith("adventure/") && e.endsWith(".json")).sort()) {
		if (n === "adventure/fallback.json") continue;
		let r = JS(e, n);
		if (n === "adventure/adventure.json") {
			let e = OS.safeParse(r);
			if (!e.success) throw YS(`adventure/adventure.json 的 ${NS(e.error.issues[0])} 不合法`);
			t[n] = e.data;
		} else {
			let e = TS.array().safeParse(r);
			if (!e.success) throw YS(`${n} 的 ${NS(e.error.issues[0])} 不合法`);
			t[n] = e.data;
		}
	}
	let n = JS(e, "adventure/fallback.json"), r = [];
	if (n !== void 0) {
		let e = kS.safeParse(n);
		if (!e.success) throw YS(`adventure/fallback.json 的 ${NS(e.error.issues[0])} 不合法`);
		r = e.data.items;
	}
	return {
		adventure: t,
		fallback: r
	};
}
function eC(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	if (t >= 2) {
		for (let t of XS(e).filter((e) => e.startsWith("blobs/"))) {
			let n = t.slice(6);
			if (!/^[a-f0-9]{64}$/.test(n)) throw YS(`图片「${n}」的文件名不是哈希`);
			let i = e[t];
			if (hS(i) !== n) throw YS(`图片「${n.slice(0, 12)}」的哈希不一致`);
			let a = MS(n, i);
			r.set(n, {
				hash: n,
				mime: a,
				size: i.length,
				bytes: i
			});
		}
		if (n.blobs.length !== r.size) throw YS("缺少图片或图片清单不一致");
		for (let e of n.blobs) {
			let t = r.get(e.hash);
			if (!t) throw YS(`缺少图片「${e.hash.slice(0, 12)}」`);
			if (t.size !== e.size || t.mime !== e.mime) throw YS(`图片「${e.hash.slice(0, 12)}」与清单不一致`);
		}
	}
	return r;
}
function tC(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let t of XS(e).filter((e) => e.startsWith("assets/"))) {
		let i = t.slice(7), a = e[t], o = hS(a);
		if (r.set(i, o), !n.has(o)) {
			let e = MS(i, a);
			n.set(o, {
				hash: o,
				mime: e,
				size: a.length,
				bytes: a
			});
		}
	}
	for (let e of t) typeof e.image == "string" && r.has(e.image) && (e.image = { $asset: r.get(e.image) });
}
function nC(e, t, n, r, i) {
	let a = t.pack?.ruleId;
	if (typeof a == "string" && !r.hasRule(a)) throw new Q("E_RULE_MISSING", `需要先安装规则『${a}』`, { ruleId: a });
	let o = $y.safeParse(t);
	if (!o.success) throw YS(`说明文件的 ${NS(o.error.issues[0])} 不合法`);
	let s = FS(o.data.pack, i);
	if (s.minAppVersion && Tb(s.minAppVersion, r.appVersion) > 0) throw new Q("E_NEWER_APP", `需要先把扩展更新到 v${s.minAppVersion} 才能安装这个内容包`);
	if (s.dataVersion > 1) throw new Q("E_NEWER_DATA", "这个内容包由更新版本的扩展制作，请先更新扩展");
	VS(XS(e), e, i);
	let c = ZS(e);
	if (c.length !== s.entryCount) throw YS(`条目数量不符（说明为 ${s.entryCount}，实际 ${c.length}）`);
	let l = {};
	for (let e of c) l[e.type] = (l[e.type] ?? 0) + 1;
	let u = i >= 2 ? QS(e) : [], { adventure: d, fallback: f } = i >= 2 ? $S(e) : {
		adventure: {},
		fallback: []
	}, p = eC(e, i, s);
	i <= 1 && tC(e, c, p), s.blobs = [...p.values()].map(({ hash: e, mime: t, size: n }) => ({
		hash: e,
		mime: t,
		size: n
	})).sort((e, t) => e.hash.localeCompare(t.hash));
	let m = {
		entries: c.length,
		tables: c.filter((e) => e.type === "table").length,
		variants: c.filter((e) => e.override !== void 0).length,
		adventures: (d["adventure/adventure.json"]?.adventures ?? []).length,
		ruleOptions: u.filter((e) => e.kind === "ruleOptions").length
	};
	return GS({
		manifest: s,
		entries: c,
		adventure: d,
		fallback: f,
		blobHashes: new Set(p.keys())
	}), {
		type: "pack",
		manifest: {
			...s,
			typeCounts: l,
			contributes: m
		},
		entries: c,
		blobs: p,
		features: u,
		adventure: d,
		fallback: f,
		byteSize: n.length,
		sha256: hS(n)
	};
}
function rC(e, t, n, r) {
	let i = [];
	for (let a of Object.keys(e).filter((e) => e.startsWith(t) && e.endsWith(".json")).sort()) {
		let t = JS(e, a);
		if (!t || typeof t != "object") throw YS(`${a} 不是有效的记录`);
		let o = r(yS(n, t));
		if (!o.ok) throw YS(`${a} 的 ${o.detail} 不合法`);
		i.push(o.value);
	}
	return i;
}
function iC(e, t) {
	let n = eb.safeParse(t);
	if (!n.success) throw YS(`说明文件的 ${NS(n.error.issues[0])} 不合法`);
	let r = rC(e, "saves/", "save", (e) => {
		let t = cb.safeParse(e);
		return t.success ? {
			ok: !0,
			value: t.data
		} : {
			ok: !1,
			detail: NS(t.error.issues[0])
		};
	}), i = rC(e, "workspaces/", "workspace", (e) => {
		let t = ab.safeParse(e);
		return t.success ? {
			ok: !0,
			value: t.data
		} : {
			ok: !1,
			detail: NS(t.error.issues[0])
		};
	}), a, o = JS(e, "settings.json");
	if (o !== void 0) {
		let e = lb.safeParse(o);
		if (!e.success) throw YS(`settings.json 的 ${NS(e.error.issues[0])} 不合法`);
		a = e.data;
	}
	let s = JS(e, "packs.json"), c = [];
	if (Array.isArray(s)) for (let e of s) {
		let t = tb.safeParse(e);
		t.success && c.push(t.data);
	}
	let l = /* @__PURE__ */ new Map();
	for (let t of XS(e)) t.startsWith("packs/") && t.endsWith(".trpgpack") && l.set(t, e[t]);
	let u = /* @__PURE__ */ new Map();
	for (let t of XS(e).filter((e) => e.startsWith("blobs/"))) {
		let n = t.slice(6);
		if (!/^[a-f0-9]{64}$/.test(n)) throw YS(`图片「${n}」的文件名不是哈希`);
		let r = e[t];
		if (hS(r) !== n) throw YS(`图片「${n.slice(0, 12)}」的哈希不一致`);
		MS(n, r), u.set(n, r);
	}
	return {
		type: n.data.format === "trpg-backup" ? "backup" : "save",
		manifest: n.data,
		saves: r,
		workspaces: i,
		settings: a,
		packList: c,
		attachedPacks: l,
		blobs: u
	};
}
function aC(e, t) {
	let n = KS(e), r = n["trpg-manifest.json"];
	if (!r) throw new Q("E_NO_MANIFEST", "无法识别：缺少说明文件，可能不是本扩展导出的文件");
	let i;
	try {
		i = JSON.parse(kx(r));
	} catch {
		throw YS("说明文件无法解析");
	}
	let a = i;
	if (a.format !== "trpg-pack" && a.format !== "trpg-save" && a.format !== "trpg-backup") throw new Q("E_UNKNOWN_FORMAT", "无法识别：未知的文件类型");
	if (typeof a.formatVersion != "number" || a.formatVersion < 1 || a.formatVersion > 2) throw new Q("E_NEWER_FORMAT", "这个文件由更新版本的扩展创建，请先更新扩展");
	let o = Math.max(1, Math.floor(a.formatVersion));
	return a.format === "trpg-pack" ? nC(n, i, e, t, o) : iC(n, i);
}
function oC(e, t) {
	if (e.length !== t.byteSize || hS(e) !== t.sha256) throw new Q("E_CHECKSUM", "下载的文件不完整，请重试");
}
// src/core/packs/catalog.ts
var sC = 36e5, cC = 1e4;
function lC(e, t) {
	return t?.name === "AbortError" ? new Q("E_CANCELLED", "已取消") : new Q("E_NETWORK", `${e}：网络不可用`);
}
function uC(e, t) {
	return new Q("E_HTTP", t === 404 ? `${e}：文件不存在（404）` : `${e}：服务器返回 ${t}`, { status: t });
}
async function dC(e) {
	let t = e.now ?? Date.now;
	if (e.db && !e.force) {
		let n = await e.db.getMeta("catalogCache");
		if (n && n.url === e.url && t() - n.fetchedAt < sC) return n.catalog;
	}
	let n = new AbortController(), r = setTimeout(() => n.abort(), e.timeoutMs ?? cC), i;
	try {
		i = await (e.fetchFn ?? fetch)(e.url, { signal: n.signal });
	} catch (e) {
		throw e?.name === "AbortError" ? new Q("E_NETWORK", "连不上数据仓库：等待超时") : lC("连不上数据仓库", e);
	} finally {
		clearTimeout(r);
	}
	if (!i.ok) throw uC("连不上数据仓库", i.status);
	let a;
	try {
		a = await i.json();
	} catch {
		throw new Q("E_BAD_CONTENT", "数据仓库目录格式不正确");
	}
	let o = nb.safeParse(a);
	if (!o.success) throw new Q("E_BAD_CONTENT", "数据仓库目录格式不正确");
	if (o.data.formatVersion > 2) throw new Q("E_NEWER_FORMAT", "数据仓库目录由更新版本创建，请先更新扩展");
	return e.db && await e.db.setMeta("catalogCache", {
		url: e.url,
		fetchedAt: t(),
		catalog: o.data
	}), o.data;
}
async function fC(e, t) {
	let n = new URL(e.url, t.catalogUrl).toString(), r;
	try {
		r = await (t.fetchFn ?? fetch)(n, { signal: t.signal });
	} catch (e) {
		throw lC("下载失败", e);
	}
	if (!r.ok) throw uC("下载失败", r.status);
	let i = e.byteSize, a = [], o = 0;
	try {
		if (r.body) {
			let e = r.body.getReader();
			for (;;) {
				let { done: n, value: r } = await e.read();
				if (n) break;
				a.push(r), o += r.length, t.onProgress?.(o, i);
			}
		} else {
			let e = new Uint8Array(await r.arrayBuffer());
			a.push(e), o = e.length, t.onProgress?.(o, i);
		}
	} catch (e) {
		throw e?.name === "AbortError" ? new Q("E_CANCELLED", "已取消") : new Q("E_NETWORK", "下载失败：网络中断");
	}
	let s = new Uint8Array(o), c = 0;
	for (let e of a) s.set(e, c), c += e.length;
	return oC(s, {
		byteSize: e.byteSize,
		sha256: e.sha256
	}), s;
}
async function pC(e, t, n) {
	let r = e.recognize(t);
	if (r.type !== "pack" || r.manifest.id !== n.id || r.manifest.version !== n.version) throw new Q("E_BAD_CONTENT", "文件内容损坏：下载的文件与目录说明不一致");
	return e.install(r, { source: "download" });
}
function mC(e, t) {
	return t.packs.filter((t) => {
		let n = e.find((e) => e.id === t.id);
		return !!n && n.source !== "builtin" && Tb(t.version, n.version) > 0;
	});
}
function hC(e, t, n) {
	return t.packs.filter((t) => t.ruleId === n && !e.some((e) => e.id === t.id));
}
// src/core/packs/builtins.ts
async function gC(e, t) {
	let n = await e.getMeta(t);
	return Array.isArray(n) ? n.filter((e) => typeof e == "string") : [];
}
async function _C(e) {
	return gC(e, "builtinRemoved");
}
async function vC(e) {
	return gC(e, "userRemoved");
}
async function yC(e, t, n, r) {
	let i = new Set(await _C(e)), a = n.builtinPacks ?? n.corePackIds, o = {
		installed: [],
		skipped: [],
		removed: [],
		failed: []
	};
	for (let e of a) if (i.has(e)) o.removed.push(e);
	else try {
		(await t.installBuiltin(await r(e)) === "skipped" ? o.skipped : o.installed).push(e);
	} catch (t) {
		o.failed.push({
			id: e,
			message: t instanceof Error ? t.message : String(t)
		});
	}
	return o;
}
// node_modules/dexie/import-wrapper.mjs
var bC = /* @__PURE__ */ l((/* @__PURE__ */ o(((e, t, n) => {
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
		function ee(e) {
			var t = {};
			for (var n in e) u(e, n) && (t[n] = e[n]);
			return t;
		}
		var E = [].concat;
		function D(e) {
			return E.apply([], e);
		}
		var O = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(D([
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
			var t = k(e);
			return re = null, t;
		}
		function k(e) {
			if (!e || typeof e != "object") return e;
			var t = re.get(e);
			if (t) return t;
			if (o(e)) {
				t = [], re.set(e, t);
				for (var n = 0, r = e.length; n < r; ++n) t.push(k(e[n]));
			} else if (te.has(e.constructor)) t = e;
			else {
				var i = c(e);
				for (var a in t = i === Object.prototype ? {} : Object.create(i), re.set(e, t), e) u(e, a) && (t[a] = k(e[a]));
			}
			return t;
		}
		var ae = {}.toString;
		function oe(e) {
			return ae.call(e).slice(8, -1);
		}
		var A = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", se = typeof A == "symbol" ? function(e) {
			var t;
			return e != null && (t = e[A]) && t.apply(e);
		} : function() {
			return null;
		};
		function ce(e, t) {
			var n = e.indexOf(t);
			return n >= 0 && e.splice(n, 1), n >= 0;
		}
		var le = {};
		function ue(e) {
			var t, n, r, i;
			if (arguments.length === 1) {
				if (o(e)) return e.slice();
				if (this === le && typeof e == "string") return [e];
				if (i = se(e)) {
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
		], pe = [
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
		], me = fe.concat(pe), he = {
			VersionChanged: "Database version changed by other database connection",
			DatabaseClosed: "Database has been closed",
			Abort: "Transaction aborted",
			TransactionInactive: "Transaction has already completed or failed",
			MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
		};
		function ge(e, t) {
			this.name = e, this.message = t;
		}
		m(ge).from(Error).extend({ toString: function() {
			return this.name + ": " + this.message;
		} });
		function _e(e, t) {
			return e + ". Errors: " + Object.keys(t).map(function(e) {
				return t[e].toString();
			}).filter(function(e, t, n) {
				return n.indexOf(e) === t;
			}).join("\n");
		}
		function ve(e, t, n, r) {
			this.failures = t, this.failedKeys = r, this.successCount = n, this.message = _e(e, t);
		}
		m(ve).from(ge);
		function ye(e, t) {
			this.name = "BulkError", this.failures = Object.keys(t).map(function(e) {
				return t[e];
			}), this.failuresByPos = t, this.message = _e(e, this.failures);
		}
		m(ye).from(ge);
		var be = me.reduce(function(e, t) {
			return e[t] = t + "Error", e;
		}, {}), xe = ge, j = me.reduce(function(e, t) {
			var n = t + "Error";
			function r(e, r) {
				this.name = n, e ? typeof e == "string" ? (this.message = `${e}${r ? "\n " + r : ""}`, this.inner = r || null) : typeof e == "object" && (this.message = `${e.name} ${e.message}`, this.inner = e) : (this.message = he[t] || n, this.inner = null);
			}
			return m(r).from(xe), e[t] = r, e;
		}, {});
		j.Syntax = SyntaxError, j.Type = TypeError, j.Range = RangeError;
		var Se = pe.reduce(function(e, t) {
			return e[t + "Error"] = j[t], e;
		}, {});
		function Ce(e, t) {
			if (!e || e instanceof ge || e instanceof TypeError || e instanceof SyntaxError || !e.name || !Se[e.name]) return e;
			var n = new Se[e.name](t || e.message, e);
			return "stack" in e && p(n, "stack", { get: function() {
				return this.inner.stack;
			} }), n;
		}
		var we = me.reduce(function(e, t) {
			return [
				"Syntax",
				"Type",
				"Range"
			].indexOf(t) === -1 && (e[t + "Error"] = j[t]), e;
		}, {});
		we.ModifyError = ve, we.DexieError = ge, we.BulkError = ye;
		function Te() {}
		function Ee(e) {
			return e;
		}
		function De(e, t) {
			return e == null || e === Ee ? t : function(n) {
				return t(e(n));
			};
		}
		function Oe(e, t) {
			return function() {
				e.apply(this, arguments), t.apply(this, arguments);
			};
		}
		function ke(e, t) {
			return e === Te ? t : function() {
				var n = e.apply(this, arguments);
				n !== void 0 && (arguments[0] = n);
				var r = this.onsuccess, i = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var a = t.apply(this, arguments);
				return r && (this.onsuccess = this.onsuccess ? Oe(r, this.onsuccess) : r), i && (this.onerror = this.onerror ? Oe(i, this.onerror) : i), a === void 0 ? n : a;
			};
		}
		function Ae(e, t) {
			return e === Te ? t : function() {
				e.apply(this, arguments);
				var n = this.onsuccess, r = this.onerror;
				this.onsuccess = this.onerror = null, t.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? Oe(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? Oe(r, this.onerror) : r);
			};
		}
		function je(e, t) {
			return e === Te ? t : function() {
				var n = e.apply(this, arguments), r = arguments[0];
				s(r, n);
				var i = this.onsuccess, a = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var o = t.apply(this, arguments);
				return i && (this.onsuccess = this.onsuccess ? Oe(i, this.onsuccess) : i), a && (this.onerror = this.onerror ? Oe(a, this.onerror) : a), n === void 0 ? o === void 0 ? void 0 : o : s(n, o);
			};
		}
		function Me(e, t) {
			return e === Te ? t : function() {
				return t.apply(this, arguments) !== !1 && e.apply(this, arguments);
			};
		}
		function Ne(e, t) {
			return e === Te ? t : function() {
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
		var Pe = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
		function Fe(e, t) {
			Pe = e;
		}
		var Ie = {}, Le = 100, Re = typeof Promise > "u" ? [] : (function() {
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
		})(), ze = Re[0], Be = Re[1], Ve = Re[2], He = Be && Be.then, Ue = ze && ze.constructor, M = !!Ve;
		function We() {
			queueMicrotask(ct);
		}
		var Ge = function(e, t) {
			Qe.push([e, t]), qe &&= (We(), !1);
		}, Ke = !0, qe = !0, Je = [], Ye = [], Xe = Ee, Ze = {
			id: "global",
			global: !0,
			ref: 0,
			unhandleds: [],
			onunhandled: Te,
			pgp: !1,
			env: {},
			finalize: Te
		}, N = Ze, Qe = [], $e = 0, et = [];
		function P(e) {
			if (typeof this != "object") throw TypeError("Promises must be constructed via new");
			this._listeners = [], this._lib = !1;
			var t = this._PSD = N;
			if (typeof e != "function") {
				if (e !== Ie) throw TypeError("Not a function");
				this._state = arguments[1], this._value = arguments[2], this._state === !1 && it(this, this._value);
			} else this._state = null, this._value = null, ++t.ref, rt(this, e);
		}
		var tt = {
			get: function() {
				var e = N, t = xt;
				function n(n, r) {
					var i = this, a = !e.global && (e !== N || t !== xt), o = a && !Tt(), s = new P(function(t, s) {
						ot(i, new nt(Mt(n, e, a, o), Mt(r, e, a, o), t, s, e));
					});
					return this._consoleTask && (s._consoleTask = this._consoleTask), s;
				}
				return n.prototype = Ie, n;
			},
			set: function(e) {
				p(this, "then", e && e.prototype === Ie ? tt : {
					get: function() {
						return e;
					},
					set: tt.set
				});
			}
		};
		d(P.prototype, {
			then: tt,
			_then: function(e, t) {
				ot(this, new nt(null, null, e, t, N));
			},
			catch: function(e) {
				if (arguments.length === 1) return this.then(null, e);
				var t = arguments[0], n = arguments[1];
				return typeof t == "function" ? this.then(null, function(e) {
					return e instanceof t ? n(e) : ht(e);
				}) : this.then(null, function(e) {
					return e && e.name === t ? n(e) : ht(e);
				});
			},
			finally: function(e) {
				return this.then(function(t) {
					return P.resolve(e()).then(function() {
						return t;
					});
				}, function(t) {
					return P.resolve(e()).then(function() {
						return ht(t);
					});
				});
			},
			timeout: function(e, t) {
				var n = this;
				return e < Infinity ? new P(function(r, i) {
					var a = setTimeout(function() {
						return i(new j.Timeout(t));
					}, e);
					n.then(r, i).finally(clearTimeout.bind(null, a));
				}) : this;
			}
		}), typeof Symbol < "u" && Symbol.toStringTag && p(P.prototype, Symbol.toStringTag, "Dexie.Promise"), Ze.env = At();
		function nt(e, t, n, r, i) {
			this.onFulfilled = typeof e == "function" ? e : null, this.onRejected = typeof t == "function" ? t : null, this.resolve = n, this.reject = r, this.psd = i;
		}
		d(P, {
			all: function() {
				var e = ue.apply(null, arguments).map(Et);
				return new P(function(t, n) {
					e.length === 0 && t([]);
					var r = e.length;
					e.forEach(function(i, a) {
						return P.resolve(i).then(function(n) {
							e[a] = n, --r || t(e);
						}, n);
					});
				});
			},
			resolve: function(e) {
				return e instanceof P ? e : e && typeof e.then == "function" ? new P(function(t, n) {
					e.then(t, n);
				}) : new P(Ie, !0, e);
			},
			reject: ht,
			race: function() {
				var e = ue.apply(null, arguments).map(Et);
				return new P(function(t, n) {
					e.map(function(e) {
						return P.resolve(e).then(t, n);
					});
				});
			},
			PSD: {
				get: function() {
					return N;
				},
				set: function(e) {
					return N = e;
				}
			},
			totalEchoes: { get: function() {
				return xt;
			} },
			newPSD: Ct,
			usePSD: jt,
			scheduler: {
				get: function() {
					return Ge;
				},
				set: function(e) {
					Ge = e;
				}
			},
			rejectionMapper: {
				get: function() {
					return Xe;
				},
				set: function(e) {
					Xe = e;
				}
			},
			follow: function(e, t) {
				return new P(function(n, r) {
					return Ct(function(t, n) {
						var r = N;
						r.unhandleds = [], r.onunhandled = n, r.finalize = Oe(function() {
							var e = this;
							ft(function() {
								e.unhandleds.length === 0 ? t() : n(e.unhandleds[0]);
							});
						}, r.finalize), e();
					}, t, n, r);
				});
			}
		}), Ue && (Ue.allSettled && p(P, "allSettled", function() {
			var e = ue.apply(null, arguments).map(Et);
			return new P(function(t) {
				e.length === 0 && t([]);
				var n = e.length, r = Array(n);
				e.forEach(function(e, i) {
					return P.resolve(e).then(function(e) {
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
		}), Ue.any && typeof AggregateError < "u" && p(P, "any", function() {
			var e = ue.apply(null, arguments).map(Et);
			return new P(function(t, n) {
				e.length === 0 && n(/* @__PURE__ */ AggregateError([]));
				var r = e.length, i = Array(r);
				e.forEach(function(e, a) {
					return P.resolve(e).then(function(e) {
						return t(e);
					}, function(e) {
						i[a] = e, --r || n(AggregateError(i));
					});
				});
			});
		}), Ue.withResolvers && (P.withResolvers = Ue.withResolvers));
		function rt(e, t) {
			try {
				t(function(t) {
					if (e._state === null) {
						if (t === e) throw TypeError("A promise cannot be resolved with itself.");
						var n = e._lib && lt();
						t && typeof t.then == "function" ? rt(e, function(e, n) {
							t instanceof P ? t._then(e, n) : t.then(e, n);
						}) : (e._state = !0, e._value = t, at(e)), n && ut();
					}
				}, it.bind(null, e));
			} catch (t) {
				it(e, t);
			}
		}
		function it(e, t) {
			if (Ye.push(t), e._state === null) {
				var n = e._lib && lt();
				t = Xe(t), e._state = !1, e._value = t, pt(e), at(e), n && ut();
			}
		}
		function at(e) {
			var t = e._listeners;
			e._listeners = [];
			for (var n = 0, r = t.length; n < r; ++n) ot(e, t[n]);
			var i = e._PSD;
			--i.ref || i.finalize(), $e === 0 && (++$e, Ge(function() {
				--$e === 0 && dt();
			}, []));
		}
		function ot(e, t) {
			if (e._state === null) e._listeners.push(t);
			else {
				var n = e._state ? t.onFulfilled : t.onRejected;
				if (n === null) return (e._state ? t.resolve : t.reject)(e._value);
				++t.psd.ref, ++$e, Ge(st, [
					n,
					e,
					t
				]);
			}
		}
		function st(e, t, n) {
			try {
				var r, i = t._value;
				!t._state && Ye.length && (Ye = []), r = Pe && t._consoleTask ? t._consoleTask.run(function() {
					return e(i);
				}) : e(i), !t._state && Ye.indexOf(i) === -1 && mt(t), n.resolve(r);
			} catch (e) {
				n.reject(e);
			} finally {
				--$e === 0 && dt(), --n.psd.ref || n.psd.finalize();
			}
		}
		function ct() {
			jt(Ze, function() {
				lt() && ut();
			});
		}
		function lt() {
			var e = Ke;
			return Ke = !1, qe = !1, e;
		}
		function ut() {
			var e, t, n;
			do
				for (; Qe.length > 0;) for (e = Qe, Qe = [], n = e.length, t = 0; t < n; ++t) {
					var r = e[t];
					r[0].apply(null, r[1]);
				}
			while (Qe.length > 0);
			Ke = !0, qe = !0;
		}
		function dt() {
			var e = Je;
			Je = [], e.forEach(function(e) {
				e._PSD.onunhandled.call(null, e._value, e);
			});
			for (var t = et.slice(0), n = t.length; n;) t[--n]();
		}
		function ft(e) {
			function t() {
				e(), et.splice(et.indexOf(t), 1);
			}
			et.push(t), ++$e, Ge(function() {
				--$e === 0 && dt();
			}, []);
		}
		function pt(e) {
			Je.some(function(t) {
				return t._value === e._value;
			}) || Je.push(e);
		}
		function mt(e) {
			for (var t = Je.length; t;) if (Je[--t]._value === e._value) {
				Je.splice(t, 1);
				return;
			}
		}
		function ht(e) {
			return new P(Ie, !1, e);
		}
		function gt(e, t) {
			var n = N;
			return function() {
				var r = lt(), i = N;
				try {
					return kt(n, !0), e.apply(this, arguments);
				} catch (e) {
					t && t(e);
				} finally {
					kt(i, !1), r && ut();
				}
			};
		}
		var _t = {
			awaits: 0,
			echoes: 0,
			id: 0
		}, vt = 0, yt = [], bt = 0, xt = 0, St = 0;
		function Ct(e, t, n, r) {
			var i = N, a = Object.create(i);
			a.parent = i, a.ref = 0, a.global = !1, a.id = ++St, Ze.env, a.env = M ? {
				Promise: P,
				PromiseProp: {
					value: P,
					configurable: !0,
					writable: !0
				},
				all: P.all,
				race: P.race,
				allSettled: P.allSettled,
				any: P.any,
				resolve: P.resolve,
				reject: P.reject
			} : {}, t && s(a, t), ++i.ref, a.finalize = function() {
				--this.parent.ref || this.parent.finalize();
			};
			var o = jt(a, e, n, r);
			return a.ref === 0 && a.finalize(), o;
		}
		function wt() {
			return _t.id ||= ++vt, ++_t.awaits, _t.echoes += Le, _t.id;
		}
		function Tt() {
			return _t.awaits ? (--_t.awaits === 0 && (_t.id = 0), _t.echoes = _t.awaits * Le, !0) : !1;
		}
		("" + He).indexOf("[native code]") === -1 && (wt = Tt = Te);
		function Et(e) {
			return _t.echoes && e && e.constructor === Ue ? (wt(), e.then(function(e) {
				return Tt(), e;
			}, function(e) {
				return Tt(), Pt(e);
			})) : e;
		}
		function Dt(e) {
			++xt, _t.echoes && --_t.echoes !== 0 || (_t.echoes = _t.awaits = _t.id = 0), yt.push(N), kt(e, !0);
		}
		function Ot() {
			var e = yt[yt.length - 1];
			yt.pop(), kt(e, !1);
		}
		function kt(e, t) {
			var n = N;
			if ((t ? _t.echoes && (!bt++ || e !== N) : bt && (!--bt || e !== N)) && queueMicrotask(t ? Dt.bind(null, e) : Ot), e !== N && (N = e, n === Ze && (Ze.env = At()), M)) {
				var r = Ze.env.Promise, a = e.env;
				(n.global || e.global) && (Object.defineProperty(i, "Promise", a.PromiseProp), r.all = a.all, r.race = a.race, r.resolve = a.resolve, r.reject = a.reject, a.allSettled && (r.allSettled = a.allSettled), a.any && (r.any = a.any));
			}
		}
		function At() {
			var e = i.Promise;
			return M ? {
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
		function jt(e, t, n, r, i) {
			var a = N;
			try {
				return kt(e, !0), t(n, r, i);
			} finally {
				kt(a, !1);
			}
		}
		function Mt(e, t, n, r) {
			return typeof e == "function" ? function() {
				var i = N;
				n && wt(), kt(t, !0);
				try {
					return e.apply(this, arguments);
				} finally {
					kt(i, !1), r && queueMicrotask(Tt);
				}
			} : e;
		}
		function Nt(e) {
			Promise === Ue && _t.echoes === 0 ? bt === 0 ? e() : enqueueNativeMicroTask(e) : setTimeout(e, 0);
		}
		var Pt = P.reject;
		function Ft(e, t, n, r) {
			if (!e.idbdb || !e._state.openComplete && !N.letThrough && !e._vip) {
				if (e._state.openComplete) return Pt(new j.DatabaseClosed(e._state.dbOpenError));
				if (!e._state.isBeingOpened) {
					if (!e._state.autoOpen) return Pt(new j.DatabaseClosed());
					e.open().catch(Te);
				}
				return e._state.dbReadyPromise.then(function() {
					return Ft(e, t, n, r);
				});
			}
			var i = e._createTransaction(t, n, e._dbSchema);
			try {
				i.create(), e._state.PR1398_maxLoop = 3;
			} catch (i) {
				return i.name === be.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
					return Ft(e, t, n, r);
				})) : Pt(i);
			}
			return i._promise(t, function(e, t) {
				return Ct(function() {
					return N.trans = i, r(e, t, i);
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
		var It = "4.4.7", Lt = "￿", Rt = -Infinity, zt = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", Bt = "String expected.", Vt = 1e3, Ht = "__dbnames", Ut = "readonly", Wt = "readwrite";
		function Gt(e, t) {
			return e ? t ? function() {
				return e.apply(this, arguments) && t.apply(this, arguments);
			} : e : t;
		}
		var Kt = {
			type: 3,
			lower: -Infinity,
			lowerOpen: !1,
			upper: [[]],
			upperOpen: !1
		};
		function qt(e) {
			return typeof e == "string" && !/\./.test(e) ? function(t) {
				return t[e] === void 0 && e in t && (t = ie(t), delete t[e]), t;
			} : function(e) {
				return e;
			};
		}
		function Jt() {
			throw j.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
		}
		function Yt(e, t) {
			try {
				var n = Qt(e), r = Qt(t);
				if (n !== r) return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r === "Date" ? -1 : NaN;
				switch (n) {
					case "number":
					case "Date":
					case "string": return e > t ? 1 : e < t ? -1 : 0;
					case "binary": return Zt($t(e), $t(t));
					case "Array": return Xt(e, t);
				}
			} catch {}
			return NaN;
		}
		function Xt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) {
				var o = Yt(e[a], t[a]);
				if (o !== 0) return o;
			}
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function Zt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) if (e[a] !== t[a]) return e[a] < t[a] ? -1 : 1;
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function Qt(e) {
			var t = typeof e;
			if (t !== "object") return t;
			if (ArrayBuffer.isView(e)) return "binary";
			var n = oe(e);
			return n === "ArrayBuffer" ? "binary" : n;
		}
		function $t(e) {
			return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : new Uint8Array(e);
		}
		function en(e, t, n) {
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
		var tn = function() {
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
		function nn(e, t) {
			for (var n = a(t), r = n.length, i = !1, o = 0; o < r; ++o) {
				var s = n[o], c = t[s], l = C(e, s);
				c instanceof tn ? (w(e, s, c.execute(l)), i = !0) : l !== c && (w(e, s, c), i = !0);
			}
			return i;
		}
		var rn = function() {
			function e() {}
			return e.prototype._trans = function(e, t, n) {
				var r = this._tx || N.trans, i = this.name, a = Pe && typeof console < "u" && console.createTask && console.createTask(`Dexie: ${e === "readonly" ? "read" : "write"} ${this.name}`);
				function o(e, n, r) {
					if (!r.schema[i]) throw new j.NotFound("Table " + i + " not part of transaction");
					return t(r.idbtrans, r);
				}
				var s = lt();
				try {
					var c = r && r.db._novip === this.db._novip ? r === N.trans ? r._promise(e, o, n) : Ct(function() {
						return r._promise(e, o, n);
					}, {
						trans: r,
						transless: N.transless || N
					}) : Ft(this.db, e, [this.name], o);
					return a && (c._consoleTask = a, c = c.catch(function(e) {
						return console.trace(e), Pt(e);
					})), c;
				} finally {
					s && ut();
				}
			}, e.prototype.get = function(e, t) {
				var n = this;
				return e && e.constructor === Object ? this.where(e).first(t) : e == null ? Pt(new j.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(t) {
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
				if (n && this.db._maxKey !== Lt) {
					var r = n.keyPath.slice(0, t.length);
					return this.where(r).equals(r.map(function(t) {
						return e[t];
					}));
				}
				!n && Pe && console.warn(`The query ${JSON.stringify(e)} on ${this.name} would benefit from a compound index [${t.join("+")}]`);
				var i = this.schema.idxByName;
				function s(e, t) {
					return Yt(e, t) === 0;
				}
				var c = t.reduce(function(t, n) {
					var r = t[0], a = t[1], c = i[n], l = e[n];
					return [r || c, r || !c ? Gt(a, c && c.multi ? function(e) {
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
				this.schema.mappedClass = e, e.prototype instanceof Jt && (e = function(e) {
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
				return a && i && (o = qt(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "add",
						keys: t == null ? null : [t],
						values: [o]
					});
				}).then(function(e) {
					return e.numFailures ? P.reject(e.failures[0]) : e.lastResult;
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
						return nn(o, t), r && w(o, r, e), n.core.mutate({
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
							return e.numFailures ? P.reject(e.failures[0]) : !!a;
						});
					});
				});
			}, e.prototype.update = function(e, t) {
				if (typeof e == "object" && !o(e)) {
					var n = C(e, this.schema.primKey.keyPath);
					return n === void 0 ? Pt(new j.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(n).modify(t);
				}
				return this.where(":id").equals(e).modify(t);
			}, e.prototype.put = function(e, t) {
				var n = this, r = this.schema.primKey, i = r.auto, a = r.keyPath, o = e;
				return a && i && (o = qt(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "put",
						values: [o],
						keys: t == null ? null : [t]
					});
				}).then(function(e) {
					return e.numFailures ? P.reject(e.failures[0]) : e.lastResult;
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
						return en(t, [e], n);
					}).then(function(e) {
						return e.numFailures ? P.reject(e.failures[0]) : void 0;
					});
				});
			}, e.prototype.clear = function() {
				var e = this;
				return this._trans("readwrite", function(t) {
					return e.core.mutate({
						trans: t,
						type: "deleteRange",
						range: Kt
					}).then(function(t) {
						return en(e, null, t);
					});
				}).then(function(e) {
					return e.numFailures ? P.reject(e.failures[0]) : void 0;
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
					if (s && i) throw new j.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new j.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(qt(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "add",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new ye(`${r.name}.bulkAdd(): ${t} of ${c} operations failed`, o);
					});
				});
			}, e.prototype.bulkPut = function(e, t, n) {
				var r = this, i = Array.isArray(t) ? t : void 0;
				n ||= i ? void 0 : t;
				var a = n ? n.allKeys : void 0;
				return this._trans("readwrite", function(t) {
					var n = r.schema.primKey, o = n.auto, s = n.keyPath;
					if (s && i) throw new j.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new j.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(qt(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "put",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new ye(`${r.name}.bulkPut(): ${t} of ${c} operations failed`, o);
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
								if (!l && Yt(u(a), n) !== 0) throw new j.Constraint("Cannot update primary key in bulkUpdate()");
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
							throw new ye(`${t.name}.bulkUpdate(): ${n} of ${p} operations failed`, r);
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
						return en(t, e, n);
					});
				}).then(function(e) {
					var r = e.numFailures, i = e.lastResult, a = e.failures;
					if (r === 0) return i;
					throw new ye(`${t.name}.bulkDelete(): ${r} of ${n} operations failed`, a);
				});
			}, e;
		}();
		function an(e) {
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
				r ||= Me, i ||= Te;
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
					else if (n === "asap") var r = s(t, Ee, function() {
						for (var e = arguments.length, t = Array(e); e--;) t[e] = arguments[e];
						r.subscribers.forEach(function(e) {
							x(function() {
								e.apply(null, t);
							});
						});
					});
					else throw new j.InvalidArgument("Invalid event config");
				});
			}
		}
		function on(e, t) {
			return m(t).from({ prototype: e }), t;
		}
		function sn(e) {
			return on(rn.prototype, function(t, n, r) {
				this.db = e, this._tx = r, this.name = t, this.schema = n, this.hook = e._allTables[t] ? e._allTables[t].hook : an(null, {
					creating: [ke, Te],
					reading: [De, Ee],
					updating: [je, Te],
					deleting: [Ae, Te]
				});
			});
		}
		function cn(e, t) {
			return !(e.filter || e.algorithm || e.or) && (t ? e.justLimit : !e.replayFilter);
		}
		function ln(e, t) {
			e.filter = Gt(e.filter, t);
		}
		function un(e, t, n) {
			var r = e.replayFilter;
			e.replayFilter = r ? function() {
				return Gt(r(), t());
			} : t, e.justLimit = n && !r;
		}
		function dn(e, t) {
			e.isMatch = Gt(e.isMatch, t);
		}
		function fn(e, t) {
			if (e.isPrimKey) return t.primaryKey;
			var n = t.getIndexByKeyPath(e.index);
			if (!n) throw new j.Schema("KeyPath " + e.index + " on object store " + t.name + " is not indexed");
			return n;
		}
		function pn(e, t, n) {
			var r = fn(e, t.schema);
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
		function mn(e, t, n, r) {
			var i = e.replayFilter ? Gt(e.filter, e.replayFilter()) : e.filter;
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
				return Promise.all([e.or._iterate(o, n), hn(pn(e, r, n), e.algorithm, o, !e.keysOnly && e.valueMapper)]);
			}
			return hn(pn(e, r, n), Gt(e.algorithm, i), t, !e.keysOnly && e.valueMapper);
		}
		function hn(e, t, n, r) {
			var i = gt(r ? function(e, t, i) {
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
						e.stop(t), n = Te;
					}, function(t) {
						e.fail(t), n = Te;
					})) && i(e.value, e, function(e) {
						return n = e;
					}), n();
				});
			});
		}
		var gn = function() {
			function e() {}
			return e.prototype._read = function(e, t) {
				var n = this._ctx;
				return n.error ? n.table._trans(null, Pt.bind(null, n.error)) : n.table._trans("readonly", e).then(t);
			}, e.prototype._write = function(e) {
				var t = this._ctx;
				return t.error ? t.table._trans(null, Pt.bind(null, t.error)) : t.table._trans("readwrite", e, "locked");
			}, e.prototype._addAlgorithm = function(e) {
				var t = this._ctx;
				t.algorithm = Gt(t.algorithm, e);
			}, e.prototype._iterate = function(e, t) {
				return mn(this._ctx, e, t, this._ctx.table.core);
			}, e.prototype.clone = function(e) {
				var t = Object.create(this.constructor.prototype), n = Object.create(this._ctx);
				return e && s(n, e), t._ctx = n, t;
			}, e.prototype.raw = function() {
				return this._ctx.valueMapper = null, this;
			}, e.prototype.each = function(e) {
				var t = this._ctx;
				return this._read(function(n) {
					return mn(t, e, n, t.table.core);
				});
			}, e.prototype.count = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx, r = n.table.core;
					if (cn(n, !0)) return r.count({
						trans: e,
						query: {
							index: fn(n, r.schema),
							range: n.range
						}
					}).then(function(e) {
						return Math.min(e, n.limit);
					});
					var i = 0;
					return mn(n, function() {
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
					return Yt(a(e, i), a(t, i)) * o;
				}
				return this.toArray(function(e) {
					return e.slice().sort(s);
				}).then(t);
			}, e.prototype.toArray = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx;
					if (cn(n, !0) && n.limit > 0) {
						var r = n.valueMapper, i = fn(n, n.table.core.schema);
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
					return mn(n, function(e) {
						return a.push(e);
					}, e, n.table.core).then(function() {
						return a;
					});
				}, e);
			}, e.prototype.offset = function(e) {
				var t = this._ctx;
				return e <= 0 || (t.offset += e, cn(t) ? un(t, function() {
					var t = e;
					return function(e, n) {
						return t === 0 ? !0 : t === 1 ? (--t, !1) : (n(function() {
							e.advance(t), t = 0;
						}), !1);
					};
				}) : un(t, function() {
					var t = e;
					return function() {
						return --t < 0;
					};
				})), this;
			}, e.prototype.limit = function(e) {
				return this._ctx.limit = Math.min(this._ctx.limit, e), un(this._ctx, function() {
					var t = e;
					return function(e, n, r) {
						return --t <= 0 && n(r), t >= 0;
					};
				}, !0), this;
			}, e.prototype.until = function(e, t) {
				return ln(this._ctx, function(n, r, i) {
					return !e(n.value) || (r(i), t);
				}), this;
			}, e.prototype.first = function(e) {
				return this.limit(1).toArray(function(e) {
					return e[0];
				}).then(e);
			}, e.prototype.last = function(e) {
				return this.reverse().first(e);
			}, e.prototype.filter = function(e) {
				return ln(this._ctx, function(t) {
					return e(t.value);
				}), dn(this._ctx, e), this;
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
				if (cn(t, !0) && t.limit > 0) return this._read(function(e) {
					var n = fn(t, t.table.core.schema);
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
				return ln(this._ctx, function(e) {
					var t = e.primaryKey.toString(), r = u(n, t);
					return n[t] = !0, !r;
				}), this;
			}, e.prototype.modify = function(e) {
				var t = this, n = this._ctx;
				return this._write(function(r) {
					var i = typeof e == "function" ? e : function(t) {
						return nn(t, e);
					}, o = n.table.core, s = o.schema.primaryKey, c = s.outbound, l = s.extractKey, u = 200, d = t.db._options.modifyChunkSize;
					d && (u = typeof d == "object" ? d[o.name] || d["*"] || 200 : d);
					var f = [], p = 0, m = [], h = function(e, t) {
						var n = t.failures, r = t.numFailures;
						p += e - r;
						for (var i = 0, o = a(n); i < o.length; i++) {
							var s = o[i];
							f.push(n[s]);
						}
					}, g = e === _n;
					return t.clone().primaryKeys().then(function(t) {
						var a = cn(n) && n.limit === Infinity && (typeof e != "function" || g) && {
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
									i.call(C, C.value, C) !== !1 && (C.value == null ? b.push(t[d + x]) : !c && Yt(l(S), l(C.value)) !== 0 ? (b.push(t[d + x]), _.push(C.value)) : (v.push(C.value), c && y.push(t[d + x])));
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
										return en(n.table, b, e);
									}).then(function(e) {
										return h(b.length, e);
									});
								}).then(function() {
									return t.length > d + f && s(d + u);
								});
							});
						};
						return s(0).then(function() {
							if (f.length > 0) throw new ve("Error modifying one or more objects", f, p, m);
							return t.length;
						});
					});
				});
			}, e.prototype.delete = function() {
				var e = this._ctx, t = e.range;
				return cn(e) && !e.table.schema.yProps && (e.isPrimKey || t.type === 3) ? this._write(function(n) {
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
							if (r) throw new ve("Could not delete some values", Object.keys(n).map(function(e) {
								return n[e];
							}), t - r);
							return t - r;
						});
					});
				}) : this.modify(_n);
			}, e;
		}(), _n = function(e, t) {
			return t.value = null;
		};
		function vn(e) {
			return on(gn.prototype, function(t, n) {
				this.db = e;
				var r = Kt, i = null;
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
					valueMapper: s === Ee ? null : s
				};
			});
		}
		function yn(e, t) {
			return e < t ? -1 : e === t ? 0 : 1;
		}
		function bn(e, t) {
			return e > t ? -1 : e === t ? 0 : 1;
		}
		function F(e, t, n) {
			var r = e instanceof Dn ? new e.Collection(e) : e;
			return r._ctx.error = n ? new n(t) : TypeError(t), r;
		}
		function xn(e) {
			var t = new e.Collection(e, function() {
				return En("");
			});
			return t._addAlgorithm(function() {
				return !1;
			}), t;
		}
		function Sn(e) {
			return e === "next" ? function(e) {
				return e.toUpperCase();
			} : function(e) {
				return e.toLowerCase();
			};
		}
		function Cn(e) {
			return e === "next" ? function(e) {
				return e.toLowerCase();
			} : function(e) {
				return e.toUpperCase();
			};
		}
		function wn(e, t, n, r, i, a) {
			for (var o = Math.min(e.length, r.length), s = -1, c = 0; c < o; ++c) {
				var l = t[c];
				if (l !== r[c]) return i(e[c], n[c]) < 0 ? e.substr(0, c) + n[c] + n.substr(c + 1) : i(e[c], r[c]) < 0 ? e.substr(0, c) + r[c] + n.substr(c + 1) : s >= 0 ? e.substr(0, s) + t[s] + n.substr(s + 1) : null;
				i(e[c], l) < 0 && (s = c);
			}
			return o < r.length && a === "next" ? e + n.substr(e.length) : o < e.length && a === "prev" ? e.substr(0, n.length) : s < 0 ? null : e.substr(0, s) + r[s] + n.substr(s + 1);
		}
		function I(e, t, n, r) {
			var i, a, o, s, c, l, u, d = n.length;
			if (!n.every(function(e) {
				return typeof e == "string";
			})) return F(e, Bt);
			function f(e) {
				i = Sn(e), a = Cn(e), o = e === "next" ? yn : bn;
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
					var g = wn(i, f, s[h], c[h], o, l);
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
					return this._cmp(e, t) > 0 || this._cmp(e, t) === 0 && (n || r) && !(n && r) ? xn(this) : new this.Collection(this, function() {
						return Tn(e, t, !n, !r);
					});
				} catch {
					return F(this, zt);
				}
			}, e.prototype.equals = function(e) {
				return e == null ? F(this, zt) : new this.Collection(this, function() {
					return En(e);
				});
			}, e.prototype.above = function(e) {
				return e == null ? F(this, zt) : new this.Collection(this, function() {
					return Tn(e, void 0, !0);
				});
			}, e.prototype.aboveOrEqual = function(e) {
				return e == null ? F(this, zt) : new this.Collection(this, function() {
					return Tn(e, void 0, !1);
				});
			}, e.prototype.below = function(e) {
				return e == null ? F(this, zt) : new this.Collection(this, function() {
					return Tn(void 0, e, !1, !0);
				});
			}, e.prototype.belowOrEqual = function(e) {
				return e == null ? F(this, zt) : new this.Collection(this, function() {
					return Tn(void 0, e);
				});
			}, e.prototype.startsWith = function(e) {
				return typeof e == "string" ? this.between(e, e + Lt, !0, !0) : F(this, Bt);
			}, e.prototype.startsWithIgnoreCase = function(e) {
				return e === "" ? this.startsWith(e) : I(this, function(e, t) {
					return e.indexOf(t[0]) === 0;
				}, [e], Lt);
			}, e.prototype.equalsIgnoreCase = function(e) {
				return I(this, function(e, t) {
					return e === t[0];
				}, [e], "");
			}, e.prototype.anyOfIgnoreCase = function() {
				var e = ue.apply(le, arguments);
				return e.length === 0 ? xn(this) : I(this, function(e, t) {
					return t.indexOf(e) !== -1;
				}, e, "");
			}, e.prototype.startsWithAnyOfIgnoreCase = function() {
				var e = ue.apply(le, arguments);
				return e.length === 0 ? xn(this) : I(this, function(e, t) {
					return t.some(function(t) {
						return e.indexOf(t) === 0;
					});
				}, e, Lt);
			}, e.prototype.anyOf = function() {
				var e = this, t = ue.apply(le, arguments), n = this._cmp;
				try {
					t.sort(n);
				} catch {
					return F(this, zt);
				}
				if (t.length === 0) return xn(this);
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
				return this.inAnyRange([[Rt, e], [e, this.db._maxKey]], {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.noneOf = function() {
				var e = ue.apply(le, arguments);
				if (e.length === 0) return new this.Collection(this);
				try {
					e.sort(this._ascending);
				} catch {
					return F(this, zt);
				}
				var t = e.reduce(function(e, t) {
					return e ? e.concat([[e[e.length - 1][1], t]]) : [[Rt, t]];
				}, null);
				return t.push([e[e.length - 1], this.db._maxKey]), this.inAnyRange(t, {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.inAnyRange = function(e, t) {
				var n = this, r = this._cmp, i = this._ascending, a = this._descending, o = this._min, s = this._max;
				if (e.length === 0) return xn(this);
				if (!e.every(function(e) {
					return e[0] !== void 0 && e[1] !== void 0 && i(e[0], e[1]) <= 0;
				})) return F(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", j.InvalidArgument);
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
					return F(this, zt);
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
				var e = ue.apply(le, arguments);
				return e.every(function(e) {
					return typeof e == "string";
				}) ? e.length === 0 ? xn(this) : this.inAnyRange(e.map(function(e) {
					return [e, e + Lt];
				})) : F(this, "startsWithAnyOf() only works with strings");
			}, e;
		}();
		function On(e) {
			return on(Dn.prototype, function(t, n, r) {
				if (this.db = e, this._ctx = {
					table: t,
					index: n === ":id" ? null : n,
					or: r
				}, this._cmp = this._ascending = Yt, this._descending = function(e, t) {
					return Yt(t, e);
				}, this._max = function(e, t) {
					return Yt(e, t) > 0 ? e : t;
				}, this._min = function(e, t) {
					return Yt(e, t) < 0 ? e : t;
				}, this._IDBKeyRange = e._deps.IDBKeyRange, !this._IDBKeyRange) throw new j.MissingAPI();
			});
		}
		function L(e) {
			return gt(function(t) {
				return kn(t), e(t.target.error), !1;
			});
		}
		function kn(e) {
			e.stopPropagation && e.stopPropagation(), e.preventDefault && e.preventDefault();
		}
		var An = "storagemutated", jn = "x-storagemutated-1", Mn = an(null, An), Nn = function() {
			function e() {}
			return e.prototype._lock = function() {
				return b(!N.global), ++this._reculock, this._reculock === 1 && !N.global && (N.lockOwnerFor = this), this;
			}, e.prototype._unlock = function() {
				if (b(!N.global), --this._reculock === 0) for (N.global || (N.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked();) {
					var e = this._blockedFuncs.shift();
					try {
						jt(e[1], e[0]);
					} catch {}
				}
				return this;
			}, e.prototype._locked = function() {
				return this._reculock && N.lockOwnerFor !== this;
			}, e.prototype.create = function(e) {
				var t = this;
				if (!this.mode) return this;
				var n = this.db.idbdb, r = this.db._state.dbOpenError;
				if (b(!this.idbtrans), !e && !n) switch (r && r.name) {
					case "DatabaseClosedError": throw new j.DatabaseClosed(r);
					case "MissingAPIError": throw new j.MissingAPI(r.message, r);
					default: throw new j.OpenFailed(r);
				}
				if (!this.active) throw new j.TransactionInactive();
				return b(this._completion._state === null), e = this.idbtrans = e || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : n.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })), e.onerror = gt(function(n) {
					kn(n), t._reject(e.error);
				}), e.onabort = gt(function(n) {
					kn(n), t.active && t._reject(new j.Abort(e.error)), t.active = !1, t.on("abort").fire(n);
				}), e.oncomplete = gt(function() {
					t.active = !1, t._resolve(), "mutatedParts" in e && Mn.storagemutated.fire(e.mutatedParts);
				}), this;
			}, e.prototype._promise = function(e, t, n) {
				var r = this;
				if (e === "readwrite" && this.mode !== "readwrite") return Pt(new j.ReadOnly("Transaction is readonly"));
				if (!this.active) return Pt(new j.TransactionInactive());
				if (this._locked()) return new P(function(i, a) {
					r._blockedFuncs.push([function() {
						r._promise(e, t, n).then(i, a);
					}, N]);
				});
				if (n) return Ct(function() {
					var e = new P(function(e, n) {
						r._lock();
						var i = t(e, n, r);
						i && i.then && i.then(e, n);
					});
					return e.finally(function() {
						return r._unlock();
					}), e._lib = !0, e;
				});
				var i = new P(function(e, n) {
					var i = t(e, n, r);
					i && i.then && i.then(e, n);
				});
				return i._lib = !0, i;
			}, e.prototype._root = function() {
				return this.parent ? this.parent._root() : this;
			}, e.prototype.waitFor = function(e) {
				var t = this._root(), n = P.resolve(e);
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
				return new P(function(e, r) {
					n.then(function(n) {
						return t._waitingQueue.push(gt(e.bind(null, n)));
					}, function(e) {
						return t._waitingQueue.push(gt(r.bind(null, e)));
					}).finally(function() {
						t._waitingFor === i && (t._waitingFor = null);
					});
				});
			}, e.prototype.abort = function() {
				this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new j.Abort()));
			}, e.prototype.table = function(e) {
				var t = this._memoizedTables ||= {};
				if (u(t, e)) return t[e];
				var n = this.schema[e];
				if (!n) throw new j.NotFound("Table " + e + " not part of transaction");
				var r = new this.db.Table(e, n, this);
				return r.core = this.db.core.table(e), t[e] = r, r;
			}, e;
		}();
		function Pn(e) {
			return on(Nn.prototype, function(t, n, r, i, a) {
				var o = this;
				t !== "readonly" && n.forEach(function(e) {
					var t = r[e]?.yProps;
					t && (n = n.concat(t.map(function(e) {
						return e.updatesTable;
					})));
				}), this.db = e, this.mode = t, this.storeNames = n, this.schema = r, this.chromeTransactionDurability = i, this.idbtrans = null, this.on = an(this, "complete", "error", "abort"), this.parent = a || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new P(function(e, t) {
					o._resolve = e, o._reject = t;
				}), this._completion.then(function() {
					o.active = !1, o.on.complete.fire();
				}, function(e) {
					var t = o.active;
					return o.active = !1, o.on.error.fire(e), o.parent ? o.parent._reject(e) : t && o.idbtrans && o.idbtrans.abort(), Pt(e);
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
		function Rn(e) {
			return e.length === 1 ? e[0] : e;
		}
		var zn = function(e) {
			try {
				return e.only([[]]), zn = function() {
					return [[]];
				}, [[]];
			} catch {
				return zn = function() {
					return Lt;
				}, Lt;
			}
		};
		function Bn(e) {
			return e == null ? function() {} : typeof e == "string" ? Vn(e) : function(t) {
				return C(t, e);
			};
		}
		function Vn(e) {
			return e.split(".").length === 1 ? function(t) {
				return t[e];
			} : function(t) {
				return C(t, e);
			};
		}
		function Hn(e) {
			return [].slice.call(e);
		}
		var Un = 0;
		function Wn(e) {
			return e == null ? ":id" : typeof e == "string" ? e : `[${e.join("+")}]`;
		}
		function Gn(e, t, n) {
			function r(e, t) {
				var n = Hn(e.objectStoreNames), r = n.length > 0 ? t.objectStore(n[0]) : {};
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
									extractKey: Bn(t)
								},
								indexes: Hn(e.indexNames).map(function(t) {
									return e.index(t);
								}).map(function(e) {
									var t = e.name, n = e.unique, r = e.multiEntry, i = e.keyPath, s = {
										name: t,
										compound: o(i),
										keyPath: i,
										unique: n,
										multiEntry: r,
										extractKey: Bn(i)
									};
									return a[Wn(i)] = s, s;
								}),
								getIndexByKeyPath: function(e) {
									return a[Wn(e)];
								}
							};
							return a[":id"] = s.primaryKey, t != null && (a[Wn(t)] = s.primaryKey), s;
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
						e = gt(e);
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
							++g, kn(e);
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
						e = gt(e);
						var l = a.index, u = a.range, d = n.objectStore(t), f = l.isPrimaryKey ? d : d.index(l.name), p = o ? s ? "prevunique" : "prev" : s ? "nextunique" : "next", m = r || !("openKeyCursor" in f) ? f.openCursor(i(u), p) : f.openKeyCursor(i(u), p);
						m.onerror = L(c), m.onsuccess = gt(function(t) {
							var r = m.result;
							if (!r) e(null);
							else {
								r.___id = ++Un, r.done = !1;
								var i = r.continue.bind(r), a = r.continuePrimaryKey;
								a &&= a.bind(r);
								var o = r.advance.bind(r), s = function() {
									throw Error("Cursor not started");
								}, l = function() {
									throw Error("Cursor not stopped");
								};
								r.trans = n, r.stop = r.continue = r.continuePrimaryKey = r.advance = s, r.fail = gt(c), r.next = function() {
									var e = this, t = 1;
									return this.start(function() {
										return t-- ? e.continue() : e.stop();
									}).then(function() {
										return e;
									});
								}, r.start = function(e) {
									var t = new Promise(function(e, t) {
										e = gt(e), m.onerror = L(t), r.fail = t, r.stop = function(t) {
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
									return m.onsuccess = gt(function(e) {
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
							a = gt(a);
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
								}, y.onerror = L(o);
							} else if (e && d === "next") {
								var y = c ? g.getAll(_, f) : g.getAllKeys(_, f);
								y.onsuccess = function(e) {
									return a({ result: e.target.result });
								}, y.onerror = L(o);
							} else {
								var b = 0, x = c || !("openKeyCursor" in g) ? g.openCursor(_, d) : g.openKeyCursor(_, d), S = [];
								x.onsuccess = function() {
									var e = x.result;
									if (!e || (S.push(c ? e.value : e.primaryKey), ++b === l)) return a({ result: S });
									e.continue();
								}, x.onerror = L(o);
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
							e = gt(e);
							for (var a = n.objectStore(t), o = r.length, s = Array(o), c = 0, l = 0, u, d = function(t) {
								var n = t.target;
								s[n._pos] = n.result, ++l === c && e(s);
							}, f = L(i), p = 0; p < o; ++p) r[p] != null && (u = a.get(r[p]), u._pos = p, u.onsuccess = d, u.onerror = f, ++c);
							c === 0 && e(s);
						});
					},
					get: function(e) {
						var n = e.trans, r = e.key;
						return new Promise(function(e, i) {
							e = gt(e);
							var a = n.objectStore(t).get(r);
							a.onsuccess = function(t) {
								return e(t.target.result);
							}, a.onerror = L(i);
						});
					},
					query: a(l, u),
					openCursor: r,
					count: function(e) {
						var n = e.query, r = e.trans, a = n.index, o = n.range;
						return new Promise(function(e, n) {
							var s = r.objectStore(t), c = a.isPrimaryKey ? s : s.index(a.name), l = i(o), u = l ? c.count(l) : c.count();
							u.onsuccess = gt(function(t) {
								return e(t.target.result);
							}), u.onerror = L(n);
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
				MAX_KEY: zn(t),
				schema: c
			};
		}
		function Kn(e, t) {
			return t.reduce(function(e, t) {
				var r = t.create;
				return n(n({}, e), r(e));
			}, e);
		}
		function qn(e, t, n, r) {
			var i = n.IDBKeyRange;
			return n.indexedDB, { dbcore: Kn(Gn(t, i, r), e.dbcore) };
		}
		function Jn(e, t) {
			var n = t.db;
			e.core = qn(e._middlewares, n, e._deps, t).dbcore, e.tables.forEach(function(t) {
				var n = t.name;
				e.core.schema.tables.some(function(e) {
					return e.name === n;
				}) && (t.core = e.core.table(n), e[n] instanceof e.Table && (e[n].core = t.core));
			});
		}
		function Yn(e, t, n, r) {
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
		function Xn(e, t) {
			t.forEach(function(t) {
				for (var n in t) t[n] instanceof e.Table && delete t[n];
			});
		}
		function Zn(e, t) {
			return e._cfg.version - t._cfg.version;
		}
		function Qn(e, t, n, r) {
			var i = e._dbSchema;
			n.objectStoreNames.contains("$meta") && !i.$meta && (i.$meta = Ln("$meta", dr("")[0], []), e._storeNames.push("$meta"));
			var o = e._createTransaction("readwrite", e._storeNames, i);
			o.create(n), o._completion.catch(r);
			var s = o._reject.bind(o), c = N.transless || N;
			Ct(function() {
				if (N.trans = o, N.transless = c, t === 0) a(i).forEach(function(e) {
					rr(n, e, i[e].primKey, i[e].indexes);
				}), Jn(e, n), P.follow(function() {
					return e.on.populate.fire(o);
				}).catch(s);
				else return Jn(e, n), er(e, o, t).then(function(t) {
					return tr(e, t, o, n);
				}).catch(s);
			});
		}
		function $n(e, t) {
			ir(e._dbSchema, t), t.db.version % 10 == 0 && !t.objectStoreNames.contains("$meta") && t.db.createObjectStore("$meta").add(Math.ceil(t.db.version / 10 - 1), "version");
			var n = sr(e, e.idbdb, t);
			ur(e, e._dbSchema, t);
			for (var r = nr(n, e._dbSchema), i = function(e) {
				if (e.change.length || e.recreate) return console.warn(`Unable to patch indexes of table ${e.name} because it has changes on the type of index or primary key.`), { value: void 0 };
				var n = t.objectStore(e.name);
				e.add.forEach(function(t) {
					Pe && console.debug(`Dexie upgrade patch: Creating missing index ${e.name}.${t.src}`), or(n, t);
				});
			}, a = 0, o = r.change; a < o.length; a++) {
				var s = o[a], c = i(s);
				if (typeof c == "object") return c.value;
			}
		}
		function er(e, t, n) {
			return t.storeNames.includes("$meta") ? t.table("$meta").get("version").then(function(e) {
				return e ?? n;
			}) : P.resolve(n);
		}
		function tr(e, t, n, r) {
			var i = [], o = e._versions, s = e._dbSchema = sr(e, e.idbdb, r), c = o.filter(function(e) {
				return e._cfg.version >= t;
			});
			if (c.length === 0) return P.resolve();
			c.forEach(function(o) {
				i.push(function() {
					var i = s, c = o._cfg.dbschema;
					ur(e, i, r), ur(e, c, r), s = e._dbSchema = c;
					var l = nr(i, c);
					l.add.forEach(function(e) {
						rr(r, e[0], e[1].primKey, e[1].indexes);
					}), l.change.forEach(function(e) {
						if (e.recreate) throw new j.Upgrade("Not yet support for changing primary key");
						var t = r.objectStore(e.name);
						e.add.forEach(function(e) {
							return or(t, e);
						}), e.change.forEach(function(e) {
							t.deleteIndex(e.name), or(t, e);
						}), e.del.forEach(function(e) {
							return t.deleteIndex(e);
						});
					});
					var u = o._cfg.contentUpgrade;
					if (u && o._cfg.version > t) {
						Jn(e, r), n._memoizedTables = {};
						var d = ee(c);
						l.del.forEach(function(e) {
							d[e] = i[e];
						}), Xn(e, [e.Transaction.prototype]), Yn(e, [e.Transaction.prototype], a(d), d), n.schema = d;
						var f = de(u);
						f && wt();
						var p, m = P.follow(function() {
							if (p = u(n), p && f) {
								var e = Tt.bind(null, null);
								p.then(e, e);
							}
						});
						return p && typeof p.then == "function" ? P.resolve(p) : m.then(function() {
							return p;
						});
					}
				}), i.push(function(t) {
					var r = o._cfg.dbschema;
					ar(r, t), Xn(e, [e.Transaction.prototype]), Yn(e, [e.Transaction.prototype], e._storeNames, e._dbSchema), n.schema = e._dbSchema;
				}), i.push(function(t) {
					e.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(e.idbdb.version / 10) === o._cfg.version ? (e.idbdb.deleteObjectStore("$meta"), delete e._dbSchema.$meta, e._storeNames = e._storeNames.filter(function(e) {
						return e !== "$meta";
					})) : t.objectStore("$meta").put(o._cfg.version, "version"));
				});
			});
			function l() {
				return i.length ? P.resolve(i.shift()(n.idbtrans)).then(l) : P.resolve();
			}
			return l().then(function() {
				ir(s, r);
			});
		}
		function nr(e, t) {
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
		function rr(e, t, n, r) {
			var i = e.db.createObjectStore(t, n.keyPath ? {
				keyPath: n.keyPath,
				autoIncrement: n.auto
			} : { autoIncrement: n.auto });
			return r.forEach(function(e) {
				return or(i, e);
			}), i;
		}
		function ir(e, t) {
			a(e).forEach(function(n) {
				t.db.objectStoreNames.contains(n) || (Pe && console.debug("Dexie: Creating missing table", n), rr(t, n, e[n].primKey, e[n].indexes));
			});
		}
		function ar(e, t) {
			[].slice.call(t.db.objectStoreNames).forEach(function(n) {
				return e[n] == null && t.db.deleteObjectStore(n);
			});
		}
		function or(e, t) {
			e.createIndex(t.name, t.keyPath, {
				unique: t.unique,
				multiEntry: t.multi
			});
		}
		function sr(e, t, n) {
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
		function cr(e, t, n) {
			e.verno = t.version / 10;
			var r = e._dbSchema = sr(e, t, n);
			e._storeNames = v(t.objectStoreNames, 0), Yn(e, [e._allTables], a(r), r);
		}
		function lr(e, t) {
			var n = nr(sr(e, e.idbdb, t), e._dbSchema);
			return !(n.add.length || n.change.some(function(e) {
				return e.add.length || e.change.length;
			}));
		}
		function ur(e, t, n) {
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
		function dr(e) {
			return e.split(",").map(function(e, t) {
				var n = e.split(":"), r = n[1]?.trim();
				e = n[0].trim();
				var i = e.replace(/([&*]|\+\+)/g, ""), a = /^\[/.test(i) ? i.match(/^\[(.*)\]$/)[1].split("+") : i;
				return Fn(i, a || null, /\&/.test(e), /\*/.test(e), /\+\+/.test(e), o(a), t === 0, r);
			});
		}
		var fr = function() {
			function e() {}
			return e.prototype._createTableSchema = function(e, t, n) {
				return Ln(e, t, n);
			}, e.prototype._parseIndexSyntax = function(e) {
				return dr(e);
			}, e.prototype._parseStoresSpec = function(e, t) {
				var n = this;
				a(e).forEach(function(r) {
					if (e[r] !== null) {
						var i = n._parseIndexSyntax(e[r]), a = i.shift();
						if (!a) throw new j.Schema("Invalid schema for table " + r + ": " + e[r]);
						if (a.unique = !0, a.multi) throw new j.Schema("Primary key cannot be multiEntry*");
						i.forEach(function(e) {
							if (e.auto) throw new j.Schema("Only primary key can be marked as autoIncrement (++)");
							if (!e.keyPath) throw new j.Schema("Index must have a name and cannot be an empty string");
						}), t[r] = n._createTableSchema(r, a, i);
					}
				});
			}, e.prototype.stores = function(e) {
				var t = this.db;
				this._cfg.storesSource = this._cfg.storesSource ? s(this._cfg.storesSource, e) : e;
				var n = t._versions, r = {}, i = {};
				return n.forEach(function(e) {
					s(r, e._cfg.storesSource), i = e._cfg.dbschema = {}, e._parseStoresSpec(r, i);
				}), t._dbSchema = i, Xn(t, [
					t._allTables,
					t,
					t.Transaction.prototype
				]), Yn(t, [
					t._allTables,
					t,
					t.Transaction.prototype,
					this._cfg.tables
				], a(i), i), t._storeNames = a(i), this;
			}, e.prototype.upgrade = function(e) {
				return this._cfg.contentUpgrade = Ne(this._cfg.contentUpgrade || Te, e), this;
			}, e;
		}();
		function pr(e) {
			return on(fr.prototype, function(t) {
				this.db = e, this._cfg = {
					version: t,
					storesSource: null,
					dbschema: {},
					tables: {},
					contentUpgrade: null
				};
			});
		}
		var mr = hr();
		function hr() {
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
		function gr(e, t) {
			var n = e._dbNamesDB;
			return n || (n = e._dbNamesDB = new gi(Ht, {
				addons: [],
				indexedDB: e,
				IDBKeyRange: t
			}), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
		}
		function _r(e) {
			return e && typeof e.databases == "function";
		}
		function vr(e) {
			var t = e.indexedDB, n = e.IDBKeyRange;
			return _r(t) ? Promise.resolve(t.databases()).then(function(e) {
				return e.map(function(e) {
					return e.name;
				}).filter(function(e) {
					return e !== Ht;
				});
			}) : gr(t, n).toCollection().primaryKeys();
		}
		function yr(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!_r(n) && t !== Ht && gr(n, r).put({ name: t }).catch(Te);
		}
		function br(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!_r(n) && t !== Ht && gr(n, r).delete(t).catch(Te);
		}
		function xr(e) {
			return Ct(function() {
				return N.letThrough = !0, e();
			});
		}
		function Sr() {
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
		var Cr;
		function wr(e) {
			return !("from" in e);
		}
		var Tr = function(e, t) {
			if (this) s(this, arguments.length ? {
				d: 1,
				from: e,
				to: arguments.length > 1 ? t : e
			} : { d: 0 });
			else {
				var n = new Tr();
				return e && "d" in e && s(n, e), n;
			}
		};
		d(Tr.prototype, (Cr = {
			add: function(e) {
				return Dr(this, e), this;
			},
			addKey: function(e) {
				return Er(this, e, e), this;
			},
			addKeys: function(e) {
				var t = this;
				return e.forEach(function(e) {
					return Er(t, e, e);
				}), this;
			},
			hasKey: function(e) {
				var t = kr(this).next(e).value;
				return t && Yt(t.from, e) <= 0 && Yt(t.to, e) >= 0;
			}
		}, Cr[A] = function() {
			return kr(this);
		}, Cr));
		function Er(e, t, n) {
			var r = Yt(t, n);
			if (!isNaN(r)) {
				if (r > 0) throw RangeError();
				if (wr(e)) return s(e, {
					from: t,
					to: n,
					d: 1
				});
				var i = e.l, a = e.r;
				if (Yt(n, e.from) < 0) return i ? Er(i, t, n) : e.l = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, Ar(e);
				if (Yt(t, e.to) > 0) return a ? Er(a, t, n) : e.r = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, Ar(e);
				Yt(t, e.from) < 0 && (e.from = t, e.l = null, e.d = a ? a.d + 1 : 1), Yt(n, e.to) > 0 && (e.to = n, e.r = null, e.d = e.l ? e.l.d + 1 : 1);
				var o = !e.r;
				i && !e.l && Dr(e, i), a && o && Dr(e, a);
			}
		}
		function Dr(e, t) {
			function n(e, t) {
				var r = t.from, i = t.to, a = t.l, o = t.r;
				Er(e, r, i), a && n(e, a), o && n(e, o);
			}
			wr(t) || n(e, t);
		}
		function Or(e, t) {
			var n = kr(t), r = n.next();
			if (r.done) return !1;
			for (var i = r.value, a = kr(e), o = a.next(i.from), s = o.value; !r.done && !o.done;) {
				if (Yt(s.from, i.to) <= 0 && Yt(s.to, i.from) >= 0) return !0;
				Yt(i.from, s.from) < 0 ? i = (r = n.next(s.from)).value : s = (o = a.next(i.from)).value;
			}
			return !1;
		}
		function kr(e) {
			var t = wr(e) ? null : {
				s: 0,
				n: e
			};
			return { next: function(e) {
				for (var n = arguments.length > 0; t;) switch (t.s) {
					case 0: if (t.s = 1, n) for (; t.n.l && Yt(e, t.n.from) < 0;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					else for (; t.n.l;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					case 1: if (t.s = 2, !n || Yt(e, t.n.to) <= 0) return {
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
		function Ar(e) {
			var t = (e.r?.d || 0) - (e.l?.d || 0), r = t > 1 ? "r" : t < -1 ? "l" : "";
			if (r) {
				var i = r === "r" ? "l" : "r", a = n({}, e), o = e[r];
				e.from = o.from, e.to = o.to, e[r] = o[r], a[r] = o[i], e[i] = a, a.d = jr(a);
			}
			e.d = jr(e);
		}
		function jr(e) {
			var t = e.r, n = e.l;
			return (t ? n ? Math.max(t.d, n.d) : t.d : n ? n.d : 0) + 1;
		}
		function Mr(e, t) {
			return a(t).forEach(function(n) {
				e[n] ? Dr(e[n], t[n]) : e[n] = ne(t[n]);
			}), e;
		}
		function R(e, t) {
			return e.all || t.all || Object.keys(e).some(function(n) {
				return t[n] && Or(t[n], e[n]);
			});
		}
		var Nr = {}, Pr = {}, Fr = !1;
		function Ir(e, t) {
			Mr(Pr, e), Fr || (Fr = !0, setTimeout(function() {
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
					R(t, p.obsSet) ? p.subscribers.forEach(function(e) {
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
				return t.dbOpenError ? Pt(t.dbOpenError) : e;
			});
			t.isBeingOpened = !0, t.dbOpenError = null, t.openComplete = !1;
			var r = t.openCanceller, a = Math.round(e.verno * 10), o = !1;
			function s() {
				if (t.openCanceller !== r) throw new j.DatabaseClosed("db.open() was cancelled");
			}
			var c = t.dbReadyResolve, l = null, u = !1, d = function() {
				return new P(function(r, i) {
					if (s(), !n) throw new j.MissingAPI();
					var c = e.name, f = t.autoSchema || !a ? n.open(c) : n.open(c, a);
					if (!f) throw new j.MissingAPI();
					f.onerror = L(i), f.onblocked = gt(e._fireOnBlocked), f.onupgradeneeded = gt(function(r) {
						if (l = f.transaction, t.autoSchema && !e._options.allowEmptyDB) {
							f.onerror = kn, l.abort(), f.result.close();
							var a = n.deleteDatabase(c);
							a.onsuccess = a.onerror = gt(function() {
								i(new j.NoSuchDatabase(`Database ${c} doesnt exist`));
							});
						} else {
							l.onerror = L(i);
							var s = r.oldVersion > 2 ** 62 ? 0 : r.oldVersion;
							u = s < 1, e.idbdb = f.result, o && $n(e, l), Qn(e, s / 10, l, i);
						}
					}, i), f.onsuccess = gt(function() {
						l = null;
						var n = e.idbdb = f.result, i = v(n.objectStoreNames);
						if (i.length > 0) try {
							var s = n.transaction(Rn(i), "readonly");
							if (t.autoSchema) cr(e, n, s);
							else if (ur(e, e._dbSchema, s), !lr(e, s) && !o) return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), n.close(), a = n.version + 1, o = !0, r(d());
							Jn(e, s);
						} catch {}
						mr.add(e), n.onversionchange = gt(function(n) {
							t.vcFired = !0, e.on("versionchange").fire(n);
						}), n.onclose = gt(function() {
							e.close({ disableAutoOpen: !1 });
						}), u && yr(e._deps, c), r();
					}, i);
				}).catch(function(e) {
					switch (e?.name) {
						case "UnknownError":
							if (t.PR1398_maxLoop > 0) return t.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), d();
							break;
						case "VersionError": if (a > 0) return a = 0, d();
					}
					return P.reject(e);
				});
			}, f = typeof navigator < "u" && !!n && n === i.indexedDB;
			return P.race([r, (f ? Sr() : P.resolve()).then(d)]).then(function() {
				return s(), t.onReadyBeingFired = [], P.resolve(xr(function() {
					return e.on.ready.fire(e.vip);
				})).then(function n() {
					if (t.onReadyBeingFired.length > 0) {
						var r = t.onReadyBeingFired.reduce(Ne, Te);
						return t.onReadyBeingFired = [], P.resolve(xr(function() {
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
				return r === t.openCanceller && e._close(), Pt(n);
			}).finally(function() {
				t.openComplete = !0, c();
			}).then(function() {
				if (u) {
					var t = {};
					e.tables.forEach(function(n) {
						n.schema.indexes.forEach(function(r) {
							r.name && (t[`idb://${e.name}/${n.name}/${r.name}`] = new Tr(-Infinity, [[[]]]));
						}), t[`idb://${e.name}/${n.name}/`] = t[`idb://${e.name}/${n.name}/:dels`] = new Tr(-Infinity, [[[]]]);
					}), Mn(An).fire(t), Lr(t, !0);
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
			if (r < 2) throw new j.InvalidArgument("Too few arguments");
			for (var i = Array(r - 1); --r;) i[r - 1] = arguments[r];
			return n = i.pop(), [
				e,
				D(i),
				n
			];
		}
		function Hr(e, t, n, r, i) {
			return P.resolve().then(function() {
				var a = N.transless || N, o = e._createTransaction(t, n, e._dbSchema, r);
				o.explicit = !0;
				var s = {
					trans: o,
					transless: a
				};
				if (r) o.idbtrans = r.idbtrans;
				else try {
					o.create(), o.idbtrans._explicit = !0, e._state.PR1398_maxLoop = 3;
				} catch (r) {
					return r.name === be.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
						return Hr(e, t, n, null, i);
					})) : Pt(r);
				}
				var c = de(i);
				c && wt();
				var l, u = P.follow(function() {
					if (l = i.call(o, o), l) {
						if (c) {
							var e = Tt.bind(null, null);
							l.then(e, e);
						} else typeof l.next == "function" && typeof l.throw == "function" && (l = Br(l));
					}
				}, s);
				return (l && typeof l.then == "function" ? P.resolve(l).then(function(e) {
					return o.active ? e : Pt(new j.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
				}) : u.then(function() {
					return l;
				})).then(function(e) {
					return r && o._resolve(), o._completion.then(function() {
						return e;
					});
				}).catch(function(e) {
					return o._reject(e), Pt(e);
				});
			});
		}
		function Ur(e, t, n) {
			for (var r = o(e) ? e.slice() : [e], i = 0; i < n; ++i) r.push(t);
			return r;
		}
		function Wr(e) {
			return n(n({}, e), { table: function(t) {
				var r = e.table(t), i = r.schema, a = Object.create(null), o = [];
				function s(e, t, r) {
					var i = Wn(e), c = a[i] = a[i] || [], l = e == null ? 0 : typeof e == "string" ? 1 : e.length, u = t > 0, d = n(n({}, r), {
						name: u ? `${i}(virtual-from:${r.name})` : r.name,
						lowLevelIndex: r,
						isVirtual: u,
						keyTail: t,
						keyLength: l,
						extractKey: Bn(e),
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
					var t = a[Wn(e)];
					return t && t[0];
				}
				function p(t, n) {
					return {
						type: t.type === 1 ? 2 : t.type,
						lower: Ur(t.lower, t.lowerOpen ? e.MAX_KEY : e.MIN_KEY, n),
						lowerOpen: !0,
						upper: Ur(t.upper, t.upperOpen ? e.MIN_KEY : e.MAX_KEY, n),
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
								r == null ? t.unique ? n.continue(n.key.slice(0, o).concat(t.reverse ? e.MIN_KEY : e.MAX_KEY, i)) : n.continue() : n.continue(Ur(r, t.reverse ? e.MAX_KEY : e.MIN_KEY, i));
							}
							return Object.create(n, {
								continue: { value: r },
								continuePrimaryKey: { value: function(t, r) {
									n.continuePrimaryKey(Ur(t, e.MAX_KEY, i), r);
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
		var Gr = {
			stack: "dbcore",
			name: "VirtualIndexMiddleware",
			level: 1,
			create: Wr
		};
		function Kr(e, t, n, r) {
			return n ||= {}, r ||= "", a(e).forEach(function(i) {
				if (!u(t, i)) n[r + i] = void 0;
				else {
					var a = e[i], o = t[i];
					if (typeof a == "object" && typeof o == "object" && a && o) {
						var s = oe(a);
						s === oe(o) ? s === "Object" ? Kr(a, o, n, r + i + ".") : a !== o && (n[r + i] = t[i]) : n[r + i] = t[i];
					} else a !== o && (n[r + i] = t[i]);
				}
			}), a(t).forEach(function(i) {
				u(e, i) || (n[r + i] = t[i]);
			}), n;
		}
		function qr(e, t) {
			return t.type === "delete" ? t.keys : t.keys || t.values.map(e.extractKey);
		}
		var Jr = {
			stack: "dbcore",
			name: "HooksMiddleware",
			level: 2,
			create: function(e) {
				return n(n({}, e), { table: function(t) {
					var i = e.table(t), a = i.schema.primaryKey;
					return n(n({}, i), { mutate: function(e) {
						var o = N.trans, s = o.table(t).hook, c = s.deleting, l = s.creating, d = s.updating;
						switch (e.type) {
							case "add":
								if (l.fire === Te) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "put":
								if (l.fire === Te && d.fire === Te) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "delete":
								if (c.fire === Te) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "deleteRange":
								if (c.fire === Te) break;
								return o._promise("readwrite", function() {
									return p(e);
								}, !0);
						}
						return i.mutate(e);
						function f(e) {
							var t = N.trans, o = e.keys || qr(a, e);
							if (!o) throw Error("Keys missing");
							return e = e.type === "add" || e.type === "put" ? n(n({}, e), { keys: o }) : n({}, e), e.type !== "delete" && (e.values = r([], e.values, !0)), e.keys && (e.keys = r([], e.keys, !0)), Yr(i, e, o).then(function(n) {
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
										var p = Kr(o, e.values[i]), m = d.fire.call(s, p, r, o, t);
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
		function Yr(e, t, n) {
			return t.type === "add" ? Promise.resolve([]) : e.getMany({
				trans: t.trans,
				keys: n,
				cache: "immutable"
			});
		}
		function Xr(e, t, n) {
			try {
				if (!t || t.keys.length < e.length) return null;
				for (var r = [], i = 0, a = 0; i < t.keys.length && a < e.length; ++i) Yt(t.keys[i], e[a]) === 0 && (r.push(n ? ie(t.values[i]) : t.values[i]), ++a);
				return r.length === e.length ? r : null;
			} catch {
				return null;
			}
		}
		var Zr = {
			stack: "dbcore",
			level: -1,
			create: function(e) {
				return { table: function(t) {
					var r = e.table(t);
					return n(n({}, r), {
						getMany: function(e) {
							if (!e.cache) return r.getMany(e);
							var t = Xr(e.keys, e.trans._cache, e.cache === "clone");
							return t ? P.resolve(t) : r.getMany(e).then(function(t) {
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
		function Qr(e, t) {
			return e.trans.mode === "readonly" && !!e.subscr && !e.trans.explicit && e.trans.db._options.cache !== "disabled" && !t.schema.primaryKey.outbound;
		}
		function $r(e, t) {
			switch (e) {
				case "query": return t.values && !t.unique;
				case "get": return !1;
				case "getMany": return !1;
				case "count": return !1;
				case "openCursor": return !1;
			}
		}
		var ei = {
			stack: "dbcore",
			level: 0,
			name: "Observability",
			create: function(e) {
				var t = e.schema.name, r = new Tr(e.MIN_KEY, e.MAX_KEY);
				return n(n({}, e), {
					transaction: function(t, n, r) {
						if (N.subscr && n !== "readonly") throw new j.ReadOnly(`Readwrite transaction in liveQuery context. Querier source: ${N.querier}`);
						return e.transaction(t, n, r);
					},
					table: function(i) {
						var s = e.table(i), c = s.schema, l = c.primaryKey, u = c.indexes, d = l.extractKey, f = l.outbound, p = l.autoIncrement && u.filter(function(e) {
							return e.compound && e.keyPath.includes(l.keyPath);
						}), m = n(n({}, s), { mutate: function(n) {
							var a = n.trans, u = n.mutatedParts ||= {}, d = function(e) {
								var n = `idb://${t}/${i}/${e}`;
								return u[n] || (u[n] = new Tr());
							}, f = d(""), m = d(":dels"), h = n.type, g = n.type === "deleteRange" ? [n.range] : n.type === "delete" ? [n.keys] : n.values.length < 50 ? [qr(l, n).filter(function(e) {
								return e != null;
							}), n.values] : [], _ = g[0], v = g[1], y = n.trans._cache;
							if (o(_)) {
								f.addKeys(_);
								var b = h === "delete" || _.length === v.length ? Xr(_, y) : null;
								b || m.addKeys(_), (b || v) && ti(d, c, b, v);
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
								})), a.mutatedParts = Mr(a.mutatedParts || {}, u), e;
							});
						} }), h = function(t) {
							var n = t.query, r = n.index, i = n.range;
							return [r, new Tr(i.lower ?? e.MIN_KEY, i.upper ?? e.MAX_KEY)];
						}, g = {
							get: function(e) {
								return [l, new Tr(e.key)];
							},
							getMany: function(e) {
								return [l, new Tr().addKeys(e.keys)];
							},
							count: h,
							query: h,
							openCursor: h
						};
						return a(g).forEach(function(e) {
							m[e] = function(a) {
								var o = N.subscr, c = !!o, l = Qr(N, s) && $r(e, a) ? a.obsSet = {} : o;
								if (c) {
									var u = function(e) {
										var n = `idb://${t}/${i}/${e}`;
										return l[n] || (l[n] = new Tr());
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
		function ti(e, t, n, r) {
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
					Yt(i, o) !== 0 && (i != null && s(i), o != null && s(o));
				});
			}
			t.indexes.forEach(i);
		}
		function ni(e, t, r) {
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
		function ri(e, t) {
			return t.lower === void 0 ? !0 : t.lowerOpen ? Yt(e, t.lower) > 0 : Yt(e, t.lower) >= 0;
		}
		function ii(e, t) {
			return t.upper === void 0 ? !0 : t.upperOpen ? Yt(e, t.upper) < 0 : Yt(e, t.upper) <= 0;
		}
		function ai(e, t) {
			return ri(e, t) && ii(e, t);
		}
		function oi(e, t, n, r, i, a) {
			if (!n || n.length === 0) return e;
			var s = t.query.index, c = s.multiEntry, l = t.query.range, u = r.schema.primaryKey.extractKey, d = s.extractKey, f = (s.lowLevelIndex || s).extractKey, p = n.reduce(function(e, n) {
				var r = e, i = [];
				if (n.type === "add" || n.type === "put") for (var a = new Tr(), s = n.values.length - 1; s >= 0; --s) {
					var f = n.values[s], p = u(f);
					if (!a.hasKey(p)) {
						var m = d(f);
						(c && o(m) ? m.some(function(e) {
							return ai(e, l);
						}) : ai(m, l)) && (a.addKey(p), i.push(f));
					}
				}
				switch (n.type) {
					case "add":
						var h = new Tr().addKeys(t.values ? e.map(function(e) {
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
						var g = new Tr().addKeys(n.values.map(function(e) {
							return u(e);
						}));
						r = e.filter(function(e) {
							return !g.hasKey(t.values ? u(e) : e);
						}).concat(t.values ? i : i.map(function(e) {
							return u(e);
						}));
						break;
					case "delete":
						var _ = new Tr().addKeys(n.keys);
						r = e.filter(function(e) {
							return !_.hasKey(t.values ? u(e) : e);
						});
						break;
					case "deleteRange":
						var v = n.range;
						r = e.filter(function(e) {
							return !ai(u(e), v);
						});
				}
				return r;
			}, e);
			if (p === e) return e;
			var m = function(e, t) {
				return Yt(f(e), f(t)) || Yt(u(e), u(t));
			};
			return p.sort(t.direction === "prev" || t.direction === "prevunique" ? function(e, t) {
				return m(t, e);
			} : m), t.limit && t.limit < Infinity && (p.length > t.limit ? p.length = t.limit : e.length === t.limit && p.length < t.limit && (i.dirty = !0)), a ? Object.freeze(p) : p;
		}
		function si(e, t) {
			return Yt(e.lower, t.lower) === 0 && Yt(e.upper, t.upper) === 0 && !!e.lowerOpen == !!t.lowerOpen && !!e.upperOpen == !!t.upperOpen;
		}
		function ci(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : -1;
			if (t === void 0) return 1;
			var i = Yt(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return 1;
				if (r) return -1;
			}
			return i;
		}
		function li(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : 1;
			if (t === void 0) return -1;
			var i = Yt(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return -1;
				if (r) return 1;
			}
			return i;
		}
		function ui(e, t) {
			return ci(e.lower, t.lower, e.lowerOpen, t.lowerOpen) <= 0 && li(e.upper, t.upper, e.upperOpen, t.upperOpen) >= 0;
		}
		function di(e, t, n, r) {
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
						return e.req.limit === r.limit && e.req.values === r.values && (e.req.direction ?? "next") === s && si(e.req.query.range, r.query.range);
					});
					return c ? [
						c,
						!0,
						i,
						o
					] : [
						o.find(function(e) {
							return ("limit" in e.req ? e.req.limit : Infinity) >= r.limit && (e.req.direction ?? "next") === s && (!r.values || e.req.values) && ui(e.req.query.range, r.query.range);
						}),
						!1,
						i,
						o
					];
				case "count":
					var l = o.find(function(e) {
						return si(e.req.query.range, r.query.range);
					});
					return [
						l,
						!!l,
						i,
						o
					];
			}
		}
		function fi(e, t, n, r) {
			e.subscribers.add(n), r.addEventListener("abort", function() {
				e.subscribers.delete(n), e.subscribers.size === 0 && pi(e, t);
			});
		}
		function pi(e, t) {
			setTimeout(function() {
				e.subscribers.size === 0 && ce(t, e);
			}, 3e3);
		}
		var mi = {
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
													R(y.obsSet, a.mutatedParts) && (ce(g, y), y.subscribers.forEach(function(e) {
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
																var w = Object.isFrozen(y.res), T = oi(y.res, y.req, p, f, y, w);
																y.dirty ? (ce(g, y), y.subscribers.forEach(function(e) {
																	return s.add(e);
																})) : T !== y.res && (y.res = T, y.promise = P.resolve({ result: T }));
															} else y.dirty && ce(g, y), y.subscribers.forEach(function(e) {
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
								var o = N.trans;
								if (a.outbound || o.db._options.cache === "disabled" || o.explicit || o.idbtrans.mode !== "readwrite") return i.mutate(e);
								var s = Nr[`idb://${t}/${r}`];
								if (!s) return i.mutate(e);
								var c = i.mutate(e);
								return (e.type === "add" || e.type === "put") && (e.values.length >= 50 || qr(a, e).some(function(e) {
									return e == null;
								})) ? c.then(function(t) {
									var r = ni(s, n(n({}, e), { values: e.values.map(function(e, r) {
										if (t.failures[r]) return e;
										var i = a.keyPath?.includes(".") ? ie(e) : n({}, e);
										return w(i, a.keyPath, t.results[r]), i;
									}) }), t);
									s.optimisticOps.push(r), queueMicrotask(function() {
										return e.mutatedParts && Ir(e.mutatedParts);
									});
								}) : (s.optimisticOps.push(e), e.mutatedParts && Ir(e.mutatedParts), c.then(function(t) {
									if (t.numFailures > 0) {
										ce(s.optimisticOps, e);
										var n = ni(s, e, t);
										n && s.optimisticOps.push(n), e.mutatedParts && Ir(e.mutatedParts);
									}
								}), c.catch(function() {
									ce(s.optimisticOps, e), e.mutatedParts && Ir(e.mutatedParts);
								})), c;
							},
							query: function(e) {
								if (!Qr(N, i) || !$r("query", e)) return i.query(e);
								var n = N.trans?.db._options.cache === "immutable", a = N, o = a.requery, s = a.signal, c = di(t, r, "query", e), l = c[0], u = c[1], d = c[2], f = c[3];
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
										return f && l && ce(f, l), Promise.reject(e);
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
								return fi(l, f, o, s), l.promise.then(function(t) {
									var r = oi(t.result, e, d?.optimisticOps, i, l, n);
									return { result: n ? r : ie(r) };
								});
							}
						});
					}
				});
			}
		};
		function hi(e, t) {
			return new Proxy(e, { get: function(e, n, r) {
				return n === "db" ? t : Reflect.get(e, n, r);
			} });
		}
		var gi = function() {
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
					maxConnections: Vt
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
					dbReadyResolve: Te,
					dbReadyPromise: null,
					cancelOpen: Te,
					openCanceller: null,
					autoSchema: !0,
					PR1398_maxLoop: 3,
					autoOpen: r.autoOpen
				};
				s.dbReadyPromise = new P(function(e) {
					s.dbReadyResolve = e;
				}), s.openCanceller = new P(function(e, t) {
					s.cancelOpen = t;
				}), this._state = s, this.name = t, this.on = an(this, "populate", "blocked", "versionchange", "close", { ready: [Ne, Te] }), this.once = function(e, t) {
					var n = function() {
						var r = [...arguments];
						i.on(e).unsubscribe(n), t.apply(i, r);
					};
					return i.on(e, n);
				}, this.on.ready.subscribe = y(this.on.ready.subscribe, function(t) {
					return function(n, r) {
						e.vip(function() {
							var e = i._state;
							if (e.openComplete) e.dbOpenError || P.resolve().then(n), r && t(n);
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
				}), this.Collection = vn(this), this.Table = sn(this), this.Transaction = Pn(this), this.Version = pr(this), this.WhereClause = On(this), this.on("versionchange", function(e) {
					e.newVersion > 0 ? console.warn(`Another connection wants to upgrade database '${i.name}'. Closing db now to resume the upgrade.`) : console.warn(`Another connection wants to delete database '${i.name}'. Closing db now to resume the delete request.`), i.close({ disableAutoOpen: !1 });
				}), this.on("blocked", function(e) {
					!e.newVersion || e.newVersion < e.oldVersion ? console.warn(`Dexie.delete('${i.name}') was blocked`) : console.warn(`Upgrade '${i.name}' blocked by other connection holding version ${e.oldVersion / 10}`);
				}), this._maxKey = zn(r.IDBKeyRange), this._createTransaction = function(e, t, n, r) {
					return new i.Transaction(e, t, n, i._options.chromeTransactionDurability, r);
				}, this._fireOnBlocked = function(e) {
					i.on("blocked").fire(e), mr.toArray().filter(function(e) {
						return e.name === i.name && e !== i && !e._state.vcFired;
					}).map(function(t) {
						return t.on("versionchange").fire(e);
					});
				}, this.use(Zr), this.use(mi), this.use(ei), this.use(Gr), this.use(Jr);
				var c = new Proxy(this, { get: function(e, t, n) {
					if (t === "_vip") return !0;
					if (t === "table") return function(e) {
						return hi(i.table(e), c);
					};
					var r = Reflect.get(e, t, n);
					return r instanceof rn ? hi(r, c) : t === "tables" ? r.map(function(e) {
						return hi(e, c);
					}) : t === "_createTransaction" ? function() {
						return hi(r.apply(this, arguments), c);
					} : r;
				} });
				this.vip = c, o.forEach(function(e) {
					return e(i);
				});
			}
			return e.prototype.version = function(e) {
				if (isNaN(e) || e < .1) throw new j.Type("Given version is not a positive number");
				if (e = Math.round(e * 10) / 10, this.idbdb || this._state.isBeingOpened) throw new j.Schema("Cannot add version when database is open");
				this.verno = Math.max(this.verno, e);
				var t = this._versions, n = t.filter(function(t) {
					return t._cfg.version === e;
				})[0];
				return n || (n = new this.Version(e), t.push(n), t.sort(Zn), n.stores({}), this._state.autoSchema = !1, n);
			}, e.prototype._whenReady = function(e) {
				var t = this;
				return this.idbdb && (this._state.openComplete || N.letThrough || this._vip) ? e() : new P(function(e, n) {
					if (t._state.openComplete) return n(new j.DatabaseClosed(t._state.dbOpenError));
					if (!t._state.isBeingOpened) {
						if (!t._state.autoOpen) {
							n(new j.DatabaseClosed());
							return;
						}
						t.open().catch(Te);
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
				return jt(Ze, function() {
					return zr(e);
				});
			}, e.prototype._close = function() {
				this.on.close.fire(new CustomEvent("close"));
				var e = this._state;
				if (mr.remove(this), this.idbdb) {
					try {
						this.idbdb.close();
					} catch {}
					this.idbdb = null;
				}
				e.isBeingOpened || (e.dbReadyPromise = new P(function(t) {
					e.dbReadyResolve = t;
				}), e.openCanceller = new P(function(t, n) {
					e.cancelOpen = n;
				}));
			}, e.prototype.close = function(e) {
				var t = (e === void 0 ? { disableAutoOpen: !0 } : e).disableAutoOpen, n = this._state;
				t ? (n.isBeingOpened && n.cancelOpen(new j.DatabaseClosed()), this._close(), n.autoOpen = !1, n.dbOpenError = new j.DatabaseClosed()) : (this._close(), n.autoOpen = this._options.autoOpen || n.isBeingOpened, n.openComplete = !1, n.dbOpenError = null);
			}, e.prototype.delete = function(e) {
				var t = this;
				e === void 0 && (e = { disableAutoOpen: !0 });
				var n = arguments.length > 0 && typeof arguments[0] != "object", r = this._state;
				return new P(function(i, a) {
					var o = function() {
						t.close(e);
						var n = t._deps.indexedDB.deleteDatabase(t.name);
						n.onsuccess = gt(function() {
							br(t._deps, t.name), i();
						}), n.onerror = L(a), n.onblocked = t._fireOnBlocked;
					};
					if (n) throw new j.InvalidArgument("Invalid closeOptions argument to db.delete()");
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
				var r = this, i = N.trans;
				i && i.db === this && e.indexOf("!") === -1 || (i = null);
				var a = e.indexOf("?") !== -1;
				e = e.replace("!", "").replace("?", "");
				var o, s;
				try {
					if (s = t.map(function(e) {
						var t = e instanceof r.Table ? e.name : e;
						if (typeof t != "string") throw TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
						return t;
					}), e == "r" || e === Ut) o = Ut;
					else if (e == "rw" || e == Wt) o = Wt;
					else throw new j.InvalidArgument("Invalid transaction mode: " + e);
					if (i) {
						if (i.mode === Ut && o === Wt) {
							if (a) i = null;
							else throw new j.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
						}
						i && s.forEach(function(e) {
							if (i && i.storeNames.indexOf(e) === -1) {
								if (a) i = null;
								else throw new j.SubTransaction("Table " + e + " not included in parent transaction.");
							}
						}), a && i && !i.active && (i = null);
					}
				} catch (e) {
					return i ? i._promise(null, function(t, n) {
						n(e);
					}) : Pt(e);
				}
				var c = Hr.bind(null, this, o, s, i, n);
				return i ? i._promise(o, c, "lock") : N.trans ? jt(N.transless, function() {
					return r._whenReady(c);
				}) : this._whenReady(c);
			}, e.prototype.table = function(e) {
				if (!u(this._allTables, e)) throw new j.InvalidTable(`Table ${e} does not exist`);
				return this._allTables[e];
			}, e;
		}(), _i = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable", vi = function() {
			function e(e) {
				this._subscribe = e;
			}
			return e.prototype.subscribe = function(e, t, n) {
				return this._subscribe(!e || typeof e == "function" ? {
					next: e,
					error: t,
					complete: n
				} : e);
			}, e.prototype[_i] = function() {
				return this;
			}, e;
		}(), yi;
		try {
			yi = {
				indexedDB: i.indexedDB || i.mozIndexedDB || i.webkitIndexedDB || i.msIndexedDB,
				IDBKeyRange: i.IDBKeyRange || i.webkitIDBKeyRange
			};
		} catch {
			yi = {
				indexedDB: null,
				IDBKeyRange: null
			};
		}
		function bi(e) {
			var t = !1, n, r = new vi(function(r) {
				var i = de(e);
				function a(t) {
					var n = lt();
					try {
						i && wt();
						var r = Ct(e, t);
						return i && (r = r.finally(Tt)), r;
					} finally {
						n && ut();
					}
				}
				var o = !1, s, c = {}, l = {}, u = {
					get closed() {
						return o;
					},
					unsubscribe: function() {
						o || (o = !0, s && s.abort(), d && Mn.storagemutated.unsubscribe(m));
					}
				};
				r.start && r.start(u);
				var d = !1, f = function() {
					return Nt(h);
				};
				function p() {
					return R(l, c);
				}
				var m = function(e) {
					Mr(c, e), p() && f();
				}, h = function() {
					if (!o && yi.indexedDB) {
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
						d ||= (Mn.storagemutated.subscribe(m), !0), Promise.resolve(h).then(function(e) {
							t = !0, n = e, !(o || u.signal.aborted) && (p() ? f() : (l = i, p() ? f() : (c = {}, Nt(function() {
								return !o && r.next && r.next(e);
							}))));
						}, function(e) {
							o || u.signal.aborted || (t = !1, ["DatabaseClosedError", "AbortError"].includes(e?.name) || o || Nt(function() {
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
		var xi = gi;
		d(xi, n(n({}, we), {
			delete: function(e) {
				return new xi(e, { addons: [] }).delete();
			},
			exists: function(e) {
				return new xi(e, { addons: [] }).open().then(function(e) {
					return e.close(), !0;
				}).catch("NoSuchDatabaseError", function() {
					return !1;
				});
			},
			getDatabaseNames: function(e) {
				try {
					return vr(xi.dependencies).then(e);
				} catch {
					return Pt(new j.MissingAPI());
				}
			},
			defineClass: function() {
				function e(e) {
					s(this, e);
				}
				return e;
			},
			ignoreTransaction: function(e) {
				return N.trans ? jt(N.transless || Ze, e) : e();
			},
			vip: xr,
			async: function(e) {
				return function() {
					try {
						var t = Br(e.apply(this, arguments));
						return !t || typeof t.then != "function" ? P.resolve(t) : t;
					} catch (e) {
						return Pt(e);
					}
				};
			},
			spawn: function(e, t, n) {
				try {
					var r = Br(e.apply(n, t || []));
					return !r || typeof r.then != "function" ? P.resolve(r) : r;
				} catch (e) {
					return Pt(e);
				}
			},
			currentTransaction: { get: function() {
				return N.trans || null;
			} },
			waitFor: function(e, t) {
				var n = P.resolve(typeof e == "function" ? xi.ignoreTransaction(e) : e).timeout(t || 6e4);
				return N.trans ? N.trans.waitFor(n) : n;
			},
			Promise: P,
			debug: {
				get: function() {
					return Pe;
				},
				set: function(e) {
					Fe(e);
				}
			},
			derive: m,
			extend: s,
			props: d,
			override: y,
			Events: an,
			on: Mn,
			liveQuery: bi,
			extendObservabilitySet: Mr,
			getByKeyPath: C,
			setByKeyPath: w,
			delByKeyPath: T,
			shallowClone: ee,
			deepClone: ie,
			getObjectDiff: Kr,
			cmp: Yt,
			asap: x,
			minKey: Rt,
			addons: [],
			connections: { get: mr.toArray },
			errnames: be,
			dependencies: yi,
			cache: Nr,
			semVer: It,
			version: It.split(".").map(function(e) {
				return parseInt(e);
			}).reduce(function(e, t, n) {
				return e + t / 10 ** (n * 2);
			})
		})), xi.maxKey = zn(xi.dependencies.IDBKeyRange), typeof dispatchEvent < "u" && typeof addEventListener < "u" && (Mn(An, function(e) {
			if (!Si) {
				var t = new CustomEvent(jn, { detail: e });
				Si = !0, dispatchEvent(t), Si = !1;
			}
		}), addEventListener(jn, function(e) {
			var t = e.detail;
			Si || z(t);
		}));
		function z(e) {
			var t = Si;
			try {
				Si = !0, Mn.storagemutated.fire(e), Lr(e, !0);
			} finally {
				Si = t;
			}
		}
		var Si = !1, Ci, wi = function() {};
		typeof BroadcastChannel < "u" && (wi = function() {
			Ci = new BroadcastChannel(jn), Ci.onmessage = function(e) {
				return e.data && z(e.data);
			};
		}, wi(), typeof Ci.unref == "function" && Ci.unref(), Mn(An, function(e) {
			Si || Ci.postMessage(e);
		})), typeof addEventListener < "u" && (addEventListener("pagehide", function(e) {
			if (!gi.disableBfCache && e.persisted) {
				Pe && console.debug("Dexie: handling persisted pagehide"), Ci?.close();
				for (var t = 0, n = mr.toArray(); t < n.length; t++) n[t].close({ disableAutoOpen: !1 });
			}
		}), addEventListener("pageshow", function(e) {
			!gi.disableBfCache && e.persisted && (Pe && console.debug("Dexie: handling persisted pageshow"), wi(), z({ all: new Tr(-Infinity, [[]]) }));
		}));
		function Ti(e) {
			return new tn({ add: e });
		}
		function Ei(e) {
			return new tn({ remove: e });
		}
		function Di(e, t) {
			return new tn({ replacePrefix: [e, t] });
		}
		return P.rejectionMapper = Ce, Fe(Pe), n(gi, /* @__PURE__ */ Object.freeze({
			__proto__: null,
			DEFAULT_MAX_CONNECTIONS: Vt,
			Dexie: gi,
			Entity: Jt,
			PropModification: tn,
			RangeSet: Tr,
			add: Ti,
			cmp: Yt,
			default: gi,
			liveQuery: bi,
			mergeRanges: Dr,
			rangesOverlap: Or,
			remove: Ei,
			replacePrefix: Di
		}), { default: gi }), gi;
	}));
})))(), 1), xC = Symbol.for("Dexie"), SC = globalThis[xC] || (globalThis[xC] = bC.default);
if (bC.default.semVer !== SC.semVer) throw Error(`Two different versions of Dexie loaded in the same app: ${bC.default.semVer} and ${SC.semVer}`);
var { liveQuery: CC, mergeRanges: wC, rangesOverlap: TC, RangeSet: EC, cmp: DC, Entity: OC, PropModification: kC, replacePrefix: AC, add: jC, remove: MC, DexieYProvider: NC } = SC, PC = "tavern-trpg-assistant", FC = {};
function IC(e) {
	return e.length >= 8 && e[0] === 137 && e[1] === 80 && e[2] === 78 && e[3] === 71 ? "image/png" : e.length >= 3 && e[0] === 255 && e[1] === 216 && e[2] === 255 ? "image/jpeg" : e.length >= 6 && String.fromCharCode(...e.slice(0, 4)) === "GIF8" ? "image/gif" : e.length >= 12 && String.fromCharCode(...e.slice(0, 4)) === "RIFF" && String.fromCharCode(...e.slice(8, 12)) === "WEBP" ? "image/webp" : "application/octet-stream";
}
async function LC(e) {
	let t = await e.table("assets").toArray(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
	for (let i of t) {
		let t = hS(i.bytes);
		n.set(`${i.packId}\u0000${i.path}`, t), !r.has(t) && (r.add(t), await e.table("blobs").put({
			hash: t,
			bytes: i.bytes,
			mime: IC(i.bytes),
			size: i.bytes.length,
			createdAt: Date.now()
		}));
	}
	let i = await e.table("packs").toArray();
	for (let r of i) {
		let i = String(r.id), a = t.filter((e) => e.packId === i).map((e) => n.get(`${e.packId}\u0000${e.path}`)), o = r.kind, s = Array.isArray(r.dependsOn) ? r.dependsOn : [], c = {
			...r,
			category: r.category ?? (o === "module" ? "adventure" : "rules"),
			lineage: r.lineage ?? PS(i),
			relationships: r.relationships ?? {
				requires: s,
				recommends: [],
				conflicts: []
			},
			contributes: r.contributes ?? {},
			blobs: r.blobs ?? [],
			dataVersion: r.dataVersion ?? 1,
			blobHashes: [...new Set(a)].sort(),
			content: r.content ?? {
				features: [],
				adventure: {},
				fallback: []
			}
		};
		delete c.kind, delete c.dependsOn, await e.table("packs").put(c);
	}
	let a = await e.table("entries").toArray();
	for (let t of a) {
		if (typeof t.image != "string") continue;
		let r = n.get(`${String(t.packId)}\u0000${t.image}`);
		r && (t.image = { $asset: r }, await e.table("entries").put(t));
	}
	FC.beforeMigrationWrite?.();
}
var RC = class extends SC {
	packs;
	entries;
	searchIndex;
	blobs;
	workspaces;
	saves;
	packTrash;
	meta;
	constructor(e = PC) {
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
		}).upgrade(LC);
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
}, zC = [
	"entries",
	"variants",
	"adventures",
	"table",
	"ruleOptions",
	"aiNotes"
], BC = [
	"charGen",
	"activities",
	"trackers"
], VC = Z().min(1).max(40);
ey({
	id: Ly,
	name: Z().min(1).max(80),
	summary: Z().max(200).default(""),
	text: Z().default(""),
	implemented: Gv().default(!1),
	source: Z().max(20).optional()
}), ey({
	text: Z().min(1),
	appliesTo: Zv(Z()).default([]),
	tone: Z().max(80).optional()
}), ey({
	id: Z().min(1).max(160),
	kind: VC,
	name: Z().min(1).max(120),
	description: Z().max(2e3).default(""),
	defaultEnabled: Gv().default(!1),
	stateVersion: Vv().int().positive().optional(),
	data: oy(Z(), qv()).default({})
});
function HC(e) {
	return zC.includes(e) ? "supported" : BC.includes(e) ? "reserved" : "unknown";
}
// src/core/packs/file.ts
function UC(e) {
	let t = {};
	for (let n of Object.keys(e).sort()) t[n] = e[n];
	return t;
}
function WC(e) {
	let t = [...e.entries].sort((e, t) => e.id.localeCompare(t.id)), n = {}, r = /* @__PURE__ */ new Map();
	for (let e of t) {
		n[e.type] = (n[e.type] ?? 0) + 1;
		let t = r.get(e.type) ?? [];
		t.push(e), r.set(e.type, t);
	}
	let i = [...e.features ?? []].sort((e, t) => e.kind.localeCompare(t.kind) || e.id.localeCompare(t.id)), a = /* @__PURE__ */ new Map();
	for (let e of i) {
		let t = a.get(e.kind) ?? [];
		t.push(e), a.set(e.kind, t);
	}
	let o = new Map([...e.blobs ?? /* @__PURE__ */ new Map()].sort(([e], [t]) => e.localeCompare(t))), s = e.adventure ?? {}, c = e.fallback ?? [], l = { "trpg-manifest.json": mS({
		format: "trpg-pack",
		formatVersion: 2,
		pack: Object.assign({
			license: "",
			attribution: "",
			description: "",
			relationships: {
				requires: [],
				recommends: [],
				conflicts: []
			},
			contributes: {},
			dataVersion: 1
		}, e.manifest, {
			entryCount: t.length,
			typeCounts: UC(n),
			blobs: [...o].map(([e, t]) => ({
				hash: e,
				mime: t.mime,
				size: t.bytes.length
			})),
			contributes: {
				...e.manifest.contributes,
				entries: t.length,
				tables: t.filter((e) => e.type === "table").length,
				variants: t.filter((e) => e.override !== void 0).length,
				adventures: (s["adventure/adventure.json"]?.adventures ?? []).length,
				ruleOptions: i.filter((e) => e.kind === "ruleOptions").length
			}
		})
	}) };
	for (let [e, t] of [...r].sort(([e], [t]) => e.localeCompare(t))) l[`entries/${encodeURIComponent(e)}.json`] = mS(t);
	for (let [e, t] of [...a].sort(([e], [t]) => e.localeCompare(t))) l[`features/${encodeURIComponent(e.toLowerCase())}.json`] = mS(t);
	for (let e of Object.keys(s).sort()) l[e] = mS(s[e]);
	c.length && (l["adventure/fallback.json"] = mS({ items: c }));
	for (let [e, t] of o) l[`blobs/${e}`] = t.bytes;
	return qS(l);
}
// src/core/packs/installer.ts
function GC(e, t) {
	return e.trim().toLowerCase() === t.trim().toLowerCase();
}
function KC(e, t) {
	return e.filter((e) => {
		let n = t.get(e.id);
		return n ? e.minVersion ? Tb(n.version, e.minVersion) < 0 : !1 : !0;
	});
}
var qC = class {
	db;
	deps;
	constructor(e, t) {
		this.db = e, this.deps = t;
	}
	recognize(e) {
		return aC(e, {
			appVersion: this.deps.appVersion,
			hasRule: (e) => this.deps.rules.has(e)
		});
	}
	async list(e = {}) {
		return (await this.db.packs.toArray()).filter((t) => (!e.ruleId || t.ruleId === e.ruleId) && (!e.category || t.category === e.category)).sort((e, t) => e.name.localeCompare(t.name, "zh"));
	}
	async plan(e) {
		let t = await this.db.packs.get(e.manifest.id), n = new Map((await this.db.packs.toArray()).map((e) => [e.id, e])), r = {
			action: "install",
			missingRequires: KC(e.manifest.relationships.requires, n),
			missingRecommends: KC(e.manifest.relationships.recommends, n),
			conflicts: e.manifest.relationships.conflicts.filter((e) => n.has(e.id)).map((e) => ({
				id: e.id,
				reason: e.reason,
				installedVersion: n.get(e.id).version
			})),
			unsupportedFeatures: JC(e)
		};
		if (t) {
			let n = Tb(e.manifest.version, t.version), i = n > 0 ? "newer" : n === 0 ? "same" : "older", a = t.lineage && e.manifest.lineage && t.lineage !== e.manifest.lineage ? "lineage-mismatch" : i === "older" && t.source === "builtin" ? "builtin-downgrade" : void 0;
			return {
				...r,
				action: "overwrite",
				relation: i,
				installed: t,
				lineage: {
					installed: t.lineage,
					incoming: e.manifest.lineage
				},
				contentChanged: i === "same" && t.sha256 !== e.sha256,
				...a ? { blocked: a } : {}
			};
		}
		let i = (await this.db.packs.where("ruleId").equals(e.manifest.ruleId).toArray()).find((t) => t.category === e.manifest.category && GC(t.name, e.manifest.name));
		return i ? {
			...r,
			action: "name-conflict",
			existing: i,
			canReplace: i.source !== "builtin"
		} : r;
	}
	async install(e, t) {
		let n = await this.plan(e);
		if (n.blocked === "lineage-mismatch") throw new Q("E_LINEAGE", `已安装的「${n.installed?.name ?? e.manifest.id}」与这个文件编号相同但来源不同。先卸载已安装的，或请作者更换编号。`, { packId: e.manifest.id });
		if (n.missingRequires.length) throw new Q("E_DEP_MISSING", `缺少它需要的扩展包：${n.missingRequires.map((e) => e.id).join("、")}`, { missing: n.missingRequires });
		let r = e.manifest.name, i;
		if (n.action === "overwrite") {
			if (n.blocked) throw new Q("E_BUILTIN_DOWNGRADE", "内置数据包不能降级");
			if ((t.resolution ?? (t.source === "download" ? "overwrite" : void 0)) !== "overwrite") throw new Q("E_CONFLICT_UNRESOLVED", "已安装同一个内容包，需要先选择是否覆盖");
		} else if (n.action === "name-conflict") {
			if (t.resolution === "keep-both") r = await this.uniqueName(e.manifest.ruleId, e.manifest.category, r);
			else if (t.resolution === "replace") {
				if (!n.canReplace || !n.existing) throw new Q("E_BUILTIN_PROTECTED", "内置内容包不能被替换");
				i = n.existing.id;
			} else throw new Q("E_CONFLICT_UNRESOLVED", "已有同名内容包，需要先选择处理方式");
		}
		let a = {
			...e.manifest,
			name: r,
			source: t.source,
			byteSize: e.byteSize,
			sha256: e.sha256,
			installedAt: this.deps.now(),
			schemaVersion: Iy.pack,
			blobHashes: [...e.blobs.keys()].sort(),
			content: {
				features: e.features,
				adventure: e.adventure,
				fallback: e.fallback
			}
		}, o = e.entries.map(({ id: e, ...t }) => ({
			...t,
			entryId: e,
			packId: a.id,
			ruleId: a.ruleId
		}));
		try {
			await this.db.transaction("rw", [
				this.db.packs,
				this.db.entries,
				this.db.blobs,
				this.db.searchIndex
			], async () => {
				i && await this.removeRows(i), await this.removeRows(a.id), await this.db.packs.put(a), await this.db.entries.bulkPut(o);
				let t = this.deps.now();
				await this.db.blobs.bulkPut([...e.blobs.values()].map((e) => ({
					hash: e.hash,
					bytes: e.bytes,
					mime: e.mime,
					size: e.size,
					createdAt: t
				})));
			});
		} catch (e) {
			throw Sb(e) ? new Q("E_QUOTA", Cb) : e;
		}
		return i && this.deps.onChange?.({
			type: "uninstalled",
			packId: i
		}), this.deps.onChange?.({
			type: "installed",
			packId: a.id
		}), a;
	}
	async installBuiltin(e) {
		let t = this.recognize(e);
		if (t.type !== "pack") throw new Q("E_BAD_CONTENT", "文件内容损坏：内置文件不是内容包");
		let n = await this.db.packs.get(t.manifest.id);
		return n && Tb(t.manifest.version, n.version) <= 0 ? "skipped" : (await this.install(t, {
			source: "builtin",
			resolution: n ? "overwrite" : void 0
		}), n ? "upgraded" : "installed");
	}
	async uninstall(e) {
		let t = await this.db.packs.get(e);
		if (!t) throw new Q("E_NOT_FOUND", "没有找到这个内容包");
		if (t.source === "builtin") throw new Q("E_BUILTIN_PROTECTED", "内置内容包不能删除");
		await this.db.transaction("rw", [
			this.db.packs,
			this.db.entries,
			this.db.blobs,
			this.db.searchIndex
		], async () => {
			await this.removeRows(e);
			let n = new Set((await this.db.packs.toArray()).flatMap((e) => e.blobHashes));
			for (let e of t.blobHashes) n.has(e) || await this.db.blobs.delete(e);
		}), this.deps.onChange?.({
			type: "uninstalled",
			packId: e
		});
	}
	async referencingSaves(e) {
		return (await this.db.saves.toArray()).filter((t) => t.deletedAt === void 0 && t.packs.some((t) => t.id === e));
	}
	async exportPack(e) {
		let t = await this.db.packs.get(e);
		if (!t) throw new Q("E_NOT_FOUND", "没有找到这个内容包");
		let n = (await this.db.entries.where("packId").equals(e).toArray()).map(({ entryId: e, packId: t, ruleId: n, ...r }) => ({
			...r,
			id: e
		})), r = /* @__PURE__ */ new Map();
		for (let e of t.blobHashes) {
			let t = await this.db.blobs.get(e);
			t && r.set(e, {
				bytes: t.bytes,
				mime: t.mime
			});
		}
		let { source: i, byteSize: a, sha256: o, installedAt: s, schemaVersion: c, blobHashes: l, content: u, ...d } = t;
		return WC({
			manifest: d,
			entries: n,
			blobs: r,
			features: u?.features,
			adventure: u?.adventure,
			fallback: u?.fallback
		});
	}
	async removeRows(e) {
		await this.db.entries.where("packId").equals(e).delete(), await this.db.searchIndex.delete(e), await this.db.packs.delete(e);
	}
	async uniqueName(e, t, n) {
		let r = await this.db.packs.where("ruleId").equals(e).toArray();
		for (let e = 2;; e++) {
			let i = `${n}（${e}）`;
			if (!r.some((e) => e.category === t && GC(e.name, i))) return i;
		}
	}
};
function JC(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.features) HC(n.kind) !== "supported" && t.set(n.kind, (t.get(n.kind) ?? 0) + 1);
	return [...t].map(([e, t]) => ({
		kind: e,
		count: t
	}));
}
// src/core/instances.ts
function YC(e, t, n, r, i) {
	if (t.unique) {
		let n = e.instances.find((e) => e.sourceRef?.packId === t.packId && e.sourceRef.entryId === t.entryId);
		if (n) return {
			data: e,
			instances: [n],
			created: !1
		};
		r = 1;
	}
	let a = Array.from({ length: Math.max(1, r) }, (e, a) => ({
		id: i(),
		type: t.type,
		name: t.name,
		...r > 1 ? { label: yb(a) } : {},
		sourceRef: {
			packId: t.packId,
			version: n,
			entryId: t.entryId
		},
		data: structuredClone(t.data)
	}));
	return {
		data: {
			...e,
			instances: [...e.instances, ...a]
		},
		instances: a,
		created: !0
	};
}
// src/core/packs/enablement.ts
function XC(e, t, n) {
	return t.filter((t) => n.get(t.id)?.relationships.requires.some((t) => t.id === e)).map((e) => e.id);
}
function ZC(e, t, n, r) {
	let i = [...e], a = [], o = (e, t) => {
		if (i.some((t) => t.id === e)) return;
		let s = n.get(e);
		if (!s) throw new Q("E_DEP_MISSING", `需要先安装『${e}』`, { packId: e });
		if (s.ruleId !== r.id) throw new Q("E_RULE_MISMATCH", `『${s.name}』属于其他规则，不能在当前存档中启用`);
		for (let e of s.relationships.requires) o(e.id, !0);
		i.push({
			id: e,
			version: s.version
		}), t && a.push(e);
	};
	return o(t, !1), {
		enabledPacks: i,
		autoEnabled: a
	};
}
function QC(e, t, n, r) {
	if (r.corePackIds.includes(t)) throw new Q("E_CORE_LOCKED", "核心规则始终启用，不能停用");
	let i = XC(t, e, n);
	if (i.length) throw new Q("E_REQUIRED_BY", `${i.map((e) => `『${n.get(e)?.name ?? e}』`).join("、")}依赖它，不能停用`, { dependents: i });
	return e.filter((e) => e.id !== t);
}
// src/core/saves/helpers.ts
function $C(e, t) {
	return gS({
		d: e,
		p: t.map((e) => e.id).sort()
	});
}
function ew(e) {
	return e.savedHash !== $C(e.data, e.enabledPacks);
}
function tw(e, t) {
	return t.reduce((t, n) => ({
		...t,
		...n(e)
	}), {
		partyNames: [],
		partyCount: 0
	});
}
function nw(e) {
	let t = e.trim();
	if (t.length < 1 || t.length > 40) throw new Q("E_BAD_NAME", "存档名需要 1–40 个字");
	return t;
}
function rw(e, t, n = (e) => ` ${e}`) {
	if (!t.has(e)) return e;
	for (let r = 2;; r++) {
		let i = `${e}${n(r)}`;
		if (!t.has(i)) return i;
	}
}
function iw(e) {
	return yS("save", e);
}
function aw(e) {
	return yS("workspace", e);
}
function ow(e, t) {
	return t.updatedAt - e.updatedAt || t.createdAt - e.createdAt || e.id.localeCompare(t.id);
}
// src/core/saves/campaign.ts
var sw = class {
	db;
	deps;
	uuid;
	constructor(e, t) {
		this.db = e, this.deps = t, this.uuid = t.uuid ?? _b;
	}
	async getWorkspace(e) {
		let t = await this.db.workspaces.get(e);
		if (!t) return null;
		let n = aw(t);
		return n !== t && await this.db.workspaces.put(n), n;
	}
	isDirty(e) {
		return ew(e);
	}
	async getSave(e) {
		let t = await this.db.saves.get(e);
		return t ? iw(t) : null;
	}
	async listManual(e, t) {
		return (await this.db.saves.where("ruleId").equals(e.ruleId).toArray()).map(iw).filter((n) => n.kind === "manual" && n.deletedAt === void 0 && (t === "all" || n.ownerKey === e.ownerKey)).sort(ow);
	}
	async listAuto(e, t) {
		return (await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray()).map(iw).filter((e) => e.kind === "auto").sort(ow);
	}
	async listDeleted(e) {
		return (await this.db.saves.where("ruleId").equals(e).toArray()).map(iw).filter((e) => e.deletedAt !== void 0).sort((e, t) => (t.deletedAt ?? 0) - (e.deletedAt ?? 0));
	}
	async listOtherRules(e) {
		return (await this.db.saves.toArray()).map(iw).filter((t) => t.ruleId !== e && t.kind === "manual" && t.deletedAt === void 0).sort(ow);
	}
	async missingPacks(e) {
		let t = new Set((await this.db.packs.toArray()).map((e) => e.id));
		return e.enabledPacks.filter((e) => !t.has(e.id));
	}
	async startNewCampaign(e) {
		let t = this.requireRule(e.ruleId), n = nw(e.name), r = await this.installedMap(), i = [];
		for (let n of [...t.corePackIds, ...e.packIds]) i = ZC(i, n, r, t).enabledPacks;
		return this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta,
			this.db.packs
		], async () => {
			let t = await this.getWorkspace(e.ownerKey);
			t && await this.writeAutoSave(t, "新存档前");
			let r = {
				ownerKey: e.ownerKey,
				ownerLabel: e.ownerLabel,
				ruleId: e.ruleId,
				currentSaveId: null,
				enabledPacks: i,
				data: { instances: [] },
				savedHash: "",
				schemaVersion: Iy.workspace,
				updatedAt: this.deps.now()
			}, a = await this.buildSave(r, {
				id: this.uuid(),
				name: n,
				note: e.note ?? "",
				kind: "manual"
			});
			return r.currentSaveId = a.id, r.savedHash = a.hash, await this.db.saves.put(a), await this.db.workspaces.put(r), await this.bumpSaves(), {
				workspace: r,
				save: a
			};
		});
	}
	async saveCurrent(e) {
		return this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta,
			this.db.packs
		], async () => {
			let t = await this.requireWorkspace(e);
			if (!ew(t)) return {
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
				packs: r.packs,
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
			this.db.meta,
			this.db.packs
		], async () => {
			let n = await this.requireWorkspace(e), r = n.currentSaveId ? await this.getSave(n.currentSaveId) : null, i = await this.manualNames(n.ownerKey, n.ruleId), a = t === void 0 ? rw(`${r?.name ?? "存档"} 分支`, i) : nw(t), o = await this.buildSave(n, {
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
		if (!r || r.deletedAt !== void 0) throw new Q("E_NOT_FOUND", "没有找到这个存档");
		return this.requireRule(r.ruleId), this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta,
			this.db.packs
		], async () => {
			let t = await this.getWorkspace(e.ownerKey), i = !!t && t.ruleId !== r.ruleId;
			if (i && !n.allowRuleSwitch) throw new Q("E_RULE_SWITCH_REQUIRED", "这个存档属于其他规则，需要确认切换规则");
			t && await this.writeAutoSave(t, i ? "切换规则前" : "读档前");
			let a = r;
			if (r.ownerKey !== e.ownerKey) {
				let t = await this.manualNames(e.ownerKey, r.ruleId), n = this.deps.now();
				a = {
					...r,
					id: this.uuid(),
					ownerKey: e.ownerKey,
					ownerLabel: e.ownerLabel,
					name: rw(`${r.name}（来自 ${r.ownerLabel}）`, t),
					branchedFrom: void 0,
					createdAt: n,
					updatedAt: n
				}, await this.db.saves.put(a);
			}
			let o = await this.installedMap(), s = {
				ownerKey: e.ownerKey,
				ownerLabel: e.ownerLabel,
				ruleId: a.ruleId,
				currentSaveId: a.id,
				enabledPacks: a.packs.map((e) => ({
					id: e.id,
					version: o.get(e.id)?.version ?? e.version
				})),
				data: structuredClone(a.snapshot),
				savedHash: a.hash,
				schemaVersion: Iy.workspace,
				updatedAt: this.deps.now()
			};
			return await this.db.workspaces.put(s), s;
		});
	}
	async deleteSave(e) {
		let t = await this.getSave(e);
		if (!t) throw new Q("E_NOT_FOUND", "没有找到这个存档");
		if (t.kind === "auto") throw new Q("E_AUTO_NOT_DELETABLE", "自动存档会自动滚动保留，不能单独删除");
		if ((await this.db.workspaces.get(t.ownerKey))?.currentSaveId === t.id) throw new Q("E_SAVE_IN_USE", "正在使用的存档不能删除，请先读取或新建其他存档");
		let n = {
			...t,
			deletedAt: this.deps.now()
		};
		return await this.db.saves.put(n), n;
	}
	async restoreSave(e) {
		let t = await this.getSave(e);
		if (!t || t.deletedAt === void 0) throw new Q("E_NOT_FOUND", "没有找到这个已删除的存档");
		let { deletedAt: n, ...r } = t, i = await this.manualNames(t.ownerKey, t.ruleId), a = {
			...r,
			name: rw(t.name, i, (e) => `（恢复 ${e}）`)
		};
		return await this.db.saves.put(a), a;
	}
	async purgeSaves(e) {
		let t = 0;
		for (let n of e) (await this.getSave(n))?.deletedAt !== void 0 && (await this.db.saves.delete(n), t++);
		return t;
	}
	async renameSave(e, t) {
		return this.patchManual(e, { name: nw(t) });
	}
	async setNote(e, t) {
		return this.patchManual(e, { note: t.slice(0, 200) });
	}
	async saveAutoAsManual(e) {
		let t = await this.getSave(e);
		if (!t || t.kind !== "auto") throw new Q("E_NOT_FOUND", "没有找到这个自动存档");
		let n = await this.manualNames(t.ownerKey, t.ruleId), r = this.deps.now(), i = new Date(t.createdAt), a = `${i.getMonth() + 1}月${i.getDate()}日 ${String(i.getHours()).padStart(2, "0")}:${String(i.getMinutes()).padStart(2, "0")}`, o = {
			...t,
			id: this.uuid(),
			kind: "manual",
			autoReason: void 0,
			name: rw(`自动存档 · ${a}`, n),
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
	async setPackEnabled(e, t, n) {
		let r = await this.requireWorkspace(e), i = this.requireRule(r.ruleId), a = await this.installedMap(), o, s = [];
		n ? {enabledPacks: o, autoEnabled: s} = ZC(r.enabledPacks, t, a, i) : o = QC(r.enabledPacks, t, a, i);
		let c = {
			...r,
			enabledPacks: o,
			updatedAt: this.deps.now()
		};
		return await this.db.workspaces.put(c), {
			workspace: c,
			autoEnabled: s
		};
	}
	async materialize(e, t, n = 1) {
		let r = await this.requireWorkspace(e);
		if (!r.enabledPacks.find((e) => e.id === t.packId)) throw new Q("E_PACK_DISABLED", "该内容包已停用，不能再从它新建");
		let i = await this.db.packs.get(t.packId), a = await this.db.entries.get([t.packId, t.entryId]);
		if (!i || !a) throw new Q("E_NOT_FOUND", "没有找到这个条目");
		let o = YC(r.data, a, i.version, n, this.uuid), s = {
			...r,
			data: o.data,
			updatedAt: this.deps.now()
		};
		return o.created && await this.db.workspaces.put(s), {
			...o,
			workspace: s
		};
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
		let n = await this.installedMap(), r = this.deps.now();
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
			createdAt: r,
			updatedAt: r,
			summary: tw(e.data, this.deps.summaryContributors ?? []),
			packs: e.enabledPacks.map((e) => ({
				id: e.id,
				version: e.version,
				name: n.get(e.id)?.name ?? e.id
			})),
			snapshot: structuredClone(e.data),
			hash: $C(e.data, e.enabledPacks),
			schemaVersion: Iy.save
		};
	}
	async manualNames(e, t) {
		let n = await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray();
		return new Set(n.filter((e) => e.kind === "manual" && e.deletedAt === void 0).map((e) => e.name));
	}
	async bumpSaves() {
		let e = ub.parse(await this.db.getMeta("backup") ?? {});
		await this.db.setMeta("backup", {
			...e,
			savesSinceExport: e.savesSinceExport + 1
		});
	}
	async patchManual(e, t) {
		let n = await this.getSave(e);
		if (!n || n.deletedAt !== void 0) throw new Q("E_NOT_FOUND", "没有找到这个存档");
		if (n.kind === "auto") throw new Q("E_AUTO_NOT_DELETABLE", "自动存档不能改名或加备注");
		let r = {
			...n,
			...t
		};
		return await this.db.saves.put(r), r;
	}
	async requireWorkspace(e) {
		let t = await this.getWorkspace(e);
		if (!t) throw new Q("E_NO_WORKSPACE", "还没有当前战役");
		return t;
	}
	requireRule(e) {
		let t = this.deps.rules.get(e);
		if (!t) throw new Q("E_RULE_MISSING", `需要先安装规则『${e}』`);
		return t;
	}
	async installedMap() {
		return new Map((await this.db.packs.toArray()).map((e) => [e.id, e]));
	}
}, cw = class {
	name;
	id;
	channel = null;
	listeners = /* @__PURE__ */ new Set();
	_readOnly = !1;
	startedAt;
	constructor(e = "tavern-trpg-assistant-lock", t = Date.now, n = _b()) {
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
}, lw = class {
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
function uw(e, t = []) {
	let n = e.list().map((e) => ({
		id: e.id,
		name: e.name,
		nameShort: e.nameShort,
		description: e.description,
		status: "installed"
	})), r = t.filter((t) => !e.has(t.id)).map((e) => ({ ...e }));
	return [...n, ...r];
}
// src/rules/dnd5e2014/index.ts
var dw = "dnd5e2014", fw = {
	id: dw,
	name: "D&D 5e（2014）",
	nameShort: "D&D 5e",
	description: "龙与地下城第五版（2014 规则），核心规则含玩家手册、地下城主指南与怪物图鉴",
	corePackIds: ["dnd5e2014-srd"],
	builtinPacks: ["dnd5e2014-srd"],
	defaultBanner: {
		wide: "https://a1.ax1x.com/2026/10/28/wwHs9.png",
		narrow: "https://a1.ax1x.com/2026/10/28/wwHs9.md.png",
		alt: "D&D 5e 默认战役横幅"
	}
};
// src/rules/index.ts
function pw() {
	let e = new lw();
	return e.register(fw), e;
}
// src/core/services.ts
var mw = "0.1.0";
function hw(e = {}) {
	let t = e.now ?? Date.now, n = e.rules ?? pw(), r = new RC(e.dbName ?? "tavern-trpg-assistant");
	return {
		db: r,
		rules: n,
		packs: new qC(r, {
			rules: n,
			now: t,
			appVersion: e.appVersion ?? "0.1.0"
		}),
		campaign: new sw(r, {
			rules: n,
			now: t,
			...e.campaign
		}),
		lock: new cw(),
		now: t
	};
}
// node_modules/pinia/dist/pinia.js
var gw = typeof window < "u", _w, vw = (e) => _w = e, yw = Symbol();
function bw(e) {
	return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function";
}
var xw = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof global == "object" && global.global === global ? global : typeof globalThis == "object" ? globalThis : { HTMLElement: null };
function Sw(e, { autoBom: t = !1 } = {}) {
	return t && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["﻿", e], { type: e.type }) : e;
}
function Cw(e, t, n) {
	let r = new XMLHttpRequest();
	r.open("GET", e), r.responseType = "blob", r.onload = function() {
		Ow(r.response, t, n);
	}, r.onerror = function() {
		console.error("could not download file");
	}, r.send();
}
function ww(e) {
	let t = new XMLHttpRequest();
	t.open("HEAD", e, !1);
	try {
		t.send();
	} catch {}
	return t.status >= 200 && t.status <= 299;
}
function Tw(e) {
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
var Ew = typeof navigator == "object" ? navigator : { userAgent: "" }, Dw = /Macintosh/.test(Ew.userAgent) && /AppleWebKit/.test(Ew.userAgent) && !/Safari/.test(Ew.userAgent), Ow = gw ? typeof HTMLAnchorElement < "u" && "download" in HTMLAnchorElement.prototype && !Dw ? kw : "msSaveOrOpenBlob" in Ew ? Aw : jw : () => {};
function kw(e, t = "download", n) {
	let r = document.createElement("a");
	r.download = t, r.rel = "noopener", typeof e == "string" ? (r.href = e, r.origin === location.origin ? Tw(r) : ww(r.href) ? Cw(e, t, n) : (r.target = "_blank", Tw(r))) : (r.href = URL.createObjectURL(e), setTimeout(function() {
		URL.revokeObjectURL(r.href);
	}, 4e4), setTimeout(function() {
		Tw(r);
	}, 0));
}
function Aw(e, t = "download", n) {
	if (typeof e == "string") {
		if (ww(e)) Cw(e, t, n);
		else {
			let t = document.createElement("a");
			t.href = e, t.target = "_blank", setTimeout(function() {
				Tw(t);
			});
		}
	} else navigator.msSaveOrOpenBlob(Sw(e, n), t);
}
function jw(e, t, n, r) {
	if (r ||= open("", "_blank"), r && (r.document.title = r.document.body.innerText = "downloading..."), typeof e == "string") return Cw(e, t, n);
	let i = e.type === "application/octet-stream", a = /constructor/i.test(String(xw.HTMLElement)) || "safari" in xw, o = /CriOS\/[\d]+/.test(navigator.userAgent);
	if ((o || i && a || Dw) && typeof FileReader < "u") {
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
var { assign: Mw } = Object;
function Nw() {
	let e = Ye(!0), t = e.run(() => /* @__PURE__ */ I({})), n = [], r = [], i = xn({
		install(e) {
			vw(i), i._a = e, e.provide(yw, i), e.config.globalProperties.$pinia = i, r.forEach((e) => n.push(e)), r = [];
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
var Pw = () => {};
function Fw(e, t, n, r = Pw) {
	e.add(t);
	let i = () => {
		e.delete(t) && r();
	};
	return !n && Xe() && Ze(i), i;
}
function Iw(e, ...t) {
	e.forEach((e) => {
		e(...t);
	});
}
var Lw = (e) => e(), Rw = Symbol(), zw = Symbol();
function Bw(e, t) {
	e instanceof Map && t instanceof Map ? t.forEach((t, n) => e.set(n, t)) : e instanceof Set && t instanceof Set && t.forEach(e.add, e);
	for (let n in t) {
		if (!Object.hasOwn(t, n)) continue;
		let r = t[n], i = e[n];
		if (bw(i) && bw(r) && Object.hasOwn(e, n) && !/* @__PURE__ */ wn(r) && !/* @__PURE__ */ _n(r)) {
			e[n] = Bw(i, r);
			let t = (/* @__PURE__ */ F(e))[n];
			/* @__PURE__ */ wn(t) && /* @__PURE__ */ yn(t) && On(t);
		} else e[n] = r;
	}
	return e;
}
var Vw = Symbol();
function Hw(e) {
	return !e || typeof e != "object" || !Object.hasOwn(e, Vw);
}
var { assign: Uw } = Object;
function Ww(e) {
	return !!(/* @__PURE__ */ wn(e) && e.effect);
}
function Gw(e, t, n, r) {
	let { state: i, actions: a, getters: o } = t, s = n.state.value[e], c;
	function l() {
		return s || 
		/* istanbul ignore if */
		(n.state.value[e] = i ? i() : {}), Uw(/* @__PURE__ */ Pn(n.state.value[e]), a, Object.keys(o || {}).reduce((t, r) => (t[r] = xn(J(() => {
			vw(n);
			let t = n._s.get(e);
			return o[r].call(t, t);
		})), t), {}));
	}
	return c = Kw(e, l, t, n, r, !0), c;
}
function Kw(e, t, n = {}, r, i, a) {
	let o, s = Uw({ actions: {} }, n), c = { deep: !0 }, l, u, d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), p, m = r.state.value[e];
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
		}) : (Bw(r.state.value[e], t), n = {
			type: "patch object",
			payload: t,
			storeId: e,
			events: p
		});
		let i = h = Symbol();
		pr().then(() => {
			h === i && (l = !0);
		}), u = !0, Iw(d, n, r.state.value[e]);
	}
	let _ = a ? function() {
		let { state: e } = n, t = e ? e() : {};
		this.$patch((e) => {
			Uw(e, t);
		});
	} : Pw;
	function v() {
		o.stop(), d.clear(), f.clear(), r._s.delete(e);
	}
	let y = (t, n = "") => {
		if (Rw in t) return t[zw] = n, t;
		let i = function() {
			vw(r);
			let n = Array.from(arguments), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
			function s(e) {
				a.add(e);
			}
			function c(e) {
				o.add(e);
			}
			Iw(f, {
				args: n,
				name: i[zw],
				store: b,
				after: s,
				onError: c
			});
			let l;
			try {
				l = t.apply(this && this.$id === e ? this : b, n);
			} catch (e) {
				throw Iw(o, e), e;
			}
			return l instanceof Promise ? l.then((e) => (Iw(a, e), e)).catch((e) => (Iw(o, e), Promise.reject(e))) : (Iw(a, l), l);
		};
		return i[Rw] = !0, i[zw] = n, i;
	}, b = /* @__PURE__ */ fn({
		_p: r,
		$id: e,
		$onAction: Fw.bind(null, f),
		$patch: g,
		$reset: _,
		$subscribe(t, n = {}) {
			if (d.has(t)) return Pw;
			let i = Fw(d, t, n.detached, () => a()), a = o.run(() => Ur(() => r.state.value[e], (r) => {
				(n.flush === "sync" ? u : l) && t({
					storeId: e,
					type: "direct",
					events: p
				}, r);
			}, Uw({}, c, n)));
			return i;
		},
		$dispose: v
	});
	r._s.set(e, b);
	let x = (r._a && r._a.runWithContext || Lw)(() => r._e.run(() => (o = Ye()).run(() => t({ action: y }))));
	for (let t in x) {
		let n = x[t];
		/* @__PURE__ */ wn(n) && !Ww(n) || /* @__PURE__ */ _n(n) ? a || (m && Hw(n) && (/* @__PURE__ */ wn(n) ? n.value = m[t] : ((n instanceof Set || n instanceof Map) && n.clear(), Bw(n, m[t]))), r.state.value[e][t] = n) : typeof n == "function" && (x[t] = y(n, t), s.actions[t] = n);
	}
	return Uw(b, x), Uw(/* @__PURE__ */ F(b), x), Object.defineProperty(b, "$state", {
		get: () => r.state.value[e],
		set: (e) => {
			g((t) => {
				Uw(t, e);
			});
		}
	}), r._p.forEach((e) => {
		let t = o.run(() => e({
			store: b,
			app: r._a,
			pinia: r,
			options: s
		}));
		Uw(b, t);
	}), m && a && n.hydrate && n.hydrate(b.$state, m), l = !0, u = !0, b;
}
function qw(e, t, n) {
	let r, i = typeof t == "function";
	r = i ? n : t;
	function a(n, a) {
		let o = Lr();
		return n ||= o ? Ir(yw, null) : null, n && vw(n), n = _w, n._s.has(e) || (i ? Kw(e, t, r, n) : Gw(e, r, n)), n._s.get(e);
	}
	return a.$id = e, a;
}
// src/core/libraryQueue.ts
var Jw = class {
	tail = Promise.resolve();
	entries = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	enqueue(e) {
		let t = this.entries.get(e.id);
		if (t) return t.promise;
		let n = new AbortController(), r = {
			label: e.label,
			state: "waiting",
			controller: n,
			promise: Promise.resolve()
		}, i = async () => {
			if (n.signal.aborted) throw new Q("E_CANCELLED", "已取消");
			return r.state = "running", this.emit(), e.run(n.signal);
		}, a = this.tail.then(i, i).finally(() => {
			this.entries.delete(e.id), this.emit();
		});
		return r.promise = a, this.entries.set(e.id, r), this.tail = a.catch(() => void 0), this.emit(), a;
	}
	cancel(e) {
		let t = this.entries.get(e);
		return t ? (t.controller.abort(), !0) : !1;
	}
	state(e) {
		return this.entries.get(e)?.state;
	}
	snapshot() {
		return [...this.entries].map(([e, t]) => ({
			id: e,
			label: t.label,
			state: t.state
		}));
	}
	get busy() {
		return this.entries.size > 0;
	}
	onChange(e) {
		return this.listeners.add(e), () => this.listeners.delete(e);
	}
	emit() {
		for (let e of this.listeners) e();
	}
};
// src/core/packs/catalogUrl.ts
function Yw(e) {
	let t = globalThis.__TRPG_M2_CATALOG_URL__;
	return t ? typeof location < "u" ? new URL(t, location.href).toString() : t : e.catalogUrl;
}
// src/stores/app.ts
var Xw = qw("app", () => {
	let e = /* @__PURE__ */ Tn(null), t = /* @__PURE__ */ I(!1), n = /* @__PURE__ */ I(""), r = /* @__PURE__ */ I(null), i = /* @__PURE__ */ I(null), a = new Jw();
	function o() {
		if (!e.value) throw Error("助手尚未启动完成");
		return e.value;
	}
	function s(t) {
		e.value = t;
	}
	async function c() {
		let e = await mb(o().db);
		return r.value = e, e;
	}
	async function l() {
		let e = o(), [t, n] = await Promise.all([pb(e.db), mb(e.db)]);
		r.value = n, i.value = fb(t, n, e.now());
	}
	function u() {
		return Yw(r.value ?? { catalogUrl: "https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json" });
	}
	return {
		services: e,
		booted: t,
		bootError: n,
		settings: r,
		reminder: i,
		queue: a,
		svc: o,
		setServices: s,
		refreshSettings: c,
		refreshBackup: l,
		catalogUrl: u
	};
}), Zw = 500, Qw = qw("campaign", () => {
	let e = null, t, n = /* @__PURE__ */ Tn(null), r = /* @__PURE__ */ Tn(null), i = /* @__PURE__ */ I(!1), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(!1), s = J(() => r.value !== null), c = /* @__PURE__ */ Tn(null), l = 0;
	function u() {
		if (!e) throw Error("存档服务尚未初始化");
		return e;
	}
	function d() {
		if (i.value) throw new Q("E_READ_ONLY", "另一个窗口正在使用助手，此窗口为只读");
	}
	function f(e) {
		r.value = e, o.value = e ? ew(e) : !1;
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
		if (d(), !r.value) throw new Q("E_NO_WORKSPACE", "还没有当前战役");
		f({
			...r.value,
			data: e(r.value.data)
		}), t !== void 0 && clearTimeout(t), t = setTimeout(() => void g(), Zw);
	}
	async function v(e) {
		if (d(), !n.value) throw new Q("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
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
		if (d(), !n.value) throw new Q("E_NO_WORKSPACE", "还没有当前战役");
		await g();
		let t = await u().campaign.branch(n.value.ownerKey, e);
		return f(t.workspace), t.save;
	}
	async function x(e, t = {}) {
		if (d(), !n.value) throw new Q("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
		await g(), f(await u().campaign.loadSave(n.value, e, t));
	}
	async function S(e, t) {
		if (d(), !n.value) throw new Q("E_NO_WORKSPACE", "还没有当前战役");
		await g();
		let r = await u().campaign.setPackEnabled(n.value.ownerKey, e, t);
		return f(r.workspace), r.autoEnabled;
	}
	return {
		owner: n,
		workspace: r,
		readOnly: i,
		ready: a,
		dirty: o,
		hasCampaign: s,
		currentSave: c,
		init: m,
		switchOwner: h,
		refreshCurrentSave: p,
		flush: g,
		updateData: _,
		startNew: v,
		save: y,
		branch: b,
		load: x,
		setPackEnabled: S
	};
});
// src/host/input.ts
function $w(e) {
	let t = f();
	if (!t) return !1;
	let n = t.value, r = n ? `${n}${n.endsWith("\n") ? "" : "\n"}${e}` : e;
	return _(t, r), t.value === r;
}
// src/host/clipboard.ts
async function eT(e) {
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
var tT = 1e3, nT = "例如 2d6+3、1d20+5、4d6";
function rT(e) {
	let t = e.replace(/\s+/g, "").toLowerCase().replace(/＋/g, "+").replace(/－|−/g, "-");
	if (!t) return {
		ok: !1,
		error: `请输入骰式，${nT}`
	};
	let n = [], r = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/y, i = 0;
	for (; i < t.length;) {
		r.lastIndex = i;
		let a = r.exec(t);
		if (!a || i > 0 && !(a[1] || a[4])) return {
			ok: !1,
			error: `骰式看不懂：「${e.trim()}」。${nT}`
		};
		if (i = r.lastIndex, a[3] !== void 0) {
			let e = a[1] === "-" ? -1 : 1, t = a[2] === "" ? 1 : Number(a[2]), r = Number(a[3]);
			if (t < 1 || t > 100) return {
				ok: !1,
				error: "一次最多掷 100 颗骰子"
			};
			if (r < 2 || r > 1e3) return {
				ok: !1,
				error: `骰子面数要在 2 到 ${tT} 之间`
			};
			n.push({
				kind: "dice",
				count: t,
				sides: r,
				sign: e
			});
		} else {
			let e = Number(a[5]);
			if (!Number.isSafeInteger(e) || e > 1e5) return {
				ok: !1,
				error: "数字太大了"
			};
			n.push({
				kind: "const",
				value: e,
				sign: a[4] === "-" ? -1 : 1
			});
		}
		if (n.length > 20) return {
			ok: !1,
			error: "骰式最多 20 项"
		};
	}
	return n.some((e) => e.kind === "dice") ? {
		ok: !0,
		terms: n
	} : {
		ok: !1,
		error: `骰式里至少要有一组骰子，${nT}`
	};
}
function iT(e) {
	return e.map((e, t) => {
		let n = e.sign === -1 ? "-" : t === 0 ? "" : "+";
		return e.kind === "dice" ? `${n}${e.count}d${e.sides}` : `${n}${e.value}`;
	}).join("");
}
// src/rules/dice/roll.ts
var aT = () => {
	let e = /* @__PURE__ */ new Uint32Array(1);
	return crypto.getRandomValues(e), e[0] / 4294967296;
};
function oT(e, t) {
	return Math.min(t, Math.floor(e() * t) + 1);
}
function sT(e, t = {}) {
	let n = rT(e);
	if (!n.ok) throw Error(n.error);
	let r = t.rng ?? aT, i = t.mode ?? "normal", a = [...n.terms];
	t.bonus && a.push({
		kind: "const",
		value: Math.abs(t.bonus),
		sign: t.bonus < 0 ? -1 : 1
	});
	let o, s = !1, c = a.map((e) => {
		if (e.kind === "const") return {
			term: e,
			rolls: [],
			subtotal: e.sign * e.value
		};
		let t = e.count === 1 && e.sides === 20;
		if (t && i !== "normal") {
			let t = [oT(r, 20), oT(r, 20)], n = i === "adv" ? t[0] >= t[1] ? 0 : 1 : t[0] <= t[1] ? 0 : 1;
			return !s && e.sign === 1 && (s = !0, o = t[n] === 20 ? 20 : t[n] === 1 ? 1 : void 0), {
				term: e,
				rolls: t,
				kept: n,
				subtotal: e.sign * t[n]
			};
		}
		let n = Array.from({ length: e.count }, () => oT(r, e.sides));
		return t && !s && e.sign === 1 && (s = !0, o = n[0] === 20 ? 20 : n[0] === 1 ? 1 : void 0), {
			term: e,
			rolls: n,
			subtotal: e.sign * n.reduce((e, t) => e + t, 0)
		};
	});
	return {
		expression: iT(a),
		mode: i,
		terms: c,
		total: c.reduce((e, t) => e + t.subtotal, 0),
		...o ? { natural: o } : {}
	};
}
// src/rules/dice/format.ts
var cT = {
	normal: "",
	adv: " 优势",
	dis: " 劣势"
};
function lT(e) {
	return e.terms.map((t, n) => {
		let r = t.term.sign === -1 ? "- " : n === 0 ? "" : "+ ";
		return t.term.kind === "const" ? `${r}${t.term.value}` : t.kept === void 0 ? `${r}${t.rolls.join(" + ")}` : `${r}取${e.mode === "adv" ? "高" : "低"} ${t.rolls.join("/")}`;
	}).join(" ");
}
function uT(e) {
	return `${e.expression}${cT[e.mode]} = ${e.total}（${lT(e)}）`;
}
function dT(e, t) {
	let n = t.trim().replace(/-{2,}/g, "—").replace(/[<>]/g, "");
	return `<!-- [掷骰] ${n ? `${n}：` : ""}${e} -->`;
}
var fT = "trpg-assistant:dice";
function pT(e) {
	return e ? `${fT}:${e}` : fT;
}
function mT(e) {
	let t = {
		history: [],
		bonus: 0,
		mode: "normal",
		note: ""
	};
	try {
		let n = localStorage.getItem(pT(e));
		if (!n) return t;
		let r = JSON.parse(n);
		return {
			history: Array.isArray(r.history) ? r.history.slice(0, 20) : [],
			bonus: Number.isFinite(r.bonus) ? Math.min(30, Math.max(-20, r.bonus)) : 0,
			mode: r.mode === "adv" || r.mode === "dis" ? r.mode : "normal",
			note: typeof r.note == "string" ? r.note : ""
		};
	} catch (e) {
		return console.warn("[trpg-assistant] 读取掷骰记录失败", e), t;
	}
}
var hT = qw("dice", () => {
	let e = null, t = aT, n = 1, r, i = mT(null), a = /* @__PURE__ */ I(i.history), o = /* @__PURE__ */ I(i.bonus), s = /* @__PURE__ */ I(i.mode), c = /* @__PURE__ */ I(i.note), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(null), d = /* @__PURE__ */ I(""), f = /* @__PURE__ */ I("idle"), p = /* @__PURE__ */ I(!1);
	function m() {
		try {
			localStorage.setItem(pT(e), JSON.stringify({
				history: a.value,
				bonus: o.value,
				mode: s.value,
				note: c.value
			}));
		} catch (e) {
			console.warn("[trpg-assistant] 保存掷骰记录失败", e);
		}
	}
	function h(t) {
		e = t;
		let n = mT(t);
		a.value = n.history, o.value = n.bonus, s.value = n.mode, c.value = n.note, u.value = null, d.value = "";
	}
	function g(e) {
		t = e;
	}
	function _(e) {
		let t = {
			id: n++,
			at: Date.now(),
			note: c.value.trim(),
			expression: e.expression,
			mode: e.mode,
			total: e.total,
			line: uT(e),
			...e.natural ? { natural: e.natural } : {}
		};
		return u.value = t, a.value = [t, ...a.value].slice(0, 20), f.value = "idle", p.value = !1, d.value = "", m(), t;
	}
	function v(e) {
		let n = e === 20;
		return _(sT(`1d${e}`, {
			rng: t,
			mode: n ? s.value : "normal",
			bonus: n ? o.value : 0
		}));
	}
	function y() {
		try {
			return _(sT(l.value, {
				rng: t,
				mode: s.value
			}));
		} catch (e) {
			return d.value = e instanceof Error ? e.message : String(e), null;
		}
	}
	function b(e) {
		return _(sT(e.expression, {
			rng: t,
			mode: e.mode
		}));
	}
	function x(e) {
		o.value = Math.min(30, Math.max(-20, Math.round(e))), m();
	}
	function S(e) {
		s.value = e, m();
	}
	function C(e) {
		c.value = e, m();
	}
	function w() {
		a.value = [], m();
	}
	let T = (e) => dT(e.line, e.note);
	function ee() {
		if (!u.value) return !1;
		let e = $w(T(u.value));
		return f.value = e ? "done" : "failed", r !== void 0 && clearTimeout(r), e && (r = setTimeout(() => f.value = "idle", 2e3)), e;
	}
	async function E() {
		return u.value ? (p.value = await eT(T(u.value)), p.value) : !1;
	}
	return {
		history: a,
		bonus: o,
		mode: s,
		note: c,
		expression: l,
		last: u,
		error: d,
		fillState: f,
		copied: p,
		setOwner: h,
		setRng: g,
		rollQuick: v,
		rollExpression: y,
		reroll: b,
		setBonus: x,
		setMode: S,
		setNote: C,
		clearHistory: w,
		fill: ee,
		copy: E,
		commentOf: T
	};
}), gT = qw("library", () => {
	let e = Xw(), t = /* @__PURE__ */ Tn([]), n = /* @__PURE__ */ Tn(null), r = /* @__PURE__ */ I("idle"), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I({}), o = J(() => new Map(t.value.map((e) => [e.id, e]))), s = J(() => n.value ? mC(t.value, n.value) : []);
	function c(e) {
		return n.value ? hC(t.value, n.value, e) : [];
	}
	async function l() {
		t.value = await e.svc().packs.list();
	}
	async function u(t = !1) {
		r.value = "loading";
		try {
			let a = e.svc();
			return n.value = await dC({
				url: e.catalogUrl(),
				db: a.db,
				force: t
			}), r.value = "ok", i.value = "", !0;
		} catch (e) {
			return console.error("[trpg-assistant] 读取数据仓库目录失败", e), r.value = "error", i.value = e instanceof Error ? e.message : String(e), !1;
		}
	}
	function d(e, t) {
		let n = a.value[e] ?? {
			id: e,
			state: "waiting",
			received: 0,
			total: 0
		};
		a.value = {
			...a.value,
			[e]: {
				...n,
				...t
			}
		};
	}
	function f(e) {
		let { [e]: t, ...n } = a.value;
		a.value = n;
	}
	function p(e) {
		let t = [], r = /* @__PURE__ */ new Set(), i = (e) => {
			if (!r.has(e.id)) {
				r.add(e.id);
				for (let t of e.relationships.requires) {
					if (o.value.has(t.id)) continue;
					let e = n.value?.packs.find((e) => e.id === t.id);
					e && i(e);
				}
				t.push(e);
			}
		};
		return i(e), t;
	}
	async function m(t) {
		let n = p(t), r = !0;
		for (let e of n) d(e.id, {
			state: "waiting",
			received: 0,
			total: e.byteSize,
			error: void 0
		});
		let i = n.map((n) => e.queue.enqueue({
			id: `pack:${n.id}`,
			label: `安装 ${n.name}`,
			run: async (t) => {
				let r = e.svc();
				d(n.id, {
					state: "downloading",
					total: n.byteSize
				});
				let i = await fC(n, {
					catalogUrl: e.catalogUrl(),
					signal: t,
					onProgress: (e, t) => d(n.id, {
						received: e,
						total: t
					})
				});
				d(n.id, { state: "installing" }), await pC(r.packs, i, n);
			}
		}).then(async () => {
			f(n.id), await l();
		}).catch((e) => {
			n.id === t.id && (r = !1), e instanceof Q && e.code === "E_CANCELLED" ? f(n.id) : (console.error(`[trpg-assistant] 安装失败：${n.id}`, e), d(n.id, {
				state: "failed",
				error: e instanceof Error ? e.message : String(e)
			}));
		}));
		return await Promise.all(i), r;
	}
	async function h(t, n) {
		try {
			return await e.queue.enqueue({
				id: `file:${t.manifest.id}`,
				label: `导入 ${t.manifest.name}`,
				run: () => e.svc().packs.install(t, {
					source: "import",
					resolution: n
				})
			});
		} finally {
			await l();
		}
	}
	function g(t) {
		let n = () => t.some((t) => e.queue.state(`pack:${t}`) !== void 0);
		return n() ? new Promise((t) => {
			let r = e.queue.onChange(() => {
				n() || (r(), t());
			});
		}) : Promise.resolve();
	}
	async function _(t) {
		let r = e.svc();
		if ((await r.db.getMeta("autoInstall"))?.[t]?.done || !n.value) return;
		let i = /* @__PURE__ */ new Set([...await vC(r.db), ...await _C(r.db)]), a = n.value.packs.filter((e) => e.ruleId === t && e.recommended && !o.value.has(e.id) && !i.has(e.id));
		await Promise.all(a.map((e) => m(e)));
		let s = n.value.packs.some((e) => e.ruleId === t && e.recommended && !i.has(e.id) && !o.value.has(e.id)), c = { ...await r.db.getMeta("autoInstall") ?? {} };
		c[t] = s ? { done: !1 } : {
			done: !0,
			at: r.now()
		}, await r.db.setMeta("autoInstall", c);
	}
	function v(t) {
		e.queue.cancel(`pack:${t}`);
	}
	function y(t) {
		return e.queue.state(`pack:${t}`);
	}
	return {
		installed: t,
		catalog: n,
		catalogState: r,
		catalogError: i,
		tasks: a,
		installedMap: o,
		updates: s,
		downloadable: c,
		refreshInstalled: l,
		loadCatalog: u,
		install: m,
		installFile: h,
		waitFor: g,
		ensureRecommended: _,
		cancel: v,
		queueState: y,
		clearTask: f
	};
}), _T = {
	success: 4e3,
	info: 4e3,
	undo: 6e3,
	error: 8e3,
	status: 6e3
}, vT = qw("toast", () => {
	let e = /* @__PURE__ */ I([]), t = /* @__PURE__ */ new Map(), n = 1;
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
		let s = n++;
		for (e.value = [...e.value, {
			id: s,
			kind: t,
			message: a,
			undo: o
		}]; e.value.length > 3;) r(e.value[0].id);
		return i(s, _T[t]), s;
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
	return {
		toasts: e,
		push: a,
		dismiss: r,
		pause: o,
		resume: s,
		runUndo: c,
		success: (e) => a("success", e),
		info: (e) => a("info", e),
		status: (e) => a("status", e),
		undoable: (e, t) => a("undo", e, t),
		error: (e) => a("error", e)
	};
});
// src/ui/shell/boot.ts
async function yT(e, t) {
	let n = Xw(t), r = vT(t), i = Qw(t), a = hT(t), o = gT(t);
	try {
		let e = hw();
		n.setServices(e);
		let t = e.rules.get(dw);
		if (!t) throw Error("规则未注册");
		let s = await yC(e.db, e.packs, t, xb);
		s.failed.length && (console.error("[trpg-assistant] 内置内容包安装失败", s.failed), r.error(`内置规则资料安装失败：${s.failed.map((e) => e.message).join("；")}`)), await gb(e.db), await o.refreshInstalled(), await n.refreshBackup();
		let c = vb(d());
		await i.init(e, c), a.setOwner(c?.ownerKey ?? null), n.booted = !0;
	} catch (e) {
		return console.error("[trpg-assistant] 启动失败", e), n.bootError = e instanceof Error ? e.message : String(e), () => void 0;
	}
	let s = Ur(() => [i.workspace?.currentSaveId, i.workspace?.savedHash], () => void i.refreshCurrentSave().catch((e) => console.error("[trpg-assistant] 读取当前存档信息失败", e)), { immediate: !0 }), c = Ur(() => i.readOnly, (e) => {
		e && r.status("另一个窗口正在使用助手，这里只能查看");
	}, { immediate: !0 }), l = g(e, h(e, "CHAT_CHANGED", "chat_id_changed"), () => {
		let e = vb(d());
		i.switchOwner(e).catch((e) => {
			console.error("[trpg-assistant] 切换聊天后载入战役数据失败", e), r.error("切换聊天后载入战役数据失败，请重新打开助手");
		}), a.setOwner(e?.ownerKey ?? null);
	});
	return () => {
		c(), s(), l();
	};
}
// src/stores/ui.ts
var bT = {
	home: "首页",
	library: "库",
	settings: "设置"
}, xT = qw("ui", () => {
	let e = /* @__PURE__ */ I(!1), t = /* @__PURE__ */ I("home"), n = /* @__PURE__ */ I(!1), r = /* @__PURE__ */ I("ext"), i = /* @__PURE__ */ I(null);
	function a(e) {
		t.value = e;
	}
	function o(n, a) {
		r.value = n, i.value = a ?? null, t.value = "library", e.value = !0;
	}
	return {
		windowOpen: e,
		page: t,
		diceOpen: n,
		librarySegment: r,
		libraryFocusPack: i,
		go: a,
		openLibrary: o
	};
}), ST = [
	"data-kind",
	"onPointerenter",
	"onPointerleave",
	"onFocusin",
	"onFocusout"
], CT = { class: "trpg-toast__text" }, wT = ["onClick"], TT = /* @__PURE__ */ z({
	__name: "ToastHost",
	setup(e) {
		let t = vT();
		return (e, n) => (H(), W(Ql, {
			name: "trpg-toast",
			tag: "div",
			class: "trpg-toasts",
			role: "status",
			"aria-live": "polite"
		}, {
			default: R(() => [(H(!0), U(V, null, ja(L(t).toasts, (e) => (H(), U("div", {
				key: e.id,
				class: "trpg-toast",
				"data-kind": e.kind,
				onPointerenter: (n) => L(t).pause(e.id),
				onPointerleave: (n) => L(t).resume(e.id),
				onFocusin: (n) => L(t).pause(e.id),
				onFocusout: (n) => L(t).resume(e.id)
			}, [G("span", CT, M(e.message), 1), e.undo ? (H(), U("button", {
				key: 0,
				type: "button",
				onClick: (n) => L(t).runUndo(e.id)
			}, "撤销", 8, wT)) : q("", !0)], 40, ST))), 128))]),
			_: 1
		}));
	}
}), ET = {
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
	x: "<path d=\"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z\"/>"
}, DT = [
	"width",
	"height",
	"innerHTML"
], OT = /* @__PURE__ */ z({
	__name: "Icon",
	props: {
		name: {},
		size: {}
	},
	setup(e) {
		let t = e, n = J(() => ET[t.name] ?? ""), r = J(() => `${t.size ?? 18}px`);
		return (e, t) => (H(), U("svg", {
			class: "trpg-icon",
			viewBox: "0 0 256 256",
			fill: "currentColor",
			"aria-hidden": "true",
			focusable: "false",
			width: r.value,
			height: r.value,
			innerHTML: n.value
		}, null, 8, DT));
	}
}), kT = ["aria-label"], AT = ["aria-pressed", "onClick"], jT = /* @__PURE__ */ z({
	__name: "Segmented",
	props: /*@__PURE__*/ Qa({
		options: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = xo(e, "modelValue");
		return (n, r) => (H(), U("div", {
			class: "trpg-seg",
			role: "group",
			"aria-label": e.label
		}, [(H(!0), U(V, null, ja(e.options, (e) => (H(), U("button", {
			key: e.value,
			type: "button",
			"aria-pressed": t.value === e.value,
			onClick: (n) => t.value = e.value
		}, M(e.label), 9, AT))), 128))], 8, kT));
	}
});
// src/ui/shell/storage.ts
function MT(e, t) {
	try {
		let n = localStorage.getItem(e);
		if (!n) return t;
		let r = JSON.parse(n);
		return Number.isFinite(r.x) && Number.isFinite(r.y) ? r : t;
	} catch (e) {
		return console.warn("[trpg-assistant] 读取窗口位置失败", e), t;
	}
}
function NT(e, t) {
	try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/useDrag.ts
function PT(e, t, n) {
	return Math.min(Math.max(e, t), Math.max(t, n));
}
function FT(e) {
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
				x: (typeof e.lockX == "function" ? e.lockX() : e.lockX) ? s.x : PT(s.x + r, 0, window.innerWidth - l),
				y: PT(s.y + i, 0, window.innerHeight - u)
			};
		}, u = (t) => {
			i.removeEventListener("pointermove", l), i.removeEventListener("pointerup", u), i.removeEventListener("pointercancel", u), i.hasPointerCapture(t.pointerId) && i.releasePointerCapture(t.pointerId), c ? e.onEnd?.() : e.onTap?.();
		};
		i.addEventListener("pointermove", l), i.addEventListener("pointerup", u), i.addEventListener("pointercancel", u);
	}
	return { onPointerDown: n };
}
// src/ui/shell/DiceTray.vue?vue&type=script&setup=true&lang.ts
var IT = ["data-narrow"], LT = { class: "trpg-dice__body" }, RT = ["data-natural"], zT = {
	class: "trpg-dice__line",
	"data-testid": "dice-line"
}, BT = ["data-tone"], VT = {
	key: 1,
	class: "trpg-dice__placeholder"
}, HT = {
	class: "trpg-dice__quick",
	role: "group",
	"aria-label": "快捷骰"
}, UT = ["onClick"], WT = { class: "trpg-dice__mods" }, GT = {
	class: "trpg-dice__bonus",
	role: "group",
	"aria-label": "d20 加值"
}, KT = ["disabled"], qT = {
	class: "trpg-dice__bonus-value",
	"data-testid": "dice-bonus"
}, JT = ["disabled"], YT = { class: "trpg-field" }, XT = { class: "trpg-dice__expr-row" }, ZT = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, QT = { class: "trpg-field" }, $T = ["value"], eE = { class: "trpg-dice__out" }, tE = ["disabled"], nE = ["disabled"], rE = {
	class: "trpg-dice__recent",
	"aria-label": "最近记录"
}, iE = { class: "trpg-dice__recent-head" }, aE = ["aria-expanded"], oE = {
	key: 1,
	class: "trpg-field__label"
}, sE = {
	key: 0,
	class: "trpg-dice__list"
}, cE = { class: "trpg-dice__item-total" }, lE = { class: "trpg-dice__item-main" }, uE = { class: "trpg-row__meta" }, dE = ["aria-label", "onClick"], fE = /* @__PURE__ */ z({
	__name: "DiceTray",
	setup(e) {
		let t = xT(), n = hT(), r = [
			4,
			6,
			8,
			10,
			12,
			20,
			100
		], i = [
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
		], a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I(window.innerWidth), s = /* @__PURE__ */ I(window.innerHeight), c = J(() => o.value <= 480), l = /* @__PURE__ */ I(MT("trpg-assistant:dice", {
			x: Math.max(8, window.innerWidth - 384),
			y: Math.max(8, window.innerHeight - 640)
		})), u = /* @__PURE__ */ I(!c.value), d = () => ({
			w: a.value?.offsetWidth ?? 360,
			h: a.value?.offsetHeight ?? 480
		});
		function f() {
			o.value = window.innerWidth, s.value = window.innerHeight;
			let { w: e, h: t } = d(), n = c.value ? 64 : 0;
			l.value = {
				x: c.value ? Math.round(o.value * .04) : Math.min(Math.max(l.value.x, 0), Math.max(0, o.value - e)),
				y: Math.min(Math.max(l.value.y, 0), Math.max(0, s.value - t - n))
			};
		}
		let p = FT({
			position: l,
			size: d,
			lockX: () => c.value,
			onEnd: () => NT("trpg-assistant:dice", l.value)
		}), m = J(() => c.value ? {
			left: "4vw",
			width: "92vw",
			top: `${l.value.y}px`
		} : {
			left: `${l.value.x}px`,
			top: `${l.value.y}px`
		});
		ma(() => {
			window.addEventListener("resize", f), pr(f);
		}), _a(() => window.removeEventListener("resize", f)), Ur(() => t.diceOpen, (e) => e && void pr(f));
		let h = J(() => n.bonus > 0 ? `+${n.bonus}` : String(n.bonus)), g = J(() => n.fillState === "done" ? "已填入 ✓" : n.fillState === "failed" ? "尚未填入，再试一次" : "填入输入框"), _ = (e) => new Date(e).toLocaleTimeString("zh-CN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: !1
		});
		return (e, o) => L(t).diceOpen ? (H(), U("aside", {
			key: 0,
			ref_key: "el",
			ref: a,
			class: "trpg-dice",
			style: Oe(m.value),
			"data-narrow": c.value,
			role: "dialog",
			"aria-label": "掷骰",
			"aria-modal": "false"
		}, [G("header", {
			class: "trpg-dice__head",
			onPointerdown: o[1] ||= (...e) => L(p).onPointerDown && L(p).onPointerDown(...e)
		}, [
			K(OT, {
				name: "dice-five",
				size: 20
			}),
			o[14] ||= G("span", { class: "trpg-dice__title" }, "掷骰", -1),
			G("button", {
				class: "trpg-icon-btn",
				type: "button",
				"aria-label": "关闭掷骰",
				onClick: o[0] ||= (e) => L(t).diceOpen = !1
			}, [K(OT, {
				name: "x",
				size: 18
			})])
		], 32), G("div", LT, [
			G("div", {
				class: "trpg-dice__result",
				"aria-live": "polite",
				"data-natural": L(n).last?.natural
			}, [L(n).last ? (H(), U(V, { key: 0 }, [
				(H(), U("div", {
					key: L(n).last.id,
					class: "trpg-dice__total",
					"data-testid": "dice-total"
				}, M(L(n).last.total), 1)),
				G("div", zT, M(L(n).last.line), 1),
				L(n).last.natural ? (H(), U("span", {
					key: 0,
					class: "trpg-badge",
					"data-tone": L(n).last.natural === 20 ? "gold" : "danger"
				}, "天然 " + M(L(n).last.natural), 9, BT)) : q("", !0)
			], 64)) : (H(), U("p", VT, "点一个骰子开始掷"))], 8, RT),
			G("div", HT, [(H(), U(V, null, ja(r, (e) => G("button", {
				key: e,
				class: Ne(["trpg-btn", { "trpg-btn--primary": e === 20 }]),
				type: "button",
				onClick: (t) => L(n).rollQuick(e)
			}, " d" + M(e), 11, UT)), 64))]),
			G("div", WT, [K(jT, {
				"model-value": L(n).mode,
				label: "优势或劣势（d20）",
				options: i,
				"onUpdate:modelValue": o[2] ||= (e) => L(n).setMode(e)
			}, null, 8, ["model-value"]), G("div", GT, [
				o[15] ||= G("span", { class: "trpg-field__label" }, "加值", -1),
				G("button", {
					class: "trpg-icon-btn",
					type: "button",
					"aria-label": "加值减 1",
					disabled: L(n).bonus <= L(-20),
					onClick: o[3] ||= (e) => L(n).setBonus(L(n).bonus - 1)
				}, "–", 8, KT),
				G("output", qT, M(h.value), 1),
				G("button", {
					class: "trpg-icon-btn",
					type: "button",
					"aria-label": "加值加 1",
					disabled: L(n).bonus >= L(30),
					onClick: o[4] ||= (e) => L(n).setBonus(L(n).bonus + 1)
				}, "+", 8, JT)
			])]),
			G("form", {
				class: "trpg-dice__expr",
				onSubmit: o[7] ||= ku((e) => L(n).rollExpression(), ["prevent"])
			}, [G("label", YT, [
				o[17] ||= G("span", { class: "trpg-field__label" }, "骰式", -1),
				G("span", XT, [Nr(G("input", {
					"onUpdate:modelValue": o[5] ||= (e) => L(n).expression = e,
					class: "trpg-input",
					type: "text",
					inputmode: "text",
					placeholder: "2d6+3",
					"aria-label": "骰式",
					autocomplete: "off",
					onKeydown: o[6] ||= ku(() => {}, ["stop"])
				}, null, 544), [[mu, L(n).expression]]), o[16] ||= G("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "submit"
				}, "掷", -1)]),
				L(n).error ? (H(), U("span", ZT, M(L(n).error), 1)) : q("", !0)
			])], 32),
			G("label", QT, [o[18] ||= G("span", { class: "trpg-field__label" }, "说明（可空）", -1), G("input", {
				value: L(n).note,
				class: "trpg-input",
				type: "text",
				placeholder: "感知检定",
				"aria-label": "说明",
				autocomplete: "off",
				onInput: o[8] ||= (e) => L(n).setNote(e.target.value),
				onKeydown: o[9] ||= ku(() => {}, ["stop"])
			}, null, 40, $T)]),
			G("div", eE, [G("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: !L(n).last,
				onClick: o[10] ||= (e) => L(n).fill()
			}, M(g.value), 9, tE), G("button", {
				class: "trpg-btn",
				type: "button",
				disabled: !L(n).last,
				onClick: o[11] ||= (e) => L(n).copy()
			}, M(L(n).copied ? "已复制 ✓" : "复制"), 9, nE)]),
			G("section", rE, [G("div", iE, [c.value ? (H(), U("button", {
				key: 0,
				class: "trpg-btn trpg-btn--quiet trpg-btn--small",
				type: "button",
				"aria-expanded": u.value,
				onClick: o[12] ||= (e) => u.value = !u.value
			}, [Vs(" 最近 " + M(L(n).history.length) + " 次", 1), K(OT, {
				name: u.value ? "caret-down" : "caret-right",
				size: 14
			}, null, 8, ["name"])], 8, aE)) : (H(), U("span", oE, "最近")), L(n).history.length ? (H(), U("button", {
				key: 2,
				class: "trpg-btn trpg-btn--quiet trpg-btn--small",
				type: "button",
				onClick: o[13] ||= (e) => L(n).clearHistory()
			}, "清空")) : q("", !0)]), u.value && L(n).history.length ? (H(), U("ul", sE, [(H(!0), U(V, null, ja(L(n).history, (e) => (H(), U("li", {
				key: e.id,
				class: "trpg-dice__item"
			}, [
				G("b", cE, M(e.total), 1),
				G("span", lE, [Vs(M(e.line), 1), e.note ? (H(), U(V, { key: 0 }, [Vs(" · " + M(e.note), 1)], 64)) : q("", !0)]),
				G("time", uE, M(_(e.at)), 1),
				G("button", {
					class: "trpg-icon-btn",
					type: "button",
					"aria-label": `再掷一次 ${e.expression}`,
					onClick: (t) => L(n).reroll(e)
				}, [K(OT, {
					name: "arrow-clockwise",
					size: 16
				})], 8, dE)
			]))), 128))])) : q("", !0)])
		])], 12, IT)) : q("", !0);
	}
}), pE = ["aria-expanded"], mE = 48, hE = /* @__PURE__ */ z({
	__name: "FloatingBall",
	setup(e) {
		let t = xT(), n = /* @__PURE__ */ I(MT("trpg-assistant:ball", {
			x: 16,
			y: Math.round(window.innerHeight / 2)
		}));
		function r() {
			n.value = {
				x: Math.min(Math.max(n.value.x, 0), Math.max(0, window.innerWidth - mE)),
				y: Math.min(Math.max(n.value.y, 0), Math.max(0, window.innerHeight - mE))
			};
		}
		ma(() => {
			r(), window.addEventListener("resize", r);
		}), _a(() => window.removeEventListener("resize", r));
		let i = FT({
			position: n,
			size: () => ({
				w: mE,
				h: mE
			}),
			onTap: () => {
				t.windowOpen = !t.windowOpen;
			},
			onEnd: () => NT("trpg-assistant:ball", n.value)
		}), a = J(() => ({
			left: `${n.value.x}px`,
			top: `${n.value.y}px`
		}));
		return (e, n) => (H(), U("button", {
			class: "trpg-ball",
			type: "button",
			"aria-label": "打开或收起 TRPG 跑团助手",
			"aria-expanded": L(t).windowOpen,
			style: Oe(a.value),
			onPointerdown: n[0] ||= (...e) => L(i).onPointerDown && L(i).onPointerDown(...e),
			onKeydown: [n[1] ||= ju(ku((e) => L(t).windowOpen = !L(t).windowOpen, ["prevent"]), ["enter"]), n[2] ||= ju(ku((e) => L(t).windowOpen = !L(t).windowOpen, ["prevent"]), ["space"])]
		}, [K(OT, {
			name: "dice-five",
			size: 26
		})], 44, pE));
	}
}), gE = qw("modal", () => {
	let e = /* @__PURE__ */ Tn([]), t = /* @__PURE__ */ Tn("forward"), n = J(() => e.value.length > 0), r = J(() => e.value[e.value.length - 1]), i = J(() => e.value.length), a = J(() => e.value[0]?.variant ?? "dialog");
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
		setTitle: h
	};
}), _E = ["data-variant"], vE = { class: "trpg-modal__head" }, yE = ["aria-label"], bE = ["inert", "aria-hidden"], xE = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])", SE = /* @__PURE__ */ z({
	__name: "ModalHost",
	setup(e) {
		let t = gE(), n = /* @__PURE__ */ I(null), r = /* @__PURE__ */ I(null), i = `trpg-modal-title-${Math.random().toString(36).slice(2, 8)}`, a = null, o = [], s = /* @__PURE__ */ new Map(), c = J(() => t.depth > 1 ? t.stack[t.depth - 2].title : ""), l = null;
		function u(e) {
			let t = e.composedPath()[0];
			l = t instanceof HTMLElement ? t.closest("button, a[href], input, select, textarea, [tabindex]") : null;
		}
		let d;
		ma(() => {
			d = n.value?.getRootNode(), d?.addEventListener("pointerdown", u, !0);
		}), _a(() => d?.removeEventListener("pointerdown", u, !0));
		function f() {
			let e = n.value?.getRootNode(), t = e instanceof ShadowRoot ? e.activeElement : document.activeElement, r = l && l.isConnected ? l : null;
			return r && (!t || t === document.body || t !== r && t.contains(r)) ? r : t && t !== document.body ? t : null;
		}
		function p() {
			let e = r.value;
			return e ? [e.querySelector(".trpg-modal__head"), e.querySelector(".trpg-modal__page:not(.is-under)")].flatMap((e) => e ? [...e.querySelectorAll(xE)] : []).filter((e) => e.getClientRects().length > 0) : [];
		}
		function m() {
			let e = r.value?.querySelector(".trpg-modal__page:not(.is-under)");
			(e?.querySelector("[data-autofocus]") ?? e?.querySelector(xE) ?? r.value)?.focus({ preventScroll: !0 });
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
		Ur(() => [t.depth, t.top?.key], async ([e, t], [n, r]) => {
			if (g(), e === 0) {
				s.clear();
				let e = a;
				a = null, o.length = 0, await pr(), v(e);
			} else if (n === 0 ? a = f() : e > n && o.push(f()), await pr(), e < n && _(), e < n && n > 0) {
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
		return (e, a) => (H(), U("div", {
			ref_key: "rootEl",
			ref: n,
			class: "trpg-modal-root"
		}, [L(t).isOpen ? (H(), U("div", {
			key: 0,
			class: "trpg-modal",
			"data-variant": L(t).variant,
			onClick: a[2] ||= ku((e) => L(t).requestClose(), ["self"]),
			onKeydown: ku(y, ["stop"])
		}, [G("section", {
			ref_key: "cardEl",
			ref: r,
			class: "trpg-modal__card",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": i,
			tabindex: "-1"
		}, [G("header", vE, [
			L(t).depth > 1 ? (H(), U("button", {
				key: 0,
				class: "trpg-modal__back",
				type: "button",
				"aria-label": `返回：${c.value}`,
				onClick: a[0] ||= (e) => L(t).pop()
			}, [K(OT, {
				name: "caret-left",
				size: 16
			}), G("span", null, M(c.value), 1)], 8, yE)) : q("", !0),
			G("h2", {
				id: i,
				class: "trpg-modal__title"
			}, M(L(t).top?.title), 1),
			L(t).top?.header ? (H(), W(Da(L(t).top.header), Pe(Ks({ key: 1 }, L(t).top.props)), null, 16)) : q("", !0),
			G("button", {
				class: "trpg-icon-btn trpg-modal__close",
				type: "button",
				"aria-label": "关闭",
				onClick: a[1] ||= (e) => L(t).requestClose()
			}, [K(OT, {
				name: "x",
				size: 18
			})])
		]), K(Ql, {
			tag: "div",
			name: "trpg-page",
			class: "trpg-modal__pages"
		}, {
			default: R(() => [(H(!0), U(V, null, ja(L(t).stack, (e, n) => (H(), U("div", {
				key: e.key,
				class: Ne(["trpg-modal__page", { "is-under": n < L(t).depth - 1 }]),
				inert: n < L(t).depth - 1,
				"aria-hidden": n < L(t).depth - 1 ? "true" : void 0
			}, [(H(), W(Da(e.component), Ks({ ref_for: !0 }, e.props), null, 16))], 10, bE))), 128))]),
			_: 1
		})], 512)], 40, _E)) : q("", !0)], 512));
	}
}), CE = {
	src: null,
	alt: "",
	source: "pattern"
};
function wE(e) {
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
	} : CE;
}
// src/ui/format.ts
var TE = (e) => String(e).padStart(2, "0");
function EE(e) {
	let t = new Date(e);
	return `${t.getMonth() + 1}月${t.getDate()}日 ${TE(t.getHours())}:${TE(t.getMinutes())}`;
}
function DE(e) {
	let t = new Date(e);
	return `${TE(t.getHours())}:${TE(t.getMinutes())}`;
}
function OE(e) {
	return e >= 1048576 ? `${(e / 1024 / 1024).toFixed(1).replace(/\.0$/, "")}MB` : e >= 1024 ? `${Math.round(e / 1024)}KB` : `${e}B`;
}
function kE(e) {
	let { partyNames: t, location: n, round: r } = e.summary;
	return [
		t.slice(0, 3).join("、"),
		n,
		r ? `第 ${r} 轮` : ""
	].filter(Boolean).join(" · ");
}
function AE(e) {
	return e instanceof Error ? e.message : String(e);
}
// src/stores/saves.ts
var jE = qw("saves", () => {
	let e = Xw(), t = Qw(), n = /* @__PURE__ */ I("card"), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I([]), o = /* @__PURE__ */ I([]), s = /* @__PURE__ */ I([]), c = /* @__PURE__ */ I(!1);
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
function ME(e, t) {
	let n = gE();
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
var NE = { class: "trpg-confirm" }, PE = { class: "trpg-confirm__message" }, FE = {
	key: 0,
	class: "trpg-confirm__details"
}, IE = { class: "trpg-confirm__actions" }, LE = ["data-autofocus"], RE = ["data-autofocus"], zE = /* @__PURE__ */ z({
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
		return (e, n) => (H(), U("div", NE, [
			G("p", PE, M(t.message), 1),
			t.details?.length ? (H(), U("ul", FE, [(H(!0), U(V, null, ja(t.details, (e) => (H(), U("li", { key: e }, M(e), 1))), 128))])) : q("", !0),
			G("div", IE, [G("button", {
				class: "trpg-btn",
				type: "button",
				"data-autofocus": t.danger ? "" : void 0,
				onClick: n[0] ||= (e) => t.onAnswer(!1)
			}, M(t.cancelLabel ?? "取消"), 9, LE), G("button", {
				class: Ne(["trpg-btn", t.danger ? "trpg-btn--danger" : "trpg-btn--primary"]),
				type: "button",
				"data-autofocus": t.danger ? void 0 : "",
				onClick: n[1] ||= (e) => t.onAnswer(!0)
			}, M(t.confirmLabel), 11, RE)])
		]));
	}
}), BE = 0;
function VE(e) {
	return ME({
		key: `confirm:${++BE}`,
		title: e.title,
		component: xn(zE),
		props: (t) => ({
			...e,
			onAnswer: t
		})
	}, !1);
}
// src/ui/imports/NameConflictPage.vue?vue&type=script&setup=true&lang.ts
var HE = { class: "trpg-confirm" }, UE = { class: "trpg-confirm__message" }, WE = { class: "trpg-field__hint" }, GE = {
	key: 0,
	class: "trpg-field__hint"
}, KE = {
	key: 1,
	class: "trpg-field__hint"
}, qE = { class: "trpg-confirm__actions trpg-confirm__actions--stack" }, JE = ["disabled"], YE = /* @__PURE__ */ z({
	__name: "NameConflictPage",
	props: {
		name: {},
		canReplace: { type: Boolean },
		usedBy: {},
		onChoose: { type: Function }
	},
	setup(e) {
		let t = e;
		return (e, n) => (H(), U("div", HE, [
			G("p", UE, "已安装一个名为「" + M(t.name) + "」的扩展包，但它和要导入的不是同一个扩展包。", 1),
			G("p", WE, "保留两个：导入的扩展包显示为「" + M(t.name) + "（2）」。", 1),
			t.usedBy > 0 ? (H(), U("p", GE, "替换：有 " + M(t.usedBy) + " 个存档用到了已安装的那个。", 1)) : q("", !0),
			t.canReplace ? q("", !0) : (H(), U("p", KE, "内置扩展包不能被替换。")),
			G("div", qE, [
				G("button", {
					class: "trpg-btn",
					type: "button",
					"data-autofocus": "",
					onClick: n[0] ||= (e) => t.onChoose("cancel")
				}, "取消"),
				G("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[1] ||= (e) => t.onChoose("keep-both")
				}, "保留两个"),
				G("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					disabled: !t.canReplace,
					onClick: n[2] ||= (e) => t.onChoose("replace")
				}, "替换已安装的", 8, JE)
			])
		]));
	}
}), XE = { class: "trpg-confirm" }, ZE = { class: "trpg-confirm__message" }, QE = { class: "trpg-compare" }, $E = {
	key: 0,
	class: "trpg-field__hint"
}, eD = {
	key: 1,
	class: "trpg-field__error"
}, tD = { class: "trpg-confirm__actions" }, nD = ["disabled"], rD = /* @__PURE__ */ z({
	__name: "OverwritePage",
	props: {
		plan: {},
		rec: {},
		onAnswer: { type: Function }
	},
	setup(e) {
		let t = e, n = {
			builtin: "内置",
			download: "数据仓库下载",
			import: "导入文件",
			user: "自制"
		}, r = J(() => t.plan.installed), i = J(() => t.plan.relation === "same" ? "重新安装" : t.plan.relation === "older" ? "覆盖（降级）" : "覆盖"), a = J(() => t.plan.blocked === "builtin-downgrade"), o = J(() => t.plan.relation === "newer" ? "（较新）" : t.plan.relation === "older" ? "（较旧）" : "");
		return (t, s) => (H(), U("div", XE, [
			G("p", ZE, "已安装同一个扩展包「" + M(r.value.name) + "」。", 1),
			G("table", QE, [s[6] ||= G("thead", null, [G("tr", null, [
				G("th"),
				G("th", null, "已安装"),
				G("th", null, "要导入的")
			])], -1), G("tbody", null, [
				G("tr", null, [
					s[2] ||= G("th", null, "版本", -1),
					G("td", null, "v" + M(r.value.version), 1),
					G("td", null, "v" + M(e.rec.manifest.version) + M(o.value), 1)
				]),
				G("tr", null, [
					s[3] ||= G("th", null, "条目", -1),
					G("td", null, M(r.value.entryCount), 1),
					G("td", null, M(e.rec.manifest.entryCount), 1)
				]),
				G("tr", null, [
					s[4] ||= G("th", null, "来源", -1),
					G("td", null, M(n[r.value.source]), 1),
					s[5] ||= G("td", null, "导入文件", -1)
				])
			])]),
			e.plan.contentChanged ? (H(), U("p", $E, "版本相同，但内容与已安装的不同。")) : q("", !0),
			a.value ? (H(), U("p", eD, "内置扩展包不能降级。")) : q("", !0),
			s[7] ||= G("p", { class: "trpg-field__hint" }, "覆盖后，存档中已加入游戏的内容不受影响。", -1),
			G("div", tD, [G("button", {
				class: "trpg-btn",
				type: "button",
				"data-autofocus": "",
				onClick: s[0] ||= (t) => e.onAnswer(!1)
			}, "取消"), G("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: a.value,
				onClick: s[1] ||= (t) => e.onAnswer(!0)
			}, M(i.value), 9, nD)])
		]));
	}
}), iD = 0;
async function aD(e, t) {
	if (t.action === "install") return { ok: !0 };
	if (t.action === "overwrite") return await ME({
		key: `confirm:overwrite-${++iD}`,
		title: "覆盖扩展包？",
		component: xn(rD),
		props: (n) => ({
			plan: t,
			rec: e,
			onAnswer: n
		})
	}, !1) ? {
		ok: !0,
		resolution: "overwrite"
	} : { ok: !1 };
	let n = t.existing ? (await Xw().svc().packs.referencingSaves(t.existing.id)).length : 0, r = await ME({
		key: `confirm:name-${++iD}`,
		title: "已有同名扩展包",
		component: xn(YE),
		props: (r) => ({
			name: e.manifest.name,
			canReplace: !!t.canReplace,
			usedBy: n,
			onChoose: r
		})
	}, "cancel");
	return r === "cancel" ? { ok: !1 } : {
		ok: !0,
		resolution: r
	};
}
// src/ui/imports/PackPreview.vue?vue&type=script&setup=true&lang.ts
var oD = {
	class: "page-stack",
	"data-testid": "import-pack"
}, sD = { class: "trpg-import__ok" }, cD = { class: "trpg-row__title" }, lD = { class: "trpg-row__meta" }, uD = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, dD = {
	key: 1,
	"aria-label": "需要先安装"
}, fD = { class: "trpg-list" }, pD = { class: "trpg-row__main" }, mD = ["disabled", "onClick"], hD = {
	key: 1,
	class: "trpg-row__meta"
}, gD = {
	key: 2,
	"aria-label": "推荐一起安装"
}, _D = { class: "trpg-list" }, vD = { class: "trpg-row__main" }, yD = ["onClick"], bD = {
	key: 3,
	class: "trpg-field__hint"
}, xD = {
	key: 4,
	class: "trpg-import__ok",
	role: "status"
}, SD = { class: "trpg-confirm__actions" }, CD = ["disabled"], wD = /* @__PURE__ */ z({
	__name: "PackPreview",
	props: { rec: {} },
	setup(e) {
		let t = e, n = Xw(), r = gT(), i = gE(), a = vT(), o = /* @__PURE__ */ Tn(null), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(!1), l = J(() => n.svc().rules.get(t.rec.manifest.ruleId)?.name ?? t.rec.manifest.ruleId), u = (e) => r.catalog?.packs.find((t) => t.id === e)?.name ?? e, d = (e) => !!r.catalog?.packs.some((t) => t.id === e), f = {
			ruleOptions: "规则选项",
			aiNotes: "AI 基调",
			characterCreation: "建卡方式",
			activity: "活动",
			tracker: "追踪器"
		}, p = J(() => o.value?.unsupportedFeatures.map((e) => `${f[e.kind] ?? e.kind} ${e.count} 个`).join("、") ?? ""), m = J(() => o.value?.blocked === "lineage-mismatch" ? `已安装的「${o.value.installed?.name}」与这个文件编号相同但来源不同。先卸载已安装的，或请作者更换编号。` : o.value?.blocked === "builtin-downgrade" ? "内置扩展包不能降级。" : ""), h = J(() => !!o.value && !o.value.missingRequires.length && o.value.blocked !== "lineage-mismatch" && !s.value);
		async function g() {
			o.value = await n.svc().packs.plan(t.rec);
		}
		ma(async () => {
			await Promise.all([g(), r.catalog ? Promise.resolve(!0) : r.loadCatalog()]);
		});
		async function _(e) {
			let t = r.catalog?.packs.find((t) => t.id === e);
			t && (await r.install(t) ? await g() : a.error(`「${t.name}」安装失败，可以稍后再试`));
		}
		async function v() {
			if (o.value) {
				s.value = !0;
				try {
					let e = await aD(t.rec, o.value);
					if (!e.ok) return;
					await r.installFile(t.rec, e.resolution), c.value = !0, a.success(`已安装「${t.rec.manifest.name}」`);
				} catch (e) {
					console.error("[trpg-assistant] 安装失败", e), a.error(`安装失败：${AE(e)}`);
				} finally {
					s.value = !1;
				}
			}
		}
		return (t, n) => (H(), U("div", oD, [
			G("p", sD, "✓ 已识别：扩展包 · " + M(l.value), 1),
			G("div", null, [G("div", cD, M(e.rec.manifest.name), 1), G("div", lD, "v" + M(e.rec.manifest.version) + " · " + M(e.rec.manifest.entryCount) + " 条 · " + M(L(OE)(e.rec.byteSize)) + " · " + M(e.rec.manifest.author ? `作者 ${e.rec.manifest.author}` : "导入文件"), 1)]),
			m.value ? (H(), U("p", uD, "⚠ " + M(m.value), 1)) : q("", !0),
			o.value?.missingRequires.length ? (H(), U("section", dD, [n[2] ||= G("h3", { class: "trpg-group" }, "需要先安装：", -1), G("ul", fD, [(H(!0), U(V, null, ja(o.value.missingRequires, (e) => (H(), U("li", {
				key: e.id,
				class: "trpg-row"
			}, [G("span", pD, M(u(e.id)), 1), d(e.id) ? (H(), U("button", {
				key: 0,
				class: "trpg-btn",
				type: "button",
				disabled: !!L(r).tasks[e.id],
				onClick: (t) => _(e.id)
			}, M(L(r).tasks[e.id] ? "安装中…" : "安装"), 9, mD)) : (H(), U("span", hD, "库和数据仓库都没有"))]))), 128))])])) : q("", !0),
			o.value?.missingRecommends.length ? (H(), U("section", gD, [n[3] ||= G("h3", { class: "trpg-group" }, "推荐一起安装（可以跳过）：", -1), G("ul", _D, [(H(!0), U(V, null, ja(o.value.missingRecommends, (e) => (H(), U("li", {
				key: e.id,
				class: "trpg-row"
			}, [G("span", vD, M(u(e.id)), 1), d(e.id) ? (H(), U("button", {
				key: 0,
				class: "trpg-btn",
				type: "button",
				onClick: (t) => _(e.id)
			}, "安装", 8, yD)) : q("", !0)]))), 128))])])) : q("", !0),
			(H(!0), U(V, null, ja(o.value?.conflicts ?? [], (e) => (H(), U("p", {
				key: e.id,
				class: "trpg-field__hint"
			}, "与「" + M(u(e.id)) + "」冲突：" + M(e.reason || "不能在同一个存档中同时启用"), 1))), 128)),
			p.value ? (H(), U("p", bD, "本版本暂不支持：" + M(p.value), 1)) : q("", !0),
			c.value ? (H(), U("p", xD, "已安装「" + M(e.rec.manifest.name) + "」", 1)) : q("", !0),
			G("div", SD, [c.value ? q("", !0) : (H(), U("button", {
				key: 0,
				class: "trpg-btn",
				type: "button",
				onClick: n[0] ||= (e) => L(i).close(!0)
			}, "取消")), c.value ? (H(), U("button", {
				key: 2,
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				"data-autofocus": "",
				onClick: n[1] ||= (e) => L(i).close(!0)
			}, "完成")) : (H(), U("button", {
				key: 1,
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: !h.value,
				onClick: v
			}, M(s.value ? "安装中…" : o.value?.relation === "same" ? "重新安装" : "安装"), 9, CD))])
		]));
	}
});
// src/core/transfer/importer.ts
function TD(e, t) {
	return e.saves.map((e) => t(e.ruleId) ? {
		save: e,
		selectable: !0
	} : {
		save: e,
		selectable: !1,
		reason: "规则未安装"
	});
}
function ED(e) {
	return [...e.attachedPacks].map(([e, t]) => ({
		name: e,
		bytes: t
	}));
}
function DD(e, t) {
	if (!t.has(e)) return e;
	let n = `${e}（导入）`;
	if (!t.has(n)) return n;
	for (let n = 2;; n++) {
		let r = `${e}（导入 ${n}）`;
		if (!t.has(r)) return r;
	}
}
async function OD(e, t, n) {
	let { db: r, campaign: i } = e, a = e.uuid ?? _b, o = t.saves.filter((t) => e.hasRule(t.ruleId)), s = new Set(n.selectedIds), c = 0;
	return r.transaction("rw", [
		r.saves,
		r.workspaces,
		r.meta,
		r.packs,
		r.blobs
	], async () => {
		let l = e.now();
		for (let [e, n] of t.blobs) await r.blobs.get(e) || await r.blobs.put({
			hash: e,
			bytes: n,
			mime: jS(n) ?? "application/octet-stream",
			size: n.length,
			createdAt: l
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
					name: DD(t.name, o),
					createdAt: s,
					updatedAt: s
				}), c++;
			}
			return {
				imported: c,
				skipped: t.saves.length - c
			};
		}
		let u = n.mode === "overwrite", d = t.workspaces.filter((t) => e.hasRule(t.ruleId)), f = u ? (await r.workspaces.toArray()).filter((t) => e.hasRule(t.ruleId)) : [];
		if (u) {
			for (let t of (await r.saves.toArray()).filter((t) => e.hasRule(t.ruleId))) await r.saves.delete(t.id);
			for (let e of f) await r.workspaces.delete(e.ownerKey);
			t.settings && await r.setMeta("settings", lb.parse(t.settings));
		}
		let p = u ? o : o.filter((e) => s.has(e.id));
		for (let e of p) (u || !await r.saves.get(e.id)) && (await r.saves.put(e), c++);
		for (let e of d) (u || !await r.workspaces.get(e.ownerKey)) && await r.workspaces.put(e);
		for (let e of f) await i.writeAutoSave(e, "恢复备份前");
		let m = new Set(p.filter((e) => e.kind === "auto").map((e) => `${e.ownerKey}\u0000${e.ruleId}`));
		for (let e of m) {
			let [t, n] = e.split("\0");
			await i.pruneAutoSaves(t, n);
		}
		return {
			imported: c,
			skipped: t.saves.length - c
		};
	});
}
// src/ui/kit/Checkbox.vue?vue&type=script&setup=true&lang.ts
var kD = ["data-disabled"], AD = [
	"disabled",
	"indeterminate",
	"aria-label"
], jD = { class: "trpg-check__text" }, MD = /* @__PURE__ */ z({
	__name: "Checkbox",
	props: /*@__PURE__*/ Qa({
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
		let t = xo(e, "modelValue");
		return (n, r) => (H(), U("label", {
			class: "trpg-check",
			"data-disabled": e.disabled
		}, [Nr(G("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			type: "checkbox",
			disabled: e.disabled,
			indeterminate: e.indeterminate,
			"aria-label": e.label
		}, null, 8, AD), [[hu, t.value]]), G("span", jD, [B(n.$slots, "default")])], 8, kD));
	}
}), ND = {
	class: "page-stack",
	"data-testid": "import-save"
}, PD = { class: "trpg-import__ok" }, FD = {
	key: 0,
	class: "trpg-field"
}, ID = { class: "trpg-field__hint" }, LD = { class: "trpg-list" }, RD = { class: "trpg-row__title" }, zD = { class: "trpg-row__meta" }, BD = {
	key: 1,
	class: "trpg-field__hint"
}, VD = { class: "trpg-field__hint" }, HD = { class: "trpg-confirm__actions" }, UD = ["disabled"], WD = /* @__PURE__ */ z({
	__name: "SavePreview",
	props: { rec: {} },
	setup(e) {
		let t = e, n = Xw(), r = Qw(), i = gT(), a = gE(), o = jE(), s = vT(), c = J(() => TD(t.rec, (e) => n.svc().rules.has(e))), l = /* @__PURE__ */ I(c.value.filter((e) => e.selectable).map((e) => e.save.id)), u = /* @__PURE__ */ I("merge"), d = /* @__PURE__ */ I(!1), f = J(() => t.rec.type === "backup"), p = (e) => n.svc().rules.get(e)?.nameShort ?? e, m = J(() => f.value && u.value === "overwrite" ? c.value.filter((e) => e.selectable).length : l.value.length), h = J(() => ED(t.rec)), g = J(() => f.value ? `完整备份 · ${t.rec.saves.length} 个存档` : `存档文件 · ${t.rec.saves.length} 个存档`);
		function _(e, t) {
			l.value = t ? [...l.value, e] : l.value.filter((t) => t !== e);
		}
		async function v() {
			let e = 0;
			for (let t of h.value) {
				let r = n.svc().packs.recognize(t.bytes);
				if (r.type !== "pack") continue;
				let a = await n.svc().packs.plan(r);
				if (a.action === "overwrite" && a.relation !== "newer") continue;
				let o = await aD(r, a);
				o.ok && (await i.installFile(r, o.resolution), e++);
			}
			return e;
		}
		async function y() {
			let e = r.owner;
			if (!e) s.error("请先在酒馆中打开一个聊天");
			else if (!f.value || u.value !== "overwrite" || await VE({
				title: "覆盖并恢复",
				message: "先写入自动存档，再用备份替换全部存档、当前数据与设置。",
				confirmLabel: "覆盖并恢复",
				danger: !0
			})) {
				d.value = !0;
				try {
					let i = await v(), c = n.svc(), d = await OD({
						db: c.db,
						campaign: c.campaign,
						now: c.now,
						hasRule: (e) => c.rules.has(e)
					}, t.rec, {
						owner: e,
						selectedIds: l.value,
						mode: f.value ? u.value : void 0
					});
					await r.switchOwner(e), await o.refresh(), s.success(`已导入 ${d.imported} 个存档${i ? `，安装了 ${i} 个扩展包` : ""}`), a.close(!0);
				} catch (e) {
					console.error("[trpg-assistant] 导入存档失败", e), s.error(`导入失败：${AE(e)}`);
				} finally {
					d.value = !1;
				}
			}
		}
		return (e, t) => (H(), U("div", ND, [
			G("p", PD, "✓ 已识别：" + M(g.value), 1),
			f.value ? (H(), U("div", FD, [K(jT, {
				modelValue: u.value,
				"onUpdate:modelValue": t[0] ||= (e) => u.value = e,
				label: "恢复方式",
				options: [{
					value: "merge",
					label: "合并"
				}, {
					value: "overwrite",
					label: "覆盖"
				}]
			}, null, 8, ["modelValue"]), G("span", ID, M(u.value === "merge" ? "只添加尚不存在的存档与当前数据。" : "先写自动存档，再用备份替换全部存档、当前数据与设置。"), 1)])) : q("", !0),
			G("ul", LD, [(H(!0), U(V, null, ja(c.value, (e) => (H(), U("li", {
				key: e.save.id,
				class: "trpg-row"
			}, [K(MD, {
				"model-value": l.value.includes(e.save.id),
				disabled: !e.selectable || f.value && u.value === "overwrite",
				"onUpdate:modelValue": (t) => _(e.save.id, t)
			}, {
				default: R(() => [G("span", RD, M(e.save.name), 1)]),
				_: 2
			}, 1032, [
				"model-value",
				"disabled",
				"onUpdate:modelValue"
			]), G("span", zD, [Vs(M(p(e.save.ruleId)) + " · " + M(L(EE)(e.save.updatedAt)), 1), e.reason ? (H(), U(V, { key: 0 }, [Vs(" · " + M(e.reason) + "（不可选）", 1)], 64)) : q("", !0)])]))), 128))]),
			h.value.length ? (H(), U("p", BD, "附带扩展包：" + M(h.value.length) + " 个（将一并安装）", 1)) : q("", !0),
			G("p", VD, "导入为「" + M(L(r).owner?.ownerLabel ?? "当前角色卡") + "」的存档；重名时名称后加\"（导入）\"。", 1),
			G("div", HD, [G("button", {
				class: "trpg-btn",
				type: "button",
				onClick: t[1] ||= (e) => L(a).close(!0)
			}, "取消"), G("button", {
				class: Ne(["trpg-btn", f.value && u.value === "overwrite" ? "trpg-btn--danger" : "trpg-btn--primary"]),
				type: "button",
				disabled: d.value || m.value === 0,
				onClick: y
			}, M(f.value && u.value === "overwrite" ? "覆盖并恢复" : `导入 ${m.value} 个`), 11, UD)])
		]));
	}
}), GD = { class: "page-stack" }, KD = {
	class: "trpg-row__meta",
	"data-testid": "import-filename"
}, qD = {
	key: 0,
	class: "page-stack",
	role: "alert"
}, JD = { class: "trpg-field__error" }, YD = { class: "trpg-confirm__actions" }, XD = {
	key: 1,
	class: "page-intro",
	role: "status"
}, ZD = /* @__PURE__ */ z({
	__name: "ImportPage",
	props: { file: {} },
	setup(e) {
		let t = e, n = Xw(), r = gE(), i = /* @__PURE__ */ Tn(null), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(null);
		ma(async () => {
			try {
				i.value = n.svc().packs.recognize(new Uint8Array(await t.file.arrayBuffer()));
			} catch (e) {
				e instanceof Q || console.error("[trpg-assistant] 识别文件失败", e), a.value = AE(e);
			}
		});
		function s(e) {
			let t = e.target, n = t.files?.[0];
			t.value = "", n && QD(n);
		}
		return (e, n) => (H(), U("div", GD, [G("p", KD, M(t.file.name), 1), a.value ? (H(), U("div", qD, [G("p", JD, "⚠ " + M(a.value), 1), G("div", YD, [
			G("button", {
				class: "trpg-btn",
				type: "button",
				onClick: n[0] ||= (e) => o.value?.click()
			}, "选择其他文件"),
			G("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				onClick: n[1] ||= (e) => L(r).close(!0)
			}, "关闭"),
			G("input", {
				ref_key: "picker",
				ref: o,
				class: "trpg-sr-only",
				type: "file",
				accept: ".trpgsave,.trpgpack,.zip",
				tabindex: "-1",
				"aria-hidden": "true",
				onChange: s
			}, null, 544)
		])])) : i.value ? i.value.type === "pack" ? (H(), W(wD, {
			key: 2,
			rec: i.value
		}, null, 8, ["rec"])) : (H(), W(WD, {
			key: 3,
			rec: i.value
		}, null, 8, ["rec"])) : (H(), U("p", XD, "正在识别…"))]));
	}
});
// src/ui/imports/openImport.ts
function QD(e) {
	gE().open({
		key: "import",
		title: "导入文件",
		component: xn(ZD),
		props: { file: e },
		variant: "dialog"
	});
}
// src/core/transfer/exporter.ts
function $D(e) {
	let t = new Date(e);
	return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function eO(e) {
	return e.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "") || "存档";
}
async function tO(e, t) {
	if (t.type === "save") {
		let n = await e.saves.get(t.saveId);
		if (!n || n.deletedAt !== void 0) throw new Q("E_NOT_FOUND", "没有找到这个存档");
		return [n];
	}
	return (await e.saves.toArray()).filter((e) => e.deletedAt === void 0);
}
async function nO(e, t) {
	let n = new Set(t.flatMap((e) => e.packs.map((e) => e.id)));
	return (await e.packs.list()).filter((e) => n.has(e.id) && e.source !== "builtin");
}
async function rO(e, t) {
	let n = await tO(e.db, t), r = await nO(e, n);
	return {
		saveBytes: n.reduce((e, t) => e + JSON.stringify(t).length, 0),
		packs: r.map((e) => ({
			id: e.id,
			name: e.name,
			byteSize: e.byteSize
		}))
	};
}
async function iO(e, t, n) {
	let r = await tO(e.db, t), i = {};
	for (let e of r) i[`saves/${e.id}.json`] = JSON.stringify(e);
	let a = [];
	if (t.type === "backup") {
		a = await e.db.workspaces.toArray();
		for (let e of a) i[`workspaces/${encodeURIComponent(e.ownerKey)}.json`] = JSON.stringify(e);
		i["settings.json"] = JSON.stringify(await mb(e.db));
	}
	let o = HS([r, a]);
	for (let t of [...o].sort()) {
		let n = await e.db.blobs.get(t);
		n && (i[`blobs/${t}`] = n.bytes);
	}
	let s = await e.packs.list();
	if (i["packs.json"] = JSON.stringify(s.map((e) => ({
		id: e.id,
		version: e.version,
		name: e.name
	}))), n.includePacks) for (let t of await nO(e, r)) i[`packs/${t.id}@${t.version}.trpgpack`] = await e.packs.exportPack(t.id);
	i["trpg-manifest.json"] = JSON.stringify({
		format: t.type === "backup" ? "trpg-backup" : "trpg-save",
		formatVersion: 2,
		appVersion: e.appVersion,
		exportedAt: new Date(e.now()).toISOString(),
		ruleIds: [...new Set(r.map((e) => e.ruleId))]
	});
	let c = $D(e.now()), l = t.type === "backup" ? `TRPG备份_${c}.trpgsave` : `${eO(r[0].name)}_${c}.trpgsave`;
	return {
		bytes: qS(i),
		filename: l
	};
}
// src/ui/download.ts
function aO(e, t) {
	let n = new Blob([e], { type: "application/octet-stream" }), r = URL.createObjectURL(n), i = document.createElement("a");
	i.href = r, i.download = t, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e4);
}
// src/ui/saves/ExportPage.vue?vue&type=script&setup=true&lang.ts
var oO = { class: "page-stack" }, sO = { class: "trpg-field" }, cO = { class: "trpg-row__meta" }, lO = { class: "trpg-field__hint" }, uO = { class: "trpg-confirm__actions" }, dO = ["disabled"], fO = /* @__PURE__ */ z({
	__name: "ExportPage",
	props: { saveId: {} },
	setup(e) {
		let t = e, n = Xw(), r = Qw(), i = gE(), a = vT(), o = /* @__PURE__ */ I(t.saveId ?? r.currentSave?.id ?? ""), s = /* @__PURE__ */ I(t.saveId || r.currentSave ? "save" : "backup"), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I("存档"), u = /* @__PURE__ */ I(null), d = /* @__PURE__ */ I(!1), f = J(() => s.value === "backup" ? { type: "backup" } : {
			type: "save",
			saveId: o.value
		}), p = () => ({
			db: n.svc().db,
			packs: n.svc().packs,
			now: n.svc().now,
			appVersion: mw
		}), m = J(() => (u.value?.packs ?? []).reduce((e, t) => e + t.byteSize, 0)), h = J(() => OE((u.value?.saveBytes ?? 0) + (c.value ? m.value : 0))), g = J(() => new Date(n.svc().now()).toISOString().slice(0, 10)), _ = J(() => s.value === "backup" ? `TRPG备份_${g.value}.trpgsave` : `${l.value.replace(/\s+/g, "_")}_${g.value}.trpgsave`);
		async function v() {
			try {
				s.value === "save" && (l.value = (await n.svc().campaign.getSave(o.value))?.name ?? "存档"), u.value = await rO(p(), f.value);
			} catch (e) {
				console.error("[trpg-assistant] 估算导出大小失败", e), u.value = null;
			}
		}
		ma(v), Ur(s, v);
		async function y() {
			d.value = !0;
			try {
				let { bytes: e, filename: t } = await iO(p(), f.value, { includePacks: c.value });
				aO(e, t), s.value === "backup" && (await hb(n.svc().db, n.svc().now()), await n.refreshBackup()), a.success(`已导出「${t}」`), i.close(!0);
			} catch (e) {
				console.error("[trpg-assistant] 导出失败", e), a.error(`导出失败：${AE(e)}`);
			} finally {
				d.value = !1;
			}
		}
		return (e, t) => (H(), U("div", oO, [
			G("div", sO, [t[3] ||= G("span", { class: "trpg-field__label" }, "范围", -1), K(jT, {
				modelValue: s.value,
				"onUpdate:modelValue": t[0] ||= (e) => s.value = e,
				label: "导出范围",
				options: [{
					value: "save",
					label: l.value
				}, {
					value: "backup",
					label: "全部（完整备份）"
				}]
			}, null, 8, ["modelValue", "options"])]),
			u.value?.packs.length ? (H(), W(MD, {
				key: 0,
				modelValue: c.value,
				"onUpdate:modelValue": t[1] ||= (e) => c.value = e
			}, {
				default: R(() => [t[4] ||= Vs(" 附带所用扩展包 ", -1), G("span", cO, "+ " + M(u.value.packs.length) + " 个，约 " + M(L(OE)(m.value)) + "（内置包不重复打包）", 1)]),
				_: 1
			}, 8, ["modelValue"])) : q("", !0),
			G("p", lO, "文件名 " + M(_.value) + " · 约 " + M(h.value), 1),
			G("div", uO, [G("button", {
				class: "trpg-btn",
				type: "button",
				onClick: t[2] ||= (e) => L(i).close(!0)
			}, "取消"), G("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: d.value || s.value === "save" && !o.value,
				onClick: y
			}, M(d.value ? "打包中…" : "导出"), 9, dO)])
		]));
	}
});
// src/ui/saves/fileActions.ts
function pO(e) {
	gE().open({
		key: "export",
		title: "导出",
		component: xn(fO),
		props: { saveId: e },
		variant: "dialog"
	});
}
async function mO(e) {
	QD(e);
}
// node_modules/ohash/dist/_chunks/is-equal.mjs
function hO(e) {
	return typeof e == "string" ? `'${e}'` : new yO().serialize(e);
}
var gO = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz", _O = /*@__PURE__*/ (function() {
	let e = /* @__PURE__ */ new Uint8Array(128);
	for (let t = 0; t < 69; t++) e[gO.charCodeAt(t)] = t + 1;
	for (let t = 65; t <= 90; t++) e[t] = e[t + 32];
	return e;
})();
function vO(e, t) {
	if (e === t) return 0;
	let n = Math.min(e.length, t.length), r = 0;
	for (let i = 0; i < n; i++) {
		let n = e.charCodeAt(i), a = t.charCodeAt(i);
		if (n === a) continue;
		let o = n < 128 && _O[n] ? _O[n] : n + 128, s = a < 128 && _O[a] ? _O[a] : a + 128;
		if (o !== s) return o < s ? -1 : 1;
		r === 0 && (r = n > a ? -1 : 1);
	}
	return e.length === t.length ? r : e.length < t.length ? -1 : 1;
}
var yO = /*@__PURE__*/ (function() {
	class e {
		#e = /* @__PURE__ */ new Map();
		compare(e, t) {
			let n = typeof e, r = typeof t;
			return n === "string" && r === "string" ? vO(e, t) : n === "number" && r === "number" ? e - t : vO(this.serialize(e, !0), this.serialize(t, !0));
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
			let i = Object.keys(e).sort(vO), a = `${r}{`;
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
function bO(e, t) {
	return e === t || hO(e) === hO(t);
}
// node_modules/reka-ui/dist/shared/clamp.js
function xO(e, t = -Infinity, n = Infinity) {
	return Math.min(n, Math.max(t, e));
}
// node_modules/reka-ui/dist/shared/createContext.js
function SO(e, t) {
	let n = typeof e == "string" && !t ? `${e}Context` : t, r = Symbol(n);
	return [(t) => {
		let n = Ir(r, t);
		if (n || n === null) return n;
		throw Error(`Injection \`${r.toString()}\` not found. Component must be used within ${Array.isArray(e) ? `one of the following components: ${e.join(", ")}` : `\`${e}\``}`);
	}, (e) => (Fr(r, e), e)];
}
// node_modules/reka-ui/dist/shared/getActiveElement.js
function CO() {
	let e = document.activeElement;
	if (e == null) return null;
	for (; e != null && e.shadowRoot != null && e.shadowRoot.activeElement != null;) e = e.shadowRoot.activeElement;
	return e;
}
// node_modules/reka-ui/dist/shared/handleAndDispatchCustomEvent.js
function wO(e, t, n) {
	let r = n.originalEvent.target, i = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && r.addEventListener(e, t, { once: !0 }), r.dispatchEvent(i);
}
// node_modules/reka-ui/dist/shared/nullish.js
function TO(e) {
	return e == null;
}
// node_modules/@vueuse/shared/dist/index.js
function EO(e, t) {
	return Xe() ? (Ze(e, t), !0) : !1;
}
function DO(e) {
	let t = !1, n, r = Ye(!0);
	return ((...i) => (t ||= (n = r.run(() => e(...i)), !0), n));
}
var OO = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
var kO = (e) => e !== void 0, AO = Object.prototype.toString, jO = (e) => AO.call(e) === "[object Object]", MO = /* #__PURE__ */ NO();
function NO() {
	var e, t;
	return OO && !!((e = window) != null && (e = e.navigator) != null && e.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((t = window) == null || (t = t.navigator) == null ? void 0 : t.maxTouchPoints) > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function PO(e) {
	return Array.isArray(e) ? e : [e];
}
function FO(e) {
	return e || $s();
}
function IO(e) {
	if (!OO) return e;
	let t = 0, n, r, i = () => {
		--t, r && t <= 0 && (r.stop(), n = void 0, r = void 0);
	};
	return ((...a) => (t += 1, r || (r = Ye(!0), n = r.run(() => e(...a))), EO(i), n));
}
function LO(e) {
	return /* @__PURE__ */ fn(/* @__PURE__ */ wn(e) ? new Proxy({}, {
		get(t, n, r) {
			return L(Reflect.get(e.value, n, r));
		},
		set(t, n, r) {
			return /* @__PURE__ */ wn(e.value[n]) && !/* @__PURE__ */ wn(r) ? e.value[n].value = r : e.value[n] = r, !0;
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
function RO(e) {
	return LO(J(e));
}
function zO(e, ...t) {
	let n = t.flat(), r = n[0];
	return RO(() => Object.fromEntries(typeof r == "function" ? Object.entries(/* @__PURE__ */ Pn(e)).filter(([e, t]) => !r(kn(t), e)) : Object.entries(/* @__PURE__ */ Pn(e)).filter((e) => !n.includes(e[0]))));
}
function BO(e, t = 1e4) {
	return Nn((n, r) => {
		let i = kn(e), a, o = () => setTimeout(() => {
			i = kn(e), r();
		}, kn(t));
		return EO(() => {
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
function VO(e, t) {
	FO(t) && _a(e, t);
}
function HO(e, t, n) {
	return Ur(e, t, {
		...n,
		immediate: !0
	});
}
// node_modules/@vueuse/core/dist/index.js
var UO = OO ? window : void 0;
OO && window.document, OO && window.navigator, OO && window.location;
function WO(e) {
	let t = kn(e);
	return t?.$el ?? t;
}
function GO(...e) {
	let t = (e, t, n, r) => (e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r)), n = J(() => {
		let t = PO(kn(e[0])).filter((e) => e != null);
		return t.every((e) => typeof e != "string") ? t : void 0;
	});
	return HO(() => [
		n.value?.map((e) => WO(e)) ?? [UO].filter((e) => e != null),
		PO(kn(n.value ? e[1] : e[0])),
		PO(L(n.value ? e[2] : e[1])),
		kn(n.value ? e[3] : e[2])
	], ([e, n, r, i], a, o) => {
		if (!e?.length || !n?.length || !r?.length) return;
		let s = jO(i) ? { ...i } : i, c = e.flatMap((e) => n.flatMap((n) => r.map((r) => t(e, n, r, s))));
		o(() => {
			c.forEach((e) => e());
		});
	}, { flush: "post" });
}
function KO() {
	let e = /* @__PURE__ */ Tn(!1), t = $s();
	return t && ma(() => {
		e.value = !0;
	}, t), e;
}
/* @__NO_SIDE_EFFECTS__ */
function qO(e) {
	let t = KO();
	return J(() => (t.value, !!e()));
}
function JO(e) {
	return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function YO(...e) {
	let t, n, r = {};
	e.length === 3 ? (t = e[0], n = e[1], r = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], r = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
	let { target: i = UO, eventName: a = "keydown", passive: o = !1, dedupe: s = !1 } = r, c = JO(t);
	return GO(i, a, (e) => {
		e.repeat && kn(s) || c(e) && n(e);
	}, o);
}
function XO(e) {
	return JSON.parse(JSON.stringify(e));
}
function ZO(e, t, n = {}) {
	let { window: r = UO, ...i } = n, a, o = /* @__PURE__ */ qO(() => r && "ResizeObserver" in r), s = () => {
		a &&= (a.disconnect(), void 0);
	}, c = Ur(J(() => {
		let t = kn(e);
		return Array.isArray(t) ? t.map((e) => WO(e)) : [WO(t)];
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
	return EO(l), {
		isSupported: o,
		stop: l
	};
}
function QO(e, t, n, r = {}) {
	var i, a;
	let { clone: o = !1, passive: s = !1, eventName: c, deep: l = !1, defaultValue: u, shouldEmit: d } = r, f = $s(), p = n || f?.emit || (f == null || (i = f.$emit) == null ? void 0 : i.bind(f)) || (f == null || (a = f.proxy) == null || (a = a.$emit) == null ? void 0 : a.bind(f?.proxy)), m = c;
	t ||= "modelValue", m ||= `update:${t.toString()}`;
	let h = (e) => o ? typeof o == "function" ? o(e) : XO(e) : e, g = () => kO(e[t]) ? h(e[t]) : u, _ = (e) => {
		d ? d(e) && p(m, e) : p(m, e);
	};
	if (s) {
		let n = /* @__PURE__ */ I(g()), r = !1;
		return Ur(() => e[t], (e) => {
			r || (r = !0, n.value = h(e), pr(() => r = !1));
		}), Ur(n, (n) => {
			!r && (n !== e[t] || l) && _(n);
		}, { deep: l }), n;
	}
	return J({
		get() {
			return g();
		},
		set(e) {
			_(e);
		}
	});
}
// node_modules/reka-ui/dist/shared/renderSlotFragments.js
function $O(e) {
	return e ? e.flatMap((e) => e.type === V ? $O(e.children) : [e]) : [];
}
// node_modules/reka-ui/dist/shared/useArrowNavigation.js
var ek = ["INPUT", "TEXTAREA"];
function tk(e, t, n, r = {}) {
	if (!t || r.enableIgnoredElement && ek.includes(t.nodeName)) return null;
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
	return v || _ ? b = nk(y, t, {
		goForward: _ ? m : c === "ltr" ? d : f,
		loop: s
	}) : h ? b = y.at(0) || null : g && (b = y.at(-1) || null), u && b?.focus(), b;
}
function nk(e, t, n, r = e.includes(t) ? e.length : e.length + 1) {
	if (--r === 0) return null;
	let i = e.indexOf(t), a;
	if (a = i === -1 ? n.goForward ? 0 : e.length - 1 : n.goForward ? i + 1 : i - 1, !n.loop && (a < 0 || a >= e.length)) return null;
	let o = e[(a + e.length) % e.length];
	return o ? o.hasAttribute("disabled") && o.getAttribute("disabled") !== "false" ? nk(e, o, n, r) : o : null;
}
// node_modules/reka-ui/dist/ConfigProvider/ConfigProvider.js
var [rk, ik] = /*#__PURE__*/ SO("ConfigProvider"), ak = /* @__PURE__ */ new WeakMap();
function ok(e, t) {
	let n = ak.get(e);
	n || (n = {
		owners: /* @__PURE__ */ new Set(),
		original: e.body.style.pointerEvents
	}, ak.set(e, n)), n.owners.add(t), e.body.style.pointerEvents = "none";
}
function sk(e, t) {
	let n = ak.get(e);
	n?.owners.delete(t) && n.owners.size === 0 && (ak.delete(e), e.body.style.pointerEvents = n.original);
}
// node_modules/defu/dist/defu.mjs
function ck(e) {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null || Symbol.iterator in e ? !1 : Symbol.toStringTag in e ? Object.prototype.toString.call(e) === "[object Module]" : !0;
}
function lk(e, t, n = ".", r) {
	if (!ck(t)) return lk(e, {}, n, r);
	let i = { ...t };
	for (let t of Object.keys(e)) {
		if (t === "__proto__" || t === "constructor") continue;
		let a = e[t];
		a != null && (r && r(i, t, a, n) || (i[t] = Array.isArray(a) && Array.isArray(i[t]) ? [...a, ...i[t]] : ck(a) && ck(i[t]) ? lk(a, i[t], (n ? `${n}.` : "") + t.toString(), r) : a));
	}
	return i;
}
function uk(e) {
	return (...t) => t.reduce((t, n) => lk(t, n, "", e), {});
}
var dk = uk(), fk = Symbol("useBodyScrollLock"), pk = IO(() => {
	let e = /* @__PURE__ */ I(/* @__PURE__ */ new Map()), t = /* @__PURE__ */ I(), n = J(() => {
		for (let t of e.value.values()) if (t) return !0;
		return !1;
	}), r = rk({ scrollBody: /* @__PURE__ */ I(!0) }), i = null, a = () => {
		document.body.style.paddingRight = "", document.body.style.marginRight = "", sk(document, fk), document.documentElement.style.removeProperty("--scrollbar-width"), document.body.style.overflow = t.value ?? "", MO && i?.(), t.value = void 0;
	};
	return Ur(n, (e, o) => {
		if (!OO) return;
		if (!e) {
			o && a();
			return;
		}
		t.value === void 0 && (t.value = document.body.style.overflow);
		let s = window.innerWidth - document.documentElement.clientWidth, c = {
			padding: s,
			margin: 0
		}, l = r.scrollBody?.value ? typeof r.scrollBody.value == "object" ? dk({
			padding: r.scrollBody.value.padding === !0 ? s : r.scrollBody.value.padding,
			margin: r.scrollBody.value.margin === !0 ? s : r.scrollBody.value.margin
		}, c) : c : {
			padding: 0,
			margin: 0
		};
		s > 0 && (document.body.style.paddingRight = typeof l.padding == "number" ? `${l.padding}px` : String(l.padding), document.body.style.marginRight = typeof l.margin == "number" ? `${l.margin}px` : String(l.margin), document.documentElement.style.setProperty("--scrollbar-width", `${s}px`), document.body.style.overflow = "hidden"), MO && (i = GO(document, "touchmove", (e) => gk(e), { passive: !1 })), pr(() => {
			n.value && (ok(document, fk), document.body.style.overflow = "hidden");
		});
	}, {
		immediate: !0,
		flush: "sync"
	}), e;
});
function mk(e) {
	let t = Math.random().toString(36).substring(2, 7), n = pk();
	n.value.set(t, e ?? !1);
	let r = J({
		get: () => n.value.get(t) ?? !1,
		set: (e) => n.value.set(t, e)
	});
	return VO(() => {
		n.value.delete(t);
	}), r;
}
function hk(e) {
	let t = window.getComputedStyle(e);
	if (t.overflowX === "scroll" || t.overflowY === "scroll" || t.overflowX === "auto" && e.clientWidth < e.scrollWidth || t.overflowY === "auto" && e.clientHeight < e.scrollHeight) return !0;
	{
		let t = e.parentNode;
		return !(t instanceof Element) || t.tagName === "BODY" ? !1 : hk(t);
	}
}
function gk(e) {
	let t = e || window.event, n = t.target;
	return n instanceof Element && hk(n) ? !1 : t.touches.length > 1 || (t.preventDefault && t.cancelable && t.preventDefault(), !1);
}
// node_modules/reka-ui/dist/shared/useDirection.js
function _k(e) {
	let t = rk({ dir: /* @__PURE__ */ I("ltr") });
	return J(() => e?.value || t.dir?.value || "ltr");
}
// node_modules/reka-ui/dist/shared/useEmitAsProps.js
function vk(e) {
	let t = $s(), n = t?.type.emits, r = {};
	return n?.length || console.warn(`No emitted event found. Please check component: ${t?.type.__name}`), n?.forEach((t) => {
		r[be(ge(t))] = (...n) => e(t, ...n);
	}), r;
}
// node_modules/reka-ui/dist/shared/useFocusGuards.js
var yk = 0;
function bk() {
	Br((e) => {
		if (!OO) return;
		let t = document.querySelectorAll("[data-reka-focus-guard]");
		document.body.insertAdjacentElement("afterbegin", t[0] ?? xk()), document.body.insertAdjacentElement("beforeend", t[1] ?? xk()), yk++, e(() => {
			yk === 1 && document.querySelectorAll("[data-reka-focus-guard]").forEach((e) => e.remove()), yk--;
		});
	});
}
function xk() {
	let e = document.createElement("span");
	return e.setAttribute("data-reka-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
// node_modules/reka-ui/dist/shared/useFormControl.js
function Sk(e) {
	return J(() => !kn(e) || !!WO(e)?.closest("form"));
}
// node_modules/reka-ui/dist/shared/useForwardExpose.js
function Ck() {
	let e = $s(), t = /* @__PURE__ */ I(), n = J(() => r());
	ga(() => {
		n.value !== r() && On(t);
	});
	function r() {
		return t.value && "$el" in t.value && ["#text", "#comment"].includes(t.value.$el.nodeName) ? t.value.$el.nextElementSibling : WO(t);
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
function wk(e) {
	let t = $s(), n = Object.keys(t?.type.props ?? {}).reduce((e, n) => {
		let r = (t?.type.props[n]).default;
		return r !== void 0 && (e[n] = r), e;
	}, {}), r = /* @__PURE__ */ Ln(e);
	return J(() => {
		let e = {}, i = t?.vnode.props ?? {};
		return Object.keys(i).forEach((t) => {
			e[ge(t)] = i[t];
		}), Object.keys({
			...n,
			...e
		}).reduce((e, t) => (r.value[t] !== void 0 && (e[t] = r.value[t]), e), {});
	});
}
// node_modules/reka-ui/dist/shared/useForwardPropsEmits.js
function Tk(e, t) {
	let n = wk(e), r = t ? vk(t) : {};
	return J(() => ({
		...n.value,
		...r
	}));
}
// node_modules/aria-hidden/dist/es2015/index.js
var Ek = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, Dk = /* @__PURE__ */ new WeakMap(), Ok = /* @__PURE__ */ new WeakMap(), kk = {}, Ak = 0, jk = function(e) {
	return e && (e.host || jk(e.parentNode));
}, Mk = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = jk(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, Nk = function(e, t, n, r) {
	var i = Mk(t, Array.isArray(e) ? e : [e]);
	kk[n] || (kk[n] = /* @__PURE__ */ new WeakMap());
	var a = kk[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		e && !s.has(e) && (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		e && !c.has(e) && Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (Dk.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				Dk.set(e, c), a.set(e, l), o.push(e), c === 1 && i && Ok.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), Ak++, function() {
		o.forEach(function(e) {
			var t = Dk.get(e) - 1, i = a.get(e) - 1;
			Dk.set(e, t), a.set(e, i), t || (Ok.has(e) || e.removeAttribute(r), Ok.delete(e)), i || e.removeAttribute(n);
		}), Ak--, Ak || (Dk = /* @__PURE__ */ new WeakMap(), Dk = /* @__PURE__ */ new WeakMap(), Ok = /* @__PURE__ */ new WeakMap(), kk = {});
	};
}, Pk = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || Ek(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), Nk(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
// node_modules/reka-ui/dist/shared/useHideOthers.js
function Fk(e) {
	let t;
	Ur(() => WO(e), (e) => {
		let n = !1;
		try {
			n = !!e?.closest("[popover]:not(:popover-open)");
		} catch {}
		e && !n ? t = Pk(e) : t && t();
	}), va(() => {
		t && t();
	});
}
// node_modules/reka-ui/dist/shared/useId.js
var Ik = 0;
function Lk(e, t = "reka") {
	if (e) return e;
	let n, r = rk({ useId: void 0 });
	return n = r.useId ? r.useId() : "useId" in Gu ? Si?.() : `${++Ik}`, t ? `${t}-${n}` : n;
}
// node_modules/reka-ui/dist/shared/useSize.js
function Rk(e) {
	let t = /* @__PURE__ */ I(), n = J(() => t.value?.width ?? 0), r = J(() => t.value?.height ?? 0), i;
	return ma(() => {
		let n = WO(e);
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
	}), va(() => {
		i?.disconnect(), i = void 0;
	}), {
		width: n,
		height: r
	};
}
// node_modules/reka-ui/dist/shared/useStateMachine.js
function zk(e, t) {
	let n = /* @__PURE__ */ I(e);
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
function Bk(e) {
	let t = BO("", 1e3);
	return {
		search: t,
		handleTypeaheadSearch: (n, r) => {
			if (t.value += n, e) e(n);
			else {
				let e = CO(), n = r.map((e) => ({
					...e,
					textValue: e.value?.textValue ?? e.ref.textContent?.trim() ?? ""
				})), i = n.find((t) => t.ref === e), a = Hk(n.map((e) => e.textValue), t.value, i?.textValue), o = n.find((e) => e.textValue === a);
				return o && o.ref.focus(), o?.ref;
			}
		},
		resetTypeahead: () => {
			t.value = "";
		}
	};
}
function Vk(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
function Hk(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = Vk(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
// node_modules/reka-ui/dist/Presence/usePresence.js
function Uk(e, t) {
	let n = /* @__PURE__ */ I({}), r = /* @__PURE__ */ I("none"), i = /* @__PURE__ */ I(e), a = e.value ? "mounted" : "unmounted", o, s = t.value?.ownerDocument.defaultView ?? UO, { state: c, dispatch: l } = zk(a, {
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
		if (OO) {
			let n = new CustomEvent(e, {
				bubbles: !1,
				cancelable: !1
			});
			t.value?.dispatchEvent(n);
		}
	};
	Ur(e, async (e, i) => {
		let a = i !== e;
		if (await pr(), a) {
			let a = r.value, o = Wk(t.value);
			e ? (l("MOUNT"), u("enter"), o === "none" && u("after-enter")) : o === "none" || o === "undefined" || n.value?.display === "none" ? (l("UNMOUNT"), u("leave"), u("after-leave")) : i && a !== o ? (l("ANIMATION_OUT"), u("leave")) : (l("UNMOUNT"), u("after-leave"));
		}
	}, { immediate: !0 });
	let d = (e) => {
		if (e.target !== t.value) return;
		let n = Wk(t.value), r = n.includes(CSS.escape(e.animationName)), a = c.value === "mounted" ? "enter" : "leave";
		if (r && (u(`after-${a}`), l("ANIMATION_END"), !i.value)) {
			let e = t.value.style.animationFillMode;
			t.value.style.animationFillMode = "forwards", o = s?.setTimeout(() => {
				t.value?.style.animationFillMode === "forwards" && (t.value.style.animationFillMode = e);
			});
		}
		n === "none" && l("ANIMATION_END");
	}, f = (e) => {
		e.target === t.value && (r.value = Wk(t.value));
	}, p = Ur(t, (e, t) => {
		e ? (n.value = getComputedStyle(e), e.addEventListener("animationstart", f), e.addEventListener("animationcancel", d), e.addEventListener("animationend", d)) : (l("ANIMATION_END"), o !== void 0 && s?.clearTimeout(o), t?.removeEventListener("animationstart", f), t?.removeEventListener("animationcancel", d), t?.removeEventListener("animationend", d));
	}, { immediate: !0 }), m = Ur(c, () => {
		let e = Wk(t.value);
		r.value = c.value === "mounted" ? e : "none";
	});
	return va(() => {
		p(), m(), t.value && (t.value.removeEventListener("animationstart", f), t.value.removeEventListener("animationcancel", d), t.value.removeEventListener("animationend", d)), o !== void 0 && s?.clearTimeout(o);
	}), { isPresent: J(() => ["mounted", "unmountSuspended"].includes(c.value)) };
}
function Wk(e) {
	return e && getComputedStyle(e).animationName || "none";
}
// node_modules/reka-ui/dist/Presence/Presence.js
var Gk = /*#__PURE__*/ z({
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
		let { present: r, forceMount: i } = /* @__PURE__ */ Pn(e), a = /* @__PURE__ */ I(), { isPresent: o } = Uk(r, a);
		n({ present: o });
		let s = t.default({ present: o.value });
		s = $O(s || []);
		let c = $s();
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
		return () => i.value || r.value || o.value ? yc(t.default({ present: o.value })[0], { ref: (e) => {
			let t = WO(e);
			return t?.hasAttribute === void 0 || (t?.hasAttribute("data-reka-popper-content-wrapper") ? a.value = t.firstElementChild : a.value = t), t;
		} }) : null;
	}
}), Kk = /*#__PURE__*/ z({
	name: "PrimitiveSlot",
	inheritAttrs: !1,
	setup(e, { attrs: t, slots: n }) {
		return () => {
			if (!n.default) return null;
			let e = $O(n.default()), r = e.findIndex((e) => e.type !== Ts);
			if (r === -1) return e;
			let i = e[r];
			delete i.props?.ref;
			let a = i.props ? Ks(t, i.props) : t, o = Bs({
				...i,
				props: {}
			}, a);
			return e.length === 1 ? o : (e[r] = o, e);
		};
	}
}), qk = [
	"area",
	"img",
	"input"
], Jk = /*#__PURE__*/ z({
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
		return typeof r == "string" && qk.includes(r) ? () => yc(r, t) : r === "template" ? () => yc(Kk, t, { default: n.default }) : () => yc(e.as, t, { default: n.default });
	}
});
// node_modules/reka-ui/dist/Primitive/usePrimitiveElement.js
function Yk() {
	let e = /* @__PURE__ */ I();
	return {
		primitiveElement: e,
		currentElement: J(() => ["#text", "#comment"].includes(e.value?.$el.nodeName) ? e.value?.$el.nextElementSibling : WO(e))
	};
}
// node_modules/reka-ui/dist/DismissableLayer/utils.js
var Xk = "dismissableLayer.pointerDownOutside", Zk = "dismissableLayer.focusOutside";
function Qk(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e.ownerDocument?.defaultView;
	return typeof Element < "u" && e instanceof Element || !!t && e instanceof t.Element;
}
function $k(e, t) {
	if (!Qk(t)) return !1;
	if (e.contains(t)) return !0;
	let n = t.closest("[data-dismissable-layer]"), r = e.dataset.dismissableLayer === "" ? e : e.querySelector("[data-dismissable-layer]"), i = Array.from(e.ownerDocument.querySelectorAll("[data-dismissable-layer]"));
	return !!(n && (r === n || i.indexOf(r) < i.indexOf(n)));
}
function eA(e, t, n = !0) {
	let r = /* @__PURE__ */ I(!1), i = /* @__PURE__ */ I(() => {});
	return Br((a) => {
		if (!OO || !kn(n)) return;
		let o = t?.value?.ownerDocument ?? globalThis.document, s = async (n) => {
			let a = n.target;
			if (t?.value && a) {
				if ($k(t.value, a)) o.removeEventListener("click", i.value), r.value = !1;
				else {
					if (n.target && !r.value) {
						let t = { originalEvent: n };
						function r() {
							wO(Xk, e, t);
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
		kn(n) && (r.value = !0);
	} };
}
function tA(e, t, n = !0) {
	let r = /* @__PURE__ */ I(!1);
	return Br((i) => {
		if (!OO || !kn(n)) return;
		let a = t?.value?.ownerDocument ?? globalThis.document, o = async (n) => {
			if (!t?.value) return;
			await pr(), await pr();
			let i = n.target;
			t.value && i && !$k(t.value, i) && n.target && !r.value && wO(Zk, e, { originalEvent: n });
		};
		a.addEventListener("focusin", o), i(() => a.removeEventListener("focusin", o));
	}), {
		onFocusCapture: () => {
			kn(n) && (r.value = !0);
		},
		onBlurCapture: () => {
			kn(n) && (r.value = !1);
		}
	};
}
// node_modules/reka-ui/dist/DismissableLayer/context.js
var nA = /*#__PURE__*/ fn({
	layersRoot: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), rA = /* @__PURE__ */ z({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = Ck(), o = J(() => a.value?.ownerDocument ?? globalThis.document), s = J(() => nA.layersRoot), c = J(() => a.value ? Array.from(s.value).indexOf(a.value) : -1), l = J(() => nA.layersWithOutsidePointerEventsDisabled.size > 0), u = J(() => {
			let e = Array.from(s.value), [t] = [...nA.layersWithOutsidePointerEventsDisabled].slice(-1), n = e.indexOf(t);
			return c.value >= n;
		}), d = eA(async (e) => {
			let t = [...nA.branches].some((t) => t?.contains(e.target));
			n.present && u.value && !t && (r("pointerDownOutside", e), r("interactOutside", e), await pr(), e.defaultPrevented || r("dismiss"));
		}, a, () => n.present), f = tA((e) => {
			let t = [...nA.branches].some((t) => t?.contains(e.target));
			n.present && !t && (r("focusOutside", e), r("interactOutside", e), e.defaultPrevented || r("dismiss"));
		}, a);
		return YO("Escape", (e) => {
			n.present && c.value === s.value.size - 1 && (r("escapeKeyDown", e), e.defaultPrevented || r("dismiss"));
		}, { target: () => o.value?.defaultView ?? globalThis.window }), Ur([
			a,
			() => n.disableOutsidePointerEvents,
			() => n.present
		], ([e, t, n], r, i) => {
			if (e && n && t) {
				let t = e.ownerDocument;
				ok(t, e), nA.layersWithOutsidePointerEventsDisabled.add(e), i(() => {
					nA.layersWithOutsidePointerEventsDisabled.delete(e), sk(t, e);
				});
			}
		}, { immediate: !0 }), Ur([a, () => n.present], ([e, t], n, r) => {
			e && t && (s.value.add(e), r(() => {
				s.value.delete(e);
			}));
		}, { immediate: !0 }), Br((e) => {
			e(() => {
				a.value && (s.value.delete(a.value), nA.layersWithOutsidePointerEventsDisabled.delete(a.value));
			});
		}), (t, n) => (H(), W(L(Jk), {
			ref: L(i),
			"as-child": e.asChild,
			as: e.as,
			"data-dismissable-layer": "",
			style: Oe({ pointerEvents: l.value ? u.value ? "auto" : "none" : void 0 }),
			onFocusCapture: L(f).onFocusCapture,
			onBlurCapture: L(f).onBlurCapture,
			onPointerdownCapture: L(d).onPointerDownCapture
		}, {
			default: R(() => [B(t.$slots, "default")]),
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
}), iA = DO(() => /* @__PURE__ */ I([]));
function aA() {
	let e = iA();
	return {
		add(t) {
			let n = e.value[0];
			t !== n && n?.pause(), e.value = oA(e.value, t), e.value.unshift(t);
		},
		remove(t) {
			e.value = oA(e.value, t), e.value[0]?.resume();
		}
	};
}
function oA(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
// node_modules/reka-ui/dist/FocusScope/utils.js
var sA = "focusScope.autoFocusOnMount", cA = "focusScope.autoFocusOnUnmount", lA = {
	bubbles: !1,
	cancelable: !0
};
function uA(e, t) {
	let n = t;
	for (; n;) {
		if (e.contains(n)) return !0;
		n = n.getRootNode().host ?? null;
	}
	return !1;
}
function dA(e, { select: t = !1 } = {}) {
	let n = CO();
	for (let r of e) if (_A(r, { select: t }), CO() !== n) return !0;
}
function fA(e) {
	let t = pA(e);
	return [mA(t, e), mA(t.reverse(), e)];
}
function pA(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t.sort((e, t) => e.tabIndex === t.tabIndex ? 0 : e.tabIndex === 0 ? 1 : t.tabIndex === 0 ? -1 : e.tabIndex - t.tabIndex);
}
function mA(e, t) {
	for (let n of e) if (!hA(n, { upTo: t })) return n;
}
function hA(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function gA(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function _A(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = CO();
		e.focus({ preventScroll: !0 }), e !== n && gA(e) && t && e.select();
	}
}
// node_modules/reka-ui/dist/FocusScope/FocusScope.js
var vA = /* @__PURE__ */ z({
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
		let n = e, r = t, { currentRef: i, currentElement: a } = Ck(), o = /* @__PURE__ */ I(null), s = aA(), c = /*#__PURE__*/ fn({
			paused: !1,
			pause() {
				this.paused = !0;
			},
			resume() {
				this.paused = !1;
			}
		});
		Br((e) => {
			if (!OO) return;
			let t = a.value;
			if (!n.trapped) return;
			let r = t?.ownerDocument ?? document, i = t ? t.getRootNode() : r;
			function s(e) {
				if (c.paused || !t) return;
				let n = e.target;
				t.contains(n) ? o.value = n : _A(o.value, { select: !0 });
			}
			function l(e) {
				if (c.paused || !t) return;
				let n = e.relatedTarget;
				n !== null && (t.contains(n) || _A(o.value, { select: !0 }));
			}
			function u(e) {
				let n = o.value;
				if (n === null || !e.some((e) => e.removedNodes.length > 0)) return;
				let r = CO();
				r && t.contains(r) || t.contains(n) || _A(t);
			}
			function d(e) {
				if (c.paused || !t) return;
				let n = e.composedPath()[0];
				uA(t, n) || _A(o.value, { select: !0 });
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
			let n = new CustomEvent(sA, lA), i = (e) => r("mountAutoFocus", e);
			e.addEventListener(sA, i), e.dispatchEvent(n), e.removeEventListener(sA, i), n.defaultPrevented || (dA(pA(e), { select: !0 }), CO() === t && _A(e));
		}
		Br(async (e) => {
			let t = a.value;
			if (await pr(), !t) return;
			n.present !== !1 && s.add(c);
			let i = CO();
			!t.contains(i) && n.present !== !1 && l(t, i), e(() => {
				let e = new CustomEvent(cA, lA), n = (e) => {
					r("unmountAutoFocus", e);
				};
				t.addEventListener(cA, n), t.dispatchEvent(e), t.setAttribute("data-focus-scope-unmounting", ""), setTimeout(() => {
					e.defaultPrevented || _A(i ?? document.body, { select: !0 }), t.removeEventListener(cA, n), s.remove(c), t.removeAttribute("data-focus-scope-unmounting");
				}, 0);
			});
		}), Ur(() => n.present, async (e, t) => {
			if (!OO) return;
			if (e === !1 && t === !0) {
				s.remove(c);
				return;
			}
			if (e !== !0 || t !== !1) return;
			s.add(c), await pr();
			let n = a.value;
			if (!n) return;
			let r = CO();
			n.contains(r) || l(n, r);
		});
		function u(e) {
			if (!n.loop && !n.trapped || c.paused) return;
			let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, r = CO();
			if (t && r) {
				let t = e.currentTarget, [i, a] = fA(t);
				i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n.loop && _A(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n.loop && _A(a, { select: !0 })) : r === t && e.preventDefault();
			}
		}
		return (t, n) => (H(), W(L(Jk), {
			ref_key: "currentRef",
			ref: i,
			tabindex: "-1",
			"as-child": e.asChild,
			as: e.as,
			onKeydown: u
		}, {
			default: R(() => [B(t.$slots, "default")]),
			_: 3
		}, 8, ["as-child", "as"]));
	}
}), yA = "menu.itemSelect", bA = ["Enter", " "], xA = [
	"ArrowDown",
	"PageUp",
	"Home"
], SA = [
	"ArrowUp",
	"PageDown",
	"End"
], CA = [...xA, ...SA];
[...bA], [...bA];
function wA(e) {
	return e ? "open" : "closed";
}
function TA(e) {
	let { onEntryFocus: t, onEntryFocusOnce: n, ...r } = e;
	return r;
}
function EA(e) {
	let t = CO();
	for (let n of e) if (n === t || (n.focus(), CO() !== t)) return;
}
function DA(e, t) {
	let { x: n, y: r } = e, i = !1;
	for (let e = 0, a = t.length - 1; e < t.length; a = e++) {
		let o = t[e].x, s = t[e].y, c = t[a].x, l = t[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
function OA(e, t) {
	return t ? DA({
		x: e.clientX,
		y: e.clientY
	}, t) : !1;
}
function kA(e) {
	return e.pointerType === "mouse";
}
// node_modules/reka-ui/dist/Teleport/Teleport.js
var AA = /* @__PURE__ */ z({
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
		let t = e, n = rk({}), r = J(() => t.to ?? n.teleportTo?.value ?? "body"), i = KO();
		return (t, n) => L(i) || e.forceMount ? (H(), W(ii, {
			key: 0,
			to: r.value,
			disabled: e.disabled,
			defer: e.defer
		}, [B(t.$slots, "default")], 8, [
			"to",
			"disabled",
			"defer"
		])) : q("v-if", !0);
	}
}), jA = "data-reka-collection-item";
function MA(e = {}) {
	let { key: t = "", isProvider: n = !1 } = e, r = `${t}CollectionProvider`, i;
	n ? (i = {
		collectionRef: /* @__PURE__ */ I(),
		itemMap: /* @__PURE__ */ I(/* @__PURE__ */ new Map())
	}, Fr(r, i)) : i = Ir(r);
	let a = (e, t = !1) => {
		if (!i.collectionRef.value) return;
		let n = i.itemMap.value.get(e);
		return n && (t || n.ref.dataset.disabled !== "") ? n : void 0;
	}, o = (e = !1) => {
		let t = i.collectionRef.value;
		if (!t) return [];
		let n = Array.from(t.querySelectorAll(`[${jA}]`)), r = new Map(n.map((e, t) => [e, t])), a = Array.from(i.itemMap.value.values()).sort((e, t) => (r.get(e.ref) ?? -1) - (r.get(t.ref) ?? -1));
		return e ? a : a.filter((e) => e.ref.dataset.disabled !== "");
	}, s = /*#__PURE__*/ z({
		name: "CollectionSlot",
		inheritAttrs: !1,
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = Yk();
			return Ur(a, () => {
				i.collectionRef.value = a.value;
			}), () => yc(Kk, {
				ref: r,
				...n
			}, t);
		}
	}), c = /*#__PURE__*/ z({
		name: "CollectionItem",
		inheritAttrs: !1,
		props: { value: { validator: () => !0 } },
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = Yk();
			return Br((t) => {
				if (a.value) {
					let n = xn(a.value);
					i.itemMap.value.set(n, {
						ref: a.value,
						value: e.value
					}), t(() => i.itemMap.value.delete(n));
				}
			}), () => yc(Kk, {
				...n,
				[jA]: "",
				ref: r
			}, t);
		}
	});
	return {
		getItems: o,
		getItem: a,
		reactiveItems: J(() => Array.from(i.itemMap.value.values())),
		itemMapSize: J(() => i.itemMap.value.size),
		CollectionSlot: s,
		CollectionItem: c
	};
}
// node_modules/reka-ui/dist/VisuallyHidden/VisuallyHidden.js
var NA = /* @__PURE__ */ z({
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
		return (t, n) => (H(), W(L(Jk), {
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
			default: R(() => [B(t.$slots, "default")]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"aria-hidden",
			"data-hidden",
			"tabindex"
		]));
	}
}), PA = "rovingFocusGroup.onEntryFocus", FA = {
	bubbles: !1,
	cancelable: !0
};
function IA(e, t = !1) {
	let n = CO();
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), CO() !== n)) return;
}
// node_modules/reka-ui/dist/Popper/PopperRoot.js
var [LA, RA] = /*#__PURE__*/ SO("PopperRoot"), zA = /* @__PURE__ */ z({
	inheritAttrs: !1,
	__name: "PopperRoot",
	setup(e) {
		let t = /* @__PURE__ */ I();
		return RA({
			anchor: t,
			onAnchorChange: (e) => t.value = e
		}), (e, t) => B(e.$slots, "default");
	}
}), BA = /* @__PURE__ */ z({
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
		let t = e, { forwardRef: n, currentElement: r } = Ck(), i = LA();
		return Vr(() => {
			i.onAnchorChange(t.reference ?? r.value);
		}), (t, r) => (H(), W(L(Jk), {
			ref: L(n),
			as: e.as,
			"as-child": e.asChild
		}, {
			default: R(() => [B(t.$slots, "default")]),
			_: 3
		}, 8, ["as", "as-child"]));
	}
});
// node_modules/reka-ui/dist/Popper/utils.js
function VA(e) {
	return e !== null;
}
function HA(e) {
	return {
		name: "transformOrigin",
		options: e,
		fn(t) {
			let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = UA(n), u = {
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
function UA(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var WA = [
	"top",
	"right",
	"bottom",
	"left"
], GA = Math.min, KA = Math.max, qA = Math.round, JA = Math.floor, YA = (e) => ({
	x: e,
	y: e
}), XA = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function ZA(e, t, n) {
	return KA(e, GA(t, n));
}
function QA(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function $A(e) {
	return e.split("-")[0];
}
function ej(e) {
	return e.split("-")[1];
}
function tj(e) {
	return e === "x" ? "y" : "x";
}
function nj(e) {
	return e === "y" ? "height" : "width";
}
function rj(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function ij(e) {
	return tj(rj(e));
}
function aj(e, t, n) {
	n === void 0 && (n = !1);
	let r = ej(e), i = ij(e), a = nj(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = mj(o)), [o, mj(o)];
}
function oj(e) {
	let t = mj(e);
	return [
		sj(e),
		t,
		sj(t)
	];
}
function sj(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var cj = ["left", "right"], lj = ["right", "left"], uj = ["top", "bottom"], dj = ["bottom", "top"];
function fj(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? lj : cj : t ? cj : lj;
		case "left":
		case "right": return t ? uj : dj;
		default: return [];
	}
}
function pj(e, t, n, r) {
	let i = ej(e), a = fj($A(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(sj)))), a;
}
function mj(e) {
	let t = $A(e);
	return XA[t] + e.slice(t.length);
}
function hj(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function gj(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : hj(e);
}
function _j(e) {
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
function vj(e, t, n) {
	let { reference: r, floating: i } = e, a = rj(t), o = ij(t), s = nj(o), c = $A(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = ej(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function yj(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = QA(t, e), p = gj(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = _j(await i.getClippingRect({
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
	}, y = _j(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var bj = 50, xj = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: yj
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = vj(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < bj && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = vj(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Sj = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = QA(e, t) || {};
		if (l == null) return {};
		let d = gj(u), f = {
			x: n,
			y: r
		}, p = ij(i), m = nj(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		C && await (o.isElement == null ? void 0 : o.isElement(S)) || (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, ee = GA(d[_], T), E = GA(d[v], T), D = C - h[m] - E, O = C / 2 - h[m] / 2 + w, te = ZA(ee, O, D), ne = !c.arrow && ej(i) != null && O !== te && a.reference[m] / 2 - (O < ee ? ee : E) - h[m] / 2 < 0, re = ne ? O < ee ? O - ee : O - D : 0;
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
}), Cj = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = QA(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = $A(r), _ = rj(o), v = $A(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [mj(o)] : oj(o)), x = p !== "none";
			!d && x && b.push(...pj(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = aj(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === rj(t) || T.every((e) => rj(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = rj(e.placement);
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
function wj(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Tj(e) {
	return WA.some((t) => e[t] >= 0);
}
var Ej = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = QA(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = wj(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Tj(e)
					} };
				}
				case "escaped": {
					let e = wj(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Tj(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Dj = /*#__PURE__*/ new Set(["left", "top"]);
async function Oj(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = $A(n), s = ej(n), c = rj(n) === "y", l = Dj.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = QA(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var kj = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Oj(t, e);
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
}, Aj = function(e) {
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
			} }, ...l } = QA(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = rj(i), p = tj(f), m = u[p], h = u[f], g = (e, t) => ZA(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, jj = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = QA(e, t), u = {
				x: n,
				y: r
			}, d = rj(i), f = tj(d), p = u[f], m = u[d], h = QA(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = Dj.has($A(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Mj = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = QA(e, t), c = await i.detectOverflow(t, s), l = $A(n), u = ej(n), d = rj(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = GA(p - c[m], g), y = GA(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * KA(c.left, c.right) : S = p - 2 * KA(c.top, c.bottom)), await o({
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
function Nj() {
	return typeof window < "u";
}
function Pj(e) {
	return Lj(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Fj(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Ij(e) {
	return ((Lj(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Lj(e) {
	return Nj() ? e instanceof Node || e instanceof Fj(e).Node : !1;
}
function Rj(e) {
	return Nj() ? e instanceof Element || e instanceof Fj(e).Element : !1;
}
function zj(e) {
	return Nj() ? e instanceof HTMLElement || e instanceof Fj(e).HTMLElement : !1;
}
function Bj(e) {
	return !Nj() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Fj(e).ShadowRoot;
}
function Vj(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Qj(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Hj(e) {
	return /^(table|td|th)$/.test(Pj(e));
}
function Uj(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Wj = /transform|translate|scale|rotate|perspective|filter/, Gj = /paint|layout|strict|content/, Kj = (e) => !!e && e !== "none", qj;
function Jj(e) {
	let t = Rj(e) ? Qj(e) : e;
	return Kj(t.transform) || Kj(t.translate) || Kj(t.scale) || Kj(t.rotate) || Kj(t.perspective) || !Xj() && (Kj(t.backdropFilter) || Kj(t.filter)) || Wj.test(t.willChange || "") || Gj.test(t.contain || "");
}
function Yj(e) {
	let t = eM(e);
	for (; zj(t) && !Zj(t);) {
		if (Jj(t)) return t;
		if (Uj(t)) return null;
		t = eM(t);
	}
	return null;
}
function Xj() {
	return qj ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), qj;
}
function Zj(e) {
	return /^(html|body|#document)$/.test(Pj(e));
}
function Qj(e) {
	return Fj(e).getComputedStyle(e);
}
function $j(e) {
	return Rj(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function eM(e) {
	if (Pj(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Bj(e) && e.host || Ij(e);
	return Bj(t) ? t.host : t;
}
function tM(e) {
	let t = eM(e);
	return Zj(t) ? (e.ownerDocument || e).body : zj(t) && Vj(t) ? t : tM(t);
}
function nM(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = tM(e), i = r === e.ownerDocument?.body, a = Fj(r);
	if (i) {
		let e = rM(a);
		return t.concat(a, a.visualViewport || [], Vj(r) ? r : [], e && n ? nM(e) : []);
	}
	return t.concat(r, nM(r, [], n));
}
function rM(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function iM(e) {
	let t = Qj(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = zj(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = qA(n) !== a || qA(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function aM(e) {
	return Rj(e) ? e : e.contextElement;
}
function oM(e) {
	let t = aM(e);
	if (!zj(t)) return YA(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = iM(t), o = (a ? qA(n.width) : n.width) / r, s = (a ? qA(n.height) : n.height) / i;
	return o && Number.isFinite(o) || (o = 1), s && Number.isFinite(s) || (s = 1), {
		x: o,
		y: s
	};
}
var sM = /*#__PURE__*/ YA(0);
function cM(e) {
	let t = Fj(e);
	return !Xj() || !t.visualViewport ? sM : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function lM(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === Fj(e);
}
function uM(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = aM(e), o = YA(1);
	t && (r ? Rj(r) && (o = oM(r)) : o = oM(e));
	let s = lM(a, n, r) ? cM(a) : YA(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = Fj(a), t = Rj(r) ? Fj(r) : r, n = e, i = rM(n);
		for (; i && t !== n;) {
			let e = oM(i), t = i.getBoundingClientRect(), r = Qj(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Fj(i), i = rM(n);
		}
	}
	return _j({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function dM(e, t) {
	let n = $j(e).scrollLeft;
	return t ? t.left + n : uM(Ij(e)).left + n;
}
function fM(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - dM(e, n),
		y: n.top + t.scrollTop
	};
}
function pM(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Ij(r), s = t ? Uj(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = YA(1), u = YA(0), d = zj(r);
	if ((d || !a) && ((Pj(r) !== "body" || Vj(o)) && (c = $j(r)), d)) {
		let e = uM(r);
		l = oM(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? fM(o, c) : YA(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function mM(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function hM(e) {
	let t = $j(e), n = e.ownerDocument.body, r = KA(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = KA(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + dM(e), o = -t.scrollTop;
	return Qj(n).direction === "rtl" && (a += KA(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var gM = 25;
function _M(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = Fj(e), a = Ij(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !Xj() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (dM(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= gM && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function vM(e, t) {
	let n = uM(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = oM(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function yM(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = _M(e, n, t);
	else if (t === "document") r = hM(Ij(e));
	else if (Rj(t)) r = vM(t, n);
	else {
		let n = cM(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return _j(r);
}
function bM(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = nM(e, [], !1).filter((e) => Rj(e) && Pj(e) !== "body"), i = null, a = Qj(e).position === "fixed", o = a ? eM(e) : e;
	for (; Rj(o) && !Zj(o);) {
		let e = Qj(o), t = Jj(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = eM(o);
	}
	return t.set(e, r), r;
}
function xM(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Uj(t) ? [] : bM(t, this._c) : [].concat(n), r], o = yM(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = yM(t, a[e], i);
		s = KA(n.top, s), c = GA(n.right, c), l = GA(n.bottom, l), u = KA(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function SM(e) {
	let { width: t, height: n } = iM(e);
	return {
		width: t,
		height: n
	};
}
function CM(e, t, n) {
	let r = zj(t), i = Ij(t), a = n === "fixed", o = uM(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = YA(0);
	if ((r || !a) && ((Pj(t) !== "body" || Vj(i)) && (s = $j(t)), r)) {
		let e = uM(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = dM(i));
	let l = i && !r && !a ? fM(i, s) : YA(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function wM(e) {
	return Qj(e).position === "static";
}
function TM(e, t) {
	if (!zj(e) || Qj(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Ij(e) === n && (n = n.ownerDocument.body), n;
}
function EM(e, t) {
	let n = Fj(e);
	if (Uj(e)) return n;
	if (!zj(e)) {
		let t = eM(e);
		for (; t && !Zj(t);) {
			if (Rj(t) && !wM(t)) return t;
			t = eM(t);
		}
		return n;
	}
	let r = TM(e, t);
	for (; r && Hj(r) && wM(r);) r = TM(r, t);
	return r && Zj(r) && wM(r) && !Jj(r) ? n : r || Yj(e) || n;
}
var DM = async function(e) {
	let t = this.getOffsetParent || EM, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: CM(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function OM(e) {
	return Qj(e).direction === "rtl";
}
var kM = {
	convertOffsetParentRelativeRectToViewportRelativeRect: pM,
	getDocumentElement: Ij,
	getClippingRect: xM,
	getOffsetParent: EM,
	getElementRects: DM,
	getClientRects: mM,
	getDimensions: SM,
	getScale: oM,
	isElement: Rj,
	isRTL: OM
};
function AM(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function jM(e, t, n) {
	let r = null, i, a = Ij(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = JA(d), h = JA(a.clientWidth - (u + f)), g = JA(a.clientHeight - (d + p)), _ = JA(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: KA(0, GA(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!AM(l, e.getBoundingClientRect())) return s();
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
	let c = Fj(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function MM(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = aM(e), u = i || a ? [...l ? nM(l) : [], ...t ? nM(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? jM(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? uM(e) : null;
	c && g();
	function g() {
		let t = uM(e);
		h && !AM(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var NM = kj, PM = Aj, FM = Cj, IM = Mj, LM = Ej, RM = Sj, zM = jj, BM = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...kM,
		...i.platform,
		_c: r
	};
	return xj(e, t, {
		...i,
		platform: a
	});
};
// node_modules/@floating-ui/vue/dist/floating-ui.vue.mjs
function VM(e) {
	return typeof e == "object" && !!e && "$el" in e;
}
function HM(e) {
	if (VM(e)) {
		let t = e.$el;
		return Lj(t) && Pj(t) === "#comment" ? null : t;
	}
	return e;
}
function UM(e) {
	return {
		name: "arrow",
		options: e,
		fn(t) {
			let n = HM(kn(e.element));
			return n == null ? {} : RM({
				element: n,
				padding: e.padding
			}).fn(t);
		}
	};
}
function WM(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function GM(e, t) {
	let n = WM(e);
	return Math.round(t * n) / n;
}
function KM(e, t, n) {
	n === void 0 && (n = {});
	let r = n.whileElementsMounted, i = J(() => kn(n.open) ?? !0), a = J(() => kn(n.middleware)), o = J(() => kn(n.placement) ?? "bottom"), s = J(() => kn(n.strategy) ?? "absolute"), c = J(() => kn(n.transform) ?? !0), l = J(() => HM(e.value)), u = J(() => HM(t.value)), d = /* @__PURE__ */ I(0), f = /* @__PURE__ */ I(0), p = /* @__PURE__ */ I(s.value), m = /* @__PURE__ */ I(o.value), h = /* @__PURE__ */ Tn({}), g = /* @__PURE__ */ I(!1), _ = J(() => {
		let e = {
			position: p.value,
			left: "0",
			top: "0"
		};
		if (!u.value) return e;
		let t = GM(u.value, d.value), n = GM(u.value, f.value);
		return c.value ? {
			...e,
			transform: "translate(" + t + "px, " + n + "px)",
			...WM(u.value) >= 1.5 && { willChange: "transform" }
		} : {
			position: p.value,
			left: t + "px",
			top: n + "px"
		};
	}), v;
	function y() {
		if (l.value == null || u.value == null) return;
		let e = i.value;
		BM(l.value, u.value, {
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
	return Ur([
		a,
		o,
		s,
		i
	], y, { flush: "sync" }), Ur([l, u], x, { flush: "sync" }), Ur(i, S, { flush: "sync" }), Xe() && Ze(b), {
		x: /* @__PURE__ */ hn(d),
		y: /* @__PURE__ */ hn(f),
		strategy: /* @__PURE__ */ hn(p),
		placement: /* @__PURE__ */ hn(m),
		middlewareData: /* @__PURE__ */ hn(h),
		isPositioned: /* @__PURE__ */ hn(g),
		floatingStyles: _,
		update: y
	};
}
// node_modules/reka-ui/dist/Popper/PopperContent.js
var qM = ["dir"], JM = {
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
}, [YM, XM] = /*#__PURE__*/ SO("PopperContent"), ZM = /* @__PURE__ */ z({
	inheritAttrs: !1,
	__name: "PopperContent",
	props: /* @__PURE__ */ Za({
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
	}, { ...JM }),
	emits: ["placed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = LA(), { forwardRef: a, currentElement: o } = Ck(), s = _k(J(() => n.dir)), c = /* @__PURE__ */ I(), l = /* @__PURE__ */ I(), { width: u, height: d } = Rk(l), f = J(() => n.side + (n.align === "center" ? "" : `-${n.align}`)), p = J(() => typeof n.collisionPadding == "number" ? n.collisionPadding : {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			...n.collisionPadding
		}), m = J(() => Array.isArray(n.collisionBoundary) ? n.collisionBoundary : [n.collisionBoundary]), h = J(() => ({
			padding: p.value,
			boundary: m.value.filter(VA),
			altBoundary: m.value.length > 0
		})), g = J(() => ({
			mainAxis: n.sideFlip,
			crossAxis: n.alignFlip
		})), _ = J(() => [
			NM({
				mainAxis: n.sideOffset + d.value,
				alignmentAxis: n.alignOffset
			}),
			n.prioritizePosition && n.avoidCollisions && FM({
				...h.value,
				...g.value
			}),
			n.avoidCollisions && PM({
				mainAxis: !0,
				crossAxis: !!n.prioritizePosition,
				limiter: n.sticky === "partial" ? zM() : void 0,
				...h.value
			}),
			!n.prioritizePosition && n.avoidCollisions && FM({
				...h.value,
				...g.value
			}),
			IM({
				...h.value,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--reka-popper-available-width", `${n}px`), o.setProperty("--reka-popper-available-height", `${r}px`), o.setProperty("--reka-popper-anchor-width", `${i}px`), o.setProperty("--reka-popper-anchor-height", `${a}px`);
				}
			}),
			l.value && UM({
				element: l.value,
				padding: n.arrowPadding
			}),
			HA({
				arrowWidth: u.value,
				arrowHeight: d.value,
				dir: s.value
			}),
			n.hideWhenDetached && LM({
				strategy: "referenceHidden",
				...h.value
			})
		]), { floatingStyles: v, placement: y, isPositioned: b, middlewareData: x, update: S } = KM(J(() => n.reference ?? i.anchor.value), c, {
			strategy: n.positionStrategy,
			placement: f,
			whileElementsMounted: (...e) => MM(...e, {
				layoutShift: !n.disableUpdateOnLayoutShift,
				animationFrame: n.updatePositionStrategy === "always"
			}),
			middleware: _
		}), C = J(() => UA(y.value)[0]), w = J(() => UA(y.value)[1]);
		Vr(() => {
			b.value && r("placed");
		});
		let T = J(() => {
			let e = x.value.arrow?.centerOffset !== 0;
			return n.hideShiftedArrow && e;
		}), ee = /* @__PURE__ */ I("");
		return Br(() => {
			o.value && (ee.value = window.getComputedStyle(o.value).zIndex);
		}), XM({
			placedSide: C,
			onArrowChange: (e) => l.value = e,
			arrowX: J(() => x.value.arrow?.x ?? 0),
			arrowY: J(() => x.value.arrow?.y ?? 0),
			shouldHideArrow: T
		}), (e, t) => (H(), U("div", {
			ref_key: "floatingRef",
			ref: c,
			"data-reka-popper-content-wrapper": "",
			dir: L(s),
			style: Oe({
				...L(v),
				transform: L(b) ? L(v).transform : "translate(0, -200%)",
				minWidth: "max-content",
				zIndex: ee.value,
				"--reka-popper-transform-origin": [L(x).transformOrigin?.x, L(x).transformOrigin?.y].join(" "),
				...L(x).hide?.referenceHidden && {
					visibility: "hidden",
					pointerEvents: "none"
				}
			})
		}, [n.memoDependencies ? xc([
			n.asChild,
			n.as,
			C.value,
			w.value,
			L(b),
			...Object.values(e.$attrs),
			...n.memoDependencies
		], () => (H(), W(L(Jk), Ks({
			key: 0,
			ref: L(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			style: { animation: L(b) ? void 0 : "none" }
		}), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"style"
		])), t, 0) : (H(), W(L(Jk), Ks({
			key: 1,
			ref: L(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			dir: L(s),
			style: { animation: L(b) ? void 0 : "none" }
		}), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"dir",
			"style"
		]))], 12, qM));
	}
});
// node_modules/reka-ui/dist/shared/useNonce.js
function QM(e) {
	let t = rk({ nonce: /* @__PURE__ */ I() });
	return J(() => e?.value || t.nonce?.value);
}
// node_modules/reka-ui/dist/RovingFocus/RovingFocusGroup.js
var [$M, eN] = /*#__PURE__*/ SO("RovingFocusGroup"), tN = /* @__PURE__ */ z({
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
		let r = e, i = n, { loop: a, orientation: o, dir: s } = /* @__PURE__ */ Pn(r), c = _k(s), l = QO(r, "currentTabStopId", i, {
			defaultValue: r.defaultCurrentTabStopId,
			passive: r.currentTabStopId === void 0
		}), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(!1), f = /* @__PURE__ */ I(0), { getItems: p, CollectionSlot: m } = MA({ isProvider: !0 });
		function h(e) {
			let t = !d.value;
			if (e.currentTarget && e.target === e.currentTarget && t && !u.value) {
				let t = new CustomEvent(PA, FA);
				if (e.currentTarget.dispatchEvent(t), i("entryFocus", t), !t.defaultPrevented) {
					let e = p().map((e) => e.ref).filter((e) => e.dataset.disabled !== "");
					IA([
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
		return t({ getItems: p }), eN({
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
		}), (t, n) => (H(), W(L(m), null, {
			default: R(() => [K(L(Jk), {
				tabindex: u.value || f.value === 0 ? -1 : 0,
				"data-orientation": L(o),
				as: e.as,
				"as-child": e.asChild,
				dir: L(c),
				style: { outline: "none" },
				onMousedown: n[0] ||= (e) => d.value = !0,
				onMouseup: g,
				onFocus: h,
				onBlur: n[1] ||= (e) => u.value = !1
			}, {
				default: R(() => [B(t.$slots, "default")]),
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
}), [nN, rN] = /*#__PURE__*/ SO("FieldRoot"), iN = /* @__PURE__ */ z({
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
		return (e, n) => (H(), W(L(BA), Pe(zs(t)), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16));
	}
});
// node_modules/reka-ui/dist/shared/useIsUsingKeyboard.js
function aN() {
	let e = /* @__PURE__ */ I(!1);
	return ma(() => {
		GO("keydown", () => {
			e.value = !0;
		}, {
			capture: !0,
			passive: !0
		}), GO(["pointerdown", "pointermove"], () => {
			e.value = !1;
		}, {
			capture: !0,
			passive: !0
		});
	}), e;
}
var oN = IO(aN), [sN, cN] = /*#__PURE__*/ SO(["MenuRoot", "MenuSub"], "MenuContext"), [lN, uN] = /*#__PURE__*/ SO("MenuRoot"), dN = /* @__PURE__ */ z({
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
		let n = e, r = t, { modal: i, dir: a } = /* @__PURE__ */ Pn(n), o = _k(a), s = QO(n, "open", r), c = /* @__PURE__ */ I(), l = oN();
		return cN({
			open: s,
			onOpenChange: (e) => {
				s.value = e;
			},
			content: c,
			onContentChange: (e) => {
				c.value = e;
			}
		}), uN({
			onClose: () => {
				s.value = !1;
			},
			isUsingKeyboardRef: l,
			dir: o,
			modal: i
		}), (e, t) => (H(), W(L(zA), null, {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}));
	}
}), [fN, pN] = /*#__PURE__*/ SO("MenuContent"), mN = /* @__PURE__ */ z({
	__name: "MenuContentImpl",
	props: /* @__PURE__ */ Za({
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
	}, { ...JM }),
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
		let n = e, r = t, i = sN(), a = lN(), { trapFocus: o, disableOutsidePointerEvents: s, loop: c } = /* @__PURE__ */ Pn(n);
		bk(), mk(s.value);
		let l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(0), d = /* @__PURE__ */ I(0), f = /* @__PURE__ */ I(null), p = /* @__PURE__ */ I("right"), m = /* @__PURE__ */ I(0), h = /* @__PURE__ */ I(null), g = /* @__PURE__ */ I(), { forwardRef: _, currentElement: v } = Ck(), { handleTypeaheadSearch: y } = Bk(), b = /* @__PURE__ */ I();
		function x(e) {
			let t = tk(e, b.value || CO(), v.value, {
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
		let C = /* @__PURE__ */ I(), w = /* @__PURE__ */ I();
		Ur(b, (e) => {
			if (w.value && (e === void 0 || e !== w.value.trigger.value)) {
				if (e === void 0) return;
				w.value.onOpenChange(!1), w.value = void 0;
			}
		}), Ur(v, (e) => {
			i.onContentChange(e);
		}), va(() => {
			window.clearTimeout(u.value);
		});
		function T(e) {
			return p.value === f.value?.side && OA(e, f.value?.area);
		}
		async function ee(e) {
			r("openAutoFocus", e), !e.defaultPrevented && (e.preventDefault(), v.value?.focus({ preventScroll: !0 }));
		}
		function E(e) {
			if (e.defaultPrevented) return;
			let t = e.target, n = t.closest("[data-reka-menu-content]") === e.currentTarget, r = ["input", "textarea"].includes(t.tagName.toLowerCase()), i = e.ctrlKey || e.altKey || e.metaKey, o = e.key.length === 1, s = tk(e, CO(), v.value, {
				loop: c.value,
				arrowKeyOptions: "vertical",
				dir: a?.dir.value,
				focus: !0,
				attributeName: "[data-reka-collection-item]:not([data-disabled])"
			});
			if (s) return s?.focus();
			if (e.code === "Space") return;
			let l = g.value?.getItems() ?? [];
			if (n && (e.key === "Tab" && a.modal.value && e.preventDefault(), !i && o && !r && y(e.key, l)), e.target !== v.value || !CA.includes(e.key)) return;
			e.preventDefault();
			let u = [...l.map((e) => e.ref)];
			SA.includes(e.key) && u.reverse(), EA(u);
		}
		function D(e) {
			e?.currentTarget?.contains?.(e.target) || (window.clearTimeout(u.value), l.value = "");
		}
		function O(e) {
			if (!kA(e)) return;
			let t = e.target, n = m.value !== e.clientX;
			if ((e?.currentTarget)?.contains(t) && n) {
				let t = e.clientX > m.value ? "right" : "left";
				p.value = t, m.value = e.clientX;
			}
		}
		function te(e) {
			kA(e) && C.value && C.value.focus();
		}
		return pN({
			onItemEnter: (e) => !!T(e),
			onItemLeave: (e) => T(e) ? !0 : (["INPUT", "TEXTAREA"].includes(CO()?.tagName || "") || v.value?.focus(), h.value = null, !1),
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
		}), (t, n) => (H(), W(L(vA), {
			"as-child": "",
			trapped: L(o),
			onMountAutoFocus: ee,
			onUnmountAutoFocus: n[7] ||= (e) => r("closeAutoFocus", e)
		}, {
			default: R(() => [K(L(rA), {
				"as-child": "",
				"disable-outside-pointer-events": L(s),
				onEscapeKeyDown: n[2] ||= (e) => r("escapeKeyDown", e),
				onPointerDownOutside: n[3] ||= (e) => r("pointerDownOutside", e),
				onFocusOutside: n[4] ||= (e) => r("focusOutside", e),
				onInteractOutside: n[5] ||= (e) => r("interactOutside", e),
				onDismiss: n[6] ||= (e) => r("dismiss")
			}, {
				default: R(() => [K(L(tN), {
					ref_key: "rovingFocusGroupRef",
					ref: g,
					"current-tab-stop-id": h.value,
					"onUpdate:currentTabStopId": n[0] ||= (e) => h.value = e,
					"as-child": "",
					orientation: "vertical",
					dir: L(a).dir.value,
					loop: L(c),
					onEntryFocus: n[1] ||= (e) => {
						r("entryFocus", e), L(a).isUsingKeyboardRef.value || e.preventDefault();
					}
				}, {
					default: R(() => [K(L(ZM), {
						ref: L(_),
						role: "menu",
						as: e.as,
						"as-child": e.asChild,
						"aria-orientation": "vertical",
						"data-reka-menu-content": "",
						"data-state": L(wA)(L(i).open.value),
						dir: L(a).dir.value,
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
						onKeydown: E,
						onBlur: D,
						onPointermove: O,
						onPointerenter: te
					}, {
						default: R(() => [B(t.$slots, "default")]),
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
}), hN = /* @__PURE__ */ z({
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
		let t = e, n = fN(), { forwardRef: r, currentElement: i } = Ck(), { CollectionItem: a } = MA(), o = /* @__PURE__ */ I(!1), s = J(() => o.value || i.value != null && n.highlightedElement.value === i.value);
		async function c(e) {
			if (!e.defaultPrevented && kA(e)) {
				if (t.disabled) n.onItemLeave(e);
				else if (!n.onItemEnter(e)) {
					let t = e.currentTarget;
					n.highlightedElement.value = t, ["INPUT", "TEXTAREA"].includes(CO()?.tagName || "") || t.focus({ preventScroll: !0 });
				}
			}
		}
		async function l(e) {
			await pr(), !e.defaultPrevented && kA(e) && n.highlightedElement.value === i.value && !n.onItemLeave(e) && n.highlightedElement.value === i.value && (n.highlightedElement.value = void 0);
		}
		return (t, i) => (H(), W(L(a), { value: { textValue: e.textValue } }, {
			default: R(() => [K(L(Jk), Ks({
				ref: L(r),
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
					await pr(), !(t.defaultPrevented || e.disabled) && (o.value = !0, L(n).highlightedElement.value = r);
				},
				onBlur: i[1] ||= async (e) => {
					await pr(), !e.defaultPrevented && (o.value = !1);
				}
			}), {
				default: R(() => [B(t.$slots, "default")]),
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
}), gN = /* @__PURE__ */ z({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = Ck(), o = lN(), s = fN(), c = /* @__PURE__ */ I(!1);
		async function l() {
			let e = a.value;
			if (!n.disabled && e) {
				let e = new CustomEvent(yA, {
					bubbles: !0,
					cancelable: !0
				});
				r("select", e), await pr(), e.defaultPrevented ? c.value = !1 : o.onClose();
			}
		}
		return (t, r) => (H(), W(hN, Ks(n, {
			ref: L(i),
			onClick: l,
			onPointerdown: r[0] ||= () => {
				c.value = !0;
			},
			onPointerup: r[1] ||= async (e) => {
				await pr(), e.defaultPrevented || c.value || e.currentTarget?.click();
			},
			onKeydown: r[2] ||= async (t) => {
				let n = L(s).searchRef.value !== "";
				e.disabled || n && t.key === " " || L(bA).includes(t.key) && (t.currentTarget?.click(), t.preventDefault());
			}
		}), {
			default: R(() => [B(t.$slots, "default")]),
			_: 3
		}, 16));
	}
}), _N = /* @__PURE__ */ z({
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
		let n = e, r = t, i = Tk(n, r), a = sN(), { forwardRef: o, currentElement: s } = Ck();
		return Fk(s), (e, t) => (H(), W(mN, Ks(L(i), {
			ref: L(o),
			"trap-focus": L(a).open.value,
			"disable-outside-pointer-events": L(a).open.value,
			"disable-outside-scroll": !0,
			onDismiss: t[0] ||= (e) => L(a).onOpenChange(!1),
			onFocusOutside: t[1] ||= ku((e) => r("focusOutside", e), ["prevent"])
		}), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16, ["trap-focus", "disable-outside-pointer-events"]));
	}
}), vN = /* @__PURE__ */ z({
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
		let n = Tk(e, t), r = sN();
		return (e, t) => (H(), W(mN, Ks(L(n), {
			"trap-focus": !1,
			"disable-outside-pointer-events": !1,
			"disable-outside-scroll": !1,
			onDismiss: t[0] ||= (e) => L(r).onOpenChange(!1)
		}), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), yN = /* @__PURE__ */ z({
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
		let n = Tk(e, t), r = sN(), i = lN();
		return (t, a) => (H(), W(L(Gk), { present: e.forceMount || L(r).open.value }, {
			default: R(() => [L(i).modal.value ? (H(), W(_N, Pe(Ks({ key: 0 }, {
				...t.$attrs,
				...L(n)
			})), {
				default: R(() => [B(t.$slots, "default")]),
				_: 3
			}, 16)) : (H(), W(vN, Pe(Ks({ key: 1 }, {
				...t.$attrs,
				...L(n)
			})), {
				default: R(() => [B(t.$slots, "default")]),
				_: 3
			}, 16))]),
			_: 3
		}, 8, ["present"]));
	}
}), bN = /* @__PURE__ */ z({
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
		return (e, n) => (H(), W(L(AA), Pe(zs(t)), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), [xN, SN] = /*#__PURE__*/ SO("PopoverRoot"), CN = /* @__PURE__ */ z({
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
		let n = e, r = t, { modal: i } = /* @__PURE__ */ Pn(n), a = QO(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		});
		return SN({
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
			triggerElement: /* @__PURE__ */ I(),
			hasCustomAnchor: /* @__PURE__ */ I(!1)
		}), (e, t) => (H(), W(L(zA), null, {
			default: R(() => [B(e.$slots, "default", {
				open: L(a),
				close: () => a.value = !1
			})]),
			_: 3
		}));
	}
}), wN = /* @__PURE__ */ z({
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
		let n = e, r = t, i = wk(zO(n, "trapFocus", "disableOutsidePointerEvents")), { forwardRef: a } = Ck(), o = xN();
		return bk(), (t, n) => (H(), W(L(vA), {
			"as-child": "",
			loop: "",
			trapped: e.trapFocus,
			onMountAutoFocus: n[5] ||= (e) => r("openAutoFocus", e),
			onUnmountAutoFocus: n[6] ||= (e) => r("closeAutoFocus", e)
		}, {
			default: R(() => [K(L(rA), {
				"as-child": "",
				"disable-outside-pointer-events": e.disableOutsidePointerEvents,
				onPointerDownOutside: n[0] ||= (e) => r("pointerDownOutside", e),
				onInteractOutside: n[1] ||= (e) => r("interactOutside", e),
				onEscapeKeyDown: n[2] ||= (e) => r("escapeKeyDown", e),
				onFocusOutside: n[3] ||= (e) => r("focusOutside", e),
				onDismiss: n[4] ||= (e) => L(o).onOpenChange(!1)
			}, {
				default: R(() => [K(L(ZM), Ks(L(i), {
					id: L(o).contentId,
					ref: L(a),
					"data-state": L(o).open.value ? "open" : "closed",
					"aria-labelledby": L(o).triggerId,
					style: {
						"--reka-popover-content-transform-origin": "var(--reka-popper-transform-origin)",
						"--reka-popover-content-available-width": "var(--reka-popper-available-width)",
						"--reka-popover-content-available-height": "var(--reka-popper-available-height)",
						"--reka-popover-trigger-width": "var(--reka-popper-anchor-width)",
						"--reka-popover-trigger-height": "var(--reka-popper-anchor-height)"
					},
					role: "dialog"
				}), {
					default: R(() => [B(t.$slots, "default")]),
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
}), TN = /* @__PURE__ */ z({
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
		let n = e, r = t, i = xN(), a = /* @__PURE__ */ I(!1);
		mk(!0);
		let o = Tk(n, r), { forwardRef: s, currentElement: c } = Ck();
		return Fk(c), (e, t) => (H(), W(wN, Ks(L(o), {
			ref: L(s),
			"trap-focus": L(i).open.value,
			"disable-outside-pointer-events": "",
			onCloseAutoFocus: t[0] ||= ku((e) => {
				r("closeAutoFocus", e), a.value || L(i).triggerElement.value?.focus();
			}, ["prevent"]),
			onPointerDownOutside: t[1] ||= (e) => {
				r("pointerDownOutside", e);
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, i = t.button === 2 || n;
				a.value = i;
			},
			onFocusOutside: t[2] ||= ku(() => {}, ["prevent"])
		}), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16, ["trap-focus"]));
	}
}), EN = /* @__PURE__ */ z({
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
		let n = e, r = t, i = xN(), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(!1), s = Tk(n, r);
		return (e, t) => (H(), W(wN, Ks(L(s), {
			"trap-focus": !1,
			"disable-outside-pointer-events": !1,
			onCloseAutoFocus: t[0] ||= (e) => {
				r("closeAutoFocus", e), e.defaultPrevented || (a.value || L(i).triggerElement.value?.focus(), e.preventDefault()), a.value = !1, o.value = !1;
			},
			onInteractOutside: t[1] ||= async (e) => {
				r("interactOutside", e), e.defaultPrevented || (a.value = !0, e.detail.originalEvent.type === "pointerdown" && (o.value = !0));
				let t = e.target;
				L(i).triggerElement.value?.contains(t) && e.preventDefault(), e.detail.originalEvent.type === "focusin" && o.value && e.preventDefault();
			}
		}), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), DN = /* @__PURE__ */ z({
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
		let n = e, r = t, i = xN(), a = Tk(n, r), { forwardRef: o } = Ck();
		return i.contentId ||= Lk(void 0, "reka-popover-content"), (t, n) => (H(), W(L(Gk), { present: e.forceMount || L(i).open.value }, {
			default: R(() => [L(i).modal.value ? (H(), W(TN, Ks({ key: 0 }, L(a), { ref: L(o) }), {
				default: R(() => [B(t.$slots, "default")]),
				_: 3
			}, 16)) : (H(), W(EN, Ks({ key: 1 }, L(a), { ref: L(o) }), {
				default: R(() => [B(t.$slots, "default")]),
				_: 3
			}, 16))]),
			_: 3
		}, 8, ["present"]));
	}
}), ON = /* @__PURE__ */ z({
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
		return (e, n) => (H(), W(L(AA), Pe(zs(t)), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), kN = /* @__PURE__ */ z({
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
		let t = e, n = xN(), { forwardRef: r, currentElement: i } = Ck();
		return n.triggerId ||= Lk(void 0, "reka-popover-trigger"), n.contentId ||= Lk(void 0, "reka-popover-content"), ma(() => {
			n.triggerElement.value = i.value;
		}), (i, a) => (H(), W(Da(L(n).hasCustomAnchor.value ? L(Jk) : L(BA)), { "as-child": "" }, {
			default: R(() => [K(L(Jk), {
				id: L(n).triggerId,
				ref: L(r),
				type: e.as === "button" ? "button" : void 0,
				"aria-haspopup": "dialog",
				"aria-expanded": L(n).open.value,
				"aria-controls": L(n).open.value ? L(n).contentId : void 0,
				"data-state": L(n).open.value ? "open" : "closed",
				as: e.as,
				"as-child": t.asChild,
				onClick: L(n).onOpenToggle
			}, {
				default: R(() => [B(i.$slots, "default")]),
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
}), [AN, jN] = /*#__PURE__*/ SO("DropdownMenuRoot"), MN = /* @__PURE__ */ z({
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
		Ck();
		let i = QO(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), a = /* @__PURE__ */ I(), { modal: o, dir: s } = /* @__PURE__ */ Pn(n), c = _k(s);
		return jN({
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
		}), (e, t) => (H(), W(L(dN), {
			open: L(i),
			"onUpdate:open": t[0] ||= (e) => /* @__PURE__ */ wn(i) ? i.value = e : null,
			dir: L(c),
			modal: L(o)
		}, {
			default: R(() => [B(e.$slots, "default", { open: L(i) })]),
			_: 3
		}, 8, [
			"open",
			"dir",
			"modal"
		]));
	}
}), NN = /* @__PURE__ */ z({
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
		let n = Tk(e, t);
		Ck();
		let r = AN(), i = /* @__PURE__ */ I(!1);
		function a(e) {
			e.defaultPrevented || (i.value || setTimeout(() => {
				r.triggerElement.value?.focus();
			}, 0), i.value = !1, e.preventDefault());
		}
		return r.contentId ||= Lk(void 0, "reka-dropdown-menu-content"), (e, t) => (H(), W(L(yN), Ks({
			id: L(r).contentId,
			"aria-labelledby": L(r)?.triggerId,
			style: {
				"--reka-dropdown-menu-content-transform-origin": "var(--reka-popper-transform-origin)",
				"--reka-dropdown-menu-content-available-width": "var(--reka-popper-available-width)",
				"--reka-dropdown-menu-content-available-height": "var(--reka-popper-available-height)",
				"--reka-dropdown-menu-trigger-width": "var(--reka-popper-anchor-width)",
				"--reka-dropdown-menu-trigger-height": "var(--reka-popper-anchor-height)"
			}
		}, {
			...L(n),
			...L(TA)(e.$attrs)
		}, {
			onCloseAutoFocus: a,
			onInteractOutside: t[0] ||= (e) => {
				if (e.defaultPrevented) return;
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, a = t.button === 2 || n;
				(!L(r).modal.value || a) && (i.value = !0), L(r).triggerElement.value?.contains(e.target) && e.preventDefault();
			}
		}), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16, ["id", "aria-labelledby"]));
	}
}), PN = /* @__PURE__ */ z({
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
		let n = e, r = vk(t);
		return Ck(), (e, t) => (H(), W(L(gN), Pe(zs({
			...n,
			...L(r)
		})), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), FN = /* @__PURE__ */ z({
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
		return (e, n) => (H(), W(L(bN), Pe(zs(t)), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), IN = /* @__PURE__ */ z({
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
		let t = e, n = AN(), { forwardRef: r, currentElement: i } = Ck();
		return ma(() => {
			n.triggerElement = i;
		}), n.triggerId ||= Lk(void 0, "reka-dropdown-menu-trigger"), (i, a) => (H(), W(L(iN), { "as-child": "" }, {
			default: R(() => [K(L(Jk), {
				id: L(n).triggerId,
				ref: L(r),
				type: e.as === "button" ? "button" : void 0,
				"as-child": t.asChild,
				as: e.as,
				"aria-haspopup": "menu",
				"aria-expanded": L(n).open.value,
				"aria-controls": L(n).open.value ? L(n).contentId : void 0,
				"data-disabled": e.disabled ? "" : void 0,
				disabled: e.disabled,
				"data-state": L(n).open.value ? "open" : "closed",
				onClick: a[0] ||= async (t) => {
					t.defaultPrevented || !e.disabled && t.button === 0 && t.ctrlKey === !1 && (L(n)?.onOpenToggle(), await pr(), L(n).open.value && t.preventDefault());
				},
				onKeydown: a[1] ||= ju((t) => {
					e.disabled || t.defaultPrevented || (["Enter", " "].includes(t.key) && L(n).onOpenToggle(), t.key === "ArrowDown" && L(n).onOpenChange(!0), [
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
				default: R(() => [B(i.$slots, "default")]),
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
}), LN = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], RN = [" ", "Enter"];
function zN(e, t, n) {
	return e === void 0 ? !1 : Array.isArray(e) ? e.some((e) => BN(e, t, n)) : BN(e, t, n);
}
function BN(e, t, n) {
	return e === void 0 || t === void 0 ? !1 : typeof e == "string" ? e === t : typeof n == "function" ? n(e, t) : typeof n == "string" ? e?.[n] === t?.[n] : bO(e, t);
}
function VN(e) {
	return e == null || e === "" || Array.isArray(e) && e.length === 0;
}
// node_modules/reka-ui/dist/Select/SelectRoot.js
var HN = ["value"], [UN, WN] = /*#__PURE__*/ SO("SelectRoot"), GN = /* @__PURE__ */ z({
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
		let n = e, r = t, { multiple: i, dir: a } = /* @__PURE__ */ Pn(n), o = nN(null), s = J(() => n.name ?? o?.name.value), c = J(() => o ? n.required || o.required.value : n.required), l = J(() => !!(n.disabled || o?.disabled.value)), u = QO(n, "modelValue", r, {
			defaultValue: n.defaultValue ?? (i.value ? [] : void 0),
			passive: n.modelValue === void 0,
			deep: !0
		}), d = QO(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), f = /* @__PURE__ */ I(), p = /* @__PURE__ */ I(), m = /* @__PURE__ */ I({
			x: 0,
			y: 0
		}), h = J(() => i.value && Array.isArray(u.value) ? u.value?.length === 0 : TO(u.value));
		Ur(u, () => {
			o?.reportControlState({ filled: !h.value });
		}), MA({ isProvider: !0 });
		let g = _k(a), _ = Sk(f), v = /* @__PURE__ */ I(/* @__PURE__ */ new Set()), y = J(() => Array.from(v.value).map((e) => e.value).join(";"));
		function b(e) {
			let t;
			if (i.value) {
				let r = Array.isArray(u.value) ? [...u.value] : [], i = r.findIndex((t) => BN(t, e, n.by));
				i === -1 ? r.push(e) : r.splice(i, 1), t = [...r];
			} else t = e;
			u.value = t, o?.handleControlInput({ value: t });
		}
		function x(e) {
			return Array.from(v.value).find((t) => zN(e, t.value, n.by));
		}
		return WN({
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
		}), (t, n) => (H(), W(L(zA), null, {
			default: R(() => [B(t.$slots, "default", {
				modelValue: L(u),
				open: L(d)
			}), L(_) && s.value ? (H(), W(KN, {
				key: y.value,
				"aria-hidden": "true",
				tabindex: "-1",
				multiple: L(i),
				required: c.value,
				name: s.value,
				autocomplete: e.autocomplete,
				disabled: l.value,
				value: L(u)
			}, {
				default: R(() => [L(TO)(L(u)) ? (H(), U("option", {
					key: 0,
					value: e.nullableValue
				}, null, 8, HN)) : q("v-if", !0), (H(!0), U(V, null, ja(Array.from(v.value), (e) => (H(), U("option", Ks({ key: e.value ?? "" }, { ref_for: !0 }, e), null, 16))), 128))]),
				_: 1
			}, 8, [
				"multiple",
				"required",
				"name",
				"autocomplete",
				"disabled",
				"value"
			])) : q("v-if", !0)]),
			_: 3
		}));
	}
}), KN = /* @__PURE__ */ z({
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
		let t = e, n = /* @__PURE__ */ I(), r = UN();
		Ur(() => t.value, (e, t) => {
			let r = window.HTMLSelectElement.prototype, i = Object.getOwnPropertyDescriptor(r, "value").set;
			if (e !== t && i && n.value) {
				let t = new Event("change", { bubbles: !0 });
				i.call(n.value, e), n.value.dispatchEvent(t);
			}
		});
		function i(e) {
			r.onValueChange(e.target.value);
		}
		return (e, r) => (H(), W(L(NA), { "as-child": "" }, {
			default: R(() => [G("select", Ks({
				ref_key: "selectElement",
				ref: n
			}, t, { onInput: i }), [B(e.$slots, "default")], 16)]),
			_: 3
		}));
	}
}), qN = /* @__PURE__ */ z({
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
		let t = wk(e);
		return (e, n) => (H(), W(L(ZM), Ks(L(t), { style: {
			boxSizing: "border-box",
			"--reka-select-content-transform-origin": "var(--reka-popper-transform-origin)",
			"--reka-select-content-available-width": "var(--reka-popper-available-width)",
			"--reka-select-content-available-height": "var(--reka-popper-available-height)",
			"--reka-select-trigger-width": "var(--reka-popper-anchor-width)",
			"--reka-select-trigger-height": "var(--reka-popper-anchor-height)"
		} }), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), JN = {
	onViewportChange: () => {},
	itemTextRefCallback: () => {},
	itemRefCallback: () => {}
}, [YN, XN] = /*#__PURE__*/ SO("SelectContent"), ZN = /* @__PURE__ */ z({
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
		let n = e, r = t, i = UN();
		bk(), mk(n.bodyLock);
		let { CollectionSlot: a, getItems: o } = MA(), s = /* @__PURE__ */ I();
		Fk(s);
		let { search: c, handleTypeaheadSearch: l } = Bk(), u = /* @__PURE__ */ I(), d = /* @__PURE__ */ I(), f = /* @__PURE__ */ I(), p = /* @__PURE__ */ I(!1), m = /* @__PURE__ */ I(!1), h = /* @__PURE__ */ I(!1);
		function g() {
			d.value && s.value && EA([d.value, s.value]);
		}
		Ur(p, () => {
			g();
		});
		let { onOpenChange: _, triggerPointerDownPosRef: v } = i;
		Br((e) => {
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
					t = n.loop ? Vk(t, i + 1) : t.slice(i + 1);
				}
				setTimeout(() => EA(t)), e.preventDefault();
			}
		}
		let b = zO(n, "loop"), x = wk(J(() => n.position === "popper" ? b : {}).value);
		return XN({
			content: s,
			viewport: u,
			onViewportChange: (e) => {
				u.value = e;
			},
			itemRefCallback: (e, t, n) => {
				let r = !m.value && !n, a = zN(i.modelValue.value, t, i.by);
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
				(zN(i.modelValue.value, t, i.by) || r) && (f.value = e);
			},
			focusSelectedItem: g,
			position: n.position,
			isPositioned: p,
			searchRef: c
		}), (t, n) => (H(), W(L(a), null, {
			default: R(() => [K(L(vA), {
				"as-child": "",
				onMountAutoFocus: n[6] ||= ku(() => {}, ["prevent"]),
				onUnmountAutoFocus: n[7] ||= (e) => {
					r("closeAutoFocus", e), !e.defaultPrevented && (L(i).triggerElement.value?.focus({ preventScroll: !0 }), e.preventDefault());
				}
			}, {
				default: R(() => [K(L(rA), {
					"as-child": "",
					"disable-outside-pointer-events": e.disableOutsidePointerEvents,
					onFocusOutside: n[2] ||= ku(() => {}, ["prevent"]),
					onDismiss: n[3] ||= (e) => L(i).onOpenChange(!1),
					onEscapeKeyDown: n[4] ||= (e) => r("escapeKeyDown", e),
					onPointerDownOutside: n[5] ||= (e) => r("pointerDownOutside", e)
				}, {
					default: R(() => [(H(), W(Da(e.position === "popper" ? qN : eP), Ks({
						...t.$attrs,
						...L(x)
					}, {
						id: L(i).contentId,
						ref: (e) => {
							if (!e) return;
							let t = L(WO)(e);
							t?.hasAttribute("data-reka-popper-content-wrapper") ? s.value = t.firstElementChild : s.value = t;
						},
						role: "listbox",
						"data-state": L(i).open.value ? "open" : "closed",
						dir: L(i).dir.value,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none"
						},
						onContextmenu: n[0] ||= ku(() => {}, ["prevent"]),
						onPlaced: n[1] ||= (e) => p.value = !0,
						onKeydown: y
					}), {
						default: R(() => [B(t.$slots, "default")]),
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
}), [QN, $N] = /*#__PURE__*/ SO("SelectItemAlignedPosition"), eP = /* @__PURE__ */ z({
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
		let n = e, r = t, { getItems: i } = MA(), a = UN(), o = YN(), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(!0), l = /* @__PURE__ */ I(), { forwardRef: u, currentElement: d } = Ck(), { viewport: f, selectedItem: p, selectedItemText: m, focusSelectedItem: h } = o;
		function g() {
			if (a.triggerElement.value && a.valueElement.value && l.value && d.value && f?.value && p?.value && m?.value) {
				let e = a.triggerElement.value.getBoundingClientRect(), t = d.value.getBoundingClientRect(), n = a.valueElement.value.getBoundingClientRect(), o = m.value.getBoundingClientRect();
				if (a.dir.value !== "rtl") {
					let r = o.left - t.left, i = n.left - r, a = e.left - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = xO(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.left = `${d}px`;
				} else {
					let r = t.right - o.right, i = window.innerWidth - n.right - r, a = window.innerWidth - e.right - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = xO(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.right = `${d}px`;
				}
				let c = i().map((e) => e.ref), u = window.innerHeight - 20, h = f.value.scrollHeight, g = window.getComputedStyle(d.value), _ = Number.parseInt(g.borderTopWidth, 10), v = Number.parseInt(g.paddingTop, 10), y = Number.parseInt(g.borderBottomWidth, 10), b = Number.parseInt(g.paddingBottom, 10), x = _ + v + h + b + y, S = Math.min(p.value.offsetHeight * 5, x), C = window.getComputedStyle(f.value), w = Number.parseInt(C.paddingTop, 10), T = Number.parseInt(C.paddingBottom, 10), ee = e.top + e.height / 2 - 10, E = u - ee, D = p.value.offsetHeight / 2, O = p.value.offsetTop + D, te = _ + v + O, ne = x - te;
				if (te <= ee) {
					let e = p.value === c.at(-1);
					l.value.style.bottom = "0px";
					let t = d.value.clientHeight - f.value.offsetTop - f.value.offsetHeight, n = te + Math.max(E, D + (e ? T : 0) + t + y);
					l.value.style.height = `${n}px`;
				} else {
					let e = p.value === c[0];
					l.value.style.top = "0px";
					let t = Math.max(ee, _ + f.value.offsetTop + (e ? w : 0) + D) + ne;
					l.value.style.height = `${t}px`, f.value.scrollTop = te - ee + f.value.offsetTop;
				}
				l.value.style.margin = "10px 0", l.value.style.minHeight = `${S}px`, l.value.style.maxHeight = `${u}px`, r("placed"), requestAnimationFrame(() => s.value = !0);
			}
		}
		let _ = /* @__PURE__ */ I("");
		ma(async () => {
			await pr(), g(), d.value && (_.value = window.getComputedStyle(d.value).zIndex);
		});
		function v(e) {
			e && c.value === !0 && (g(), h?.(), c.value = !1);
		}
		return ZO(a.triggerElement, () => {
			g();
		}), $N({
			contentWrapper: l,
			shouldExpandOnScrollRef: s,
			onScrollButtonChange: v
		}), (e, t) => (H(), U("div", {
			ref_key: "contentWrapperElement",
			ref: l,
			style: Oe({
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: _.value
			})
		}, [K(L(Jk), Ks({
			ref: L(u),
			style: {
				boxSizing: "border-box",
				maxHeight: "100%"
			}
		}, {
			...e.$attrs,
			...n
		}), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16)], 4));
	}
}), tP = /* @__PURE__ */ z({
	inheritAttrs: !1,
	__name: "SelectProvider",
	props: { context: {
		type: Object,
		required: !0
	} },
	setup(e) {
		return WN(e.context), XN(JN), (e, t) => B(e.$slots, "default");
	}
}), nP = { key: 1 }, rP = /* @__PURE__ */ z({
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
		let n = e, r = Tk(n, t), i = UN(), a = /* @__PURE__ */ I();
		ma(() => {
			a.value = new DocumentFragment();
		});
		let o = /* @__PURE__ */ I(), s = J(() => n.forceMount || i.open.value), c = /* @__PURE__ */ I(s.value), l;
		function u() {
			l &&= (clearTimeout(l), void 0);
		}
		return Ur(s, (e, t, n) => {
			u(), l = setTimeout(() => {
				c.value = s.value, l = void 0;
			}), n(u);
		}), va(u), (e, t) => s.value || c.value || o.value?.present ? (H(), W(L(Gk), {
			key: 0,
			ref_key: "presenceRef",
			ref: o,
			present: s.value
		}, {
			default: R(() => [K(ZN, Pe(zs({
				...L(r),
				...e.$attrs
			})), {
				default: R(() => [B(e.$slots, "default")]),
				_: 3
			}, 16)]),
			_: 3
		}, 8, ["present"])) : a.value ? (H(), U("div", nP, [(H(), W(ii, { to: a.value }, [K(tP, { context: L(i) }, {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 8, ["context"])], 8, ["to"]))])) : q("v-if", !0);
	}
}), [iP, aP] = /*#__PURE__*/ SO("SelectItem"), oP = /* @__PURE__ */ z({
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
		let n = e, r = t, { disabled: i } = /* @__PURE__ */ Pn(n), a = UN(), o = YN(), { forwardRef: s, currentElement: c } = Ck(), { CollectionItem: l } = MA(), u = J(() => zN(a.modelValue?.value, n.value, a.by)), d = /* @__PURE__ */ I(!1), f = /* @__PURE__ */ I(n.textValue ?? ""), p = Lk(void 0, "reka-select-item-text");
		async function m(e) {
			e.defaultPrevented || wO("select.select", h, {
				originalEvent: e,
				value: n.value
			});
		}
		async function h(e) {
			await pr(), r("select", e), e.defaultPrevented || i.value || (a.onValueChange(n.value), a.multiple.value || a.onOpenChange(!1));
		}
		async function g(e) {
			await pr(), !e.defaultPrevented && (i.value ? o.onItemLeave?.() : e.currentTarget?.focus({ preventScroll: !0 }));
		}
		async function _(e) {
			await pr(), !e.defaultPrevented && e.currentTarget === CO() && o.onItemLeave?.();
		}
		async function v(e) {
			await pr(), e.defaultPrevented || o.searchRef?.value !== "" && e.key === " " || (RN.includes(e.key) && m(e), e.key === " " && e.preventDefault());
		}
		if (n.value === "") throw Error("A <SelectItem /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
		return ma(() => {
			c.value && o.itemRefCallback(c.value, n.value, n.disabled);
		}), aP({
			value: n.value,
			disabled: i,
			textId: p,
			isSelected: u,
			onItemTextChange: (e) => {
				f.value = ((f.value || e?.textContent) ?? "").trim();
			}
		}), (t, n) => (H(), W(L(l), { value: { textValue: f.value } }, {
			default: R(() => [K(L(Jk), {
				ref: L(s),
				role: "option",
				"aria-labelledby": L(p),
				"data-highlighted": d.value ? "" : void 0,
				"aria-selected": u.value,
				"data-state": u.value ? "checked" : "unchecked",
				"aria-disabled": L(i) || void 0,
				"data-disabled": L(i) ? "" : void 0,
				tabindex: L(i) ? void 0 : -1,
				as: e.as,
				"as-child": e.asChild,
				onFocus: n[0] ||= (e) => d.value = !0,
				onBlur: n[1] ||= (e) => d.value = !1,
				onPointerup: m,
				onPointerdown: n[2] ||= (e) => {
					e.currentTarget.focus({ preventScroll: !0 });
				},
				onTouchend: n[3] ||= ku(() => {}, ["prevent", "stop"]),
				onPointermove: g,
				onPointerleave: _,
				onKeydown: v
			}, {
				default: R(() => [B(t.$slots, "default", { selected: u.value })]),
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
}), sP = /* @__PURE__ */ z({
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
		let t = e, n = UN(), r = YN(), i = iP(), { forwardRef: a, currentElement: o } = Ck(), s = J(() => ({
			value: i.value,
			disabled: i.disabled.value,
			textContent: o.value?.textContent ?? i.value?.toString() ?? ""
		}));
		return ma(() => {
			o.value && (i.onItemTextChange(o.value), r.itemTextRefCallback(o.value, i.value, i.disabled.value), n.onOptionAdd(s.value));
		}), va(() => {
			n.onOptionRemove(s.value);
		}), (e, n) => (H(), W(L(Jk), Ks({
			id: L(i).textId,
			ref: L(a)
		}, {
			...t,
			...e.$attrs
		}), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16, ["id"]));
	}
}), cP = /* @__PURE__ */ z({
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
		return (e, n) => (H(), W(L(AA), Pe(zs(t)), {
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), lP = /* @__PURE__ */ z({
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
		let t = e, n = UN(), { forwardRef: r, currentElement: i } = Ck(), a = J(() => n.disabled?.value || t.disabled);
		n.contentId ||= Lk(void 0, "reka-select-content"), ma(() => {
			n.onTriggerChange(i.value);
		});
		let o = nN(null), s = Ja();
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
		ma(() => {
			f = o?.registerControl({
				id: c,
				element: () => i.value,
				getValue: () => n.modelValue.value,
				required: () => !!n.required?.value
			});
		}), _a(() => f?.());
		let { getItems: p } = MA(), { search: m, handleTypeaheadSearch: h, resetTypeahead: g } = Bk();
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
			!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && h(e.key, p()), !(t && e.key === " ") && LN.includes(e.key) && (_(), e.preventDefault());
		}
		return (t, i) => (H(), W(L(BA), {
			"as-child": "",
			reference: e.reference
		}, {
			default: R(() => [K(L(Jk), Ks(l(), {
				ref: L(r),
				role: "combobox",
				type: e.as === "button" ? "button" : void 0,
				"aria-controls": L(n).open.value ? L(n).contentId : void 0,
				"aria-expanded": L(n).open.value || !1,
				"aria-required": L(n).required?.value,
				"aria-autocomplete": "none",
				disabled: a.value,
				dir: L(n)?.dir.value,
				"data-state": L(n)?.open.value ? "open" : "closed",
				"data-disabled": a.value ? "" : void 0,
				"data-placeholder": L(VN)(L(n).modelValue?.value) ? "" : void 0,
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
				default: R(() => [B(t.$slots, "default")]),
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
}), uP = /* @__PURE__ */ z({
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
		let t = e, { forwardRef: n, currentElement: r } = Ck(), i = UN();
		ma(() => {
			i.valueElement = r;
		});
		let a = J(() => {
			let e = [], t = Array.from(i.optionsSet.value), n = (e) => t.find((t) => zN(e, t.value, i.by));
			return e = Array.isArray(i.modelValue.value) ? i.modelValue.value.map((e) => n(e)?.textContent ?? "") : [n(i.modelValue.value)?.textContent ?? ""], e.filter(Boolean);
		}), o = J(() => a.value.length ? a.value.join(", ") : t.placeholder);
		return (r, s) => (H(), W(L(Jk), {
			ref: L(n),
			as: e.as,
			"as-child": e.asChild,
			style: { pointerEvents: "none" },
			"data-placeholder": a.value.length ? void 0 : t.placeholder
		}, {
			default: R(() => [B(r.$slots, "default", {
				selectedLabel: a.value,
				modelValue: L(i).modelValue.value
			}, () => [Vs(M(o.value), 1)])]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"data-placeholder"
		]));
	}
}), dP = /* @__PURE__ */ z({
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
		let t = e, { nonce: n } = /* @__PURE__ */ Pn(t), r = QM(n), i = YN(), a = i.position === "item-aligned" ? QN() : void 0, { forwardRef: o, currentElement: s } = Ck();
		ma(() => {
			i?.onViewportChange(s.value);
		});
		let c = /* @__PURE__ */ I(0);
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
		return (e, n) => (H(), U(V, null, [K(L(Jk), Ks({
			ref: L(o),
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
			default: R(() => [B(e.$slots, "default")]),
			_: 3
		}, 16), K(L(Jk), {
			as: "style",
			nonce: L(r)
		}, {
			default: R(() => [...n[0] ||= [Vs(" /* Hide scrollbars cross-browser and enable momentum scroll for touch devices */ [data-reka-select-viewport] { scrollbar-width:none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; } [data-reka-select-viewport]::-webkit-scrollbar { display: none; } ", -1)]]),
			_: 1
		}, 8, ["nonce"])], 64));
	}
}), fP = ["maxlength"], pP = { class: "trpg-confirm__actions" }, mP = ["disabled"], hP = /* @__PURE__ */ z({
	__name: "BranchPopover",
	props: {
		defaultName: {},
		disabled: { type: Boolean }
	},
	emits: ["create"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = Ir("portalTarget", void 0), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(null);
		async function c(e) {
			a.value = e, e && (o.value = n.defaultName, await pr(), s.value?.focus(), s.value?.select());
		}
		function l() {
			let e = o.value.trim();
			e && (a.value = !1, r("create", e));
		}
		return (t, n) => (H(), W(L(CN), {
			open: a.value,
			"onUpdate:open": c
		}, {
			default: R(() => [K(L(kN), {
				class: "trpg-btn",
				disabled: e.disabled
			}, {
				default: R(() => [...n[4] ||= [Vs("分支存档", -1)]]),
				_: 1
			}, 8, ["disabled"]), K(L(ON), { to: L(i) }, {
				default: R(() => [K(L(DN), {
					class: "trpg-popover",
					align: "start",
					"side-offset": 6,
					"collision-padding": 8,
					onOpenAutoFocus: n[3] ||= ku(() => {}, ["prevent"])
				}, {
					default: R(() => [G("form", {
						class: "trpg-field",
						onSubmit: ku(l, ["prevent"])
					}, [
						n[5] ||= G("label", {
							class: "trpg-field__label",
							for: "trpg-branch-name"
						}, "新存档名", -1),
						Nr(G("input", {
							id: "trpg-branch-name",
							ref_key: "input",
							ref: s,
							"onUpdate:modelValue": n[0] ||= (e) => o.value = e,
							class: "trpg-input",
							maxlength: L(40),
							autocomplete: "off",
							onKeydown: n[1] ||= ju(ku((e) => a.value = !1, ["stop", "prevent"]), ["esc"])
						}, null, 40, fP), [[mu, o.value]]),
						n[6] ||= G("span", { class: "trpg-field__hint" }, "原存档保持上次保存的样子；当前未保存的改动会进入新分支。", -1),
						G("div", pP, [G("button", {
							class: "trpg-btn",
							type: "button",
							onClick: n[2] ||= (e) => a.value = !1
						}, "取消"), G("button", {
							class: "trpg-btn trpg-btn--primary",
							type: "submit",
							disabled: !o.value.trim()
						}, "创建并切换", 8, mP)])
					], 32)]),
					_: 1
				})]),
				_: 1
			}, 8, ["to"])]),
			_: 1
		}, 8, ["open"]));
	}
}), gP = {
	key: 0,
	class: "trpg-menu__reason"
}, _P = /* @__PURE__ */ z({
	__name: "MoreMenu",
	props: {
		label: {},
		items: {}
	},
	emits: ["select"],
	setup(e) {
		let t = Ir("portalTarget", void 0);
		return (n, r) => (H(), W(L(MN), null, {
			default: R(() => [K(L(IN), {
				class: "trpg-icon-btn trpg-more",
				"aria-label": `${e.label} 的更多操作`
			}, {
				default: R(() => [K(OT, {
					name: "dots-three",
					size: 20
				})]),
				_: 1
			}, 8, ["aria-label"]), K(L(FN), { to: L(t) }, {
				default: R(() => [K(L(NN), {
					class: "trpg-menu",
					align: "end",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: R(() => [(H(!0), U(V, null, ja(e.items, (e) => (H(), W(L(PN), {
						key: e.key,
						class: Ne(["trpg-menu__item", { "trpg-menu__item--danger": e.danger }]),
						disabled: e.disabled,
						onSelect: (t) => n.$emit("select", e.key)
					}, {
						default: R(() => [G("span", null, M(e.label), 1), e.disabled && e.reason ? (H(), U("span", gP, M(e.reason), 1)) : q("", !0)]),
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
}), vP = {
	key: 0,
	class: "trpg-folds"
}, yP = {
	class: "trpg-folds__tabs",
	role: "group",
	"aria-label": "更多存档"
}, bP = ["aria-expanded"], xP = ["aria-expanded"], SP = ["aria-expanded"], CP = {
	key: 0,
	class: "trpg-list"
}, wP = { class: "trpg-row__main" }, TP = { class: "trpg-row__title" }, EP = {
	key: 0,
	class: "trpg-row__meta"
}, DP = { class: "trpg-row__end" }, OP = ["disabled", "onClick"], kP = { class: "trpg-list" }, AP = { class: "trpg-row__main" }, jP = { class: "trpg-row__title" }, MP = { class: "trpg-row__meta" }, NP = { class: "trpg-row__end" }, PP = ["disabled", "onClick"], FP = ["disabled", "onClick"], IP = ["disabled"], LP = {
	key: 2,
	class: "trpg-list"
}, RP = { class: "trpg-row__main" }, zP = { class: "trpg-row__title" }, BP = { class: "trpg-badge" }, VP = { class: "trpg-row__meta" }, HP = { class: "trpg-row__end" }, UP = [
	"disabled",
	"title",
	"onClick"
], WP = /* @__PURE__ */ z({
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
		let n = t, r = /* @__PURE__ */ I(null), i = (e) => r.value = r.value === e ? null : e;
		return (t, a) => e.autos.length || e.deleted.length || e.others.length ? (H(), U("div", vP, [
			G("div", yP, [
				e.autos.length ? (H(), U("button", {
					key: 0,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "auto",
					onClick: a[0] ||= (e) => i("auto")
				}, M(r.value === "auto" ? "▾" : "▸") + " 自动存档 " + M(e.autos.length), 9, bP)) : q("", !0),
				e.deleted.length ? (H(), U("button", {
					key: 1,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "deleted",
					onClick: a[1] ||= (e) => i("deleted")
				}, M(r.value === "deleted" ? "▾" : "▸") + " 最近删除 " + M(e.deleted.length), 9, xP)) : q("", !0),
				e.others.length ? (H(), U("button", {
					key: 2,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "other",
					onClick: a[2] ||= (e) => i("other")
				}, M(r.value === "other" ? "▾" : "▸") + " 其他规则 " + M(e.others.length), 9, SP)) : q("", !0)
			]),
			r.value === "auto" ? (H(), U("ul", CP, [(H(!0), U(V, null, ja(e.autos, (t) => (H(), U("li", {
				key: t.id,
				class: "trpg-row"
			}, [G("div", wP, [G("div", TP, M(L(EE)(t.createdAt)) + " · " + M(t.autoReason), 1), L(kE)(t) ? (H(), U("div", EP, M(L(kE)(t)), 1)) : q("", !0)]), G("div", DP, [G("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("load", t)
			}, "读取", 8, OP), K(_P, {
				label: `自动存档 ${L(EE)(t.createdAt)}`,
				items: [{
					key: "manual",
					label: "另存为存档"
				}],
				onSelect: (e) => n("auto-as-manual", t)
			}, null, 8, ["label", "onSelect"])])]))), 128))])) : q("", !0),
			r.value === "deleted" ? (H(), U(V, { key: 1 }, [G("ul", kP, [(H(!0), U(V, null, ja(e.deleted, (t) => (H(), U("li", {
				key: t.id,
				class: "trpg-row"
			}, [G("div", AP, [G("div", jP, M(t.name), 1), G("div", MP, "删除于 " + M(L(EE)(t.deletedAt ?? 0)), 1)]), G("div", NP, [G("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("restore", t)
			}, "恢复", 8, PP), G("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("purge", t)
			}, "彻底删除", 8, FP)])]))), 128))]), G("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				disabled: e.readOnly,
				onClick: a[3] ||= (e) => n("purge-all")
			}, "清空最近删除", 8, IP)], 64)) : q("", !0),
			r.value === "other" ? (H(), U("ul", LP, [(H(!0), U(V, null, ja(e.others, (t) => (H(), U("li", {
				key: t.id,
				class: "trpg-row"
			}, [G("div", RP, [G("div", zP, [Vs(M(t.name) + " ", 1), G("span", BP, M(e.ruleName(t.ruleId)), 1)]), G("div", VP, M(t.ownerLabel) + " · " + M(L(EE)(t.updatedAt)), 1)]), G("div", HP, [G("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly || !e.ruleInstalled(t.ruleId),
				title: e.ruleInstalled(t.ruleId) ? void 0 : "规则未安装",
				onClick: (e) => n("load", t)
			}, M(e.ruleInstalled(t.ruleId) ? "切换规则并读取" : "规则未安装"), 9, UP)])]))), 128))])) : q("", !0)
		])) : q("", !0);
	}
}), GP = ["data-current", "data-testid"], KP = { class: "trpg-save__main" }, qP = { class: "trpg-save__top" }, JP = ["maxlength", "onKeydown"], YP = {
	key: 1,
	class: "trpg-save__name"
}, XP = {
	key: 2,
	class: "trpg-badge",
	"data-tone": "gold"
}, ZP = {
	key: 3,
	class: "trpg-badge"
}, QP = { class: "trpg-save__time" }, $P = {
	key: 0,
	class: "trpg-row__meta"
}, eF = {
	key: 1,
	class: "trpg-row__meta trpg-save__note"
}, tF = {
	key: 2,
	class: "trpg-save__noteedit"
}, nF = ["maxlength"], rF = { class: "trpg-save__noteactions" }, iF = { class: "trpg-row__end" }, aF = ["disabled"], oF = /* @__PURE__ */ z({
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
		let n = e, r = t, i = /* @__PURE__ */ I(!1), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(null), l = () => [
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
			e === "rename" ? (a.value = n.save.name, i.value = !0, await pr(), c.value?.focus(), c.value?.select()) : e === "note" ? (s.value = n.save.note, o.value = !0) : e === "export" ? r("export") : e === "remove" && r("remove");
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
		return (t, n) => (H(), U("li", {
			class: "trpg-save",
			"data-current": e.current,
			"data-testid": `save-${e.save.name}`
		}, [G("div", KP, [
			G("div", qP, [
				i.value ? Nr((H(), U("input", {
					key: 0,
					ref_key: "nameInput",
					ref: c,
					"onUpdate:modelValue": n[0] ||= (e) => a.value = e,
					class: "trpg-input trpg-save__rename",
					maxlength: L(40),
					"aria-label": "存档名",
					onKeydown: [ju(ku(d, ["prevent"]), ["enter"]), n[1] ||= ju(ku((e) => i.value = !1, ["stop", "prevent"]), ["esc"])],
					onBlur: d
				}, null, 40, JP)), [[mu, a.value]]) : (H(), U("span", YP, M(e.save.name), 1)),
				e.current ? (H(), U("span", XP, "当前")) : q("", !0),
				e.cardBadge ? (H(), U("span", ZP, M(e.save.ownerLabel), 1)) : q("", !0),
				G("span", QP, M(L(EE)(e.save.updatedAt)), 1)
			]),
			L(kE)(e.save) ? (H(), U("div", $P, M(L(kE)(e.save)), 1)) : q("", !0),
			e.save.note && !o.value ? (H(), U("div", eF, M(e.save.note.split("\n")[0]), 1)) : q("", !0),
			o.value ? (H(), U("div", tF, [Nr(G("textarea", {
				"onUpdate:modelValue": n[2] ||= (e) => s.value = e,
				class: "trpg-input",
				maxlength: L(200),
				"aria-label": "备注",
				rows: "2",
				onKeydown: n[3] ||= ju(ku((e) => o.value = !1, ["stop", "prevent"]), ["esc"])
			}, null, 40, nF), [[mu, s.value]]), G("div", rF, [G("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: n[4] ||= (e) => o.value = !1
			}, "取消"), G("button", {
				class: "trpg-btn trpg-btn--small trpg-btn--primary",
				type: "button",
				onClick: f
			}, "保存")])])) : q("", !0)
		]), G("div", iF, [e.current ? q("", !0) : (H(), U("button", {
			key: 0,
			class: "trpg-btn",
			type: "button",
			disabled: e.readOnly,
			onClick: n[5] ||= (e) => r("load")
		}, "读取", 8, aF)), K(_P, {
			label: e.save.name,
			items: l(),
			onSelect: u
		}, null, 8, ["label", "items"])])], 8, GP));
	}
}), sF = {
	class: "trpg-drawer",
	"data-testid": "save-drawer"
}, cF = {
	key: 0,
	class: "trpg-drawer__current"
}, lF = { class: "trpg-drawer__name" }, uF = { class: "trpg-drawer__title" }, dF = {
	key: 0,
	class: "trpg-badge",
	"data-tone": "warn"
}, fF = { class: "trpg-drawer__buttons" }, pF = ["disabled"], mF = {
	key: 1,
	class: "trpg-drawer__current"
}, hF = { class: "trpg-drawer__filter" }, gF = {
	key: 1,
	class: "trpg-field__hint"
}, _F = {
	key: 0,
	class: "trpg-saves"
}, vF = {
	key: 1,
	class: "trpg-empty"
}, yF = { class: "trpg-group" }, bF = { class: "trpg-saves" }, xF = { class: "trpg-drawer__bottom" }, SF = ["disabled"], CF = ["disabled"], wF = /* @__PURE__ */ z({
	__name: "SaveDrawerPage",
	setup(e) {
		let t = Xw(), n = Qw(), r = jE(), i = vT(), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(null);
		ma(() => void r.refresh().catch((e) => console.error("[trpg-assistant] 读取存档列表失败", e)));
		let s = J(() => n.currentSave), c = J(() => t.services?.rules), l = (e) => c.value?.get(e)?.nameShort ?? e, u = (e) => !!c.value?.has(e), d = J(() => {
			let e = a.value.trim();
			return e ? r.manual.filter((t) => t.name.includes(e) || t.note.includes(e)) : r.manual;
		}), f = J(() => {
			let e = /* @__PURE__ */ new Map();
			for (let t of r.everything) e.set(t.ruleId, [...e.get(t.ruleId) ?? [], t]);
			return [...e];
		});
		async function p(e, t) {
			try {
				return await e();
			} catch (e) {
				console.error(`[trpg-assistant] ${t}`, e), i.error(`${t}：${AE(e)}`);
				return;
			}
		}
		async function m(e) {
			let t = await p(() => n.branch(e), "创建分支失败");
			t && (await r.refresh(), i.success(`已切换到「${t.name}」`));
		}
		async function h(e, t) {
			await p(() => r.remove(e), "删除失败") && i.undoable(`已删除「${t}」`, async () => void await p(() => r.restore(e), "撤销失败"));
		}
		async function g(e, t) {
			await VE({
				title: "彻底删除存档",
				message: `「${t}」将被永久删除，无法恢复。`,
				confirmLabel: "彻底删除",
				danger: !0
			}) && await p(() => r.purge([e]), "删除失败");
		}
		async function _() {
			let e = r.deleted.length;
			await VE({
				title: "清空最近删除",
				message: `最近删除中的 ${e} 个存档将被永久删除，无法恢复。`,
				confirmLabel: "彻底删除",
				danger: !0
			}) && await p(() => r.purge(r.deleted.map((e) => e.id)), "清空失败");
		}
		async function v(e) {
			let t = e.target, n = t.files?.[0];
			t.value = "", n && await mO(n);
		}
		return (e, i) => (H(), U("div", sF, [
			L(n).hasCampaign ? (H(), U("section", cF, [
				G("div", lF, [G("span", uF, M(s.value?.name ?? "当前存档"), 1), L(n).dirty ? (H(), U("span", dF, "● 有未保存改动")) : q("", !0)]),
				G("div", fF, [
					G("button", {
						class: "trpg-btn trpg-btn--primary",
						type: "button",
						disabled: L(n).readOnly || !L(n).dirty,
						onClick: i[0] ||= (e) => L(ZI)()
					}, M(L(n).dirty ? "保存" : "已是最新"), 9, pF),
					K(hP, {
						"default-name": `${s.value?.name ?? "存档"} 分支`,
						disabled: L(n).readOnly,
						onCreate: m
					}, null, 8, ["default-name", "disabled"]),
					s.value ? (H(), U("button", {
						key: 0,
						class: "trpg-btn",
						type: "button",
						onClick: i[1] ||= (e) => L(pO)(s.value.id)
					}, "导出…")) : q("", !0)
				]),
				L(t).reminder ? (H(), U("p", {
					key: 0,
					class: Ne(["trpg-field__hint", { "trpg-warn": L(t).reminder.kind === "due" }])
				}, M(L(t).reminder.text), 3)) : q("", !0)
			])) : (H(), U("section", mF, [...i[11] ||= [G("p", { class: "page-intro" }, "还没有当前战役", -1)]])),
			L(n).hasCampaign ? (H(), U(V, { key: 2 }, [
				G("div", hF, [
					K(jT, {
						"model-value": L(r).scope,
						label: "存档范围",
						options: [{
							value: "card",
							label: "本卡"
						}, {
							value: "all",
							label: "全部"
						}],
						"onUpdate:modelValue": i[2] ||= (e) => L(r).setScope(e)
					}, null, 8, ["model-value"]),
					L(r).manual.length > 8 ? Nr((H(), U("input", {
						key: 0,
						"onUpdate:modelValue": i[3] ||= (e) => a.value = e,
						class: "trpg-input",
						type: "search",
						placeholder: "按存档名或备注搜索",
						"aria-label": "搜索存档"
					}, null, 512)), [[mu, a.value]]) : q("", !0),
					L(r).manual.length > 8 ? (H(), U("span", gF, "共 " + M(d.value.length) + " 个", 1)) : q("", !0)
				]),
				d.value.length ? (H(), U("ul", _F, [(H(!0), U(V, null, ja(d.value, (e) => (H(), W(oF, {
					key: e.id,
					save: e,
					current: e.id === s.value?.id,
					"card-badge": L(r).scope === "all",
					"read-only": L(n).readOnly,
					onLoad: (t) => L(QI)(e),
					onRename: (t) => p(() => L(r).rename(e.id, t), "改名失败"),
					onNote: (t) => p(() => L(r).setNote(e.id, t), "保存备注失败"),
					onExport: (t) => L(pO)(e.id),
					onRemove: (t) => h(e.id, e.name)
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
				]))), 128))])) : L(r).loading ? q("", !0) : (H(), U("div", vF, [G("p", null, M(a.value ? "没有符合的存档" : "这张卡还没有存档"), 1), a.value ? (H(), U("button", {
					key: 0,
					class: "trpg-btn",
					type: "button",
					onClick: i[4] ||= (e) => a.value = ""
				}, "清除搜索")) : (H(), U("button", {
					key: 1,
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: i[5] ||= (e) => L(XI)()
				}, "＋ 新存档"))])),
				K(WP, {
					autos: L(r).autos,
					deleted: L(r).deleted,
					others: L(r).otherRules,
					"read-only": L(n).readOnly,
					"rule-name": l,
					"rule-installed": u,
					onLoad: L(QI),
					onAutoAsManual: i[6] ||= (e) => p(() => L(r).autoAsManual(e.id), "另存失败"),
					onRestore: i[7] ||= (e) => p(() => L(r).restore(e.id), "恢复失败"),
					onPurge: i[8] ||= (e) => g(e.id, e.name),
					onPurgeAll: _
				}, null, 8, [
					"autos",
					"deleted",
					"others",
					"read-only",
					"onLoad"
				])
			], 64)) : (H(!0), U(V, { key: 3 }, ja(f.value, ([e, t]) => (H(), U("div", {
				key: e,
				class: "trpg-group-block"
			}, [G("h3", yF, M(l(e)) + "（" + M(t.length) + "）", 1), G("ul", bF, [(H(!0), U(V, null, ja(t, (e) => (H(), W(oF, {
				key: e.id,
				save: e,
				"card-badge": "",
				onLoad: (t) => L(QI)(e),
				onRename: (t) => p(() => L(r).rename(e.id, t), "改名失败"),
				onNote: (t) => p(() => L(r).setNote(e.id, t), "保存备注失败"),
				onExport: (t) => L(pO)(e.id),
				onRemove: (t) => h(e.id, e.name)
			}, null, 8, [
				"save",
				"onLoad",
				"onRename",
				"onNote",
				"onExport",
				"onRemove"
			]))), 128))])]))), 128)),
			G("footer", xF, [
				L(n).hasCampaign && L(r).manual.length ? (H(), U("button", {
					key: 0,
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					disabled: L(n).readOnly,
					onClick: i[9] ||= (e) => L(XI)()
				}, "＋ 新存档", 8, SF)) : q("", !0),
				G("button", {
					class: "trpg-btn",
					type: "button",
					disabled: L(n).readOnly,
					onClick: i[10] ||= (e) => o.value?.click()
				}, "导入存档文件", 8, CF),
				G("input", {
					ref_key: "picker",
					ref: o,
					class: "trpg-sr-only",
					type: "file",
					accept: ".trpgsave,.trpgpack,.zip",
					tabindex: "-1",
					"aria-hidden": "true",
					onChange: v
				}, null, 544)
			])
		]));
	}
}), TF = { class: "trpg-confirm" }, EF = { class: "trpg-confirm__message" }, DF = { class: "trpg-confirm__actions trpg-confirm__actions--stack" }, OF = /* @__PURE__ */ z({
	__name: "UnsavedLoadPage",
	props: {
		current: {},
		target: {},
		onChoose: { type: Function }
	},
	setup(e) {
		let t = e;
		return (e, n) => (H(), U("div", TF, [
			G("p", EF, "「" + M(t.current) + "」有未保存的改动。读取「" + M(t.target) + "」前：", 1),
			G("div", DF, [
				G("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[0] ||= (e) => t.onChoose("cancel")
				}, "取消"),
				G("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[1] ||= (e) => t.onChoose("discard")
				}, "不保存，直接读取"),
				G("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					"data-autofocus": "",
					onClick: n[2] ||= (e) => t.onChoose("save")
				}, "保存后读取")
			]),
			n[3] ||= G("p", { class: "trpg-field__hint" }, "无论选哪一项，当前状态都会先写入自动存档。", -1)
		]));
	}
}), kF = { adventureImport: !1 };
// src/ui/library/rows.ts
function AF(e, t) {
	let n = t?.packs.find((t) => t.id === e.id);
	return {
		id: e.id,
		name: e.name,
		nameEn: e.nameEn,
		category: e.category,
		ruleId: e.ruleId,
		version: e.version,
		installed: !0,
		source: e.source,
		recommended: n?.recommended ?? !1,
		group: n?.group,
		description: e.description,
		byteSize: e.byteSize,
		entryCount: e.entryCount,
		contributes: e.contributes,
		typeCounts: e.typeCounts,
		requires: e.relationships.requires.map((e) => e.id),
		recommends: e.relationships.recommends.map((e) => e.id),
		conflicts: e.relationships.conflicts,
		series: e.series,
		...n && n.version !== e.version && e.source !== "builtin" && n.version.localeCompare(e.version, void 0, { numeric: !0 }) > 0 ? { updateVersion: n.version } : {}
	};
}
function jF(e, t, n) {
	let r = e.filter((e) => e.ruleId === n).map((e) => AF(e, t)), i = new Set(r.map((e) => e.id));
	for (let e of t?.packs ?? []) e.ruleId !== n || i.has(e.id) || r.push({
		id: e.id,
		name: e.name,
		nameEn: e.nameEn,
		category: e.category,
		ruleId: e.ruleId,
		version: e.version,
		installed: !1,
		source: "catalog",
		recommended: e.recommended,
		group: e.group,
		description: e.description,
		byteSize: e.byteSize,
		entryCount: e.contributes.entries ?? Object.values(e.typeCounts).reduce((e, t) => e + t, 0),
		contributes: e.contributes,
		typeCounts: e.typeCounts,
		requires: e.relationships.requires.map((e) => e.id),
		recommends: e.relationships.recommends.map((e) => e.id),
		conflicts: e.relationships.conflicts,
		series: e.series
	});
	return r;
}
function MF(e) {
	let t = e.contributes, n = t.tables ?? 0;
	return [
		["资料", Math.max(0, (t.entries ?? e.entryCount) - n)],
		["修改版", t.variants ?? 0],
		["冒险", t.adventures ?? 0],
		["随机表", n],
		["规则选项", t.ruleOptions ?? 0]
	].filter(([, e]) => e > 0).map(([e, t]) => `${e} ${t.toLocaleString("zh-CN")}`).join(" · ");
}
var NF = {
	builtin: "内置",
	download: "官方",
	import: "导入",
	user: "我的",
	catalog: ""
};
function PF(e, t, n) {
	let r = t.find((t) => t.id === e)?.ruleId ?? n?.packs.find((t) => t.id === e)?.ruleId;
	return r ? jF(t, n, r).find((t) => t.id === e) : void 0;
}
// src/ui/kit/Term.vue?vue&type=script&setup=true&lang.ts
var FF = ["aria-label"], IF = /* @__PURE__ */ z({
	__name: "Term",
	props: { label: {} },
	emits: ["open"],
	setup(e) {
		return (t, n) => (H(), U("button", {
			class: "trpg-term",
			type: "button",
			"aria-label": e.label,
			"aria-haspopup": "dialog",
			onClick: n[0] ||= ku((e) => t.$emit("open"), ["stop"])
		}, [B(t.$slots, "default")], 8, FF));
	}
}), LF = {
	key: 0,
	class: "page-stack",
	"data-testid": "pack-detail"
}, RF = { class: "trpg-row__meta" }, zF = { class: "trpg-row__meta" }, BF = { key: 0 }, VF = { class: "trpg-detail-links" }, HF = { key: 0 }, UF = { key: 1 }, WF = { key: 2 }, GF = { key: 3 }, KF = {
	key: 1,
	class: "trpg-empty"
}, qF = /* @__PURE__ */ z({
	__name: "PackDetailPage",
	props: { packId: {} },
	setup(e) {
		let t = e, n = gT(), r = Qw(), i = J(() => PF(t.packId, n.installed, n.catalog)), a = (e) => PF(e, n.installed, n.catalog)?.name ?? e, o = (e) => n.installedMap.has(e), s = J(() => {
			let e = r.workspace;
			return !e || !i.value || e.ruleId !== i.value.ruleId ? "" : i.value.installed ? e.enabledPacks.some((e) => e.id === t.packId) ? "本存档：已启用" : "本存档：未启用" : "本存档：未安装";
		}), c = J(() => {
			let e = i.value;
			return e ? [
				NF[e.source],
				`v${e.version}`,
				OE(e.byteSize),
				e.installed ? "已安装" : "未安装"
			].filter(Boolean).join(" · ") : "";
		});
		return (e, t) => i.value ? (H(), U("div", LF, [
			G("div", null, [G("p", RF, M(c.value), 1), G("p", zF, M(L(MF)(i.value)), 1)]),
			i.value.description ? (H(), U("p", BF, M(i.value.description), 1)) : q("", !0),
			G("ul", VF, [
				i.value.requires.length ? (H(), U("li", HF, [t[0] ||= Vs(" 需要： ", -1), (H(!0), U(V, null, ja(i.value.requires, (e, t) => (H(), U(V, { key: e }, [
					t ? (H(), U(V, { key: 0 }, [Vs("、")], 64)) : q("", !0),
					K(IF, { onOpen: (t) => L(JF)(e) }, {
						default: R(() => [Vs(M(a(e)), 1)]),
						_: 2
					}, 1032, ["onOpen"]),
					Vs(" " + M(o(e) ? "✓" : "（未安装）"), 1)
				], 64))), 128))])) : q("", !0),
				i.value.recommends.length ? (H(), U("li", UF, [t[1] ||= Vs(" 推荐： ", -1), (H(!0), U(V, null, ja(i.value.recommends, (e, t) => (H(), U(V, { key: e }, [t ? (H(), U(V, { key: 0 }, [Vs("、")], 64)) : q("", !0), K(IF, { onOpen: (t) => L(JF)(e) }, {
					default: R(() => [Vs(M(a(e)), 1)]),
					_: 2
				}, 1032, ["onOpen"])], 64))), 128))])) : q("", !0),
				i.value.conflicts.length ? (H(), U("li", WF, [t[2] ||= Vs("冲突：", -1), (H(!0), U(V, null, ja(i.value.conflicts, (e, t) => (H(), U(V, { key: e.id }, [t ? (H(), U(V, { key: 0 }, [Vs("、")], 64)) : q("", !0), Vs(M(a(e.id)), 1)], 64))), 128))])) : q("", !0),
				s.value ? (H(), U("li", GF, M(s.value), 1)) : q("", !0)
			])
		])) : (H(), U("p", KF, "没有找到这个扩展包"));
	}
});
// src/ui/library/openDetail.ts
function JF(e) {
	let t = gT(), n = gE(), r = PF(e, t.installed, t.catalog), i = {
		key: `pack:${e}`,
		title: r?.name ?? e,
		component: xn(qF),
		props: { packId: e },
		variant: "dialog"
	};
	n.isOpen ? n.push(i) : n.open(i);
}
// src/ui/wizard/state.ts
var YF = () => ({
	step: 1,
	ruleId: "",
	packIds: [],
	adventureId: "",
	name: "",
	note: "",
	nameEdited: !1,
	packsInit: !1,
	touched: !1
}), $ = /* @__PURE__ */ fn(YF());
function XF() {
	Object.assign($, YF());
}
// src/ui/wizard/StepAdventure.vue?vue&type=script&setup=true&lang.ts
var ZF = { class: "page-stack" }, QF = {
	class: "trpg-list",
	role: "radiogroup",
	"aria-label": "冒险"
}, $F = { class: "trpg-row trpg-radio" }, eI = ["checked"], tI = ["checked", "onChange"], nI = { class: "trpg-row__main" }, rI = { class: "trpg-row__meta" }, iI = /* @__PURE__ */ z({
	__name: "StepAdventure",
	setup(e) {
		let t = gT(), n = J(() => jF(t.installed, t.catalog, $.ruleId).filter((e) => e.category === "adventure"));
		function r(e) {
			$.adventureId = e, $.touched = !0;
		}
		return (e, t) => (H(), U("div", ZF, [t[3] ||= G("h3", { class: "trpg-step-title" }, "要不要带一个冒险模组", -1), G("div", QF, [G("label", $F, [
			G("input", {
				type: "radio",
				name: "adv",
				checked: L($).adventureId === "",
				onChange: t[0] ||= (e) => r("")
			}, null, 40, eI),
			t[1] ||= Vs(),
			t[2] ||= G("span", { class: "trpg-row__title" }, "不带冒险，自由开始", -1)
		]), (H(!0), U(V, null, ja(n.value, (e) => (H(), U("label", {
			key: e.id,
			class: "trpg-row trpg-radio"
		}, [G("input", {
			type: "radio",
			name: "adv",
			checked: L($).adventureId === e.id,
			onChange: (t) => r(e.id)
		}, null, 40, tI), G("span", nI, [K(IF, { onOpen: (t) => L(JF)(e.id) }, {
			default: R(() => [Vs(M(e.name), 1)]),
			_: 2
		}, 1032, ["onOpen"]), G("span", rI, M(e.description), 1)])]))), 128))])]));
	}
}), aI = { class: "trpg-field" }, oI = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, sI = {
	key: 1,
	class: "trpg-field__error",
	role: "alert"
}, cI = { class: "trpg-field" }, lI = {
	class: "trpg-field__hint",
	"data-testid": "wizard-summary"
}, uI = /* @__PURE__ */ z({
	__name: "StepName",
	emits: ["submit"],
	setup(e, { emit: t }) {
		let n = t, r = Xw(), i = gT(), a = /* @__PURE__ */ I(null), o = J(() => r.svc().rules.get($.ruleId)), s = J(() => $.name.trim().length > 40), c = J(() => $.name.trim().length === 0), l = J(() => {
			let e = $.packIds.length, t = $.adventureId ? `《${i.installedMap.get($.adventureId)?.name ?? $.adventureId}》` : "不带冒险";
			return `将建立：${o.value?.name ?? ""} · 资料 ${e} 本 · ${t}`;
		});
		return ma(() => {
			if (!$.nameEdited || !$.name) {
				let e = new Date(r.svc().now());
				$.name = `${o.value?.nameShort ?? "战役"} · ${e.getMonth() + 1}月${e.getDate()}日`;
			}
			a.value?.focus(), a.value?.select();
		}), (e, t) => (H(), U("form", {
			class: "page-stack",
			onSubmit: t[4] ||= ku((e) => n("submit"), ["prevent"])
		}, [
			t[7] ||= G("h3", { class: "trpg-step-title" }, "给战役起个名字", -1),
			G("label", aI, [
				t[5] ||= G("span", { class: "trpg-field__label" }, "战役名称", -1),
				Nr(G("input", {
					ref_key: "input",
					ref: a,
					"onUpdate:modelValue": t[0] ||= (e) => L($).name = e,
					class: "trpg-input",
					type: "text",
					autocomplete: "off",
					"aria-label": "战役名称",
					onInput: t[1] ||= (e) => {
						L($).nameEdited = !0, L($).touched = !0;
					}
				}, null, 544), [[mu, L($).name]]),
				c.value ? (H(), U("span", oI, "请输入战役名称")) : s.value ? (H(), U("span", sI, "名称最多 " + M(L(40)) + " 个字", 1)) : q("", !0)
			]),
			G("label", cI, [t[6] ||= G("span", { class: "trpg-field__label" }, "备注（可空）", -1), Nr(G("textarea", {
				"onUpdate:modelValue": t[2] ||= (e) => L($).note = e,
				class: "trpg-input",
				rows: "2",
				maxlength: "200",
				"aria-label": "备注",
				onInput: t[3] ||= (e) => L($).touched = !0
			}, null, 544), [[mu, L($).note]])]),
			G("p", lI, M(l.value), 1)
		], 32));
	}
}), dI = { class: "page-stack" }, fI = {
	key: 0,
	class: "trpg-field__hint",
	role: "status"
}, pI = {
	key: 1,
	class: "trpg-field__hint",
	role: "status",
	"data-testid": "wizard-progress"
}, mI = ["aria-label"], hI = { class: "trpg-group" }, gI = { class: "trpg-list" }, _I = ["data-testid"], vI = { class: "trpg-row__main" }, yI = { class: "trpg-row__meta" }, bI = { class: "trpg-row__end" }, xI = {
	key: 0,
	class: "trpg-badge"
}, SI = ["title"], CI = ["onClick"], wI = ["aria-valuenow"], TI = /* @__PURE__ */ z({
	__name: "StepPacks",
	setup(e) {
		let t = Xw(), n = gT(), r = J(() => t.svc().rules.get($.ruleId)), i = J(() => jF(n.installed, n.catalog, $.ruleId).filter((e) => e.category !== "adventure")), a = J(() => new Set(r.value?.corePackIds ?? [])), o = J(() => {
			let e = /* @__PURE__ */ new Map(), t = (e) => e.source === "builtin" ? "内置" : e.source === "user" ? "我的" : e.group ?? "其他";
			for (let n of i.value) e.set(t(n), [...e.get(t(n)) ?? [], n]);
			let r = (e) => n.catalog?.packs.findIndex((t) => t.group === e) ?? -1, a = (e) => e === "内置" ? -2 : e === "我的" ? 9999 : e === "其他" ? 9998 : r(e);
			return [...e].sort((e, t) => a(e[0]) - a(t[0]));
		});
		function s(e) {
			if (a.value.has(e)) return "必需";
			let t = i.value.find((t) => $.packIds.includes(t.id) && t.requires.includes(e));
			return t ? `《${t.name}》需要它` : void 0;
		}
		function c(e, t = /* @__PURE__ */ new Set()) {
			if (t.has(e)) return t;
			t.add(e);
			for (let n of i.value.find((t) => t.id === e)?.requires ?? []) c(n, t);
			return t;
		}
		function l(e) {
			return n.catalog?.packs.find((t) => t.id === e);
		}
		function u(e, t) {
			if ($.touched = !0, t) {
				let t = c(e.id);
				$.packIds = [.../* @__PURE__ */ new Set([...$.packIds, ...t])];
				for (let e of t) {
					let t = l(e);
					t && !n.installedMap.has(e) && !n.tasks[e] && n.install(t);
				}
			} else $.packIds = $.packIds.filter((t) => t !== e.id);
		}
		function d() {
			$.touched = !0;
			for (let e of i.value) $.packIds.includes(e.id) || u(e, !0);
		}
		function f() {
			$.touched = !0, $.packIds = [...a.value];
		}
		function p(e) {
			let t = l(e);
			t && n.install(t);
		}
		function m() {
			let e = i.value.filter((e) => e.source === "builtin" || e.source === "user" || e.recommended || a.value.has(e.id)).map((e) => e.id);
			return [.../* @__PURE__ */ new Set([...a.value, ...e.flatMap((e) => [...c(e)])])];
		}
		ma(async () => {
			n.catalog || await n.loadCatalog(), await n.refreshInstalled(), $.packsInit ||= ($.packIds = m(), !0), await n.ensureRecommended($.ruleId);
		});
		let h = J(() => {
			let e = Object.values(n.tasks), t = e.length;
			if (!t) return "";
			let r = e.filter((e) => e.state !== "failed"), i = e.filter((e) => e.state === "failed").length;
			return r.length ? `正在准备 ${t - r.length - i + 1}/${t}` : `${i} 本未能下载 · 可以先开始，之后在库里补装`;
		});
		return (e, t) => (H(), U("div", dI, [
			G("div", { class: "trpg-step-head" }, [t[1] ||= G("h3", { class: "trpg-step-title" }, "这场战役用哪些资料", -1), G("span", { class: "trpg-step-actions" }, [G("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: d
			}, "全选"), G("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: f
			}, "只留必需")])]),
			L(n).catalogState === "error" ? (H(), U("p", fI, [Vs(" 没能连上数据仓库：" + M(L(n).catalogError) + "。可以先开始，之后在库里补装。 ", 1), G("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: t[0] ||= (e) => L(n).loadCatalog(!0)
			}, "重试")])) : q("", !0),
			h.value ? (H(), U("p", pI, M(h.value), 1)) : q("", !0),
			(H(!0), U(V, null, ja(o.value, ([e, t]) => (H(), U("section", {
				key: e,
				"aria-label": e
			}, [G("h4", hI, M(e), 1), G("ul", gI, [(H(!0), U(V, null, ja(t, (e) => (H(), U("li", {
				key: e.id,
				class: "trpg-row",
				"data-testid": `wizard-pack-${e.id}`
			}, [
				K(MD, {
					"model-value": L($).packIds.includes(e.id),
					disabled: !!s(e.id) && L($).packIds.includes(e.id),
					label: e.name,
					"onUpdate:modelValue": (t) => u(e, t)
				}, null, 8, [
					"model-value",
					"disabled",
					"label",
					"onUpdate:modelValue"
				]),
				G("div", vI, [K(IF, { onOpen: (t) => L(JF)(e.id) }, {
					default: R(() => [Vs(M(e.name), 1)]),
					_: 2
				}, 1032, ["onOpen"]), G("div", yI, [Vs(M(L(MF)(e)), 1), !e.installed && !L(n).tasks[e.id] ? (H(), U(V, { key: 0 }, [Vs(" · 未安装 · " + M(L(OE)(e.byteSize)), 1)], 64)) : q("", !0)])]),
				G("div", bI, [s(e.id) && L($).packIds.includes(e.id) ? (H(), U("span", xI, M(s(e.id)), 1)) : q("", !0), L(n).tasks[e.id] ? (H(), U(V, { key: 1 }, [L(n).tasks[e.id].state === "failed" ? (H(), U("span", {
					key: 0,
					class: "trpg-badge",
					"data-tone": "danger",
					title: L(n).tasks[e.id].error
				}, "⚠ 下载失败", 8, SI)) : q("", !0), L(n).tasks[e.id].state === "failed" ? (H(), U("button", {
					key: 1,
					class: "trpg-btn trpg-btn--small",
					type: "button",
					onClick: (t) => p(e.id)
				}, "重试", 8, CI)) : (H(), U("span", {
					key: 2,
					class: "trpg-progress",
					role: "progressbar",
					"aria-valuenow": Math.round(L(n).tasks[e.id].received / Math.max(1, L(n).tasks[e.id].total) * 100),
					"aria-valuemin": "0",
					"aria-valuemax": "100"
				}, [G("span", { style: Oe({ width: `${Math.round(L(n).tasks[e.id].received / Math.max(1, L(n).tasks[e.id].total) * 100)}%` }) }, null, 4)], 8, wI))], 64)) : q("", !0)])
			], 8, _I))), 128))])], 8, mI))), 128))
		]));
	}
}), EI = { class: "page-stack" }, DI = /* @__PURE__ */ z({
	__name: "InfoPage",
	props: { lines: {} },
	setup(e) {
		return (t, n) => (H(), U("div", EI, [(H(!0), U(V, null, ja(e.lines, (e) => (H(), U("p", {
			key: e,
			class: "trpg-info__line"
		}, M(e), 1))), 128))]));
	}
}), OI = { class: "page-stack" }, kI = {
	class: "trpg-rulecards",
	role: "radiogroup",
	"aria-label": "规则"
}, AI = [
	"aria-checked",
	"aria-disabled",
	"tabindex",
	"data-status",
	"onClick",
	"onKeydown"
], jI = {
	class: "trpg-rulecard__mark",
	"aria-hidden": "true"
}, MI = { class: "trpg-rulecard__body" }, NI = { class: "trpg-row__meta" }, PI = {
	key: 0,
	class: "trpg-badge"
}, FI = {
	key: 1,
	class: "trpg-badge",
	"data-tone": "warn"
}, II = /* @__PURE__ */ z({
	__name: "StepRule",
	setup(e) {
		let t = Xw(), n = gT(), r = gE(), i = J(() => uw(t.svc().rules, n.catalog?.rules ?? []));
		function a(e, t) {
			t === "installed" && ($.ruleId = e, $.touched = !0);
		}
		function o(e, t, n) {
			r.push({
				key: `rule:${e}`,
				title: t,
				component: xn(DI),
				props: { lines: [n] }
			});
		}
		return (e, t) => (H(), U("div", OI, [t[0] ||= G("h3", { class: "trpg-step-title" }, "选择这场战役用的规则", -1), G("div", kI, [(H(!0), U(V, null, ja(i.value, (e) => (H(), U("div", {
			key: e.id,
			class: "trpg-rulecard",
			role: "radio",
			"aria-checked": L($).ruleId === e.id,
			"aria-disabled": e.status !== "installed",
			tabindex: e.status === "installed" ? 0 : -1,
			"data-status": e.status,
			onClick: (t) => a(e.id, e.status),
			onKeydown: [ju(ku((t) => a(e.id, e.status), ["prevent"]), ["enter"]), ju(ku((t) => a(e.id, e.status), ["prevent"]), ["space"])]
		}, [G("span", jI, M(L($).ruleId === e.id ? "◉" : "○"), 1), G("span", MI, [
			K(IF, { onOpen: (t) => o(e.id, e.name, e.description) }, {
				default: R(() => [Vs(M(e.name), 1)]),
				_: 2
			}, 1032, ["onOpen"]),
			G("span", NI, M(e.description), 1),
			e.status === "coming" ? (H(), U("span", PI, "即将推出")) : e.status === "installable" ? (H(), U("span", FI, "可安装")) : q("", !0)
		])], 40, AI))), 128))])]));
	}
}), LI = {
	class: "trpg-wizard",
	"data-testid": "wizard"
}, RI = {
	class: "trpg-steps",
	"aria-label": "步骤"
}, zI = ["data-state", "data-skipped"], BI = [
	"aria-current",
	"disabled",
	"title",
	"onClick"
], VI = { class: "trpg-steps__n" }, HI = { class: "trpg-steps__label" }, UI = {
	class: "trpg-steps__compact",
	"aria-hidden": "true"
}, WI = { class: "trpg-wizard__body" }, GI = { class: "trpg-wizard__foot" }, KI = ["disabled"], qI = ["disabled"], JI = /* @__PURE__ */ z({
	__name: "WizardPage",
	setup(e) {
		let t = Xw(), n = Qw(), r = gT(), i = gE(), a = vT(), o = xT(), s = /* @__PURE__ */ I(!1), c = [
			{
				n: 1,
				label: "规则"
			},
			{
				n: 2,
				label: "资料"
			},
			{
				n: 3,
				label: "冒险"
			},
			{
				n: 4,
				label: "命名"
			}
		], l = J(() => jF(r.installed, r.catalog, $.ruleId).some((e) => e.category === "adventure")), u = J(() => !kF.adventureImport || !l.value), d = J(() => kF.adventureImport ? "库里还没有冒险" : "冒险导入随后续版本提供"), f = J(() => $.name.trim().length > 0 && $.name.trim().length <= 40), p = J(() => $.step === 1 ? !!$.ruleId : $.step !== 4 || f.value && !s.value), m = J(() => c.find((e) => e.n === $.step)?.label);
		ma(async () => {
			await r.refreshInstalled(), r.loadCatalog();
			let e = t.svc().rules.list();
			!$.ruleId && e.length === 1 && ($.ruleId = e[0].id);
		});
		function h(e) {
			e < $.step && !(e === 3 && u.value) && ($.step = e);
		}
		function g() {
			$.step === 1 ? $.step = 2 : $.step === 2 ? $.step = u.value ? 4 : 3 : $.step === 3 ? $.step = 4 : v();
		}
		function _() {
			$.step === 4 ? $.step = u.value ? 2 : 3 : $.step > 1 && --$.step;
		}
		async function v() {
			if (f.value && !s.value) {
				s.value = !0;
				try {
					await r.waitFor($.packIds), await r.refreshInstalled();
					let e = $.packIds.filter((e) => r.installedMap.has(e)), s = $.packIds.length - e.length, c = await n.startNew({
						ruleId: $.ruleId,
						packIds: e,
						name: $.name.trim(),
						note: $.note
					});
					await t.refreshBackup(), i.close(!0), o.go("home"), a.success(`已开始「${c.name}」`), s > 0 && a.info(`${s} 本资料还没装好，可以稍后在库里补装`);
				} catch (e) {
					console.error("[trpg-assistant] 开始冒险失败", e), a.error(`没能开始：${AE(e)}`);
				} finally {
					s.value = !1;
				}
			}
		}
		return (e, t) => (H(), U("div", LI, [
			G("ol", RI, [(H(), U(V, null, ja(c, (e) => G("li", {
				key: e.n,
				"data-state": e.n === L($).step ? "current" : e.n < L($).step ? "done" : "todo",
				"data-skipped": e.n === 3 && u.value
			}, [G("button", {
				type: "button",
				"aria-current": e.n === L($).step ? "step" : void 0,
				disabled: e.n >= L($).step || e.n === 3 && u.value,
				title: e.n === 3 && u.value ? d.value : void 0,
				onClick: (t) => h(e.n)
			}, [G("span", VI, M(e.n), 1), G("span", HI, M(e.label), 1)], 8, BI)], 8, zI)), 64))]),
			G("p", UI, M(L($).step) + "/4 · " + M(m.value), 1),
			G("div", WI, [L($).step === 1 ? (H(), W(II, { key: 0 })) : L($).step === 2 ? (H(), W(TI, { key: 1 })) : L($).step === 3 ? (H(), W(iI, { key: 2 })) : (H(), W(uI, {
				key: 3,
				onSubmit: v
			}))]),
			G("footer", GI, [G("button", {
				class: "trpg-btn",
				type: "button",
				disabled: L($).step === 1 || s.value,
				onClick: _
			}, "上一步", 8, KI), G("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: !p.value,
				"data-testid": "wizard-next",
				onClick: g
			}, M(L($).step === 4 ? s.value ? "正在准备…" : "开始冒险" : "下一步"), 9, qI)])
		]));
	}
});
// src/ui/saves/actions.ts
function YI() {
	gE().open({
		key: "saves",
		title: "存档",
		component: xn(wF),
		variant: "drawer"
	});
}
function XI() {
	let e = gE();
	XF(), e.open({
		key: "wizard",
		title: "开始新冒险",
		component: xn(JI),
		variant: "dialog",
		guard: () => !$.touched || (VE({
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
async function ZI() {
	let e = Qw(), t = vT();
	if (e.hasCampaign && !e.readOnly) try {
		let n = await e.save();
		await Xw().refreshBackup(), t.success(n ? "已保存" : "已是最新");
	} catch (e) {
		console.error("[trpg-assistant] 保存失败", e), t.error(`保存失败：${AE(e)}`);
	}
}
async function QI(e) {
	let t = Qw(), n = gE(), r = vT(), i = jE();
	if (t.readOnly) return { loaded: !1 };
	try {
		let a = !!t.workspace && t.workspace.ruleId !== e.ruleId;
		if (a) {
			let n = Xw().svc().rules.get(e.ruleId);
			if (!await VE({
				title: "切换规则",
				message: `「${e.name}」使用 ${n?.name ?? e.ruleId}。读取后，整个助手会切换为该规则的界面与资料；当前的「${t.currentSave?.name ?? "存档"}」会先写入自动存档。`,
				confirmLabel: "切换并读取"
			})) return { loaded: !1 };
		} else if (t.hasCampaign && t.dirty) {
			let n = await ME({
				key: "confirm:unsaved",
				title: "有未保存的改动",
				component: xn(OF),
				props: (n) => ({
					current: t.currentSave?.name ?? "当前存档",
					target: e.name,
					onChoose: n
				})
			}, "cancel");
			if (n === "cancel") return { loaded: !1 };
			n === "save" && await t.save();
		} else if (t.hasCampaign && e.ownerKey !== t.owner?.ownerKey && !await VE({
			title: "读取其他角色卡的存档",
			message: `「${e.name}」属于其他角色卡，读取时会复制为这张卡的新存档。`,
			confirmLabel: "读取"
		})) return { loaded: !1 };
		return await t.load(e.id, { allowRuleSwitch: a || !t.hasCampaign }), await i.refresh(), r.success(`已读取「${e.name}」`), n.close(!0), { loaded: !0 };
	} catch (e) {
		return console.error("[trpg-assistant] 读取存档失败", e), r.error(e instanceof Q ? e.message : `读取失败：${AE(e)}`), { loaded: !1 };
	}
}
// src/ui/home/HomeCampaign.vue?vue&type=script&setup=true&lang.ts
var $I = { class: "page-stack" }, eL = ["src", "alt"], tL = { class: "trpg-banner__text" }, nL = { class: "trpg-banner__line" }, rL = ["data-dirty"], iL = { class: "trpg-overview" }, aL = { class: "trpg-cell__title" }, oL = { class: "trpg-cell__line" }, sL = {
	key: 0,
	class: "trpg-cell__line"
}, cL = { class: "trpg-empty trpg-empty--tight" }, lL = /* @__PURE__ */ z({
	__name: "HomeCampaign",
	setup(e) {
		let t = Xw(), n = Qw(), r = gT(), i = xT(), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(!1), s = J(() => n.workspace ? t.svc().rules.get(n.workspace.ruleId) : void 0), c = J(() => wE({
			rule: s.value,
			data: n.workspace.data,
			narrow: window.innerWidth <= 480
		})), l = J(() => !!c.value.src && !a.value), u = J(() => n.currentSave?.name ?? "存档"), d = J(() => n.dirty ? "● 有未保存改动" : n.currentSave ? `已保存 ${DE(n.currentSave.updatedAt)}` : ""), f = J(() => n.workspace?.enabledPacks.length ?? 0), p = J(() => r.catalogState === "ok" ? r.updates.length ? `${r.updates.length} 个可更新` : "已是最新" : "");
		return ma(() => void r.loadCatalog()), (e, t) => (H(), U("div", $I, [
			G("section", {
				class: Ne(["trpg-banner", { "trpg-banner--pattern": !l.value }]),
				"aria-label": "战役横幅"
			}, [l.value ? (H(), U("img", {
				key: 0,
				class: Ne(["trpg-banner__img", { "is-loaded": o.value }]),
				src: c.value.src,
				alt: c.value.alt,
				onLoad: t[0] ||= (e) => o.value = !0,
				onError: t[1] ||= (e) => a.value = !0
			}, null, 42, eL)) : q("", !0), G("div", tL, [G("button", {
				class: "trpg-banner__title",
				type: "button",
				"data-testid": "banner-title",
				onClick: t[2] ||= (...e) => L(YI) && L(YI)(...e)
			}, M(u.value), 1), G("div", nL, [G("span", null, M(s.value?.name), 1), G("button", {
				class: "trpg-banner__state",
				type: "button",
				"data-dirty": L(n).dirty,
				onClick: t[3] ||= (...e) => L(YI) && L(YI)(...e)
			}, M(d.value), 9, rL)])])], 2),
			t[8] ||= G("h2", { class: "trpg-group" }, "概览", -1),
			G("div", iL, [G("button", {
				class: "trpg-cell",
				type: "button",
				"data-testid": "cell-library",
				onClick: t[4] ||= (e) => L(i).openLibrary("save")
			}, [
				G("span", aL, [K(OT, {
					name: "books",
					size: 18
				}), t[6] ||= Vs("库", -1)]),
				G("span", oL, "已启用 " + M(f.value) + " 个扩展包", 1),
				p.value ? (H(), U("span", sL, M(p.value), 1)) : q("", !0)
			])]),
			t[9] ||= G("h2", { class: "trpg-group" }, "最近记录", -1),
			G("p", cL, [t[7] ||= Vs("还没有记录，", -1), G("button", {
				class: "trpg-link",
				type: "button",
				onClick: t[5] ||= (e) => L(i).diceOpen = !0
			}, "掷一次骰子试试")])
		]));
	}
}), uL = { class: "page-stack" }, dL = ["disabled"], fL = { class: "trpg-hero__sub" }, pL = {
	key: 1,
	class: "trpg-hero trpg-hero--idle",
	"data-testid": "no-chat"
}, mL = /* @__PURE__ */ z({
	__name: "HomeEmpty",
	setup(e) {
		let t = Qw(), n = Xw(), r = jE(), i = /* @__PURE__ */ I(0);
		return ma(async () => {
			i.value = await r.count(), await n.refreshBackup();
		}), (e, n) => (H(), U("div", uL, [L(t).owner ? (H(), U("button", {
			key: 0,
			class: "trpg-hero",
			type: "button",
			"data-testid": "start-banner",
			disabled: L(t).readOnly,
			onClick: n[0] ||= (e) => L(XI)()
		}, [
			n[2] ||= G("span", { class: "trpg-hero__title" }, "开始一场新的冒险", -1),
			G("span", fL, "为「" + M(L(t).owner.ownerLabel) + "」建立一个战役：选规则、资料与冒险，再起个名字。", 1),
			n[3] ||= G("span", {
				class: "trpg-hero__go",
				"aria-hidden": "true"
			}, "开始新冒险 →", -1)
		], 8, dL)) : (H(), U("div", pL, [...n[4] ||= [G("span", { class: "trpg-hero__title" }, "请先在酒馆中打开一个聊天", -1)]])), L(t).owner && i.value > 0 ? (H(), U("button", {
			key: 2,
			class: "trpg-link",
			type: "button",
			"data-testid": "load-existing",
			onClick: n[1] ||= (...e) => L(YI) && L(YI)(...e)
		}, "读取已有存档（" + M(i.value) + "）", 1)) : q("", !0)]));
	}
}), hL = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, gL = {
	key: 1,
	class: "page-stack",
	"aria-busy": "true"
}, _L = /* @__PURE__ */ z({
	__name: "HomeView",
	setup(e) {
		let t = Xw(), n = Qw();
		return (e, r) => L(t).bootError ? (H(), U("p", hL, "无法打开本机存储：" + M(L(t).bootError), 1)) : !L(t).booted || !L(n).ready ? (H(), U("div", gL, [...r[0] ||= [G("div", {
			class: "trpg-skeleton",
			style: { height: "140px" }
		}, null, -1), G("div", {
			class: "trpg-skeleton",
			style: { width: "40%" }
		}, null, -1)]])) : L(n).hasCampaign ? (H(), W(lL, { key: 3 })) : (H(), W(mL, { key: 2 }));
	}
}), vL = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, yL = {}, bL = { class: "trpg-empty" };
function xL(e, t) {
	return H(), U("p", bL, "库");
}
var SL = /*#__PURE__*/ vL(yL, [["render", xL]]), CL = /* @__PURE__ */ fn({});
function wL(e, t, n, r, i) {
	CL[e] = {
		id: e,
		title: t,
		status: n,
		summary: r,
		detail: i,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function TL(e, t, n) {
	try {
		await n();
	} catch (n) {
		console.error(`[trpg-assistant] 探针 ${e} 出错`, n), wL(e, t, "error", n instanceof Error ? n.message : String(n));
	}
}
function EL(e) {
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		env: e,
		results: Object.values(CL)
	};
}
// src/probes/envProbe.ts
var DL = "env", OL = "宿主与设备环境";
function kL() {
	let e = document.createElement("div");
	e.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top)", document.body.appendChild(e);
	let t = getComputedStyle(e).paddingTop;
	return e.remove(), t;
}
async function AL(e) {
	let t = { present: !1 };
	if (window.__TAURITAVERN__) try {
		let e = await m();
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
		safeAreaTop: kL(),
		contextKeys: Object.keys(e).sort(),
		libsKeys: Object.keys(window.SillyTavern?.libs ?? {}).sort(),
		hasSetExtensionPrompt: typeof e.setExtensionPrompt == "function",
		hasPromptEnums: !!e.extension_prompt_types,
		eventTypeCount: Object.keys(e.event_types ?? {}).length,
		tauri: t
	};
}
function jL(e) {
	let t = () => TL(DL, OL, async () => {
		let t = await AL(e), n = t.tauri;
		wL(DL, OL, "info", n.present ? "检测到 TauriTavern 宿主" : "未检测到 TauriTavern（普通 SillyTavern）", t);
	});
	return {
		id: DL,
		title: OL,
		hint: "自动检测。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/eventsProbe.ts
var ML = "events", NL = "聊天事件", PL = [
	["CHAT_CHANGED", "chat_id_changed"],
	["MESSAGE_SENT", "message_sent"],
	["MESSAGE_RECEIVED", "message_received"],
	["MESSAGE_SWIPED", "message_swiped"],
	["MESSAGE_EDITED", "message_edited"],
	["MESSAGE_DELETED", "message_deleted"],
	["GENERATION_STARTED", "generation_started"],
	["GENERATION_ENDED", "generation_ended"]
];
function FL(e) {
	let t = {}, n = [], r = () => {
		let e = PL.map(([e]) => e).filter((e) => !t[e]);
		wL(ML, NL, "info", e.length ? `尚未观察到：${e.join("、")}` : "全部事件都已观察到", {
			counts: t,
			recent: n.slice(-30)
		});
	};
	return {
		id: ML,
		title: NL,
		hint: "依次做：发送消息、等回复、切换回复（左右箭头）、编辑一条消息、删除一条消息、切换聊天，观察事件是否都能收到。",
		actions: [{
			label: "刷新",
			run: r
		}],
		start: () => {
			for (let [i, a] of PL) g(e, h(e, i, a), (...e) => {
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
var IL = "identity", LL = "角色卡 / 群组 / 聊天标识";
function RL(e) {
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
function zL(e) {
	let t = [], n = () => {
		let n = RL(e), r = JSON.stringify([
			n.characterId,
			n.groupId,
			n.chatId
		]);
		t.some((e) => e.key === r) || t.push({
			key: r,
			...n
		}), wL(IL, LL, "info", `当前：${n.groupId ? "群组聊天" : n.characterId === null ? "没有打开聊天" : "角色卡聊天"}；已观察 ${t.length} 种上下文`, {
			current: n,
			observed: t
		});
	};
	return {
		id: IL,
		title: LL,
		hint: "在角色卡聊天、群组聊天、未打开聊天三种状态之间切换，观察标识是否都能取到。",
		actions: [{
			label: "刷新",
			run: n
		}],
		start: () => {
			n(), g(e, h(e, "CHAT_CHANGED", "chat_id_changed"), n);
		}
	};
}
// src/core/selftest.ts
function BL(e, t) {
	if (!e) throw Error(t);
}
function VL(e, t, n) {
	return Array.from({ length: e }, (e, r) => ({
		id: `${n}${r + 1}`,
		type: t,
		name: `${t}${r + 1}`,
		keywords: [],
		unique: !1,
		summary: "",
		data: { n: r + 1 }
	}));
}
async function HL(e) {
	let t = [], n = hw({
		dbName: `tavern-trpg-assistant-selftest-${_b()}`,
		appVersion: "99.0.0"
	}), r = {
		ownerKey: "char:selftest.png",
		ownerLabel: "自检角色"
	}, i = {
		ownerKey: "char:selftest2.png",
		ownerLabel: "自检角色二"
	}, a = (e) => n.rules.has(e), o = !1, s = async (n, r) => {
		if (o) return;
		let i;
		try {
			i = {
				name: n,
				ok: !0,
				detail: await r() || void 0
			};
		} catch (e) {
			o = !0, i = {
				name: n,
				ok: !1,
				detail: e instanceof Error ? e.message : String(e)
			};
		}
		t.push(i), e?.(i);
	}, c = {
		id: "tom",
		type: "npc",
		name: "托姆",
		keywords: ["托姆"],
		unique: !0,
		summary: "",
		data: { hp: 9 }
	}, l = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="), (e) => e.charCodeAt(0)), u = (e, t, n = "1.0.0", r = []) => WC({
		manifest: {
			id: e,
			ruleId: "dnd5e2014",
			category: t,
			name: `自检-${e}`,
			version: n,
			relationships: {
				requires: t === "adventure" ? [{ id: "dnd5e2014-srd" }] : [],
				recommends: [],
				conflicts: []
			}
		},
		entries: [...VL(5, "spell", "sp"), ...r],
		blobs: /* @__PURE__ */ new Map([[hS(l), {
			bytes: l,
			mime: "image/png"
		}]])
	});
	try {
		await s("运行环境", async () => (BL(typeof indexedDB < "u", "没有 IndexedDB"), BL(typeof structuredClone == "function", "没有 structuredClone"), BL(typeof crypto?.getRandomValues == "function", "没有 crypto.getRandomValues"), BL(typeof BroadcastChannel < "u", "没有 BroadcastChannel（多窗口只读不可用）"), `secureContext=${String(globalThis.isSecureContext)}`)), await s("生成并识别内容包（zip 压缩与解压）", async () => {
			let e = n.packs.recognize(u("selftest-core", "rules"));
			return BL(e.type === "pack" && e.manifest.entryCount === 5, "识别结果不对"), `${e.type === "pack" ? e.byteSize : 0} 字节`;
		}), await s("安装内置包与模组（模组依赖核心包）", async () => {
			BL(await n.packs.installBuiltin(u("dnd5e2014-srd", "rules")) === "installed", "内置包未安装");
			let e = n.packs.recognize(u("selftest-module", "adventure", "1.0.0", [c]));
			BL(e.type === "pack", "不是内容包"), await n.packs.install(e, { source: "import" }), BL((await n.packs.list()).length === 2, "安装数量不对");
		}), await s("重复导入同一个包：要求先选择覆盖；选择后升级", async () => {
			let e = n.packs.recognize(u("selftest-module", "adventure", "1.1.0", [c]));
			BL(e.type === "pack", "不是内容包");
			let t = !1;
			try {
				await n.packs.install(e, { source: "import" });
			} catch {
				t = !0;
			}
			BL(t, "没有要求选择覆盖"), await n.packs.install(e, {
				source: "import",
				resolution: "overwrite"
			}), BL((await n.db.packs.get("selftest-module"))?.version === "1.1.0", "覆盖后版本不对");
		}), await s("新存档、修改、保存、分支", async () => {
			let e = await n.campaign.startNewCampaign({
				...r,
				ruleId: "dnd5e2014",
				packIds: ["selftest-module"],
				name: "自检存档"
			});
			BL(!n.campaign.isDirty(e.workspace), "新存档不应有未保存改动");
			let t = await n.campaign.updateData(r.ownerKey, (e) => ({
				...e,
				gold: 10
			}));
			BL(n.campaign.isDirty(t), "修改后应为未保存"), BL((await n.campaign.saveCurrent(r.ownerKey)).changed, "保存应写入"), BL((await n.campaign.branch(r.ownerKey)).save.branchedFrom === e.save.id, "分支来源不对");
		}), await s("读取存档（写自动存档）与模板副本", async () => {
			let e = (await n.campaign.listManual({
				ownerKey: r.ownerKey,
				ruleId: "dnd5e2014"
			}, "card")).find((e) => e.name === "自检存档");
			BL(e, "找不到第一个存档"), await n.campaign.loadSave(r, e.id), BL((await n.campaign.listAuto(r.ownerKey, "dnd5e2014")).length === 1, "没有写自动存档");
			let t = await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "tom"
			}), i = await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "tom"
			});
			BL(t.created && !i.created, "唯一条目应只有一份"), BL((await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "sp1"
			}, 3)).instances.map((e) => e.label).join("") === "ABC", "批量编号不对");
		}), await s("删除、最近删除、恢复、彻底删除", async () => {
			let [e] = (await n.campaign.listManual({
				ownerKey: r.ownerKey,
				ruleId: "dnd5e2014"
			}, "card")).filter((e) => e.name !== "自检存档");
			await n.campaign.deleteSave(e.id), BL((await n.campaign.listDeleted("dnd5e2014")).length === 1, "最近删除应有 1 个"), await n.campaign.restoreSave(e.id), await n.campaign.deleteSave(e.id), BL(await n.campaign.purgeSaves([e.id]) === 1, "彻底删除失败");
		}), await s("导出存档并导入到另一张卡", async () => {
			await n.campaign.saveCurrent(r.ownerKey);
			let e = (await n.campaign.getWorkspace(r.ownerKey)).currentSaveId, { bytes: t } = await iO({
				db: n.db,
				packs: n.packs,
				now: n.now,
				appVersion: "99.0.0"
			}, {
				type: "save",
				saveId: e
			}, { includePacks: !0 }), o = n.packs.recognize(t);
			BL(o.type === "save" && o.attachedPacks.size === 1, "导出文件内容不对");
			let s = TD(o, a);
			return BL((await OD({
				db: n.db,
				campaign: n.campaign,
				now: n.now,
				hasRule: a
			}, o, {
				owner: i,
				selectedIds: s.map((e) => e.save.id)
			})).imported === 1, "导入数量不对"), `${t.length} 字节`;
		}), await s("完整备份导出与覆盖恢复", async () => {
			let { bytes: e } = await iO({
				db: n.db,
				packs: n.packs,
				now: n.now,
				appVersion: "99.0.0"
			}, { type: "backup" }, { includePacks: !1 }), t = n.packs.recognize(e);
			BL(t.type === "backup" && t.workspaces.length === 1 && t.saves.length >= 3, "备份内容不对"), await n.campaign.updateData(r.ownerKey, (e) => ({
				...e,
				gold: 999
			})), await OD({
				db: n.db,
				campaign: n.campaign,
				now: n.now,
				hasRule: a
			}, t, {
				owner: r,
				selectedIds: [],
				mode: "overwrite"
			}), BL((await n.campaign.getWorkspace(r.ownerKey))?.data.gold === 10, "覆盖恢复后数据不对"), BL((await n.campaign.listAuto(r.ownerKey, "dnd5e2014")).some((e) => e.autoReason === "恢复备份前"), "没有\"恢复备份前\"自动存档");
		}), await s("删除内容包", async () => {
			await n.packs.uninstall("selftest-module"), BL(await n.db.entries.where("packId").equals("selftest-module").count() === 0, "条目未清除");
		});
	} finally {
		n.db.close(), await n.db.delete();
	}
	return t;
}
// src/probes/m1Probe.ts
var UL = "m1", WL = "M1 数据层自检";
function GL() {
	return {
		id: UL,
		title: WL,
		hint: "在独立的临时数据库里走完：安装内容包 → 新存档 → 保存 → 分支 → 读取 → 副本 → 删除与恢复 → 导出导入 → 备份恢复。只用合成数据，结束后自动删除，不影响你的真实数据。",
		actions: [{
			label: "运行 M1 数据层自检",
			run: () => TL(UL, WL, async () => {
				wL(UL, WL, "waiting", "正在运行…");
				let e = await HL((e) => wL(UL, WL, "waiting", `已完成 ${e.name}`)), t = e.find((e) => !e.ok);
				wL(UL, WL, t ? "fail" : "pass", t ? `未通过：${t.name} — ${t.detail ?? ""}` : `全部通过（${e.length}/10 步）`, e.map((e) => `${e.ok ? "✓" : "✗"} ${e.name}${e.detail ? ` — ${e.detail}` : ""}`));
			})
		}]
	};
}
// src/core/m2selftest.ts
var KL = {
	PHB: "玩家手册",
	DMG: "城主指南",
	MM: "怪物图鉴",
	XGE: "珊娜萨的万事指南",
	TCE: "塔莎的万事坩埚",
	SCAG: "剑湾冒险者指南",
	VGM: "瓦罗怪物指南",
	MTF: "魔邓肯的众敌卷册",
	MPMM: "魔邓肯巨献：多元宇宙的怪物",
	BMT: "万象无常书"
};
function qL(e) {
	let t = e.data.src, n = e.data.credit;
	return `出自《${KL[t?.book ?? ""] ?? t?.book ?? "未知"}》第 ${t?.page ?? 0} 页 · 中文：${n?.by ?? "未知"}（${n?.license ?? "未知"}）`;
}
var JL = () => xb("dnd5e2014-srd");
function YL() {
	return Yw({ catalogUrl: "https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json" });
}
async function XL(e) {
	let t = [], n = hw({
		dbName: `tavern-trpg-assistant-m2-${_b()}`,
		appVersion: "99.0.0"
	}), r = (n) => {
		t.push(n), e?.(n);
	}, i = !1, a = async (e, t) => {
		if (!i) try {
			let n = await t();
			r({
				name: e,
				ok: !0,
				...typeof n == "string" ? { detail: n } : n
			});
		} catch (t) {
			i = !0, r({
				name: e,
				ok: !1,
				detail: t instanceof Error ? t.message : String(t)
			});
		}
	}, o = [];
	try {
		await a("安装内置 SRD 包", async () => {
			let e = await n.packs.installBuiltin(await JL()), t = await n.db.packs.get("dnd5e2014-srd");
			if (!t) throw Error("内置 SRD 包未安装");
			return o.push(t), `${e}；${t.entryCount} 条，${(t.byteSize / 1024).toFixed(1)} KB`;
		}), await a("从数据仓库下载一个书籍包", async () => {
			let e;
			try {
				e = await dC({ url: YL() });
			} catch (e) {
				return {
					skipped: !0,
					detail: `跳过：数据仓库尚未发布（${e instanceof Error ? e.message : String(e)}）`
				};
			}
			let t = e.packs.find((e) => e.id !== "dnd5e2014-srd");
			if (!t) return {
				skipped: !0,
				detail: "跳过：目录中没有可下载的书籍包"
			};
			let r = await fC(t, { catalogUrl: YL() }), i = n.packs.recognize(r);
			if (i.type !== "pack") throw Error("下载的不是内容包");
			let a = await n.packs.install(i, { source: "download" });
			return o.push(a), `${a.name} v${a.version}；${(r.length / 1024).toFixed(1)} KB，校验值一致`;
		}), await a("显示各包条数与 5 个抽样条目", async () => {
			let e = await n.packs.list(), t = e.map((e) => `${e.name}：${e.entryCount} 条`).join("；"), r = [];
			for (let t of e) {
				let e = await n.db.entries.where("packId").equals(t.id).limit(2).toArray();
				for (let t of e) {
					if (r.length >= 5) break;
					r.push({
						...t,
						id: t.entryId
					});
				}
				if (r.length >= 5) break;
			}
			return { detail: [t, ...r.map((e, t) => `${t + 1}. ${e.name}｜${e.summary}｜${qL(e)}`)].join("\n") };
		}), await a("每种数据做一次导入 → 读取 → 使用 → 导出 → 再导入", async () => {
			let e = await n.packs.list({ ruleId: "dnd5e2014" });
			if (!e.length) throw Error("没有已安装的内容包");
			let t = await n.db.entries.toArray(), r = [...new Set(t.map((e) => e.type))].sort(), i = [], a = [];
			for (let e of r) {
				let r = t.find((t) => t.type === e), o = await n.packs.exportPack(r.packId), s = n.packs.recognize(o), c = s.entries.find((e) => e.id === r.entryId);
				if (!c || mS(c.data) !== mS(r.data)) {
					a.push(`${e}: ${r.entryId} 导出后内容不一致`);
					continue;
				}
				await n.packs.install(s, {
					source: "import",
					resolution: "overwrite"
				});
				let l = await n.db.entries.get([r.packId, r.entryId]);
				!l || mS(l.data) !== mS(r.data) ? a.push(`${e}: ${r.entryId} 再导入后内容不一致`) : i.push(`✓ ${e}：${r.entryId}`);
			}
			let o = e.find((e) => e.content.features.length > 0);
			if (o) {
				let e = mS(o.content.features), t = await n.packs.exportPack(o.id), r = n.packs.recognize(t);
				mS(r.features) !== e && a.push(`功能定义：${o.id} 导出后不一致`), await n.packs.install(r, {
					source: "import",
					resolution: "overwrite"
				}), i.push(`✓ 功能定义：${o.content.features.length} 个（规则选项原样保留）`);
			}
			if (i.push("↷ 图片、冒险内容项：官方书籍包不含，跳过（由测试夹具覆盖）"), a.length) throw Error(a.join("；"));
			return i.join("\n");
		}), await a("清理测试数据库", async () => {
			let e = n.db.name;
			if (n.db.close(), await n.db.delete(), (typeof indexedDB.databases == "function" ? await indexedDB.databases() : []).some((t) => t.name === e)) throw Error("临时数据库未删除");
			return `${e} 已删除`;
		});
	} finally {
		n.db.isOpen() && (n.db.close(), await n.db.delete());
	}
	return t;
}
// src/probes/m2Probe.ts
var ZL = "m2", QL = "M2 数据自检";
function $L() {
	return {
		id: ZL,
		title: QL,
		hint: "在临时数据库里安装内置 SRD 包、从数据仓库下载一个书籍包、显示条数与抽样来源、对每种数据做一次往返，最后清理测试数据库。数据仓库尚未发布时下载一步会跳过；只用临时库，不影响真实数据。",
		actions: [{
			label: "运行 M2 数据自检",
			run: () => TL(ZL, QL, async () => {
				wL(ZL, QL, "waiting", "正在运行…");
				let e = await XL((e) => wL(ZL, QL, "waiting", `已完成 ${e.name}`)), t = e.find((e) => !e.ok), n = e.filter((e) => e.skipped).length;
				wL(ZL, QL, t ? "fail" : "pass", t ? `未通过：${t.name} — ${t.detail ?? ""}` : `全部通过（${e.length}/5 步${n ? `，${n} 步跳过` : ""}）`, e.map((e) => `${e.ok ? e.skipped ? "↷" : "✓" : "✗"} ${e.name}${e.detail ? ` — ${e.detail}` : ""}`));
			})
		}]
	};
}
// src/probes/promptScan.ts
var eR = "TRPG-PROBE-COMMENT", tR = "TRPG-PROBE-INJECT";
function nR(e) {
	if (typeof e == "string") return e;
	try {
		return JSON.stringify(e) ?? "";
	} catch (e) {
		return console.error("[trpg-assistant] 请求内容无法序列化", e), "";
	}
}
function rR(e, t) {
	let n = e.indexOf(t);
	if (!(n < 0)) return e.slice(Math.max(0, n - 6), n + t.length + 12);
}
function iR(e, t) {
	let n = e?.chat;
	if (Array.isArray(n)) for (let e = 0; e < n.length; e++) {
		let r = n[e];
		if ((typeof r?.content == "string" ? r.content : nR(r?.content)).includes(t)) return {
			role: String(r.role ?? "?"),
			indexFromEnd: n.length - 1 - e
		};
	}
}
function aR(e) {
	let t = nR(e);
	return {
		length: t.length,
		comment: t.includes(eR),
		commentIntact: t.includes("<!--TRPG-PROBE-COMMENT") && t.includes("-->"),
		inject: t.includes(tR),
		commentSnippet: rR(t, eR),
		injectSnippet: rR(t, tR),
		injectAt: iR(e, tR)
	};
}
// src/probes/llmLogAudit.ts
function oR(e) {
	if (e && typeof e == "object") {
		let t = e;
		return t.id ?? t.key ?? t.logId ?? t.name;
	}
	return e;
}
async function sR() {
	let e = (await m())?.api?.dev?.llmApiLogs;
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
	let o = aR(await e.getRaw(oR(r)));
	return a.scan = o, a.markers = [eR, tR], {
		status: "info",
		summary: `最近一次请求原文：${o.comment ? `含注释标记${o.commentIntact ? "（符号完整）" : "（符号被改）"}` : "无注释标记"}；${o.inject ? "含注入标记" : "无注入标记"}`,
		detail: a
	};
}
// src/probes/promptProbes.ts
var cR = "comment", lR = "注释是否进入发给 AI 的请求", uR = "inject", dR = "提示词注入是否生效", fR = "input", pR = "写入与读取输入框", mR = "tavern-trpg-assistant_probe", hR = 1, gR = 0;
function _R(e) {
	return e?.dryRun === !0;
}
function vR(e) {
	let t = !1, n = !1, r = "", i = [], a = {}, o = (e) => (t) => {
		i.push({
			event: e,
			dryRun: _R(t),
			...aR(t)
		});
	}, s = () => {
		let e = i.filter((e) => !e.dryRun);
		if (r !== "quiet") {
			if (!e.length) t && wL(cR, lR, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）"), n && wL(uR, dR, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）");
			else {
				if (t) {
					let n = e.find((e) => e.comment), i = e.some((e) => e.commentIntact);
					wL(cR, lR, n && i ? "pass" : "fail", n ? i ? "注释原样进入了请求（<!-- --> 完整保留）" : "标记文字进入了请求，但 <!-- --> 符号被改动或删除" : "请求中没有找到注释内容（注释被删除）", {
						runType: r,
						captures: e,
						message: a
					}), t = !1;
				}
				if (n) {
					let t = e.find((e) => e.inject);
					wL(uR, dR, t ? "pass" : "fail", t ? `注入文本进入了请求${t.injectAt ? `（${t.injectAt.role} 消息，距末尾 ${t.injectAt.indexFromEnd} 条）` : ""}` : "请求中没有找到注入文本", {
						runType: r,
						captures: e
					}), n = !1, c();
				}
			}
		}
	}, c = () => {
		let t = e.extension_prompt_types?.IN_CHAT ?? hR, n = e.extension_prompt_roles?.SYSTEM ?? gR;
		e.setExtensionPrompt?.(mR, "", t, 0, !1, n);
	}, l = () => {
		let t = h(e, "CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready"), n = h(e, "GENERATE_AFTER_COMBINE_PROMPTS", "generate_after_combine_prompts"), c = h(e, "GENERATE_AFTER_DATA", "generate_after_data");
		g(e, t, o(t)), g(e, n, o(n)), g(e, c, o(c)), g(e, h(e, "GENERATION_STARTED", "generation_started"), (e, t, n) => {
			n !== !0 && (r = String(e ?? ""), i = []);
		});
		let l = () => s();
		g(e, h(e, "GENERATION_ENDED", "generation_ended"), l), g(e, h(e, "GENERATION_STOPPED", "generation_stopped"), l), g(e, h(e, "MESSAGE_SENT", "message_sent"), (t) => {
			let n = e.chat[Number(t)];
			a.storedInChat = !!n?.mes?.includes(eR);
		}), g(e, h(e, "USER_MESSAGE_RENDERED", "user_message_rendered"), (e) => {
			let t = document.querySelector(`.mes[mesid="${Number(e)}"] .mes_text`);
			t && (a.visibleTextHasMarker = !!t.textContent?.includes(eR), a.htmlHasComment = t.innerHTML.includes(`<!--${eR}`));
		});
	}, u = {
		id: cR,
		title: lR,
		hint: "点「写入测试注释」后，自己发送这条消息（需要已连接模型）。发送完成后自动判定；楼层里应看不到注释文字。",
		actions: [{
			label: "写入测试注释到输入框",
			run: () => TL(cR, lR, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let n = `<!--${eR} 探针-->`;
				_(e, e.value ? `${e.value}\n${n}` : `测试 ${n}`), t = !0, wL(cR, lR, "waiting", "已写入。请发送这条消息，等 AI 回复结束后自动判定");
			})
		}]
	};
	u.actions.push({
		label: "从 TauriTavern 请求日志核对",
		run: () => TL(cR, lR, async () => {
			let e = await sR();
			wL(cR, lR, e.status, e.summary, {
				runType: r,
				audit: e.detail,
				message: a
			});
		})
	});
	let d = {
		id: uR,
		title: dR,
		hint: "点「注入探针」后发送任意消息。可以和上一项同一次发送完成判定。测完请点「清除注入」。",
		actions: [{
			label: "注入探针",
			run: () => TL(uR, dR, () => {
				if (!e.setExtensionPrompt) throw Error("宿主没有 setExtensionPrompt");
				let t = e.extension_prompt_types?.IN_CHAT ?? hR, r = e.extension_prompt_roles?.SYSTEM ?? gR;
				e.setExtensionPrompt(mR, `[${tR}] 这是探针注入文本`, t, 0, !1, r), n = !0, wL(uR, dR, "waiting", "已注入（IN_CHAT，深度 0）。请发送一条消息，判定后会自动清除", { enumsFromContext: !!e.extension_prompt_types });
			})
		}, {
			label: "清除注入",
			run: () => TL(uR, dR, () => {
				c(), n = !1, wL(uR, dR, "idle", "已清除注入");
			})
		}]
	}, p = {
		id: fR,
		title: pR,
		hint: "自动写入一段文字、读回校验，然后恢复原内容（不会发送）。",
		actions: [{
			label: "运行输入框测试",
			run: () => TL(fR, pR, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let t = e.value, n = `${t}[TRPG-PROBE-INPUT]`;
				_(e, n);
				let r = e.value;
				_(e, t);
				let i = e.value === t;
				wL(fR, pR, r === n && i ? "pass" : "fail", r === n ? i ? "写入、读回、恢复都正常" : "写入正常，但恢复失败" : "写入后读回的内容不一致", {
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
		p
	];
}
// src/probes/storageProbe.ts
var yR = "storage", bR = "本地存储与持久性", xR = `${u}-m0`, SR = 4194304;
function CR() {
	return new Promise((e, t) => {
		let n = indexedDB.open(xR, 1);
		n.onupgradeneeded = () => n.result.createObjectStore("kv"), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
	});
}
function wR(e, t, n) {
	return new Promise((r, i) => {
		let a = n(e.transaction("kv", t).objectStore("kv"));
		a.onsuccess = () => r(a.result), a.onerror = () => i(a.error);
	});
}
function TR(e) {
	let t = () => TL(yR, bR, async () => {
		let t = await CR(), n = await wR(t, "readonly", (e) => e.get("boot")), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			count: (n?.count ?? 0) + 1,
			firstAt: n?.firstAt ?? r,
			lastAt: r
		};
		await wR(t, "readwrite", (e) => e.put(i, "boot"));
		let a = !!await wR(t, "readonly", (e) => e.get("blob"));
		a || await wR(t, "readwrite", (e) => e.put(new Uint8Array(SR), "blob"));
		let o = await wR(t, "readonly", (e) => e.get("blob"));
		t.close();
		let s = await navigator.storage?.persisted?.() ?? null, c = await navigator.storage?.estimate?.() ?? null, l = e.extensionSettings[u] ??= {}, d = Number(l.probeBootCount ?? 0);
		l.probeBootCount = d + 1, e.saveSettingsDebounced(), wL(yR, bR, "info", `IndexedDB 第 ${i.count} 次启动读写正常；刷新页面后次数应增加`, {
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
				previousBootCount: d,
				nowBootCount: d + 1
			},
			localforagePresent: !!window.SillyTavern?.libs?.localforage
		});
	});
	return {
		id: yR,
		title: bR,
		hint: "每次启动自动读写 IndexedDB（含 4MB 数据）与扩展设置。完全退出再打开应用后，启动次数应继续累加，4MB 数据应已存在。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/tauriProbe.ts
var ER = "tauri", DR = "TauriTavern 扩展接口", OR = `${u}-m0`, kR = "/scripts/tauritavern/layout-kit.js", AR = [
	"current",
	"getCurrent",
	"active",
	"handle",
	"currentChat"
];
function jR(e, t) {
	if (typeof e == "function") return "function";
	if (typeof e != "object" || !e) return typeof e;
	if (t <= 0) return "object";
	let n = {};
	for (let r of Object.keys(e)) n[r] = jR(e[r], t - 1);
	return n;
}
async function MR(e, t) {
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
function NR(e) {
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
function PR(e) {
	let t = e;
	return t.ok ? {
		ok: !0,
		shape: NR(t.value)
	} : t;
}
async function FR(e) {
	if (typeof e.searchMessages == "function" || e.store) return {
		handle: e,
		via: "api.chat 本身"
	};
	let t = e.current;
	if (t && typeof t.handle == "function") {
		let e = await MR("api.chat.current.handle()", () => t.handle.call(t));
		if (e.ok && e.value && typeof e.value == "object") return {
			handle: e.value,
			via: "api.chat.current.handle()"
		};
	}
	for (let t of AR) {
		let n = e[t];
		if (typeof n == "function") {
			let r = await MR(`api.chat.${t}()`, () => n.call(e)), i = r.value;
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
function IR() {
	let e = () => TL(ER, DR, async () => {
		if (!window.__TAURITAVERN__) {
			wL(ER, DR, "info", "不是 TauriTavern，跳过（扩展将使用酒馆通用能力）");
			return;
		}
		let e = (await m())?.api ?? {}, t = e.chat ?? {}, n = { apiShape: jR(e, 3) };
		n.layoutKitExports = await MR("layout-kit 导入", () => import(
			/* @vite-ignore */
			kR
).then((e) => Object.keys(e)));
		let { handle: r, via: i } = await FR(t);
		if (n.handleVia = i, r) {
			let e = r;
			n.handleShape = jR(r, 2), e.searchMessages && (n.searchMessages = PR(await MR("searchMessages", () => e.searchMessages({
				query: "你",
				limit: 3
			}))));
			let t = e.locate?.findLastMessage;
			if (t && (n.findLastMessage = PR(await MR("findLastMessage", () => t.call(e.locate, {
				role: "user",
				scanLimit: 50
			})))), e.store?.setJson && e.store.getJson) {
				let t = { at: (/* @__PURE__ */ new Date()).toISOString() };
				n.storeSet = await MR("store.setJson", () => e.store.setJson({
					namespace: OR,
					key: "probe",
					value: t
				})), n.storeGet = await MR("store.getJson", () => e.store.getJson({
					namespace: OR,
					key: "probe"
				})), e.store.listKeys && (n.storeKeys = await MR("store.listKeys", () => e.store.listKeys({ namespace: OR }))), e.store.deleteJson && (n.storeDelete = await MR("store.deleteJson", () => e.store.deleteJson({
					namespace: OR,
					key: "probe"
				})));
			}
			e.metadata?.get && (n.metadata = PR(await MR("metadata.get", () => e.metadata.get()))), typeof e.stableId == "function" && (n.stableId = PR(await MR("stableId", () => e.stableId.call(e)))), typeof e.summary == "function" && (n.summary = PR(await MR("summary", () => e.summary.call(e))));
		}
		let a = e.extension?.store;
		if (a?.setJson && a.getJson) {
			let e = { at: (/* @__PURE__ */ new Date()).toISOString() }, t = {
				namespace: OR,
				key: "probe"
			};
			n.extStoreSet = await MR("extension.store.setJson", () => a.setJson({
				...t,
				value: e
			})), n.extStoreGet = await MR("extension.store.getJson", () => a.getJson(t)), a.listKeys && (n.extStoreKeys = await MR("extension.store.listKeys", () => a.listKeys({ namespace: OR }))), a.deleteJson && (n.extStoreDelete = await MR("extension.store.deleteJson", () => a.deleteJson(t)));
		}
		wL(ER, DR, "info", r ? `找到 handle（${i}）；各接口调用结果见详情` : "没有找到获取 handle 的方式；接口结构见详情", n);
	});
	return {
		id: ER,
		title: DR,
		hint: "仅 TauriTavern 有效。请分别在「已打开聊天」和「未打开聊天」两种状态下点「重新检测」各测一次。",
		actions: [{
			label: "重新检测",
			run: e
		}],
		start: e
	};
}
// src/probes/index.ts
function LR(e) {
	return [
		GL(),
		$L(),
		jL(e),
		...vR(e),
		TR(e),
		zL(e),
		FL(e),
		IR()
	];
}
// src/ui/kit/SelectField.vue
var RR = /* @__PURE__ */ z({
	__name: "SelectField",
	props: /*@__PURE__*/ Qa({
		options: {},
		placeholder: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = e, n = xo(e, "modelValue"), r = Ir("portalTarget", void 0), i = J(() => t.options.map((e) => typeof e == "string" ? {
			value: e,
			label: e
		} : e));
		return (t, a) => (H(), W(L(GN), {
			modelValue: n.value,
			"onUpdate:modelValue": a[0] ||= (e) => n.value = e
		}, {
			default: R(() => [K(L(lP), {
				class: "trpg-select-trigger",
				"aria-label": e.label
			}, {
				default: R(() => [K(L(uP), { placeholder: e.placeholder ?? "请选择" }, null, 8, ["placeholder"]), K(OT, {
					name: "caret-down",
					size: 14
				})]),
				_: 1
			}, 8, ["aria-label"]), K(L(cP), { to: L(r) }, {
				default: R(() => [K(L(rP), {
					class: "trpg-select-content",
					position: "popper",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: R(() => [K(L(dP), { class: "trpg-select-viewport" }, {
						default: R(() => [(H(!0), U(V, null, ja(i.value, (e) => (H(), W(L(oP), {
							key: e.value,
							value: e.value,
							class: "trpg-select-item"
						}, {
							default: R(() => [K(L(sP), null, {
								default: R(() => [Vs(M(e.label), 1)]),
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
		}, 8, ["modelValue"]));
	}
}), zR = ["title"], BR = [
	"aria-checked",
	"aria-label",
	"aria-description",
	"disabled",
	"data-on"
], VR = /* @__PURE__ */ z({
	__name: "Switch",
	props: /*@__PURE__*/ Qa({
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
		let t = xo(e, "modelValue");
		function n() {
			t.value = !t.value;
		}
		return (r, i) => (H(), U("span", {
			class: "trpg-switch-wrap",
			title: e.lockedReason
		}, [e.lockedReason ? (H(), W(OT, {
			key: 0,
			name: "lock",
			size: 14
		})) : q("", !0), G("button", {
			class: "trpg-switch",
			type: "button",
			role: "switch",
			"aria-checked": t.value,
			"aria-label": e.label,
			"aria-description": e.lockedReason,
			disabled: e.disabled,
			"data-on": t.value,
			onClick: n
		}, [...i[0] ||= [G("span", { class: "trpg-switch__thumb" }, null, -1)]], 8, BR)], 8, zR));
	}
}), HR = ["data-testid"], UR = { class: "trpg-list" }, WR = /* @__PURE__ */ z({
	__name: "LabModalPage",
	props: { level: {} },
	setup(e) {
		let t = e, n = gE();
		function r() {
			n.push({
				key: `lab:${t.level + 1}`,
				title: `第 ${t.level + 1} 页`,
				component: xn(WR),
				props: { level: t.level + 1 }
			});
		}
		async function i() {
			await VE({
				title: "测试确认",
				message: "这是弹窗内的确认页，「‹」或 Esc 即取消。",
				confirmLabel: "确认"
			});
		}
		return (t, n) => (H(), U("div", {
			class: "page-stack",
			"data-testid": `lab-page-${e.level}`
		}, [
			G("p", null, [
				Vs("这是演示弹窗的第 " + M(e.level) + " 页。点下面的术语在", 1),
				K(IF, { onOpen: r }, {
					default: R(() => [...n[0] ||= [Vs("同一个弹窗里", -1)]]),
					_: 1
				}),
				n[1] ||= Vs("前进一页。", -1)
			]),
			G("ul", UR, [(H(), U(V, null, ja(30, (e) => G("li", {
				key: e,
				class: "trpg-row"
			}, [G("span", null, "演示行 " + M(e), 1)])), 64))]),
			G("button", {
				class: "trpg-btn",
				type: "button",
				onClick: i
			}, "弹窗内确认")
		], 8, HR));
	}
}), GR = { class: "probe" }, KR = { class: "lab" }, qR = { class: "lab__row" }, JR = {
	class: "probe__hint",
	"data-testid": "select-model"
}, YR = { class: "lab__row" }, XR = { class: "trpg-check" }, ZR = { class: "lab__row" }, QR = { class: "trpg-row" }, $R = { class: "trpg-row__main" }, ez = { "data-testid": "switch-state" }, tz = {
	class: "probe__hint",
	"data-testid": "menu-pick"
}, nz = { class: "probe__actions" }, rz = { class: "probe__head" }, iz = { class: "probe__title" }, az = ["data-status"], oz = { class: "probe__hint" }, sz = { class: "probe__actions" }, cz = ["onClick"], lz = ["onClick"], uz = /* @__PURE__ */ z({
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
		], n = /* @__PURE__ */ I(""), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I("a"), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = gE(), u = vT();
		function d() {
			l.open({
				key: "lab:1",
				title: "演示弹窗",
				component: xn(WR),
				props: { level: 1 }
			});
		}
		async function f() {
			let e = await VE({
				title: "卸载演示",
				message: "确定要卸载吗？",
				confirmLabel: "卸载",
				danger: !0
			});
			u.info(e ? "已确认" : "已取消");
		}
		function p(e, t, n) {
			wL(e, t, n, n === "pass" ? "人工确认：通过" : "人工确认：不通过");
		}
		return (e, l) => (H(), U("section", GR, [
			l[14] ||= G("h3", { class: "probe__title" }, "界面实测（需要你目测后点结果）", -1),
			G("div", KR, [
				G("div", qR, [
					K(RR, {
						modelValue: n.value,
						"onUpdate:modelValue": l[0] ||= (e) => n.value = e,
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
					G("p", JR, "下拉当前值：" + M(n.value || "未选") + " / " + M(r.value || "未选"), 1),
					K(RR, {
						modelValue: r.value,
						"onUpdate:modelValue": l[1] ||= (e) => r.value = e,
						label: "测试下拉（3 项）",
						options: [
							"红",
							"金",
							"墨"
						],
						placeholder: "下拉测试：选择颜色"
					}, null, 8, ["modelValue"])
				]),
				G("div", YR, [
					K(jT, {
						modelValue: i.value,
						"onUpdate:modelValue": l[2] ||= (e) => i.value = e,
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
					G("label", XR, [Nr(G("input", {
						"onUpdate:modelValue": l[3] ||= (e) => a.value = e,
						type: "checkbox"
					}, null, 512), [[hu, a.value]]), l[10] ||= Vs(" 勾选框测试", -1)]),
					Nr(G("input", {
						"onUpdate:modelValue": l[4] ||= (e) => o.value = e,
						class: "trpg-input",
						type: "text",
						placeholder: "输入测试：中文 / English"
					}, null, 512), [[mu, o.value]])
				]),
				G("div", ZR, [
					G("div", QR, [
						G("span", $R, [l[11] ||= Vs("开关演示：", -1), G("span", ez, M(s.value ? "开" : "关"), 1)]),
						K(VR, {
							modelValue: s.value,
							"onUpdate:modelValue": l[5] ||= (e) => s.value = e,
							label: "演示开关"
						}, null, 8, ["modelValue"]),
						K(_P, {
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
							onSelect: l[6] ||= (e) => c.value = e
						})
					]),
					G("p", tz, "菜单选择：" + M(c.value || "无"), 1),
					G("p", null, [l[13] ||= Vs("下划线术语：", -1), K(IF, { onOpen: d }, {
						default: R(() => [...l[12] ||= [Vs("点我打开演示弹窗", -1)]]),
						_: 1
					})]),
					G("div", nz, [
						G("button", {
							class: "trpg-btn",
							type: "button",
							onClick: f
						}, "危险确认"),
						G("button", {
							class: "trpg-btn",
							type: "button",
							onClick: l[7] ||= (e) => L(u).success("已保存")
						}, "成功提示"),
						G("button", {
							class: "trpg-btn",
							type: "button",
							onClick: l[8] ||= (e) => L(u).undoable("已删除一项", () => {
								L(u).info("已撤销");
							})
						}, "可撤销提示"),
						G("button", {
							class: "trpg-btn",
							type: "button",
							onClick: l[9] ||= (e) => L(u).error("下载失败：网络中断")
						}, "失败提示")
					])
				])
			]),
			(H(), U(V, null, ja(t, (e) => G("div", {
				key: e.id,
				class: "probe"
			}, [
				G("div", rz, [G("h4", iz, M(e.title), 1), G("span", {
					class: "trpg-badge",
					"data-status": L(CL)[e.id]?.status ?? "idle"
				}, M(L(CL)[e.id]?.status ?? "待测"), 9, az)]),
				G("p", oz, M(e.how), 1),
				G("div", sz, [G("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => p(e.id, e.title, "pass")
				}, "通过", 8, cz), G("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => p(e.id, e.title, "fail")
				}, "不通过", 8, lz)])
			])), 64))
		]));
	}
}), dz = { class: "probe__head" }, fz = { class: "probe__title" }, pz = ["data-status"], mz = { class: "probe__hint" }, hz = {
	key: 0,
	class: "probe__summary"
}, gz = { class: "probe__actions" }, _z = ["onClick"], vz = { key: 1 }, yz = { class: "report-bar" }, bz = { role: "status" }, xz = /* @__PURE__ */ z({
	__name: "ProbeList",
	props: { ctx: {} },
	setup(e) {
		let t = e.ctx, n = LR(t), r = /* @__PURE__ */ I("");
		async function i() {
			return JSON.stringify(EL(await AL(t)), null, 2);
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
			let e = t.extensionSettings[u] ??= {};
			e.m0Report = JSON.parse(await i()), t.saveSettingsDebounced(), r.value = "已保存到扩展设置";
		}
		for (let e of n) e.start?.();
		return (e, t) => (H(), U("div", null, [
			(H(!0), U(V, null, ja(L(n), (e) => (H(), U("section", {
				key: e.id,
				class: "probe"
			}, [
				G("div", dz, [G("h3", fz, M(e.title), 1), G("span", {
					class: "trpg-badge",
					"data-status": L(CL)[e.id]?.status ?? "idle"
				}, M(L(CL)[e.id]?.status ?? "待测"), 9, pz)]),
				G("p", mz, M(e.hint), 1),
				L(CL)[e.id] ? (H(), U("p", hz, M(L(CL)[e.id].summary), 1)) : q("", !0),
				G("div", gz, [(H(!0), U(V, null, ja(e.actions, (e) => (H(), U("button", {
					key: e.label,
					class: "trpg-btn",
					type: "button",
					onClick: (t) => e.run()
				}, M(e.label), 9, _z))), 128))]),
				L(CL)[e.id]?.detail === void 0 ? q("", !0) : (H(), U("details", vz, [t[2] ||= G("summary", null, "详情", -1), G("pre", null, M(JSON.stringify(L(CL)[e.id].detail, null, 2)), 1)]))
			]))), 128)),
			K(uz),
			G("div", yz, [
				G("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: t[0] ||= (e) => a()
				}, "复制测试报告"),
				G("button", {
					class: "trpg-btn",
					type: "button",
					onClick: t[1] ||= (e) => o()
				}, "保存报告到扩展设置"),
				G("span", bz, M(r.value), 1)
			])
		]));
	}
}), Sz = {
	key: 0,
	class: "page-stack"
}, Cz = { class: "trpg-list" }, wz = { class: "trpg-row" }, Tz = { class: "trpg-row" }, Ez = { class: "trpg-row__main" }, Dz = { class: "trpg-row__meta" }, Oz = { key: 1 }, kz = {
	key: 0,
	class: "trpg-diag",
	"data-testid": "diagnostics"
}, Az = {
	key: 1,
	class: "page-stack"
}, jz = { class: "trpg-group" }, Mz = /* @__PURE__ */ z({
	__name: "SettingsView",
	setup(e) {
		let t = Ir("stCtx"), n = /* @__PURE__ */ I(null);
		return (e, r) => n.value === null ? (H(), U("div", Sz, [G("ul", Cz, [G("li", wz, [r[4] ||= G("div", { class: "trpg-row__main" }, [G("div", { class: "trpg-row__title" }, "诊断"), G("div", { class: "trpg-row__meta" }, "自检与兼容性测试，遇到问题时用来收集信息")], -1), G("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[0] ||= (e) => n.value = "diag"
		}, [r[3] ||= Vs("打开", -1), K(OT, {
			name: "caret-right",
			size: 14
		})])]), G("li", Tz, [G("div", Ez, [r[5] ||= G("div", { class: "trpg-row__title" }, "关于", -1), G("div", Dz, "版本 " + M(L(mw)) + " · 开源许可与致谢", 1)]), G("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[1] ||= (e) => n.value = "about"
		}, [r[6] ||= Vs("打开", -1), K(OT, {
			name: "caret-right",
			size: 14
		})])])])])) : (H(), U("div", Oz, [G("button", {
			class: "subpage-back",
			type: "button",
			onClick: r[2] ||= (e) => n.value = null
		}, [K(OT, {
			name: "caret-left",
			size: 16
		}), r[7] ||= Vs("设置", -1)]), n.value === "diag" ? (H(), U("div", kz, [L(t) ? (H(), W(xz, {
			key: 0,
			ctx: L(t)
		}, null, 8, ["ctx"])) : q("", !0)])) : (H(), U("div", Az, [
			G("h2", jz, "TRPG 跑团助手 " + M(L(mw)), 1),
			r[8] ||= G("p", { class: "page-intro" }, "代码以 AGPL-3.0 许可发布，源码在 GitHub：didhogg/tavern-trpg-assistant。", -1),
			r[9] ||= G("p", { class: "page-intro" }, "界面图标：Phosphor Icons（MIT）。规则数据的来源与许可见各条目的出处标注与随包附带的数据声明。", -1)
		]))]));
	}
}), Nz = { class: "trpg-head__chips" }, Pz = { class: "trpg-chip__name" }, Fz = /* @__PURE__ */ z({
	__name: "HeaderChips",
	props: { layout: {} },
	setup(e) {
		let t = e, n = Xw(), r = Qw(), i = vT(), a = xT(), o = J(() => n.booted && r.hasCampaign), s = J(() => [...o.value ? [{
			key: "saves",
			label: "存档"
		}] : [], {
			key: "close",
			label: "收起助手"
		}]), c = J(() => r.currentSave?.name ?? "存档");
		function l(e) {
			e === "saves" ? YI() : a.windowOpen = !1;
		}
		let u = () => i.info("另一个窗口正在使用这份数据，这里只能查看");
		return (e, n) => (H(), U("div", Nz, [o.value ? (H(), U(V, { key: 0 }, [
			t.layout === "narrow" ? q("", !0) : (H(), U("button", {
				key: 0,
				class: "trpg-pill trpg-chip",
				type: "button",
				"data-testid": "save-chip",
				"aria-haspopup": "dialog",
				onClick: n[0] ||= (...e) => L(YI) && L(YI)(...e)
			}, [G("span", Pz, M(c.value), 1), K(OT, {
				name: "caret-down",
				size: 14
			})])),
			L(r).dirty && !L(r).readOnly ? (H(), U("button", {
				key: 1,
				class: "trpg-btn trpg-btn--small trpg-btn--primary",
				type: "button",
				"data-testid": "save-button",
				onClick: n[1] ||= (e) => L(ZI)()
			}, "● 保存")) : q("", !0),
			L(r).readOnly ? (H(), U("button", {
				key: 2,
				class: "trpg-badge trpg-badge--button",
				"data-tone": "warn",
				type: "button",
				onClick: u
			}, "只读")) : q("", !0)
		], 64)) : q("", !0), t.layout === "narrow" ? (H(), W(_P, {
			key: 1,
			label: "助手",
			items: s.value,
			onSelect: l
		}, null, 8, ["items"])) : q("", !0)]));
	}
}), Iz = "trpg-assistant:window";
function Lz(e, t, n) {
	let r = Math.min(Math.max(e.w, 360), Math.max(360, t)), i = Math.min(Math.max(e.h, 480), Math.max(480, n));
	return {
		w: r,
		h: i,
		x: Math.min(Math.max(e.x, 0), Math.max(0, t - r)),
		y: Math.min(Math.max(e.y, 0), Math.max(0, n - i))
	};
}
function Rz(e, t) {
	let n = Math.min(960, e - 32), r = Math.min(640, t - 32);
	return Lz({
		w: n,
		h: r,
		x: Math.round((e - n) / 2),
		y: Math.round((t - r) / 2)
	}, e, t);
}
function zz(e, t) {
	try {
		let n = localStorage.getItem(Iz);
		if (n) {
			let r = JSON.parse(n);
			if ([
				r.x,
				r.y,
				r.w,
				r.h
			].every(Number.isFinite)) return Lz(r, e, t);
		}
	} catch (e) {
		console.warn("[trpg-assistant] 读取窗口位置失败", e);
	}
	return Rz(e, t);
}
function Bz(e) {
	try {
		localStorage.setItem(Iz, JSON.stringify(e));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/MainWindow.vue?vue&type=script&setup=true&lang.ts
var Vz = ["data-layout", "data-fullscreen"], Hz = ["inert"], Uz = {
	key: 0,
	class: "trpg-side",
	"aria-label": "主导航"
}, Wz = {
	key: 0,
	class: "trpg-side__name"
}, Gz = { class: "trpg-side__list" }, Kz = [
	"aria-current",
	"title",
	"onClick"
], qz = { key: 0 }, Jz = { class: "trpg-side__list trpg-side__bottom" }, Yz = [
	"aria-current",
	"title",
	"onClick"
], Xz = { key: 0 }, Zz = { class: "trpg-main" }, Qz = { class: "trpg-head__title" }, $z = { class: "trpg-body" }, eB = {
	class: "trpg-content",
	tabindex: "-1"
}, tB = ["aria-pressed"], nB = {
	key: 0,
	class: "trpg-tabs",
	"aria-label": "主导航"
}, rB = ["aria-current", "onClick"], iB = /* @__PURE__ */ z({
	__name: "MainWindow",
	setup(e) {
		let t = xT(), n = gE(), r = [
			{
				id: "home",
				label: "首页",
				icon: "house"
			},
			{
				id: "library",
				label: "库",
				icon: "books",
				bottom: !0
			},
			{
				id: "settings",
				label: "设置",
				icon: "gear",
				bottom: !0
			}
		], i = {
			home: _L,
			library: SL,
			settings: Mz
		}, a = /* @__PURE__ */ I(window.innerWidth), o = /* @__PURE__ */ I(window.innerHeight), s = /* @__PURE__ */ I(zz(a.value, o.value)), c = /* @__PURE__ */ I(null), l = /* @__PURE__ */ I(s.value.w), u = J(() => a.value <= 480), d = J(() => l.value >= 720 ? "wide" : l.value > 480 ? "mid" : "narrow"), f = J(() => u.value ? {} : {
			left: `${s.value.x}px`,
			top: `${s.value.y}px`,
			width: `${s.value.w}px`,
			height: `${s.value.h}px`
		}), p = J(() => bT[t.page]), m = J(() => r.filter((e) => !e.bottom)), h = J(() => r.filter((e) => e.bottom)), g = FT({
			position: J({
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
			onEnd: () => Bz(s.value)
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
				t.removeEventListener("pointermove", c), t.removeEventListener("pointerup", l), t.removeEventListener("pointercancel", l), Bz(s.value);
			};
			t.addEventListener("pointermove", c), t.addEventListener("pointerup", l), t.addEventListener("pointercancel", l);
		}
		function y() {
			a.value = window.innerWidth, o.value = window.innerHeight, s.value = Lz(s.value, a.value, o.value);
		}
		function b(e) {
			(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s" && (e.preventDefault(), ZI());
		}
		let x;
		return ma(() => {
			window.addEventListener("resize", y), x = new ResizeObserver((e) => {
				let t = e[0]?.contentRect.width;
				t && (l.value = t);
			}), c.value && x.observe(c.value);
		}), _a(() => {
			window.removeEventListener("resize", y), x?.disconnect();
		}), (e, a) => (H(), U("section", {
			ref_key: "winEl",
			ref: c,
			class: "trpg-window",
			style: Oe(f.value),
			"data-layout": d.value,
			"data-fullscreen": u.value,
			role: "dialog",
			"aria-label": "TRPG 跑团助手",
			onKeydown: b
		}, [
			G("div", {
				class: "trpg-shell",
				inert: L(n).isOpen
			}, [d.value === "narrow" ? q("", !0) : (H(), U("nav", Uz, [
				G("div", {
					class: "trpg-side__brand",
					title: "拖动窗口",
					onPointerdown: _
				}, [K(OT, {
					name: "dice-five",
					size: 22
				}), d.value === "wide" ? (H(), U("span", Wz, "TRPG 跑团助手")) : q("", !0)], 32),
				G("ul", Gz, [(H(!0), U(V, null, ja(m.value, (e) => (H(), U("li", { key: e.id }, [G("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": L(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => L(t).go(e.id)
				}, [K(OT, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (H(), U("span", qz, M(e.label), 1)) : q("", !0)], 8, Kz)]))), 128))]),
				G("ul", Jz, [(H(!0), U(V, null, ja(h.value, (e) => (H(), U("li", { key: e.id }, [G("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": L(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => L(t).go(e.id)
				}, [K(OT, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (H(), U("span", Xz, M(e.label), 1)) : q("", !0)], 8, Yz)]))), 128))])
			])), G("div", Zz, [
				G("header", {
					class: "trpg-head",
					onPointerdown: a[1] ||= (e) => d.value === "narrow" ? _(e) : void 0
				}, [
					G("h1", Qz, M(p.value), 1),
					K(Fz, { layout: d.value }, null, 8, ["layout"]),
					d.value === "narrow" ? q("", !0) : (H(), U("button", {
						key: 0,
						class: "trpg-icon-btn",
						type: "button",
						"aria-label": "收起助手",
						onClick: a[0] ||= (e) => L(t).windowOpen = !1
					}, [K(OT, {
						name: "x",
						size: 18
					})]))
				], 32),
				G("div", $z, [G("main", eB, [(H(), W(Da(i[L(t).page])))]), G("button", {
					class: "trpg-dice-btn",
					type: "button",
					"aria-label": "掷骰",
					"aria-pressed": L(t).diceOpen,
					onClick: a[2] ||= (e) => L(t).diceOpen = !L(t).diceOpen
				}, [K(OT, {
					name: "dice-five",
					size: 28
				})], 8, tB)]),
				d.value === "narrow" ? (H(), U("nav", nB, [(H(), U(V, null, ja(r, (e) => G("button", {
					key: e.id,
					class: "trpg-tab",
					type: "button",
					"aria-current": L(t).page === e.id ? "page" : void 0,
					onClick: (n) => L(t).go(e.id)
				}, [K(OT, {
					name: e.icon,
					size: 22
				}, null, 8, ["name"]), G("span", null, M(e.label), 1)], 8, rB)), 64))])) : q("", !0)
			])], 8, Hz),
			K(SE),
			u.value ? q("", !0) : (H(), U("div", {
				key: 0,
				class: "trpg-resize",
				"aria-hidden": "true",
				onPointerdown: v
			}, null, 32))
		], 44, Vz));
	}
}), aB = { class: "trpg-root" }, oB = /* @__PURE__ */ z({
	__name: "App",
	props: {
		ctx: {},
		portalTarget: {}
	},
	setup(e) {
		let t = e;
		Fr("portalTarget", t.portalTarget), Fr("stCtx", t.ctx);
		let n = xT();
		return (e, t) => (H(), U("div", aB, [
			K(hE),
			L(n).windowOpen ? (H(), W(iB, { key: 0 })) : q("", !0),
			K(fE),
			K(TT)
		]));
	}
}), sB = ".trpg-btn{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);min-height:36px;color:var(--ink);font:inherit;cursor:pointer;white-space:nowrap;justify-content:center;align-items:center;gap:6px;padding:4px 14px;display:inline-flex}.trpg-btn:hover:not(:disabled){border-color:var(--primary)}.trpg-btn:disabled{opacity:.5;cursor:not-allowed}.trpg-btn--primary{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-btn--danger{background:var(--danger);color:#fffcf6;border-color:var(--danger)}.trpg-btn--quiet{background:0 0;border-color:#0000}.trpg-btn--small{min-height:30px;padding:2px 10px;font-size:13px}.trpg-icon-btn{border-radius:var(--radius-sm);min-width:36px;min-height:36px;color:inherit;cursor:pointer;background:0 0;border:1px solid #0000;justify-content:center;align-items:center;display:inline-flex}.trpg-icon-btn:hover{border-color:currentColor}.trpg-input{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);padding:4px 10px}.trpg-input:disabled{opacity:.6}textarea.trpg-input{resize:vertical;min-height:72px}.trpg-field{gap:4px;display:grid}.trpg-field__label{color:var(--ink-2);font-size:13px}.trpg-field__hint{color:var(--ink-2);font-size:12.5px}.trpg-field__error{color:var(--danger);font-size:12.5px}.trpg-select-trigger{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);cursor:pointer;justify-content:space-between;align-items:center;gap:8px;padding:4px 10px;display:inline-flex}.trpg-select-content,.trpg-menu{min-width:var(--reka-select-trigger-width,160px);background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);box-shadow:var(--shadow-float);z-index:100003;color:var(--ink)}.trpg-select-content{max-height:min(8 * 36px, var(--reka-select-content-available-height));overflow:hidden}.trpg-select-viewport{max-height:inherit;padding:4px;overflow-y:auto}.trpg-select-item,.trpg-menu__item{border-radius:var(--radius-xs);cursor:pointer;min-height:40px;color:var(--ink);justify-content:space-between;align-items:center;gap:12px;padding:4px 10px;display:flex}.trpg-menu{min-width:168px;padding:4px}.trpg-select-item[data-highlighted],.trpg-menu__item[data-highlighted]{background:var(--panel);outline:none}.trpg-select-item[data-state=checked]{color:var(--primary);font-weight:600}.trpg-menu__item--danger{color:var(--danger)}.trpg-menu__item[data-disabled]{opacity:.5;cursor:not-allowed}.trpg-menu__reason{color:var(--ink-2);font-size:12px}.trpg-seg{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);display:inline-flex;overflow:hidden}.trpg-seg button{min-height:34px;color:var(--ink);background:0 0;border:0;padding:2px 14px}.trpg-seg button+button{border-left:1px solid var(--line)}.trpg-seg button[aria-pressed=true]{background:var(--primary);color:var(--primary-ink)}.trpg-badge{border-radius:var(--radius-xs);background:var(--panel);border:1px solid var(--line);color:var(--ink-2);white-space:nowrap;padding:0 8px;font-size:12px;font-weight:600;line-height:20px;display:inline-block}.trpg-badge[data-tone=ok],.trpg-badge[data-status=pass]{color:var(--ok);border-color:var(--ok)}.trpg-badge[data-tone=danger],.trpg-badge[data-status=fail],.trpg-badge[data-status=error]{color:var(--danger);border-color:var(--danger)}.trpg-badge[data-tone=warn],.trpg-badge[data-status=waiting]{color:var(--unsaved);border-color:var(--unsaved)}.trpg-badge[data-tone=gold]{color:var(--gold);border-color:var(--gold)}.trpg-pill{border:1px solid var(--line);background:var(--card);border-radius:999px;align-items:center;gap:4px;min-height:30px;padding:0 12px;display:inline-flex}.trpg-switch-wrap{color:var(--ink-2);align-items:center;gap:6px;min-height:44px;display:inline-flex}.trpg-switch{border:2px solid var(--line);background:0 0;border-radius:999px;width:42px;height:24px;padding:0;transition:background .16s,border-color .16s;position:relative}.trpg-switch__thumb{background:var(--ink-2);border-radius:50%;width:16px;height:16px;transition:transform .16s,background .16s;position:absolute;top:2px;left:2px}.trpg-switch[data-on=true]{background:var(--primary);border-color:var(--primary)}.trpg-switch[data-on=true] .trpg-switch__thumb{background:var(--primary-ink);transform:translate(18px)}.trpg-switch:disabled{opacity:.55;cursor:not-allowed}.trpg-check{cursor:pointer;align-items:center;gap:8px;min-height:36px;display:inline-flex}.trpg-check[data-disabled=true]{opacity:.6;cursor:not-allowed}.trpg-check input{width:18px;height:18px;accent-color:var(--primary);flex:none;margin:0}.trpg-term{color:var(--ink);text-align:left;text-underline-offset:4px;cursor:pointer;background:0 0;border:0;padding:0;-webkit-text-decoration:underline dotted;text-decoration:underline dotted;text-decoration-thickness:1.5px;display:inline}.trpg-term:hover,.trpg-term:focus-visible{text-decoration-style:solid;-webkit-text-decoration-color:var(--gold);text-decoration-color:var(--gold)}.trpg-list{margin:0;padding:0;list-style:none}.trpg-row{border-bottom:1px solid var(--line);align-items:center;gap:12px;min-height:52px;padding:6px 4px;display:flex}.trpg-row__main{flex:1;min-width:0}.trpg-row__title{overflow-wrap:anywhere;font-weight:600}.trpg-row__meta{color:var(--ink-2);font-size:12.5px}.trpg-row__end{flex:none;align-items:center;gap:8px;display:flex}.trpg-group{font-family:var(--font-serif);color:var(--ink-2);margin:16px 0 4px;font-size:15px}.trpg-skeleton{background:linear-gradient(90deg, var(--panel), var(--line), var(--panel));opacity:.6;border-radius:4px;height:14px}.trpg-empty{text-align:center;color:var(--ink-2);padding:24px 8px}.trpg-progress{background:var(--panel);border-radius:3px;width:120px;height:6px;overflow:hidden}.trpg-progress>span{background:var(--primary);height:100%;transition:width .2s;display:block}.trpg-icon{vertical-align:-3px;flex:none}.trpg-toasts{left:50%;bottom:max(16px, env(safe-area-inset-bottom));z-index:100005;gap:8px;width:min(92vw,420px);display:grid;position:fixed;transform:translate(-50%)}.trpg-toast{border-radius:var(--radius-sm);background:var(--chrome);color:var(--chrome-ink);border-left:4px solid var(--gold);box-shadow:var(--shadow-float);align-items:center;gap:10px;padding:10px 12px;display:flex}.trpg-toast[data-kind=error]{border-left-color:var(--danger)}.trpg-toast[data-kind=success]{border-left-color:var(--ok)}.trpg-toast__text{flex:1}.trpg-toast button{color:var(--gold);background:0 0;border:0;min-height:32px;padding:0 8px;font-weight:600}@media (width<=480px){.trpg-toasts{bottom:calc(64px + env(safe-area-inset-bottom))}}.trpg-toast-enter-from,.trpg-toast-leave-to{opacity:0;transform:translateY(8px)}.trpg-toast-enter-active,.trpg-toast-leave-active{transition:opacity .16s,transform .16s}.trpg-modal-root{pointer-events:none;z-index:20;position:absolute;inset:0}.trpg-modal{background:var(--scrim);pointer-events:auto;justify-content:center;align-items:center;padding:16px;display:flex;position:absolute;inset:0}.trpg-modal__card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:min(640px,100%);height:min(80%,640px);box-shadow:var(--shadow-float);flex-direction:column;animation:.16s ease-out trpg-pop;display:flex;overflow:hidden}.trpg-modal[data-variant=drawer]{justify-content:flex-end;padding:0}.trpg-modal[data-variant=drawer] .trpg-modal__card{border-radius:0;width:min(440px,100%);height:100%;animation:.2s ease-out trpg-slide}.trpg-modal[data-variant=confirm] .trpg-modal__card{width:min(440px,100%);height:auto;max-height:90%}.trpg-modal[data-variant=confirm] .trpg-modal__page{position:relative}.trpg-modal__head{border-bottom:1px solid var(--line);background:var(--panel);flex:none;align-items:center;gap:8px;min-height:52px;padding:4px 8px 4px 16px;display:flex}.trpg-modal__title{min-width:0;font-family:var(--font-serif);text-overflow:ellipsis;white-space:nowrap;flex:1;margin:0;font-size:17px;overflow:hidden}.trpg-modal__back{border-radius:var(--radius-sm);max-width:40%;min-height:36px;color:var(--primary);white-space:nowrap;background:0 0;border:0;align-items:center;gap:2px;margin-left:-8px;padding:0 8px;display:inline-flex}.trpg-modal__back span{text-overflow:ellipsis;overflow:hidden}.trpg-modal__back:hover{background:var(--card)}.trpg-modal__pages{flex:1;min-height:0;position:relative}.trpg-modal__page{padding:16px;transition:opacity .16s,transform .16s,visibility;position:absolute;inset:0;overflow:auto}.trpg-modal__page.is-under{opacity:0;visibility:hidden;pointer-events:none;transition:opacity .16s,transform .16s,visibility 0s .16s;transform:translate(-24px)}.trpg-page-enter-from,.trpg-page-leave-to{opacity:0;transform:translate(24px)}.trpg-page-enter-active,.trpg-page-leave-active{transition:opacity .16s,transform .16s}.trpg-modal[data-variant=confirm] .trpg-page-leave-active{position:absolute;inset:0}@keyframes trpg-pop{0%{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}@keyframes trpg-slide{0%{opacity:0;transform:translate(32px)}to{opacity:1;transform:none}}.trpg-confirm{gap:12px;display:grid}.trpg-confirm__message{margin:0}.trpg-confirm__details{color:var(--ink-2);margin:0;padding-left:18px}.trpg-confirm__actions{justify-content:flex-end;gap:8px;margin-top:4px;display:flex}.trpg-window[data-layout=narrow] .trpg-modal{background:var(--paper);align-items:stretch;padding:0}.trpg-window[data-layout=narrow] .trpg-modal__card{border:0;border-radius:0;width:100%;height:100%}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm]{background:var(--scrim);align-items:flex-end}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm] .trpg-modal__card{border-radius:var(--radius) var(--radius) 0 0;height:auto}.trpg-window[data-layout=narrow] .trpg-confirm__actions{flex-direction:column-reverse}.trpg-window[data-layout=narrow] .trpg-confirm__actions .trpg-btn{min-height:44px}.trpg-window[data-layout=narrow] .trpg-modal__head{background:var(--chrome);min-height:48px;color:var(--chrome-ink);border-bottom:0}.trpg-window[data-layout=narrow] .trpg-modal__back{color:var(--gold)}.trpg-window[data-layout=narrow] .trpg-modal__back,.trpg-window[data-layout=narrow] .trpg-modal__close{min-width:44px;min-height:44px}.trpg-drawer{align-content:start;gap:14px;min-height:100%;display:grid}.trpg-drawer__current{border-bottom:1px solid var(--line);gap:8px;padding-bottom:12px;display:grid}.trpg-drawer__name{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-drawer__title{font-family:var(--font-serif);overflow-wrap:anywhere;font-size:20px;font-weight:600}.trpg-drawer__buttons{flex-wrap:wrap;gap:8px;display:flex}.trpg-drawer__filter{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-drawer__filter .trpg-input{flex:1;min-width:140px}.trpg-drawer__bottom{border-top:1px solid var(--line);background:var(--paper);justify-content:space-between;gap:8px;margin:0 -16px -16px;padding:12px 16px;display:flex;position:sticky;bottom:-16px}.trpg-warn{color:var(--unsaved)}.trpg-saves{margin:0;padding:0;list-style:none}.trpg-save{border-bottom:1px solid var(--line);align-items:flex-start;gap:8px;padding:10px 4px;display:flex}.trpg-save[data-current=true]{background:color-mix(in srgb, var(--gold) 14%, transparent)}.trpg-save__main{flex:1;gap:2px;min-width:0;display:grid}.trpg-save__top{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.trpg-save__name{overflow-wrap:anywhere;font-weight:600}.trpg-save__time{color:var(--ink-2);margin-left:auto;font-size:12.5px}.trpg-save__rename{flex:1;min-height:32px}.trpg-save__noteedit{gap:6px;display:grid}.trpg-save__noteactions{justify-content:flex-end;gap:6px;display:flex}.trpg-folds{gap:6px;display:grid}.trpg-folds__tabs{flex-wrap:wrap;gap:4px;display:flex}.trpg-popover{z-index:100003;background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);width:min(320px,92vw);box-shadow:var(--shadow-float);padding:12px}.trpg-confirm__actions--stack{flex-wrap:wrap;justify-content:flex-end}.trpg-import__ok{color:var(--ok);margin:0;font-weight:600}.trpg-compare{border-collapse:collapse;width:100%;font-size:13px}.trpg-compare th,.trpg-compare td{border-bottom:1px solid var(--line);text-align:left;padding:4px 8px;font-weight:400}.trpg-compare thead th{color:var(--ink-2)}.trpg-window[data-layout=narrow] .trpg-confirm__actions--stack{flex-direction:column-reverse}.trpg-window[data-layout=narrow] .trpg-confirm__actions--stack .trpg-btn{min-height:44px}.trpg-wizard{flex-direction:column;min-height:100%;display:flex}.trpg-wizard__body{flex:1;padding:8px 0 16px}.trpg-wizard__foot{border-top:1px solid var(--line);background:var(--paper);justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:12px 16px;display:flex;position:sticky;bottom:-16px}.trpg-steps{gap:4px;margin:0;padding:0;list-style:none;display:flex}.trpg-steps li{flex:1}.trpg-steps button{border:0;border-bottom:2px solid var(--line);width:100%;min-height:36px;color:var(--ink-2);background:0 0;justify-content:center;align-items:center;gap:6px;padding:0 6px;display:flex}.trpg-steps button:disabled{cursor:default}.trpg-steps li[data-state=current] button{color:var(--primary);border-bottom-color:var(--primary);font-weight:600}.trpg-steps li[data-state=done] button{color:var(--ink);border-bottom-color:var(--gold);cursor:pointer}.trpg-steps li[data-skipped=true] button{opacity:.45}.trpg-steps__n{border:1px solid;border-radius:50%;place-items:center;width:20px;height:20px;font-size:12px;display:inline-grid}.trpg-steps__compact{color:var(--ink-2);margin:0;font-size:13px;display:none}.trpg-window[data-layout=narrow] .trpg-steps{display:none}.trpg-window[data-layout=narrow] .trpg-steps__compact{display:block}.trpg-step-title{font-family:var(--font-serif);margin:0;font-size:17px}.trpg-step-head{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;display:flex}.trpg-step-actions{gap:6px;display:inline-flex}.trpg-rulecards{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;display:grid}.trpg-rulecard{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow-card);cursor:pointer;gap:10px;padding:14px;display:flex}.trpg-rulecard[aria-checked=true]{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary), var(--shadow-card)}.trpg-rulecard[data-status=coming]{opacity:.55;cursor:default}.trpg-rulecard__mark{color:var(--primary);font-size:18px;line-height:1.3}.trpg-rulecard__body{justify-items:start;gap:4px;display:grid}.trpg-radio{cursor:pointer}.trpg-radio input{width:18px;height:18px;accent-color:var(--primary)}.trpg-detail-links{gap:6px;margin:0;padding:0;list-style:none;display:grid}.trpg-info__line{margin:0}", cB = ".probe{border-bottom:1px solid var(--line);padding:10px 0}.probe__head{justify-content:space-between;align-items:center;gap:8px;display:flex}.probe__title{font-family:var(--font-serif);margin:0;font-size:15px}.probe__hint{color:var(--ink-2);margin:4px 0;font-size:12.5px}.probe__summary{margin:4px 0}.probe__actions{flex-wrap:wrap;gap:6px;margin-top:6px;display:flex}.probe pre{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);white-space:pre-wrap;word-break:break-all;max-height:200px;margin:6px 0 0;padding:8px;font-size:11.5px;overflow:auto}.probe summary{cursor:pointer;color:var(--ink-2);font-size:12.5px}.lab{background:var(--panel);border-radius:var(--radius);gap:10px;margin-top:8px;padding:10px;display:grid}.lab__row{gap:6px;display:grid}.report-bar{background:var(--paper);flex-wrap:wrap;gap:8px;padding:10px 0;display:flex;position:sticky;bottom:-12px}", lB = ".trpg-root{z-index:100000;width:0;height:0;position:fixed;top:0;left:0}.trpg-ball{border:2px solid var(--gold);background:var(--chrome);width:48px;height:48px;color:var(--chrome-ink);cursor:grab;touch-action:none;border-radius:50%;place-items:center;padding:0;display:grid;position:fixed;box-shadow:0 2px 8px #00000059}.trpg-window{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow-float);color:var(--ink);position:fixed;overflow:hidden}.trpg-window[data-fullscreen=true]{border:0;border-radius:0;height:100dvh;inset:0}.trpg-shell{width:100%;height:100%;display:flex}.trpg-window[data-layout=narrow] .trpg-shell{padding-bottom:env(safe-area-inset-bottom);background:var(--paper);flex-direction:column}.trpg-window[data-fullscreen=true] .trpg-shell{padding-top:env(safe-area-inset-top);background:var(--chrome)}.trpg-side{background:var(--chrome);width:176px;color:var(--chrome-ink);flex-direction:column;flex:none;display:flex}.trpg-window[data-layout=mid] .trpg-side{width:56px}.trpg-side__brand{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;height:52px;font-family:var(--font-serif);border-bottom:1px solid var(--chrome-hover);color:var(--gold);align-items:center;gap:10px;padding:0 16px;font-size:16px;display:flex}.trpg-window[data-layout=mid] .trpg-side__brand{justify-content:center;padding:0}.trpg-side__list{gap:4px;margin:0;padding:8px;list-style:none;display:grid}.trpg-side__bottom{margin-top:auto}.trpg-nav{border-radius:var(--radius-sm);width:100%;min-height:44px;color:var(--chrome-ink);text-align:left;background:0 0;border:0;align-items:center;gap:12px;padding:0 12px;display:flex}.trpg-window[data-layout=mid] .trpg-nav{justify-content:center;padding:0}.trpg-nav:hover{background:var(--chrome-hover)}.trpg-nav[aria-current=page]{background:var(--chrome-hover);box-shadow:inset 3px 0 0 var(--gold)}.trpg-nav:focus-visible,.trpg-tab:focus-visible,.trpg-side__brand:focus-visible{outline-color:var(--gold)}.trpg-main{background:var(--paper);flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.trpg-head{border-bottom:1px solid var(--line);flex:none;align-items:center;gap:12px;height:52px;padding:0 12px 0 20px;display:flex}.trpg-head__title{font-family:var(--font-serif);flex:1;margin:0;font-size:19px;font-weight:600}.trpg-head__chips{align-items:center;gap:8px;display:flex}.trpg-content{outline:none;flex:1;min-height:0;padding:16px 20px 24px;position:relative;overflow:auto}.trpg-window[data-layout=narrow] .trpg-head{background:var(--chrome);height:48px;color:var(--chrome-ink);cursor:grab;touch-action:none;border-bottom:0;padding:0 8px 0 16px}.trpg-window[data-fullscreen=true] .trpg-head{cursor:default}.trpg-window[data-layout=narrow] .trpg-content{padding:12px 16px 24px}.trpg-tabs{background:var(--chrome);height:56px;color:var(--chrome-ink);flex:none;display:flex}.trpg-tab{min-width:64px;color:var(--chrome-ink);background:0 0;border:0;flex-direction:column;flex:1;justify-content:center;align-items:center;gap:2px;font-size:12px;display:flex}.trpg-tab[aria-current=page]{color:var(--gold);box-shadow:inset 0 3px 0 var(--gold)}.trpg-resize{cursor:nwse-resize;touch-action:none;z-index:30;background:linear-gradient(135deg, transparent 50%, var(--line) 50%, var(--line) 58%, transparent 58%, transparent 70%, var(--line) 70%, var(--line) 78%, transparent 78%);width:22px;height:22px;position:absolute;bottom:0;right:0}.page-stack{gap:16px;display:grid}.page-intro{color:var(--ink-2);margin:0}.subpage-back{border-radius:var(--radius-sm);min-height:36px;color:var(--primary);background:0 0;border:0;align-items:center;gap:2px;margin:0 0 8px -8px;padding:0 8px;display:inline-flex}.subpage-back:hover{background:var(--panel)}.trpg-body{flex:1;min-height:0;display:flex;position:relative}.trpg-body .trpg-content{flex:1}.trpg-dice-btn{z-index:6;border:2px solid var(--gold);background:var(--primary);width:52px;height:52px;color:var(--primary-ink);box-shadow:var(--shadow-float);border-radius:50%;place-items:center;padding:0;display:grid;position:absolute;bottom:20px;right:20px}.trpg-dice-btn[aria-pressed=true]{box-shadow:0 0 0 3px var(--gold), var(--shadow-float)}.trpg-window[data-layout=narrow] .trpg-dice-btn{bottom:16px;right:16px}.trpg-dice{z-index:10;background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:360px;max-height:70vh;box-shadow:var(--shadow-float);flex-direction:column;display:flex;position:fixed;overflow:hidden}.trpg-dice[data-narrow=true]{max-height:calc(100dvh - 140px)}.trpg-dice__head{background:var(--chrome);min-height:44px;color:var(--chrome-ink);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;flex:none;align-items:center;gap:8px;padding:0 6px 0 14px;display:flex}.trpg-dice__title{font-family:var(--font-serif);flex:1;font-size:16px}.trpg-dice__body{gap:12px;padding:12px;display:grid;overflow-y:auto}.trpg-dice__result{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);align-content:center;justify-items:center;gap:2px;min-height:108px;padding:12px 8px;display:grid}.trpg-dice__result[data-natural=\"20\"]{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)}.trpg-dice__result[data-natural=\"1\"]{border-color:var(--danger);box-shadow:inset 0 0 0 1px var(--danger)}.trpg-dice__total{font-family:var(--font-serif);font-variant-numeric:tabular-nums;font-size:48px;font-weight:700;line-height:1.1;animation:.2s ease-out trpg-roll}.trpg-dice__result[data-natural=\"20\"] .trpg-dice__total{color:var(--gold)}.trpg-dice__result[data-natural=\"1\"] .trpg-dice__total{color:var(--danger)}.trpg-dice__line{color:var(--ink-2);text-align:center;overflow-wrap:anywhere;font-size:13px}.trpg-dice__placeholder{color:var(--ink-2);margin:0}.trpg-dice__quick{grid-template-columns:repeat(7,1fr);gap:4px;display:grid}.trpg-dice__quick .trpg-btn{min-width:0;min-height:44px;padding:0}.trpg-dice__mods{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;display:flex}.trpg-dice__mods .trpg-seg button{min-height:40px}.trpg-dice__bonus{align-items:center;gap:4px;display:inline-flex}.trpg-dice__bonus .trpg-icon-btn{border-color:var(--line);background:var(--card);min-width:40px;min-height:40px;font-size:18px}.trpg-dice__bonus-value{text-align:center;font-variant-numeric:tabular-nums;min-width:2.5em;font-weight:600}.trpg-dice__expr-row{gap:6px;display:flex}.trpg-dice__expr-row .trpg-btn{min-width:56px;min-height:40px}.trpg-dice__expr-row .trpg-input{min-height:40px}.trpg-dice__out{grid-template-columns:1.6fr 1fr;gap:8px;display:grid}.trpg-dice__out .trpg-btn{min-height:44px}.trpg-dice__recent-head{justify-content:space-between;align-items:center;display:flex}.trpg-dice__list{max-height:168px;margin:0;padding:0;list-style:none;overflow-y:auto}.trpg-dice__item{border-bottom:1px solid var(--line);align-items:center;gap:8px;min-height:40px;font-size:13px;display:flex}.trpg-dice__item-total{min-width:2.2em;font-family:var(--font-serif);font-size:16px}.trpg-dice__item-main{overflow-wrap:anywhere;flex:1;min-width:0}@keyframes trpg-roll{0%{opacity:0;transform:translateY(-10px)scale(.9)}to{opacity:1;transform:none}}.trpg-hero{border-radius:var(--radius);background:var(--primary);width:100%;min-height:170px;color:var(--primary-ink);text-align:left;box-shadow:var(--shadow-card);border:0;align-content:end;gap:8px;padding:22px 24px;transition:transform .12s,box-shadow .12s;display:grid}button.trpg-hero:hover:not(:disabled){box-shadow:var(--shadow-float);transform:translateY(-1px)}button.trpg-hero:active{transform:none}button.trpg-hero:disabled{opacity:.6;cursor:not-allowed}.trpg-hero--idle{background:var(--panel);color:var(--ink-2)}.trpg-hero__title{font-family:var(--font-serif);font-size:26px;font-weight:600}.trpg-hero__sub{opacity:.9}.trpg-hero__go{justify-self:end;font-weight:600}.trpg-window[data-layout=narrow] .trpg-hero{min-height:140px;padding:18px}.trpg-link{color:var(--primary);background:0 0;border:0;justify-self:start;min-height:36px;padding:0;text-decoration:underline}.trpg-banner{border-radius:var(--radius);background:var(--chrome);color:#f4ecdd;height:200px;position:relative;overflow:hidden}.trpg-banner--pattern{background:repeating-linear-gradient(45deg, var(--chrome) 0 14px, color-mix(in srgb, var(--chrome) 88%, var(--gold)) 14px 28px)}.trpg-banner__img{object-fit:cover;object-position:70% 50%;opacity:0;width:100%;height:100%;transition:opacity .24s;position:absolute;inset:0}.trpg-banner__img.is-loaded{opacity:1}.trpg-banner__text{background:linear-gradient(#0000,#2b211cbf);gap:2px;padding:40px 20px 14px;display:grid;position:absolute;inset:auto 0 0}.trpg-banner__title{color:inherit;font-family:var(--font-serif);text-align:left;background:0 0;border:0;justify-self:start;padding:0;font-size:26px;font-weight:600}.trpg-banner__line{flex-wrap:wrap;align-items:center;gap:10px;font-size:14px;display:flex}.trpg-banner__state{color:inherit;background:0 0;border:0;padding:0}.trpg-banner__state[data-dirty=true]{color:#f3b45a}.trpg-window[data-layout=narrow] .trpg-banner{height:140px}.trpg-overview{grid-template-columns:repeat(4,1fr);gap:12px;display:grid}.trpg-window[data-layout=mid] .trpg-overview,.trpg-window[data-layout=narrow] .trpg-overview{grid-template-columns:repeat(2,1fr)}.trpg-cell{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);min-height:88px;box-shadow:var(--shadow-card);text-align:left;align-content:start;gap:4px;padding:12px 14px;transition:transform .12s,border-color .12s;display:grid}.trpg-cell:hover{border-color:var(--primary);transform:translateY(-1px)}.trpg-cell:active{transform:none}.trpg-cell__title{align-items:center;gap:6px;font-weight:600;display:flex}.trpg-cell__line{color:var(--ink-2);font-size:13px}.trpg-empty--tight{text-align:left;padding:8px 0}.trpg-chip{max-width:260px}.trpg-chip__name{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.trpg-badge--button{cursor:pointer}", uB = ":host{all:initial;pointer-events:inherit;--paper:#f4ecdd;--panel:#eee5d3;--card:#fffcf6;--line:#cbbca3;--ink:#2b211c;--ink-2:#6c6255;--primary:#7a2e26;--primary-ink:#fffcf6;--gold:#b8954a;--danger:#a3352b;--unsaved:#d9892b;--chrome:#2b211c;--chrome-ink:#f1ebdc;--chrome-hover:#3a2d26;--ok:#3f7a3a;--scrim:#2b211c73;--radius:10px;--radius-sm:6px;--radius-xs:4px;--shadow-card:0 1px 2px #2b211c14, 0 2px 8px #2b211c0f;--shadow-float:0 8px 28px #00000047;--font-serif:\"Songti SC\", \"Noto Serif SC\", Georgia, serif;--font-sans:\"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;font-family:var(--font-sans);color:var(--ink);font-size:14px;line-height:1.5}@media (prefers-color-scheme:dark){:host{--paper:#20231f;--panel:#2b3029;--card:#181c18;--line:#515849;--ink:#f1ebdc;--ink-2:#bcbbaa;--primary:#e6bf73;--primary-ink:#20231f;--gold:#e6bf73;--danger:#e07a6e;--unsaved:#e8a13a;--chrome:#121411;--chrome-ink:#f1ebdc;--chrome-hover:#232720;--ok:#8cc47f;--scrim:#0000008c}}*,:before,:after{box-sizing:border-box}button,input,textarea,select{font:inherit;color:inherit}button{cursor:pointer}:focus-visible{outline:2px solid var(--primary);outline-offset:2px}.trpg-sr-only{clip:rect(0 0 0 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}@media (prefers-reduced-motion:reduce){*,:before,:after{transition-duration:.01ms!important;animation-duration:.01ms!important}}", dB = "trpg-assistant-root";
function fB(e) {
	if (document.getElementById(dB)) return null;
	let t = document.createElement("div");
	t.id = dB;
	let n = t.attachShadow({ mode: "open" }), r = document.createElement("style");
	r.textContent = [
		uB,
		lB,
		sB,
		cB
	].join("\n");
	let i = document.createElement("div");
	i.className = "trpg-portal";
	let a = document.createElement("div");
	n.append(r, a, i), document.body.appendChild(t);
	let o = Nw();
	return zu(oB, {
		ctx: e,
		portalTarget: i
	}).use(o).mount(a), o;
}
// src/main.ts
async function pB() {
	if (window.__trpgAssistantBooted) return;
	window.__trpgAssistantBooted = !0, await p();
	let e = d(), t = fB(e);
	t && await yT(e, t);
}
pB().catch((e) => {
	window.__trpgAssistantBooted = !1, console.error("[trpg-assistant] 启动失败", e);
});
