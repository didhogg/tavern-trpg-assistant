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
var y = {}, b = [], x = () => {}, S = () => !1, C = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), w = (e) => e.startsWith("onUpdate:"), T = Object.assign, E = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, D = Object.prototype.hasOwnProperty, O = (e, t) => D.call(e, t), k = Array.isArray, ee = (e) => oe(e) === "[object Map]", te = (e) => oe(e) === "[object Set]", ne = (e) => oe(e) === "[object Date]", A = (e) => oe(e) === "[object RegExp]", j = (e) => typeof e == "function", M = (e) => typeof e == "string", re = (e) => typeof e == "symbol", N = (e) => typeof e == "object" && !!e, ie = (e) => (N(e) || j(e)) && j(e.then) && j(e.catch), ae = Object.prototype.toString, oe = (e) => ae.call(e), P = (e) => oe(e).slice(8, -1), se = (e) => oe(e) === "[object Object]", ce = (e) => M(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, le = /* @__PURE__ */ v(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), ue = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, de = /-\w/g, F = ue((e) => e.replace(de, (e) => e.slice(1).toUpperCase())), fe = /\B([A-Z])/g, pe = ue((e) => e.replace(fe, "-$1").toLowerCase()), me = ue((e) => e.charAt(0).toUpperCase() + e.slice(1)), he = ue((e) => e ? `on${me(e)}` : ""), ge = (e, t) => !Object.is(e, t), I = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, _e = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, ve = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, ye = (e) => {
	let t = M(e) ? Number(e) : NaN;
	return isNaN(t) ? e : t;
}, be, xe = () => be ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {}, Se = /* @__PURE__ */ v("Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol");
function Ce(e) {
	if (k(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = M(r) ? De(r) : Ce(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (M(e) || N(e)) return e;
}
var we = /;(?![^(]*\))/g, Te = /:([^]+)/, Ee = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function De(e) {
	let t = {};
	return e.replace(Ee, (e) => e.startsWith("/*") ? "" : e).split(we).forEach((e) => {
		if (e) {
			let n = e.split(Te);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function Oe(e) {
	let t = "";
	if (M(e)) t = e;
	else if (k(e)) for (let n = 0; n < e.length; n++) {
		let r = Oe(e[n]);
		r && (t += r + " ");
	}
	else if (N(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
function ke(e) {
	if (!e) return null;
	let { class: t, style: n } = e;
	return t && !M(t) && (e.class = Oe(t)), n && (e.style = Ce(n)), e;
}
var Ae = /* @__PURE__ */ v("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function je(e) {
	return !!e || e === "";
}
function Me(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = Ie(e[i], t[i], n);
	return r;
}
function Ne(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && Ie(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function Pe(e, t, n) {
	let r = ee(e), i = ee(t);
	if (r || i || (r = te(e), i = te(t), r || i)) return r && i ? Ne(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !Ie(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function Fe(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function Ie(e, t, n) {
	if (e === t) return !0;
	let r = ne(e), i = ne(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = re(e), i = re(t), r || i ? e === t : (r = k(e), i = k(t), r || i ? r && i ? Fe(e, t, n, Me) : !1 : (r = N(e), i = N(t), r || i ? !r || !i ? !1 : Fe(e, t, n, Pe) : String(e) === String(t))));
}
function Le(e, t) {
	return e.findIndex((e) => Ie(e, t));
}
var Re = (e) => !!(e && e.__v_isRef === !0), ze = (e) => M(e) ? e : e == null ? "" : k(e) || N(e) && (e.toString === ae || !j(e.toString)) ? Re(e) ? ze(e.value) : JSON.stringify(e, Be, 2) : String(e), Be = (e, t) => Re(t) ? Be(e, t.value) : ee(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[Ve(t, r) + " =>"] = n, e), {}) } : te(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => Ve(e)) } : re(t) ? Ve(t) : N(t) && !k(t) && !se(t) ? String(t) : t, Ve = (e, t = "") => re(e) ? `Symbol(${e.description ?? t})` : e;
function He(e) {
	return e == null ? "initial" : typeof e == "string" ? e === "" ? " " : e : String(e);
}
// node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var Ue, We = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && Ue && (Ue.active ? (this.parent = Ue, this.index = (Ue.scopes || (Ue.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = Ue;
			try {
				return Ue = this, e();
			} finally {
				Ue = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = Ue, Ue = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (Ue === this) Ue = this.prevScope;
			else {
				let e = Ue;
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
function Ge(e) {
	return new We(e);
}
function Ke() {
	return Ue;
}
function qe(e, t = !1) {
	Ue && Ue.cleanups.push(e);
}
var L, Je = /* @__PURE__ */ new WeakSet(), Ye = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Ue && (Ue.active ? Ue.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, Je.has(this) && (Je.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Qe(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, ft(this), tt(this);
		let e = L, t = lt;
		L = this, lt = !0;
		try {
			return this.fn();
		} finally {
			nt(this), L = e, lt = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) at(e);
			this.deps = this.depsTail = void 0, ft(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? Je.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		rt(this) && this.run();
	}
	get dirty() {
		return rt(this);
	}
}, Xe = 0, R, Ze;
function Qe(e, t = !1) {
	e.flags |= 8, t ? (e.next = Ze, Ze = e) : (e.next = R, R = e);
}
function $e() {
	Xe++;
}
function et() {
	if (--Xe > 0) return;
	if (Ze) {
		let e = Ze;
		for (Ze = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; R;) {
		let t = R;
		for (R = void 0; t;) {
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
function tt(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function nt(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), at(r), ot(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function rt(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (it(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function it(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === pt) || (e.globalVersion = pt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !rt(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = L, r = lt;
	L = e, lt = !0;
	try {
		tt(e);
		let n = e.fn(e._value);
		(t.version === 0 || ge(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		L = n, lt = r, nt(e), e.flags &= -3;
	}
}
function at(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) at(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function ot(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
function st(e, t) {
	e.effect instanceof Ye && (e = e.effect.fn);
	let n = new Ye(e);
	t && T(n, t);
	try {
		n.run();
	} catch (e) {
		throw n.stop(), e;
	}
	let r = n.run.bind(n);
	return r.effect = n, r;
}
function ct(e) {
	e.effect.stop();
}
var lt = !0, ut = [];
function dt() {
	ut.push(lt), lt = !1;
}
function z() {
	let e = ut.pop();
	lt = e === void 0 || e;
}
function ft(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = L;
		L = void 0;
		try {
			t();
		} finally {
			L = e;
		}
	}
}
var pt = 0, mt = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, ht = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!L || !lt || L === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== L) t = this.activeLink = new mt(L, this), L.deps ? (t.prevDep = L.depsTail, L.depsTail.nextDep = t, L.depsTail = t) : L.deps = L.depsTail = t, gt(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = L.depsTail, t.nextDep = void 0, L.depsTail.nextDep = t, L.depsTail = t, L.deps === t && (L.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, pt++, this.notify(e);
	}
	notify(e) {
		$e();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			et();
		}
	}
};
function gt(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) gt(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var _t = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ Symbol(""), yt = /* @__PURE__ */ Symbol(""), bt = /* @__PURE__ */ Symbol("");
function xt(e, t, n) {
	if (lt && L) {
		let t = _t.get(e);
		t || _t.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new ht()), r.map = t, r.key = n), r.track();
	}
}
function St(e, t, n, r, i, a) {
	let o = _t.get(e);
	if (!o) {
		pt++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if ($e(), t === "clear") o.forEach(s);
	else {
		let i = k(e), a = i && ce(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === bt || !re(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(bt)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(vt)), ee(e) && s(o.get(yt)));
				break;
			case "delete":
				i || (s(o.get(vt)), ee(e) && s(o.get(yt)));
				break;
			case "set": ee(e) && s(o.get(vt));
		}
	}
	et();
}
function Ct(e, t) {
	let n = _t.get(e);
	return n && n.get(t);
}
function wt(e) {
	let t = /* @__PURE__ */ V(e);
	return t === e || (xt(t, "iterate", bt), /* @__PURE__ */ pn(e)) ? t : /* @__PURE__ */ fn(e) ? /* @__PURE__ */ dn(e) ? t.map((e) => _n(gn(e))) : t.map(_n) : t.map(gn);
}
function Tt(e) {
	return xt(e = /* @__PURE__ */ V(e), "iterate", bt), e;
}
function Et(e, t) {
	return /* @__PURE__ */ fn(e) ? _n(/* @__PURE__ */ dn(e) ? gn(t) : t) : gn(t);
}
var Dt = {
	__proto__: null,
	[Symbol.iterator]() {
		return Ot(this, Symbol.iterator, (e) => Et(this, e));
	},
	concat(...e) {
		return wt(this).concat(...e.map((e) => k(e) ? wt(e) : e));
	},
	entries() {
		return Ot(this, "entries", (e) => (e[1] = Et(this, e[1]), e));
	},
	every(e, t) {
		return jt(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return jt(this, "filter", e, t, (e) => e.map((e) => Et(this, e)), arguments);
	},
	find(e, t) {
		return jt(this, "find", e, t, (e) => Et(this, e), arguments);
	},
	findIndex(e, t) {
		return jt(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return jt(this, "findLast", e, t, (e) => Et(this, e), arguments);
	},
	findLastIndex(e, t) {
		return jt(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return jt(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return Nt(this, "includes", e);
	},
	indexOf(...e) {
		return Nt(this, "indexOf", e);
	},
	join(e) {
		return wt(this).join(e);
	},
	lastIndexOf(...e) {
		return Nt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return jt(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return Pt(this, "pop");
	},
	push(...e) {
		return Pt(this, "push", e);
	},
	reduce(e, ...t) {
		return Mt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return Mt(this, "reduceRight", e, t);
	},
	shift() {
		return Pt(this, "shift");
	},
	some(e, t) {
		return jt(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return Pt(this, "splice", e);
	},
	toReversed() {
		return wt(this).toReversed();
	},
	toSorted(e) {
		return wt(this).toSorted(e);
	},
	toSpliced(...e) {
		return wt(this).toSpliced(...e);
	},
	unshift(...e) {
		return Pt(this, "unshift", e);
	},
	values() {
		return Ot(this, "values", (e) => Et(this, e));
	}
};
function Ot(e, t, n) {
	let r = Tt(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ pn(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => kt(a.next(), n), i !== At[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => kt(a._next(), n);
	}
	return a;
}
function kt(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var At = Array.prototype;
function jt(e, t, n, r, i, a) {
	let o = Tt(e), s = o !== e && !/* @__PURE__ */ pn(e), c = o[t];
	if (c !== At[t]) {
		let t = c.apply(e, a);
		return s ? gn(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, Et(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function Mt(e, t, n, r) {
	let i = Tt(e), a = i !== e && !/* @__PURE__ */ pn(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = Et(e, t)), n.call(this, t, Et(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? Et(e, c) : c;
}
function Nt(e, t, n) {
	let r = /* @__PURE__ */ V(e);
	xt(r, "iterate", bt);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ mn(n[0]) ? (n[0] = /* @__PURE__ */ V(n[0]), r[t](...n)) : i;
}
function Pt(e, t, n = []) {
	dt(), $e();
	let r = (/* @__PURE__ */ V(e))[t].apply(e, n);
	return et(), z(), r;
}
var Ft = /* @__PURE__ */ v("__proto__,__v_isRef,__isVue"), It = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(re));
function Lt(e) {
	re(e) || (e = String(e));
	let t = /* @__PURE__ */ V(this);
	return xt(t, "has", e), t.hasOwnProperty(e);
}
var Rt = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? rn : nn : i ? tn : en).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = k(e);
		if (!r) {
			let e;
			if (a && (e = Dt[t])) return e;
			if (t === "hasOwnProperty") return Lt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ vn(e) ? e : n);
		if ((re(t) ? It.has(t) : Ft(t)) || (r || xt(e, "get", t), i)) return o;
		if (/* @__PURE__ */ vn(o)) {
			let e = a && ce(t) ? o : o.value;
			return r && N(e) ? /* @__PURE__ */ cn(e) : e;
		}
		return N(o) ? r ? /* @__PURE__ */ cn(o) : /* @__PURE__ */ on(o) : o;
	}
}, zt = class extends Rt {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = k(e) && ce(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ fn(i);
			if (!/* @__PURE__ */ pn(n) && !/* @__PURE__ */ fn(n) && (i = /* @__PURE__ */ V(i), n = /* @__PURE__ */ V(n)), !a && /* @__PURE__ */ vn(i) && !/* @__PURE__ */ vn(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : O(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ vn(e) ? e : r);
		return e === /* @__PURE__ */ V(r) && s && (o ? ge(n, i) && St(e, "set", t, n, i) : St(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = O(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && St(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return re(t) && It.has(t) || xt(e, "has", t), n;
	}
	ownKeys(e) {
		return xt(e, "iterate", k(e) ? "length" : vt), Reflect.ownKeys(e);
	}
}, Bt = class extends Rt {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, Vt = /* @__PURE__ */ new zt(), Ht = /* @__PURE__ */ new Bt(), Ut = /* @__PURE__ */ new zt(!0), B = /* @__PURE__ */ new Bt(!0), Wt = (e) => e, Gt = (e) => Reflect.getPrototypeOf(e);
function Kt(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ V(i), o = ee(a), s = e === "entries" || e === Symbol.iterator && o, c = e === "keys" && o, l = i[e](...r), u = n ? Wt : t ? _n : gn;
		return !t && xt(a, "iterate", c ? yt : vt), T(Object.create(l), { next() {
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
function qt(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function Jt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ V(r), a = /* @__PURE__ */ V(n);
			e || (ge(n, a) && xt(i, "get", n), xt(i, "get", a));
			let { has: o } = Gt(i), s = t ? Wt : e ? _n : gn;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && xt(/* @__PURE__ */ V(t), "iterate", vt), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ V(n), i = /* @__PURE__ */ V(t);
			return e || (ge(t, i) && xt(r, "has", t), xt(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ V(a), s = t ? Wt : e ? _n : gn;
			return !e && xt(o, "iterate", vt), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return T(n, e ? {
		add: qt("add"),
		set: qt("set"),
		delete: qt("delete"),
		clear: qt("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ V(this), r = Gt(n), i = /* @__PURE__ */ V(e), a = !t && !/* @__PURE__ */ pn(e) && !/* @__PURE__ */ fn(e) ? i : e;
			return r.has.call(n, a) || ge(e, a) && r.has.call(n, e) || ge(i, a) && r.has.call(n, i) || (n.add(a), St(n, "add", a, a)), this;
		},
		set(e, n) {
			t || /* @__PURE__ */ pn(n) || /* @__PURE__ */ fn(n) || (n = /* @__PURE__ */ V(n));
			let r = /* @__PURE__ */ V(this), { has: i, get: a } = Gt(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ V(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? ge(n, s) && St(r, "set", e, n, s) : St(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ V(this), { has: n, get: r } = Gt(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ V(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && St(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ V(this), t = e.size !== 0, n = e.clear();
			return t && St(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = Kt(r, e, t);
	}), n;
}
function Yt(e, t) {
	let n = Jt(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(O(n, i) && i in r ? n : r, i, a);
}
var Xt = { get: /* @__PURE__ */ Yt(!1, !1) }, Zt = { get: /* @__PURE__ */ Yt(!1, !0) }, Qt = { get: /* @__PURE__ */ Yt(!0, !1) }, $t = { get: /* @__PURE__ */ Yt(!0, !0) }, en = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap(), nn = /* @__PURE__ */ new WeakMap(), rn = /* @__PURE__ */ new WeakMap();
function an(e) {
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
function on(e) {
	return /* @__PURE__ */ fn(e) ? e : un(e, !1, Vt, Xt, en);
}
// @__NO_SIDE_EFFECTS__
function sn(e) {
	return un(e, !1, Ut, Zt, tn);
}
// @__NO_SIDE_EFFECTS__
function cn(e) {
	return un(e, !0, Ht, Qt, nn);
}
// @__NO_SIDE_EFFECTS__
function ln(e) {
	return un(e, !0, B, $t, rn);
}
function un(e, t, n, r, i) {
	if (!N(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = an(P(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function dn(e) {
	return /* @__PURE__ */ fn(e) ? /* @__PURE__ */ dn(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function fn(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function pn(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function mn(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function V(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ V(t) : e;
}
function hn(e) {
	return !O(e, "__v_skip") && Object.isExtensible(e) && _e(e, "__v_skip", !0), e;
}
var gn = (e) => N(e) ? /* @__PURE__ */ on(e) : e, _n = (e) => N(e) ? /* @__PURE__ */ cn(e) : e;
// @__NO_SIDE_EFFECTS__
function vn(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function H(e) {
	return bn(e, !1);
}
// @__NO_SIDE_EFFECTS__
function yn(e) {
	return bn(e, !0);
}
function bn(e, t) {
	return /* @__PURE__ */ vn(e) ? e : new xn(e, t);
}
var xn = class {
	constructor(e, t) {
		this.dep = new ht(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ V(e), this._value = t ? e : gn(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ pn(e) || /* @__PURE__ */ fn(e);
		e = n ? e : /* @__PURE__ */ V(e), ge(e, t) && (this._rawValue = e, this._value = n ? e : gn(e), this.dep.trigger());
	}
};
function Sn(e) {
	e.dep && e.dep.trigger();
}
function U(e) {
	return /* @__PURE__ */ vn(e) ? e.value : e;
}
function Cn(e) {
	return j(e) ? e() : U(e);
}
var wn = {
	get: (e, t, n) => t === "__v_raw" ? e : U(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ vn(i) && !/* @__PURE__ */ vn(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Tn(e) {
	return /* @__PURE__ */ dn(e) ? e : new Proxy(e, wn);
}
var En = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new ht(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function Dn(e) {
	return new En(e);
}
// @__NO_SIDE_EFFECTS__
function On(e) {
	let t = k(e) ? Array(e.length) : {};
	for (let n in e) t[n] = Mn(e, n);
	return t;
}
var kn = class {
	constructor(e, t, n) {
		this._object = e, this._defaultValue = n, this.__v_isRef = !0, this._value = void 0, this._key = re(t) ? t : String(t), this._raw = /* @__PURE__ */ V(e);
		let r = !0, i = e;
		if (!k(e) || re(this._key) || !ce(this._key)) do
			r = !/* @__PURE__ */ mn(i) || /* @__PURE__ */ pn(i);
		while (r && (i = i.__v_raw));
		this._shallow = r;
	}
	get value() {
		let e = this._object[this._key];
		return this._shallow && (e = U(e)), this._value = e === void 0 ? this._defaultValue : e;
	}
	set value(e) {
		if (this._shallow && /* @__PURE__ */ vn(this._raw[this._key])) {
			let t = this._object[this._key];
			if (/* @__PURE__ */ vn(t)) {
				t.value = e;
				return;
			}
		}
		this._object[this._key] = e;
	}
	get dep() {
		return Ct(this._raw, this._key);
	}
}, An = class {
	constructor(e) {
		this._getter = e, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
	}
	get value() {
		return this._value = this._getter();
	}
};
// @__NO_SIDE_EFFECTS__
function jn(e, t, n) {
	return /* @__PURE__ */ vn(e) ? e : j(e) ? new An(e) : N(e) && arguments.length > 1 ? Mn(e, t, n) : /* @__PURE__ */ H(e);
}
function Mn(e, t, n) {
	return new kn(e, t, n);
}
var Nn = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new ht(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = pt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && L !== this) return Qe(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return it(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function Pn(e, t, n = !1) {
	let r, i;
	return j(e) ? r = e : (r = e.get, i = e.set), new Nn(r, i, n);
}
var Fn = {
	GET: "get",
	HAS: "has",
	ITERATE: "iterate"
}, In = {
	SET: "set",
	ADD: "add",
	DELETE: "delete",
	CLEAR: "clear"
}, Ln = {}, Rn = /* @__PURE__ */ new WeakMap(), zn = void 0;
function Bn() {
	return zn;
}
function Vn(e, t = !1, n = zn) {
	if (n) {
		let t = Rn.get(n);
		t || Rn.set(n, t = []), t.push(e);
	}
}
function Hn(e, t, n = y) {
	let { immediate: r, deep: i, once: a, scheduler: o, augmentJob: s, call: c } = n, l = (e) => i ? e : /* @__PURE__ */ pn(e) || i === !1 || i === 0 ? Un(e, 1) : Un(e), u, d, f, p, m = !1, h = !1;
	if (/* @__PURE__ */ vn(e) ? (d = () => e.value, m = /* @__PURE__ */ pn(e)) : /* @__PURE__ */ dn(e) ? (d = () => l(e), m = !0) : k(e) ? (h = !0, m = e.some((e) => /* @__PURE__ */ dn(e) || /* @__PURE__ */ pn(e)), d = () => e.map((e) => {
		if (/* @__PURE__ */ vn(e)) return e.value;
		if (/* @__PURE__ */ dn(e)) return l(e);
		if (j(e)) return c ? c(e, 2) : e();
	})) : d = j(e) ? t ? c ? () => c(e, 2) : e : () => {
		if (f) {
			dt();
			try {
				f();
			} finally {
				z();
			}
		}
		let t = zn;
		zn = u;
		try {
			return c ? c(e, 3, [p]) : e(p);
		} finally {
			zn = t;
		}
	} : x, t && i) {
		let e = d, t = i === !0 ? Infinity : i;
		d = () => Un(e(), t);
	}
	let g = Ke(), _ = () => {
		u.stop(), g && g.active && E(g.effects, u);
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
	let v = h ? Array(e.length).fill(Ln) : Ln, b = (e) => {
		if (u.flags & 1 && (u.dirty || e)) {
			if (t) {
				let n = u.run();
				if (e || i || m || (h ? n.some((e, t) => ge(e, v[t])) : ge(n, v))) {
					let e = zn;
					dt();
					try {
						f && f(), zn = u;
						let e = [
							n,
							v === Ln ? void 0 : h && v[0] === Ln ? [] : v,
							p
						];
						v = n, c ? c(t, 3, e) : t(...e);
					} finally {
						zn = e, z();
					}
				}
			} else u.run();
		}
	};
	return s && s(b), u = new Ye(d), u.scheduler = o ? () => o(b, !1) : b, p = (e) => Vn(e, !1, u), f = u.onStop = () => {
		let e = Rn.get(u);
		if (e) {
			if (c) c(e, 4);
			else for (let t of e) t();
			Rn.delete(u);
		}
	}, t ? r ? b(!0) : v = u.run() : o ? o(b.bind(null, !0), !0) : u.run(), _.pause = u.pause.bind(u), _.resume = u.resume.bind(u), _.stop = _, _;
}
function Un(e, t = Infinity, n) {
	if (t <= 0 || !N(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ vn(e)) Un(e.value, t, n);
	else if (k(e)) for (let r = 0; r < e.length; r++) Un(e[r], t, n);
	else if (te(e) || ee(e)) e.forEach((e) => {
		Un(e, t, n);
	});
	else if (se(e)) {
		for (let r in e) Un(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && Un(e[r], t, n);
	}
	return e;
}
// node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var Wn = [];
function Gn(e) {
	Wn.push(e);
}
function Kn() {
	Wn.pop();
}
function qn(e, t) {}
var Jn = {
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
}, Yn = {
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
function Xn(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		Qn(e, t, n);
	}
}
function Zn(e, t, n, r) {
	if (j(e)) {
		let i = Xn(e, t, n, r);
		return i && ie(i) && i.catch((e) => {
			Qn(e, t, n);
		}), i;
	}
	if (k(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(Zn(e[a], t, n, r));
		return i;
	}
}
function Qn(e, t, n, r = !0) {
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
			dt(), Xn(a, null, 10, [
				e,
				i,
				o
			]), z();
			return;
		}
	}
	$n(e, n, i, r, o);
}
function $n(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var er = [], tr = -1, nr = [], rr = null, ir = 0, ar = /* @__PURE__ */ Promise.resolve(), or = null;
function sr(e) {
	let t = or || ar;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function cr(e) {
	let t = tr + 1, n = er.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = er[r], a = gr(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function lr(e) {
	if (!(e.flags & 1)) {
		let t = gr(e), n = er[er.length - 1];
		!n || !(e.flags & 2) && t >= gr(n) ? er.push(e) : er.splice(cr(t), 0, e), e.flags |= 1, ur();
	}
}
function ur() {
	or ||= ar.then(_r);
}
function dr(e) {
	if (!k(e)) rr && e.id === -1 ? rr.splice(ir + 1, 0, e) : e.flags & 1 || (nr.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) nr.push(e[t]);
	ur();
}
function fr(e, t, n, r = tr + 1) {
	for (; r < er.length; r++) {
		let n = er[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			er.splice(r, 1), r = e ? r - 1 : tr, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function pr(e, t, n = 0) {
	if (nr.length) {
		let e = nr, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < nr.length; i++) {
				let a = nr[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? nr[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => gr(e) - gr(t));
		if (nr.length = r, rr) {
			for (let e = 0; e < i.length; e++) rr.push(i[e]);
			return;
		}
		for (rr = i, ir = 0; ir < rr.length; ir++) {
			let e = rr[ir];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		rr = null, ir = 0;
	}
}
var mr = !1;
function hr(e, t) {
	if (mr) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(nr);
	e(), mr = !0;
	try {
		fr(void 0, t), pr(void 0, n, t);
	} finally {
		mr = !1;
	}
}
var gr = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function _r(e) {
	try {
		for (tr = 0; tr < er.length; tr++) {
			let e = er[tr];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), Xn(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; tr < er.length; tr++) {
			let e = er[tr];
			e && (e.flags &= -2);
		}
		tr = -1, er.length = 0, pr(e), or = null, (er.length || nr.length) && _r(e);
	}
}
var vr, yr = [];
function br(e, t) {
	vr = e, vr ? (vr.enabled = !0, yr.forEach(({ event: e, args: t }) => vr.emit(e, ...t)), yr = []) : typeof window < "u" && window.HTMLElement && !(window.navigator?.userAgent)?.includes("jsdom") ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((e) => {
		br(e, t);
	}), setTimeout(() => {
		vr || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, yr = []);
	}, 3e3)) : yr = [];
}
var xr = null, Sr = null;
function Cr(e) {
	let t = xr;
	return xr = e, Sr = e && e.type.__scopeId || null, t;
}
function wr(e) {
	Sr = e;
}
function Tr() {
	Sr = null;
}
var Er = (e) => W;
function W(e, t = xr, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && Ds(-1);
		let i = Cr(t), a = Cs.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Cs.length; e > a; e--) Ts();
			Cr(i), r._d && Ds(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function Dr(e, t) {
	if (xr === null) return e;
	let n = hc(xr), r = e.dirs ||= [];
	for (let e = 0; e < t.length; e++) {
		let [i, a, o, s = y] = t[e];
		i && (j(i) && (i = {
			mounted: i,
			updated: i
		}), i.deep && Un(a), r.push({
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
function Or(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (dt(), Zn(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), z());
	}
}
function kr(e, t) {
	if (Zs) {
		let n = Zs.provides, r = Zs.parent && Zs.parent.provides;
		r === n && (n = Zs.provides = Object.create(r)), n[e] = t;
	}
}
function Ar(e, t, n = !1) {
	let r = Qs();
	if (r || ho) {
		let i = ho ? ho._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && j(t) ? t.call(r && r.proxy) : t;
	}
}
function jr() {
	return !!(Qs() || ho);
}
var Mr = /* @__PURE__ */ Symbol.for("v-scx"), Nr = () => Ar(Mr);
function Pr(e, t) {
	return Rr(e, null, t);
}
function Fr(e, t) {
	return Rr(e, null, { flush: "post" });
}
function Ir(e, t) {
	return Rr(e, null, { flush: "sync" });
}
function Lr(e, t, n) {
	return Rr(e, t, n);
}
function Rr(e, t, n = y) {
	let { immediate: r, deep: i, flush: a, once: o } = n, s = T({}, n), c = t && r || !t && a !== "post", l;
	if (ic) {
		if (a === "sync") {
			let e = Nr();
			l = e.__watcherHandles ||= [];
		} else if (!c) {
			let e = () => {};
			return e.stop = x, e.resume = x, e.pause = x, e;
		}
	}
	let u = Zs;
	s.call = (e, t, n) => Zn(e, u, t, n);
	let d = !1;
	a === "post" ? s.scheduler = (e) => {
		e.i = u, Jo(e, u && u.suspense);
	} : a !== "sync" && (d = !0, s.scheduler = (e, t) => {
		t ? e() : lr(e);
	}), s.augmentJob = (e) => {
		t && (e.flags |= 4), d && (e.flags |= 2, u && (e.id = u.uid, e.i = u));
	};
	let f = Hn(e, t, s);
	return ic && (l ? l.push(f) : c && f()), f;
}
function zr(e, t, n) {
	let r = this.proxy, i = M(e) ? e.includes(".") ? Br(r, e) : () => r[e] : e.bind(r, r), a;
	j(t) ? a = t : (a = t.handler, n = t);
	let o = tc(this), s = Rr(i, a.bind(r), n);
	return o(), s;
}
function Br(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Vr = /* @__PURE__ */ new WeakMap(), Hr = /* @__PURE__ */ Symbol("_vte"), Ur = (e) => e.__isTeleport, Wr = (e) => e && (e.disabled || e.disabled === ""), Gr = (e) => e && (e.defer || e.defer === ""), Kr = (e) => typeof SVGElement < "u" && e instanceof SVGElement, qr = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Jr = (e, t) => {
	let n = e && e.to;
	return M(n) ? t ? t(n) : null : n;
}, Yr = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = Wr(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = Wr(e.props), r = e.target = Jr(e.props, m), a = ei(r, e, h, p);
			r && (o !== "svg" && Kr(r) ? o = "svg" : o !== "mathml" && qr(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), $r(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (Vr.get(e) === t) {
					if (Vr.delete(e), Wr(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), $r(e, !0);
					}
					x(e);
				}
			};
			Vr.set(e, t), Jo(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), Gr(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), $r(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Vr.get(e);
			if (u) {
				u.flags |= 8, Vr.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = Wr(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || Kr(p) ? o = "svg" : (o === "mathml" || qr(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), ts(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : Xr(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = Jr(t.props, m);
				e && (t.target = e, Xr(t, e, null, l, 0));
			} else g && Xr(t, p, h, l, 1);
			$r(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = Wr(f), m = a || !p, h = Vr.get(e);
		if (h && (h.flags |= 8, Vr.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: Xr,
	hydrate: Zr
};
function Xr(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Vr.has(e) && (!d || Wr(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function Zr(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
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
	let m = t.target = Jr(t.props, c), h = Wr(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || ei(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || ei(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), $r(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var Qr = Yr;
function $r(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function ei(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Hr] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var ti = /* @__PURE__ */ Symbol("_leaveCb"), ni = /* @__PURE__ */ Symbol("_enterCb");
function ri() {
	let e = {
		isMounted: !1,
		isLeaving: !1,
		isUnmounting: !1,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	return ca(() => {
		e.isMounted = !0;
	}), da(() => {
		e.isUnmounting = !0;
	}), e;
}
var ii = [Function, Array], ai = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: ii,
	onEnter: ii,
	onAfterEnter: ii,
	onEnterCancelled: ii,
	onBeforeLeave: ii,
	onLeave: ii,
	onAfterLeave: ii,
	onLeaveCancelled: ii,
	onBeforeAppear: ii,
	onAppear: ii,
	onAfterAppear: ii,
	onAppearCancelled: ii
}, oi = {
	name: "BaseTransition",
	props: ai,
	setup(e, { slots: t }) {
		let n = Qs(), r = ri();
		return () => {
			let i = t.default && mi(t.default(), !0), a = i && i.length ? si(i) : n.subTree ? Vs() : void 0;
			if (!a) return;
			let o = /* @__PURE__ */ V(e), { mode: s } = o;
			if (r.isLeaving) return di(a);
			let c = fi(a);
			if (!c) return di(a);
			let l = ui(c, o, r, n, (e) => l = e);
			c.type !== xs && pi(c, l);
			let u = n.subTree && fi(n.subTree);
			if (u && u.type !== xs && !Ms(u, c) && hi(n.subTree)) {
				let e = ui(u, o, r, n);
				if (pi(u, e), s === "out-in" && c.type !== xs) return r.isLeaving = !0, e.afterLeave = () => {
					r.isLeaving = !1, n.job.flags & 8 || n.update(), delete e.afterLeave, u = void 0;
				}, di(a);
				s === "in-out" && c.type !== xs ? e.delayLeave = (e, t, n) => {
					let i = li(r, u);
					i[String(u.key)] = u, e[ti] = () => {
						t(), e[ti] = void 0, delete l.delayedLeave, u = void 0;
					}, l.delayedLeave = () => {
						n(), delete l.delayedLeave, u = void 0;
					};
				} : u = void 0;
			} else u &&= void 0;
			return a;
		};
	}
};
function si(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== xs) {
			t = n;
			break;
		}
	}
	return t;
}
var ci = oi;
function li(e, t) {
	let { leavingVNodes: n } = e, r = n.get(t.type);
	return r || (r = /* @__PURE__ */ Object.create(null), n.set(t.type, r)), r;
}
function ui(e, t, n, r, i) {
	let { appear: a, mode: o, persisted: s = !1, onBeforeEnter: c, onEnter: l, onAfterEnter: u, onEnterCancelled: d, onBeforeLeave: f, onLeave: p, onAfterLeave: m, onLeaveCancelled: h, onBeforeAppear: g, onAppear: _, onAfterAppear: v, onAppearCancelled: y } = t, b = String(e.key), x = li(n, e), S = (e, t) => {
		e && Zn(e, r, 9, t);
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
			t[ti] && t[ti](!0);
			let i = x[b];
			if (i && Ms(e, i)) {
				let e = i.el[ti];
				if (!e) {
					let t = hi(i);
					e = t && t.el[ti];
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
			t[ni] = (e) => {
				s || (s = !0, S(e ? o : i, [t]), w.delayedLeave && w.delayedLeave(), t[ni] = void 0);
			};
			let c = t[ni].bind(null, !1);
			r ? C(r, [t, c]) : c();
		},
		leave(t, r) {
			let i = String(e.key);
			if (t[ni] && t[ni](!0), n.isUnmounting) return r();
			S(f, [t]);
			let a = !1;
			t[ti] = (n) => {
				a || (a = !0, r(), S(n ? h : m, [t]), t[ti] = void 0, x[i] === e && delete x[i]);
			};
			let o = t[ti].bind(null, !1);
			x[i] = e, p ? C(p, [t, o]) : o();
		},
		clone(e) {
			let a = ui(e, t, n, r, i);
			return i && i(a), a;
		}
	};
	return w;
}
function di(e) {
	if (Xi(e)) return e = Rs(e), e.children = null, e;
}
function fi(e) {
	if (!Xi(e)) return Ur(e.type) && e.children ? si(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && j(n.default)) return n.default();
	}
}
function pi(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		pi(Ur(n.type) && fi(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === ys && k(e.children)) {
		let n = Co(e.children, !1);
		n && pi(n, t);
	}
}
function mi(e, t = !1, n) {
	let r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a], s = n == null ? o.key : String(n) + String(o.key == null ? a : o.key);
		o.type === ys ? (o.patchFlag & 128 && i++, r = r.concat(mi(o.children, t, s))) : (t || o.type !== xs) && r.push(s == null ? o : Rs(o, { key: s }));
	}
	if (i > 1) for (let e = 0; e < r.length; e++) r[e].patchFlag = -2;
	return r;
}
function hi(e) {
	if (e.component) return hi(e.component.subTree);
	if (e.type === ys) {
		let t = k(e.children) && Co(e.children, !1);
		return t ? hi(t) : void 0;
	}
	if (e.type !== xs) return e;
}
// @__NO_SIDE_EFFECTS__
function G(e, t) {
	return j(e) ? /* @__PURE__ */ T({ name: e.name }, t, { setup: e }) : e;
}
function gi() {
	let e = Qs();
	return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : "";
}
function _i(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function vi(e) {
	let t = Qs(), n = /* @__PURE__ */ yn(null);
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
function yi(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var bi = /* @__PURE__ */ new WeakMap();
function xi(e, t, n, r, i = !1) {
	if (k(e)) {
		e.forEach((e, a) => xi(e, t && (k(t) ? t[a] : t), n, r, i));
		return;
	}
	if (qi(r) && !i) {
		r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && xi(e, t, n, r.component.subTree);
		return;
	}
	let a = r.shapeFlag & 4 ? hc(r.component) : r.el, o = i ? null : a, { i: s, r: c } = e, l = t && t.r, u = s.refs === y ? s.refs = {} : s.refs, d = s.setupState, f = /* @__PURE__ */ V(d), p = d === y ? S : (e) => !yi(u, e) && O(f, e), m = (e, t) => !(t && yi(u, t));
	if (l != null && l !== c) {
		if (Si(t), M(l)) u[l] = null, p(l) && (d[l] = null);
		else if (/* @__PURE__ */ vn(l)) {
			let e = t;
			m(l, e.k) && (l.value = null), e.k && (u[e.k] = null);
		}
	}
	if (j(c)) Xn(c, s, 12, [o, u]);
	else {
		let t = M(c), r = /* @__PURE__ */ vn(c);
		if (t || r) {
			let s = () => {
				if (e.f) {
					let n = t ? p(c) ? d[c] : u[c] : m(c) || !e.k ? c.value : u[e.k];
					if (i) k(n) && E(n, a);
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
					s(), bi.delete(e);
				};
				t.id = -1, bi.set(e, t), Jo(t, n);
			} else Si(e), s();
		}
	}
}
function Si(e) {
	let t = bi.get(e);
	t && (t.flags |= 8, bi.delete(e));
}
var Ci = !1, wi = () => {
	Ci ||= (console.error("Hydration completed but contains mismatches."), !0);
}, Ti = (e) => e.namespaceURI.includes("svg") && e.tagName !== "foreignObject", Ei = (e) => e.namespaceURI.includes("MathML"), Di = (e) => {
	if (e.nodeType === 1) {
		if (Ti(e)) return "svg";
		if (Ei(e)) return "mathml";
	}
}, Oi = (e) => e.nodeType === 8;
function ki(e) {
	let { mt: t, p: n, o: { patchProp: r, createText: i, nextSibling: a, parentNode: o, remove: s, insert: c, createComment: l } } = e, u = (e, t) => {
		t.hasChildNodes() ? (d(t.firstChild, e, null, null, null), pr(), t._vnode = e) : (n(null, e, t), pr(), t._vnode = e);
	}, d = (n, r, s, l, u, y = !1) => {
		y ||= !!r.dynamicChildren;
		let b = Oi(n) && n.data === "[", x = () => h(n, r, s, l, u, b), { type: S, ref: C, shapeFlag: w, patchFlag: T } = r, E = n.nodeType;
		r.el = n, T === -2 && (y = !1, r.dynamicChildren = null);
		let D = null;
		switch (S) {
			case bs:
				E === 3 ? (n.data !== r.children && (wi(), n.data = r.children), D = a(n)) : r.children === "" ? (c(r.el = i(""), o(n), n), D = n) : D = x();
				break;
			case xs:
				v(n) ? (D = a(n), _(r.el = n.content.firstChild, n, s)) : D = E !== 8 || b ? x() : a(n);
				break;
			case Ss:
				if (b && (n = a(n), E = n.nodeType), E === 1 || E === 3) {
					D = n;
					let e = !r.children.length;
					for (let t = 0; t < r.staticCount; t++) e && (r.children += D.nodeType === 1 ? D.outerHTML : D.data), t === r.staticCount - 1 && (r.anchor = D), D = a(D);
					return b ? a(D) : D;
				}
				x();
				break;
			case ys:
				D = b ? m(n, r, s, l, u, y) : x();
				break;
			default: if (w & 1) D = (E !== 1 || r.type.toLowerCase() !== n.tagName.toLowerCase()) && !v(n) ? x() : f(n, r, s, l, u, y);
			else if (w & 6) {
				r.slotScopeIds = u;
				let e = o(n);
				if (D = b ? g(n) : Oi(n) && n.data === "teleport start" ? g(n, n.data, "teleport end") : a(n), t(r, e, null, s, l, Di(e), y), (qi(r) || r.component.asyncDep) && !r.component.subTree) {
					let t;
					b ? (t = J(Ss), t.anchor = D ? D.previousSibling : e.lastChild) : t = n.nodeType === 3 ? zs("") : J(n.nodeType === 8 ? xs : "div"), t.el = n, r.component.subTree = t;
				}
			} else w & 64 ? D = E === 8 ? r.type.hydrate(n, r, s, l, u, y, e, p) : x() : w & 128 && (D = r.type.hydrate(n, r, s, l, Di(o(n)), u, y, e, d));
		}
		return C != null && xi(C, null, l, r), D;
	}, f = (e, t, n, i, a, o) => {
		o ||= !!t.dynamicChildren;
		let { type: c, dynamicProps: l, props: u, patchFlag: d, shapeFlag: f, dirs: m, transition: h } = t, g = c === "input" || c === "option", y = !!l;
		if (g || y || d !== -1) {
			m && Or(t, null, n, "created");
			let c = !1;
			if (v(e)) {
				c = es(null, h) && n && n.vnode.props && n.vnode.props.appear;
				let r = e.content.firstChild;
				if (c) {
					let e = r.getAttribute("class");
					e && (r.$cls = e), h.beforeEnter(r);
				}
				_(r, e, n), t.el = e = r;
			}
			if (f & 16 && !(u && (u.innerHTML || u.textContent))) {
				let r = p(e.firstChild, t, e, n, i, a, o);
				for (r && !Pi(e, 1) && wi(); r;) {
					let e = r;
					r = r.nextSibling, s(e);
				}
			} else if (f & 8) {
				let n = t.children;
				n[0] === "\n" && (e.tagName === "PRE" || e.tagName === "TEXTAREA") && (n = n.slice(1));
				let { textContent: r } = e;
				r !== n && r !== n.replace(/\r\n|\r/g, "\n") && (Pi(e, 0) || wi(), e.textContent = t.children);
			}
			if (u) {
				if (g || y || !o || d & 48) {
					let t = e.tagName.includes("-"), i = e.namespaceURI.includes("svg") ? "svg" : e.namespaceURI.includes("MathML") ? "mathml" : void 0;
					for (let a in u) if (g && (a.endsWith("value") || a === "indeterminate") || C(a) && !le(a) || a[0] === "." || t && !le(a) || l && l.includes(a)) {
						if (ji(e, a, u[a])) continue;
						r(e, a, null, u[a], i, n);
					}
				} else if (u.onClick) r(e, "onClick", null, u.onClick, void 0, n);
				else if (d & 4 && /* @__PURE__ */ dn(u.style)) for (let e in u.style) u.style[e];
			}
			let b;
			(b = u && u.onVnodeBeforeMount) && Ks(b, n, t), m && Or(t, null, n, "beforeMount"), ((b = u && u.onVnodeMounted) || m || c) && gs(() => {
				b && Ks(b, n, t), c && h.enter(e), m && Or(t, null, n, "mounted");
			}, i);
		}
		return e.nextSibling;
	}, p = (e, t, r, o, s, l, u) => {
		u ||= !!t.dynamicChildren;
		let f = t.children, p = f.length, m = !1;
		for (let t = 0; t < p; t++) {
			let h = u ? f[t] : f[t] = Hs(f[t]), g = h.type === bs;
			e ? (g && !u && t + 1 < p && Hs(f[t + 1]).type === bs && (c(i(e.data.slice(h.children.length)), r, a(e)), e.data = h.children), e = d(e, h, o, s, l, u)) : g && !h.children ? c(h.el = i(""), r) : (m || (m = !0, Pi(r, 1) || wi()), n(null, h, r, null, o, s, Di(r), l));
		}
		return e;
	}, m = (e, t, n, r, i, s) => {
		let { slotScopeIds: u } = t;
		u && (i = i ? i.concat(u) : u);
		let d = o(e), f = p(a(e), t, d, n, r, i, s);
		return f && Oi(f) && f.data === "]" ? a(t.anchor = f) : (wi(), c(t.anchor = l("]"), d, f), f);
	}, h = (e, t, r, i, c, l) => {
		if (Ii(e, t) || wi(), t.el = null, l) {
			let t = g(e);
			for (;;) {
				let n = a(e);
				if (n && n !== t) s(n);
				else break;
			}
		}
		let u = a(e), d = o(e);
		return s(e), n(null, t, d, u, r, i, Di(d), c), r && (r.vnode.el = t.el, ko(r, t.el)), u;
	}, g = (e, t = "[", n = "]") => {
		let r = 0;
		for (; e;) if (e = a(e), e && Oi(e) && (e.data === t && r++, e.data === n)) {
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
var Ai = /* @__PURE__ */ new Set([
	"src",
	"srcset",
	"href",
	"poster"
]);
function ji(e, t, n) {
	return Ai.has(t) ? e.getAttribute(t) === (n == null ? null : `${n}`) : !1;
}
var Mi = "data-allow-mismatch", Ni = {
	0: "text",
	1: "children",
	2: "class",
	3: "style",
	4: "attribute"
};
function Pi(e, t) {
	if (t === 0 || t === 1) for (; e && !e.hasAttribute(Mi);) e = e.parentElement;
	return Fi(e && e.getAttribute(Mi), t);
}
function Fi(e, t) {
	if (e == null) return !1;
	if (e === "") return !0;
	{
		let n = e.split(",");
		return t === 0 && n.includes("children") ? !0 : n.includes(Ni[t]);
	}
}
function Ii(e, t) {
	return Pi(e.parentElement, 1) || Li(e) || Ri(t);
}
function Li(e) {
	return e.nodeType === 1 && Fi(e.getAttribute(Mi), 1);
}
function Ri({ props: e }) {
	let t = e && e[Mi];
	return typeof t == "string" && Fi(t, 1);
}
var zi = xe().requestIdleCallback || ((e) => setTimeout(e, 1)), Bi = xe().cancelIdleCallback || ((e) => clearTimeout(e)), Vi = (e = 1e4) => (t) => {
	let n = zi(t, { timeout: e });
	return () => Bi(n);
};
function Hi(e) {
	let { top: t, left: n, bottom: r, right: i } = e.getBoundingClientRect(), { innerHeight: a, innerWidth: o } = window;
	return (t > 0 && t < a || r > 0 && r < a) && (n > 0 && n < o || i > 0 && i < o);
}
var Ui = (e) => (t, n) => {
	let r = new IntersectionObserver((e) => {
		for (let n of e) if (n.isIntersecting) {
			r.disconnect(), t();
			break;
		}
	}, e), i = (e) => {
		if (Hi(e)) return t(), r.disconnect(), !1;
		if (getComputedStyle(e).display === "contents") {
			for (let t = 0; t < e.children.length; t++) if (i(e.children[t]) === !1) return !1;
		}
		r.observe(e);
	};
	return n((e) => {
		if (e instanceof Element) return i(e);
	}), () => r.disconnect();
}, Wi = (e) => (t) => {
	if (e) {
		let n = matchMedia(e);
		if (n.matches) t();
		else return n.addEventListener("change", t, { once: !0 }), () => n.removeEventListener("change", t);
	}
}, Gi = (e = []) => (t, n) => {
	M(e) && (e = [e]);
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
function Ki(e, t) {
	if (Oi(e) && e.data === "[") {
		let n = 1, r = e.nextSibling;
		for (; r;) {
			if (r.nodeType === 1) {
				if (t(r) === !1) break;
			} else if (Oi(r)) {
				if (r.data === "]") {
					if (--n === 0) break;
				} else r.data === "[" && n++;
			}
			r = r.nextSibling;
		}
	} else t(e);
}
var qi = (e) => !!e.type.__asyncLoader;
// @__NO_SIDE_EFFECTS__
function Ji(e) {
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
	return /* @__PURE__ */ G({
		name: "AsyncComponentWrapper",
		__asyncLoader: p,
		__asyncHydrate(e, t, n) {
			let r = e.isConnected, i = !1;
			(t.bu ||= []).push(() => i = !0);
			let o = () => {
				i || !e.parentNode || r && !e.isConnected || n();
			}, s = a ? () => {
				let n = a(o, (t) => Ki(e, t));
				n && (t.bum ||= []).push(n);
			} : o;
			u ? s() : p().then(() => !t.isUnmounted && s());
		},
		get __asyncResolved() {
			return u;
		},
		setup() {
			let e = Zs;
			if (_i(e), u) return () => Yi(u, e);
			let t = (t) => {
				l = null, Qn(t, e, 13, !r);
			};
			if (s && e.suspense || ic) return p().then((t) => () => Yi(t, e)).catch((e) => (t(e), () => r ? J(r, { error: e }) : null));
			let a = /* @__PURE__ */ H(!1), c = /* @__PURE__ */ H(), d = /* @__PURE__ */ H(!!i), f, m;
			return fa(() => {
				f != null && clearTimeout(f), m != null && clearTimeout(m);
			}), i && (m = setTimeout(() => {
				e.isUnmounted || (d.value = !1);
			}, i)), o != null && (f = setTimeout(() => {
				if (!e.isUnmounted && !a.value && !c.value) {
					let e = /* @__PURE__ */ Error(`Async component timed out after ${o}ms.`);
					t(e), c.value = e;
				}
			}, o)), p().then(() => {
				e.isUnmounted || (a.value = !0, e.parent && Xi(e.parent.vnode) && e.parent.update());
			}).catch((n) => {
				e.isUnmounted ? l = null : (t(n), c.value = n);
			}), () => {
				if (a.value && u) return Yi(u, e);
				if (c.value && r) return J(r, { error: c.value });
				if (n && !d.value) return Yi(n, e);
			};
		}
	});
}
function Yi(e, t) {
	let { ref: n, props: r, children: i, ce: a } = t.vnode, o = J(e, r, i);
	return o.ref = n, o.ce = a, delete t.vnode.ce, o;
}
var Xi = (e) => e.type.__isKeepAlive, Zi = {
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
		let n = Qs(), r = n.ctx;
		if (!r.renderer) return () => {
			let e = t.default && t.default();
			return e && e.length === 1 ? e[0] : e;
		};
		let i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = null, s = n.suspense, { renderer: { p: c, m: l, um: u, o: { createElement: d } } } = r, f = d("div");
		r.activate = (e, t, n, r, i) => {
			let a = e.component;
			l(e, t, n, 0, s), c(a.vnode, e, t, n, a, s, r, e.slotScopeIds, i), Jo(() => {
				a.isDeactivated = !1, a.a && I(a.a);
				let t = e.props && e.props.onVnodeMounted;
				t && Ks(t, a.parent, e);
			}, s);
		}, r.deactivate = (e) => {
			let t = e.component;
			is(t.m), is(t.a), l(e, f, null, 1, s), Jo(() => {
				t.da && I(t.da);
				let n = e.props && e.props.onVnodeUnmounted;
				n && Ks(n, t.parent, e), t.isDeactivated = !0;
			}, s);
		};
		function p(e) {
			ra(e), u(e, n, s, !0);
		}
		function m(e) {
			i.forEach((t, n) => {
				let r = gc(qi(t) ? t.type.__asyncResolved || {} : t.type);
				r && !e(r) && h(n);
			});
		}
		function h(e) {
			let t = i.get(e);
			t && (!o || !Ms(t, o)) ? p(t) : o && (ra(o), t && ra(t)), i.delete(e), a.delete(e);
		}
		Lr(() => [e.include, e.exclude], ([e, t]) => {
			e && m((t) => Qi(e, t)), t && m((e) => !Qi(t, e));
		}, {
			flush: "post",
			deep: !0
		});
		let g = null, _ = () => {
			g != null && (os(n.subTree.type) ? Jo(() => {
				let e = ia(n.subTree);
				e.component && i.set(g, e);
			}, n.subTree.suspense) : i.set(g, ia(n.subTree)));
		};
		return ca(_), ua(_), da(() => {
			i.forEach((e) => {
				let { subTree: t, suspense: r } = n, i = ia(t);
				if (e.type === i.type && e.key === i.key) {
					ra(i);
					let e = i.component.da;
					e && Jo(e, r);
				} else p(e);
			});
		}), () => {
			if (g = null, !t.default) return o = null;
			let n = t.default(), r = n[0];
			if (n.length > 1) return o = null, n;
			if (!js(r) || !(r.shapeFlag & 4) && !(r.shapeFlag & 128)) return o = null, r;
			let s = ia(r);
			if (s.type === xs) return o = null, s;
			let c = s.type, l = gc(qi(s) ? s.type.__asyncResolved || {} : c), { include: u, exclude: d, max: f } = e;
			if (u && (!l || !Qi(u, l)) || d && l && Qi(d, l)) return s.shapeFlag &= -257, o = s, r;
			let p = s.key == null ? c : s.key, m = i.get(p);
			return s.el && (s = Rs(s), r.shapeFlag & 128 && (r.ssContent = s)), g = p, m ? (s.el = m.el, s.component = m.component, s.transition && pi(s, s.transition), s.shapeFlag |= 512, a.delete(p), a.add(p)) : (a.add(p), f && a.size > parseInt(f, 10) && h(a.values().next().value)), s.shapeFlag |= 256, o = s, os(r.type) ? r : s;
		};
	}
};
function Qi(e, t) {
	return k(e) ? e.some((e) => Qi(e, t)) : M(e) ? e.split(",").includes(t) : A(e) ? (e.lastIndex = 0, e.test(t)) : !1;
}
function $i(e, t) {
	ta(e, "a", t);
}
function ea(e, t) {
	ta(e, "da", t);
}
function ta(e, t, n = Zs) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (aa(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) Xi(e.parent.vnode) && na(r, t, n, e), e = e.parent;
	}
}
function na(e, t, n, r) {
	let i = aa(t, e, r, !0);
	fa(() => {
		E(r[t], i);
	}, n);
}
function ra(e) {
	e.shapeFlag &= -257, e.shapeFlag &= -513;
}
function ia(e) {
	return e.shapeFlag & 128 ? e.ssContent : e;
}
function aa(e, t, n = Zs, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			dt();
			let i = tc(n), a = Zn(t, n, e, r);
			return i(), z(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var oa = (e) => (t, n = Zs) => {
	ic && e !== "sp" || aa(e, (...e) => t(...e), n);
}, sa = oa("bm"), ca = oa("m"), la = oa("bu"), ua = oa("u"), da = oa("bum"), fa = oa("um"), pa = oa("sp"), ma = oa("rtg"), ha = oa("rtc");
function ga(e, t = Zs) {
	aa("ec", e, t);
}
var _a = "components", va = "directives";
function ya(e, t) {
	return Ca(_a, e, !0, t) || e;
}
var ba = /* @__PURE__ */ Symbol.for("v-ndc");
function xa(e) {
	return M(e) ? Ca(_a, e, !1) || e : e || ba;
}
function Sa(e) {
	return Ca(va, e);
}
function Ca(e, t, n = !0, r = !1) {
	let i = xr || Zs;
	if (i) {
		let n = i.type;
		if (e === _a) {
			let e = gc(n, !1);
			if (e && (e === t || e === F(t) || e === me(F(t)))) return n;
		}
		let a = wa(i[e] || n[e], t) || wa(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function wa(e, t) {
	return e && (e[t] || e[F(t)] || e[me(F(t))]);
}
function Ta(e, t, n, r) {
	let i, a = n && n[r], o = k(e);
	if (o || M(e)) {
		let n = o && /* @__PURE__ */ dn(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ pn(e), s = /* @__PURE__ */ fn(e), e = Tt(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? _n(gn(e[n])) : gn(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		if (!Number.isInteger(e) || e < 0) i = [];
		else {
			i = Array(e);
			for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
		}
	} else if (N(e)) {
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
function Ea(e, t) {
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
function Da(e, t, n, r, i, a) {
	if (n ??= {}, xr.ce || xr.parent && qi(xr.parent) && xr.parent.ce) {
		let e = a != null && n.key == null ? T({}, n, { key: a }) : n, i = Object.keys(e).length > 0;
		return t !== "default" && (e.name = t), K(), As(ys, null, [J("slot", e, r && r())], i ? -2 : 64);
	}
	let o = e[t];
	o && o._c && (o._d = !1);
	let s = Cs.length;
	K();
	let c;
	try {
		let i = o && Oa(o(n)), s = n.key || a || i && i.key;
		c = As(ys, { key: (s && !re(s) ? s : `_${t}`) + (!i && r ? "_fb" : "") }, i || (r ? r() : []), i && e._ === 1 ? 64 : -2);
	} catch (e) {
		for (let e = Cs.length; e > s; e--) Ts();
		throw e;
	} finally {
		o && o._c && (o._d = !0);
	}
	return !i && c.scopeId && (c.slotScopeIds = [c.scopeId + "-s"]), c;
}
function Oa(e) {
	return e.some((e) => !js(e) || !(e.type === xs || e.type === ys && !Oa(e.children))) ? e : null;
}
function ka(e, t) {
	let n = {};
	for (let r in e) n[t && /[A-Z]/.test(r) ? `on:${r}` : he(r)] = e[r];
	return n;
}
var Aa = (e) => e ? rc(e) ? hc(e) : Aa(e.parent) : null, ja = /* @__PURE__ */ T(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Aa(e.parent),
	$root: (e) => Aa(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => to(e),
	$forceUpdate: (e) => e.f ||= () => {
		lr(e.update);
	},
	$nextTick: (e) => e.n ||= sr.bind(e.proxy),
	$watch: (e) => zr.bind(e)
}), Ma = (e, t) => e !== y && !e.__isScriptSetup && O(e, t), Na = {
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
			else if (Ma(r, t)) return o[t] = 1, r[t];
			else if (i !== y && O(i, t)) return o[t] = 2, i[t];
			else if (O(a, t)) return o[t] = 3, a[t];
			else if (n !== y && O(n, t)) return o[t] = 4, n[t];
			else Xa && (o[t] = 0);
		}
		let l = ja[t], u, d;
		if (l) return t === "$attrs" && xt(e.attrs, "get", ""), l(e);
		if ((u = s.__cssModules) && (u = u[t])) return u;
		if (n !== y && O(n, t)) return o[t] = 4, n[t];
		if (d = c.config.globalProperties, O(d, t)) return d[t];
	},
	set({ _: e }, t, n) {
		let { data: r, setupState: i, ctx: a } = e;
		return Ma(i, t) ? (i[t] = n, !0) : r !== y && O(r, t) ? (r[t] = n, !0) : O(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (a[t] = n, !0);
	},
	has({ _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: i, props: a, type: o } }, s) {
		let c;
		return !!(n[s] || e !== y && s[0] !== "$" && O(e, s) || Ma(t, s) || O(a, s) || O(r, s) || O(ja, s) || O(i.config.globalProperties, s) || (c = o.__cssModules) && c[s]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? O(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
}, Pa = /* @__PURE__ */ T({}, Na, {
	get(e, t) {
		if (t !== Symbol.unscopables) return Na.get(e, t, e);
	},
	has(e, t) {
		return t[0] !== "_" && !Se(t);
	}
});
function Fa() {
	return null;
}
function Ia() {
	return null;
}
function La(e) {}
function Ra(e) {}
function za() {
	return null;
}
function Ba() {}
function Va(e, t) {
	return null;
}
function Ha() {
	return Wa("useSlots").slots;
}
function Ua() {
	return Wa("useAttrs").attrs;
}
function Wa(e) {
	let t = Qs();
	return t.setupContext ||= mc(t);
}
function Ga(e) {
	return k(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Ka(e, t) {
	let n = Ga(e);
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
function qa(e, t) {
	return !e || !t ? e || t : k(e) && k(t) ? e.concat(t) : T({}, Ga(e), Ga(t));
}
function Ja(e, t) {
	let n = {};
	for (let r in e) t.includes(r) || Object.defineProperty(n, r, {
		enumerable: !0,
		get: () => e[r]
	});
	return n;
}
function Ya(e) {
	let t = Qs(), n = ic, r = e();
	nc(), n && ec(!1);
	let i = () => {
		tc(t), n && ec(!0);
	}, a = () => {
		Qs() !== t && t.scope.off(), nc(), n && ec(!1);
	};
	return ie(r) && (r = r.catch((e) => {
		throw i(), Promise.resolve().then(() => Promise.resolve().then(a)), e;
	})), [r, () => {
		i(), Promise.resolve().then(a);
	}];
}
var Xa = !0;
function Za(e) {
	let t = to(e), n = e.proxy, r = e.ctx;
	Xa = !1, t.beforeCreate && $a(t.beforeCreate, e, "bc");
	let { data: i, computed: a, methods: o, watch: s, provide: c, inject: l, created: u, beforeMount: d, mounted: f, beforeUpdate: p, updated: m, activated: h, deactivated: g, beforeDestroy: _, beforeUnmount: v, destroyed: y, unmounted: b, render: S, renderTracked: C, renderTriggered: w, errorCaptured: T, serverPrefetch: E, expose: D, inheritAttrs: O, components: ee, directives: te, filters: ne } = t;
	if (l && Qa(l, r, null), o) for (let e in o) {
		let t = o[e];
		j(t) && (r[e] = t.bind(n));
	}
	if (i) {
		let t = i.call(n, n);
		N(t) && (e.data = /* @__PURE__ */ on(t));
	}
	if (Xa = !0, a) for (let e in a) {
		let t = a[e], i = Y({
			get: j(t) ? t.bind(n, n) : j(t.get) ? t.get.bind(n, n) : x,
			set: !j(t) && j(t.set) ? t.set.bind(n) : x
		});
		Object.defineProperty(r, e, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		});
	}
	if (s) for (let e in s) eo(s[e], r, n, e);
	if (c) {
		let e = j(c) ? c.call(n) : c;
		Reflect.ownKeys(e).forEach((t) => {
			kr(t, e[t]);
		});
	}
	u && $a(u, e, "c");
	function A(e, t) {
		k(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (A(sa, d), A(ca, f), A(la, p), A(ua, m), A($i, h), A(ea, g), A(ga, T), A(ha, C), A(ma, w), A(da, v), A(fa, b), A(pa, E), k(D)) {
		if (D.length) {
			let t = e.exposed ||= {};
			D.forEach((e) => {
				Object.defineProperty(t, e, {
					get: () => n[e],
					set: (t) => n[e] = t,
					enumerable: !0
				});
			});
		} else e.exposed ||= {};
	}
	S && e.render === x && (e.render = S), O != null && (e.inheritAttrs = O), ee && (e.components = ee), te && (e.directives = te), E && _i(e);
}
function Qa(e, t, n = x) {
	k(e) && (e = oo(e));
	for (let n in e) {
		let r = e[n], i;
		i = N(r) ? "default" in r ? Ar(r.from || n, r.default, !0) : Ar(r.from || n) : Ar(r), /* @__PURE__ */ vn(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function $a(e, t, n) {
	Zn(k(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function eo(e, t, n, r) {
	let i = r.includes(".") ? Br(n, r) : () => n[r];
	if (M(e)) {
		let n = t[e];
		j(n) && Lr(i, n);
	} else if (j(e)) Lr(i, e.bind(n));
	else if (N(e)) {
		if (k(e)) e.forEach((e) => eo(e, t, n, r));
		else {
			let r = j(e.handler) ? e.handler.bind(n) : t[e.handler];
			j(r) && Lr(i, r, e);
		}
	}
}
function to(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => no(c, e, o, !0)), no(c, t, o)), N(t) && a.set(t, c), c;
}
function no(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && no(e, a, n, !0), i && i.forEach((t) => no(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = ro[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var ro = {
	data: io,
	props: lo,
	emits: lo,
	methods: co,
	computed: co,
	beforeCreate: so,
	created: so,
	beforeMount: so,
	mounted: so,
	beforeUpdate: so,
	updated: so,
	beforeDestroy: so,
	beforeUnmount: so,
	destroyed: so,
	unmounted: so,
	activated: so,
	deactivated: so,
	errorCaptured: so,
	serverPrefetch: so,
	components: co,
	directives: co,
	watch: uo,
	provide: io,
	inject: ao
};
function io(e, t) {
	return t ? e ? function() {
		return T(j(e) ? e.call(this, this) : e, j(t) ? t.call(this, this) : t);
	} : t : e;
}
function ao(e, t) {
	return co(oo(e), oo(t));
}
function oo(e) {
	if (k(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function so(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function co(e, t) {
	return e ? T(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function lo(e, t) {
	return e ? k(e) && k(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : T(/* @__PURE__ */ Object.create(null), Ga(e), Ga(t ?? {})) : t;
}
function uo(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = T(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = so(e[r], t[r]);
	return n;
}
function fo() {
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
var po = 0;
function mo(e, t) {
	return function(n, r = null) {
		j(n) || (n = T({}, n)), r != null && !N(r) && (r = null);
		let i = fo(), a = /* @__PURE__ */ new WeakSet(), o = [], s = !1, c = i.app = {
			_uid: po++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Sc,
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
					let u = c._ceVNode || J(n, r);
					return u.appContext = i, l === !0 ? l = "svg" : l === !1 && (l = void 0), o && t ? t(u, a) : e(u, a, l), s = !0, c._container = a, a.__vue_app__ = c, hc(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				s && (Zn(o, c._instance, 16), e(null, c._container), delete c._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, c;
			},
			runWithContext(e) {
				let t = ho;
				ho = c;
				try {
					return e();
				} finally {
					ho = t;
				}
			}
		};
		return c;
	};
}
var ho = null;
function go(e, t, n = y) {
	let r = Qs(), i = F(t), a = pe(t), o = _o(e, i), s = Dn((o, s) => {
		let c, l = y, u;
		return Ir(() => {
			let t = e[i];
			ge(c, t) && (c = t, s());
		}), {
			get() {
				return o(), n.get ? n.get(c) : c;
			},
			set(e) {
				let o = n.set ? n.set(e) : e;
				if (!ge(o, c) && !(l !== y && ge(e, l))) return;
				let d = r.vnode.props, f = !!(d && (t in d || i in d || a in d) && (`onUpdate:${t}` in d || `onUpdate:${i}` in d || `onUpdate:${a}` in d));
				f || (c = e, s()), r.emit(`update:${t}`, o), ge(e, l) && (ge(e, o) && !ge(o, u) || f && l !== y && !ge(o, c)) && s(), l = e, u = o;
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
var _o = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${F(t)}Modifiers`] || e[`${pe(t)}Modifiers`];
function vo(e, t, ...n) {
	if (e.isUnmounted) return;
	let r = e.vnode.props || y, i = n, a = t.startsWith("update:"), o = a && _o(r, t.slice(7));
	o && (o.trim && (i = n.map((e) => M(e) ? e.trim() : e)), o.number && (i = i.map(ve)));
	let s, c = r[s = he(t)] || r[s = he(F(t))];
	!c && a && (c = r[s = he(pe(t))]), c && Zn(c, e, 6, i);
	let l = r[s + "Once"];
	if (l) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[s]) return;
		e.emitted[s] = !0, Zn(l, e, 6, i);
	}
}
var yo = /* @__PURE__ */ new WeakMap();
function bo(e, t, n = !1) {
	let r = n ? yo : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, s = !1;
	if (!j(e)) {
		let r = (e) => {
			let n = bo(e, t, !0);
			n && (s = !0, T(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !s ? (N(e) && r.set(e, null), null) : (k(a) ? a.forEach((e) => o[e] = null) : T(o, a), N(e) && r.set(e, o), o);
}
function xo(e, t) {
	return !e || !C(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), O(e, t[0].toLowerCase() + t.slice(1)) || O(e, pe(t)) || O(e, t));
}
function So(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: o, attrs: s, emit: c, render: l, renderCache: u, props: d, data: f, setupState: p, ctx: m, inheritAttrs: h } = e, g = Cr(e), _, v;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			_ = Hs(l.call(t, e, u, d, p, f, m)), v = s;
		} else {
			let e = t;
			_ = Hs(e.length > 1 ? e(d, {
				attrs: s,
				slots: o,
				emit: c
			}) : e(d, null)), v = t.props ? s : wo(s);
		}
	} catch (t) {
		Cs.length = 0, Qn(t, e, 1), _ = J(xs);
	}
	let y = _;
	if (v && h !== !1) {
		let e = Object.keys(v), { shapeFlag: t } = y;
		e.length && t & 7 && (a && e.some(w) && (v = To(v, a)), y = Rs(y, v, !1, !0));
	}
	return n.dirs && (y = Rs(y, null, !1, !0), y.dirs = y.dirs ? y.dirs.concat(n.dirs) : n.dirs), n.transition && pi(Ur(y.type) && fi(y) || y, n.transition), _ = y, Cr(g), _;
}
function Co(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (js(r)) {
			if (r.type !== xs || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var wo = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || C(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, To = (e, t) => {
	let n = {};
	for (let r in e) w(r) && r.slice(9) in t || (n[r] = e[r]);
	return n;
};
function Eo(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? Do(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (Oo(o, r, n) && !xo(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || Do(r, o, l) : !!o;
	return !1;
}
function Do(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!O(e, a) || Oo(t, e, a) && !xo(n, a)) return !0;
	}
	return !1;
}
function Oo(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && N(r) && N(i) ? !Ie(r, i) : r !== i;
}
function ko({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var Ao = {}, jo = () => Object.create(Ao), Mo = (e) => Object.getPrototypeOf(e) === Ao;
function No(e, t, n, r = !1) {
	let i = {}, a = jo();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Fo(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ sn(i) : e.type.props ? i : a, e.attrs = a;
}
function Po(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ V(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (xo(e.emitsOptions, o)) continue;
				let u = t[o];
				if (c) {
					if (O(a, o)) u !== a[o] && (a[o] = u, l = !0);
					else {
						let t = F(o);
						i[t] = Io(c, s, t, u, e, !1);
					}
				} else u !== a[o] && (a[o] = u, l = !0);
			}
		}
	} else {
		Fo(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) t && (O(t, a) || (r = pe(a)) !== a && O(t, r)) || (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Io(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) t && O(t, e) || (delete a[e], l = !0);
	}
	l && St(e.attrs, "set", "");
}
function Fo(e, t, n, r) {
	let [i, a] = e.propsOptions, o = !1, s;
	if (t) for (let c in t) {
		if (le(c)) continue;
		let l = t[c], u;
		i && O(i, u = F(c)) ? !a || !a.includes(u) ? n[u] = l : (s ||= {})[u] = l : xo(e.emitsOptions, c) || c in r && l === r[c] || (r[c] = l, o = !0);
	}
	if (a) {
		let t = /* @__PURE__ */ V(n), r = s || y;
		for (let o = 0; o < a.length; o++) {
			let s = a[o];
			n[s] = Io(i, t, s, r[s], e, !O(r, s));
		}
	}
	return o;
}
function Io(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = O(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && j(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = tc(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === pe(n)) && (r = !0));
	}
	return r;
}
var Lo = /* @__PURE__ */ new WeakMap();
function Ro(e, t, n = !1) {
	let r = n ? Lo : t.propsCache, i = r.get(e);
	if (i) return i;
	let a = e.props, o = {}, s = [], c = !1;
	if (!j(e)) {
		let r = (e) => {
			c = !0;
			let [n, r] = Ro(e, t, !0);
			T(o, n), r && s.push(...r);
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	if (!a && !c) return N(e) && r.set(e, b), b;
	if (k(a)) for (let e = 0; e < a.length; e++) {
		let t = F(a[e]);
		zo(t) && (o[t] = y);
	}
	else if (a) for (let e in a) {
		let t = F(e);
		if (zo(t)) {
			let n = a[e], r = o[t] = k(n) || j(n) ? { type: n } : T({}, n), i = r.type, c = !1, l = !0;
			if (k(i)) for (let e = 0; e < i.length; ++e) {
				let t = i[e], n = j(t) && t.name;
				if (n === "Boolean") {
					c = !0;
					break;
				}
				n === "String" && (l = !1);
			}
			else c = j(i) && i.name === "Boolean";
			r[0] = c, r[1] = l, (c || O(r, "default")) && s.push(t);
		}
	}
	let l = [o, s];
	return N(e) && r.set(e, l), l;
}
function zo(e) {
	return e[0] !== "$" && !le(e);
}
var Bo = (e) => e === "_" || e === "_ctx" || e === "$stable", Vo = (e) => k(e) ? e.map(Hs) : [Hs(e)], Ho = (e, t, n) => {
	if (t._n) return t;
	let r = W((...e) => Vo(t(...e)), n);
	return r._c = !1, r;
}, Uo = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Bo(n)) continue;
		let i = e[n];
		if (j(i)) t[n] = Ho(n, i, r);
		else if (i != null) {
			let e = Vo(i);
			t[n] = () => e;
		}
	}
}, Wo = (e, t) => {
	let n = Vo(t);
	e.slots.default = () => n;
}, Go = (e, t, n) => {
	for (let r in t) (n || !Bo(r)) && (e[r] = t[r]);
}, Ko = (e, t, n) => {
	let r = e.slots = jo();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Go(r, t, n), n && _e(r, "_", e, !0)) : Uo(t, r);
	} else t && Wo(e, t);
}, qo = (e, t, n) => {
	let { vnode: r, slots: i } = e, a = !0, o = y;
	if (r.shapeFlag & 32) {
		let e = t._;
		e ? n && e === 1 ? a = !1 : Go(i, t, n) : (a = !t.$stable, Uo(t, i)), o = t;
	} else t && (Wo(e, t), o = { default: 1 });
	if (a) for (let e in i) !Bo(e) && o[e] == null && delete i[e];
}, Jo = gs;
function Yo(e) {
	return Zo(e);
}
function Xo(e) {
	return Zo(e, ki);
}
function Zo(e, t) {
	let n = xe();
	n.__VUE__ = !0;
	let { insert: r, remove: i, patchProp: a, createElement: o, createText: s, createComment: c, setText: l, setElementText: u, parentNode: d, nextSibling: f, setScopeId: p = x, insertStaticContent: m } = e, h = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !Ms(e, t) && (r = F(e), P(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === b && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case bs:
				g(e, t, n, r);
				break;
			case xs:
				_(e, t, n, r);
				break;
			case Ss:
				e ?? v(t, n, r, o);
				break;
			case ys:
				te(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? w(e, t, n, r, i, a, o, s, c) : d & 6 ? ne(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, pe);
		}
		u != null && i ? xi(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && xi(e.ref, null, a, e, !0);
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
				n && n._beginPatch(), O(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, T = (e, t, n, i, s, c, l, d) => {
		let f, p, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (f = e.el = o(e.type, c, m && m.is, m), h & 8 ? u(f, e.children) : h & 16 && D(e.children, f, null, i, s, Qo(e, c), l, d), _ && Or(e, null, i, "created"), E(f, e, e.scopeId, l, i), m) {
			for (let e in m) e !== "value" && !le(e) && a(f, e, null, m[e], c, i);
			"value" in m && a(f, "value", null, m.value, c), (p = m.onVnodeBeforeMount) && Ks(p, i, e);
		}
		_ && Or(e, null, i, "beforeMount");
		let v = es(s, g);
		v && g.beforeEnter(f), r(f, t, n), ((p = m && m.onVnodeMounted) || v || _) && Jo(() => {
			try {
				p && Ks(p, i, e), v && g.enter(f), _ && Or(e, null, i, "mounted");
			} finally {}
		}, s);
	}, E = (e, t, n, r, i) => {
		if (n && p(e, n), r) for (let t = 0; t < r.length; t++) p(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || os(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				E(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, D = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? Us(e[l]) : Hs(e[l]);
			h(null, c, t, n, r, i, a, o, s);
		}
	}, O = (e, t, n, r, i, o, s) => {
		let c = t.el = e.el, { patchFlag: l, dynamicChildren: d, dirs: f } = t;
		l |= e.patchFlag & 16;
		let p = e.props || y, m = t.props || y, h;
		if (n && $o(n, !1), (h = m.onVnodeBeforeUpdate) && Ks(h, n, t, e), f && Or(t, e, n, "beforeUpdate"), n && $o(n, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (l = 0, s = !1, d = null), (p.innerHTML && m.innerHTML == null || p.textContent && m.textContent == null) && u(c, ""), d ? k(e.dynamicChildren, d, c, n, r, Qo(t, i), o) : s || N(e, t, c, null, n, r, Qo(t, i), o, !1), l > 0) {
			if (l & 16) ee(c, p, m, n, i);
			else if (l & 2 && p.class !== m.class && a(c, "class", null, m.class, i), l & 4 && a(c, "style", p.style, m.style, i), l & 8) {
				let e = t.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let r = e[t], o = p[r], s = m[r];
					(s !== o || r === "value") && a(c, r, o, s, i, n);
				}
			}
			l & 1 && e.children !== t.children && u(c, t.children);
		} else !s && d == null && ee(c, p, m, n, i);
		((h = m.onVnodeUpdated) || f) && Jo(() => {
			h && Ks(h, n, t, e), f && Or(t, e, n, "updated");
		}, r);
	}, k = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || as(c), f = u && (c.type === ys || !Ms(c, l) || c.shapeFlag & 198) ? d(u) : n;
			h(c, l, f, null, r, i, a, o, !0);
		}
	}, ee = (e, t, n, r, i) => {
		if (t !== n) {
			if (t !== y) for (let o in t) !le(o) && !(o in n) && a(e, o, t[o], null, i, r);
			for (let o in n) {
				if (le(o)) continue;
				let s = n[o], c = t[o];
				s !== c && o !== "value" && a(e, o, c, s, i, r);
			}
			"value" in n && a(e, "value", t.value, n.value, i);
		}
	}, te = (e, t, n, i, a, o, c, l, u) => {
		let d = t.el = e ? e.el : s(""), f = t.anchor = e ? e.anchor : s(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (l = l ? l.concat(h) : h), e == null ? (r(d, n, i), r(f, n, i), D(t.children || [], n, f, a, o, c, l, u)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (k(e.dynamicChildren, m, n, a, o, c, l), (t.key != null || a && t === a.subTree) && ts(e, t, !0)) : N(e, t, n, f, a, o, c, l, u);
	}, ne = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : A(t, n, r, i, a, o, c) : j(e, t, c);
	}, A = (e, t, n, r, i, a, o) => {
		let s = e.component = Xs(e, r, i);
		if (Xi(e) && (s.ctx.renderer = pe), ac(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, M, o, a), !e.el) {
				let r = s.subTree = J(xs);
				_(null, r, t, n), e.placeholder = r.el;
			}
		} else M(s, e, t, n, i, a, o);
	}, j = (e, t, n) => {
		let r = t.component = e.component;
		if (Eo(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, re(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, M = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = rs(e);
					if (n) {
						t && (t.el = c.el, re(e, t, o)), n.asyncDep.then(() => {
							Jo(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, f;
				$o(e, !1), t ? (t.el = c.el, re(e, t, o)) : t = c, n && I(n), (f = t.props && t.props.onVnodeBeforeUpdate) && Ks(f, s, t, c), $o(e, !0);
				let p = So(e), m = e.subTree;
				e.subTree = p, h(m, p, d(m.el), F(m), e, i, a), t.el = p.el, u === null && ko(e, p.el), r && Jo(r, i), (f = t.props && t.props.onVnodeUpdated) && Jo(() => Ks(f, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = qi(t);
				if ($o(e, !1), l && I(l), !m && (o = c && c.onVnodeBeforeMount) && Ks(o, d, t), $o(e, !0), s && he) {
					let t = () => {
						e.subTree = So(e), he(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = So(e);
					h(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && Jo(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					Jo(() => Ks(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && qi(d.vnode) && d.vnode.shapeFlag & 256) && e.a && Jo(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new Ye(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => lr(u), $o(e, !0), l();
	}, re = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Po(e, t.props, r, n), qo(e, t.children, n), dt(), fr(e), z();
	}, N = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, d = e ? e.shapeFlag : 0, f = t.children, { patchFlag: p, shapeFlag: m } = t;
		if (p > 0) {
			if (p & 128) {
				ae(l, f, n, r, i, a, o, s, c);
				return;
			}
			if (p & 256) {
				ie(l, f, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (d & 16 && de(l, i, a), f !== l && u(n, f)) : d & 16 ? m & 16 ? ae(l, f, n, r, i, a, o, s, c) : de(l, i, a, !0) : (d & 8 && u(n, ""), m & 16 && D(f, n, r, i, a, o, s, c));
	}, ie = (e, t, n, r, i, a, o, s, c) => {
		e ||= b, t ||= b;
		let l = e.length, u = t.length, d = Math.min(l, u), f = 0;
		for (; f < d; f++) {
			let r = t[f] = c ? Us(t[f]) : Hs(t[f]);
			h(e[f], r, n, null, i, a, o, s, c);
		}
		l > u ? de(e, i, a, !0, !1, d) : D(t, n, r, i, a, o, s, c, d);
	}, ae = (e, t, n, r, i, a, o, s, c) => {
		let l = 0, u = t.length, d = e.length - 1, f = u - 1;
		for (; l <= d && l <= f;) {
			let r = e[l], u = t[l] = c ? Us(t[l]) : Hs(t[l]);
			if (Ms(r, u)) h(r, u, n, null, i, a, o, s, c);
			else break;
			l++;
		}
		for (; l <= d && l <= f;) {
			let r = e[d], l = t[f] = c ? Us(t[f]) : Hs(t[f]);
			if (Ms(r, l)) h(r, l, n, null, i, a, o, s, c);
			else break;
			d--, f--;
		}
		if (l > d) {
			if (l <= f) {
				let e = f + 1, d = e < u ? t[e].el : r;
				for (; l <= f;) h(null, t[l] = c ? Us(t[l]) : Hs(t[l]), n, d, i, a, o, s, c), l++;
			}
		} else if (l > f) for (; l <= d;) P(e[l], i, a, !0), l++;
		else {
			let p = l, m = l, g = /* @__PURE__ */ new Map();
			for (l = m; l <= f; l++) {
				let e = t[l] = c ? Us(t[l]) : Hs(t[l]);
				e.key != null && g.set(e.key, l);
			}
			let _, v = 0, y = f - m + 1, x = !1, S = 0, C = Array(y);
			for (l = 0; l < y; l++) C[l] = 0;
			for (l = p; l <= d; l++) {
				let r = e[l];
				if (v >= y) {
					P(r, i, a, !0);
					continue;
				}
				let u;
				if (r.key != null) u = g.get(r.key);
				else for (_ = m; _ <= f; _++) if (C[_ - m] === 0 && Ms(r, t[_])) {
					u = _;
					break;
				}
				u === void 0 ? P(r, i, a, !0) : (C[u - m] = l + 1, u >= S ? S = u : x = !0, h(r, t[u], n, null, i, a, o, s, c), v++);
			}
			let w = x ? ns(C) : b;
			for (_ = w.length - 1, l = y - 1; l >= 0; l--) {
				let e = m + l, d = t[e], f = t[e + 1], p = e + 1 < u ? f.el || as(f) : r;
				C[l] === 0 ? h(null, d, n, p, i, a, o, s, c) : x && (_ < 0 || l !== w[_] ? oe(d, n, p, 2) : _--);
			}
		}
	}, oe = (e, t, n, a, o = null) => {
		let { el: s, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) oe(e.component.subTree, t, n, a);
		else if (d & 128) e.suspense.move(t, n, a);
		else if (d & 64) c.move(e, t, n, pe);
		else if (c === ys) {
			r(s, t, n);
			for (let e = 0; e < u.length; e++) oe(u[e], t, n, a);
			r(e.anchor, t, n);
		} else if (c === Ss) S(e, t, n);
		else if (a !== 2 && d & 1 && l) {
			if (a === 0) l.persisted && !s[ti] ? r(s, t, n) : (l.beforeEnter(s), r(s, t, n), Jo(() => l.enter(s), o));
			else {
				let { leave: a, delayLeave: o, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? i(s) : r(s, t, n);
				}, d = () => {
					let e = s._isLeaving || !!s[ti];
					s._isLeaving && s[ti](!0), l.persisted && !e ? u() : a(s, () => {
						u(), c && c();
					});
				};
				o ? o(s, u, d) : d();
			}
		} else r(s, t, n);
	}, P = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (dt(), xi(s, null, n, e, !0), z()), p == null || e.ctx && e.ctx !== t || (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !qi(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && Ks(_, t, e), u & 6) ue(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Or(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, pe, r) : l && !l.hasOnce && (a !== ys || d > 0 && d & 64) ? de(l, t, n, !1, !0) : (a === ys && d & 384 || !i && u & 16) && de(c, t, n), r && se(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Jo(() => {
			_ && Ks(_, t, e), h && Or(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, se = (e) => {
		let { type: t, el: n, anchor: r, transition: a } = e, o = t === ys;
		if (o && !a) {
			ce(n, r);
			return;
		}
		if (t === Ss) {
			C(e), a && !a.persisted && a.afterLeave && a.afterLeave();
			return;
		}
		let s = o ? hi(e) : e, c = () => {
			o ? d(n) && ce(n, r) : i(n), a && !a.persisted && a.afterLeave && a.afterLeave();
		};
		if (s && s.shapeFlag & 1 && a && !a.persisted) {
			let { leave: e, delayLeave: t } = a, n = s.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, ce = (e, t) => {
		let n;
		for (; e !== t;) n = f(e), i(e), e = n;
		i(t);
	}, ue = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		is(c), is(l), r && I(r), i.stop(), a ? (a.flags |= 8, P(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, P(o, e, t, n)), s && Jo(s, t), Jo(() => {
			e.isUnmounted = !0;
		}, t);
	}, de = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) P(e[o], t, n, r, i);
	}, F = (e) => {
		if (e.shapeFlag & 6) return F(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = f(e.anchor || e.el), n = t && t[Hr];
		return n ? f(n) : t;
	}, fe = (e, t, n) => {
		hr(() => {
			e == null ? t._vnode && P(t._vnode, null, null, !0) : h(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : Ys());
	}, pe = {
		p: h,
		um: P,
		m: oe,
		r: se,
		mt: A,
		mc: D,
		pc: N,
		pbc: k,
		n: F,
		o: e
	}, me, he;
	return t && ([me, he] = t(pe)), {
		render: fe,
		hydrate: me,
		createApp: mo(fe, me)
	};
}
function Qo({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function $o({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function es(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function ts(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (k(r) && k(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = Us(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && ts(t, a)), a.type === bs && (a.patchFlag === -1 && (a = i[e] = Us(a)), a.el = t.el), a.type === xs && !a.el && (a.el = t.el);
	}
}
function ns(e) {
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
function rs(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : rs(t);
}
function is(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function as(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? as(t.subTree) : null;
}
var os = (e) => e.__isSuspense, ss = 0, cs = {
	name: "Suspense",
	__isSuspense: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		if (e == null) us(t, n, r, i, a, o, s, c, l);
		else {
			if (a && a.deps > 0 && !e.suspense.isInFallback && !a.isHydrating) {
				t.suspense = e.suspense, t.suspense.vnode = t, t.el = e.el;
				return;
			}
			ds(e, t, n, r, i, o, s, c, l);
		}
	},
	hydrate: ps,
	normalize: ms
};
function ls(e, t) {
	let n = e.props && e.props[t];
	j(n) && n();
}
function us(e, t, n, r, i, a, o, s, c) {
	let { p: l, o: { createElement: u } } = c, d = u("div"), f = e.suspense = fs(e, i, r, t, d, n, a, o, s, c);
	l(null, f.pendingBranch = e.ssContent, d, null, r, f, a, o), f.deps > 0 ? (ls(e, "onPending"), ls(e, "onFallback"), l(null, e.ssFallback, t, n, r, null, a, o), _s(f, e.ssFallback)) : f.resolve(!1, !0);
}
function ds(e, t, n, r, i, a, o, s, { p: c, um: l, o: { createElement: u } }) {
	let d = t.suspense = e.suspense;
	d.vnode = t, t.el = e.el;
	let f = t.ssContent, p = t.ssFallback, { activeBranch: m, pendingBranch: h, isInFallback: g, isHydrating: _ } = d;
	if (h) d.pendingBranch = f, Ms(h, f) ? (d.deps++, c(h, f, _ ? n : d.hiddenContainer, null, i, d, a, o, s), d.deps--, d.deps <= 0 ? d.resolve() : g && !_ && !d.isFallbackMountPending && (c(m, p, n, r, i, null, a, o, s), _s(d, p))) : (d.pendingId = ss++, _ ? (d.isHydrating = !1, d.activeBranch = h) : l(h, i, d), d.deps = 0, d.effects.length = 0, d.hiddenContainer = u("div"), g ? (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 ? d.resolve() : d.isFallbackMountPending || (c(m, p, n, r, i, null, a, o, s), _s(d, p))) : m && Ms(m, f) ? (c(m, f, n, r, i, d, a, o, s), d.resolve(!0)) : (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 && d.resolve()));
	else if (m && Ms(m, f)) c(m, f, n, r, i, d, a, o, s), _s(d, f);
	else if (ls(t, "onPending"), d.pendingBranch = f, d.pendingId = f.shapeFlag & 512 ? f.component.suspenseId : ss++, c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0) d.resolve();
	else {
		let { timeout: e, pendingId: t } = d;
		e > 0 ? setTimeout(() => {
			d.pendingId === t && d.fallback(p);
		}, e) : e === 0 && d.fallback(p);
	}
}
function fs(e, t, n, r, i, a, o, s, c, l, u = !1) {
	let { p: d, m: f, um: p, n: m, o: { parentNode: h, remove: g } } = l, _, v = vs(e);
	v && t && t.pendingBranch && (_ = t.pendingId, t.deps++);
	let y = e.props ? ye(e.props.timeout) : void 0, b = a, x = {
		vnode: e,
		parent: t,
		parentComponent: n,
		namespace: o,
		container: r,
		hiddenContainer: i,
		deps: 0,
		pendingId: ss++,
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
					s === x.pendingId && (f(o, u, a === b && !e ? m(i) : a, 0), dr(c), d && r.ssFallback && (r.ssFallback.el = null));
				}), i && !x.isFallbackMountPending && (h(i.el) === u && (a = m(i), e = !0), p(i, l, x, !0), !g && d && r.ssFallback && Jo(() => r.ssFallback.el = null, x)), g || f(o, u, a, 0);
			}
			x.isFallbackMountPending = !1, _s(x, o), x.pendingBranch = null, x.isInFallback = !1;
			let y = x.parent, S = !1;
			for (; y;) {
				if (y.pendingBranch) {
					for (let e = 0; e < c.length; e++) y.effects.push(c[e]);
					S = !0;
					break;
				}
				y = y.parent;
			}
			!S && !g && dr(c), x.effects = [], v && t && t.pendingBranch && _ === t.pendingId && (_ = void 0, t.deps--, t.deps === 0 && !n && t.resolve()), ls(r, "onResolve");
		},
		fallback(e) {
			if (!x.pendingBranch) return;
			let { vnode: t, activeBranch: n, parentComponent: r, container: i, namespace: a } = x;
			ls(t, "onFallback");
			let o = m(n), l = () => {
				if (x.isFallbackMountPending = !1, !x.isInFallback) return;
				let e = x.vnode.ssFallback;
				d(null, e, i, o, r, null, a, s, c), _s(x, e);
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
				Qn(t, e, 0);
			}).then((o) => {
				if (e.isUnmounted || x.isUnmounted || x.pendingId !== e.suspenseId) return;
				if (nc(), !e.scope.active) {
					i && --x.deps === 0 && x.resolve();
					return;
				}
				e.asyncResolved = !0;
				let { vnode: s } = e;
				sc(e, o, !1), a && (s.el = a);
				let c = !a && e.subTree.el;
				t(e, s, h(a || e.subTree.el), a ? null : m(e.subTree), x, r, n), c && (s.placeholder = null, g(c)), ko(e, s.el), i && --x.deps === 0 && x.resolve();
			});
		},
		unmount(e, t) {
			x.isUnmounted = !0, x.activeBranch && p(x.activeBranch, n, e, t), x.pendingBranch && p(x.pendingBranch, n, e, t);
		}
	};
	return x;
}
function ps(e, t, n, r, i, a, o, s, c) {
	let l = t.suspense = fs(t, r, n, e.parentNode, document.createElement("div"), null, i, a, o, s, !0), u = c(e, l.pendingBranch = t.ssContent, n, l, a, o);
	return l.deps === 0 && l.resolve(!1, !0), u;
}
function ms(e) {
	let { shapeFlag: t, children: n } = e, r = t & 32;
	e.ssContent = hs(r ? n.default : n), e.ssFallback = r ? hs(n.fallback) : J(xs);
}
function hs(e) {
	let t;
	if (j(e)) {
		let n = Es && e._c;
		n && (e._d = !1, K()), e = e(), n && (e._d = !0, t = ws, Ts());
	}
	return k(e) && (e = Co(e)), e = Hs(e), t && !e.dynamicChildren && (e.dynamicChildren = t.filter((t) => t !== e)), e;
}
function gs(e, t) {
	t && t.pendingBranch ? k(e) ? t.effects.push(...e) : t.effects.push(e) : dr(e);
}
function _s(e, t) {
	e.activeBranch = t;
	let { vnode: n, parentComponent: r } = e, i = t.el;
	for (; !i && t.component;) t = t.component.subTree, i = t.el;
	n.el = i, r && r.subTree === n && (r.vnode.el = i, ko(r, i));
}
function vs(e) {
	let t = e.props && e.props.suspensible;
	return t != null && t !== !1;
}
var ys = /* @__PURE__ */ Symbol.for("v-fgt"), bs = /* @__PURE__ */ Symbol.for("v-txt"), xs = /* @__PURE__ */ Symbol.for("v-cmt"), Ss = /* @__PURE__ */ Symbol.for("v-stc"), Cs = [], ws = null;
function K(e = !1) {
	Cs.push(ws = e ? null : []);
}
function Ts() {
	Cs.pop(), ws = Cs[Cs.length - 1] || null;
}
var Es = 1;
function Ds(e, t = !1) {
	Es += e, e < 0 && ws && t && (ws.hasOnce = !0);
}
function Os(e) {
	return e.dynamicChildren = Es > 0 ? ws || b : null, Ts(), Es > 0 && ws && ws.push(e), e;
}
function ks(e, t, n, r, i, a) {
	return Os(q(e, t, n, r, i, a, !0));
}
function As(e, t, n, r, i) {
	return Os(J(e, t, n, r, i, !0));
}
function js(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function Ms(e, t) {
	return e.type === t.type && e.key === t.key;
}
function Ns(e) {}
var Ps = ({ key: e }) => e ?? null, Fs = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : M(e) || /* @__PURE__ */ vn(e) || j(e) ? {
	i: xr,
	r: e,
	k: t,
	f: !!n
} : e);
function q(e, t = null, n = null, r = 0, i = null, a = e === ys ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && Ps(t),
		ref: t && Fs(t),
		scopeId: Sr,
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
		ctx: xr
	};
	return s ? (Ws(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= M(n) ? 8 : 16), Es > 0 && !o && ws && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && ws.push(c), c;
}
var J = Is;
function Is(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== ba || (e = xs), js(e)) {
		let r = Rs(e, t, !0);
		return n && Ws(r, n), Es > 0 && !a && ws && (r.shapeFlag & 6 ? ws[ws.indexOf(e)] = r : ws.push(r)), r.patchFlag = -2, r;
	}
	if (_c(e) && (e = e.__vccOpts), t) {
		t = Ls(t);
		let { class: e, style: n } = t;
		e && !M(e) && (t.class = Oe(e)), N(n) && (/* @__PURE__ */ mn(n) && !k(n) && (n = T({}, n)), t.style = Ce(n));
	}
	let o = M(e) ? 1 : os(e) ? 128 : Ur(e) ? 64 : N(e) ? 4 : j(e) ? 2 : 0;
	return q(e, t, n, r, i, o, a, !0);
}
function Ls(e) {
	return e ? /* @__PURE__ */ mn(e) || Mo(e) ? T({}, e) : e : null;
}
function Rs(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? Gs(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && Ps(l),
		ref: t && t.ref ? n && a ? k(a) ? a.concat(Fs(t)) : [a, Fs(t)] : Fs(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== ys ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && Rs(e.ssContent),
		ssFallback: e.ssFallback && Rs(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && pi(u, c.clone(u)), u;
}
function zs(e = " ", t = 0) {
	return J(bs, null, e, t);
}
function Bs(e, t) {
	let n = J(Ss, null, e);
	return n.staticCount = t, n;
}
function Vs(e = "", t = !1) {
	return t ? (K(), As(xs, null, e)) : J(xs, null, e);
}
function Hs(e) {
	return e == null || typeof e == "boolean" ? J(xs) : k(e) ? J(ys, null, e.slice()) : js(e) ? Us(e) : J(bs, null, String(e));
}
function Us(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : Rs(e);
}
function Ws(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (k(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), Ws(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !Mo(t) ? t._ctx = xr : r === 3 && xr && (xr.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (j(t)) {
		if (r & 65) {
			Ws(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: xr
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [zs(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function Gs(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = Oe([t.class, r.class]));
		else if (e === "style") t.style = Ce([t.style, r.style]);
		else if (C(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(k(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !w(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function Ks(e, t, n, r = null) {
	Zn(e, t, 7, [n, r]);
}
var qs = fo(), Js = 0;
function Ys() {
	return Js;
}
function Xs(e, t, n) {
	let r = e.type, i = (t ? t.appContext : e.appContext) || qs, a = {
		uid: Js++,
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
		scope: new We(!0),
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
		propsOptions: Ro(r, i),
		emitsOptions: bo(r, i),
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
	return a.ctx = { _: a }, a.root = t ? t.root : a, a.emit = vo.bind(null, a), e.ce && e.ce(a), a;
}
var Zs = null, Qs = () => Zs || xr, $s, ec;
{
	let e = xe(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	$s = t("__VUE_INSTANCE_SETTERS__", (e) => Zs = e), ec = t("__VUE_SSR_SETTERS__", (e) => ic = e);
}
var tc = (e) => {
	let t = Zs;
	return $s(e), e.scope.on(), () => {
		e.scope.off(), $s(t);
	};
}, nc = () => {
	Zs && Zs.scope.off(), $s(null);
};
function rc(e) {
	return e.vnode.shapeFlag & 4;
}
var ic = !1;
function ac(e, t = !1, n = !1) {
	t && ec(t);
	let { props: r, children: i } = e.vnode, a = rc(e);
	No(e, r, a, t), Ko(e, i, n || t);
	let o = a ? oc(e, t) : void 0;
	return t && ec(!1), o;
}
function oc(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Na);
	let { setup: r } = n;
	if (r) {
		dt();
		let n = e.setupContext = r.length > 1 ? mc(e) : null, i = tc(e), a = Xn(r, e, 0, [e.props, n]), o = ie(a);
		if (z(), i(), (o || e.sp) && !qi(e) && _i(e), o) {
			if (a.then(nc, nc), t) return a.then((n) => {
				ec(!0);
				try {
					sc(e, n, t);
				} finally {
					ec(!1);
				}
			}).catch((t) => {
				Qn(t, e, 0);
			});
			e.asyncDep = a;
		} else sc(e, a, t);
	} else fc(e, t);
}
function sc(e, t, n) {
	j(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : N(t) && (e.setupState = Tn(t)), fc(e, n);
}
var cc, lc;
function uc(e) {
	cc = e, lc = (e) => {
		e.render._rc && (e.withProxy = new Proxy(e.ctx, Pa));
	};
}
var dc = () => !cc;
function fc(e, t, n) {
	let r = e.type;
	if (!e.render) {
		if (!t && cc && !r.render) {
			let t = r.template || to(e).template;
			if (t) {
				let { isCustomElement: n, compilerOptions: i } = e.appContext.config, { delimiters: a, compilerOptions: o } = r, s = T(T({
					isCustomElement: n,
					delimiters: a
				}, i), o);
				r.render = cc(t, s);
			}
		}
		e.render = r.render || x, lc && lc(e);
	}
	{
		let t = tc(e);
		dt();
		try {
			Za(e);
		} finally {
			z(), t();
		}
	}
}
var pc = { get(e, t) {
	return xt(e, "get", ""), e[t];
} };
function mc(e) {
	return {
		attrs: new Proxy(e.attrs, pc),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function hc(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Tn(hn(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in ja) return ja[n](e);
		},
		has(e, t) {
			return t in e || t in ja;
		}
	}) : e.proxy;
}
function gc(e, t = !0) {
	return j(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function _c(e) {
	return j(e) && "__vccOpts" in e;
}
var Y = (e, t) => /* @__PURE__ */ Pn(e, t, ic);
function vc(e, t, n) {
	try {
		Ds(-1);
		let r = arguments.length;
		return r === 2 ? N(t) && !k(t) ? js(t) ? J(e, null, [t]) : J(e, t) : J(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && js(n) && (n = [n]), J(e, t, n));
	} finally {
		Ds(1);
	}
}
function yc() {}
function bc(e, t, n, r) {
	let i = n[r];
	if (i && xc(i, e)) return i;
	let a = t();
	return a.memo = e.slice(), a.cacheIndex = r, n[r] = a;
}
function xc(e, t) {
	let n = e.memo;
	if (n.length != t.length) return !1;
	for (let e = 0; e < n.length; e++) if (ge(n[e], t[e])) return !1;
	return Es > 0 && ws && ws.push(e), !0;
}
var Sc = "3.5.44", Cc = x, wc = Yn, Tc = vr, Ec = br, Dc = {
	createComponentInstance: Xs,
	setupComponent: ac,
	renderComponentRoot: So,
	setCurrentRenderingInstance: Cr,
	isVNode: js,
	normalizeVNode: Hs,
	getComponentPublicInstance: hc,
	ensureValidVNode: Oa,
	pushWarningContext: Gn,
	popWarningContext: Kn
}, Oc = void 0, kc = typeof window < "u" && window.trustedTypes;
if (kc) try {
	Oc = /* @__PURE__ */ kc.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Ac = Oc ? (e) => Oc.createHTML(e) : (e) => e, jc = "http://www.w3.org/2000/svg", Mc = "http://www.w3.org/1998/Math/MathML", Nc = typeof document < "u" ? document : null, Pc = Nc && /* @__PURE__ */ Nc.createElement("template"), Fc = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Nc.createElementNS(jc, e) : t === "mathml" ? Nc.createElementNS(Mc, e) : n ? Nc.createElement(e, { is: n }) : Nc.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Nc.createTextNode(e),
	createComment: (e) => Nc.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Nc.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Pc.innerHTML = Ac(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Pc.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Ic = "transition", Lc = "animation", Rc = /* @__PURE__ */ Symbol("_vtc"), zc = {
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
}, Bc = /* @__PURE__ */ T({}, ai, zc), Vc = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = Bc, e))((e, { slots: t }) => vc(ci, Wc(e), t)), Hc = (e, t = []) => {
	k(e) ? e.forEach((e) => e(...t)) : e && e(...t);
}, Uc = (e) => e ? k(e) ? e.some((e) => e.length > 1) : e.length > 1 : !1;
function Wc(e) {
	let t = {};
	for (let n in e) n in zc || (t[n] = e[n]);
	if (e.css === !1) return t;
	let { name: n = "v", type: r, duration: i, enterFromClass: a = `${n}-enter-from`, enterActiveClass: o = `${n}-enter-active`, enterToClass: s = `${n}-enter-to`, appearFromClass: c = a, appearActiveClass: l = o, appearToClass: u = s, leaveFromClass: d = `${n}-leave-from`, leaveActiveClass: f = `${n}-leave-active`, leaveToClass: p = `${n}-leave-to` } = e, m = Gc(i), h = m && m[0], g = m && m[1], { onBeforeEnter: _, onEnter: v, onEnterCancelled: y, onLeave: b, onLeaveCancelled: x, onBeforeAppear: S = _, onAppear: C = v, onAppearCancelled: w = y } = t, E = (e, t, n, r) => {
		e._enterCancelled = r, Jc(e, t ? u : s), Jc(e, t ? l : o), n && n();
	}, D = (e, t) => {
		e._isLeaving = !1, Jc(e, d), Jc(e, p), Jc(e, f), t && t();
	}, O = (e) => (t, n) => {
		let i = e ? C : v, o = () => E(t, e, n);
		Hc(i, [t, o]), Yc(() => {
			Jc(t, e ? c : a), qc(t, e ? u : s), Uc(i) || Zc(t, r, h, o);
		});
	};
	return T(t, {
		onBeforeEnter(e) {
			Hc(_, [e]), qc(e, a), qc(e, o);
		},
		onBeforeAppear(e) {
			Hc(S, [e]), qc(e, c), qc(e, l);
		},
		onEnter: O(!1),
		onAppear: O(!0),
		onLeave(e, t) {
			e._isLeaving = !0;
			let n = () => D(e, t);
			qc(e, d), e._enterCancelled ? (qc(e, f), tl(e)) : (tl(e), qc(e, f)), Yc(() => {
				e._isLeaving && (Jc(e, d), qc(e, p), Uc(b) || Zc(e, r, g, n));
			}), Hc(b, [e, n]);
		},
		onEnterCancelled(e) {
			E(e, !1, void 0, !0), Hc(y, [e]);
		},
		onAppearCancelled(e) {
			E(e, !0, void 0, !0), Hc(w, [e]);
		},
		onLeaveCancelled(e) {
			D(e), Hc(x, [e]);
		}
	});
}
function Gc(e) {
	if (e == null) return null;
	if (N(e)) return [Kc(e.enter), Kc(e.leave)];
	{
		let t = Kc(e);
		return [t, t];
	}
}
function Kc(e) {
	return ye(e);
}
function qc(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.add(t)), (e[Rc] || (e[Rc] = /* @__PURE__ */ new Set())).add(t);
}
function Jc(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.remove(t));
	let n = e[Rc];
	n && (n.delete(t), n.size || (e[Rc] = void 0));
}
function Yc(e) {
	requestAnimationFrame(() => {
		requestAnimationFrame(e);
	});
}
var Xc = 0;
function Zc(e, t, n, r) {
	let i = e._endId = ++Xc, a = () => {
		i === e._endId && r();
	};
	if (n != null) return setTimeout(a, n);
	let { type: o, timeout: s, propCount: c } = Qc(e, t);
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
function Qc(e, t) {
	let n = window.getComputedStyle(e), r = (e) => (n[e] || "").split(", "), i = r(`${Ic}Delay`), a = r(`${Ic}Duration`), o = $c(i, a), s = r(`${Lc}Delay`), c = r(`${Lc}Duration`), l = $c(s, c), u = null, d = 0, f = 0;
	t === Ic ? o > 0 && (u = Ic, d = o, f = a.length) : t === Lc ? l > 0 && (u = Lc, d = l, f = c.length) : (d = Math.max(o, l), u = d > 0 ? o > l ? Ic : Lc : null, f = u ? u === Ic ? a.length : c.length : 0);
	let p = u === Ic && /\b(?:transform|all)(?:,|$)/.test(r(`${Ic}Property`).toString());
	return {
		type: u,
		timeout: d,
		propCount: f,
		hasTransform: p
	};
}
function $c(e, t) {
	for (; e.length < t.length;) e = e.concat(e);
	return Math.max(...t.map((t, n) => el(t) + el(e[n])));
}
function el(e) {
	return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function tl(e) {
	return (e ? e.ownerDocument : document).body.offsetHeight;
}
function nl(e, t, n) {
	let r = e[Rc];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var rl = /* @__PURE__ */ Symbol("_vod"), il = /* @__PURE__ */ Symbol("_vsh"), al = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[rl] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : ol(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), ol(e, !0), r.enter(e)) : r.leave(e, () => {
			ol(e, !1);
		}) : ol(e, t));
	},
	beforeUnmount(e, { value: t }) {
		ol(e, t);
	}
};
function ol(e, t) {
	e.style.display = t ? e[rl] : "none", e[il] = !t;
}
function sl() {
	al.getSSRProps = ({ value: e }) => {
		if (!e) return { style: { display: "none" } };
	};
}
var cl = /* @__PURE__ */ Symbol("");
function ll(e) {
	let t = Qs();
	if (!t) return;
	let n = t.ut = (n = e(t.proxy)) => {
		Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach((e) => dl(e, n));
	}, r = () => {
		let r = e(t.proxy);
		t.ce ? dl(t.ce, r) : ul(t.subTree, r), n(r);
	};
	la(() => {
		dr(r);
	}), ca(() => {
		Lr(r, x, { flush: "post" });
		let e = new MutationObserver(r);
		e.observe(t.subTree.el.parentNode, { childList: !0 }), fa(() => e.disconnect());
	});
}
function ul(e, t) {
	if (e.shapeFlag & 128) {
		let n = e.suspense;
		e = n.activeBranch, n.pendingBranch && !n.isHydrating && n.effects.push(() => {
			ul(n.activeBranch, t);
		});
	}
	for (; e.component;) e = e.component.subTree;
	if (e.shapeFlag & 1 && e.el) dl(e.el, t);
	else if (e.type === ys) e.children.forEach((e) => ul(e, t));
	else if (e.type === Ss) {
		let { el: n, anchor: r } = e;
		for (; n && (dl(n, t), n !== r);) n = n.nextSibling;
	}
}
function dl(e, t) {
	if (e.nodeType === 1) {
		let n = e.style, r = "";
		for (let e in t) {
			let i = He(t[e]);
			n.setProperty(`--${e}`, i), r += `--${e}: ${i};`;
		}
		n[cl] = r;
	}
}
var fl = /(?:^|;)\s*display\s*:/;
function pl(e, t, n) {
	let r = e.style, i = M(n), a = !1;
	if (n && !i) {
		if (t) {
			if (M(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? hl(r, t, "");
			}
			else for (let e in t) n[e] ?? hl(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? hl(r, i, "") : yl(e, i, !M(t) && t ? t[i] : void 0, o) || hl(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[cl];
			e && (n += ";" + e), r.cssText = n, a = fl.test(n);
		}
	} else t && e.removeAttribute("style");
	rl in e && (i && t === n || (e[rl] = a ? r.display : ""), e[il] && (r.display = "none"));
}
var ml = /\s*!important$/;
function hl(e, t, n) {
	if (k(n)) n.forEach((n) => hl(e, t, n));
	else if (n ??= "", t.startsWith("--")) ml.test(n) ? e.setProperty(t, n.replace(ml, ""), "important") : e.setProperty(t, n);
	else {
		let r = vl(e, t);
		ml.test(n) ? e.setProperty(pe(r), n.replace(ml, ""), "important") : e[r] = n;
	}
}
var gl = [
	"Webkit",
	"Moz",
	"ms"
], _l = {};
function vl(e, t) {
	let n = _l[t];
	if (n) return n;
	let r = F(t);
	if (r !== "filter" && r in e) return _l[t] = r;
	r = me(r);
	for (let n = 0; n < gl.length; n++) {
		let i = gl[n] + r;
		if (i in e) return _l[t] = i;
	}
	return t;
}
function yl(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && M(r) && n === r;
}
var bl = "http://www.w3.org/1999/xlink";
function xl(e, t, n, r, i, a = Ae(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(bl, t.slice(6, t.length)) : e.setAttributeNS(bl, t, n) : n == null || a && !je(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : re(n) ? String(n) : n);
}
function Sl(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Ac(n) : n);
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
		r === "boolean" ? n = je(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function Cl(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function wl(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var Tl = /* @__PURE__ */ Symbol("_vei");
function El(e, t, n, r, i = null) {
	let a = e[Tl] || (e[Tl] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = kl(t);
		r ? Cl(e, n, a[t] = Nl(r, i), s) : o && (wl(e, n, o, s), a[t] = void 0);
	}
}
var Dl = /(Once|Passive|Capture)$/, Ol = /^on:?(?:Once|Passive|Capture)$/;
function kl(e) {
	let t, n;
	for (; (n = e.match(Dl)) && !Ol.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : pe(e.slice(2)), t];
}
var Al = 0, jl = /* @__PURE__ */ Promise.resolve(), Ml = () => Al ||= (jl.then(() => Al = 0), Date.now());
function Nl(e, t) {
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
				e && Zn(e, t, 5, a);
			}
		} else Zn(r, t, 5, [e]);
	};
	return n.value = e, n.attached = Ml(), n;
}
var Pl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Fl = (e, t, n, r, i, a) => {
	let o = i === "svg";
	t === "class" ? nl(e, r, o) : t === "style" ? pl(e, n, r) : C(t) ? w(t) || El(e, t, n, r, a) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : Il(e, t, r, o)) ? (Sl(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || xl(e, t, r, o, a, t !== "value")) : e._isVueCE && (Ll(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !M(r))) ? Sl(e, F(t), r, a, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), xl(e, t, r, o));
};
function Il(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && Pl(t) && j(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return Pl(t) && M(n) ? !1 : t in e;
}
function Ll(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = F(t);
	return Array.isArray(n) ? n.some((e) => F(e) === r) : Object.keys(n).some((e) => F(e) === r);
}
var Rl = {};
// @__NO_SIDE_EFFECTS__
function zl(e, t, n) {
	let r = /* @__PURE__ */ G(e, t);
	se(r) && (r = T({}, r, t));
	class i extends Hl {
		constructor(e) {
			super(r, e, n);
		}
	}
	return i.def = r, i;
}
var Bl = /* @__NO_SIDE_EFFECTS__ */ ((e, t) => /* @__PURE__ */ zl(e, t, zu)), Vl = typeof HTMLElement < "u" ? HTMLElement : class {}, Hl = class e extends Vl {
	constructor(e, t = {}, n = Ru) {
		super(), this._def = e, this._props = t, this._createApp = n, this._isVueCE = !0, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = !1, this._resolved = !1, this._patching = !1, this._dirty = !1, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._styleAnchors = /* @__PURE__ */ new WeakMap(), this._ob = null, this.shadowRoot && n !== Ru ? this._root = this.shadowRoot : e.shadowRoot === !1 ? this._root = this : (this.attachShadow(T({}, e.shadowRootOptions, { mode: "open" })), this._root = this.shadowRoot);
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
		this._connected = !1, sr(() => {
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
				(t === Number || t && t.type === Number) && (e in this._props && (this._props[e] = ye(this._props[e])), (i ||= /* @__PURE__ */ Object.create(null))[F(e)] = !0);
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
		if (t) for (let e in t) O(this, e) || Object.defineProperty(this, e, { get: () => U(t[e]) });
	}
	_resolveProps(e) {
		let { props: t } = e, n = k(t) ? t : Object.keys(t || {});
		for (let e of Object.keys(this)) e[0] !== "_" && n.includes(e) && this._setProp(e, this[e]);
		for (let e of n.map(F)) Object.defineProperty(this, e, {
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
		let t = this.hasAttribute(e), n = t ? this.getAttribute(e) : Rl, r = F(e);
		t && this._numberProps && this._numberProps[r] && (n = ye(n)), this._setProp(r, n, !1, !0);
	}
	_getProp(e) {
		return this._props[e];
	}
	_setProp(e, t, n = !0, r = !1) {
		if (t !== this._props[e] && (this._dirty = !0, t === Rl ? delete this._props[e] : (this._props[e] = t, e === "key" && this._app && (this._app._ceVNode.key = t)), r && this._instance && this._update(), n)) {
			let n = this._ob;
			n && (this._processMutations(n.takeRecords()), n.disconnect()), t === !0 ? this.setAttribute(pe(e), "") : typeof t == "string" || typeof t == "number" ? this.setAttribute(pe(e), t + "") : t || this.removeAttribute(pe(e)), n && n.observe(this, { attributes: !0 });
		}
	}
	_update() {
		let e = this._createVNode();
		this._app && (e.appContext = this._app._context), Iu(e, this._root);
	}
	_createVNode() {
		let e = {};
		this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
		let t = J(this._def, T(e, this._props));
		return this._instance || (t.ce = (e) => {
			this._instance = e, e.ce = this, e.isCE = !0;
			let t = (e, t) => {
				this.dispatchEvent(new CustomEvent(e, se(t[0]) ? T({ detail: t }, t[0]) : { detail: t }));
			};
			e.emit = (e, ...n) => {
				t(e, n), pe(e) !== e && t(pe(e), n);
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
function Ul(e) {
	let t = Qs();
	return t && t.ce || null;
}
function Wl() {
	let e = Ul();
	return e && e.shadowRoot;
}
function Gl(e = "$style") {
	{
		let t = Qs();
		if (!t) return y;
		let n = t.type.__cssModules;
		return n && n[e] || y;
	}
}
var Kl = /* @__PURE__ */ new WeakMap(), ql = /* @__PURE__ */ new WeakMap(), Jl = /* @__PURE__ */ Symbol("_moveCb"), Yl = /* @__PURE__ */ Symbol("_enterCb"), Xl = /* @__PURE__ */ new WeakMap(), Zl = /* @__PURE__ */ ((e) => (delete e.props.mode, e))({
	name: "TransitionGroup",
	props: /* @__PURE__ */ T({}, Bc, {
		tag: String,
		moveClass: String
	}),
	setup(e, { slots: t }) {
		let n = Qs(), r = ri(), i, a, o, s, c = () => (s === void 0 && (s = i.length > 0 && ou(i[0].el, n.vnode.el, $l(e))), s);
		return ua(() => {
			if (Xl.delete(n), !c()) {
				i = [], o = void 0;
				return;
			}
			let t = $l(e);
			i.forEach(Ql);
			let r = o && au(o, n.vnode.el);
			o = void 0, i.forEach((e) => eu(e, r));
			let a = i.filter(tu);
			tl(n.vnode.el), a.forEach((e) => {
				let n = e.el, r = n.style;
				qc(n, t), r.transform = r.webkitTransform = r.transitionDuration = "";
				let i = n[Jl] = (e) => {
					e && e.target !== n || (!e || e.propertyName.endsWith("transform")) && (n.removeEventListener("transitionend", i), n[Jl] = null, Jc(n, t));
				};
				n.addEventListener("transitionend", i);
			}), i = [];
		}), () => {
			let l = /* @__PURE__ */ V(e), u = Wc(l), d = l.tag || ys;
			if (i = [], s = void 0, a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && !t.el[il] && (i.push(t), pi(t, ui(t, u, r, n)), Kl.set(t, nu(t.el)));
			}
			a = t.default ? mi(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && pi(t, ui(t, u, r, n));
			}
			return i.length && (o = ru(n), Xl.set(n, c)), J(d, null, a);
		};
	}
});
function Ql(e) {
	let t = e.el;
	t[Jl] && t[Jl](), t[Yl] && t[Yl]();
}
function $l(e) {
	return e.moveClass || `${e.name || "v"}-move`;
}
function eu(e, t) {
	ql.set(e, nu(e.el, t));
}
function tu(e) {
	let t = Kl.get(e), n = ql.get(e), r = t.left - n.left, i = t.top - n.top;
	if (r || i) {
		let t = e.el, n = t.style, a = t.getBoundingClientRect(), o = 1, s = 1;
		return t.offsetWidth && (o = a.width / t.offsetWidth), t.offsetHeight && (s = a.height / t.offsetHeight), Number.isFinite(o) && o !== 0 || (o = 1), Number.isFinite(s) && s !== 0 || (s = 1), Math.abs(o - 1) < .01 && (o = 1), Math.abs(s - 1) < .01 && (s = 1), n.transform = n.webkitTransform = `translate(${r / o}px,${i / s}px)`, n.transitionDuration = "0s", e;
	}
}
function nu(e, t) {
	let n = e.getBoundingClientRect();
	return {
		left: n.left - (t ? t.left : 0),
		top: n.top - (t ? t.top : 0)
	};
}
function ru(e) {
	let t;
	for (let n = e.parent; n; n = n.parent) {
		let r = Xl.get(n);
		if (r) {
			let i = iu(n.vnode.el, e.vnode.el);
			i && (t ||= []).push(T(nu(i), {
				item: i,
				willMove: r
			}));
		}
	}
	return t;
}
function iu(e, t) {
	let n = e.nodeType === 1 ? e : e.parentNode;
	for (; t && t.parentNode !== n;) t = t.parentNode;
	if (t && t.nodeType === 1) return t;
}
function au(e, t) {
	let n = e.find((e) => e.willMove() && e.item.contains(t));
	return n && nu(n.item, n);
}
function ou(e, t, n) {
	let r = e.cloneNode(), i = e[Rc];
	i && i.forEach((e) => {
		e.split(/\s+/).forEach((e) => e && r.classList.remove(e));
	}), n.split(/\s+/).forEach((e) => e && r.classList.add(e)), r.style.display = "none";
	let a = t.nodeType === 1 ? t : t.parentNode;
	a.appendChild(r);
	let { hasTransform: o } = Qc(r);
	return a.removeChild(r), o;
}
var su = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return k(t) ? (e) => I(t, e) : t;
};
function cu(e) {
	e.target.composing = !0;
}
function lu(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var uu = /* @__PURE__ */ Symbol("_assign"), du = /* @__PURE__ */ Symbol("_initialValue");
function fu(e, t, n) {
	return t && (e = e.trim()), n && (e = ve(e)), e;
}
var pu = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[du] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[du] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[uu] = su(i);
		let a = r || i.props && i.props.type === "number";
		Cl(e, t ? "change" : "input", (t) => {
			t.target.composing || e[uu](fu(e.value, n, a));
		}), (n || a) && Cl(e, "change", () => {
			e.value = fu(e.value, n, a);
		}), t || (Cl(e, "compositionstart", cu), Cl(e, "compositionend", lu), Cl(e, "change", lu));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[du];
		delete e[du], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[uu](fu(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[uu] = su(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? ve(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, mu = {
	deep: !0,
	created(e, t, n) {
		e[uu] = su(n), Cl(e, "change", () => {
			let t = e._modelValue, n = bu(e), r = e.checked, i = e[uu];
			if (k(t)) {
				let e = Le(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (te(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(xu(e, r));
		});
	},
	mounted: hu,
	beforeUpdate(e, t, n) {
		e[uu] = su(n), hu(e, t, n);
	}
};
function hu(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (k(t)) i = Le(t, r.props.value) > -1;
	else if (te(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = Ie(t, xu(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var gu = {
	created(e, { value: t }, n) {
		e.checked = Ie(t, n.props.value), e[uu] = su(n), Cl(e, "change", () => {
			e[uu](bu(e));
		});
	},
	beforeUpdate(e, { value: t, oldValue: n }, r) {
		e[uu] = su(r), t !== n && (e.checked = Ie(t, r.props.value));
	}
}, _u = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, Cl(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? ve(bu(e)) : bu(e)), r = e.multiple, i = r ? te(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? k(i) ? t.slice() : t : i];
			try {
				e[uu](i);
			} finally {
				sr(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[uu] = su(r);
	},
	mounted(e, { value: t }) {
		yu(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[uu] = su(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, n && n[0] === e.multiple && vu(t, n[1], n[0]) || yu(e, t);
	}
};
function vu(e, t, n) {
	if (!n || k(e)) return Ie(e, t);
	if (te(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function yu(e, t) {
	let n = e.multiple, r = k(t);
	if (!n || r || te(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = bu(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : Le(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (Ie(bu(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function bu(e) {
	return "_value" in e ? e._value : e.value;
}
function xu(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Su = {
	created(e, t, n) {
		wu(e, t, n, null, "created");
	},
	mounted(e, t, n) {
		wu(e, t, n, null, "mounted");
	},
	beforeUpdate(e, t, n, r) {
		wu(e, t, n, r, "beforeUpdate");
	},
	updated(e, t, n, r) {
		wu(e, t, n, r, "updated");
	}
};
function Cu(e, t) {
	switch (e) {
		case "SELECT": return _u;
		case "TEXTAREA": return pu;
		default: switch (t) {
			case "checkbox": return mu;
			case "radio": return gu;
			default: return pu;
		}
	}
}
function wu(e, t, n, r, i) {
	let a = Cu(e.tagName, n.props && n.props.type)[i];
	a && a(e, t, n, r);
}
function Tu() {
	pu.getSSRProps = ({ value: e }) => ({ value: e }), gu.getSSRProps = ({ value: e }, t) => {
		if (t.props && Ie(t.props.value, e)) return { checked: !0 };
	}, mu.getSSRProps = ({ value: e }, t) => {
		if (k(e)) {
			if (t.props && Le(e, t.props.value) > -1) return { checked: !0 };
		} else if (te(e)) {
			if (t.props && e.has(t.props.value)) return { checked: !0 };
		} else if (e) return { checked: !0 };
	}, Su.getSSRProps = (e, t) => {
		if (typeof t.type != "string") return;
		let n = Cu(t.type.toUpperCase(), t.props && t.props.type);
		if (n.getSSRProps) return n.getSSRProps(e, t);
	};
}
var Eu = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Du = {
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
	exact: (e, t) => Eu.some((n) => e[`${n}Key`] && !t.includes(n))
}, Ou = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Du[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, ku = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, Au = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = pe(n.key);
		if (t.some((e) => e === r || ku[e] === r)) return e(n);
	}));
}, ju = /* @__PURE__ */ T({ patchProp: Fl }, Fc), Mu, Nu = !1;
function Pu() {
	return Mu ||= Yo(ju);
}
function Fu() {
	return Mu = Nu ? Mu : Xo(ju), Nu = !0, Mu;
}
var Iu = ((...e) => {
	Pu().render(...e);
}), Lu = ((...e) => {
	Fu().hydrate(...e);
}), Ru = ((...e) => {
	let t = Pu().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Vu(e);
		if (!r) return;
		let i = t._component;
		j(i) || i.render || i.template || (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Bu(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
}), zu = ((...e) => {
	let t = Fu().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let t = Vu(e);
		if (t) return n(t, !0, Bu(t));
	}, t;
});
function Bu(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Vu(e) {
	return M(e) ? document.querySelector(e) : e;
}
var Hu = !1, Uu = () => {
	Hu || (Hu = !0, Tu(), sl());
}, Wu = /* @__PURE__ */ s({
	BaseTransition: () => ci,
	BaseTransitionPropsValidators: () => ai,
	Comment: () => xs,
	DeprecationTypes: () => null,
	EffectScope: () => We,
	ErrorCodes: () => Jn,
	ErrorTypeStrings: () => wc,
	Fragment: () => ys,
	KeepAlive: () => Zi,
	ReactiveEffect: () => Ye,
	Static: () => Ss,
	Suspense: () => cs,
	Teleport: () => Qr,
	Text: () => bs,
	TrackOpTypes: () => Fn,
	Transition: () => Vc,
	TransitionGroup: () => Zl,
	TriggerOpTypes: () => In,
	VueElement: () => Hl,
	assertNumber: () => qn,
	callWithAsyncErrorHandling: () => Zn,
	callWithErrorHandling: () => Xn,
	camelize: () => F,
	capitalize: () => me,
	cloneVNode: () => Rs,
	compatUtils: () => null,
	compile: () => Gu,
	computed: () => Y,
	createApp: () => Ru,
	createBlock: () => As,
	createCommentVNode: () => Vs,
	createElementBlock: () => ks,
	createElementVNode: () => q,
	createHydrationRenderer: () => Xo,
	createPropsRestProxy: () => Ja,
	createRenderer: () => Yo,
	createSSRApp: () => zu,
	createSlots: () => Ea,
	createStaticVNode: () => Bs,
	createTextVNode: () => zs,
	createVNode: () => J,
	customRef: () => Dn,
	defineAsyncComponent: () => Ji,
	defineComponent: () => G,
	defineCustomElement: () => zl,
	defineEmits: () => Ia,
	defineExpose: () => La,
	defineModel: () => Ba,
	defineOptions: () => Ra,
	defineProps: () => Fa,
	defineSSRCustomElement: () => Bl,
	defineSlots: () => za,
	devtools: () => Tc,
	effect: () => st,
	effectScope: () => Ge,
	getCurrentInstance: () => Qs,
	getCurrentScope: () => Ke,
	getCurrentWatcher: () => Bn,
	getTransitionRawChildren: () => mi,
	guardReactiveProps: () => Ls,
	h: () => vc,
	handleError: () => Qn,
	hasInjectionContext: () => jr,
	hydrate: () => Lu,
	hydrateOnIdle: () => Vi,
	hydrateOnInteraction: () => Gi,
	hydrateOnMediaQuery: () => Wi,
	hydrateOnVisible: () => Ui,
	initCustomFormatter: () => yc,
	initDirectivesForSSR: () => Uu,
	inject: () => Ar,
	isMemoSame: () => xc,
	isProxy: () => mn,
	isReactive: () => dn,
	isReadonly: () => fn,
	isRef: () => vn,
	isRuntimeOnly: () => dc,
	isShallow: () => pn,
	isVNode: () => js,
	markRaw: () => hn,
	mergeDefaults: () => Ka,
	mergeModels: () => qa,
	mergeProps: () => Gs,
	nextTick: () => sr,
	nodeOps: () => Fc,
	normalizeClass: () => Oe,
	normalizeProps: () => ke,
	normalizeStyle: () => Ce,
	onActivated: () => $i,
	onBeforeMount: () => sa,
	onBeforeUnmount: () => da,
	onBeforeUpdate: () => la,
	onDeactivated: () => ea,
	onErrorCaptured: () => ga,
	onMounted: () => ca,
	onRenderTracked: () => ha,
	onRenderTriggered: () => ma,
	onScopeDispose: () => qe,
	onServerPrefetch: () => pa,
	onUnmounted: () => fa,
	onUpdated: () => ua,
	onWatcherCleanup: () => Vn,
	openBlock: () => K,
	patchProp: () => Fl,
	popScopeId: () => Tr,
	provide: () => kr,
	proxyRefs: () => Tn,
	pushScopeId: () => wr,
	queuePostFlushCb: () => dr,
	reactive: () => on,
	readonly: () => cn,
	ref: () => H,
	registerRuntimeCompiler: () => uc,
	render: () => Iu,
	renderList: () => Ta,
	renderSlot: () => Da,
	resolveComponent: () => ya,
	resolveDirective: () => Sa,
	resolveDynamicComponent: () => xa,
	resolveFilter: () => null,
	resolveTransitionHooks: () => ui,
	setBlockTracking: () => Ds,
	setDevtoolsHook: () => Ec,
	setTransitionHooks: () => pi,
	shallowReactive: () => sn,
	shallowReadonly: () => ln,
	shallowRef: () => yn,
	ssrContextKey: () => Mr,
	ssrUtils: () => Dc,
	stop: () => ct,
	toDisplayString: () => ze,
	toHandlerKey: () => he,
	toHandlers: () => ka,
	toRaw: () => V,
	toRef: () => jn,
	toRefs: () => On,
	toValue: () => Cn,
	transformVNodeArgs: () => Ns,
	triggerRef: () => Sn,
	unref: () => U,
	useAttrs: () => Ua,
	useCssModule: () => Gl,
	useCssVars: () => ll,
	useHost: () => Ul,
	useId: () => gi,
	useModel: () => go,
	useSSRContext: () => Nr,
	useShadowRoot: () => Wl,
	useSlots: () => Ha,
	useTemplateRef: () => vi,
	useTransitionState: () => ri,
	vModelCheckbox: () => mu,
	vModelDynamic: () => Su,
	vModelRadio: () => gu,
	vModelSelect: () => _u,
	vModelText: () => pu,
	vShow: () => al,
	version: () => Sc,
	warn: () => Cc,
	watch: () => Lr,
	watchEffect: () => Pr,
	watchPostEffect: () => Fr,
	watchSyncEffect: () => Ir,
	withAsyncContext: () => Ya,
	withCtx: () => W,
	withDefaults: () => Va,
	withDirectives: () => Dr,
	withKeys: () => Au,
	withMemo: () => bc,
	withModifiers: () => Ou,
	withScopeId: () => Er
}), Gu = () => {}, Ku = /* @__PURE__ */ on({});
function qu(e, t, n, r, i) {
	Ku[e] = {
		id: e,
		title: t,
		status: n,
		summary: r,
		detail: i,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function Ju(e, t, n) {
	try {
		await n();
	} catch (n) {
		console.error(`[trpg-assistant] 探针 ${e} 出错`, n), qu(e, t, "error", n instanceof Error ? n.message : String(n));
	}
}
function Yu(e) {
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		env: e,
		results: Object.values(Ku)
	};
}
// src/probes/envProbe.ts
var Xu = "env", Zu = "宿主与设备环境";
function Qu() {
	let e = document.createElement("div");
	e.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top)", document.body.appendChild(e);
	let t = getComputedStyle(e).paddingTop;
	return e.remove(), t;
}
async function $u(e) {
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
		safeAreaTop: Qu(),
		contextKeys: Object.keys(e).sort(),
		libsKeys: Object.keys(window.SillyTavern?.libs ?? {}).sort(),
		hasSetExtensionPrompt: typeof e.setExtensionPrompt == "function",
		hasPromptEnums: !!e.extension_prompt_types,
		eventTypeCount: Object.keys(e.event_types ?? {}).length,
		tauri: t
	};
}
function ed(e) {
	let t = () => Ju(Xu, Zu, async () => {
		let t = await $u(e), n = t.tauri;
		qu(Xu, Zu, "info", n.present ? "检测到 TauriTavern 宿主" : "未检测到 TauriTavern（普通 SillyTavern）", t);
	});
	return {
		id: Xu,
		title: Zu,
		hint: "自动检测。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/eventsProbe.ts
var td = "events", nd = "聊天事件", rd = [
	["CHAT_CHANGED", "chat_id_changed"],
	["MESSAGE_SENT", "message_sent"],
	["MESSAGE_RECEIVED", "message_received"],
	["MESSAGE_SWIPED", "message_swiped"],
	["MESSAGE_EDITED", "message_edited"],
	["MESSAGE_DELETED", "message_deleted"],
	["GENERATION_STARTED", "generation_started"],
	["GENERATION_ENDED", "generation_ended"]
];
function id(e) {
	let t = {}, n = [], r = () => {
		let e = rd.map(([e]) => e).filter((e) => !t[e]);
		qu(td, nd, "info", e.length ? `尚未观察到：${e.join("、")}` : "全部事件都已观察到", {
			counts: t,
			recent: n.slice(-30)
		});
	};
	return {
		id: td,
		title: nd,
		hint: "依次做：发送消息、等回复、切换回复（左右箭头）、编辑一条消息、删除一条消息、切换聊天，观察事件是否都能收到。",
		actions: [{
			label: "刷新",
			run: r
		}],
		start: () => {
			for (let [i, a] of rd) g(e, h(e, i, a), (...e) => {
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
var ad = "identity", od = "角色卡 / 群组 / 聊天标识";
function sd(e) {
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
function cd(e) {
	let t = [], n = () => {
		let n = sd(e), r = JSON.stringify([
			n.characterId,
			n.groupId,
			n.chatId
		]);
		t.some((e) => e.key === r) || t.push({
			key: r,
			...n
		}), qu(ad, od, "info", `当前：${n.groupId ? "群组聊天" : n.characterId === null ? "没有打开聊天" : "角色卡聊天"}；已观察 ${t.length} 种上下文`, {
			current: n,
			observed: t
		});
	};
	return {
		id: ad,
		title: od,
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
// src/core/ids.ts
function ld() {
	let e = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(e), e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
	let t = Array.from(e, (e) => e.toString(16).padStart(2, "0"));
	return `${t.slice(0, 4).join("")}-${t.slice(4, 6).join("")}-${t.slice(6, 8).join("")}-${t.slice(8, 10).join("")}-${t.slice(10).join("")}`;
}
function ud(e) {
	let t = e, n = "";
	do
		n = String.fromCharCode(65 + t % 26) + n, t = Math.floor(t / 26) - 1;
	while (t >= 0);
	return n;
}
// node_modules/zod/v4/core/util.js
function dd(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function fd(e, t = "|") {
	return e.map((e) => Ld(e)).join(t);
}
function pd(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var md = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function hd(e) {
	return new md(e);
}
function gd(e) {
	return e == null;
}
function _d(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function vd(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function yd(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function bd(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function xd(e) {
	return bd(e._zod.def) ?? e._zod.def.shape;
}
function Sd(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return yd(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function Cd(e, t, n) {
	t in e ? yd(e, t, n) : e[t] = n;
}
function wd(e, t, n, r) {
	let i = xd(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? Sd(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : Cd(e, a, r ? r(n.value, a) : n.value));
	}
}
function Td(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? Sd(e, n, () => t[n]) : Cd(e, n, r.value));
	}
}
function Ed(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function Dd(e) {
	return JSON.stringify(e);
}
function Od(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var kd = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function Ad(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var jd = /* @__PURE__*/ hd(() => {
	if (Of.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function Md(e) {
	if (Ad(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return Ad(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function Nd(e) {
	return Md(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var Pd = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function Fd(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Id(e, t, n) {
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
function Ld(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function Rd(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var zd = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Bd = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function Vd(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return wd(i, e, Hd(e, t)), Id(e, Ed(n, {
		shape: i,
		checks: []
	}));
}
function Hd(e, t) {
	let n = xd(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function Ud(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Hd(e, t)), a = {};
	return wd(a, e, Reflect.ownKeys(xd(e)).filter((e) => !i.has(e))), Id(e, Ed(n, {
		shape: a,
		checks: []
	}));
}
function Wd(e, t) {
	if (!Md(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = xd(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return Id(e, Ed(e._zod.def, { shape: Gd(e, t) }));
}
function Gd(e, t) {
	let n = {};
	return wd(n, e, Reflect.ownKeys(xd(e))), Td(n, t), n;
}
function Kd(e, t) {
	if (!Md(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return Id(e, Ed(e._zod.def, { shape: Gd(e, t) }));
}
function qd(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return wd(n, e, Reflect.ownKeys(xd(e))), wd(n, t, Reflect.ownKeys(xd(t))), Id(e, Ed(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function Jd(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(Hd(t, n)) : void 0, o = {};
	return wd(o, t, Reflect.ownKeys(xd(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), Id(t, Ed(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Yd(e, t, n) {
	let r = n ? new Set(Hd(t, n)) : void 0, i = {};
	return wd(i, t, Reflect.ownKeys(xd(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), Id(t, Ed(t._zod.def, { shape: i }));
}
function Xd(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function Zd(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function Qd(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function $d(e) {
	return typeof e == "string" ? e : e?.message;
}
function ef(e) {
	let t = [];
	for (let n of e ?? []) {
		let e = n._zod.def;
		if (!/_(length|size)$|_equals$/.test(e.check)) break;
		let r = e.maximum ?? e.length ?? e.size;
		r >= 0 && t.push([r, n]);
	}
	return t;
}
function tf(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function nf(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : $d(e.inst?._zod.def?.error?.(e)) ?? $d(a?.(e)) ?? $d(t?.error?.(e)) ?? $d(n.customError?.(e)) ?? $d(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var rf = /[\uD800-\uDBFF]/;
function af(e) {
	let t = e.length;
	if (!rf.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function of(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function sf(e) {
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
function cf(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function lf(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : pf(e, n, r.value);
	}
}
function uf(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function df(e, t, n) {
	return uf(e, t, n, !1);
}
/* @__NO_SIDE_EFFECTS__ */
function ff(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return uf(this, n, r(this));
			},
			set(e) {
				uf(this, n, e);
			}
		});
	}
	return t;
}
function pf(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : uf(this, t, n.bind(this));
		},
		set(e) {
			uf(this, t, e);
		}
	});
}
function mf(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var hf, gf = !1, _f = {
	configurable: !0,
	get() {
		gf = !0;
	}
};
function vf(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	t in r && hf !== e._zod ? hf = void 0 : (hf = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, _f);
			let e = gf;
			gf = !1;
			try {
				let r = n(this);
				return gf ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), gf ||= e, r;
			} catch (n) {
				throw delete this[t], gf ||= e, n;
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
function yf(e, t, n, r) {
	let i = mf(e, t);
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
var bf = "~constantCatch";
function xf(e) {
	let t = () => e;
	return t[bf] = !0, t;
}
// node_modules/zod/v4/core/core.js
var Sf, Cf = {
	value: void 0,
	enumerable: !1
}, wf = "captureStackTrace" in Error ? Error : null;
function Tf(e) {
	let t = wf;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return wf = null, new e();
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
			Cf.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", Cf);
			} finally {
				Cf.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), lf(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? Tf(u) : this;
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
var Ef = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, Df = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(Sf = globalThis).__zod_globalConfig ?? (Sf.__zod_globalConfig = {});
var Of = globalThis.__zod_globalConfig;
function kf(e) {
	return e && Object.assign(Of, e), Of;
}
// node_modules/zod/v4/core/errors.js
function Af() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, pd, 2), e.message;
}
function jf(e) {
	this._zod.message = e;
}
var Mf = {
	get: Af,
	set: jf,
	enumerable: !0,
	configurable: !0
}, Nf = {
	value: void 0,
	enumerable: !1
}, Pf = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), Ff = /* @__PURE__ */ Z("$ZodError", (e, t) => {
	e.name = "$ZodError", Nf.value = t, Object.defineProperty(e, "issues", Nf), Nf.value = void 0, Object.defineProperty(e, "message", Mf);
	let n = Object.getPrototypeOf(e);
	Pf.has(n) || (Pf.add(n), Object.defineProperty(n, "toString", {
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
function If(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function Lf(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? If(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Rf(e, t = (e) => e.message) {
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
function zf(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var Bf = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new Ef();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => nf(e, o, kf())));
			throw kd(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Vf = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => nf(e, o, kf())));
			throw kd(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Hf = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new Ef();
	return a.issues.length ? Uf(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function Uf(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => nf(e, n, kf()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var Wf = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? Uf(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, Gf = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Kf = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), qf = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== Gf) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return Jf(e, t, n);
});
function Jf(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[Kf] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new Ef();
	return a.issues.length === 0;
}
var Yf = async (e, t, n) => {
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
}, Xf = (e) => {
	let t = Bf(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, zf(n, a));
	};
	return n;
}, Zf = (e) => {
	let t = Bf(e), n = (e, r, i, a) => t(e, r, i, zf(n, a));
	return n;
}, Qf = (e) => {
	let t = Vf(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, zf(n, a));
	};
	return n;
}, $f = (e) => {
	let t = Vf(e), n = async (e, r, i, a) => await t(e, r, i, zf(n, a));
	return n;
}, ep = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Hf(e)(t, n, i);
}, tp = (e) => (t, n, r) => Hf(e)(t, n, r), np = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Wf(e)(t, n, i);
}, rp = (e) => async (t, n, r) => Wf(e)(t, n, r), ip = /^[cC][0-9a-z]{6,}$/, ap = /^[0-9a-z]+$/, op = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, sp = /^[0-9a-vA-V]{20}$/, cp = /^[A-Za-z0-9]{27}$/, lp = /^[a-zA-Z0-9_-]{21}$/;
function up(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var dp = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, fp = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, pp = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, mp = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, hp = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function gp() {
	return new RegExp(hp, "u");
}
var _p = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, vp = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, yp = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, bp = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, xp = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Sp = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, Cp = /^https?$/, wp = /^\+[1-9]\d{6,14}$/, Tp = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function Ep(e) {
	return RegExp(`^${e}$`);
}
var Dp = /*@__PURE__*/ Ep(Tp);
function Op(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function kp(e) {
	return RegExp(`^${Op(e)}$`);
}
function Ap(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${Op({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${Op({ precision: e.precision })}` : n;
	return RegExp(`^${Tp}T(?:${r})$`);
}
var jp = /^[\s\S]{0,}$/, Mp = /^-?\d+$/, Np = /^-?\d+(?:\.\d+)?$/, Pp = /^(?:true|false)$/i, Fp = /^[^A-Z]*$/, Ip = /^[^a-z]*$/, Lp = /*@__PURE__*/ Z("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Rp = (e) => {
	let t = e.value;
	return !gd(t) && t.length !== void 0;
}, zp = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, Bp = /*@__PURE__*/ Z("$ZodCheckLessThan", (e, t) => {
	Lp.init(e, t);
	let n = zp[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: zp[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Vp = /*@__PURE__*/ Z("$ZodCheckGreaterThan", (e, t) => {
	Lp.init(e, t);
	let n = zp[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: zp[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Hp = /*@__PURE__*/ Z("$ZodCheckMultipleOf", (e, t) => {
	Lp.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : vd(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Up = /*@__PURE__*/ Z("$ZodCheckNumberFormat", (e, t) => {
	Lp.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = zd[t.format];
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
}), Wp = /*@__PURE__*/ Z("$ZodCheckMaxLength", (e, t) => {
	var n;
	Lp.init(e, t), (n = e._zod.def).when ?? (n.when = Rp), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? af(r) : i) <= t.maximum) return;
		let a = of(r);
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
}), Gp = /*@__PURE__*/ Z("$ZodCheckMinLength", (e, t) => {
	var n;
	Lp.init(e, t), (n = e._zod.def).when ?? (n.when = Rp), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? af(r) : i) >= t.minimum) return;
		let a = of(r);
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
}), Kp = /*@__PURE__*/ Z("$ZodCheckLengthEquals", (e, t) => {
	var n;
	Lp.init(e, t), (n = e._zod.def).when ?? (n.when = Rp), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? af(r) : i;
		if (a === t.length) return;
		let o = of(r), s = a > t.length;
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
}), qp = /*@__PURE__*/ Z("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	Lp.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
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
}), Jp = /*@__PURE__*/ Z("$ZodCheckRegex", (e, t) => {
	qp.init(e, t), e._zod.check = (n) => {
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
}), Yp = /*@__PURE__*/ Z("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= Fp, qp.init(e, t);
}), Xp = /*@__PURE__*/ Z("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= Ip, qp.init(e, t);
}), Zp = /*@__PURE__*/ Z("$ZodCheckIncludes", (e, t) => {
	Lp.init(e, t);
	let n = Fd(t.includes);
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
}), Qp = /*@__PURE__*/ Z("$ZodCheckStartsWith", (e, t) => {
	Lp.init(e, t);
	let n = RegExp(`^${Fd(t.prefix)}.*`);
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
}), $p = /*@__PURE__*/ Z("$ZodCheckEndsWith", (e, t) => {
	Lp.init(e, t);
	let n = RegExp(`.*${Fd(t.suffix)}$`);
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
}), em = /*@__PURE__*/ Z("$ZodCheckOverwrite", (e, t) => {
	Lp.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), tm = class {
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
}, nm = {
	major: 4,
	minor: 6,
	patch: 7
}, rm = /*@__PURE__*/ Z("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = nm;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = Xd(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (Zd(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new Ef();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (tf(t.issues, n, e), i ||= Xd(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					tf(t.issues, n, e), i ||= Xd(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (Xd(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new Ef();
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
				if (a.async === !1) throw new Ef();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return df(this, "~standard", om(this));
	},
	set "~standard"(e) {
		uf(this, "~standard", e);
	}
}), im = (e, t) => e.issues.length ? { issues: e.issues.map((e) => nf(e, t, kf())) } : { value: e.value };
async function am(e, t) {
	let n = { async: !0 };
	return im(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function om(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return im(r, n);
			} catch {}
			return am(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var sm = /*@__PURE__*/ Z("$ZodString", (e, t) => {
	rm.init(e, t), e._zod.pattern = t.pattern ?? jp, e._zod.parse = (n, r) => {
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
}), cm = /*@__PURE__*/ Z("$ZodStringFormat", (e, t) => {
	qp.init(e, t), sm.init(e, t);
}), lm = /*@__PURE__*/ Z("$ZodGUID", (e, t) => {
	t.pattern ??= fp, cm.init(e, t);
}), um = /*@__PURE__*/ Z("$ZodUUID", (e, t) => {
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
		t.pattern ??= pp(e);
	} else t.pattern ??= pp();
	cm.init(e, t);
}), dm = /*@__PURE__*/ Z("$ZodEmail", (e, t) => {
	t.pattern ??= mp, cm.init(e, t);
});
function fm(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function pm(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? fm(e) || 2 : mm(e, t);
}
function mm(e, t) {
	if (!t.normalize && t.protocol?.source === Cp.source && !/^https?:\/\//i.test(e)) return 1;
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
var hm = /[\t\n\r]/g;
function gm(e) {
	return e.replace(hm, "");
}
function _m(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function vm(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var ym = /*@__PURE__*/ Z("$ZodURL", (e, t) => {
	cm.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = pm(r, t);
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
				n.value = gm(r);
				return;
			}
			t.hostname && !_m(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !vm(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : gm(r);
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
}), bm = /*@__PURE__*/ Z("$ZodEmoji", (e, t) => {
	t.pattern ??= gp(), cm.init(e, t);
}), xm = /*@__PURE__*/ Z("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? lp : up(t.length), cm.init(e, t);
}), Sm = /*@__PURE__*/ Z("$ZodCUID", (e, t) => {
	t.pattern ??= ip, cm.init(e, t);
}), Cm = /*@__PURE__*/ Z("$ZodCUID2", (e, t) => {
	t.pattern ??= ap, cm.init(e, t);
}), wm = /*@__PURE__*/ Z("$ZodULID", (e, t) => {
	t.pattern ??= op, cm.init(e, t);
}), Tm = /*@__PURE__*/ Z("$ZodXID", (e, t) => {
	t.pattern ??= sp, cm.init(e, t);
}), Em = /*@__PURE__*/ Z("$ZodKSUID", (e, t) => {
	t.pattern ??= cp, cm.init(e, t);
}), Dm = /*@__PURE__*/ Z("$ZodISODateTime", (e, t) => {
	t.pattern ??= Ap(t), cm.init(e, t);
}), Om = /*@__PURE__*/ Z("$ZodISODate", (e, t) => {
	t.pattern ??= Dp, cm.init(e, t);
}), km = /*@__PURE__*/ Z("$ZodISOTime", (e, t) => {
	t.pattern ??= kp(t), cm.init(e, t);
}), Am = /*@__PURE__*/ Z("$ZodISODuration", (e, t) => {
	t.pattern ??= dp, cm.init(e, t);
}), jm = /*@__PURE__*/ Z("$ZodIPv4", (e, t) => {
	t.pattern ??= _p, cm.init(e, t);
}), Mm = /^[0-9a-fA-F:.]+$/;
function Nm(e) {
	return Mm.test(e) ? fm(`http://[${e}]`) : !1;
}
var Pm = /*@__PURE__*/ Z("$ZodIPv6", (e, t) => {
	t.pattern ??= vp, cm.init(e, t), e._zod.check = (n) => {
		Nm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Fm = /*@__PURE__*/ Z("$ZodCIDRv4", (e, t) => {
	t.pattern ??= yp, cm.init(e, t);
});
function Im(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : Nm(n);
}
var Lm = /*@__PURE__*/ Z("$ZodCIDRv6", (e, t) => {
	t.pattern ??= bp, cm.init(e, t), e._zod.check = (n) => {
		Im(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function Rm(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var zm = /^[0-9a-zA-Z+/]*={0,2}$/, Bm = /*@__PURE__*/ Z("$ZodBase64", (e, t) => {
	t.pattern ??= zm, cm.init(e, t), e._zod.check = (n) => {
		Rm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Vm = /^[A-Za-z0-9_-]*$/;
function Hm(e) {
	if (!Vm.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return Rm(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var Um = /*@__PURE__*/ Z("$ZodBase64URL", (e, t) => {
	t.pattern ??= Vm, cm.init(e, t), e._zod.check = (n) => {
		Hm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Wm = /*@__PURE__*/ Z("$ZodE164", (e, t) => {
	t.pattern ??= wp, cm.init(e, t);
});
function Gm(e, t = null) {
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
var Km = /*@__PURE__*/ Z("$ZodJWT", (e, t) => {
	cm.init(e, t), e._zod.check = (n) => {
		Gm(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), qm = /*@__PURE__*/ Z("$ZodNumber", (e, t) => {
	rm.init(e, t), e._zod.pattern = Np, e._zod.parse = (n, r) => {
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
}), Jm = /*@__PURE__*/ Z("$ZodNumberFormat", (e, t) => {
	Up.init(e, t), qm.init(e, t);
}), Ym = /*@__PURE__*/ Z("$ZodBoolean", (e, t) => {
	rm.init(e, t), e._zod.pattern = Pp, e._zod.parse = (n, r) => {
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
}), Xm = /*@__PURE__*/ Z("$ZodUnknown", (e, t) => {
	rm.init(e, t), e._zod.parse = (e) => e;
}), Zm = /*@__PURE__*/ Z("$ZodNever", (e, t) => {
	rm.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Qm(e, t) {
	let n = ef(e._zod.def.checks);
	if (!n.length) return;
	let r = Math.min(...n.map((e) => e[0])), i = e._zod.parse;
	e._zod.parse = (n, a) => {
		let o = t(n.value);
		if (o > r && !a?.skipChecks && a?.direction !== "backward") {
			for (let [t, r] of ef(e._zod.def.checks)) if (o > t && r._zod.def.when(n)) {
				let t = n.issues.length;
				return r._zod.check(n), n.issues[t].continue = !1, tf(n.issues, t, e), n;
			}
		}
		return i(n, a);
	};
}
var $m = (e) => Array.isArray(e) ? e.length : -1;
function eh(e, t, n) {
	e.issues.length && t.issues.push(...Qd(n, e.issues)), t.value[n] = e.value;
}
var th = /*@__PURE__*/ Z("$ZodArray", (e, t) => {
	rm.init(e, t);
	let n = Of.memoizer;
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
			if (c instanceof Promise) o.push(c.then((t) => eh(t, r, e)));
			else if (eh(c, r, e), s && c.issues.length !== 0 && Xd(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	}, Qm(e, $m);
});
function nh(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...Qd(n, e.issues));
		}
		!o && i === void 0 ? e.issues.length || t.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [n]
		}) : e.value === void 0 ? (o || i === "defaulted" && !s) && (t.value[n] = void 0) : t.value[n] = e.value;
	}
}
var rh = [];
function ih(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : rh, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = Rd(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function ah(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (Xd(n, p)) break;
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
		a instanceof Promise ? e.push(a.then((e) => nh(e, n, i, t, d, f))) : nh(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var oh = /*@__PURE__*/ Z("$ZodObject", (e, t) => {
	rm.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = hd(() => ih(t));
	vf(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || yd(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = Ad, o = t.catchall, s, c = Of.memoizer;
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
				if (Xd(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => nh(n, t, e, r, a, o))) : nh(s, t, e, r, a, o);
		}
		return o ? ah(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), sh = /*@__PURE__*/ Z("$ZodObjectJIT", (e, t) => {
	oh.init(e, t);
	let n = e._zod.parse, r = hd(() => ih(t)), i = Of.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new tm(["payload", "ctx"], {
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
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : Dd(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
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
	}, o, s = Ad, c = !Of.jitless, l = c && jd.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? ah([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function ch(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !Xd(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => nf(e, r, kf())))
	}), t);
}
var lh = /*@__PURE__*/ Z("$ZodUnion", (e, t) => {
	rm.init(e, t), vf(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), vf(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), vf(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), vf(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => _d(e.source)).join("|")})$`);
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
		return a ? Promise.all(o).then((t) => ch(t, r, e, i)) : ch(o, r, e, i);
	};
}), uh = /*@__PURE__*/ Z("$ZodIntersection", (e, t) => {
	rm.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => fh(e, t, n)) : fh(e, i, a);
	};
});
function dh(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (Md(e) && Md(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = dh(e[n], t[n]);
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
			let i = e[r], a = t[r], o = dh(i, a);
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
function fh(e, t, n) {
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
	let c = dh(t.value, n.value);
	if (!c.valid) {
		if (Xd(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var ph = /*@__PURE__*/ Z("$ZodRecord", (e, t) => {
	rm.init(e, t);
	let n = Of.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!Md(a)) return r.issues.push({
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
						issues: s.issues.map((e) => nf(e, i, kf())),
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
					e.issues.length && r.issues.push(...Qd(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...Qd(n, u.issues)), r.value[l] = u.value);
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
				if (typeof n == "string" && Np.test(n) && l.issues.length) {
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
						issues: l.issues.map((e) => nf(e, i, kf())),
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
					e.issues.length && r.issues.push(...Qd(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...Qd(n, d.issues)), r.value[u] = d.value);
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
}), mh = /*@__PURE__*/ Z("$ZodEnum", (e, t) => {
	rm.init(e, t);
	let n = dd(t.entries), r = new Set(n);
	e._zod.values = r, vf(e, "pattern", (e) => {
		let t = dd(e.def.entries).filter((e) => Pd.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => Fd(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), hh = /*@__PURE__*/ Z("$ZodLiteral", (e, t) => {
	rm.init(e, t);
	let n = new Set(t.values);
	e._zod.values = n, vf(e, "pattern", (e) => {
		let t = e.def.values;
		return RegExp(t.length ? `^(${t.map((e) => typeof e == "string" ? Fd(e) : e ? Fd(e.toString()) : String(e)).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), gh = /*@__PURE__*/ Z("$ZodTransform", (e, t) => {
	rm.init(e, t), e._zod.optin = "optional", Of.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new Df(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new Ef();
		return n.value = i, n;
	};
});
function _h(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var vh = /*@__PURE__*/ Z("$ZodOptional", (e, t) => {
	rm.init(e, t), vf(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", vf(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), vf(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${_d(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => _h(e, t)) : _h(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), yh = /*@__PURE__*/ Z("$ZodExactOptional", (e, t) => {
	vh.init(e, t), vf(e, "values", (e) => e.def.innerType._zod.values), vf(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), bh = /*@__PURE__*/ Z("$ZodNullable", (e, t) => {
	rm.init(e, t), vf(e, "optin", (e) => e.def.innerType._zod.optin), vf(e, "optout", (e) => e.def.innerType._zod.optout), vf(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${_d(t.source)}|null)$`) : void 0;
	}), vf(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), xh = /*@__PURE__*/ Z("$ZodDefault", (e, t) => {
	rm.init(e, t), e._zod.optin = "defaulted", vf(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Sh(e, t)) : Sh(r, t);
	};
});
function Sh(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var Ch = /*@__PURE__*/ Z("$ZodPrefault", (e, t) => {
	rm.init(e, t), e._zod.optin = "defaulted", vf(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), wh = /*@__PURE__*/ Z("$ZodNonOptional", (e, t) => {
	rm.init(e, t), vf(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => Th(t, e)) : Th(i, e);
	};
});
function Th(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function Eh(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => nf(e, r, kf())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var Dh = /*@__PURE__*/ Z("$ZodCatch", (e, t) => {
	rm.init(e, t), vf(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), vf(e, "optout", (e) => e.def.innerType._zod.optout), vf(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => Eh(e, r, t, n)) : Eh(e, r, t, n);
	};
}), Oh = /*@__PURE__*/ Z("$ZodPipe", (e, t) => {
	rm.init(e, t), vf(e, "values", (e) => e.def.in._zod.values), vf(e, "optin", (e) => e.def.in._zod.optin), vf(e, "optout", (e) => e.def.out._zod.optout), vf(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => kh(e, t.in, n)) : kh(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => kh(e, t.out, n)) : kh(r, t.out, n);
	};
});
function kh(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var Ah = /*@__PURE__*/ Z("$ZodReadonly", (e, t) => {
	rm.init(e, t), vf(e, "propValues", (e) => e.def.innerType._zod.propValues), vf(e, "values", (e) => e.def.innerType._zod.values), vf(e, "optin", (e) => e.def.innerType?._zod?.optin), vf(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(jh) : jh(r);
	};
});
function jh(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var Mh = /*@__PURE__*/ Z("$ZodCustom", (e, t) => {
	Lp.init(e, t), rm.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => Nh(t, n, r, e));
		Nh(i, n, r, e);
	};
});
function Nh(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(cf(e));
	}
}
// node_modules/zod/v4/core/memoizer.js
var Ph = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, Fh = "~memo", Ih = [];
function Lh(e) {
	return typeof e == "object" && !!e;
}
function Rh(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var zh = /*@__PURE__*/ new WeakMap(), Bh = 0, Vh = 1, Hh = 2;
function Uh(e, t, n) {
	let r = zh.get(e);
	if (r !== void 0) return r ? Hh : Bh;
	if (t.has(e)) return Hh;
	t.add(e);
	let i = Bh, a = (e) => {
		if (i !== Hh && e?._zod) {
			let r = Uh(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = Bh;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? Vh : o.value?._zod ? Uh(o.value, t, n) : Bh;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = bd(c);
			s(e ? o(e, !0) : Vh), a(c.catchall);
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
			s(r ? Uh(r, t, !1) : Vh);
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
	return t.delete(e), Wh(e, i);
}
function Wh(e, t) {
	return t !== Vh && zh.set(e, t === Hh), t;
}
function Gh(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var Kh, qh = [], Jh = {
	alloc(e, t, n) {
		let r = Kh;
		if (!r) return n;
		Kh = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), qh.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && Xh(n, e.value)) throw new Ph();
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
					let i = Uh(e, /* @__PURE__ */ new Set(), !1);
					if (i === Bh) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === Hh || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!Lh(l)) return t(s, c);
				let u = c[Fh];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[Fh] = u);
				let d;
				i === c ? d = a : (d = Gh(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...Rh(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				Kh = d;
				let p = qh.length, m = t(s, c);
				Kh = void 0;
				let h = qh.length > p ? qh.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? Rh(e.issues) : Ih), e)) : (h && (h.issues = m.issues.length ? Rh(m.issues) : Ih), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function Yh() {
	return Jh;
}
function Xh(e, t) {
	let n = e[Fh]?.backEdges;
	return n !== void 0 && Lh(t) && n.has(t);
}
// node_modules/zod/v4/locales/en.js
var Zh = () => {
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
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(sf(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${Ld(e.values[0])}` : `Invalid option: expected one of ${fd(e.values, "|")}`;
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
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${fd(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function Qh() {
	return { localeError: Zh() };
}
// node_modules/zod/v4/core/registries.js
var $h, eg = class {
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
function tg() {
	return new eg();
}
($h = globalThis).__zod_globalRegistry ?? ($h.__zod_globalRegistry = tg());
var ng = globalThis.__zod_globalRegistry;
// node_modules/zod/v4/core/api.js
function rg(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function ig(e, t) {
	return new e(rg({
		type: "string",
		...X(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function ag(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function og(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sg(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function cg(e, t) {
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
function lg(e, t) {
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
function ug(e, t) {
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
function dg(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fg(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pg(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function mg(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function hg(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function gg(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function _g(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function vg(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function yg(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function bg(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xg(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Sg(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Cg(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function wg(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Tg(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Eg(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Dg(e, t) {
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
function Og(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function kg(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ag(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function jg(e, t) {
	return new e(rg({
		type: "number",
		checks: [],
		...X(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Mg(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ng(e, t) {
	return new e({
		type: "boolean",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Pg(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function Fg(e, t) {
	return new e({
		type: "never",
		...X(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ig(e, t) {
	return new Bp({
		check: "less_than",
		...X(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Lg(e, t) {
	return new Bp({
		check: "less_than",
		...X(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Rg(e, t) {
	return new Vp({
		check: "greater_than",
		...X(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function zg(e, t) {
	return new Vp({
		check: "greater_than",
		...X(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Bg(e, t) {
	return new Hp({
		check: "multiple_of",
		...X(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function Vg(e, t) {
	return new Wp({
		check: "max_length",
		...X(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Hg(e, t) {
	return new Gp({
		check: "min_length",
		...X(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ug(e, t) {
	return new Kp({
		check: "length_equals",
		...X(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function Wg(e, t) {
	return new Jp({
		check: "string_format",
		format: "regex",
		...X(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Gg(e) {
	return new Yp({
		check: "string_format",
		format: "lowercase",
		...X(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Kg(e) {
	return new Xp({
		check: "string_format",
		format: "uppercase",
		...X(e)
	});
}
// @__NO_SIDE_EFFECTS__
function qg(e, t) {
	return new Zp({
		check: "string_format",
		format: "includes",
		...X(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Jg(e, t) {
	return new Qp({
		check: "string_format",
		format: "starts_with",
		...X(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Yg(e, t) {
	return new $p({
		check: "string_format",
		format: "ends_with",
		...X(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Xg(e) {
	return new em({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Zg(e) {
	return /* @__PURE__ */ Xg((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Qg() {
	return /* @__PURE__ */ Xg((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function $g() {
	return /* @__PURE__ */ Xg((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function e_() {
	return /* @__PURE__ */ Xg((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function t_() {
	return /* @__PURE__ */ Xg((e) => Od(e));
}
// @__NO_SIDE_EFFECTS__
function n_(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...X(n)
	});
}
// @__NO_SIDE_EFFECTS__
function r_(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...X(n)
	});
}
// @__NO_SIDE_EFFECTS__
function i_(e, t) {
	let n = /* @__PURE__ */ a_((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(cf(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(cf(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function a_(e, t) {
	let n = new Lp({
		check: "custom",
		...X(t)
	});
	return n._zod.check = e, n;
}
// node_modules/zod/v4/core/to-json-schema.js
function o_(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && yd(e, t, n[t]);
	return e;
}
function s_(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? ng,
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
function c_(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function l_(e, t, n = {
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
		a && (o.ref ||= a, l_(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && o_(o.schema, c), t.io === "input" && y_(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function u_(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function d_(e, t) {
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
				ref: `${i("__shared")}#/${r}/${u_(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + u_(a)
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
function f_(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		f_(e);
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
var p_ = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), m_ = ["oneOf", "anyOf"];
function h_(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function g_(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!p_.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? h_(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			yd(n, r, e.length === 1 ? e[0] : g_(e) ?? { allOf: e });
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
			let t = h_(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function __(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of p_) if (t in e) return;
	let n = t.filter((e) => m_.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = g_(t);
	else {
		let e = n[0], i = m_.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => g_([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, o_(e, r));
}
function v_(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : o_(i, s), o_(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) f_(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) __(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	o_(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, yd(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: x_(t, "input", e.processors),
					output: x_(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function y_(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return y_(r.element, n);
	if (r.type === "set") return y_(r.valueType, n);
	if (r.type === "lazy") return y_(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return y_(r.innerType, n);
	if (r.type === "intersection") return y_(r.left, n) || y_(r.right, n);
	if (r.type === "record" || r.type === "map") return y_(r.keyType, n) || y_(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : y_(r.in, n) || y_(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (y_(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (y_(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (y_(e, n)) return !0;
		return !!(r.rest && y_(r.rest, n));
	}
	return !1;
}
var b_ = (e, t = {}) => (n) => {
	let r = s_({
		...n,
		processors: t
	});
	return l_(e, r), d_(r, e), v_(r, e);
}, x_ = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = s_({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return l_(e, o), d_(o, e), v_(o, e);
}, S_ = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, C_ = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, w_ = (e, t) => {
	S_(e, "minimum", t), C_(e, "maximum", t);
}, T_ = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, E_ = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, D_ = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, O_ = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, k_ = (e, t) => S_(e, "minimum", t.minimum), A_ = (e, t) => C_(e, "maximum", t.maximum), j_ = (e) => (t, n) => {
	O_(t, n.format);
	let [r, i] = e[n.format];
	S_(t, "minimum", r), C_(t, "maximum", i);
}, M_ = {
	greater_than: (e, t) => S_(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => C_(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => T_(e, t.value),
	number_format: j_(zd),
	bigint_format: j_(Bd),
	min_length: k_,
	max_length: A_,
	length_equals: (e, t) => w_(e, t.length),
	min_size: k_,
	max_size: A_,
	size_equals: (e, t) => w_(e, t.size),
	string_format: (e, t) => {
		O_(e, t.format), t.pattern && E_(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => D_(e, t.mime)
};
function N_(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) M_[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && S_(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && S_(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && C_(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && C_(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && T_(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && D_(t, i.mime);
	for (let e of i.patterns ?? []) E_(t, e);
	return t;
}
var P_ = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, F_ = /* @__PURE__ */ new Map([[zm, xp], [Vm, Sp]]), I_ = (e) => F_.get(e) ?? e, L_ = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = N_(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = P_[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(I_);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, R_ = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = N_(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : c_(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, z_ = (e, t, n, r) => {
	n.type = "boolean";
}, B_ = (e, t, n, r) => {
	n.not = {};
}, V_ = (e, t, n, r) => {
	let i = e._zod.def, a = dd(i.entries);
	a.length === 0 ? n.not = {} : (a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a);
}, H_ = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (c_(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (c_(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, U_ = (e, t, n, r) => {
	c_(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, W_ = (e, t, n, r) => {
	c_(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, G_ = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = N_(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = l_(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function K_(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? K_(t.out) : t.type === "catch" ? K_(t.innerType) : e._zod.optin;
}
var q_ = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && c_(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) yd(i.properties, e, l_(o[e], t, {
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
		(t.io === "input" ? K_(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = l_(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, J_ = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => l_(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Y_ = (e, t, n, r) => {
	let i = e._zod.def, a = l_(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = l_(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function X_(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = X_(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => X_(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i && (p.type = "string", a || (p.pattern = (r.includes("number") ? Np : Mp).source)), p;
}
var Z_ = /* @__PURE__ */ new WeakMap();
function Q_(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of Z_.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = X_(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var $_ = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = N_(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = l_(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) yd(i.patternProperties, I_(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = l_(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = Z_.get(t);
			n || (n = [], Z_.set(t, n), t.deferred.push(() => Q_(t))), n.push(e);
		}
		i.additionalProperties = l_(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && K_(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, ev = (e, t, n, r) => {
	let i = e._zod.def, a = l_(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, tv = (e, t, n, r) => {
	let i = e._zod.def;
	l_(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, nv = Symbol();
function rv(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (c_(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), nv) : JSON.parse(o);
}
var iv = (e, t, n, r) => {
	let i = e._zod.def;
	l_(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = rv(i.defaultValue, e, t, n, r);
	o !== nv && (n.default = o);
}, av = (e, t, n, r) => {
	let i = e._zod.def;
	l_(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = rv(i.defaultValue, e, t, n, r);
	o !== nv && (n._prefault = o);
}, ov = (e, t, n, r) => {
	let i = e._zod.def;
	l_(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		c_(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, sv = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	l_(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, cv = (e, t, n, r) => {
	let i = e._zod.def;
	l_(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, lv = (e, t, n, r) => {
	let i = e._zod.def;
	l_(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, uv = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function dv(e, t, n) {
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
var fv = /*@__PURE__*/ Z("ZodError", (e, t) => {
	Ff.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	uv.has(n) || (uv.add(n), dv(n, "format", (e) => (t) => Rf(e, t)), dv(n, "flatten", (e) => (t) => Lf(e, t)), dv(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, pd, 2);
	}), dv(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, pd, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), pv = /* @__PURE__ */ Bf(fv), mv = /* @__PURE__ */ Vf(fv), hv = /* @__PURE__ */ Hf(fv), gv = /* @__PURE__ */ Wf(fv), _v = /* @__PURE__ */ Xf(fv), vv = /* @__PURE__ */ Zf(fv), yv = /* @__PURE__ */ Qf(fv), bv = /* @__PURE__ */ $f(fv), xv = /* @__PURE__ */ ep(fv), Sv = /* @__PURE__ */ tp(fv), Cv = /* @__PURE__ */ np(fv), wv = /* @__PURE__ */ rp(fv);
// node_modules/zod/v4/classic/schemas.js
function Tv() {
	Of.localeError || kf(Qh());
}
function Ev() {
	Of.memoizer || kf({ memoizer: Yh() });
}
var Dv = /*@__PURE__*/ Z("ZodType", (e, t) => (Tv(), rm.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(Ed(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return Id(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(Ky(e, t));
	},
	superRefine(e, t) {
		return this.check(qy(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ Xg(e));
	},
	optional() {
		return Oy(this);
	},
	exactOptional() {
		return Ay(this);
	},
	nullable() {
		return My(this);
	},
	nullish() {
		return Oy(My(this));
	},
	nonoptional(e) {
		return Ry(this, e);
	},
	array() {
		return dy(this);
	},
	or(e) {
		return gy([this, e]);
	},
	and(e) {
		return vy(this, e);
	},
	transform(e) {
		return Hy(this, Ey(e));
	},
	default(e) {
		return Py(this, e);
	},
	prefault(e) {
		return Iy(this, e);
	},
	catch(e) {
		return By(this, e);
	},
	pipe(e) {
		return Hy(this, e);
	},
	readonly() {
		return Wy(this);
	},
	describe(e) {
		let t = this.clone();
		return ng.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return ng.get(this);
		let t = this.clone();
		return ng.add(t, e[0]), t;
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
		return df(this, "~standard", {
			...om(this),
			jsonSchema: {
				input: x_(this, "input"),
				output: x_(this, "output")
			}
		});
	},
	set "~standard"(e) {
		uf(this, "~standard", e);
	},
	parse: function e(t, n) {
		return pv(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await mv(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return hv(this, e, t);
	},
	async safeParseAsync(e, t) {
		return gv(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		uf(this, "spa", e);
	},
	validate(e, t) {
		return qf(this, e, t);
	},
	validateAsync(e, t) {
		return Yf(this, e, t);
	},
	encode: function e(t, n) {
		return _v(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return vv(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await yv(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await bv(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return xv(this, e, t);
	},
	safeDecode(e, t) {
		return Sv(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return Cv(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return wv(this, e, t);
	},
	toJSONSchema(e) {
		return b_(this, {})(e);
	},
	get description() {
		return ng.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), Ov = /*@__PURE__*/ Z("_ZodString", (e, t) => {
	sm.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => L_(e, t, n, r);
}, /*@__PURE__*/ ff({
	format: (e) => N_(e).format ?? null,
	minLength: (e) => N_(e).minimum ?? null,
	maxLength: (e) => N_(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ Wg(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ qg(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ Jg(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ Yg(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ Hg(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ Vg(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ Ug(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ Hg(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ Gg(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ Kg(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ Qg());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ Zg(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ $g());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ e_());
	},
	slugify() {
		return this.check(/* @__PURE__ */ t_());
	}
})), kv = /*@__PURE__*/ Z("ZodString", (e, t) => {
	sm.init(e, t), Ov.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ ag(Fv, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ dg(Rv, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ Eg($v, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ fg(zv, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ og(Iv, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ sg(Lv, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ cg(Lv, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ lg(Lv, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ ug(Lv, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ pg(Bv, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ mg(Vv, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ hg(Hv, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ gg(Uv, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ Cg(Xv, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ wg(Zv, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ _g(Wv, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ vg(Gv, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ yg(Kv, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ bg(qv, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ xg(Jv, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ Sg(Yv, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ Tg(Qv, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ Dg(jv, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ Og(Mv, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ kg(Nv, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ Ag(Pv, e));
	}
});
function Q(e) {
	return /* @__PURE__ */ ig(kv, e);
}
var Av = /*@__PURE__*/ Z("ZodStringFormat", (e, t) => {
	cm.init(e, t), Ov.init(e, t);
}), jv = /*@__PURE__*/ Z("ZodISODateTime", (e, t) => {
	Dm.init(e, t), Av.init(e, t);
}), Mv = /*@__PURE__*/ Z("ZodISODate", (e, t) => {
	Om.init(e, t), Av.init(e, t);
}), Nv = /*@__PURE__*/ Z("ZodISOTime", (e, t) => {
	km.init(e, t), Av.init(e, t);
}), Pv = /*@__PURE__*/ Z("ZodISODuration", (e, t) => {
	Am.init(e, t), Av.init(e, t);
}), Fv = /*@__PURE__*/ Z("ZodEmail", (e, t) => {
	dm.init(e, t), Av.init(e, t);
}), Iv = /*@__PURE__*/ Z("ZodGUID", (e, t) => {
	lm.init(e, t), Av.init(e, t);
}), Lv = /*@__PURE__*/ Z("ZodUUID", (e, t) => {
	um.init(e, t), Av.init(e, t);
}), Rv = /*@__PURE__*/ Z("ZodURL", (e, t) => {
	ym.init(e, t), Av.init(e, t);
}), zv = /*@__PURE__*/ Z("ZodEmoji", (e, t) => {
	bm.init(e, t), Av.init(e, t);
}), Bv = /*@__PURE__*/ Z("ZodNanoID", (e, t) => {
	xm.init(e, t), Av.init(e, t);
}), Vv = /*@__PURE__*/ Z("ZodCUID", (e, t) => {
	Sm.init(e, t), Av.init(e, t);
}), Hv = /*@__PURE__*/ Z("ZodCUID2", (e, t) => {
	Cm.init(e, t), Av.init(e, t);
}), Uv = /*@__PURE__*/ Z("ZodULID", (e, t) => {
	wm.init(e, t), Av.init(e, t);
}), Wv = /*@__PURE__*/ Z("ZodXID", (e, t) => {
	Tm.init(e, t), Av.init(e, t);
}), Gv = /*@__PURE__*/ Z("ZodKSUID", (e, t) => {
	Em.init(e, t), Av.init(e, t);
}), Kv = /*@__PURE__*/ Z("ZodIPv4", (e, t) => {
	jm.init(e, t), Av.init(e, t);
}), qv = /*@__PURE__*/ Z("ZodIPv6", (e, t) => {
	Pm.init(e, t), Av.init(e, t);
}), Jv = /*@__PURE__*/ Z("ZodCIDRv4", (e, t) => {
	Fm.init(e, t), Av.init(e, t);
}), Yv = /*@__PURE__*/ Z("ZodCIDRv6", (e, t) => {
	Lm.init(e, t), Av.init(e, t);
}), Xv = /*@__PURE__*/ Z("ZodBase64", (e, t) => {
	Bm.init(e, t), Av.init(e, t);
}), Zv = /*@__PURE__*/ Z("ZodBase64URL", (e, t) => {
	Um.init(e, t), Av.init(e, t);
}), Qv = /*@__PURE__*/ Z("ZodE164", (e, t) => {
	Wm.init(e, t), Av.init(e, t);
}), $v = /*@__PURE__*/ Z("ZodJWT", (e, t) => {
	Km.init(e, t), Av.init(e, t);
}), ey = /*@__PURE__*/ Z("ZodNumber", (e, t) => {
	qm.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => R_(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ ff({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = N_(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = N_(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = N_(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => N_(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ Rg(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ zg(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ zg(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ Ig(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ Lg(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Lg(e, t));
	},
	int(e) {
		return this.check(ry(e));
	},
	safe(e) {
		return this.check(ry(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ Rg(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ zg(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ Ig(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ Lg(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ Bg(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ Bg(e, t));
	},
	finite() {
		return this;
	}
}));
function ty(e) {
	return /* @__PURE__ */ jg(ey, e);
}
var ny = /*@__PURE__*/ Z("ZodNumberFormat", (e, t) => {
	Jm.init(e, t), ey.init(e, t);
});
function ry(e) {
	return /* @__PURE__ */ Mg(ny, e);
}
var iy = /*@__PURE__*/ Z("ZodBoolean", (e, t) => {
	Ym.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => z_(e, t, n, r);
});
function ay(e) {
	return /* @__PURE__ */ Ng(iy, e);
}
var oy = /*@__PURE__*/ Z("ZodUnknown", (e, t) => {
	Xm.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function sy() {
	return /* @__PURE__ */ Pg(oy);
}
var cy = /*@__PURE__*/ Z("ZodNever", (e, t) => {
	Zm.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => B_(e, t, n, r);
});
function ly(e) {
	return /* @__PURE__ */ Fg(cy, e);
}
var uy = /*@__PURE__*/ Z("ZodArray", (e, t) => {
	Ev(), th.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => G_(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ Hg(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ Hg(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Vg(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ Ug(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function dy(e, t) {
	return /* @__PURE__ */ n_(uy, e, t);
}
var fy = /*@__PURE__*/ Z("ZodObject", (e, t) => {
	Ev(), sh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => q_(e, t, n, r), yf(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return Sy(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(Ed(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(Ed(this._zod.def, { catchall: sy() }));
	},
	loose() {
		return this.clone(Ed(this._zod.def, { catchall: sy() }));
	},
	strict() {
		return this.clone(Ed(this._zod.def, { catchall: ly() }));
	},
	strip() {
		return this.clone(Ed(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Wd(this, e);
	},
	safeExtend(e) {
		return Kd(this, e);
	},
	merge(e) {
		return qd(this, e);
	},
	pick(e) {
		return Vd(this, e);
	},
	omit(e) {
		return Ud(this, e);
	},
	partial(...e) {
		return Jd(Dy, this, e[0]);
	},
	exactPartial(...e) {
		return Jd(ky, this, e[0], "exactPartial");
	},
	required(...e) {
		return Yd(Ly, this, e[0]);
	}
});
function py(e, t) {
	return new fy({
		type: "object",
		shape: e ?? {},
		...X(t)
	});
}
function my(e, t) {
	return new fy({
		type: "object",
		shape: e,
		catchall: sy(),
		...X(t)
	});
}
var hy = /*@__PURE__*/ Z("ZodUnion", (e, t) => {
	lh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => J_(e, t, n, r), e.options = t.options;
});
function gy(e, t) {
	return new hy({
		type: "union",
		options: e,
		...X(t)
	});
}
var _y = /*@__PURE__*/ Z("ZodIntersection", (e, t) => {
	uh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => Y_(e, t, n, r);
});
function vy(e, t) {
	return new _y({
		type: "intersection",
		left: e,
		right: t
	});
}
var yy = /*@__PURE__*/ Z("ZodRecord", (e, t) => {
	Ev(), ph.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => $_(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function by(e, t, n) {
	return !t || !t._zod ? new yy({
		type: "record",
		keyType: Q(),
		valueType: e,
		...X(t)
	}) : new yy({
		type: "record",
		keyType: e,
		valueType: t,
		...X(n)
	});
}
var xy = /*@__PURE__*/ Z("ZodEnum", (e, t) => {
	mh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => V_(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new xy({
			...t,
			checks: [],
			...X(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new xy({
			...t,
			checks: [],
			...X(r),
			entries: i
		});
	};
});
function Sy(e, t) {
	return new xy({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...X(t)
	});
}
var Cy = /*@__PURE__*/ Z("ZodLiteral", (e, t) => {
	hh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => H_(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function wy(e, t) {
	return new Cy({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...X(t)
	});
}
var Ty = /*@__PURE__*/ Z("ZodTransform", (e, t) => {
	Ev(), gh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => W_(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new Df(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(cf(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(cf(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function Ey(e) {
	return new Ty({
		type: "transform",
		transform: e
	});
}
var Dy = /*@__PURE__*/ Z("ZodOptional", (e, t) => {
	vh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => lv(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Oy(e) {
	return new Dy({
		type: "optional",
		innerType: e
	});
}
var ky = /*@__PURE__*/ Z("ZodExactOptional", (e, t) => {
	yh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => lv(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ay(e) {
	return new ky({
		type: "optional",
		innerType: e
	});
}
var jy = /*@__PURE__*/ Z("ZodNullable", (e, t) => {
	bh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => ev(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function My(e) {
	return new jy({
		type: "nullable",
		innerType: e
	});
}
var Ny = /*@__PURE__*/ Z("ZodDefault", (e, t) => {
	xh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => iv(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Py(e, t) {
	return new Ny({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Nd(t);
		}
	});
}
var Fy = /*@__PURE__*/ Z("ZodPrefault", (e, t) => {
	Ch.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => av(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Iy(e, t) {
	return new Fy({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Nd(t);
		}
	});
}
var Ly = /*@__PURE__*/ Z("ZodNonOptional", (e, t) => {
	wh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => tv(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ry(e, t) {
	return new Ly({
		type: "nonoptional",
		innerType: e,
		...X(t)
	});
}
var zy = /*@__PURE__*/ Z("ZodCatch", (e, t) => {
	Dh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => ov(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function By(e, t) {
	return new zy({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : xf(t)
	});
}
var Vy = /*@__PURE__*/ Z("ZodPipe", (e, t) => {
	Oh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => sv(e, t, n, r), e.in = t.in, e.out = t.out;
});
function Hy(e, t) {
	return new Vy({
		type: "pipe",
		in: e,
		out: t
	});
}
var Uy = /*@__PURE__*/ Z("ZodReadonly", (e, t) => {
	Ah.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => cv(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Wy(e) {
	return new Uy({
		type: "readonly",
		innerType: e
	});
}
var Gy = /*@__PURE__*/ Z("ZodCustom", (e, t) => {
	Mh.init(e, t), Dv.init(e, t), e._zod.processJSONSchema = (t, n, r) => U_(e, t, n, r);
});
function Ky(e, t = {}) {
	return /* @__PURE__ */ r_(Gy, e, t);
}
function qy(e, t) {
	return /* @__PURE__ */ i_(e, t);
}
// src/schemas/common.ts
var Jy = {
	workspace: 1,
	save: 1,
	pack: 1
}, Yy = Q().regex(/^[a-z0-9][a-z0-9-]*$/, "必须是小写字母、数字与短横线").max(64), Xy = Q().regex(/^\d+\.\d+\.\d+$/, "必须是 x.y.z 形式的版本号"), Zy = ty().int().nonnegative(), Qy = Uint8Array, $y = Uint16Array, eb = Int32Array, tb = new Qy([
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
]), nb = new Qy([
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
]), rb = new Qy([
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
]), ib = function(e, t) {
	for (var n = new $y(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new eb(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, ab = ib(tb, 2), ob = ab.b, sb = ab.r;
ob[28] = 258, sb[258] = 28;
for (var cb = ib(nb, 0), lb = cb.b, ub = cb.r, db = new $y(32768), fb = 0; fb < 32768; ++fb) {
	var pb = (fb & 43690) >> 1 | (fb & 21845) << 1;
	pb = (pb & 52428) >> 2 | (pb & 13107) << 2, pb = (pb & 61680) >> 4 | (pb & 3855) << 4, db[fb] = ((pb & 65280) >> 8 | (pb & 255) << 8) >> 1;
}
for (var mb = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new $y(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new $y(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new $y(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[db[d] >> c] = l;
	} else for (s = new $y(r), i = 0; i < r; ++i) e[i] && (s[i] = db[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), hb = new Qy(288), fb = 0; fb < 144; ++fb) hb[fb] = 8;
for (var fb = 144; fb < 256; ++fb) hb[fb] = 9;
for (var fb = 256; fb < 280; ++fb) hb[fb] = 7;
for (var fb = 280; fb < 288; ++fb) hb[fb] = 8;
for (var gb = new Qy(32), fb = 0; fb < 32; ++fb) gb[fb] = 5;
var _b = /*#__PURE__*/ mb(hb, 9, 0), vb = /*#__PURE__*/ mb(hb, 9, 1), yb = /*#__PURE__*/ mb(gb, 5, 0), bb = /*#__PURE__*/ mb(gb, 5, 1), xb = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, Sb = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, Cb = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, wb = function(e) {
	return (e + 7) / 8 | 0;
}, Tb = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new Qy(e.subarray(t, n));
}, Eb = [
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
], Db = function(e, t, n) {
	var r = Error(t || Eb[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, Db), !n) throw r;
	return r;
}, Ob = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new Qy(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new Qy(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new Qy(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = Sb(e, d, 1);
			var v = Sb(e, d + 1, 3);
			if (d += 3, !v) {
				var y = wb(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && Db(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = vb, m = bb, h = 9, g = 5;
			else if (v == 2) {
				var S = Sb(e, d, 31) + 257, C = Sb(e, d + 10, 15) + 4, w = S + Sb(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new Qy(w), E = new Qy(19), D = 0; D < C; ++D) E[rb[D]] = Sb(e, d + D * 3, 7);
				d += C * 3;
				for (var O = xb(E), k = (1 << O) - 1, ee = mb(E, O, 1), D = 0; D < w;) {
					var te = ee[Sb(e, d, k)];
					d += te & 15;
					var y = te >> 4;
					if (y < 16) T[D++] = y;
					else {
						var ne = 0, A = 0;
						for (y == 16 ? (A = 3 + Sb(e, d, 3), d += 2, ne = T[D - 1]) : y == 17 ? (A = 3 + Sb(e, d, 7), d += 3) : y == 18 && (A = 11 + Sb(e, d, 127), d += 7); A--;) T[D++] = ne;
					}
				}
				var j = T.subarray(0, S), M = T.subarray(S);
				h = xb(j), g = xb(M), p = mb(j, h, 1), m = mb(M, g, 1);
			} else Db(1);
			if (d > _) {
				c && Db(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var re = (1 << h) - 1, N = (1 << g) - 1, ie = d;; ie = d) {
			var ne = p[Cb(e, d) & re], ae = ne >> 4;
			if (d += ne & 15, d > _) {
				c && Db(0);
				break;
			}
			if (ne || Db(2), ae < 256) n[f++] = ae;
			else if (ae == 256) {
				ie = d, p = null;
				break;
			} else {
				var oe = ae - 254;
				if (ae > 264) {
					var D = ae - 257, P = tb[D];
					oe = Sb(e, d, (1 << P) - 1) + ob[D], d += P;
				}
				var se = m[Cb(e, d) & N], ce = se >> 4;
				se || Db(3), d += se & 15;
				var M = lb[ce];
				if (ce > 3) {
					var P = nb[ce];
					M += Cb(e, d) & (1 << P) - 1, d += P;
				}
				if (d > _) {
					c && Db(0);
					break;
				}
				s && l(f + 131072);
				var le = f + oe;
				if (f < M) {
					var ue = a - M, de = Math.min(M, le);
					for (ue + f < 0 && Db(3); f < de; ++f) n[f] = r[ue + f];
				}
				for (; f < le; ++f) n[f] = n[f - M];
			}
		}
		t.l = p, t.p = ie, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? Tb(n, 0, f) : n.subarray(0, f);
}, kb = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8;
}, Ab = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, jb = function(e, t) {
	for (var n = [], r = 0; r < e.length; ++r) e[r] && n.push({
		s: r,
		f: e[r]
	});
	var i = n.length, a = n.slice();
	if (!i) return {
		t: Rb,
		l: 0
	};
	if (i == 1) {
		var o = new Qy(n[0].s + 1);
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
	var p = new $y(f + 1), m = Mb(n[u - 1], p, 0);
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
		t: new Qy(p),
		l: m
	};
}, Mb = function(e, t, n) {
	return e.s == -1 ? Math.max(Mb(e.l, t, n + 1), Mb(e.r, t, n + 1)) : t[e.s] = n;
}, Nb = function(e) {
	for (var t = e.length; t && !e[--t];);
	for (var n = new $y(++t), r = 0, i = e[0], a = 1, o = function(e) {
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
}, Pb = function(e, t) {
	for (var n = 0, r = 0; r < t.length; ++r) n += e[r] * t[r];
	return n;
}, Fb = function(e, t, n) {
	var r = n.length, i = wb(t + 2);
	e[i] = r & 255, e[i + 1] = r >> 8, e[i + 2] = e[i] ^ 255, e[i + 3] = e[i + 1] ^ 255;
	for (var a = 0; a < r; ++a) e[i + a + 4] = n[a];
	return (i + 4 + r) * 8;
}, Ib = function(e, t, n, r, i, a, o, s, c, l, u) {
	kb(t, u++, n), ++i[256];
	for (var d = jb(i, 15), f = d.t, p = d.l, m = jb(a, 15), h = m.t, g = m.l, _ = Nb(f), v = _.c, y = _.n, b = Nb(h), x = b.c, S = b.n, C = new $y(19), w = 0; w < v.length; ++w) ++C[v[w] & 31];
	for (var w = 0; w < x.length; ++w) ++C[x[w] & 31];
	for (var T = jb(C, 7), E = T.t, D = T.l, O = 19; O > 4 && !E[rb[O - 1]]; --O);
	var k = l + 5 << 3, ee = Pb(i, hb) + Pb(a, gb) + o, te = Pb(i, f) + Pb(a, h) + o + 14 + 3 * O + Pb(C, E) + 2 * C[16] + 3 * C[17] + 7 * C[18];
	if (c >= 0 && k <= ee && k <= te) return Fb(t, u, e.subarray(c, c + l));
	var ne, A, j, M;
	if (kb(t, u, 1 + (te < ee)), u += 2, te < ee) {
		ne = mb(f, p, 0), A = f, j = mb(h, g, 0), M = h;
		var re = mb(E, D, 0);
		kb(t, u, y - 257), kb(t, u + 5, S - 1), kb(t, u + 10, O - 4), u += 14;
		for (var w = 0; w < O; ++w) kb(t, u + 3 * w, E[rb[w]]);
		u += 3 * O;
		for (var N = [v, x], ie = 0; ie < 2; ++ie) for (var ae = N[ie], w = 0; w < ae.length; ++w) {
			var oe = ae[w] & 31;
			kb(t, u, re[oe]), u += E[oe], oe > 15 && (kb(t, u, ae[w] >> 5 & 127), u += ae[w] >> 12);
		}
	} else ne = _b, A = hb, j = yb, M = gb;
	for (var w = 0; w < s; ++w) {
		var P = r[w];
		if (P > 255) {
			var oe = P >> 18 & 31;
			Ab(t, u, ne[oe + 257]), u += A[oe + 257], oe > 7 && (kb(t, u, P >> 23 & 31), u += tb[oe]);
			var se = P & 31;
			Ab(t, u, j[se]), u += M[se], se > 3 && (Ab(t, u, P >> 5 & 8191), u += nb[se]);
		} else Ab(t, u, ne[P]), u += A[P];
	}
	return Ab(t, u, ne[256]), u + A[256];
}, Lb = /*#__PURE__*/ new eb([
	65540,
	131080,
	131088,
	131104,
	262176,
	1048704,
	1048832,
	2114560,
	2117632
]), Rb = /*#__PURE__*/ new Qy(0), zb = function(e, t, n, r, i, a) {
	var o = a.z || e.length, s = new Qy(r + o + 5 * (1 + Math.ceil(o / 7e3)) + i), c = s.subarray(r, s.length - i), l = a.l, u = (a.r || 0) & 7;
	if (t) {
		u && (c[0] = a.r >> 3);
		for (var d = Lb[t - 1], f = d >> 13, p = d & 8191, m = (1 << n) - 1, h = a.p || new $y(32768), g = a.h || new $y(m + 1), _ = Math.ceil(n / 3), v = 2 * _, y = function(t) {
			return (e[t] ^ e[t + 1] << _ ^ e[t + 2] << v) & m;
		}, b = new eb(25e3), x = new $y(288), S = new $y(32), C = 0, w = 0, T = a.i || 0, E = 0, D = a.w || 0, O = 0; T + 2 < o; ++T) {
			var k = y(T), ee = T & 32767, te = g[k];
			if (h[ee] = te, g[k] = ee, D <= T) {
				var ne = o - T;
				if ((C > 7e3 || E > 24576) && (ne > 423 || !l)) {
					u = Ib(e, c, 0, b, x, S, w, E, O, T - O, u), E = C = w = 0, O = T;
					for (var A = 0; A < 286; ++A) x[A] = 0;
					for (var A = 0; A < 30; ++A) S[A] = 0;
				}
				var j = 2, M = 0, re = p, N = ee - te & 32767;
				if (ne > 2 && k == y(T - N)) for (var ie = Math.min(f, ne) - 1, ae = Math.min(32767, T), oe = Math.min(258, ne); N <= ae && --re && ee != te;) {
					if (e[T + j] == e[T + j - N]) {
						for (var P = 0; P < oe && e[T + P] == e[T + P - N]; ++P);
						if (P > j) {
							if (j = P, M = N, P > ie) break;
							for (var se = Math.min(N, P - 2), ce = 0, A = 0; A < se; ++A) {
								var le = T - N + A & 32767, ue = le - h[le] & 32767;
								ue > ce && (ce = ue, te = le);
							}
						}
					}
					ee = te, te = h[ee], N += ee - te & 32767;
				}
				if (M) {
					b[E++] = 268435456 | sb[j] << 18 | ub[M];
					var de = sb[j] & 31, F = ub[M] & 31;
					w += tb[de] + nb[F], ++x[257 + de], ++S[F], D = T + j, ++C;
				} else b[E++] = e[T], ++x[e[T]];
			}
		}
		for (T = Math.max(T, D); T < o; ++T) b[E++] = e[T], ++x[e[T]];
		u = Ib(e, c, l, b, x, S, w, E, O, T - O, u), l || (a.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, a.h = g, a.p = h, a.i = T, a.w = D);
	} else {
		for (var T = a.w || 0; T < o + l; T += 65535) {
			var fe = T + 65535;
			fe >= o && (c[u / 8 | 0] = l, fe = o), u = Fb(c, u + 1, e.subarray(T, fe));
		}
		a.i = o;
	}
	return Tb(s, 0, r + wb(u) + i);
}, Bb = /*#__PURE__*/ (function() {
	for (var e = /* @__PURE__ */ new Int32Array(256), t = 0; t < 256; ++t) {
		for (var n = t, r = 9; --r;) n = (n & 1 && -306674912) ^ n >>> 1;
		e[t] = n;
	}
	return e;
})(), Vb = function() {
	var e = -1;
	return {
		p: function(t) {
			for (var n = e, r = 0; r < t.length; ++r) n = Bb[n & 255 ^ t[r]] ^ n >>> 8;
			e = n;
		},
		d: function() {
			return ~e;
		}
	};
}, Hb = function(e, t, n, r, i) {
	if (!i && (i = { l: 1 }, t.dictionary)) {
		var a = t.dictionary.subarray(-32768), o = new Qy(a.length + e.length);
		o.set(a), o.set(e, a.length), e = o, i.w = a.length;
	}
	return zb(e, t.level == null ? 6 : t.level, t.mem == null ? i.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, i);
}, Ub = function(e, t) {
	var n = {};
	for (var r in e) n[r] = e[r];
	for (var r in t) n[r] = t[r];
	return n;
}, Wb = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, Gb = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, Kb = function(e, t) {
	return Gb(e, t) + Gb(e, t + 4) * 4294967296;
}, qb = function(e, t, n) {
	for (; n; ++t) e[t] = n, n >>>= 8;
};
function Jb(e, t) {
	return Hb(e, t || {}, 0, 0);
}
function Yb(e, t) {
	return Ob(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var Xb = function(e, t, n, r) {
	for (var i in e) {
		var a = e[i], o = t + i, s = r;
		Array.isArray(a) && (s = Ub(r, a[1]), a = a[0]), ArrayBuffer.isView(a) ? n[o] = [a, s] : (n[o += "/"] = [new Qy(0), s], Xb(a, o, n, r));
	}
}, Zb = typeof TextEncoder < "u" && /*#__PURE__*/ new TextEncoder(), Qb = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	Qb.decode(Rb, { stream: !0 });
} catch {}
var $b = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: Tb(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function ex(e, t) {
	if (t) {
		for (var n = new Qy(e.length), r = 0; r < e.length; ++r) n[r] = e.charCodeAt(r);
		return n;
	}
	if (Zb) return Zb.encode(e);
	for (var i = e.length, a = new Qy(e.length + (e.length >> 1)), o = 0, s = function(e) {
		a[o++] = e;
	}, r = 0; r < i; ++r) {
		if (o + 5 > a.length) {
			var c = new Qy(o + 8 + (i - r << 1));
			c.set(a), a = c;
		}
		var l = e.charCodeAt(r);
		l < 128 || t ? s(l) : l < 2048 ? (s(192 | l >> 6), s(128 | l & 63)) : l > 55295 && l < 57344 ? (l = 65536 + (l & 1047552) | e.charCodeAt(++r) & 1023, s(240 | l >> 18), s(128 | l >> 12 & 63), s(128 | l >> 6 & 63), s(128 | l & 63)) : (s(224 | l >> 12), s(128 | l >> 6 & 63), s(128 | l & 63));
	}
	return Tb(a, 0, o);
}
function tx(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	}
	if (Qb) return Qb.decode(e);
	var i = $b(e), a = i.s, n = i.r;
	return n.length && Db(8), a;
}
var nx = function(e, t) {
	return t + 30 + Wb(e, t + 26) + Wb(e, t + 28);
}, rx = function(e, t, n) {
	var r = Wb(e, t + 28), i = Wb(e, t + 30), a = tx(e.subarray(t + 46, t + 46 + r), !(Wb(e, t + 8) & 2048)), o = t + 46 + r, s = ix(e, o, i, n, Gb(e, t + 20), Gb(e, t + 24), Gb(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		Wb(e, t + 10),
		c,
		l,
		a,
		o + i + Wb(e, t + 32),
		u
	];
}, ix = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + Wb(e, t + 2)) if (Wb(e, t) == 1) return [
			s ? Kb(e, t + 4 + 8 * c) : i,
			c ? Kb(e, t + 4) : a,
			l ? Kb(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && Db(13);
	}
	return [
		i,
		a,
		o,
		0
	];
}, ax = function(e) {
	var t = 0;
	if (e) for (var n in e) {
		var r = e[n].length;
		r > 65535 && Db(9), t += r + 4;
	}
	return t;
}, ox = function(e, t, n, r, i, a, o, s) {
	var c = r.length, l = n.extra, u = s && s.length, d = ax(l);
	qb(e, t, o == null ? 67324752 : 33639248), t += 4, o != null && (e[t++] = 20, e[t++] = n.os), e[t] = 20, t += 2, e[t++] = n.flag << 1 | (a < 0 && 8), e[t++] = i && 8, e[t++] = n.compression & 255, e[t++] = n.compression >> 8;
	var f = new Date(n.mtime == null ? Date.now() : n.mtime), p = f.getFullYear() - 1980;
	if ((p < 0 || p > 119) && Db(10), qb(e, t, p << 25 | f.getMonth() + 1 << 21 | f.getDate() << 16 | f.getHours() << 11 | f.getMinutes() << 5 | f.getSeconds() >> 1), t += 4, a != -1 && (qb(e, t, n.crc), qb(e, t + 4, a < 0 ? -a - 2 : a), qb(e, t + 8, n.size)), qb(e, t + 12, c), qb(e, t + 14, d), t += 16, o != null && (qb(e, t, u), qb(e, t + 6, n.attrs), qb(e, t + 10, o), t += 14), e.set(r, t), t += c, d) for (var m in l) {
		var h = l[m], g = h.length;
		qb(e, t, +m), qb(e, t + 2, g), e.set(h, t + 4), t += 4 + g;
	}
	return u && (e.set(s, t), t += u), t;
}, sx = function(e, t, n, r, i) {
	qb(e, t, 101010256), qb(e, t + 8, n), qb(e, t + 10, n), qb(e, t + 12, r), qb(e, t + 16, i);
};
function cx(e, t) {
	t ||= {};
	var n = {}, r = [];
	Xb(e, "", n, t);
	var i = 0, a = 0;
	for (var o in n) {
		var s = n[o], c = s[0], l = s[1], u = l.level == 0 ? 0 : 8, d = ex(o), f = d.length, p = l.comment, m = p && ex(p), h = m && m.length, g = ax(l.extra);
		f > 65535 && Db(11);
		var _ = u ? Jb(c, l) : c, v = _.length, y = Vb();
		y.p(c), r.push(Ub(l, {
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
	for (var b = new Qy(a + 22), x = i, S = a - i, C = 0; C < r.length; ++C) {
		var d = r[C];
		ox(b, d.o, d, d.f, d.u, d.c.length);
		var w = 30 + d.f.length + ax(d.extra);
		b.set(d.c, d.o + w), ox(b, i, d, d.f, d.u, d.c.length, d.o, d.m), i += 16 + w + (d.m ? d.m.length : 0);
	}
	return sx(b, i, r.length, S, x), b;
}
function lx(e, t) {
	for (var n = {}, r = e.length - 22; Gb(e, r) != 101010256; --r) (!r || e.length - r > 65558) && Db(13);
	var i = Wb(e, r + 8);
	if (!i) return {};
	var a = Gb(e, r + 16), o = Gb(e, r - 20) == 117853008;
	if (o) {
		var s = Gb(e, r - 12);
		o = Gb(e, s) == 101075792, o && (i = Gb(e, s + 32), a = Gb(e, s + 48));
	}
	for (var c = t && t.filter, l = 0; l < i; ++l) {
		var u = rx(e, a, o), d = u[0], f = u[1], p = u[2], m = u[3], h = u[4], g = u[5], _ = nx(e, g);
		a = h, (!c || c({
			name: m,
			size: f,
			originalSize: p,
			compression: d
		})) && (d ? d == 8 ? n[m] = Yb(e.subarray(_, _ + f), { out: new Qy(p) }) : Db(14, "unknown compression type " + d) : n[m] = Tb(e, _, _ + f));
	}
	return n;
}
// src/core/errors.ts
var $ = class extends Error {
	code;
	details;
	constructor(e, t, n) {
		super(t), this.name = "TrpgError", this.code = e, this.details = n;
	}
};
function ux(e) {
	return e?.name === "QuotaExceededError";
}
var dx = "存储空间不足：可以删除不用的内容包，或清空最近删除";
// src/core/packs/zip.ts
function fx(e) {
	try {
		return lx(e);
	} catch {
		throw new $("E_NOT_ZIP", "无法识别：这不是 TRPG 跑团助手的文件");
	}
}
function px(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) t[n] = typeof r == "string" ? ex(r) : r;
	return cx(t, { level: 6 });
}
function mx(e, t) {
	let n = e[t];
	if (n) try {
		return JSON.parse(tx(n));
	} catch {
		throw new $("E_BAD_CONTENT", `文件内容损坏：${t} 无法解析`);
	}
}
// src/core/packs/file.ts
function hx(e) {
	let t = {}, n = /* @__PURE__ */ new Map();
	for (let r of e.entries) {
		t[r.type] = (t[r.type] ?? 0) + 1;
		let e = n.get(r.type) ?? [];
		e.push(r), n.set(r.type, e);
	}
	let r = {
		license: "",
		attribution: "",
		description: "",
		dependsOn: [],
		...e.manifest,
		entryCount: e.entries.length,
		typeCounts: t
	}, i = { "trpg-manifest.json": JSON.stringify({
		format: "trpg-pack",
		formatVersion: 1,
		pack: r
	}) };
	for (let [e, t] of n) i[`entries/${encodeURIComponent(e)}.json`] = JSON.stringify(t);
	for (let [t, n] of e.assets ?? []) i[`assets/${t}`] = n;
	return px(i);
}
// node_modules/dexie/import-wrapper.mjs
var gx = /* @__PURE__ */ l((/* @__PURE__ */ o(((e, t, n) => {
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
		function O(e) {
			return D.apply([], e);
		}
		var k = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(O([
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
		}), ee = new Set(k.map(function(e) {
			return i[e];
		}));
		function te(e) {
			var t = {};
			for (var n in e) if (u(e, n)) {
				var r = e[n];
				t[n] = !r || typeof r != "object" || ee.has(r.constructor) ? r : te(r);
			}
			return t;
		}
		var ne = null;
		function A(e) {
			ne = /* @__PURE__ */ new WeakMap();
			var t = j(e);
			return ne = null, t;
		}
		function j(e) {
			if (!e || typeof e != "object") return e;
			var t = ne.get(e);
			if (t) return t;
			if (o(e)) {
				t = [], ne.set(e, t);
				for (var n = 0, r = e.length; n < r; ++n) t.push(j(e[n]));
			} else if (ee.has(e.constructor)) t = e;
			else {
				var i = c(e);
				for (var a in t = i === Object.prototype ? {} : Object.create(i), ne.set(e, t), e) u(e, a) && (t[a] = j(e[a]));
			}
			return t;
		}
		var M = {}.toString;
		function re(e) {
			return M.call(e).slice(8, -1);
		}
		var N = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", ie = typeof N == "symbol" ? function(e) {
			var t;
			return e != null && (t = e[N]) && t.apply(e);
		} : function() {
			return null;
		};
		function ae(e, t) {
			var n = e.indexOf(t);
			return n >= 0 && e.splice(n, 1), n >= 0;
		}
		var oe = {};
		function P(e) {
			var t, n, r, i;
			if (arguments.length === 1) {
				if (o(e)) return e.slice();
				if (this === oe && typeof e == "string") return [e];
				if (i = ie(e)) {
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
		var se = typeof Symbol < "u" ? function(e) {
			return e[Symbol.toStringTag] === "AsyncFunction";
		} : function() {
			return !1;
		}, ce = [
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
		], le = [
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
		], ue = ce.concat(le), de = {
			VersionChanged: "Database version changed by other database connection",
			DatabaseClosed: "Database has been closed",
			Abort: "Transaction aborted",
			TransactionInactive: "Transaction has already completed or failed",
			MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
		};
		function F(e, t) {
			this.name = e, this.message = t;
		}
		m(F).from(Error).extend({ toString: function() {
			return this.name + ": " + this.message;
		} });
		function fe(e, t) {
			return e + ". Errors: " + Object.keys(t).map(function(e) {
				return t[e].toString();
			}).filter(function(e, t, n) {
				return n.indexOf(e) === t;
			}).join("\n");
		}
		function pe(e, t, n, r) {
			this.failures = t, this.failedKeys = r, this.successCount = n, this.message = fe(e, t);
		}
		m(pe).from(F);
		function me(e, t) {
			this.name = "BulkError", this.failures = Object.keys(t).map(function(e) {
				return t[e];
			}), this.failuresByPos = t, this.message = fe(e, this.failures);
		}
		m(me).from(F);
		var he = ue.reduce(function(e, t) {
			return e[t] = t + "Error", e;
		}, {}), ge = F, I = ue.reduce(function(e, t) {
			var n = t + "Error";
			function r(e, r) {
				this.name = n, e ? typeof e == "string" ? (this.message = `${e}${r ? "\n " + r : ""}`, this.inner = r || null) : typeof e == "object" && (this.message = `${e.name} ${e.message}`, this.inner = e) : (this.message = de[t] || n, this.inner = null);
			}
			return m(r).from(ge), e[t] = r, e;
		}, {});
		I.Syntax = SyntaxError, I.Type = TypeError, I.Range = RangeError;
		var _e = le.reduce(function(e, t) {
			return e[t + "Error"] = I[t], e;
		}, {});
		function ve(e, t) {
			if (!e || e instanceof F || e instanceof TypeError || e instanceof SyntaxError || !e.name || !_e[e.name]) return e;
			var n = new _e[e.name](t || e.message, e);
			return "stack" in e && p(n, "stack", { get: function() {
				return this.inner.stack;
			} }), n;
		}
		var ye = ue.reduce(function(e, t) {
			return [
				"Syntax",
				"Type",
				"Range"
			].indexOf(t) === -1 && (e[t + "Error"] = I[t]), e;
		}, {});
		ye.ModifyError = pe, ye.DexieError = F, ye.BulkError = me;
		function be() {}
		function xe(e) {
			return e;
		}
		function Se(e, t) {
			return e == null || e === xe ? t : function(n) {
				return t(e(n));
			};
		}
		function Ce(e, t) {
			return function() {
				e.apply(this, arguments), t.apply(this, arguments);
			};
		}
		function we(e, t) {
			return e === be ? t : function() {
				var n = e.apply(this, arguments);
				n !== void 0 && (arguments[0] = n);
				var r = this.onsuccess, i = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var a = t.apply(this, arguments);
				return r && (this.onsuccess = this.onsuccess ? Ce(r, this.onsuccess) : r), i && (this.onerror = this.onerror ? Ce(i, this.onerror) : i), a === void 0 ? n : a;
			};
		}
		function Te(e, t) {
			return e === be ? t : function() {
				e.apply(this, arguments);
				var n = this.onsuccess, r = this.onerror;
				this.onsuccess = this.onerror = null, t.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? Ce(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? Ce(r, this.onerror) : r);
			};
		}
		function Ee(e, t) {
			return e === be ? t : function() {
				var n = e.apply(this, arguments), r = arguments[0];
				s(r, n);
				var i = this.onsuccess, a = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var o = t.apply(this, arguments);
				return i && (this.onsuccess = this.onsuccess ? Ce(i, this.onsuccess) : i), a && (this.onerror = this.onerror ? Ce(a, this.onerror) : a), n === void 0 ? o === void 0 ? void 0 : o : s(n, o);
			};
		}
		function De(e, t) {
			return e === be ? t : function() {
				return t.apply(this, arguments) !== !1 && e.apply(this, arguments);
			};
		}
		function Oe(e, t) {
			return e === be ? t : function() {
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
		var ke = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
		function Ae(e, t) {
			ke = e;
		}
		var je = {}, Me = 100, Ne = typeof Promise > "u" ? [] : (function() {
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
		})(), Pe = Ne[0], Fe = Ne[1], Ie = Ne[2], Le = Fe && Fe.then, Re = Pe && Pe.constructor, ze = !!Ie;
		function Be() {
			queueMicrotask(it);
		}
		var Ve = function(e, t) {
			Je.push([e, t]), Ue &&= (Be(), !1);
		}, He = !0, Ue = !0, We = [], Ge = [], Ke = xe, qe = {
			id: "global",
			global: !0,
			ref: 0,
			unhandleds: [],
			onunhandled: be,
			pgp: !1,
			env: {},
			finalize: be
		}, L = qe, Je = [], Ye = 0, Xe = [];
		function R(e) {
			if (typeof this != "object") throw TypeError("Promises must be constructed via new");
			this._listeners = [], this._lib = !1;
			var t = this._PSD = L;
			if (typeof e != "function") {
				if (e !== je) throw TypeError("Not a function");
				this._state = arguments[1], this._value = arguments[2], this._state === !1 && et(this, this._value);
			} else this._state = null, this._value = null, ++t.ref, $e(this, e);
		}
		var Ze = {
			get: function() {
				var e = L, t = gt;
				function n(n, r) {
					var i = this, a = !e.global && (e !== L || t !== gt), o = a && !bt(), s = new R(function(t, s) {
						nt(i, new Qe(Dt(n, e, a, o), Dt(r, e, a, o), t, s, e));
					});
					return this._consoleTask && (s._consoleTask = this._consoleTask), s;
				}
				return n.prototype = je, n;
			},
			set: function(e) {
				p(this, "then", e && e.prototype === je ? Ze : {
					get: function() {
						return e;
					},
					set: Ze.set
				});
			}
		};
		d(R.prototype, {
			then: Ze,
			_then: function(e, t) {
				nt(this, new Qe(null, null, e, t, L));
			},
			catch: function(e) {
				if (arguments.length === 1) return this.then(null, e);
				var t = arguments[0], n = arguments[1];
				return typeof t == "function" ? this.then(null, function(e) {
					return e instanceof t ? n(e) : dt(e);
				}) : this.then(null, function(e) {
					return e && e.name === t ? n(e) : dt(e);
				});
			},
			finally: function(e) {
				return this.then(function(t) {
					return R.resolve(e()).then(function() {
						return t;
					});
				}, function(t) {
					return R.resolve(e()).then(function() {
						return dt(t);
					});
				});
			},
			timeout: function(e, t) {
				var n = this;
				return e < Infinity ? new R(function(r, i) {
					var a = setTimeout(function() {
						return i(new I.Timeout(t));
					}, e);
					n.then(r, i).finally(clearTimeout.bind(null, a));
				}) : this;
			}
		}), typeof Symbol < "u" && Symbol.toStringTag && p(R.prototype, Symbol.toStringTag, "Dexie.Promise"), qe.env = Tt();
		function Qe(e, t, n, r, i) {
			this.onFulfilled = typeof e == "function" ? e : null, this.onRejected = typeof t == "function" ? t : null, this.resolve = n, this.reject = r, this.psd = i;
		}
		d(R, {
			all: function() {
				var e = P.apply(null, arguments).map(xt);
				return new R(function(t, n) {
					e.length === 0 && t([]);
					var r = e.length;
					e.forEach(function(i, a) {
						return R.resolve(i).then(function(n) {
							e[a] = n, --r || t(e);
						}, n);
					});
				});
			},
			resolve: function(e) {
				return e instanceof R ? e : e && typeof e.then == "function" ? new R(function(t, n) {
					e.then(t, n);
				}) : new R(je, !0, e);
			},
			reject: dt,
			race: function() {
				var e = P.apply(null, arguments).map(xt);
				return new R(function(t, n) {
					e.map(function(e) {
						return R.resolve(e).then(t, n);
					});
				});
			},
			PSD: {
				get: function() {
					return L;
				},
				set: function(e) {
					return L = e;
				}
			},
			totalEchoes: { get: function() {
				return gt;
			} },
			newPSD: vt,
			usePSD: Et,
			scheduler: {
				get: function() {
					return Ve;
				},
				set: function(e) {
					Ve = e;
				}
			},
			rejectionMapper: {
				get: function() {
					return Ke;
				},
				set: function(e) {
					Ke = e;
				}
			},
			follow: function(e, t) {
				return new R(function(n, r) {
					return vt(function(t, n) {
						var r = L;
						r.unhandleds = [], r.onunhandled = n, r.finalize = Ce(function() {
							var e = this;
							ct(function() {
								e.unhandleds.length === 0 ? t() : n(e.unhandleds[0]);
							});
						}, r.finalize), e();
					}, t, n, r);
				});
			}
		}), Re && (Re.allSettled && p(R, "allSettled", function() {
			var e = P.apply(null, arguments).map(xt);
			return new R(function(t) {
				e.length === 0 && t([]);
				var n = e.length, r = Array(n);
				e.forEach(function(e, i) {
					return R.resolve(e).then(function(e) {
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
		}), Re.any && typeof AggregateError < "u" && p(R, "any", function() {
			var e = P.apply(null, arguments).map(xt);
			return new R(function(t, n) {
				e.length === 0 && n(/* @__PURE__ */ AggregateError([]));
				var r = e.length, i = Array(r);
				e.forEach(function(e, a) {
					return R.resolve(e).then(function(e) {
						return t(e);
					}, function(e) {
						i[a] = e, --r || n(AggregateError(i));
					});
				});
			});
		}), Re.withResolvers && (R.withResolvers = Re.withResolvers));
		function $e(e, t) {
			try {
				t(function(t) {
					if (e._state === null) {
						if (t === e) throw TypeError("A promise cannot be resolved with itself.");
						var n = e._lib && at();
						t && typeof t.then == "function" ? $e(e, function(e, n) {
							t instanceof R ? t._then(e, n) : t.then(e, n);
						}) : (e._state = !0, e._value = t, tt(e)), n && ot();
					}
				}, et.bind(null, e));
			} catch (t) {
				et(e, t);
			}
		}
		function et(e, t) {
			if (Ge.push(t), e._state === null) {
				var n = e._lib && at();
				t = Ke(t), e._state = !1, e._value = t, lt(e), tt(e), n && ot();
			}
		}
		function tt(e) {
			var t = e._listeners;
			e._listeners = [];
			for (var n = 0, r = t.length; n < r; ++n) nt(e, t[n]);
			var i = e._PSD;
			--i.ref || i.finalize(), Ye === 0 && (++Ye, Ve(function() {
				--Ye === 0 && st();
			}, []));
		}
		function nt(e, t) {
			if (e._state === null) e._listeners.push(t);
			else {
				var n = e._state ? t.onFulfilled : t.onRejected;
				if (n === null) return (e._state ? t.resolve : t.reject)(e._value);
				++t.psd.ref, ++Ye, Ve(rt, [
					n,
					e,
					t
				]);
			}
		}
		function rt(e, t, n) {
			try {
				var r, i = t._value;
				!t._state && Ge.length && (Ge = []), r = ke && t._consoleTask ? t._consoleTask.run(function() {
					return e(i);
				}) : e(i), !t._state && Ge.indexOf(i) === -1 && ut(t), n.resolve(r);
			} catch (e) {
				n.reject(e);
			} finally {
				--Ye === 0 && st(), --n.psd.ref || n.psd.finalize();
			}
		}
		function it() {
			Et(qe, function() {
				at() && ot();
			});
		}
		function at() {
			var e = He;
			return He = !1, Ue = !1, e;
		}
		function ot() {
			var e, t, n;
			do
				for (; Je.length > 0;) for (e = Je, Je = [], n = e.length, t = 0; t < n; ++t) {
					var r = e[t];
					r[0].apply(null, r[1]);
				}
			while (Je.length > 0);
			He = !0, Ue = !0;
		}
		function st() {
			var e = We;
			We = [], e.forEach(function(e) {
				e._PSD.onunhandled.call(null, e._value, e);
			});
			for (var t = Xe.slice(0), n = t.length; n;) t[--n]();
		}
		function ct(e) {
			function t() {
				e(), Xe.splice(Xe.indexOf(t), 1);
			}
			Xe.push(t), ++Ye, Ve(function() {
				--Ye === 0 && st();
			}, []);
		}
		function lt(e) {
			We.some(function(t) {
				return t._value === e._value;
			}) || We.push(e);
		}
		function ut(e) {
			for (var t = We.length; t;) if (We[--t]._value === e._value) {
				We.splice(t, 1);
				return;
			}
		}
		function dt(e) {
			return new R(je, !1, e);
		}
		function z(e, t) {
			var n = L;
			return function() {
				var r = at(), i = L;
				try {
					return wt(n, !0), e.apply(this, arguments);
				} catch (e) {
					t && t(e);
				} finally {
					wt(i, !1), r && ot();
				}
			};
		}
		var ft = {
			awaits: 0,
			echoes: 0,
			id: 0
		}, pt = 0, mt = [], ht = 0, gt = 0, _t = 0;
		function vt(e, t, n, r) {
			var i = L, a = Object.create(i);
			a.parent = i, a.ref = 0, a.global = !1, a.id = ++_t, qe.env, a.env = ze ? {
				Promise: R,
				PromiseProp: {
					value: R,
					configurable: !0,
					writable: !0
				},
				all: R.all,
				race: R.race,
				allSettled: R.allSettled,
				any: R.any,
				resolve: R.resolve,
				reject: R.reject
			} : {}, t && s(a, t), ++i.ref, a.finalize = function() {
				--this.parent.ref || this.parent.finalize();
			};
			var o = Et(a, e, n, r);
			return a.ref === 0 && a.finalize(), o;
		}
		function yt() {
			return ft.id ||= ++pt, ++ft.awaits, ft.echoes += Me, ft.id;
		}
		function bt() {
			return ft.awaits ? (--ft.awaits === 0 && (ft.id = 0), ft.echoes = ft.awaits * Me, !0) : !1;
		}
		("" + Le).indexOf("[native code]") === -1 && (yt = bt = be);
		function xt(e) {
			return ft.echoes && e && e.constructor === Re ? (yt(), e.then(function(e) {
				return bt(), e;
			}, function(e) {
				return bt(), kt(e);
			})) : e;
		}
		function St(e) {
			++gt, ft.echoes && --ft.echoes !== 0 || (ft.echoes = ft.awaits = ft.id = 0), mt.push(L), wt(e, !0);
		}
		function Ct() {
			var e = mt[mt.length - 1];
			mt.pop(), wt(e, !1);
		}
		function wt(e, t) {
			var n = L;
			if ((t ? ft.echoes && (!ht++ || e !== L) : ht && (!--ht || e !== L)) && queueMicrotask(t ? St.bind(null, e) : Ct), e !== L && (L = e, n === qe && (qe.env = Tt()), ze)) {
				var r = qe.env.Promise, a = e.env;
				(n.global || e.global) && (Object.defineProperty(i, "Promise", a.PromiseProp), r.all = a.all, r.race = a.race, r.resolve = a.resolve, r.reject = a.reject, a.allSettled && (r.allSettled = a.allSettled), a.any && (r.any = a.any));
			}
		}
		function Tt() {
			var e = i.Promise;
			return ze ? {
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
		function Et(e, t, n, r, i) {
			var a = L;
			try {
				return wt(e, !0), t(n, r, i);
			} finally {
				wt(a, !1);
			}
		}
		function Dt(e, t, n, r) {
			return typeof e == "function" ? function() {
				var i = L;
				n && yt(), wt(t, !0);
				try {
					return e.apply(this, arguments);
				} finally {
					wt(i, !1), r && queueMicrotask(bt);
				}
			} : e;
		}
		function Ot(e) {
			Promise === Re && ft.echoes === 0 ? ht === 0 ? e() : enqueueNativeMicroTask(e) : setTimeout(e, 0);
		}
		var kt = R.reject;
		function At(e, t, n, r) {
			if (!e.idbdb || !e._state.openComplete && !L.letThrough && !e._vip) {
				if (e._state.openComplete) return kt(new I.DatabaseClosed(e._state.dbOpenError));
				if (!e._state.isBeingOpened) {
					if (!e._state.autoOpen) return kt(new I.DatabaseClosed());
					e.open().catch(be);
				}
				return e._state.dbReadyPromise.then(function() {
					return At(e, t, n, r);
				});
			}
			var i = e._createTransaction(t, n, e._dbSchema);
			try {
				i.create(), e._state.PR1398_maxLoop = 3;
			} catch (i) {
				return i.name === he.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
					return At(e, t, n, r);
				})) : kt(i);
			}
			return i._promise(t, function(e, t) {
				return vt(function() {
					return L.trans = i, r(e, t, i);
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
		var jt = "4.4.7", Mt = "￿", Nt = -Infinity, Pt = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", Ft = "String expected.", It = 1e3, Lt = "__dbnames", Rt = "readonly", zt = "readwrite";
		function Bt(e, t) {
			return e ? t ? function() {
				return e.apply(this, arguments) && t.apply(this, arguments);
			} : e : t;
		}
		var Vt = {
			type: 3,
			lower: -Infinity,
			lowerOpen: !1,
			upper: [[]],
			upperOpen: !1
		};
		function Ht(e) {
			return typeof e == "string" && !/\./.test(e) ? function(t) {
				return t[e] === void 0 && e in t && (t = A(t), delete t[e]), t;
			} : function(e) {
				return e;
			};
		}
		function Ut() {
			throw I.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
		}
		function B(e, t) {
			try {
				var n = Kt(e), r = Kt(t);
				if (n !== r) return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r === "Date" ? -1 : NaN;
				switch (n) {
					case "number":
					case "Date":
					case "string": return e > t ? 1 : e < t ? -1 : 0;
					case "binary": return Gt(qt(e), qt(t));
					case "Array": return Wt(e, t);
				}
			} catch {}
			return NaN;
		}
		function Wt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) {
				var o = B(e[a], t[a]);
				if (o !== 0) return o;
			}
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function Gt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) if (e[a] !== t[a]) return e[a] < t[a] ? -1 : 1;
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function Kt(e) {
			var t = typeof e;
			if (t !== "object") return t;
			if (ArrayBuffer.isView(e)) return "binary";
			var n = re(e);
			return n === "ArrayBuffer" ? "binary" : n;
		}
		function qt(e) {
			return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : new Uint8Array(e);
		}
		function Jt(e, t, n) {
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
		var Yt = function() {
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
		function Xt(e, t) {
			for (var n = a(t), r = n.length, i = !1, o = 0; o < r; ++o) {
				var s = n[o], c = t[s], l = C(e, s);
				c instanceof Yt ? (w(e, s, c.execute(l)), i = !0) : l !== c && (w(e, s, c), i = !0);
			}
			return i;
		}
		var Zt = function() {
			function e() {}
			return e.prototype._trans = function(e, t, n) {
				var r = this._tx || L.trans, i = this.name, a = ke && typeof console < "u" && console.createTask && console.createTask(`Dexie: ${e === "readonly" ? "read" : "write"} ${this.name}`);
				function o(e, n, r) {
					if (!r.schema[i]) throw new I.NotFound("Table " + i + " not part of transaction");
					return t(r.idbtrans, r);
				}
				var s = at();
				try {
					var c = r && r.db._novip === this.db._novip ? r === L.trans ? r._promise(e, o, n) : vt(function() {
						return r._promise(e, o, n);
					}, {
						trans: r,
						transless: L.transless || L
					}) : At(this.db, e, [this.name], o);
					return a && (c._consoleTask = a, c = c.catch(function(e) {
						return console.trace(e), kt(e);
					})), c;
				} finally {
					s && ot();
				}
			}, e.prototype.get = function(e, t) {
				var n = this;
				return e && e.constructor === Object ? this.where(e).first(t) : e == null ? kt(new I.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(t) {
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
				if (n && this.db._maxKey !== Mt) {
					var r = n.keyPath.slice(0, t.length);
					return this.where(r).equals(r.map(function(t) {
						return e[t];
					}));
				}
				!n && ke && console.warn(`The query ${JSON.stringify(e)} on ${this.name} would benefit from a compound index [${t.join("+")}]`);
				var i = this.schema.idxByName;
				function s(e, t) {
					return B(e, t) === 0;
				}
				var c = t.reduce(function(t, n) {
					var r = t[0], a = t[1], c = i[n], l = e[n];
					return [r || c, r || !c ? Bt(a, c && c.multi ? function(e) {
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
				this.schema.mappedClass = e, e.prototype instanceof Ut && (e = function(e) {
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
				return a && i && (o = Ht(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "add",
						keys: t == null ? null : [t],
						values: [o]
					});
				}).then(function(e) {
					return e.numFailures ? R.reject(e.failures[0]) : e.lastResult;
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
						return Xt(o, t), r && w(o, r, e), n.core.mutate({
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
							return e.numFailures ? R.reject(e.failures[0]) : !!a;
						});
					});
				});
			}, e.prototype.update = function(e, t) {
				if (typeof e == "object" && !o(e)) {
					var n = C(e, this.schema.primKey.keyPath);
					return n === void 0 ? kt(new I.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(n).modify(t);
				}
				return this.where(":id").equals(e).modify(t);
			}, e.prototype.put = function(e, t) {
				var n = this, r = this.schema.primKey, i = r.auto, a = r.keyPath, o = e;
				return a && i && (o = Ht(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "put",
						values: [o],
						keys: t == null ? null : [t]
					});
				}).then(function(e) {
					return e.numFailures ? R.reject(e.failures[0]) : e.lastResult;
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
						return Jt(t, [e], n);
					}).then(function(e) {
						return e.numFailures ? R.reject(e.failures[0]) : void 0;
					});
				});
			}, e.prototype.clear = function() {
				var e = this;
				return this._trans("readwrite", function(t) {
					return e.core.mutate({
						trans: t,
						type: "deleteRange",
						range: Vt
					}).then(function(t) {
						return Jt(e, null, t);
					});
				}).then(function(e) {
					return e.numFailures ? R.reject(e.failures[0]) : void 0;
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
					if (s && i) throw new I.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new I.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(Ht(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "add",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new me(`${r.name}.bulkAdd(): ${t} of ${c} operations failed`, o);
					});
				});
			}, e.prototype.bulkPut = function(e, t, n) {
				var r = this, i = Array.isArray(t) ? t : void 0;
				n ||= i ? void 0 : t;
				var a = n ? n.allKeys : void 0;
				return this._trans("readwrite", function(t) {
					var n = r.schema.primKey, o = n.auto, s = n.keyPath;
					if (s && i) throw new I.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new I.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(Ht(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "put",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new me(`${r.name}.bulkPut(): ${t} of ${c} operations failed`, o);
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
								if (!l && B(u(a), n) !== 0) throw new I.Constraint("Cannot update primary key in bulkUpdate()");
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
							throw new me(`${t.name}.bulkUpdate(): ${n} of ${p} operations failed`, r);
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
						return Jt(t, e, n);
					});
				}).then(function(e) {
					var r = e.numFailures, i = e.lastResult, a = e.failures;
					if (r === 0) return i;
					throw new me(`${t.name}.bulkDelete(): ${r} of ${n} operations failed`, a);
				});
			}, e;
		}();
		function Qt(e) {
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
				r ||= De, i ||= be;
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
					else if (n === "asap") var r = s(t, xe, function() {
						for (var e = arguments.length, t = Array(e); e--;) t[e] = arguments[e];
						r.subscribers.forEach(function(e) {
							x(function() {
								e.apply(null, t);
							});
						});
					});
					else throw new I.InvalidArgument("Invalid event config");
				});
			}
		}
		function $t(e, t) {
			return m(t).from({ prototype: e }), t;
		}
		function en(e) {
			return $t(Zt.prototype, function(t, n, r) {
				this.db = e, this._tx = r, this.name = t, this.schema = n, this.hook = e._allTables[t] ? e._allTables[t].hook : Qt(null, {
					creating: [we, be],
					reading: [Se, xe],
					updating: [Ee, be],
					deleting: [Te, be]
				});
			});
		}
		function tn(e, t) {
			return !(e.filter || e.algorithm || e.or) && (t ? e.justLimit : !e.replayFilter);
		}
		function nn(e, t) {
			e.filter = Bt(e.filter, t);
		}
		function rn(e, t, n) {
			var r = e.replayFilter;
			e.replayFilter = r ? function() {
				return Bt(r(), t());
			} : t, e.justLimit = n && !r;
		}
		function an(e, t) {
			e.isMatch = Bt(e.isMatch, t);
		}
		function on(e, t) {
			if (e.isPrimKey) return t.primaryKey;
			var n = t.getIndexByKeyPath(e.index);
			if (!n) throw new I.Schema("KeyPath " + e.index + " on object store " + t.name + " is not indexed");
			return n;
		}
		function sn(e, t, n) {
			var r = on(e, t.schema);
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
		function cn(e, t, n, r) {
			var i = e.replayFilter ? Bt(e.filter, e.replayFilter()) : e.filter;
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
				return Promise.all([e.or._iterate(o, n), ln(sn(e, r, n), e.algorithm, o, !e.keysOnly && e.valueMapper)]);
			}
			return ln(sn(e, r, n), Bt(e.algorithm, i), t, !e.keysOnly && e.valueMapper);
		}
		function ln(e, t, n, r) {
			var i = z(r ? function(e, t, i) {
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
						e.stop(t), n = be;
					}, function(t) {
						e.fail(t), n = be;
					})) && i(e.value, e, function(e) {
						return n = e;
					}), n();
				});
			});
		}
		var un = function() {
			function e() {}
			return e.prototype._read = function(e, t) {
				var n = this._ctx;
				return n.error ? n.table._trans(null, kt.bind(null, n.error)) : n.table._trans("readonly", e).then(t);
			}, e.prototype._write = function(e) {
				var t = this._ctx;
				return t.error ? t.table._trans(null, kt.bind(null, t.error)) : t.table._trans("readwrite", e, "locked");
			}, e.prototype._addAlgorithm = function(e) {
				var t = this._ctx;
				t.algorithm = Bt(t.algorithm, e);
			}, e.prototype._iterate = function(e, t) {
				return cn(this._ctx, e, t, this._ctx.table.core);
			}, e.prototype.clone = function(e) {
				var t = Object.create(this.constructor.prototype), n = Object.create(this._ctx);
				return e && s(n, e), t._ctx = n, t;
			}, e.prototype.raw = function() {
				return this._ctx.valueMapper = null, this;
			}, e.prototype.each = function(e) {
				var t = this._ctx;
				return this._read(function(n) {
					return cn(t, e, n, t.table.core);
				});
			}, e.prototype.count = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx, r = n.table.core;
					if (tn(n, !0)) return r.count({
						trans: e,
						query: {
							index: on(n, r.schema),
							range: n.range
						}
					}).then(function(e) {
						return Math.min(e, n.limit);
					});
					var i = 0;
					return cn(n, function() {
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
					return B(a(e, i), a(t, i)) * o;
				}
				return this.toArray(function(e) {
					return e.slice().sort(s);
				}).then(t);
			}, e.prototype.toArray = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx;
					if (tn(n, !0) && n.limit > 0) {
						var r = n.valueMapper, i = on(n, n.table.core.schema);
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
					return cn(n, function(e) {
						return a.push(e);
					}, e, n.table.core).then(function() {
						return a;
					});
				}, e);
			}, e.prototype.offset = function(e) {
				var t = this._ctx;
				return e <= 0 || (t.offset += e, tn(t) ? rn(t, function() {
					var t = e;
					return function(e, n) {
						return t === 0 ? !0 : t === 1 ? (--t, !1) : (n(function() {
							e.advance(t), t = 0;
						}), !1);
					};
				}) : rn(t, function() {
					var t = e;
					return function() {
						return --t < 0;
					};
				})), this;
			}, e.prototype.limit = function(e) {
				return this._ctx.limit = Math.min(this._ctx.limit, e), rn(this._ctx, function() {
					var t = e;
					return function(e, n, r) {
						return --t <= 0 && n(r), t >= 0;
					};
				}, !0), this;
			}, e.prototype.until = function(e, t) {
				return nn(this._ctx, function(n, r, i) {
					return !e(n.value) || (r(i), t);
				}), this;
			}, e.prototype.first = function(e) {
				return this.limit(1).toArray(function(e) {
					return e[0];
				}).then(e);
			}, e.prototype.last = function(e) {
				return this.reverse().first(e);
			}, e.prototype.filter = function(e) {
				return nn(this._ctx, function(t) {
					return e(t.value);
				}), an(this._ctx, e), this;
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
				if (tn(t, !0) && t.limit > 0) return this._read(function(e) {
					var n = on(t, t.table.core.schema);
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
				return nn(this._ctx, function(e) {
					var t = e.primaryKey.toString(), r = u(n, t);
					return n[t] = !0, !r;
				}), this;
			}, e.prototype.modify = function(e) {
				var t = this, n = this._ctx;
				return this._write(function(r) {
					var i = typeof e == "function" ? e : function(t) {
						return Xt(t, e);
					}, o = n.table.core, s = o.schema.primaryKey, c = s.outbound, l = s.extractKey, u = 200, d = t.db._options.modifyChunkSize;
					d && (u = typeof d == "object" ? d[o.name] || d["*"] || 200 : d);
					var f = [], p = 0, m = [], h = function(e, t) {
						var n = t.failures, r = t.numFailures;
						p += e - r;
						for (var i = 0, o = a(n); i < o.length; i++) {
							var s = o[i];
							f.push(n[s]);
						}
					}, g = e === dn;
					return t.clone().primaryKeys().then(function(t) {
						var a = tn(n) && n.limit === Infinity && (typeof e != "function" || g) && {
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
										value: A(S),
										primKey: t[d + x]
									};
									i.call(C, C.value, C) !== !1 && (C.value == null ? b.push(t[d + x]) : !c && B(l(S), l(C.value)) !== 0 ? (b.push(t[d + x]), _.push(C.value)) : (v.push(C.value), c && y.push(t[d + x])));
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
										return Jt(n.table, b, e);
									}).then(function(e) {
										return h(b.length, e);
									});
								}).then(function() {
									return t.length > d + f && s(d + u);
								});
							});
						};
						return s(0).then(function() {
							if (f.length > 0) throw new pe("Error modifying one or more objects", f, p, m);
							return t.length;
						});
					});
				});
			}, e.prototype.delete = function() {
				var e = this._ctx, t = e.range;
				return tn(e) && !e.table.schema.yProps && (e.isPrimKey || t.type === 3) ? this._write(function(n) {
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
							if (r) throw new pe("Could not delete some values", Object.keys(n).map(function(e) {
								return n[e];
							}), t - r);
							return t - r;
						});
					});
				}) : this.modify(dn);
			}, e;
		}(), dn = function(e, t) {
			return t.value = null;
		};
		function fn(e) {
			return $t(un.prototype, function(t, n) {
				this.db = e;
				var r = Vt, i = null;
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
					valueMapper: s === xe ? null : s
				};
			});
		}
		function pn(e, t) {
			return e < t ? -1 : e === t ? 0 : 1;
		}
		function mn(e, t) {
			return e > t ? -1 : e === t ? 0 : 1;
		}
		function V(e, t, n) {
			var r = e instanceof xn ? new e.Collection(e) : e;
			return r._ctx.error = n ? new n(t) : TypeError(t), r;
		}
		function hn(e) {
			var t = new e.Collection(e, function() {
				return bn("");
			});
			return t._addAlgorithm(function() {
				return !1;
			}), t;
		}
		function gn(e) {
			return e === "next" ? function(e) {
				return e.toUpperCase();
			} : function(e) {
				return e.toLowerCase();
			};
		}
		function _n(e) {
			return e === "next" ? function(e) {
				return e.toLowerCase();
			} : function(e) {
				return e.toUpperCase();
			};
		}
		function vn(e, t, n, r, i, a) {
			for (var o = Math.min(e.length, r.length), s = -1, c = 0; c < o; ++c) {
				var l = t[c];
				if (l !== r[c]) return i(e[c], n[c]) < 0 ? e.substr(0, c) + n[c] + n.substr(c + 1) : i(e[c], r[c]) < 0 ? e.substr(0, c) + r[c] + n.substr(c + 1) : s >= 0 ? e.substr(0, s) + t[s] + n.substr(s + 1) : null;
				i(e[c], l) < 0 && (s = c);
			}
			return o < r.length && a === "next" ? e + n.substr(e.length) : o < e.length && a === "prev" ? e.substr(0, n.length) : s < 0 ? null : e.substr(0, s) + r[s] + n.substr(s + 1);
		}
		function H(e, t, n, r) {
			var i, a, o, s, c, l, u, d = n.length;
			if (!n.every(function(e) {
				return typeof e == "string";
			})) return V(e, Ft);
			function f(e) {
				i = gn(e), a = _n(e), o = e === "next" ? pn : mn;
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
				return yn(s[0], c[d - 1] + r);
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
					var g = vn(i, f, s[h], c[h], o, l);
					g === null && p === null ? m = h + 1 : (p === null || o(p, g) > 0) && (p = g);
				}
				return n(p === null ? r : function() {
					e.continue(p + u);
				}), !1;
			}), p;
		}
		function yn(e, t, n, r) {
			return {
				type: 2,
				lower: e,
				upper: t,
				lowerOpen: n,
				upperOpen: r
			};
		}
		function bn(e) {
			return {
				type: 1,
				lower: e,
				upper: e
			};
		}
		var xn = function() {
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
					return this._cmp(e, t) > 0 || this._cmp(e, t) === 0 && (n || r) && !(n && r) ? hn(this) : new this.Collection(this, function() {
						return yn(e, t, !n, !r);
					});
				} catch {
					return V(this, Pt);
				}
			}, e.prototype.equals = function(e) {
				return e == null ? V(this, Pt) : new this.Collection(this, function() {
					return bn(e);
				});
			}, e.prototype.above = function(e) {
				return e == null ? V(this, Pt) : new this.Collection(this, function() {
					return yn(e, void 0, !0);
				});
			}, e.prototype.aboveOrEqual = function(e) {
				return e == null ? V(this, Pt) : new this.Collection(this, function() {
					return yn(e, void 0, !1);
				});
			}, e.prototype.below = function(e) {
				return e == null ? V(this, Pt) : new this.Collection(this, function() {
					return yn(void 0, e, !1, !0);
				});
			}, e.prototype.belowOrEqual = function(e) {
				return e == null ? V(this, Pt) : new this.Collection(this, function() {
					return yn(void 0, e);
				});
			}, e.prototype.startsWith = function(e) {
				return typeof e == "string" ? this.between(e, e + Mt, !0, !0) : V(this, Ft);
			}, e.prototype.startsWithIgnoreCase = function(e) {
				return e === "" ? this.startsWith(e) : H(this, function(e, t) {
					return e.indexOf(t[0]) === 0;
				}, [e], Mt);
			}, e.prototype.equalsIgnoreCase = function(e) {
				return H(this, function(e, t) {
					return e === t[0];
				}, [e], "");
			}, e.prototype.anyOfIgnoreCase = function() {
				var e = P.apply(oe, arguments);
				return e.length === 0 ? hn(this) : H(this, function(e, t) {
					return t.indexOf(e) !== -1;
				}, e, "");
			}, e.prototype.startsWithAnyOfIgnoreCase = function() {
				var e = P.apply(oe, arguments);
				return e.length === 0 ? hn(this) : H(this, function(e, t) {
					return t.some(function(t) {
						return e.indexOf(t) === 0;
					});
				}, e, Mt);
			}, e.prototype.anyOf = function() {
				var e = this, t = P.apply(oe, arguments), n = this._cmp;
				try {
					t.sort(n);
				} catch {
					return V(this, Pt);
				}
				if (t.length === 0) return hn(this);
				var r = new this.Collection(this, function() {
					return yn(t[0], t[t.length - 1]);
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
				return this.inAnyRange([[Nt, e], [e, this.db._maxKey]], {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.noneOf = function() {
				var e = P.apply(oe, arguments);
				if (e.length === 0) return new this.Collection(this);
				try {
					e.sort(this._ascending);
				} catch {
					return V(this, Pt);
				}
				var t = e.reduce(function(e, t) {
					return e ? e.concat([[e[e.length - 1][1], t]]) : [[Nt, t]];
				}, null);
				return t.push([e[e.length - 1], this.db._maxKey]), this.inAnyRange(t, {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.inAnyRange = function(e, t) {
				var n = this, r = this._cmp, i = this._ascending, a = this._descending, o = this._min, s = this._max;
				if (e.length === 0) return hn(this);
				if (!e.every(function(e) {
					return e[0] !== void 0 && e[1] !== void 0 && i(e[0], e[1]) <= 0;
				})) return V(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", I.InvalidArgument);
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
					return V(this, Pt);
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
					return yn(p[0][0], p[p.length - 1][1], !c, !l);
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
				var e = P.apply(oe, arguments);
				return e.every(function(e) {
					return typeof e == "string";
				}) ? e.length === 0 ? hn(this) : this.inAnyRange(e.map(function(e) {
					return [e, e + Mt];
				})) : V(this, "startsWithAnyOf() only works with strings");
			}, e;
		}();
		function Sn(e) {
			return $t(xn.prototype, function(t, n, r) {
				if (this.db = e, this._ctx = {
					table: t,
					index: n === ":id" ? null : n,
					or: r
				}, this._cmp = this._ascending = B, this._descending = function(e, t) {
					return B(t, e);
				}, this._max = function(e, t) {
					return B(e, t) > 0 ? e : t;
				}, this._min = function(e, t) {
					return B(e, t) < 0 ? e : t;
				}, this._IDBKeyRange = e._deps.IDBKeyRange, !this._IDBKeyRange) throw new I.MissingAPI();
			});
		}
		function U(e) {
			return z(function(t) {
				return Cn(t), e(t.target.error), !1;
			});
		}
		function Cn(e) {
			e.stopPropagation && e.stopPropagation(), e.preventDefault && e.preventDefault();
		}
		var wn = "storagemutated", Tn = "x-storagemutated-1", En = Qt(null, wn), Dn = function() {
			function e() {}
			return e.prototype._lock = function() {
				return b(!L.global), ++this._reculock, this._reculock === 1 && !L.global && (L.lockOwnerFor = this), this;
			}, e.prototype._unlock = function() {
				if (b(!L.global), --this._reculock === 0) for (L.global || (L.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked();) {
					var e = this._blockedFuncs.shift();
					try {
						Et(e[1], e[0]);
					} catch {}
				}
				return this;
			}, e.prototype._locked = function() {
				return this._reculock && L.lockOwnerFor !== this;
			}, e.prototype.create = function(e) {
				var t = this;
				if (!this.mode) return this;
				var n = this.db.idbdb, r = this.db._state.dbOpenError;
				if (b(!this.idbtrans), !e && !n) switch (r && r.name) {
					case "DatabaseClosedError": throw new I.DatabaseClosed(r);
					case "MissingAPIError": throw new I.MissingAPI(r.message, r);
					default: throw new I.OpenFailed(r);
				}
				if (!this.active) throw new I.TransactionInactive();
				return b(this._completion._state === null), e = this.idbtrans = e || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : n.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })), e.onerror = z(function(n) {
					Cn(n), t._reject(e.error);
				}), e.onabort = z(function(n) {
					Cn(n), t.active && t._reject(new I.Abort(e.error)), t.active = !1, t.on("abort").fire(n);
				}), e.oncomplete = z(function() {
					t.active = !1, t._resolve(), "mutatedParts" in e && En.storagemutated.fire(e.mutatedParts);
				}), this;
			}, e.prototype._promise = function(e, t, n) {
				var r = this;
				if (e === "readwrite" && this.mode !== "readwrite") return kt(new I.ReadOnly("Transaction is readonly"));
				if (!this.active) return kt(new I.TransactionInactive());
				if (this._locked()) return new R(function(i, a) {
					r._blockedFuncs.push([function() {
						r._promise(e, t, n).then(i, a);
					}, L]);
				});
				if (n) return vt(function() {
					var e = new R(function(e, n) {
						r._lock();
						var i = t(e, n, r);
						i && i.then && i.then(e, n);
					});
					return e.finally(function() {
						return r._unlock();
					}), e._lib = !0, e;
				});
				var i = new R(function(e, n) {
					var i = t(e, n, r);
					i && i.then && i.then(e, n);
				});
				return i._lib = !0, i;
			}, e.prototype._root = function() {
				return this.parent ? this.parent._root() : this;
			}, e.prototype.waitFor = function(e) {
				var t = this._root(), n = R.resolve(e);
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
				return new R(function(e, r) {
					n.then(function(n) {
						return t._waitingQueue.push(z(e.bind(null, n)));
					}, function(e) {
						return t._waitingQueue.push(z(r.bind(null, e)));
					}).finally(function() {
						t._waitingFor === i && (t._waitingFor = null);
					});
				});
			}, e.prototype.abort = function() {
				this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new I.Abort()));
			}, e.prototype.table = function(e) {
				var t = this._memoizedTables ||= {};
				if (u(t, e)) return t[e];
				var n = this.schema[e];
				if (!n) throw new I.NotFound("Table " + e + " not part of transaction");
				var r = new this.db.Table(e, n, this);
				return r.core = this.db.core.table(e), t[e] = r, r;
			}, e;
		}();
		function On(e) {
			return $t(Dn.prototype, function(t, n, r, i, a) {
				var o = this;
				t !== "readonly" && n.forEach(function(e) {
					var t = r[e]?.yProps;
					t && (n = n.concat(t.map(function(e) {
						return e.updatesTable;
					})));
				}), this.db = e, this.mode = t, this.storeNames = n, this.schema = r, this.chromeTransactionDurability = i, this.idbtrans = null, this.on = Qt(this, "complete", "error", "abort"), this.parent = a || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new R(function(e, t) {
					o._resolve = e, o._reject = t;
				}), this._completion.then(function() {
					o.active = !1, o.on.complete.fire();
				}, function(e) {
					var t = o.active;
					return o.active = !1, o.on.error.fire(e), o.parent ? o.parent._reject(e) : t && o.idbtrans && o.idbtrans.abort(), kt(e);
				});
			});
		}
		function kn(e, t, n, r, i, a, o, s) {
			return {
				name: e,
				keyPath: t,
				unique: n,
				multi: r,
				auto: i,
				compound: a,
				src: (n && !o ? "&" : "") + (r ? "*" : "") + (i ? "++" : "") + An(t),
				type: s
			};
		}
		function An(e) {
			return typeof e == "string" ? e : e ? "[" + [].join.call(e, "+") + "]" : "";
		}
		function jn(e, t, n) {
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
		function Mn(e) {
			return e.length === 1 ? e[0] : e;
		}
		var Nn = function(e) {
			try {
				return e.only([[]]), Nn = function() {
					return [[]];
				}, [[]];
			} catch {
				return Nn = function() {
					return Mt;
				}, Mt;
			}
		};
		function Pn(e) {
			return e == null ? function() {} : typeof e == "string" ? Fn(e) : function(t) {
				return C(t, e);
			};
		}
		function Fn(e) {
			return e.split(".").length === 1 ? function(t) {
				return t[e];
			} : function(t) {
				return C(t, e);
			};
		}
		function In(e) {
			return [].slice.call(e);
		}
		var Ln = 0;
		function Rn(e) {
			return e == null ? ":id" : typeof e == "string" ? e : `[${e.join("+")}]`;
		}
		function zn(e, t, n) {
			function r(e, t) {
				var n = In(e.objectStoreNames), r = n.length > 0 ? t.objectStore(n[0]) : {};
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
									extractKey: Pn(t)
								},
								indexes: In(e.indexNames).map(function(t) {
									return e.index(t);
								}).map(function(e) {
									var t = e.name, n = e.unique, r = e.multiEntry, i = e.keyPath, s = {
										name: t,
										compound: o(i),
										keyPath: i,
										unique: n,
										multiEntry: r,
										extractKey: Pn(i)
									};
									return a[Rn(i)] = s, s;
								}),
								getIndexByKeyPath: function(e) {
									return a[Rn(e)];
								}
							};
							return a[":id"] = s.primaryKey, t != null && (a[Rn(t)] = s.primaryKey), s;
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
						e = z(e);
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
							++g, Cn(e);
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
						e = z(e);
						var l = a.index, u = a.range, d = n.objectStore(t), f = l.isPrimaryKey ? d : d.index(l.name), p = o ? s ? "prevunique" : "prev" : s ? "nextunique" : "next", m = r || !("openKeyCursor" in f) ? f.openCursor(i(u), p) : f.openKeyCursor(i(u), p);
						m.onerror = U(c), m.onsuccess = z(function(t) {
							var r = m.result;
							if (!r) e(null);
							else {
								r.___id = ++Ln, r.done = !1;
								var i = r.continue.bind(r), a = r.continuePrimaryKey;
								a &&= a.bind(r);
								var o = r.advance.bind(r), s = function() {
									throw Error("Cursor not started");
								}, l = function() {
									throw Error("Cursor not stopped");
								};
								r.trans = n, r.stop = r.continue = r.continuePrimaryKey = r.advance = s, r.fail = z(c), r.next = function() {
									var e = this, t = 1;
									return this.start(function() {
										return t-- ? e.continue() : e.stop();
									}).then(function() {
										return e;
									});
								}, r.start = function(e) {
									var t = new Promise(function(e, t) {
										e = z(e), m.onerror = U(t), r.fail = t, r.stop = function(t) {
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
									return m.onsuccess = z(function(e) {
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
							a = z(a);
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
								}, y.onerror = U(o);
							} else if (e && d === "next") {
								var y = c ? g.getAll(_, f) : g.getAllKeys(_, f);
								y.onsuccess = function(e) {
									return a({ result: e.target.result });
								}, y.onerror = U(o);
							} else {
								var b = 0, x = c || !("openKeyCursor" in g) ? g.openCursor(_, d) : g.openKeyCursor(_, d), S = [];
								x.onsuccess = function() {
									var e = x.result;
									if (!e || (S.push(c ? e.value : e.primaryKey), ++b === l)) return a({ result: S });
									e.continue();
								}, x.onerror = U(o);
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
							e = z(e);
							for (var a = n.objectStore(t), o = r.length, s = Array(o), c = 0, l = 0, u, d = function(t) {
								var n = t.target;
								s[n._pos] = n.result, ++l === c && e(s);
							}, f = U(i), p = 0; p < o; ++p) r[p] != null && (u = a.get(r[p]), u._pos = p, u.onsuccess = d, u.onerror = f, ++c);
							c === 0 && e(s);
						});
					},
					get: function(e) {
						var n = e.trans, r = e.key;
						return new Promise(function(e, i) {
							e = z(e);
							var a = n.objectStore(t).get(r);
							a.onsuccess = function(t) {
								return e(t.target.result);
							}, a.onerror = U(i);
						});
					},
					query: a(l, u),
					openCursor: r,
					count: function(e) {
						var n = e.query, r = e.trans, a = n.index, o = n.range;
						return new Promise(function(e, n) {
							var s = r.objectStore(t), c = a.isPrimaryKey ? s : s.index(a.name), l = i(o), u = l ? c.count(l) : c.count();
							u.onsuccess = z(function(t) {
								return e(t.target.result);
							}), u.onerror = U(n);
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
				MAX_KEY: Nn(t),
				schema: c
			};
		}
		function Bn(e, t) {
			return t.reduce(function(e, t) {
				var r = t.create;
				return n(n({}, e), r(e));
			}, e);
		}
		function Vn(e, t, n, r) {
			var i = n.IDBKeyRange;
			return n.indexedDB, { dbcore: Bn(zn(t, i, r), e.dbcore) };
		}
		function Hn(e, t) {
			var n = t.db;
			e.core = Vn(e._middlewares, n, e._deps, t).dbcore, e.tables.forEach(function(t) {
				var n = t.name;
				e.core.schema.tables.some(function(e) {
					return e.name === n;
				}) && (t.core = e.core.table(n), e[n] instanceof e.Table && (e[n].core = t.core));
			});
		}
		function Un(e, t, n, r) {
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
		function Wn(e, t) {
			t.forEach(function(t) {
				for (var n in t) t[n] instanceof e.Table && delete t[n];
			});
		}
		function Gn(e, t) {
			return e._cfg.version - t._cfg.version;
		}
		function Kn(e, t, n, r) {
			var i = e._dbSchema;
			n.objectStoreNames.contains("$meta") && !i.$meta && (i.$meta = jn("$meta", ar("")[0], []), e._storeNames.push("$meta"));
			var o = e._createTransaction("readwrite", e._storeNames, i);
			o.create(n), o._completion.catch(r);
			var s = o._reject.bind(o), c = L.transless || L;
			vt(function() {
				if (L.trans = o, L.transless = c, t === 0) a(i).forEach(function(e) {
					Zn(n, e, i[e].primKey, i[e].indexes);
				}), Hn(e, n), R.follow(function() {
					return e.on.populate.fire(o);
				}).catch(s);
				else return Hn(e, n), Jn(e, o, t).then(function(t) {
					return Yn(e, t, o, n);
				}).catch(s);
			});
		}
		function qn(e, t) {
			Qn(e._dbSchema, t), t.db.version % 10 == 0 && !t.objectStoreNames.contains("$meta") && t.db.createObjectStore("$meta").add(Math.ceil(t.db.version / 10 - 1), "version");
			var n = tr(e, e.idbdb, t);
			ir(e, e._dbSchema, t);
			for (var r = Xn(n, e._dbSchema), i = function(e) {
				if (e.change.length || e.recreate) return console.warn(`Unable to patch indexes of table ${e.name} because it has changes on the type of index or primary key.`), { value: void 0 };
				var n = t.objectStore(e.name);
				e.add.forEach(function(t) {
					ke && console.debug(`Dexie upgrade patch: Creating missing index ${e.name}.${t.src}`), er(n, t);
				});
			}, a = 0, o = r.change; a < o.length; a++) {
				var s = o[a], c = i(s);
				if (typeof c == "object") return c.value;
			}
		}
		function Jn(e, t, n) {
			return t.storeNames.includes("$meta") ? t.table("$meta").get("version").then(function(e) {
				return e ?? n;
			}) : R.resolve(n);
		}
		function Yn(e, t, n, r) {
			var i = [], o = e._versions, s = e._dbSchema = tr(e, e.idbdb, r), c = o.filter(function(e) {
				return e._cfg.version >= t;
			});
			if (c.length === 0) return R.resolve();
			c.forEach(function(o) {
				i.push(function() {
					var i = s, c = o._cfg.dbschema;
					ir(e, i, r), ir(e, c, r), s = e._dbSchema = c;
					var l = Xn(i, c);
					l.add.forEach(function(e) {
						Zn(r, e[0], e[1].primKey, e[1].indexes);
					}), l.change.forEach(function(e) {
						if (e.recreate) throw new I.Upgrade("Not yet support for changing primary key");
						var t = r.objectStore(e.name);
						e.add.forEach(function(e) {
							return er(t, e);
						}), e.change.forEach(function(e) {
							t.deleteIndex(e.name), er(t, e);
						}), e.del.forEach(function(e) {
							return t.deleteIndex(e);
						});
					});
					var u = o._cfg.contentUpgrade;
					if (u && o._cfg.version > t) {
						Hn(e, r), n._memoizedTables = {};
						var d = E(c);
						l.del.forEach(function(e) {
							d[e] = i[e];
						}), Wn(e, [e.Transaction.prototype]), Un(e, [e.Transaction.prototype], a(d), d), n.schema = d;
						var f = se(u);
						f && yt();
						var p, m = R.follow(function() {
							if (p = u(n), p && f) {
								var e = bt.bind(null, null);
								p.then(e, e);
							}
						});
						return p && typeof p.then == "function" ? R.resolve(p) : m.then(function() {
							return p;
						});
					}
				}), i.push(function(t) {
					var r = o._cfg.dbschema;
					$n(r, t), Wn(e, [e.Transaction.prototype]), Un(e, [e.Transaction.prototype], e._storeNames, e._dbSchema), n.schema = e._dbSchema;
				}), i.push(function(t) {
					e.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(e.idbdb.version / 10) === o._cfg.version ? (e.idbdb.deleteObjectStore("$meta"), delete e._dbSchema.$meta, e._storeNames = e._storeNames.filter(function(e) {
						return e !== "$meta";
					})) : t.objectStore("$meta").put(o._cfg.version, "version"));
				});
			});
			function l() {
				return i.length ? R.resolve(i.shift()(n.idbtrans)).then(l) : R.resolve();
			}
			return l().then(function() {
				Qn(s, r);
			});
		}
		function Xn(e, t) {
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
		function Zn(e, t, n, r) {
			var i = e.db.createObjectStore(t, n.keyPath ? {
				keyPath: n.keyPath,
				autoIncrement: n.auto
			} : { autoIncrement: n.auto });
			return r.forEach(function(e) {
				return er(i, e);
			}), i;
		}
		function Qn(e, t) {
			a(e).forEach(function(n) {
				t.db.objectStoreNames.contains(n) || (ke && console.debug("Dexie: Creating missing table", n), Zn(t, n, e[n].primKey, e[n].indexes));
			});
		}
		function $n(e, t) {
			[].slice.call(t.db.objectStoreNames).forEach(function(n) {
				return e[n] == null && t.db.deleteObjectStore(n);
			});
		}
		function er(e, t) {
			e.createIndex(t.name, t.keyPath, {
				unique: t.unique,
				multiEntry: t.multi
			});
		}
		function tr(e, t, n) {
			var r = {};
			return v(t.objectStoreNames, 0).forEach(function(e) {
				for (var t = n.objectStore(e), i = t.keyPath, a = kn(An(i), i || "", !0, !1, !!t.autoIncrement, i && typeof i != "string", !0), o = [], s = 0; s < t.indexNames.length; ++s) {
					var c = t.index(t.indexNames[s]);
					i = c.keyPath;
					var l = kn(c.name, i, !!c.unique, !!c.multiEntry, !1, i && typeof i != "string", !1);
					o.push(l);
				}
				r[e] = jn(e, a, o);
			}), r;
		}
		function nr(e, t, n) {
			e.verno = t.version / 10;
			var r = e._dbSchema = tr(e, t, n);
			e._storeNames = v(t.objectStoreNames, 0), Un(e, [e._allTables], a(r), r);
		}
		function rr(e, t) {
			var n = Xn(tr(e, e.idbdb, t), e._dbSchema);
			return !(n.add.length || n.change.some(function(e) {
				return e.add.length || e.change.length;
			}));
		}
		function ir(e, t, n) {
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
		function ar(e) {
			return e.split(",").map(function(e, t) {
				var n = e.split(":"), r = n[1]?.trim();
				e = n[0].trim();
				var i = e.replace(/([&*]|\+\+)/g, ""), a = /^\[/.test(i) ? i.match(/^\[(.*)\]$/)[1].split("+") : i;
				return kn(i, a || null, /\&/.test(e), /\*/.test(e), /\+\+/.test(e), o(a), t === 0, r);
			});
		}
		var or = function() {
			function e() {}
			return e.prototype._createTableSchema = function(e, t, n) {
				return jn(e, t, n);
			}, e.prototype._parseIndexSyntax = function(e) {
				return ar(e);
			}, e.prototype._parseStoresSpec = function(e, t) {
				var n = this;
				a(e).forEach(function(r) {
					if (e[r] !== null) {
						var i = n._parseIndexSyntax(e[r]), a = i.shift();
						if (!a) throw new I.Schema("Invalid schema for table " + r + ": " + e[r]);
						if (a.unique = !0, a.multi) throw new I.Schema("Primary key cannot be multiEntry*");
						i.forEach(function(e) {
							if (e.auto) throw new I.Schema("Only primary key can be marked as autoIncrement (++)");
							if (!e.keyPath) throw new I.Schema("Index must have a name and cannot be an empty string");
						}), t[r] = n._createTableSchema(r, a, i);
					}
				});
			}, e.prototype.stores = function(e) {
				var t = this.db;
				this._cfg.storesSource = this._cfg.storesSource ? s(this._cfg.storesSource, e) : e;
				var n = t._versions, r = {}, i = {};
				return n.forEach(function(e) {
					s(r, e._cfg.storesSource), i = e._cfg.dbschema = {}, e._parseStoresSpec(r, i);
				}), t._dbSchema = i, Wn(t, [
					t._allTables,
					t,
					t.Transaction.prototype
				]), Un(t, [
					t._allTables,
					t,
					t.Transaction.prototype,
					this._cfg.tables
				], a(i), i), t._storeNames = a(i), this;
			}, e.prototype.upgrade = function(e) {
				return this._cfg.contentUpgrade = Oe(this._cfg.contentUpgrade || be, e), this;
			}, e;
		}();
		function sr(e) {
			return $t(or.prototype, function(t) {
				this.db = e, this._cfg = {
					version: t,
					storesSource: null,
					dbschema: {},
					tables: {},
					contentUpgrade: null
				};
			});
		}
		var cr = lr();
		function lr() {
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
		function ur(e, t) {
			var n = e._dbNamesDB;
			return n || (n = e._dbNamesDB = new ui(Lt, {
				addons: [],
				indexedDB: e,
				IDBKeyRange: t
			}), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
		}
		function dr(e) {
			return e && typeof e.databases == "function";
		}
		function fr(e) {
			var t = e.indexedDB, n = e.IDBKeyRange;
			return dr(t) ? Promise.resolve(t.databases()).then(function(e) {
				return e.map(function(e) {
					return e.name;
				}).filter(function(e) {
					return e !== Lt;
				});
			}) : ur(t, n).toCollection().primaryKeys();
		}
		function pr(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!dr(n) && t !== Lt && ur(n, r).put({ name: t }).catch(be);
		}
		function mr(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!dr(n) && t !== Lt && ur(n, r).delete(t).catch(be);
		}
		function hr(e) {
			return vt(function() {
				return L.letThrough = !0, e();
			});
		}
		function gr() {
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
		var _r;
		function vr(e) {
			return !("from" in e);
		}
		var yr = function(e, t) {
			if (this) s(this, arguments.length ? {
				d: 1,
				from: e,
				to: arguments.length > 1 ? t : e
			} : { d: 0 });
			else {
				var n = new yr();
				return e && "d" in e && s(n, e), n;
			}
		};
		d(yr.prototype, (_r = {
			add: function(e) {
				return xr(this, e), this;
			},
			addKey: function(e) {
				return br(this, e, e), this;
			},
			addKeys: function(e) {
				var t = this;
				return e.forEach(function(e) {
					return br(t, e, e);
				}), this;
			},
			hasKey: function(e) {
				var t = Cr(this).next(e).value;
				return t && B(t.from, e) <= 0 && B(t.to, e) >= 0;
			}
		}, _r[N] = function() {
			return Cr(this);
		}, _r));
		function br(e, t, n) {
			var r = B(t, n);
			if (!isNaN(r)) {
				if (r > 0) throw RangeError();
				if (vr(e)) return s(e, {
					from: t,
					to: n,
					d: 1
				});
				var i = e.l, a = e.r;
				if (B(n, e.from) < 0) return i ? br(i, t, n) : e.l = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, wr(e);
				if (B(t, e.to) > 0) return a ? br(a, t, n) : e.r = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, wr(e);
				B(t, e.from) < 0 && (e.from = t, e.l = null, e.d = a ? a.d + 1 : 1), B(n, e.to) > 0 && (e.to = n, e.r = null, e.d = e.l ? e.l.d + 1 : 1);
				var o = !e.r;
				i && !e.l && xr(e, i), a && o && xr(e, a);
			}
		}
		function xr(e, t) {
			function n(e, t) {
				var r = t.from, i = t.to, a = t.l, o = t.r;
				br(e, r, i), a && n(e, a), o && n(e, o);
			}
			vr(t) || n(e, t);
		}
		function Sr(e, t) {
			var n = Cr(t), r = n.next();
			if (r.done) return !1;
			for (var i = r.value, a = Cr(e), o = a.next(i.from), s = o.value; !r.done && !o.done;) {
				if (B(s.from, i.to) <= 0 && B(s.to, i.from) >= 0) return !0;
				B(i.from, s.from) < 0 ? i = (r = n.next(s.from)).value : s = (o = a.next(i.from)).value;
			}
			return !1;
		}
		function Cr(e) {
			var t = vr(e) ? null : {
				s: 0,
				n: e
			};
			return { next: function(e) {
				for (var n = arguments.length > 0; t;) switch (t.s) {
					case 0: if (t.s = 1, n) for (; t.n.l && B(e, t.n.from) < 0;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					else for (; t.n.l;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					case 1: if (t.s = 2, !n || B(e, t.n.to) <= 0) return {
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
		function wr(e) {
			var t = (e.r?.d || 0) - (e.l?.d || 0), r = t > 1 ? "r" : t < -1 ? "l" : "";
			if (r) {
				var i = r === "r" ? "l" : "r", a = n({}, e), o = e[r];
				e.from = o.from, e.to = o.to, e[r] = o[r], a[r] = o[i], e[i] = a, a.d = Tr(a);
			}
			e.d = Tr(e);
		}
		function Tr(e) {
			var t = e.r, n = e.l;
			return (t ? n ? Math.max(t.d, n.d) : t.d : n ? n.d : 0) + 1;
		}
		function Er(e, t) {
			return a(t).forEach(function(n) {
				e[n] ? xr(e[n], t[n]) : e[n] = te(t[n]);
			}), e;
		}
		function W(e, t) {
			return e.all || t.all || Object.keys(e).some(function(n) {
				return t[n] && Sr(t[n], e[n]);
			});
		}
		var Dr = {}, Or = {}, kr = !1;
		function Ar(e, t) {
			Er(Or, e), kr || (kr = !0, setTimeout(function() {
				kr = !1;
				var e = Or;
				Or = {}, jr(e, !1);
			}, 0));
		}
		function jr(e, t) {
			t === void 0 && (t = !1);
			var n = /* @__PURE__ */ new Set();
			if (e.all) for (var r = 0, i = Object.values(Dr); r < i.length; r++) {
				var a = i[r];
				Mr(a, e, n, t);
			}
			else for (var o in e) {
				var s = /^idb\:\/\/(.*)\/(.*)\//.exec(o);
				if (s) {
					var a = Dr[`idb://${s[1]}/${s[2]}`];
					a && Mr(a, e, n, t);
				}
			}
			n.forEach(function(e) {
				return e();
			});
		}
		function Mr(e, t, n, r) {
			for (var i = [], a = 0, o = Object.entries(e.queries.query); a < o.length; a++) {
				for (var s = o[a], c = s[0], l = s[1], u = [], d = 0, f = l; d < f.length; d++) {
					var p = f[d];
					W(t, p.obsSet) ? p.subscribers.forEach(function(e) {
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
		function Nr(e) {
			var t = e._state, n = e._deps.indexedDB;
			if (t.isBeingOpened || e.idbdb) return t.dbReadyPromise.then(function() {
				return t.dbOpenError ? kt(t.dbOpenError) : e;
			});
			t.isBeingOpened = !0, t.dbOpenError = null, t.openComplete = !1;
			var r = t.openCanceller, a = Math.round(e.verno * 10), o = !1;
			function s() {
				if (t.openCanceller !== r) throw new I.DatabaseClosed("db.open() was cancelled");
			}
			var c = t.dbReadyResolve, l = null, u = !1, d = function() {
				return new R(function(r, i) {
					if (s(), !n) throw new I.MissingAPI();
					var c = e.name, f = t.autoSchema || !a ? n.open(c) : n.open(c, a);
					if (!f) throw new I.MissingAPI();
					f.onerror = U(i), f.onblocked = z(e._fireOnBlocked), f.onupgradeneeded = z(function(r) {
						if (l = f.transaction, t.autoSchema && !e._options.allowEmptyDB) {
							f.onerror = Cn, l.abort(), f.result.close();
							var a = n.deleteDatabase(c);
							a.onsuccess = a.onerror = z(function() {
								i(new I.NoSuchDatabase(`Database ${c} doesnt exist`));
							});
						} else {
							l.onerror = U(i);
							var s = r.oldVersion > 2 ** 62 ? 0 : r.oldVersion;
							u = s < 1, e.idbdb = f.result, o && qn(e, l), Kn(e, s / 10, l, i);
						}
					}, i), f.onsuccess = z(function() {
						l = null;
						var n = e.idbdb = f.result, i = v(n.objectStoreNames);
						if (i.length > 0) try {
							var s = n.transaction(Mn(i), "readonly");
							if (t.autoSchema) nr(e, n, s);
							else if (ir(e, e._dbSchema, s), !rr(e, s) && !o) return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), n.close(), a = n.version + 1, o = !0, r(d());
							Hn(e, s);
						} catch {}
						cr.add(e), n.onversionchange = z(function(n) {
							t.vcFired = !0, e.on("versionchange").fire(n);
						}), n.onclose = z(function() {
							e.close({ disableAutoOpen: !1 });
						}), u && pr(e._deps, c), r();
					}, i);
				}).catch(function(e) {
					switch (e?.name) {
						case "UnknownError":
							if (t.PR1398_maxLoop > 0) return t.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), d();
							break;
						case "VersionError": if (a > 0) return a = 0, d();
					}
					return R.reject(e);
				});
			}, f = typeof navigator < "u" && !!n && n === i.indexedDB;
			return R.race([r, (f ? gr() : R.resolve()).then(d)]).then(function() {
				return s(), t.onReadyBeingFired = [], R.resolve(hr(function() {
					return e.on.ready.fire(e.vip);
				})).then(function n() {
					if (t.onReadyBeingFired.length > 0) {
						var r = t.onReadyBeingFired.reduce(Oe, be);
						return t.onReadyBeingFired = [], R.resolve(hr(function() {
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
				return r === t.openCanceller && e._close(), kt(n);
			}).finally(function() {
				t.openComplete = !0, c();
			}).then(function() {
				if (u) {
					var t = {};
					e.tables.forEach(function(n) {
						n.schema.indexes.forEach(function(r) {
							r.name && (t[`idb://${e.name}/${n.name}/${r.name}`] = new yr(-Infinity, [[[]]]));
						}), t[`idb://${e.name}/${n.name}/`] = t[`idb://${e.name}/${n.name}/:dels`] = new yr(-Infinity, [[[]]]);
					}), En(wn).fire(t), jr(t, !0);
				}
				return e;
			});
		}
		function Pr(e) {
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
		function Fr(e, t, n) {
			var r = arguments.length;
			if (r < 2) throw new I.InvalidArgument("Too few arguments");
			for (var i = Array(r - 1); --r;) i[r - 1] = arguments[r];
			return n = i.pop(), [
				e,
				O(i),
				n
			];
		}
		function Ir(e, t, n, r, i) {
			return R.resolve().then(function() {
				var a = L.transless || L, o = e._createTransaction(t, n, e._dbSchema, r);
				o.explicit = !0;
				var s = {
					trans: o,
					transless: a
				};
				if (r) o.idbtrans = r.idbtrans;
				else try {
					o.create(), o.idbtrans._explicit = !0, e._state.PR1398_maxLoop = 3;
				} catch (r) {
					return r.name === he.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
						return Ir(e, t, n, null, i);
					})) : kt(r);
				}
				var c = se(i);
				c && yt();
				var l, u = R.follow(function() {
					if (l = i.call(o, o), l) {
						if (c) {
							var e = bt.bind(null, null);
							l.then(e, e);
						} else typeof l.next == "function" && typeof l.throw == "function" && (l = Pr(l));
					}
				}, s);
				return (l && typeof l.then == "function" ? R.resolve(l).then(function(e) {
					return o.active ? e : kt(new I.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
				}) : u.then(function() {
					return l;
				})).then(function(e) {
					return r && o._resolve(), o._completion.then(function() {
						return e;
					});
				}).catch(function(e) {
					return o._reject(e), kt(e);
				});
			});
		}
		function Lr(e, t, n) {
			for (var r = o(e) ? e.slice() : [e], i = 0; i < n; ++i) r.push(t);
			return r;
		}
		function Rr(e) {
			return n(n({}, e), { table: function(t) {
				var r = e.table(t), i = r.schema, a = Object.create(null), o = [];
				function s(e, t, r) {
					var i = Rn(e), c = a[i] = a[i] || [], l = e == null ? 0 : typeof e == "string" ? 1 : e.length, u = t > 0, d = n(n({}, r), {
						name: u ? `${i}(virtual-from:${r.name})` : r.name,
						lowLevelIndex: r,
						isVirtual: u,
						keyTail: t,
						keyLength: l,
						extractKey: Pn(e),
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
					var t = a[Rn(e)];
					return t && t[0];
				}
				function p(t, n) {
					return {
						type: t.type === 1 ? 2 : t.type,
						lower: Lr(t.lower, t.lowerOpen ? e.MAX_KEY : e.MIN_KEY, n),
						lowerOpen: !0,
						upper: Lr(t.upper, t.upperOpen ? e.MIN_KEY : e.MAX_KEY, n),
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
								r == null ? t.unique ? n.continue(n.key.slice(0, o).concat(t.reverse ? e.MIN_KEY : e.MAX_KEY, i)) : n.continue() : n.continue(Lr(r, t.reverse ? e.MAX_KEY : e.MIN_KEY, i));
							}
							return Object.create(n, {
								continue: { value: r },
								continuePrimaryKey: { value: function(t, r) {
									n.continuePrimaryKey(Lr(t, e.MAX_KEY, i), r);
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
		var zr = {
			stack: "dbcore",
			name: "VirtualIndexMiddleware",
			level: 1,
			create: Rr
		};
		function Br(e, t, n, r) {
			return n ||= {}, r ||= "", a(e).forEach(function(i) {
				if (!u(t, i)) n[r + i] = void 0;
				else {
					var a = e[i], o = t[i];
					if (typeof a == "object" && typeof o == "object" && a && o) {
						var s = re(a);
						s === re(o) ? s === "Object" ? Br(a, o, n, r + i + ".") : a !== o && (n[r + i] = t[i]) : n[r + i] = t[i];
					} else a !== o && (n[r + i] = t[i]);
				}
			}), a(t).forEach(function(i) {
				u(e, i) || (n[r + i] = t[i]);
			}), n;
		}
		function Vr(e, t) {
			return t.type === "delete" ? t.keys : t.keys || t.values.map(e.extractKey);
		}
		var Hr = {
			stack: "dbcore",
			name: "HooksMiddleware",
			level: 2,
			create: function(e) {
				return n(n({}, e), { table: function(t) {
					var i = e.table(t), a = i.schema.primaryKey;
					return n(n({}, i), { mutate: function(e) {
						var o = L.trans, s = o.table(t).hook, c = s.deleting, l = s.creating, d = s.updating;
						switch (e.type) {
							case "add":
								if (l.fire === be) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "put":
								if (l.fire === be && d.fire === be) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "delete":
								if (c.fire === be) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "deleteRange":
								if (c.fire === be) break;
								return o._promise("readwrite", function() {
									return p(e);
								}, !0);
						}
						return i.mutate(e);
						function f(e) {
							var t = L.trans, o = e.keys || Vr(a, e);
							if (!o) throw Error("Keys missing");
							return e = e.type === "add" || e.type === "put" ? n(n({}, e), { keys: o }) : n({}, e), e.type !== "delete" && (e.values = r([], e.values, !0)), e.keys && (e.keys = r([], e.keys, !0)), Ur(i, e, o).then(function(n) {
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
										var p = Br(o, e.values[i]), m = d.fire.call(s, p, r, o, t);
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
		function Ur(e, t, n) {
			return t.type === "add" ? Promise.resolve([]) : e.getMany({
				trans: t.trans,
				keys: n,
				cache: "immutable"
			});
		}
		function Wr(e, t, n) {
			try {
				if (!t || t.keys.length < e.length) return null;
				for (var r = [], i = 0, a = 0; i < t.keys.length && a < e.length; ++i) B(t.keys[i], e[a]) === 0 && (r.push(n ? A(t.values[i]) : t.values[i]), ++a);
				return r.length === e.length ? r : null;
			} catch {
				return null;
			}
		}
		var Gr = {
			stack: "dbcore",
			level: -1,
			create: function(e) {
				return { table: function(t) {
					var r = e.table(t);
					return n(n({}, r), {
						getMany: function(e) {
							if (!e.cache) return r.getMany(e);
							var t = Wr(e.keys, e.trans._cache, e.cache === "clone");
							return t ? R.resolve(t) : r.getMany(e).then(function(t) {
								return e.trans._cache = {
									keys: e.keys,
									values: e.cache === "clone" ? A(t) : t
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
		function Kr(e, t) {
			return e.trans.mode === "readonly" && !!e.subscr && !e.trans.explicit && e.trans.db._options.cache !== "disabled" && !t.schema.primaryKey.outbound;
		}
		function qr(e, t) {
			switch (e) {
				case "query": return t.values && !t.unique;
				case "get": return !1;
				case "getMany": return !1;
				case "count": return !1;
				case "openCursor": return !1;
			}
		}
		var Jr = {
			stack: "dbcore",
			level: 0,
			name: "Observability",
			create: function(e) {
				var t = e.schema.name, r = new yr(e.MIN_KEY, e.MAX_KEY);
				return n(n({}, e), {
					transaction: function(t, n, r) {
						if (L.subscr && n !== "readonly") throw new I.ReadOnly(`Readwrite transaction in liveQuery context. Querier source: ${L.querier}`);
						return e.transaction(t, n, r);
					},
					table: function(i) {
						var s = e.table(i), c = s.schema, l = c.primaryKey, u = c.indexes, d = l.extractKey, f = l.outbound, p = l.autoIncrement && u.filter(function(e) {
							return e.compound && e.keyPath.includes(l.keyPath);
						}), m = n(n({}, s), { mutate: function(n) {
							var a = n.trans, u = n.mutatedParts ||= {}, d = function(e) {
								var n = `idb://${t}/${i}/${e}`;
								return u[n] || (u[n] = new yr());
							}, f = d(""), m = d(":dels"), h = n.type, g = n.type === "deleteRange" ? [n.range] : n.type === "delete" ? [n.keys] : n.values.length < 50 ? [Vr(l, n).filter(function(e) {
								return e != null;
							}), n.values] : [], _ = g[0], v = g[1], y = n.trans._cache;
							if (o(_)) {
								f.addKeys(_);
								var b = h === "delete" || _.length === v.length ? Wr(_, y) : null;
								b || m.addKeys(_), (b || v) && Yr(d, c, b, v);
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
								})), a.mutatedParts = Er(a.mutatedParts || {}, u), e;
							});
						} }), h = function(t) {
							var n = t.query, r = n.index, i = n.range;
							return [r, new yr(i.lower ?? e.MIN_KEY, i.upper ?? e.MAX_KEY)];
						}, g = {
							get: function(e) {
								return [l, new yr(e.key)];
							},
							getMany: function(e) {
								return [l, new yr().addKeys(e.keys)];
							},
							count: h,
							query: h,
							openCursor: h
						};
						return a(g).forEach(function(e) {
							m[e] = function(a) {
								var o = L.subscr, c = !!o, l = Kr(L, s) && qr(e, a) ? a.obsSet = {} : o;
								if (c) {
									var u = function(e) {
										var n = `idb://${t}/${i}/${e}`;
										return l[n] || (l[n] = new yr());
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
		function Yr(e, t, n, r) {
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
					B(i, o) !== 0 && (i != null && s(i), o != null && s(o));
				});
			}
			t.indexes.forEach(i);
		}
		function Xr(e, t, r) {
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
		function Zr(e, t) {
			return t.lower === void 0 ? !0 : t.lowerOpen ? B(e, t.lower) > 0 : B(e, t.lower) >= 0;
		}
		function Qr(e, t) {
			return t.upper === void 0 ? !0 : t.upperOpen ? B(e, t.upper) < 0 : B(e, t.upper) <= 0;
		}
		function $r(e, t) {
			return Zr(e, t) && Qr(e, t);
		}
		function ei(e, t, n, r, i, a) {
			if (!n || n.length === 0) return e;
			var s = t.query.index, c = s.multiEntry, l = t.query.range, u = r.schema.primaryKey.extractKey, d = s.extractKey, f = (s.lowLevelIndex || s).extractKey, p = n.reduce(function(e, n) {
				var r = e, i = [];
				if (n.type === "add" || n.type === "put") for (var a = new yr(), s = n.values.length - 1; s >= 0; --s) {
					var f = n.values[s], p = u(f);
					if (!a.hasKey(p)) {
						var m = d(f);
						(c && o(m) ? m.some(function(e) {
							return $r(e, l);
						}) : $r(m, l)) && (a.addKey(p), i.push(f));
					}
				}
				switch (n.type) {
					case "add":
						var h = new yr().addKeys(t.values ? e.map(function(e) {
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
						var g = new yr().addKeys(n.values.map(function(e) {
							return u(e);
						}));
						r = e.filter(function(e) {
							return !g.hasKey(t.values ? u(e) : e);
						}).concat(t.values ? i : i.map(function(e) {
							return u(e);
						}));
						break;
					case "delete":
						var _ = new yr().addKeys(n.keys);
						r = e.filter(function(e) {
							return !_.hasKey(t.values ? u(e) : e);
						});
						break;
					case "deleteRange":
						var v = n.range;
						r = e.filter(function(e) {
							return !$r(u(e), v);
						});
				}
				return r;
			}, e);
			if (p === e) return e;
			var m = function(e, t) {
				return B(f(e), f(t)) || B(u(e), u(t));
			};
			return p.sort(t.direction === "prev" || t.direction === "prevunique" ? function(e, t) {
				return m(t, e);
			} : m), t.limit && t.limit < Infinity && (p.length > t.limit ? p.length = t.limit : e.length === t.limit && p.length < t.limit && (i.dirty = !0)), a ? Object.freeze(p) : p;
		}
		function ti(e, t) {
			return B(e.lower, t.lower) === 0 && B(e.upper, t.upper) === 0 && !!e.lowerOpen == !!t.lowerOpen && !!e.upperOpen == !!t.upperOpen;
		}
		function ni(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : -1;
			if (t === void 0) return 1;
			var i = B(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return 1;
				if (r) return -1;
			}
			return i;
		}
		function ri(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : 1;
			if (t === void 0) return -1;
			var i = B(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return -1;
				if (r) return 1;
			}
			return i;
		}
		function ii(e, t) {
			return ni(e.lower, t.lower, e.lowerOpen, t.lowerOpen) <= 0 && ri(e.upper, t.upper, e.upperOpen, t.upperOpen) >= 0;
		}
		function ai(e, t, n, r) {
			var i = Dr[`idb://${e}/${t}`];
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
						return e.req.limit === r.limit && e.req.values === r.values && (e.req.direction ?? "next") === s && ti(e.req.query.range, r.query.range);
					});
					return c ? [
						c,
						!0,
						i,
						o
					] : [
						o.find(function(e) {
							return ("limit" in e.req ? e.req.limit : Infinity) >= r.limit && (e.req.direction ?? "next") === s && (!r.values || e.req.values) && ii(e.req.query.range, r.query.range);
						}),
						!1,
						i,
						o
					];
				case "count":
					var l = o.find(function(e) {
						return ti(e.req.query.range, r.query.range);
					});
					return [
						l,
						!!l,
						i,
						o
					];
			}
		}
		function oi(e, t, n, r) {
			e.subscribers.add(n), r.addEventListener("abort", function() {
				e.subscribers.delete(n), e.subscribers.size === 0 && si(e, t);
			});
		}
		function si(e, t) {
			setTimeout(function() {
				e.subscribers.size === 0 && ae(t, e);
			}, 3e3);
		}
		var ci = {
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
											var u = l[c], d = Dr[`idb://${t}/${u}`];
											if (d) {
												var f = e.table(u), p = d.optimisticOps.filter(function(e) {
													return e.trans === a;
												});
												if (a._explicit && i && a.mutatedParts) for (var m = 0, h = Object.values(d.queries.query); m < h.length; m++) for (var g = h[m], _ = 0, v = g.slice(); _ < v.length; _++) {
													var y = v[_];
													W(y.obsSet, a.mutatedParts) && (ae(g, y), y.subscribers.forEach(function(e) {
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
																var w = Object.isFrozen(y.res), T = ei(y.res, y.req, p, f, y, w);
																y.dirty ? (ae(g, y), y.subscribers.forEach(function(e) {
																	return s.add(e);
																})) : T !== y.res && (y.res = T, y.promise = R.resolve({ result: T }));
															} else y.dirty && ae(g, y), y.subscribers.forEach(function(e) {
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
								var o = L.trans;
								if (a.outbound || o.db._options.cache === "disabled" || o.explicit || o.idbtrans.mode !== "readwrite") return i.mutate(e);
								var s = Dr[`idb://${t}/${r}`];
								if (!s) return i.mutate(e);
								var c = i.mutate(e);
								return (e.type === "add" || e.type === "put") && (e.values.length >= 50 || Vr(a, e).some(function(e) {
									return e == null;
								})) ? c.then(function(t) {
									var r = Xr(s, n(n({}, e), { values: e.values.map(function(e, r) {
										if (t.failures[r]) return e;
										var i = a.keyPath?.includes(".") ? A(e) : n({}, e);
										return w(i, a.keyPath, t.results[r]), i;
									}) }), t);
									s.optimisticOps.push(r), queueMicrotask(function() {
										return e.mutatedParts && Ar(e.mutatedParts);
									});
								}) : (s.optimisticOps.push(e), e.mutatedParts && Ar(e.mutatedParts), c.then(function(t) {
									if (t.numFailures > 0) {
										ae(s.optimisticOps, e);
										var n = Xr(s, e, t);
										n && s.optimisticOps.push(n), e.mutatedParts && Ar(e.mutatedParts);
									}
								}), c.catch(function() {
									ae(s.optimisticOps, e), e.mutatedParts && Ar(e.mutatedParts);
								})), c;
							},
							query: function(e) {
								if (!Kr(L, i) || !qr("query", e)) return i.query(e);
								var n = L.trans?.db._options.cache === "immutable", a = L, o = a.requery, s = a.signal, c = ai(t, r, "query", e), l = c[0], u = c[1], d = c[2], f = c[3];
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
										return f && l && ae(f, l), Promise.reject(e);
									});
									l = {
										obsSet: e.obsSet,
										promise: p,
										subscribers: /* @__PURE__ */ new Set(),
										type: "query",
										req: e,
										dirty: !1
									}, f ? f.push(l) : (f = [l], d ||= Dr[`idb://${t}/${r}`] = {
										queries: {
											query: {},
											count: {}
										},
										objs: /* @__PURE__ */ new Map(),
										optimisticOps: [],
										unsignaledParts: {}
									}, d.queries.query[e.query.index.name || ""] = f);
								}
								return oi(l, f, o, s), l.promise.then(function(t) {
									var r = ei(t.result, e, d?.optimisticOps, i, l, n);
									return { result: n ? r : A(r) };
								});
							}
						});
					}
				});
			}
		};
		function li(e, t) {
			return new Proxy(e, { get: function(e, n, r) {
				return n === "db" ? t : Reflect.get(e, n, r);
			} });
		}
		var ui = function() {
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
					maxConnections: It
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
					dbReadyResolve: be,
					dbReadyPromise: null,
					cancelOpen: be,
					openCanceller: null,
					autoSchema: !0,
					PR1398_maxLoop: 3,
					autoOpen: r.autoOpen
				};
				s.dbReadyPromise = new R(function(e) {
					s.dbReadyResolve = e;
				}), s.openCanceller = new R(function(e, t) {
					s.cancelOpen = t;
				}), this._state = s, this.name = t, this.on = Qt(this, "populate", "blocked", "versionchange", "close", { ready: [Oe, be] }), this.once = function(e, t) {
					var n = function() {
						var r = [...arguments];
						i.on(e).unsubscribe(n), t.apply(i, r);
					};
					return i.on(e, n);
				}, this.on.ready.subscribe = y(this.on.ready.subscribe, function(t) {
					return function(n, r) {
						e.vip(function() {
							var e = i._state;
							if (e.openComplete) e.dbOpenError || R.resolve().then(n), r && t(n);
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
				}), this.Collection = fn(this), this.Table = en(this), this.Transaction = On(this), this.Version = sr(this), this.WhereClause = Sn(this), this.on("versionchange", function(e) {
					e.newVersion > 0 ? console.warn(`Another connection wants to upgrade database '${i.name}'. Closing db now to resume the upgrade.`) : console.warn(`Another connection wants to delete database '${i.name}'. Closing db now to resume the delete request.`), i.close({ disableAutoOpen: !1 });
				}), this.on("blocked", function(e) {
					!e.newVersion || e.newVersion < e.oldVersion ? console.warn(`Dexie.delete('${i.name}') was blocked`) : console.warn(`Upgrade '${i.name}' blocked by other connection holding version ${e.oldVersion / 10}`);
				}), this._maxKey = Nn(r.IDBKeyRange), this._createTransaction = function(e, t, n, r) {
					return new i.Transaction(e, t, n, i._options.chromeTransactionDurability, r);
				}, this._fireOnBlocked = function(e) {
					i.on("blocked").fire(e), cr.toArray().filter(function(e) {
						return e.name === i.name && e !== i && !e._state.vcFired;
					}).map(function(t) {
						return t.on("versionchange").fire(e);
					});
				}, this.use(Gr), this.use(ci), this.use(Jr), this.use(zr), this.use(Hr);
				var c = new Proxy(this, { get: function(e, t, n) {
					if (t === "_vip") return !0;
					if (t === "table") return function(e) {
						return li(i.table(e), c);
					};
					var r = Reflect.get(e, t, n);
					return r instanceof Zt ? li(r, c) : t === "tables" ? r.map(function(e) {
						return li(e, c);
					}) : t === "_createTransaction" ? function() {
						return li(r.apply(this, arguments), c);
					} : r;
				} });
				this.vip = c, o.forEach(function(e) {
					return e(i);
				});
			}
			return e.prototype.version = function(e) {
				if (isNaN(e) || e < .1) throw new I.Type("Given version is not a positive number");
				if (e = Math.round(e * 10) / 10, this.idbdb || this._state.isBeingOpened) throw new I.Schema("Cannot add version when database is open");
				this.verno = Math.max(this.verno, e);
				var t = this._versions, n = t.filter(function(t) {
					return t._cfg.version === e;
				})[0];
				return n || (n = new this.Version(e), t.push(n), t.sort(Gn), n.stores({}), this._state.autoSchema = !1, n);
			}, e.prototype._whenReady = function(e) {
				var t = this;
				return this.idbdb && (this._state.openComplete || L.letThrough || this._vip) ? e() : new R(function(e, n) {
					if (t._state.openComplete) return n(new I.DatabaseClosed(t._state.dbOpenError));
					if (!t._state.isBeingOpened) {
						if (!t._state.autoOpen) {
							n(new I.DatabaseClosed());
							return;
						}
						t.open().catch(be);
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
				return Et(qe, function() {
					return Nr(e);
				});
			}, e.prototype._close = function() {
				this.on.close.fire(new CustomEvent("close"));
				var e = this._state;
				if (cr.remove(this), this.idbdb) {
					try {
						this.idbdb.close();
					} catch {}
					this.idbdb = null;
				}
				e.isBeingOpened || (e.dbReadyPromise = new R(function(t) {
					e.dbReadyResolve = t;
				}), e.openCanceller = new R(function(t, n) {
					e.cancelOpen = n;
				}));
			}, e.prototype.close = function(e) {
				var t = (e === void 0 ? { disableAutoOpen: !0 } : e).disableAutoOpen, n = this._state;
				t ? (n.isBeingOpened && n.cancelOpen(new I.DatabaseClosed()), this._close(), n.autoOpen = !1, n.dbOpenError = new I.DatabaseClosed()) : (this._close(), n.autoOpen = this._options.autoOpen || n.isBeingOpened, n.openComplete = !1, n.dbOpenError = null);
			}, e.prototype.delete = function(e) {
				var t = this;
				e === void 0 && (e = { disableAutoOpen: !0 });
				var n = arguments.length > 0 && typeof arguments[0] != "object", r = this._state;
				return new R(function(i, a) {
					var o = function() {
						t.close(e);
						var n = t._deps.indexedDB.deleteDatabase(t.name);
						n.onsuccess = z(function() {
							mr(t._deps, t.name), i();
						}), n.onerror = U(a), n.onblocked = t._fireOnBlocked;
					};
					if (n) throw new I.InvalidArgument("Invalid closeOptions argument to db.delete()");
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
				var e = Fr.apply(this, arguments);
				return this._transaction.apply(this, e);
			}, e.prototype._transaction = function(e, t, n) {
				var r = this, i = L.trans;
				i && i.db === this && e.indexOf("!") === -1 || (i = null);
				var a = e.indexOf("?") !== -1;
				e = e.replace("!", "").replace("?", "");
				var o, s;
				try {
					if (s = t.map(function(e) {
						var t = e instanceof r.Table ? e.name : e;
						if (typeof t != "string") throw TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
						return t;
					}), e == "r" || e === Rt) o = Rt;
					else if (e == "rw" || e == zt) o = zt;
					else throw new I.InvalidArgument("Invalid transaction mode: " + e);
					if (i) {
						if (i.mode === Rt && o === zt) {
							if (a) i = null;
							else throw new I.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
						}
						i && s.forEach(function(e) {
							if (i && i.storeNames.indexOf(e) === -1) {
								if (a) i = null;
								else throw new I.SubTransaction("Table " + e + " not included in parent transaction.");
							}
						}), a && i && !i.active && (i = null);
					}
				} catch (e) {
					return i ? i._promise(null, function(t, n) {
						n(e);
					}) : kt(e);
				}
				var c = Ir.bind(null, this, o, s, i, n);
				return i ? i._promise(o, c, "lock") : L.trans ? Et(L.transless, function() {
					return r._whenReady(c);
				}) : this._whenReady(c);
			}, e.prototype.table = function(e) {
				if (!u(this._allTables, e)) throw new I.InvalidTable(`Table ${e} does not exist`);
				return this._allTables[e];
			}, e;
		}(), di = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable", fi = function() {
			function e(e) {
				this._subscribe = e;
			}
			return e.prototype.subscribe = function(e, t, n) {
				return this._subscribe(!e || typeof e == "function" ? {
					next: e,
					error: t,
					complete: n
				} : e);
			}, e.prototype[di] = function() {
				return this;
			}, e;
		}(), pi;
		try {
			pi = {
				indexedDB: i.indexedDB || i.mozIndexedDB || i.webkitIndexedDB || i.msIndexedDB,
				IDBKeyRange: i.IDBKeyRange || i.webkitIDBKeyRange
			};
		} catch {
			pi = {
				indexedDB: null,
				IDBKeyRange: null
			};
		}
		function mi(e) {
			var t = !1, n, r = new fi(function(r) {
				var i = se(e);
				function a(t) {
					var n = at();
					try {
						i && yt();
						var r = vt(e, t);
						return i && (r = r.finally(bt)), r;
					} finally {
						n && ot();
					}
				}
				var o = !1, s, c = {}, l = {}, u = {
					get closed() {
						return o;
					},
					unsubscribe: function() {
						o || (o = !0, s && s.abort(), d && En.storagemutated.unsubscribe(m));
					}
				};
				r.start && r.start(u);
				var d = !1, f = function() {
					return Ot(h);
				};
				function p() {
					return W(l, c);
				}
				var m = function(e) {
					Er(c, e), p() && f();
				}, h = function() {
					if (!o && pi.indexedDB) {
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
						d ||= (En.storagemutated.subscribe(m), !0), Promise.resolve(h).then(function(e) {
							t = !0, n = e, !(o || u.signal.aborted) && (p() ? f() : (l = i, p() ? f() : (c = {}, Ot(function() {
								return !o && r.next && r.next(e);
							}))));
						}, function(e) {
							o || u.signal.aborted || (t = !1, ["DatabaseClosedError", "AbortError"].includes(e?.name) || o || Ot(function() {
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
		var hi = ui;
		d(hi, n(n({}, ye), {
			delete: function(e) {
				return new hi(e, { addons: [] }).delete();
			},
			exists: function(e) {
				return new hi(e, { addons: [] }).open().then(function(e) {
					return e.close(), !0;
				}).catch("NoSuchDatabaseError", function() {
					return !1;
				});
			},
			getDatabaseNames: function(e) {
				try {
					return fr(hi.dependencies).then(e);
				} catch {
					return kt(new I.MissingAPI());
				}
			},
			defineClass: function() {
				function e(e) {
					s(this, e);
				}
				return e;
			},
			ignoreTransaction: function(e) {
				return L.trans ? Et(L.transless || qe, e) : e();
			},
			vip: hr,
			async: function(e) {
				return function() {
					try {
						var t = Pr(e.apply(this, arguments));
						return !t || typeof t.then != "function" ? R.resolve(t) : t;
					} catch (e) {
						return kt(e);
					}
				};
			},
			spawn: function(e, t, n) {
				try {
					var r = Pr(e.apply(n, t || []));
					return !r || typeof r.then != "function" ? R.resolve(r) : r;
				} catch (e) {
					return kt(e);
				}
			},
			currentTransaction: { get: function() {
				return L.trans || null;
			} },
			waitFor: function(e, t) {
				var n = R.resolve(typeof e == "function" ? hi.ignoreTransaction(e) : e).timeout(t || 6e4);
				return L.trans ? L.trans.waitFor(n) : n;
			},
			Promise: R,
			debug: {
				get: function() {
					return ke;
				},
				set: function(e) {
					Ae(e);
				}
			},
			derive: m,
			extend: s,
			props: d,
			override: y,
			Events: Qt,
			on: En,
			liveQuery: mi,
			extendObservabilitySet: Er,
			getByKeyPath: C,
			setByKeyPath: w,
			delByKeyPath: T,
			shallowClone: E,
			deepClone: A,
			getObjectDiff: Br,
			cmp: B,
			asap: x,
			minKey: Nt,
			addons: [],
			connections: { get: cr.toArray },
			errnames: he,
			dependencies: pi,
			cache: Dr,
			semVer: jt,
			version: jt.split(".").map(function(e) {
				return parseInt(e);
			}).reduce(function(e, t, n) {
				return e + t / 10 ** (n * 2);
			})
		})), hi.maxKey = Nn(hi.dependencies.IDBKeyRange), typeof dispatchEvent < "u" && typeof addEventListener < "u" && (En(wn, function(e) {
			if (!gi) {
				var t = new CustomEvent(Tn, { detail: e });
				gi = !0, dispatchEvent(t), gi = !1;
			}
		}), addEventListener(Tn, function(e) {
			var t = e.detail;
			gi || G(t);
		}));
		function G(e) {
			var t = gi;
			try {
				gi = !0, En.storagemutated.fire(e), jr(e, !0);
			} finally {
				gi = t;
			}
		}
		var gi = !1, _i, vi = function() {};
		typeof BroadcastChannel < "u" && (vi = function() {
			_i = new BroadcastChannel(Tn), _i.onmessage = function(e) {
				return e.data && G(e.data);
			};
		}, vi(), typeof _i.unref == "function" && _i.unref(), En(wn, function(e) {
			gi || _i.postMessage(e);
		})), typeof addEventListener < "u" && (addEventListener("pagehide", function(e) {
			if (!ui.disableBfCache && e.persisted) {
				ke && console.debug("Dexie: handling persisted pagehide"), _i?.close();
				for (var t = 0, n = cr.toArray(); t < n.length; t++) n[t].close({ disableAutoOpen: !1 });
			}
		}), addEventListener("pageshow", function(e) {
			!ui.disableBfCache && e.persisted && (ke && console.debug("Dexie: handling persisted pageshow"), vi(), G({ all: new yr(-Infinity, [[]]) }));
		}));
		function yi(e) {
			return new Yt({ add: e });
		}
		function bi(e) {
			return new Yt({ remove: e });
		}
		function xi(e, t) {
			return new Yt({ replacePrefix: [e, t] });
		}
		return R.rejectionMapper = ve, Ae(ke), n(ui, /* @__PURE__ */ Object.freeze({
			__proto__: null,
			DEFAULT_MAX_CONNECTIONS: It,
			Dexie: ui,
			Entity: Ut,
			PropModification: Yt,
			RangeSet: yr,
			add: yi,
			cmp: B,
			default: ui,
			liveQuery: mi,
			mergeRanges: xr,
			rangesOverlap: Sr,
			remove: bi,
			replacePrefix: xi
		}), { default: ui }), ui;
	}));
})))(), 1), _x = Symbol.for("Dexie"), vx = globalThis[_x] || (globalThis[_x] = gx.default);
if (gx.default.semVer !== vx.semVer) throw Error(`Two different versions of Dexie loaded in the same app: ${gx.default.semVer} and ${vx.semVer}`);
var { liveQuery: yx, mergeRanges: bx, rangesOverlap: xx, RangeSet: Sx, cmp: Cx, Entity: wx, PropModification: Tx, replacePrefix: Ex, add: Dx, remove: Ox, DexieYProvider: kx } = vx, Ax = "tavern-trpg-assistant", jx = class extends vx {
	packs;
	entries;
	searchIndex;
	assets;
	workspaces;
	saves;
	meta;
	constructor(e = Ax) {
		super(e), this.version(1).stores({
			packs: "id, ruleId, kind, name",
			entries: "[packId+entryId], packId, [ruleId+type]",
			searchIndex: "packId",
			assets: "[packId+path], packId",
			workspaces: "ownerKey, ruleId",
			saves: "id, [ownerKey+ruleId], ruleId, kind, deletedAt",
			meta: "key"
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
};
// src/core/semver.ts
function Mx(e) {
	let t = /^(\d+)\.(\d+)\.(\d+)$/.exec(e);
	if (!t) throw Error(`版本号格式不正确：${e}`);
	return [
		Number(t[1]),
		Number(t[2]),
		Number(t[3])
	];
}
function Nx(e, t) {
	let n = Mx(e), r = Mx(t);
	for (let e = 0; e < 3; e++) if (n[e] !== r[e]) return n[e] < r[e] ? -1 : 1;
	return 0;
}
// node_modules/@noble/hashes/_u64.js
var Px = (e) => e / 2 ** 32 | 0, Fx = (e) => e >>> 0;
function Ix(e, t, n, r) {
	let i = Px(n), a = Fx(n);
	e.setUint32(t, r ? a : i, r), e.setUint32(t + 4, r ? i : a, r);
}
// node_modules/@noble/hashes/utils.js
function Lx(e) {
	return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
var Rx = (e) => e ? `"${e}" ` : "";
function zx(e, t = "") {
	if (typeof e != "number") throw TypeError(Rx(t) + "expected number, got " + typeof e);
	if (!Number.isSafeInteger(e) || e < 0) throw RangeError(Rx(t) + "expected integer >= 0, got " + e);
	return e;
}
function Bx(e, t, n = "") {
	if (Lx(e) && (t === void 0 || e.length === t)) return e;
	t !== void 0 && zx(t, "length");
	let r = Lx(e), i = t === void 0 ? "" : ` of length ${t}`, a = r ? `length=${e.length}` : `type=${typeof e}`, o = Rx(n) + "expected Uint8Array" + i + ", got " + a;
	throw r ? RangeError(o) : TypeError(o);
}
var Vx = (e, t) => {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError((t === "object" ? "" : `"${t}" `) + "expected object, got type=" + typeof e);
}, Hx = (e, t) => {
	Vx(e, t);
	let n = Object.getPrototypeOf(e);
	if (n !== Object.prototype && n !== null) throw TypeError(`"${t}" expected plain object`);
	if (Object.hasOwn(e, "__proto__")) throw TypeError(`"${t}.__proto__" is not allowed`);
};
function Ux(e, t = !0) {
	if (e.destroyed) throw Error("hash was destroyed");
	if (t && e.finished) throw Error("digest() was already called");
}
function Wx(e, t) {
	Bx(e, void 0, "output");
	let n = t.outputLen;
	if (!(e.length >= n)) throw RangeError("\"output\" expected length >= " + n);
}
function Gx(...e) {
	for (let t = 0; t < e.length; t++) e[t].fill(0);
}
function Kx(e) {
	return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function qx(e, t) {
	return e << 32 - t | e >>> t;
}
var Jx = typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Yx = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function Xx(e) {
	if (Bx(e), Jx) return e.toHex();
	let t = "";
	for (let n = 0; n < e.length; n++) t += Yx[e[n]];
	return t;
}
function Zx(e) {
	if (typeof e != "string") throw TypeError("string expected");
	let t = new TextEncoder().encode(e);
	try {
		return new Uint8Array(t);
	} finally {
		Gx(t);
	}
}
function Qx(e, t, n = "opts") {
	return Hx(e, "defaults"), t !== void 0 && Hx(t, n), Object.assign(Object.create(null), e, t);
}
function $x(e, t = {}) {
	if (typeof e != "function") throw TypeError("\"hashCons\" expected function, got type=" + typeof e);
	t = Qx({}, t, "info");
	let n = (t, n) => e(n).update(t).digest(), r = e(void 0);
	return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.canXOF = r.canXOF, n.create = (t) => e(t), Object.assign(n, t), Object.freeze(n);
}
var eS = (e) => ({ oid: Uint8Array.from([
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
function tS(e, t, n) {
	return e & t ^ ~e & n;
}
function nS(e, t, n) {
	return e & t ^ e & n ^ t & n;
}
var rS = class {
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
		this.blockLen = e, this.outputLen = t, this.padOffset = n, this.isLE = r, this.buffer = new Uint8Array(e), this.view = Kx(this.buffer);
	}
	update(e) {
		Ux(this), Bx(e);
		let { view: t, buffer: n, blockLen: r } = this, i = e.length, a = !1;
		for (let o = 0; o < i;) {
			let s = Math.min(r - this.pos, i - o);
			if (s === r) {
				let t = Kx(e);
				for (; r <= i - o; o += r) this.process(t, o);
				a = !0;
			} else n.set(o === 0 && s === i ? e : e.subarray(o, o + s), this.pos), this.pos += s, o += s, this.pos === r && (this.process(t, 0), this.pos = 0, a = !0);
		}
		return this.length += e.length, a && this.roundClean(), this;
	}
	digestInto(e) {
		Ux(this), Wx(e, this), this.finished = !0;
		let { buffer: t, view: n, blockLen: r, isLE: i } = this, { pos: a } = this;
		t[a++] = 128, t.fill(0, a), this.padOffset > r - a && (this.process(n, 0), t.fill(0)), Ix(n, r - 8, this.length * 8, i), this.process(n, 0), this.roundClean();
		let o = e === t ? n : Kx(e), s = this.outputLen, c = s / 4, l = this.get();
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
}, iS = /* @__PURE__ */ Uint32Array.from([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]), aS = /* @__PURE__ */ Uint32Array.from([
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
]), oS = /* @__PURE__ */ new Uint32Array(64), sS = class extends rS {
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
		for (let n = 0; n < 16; n++, t += 4) oS[n] = e.getUint32(t, !1);
		for (let e = 16; e < 64; e++) {
			let t = oS[e - 15], n = oS[e - 2], r = qx(t, 7) ^ qx(t, 18) ^ t >>> 3, i = qx(n, 17) ^ qx(n, 19) ^ n >>> 10;
			oS[e] = i + oS[e - 7] + r + oS[e - 16] | 0;
		}
		let { A: n, B: r, C: i, D: a, E: o, F: s, G: c, H: l } = this;
		for (let e = 0; e < 64; e++) {
			let t = qx(o, 6) ^ qx(o, 11) ^ qx(o, 25), u = l + t + tS(o, s, c) + aS[e] + oS[e] | 0, d = (qx(n, 2) ^ qx(n, 13) ^ qx(n, 22)) + nS(n, r, i) | 0;
			l = c, c = s, s = o, o = a + u | 0, a = i, i = r, r = n, n = u + d | 0;
		}
		n = n + this.A | 0, r = r + this.B | 0, i = i + this.C | 0, a = a + this.D | 0, o = o + this.E | 0, s = s + this.F | 0, c = c + this.G | 0, l = l + this.H | 0, this.set(n, r, i, a, o, s, c, l);
	}
	roundClean() {
		Gx(oS);
	}
	destroy() {
		this.destroyed = !0, this.set(0, 0, 0, 0, 0, 0, 0, 0), Gx(this.buffer);
	}
}, cS = class extends sS {
	constructor() {
		super(32, iS);
	}
}, lS = /* @__PURE__ */ $x(() => new cS(), /* @__PURE__ */ eS(1));
// src/core/hash.ts
function uS(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e) ?? "null";
	if (Array.isArray(e)) return `[${e.map((e) => uS(e === void 0 ? null : e)).join(",")}]`;
	let t = e;
	return `{${Object.keys(t).filter((e) => t[e] !== void 0).sort().map((e) => `${JSON.stringify(e)}:${uS(t[e])}`).join(",")}}`;
}
function dS(e) {
	return Xx(lS(typeof e == "string" ? Zx(e) : e));
}
function fS(e) {
	return dS(uS(e));
}
// src/core/migrate.ts
var pS = {
	workspace: {},
	save: {},
	pack: {}
}, mS = "这个存档由更新版本的扩展创建，请先更新扩展";
function hS(e, t, n = {}) {
	let r = n.current ?? Jy[e], i = n.migrations ?? pS[e], a = Number(t.schemaVersion);
	if (!Number.isInteger(a) || a < 0) throw new $("E_BAD_VERSION", "文件内容损坏：缺少有效的版本号");
	if (a > r) throw new $("E_NEWER_DATA", mS, {
		kind: e,
		version: a,
		current: r
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
// src/schemas/pack.ts
var gS = Sy(["data", "module"]), _S = Sy([
	"builtin",
	"download",
	"import"
]), vS = py({
	id: Yy,
	minVersion: Xy.optional()
}), yS = py({
	id: Yy,
	ruleId: Yy,
	kind: gS,
	name: Q().min(1).max(80),
	nameEn: Q().max(120).optional(),
	version: Xy,
	minAppVersion: Xy.optional(),
	license: Q().max(200).default(""),
	attribution: Q().max(4e3).default(""),
	description: Q().max(400).default(""),
	entryCount: ty().int().nonnegative(),
	typeCounts: by(Q(), ty().int().nonnegative()).default({}),
	dependsOn: dy(vS).default([])
});
yS.extend({
	source: _S,
	byteSize: ty().int().nonnegative(),
	sha256: Q(),
	installedAt: Zy,
	schemaVersion: ty().int()
});
var bS = py({
	id: Q().min(1).max(160),
	type: Q().min(1).max(40),
	name: Q().min(1).max(200),
	nameEn: Q().max(240).optional(),
	keywords: dy(Q()).default([]),
	unique: ay().default(!1),
	summary: Q().default(""),
	data: by(Q(), sy()).default({}),
	image: Q().optional()
}), xS = py({
	format: wy("trpg-pack"),
	formatVersion: ty().int().max(1),
	pack: yS
}), SS = py({
	format: Sy(["trpg-save", "trpg-backup"]),
	formatVersion: ty().int().max(1),
	appVersion: Q(),
	exportedAt: Q(),
	ruleIds: dy(Q())
}), CS = py({
	id: Yy,
	version: Xy,
	name: Q()
});
py({
	formatVersion: ty().int(),
	rules: dy(py({
		id: Yy,
		name: Q(),
		nameShort: Q(),
		status: Sy(["installable", "coming"]),
		description: Q().default("")
	})).default([]),
	packs: dy(yS.pick({
		id: !0,
		ruleId: !0,
		kind: !0,
		name: !0,
		nameEn: !0,
		version: !0,
		license: !0,
		description: !0,
		typeCounts: !0,
		dependsOn: !0
	}).extend({
		byteSize: ty().int().nonnegative(),
		sha256: Q(),
		url: Q(),
		updatedAt: Q().optional()
	})).default([])
});
var wS = my({ instances: dy(py({
	id: Q().min(1),
	type: Q().min(1),
	name: Q().min(1),
	label: Q().optional(),
	sourceRef: py({
		packId: Yy,
		version: Xy,
		entryId: Q()
	}).optional(),
	data: by(Q(), sy()).default({})
})).default([]) }), TS = py({
	id: Yy,
	version: Xy
}), ES = py({
	ownerKey: Q().min(1),
	ownerLabel: Q(),
	ruleId: Yy,
	currentSaveId: Q().nullable(),
	enabledPacks: dy(TS),
	data: wS,
	savedHash: Q(),
	schemaVersion: ty().int(),
	updatedAt: Zy
}), DS = py({
	partyNames: dy(Q()).default([]),
	partyCount: ty().int().nonnegative().default(0),
	location: Q().optional(),
	round: ty().int().optional()
}), OS = Sy([
	"读档前",
	"新存档前",
	"切换规则前",
	"恢复备份前"
]), kS = py({
	id: Q().min(1),
	ownerKey: Q().min(1),
	ownerLabel: Q(),
	ruleId: Yy,
	name: Q().min(1).max(80),
	note: Q().max(400).default(""),
	kind: Sy(["manual", "auto"]),
	autoReason: OS.optional(),
	branchedFrom: Q().optional(),
	createdAt: Zy,
	updatedAt: Zy,
	deletedAt: Zy.optional(),
	summary: DS,
	packs: dy(CS),
	snapshot: wS,
	hash: Q(),
	schemaVersion: ty().int()
}), AS = py({
	reminderDays: ty().int().positive().default(7),
	reminderSaves: ty().int().positive().default(10),
	catalogUrl: Q().default("https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json")
}), jS = py({
	lastExportAt: Zy.nullable().default(null),
	savesSinceExport: ty().int().nonnegative().default(0),
	persistRequested: ay().default(!1),
	persistGranted: ay().default(!1)
});
// src/core/packs/recognize.ts
function MS(e) {
	return e?.path.map(String).join(".") || "整体";
}
function NS(e) {
	return new $("E_BAD_CONTENT", `文件内容损坏：${e}`);
}
function PS(e) {
	let t = [], n = Object.keys(e).filter((e) => e.startsWith("entries/") && e.endsWith(".json")).sort();
	for (let r of n) {
		let n = mx(e, r);
		if (!Array.isArray(n)) throw NS(`${r} 不是条目列表`);
		for (let e of n) {
			let n = bS.safeParse(e);
			if (!n.success) {
				let r = e?.name;
				throw NS(`第 ${t.length + 1} 项「${typeof r == "string" ? r : "未命名"}」的 ${MS(n.error.issues[0])} 不合法`);
			}
			t.push(n.data);
		}
	}
	return t;
}
function FS(e, t, n, r) {
	let i = t.pack?.ruleId;
	if (typeof i == "string" && !r.hasRule(i)) throw new $("E_RULE_MISSING", `需要先安装规则『${i}』`, { ruleId: i });
	let a = xS.safeParse(t);
	if (!a.success) throw NS(`说明文件的 ${MS(a.error.issues[0])} 不合法`);
	let o = a.data.pack;
	if (o.minAppVersion && Nx(o.minAppVersion, r.appVersion) > 0) throw new $("E_NEWER_APP", `需要先把扩展更新到 v${o.minAppVersion} 才能安装这个内容包`);
	let s = PS(e);
	if (s.length !== o.entryCount) throw NS(`条目数量不符（说明为 ${o.entryCount}，实际 ${s.length}）`);
	let c = {};
	for (let e of s) c[e.type] = (c[e.type] ?? 0) + 1;
	let l = /* @__PURE__ */ new Map();
	for (let [t, n] of Object.entries(e)) t.startsWith("assets/") && !t.endsWith("/") && l.set(t.slice(7), n);
	return {
		type: "pack",
		manifest: {
			...o,
			typeCounts: c
		},
		entries: s,
		assets: l,
		byteSize: n.length,
		sha256: dS(n)
	};
}
function IS(e, t, n, r) {
	let i = [];
	for (let a of Object.keys(e).filter((e) => e.startsWith(t) && e.endsWith(".json")).sort()) {
		let t = mx(e, a);
		if (!t || typeof t != "object") throw NS(`${a} 不是有效的记录`);
		let o = r(hS(n, t));
		if (!o.ok) throw NS(`${a} 的 ${o.detail} 不合法`);
		i.push(o.value);
	}
	return i;
}
function LS(e, t) {
	let n = SS.safeParse(t);
	if (!n.success) throw NS(`说明文件的 ${MS(n.error.issues[0])} 不合法`);
	let r = IS(e, "saves/", "save", (e) => {
		let t = kS.safeParse(e);
		return t.success ? {
			ok: !0,
			value: t.data
		} : {
			ok: !1,
			detail: MS(t.error.issues[0])
		};
	}), i = IS(e, "workspaces/", "workspace", (e) => {
		let t = ES.safeParse(e);
		return t.success ? {
			ok: !0,
			value: t.data
		} : {
			ok: !1,
			detail: MS(t.error.issues[0])
		};
	}), a, o = mx(e, "settings.json");
	if (o !== void 0) {
		let e = AS.safeParse(o);
		if (!e.success) throw NS(`settings.json 的 ${MS(e.error.issues[0])} 不合法`);
		a = e.data;
	}
	let s = mx(e, "packs.json"), c = [];
	if (Array.isArray(s)) for (let e of s) {
		let t = CS.safeParse(e);
		t.success && c.push(t.data);
	}
	let l = /* @__PURE__ */ new Map();
	for (let [t, n] of Object.entries(e)) t.startsWith("packs/") && t.endsWith(".trpgpack") && l.set(t, n);
	return {
		type: n.data.format === "trpg-backup" ? "backup" : "save",
		manifest: n.data,
		saves: r,
		workspaces: i,
		settings: a,
		packList: c,
		attachedPacks: l
	};
}
function RS(e, t) {
	let n = fx(e), r = n["trpg-manifest.json"];
	if (!r) throw new $("E_NO_MANIFEST", "无法识别：缺少说明文件，可能不是本扩展导出的文件");
	let i;
	try {
		i = JSON.parse(tx(r));
	} catch {
		throw NS("说明文件无法解析");
	}
	let a = i;
	if (a.format !== "trpg-pack" && a.format !== "trpg-save" && a.format !== "trpg-backup") throw new $("E_UNKNOWN_FORMAT", "无法识别：未知的文件类型");
	if (typeof a.formatVersion != "number" || a.formatVersion > 1) throw new $("E_NEWER_FORMAT", "这个文件由更新版本的扩展创建，请先更新扩展");
	return a.format === "trpg-pack" ? FS(n, i, e, t) : LS(n, i);
}
// src/core/packs/installer.ts
function zS(e, t) {
	return e.trim().toLowerCase() === t.trim().toLowerCase();
}
var BS = class {
	db;
	deps;
	constructor(e, t) {
		this.db = e, this.deps = t;
	}
	recognize(e) {
		return RS(e, {
			appVersion: this.deps.appVersion,
			hasRule: (e) => this.deps.rules.has(e)
		});
	}
	async list(e = {}) {
		return (await this.db.packs.toArray()).filter((t) => (!e.ruleId || t.ruleId === e.ruleId) && (!e.kind || t.kind === e.kind)).sort((e, t) => e.name.localeCompare(t.name, "zh"));
	}
	async plan(e) {
		let t = await this.db.packs.get(e.manifest.id);
		if (t) {
			let n = Nx(e.manifest.version, t.version), r = n > 0 ? "newer" : n === 0 ? "same" : "older", i = r === "older" && t.source === "builtin" ? "builtin-downgrade" : void 0;
			return {
				action: "overwrite",
				relation: r,
				installed: t,
				...i ? { blocked: i } : {}
			};
		}
		let n = (await this.db.packs.where("ruleId").equals(e.manifest.ruleId).toArray()).find((t) => t.kind === e.manifest.kind && zS(t.name, e.manifest.name));
		return n ? {
			action: "name-conflict",
			existing: n,
			canReplace: n.source !== "builtin"
		} : { action: "install" };
	}
	async install(e, t) {
		let n = await this.plan(e), r = e.manifest.name, i;
		if (n.action === "overwrite") {
			if (n.blocked) throw new $("E_BUILTIN_DOWNGRADE", "内置数据包不能降级");
			if ((t.resolution ?? (t.source === "download" ? "overwrite" : void 0)) !== "overwrite") throw new $("E_CONFLICT_UNRESOLVED", "已安装同一个内容包，需要先选择是否覆盖");
		} else if (n.action === "name-conflict") {
			if (t.resolution === "keep-both") r = await this.uniqueName(e.manifest.ruleId, e.manifest.kind, r);
			else if (t.resolution === "replace") {
				if (!n.canReplace) throw new $("E_BUILTIN_PROTECTED", "内置内容包不能被替换");
				i = n.existing.id;
			} else throw new $("E_CONFLICT_UNRESOLVED", "已有同名内容包，需要先选择处理方式");
		}
		let a = {
			...e.manifest,
			name: r,
			source: t.source,
			byteSize: e.byteSize,
			sha256: e.sha256,
			installedAt: this.deps.now(),
			schemaVersion: Jy.pack
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
				this.db.assets,
				this.db.searchIndex,
				this.db.workspaces
			], async () => {
				i && await this.removeRows(i), await this.removeRows(a.id), await this.db.packs.put(a), await this.db.entries.bulkPut(o), await this.db.assets.bulkPut([...e.assets].map(([e, t]) => ({
					packId: a.id,
					path: e,
					bytes: t
				}))), await this.db.workspaces.toCollection().modify((e) => {
					for (let t of e.enabledPacks) t.id === a.id && (t.version = a.version);
				});
			});
		} catch (e) {
			throw ux(e) ? new $("E_QUOTA", dx) : e;
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
		if (t.type !== "pack") throw new $("E_BAD_CONTENT", "文件内容损坏：内置文件不是内容包");
		let n = await this.db.packs.get(t.manifest.id);
		return n && Nx(t.manifest.version, n.version) <= 0 ? "skipped" : (await this.install(t, {
			source: "builtin",
			resolution: n ? "overwrite" : void 0
		}), n ? "upgraded" : "installed");
	}
	async uninstall(e) {
		let t = await this.db.packs.get(e);
		if (!t) throw new $("E_NOT_FOUND", "没有找到这个内容包");
		if (t.source === "builtin") throw new $("E_BUILTIN_PROTECTED", "内置内容包不能删除");
		await this.db.transaction("rw", [
			this.db.packs,
			this.db.entries,
			this.db.assets,
			this.db.searchIndex
		], () => this.removeRows(e)), this.deps.onChange?.({
			type: "uninstalled",
			packId: e
		});
	}
	async referencingSaves(e) {
		return (await this.db.saves.toArray()).filter((t) => t.deletedAt === void 0 && t.packs.some((t) => t.id === e));
	}
	async exportPack(e) {
		let t = await this.db.packs.get(e);
		if (!t) throw new $("E_NOT_FOUND", "没有找到这个内容包");
		let n = (await this.db.entries.where("packId").equals(e).toArray()).map(({ entryId: e, packId: t, ruleId: n, ...r }) => ({
			...r,
			id: e
		})), r = new Map((await this.db.assets.where("packId").equals(e).toArray()).map((e) => [e.path, e.bytes])), { source: i, byteSize: a, sha256: o, installedAt: s, schemaVersion: c, entryCount: l, typeCounts: u, ...d } = t;
		return hx({
			manifest: d,
			entries: n,
			assets: r
		});
	}
	async removeRows(e) {
		await this.db.entries.where("packId").equals(e).delete(), await this.db.assets.where("packId").equals(e).delete(), await this.db.searchIndex.delete(e), await this.db.packs.delete(e);
	}
	async uniqueName(e, t, n) {
		let r = await this.db.packs.where("ruleId").equals(e).toArray();
		for (let e = 2;; e++) {
			let i = `${n}（${e}）`;
			if (!r.some((e) => e.kind === t && zS(e.name, i))) return i;
		}
	}
};
// src/core/instances.ts
function VS(e, t, n, r, i) {
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
		...r > 1 ? { label: ud(a) } : {},
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
function HS(e, t, n) {
	return t.filter((t) => n.get(t.id)?.dependsOn.some((t) => t.id === e)).map((e) => e.id);
}
function US(e, t, n, r) {
	let i = [...e], a = [], o = (e, t) => {
		if (i.some((t) => t.id === e)) return;
		let s = n.get(e);
		if (!s) throw new $("E_DEP_MISSING", `需要先安装『${e}』`, { packId: e });
		if (s.ruleId !== r.id) throw new $("E_RULE_MISMATCH", `『${s.name}』属于其他规则，不能在当前存档中启用`);
		for (let e of s.dependsOn) o(e.id, !0);
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
function WS(e, t, n, r) {
	if (r.corePackIds.includes(t)) throw new $("E_CORE_LOCKED", "核心规则始终启用，不能停用");
	let i = HS(t, e, n);
	if (i.length) throw new $("E_REQUIRED_BY", `${i.map((e) => `『${n.get(e)?.name ?? e}』`).join("、")}依赖它，不能停用`, { dependents: i });
	return e.filter((e) => e.id !== t);
}
// src/core/saves/helpers.ts
function GS(e, t) {
	return fS({
		d: e,
		p: t.map((e) => e.id).sort()
	});
}
function KS(e) {
	return e.savedHash !== GS(e.data, e.enabledPacks);
}
function qS(e, t) {
	return t.reduce((t, n) => ({
		...t,
		...n(e)
	}), {
		partyNames: [],
		partyCount: 0
	});
}
function JS(e) {
	let t = e.trim();
	if (t.length < 1 || t.length > 40) throw new $("E_BAD_NAME", "存档名需要 1–40 个字");
	return t;
}
function YS(e, t, n = (e) => ` ${e}`) {
	if (!t.has(e)) return e;
	for (let r = 2;; r++) {
		let i = `${e}${n(r)}`;
		if (!t.has(i)) return i;
	}
}
function XS(e) {
	return hS("save", e);
}
function ZS(e) {
	return hS("workspace", e);
}
function QS(e, t) {
	return t.updatedAt - e.updatedAt || t.createdAt - e.createdAt || e.id.localeCompare(t.id);
}
// src/core/saves/campaign.ts
var $S = class {
	db;
	deps;
	uuid;
	constructor(e, t) {
		this.db = e, this.deps = t, this.uuid = t.uuid ?? ld;
	}
	async getWorkspace(e) {
		let t = await this.db.workspaces.get(e);
		if (!t) return null;
		let n = ZS(t);
		return n !== t && await this.db.workspaces.put(n), n;
	}
	isDirty(e) {
		return KS(e);
	}
	async getSave(e) {
		let t = await this.db.saves.get(e);
		return t ? XS(t) : null;
	}
	async listManual(e, t) {
		return (await this.db.saves.where("ruleId").equals(e.ruleId).toArray()).map(XS).filter((n) => n.kind === "manual" && n.deletedAt === void 0 && (t === "all" || n.ownerKey === e.ownerKey)).sort(QS);
	}
	async listAuto(e, t) {
		return (await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray()).map(XS).filter((e) => e.kind === "auto").sort(QS);
	}
	async listDeleted(e) {
		return (await this.db.saves.where("ruleId").equals(e).toArray()).map(XS).filter((e) => e.deletedAt !== void 0).sort((e, t) => (t.deletedAt ?? 0) - (e.deletedAt ?? 0));
	}
	async listOtherRules(e) {
		return (await this.db.saves.toArray()).map(XS).filter((t) => t.ruleId !== e && t.kind === "manual" && t.deletedAt === void 0).sort(QS);
	}
	async missingPacks(e) {
		let t = new Set((await this.db.packs.toArray()).map((e) => e.id));
		return e.enabledPacks.filter((e) => !t.has(e.id));
	}
	async startNewCampaign(e) {
		let t = this.requireRule(e.ruleId), n = JS(e.name), r = await this.installedMap(), i = [];
		for (let n of [...t.corePackIds, ...e.packIds]) i = US(i, n, r, t).enabledPacks;
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
				schemaVersion: Jy.workspace,
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
			if (!KS(t)) return {
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
			let n = await this.requireWorkspace(e), r = n.currentSaveId ? await this.getSave(n.currentSaveId) : null, i = await this.manualNames(n.ownerKey, n.ruleId), a = t === void 0 ? YS(`${r?.name ?? "存档"} 分支`, i) : JS(t), o = await this.buildSave(n, {
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
		return this.requireRule(r.ruleId), this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta,
			this.db.packs
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
					name: YS(`${r.name}（来自 ${r.ownerLabel}）`, t),
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
				schemaVersion: Jy.workspace,
				updatedAt: this.deps.now()
			};
			return await this.db.workspaces.put(s), s;
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
			name: YS(t.name, i, (e) => `（恢复 ${e}）`)
		};
		return await this.db.saves.put(a), a;
	}
	async purgeSaves(e) {
		let t = 0;
		for (let n of e) (await this.getSave(n))?.deletedAt !== void 0 && (await this.db.saves.delete(n), t++);
		return t;
	}
	async renameSave(e, t) {
		return this.patchManual(e, { name: JS(t) });
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
			name: YS(`自动存档 · ${a}`, n),
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
		n ? {enabledPacks: o, autoEnabled: s} = US(r.enabledPacks, t, a, i) : o = WS(r.enabledPacks, t, a, i);
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
		if (!r.enabledPacks.find((e) => e.id === t.packId)) throw new $("E_PACK_DISABLED", "该内容包已停用，不能再从它新建");
		let i = await this.db.packs.get(t.packId), a = await this.db.entries.get([t.packId, t.entryId]);
		if (!i || !a) throw new $("E_NOT_FOUND", "没有找到这个条目");
		let o = VS(r.data, a, i.version, n, this.uuid), s = {
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
			summary: qS(e.data, this.deps.summaryContributors ?? []),
			packs: e.enabledPacks.map((e) => ({
				id: e.id,
				version: e.version,
				name: n.get(e.id)?.name ?? e.id
			})),
			snapshot: structuredClone(e.data),
			hash: GS(e.data, e.enabledPacks),
			schemaVersion: Jy.save
		};
	}
	async manualNames(e, t) {
		let n = await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray();
		return new Set(n.filter((e) => e.kind === "manual" && e.deletedAt === void 0).map((e) => e.name));
	}
	async bumpSaves() {
		let e = jS.parse(await this.db.getMeta("backup") ?? {});
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
	async installedMap() {
		return new Map((await this.db.packs.toArray()).map((e) => [e.id, e]));
	}
}, eC = class {
	name;
	id;
	channel = null;
	listeners = /* @__PURE__ */ new Set();
	_readOnly = !1;
	startedAt;
	constructor(e = "tavern-trpg-assistant-lock", t = Date.now, n = ld()) {
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
}, tC = class {
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
}, nC = {
	id: "dnd5e2014",
	name: "D&D 5e（2014）",
	nameShort: "D&D 5e",
	description: "龙与地下城第五版（2014 规则），核心规则含玩家手册、地下城主指南与怪物图鉴",
	corePackIds: ["dnd5e2014-core"],
	defaultBanner: {
		wide: "https://a1.ax1x.com/2026/10/28/wwHs9.png",
		narrow: "https://a1.ax1x.com/2026/10/28/wwHs9.md.png",
		alt: "D&D 5e 默认战役横幅"
	}
};
// src/rules/index.ts
function rC() {
	let e = new tC();
	return e.register(nC), e;
}
function iC(e = {}) {
	let t = e.now ?? Date.now, n = e.rules ?? rC(), r = new jx(e.dbName ?? "tavern-trpg-assistant");
	return {
		db: r,
		rules: n,
		packs: new BS(r, {
			rules: n,
			now: t,
			appVersion: e.appVersion ?? "0.1.0"
		}),
		campaign: new $S(r, {
			rules: n,
			now: t,
			...e.campaign
		}),
		lock: new eC(),
		now: t
	};
}
// src/core/backup.ts
async function aC(e) {
	return AS.parse(await e.getMeta("settings") ?? {});
}
// src/core/transfer/exporter.ts
function oC(e) {
	let t = new Date(e);
	return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function sC(e) {
	return e.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "") || "存档";
}
async function cC(e, t) {
	if (t.type === "save") {
		let n = await e.saves.get(t.saveId);
		if (!n || n.deletedAt !== void 0) throw new $("E_NOT_FOUND", "没有找到这个存档");
		return [n];
	}
	return (await e.saves.toArray()).filter((e) => e.deletedAt === void 0);
}
async function lC(e, t) {
	let n = new Set(t.flatMap((e) => e.packs.map((e) => e.id)));
	return (await e.packs.list()).filter((e) => n.has(e.id) && e.source !== "builtin");
}
async function uC(e, t, n) {
	let r = await cC(e.db, t), i = {};
	for (let e of r) i[`saves/${e.id}.json`] = JSON.stringify(e);
	if (t.type === "backup") {
		for (let t of await e.db.workspaces.toArray()) i[`workspaces/${encodeURIComponent(t.ownerKey)}.json`] = JSON.stringify(t);
		i["settings.json"] = JSON.stringify(await aC(e.db));
	}
	let a = await e.packs.list();
	if (i["packs.json"] = JSON.stringify(a.map((e) => ({
		id: e.id,
		version: e.version,
		name: e.name
	}))), n.includePacks) for (let t of await lC(e, r)) i[`packs/${t.id}@${t.version}.trpgpack`] = await e.packs.exportPack(t.id);
	i["trpg-manifest.json"] = JSON.stringify({
		format: t.type === "backup" ? "trpg-backup" : "trpg-save",
		formatVersion: 1,
		appVersion: e.appVersion,
		exportedAt: new Date(e.now()).toISOString(),
		ruleIds: [...new Set(r.map((e) => e.ruleId))]
	});
	let o = oC(e.now()), s = t.type === "backup" ? `TRPG备份_${o}.trpgsave` : `${sC(r[0].name)}_${o}.trpgsave`;
	return {
		bytes: px(i),
		filename: s
	};
}
// src/core/transfer/importer.ts
function dC(e, t) {
	return e.saves.map((e) => t(e.ruleId) ? {
		save: e,
		selectable: !0
	} : {
		save: e,
		selectable: !1,
		reason: "规则未安装"
	});
}
function fC(e, t) {
	if (!t.has(e)) return e;
	let n = `${e}（导入）`;
	if (!t.has(n)) return n;
	for (let n = 2;; n++) {
		let r = `${e}（导入 ${n}）`;
		if (!t.has(r)) return r;
	}
}
async function pC(e, t, n) {
	let { db: r, campaign: i } = e, a = e.uuid ?? ld, o = t.saves.filter((t) => e.hasRule(t.ruleId)), s = new Set(n.selectedIds), c = 0;
	return r.transaction("rw", [
		r.saves,
		r.workspaces,
		r.meta,
		r.packs
	], async () => {
		if (t.type === "save") {
			for (let t of o.filter((e) => s.has(e.id))) {
				let o = await i.manualNames(n.owner.ownerKey, t.ruleId), s = e.now(), { deletedAt: l, autoReason: u, branchedFrom: d, ...f } = t;
				await r.saves.put({
					...f,
					id: a(),
					ownerKey: n.owner.ownerKey,
					ownerLabel: n.owner.ownerLabel,
					kind: "manual",
					name: fC(t.name, o),
					createdAt: s,
					updatedAt: s
				}), c++;
			}
			return {
				imported: c,
				skipped: t.saves.length - c
			};
		}
		let l = n.mode === "overwrite", u = t.workspaces.filter((t) => e.hasRule(t.ruleId)), d = l ? (await r.workspaces.toArray()).filter((t) => e.hasRule(t.ruleId)) : [];
		if (l) {
			for (let t of (await r.saves.toArray()).filter((t) => e.hasRule(t.ruleId))) await r.saves.delete(t.id);
			for (let e of d) await r.workspaces.delete(e.ownerKey);
			t.settings && await r.setMeta("settings", AS.parse(t.settings));
		}
		let f = l ? o : o.filter((e) => s.has(e.id));
		for (let e of f) (l || !await r.saves.get(e.id)) && (await r.saves.put(e), c++);
		for (let e of u) (l || !await r.workspaces.get(e.ownerKey)) && await r.workspaces.put(e);
		for (let e of d) await i.writeAutoSave(e, "恢复备份前");
		let p = new Set(f.filter((e) => e.kind === "auto").map((e) => `${e.ownerKey}\u0000${e.ruleId}`));
		for (let e of p) {
			let [t, n] = e.split("\0");
			await i.pruneAutoSaves(t, n);
		}
		return {
			imported: c,
			skipped: t.saves.length - c
		};
	});
}
// src/core/selftest.ts
function mC(e, t) {
	if (!e) throw Error(t);
}
function hC(e, t, n) {
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
async function gC(e) {
	let t = [], n = iC({
		dbName: `tavern-trpg-assistant-selftest-${ld()}`,
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
	}, l = (e, t, n = "1.0.0", r = []) => hx({
		manifest: {
			id: e,
			ruleId: "dnd5e2014",
			kind: t,
			name: `自检-${e}`,
			version: n,
			dependsOn: t === "module" ? [{ id: "dnd5e2014-core" }] : []
		},
		entries: [...hC(5, "spell", "sp"), ...r],
		assets: /* @__PURE__ */ new Map([["a.bin", /* @__PURE__ */ new Uint8Array(1024)]])
	});
	try {
		await s("运行环境", async () => (mC(typeof indexedDB < "u", "没有 IndexedDB"), mC(typeof structuredClone == "function", "没有 structuredClone"), mC(typeof crypto?.getRandomValues == "function", "没有 crypto.getRandomValues"), mC(typeof BroadcastChannel < "u", "没有 BroadcastChannel（多窗口只读不可用）"), `secureContext=${String(globalThis.isSecureContext)}`)), await s("生成并识别内容包（zip 压缩与解压）", async () => {
			let e = n.packs.recognize(l("selftest-core", "data"));
			return mC(e.type === "pack" && e.manifest.entryCount === 5, "识别结果不对"), `${e.type === "pack" ? e.byteSize : 0} 字节`;
		}), await s("安装内置包与模组（模组依赖核心包）", async () => {
			mC(await n.packs.installBuiltin(l("dnd5e2014-core", "data")) === "installed", "内置包未安装");
			let e = n.packs.recognize(l("selftest-module", "module", "1.0.0", [c]));
			mC(e.type === "pack", "不是内容包"), await n.packs.install(e, { source: "import" }), mC((await n.packs.list()).length === 2, "安装数量不对");
		}), await s("重复导入同一个包：要求先选择覆盖；选择后升级", async () => {
			let e = n.packs.recognize(l("selftest-module", "module", "1.1.0", [c]));
			mC(e.type === "pack", "不是内容包");
			let t = !1;
			try {
				await n.packs.install(e, { source: "import" });
			} catch {
				t = !0;
			}
			mC(t, "没有要求选择覆盖"), await n.packs.install(e, {
				source: "import",
				resolution: "overwrite"
			}), mC((await n.db.packs.get("selftest-module"))?.version === "1.1.0", "覆盖后版本不对");
		}), await s("新存档、修改、保存、分支", async () => {
			let e = await n.campaign.startNewCampaign({
				...r,
				ruleId: "dnd5e2014",
				packIds: ["selftest-module"],
				name: "自检存档"
			});
			mC(!n.campaign.isDirty(e.workspace), "新存档不应有未保存改动");
			let t = await n.campaign.updateData(r.ownerKey, (e) => ({
				...e,
				gold: 10
			}));
			mC(n.campaign.isDirty(t), "修改后应为未保存"), mC((await n.campaign.saveCurrent(r.ownerKey)).changed, "保存应写入"), mC((await n.campaign.branch(r.ownerKey)).save.branchedFrom === e.save.id, "分支来源不对");
		}), await s("读取存档（写自动存档）与模板副本", async () => {
			let e = (await n.campaign.listManual({
				ownerKey: r.ownerKey,
				ruleId: "dnd5e2014"
			}, "card")).find((e) => e.name === "自检存档");
			mC(e, "找不到第一个存档"), await n.campaign.loadSave(r, e.id), mC((await n.campaign.listAuto(r.ownerKey, "dnd5e2014")).length === 1, "没有写自动存档");
			let t = await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "tom"
			}), i = await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "tom"
			});
			mC(t.created && !i.created, "唯一条目应只有一份"), mC((await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "sp1"
			}, 3)).instances.map((e) => e.label).join("") === "ABC", "批量编号不对");
		}), await s("删除、最近删除、恢复、彻底删除", async () => {
			let [e] = (await n.campaign.listManual({
				ownerKey: r.ownerKey,
				ruleId: "dnd5e2014"
			}, "card")).filter((e) => e.name !== "自检存档");
			await n.campaign.deleteSave(e.id), mC((await n.campaign.listDeleted("dnd5e2014")).length === 1, "最近删除应有 1 个"), await n.campaign.restoreSave(e.id), await n.campaign.deleteSave(e.id), mC(await n.campaign.purgeSaves([e.id]) === 1, "彻底删除失败");
		}), await s("导出存档并导入到另一张卡", async () => {
			await n.campaign.saveCurrent(r.ownerKey);
			let e = (await n.campaign.getWorkspace(r.ownerKey)).currentSaveId, { bytes: t } = await uC({
				db: n.db,
				packs: n.packs,
				now: n.now,
				appVersion: "99.0.0"
			}, {
				type: "save",
				saveId: e
			}, { includePacks: !0 }), o = n.packs.recognize(t);
			mC(o.type === "save" && o.attachedPacks.size === 1, "导出文件内容不对");
			let s = dC(o, a);
			return mC((await pC({
				db: n.db,
				campaign: n.campaign,
				now: n.now,
				hasRule: a
			}, o, {
				owner: i,
				selectedIds: s.map((e) => e.save.id)
			})).imported === 1, "导入数量不对"), `${t.length} 字节`;
		}), await s("完整备份导出与覆盖恢复", async () => {
			let { bytes: e } = await uC({
				db: n.db,
				packs: n.packs,
				now: n.now,
				appVersion: "99.0.0"
			}, { type: "backup" }, { includePacks: !1 }), t = n.packs.recognize(e);
			mC(t.type === "backup" && t.workspaces.length === 1 && t.saves.length >= 3, "备份内容不对"), await n.campaign.updateData(r.ownerKey, (e) => ({
				...e,
				gold: 999
			})), await pC({
				db: n.db,
				campaign: n.campaign,
				now: n.now,
				hasRule: a
			}, t, {
				owner: r,
				selectedIds: [],
				mode: "overwrite"
			}), mC((await n.campaign.getWorkspace(r.ownerKey))?.data.gold === 10, "覆盖恢复后数据不对"), mC((await n.campaign.listAuto(r.ownerKey, "dnd5e2014")).some((e) => e.autoReason === "恢复备份前"), "没有\"恢复备份前\"自动存档");
		}), await s("删除内容包", async () => {
			await n.packs.uninstall("selftest-module"), mC(await n.db.entries.where("packId").equals("selftest-module").count() === 0, "条目未清除");
		});
	} finally {
		n.db.close(), await n.db.delete();
	}
	return t;
}
// src/probes/m1Probe.ts
var _C = "m1", vC = "M1 数据层自检";
function yC() {
	return {
		id: _C,
		title: vC,
		hint: "在独立的临时数据库里走完：安装内容包 → 新存档 → 保存 → 分支 → 读取 → 副本 → 删除与恢复 → 导出导入 → 备份恢复。只用合成数据，结束后自动删除，不影响你的真实数据。",
		actions: [{
			label: "运行 M1 数据层自检",
			run: () => Ju(_C, vC, async () => {
				qu(_C, vC, "waiting", "正在运行…");
				let e = await gC((e) => qu(_C, vC, "waiting", `已完成 ${e.name}`)), t = e.find((e) => !e.ok);
				qu(_C, vC, t ? "fail" : "pass", t ? `未通过：${t.name} — ${t.detail ?? ""}` : `全部通过（${e.length}/10 步）`, e.map((e) => `${e.ok ? "✓" : "✗"} ${e.name}${e.detail ? ` — ${e.detail}` : ""}`));
			})
		}]
	};
}
// src/probes/promptScan.ts
var bC = "TRPG-PROBE-COMMENT", xC = "TRPG-PROBE-INJECT";
function SC(e) {
	if (typeof e == "string") return e;
	try {
		return JSON.stringify(e) ?? "";
	} catch (e) {
		return console.error("[trpg-assistant] 请求内容无法序列化", e), "";
	}
}
function CC(e, t) {
	let n = e.indexOf(t);
	if (!(n < 0)) return e.slice(Math.max(0, n - 6), n + t.length + 12);
}
function wC(e, t) {
	let n = e?.chat;
	if (Array.isArray(n)) for (let e = 0; e < n.length; e++) {
		let r = n[e];
		if ((typeof r?.content == "string" ? r.content : SC(r?.content)).includes(t)) return {
			role: String(r.role ?? "?"),
			indexFromEnd: n.length - 1 - e
		};
	}
}
function TC(e) {
	let t = SC(e);
	return {
		length: t.length,
		comment: t.includes(bC),
		commentIntact: t.includes("<!--TRPG-PROBE-COMMENT") && t.includes("-->"),
		inject: t.includes(xC),
		commentSnippet: CC(t, bC),
		injectSnippet: CC(t, xC),
		injectAt: wC(e, xC)
	};
}
// src/probes/llmLogAudit.ts
function EC(e) {
	if (e && typeof e == "object") {
		let t = e;
		return t.id ?? t.key ?? t.logId ?? t.name;
	}
	return e;
}
async function DC() {
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
	let o = TC(await e.getRaw(EC(r)));
	return a.scan = o, a.markers = [bC, xC], {
		status: "info",
		summary: `最近一次请求原文：${o.comment ? `含注释标记${o.commentIntact ? "（符号完整）" : "（符号被改）"}` : "无注释标记"}；${o.inject ? "含注入标记" : "无注入标记"}`,
		detail: a
	};
}
// src/probes/promptProbes.ts
var OC = "comment", kC = "注释是否进入发给 AI 的请求", AC = "inject", jC = "提示词注入是否生效", MC = "input", NC = "写入与读取输入框", PC = "tavern-trpg-assistant_probe", FC = 1, IC = 0;
function LC(e) {
	return e?.dryRun === !0;
}
function RC(e) {
	let t = !1, n = !1, r = "", i = [], a = {}, o = (e) => (t) => {
		i.push({
			event: e,
			dryRun: LC(t),
			...TC(t)
		});
	}, s = () => {
		let e = i.filter((e) => !e.dryRun);
		if (r !== "quiet") {
			if (!e.length) t && qu(OC, kC, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）"), n && qu(AC, jC, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）");
			else {
				if (t) {
					let n = e.find((e) => e.comment), i = e.some((e) => e.commentIntact);
					qu(OC, kC, n && i ? "pass" : "fail", n ? i ? "注释原样进入了请求（<!-- --> 完整保留）" : "标记文字进入了请求，但 <!-- --> 符号被改动或删除" : "请求中没有找到注释内容（注释被删除）", {
						runType: r,
						captures: e,
						message: a
					}), t = !1;
				}
				if (n) {
					let t = e.find((e) => e.inject);
					qu(AC, jC, t ? "pass" : "fail", t ? `注入文本进入了请求${t.injectAt ? `（${t.injectAt.role} 消息，距末尾 ${t.injectAt.indexFromEnd} 条）` : ""}` : "请求中没有找到注入文本", {
						runType: r,
						captures: e
					}), n = !1, c();
				}
			}
		}
	}, c = () => {
		let t = e.extension_prompt_types?.IN_CHAT ?? FC, n = e.extension_prompt_roles?.SYSTEM ?? IC;
		e.setExtensionPrompt?.(PC, "", t, 0, !1, n);
	}, l = () => {
		let t = h(e, "CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready"), n = h(e, "GENERATE_AFTER_COMBINE_PROMPTS", "generate_after_combine_prompts"), c = h(e, "GENERATE_AFTER_DATA", "generate_after_data");
		g(e, t, o(t)), g(e, n, o(n)), g(e, c, o(c)), g(e, h(e, "GENERATION_STARTED", "generation_started"), (e, t, n) => {
			n !== !0 && (r = String(e ?? ""), i = []);
		});
		let l = () => s();
		g(e, h(e, "GENERATION_ENDED", "generation_ended"), l), g(e, h(e, "GENERATION_STOPPED", "generation_stopped"), l), g(e, h(e, "MESSAGE_SENT", "message_sent"), (t) => {
			let n = e.chat[Number(t)];
			a.storedInChat = !!n?.mes?.includes(bC);
		}), g(e, h(e, "USER_MESSAGE_RENDERED", "user_message_rendered"), (e) => {
			let t = document.querySelector(`.mes[mesid="${Number(e)}"] .mes_text`);
			t && (a.visibleTextHasMarker = !!t.textContent?.includes(bC), a.htmlHasComment = t.innerHTML.includes(`<!--${bC}`));
		});
	}, u = {
		id: OC,
		title: kC,
		hint: "点「写入测试注释」后，自己发送这条消息（需要已连接模型）。发送完成后自动判定；楼层里应看不到注释文字。",
		actions: [{
			label: "写入测试注释到输入框",
			run: () => Ju(OC, kC, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let n = `<!--${bC} 探针-->`;
				_(e, e.value ? `${e.value}\n${n}` : `测试 ${n}`), t = !0, qu(OC, kC, "waiting", "已写入。请发送这条消息，等 AI 回复结束后自动判定");
			})
		}]
	};
	u.actions.push({
		label: "从 TauriTavern 请求日志核对",
		run: () => Ju(OC, kC, async () => {
			let e = await DC();
			qu(OC, kC, e.status, e.summary, {
				runType: r,
				audit: e.detail,
				message: a
			});
		})
	});
	let d = {
		id: AC,
		title: jC,
		hint: "点「注入探针」后发送任意消息。可以和上一项同一次发送完成判定。测完请点「清除注入」。",
		actions: [{
			label: "注入探针",
			run: () => Ju(AC, jC, () => {
				if (!e.setExtensionPrompt) throw Error("宿主没有 setExtensionPrompt");
				let t = e.extension_prompt_types?.IN_CHAT ?? FC, r = e.extension_prompt_roles?.SYSTEM ?? IC;
				e.setExtensionPrompt(PC, `[${xC}] 这是探针注入文本`, t, 0, !1, r), n = !0, qu(AC, jC, "waiting", "已注入（IN_CHAT，深度 0）。请发送一条消息，判定后会自动清除", { enumsFromContext: !!e.extension_prompt_types });
			})
		}, {
			label: "清除注入",
			run: () => Ju(AC, jC, () => {
				c(), n = !1, qu(AC, jC, "idle", "已清除注入");
			})
		}]
	}, p = {
		id: MC,
		title: NC,
		hint: "自动写入一段文字、读回校验，然后恢复原内容（不会发送）。",
		actions: [{
			label: "运行输入框测试",
			run: () => Ju(MC, NC, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let t = e.value, n = `${t}[TRPG-PROBE-INPUT]`;
				_(e, n);
				let r = e.value;
				_(e, t);
				let i = e.value === t;
				qu(MC, NC, r === n && i ? "pass" : "fail", r === n ? i ? "写入、读回、恢复都正常" : "写入正常，但恢复失败" : "写入后读回的内容不一致", {
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
var zC = "storage", BC = "本地存储与持久性", VC = `${u}-m0`, HC = 4194304;
function UC() {
	return new Promise((e, t) => {
		let n = indexedDB.open(VC, 1);
		n.onupgradeneeded = () => n.result.createObjectStore("kv"), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
	});
}
function WC(e, t, n) {
	return new Promise((r, i) => {
		let a = n(e.transaction("kv", t).objectStore("kv"));
		a.onsuccess = () => r(a.result), a.onerror = () => i(a.error);
	});
}
function GC(e) {
	let t = () => Ju(zC, BC, async () => {
		let t = await UC(), n = await WC(t, "readonly", (e) => e.get("boot")), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			count: (n?.count ?? 0) + 1,
			firstAt: n?.firstAt ?? r,
			lastAt: r
		};
		await WC(t, "readwrite", (e) => e.put(i, "boot"));
		let a = !!await WC(t, "readonly", (e) => e.get("blob"));
		a || await WC(t, "readwrite", (e) => e.put(new Uint8Array(HC), "blob"));
		let o = await WC(t, "readonly", (e) => e.get("blob"));
		t.close();
		let s = await navigator.storage?.persisted?.() ?? null, c = await navigator.storage?.estimate?.() ?? null, l = e.extensionSettings[u] ??= {}, d = Number(l.probeBootCount ?? 0);
		l.probeBootCount = d + 1, e.saveSettingsDebounced(), qu(zC, BC, "info", `IndexedDB 第 ${i.count} 次启动读写正常；刷新页面后次数应增加`, {
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
		id: zC,
		title: BC,
		hint: "每次启动自动读写 IndexedDB（含 4MB 数据）与扩展设置。完全退出再打开应用后，启动次数应继续累加，4MB 数据应已存在。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/tauriProbe.ts
var KC = "tauri", qC = "TauriTavern 扩展接口", JC = `${u}-m0`, YC = "/scripts/tauritavern/layout-kit.js", XC = [
	"current",
	"getCurrent",
	"active",
	"handle",
	"currentChat"
];
function ZC(e, t) {
	if (typeof e == "function") return "function";
	if (typeof e != "object" || !e) return typeof e;
	if (t <= 0) return "object";
	let n = {};
	for (let r of Object.keys(e)) n[r] = ZC(e[r], t - 1);
	return n;
}
async function QC(e, t) {
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
function $C(e) {
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
function ew(e) {
	let t = e;
	return t.ok ? {
		ok: !0,
		shape: $C(t.value)
	} : t;
}
async function tw(e) {
	if (typeof e.searchMessages == "function" || e.store) return {
		handle: e,
		via: "api.chat 本身"
	};
	let t = e.current;
	if (t && typeof t.handle == "function") {
		let e = await QC("api.chat.current.handle()", () => t.handle.call(t));
		if (e.ok && e.value && typeof e.value == "object") return {
			handle: e.value,
			via: "api.chat.current.handle()"
		};
	}
	for (let t of XC) {
		let n = e[t];
		if (typeof n == "function") {
			let r = await QC(`api.chat.${t}()`, () => n.call(e)), i = r.value;
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
function nw() {
	let e = () => Ju(KC, qC, async () => {
		if (!window.__TAURITAVERN__) {
			qu(KC, qC, "info", "不是 TauriTavern，跳过（扩展将使用酒馆通用能力）");
			return;
		}
		let e = (await m())?.api ?? {}, t = e.chat ?? {}, n = { apiShape: ZC(e, 3) };
		n.layoutKitExports = await QC("layout-kit 导入", () => import(
			/* @vite-ignore */
			YC
).then((e) => Object.keys(e)));
		let { handle: r, via: i } = await tw(t);
		if (n.handleVia = i, r) {
			let e = r;
			n.handleShape = ZC(r, 2), e.searchMessages && (n.searchMessages = ew(await QC("searchMessages", () => e.searchMessages({
				query: "你",
				limit: 3
			}))));
			let t = e.locate?.findLastMessage;
			if (t && (n.findLastMessage = ew(await QC("findLastMessage", () => t.call(e.locate, {
				role: "user",
				scanLimit: 50
			})))), e.store?.setJson && e.store.getJson) {
				let t = { at: (/* @__PURE__ */ new Date()).toISOString() };
				n.storeSet = await QC("store.setJson", () => e.store.setJson({
					namespace: JC,
					key: "probe",
					value: t
				})), n.storeGet = await QC("store.getJson", () => e.store.getJson({
					namespace: JC,
					key: "probe"
				})), e.store.listKeys && (n.storeKeys = await QC("store.listKeys", () => e.store.listKeys({ namespace: JC }))), e.store.deleteJson && (n.storeDelete = await QC("store.deleteJson", () => e.store.deleteJson({
					namespace: JC,
					key: "probe"
				})));
			}
			e.metadata?.get && (n.metadata = ew(await QC("metadata.get", () => e.metadata.get()))), typeof e.stableId == "function" && (n.stableId = ew(await QC("stableId", () => e.stableId.call(e)))), typeof e.summary == "function" && (n.summary = ew(await QC("summary", () => e.summary.call(e))));
		}
		let a = e.extension?.store;
		if (a?.setJson && a.getJson) {
			let e = { at: (/* @__PURE__ */ new Date()).toISOString() }, t = {
				namespace: JC,
				key: "probe"
			};
			n.extStoreSet = await QC("extension.store.setJson", () => a.setJson({
				...t,
				value: e
			})), n.extStoreGet = await QC("extension.store.getJson", () => a.getJson(t)), a.listKeys && (n.extStoreKeys = await QC("extension.store.listKeys", () => a.listKeys({ namespace: JC }))), a.deleteJson && (n.extStoreDelete = await QC("extension.store.deleteJson", () => a.deleteJson(t)));
		}
		qu(KC, qC, "info", r ? `找到 handle（${i}）；各接口调用结果见详情` : "没有找到获取 handle 的方式；接口结构见详情", n);
	});
	return {
		id: KC,
		title: qC,
		hint: "仅 TauriTavern 有效。请分别在「已打开聊天」和「未打开聊天」两种状态下点「重新检测」各测一次。",
		actions: [{
			label: "重新检测",
			run: e
		}],
		start: e
	};
}
// src/probes/index.ts
function rw(e) {
	return [
		yC(),
		ed(e),
		...RC(e),
		GC(e),
		cd(e),
		id(e),
		nw()
	];
}
// node_modules/ohash/dist/_chunks/is-equal.mjs
function iw(e) {
	return typeof e == "string" ? `'${e}'` : new cw().serialize(e);
}
var aw = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz", ow = /*@__PURE__*/ (function() {
	let e = /* @__PURE__ */ new Uint8Array(128);
	for (let t = 0; t < 69; t++) e[aw.charCodeAt(t)] = t + 1;
	for (let t = 65; t <= 90; t++) e[t] = e[t + 32];
	return e;
})();
function sw(e, t) {
	if (e === t) return 0;
	let n = Math.min(e.length, t.length), r = 0;
	for (let i = 0; i < n; i++) {
		let n = e.charCodeAt(i), a = t.charCodeAt(i);
		if (n === a) continue;
		let o = n < 128 && ow[n] ? ow[n] : n + 128, s = a < 128 && ow[a] ? ow[a] : a + 128;
		if (o !== s) return o < s ? -1 : 1;
		r === 0 && (r = n > a ? -1 : 1);
	}
	return e.length === t.length ? r : e.length < t.length ? -1 : 1;
}
var cw = /*@__PURE__*/ (function() {
	class e {
		#e = /* @__PURE__ */ new Map();
		compare(e, t) {
			let n = typeof e, r = typeof t;
			return n === "string" && r === "string" ? sw(e, t) : n === "number" && r === "number" ? e - t : sw(this.serialize(e, !0), this.serialize(t, !0));
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
			let i = Object.keys(e).sort(sw), a = `${r}{`;
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
function lw(e, t) {
	return e === t || iw(e) === iw(t);
}
// node_modules/reka-ui/dist/shared/clamp.js
function uw(e, t = -Infinity, n = Infinity) {
	return Math.min(n, Math.max(t, e));
}
// node_modules/reka-ui/dist/shared/createContext.js
function dw(e, t) {
	let n = typeof e == "string" && !t ? `${e}Context` : t, r = Symbol(n);
	return [(t) => {
		let n = Ar(r, t);
		if (n || n === null) return n;
		throw Error(`Injection \`${r.toString()}\` not found. Component must be used within ${Array.isArray(e) ? `one of the following components: ${e.join(", ")}` : `\`${e}\``}`);
	}, (e) => (kr(r, e), e)];
}
// node_modules/reka-ui/dist/shared/getActiveElement.js
function fw() {
	let e = document.activeElement;
	if (e == null) return null;
	for (; e != null && e.shadowRoot != null && e.shadowRoot.activeElement != null;) e = e.shadowRoot.activeElement;
	return e;
}
// node_modules/reka-ui/dist/shared/handleAndDispatchCustomEvent.js
function pw(e, t, n) {
	let r = n.originalEvent.target, i = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && r.addEventListener(e, t, { once: !0 }), r.dispatchEvent(i);
}
// node_modules/reka-ui/dist/shared/nullish.js
function mw(e) {
	return e == null;
}
// node_modules/@vueuse/shared/dist/index.js
function hw(e, t) {
	return Ke() ? (qe(e, t), !0) : !1;
}
function gw(e) {
	let t = !1, n, r = Ge(!0);
	return ((...i) => (t ||= (n = r.run(() => e(...i)), !0), n));
}
var _w = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
var vw = (e) => e !== void 0, yw = Object.prototype.toString, bw = (e) => yw.call(e) === "[object Object]", xw = /* #__PURE__ */ Sw();
function Sw() {
	var e, t;
	return _w && !!((e = window) != null && (e = e.navigator) != null && e.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((t = window) == null || (t = t.navigator) == null ? void 0 : t.maxTouchPoints) > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function Cw(e) {
	return Array.isArray(e) ? e : [e];
}
function ww(e) {
	return e || Qs();
}
function Tw(e) {
	if (!_w) return e;
	let t = 0, n, r, i = () => {
		--t, r && t <= 0 && (r.stop(), n = void 0, r = void 0);
	};
	return ((...a) => (t += 1, r || (r = Ge(!0), n = r.run(() => e(...a))), hw(i), n));
}
function Ew(e) {
	return /* @__PURE__ */ on(/* @__PURE__ */ vn(e) ? new Proxy({}, {
		get(t, n, r) {
			return U(Reflect.get(e.value, n, r));
		},
		set(t, n, r) {
			return /* @__PURE__ */ vn(e.value[n]) && !/* @__PURE__ */ vn(r) ? e.value[n].value = r : e.value[n] = r, !0;
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
function Dw(e) {
	return Ew(Y(e));
}
function Ow(e, ...t) {
	let n = t.flat(), r = n[0];
	return Dw(() => Object.fromEntries(typeof r == "function" ? Object.entries(/* @__PURE__ */ On(e)).filter(([e, t]) => !r(Cn(t), e)) : Object.entries(/* @__PURE__ */ On(e)).filter((e) => !n.includes(e[0]))));
}
function kw(e, t = 1e4) {
	return Dn((n, r) => {
		let i = Cn(e), a, o = () => setTimeout(() => {
			i = Cn(e), r();
		}, Cn(t));
		return hw(() => {
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
function Aw(e, t) {
	ww(t) && da(e, t);
}
function jw(e, t, n) {
	return Lr(e, t, {
		...n,
		immediate: !0
	});
}
// node_modules/@vueuse/core/dist/index.js
var Mw = _w ? window : void 0;
_w && window.document, _w && window.navigator, _w && window.location;
function Nw(e) {
	let t = Cn(e);
	return t?.$el ?? t;
}
function Pw(...e) {
	let t = (e, t, n, r) => (e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r)), n = Y(() => {
		let t = Cw(Cn(e[0])).filter((e) => e != null);
		return t.every((e) => typeof e != "string") ? t : void 0;
	});
	return jw(() => [
		n.value?.map((e) => Nw(e)) ?? [Mw].filter((e) => e != null),
		Cw(Cn(n.value ? e[1] : e[0])),
		Cw(U(n.value ? e[2] : e[1])),
		Cn(n.value ? e[3] : e[2])
	], ([e, n, r, i], a, o) => {
		if (!e?.length || !n?.length || !r?.length) return;
		let s = bw(i) ? { ...i } : i, c = e.flatMap((e) => n.flatMap((n) => r.map((r) => t(e, n, r, s))));
		o(() => {
			c.forEach((e) => e());
		});
	}, { flush: "post" });
}
function Fw() {
	let e = /* @__PURE__ */ yn(!1), t = Qs();
	return t && ca(() => {
		e.value = !0;
	}, t), e;
}
/* @__NO_SIDE_EFFECTS__ */
function Iw(e) {
	let t = Fw();
	return Y(() => (t.value, !!e()));
}
function Lw(e) {
	return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function Rw(...e) {
	let t, n, r = {};
	e.length === 3 ? (t = e[0], n = e[1], r = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], r = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
	let { target: i = Mw, eventName: a = "keydown", passive: o = !1, dedupe: s = !1 } = r, c = Lw(t);
	return Pw(i, a, (e) => {
		e.repeat && Cn(s) || c(e) && n(e);
	}, o);
}
function zw(e) {
	return JSON.parse(JSON.stringify(e));
}
function Bw(e, t, n = {}) {
	let { window: r = Mw, ...i } = n, a, o = /* @__PURE__ */ Iw(() => r && "ResizeObserver" in r), s = () => {
		a &&= (a.disconnect(), void 0);
	}, c = Lr(Y(() => {
		let t = Cn(e);
		return Array.isArray(t) ? t.map((e) => Nw(e)) : [Nw(t)];
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
	return hw(l), {
		isSupported: o,
		stop: l
	};
}
function Vw(e, t, n, r = {}) {
	var i, a;
	let { clone: o = !1, passive: s = !1, eventName: c, deep: l = !1, defaultValue: u, shouldEmit: d } = r, f = Qs(), p = n || f?.emit || (f == null || (i = f.$emit) == null ? void 0 : i.bind(f)) || (f == null || (a = f.proxy) == null || (a = a.$emit) == null ? void 0 : a.bind(f?.proxy)), m = c;
	t ||= "modelValue", m ||= `update:${t.toString()}`;
	let h = (e) => o ? typeof o == "function" ? o(e) : zw(e) : e, g = () => vw(e[t]) ? h(e[t]) : u, _ = (e) => {
		d ? d(e) && p(m, e) : p(m, e);
	};
	if (s) {
		let n = /* @__PURE__ */ H(g()), r = !1;
		return Lr(() => e[t], (e) => {
			r || (r = !0, n.value = h(e), sr(() => r = !1));
		}), Lr(n, (n) => {
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
function Hw(e) {
	return e ? e.flatMap((e) => e.type === ys ? Hw(e.children) : [e]) : [];
}
// node_modules/reka-ui/dist/ConfigProvider/ConfigProvider.js
var [Uw, Ww] = /*#__PURE__*/ dw("ConfigProvider"), Gw = /* @__PURE__ */ new WeakMap();
function Kw(e, t) {
	let n = Gw.get(e);
	n || (n = {
		owners: /* @__PURE__ */ new Set(),
		original: e.body.style.pointerEvents
	}, Gw.set(e, n)), n.owners.add(t), e.body.style.pointerEvents = "none";
}
function qw(e, t) {
	let n = Gw.get(e);
	n?.owners.delete(t) && n.owners.size === 0 && (Gw.delete(e), e.body.style.pointerEvents = n.original);
}
// node_modules/defu/dist/defu.mjs
function Jw(e) {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null || Symbol.iterator in e ? !1 : Symbol.toStringTag in e ? Object.prototype.toString.call(e) === "[object Module]" : !0;
}
function Yw(e, t, n = ".", r) {
	if (!Jw(t)) return Yw(e, {}, n, r);
	let i = { ...t };
	for (let t of Object.keys(e)) {
		if (t === "__proto__" || t === "constructor") continue;
		let a = e[t];
		a != null && (r && r(i, t, a, n) || (i[t] = Array.isArray(a) && Array.isArray(i[t]) ? [...a, ...i[t]] : Jw(a) && Jw(i[t]) ? Yw(a, i[t], (n ? `${n}.` : "") + t.toString(), r) : a));
	}
	return i;
}
function Xw(e) {
	return (...t) => t.reduce((t, n) => Yw(t, n, "", e), {});
}
var Zw = Xw(), Qw = Symbol("useBodyScrollLock"), $w = Tw(() => {
	let e = /* @__PURE__ */ H(/* @__PURE__ */ new Map()), t = /* @__PURE__ */ H(), n = Y(() => {
		for (let t of e.value.values()) if (t) return !0;
		return !1;
	}), r = Uw({ scrollBody: /* @__PURE__ */ H(!0) }), i = null, a = () => {
		document.body.style.paddingRight = "", document.body.style.marginRight = "", qw(document, Qw), document.documentElement.style.removeProperty("--scrollbar-width"), document.body.style.overflow = t.value ?? "", xw && i?.(), t.value = void 0;
	};
	return Lr(n, (e, o) => {
		if (!_w) return;
		if (!e) {
			o && a();
			return;
		}
		t.value === void 0 && (t.value = document.body.style.overflow);
		let s = window.innerWidth - document.documentElement.clientWidth, c = {
			padding: s,
			margin: 0
		}, l = r.scrollBody?.value ? typeof r.scrollBody.value == "object" ? Zw({
			padding: r.scrollBody.value.padding === !0 ? s : r.scrollBody.value.padding,
			margin: r.scrollBody.value.margin === !0 ? s : r.scrollBody.value.margin
		}, c) : c : {
			padding: 0,
			margin: 0
		};
		s > 0 && (document.body.style.paddingRight = typeof l.padding == "number" ? `${l.padding}px` : String(l.padding), document.body.style.marginRight = typeof l.margin == "number" ? `${l.margin}px` : String(l.margin), document.documentElement.style.setProperty("--scrollbar-width", `${s}px`), document.body.style.overflow = "hidden"), xw && (i = Pw(document, "touchmove", (e) => nT(e), { passive: !1 })), sr(() => {
			n.value && (Kw(document, Qw), document.body.style.overflow = "hidden");
		});
	}, {
		immediate: !0,
		flush: "sync"
	}), e;
});
function eT(e) {
	let t = Math.random().toString(36).substring(2, 7), n = $w();
	n.value.set(t, e ?? !1);
	let r = Y({
		get: () => n.value.get(t) ?? !1,
		set: (e) => n.value.set(t, e)
	});
	return Aw(() => {
		n.value.delete(t);
	}), r;
}
function tT(e) {
	let t = window.getComputedStyle(e);
	if (t.overflowX === "scroll" || t.overflowY === "scroll" || t.overflowX === "auto" && e.clientWidth < e.scrollWidth || t.overflowY === "auto" && e.clientHeight < e.scrollHeight) return !0;
	{
		let t = e.parentNode;
		return !(t instanceof Element) || t.tagName === "BODY" ? !1 : tT(t);
	}
}
function nT(e) {
	let t = e || window.event, n = t.target;
	return n instanceof Element && tT(n) ? !1 : t.touches.length > 1 || (t.preventDefault && t.cancelable && t.preventDefault(), !1);
}
// node_modules/reka-ui/dist/shared/useDirection.js
function rT(e) {
	let t = Uw({ dir: /* @__PURE__ */ H("ltr") });
	return Y(() => e?.value || t.dir?.value || "ltr");
}
// node_modules/reka-ui/dist/shared/useEmitAsProps.js
function iT(e) {
	let t = Qs(), n = t?.type.emits, r = {};
	return n?.length || console.warn(`No emitted event found. Please check component: ${t?.type.__name}`), n?.forEach((t) => {
		r[he(F(t))] = (...n) => e(t, ...n);
	}), r;
}
// node_modules/reka-ui/dist/shared/useFocusGuards.js
var aT = 0;
function oT() {
	Pr((e) => {
		if (!_w) return;
		let t = document.querySelectorAll("[data-reka-focus-guard]");
		document.body.insertAdjacentElement("afterbegin", t[0] ?? sT()), document.body.insertAdjacentElement("beforeend", t[1] ?? sT()), aT++, e(() => {
			aT === 1 && document.querySelectorAll("[data-reka-focus-guard]").forEach((e) => e.remove()), aT--;
		});
	});
}
function sT() {
	let e = document.createElement("span");
	return e.setAttribute("data-reka-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
// node_modules/reka-ui/dist/shared/useFormControl.js
function cT(e) {
	return Y(() => !Cn(e) || !!Nw(e)?.closest("form"));
}
// node_modules/reka-ui/dist/shared/useForwardExpose.js
function lT() {
	let e = Qs(), t = /* @__PURE__ */ H(), n = Y(() => r());
	ua(() => {
		n.value !== r() && Sn(t);
	});
	function r() {
		return t.value && "$el" in t.value && ["#text", "#comment"].includes(t.value.$el.nodeName) ? t.value.$el.nextElementSibling : Nw(t);
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
function uT(e) {
	let t = Qs(), n = Object.keys(t?.type.props ?? {}).reduce((e, n) => {
		let r = (t?.type.props[n]).default;
		return r !== void 0 && (e[n] = r), e;
	}, {}), r = /* @__PURE__ */ jn(e);
	return Y(() => {
		let e = {}, i = t?.vnode.props ?? {};
		return Object.keys(i).forEach((t) => {
			e[F(t)] = i[t];
		}), Object.keys({
			...n,
			...e
		}).reduce((e, t) => (r.value[t] !== void 0 && (e[t] = r.value[t]), e), {});
	});
}
// node_modules/reka-ui/dist/shared/useForwardPropsEmits.js
function dT(e, t) {
	let n = uT(e), r = t ? iT(t) : {};
	return Y(() => ({
		...n.value,
		...r
	}));
}
// node_modules/aria-hidden/dist/es2015/index.js
var fT = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, pT = /* @__PURE__ */ new WeakMap(), mT = /* @__PURE__ */ new WeakMap(), hT = {}, gT = 0, _T = function(e) {
	return e && (e.host || _T(e.parentNode));
}, vT = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = _T(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, yT = function(e, t, n, r) {
	var i = vT(t, Array.isArray(e) ? e : [e]);
	hT[n] || (hT[n] = /* @__PURE__ */ new WeakMap());
	var a = hT[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		e && !s.has(e) && (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		e && !c.has(e) && Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (pT.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				pT.set(e, c), a.set(e, l), o.push(e), c === 1 && i && mT.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), gT++, function() {
		o.forEach(function(e) {
			var t = pT.get(e) - 1, i = a.get(e) - 1;
			pT.set(e, t), a.set(e, i), t || (mT.has(e) || e.removeAttribute(r), mT.delete(e)), i || e.removeAttribute(n);
		}), gT--, gT || (pT = /* @__PURE__ */ new WeakMap(), pT = /* @__PURE__ */ new WeakMap(), mT = /* @__PURE__ */ new WeakMap(), hT = {});
	};
}, bT = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || fT(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), yT(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
// node_modules/reka-ui/dist/shared/useHideOthers.js
function xT(e) {
	let t;
	Lr(() => Nw(e), (e) => {
		let n = !1;
		try {
			n = !!e?.closest("[popover]:not(:popover-open)");
		} catch {}
		e && !n ? t = bT(e) : t && t();
	}), fa(() => {
		t && t();
	});
}
// node_modules/reka-ui/dist/shared/useId.js
var ST = 0;
function CT(e, t = "reka") {
	if (e) return e;
	let n, r = Uw({ useId: void 0 });
	return n = r.useId ? r.useId() : "useId" in Wu ? gi?.() : `${++ST}`, t ? `${t}-${n}` : n;
}
// node_modules/reka-ui/dist/shared/useSize.js
function wT(e) {
	let t = /* @__PURE__ */ H(), n = Y(() => t.value?.width ?? 0), r = Y(() => t.value?.height ?? 0), i;
	return ca(() => {
		let n = Nw(e);
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
	}), fa(() => {
		i?.disconnect(), i = void 0;
	}), {
		width: n,
		height: r
	};
}
// node_modules/reka-ui/dist/shared/useStateMachine.js
function TT(e, t) {
	let n = /* @__PURE__ */ H(e);
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
function ET(e) {
	let t = kw("", 1e3);
	return {
		search: t,
		handleTypeaheadSearch: (n, r) => {
			if (t.value += n, e) e(n);
			else {
				let e = fw(), n = r.map((e) => ({
					...e,
					textValue: e.value?.textValue ?? e.ref.textContent?.trim() ?? ""
				})), i = n.find((t) => t.ref === e), a = OT(n.map((e) => e.textValue), t.value, i?.textValue), o = n.find((e) => e.textValue === a);
				return o && o.ref.focus(), o?.ref;
			}
		},
		resetTypeahead: () => {
			t.value = "";
		}
	};
}
function DT(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
function OT(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = DT(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
// node_modules/reka-ui/dist/Presence/usePresence.js
function kT(e, t) {
	let n = /* @__PURE__ */ H({}), r = /* @__PURE__ */ H("none"), i = /* @__PURE__ */ H(e), a = e.value ? "mounted" : "unmounted", o, s = t.value?.ownerDocument.defaultView ?? Mw, { state: c, dispatch: l } = TT(a, {
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
		if (_w) {
			let n = new CustomEvent(e, {
				bubbles: !1,
				cancelable: !1
			});
			t.value?.dispatchEvent(n);
		}
	};
	Lr(e, async (e, i) => {
		let a = i !== e;
		if (await sr(), a) {
			let a = r.value, o = AT(t.value);
			e ? (l("MOUNT"), u("enter"), o === "none" && u("after-enter")) : o === "none" || o === "undefined" || n.value?.display === "none" ? (l("UNMOUNT"), u("leave"), u("after-leave")) : i && a !== o ? (l("ANIMATION_OUT"), u("leave")) : (l("UNMOUNT"), u("after-leave"));
		}
	}, { immediate: !0 });
	let d = (e) => {
		if (e.target !== t.value) return;
		let n = AT(t.value), r = n.includes(CSS.escape(e.animationName)), a = c.value === "mounted" ? "enter" : "leave";
		if (r && (u(`after-${a}`), l("ANIMATION_END"), !i.value)) {
			let e = t.value.style.animationFillMode;
			t.value.style.animationFillMode = "forwards", o = s?.setTimeout(() => {
				t.value?.style.animationFillMode === "forwards" && (t.value.style.animationFillMode = e);
			});
		}
		n === "none" && l("ANIMATION_END");
	}, f = (e) => {
		e.target === t.value && (r.value = AT(t.value));
	}, p = Lr(t, (e, t) => {
		e ? (n.value = getComputedStyle(e), e.addEventListener("animationstart", f), e.addEventListener("animationcancel", d), e.addEventListener("animationend", d)) : (l("ANIMATION_END"), o !== void 0 && s?.clearTimeout(o), t?.removeEventListener("animationstart", f), t?.removeEventListener("animationcancel", d), t?.removeEventListener("animationend", d));
	}, { immediate: !0 }), m = Lr(c, () => {
		let e = AT(t.value);
		r.value = c.value === "mounted" ? e : "none";
	});
	return fa(() => {
		p(), m(), t.value && (t.value.removeEventListener("animationstart", f), t.value.removeEventListener("animationcancel", d), t.value.removeEventListener("animationend", d)), o !== void 0 && s?.clearTimeout(o);
	}), { isPresent: Y(() => ["mounted", "unmountSuspended"].includes(c.value)) };
}
function AT(e) {
	return e && getComputedStyle(e).animationName || "none";
}
// node_modules/reka-ui/dist/Presence/Presence.js
var jT = /*#__PURE__*/ G({
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
		let { present: r, forceMount: i } = /* @__PURE__ */ On(e), a = /* @__PURE__ */ H(), { isPresent: o } = kT(r, a);
		n({ present: o });
		let s = t.default({ present: o.value });
		s = Hw(s || []);
		let c = Qs();
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
		return () => i.value || r.value || o.value ? vc(t.default({ present: o.value })[0], { ref: (e) => {
			let t = Nw(e);
			return t?.hasAttribute === void 0 || (t?.hasAttribute("data-reka-popper-content-wrapper") ? a.value = t.firstElementChild : a.value = t), t;
		} }) : null;
	}
}), MT = /*#__PURE__*/ G({
	name: "PrimitiveSlot",
	inheritAttrs: !1,
	setup(e, { attrs: t, slots: n }) {
		return () => {
			if (!n.default) return null;
			let e = Hw(n.default()), r = e.findIndex((e) => e.type !== xs);
			if (r === -1) return e;
			let i = e[r];
			delete i.props?.ref;
			let a = i.props ? Gs(t, i.props) : t, o = Rs({
				...i,
				props: {}
			}, a);
			return e.length === 1 ? o : (e[r] = o, e);
		};
	}
}), NT = [
	"area",
	"img",
	"input"
], PT = /*#__PURE__*/ G({
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
		return typeof r == "string" && NT.includes(r) ? () => vc(r, t) : r === "template" ? () => vc(MT, t, { default: n.default }) : () => vc(e.as, t, { default: n.default });
	}
});
// node_modules/reka-ui/dist/Primitive/usePrimitiveElement.js
function FT() {
	let e = /* @__PURE__ */ H();
	return {
		primitiveElement: e,
		currentElement: Y(() => ["#text", "#comment"].includes(e.value?.$el.nodeName) ? e.value?.$el.nextElementSibling : Nw(e))
	};
}
// node_modules/reka-ui/dist/DismissableLayer/utils.js
var IT = "dismissableLayer.pointerDownOutside", LT = "dismissableLayer.focusOutside";
function RT(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e.ownerDocument?.defaultView;
	return typeof Element < "u" && e instanceof Element || !!t && e instanceof t.Element;
}
function zT(e, t) {
	if (!RT(t)) return !1;
	if (e.contains(t)) return !0;
	let n = t.closest("[data-dismissable-layer]"), r = e.dataset.dismissableLayer === "" ? e : e.querySelector("[data-dismissable-layer]"), i = Array.from(e.ownerDocument.querySelectorAll("[data-dismissable-layer]"));
	return !!(n && (r === n || i.indexOf(r) < i.indexOf(n)));
}
function BT(e, t, n = !0) {
	let r = /* @__PURE__ */ H(!1), i = /* @__PURE__ */ H(() => {});
	return Pr((a) => {
		if (!_w || !Cn(n)) return;
		let o = t?.value?.ownerDocument ?? globalThis.document, s = async (n) => {
			let a = n.target;
			if (t?.value && a) {
				if (zT(t.value, a)) o.removeEventListener("click", i.value), r.value = !1;
				else {
					if (n.target && !r.value) {
						let t = { originalEvent: n };
						function r() {
							pw(IT, e, t);
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
		Cn(n) && (r.value = !0);
	} };
}
function VT(e, t, n = !0) {
	let r = /* @__PURE__ */ H(!1);
	return Pr((i) => {
		if (!_w || !Cn(n)) return;
		let a = t?.value?.ownerDocument ?? globalThis.document, o = async (n) => {
			if (!t?.value) return;
			await sr(), await sr();
			let i = n.target;
			t.value && i && !zT(t.value, i) && n.target && !r.value && pw(LT, e, { originalEvent: n });
		};
		a.addEventListener("focusin", o), i(() => a.removeEventListener("focusin", o));
	}), {
		onFocusCapture: () => {
			Cn(n) && (r.value = !0);
		},
		onBlurCapture: () => {
			Cn(n) && (r.value = !1);
		}
	};
}
// node_modules/reka-ui/dist/DismissableLayer/context.js
var HT = /*#__PURE__*/ on({
	layersRoot: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), UT = /* @__PURE__ */ G({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = lT(), o = Y(() => a.value?.ownerDocument ?? globalThis.document), s = Y(() => HT.layersRoot), c = Y(() => a.value ? Array.from(s.value).indexOf(a.value) : -1), l = Y(() => HT.layersWithOutsidePointerEventsDisabled.size > 0), u = Y(() => {
			let e = Array.from(s.value), [t] = [...HT.layersWithOutsidePointerEventsDisabled].slice(-1), n = e.indexOf(t);
			return c.value >= n;
		}), d = BT(async (e) => {
			let t = [...HT.branches].some((t) => t?.contains(e.target));
			n.present && u.value && !t && (r("pointerDownOutside", e), r("interactOutside", e), await sr(), e.defaultPrevented || r("dismiss"));
		}, a, () => n.present), f = VT((e) => {
			let t = [...HT.branches].some((t) => t?.contains(e.target));
			n.present && !t && (r("focusOutside", e), r("interactOutside", e), e.defaultPrevented || r("dismiss"));
		}, a);
		return Rw("Escape", (e) => {
			n.present && c.value === s.value.size - 1 && (r("escapeKeyDown", e), e.defaultPrevented || r("dismiss"));
		}, { target: () => o.value?.defaultView ?? globalThis.window }), Lr([
			a,
			() => n.disableOutsidePointerEvents,
			() => n.present
		], ([e, t, n], r, i) => {
			if (e && n && t) {
				let t = e.ownerDocument;
				Kw(t, e), HT.layersWithOutsidePointerEventsDisabled.add(e), i(() => {
					HT.layersWithOutsidePointerEventsDisabled.delete(e), qw(t, e);
				});
			}
		}, { immediate: !0 }), Lr([a, () => n.present], ([e, t], n, r) => {
			e && t && (s.value.add(e), r(() => {
				s.value.delete(e);
			}));
		}, { immediate: !0 }), Pr((e) => {
			e(() => {
				a.value && (s.value.delete(a.value), HT.layersWithOutsidePointerEventsDisabled.delete(a.value));
			});
		}), (t, n) => (K(), As(U(PT), {
			ref: U(i),
			"as-child": e.asChild,
			as: e.as,
			"data-dismissable-layer": "",
			style: Ce({ pointerEvents: l.value ? u.value ? "auto" : "none" : void 0 }),
			onFocusCapture: U(f).onFocusCapture,
			onBlurCapture: U(f).onBlurCapture,
			onPointerdownCapture: U(d).onPointerDownCapture
		}, {
			default: W(() => [Da(t.$slots, "default")]),
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
}), WT = gw(() => /* @__PURE__ */ H([]));
function GT() {
	let e = WT();
	return {
		add(t) {
			let n = e.value[0];
			t !== n && n?.pause(), e.value = KT(e.value, t), e.value.unshift(t);
		},
		remove(t) {
			e.value = KT(e.value, t), e.value[0]?.resume();
		}
	};
}
function KT(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
// node_modules/reka-ui/dist/FocusScope/utils.js
var qT = "focusScope.autoFocusOnMount", JT = "focusScope.autoFocusOnUnmount", YT = {
	bubbles: !1,
	cancelable: !0
};
function XT(e, t) {
	let n = t;
	for (; n;) {
		if (e.contains(n)) return !0;
		n = n.getRootNode().host ?? null;
	}
	return !1;
}
function ZT(e, { select: t = !1 } = {}) {
	let n = fw();
	for (let r of e) if (rE(r, { select: t }), fw() !== n) return !0;
}
function QT(e) {
	let t = $T(e);
	return [eE(t, e), eE(t.reverse(), e)];
}
function $T(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t.sort((e, t) => e.tabIndex === t.tabIndex ? 0 : e.tabIndex === 0 ? 1 : t.tabIndex === 0 ? -1 : e.tabIndex - t.tabIndex);
}
function eE(e, t) {
	for (let n of e) if (!tE(n, { upTo: t })) return n;
}
function tE(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function nE(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function rE(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = fw();
		e.focus({ preventScroll: !0 }), e !== n && nE(e) && t && e.select();
	}
}
// node_modules/reka-ui/dist/FocusScope/FocusScope.js
var iE = /* @__PURE__ */ G({
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
		let n = e, r = t, { currentRef: i, currentElement: a } = lT(), o = /* @__PURE__ */ H(null), s = GT(), c = /*#__PURE__*/ on({
			paused: !1,
			pause() {
				this.paused = !0;
			},
			resume() {
				this.paused = !1;
			}
		});
		Pr((e) => {
			if (!_w) return;
			let t = a.value;
			if (!n.trapped) return;
			let r = t?.ownerDocument ?? document, i = t ? t.getRootNode() : r;
			function s(e) {
				if (c.paused || !t) return;
				let n = e.target;
				t.contains(n) ? o.value = n : rE(o.value, { select: !0 });
			}
			function l(e) {
				if (c.paused || !t) return;
				let n = e.relatedTarget;
				n !== null && (t.contains(n) || rE(o.value, { select: !0 }));
			}
			function u(e) {
				let n = o.value;
				if (n === null || !e.some((e) => e.removedNodes.length > 0)) return;
				let r = fw();
				r && t.contains(r) || t.contains(n) || rE(t);
			}
			function d(e) {
				if (c.paused || !t) return;
				let n = e.composedPath()[0];
				XT(t, n) || rE(o.value, { select: !0 });
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
			let n = new CustomEvent(qT, YT), i = (e) => r("mountAutoFocus", e);
			e.addEventListener(qT, i), e.dispatchEvent(n), e.removeEventListener(qT, i), n.defaultPrevented || (ZT($T(e), { select: !0 }), fw() === t && rE(e));
		}
		Pr(async (e) => {
			let t = a.value;
			if (await sr(), !t) return;
			n.present !== !1 && s.add(c);
			let i = fw();
			!t.contains(i) && n.present !== !1 && l(t, i), e(() => {
				let e = new CustomEvent(JT, YT), n = (e) => {
					r("unmountAutoFocus", e);
				};
				t.addEventListener(JT, n), t.dispatchEvent(e), t.setAttribute("data-focus-scope-unmounting", ""), setTimeout(() => {
					e.defaultPrevented || rE(i ?? document.body, { select: !0 }), t.removeEventListener(JT, n), s.remove(c), t.removeAttribute("data-focus-scope-unmounting");
				}, 0);
			});
		}), Lr(() => n.present, async (e, t) => {
			if (!_w) return;
			if (e === !1 && t === !0) {
				s.remove(c);
				return;
			}
			if (e !== !0 || t !== !1) return;
			s.add(c), await sr();
			let n = a.value;
			if (!n) return;
			let r = fw();
			n.contains(r) || l(n, r);
		});
		function u(e) {
			if (!n.loop && !n.trapped || c.paused) return;
			let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, r = fw();
			if (t && r) {
				let t = e.currentTarget, [i, a] = QT(t);
				i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n.loop && rE(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n.loop && rE(a, { select: !0 })) : r === t && e.preventDefault();
			}
		}
		return (t, n) => (K(), As(U(PT), {
			ref_key: "currentRef",
			ref: i,
			tabindex: "-1",
			"as-child": e.asChild,
			as: e.as,
			onKeydown: u
		}, {
			default: W(() => [Da(t.$slots, "default")]),
			_: 3
		}, 8, ["as-child", "as"]));
	}
}), aE = ["Enter", " "], oE = [
	"ArrowDown",
	"PageUp",
	"Home"
], sE = [
	"ArrowUp",
	"PageDown",
	"End"
];
[...oE, ...sE], [...aE], [...aE];
function cE(e) {
	let t = fw();
	for (let n of e) if (n === t || (n.focus(), fw() !== t)) return;
}
// node_modules/reka-ui/dist/Teleport/Teleport.js
var lE = /* @__PURE__ */ G({
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
		let t = e, n = Uw({}), r = Y(() => t.to ?? n.teleportTo?.value ?? "body"), i = Fw();
		return (t, n) => U(i) || e.forceMount ? (K(), As(Qr, {
			key: 0,
			to: r.value,
			disabled: e.disabled,
			defer: e.defer
		}, [Da(t.$slots, "default")], 8, [
			"to",
			"disabled",
			"defer"
		])) : Vs("v-if", !0);
	}
}), uE = "data-reka-collection-item";
function dE(e = {}) {
	let { key: t = "", isProvider: n = !1 } = e, r = `${t}CollectionProvider`, i;
	n ? (i = {
		collectionRef: /* @__PURE__ */ H(),
		itemMap: /* @__PURE__ */ H(/* @__PURE__ */ new Map())
	}, kr(r, i)) : i = Ar(r);
	let a = (e, t = !1) => {
		if (!i.collectionRef.value) return;
		let n = i.itemMap.value.get(e);
		return n && (t || n.ref.dataset.disabled !== "") ? n : void 0;
	}, o = (e = !1) => {
		let t = i.collectionRef.value;
		if (!t) return [];
		let n = Array.from(t.querySelectorAll(`[${uE}]`)), r = new Map(n.map((e, t) => [e, t])), a = Array.from(i.itemMap.value.values()).sort((e, t) => (r.get(e.ref) ?? -1) - (r.get(t.ref) ?? -1));
		return e ? a : a.filter((e) => e.ref.dataset.disabled !== "");
	}, s = /*#__PURE__*/ G({
		name: "CollectionSlot",
		inheritAttrs: !1,
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = FT();
			return Lr(a, () => {
				i.collectionRef.value = a.value;
			}), () => vc(MT, {
				ref: r,
				...n
			}, t);
		}
	}), c = /*#__PURE__*/ G({
		name: "CollectionItem",
		inheritAttrs: !1,
		props: { value: { validator: () => !0 } },
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = FT();
			return Pr((t) => {
				if (a.value) {
					let n = hn(a.value);
					i.itemMap.value.set(n, {
						ref: a.value,
						value: e.value
					}), t(() => i.itemMap.value.delete(n));
				}
			}), () => vc(MT, {
				...n,
				[uE]: "",
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
var fE = /* @__PURE__ */ G({
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
		return (t, n) => (K(), As(U(PT), {
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
			default: W(() => [Da(t.$slots, "default")]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"aria-hidden",
			"data-hidden",
			"tabindex"
		]));
	}
}), [pE, mE] = /*#__PURE__*/ dw("PopperRoot"), hE = /* @__PURE__ */ G({
	inheritAttrs: !1,
	__name: "PopperRoot",
	setup(e) {
		let t = /* @__PURE__ */ H();
		return mE({
			anchor: t,
			onAnchorChange: (e) => t.value = e
		}), (e, t) => Da(e.$slots, "default");
	}
}), gE = /* @__PURE__ */ G({
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
		let t = e, { forwardRef: n, currentElement: r } = lT(), i = pE();
		return Fr(() => {
			i.onAnchorChange(t.reference ?? r.value);
		}), (t, r) => (K(), As(U(PT), {
			ref: U(n),
			as: e.as,
			"as-child": e.asChild
		}, {
			default: W(() => [Da(t.$slots, "default")]),
			_: 3
		}, 8, ["as", "as-child"]));
	}
});
// node_modules/reka-ui/dist/Popper/utils.js
function _E(e) {
	return e !== null;
}
function vE(e) {
	return {
		name: "transformOrigin",
		options: e,
		fn(t) {
			let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = yE(n), u = {
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
function yE(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var bE = [
	"top",
	"right",
	"bottom",
	"left"
], xE = Math.min, SE = Math.max, CE = Math.round, wE = Math.floor, TE = (e) => ({
	x: e,
	y: e
}), EE = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function DE(e, t, n) {
	return SE(e, xE(t, n));
}
function OE(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function kE(e) {
	return e.split("-")[0];
}
function AE(e) {
	return e.split("-")[1];
}
function jE(e) {
	return e === "x" ? "y" : "x";
}
function ME(e) {
	return e === "y" ? "height" : "width";
}
function NE(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function PE(e) {
	return jE(NE(e));
}
function FE(e, t, n) {
	n === void 0 && (n = !1);
	let r = AE(e), i = PE(e), a = ME(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = WE(o)), [o, WE(o)];
}
function IE(e) {
	let t = WE(e);
	return [
		LE(e),
		t,
		LE(t)
	];
}
function LE(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var RE = ["left", "right"], zE = ["right", "left"], BE = ["top", "bottom"], VE = ["bottom", "top"];
function HE(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? zE : RE : t ? RE : zE;
		case "left":
		case "right": return t ? BE : VE;
		default: return [];
	}
}
function UE(e, t, n, r) {
	let i = AE(e), a = HE(kE(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(LE)))), a;
}
function WE(e) {
	let t = kE(e);
	return EE[t] + e.slice(t.length);
}
function GE(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function KE(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : GE(e);
}
function qE(e) {
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
function JE(e, t, n) {
	let { reference: r, floating: i } = e, a = NE(t), o = PE(t), s = ME(o), c = kE(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = AE(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function YE(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = OE(t, e), p = KE(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = qE(await i.getClippingRect({
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
	}, y = qE(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var XE = 50, ZE = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: YE
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = JE(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < XE && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = JE(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, QE = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = OE(e, t) || {};
		if (l == null) return {};
		let d = KE(u), f = {
			x: n,
			y: r
		}, p = PE(i), m = ME(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		C && await (o.isElement == null ? void 0 : o.isElement(S)) || (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = xE(d[_], T), D = xE(d[v], T), O = C - h[m] - D, k = C / 2 - h[m] / 2 + w, ee = DE(E, k, O), te = !c.arrow && AE(i) != null && k !== ee && a.reference[m] / 2 - (k < E ? E : D) - h[m] / 2 < 0, ne = te ? k < E ? k - E : k - O : 0;
		return {
			[p]: f[p] + ne,
			data: {
				[p]: ee,
				centerOffset: k - ee - ne,
				...te && { alignmentOffset: ne }
			},
			reset: te
		};
	}
}), $E = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = OE(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = kE(r), _ = NE(o), v = kE(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [WE(o)] : IE(o)), x = p !== "none";
			!d && x && b.push(...UE(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = FE(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === NE(t) || T.every((e) => NE(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = NE(e.placement);
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
function eD(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function tD(e) {
	return bE.some((t) => e[t] >= 0);
}
var nD = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = OE(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = eD(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: tD(e)
					} };
				}
				case "escaped": {
					let e = eD(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: tD(e)
					} };
				}
				default: return {};
			}
		}
	};
}, rD = /*#__PURE__*/ new Set(["left", "top"]);
async function iD(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = kE(n), s = AE(n), c = NE(n) === "y", l = rD.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = OE(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var aD = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await iD(t, e);
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
}, oD = function(e) {
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
			} }, ...l } = OE(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = NE(i), p = jE(f), m = u[p], h = u[f], g = (e, t) => DE(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, sD = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = OE(e, t), u = {
				x: n,
				y: r
			}, d = NE(i), f = jE(d), p = u[f], m = u[d], h = OE(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = rD.has(kE(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, cD = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = OE(e, t), c = await i.detectOverflow(t, s), l = kE(n), u = AE(n), d = NE(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = xE(p - c[m], g), y = xE(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * SE(c.left, c.right) : S = p - 2 * SE(c.top, c.bottom)), await o({
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
function lD() {
	return typeof window < "u";
}
function uD(e) {
	return pD(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function dD(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function fD(e) {
	return ((pD(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function pD(e) {
	return lD() ? e instanceof Node || e instanceof dD(e).Node : !1;
}
function mD(e) {
	return lD() ? e instanceof Element || e instanceof dD(e).Element : !1;
}
function hD(e) {
	return lD() ? e instanceof HTMLElement || e instanceof dD(e).HTMLElement : !1;
}
function gD(e) {
	return !lD() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof dD(e).ShadowRoot;
}
function _D(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = OD(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function vD(e) {
	return /^(table|td|th)$/.test(uD(e));
}
function yD(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var bD = /transform|translate|scale|rotate|perspective|filter/, xD = /paint|layout|strict|content/, SD = (e) => !!e && e !== "none", CD;
function wD(e) {
	let t = mD(e) ? OD(e) : e;
	return SD(t.transform) || SD(t.translate) || SD(t.scale) || SD(t.rotate) || SD(t.perspective) || !ED() && (SD(t.backdropFilter) || SD(t.filter)) || bD.test(t.willChange || "") || xD.test(t.contain || "");
}
function TD(e) {
	let t = AD(e);
	for (; hD(t) && !DD(t);) {
		if (wD(t)) return t;
		if (yD(t)) return null;
		t = AD(t);
	}
	return null;
}
function ED() {
	return CD ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), CD;
}
function DD(e) {
	return /^(html|body|#document)$/.test(uD(e));
}
function OD(e) {
	return dD(e).getComputedStyle(e);
}
function kD(e) {
	return mD(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function AD(e) {
	if (uD(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || gD(e) && e.host || fD(e);
	return gD(t) ? t.host : t;
}
function jD(e) {
	let t = AD(e);
	return DD(t) ? (e.ownerDocument || e).body : hD(t) && _D(t) ? t : jD(t);
}
function MD(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = jD(e), i = r === e.ownerDocument?.body, a = dD(r);
	if (i) {
		let e = ND(a);
		return t.concat(a, a.visualViewport || [], _D(r) ? r : [], e && n ? MD(e) : []);
	}
	return t.concat(r, MD(r, [], n));
}
function ND(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function PD(e) {
	let t = OD(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = hD(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = CE(n) !== a || CE(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function FD(e) {
	return mD(e) ? e : e.contextElement;
}
function ID(e) {
	let t = FD(e);
	if (!hD(t)) return TE(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = PD(t), o = (a ? CE(n.width) : n.width) / r, s = (a ? CE(n.height) : n.height) / i;
	return o && Number.isFinite(o) || (o = 1), s && Number.isFinite(s) || (s = 1), {
		x: o,
		y: s
	};
}
var LD = /*#__PURE__*/ TE(0);
function RD(e) {
	let t = dD(e);
	return !ED() || !t.visualViewport ? LD : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function zD(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === dD(e);
}
function BD(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = FD(e), o = TE(1);
	t && (r ? mD(r) && (o = ID(r)) : o = ID(e));
	let s = zD(a, n, r) ? RD(a) : TE(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = dD(a), t = mD(r) ? dD(r) : r, n = e, i = ND(n);
		for (; i && t !== n;) {
			let e = ID(i), t = i.getBoundingClientRect(), r = OD(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = dD(i), i = ND(n);
		}
	}
	return qE({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function VD(e, t) {
	let n = kD(e).scrollLeft;
	return t ? t.left + n : BD(fD(e)).left + n;
}
function HD(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - VD(e, n),
		y: n.top + t.scrollTop
	};
}
function UD(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = fD(r), s = t ? yD(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = TE(1), u = TE(0), d = hD(r);
	if ((d || !a) && ((uD(r) !== "body" || _D(o)) && (c = kD(r)), d)) {
		let e = BD(r);
		l = ID(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? HD(o, c) : TE(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function WD(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function GD(e) {
	let t = kD(e), n = e.ownerDocument.body, r = SE(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = SE(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + VD(e), o = -t.scrollTop;
	return OD(n).direction === "rtl" && (a += SE(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var KD = 25;
function qD(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = dD(e), a = fD(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !ED() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (VD(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= KD && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function JD(e, t) {
	let n = BD(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = ID(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function YD(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = qD(e, n, t);
	else if (t === "document") r = GD(fD(e));
	else if (mD(t)) r = JD(t, n);
	else {
		let n = RD(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return qE(r);
}
function XD(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = MD(e, [], !1).filter((e) => mD(e) && uD(e) !== "body"), i = null, a = OD(e).position === "fixed", o = a ? AD(e) : e;
	for (; mD(o) && !DD(o);) {
		let e = OD(o), t = wD(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = AD(o);
	}
	return t.set(e, r), r;
}
function ZD(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? yD(t) ? [] : XD(t, this._c) : [].concat(n), r], o = YD(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = YD(t, a[e], i);
		s = SE(n.top, s), c = xE(n.right, c), l = xE(n.bottom, l), u = SE(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function QD(e) {
	let { width: t, height: n } = PD(e);
	return {
		width: t,
		height: n
	};
}
function $D(e, t, n) {
	let r = hD(t), i = fD(t), a = n === "fixed", o = BD(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = TE(0);
	if ((r || !a) && ((uD(t) !== "body" || _D(i)) && (s = kD(t)), r)) {
		let e = BD(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = VD(i));
	let l = i && !r && !a ? HD(i, s) : TE(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function eO(e) {
	return OD(e).position === "static";
}
function tO(e, t) {
	if (!hD(e) || OD(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return fD(e) === n && (n = n.ownerDocument.body), n;
}
function nO(e, t) {
	let n = dD(e);
	if (yD(e)) return n;
	if (!hD(e)) {
		let t = AD(e);
		for (; t && !DD(t);) {
			if (mD(t) && !eO(t)) return t;
			t = AD(t);
		}
		return n;
	}
	let r = tO(e, t);
	for (; r && vD(r) && eO(r);) r = tO(r, t);
	return r && DD(r) && eO(r) && !wD(r) ? n : r || TD(e) || n;
}
var rO = async function(e) {
	let t = this.getOffsetParent || nO, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: $D(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function iO(e) {
	return OD(e).direction === "rtl";
}
var aO = {
	convertOffsetParentRelativeRectToViewportRelativeRect: UD,
	getDocumentElement: fD,
	getClippingRect: ZD,
	getOffsetParent: nO,
	getElementRects: rO,
	getClientRects: WD,
	getDimensions: QD,
	getScale: ID,
	isElement: mD,
	isRTL: iO
};
function oO(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function sO(e, t, n) {
	let r = null, i, a = fD(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = wE(d), h = wE(a.clientWidth - (u + f)), g = wE(a.clientHeight - (d + p)), _ = wE(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: SE(0, xE(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!oO(l, e.getBoundingClientRect())) return s();
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
	let c = dD(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function cO(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = FD(e), u = i || a ? [...l ? MD(l) : [], ...t ? MD(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? sO(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? BD(e) : null;
	c && g();
	function g() {
		let t = BD(e);
		h && !oO(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var lO = aD, uO = oD, dO = $E, fO = cD, pO = nD, mO = QE, hO = sD, gO = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...aO,
		...i.platform,
		_c: r
	};
	return ZE(e, t, {
		...i,
		platform: a
	});
};
// node_modules/@floating-ui/vue/dist/floating-ui.vue.mjs
function _O(e) {
	return typeof e == "object" && !!e && "$el" in e;
}
function vO(e) {
	if (_O(e)) {
		let t = e.$el;
		return pD(t) && uD(t) === "#comment" ? null : t;
	}
	return e;
}
function yO(e) {
	return {
		name: "arrow",
		options: e,
		fn(t) {
			let n = vO(Cn(e.element));
			return n == null ? {} : mO({
				element: n,
				padding: e.padding
			}).fn(t);
		}
	};
}
function bO(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function xO(e, t) {
	let n = bO(e);
	return Math.round(t * n) / n;
}
function SO(e, t, n) {
	n === void 0 && (n = {});
	let r = n.whileElementsMounted, i = Y(() => Cn(n.open) ?? !0), a = Y(() => Cn(n.middleware)), o = Y(() => Cn(n.placement) ?? "bottom"), s = Y(() => Cn(n.strategy) ?? "absolute"), c = Y(() => Cn(n.transform) ?? !0), l = Y(() => vO(e.value)), u = Y(() => vO(t.value)), d = /* @__PURE__ */ H(0), f = /* @__PURE__ */ H(0), p = /* @__PURE__ */ H(s.value), m = /* @__PURE__ */ H(o.value), h = /* @__PURE__ */ yn({}), g = /* @__PURE__ */ H(!1), _ = Y(() => {
		let e = {
			position: p.value,
			left: "0",
			top: "0"
		};
		if (!u.value) return e;
		let t = xO(u.value, d.value), n = xO(u.value, f.value);
		return c.value ? {
			...e,
			transform: "translate(" + t + "px, " + n + "px)",
			...bO(u.value) >= 1.5 && { willChange: "transform" }
		} : {
			position: p.value,
			left: t + "px",
			top: n + "px"
		};
	}), v;
	function y() {
		if (l.value == null || u.value == null) return;
		let e = i.value;
		gO(l.value, u.value, {
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
	return Lr([
		a,
		o,
		s,
		i
	], y, { flush: "sync" }), Lr([l, u], x, { flush: "sync" }), Lr(i, S, { flush: "sync" }), Ke() && qe(b), {
		x: /* @__PURE__ */ ln(d),
		y: /* @__PURE__ */ ln(f),
		strategy: /* @__PURE__ */ ln(p),
		placement: /* @__PURE__ */ ln(m),
		middlewareData: /* @__PURE__ */ ln(h),
		isPositioned: /* @__PURE__ */ ln(g),
		floatingStyles: _,
		update: y
	};
}
// node_modules/reka-ui/dist/Popper/PopperContent.js
var CO = ["dir"], wO = {
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
}, [TO, EO] = /*#__PURE__*/ dw("PopperContent"), DO = /* @__PURE__ */ G({
	inheritAttrs: !1,
	__name: "PopperContent",
	props: /* @__PURE__ */ Ka({
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
	}, { ...wO }),
	emits: ["placed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = pE(), { forwardRef: a, currentElement: o } = lT(), s = rT(Y(() => n.dir)), c = /* @__PURE__ */ H(), l = /* @__PURE__ */ H(), { width: u, height: d } = wT(l), f = Y(() => n.side + (n.align === "center" ? "" : `-${n.align}`)), p = Y(() => typeof n.collisionPadding == "number" ? n.collisionPadding : {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			...n.collisionPadding
		}), m = Y(() => Array.isArray(n.collisionBoundary) ? n.collisionBoundary : [n.collisionBoundary]), h = Y(() => ({
			padding: p.value,
			boundary: m.value.filter(_E),
			altBoundary: m.value.length > 0
		})), g = Y(() => ({
			mainAxis: n.sideFlip,
			crossAxis: n.alignFlip
		})), _ = Y(() => [
			lO({
				mainAxis: n.sideOffset + d.value,
				alignmentAxis: n.alignOffset
			}),
			n.prioritizePosition && n.avoidCollisions && dO({
				...h.value,
				...g.value
			}),
			n.avoidCollisions && uO({
				mainAxis: !0,
				crossAxis: !!n.prioritizePosition,
				limiter: n.sticky === "partial" ? hO() : void 0,
				...h.value
			}),
			!n.prioritizePosition && n.avoidCollisions && dO({
				...h.value,
				...g.value
			}),
			fO({
				...h.value,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--reka-popper-available-width", `${n}px`), o.setProperty("--reka-popper-available-height", `${r}px`), o.setProperty("--reka-popper-anchor-width", `${i}px`), o.setProperty("--reka-popper-anchor-height", `${a}px`);
				}
			}),
			l.value && yO({
				element: l.value,
				padding: n.arrowPadding
			}),
			vE({
				arrowWidth: u.value,
				arrowHeight: d.value,
				dir: s.value
			}),
			n.hideWhenDetached && pO({
				strategy: "referenceHidden",
				...h.value
			})
		]), { floatingStyles: v, placement: y, isPositioned: b, middlewareData: x, update: S } = SO(Y(() => n.reference ?? i.anchor.value), c, {
			strategy: n.positionStrategy,
			placement: f,
			whileElementsMounted: (...e) => cO(...e, {
				layoutShift: !n.disableUpdateOnLayoutShift,
				animationFrame: n.updatePositionStrategy === "always"
			}),
			middleware: _
		}), C = Y(() => yE(y.value)[0]), w = Y(() => yE(y.value)[1]);
		Fr(() => {
			b.value && r("placed");
		});
		let T = Y(() => {
			let e = x.value.arrow?.centerOffset !== 0;
			return n.hideShiftedArrow && e;
		}), E = /* @__PURE__ */ H("");
		return Pr(() => {
			o.value && (E.value = window.getComputedStyle(o.value).zIndex);
		}), EO({
			placedSide: C,
			onArrowChange: (e) => l.value = e,
			arrowX: Y(() => x.value.arrow?.x ?? 0),
			arrowY: Y(() => x.value.arrow?.y ?? 0),
			shouldHideArrow: T
		}), (e, t) => (K(), ks("div", {
			ref_key: "floatingRef",
			ref: c,
			"data-reka-popper-content-wrapper": "",
			dir: U(s),
			style: Ce({
				...U(v),
				transform: U(b) ? U(v).transform : "translate(0, -200%)",
				minWidth: "max-content",
				zIndex: E.value,
				"--reka-popper-transform-origin": [U(x).transformOrigin?.x, U(x).transformOrigin?.y].join(" "),
				...U(x).hide?.referenceHidden && {
					visibility: "hidden",
					pointerEvents: "none"
				}
			})
		}, [n.memoDependencies ? bc([
			n.asChild,
			n.as,
			C.value,
			w.value,
			U(b),
			...Object.values(e.$attrs),
			...n.memoDependencies
		], () => (K(), As(U(PT), Gs({
			key: 0,
			ref: U(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			style: { animation: U(b) ? void 0 : "none" }
		}), {
			default: W(() => [Da(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"style"
		])), t, 0) : (K(), As(U(PT), Gs({
			key: 1,
			ref: U(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			dir: U(s),
			style: { animation: U(b) ? void 0 : "none" }
		}), {
			default: W(() => [Da(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"dir",
			"style"
		]))], 12, CO));
	}
});
// node_modules/reka-ui/dist/shared/useNonce.js
function OO(e) {
	let t = Uw({ nonce: /* @__PURE__ */ H() });
	return Y(() => e?.value || t.nonce?.value);
}
// node_modules/reka-ui/dist/Field/FieldRoot.js
var [kO, AO] = /*#__PURE__*/ dw("FieldRoot"), jO = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], MO = [" ", "Enter"];
function NO(e, t, n) {
	return e === void 0 ? !1 : Array.isArray(e) ? e.some((e) => PO(e, t, n)) : PO(e, t, n);
}
function PO(e, t, n) {
	return e === void 0 || t === void 0 ? !1 : typeof e == "string" ? e === t : typeof n == "function" ? n(e, t) : typeof n == "string" ? e?.[n] === t?.[n] : lw(e, t);
}
function FO(e) {
	return e == null || e === "" || Array.isArray(e) && e.length === 0;
}
// node_modules/reka-ui/dist/Select/SelectRoot.js
var IO = ["value"], [LO, RO] = /*#__PURE__*/ dw("SelectRoot"), zO = /* @__PURE__ */ G({
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
		let n = e, r = t, { multiple: i, dir: a } = /* @__PURE__ */ On(n), o = kO(null), s = Y(() => n.name ?? o?.name.value), c = Y(() => o ? n.required || o.required.value : n.required), l = Y(() => !!(n.disabled || o?.disabled.value)), u = Vw(n, "modelValue", r, {
			defaultValue: n.defaultValue ?? (i.value ? [] : void 0),
			passive: n.modelValue === void 0,
			deep: !0
		}), d = Vw(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), f = /* @__PURE__ */ H(), p = /* @__PURE__ */ H(), m = /* @__PURE__ */ H({
			x: 0,
			y: 0
		}), h = Y(() => i.value && Array.isArray(u.value) ? u.value?.length === 0 : mw(u.value));
		Lr(u, () => {
			o?.reportControlState({ filled: !h.value });
		}), dE({ isProvider: !0 });
		let g = rT(a), _ = cT(f), v = /* @__PURE__ */ H(/* @__PURE__ */ new Set()), y = Y(() => Array.from(v.value).map((e) => e.value).join(";"));
		function b(e) {
			let t;
			if (i.value) {
				let r = Array.isArray(u.value) ? [...u.value] : [], i = r.findIndex((t) => PO(t, e, n.by));
				i === -1 ? r.push(e) : r.splice(i, 1), t = [...r];
			} else t = e;
			u.value = t, o?.handleControlInput({ value: t });
		}
		function x(e) {
			return Array.from(v.value).find((t) => NO(e, t.value, n.by));
		}
		return RO({
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
		}), (t, n) => (K(), As(U(hE), null, {
			default: W(() => [Da(t.$slots, "default", {
				modelValue: U(u),
				open: U(d)
			}), U(_) && s.value ? (K(), As(BO, {
				key: y.value,
				"aria-hidden": "true",
				tabindex: "-1",
				multiple: U(i),
				required: c.value,
				name: s.value,
				autocomplete: e.autocomplete,
				disabled: l.value,
				value: U(u)
			}, {
				default: W(() => [U(mw)(U(u)) ? (K(), ks("option", {
					key: 0,
					value: e.nullableValue
				}, null, 8, IO)) : Vs("v-if", !0), (K(!0), ks(ys, null, Ta(Array.from(v.value), (e) => (K(), ks("option", Gs({ key: e.value ?? "" }, { ref_for: !0 }, e), null, 16))), 128))]),
				_: 1
			}, 8, [
				"multiple",
				"required",
				"name",
				"autocomplete",
				"disabled",
				"value"
			])) : Vs("v-if", !0)]),
			_: 3
		}));
	}
}), BO = /* @__PURE__ */ G({
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
		let t = e, n = /* @__PURE__ */ H(), r = LO();
		Lr(() => t.value, (e, t) => {
			let r = window.HTMLSelectElement.prototype, i = Object.getOwnPropertyDescriptor(r, "value").set;
			if (e !== t && i && n.value) {
				let t = new Event("change", { bubbles: !0 });
				i.call(n.value, e), n.value.dispatchEvent(t);
			}
		});
		function i(e) {
			r.onValueChange(e.target.value);
		}
		return (e, r) => (K(), As(U(fE), { "as-child": "" }, {
			default: W(() => [q("select", Gs({
				ref_key: "selectElement",
				ref: n
			}, t, { onInput: i }), [Da(e.$slots, "default")], 16)]),
			_: 3
		}));
	}
}), VO = /* @__PURE__ */ G({
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
		let t = uT(e);
		return (e, n) => (K(), As(U(DO), Gs(U(t), { style: {
			boxSizing: "border-box",
			"--reka-select-content-transform-origin": "var(--reka-popper-transform-origin)",
			"--reka-select-content-available-width": "var(--reka-popper-available-width)",
			"--reka-select-content-available-height": "var(--reka-popper-available-height)",
			"--reka-select-trigger-width": "var(--reka-popper-anchor-width)",
			"--reka-select-trigger-height": "var(--reka-popper-anchor-height)"
		} }), {
			default: W(() => [Da(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), HO = {
	onViewportChange: () => {},
	itemTextRefCallback: () => {},
	itemRefCallback: () => {}
}, [UO, WO] = /*#__PURE__*/ dw("SelectContent"), GO = /* @__PURE__ */ G({
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
		let n = e, r = t, i = LO();
		oT(), eT(n.bodyLock);
		let { CollectionSlot: a, getItems: o } = dE(), s = /* @__PURE__ */ H();
		xT(s);
		let { search: c, handleTypeaheadSearch: l } = ET(), u = /* @__PURE__ */ H(), d = /* @__PURE__ */ H(), f = /* @__PURE__ */ H(), p = /* @__PURE__ */ H(!1), m = /* @__PURE__ */ H(!1), h = /* @__PURE__ */ H(!1);
		function g() {
			d.value && s.value && cE([d.value, s.value]);
		}
		Lr(p, () => {
			g();
		});
		let { onOpenChange: _, triggerPointerDownPosRef: v } = i;
		Pr((e) => {
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
					t = n.loop ? DT(t, i + 1) : t.slice(i + 1);
				}
				setTimeout(() => cE(t)), e.preventDefault();
			}
		}
		let b = Ow(n, "loop"), x = uT(Y(() => n.position === "popper" ? b : {}).value);
		return WO({
			content: s,
			viewport: u,
			onViewportChange: (e) => {
				u.value = e;
			},
			itemRefCallback: (e, t, n) => {
				let r = !m.value && !n, a = NO(i.modelValue.value, t, i.by);
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
				(NO(i.modelValue.value, t, i.by) || r) && (f.value = e);
			},
			focusSelectedItem: g,
			position: n.position,
			isPositioned: p,
			searchRef: c
		}), (t, n) => (K(), As(U(a), null, {
			default: W(() => [J(U(iE), {
				"as-child": "",
				onMountAutoFocus: n[6] ||= Ou(() => {}, ["prevent"]),
				onUnmountAutoFocus: n[7] ||= (e) => {
					r("closeAutoFocus", e), !e.defaultPrevented && (U(i).triggerElement.value?.focus({ preventScroll: !0 }), e.preventDefault());
				}
			}, {
				default: W(() => [J(U(UT), {
					"as-child": "",
					"disable-outside-pointer-events": e.disableOutsidePointerEvents,
					onFocusOutside: n[2] ||= Ou(() => {}, ["prevent"]),
					onDismiss: n[3] ||= (e) => U(i).onOpenChange(!1),
					onEscapeKeyDown: n[4] ||= (e) => r("escapeKeyDown", e),
					onPointerDownOutside: n[5] ||= (e) => r("pointerDownOutside", e)
				}, {
					default: W(() => [(K(), As(xa(e.position === "popper" ? VO : JO), Gs({
						...t.$attrs,
						...U(x)
					}, {
						id: U(i).contentId,
						ref: (e) => {
							if (!e) return;
							let t = U(Nw)(e);
							t?.hasAttribute("data-reka-popper-content-wrapper") ? s.value = t.firstElementChild : s.value = t;
						},
						role: "listbox",
						"data-state": U(i).open.value ? "open" : "closed",
						dir: U(i).dir.value,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none"
						},
						onContextmenu: n[0] ||= Ou(() => {}, ["prevent"]),
						onPlaced: n[1] ||= (e) => p.value = !0,
						onKeydown: y
					}), {
						default: W(() => [Da(t.$slots, "default")]),
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
}), [KO, qO] = /*#__PURE__*/ dw("SelectItemAlignedPosition"), JO = /* @__PURE__ */ G({
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
		let n = e, r = t, { getItems: i } = dE(), a = LO(), o = UO(), s = /* @__PURE__ */ H(!1), c = /* @__PURE__ */ H(!0), l = /* @__PURE__ */ H(), { forwardRef: u, currentElement: d } = lT(), { viewport: f, selectedItem: p, selectedItemText: m, focusSelectedItem: h } = o;
		function g() {
			if (a.triggerElement.value && a.valueElement.value && l.value && d.value && f?.value && p?.value && m?.value) {
				let e = a.triggerElement.value.getBoundingClientRect(), t = d.value.getBoundingClientRect(), n = a.valueElement.value.getBoundingClientRect(), o = m.value.getBoundingClientRect();
				if (a.dir.value !== "rtl") {
					let r = o.left - t.left, i = n.left - r, a = e.left - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = uw(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.left = `${d}px`;
				} else {
					let r = t.right - o.right, i = window.innerWidth - n.right - r, a = window.innerWidth - e.right - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = uw(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.right = `${d}px`;
				}
				let c = i().map((e) => e.ref), u = window.innerHeight - 20, h = f.value.scrollHeight, g = window.getComputedStyle(d.value), _ = Number.parseInt(g.borderTopWidth, 10), v = Number.parseInt(g.paddingTop, 10), y = Number.parseInt(g.borderBottomWidth, 10), b = Number.parseInt(g.paddingBottom, 10), x = _ + v + h + b + y, S = Math.min(p.value.offsetHeight * 5, x), C = window.getComputedStyle(f.value), w = Number.parseInt(C.paddingTop, 10), T = Number.parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - 10, D = u - E, O = p.value.offsetHeight / 2, k = p.value.offsetTop + O, ee = _ + v + k, te = x - ee;
				if (ee <= E) {
					let e = p.value === c.at(-1);
					l.value.style.bottom = "0px";
					let t = d.value.clientHeight - f.value.offsetTop - f.value.offsetHeight, n = ee + Math.max(D, O + (e ? T : 0) + t + y);
					l.value.style.height = `${n}px`;
				} else {
					let e = p.value === c[0];
					l.value.style.top = "0px";
					let t = Math.max(E, _ + f.value.offsetTop + (e ? w : 0) + O) + te;
					l.value.style.height = `${t}px`, f.value.scrollTop = ee - E + f.value.offsetTop;
				}
				l.value.style.margin = "10px 0", l.value.style.minHeight = `${S}px`, l.value.style.maxHeight = `${u}px`, r("placed"), requestAnimationFrame(() => s.value = !0);
			}
		}
		let _ = /* @__PURE__ */ H("");
		ca(async () => {
			await sr(), g(), d.value && (_.value = window.getComputedStyle(d.value).zIndex);
		});
		function v(e) {
			e && c.value === !0 && (g(), h?.(), c.value = !1);
		}
		return Bw(a.triggerElement, () => {
			g();
		}), qO({
			contentWrapper: l,
			shouldExpandOnScrollRef: s,
			onScrollButtonChange: v
		}), (e, t) => (K(), ks("div", {
			ref_key: "contentWrapperElement",
			ref: l,
			style: Ce({
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: _.value
			})
		}, [J(U(PT), Gs({
			ref: U(u),
			style: {
				boxSizing: "border-box",
				maxHeight: "100%"
			}
		}, {
			...e.$attrs,
			...n
		}), {
			default: W(() => [Da(e.$slots, "default")]),
			_: 3
		}, 16)], 4));
	}
}), YO = /* @__PURE__ */ G({
	inheritAttrs: !1,
	__name: "SelectProvider",
	props: { context: {
		type: Object,
		required: !0
	} },
	setup(e) {
		return RO(e.context), WO(HO), (e, t) => Da(e.$slots, "default");
	}
}), XO = { key: 1 }, ZO = /* @__PURE__ */ G({
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
		let n = e, r = dT(n, t), i = LO(), a = /* @__PURE__ */ H();
		ca(() => {
			a.value = new DocumentFragment();
		});
		let o = /* @__PURE__ */ H(), s = Y(() => n.forceMount || i.open.value), c = /* @__PURE__ */ H(s.value), l;
		function u() {
			l &&= (clearTimeout(l), void 0);
		}
		return Lr(s, (e, t, n) => {
			u(), l = setTimeout(() => {
				c.value = s.value, l = void 0;
			}), n(u);
		}), fa(u), (e, t) => s.value || c.value || o.value?.present ? (K(), As(U(jT), {
			key: 0,
			ref_key: "presenceRef",
			ref: o,
			present: s.value
		}, {
			default: W(() => [J(GO, ke(Ls({
				...U(r),
				...e.$attrs
			})), {
				default: W(() => [Da(e.$slots, "default")]),
				_: 3
			}, 16)]),
			_: 3
		}, 8, ["present"])) : a.value ? (K(), ks("div", XO, [(K(), As(Qr, { to: a.value }, [J(YO, { context: U(i) }, {
			default: W(() => [Da(e.$slots, "default")]),
			_: 3
		}, 8, ["context"])], 8, ["to"]))])) : Vs("v-if", !0);
	}
}), [QO, $O] = /*#__PURE__*/ dw("SelectItem"), ek = /* @__PURE__ */ G({
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
		let n = e, r = t, { disabled: i } = /* @__PURE__ */ On(n), a = LO(), o = UO(), { forwardRef: s, currentElement: c } = lT(), { CollectionItem: l } = dE(), u = Y(() => NO(a.modelValue?.value, n.value, a.by)), d = /* @__PURE__ */ H(!1), f = /* @__PURE__ */ H(n.textValue ?? ""), p = CT(void 0, "reka-select-item-text");
		async function m(e) {
			e.defaultPrevented || pw("select.select", h, {
				originalEvent: e,
				value: n.value
			});
		}
		async function h(e) {
			await sr(), r("select", e), e.defaultPrevented || i.value || (a.onValueChange(n.value), a.multiple.value || a.onOpenChange(!1));
		}
		async function g(e) {
			await sr(), !e.defaultPrevented && (i.value ? o.onItemLeave?.() : e.currentTarget?.focus({ preventScroll: !0 }));
		}
		async function _(e) {
			await sr(), !e.defaultPrevented && e.currentTarget === fw() && o.onItemLeave?.();
		}
		async function v(e) {
			await sr(), e.defaultPrevented || o.searchRef?.value !== "" && e.key === " " || (MO.includes(e.key) && m(e), e.key === " " && e.preventDefault());
		}
		if (n.value === "") throw Error("A <SelectItem /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
		return ca(() => {
			c.value && o.itemRefCallback(c.value, n.value, n.disabled);
		}), $O({
			value: n.value,
			disabled: i,
			textId: p,
			isSelected: u,
			onItemTextChange: (e) => {
				f.value = ((f.value || e?.textContent) ?? "").trim();
			}
		}), (t, n) => (K(), As(U(l), { value: { textValue: f.value } }, {
			default: W(() => [J(U(PT), {
				ref: U(s),
				role: "option",
				"aria-labelledby": U(p),
				"data-highlighted": d.value ? "" : void 0,
				"aria-selected": u.value,
				"data-state": u.value ? "checked" : "unchecked",
				"aria-disabled": U(i) || void 0,
				"data-disabled": U(i) ? "" : void 0,
				tabindex: U(i) ? void 0 : -1,
				as: e.as,
				"as-child": e.asChild,
				onFocus: n[0] ||= (e) => d.value = !0,
				onBlur: n[1] ||= (e) => d.value = !1,
				onPointerup: m,
				onPointerdown: n[2] ||= (e) => {
					e.currentTarget.focus({ preventScroll: !0 });
				},
				onTouchend: n[3] ||= Ou(() => {}, ["prevent", "stop"]),
				onPointermove: g,
				onPointerleave: _,
				onKeydown: v
			}, {
				default: W(() => [Da(t.$slots, "default", { selected: u.value })]),
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
}), tk = /* @__PURE__ */ G({
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
		let t = e, n = LO(), r = UO(), i = QO(), { forwardRef: a, currentElement: o } = lT(), s = Y(() => ({
			value: i.value,
			disabled: i.disabled.value,
			textContent: o.value?.textContent ?? i.value?.toString() ?? ""
		}));
		return ca(() => {
			o.value && (i.onItemTextChange(o.value), r.itemTextRefCallback(o.value, i.value, i.disabled.value), n.onOptionAdd(s.value));
		}), fa(() => {
			n.onOptionRemove(s.value);
		}), (e, n) => (K(), As(U(PT), Gs({
			id: U(i).textId,
			ref: U(a)
		}, {
			...t,
			...e.$attrs
		}), {
			default: W(() => [Da(e.$slots, "default")]),
			_: 3
		}, 16, ["id"]));
	}
}), nk = /* @__PURE__ */ G({
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
		return (e, n) => (K(), As(U(lE), ke(Ls(t)), {
			default: W(() => [Da(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), rk = /* @__PURE__ */ G({
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
		let t = e, n = LO(), { forwardRef: r, currentElement: i } = lT(), a = Y(() => n.disabled?.value || t.disabled);
		n.contentId ||= CT(void 0, "reka-select-content"), ca(() => {
			n.onTriggerChange(i.value);
		});
		let o = kO(null), s = Ua();
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
		ca(() => {
			f = o?.registerControl({
				id: c,
				element: () => i.value,
				getValue: () => n.modelValue.value,
				required: () => !!n.required?.value
			});
		}), da(() => f?.());
		let { getItems: p } = dE(), { search: m, handleTypeaheadSearch: h, resetTypeahead: g } = ET();
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
			!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && h(e.key, p()), !(t && e.key === " ") && jO.includes(e.key) && (_(), e.preventDefault());
		}
		return (t, i) => (K(), As(U(gE), {
			"as-child": "",
			reference: e.reference
		}, {
			default: W(() => [J(U(PT), Gs(l(), {
				ref: U(r),
				role: "combobox",
				type: e.as === "button" ? "button" : void 0,
				"aria-controls": U(n).open.value ? U(n).contentId : void 0,
				"aria-expanded": U(n).open.value || !1,
				"aria-required": U(n).required?.value,
				"aria-autocomplete": "none",
				disabled: a.value,
				dir: U(n)?.dir.value,
				"data-state": U(n)?.open.value ? "open" : "closed",
				"data-disabled": a.value ? "" : void 0,
				"data-placeholder": U(FO)(U(n).modelValue?.value) ? "" : void 0,
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
				default: W(() => [Da(t.$slots, "default")]),
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
}), ik = /* @__PURE__ */ G({
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
		let t = e, { forwardRef: n, currentElement: r } = lT(), i = LO();
		ca(() => {
			i.valueElement = r;
		});
		let a = Y(() => {
			let e = [], t = Array.from(i.optionsSet.value), n = (e) => t.find((t) => NO(e, t.value, i.by));
			return e = Array.isArray(i.modelValue.value) ? i.modelValue.value.map((e) => n(e)?.textContent ?? "") : [n(i.modelValue.value)?.textContent ?? ""], e.filter(Boolean);
		}), o = Y(() => a.value.length ? a.value.join(", ") : t.placeholder);
		return (r, s) => (K(), As(U(PT), {
			ref: U(n),
			as: e.as,
			"as-child": e.asChild,
			style: { pointerEvents: "none" },
			"data-placeholder": a.value.length ? void 0 : t.placeholder
		}, {
			default: W(() => [Da(r.$slots, "default", {
				selectedLabel: a.value,
				modelValue: U(i).modelValue.value
			}, () => [zs(ze(o.value), 1)])]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"data-placeholder"
		]));
	}
}), ak = /* @__PURE__ */ G({
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
		let t = e, { nonce: n } = /* @__PURE__ */ On(t), r = OO(n), i = UO(), a = i.position === "item-aligned" ? KO() : void 0, { forwardRef: o, currentElement: s } = lT();
		ca(() => {
			i?.onViewportChange(s.value);
		});
		let c = /* @__PURE__ */ H(0);
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
		return (e, n) => (K(), ks(ys, null, [J(U(PT), Gs({
			ref: U(o),
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
			default: W(() => [Da(e.$slots, "default")]),
			_: 3
		}, 16), J(U(PT), {
			as: "style",
			nonce: U(r)
		}, {
			default: W(() => [...n[0] ||= [zs(" /* Hide scrollbars cross-browser and enable momentum scroll for touch devices */ [data-reka-select-viewport] { scrollbar-width:none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; } [data-reka-select-viewport]::-webkit-scrollbar { display: none; } ", -1)]]),
			_: 1
		}, 8, ["nonce"])], 64));
	}
}), ok = /* @__PURE__ */ G({
	__name: "SelectField",
	props: /*@__PURE__*/ qa({
		options: {},
		placeholder: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = go(e, "modelValue"), n = Ar("portalTarget", void 0);
		return (r, i) => (K(), As(U(zO), {
			modelValue: t.value,
			"onUpdate:modelValue": i[0] ||= (e) => t.value = e
		}, {
			default: W(() => [J(U(rk), {
				class: "trpg-select-trigger",
				"aria-label": e.label
			}, {
				default: W(() => [J(U(ik), { placeholder: e.placeholder ?? "请选择" }, null, 8, ["placeholder"]), i[1] ||= q("span", { "aria-hidden": "true" }, "▾", -1)]),
				_: 1
			}, 8, ["aria-label"]), J(U(nk), { to: U(n) }, {
				default: W(() => [J(U(ZO), {
					class: "trpg-select-content",
					position: "popper",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: W(() => [J(U(ak), { class: "trpg-select-viewport" }, {
						default: W(() => [(K(!0), ks(ys, null, Ta(e.options, (e) => (K(), As(U(ek), {
							key: e,
							value: e,
							class: "trpg-select-item"
						}, {
							default: W(() => [J(U(tk), null, {
								default: W(() => [zs(ze(e), 1)]),
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
}), sk = ["aria-label"], ck = ["aria-pressed", "onClick"], lk = /* @__PURE__ */ G({
	__name: "Segmented",
	props: /*@__PURE__*/ qa({
		options: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = go(e, "modelValue");
		return (n, r) => (K(), ks("div", {
			class: "trpg-seg",
			role: "group",
			"aria-label": e.label
		}, [(K(!0), ks(ys, null, Ta(e.options, (e) => (K(), ks("button", {
			key: e.value,
			type: "button",
			"aria-pressed": t.value === e.value,
			onClick: (n) => t.value = e.value
		}, ze(e.label), 9, ck))), 128))], 8, sk));
	}
}), uk = { class: "probe" }, dk = { class: "lab" }, fk = { class: "lab__row" }, pk = {
	class: "probe__hint",
	"data-testid": "select-model"
}, mk = { class: "lab__row" }, hk = { class: "trpg-check" }, gk = { class: "probe__head" }, _k = { class: "probe__title" }, vk = ["data-status"], yk = { class: "probe__hint" }, bk = { class: "probe__actions" }, xk = ["onClick"], Sk = ["onClick"], Ck = /* @__PURE__ */ G({
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
		], n = /* @__PURE__ */ H(""), r = /* @__PURE__ */ H(""), i = /* @__PURE__ */ H("a"), a = /* @__PURE__ */ H(!1), o = /* @__PURE__ */ H("");
		function s(e, t, n) {
			qu(e, t, n, n === "pass" ? "人工确认：通过" : "人工确认：不通过");
		}
		return (e, c) => (K(), ks("section", uk, [
			c[6] ||= q("h3", { class: "probe__title" }, "界面实测（需要你目测后点结果）", -1),
			q("div", dk, [q("div", fk, [
				J(ok, {
					modelValue: n.value,
					"onUpdate:modelValue": c[0] ||= (e) => n.value = e,
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
				q("p", pk, "下拉当前值：" + ze(n.value || "未选") + " / " + ze(r.value || "未选"), 1),
				J(ok, {
					modelValue: r.value,
					"onUpdate:modelValue": c[1] ||= (e) => r.value = e,
					label: "测试下拉（3 项）",
					options: [
						"红",
						"金",
						"墨"
					],
					placeholder: "下拉测试：选择颜色"
				}, null, 8, ["modelValue"])
			]), q("div", mk, [
				J(lk, {
					modelValue: i.value,
					"onUpdate:modelValue": c[2] ||= (e) => i.value = e,
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
				q("label", hk, [Dr(q("input", {
					"onUpdate:modelValue": c[3] ||= (e) => a.value = e,
					type: "checkbox"
				}, null, 512), [[mu, a.value]]), c[5] ||= zs(" 勾选框测试", -1)]),
				Dr(q("input", {
					"onUpdate:modelValue": c[4] ||= (e) => o.value = e,
					class: "trpg-input",
					type: "text",
					placeholder: "输入测试：中文 / English"
				}, null, 512), [[pu, o.value]])
			])]),
			(K(), ks(ys, null, Ta(t, (e) => q("div", {
				key: e.id,
				class: "probe"
			}, [
				q("div", gk, [q("h4", _k, ze(e.title), 1), q("span", {
					class: "trpg-badge",
					"data-status": U(Ku)[e.id]?.status ?? "idle"
				}, ze(U(Ku)[e.id]?.status ?? "待测"), 9, vk)]),
				q("p", yk, ze(e.how), 1),
				q("div", bk, [q("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => s(e.id, e.title, "pass")
				}, "通过", 8, xk), q("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => s(e.id, e.title, "fail")
				}, "不通过", 8, Sk)])
			])), 64))
		]));
	}
}), wk = { class: "probe__head" }, Tk = { class: "probe__title" }, Ek = ["data-status"], Dk = { class: "probe__hint" }, Ok = {
	key: 0,
	class: "probe__summary"
}, kk = { class: "probe__actions" }, Ak = ["onClick"], jk = { key: 1 }, Mk = { class: "report-bar" }, Nk = { role: "status" }, Pk = /* @__PURE__ */ G({
	__name: "ProbeList",
	props: { ctx: {} },
	setup(e) {
		let t = e.ctx, n = rw(t), r = /* @__PURE__ */ H("");
		async function i() {
			return JSON.stringify(Yu(await $u(t)), null, 2);
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
		return (e, t) => (K(), ks("div", null, [
			(K(!0), ks(ys, null, Ta(U(n), (e) => (K(), ks("section", {
				key: e.id,
				class: "probe"
			}, [
				q("div", wk, [q("h3", Tk, ze(e.title), 1), q("span", {
					class: "trpg-badge",
					"data-status": U(Ku)[e.id]?.status ?? "idle"
				}, ze(U(Ku)[e.id]?.status ?? "待测"), 9, Ek)]),
				q("p", Dk, ze(e.hint), 1),
				U(Ku)[e.id] ? (K(), ks("p", Ok, ze(U(Ku)[e.id].summary), 1)) : Vs("", !0),
				q("div", kk, [(K(!0), ks(ys, null, Ta(e.actions, (e) => (K(), ks("button", {
					key: e.label,
					class: "trpg-btn",
					type: "button",
					onClick: (t) => e.run()
				}, ze(e.label), 9, Ak))), 128))]),
				U(Ku)[e.id]?.detail === void 0 ? Vs("", !0) : (K(), ks("details", jk, [t[2] ||= q("summary", null, "详情", -1), q("pre", null, ze(JSON.stringify(U(Ku)[e.id].detail, null, 2)), 1)]))
			]))), 128)),
			J(Ck),
			q("div", Mk, [
				q("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: t[0] ||= (e) => a()
				}, "复制测试报告"),
				q("button", {
					class: "trpg-btn",
					type: "button",
					onClick: t[1] ||= (e) => o()
				}, "保存报告到扩展设置"),
				q("span", Nk, ze(r.value), 1)
			])
		]));
	}
});
// src/ui/shell/storage.ts
function Fk(e, t) {
	try {
		let n = localStorage.getItem(e);
		if (!n) return t;
		let r = JSON.parse(n);
		return Number.isFinite(r.x) && Number.isFinite(r.y) ? r : t;
	} catch (e) {
		return console.warn("[trpg-assistant] 读取窗口位置失败", e), t;
	}
}
function Ik(e, t) {
	try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/useDrag.ts
function Lk(e, t, n) {
	return Math.min(Math.max(e, t), Math.max(t, n));
}
function Rk(e) {
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
				x: Lk(s.x + r, 0, window.innerWidth - l),
				y: Lk(s.y + i, 0, window.innerHeight - u)
			};
		}, u = (t) => {
			i.removeEventListener("pointermove", l), i.removeEventListener("pointerup", u), i.removeEventListener("pointercancel", u), i.hasPointerCapture(t.pointerId) && i.releasePointerCapture(t.pointerId), c ? e.onEnd?.() : e.onTap?.();
		};
		i.addEventListener("pointermove", l), i.addEventListener("pointerup", u), i.addEventListener("pointercancel", u);
	}
	return { onPointerDown: n };
}
// src/ui/ProbeApp.vue?vue&type=script&setup=true&lang.ts
var zk = { class: "trpg-root" }, Bk = { class: "trpg-window__body" }, Vk = 48, Hk = /* @__PURE__ */ G({
	__name: "ProbeApp",
	props: {
		ctx: {},
		portalTarget: {}
	},
	setup(e) {
		kr("portalTarget", e.portalTarget);
		let t = /* @__PURE__ */ H(!1), n = /* @__PURE__ */ H(Fk("trpg-assistant:ball", {
			x: 16,
			y: Math.round(window.innerHeight / 2)
		})), r = /* @__PURE__ */ H(Fk("trpg-assistant:win", {
			x: 16,
			y: 16
		})), i = /* @__PURE__ */ H(null), a = () => ({
			w: i.value?.offsetWidth ?? 440,
			h: i.value?.offsetHeight ?? 600
		});
		function o(e, t, n) {
			return {
				x: Math.min(Math.max(e.x, 0), Math.max(0, window.innerWidth - t)),
				y: Math.min(Math.max(e.y, 0), Math.max(0, window.innerHeight - n))
			};
		}
		function s() {
			if (n.value = o(n.value, Vk, Vk), t.value) {
				let { w: e, h: t } = a();
				r.value = o(r.value, e, t);
			}
		}
		ca(() => window.addEventListener("resize", s)), da(() => window.removeEventListener("resize", s)), Lr(t, (e) => {
			e && Promise.resolve().then(s);
		});
		let c = Rk({
			position: n,
			size: () => ({
				w: Vk,
				h: Vk
			}),
			onTap: () => {
				t.value = !t.value;
			},
			onEnd: () => Ik("trpg-assistant:ball", n.value)
		}), l = Rk({
			position: r,
			size: a,
			onEnd: () => Ik("trpg-assistant:win", r.value)
		}), u = Y(() => ({
			left: `${n.value.x}px`,
			top: `${n.value.y}px`
		})), d = Y(() => ({
			left: `${r.value.x}px`,
			top: `${r.value.y}px`
		}));
		return (n, r) => (K(), ks("div", zk, [q("button", {
			class: "trpg-ball",
			type: "button",
			"aria-label": "打开或关闭 TRPG 跑团助手",
			style: Ce(u.value),
			onPointerdown: r[0] ||= (...e) => U(c).onPointerDown && U(c).onPointerDown(...e)
		}, "⚄", 36), t.value ? (K(), ks("section", {
			key: 0,
			ref_key: "winEl",
			ref: i,
			class: "trpg-window",
			style: Ce(d.value),
			role: "dialog",
			"aria-label": "TRPG 跑团助手 M0 探针"
		}, [q("header", {
			class: "trpg-window__head",
			onPointerdown: r[2] ||= (...e) => U(l).onPointerDown && U(l).onPointerDown(...e)
		}, [r[3] ||= q("span", null, "TRPG 跑团助手 · M0 探针", -1), q("button", {
			class: "trpg-icon-btn",
			type: "button",
			"aria-label": "关闭",
			onClick: r[1] ||= (e) => t.value = !1
		}, "✕")], 32), q("div", Bk, [J(Pk, { ctx: e.ctx }, null, 8, ["ctx"])])], 4)) : Vs("", !0)]));
	}
}), Uk = ".trpg-btn{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);min-height:36px;color:var(--ink);font:inherit;cursor:pointer;padding:4px 12px}.trpg-btn:hover{border-color:var(--primary)}.trpg-btn:focus-visible,.trpg-select-trigger:focus-visible,.trpg-input:focus-visible{outline:2px solid var(--primary);outline-offset:1px}.trpg-btn--primary{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-input{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);font:inherit;padding:4px 8px}.trpg-select-trigger{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);font:inherit;cursor:pointer;justify-content:space-between;align-items:center;gap:8px;padding:4px 10px;display:inline-flex}.trpg-select-content{min-width:var(--reka-select-trigger-width);max-height:min(8 * 36px, var(--reka-select-content-available-height));background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);z-index:100001;overflow:hidden;box-shadow:0 6px 18px #0000004d}.trpg-select-viewport{max-height:inherit;padding:4px;overflow-y:auto}.trpg-select-item{cursor:pointer;min-height:36px;color:var(--ink);border-radius:4px;align-items:center;padding:4px 8px;display:flex}.trpg-select-item[data-highlighted]{background:var(--panel);outline:none}.trpg-select-item[data-state=checked]{color:var(--primary);font-weight:600}.trpg-seg{border:1px solid var(--line);border-radius:var(--radius-sm);display:inline-flex;overflow:hidden}.trpg-seg button{background:var(--card);min-height:32px;color:var(--ink);font:inherit;cursor:pointer;border:0;padding:2px 12px}.trpg-seg button+button{border-left:1px solid var(--line)}.trpg-seg button[aria-pressed=true]{background:var(--primary);color:var(--primary-ink)}.trpg-badge{background:var(--panel);border:1px solid var(--line);color:var(--ink-2);border-radius:4px;padding:0 8px;font-size:12px;font-weight:600;display:inline-block}.trpg-badge[data-status=pass]{color:var(--ok);border-color:var(--ok)}.trpg-badge[data-status=fail],.trpg-badge[data-status=error]{color:var(--danger);border-color:var(--danger)}.trpg-badge[data-status=waiting]{color:var(--gold);border-color:var(--gold)}.trpg-check{cursor:pointer;align-items:center;gap:8px;min-height:36px;display:flex}.trpg-check input{width:18px;height:18px;accent-color:var(--primary)}", Wk = ".probe{border-bottom:1px solid var(--line);padding:10px 0}.probe__head{justify-content:space-between;align-items:center;gap:8px;display:flex}.probe__title{font-family:var(--font-serif);margin:0;font-size:15px}.probe__hint{color:var(--ink-2);margin:4px 0;font-size:12.5px}.probe__summary{margin:4px 0}.probe__actions{flex-wrap:wrap;gap:6px;margin-top:6px;display:flex}.probe pre{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);white-space:pre-wrap;word-break:break-all;max-height:200px;margin:6px 0 0;padding:8px;font-size:11.5px;overflow:auto}.probe summary{cursor:pointer;color:var(--ink-2);font-size:12.5px}.lab{background:var(--panel);border-radius:var(--radius);gap:10px;margin-top:8px;padding:10px;display:grid}.lab__row{gap:6px;display:grid}.report-bar{background:var(--paper);flex-wrap:wrap;gap:8px;padding:10px 0;display:flex;position:sticky;bottom:-12px}", Gk = ".trpg-root{z-index:100000;width:0;height:0;position:fixed;top:0;left:0}.trpg-ball{border:2px solid var(--gold);background:var(--primary);width:48px;height:48px;color:var(--primary-ink);cursor:grab;touch-action:none;border-radius:50%;font-size:22px;position:fixed;box-shadow:0 2px 8px #00000059}.trpg-window{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);flex-direction:column;width:min(92vw,440px);height:min(80vh,640px);display:flex;position:fixed;overflow:hidden;box-shadow:0 8px 28px #0006}.trpg-window__head{background:var(--primary);color:var(--primary-ink);font-family:var(--font-serif);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;justify-content:space-between;align-items:center;gap:8px;padding:8px 12px;font-size:16px;display:flex}.trpg-window__body{flex:1;padding:12px;overflow-y:auto}.trpg-icon-btn{border-radius:var(--radius-sm);min-width:32px;min-height:32px;color:inherit;cursor:pointer;background:0 0;border:1px solid #0000;font-size:16px}.trpg-icon-btn:hover{border-color:currentColor}", Kk = ":host{all:initial;pointer-events:inherit;--paper:#f4ecdd;--panel:#eee5d3;--card:#fffcf6;--line:#cbbca3;--ink:#2b211c;--ink-2:#6c6255;--primary:#7a2e26;--primary-ink:#fffcf6;--gold:#b8954a;--danger:#a3352b;--ok:#3f7a3a;--radius:8px;--radius-sm:6px;--font-serif:\"Songti SC\", \"Noto Serif SC\", Georgia, serif;--font-sans:\"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;font-family:var(--font-sans);color:var(--ink);font-size:14px;line-height:1.5}@media (prefers-color-scheme:dark){:host{--paper:#20231f;--panel:#2b3029;--card:#181c18;--line:#515849;--ink:#f1ebdc;--ink-2:#bcbbaa;--primary:#e6bf73;--primary-ink:#20231f;--gold:#e6bf73;--danger:#e07a6e;--ok:#8cc47f}}*,:before,:after{box-sizing:border-box}", qk = "trpg-assistant-root";
function Jk(e) {
	if (document.getElementById(qk)) return;
	let t = document.createElement("div");
	t.id = qk;
	let n = t.attachShadow({ mode: "open" }), r = document.createElement("style");
	r.textContent = [
		Kk,
		Gk,
		Uk,
		Wk
	].join("\n");
	let i = document.createElement("div");
	i.className = "trpg-portal";
	let a = document.createElement("div");
	n.append(r, a, i), document.body.appendChild(t), Ru(Hk, {
		ctx: e,
		portalTarget: i
	}).mount(a);
}
// src/main.ts
async function Yk() {
	window.__trpgAssistantBooted || (window.__trpgAssistantBooted = !0, await p(), Jk(d()));
}
Yk().catch((e) => {
	window.__trpgAssistantBooted = !1, console.error("[trpg-assistant] 启动失败", e);
});
