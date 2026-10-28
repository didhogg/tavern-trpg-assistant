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
}, D = Object.prototype.hasOwnProperty, O = (e, t) => D.call(e, t), k = Array.isArray, ee = (e) => oe(e) === "[object Map]", te = (e) => oe(e) === "[object Set]", ne = (e) => oe(e) === "[object Date]", A = (e) => oe(e) === "[object RegExp]", j = (e) => typeof e == "function", M = (e) => typeof e == "string", re = (e) => typeof e == "symbol", N = (e) => typeof e == "object" && !!e, ie = (e) => (N(e) || j(e)) && j(e.then) && j(e.catch), ae = Object.prototype.toString, oe = (e) => ae.call(e), se = (e) => oe(e).slice(8, -1), ce = (e) => oe(e) === "[object Object]", le = (e) => M(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, ue = /* @__PURE__ */ v(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), de = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, fe = /-\w/g, pe = de((e) => e.replace(fe, (e) => e.slice(1).toUpperCase())), me = /\B([A-Z])/g, he = de((e) => e.replace(me, "-$1").toLowerCase()), ge = de((e) => e.charAt(0).toUpperCase() + e.slice(1)), _e = de((e) => e ? `on${ge(e)}` : ""), ve = (e, t) => !Object.is(e, t), P = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, ye = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, be = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, xe = (e) => {
	let t = M(e) ? Number(e) : NaN;
	return isNaN(t) ? e : t;
}, Se, Ce = () => Se ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {}, we = /* @__PURE__ */ v("Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol");
function Te(e) {
	if (k(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = M(r) ? ke(r) : Te(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (M(e) || N(e)) return e;
}
var Ee = /;(?![^(]*\))/g, De = /:([^]+)/, Oe = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function ke(e) {
	let t = {};
	return e.replace(Oe, (e) => e.startsWith("/*") ? "" : e).split(Ee).forEach((e) => {
		if (e) {
			let n = e.split(De);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function Ae(e) {
	let t = "";
	if (M(e)) t = e;
	else if (k(e)) for (let n = 0; n < e.length; n++) {
		let r = Ae(e[n]);
		r && (t += r + " ");
	}
	else if (N(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
function je(e) {
	if (!e) return null;
	let { class: t, style: n } = e;
	return t && !M(t) && (e.class = Ae(t)), n && (e.style = Te(n)), e;
}
var Me = /* @__PURE__ */ v("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function Ne(e) {
	return !!e || e === "";
}
function Pe(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = Re(e[i], t[i], n);
	return r;
}
function Fe(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && Re(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function Ie(e, t, n) {
	let r = ee(e), i = ee(t);
	if (r || i || (r = te(e), i = te(t), r || i)) return r && i ? Fe(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !Re(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function Le(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function Re(e, t, n) {
	if (e === t) return !0;
	let r = ne(e), i = ne(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = re(e), i = re(t), r || i ? e === t : (r = k(e), i = k(t), r || i ? r && i ? Le(e, t, n, Pe) : !1 : (r = N(e), i = N(t), r || i ? !r || !i ? !1 : Le(e, t, n, Ie) : String(e) === String(t))));
}
function ze(e, t) {
	return e.findIndex((e) => Re(e, t));
}
var Be = (e) => !!(e && e.__v_isRef === !0), F = (e) => M(e) ? e : e == null ? "" : k(e) || N(e) && (e.toString === ae || !j(e.toString)) ? Be(e) ? F(e.value) : JSON.stringify(e, Ve, 2) : String(e), Ve = (e, t) => Be(t) ? Ve(e, t.value) : ee(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[He(t, r) + " =>"] = n, e), {}) } : te(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => He(e)) } : re(t) ? He(t) : N(t) && !k(t) && !ce(t) ? String(t) : t, He = (e, t = "") => re(e) ? `Symbol(${e.description ?? t})` : e;
function Ue(e) {
	return e == null ? "initial" : typeof e == "string" ? e === "" ? " " : e : String(e);
}
// node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var We, Ge = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && We && (We.active ? (this.parent = We, this.index = (We.scopes || (We.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = We;
			try {
				return We = this, e();
			} finally {
				We = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = We, We = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (We === this) We = this.prevScope;
			else {
				let e = We;
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
function Ke(e) {
	return new Ge(e);
}
function qe() {
	return We;
}
function Je(e, t = !1) {
	We && We.cleanups.push(e);
}
var I, Ye = /* @__PURE__ */ new WeakSet(), Xe = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, We && (We.active ? We.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, Ye.has(this) && (Ye.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || $e(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, mt(this), nt(this);
		let e = I, t = ut;
		I = this, ut = !0;
		try {
			return this.fn();
		} finally {
			rt(this), I = e, ut = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) ot(e);
			this.deps = this.depsTail = void 0, mt(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? Ye.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		it(this) && this.run();
	}
	get dirty() {
		return it(this);
	}
}, Ze = 0, L, Qe;
function $e(e, t = !1) {
	e.flags |= 8, t ? (e.next = Qe, Qe = e) : (e.next = L, L = e);
}
function et() {
	Ze++;
}
function tt() {
	if (--Ze > 0) return;
	if (Qe) {
		let e = Qe;
		for (Qe = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; L;) {
		let t = L;
		for (L = void 0; t;) {
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
function nt(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function rt(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), ot(r), st(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function it(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (at(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function at(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === ht) || (e.globalVersion = ht, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !it(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = I, r = ut;
	I = e, ut = !0;
	try {
		nt(e);
		let n = e.fn(e._value);
		(t.version === 0 || ve(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		I = n, ut = r, rt(e), e.flags &= -3;
	}
}
function ot(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) ot(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function st(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
function ct(e, t) {
	e.effect instanceof Xe && (e = e.effect.fn);
	let n = new Xe(e);
	t && T(n, t);
	try {
		n.run();
	} catch (e) {
		throw n.stop(), e;
	}
	let r = n.run.bind(n);
	return r.effect = n, r;
}
function lt(e) {
	e.effect.stop();
}
var ut = !0, dt = [];
function ft() {
	dt.push(ut), ut = !1;
}
function pt() {
	let e = dt.pop();
	ut = e === void 0 || e;
}
function mt(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = I;
		I = void 0;
		try {
			t();
		} finally {
			I = e;
		}
	}
}
var ht = 0, gt = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, _t = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!I || !ut || I === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== I) t = this.activeLink = new gt(I, this), I.deps ? (t.prevDep = I.depsTail, I.depsTail.nextDep = t, I.depsTail = t) : I.deps = I.depsTail = t, vt(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = I.depsTail, t.nextDep = void 0, I.depsTail.nextDep = t, I.depsTail = t, I.deps === t && (I.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, ht++, this.notify(e);
	}
	notify(e) {
		et();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			tt();
		}
	}
};
function vt(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) vt(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var yt = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ Symbol(""), xt = /* @__PURE__ */ Symbol(""), St = /* @__PURE__ */ Symbol("");
function Ct(e, t, n) {
	if (ut && I) {
		let t = yt.get(e);
		t || yt.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new _t()), r.map = t, r.key = n), r.track();
	}
}
function wt(e, t, n, r, i, a) {
	let o = yt.get(e);
	if (!o) {
		ht++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (et(), t === "clear") o.forEach(s);
	else {
		let i = k(e), a = i && le(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === St || !re(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(St)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(bt)), ee(e) && s(o.get(xt)));
				break;
			case "delete":
				i || (s(o.get(bt)), ee(e) && s(o.get(xt)));
				break;
			case "set": ee(e) && s(o.get(bt));
		}
	}
	tt();
}
function Tt(e, t) {
	let n = yt.get(e);
	return n && n.get(t);
}
function Et(e) {
	let t = /* @__PURE__ */ R(e);
	return t === e || (Ct(t, "iterate", St), /* @__PURE__ */ gn(e)) ? t : /* @__PURE__ */ hn(e) ? /* @__PURE__ */ mn(e) ? t.map((e) => bn(yn(e))) : t.map(bn) : t.map(yn);
}
function Dt(e) {
	return Ct(e = /* @__PURE__ */ R(e), "iterate", St), e;
}
function Ot(e, t) {
	return /* @__PURE__ */ hn(e) ? bn(/* @__PURE__ */ mn(e) ? yn(t) : t) : yn(t);
}
var kt = {
	__proto__: null,
	[Symbol.iterator]() {
		return At(this, Symbol.iterator, (e) => Ot(this, e));
	},
	concat(...e) {
		return Et(this).concat(...e.map((e) => k(e) ? Et(e) : e));
	},
	entries() {
		return At(this, "entries", (e) => (e[1] = Ot(this, e[1]), e));
	},
	every(e, t) {
		return Nt(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return Nt(this, "filter", e, t, (e) => e.map((e) => Ot(this, e)), arguments);
	},
	find(e, t) {
		return Nt(this, "find", e, t, (e) => Ot(this, e), arguments);
	},
	findIndex(e, t) {
		return Nt(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return Nt(this, "findLast", e, t, (e) => Ot(this, e), arguments);
	},
	findLastIndex(e, t) {
		return Nt(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return Nt(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return Ft(this, "includes", e);
	},
	indexOf(...e) {
		return Ft(this, "indexOf", e);
	},
	join(e) {
		return Et(this).join(e);
	},
	lastIndexOf(...e) {
		return Ft(this, "lastIndexOf", e);
	},
	map(e, t) {
		return Nt(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return It(this, "pop");
	},
	push(...e) {
		return It(this, "push", e);
	},
	reduce(e, ...t) {
		return Pt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return Pt(this, "reduceRight", e, t);
	},
	shift() {
		return It(this, "shift");
	},
	some(e, t) {
		return Nt(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return It(this, "splice", e);
	},
	toReversed() {
		return Et(this).toReversed();
	},
	toSorted(e) {
		return Et(this).toSorted(e);
	},
	toSpliced(...e) {
		return Et(this).toSpliced(...e);
	},
	unshift(...e) {
		return It(this, "unshift", e);
	},
	values() {
		return At(this, "values", (e) => Ot(this, e));
	}
};
function At(e, t, n) {
	let r = Dt(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ gn(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => jt(a.next(), n), i !== Mt[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => jt(a._next(), n);
	}
	return a;
}
function jt(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var Mt = Array.prototype;
function Nt(e, t, n, r, i, a) {
	let o = Dt(e), s = o !== e && !/* @__PURE__ */ gn(e), c = o[t];
	if (c !== Mt[t]) {
		let t = c.apply(e, a);
		return s ? yn(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, Ot(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function Pt(e, t, n, r) {
	let i = Dt(e), a = i !== e && !/* @__PURE__ */ gn(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = Ot(e, t)), n.call(this, t, Ot(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? Ot(e, c) : c;
}
function Ft(e, t, n) {
	let r = /* @__PURE__ */ R(e);
	Ct(r, "iterate", St);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ _n(n[0]) ? (n[0] = /* @__PURE__ */ R(n[0]), r[t](...n)) : i;
}
function It(e, t, n = []) {
	ft(), et();
	let r = (/* @__PURE__ */ R(e))[t].apply(e, n);
	return tt(), pt(), r;
}
var Lt = /* @__PURE__ */ v("__proto__,__v_isRef,__isVue"), Rt = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(re));
function zt(e) {
	re(e) || (e = String(e));
	let t = /* @__PURE__ */ R(this);
	return Ct(t, "has", e), t.hasOwnProperty(e);
}
var Bt = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? sn : on : i ? an : rn).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = k(e);
		if (!r) {
			let e;
			if (a && (e = kt[t])) return e;
			if (t === "hasOwnProperty") return zt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ xn(e) ? e : n);
		if ((re(t) ? Rt.has(t) : Lt(t)) || (r || Ct(e, "get", t), i)) return o;
		if (/* @__PURE__ */ xn(o)) {
			let e = a && le(t) ? o : o.value;
			return r && N(e) ? /* @__PURE__ */ dn(e) : e;
		}
		return N(o) ? r ? /* @__PURE__ */ dn(o) : /* @__PURE__ */ ln(o) : o;
	}
}, Vt = class extends Bt {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = k(e) && le(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ hn(i);
			if (!/* @__PURE__ */ gn(n) && !/* @__PURE__ */ hn(n) && (i = /* @__PURE__ */ R(i), n = /* @__PURE__ */ R(n)), !a && /* @__PURE__ */ xn(i) && !/* @__PURE__ */ xn(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : O(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ xn(e) ? e : r);
		return e === /* @__PURE__ */ R(r) && s && (o ? ve(n, i) && wt(e, "set", t, n, i) : wt(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = O(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && wt(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return re(t) && Rt.has(t) || Ct(e, "has", t), n;
	}
	ownKeys(e) {
		return Ct(e, "iterate", k(e) ? "length" : bt), Reflect.ownKeys(e);
	}
}, Ht = class extends Bt {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, Ut = /* @__PURE__ */ new Vt(), Wt = /* @__PURE__ */ new Ht(), Gt = /* @__PURE__ */ new Vt(!0), Kt = /* @__PURE__ */ new Ht(!0), qt = (e) => e, Jt = (e) => Reflect.getPrototypeOf(e);
function Yt(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ R(i), o = ee(a), s = e === "entries" || e === Symbol.iterator && o, c = e === "keys" && o, l = i[e](...r), u = n ? qt : t ? bn : yn;
		return !t && Ct(a, "iterate", c ? xt : bt), T(Object.create(l), { next() {
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
function Xt(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function Zt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ R(r), a = /* @__PURE__ */ R(n);
			e || (ve(n, a) && Ct(i, "get", n), Ct(i, "get", a));
			let { has: o } = Jt(i), s = t ? qt : e ? bn : yn;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && Ct(/* @__PURE__ */ R(t), "iterate", bt), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ R(n), i = /* @__PURE__ */ R(t);
			return e || (ve(t, i) && Ct(r, "has", t), Ct(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ R(a), s = t ? qt : e ? bn : yn;
			return !e && Ct(o, "iterate", bt), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return T(n, e ? {
		add: Xt("add"),
		set: Xt("set"),
		delete: Xt("delete"),
		clear: Xt("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ R(this), r = Jt(n), i = /* @__PURE__ */ R(e), a = !t && !/* @__PURE__ */ gn(e) && !/* @__PURE__ */ hn(e) ? i : e;
			return r.has.call(n, a) || ve(e, a) && r.has.call(n, e) || ve(i, a) && r.has.call(n, i) || (n.add(a), wt(n, "add", a, a)), this;
		},
		set(e, n) {
			t || /* @__PURE__ */ gn(n) || /* @__PURE__ */ hn(n) || (n = /* @__PURE__ */ R(n));
			let r = /* @__PURE__ */ R(this), { has: i, get: a } = Jt(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ R(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? ve(n, s) && wt(r, "set", e, n, s) : wt(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ R(this), { has: n, get: r } = Jt(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ R(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && wt(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ R(this), t = e.size !== 0, n = e.clear();
			return t && wt(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = Yt(r, e, t);
	}), n;
}
function Qt(e, t) {
	let n = Zt(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(O(n, i) && i in r ? n : r, i, a);
}
var $t = { get: /* @__PURE__ */ Qt(!1, !1) }, en = { get: /* @__PURE__ */ Qt(!1, !0) }, tn = { get: /* @__PURE__ */ Qt(!0, !1) }, nn = { get: /* @__PURE__ */ Qt(!0, !0) }, rn = /* @__PURE__ */ new WeakMap(), an = /* @__PURE__ */ new WeakMap(), on = /* @__PURE__ */ new WeakMap(), sn = /* @__PURE__ */ new WeakMap();
function cn(e) {
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
function ln(e) {
	return /* @__PURE__ */ hn(e) ? e : pn(e, !1, Ut, $t, rn);
}
// @__NO_SIDE_EFFECTS__
function un(e) {
	return pn(e, !1, Gt, en, an);
}
// @__NO_SIDE_EFFECTS__
function dn(e) {
	return pn(e, !0, Wt, tn, on);
}
// @__NO_SIDE_EFFECTS__
function fn(e) {
	return pn(e, !0, Kt, nn, sn);
}
function pn(e, t, n, r, i) {
	if (!N(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = cn(se(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function mn(e) {
	return /* @__PURE__ */ hn(e) ? /* @__PURE__ */ mn(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function hn(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function gn(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function _n(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function R(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ R(t) : e;
}
function vn(e) {
	return !O(e, "__v_skip") && Object.isExtensible(e) && ye(e, "__v_skip", !0), e;
}
var yn = (e) => N(e) ? /* @__PURE__ */ ln(e) : e, bn = (e) => N(e) ? /* @__PURE__ */ dn(e) : e;
// @__NO_SIDE_EFFECTS__
function xn(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function z(e) {
	return Cn(e, !1);
}
// @__NO_SIDE_EFFECTS__
function Sn(e) {
	return Cn(e, !0);
}
function Cn(e, t) {
	return /* @__PURE__ */ xn(e) ? e : new wn(e, t);
}
var wn = class {
	constructor(e, t) {
		this.dep = new _t(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ R(e), this._value = t ? e : yn(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ gn(e) || /* @__PURE__ */ hn(e);
		e = n ? e : /* @__PURE__ */ R(e), ve(e, t) && (this._rawValue = e, this._value = n ? e : yn(e), this.dep.trigger());
	}
};
function Tn(e) {
	e.dep && e.dep.trigger();
}
function B(e) {
	return /* @__PURE__ */ xn(e) ? e.value : e;
}
function En(e) {
	return j(e) ? e() : B(e);
}
var Dn = {
	get: (e, t, n) => t === "__v_raw" ? e : B(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ xn(i) && !/* @__PURE__ */ xn(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function On(e) {
	return /* @__PURE__ */ mn(e) ? e : new Proxy(e, Dn);
}
var kn = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new _t(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function An(e) {
	return new kn(e);
}
// @__NO_SIDE_EFFECTS__
function jn(e) {
	let t = k(e) ? Array(e.length) : {};
	for (let n in e) t[n] = Fn(e, n);
	return t;
}
var Mn = class {
	constructor(e, t, n) {
		this._object = e, this._defaultValue = n, this.__v_isRef = !0, this._value = void 0, this._key = re(t) ? t : String(t), this._raw = /* @__PURE__ */ R(e);
		let r = !0, i = e;
		if (!k(e) || re(this._key) || !le(this._key)) do
			r = !/* @__PURE__ */ _n(i) || /* @__PURE__ */ gn(i);
		while (r && (i = i.__v_raw));
		this._shallow = r;
	}
	get value() {
		let e = this._object[this._key];
		return this._shallow && (e = B(e)), this._value = e === void 0 ? this._defaultValue : e;
	}
	set value(e) {
		if (this._shallow && /* @__PURE__ */ xn(this._raw[this._key])) {
			let t = this._object[this._key];
			if (/* @__PURE__ */ xn(t)) {
				t.value = e;
				return;
			}
		}
		this._object[this._key] = e;
	}
	get dep() {
		return Tt(this._raw, this._key);
	}
}, Nn = class {
	constructor(e) {
		this._getter = e, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
	}
	get value() {
		return this._value = this._getter();
	}
};
// @__NO_SIDE_EFFECTS__
function Pn(e, t, n) {
	return /* @__PURE__ */ xn(e) ? e : j(e) ? new Nn(e) : N(e) && arguments.length > 1 ? Fn(e, t, n) : /* @__PURE__ */ z(e);
}
function Fn(e, t, n) {
	return new Mn(e, t, n);
}
var In = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new _t(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = ht - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && I !== this) return $e(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return at(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function Ln(e, t, n = !1) {
	let r, i;
	return j(e) ? r = e : (r = e.get, i = e.set), new In(r, i, n);
}
var Rn = {
	GET: "get",
	HAS: "has",
	ITERATE: "iterate"
}, zn = {
	SET: "set",
	ADD: "add",
	DELETE: "delete",
	CLEAR: "clear"
}, Bn = {}, Vn = /* @__PURE__ */ new WeakMap(), Hn = void 0;
function Un() {
	return Hn;
}
function Wn(e, t = !1, n = Hn) {
	if (n) {
		let t = Vn.get(n);
		t || Vn.set(n, t = []), t.push(e);
	}
}
function Gn(e, t, n = y) {
	let { immediate: r, deep: i, once: a, scheduler: o, augmentJob: s, call: c } = n, l = (e) => i ? e : /* @__PURE__ */ gn(e) || i === !1 || i === 0 ? Kn(e, 1) : Kn(e), u, d, f, p, m = !1, h = !1;
	if (/* @__PURE__ */ xn(e) ? (d = () => e.value, m = /* @__PURE__ */ gn(e)) : /* @__PURE__ */ mn(e) ? (d = () => l(e), m = !0) : k(e) ? (h = !0, m = e.some((e) => /* @__PURE__ */ mn(e) || /* @__PURE__ */ gn(e)), d = () => e.map((e) => {
		if (/* @__PURE__ */ xn(e)) return e.value;
		if (/* @__PURE__ */ mn(e)) return l(e);
		if (j(e)) return c ? c(e, 2) : e();
	})) : d = j(e) ? t ? c ? () => c(e, 2) : e : () => {
		if (f) {
			ft();
			try {
				f();
			} finally {
				pt();
			}
		}
		let t = Hn;
		Hn = u;
		try {
			return c ? c(e, 3, [p]) : e(p);
		} finally {
			Hn = t;
		}
	} : x, t && i) {
		let e = d, t = i === !0 ? Infinity : i;
		d = () => Kn(e(), t);
	}
	let g = qe(), _ = () => {
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
	let v = h ? Array(e.length).fill(Bn) : Bn, b = (e) => {
		if (u.flags & 1 && (u.dirty || e)) {
			if (t) {
				let n = u.run();
				if (e || i || m || (h ? n.some((e, t) => ve(e, v[t])) : ve(n, v))) {
					let e = Hn;
					ft();
					try {
						f && f(), Hn = u;
						let e = [
							n,
							v === Bn ? void 0 : h && v[0] === Bn ? [] : v,
							p
						];
						v = n, c ? c(t, 3, e) : t(...e);
					} finally {
						Hn = e, pt();
					}
				}
			} else u.run();
		}
	};
	return s && s(b), u = new Xe(d), u.scheduler = o ? () => o(b, !1) : b, p = (e) => Wn(e, !1, u), f = u.onStop = () => {
		let e = Vn.get(u);
		if (e) {
			if (c) c(e, 4);
			else for (let t of e) t();
			Vn.delete(u);
		}
	}, t ? r ? b(!0) : v = u.run() : o ? o(b.bind(null, !0), !0) : u.run(), _.pause = u.pause.bind(u), _.resume = u.resume.bind(u), _.stop = _, _;
}
function Kn(e, t = Infinity, n) {
	if (t <= 0 || !N(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ xn(e)) Kn(e.value, t, n);
	else if (k(e)) for (let r = 0; r < e.length; r++) Kn(e[r], t, n);
	else if (te(e) || ee(e)) e.forEach((e) => {
		Kn(e, t, n);
	});
	else if (ce(e)) {
		for (let r in e) Kn(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && Kn(e[r], t, n);
	}
	return e;
}
// node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var qn = [];
function Jn(e) {
	qn.push(e);
}
function Yn() {
	qn.pop();
}
function Xn(e, t) {}
var Zn = {
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
}, Qn = {
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
function $n(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		tr(e, t, n);
	}
}
function er(e, t, n, r) {
	if (j(e)) {
		let i = $n(e, t, n, r);
		return i && ie(i) && i.catch((e) => {
			tr(e, t, n);
		}), i;
	}
	if (k(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(er(e[a], t, n, r));
		return i;
	}
}
function tr(e, t, n, r = !0) {
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
			ft(), $n(a, null, 10, [
				e,
				i,
				o
			]), pt();
			return;
		}
	}
	nr(e, n, i, r, o);
}
function nr(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var rr = [], ir = -1, ar = [], or = null, sr = 0, cr = /* @__PURE__ */ Promise.resolve(), lr = null;
function ur(e) {
	let t = lr || cr;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function dr(e) {
	let t = ir + 1, n = rr.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = rr[r], a = yr(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function fr(e) {
	if (!(e.flags & 1)) {
		let t = yr(e), n = rr[rr.length - 1];
		!n || !(e.flags & 2) && t >= yr(n) ? rr.push(e) : rr.splice(dr(t), 0, e), e.flags |= 1, pr();
	}
}
function pr() {
	lr ||= cr.then(br);
}
function mr(e) {
	if (!k(e)) or && e.id === -1 ? or.splice(sr + 1, 0, e) : e.flags & 1 || (ar.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) ar.push(e[t]);
	pr();
}
function hr(e, t, n, r = ir + 1) {
	for (; r < rr.length; r++) {
		let n = rr[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			rr.splice(r, 1), r = e ? r - 1 : ir, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function gr(e, t, n = 0) {
	if (ar.length) {
		let e = ar, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < ar.length; i++) {
				let a = ar[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? ar[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => yr(e) - yr(t));
		if (ar.length = r, or) {
			for (let e = 0; e < i.length; e++) or.push(i[e]);
			return;
		}
		for (or = i, sr = 0; sr < or.length; sr++) {
			let e = or[sr];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		or = null, sr = 0;
	}
}
var _r = !1;
function vr(e, t) {
	if (_r) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(ar);
	e(), _r = !0;
	try {
		hr(void 0, t), gr(void 0, n, t);
	} finally {
		_r = !1;
	}
}
var yr = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function br(e) {
	try {
		for (ir = 0; ir < rr.length; ir++) {
			let e = rr[ir];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), $n(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; ir < rr.length; ir++) {
			let e = rr[ir];
			e && (e.flags &= -2);
		}
		ir = -1, rr.length = 0, gr(e), lr = null, (rr.length || ar.length) && br(e);
	}
}
var xr, Sr = [];
function Cr(e, t) {
	xr = e, xr ? (xr.enabled = !0, Sr.forEach(({ event: e, args: t }) => xr.emit(e, ...t)), Sr = []) : typeof window < "u" && window.HTMLElement && !(window.navigator?.userAgent)?.includes("jsdom") ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((e) => {
		Cr(e, t);
	}), setTimeout(() => {
		xr || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, Sr = []);
	}, 3e3)) : Sr = [];
}
var wr = null, Tr = null;
function Er(e) {
	let t = wr;
	return wr = e, Tr = e && e.type.__scopeId || null, t;
}
function Dr(e) {
	Tr = e;
}
function Or() {
	Tr = null;
}
var kr = (e) => V;
function V(e, t = wr, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && ks(-1);
		let i = Er(t), a = Ts.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Ts.length; e > a; e--) Ds();
			Er(i), r._d && ks(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function Ar(e, t) {
	if (wr === null) return e;
	let n = hc(wr), r = e.dirs ||= [];
	for (let e = 0; e < t.length; e++) {
		let [i, a, o, s = y] = t[e];
		i && (j(i) && (i = {
			mounted: i,
			updated: i
		}), i.deep && Kn(a), r.push({
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
function jr(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (ft(), er(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), pt());
	}
}
function Mr(e, t) {
	if (Zs) {
		let n = Zs.provides, r = Zs.parent && Zs.parent.provides;
		r === n && (n = Zs.provides = Object.create(r)), n[e] = t;
	}
}
function Nr(e, t, n = !1) {
	let r = Qs();
	if (r || _o) {
		let i = _o ? _o._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && j(t) ? t.call(r && r.proxy) : t;
	}
}
function Pr() {
	return !!(Qs() || _o);
}
var Fr = /* @__PURE__ */ Symbol.for("v-scx"), Ir = () => Nr(Fr);
function Lr(e, t) {
	return Vr(e, null, t);
}
function Rr(e, t) {
	return Vr(e, null, { flush: "post" });
}
function zr(e, t) {
	return Vr(e, null, { flush: "sync" });
}
function Br(e, t, n) {
	return Vr(e, t, n);
}
function Vr(e, t, n = y) {
	let { immediate: r, deep: i, flush: a, once: o } = n, s = T({}, n), c = t && r || !t && a !== "post", l;
	if (ic) {
		if (a === "sync") {
			let e = Ir();
			l = e.__watcherHandles ||= [];
		} else if (!c) {
			let e = () => {};
			return e.stop = x, e.resume = x, e.pause = x, e;
		}
	}
	let u = Zs;
	s.call = (e, t, n) => er(e, u, t, n);
	let d = !1;
	a === "post" ? s.scheduler = (e) => {
		e.i = u, Xo(e, u && u.suspense);
	} : a !== "sync" && (d = !0, s.scheduler = (e, t) => {
		t ? e() : fr(e);
	}), s.augmentJob = (e) => {
		t && (e.flags |= 4), d && (e.flags |= 2, u && (e.id = u.uid, e.i = u));
	};
	let f = Gn(e, t, s);
	return ic && (l ? l.push(f) : c && f()), f;
}
function Hr(e, t, n) {
	let r = this.proxy, i = M(e) ? e.includes(".") ? Ur(r, e) : () => r[e] : e.bind(r, r), a;
	j(t) ? a = t : (a = t.handler, n = t);
	let o = tc(this), s = Vr(i, a.bind(r), n);
	return o(), s;
}
function Ur(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Wr = /* @__PURE__ */ new WeakMap(), Gr = /* @__PURE__ */ Symbol("_vte"), Kr = (e) => e.__isTeleport, qr = (e) => e && (e.disabled || e.disabled === ""), Jr = (e) => e && (e.defer || e.defer === ""), Yr = (e) => typeof SVGElement < "u" && e instanceof SVGElement, Xr = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Zr = (e, t) => {
	let n = e && e.to;
	return M(n) ? t ? t(n) : null : n;
}, Qr = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = qr(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = qr(e.props), r = e.target = Zr(e.props, m), a = ri(r, e, h, p);
			r && (o !== "svg" && Yr(r) ? o = "svg" : o !== "mathml" && Xr(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), ni(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (Wr.get(e) === t) {
					if (Wr.delete(e), qr(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), ni(e, !0);
					}
					x(e);
				}
			};
			Wr.set(e, t), Xo(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), Jr(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), ni(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Wr.get(e);
			if (u) {
				u.flags |= 8, Wr.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = qr(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || Yr(p) ? o = "svg" : (o === "mathml" || Xr(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), rs(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : $r(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = Zr(t.props, m);
				e && (t.target = e, $r(t, e, null, l, 0));
			} else g && $r(t, p, h, l, 1);
			ni(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = qr(f), m = a || !p, h = Wr.get(e);
		if (h && (h.flags |= 8, Wr.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: $r,
	hydrate: ei
};
function $r(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Wr.has(e) && (!d || qr(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function ei(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
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
	let m = t.target = Zr(t.props, c), h = qr(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || ri(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || ri(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), ni(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var ti = Qr;
function ni(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function ri(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Gr] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var ii = /* @__PURE__ */ Symbol("_leaveCb"), ai = /* @__PURE__ */ Symbol("_enterCb");
function oi() {
	let e = {
		isMounted: !1,
		isLeaving: !1,
		isUnmounting: !1,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	return da(() => {
		e.isMounted = !0;
	}), ma(() => {
		e.isUnmounting = !0;
	}), e;
}
var si = [Function, Array], ci = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: si,
	onEnter: si,
	onAfterEnter: si,
	onEnterCancelled: si,
	onBeforeLeave: si,
	onLeave: si,
	onAfterLeave: si,
	onLeaveCancelled: si,
	onBeforeAppear: si,
	onAppear: si,
	onAfterAppear: si,
	onAppearCancelled: si
}, li = {
	name: "BaseTransition",
	props: ci,
	setup(e, { slots: t }) {
		let n = Qs(), r = oi();
		return () => {
			let i = t.default && _i(t.default(), !0), a = i && i.length ? ui(i) : n.subTree ? Vs() : void 0;
			if (!a) return;
			let o = /* @__PURE__ */ R(e), { mode: s } = o;
			if (r.isLeaving) return mi(a);
			let c = hi(a);
			if (!c) return mi(a);
			let l = pi(c, o, r, n, (e) => l = e);
			c.type !== Cs && gi(c, l);
			let u = n.subTree && hi(n.subTree);
			if (u && u.type !== Cs && !Ms(u, c) && vi(n.subTree)) {
				let e = pi(u, o, r, n);
				if (gi(u, e), s === "out-in" && c.type !== Cs) return r.isLeaving = !0, e.afterLeave = () => {
					r.isLeaving = !1, n.job.flags & 8 || n.update(), delete e.afterLeave, u = void 0;
				}, mi(a);
				s === "in-out" && c.type !== Cs ? e.delayLeave = (e, t, n) => {
					let i = fi(r, u);
					i[String(u.key)] = u, e[ii] = () => {
						t(), e[ii] = void 0, delete l.delayedLeave, u = void 0;
					}, l.delayedLeave = () => {
						n(), delete l.delayedLeave, u = void 0;
					};
				} : u = void 0;
			} else u &&= void 0;
			return a;
		};
	}
};
function ui(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Cs) {
			t = n;
			break;
		}
	}
	return t;
}
var di = li;
function fi(e, t) {
	let { leavingVNodes: n } = e, r = n.get(t.type);
	return r || (r = /* @__PURE__ */ Object.create(null), n.set(t.type, r)), r;
}
function pi(e, t, n, r, i) {
	let { appear: a, mode: o, persisted: s = !1, onBeforeEnter: c, onEnter: l, onAfterEnter: u, onEnterCancelled: d, onBeforeLeave: f, onLeave: p, onAfterLeave: m, onLeaveCancelled: h, onBeforeAppear: g, onAppear: _, onAfterAppear: v, onAppearCancelled: y } = t, b = String(e.key), x = fi(n, e), S = (e, t) => {
		e && er(e, r, 9, t);
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
			t[ii] && t[ii](!0);
			let i = x[b];
			if (i && Ms(e, i)) {
				let e = i.el[ii];
				if (!e) {
					let t = vi(i);
					e = t && t.el[ii];
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
			t[ai] = (e) => {
				s || (s = !0, S(e ? o : i, [t]), w.delayedLeave && w.delayedLeave(), t[ai] = void 0);
			};
			let c = t[ai].bind(null, !1);
			r ? C(r, [t, c]) : c();
		},
		leave(t, r) {
			let i = String(e.key);
			if (t[ai] && t[ai](!0), n.isUnmounting) return r();
			S(f, [t]);
			let a = !1;
			t[ii] = (n) => {
				a || (a = !0, r(), S(n ? h : m, [t]), t[ii] = void 0, x[i] === e && delete x[i]);
			};
			let o = t[ii].bind(null, !1);
			x[i] = e, p ? C(p, [t, o]) : o();
		},
		clone(e) {
			let a = pi(e, t, n, r, i);
			return i && i(a), a;
		}
	};
	return w;
}
function mi(e) {
	if ($i(e)) return e = Rs(e), e.children = null, e;
}
function hi(e) {
	if (!$i(e)) return Kr(e.type) && e.children ? ui(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && j(n.default)) return n.default();
	}
}
function gi(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		gi(Kr(n.type) && hi(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === xs && k(e.children)) {
		let n = To(e.children, !1);
		n && gi(n, t);
	}
}
function _i(e, t = !1, n) {
	let r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a], s = n == null ? o.key : String(n) + String(o.key == null ? a : o.key);
		o.type === xs ? (o.patchFlag & 128 && i++, r = r.concat(_i(o.children, t, s))) : (t || o.type !== Cs) && r.push(s == null ? o : Rs(o, { key: s }));
	}
	if (i > 1) for (let e = 0; e < r.length; e++) r[e].patchFlag = -2;
	return r;
}
function vi(e) {
	if (e.component) return vi(e.component.subTree);
	if (e.type === xs) {
		let t = k(e.children) && To(e.children, !1);
		return t ? vi(t) : void 0;
	}
	if (e.type !== Cs) return e;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
	return j(e) ? /* @__PURE__ */ T({ name: e.name }, t, { setup: e }) : e;
}
function yi() {
	let e = Qs();
	return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : "";
}
function bi(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function xi(e) {
	let t = Qs(), n = /* @__PURE__ */ Sn(null);
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
function Si(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var Ci = /* @__PURE__ */ new WeakMap();
function wi(e, t, n, r, i = !1) {
	if (k(e)) {
		e.forEach((e, a) => wi(e, t && (k(t) ? t[a] : t), n, r, i));
		return;
	}
	if (Xi(r) && !i) {
		r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && wi(e, t, n, r.component.subTree);
		return;
	}
	let a = r.shapeFlag & 4 ? hc(r.component) : r.el, o = i ? null : a, { i: s, r: c } = e, l = t && t.r, u = s.refs === y ? s.refs = {} : s.refs, d = s.setupState, f = /* @__PURE__ */ R(d), p = d === y ? S : (e) => !Si(u, e) && O(f, e), m = (e, t) => !(t && Si(u, t));
	if (l != null && l !== c) {
		if (Ti(t), M(l)) u[l] = null, p(l) && (d[l] = null);
		else if (/* @__PURE__ */ xn(l)) {
			let e = t;
			m(l, e.k) && (l.value = null), e.k && (u[e.k] = null);
		}
	}
	if (j(c)) $n(c, s, 12, [o, u]);
	else {
		let t = M(c), r = /* @__PURE__ */ xn(c);
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
					s(), Ci.delete(e);
				};
				t.id = -1, Ci.set(e, t), Xo(t, n);
			} else Ti(e), s();
		}
	}
}
function Ti(e) {
	let t = Ci.get(e);
	t && (t.flags |= 8, Ci.delete(e));
}
var Ei = !1, Di = () => {
	Ei ||= (console.error("Hydration completed but contains mismatches."), !0);
}, Oi = (e) => e.namespaceURI.includes("svg") && e.tagName !== "foreignObject", ki = (e) => e.namespaceURI.includes("MathML"), Ai = (e) => {
	if (e.nodeType === 1) {
		if (Oi(e)) return "svg";
		if (ki(e)) return "mathml";
	}
}, ji = (e) => e.nodeType === 8;
function Mi(e) {
	let { mt: t, p: n, o: { patchProp: r, createText: i, nextSibling: a, parentNode: o, remove: s, insert: c, createComment: l } } = e, u = (e, t) => {
		t.hasChildNodes() ? (d(t.firstChild, e, null, null, null), gr(), t._vnode = e) : (n(null, e, t), gr(), t._vnode = e);
	}, d = (n, r, s, l, u, y = !1) => {
		y ||= !!r.dynamicChildren;
		let b = ji(n) && n.data === "[", x = () => h(n, r, s, l, u, b), { type: S, ref: C, shapeFlag: w, patchFlag: T } = r, E = n.nodeType;
		r.el = n, T === -2 && (y = !1, r.dynamicChildren = null);
		let D = null;
		switch (S) {
			case Ss:
				E === 3 ? (n.data !== r.children && (Di(), n.data = r.children), D = a(n)) : r.children === "" ? (c(r.el = i(""), o(n), n), D = n) : D = x();
				break;
			case Cs:
				v(n) ? (D = a(n), _(r.el = n.content.firstChild, n, s)) : D = E !== 8 || b ? x() : a(n);
				break;
			case ws:
				if (b && (n = a(n), E = n.nodeType), E === 1 || E === 3) {
					D = n;
					let e = !r.children.length;
					for (let t = 0; t < r.staticCount; t++) e && (r.children += D.nodeType === 1 ? D.outerHTML : D.data), t === r.staticCount - 1 && (r.anchor = D), D = a(D);
					return b ? a(D) : D;
				}
				x();
				break;
			case xs:
				D = b ? m(n, r, s, l, u, y) : x();
				break;
			default: if (w & 1) D = (E !== 1 || r.type.toLowerCase() !== n.tagName.toLowerCase()) && !v(n) ? x() : f(n, r, s, l, u, y);
			else if (w & 6) {
				r.slotScopeIds = u;
				let e = o(n);
				if (D = b ? g(n) : ji(n) && n.data === "teleport start" ? g(n, n.data, "teleport end") : a(n), t(r, e, null, s, l, Ai(e), y), (Xi(r) || r.component.asyncDep) && !r.component.subTree) {
					let t;
					b ? (t = J(ws), t.anchor = D ? D.previousSibling : e.lastChild) : t = n.nodeType === 3 ? zs("") : J(n.nodeType === 8 ? Cs : "div"), t.el = n, r.component.subTree = t;
				}
			} else w & 64 ? D = E === 8 ? r.type.hydrate(n, r, s, l, u, y, e, p) : x() : w & 128 && (D = r.type.hydrate(n, r, s, l, Ai(o(n)), u, y, e, d));
		}
		return C != null && wi(C, null, l, r), D;
	}, f = (e, t, n, i, a, o) => {
		o ||= !!t.dynamicChildren;
		let { type: c, dynamicProps: l, props: u, patchFlag: d, shapeFlag: f, dirs: m, transition: h } = t, g = c === "input" || c === "option", y = !!l;
		if (g || y || d !== -1) {
			m && jr(t, null, n, "created");
			let c = !1;
			if (v(e)) {
				c = ns(null, h) && n && n.vnode.props && n.vnode.props.appear;
				let r = e.content.firstChild;
				if (c) {
					let e = r.getAttribute("class");
					e && (r.$cls = e), h.beforeEnter(r);
				}
				_(r, e, n), t.el = e = r;
			}
			if (f & 16 && !(u && (u.innerHTML || u.textContent))) {
				let r = p(e.firstChild, t, e, n, i, a, o);
				for (r && !Li(e, 1) && Di(); r;) {
					let e = r;
					r = r.nextSibling, s(e);
				}
			} else if (f & 8) {
				let n = t.children;
				n[0] === "\n" && (e.tagName === "PRE" || e.tagName === "TEXTAREA") && (n = n.slice(1));
				let { textContent: r } = e;
				r !== n && r !== n.replace(/\r\n|\r/g, "\n") && (Li(e, 0) || Di(), e.textContent = t.children);
			}
			if (u) {
				if (g || y || !o || d & 48) {
					let t = e.tagName.includes("-"), i = e.namespaceURI.includes("svg") ? "svg" : e.namespaceURI.includes("MathML") ? "mathml" : void 0;
					for (let a in u) if (g && (a.endsWith("value") || a === "indeterminate") || C(a) && !ue(a) || a[0] === "." || t && !ue(a) || l && l.includes(a)) {
						if (Pi(e, a, u[a])) continue;
						r(e, a, null, u[a], i, n);
					}
				} else if (u.onClick) r(e, "onClick", null, u.onClick, void 0, n);
				else if (d & 4 && /* @__PURE__ */ mn(u.style)) for (let e in u.style) u.style[e];
			}
			let b;
			(b = u && u.onVnodeBeforeMount) && Ks(b, n, t), m && jr(t, null, n, "beforeMount"), ((b = u && u.onVnodeMounted) || m || c) && vs(() => {
				b && Ks(b, n, t), c && h.enter(e), m && jr(t, null, n, "mounted");
			}, i);
		}
		return e.nextSibling;
	}, p = (e, t, r, o, s, l, u) => {
		u ||= !!t.dynamicChildren;
		let f = t.children, p = f.length, m = !1;
		for (let t = 0; t < p; t++) {
			let h = u ? f[t] : f[t] = Hs(f[t]), g = h.type === Ss;
			e ? (g && !u && t + 1 < p && Hs(f[t + 1]).type === Ss && (c(i(e.data.slice(h.children.length)), r, a(e)), e.data = h.children), e = d(e, h, o, s, l, u)) : g && !h.children ? c(h.el = i(""), r) : (m || (m = !0, Li(r, 1) || Di()), n(null, h, r, null, o, s, Ai(r), l));
		}
		return e;
	}, m = (e, t, n, r, i, s) => {
		let { slotScopeIds: u } = t;
		u && (i = i ? i.concat(u) : u);
		let d = o(e), f = p(a(e), t, d, n, r, i, s);
		return f && ji(f) && f.data === "]" ? a(t.anchor = f) : (Di(), c(t.anchor = l("]"), d, f), f);
	}, h = (e, t, r, i, c, l) => {
		if (zi(e, t) || Di(), t.el = null, l) {
			let t = g(e);
			for (;;) {
				let n = a(e);
				if (n && n !== t) s(n);
				else break;
			}
		}
		let u = a(e), d = o(e);
		return s(e), n(null, t, d, u, r, i, Ai(d), c), r && (r.vnode.el = t.el, jo(r, t.el)), u;
	}, g = (e, t = "[", n = "]") => {
		let r = 0;
		for (; e;) if (e = a(e), e && ji(e) && (e.data === t && r++, e.data === n)) {
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
var Ni = /* @__PURE__ */ new Set([
	"src",
	"srcset",
	"href",
	"poster"
]);
function Pi(e, t, n) {
	return Ni.has(t) ? e.getAttribute(t) === (n == null ? null : `${n}`) : !1;
}
var Fi = "data-allow-mismatch", Ii = {
	0: "text",
	1: "children",
	2: "class",
	3: "style",
	4: "attribute"
};
function Li(e, t) {
	if (t === 0 || t === 1) for (; e && !e.hasAttribute(Fi);) e = e.parentElement;
	return Ri(e && e.getAttribute(Fi), t);
}
function Ri(e, t) {
	if (e == null) return !1;
	if (e === "") return !0;
	{
		let n = e.split(",");
		return t === 0 && n.includes("children") ? !0 : n.includes(Ii[t]);
	}
}
function zi(e, t) {
	return Li(e.parentElement, 1) || Bi(e) || Vi(t);
}
function Bi(e) {
	return e.nodeType === 1 && Ri(e.getAttribute(Fi), 1);
}
function Vi({ props: e }) {
	let t = e && e[Fi];
	return typeof t == "string" && Ri(t, 1);
}
var Hi = Ce().requestIdleCallback || ((e) => setTimeout(e, 1)), Ui = Ce().cancelIdleCallback || ((e) => clearTimeout(e)), Wi = (e = 1e4) => (t) => {
	let n = Hi(t, { timeout: e });
	return () => Ui(n);
};
function Gi(e) {
	let { top: t, left: n, bottom: r, right: i } = e.getBoundingClientRect(), { innerHeight: a, innerWidth: o } = window;
	return (t > 0 && t < a || r > 0 && r < a) && (n > 0 && n < o || i > 0 && i < o);
}
var Ki = (e) => (t, n) => {
	let r = new IntersectionObserver((e) => {
		for (let n of e) if (n.isIntersecting) {
			r.disconnect(), t();
			break;
		}
	}, e), i = (e) => {
		if (Gi(e)) return t(), r.disconnect(), !1;
		if (getComputedStyle(e).display === "contents") {
			for (let t = 0; t < e.children.length; t++) if (i(e.children[t]) === !1) return !1;
		}
		r.observe(e);
	};
	return n((e) => {
		if (e instanceof Element) return i(e);
	}), () => r.disconnect();
}, qi = (e) => (t) => {
	if (e) {
		let n = matchMedia(e);
		if (n.matches) t();
		else return n.addEventListener("change", t, { once: !0 }), () => n.removeEventListener("change", t);
	}
}, Ji = (e = []) => (t, n) => {
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
function Yi(e, t) {
	if (ji(e) && e.data === "[") {
		let n = 1, r = e.nextSibling;
		for (; r;) {
			if (r.nodeType === 1) {
				if (t(r) === !1) break;
			} else if (ji(r)) {
				if (r.data === "]") {
					if (--n === 0) break;
				} else r.data === "[" && n++;
			}
			r = r.nextSibling;
		}
	} else t(e);
}
var Xi = (e) => !!e.type.__asyncLoader;
// @__NO_SIDE_EFFECTS__
function Zi(e) {
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
	return /* @__PURE__ */ H({
		name: "AsyncComponentWrapper",
		__asyncLoader: p,
		__asyncHydrate(e, t, n) {
			let r = e.isConnected, i = !1;
			(t.bu ||= []).push(() => i = !0);
			let o = () => {
				i || !e.parentNode || r && !e.isConnected || n();
			}, s = a ? () => {
				let n = a(o, (t) => Yi(e, t));
				n && (t.bum ||= []).push(n);
			} : o;
			u ? s() : p().then(() => !t.isUnmounted && s());
		},
		get __asyncResolved() {
			return u;
		},
		setup() {
			let e = Zs;
			if (bi(e), u) return () => Qi(u, e);
			let t = (t) => {
				l = null, tr(t, e, 13, !r);
			};
			if (s && e.suspense || ic) return p().then((t) => () => Qi(t, e)).catch((e) => (t(e), () => r ? J(r, { error: e }) : null));
			let a = /* @__PURE__ */ z(!1), c = /* @__PURE__ */ z(), d = /* @__PURE__ */ z(!!i), f, m;
			return ha(() => {
				f != null && clearTimeout(f), m != null && clearTimeout(m);
			}), i && (m = setTimeout(() => {
				e.isUnmounted || (d.value = !1);
			}, i)), o != null && (f = setTimeout(() => {
				if (!e.isUnmounted && !a.value && !c.value) {
					let e = /* @__PURE__ */ Error(`Async component timed out after ${o}ms.`);
					t(e), c.value = e;
				}
			}, o)), p().then(() => {
				e.isUnmounted || (a.value = !0, e.parent && $i(e.parent.vnode) && e.parent.update());
			}).catch((n) => {
				e.isUnmounted ? l = null : (t(n), c.value = n);
			}), () => {
				if (a.value && u) return Qi(u, e);
				if (c.value && r) return J(r, { error: c.value });
				if (n && !d.value) return Qi(n, e);
			};
		}
	});
}
function Qi(e, t) {
	let { ref: n, props: r, children: i, ce: a } = t.vnode, o = J(e, r, i);
	return o.ref = n, o.ce = a, delete t.vnode.ce, o;
}
var $i = (e) => e.type.__isKeepAlive, ea = {
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
			l(e, t, n, 0, s), c(a.vnode, e, t, n, a, s, r, e.slotScopeIds, i), Xo(() => {
				a.isDeactivated = !1, a.a && P(a.a);
				let t = e.props && e.props.onVnodeMounted;
				t && Ks(t, a.parent, e);
			}, s);
		}, r.deactivate = (e) => {
			let t = e.component;
			os(t.m), os(t.a), l(e, f, null, 1, s), Xo(() => {
				t.da && P(t.da);
				let n = e.props && e.props.onVnodeUnmounted;
				n && Ks(n, t.parent, e), t.isDeactivated = !0;
			}, s);
		};
		function p(e) {
			oa(e), u(e, n, s, !0);
		}
		function m(e) {
			i.forEach((t, n) => {
				let r = gc(Xi(t) ? t.type.__asyncResolved || {} : t.type);
				r && !e(r) && h(n);
			});
		}
		function h(e) {
			let t = i.get(e);
			t && (!o || !Ms(t, o)) ? p(t) : o && (oa(o), t && oa(t)), i.delete(e), a.delete(e);
		}
		Br(() => [e.include, e.exclude], ([e, t]) => {
			e && m((t) => ta(e, t)), t && m((e) => !ta(t, e));
		}, {
			flush: "post",
			deep: !0
		});
		let g = null, _ = () => {
			g != null && (cs(n.subTree.type) ? Xo(() => {
				let e = sa(n.subTree);
				e.component && i.set(g, e);
			}, n.subTree.suspense) : i.set(g, sa(n.subTree)));
		};
		return da(_), pa(_), ma(() => {
			i.forEach((e) => {
				let { subTree: t, suspense: r } = n, i = sa(t);
				if (e.type === i.type && e.key === i.key) {
					oa(i);
					let e = i.component.da;
					e && Xo(e, r);
				} else p(e);
			});
		}), () => {
			if (g = null, !t.default) return o = null;
			let n = t.default(), r = n[0];
			if (n.length > 1) return o = null, n;
			if (!js(r) || !(r.shapeFlag & 4) && !(r.shapeFlag & 128)) return o = null, r;
			let s = sa(r);
			if (s.type === Cs) return o = null, s;
			let c = s.type, l = gc(Xi(s) ? s.type.__asyncResolved || {} : c), { include: u, exclude: d, max: f } = e;
			if (u && (!l || !ta(u, l)) || d && l && ta(d, l)) return s.shapeFlag &= -257, o = s, r;
			let p = s.key == null ? c : s.key, m = i.get(p);
			return s.el && (s = Rs(s), r.shapeFlag & 128 && (r.ssContent = s)), g = p, m ? (s.el = m.el, s.component = m.component, s.transition && gi(s, s.transition), s.shapeFlag |= 512, a.delete(p), a.add(p)) : (a.add(p), f && a.size > parseInt(f, 10) && h(a.values().next().value)), s.shapeFlag |= 256, o = s, cs(r.type) ? r : s;
		};
	}
};
function ta(e, t) {
	return k(e) ? e.some((e) => ta(e, t)) : M(e) ? e.split(",").includes(t) : A(e) ? (e.lastIndex = 0, e.test(t)) : !1;
}
function na(e, t) {
	ia(e, "a", t);
}
function ra(e, t) {
	ia(e, "da", t);
}
function ia(e, t, n = Zs) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (ca(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) $i(e.parent.vnode) && aa(r, t, n, e), e = e.parent;
	}
}
function aa(e, t, n, r) {
	let i = ca(t, e, r, !0);
	ha(() => {
		E(r[t], i);
	}, n);
}
function oa(e) {
	e.shapeFlag &= -257, e.shapeFlag &= -513;
}
function sa(e) {
	return e.shapeFlag & 128 ? e.ssContent : e;
}
function ca(e, t, n = Zs, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			ft();
			let i = tc(n), a = er(t, n, e, r);
			return i(), pt(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var la = (e) => (t, n = Zs) => {
	ic && e !== "sp" || ca(e, (...e) => t(...e), n);
}, ua = la("bm"), da = la("m"), fa = la("bu"), pa = la("u"), ma = la("bum"), ha = la("um"), ga = la("sp"), _a = la("rtg"), va = la("rtc");
function ya(e, t = Zs) {
	ca("ec", e, t);
}
var ba = "components", xa = "directives";
function Sa(e, t) {
	return Ea(ba, e, !0, t) || e;
}
var Ca = /* @__PURE__ */ Symbol.for("v-ndc");
function wa(e) {
	return M(e) ? Ea(ba, e, !1) || e : e || Ca;
}
function Ta(e) {
	return Ea(xa, e);
}
function Ea(e, t, n = !0, r = !1) {
	let i = wr || Zs;
	if (i) {
		let n = i.type;
		if (e === ba) {
			let e = gc(n, !1);
			if (e && (e === t || e === pe(t) || e === ge(pe(t)))) return n;
		}
		let a = Da(i[e] || n[e], t) || Da(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function Da(e, t) {
	return e && (e[t] || e[pe(t)] || e[ge(pe(t))]);
}
function Oa(e, t, n, r) {
	let i, a = n && n[r], o = k(e);
	if (o || M(e)) {
		let n = o && /* @__PURE__ */ mn(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ gn(e), s = /* @__PURE__ */ hn(e), e = Dt(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? bn(yn(e[n])) : yn(e[n]) : e[n], n, void 0, a && a[n]);
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
function ka(e, t) {
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
function U(e, t, n, r, i, a) {
	if (n ??= {}, wr.ce || wr.parent && Xi(wr.parent) && wr.parent.ce) {
		let e = a != null && n.key == null ? T({}, n, { key: a }) : n, i = Object.keys(e).length > 0;
		return t !== "default" && (e.name = t), W(), K(xs, null, [J("slot", e, r && r())], i ? -2 : 64);
	}
	let o = e[t];
	o && o._c && (o._d = !1);
	let s = Ts.length;
	W();
	let c;
	try {
		let i = o && Aa(o(n)), s = n.key || a || i && i.key;
		c = K(xs, { key: (s && !re(s) ? s : `_${t}`) + (!i && r ? "_fb" : "") }, i || (r ? r() : []), i && e._ === 1 ? 64 : -2);
	} catch (e) {
		for (let e = Ts.length; e > s; e--) Ds();
		throw e;
	} finally {
		o && o._c && (o._d = !0);
	}
	return !i && c.scopeId && (c.slotScopeIds = [c.scopeId + "-s"]), c;
}
function Aa(e) {
	return e.some((e) => !js(e) || !(e.type === Cs || e.type === xs && !Aa(e.children))) ? e : null;
}
function ja(e, t) {
	let n = {};
	for (let r in e) n[t && /[A-Z]/.test(r) ? `on:${r}` : _e(r)] = e[r];
	return n;
}
var Ma = (e) => e ? rc(e) ? hc(e) : Ma(e.parent) : null, Na = /* @__PURE__ */ T(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Ma(e.parent),
	$root: (e) => Ma(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => ro(e),
	$forceUpdate: (e) => e.f ||= () => {
		fr(e.update);
	},
	$nextTick: (e) => e.n ||= ur.bind(e.proxy),
	$watch: (e) => Hr.bind(e)
}), Pa = (e, t) => e !== y && !e.__isScriptSetup && O(e, t), Fa = {
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
			else if (Pa(r, t)) return o[t] = 1, r[t];
			else if (i !== y && O(i, t)) return o[t] = 2, i[t];
			else if (O(a, t)) return o[t] = 3, a[t];
			else if (n !== y && O(n, t)) return o[t] = 4, n[t];
			else Qa && (o[t] = 0);
		}
		let l = Na[t], u, d;
		if (l) return t === "$attrs" && Ct(e.attrs, "get", ""), l(e);
		if ((u = s.__cssModules) && (u = u[t])) return u;
		if (n !== y && O(n, t)) return o[t] = 4, n[t];
		if (d = c.config.globalProperties, O(d, t)) return d[t];
	},
	set({ _: e }, t, n) {
		let { data: r, setupState: i, ctx: a } = e;
		return Pa(i, t) ? (i[t] = n, !0) : r !== y && O(r, t) ? (r[t] = n, !0) : O(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (a[t] = n, !0);
	},
	has({ _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: i, props: a, type: o } }, s) {
		let c;
		return !!(n[s] || e !== y && s[0] !== "$" && O(e, s) || Pa(t, s) || O(a, s) || O(r, s) || O(Na, s) || O(i.config.globalProperties, s) || (c = o.__cssModules) && c[s]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? O(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
}, Ia = /* @__PURE__ */ T({}, Fa, {
	get(e, t) {
		if (t !== Symbol.unscopables) return Fa.get(e, t, e);
	},
	has(e, t) {
		return t[0] !== "_" && !we(t);
	}
});
function La() {
	return null;
}
function Ra() {
	return null;
}
function za(e) {}
function Ba(e) {}
function Va() {
	return null;
}
function Ha() {}
function Ua(e, t) {
	return null;
}
function Wa() {
	return Ka("useSlots").slots;
}
function Ga() {
	return Ka("useAttrs").attrs;
}
function Ka(e) {
	let t = Qs();
	return t.setupContext ||= mc(t);
}
function qa(e) {
	return k(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Ja(e, t) {
	let n = qa(e);
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
function Ya(e, t) {
	return !e || !t ? e || t : k(e) && k(t) ? e.concat(t) : T({}, qa(e), qa(t));
}
function Xa(e, t) {
	let n = {};
	for (let r in e) t.includes(r) || Object.defineProperty(n, r, {
		enumerable: !0,
		get: () => e[r]
	});
	return n;
}
function Za(e) {
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
var Qa = !0;
function $a(e) {
	let t = ro(e), n = e.proxy, r = e.ctx;
	Qa = !1, t.beforeCreate && to(t.beforeCreate, e, "bc");
	let { data: i, computed: a, methods: o, watch: s, provide: c, inject: l, created: u, beforeMount: d, mounted: f, beforeUpdate: p, updated: m, activated: h, deactivated: g, beforeDestroy: _, beforeUnmount: v, destroyed: y, unmounted: b, render: S, renderTracked: C, renderTriggered: w, errorCaptured: T, serverPrefetch: E, expose: D, inheritAttrs: O, components: ee, directives: te, filters: ne } = t;
	if (l && eo(l, r, null), o) for (let e in o) {
		let t = o[e];
		j(t) && (r[e] = t.bind(n));
	}
	if (i) {
		let t = i.call(n, n);
		N(t) && (e.data = /* @__PURE__ */ ln(t));
	}
	if (Qa = !0, a) for (let e in a) {
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
	if (s) for (let e in s) no(s[e], r, n, e);
	if (c) {
		let e = j(c) ? c.call(n) : c;
		Reflect.ownKeys(e).forEach((t) => {
			Mr(t, e[t]);
		});
	}
	u && to(u, e, "c");
	function A(e, t) {
		k(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (A(ua, d), A(da, f), A(fa, p), A(pa, m), A(na, h), A(ra, g), A(ya, T), A(va, C), A(_a, w), A(ma, v), A(ha, b), A(ga, E), k(D)) {
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
	S && e.render === x && (e.render = S), O != null && (e.inheritAttrs = O), ee && (e.components = ee), te && (e.directives = te), E && bi(e);
}
function eo(e, t, n = x) {
	k(e) && (e = co(e));
	for (let n in e) {
		let r = e[n], i;
		i = N(r) ? "default" in r ? Nr(r.from || n, r.default, !0) : Nr(r.from || n) : Nr(r), /* @__PURE__ */ xn(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function to(e, t, n) {
	er(k(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function no(e, t, n, r) {
	let i = r.includes(".") ? Ur(n, r) : () => n[r];
	if (M(e)) {
		let n = t[e];
		j(n) && Br(i, n);
	} else if (j(e)) Br(i, e.bind(n));
	else if (N(e)) {
		if (k(e)) e.forEach((e) => no(e, t, n, r));
		else {
			let r = j(e.handler) ? e.handler.bind(n) : t[e.handler];
			j(r) && Br(i, r, e);
		}
	}
}
function ro(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => io(c, e, o, !0)), io(c, t, o)), N(t) && a.set(t, c), c;
}
function io(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && io(e, a, n, !0), i && i.forEach((t) => io(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = ao[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var ao = {
	data: oo,
	props: fo,
	emits: fo,
	methods: uo,
	computed: uo,
	beforeCreate: lo,
	created: lo,
	beforeMount: lo,
	mounted: lo,
	beforeUpdate: lo,
	updated: lo,
	beforeDestroy: lo,
	beforeUnmount: lo,
	destroyed: lo,
	unmounted: lo,
	activated: lo,
	deactivated: lo,
	errorCaptured: lo,
	serverPrefetch: lo,
	components: uo,
	directives: uo,
	watch: po,
	provide: oo,
	inject: so
};
function oo(e, t) {
	return t ? e ? function() {
		return T(j(e) ? e.call(this, this) : e, j(t) ? t.call(this, this) : t);
	} : t : e;
}
function so(e, t) {
	return uo(co(e), co(t));
}
function co(e) {
	if (k(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function lo(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function uo(e, t) {
	return e ? T(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function fo(e, t) {
	return e ? k(e) && k(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : T(/* @__PURE__ */ Object.create(null), qa(e), qa(t ?? {})) : t;
}
function po(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = T(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = lo(e[r], t[r]);
	return n;
}
function mo() {
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
var ho = 0;
function go(e, t) {
	return function(n, r = null) {
		j(n) || (n = T({}, n)), r != null && !N(r) && (r = null);
		let i = mo(), a = /* @__PURE__ */ new WeakSet(), o = [], s = !1, c = i.app = {
			_uid: ho++,
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
				s && (er(o, c._instance, 16), e(null, c._container), delete c._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, c;
			},
			runWithContext(e) {
				let t = _o;
				_o = c;
				try {
					return e();
				} finally {
					_o = t;
				}
			}
		};
		return c;
	};
}
var _o = null;
function vo(e, t, n = y) {
	let r = Qs(), i = pe(t), a = he(t), o = yo(e, i), s = An((o, s) => {
		let c, l = y, u;
		return zr(() => {
			let t = e[i];
			ve(c, t) && (c = t, s());
		}), {
			get() {
				return o(), n.get ? n.get(c) : c;
			},
			set(e) {
				let o = n.set ? n.set(e) : e;
				if (!ve(o, c) && !(l !== y && ve(e, l))) return;
				let d = r.vnode.props, f = !!(d && (t in d || i in d || a in d) && (`onUpdate:${t}` in d || `onUpdate:${i}` in d || `onUpdate:${a}` in d));
				f || (c = e, s()), r.emit(`update:${t}`, o), ve(e, l) && (ve(e, o) && !ve(o, u) || f && l !== y && !ve(o, c)) && s(), l = e, u = o;
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
var yo = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${pe(t)}Modifiers`] || e[`${he(t)}Modifiers`];
function bo(e, t, ...n) {
	if (e.isUnmounted) return;
	let r = e.vnode.props || y, i = n, a = t.startsWith("update:"), o = a && yo(r, t.slice(7));
	o && (o.trim && (i = n.map((e) => M(e) ? e.trim() : e)), o.number && (i = i.map(be)));
	let s, c = r[s = _e(t)] || r[s = _e(pe(t))];
	!c && a && (c = r[s = _e(he(t))]), c && er(c, e, 6, i);
	let l = r[s + "Once"];
	if (l) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[s]) return;
		e.emitted[s] = !0, er(l, e, 6, i);
	}
}
var xo = /* @__PURE__ */ new WeakMap();
function So(e, t, n = !1) {
	let r = n ? xo : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, s = !1;
	if (!j(e)) {
		let r = (e) => {
			let n = So(e, t, !0);
			n && (s = !0, T(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !s ? (N(e) && r.set(e, null), null) : (k(a) ? a.forEach((e) => o[e] = null) : T(o, a), N(e) && r.set(e, o), o);
}
function Co(e, t) {
	return !e || !C(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), O(e, t[0].toLowerCase() + t.slice(1)) || O(e, he(t)) || O(e, t));
}
function wo(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: o, attrs: s, emit: c, render: l, renderCache: u, props: d, data: f, setupState: p, ctx: m, inheritAttrs: h } = e, g = Er(e), _, v;
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
			}) : e(d, null)), v = t.props ? s : Eo(s);
		}
	} catch (t) {
		Ts.length = 0, tr(t, e, 1), _ = J(Cs);
	}
	let y = _;
	if (v && h !== !1) {
		let e = Object.keys(v), { shapeFlag: t } = y;
		e.length && t & 7 && (a && e.some(w) && (v = Do(v, a)), y = Rs(y, v, !1, !0));
	}
	return n.dirs && (y = Rs(y, null, !1, !0), y.dirs = y.dirs ? y.dirs.concat(n.dirs) : n.dirs), n.transition && gi(Kr(y.type) && hi(y) || y, n.transition), _ = y, Er(g), _;
}
function To(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (js(r)) {
			if (r.type !== Cs || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var Eo = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || C(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, Do = (e, t) => {
	let n = {};
	for (let r in e) w(r) && r.slice(9) in t || (n[r] = e[r]);
	return n;
};
function Oo(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? ko(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (Ao(o, r, n) && !Co(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || ko(r, o, l) : !!o;
	return !1;
}
function ko(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!O(e, a) || Ao(t, e, a) && !Co(n, a)) return !0;
	}
	return !1;
}
function Ao(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && N(r) && N(i) ? !Re(r, i) : r !== i;
}
function jo({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var Mo = {}, No = () => Object.create(Mo), Po = (e) => Object.getPrototypeOf(e) === Mo;
function Fo(e, t, n, r = !1) {
	let i = {}, a = No();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Lo(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ un(i) : e.type.props ? i : a, e.attrs = a;
}
function Io(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ R(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (Co(e.emitsOptions, o)) continue;
				let u = t[o];
				if (c) {
					if (O(a, o)) u !== a[o] && (a[o] = u, l = !0);
					else {
						let t = pe(o);
						i[t] = Ro(c, s, t, u, e, !1);
					}
				} else u !== a[o] && (a[o] = u, l = !0);
			}
		}
	} else {
		Lo(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) t && (O(t, a) || (r = he(a)) !== a && O(t, r)) || (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Ro(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) t && O(t, e) || (delete a[e], l = !0);
	}
	l && wt(e.attrs, "set", "");
}
function Lo(e, t, n, r) {
	let [i, a] = e.propsOptions, o = !1, s;
	if (t) for (let c in t) {
		if (ue(c)) continue;
		let l = t[c], u;
		i && O(i, u = pe(c)) ? !a || !a.includes(u) ? n[u] = l : (s ||= {})[u] = l : Co(e.emitsOptions, c) || c in r && l === r[c] || (r[c] = l, o = !0);
	}
	if (a) {
		let t = /* @__PURE__ */ R(n), r = s || y;
		for (let o = 0; o < a.length; o++) {
			let s = a[o];
			n[s] = Ro(i, t, s, r[s], e, !O(r, s));
		}
	}
	return o;
}
function Ro(e, t, n, r, i, a) {
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
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === he(n)) && (r = !0));
	}
	return r;
}
var zo = /* @__PURE__ */ new WeakMap();
function Bo(e, t, n = !1) {
	let r = n ? zo : t.propsCache, i = r.get(e);
	if (i) return i;
	let a = e.props, o = {}, s = [], c = !1;
	if (!j(e)) {
		let r = (e) => {
			c = !0;
			let [n, r] = Bo(e, t, !0);
			T(o, n), r && s.push(...r);
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	if (!a && !c) return N(e) && r.set(e, b), b;
	if (k(a)) for (let e = 0; e < a.length; e++) {
		let t = pe(a[e]);
		Vo(t) && (o[t] = y);
	}
	else if (a) for (let e in a) {
		let t = pe(e);
		if (Vo(t)) {
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
function Vo(e) {
	return e[0] !== "$" && !ue(e);
}
var Ho = (e) => e === "_" || e === "_ctx" || e === "$stable", Uo = (e) => k(e) ? e.map(Hs) : [Hs(e)], Wo = (e, t, n) => {
	if (t._n) return t;
	let r = V((...e) => Uo(t(...e)), n);
	return r._c = !1, r;
}, Go = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Ho(n)) continue;
		let i = e[n];
		if (j(i)) t[n] = Wo(n, i, r);
		else if (i != null) {
			let e = Uo(i);
			t[n] = () => e;
		}
	}
}, Ko = (e, t) => {
	let n = Uo(t);
	e.slots.default = () => n;
}, qo = (e, t, n) => {
	for (let r in t) (n || !Ho(r)) && (e[r] = t[r]);
}, Jo = (e, t, n) => {
	let r = e.slots = No();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (qo(r, t, n), n && ye(r, "_", e, !0)) : Go(t, r);
	} else t && Ko(e, t);
}, Yo = (e, t, n) => {
	let { vnode: r, slots: i } = e, a = !0, o = y;
	if (r.shapeFlag & 32) {
		let e = t._;
		e ? n && e === 1 ? a = !1 : qo(i, t, n) : (a = !t.$stable, Go(t, i)), o = t;
	} else t && (Ko(e, t), o = { default: 1 });
	if (a) for (let e in i) !Ho(e) && o[e] == null && delete i[e];
}, Xo = vs;
function Zo(e) {
	return $o(e);
}
function Qo(e) {
	return $o(e, Mi);
}
function $o(e, t) {
	let n = Ce();
	n.__VUE__ = !0;
	let { insert: r, remove: i, patchProp: a, createElement: o, createText: s, createComment: c, setText: l, setElementText: u, parentNode: d, nextSibling: f, setScopeId: p = x, insertStaticContent: m } = e, h = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !Ms(e, t) && (r = pe(e), se(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === b && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case Ss:
				g(e, t, n, r);
				break;
			case Cs:
				_(e, t, n, r);
				break;
			case ws:
				e ?? v(t, n, r, o);
				break;
			case xs:
				te(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? w(e, t, n, r, i, a, o, s, c) : d & 6 ? ne(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, he);
		}
		u != null && i ? wi(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && wi(e.ref, null, a, e, !0);
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
		if (f = e.el = o(e.type, c, m && m.is, m), h & 8 ? u(f, e.children) : h & 16 && D(e.children, f, null, i, s, es(e, c), l, d), _ && jr(e, null, i, "created"), E(f, e, e.scopeId, l, i), m) {
			for (let e in m) e !== "value" && !ue(e) && a(f, e, null, m[e], c, i);
			"value" in m && a(f, "value", null, m.value, c), (p = m.onVnodeBeforeMount) && Ks(p, i, e);
		}
		_ && jr(e, null, i, "beforeMount");
		let v = ns(s, g);
		v && g.beforeEnter(f), r(f, t, n), ((p = m && m.onVnodeMounted) || v || _) && Xo(() => {
			try {
				p && Ks(p, i, e), v && g.enter(f), _ && jr(e, null, i, "mounted");
			} finally {}
		}, s);
	}, E = (e, t, n, r, i) => {
		if (n && p(e, n), r) for (let t = 0; t < r.length; t++) p(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || cs(n.type) && (n.ssContent === t || n.ssFallback === t)) {
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
		if (n && ts(n, !1), (h = m.onVnodeBeforeUpdate) && Ks(h, n, t, e), f && jr(t, e, n, "beforeUpdate"), n && ts(n, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (l = 0, s = !1, d = null), (p.innerHTML && m.innerHTML == null || p.textContent && m.textContent == null) && u(c, ""), d ? k(e.dynamicChildren, d, c, n, r, es(t, i), o) : s || N(e, t, c, null, n, r, es(t, i), o, !1), l > 0) {
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
		((h = m.onVnodeUpdated) || f) && Xo(() => {
			h && Ks(h, n, t, e), f && jr(t, e, n, "updated");
		}, r);
	}, k = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || ss(c), f = u && (c.type === xs || !Ms(c, l) || c.shapeFlag & 198) ? d(u) : n;
			h(c, l, f, null, r, i, a, o, !0);
		}
	}, ee = (e, t, n, r, i) => {
		if (t !== n) {
			if (t !== y) for (let o in t) !ue(o) && !(o in n) && a(e, o, t[o], null, i, r);
			for (let o in n) {
				if (ue(o)) continue;
				let s = n[o], c = t[o];
				s !== c && o !== "value" && a(e, o, c, s, i, r);
			}
			"value" in n && a(e, "value", t.value, n.value, i);
		}
	}, te = (e, t, n, i, a, o, c, l, u) => {
		let d = t.el = e ? e.el : s(""), f = t.anchor = e ? e.anchor : s(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (l = l ? l.concat(h) : h), e == null ? (r(d, n, i), r(f, n, i), D(t.children || [], n, f, a, o, c, l, u)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (k(e.dynamicChildren, m, n, a, o, c, l), (t.key != null || a && t === a.subTree) && rs(e, t, !0)) : N(e, t, n, f, a, o, c, l, u);
	}, ne = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : A(t, n, r, i, a, o, c) : j(e, t, c);
	}, A = (e, t, n, r, i, a, o) => {
		let s = e.component = Xs(e, r, i);
		if ($i(e) && (s.ctx.renderer = he), ac(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, M, o, a), !e.el) {
				let r = s.subTree = J(Cs);
				_(null, r, t, n), e.placeholder = r.el;
			}
		} else M(s, e, t, n, i, a, o);
	}, j = (e, t, n) => {
		let r = t.component = e.component;
		if (Oo(e, t, n)) {
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
					let n = as(e);
					if (n) {
						t && (t.el = c.el, re(e, t, o)), n.asyncDep.then(() => {
							Xo(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, f;
				ts(e, !1), t ? (t.el = c.el, re(e, t, o)) : t = c, n && P(n), (f = t.props && t.props.onVnodeBeforeUpdate) && Ks(f, s, t, c), ts(e, !0);
				let p = wo(e), m = e.subTree;
				e.subTree = p, h(m, p, d(m.el), pe(m), e, i, a), t.el = p.el, u === null && jo(e, p.el), r && Xo(r, i), (f = t.props && t.props.onVnodeUpdated) && Xo(() => Ks(f, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = Xi(t);
				if (ts(e, !1), l && P(l), !m && (o = c && c.onVnodeBeforeMount) && Ks(o, d, t), ts(e, !0), s && _e) {
					let t = () => {
						e.subTree = wo(e), _e(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = wo(e);
					h(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && Xo(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					Xo(() => Ks(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && Xi(d.vnode) && d.vnode.shapeFlag & 256) && e.a && Xo(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new Xe(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => fr(u), ts(e, !0), l();
	}, re = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Io(e, t.props, r, n), Yo(e, t.children, n), ft(), hr(e), pt();
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
		m & 8 ? (d & 16 && fe(l, i, a), f !== l && u(n, f)) : d & 16 ? m & 16 ? ae(l, f, n, r, i, a, o, s, c) : fe(l, i, a, !0) : (d & 8 && u(n, ""), m & 16 && D(f, n, r, i, a, o, s, c));
	}, ie = (e, t, n, r, i, a, o, s, c) => {
		e ||= b, t ||= b;
		let l = e.length, u = t.length, d = Math.min(l, u), f = 0;
		for (; f < d; f++) {
			let r = t[f] = c ? Us(t[f]) : Hs(t[f]);
			h(e[f], r, n, null, i, a, o, s, c);
		}
		l > u ? fe(e, i, a, !0, !1, d) : D(t, n, r, i, a, o, s, c, d);
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
		} else if (l > f) for (; l <= d;) se(e[l], i, a, !0), l++;
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
					se(r, i, a, !0);
					continue;
				}
				let u;
				if (r.key != null) u = g.get(r.key);
				else for (_ = m; _ <= f; _++) if (C[_ - m] === 0 && Ms(r, t[_])) {
					u = _;
					break;
				}
				u === void 0 ? se(r, i, a, !0) : (C[u - m] = l + 1, u >= S ? S = u : x = !0, h(r, t[u], n, null, i, a, o, s, c), v++);
			}
			let w = x ? is(C) : b;
			for (_ = w.length - 1, l = y - 1; l >= 0; l--) {
				let e = m + l, d = t[e], f = t[e + 1], p = e + 1 < u ? f.el || ss(f) : r;
				C[l] === 0 ? h(null, d, n, p, i, a, o, s, c) : x && (_ < 0 || l !== w[_] ? oe(d, n, p, 2) : _--);
			}
		}
	}, oe = (e, t, n, a, o = null) => {
		let { el: s, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) oe(e.component.subTree, t, n, a);
		else if (d & 128) e.suspense.move(t, n, a);
		else if (d & 64) c.move(e, t, n, he);
		else if (c === xs) {
			r(s, t, n);
			for (let e = 0; e < u.length; e++) oe(u[e], t, n, a);
			r(e.anchor, t, n);
		} else if (c === ws) S(e, t, n);
		else if (a !== 2 && d & 1 && l) {
			if (a === 0) l.persisted && !s[ii] ? r(s, t, n) : (l.beforeEnter(s), r(s, t, n), Xo(() => l.enter(s), o));
			else {
				let { leave: a, delayLeave: o, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? i(s) : r(s, t, n);
				}, d = () => {
					let e = s._isLeaving || !!s[ii];
					s._isLeaving && s[ii](!0), l.persisted && !e ? u() : a(s, () => {
						u(), c && c();
					});
				};
				o ? o(s, u, d) : d();
			}
		} else r(s, t, n);
	}, se = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (ft(), wi(s, null, n, e, !0), pt()), p == null || e.ctx && e.ctx !== t || (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !Xi(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && Ks(_, t, e), u & 6) de(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && jr(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, he, r) : l && !l.hasOnce && (a !== xs || d > 0 && d & 64) ? fe(l, t, n, !1, !0) : (a === xs && d & 384 || !i && u & 16) && fe(c, t, n), r && ce(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Xo(() => {
			_ && Ks(_, t, e), h && jr(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, ce = (e) => {
		let { type: t, el: n, anchor: r, transition: a } = e, o = t === xs;
		if (o && !a) {
			le(n, r);
			return;
		}
		if (t === ws) {
			C(e), a && !a.persisted && a.afterLeave && a.afterLeave();
			return;
		}
		let s = o ? vi(e) : e, c = () => {
			o ? d(n) && le(n, r) : i(n), a && !a.persisted && a.afterLeave && a.afterLeave();
		};
		if (s && s.shapeFlag & 1 && a && !a.persisted) {
			let { leave: e, delayLeave: t } = a, n = s.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, le = (e, t) => {
		let n;
		for (; e !== t;) n = f(e), i(e), e = n;
		i(t);
	}, de = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		os(c), os(l), r && P(r), i.stop(), a ? (a.flags |= 8, se(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, se(o, e, t, n)), s && Xo(s, t), Xo(() => {
			e.isUnmounted = !0;
		}, t);
	}, fe = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) se(e[o], t, n, r, i);
	}, pe = (e) => {
		if (e.shapeFlag & 6) return pe(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = f(e.anchor || e.el), n = t && t[Gr];
		return n ? f(n) : t;
	}, me = (e, t, n) => {
		vr(() => {
			e == null ? t._vnode && se(t._vnode, null, null, !0) : h(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : Ys());
	}, he = {
		p: h,
		um: se,
		m: oe,
		r: ce,
		mt: A,
		mc: D,
		pc: N,
		pbc: k,
		n: pe,
		o: e
	}, ge, _e;
	return t && ([ge, _e] = t(he)), {
		render: me,
		hydrate: ge,
		createApp: go(me, ge)
	};
}
function es({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function ts({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function ns(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function rs(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (k(r) && k(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = Us(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && rs(t, a)), a.type === Ss && (a.patchFlag === -1 && (a = i[e] = Us(a)), a.el = t.el), a.type === Cs && !a.el && (a.el = t.el);
	}
}
function is(e) {
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
function as(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : as(t);
}
function os(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function ss(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? ss(t.subTree) : null;
}
var cs = (e) => e.__isSuspense, ls = 0, us = {
	name: "Suspense",
	__isSuspense: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		if (e == null) fs(t, n, r, i, a, o, s, c, l);
		else {
			if (a && a.deps > 0 && !e.suspense.isInFallback && !a.isHydrating) {
				t.suspense = e.suspense, t.suspense.vnode = t, t.el = e.el;
				return;
			}
			ps(e, t, n, r, i, o, s, c, l);
		}
	},
	hydrate: hs,
	normalize: gs
};
function ds(e, t) {
	let n = e.props && e.props[t];
	j(n) && n();
}
function fs(e, t, n, r, i, a, o, s, c) {
	let { p: l, o: { createElement: u } } = c, d = u("div"), f = e.suspense = ms(e, i, r, t, d, n, a, o, s, c);
	l(null, f.pendingBranch = e.ssContent, d, null, r, f, a, o), f.deps > 0 ? (ds(e, "onPending"), ds(e, "onFallback"), l(null, e.ssFallback, t, n, r, null, a, o), ys(f, e.ssFallback)) : f.resolve(!1, !0);
}
function ps(e, t, n, r, i, a, o, s, { p: c, um: l, o: { createElement: u } }) {
	let d = t.suspense = e.suspense;
	d.vnode = t, t.el = e.el;
	let f = t.ssContent, p = t.ssFallback, { activeBranch: m, pendingBranch: h, isInFallback: g, isHydrating: _ } = d;
	if (h) d.pendingBranch = f, Ms(h, f) ? (d.deps++, c(h, f, _ ? n : d.hiddenContainer, null, i, d, a, o, s), d.deps--, d.deps <= 0 ? d.resolve() : g && !_ && !d.isFallbackMountPending && (c(m, p, n, r, i, null, a, o, s), ys(d, p))) : (d.pendingId = ls++, _ ? (d.isHydrating = !1, d.activeBranch = h) : l(h, i, d), d.deps = 0, d.effects.length = 0, d.hiddenContainer = u("div"), g ? (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 ? d.resolve() : d.isFallbackMountPending || (c(m, p, n, r, i, null, a, o, s), ys(d, p))) : m && Ms(m, f) ? (c(m, f, n, r, i, d, a, o, s), d.resolve(!0)) : (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 && d.resolve()));
	else if (m && Ms(m, f)) c(m, f, n, r, i, d, a, o, s), ys(d, f);
	else if (ds(t, "onPending"), d.pendingBranch = f, d.pendingId = f.shapeFlag & 512 ? f.component.suspenseId : ls++, c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0) d.resolve();
	else {
		let { timeout: e, pendingId: t } = d;
		e > 0 ? setTimeout(() => {
			d.pendingId === t && d.fallback(p);
		}, e) : e === 0 && d.fallback(p);
	}
}
function ms(e, t, n, r, i, a, o, s, c, l, u = !1) {
	let { p: d, m: f, um: p, n: m, o: { parentNode: h, remove: g } } = l, _, v = bs(e);
	v && t && t.pendingBranch && (_ = t.pendingId, t.deps++);
	let y = e.props ? xe(e.props.timeout) : void 0, b = a, x = {
		vnode: e,
		parent: t,
		parentComponent: n,
		namespace: o,
		container: r,
		hiddenContainer: i,
		deps: 0,
		pendingId: ls++,
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
					s === x.pendingId && (f(o, u, a === b && !e ? m(i) : a, 0), mr(c), d && r.ssFallback && (r.ssFallback.el = null));
				}), i && !x.isFallbackMountPending && (h(i.el) === u && (a = m(i), e = !0), p(i, l, x, !0), !g && d && r.ssFallback && Xo(() => r.ssFallback.el = null, x)), g || f(o, u, a, 0);
			}
			x.isFallbackMountPending = !1, ys(x, o), x.pendingBranch = null, x.isInFallback = !1;
			let y = x.parent, S = !1;
			for (; y;) {
				if (y.pendingBranch) {
					for (let e = 0; e < c.length; e++) y.effects.push(c[e]);
					S = !0;
					break;
				}
				y = y.parent;
			}
			!S && !g && mr(c), x.effects = [], v && t && t.pendingBranch && _ === t.pendingId && (_ = void 0, t.deps--, t.deps === 0 && !n && t.resolve()), ds(r, "onResolve");
		},
		fallback(e) {
			if (!x.pendingBranch) return;
			let { vnode: t, activeBranch: n, parentComponent: r, container: i, namespace: a } = x;
			ds(t, "onFallback");
			let o = m(n), l = () => {
				if (x.isFallbackMountPending = !1, !x.isInFallback) return;
				let e = x.vnode.ssFallback;
				d(null, e, i, o, r, null, a, s, c), ys(x, e);
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
				tr(t, e, 0);
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
				t(e, s, h(a || e.subTree.el), a ? null : m(e.subTree), x, r, n), c && (s.placeholder = null, g(c)), jo(e, s.el), i && --x.deps === 0 && x.resolve();
			});
		},
		unmount(e, t) {
			x.isUnmounted = !0, x.activeBranch && p(x.activeBranch, n, e, t), x.pendingBranch && p(x.pendingBranch, n, e, t);
		}
	};
	return x;
}
function hs(e, t, n, r, i, a, o, s, c) {
	let l = t.suspense = ms(t, r, n, e.parentNode, document.createElement("div"), null, i, a, o, s, !0), u = c(e, l.pendingBranch = t.ssContent, n, l, a, o);
	return l.deps === 0 && l.resolve(!1, !0), u;
}
function gs(e) {
	let { shapeFlag: t, children: n } = e, r = t & 32;
	e.ssContent = _s(r ? n.default : n), e.ssFallback = r ? _s(n.fallback) : J(Cs);
}
function _s(e) {
	let t;
	if (j(e)) {
		let n = Os && e._c;
		n && (e._d = !1, W()), e = e(), n && (e._d = !0, t = Es, Ds());
	}
	return k(e) && (e = To(e)), e = Hs(e), t && !e.dynamicChildren && (e.dynamicChildren = t.filter((t) => t !== e)), e;
}
function vs(e, t) {
	t && t.pendingBranch ? k(e) ? t.effects.push(...e) : t.effects.push(e) : mr(e);
}
function ys(e, t) {
	e.activeBranch = t;
	let { vnode: n, parentComponent: r } = e, i = t.el;
	for (; !i && t.component;) t = t.component.subTree, i = t.el;
	n.el = i, r && r.subTree === n && (r.vnode.el = i, jo(r, i));
}
function bs(e) {
	let t = e.props && e.props.suspensible;
	return t != null && t !== !1;
}
var xs = /* @__PURE__ */ Symbol.for("v-fgt"), Ss = /* @__PURE__ */ Symbol.for("v-txt"), Cs = /* @__PURE__ */ Symbol.for("v-cmt"), ws = /* @__PURE__ */ Symbol.for("v-stc"), Ts = [], Es = null;
function W(e = !1) {
	Ts.push(Es = e ? null : []);
}
function Ds() {
	Ts.pop(), Es = Ts[Ts.length - 1] || null;
}
var Os = 1;
function ks(e, t = !1) {
	Os += e, e < 0 && Es && t && (Es.hasOnce = !0);
}
function As(e) {
	return e.dynamicChildren = Os > 0 ? Es || b : null, Ds(), Os > 0 && Es && Es.push(e), e;
}
function G(e, t, n, r, i, a) {
	return As(q(e, t, n, r, i, a, !0));
}
function K(e, t, n, r, i) {
	return As(J(e, t, n, r, i, !0));
}
function js(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function Ms(e, t) {
	return e.type === t.type && e.key === t.key;
}
function Ns(e) {}
var Ps = ({ key: e }) => e ?? null, Fs = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : M(e) || /* @__PURE__ */ xn(e) || j(e) ? {
	i: wr,
	r: e,
	k: t,
	f: !!n
} : e);
function q(e, t = null, n = null, r = 0, i = null, a = e === xs ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && Ps(t),
		ref: t && Fs(t),
		scopeId: Tr,
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
		ctx: wr
	};
	return s ? (Ws(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= M(n) ? 8 : 16), Os > 0 && !o && Es && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Es.push(c), c;
}
var J = Is;
function Is(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== Ca || (e = Cs), js(e)) {
		let r = Rs(e, t, !0);
		return n && Ws(r, n), Os > 0 && !a && Es && (r.shapeFlag & 6 ? Es[Es.indexOf(e)] = r : Es.push(r)), r.patchFlag = -2, r;
	}
	if (_c(e) && (e = e.__vccOpts), t) {
		t = Ls(t);
		let { class: e, style: n } = t;
		e && !M(e) && (t.class = Ae(e)), N(n) && (/* @__PURE__ */ _n(n) && !k(n) && (n = T({}, n)), t.style = Te(n));
	}
	let o = M(e) ? 1 : cs(e) ? 128 : Kr(e) ? 64 : N(e) ? 4 : j(e) ? 2 : 0;
	return q(e, t, n, r, i, o, a, !0);
}
function Ls(e) {
	return e ? /* @__PURE__ */ _n(e) || Po(e) ? T({}, e) : e : null;
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
		patchFlag: t && e.type !== xs ? o === -1 ? 16 : o | 16 : o,
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
	return c && r && gi(u, c.clone(u)), u;
}
function zs(e = " ", t = 0) {
	return J(Ss, null, e, t);
}
function Bs(e, t) {
	let n = J(ws, null, e);
	return n.staticCount = t, n;
}
function Vs(e = "", t = !1) {
	return t ? (W(), K(Cs, null, e)) : J(Cs, null, e);
}
function Hs(e) {
	return e == null || typeof e == "boolean" ? J(Cs) : k(e) ? J(xs, null, e.slice()) : js(e) ? Us(e) : J(Ss, null, String(e));
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
			!r && !Po(t) ? t._ctx = wr : r === 3 && wr && (wr.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (j(t)) {
		if (r & 65) {
			Ws(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: wr
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [zs(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function Gs(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = Ae([t.class, r.class]));
		else if (e === "style") t.style = Te([t.style, r.style]);
		else if (C(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(k(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !w(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function Ks(e, t, n, r = null) {
	er(e, t, 7, [n, r]);
}
var qs = mo(), Js = 0;
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
		scope: new Ge(!0),
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
		propsOptions: Bo(r, i),
		emitsOptions: So(r, i),
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
	return a.ctx = { _: a }, a.root = t ? t.root : a, a.emit = bo.bind(null, a), e.ce && e.ce(a), a;
}
var Zs = null, Qs = () => Zs || wr, $s, ec;
{
	let e = Ce(), t = (t, n) => {
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
	Fo(e, r, a, t), Jo(e, i, n || t);
	let o = a ? oc(e, t) : void 0;
	return t && ec(!1), o;
}
function oc(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Fa);
	let { setup: r } = n;
	if (r) {
		ft();
		let n = e.setupContext = r.length > 1 ? mc(e) : null, i = tc(e), a = $n(r, e, 0, [e.props, n]), o = ie(a);
		if (pt(), i(), (o || e.sp) && !Xi(e) && bi(e), o) {
			if (a.then(nc, nc), t) return a.then((n) => {
				ec(!0);
				try {
					sc(e, n, t);
				} finally {
					ec(!1);
				}
			}).catch((t) => {
				tr(t, e, 0);
			});
			e.asyncDep = a;
		} else sc(e, a, t);
	} else fc(e, t);
}
function sc(e, t, n) {
	j(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : N(t) && (e.setupState = On(t)), fc(e, n);
}
var cc, lc;
function uc(e) {
	cc = e, lc = (e) => {
		e.render._rc && (e.withProxy = new Proxy(e.ctx, Ia));
	};
}
var dc = () => !cc;
function fc(e, t, n) {
	let r = e.type;
	if (!e.render) {
		if (!t && cc && !r.render) {
			let t = r.template || ro(e).template;
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
		ft();
		try {
			$a(e);
		} finally {
			pt(), t();
		}
	}
}
var pc = { get(e, t) {
	return Ct(e, "get", ""), e[t];
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
	return e.exposed ? e.exposeProxy ||= new Proxy(On(vn(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Na) return Na[n](e);
		},
		has(e, t) {
			return t in e || t in Na;
		}
	}) : e.proxy;
}
function gc(e, t = !0) {
	return j(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function _c(e) {
	return j(e) && "__vccOpts" in e;
}
var Y = (e, t) => /* @__PURE__ */ Ln(e, t, ic);
function vc(e, t, n) {
	try {
		ks(-1);
		let r = arguments.length;
		return r === 2 ? N(t) && !k(t) ? js(t) ? J(e, null, [t]) : J(e, t) : J(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && js(n) && (n = [n]), J(e, t, n));
	} finally {
		ks(1);
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
	for (let e = 0; e < n.length; e++) if (ve(n[e], t[e])) return !1;
	return Os > 0 && Es && Es.push(e), !0;
}
var Sc = "3.5.44", Cc = x, wc = Qn, Tc = xr, Ec = Cr, Dc = {
	createComponentInstance: Xs,
	setupComponent: ac,
	renderComponentRoot: wo,
	setCurrentRenderingInstance: Er,
	isVNode: js,
	normalizeVNode: Hs,
	getComponentPublicInstance: hc,
	ensureValidVNode: Aa,
	pushWarningContext: Jn,
	popWarningContext: Yn
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
}, Bc = /* @__PURE__ */ T({}, ci, zc), Vc = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = Bc, e))((e, { slots: t }) => vc(di, Wc(e), t)), Hc = (e, t = []) => {
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
	return xe(e);
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
	fa(() => {
		mr(r);
	}), da(() => {
		Br(r, x, { flush: "post" });
		let e = new MutationObserver(r);
		e.observe(t.subTree.el.parentNode, { childList: !0 }), ha(() => e.disconnect());
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
	else if (e.type === xs) e.children.forEach((e) => ul(e, t));
	else if (e.type === ws) {
		let { el: n, anchor: r } = e;
		for (; n && (dl(n, t), n !== r);) n = n.nextSibling;
	}
}
function dl(e, t) {
	if (e.nodeType === 1) {
		let n = e.style, r = "";
		for (let e in t) {
			let i = Ue(t[e]);
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
		ml.test(n) ? e.setProperty(he(r), n.replace(ml, ""), "important") : e[r] = n;
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
	let r = pe(t);
	if (r !== "filter" && r in e) return _l[t] = r;
	r = ge(r);
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
function xl(e, t, n, r, i, a = Me(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(bl, t.slice(6, t.length)) : e.setAttributeNS(bl, t, n) : n == null || a && !Ne(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : re(n) ? String(n) : n);
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
		r === "boolean" ? n = Ne(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
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
	return [e[2] === ":" ? e.slice(3) : he(e.slice(2)), t];
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
				e && er(e, t, 5, a);
			}
		} else er(r, t, 5, [e]);
	};
	return n.value = e, n.attached = Ml(), n;
}
var Pl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Fl = (e, t, n, r, i, a) => {
	let o = i === "svg";
	t === "class" ? nl(e, r, o) : t === "style" ? pl(e, n, r) : C(t) ? w(t) || El(e, t, n, r, a) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : Il(e, t, r, o)) ? (Sl(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || xl(e, t, r, o, a, t !== "value")) : e._isVueCE && (Ll(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !M(r))) ? Sl(e, pe(t), r, a, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), xl(e, t, r, o));
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
	let r = pe(t);
	return Array.isArray(n) ? n.some((e) => pe(e) === r) : Object.keys(n).some((e) => pe(e) === r);
}
var Rl = {};
// @__NO_SIDE_EFFECTS__
function zl(e, t, n) {
	let r = /* @__PURE__ */ H(e, t);
	ce(r) && (r = T({}, r, t));
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
		this._connected = !1, ur(() => {
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
				(t === Number || t && t.type === Number) && (e in this._props && (this._props[e] = xe(this._props[e])), (i ||= /* @__PURE__ */ Object.create(null))[pe(e)] = !0);
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
		if (t) for (let e in t) O(this, e) || Object.defineProperty(this, e, { get: () => B(t[e]) });
	}
	_resolveProps(e) {
		let { props: t } = e, n = k(t) ? t : Object.keys(t || {});
		for (let e of Object.keys(this)) e[0] !== "_" && n.includes(e) && this._setProp(e, this[e]);
		for (let e of n.map(pe)) Object.defineProperty(this, e, {
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
		let t = this.hasAttribute(e), n = t ? this.getAttribute(e) : Rl, r = pe(e);
		t && this._numberProps && this._numberProps[r] && (n = xe(n)), this._setProp(r, n, !1, !0);
	}
	_getProp(e) {
		return this._props[e];
	}
	_setProp(e, t, n = !0, r = !1) {
		if (t !== this._props[e] && (this._dirty = !0, t === Rl ? delete this._props[e] : (this._props[e] = t, e === "key" && this._app && (this._app._ceVNode.key = t)), r && this._instance && this._update(), n)) {
			let n = this._ob;
			n && (this._processMutations(n.takeRecords()), n.disconnect()), t === !0 ? this.setAttribute(he(e), "") : typeof t == "string" || typeof t == "number" ? this.setAttribute(he(e), t + "") : t || this.removeAttribute(he(e)), n && n.observe(this, { attributes: !0 });
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
				this.dispatchEvent(new CustomEvent(e, ce(t[0]) ? T({ detail: t }, t[0]) : { detail: t }));
			};
			e.emit = (e, ...n) => {
				t(e, n), he(e) !== e && t(he(e), n);
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
		let n = Qs(), r = oi(), i, a, o, s, c = () => (s === void 0 && (s = i.length > 0 && ou(i[0].el, n.vnode.el, $l(e))), s);
		return pa(() => {
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
			let l = /* @__PURE__ */ R(e), u = Wc(l), d = l.tag || xs;
			if (i = [], s = void 0, a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && !t.el[il] && (i.push(t), gi(t, pi(t, u, r, n)), Kl.set(t, nu(t.el)));
			}
			a = t.default ? _i(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && gi(t, pi(t, u, r, n));
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
	return k(t) ? (e) => P(t, e) : t;
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
	return t && (e = e.trim()), n && (e = be(e)), e;
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
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? be(e.value) : e.value, c = t ?? "";
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
				let e = ze(t, n), a = e !== -1;
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
	if (k(t)) i = ze(t, r.props.value) > -1;
	else if (te(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = Re(t, xu(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var gu = {
	created(e, { value: t }, n) {
		e.checked = Re(t, n.props.value), e[uu] = su(n), Cl(e, "change", () => {
			e[uu](bu(e));
		});
	},
	beforeUpdate(e, { value: t, oldValue: n }, r) {
		e[uu] = su(r), t !== n && (e.checked = Re(t, r.props.value));
	}
}, _u = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, Cl(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? be(bu(e)) : bu(e)), r = e.multiple, i = r ? te(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? k(i) ? t.slice() : t : i];
			try {
				e[uu](i);
			} finally {
				ur(() => {
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
	if (!n || k(e)) return Re(e, t);
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
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : ze(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (Re(bu(a), t)) {
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
		if (t.props && Re(t.props.value, e)) return { checked: !0 };
	}, mu.getSSRProps = ({ value: e }, t) => {
		if (k(e)) {
			if (t.props && ze(e, t.props.value) > -1) return { checked: !0 };
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
		let r = he(n.key);
		if (t.some((e) => e === r || ku[e] === r)) return e(n);
	}));
}, ju = /* @__PURE__ */ T({ patchProp: Fl }, Fc), Mu, Nu = !1;
function Pu() {
	return Mu ||= Zo(ju);
}
function Fu() {
	return Mu = Nu ? Mu : Qo(ju), Nu = !0, Mu;
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
	BaseTransition: () => di,
	BaseTransitionPropsValidators: () => ci,
	Comment: () => Cs,
	DeprecationTypes: () => null,
	EffectScope: () => Ge,
	ErrorCodes: () => Zn,
	ErrorTypeStrings: () => wc,
	Fragment: () => xs,
	KeepAlive: () => ea,
	ReactiveEffect: () => Xe,
	Static: () => ws,
	Suspense: () => us,
	Teleport: () => ti,
	Text: () => Ss,
	TrackOpTypes: () => Rn,
	Transition: () => Vc,
	TransitionGroup: () => Zl,
	TriggerOpTypes: () => zn,
	VueElement: () => Hl,
	assertNumber: () => Xn,
	callWithAsyncErrorHandling: () => er,
	callWithErrorHandling: () => $n,
	camelize: () => pe,
	capitalize: () => ge,
	cloneVNode: () => Rs,
	compatUtils: () => null,
	compile: () => Gu,
	computed: () => Y,
	createApp: () => Ru,
	createBlock: () => K,
	createCommentVNode: () => Vs,
	createElementBlock: () => G,
	createElementVNode: () => q,
	createHydrationRenderer: () => Qo,
	createPropsRestProxy: () => Xa,
	createRenderer: () => Zo,
	createSSRApp: () => zu,
	createSlots: () => ka,
	createStaticVNode: () => Bs,
	createTextVNode: () => zs,
	createVNode: () => J,
	customRef: () => An,
	defineAsyncComponent: () => Zi,
	defineComponent: () => H,
	defineCustomElement: () => zl,
	defineEmits: () => Ra,
	defineExpose: () => za,
	defineModel: () => Ha,
	defineOptions: () => Ba,
	defineProps: () => La,
	defineSSRCustomElement: () => Bl,
	defineSlots: () => Va,
	devtools: () => Tc,
	effect: () => ct,
	effectScope: () => Ke,
	getCurrentInstance: () => Qs,
	getCurrentScope: () => qe,
	getCurrentWatcher: () => Un,
	getTransitionRawChildren: () => _i,
	guardReactiveProps: () => Ls,
	h: () => vc,
	handleError: () => tr,
	hasInjectionContext: () => Pr,
	hydrate: () => Lu,
	hydrateOnIdle: () => Wi,
	hydrateOnInteraction: () => Ji,
	hydrateOnMediaQuery: () => qi,
	hydrateOnVisible: () => Ki,
	initCustomFormatter: () => yc,
	initDirectivesForSSR: () => Uu,
	inject: () => Nr,
	isMemoSame: () => xc,
	isProxy: () => _n,
	isReactive: () => mn,
	isReadonly: () => hn,
	isRef: () => xn,
	isRuntimeOnly: () => dc,
	isShallow: () => gn,
	isVNode: () => js,
	markRaw: () => vn,
	mergeDefaults: () => Ja,
	mergeModels: () => Ya,
	mergeProps: () => Gs,
	nextTick: () => ur,
	nodeOps: () => Fc,
	normalizeClass: () => Ae,
	normalizeProps: () => je,
	normalizeStyle: () => Te,
	onActivated: () => na,
	onBeforeMount: () => ua,
	onBeforeUnmount: () => ma,
	onBeforeUpdate: () => fa,
	onDeactivated: () => ra,
	onErrorCaptured: () => ya,
	onMounted: () => da,
	onRenderTracked: () => va,
	onRenderTriggered: () => _a,
	onScopeDispose: () => Je,
	onServerPrefetch: () => ga,
	onUnmounted: () => ha,
	onUpdated: () => pa,
	onWatcherCleanup: () => Wn,
	openBlock: () => W,
	patchProp: () => Fl,
	popScopeId: () => Or,
	provide: () => Mr,
	proxyRefs: () => On,
	pushScopeId: () => Dr,
	queuePostFlushCb: () => mr,
	reactive: () => ln,
	readonly: () => dn,
	ref: () => z,
	registerRuntimeCompiler: () => uc,
	render: () => Iu,
	renderList: () => Oa,
	renderSlot: () => U,
	resolveComponent: () => Sa,
	resolveDirective: () => Ta,
	resolveDynamicComponent: () => wa,
	resolveFilter: () => null,
	resolveTransitionHooks: () => pi,
	setBlockTracking: () => ks,
	setDevtoolsHook: () => Ec,
	setTransitionHooks: () => gi,
	shallowReactive: () => un,
	shallowReadonly: () => fn,
	shallowRef: () => Sn,
	ssrContextKey: () => Fr,
	ssrUtils: () => Dc,
	stop: () => lt,
	toDisplayString: () => F,
	toHandlerKey: () => _e,
	toHandlers: () => ja,
	toRaw: () => R,
	toRef: () => Pn,
	toRefs: () => jn,
	toValue: () => En,
	transformVNodeArgs: () => Ns,
	triggerRef: () => Tn,
	unref: () => B,
	useAttrs: () => Ga,
	useCssModule: () => Gl,
	useCssVars: () => ll,
	useHost: () => Ul,
	useId: () => yi,
	useModel: () => vo,
	useSSRContext: () => Ir,
	useShadowRoot: () => Wl,
	useSlots: () => Wa,
	useTemplateRef: () => xi,
	useTransitionState: () => oi,
	vModelCheckbox: () => mu,
	vModelDynamic: () => Su,
	vModelRadio: () => gu,
	vModelSelect: () => _u,
	vModelText: () => pu,
	vShow: () => al,
	version: () => Sc,
	warn: () => Cc,
	watch: () => Br,
	watchEffect: () => Lr,
	watchPostEffect: () => Rr,
	watchSyncEffect: () => zr,
	withAsyncContext: () => Za,
	withCtx: () => V,
	withDefaults: () => Ua,
	withDirectives: () => Ar,
	withKeys: () => Au,
	withMemo: () => bc,
	withModifiers: () => Ou,
	withScopeId: () => kr
}), Gu = () => {}, Ku = typeof window < "u", qu, Ju = (e) => qu = e, Yu = Symbol();
function Xu(e) {
	return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function";
}
var Zu = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof global == "object" && global.global === global ? global : typeof globalThis == "object" ? globalThis : { HTMLElement: null };
function Qu(e, { autoBom: t = !1 } = {}) {
	return t && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["﻿", e], { type: e.type }) : e;
}
function $u(e, t, n) {
	let r = new XMLHttpRequest();
	r.open("GET", e), r.responseType = "blob", r.onload = function() {
		id(r.response, t, n);
	}, r.onerror = function() {
		console.error("could not download file");
	}, r.send();
}
function ed(e) {
	let t = new XMLHttpRequest();
	t.open("HEAD", e, !1);
	try {
		t.send();
	} catch {}
	return t.status >= 200 && t.status <= 299;
}
function td(e) {
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
var nd = typeof navigator == "object" ? navigator : { userAgent: "" }, rd = /Macintosh/.test(nd.userAgent) && /AppleWebKit/.test(nd.userAgent) && !/Safari/.test(nd.userAgent), id = Ku ? typeof HTMLAnchorElement < "u" && "download" in HTMLAnchorElement.prototype && !rd ? ad : "msSaveOrOpenBlob" in nd ? od : sd : () => {};
function ad(e, t = "download", n) {
	let r = document.createElement("a");
	r.download = t, r.rel = "noopener", typeof e == "string" ? (r.href = e, r.origin === location.origin ? td(r) : ed(r.href) ? $u(e, t, n) : (r.target = "_blank", td(r))) : (r.href = URL.createObjectURL(e), setTimeout(function() {
		URL.revokeObjectURL(r.href);
	}, 4e4), setTimeout(function() {
		td(r);
	}, 0));
}
function od(e, t = "download", n) {
	if (typeof e == "string") {
		if (ed(e)) $u(e, t, n);
		else {
			let t = document.createElement("a");
			t.href = e, t.target = "_blank", setTimeout(function() {
				td(t);
			});
		}
	} else navigator.msSaveOrOpenBlob(Qu(e, n), t);
}
function sd(e, t, n, r) {
	if (r ||= open("", "_blank"), r && (r.document.title = r.document.body.innerText = "downloading..."), typeof e == "string") return $u(e, t, n);
	let i = e.type === "application/octet-stream", a = /constructor/i.test(String(Zu.HTMLElement)) || "safari" in Zu, o = /CriOS\/[\d]+/.test(navigator.userAgent);
	if ((o || i && a || rd) && typeof FileReader < "u") {
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
var { assign: cd } = Object;
function ld() {
	let e = Ke(!0), t = e.run(() => /* @__PURE__ */ z({})), n = [], r = [], i = vn({
		install(e) {
			Ju(i), i._a = e, e.provide(Yu, i), e.config.globalProperties.$pinia = i, r.forEach((e) => n.push(e)), r = [];
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
var ud = () => {};
function dd(e, t, n, r = ud) {
	e.add(t);
	let i = () => {
		e.delete(t) && r();
	};
	return !n && qe() && Je(i), i;
}
function fd(e, ...t) {
	e.forEach((e) => {
		e(...t);
	});
}
var pd = (e) => e(), md = Symbol(), hd = Symbol();
function gd(e, t) {
	e instanceof Map && t instanceof Map ? t.forEach((t, n) => e.set(n, t)) : e instanceof Set && t instanceof Set && t.forEach(e.add, e);
	for (let n in t) {
		if (!Object.hasOwn(t, n)) continue;
		let r = t[n], i = e[n];
		if (Xu(i) && Xu(r) && Object.hasOwn(e, n) && !/* @__PURE__ */ xn(r) && !/* @__PURE__ */ mn(r)) {
			e[n] = gd(i, r);
			let t = (/* @__PURE__ */ R(e))[n];
			/* @__PURE__ */ xn(t) && /* @__PURE__ */ gn(t) && Tn(t);
		} else e[n] = r;
	}
	return e;
}
var _d = Symbol();
function vd(e) {
	return !e || typeof e != "object" || !Object.hasOwn(e, _d);
}
var { assign: yd } = Object;
function bd(e) {
	return !!(/* @__PURE__ */ xn(e) && e.effect);
}
function xd(e, t, n, r) {
	let { state: i, actions: a, getters: o } = t, s = n.state.value[e], c;
	function l() {
		return s || 
		/* istanbul ignore if */
		(n.state.value[e] = i ? i() : {}), yd(/* @__PURE__ */ jn(n.state.value[e]), a, Object.keys(o || {}).reduce((t, r) => (t[r] = vn(Y(() => {
			Ju(n);
			let t = n._s.get(e);
			return o[r].call(t, t);
		})), t), {}));
	}
	return c = Sd(e, l, t, n, r, !0), c;
}
function Sd(e, t, n = {}, r, i, a) {
	let o, s = yd({ actions: {} }, n), c = { deep: !0 }, l, u, d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), p, m = r.state.value[e];
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
		}) : (gd(r.state.value[e], t), n = {
			type: "patch object",
			payload: t,
			storeId: e,
			events: p
		});
		let i = h = Symbol();
		ur().then(() => {
			h === i && (l = !0);
		}), u = !0, fd(d, n, r.state.value[e]);
	}
	let _ = a ? function() {
		let { state: e } = n, t = e ? e() : {};
		this.$patch((e) => {
			yd(e, t);
		});
	} : ud;
	function v() {
		o.stop(), d.clear(), f.clear(), r._s.delete(e);
	}
	let y = (t, n = "") => {
		if (md in t) return t[hd] = n, t;
		let i = function() {
			Ju(r);
			let n = Array.from(arguments), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
			function s(e) {
				a.add(e);
			}
			function c(e) {
				o.add(e);
			}
			fd(f, {
				args: n,
				name: i[hd],
				store: b,
				after: s,
				onError: c
			});
			let l;
			try {
				l = t.apply(this && this.$id === e ? this : b, n);
			} catch (e) {
				throw fd(o, e), e;
			}
			return l instanceof Promise ? l.then((e) => (fd(a, e), e)).catch((e) => (fd(o, e), Promise.reject(e))) : (fd(a, l), l);
		};
		return i[md] = !0, i[hd] = n, i;
	}, b = /* @__PURE__ */ ln({
		_p: r,
		$id: e,
		$onAction: dd.bind(null, f),
		$patch: g,
		$reset: _,
		$subscribe(t, n = {}) {
			if (d.has(t)) return ud;
			let i = dd(d, t, n.detached, () => a()), a = o.run(() => Br(() => r.state.value[e], (r) => {
				(n.flush === "sync" ? u : l) && t({
					storeId: e,
					type: "direct",
					events: p
				}, r);
			}, yd({}, c, n)));
			return i;
		},
		$dispose: v
	});
	r._s.set(e, b);
	let x = (r._a && r._a.runWithContext || pd)(() => r._e.run(() => (o = Ke()).run(() => t({ action: y }))));
	for (let t in x) {
		let n = x[t];
		/* @__PURE__ */ xn(n) && !bd(n) || /* @__PURE__ */ mn(n) ? a || (m && vd(n) && (/* @__PURE__ */ xn(n) ? n.value = m[t] : ((n instanceof Set || n instanceof Map) && n.clear(), gd(n, m[t]))), r.state.value[e][t] = n) : typeof n == "function" && (x[t] = y(n, t), s.actions[t] = n);
	}
	return yd(b, x), yd(/* @__PURE__ */ R(b), x), Object.defineProperty(b, "$state", {
		get: () => r.state.value[e],
		set: (e) => {
			g((t) => {
				yd(t, e);
			});
		}
	}), r._p.forEach((e) => {
		let t = o.run(() => e({
			store: b,
			app: r._a,
			pinia: r,
			options: s
		}));
		yd(b, t);
	}), m && a && n.hydrate && n.hydrate(b.$state, m), l = !0, u = !0, b;
}
function Cd(e, t, n) {
	let r, i = typeof t == "function";
	r = i ? n : t;
	function a(n, a) {
		let o = Pr();
		return n ||= o ? Nr(Yu, null) : null, n && Ju(n), n = qu, n._s.has(e) || (i ? Sd(e, t, r, n) : xd(e, r, n)), n._s.get(e);
	}
	return a.$id = e, a;
}
// src/stores/ui.ts
var wd = {
	home: "首页",
	library: "库",
	settings: "设置"
}, Td = Cd("ui", () => {
	let e = /* @__PURE__ */ z(!1), t = /* @__PURE__ */ z("home"), n = /* @__PURE__ */ z(!1), r = /* @__PURE__ */ z("ext"), i = /* @__PURE__ */ z(null);
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
}), Ed = {
	success: 4e3,
	info: 4e3,
	undo: 6e3,
	error: 8e3,
	status: 6e3
}, Dd = Cd("toast", () => {
	let e = /* @__PURE__ */ z([]), t = /* @__PURE__ */ new Map(), n = 1;
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
		return i(s, Ed[t]), s;
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
}), Od = [
	"data-kind",
	"onPointerenter",
	"onPointerleave",
	"onFocusin",
	"onFocusout"
], kd = { class: "trpg-toast__text" }, Ad = ["onClick"], jd = /* @__PURE__ */ H({
	__name: "ToastHost",
	setup(e) {
		let t = Dd();
		return (e, n) => (W(), K(Zl, {
			name: "trpg-toast",
			tag: "div",
			class: "trpg-toasts",
			role: "status",
			"aria-live": "polite"
		}, {
			default: V(() => [(W(!0), G(xs, null, Oa(B(t).toasts, (e) => (W(), G("div", {
				key: e.id,
				class: "trpg-toast",
				"data-kind": e.kind,
				onPointerenter: (n) => B(t).pause(e.id),
				onPointerleave: (n) => B(t).resume(e.id),
				onFocusin: (n) => B(t).pause(e.id),
				onFocusout: (n) => B(t).resume(e.id)
			}, [q("span", kd, F(e.message), 1), e.undo ? (W(), G("button", {
				key: 0,
				type: "button",
				onClick: (n) => B(t).runUndo(e.id)
			}, "撤销", 8, Ad)) : Vs("", !0)], 40, Od))), 128))]),
			_: 1
		}));
	}
});
// src/host/input.ts
function Md(e) {
	let t = f();
	if (!t) return !1;
	let n = t.value, r = n ? `${n}${n.endsWith("\n") ? "" : "\n"}${e}` : e;
	return _(t, r), t.value === r;
}
// src/host/clipboard.ts
async function Nd(e) {
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
var Pd = 1e3, Fd = "例如 2d6+3、1d20+5、4d6";
function Id(e) {
	let t = e.replace(/\s+/g, "").toLowerCase().replace(/＋/g, "+").replace(/－|−/g, "-");
	if (!t) return {
		ok: !1,
		error: `请输入骰式，${Fd}`
	};
	let n = [], r = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/y, i = 0;
	for (; i < t.length;) {
		r.lastIndex = i;
		let a = r.exec(t);
		if (!a || i > 0 && !(a[1] || a[4])) return {
			ok: !1,
			error: `骰式看不懂：「${e.trim()}」。${Fd}`
		};
		if (i = r.lastIndex, a[3] !== void 0) {
			let e = a[1] === "-" ? -1 : 1, t = a[2] === "" ? 1 : Number(a[2]), r = Number(a[3]);
			if (t < 1 || t > 100) return {
				ok: !1,
				error: "一次最多掷 100 颗骰子"
			};
			if (r < 2 || r > 1e3) return {
				ok: !1,
				error: `骰子面数要在 2 到 ${Pd} 之间`
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
		error: `骰式里至少要有一组骰子，${Fd}`
	};
}
function Ld(e) {
	return e.map((e, t) => {
		let n = e.sign === -1 ? "-" : t === 0 ? "" : "+";
		return e.kind === "dice" ? `${n}${e.count}d${e.sides}` : `${n}${e.value}`;
	}).join("");
}
// src/rules/dice/roll.ts
var Rd = () => {
	let e = /* @__PURE__ */ new Uint32Array(1);
	return crypto.getRandomValues(e), e[0] / 4294967296;
};
function zd(e, t) {
	return Math.min(t, Math.floor(e() * t) + 1);
}
function Bd(e, t = {}) {
	let n = Id(e);
	if (!n.ok) throw Error(n.error);
	let r = t.rng ?? Rd, i = t.mode ?? "normal", a = [...n.terms];
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
			let t = [zd(r, 20), zd(r, 20)], n = i === "adv" ? t[0] >= t[1] ? 0 : 1 : t[0] <= t[1] ? 0 : 1;
			return !s && e.sign === 1 && (s = !0, o = t[n] === 20 ? 20 : t[n] === 1 ? 1 : void 0), {
				term: e,
				rolls: t,
				kept: n,
				subtotal: e.sign * t[n]
			};
		}
		let n = Array.from({ length: e.count }, () => zd(r, e.sides));
		return t && !s && e.sign === 1 && (s = !0, o = n[0] === 20 ? 20 : n[0] === 1 ? 1 : void 0), {
			term: e,
			rolls: n,
			subtotal: e.sign * n.reduce((e, t) => e + t, 0)
		};
	});
	return {
		expression: Ld(a),
		mode: i,
		terms: c,
		total: c.reduce((e, t) => e + t.subtotal, 0),
		...o ? { natural: o } : {}
	};
}
// src/rules/dice/format.ts
var Vd = {
	normal: "",
	adv: " 优势",
	dis: " 劣势"
};
function Hd(e) {
	return e.terms.map((t, n) => {
		let r = t.term.sign === -1 ? "- " : n === 0 ? "" : "+ ";
		return t.term.kind === "const" ? `${r}${t.term.value}` : t.kept === void 0 ? `${r}${t.rolls.join(" + ")}` : `${r}取${e.mode === "adv" ? "高" : "低"} ${t.rolls.join("/")}`;
	}).join(" ");
}
function Ud(e) {
	return `${e.expression}${Vd[e.mode]} = ${e.total}（${Hd(e)}）`;
}
function Wd(e, t) {
	let n = t.trim().replace(/-{2,}/g, "—").replace(/[<>]/g, "");
	return `<!-- [掷骰] ${n ? `${n}：` : ""}${e} -->`;
}
var Gd = "trpg-assistant:dice";
function Kd(e) {
	return e ? `${Gd}:${e}` : Gd;
}
function qd(e) {
	let t = {
		history: [],
		bonus: 0,
		mode: "normal",
		note: ""
	};
	try {
		let n = localStorage.getItem(Kd(e));
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
var Jd = Cd("dice", () => {
	let e = null, t = Rd, n = 1, r, i = qd(null), a = /* @__PURE__ */ z(i.history), o = /* @__PURE__ */ z(i.bonus), s = /* @__PURE__ */ z(i.mode), c = /* @__PURE__ */ z(i.note), l = /* @__PURE__ */ z(""), u = /* @__PURE__ */ z(null), d = /* @__PURE__ */ z(""), f = /* @__PURE__ */ z("idle"), p = /* @__PURE__ */ z(!1);
	function m() {
		try {
			localStorage.setItem(Kd(e), JSON.stringify({
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
		let n = qd(t);
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
			line: Ud(e),
			...e.natural ? { natural: e.natural } : {}
		};
		return u.value = t, a.value = [t, ...a.value].slice(0, 20), f.value = "idle", p.value = !1, d.value = "", m(), t;
	}
	function v(e) {
		let n = e === 20;
		return _(Bd(`1d${e}`, {
			rng: t,
			mode: n ? s.value : "normal",
			bonus: n ? o.value : 0
		}));
	}
	function y() {
		try {
			return _(Bd(l.value, {
				rng: t,
				mode: s.value
			}));
		} catch (e) {
			return d.value = e instanceof Error ? e.message : String(e), null;
		}
	}
	function b(e) {
		return _(Bd(e.expression, {
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
	let T = (e) => Wd(e.line, e.note);
	function E() {
		if (!u.value) return !1;
		let e = Md(T(u.value));
		return f.value = e ? "done" : "failed", r !== void 0 && clearTimeout(r), e && (r = setTimeout(() => f.value = "idle", 2e3)), e;
	}
	async function D() {
		return u.value ? (p.value = await Nd(T(u.value)), p.value) : !1;
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
		fill: E,
		copy: D,
		commentOf: T
	};
}), Yd = {
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
}, Xd = [
	"width",
	"height",
	"innerHTML"
], Zd = /* @__PURE__ */ H({
	__name: "Icon",
	props: {
		name: {},
		size: {}
	},
	setup(e) {
		let t = e, n = Y(() => Yd[t.name] ?? ""), r = Y(() => `${t.size ?? 18}px`);
		return (e, t) => (W(), G("svg", {
			class: "trpg-icon",
			viewBox: "0 0 256 256",
			fill: "currentColor",
			"aria-hidden": "true",
			focusable: "false",
			width: r.value,
			height: r.value,
			innerHTML: n.value
		}, null, 8, Xd));
	}
}), Qd = ["aria-label"], $d = ["aria-pressed", "onClick"], ef = /* @__PURE__ */ H({
	__name: "Segmented",
	props: /*@__PURE__*/ Ya({
		options: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = vo(e, "modelValue");
		return (n, r) => (W(), G("div", {
			class: "trpg-seg",
			role: "group",
			"aria-label": e.label
		}, [(W(!0), G(xs, null, Oa(e.options, (e) => (W(), G("button", {
			key: e.value,
			type: "button",
			"aria-pressed": t.value === e.value,
			onClick: (n) => t.value = e.value
		}, F(e.label), 9, $d))), 128))], 8, Qd));
	}
});
// src/ui/shell/storage.ts
function tf(e, t) {
	try {
		let n = localStorage.getItem(e);
		if (!n) return t;
		let r = JSON.parse(n);
		return Number.isFinite(r.x) && Number.isFinite(r.y) ? r : t;
	} catch (e) {
		return console.warn("[trpg-assistant] 读取窗口位置失败", e), t;
	}
}
function nf(e, t) {
	try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/useDrag.ts
function rf(e, t, n) {
	return Math.min(Math.max(e, t), Math.max(t, n));
}
function af(e) {
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
				x: (typeof e.lockX == "function" ? e.lockX() : e.lockX) ? s.x : rf(s.x + r, 0, window.innerWidth - l),
				y: rf(s.y + i, 0, window.innerHeight - u)
			};
		}, u = (t) => {
			i.removeEventListener("pointermove", l), i.removeEventListener("pointerup", u), i.removeEventListener("pointercancel", u), i.hasPointerCapture(t.pointerId) && i.releasePointerCapture(t.pointerId), c ? e.onEnd?.() : e.onTap?.();
		};
		i.addEventListener("pointermove", l), i.addEventListener("pointerup", u), i.addEventListener("pointercancel", u);
	}
	return { onPointerDown: n };
}
// src/ui/shell/DiceTray.vue?vue&type=script&setup=true&lang.ts
var of = ["data-narrow"], sf = { class: "trpg-dice__body" }, cf = ["data-natural"], lf = {
	class: "trpg-dice__line",
	"data-testid": "dice-line"
}, uf = ["data-tone"], df = {
	key: 1,
	class: "trpg-dice__placeholder"
}, ff = {
	class: "trpg-dice__quick",
	role: "group",
	"aria-label": "快捷骰"
}, pf = ["onClick"], mf = { class: "trpg-dice__mods" }, hf = {
	class: "trpg-dice__bonus",
	role: "group",
	"aria-label": "d20 加值"
}, gf = ["disabled"], _f = {
	class: "trpg-dice__bonus-value",
	"data-testid": "dice-bonus"
}, vf = ["disabled"], yf = { class: "trpg-field" }, bf = { class: "trpg-dice__expr-row" }, xf = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, Sf = { class: "trpg-field" }, Cf = ["value"], wf = { class: "trpg-dice__out" }, Tf = ["disabled"], Ef = ["disabled"], Df = {
	class: "trpg-dice__recent",
	"aria-label": "最近记录"
}, Of = { class: "trpg-dice__recent-head" }, kf = ["aria-expanded"], Af = {
	key: 1,
	class: "trpg-field__label"
}, jf = {
	key: 0,
	class: "trpg-dice__list"
}, Mf = { class: "trpg-dice__item-total" }, Nf = { class: "trpg-dice__item-main" }, Pf = { class: "trpg-row__meta" }, Ff = ["aria-label", "onClick"], If = /* @__PURE__ */ H({
	__name: "DiceTray",
	setup(e) {
		let t = Td(), n = Jd(), r = [
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
		], a = /* @__PURE__ */ z(null), o = /* @__PURE__ */ z(window.innerWidth), s = /* @__PURE__ */ z(window.innerHeight), c = Y(() => o.value <= 480), l = /* @__PURE__ */ z(tf("trpg-assistant:dice", {
			x: Math.max(8, window.innerWidth - 384),
			y: Math.max(8, window.innerHeight - 640)
		})), u = /* @__PURE__ */ z(!c.value), d = () => ({
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
		let p = af({
			position: l,
			size: d,
			lockX: () => c.value,
			onEnd: () => nf("trpg-assistant:dice", l.value)
		}), m = Y(() => c.value ? {
			left: "4vw",
			width: "92vw",
			top: `${l.value.y}px`
		} : {
			left: `${l.value.x}px`,
			top: `${l.value.y}px`
		});
		da(() => {
			window.addEventListener("resize", f), ur(f);
		}), ma(() => window.removeEventListener("resize", f)), Br(() => t.diceOpen, (e) => e && void ur(f));
		let h = Y(() => n.bonus > 0 ? `+${n.bonus}` : String(n.bonus)), g = Y(() => n.fillState === "done" ? "已填入 ✓" : n.fillState === "failed" ? "尚未填入，再试一次" : "填入输入框"), _ = (e) => new Date(e).toLocaleTimeString("zh-CN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: !1
		});
		return (e, o) => B(t).diceOpen ? (W(), G("aside", {
			key: 0,
			ref_key: "el",
			ref: a,
			class: "trpg-dice",
			style: Te(m.value),
			"data-narrow": c.value,
			role: "dialog",
			"aria-label": "掷骰",
			"aria-modal": "false"
		}, [q("header", {
			class: "trpg-dice__head",
			onPointerdown: o[1] ||= (...e) => B(p).onPointerDown && B(p).onPointerDown(...e)
		}, [
			J(Zd, {
				name: "dice-five",
				size: 20
			}),
			o[14] ||= q("span", { class: "trpg-dice__title" }, "掷骰", -1),
			q("button", {
				class: "trpg-icon-btn",
				type: "button",
				"aria-label": "关闭掷骰",
				onClick: o[0] ||= (e) => B(t).diceOpen = !1
			}, [J(Zd, {
				name: "x",
				size: 18
			})])
		], 32), q("div", sf, [
			q("div", {
				class: "trpg-dice__result",
				"aria-live": "polite",
				"data-natural": B(n).last?.natural
			}, [B(n).last ? (W(), G(xs, { key: 0 }, [
				(W(), G("div", {
					key: B(n).last.id,
					class: "trpg-dice__total",
					"data-testid": "dice-total"
				}, F(B(n).last.total), 1)),
				q("div", lf, F(B(n).last.line), 1),
				B(n).last.natural ? (W(), G("span", {
					key: 0,
					class: "trpg-badge",
					"data-tone": B(n).last.natural === 20 ? "gold" : "danger"
				}, "天然 " + F(B(n).last.natural), 9, uf)) : Vs("", !0)
			], 64)) : (W(), G("p", df, "点一个骰子开始掷"))], 8, cf),
			q("div", ff, [(W(), G(xs, null, Oa(r, (e) => q("button", {
				key: e,
				class: Ae(["trpg-btn", { "trpg-btn--primary": e === 20 }]),
				type: "button",
				onClick: (t) => B(n).rollQuick(e)
			}, " d" + F(e), 11, pf)), 64))]),
			q("div", mf, [J(ef, {
				"model-value": B(n).mode,
				label: "优势或劣势（d20）",
				options: i,
				"onUpdate:modelValue": o[2] ||= (e) => B(n).setMode(e)
			}, null, 8, ["model-value"]), q("div", hf, [
				o[15] ||= q("span", { class: "trpg-field__label" }, "加值", -1),
				q("button", {
					class: "trpg-icon-btn",
					type: "button",
					"aria-label": "加值减 1",
					disabled: B(n).bonus <= B(-20),
					onClick: o[3] ||= (e) => B(n).setBonus(B(n).bonus - 1)
				}, "–", 8, gf),
				q("output", _f, F(h.value), 1),
				q("button", {
					class: "trpg-icon-btn",
					type: "button",
					"aria-label": "加值加 1",
					disabled: B(n).bonus >= B(30),
					onClick: o[4] ||= (e) => B(n).setBonus(B(n).bonus + 1)
				}, "+", 8, vf)
			])]),
			q("form", {
				class: "trpg-dice__expr",
				onSubmit: o[7] ||= Ou((e) => B(n).rollExpression(), ["prevent"])
			}, [q("label", yf, [
				o[17] ||= q("span", { class: "trpg-field__label" }, "骰式", -1),
				q("span", bf, [Ar(q("input", {
					"onUpdate:modelValue": o[5] ||= (e) => B(n).expression = e,
					class: "trpg-input",
					type: "text",
					inputmode: "text",
					placeholder: "2d6+3",
					"aria-label": "骰式",
					autocomplete: "off",
					onKeydown: o[6] ||= Ou(() => {}, ["stop"])
				}, null, 544), [[pu, B(n).expression]]), o[16] ||= q("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "submit"
				}, "掷", -1)]),
				B(n).error ? (W(), G("span", xf, F(B(n).error), 1)) : Vs("", !0)
			])], 32),
			q("label", Sf, [o[18] ||= q("span", { class: "trpg-field__label" }, "说明（可空）", -1), q("input", {
				value: B(n).note,
				class: "trpg-input",
				type: "text",
				placeholder: "感知检定",
				"aria-label": "说明",
				autocomplete: "off",
				onInput: o[8] ||= (e) => B(n).setNote(e.target.value),
				onKeydown: o[9] ||= Ou(() => {}, ["stop"])
			}, null, 40, Cf)]),
			q("div", wf, [q("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: !B(n).last,
				onClick: o[10] ||= (e) => B(n).fill()
			}, F(g.value), 9, Tf), q("button", {
				class: "trpg-btn",
				type: "button",
				disabled: !B(n).last,
				onClick: o[11] ||= (e) => B(n).copy()
			}, F(B(n).copied ? "已复制 ✓" : "复制"), 9, Ef)]),
			q("section", Df, [q("div", Of, [c.value ? (W(), G("button", {
				key: 0,
				class: "trpg-btn trpg-btn--quiet trpg-btn--small",
				type: "button",
				"aria-expanded": u.value,
				onClick: o[12] ||= (e) => u.value = !u.value
			}, [zs(" 最近 " + F(B(n).history.length) + " 次", 1), J(Zd, {
				name: u.value ? "caret-down" : "caret-right",
				size: 14
			}, null, 8, ["name"])], 8, kf)) : (W(), G("span", Af, "最近")), B(n).history.length ? (W(), G("button", {
				key: 2,
				class: "trpg-btn trpg-btn--quiet trpg-btn--small",
				type: "button",
				onClick: o[13] ||= (e) => B(n).clearHistory()
			}, "清空")) : Vs("", !0)]), u.value && B(n).history.length ? (W(), G("ul", jf, [(W(!0), G(xs, null, Oa(B(n).history, (e) => (W(), G("li", {
				key: e.id,
				class: "trpg-dice__item"
			}, [
				q("b", Mf, F(e.total), 1),
				q("span", Nf, [zs(F(e.line), 1), e.note ? (W(), G(xs, { key: 0 }, [zs(" · " + F(e.note), 1)], 64)) : Vs("", !0)]),
				q("time", Pf, F(_(e.at)), 1),
				q("button", {
					class: "trpg-icon-btn",
					type: "button",
					"aria-label": `再掷一次 ${e.expression}`,
					onClick: (t) => B(n).reroll(e)
				}, [J(Zd, {
					name: "arrow-clockwise",
					size: 16
				})], 8, Ff)
			]))), 128))])) : Vs("", !0)])
		])], 12, of)) : Vs("", !0);
	}
}), Lf = ["aria-expanded"], Rf = 48, zf = /* @__PURE__ */ H({
	__name: "FloatingBall",
	setup(e) {
		let t = Td(), n = /* @__PURE__ */ z(tf("trpg-assistant:ball", {
			x: 16,
			y: Math.round(window.innerHeight / 2)
		}));
		function r() {
			n.value = {
				x: Math.min(Math.max(n.value.x, 0), Math.max(0, window.innerWidth - Rf)),
				y: Math.min(Math.max(n.value.y, 0), Math.max(0, window.innerHeight - Rf))
			};
		}
		da(() => {
			r(), window.addEventListener("resize", r);
		}), ma(() => window.removeEventListener("resize", r));
		let i = af({
			position: n,
			size: () => ({
				w: Rf,
				h: Rf
			}),
			onTap: () => {
				t.windowOpen = !t.windowOpen;
			},
			onEnd: () => nf("trpg-assistant:ball", n.value)
		}), a = Y(() => ({
			left: `${n.value.x}px`,
			top: `${n.value.y}px`
		}));
		return (e, n) => (W(), G("button", {
			class: "trpg-ball",
			type: "button",
			"aria-label": "打开或收起 TRPG 跑团助手",
			"aria-expanded": B(t).windowOpen,
			style: Te(a.value),
			onPointerdown: n[0] ||= (...e) => B(i).onPointerDown && B(i).onPointerDown(...e),
			onKeydown: [n[1] ||= Au(Ou((e) => B(t).windowOpen = !B(t).windowOpen, ["prevent"]), ["enter"]), n[2] ||= Au(Ou((e) => B(t).windowOpen = !B(t).windowOpen, ["prevent"]), ["space"])]
		}, [J(Zd, {
			name: "dice-five",
			size: 26
		})], 44, Lf));
	}
}), Bf = Cd("modal", () => {
	let e = /* @__PURE__ */ Sn([]), t = /* @__PURE__ */ Sn("forward"), n = Y(() => e.value.length > 0), r = Y(() => e.value[e.value.length - 1]), i = Y(() => e.value.length), a = Y(() => e.value[0]?.variant ?? "dialog");
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
}), Vf = ["data-variant"], Hf = { class: "trpg-modal__head" }, Uf = ["aria-label"], Wf = ["inert", "aria-hidden"], Gf = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])", Kf = /* @__PURE__ */ H({
	__name: "ModalHost",
	setup(e) {
		let t = Bf(), n = /* @__PURE__ */ z(null), r = /* @__PURE__ */ z(null), i = `trpg-modal-title-${Math.random().toString(36).slice(2, 8)}`, a = null, o = [], s = /* @__PURE__ */ new Map(), c = Y(() => t.depth > 1 ? t.stack[t.depth - 2].title : ""), l = null;
		function u(e) {
			let t = e.composedPath()[0];
			l = t instanceof HTMLElement ? t.closest("button, a[href], input, select, textarea, [tabindex]") : null;
		}
		let d;
		da(() => {
			d = n.value?.getRootNode(), d?.addEventListener("pointerdown", u, !0);
		}), ma(() => d?.removeEventListener("pointerdown", u, !0));
		function f() {
			let e = n.value?.getRootNode(), t = e instanceof ShadowRoot ? e.activeElement : document.activeElement, r = l && l.isConnected ? l : null;
			return r && (!t || t === document.body || t !== r && t.contains(r)) ? r : t && t !== document.body ? t : null;
		}
		function p() {
			let e = r.value;
			return e ? [e.querySelector(".trpg-modal__head"), e.querySelector(".trpg-modal__page:not(.is-under)")].flatMap((e) => e ? [...e.querySelectorAll(Gf)] : []).filter((e) => e.getClientRects().length > 0) : [];
		}
		function m() {
			let e = r.value?.querySelector(".trpg-modal__page:not(.is-under)");
			(e?.querySelector("[data-autofocus]") ?? e?.querySelector(Gf) ?? r.value)?.focus({ preventScroll: !0 });
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
		Br(() => [t.depth, t.top?.key], async ([e, t], [n, r]) => {
			if (g(), e === 0) {
				s.clear();
				let e = a;
				a = null, o.length = 0, await ur(), v(e);
			} else if (n === 0 ? a = f() : e > n && o.push(f()), await ur(), e < n && _(), e < n && n > 0) {
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
		return (e, a) => (W(), G("div", {
			ref_key: "rootEl",
			ref: n,
			class: "trpg-modal-root"
		}, [B(t).isOpen ? (W(), G("div", {
			key: 0,
			class: "trpg-modal",
			"data-variant": B(t).variant,
			onClick: a[2] ||= Ou((e) => B(t).requestClose(), ["self"]),
			onKeydown: Ou(y, ["stop"])
		}, [q("section", {
			ref_key: "cardEl",
			ref: r,
			class: "trpg-modal__card",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": i,
			tabindex: "-1"
		}, [q("header", Hf, [
			B(t).depth > 1 ? (W(), G("button", {
				key: 0,
				class: "trpg-modal__back",
				type: "button",
				"aria-label": `返回：${c.value}`,
				onClick: a[0] ||= (e) => B(t).pop()
			}, [J(Zd, {
				name: "caret-left",
				size: 16
			}), q("span", null, F(c.value), 1)], 8, Uf)) : Vs("", !0),
			q("h2", {
				id: i,
				class: "trpg-modal__title"
			}, F(B(t).top?.title), 1),
			B(t).top?.header ? (W(), K(wa(B(t).top.header), je(Gs({ key: 1 }, B(t).top.props)), null, 16)) : Vs("", !0),
			q("button", {
				class: "trpg-icon-btn trpg-modal__close",
				type: "button",
				"aria-label": "关闭",
				onClick: a[1] ||= (e) => B(t).requestClose()
			}, [J(Zd, {
				name: "x",
				size: 18
			})])
		]), J(Zl, {
			tag: "div",
			name: "trpg-page",
			class: "trpg-modal__pages"
		}, {
			default: V(() => [(W(!0), G(xs, null, Oa(B(t).stack, (e, n) => (W(), G("div", {
				key: e.key,
				class: Ae(["trpg-modal__page", { "is-under": n < B(t).depth - 1 }]),
				inert: n < B(t).depth - 1,
				"aria-hidden": n < B(t).depth - 1 ? "true" : void 0
			}, [(W(), K(wa(e.component), Gs({ ref_for: !0 }, e.props), null, 16))], 10, Wf))), 128))]),
			_: 1
		})], 512)], 40, Vf)) : Vs("", !0)], 512));
	}
}), qf = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, Jf = {}, Yf = { class: "trpg-empty" };
function Xf(e, t) {
	return W(), G("p", Yf, "首页");
}
var Zf = /*#__PURE__*/ qf(Jf, [["render", Xf]]), Qf = {}, $f = { class: "trpg-empty" };
function ep(e, t) {
	return W(), G("p", $f, "库");
}
var tp = /*#__PURE__*/ qf(Qf, [["render", ep]]), np = /* @__PURE__ */ l((/* @__PURE__ */ o(((e, t, n) => {
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
		function se(e) {
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
		var ce = typeof Symbol < "u" ? function(e) {
			return e[Symbol.toStringTag] === "AsyncFunction";
		} : function() {
			return !1;
		}, le = [
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
		], ue = [
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
		], de = le.concat(ue), fe = {
			VersionChanged: "Database version changed by other database connection",
			DatabaseClosed: "Database has been closed",
			Abort: "Transaction aborted",
			TransactionInactive: "Transaction has already completed or failed",
			MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
		};
		function pe(e, t) {
			this.name = e, this.message = t;
		}
		m(pe).from(Error).extend({ toString: function() {
			return this.name + ": " + this.message;
		} });
		function me(e, t) {
			return e + ". Errors: " + Object.keys(t).map(function(e) {
				return t[e].toString();
			}).filter(function(e, t, n) {
				return n.indexOf(e) === t;
			}).join("\n");
		}
		function he(e, t, n, r) {
			this.failures = t, this.failedKeys = r, this.successCount = n, this.message = me(e, t);
		}
		m(he).from(pe);
		function ge(e, t) {
			this.name = "BulkError", this.failures = Object.keys(t).map(function(e) {
				return t[e];
			}), this.failuresByPos = t, this.message = me(e, this.failures);
		}
		m(ge).from(pe);
		var _e = de.reduce(function(e, t) {
			return e[t] = t + "Error", e;
		}, {}), ve = pe, P = de.reduce(function(e, t) {
			var n = t + "Error";
			function r(e, r) {
				this.name = n, e ? typeof e == "string" ? (this.message = `${e}${r ? "\n " + r : ""}`, this.inner = r || null) : typeof e == "object" && (this.message = `${e.name} ${e.message}`, this.inner = e) : (this.message = fe[t] || n, this.inner = null);
			}
			return m(r).from(ve), e[t] = r, e;
		}, {});
		P.Syntax = SyntaxError, P.Type = TypeError, P.Range = RangeError;
		var ye = ue.reduce(function(e, t) {
			return e[t + "Error"] = P[t], e;
		}, {});
		function be(e, t) {
			if (!e || e instanceof pe || e instanceof TypeError || e instanceof SyntaxError || !e.name || !ye[e.name]) return e;
			var n = new ye[e.name](t || e.message, e);
			return "stack" in e && p(n, "stack", { get: function() {
				return this.inner.stack;
			} }), n;
		}
		var xe = de.reduce(function(e, t) {
			return [
				"Syntax",
				"Type",
				"Range"
			].indexOf(t) === -1 && (e[t + "Error"] = P[t]), e;
		}, {});
		xe.ModifyError = he, xe.DexieError = pe, xe.BulkError = ge;
		function Se() {}
		function Ce(e) {
			return e;
		}
		function we(e, t) {
			return e == null || e === Ce ? t : function(n) {
				return t(e(n));
			};
		}
		function Te(e, t) {
			return function() {
				e.apply(this, arguments), t.apply(this, arguments);
			};
		}
		function Ee(e, t) {
			return e === Se ? t : function() {
				var n = e.apply(this, arguments);
				n !== void 0 && (arguments[0] = n);
				var r = this.onsuccess, i = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var a = t.apply(this, arguments);
				return r && (this.onsuccess = this.onsuccess ? Te(r, this.onsuccess) : r), i && (this.onerror = this.onerror ? Te(i, this.onerror) : i), a === void 0 ? n : a;
			};
		}
		function De(e, t) {
			return e === Se ? t : function() {
				e.apply(this, arguments);
				var n = this.onsuccess, r = this.onerror;
				this.onsuccess = this.onerror = null, t.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? Te(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? Te(r, this.onerror) : r);
			};
		}
		function Oe(e, t) {
			return e === Se ? t : function() {
				var n = e.apply(this, arguments), r = arguments[0];
				s(r, n);
				var i = this.onsuccess, a = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var o = t.apply(this, arguments);
				return i && (this.onsuccess = this.onsuccess ? Te(i, this.onsuccess) : i), a && (this.onerror = this.onerror ? Te(a, this.onerror) : a), n === void 0 ? o === void 0 ? void 0 : o : s(n, o);
			};
		}
		function ke(e, t) {
			return e === Se ? t : function() {
				return t.apply(this, arguments) !== !1 && e.apply(this, arguments);
			};
		}
		function Ae(e, t) {
			return e === Se ? t : function() {
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
		var je = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
		function Me(e, t) {
			je = e;
		}
		var Ne = {}, Pe = 100, Fe = typeof Promise > "u" ? [] : (function() {
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
		})(), Ie = Fe[0], Le = Fe[1], Re = Fe[2], ze = Le && Le.then, Be = Ie && Ie.constructor, F = !!Re;
		function Ve() {
			queueMicrotask(at);
		}
		var He = function(e, t) {
			Ye.push([e, t]), We &&= (Ve(), !1);
		}, Ue = !0, We = !0, Ge = [], Ke = [], qe = Ce, Je = {
			id: "global",
			global: !0,
			ref: 0,
			unhandleds: [],
			onunhandled: Se,
			pgp: !1,
			env: {},
			finalize: Se
		}, I = Je, Ye = [], Xe = 0, Ze = [];
		function L(e) {
			if (typeof this != "object") throw TypeError("Promises must be constructed via new");
			this._listeners = [], this._lib = !1;
			var t = this._PSD = I;
			if (typeof e != "function") {
				if (e !== Ne) throw TypeError("Not a function");
				this._state = arguments[1], this._value = arguments[2], this._state === !1 && tt(this, this._value);
			} else this._state = null, this._value = null, ++t.ref, et(this, e);
		}
		var Qe = {
			get: function() {
				var e = I, t = vt;
				function n(n, r) {
					var i = this, a = !e.global && (e !== I || t !== vt), o = a && !St(), s = new L(function(t, s) {
						rt(i, new $e(kt(n, e, a, o), kt(r, e, a, o), t, s, e));
					});
					return this._consoleTask && (s._consoleTask = this._consoleTask), s;
				}
				return n.prototype = Ne, n;
			},
			set: function(e) {
				p(this, "then", e && e.prototype === Ne ? Qe : {
					get: function() {
						return e;
					},
					set: Qe.set
				});
			}
		};
		d(L.prototype, {
			then: Qe,
			_then: function(e, t) {
				rt(this, new $e(null, null, e, t, I));
			},
			catch: function(e) {
				if (arguments.length === 1) return this.then(null, e);
				var t = arguments[0], n = arguments[1];
				return typeof t == "function" ? this.then(null, function(e) {
					return e instanceof t ? n(e) : ft(e);
				}) : this.then(null, function(e) {
					return e && e.name === t ? n(e) : ft(e);
				});
			},
			finally: function(e) {
				return this.then(function(t) {
					return L.resolve(e()).then(function() {
						return t;
					});
				}, function(t) {
					return L.resolve(e()).then(function() {
						return ft(t);
					});
				});
			},
			timeout: function(e, t) {
				var n = this;
				return e < Infinity ? new L(function(r, i) {
					var a = setTimeout(function() {
						return i(new P.Timeout(t));
					}, e);
					n.then(r, i).finally(clearTimeout.bind(null, a));
				}) : this;
			}
		}), typeof Symbol < "u" && Symbol.toStringTag && p(L.prototype, Symbol.toStringTag, "Dexie.Promise"), Je.env = Dt();
		function $e(e, t, n, r, i) {
			this.onFulfilled = typeof e == "function" ? e : null, this.onRejected = typeof t == "function" ? t : null, this.resolve = n, this.reject = r, this.psd = i;
		}
		d(L, {
			all: function() {
				var e = se.apply(null, arguments).map(Ct);
				return new L(function(t, n) {
					e.length === 0 && t([]);
					var r = e.length;
					e.forEach(function(i, a) {
						return L.resolve(i).then(function(n) {
							e[a] = n, --r || t(e);
						}, n);
					});
				});
			},
			resolve: function(e) {
				return e instanceof L ? e : e && typeof e.then == "function" ? new L(function(t, n) {
					e.then(t, n);
				}) : new L(Ne, !0, e);
			},
			reject: ft,
			race: function() {
				var e = se.apply(null, arguments).map(Ct);
				return new L(function(t, n) {
					e.map(function(e) {
						return L.resolve(e).then(t, n);
					});
				});
			},
			PSD: {
				get: function() {
					return I;
				},
				set: function(e) {
					return I = e;
				}
			},
			totalEchoes: { get: function() {
				return vt;
			} },
			newPSD: bt,
			usePSD: Ot,
			scheduler: {
				get: function() {
					return He;
				},
				set: function(e) {
					He = e;
				}
			},
			rejectionMapper: {
				get: function() {
					return qe;
				},
				set: function(e) {
					qe = e;
				}
			},
			follow: function(e, t) {
				return new L(function(n, r) {
					return bt(function(t, n) {
						var r = I;
						r.unhandleds = [], r.onunhandled = n, r.finalize = Te(function() {
							var e = this;
							lt(function() {
								e.unhandleds.length === 0 ? t() : n(e.unhandleds[0]);
							});
						}, r.finalize), e();
					}, t, n, r);
				});
			}
		}), Be && (Be.allSettled && p(L, "allSettled", function() {
			var e = se.apply(null, arguments).map(Ct);
			return new L(function(t) {
				e.length === 0 && t([]);
				var n = e.length, r = Array(n);
				e.forEach(function(e, i) {
					return L.resolve(e).then(function(e) {
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
		}), Be.any && typeof AggregateError < "u" && p(L, "any", function() {
			var e = se.apply(null, arguments).map(Ct);
			return new L(function(t, n) {
				e.length === 0 && n(/* @__PURE__ */ AggregateError([]));
				var r = e.length, i = Array(r);
				e.forEach(function(e, a) {
					return L.resolve(e).then(function(e) {
						return t(e);
					}, function(e) {
						i[a] = e, --r || n(AggregateError(i));
					});
				});
			});
		}), Be.withResolvers && (L.withResolvers = Be.withResolvers));
		function et(e, t) {
			try {
				t(function(t) {
					if (e._state === null) {
						if (t === e) throw TypeError("A promise cannot be resolved with itself.");
						var n = e._lib && ot();
						t && typeof t.then == "function" ? et(e, function(e, n) {
							t instanceof L ? t._then(e, n) : t.then(e, n);
						}) : (e._state = !0, e._value = t, nt(e)), n && st();
					}
				}, tt.bind(null, e));
			} catch (t) {
				tt(e, t);
			}
		}
		function tt(e, t) {
			if (Ke.push(t), e._state === null) {
				var n = e._lib && ot();
				t = qe(t), e._state = !1, e._value = t, ut(e), nt(e), n && st();
			}
		}
		function nt(e) {
			var t = e._listeners;
			e._listeners = [];
			for (var n = 0, r = t.length; n < r; ++n) rt(e, t[n]);
			var i = e._PSD;
			--i.ref || i.finalize(), Xe === 0 && (++Xe, He(function() {
				--Xe === 0 && ct();
			}, []));
		}
		function rt(e, t) {
			if (e._state === null) e._listeners.push(t);
			else {
				var n = e._state ? t.onFulfilled : t.onRejected;
				if (n === null) return (e._state ? t.resolve : t.reject)(e._value);
				++t.psd.ref, ++Xe, He(it, [
					n,
					e,
					t
				]);
			}
		}
		function it(e, t, n) {
			try {
				var r, i = t._value;
				!t._state && Ke.length && (Ke = []), r = je && t._consoleTask ? t._consoleTask.run(function() {
					return e(i);
				}) : e(i), !t._state && Ke.indexOf(i) === -1 && dt(t), n.resolve(r);
			} catch (e) {
				n.reject(e);
			} finally {
				--Xe === 0 && ct(), --n.psd.ref || n.psd.finalize();
			}
		}
		function at() {
			Ot(Je, function() {
				ot() && st();
			});
		}
		function ot() {
			var e = Ue;
			return Ue = !1, We = !1, e;
		}
		function st() {
			var e, t, n;
			do
				for (; Ye.length > 0;) for (e = Ye, Ye = [], n = e.length, t = 0; t < n; ++t) {
					var r = e[t];
					r[0].apply(null, r[1]);
				}
			while (Ye.length > 0);
			Ue = !0, We = !0;
		}
		function ct() {
			var e = Ge;
			Ge = [], e.forEach(function(e) {
				e._PSD.onunhandled.call(null, e._value, e);
			});
			for (var t = Ze.slice(0), n = t.length; n;) t[--n]();
		}
		function lt(e) {
			function t() {
				e(), Ze.splice(Ze.indexOf(t), 1);
			}
			Ze.push(t), ++Xe, He(function() {
				--Xe === 0 && ct();
			}, []);
		}
		function ut(e) {
			Ge.some(function(t) {
				return t._value === e._value;
			}) || Ge.push(e);
		}
		function dt(e) {
			for (var t = Ge.length; t;) if (Ge[--t]._value === e._value) {
				Ge.splice(t, 1);
				return;
			}
		}
		function ft(e) {
			return new L(Ne, !1, e);
		}
		function pt(e, t) {
			var n = I;
			return function() {
				var r = ot(), i = I;
				try {
					return Et(n, !0), e.apply(this, arguments);
				} catch (e) {
					t && t(e);
				} finally {
					Et(i, !1), r && st();
				}
			};
		}
		var mt = {
			awaits: 0,
			echoes: 0,
			id: 0
		}, ht = 0, gt = [], _t = 0, vt = 0, yt = 0;
		function bt(e, t, n, r) {
			var i = I, a = Object.create(i);
			a.parent = i, a.ref = 0, a.global = !1, a.id = ++yt, Je.env, a.env = F ? {
				Promise: L,
				PromiseProp: {
					value: L,
					configurable: !0,
					writable: !0
				},
				all: L.all,
				race: L.race,
				allSettled: L.allSettled,
				any: L.any,
				resolve: L.resolve,
				reject: L.reject
			} : {}, t && s(a, t), ++i.ref, a.finalize = function() {
				--this.parent.ref || this.parent.finalize();
			};
			var o = Ot(a, e, n, r);
			return a.ref === 0 && a.finalize(), o;
		}
		function xt() {
			return mt.id ||= ++ht, ++mt.awaits, mt.echoes += Pe, mt.id;
		}
		function St() {
			return mt.awaits ? (--mt.awaits === 0 && (mt.id = 0), mt.echoes = mt.awaits * Pe, !0) : !1;
		}
		("" + ze).indexOf("[native code]") === -1 && (xt = St = Se);
		function Ct(e) {
			return mt.echoes && e && e.constructor === Be ? (xt(), e.then(function(e) {
				return St(), e;
			}, function(e) {
				return St(), jt(e);
			})) : e;
		}
		function wt(e) {
			++vt, mt.echoes && --mt.echoes !== 0 || (mt.echoes = mt.awaits = mt.id = 0), gt.push(I), Et(e, !0);
		}
		function Tt() {
			var e = gt[gt.length - 1];
			gt.pop(), Et(e, !1);
		}
		function Et(e, t) {
			var n = I;
			if ((t ? mt.echoes && (!_t++ || e !== I) : _t && (!--_t || e !== I)) && queueMicrotask(t ? wt.bind(null, e) : Tt), e !== I && (I = e, n === Je && (Je.env = Dt()), F)) {
				var r = Je.env.Promise, a = e.env;
				(n.global || e.global) && (Object.defineProperty(i, "Promise", a.PromiseProp), r.all = a.all, r.race = a.race, r.resolve = a.resolve, r.reject = a.reject, a.allSettled && (r.allSettled = a.allSettled), a.any && (r.any = a.any));
			}
		}
		function Dt() {
			var e = i.Promise;
			return F ? {
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
		function Ot(e, t, n, r, i) {
			var a = I;
			try {
				return Et(e, !0), t(n, r, i);
			} finally {
				Et(a, !1);
			}
		}
		function kt(e, t, n, r) {
			return typeof e == "function" ? function() {
				var i = I;
				n && xt(), Et(t, !0);
				try {
					return e.apply(this, arguments);
				} finally {
					Et(i, !1), r && queueMicrotask(St);
				}
			} : e;
		}
		function At(e) {
			Promise === Be && mt.echoes === 0 ? _t === 0 ? e() : enqueueNativeMicroTask(e) : setTimeout(e, 0);
		}
		var jt = L.reject;
		function Mt(e, t, n, r) {
			if (!e.idbdb || !e._state.openComplete && !I.letThrough && !e._vip) {
				if (e._state.openComplete) return jt(new P.DatabaseClosed(e._state.dbOpenError));
				if (!e._state.isBeingOpened) {
					if (!e._state.autoOpen) return jt(new P.DatabaseClosed());
					e.open().catch(Se);
				}
				return e._state.dbReadyPromise.then(function() {
					return Mt(e, t, n, r);
				});
			}
			var i = e._createTransaction(t, n, e._dbSchema);
			try {
				i.create(), e._state.PR1398_maxLoop = 3;
			} catch (i) {
				return i.name === _e.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
					return Mt(e, t, n, r);
				})) : jt(i);
			}
			return i._promise(t, function(e, t) {
				return bt(function() {
					return I.trans = i, r(e, t, i);
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
		var Nt = "4.4.7", Pt = "￿", Ft = -Infinity, It = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", Lt = "String expected.", Rt = 1e3, zt = "__dbnames", Bt = "readonly", Vt = "readwrite";
		function Ht(e, t) {
			return e ? t ? function() {
				return e.apply(this, arguments) && t.apply(this, arguments);
			} : e : t;
		}
		var Ut = {
			type: 3,
			lower: -Infinity,
			lowerOpen: !1,
			upper: [[]],
			upperOpen: !1
		};
		function Wt(e) {
			return typeof e == "string" && !/\./.test(e) ? function(t) {
				return t[e] === void 0 && e in t && (t = A(t), delete t[e]), t;
			} : function(e) {
				return e;
			};
		}
		function Gt() {
			throw P.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
		}
		function Kt(e, t) {
			try {
				var n = Yt(e), r = Yt(t);
				if (n !== r) return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r === "Date" ? -1 : NaN;
				switch (n) {
					case "number":
					case "Date":
					case "string": return e > t ? 1 : e < t ? -1 : 0;
					case "binary": return Jt(Xt(e), Xt(t));
					case "Array": return qt(e, t);
				}
			} catch {}
			return NaN;
		}
		function qt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) {
				var o = Kt(e[a], t[a]);
				if (o !== 0) return o;
			}
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function Jt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) if (e[a] !== t[a]) return e[a] < t[a] ? -1 : 1;
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function Yt(e) {
			var t = typeof e;
			if (t !== "object") return t;
			if (ArrayBuffer.isView(e)) return "binary";
			var n = re(e);
			return n === "ArrayBuffer" ? "binary" : n;
		}
		function Xt(e) {
			return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : new Uint8Array(e);
		}
		function Zt(e, t, n) {
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
		var Qt = function() {
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
		function $t(e, t) {
			for (var n = a(t), r = n.length, i = !1, o = 0; o < r; ++o) {
				var s = n[o], c = t[s], l = C(e, s);
				c instanceof Qt ? (w(e, s, c.execute(l)), i = !0) : l !== c && (w(e, s, c), i = !0);
			}
			return i;
		}
		var en = function() {
			function e() {}
			return e.prototype._trans = function(e, t, n) {
				var r = this._tx || I.trans, i = this.name, a = je && typeof console < "u" && console.createTask && console.createTask(`Dexie: ${e === "readonly" ? "read" : "write"} ${this.name}`);
				function o(e, n, r) {
					if (!r.schema[i]) throw new P.NotFound("Table " + i + " not part of transaction");
					return t(r.idbtrans, r);
				}
				var s = ot();
				try {
					var c = r && r.db._novip === this.db._novip ? r === I.trans ? r._promise(e, o, n) : bt(function() {
						return r._promise(e, o, n);
					}, {
						trans: r,
						transless: I.transless || I
					}) : Mt(this.db, e, [this.name], o);
					return a && (c._consoleTask = a, c = c.catch(function(e) {
						return console.trace(e), jt(e);
					})), c;
				} finally {
					s && st();
				}
			}, e.prototype.get = function(e, t) {
				var n = this;
				return e && e.constructor === Object ? this.where(e).first(t) : e == null ? jt(new P.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(t) {
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
				if (n && this.db._maxKey !== Pt) {
					var r = n.keyPath.slice(0, t.length);
					return this.where(r).equals(r.map(function(t) {
						return e[t];
					}));
				}
				!n && je && console.warn(`The query ${JSON.stringify(e)} on ${this.name} would benefit from a compound index [${t.join("+")}]`);
				var i = this.schema.idxByName;
				function s(e, t) {
					return Kt(e, t) === 0;
				}
				var c = t.reduce(function(t, n) {
					var r = t[0], a = t[1], c = i[n], l = e[n];
					return [r || c, r || !c ? Ht(a, c && c.multi ? function(e) {
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
				this.schema.mappedClass = e, e.prototype instanceof Gt && (e = function(e) {
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
				return a && i && (o = Wt(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "add",
						keys: t == null ? null : [t],
						values: [o]
					});
				}).then(function(e) {
					return e.numFailures ? L.reject(e.failures[0]) : e.lastResult;
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
						return $t(o, t), r && w(o, r, e), n.core.mutate({
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
							return e.numFailures ? L.reject(e.failures[0]) : !!a;
						});
					});
				});
			}, e.prototype.update = function(e, t) {
				if (typeof e == "object" && !o(e)) {
					var n = C(e, this.schema.primKey.keyPath);
					return n === void 0 ? jt(new P.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(n).modify(t);
				}
				return this.where(":id").equals(e).modify(t);
			}, e.prototype.put = function(e, t) {
				var n = this, r = this.schema.primKey, i = r.auto, a = r.keyPath, o = e;
				return a && i && (o = Wt(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "put",
						values: [o],
						keys: t == null ? null : [t]
					});
				}).then(function(e) {
					return e.numFailures ? L.reject(e.failures[0]) : e.lastResult;
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
						return Zt(t, [e], n);
					}).then(function(e) {
						return e.numFailures ? L.reject(e.failures[0]) : void 0;
					});
				});
			}, e.prototype.clear = function() {
				var e = this;
				return this._trans("readwrite", function(t) {
					return e.core.mutate({
						trans: t,
						type: "deleteRange",
						range: Ut
					}).then(function(t) {
						return Zt(e, null, t);
					});
				}).then(function(e) {
					return e.numFailures ? L.reject(e.failures[0]) : void 0;
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
					if (s && i) throw new P.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new P.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(Wt(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "add",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new ge(`${r.name}.bulkAdd(): ${t} of ${c} operations failed`, o);
					});
				});
			}, e.prototype.bulkPut = function(e, t, n) {
				var r = this, i = Array.isArray(t) ? t : void 0;
				n ||= i ? void 0 : t;
				var a = n ? n.allKeys : void 0;
				return this._trans("readwrite", function(t) {
					var n = r.schema.primKey, o = n.auto, s = n.keyPath;
					if (s && i) throw new P.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new P.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(Wt(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "put",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new ge(`${r.name}.bulkPut(): ${t} of ${c} operations failed`, o);
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
								if (!l && Kt(u(a), n) !== 0) throw new P.Constraint("Cannot update primary key in bulkUpdate()");
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
							throw new ge(`${t.name}.bulkUpdate(): ${n} of ${p} operations failed`, r);
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
						return Zt(t, e, n);
					});
				}).then(function(e) {
					var r = e.numFailures, i = e.lastResult, a = e.failures;
					if (r === 0) return i;
					throw new ge(`${t.name}.bulkDelete(): ${r} of ${n} operations failed`, a);
				});
			}, e;
		}();
		function tn(e) {
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
				r ||= ke, i ||= Se;
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
					else if (n === "asap") var r = s(t, Ce, function() {
						for (var e = arguments.length, t = Array(e); e--;) t[e] = arguments[e];
						r.subscribers.forEach(function(e) {
							x(function() {
								e.apply(null, t);
							});
						});
					});
					else throw new P.InvalidArgument("Invalid event config");
				});
			}
		}
		function nn(e, t) {
			return m(t).from({ prototype: e }), t;
		}
		function rn(e) {
			return nn(en.prototype, function(t, n, r) {
				this.db = e, this._tx = r, this.name = t, this.schema = n, this.hook = e._allTables[t] ? e._allTables[t].hook : tn(null, {
					creating: [Ee, Se],
					reading: [we, Ce],
					updating: [Oe, Se],
					deleting: [De, Se]
				});
			});
		}
		function an(e, t) {
			return !(e.filter || e.algorithm || e.or) && (t ? e.justLimit : !e.replayFilter);
		}
		function on(e, t) {
			e.filter = Ht(e.filter, t);
		}
		function sn(e, t, n) {
			var r = e.replayFilter;
			e.replayFilter = r ? function() {
				return Ht(r(), t());
			} : t, e.justLimit = n && !r;
		}
		function cn(e, t) {
			e.isMatch = Ht(e.isMatch, t);
		}
		function ln(e, t) {
			if (e.isPrimKey) return t.primaryKey;
			var n = t.getIndexByKeyPath(e.index);
			if (!n) throw new P.Schema("KeyPath " + e.index + " on object store " + t.name + " is not indexed");
			return n;
		}
		function un(e, t, n) {
			var r = ln(e, t.schema);
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
		function dn(e, t, n, r) {
			var i = e.replayFilter ? Ht(e.filter, e.replayFilter()) : e.filter;
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
				return Promise.all([e.or._iterate(o, n), fn(un(e, r, n), e.algorithm, o, !e.keysOnly && e.valueMapper)]);
			}
			return fn(un(e, r, n), Ht(e.algorithm, i), t, !e.keysOnly && e.valueMapper);
		}
		function fn(e, t, n, r) {
			var i = pt(r ? function(e, t, i) {
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
						e.stop(t), n = Se;
					}, function(t) {
						e.fail(t), n = Se;
					})) && i(e.value, e, function(e) {
						return n = e;
					}), n();
				});
			});
		}
		var pn = function() {
			function e() {}
			return e.prototype._read = function(e, t) {
				var n = this._ctx;
				return n.error ? n.table._trans(null, jt.bind(null, n.error)) : n.table._trans("readonly", e).then(t);
			}, e.prototype._write = function(e) {
				var t = this._ctx;
				return t.error ? t.table._trans(null, jt.bind(null, t.error)) : t.table._trans("readwrite", e, "locked");
			}, e.prototype._addAlgorithm = function(e) {
				var t = this._ctx;
				t.algorithm = Ht(t.algorithm, e);
			}, e.prototype._iterate = function(e, t) {
				return dn(this._ctx, e, t, this._ctx.table.core);
			}, e.prototype.clone = function(e) {
				var t = Object.create(this.constructor.prototype), n = Object.create(this._ctx);
				return e && s(n, e), t._ctx = n, t;
			}, e.prototype.raw = function() {
				return this._ctx.valueMapper = null, this;
			}, e.prototype.each = function(e) {
				var t = this._ctx;
				return this._read(function(n) {
					return dn(t, e, n, t.table.core);
				});
			}, e.prototype.count = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx, r = n.table.core;
					if (an(n, !0)) return r.count({
						trans: e,
						query: {
							index: ln(n, r.schema),
							range: n.range
						}
					}).then(function(e) {
						return Math.min(e, n.limit);
					});
					var i = 0;
					return dn(n, function() {
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
					return Kt(a(e, i), a(t, i)) * o;
				}
				return this.toArray(function(e) {
					return e.slice().sort(s);
				}).then(t);
			}, e.prototype.toArray = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx;
					if (an(n, !0) && n.limit > 0) {
						var r = n.valueMapper, i = ln(n, n.table.core.schema);
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
					return dn(n, function(e) {
						return a.push(e);
					}, e, n.table.core).then(function() {
						return a;
					});
				}, e);
			}, e.prototype.offset = function(e) {
				var t = this._ctx;
				return e <= 0 || (t.offset += e, an(t) ? sn(t, function() {
					var t = e;
					return function(e, n) {
						return t === 0 ? !0 : t === 1 ? (--t, !1) : (n(function() {
							e.advance(t), t = 0;
						}), !1);
					};
				}) : sn(t, function() {
					var t = e;
					return function() {
						return --t < 0;
					};
				})), this;
			}, e.prototype.limit = function(e) {
				return this._ctx.limit = Math.min(this._ctx.limit, e), sn(this._ctx, function() {
					var t = e;
					return function(e, n, r) {
						return --t <= 0 && n(r), t >= 0;
					};
				}, !0), this;
			}, e.prototype.until = function(e, t) {
				return on(this._ctx, function(n, r, i) {
					return !e(n.value) || (r(i), t);
				}), this;
			}, e.prototype.first = function(e) {
				return this.limit(1).toArray(function(e) {
					return e[0];
				}).then(e);
			}, e.prototype.last = function(e) {
				return this.reverse().first(e);
			}, e.prototype.filter = function(e) {
				return on(this._ctx, function(t) {
					return e(t.value);
				}), cn(this._ctx, e), this;
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
				if (an(t, !0) && t.limit > 0) return this._read(function(e) {
					var n = ln(t, t.table.core.schema);
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
				return on(this._ctx, function(e) {
					var t = e.primaryKey.toString(), r = u(n, t);
					return n[t] = !0, !r;
				}), this;
			}, e.prototype.modify = function(e) {
				var t = this, n = this._ctx;
				return this._write(function(r) {
					var i = typeof e == "function" ? e : function(t) {
						return $t(t, e);
					}, o = n.table.core, s = o.schema.primaryKey, c = s.outbound, l = s.extractKey, u = 200, d = t.db._options.modifyChunkSize;
					d && (u = typeof d == "object" ? d[o.name] || d["*"] || 200 : d);
					var f = [], p = 0, m = [], h = function(e, t) {
						var n = t.failures, r = t.numFailures;
						p += e - r;
						for (var i = 0, o = a(n); i < o.length; i++) {
							var s = o[i];
							f.push(n[s]);
						}
					}, g = e === mn;
					return t.clone().primaryKeys().then(function(t) {
						var a = an(n) && n.limit === Infinity && (typeof e != "function" || g) && {
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
									i.call(C, C.value, C) !== !1 && (C.value == null ? b.push(t[d + x]) : !c && Kt(l(S), l(C.value)) !== 0 ? (b.push(t[d + x]), _.push(C.value)) : (v.push(C.value), c && y.push(t[d + x])));
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
										return Zt(n.table, b, e);
									}).then(function(e) {
										return h(b.length, e);
									});
								}).then(function() {
									return t.length > d + f && s(d + u);
								});
							});
						};
						return s(0).then(function() {
							if (f.length > 0) throw new he("Error modifying one or more objects", f, p, m);
							return t.length;
						});
					});
				});
			}, e.prototype.delete = function() {
				var e = this._ctx, t = e.range;
				return an(e) && !e.table.schema.yProps && (e.isPrimKey || t.type === 3) ? this._write(function(n) {
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
							if (r) throw new he("Could not delete some values", Object.keys(n).map(function(e) {
								return n[e];
							}), t - r);
							return t - r;
						});
					});
				}) : this.modify(mn);
			}, e;
		}(), mn = function(e, t) {
			return t.value = null;
		};
		function hn(e) {
			return nn(pn.prototype, function(t, n) {
				this.db = e;
				var r = Ut, i = null;
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
					valueMapper: s === Ce ? null : s
				};
			});
		}
		function gn(e, t) {
			return e < t ? -1 : e === t ? 0 : 1;
		}
		function _n(e, t) {
			return e > t ? -1 : e === t ? 0 : 1;
		}
		function R(e, t, n) {
			var r = e instanceof wn ? new e.Collection(e) : e;
			return r._ctx.error = n ? new n(t) : TypeError(t), r;
		}
		function vn(e) {
			var t = new e.Collection(e, function() {
				return Cn("");
			});
			return t._addAlgorithm(function() {
				return !1;
			}), t;
		}
		function yn(e) {
			return e === "next" ? function(e) {
				return e.toUpperCase();
			} : function(e) {
				return e.toLowerCase();
			};
		}
		function bn(e) {
			return e === "next" ? function(e) {
				return e.toLowerCase();
			} : function(e) {
				return e.toUpperCase();
			};
		}
		function xn(e, t, n, r, i, a) {
			for (var o = Math.min(e.length, r.length), s = -1, c = 0; c < o; ++c) {
				var l = t[c];
				if (l !== r[c]) return i(e[c], n[c]) < 0 ? e.substr(0, c) + n[c] + n.substr(c + 1) : i(e[c], r[c]) < 0 ? e.substr(0, c) + r[c] + n.substr(c + 1) : s >= 0 ? e.substr(0, s) + t[s] + n.substr(s + 1) : null;
				i(e[c], l) < 0 && (s = c);
			}
			return o < r.length && a === "next" ? e + n.substr(e.length) : o < e.length && a === "prev" ? e.substr(0, n.length) : s < 0 ? null : e.substr(0, s) + r[s] + n.substr(s + 1);
		}
		function z(e, t, n, r) {
			var i, a, o, s, c, l, u, d = n.length;
			if (!n.every(function(e) {
				return typeof e == "string";
			})) return R(e, Lt);
			function f(e) {
				i = yn(e), a = bn(e), o = e === "next" ? gn : _n;
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
				return Sn(s[0], c[d - 1] + r);
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
					var g = xn(i, f, s[h], c[h], o, l);
					g === null && p === null ? m = h + 1 : (p === null || o(p, g) > 0) && (p = g);
				}
				return n(p === null ? r : function() {
					e.continue(p + u);
				}), !1;
			}), p;
		}
		function Sn(e, t, n, r) {
			return {
				type: 2,
				lower: e,
				upper: t,
				lowerOpen: n,
				upperOpen: r
			};
		}
		function Cn(e) {
			return {
				type: 1,
				lower: e,
				upper: e
			};
		}
		var wn = function() {
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
					return this._cmp(e, t) > 0 || this._cmp(e, t) === 0 && (n || r) && !(n && r) ? vn(this) : new this.Collection(this, function() {
						return Sn(e, t, !n, !r);
					});
				} catch {
					return R(this, It);
				}
			}, e.prototype.equals = function(e) {
				return e == null ? R(this, It) : new this.Collection(this, function() {
					return Cn(e);
				});
			}, e.prototype.above = function(e) {
				return e == null ? R(this, It) : new this.Collection(this, function() {
					return Sn(e, void 0, !0);
				});
			}, e.prototype.aboveOrEqual = function(e) {
				return e == null ? R(this, It) : new this.Collection(this, function() {
					return Sn(e, void 0, !1);
				});
			}, e.prototype.below = function(e) {
				return e == null ? R(this, It) : new this.Collection(this, function() {
					return Sn(void 0, e, !1, !0);
				});
			}, e.prototype.belowOrEqual = function(e) {
				return e == null ? R(this, It) : new this.Collection(this, function() {
					return Sn(void 0, e);
				});
			}, e.prototype.startsWith = function(e) {
				return typeof e == "string" ? this.between(e, e + Pt, !0, !0) : R(this, Lt);
			}, e.prototype.startsWithIgnoreCase = function(e) {
				return e === "" ? this.startsWith(e) : z(this, function(e, t) {
					return e.indexOf(t[0]) === 0;
				}, [e], Pt);
			}, e.prototype.equalsIgnoreCase = function(e) {
				return z(this, function(e, t) {
					return e === t[0];
				}, [e], "");
			}, e.prototype.anyOfIgnoreCase = function() {
				var e = se.apply(oe, arguments);
				return e.length === 0 ? vn(this) : z(this, function(e, t) {
					return t.indexOf(e) !== -1;
				}, e, "");
			}, e.prototype.startsWithAnyOfIgnoreCase = function() {
				var e = se.apply(oe, arguments);
				return e.length === 0 ? vn(this) : z(this, function(e, t) {
					return t.some(function(t) {
						return e.indexOf(t) === 0;
					});
				}, e, Pt);
			}, e.prototype.anyOf = function() {
				var e = this, t = se.apply(oe, arguments), n = this._cmp;
				try {
					t.sort(n);
				} catch {
					return R(this, It);
				}
				if (t.length === 0) return vn(this);
				var r = new this.Collection(this, function() {
					return Sn(t[0], t[t.length - 1]);
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
				return this.inAnyRange([[Ft, e], [e, this.db._maxKey]], {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.noneOf = function() {
				var e = se.apply(oe, arguments);
				if (e.length === 0) return new this.Collection(this);
				try {
					e.sort(this._ascending);
				} catch {
					return R(this, It);
				}
				var t = e.reduce(function(e, t) {
					return e ? e.concat([[e[e.length - 1][1], t]]) : [[Ft, t]];
				}, null);
				return t.push([e[e.length - 1], this.db._maxKey]), this.inAnyRange(t, {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.inAnyRange = function(e, t) {
				var n = this, r = this._cmp, i = this._ascending, a = this._descending, o = this._min, s = this._max;
				if (e.length === 0) return vn(this);
				if (!e.every(function(e) {
					return e[0] !== void 0 && e[1] !== void 0 && i(e[0], e[1]) <= 0;
				})) return R(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", P.InvalidArgument);
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
					return R(this, It);
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
					return Sn(p[0][0], p[p.length - 1][1], !c, !l);
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
				var e = se.apply(oe, arguments);
				return e.every(function(e) {
					return typeof e == "string";
				}) ? e.length === 0 ? vn(this) : this.inAnyRange(e.map(function(e) {
					return [e, e + Pt];
				})) : R(this, "startsWithAnyOf() only works with strings");
			}, e;
		}();
		function Tn(e) {
			return nn(wn.prototype, function(t, n, r) {
				if (this.db = e, this._ctx = {
					table: t,
					index: n === ":id" ? null : n,
					or: r
				}, this._cmp = this._ascending = Kt, this._descending = function(e, t) {
					return Kt(t, e);
				}, this._max = function(e, t) {
					return Kt(e, t) > 0 ? e : t;
				}, this._min = function(e, t) {
					return Kt(e, t) < 0 ? e : t;
				}, this._IDBKeyRange = e._deps.IDBKeyRange, !this._IDBKeyRange) throw new P.MissingAPI();
			});
		}
		function B(e) {
			return pt(function(t) {
				return En(t), e(t.target.error), !1;
			});
		}
		function En(e) {
			e.stopPropagation && e.stopPropagation(), e.preventDefault && e.preventDefault();
		}
		var Dn = "storagemutated", On = "x-storagemutated-1", kn = tn(null, Dn), An = function() {
			function e() {}
			return e.prototype._lock = function() {
				return b(!I.global), ++this._reculock, this._reculock === 1 && !I.global && (I.lockOwnerFor = this), this;
			}, e.prototype._unlock = function() {
				if (b(!I.global), --this._reculock === 0) for (I.global || (I.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked();) {
					var e = this._blockedFuncs.shift();
					try {
						Ot(e[1], e[0]);
					} catch {}
				}
				return this;
			}, e.prototype._locked = function() {
				return this._reculock && I.lockOwnerFor !== this;
			}, e.prototype.create = function(e) {
				var t = this;
				if (!this.mode) return this;
				var n = this.db.idbdb, r = this.db._state.dbOpenError;
				if (b(!this.idbtrans), !e && !n) switch (r && r.name) {
					case "DatabaseClosedError": throw new P.DatabaseClosed(r);
					case "MissingAPIError": throw new P.MissingAPI(r.message, r);
					default: throw new P.OpenFailed(r);
				}
				if (!this.active) throw new P.TransactionInactive();
				return b(this._completion._state === null), e = this.idbtrans = e || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : n.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })), e.onerror = pt(function(n) {
					En(n), t._reject(e.error);
				}), e.onabort = pt(function(n) {
					En(n), t.active && t._reject(new P.Abort(e.error)), t.active = !1, t.on("abort").fire(n);
				}), e.oncomplete = pt(function() {
					t.active = !1, t._resolve(), "mutatedParts" in e && kn.storagemutated.fire(e.mutatedParts);
				}), this;
			}, e.prototype._promise = function(e, t, n) {
				var r = this;
				if (e === "readwrite" && this.mode !== "readwrite") return jt(new P.ReadOnly("Transaction is readonly"));
				if (!this.active) return jt(new P.TransactionInactive());
				if (this._locked()) return new L(function(i, a) {
					r._blockedFuncs.push([function() {
						r._promise(e, t, n).then(i, a);
					}, I]);
				});
				if (n) return bt(function() {
					var e = new L(function(e, n) {
						r._lock();
						var i = t(e, n, r);
						i && i.then && i.then(e, n);
					});
					return e.finally(function() {
						return r._unlock();
					}), e._lib = !0, e;
				});
				var i = new L(function(e, n) {
					var i = t(e, n, r);
					i && i.then && i.then(e, n);
				});
				return i._lib = !0, i;
			}, e.prototype._root = function() {
				return this.parent ? this.parent._root() : this;
			}, e.prototype.waitFor = function(e) {
				var t = this._root(), n = L.resolve(e);
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
				return new L(function(e, r) {
					n.then(function(n) {
						return t._waitingQueue.push(pt(e.bind(null, n)));
					}, function(e) {
						return t._waitingQueue.push(pt(r.bind(null, e)));
					}).finally(function() {
						t._waitingFor === i && (t._waitingFor = null);
					});
				});
			}, e.prototype.abort = function() {
				this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new P.Abort()));
			}, e.prototype.table = function(e) {
				var t = this._memoizedTables ||= {};
				if (u(t, e)) return t[e];
				var n = this.schema[e];
				if (!n) throw new P.NotFound("Table " + e + " not part of transaction");
				var r = new this.db.Table(e, n, this);
				return r.core = this.db.core.table(e), t[e] = r, r;
			}, e;
		}();
		function jn(e) {
			return nn(An.prototype, function(t, n, r, i, a) {
				var o = this;
				t !== "readonly" && n.forEach(function(e) {
					var t = r[e]?.yProps;
					t && (n = n.concat(t.map(function(e) {
						return e.updatesTable;
					})));
				}), this.db = e, this.mode = t, this.storeNames = n, this.schema = r, this.chromeTransactionDurability = i, this.idbtrans = null, this.on = tn(this, "complete", "error", "abort"), this.parent = a || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new L(function(e, t) {
					o._resolve = e, o._reject = t;
				}), this._completion.then(function() {
					o.active = !1, o.on.complete.fire();
				}, function(e) {
					var t = o.active;
					return o.active = !1, o.on.error.fire(e), o.parent ? o.parent._reject(e) : t && o.idbtrans && o.idbtrans.abort(), jt(e);
				});
			});
		}
		function Mn(e, t, n, r, i, a, o, s) {
			return {
				name: e,
				keyPath: t,
				unique: n,
				multi: r,
				auto: i,
				compound: a,
				src: (n && !o ? "&" : "") + (r ? "*" : "") + (i ? "++" : "") + Nn(t),
				type: s
			};
		}
		function Nn(e) {
			return typeof e == "string" ? e : e ? "[" + [].join.call(e, "+") + "]" : "";
		}
		function Pn(e, t, n) {
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
		function Fn(e) {
			return e.length === 1 ? e[0] : e;
		}
		var In = function(e) {
			try {
				return e.only([[]]), In = function() {
					return [[]];
				}, [[]];
			} catch {
				return In = function() {
					return Pt;
				}, Pt;
			}
		};
		function Ln(e) {
			return e == null ? function() {} : typeof e == "string" ? Rn(e) : function(t) {
				return C(t, e);
			};
		}
		function Rn(e) {
			return e.split(".").length === 1 ? function(t) {
				return t[e];
			} : function(t) {
				return C(t, e);
			};
		}
		function zn(e) {
			return [].slice.call(e);
		}
		var Bn = 0;
		function Vn(e) {
			return e == null ? ":id" : typeof e == "string" ? e : `[${e.join("+")}]`;
		}
		function Hn(e, t, n) {
			function r(e, t) {
				var n = zn(e.objectStoreNames), r = n.length > 0 ? t.objectStore(n[0]) : {};
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
									extractKey: Ln(t)
								},
								indexes: zn(e.indexNames).map(function(t) {
									return e.index(t);
								}).map(function(e) {
									var t = e.name, n = e.unique, r = e.multiEntry, i = e.keyPath, s = {
										name: t,
										compound: o(i),
										keyPath: i,
										unique: n,
										multiEntry: r,
										extractKey: Ln(i)
									};
									return a[Vn(i)] = s, s;
								}),
								getIndexByKeyPath: function(e) {
									return a[Vn(e)];
								}
							};
							return a[":id"] = s.primaryKey, t != null && (a[Vn(t)] = s.primaryKey), s;
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
						e = pt(e);
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
							++g, En(e);
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
						e = pt(e);
						var l = a.index, u = a.range, d = n.objectStore(t), f = l.isPrimaryKey ? d : d.index(l.name), p = o ? s ? "prevunique" : "prev" : s ? "nextunique" : "next", m = r || !("openKeyCursor" in f) ? f.openCursor(i(u), p) : f.openKeyCursor(i(u), p);
						m.onerror = B(c), m.onsuccess = pt(function(t) {
							var r = m.result;
							if (!r) e(null);
							else {
								r.___id = ++Bn, r.done = !1;
								var i = r.continue.bind(r), a = r.continuePrimaryKey;
								a &&= a.bind(r);
								var o = r.advance.bind(r), s = function() {
									throw Error("Cursor not started");
								}, l = function() {
									throw Error("Cursor not stopped");
								};
								r.trans = n, r.stop = r.continue = r.continuePrimaryKey = r.advance = s, r.fail = pt(c), r.next = function() {
									var e = this, t = 1;
									return this.start(function() {
										return t-- ? e.continue() : e.stop();
									}).then(function() {
										return e;
									});
								}, r.start = function(e) {
									var t = new Promise(function(e, t) {
										e = pt(e), m.onerror = B(t), r.fail = t, r.stop = function(t) {
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
									return m.onsuccess = pt(function(e) {
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
							a = pt(a);
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
								}, y.onerror = B(o);
							} else if (e && d === "next") {
								var y = c ? g.getAll(_, f) : g.getAllKeys(_, f);
								y.onsuccess = function(e) {
									return a({ result: e.target.result });
								}, y.onerror = B(o);
							} else {
								var b = 0, x = c || !("openKeyCursor" in g) ? g.openCursor(_, d) : g.openKeyCursor(_, d), S = [];
								x.onsuccess = function() {
									var e = x.result;
									if (!e || (S.push(c ? e.value : e.primaryKey), ++b === l)) return a({ result: S });
									e.continue();
								}, x.onerror = B(o);
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
							e = pt(e);
							for (var a = n.objectStore(t), o = r.length, s = Array(o), c = 0, l = 0, u, d = function(t) {
								var n = t.target;
								s[n._pos] = n.result, ++l === c && e(s);
							}, f = B(i), p = 0; p < o; ++p) r[p] != null && (u = a.get(r[p]), u._pos = p, u.onsuccess = d, u.onerror = f, ++c);
							c === 0 && e(s);
						});
					},
					get: function(e) {
						var n = e.trans, r = e.key;
						return new Promise(function(e, i) {
							e = pt(e);
							var a = n.objectStore(t).get(r);
							a.onsuccess = function(t) {
								return e(t.target.result);
							}, a.onerror = B(i);
						});
					},
					query: a(l, u),
					openCursor: r,
					count: function(e) {
						var n = e.query, r = e.trans, a = n.index, o = n.range;
						return new Promise(function(e, n) {
							var s = r.objectStore(t), c = a.isPrimaryKey ? s : s.index(a.name), l = i(o), u = l ? c.count(l) : c.count();
							u.onsuccess = pt(function(t) {
								return e(t.target.result);
							}), u.onerror = B(n);
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
				MAX_KEY: In(t),
				schema: c
			};
		}
		function Un(e, t) {
			return t.reduce(function(e, t) {
				var r = t.create;
				return n(n({}, e), r(e));
			}, e);
		}
		function Wn(e, t, n, r) {
			var i = n.IDBKeyRange;
			return n.indexedDB, { dbcore: Un(Hn(t, i, r), e.dbcore) };
		}
		function Gn(e, t) {
			var n = t.db;
			e.core = Wn(e._middlewares, n, e._deps, t).dbcore, e.tables.forEach(function(t) {
				var n = t.name;
				e.core.schema.tables.some(function(e) {
					return e.name === n;
				}) && (t.core = e.core.table(n), e[n] instanceof e.Table && (e[n].core = t.core));
			});
		}
		function Kn(e, t, n, r) {
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
		function qn(e, t) {
			t.forEach(function(t) {
				for (var n in t) t[n] instanceof e.Table && delete t[n];
			});
		}
		function Jn(e, t) {
			return e._cfg.version - t._cfg.version;
		}
		function Yn(e, t, n, r) {
			var i = e._dbSchema;
			n.objectStoreNames.contains("$meta") && !i.$meta && (i.$meta = Pn("$meta", cr("")[0], []), e._storeNames.push("$meta"));
			var o = e._createTransaction("readwrite", e._storeNames, i);
			o.create(n), o._completion.catch(r);
			var s = o._reject.bind(o), c = I.transless || I;
			bt(function() {
				if (I.trans = o, I.transless = c, t === 0) a(i).forEach(function(e) {
					er(n, e, i[e].primKey, i[e].indexes);
				}), Gn(e, n), L.follow(function() {
					return e.on.populate.fire(o);
				}).catch(s);
				else return Gn(e, n), Zn(e, o, t).then(function(t) {
					return Qn(e, t, o, n);
				}).catch(s);
			});
		}
		function Xn(e, t) {
			tr(e._dbSchema, t), t.db.version % 10 == 0 && !t.objectStoreNames.contains("$meta") && t.db.createObjectStore("$meta").add(Math.ceil(t.db.version / 10 - 1), "version");
			var n = ir(e, e.idbdb, t);
			sr(e, e._dbSchema, t);
			for (var r = $n(n, e._dbSchema), i = function(e) {
				if (e.change.length || e.recreate) return console.warn(`Unable to patch indexes of table ${e.name} because it has changes on the type of index or primary key.`), { value: void 0 };
				var n = t.objectStore(e.name);
				e.add.forEach(function(t) {
					je && console.debug(`Dexie upgrade patch: Creating missing index ${e.name}.${t.src}`), rr(n, t);
				});
			}, a = 0, o = r.change; a < o.length; a++) {
				var s = o[a], c = i(s);
				if (typeof c == "object") return c.value;
			}
		}
		function Zn(e, t, n) {
			return t.storeNames.includes("$meta") ? t.table("$meta").get("version").then(function(e) {
				return e ?? n;
			}) : L.resolve(n);
		}
		function Qn(e, t, n, r) {
			var i = [], o = e._versions, s = e._dbSchema = ir(e, e.idbdb, r), c = o.filter(function(e) {
				return e._cfg.version >= t;
			});
			if (c.length === 0) return L.resolve();
			c.forEach(function(o) {
				i.push(function() {
					var i = s, c = o._cfg.dbschema;
					sr(e, i, r), sr(e, c, r), s = e._dbSchema = c;
					var l = $n(i, c);
					l.add.forEach(function(e) {
						er(r, e[0], e[1].primKey, e[1].indexes);
					}), l.change.forEach(function(e) {
						if (e.recreate) throw new P.Upgrade("Not yet support for changing primary key");
						var t = r.objectStore(e.name);
						e.add.forEach(function(e) {
							return rr(t, e);
						}), e.change.forEach(function(e) {
							t.deleteIndex(e.name), rr(t, e);
						}), e.del.forEach(function(e) {
							return t.deleteIndex(e);
						});
					});
					var u = o._cfg.contentUpgrade;
					if (u && o._cfg.version > t) {
						Gn(e, r), n._memoizedTables = {};
						var d = E(c);
						l.del.forEach(function(e) {
							d[e] = i[e];
						}), qn(e, [e.Transaction.prototype]), Kn(e, [e.Transaction.prototype], a(d), d), n.schema = d;
						var f = ce(u);
						f && xt();
						var p, m = L.follow(function() {
							if (p = u(n), p && f) {
								var e = St.bind(null, null);
								p.then(e, e);
							}
						});
						return p && typeof p.then == "function" ? L.resolve(p) : m.then(function() {
							return p;
						});
					}
				}), i.push(function(t) {
					var r = o._cfg.dbschema;
					nr(r, t), qn(e, [e.Transaction.prototype]), Kn(e, [e.Transaction.prototype], e._storeNames, e._dbSchema), n.schema = e._dbSchema;
				}), i.push(function(t) {
					e.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(e.idbdb.version / 10) === o._cfg.version ? (e.idbdb.deleteObjectStore("$meta"), delete e._dbSchema.$meta, e._storeNames = e._storeNames.filter(function(e) {
						return e !== "$meta";
					})) : t.objectStore("$meta").put(o._cfg.version, "version"));
				});
			});
			function l() {
				return i.length ? L.resolve(i.shift()(n.idbtrans)).then(l) : L.resolve();
			}
			return l().then(function() {
				tr(s, r);
			});
		}
		function $n(e, t) {
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
		function er(e, t, n, r) {
			var i = e.db.createObjectStore(t, n.keyPath ? {
				keyPath: n.keyPath,
				autoIncrement: n.auto
			} : { autoIncrement: n.auto });
			return r.forEach(function(e) {
				return rr(i, e);
			}), i;
		}
		function tr(e, t) {
			a(e).forEach(function(n) {
				t.db.objectStoreNames.contains(n) || (je && console.debug("Dexie: Creating missing table", n), er(t, n, e[n].primKey, e[n].indexes));
			});
		}
		function nr(e, t) {
			[].slice.call(t.db.objectStoreNames).forEach(function(n) {
				return e[n] == null && t.db.deleteObjectStore(n);
			});
		}
		function rr(e, t) {
			e.createIndex(t.name, t.keyPath, {
				unique: t.unique,
				multiEntry: t.multi
			});
		}
		function ir(e, t, n) {
			var r = {};
			return v(t.objectStoreNames, 0).forEach(function(e) {
				for (var t = n.objectStore(e), i = t.keyPath, a = Mn(Nn(i), i || "", !0, !1, !!t.autoIncrement, i && typeof i != "string", !0), o = [], s = 0; s < t.indexNames.length; ++s) {
					var c = t.index(t.indexNames[s]);
					i = c.keyPath;
					var l = Mn(c.name, i, !!c.unique, !!c.multiEntry, !1, i && typeof i != "string", !1);
					o.push(l);
				}
				r[e] = Pn(e, a, o);
			}), r;
		}
		function ar(e, t, n) {
			e.verno = t.version / 10;
			var r = e._dbSchema = ir(e, t, n);
			e._storeNames = v(t.objectStoreNames, 0), Kn(e, [e._allTables], a(r), r);
		}
		function or(e, t) {
			var n = $n(ir(e, e.idbdb, t), e._dbSchema);
			return !(n.add.length || n.change.some(function(e) {
				return e.add.length || e.change.length;
			}));
		}
		function sr(e, t, n) {
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
		function cr(e) {
			return e.split(",").map(function(e, t) {
				var n = e.split(":"), r = n[1]?.trim();
				e = n[0].trim();
				var i = e.replace(/([&*]|\+\+)/g, ""), a = /^\[/.test(i) ? i.match(/^\[(.*)\]$/)[1].split("+") : i;
				return Mn(i, a || null, /\&/.test(e), /\*/.test(e), /\+\+/.test(e), o(a), t === 0, r);
			});
		}
		var lr = function() {
			function e() {}
			return e.prototype._createTableSchema = function(e, t, n) {
				return Pn(e, t, n);
			}, e.prototype._parseIndexSyntax = function(e) {
				return cr(e);
			}, e.prototype._parseStoresSpec = function(e, t) {
				var n = this;
				a(e).forEach(function(r) {
					if (e[r] !== null) {
						var i = n._parseIndexSyntax(e[r]), a = i.shift();
						if (!a) throw new P.Schema("Invalid schema for table " + r + ": " + e[r]);
						if (a.unique = !0, a.multi) throw new P.Schema("Primary key cannot be multiEntry*");
						i.forEach(function(e) {
							if (e.auto) throw new P.Schema("Only primary key can be marked as autoIncrement (++)");
							if (!e.keyPath) throw new P.Schema("Index must have a name and cannot be an empty string");
						}), t[r] = n._createTableSchema(r, a, i);
					}
				});
			}, e.prototype.stores = function(e) {
				var t = this.db;
				this._cfg.storesSource = this._cfg.storesSource ? s(this._cfg.storesSource, e) : e;
				var n = t._versions, r = {}, i = {};
				return n.forEach(function(e) {
					s(r, e._cfg.storesSource), i = e._cfg.dbschema = {}, e._parseStoresSpec(r, i);
				}), t._dbSchema = i, qn(t, [
					t._allTables,
					t,
					t.Transaction.prototype
				]), Kn(t, [
					t._allTables,
					t,
					t.Transaction.prototype,
					this._cfg.tables
				], a(i), i), t._storeNames = a(i), this;
			}, e.prototype.upgrade = function(e) {
				return this._cfg.contentUpgrade = Ae(this._cfg.contentUpgrade || Se, e), this;
			}, e;
		}();
		function ur(e) {
			return nn(lr.prototype, function(t) {
				this.db = e, this._cfg = {
					version: t,
					storesSource: null,
					dbschema: {},
					tables: {},
					contentUpgrade: null
				};
			});
		}
		var dr = fr();
		function fr() {
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
		function pr(e, t) {
			var n = e._dbNamesDB;
			return n || (n = e._dbNamesDB = new pi(zt, {
				addons: [],
				indexedDB: e,
				IDBKeyRange: t
			}), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
		}
		function mr(e) {
			return e && typeof e.databases == "function";
		}
		function hr(e) {
			var t = e.indexedDB, n = e.IDBKeyRange;
			return mr(t) ? Promise.resolve(t.databases()).then(function(e) {
				return e.map(function(e) {
					return e.name;
				}).filter(function(e) {
					return e !== zt;
				});
			}) : pr(t, n).toCollection().primaryKeys();
		}
		function gr(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!mr(n) && t !== zt && pr(n, r).put({ name: t }).catch(Se);
		}
		function _r(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!mr(n) && t !== zt && pr(n, r).delete(t).catch(Se);
		}
		function vr(e) {
			return bt(function() {
				return I.letThrough = !0, e();
			});
		}
		function yr() {
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
		var br;
		function xr(e) {
			return !("from" in e);
		}
		var Sr = function(e, t) {
			if (this) s(this, arguments.length ? {
				d: 1,
				from: e,
				to: arguments.length > 1 ? t : e
			} : { d: 0 });
			else {
				var n = new Sr();
				return e && "d" in e && s(n, e), n;
			}
		};
		d(Sr.prototype, (br = {
			add: function(e) {
				return wr(this, e), this;
			},
			addKey: function(e) {
				return Cr(this, e, e), this;
			},
			addKeys: function(e) {
				var t = this;
				return e.forEach(function(e) {
					return Cr(t, e, e);
				}), this;
			},
			hasKey: function(e) {
				var t = Er(this).next(e).value;
				return t && Kt(t.from, e) <= 0 && Kt(t.to, e) >= 0;
			}
		}, br[N] = function() {
			return Er(this);
		}, br));
		function Cr(e, t, n) {
			var r = Kt(t, n);
			if (!isNaN(r)) {
				if (r > 0) throw RangeError();
				if (xr(e)) return s(e, {
					from: t,
					to: n,
					d: 1
				});
				var i = e.l, a = e.r;
				if (Kt(n, e.from) < 0) return i ? Cr(i, t, n) : e.l = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, Dr(e);
				if (Kt(t, e.to) > 0) return a ? Cr(a, t, n) : e.r = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, Dr(e);
				Kt(t, e.from) < 0 && (e.from = t, e.l = null, e.d = a ? a.d + 1 : 1), Kt(n, e.to) > 0 && (e.to = n, e.r = null, e.d = e.l ? e.l.d + 1 : 1);
				var o = !e.r;
				i && !e.l && wr(e, i), a && o && wr(e, a);
			}
		}
		function wr(e, t) {
			function n(e, t) {
				var r = t.from, i = t.to, a = t.l, o = t.r;
				Cr(e, r, i), a && n(e, a), o && n(e, o);
			}
			xr(t) || n(e, t);
		}
		function Tr(e, t) {
			var n = Er(t), r = n.next();
			if (r.done) return !1;
			for (var i = r.value, a = Er(e), o = a.next(i.from), s = o.value; !r.done && !o.done;) {
				if (Kt(s.from, i.to) <= 0 && Kt(s.to, i.from) >= 0) return !0;
				Kt(i.from, s.from) < 0 ? i = (r = n.next(s.from)).value : s = (o = a.next(i.from)).value;
			}
			return !1;
		}
		function Er(e) {
			var t = xr(e) ? null : {
				s: 0,
				n: e
			};
			return { next: function(e) {
				for (var n = arguments.length > 0; t;) switch (t.s) {
					case 0: if (t.s = 1, n) for (; t.n.l && Kt(e, t.n.from) < 0;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					else for (; t.n.l;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					case 1: if (t.s = 2, !n || Kt(e, t.n.to) <= 0) return {
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
		function Dr(e) {
			var t = (e.r?.d || 0) - (e.l?.d || 0), r = t > 1 ? "r" : t < -1 ? "l" : "";
			if (r) {
				var i = r === "r" ? "l" : "r", a = n({}, e), o = e[r];
				e.from = o.from, e.to = o.to, e[r] = o[r], a[r] = o[i], e[i] = a, a.d = Or(a);
			}
			e.d = Or(e);
		}
		function Or(e) {
			var t = e.r, n = e.l;
			return (t ? n ? Math.max(t.d, n.d) : t.d : n ? n.d : 0) + 1;
		}
		function kr(e, t) {
			return a(t).forEach(function(n) {
				e[n] ? wr(e[n], t[n]) : e[n] = te(t[n]);
			}), e;
		}
		function V(e, t) {
			return e.all || t.all || Object.keys(e).some(function(n) {
				return t[n] && Tr(t[n], e[n]);
			});
		}
		var Ar = {}, jr = {}, Mr = !1;
		function Nr(e, t) {
			kr(jr, e), Mr || (Mr = !0, setTimeout(function() {
				Mr = !1;
				var e = jr;
				jr = {}, Pr(e, !1);
			}, 0));
		}
		function Pr(e, t) {
			t === void 0 && (t = !1);
			var n = /* @__PURE__ */ new Set();
			if (e.all) for (var r = 0, i = Object.values(Ar); r < i.length; r++) {
				var a = i[r];
				Fr(a, e, n, t);
			}
			else for (var o in e) {
				var s = /^idb\:\/\/(.*)\/(.*)\//.exec(o);
				if (s) {
					var a = Ar[`idb://${s[1]}/${s[2]}`];
					a && Fr(a, e, n, t);
				}
			}
			n.forEach(function(e) {
				return e();
			});
		}
		function Fr(e, t, n, r) {
			for (var i = [], a = 0, o = Object.entries(e.queries.query); a < o.length; a++) {
				for (var s = o[a], c = s[0], l = s[1], u = [], d = 0, f = l; d < f.length; d++) {
					var p = f[d];
					V(t, p.obsSet) ? p.subscribers.forEach(function(e) {
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
		function Ir(e) {
			var t = e._state, n = e._deps.indexedDB;
			if (t.isBeingOpened || e.idbdb) return t.dbReadyPromise.then(function() {
				return t.dbOpenError ? jt(t.dbOpenError) : e;
			});
			t.isBeingOpened = !0, t.dbOpenError = null, t.openComplete = !1;
			var r = t.openCanceller, a = Math.round(e.verno * 10), o = !1;
			function s() {
				if (t.openCanceller !== r) throw new P.DatabaseClosed("db.open() was cancelled");
			}
			var c = t.dbReadyResolve, l = null, u = !1, d = function() {
				return new L(function(r, i) {
					if (s(), !n) throw new P.MissingAPI();
					var c = e.name, f = t.autoSchema || !a ? n.open(c) : n.open(c, a);
					if (!f) throw new P.MissingAPI();
					f.onerror = B(i), f.onblocked = pt(e._fireOnBlocked), f.onupgradeneeded = pt(function(r) {
						if (l = f.transaction, t.autoSchema && !e._options.allowEmptyDB) {
							f.onerror = En, l.abort(), f.result.close();
							var a = n.deleteDatabase(c);
							a.onsuccess = a.onerror = pt(function() {
								i(new P.NoSuchDatabase(`Database ${c} doesnt exist`));
							});
						} else {
							l.onerror = B(i);
							var s = r.oldVersion > 2 ** 62 ? 0 : r.oldVersion;
							u = s < 1, e.idbdb = f.result, o && Xn(e, l), Yn(e, s / 10, l, i);
						}
					}, i), f.onsuccess = pt(function() {
						l = null;
						var n = e.idbdb = f.result, i = v(n.objectStoreNames);
						if (i.length > 0) try {
							var s = n.transaction(Fn(i), "readonly");
							if (t.autoSchema) ar(e, n, s);
							else if (sr(e, e._dbSchema, s), !or(e, s) && !o) return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), n.close(), a = n.version + 1, o = !0, r(d());
							Gn(e, s);
						} catch {}
						dr.add(e), n.onversionchange = pt(function(n) {
							t.vcFired = !0, e.on("versionchange").fire(n);
						}), n.onclose = pt(function() {
							e.close({ disableAutoOpen: !1 });
						}), u && gr(e._deps, c), r();
					}, i);
				}).catch(function(e) {
					switch (e?.name) {
						case "UnknownError":
							if (t.PR1398_maxLoop > 0) return t.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), d();
							break;
						case "VersionError": if (a > 0) return a = 0, d();
					}
					return L.reject(e);
				});
			}, f = typeof navigator < "u" && !!n && n === i.indexedDB;
			return L.race([r, (f ? yr() : L.resolve()).then(d)]).then(function() {
				return s(), t.onReadyBeingFired = [], L.resolve(vr(function() {
					return e.on.ready.fire(e.vip);
				})).then(function n() {
					if (t.onReadyBeingFired.length > 0) {
						var r = t.onReadyBeingFired.reduce(Ae, Se);
						return t.onReadyBeingFired = [], L.resolve(vr(function() {
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
				return r === t.openCanceller && e._close(), jt(n);
			}).finally(function() {
				t.openComplete = !0, c();
			}).then(function() {
				if (u) {
					var t = {};
					e.tables.forEach(function(n) {
						n.schema.indexes.forEach(function(r) {
							r.name && (t[`idb://${e.name}/${n.name}/${r.name}`] = new Sr(-Infinity, [[[]]]));
						}), t[`idb://${e.name}/${n.name}/`] = t[`idb://${e.name}/${n.name}/:dels`] = new Sr(-Infinity, [[[]]]);
					}), kn(Dn).fire(t), Pr(t, !0);
				}
				return e;
			});
		}
		function Lr(e) {
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
		function Rr(e, t, n) {
			var r = arguments.length;
			if (r < 2) throw new P.InvalidArgument("Too few arguments");
			for (var i = Array(r - 1); --r;) i[r - 1] = arguments[r];
			return n = i.pop(), [
				e,
				O(i),
				n
			];
		}
		function zr(e, t, n, r, i) {
			return L.resolve().then(function() {
				var a = I.transless || I, o = e._createTransaction(t, n, e._dbSchema, r);
				o.explicit = !0;
				var s = {
					trans: o,
					transless: a
				};
				if (r) o.idbtrans = r.idbtrans;
				else try {
					o.create(), o.idbtrans._explicit = !0, e._state.PR1398_maxLoop = 3;
				} catch (r) {
					return r.name === _e.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
						return zr(e, t, n, null, i);
					})) : jt(r);
				}
				var c = ce(i);
				c && xt();
				var l, u = L.follow(function() {
					if (l = i.call(o, o), l) {
						if (c) {
							var e = St.bind(null, null);
							l.then(e, e);
						} else typeof l.next == "function" && typeof l.throw == "function" && (l = Lr(l));
					}
				}, s);
				return (l && typeof l.then == "function" ? L.resolve(l).then(function(e) {
					return o.active ? e : jt(new P.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
				}) : u.then(function() {
					return l;
				})).then(function(e) {
					return r && o._resolve(), o._completion.then(function() {
						return e;
					});
				}).catch(function(e) {
					return o._reject(e), jt(e);
				});
			});
		}
		function Br(e, t, n) {
			for (var r = o(e) ? e.slice() : [e], i = 0; i < n; ++i) r.push(t);
			return r;
		}
		function Vr(e) {
			return n(n({}, e), { table: function(t) {
				var r = e.table(t), i = r.schema, a = Object.create(null), o = [];
				function s(e, t, r) {
					var i = Vn(e), c = a[i] = a[i] || [], l = e == null ? 0 : typeof e == "string" ? 1 : e.length, u = t > 0, d = n(n({}, r), {
						name: u ? `${i}(virtual-from:${r.name})` : r.name,
						lowLevelIndex: r,
						isVirtual: u,
						keyTail: t,
						keyLength: l,
						extractKey: Ln(e),
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
					var t = a[Vn(e)];
					return t && t[0];
				}
				function p(t, n) {
					return {
						type: t.type === 1 ? 2 : t.type,
						lower: Br(t.lower, t.lowerOpen ? e.MAX_KEY : e.MIN_KEY, n),
						lowerOpen: !0,
						upper: Br(t.upper, t.upperOpen ? e.MIN_KEY : e.MAX_KEY, n),
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
								r == null ? t.unique ? n.continue(n.key.slice(0, o).concat(t.reverse ? e.MIN_KEY : e.MAX_KEY, i)) : n.continue() : n.continue(Br(r, t.reverse ? e.MAX_KEY : e.MIN_KEY, i));
							}
							return Object.create(n, {
								continue: { value: r },
								continuePrimaryKey: { value: function(t, r) {
									n.continuePrimaryKey(Br(t, e.MAX_KEY, i), r);
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
		var Hr = {
			stack: "dbcore",
			name: "VirtualIndexMiddleware",
			level: 1,
			create: Vr
		};
		function Ur(e, t, n, r) {
			return n ||= {}, r ||= "", a(e).forEach(function(i) {
				if (!u(t, i)) n[r + i] = void 0;
				else {
					var a = e[i], o = t[i];
					if (typeof a == "object" && typeof o == "object" && a && o) {
						var s = re(a);
						s === re(o) ? s === "Object" ? Ur(a, o, n, r + i + ".") : a !== o && (n[r + i] = t[i]) : n[r + i] = t[i];
					} else a !== o && (n[r + i] = t[i]);
				}
			}), a(t).forEach(function(i) {
				u(e, i) || (n[r + i] = t[i]);
			}), n;
		}
		function Wr(e, t) {
			return t.type === "delete" ? t.keys : t.keys || t.values.map(e.extractKey);
		}
		var Gr = {
			stack: "dbcore",
			name: "HooksMiddleware",
			level: 2,
			create: function(e) {
				return n(n({}, e), { table: function(t) {
					var i = e.table(t), a = i.schema.primaryKey;
					return n(n({}, i), { mutate: function(e) {
						var o = I.trans, s = o.table(t).hook, c = s.deleting, l = s.creating, d = s.updating;
						switch (e.type) {
							case "add":
								if (l.fire === Se) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "put":
								if (l.fire === Se && d.fire === Se) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "delete":
								if (c.fire === Se) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "deleteRange":
								if (c.fire === Se) break;
								return o._promise("readwrite", function() {
									return p(e);
								}, !0);
						}
						return i.mutate(e);
						function f(e) {
							var t = I.trans, o = e.keys || Wr(a, e);
							if (!o) throw Error("Keys missing");
							return e = e.type === "add" || e.type === "put" ? n(n({}, e), { keys: o }) : n({}, e), e.type !== "delete" && (e.values = r([], e.values, !0)), e.keys && (e.keys = r([], e.keys, !0)), Kr(i, e, o).then(function(n) {
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
										var p = Ur(o, e.values[i]), m = d.fire.call(s, p, r, o, t);
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
		function Kr(e, t, n) {
			return t.type === "add" ? Promise.resolve([]) : e.getMany({
				trans: t.trans,
				keys: n,
				cache: "immutable"
			});
		}
		function qr(e, t, n) {
			try {
				if (!t || t.keys.length < e.length) return null;
				for (var r = [], i = 0, a = 0; i < t.keys.length && a < e.length; ++i) Kt(t.keys[i], e[a]) === 0 && (r.push(n ? A(t.values[i]) : t.values[i]), ++a);
				return r.length === e.length ? r : null;
			} catch {
				return null;
			}
		}
		var Jr = {
			stack: "dbcore",
			level: -1,
			create: function(e) {
				return { table: function(t) {
					var r = e.table(t);
					return n(n({}, r), {
						getMany: function(e) {
							if (!e.cache) return r.getMany(e);
							var t = qr(e.keys, e.trans._cache, e.cache === "clone");
							return t ? L.resolve(t) : r.getMany(e).then(function(t) {
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
		function Yr(e, t) {
			return e.trans.mode === "readonly" && !!e.subscr && !e.trans.explicit && e.trans.db._options.cache !== "disabled" && !t.schema.primaryKey.outbound;
		}
		function Xr(e, t) {
			switch (e) {
				case "query": return t.values && !t.unique;
				case "get": return !1;
				case "getMany": return !1;
				case "count": return !1;
				case "openCursor": return !1;
			}
		}
		var Zr = {
			stack: "dbcore",
			level: 0,
			name: "Observability",
			create: function(e) {
				var t = e.schema.name, r = new Sr(e.MIN_KEY, e.MAX_KEY);
				return n(n({}, e), {
					transaction: function(t, n, r) {
						if (I.subscr && n !== "readonly") throw new P.ReadOnly(`Readwrite transaction in liveQuery context. Querier source: ${I.querier}`);
						return e.transaction(t, n, r);
					},
					table: function(i) {
						var s = e.table(i), c = s.schema, l = c.primaryKey, u = c.indexes, d = l.extractKey, f = l.outbound, p = l.autoIncrement && u.filter(function(e) {
							return e.compound && e.keyPath.includes(l.keyPath);
						}), m = n(n({}, s), { mutate: function(n) {
							var a = n.trans, u = n.mutatedParts ||= {}, d = function(e) {
								var n = `idb://${t}/${i}/${e}`;
								return u[n] || (u[n] = new Sr());
							}, f = d(""), m = d(":dels"), h = n.type, g = n.type === "deleteRange" ? [n.range] : n.type === "delete" ? [n.keys] : n.values.length < 50 ? [Wr(l, n).filter(function(e) {
								return e != null;
							}), n.values] : [], _ = g[0], v = g[1], y = n.trans._cache;
							if (o(_)) {
								f.addKeys(_);
								var b = h === "delete" || _.length === v.length ? qr(_, y) : null;
								b || m.addKeys(_), (b || v) && Qr(d, c, b, v);
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
								})), a.mutatedParts = kr(a.mutatedParts || {}, u), e;
							});
						} }), h = function(t) {
							var n = t.query, r = n.index, i = n.range;
							return [r, new Sr(i.lower ?? e.MIN_KEY, i.upper ?? e.MAX_KEY)];
						}, g = {
							get: function(e) {
								return [l, new Sr(e.key)];
							},
							getMany: function(e) {
								return [l, new Sr().addKeys(e.keys)];
							},
							count: h,
							query: h,
							openCursor: h
						};
						return a(g).forEach(function(e) {
							m[e] = function(a) {
								var o = I.subscr, c = !!o, l = Yr(I, s) && Xr(e, a) ? a.obsSet = {} : o;
								if (c) {
									var u = function(e) {
										var n = `idb://${t}/${i}/${e}`;
										return l[n] || (l[n] = new Sr());
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
		function Qr(e, t, n, r) {
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
					Kt(i, o) !== 0 && (i != null && s(i), o != null && s(o));
				});
			}
			t.indexes.forEach(i);
		}
		function $r(e, t, r) {
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
		function ei(e, t) {
			return t.lower === void 0 ? !0 : t.lowerOpen ? Kt(e, t.lower) > 0 : Kt(e, t.lower) >= 0;
		}
		function ti(e, t) {
			return t.upper === void 0 ? !0 : t.upperOpen ? Kt(e, t.upper) < 0 : Kt(e, t.upper) <= 0;
		}
		function ni(e, t) {
			return ei(e, t) && ti(e, t);
		}
		function ri(e, t, n, r, i, a) {
			if (!n || n.length === 0) return e;
			var s = t.query.index, c = s.multiEntry, l = t.query.range, u = r.schema.primaryKey.extractKey, d = s.extractKey, f = (s.lowLevelIndex || s).extractKey, p = n.reduce(function(e, n) {
				var r = e, i = [];
				if (n.type === "add" || n.type === "put") for (var a = new Sr(), s = n.values.length - 1; s >= 0; --s) {
					var f = n.values[s], p = u(f);
					if (!a.hasKey(p)) {
						var m = d(f);
						(c && o(m) ? m.some(function(e) {
							return ni(e, l);
						}) : ni(m, l)) && (a.addKey(p), i.push(f));
					}
				}
				switch (n.type) {
					case "add":
						var h = new Sr().addKeys(t.values ? e.map(function(e) {
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
						var g = new Sr().addKeys(n.values.map(function(e) {
							return u(e);
						}));
						r = e.filter(function(e) {
							return !g.hasKey(t.values ? u(e) : e);
						}).concat(t.values ? i : i.map(function(e) {
							return u(e);
						}));
						break;
					case "delete":
						var _ = new Sr().addKeys(n.keys);
						r = e.filter(function(e) {
							return !_.hasKey(t.values ? u(e) : e);
						});
						break;
					case "deleteRange":
						var v = n.range;
						r = e.filter(function(e) {
							return !ni(u(e), v);
						});
				}
				return r;
			}, e);
			if (p === e) return e;
			var m = function(e, t) {
				return Kt(f(e), f(t)) || Kt(u(e), u(t));
			};
			return p.sort(t.direction === "prev" || t.direction === "prevunique" ? function(e, t) {
				return m(t, e);
			} : m), t.limit && t.limit < Infinity && (p.length > t.limit ? p.length = t.limit : e.length === t.limit && p.length < t.limit && (i.dirty = !0)), a ? Object.freeze(p) : p;
		}
		function ii(e, t) {
			return Kt(e.lower, t.lower) === 0 && Kt(e.upper, t.upper) === 0 && !!e.lowerOpen == !!t.lowerOpen && !!e.upperOpen == !!t.upperOpen;
		}
		function ai(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : -1;
			if (t === void 0) return 1;
			var i = Kt(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return 1;
				if (r) return -1;
			}
			return i;
		}
		function oi(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : 1;
			if (t === void 0) return -1;
			var i = Kt(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return -1;
				if (r) return 1;
			}
			return i;
		}
		function si(e, t) {
			return ai(e.lower, t.lower, e.lowerOpen, t.lowerOpen) <= 0 && oi(e.upper, t.upper, e.upperOpen, t.upperOpen) >= 0;
		}
		function ci(e, t, n, r) {
			var i = Ar[`idb://${e}/${t}`];
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
						return e.req.limit === r.limit && e.req.values === r.values && (e.req.direction ?? "next") === s && ii(e.req.query.range, r.query.range);
					});
					return c ? [
						c,
						!0,
						i,
						o
					] : [
						o.find(function(e) {
							return ("limit" in e.req ? e.req.limit : Infinity) >= r.limit && (e.req.direction ?? "next") === s && (!r.values || e.req.values) && si(e.req.query.range, r.query.range);
						}),
						!1,
						i,
						o
					];
				case "count":
					var l = o.find(function(e) {
						return ii(e.req.query.range, r.query.range);
					});
					return [
						l,
						!!l,
						i,
						o
					];
			}
		}
		function li(e, t, n, r) {
			e.subscribers.add(n), r.addEventListener("abort", function() {
				e.subscribers.delete(n), e.subscribers.size === 0 && ui(e, t);
			});
		}
		function ui(e, t) {
			setTimeout(function() {
				e.subscribers.size === 0 && ae(t, e);
			}, 3e3);
		}
		var di = {
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
											var u = l[c], d = Ar[`idb://${t}/${u}`];
											if (d) {
												var f = e.table(u), p = d.optimisticOps.filter(function(e) {
													return e.trans === a;
												});
												if (a._explicit && i && a.mutatedParts) for (var m = 0, h = Object.values(d.queries.query); m < h.length; m++) for (var g = h[m], _ = 0, v = g.slice(); _ < v.length; _++) {
													var y = v[_];
													V(y.obsSet, a.mutatedParts) && (ae(g, y), y.subscribers.forEach(function(e) {
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
																var w = Object.isFrozen(y.res), T = ri(y.res, y.req, p, f, y, w);
																y.dirty ? (ae(g, y), y.subscribers.forEach(function(e) {
																	return s.add(e);
																})) : T !== y.res && (y.res = T, y.promise = L.resolve({ result: T }));
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
								var o = I.trans;
								if (a.outbound || o.db._options.cache === "disabled" || o.explicit || o.idbtrans.mode !== "readwrite") return i.mutate(e);
								var s = Ar[`idb://${t}/${r}`];
								if (!s) return i.mutate(e);
								var c = i.mutate(e);
								return (e.type === "add" || e.type === "put") && (e.values.length >= 50 || Wr(a, e).some(function(e) {
									return e == null;
								})) ? c.then(function(t) {
									var r = $r(s, n(n({}, e), { values: e.values.map(function(e, r) {
										if (t.failures[r]) return e;
										var i = a.keyPath?.includes(".") ? A(e) : n({}, e);
										return w(i, a.keyPath, t.results[r]), i;
									}) }), t);
									s.optimisticOps.push(r), queueMicrotask(function() {
										return e.mutatedParts && Nr(e.mutatedParts);
									});
								}) : (s.optimisticOps.push(e), e.mutatedParts && Nr(e.mutatedParts), c.then(function(t) {
									if (t.numFailures > 0) {
										ae(s.optimisticOps, e);
										var n = $r(s, e, t);
										n && s.optimisticOps.push(n), e.mutatedParts && Nr(e.mutatedParts);
									}
								}), c.catch(function() {
									ae(s.optimisticOps, e), e.mutatedParts && Nr(e.mutatedParts);
								})), c;
							},
							query: function(e) {
								if (!Yr(I, i) || !Xr("query", e)) return i.query(e);
								var n = I.trans?.db._options.cache === "immutable", a = I, o = a.requery, s = a.signal, c = ci(t, r, "query", e), l = c[0], u = c[1], d = c[2], f = c[3];
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
									}, f ? f.push(l) : (f = [l], d ||= Ar[`idb://${t}/${r}`] = {
										queries: {
											query: {},
											count: {}
										},
										objs: /* @__PURE__ */ new Map(),
										optimisticOps: [],
										unsignaledParts: {}
									}, d.queries.query[e.query.index.name || ""] = f);
								}
								return li(l, f, o, s), l.promise.then(function(t) {
									var r = ri(t.result, e, d?.optimisticOps, i, l, n);
									return { result: n ? r : A(r) };
								});
							}
						});
					}
				});
			}
		};
		function fi(e, t) {
			return new Proxy(e, { get: function(e, n, r) {
				return n === "db" ? t : Reflect.get(e, n, r);
			} });
		}
		var pi = function() {
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
					maxConnections: Rt
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
					dbReadyResolve: Se,
					dbReadyPromise: null,
					cancelOpen: Se,
					openCanceller: null,
					autoSchema: !0,
					PR1398_maxLoop: 3,
					autoOpen: r.autoOpen
				};
				s.dbReadyPromise = new L(function(e) {
					s.dbReadyResolve = e;
				}), s.openCanceller = new L(function(e, t) {
					s.cancelOpen = t;
				}), this._state = s, this.name = t, this.on = tn(this, "populate", "blocked", "versionchange", "close", { ready: [Ae, Se] }), this.once = function(e, t) {
					var n = function() {
						var r = [...arguments];
						i.on(e).unsubscribe(n), t.apply(i, r);
					};
					return i.on(e, n);
				}, this.on.ready.subscribe = y(this.on.ready.subscribe, function(t) {
					return function(n, r) {
						e.vip(function() {
							var e = i._state;
							if (e.openComplete) e.dbOpenError || L.resolve().then(n), r && t(n);
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
				}), this.Collection = hn(this), this.Table = rn(this), this.Transaction = jn(this), this.Version = ur(this), this.WhereClause = Tn(this), this.on("versionchange", function(e) {
					e.newVersion > 0 ? console.warn(`Another connection wants to upgrade database '${i.name}'. Closing db now to resume the upgrade.`) : console.warn(`Another connection wants to delete database '${i.name}'. Closing db now to resume the delete request.`), i.close({ disableAutoOpen: !1 });
				}), this.on("blocked", function(e) {
					!e.newVersion || e.newVersion < e.oldVersion ? console.warn(`Dexie.delete('${i.name}') was blocked`) : console.warn(`Upgrade '${i.name}' blocked by other connection holding version ${e.oldVersion / 10}`);
				}), this._maxKey = In(r.IDBKeyRange), this._createTransaction = function(e, t, n, r) {
					return new i.Transaction(e, t, n, i._options.chromeTransactionDurability, r);
				}, this._fireOnBlocked = function(e) {
					i.on("blocked").fire(e), dr.toArray().filter(function(e) {
						return e.name === i.name && e !== i && !e._state.vcFired;
					}).map(function(t) {
						return t.on("versionchange").fire(e);
					});
				}, this.use(Jr), this.use(di), this.use(Zr), this.use(Hr), this.use(Gr);
				var c = new Proxy(this, { get: function(e, t, n) {
					if (t === "_vip") return !0;
					if (t === "table") return function(e) {
						return fi(i.table(e), c);
					};
					var r = Reflect.get(e, t, n);
					return r instanceof en ? fi(r, c) : t === "tables" ? r.map(function(e) {
						return fi(e, c);
					}) : t === "_createTransaction" ? function() {
						return fi(r.apply(this, arguments), c);
					} : r;
				} });
				this.vip = c, o.forEach(function(e) {
					return e(i);
				});
			}
			return e.prototype.version = function(e) {
				if (isNaN(e) || e < .1) throw new P.Type("Given version is not a positive number");
				if (e = Math.round(e * 10) / 10, this.idbdb || this._state.isBeingOpened) throw new P.Schema("Cannot add version when database is open");
				this.verno = Math.max(this.verno, e);
				var t = this._versions, n = t.filter(function(t) {
					return t._cfg.version === e;
				})[0];
				return n || (n = new this.Version(e), t.push(n), t.sort(Jn), n.stores({}), this._state.autoSchema = !1, n);
			}, e.prototype._whenReady = function(e) {
				var t = this;
				return this.idbdb && (this._state.openComplete || I.letThrough || this._vip) ? e() : new L(function(e, n) {
					if (t._state.openComplete) return n(new P.DatabaseClosed(t._state.dbOpenError));
					if (!t._state.isBeingOpened) {
						if (!t._state.autoOpen) {
							n(new P.DatabaseClosed());
							return;
						}
						t.open().catch(Se);
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
				return Ot(Je, function() {
					return Ir(e);
				});
			}, e.prototype._close = function() {
				this.on.close.fire(new CustomEvent("close"));
				var e = this._state;
				if (dr.remove(this), this.idbdb) {
					try {
						this.idbdb.close();
					} catch {}
					this.idbdb = null;
				}
				e.isBeingOpened || (e.dbReadyPromise = new L(function(t) {
					e.dbReadyResolve = t;
				}), e.openCanceller = new L(function(t, n) {
					e.cancelOpen = n;
				}));
			}, e.prototype.close = function(e) {
				var t = (e === void 0 ? { disableAutoOpen: !0 } : e).disableAutoOpen, n = this._state;
				t ? (n.isBeingOpened && n.cancelOpen(new P.DatabaseClosed()), this._close(), n.autoOpen = !1, n.dbOpenError = new P.DatabaseClosed()) : (this._close(), n.autoOpen = this._options.autoOpen || n.isBeingOpened, n.openComplete = !1, n.dbOpenError = null);
			}, e.prototype.delete = function(e) {
				var t = this;
				e === void 0 && (e = { disableAutoOpen: !0 });
				var n = arguments.length > 0 && typeof arguments[0] != "object", r = this._state;
				return new L(function(i, a) {
					var o = function() {
						t.close(e);
						var n = t._deps.indexedDB.deleteDatabase(t.name);
						n.onsuccess = pt(function() {
							_r(t._deps, t.name), i();
						}), n.onerror = B(a), n.onblocked = t._fireOnBlocked;
					};
					if (n) throw new P.InvalidArgument("Invalid closeOptions argument to db.delete()");
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
				var e = Rr.apply(this, arguments);
				return this._transaction.apply(this, e);
			}, e.prototype._transaction = function(e, t, n) {
				var r = this, i = I.trans;
				i && i.db === this && e.indexOf("!") === -1 || (i = null);
				var a = e.indexOf("?") !== -1;
				e = e.replace("!", "").replace("?", "");
				var o, s;
				try {
					if (s = t.map(function(e) {
						var t = e instanceof r.Table ? e.name : e;
						if (typeof t != "string") throw TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
						return t;
					}), e == "r" || e === Bt) o = Bt;
					else if (e == "rw" || e == Vt) o = Vt;
					else throw new P.InvalidArgument("Invalid transaction mode: " + e);
					if (i) {
						if (i.mode === Bt && o === Vt) {
							if (a) i = null;
							else throw new P.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
						}
						i && s.forEach(function(e) {
							if (i && i.storeNames.indexOf(e) === -1) {
								if (a) i = null;
								else throw new P.SubTransaction("Table " + e + " not included in parent transaction.");
							}
						}), a && i && !i.active && (i = null);
					}
				} catch (e) {
					return i ? i._promise(null, function(t, n) {
						n(e);
					}) : jt(e);
				}
				var c = zr.bind(null, this, o, s, i, n);
				return i ? i._promise(o, c, "lock") : I.trans ? Ot(I.transless, function() {
					return r._whenReady(c);
				}) : this._whenReady(c);
			}, e.prototype.table = function(e) {
				if (!u(this._allTables, e)) throw new P.InvalidTable(`Table ${e} does not exist`);
				return this._allTables[e];
			}, e;
		}(), mi = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable", hi = function() {
			function e(e) {
				this._subscribe = e;
			}
			return e.prototype.subscribe = function(e, t, n) {
				return this._subscribe(!e || typeof e == "function" ? {
					next: e,
					error: t,
					complete: n
				} : e);
			}, e.prototype[mi] = function() {
				return this;
			}, e;
		}(), gi;
		try {
			gi = {
				indexedDB: i.indexedDB || i.mozIndexedDB || i.webkitIndexedDB || i.msIndexedDB,
				IDBKeyRange: i.IDBKeyRange || i.webkitIDBKeyRange
			};
		} catch {
			gi = {
				indexedDB: null,
				IDBKeyRange: null
			};
		}
		function _i(e) {
			var t = !1, n, r = new hi(function(r) {
				var i = ce(e);
				function a(t) {
					var n = ot();
					try {
						i && xt();
						var r = bt(e, t);
						return i && (r = r.finally(St)), r;
					} finally {
						n && st();
					}
				}
				var o = !1, s, c = {}, l = {}, u = {
					get closed() {
						return o;
					},
					unsubscribe: function() {
						o || (o = !0, s && s.abort(), d && kn.storagemutated.unsubscribe(m));
					}
				};
				r.start && r.start(u);
				var d = !1, f = function() {
					return At(h);
				};
				function p() {
					return V(l, c);
				}
				var m = function(e) {
					kr(c, e), p() && f();
				}, h = function() {
					if (!o && gi.indexedDB) {
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
						d ||= (kn.storagemutated.subscribe(m), !0), Promise.resolve(h).then(function(e) {
							t = !0, n = e, !(o || u.signal.aborted) && (p() ? f() : (l = i, p() ? f() : (c = {}, At(function() {
								return !o && r.next && r.next(e);
							}))));
						}, function(e) {
							o || u.signal.aborted || (t = !1, ["DatabaseClosedError", "AbortError"].includes(e?.name) || o || At(function() {
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
		var vi = pi;
		d(vi, n(n({}, xe), {
			delete: function(e) {
				return new vi(e, { addons: [] }).delete();
			},
			exists: function(e) {
				return new vi(e, { addons: [] }).open().then(function(e) {
					return e.close(), !0;
				}).catch("NoSuchDatabaseError", function() {
					return !1;
				});
			},
			getDatabaseNames: function(e) {
				try {
					return hr(vi.dependencies).then(e);
				} catch {
					return jt(new P.MissingAPI());
				}
			},
			defineClass: function() {
				function e(e) {
					s(this, e);
				}
				return e;
			},
			ignoreTransaction: function(e) {
				return I.trans ? Ot(I.transless || Je, e) : e();
			},
			vip: vr,
			async: function(e) {
				return function() {
					try {
						var t = Lr(e.apply(this, arguments));
						return !t || typeof t.then != "function" ? L.resolve(t) : t;
					} catch (e) {
						return jt(e);
					}
				};
			},
			spawn: function(e, t, n) {
				try {
					var r = Lr(e.apply(n, t || []));
					return !r || typeof r.then != "function" ? L.resolve(r) : r;
				} catch (e) {
					return jt(e);
				}
			},
			currentTransaction: { get: function() {
				return I.trans || null;
			} },
			waitFor: function(e, t) {
				var n = L.resolve(typeof e == "function" ? vi.ignoreTransaction(e) : e).timeout(t || 6e4);
				return I.trans ? I.trans.waitFor(n) : n;
			},
			Promise: L,
			debug: {
				get: function() {
					return je;
				},
				set: function(e) {
					Me(e);
				}
			},
			derive: m,
			extend: s,
			props: d,
			override: y,
			Events: tn,
			on: kn,
			liveQuery: _i,
			extendObservabilitySet: kr,
			getByKeyPath: C,
			setByKeyPath: w,
			delByKeyPath: T,
			shallowClone: E,
			deepClone: A,
			getObjectDiff: Ur,
			cmp: Kt,
			asap: x,
			minKey: Ft,
			addons: [],
			connections: { get: dr.toArray },
			errnames: _e,
			dependencies: gi,
			cache: Ar,
			semVer: Nt,
			version: Nt.split(".").map(function(e) {
				return parseInt(e);
			}).reduce(function(e, t, n) {
				return e + t / 10 ** (n * 2);
			})
		})), vi.maxKey = In(vi.dependencies.IDBKeyRange), typeof dispatchEvent < "u" && typeof addEventListener < "u" && (kn(Dn, function(e) {
			if (!yi) {
				var t = new CustomEvent(On, { detail: e });
				yi = !0, dispatchEvent(t), yi = !1;
			}
		}), addEventListener(On, function(e) {
			var t = e.detail;
			yi || H(t);
		}));
		function H(e) {
			var t = yi;
			try {
				yi = !0, kn.storagemutated.fire(e), Pr(e, !0);
			} finally {
				yi = t;
			}
		}
		var yi = !1, bi, xi = function() {};
		typeof BroadcastChannel < "u" && (xi = function() {
			bi = new BroadcastChannel(On), bi.onmessage = function(e) {
				return e.data && H(e.data);
			};
		}, xi(), typeof bi.unref == "function" && bi.unref(), kn(Dn, function(e) {
			yi || bi.postMessage(e);
		})), typeof addEventListener < "u" && (addEventListener("pagehide", function(e) {
			if (!pi.disableBfCache && e.persisted) {
				je && console.debug("Dexie: handling persisted pagehide"), bi?.close();
				for (var t = 0, n = dr.toArray(); t < n.length; t++) n[t].close({ disableAutoOpen: !1 });
			}
		}), addEventListener("pageshow", function(e) {
			!pi.disableBfCache && e.persisted && (je && console.debug("Dexie: handling persisted pageshow"), xi(), H({ all: new Sr(-Infinity, [[]]) }));
		}));
		function Si(e) {
			return new Qt({ add: e });
		}
		function Ci(e) {
			return new Qt({ remove: e });
		}
		function wi(e, t) {
			return new Qt({ replacePrefix: [e, t] });
		}
		return L.rejectionMapper = be, Me(je), n(pi, /* @__PURE__ */ Object.freeze({
			__proto__: null,
			DEFAULT_MAX_CONNECTIONS: Rt,
			Dexie: pi,
			Entity: Gt,
			PropModification: Qt,
			RangeSet: Sr,
			add: Si,
			cmp: Kt,
			default: pi,
			liveQuery: _i,
			mergeRanges: wr,
			rangesOverlap: Tr,
			remove: Ci,
			replacePrefix: wi
		}), { default: pi }), pi;
	}));
})))(), 1), rp = Symbol.for("Dexie"), ip = globalThis[rp] || (globalThis[rp] = np.default);
if (np.default.semVer !== ip.semVer) throw Error(`Two different versions of Dexie loaded in the same app: ${np.default.semVer} and ${ip.semVer}`);
var { liveQuery: ap, mergeRanges: op, rangesOverlap: sp, RangeSet: cp, cmp: lp, Entity: up, PropModification: dp, replacePrefix: fp, add: pp, remove: mp, DexieYProvider: hp } = ip, gp = (e) => e / 2 ** 32 | 0, _p = (e) => e >>> 0;
function vp(e, t, n, r) {
	let i = gp(n), a = _p(n);
	e.setUint32(t, r ? a : i, r), e.setUint32(t + 4, r ? i : a, r);
}
// node_modules/@noble/hashes/utils.js
function yp(e) {
	return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
var bp = (e) => e ? `"${e}" ` : "";
function xp(e, t = "") {
	if (typeof e != "number") throw TypeError(bp(t) + "expected number, got " + typeof e);
	if (!Number.isSafeInteger(e) || e < 0) throw RangeError(bp(t) + "expected integer >= 0, got " + e);
	return e;
}
function Sp(e, t, n = "") {
	if (yp(e) && (t === void 0 || e.length === t)) return e;
	t !== void 0 && xp(t, "length");
	let r = yp(e), i = t === void 0 ? "" : ` of length ${t}`, a = r ? `length=${e.length}` : `type=${typeof e}`, o = bp(n) + "expected Uint8Array" + i + ", got " + a;
	throw r ? RangeError(o) : TypeError(o);
}
var Cp = (e, t) => {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError((t === "object" ? "" : `"${t}" `) + "expected object, got type=" + typeof e);
}, wp = (e, t) => {
	Cp(e, t);
	let n = Object.getPrototypeOf(e);
	if (n !== Object.prototype && n !== null) throw TypeError(`"${t}" expected plain object`);
	if (Object.hasOwn(e, "__proto__")) throw TypeError(`"${t}.__proto__" is not allowed`);
};
function Tp(e, t = !0) {
	if (e.destroyed) throw Error("hash was destroyed");
	if (t && e.finished) throw Error("digest() was already called");
}
function Ep(e, t) {
	Sp(e, void 0, "output");
	let n = t.outputLen;
	if (!(e.length >= n)) throw RangeError("\"output\" expected length >= " + n);
}
function Dp(...e) {
	for (let t = 0; t < e.length; t++) e[t].fill(0);
}
function Op(e) {
	return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function kp(e, t) {
	return e << 32 - t | e >>> t;
}
var Ap = typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", jp = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function Mp(e) {
	if (Sp(e), Ap) return e.toHex();
	let t = "";
	for (let n = 0; n < e.length; n++) t += jp[e[n]];
	return t;
}
function Np(e) {
	if (typeof e != "string") throw TypeError("string expected");
	let t = new TextEncoder().encode(e);
	try {
		return new Uint8Array(t);
	} finally {
		Dp(t);
	}
}
function Pp(e, t, n = "opts") {
	return wp(e, "defaults"), t !== void 0 && wp(t, n), Object.assign(Object.create(null), e, t);
}
function Fp(e, t = {}) {
	if (typeof e != "function") throw TypeError("\"hashCons\" expected function, got type=" + typeof e);
	t = Pp({}, t, "info");
	let n = (t, n) => e(n).update(t).digest(), r = e(void 0);
	return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.canXOF = r.canXOF, n.create = (t) => e(t), Object.assign(n, t), Object.freeze(n);
}
var Ip = (e) => ({ oid: Uint8Array.from([
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
function Lp(e, t, n) {
	return e & t ^ ~e & n;
}
function Rp(e, t, n) {
	return e & t ^ e & n ^ t & n;
}
var zp = class {
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
		this.blockLen = e, this.outputLen = t, this.padOffset = n, this.isLE = r, this.buffer = new Uint8Array(e), this.view = Op(this.buffer);
	}
	update(e) {
		Tp(this), Sp(e);
		let { view: t, buffer: n, blockLen: r } = this, i = e.length, a = !1;
		for (let o = 0; o < i;) {
			let s = Math.min(r - this.pos, i - o);
			if (s === r) {
				let t = Op(e);
				for (; r <= i - o; o += r) this.process(t, o);
				a = !0;
			} else n.set(o === 0 && s === i ? e : e.subarray(o, o + s), this.pos), this.pos += s, o += s, this.pos === r && (this.process(t, 0), this.pos = 0, a = !0);
		}
		return this.length += e.length, a && this.roundClean(), this;
	}
	digestInto(e) {
		Tp(this), Ep(e, this), this.finished = !0;
		let { buffer: t, view: n, blockLen: r, isLE: i } = this, { pos: a } = this;
		t[a++] = 128, t.fill(0, a), this.padOffset > r - a && (this.process(n, 0), t.fill(0)), vp(n, r - 8, this.length * 8, i), this.process(n, 0), this.roundClean();
		let o = e === t ? n : Op(e), s = this.outputLen, c = s / 4, l = this.get();
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
}, Bp = /* @__PURE__ */ Uint32Array.from([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]), Vp = /* @__PURE__ */ Uint32Array.from([
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
]), Hp = /* @__PURE__ */ new Uint32Array(64), Up = class extends zp {
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
		for (let n = 0; n < 16; n++, t += 4) Hp[n] = e.getUint32(t, !1);
		for (let e = 16; e < 64; e++) {
			let t = Hp[e - 15], n = Hp[e - 2], r = kp(t, 7) ^ kp(t, 18) ^ t >>> 3, i = kp(n, 17) ^ kp(n, 19) ^ n >>> 10;
			Hp[e] = i + Hp[e - 7] + r + Hp[e - 16] | 0;
		}
		let { A: n, B: r, C: i, D: a, E: o, F: s, G: c, H: l } = this;
		for (let e = 0; e < 64; e++) {
			let t = kp(o, 6) ^ kp(o, 11) ^ kp(o, 25), u = l + t + Lp(o, s, c) + Vp[e] + Hp[e] | 0, d = (kp(n, 2) ^ kp(n, 13) ^ kp(n, 22)) + Rp(n, r, i) | 0;
			l = c, c = s, s = o, o = a + u | 0, a = i, i = r, r = n, n = u + d | 0;
		}
		n = n + this.A | 0, r = r + this.B | 0, i = i + this.C | 0, a = a + this.D | 0, o = o + this.E | 0, s = s + this.F | 0, c = c + this.G | 0, l = l + this.H | 0, this.set(n, r, i, a, o, s, c, l);
	}
	roundClean() {
		Dp(Hp);
	}
	destroy() {
		this.destroyed = !0, this.set(0, 0, 0, 0, 0, 0, 0, 0), Dp(this.buffer);
	}
}, Wp = class extends Up {
	constructor() {
		super(32, Bp);
	}
}, Gp = /* @__PURE__ */ Fp(() => new Wp(), /* @__PURE__ */ Ip(1));
// src/core/hash.ts
function Kp(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e) ?? "null";
	if (Array.isArray(e)) return `[${e.map((e) => Kp(e === void 0 ? null : e)).join(",")}]`;
	let t = e;
	return `{${Object.keys(t).filter((e) => t[e] !== void 0).sort().map((e) => `${JSON.stringify(e)}:${Kp(t[e])}`).join(",")}}`;
}
function qp(e) {
	return Mp(Gp(typeof e == "string" ? Np(e) : e));
}
function Jp(e) {
	return qp(Kp(e));
}
// src/core/errors.ts
var X = class extends Error {
	code;
	details;
	constructor(e, t, n) {
		super(t), this.name = "TrpgError", this.code = e, this.details = n;
	}
};
function Yp(e) {
	return e?.name === "QuotaExceededError";
}
var Xp = "存储空间不足：可以删除不用的内容包，或清空最近删除";
// node_modules/zod/v4/core/util.js
function Zp(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function Qp(e, t = "|") {
	return e.map((e) => Tm(e)).join(t);
}
function $p(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var em = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function tm(e) {
	return new em(e);
}
function nm(e) {
	return e == null;
}
function rm(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function im(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
var am = /* @__PURE__*/ Symbol("evaluating");
function om(e, t, n) {
	let r;
	Object.defineProperty(e, t, {
		get() {
			if (r !== am) return r === void 0 && (r = am, r = n()), r;
		},
		set(n) {
			Object.defineProperty(e, t, { value: n });
		},
		configurable: !0
	});
}
function sm(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function cm(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function lm(e) {
	return cm(e._zod.def) ?? e._zod.def.shape;
}
function um(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return sm(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function dm(e, t, n) {
	t in e ? sm(e, t, n) : e[t] = n;
}
function fm(e, t, n, r) {
	let i = lm(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? um(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : dm(e, a, r ? r(n.value, a) : n.value));
	}
}
function pm(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? um(e, n, () => t[n]) : dm(e, n, r.value));
	}
}
function mm(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function hm(e) {
	return JSON.stringify(e);
}
function gm(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var _m = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function vm(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var ym = /* @__PURE__*/ tm(() => {
	if (hh.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function bm(e) {
	if (vm(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return vm(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function xm(e) {
	return bm(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var Sm = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function Cm(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function wm(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function Z(e) {
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
function Tm(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function Em(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var Dm = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Om = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function km(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return fm(i, e, Am(e, t)), wm(e, mm(n, {
		shape: i,
		checks: []
	}));
}
function Am(e, t) {
	let n = lm(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function jm(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Am(e, t)), a = {};
	return fm(a, e, Reflect.ownKeys(lm(e)).filter((e) => !i.has(e))), wm(e, mm(n, {
		shape: a,
		checks: []
	}));
}
function Mm(e, t) {
	if (!bm(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = lm(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return wm(e, mm(e._zod.def, { shape: Nm(e, t) }));
}
function Nm(e, t) {
	let n = {};
	return fm(n, e, Reflect.ownKeys(lm(e))), pm(n, t), n;
}
function Pm(e, t) {
	if (!bm(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return wm(e, mm(e._zod.def, { shape: Nm(e, t) }));
}
function Fm(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return fm(n, e, Reflect.ownKeys(lm(e))), fm(n, t, Reflect.ownKeys(lm(t))), wm(e, mm(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function Im(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(Am(t, n)) : void 0, o = {};
	return fm(o, t, Reflect.ownKeys(lm(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), wm(t, mm(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Lm(e, t, n) {
	let r = n ? new Set(Am(t, n)) : void 0, i = {};
	return fm(i, t, Reflect.ownKeys(lm(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), wm(t, mm(t._zod.def, { shape: i }));
}
function Rm(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function zm(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function Bm(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Vm(e) {
	return typeof e == "string" ? e : e?.message;
}
function Hm(e) {
	let t = [];
	for (let n of e ?? []) {
		let e = n._zod.def;
		if (!/_(length|size)$|_equals$/.test(e.check)) break;
		let r = e.maximum ?? e.length ?? e.size;
		r >= 0 && t.push([r, n]);
	}
	return t;
}
function Um(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function Wm(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Vm(e.inst?._zod.def?.error?.(e)) ?? Vm(a?.(e)) ?? Vm(t?.error?.(e)) ?? Vm(n.customError?.(e)) ?? Vm(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var Gm = /[\uD800-\uDBFF]/;
function Km(e) {
	let t = e.length;
	if (!Gm.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function qm(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Jm(e) {
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
function Ym(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function Xm(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : eh(e, n, r.value);
	}
}
function Zm(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function Qm(e, t, n) {
	return Zm(e, t, n, !1);
}
/* @__NO_SIDE_EFFECTS__ */
function $m(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return Zm(this, n, r(this));
			},
			set(e) {
				Zm(this, n, e);
			}
		});
	}
	return t;
}
function eh(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : Zm(this, t, n.bind(this));
		},
		set(e) {
			Zm(this, t, e);
		}
	});
}
function th(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var nh, rh = !1, ih = {
	configurable: !0,
	get() {
		rh = !0;
	}
};
function ah(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	t in r && nh !== e._zod ? nh = void 0 : (nh = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, ih);
			let e = rh;
			rh = !1;
			try {
				let r = n(this);
				return rh ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), rh ||= e, r;
			} catch (n) {
				throw delete this[t], rh ||= e, n;
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
function oh(e, t, n, r) {
	let i = th(e, t);
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
var sh = "~constantCatch";
function ch(e) {
	let t = () => e;
	return t[sh] = !0, t;
}
// node_modules/zod/v4/core/core.js
var lh, uh = {
	value: void 0,
	enumerable: !1
}, dh = "captureStackTrace" in Error ? Error : null;
function fh(e) {
	let t = dh;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return dh = null, new e();
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
function Q(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			uh.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", uh);
			} finally {
				uh.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), Xm(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? fh(u) : this;
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
var ph = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, mh = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(lh = globalThis).__zod_globalConfig ?? (lh.__zod_globalConfig = {});
var hh = globalThis.__zod_globalConfig;
function gh(e) {
	return e && Object.assign(hh, e), hh;
}
// node_modules/zod/v4/core/errors.js
function _h() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, $p, 2), e.message;
}
function vh(e) {
	this._zod.message = e;
}
var yh = {
	get: _h,
	set: vh,
	enumerable: !0,
	configurable: !0
}, bh = {
	value: void 0,
	enumerable: !1
}, xh = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), Sh = /* @__PURE__ */ Q("$ZodError", (e, t) => {
	e.name = "$ZodError", bh.value = t, Object.defineProperty(e, "issues", bh), bh.value = void 0, Object.defineProperty(e, "message", yh);
	let n = Object.getPrototypeOf(e);
	xh.has(n) || (xh.add(n), Object.defineProperty(n, "toString", {
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
function Ch(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function wh(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? Ch(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Th(e, t = (e) => e.message) {
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
function Eh(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var Dh = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new ph();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => Wm(e, o, gh())));
			throw _m(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Oh = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => Wm(e, o, gh())));
			throw _m(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, kh = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new ph();
	return a.issues.length ? Ah(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function Ah(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => Wm(e, n, gh()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var jh = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? Ah(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, Mh = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Nh = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Ph = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== Mh) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return Fh(e, t, n);
});
function Fh(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[Nh] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new ph();
	return a.issues.length === 0;
}
var Ih = async (e, t, n) => {
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
}, Lh = (e) => {
	let t = Dh(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, Eh(n, a));
	};
	return n;
}, Rh = (e) => {
	let t = Dh(e), n = (e, r, i, a) => t(e, r, i, Eh(n, a));
	return n;
}, zh = (e) => {
	let t = Oh(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, Eh(n, a));
	};
	return n;
}, Bh = (e) => {
	let t = Oh(e), n = async (e, r, i, a) => await t(e, r, i, Eh(n, a));
	return n;
}, Vh = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return kh(e)(t, n, i);
}, Hh = (e) => (t, n, r) => kh(e)(t, n, r), Uh = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return jh(e)(t, n, i);
}, Wh = (e) => async (t, n, r) => jh(e)(t, n, r), Gh = /^[cC][0-9a-z]{6,}$/, Kh = /^[0-9a-z]+$/, qh = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Jh = /^[0-9a-vA-V]{20}$/, Yh = /^[A-Za-z0-9]{27}$/, Xh = /^[a-zA-Z0-9_-]{21}$/;
function Zh(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var Qh = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, $h = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, eg = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, tg = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, ng = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function rg() {
	return new RegExp(ng, "u");
}
var ig = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ag = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, og = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, sg = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, cg = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, lg = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, ug = /^https?$/, dg = /^\+[1-9]\d{6,14}$/, fg = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function pg(e) {
	return RegExp(`^${e}$`);
}
var mg = /*@__PURE__*/ pg(fg);
function hg(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function gg(e) {
	return RegExp(`^${hg(e)}$`);
}
function _g(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${hg({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${hg({ precision: e.precision })}` : n;
	return RegExp(`^${fg}T(?:${r})$`);
}
var vg = /^[\s\S]{0,}$/, yg = /^-?\d+$/, bg = /^-?\d+(?:\.\d+)?$/, xg = /^(?:true|false)$/i, Sg = /^[^A-Z]*$/, Cg = /^[^a-z]*$/, wg = /*@__PURE__*/ Q("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Tg = (e) => {
	let t = e.value;
	return !nm(t) && t.length !== void 0;
}, Eg = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, Dg = /*@__PURE__*/ Q("$ZodCheckLessThan", (e, t) => {
	wg.init(e, t);
	let n = Eg[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: Eg[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Og = /*@__PURE__*/ Q("$ZodCheckGreaterThan", (e, t) => {
	wg.init(e, t);
	let n = Eg[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: Eg[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), kg = /*@__PURE__*/ Q("$ZodCheckMultipleOf", (e, t) => {
	wg.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : im(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Ag = /*@__PURE__*/ Q("$ZodCheckNumberFormat", (e, t) => {
	wg.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = Dm[t.format];
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
}), jg = /*@__PURE__*/ Q("$ZodCheckMaxLength", (e, t) => {
	var n;
	wg.init(e, t), (n = e._zod.def).when ?? (n.when = Tg), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? Km(r) : i) <= t.maximum) return;
		let a = qm(r);
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
}), Mg = /*@__PURE__*/ Q("$ZodCheckMinLength", (e, t) => {
	var n;
	wg.init(e, t), (n = e._zod.def).when ?? (n.when = Tg), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? Km(r) : i) >= t.minimum) return;
		let a = qm(r);
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
}), Ng = /*@__PURE__*/ Q("$ZodCheckLengthEquals", (e, t) => {
	var n;
	wg.init(e, t), (n = e._zod.def).when ?? (n.when = Tg), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? Km(r) : i;
		if (a === t.length) return;
		let o = qm(r), s = a > t.length;
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
}), Pg = /*@__PURE__*/ Q("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	wg.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
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
}), Fg = /*@__PURE__*/ Q("$ZodCheckRegex", (e, t) => {
	Pg.init(e, t), e._zod.check = (n) => {
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
}), Ig = /*@__PURE__*/ Q("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= Sg, Pg.init(e, t);
}), Lg = /*@__PURE__*/ Q("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= Cg, Pg.init(e, t);
}), Rg = /*@__PURE__*/ Q("$ZodCheckIncludes", (e, t) => {
	wg.init(e, t);
	let n = Cm(t.includes);
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
}), zg = /*@__PURE__*/ Q("$ZodCheckStartsWith", (e, t) => {
	wg.init(e, t);
	let n = RegExp(`^${Cm(t.prefix)}.*`);
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
}), Bg = /*@__PURE__*/ Q("$ZodCheckEndsWith", (e, t) => {
	wg.init(e, t);
	let n = RegExp(`.*${Cm(t.suffix)}$`);
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
}), Vg = /*@__PURE__*/ Q("$ZodCheckOverwrite", (e, t) => {
	wg.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Hg = class {
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
}, Ug = {
	major: 4,
	minor: 6,
	patch: 7
}, Wg = /*@__PURE__*/ Q("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Ug;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = Rm(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (zm(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new ph();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (Um(t.issues, n, e), i ||= Rm(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					Um(t.issues, n, e), i ||= Rm(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (Rm(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new ph();
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
				if (a.async === !1) throw new ph();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return Qm(this, "~standard", qg(this));
	},
	set "~standard"(e) {
		Zm(this, "~standard", e);
	}
}), Gg = (e, t) => e.issues.length ? { issues: e.issues.map((e) => Wm(e, t, gh())) } : { value: e.value };
async function Kg(e, t) {
	let n = { async: !0 };
	return Gg(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function qg(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return Gg(r, n);
			} catch {}
			return Kg(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var Jg = /*@__PURE__*/ Q("$ZodString", (e, t) => {
	Wg.init(e, t), e._zod.pattern = t.pattern ?? vg, e._zod.parse = (n, r) => {
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
}), Yg = /*@__PURE__*/ Q("$ZodStringFormat", (e, t) => {
	Pg.init(e, t), Jg.init(e, t);
}), Xg = /*@__PURE__*/ Q("$ZodGUID", (e, t) => {
	t.pattern ??= $h, Yg.init(e, t);
}), Zg = /*@__PURE__*/ Q("$ZodUUID", (e, t) => {
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
		t.pattern ??= eg(e);
	} else t.pattern ??= eg();
	Yg.init(e, t);
}), Qg = /*@__PURE__*/ Q("$ZodEmail", (e, t) => {
	t.pattern ??= tg, Yg.init(e, t);
});
function $g(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function e_(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? $g(e) || 2 : t_(e, t);
}
function t_(e, t) {
	if (!t.normalize && t.protocol?.source === ug.source && !/^https?:\/\//i.test(e)) return 1;
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
var n_ = /[\t\n\r]/g;
function r_(e) {
	return e.replace(n_, "");
}
function i_(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function a_(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var o_ = /*@__PURE__*/ Q("$ZodURL", (e, t) => {
	Yg.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = e_(r, t);
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
				n.value = r_(r);
				return;
			}
			t.hostname && !i_(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !a_(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : r_(r);
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
}), s_ = /*@__PURE__*/ Q("$ZodEmoji", (e, t) => {
	t.pattern ??= rg(), Yg.init(e, t);
}), c_ = /*@__PURE__*/ Q("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? Xh : Zh(t.length), Yg.init(e, t);
}), l_ = /*@__PURE__*/ Q("$ZodCUID", (e, t) => {
	t.pattern ??= Gh, Yg.init(e, t);
}), u_ = /*@__PURE__*/ Q("$ZodCUID2", (e, t) => {
	t.pattern ??= Kh, Yg.init(e, t);
}), d_ = /*@__PURE__*/ Q("$ZodULID", (e, t) => {
	t.pattern ??= qh, Yg.init(e, t);
}), f_ = /*@__PURE__*/ Q("$ZodXID", (e, t) => {
	t.pattern ??= Jh, Yg.init(e, t);
}), p_ = /*@__PURE__*/ Q("$ZodKSUID", (e, t) => {
	t.pattern ??= Yh, Yg.init(e, t);
}), m_ = /*@__PURE__*/ Q("$ZodISODateTime", (e, t) => {
	t.pattern ??= _g(t), Yg.init(e, t);
}), h_ = /*@__PURE__*/ Q("$ZodISODate", (e, t) => {
	t.pattern ??= mg, Yg.init(e, t);
}), g_ = /*@__PURE__*/ Q("$ZodISOTime", (e, t) => {
	t.pattern ??= gg(t), Yg.init(e, t);
}), __ = /*@__PURE__*/ Q("$ZodISODuration", (e, t) => {
	t.pattern ??= Qh, Yg.init(e, t);
}), v_ = /*@__PURE__*/ Q("$ZodIPv4", (e, t) => {
	t.pattern ??= ig, Yg.init(e, t);
}), y_ = /^[0-9a-fA-F:.]+$/;
function b_(e) {
	return y_.test(e) ? $g(`http://[${e}]`) : !1;
}
var x_ = /*@__PURE__*/ Q("$ZodIPv6", (e, t) => {
	t.pattern ??= ag, Yg.init(e, t), e._zod.check = (n) => {
		b_(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), S_ = /*@__PURE__*/ Q("$ZodCIDRv4", (e, t) => {
	t.pattern ??= og, Yg.init(e, t);
});
function C_(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : b_(n);
}
var w_ = /*@__PURE__*/ Q("$ZodCIDRv6", (e, t) => {
	t.pattern ??= sg, Yg.init(e, t), e._zod.check = (n) => {
		C_(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function T_(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var E_ = /^[0-9a-zA-Z+/]*={0,2}$/, D_ = /*@__PURE__*/ Q("$ZodBase64", (e, t) => {
	t.pattern ??= E_, Yg.init(e, t), e._zod.check = (n) => {
		T_(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), O_ = /^[A-Za-z0-9_-]*$/;
function k_(e) {
	if (!O_.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return T_(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var A_ = /*@__PURE__*/ Q("$ZodBase64URL", (e, t) => {
	t.pattern ??= O_, Yg.init(e, t), e._zod.check = (n) => {
		k_(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), j_ = /*@__PURE__*/ Q("$ZodE164", (e, t) => {
	t.pattern ??= dg, Yg.init(e, t);
});
function M_(e, t = null) {
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
var N_ = /*@__PURE__*/ Q("$ZodJWT", (e, t) => {
	Yg.init(e, t), e._zod.check = (n) => {
		M_(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), P_ = /*@__PURE__*/ Q("$ZodNumber", (e, t) => {
	Wg.init(e, t), e._zod.pattern = bg, e._zod.parse = (n, r) => {
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
}), F_ = /*@__PURE__*/ Q("$ZodNumberFormat", (e, t) => {
	Ag.init(e, t), P_.init(e, t);
}), I_ = /*@__PURE__*/ Q("$ZodBoolean", (e, t) => {
	Wg.init(e, t), e._zod.pattern = xg, e._zod.parse = (n, r) => {
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
}), L_ = /*@__PURE__*/ Q("$ZodUnknown", (e, t) => {
	Wg.init(e, t), e._zod.parse = (e) => e;
}), R_ = /*@__PURE__*/ Q("$ZodNever", (e, t) => {
	Wg.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function z_(e, t) {
	let n = Hm(e._zod.def.checks);
	if (!n.length) return;
	let r = Math.min(...n.map((e) => e[0])), i = e._zod.parse;
	e._zod.parse = (n, a) => {
		let o = t(n.value);
		if (o > r && !a?.skipChecks && a?.direction !== "backward") {
			for (let [t, r] of Hm(e._zod.def.checks)) if (o > t && r._zod.def.when(n)) {
				let t = n.issues.length;
				return r._zod.check(n), n.issues[t].continue = !1, Um(n.issues, t, e), n;
			}
		}
		return i(n, a);
	};
}
var B_ = (e) => Array.isArray(e) ? e.length : -1;
function V_(e, t, n) {
	e.issues.length && t.issues.push(...Bm(n, e.issues)), t.value[n] = e.value;
}
var H_ = /*@__PURE__*/ Q("$ZodArray", (e, t) => {
	Wg.init(e, t);
	let n = hh.memoizer;
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
			if (c instanceof Promise) o.push(c.then((t) => V_(t, r, e)));
			else if (V_(c, r, e), s && c.issues.length !== 0 && Rm(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	}, z_(e, B_);
});
function U_(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...Bm(n, e.issues));
		}
		!o && i === void 0 ? e.issues.length || t.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [n]
		}) : e.value === void 0 ? (o || i === "defaulted" && !s) && (t.value[n] = void 0) : t.value[n] = e.value;
	}
}
var W_ = [];
function G_(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : W_, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = Em(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function K_(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (Rm(n, p)) break;
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
		a instanceof Promise ? e.push(a.then((e) => U_(e, n, i, t, d, f))) : U_(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var q_ = /*@__PURE__*/ Q("$ZodObject", (e, t) => {
	Wg.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = tm(() => G_(t));
	ah(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || sm(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = vm, o = t.catchall, s, c = hh.memoizer;
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
				if (Rm(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => U_(n, t, e, r, a, o))) : U_(s, t, e, r, a, o);
		}
		return o ? K_(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), J_ = /*@__PURE__*/ Q("$ZodObjectJIT", (e, t) => {
	q_.init(e, t);
	let n = e._zod.parse, r = tm(() => G_(t)), i = hh.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new Hg(["payload", "ctx"], {
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
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : hm(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
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
	}, o, s = vm, c = !hh.jitless, l = c && ym.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? K_([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function Y_(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !Rm(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => Wm(e, r, gh())))
	}), t);
}
var X_ = /*@__PURE__*/ Q("$ZodUnion", (e, t) => {
	Wg.init(e, t), ah(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), ah(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), ah(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), ah(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => rm(e.source)).join("|")})$`);
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
		return a ? Promise.all(o).then((t) => Y_(t, r, e, i)) : Y_(o, r, e, i);
	};
}), Z_ = /*@__PURE__*/ Q("$ZodIntersection", (e, t) => {
	Wg.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => $_(e, t, n)) : $_(e, i, a);
	};
});
function Q_(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (bm(e) && bm(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = Q_(e[n], t[n]);
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
			let i = e[r], a = t[r], o = Q_(i, a);
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
function $_(e, t, n) {
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
	let c = Q_(t.value, n.value);
	if (!c.valid) {
		if (Rm(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var ev = /*@__PURE__*/ Q("$ZodRecord", (e, t) => {
	Wg.init(e, t);
	let n = hh.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!bm(a)) return r.issues.push({
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
						issues: s.issues.map((e) => Wm(e, i, gh())),
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
					e.issues.length && r.issues.push(...Bm(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...Bm(n, u.issues)), r.value[l] = u.value);
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
				if (typeof n == "string" && bg.test(n) && l.issues.length) {
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
						issues: l.issues.map((e) => Wm(e, i, gh())),
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
					e.issues.length && r.issues.push(...Bm(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...Bm(n, d.issues)), r.value[u] = d.value);
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
}), tv = /*@__PURE__*/ Q("$ZodEnum", (e, t) => {
	Wg.init(e, t);
	let n = Zp(t.entries), r = new Set(n);
	e._zod.values = r, ah(e, "pattern", (e) => {
		let t = Zp(e.def.entries).filter((e) => Sm.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => Cm(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), nv = /*@__PURE__*/ Q("$ZodLiteral", (e, t) => {
	Wg.init(e, t);
	let n = new Set(t.values);
	e._zod.values = n, ah(e, "pattern", (e) => {
		let t = e.def.values;
		return RegExp(t.length ? `^(${t.map((e) => typeof e == "string" ? Cm(e) : e ? Cm(e.toString()) : String(e)).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), rv = /*@__PURE__*/ Q("$ZodTransform", (e, t) => {
	Wg.init(e, t), e._zod.optin = "optional", hh.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new mh(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new ph();
		return n.value = i, n;
	};
});
function iv(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var av = /*@__PURE__*/ Q("$ZodOptional", (e, t) => {
	Wg.init(e, t), ah(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", ah(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), ah(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${rm(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => iv(e, t)) : iv(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), ov = /*@__PURE__*/ Q("$ZodExactOptional", (e, t) => {
	av.init(e, t), ah(e, "values", (e) => e.def.innerType._zod.values), ah(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), sv = /*@__PURE__*/ Q("$ZodNullable", (e, t) => {
	Wg.init(e, t), ah(e, "optin", (e) => e.def.innerType._zod.optin), ah(e, "optout", (e) => e.def.innerType._zod.optout), ah(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${rm(t.source)}|null)$`) : void 0;
	}), ah(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), cv = /*@__PURE__*/ Q("$ZodDefault", (e, t) => {
	Wg.init(e, t), e._zod.optin = "defaulted", ah(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => lv(e, t)) : lv(r, t);
	};
});
function lv(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var uv = /*@__PURE__*/ Q("$ZodPrefault", (e, t) => {
	Wg.init(e, t), e._zod.optin = "defaulted", ah(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), dv = /*@__PURE__*/ Q("$ZodNonOptional", (e, t) => {
	Wg.init(e, t), ah(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => fv(t, e)) : fv(i, e);
	};
});
function fv(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function pv(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => Wm(e, r, gh())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var mv = /*@__PURE__*/ Q("$ZodCatch", (e, t) => {
	Wg.init(e, t), ah(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), ah(e, "optout", (e) => e.def.innerType._zod.optout), ah(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => pv(e, r, t, n)) : pv(e, r, t, n);
	};
}), hv = /*@__PURE__*/ Q("$ZodPipe", (e, t) => {
	Wg.init(e, t), ah(e, "values", (e) => e.def.in._zod.values), ah(e, "optin", (e) => e.def.in._zod.optin), ah(e, "optout", (e) => e.def.out._zod.optout), ah(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => gv(e, t.in, n)) : gv(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => gv(e, t.out, n)) : gv(r, t.out, n);
	};
});
function gv(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var _v = /*@__PURE__*/ Q("$ZodReadonly", (e, t) => {
	Wg.init(e, t), ah(e, "propValues", (e) => e.def.innerType._zod.propValues), ah(e, "values", (e) => e.def.innerType._zod.values), ah(e, "optin", (e) => e.def.innerType?._zod?.optin), ah(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(vv) : vv(r);
	};
});
function vv(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var yv = /*@__PURE__*/ Q("$ZodLazy", (e, t) => {
	Wg.init(e, t), om(e._zod, "innerType", () => {
		let e = t;
		return e._cachedInner ||= t.getter(), e._cachedInner;
	}), ah(e, "pattern", (e) => e.innerType?._zod?.pattern), ah(e, "propValues", (e) => e.innerType?._zod?.propValues), ah(e, "optin", (e) => e.innerType?._zod?.optin ?? void 0), ah(e, "optout", (e) => e.innerType?._zod?.optout ?? void 0), e._zod.parse = (t, n) => e._zod.innerType._zod.run(t, n);
}), bv = /*@__PURE__*/ Q("$ZodCustom", (e, t) => {
	wg.init(e, t), Wg.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => xv(t, n, r, e));
		xv(i, n, r, e);
	};
});
function xv(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Ym(e));
	}
}
// node_modules/zod/v4/core/memoizer.js
var Sv = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, Cv = "~memo", wv = [];
function Tv(e) {
	return typeof e == "object" && !!e;
}
function Ev(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var Dv = /*@__PURE__*/ new WeakMap(), Ov = 0, kv = 1, Av = 2;
function jv(e, t, n) {
	let r = Dv.get(e);
	if (r !== void 0) return r ? Av : Ov;
	if (t.has(e)) return Av;
	t.add(e);
	let i = Ov, a = (e) => {
		if (i !== Av && e?._zod) {
			let r = jv(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = Ov;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? kv : o.value?._zod ? jv(o.value, t, n) : Ov;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = cm(c);
			s(e ? o(e, !0) : kv), a(c.catchall);
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
			s(r ? jv(r, t, !1) : kv);
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
	return t.delete(e), Mv(e, i);
}
function Mv(e, t) {
	return t !== kv && Dv.set(e, t === Av), t;
}
function Nv(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var Pv, Fv = [], Iv = {
	alloc(e, t, n) {
		let r = Pv;
		if (!r) return n;
		Pv = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), Fv.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && Rv(n, e.value)) throw new Sv();
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
					let i = jv(e, /* @__PURE__ */ new Set(), !1);
					if (i === Ov) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === Av || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!Tv(l)) return t(s, c);
				let u = c[Cv];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[Cv] = u);
				let d;
				i === c ? d = a : (d = Nv(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...Ev(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				Pv = d;
				let p = Fv.length, m = t(s, c);
				Pv = void 0;
				let h = Fv.length > p ? Fv.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? Ev(e.issues) : wv), e)) : (h && (h.issues = m.issues.length ? Ev(m.issues) : wv), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function Lv() {
	return Iv;
}
function Rv(e, t) {
	let n = e[Cv]?.backEdges;
	return n !== void 0 && Tv(t) && n.has(t);
}
// node_modules/zod/v4/locales/en.js
var zv = () => {
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
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(Jm(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${Tm(e.values[0])}` : `Invalid option: expected one of ${Qp(e.values, "|")}`;
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
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${Qp(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function Bv() {
	return { localeError: zv() };
}
// node_modules/zod/v4/core/registries.js
var Vv, Hv = class {
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
function Uv() {
	return new Hv();
}
(Vv = globalThis).__zod_globalRegistry ?? (Vv.__zod_globalRegistry = Uv());
var Wv = globalThis.__zod_globalRegistry;
// node_modules/zod/v4/core/api.js
function Gv(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function Kv(e, t) {
	return new e(Gv({
		type: "string",
		...Z(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function qv(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Jv(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Yv(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xv(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zv(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qv(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $v(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ey(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ty(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ny(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ry(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function iy(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ay(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function oy(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sy(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function cy(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ly(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function uy(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function dy(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fy(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function py(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function my(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function hy(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function gy(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function _y(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function vy(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function yy(e, t) {
	return new e(Gv({
		type: "number",
		checks: [],
		...Z(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function by(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xy(e, t) {
	return new e({
		type: "boolean",
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Sy(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function Cy(e, t) {
	return new e({
		type: "never",
		...Z(t)
	});
}
// @__NO_SIDE_EFFECTS__
function wy(e, t) {
	return new Dg({
		check: "less_than",
		...Z(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Ty(e, t) {
	return new Dg({
		check: "less_than",
		...Z(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Ey(e, t) {
	return new Og({
		check: "greater_than",
		...Z(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Dy(e, t) {
	return new Og({
		check: "greater_than",
		...Z(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Oy(e, t) {
	return new kg({
		check: "multiple_of",
		...Z(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function ky(e, t) {
	return new jg({
		check: "max_length",
		...Z(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ay(e, t) {
	return new Mg({
		check: "min_length",
		...Z(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function jy(e, t) {
	return new Ng({
		check: "length_equals",
		...Z(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function My(e, t) {
	return new Fg({
		check: "string_format",
		format: "regex",
		...Z(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ny(e) {
	return new Ig({
		check: "string_format",
		format: "lowercase",
		...Z(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Py(e) {
	return new Lg({
		check: "string_format",
		format: "uppercase",
		...Z(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Fy(e, t) {
	return new Rg({
		check: "string_format",
		format: "includes",
		...Z(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Iy(e, t) {
	return new zg({
		check: "string_format",
		format: "starts_with",
		...Z(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ly(e, t) {
	return new Bg({
		check: "string_format",
		format: "ends_with",
		...Z(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ry(e) {
	return new Vg({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function zy(e) {
	return /* @__PURE__ */ Ry((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function By() {
	return /* @__PURE__ */ Ry((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Vy() {
	return /* @__PURE__ */ Ry((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Hy() {
	return /* @__PURE__ */ Ry((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Uy() {
	return /* @__PURE__ */ Ry((e) => gm(e));
}
// @__NO_SIDE_EFFECTS__
function Wy(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...Z(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Gy(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...Z(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Ky(e, t) {
	let n = /* @__PURE__ */ qy((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(Ym(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(Ym(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function qy(e, t) {
	let n = new wg({
		check: "custom",
		...Z(t)
	});
	return n._zod.check = e, n;
}
// node_modules/zod/v4/core/to-json-schema.js
function Jy(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && sm(e, t, n[t]);
	return e;
}
function Yy(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Wv,
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
function Xy(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function Zy(e, t, n = {
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
		a && (o.ref ||= a, Zy(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Jy(o.schema, c), t.io === "input" && sb(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Qy(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function $y(e, t) {
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
				ref: `${i("__shared")}#/${r}/${Qy(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + Qy(a)
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
function eb(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		eb(e);
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
var tb = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), nb = ["oneOf", "anyOf"];
function rb(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function ib(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!tb.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? rb(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			sm(n, r, e.length === 1 ? e[0] : ib(e) ?? { allOf: e });
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
			let t = rb(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function ab(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of tb) if (t in e) return;
	let n = t.filter((e) => nb.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = ib(t);
	else {
		let e = n[0], i = nb.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => ib([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, Jy(e, r));
}
function ob(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Jy(i, s), Jy(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) eb(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) ab(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Jy(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, sm(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: lb(t, "input", e.processors),
					output: lb(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function sb(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return sb(r.element, n);
	if (r.type === "set") return sb(r.valueType, n);
	if (r.type === "lazy") return sb(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return sb(r.innerType, n);
	if (r.type === "intersection") return sb(r.left, n) || sb(r.right, n);
	if (r.type === "record" || r.type === "map") return sb(r.keyType, n) || sb(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : sb(r.in, n) || sb(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (sb(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (sb(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (sb(e, n)) return !0;
		return !!(r.rest && sb(r.rest, n));
	}
	return !1;
}
var cb = (e, t = {}) => (n) => {
	let r = Yy({
		...n,
		processors: t
	});
	return Zy(e, r), $y(r, e), ob(r, e);
}, lb = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Yy({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return Zy(e, o), $y(o, e), ob(o, e);
}, ub = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, db = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, fb = (e, t) => {
	ub(e, "minimum", t), db(e, "maximum", t);
}, pb = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, mb = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, hb = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, gb = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, _b = (e, t) => ub(e, "minimum", t.minimum), vb = (e, t) => db(e, "maximum", t.maximum), yb = (e) => (t, n) => {
	gb(t, n.format);
	let [r, i] = e[n.format];
	ub(t, "minimum", r), db(t, "maximum", i);
}, bb = {
	greater_than: (e, t) => ub(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => db(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => pb(e, t.value),
	number_format: yb(Dm),
	bigint_format: yb(Om),
	min_length: _b,
	max_length: vb,
	length_equals: (e, t) => fb(e, t.length),
	min_size: _b,
	max_size: vb,
	size_equals: (e, t) => fb(e, t.size),
	string_format: (e, t) => {
		gb(e, t.format), t.pattern && mb(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => hb(e, t.mime)
};
function xb(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) bb[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && ub(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && ub(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && db(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && db(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && pb(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && hb(t, i.mime);
	for (let e of i.patterns ?? []) mb(t, e);
	return t;
}
var Sb = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, Cb = /* @__PURE__ */ new Map([[E_, cg], [O_, lg]]), wb = (e) => Cb.get(e) ?? e, Tb = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = xb(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = Sb[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(wb);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, Eb = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = xb(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : Xy(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, Db = (e, t, n, r) => {
	n.type = "boolean";
}, Ob = (e, t, n, r) => {
	n.not = {};
}, kb = (e, t, n, r) => {
	let i = e._zod.def, a = Zp(i.entries);
	a.length === 0 ? n.not = {} : (a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a);
}, Ab = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (Xy(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (Xy(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, jb = (e, t, n, r) => {
	Xy(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, Mb = (e, t, n, r) => {
	Xy(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, Nb = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = xb(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = Zy(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function Pb(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? Pb(t.out) : t.type === "catch" ? Pb(t.innerType) : e._zod.optin;
}
var Fb = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && Xy(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) sm(i.properties, e, Zy(o[e], t, {
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
		(t.io === "input" ? Pb(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = Zy(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, Ib = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => Zy(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Lb = (e, t, n, r) => {
	let i = e._zod.def, a = Zy(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = Zy(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function Rb(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = Rb(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => Rb(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i && (p.type = "string", a || (p.pattern = (r.includes("number") ? bg : yg).source)), p;
}
var zb = /* @__PURE__ */ new WeakMap();
function Bb(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of zb.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = Rb(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var Vb = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = xb(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = Zy(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) sm(i.patternProperties, wb(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = Zy(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = zb.get(t);
			n || (n = [], zb.set(t, n), t.deferred.push(() => Bb(t))), n.push(e);
		}
		i.additionalProperties = Zy(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && Pb(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, Hb = (e, t, n, r) => {
	let i = e._zod.def, a = Zy(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, Ub = (e, t, n, r) => {
	let i = e._zod.def;
	Zy(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Wb = Symbol();
function Gb(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (Xy(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), Wb) : JSON.parse(o);
}
var Kb = (e, t, n, r) => {
	let i = e._zod.def;
	Zy(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = Gb(i.defaultValue, e, t, n, r);
	o !== Wb && (n.default = o);
}, qb = (e, t, n, r) => {
	let i = e._zod.def;
	Zy(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = Gb(i.defaultValue, e, t, n, r);
	o !== Wb && (n._prefault = o);
}, Jb = (e, t, n, r) => {
	let i = e._zod.def;
	Zy(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		Xy(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, Yb = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	Zy(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Xb = (e, t, n, r) => {
	let i = e._zod.def;
	Zy(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Zb = (e, t, n, r) => {
	let i = e._zod.def;
	Zy(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Qb = (e, t, n, r) => {
	let i = e._zod.innerType;
	Zy(i, t, r);
	let a = t.seen.get(e);
	a.ref = i;
}, $b = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function ex(e, t, n) {
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
var tx = /*@__PURE__*/ Q("ZodError", (e, t) => {
	Sh.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	$b.has(n) || ($b.add(n), ex(n, "format", (e) => (t) => Th(e, t)), ex(n, "flatten", (e) => (t) => wh(e, t)), ex(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, $p, 2);
	}), ex(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, $p, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), nx = /* @__PURE__ */ Dh(tx), rx = /* @__PURE__ */ Oh(tx), ix = /* @__PURE__ */ kh(tx), ax = /* @__PURE__ */ jh(tx), ox = /* @__PURE__ */ Lh(tx), sx = /* @__PURE__ */ Rh(tx), cx = /* @__PURE__ */ zh(tx), lx = /* @__PURE__ */ Bh(tx), ux = /* @__PURE__ */ Vh(tx), dx = /* @__PURE__ */ Hh(tx), fx = /* @__PURE__ */ Uh(tx), px = /* @__PURE__ */ Wh(tx);
// node_modules/zod/v4/classic/schemas.js
function mx() {
	hh.localeError || gh(Bv());
}
function hx() {
	hh.memoizer || gh({ memoizer: Lv() });
}
var gx = /*@__PURE__*/ Q("ZodType", (e, t) => (mx(), Wg.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(mm(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return wm(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(LS(e, t));
	},
	superRefine(e, t) {
		return this.check(RS(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ Ry(e));
	},
	optional() {
		return _S(this);
	},
	exactOptional() {
		return yS(this);
	},
	nullable() {
		return xS(this);
	},
	nullish() {
		return _S(xS(this));
	},
	nonoptional(e) {
		return DS(this, e);
	},
	array() {
		return eS(this);
	},
	or(e) {
		return aS([this, e]);
	},
	and(e) {
		return sS(this, e);
	},
	transform(e) {
		return jS(this, hS(e));
	},
	default(e) {
		return CS(this, e);
	},
	prefault(e) {
		return TS(this, e);
	},
	catch(e) {
		return kS(this, e);
	},
	pipe(e) {
		return jS(this, e);
	},
	readonly() {
		return NS(this);
	},
	describe(e) {
		let t = this.clone();
		return Wv.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return Wv.get(this);
		let t = this.clone();
		return Wv.add(t, e[0]), t;
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
		return Qm(this, "~standard", {
			...qg(this),
			jsonSchema: {
				input: lb(this, "input"),
				output: lb(this, "output")
			}
		});
	},
	set "~standard"(e) {
		Zm(this, "~standard", e);
	},
	parse: function e(t, n) {
		return nx(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await rx(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return ix(this, e, t);
	},
	async safeParseAsync(e, t) {
		return ax(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		Zm(this, "spa", e);
	},
	validate(e, t) {
		return Ph(this, e, t);
	},
	validateAsync(e, t) {
		return Ih(this, e, t);
	},
	encode: function e(t, n) {
		return ox(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return sx(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await cx(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await lx(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return ux(this, e, t);
	},
	safeDecode(e, t) {
		return dx(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return fx(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return px(this, e, t);
	},
	toJSONSchema(e) {
		return cb(this, {})(e);
	},
	get description() {
		return Wv.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), _x = /*@__PURE__*/ Q("_ZodString", (e, t) => {
	Jg.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Tb(e, t, n, r);
}, /*@__PURE__*/ $m({
	format: (e) => xb(e).format ?? null,
	minLength: (e) => xb(e).minimum ?? null,
	maxLength: (e) => xb(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ My(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ Fy(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ Iy(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ Ly(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ Ay(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ ky(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ jy(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ Ay(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ Ny(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ Py(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ By());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ zy(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ Vy());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ Hy());
	},
	slugify() {
		return this.check(/* @__PURE__ */ Uy());
	}
})), vx = /*@__PURE__*/ Q("ZodString", (e, t) => {
	Jg.init(e, t), _x.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ qv(wx, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ $v(Dx, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ my(Hx, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ ey(Ox, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ Jv(Tx, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Yv(Ex, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ Xv(Ex, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ Zv(Ex, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Qv(Ex, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ ty(kx, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ ny(Ax, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ ry(jx, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ iy(Mx, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ dy(zx, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ fy(Bx, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ ay(Nx, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ oy(Px, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ sy(Fx, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ cy(Ix, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ ly(Lx, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ uy(Rx, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ py(Vx, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ hy(bx, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ gy(xx, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ _y(Sx, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ vy(Cx, e));
	}
});
function $(e) {
	return /* @__PURE__ */ Kv(vx, e);
}
var yx = /*@__PURE__*/ Q("ZodStringFormat", (e, t) => {
	Yg.init(e, t), _x.init(e, t);
}), bx = /*@__PURE__*/ Q("ZodISODateTime", (e, t) => {
	m_.init(e, t), yx.init(e, t);
}), xx = /*@__PURE__*/ Q("ZodISODate", (e, t) => {
	h_.init(e, t), yx.init(e, t);
}), Sx = /*@__PURE__*/ Q("ZodISOTime", (e, t) => {
	g_.init(e, t), yx.init(e, t);
}), Cx = /*@__PURE__*/ Q("ZodISODuration", (e, t) => {
	__.init(e, t), yx.init(e, t);
}), wx = /*@__PURE__*/ Q("ZodEmail", (e, t) => {
	Qg.init(e, t), yx.init(e, t);
}), Tx = /*@__PURE__*/ Q("ZodGUID", (e, t) => {
	Xg.init(e, t), yx.init(e, t);
}), Ex = /*@__PURE__*/ Q("ZodUUID", (e, t) => {
	Zg.init(e, t), yx.init(e, t);
}), Dx = /*@__PURE__*/ Q("ZodURL", (e, t) => {
	o_.init(e, t), yx.init(e, t);
}), Ox = /*@__PURE__*/ Q("ZodEmoji", (e, t) => {
	s_.init(e, t), yx.init(e, t);
}), kx = /*@__PURE__*/ Q("ZodNanoID", (e, t) => {
	c_.init(e, t), yx.init(e, t);
}), Ax = /*@__PURE__*/ Q("ZodCUID", (e, t) => {
	l_.init(e, t), yx.init(e, t);
}), jx = /*@__PURE__*/ Q("ZodCUID2", (e, t) => {
	u_.init(e, t), yx.init(e, t);
}), Mx = /*@__PURE__*/ Q("ZodULID", (e, t) => {
	d_.init(e, t), yx.init(e, t);
}), Nx = /*@__PURE__*/ Q("ZodXID", (e, t) => {
	f_.init(e, t), yx.init(e, t);
}), Px = /*@__PURE__*/ Q("ZodKSUID", (e, t) => {
	p_.init(e, t), yx.init(e, t);
}), Fx = /*@__PURE__*/ Q("ZodIPv4", (e, t) => {
	v_.init(e, t), yx.init(e, t);
}), Ix = /*@__PURE__*/ Q("ZodIPv6", (e, t) => {
	x_.init(e, t), yx.init(e, t);
}), Lx = /*@__PURE__*/ Q("ZodCIDRv4", (e, t) => {
	S_.init(e, t), yx.init(e, t);
}), Rx = /*@__PURE__*/ Q("ZodCIDRv6", (e, t) => {
	w_.init(e, t), yx.init(e, t);
}), zx = /*@__PURE__*/ Q("ZodBase64", (e, t) => {
	D_.init(e, t), yx.init(e, t);
}), Bx = /*@__PURE__*/ Q("ZodBase64URL", (e, t) => {
	A_.init(e, t), yx.init(e, t);
}), Vx = /*@__PURE__*/ Q("ZodE164", (e, t) => {
	j_.init(e, t), yx.init(e, t);
}), Hx = /*@__PURE__*/ Q("ZodJWT", (e, t) => {
	N_.init(e, t), yx.init(e, t);
}), Ux = /*@__PURE__*/ Q("ZodNumber", (e, t) => {
	P_.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Eb(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ $m({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = xb(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = xb(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = xb(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => xb(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ Ey(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ Dy(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ Dy(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ wy(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ Ty(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Ty(e, t));
	},
	int(e) {
		return this.check(Kx(e));
	},
	safe(e) {
		return this.check(Kx(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ Ey(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ Dy(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ wy(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ Ty(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ Oy(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ Oy(e, t));
	},
	finite() {
		return this;
	}
}));
function Wx(e) {
	return /* @__PURE__ */ yy(Ux, e);
}
var Gx = /*@__PURE__*/ Q("ZodNumberFormat", (e, t) => {
	F_.init(e, t), Ux.init(e, t);
});
function Kx(e) {
	return /* @__PURE__ */ by(Gx, e);
}
var qx = /*@__PURE__*/ Q("ZodBoolean", (e, t) => {
	I_.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Db(e, t, n, r);
});
function Jx(e) {
	return /* @__PURE__ */ xy(qx, e);
}
var Yx = /*@__PURE__*/ Q("ZodUnknown", (e, t) => {
	L_.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Xx() {
	return /* @__PURE__ */ Sy(Yx);
}
var Zx = /*@__PURE__*/ Q("ZodNever", (e, t) => {
	R_.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ob(e, t, n, r);
});
function Qx(e) {
	return /* @__PURE__ */ Cy(Zx, e);
}
var $x = /*@__PURE__*/ Q("ZodArray", (e, t) => {
	hx(), H_.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Nb(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ Ay(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ Ay(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ ky(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ jy(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function eS(e, t) {
	return /* @__PURE__ */ Wy($x, e, t);
}
var tS = /*@__PURE__*/ Q("ZodObject", (e, t) => {
	hx(), J_.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Fb(e, t, n, r), oh(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return dS(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(mm(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(mm(this._zod.def, { catchall: Xx() }));
	},
	loose() {
		return this.clone(mm(this._zod.def, { catchall: Xx() }));
	},
	strict() {
		return this.clone(mm(this._zod.def, { catchall: Qx() }));
	},
	strip() {
		return this.clone(mm(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Mm(this, e);
	},
	safeExtend(e) {
		return Pm(this, e);
	},
	merge(e) {
		return Fm(this, e);
	},
	pick(e) {
		return km(this, e);
	},
	omit(e) {
		return jm(this, e);
	},
	partial(...e) {
		return Im(gS, this, e[0]);
	},
	exactPartial(...e) {
		return Im(vS, this, e[0], "exactPartial");
	},
	required(...e) {
		return Lm(ES, this, e[0]);
	}
});
function nS(e, t) {
	return new tS({
		type: "object",
		shape: e ?? {},
		...Z(t)
	});
}
function rS(e, t) {
	return new tS({
		type: "object",
		shape: e,
		catchall: Xx(),
		...Z(t)
	});
}
var iS = /*@__PURE__*/ Q("ZodUnion", (e, t) => {
	X_.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ib(e, t, n, r), e.options = t.options;
});
function aS(e, t) {
	return new iS({
		type: "union",
		options: e,
		...Z(t)
	});
}
var oS = /*@__PURE__*/ Q("ZodIntersection", (e, t) => {
	Z_.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Lb(e, t, n, r);
});
function sS(e, t) {
	return new oS({
		type: "intersection",
		left: e,
		right: t
	});
}
var cS = /*@__PURE__*/ Q("ZodRecord", (e, t) => {
	hx(), ev.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Vb(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function lS(e, t, n) {
	return !t || !t._zod ? new cS({
		type: "record",
		keyType: $(),
		valueType: e,
		...Z(t)
	}) : new cS({
		type: "record",
		keyType: e,
		valueType: t,
		...Z(n)
	});
}
var uS = /*@__PURE__*/ Q("ZodEnum", (e, t) => {
	tv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => kb(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new uS({
			...t,
			checks: [],
			...Z(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new uS({
			...t,
			checks: [],
			...Z(r),
			entries: i
		});
	};
});
function dS(e, t) {
	return new uS({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...Z(t)
	});
}
var fS = /*@__PURE__*/ Q("ZodLiteral", (e, t) => {
	nv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ab(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function pS(e, t) {
	return new fS({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...Z(t)
	});
}
var mS = /*@__PURE__*/ Q("ZodTransform", (e, t) => {
	hx(), rv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Mb(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new mh(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Ym(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(Ym(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function hS(e) {
	return new mS({
		type: "transform",
		transform: e
	});
}
var gS = /*@__PURE__*/ Q("ZodOptional", (e, t) => {
	av.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Zb(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function _S(e) {
	return new gS({
		type: "optional",
		innerType: e
	});
}
var vS = /*@__PURE__*/ Q("ZodExactOptional", (e, t) => {
	ov.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Zb(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function yS(e) {
	return new vS({
		type: "optional",
		innerType: e
	});
}
var bS = /*@__PURE__*/ Q("ZodNullable", (e, t) => {
	sv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Hb(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function xS(e) {
	return new bS({
		type: "nullable",
		innerType: e
	});
}
var SS = /*@__PURE__*/ Q("ZodDefault", (e, t) => {
	cv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Kb(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function CS(e, t) {
	return new SS({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : xm(t);
		}
	});
}
var wS = /*@__PURE__*/ Q("ZodPrefault", (e, t) => {
	uv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => qb(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function TS(e, t) {
	return new wS({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : xm(t);
		}
	});
}
var ES = /*@__PURE__*/ Q("ZodNonOptional", (e, t) => {
	dv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ub(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function DS(e, t) {
	return new ES({
		type: "nonoptional",
		innerType: e,
		...Z(t)
	});
}
var OS = /*@__PURE__*/ Q("ZodCatch", (e, t) => {
	mv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Jb(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function kS(e, t) {
	return new OS({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : ch(t)
	});
}
var AS = /*@__PURE__*/ Q("ZodPipe", (e, t) => {
	hv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Yb(e, t, n, r), e.in = t.in, e.out = t.out;
});
function jS(e, t) {
	return new AS({
		type: "pipe",
		in: e,
		out: t
	});
}
var MS = /*@__PURE__*/ Q("ZodReadonly", (e, t) => {
	_v.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Xb(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function NS(e) {
	return new MS({
		type: "readonly",
		innerType: e
	});
}
var PS = /*@__PURE__*/ Q("ZodLazy", (e, t) => {
	yv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => Qb(e, t, n, r), e.unwrap = () => e._zod.def.getter();
});
function FS(e) {
	return new PS({
		type: "lazy",
		getter: e
	});
}
var IS = /*@__PURE__*/ Q("ZodCustom", (e, t) => {
	bv.init(e, t), gx.init(e, t), e._zod.processJSONSchema = (t, n, r) => jb(e, t, n, r);
});
function LS(e, t = {}) {
	return /* @__PURE__ */ Gy(IS, e, t);
}
function RS(e, t) {
	return /* @__PURE__ */ Ky(e, t);
}
// src/schemas/common.ts
var zS = {
	workspace: 1,
	save: 1,
	pack: 2
}, BS = $().regex(/^[a-z0-9][a-z0-9-]*$/, "必须是小写字母、数字与短横线").max(64), VS = $().regex(/^[a-z0-9][a-z0-9.-]*$/, "必须是小写字母、数字、点与短横线").max(200), HS = $().regex(/^\d+\.\d+\.\d+$/, "必须是 x.y.z 形式的版本号"), US = Wx().int().nonnegative(), WS = FS(() => aS([
	nS({ p: $() }),
	nS({
		h: $(),
		body: eS(WS)
	}),
	nS({ list: eS($()) }),
	nS({ table: nS({
		caption: $().optional(),
		cols: eS($()),
		rows: eS(eS($()))
	}) }),
	nS({
		quote: $(),
		by: $().optional()
	}),
	nS({ read: eS(WS) })
])), GS = /\{\{(roll|hit|dc|ref|atk|em):([^{}|]*(?:\\\|[^{}|]*)*)(?:\|([^{}]*))?\}\}/g;
$().refine((e) => {
	let t = e.replace(GS, "");
	return !t.includes("{{") && !t.includes("}}");
}, "行内标记必须写成 {{种类:参数|显示文字}}");
var KS = nS({ $asset: $().min(1) }), qS = dS([
	"rules",
	"adventure",
	"setting",
	"toolkit"
]);
dS(["data", "module"]);
var JS = dS([
	"builtin",
	"download",
	"import",
	"user"
]), YS = nS({
	id: BS,
	lineage: $().min(1).max(80).optional(),
	minVersion: HS.optional()
}), XS = nS({
	requires: eS(YS).default([]),
	recommends: eS(YS).default([]),
	conflicts: eS(nS({
		id: BS,
		reason: $().max(300).default("")
	})).default([])
}), ZS = nS({
	hash: $().regex(/^[a-f0-9]{64}$/),
	mime: $().min(1).max(40),
	size: Wx().int().nonnegative()
}), QS = nS({
	id: $().min(1).max(80),
	name: $().min(1).max(120),
	order: Wx().int().min(1)
}), $S = rS({
	id: BS,
	ruleId: BS,
	category: qS,
	name: $().min(1).max(80),
	nameEn: $().max(120).optional(),
	version: HS,
	minAppVersion: HS.optional(),
	license: $().max(200).default(""),
	attribution: $().max(4e3).default(""),
	description: $().max(400).default(""),
	author: $().max(120).optional(),
	lineage: $().min(1).max(80).optional(),
	entryCount: Wx().int().nonnegative(),
	typeCounts: lS($(), Wx().int().nonnegative()).default({}),
	contributes: lS($(), Wx().int().nonnegative()).default({}),
	relationships: XS.default({
		requires: [],
		recommends: [],
		conflicts: []
	}),
	series: QS.optional(),
	blobs: eS(ZS).default([]),
	dataVersion: Wx().int().positive().default(1)
}), eC = nS({
	features: eS(Xx()).default([]),
	adventure: lS($(), Xx()).default({}),
	fallback: eS(Xx()).default([])
});
$S.extend({
	source: JS,
	byteSize: Wx().int().nonnegative(),
	sha256: $(),
	installedAt: US,
	schemaVersion: Wx().int(),
	blobHashes: eS($()).default([]),
	content: eC.default({
		features: [],
		adventure: {},
		fallback: []
	})
});
var tC = rS({
	id: $().min(1).max(160),
	type: $().min(1).max(40),
	name: $().min(1).max(200),
	nameEn: $().max(240).optional(),
	keywords: eS($()).default([]),
	unique: Jx().default(!1),
	summary: $().default(""),
	data: lS($(), Xx()).default({}),
	image: aS([$(), KS]).optional()
}), nC = nS({
	format: pS("trpg-pack"),
	formatVersion: Wx().int().positive(),
	pack: lS($(), Xx())
}), rC = nS({
	format: dS(["trpg-save", "trpg-backup"]),
	formatVersion: Wx().int().positive(),
	appVersion: $(),
	exportedAt: $(),
	ruleIds: eS($())
}), iC = nS({
	id: BS,
	version: HS,
	name: $()
}), aC = nS({
	formatVersion: Wx().int(),
	rules: eS(nS({
		id: BS,
		name: $(),
		nameShort: $(),
		status: dS(["installable", "coming"]),
		description: $().default("")
	})).default([]),
	packs: eS(nS({
		id: BS,
		ruleId: BS,
		category: qS,
		name: $(),
		nameEn: $().optional(),
		version: HS,
		license: $().default(""),
		description: $().default(""),
		typeCounts: lS($(), Wx().int().nonnegative()).default({}),
		contributes: lS($(), Wx().int().nonnegative()).default({}),
		relationships: XS.default({
			requires: [],
			recommends: [],
			conflicts: []
		}),
		lineage: $().optional(),
		series: QS.optional(),
		byteSize: Wx().int().nonnegative(),
		sha256: $(),
		url: $(),
		updatedAt: $().optional(),
		recommended: Jx().default(!1),
		group: $().optional()
	})).default([])
});
// src/core/packs/manifest.ts
function oC(e) {
	return e?.path.map(String).join(".") || "整体";
}
function sC(e) {
	return qp(new TextEncoder().encode(`trpg-pack-lineage:${e}`)).slice(0, 32);
}
function cC(e, t) {
	let n = { ...e };
	t <= 1 && (n.category = n.kind === "module" ? "adventure" : "rules", n.relationships = {
		requires: Array.isArray(n.dependsOn) ? n.dependsOn : [],
		recommends: [],
		conflicts: []
	}, delete n.kind, delete n.dependsOn), typeof n.lineage == "string" && n.lineage || (n.lineage = sC(String(n.id))), n.blobs = Array.isArray(n.blobs) ? n.blobs : [], n.contributes = n.contributes ?? {}, n.relationships = n.relationships ?? {
		requires: [],
		recommends: [],
		conflicts: []
	}, n.dataVersion = n.dataVersion ?? 1;
	let r = $S.safeParse(n);
	if (!r.success) throw new X("E_BAD_CONTENT", `文件内容损坏：说明文件的 ${oC(r.error.issues[0])} 不合法`);
	return r.data;
}
// src/core/db.ts
var lC = "tavern-trpg-assistant", uC = {};
function dC(e) {
	return e.length >= 8 && e[0] === 137 && e[1] === 80 && e[2] === 78 && e[3] === 71 ? "image/png" : e.length >= 3 && e[0] === 255 && e[1] === 216 && e[2] === 255 ? "image/jpeg" : e.length >= 6 && String.fromCharCode(...e.slice(0, 4)) === "GIF8" ? "image/gif" : e.length >= 12 && String.fromCharCode(...e.slice(0, 4)) === "RIFF" && String.fromCharCode(...e.slice(8, 12)) === "WEBP" ? "image/webp" : "application/octet-stream";
}
async function fC(e) {
	let t = await e.table("assets").toArray(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
	for (let i of t) {
		let t = qp(i.bytes);
		n.set(`${i.packId}\u0000${i.path}`, t), !r.has(t) && (r.add(t), await e.table("blobs").put({
			hash: t,
			bytes: i.bytes,
			mime: dC(i.bytes),
			size: i.bytes.length,
			createdAt: Date.now()
		}));
	}
	let i = await e.table("packs").toArray();
	for (let r of i) {
		let i = String(r.id), a = t.filter((e) => e.packId === i).map((e) => n.get(`${e.packId}\u0000${e.path}`)), o = r.kind, s = Array.isArray(r.dependsOn) ? r.dependsOn : [], c = {
			...r,
			category: r.category ?? (o === "module" ? "adventure" : "rules"),
			lineage: r.lineage ?? sC(i),
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
	uC.beforeMigrationWrite?.();
}
var pC = class extends ip {
	packs;
	entries;
	searchIndex;
	blobs;
	workspaces;
	saves;
	packTrash;
	meta;
	constructor(e = lC) {
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
		}).upgrade(fC);
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
function mC(e) {
	let t = /^(\d+)\.(\d+)\.(\d+)$/.exec(e);
	if (!t) throw Error(`版本号格式不正确：${e}`);
	return [
		Number(t[1]),
		Number(t[2]),
		Number(t[3])
	];
}
function hC(e, t) {
	let n = mC(e), r = mC(t);
	for (let e = 0; e < 3; e++) if (n[e] !== r[e]) return n[e] < r[e] ? -1 : 1;
	return 0;
}
// src/rules/dnd5e2014/data/features.ts
var gC = [
	"entries",
	"variants",
	"adventures",
	"table",
	"ruleOptions",
	"aiNotes"
], _C = [
	"charGen",
	"activities",
	"trackers"
], vC = $().min(1).max(40);
rS({
	id: BS,
	name: $().min(1).max(80),
	summary: $().max(200).default(""),
	text: $().default(""),
	implemented: Jx().default(!1),
	source: $().max(20).optional()
}), rS({
	text: $().min(1),
	appliesTo: eS($()).default([]),
	tone: $().max(80).optional()
}), rS({
	id: $().min(1).max(160),
	kind: vC,
	name: $().min(1).max(120),
	description: $().max(2e3).default(""),
	defaultEnabled: Jx().default(!1),
	stateVersion: Wx().int().positive().optional(),
	data: lS($(), Xx()).default({})
});
function yC(e) {
	return gC.includes(e) ? "supported" : _C.includes(e) ? "reserved" : "unknown";
}
// node_modules/fflate/esm/browser.js
var bC = Uint8Array, xC = Uint16Array, SC = Int32Array, CC = new bC([
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
]), wC = new bC([
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
]), TC = new bC([
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
]), EC = function(e, t) {
	for (var n = new xC(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new SC(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, DC = EC(CC, 2), OC = DC.b, kC = DC.r;
OC[28] = 258, kC[258] = 28;
for (var AC = EC(wC, 0), jC = AC.b, MC = AC.r, NC = new xC(32768), PC = 0; PC < 32768; ++PC) {
	var FC = (PC & 43690) >> 1 | (PC & 21845) << 1;
	FC = (FC & 52428) >> 2 | (FC & 13107) << 2, FC = (FC & 61680) >> 4 | (FC & 3855) << 4, NC[PC] = ((FC & 65280) >> 8 | (FC & 255) << 8) >> 1;
}
for (var IC = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new xC(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new xC(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new xC(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[NC[d] >> c] = l;
	} else for (s = new xC(r), i = 0; i < r; ++i) e[i] && (s[i] = NC[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), LC = new bC(288), PC = 0; PC < 144; ++PC) LC[PC] = 8;
for (var PC = 144; PC < 256; ++PC) LC[PC] = 9;
for (var PC = 256; PC < 280; ++PC) LC[PC] = 7;
for (var PC = 280; PC < 288; ++PC) LC[PC] = 8;
for (var RC = new bC(32), PC = 0; PC < 32; ++PC) RC[PC] = 5;
var zC = /*#__PURE__*/ IC(LC, 9, 0), BC = /*#__PURE__*/ IC(LC, 9, 1), VC = /*#__PURE__*/ IC(RC, 5, 0), HC = /*#__PURE__*/ IC(RC, 5, 1), UC = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, WC = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, GC = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, KC = function(e) {
	return (e + 7) / 8 | 0;
}, qC = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new bC(e.subarray(t, n));
}, JC = [
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
], YC = function(e, t, n) {
	var r = Error(t || JC[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, YC), !n) throw r;
	return r;
}, XC = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new bC(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new bC(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new bC(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = WC(e, d, 1);
			var v = WC(e, d + 1, 3);
			if (d += 3, !v) {
				var y = KC(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && YC(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = BC, m = HC, h = 9, g = 5;
			else if (v == 2) {
				var S = WC(e, d, 31) + 257, C = WC(e, d + 10, 15) + 4, w = S + WC(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new bC(w), E = new bC(19), D = 0; D < C; ++D) E[TC[D]] = WC(e, d + D * 3, 7);
				d += C * 3;
				for (var O = UC(E), k = (1 << O) - 1, ee = IC(E, O, 1), D = 0; D < w;) {
					var te = ee[WC(e, d, k)];
					d += te & 15;
					var y = te >> 4;
					if (y < 16) T[D++] = y;
					else {
						var ne = 0, A = 0;
						for (y == 16 ? (A = 3 + WC(e, d, 3), d += 2, ne = T[D - 1]) : y == 17 ? (A = 3 + WC(e, d, 7), d += 3) : y == 18 && (A = 11 + WC(e, d, 127), d += 7); A--;) T[D++] = ne;
					}
				}
				var j = T.subarray(0, S), M = T.subarray(S);
				h = UC(j), g = UC(M), p = IC(j, h, 1), m = IC(M, g, 1);
			} else YC(1);
			if (d > _) {
				c && YC(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var re = (1 << h) - 1, N = (1 << g) - 1, ie = d;; ie = d) {
			var ne = p[GC(e, d) & re], ae = ne >> 4;
			if (d += ne & 15, d > _) {
				c && YC(0);
				break;
			}
			if (ne || YC(2), ae < 256) n[f++] = ae;
			else if (ae == 256) {
				ie = d, p = null;
				break;
			} else {
				var oe = ae - 254;
				if (ae > 264) {
					var D = ae - 257, se = CC[D];
					oe = WC(e, d, (1 << se) - 1) + OC[D], d += se;
				}
				var ce = m[GC(e, d) & N], le = ce >> 4;
				ce || YC(3), d += ce & 15;
				var M = jC[le];
				if (le > 3) {
					var se = wC[le];
					M += GC(e, d) & (1 << se) - 1, d += se;
				}
				if (d > _) {
					c && YC(0);
					break;
				}
				s && l(f + 131072);
				var ue = f + oe;
				if (f < M) {
					var de = a - M, fe = Math.min(M, ue);
					for (de + f < 0 && YC(3); f < fe; ++f) n[f] = r[de + f];
				}
				for (; f < ue; ++f) n[f] = n[f - M];
			}
		}
		t.l = p, t.p = ie, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? qC(n, 0, f) : n.subarray(0, f);
}, ZC = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8;
}, QC = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, $C = function(e, t) {
	for (var n = [], r = 0; r < e.length; ++r) e[r] && n.push({
		s: r,
		f: e[r]
	});
	var i = n.length, a = n.slice();
	if (!i) return {
		t: ow,
		l: 0
	};
	if (i == 1) {
		var o = new bC(n[0].s + 1);
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
	var p = new xC(f + 1), m = ew(n[u - 1], p, 0);
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
		t: new bC(p),
		l: m
	};
}, ew = function(e, t, n) {
	return e.s == -1 ? Math.max(ew(e.l, t, n + 1), ew(e.r, t, n + 1)) : t[e.s] = n;
}, tw = function(e) {
	for (var t = e.length; t && !e[--t];);
	for (var n = new xC(++t), r = 0, i = e[0], a = 1, o = function(e) {
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
}, nw = function(e, t) {
	for (var n = 0, r = 0; r < t.length; ++r) n += e[r] * t[r];
	return n;
}, rw = function(e, t, n) {
	var r = n.length, i = KC(t + 2);
	e[i] = r & 255, e[i + 1] = r >> 8, e[i + 2] = e[i] ^ 255, e[i + 3] = e[i + 1] ^ 255;
	for (var a = 0; a < r; ++a) e[i + a + 4] = n[a];
	return (i + 4 + r) * 8;
}, iw = function(e, t, n, r, i, a, o, s, c, l, u) {
	ZC(t, u++, n), ++i[256];
	for (var d = $C(i, 15), f = d.t, p = d.l, m = $C(a, 15), h = m.t, g = m.l, _ = tw(f), v = _.c, y = _.n, b = tw(h), x = b.c, S = b.n, C = new xC(19), w = 0; w < v.length; ++w) ++C[v[w] & 31];
	for (var w = 0; w < x.length; ++w) ++C[x[w] & 31];
	for (var T = $C(C, 7), E = T.t, D = T.l, O = 19; O > 4 && !E[TC[O - 1]]; --O);
	var k = l + 5 << 3, ee = nw(i, LC) + nw(a, RC) + o, te = nw(i, f) + nw(a, h) + o + 14 + 3 * O + nw(C, E) + 2 * C[16] + 3 * C[17] + 7 * C[18];
	if (c >= 0 && k <= ee && k <= te) return rw(t, u, e.subarray(c, c + l));
	var ne, A, j, M;
	if (ZC(t, u, 1 + (te < ee)), u += 2, te < ee) {
		ne = IC(f, p, 0), A = f, j = IC(h, g, 0), M = h;
		var re = IC(E, D, 0);
		ZC(t, u, y - 257), ZC(t, u + 5, S - 1), ZC(t, u + 10, O - 4), u += 14;
		for (var w = 0; w < O; ++w) ZC(t, u + 3 * w, E[TC[w]]);
		u += 3 * O;
		for (var N = [v, x], ie = 0; ie < 2; ++ie) for (var ae = N[ie], w = 0; w < ae.length; ++w) {
			var oe = ae[w] & 31;
			ZC(t, u, re[oe]), u += E[oe], oe > 15 && (ZC(t, u, ae[w] >> 5 & 127), u += ae[w] >> 12);
		}
	} else ne = zC, A = LC, j = VC, M = RC;
	for (var w = 0; w < s; ++w) {
		var se = r[w];
		if (se > 255) {
			var oe = se >> 18 & 31;
			QC(t, u, ne[oe + 257]), u += A[oe + 257], oe > 7 && (ZC(t, u, se >> 23 & 31), u += CC[oe]);
			var ce = se & 31;
			QC(t, u, j[ce]), u += M[ce], ce > 3 && (QC(t, u, se >> 5 & 8191), u += wC[ce]);
		} else QC(t, u, ne[se]), u += A[se];
	}
	return QC(t, u, ne[256]), u + A[256];
}, aw = /*#__PURE__*/ new SC([
	65540,
	131080,
	131088,
	131104,
	262176,
	1048704,
	1048832,
	2114560,
	2117632
]), ow = /*#__PURE__*/ new bC(0), sw = function(e, t, n, r, i, a) {
	var o = a.z || e.length, s = new bC(r + o + 5 * (1 + Math.ceil(o / 7e3)) + i), c = s.subarray(r, s.length - i), l = a.l, u = (a.r || 0) & 7;
	if (t) {
		u && (c[0] = a.r >> 3);
		for (var d = aw[t - 1], f = d >> 13, p = d & 8191, m = (1 << n) - 1, h = a.p || new xC(32768), g = a.h || new xC(m + 1), _ = Math.ceil(n / 3), v = 2 * _, y = function(t) {
			return (e[t] ^ e[t + 1] << _ ^ e[t + 2] << v) & m;
		}, b = new SC(25e3), x = new xC(288), S = new xC(32), C = 0, w = 0, T = a.i || 0, E = 0, D = a.w || 0, O = 0; T + 2 < o; ++T) {
			var k = y(T), ee = T & 32767, te = g[k];
			if (h[ee] = te, g[k] = ee, D <= T) {
				var ne = o - T;
				if ((C > 7e3 || E > 24576) && (ne > 423 || !l)) {
					u = iw(e, c, 0, b, x, S, w, E, O, T - O, u), E = C = w = 0, O = T;
					for (var A = 0; A < 286; ++A) x[A] = 0;
					for (var A = 0; A < 30; ++A) S[A] = 0;
				}
				var j = 2, M = 0, re = p, N = ee - te & 32767;
				if (ne > 2 && k == y(T - N)) for (var ie = Math.min(f, ne) - 1, ae = Math.min(32767, T), oe = Math.min(258, ne); N <= ae && --re && ee != te;) {
					if (e[T + j] == e[T + j - N]) {
						for (var se = 0; se < oe && e[T + se] == e[T + se - N]; ++se);
						if (se > j) {
							if (j = se, M = N, se > ie) break;
							for (var ce = Math.min(N, se - 2), le = 0, A = 0; A < ce; ++A) {
								var ue = T - N + A & 32767, de = ue - h[ue] & 32767;
								de > le && (le = de, te = ue);
							}
						}
					}
					ee = te, te = h[ee], N += ee - te & 32767;
				}
				if (M) {
					b[E++] = 268435456 | kC[j] << 18 | MC[M];
					var fe = kC[j] & 31, pe = MC[M] & 31;
					w += CC[fe] + wC[pe], ++x[257 + fe], ++S[pe], D = T + j, ++C;
				} else b[E++] = e[T], ++x[e[T]];
			}
		}
		for (T = Math.max(T, D); T < o; ++T) b[E++] = e[T], ++x[e[T]];
		u = iw(e, c, l, b, x, S, w, E, O, T - O, u), l || (a.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, a.h = g, a.p = h, a.i = T, a.w = D);
	} else {
		for (var T = a.w || 0; T < o + l; T += 65535) {
			var me = T + 65535;
			me >= o && (c[u / 8 | 0] = l, me = o), u = rw(c, u + 1, e.subarray(T, me));
		}
		a.i = o;
	}
	return qC(s, 0, r + KC(u) + i);
}, cw = /*#__PURE__*/ (function() {
	for (var e = /* @__PURE__ */ new Int32Array(256), t = 0; t < 256; ++t) {
		for (var n = t, r = 9; --r;) n = (n & 1 && -306674912) ^ n >>> 1;
		e[t] = n;
	}
	return e;
})(), lw = function() {
	var e = -1;
	return {
		p: function(t) {
			for (var n = e, r = 0; r < t.length; ++r) n = cw[n & 255 ^ t[r]] ^ n >>> 8;
			e = n;
		},
		d: function() {
			return ~e;
		}
	};
}, uw = function(e, t, n, r, i) {
	if (!i && (i = { l: 1 }, t.dictionary)) {
		var a = t.dictionary.subarray(-32768), o = new bC(a.length + e.length);
		o.set(a), o.set(e, a.length), e = o, i.w = a.length;
	}
	return sw(e, t.level == null ? 6 : t.level, t.mem == null ? i.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, i);
}, dw = function(e, t) {
	var n = {};
	for (var r in e) n[r] = e[r];
	for (var r in t) n[r] = t[r];
	return n;
}, fw = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, pw = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, mw = function(e, t) {
	return pw(e, t) + pw(e, t + 4) * 4294967296;
}, hw = function(e, t, n) {
	for (; n; ++t) e[t] = n, n >>>= 8;
};
function gw(e, t) {
	return uw(e, t || {}, 0, 0);
}
function _w(e, t) {
	return XC(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var vw = function(e, t, n, r) {
	for (var i in e) {
		var a = e[i], o = t + i, s = r;
		Array.isArray(a) && (s = dw(r, a[1]), a = a[0]), ArrayBuffer.isView(a) ? n[o] = [a, s] : (n[o += "/"] = [new bC(0), s], vw(a, o, n, r));
	}
}, yw = typeof TextEncoder < "u" && /*#__PURE__*/ new TextEncoder(), bw = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	bw.decode(ow, { stream: !0 });
} catch {}
var xw = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: qC(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function Sw(e, t) {
	if (t) {
		for (var n = new bC(e.length), r = 0; r < e.length; ++r) n[r] = e.charCodeAt(r);
		return n;
	}
	if (yw) return yw.encode(e);
	for (var i = e.length, a = new bC(e.length + (e.length >> 1)), o = 0, s = function(e) {
		a[o++] = e;
	}, r = 0; r < i; ++r) {
		if (o + 5 > a.length) {
			var c = new bC(o + 8 + (i - r << 1));
			c.set(a), a = c;
		}
		var l = e.charCodeAt(r);
		l < 128 || t ? s(l) : l < 2048 ? (s(192 | l >> 6), s(128 | l & 63)) : l > 55295 && l < 57344 ? (l = 65536 + (l & 1047552) | e.charCodeAt(++r) & 1023, s(240 | l >> 18), s(128 | l >> 12 & 63), s(128 | l >> 6 & 63), s(128 | l & 63)) : (s(224 | l >> 12), s(128 | l >> 6 & 63), s(128 | l & 63));
	}
	return qC(a, 0, o);
}
function Cw(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	}
	if (bw) return bw.decode(e);
	var i = xw(e), a = i.s, n = i.r;
	return n.length && YC(8), a;
}
var ww = function(e, t) {
	return t + 30 + fw(e, t + 26) + fw(e, t + 28);
}, Tw = function(e, t, n) {
	var r = fw(e, t + 28), i = fw(e, t + 30), a = Cw(e.subarray(t + 46, t + 46 + r), !(fw(e, t + 8) & 2048)), o = t + 46 + r, s = Ew(e, o, i, n, pw(e, t + 20), pw(e, t + 24), pw(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		fw(e, t + 10),
		c,
		l,
		a,
		o + i + fw(e, t + 32),
		u
	];
}, Ew = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + fw(e, t + 2)) if (fw(e, t) == 1) return [
			s ? mw(e, t + 4 + 8 * c) : i,
			c ? mw(e, t + 4) : a,
			l ? mw(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && YC(13);
	}
	return [
		i,
		a,
		o,
		0
	];
}, Dw = function(e) {
	var t = 0;
	if (e) for (var n in e) {
		var r = e[n].length;
		r > 65535 && YC(9), t += r + 4;
	}
	return t;
}, Ow = function(e, t, n, r, i, a, o, s) {
	var c = r.length, l = n.extra, u = s && s.length, d = Dw(l);
	hw(e, t, o == null ? 67324752 : 33639248), t += 4, o != null && (e[t++] = 20, e[t++] = n.os), e[t] = 20, t += 2, e[t++] = n.flag << 1 | (a < 0 && 8), e[t++] = i && 8, e[t++] = n.compression & 255, e[t++] = n.compression >> 8;
	var f = new Date(n.mtime == null ? Date.now() : n.mtime), p = f.getFullYear() - 1980;
	if ((p < 0 || p > 119) && YC(10), hw(e, t, p << 25 | f.getMonth() + 1 << 21 | f.getDate() << 16 | f.getHours() << 11 | f.getMinutes() << 5 | f.getSeconds() >> 1), t += 4, a != -1 && (hw(e, t, n.crc), hw(e, t + 4, a < 0 ? -a - 2 : a), hw(e, t + 8, n.size)), hw(e, t + 12, c), hw(e, t + 14, d), t += 16, o != null && (hw(e, t, u), hw(e, t + 6, n.attrs), hw(e, t + 10, o), t += 14), e.set(r, t), t += c, d) for (var m in l) {
		var h = l[m], g = h.length;
		hw(e, t, +m), hw(e, t + 2, g), e.set(h, t + 4), t += 4 + g;
	}
	return u && (e.set(s, t), t += u), t;
}, kw = function(e, t, n, r, i) {
	hw(e, t, 101010256), hw(e, t + 8, n), hw(e, t + 10, n), hw(e, t + 12, r), hw(e, t + 16, i);
};
function Aw(e, t) {
	t ||= {};
	var n = {}, r = [];
	vw(e, "", n, t);
	var i = 0, a = 0;
	for (var o in n) {
		var s = n[o], c = s[0], l = s[1], u = l.level == 0 ? 0 : 8, d = Sw(o), f = d.length, p = l.comment, m = p && Sw(p), h = m && m.length, g = Dw(l.extra);
		f > 65535 && YC(11);
		var _ = u ? gw(c, l) : c, v = _.length, y = lw();
		y.p(c), r.push(dw(l, {
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
	for (var b = new bC(a + 22), x = i, S = a - i, C = 0; C < r.length; ++C) {
		var d = r[C];
		Ow(b, d.o, d, d.f, d.u, d.c.length);
		var w = 30 + d.f.length + Dw(d.extra);
		b.set(d.c, d.o + w), Ow(b, i, d, d.f, d.u, d.c.length, d.o, d.m), i += 16 + w + (d.m ? d.m.length : 0);
	}
	return kw(b, i, r.length, S, x), b;
}
function jw(e, t) {
	for (var n = {}, r = e.length - 22; pw(e, r) != 101010256; --r) (!r || e.length - r > 65558) && YC(13);
	var i = fw(e, r + 8);
	if (!i) return {};
	var a = pw(e, r + 16), o = pw(e, r - 20) == 117853008;
	if (o) {
		var s = pw(e, r - 12);
		o = pw(e, s) == 101075792, o && (i = pw(e, s + 32), a = pw(e, s + 48));
	}
	for (var c = t && t.filter, l = 0; l < i; ++l) {
		var u = Tw(e, a, o), d = u[0], f = u[1], p = u[2], m = u[3], h = u[4], g = u[5], _ = ww(e, g);
		a = h, (!c || c({
			name: m,
			size: f,
			originalSize: p,
			compression: d
		})) && (d ? d == 8 ? n[m] = _w(e.subarray(_, _ + f), { out: new bC(p) }) : YC(14, "unknown compression type " + d) : n[m] = qC(e, _, _ + f));
	}
	return n;
}
// src/core/packs/zip.ts
function Mw(e) {
	try {
		return jw(e);
	} catch {
		throw new X("E_NOT_ZIP", "无法识别：这不是 TRPG 跑团助手的文件");
	}
}
function Nw(e) {
	let t = {};
	for (let n of Object.keys(e).sort()) {
		let r = e[n];
		t[n] = typeof r == "string" ? Sw(r) : r;
	}
	return Aw(t, {
		level: 6,
		mtime: new Date(1980, 0, 1, 0, 0, 0)
	});
}
function Pw(e, t) {
	let n = e[t];
	if (n) try {
		return JSON.parse(Cw(n));
	} catch {
		throw new X("E_BAD_CONTENT", `文件内容损坏：${t} 无法解析`);
	}
}
// src/core/packs/file.ts
function Fw(e) {
	let t = {};
	for (let n of Object.keys(e).sort()) t[n] = e[n];
	return t;
}
function Iw(e) {
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
	let o = new Map([...e.blobs ?? /* @__PURE__ */ new Map()].sort(([e], [t]) => e.localeCompare(t))), s = e.adventure ?? {}, c = e.fallback ?? [], l = { "trpg-manifest.json": Kp({
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
			typeCounts: Fw(n),
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
	for (let [e, t] of [...r].sort(([e], [t]) => e.localeCompare(t))) l[`entries/${encodeURIComponent(e)}.json`] = Kp(t);
	for (let [e, t] of [...a].sort(([e], [t]) => e.localeCompare(t))) l[`features/${encodeURIComponent(e.toLowerCase())}.json`] = Kp(t);
	for (let e of Object.keys(s).sort()) l[e] = Kp(s[e]);
	c.length && (l["adventure/fallback.json"] = Kp({ items: c }));
	for (let [e, t] of o) l[`blobs/${e}`] = t.bytes;
	return Nw(l);
}
// src/core/migrate.ts
var Lw = {
	workspace: {},
	save: {},
	pack: {}
}, Rw = "这个存档由更新版本的扩展创建，请先更新扩展";
function zw(e, t, n = {}) {
	let r = n.current ?? zS[e], i = n.migrations ?? Lw[e], a = Number(t.schemaVersion);
	if (!Number.isInteger(a) || a < 0) throw new X("E_BAD_VERSION", "文件内容损坏：缺少有效的版本号");
	if (a > r) throw new X("E_NEWER_DATA", Rw, {
		kind: e,
		version: a,
		current: r
	});
	let o = t;
	for (; a < r;) {
		let t = i[a];
		if (!t) throw new X("E_BAD_VERSION", `无法升级版本 ${a} 的数据`, {
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
var Bw = rS({ instances: eS(nS({
	id: $().min(1),
	type: $().min(1),
	name: $().min(1),
	label: $().optional(),
	sourceRef: nS({
		packId: BS,
		version: HS,
		entryId: $()
	}).optional(),
	data: lS($(), Xx()).default({})
})).default([]) }), Vw = nS({
	id: BS,
	version: HS
}), Hw = nS({
	ownerKey: $().min(1),
	ownerLabel: $(),
	ruleId: BS,
	currentSaveId: $().nullable(),
	enabledPacks: eS(Vw),
	data: Bw,
	savedHash: $(),
	schemaVersion: Wx().int(),
	updatedAt: US
}), Uw = nS({
	partyNames: eS($()).default([]),
	partyCount: Wx().int().nonnegative().default(0),
	location: $().optional(),
	round: Wx().int().optional()
}), Ww = dS([
	"读档前",
	"新存档前",
	"切换规则前",
	"恢复备份前",
	"改动模组前"
]), Gw = nS({
	id: $().min(1),
	ownerKey: $().min(1),
	ownerLabel: $(),
	ruleId: BS,
	name: $().min(1).max(80),
	note: $().max(400).default(""),
	kind: dS(["manual", "auto"]),
	autoReason: Ww.optional(),
	branchedFrom: $().optional(),
	createdAt: US,
	updatedAt: US,
	deletedAt: US.optional(),
	summary: Uw,
	packs: eS(iC),
	snapshot: Bw,
	hash: $(),
	schemaVersion: Wx().int()
}), Kw = nS({
	reminderDays: Wx().int().positive().default(7),
	reminderSaves: Wx().int().positive().default(10),
	catalogUrl: $().default("https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json")
}), qw = nS({
	lastExportAt: US.nullable().default(null),
	savesSinceExport: Wx().int().nonnegative().default(0),
	persistRequested: Jx().default(!1),
	persistGranted: Jx().default(!1)
}), Jw = nS({
	book: $().min(1).max(20),
	page: Wx().int().nonnegative()
}), Yw = dS([
	"不全书",
	"共库",
	"共库机翻",
	"dnd-data",
	"本项目"
]), Xw = dS([
	"GPL-3.0",
	"CC-BY-NC-SA-4.0",
	"CC-BY-4.0",
	"MIT"
]), Zw = {
	不全书: "GPL-3.0",
	共库: "CC-BY-NC-SA-4.0",
	共库机翻: "CC-BY-NC-SA-4.0",
	"dnd-data": "MIT",
	本项目: "CC-BY-NC-SA-4.0"
}, Qw = nS({
	by: Yw,
	license: Xw,
	machine: Jx().default(!1),
	missing: eS($()).default([]),
	srd: Jx().default(!1)
}).superRefine((e, t) => {
	Zw[e.by] !== e.license && t.addIssue({
		code: "custom",
		path: ["license"],
		message: `credit.by 为 ${e.by} 时许可必须是 ${Zw[e.by]}`
	}), e.by !== "共库机翻" && e.machine && t.addIssue({
		code: "custom",
		path: ["machine"],
		message: "只有「共库机翻」可以标记为机翻"
	});
}), $w = rS({
	kind: $().min(1).max(40),
	id: VS,
	name: $().min(1).max(200),
	description: eS(WS).default([]),
	dmSecret: eS(WS).default([]),
	keywords: eS($()).default([]),
	src: Jw.optional(),
	credit: Qw.optional(),
	data: lS($(), Xx()).default({})
}), eT = rS({
	name: $().min(1),
	dmNotes: eS(WS).optional(),
	itemIds: eS(VS).default([])
}), tT = rS({
	id: VS,
	name: $().min(1).max(120),
	description: $().max(4e3).default(""),
	dmNotes: eS(WS).optional(),
	levelMin: Wx().int().min(1).max(20).optional(),
	levelMax: Wx().int().min(1).max(20).optional(),
	start: nS({
		locationId: VS.optional(),
		intro: eS(WS).optional()
	}),
	chapters: eS(eT).default([]),
	itemIds: eS(VS).default([])
}), nT = rS({
	cover: KS.optional(),
	description: $().default(""),
	adventures: eS(tT),
	shared: eS(VS).default([])
}), rT = nS({ items: eS($w).default([]) }), iT = [
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
function aT(e) {
	return iT.find((t) => t.test(e))?.mime;
}
function oT(e, t) {
	if (t.length > 10485760) throw new X("E_BAD_CONTENT", `文件内容损坏：图片「${e}」过大`);
	let n = aT(t);
	if (!n) throw new X("E_BAD_CONTENT", `文件内容损坏：图片「${e}」不合法`);
	return n;
}
var sT = /^[a-z0-9/._-]+$/, cT = /\.(?:js|mjs|html?|svg)$/i, lT = /* @__PURE__ */ new Set([
	"trpg-manifest.json",
	"entries",
	"features",
	"adventure",
	"blobs"
]), uT = /* @__PURE__ */ new Set([
	"trpg-manifest.json",
	"entries",
	"assets"
]);
function dT(e) {
	return e.includes("/") ? e.slice(0, e.indexOf("/")) : e;
}
function fT(e, t, n) {
	let r = 0;
	for (let i of e) {
		if (r += t[i].length, i.startsWith("/") || i.includes("\\") || i.split("/").includes("..") || !sT.test(i)) throw new X("E_BAD_CONTENT", "文件内容损坏：包含不合法的路径");
		if (cT.test(i)) throw new X("E_FORBIDDEN_FILE", `不能安装：包里含有不允许的文件「${i}」`);
		let e = n <= 1 ? uT : lT, a = dT(i);
		if (!e.has(a)) throw new X("E_FORBIDDEN_FILE", `不能安装：包里含有不允许的文件「${i}」`);
	}
	if (e.length > 2e4 || r > 268435456) throw new X("E_TOO_LARGE", "文件过大或文件数过多，无法导入");
}
// src/core/packs/refs.ts
function pT(e, t = /* @__PURE__ */ new Set()) {
	if (Array.isArray(e)) for (let n of e) pT(n, t);
	else if (e && typeof e == "object") {
		let n = e;
		typeof n.$asset == "string" && t.add(n.$asset);
		for (let e of Object.values(n)) pT(e, t);
	}
	return t;
}
function mT(e, t = []) {
	if (Array.isArray(e)) for (let n of e) mT(n, t);
	else if (e && typeof e == "object") {
		let n = e;
		typeof n.$ref == "string" && t.push(n);
		for (let e of Object.values(n)) mT(e, t);
	}
	return t;
}
function hT(e) {
	return new X("E_BAD_CONTENT", `文件内容损坏：${e}`);
}
function gT(e) {
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
			if (!n || typeof n.packId != "string" || typeof n.entryId != "string") throw hT(`「${e.name}」的修改目标不合法`);
			if (!u.has(n.packId)) throw hT(`「${e.name}」修改的条目所在的包未声明为依赖`);
			let r = `${n.packId}\u0000${n.entryId}`;
			if (f.has(r)) throw hT(`「${e.name}」修改的条目被修改了两次`);
			f.add(r);
		}
	}
	let p = [
		n.map((e) => e.data),
		r,
		i
	];
	for (let e of mT(p)) {
		let n = e.$ref;
		if (n === "item" || n === "local") {
			if (typeof e.id != "string" || !o.has(e.id)) throw hT(`「${String(e.id ?? "")}」引用了不存在的内容`);
		} else if (n === "ext") {
			let t = typeof e.id == "string" ? e.id : "", n = typeof e.lineage == "string" ? e.lineage : "";
			if (!c.has(t) && !l.has(`${n}\u0000${t}`)) throw hT(`「${t}」引用了不存在的内容`);
		} else if (n === "pack") {
			if (typeof e.packId != "string" || !(e.packId === t.id || u.has(e.packId))) throw hT(`「${String(e.entryId ?? "")}」引用了不存在的包`);
		} else throw hT(`未知的引用类型「${String(n)}」`);
		d++;
	}
	for (let e of pT(p)) if (!a.has(e)) throw hT(`缺少图片「${e.slice(0, 12)}」`);
	return { softRefs: d };
}
// src/core/packs/recognize.ts
function _T(e) {
	return new X("E_BAD_CONTENT", `文件内容损坏：${e}`);
}
function vT(e) {
	return Object.keys(e).filter((e) => !e.endsWith("/"));
}
function yT(e) {
	let t = [], n = vT(e).filter((e) => e.startsWith("entries/") && e.endsWith(".json")).sort();
	for (let r of n) {
		let n = Pw(e, r);
		if (!Array.isArray(n)) throw _T(`${r} 不是条目列表`);
		for (let e of n) {
			let n = tC.safeParse(e);
			if (!n.success) {
				let r = e?.name;
				throw _T(`第 ${t.length + 1} 项「${typeof r == "string" ? r : "未命名"}」的 ${oC(n.error.issues[0])} 不合法`);
			}
			t.push(n.data);
		}
	}
	return t;
}
function bT(e) {
	let t = [];
	for (let n of vT(e).filter((e) => e.startsWith("features/") && e.endsWith(".json")).sort()) {
		let r = Pw(e, n);
		if (!Array.isArray(r)) throw _T(`${n} 不是功能列表`);
		for (let e of r) {
			let r = e;
			if (!r || typeof r.id != "string" || typeof r.kind != "string" || typeof r.name != "string" || typeof r.data != "object" || r.data === null) throw _T(`${n} 的功能定义不合法`);
			t.push({
				defaultEnabled: !1,
				description: "",
				...r
			});
		}
	}
	return t;
}
function xT(e) {
	let t = {};
	for (let n of vT(e).filter((e) => e.startsWith("adventure/") && e.endsWith(".json")).sort()) {
		if (n === "adventure/fallback.json") continue;
		let r = Pw(e, n);
		if (n === "adventure/adventure.json") {
			let e = nT.safeParse(r);
			if (!e.success) throw _T(`adventure/adventure.json 的 ${oC(e.error.issues[0])} 不合法`);
			t[n] = e.data;
		} else {
			let e = $w.array().safeParse(r);
			if (!e.success) throw _T(`${n} 的 ${oC(e.error.issues[0])} 不合法`);
			t[n] = e.data;
		}
	}
	let n = Pw(e, "adventure/fallback.json"), r = [];
	if (n !== void 0) {
		let e = rT.safeParse(n);
		if (!e.success) throw _T(`adventure/fallback.json 的 ${oC(e.error.issues[0])} 不合法`);
		r = e.data.items;
	}
	return {
		adventure: t,
		fallback: r
	};
}
function ST(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	if (t >= 2) {
		for (let t of vT(e).filter((e) => e.startsWith("blobs/"))) {
			let n = t.slice(6);
			if (!/^[a-f0-9]{64}$/.test(n)) throw _T(`图片「${n}」的文件名不是哈希`);
			let i = e[t];
			if (qp(i) !== n) throw _T(`图片「${n.slice(0, 12)}」的哈希不一致`);
			let a = oT(n, i);
			r.set(n, {
				hash: n,
				mime: a,
				size: i.length,
				bytes: i
			});
		}
		if (n.blobs.length !== r.size) throw _T("缺少图片或图片清单不一致");
		for (let e of n.blobs) {
			let t = r.get(e.hash);
			if (!t) throw _T(`缺少图片「${e.hash.slice(0, 12)}」`);
			if (t.size !== e.size || t.mime !== e.mime) throw _T(`图片「${e.hash.slice(0, 12)}」与清单不一致`);
		}
	}
	return r;
}
function CT(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let t of vT(e).filter((e) => e.startsWith("assets/"))) {
		let i = t.slice(7), a = e[t], o = qp(a);
		if (r.set(i, o), !n.has(o)) {
			let e = oT(i, a);
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
function wT(e, t, n, r, i) {
	let a = t.pack?.ruleId;
	if (typeof a == "string" && !r.hasRule(a)) throw new X("E_RULE_MISSING", `需要先安装规则『${a}』`, { ruleId: a });
	let o = nC.safeParse(t);
	if (!o.success) throw _T(`说明文件的 ${oC(o.error.issues[0])} 不合法`);
	let s = cC(o.data.pack, i);
	if (s.minAppVersion && hC(s.minAppVersion, r.appVersion) > 0) throw new X("E_NEWER_APP", `需要先把扩展更新到 v${s.minAppVersion} 才能安装这个内容包`);
	if (s.dataVersion > 1) throw new X("E_NEWER_DATA", "这个内容包由更新版本的扩展制作，请先更新扩展");
	fT(vT(e), e, i);
	let c = yT(e);
	if (c.length !== s.entryCount) throw _T(`条目数量不符（说明为 ${s.entryCount}，实际 ${c.length}）`);
	let l = {};
	for (let e of c) l[e.type] = (l[e.type] ?? 0) + 1;
	let u = i >= 2 ? bT(e) : [], { adventure: d, fallback: f } = i >= 2 ? xT(e) : {
		adventure: {},
		fallback: []
	}, p = ST(e, i, s);
	i <= 1 && CT(e, c, p), s.blobs = [...p.values()].map(({ hash: e, mime: t, size: n }) => ({
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
	return gT({
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
		sha256: qp(n)
	};
}
function TT(e, t, n, r) {
	let i = [];
	for (let a of Object.keys(e).filter((e) => e.startsWith(t) && e.endsWith(".json")).sort()) {
		let t = Pw(e, a);
		if (!t || typeof t != "object") throw _T(`${a} 不是有效的记录`);
		let o = r(zw(n, t));
		if (!o.ok) throw _T(`${a} 的 ${o.detail} 不合法`);
		i.push(o.value);
	}
	return i;
}
function ET(e, t) {
	let n = rC.safeParse(t);
	if (!n.success) throw _T(`说明文件的 ${oC(n.error.issues[0])} 不合法`);
	let r = TT(e, "saves/", "save", (e) => {
		let t = Gw.safeParse(e);
		return t.success ? {
			ok: !0,
			value: t.data
		} : {
			ok: !1,
			detail: oC(t.error.issues[0])
		};
	}), i = TT(e, "workspaces/", "workspace", (e) => {
		let t = Hw.safeParse(e);
		return t.success ? {
			ok: !0,
			value: t.data
		} : {
			ok: !1,
			detail: oC(t.error.issues[0])
		};
	}), a, o = Pw(e, "settings.json");
	if (o !== void 0) {
		let e = Kw.safeParse(o);
		if (!e.success) throw _T(`settings.json 的 ${oC(e.error.issues[0])} 不合法`);
		a = e.data;
	}
	let s = Pw(e, "packs.json"), c = [];
	if (Array.isArray(s)) for (let e of s) {
		let t = iC.safeParse(e);
		t.success && c.push(t.data);
	}
	let l = /* @__PURE__ */ new Map();
	for (let t of vT(e)) t.startsWith("packs/") && t.endsWith(".trpgpack") && l.set(t, e[t]);
	let u = /* @__PURE__ */ new Map();
	for (let t of vT(e).filter((e) => e.startsWith("blobs/"))) {
		let n = t.slice(6);
		if (!/^[a-f0-9]{64}$/.test(n)) throw _T(`图片「${n}」的文件名不是哈希`);
		let r = e[t];
		if (qp(r) !== n) throw _T(`图片「${n.slice(0, 12)}」的哈希不一致`);
		oT(n, r), u.set(n, r);
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
function DT(e, t) {
	let n = Mw(e), r = n["trpg-manifest.json"];
	if (!r) throw new X("E_NO_MANIFEST", "无法识别：缺少说明文件，可能不是本扩展导出的文件");
	let i;
	try {
		i = JSON.parse(Cw(r));
	} catch {
		throw _T("说明文件无法解析");
	}
	let a = i;
	if (a.format !== "trpg-pack" && a.format !== "trpg-save" && a.format !== "trpg-backup") throw new X("E_UNKNOWN_FORMAT", "无法识别：未知的文件类型");
	if (typeof a.formatVersion != "number" || a.formatVersion < 1 || a.formatVersion > 2) throw new X("E_NEWER_FORMAT", "这个文件由更新版本的扩展创建，请先更新扩展");
	let o = Math.max(1, Math.floor(a.formatVersion));
	return a.format === "trpg-pack" ? wT(n, i, e, t, o) : ET(n, i);
}
function OT(e, t) {
	if (e.length !== t.byteSize || qp(e) !== t.sha256) throw new X("E_CHECKSUM", "下载的文件不完整，请重试");
}
// src/core/packs/installer.ts
function kT(e, t) {
	return e.trim().toLowerCase() === t.trim().toLowerCase();
}
function AT(e, t) {
	return e.filter((e) => {
		let n = t.get(e.id);
		return n ? e.minVersion ? hC(n.version, e.minVersion) < 0 : !1 : !0;
	});
}
var jT = class {
	db;
	deps;
	constructor(e, t) {
		this.db = e, this.deps = t;
	}
	recognize(e) {
		return DT(e, {
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
			missingRequires: AT(e.manifest.relationships.requires, n),
			missingRecommends: AT(e.manifest.relationships.recommends, n),
			conflicts: e.manifest.relationships.conflicts.filter((e) => n.has(e.id)).map((e) => ({
				id: e.id,
				reason: e.reason,
				installedVersion: n.get(e.id).version
			})),
			unsupportedFeatures: MT(e)
		};
		if (t) {
			let n = hC(e.manifest.version, t.version), i = n > 0 ? "newer" : n === 0 ? "same" : "older", a = t.lineage && e.manifest.lineage && t.lineage !== e.manifest.lineage ? "lineage-mismatch" : i === "older" && t.source === "builtin" ? "builtin-downgrade" : void 0;
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
		let i = (await this.db.packs.where("ruleId").equals(e.manifest.ruleId).toArray()).find((t) => t.category === e.manifest.category && kT(t.name, e.manifest.name));
		return i ? {
			...r,
			action: "name-conflict",
			existing: i,
			canReplace: i.source !== "builtin"
		} : r;
	}
	async install(e, t) {
		let n = await this.plan(e);
		if (n.blocked === "lineage-mismatch") throw new X("E_LINEAGE", `已安装的「${n.installed?.name ?? e.manifest.id}」与这个文件编号相同但来源不同。先卸载已安装的，或请作者更换编号。`, { packId: e.manifest.id });
		if (n.missingRequires.length) throw new X("E_DEP_MISSING", `缺少它需要的扩展包：${n.missingRequires.map((e) => e.id).join("、")}`, { missing: n.missingRequires });
		let r = e.manifest.name, i;
		if (n.action === "overwrite") {
			if (n.blocked) throw new X("E_BUILTIN_DOWNGRADE", "内置数据包不能降级");
			if ((t.resolution ?? (t.source === "download" ? "overwrite" : void 0)) !== "overwrite") throw new X("E_CONFLICT_UNRESOLVED", "已安装同一个内容包，需要先选择是否覆盖");
		} else if (n.action === "name-conflict") {
			if (t.resolution === "keep-both") r = await this.uniqueName(e.manifest.ruleId, e.manifest.category, r);
			else if (t.resolution === "replace") {
				if (!n.canReplace || !n.existing) throw new X("E_BUILTIN_PROTECTED", "内置内容包不能被替换");
				i = n.existing.id;
			} else throw new X("E_CONFLICT_UNRESOLVED", "已有同名内容包，需要先选择处理方式");
		}
		let a = {
			...e.manifest,
			name: r,
			source: t.source,
			byteSize: e.byteSize,
			sha256: e.sha256,
			installedAt: this.deps.now(),
			schemaVersion: zS.pack,
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
			throw Yp(e) ? new X("E_QUOTA", Xp) : e;
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
		if (t.type !== "pack") throw new X("E_BAD_CONTENT", "文件内容损坏：内置文件不是内容包");
		let n = await this.db.packs.get(t.manifest.id);
		return n && hC(t.manifest.version, n.version) <= 0 ? "skipped" : (await this.install(t, {
			source: "builtin",
			resolution: n ? "overwrite" : void 0
		}), n ? "upgraded" : "installed");
	}
	async uninstall(e) {
		let t = await this.db.packs.get(e);
		if (!t) throw new X("E_NOT_FOUND", "没有找到这个内容包");
		if (t.source === "builtin") throw new X("E_BUILTIN_PROTECTED", "内置内容包不能删除");
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
		if (!t) throw new X("E_NOT_FOUND", "没有找到这个内容包");
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
		return Iw({
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
			if (!r.some((e) => e.category === t && kT(e.name, i))) return i;
		}
	}
};
function MT(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.features) yC(n.kind) !== "supported" && t.set(n.kind, (t.get(n.kind) ?? 0) + 1);
	return [...t].map(([e, t]) => ({
		kind: e,
		count: t
	}));
}
// src/core/ids.ts
function NT() {
	let e = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(e), e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
	let t = Array.from(e, (e) => e.toString(16).padStart(2, "0"));
	return `${t.slice(0, 4).join("")}-${t.slice(4, 6).join("")}-${t.slice(6, 8).join("")}-${t.slice(8, 10).join("")}-${t.slice(10).join("")}`;
}
function PT(e) {
	let t = e, n = "";
	do
		n = String.fromCharCode(65 + t % 26) + n, t = Math.floor(t / 26) - 1;
	while (t >= 0);
	return n;
}
// src/core/instances.ts
function FT(e, t, n, r, i) {
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
		...r > 1 ? { label: PT(a) } : {},
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
function IT(e, t, n) {
	return t.filter((t) => n.get(t.id)?.relationships.requires.some((t) => t.id === e)).map((e) => e.id);
}
function LT(e, t, n, r) {
	let i = [...e], a = [], o = (e, t) => {
		if (i.some((t) => t.id === e)) return;
		let s = n.get(e);
		if (!s) throw new X("E_DEP_MISSING", `需要先安装『${e}』`, { packId: e });
		if (s.ruleId !== r.id) throw new X("E_RULE_MISMATCH", `『${s.name}』属于其他规则，不能在当前存档中启用`);
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
function RT(e, t, n, r) {
	if (r.corePackIds.includes(t)) throw new X("E_CORE_LOCKED", "核心规则始终启用，不能停用");
	let i = IT(t, e, n);
	if (i.length) throw new X("E_REQUIRED_BY", `${i.map((e) => `『${n.get(e)?.name ?? e}』`).join("、")}依赖它，不能停用`, { dependents: i });
	return e.filter((e) => e.id !== t);
}
// src/core/saves/helpers.ts
function zT(e, t) {
	return Jp({
		d: e,
		p: t.map((e) => e.id).sort()
	});
}
function BT(e) {
	return e.savedHash !== zT(e.data, e.enabledPacks);
}
function VT(e, t) {
	return t.reduce((t, n) => ({
		...t,
		...n(e)
	}), {
		partyNames: [],
		partyCount: 0
	});
}
function HT(e) {
	let t = e.trim();
	if (t.length < 1 || t.length > 40) throw new X("E_BAD_NAME", "存档名需要 1–40 个字");
	return t;
}
function UT(e, t, n = (e) => ` ${e}`) {
	if (!t.has(e)) return e;
	for (let r = 2;; r++) {
		let i = `${e}${n(r)}`;
		if (!t.has(i)) return i;
	}
}
function WT(e) {
	return zw("save", e);
}
function GT(e) {
	return zw("workspace", e);
}
function KT(e, t) {
	return t.updatedAt - e.updatedAt || t.createdAt - e.createdAt || e.id.localeCompare(t.id);
}
// src/core/saves/campaign.ts
var qT = class {
	db;
	deps;
	uuid;
	constructor(e, t) {
		this.db = e, this.deps = t, this.uuid = t.uuid ?? NT;
	}
	async getWorkspace(e) {
		let t = await this.db.workspaces.get(e);
		if (!t) return null;
		let n = GT(t);
		return n !== t && await this.db.workspaces.put(n), n;
	}
	isDirty(e) {
		return BT(e);
	}
	async getSave(e) {
		let t = await this.db.saves.get(e);
		return t ? WT(t) : null;
	}
	async listManual(e, t) {
		return (await this.db.saves.where("ruleId").equals(e.ruleId).toArray()).map(WT).filter((n) => n.kind === "manual" && n.deletedAt === void 0 && (t === "all" || n.ownerKey === e.ownerKey)).sort(KT);
	}
	async listAuto(e, t) {
		return (await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray()).map(WT).filter((e) => e.kind === "auto").sort(KT);
	}
	async listDeleted(e) {
		return (await this.db.saves.where("ruleId").equals(e).toArray()).map(WT).filter((e) => e.deletedAt !== void 0).sort((e, t) => (t.deletedAt ?? 0) - (e.deletedAt ?? 0));
	}
	async listOtherRules(e) {
		return (await this.db.saves.toArray()).map(WT).filter((t) => t.ruleId !== e && t.kind === "manual" && t.deletedAt === void 0).sort(KT);
	}
	async missingPacks(e) {
		let t = new Set((await this.db.packs.toArray()).map((e) => e.id));
		return e.enabledPacks.filter((e) => !t.has(e.id));
	}
	async startNewCampaign(e) {
		let t = this.requireRule(e.ruleId), n = HT(e.name), r = await this.installedMap(), i = [];
		for (let n of [...t.corePackIds, ...e.packIds]) i = LT(i, n, r, t).enabledPacks;
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
				schemaVersion: zS.workspace,
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
			if (!BT(t)) return {
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
			let n = await this.requireWorkspace(e), r = n.currentSaveId ? await this.getSave(n.currentSaveId) : null, i = await this.manualNames(n.ownerKey, n.ruleId), a = t === void 0 ? UT(`${r?.name ?? "存档"} 分支`, i) : HT(t), o = await this.buildSave(n, {
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
		if (!r || r.deletedAt !== void 0) throw new X("E_NOT_FOUND", "没有找到这个存档");
		return this.requireRule(r.ruleId), this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta,
			this.db.packs
		], async () => {
			let t = await this.getWorkspace(e.ownerKey), i = !!t && t.ruleId !== r.ruleId;
			if (i && !n.allowRuleSwitch) throw new X("E_RULE_SWITCH_REQUIRED", "这个存档属于其他规则，需要确认切换规则");
			t && await this.writeAutoSave(t, i ? "切换规则前" : "读档前");
			let a = r;
			if (r.ownerKey !== e.ownerKey) {
				let t = await this.manualNames(e.ownerKey, r.ruleId), n = this.deps.now();
				a = {
					...r,
					id: this.uuid(),
					ownerKey: e.ownerKey,
					ownerLabel: e.ownerLabel,
					name: UT(`${r.name}（来自 ${r.ownerLabel}）`, t),
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
				schemaVersion: zS.workspace,
				updatedAt: this.deps.now()
			};
			return await this.db.workspaces.put(s), s;
		});
	}
	async deleteSave(e) {
		let t = await this.getSave(e);
		if (!t) throw new X("E_NOT_FOUND", "没有找到这个存档");
		if (t.kind === "auto") throw new X("E_AUTO_NOT_DELETABLE", "自动存档会自动滚动保留，不能单独删除");
		if ((await this.db.workspaces.get(t.ownerKey))?.currentSaveId === t.id) throw new X("E_SAVE_IN_USE", "正在使用的存档不能删除，请先读取或新建其他存档");
		let n = {
			...t,
			deletedAt: this.deps.now()
		};
		return await this.db.saves.put(n), n;
	}
	async restoreSave(e) {
		let t = await this.getSave(e);
		if (!t || t.deletedAt === void 0) throw new X("E_NOT_FOUND", "没有找到这个已删除的存档");
		let { deletedAt: n, ...r } = t, i = await this.manualNames(t.ownerKey, t.ruleId), a = {
			...r,
			name: UT(t.name, i, (e) => `（恢复 ${e}）`)
		};
		return await this.db.saves.put(a), a;
	}
	async purgeSaves(e) {
		let t = 0;
		for (let n of e) (await this.getSave(n))?.deletedAt !== void 0 && (await this.db.saves.delete(n), t++);
		return t;
	}
	async renameSave(e, t) {
		return this.patchManual(e, { name: HT(t) });
	}
	async setNote(e, t) {
		return this.patchManual(e, { note: t.slice(0, 200) });
	}
	async saveAutoAsManual(e) {
		let t = await this.getSave(e);
		if (!t || t.kind !== "auto") throw new X("E_NOT_FOUND", "没有找到这个自动存档");
		let n = await this.manualNames(t.ownerKey, t.ruleId), r = this.deps.now(), i = new Date(t.createdAt), a = `${i.getMonth() + 1}月${i.getDate()}日 ${String(i.getHours()).padStart(2, "0")}:${String(i.getMinutes()).padStart(2, "0")}`, o = {
			...t,
			id: this.uuid(),
			kind: "manual",
			autoReason: void 0,
			name: UT(`自动存档 · ${a}`, n),
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
		n ? {enabledPacks: o, autoEnabled: s} = LT(r.enabledPacks, t, a, i) : o = RT(r.enabledPacks, t, a, i);
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
		if (!r.enabledPacks.find((e) => e.id === t.packId)) throw new X("E_PACK_DISABLED", "该内容包已停用，不能再从它新建");
		let i = await this.db.packs.get(t.packId), a = await this.db.entries.get([t.packId, t.entryId]);
		if (!i || !a) throw new X("E_NOT_FOUND", "没有找到这个条目");
		let o = FT(r.data, a, i.version, n, this.uuid), s = {
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
			summary: VT(e.data, this.deps.summaryContributors ?? []),
			packs: e.enabledPacks.map((e) => ({
				id: e.id,
				version: e.version,
				name: n.get(e.id)?.name ?? e.id
			})),
			snapshot: structuredClone(e.data),
			hash: zT(e.data, e.enabledPacks),
			schemaVersion: zS.save
		};
	}
	async manualNames(e, t) {
		let n = await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray();
		return new Set(n.filter((e) => e.kind === "manual" && e.deletedAt === void 0).map((e) => e.name));
	}
	async bumpSaves() {
		let e = qw.parse(await this.db.getMeta("backup") ?? {});
		await this.db.setMeta("backup", {
			...e,
			savesSinceExport: e.savesSinceExport + 1
		});
	}
	async patchManual(e, t) {
		let n = await this.getSave(e);
		if (!n || n.deletedAt !== void 0) throw new X("E_NOT_FOUND", "没有找到这个存档");
		if (n.kind === "auto") throw new X("E_AUTO_NOT_DELETABLE", "自动存档不能改名或加备注");
		let r = {
			...n,
			...t
		};
		return await this.db.saves.put(r), r;
	}
	async requireWorkspace(e) {
		let t = await this.getWorkspace(e);
		if (!t) throw new X("E_NO_WORKSPACE", "还没有当前战役");
		return t;
	}
	requireRule(e) {
		let t = this.deps.rules.get(e);
		if (!t) throw new X("E_RULE_MISSING", `需要先安装规则『${e}』`);
		return t;
	}
	async installedMap() {
		return new Map((await this.db.packs.toArray()).map((e) => [e.id, e]));
	}
}, JT = class {
	name;
	id;
	channel = null;
	listeners = /* @__PURE__ */ new Set();
	_readOnly = !1;
	startedAt;
	constructor(e = "tavern-trpg-assistant-lock", t = Date.now, n = NT()) {
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
}, YT = class {
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
}, XT = {
	id: "dnd5e2014",
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
function ZT() {
	let e = new YT();
	return e.register(XT), e;
}
// src/core/services.ts
var QT = "0.1.0";
function $T(e = {}) {
	let t = e.now ?? Date.now, n = e.rules ?? ZT(), r = new pC(e.dbName ?? "tavern-trpg-assistant");
	return {
		db: r,
		rules: n,
		packs: new jT(r, {
			rules: n,
			now: t,
			appVersion: e.appVersion ?? "0.1.0"
		}),
		campaign: new qT(r, {
			rules: n,
			now: t,
			...e.campaign
		}),
		lock: new JT(),
		now: t
	};
}
// src/probes/store.ts
var eE = /* @__PURE__ */ ln({});
function tE(e, t, n, r, i) {
	eE[e] = {
		id: e,
		title: t,
		status: n,
		summary: r,
		detail: i,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function nE(e, t, n) {
	try {
		await n();
	} catch (n) {
		console.error(`[trpg-assistant] 探针 ${e} 出错`, n), tE(e, t, "error", n instanceof Error ? n.message : String(n));
	}
}
function rE(e) {
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		env: e,
		results: Object.values(eE)
	};
}
// src/probes/envProbe.ts
var iE = "env", aE = "宿主与设备环境";
function oE() {
	let e = document.createElement("div");
	e.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top)", document.body.appendChild(e);
	let t = getComputedStyle(e).paddingTop;
	return e.remove(), t;
}
async function sE(e) {
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
		safeAreaTop: oE(),
		contextKeys: Object.keys(e).sort(),
		libsKeys: Object.keys(window.SillyTavern?.libs ?? {}).sort(),
		hasSetExtensionPrompt: typeof e.setExtensionPrompt == "function",
		hasPromptEnums: !!e.extension_prompt_types,
		eventTypeCount: Object.keys(e.event_types ?? {}).length,
		tauri: t
	};
}
function cE(e) {
	let t = () => nE(iE, aE, async () => {
		let t = await sE(e), n = t.tauri;
		tE(iE, aE, "info", n.present ? "检测到 TauriTavern 宿主" : "未检测到 TauriTavern（普通 SillyTavern）", t);
	});
	return {
		id: iE,
		title: aE,
		hint: "自动检测。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/eventsProbe.ts
var lE = "events", uE = "聊天事件", dE = [
	["CHAT_CHANGED", "chat_id_changed"],
	["MESSAGE_SENT", "message_sent"],
	["MESSAGE_RECEIVED", "message_received"],
	["MESSAGE_SWIPED", "message_swiped"],
	["MESSAGE_EDITED", "message_edited"],
	["MESSAGE_DELETED", "message_deleted"],
	["GENERATION_STARTED", "generation_started"],
	["GENERATION_ENDED", "generation_ended"]
];
function fE(e) {
	let t = {}, n = [], r = () => {
		let e = dE.map(([e]) => e).filter((e) => !t[e]);
		tE(lE, uE, "info", e.length ? `尚未观察到：${e.join("、")}` : "全部事件都已观察到", {
			counts: t,
			recent: n.slice(-30)
		});
	};
	return {
		id: lE,
		title: uE,
		hint: "依次做：发送消息、等回复、切换回复（左右箭头）、编辑一条消息、删除一条消息、切换聊天，观察事件是否都能收到。",
		actions: [{
			label: "刷新",
			run: r
		}],
		start: () => {
			for (let [i, a] of dE) g(e, h(e, i, a), (...e) => {
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
var pE = "identity", mE = "角色卡 / 群组 / 聊天标识";
function hE(e) {
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
function gE(e) {
	let t = [], n = () => {
		let n = hE(e), r = JSON.stringify([
			n.characterId,
			n.groupId,
			n.chatId
		]);
		t.some((e) => e.key === r) || t.push({
			key: r,
			...n
		}), tE(pE, mE, "info", `当前：${n.groupId ? "群组聊天" : n.characterId === null ? "没有打开聊天" : "角色卡聊天"}；已观察 ${t.length} 种上下文`, {
			current: n,
			observed: t
		});
	};
	return {
		id: pE,
		title: mE,
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
// src/core/backup.ts
async function _E(e) {
	return Kw.parse(await e.getMeta("settings") ?? {});
}
// src/core/transfer/exporter.ts
function vE(e) {
	let t = new Date(e);
	return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function yE(e) {
	return e.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "") || "存档";
}
async function bE(e, t) {
	if (t.type === "save") {
		let n = await e.saves.get(t.saveId);
		if (!n || n.deletedAt !== void 0) throw new X("E_NOT_FOUND", "没有找到这个存档");
		return [n];
	}
	return (await e.saves.toArray()).filter((e) => e.deletedAt === void 0);
}
async function xE(e, t) {
	let n = new Set(t.flatMap((e) => e.packs.map((e) => e.id)));
	return (await e.packs.list()).filter((e) => n.has(e.id) && e.source !== "builtin");
}
async function SE(e, t, n) {
	let r = await bE(e.db, t), i = {};
	for (let e of r) i[`saves/${e.id}.json`] = JSON.stringify(e);
	let a = [];
	if (t.type === "backup") {
		a = await e.db.workspaces.toArray();
		for (let e of a) i[`workspaces/${encodeURIComponent(e.ownerKey)}.json`] = JSON.stringify(e);
		i["settings.json"] = JSON.stringify(await _E(e.db));
	}
	let o = pT([r, a]);
	for (let t of [...o].sort()) {
		let n = await e.db.blobs.get(t);
		n && (i[`blobs/${t}`] = n.bytes);
	}
	let s = await e.packs.list();
	if (i["packs.json"] = JSON.stringify(s.map((e) => ({
		id: e.id,
		version: e.version,
		name: e.name
	}))), n.includePacks) for (let t of await xE(e, r)) i[`packs/${t.id}@${t.version}.trpgpack`] = await e.packs.exportPack(t.id);
	i["trpg-manifest.json"] = JSON.stringify({
		format: t.type === "backup" ? "trpg-backup" : "trpg-save",
		formatVersion: 2,
		appVersion: e.appVersion,
		exportedAt: new Date(e.now()).toISOString(),
		ruleIds: [...new Set(r.map((e) => e.ruleId))]
	});
	let c = vE(e.now()), l = t.type === "backup" ? `TRPG备份_${c}.trpgsave` : `${yE(r[0].name)}_${c}.trpgsave`;
	return {
		bytes: Nw(i),
		filename: l
	};
}
// src/core/transfer/importer.ts
function CE(e, t) {
	return e.saves.map((e) => t(e.ruleId) ? {
		save: e,
		selectable: !0
	} : {
		save: e,
		selectable: !1,
		reason: "规则未安装"
	});
}
function wE(e, t) {
	if (!t.has(e)) return e;
	let n = `${e}（导入）`;
	if (!t.has(n)) return n;
	for (let n = 2;; n++) {
		let r = `${e}（导入 ${n}）`;
		if (!t.has(r)) return r;
	}
}
async function TE(e, t, n) {
	let { db: r, campaign: i } = e, a = e.uuid ?? NT, o = t.saves.filter((t) => e.hasRule(t.ruleId)), s = new Set(n.selectedIds), c = 0;
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
			mime: aT(n) ?? "application/octet-stream",
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
					name: wE(t.name, o),
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
			t.settings && await r.setMeta("settings", Kw.parse(t.settings));
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
// src/core/selftest.ts
function EE(e, t) {
	if (!e) throw Error(t);
}
function DE(e, t, n) {
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
async function OE(e) {
	let t = [], n = $T({
		dbName: `tavern-trpg-assistant-selftest-${NT()}`,
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
	}, l = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="), (e) => e.charCodeAt(0)), u = (e, t, n = "1.0.0", r = []) => Iw({
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
		entries: [...DE(5, "spell", "sp"), ...r],
		blobs: /* @__PURE__ */ new Map([[qp(l), {
			bytes: l,
			mime: "image/png"
		}]])
	});
	try {
		await s("运行环境", async () => (EE(typeof indexedDB < "u", "没有 IndexedDB"), EE(typeof structuredClone == "function", "没有 structuredClone"), EE(typeof crypto?.getRandomValues == "function", "没有 crypto.getRandomValues"), EE(typeof BroadcastChannel < "u", "没有 BroadcastChannel（多窗口只读不可用）"), `secureContext=${String(globalThis.isSecureContext)}`)), await s("生成并识别内容包（zip 压缩与解压）", async () => {
			let e = n.packs.recognize(u("selftest-core", "rules"));
			return EE(e.type === "pack" && e.manifest.entryCount === 5, "识别结果不对"), `${e.type === "pack" ? e.byteSize : 0} 字节`;
		}), await s("安装内置包与模组（模组依赖核心包）", async () => {
			EE(await n.packs.installBuiltin(u("dnd5e2014-srd", "rules")) === "installed", "内置包未安装");
			let e = n.packs.recognize(u("selftest-module", "adventure", "1.0.0", [c]));
			EE(e.type === "pack", "不是内容包"), await n.packs.install(e, { source: "import" }), EE((await n.packs.list()).length === 2, "安装数量不对");
		}), await s("重复导入同一个包：要求先选择覆盖；选择后升级", async () => {
			let e = n.packs.recognize(u("selftest-module", "adventure", "1.1.0", [c]));
			EE(e.type === "pack", "不是内容包");
			let t = !1;
			try {
				await n.packs.install(e, { source: "import" });
			} catch {
				t = !0;
			}
			EE(t, "没有要求选择覆盖"), await n.packs.install(e, {
				source: "import",
				resolution: "overwrite"
			}), EE((await n.db.packs.get("selftest-module"))?.version === "1.1.0", "覆盖后版本不对");
		}), await s("新存档、修改、保存、分支", async () => {
			let e = await n.campaign.startNewCampaign({
				...r,
				ruleId: "dnd5e2014",
				packIds: ["selftest-module"],
				name: "自检存档"
			});
			EE(!n.campaign.isDirty(e.workspace), "新存档不应有未保存改动");
			let t = await n.campaign.updateData(r.ownerKey, (e) => ({
				...e,
				gold: 10
			}));
			EE(n.campaign.isDirty(t), "修改后应为未保存"), EE((await n.campaign.saveCurrent(r.ownerKey)).changed, "保存应写入"), EE((await n.campaign.branch(r.ownerKey)).save.branchedFrom === e.save.id, "分支来源不对");
		}), await s("读取存档（写自动存档）与模板副本", async () => {
			let e = (await n.campaign.listManual({
				ownerKey: r.ownerKey,
				ruleId: "dnd5e2014"
			}, "card")).find((e) => e.name === "自检存档");
			EE(e, "找不到第一个存档"), await n.campaign.loadSave(r, e.id), EE((await n.campaign.listAuto(r.ownerKey, "dnd5e2014")).length === 1, "没有写自动存档");
			let t = await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "tom"
			}), i = await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "tom"
			});
			EE(t.created && !i.created, "唯一条目应只有一份"), EE((await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "sp1"
			}, 3)).instances.map((e) => e.label).join("") === "ABC", "批量编号不对");
		}), await s("删除、最近删除、恢复、彻底删除", async () => {
			let [e] = (await n.campaign.listManual({
				ownerKey: r.ownerKey,
				ruleId: "dnd5e2014"
			}, "card")).filter((e) => e.name !== "自检存档");
			await n.campaign.deleteSave(e.id), EE((await n.campaign.listDeleted("dnd5e2014")).length === 1, "最近删除应有 1 个"), await n.campaign.restoreSave(e.id), await n.campaign.deleteSave(e.id), EE(await n.campaign.purgeSaves([e.id]) === 1, "彻底删除失败");
		}), await s("导出存档并导入到另一张卡", async () => {
			await n.campaign.saveCurrent(r.ownerKey);
			let e = (await n.campaign.getWorkspace(r.ownerKey)).currentSaveId, { bytes: t } = await SE({
				db: n.db,
				packs: n.packs,
				now: n.now,
				appVersion: "99.0.0"
			}, {
				type: "save",
				saveId: e
			}, { includePacks: !0 }), o = n.packs.recognize(t);
			EE(o.type === "save" && o.attachedPacks.size === 1, "导出文件内容不对");
			let s = CE(o, a);
			return EE((await TE({
				db: n.db,
				campaign: n.campaign,
				now: n.now,
				hasRule: a
			}, o, {
				owner: i,
				selectedIds: s.map((e) => e.save.id)
			})).imported === 1, "导入数量不对"), `${t.length} 字节`;
		}), await s("完整备份导出与覆盖恢复", async () => {
			let { bytes: e } = await SE({
				db: n.db,
				packs: n.packs,
				now: n.now,
				appVersion: "99.0.0"
			}, { type: "backup" }, { includePacks: !1 }), t = n.packs.recognize(e);
			EE(t.type === "backup" && t.workspaces.length === 1 && t.saves.length >= 3, "备份内容不对"), await n.campaign.updateData(r.ownerKey, (e) => ({
				...e,
				gold: 999
			})), await TE({
				db: n.db,
				campaign: n.campaign,
				now: n.now,
				hasRule: a
			}, t, {
				owner: r,
				selectedIds: [],
				mode: "overwrite"
			}), EE((await n.campaign.getWorkspace(r.ownerKey))?.data.gold === 10, "覆盖恢复后数据不对"), EE((await n.campaign.listAuto(r.ownerKey, "dnd5e2014")).some((e) => e.autoReason === "恢复备份前"), "没有\"恢复备份前\"自动存档");
		}), await s("删除内容包", async () => {
			await n.packs.uninstall("selftest-module"), EE(await n.db.entries.where("packId").equals("selftest-module").count() === 0, "条目未清除");
		});
	} finally {
		n.db.close(), await n.db.delete();
	}
	return t;
}
// src/probes/m1Probe.ts
var kE = "m1", AE = "M1 数据层自检";
function jE() {
	return {
		id: kE,
		title: AE,
		hint: "在独立的临时数据库里走完：安装内容包 → 新存档 → 保存 → 分支 → 读取 → 副本 → 删除与恢复 → 导出导入 → 备份恢复。只用合成数据，结束后自动删除，不影响你的真实数据。",
		actions: [{
			label: "运行 M1 数据层自检",
			run: () => nE(kE, AE, async () => {
				tE(kE, AE, "waiting", "正在运行…");
				let e = await OE((e) => tE(kE, AE, "waiting", `已完成 ${e.name}`)), t = e.find((e) => !e.ok);
				tE(kE, AE, t ? "fail" : "pass", t ? `未通过：${t.name} — ${t.detail ?? ""}` : `全部通过（${e.length}/10 步）`, e.map((e) => `${e.ok ? "✓" : "✗"} ${e.name}${e.detail ? ` — ${e.detail}` : ""}`));
			})
		}]
	};
}
// src/core/packs/catalog.ts
var ME = 36e5, NE = 1e4;
function PE(e, t) {
	return t?.name === "AbortError" ? new X("E_CANCELLED", "已取消") : new X("E_NETWORK", `${e}：网络不可用`);
}
function FE(e, t) {
	return new X("E_HTTP", t === 404 ? `${e}：文件不存在（404）` : `${e}：服务器返回 ${t}`, { status: t });
}
async function IE(e) {
	let t = e.now ?? Date.now;
	if (e.db && !e.force) {
		let n = await e.db.getMeta("catalogCache");
		if (n && n.url === e.url && t() - n.fetchedAt < ME) return n.catalog;
	}
	let n = new AbortController(), r = setTimeout(() => n.abort(), e.timeoutMs ?? NE), i;
	try {
		i = await (e.fetchFn ?? fetch)(e.url, { signal: n.signal });
	} catch (e) {
		throw e?.name === "AbortError" ? new X("E_NETWORK", "连不上数据仓库：等待超时") : PE("连不上数据仓库", e);
	} finally {
		clearTimeout(r);
	}
	if (!i.ok) throw FE("连不上数据仓库", i.status);
	let a;
	try {
		a = await i.json();
	} catch {
		throw new X("E_BAD_CONTENT", "数据仓库目录格式不正确");
	}
	let o = aC.safeParse(a);
	if (!o.success) throw new X("E_BAD_CONTENT", "数据仓库目录格式不正确");
	if (o.data.formatVersion > 2) throw new X("E_NEWER_FORMAT", "数据仓库目录由更新版本创建，请先更新扩展");
	return e.db && await e.db.setMeta("catalogCache", {
		url: e.url,
		fetchedAt: t(),
		catalog: o.data
	}), o.data;
}
async function LE(e, t) {
	let n = new URL(e.url, t.catalogUrl).toString(), r;
	try {
		r = await (t.fetchFn ?? fetch)(n, { signal: t.signal });
	} catch (e) {
		throw PE("下载失败", e);
	}
	if (!r.ok) throw FE("下载失败", r.status);
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
		throw e?.name === "AbortError" ? new X("E_CANCELLED", "已取消") : new X("E_NETWORK", "下载失败：网络中断");
	}
	let s = new Uint8Array(o), c = 0;
	for (let e of a) s.set(e, c), c += e.length;
	return OT(s, {
		byteSize: e.byteSize,
		sha256: e.sha256
	}), s;
}
// src/core/m2selftest.ts
var RE = {
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
function zE(e) {
	let t = e.data.src, n = e.data.credit;
	return `出自《${RE[t?.book ?? ""] ?? t?.book ?? "未知"}》第 ${t?.page ?? 0} 页 · 中文：${n?.by ?? "未知"}（${n?.license ?? "未知"}）`;
}
async function BE() {
	let e = new URL("../packs/dnd5e2014-srd.trpgpack", "" + import.meta.url).toString(), t = await fetch(e);
	if (!t.ok) throw Error(`内置 SRD 包读取失败（${t.status}）`);
	return new Uint8Array(await t.arrayBuffer());
}
function VE() {
	let e = globalThis.__TRPG_M2_CATALOG_URL__;
	return e ? typeof location < "u" ? new URL(e, location.href).toString() : e : "https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json";
}
async function HE(e) {
	let t = [], n = $T({
		dbName: `tavern-trpg-assistant-m2-${NT()}`,
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
			let e = await n.packs.installBuiltin(await BE()), t = await n.db.packs.get("dnd5e2014-srd");
			if (!t) throw Error("内置 SRD 包未安装");
			return o.push(t), `${e}；${t.entryCount} 条，${(t.byteSize / 1024).toFixed(1)} KB`;
		}), await a("从数据仓库下载一个书籍包", async () => {
			let e;
			try {
				e = await IE({ url: VE() });
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
			let r = await LE(t, { catalogUrl: VE() }), i = n.packs.recognize(r);
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
			return { detail: [t, ...r.map((e, t) => `${t + 1}. ${e.name}｜${e.summary}｜${zE(e)}`)].join("\n") };
		}), await a("每种数据做一次导入 → 读取 → 使用 → 导出 → 再导入", async () => {
			let e = await n.packs.list({ ruleId: "dnd5e2014" });
			if (!e.length) throw Error("没有已安装的内容包");
			let t = await n.db.entries.toArray(), r = [...new Set(t.map((e) => e.type))].sort(), i = [], a = [];
			for (let e of r) {
				let r = t.find((t) => t.type === e), o = await n.packs.exportPack(r.packId), s = n.packs.recognize(o), c = s.entries.find((e) => e.id === r.entryId);
				if (!c || Kp(c.data) !== Kp(r.data)) {
					a.push(`${e}: ${r.entryId} 导出后内容不一致`);
					continue;
				}
				await n.packs.install(s, {
					source: "import",
					resolution: "overwrite"
				});
				let l = await n.db.entries.get([r.packId, r.entryId]);
				!l || Kp(l.data) !== Kp(r.data) ? a.push(`${e}: ${r.entryId} 再导入后内容不一致`) : i.push(`✓ ${e}：${r.entryId}`);
			}
			let o = e.find((e) => e.content.features.length > 0);
			if (o) {
				let e = Kp(o.content.features), t = await n.packs.exportPack(o.id), r = n.packs.recognize(t);
				Kp(r.features) !== e && a.push(`功能定义：${o.id} 导出后不一致`), await n.packs.install(r, {
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
var UE = "m2", WE = "M2 数据自检";
function GE() {
	return {
		id: UE,
		title: WE,
		hint: "在临时数据库里安装内置 SRD 包、从数据仓库下载一个书籍包、显示条数与抽样来源、对每种数据做一次往返，最后清理测试数据库。数据仓库尚未发布时下载一步会跳过；只用临时库，不影响真实数据。",
		actions: [{
			label: "运行 M2 数据自检",
			run: () => nE(UE, WE, async () => {
				tE(UE, WE, "waiting", "正在运行…");
				let e = await HE((e) => tE(UE, WE, "waiting", `已完成 ${e.name}`)), t = e.find((e) => !e.ok), n = e.filter((e) => e.skipped).length;
				tE(UE, WE, t ? "fail" : "pass", t ? `未通过：${t.name} — ${t.detail ?? ""}` : `全部通过（${e.length}/5 步${n ? `，${n} 步跳过` : ""}）`, e.map((e) => `${e.ok ? e.skipped ? "↷" : "✓" : "✗"} ${e.name}${e.detail ? ` — ${e.detail}` : ""}`));
			})
		}]
	};
}
// src/probes/promptScan.ts
var KE = "TRPG-PROBE-COMMENT", qE = "TRPG-PROBE-INJECT";
function JE(e) {
	if (typeof e == "string") return e;
	try {
		return JSON.stringify(e) ?? "";
	} catch (e) {
		return console.error("[trpg-assistant] 请求内容无法序列化", e), "";
	}
}
function YE(e, t) {
	let n = e.indexOf(t);
	if (!(n < 0)) return e.slice(Math.max(0, n - 6), n + t.length + 12);
}
function XE(e, t) {
	let n = e?.chat;
	if (Array.isArray(n)) for (let e = 0; e < n.length; e++) {
		let r = n[e];
		if ((typeof r?.content == "string" ? r.content : JE(r?.content)).includes(t)) return {
			role: String(r.role ?? "?"),
			indexFromEnd: n.length - 1 - e
		};
	}
}
function ZE(e) {
	let t = JE(e);
	return {
		length: t.length,
		comment: t.includes(KE),
		commentIntact: t.includes("<!--TRPG-PROBE-COMMENT") && t.includes("-->"),
		inject: t.includes(qE),
		commentSnippet: YE(t, KE),
		injectSnippet: YE(t, qE),
		injectAt: XE(e, qE)
	};
}
// src/probes/llmLogAudit.ts
function QE(e) {
	if (e && typeof e == "object") {
		let t = e;
		return t.id ?? t.key ?? t.logId ?? t.name;
	}
	return e;
}
async function $E() {
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
	let o = ZE(await e.getRaw(QE(r)));
	return a.scan = o, a.markers = [KE, qE], {
		status: "info",
		summary: `最近一次请求原文：${o.comment ? `含注释标记${o.commentIntact ? "（符号完整）" : "（符号被改）"}` : "无注释标记"}；${o.inject ? "含注入标记" : "无注入标记"}`,
		detail: a
	};
}
// src/probes/promptProbes.ts
var eD = "comment", tD = "注释是否进入发给 AI 的请求", nD = "inject", rD = "提示词注入是否生效", iD = "input", aD = "写入与读取输入框", oD = "tavern-trpg-assistant_probe", sD = 1, cD = 0;
function lD(e) {
	return e?.dryRun === !0;
}
function uD(e) {
	let t = !1, n = !1, r = "", i = [], a = {}, o = (e) => (t) => {
		i.push({
			event: e,
			dryRun: lD(t),
			...ZE(t)
		});
	}, s = () => {
		let e = i.filter((e) => !e.dryRun);
		if (r !== "quiet") {
			if (!e.length) t && tE(eD, tD, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）"), n && tE(nD, rD, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）");
			else {
				if (t) {
					let n = e.find((e) => e.comment), i = e.some((e) => e.commentIntact);
					tE(eD, tD, n && i ? "pass" : "fail", n ? i ? "注释原样进入了请求（<!-- --> 完整保留）" : "标记文字进入了请求，但 <!-- --> 符号被改动或删除" : "请求中没有找到注释内容（注释被删除）", {
						runType: r,
						captures: e,
						message: a
					}), t = !1;
				}
				if (n) {
					let t = e.find((e) => e.inject);
					tE(nD, rD, t ? "pass" : "fail", t ? `注入文本进入了请求${t.injectAt ? `（${t.injectAt.role} 消息，距末尾 ${t.injectAt.indexFromEnd} 条）` : ""}` : "请求中没有找到注入文本", {
						runType: r,
						captures: e
					}), n = !1, c();
				}
			}
		}
	}, c = () => {
		let t = e.extension_prompt_types?.IN_CHAT ?? sD, n = e.extension_prompt_roles?.SYSTEM ?? cD;
		e.setExtensionPrompt?.(oD, "", t, 0, !1, n);
	}, l = () => {
		let t = h(e, "CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready"), n = h(e, "GENERATE_AFTER_COMBINE_PROMPTS", "generate_after_combine_prompts"), c = h(e, "GENERATE_AFTER_DATA", "generate_after_data");
		g(e, t, o(t)), g(e, n, o(n)), g(e, c, o(c)), g(e, h(e, "GENERATION_STARTED", "generation_started"), (e, t, n) => {
			n !== !0 && (r = String(e ?? ""), i = []);
		});
		let l = () => s();
		g(e, h(e, "GENERATION_ENDED", "generation_ended"), l), g(e, h(e, "GENERATION_STOPPED", "generation_stopped"), l), g(e, h(e, "MESSAGE_SENT", "message_sent"), (t) => {
			let n = e.chat[Number(t)];
			a.storedInChat = !!n?.mes?.includes(KE);
		}), g(e, h(e, "USER_MESSAGE_RENDERED", "user_message_rendered"), (e) => {
			let t = document.querySelector(`.mes[mesid="${Number(e)}"] .mes_text`);
			t && (a.visibleTextHasMarker = !!t.textContent?.includes(KE), a.htmlHasComment = t.innerHTML.includes(`<!--${KE}`));
		});
	}, u = {
		id: eD,
		title: tD,
		hint: "点「写入测试注释」后，自己发送这条消息（需要已连接模型）。发送完成后自动判定；楼层里应看不到注释文字。",
		actions: [{
			label: "写入测试注释到输入框",
			run: () => nE(eD, tD, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let n = `<!--${KE} 探针-->`;
				_(e, e.value ? `${e.value}\n${n}` : `测试 ${n}`), t = !0, tE(eD, tD, "waiting", "已写入。请发送这条消息，等 AI 回复结束后自动判定");
			})
		}]
	};
	u.actions.push({
		label: "从 TauriTavern 请求日志核对",
		run: () => nE(eD, tD, async () => {
			let e = await $E();
			tE(eD, tD, e.status, e.summary, {
				runType: r,
				audit: e.detail,
				message: a
			});
		})
	});
	let d = {
		id: nD,
		title: rD,
		hint: "点「注入探针」后发送任意消息。可以和上一项同一次发送完成判定。测完请点「清除注入」。",
		actions: [{
			label: "注入探针",
			run: () => nE(nD, rD, () => {
				if (!e.setExtensionPrompt) throw Error("宿主没有 setExtensionPrompt");
				let t = e.extension_prompt_types?.IN_CHAT ?? sD, r = e.extension_prompt_roles?.SYSTEM ?? cD;
				e.setExtensionPrompt(oD, `[${qE}] 这是探针注入文本`, t, 0, !1, r), n = !0, tE(nD, rD, "waiting", "已注入（IN_CHAT，深度 0）。请发送一条消息，判定后会自动清除", { enumsFromContext: !!e.extension_prompt_types });
			})
		}, {
			label: "清除注入",
			run: () => nE(nD, rD, () => {
				c(), n = !1, tE(nD, rD, "idle", "已清除注入");
			})
		}]
	}, p = {
		id: iD,
		title: aD,
		hint: "自动写入一段文字、读回校验，然后恢复原内容（不会发送）。",
		actions: [{
			label: "运行输入框测试",
			run: () => nE(iD, aD, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let t = e.value, n = `${t}[TRPG-PROBE-INPUT]`;
				_(e, n);
				let r = e.value;
				_(e, t);
				let i = e.value === t;
				tE(iD, aD, r === n && i ? "pass" : "fail", r === n ? i ? "写入、读回、恢复都正常" : "写入正常，但恢复失败" : "写入后读回的内容不一致", {
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
var dD = "storage", fD = "本地存储与持久性", pD = `${u}-m0`, mD = 4194304;
function hD() {
	return new Promise((e, t) => {
		let n = indexedDB.open(pD, 1);
		n.onupgradeneeded = () => n.result.createObjectStore("kv"), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
	});
}
function gD(e, t, n) {
	return new Promise((r, i) => {
		let a = n(e.transaction("kv", t).objectStore("kv"));
		a.onsuccess = () => r(a.result), a.onerror = () => i(a.error);
	});
}
function _D(e) {
	let t = () => nE(dD, fD, async () => {
		let t = await hD(), n = await gD(t, "readonly", (e) => e.get("boot")), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			count: (n?.count ?? 0) + 1,
			firstAt: n?.firstAt ?? r,
			lastAt: r
		};
		await gD(t, "readwrite", (e) => e.put(i, "boot"));
		let a = !!await gD(t, "readonly", (e) => e.get("blob"));
		a || await gD(t, "readwrite", (e) => e.put(new Uint8Array(mD), "blob"));
		let o = await gD(t, "readonly", (e) => e.get("blob"));
		t.close();
		let s = await navigator.storage?.persisted?.() ?? null, c = await navigator.storage?.estimate?.() ?? null, l = e.extensionSettings[u] ??= {}, d = Number(l.probeBootCount ?? 0);
		l.probeBootCount = d + 1, e.saveSettingsDebounced(), tE(dD, fD, "info", `IndexedDB 第 ${i.count} 次启动读写正常；刷新页面后次数应增加`, {
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
		id: dD,
		title: fD,
		hint: "每次启动自动读写 IndexedDB（含 4MB 数据）与扩展设置。完全退出再打开应用后，启动次数应继续累加，4MB 数据应已存在。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/tauriProbe.ts
var vD = "tauri", yD = "TauriTavern 扩展接口", bD = `${u}-m0`, xD = "/scripts/tauritavern/layout-kit.js", SD = [
	"current",
	"getCurrent",
	"active",
	"handle",
	"currentChat"
];
function CD(e, t) {
	if (typeof e == "function") return "function";
	if (typeof e != "object" || !e) return typeof e;
	if (t <= 0) return "object";
	let n = {};
	for (let r of Object.keys(e)) n[r] = CD(e[r], t - 1);
	return n;
}
async function wD(e, t) {
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
function TD(e) {
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
function ED(e) {
	let t = e;
	return t.ok ? {
		ok: !0,
		shape: TD(t.value)
	} : t;
}
async function DD(e) {
	if (typeof e.searchMessages == "function" || e.store) return {
		handle: e,
		via: "api.chat 本身"
	};
	let t = e.current;
	if (t && typeof t.handle == "function") {
		let e = await wD("api.chat.current.handle()", () => t.handle.call(t));
		if (e.ok && e.value && typeof e.value == "object") return {
			handle: e.value,
			via: "api.chat.current.handle()"
		};
	}
	for (let t of SD) {
		let n = e[t];
		if (typeof n == "function") {
			let r = await wD(`api.chat.${t}()`, () => n.call(e)), i = r.value;
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
function OD() {
	let e = () => nE(vD, yD, async () => {
		if (!window.__TAURITAVERN__) {
			tE(vD, yD, "info", "不是 TauriTavern，跳过（扩展将使用酒馆通用能力）");
			return;
		}
		let e = (await m())?.api ?? {}, t = e.chat ?? {}, n = { apiShape: CD(e, 3) };
		n.layoutKitExports = await wD("layout-kit 导入", () => import(
			/* @vite-ignore */
			xD
).then((e) => Object.keys(e)));
		let { handle: r, via: i } = await DD(t);
		if (n.handleVia = i, r) {
			let e = r;
			n.handleShape = CD(r, 2), e.searchMessages && (n.searchMessages = ED(await wD("searchMessages", () => e.searchMessages({
				query: "你",
				limit: 3
			}))));
			let t = e.locate?.findLastMessage;
			if (t && (n.findLastMessage = ED(await wD("findLastMessage", () => t.call(e.locate, {
				role: "user",
				scanLimit: 50
			})))), e.store?.setJson && e.store.getJson) {
				let t = { at: (/* @__PURE__ */ new Date()).toISOString() };
				n.storeSet = await wD("store.setJson", () => e.store.setJson({
					namespace: bD,
					key: "probe",
					value: t
				})), n.storeGet = await wD("store.getJson", () => e.store.getJson({
					namespace: bD,
					key: "probe"
				})), e.store.listKeys && (n.storeKeys = await wD("store.listKeys", () => e.store.listKeys({ namespace: bD }))), e.store.deleteJson && (n.storeDelete = await wD("store.deleteJson", () => e.store.deleteJson({
					namespace: bD,
					key: "probe"
				})));
			}
			e.metadata?.get && (n.metadata = ED(await wD("metadata.get", () => e.metadata.get()))), typeof e.stableId == "function" && (n.stableId = ED(await wD("stableId", () => e.stableId.call(e)))), typeof e.summary == "function" && (n.summary = ED(await wD("summary", () => e.summary.call(e))));
		}
		let a = e.extension?.store;
		if (a?.setJson && a.getJson) {
			let e = { at: (/* @__PURE__ */ new Date()).toISOString() }, t = {
				namespace: bD,
				key: "probe"
			};
			n.extStoreSet = await wD("extension.store.setJson", () => a.setJson({
				...t,
				value: e
			})), n.extStoreGet = await wD("extension.store.getJson", () => a.getJson(t)), a.listKeys && (n.extStoreKeys = await wD("extension.store.listKeys", () => a.listKeys({ namespace: bD }))), a.deleteJson && (n.extStoreDelete = await wD("extension.store.deleteJson", () => a.deleteJson(t)));
		}
		tE(vD, yD, "info", r ? `找到 handle（${i}）；各接口调用结果见详情` : "没有找到获取 handle 的方式；接口结构见详情", n);
	});
	return {
		id: vD,
		title: yD,
		hint: "仅 TauriTavern 有效。请分别在「已打开聊天」和「未打开聊天」两种状态下点「重新检测」各测一次。",
		actions: [{
			label: "重新检测",
			run: e
		}],
		start: e
	};
}
// src/probes/index.ts
function kD(e) {
	return [
		jE(),
		GE(),
		cE(e),
		...uD(e),
		_D(e),
		gE(e),
		fE(e),
		OD()
	];
}
// src/ui/kit/ConfirmPage.vue?vue&type=script&setup=true&lang.ts
var AD = { class: "trpg-confirm" }, jD = { class: "trpg-confirm__message" }, MD = {
	key: 0,
	class: "trpg-confirm__details"
}, ND = { class: "trpg-confirm__actions" }, PD = ["data-autofocus"], FD = ["data-autofocus"], ID = /* @__PURE__ */ H({
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
		return (e, n) => (W(), G("div", AD, [
			q("p", jD, F(t.message), 1),
			t.details?.length ? (W(), G("ul", MD, [(W(!0), G(xs, null, Oa(t.details, (e) => (W(), G("li", { key: e }, F(e), 1))), 128))])) : Vs("", !0),
			q("div", ND, [q("button", {
				class: "trpg-btn",
				type: "button",
				"data-autofocus": t.danger ? "" : void 0,
				onClick: n[0] ||= (e) => t.onAnswer(!1)
			}, F(t.cancelLabel ?? "取消"), 9, PD), q("button", {
				class: Ae(["trpg-btn", t.danger ? "trpg-btn--danger" : "trpg-btn--primary"]),
				type: "button",
				"data-autofocus": t.danger ? void 0 : "",
				onClick: n[1] ||= (e) => t.onAnswer(!0)
			}, F(t.confirmLabel), 11, FD)])
		]));
	}
}), LD = 0;
function RD(e) {
	let t = Bf();
	return new Promise((n) => {
		let r = !1, i = (e) => {
			r || (r = !0, n(e));
		};
		t.push({
			key: `confirm:${++LD}`,
			title: e.title,
			component: vn(ID),
			props: {
				message: e.message,
				details: e.details,
				confirmLabel: e.confirmLabel,
				cancelLabel: e.cancelLabel,
				danger: e.danger,
				onAnswer: (e) => {
					i(e), t.pop();
				}
			},
			variant: "confirm",
			onLeave: () => i(!1)
		});
	});
}
// node_modules/ohash/dist/_chunks/is-equal.mjs
function zD(e) {
	return typeof e == "string" ? `'${e}'` : new UD().serialize(e);
}
var BD = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz", VD = /*@__PURE__*/ (function() {
	let e = /* @__PURE__ */ new Uint8Array(128);
	for (let t = 0; t < 69; t++) e[BD.charCodeAt(t)] = t + 1;
	for (let t = 65; t <= 90; t++) e[t] = e[t + 32];
	return e;
})();
function HD(e, t) {
	if (e === t) return 0;
	let n = Math.min(e.length, t.length), r = 0;
	for (let i = 0; i < n; i++) {
		let n = e.charCodeAt(i), a = t.charCodeAt(i);
		if (n === a) continue;
		let o = n < 128 && VD[n] ? VD[n] : n + 128, s = a < 128 && VD[a] ? VD[a] : a + 128;
		if (o !== s) return o < s ? -1 : 1;
		r === 0 && (r = n > a ? -1 : 1);
	}
	return e.length === t.length ? r : e.length < t.length ? -1 : 1;
}
var UD = /*@__PURE__*/ (function() {
	class e {
		#e = /* @__PURE__ */ new Map();
		compare(e, t) {
			let n = typeof e, r = typeof t;
			return n === "string" && r === "string" ? HD(e, t) : n === "number" && r === "number" ? e - t : HD(this.serialize(e, !0), this.serialize(t, !0));
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
			let i = Object.keys(e).sort(HD), a = `${r}{`;
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
function WD(e, t) {
	return e === t || zD(e) === zD(t);
}
// node_modules/reka-ui/dist/shared/clamp.js
function GD(e, t = -Infinity, n = Infinity) {
	return Math.min(n, Math.max(t, e));
}
// node_modules/reka-ui/dist/shared/createContext.js
function KD(e, t) {
	let n = typeof e == "string" && !t ? `${e}Context` : t, r = Symbol(n);
	return [(t) => {
		let n = Nr(r, t);
		if (n || n === null) return n;
		throw Error(`Injection \`${r.toString()}\` not found. Component must be used within ${Array.isArray(e) ? `one of the following components: ${e.join(", ")}` : `\`${e}\``}`);
	}, (e) => (Mr(r, e), e)];
}
// node_modules/reka-ui/dist/shared/getActiveElement.js
function qD() {
	let e = document.activeElement;
	if (e == null) return null;
	for (; e != null && e.shadowRoot != null && e.shadowRoot.activeElement != null;) e = e.shadowRoot.activeElement;
	return e;
}
// node_modules/reka-ui/dist/shared/handleAndDispatchCustomEvent.js
function JD(e, t, n) {
	let r = n.originalEvent.target, i = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && r.addEventListener(e, t, { once: !0 }), r.dispatchEvent(i);
}
// node_modules/reka-ui/dist/shared/nullish.js
function YD(e) {
	return e == null;
}
// node_modules/@vueuse/shared/dist/index.js
function XD(e, t) {
	return qe() ? (Je(e, t), !0) : !1;
}
function ZD(e) {
	let t = !1, n, r = Ke(!0);
	return ((...i) => (t ||= (n = r.run(() => e(...i)), !0), n));
}
var QD = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
var $D = (e) => e !== void 0, eO = Object.prototype.toString, tO = (e) => eO.call(e) === "[object Object]", nO = /* #__PURE__ */ rO();
function rO() {
	var e, t;
	return QD && !!((e = window) != null && (e = e.navigator) != null && e.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((t = window) == null || (t = t.navigator) == null ? void 0 : t.maxTouchPoints) > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function iO(e) {
	return Array.isArray(e) ? e : [e];
}
function aO(e) {
	return e || Qs();
}
function oO(e) {
	if (!QD) return e;
	let t = 0, n, r, i = () => {
		--t, r && t <= 0 && (r.stop(), n = void 0, r = void 0);
	};
	return ((...a) => (t += 1, r || (r = Ke(!0), n = r.run(() => e(...a))), XD(i), n));
}
function sO(e) {
	return /* @__PURE__ */ ln(/* @__PURE__ */ xn(e) ? new Proxy({}, {
		get(t, n, r) {
			return B(Reflect.get(e.value, n, r));
		},
		set(t, n, r) {
			return /* @__PURE__ */ xn(e.value[n]) && !/* @__PURE__ */ xn(r) ? e.value[n].value = r : e.value[n] = r, !0;
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
function cO(e) {
	return sO(Y(e));
}
function lO(e, ...t) {
	let n = t.flat(), r = n[0];
	return cO(() => Object.fromEntries(typeof r == "function" ? Object.entries(/* @__PURE__ */ jn(e)).filter(([e, t]) => !r(En(t), e)) : Object.entries(/* @__PURE__ */ jn(e)).filter((e) => !n.includes(e[0]))));
}
function uO(e, t = 1e4) {
	return An((n, r) => {
		let i = En(e), a, o = () => setTimeout(() => {
			i = En(e), r();
		}, En(t));
		return XD(() => {
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
function dO(e, t) {
	aO(t) && ma(e, t);
}
function fO(e, t, n) {
	return Br(e, t, {
		...n,
		immediate: !0
	});
}
// node_modules/@vueuse/core/dist/index.js
var pO = QD ? window : void 0;
QD && window.document, QD && window.navigator, QD && window.location;
function mO(e) {
	let t = En(e);
	return t?.$el ?? t;
}
function hO(...e) {
	let t = (e, t, n, r) => (e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r)), n = Y(() => {
		let t = iO(En(e[0])).filter((e) => e != null);
		return t.every((e) => typeof e != "string") ? t : void 0;
	});
	return fO(() => [
		n.value?.map((e) => mO(e)) ?? [pO].filter((e) => e != null),
		iO(En(n.value ? e[1] : e[0])),
		iO(B(n.value ? e[2] : e[1])),
		En(n.value ? e[3] : e[2])
	], ([e, n, r, i], a, o) => {
		if (!e?.length || !n?.length || !r?.length) return;
		let s = tO(i) ? { ...i } : i, c = e.flatMap((e) => n.flatMap((n) => r.map((r) => t(e, n, r, s))));
		o(() => {
			c.forEach((e) => e());
		});
	}, { flush: "post" });
}
function gO() {
	let e = /* @__PURE__ */ Sn(!1), t = Qs();
	return t && da(() => {
		e.value = !0;
	}, t), e;
}
/* @__NO_SIDE_EFFECTS__ */
function _O(e) {
	let t = gO();
	return Y(() => (t.value, !!e()));
}
function vO(e) {
	return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function yO(...e) {
	let t, n, r = {};
	e.length === 3 ? (t = e[0], n = e[1], r = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], r = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
	let { target: i = pO, eventName: a = "keydown", passive: o = !1, dedupe: s = !1 } = r, c = vO(t);
	return hO(i, a, (e) => {
		e.repeat && En(s) || c(e) && n(e);
	}, o);
}
function bO(e) {
	return JSON.parse(JSON.stringify(e));
}
function xO(e, t, n = {}) {
	let { window: r = pO, ...i } = n, a, o = /* @__PURE__ */ _O(() => r && "ResizeObserver" in r), s = () => {
		a &&= (a.disconnect(), void 0);
	}, c = Br(Y(() => {
		let t = En(e);
		return Array.isArray(t) ? t.map((e) => mO(e)) : [mO(t)];
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
	return XD(l), {
		isSupported: o,
		stop: l
	};
}
function SO(e, t, n, r = {}) {
	var i, a;
	let { clone: o = !1, passive: s = !1, eventName: c, deep: l = !1, defaultValue: u, shouldEmit: d } = r, f = Qs(), p = n || f?.emit || (f == null || (i = f.$emit) == null ? void 0 : i.bind(f)) || (f == null || (a = f.proxy) == null || (a = a.$emit) == null ? void 0 : a.bind(f?.proxy)), m = c;
	t ||= "modelValue", m ||= `update:${t.toString()}`;
	let h = (e) => o ? typeof o == "function" ? o(e) : bO(e) : e, g = () => $D(e[t]) ? h(e[t]) : u, _ = (e) => {
		d ? d(e) && p(m, e) : p(m, e);
	};
	if (s) {
		let n = /* @__PURE__ */ z(g()), r = !1;
		return Br(() => e[t], (e) => {
			r || (r = !0, n.value = h(e), ur(() => r = !1));
		}), Br(n, (n) => {
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
function CO(e) {
	return e ? e.flatMap((e) => e.type === xs ? CO(e.children) : [e]) : [];
}
// node_modules/reka-ui/dist/shared/useArrowNavigation.js
var wO = ["INPUT", "TEXTAREA"];
function TO(e, t, n, r = {}) {
	if (!t || r.enableIgnoredElement && wO.includes(t.nodeName)) return null;
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
	return v || _ ? b = EO(y, t, {
		goForward: _ ? m : c === "ltr" ? d : f,
		loop: s
	}) : h ? b = y.at(0) || null : g && (b = y.at(-1) || null), u && b?.focus(), b;
}
function EO(e, t, n, r = e.includes(t) ? e.length : e.length + 1) {
	if (--r === 0) return null;
	let i = e.indexOf(t), a;
	if (a = i === -1 ? n.goForward ? 0 : e.length - 1 : n.goForward ? i + 1 : i - 1, !n.loop && (a < 0 || a >= e.length)) return null;
	let o = e[(a + e.length) % e.length];
	return o ? o.hasAttribute("disabled") && o.getAttribute("disabled") !== "false" ? EO(e, o, n, r) : o : null;
}
// node_modules/reka-ui/dist/ConfigProvider/ConfigProvider.js
var [DO, OO] = /*#__PURE__*/ KD("ConfigProvider"), kO = /* @__PURE__ */ new WeakMap();
function AO(e, t) {
	let n = kO.get(e);
	n || (n = {
		owners: /* @__PURE__ */ new Set(),
		original: e.body.style.pointerEvents
	}, kO.set(e, n)), n.owners.add(t), e.body.style.pointerEvents = "none";
}
function jO(e, t) {
	let n = kO.get(e);
	n?.owners.delete(t) && n.owners.size === 0 && (kO.delete(e), e.body.style.pointerEvents = n.original);
}
// node_modules/defu/dist/defu.mjs
function MO(e) {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null || Symbol.iterator in e ? !1 : Symbol.toStringTag in e ? Object.prototype.toString.call(e) === "[object Module]" : !0;
}
function NO(e, t, n = ".", r) {
	if (!MO(t)) return NO(e, {}, n, r);
	let i = { ...t };
	for (let t of Object.keys(e)) {
		if (t === "__proto__" || t === "constructor") continue;
		let a = e[t];
		a != null && (r && r(i, t, a, n) || (i[t] = Array.isArray(a) && Array.isArray(i[t]) ? [...a, ...i[t]] : MO(a) && MO(i[t]) ? NO(a, i[t], (n ? `${n}.` : "") + t.toString(), r) : a));
	}
	return i;
}
function PO(e) {
	return (...t) => t.reduce((t, n) => NO(t, n, "", e), {});
}
var FO = PO(), IO = Symbol("useBodyScrollLock"), LO = oO(() => {
	let e = /* @__PURE__ */ z(/* @__PURE__ */ new Map()), t = /* @__PURE__ */ z(), n = Y(() => {
		for (let t of e.value.values()) if (t) return !0;
		return !1;
	}), r = DO({ scrollBody: /* @__PURE__ */ z(!0) }), i = null, a = () => {
		document.body.style.paddingRight = "", document.body.style.marginRight = "", jO(document, IO), document.documentElement.style.removeProperty("--scrollbar-width"), document.body.style.overflow = t.value ?? "", nO && i?.(), t.value = void 0;
	};
	return Br(n, (e, o) => {
		if (!QD) return;
		if (!e) {
			o && a();
			return;
		}
		t.value === void 0 && (t.value = document.body.style.overflow);
		let s = window.innerWidth - document.documentElement.clientWidth, c = {
			padding: s,
			margin: 0
		}, l = r.scrollBody?.value ? typeof r.scrollBody.value == "object" ? FO({
			padding: r.scrollBody.value.padding === !0 ? s : r.scrollBody.value.padding,
			margin: r.scrollBody.value.margin === !0 ? s : r.scrollBody.value.margin
		}, c) : c : {
			padding: 0,
			margin: 0
		};
		s > 0 && (document.body.style.paddingRight = typeof l.padding == "number" ? `${l.padding}px` : String(l.padding), document.body.style.marginRight = typeof l.margin == "number" ? `${l.margin}px` : String(l.margin), document.documentElement.style.setProperty("--scrollbar-width", `${s}px`), document.body.style.overflow = "hidden"), nO && (i = hO(document, "touchmove", (e) => BO(e), { passive: !1 })), ur(() => {
			n.value && (AO(document, IO), document.body.style.overflow = "hidden");
		});
	}, {
		immediate: !0,
		flush: "sync"
	}), e;
});
function RO(e) {
	let t = Math.random().toString(36).substring(2, 7), n = LO();
	n.value.set(t, e ?? !1);
	let r = Y({
		get: () => n.value.get(t) ?? !1,
		set: (e) => n.value.set(t, e)
	});
	return dO(() => {
		n.value.delete(t);
	}), r;
}
function zO(e) {
	let t = window.getComputedStyle(e);
	if (t.overflowX === "scroll" || t.overflowY === "scroll" || t.overflowX === "auto" && e.clientWidth < e.scrollWidth || t.overflowY === "auto" && e.clientHeight < e.scrollHeight) return !0;
	{
		let t = e.parentNode;
		return !(t instanceof Element) || t.tagName === "BODY" ? !1 : zO(t);
	}
}
function BO(e) {
	let t = e || window.event, n = t.target;
	return n instanceof Element && zO(n) ? !1 : t.touches.length > 1 || (t.preventDefault && t.cancelable && t.preventDefault(), !1);
}
// node_modules/reka-ui/dist/shared/useDirection.js
function VO(e) {
	let t = DO({ dir: /* @__PURE__ */ z("ltr") });
	return Y(() => e?.value || t.dir?.value || "ltr");
}
// node_modules/reka-ui/dist/shared/useEmitAsProps.js
function HO(e) {
	let t = Qs(), n = t?.type.emits, r = {};
	return n?.length || console.warn(`No emitted event found. Please check component: ${t?.type.__name}`), n?.forEach((t) => {
		r[_e(pe(t))] = (...n) => e(t, ...n);
	}), r;
}
// node_modules/reka-ui/dist/shared/useFocusGuards.js
var UO = 0;
function WO() {
	Lr((e) => {
		if (!QD) return;
		let t = document.querySelectorAll("[data-reka-focus-guard]");
		document.body.insertAdjacentElement("afterbegin", t[0] ?? GO()), document.body.insertAdjacentElement("beforeend", t[1] ?? GO()), UO++, e(() => {
			UO === 1 && document.querySelectorAll("[data-reka-focus-guard]").forEach((e) => e.remove()), UO--;
		});
	});
}
function GO() {
	let e = document.createElement("span");
	return e.setAttribute("data-reka-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
// node_modules/reka-ui/dist/shared/useFormControl.js
function KO(e) {
	return Y(() => !En(e) || !!mO(e)?.closest("form"));
}
// node_modules/reka-ui/dist/shared/useForwardExpose.js
function qO() {
	let e = Qs(), t = /* @__PURE__ */ z(), n = Y(() => r());
	pa(() => {
		n.value !== r() && Tn(t);
	});
	function r() {
		return t.value && "$el" in t.value && ["#text", "#comment"].includes(t.value.$el.nodeName) ? t.value.$el.nextElementSibling : mO(t);
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
function JO(e) {
	let t = Qs(), n = Object.keys(t?.type.props ?? {}).reduce((e, n) => {
		let r = (t?.type.props[n]).default;
		return r !== void 0 && (e[n] = r), e;
	}, {}), r = /* @__PURE__ */ Pn(e);
	return Y(() => {
		let e = {}, i = t?.vnode.props ?? {};
		return Object.keys(i).forEach((t) => {
			e[pe(t)] = i[t];
		}), Object.keys({
			...n,
			...e
		}).reduce((e, t) => (r.value[t] !== void 0 && (e[t] = r.value[t]), e), {});
	});
}
// node_modules/reka-ui/dist/shared/useForwardPropsEmits.js
function YO(e, t) {
	let n = JO(e), r = t ? HO(t) : {};
	return Y(() => ({
		...n.value,
		...r
	}));
}
// node_modules/aria-hidden/dist/es2015/index.js
var XO = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, ZO = /* @__PURE__ */ new WeakMap(), QO = /* @__PURE__ */ new WeakMap(), $O = {}, ek = 0, tk = function(e) {
	return e && (e.host || tk(e.parentNode));
}, nk = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = tk(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, rk = function(e, t, n, r) {
	var i = nk(t, Array.isArray(e) ? e : [e]);
	$O[n] || ($O[n] = /* @__PURE__ */ new WeakMap());
	var a = $O[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		e && !s.has(e) && (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		e && !c.has(e) && Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (ZO.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				ZO.set(e, c), a.set(e, l), o.push(e), c === 1 && i && QO.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), ek++, function() {
		o.forEach(function(e) {
			var t = ZO.get(e) - 1, i = a.get(e) - 1;
			ZO.set(e, t), a.set(e, i), t || (QO.has(e) || e.removeAttribute(r), QO.delete(e)), i || e.removeAttribute(n);
		}), ek--, ek || (ZO = /* @__PURE__ */ new WeakMap(), ZO = /* @__PURE__ */ new WeakMap(), QO = /* @__PURE__ */ new WeakMap(), $O = {});
	};
}, ik = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || XO(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), rk(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
// node_modules/reka-ui/dist/shared/useHideOthers.js
function ak(e) {
	let t;
	Br(() => mO(e), (e) => {
		let n = !1;
		try {
			n = !!e?.closest("[popover]:not(:popover-open)");
		} catch {}
		e && !n ? t = ik(e) : t && t();
	}), ha(() => {
		t && t();
	});
}
// node_modules/reka-ui/dist/shared/useId.js
var ok = 0;
function sk(e, t = "reka") {
	if (e) return e;
	let n, r = DO({ useId: void 0 });
	return n = r.useId ? r.useId() : "useId" in Wu ? yi?.() : `${++ok}`, t ? `${t}-${n}` : n;
}
// node_modules/reka-ui/dist/shared/useSize.js
function ck(e) {
	let t = /* @__PURE__ */ z(), n = Y(() => t.value?.width ?? 0), r = Y(() => t.value?.height ?? 0), i;
	return da(() => {
		let n = mO(e);
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
	}), ha(() => {
		i?.disconnect(), i = void 0;
	}), {
		width: n,
		height: r
	};
}
// node_modules/reka-ui/dist/shared/useStateMachine.js
function lk(e, t) {
	let n = /* @__PURE__ */ z(e);
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
function uk(e) {
	let t = uO("", 1e3);
	return {
		search: t,
		handleTypeaheadSearch: (n, r) => {
			if (t.value += n, e) e(n);
			else {
				let e = qD(), n = r.map((e) => ({
					...e,
					textValue: e.value?.textValue ?? e.ref.textContent?.trim() ?? ""
				})), i = n.find((t) => t.ref === e), a = fk(n.map((e) => e.textValue), t.value, i?.textValue), o = n.find((e) => e.textValue === a);
				return o && o.ref.focus(), o?.ref;
			}
		},
		resetTypeahead: () => {
			t.value = "";
		}
	};
}
function dk(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
function fk(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = dk(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
// node_modules/reka-ui/dist/Presence/usePresence.js
function pk(e, t) {
	let n = /* @__PURE__ */ z({}), r = /* @__PURE__ */ z("none"), i = /* @__PURE__ */ z(e), a = e.value ? "mounted" : "unmounted", o, s = t.value?.ownerDocument.defaultView ?? pO, { state: c, dispatch: l } = lk(a, {
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
		if (QD) {
			let n = new CustomEvent(e, {
				bubbles: !1,
				cancelable: !1
			});
			t.value?.dispatchEvent(n);
		}
	};
	Br(e, async (e, i) => {
		let a = i !== e;
		if (await ur(), a) {
			let a = r.value, o = mk(t.value);
			e ? (l("MOUNT"), u("enter"), o === "none" && u("after-enter")) : o === "none" || o === "undefined" || n.value?.display === "none" ? (l("UNMOUNT"), u("leave"), u("after-leave")) : i && a !== o ? (l("ANIMATION_OUT"), u("leave")) : (l("UNMOUNT"), u("after-leave"));
		}
	}, { immediate: !0 });
	let d = (e) => {
		if (e.target !== t.value) return;
		let n = mk(t.value), r = n.includes(CSS.escape(e.animationName)), a = c.value === "mounted" ? "enter" : "leave";
		if (r && (u(`after-${a}`), l("ANIMATION_END"), !i.value)) {
			let e = t.value.style.animationFillMode;
			t.value.style.animationFillMode = "forwards", o = s?.setTimeout(() => {
				t.value?.style.animationFillMode === "forwards" && (t.value.style.animationFillMode = e);
			});
		}
		n === "none" && l("ANIMATION_END");
	}, f = (e) => {
		e.target === t.value && (r.value = mk(t.value));
	}, p = Br(t, (e, t) => {
		e ? (n.value = getComputedStyle(e), e.addEventListener("animationstart", f), e.addEventListener("animationcancel", d), e.addEventListener("animationend", d)) : (l("ANIMATION_END"), o !== void 0 && s?.clearTimeout(o), t?.removeEventListener("animationstart", f), t?.removeEventListener("animationcancel", d), t?.removeEventListener("animationend", d));
	}, { immediate: !0 }), m = Br(c, () => {
		let e = mk(t.value);
		r.value = c.value === "mounted" ? e : "none";
	});
	return ha(() => {
		p(), m(), t.value && (t.value.removeEventListener("animationstart", f), t.value.removeEventListener("animationcancel", d), t.value.removeEventListener("animationend", d)), o !== void 0 && s?.clearTimeout(o);
	}), { isPresent: Y(() => ["mounted", "unmountSuspended"].includes(c.value)) };
}
function mk(e) {
	return e && getComputedStyle(e).animationName || "none";
}
// node_modules/reka-ui/dist/Presence/Presence.js
var hk = /*#__PURE__*/ H({
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
		let { present: r, forceMount: i } = /* @__PURE__ */ jn(e), a = /* @__PURE__ */ z(), { isPresent: o } = pk(r, a);
		n({ present: o });
		let s = t.default({ present: o.value });
		s = CO(s || []);
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
			let t = mO(e);
			return t?.hasAttribute === void 0 || (t?.hasAttribute("data-reka-popper-content-wrapper") ? a.value = t.firstElementChild : a.value = t), t;
		} }) : null;
	}
}), gk = /*#__PURE__*/ H({
	name: "PrimitiveSlot",
	inheritAttrs: !1,
	setup(e, { attrs: t, slots: n }) {
		return () => {
			if (!n.default) return null;
			let e = CO(n.default()), r = e.findIndex((e) => e.type !== Cs);
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
}), _k = [
	"area",
	"img",
	"input"
], vk = /*#__PURE__*/ H({
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
		return typeof r == "string" && _k.includes(r) ? () => vc(r, t) : r === "template" ? () => vc(gk, t, { default: n.default }) : () => vc(e.as, t, { default: n.default });
	}
});
// node_modules/reka-ui/dist/Primitive/usePrimitiveElement.js
function yk() {
	let e = /* @__PURE__ */ z();
	return {
		primitiveElement: e,
		currentElement: Y(() => ["#text", "#comment"].includes(e.value?.$el.nodeName) ? e.value?.$el.nextElementSibling : mO(e))
	};
}
// node_modules/reka-ui/dist/DismissableLayer/utils.js
var bk = "dismissableLayer.pointerDownOutside", xk = "dismissableLayer.focusOutside";
function Sk(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e.ownerDocument?.defaultView;
	return typeof Element < "u" && e instanceof Element || !!t && e instanceof t.Element;
}
function Ck(e, t) {
	if (!Sk(t)) return !1;
	if (e.contains(t)) return !0;
	let n = t.closest("[data-dismissable-layer]"), r = e.dataset.dismissableLayer === "" ? e : e.querySelector("[data-dismissable-layer]"), i = Array.from(e.ownerDocument.querySelectorAll("[data-dismissable-layer]"));
	return !!(n && (r === n || i.indexOf(r) < i.indexOf(n)));
}
function wk(e, t, n = !0) {
	let r = /* @__PURE__ */ z(!1), i = /* @__PURE__ */ z(() => {});
	return Lr((a) => {
		if (!QD || !En(n)) return;
		let o = t?.value?.ownerDocument ?? globalThis.document, s = async (n) => {
			let a = n.target;
			if (t?.value && a) {
				if (Ck(t.value, a)) o.removeEventListener("click", i.value), r.value = !1;
				else {
					if (n.target && !r.value) {
						let t = { originalEvent: n };
						function r() {
							JD(bk, e, t);
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
		En(n) && (r.value = !0);
	} };
}
function Tk(e, t, n = !0) {
	let r = /* @__PURE__ */ z(!1);
	return Lr((i) => {
		if (!QD || !En(n)) return;
		let a = t?.value?.ownerDocument ?? globalThis.document, o = async (n) => {
			if (!t?.value) return;
			await ur(), await ur();
			let i = n.target;
			t.value && i && !Ck(t.value, i) && n.target && !r.value && JD(xk, e, { originalEvent: n });
		};
		a.addEventListener("focusin", o), i(() => a.removeEventListener("focusin", o));
	}), {
		onFocusCapture: () => {
			En(n) && (r.value = !0);
		},
		onBlurCapture: () => {
			En(n) && (r.value = !1);
		}
	};
}
// node_modules/reka-ui/dist/DismissableLayer/context.js
var Ek = /*#__PURE__*/ ln({
	layersRoot: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), Dk = /* @__PURE__ */ H({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = qO(), o = Y(() => a.value?.ownerDocument ?? globalThis.document), s = Y(() => Ek.layersRoot), c = Y(() => a.value ? Array.from(s.value).indexOf(a.value) : -1), l = Y(() => Ek.layersWithOutsidePointerEventsDisabled.size > 0), u = Y(() => {
			let e = Array.from(s.value), [t] = [...Ek.layersWithOutsidePointerEventsDisabled].slice(-1), n = e.indexOf(t);
			return c.value >= n;
		}), d = wk(async (e) => {
			let t = [...Ek.branches].some((t) => t?.contains(e.target));
			n.present && u.value && !t && (r("pointerDownOutside", e), r("interactOutside", e), await ur(), e.defaultPrevented || r("dismiss"));
		}, a, () => n.present), f = Tk((e) => {
			let t = [...Ek.branches].some((t) => t?.contains(e.target));
			n.present && !t && (r("focusOutside", e), r("interactOutside", e), e.defaultPrevented || r("dismiss"));
		}, a);
		return yO("Escape", (e) => {
			n.present && c.value === s.value.size - 1 && (r("escapeKeyDown", e), e.defaultPrevented || r("dismiss"));
		}, { target: () => o.value?.defaultView ?? globalThis.window }), Br([
			a,
			() => n.disableOutsidePointerEvents,
			() => n.present
		], ([e, t, n], r, i) => {
			if (e && n && t) {
				let t = e.ownerDocument;
				AO(t, e), Ek.layersWithOutsidePointerEventsDisabled.add(e), i(() => {
					Ek.layersWithOutsidePointerEventsDisabled.delete(e), jO(t, e);
				});
			}
		}, { immediate: !0 }), Br([a, () => n.present], ([e, t], n, r) => {
			e && t && (s.value.add(e), r(() => {
				s.value.delete(e);
			}));
		}, { immediate: !0 }), Lr((e) => {
			e(() => {
				a.value && (s.value.delete(a.value), Ek.layersWithOutsidePointerEventsDisabled.delete(a.value));
			});
		}), (t, n) => (W(), K(B(vk), {
			ref: B(i),
			"as-child": e.asChild,
			as: e.as,
			"data-dismissable-layer": "",
			style: Te({ pointerEvents: l.value ? u.value ? "auto" : "none" : void 0 }),
			onFocusCapture: B(f).onFocusCapture,
			onBlurCapture: B(f).onBlurCapture,
			onPointerdownCapture: B(d).onPointerDownCapture
		}, {
			default: V(() => [U(t.$slots, "default")]),
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
}), Ok = ZD(() => /* @__PURE__ */ z([]));
function kk() {
	let e = Ok();
	return {
		add(t) {
			let n = e.value[0];
			t !== n && n?.pause(), e.value = Ak(e.value, t), e.value.unshift(t);
		},
		remove(t) {
			e.value = Ak(e.value, t), e.value[0]?.resume();
		}
	};
}
function Ak(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
// node_modules/reka-ui/dist/FocusScope/utils.js
var jk = "focusScope.autoFocusOnMount", Mk = "focusScope.autoFocusOnUnmount", Nk = {
	bubbles: !1,
	cancelable: !0
};
function Pk(e, t) {
	let n = t;
	for (; n;) {
		if (e.contains(n)) return !0;
		n = n.getRootNode().host ?? null;
	}
	return !1;
}
function Fk(e, { select: t = !1 } = {}) {
	let n = qD();
	for (let r of e) if (Vk(r, { select: t }), qD() !== n) return !0;
}
function Ik(e) {
	let t = Lk(e);
	return [Rk(t, e), Rk(t.reverse(), e)];
}
function Lk(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t.sort((e, t) => e.tabIndex === t.tabIndex ? 0 : e.tabIndex === 0 ? 1 : t.tabIndex === 0 ? -1 : e.tabIndex - t.tabIndex);
}
function Rk(e, t) {
	for (let n of e) if (!zk(n, { upTo: t })) return n;
}
function zk(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function Bk(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function Vk(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = qD();
		e.focus({ preventScroll: !0 }), e !== n && Bk(e) && t && e.select();
	}
}
// node_modules/reka-ui/dist/FocusScope/FocusScope.js
var Hk = /* @__PURE__ */ H({
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
		let n = e, r = t, { currentRef: i, currentElement: a } = qO(), o = /* @__PURE__ */ z(null), s = kk(), c = /*#__PURE__*/ ln({
			paused: !1,
			pause() {
				this.paused = !0;
			},
			resume() {
				this.paused = !1;
			}
		});
		Lr((e) => {
			if (!QD) return;
			let t = a.value;
			if (!n.trapped) return;
			let r = t?.ownerDocument ?? document, i = t ? t.getRootNode() : r;
			function s(e) {
				if (c.paused || !t) return;
				let n = e.target;
				t.contains(n) ? o.value = n : Vk(o.value, { select: !0 });
			}
			function l(e) {
				if (c.paused || !t) return;
				let n = e.relatedTarget;
				n !== null && (t.contains(n) || Vk(o.value, { select: !0 }));
			}
			function u(e) {
				let n = o.value;
				if (n === null || !e.some((e) => e.removedNodes.length > 0)) return;
				let r = qD();
				r && t.contains(r) || t.contains(n) || Vk(t);
			}
			function d(e) {
				if (c.paused || !t) return;
				let n = e.composedPath()[0];
				Pk(t, n) || Vk(o.value, { select: !0 });
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
			let n = new CustomEvent(jk, Nk), i = (e) => r("mountAutoFocus", e);
			e.addEventListener(jk, i), e.dispatchEvent(n), e.removeEventListener(jk, i), n.defaultPrevented || (Fk(Lk(e), { select: !0 }), qD() === t && Vk(e));
		}
		Lr(async (e) => {
			let t = a.value;
			if (await ur(), !t) return;
			n.present !== !1 && s.add(c);
			let i = qD();
			!t.contains(i) && n.present !== !1 && l(t, i), e(() => {
				let e = new CustomEvent(Mk, Nk), n = (e) => {
					r("unmountAutoFocus", e);
				};
				t.addEventListener(Mk, n), t.dispatchEvent(e), t.setAttribute("data-focus-scope-unmounting", ""), setTimeout(() => {
					e.defaultPrevented || Vk(i ?? document.body, { select: !0 }), t.removeEventListener(Mk, n), s.remove(c), t.removeAttribute("data-focus-scope-unmounting");
				}, 0);
			});
		}), Br(() => n.present, async (e, t) => {
			if (!QD) return;
			if (e === !1 && t === !0) {
				s.remove(c);
				return;
			}
			if (e !== !0 || t !== !1) return;
			s.add(c), await ur();
			let n = a.value;
			if (!n) return;
			let r = qD();
			n.contains(r) || l(n, r);
		});
		function u(e) {
			if (!n.loop && !n.trapped || c.paused) return;
			let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, r = qD();
			if (t && r) {
				let t = e.currentTarget, [i, a] = Ik(t);
				i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n.loop && Vk(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n.loop && Vk(a, { select: !0 })) : r === t && e.preventDefault();
			}
		}
		return (t, n) => (W(), K(B(vk), {
			ref_key: "currentRef",
			ref: i,
			tabindex: "-1",
			"as-child": e.asChild,
			as: e.as,
			onKeydown: u
		}, {
			default: V(() => [U(t.$slots, "default")]),
			_: 3
		}, 8, ["as-child", "as"]));
	}
}), Uk = "menu.itemSelect", Wk = ["Enter", " "], Gk = [
	"ArrowDown",
	"PageUp",
	"Home"
], Kk = [
	"ArrowUp",
	"PageDown",
	"End"
], qk = [...Gk, ...Kk];
[...Wk], [...Wk];
function Jk(e) {
	return e ? "open" : "closed";
}
function Yk(e) {
	let { onEntryFocus: t, onEntryFocusOnce: n, ...r } = e;
	return r;
}
function Xk(e) {
	let t = qD();
	for (let n of e) if (n === t || (n.focus(), qD() !== t)) return;
}
function Zk(e, t) {
	let { x: n, y: r } = e, i = !1;
	for (let e = 0, a = t.length - 1; e < t.length; a = e++) {
		let o = t[e].x, s = t[e].y, c = t[a].x, l = t[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
function Qk(e, t) {
	return t ? Zk({
		x: e.clientX,
		y: e.clientY
	}, t) : !1;
}
function $k(e) {
	return e.pointerType === "mouse";
}
// node_modules/reka-ui/dist/Teleport/Teleport.js
var eA = /* @__PURE__ */ H({
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
		let t = e, n = DO({}), r = Y(() => t.to ?? n.teleportTo?.value ?? "body"), i = gO();
		return (t, n) => B(i) || e.forceMount ? (W(), K(ti, {
			key: 0,
			to: r.value,
			disabled: e.disabled,
			defer: e.defer
		}, [U(t.$slots, "default")], 8, [
			"to",
			"disabled",
			"defer"
		])) : Vs("v-if", !0);
	}
}), tA = "data-reka-collection-item";
function nA(e = {}) {
	let { key: t = "", isProvider: n = !1 } = e, r = `${t}CollectionProvider`, i;
	n ? (i = {
		collectionRef: /* @__PURE__ */ z(),
		itemMap: /* @__PURE__ */ z(/* @__PURE__ */ new Map())
	}, Mr(r, i)) : i = Nr(r);
	let a = (e, t = !1) => {
		if (!i.collectionRef.value) return;
		let n = i.itemMap.value.get(e);
		return n && (t || n.ref.dataset.disabled !== "") ? n : void 0;
	}, o = (e = !1) => {
		let t = i.collectionRef.value;
		if (!t) return [];
		let n = Array.from(t.querySelectorAll(`[${tA}]`)), r = new Map(n.map((e, t) => [e, t])), a = Array.from(i.itemMap.value.values()).sort((e, t) => (r.get(e.ref) ?? -1) - (r.get(t.ref) ?? -1));
		return e ? a : a.filter((e) => e.ref.dataset.disabled !== "");
	}, s = /*#__PURE__*/ H({
		name: "CollectionSlot",
		inheritAttrs: !1,
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = yk();
			return Br(a, () => {
				i.collectionRef.value = a.value;
			}), () => vc(gk, {
				ref: r,
				...n
			}, t);
		}
	}), c = /*#__PURE__*/ H({
		name: "CollectionItem",
		inheritAttrs: !1,
		props: { value: { validator: () => !0 } },
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = yk();
			return Lr((t) => {
				if (a.value) {
					let n = vn(a.value);
					i.itemMap.value.set(n, {
						ref: a.value,
						value: e.value
					}), t(() => i.itemMap.value.delete(n));
				}
			}), () => vc(gk, {
				...n,
				[tA]: "",
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
var rA = /* @__PURE__ */ H({
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
		return (t, n) => (W(), K(B(vk), {
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
			default: V(() => [U(t.$slots, "default")]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"aria-hidden",
			"data-hidden",
			"tabindex"
		]));
	}
}), iA = "rovingFocusGroup.onEntryFocus", aA = {
	bubbles: !1,
	cancelable: !0
};
function oA(e, t = !1) {
	let n = qD();
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), qD() !== n)) return;
}
// node_modules/reka-ui/dist/Popper/PopperRoot.js
var [sA, cA] = /*#__PURE__*/ KD("PopperRoot"), lA = /* @__PURE__ */ H({
	inheritAttrs: !1,
	__name: "PopperRoot",
	setup(e) {
		let t = /* @__PURE__ */ z();
		return cA({
			anchor: t,
			onAnchorChange: (e) => t.value = e
		}), (e, t) => U(e.$slots, "default");
	}
}), uA = /* @__PURE__ */ H({
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
		let t = e, { forwardRef: n, currentElement: r } = qO(), i = sA();
		return Rr(() => {
			i.onAnchorChange(t.reference ?? r.value);
		}), (t, r) => (W(), K(B(vk), {
			ref: B(n),
			as: e.as,
			"as-child": e.asChild
		}, {
			default: V(() => [U(t.$slots, "default")]),
			_: 3
		}, 8, ["as", "as-child"]));
	}
});
// node_modules/reka-ui/dist/Popper/utils.js
function dA(e) {
	return e !== null;
}
function fA(e) {
	return {
		name: "transformOrigin",
		options: e,
		fn(t) {
			let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = pA(n), u = {
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
function pA(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var mA = [
	"top",
	"right",
	"bottom",
	"left"
], hA = Math.min, gA = Math.max, _A = Math.round, vA = Math.floor, yA = (e) => ({
	x: e,
	y: e
}), bA = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function xA(e, t, n) {
	return gA(e, hA(t, n));
}
function SA(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function CA(e) {
	return e.split("-")[0];
}
function wA(e) {
	return e.split("-")[1];
}
function TA(e) {
	return e === "x" ? "y" : "x";
}
function EA(e) {
	return e === "y" ? "height" : "width";
}
function DA(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function OA(e) {
	return TA(DA(e));
}
function kA(e, t, n) {
	n === void 0 && (n = !1);
	let r = wA(e), i = OA(e), a = EA(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = RA(o)), [o, RA(o)];
}
function AA(e) {
	let t = RA(e);
	return [
		jA(e),
		t,
		jA(t)
	];
}
function jA(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var MA = ["left", "right"], NA = ["right", "left"], PA = ["top", "bottom"], FA = ["bottom", "top"];
function IA(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? NA : MA : t ? MA : NA;
		case "left":
		case "right": return t ? PA : FA;
		default: return [];
	}
}
function LA(e, t, n, r) {
	let i = wA(e), a = IA(CA(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(jA)))), a;
}
function RA(e) {
	let t = CA(e);
	return bA[t] + e.slice(t.length);
}
function zA(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function BA(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : zA(e);
}
function VA(e) {
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
function HA(e, t, n) {
	let { reference: r, floating: i } = e, a = DA(t), o = OA(t), s = EA(o), c = CA(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = wA(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function UA(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = SA(t, e), p = BA(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = VA(await i.getClippingRect({
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
	}, y = VA(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var WA = 50, GA = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: UA
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = HA(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < WA && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = HA(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, KA = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = SA(e, t) || {};
		if (l == null) return {};
		let d = BA(u), f = {
			x: n,
			y: r
		}, p = OA(i), m = EA(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		C && await (o.isElement == null ? void 0 : o.isElement(S)) || (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = hA(d[_], T), D = hA(d[v], T), O = C - h[m] - D, k = C / 2 - h[m] / 2 + w, ee = xA(E, k, O), te = !c.arrow && wA(i) != null && k !== ee && a.reference[m] / 2 - (k < E ? E : D) - h[m] / 2 < 0, ne = te ? k < E ? k - E : k - O : 0;
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
}), qA = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = SA(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = CA(r), _ = DA(o), v = CA(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [RA(o)] : AA(o)), x = p !== "none";
			!d && x && b.push(...LA(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = kA(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === DA(t) || T.every((e) => DA(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = DA(e.placement);
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
function JA(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function YA(e) {
	return mA.some((t) => e[t] >= 0);
}
var XA = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = SA(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = JA(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: YA(e)
					} };
				}
				case "escaped": {
					let e = JA(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: YA(e)
					} };
				}
				default: return {};
			}
		}
	};
}, ZA = /*#__PURE__*/ new Set(["left", "top"]);
async function QA(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = CA(n), s = wA(n), c = DA(n) === "y", l = ZA.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = SA(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var $A = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await QA(t, e);
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
}, ej = function(e) {
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
			} }, ...l } = SA(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = DA(i), p = TA(f), m = u[p], h = u[f], g = (e, t) => xA(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, tj = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = SA(e, t), u = {
				x: n,
				y: r
			}, d = DA(i), f = TA(d), p = u[f], m = u[d], h = SA(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = ZA.has(CA(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, nj = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = SA(e, t), c = await i.detectOverflow(t, s), l = CA(n), u = wA(n), d = DA(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = hA(p - c[m], g), y = hA(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * gA(c.left, c.right) : S = p - 2 * gA(c.top, c.bottom)), await o({
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
function rj() {
	return typeof window < "u";
}
function ij(e) {
	return sj(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function aj(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function oj(e) {
	return ((sj(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function sj(e) {
	return rj() ? e instanceof Node || e instanceof aj(e).Node : !1;
}
function cj(e) {
	return rj() ? e instanceof Element || e instanceof aj(e).Element : !1;
}
function lj(e) {
	return rj() ? e instanceof HTMLElement || e instanceof aj(e).HTMLElement : !1;
}
function uj(e) {
	return !rj() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof aj(e).ShadowRoot;
}
function dj(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Sj(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function fj(e) {
	return /^(table|td|th)$/.test(ij(e));
}
function pj(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var mj = /transform|translate|scale|rotate|perspective|filter/, hj = /paint|layout|strict|content/, gj = (e) => !!e && e !== "none", _j;
function vj(e) {
	let t = cj(e) ? Sj(e) : e;
	return gj(t.transform) || gj(t.translate) || gj(t.scale) || gj(t.rotate) || gj(t.perspective) || !bj() && (gj(t.backdropFilter) || gj(t.filter)) || mj.test(t.willChange || "") || hj.test(t.contain || "");
}
function yj(e) {
	let t = wj(e);
	for (; lj(t) && !xj(t);) {
		if (vj(t)) return t;
		if (pj(t)) return null;
		t = wj(t);
	}
	return null;
}
function bj() {
	return _j ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), _j;
}
function xj(e) {
	return /^(html|body|#document)$/.test(ij(e));
}
function Sj(e) {
	return aj(e).getComputedStyle(e);
}
function Cj(e) {
	return cj(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function wj(e) {
	if (ij(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || uj(e) && e.host || oj(e);
	return uj(t) ? t.host : t;
}
function Tj(e) {
	let t = wj(e);
	return xj(t) ? (e.ownerDocument || e).body : lj(t) && dj(t) ? t : Tj(t);
}
function Ej(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Tj(e), i = r === e.ownerDocument?.body, a = aj(r);
	if (i) {
		let e = Dj(a);
		return t.concat(a, a.visualViewport || [], dj(r) ? r : [], e && n ? Ej(e) : []);
	}
	return t.concat(r, Ej(r, [], n));
}
function Dj(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Oj(e) {
	let t = Sj(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = lj(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = _A(n) !== a || _A(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function kj(e) {
	return cj(e) ? e : e.contextElement;
}
function Aj(e) {
	let t = kj(e);
	if (!lj(t)) return yA(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Oj(t), o = (a ? _A(n.width) : n.width) / r, s = (a ? _A(n.height) : n.height) / i;
	return o && Number.isFinite(o) || (o = 1), s && Number.isFinite(s) || (s = 1), {
		x: o,
		y: s
	};
}
var jj = /*#__PURE__*/ yA(0);
function Mj(e) {
	let t = aj(e);
	return !bj() || !t.visualViewport ? jj : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Nj(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === aj(e);
}
function Pj(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = kj(e), o = yA(1);
	t && (r ? cj(r) && (o = Aj(r)) : o = Aj(e));
	let s = Nj(a, n, r) ? Mj(a) : yA(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = aj(a), t = cj(r) ? aj(r) : r, n = e, i = Dj(n);
		for (; i && t !== n;) {
			let e = Aj(i), t = i.getBoundingClientRect(), r = Sj(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = aj(i), i = Dj(n);
		}
	}
	return VA({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Fj(e, t) {
	let n = Cj(e).scrollLeft;
	return t ? t.left + n : Pj(oj(e)).left + n;
}
function Ij(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Fj(e, n),
		y: n.top + t.scrollTop
	};
}
function Lj(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = oj(r), s = t ? pj(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = yA(1), u = yA(0), d = lj(r);
	if ((d || !a) && ((ij(r) !== "body" || dj(o)) && (c = Cj(r)), d)) {
		let e = Pj(r);
		l = Aj(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Ij(o, c) : yA(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Rj(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function zj(e) {
	let t = Cj(e), n = e.ownerDocument.body, r = gA(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = gA(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + Fj(e), o = -t.scrollTop;
	return Sj(n).direction === "rtl" && (a += gA(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var Bj = 25;
function Vj(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = aj(e), a = oj(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !bj() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (Fj(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= Bj && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function Hj(e, t) {
	let n = Pj(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Aj(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function Uj(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = Vj(e, n, t);
	else if (t === "document") r = zj(oj(e));
	else if (cj(t)) r = Hj(t, n);
	else {
		let n = Mj(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return VA(r);
}
function Wj(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Ej(e, [], !1).filter((e) => cj(e) && ij(e) !== "body"), i = null, a = Sj(e).position === "fixed", o = a ? wj(e) : e;
	for (; cj(o) && !xj(o);) {
		let e = Sj(o), t = vj(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = wj(o);
	}
	return t.set(e, r), r;
}
function Gj(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? pj(t) ? [] : Wj(t, this._c) : [].concat(n), r], o = Uj(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = Uj(t, a[e], i);
		s = gA(n.top, s), c = hA(n.right, c), l = hA(n.bottom, l), u = gA(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Kj(e) {
	let { width: t, height: n } = Oj(e);
	return {
		width: t,
		height: n
	};
}
function qj(e, t, n) {
	let r = lj(t), i = oj(t), a = n === "fixed", o = Pj(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = yA(0);
	if ((r || !a) && ((ij(t) !== "body" || dj(i)) && (s = Cj(t)), r)) {
		let e = Pj(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = Fj(i));
	let l = i && !r && !a ? Ij(i, s) : yA(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function Jj(e) {
	return Sj(e).position === "static";
}
function Yj(e, t) {
	if (!lj(e) || Sj(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return oj(e) === n && (n = n.ownerDocument.body), n;
}
function Xj(e, t) {
	let n = aj(e);
	if (pj(e)) return n;
	if (!lj(e)) {
		let t = wj(e);
		for (; t && !xj(t);) {
			if (cj(t) && !Jj(t)) return t;
			t = wj(t);
		}
		return n;
	}
	let r = Yj(e, t);
	for (; r && fj(r) && Jj(r);) r = Yj(r, t);
	return r && xj(r) && Jj(r) && !vj(r) ? n : r || yj(e) || n;
}
var Zj = async function(e) {
	let t = this.getOffsetParent || Xj, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: qj(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Qj(e) {
	return Sj(e).direction === "rtl";
}
var $j = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Lj,
	getDocumentElement: oj,
	getClippingRect: Gj,
	getOffsetParent: Xj,
	getElementRects: Zj,
	getClientRects: Rj,
	getDimensions: Kj,
	getScale: Aj,
	isElement: cj,
	isRTL: Qj
};
function eM(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function tM(e, t, n) {
	let r = null, i, a = oj(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = vA(d), h = vA(a.clientWidth - (u + f)), g = vA(a.clientHeight - (d + p)), _ = vA(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: gA(0, hA(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!eM(l, e.getBoundingClientRect())) return s();
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
	let c = aj(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function nM(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = kj(e), u = i || a ? [...l ? Ej(l) : [], ...t ? Ej(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? tM(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? Pj(e) : null;
	c && g();
	function g() {
		let t = Pj(e);
		h && !eM(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var rM = $A, iM = ej, aM = qA, oM = nj, sM = XA, cM = KA, lM = tj, uM = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...$j,
		...i.platform,
		_c: r
	};
	return GA(e, t, {
		...i,
		platform: a
	});
};
// node_modules/@floating-ui/vue/dist/floating-ui.vue.mjs
function dM(e) {
	return typeof e == "object" && !!e && "$el" in e;
}
function fM(e) {
	if (dM(e)) {
		let t = e.$el;
		return sj(t) && ij(t) === "#comment" ? null : t;
	}
	return e;
}
function pM(e) {
	return {
		name: "arrow",
		options: e,
		fn(t) {
			let n = fM(En(e.element));
			return n == null ? {} : cM({
				element: n,
				padding: e.padding
			}).fn(t);
		}
	};
}
function mM(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function hM(e, t) {
	let n = mM(e);
	return Math.round(t * n) / n;
}
function gM(e, t, n) {
	n === void 0 && (n = {});
	let r = n.whileElementsMounted, i = Y(() => En(n.open) ?? !0), a = Y(() => En(n.middleware)), o = Y(() => En(n.placement) ?? "bottom"), s = Y(() => En(n.strategy) ?? "absolute"), c = Y(() => En(n.transform) ?? !0), l = Y(() => fM(e.value)), u = Y(() => fM(t.value)), d = /* @__PURE__ */ z(0), f = /* @__PURE__ */ z(0), p = /* @__PURE__ */ z(s.value), m = /* @__PURE__ */ z(o.value), h = /* @__PURE__ */ Sn({}), g = /* @__PURE__ */ z(!1), _ = Y(() => {
		let e = {
			position: p.value,
			left: "0",
			top: "0"
		};
		if (!u.value) return e;
		let t = hM(u.value, d.value), n = hM(u.value, f.value);
		return c.value ? {
			...e,
			transform: "translate(" + t + "px, " + n + "px)",
			...mM(u.value) >= 1.5 && { willChange: "transform" }
		} : {
			position: p.value,
			left: t + "px",
			top: n + "px"
		};
	}), v;
	function y() {
		if (l.value == null || u.value == null) return;
		let e = i.value;
		uM(l.value, u.value, {
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
	return Br([
		a,
		o,
		s,
		i
	], y, { flush: "sync" }), Br([l, u], x, { flush: "sync" }), Br(i, S, { flush: "sync" }), qe() && Je(b), {
		x: /* @__PURE__ */ fn(d),
		y: /* @__PURE__ */ fn(f),
		strategy: /* @__PURE__ */ fn(p),
		placement: /* @__PURE__ */ fn(m),
		middlewareData: /* @__PURE__ */ fn(h),
		isPositioned: /* @__PURE__ */ fn(g),
		floatingStyles: _,
		update: y
	};
}
// node_modules/reka-ui/dist/Popper/PopperContent.js
var _M = ["dir"], vM = {
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
}, [yM, bM] = /*#__PURE__*/ KD("PopperContent"), xM = /* @__PURE__ */ H({
	inheritAttrs: !1,
	__name: "PopperContent",
	props: /* @__PURE__ */ Ja({
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
	}, { ...vM }),
	emits: ["placed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = sA(), { forwardRef: a, currentElement: o } = qO(), s = VO(Y(() => n.dir)), c = /* @__PURE__ */ z(), l = /* @__PURE__ */ z(), { width: u, height: d } = ck(l), f = Y(() => n.side + (n.align === "center" ? "" : `-${n.align}`)), p = Y(() => typeof n.collisionPadding == "number" ? n.collisionPadding : {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			...n.collisionPadding
		}), m = Y(() => Array.isArray(n.collisionBoundary) ? n.collisionBoundary : [n.collisionBoundary]), h = Y(() => ({
			padding: p.value,
			boundary: m.value.filter(dA),
			altBoundary: m.value.length > 0
		})), g = Y(() => ({
			mainAxis: n.sideFlip,
			crossAxis: n.alignFlip
		})), _ = Y(() => [
			rM({
				mainAxis: n.sideOffset + d.value,
				alignmentAxis: n.alignOffset
			}),
			n.prioritizePosition && n.avoidCollisions && aM({
				...h.value,
				...g.value
			}),
			n.avoidCollisions && iM({
				mainAxis: !0,
				crossAxis: !!n.prioritizePosition,
				limiter: n.sticky === "partial" ? lM() : void 0,
				...h.value
			}),
			!n.prioritizePosition && n.avoidCollisions && aM({
				...h.value,
				...g.value
			}),
			oM({
				...h.value,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--reka-popper-available-width", `${n}px`), o.setProperty("--reka-popper-available-height", `${r}px`), o.setProperty("--reka-popper-anchor-width", `${i}px`), o.setProperty("--reka-popper-anchor-height", `${a}px`);
				}
			}),
			l.value && pM({
				element: l.value,
				padding: n.arrowPadding
			}),
			fA({
				arrowWidth: u.value,
				arrowHeight: d.value,
				dir: s.value
			}),
			n.hideWhenDetached && sM({
				strategy: "referenceHidden",
				...h.value
			})
		]), { floatingStyles: v, placement: y, isPositioned: b, middlewareData: x, update: S } = gM(Y(() => n.reference ?? i.anchor.value), c, {
			strategy: n.positionStrategy,
			placement: f,
			whileElementsMounted: (...e) => nM(...e, {
				layoutShift: !n.disableUpdateOnLayoutShift,
				animationFrame: n.updatePositionStrategy === "always"
			}),
			middleware: _
		}), C = Y(() => pA(y.value)[0]), w = Y(() => pA(y.value)[1]);
		Rr(() => {
			b.value && r("placed");
		});
		let T = Y(() => {
			let e = x.value.arrow?.centerOffset !== 0;
			return n.hideShiftedArrow && e;
		}), E = /* @__PURE__ */ z("");
		return Lr(() => {
			o.value && (E.value = window.getComputedStyle(o.value).zIndex);
		}), bM({
			placedSide: C,
			onArrowChange: (e) => l.value = e,
			arrowX: Y(() => x.value.arrow?.x ?? 0),
			arrowY: Y(() => x.value.arrow?.y ?? 0),
			shouldHideArrow: T
		}), (e, t) => (W(), G("div", {
			ref_key: "floatingRef",
			ref: c,
			"data-reka-popper-content-wrapper": "",
			dir: B(s),
			style: Te({
				...B(v),
				transform: B(b) ? B(v).transform : "translate(0, -200%)",
				minWidth: "max-content",
				zIndex: E.value,
				"--reka-popper-transform-origin": [B(x).transformOrigin?.x, B(x).transformOrigin?.y].join(" "),
				...B(x).hide?.referenceHidden && {
					visibility: "hidden",
					pointerEvents: "none"
				}
			})
		}, [n.memoDependencies ? bc([
			n.asChild,
			n.as,
			C.value,
			w.value,
			B(b),
			...Object.values(e.$attrs),
			...n.memoDependencies
		], () => (W(), K(B(vk), Gs({
			key: 0,
			ref: B(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			style: { animation: B(b) ? void 0 : "none" }
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"style"
		])), t, 0) : (W(), K(B(vk), Gs({
			key: 1,
			ref: B(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			dir: B(s),
			style: { animation: B(b) ? void 0 : "none" }
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"dir",
			"style"
		]))], 12, _M));
	}
});
// node_modules/reka-ui/dist/shared/useNonce.js
function SM(e) {
	let t = DO({ nonce: /* @__PURE__ */ z() });
	return Y(() => e?.value || t.nonce?.value);
}
// node_modules/reka-ui/dist/RovingFocus/RovingFocusGroup.js
var [CM, wM] = /*#__PURE__*/ KD("RovingFocusGroup"), TM = /* @__PURE__ */ H({
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
		let r = e, i = n, { loop: a, orientation: o, dir: s } = /* @__PURE__ */ jn(r), c = VO(s), l = SO(r, "currentTabStopId", i, {
			defaultValue: r.defaultCurrentTabStopId,
			passive: r.currentTabStopId === void 0
		}), u = /* @__PURE__ */ z(!1), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ z(0), { getItems: p, CollectionSlot: m } = nA({ isProvider: !0 });
		function h(e) {
			let t = !d.value;
			if (e.currentTarget && e.target === e.currentTarget && t && !u.value) {
				let t = new CustomEvent(iA, aA);
				if (e.currentTarget.dispatchEvent(t), i("entryFocus", t), !t.defaultPrevented) {
					let e = p().map((e) => e.ref).filter((e) => e.dataset.disabled !== "");
					oA([
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
		return t({ getItems: p }), wM({
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
		}), (t, n) => (W(), K(B(m), null, {
			default: V(() => [J(B(vk), {
				tabindex: u.value || f.value === 0 ? -1 : 0,
				"data-orientation": B(o),
				as: e.as,
				"as-child": e.asChild,
				dir: B(c),
				style: { outline: "none" },
				onMousedown: n[0] ||= (e) => d.value = !0,
				onMouseup: g,
				onFocus: h,
				onBlur: n[1] ||= (e) => u.value = !1
			}, {
				default: V(() => [U(t.$slots, "default")]),
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
}), [EM, DM] = /*#__PURE__*/ KD("FieldRoot"), OM = /* @__PURE__ */ H({
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
		return (e, n) => (W(), K(B(uA), je(Ls(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
});
// node_modules/reka-ui/dist/shared/useIsUsingKeyboard.js
function kM() {
	let e = /* @__PURE__ */ z(!1);
	return da(() => {
		hO("keydown", () => {
			e.value = !0;
		}, {
			capture: !0,
			passive: !0
		}), hO(["pointerdown", "pointermove"], () => {
			e.value = !1;
		}, {
			capture: !0,
			passive: !0
		});
	}), e;
}
var AM = oO(kM), [jM, MM] = /*#__PURE__*/ KD(["MenuRoot", "MenuSub"], "MenuContext"), [NM, PM] = /*#__PURE__*/ KD("MenuRoot"), FM = /* @__PURE__ */ H({
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
		let n = e, r = t, { modal: i, dir: a } = /* @__PURE__ */ jn(n), o = VO(a), s = SO(n, "open", r), c = /* @__PURE__ */ z(), l = AM();
		return MM({
			open: s,
			onOpenChange: (e) => {
				s.value = e;
			},
			content: c,
			onContentChange: (e) => {
				c.value = e;
			}
		}), PM({
			onClose: () => {
				s.value = !1;
			},
			isUsingKeyboardRef: l,
			dir: o,
			modal: i
		}), (e, t) => (W(), K(B(lA), null, {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}));
	}
}), [IM, LM] = /*#__PURE__*/ KD("MenuContent"), RM = /* @__PURE__ */ H({
	__name: "MenuContentImpl",
	props: /* @__PURE__ */ Ja({
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
	}, { ...vM }),
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
		let n = e, r = t, i = jM(), a = NM(), { trapFocus: o, disableOutsidePointerEvents: s, loop: c } = /* @__PURE__ */ jn(n);
		WO(), RO(s.value);
		let l = /* @__PURE__ */ z(""), u = /* @__PURE__ */ z(0), d = /* @__PURE__ */ z(0), f = /* @__PURE__ */ z(null), p = /* @__PURE__ */ z("right"), m = /* @__PURE__ */ z(0), h = /* @__PURE__ */ z(null), g = /* @__PURE__ */ z(), { forwardRef: _, currentElement: v } = qO(), { handleTypeaheadSearch: y } = uk(), b = /* @__PURE__ */ z();
		function x(e) {
			let t = TO(e, b.value || qD(), v.value, {
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
		let C = /* @__PURE__ */ z(), w = /* @__PURE__ */ z();
		Br(b, (e) => {
			if (w.value && (e === void 0 || e !== w.value.trigger.value)) {
				if (e === void 0) return;
				w.value.onOpenChange(!1), w.value = void 0;
			}
		}), Br(v, (e) => {
			i.onContentChange(e);
		}), ha(() => {
			window.clearTimeout(u.value);
		});
		function T(e) {
			return p.value === f.value?.side && Qk(e, f.value?.area);
		}
		async function E(e) {
			r("openAutoFocus", e), !e.defaultPrevented && (e.preventDefault(), v.value?.focus({ preventScroll: !0 }));
		}
		function D(e) {
			if (e.defaultPrevented) return;
			let t = e.target, n = t.closest("[data-reka-menu-content]") === e.currentTarget, r = ["input", "textarea"].includes(t.tagName.toLowerCase()), i = e.ctrlKey || e.altKey || e.metaKey, o = e.key.length === 1, s = TO(e, qD(), v.value, {
				loop: c.value,
				arrowKeyOptions: "vertical",
				dir: a?.dir.value,
				focus: !0,
				attributeName: "[data-reka-collection-item]:not([data-disabled])"
			});
			if (s) return s?.focus();
			if (e.code === "Space") return;
			let l = g.value?.getItems() ?? [];
			if (n && (e.key === "Tab" && a.modal.value && e.preventDefault(), !i && o && !r && y(e.key, l)), e.target !== v.value || !qk.includes(e.key)) return;
			e.preventDefault();
			let u = [...l.map((e) => e.ref)];
			Kk.includes(e.key) && u.reverse(), Xk(u);
		}
		function O(e) {
			e?.currentTarget?.contains?.(e.target) || (window.clearTimeout(u.value), l.value = "");
		}
		function k(e) {
			if (!$k(e)) return;
			let t = e.target, n = m.value !== e.clientX;
			if ((e?.currentTarget)?.contains(t) && n) {
				let t = e.clientX > m.value ? "right" : "left";
				p.value = t, m.value = e.clientX;
			}
		}
		function ee(e) {
			$k(e) && C.value && C.value.focus();
		}
		return LM({
			onItemEnter: (e) => !!T(e),
			onItemLeave: (e) => T(e) ? !0 : (["INPUT", "TEXTAREA"].includes(qD()?.tagName || "") || v.value?.focus(), h.value = null, !1),
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
		}), (t, n) => (W(), K(B(Hk), {
			"as-child": "",
			trapped: B(o),
			onMountAutoFocus: E,
			onUnmountAutoFocus: n[7] ||= (e) => r("closeAutoFocus", e)
		}, {
			default: V(() => [J(B(Dk), {
				"as-child": "",
				"disable-outside-pointer-events": B(s),
				onEscapeKeyDown: n[2] ||= (e) => r("escapeKeyDown", e),
				onPointerDownOutside: n[3] ||= (e) => r("pointerDownOutside", e),
				onFocusOutside: n[4] ||= (e) => r("focusOutside", e),
				onInteractOutside: n[5] ||= (e) => r("interactOutside", e),
				onDismiss: n[6] ||= (e) => r("dismiss")
			}, {
				default: V(() => [J(B(TM), {
					ref_key: "rovingFocusGroupRef",
					ref: g,
					"current-tab-stop-id": h.value,
					"onUpdate:currentTabStopId": n[0] ||= (e) => h.value = e,
					"as-child": "",
					orientation: "vertical",
					dir: B(a).dir.value,
					loop: B(c),
					onEntryFocus: n[1] ||= (e) => {
						r("entryFocus", e), B(a).isUsingKeyboardRef.value || e.preventDefault();
					}
				}, {
					default: V(() => [J(B(xM), {
						ref: B(_),
						role: "menu",
						as: e.as,
						"as-child": e.asChild,
						"aria-orientation": "vertical",
						"data-reka-menu-content": "",
						"data-state": B(Jk)(B(i).open.value),
						dir: B(a).dir.value,
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
						onBlur: O,
						onPointermove: k,
						onPointerenter: ee
					}, {
						default: V(() => [U(t.$slots, "default")]),
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
}), zM = /* @__PURE__ */ H({
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
		let t = e, n = IM(), { forwardRef: r, currentElement: i } = qO(), { CollectionItem: a } = nA(), o = /* @__PURE__ */ z(!1), s = Y(() => o.value || i.value != null && n.highlightedElement.value === i.value);
		async function c(e) {
			if (!e.defaultPrevented && $k(e)) {
				if (t.disabled) n.onItemLeave(e);
				else if (!n.onItemEnter(e)) {
					let t = e.currentTarget;
					n.highlightedElement.value = t, ["INPUT", "TEXTAREA"].includes(qD()?.tagName || "") || t.focus({ preventScroll: !0 });
				}
			}
		}
		async function l(e) {
			await ur(), !e.defaultPrevented && $k(e) && n.highlightedElement.value === i.value && !n.onItemLeave(e) && n.highlightedElement.value === i.value && (n.highlightedElement.value = void 0);
		}
		return (t, i) => (W(), K(B(a), { value: { textValue: e.textValue } }, {
			default: V(() => [J(B(vk), Gs({
				ref: B(r),
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
					await ur(), !(t.defaultPrevented || e.disabled) && (o.value = !0, B(n).highlightedElement.value = r);
				},
				onBlur: i[1] ||= async (e) => {
					await ur(), !e.defaultPrevented && (o.value = !1);
				}
			}), {
				default: V(() => [U(t.$slots, "default")]),
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
}), BM = /* @__PURE__ */ H({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = qO(), o = NM(), s = IM(), c = /* @__PURE__ */ z(!1);
		async function l() {
			let e = a.value;
			if (!n.disabled && e) {
				let e = new CustomEvent(Uk, {
					bubbles: !0,
					cancelable: !0
				});
				r("select", e), await ur(), e.defaultPrevented ? c.value = !1 : o.onClose();
			}
		}
		return (t, r) => (W(), K(zM, Gs(n, {
			ref: B(i),
			onClick: l,
			onPointerdown: r[0] ||= () => {
				c.value = !0;
			},
			onPointerup: r[1] ||= async (e) => {
				await ur(), e.defaultPrevented || c.value || e.currentTarget?.click();
			},
			onKeydown: r[2] ||= async (t) => {
				let n = B(s).searchRef.value !== "";
				e.disabled || n && t.key === " " || B(Wk).includes(t.key) && (t.currentTarget?.click(), t.preventDefault());
			}
		}), {
			default: V(() => [U(t.$slots, "default")]),
			_: 3
		}, 16));
	}
}), VM = /* @__PURE__ */ H({
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
		let n = e, r = t, i = YO(n, r), a = jM(), { forwardRef: o, currentElement: s } = qO();
		return ak(s), (e, t) => (W(), K(RM, Gs(B(i), {
			ref: B(o),
			"trap-focus": B(a).open.value,
			"disable-outside-pointer-events": B(a).open.value,
			"disable-outside-scroll": !0,
			onDismiss: t[0] ||= (e) => B(a).onOpenChange(!1),
			onFocusOutside: t[1] ||= Ou((e) => r("focusOutside", e), ["prevent"])
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, ["trap-focus", "disable-outside-pointer-events"]));
	}
}), HM = /* @__PURE__ */ H({
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
		let n = YO(e, t), r = jM();
		return (e, t) => (W(), K(RM, Gs(B(n), {
			"trap-focus": !1,
			"disable-outside-pointer-events": !1,
			"disable-outside-scroll": !1,
			onDismiss: t[0] ||= (e) => B(r).onOpenChange(!1)
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), UM = /* @__PURE__ */ H({
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
		let n = YO(e, t), r = jM(), i = NM();
		return (t, a) => (W(), K(B(hk), { present: e.forceMount || B(r).open.value }, {
			default: V(() => [B(i).modal.value ? (W(), K(VM, je(Gs({ key: 0 }, {
				...t.$attrs,
				...B(n)
			})), {
				default: V(() => [U(t.$slots, "default")]),
				_: 3
			}, 16)) : (W(), K(HM, je(Gs({ key: 1 }, {
				...t.$attrs,
				...B(n)
			})), {
				default: V(() => [U(t.$slots, "default")]),
				_: 3
			}, 16))]),
			_: 3
		}, 8, ["present"]));
	}
}), WM = /* @__PURE__ */ H({
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
		return (e, n) => (W(), K(B(eA), je(Ls(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), [GM, KM] = /*#__PURE__*/ KD("DropdownMenuRoot"), qM = /* @__PURE__ */ H({
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
		qO();
		let i = SO(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), a = /* @__PURE__ */ z(), { modal: o, dir: s } = /* @__PURE__ */ jn(n), c = VO(s);
		return KM({
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
		}), (e, t) => (W(), K(B(FM), {
			open: B(i),
			"onUpdate:open": t[0] ||= (e) => /* @__PURE__ */ xn(i) ? i.value = e : null,
			dir: B(c),
			modal: B(o)
		}, {
			default: V(() => [U(e.$slots, "default", { open: B(i) })]),
			_: 3
		}, 8, [
			"open",
			"dir",
			"modal"
		]));
	}
}), JM = /* @__PURE__ */ H({
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
		let n = YO(e, t);
		qO();
		let r = GM(), i = /* @__PURE__ */ z(!1);
		function a(e) {
			e.defaultPrevented || (i.value || setTimeout(() => {
				r.triggerElement.value?.focus();
			}, 0), i.value = !1, e.preventDefault());
		}
		return r.contentId ||= sk(void 0, "reka-dropdown-menu-content"), (e, t) => (W(), K(B(UM), Gs({
			id: B(r).contentId,
			"aria-labelledby": B(r)?.triggerId,
			style: {
				"--reka-dropdown-menu-content-transform-origin": "var(--reka-popper-transform-origin)",
				"--reka-dropdown-menu-content-available-width": "var(--reka-popper-available-width)",
				"--reka-dropdown-menu-content-available-height": "var(--reka-popper-available-height)",
				"--reka-dropdown-menu-trigger-width": "var(--reka-popper-anchor-width)",
				"--reka-dropdown-menu-trigger-height": "var(--reka-popper-anchor-height)"
			}
		}, {
			...B(n),
			...B(Yk)(e.$attrs)
		}, {
			onCloseAutoFocus: a,
			onInteractOutside: t[0] ||= (e) => {
				if (e.defaultPrevented) return;
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, a = t.button === 2 || n;
				(!B(r).modal.value || a) && (i.value = !0), B(r).triggerElement.value?.contains(e.target) && e.preventDefault();
			}
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, ["id", "aria-labelledby"]));
	}
}), YM = /* @__PURE__ */ H({
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
		let n = e, r = HO(t);
		return qO(), (e, t) => (W(), K(B(BM), je(Ls({
			...n,
			...B(r)
		})), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), XM = /* @__PURE__ */ H({
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
		return (e, n) => (W(), K(B(WM), je(Ls(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), ZM = /* @__PURE__ */ H({
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
		let t = e, n = GM(), { forwardRef: r, currentElement: i } = qO();
		return da(() => {
			n.triggerElement = i;
		}), n.triggerId ||= sk(void 0, "reka-dropdown-menu-trigger"), (i, a) => (W(), K(B(OM), { "as-child": "" }, {
			default: V(() => [J(B(vk), {
				id: B(n).triggerId,
				ref: B(r),
				type: e.as === "button" ? "button" : void 0,
				"as-child": t.asChild,
				as: e.as,
				"aria-haspopup": "menu",
				"aria-expanded": B(n).open.value,
				"aria-controls": B(n).open.value ? B(n).contentId : void 0,
				"data-disabled": e.disabled ? "" : void 0,
				disabled: e.disabled,
				"data-state": B(n).open.value ? "open" : "closed",
				onClick: a[0] ||= async (t) => {
					t.defaultPrevented || !e.disabled && t.button === 0 && t.ctrlKey === !1 && (B(n)?.onOpenToggle(), await ur(), B(n).open.value && t.preventDefault());
				},
				onKeydown: a[1] ||= Au((t) => {
					e.disabled || t.defaultPrevented || (["Enter", " "].includes(t.key) && B(n).onOpenToggle(), t.key === "ArrowDown" && B(n).onOpenChange(!0), [
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
				default: V(() => [U(i.$slots, "default")]),
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
}), QM = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], $M = [" ", "Enter"];
function eN(e, t, n) {
	return e === void 0 ? !1 : Array.isArray(e) ? e.some((e) => tN(e, t, n)) : tN(e, t, n);
}
function tN(e, t, n) {
	return e === void 0 || t === void 0 ? !1 : typeof e == "string" ? e === t : typeof n == "function" ? n(e, t) : typeof n == "string" ? e?.[n] === t?.[n] : WD(e, t);
}
function nN(e) {
	return e == null || e === "" || Array.isArray(e) && e.length === 0;
}
// node_modules/reka-ui/dist/Select/SelectRoot.js
var rN = ["value"], [iN, aN] = /*#__PURE__*/ KD("SelectRoot"), oN = /* @__PURE__ */ H({
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
		let n = e, r = t, { multiple: i, dir: a } = /* @__PURE__ */ jn(n), o = EM(null), s = Y(() => n.name ?? o?.name.value), c = Y(() => o ? n.required || o.required.value : n.required), l = Y(() => !!(n.disabled || o?.disabled.value)), u = SO(n, "modelValue", r, {
			defaultValue: n.defaultValue ?? (i.value ? [] : void 0),
			passive: n.modelValue === void 0,
			deep: !0
		}), d = SO(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), f = /* @__PURE__ */ z(), p = /* @__PURE__ */ z(), m = /* @__PURE__ */ z({
			x: 0,
			y: 0
		}), h = Y(() => i.value && Array.isArray(u.value) ? u.value?.length === 0 : YD(u.value));
		Br(u, () => {
			o?.reportControlState({ filled: !h.value });
		}), nA({ isProvider: !0 });
		let g = VO(a), _ = KO(f), v = /* @__PURE__ */ z(/* @__PURE__ */ new Set()), y = Y(() => Array.from(v.value).map((e) => e.value).join(";"));
		function b(e) {
			let t;
			if (i.value) {
				let r = Array.isArray(u.value) ? [...u.value] : [], i = r.findIndex((t) => tN(t, e, n.by));
				i === -1 ? r.push(e) : r.splice(i, 1), t = [...r];
			} else t = e;
			u.value = t, o?.handleControlInput({ value: t });
		}
		function x(e) {
			return Array.from(v.value).find((t) => eN(e, t.value, n.by));
		}
		return aN({
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
		}), (t, n) => (W(), K(B(lA), null, {
			default: V(() => [U(t.$slots, "default", {
				modelValue: B(u),
				open: B(d)
			}), B(_) && s.value ? (W(), K(sN, {
				key: y.value,
				"aria-hidden": "true",
				tabindex: "-1",
				multiple: B(i),
				required: c.value,
				name: s.value,
				autocomplete: e.autocomplete,
				disabled: l.value,
				value: B(u)
			}, {
				default: V(() => [B(YD)(B(u)) ? (W(), G("option", {
					key: 0,
					value: e.nullableValue
				}, null, 8, rN)) : Vs("v-if", !0), (W(!0), G(xs, null, Oa(Array.from(v.value), (e) => (W(), G("option", Gs({ key: e.value ?? "" }, { ref_for: !0 }, e), null, 16))), 128))]),
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
}), sN = /* @__PURE__ */ H({
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
		let t = e, n = /* @__PURE__ */ z(), r = iN();
		Br(() => t.value, (e, t) => {
			let r = window.HTMLSelectElement.prototype, i = Object.getOwnPropertyDescriptor(r, "value").set;
			if (e !== t && i && n.value) {
				let t = new Event("change", { bubbles: !0 });
				i.call(n.value, e), n.value.dispatchEvent(t);
			}
		});
		function i(e) {
			r.onValueChange(e.target.value);
		}
		return (e, r) => (W(), K(B(rA), { "as-child": "" }, {
			default: V(() => [q("select", Gs({
				ref_key: "selectElement",
				ref: n
			}, t, { onInput: i }), [U(e.$slots, "default")], 16)]),
			_: 3
		}));
	}
}), cN = /* @__PURE__ */ H({
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
		let t = JO(e);
		return (e, n) => (W(), K(B(xM), Gs(B(t), { style: {
			boxSizing: "border-box",
			"--reka-select-content-transform-origin": "var(--reka-popper-transform-origin)",
			"--reka-select-content-available-width": "var(--reka-popper-available-width)",
			"--reka-select-content-available-height": "var(--reka-popper-available-height)",
			"--reka-select-trigger-width": "var(--reka-popper-anchor-width)",
			"--reka-select-trigger-height": "var(--reka-popper-anchor-height)"
		} }), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), lN = {
	onViewportChange: () => {},
	itemTextRefCallback: () => {},
	itemRefCallback: () => {}
}, [uN, dN] = /*#__PURE__*/ KD("SelectContent"), fN = /* @__PURE__ */ H({
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
		let n = e, r = t, i = iN();
		WO(), RO(n.bodyLock);
		let { CollectionSlot: a, getItems: o } = nA(), s = /* @__PURE__ */ z();
		ak(s);
		let { search: c, handleTypeaheadSearch: l } = uk(), u = /* @__PURE__ */ z(), d = /* @__PURE__ */ z(), f = /* @__PURE__ */ z(), p = /* @__PURE__ */ z(!1), m = /* @__PURE__ */ z(!1), h = /* @__PURE__ */ z(!1);
		function g() {
			d.value && s.value && Xk([d.value, s.value]);
		}
		Br(p, () => {
			g();
		});
		let { onOpenChange: _, triggerPointerDownPosRef: v } = i;
		Lr((e) => {
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
					t = n.loop ? dk(t, i + 1) : t.slice(i + 1);
				}
				setTimeout(() => Xk(t)), e.preventDefault();
			}
		}
		let b = lO(n, "loop"), x = JO(Y(() => n.position === "popper" ? b : {}).value);
		return dN({
			content: s,
			viewport: u,
			onViewportChange: (e) => {
				u.value = e;
			},
			itemRefCallback: (e, t, n) => {
				let r = !m.value && !n, a = eN(i.modelValue.value, t, i.by);
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
				(eN(i.modelValue.value, t, i.by) || r) && (f.value = e);
			},
			focusSelectedItem: g,
			position: n.position,
			isPositioned: p,
			searchRef: c
		}), (t, n) => (W(), K(B(a), null, {
			default: V(() => [J(B(Hk), {
				"as-child": "",
				onMountAutoFocus: n[6] ||= Ou(() => {}, ["prevent"]),
				onUnmountAutoFocus: n[7] ||= (e) => {
					r("closeAutoFocus", e), !e.defaultPrevented && (B(i).triggerElement.value?.focus({ preventScroll: !0 }), e.preventDefault());
				}
			}, {
				default: V(() => [J(B(Dk), {
					"as-child": "",
					"disable-outside-pointer-events": e.disableOutsidePointerEvents,
					onFocusOutside: n[2] ||= Ou(() => {}, ["prevent"]),
					onDismiss: n[3] ||= (e) => B(i).onOpenChange(!1),
					onEscapeKeyDown: n[4] ||= (e) => r("escapeKeyDown", e),
					onPointerDownOutside: n[5] ||= (e) => r("pointerDownOutside", e)
				}, {
					default: V(() => [(W(), K(wa(e.position === "popper" ? cN : hN), Gs({
						...t.$attrs,
						...B(x)
					}, {
						id: B(i).contentId,
						ref: (e) => {
							if (!e) return;
							let t = B(mO)(e);
							t?.hasAttribute("data-reka-popper-content-wrapper") ? s.value = t.firstElementChild : s.value = t;
						},
						role: "listbox",
						"data-state": B(i).open.value ? "open" : "closed",
						dir: B(i).dir.value,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none"
						},
						onContextmenu: n[0] ||= Ou(() => {}, ["prevent"]),
						onPlaced: n[1] ||= (e) => p.value = !0,
						onKeydown: y
					}), {
						default: V(() => [U(t.$slots, "default")]),
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
}), [pN, mN] = /*#__PURE__*/ KD("SelectItemAlignedPosition"), hN = /* @__PURE__ */ H({
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
		let n = e, r = t, { getItems: i } = nA(), a = iN(), o = uN(), s = /* @__PURE__ */ z(!1), c = /* @__PURE__ */ z(!0), l = /* @__PURE__ */ z(), { forwardRef: u, currentElement: d } = qO(), { viewport: f, selectedItem: p, selectedItemText: m, focusSelectedItem: h } = o;
		function g() {
			if (a.triggerElement.value && a.valueElement.value && l.value && d.value && f?.value && p?.value && m?.value) {
				let e = a.triggerElement.value.getBoundingClientRect(), t = d.value.getBoundingClientRect(), n = a.valueElement.value.getBoundingClientRect(), o = m.value.getBoundingClientRect();
				if (a.dir.value !== "rtl") {
					let r = o.left - t.left, i = n.left - r, a = e.left - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = GD(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.left = `${d}px`;
				} else {
					let r = t.right - o.right, i = window.innerWidth - n.right - r, a = window.innerWidth - e.right - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = GD(i, 10, Math.max(10, u - c));
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
		let _ = /* @__PURE__ */ z("");
		da(async () => {
			await ur(), g(), d.value && (_.value = window.getComputedStyle(d.value).zIndex);
		});
		function v(e) {
			e && c.value === !0 && (g(), h?.(), c.value = !1);
		}
		return xO(a.triggerElement, () => {
			g();
		}), mN({
			contentWrapper: l,
			shouldExpandOnScrollRef: s,
			onScrollButtonChange: v
		}), (e, t) => (W(), G("div", {
			ref_key: "contentWrapperElement",
			ref: l,
			style: Te({
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: _.value
			})
		}, [J(B(vk), Gs({
			ref: B(u),
			style: {
				boxSizing: "border-box",
				maxHeight: "100%"
			}
		}, {
			...e.$attrs,
			...n
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16)], 4));
	}
}), gN = /* @__PURE__ */ H({
	inheritAttrs: !1,
	__name: "SelectProvider",
	props: { context: {
		type: Object,
		required: !0
	} },
	setup(e) {
		return aN(e.context), dN(lN), (e, t) => U(e.$slots, "default");
	}
}), _N = { key: 1 }, vN = /* @__PURE__ */ H({
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
		let n = e, r = YO(n, t), i = iN(), a = /* @__PURE__ */ z();
		da(() => {
			a.value = new DocumentFragment();
		});
		let o = /* @__PURE__ */ z(), s = Y(() => n.forceMount || i.open.value), c = /* @__PURE__ */ z(s.value), l;
		function u() {
			l &&= (clearTimeout(l), void 0);
		}
		return Br(s, (e, t, n) => {
			u(), l = setTimeout(() => {
				c.value = s.value, l = void 0;
			}), n(u);
		}), ha(u), (e, t) => s.value || c.value || o.value?.present ? (W(), K(B(hk), {
			key: 0,
			ref_key: "presenceRef",
			ref: o,
			present: s.value
		}, {
			default: V(() => [J(fN, je(Ls({
				...B(r),
				...e.$attrs
			})), {
				default: V(() => [U(e.$slots, "default")]),
				_: 3
			}, 16)]),
			_: 3
		}, 8, ["present"])) : a.value ? (W(), G("div", _N, [(W(), K(ti, { to: a.value }, [J(gN, { context: B(i) }, {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 8, ["context"])], 8, ["to"]))])) : Vs("v-if", !0);
	}
}), [yN, bN] = /*#__PURE__*/ KD("SelectItem"), xN = /* @__PURE__ */ H({
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
		let n = e, r = t, { disabled: i } = /* @__PURE__ */ jn(n), a = iN(), o = uN(), { forwardRef: s, currentElement: c } = qO(), { CollectionItem: l } = nA(), u = Y(() => eN(a.modelValue?.value, n.value, a.by)), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ z(n.textValue ?? ""), p = sk(void 0, "reka-select-item-text");
		async function m(e) {
			e.defaultPrevented || JD("select.select", h, {
				originalEvent: e,
				value: n.value
			});
		}
		async function h(e) {
			await ur(), r("select", e), e.defaultPrevented || i.value || (a.onValueChange(n.value), a.multiple.value || a.onOpenChange(!1));
		}
		async function g(e) {
			await ur(), !e.defaultPrevented && (i.value ? o.onItemLeave?.() : e.currentTarget?.focus({ preventScroll: !0 }));
		}
		async function _(e) {
			await ur(), !e.defaultPrevented && e.currentTarget === qD() && o.onItemLeave?.();
		}
		async function v(e) {
			await ur(), e.defaultPrevented || o.searchRef?.value !== "" && e.key === " " || ($M.includes(e.key) && m(e), e.key === " " && e.preventDefault());
		}
		if (n.value === "") throw Error("A <SelectItem /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
		return da(() => {
			c.value && o.itemRefCallback(c.value, n.value, n.disabled);
		}), bN({
			value: n.value,
			disabled: i,
			textId: p,
			isSelected: u,
			onItemTextChange: (e) => {
				f.value = ((f.value || e?.textContent) ?? "").trim();
			}
		}), (t, n) => (W(), K(B(l), { value: { textValue: f.value } }, {
			default: V(() => [J(B(vk), {
				ref: B(s),
				role: "option",
				"aria-labelledby": B(p),
				"data-highlighted": d.value ? "" : void 0,
				"aria-selected": u.value,
				"data-state": u.value ? "checked" : "unchecked",
				"aria-disabled": B(i) || void 0,
				"data-disabled": B(i) ? "" : void 0,
				tabindex: B(i) ? void 0 : -1,
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
				default: V(() => [U(t.$slots, "default", { selected: u.value })]),
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
}), SN = /* @__PURE__ */ H({
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
		let t = e, n = iN(), r = uN(), i = yN(), { forwardRef: a, currentElement: o } = qO(), s = Y(() => ({
			value: i.value,
			disabled: i.disabled.value,
			textContent: o.value?.textContent ?? i.value?.toString() ?? ""
		}));
		return da(() => {
			o.value && (i.onItemTextChange(o.value), r.itemTextRefCallback(o.value, i.value, i.disabled.value), n.onOptionAdd(s.value));
		}), ha(() => {
			n.onOptionRemove(s.value);
		}), (e, n) => (W(), K(B(vk), Gs({
			id: B(i).textId,
			ref: B(a)
		}, {
			...t,
			...e.$attrs
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, ["id"]));
	}
}), CN = /* @__PURE__ */ H({
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
		return (e, n) => (W(), K(B(eA), je(Ls(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), wN = /* @__PURE__ */ H({
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
		let t = e, n = iN(), { forwardRef: r, currentElement: i } = qO(), a = Y(() => n.disabled?.value || t.disabled);
		n.contentId ||= sk(void 0, "reka-select-content"), da(() => {
			n.onTriggerChange(i.value);
		});
		let o = EM(null), s = Ga();
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
		da(() => {
			f = o?.registerControl({
				id: c,
				element: () => i.value,
				getValue: () => n.modelValue.value,
				required: () => !!n.required?.value
			});
		}), ma(() => f?.());
		let { getItems: p } = nA(), { search: m, handleTypeaheadSearch: h, resetTypeahead: g } = uk();
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
			!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && h(e.key, p()), !(t && e.key === " ") && QM.includes(e.key) && (_(), e.preventDefault());
		}
		return (t, i) => (W(), K(B(uA), {
			"as-child": "",
			reference: e.reference
		}, {
			default: V(() => [J(B(vk), Gs(l(), {
				ref: B(r),
				role: "combobox",
				type: e.as === "button" ? "button" : void 0,
				"aria-controls": B(n).open.value ? B(n).contentId : void 0,
				"aria-expanded": B(n).open.value || !1,
				"aria-required": B(n).required?.value,
				"aria-autocomplete": "none",
				disabled: a.value,
				dir: B(n)?.dir.value,
				"data-state": B(n)?.open.value ? "open" : "closed",
				"data-disabled": a.value ? "" : void 0,
				"data-placeholder": B(nN)(B(n).modelValue?.value) ? "" : void 0,
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
				default: V(() => [U(t.$slots, "default")]),
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
}), TN = /* @__PURE__ */ H({
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
		let t = e, { forwardRef: n, currentElement: r } = qO(), i = iN();
		da(() => {
			i.valueElement = r;
		});
		let a = Y(() => {
			let e = [], t = Array.from(i.optionsSet.value), n = (e) => t.find((t) => eN(e, t.value, i.by));
			return e = Array.isArray(i.modelValue.value) ? i.modelValue.value.map((e) => n(e)?.textContent ?? "") : [n(i.modelValue.value)?.textContent ?? ""], e.filter(Boolean);
		}), o = Y(() => a.value.length ? a.value.join(", ") : t.placeholder);
		return (r, s) => (W(), K(B(vk), {
			ref: B(n),
			as: e.as,
			"as-child": e.asChild,
			style: { pointerEvents: "none" },
			"data-placeholder": a.value.length ? void 0 : t.placeholder
		}, {
			default: V(() => [U(r.$slots, "default", {
				selectedLabel: a.value,
				modelValue: B(i).modelValue.value
			}, () => [zs(F(o.value), 1)])]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"data-placeholder"
		]));
	}
}), EN = /* @__PURE__ */ H({
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
		let t = e, { nonce: n } = /* @__PURE__ */ jn(t), r = SM(n), i = uN(), a = i.position === "item-aligned" ? pN() : void 0, { forwardRef: o, currentElement: s } = qO();
		da(() => {
			i?.onViewportChange(s.value);
		});
		let c = /* @__PURE__ */ z(0);
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
		return (e, n) => (W(), G(xs, null, [J(B(vk), Gs({
			ref: B(o),
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
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16), J(B(vk), {
			as: "style",
			nonce: B(r)
		}, {
			default: V(() => [...n[0] ||= [zs(" /* Hide scrollbars cross-browser and enable momentum scroll for touch devices */ [data-reka-select-viewport] { scrollbar-width:none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; } [data-reka-select-viewport]::-webkit-scrollbar { display: none; } ", -1)]]),
			_: 1
		}, 8, ["nonce"])], 64));
	}
}), DN = {
	key: 0,
	class: "trpg-menu__reason"
}, ON = /* @__PURE__ */ H({
	__name: "MoreMenu",
	props: {
		label: {},
		items: {}
	},
	emits: ["select"],
	setup(e) {
		let t = Nr("portalTarget", void 0);
		return (n, r) => (W(), K(B(qM), null, {
			default: V(() => [J(B(ZM), {
				class: "trpg-icon-btn trpg-more",
				"aria-label": `${e.label} 的更多操作`
			}, {
				default: V(() => [J(Zd, {
					name: "dots-three",
					size: 20
				})]),
				_: 1
			}, 8, ["aria-label"]), J(B(XM), { to: B(t) }, {
				default: V(() => [J(B(JM), {
					class: "trpg-menu",
					align: "end",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: V(() => [(W(!0), G(xs, null, Oa(e.items, (e) => (W(), K(B(YM), {
						key: e.key,
						class: Ae(["trpg-menu__item", { "trpg-menu__item--danger": e.danger }]),
						disabled: e.disabled,
						onSelect: (t) => n.$emit("select", e.key)
					}, {
						default: V(() => [q("span", null, F(e.label), 1), e.disabled && e.reason ? (W(), G("span", DN, F(e.reason), 1)) : Vs("", !0)]),
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
}), kN = /* @__PURE__ */ H({
	__name: "SelectField",
	props: /*@__PURE__*/ Ya({
		options: {},
		placeholder: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = e, n = vo(e, "modelValue"), r = Nr("portalTarget", void 0), i = Y(() => t.options.map((e) => typeof e == "string" ? {
			value: e,
			label: e
		} : e));
		return (t, a) => (W(), K(B(oN), {
			modelValue: n.value,
			"onUpdate:modelValue": a[0] ||= (e) => n.value = e
		}, {
			default: V(() => [J(B(wN), {
				class: "trpg-select-trigger",
				"aria-label": e.label
			}, {
				default: V(() => [J(B(TN), { placeholder: e.placeholder ?? "请选择" }, null, 8, ["placeholder"]), J(Zd, {
					name: "caret-down",
					size: 14
				})]),
				_: 1
			}, 8, ["aria-label"]), J(B(CN), { to: B(r) }, {
				default: V(() => [J(B(vN), {
					class: "trpg-select-content",
					position: "popper",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: V(() => [J(B(EN), { class: "trpg-select-viewport" }, {
						default: V(() => [(W(!0), G(xs, null, Oa(i.value, (e) => (W(), K(B(xN), {
							key: e.value,
							value: e.value,
							class: "trpg-select-item"
						}, {
							default: V(() => [J(B(SN), null, {
								default: V(() => [zs(F(e.label), 1)]),
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
}), AN = ["title"], jN = [
	"aria-checked",
	"aria-label",
	"aria-description",
	"disabled",
	"data-on"
], MN = /* @__PURE__ */ H({
	__name: "Switch",
	props: /*@__PURE__*/ Ya({
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
		let t = vo(e, "modelValue");
		function n() {
			t.value = !t.value;
		}
		return (r, i) => (W(), G("span", {
			class: "trpg-switch-wrap",
			title: e.lockedReason
		}, [e.lockedReason ? (W(), K(Zd, {
			key: 0,
			name: "lock",
			size: 14
		})) : Vs("", !0), q("button", {
			class: "trpg-switch",
			type: "button",
			role: "switch",
			"aria-checked": t.value,
			"aria-label": e.label,
			"aria-description": e.lockedReason,
			disabled: e.disabled,
			"data-on": t.value,
			onClick: n
		}, [...i[0] ||= [q("span", { class: "trpg-switch__thumb" }, null, -1)]], 8, jN)], 8, AN));
	}
}), NN = ["aria-label"], PN = /* @__PURE__ */ H({
	__name: "Term",
	props: { label: {} },
	emits: ["open"],
	setup(e) {
		return (t, n) => (W(), G("button", {
			class: "trpg-term",
			type: "button",
			"aria-label": e.label,
			"aria-haspopup": "dialog",
			onClick: n[0] ||= Ou((e) => t.$emit("open"), ["stop"])
		}, [U(t.$slots, "default")], 8, NN));
	}
}), FN = ["data-testid"], IN = { class: "trpg-list" }, LN = /* @__PURE__ */ H({
	__name: "LabModalPage",
	props: { level: {} },
	setup(e) {
		let t = e, n = Bf();
		function r() {
			n.push({
				key: `lab:${t.level + 1}`,
				title: `第 ${t.level + 1} 页`,
				component: vn(LN),
				props: { level: t.level + 1 }
			});
		}
		async function i() {
			await RD({
				title: "测试确认",
				message: "这是弹窗内的确认页，「‹」或 Esc 即取消。",
				confirmLabel: "确认"
			});
		}
		return (t, n) => (W(), G("div", {
			class: "page-stack",
			"data-testid": `lab-page-${e.level}`
		}, [
			q("p", null, [
				zs("这是演示弹窗的第 " + F(e.level) + " 页。点下面的术语在", 1),
				J(PN, { onOpen: r }, {
					default: V(() => [...n[0] ||= [zs("同一个弹窗里", -1)]]),
					_: 1
				}),
				n[1] ||= zs("前进一页。", -1)
			]),
			q("ul", IN, [(W(), G(xs, null, Oa(30, (e) => q("li", {
				key: e,
				class: "trpg-row"
			}, [q("span", null, "演示行 " + F(e), 1)])), 64))]),
			q("button", {
				class: "trpg-btn",
				type: "button",
				onClick: i
			}, "弹窗内确认")
		], 8, FN));
	}
}), RN = { class: "probe" }, zN = { class: "lab" }, BN = { class: "lab__row" }, VN = {
	class: "probe__hint",
	"data-testid": "select-model"
}, HN = { class: "lab__row" }, UN = { class: "trpg-check" }, WN = { class: "lab__row" }, GN = { class: "trpg-row" }, KN = { class: "trpg-row__main" }, qN = { "data-testid": "switch-state" }, JN = {
	class: "probe__hint",
	"data-testid": "menu-pick"
}, YN = { class: "probe__actions" }, XN = { class: "probe__head" }, ZN = { class: "probe__title" }, QN = ["data-status"], $N = { class: "probe__hint" }, eP = { class: "probe__actions" }, tP = ["onClick"], nP = ["onClick"], rP = /* @__PURE__ */ H({
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
		], n = /* @__PURE__ */ z(""), r = /* @__PURE__ */ z(""), i = /* @__PURE__ */ z("a"), a = /* @__PURE__ */ z(!1), o = /* @__PURE__ */ z(""), s = /* @__PURE__ */ z(!1), c = /* @__PURE__ */ z(""), l = Bf(), u = Dd();
		function d() {
			l.open({
				key: "lab:1",
				title: "演示弹窗",
				component: vn(LN),
				props: { level: 1 }
			});
		}
		async function f() {
			let e = await RD({
				title: "卸载演示",
				message: "确定要卸载吗？",
				confirmLabel: "卸载",
				danger: !0
			});
			u.info(e ? "已确认" : "已取消");
		}
		function p(e, t, n) {
			tE(e, t, n, n === "pass" ? "人工确认：通过" : "人工确认：不通过");
		}
		return (e, l) => (W(), G("section", RN, [
			l[14] ||= q("h3", { class: "probe__title" }, "界面实测（需要你目测后点结果）", -1),
			q("div", zN, [
				q("div", BN, [
					J(kN, {
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
					q("p", VN, "下拉当前值：" + F(n.value || "未选") + " / " + F(r.value || "未选"), 1),
					J(kN, {
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
				q("div", HN, [
					J(ef, {
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
					q("label", UN, [Ar(q("input", {
						"onUpdate:modelValue": l[3] ||= (e) => a.value = e,
						type: "checkbox"
					}, null, 512), [[mu, a.value]]), l[10] ||= zs(" 勾选框测试", -1)]),
					Ar(q("input", {
						"onUpdate:modelValue": l[4] ||= (e) => o.value = e,
						class: "trpg-input",
						type: "text",
						placeholder: "输入测试：中文 / English"
					}, null, 512), [[pu, o.value]])
				]),
				q("div", WN, [
					q("div", GN, [
						q("span", KN, [l[11] ||= zs("开关演示：", -1), q("span", qN, F(s.value ? "开" : "关"), 1)]),
						J(MN, {
							modelValue: s.value,
							"onUpdate:modelValue": l[5] ||= (e) => s.value = e,
							label: "演示开关"
						}, null, 8, ["modelValue"]),
						J(ON, {
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
					q("p", JN, "菜单选择：" + F(c.value || "无"), 1),
					q("p", null, [l[13] ||= zs("下划线术语：", -1), J(PN, { onOpen: d }, {
						default: V(() => [...l[12] ||= [zs("点我打开演示弹窗", -1)]]),
						_: 1
					})]),
					q("div", YN, [
						q("button", {
							class: "trpg-btn",
							type: "button",
							onClick: f
						}, "危险确认"),
						q("button", {
							class: "trpg-btn",
							type: "button",
							onClick: l[7] ||= (e) => B(u).success("已保存")
						}, "成功提示"),
						q("button", {
							class: "trpg-btn",
							type: "button",
							onClick: l[8] ||= (e) => B(u).undoable("已删除一项", () => {
								B(u).info("已撤销");
							})
						}, "可撤销提示"),
						q("button", {
							class: "trpg-btn",
							type: "button",
							onClick: l[9] ||= (e) => B(u).error("下载失败：网络中断")
						}, "失败提示")
					])
				])
			]),
			(W(), G(xs, null, Oa(t, (e) => q("div", {
				key: e.id,
				class: "probe"
			}, [
				q("div", XN, [q("h4", ZN, F(e.title), 1), q("span", {
					class: "trpg-badge",
					"data-status": B(eE)[e.id]?.status ?? "idle"
				}, F(B(eE)[e.id]?.status ?? "待测"), 9, QN)]),
				q("p", $N, F(e.how), 1),
				q("div", eP, [q("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => p(e.id, e.title, "pass")
				}, "通过", 8, tP), q("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => p(e.id, e.title, "fail")
				}, "不通过", 8, nP)])
			])), 64))
		]));
	}
}), iP = { class: "probe__head" }, aP = { class: "probe__title" }, oP = ["data-status"], sP = { class: "probe__hint" }, cP = {
	key: 0,
	class: "probe__summary"
}, lP = { class: "probe__actions" }, uP = ["onClick"], dP = { key: 1 }, fP = { class: "report-bar" }, pP = { role: "status" }, mP = /* @__PURE__ */ H({
	__name: "ProbeList",
	props: { ctx: {} },
	setup(e) {
		let t = e.ctx, n = kD(t), r = /* @__PURE__ */ z("");
		async function i() {
			return JSON.stringify(rE(await sE(t)), null, 2);
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
		return (e, t) => (W(), G("div", null, [
			(W(!0), G(xs, null, Oa(B(n), (e) => (W(), G("section", {
				key: e.id,
				class: "probe"
			}, [
				q("div", iP, [q("h3", aP, F(e.title), 1), q("span", {
					class: "trpg-badge",
					"data-status": B(eE)[e.id]?.status ?? "idle"
				}, F(B(eE)[e.id]?.status ?? "待测"), 9, oP)]),
				q("p", sP, F(e.hint), 1),
				B(eE)[e.id] ? (W(), G("p", cP, F(B(eE)[e.id].summary), 1)) : Vs("", !0),
				q("div", lP, [(W(!0), G(xs, null, Oa(e.actions, (e) => (W(), G("button", {
					key: e.label,
					class: "trpg-btn",
					type: "button",
					onClick: (t) => e.run()
				}, F(e.label), 9, uP))), 128))]),
				B(eE)[e.id]?.detail === void 0 ? Vs("", !0) : (W(), G("details", dP, [t[2] ||= q("summary", null, "详情", -1), q("pre", null, F(JSON.stringify(B(eE)[e.id].detail, null, 2)), 1)]))
			]))), 128)),
			J(rP),
			q("div", fP, [
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
				q("span", pP, F(r.value), 1)
			])
		]));
	}
}), hP = {
	key: 0,
	class: "page-stack"
}, gP = { class: "trpg-list" }, _P = { class: "trpg-row" }, vP = { class: "trpg-row" }, yP = { class: "trpg-row__main" }, bP = { class: "trpg-row__meta" }, xP = { key: 1 }, SP = {
	key: 0,
	class: "trpg-diag",
	"data-testid": "diagnostics"
}, CP = {
	key: 1,
	class: "page-stack"
}, wP = { class: "trpg-group" }, TP = /* @__PURE__ */ H({
	__name: "SettingsView",
	setup(e) {
		let t = Nr("stCtx"), n = /* @__PURE__ */ z(null);
		return (e, r) => n.value === null ? (W(), G("div", hP, [q("ul", gP, [q("li", _P, [r[4] ||= q("div", { class: "trpg-row__main" }, [q("div", { class: "trpg-row__title" }, "诊断"), q("div", { class: "trpg-row__meta" }, "自检与兼容性测试，遇到问题时用来收集信息")], -1), q("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[0] ||= (e) => n.value = "diag"
		}, [r[3] ||= zs("打开", -1), J(Zd, {
			name: "caret-right",
			size: 14
		})])]), q("li", vP, [q("div", yP, [r[5] ||= q("div", { class: "trpg-row__title" }, "关于", -1), q("div", bP, "版本 " + F(B(QT)) + " · 开源许可与致谢", 1)]), q("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[1] ||= (e) => n.value = "about"
		}, [r[6] ||= zs("打开", -1), J(Zd, {
			name: "caret-right",
			size: 14
		})])])])])) : (W(), G("div", xP, [q("button", {
			class: "subpage-back",
			type: "button",
			onClick: r[2] ||= (e) => n.value = null
		}, [J(Zd, {
			name: "caret-left",
			size: 16
		}), r[7] ||= zs("设置", -1)]), n.value === "diag" ? (W(), G("div", SP, [B(t) ? (W(), K(mP, {
			key: 0,
			ctx: B(t)
		}, null, 8, ["ctx"])) : Vs("", !0)])) : (W(), G("div", CP, [
			q("h2", wP, "TRPG 跑团助手 " + F(B(QT)), 1),
			r[8] ||= q("p", { class: "page-intro" }, "代码以 AGPL-3.0 许可发布，源码在 GitHub：didhogg/tavern-trpg-assistant。", -1),
			r[9] ||= q("p", { class: "page-intro" }, "界面图标：Phosphor Icons（MIT）。规则数据的来源与许可见各条目的出处标注与随包附带的数据声明。", -1)
		]))]));
	}
}), EP = { class: "trpg-head__chips" }, DP = /* @__PURE__ */ H({
	__name: "HeaderChips",
	props: { layout: {} },
	setup(e) {
		return (e, t) => (W(), G("div", EP));
	}
}), OP = "trpg-assistant:window";
function kP(e, t, n) {
	let r = Math.min(Math.max(e.w, 360), Math.max(360, t)), i = Math.min(Math.max(e.h, 480), Math.max(480, n));
	return {
		w: r,
		h: i,
		x: Math.min(Math.max(e.x, 0), Math.max(0, t - r)),
		y: Math.min(Math.max(e.y, 0), Math.max(0, n - i))
	};
}
function AP(e, t) {
	let n = Math.min(960, e - 32), r = Math.min(640, t - 32);
	return kP({
		w: n,
		h: r,
		x: Math.round((e - n) / 2),
		y: Math.round((t - r) / 2)
	}, e, t);
}
function jP(e, t) {
	try {
		let n = localStorage.getItem(OP);
		if (n) {
			let r = JSON.parse(n);
			if ([
				r.x,
				r.y,
				r.w,
				r.h
			].every(Number.isFinite)) return kP(r, e, t);
		}
	} catch (e) {
		console.warn("[trpg-assistant] 读取窗口位置失败", e);
	}
	return AP(e, t);
}
function MP(e) {
	try {
		localStorage.setItem(OP, JSON.stringify(e));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/MainWindow.vue?vue&type=script&setup=true&lang.ts
var NP = ["data-layout", "data-fullscreen"], PP = ["inert"], FP = {
	key: 0,
	class: "trpg-side",
	"aria-label": "主导航"
}, IP = {
	key: 0,
	class: "trpg-side__name"
}, LP = { class: "trpg-side__list" }, RP = [
	"aria-current",
	"title",
	"onClick"
], zP = { key: 0 }, BP = { class: "trpg-side__list trpg-side__bottom" }, VP = [
	"aria-current",
	"title",
	"onClick"
], HP = { key: 0 }, UP = { class: "trpg-main" }, WP = { class: "trpg-head__title" }, GP = { class: "trpg-body" }, KP = {
	class: "trpg-content",
	tabindex: "-1"
}, qP = ["aria-pressed"], JP = {
	key: 0,
	class: "trpg-tabs",
	"aria-label": "主导航"
}, YP = ["aria-current", "onClick"], XP = /* @__PURE__ */ H({
	__name: "MainWindow",
	setup(e) {
		let t = Td(), n = Bf(), r = [
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
			home: Zf,
			library: tp,
			settings: TP
		}, a = /* @__PURE__ */ z(window.innerWidth), o = /* @__PURE__ */ z(window.innerHeight), s = /* @__PURE__ */ z(jP(a.value, o.value)), c = /* @__PURE__ */ z(null), l = /* @__PURE__ */ z(s.value.w), u = Y(() => a.value <= 480), d = Y(() => l.value >= 720 ? "wide" : l.value > 480 ? "mid" : "narrow"), f = Y(() => u.value ? {} : {
			left: `${s.value.x}px`,
			top: `${s.value.y}px`,
			width: `${s.value.w}px`,
			height: `${s.value.h}px`
		}), p = Y(() => wd[t.page]), m = Y(() => r.filter((e) => !e.bottom)), h = Y(() => r.filter((e) => e.bottom)), g = af({
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
			onEnd: () => MP(s.value)
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
				t.removeEventListener("pointermove", c), t.removeEventListener("pointerup", l), t.removeEventListener("pointercancel", l), MP(s.value);
			};
			t.addEventListener("pointermove", c), t.addEventListener("pointerup", l), t.addEventListener("pointercancel", l);
		}
		function y() {
			a.value = window.innerWidth, o.value = window.innerHeight, s.value = kP(s.value, a.value, o.value);
		}
		let b;
		return da(() => {
			window.addEventListener("resize", y), b = new ResizeObserver((e) => {
				let t = e[0]?.contentRect.width;
				t && (l.value = t);
			}), c.value && b.observe(c.value);
		}), ma(() => {
			window.removeEventListener("resize", y), b?.disconnect();
		}), (e, a) => (W(), G("section", {
			ref_key: "winEl",
			ref: c,
			class: "trpg-window",
			style: Te(f.value),
			"data-layout": d.value,
			"data-fullscreen": u.value,
			role: "dialog",
			"aria-label": "TRPG 跑团助手"
		}, [
			q("div", {
				class: "trpg-shell",
				inert: B(n).isOpen
			}, [d.value === "narrow" ? Vs("", !0) : (W(), G("nav", FP, [
				q("div", {
					class: "trpg-side__brand",
					title: "拖动窗口",
					onPointerdown: _
				}, [J(Zd, {
					name: "dice-five",
					size: 22
				}), d.value === "wide" ? (W(), G("span", IP, "TRPG 跑团助手")) : Vs("", !0)], 32),
				q("ul", LP, [(W(!0), G(xs, null, Oa(m.value, (e) => (W(), G("li", { key: e.id }, [q("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": B(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => B(t).go(e.id)
				}, [J(Zd, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (W(), G("span", zP, F(e.label), 1)) : Vs("", !0)], 8, RP)]))), 128))]),
				q("ul", BP, [(W(!0), G(xs, null, Oa(h.value, (e) => (W(), G("li", { key: e.id }, [q("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": B(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => B(t).go(e.id)
				}, [J(Zd, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (W(), G("span", HP, F(e.label), 1)) : Vs("", !0)], 8, VP)]))), 128))])
			])), q("div", UP, [
				q("header", {
					class: "trpg-head",
					onPointerdown: a[1] ||= (e) => d.value === "narrow" ? _(e) : void 0
				}, [
					q("h1", WP, F(p.value), 1),
					J(DP, { layout: d.value }, null, 8, ["layout"]),
					d.value === "narrow" ? Vs("", !0) : (W(), G("button", {
						key: 0,
						class: "trpg-icon-btn",
						type: "button",
						"aria-label": "收起助手",
						onClick: a[0] ||= (e) => B(t).windowOpen = !1
					}, [J(Zd, {
						name: "x",
						size: 18
					})]))
				], 32),
				q("div", GP, [q("main", KP, [(W(), K(wa(i[B(t).page])))]), q("button", {
					class: "trpg-dice-btn",
					type: "button",
					"aria-label": "掷骰",
					"aria-pressed": B(t).diceOpen,
					onClick: a[2] ||= (e) => B(t).diceOpen = !B(t).diceOpen
				}, [J(Zd, {
					name: "dice-five",
					size: 28
				})], 8, qP)]),
				d.value === "narrow" ? (W(), G("nav", JP, [(W(), G(xs, null, Oa(r, (e) => q("button", {
					key: e.id,
					class: "trpg-tab",
					type: "button",
					"aria-current": B(t).page === e.id ? "page" : void 0,
					onClick: (n) => B(t).go(e.id)
				}, [J(Zd, {
					name: e.icon,
					size: 22
				}, null, 8, ["name"]), q("span", null, F(e.label), 1)], 8, YP)), 64))])) : Vs("", !0)
			])], 8, PP),
			J(Kf),
			u.value ? Vs("", !0) : (W(), G("div", {
				key: 0,
				class: "trpg-resize",
				"aria-hidden": "true",
				onPointerdown: v
			}, null, 32))
		], 12, NP));
	}
}), ZP = { class: "trpg-root" }, QP = /* @__PURE__ */ H({
	__name: "App",
	props: {
		ctx: {},
		portalTarget: {}
	},
	setup(e) {
		let t = e;
		Mr("portalTarget", t.portalTarget), Mr("stCtx", t.ctx);
		let n = Td();
		return (e, t) => (W(), G("div", ZP, [
			J(zf),
			B(n).windowOpen ? (W(), K(XP, { key: 0 })) : Vs("", !0),
			J(If),
			J(jd)
		]));
	}
}), $P = ".trpg-btn{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);min-height:36px;color:var(--ink);font:inherit;cursor:pointer;white-space:nowrap;justify-content:center;align-items:center;gap:6px;padding:4px 14px;display:inline-flex}.trpg-btn:hover:not(:disabled){border-color:var(--primary)}.trpg-btn:disabled{opacity:.5;cursor:not-allowed}.trpg-btn--primary{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-btn--danger{background:var(--danger);color:#fffcf6;border-color:var(--danger)}.trpg-btn--quiet{background:0 0;border-color:#0000}.trpg-btn--small{min-height:30px;padding:2px 10px;font-size:13px}.trpg-icon-btn{border-radius:var(--radius-sm);min-width:36px;min-height:36px;color:inherit;cursor:pointer;background:0 0;border:1px solid #0000;justify-content:center;align-items:center;display:inline-flex}.trpg-icon-btn:hover{border-color:currentColor}.trpg-input{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);padding:4px 10px}.trpg-input:disabled{opacity:.6}textarea.trpg-input{resize:vertical;min-height:72px}.trpg-field{gap:4px;display:grid}.trpg-field__label{color:var(--ink-2);font-size:13px}.trpg-field__hint{color:var(--ink-2);font-size:12.5px}.trpg-field__error{color:var(--danger);font-size:12.5px}.trpg-select-trigger{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);cursor:pointer;justify-content:space-between;align-items:center;gap:8px;padding:4px 10px;display:inline-flex}.trpg-select-content,.trpg-menu{min-width:var(--reka-select-trigger-width,160px);background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);box-shadow:var(--shadow-float);z-index:100003;color:var(--ink)}.trpg-select-content{max-height:min(8 * 36px, var(--reka-select-content-available-height));overflow:hidden}.trpg-select-viewport{max-height:inherit;padding:4px;overflow-y:auto}.trpg-select-item,.trpg-menu__item{border-radius:var(--radius-xs);cursor:pointer;min-height:40px;color:var(--ink);justify-content:space-between;align-items:center;gap:12px;padding:4px 10px;display:flex}.trpg-menu{min-width:168px;padding:4px}.trpg-select-item[data-highlighted],.trpg-menu__item[data-highlighted]{background:var(--panel);outline:none}.trpg-select-item[data-state=checked]{color:var(--primary);font-weight:600}.trpg-menu__item--danger{color:var(--danger)}.trpg-menu__item[data-disabled]{opacity:.5;cursor:not-allowed}.trpg-menu__reason{color:var(--ink-2);font-size:12px}.trpg-seg{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);display:inline-flex;overflow:hidden}.trpg-seg button{min-height:34px;color:var(--ink);background:0 0;border:0;padding:2px 14px}.trpg-seg button+button{border-left:1px solid var(--line)}.trpg-seg button[aria-pressed=true]{background:var(--primary);color:var(--primary-ink)}.trpg-badge{border-radius:var(--radius-xs);background:var(--panel);border:1px solid var(--line);color:var(--ink-2);white-space:nowrap;padding:0 8px;font-size:12px;font-weight:600;line-height:20px;display:inline-block}.trpg-badge[data-tone=ok],.trpg-badge[data-status=pass]{color:var(--ok);border-color:var(--ok)}.trpg-badge[data-tone=danger],.trpg-badge[data-status=fail],.trpg-badge[data-status=error]{color:var(--danger);border-color:var(--danger)}.trpg-badge[data-tone=warn],.trpg-badge[data-status=waiting]{color:var(--unsaved);border-color:var(--unsaved)}.trpg-badge[data-tone=gold]{color:var(--gold);border-color:var(--gold)}.trpg-pill{border:1px solid var(--line);background:var(--card);border-radius:999px;align-items:center;gap:4px;min-height:30px;padding:0 12px;display:inline-flex}.trpg-switch-wrap{color:var(--ink-2);align-items:center;gap:6px;min-height:44px;display:inline-flex}.trpg-switch{border:2px solid var(--line);background:0 0;border-radius:999px;width:42px;height:24px;padding:0;transition:background .16s,border-color .16s;position:relative}.trpg-switch__thumb{background:var(--ink-2);border-radius:50%;width:16px;height:16px;transition:transform .16s,background .16s;position:absolute;top:2px;left:2px}.trpg-switch[data-on=true]{background:var(--primary);border-color:var(--primary)}.trpg-switch[data-on=true] .trpg-switch__thumb{background:var(--primary-ink);transform:translate(18px)}.trpg-switch:disabled{opacity:.55;cursor:not-allowed}.trpg-check{cursor:pointer;align-items:center;gap:8px;min-height:36px;display:inline-flex}.trpg-check[data-disabled=true]{opacity:.6;cursor:not-allowed}.trpg-check input{width:18px;height:18px;accent-color:var(--primary);flex:none;margin:0}.trpg-term{color:var(--ink);text-align:left;text-underline-offset:4px;cursor:pointer;background:0 0;border:0;padding:0;-webkit-text-decoration:underline dotted;text-decoration:underline dotted;text-decoration-thickness:1.5px;display:inline}.trpg-term:hover,.trpg-term:focus-visible{text-decoration-style:solid;-webkit-text-decoration-color:var(--gold);text-decoration-color:var(--gold)}.trpg-list{margin:0;padding:0;list-style:none}.trpg-row{border-bottom:1px solid var(--line);align-items:center;gap:12px;min-height:52px;padding:6px 4px;display:flex}.trpg-row__main{flex:1;min-width:0}.trpg-row__title{overflow-wrap:anywhere;font-weight:600}.trpg-row__meta{color:var(--ink-2);font-size:12.5px}.trpg-row__end{flex:none;align-items:center;gap:8px;display:flex}.trpg-group{font-family:var(--font-serif);color:var(--ink-2);margin:16px 0 4px;font-size:15px}.trpg-skeleton{background:linear-gradient(90deg, var(--panel), var(--line), var(--panel));opacity:.6;border-radius:4px;height:14px}.trpg-empty{text-align:center;color:var(--ink-2);padding:24px 8px}.trpg-progress{background:var(--panel);border-radius:3px;width:120px;height:6px;overflow:hidden}.trpg-progress>span{background:var(--primary);height:100%;transition:width .2s;display:block}.trpg-icon{vertical-align:-3px;flex:none}.trpg-toasts{left:50%;bottom:max(16px, env(safe-area-inset-bottom));z-index:100005;gap:8px;width:min(92vw,420px);display:grid;position:fixed;transform:translate(-50%)}.trpg-toast{border-radius:var(--radius-sm);background:var(--chrome);color:var(--chrome-ink);border-left:4px solid var(--gold);box-shadow:var(--shadow-float);align-items:center;gap:10px;padding:10px 12px;display:flex}.trpg-toast[data-kind=error]{border-left-color:var(--danger)}.trpg-toast[data-kind=success]{border-left-color:var(--ok)}.trpg-toast__text{flex:1}.trpg-toast button{color:var(--gold);background:0 0;border:0;min-height:32px;padding:0 8px;font-weight:600}@media (width<=480px){.trpg-toasts{bottom:calc(64px + env(safe-area-inset-bottom))}}.trpg-toast-enter-from,.trpg-toast-leave-to{opacity:0;transform:translateY(8px)}.trpg-toast-enter-active,.trpg-toast-leave-active{transition:opacity .16s,transform .16s}.trpg-modal-root{pointer-events:none;z-index:20;position:absolute;inset:0}.trpg-modal{background:var(--scrim);pointer-events:auto;justify-content:center;align-items:center;padding:16px;display:flex;position:absolute;inset:0}.trpg-modal__card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:min(640px,100%);height:min(80%,640px);box-shadow:var(--shadow-float);flex-direction:column;animation:.16s ease-out trpg-pop;display:flex;overflow:hidden}.trpg-modal[data-variant=drawer]{justify-content:flex-end;padding:0}.trpg-modal[data-variant=drawer] .trpg-modal__card{border-radius:0;width:min(440px,100%);height:100%;animation:.2s ease-out trpg-slide}.trpg-modal[data-variant=confirm] .trpg-modal__card{width:min(440px,100%);height:auto;max-height:90%}.trpg-modal[data-variant=confirm] .trpg-modal__page{position:relative}.trpg-modal__head{border-bottom:1px solid var(--line);background:var(--panel);flex:none;align-items:center;gap:8px;min-height:52px;padding:4px 8px 4px 16px;display:flex}.trpg-modal__title{min-width:0;font-family:var(--font-serif);text-overflow:ellipsis;white-space:nowrap;flex:1;margin:0;font-size:17px;overflow:hidden}.trpg-modal__back{border-radius:var(--radius-sm);max-width:40%;min-height:36px;color:var(--primary);white-space:nowrap;background:0 0;border:0;align-items:center;gap:2px;margin-left:-8px;padding:0 8px;display:inline-flex}.trpg-modal__back span{text-overflow:ellipsis;overflow:hidden}.trpg-modal__back:hover{background:var(--card)}.trpg-modal__pages{flex:1;min-height:0;position:relative}.trpg-modal__page{padding:16px;transition:opacity .16s,transform .16s,visibility;position:absolute;inset:0;overflow:auto}.trpg-modal__page.is-under{opacity:0;visibility:hidden;pointer-events:none;transition:opacity .16s,transform .16s,visibility 0s .16s;transform:translate(-24px)}.trpg-page-enter-from,.trpg-page-leave-to{opacity:0;transform:translate(24px)}.trpg-page-enter-active,.trpg-page-leave-active{transition:opacity .16s,transform .16s}.trpg-modal[data-variant=confirm] .trpg-page-leave-active{position:absolute;inset:0}@keyframes trpg-pop{0%{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}@keyframes trpg-slide{0%{opacity:0;transform:translate(32px)}to{opacity:1;transform:none}}.trpg-confirm{gap:12px;display:grid}.trpg-confirm__message{margin:0}.trpg-confirm__details{color:var(--ink-2);margin:0;padding-left:18px}.trpg-confirm__actions{justify-content:flex-end;gap:8px;margin-top:4px;display:flex}.trpg-window[data-layout=narrow] .trpg-modal{background:var(--paper);align-items:stretch;padding:0}.trpg-window[data-layout=narrow] .trpg-modal__card{border:0;border-radius:0;width:100%;height:100%}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm]{background:var(--scrim);align-items:flex-end}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm] .trpg-modal__card{border-radius:var(--radius) var(--radius) 0 0;height:auto}.trpg-window[data-layout=narrow] .trpg-confirm__actions{flex-direction:column-reverse}.trpg-window[data-layout=narrow] .trpg-confirm__actions .trpg-btn{min-height:44px}.trpg-window[data-layout=narrow] .trpg-modal__head{background:var(--chrome);min-height:48px;color:var(--chrome-ink);border-bottom:0}.trpg-window[data-layout=narrow] .trpg-modal__back{color:var(--gold)}.trpg-window[data-layout=narrow] .trpg-modal__back,.trpg-window[data-layout=narrow] .trpg-modal__close{min-width:44px;min-height:44px}", eF = ".probe{border-bottom:1px solid var(--line);padding:10px 0}.probe__head{justify-content:space-between;align-items:center;gap:8px;display:flex}.probe__title{font-family:var(--font-serif);margin:0;font-size:15px}.probe__hint{color:var(--ink-2);margin:4px 0;font-size:12.5px}.probe__summary{margin:4px 0}.probe__actions{flex-wrap:wrap;gap:6px;margin-top:6px;display:flex}.probe pre{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);white-space:pre-wrap;word-break:break-all;max-height:200px;margin:6px 0 0;padding:8px;font-size:11.5px;overflow:auto}.probe summary{cursor:pointer;color:var(--ink-2);font-size:12.5px}.lab{background:var(--panel);border-radius:var(--radius);gap:10px;margin-top:8px;padding:10px;display:grid}.lab__row{gap:6px;display:grid}.report-bar{background:var(--paper);flex-wrap:wrap;gap:8px;padding:10px 0;display:flex;position:sticky;bottom:-12px}", tF = ".trpg-root{z-index:100000;width:0;height:0;position:fixed;top:0;left:0}.trpg-ball{border:2px solid var(--gold);background:var(--chrome);width:48px;height:48px;color:var(--chrome-ink);cursor:grab;touch-action:none;border-radius:50%;place-items:center;padding:0;display:grid;position:fixed;box-shadow:0 2px 8px #00000059}.trpg-window{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow-float);color:var(--ink);position:fixed;overflow:hidden}.trpg-window[data-fullscreen=true]{border:0;border-radius:0;height:100dvh;inset:0}.trpg-shell{width:100%;height:100%;display:flex}.trpg-window[data-layout=narrow] .trpg-shell{padding-bottom:env(safe-area-inset-bottom);background:var(--paper);flex-direction:column}.trpg-window[data-fullscreen=true] .trpg-shell{padding-top:env(safe-area-inset-top);background:var(--chrome)}.trpg-side{background:var(--chrome);width:176px;color:var(--chrome-ink);flex-direction:column;flex:none;display:flex}.trpg-window[data-layout=mid] .trpg-side{width:56px}.trpg-side__brand{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;height:52px;font-family:var(--font-serif);border-bottom:1px solid var(--chrome-hover);color:var(--gold);align-items:center;gap:10px;padding:0 16px;font-size:16px;display:flex}.trpg-window[data-layout=mid] .trpg-side__brand{justify-content:center;padding:0}.trpg-side__list{gap:4px;margin:0;padding:8px;list-style:none;display:grid}.trpg-side__bottom{margin-top:auto}.trpg-nav{border-radius:var(--radius-sm);width:100%;min-height:44px;color:var(--chrome-ink);text-align:left;background:0 0;border:0;align-items:center;gap:12px;padding:0 12px;display:flex}.trpg-window[data-layout=mid] .trpg-nav{justify-content:center;padding:0}.trpg-nav:hover{background:var(--chrome-hover)}.trpg-nav[aria-current=page]{background:var(--chrome-hover);box-shadow:inset 3px 0 0 var(--gold)}.trpg-nav:focus-visible,.trpg-tab:focus-visible,.trpg-side__brand:focus-visible{outline-color:var(--gold)}.trpg-main{background:var(--paper);flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.trpg-head{border-bottom:1px solid var(--line);flex:none;align-items:center;gap:12px;height:52px;padding:0 12px 0 20px;display:flex}.trpg-head__title{font-family:var(--font-serif);flex:1;margin:0;font-size:19px;font-weight:600}.trpg-head__chips{align-items:center;gap:8px;display:flex}.trpg-content{outline:none;flex:1;min-height:0;padding:16px 20px 24px;position:relative;overflow:auto}.trpg-window[data-layout=narrow] .trpg-head{background:var(--chrome);height:48px;color:var(--chrome-ink);cursor:grab;touch-action:none;border-bottom:0;padding:0 8px 0 16px}.trpg-window[data-fullscreen=true] .trpg-head{cursor:default}.trpg-window[data-layout=narrow] .trpg-content{padding:12px 16px 24px}.trpg-tabs{background:var(--chrome);height:56px;color:var(--chrome-ink);flex:none;display:flex}.trpg-tab{min-width:64px;color:var(--chrome-ink);background:0 0;border:0;flex-direction:column;flex:1;justify-content:center;align-items:center;gap:2px;font-size:12px;display:flex}.trpg-tab[aria-current=page]{color:var(--gold);box-shadow:inset 0 3px 0 var(--gold)}.trpg-resize{cursor:nwse-resize;touch-action:none;z-index:30;background:linear-gradient(135deg, transparent 50%, var(--line) 50%, var(--line) 58%, transparent 58%, transparent 70%, var(--line) 70%, var(--line) 78%, transparent 78%);width:22px;height:22px;position:absolute;bottom:0;right:0}.page-stack{gap:16px;display:grid}.page-intro{color:var(--ink-2);margin:0}.subpage-back{border-radius:var(--radius-sm);min-height:36px;color:var(--primary);background:0 0;border:0;align-items:center;gap:2px;margin:0 0 8px -8px;padding:0 8px;display:inline-flex}.subpage-back:hover{background:var(--panel)}.trpg-body{flex:1;min-height:0;display:flex;position:relative}.trpg-body .trpg-content{flex:1}.trpg-dice-btn{z-index:6;border:2px solid var(--gold);background:var(--primary);width:52px;height:52px;color:var(--primary-ink);box-shadow:var(--shadow-float);border-radius:50%;place-items:center;padding:0;display:grid;position:absolute;bottom:20px;right:20px}.trpg-dice-btn[aria-pressed=true]{box-shadow:0 0 0 3px var(--gold), var(--shadow-float)}.trpg-window[data-layout=narrow] .trpg-dice-btn{bottom:16px;right:16px}.trpg-dice{z-index:10;background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:360px;max-height:70vh;box-shadow:var(--shadow-float);flex-direction:column;display:flex;position:fixed;overflow:hidden}.trpg-dice[data-narrow=true]{max-height:calc(100dvh - 140px)}.trpg-dice__head{background:var(--chrome);min-height:44px;color:var(--chrome-ink);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;flex:none;align-items:center;gap:8px;padding:0 6px 0 14px;display:flex}.trpg-dice__title{font-family:var(--font-serif);flex:1;font-size:16px}.trpg-dice__body{gap:12px;padding:12px;display:grid;overflow-y:auto}.trpg-dice__result{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);align-content:center;justify-items:center;gap:2px;min-height:108px;padding:12px 8px;display:grid}.trpg-dice__result[data-natural=\"20\"]{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)}.trpg-dice__result[data-natural=\"1\"]{border-color:var(--danger);box-shadow:inset 0 0 0 1px var(--danger)}.trpg-dice__total{font-family:var(--font-serif);font-variant-numeric:tabular-nums;font-size:48px;font-weight:700;line-height:1.1;animation:.2s ease-out trpg-roll}.trpg-dice__result[data-natural=\"20\"] .trpg-dice__total{color:var(--gold)}.trpg-dice__result[data-natural=\"1\"] .trpg-dice__total{color:var(--danger)}.trpg-dice__line{color:var(--ink-2);text-align:center;overflow-wrap:anywhere;font-size:13px}.trpg-dice__placeholder{color:var(--ink-2);margin:0}.trpg-dice__quick{grid-template-columns:repeat(7,1fr);gap:4px;display:grid}.trpg-dice__quick .trpg-btn{min-width:0;min-height:44px;padding:0}.trpg-dice__mods{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;display:flex}.trpg-dice__mods .trpg-seg button{min-height:40px}.trpg-dice__bonus{align-items:center;gap:4px;display:inline-flex}.trpg-dice__bonus .trpg-icon-btn{border-color:var(--line);background:var(--card);min-width:40px;min-height:40px;font-size:18px}.trpg-dice__bonus-value{text-align:center;font-variant-numeric:tabular-nums;min-width:2.5em;font-weight:600}.trpg-dice__expr-row{gap:6px;display:flex}.trpg-dice__expr-row .trpg-btn{min-width:56px;min-height:40px}.trpg-dice__expr-row .trpg-input{min-height:40px}.trpg-dice__out{grid-template-columns:1.6fr 1fr;gap:8px;display:grid}.trpg-dice__out .trpg-btn{min-height:44px}.trpg-dice__recent-head{justify-content:space-between;align-items:center;display:flex}.trpg-dice__list{max-height:168px;margin:0;padding:0;list-style:none;overflow-y:auto}.trpg-dice__item{border-bottom:1px solid var(--line);align-items:center;gap:8px;min-height:40px;font-size:13px;display:flex}.trpg-dice__item-total{min-width:2.2em;font-family:var(--font-serif);font-size:16px}.trpg-dice__item-main{overflow-wrap:anywhere;flex:1;min-width:0}@keyframes trpg-roll{0%{opacity:0;transform:translateY(-10px)scale(.9)}to{opacity:1;transform:none}}", nF = ":host{all:initial;pointer-events:inherit;--paper:#f4ecdd;--panel:#eee5d3;--card:#fffcf6;--line:#cbbca3;--ink:#2b211c;--ink-2:#6c6255;--primary:#7a2e26;--primary-ink:#fffcf6;--gold:#b8954a;--danger:#a3352b;--unsaved:#d9892b;--chrome:#2b211c;--chrome-ink:#f1ebdc;--chrome-hover:#3a2d26;--ok:#3f7a3a;--scrim:#2b211c73;--radius:10px;--radius-sm:6px;--radius-xs:4px;--shadow-card:0 1px 2px #2b211c14, 0 2px 8px #2b211c0f;--shadow-float:0 8px 28px #00000047;--font-serif:\"Songti SC\", \"Noto Serif SC\", Georgia, serif;--font-sans:\"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;font-family:var(--font-sans);color:var(--ink);font-size:14px;line-height:1.5}@media (prefers-color-scheme:dark){:host{--paper:#20231f;--panel:#2b3029;--card:#181c18;--line:#515849;--ink:#f1ebdc;--ink-2:#bcbbaa;--primary:#e6bf73;--primary-ink:#20231f;--gold:#e6bf73;--danger:#e07a6e;--unsaved:#e8a13a;--chrome:#121411;--chrome-ink:#f1ebdc;--chrome-hover:#232720;--ok:#8cc47f;--scrim:#0000008c}}*,:before,:after{box-sizing:border-box}button,input,textarea,select{font:inherit;color:inherit}button{cursor:pointer}:focus-visible{outline:2px solid var(--primary);outline-offset:2px}.trpg-sr-only{clip:rect(0 0 0 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}@media (prefers-reduced-motion:reduce){*,:before,:after{transition-duration:.01ms!important;animation-duration:.01ms!important}}", rF = "trpg-assistant-root";
function iF(e) {
	if (document.getElementById(rF)) return;
	let t = document.createElement("div");
	t.id = rF;
	let n = t.attachShadow({ mode: "open" }), r = document.createElement("style");
	r.textContent = [
		nF,
		tF,
		$P,
		eF
	].join("\n");
	let i = document.createElement("div");
	i.className = "trpg-portal";
	let a = document.createElement("div");
	n.append(r, a, i), document.body.appendChild(t), Ru(QP, {
		ctx: e,
		portalTarget: i
	}).use(ld()).mount(a);
}
// src/main.ts
async function aF() {
	window.__trpgAssistantBooted || (window.__trpgAssistantBooted = !0, await p(), iF(d()));
}
aF().catch((e) => {
	window.__trpgAssistantBooted = !1, console.error("[trpg-assistant] 启动失败", e);
});
