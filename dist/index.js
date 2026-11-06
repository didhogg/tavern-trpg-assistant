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
		r._d && Os(-1);
		let i = Er(t), a = ws.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = ws.length; e > a; e--) Es();
			Er(i), r._d && Os(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function Ar(e, t) {
	if (wr === null) return e;
	let n = pc(wr), r = e.dirs ||= [];
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
	if (Ys) {
		let n = Ys.provides, r = Ys.parent && Ys.parent.provides;
		r === n && (n = Ys.provides = Object.create(r)), n[e] = t;
	}
}
function Nr(e, t, n = !1) {
	let r = Xs();
	if (r || _o) {
		let i = _o ? _o._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && j(t) ? t.call(r && r.proxy) : t;
	}
}
function Pr() {
	return !!(Xs() || _o);
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
	if (nc) {
		if (a === "sync") {
			let e = Ir();
			l = e.__watcherHandles ||= [];
		} else if (!c) {
			let e = () => {};
			return e.stop = x, e.resume = x, e.pause = x, e;
		}
	}
	let u = Ys;
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
	return nc && (l ? l.push(f) : c && f()), f;
}
function Hr(e, t, n) {
	let r = this.proxy, i = M(e) ? e.includes(".") ? Ur(r, e) : () => r[e] : e.bind(r, r), a;
	j(t) ? a = t : (a = t.handler, n = t);
	let o = $s(this), s = Vr(i, a.bind(r), n);
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
		let n = Xs(), r = oi();
		return () => {
			let i = t.default && _i(t.default(), !0), a = i && i.length ? ui(i) : n.subTree ? X() : void 0;
			if (!a) return;
			let o = /* @__PURE__ */ R(e), { mode: s } = o;
			if (r.isLeaving) return mi(a);
			let c = hi(a);
			if (!c) return mi(a);
			let l = pi(c, o, r, n, (e) => l = e);
			c.type !== Ss && gi(c, l);
			let u = n.subTree && hi(n.subTree);
			if (u && u.type !== Ss && !js(u, c) && vi(n.subTree)) {
				let e = pi(u, o, r, n);
				if (gi(u, e), s === "out-in" && c.type !== Ss) return r.isLeaving = !0, e.afterLeave = () => {
					r.isLeaving = !1, n.job.flags & 8 || n.update(), delete e.afterLeave, u = void 0;
				}, mi(a);
				s === "in-out" && c.type !== Ss ? e.delayLeave = (e, t, n) => {
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
		for (let n of e) if (n.type !== Ss) {
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
			if (i && js(e, i)) {
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
	if ($i(e)) return e = Ls(e), e.children = null, e;
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
	else if (e.transition = t, e.type === W && k(e.children)) {
		let n = To(e.children, !1);
		n && gi(n, t);
	}
}
function _i(e, t = !1, n) {
	let r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a], s = n == null ? o.key : String(n) + String(o.key == null ? a : o.key);
		o.type === W ? (o.patchFlag & 128 && i++, r = r.concat(_i(o.children, t, s))) : (t || o.type !== Ss) && r.push(s == null ? o : Ls(o, { key: s }));
	}
	if (i > 1) for (let e = 0; e < r.length; e++) r[e].patchFlag = -2;
	return r;
}
function vi(e) {
	if (e.component) return vi(e.component.subTree);
	if (e.type === W) {
		let t = k(e.children) && To(e.children, !1);
		return t ? vi(t) : void 0;
	}
	if (e.type !== Ss) return e;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
	return j(e) ? /* @__PURE__ */ T({ name: e.name }, t, { setup: e }) : e;
}
function yi() {
	let e = Xs();
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
	let t = Xs(), n = /* @__PURE__ */ Sn(null);
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
	let a = r.shapeFlag & 4 ? pc(r.component) : r.el, o = i ? null : a, { i: s, r: c } = e, l = t && t.r, u = s.refs === y ? s.refs = {} : s.refs, d = s.setupState, f = /* @__PURE__ */ R(d), p = d === y ? S : (e) => !Si(u, e) && O(f, e), m = (e, t) => !(t && Si(u, t));
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
			case xs:
				E === 3 ? (n.data !== r.children && (Di(), n.data = r.children), D = a(n)) : r.children === "" ? (c(r.el = i(""), o(n), n), D = n) : D = x();
				break;
			case Ss:
				v(n) ? (D = a(n), _(r.el = n.content.firstChild, n, s)) : D = E !== 8 || b ? x() : a(n);
				break;
			case Cs:
				if (b && (n = a(n), E = n.nodeType), E === 1 || E === 3) {
					D = n;
					let e = !r.children.length;
					for (let t = 0; t < r.staticCount; t++) e && (r.children += D.nodeType === 1 ? D.outerHTML : D.data), t === r.staticCount - 1 && (r.anchor = D), D = a(D);
					return b ? a(D) : D;
				}
				x();
				break;
			case W:
				D = b ? m(n, r, s, l, u, y) : x();
				break;
			default: if (w & 1) D = (E !== 1 || r.type.toLowerCase() !== n.tagName.toLowerCase()) && !v(n) ? x() : f(n, r, s, l, u, y);
			else if (w & 6) {
				r.slotScopeIds = u;
				let e = o(n);
				if (D = b ? g(n) : ji(n) && n.data === "teleport start" ? g(n, n.data, "teleport end") : a(n), t(r, e, null, s, l, Ai(e), y), (Xi(r) || r.component.asyncDep) && !r.component.subTree) {
					let t;
					b ? (t = Y(Cs), t.anchor = D ? D.previousSibling : e.lastChild) : t = n.nodeType === 3 ? Rs("") : Y(n.nodeType === 8 ? Ss : "div"), t.el = n, r.component.subTree = t;
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
			(b = u && u.onVnodeBeforeMount) && Ws(b, n, t), m && jr(t, null, n, "beforeMount"), ((b = u && u.onVnodeMounted) || m || c) && vs(() => {
				b && Ws(b, n, t), c && h.enter(e), m && jr(t, null, n, "mounted");
			}, i);
		}
		return e.nextSibling;
	}, p = (e, t, r, o, s, l, u) => {
		u ||= !!t.dynamicChildren;
		let f = t.children, p = f.length, m = !1;
		for (let t = 0; t < p; t++) {
			let h = u ? f[t] : f[t] = Bs(f[t]), g = h.type === xs;
			e ? (g && !u && t + 1 < p && Bs(f[t + 1]).type === xs && (c(i(e.data.slice(h.children.length)), r, a(e)), e.data = h.children), e = d(e, h, o, s, l, u)) : g && !h.children ? c(h.el = i(""), r) : (m || (m = !0, Li(r, 1) || Di()), n(null, h, r, null, o, s, Ai(r), l));
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
			let e = Ys;
			if (bi(e), u) return () => Qi(u, e);
			let t = (t) => {
				l = null, tr(t, e, 13, !r);
			};
			if (s && e.suspense || nc) return p().then((t) => () => Qi(t, e)).catch((e) => (t(e), () => r ? Y(r, { error: e }) : null));
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
				if (c.value && r) return Y(r, { error: c.value });
				if (n && !d.value) return Qi(n, e);
			};
		}
	});
}
function Qi(e, t) {
	let { ref: n, props: r, children: i, ce: a } = t.vnode, o = Y(e, r, i);
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
		let n = Xs(), r = n.ctx;
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
				t && Ws(t, a.parent, e);
			}, s);
		}, r.deactivate = (e) => {
			let t = e.component;
			os(t.m), os(t.a), l(e, f, null, 1, s), Xo(() => {
				t.da && P(t.da);
				let n = e.props && e.props.onVnodeUnmounted;
				n && Ws(n, t.parent, e), t.isDeactivated = !0;
			}, s);
		};
		function p(e) {
			oa(e), u(e, n, s, !0);
		}
		function m(e) {
			i.forEach((t, n) => {
				let r = mc(Xi(t) ? t.type.__asyncResolved || {} : t.type);
				r && !e(r) && h(n);
			});
		}
		function h(e) {
			let t = i.get(e);
			t && (!o || !js(t, o)) ? p(t) : o && (oa(o), t && oa(t)), i.delete(e), a.delete(e);
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
			if (!As(r) || !(r.shapeFlag & 4) && !(r.shapeFlag & 128)) return o = null, r;
			let s = sa(r);
			if (s.type === Ss) return o = null, s;
			let c = s.type, l = mc(Xi(s) ? s.type.__asyncResolved || {} : c), { include: u, exclude: d, max: f } = e;
			if (u && (!l || !ta(u, l)) || d && l && ta(d, l)) return s.shapeFlag &= -257, o = s, r;
			let p = s.key == null ? c : s.key, m = i.get(p);
			return s.el && (s = Ls(s), r.shapeFlag & 128 && (r.ssContent = s)), g = p, m ? (s.el = m.el, s.component = m.component, s.transition && gi(s, s.transition), s.shapeFlag |= 512, a.delete(p), a.add(p)) : (a.add(p), f && a.size > parseInt(f, 10) && h(a.values().next().value)), s.shapeFlag |= 256, o = s, cs(r.type) ? r : s;
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
function ia(e, t, n = Ys) {
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
function ca(e, t, n = Ys, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			ft();
			let i = $s(n), a = er(t, n, e, r);
			return i(), pt(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var la = (e) => (t, n = Ys) => {
	nc && e !== "sp" || ca(e, (...e) => t(...e), n);
}, ua = la("bm"), da = la("m"), fa = la("bu"), pa = la("u"), ma = la("bum"), ha = la("um"), ga = la("sp"), _a = la("rtg"), va = la("rtc");
function ya(e, t = Ys) {
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
	let i = wr || Ys;
	if (i) {
		let n = i.type;
		if (e === ba) {
			let e = mc(n, !1);
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
		return t !== "default" && (e.name = t), G(), q(W, null, [Y("slot", e, r && r())], i ? -2 : 64);
	}
	let o = e[t];
	o && o._c && (o._d = !1);
	let s = ws.length;
	G();
	let c;
	try {
		let i = o && Aa(o(n)), s = n.key || a || i && i.key;
		c = q(W, { key: (s && !re(s) ? s : `_${t}`) + (!i && r ? "_fb" : "") }, i || (r ? r() : []), i && e._ === 1 ? 64 : -2);
	} catch (e) {
		for (let e = ws.length; e > s; e--) Es();
		throw e;
	} finally {
		o && o._c && (o._d = !0);
	}
	return !i && c.scopeId && (c.slotScopeIds = [c.scopeId + "-s"]), c;
}
function Aa(e) {
	return e.some((e) => !As(e) || !(e.type === Ss || e.type === W && !Aa(e.children))) ? e : null;
}
function ja(e, t) {
	let n = {};
	for (let r in e) n[t && /[A-Z]/.test(r) ? `on:${r}` : _e(r)] = e[r];
	return n;
}
var Ma = (e) => e ? tc(e) ? pc(e) : Ma(e.parent) : null, Na = /* @__PURE__ */ T(/* @__PURE__ */ Object.create(null), {
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
	let t = Xs();
	return t.setupContext ||= fc(t);
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
	let t = Xs(), n = nc, r = e();
	ec(), n && Qs(!1);
	let i = () => {
		$s(t), n && Qs(!0);
	}, a = () => {
		Xs() !== t && t.scope.off(), ec(), n && Qs(!1);
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
		let t = a[e], i = Z({
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
			version: bc,
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
					let u = c._ceVNode || Y(n, r);
					return u.appContext = i, l === !0 ? l = "svg" : l === !1 && (l = void 0), o && t ? t(u, a) : e(u, a, l), s = !0, c._container = a, a.__vue_app__ = c, pc(u.component);
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
	let r = Xs(), i = pe(t), a = he(t), o = yo(e, i), s = An((o, s) => {
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
			_ = Bs(l.call(t, e, u, d, p, f, m)), v = s;
		} else {
			let e = t;
			_ = Bs(e.length > 1 ? e(d, {
				attrs: s,
				slots: o,
				emit: c
			}) : e(d, null)), v = t.props ? s : Eo(s);
		}
	} catch (t) {
		ws.length = 0, tr(t, e, 1), _ = Y(Ss);
	}
	let y = _;
	if (v && h !== !1) {
		let e = Object.keys(v), { shapeFlag: t } = y;
		e.length && t & 7 && (a && e.some(w) && (v = Do(v, a)), y = Ls(y, v, !1, !0));
	}
	return n.dirs && (y = Ls(y, null, !1, !0), y.dirs = y.dirs ? y.dirs.concat(n.dirs) : n.dirs), n.transition && gi(Kr(y.type) && hi(y) || y, n.transition), _ = y, Er(g), _;
}
function To(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (As(r)) {
			if (r.type !== Ss || r.children === "v-if") {
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
					let o = $s(i);
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
var Ho = (e) => e === "_" || e === "_ctx" || e === "$stable", Uo = (e) => k(e) ? e.map(Bs) : [Bs(e)], Wo = (e, t, n) => {
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
		e && !js(e, t) && (r = pe(e), se(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === b && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case xs:
				g(e, t, n, r);
				break;
			case Ss:
				_(e, t, n, r);
				break;
			case Cs:
				e ?? v(t, n, r, o);
				break;
			case W:
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
			"value" in m && a(f, "value", null, m.value, c), (p = m.onVnodeBeforeMount) && Ws(p, i, e);
		}
		_ && jr(e, null, i, "beforeMount");
		let v = ns(s, g);
		v && g.beforeEnter(f), r(f, t, n), ((p = m && m.onVnodeMounted) || v || _) && Xo(() => {
			try {
				p && Ws(p, i, e), v && g.enter(f), _ && jr(e, null, i, "mounted");
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
			let c = e[l] = s ? Vs(e[l]) : Bs(e[l]);
			h(null, c, t, n, r, i, a, o, s);
		}
	}, O = (e, t, n, r, i, o, s) => {
		let c = t.el = e.el, { patchFlag: l, dynamicChildren: d, dirs: f } = t;
		l |= e.patchFlag & 16;
		let p = e.props || y, m = t.props || y, h;
		if (n && ts(n, !1), (h = m.onVnodeBeforeUpdate) && Ws(h, n, t, e), f && jr(t, e, n, "beforeUpdate"), n && ts(n, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (l = 0, s = !1, d = null), (p.innerHTML && m.innerHTML == null || p.textContent && m.textContent == null) && u(c, ""), d ? k(e.dynamicChildren, d, c, n, r, es(t, i), o) : s || N(e, t, c, null, n, r, es(t, i), o, !1), l > 0) {
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
			h && Ws(h, n, t, e), f && jr(t, e, n, "updated");
		}, r);
	}, k = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || ss(c), f = u && (c.type === W || !js(c, l) || c.shapeFlag & 198) ? d(u) : n;
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
		let s = e.component = Js(e, r, i);
		if ($i(e) && (s.ctx.renderer = he), rc(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, M, o, a), !e.el) {
				let r = s.subTree = Y(Ss);
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
				ts(e, !1), t ? (t.el = c.el, re(e, t, o)) : t = c, n && P(n), (f = t.props && t.props.onVnodeBeforeUpdate) && Ws(f, s, t, c), ts(e, !0);
				let p = wo(e), m = e.subTree;
				e.subTree = p, h(m, p, d(m.el), pe(m), e, i, a), t.el = p.el, u === null && jo(e, p.el), r && Xo(r, i), (f = t.props && t.props.onVnodeUpdated) && Xo(() => Ws(f, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = Xi(t);
				if (ts(e, !1), l && P(l), !m && (o = c && c.onVnodeBeforeMount) && Ws(o, d, t), ts(e, !0), s && _e) {
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
					Xo(() => Ws(o, d, e), i);
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
			let r = t[f] = c ? Vs(t[f]) : Bs(t[f]);
			h(e[f], r, n, null, i, a, o, s, c);
		}
		l > u ? fe(e, i, a, !0, !1, d) : D(t, n, r, i, a, o, s, c, d);
	}, ae = (e, t, n, r, i, a, o, s, c) => {
		let l = 0, u = t.length, d = e.length - 1, f = u - 1;
		for (; l <= d && l <= f;) {
			let r = e[l], u = t[l] = c ? Vs(t[l]) : Bs(t[l]);
			if (js(r, u)) h(r, u, n, null, i, a, o, s, c);
			else break;
			l++;
		}
		for (; l <= d && l <= f;) {
			let r = e[d], l = t[f] = c ? Vs(t[f]) : Bs(t[f]);
			if (js(r, l)) h(r, l, n, null, i, a, o, s, c);
			else break;
			d--, f--;
		}
		if (l > d) {
			if (l <= f) {
				let e = f + 1, d = e < u ? t[e].el : r;
				for (; l <= f;) h(null, t[l] = c ? Vs(t[l]) : Bs(t[l]), n, d, i, a, o, s, c), l++;
			}
		} else if (l > f) for (; l <= d;) se(e[l], i, a, !0), l++;
		else {
			let p = l, m = l, g = /* @__PURE__ */ new Map();
			for (l = m; l <= f; l++) {
				let e = t[l] = c ? Vs(t[l]) : Bs(t[l]);
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
				else for (_ = m; _ <= f; _++) if (C[_ - m] === 0 && js(r, t[_])) {
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
		else if (c === W) {
			r(s, t, n);
			for (let e = 0; e < u.length; e++) oe(u[e], t, n, a);
			r(e.anchor, t, n);
		} else if (c === Cs) S(e, t, n);
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
		if (g && (_ = o && o.onVnodeBeforeUnmount) && Ws(_, t, e), u & 6) de(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && jr(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, he, r) : l && !l.hasOnce && (a !== W || d > 0 && d & 64) ? fe(l, t, n, !1, !0) : (a === W && d & 384 || !i && u & 16) && fe(c, t, n), r && ce(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Xo(() => {
			_ && Ws(_, t, e), h && jr(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, ce = (e) => {
		let { type: t, el: n, anchor: r, transition: a } = e, o = t === W;
		if (o && !a) {
			le(n, r);
			return;
		}
		if (t === Cs) {
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
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : qs());
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
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = Vs(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && rs(t, a)), a.type === xs && (a.patchFlag === -1 && (a = i[e] = Vs(a)), a.el = t.el), a.type === Ss && !a.el && (a.el = t.el);
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
	if (h) d.pendingBranch = f, js(h, f) ? (d.deps++, c(h, f, _ ? n : d.hiddenContainer, null, i, d, a, o, s), d.deps--, d.deps <= 0 ? d.resolve() : g && !_ && !d.isFallbackMountPending && (c(m, p, n, r, i, null, a, o, s), ys(d, p))) : (d.pendingId = ls++, _ ? (d.isHydrating = !1, d.activeBranch = h) : l(h, i, d), d.deps = 0, d.effects.length = 0, d.hiddenContainer = u("div"), g ? (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 ? d.resolve() : d.isFallbackMountPending || (c(m, p, n, r, i, null, a, o, s), ys(d, p))) : m && js(m, f) ? (c(m, f, n, r, i, d, a, o, s), d.resolve(!0)) : (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 && d.resolve()));
	else if (m && js(m, f)) c(m, f, n, r, i, d, a, o, s), ys(d, f);
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
				if (ec(), !e.scope.active) {
					i && --x.deps === 0 && x.resolve();
					return;
				}
				e.asyncResolved = !0;
				let { vnode: s } = e;
				ac(e, o, !1), a && (s.el = a);
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
	e.ssContent = _s(r ? n.default : n), e.ssFallback = r ? _s(n.fallback) : Y(Ss);
}
function _s(e) {
	let t;
	if (j(e)) {
		let n = Ds && e._c;
		n && (e._d = !1, G()), e = e(), n && (e._d = !0, t = Ts, Es());
	}
	return k(e) && (e = To(e)), e = Bs(e), t && !e.dynamicChildren && (e.dynamicChildren = t.filter((t) => t !== e)), e;
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
var W = /* @__PURE__ */ Symbol.for("v-fgt"), xs = /* @__PURE__ */ Symbol.for("v-txt"), Ss = /* @__PURE__ */ Symbol.for("v-cmt"), Cs = /* @__PURE__ */ Symbol.for("v-stc"), ws = [], Ts = null;
function G(e = !1) {
	ws.push(Ts = e ? null : []);
}
function Es() {
	ws.pop(), Ts = ws[ws.length - 1] || null;
}
var Ds = 1;
function Os(e, t = !1) {
	Ds += e, e < 0 && Ts && t && (Ts.hasOnce = !0);
}
function ks(e) {
	return e.dynamicChildren = Ds > 0 ? Ts || b : null, Es(), Ds > 0 && Ts && Ts.push(e), e;
}
function K(e, t, n, r, i, a) {
	return ks(J(e, t, n, r, i, a, !0));
}
function q(e, t, n, r, i) {
	return ks(Y(e, t, n, r, i, !0));
}
function As(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function js(e, t) {
	return e.type === t.type && e.key === t.key;
}
function Ms(e) {}
var Ns = ({ key: e }) => e ?? null, Ps = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : M(e) || /* @__PURE__ */ xn(e) || j(e) ? {
	i: wr,
	r: e,
	k: t,
	f: !!n
} : e);
function J(e, t = null, n = null, r = 0, i = null, a = e === W ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && Ns(t),
		ref: t && Ps(t),
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
	return s ? (Hs(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= M(n) ? 8 : 16), Ds > 0 && !o && Ts && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Ts.push(c), c;
}
var Y = Fs;
function Fs(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== Ca || (e = Ss), As(e)) {
		let r = Ls(e, t, !0);
		return n && Hs(r, n), Ds > 0 && !a && Ts && (r.shapeFlag & 6 ? Ts[Ts.indexOf(e)] = r : Ts.push(r)), r.patchFlag = -2, r;
	}
	if (hc(e) && (e = e.__vccOpts), t) {
		t = Is(t);
		let { class: e, style: n } = t;
		e && !M(e) && (t.class = Ae(e)), N(n) && (/* @__PURE__ */ _n(n) && !k(n) && (n = T({}, n)), t.style = Te(n));
	}
	let o = M(e) ? 1 : cs(e) ? 128 : Kr(e) ? 64 : N(e) ? 4 : j(e) ? 2 : 0;
	return J(e, t, n, r, i, o, a, !0);
}
function Is(e) {
	return e ? /* @__PURE__ */ _n(e) || Po(e) ? T({}, e) : e : null;
}
function Ls(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? Us(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && Ns(l),
		ref: t && t.ref ? n && a ? k(a) ? a.concat(Ps(t)) : [a, Ps(t)] : Ps(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== W ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && Ls(e.ssContent),
		ssFallback: e.ssFallback && Ls(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && gi(u, c.clone(u)), u;
}
function Rs(e = " ", t = 0) {
	return Y(xs, null, e, t);
}
function zs(e, t) {
	let n = Y(Cs, null, e);
	return n.staticCount = t, n;
}
function X(e = "", t = !1) {
	return t ? (G(), q(Ss, null, e)) : Y(Ss, null, e);
}
function Bs(e) {
	return e == null || typeof e == "boolean" ? Y(Ss) : k(e) ? Y(W, null, e.slice()) : As(e) ? Vs(e) : Y(xs, null, String(e));
}
function Vs(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : Ls(e);
}
function Hs(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (k(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), Hs(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !Po(t) ? t._ctx = wr : r === 3 && wr && (wr.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (j(t)) {
		if (r & 65) {
			Hs(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: wr
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [Rs(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function Us(...e) {
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
function Ws(e, t, n, r = null) {
	er(e, t, 7, [n, r]);
}
var Gs = mo(), Ks = 0;
function qs() {
	return Ks;
}
function Js(e, t, n) {
	let r = e.type, i = (t ? t.appContext : e.appContext) || Gs, a = {
		uid: Ks++,
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
var Ys = null, Xs = () => Ys || wr, Zs, Qs;
{
	let e = Ce(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	Zs = t("__VUE_INSTANCE_SETTERS__", (e) => Ys = e), Qs = t("__VUE_SSR_SETTERS__", (e) => nc = e);
}
var $s = (e) => {
	let t = Ys;
	return Zs(e), e.scope.on(), () => {
		e.scope.off(), Zs(t);
	};
}, ec = () => {
	Ys && Ys.scope.off(), Zs(null);
};
function tc(e) {
	return e.vnode.shapeFlag & 4;
}
var nc = !1;
function rc(e, t = !1, n = !1) {
	t && Qs(t);
	let { props: r, children: i } = e.vnode, a = tc(e);
	Fo(e, r, a, t), Jo(e, i, n || t);
	let o = a ? ic(e, t) : void 0;
	return t && Qs(!1), o;
}
function ic(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Fa);
	let { setup: r } = n;
	if (r) {
		ft();
		let n = e.setupContext = r.length > 1 ? fc(e) : null, i = $s(e), a = $n(r, e, 0, [e.props, n]), o = ie(a);
		if (pt(), i(), (o || e.sp) && !Xi(e) && bi(e), o) {
			if (a.then(ec, ec), t) return a.then((n) => {
				Qs(!0);
				try {
					ac(e, n, t);
				} finally {
					Qs(!1);
				}
			}).catch((t) => {
				tr(t, e, 0);
			});
			e.asyncDep = a;
		} else ac(e, a, t);
	} else uc(e, t);
}
function ac(e, t, n) {
	j(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : N(t) && (e.setupState = On(t)), uc(e, n);
}
var oc, sc;
function cc(e) {
	oc = e, sc = (e) => {
		e.render._rc && (e.withProxy = new Proxy(e.ctx, Ia));
	};
}
var lc = () => !oc;
function uc(e, t, n) {
	let r = e.type;
	if (!e.render) {
		if (!t && oc && !r.render) {
			let t = r.template || ro(e).template;
			if (t) {
				let { isCustomElement: n, compilerOptions: i } = e.appContext.config, { delimiters: a, compilerOptions: o } = r, s = T(T({
					isCustomElement: n,
					delimiters: a
				}, i), o);
				r.render = oc(t, s);
			}
		}
		e.render = r.render || x, sc && sc(e);
	}
	{
		let t = $s(e);
		ft();
		try {
			$a(e);
		} finally {
			pt(), t();
		}
	}
}
var dc = { get(e, t) {
	return Ct(e, "get", ""), e[t];
} };
function fc(e) {
	return {
		attrs: new Proxy(e.attrs, dc),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function pc(e) {
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
function mc(e, t = !0) {
	return j(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function hc(e) {
	return j(e) && "__vccOpts" in e;
}
var Z = (e, t) => /* @__PURE__ */ Ln(e, t, nc);
function gc(e, t, n) {
	try {
		Os(-1);
		let r = arguments.length;
		return r === 2 ? N(t) && !k(t) ? As(t) ? Y(e, null, [t]) : Y(e, t) : Y(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && As(n) && (n = [n]), Y(e, t, n));
	} finally {
		Os(1);
	}
}
function _c() {}
function vc(e, t, n, r) {
	let i = n[r];
	if (i && yc(i, e)) return i;
	let a = t();
	return a.memo = e.slice(), a.cacheIndex = r, n[r] = a;
}
function yc(e, t) {
	let n = e.memo;
	if (n.length != t.length) return !1;
	for (let e = 0; e < n.length; e++) if (ve(n[e], t[e])) return !1;
	return Ds > 0 && Ts && Ts.push(e), !0;
}
var bc = "3.5.44", xc = x, Sc = Qn, Cc = xr, wc = Cr, Tc = {
	createComponentInstance: Js,
	setupComponent: rc,
	renderComponentRoot: wo,
	setCurrentRenderingInstance: Er,
	isVNode: As,
	normalizeVNode: Bs,
	getComponentPublicInstance: pc,
	ensureValidVNode: Aa,
	pushWarningContext: Jn,
	popWarningContext: Yn
}, Ec = void 0, Dc = typeof window < "u" && window.trustedTypes;
if (Dc) try {
	Ec = /* @__PURE__ */ Dc.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Oc = Ec ? (e) => Ec.createHTML(e) : (e) => e, kc = "http://www.w3.org/2000/svg", Ac = "http://www.w3.org/1998/Math/MathML", jc = typeof document < "u" ? document : null, Mc = jc && /* @__PURE__ */ jc.createElement("template"), Nc = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? jc.createElementNS(kc, e) : t === "mathml" ? jc.createElementNS(Ac, e) : n ? jc.createElement(e, { is: n }) : jc.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => jc.createTextNode(e),
	createComment: (e) => jc.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => jc.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Mc.innerHTML = Oc(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Mc.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Pc = "transition", Fc = "animation", Ic = /* @__PURE__ */ Symbol("_vtc"), Lc = {
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
}, Rc = /* @__PURE__ */ T({}, ci, Lc), zc = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = Rc, e))((e, { slots: t }) => gc(di, Hc(e), t)), Bc = (e, t = []) => {
	k(e) ? e.forEach((e) => e(...t)) : e && e(...t);
}, Vc = (e) => e ? k(e) ? e.some((e) => e.length > 1) : e.length > 1 : !1;
function Hc(e) {
	let t = {};
	for (let n in e) n in Lc || (t[n] = e[n]);
	if (e.css === !1) return t;
	let { name: n = "v", type: r, duration: i, enterFromClass: a = `${n}-enter-from`, enterActiveClass: o = `${n}-enter-active`, enterToClass: s = `${n}-enter-to`, appearFromClass: c = a, appearActiveClass: l = o, appearToClass: u = s, leaveFromClass: d = `${n}-leave-from`, leaveActiveClass: f = `${n}-leave-active`, leaveToClass: p = `${n}-leave-to` } = e, m = Uc(i), h = m && m[0], g = m && m[1], { onBeforeEnter: _, onEnter: v, onEnterCancelled: y, onLeave: b, onLeaveCancelled: x, onBeforeAppear: S = _, onAppear: C = v, onAppearCancelled: w = y } = t, E = (e, t, n, r) => {
		e._enterCancelled = r, Kc(e, t ? u : s), Kc(e, t ? l : o), n && n();
	}, D = (e, t) => {
		e._isLeaving = !1, Kc(e, d), Kc(e, p), Kc(e, f), t && t();
	}, O = (e) => (t, n) => {
		let i = e ? C : v, o = () => E(t, e, n);
		Bc(i, [t, o]), qc(() => {
			Kc(t, e ? c : a), Gc(t, e ? u : s), Vc(i) || Yc(t, r, h, o);
		});
	};
	return T(t, {
		onBeforeEnter(e) {
			Bc(_, [e]), Gc(e, a), Gc(e, o);
		},
		onBeforeAppear(e) {
			Bc(S, [e]), Gc(e, c), Gc(e, l);
		},
		onEnter: O(!1),
		onAppear: O(!0),
		onLeave(e, t) {
			e._isLeaving = !0;
			let n = () => D(e, t);
			Gc(e, d), e._enterCancelled ? (Gc(e, f), $c(e)) : ($c(e), Gc(e, f)), qc(() => {
				e._isLeaving && (Kc(e, d), Gc(e, p), Vc(b) || Yc(e, r, g, n));
			}), Bc(b, [e, n]);
		},
		onEnterCancelled(e) {
			E(e, !1, void 0, !0), Bc(y, [e]);
		},
		onAppearCancelled(e) {
			E(e, !0, void 0, !0), Bc(w, [e]);
		},
		onLeaveCancelled(e) {
			D(e), Bc(x, [e]);
		}
	});
}
function Uc(e) {
	if (e == null) return null;
	if (N(e)) return [Wc(e.enter), Wc(e.leave)];
	{
		let t = Wc(e);
		return [t, t];
	}
}
function Wc(e) {
	return xe(e);
}
function Gc(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.add(t)), (e[Ic] || (e[Ic] = /* @__PURE__ */ new Set())).add(t);
}
function Kc(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.remove(t));
	let n = e[Ic];
	n && (n.delete(t), n.size || (e[Ic] = void 0));
}
function qc(e) {
	requestAnimationFrame(() => {
		requestAnimationFrame(e);
	});
}
var Jc = 0;
function Yc(e, t, n, r) {
	let i = e._endId = ++Jc, a = () => {
		i === e._endId && r();
	};
	if (n != null) return setTimeout(a, n);
	let { type: o, timeout: s, propCount: c } = Xc(e, t);
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
function Xc(e, t) {
	let n = window.getComputedStyle(e), r = (e) => (n[e] || "").split(", "), i = r(`${Pc}Delay`), a = r(`${Pc}Duration`), o = Zc(i, a), s = r(`${Fc}Delay`), c = r(`${Fc}Duration`), l = Zc(s, c), u = null, d = 0, f = 0;
	t === Pc ? o > 0 && (u = Pc, d = o, f = a.length) : t === Fc ? l > 0 && (u = Fc, d = l, f = c.length) : (d = Math.max(o, l), u = d > 0 ? o > l ? Pc : Fc : null, f = u ? u === Pc ? a.length : c.length : 0);
	let p = u === Pc && /\b(?:transform|all)(?:,|$)/.test(r(`${Pc}Property`).toString());
	return {
		type: u,
		timeout: d,
		propCount: f,
		hasTransform: p
	};
}
function Zc(e, t) {
	for (; e.length < t.length;) e = e.concat(e);
	return Math.max(...t.map((t, n) => Qc(t) + Qc(e[n])));
}
function Qc(e) {
	return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function $c(e) {
	return (e ? e.ownerDocument : document).body.offsetHeight;
}
function el(e, t, n) {
	let r = e[Ic];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var tl = /* @__PURE__ */ Symbol("_vod"), nl = /* @__PURE__ */ Symbol("_vsh"), rl = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[tl] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : il(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), il(e, !0), r.enter(e)) : r.leave(e, () => {
			il(e, !1);
		}) : il(e, t));
	},
	beforeUnmount(e, { value: t }) {
		il(e, t);
	}
};
function il(e, t) {
	e.style.display = t ? e[tl] : "none", e[nl] = !t;
}
function al() {
	rl.getSSRProps = ({ value: e }) => {
		if (!e) return { style: { display: "none" } };
	};
}
var ol = /* @__PURE__ */ Symbol("");
function sl(e) {
	let t = Xs();
	if (!t) return;
	let n = t.ut = (n = e(t.proxy)) => {
		Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach((e) => ll(e, n));
	}, r = () => {
		let r = e(t.proxy);
		t.ce ? ll(t.ce, r) : cl(t.subTree, r), n(r);
	};
	fa(() => {
		mr(r);
	}), da(() => {
		Br(r, x, { flush: "post" });
		let e = new MutationObserver(r);
		e.observe(t.subTree.el.parentNode, { childList: !0 }), ha(() => e.disconnect());
	});
}
function cl(e, t) {
	if (e.shapeFlag & 128) {
		let n = e.suspense;
		e = n.activeBranch, n.pendingBranch && !n.isHydrating && n.effects.push(() => {
			cl(n.activeBranch, t);
		});
	}
	for (; e.component;) e = e.component.subTree;
	if (e.shapeFlag & 1 && e.el) ll(e.el, t);
	else if (e.type === W) e.children.forEach((e) => cl(e, t));
	else if (e.type === Cs) {
		let { el: n, anchor: r } = e;
		for (; n && (ll(n, t), n !== r);) n = n.nextSibling;
	}
}
function ll(e, t) {
	if (e.nodeType === 1) {
		let n = e.style, r = "";
		for (let e in t) {
			let i = Ue(t[e]);
			n.setProperty(`--${e}`, i), r += `--${e}: ${i};`;
		}
		n[ol] = r;
	}
}
var ul = /(?:^|;)\s*display\s*:/;
function dl(e, t, n) {
	let r = e.style, i = M(n), a = !1;
	if (n && !i) {
		if (t) {
			if (M(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? pl(r, t, "");
			}
			else for (let e in t) n[e] ?? pl(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? pl(r, i, "") : _l(e, i, !M(t) && t ? t[i] : void 0, o) || pl(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[ol];
			e && (n += ";" + e), r.cssText = n, a = ul.test(n);
		}
	} else t && e.removeAttribute("style");
	tl in e && (i && t === n || (e[tl] = a ? r.display : ""), e[nl] && (r.display = "none"));
}
var fl = /\s*!important$/;
function pl(e, t, n) {
	if (k(n)) n.forEach((n) => pl(e, t, n));
	else if (n ??= "", t.startsWith("--")) fl.test(n) ? e.setProperty(t, n.replace(fl, ""), "important") : e.setProperty(t, n);
	else {
		let r = gl(e, t);
		fl.test(n) ? e.setProperty(he(r), n.replace(fl, ""), "important") : e[r] = n;
	}
}
var ml = [
	"Webkit",
	"Moz",
	"ms"
], hl = {};
function gl(e, t) {
	let n = hl[t];
	if (n) return n;
	let r = pe(t);
	if (r !== "filter" && r in e) return hl[t] = r;
	r = ge(r);
	for (let n = 0; n < ml.length; n++) {
		let i = ml[n] + r;
		if (i in e) return hl[t] = i;
	}
	return t;
}
function _l(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && M(r) && n === r;
}
var vl = "http://www.w3.org/1999/xlink";
function yl(e, t, n, r, i, a = Me(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(vl, t.slice(6, t.length)) : e.setAttributeNS(vl, t, n) : n == null || a && !Ne(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : re(n) ? String(n) : n);
}
function bl(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Oc(n) : n);
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
function xl(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function Sl(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var Cl = /* @__PURE__ */ Symbol("_vei");
function wl(e, t, n, r, i = null) {
	let a = e[Cl] || (e[Cl] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = Dl(t);
		r ? xl(e, n, a[t] = jl(r, i), s) : o && (Sl(e, n, o, s), a[t] = void 0);
	}
}
var Tl = /(Once|Passive|Capture)$/, El = /^on:?(?:Once|Passive|Capture)$/;
function Dl(e) {
	let t, n;
	for (; (n = e.match(Tl)) && !El.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : he(e.slice(2)), t];
}
var Ol = 0, kl = /* @__PURE__ */ Promise.resolve(), Al = () => Ol ||= (kl.then(() => Ol = 0), Date.now());
function jl(e, t) {
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
	return n.value = e, n.attached = Al(), n;
}
var Ml = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Nl = (e, t, n, r, i, a) => {
	let o = i === "svg";
	t === "class" ? el(e, r, o) : t === "style" ? dl(e, n, r) : C(t) ? w(t) || wl(e, t, n, r, a) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : Pl(e, t, r, o)) ? (bl(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || yl(e, t, r, o, a, t !== "value")) : e._isVueCE && (Fl(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !M(r))) ? bl(e, pe(t), r, a, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), yl(e, t, r, o));
};
function Pl(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && Ml(t) && j(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return Ml(t) && M(n) ? !1 : t in e;
}
function Fl(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = pe(t);
	return Array.isArray(n) ? n.some((e) => pe(e) === r) : Object.keys(n).some((e) => pe(e) === r);
}
var Il = {};
// @__NO_SIDE_EFFECTS__
function Ll(e, t, n) {
	let r = /* @__PURE__ */ H(e, t);
	ce(r) && (r = T({}, r, t));
	class i extends Bl {
		constructor(e) {
			super(r, e, n);
		}
	}
	return i.def = r, i;
}
var Rl = /* @__NO_SIDE_EFFECTS__ */ ((e, t) => /* @__PURE__ */ Ll(e, t, Lu)), zl = typeof HTMLElement < "u" ? HTMLElement : class {}, Bl = class e extends zl {
	constructor(e, t = {}, n = Iu) {
		super(), this._def = e, this._props = t, this._createApp = n, this._isVueCE = !0, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = !1, this._resolved = !1, this._patching = !1, this._dirty = !1, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._styleAnchors = /* @__PURE__ */ new WeakMap(), this._ob = null, this.shadowRoot && n !== Iu ? this._root = this.shadowRoot : e.shadowRoot === !1 ? this._root = this : (this.attachShadow(T({}, e.shadowRootOptions, { mode: "open" })), this._root = this.shadowRoot);
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
		let t = this.hasAttribute(e), n = t ? this.getAttribute(e) : Il, r = pe(e);
		t && this._numberProps && this._numberProps[r] && (n = xe(n)), this._setProp(r, n, !1, !0);
	}
	_getProp(e) {
		return this._props[e];
	}
	_setProp(e, t, n = !0, r = !1) {
		if (t !== this._props[e] && (this._dirty = !0, t === Il ? delete this._props[e] : (this._props[e] = t, e === "key" && this._app && (this._app._ceVNode.key = t)), r && this._instance && this._update(), n)) {
			let n = this._ob;
			n && (this._processMutations(n.takeRecords()), n.disconnect()), t === !0 ? this.setAttribute(he(e), "") : typeof t == "string" || typeof t == "number" ? this.setAttribute(he(e), t + "") : t || this.removeAttribute(he(e)), n && n.observe(this, { attributes: !0 });
		}
	}
	_update() {
		let e = this._createVNode();
		this._app && (e.appContext = this._app._context), Pu(e, this._root);
	}
	_createVNode() {
		let e = {};
		this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
		let t = Y(this._def, T(e, this._props));
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
function Vl(e) {
	let t = Xs();
	return t && t.ce || null;
}
function Hl() {
	let e = Vl();
	return e && e.shadowRoot;
}
function Ul(e = "$style") {
	{
		let t = Xs();
		if (!t) return y;
		let n = t.type.__cssModules;
		return n && n[e] || y;
	}
}
var Wl = /* @__PURE__ */ new WeakMap(), Gl = /* @__PURE__ */ new WeakMap(), Kl = /* @__PURE__ */ Symbol("_moveCb"), ql = /* @__PURE__ */ Symbol("_enterCb"), Jl = /* @__PURE__ */ new WeakMap(), Yl = /* @__PURE__ */ ((e) => (delete e.props.mode, e))({
	name: "TransitionGroup",
	props: /* @__PURE__ */ T({}, Rc, {
		tag: String,
		moveClass: String
	}),
	setup(e, { slots: t }) {
		let n = Xs(), r = oi(), i, a, o, s, c = () => (s === void 0 && (s = i.length > 0 && iu(i[0].el, n.vnode.el, Zl(e))), s);
		return pa(() => {
			if (Jl.delete(n), !c()) {
				i = [], o = void 0;
				return;
			}
			let t = Zl(e);
			i.forEach(Xl);
			let r = o && ru(o, n.vnode.el);
			o = void 0, i.forEach((e) => Ql(e, r));
			let a = i.filter($l);
			$c(n.vnode.el), a.forEach((e) => {
				let n = e.el, r = n.style;
				Gc(n, t), r.transform = r.webkitTransform = r.transitionDuration = "";
				let i = n[Kl] = (e) => {
					e && e.target !== n || (!e || e.propertyName.endsWith("transform")) && (n.removeEventListener("transitionend", i), n[Kl] = null, Kc(n, t));
				};
				n.addEventListener("transitionend", i);
			}), i = [];
		}), () => {
			let l = /* @__PURE__ */ R(e), u = Hc(l), d = l.tag || W;
			if (i = [], s = void 0, a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && !t.el[nl] && (i.push(t), gi(t, pi(t, u, r, n)), Wl.set(t, eu(t.el)));
			}
			a = t.default ? _i(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && gi(t, pi(t, u, r, n));
			}
			return i.length && (o = tu(n), Jl.set(n, c)), Y(d, null, a);
		};
	}
});
function Xl(e) {
	let t = e.el;
	t[Kl] && t[Kl](), t[ql] && t[ql]();
}
function Zl(e) {
	return e.moveClass || `${e.name || "v"}-move`;
}
function Ql(e, t) {
	Gl.set(e, eu(e.el, t));
}
function $l(e) {
	let t = Wl.get(e), n = Gl.get(e), r = t.left - n.left, i = t.top - n.top;
	if (r || i) {
		let t = e.el, n = t.style, a = t.getBoundingClientRect(), o = 1, s = 1;
		return t.offsetWidth && (o = a.width / t.offsetWidth), t.offsetHeight && (s = a.height / t.offsetHeight), Number.isFinite(o) && o !== 0 || (o = 1), Number.isFinite(s) && s !== 0 || (s = 1), Math.abs(o - 1) < .01 && (o = 1), Math.abs(s - 1) < .01 && (s = 1), n.transform = n.webkitTransform = `translate(${r / o}px,${i / s}px)`, n.transitionDuration = "0s", e;
	}
}
function eu(e, t) {
	let n = e.getBoundingClientRect();
	return {
		left: n.left - (t ? t.left : 0),
		top: n.top - (t ? t.top : 0)
	};
}
function tu(e) {
	let t;
	for (let n = e.parent; n; n = n.parent) {
		let r = Jl.get(n);
		if (r) {
			let i = nu(n.vnode.el, e.vnode.el);
			i && (t ||= []).push(T(eu(i), {
				item: i,
				willMove: r
			}));
		}
	}
	return t;
}
function nu(e, t) {
	let n = e.nodeType === 1 ? e : e.parentNode;
	for (; t && t.parentNode !== n;) t = t.parentNode;
	if (t && t.nodeType === 1) return t;
}
function ru(e, t) {
	let n = e.find((e) => e.willMove() && e.item.contains(t));
	return n && eu(n.item, n);
}
function iu(e, t, n) {
	let r = e.cloneNode(), i = e[Ic];
	i && i.forEach((e) => {
		e.split(/\s+/).forEach((e) => e && r.classList.remove(e));
	}), n.split(/\s+/).forEach((e) => e && r.classList.add(e)), r.style.display = "none";
	let a = t.nodeType === 1 ? t : t.parentNode;
	a.appendChild(r);
	let { hasTransform: o } = Xc(r);
	return a.removeChild(r), o;
}
var au = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return k(t) ? (e) => P(t, e) : t;
};
function ou(e) {
	e.target.composing = !0;
}
function su(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var cu = /* @__PURE__ */ Symbol("_assign"), lu = /* @__PURE__ */ Symbol("_initialValue");
function uu(e, t, n) {
	return t && (e = e.trim()), n && (e = be(e)), e;
}
var du = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[lu] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[lu] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[cu] = au(i);
		let a = r || i.props && i.props.type === "number";
		xl(e, t ? "change" : "input", (t) => {
			t.target.composing || e[cu](uu(e.value, n, a));
		}), (n || a) && xl(e, "change", () => {
			e.value = uu(e.value, n, a);
		}), t || (xl(e, "compositionstart", ou), xl(e, "compositionend", su), xl(e, "change", su));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[lu];
		delete e[lu], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[cu](uu(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[cu] = au(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? be(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, fu = {
	deep: !0,
	created(e, t, n) {
		e[cu] = au(n), xl(e, "change", () => {
			let t = e._modelValue, n = vu(e), r = e.checked, i = e[cu];
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
			} else i(yu(e, r));
		});
	},
	mounted: pu,
	beforeUpdate(e, t, n) {
		e[cu] = au(n), pu(e, t, n);
	}
};
function pu(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (k(t)) i = ze(t, r.props.value) > -1;
	else if (te(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = Re(t, yu(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var mu = {
	created(e, { value: t }, n) {
		e.checked = Re(t, n.props.value), e[cu] = au(n), xl(e, "change", () => {
			e[cu](vu(e));
		});
	},
	beforeUpdate(e, { value: t, oldValue: n }, r) {
		e[cu] = au(r), t !== n && (e.checked = Re(t, r.props.value));
	}
}, hu = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, xl(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? be(vu(e)) : vu(e)), r = e.multiple, i = r ? te(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? k(i) ? t.slice() : t : i];
			try {
				e[cu](i);
			} finally {
				ur(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[cu] = au(r);
	},
	mounted(e, { value: t }) {
		_u(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[cu] = au(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, n && n[0] === e.multiple && gu(t, n[1], n[0]) || _u(e, t);
	}
};
function gu(e, t, n) {
	if (!n || k(e)) return Re(e, t);
	if (te(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function _u(e, t) {
	let n = e.multiple, r = k(t);
	if (!n || r || te(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = vu(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : ze(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (Re(vu(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function vu(e) {
	return "_value" in e ? e._value : e.value;
}
function yu(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var bu = {
	created(e, t, n) {
		Su(e, t, n, null, "created");
	},
	mounted(e, t, n) {
		Su(e, t, n, null, "mounted");
	},
	beforeUpdate(e, t, n, r) {
		Su(e, t, n, r, "beforeUpdate");
	},
	updated(e, t, n, r) {
		Su(e, t, n, r, "updated");
	}
};
function xu(e, t) {
	switch (e) {
		case "SELECT": return hu;
		case "TEXTAREA": return du;
		default: switch (t) {
			case "checkbox": return fu;
			case "radio": return mu;
			default: return du;
		}
	}
}
function Su(e, t, n, r, i) {
	let a = xu(e.tagName, n.props && n.props.type)[i];
	a && a(e, t, n, r);
}
function Cu() {
	du.getSSRProps = ({ value: e }) => ({ value: e }), mu.getSSRProps = ({ value: e }, t) => {
		if (t.props && Re(t.props.value, e)) return { checked: !0 };
	}, fu.getSSRProps = ({ value: e }, t) => {
		if (k(e)) {
			if (t.props && ze(e, t.props.value) > -1) return { checked: !0 };
		} else if (te(e)) {
			if (t.props && e.has(t.props.value)) return { checked: !0 };
		} else if (e) return { checked: !0 };
	}, bu.getSSRProps = (e, t) => {
		if (typeof t.type != "string") return;
		let n = xu(t.type.toUpperCase(), t.props && t.props.type);
		if (n.getSSRProps) return n.getSSRProps(e, t);
	};
}
var wu = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Tu = {
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
	exact: (e, t) => wu.some((n) => e[`${n}Key`] && !t.includes(n))
}, Eu = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Tu[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, Du = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, Ou = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = he(n.key);
		if (t.some((e) => e === r || Du[e] === r)) return e(n);
	}));
}, ku = /* @__PURE__ */ T({ patchProp: Nl }, Nc), Au, ju = !1;
function Mu() {
	return Au ||= Zo(ku);
}
function Nu() {
	return Au = ju ? Au : Qo(ku), ju = !0, Au;
}
var Pu = ((...e) => {
	Mu().render(...e);
}), Fu = ((...e) => {
	Nu().hydrate(...e);
}), Iu = ((...e) => {
	let t = Mu().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = zu(e);
		if (!r) return;
		let i = t._component;
		j(i) || i.render || i.template || (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Ru(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
}), Lu = ((...e) => {
	let t = Nu().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let t = zu(e);
		if (t) return n(t, !0, Ru(t));
	}, t;
});
function Ru(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function zu(e) {
	return M(e) ? document.querySelector(e) : e;
}
var Bu = !1, Vu = () => {
	Bu || (Bu = !0, Cu(), al());
}, Hu = /* @__PURE__ */ s({
	BaseTransition: () => di,
	BaseTransitionPropsValidators: () => ci,
	Comment: () => Ss,
	DeprecationTypes: () => null,
	EffectScope: () => Ge,
	ErrorCodes: () => Zn,
	ErrorTypeStrings: () => Sc,
	Fragment: () => W,
	KeepAlive: () => ea,
	ReactiveEffect: () => Xe,
	Static: () => Cs,
	Suspense: () => us,
	Teleport: () => ti,
	Text: () => xs,
	TrackOpTypes: () => Rn,
	Transition: () => zc,
	TransitionGroup: () => Yl,
	TriggerOpTypes: () => zn,
	VueElement: () => Bl,
	assertNumber: () => Xn,
	callWithAsyncErrorHandling: () => er,
	callWithErrorHandling: () => $n,
	camelize: () => pe,
	capitalize: () => ge,
	cloneVNode: () => Ls,
	compatUtils: () => null,
	compile: () => Uu,
	computed: () => Z,
	createApp: () => Iu,
	createBlock: () => q,
	createCommentVNode: () => X,
	createElementBlock: () => K,
	createElementVNode: () => J,
	createHydrationRenderer: () => Qo,
	createPropsRestProxy: () => Xa,
	createRenderer: () => Zo,
	createSSRApp: () => Lu,
	createSlots: () => ka,
	createStaticVNode: () => zs,
	createTextVNode: () => Rs,
	createVNode: () => Y,
	customRef: () => An,
	defineAsyncComponent: () => Zi,
	defineComponent: () => H,
	defineCustomElement: () => Ll,
	defineEmits: () => Ra,
	defineExpose: () => za,
	defineModel: () => Ha,
	defineOptions: () => Ba,
	defineProps: () => La,
	defineSSRCustomElement: () => Rl,
	defineSlots: () => Va,
	devtools: () => Cc,
	effect: () => ct,
	effectScope: () => Ke,
	getCurrentInstance: () => Xs,
	getCurrentScope: () => qe,
	getCurrentWatcher: () => Un,
	getTransitionRawChildren: () => _i,
	guardReactiveProps: () => Is,
	h: () => gc,
	handleError: () => tr,
	hasInjectionContext: () => Pr,
	hydrate: () => Fu,
	hydrateOnIdle: () => Wi,
	hydrateOnInteraction: () => Ji,
	hydrateOnMediaQuery: () => qi,
	hydrateOnVisible: () => Ki,
	initCustomFormatter: () => _c,
	initDirectivesForSSR: () => Vu,
	inject: () => Nr,
	isMemoSame: () => yc,
	isProxy: () => _n,
	isReactive: () => mn,
	isReadonly: () => hn,
	isRef: () => xn,
	isRuntimeOnly: () => lc,
	isShallow: () => gn,
	isVNode: () => As,
	markRaw: () => vn,
	mergeDefaults: () => Ja,
	mergeModels: () => Ya,
	mergeProps: () => Us,
	nextTick: () => ur,
	nodeOps: () => Nc,
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
	openBlock: () => G,
	patchProp: () => Nl,
	popScopeId: () => Or,
	provide: () => Mr,
	proxyRefs: () => On,
	pushScopeId: () => Dr,
	queuePostFlushCb: () => mr,
	reactive: () => ln,
	readonly: () => dn,
	ref: () => z,
	registerRuntimeCompiler: () => cc,
	render: () => Pu,
	renderList: () => Oa,
	renderSlot: () => U,
	resolveComponent: () => Sa,
	resolveDirective: () => Ta,
	resolveDynamicComponent: () => wa,
	resolveFilter: () => null,
	resolveTransitionHooks: () => pi,
	setBlockTracking: () => Os,
	setDevtoolsHook: () => wc,
	setTransitionHooks: () => gi,
	shallowReactive: () => un,
	shallowReadonly: () => fn,
	shallowRef: () => Sn,
	ssrContextKey: () => Fr,
	ssrUtils: () => Tc,
	stop: () => lt,
	toDisplayString: () => F,
	toHandlerKey: () => _e,
	toHandlers: () => ja,
	toRaw: () => R,
	toRef: () => Pn,
	toRefs: () => jn,
	toValue: () => En,
	transformVNodeArgs: () => Ms,
	triggerRef: () => Tn,
	unref: () => B,
	useAttrs: () => Ga,
	useCssModule: () => Ul,
	useCssVars: () => sl,
	useHost: () => Vl,
	useId: () => yi,
	useModel: () => vo,
	useSSRContext: () => Ir,
	useShadowRoot: () => Hl,
	useSlots: () => Wa,
	useTemplateRef: () => xi,
	useTransitionState: () => oi,
	vModelCheckbox: () => fu,
	vModelDynamic: () => bu,
	vModelRadio: () => mu,
	vModelSelect: () => hu,
	vModelText: () => du,
	vShow: () => rl,
	version: () => bc,
	warn: () => xc,
	watch: () => Br,
	watchEffect: () => Lr,
	watchPostEffect: () => Rr,
	watchSyncEffect: () => zr,
	withAsyncContext: () => Za,
	withCtx: () => V,
	withDefaults: () => Ua,
	withDirectives: () => Ar,
	withKeys: () => Ou,
	withMemo: () => vc,
	withModifiers: () => Eu,
	withScopeId: () => kr
}), Uu = () => {};
// node_modules/zod/v4/core/util.js
function Wu(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function Gu(e, t = "|") {
	return e.map((e) => gd(e)).join(t);
}
function Ku(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var qu = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function Ju(e) {
	return new qu(e);
}
function Yu(e) {
	return e == null;
}
function Xu(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function Zu(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function Qu(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function $u(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function ed(e) {
	return $u(e._zod.def) ?? e._zod.def.shape;
}
function td(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return Qu(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function nd(e, t, n) {
	t in e ? Qu(e, t, n) : e[t] = n;
}
function rd(e, t, n, r) {
	let i = ed(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? td(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : nd(e, a, r ? r(n.value, a) : n.value));
	}
}
function id(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? td(e, n, () => t[n]) : nd(e, n, r.value));
	}
}
function ad(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function od(e) {
	return JSON.stringify(e);
}
function sd(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var cd = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function ld(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var ud = /* @__PURE__*/ Ju(() => {
	if (sf.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function dd(e) {
	if (ld(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return ld(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function fd(e) {
	return dd(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var pd = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function md(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function hd(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function Q(e) {
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
function gd(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function _d(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var vd = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, yd = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function bd(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return rd(i, e, xd(e, t)), hd(e, ad(n, {
		shape: i,
		checks: []
	}));
}
function xd(e, t) {
	let n = ed(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function Sd(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(xd(e, t)), a = {};
	return rd(a, e, Reflect.ownKeys(ed(e)).filter((e) => !i.has(e))), hd(e, ad(n, {
		shape: a,
		checks: []
	}));
}
function Cd(e, t) {
	if (!dd(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = ed(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return hd(e, ad(e._zod.def, { shape: wd(e, t) }));
}
function wd(e, t) {
	let n = {};
	return rd(n, e, Reflect.ownKeys(ed(e))), id(n, t), n;
}
function Td(e, t) {
	if (!dd(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return hd(e, ad(e._zod.def, { shape: wd(e, t) }));
}
function Ed(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return rd(n, e, Reflect.ownKeys(ed(e))), rd(n, t, Reflect.ownKeys(ed(t))), hd(e, ad(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function Dd(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(xd(t, n)) : void 0, o = {};
	return rd(o, t, Reflect.ownKeys(ed(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), hd(t, ad(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Od(e, t, n) {
	let r = n ? new Set(xd(t, n)) : void 0, i = {};
	return rd(i, t, Reflect.ownKeys(ed(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), hd(t, ad(t._zod.def, { shape: i }));
}
function kd(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function Ad(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function jd(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Md(e) {
	return typeof e == "string" ? e : e?.message;
}
function Nd(e) {
	let t = [];
	for (let n of e ?? []) {
		let e = n._zod.def;
		if (!/_(length|size)$|_equals$/.test(e.check)) break;
		let r = e.maximum ?? e.length ?? e.size;
		r >= 0 && t.push([r, n]);
	}
	return t;
}
function Pd(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function Fd(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Md(e.inst?._zod.def?.error?.(e)) ?? Md(a?.(e)) ?? Md(t?.error?.(e)) ?? Md(n.customError?.(e)) ?? Md(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var Id = /[\uD800-\uDBFF]/;
function Ld(e) {
	let t = e.length;
	if (!Id.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function Rd(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function zd(e) {
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
function Bd(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function Vd(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : Gd(e, n, r.value);
	}
}
function Hd(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function Ud(e, t, n) {
	return Hd(e, t, n, !1);
}
/* @__NO_SIDE_EFFECTS__ */
function Wd(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return Hd(this, n, r(this));
			},
			set(e) {
				Hd(this, n, e);
			}
		});
	}
	return t;
}
function Gd(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : Hd(this, t, n.bind(this));
		},
		set(e) {
			Hd(this, t, e);
		}
	});
}
function Kd(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var qd, Jd = !1, Yd = {
	configurable: !0,
	get() {
		Jd = !0;
	}
};
function Xd(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	t in r && qd !== e._zod ? qd = void 0 : (qd = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, Yd);
			let e = Jd;
			Jd = !1;
			try {
				let r = n(this);
				return Jd ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), Jd ||= e, r;
			} catch (n) {
				throw delete this[t], Jd ||= e, n;
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
function Zd(e, t, n, r) {
	let i = Kd(e, t);
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
var Qd = "~constantCatch";
function $d(e) {
	let t = () => e;
	return t[Qd] = !0, t;
}
// node_modules/zod/v4/core/core.js
var ef, tf = {
	value: void 0,
	enumerable: !1
}, nf = "captureStackTrace" in Error ? Error : null;
function rf(e) {
	let t = nf;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return nf = null, new e();
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
function $(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			tf.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", tf);
			} finally {
				tf.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), Vd(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? rf(u) : this;
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
var af = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, of = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(ef = globalThis).__zod_globalConfig ?? (ef.__zod_globalConfig = {});
var sf = globalThis.__zod_globalConfig;
function cf(e) {
	return e && Object.assign(sf, e), sf;
}
// node_modules/zod/v4/core/errors.js
function lf() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, Ku, 2), e.message;
}
function uf(e) {
	this._zod.message = e;
}
var df = {
	get: lf,
	set: uf,
	enumerable: !0,
	configurable: !0
}, ff = {
	value: void 0,
	enumerable: !1
}, pf = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), mf = /* @__PURE__ */ $("$ZodError", (e, t) => {
	e.name = "$ZodError", ff.value = t, Object.defineProperty(e, "issues", ff), ff.value = void 0, Object.defineProperty(e, "message", df);
	let n = Object.getPrototypeOf(e);
	pf.has(n) || (pf.add(n), Object.defineProperty(n, "toString", {
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
function hf(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function gf(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? hf(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function _f(e, t = (e) => e.message) {
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
function vf(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var yf = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new af();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => Fd(e, o, cf())));
			throw cd(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, bf = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => Fd(e, o, cf())));
			throw cd(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, xf = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new af();
	return a.issues.length ? Sf(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function Sf(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => Fd(e, n, cf()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var Cf = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? Sf(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, wf = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Tf = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Ef = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== wf) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return Df(e, t, n);
});
function Df(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[Tf] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new af();
	return a.issues.length === 0;
}
var Of = async (e, t, n) => {
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
}, kf = (e) => {
	let t = yf(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, vf(n, a));
	};
	return n;
}, Af = (e) => {
	let t = yf(e), n = (e, r, i, a) => t(e, r, i, vf(n, a));
	return n;
}, jf = (e) => {
	let t = bf(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, vf(n, a));
	};
	return n;
}, Mf = (e) => {
	let t = bf(e), n = async (e, r, i, a) => await t(e, r, i, vf(n, a));
	return n;
}, Nf = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return xf(e)(t, n, i);
}, Pf = (e) => (t, n, r) => xf(e)(t, n, r), Ff = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Cf(e)(t, n, i);
}, If = (e) => async (t, n, r) => Cf(e)(t, n, r), Lf = /^[cC][0-9a-z]{6,}$/, Rf = /^[0-9a-z]+$/, zf = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Bf = /^[0-9a-vA-V]{20}$/, Vf = /^[A-Za-z0-9]{27}$/, Hf = /^[a-zA-Z0-9_-]{21}$/;
function Uf(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var Wf = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Gf = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Kf = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, qf = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Jf = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function Yf() {
	return new RegExp(Jf, "u");
}
var Xf = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Zf = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Qf = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, $f = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, ep = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, tp = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, np = /^https?$/, rp = /^\+[1-9]\d{6,14}$/, ip = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function ap(e) {
	return RegExp(`^${e}$`);
}
var op = /*@__PURE__*/ ap(ip);
function sp(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function cp(e) {
	return RegExp(`^${sp(e)}$`);
}
function lp(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${sp({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${sp({ precision: e.precision })}` : n;
	return RegExp(`^${ip}T(?:${r})$`);
}
var up = /^[\s\S]{0,}$/, dp = /^-?\d+(?:\.\d+)?$/, fp = /^(?:true|false)$/i, pp = /^[^A-Z]*$/, mp = /^[^a-z]*$/, hp = /*@__PURE__*/ $("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), gp = (e) => {
	let t = e.value;
	return !Yu(t) && t.length !== void 0;
}, _p = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, vp = /*@__PURE__*/ $("$ZodCheckLessThan", (e, t) => {
	hp.init(e, t);
	let n = _p[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: _p[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), yp = /*@__PURE__*/ $("$ZodCheckGreaterThan", (e, t) => {
	hp.init(e, t);
	let n = _p[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: _p[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), bp = /*@__PURE__*/ $("$ZodCheckMultipleOf", (e, t) => {
	hp.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : Zu(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), xp = /*@__PURE__*/ $("$ZodCheckNumberFormat", (e, t) => {
	hp.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = vd[t.format];
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
}), Sp = /*@__PURE__*/ $("$ZodCheckMaxLength", (e, t) => {
	var n;
	hp.init(e, t), (n = e._zod.def).when ?? (n.when = gp), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? Ld(r) : i) <= t.maximum) return;
		let a = Rd(r);
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
}), Cp = /*@__PURE__*/ $("$ZodCheckMinLength", (e, t) => {
	var n;
	hp.init(e, t), (n = e._zod.def).when ?? (n.when = gp), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? Ld(r) : i) >= t.minimum) return;
		let a = Rd(r);
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
}), wp = /*@__PURE__*/ $("$ZodCheckLengthEquals", (e, t) => {
	var n;
	hp.init(e, t), (n = e._zod.def).when ?? (n.when = gp), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? Ld(r) : i;
		if (a === t.length) return;
		let o = Rd(r), s = a > t.length;
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
}), Tp = /*@__PURE__*/ $("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	hp.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
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
}), Ep = /*@__PURE__*/ $("$ZodCheckRegex", (e, t) => {
	Tp.init(e, t), e._zod.check = (n) => {
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
}), Dp = /*@__PURE__*/ $("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= pp, Tp.init(e, t);
}), Op = /*@__PURE__*/ $("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= mp, Tp.init(e, t);
}), kp = /*@__PURE__*/ $("$ZodCheckIncludes", (e, t) => {
	hp.init(e, t);
	let n = md(t.includes);
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
}), Ap = /*@__PURE__*/ $("$ZodCheckStartsWith", (e, t) => {
	hp.init(e, t);
	let n = RegExp(`^${md(t.prefix)}.*`);
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
}), jp = /*@__PURE__*/ $("$ZodCheckEndsWith", (e, t) => {
	hp.init(e, t);
	let n = RegExp(`.*${md(t.suffix)}$`);
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
}), Mp = /*@__PURE__*/ $("$ZodCheckOverwrite", (e, t) => {
	hp.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Np = class {
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
}, Pp = {
	major: 4,
	minor: 6,
	patch: 7
}, Fp = /*@__PURE__*/ $("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Pp;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = kd(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (Ad(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new af();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (Pd(t.issues, n, e), i ||= kd(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					Pd(t.issues, n, e), i ||= kd(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (kd(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new af();
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
				if (a.async === !1) throw new af();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return Ud(this, "~standard", Rp(this));
	},
	set "~standard"(e) {
		Hd(this, "~standard", e);
	}
}), Ip = (e, t) => e.issues.length ? { issues: e.issues.map((e) => Fd(e, t, cf())) } : { value: e.value };
async function Lp(e, t) {
	let n = { async: !0 };
	return Ip(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function Rp(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return Ip(r, n);
			} catch {}
			return Lp(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var zp = /*@__PURE__*/ $("$ZodString", (e, t) => {
	Fp.init(e, t), e._zod.pattern = t.pattern ?? up, e._zod.parse = (n, r) => {
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
}), Bp = /*@__PURE__*/ $("$ZodStringFormat", (e, t) => {
	Tp.init(e, t), zp.init(e, t);
}), Vp = /*@__PURE__*/ $("$ZodGUID", (e, t) => {
	t.pattern ??= Gf, Bp.init(e, t);
}), Hp = /*@__PURE__*/ $("$ZodUUID", (e, t) => {
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
		t.pattern ??= Kf(e);
	} else t.pattern ??= Kf();
	Bp.init(e, t);
}), Up = /*@__PURE__*/ $("$ZodEmail", (e, t) => {
	t.pattern ??= qf, Bp.init(e, t);
});
function Wp(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function Gp(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? Wp(e) || 2 : Kp(e, t);
}
function Kp(e, t) {
	if (!t.normalize && t.protocol?.source === np.source && !/^https?:\/\//i.test(e)) return 1;
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
var qp = /[\t\n\r]/g;
function Jp(e) {
	return e.replace(qp, "");
}
function Yp(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function Xp(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var Zp = /*@__PURE__*/ $("$ZodURL", (e, t) => {
	Bp.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = Gp(r, t);
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
				n.value = Jp(r);
				return;
			}
			t.hostname && !Yp(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !Xp(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : Jp(r);
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
}), Qp = /*@__PURE__*/ $("$ZodEmoji", (e, t) => {
	t.pattern ??= Yf(), Bp.init(e, t);
}), $p = /*@__PURE__*/ $("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? Hf : Uf(t.length), Bp.init(e, t);
}), em = /*@__PURE__*/ $("$ZodCUID", (e, t) => {
	t.pattern ??= Lf, Bp.init(e, t);
}), tm = /*@__PURE__*/ $("$ZodCUID2", (e, t) => {
	t.pattern ??= Rf, Bp.init(e, t);
}), nm = /*@__PURE__*/ $("$ZodULID", (e, t) => {
	t.pattern ??= zf, Bp.init(e, t);
}), rm = /*@__PURE__*/ $("$ZodXID", (e, t) => {
	t.pattern ??= Bf, Bp.init(e, t);
}), im = /*@__PURE__*/ $("$ZodKSUID", (e, t) => {
	t.pattern ??= Vf, Bp.init(e, t);
}), am = /*@__PURE__*/ $("$ZodISODateTime", (e, t) => {
	t.pattern ??= lp(t), Bp.init(e, t);
}), om = /*@__PURE__*/ $("$ZodISODate", (e, t) => {
	t.pattern ??= op, Bp.init(e, t);
}), sm = /*@__PURE__*/ $("$ZodISOTime", (e, t) => {
	t.pattern ??= cp(t), Bp.init(e, t);
}), cm = /*@__PURE__*/ $("$ZodISODuration", (e, t) => {
	t.pattern ??= Wf, Bp.init(e, t);
}), lm = /*@__PURE__*/ $("$ZodIPv4", (e, t) => {
	t.pattern ??= Xf, Bp.init(e, t);
}), um = /^[0-9a-fA-F:.]+$/;
function dm(e) {
	return um.test(e) ? Wp(`http://[${e}]`) : !1;
}
var fm = /*@__PURE__*/ $("$ZodIPv6", (e, t) => {
	t.pattern ??= Zf, Bp.init(e, t), e._zod.check = (n) => {
		dm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), pm = /*@__PURE__*/ $("$ZodCIDRv4", (e, t) => {
	t.pattern ??= Qf, Bp.init(e, t);
});
function mm(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : dm(n);
}
var hm = /*@__PURE__*/ $("$ZodCIDRv6", (e, t) => {
	t.pattern ??= $f, Bp.init(e, t), e._zod.check = (n) => {
		mm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function gm(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var _m = /^[0-9a-zA-Z+/]*={0,2}$/, vm = /*@__PURE__*/ $("$ZodBase64", (e, t) => {
	t.pattern ??= _m, Bp.init(e, t), e._zod.check = (n) => {
		gm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), ym = /^[A-Za-z0-9_-]*$/;
function bm(e) {
	if (!ym.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return gm(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var xm = /*@__PURE__*/ $("$ZodBase64URL", (e, t) => {
	t.pattern ??= ym, Bp.init(e, t), e._zod.check = (n) => {
		bm(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Sm = /*@__PURE__*/ $("$ZodE164", (e, t) => {
	t.pattern ??= rp, Bp.init(e, t);
});
function Cm(e, t = null) {
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
var wm = /*@__PURE__*/ $("$ZodJWT", (e, t) => {
	Bp.init(e, t), e._zod.check = (n) => {
		Cm(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Tm = /*@__PURE__*/ $("$ZodNumber", (e, t) => {
	Fp.init(e, t), e._zod.pattern = dp, e._zod.parse = (n, r) => {
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
}), Em = /*@__PURE__*/ $("$ZodNumberFormat", (e, t) => {
	xp.init(e, t), Tm.init(e, t);
}), Dm = /*@__PURE__*/ $("$ZodBoolean", (e, t) => {
	Fp.init(e, t), e._zod.pattern = fp, e._zod.parse = (n, r) => {
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
}), Om = /*@__PURE__*/ $("$ZodUnknown", (e, t) => {
	Fp.init(e, t), e._zod.parse = (e) => e;
}), km = /*@__PURE__*/ $("$ZodNever", (e, t) => {
	Fp.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Am(e, t) {
	let n = Nd(e._zod.def.checks);
	if (!n.length) return;
	let r = Math.min(...n.map((e) => e[0])), i = e._zod.parse;
	e._zod.parse = (n, a) => {
		let o = t(n.value);
		if (o > r && !a?.skipChecks && a?.direction !== "backward") {
			for (let [t, r] of Nd(e._zod.def.checks)) if (o > t && r._zod.def.when(n)) {
				let t = n.issues.length;
				return r._zod.check(n), n.issues[t].continue = !1, Pd(n.issues, t, e), n;
			}
		}
		return i(n, a);
	};
}
var jm = (e) => Array.isArray(e) ? e.length : -1;
function Mm(e, t, n) {
	e.issues.length && t.issues.push(...jd(n, e.issues)), t.value[n] = e.value;
}
var Nm = /*@__PURE__*/ $("$ZodArray", (e, t) => {
	Fp.init(e, t);
	let n = sf.memoizer;
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
			if (c instanceof Promise) o.push(c.then((t) => Mm(t, r, e)));
			else if (Mm(c, r, e), s && c.issues.length !== 0 && kd(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	}, Am(e, jm);
});
function Pm(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...jd(n, e.issues));
		}
		!o && i === void 0 ? e.issues.length || t.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [n]
		}) : e.value === void 0 ? (o || i === "defaulted" && !s) && (t.value[n] = void 0) : t.value[n] = e.value;
	}
}
var Fm = [];
function Im(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Fm, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = _d(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function Lm(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (kd(n, p)) break;
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
		a instanceof Promise ? e.push(a.then((e) => Pm(e, n, i, t, d, f))) : Pm(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Rm = /*@__PURE__*/ $("$ZodObject", (e, t) => {
	Fp.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = Ju(() => Im(t));
	Xd(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || Qu(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = ld, o = t.catchall, s, c = sf.memoizer;
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
				if (kd(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => Pm(n, t, e, r, a, o))) : Pm(s, t, e, r, a, o);
		}
		return o ? Lm(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), zm = /*@__PURE__*/ $("$ZodObjectJIT", (e, t) => {
	Rm.init(e, t);
	let n = e._zod.parse, r = Ju(() => Im(t)), i = sf.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new Np(["payload", "ctx"], {
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
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : od(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
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
	}, o, s = ld, c = !sf.jitless, l = c && ud.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? Lm([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function Bm(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !kd(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => Fd(e, r, cf())))
	}), t);
}
var Vm = /*@__PURE__*/ $("$ZodUnion", (e, t) => {
	Fp.init(e, t), Xd(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), Xd(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), Xd(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), Xd(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => Xu(e.source)).join("|")})$`);
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
		return a ? Promise.all(o).then((t) => Bm(t, r, e, i)) : Bm(o, r, e, i);
	};
}), Hm = /*@__PURE__*/ $("$ZodIntersection", (e, t) => {
	Fp.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Wm(e, t, n)) : Wm(e, i, a);
	};
});
function Um(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (dd(e) && dd(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = Um(e[n], t[n]);
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
			let i = e[r], a = t[r], o = Um(i, a);
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
function Wm(e, t, n) {
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
	let c = Um(t.value, n.value);
	if (!c.valid) {
		if (kd(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var Gm = /*@__PURE__*/ $("$ZodEnum", (e, t) => {
	Fp.init(e, t);
	let n = Wu(t.entries), r = new Set(n);
	e._zod.values = r, Xd(e, "pattern", (e) => {
		let t = Wu(e.def.entries).filter((e) => pd.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => md(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), Km = /*@__PURE__*/ $("$ZodTransform", (e, t) => {
	Fp.init(e, t), e._zod.optin = "optional", sf.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new of(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new af();
		return n.value = i, n;
	};
});
function qm(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var Jm = /*@__PURE__*/ $("$ZodOptional", (e, t) => {
	Fp.init(e, t), Xd(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", Xd(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), Xd(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${Xu(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => qm(e, t)) : qm(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), Ym = /*@__PURE__*/ $("$ZodExactOptional", (e, t) => {
	Jm.init(e, t), Xd(e, "values", (e) => e.def.innerType._zod.values), Xd(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Xm = /*@__PURE__*/ $("$ZodNullable", (e, t) => {
	Fp.init(e, t), Xd(e, "optin", (e) => e.def.innerType._zod.optin), Xd(e, "optout", (e) => e.def.innerType._zod.optout), Xd(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${Xu(t.source)}|null)$`) : void 0;
	}), Xd(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Zm = /*@__PURE__*/ $("$ZodDefault", (e, t) => {
	Fp.init(e, t), e._zod.optin = "defaulted", Xd(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Qm(e, t)) : Qm(r, t);
	};
});
function Qm(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var $m = /*@__PURE__*/ $("$ZodPrefault", (e, t) => {
	Fp.init(e, t), e._zod.optin = "defaulted", Xd(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), eh = /*@__PURE__*/ $("$ZodNonOptional", (e, t) => {
	Fp.init(e, t), Xd(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => th(t, e)) : th(i, e);
	};
});
function th(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function nh(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => Fd(e, r, cf())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var rh = /*@__PURE__*/ $("$ZodCatch", (e, t) => {
	Fp.init(e, t), Xd(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), Xd(e, "optout", (e) => e.def.innerType._zod.optout), Xd(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => nh(e, r, t, n)) : nh(e, r, t, n);
	};
}), ih = /*@__PURE__*/ $("$ZodPipe", (e, t) => {
	Fp.init(e, t), Xd(e, "values", (e) => e.def.in._zod.values), Xd(e, "optin", (e) => e.def.in._zod.optin), Xd(e, "optout", (e) => e.def.out._zod.optout), Xd(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => ah(e, t.in, n)) : ah(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => ah(e, t.out, n)) : ah(r, t.out, n);
	};
});
function ah(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var oh = /*@__PURE__*/ $("$ZodReadonly", (e, t) => {
	Fp.init(e, t), Xd(e, "propValues", (e) => e.def.innerType._zod.propValues), Xd(e, "values", (e) => e.def.innerType._zod.values), Xd(e, "optin", (e) => e.def.innerType?._zod?.optin), Xd(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(sh) : sh(r);
	};
});
function sh(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var ch = /*@__PURE__*/ $("$ZodCustom", (e, t) => {
	hp.init(e, t), Fp.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => lh(t, n, r, e));
		lh(i, n, r, e);
	};
});
function lh(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Bd(e));
	}
}
// node_modules/zod/v4/core/memoizer.js
var uh = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, dh = "~memo", fh = [];
function ph(e) {
	return typeof e == "object" && !!e;
}
function mh(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var hh = /*@__PURE__*/ new WeakMap(), gh = 0, _h = 1, vh = 2;
function yh(e, t, n) {
	let r = hh.get(e);
	if (r !== void 0) return r ? vh : gh;
	if (t.has(e)) return vh;
	t.add(e);
	let i = gh, a = (e) => {
		if (i !== vh && e?._zod) {
			let r = yh(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = gh;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? _h : o.value?._zod ? yh(o.value, t, n) : gh;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = $u(c);
			s(e ? o(e, !0) : _h), a(c.catchall);
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
			s(r ? yh(r, t, !1) : _h);
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
	return t.delete(e), bh(e, i);
}
function bh(e, t) {
	return t !== _h && hh.set(e, t === vh), t;
}
function xh(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var Sh, Ch = [], wh = {
	alloc(e, t, n) {
		let r = Sh;
		if (!r) return n;
		Sh = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), Ch.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && Eh(n, e.value)) throw new uh();
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
					let i = yh(e, /* @__PURE__ */ new Set(), !1);
					if (i === gh) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === vh || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!ph(l)) return t(s, c);
				let u = c[dh];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[dh] = u);
				let d;
				i === c ? d = a : (d = xh(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...mh(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				Sh = d;
				let p = Ch.length, m = t(s, c);
				Sh = void 0;
				let h = Ch.length > p ? Ch.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? mh(e.issues) : fh), e)) : (h && (h.issues = m.issues.length ? mh(m.issues) : fh), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function Th() {
	return wh;
}
function Eh(e, t) {
	let n = e[dh]?.backEdges;
	return n !== void 0 && ph(t) && n.has(t);
}
// node_modules/zod/v4/locales/en.js
var Dh = () => {
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
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(zd(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${gd(e.values[0])}` : `Invalid option: expected one of ${Gu(e.values, "|")}`;
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
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${Gu(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function Oh() {
	return { localeError: Dh() };
}
// node_modules/zod/v4/core/registries.js
var kh, Ah = class {
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
function jh() {
	return new Ah();
}
(kh = globalThis).__zod_globalRegistry ?? (kh.__zod_globalRegistry = jh());
var Mh = globalThis.__zod_globalRegistry;
// node_modules/zod/v4/core/api.js
function Nh(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function Ph(e, t) {
	return new e(Nh({
		type: "string",
		...Q(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Fh(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ih(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Lh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Rh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function zh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Bh(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Vh(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Hh(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Uh(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Wh(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Gh(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Kh(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function qh(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Jh(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Yh(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xh(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zh(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qh(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $h(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function eg(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function tg(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ng(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function rg(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ig(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ag(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function og(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sg(e, t) {
	return new e(Nh({
		type: "number",
		checks: [],
		...Q(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function cg(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function lg(e, t) {
	return new e({
		type: "boolean",
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ug(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function dg(e, t) {
	return new e({
		type: "never",
		...Q(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fg(e, t) {
	return new vp({
		check: "less_than",
		...Q(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function pg(e, t) {
	return new vp({
		check: "less_than",
		...Q(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function mg(e, t) {
	return new yp({
		check: "greater_than",
		...Q(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function hg(e, t) {
	return new yp({
		check: "greater_than",
		...Q(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function gg(e, t) {
	return new bp({
		check: "multiple_of",
		...Q(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function _g(e, t) {
	return new Sp({
		check: "max_length",
		...Q(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function vg(e, t) {
	return new Cp({
		check: "min_length",
		...Q(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function yg(e, t) {
	return new wp({
		check: "length_equals",
		...Q(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function bg(e, t) {
	return new Ep({
		check: "string_format",
		format: "regex",
		...Q(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function xg(e) {
	return new Dp({
		check: "string_format",
		format: "lowercase",
		...Q(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Sg(e) {
	return new Op({
		check: "string_format",
		format: "uppercase",
		...Q(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Cg(e, t) {
	return new kp({
		check: "string_format",
		format: "includes",
		...Q(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function wg(e, t) {
	return new Ap({
		check: "string_format",
		format: "starts_with",
		...Q(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Tg(e, t) {
	return new jp({
		check: "string_format",
		format: "ends_with",
		...Q(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Eg(e) {
	return new Mp({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Dg(e) {
	return /* @__PURE__ */ Eg((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Og() {
	return /* @__PURE__ */ Eg((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function kg() {
	return /* @__PURE__ */ Eg((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Ag() {
	return /* @__PURE__ */ Eg((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function jg() {
	return /* @__PURE__ */ Eg((e) => sd(e));
}
// @__NO_SIDE_EFFECTS__
function Mg(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...Q(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Ng(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...Q(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Pg(e, t) {
	let n = /* @__PURE__ */ Fg((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(Bd(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(Bd(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function Fg(e, t) {
	let n = new hp({
		check: "custom",
		...Q(t)
	});
	return n._zod.check = e, n;
}
// node_modules/zod/v4/core/to-json-schema.js
function Ig(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && Qu(e, t, n[t]);
	return e;
}
function Lg(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Mh,
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
function Rg(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function zg(e, t, n = {
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
		a && (o.ref ||= a, zg(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Ig(o.schema, c), t.io === "input" && Yg(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Bg(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Vg(e, t) {
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
				ref: `${i("__shared")}#/${r}/${Bg(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + Bg(a)
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
function Hg(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		Hg(e);
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
var Ug = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), Wg = ["oneOf", "anyOf"];
function Gg(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function Kg(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!Ug.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? Gg(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			Qu(n, r, e.length === 1 ? e[0] : Kg(e) ?? { allOf: e });
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
			let t = Gg(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function qg(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of Ug) if (t in e) return;
	let n = t.filter((e) => Wg.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = Kg(t);
	else {
		let e = n[0], i = Wg.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => Kg([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, Ig(e, r));
}
function Jg(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Ig(i, s), Ig(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) Hg(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) qg(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Ig(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, Qu(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: Zg(t, "input", e.processors),
					output: Zg(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function Yg(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return Yg(r.element, n);
	if (r.type === "set") return Yg(r.valueType, n);
	if (r.type === "lazy") return Yg(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return Yg(r.innerType, n);
	if (r.type === "intersection") return Yg(r.left, n) || Yg(r.right, n);
	if (r.type === "record" || r.type === "map") return Yg(r.keyType, n) || Yg(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : Yg(r.in, n) || Yg(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (Yg(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (Yg(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (Yg(e, n)) return !0;
		return !!(r.rest && Yg(r.rest, n));
	}
	return !1;
}
var Xg = (e, t = {}) => (n) => {
	let r = Lg({
		...n,
		processors: t
	});
	return zg(e, r), Vg(r, e), Jg(r, e);
}, Zg = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Lg({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return zg(e, o), Vg(o, e), Jg(o, e);
}, Qg = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, $g = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, e_ = (e, t) => {
	Qg(e, "minimum", t), $g(e, "maximum", t);
}, t_ = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, n_ = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, r_ = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, i_ = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, a_ = (e, t) => Qg(e, "minimum", t.minimum), o_ = (e, t) => $g(e, "maximum", t.maximum), s_ = (e) => (t, n) => {
	i_(t, n.format);
	let [r, i] = e[n.format];
	Qg(t, "minimum", r), $g(t, "maximum", i);
}, c_ = {
	greater_than: (e, t) => Qg(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => $g(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => t_(e, t.value),
	number_format: s_(vd),
	bigint_format: s_(yd),
	min_length: a_,
	max_length: o_,
	length_equals: (e, t) => e_(e, t.length),
	min_size: a_,
	max_size: o_,
	size_equals: (e, t) => e_(e, t.size),
	string_format: (e, t) => {
		i_(e, t.format), t.pattern && n_(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => r_(e, t.mime)
};
function l_(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) c_[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && Qg(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && Qg(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && $g(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && $g(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && t_(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && r_(t, i.mime);
	for (let e of i.patterns ?? []) n_(t, e);
	return t;
}
var u_ = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, d_ = /* @__PURE__ */ new Map([[_m, ep], [ym, tp]]), f_ = (e) => d_.get(e) ?? e, p_ = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = l_(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = u_[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(f_);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, m_ = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = l_(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : Rg(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, h_ = (e, t, n, r) => {
	n.type = "boolean";
}, g_ = (e, t, n, r) => {
	n.not = {};
}, __ = (e, t, n, r) => {
	let i = e._zod.def, a = Wu(i.entries);
	a.length === 0 ? n.not = {} : (a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a);
}, v_ = (e, t, n, r) => {
	Rg(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, y_ = (e, t, n, r) => {
	Rg(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, b_ = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = l_(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = zg(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function x_(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? x_(t.out) : t.type === "catch" ? x_(t.innerType) : e._zod.optin;
}
var S_ = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && Rg(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) Qu(i.properties, e, zg(o[e], t, {
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
		(t.io === "input" ? x_(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = zg(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, C_ = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => zg(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, w_ = (e, t, n, r) => {
	let i = e._zod.def, a = zg(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = zg(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
}, T_ = (e, t, n, r) => {
	let i = e._zod.def, a = zg(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, E_ = (e, t, n, r) => {
	let i = e._zod.def;
	zg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, D_ = Symbol();
function O_(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (Rg(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), D_) : JSON.parse(o);
}
var k_ = (e, t, n, r) => {
	let i = e._zod.def;
	zg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = O_(i.defaultValue, e, t, n, r);
	o !== D_ && (n.default = o);
}, A_ = (e, t, n, r) => {
	let i = e._zod.def;
	zg(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = O_(i.defaultValue, e, t, n, r);
	o !== D_ && (n._prefault = o);
}, j_ = (e, t, n, r) => {
	let i = e._zod.def;
	zg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		Rg(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, M_ = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	zg(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, N_ = (e, t, n, r) => {
	let i = e._zod.def;
	zg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, P_ = (e, t, n, r) => {
	let i = e._zod.def;
	zg(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, F_ = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function I_(e, t, n) {
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
var L_ = /*@__PURE__*/ $("ZodError", (e, t) => {
	mf.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	F_.has(n) || (F_.add(n), I_(n, "format", (e) => (t) => _f(e, t)), I_(n, "flatten", (e) => (t) => gf(e, t)), I_(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, Ku, 2);
	}), I_(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, Ku, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), R_ = /* @__PURE__ */ yf(L_), z_ = /* @__PURE__ */ bf(L_), B_ = /* @__PURE__ */ xf(L_), V_ = /* @__PURE__ */ Cf(L_), H_ = /* @__PURE__ */ kf(L_), U_ = /* @__PURE__ */ Af(L_), W_ = /* @__PURE__ */ jf(L_), G_ = /* @__PURE__ */ Mf(L_), K_ = /* @__PURE__ */ Nf(L_), q_ = /* @__PURE__ */ Pf(L_), J_ = /* @__PURE__ */ Ff(L_), Y_ = /* @__PURE__ */ If(L_);
// node_modules/zod/v4/classic/schemas.js
function X_() {
	sf.localeError || cf(Oh());
}
function Z_() {
	sf.memoizer || cf({ memoizer: Th() });
}
var Q_ = /*@__PURE__*/ $("ZodType", (e, t) => (X_(), Fp.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(ad(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return hd(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(my(e, t));
	},
	superRefine(e, t) {
		return this.check(hy(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ Eg(e));
	},
	optional() {
		return Xv(this);
	},
	exactOptional() {
		return Qv(this);
	},
	nullable() {
		return ey(this);
	},
	nullish() {
		return Xv(ey(this));
	},
	nonoptional(e) {
		return oy(this, e);
	},
	array() {
		return Lv(this);
	},
	or(e) {
		return Hv([this, e]);
	},
	and(e) {
		return Wv(this, e);
	},
	transform(e) {
		return uy(this, Jv(e));
	},
	default(e) {
		return ny(this, e);
	},
	prefault(e) {
		return iy(this, e);
	},
	catch(e) {
		return cy(this, e);
	},
	pipe(e) {
		return uy(this, e);
	},
	readonly() {
		return fy(this);
	},
	describe(e) {
		let t = this.clone();
		return Mh.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return Mh.get(this);
		let t = this.clone();
		return Mh.add(t, e[0]), t;
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
		return Ud(this, "~standard", {
			...Rp(this),
			jsonSchema: {
				input: Zg(this, "input"),
				output: Zg(this, "output")
			}
		});
	},
	set "~standard"(e) {
		Hd(this, "~standard", e);
	},
	parse: function e(t, n) {
		return R_(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await z_(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return B_(this, e, t);
	},
	async safeParseAsync(e, t) {
		return V_(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		Hd(this, "spa", e);
	},
	validate(e, t) {
		return Ef(this, e, t);
	},
	validateAsync(e, t) {
		return Of(this, e, t);
	},
	encode: function e(t, n) {
		return H_(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return U_(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await W_(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await G_(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return K_(this, e, t);
	},
	safeDecode(e, t) {
		return q_(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return J_(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return Y_(this, e, t);
	},
	toJSONSchema(e) {
		return Xg(this, {})(e);
	},
	get description() {
		return Mh.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), $_ = /*@__PURE__*/ $("_ZodString", (e, t) => {
	zp.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => p_(e, t, n, r);
}, /*@__PURE__*/ Wd({
	format: (e) => l_(e).format ?? null,
	minLength: (e) => l_(e).minimum ?? null,
	maxLength: (e) => l_(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ bg(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ Cg(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ wg(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ Tg(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ vg(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ _g(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ yg(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ vg(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ xg(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ Sg(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ Og());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ Dg(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ kg());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ Ag());
	},
	slugify() {
		return this.check(/* @__PURE__ */ jg());
	}
})), ev = /*@__PURE__*/ $("ZodString", (e, t) => {
	zp.init(e, t), $_.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ Fh(sv, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ Vh(uv, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ ng(Tv, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ Hh(dv, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ Ih(cv, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Lh(lv, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ Rh(lv, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ zh(lv, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Bh(lv, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ Uh(fv, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ Wh(pv, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ Gh(mv, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ Kh(hv, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ $h(Sv, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ eg(Cv, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ qh(gv, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ Jh(_v, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ Yh(vv, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ Xh(yv, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ Zh(bv, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ Qh(xv, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ tg(wv, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ rg(rv, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ ig(iv, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ ag(av, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ og(ov, e));
	}
});
function tv(e) {
	return /* @__PURE__ */ Ph(ev, e);
}
var nv = /*@__PURE__*/ $("ZodStringFormat", (e, t) => {
	Bp.init(e, t), $_.init(e, t);
}), rv = /*@__PURE__*/ $("ZodISODateTime", (e, t) => {
	am.init(e, t), nv.init(e, t);
}), iv = /*@__PURE__*/ $("ZodISODate", (e, t) => {
	om.init(e, t), nv.init(e, t);
}), av = /*@__PURE__*/ $("ZodISOTime", (e, t) => {
	sm.init(e, t), nv.init(e, t);
}), ov = /*@__PURE__*/ $("ZodISODuration", (e, t) => {
	cm.init(e, t), nv.init(e, t);
}), sv = /*@__PURE__*/ $("ZodEmail", (e, t) => {
	Up.init(e, t), nv.init(e, t);
}), cv = /*@__PURE__*/ $("ZodGUID", (e, t) => {
	Vp.init(e, t), nv.init(e, t);
}), lv = /*@__PURE__*/ $("ZodUUID", (e, t) => {
	Hp.init(e, t), nv.init(e, t);
}), uv = /*@__PURE__*/ $("ZodURL", (e, t) => {
	Zp.init(e, t), nv.init(e, t);
}), dv = /*@__PURE__*/ $("ZodEmoji", (e, t) => {
	Qp.init(e, t), nv.init(e, t);
}), fv = /*@__PURE__*/ $("ZodNanoID", (e, t) => {
	$p.init(e, t), nv.init(e, t);
}), pv = /*@__PURE__*/ $("ZodCUID", (e, t) => {
	em.init(e, t), nv.init(e, t);
}), mv = /*@__PURE__*/ $("ZodCUID2", (e, t) => {
	tm.init(e, t), nv.init(e, t);
}), hv = /*@__PURE__*/ $("ZodULID", (e, t) => {
	nm.init(e, t), nv.init(e, t);
}), gv = /*@__PURE__*/ $("ZodXID", (e, t) => {
	rm.init(e, t), nv.init(e, t);
}), _v = /*@__PURE__*/ $("ZodKSUID", (e, t) => {
	im.init(e, t), nv.init(e, t);
}), vv = /*@__PURE__*/ $("ZodIPv4", (e, t) => {
	lm.init(e, t), nv.init(e, t);
}), yv = /*@__PURE__*/ $("ZodIPv6", (e, t) => {
	fm.init(e, t), nv.init(e, t);
}), bv = /*@__PURE__*/ $("ZodCIDRv4", (e, t) => {
	pm.init(e, t), nv.init(e, t);
}), xv = /*@__PURE__*/ $("ZodCIDRv6", (e, t) => {
	hm.init(e, t), nv.init(e, t);
}), Sv = /*@__PURE__*/ $("ZodBase64", (e, t) => {
	vm.init(e, t), nv.init(e, t);
}), Cv = /*@__PURE__*/ $("ZodBase64URL", (e, t) => {
	xm.init(e, t), nv.init(e, t);
}), wv = /*@__PURE__*/ $("ZodE164", (e, t) => {
	Sm.init(e, t), nv.init(e, t);
}), Tv = /*@__PURE__*/ $("ZodJWT", (e, t) => {
	wm.init(e, t), nv.init(e, t);
}), Ev = /*@__PURE__*/ $("ZodNumber", (e, t) => {
	Tm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => m_(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ Wd({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = l_(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = l_(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = l_(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => l_(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ mg(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ hg(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ hg(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ fg(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ pg(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ pg(e, t));
	},
	int(e) {
		return this.check(kv(e));
	},
	safe(e) {
		return this.check(kv(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ mg(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ hg(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ fg(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ pg(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ gg(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ gg(e, t));
	},
	finite() {
		return this;
	}
}));
function Dv(e) {
	return /* @__PURE__ */ sg(Ev, e);
}
var Ov = /*@__PURE__*/ $("ZodNumberFormat", (e, t) => {
	Em.init(e, t), Ev.init(e, t);
});
function kv(e) {
	return /* @__PURE__ */ cg(Ov, e);
}
var Av = /*@__PURE__*/ $("ZodBoolean", (e, t) => {
	Dm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => h_(e, t, n, r);
});
function jv(e) {
	return /* @__PURE__ */ lg(Av, e);
}
var Mv = /*@__PURE__*/ $("ZodUnknown", (e, t) => {
	Om.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Nv() {
	return /* @__PURE__ */ ug(Mv);
}
var Pv = /*@__PURE__*/ $("ZodNever", (e, t) => {
	km.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => g_(e, t, n, r);
});
function Fv(e) {
	return /* @__PURE__ */ dg(Pv, e);
}
var Iv = /*@__PURE__*/ $("ZodArray", (e, t) => {
	Z_(), Nm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => b_(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ vg(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ vg(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ _g(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ yg(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function Lv(e, t) {
	return /* @__PURE__ */ Mg(Iv, e, t);
}
var Rv = /*@__PURE__*/ $("ZodObject", (e, t) => {
	Z_(), zm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => S_(e, t, n, r), Zd(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return Kv(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(ad(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(ad(this._zod.def, { catchall: Nv() }));
	},
	loose() {
		return this.clone(ad(this._zod.def, { catchall: Nv() }));
	},
	strict() {
		return this.clone(ad(this._zod.def, { catchall: Fv() }));
	},
	strip() {
		return this.clone(ad(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Cd(this, e);
	},
	safeExtend(e) {
		return Td(this, e);
	},
	merge(e) {
		return Ed(this, e);
	},
	pick(e) {
		return bd(this, e);
	},
	omit(e) {
		return Sd(this, e);
	},
	partial(...e) {
		return Dd(Yv, this, e[0]);
	},
	exactPartial(...e) {
		return Dd(Zv, this, e[0], "exactPartial");
	},
	required(...e) {
		return Od(ay, this, e[0]);
	}
});
function zv(e, t) {
	return new Rv({
		type: "object",
		shape: e ?? {},
		...Q(t)
	});
}
function Bv(e, t) {
	return new Rv({
		type: "object",
		shape: e,
		catchall: Nv(),
		...Q(t)
	});
}
var Vv = /*@__PURE__*/ $("ZodUnion", (e, t) => {
	Vm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => C_(e, t, n, r), e.options = t.options;
});
function Hv(e, t) {
	return new Vv({
		type: "union",
		options: e,
		...Q(t)
	});
}
var Uv = /*@__PURE__*/ $("ZodIntersection", (e, t) => {
	Hm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => w_(e, t, n, r);
});
function Wv(e, t) {
	return new Uv({
		type: "intersection",
		left: e,
		right: t
	});
}
var Gv = /*@__PURE__*/ $("ZodEnum", (e, t) => {
	Gm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => __(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new Gv({
			...t,
			checks: [],
			...Q(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new Gv({
			...t,
			checks: [],
			...Q(r),
			entries: i
		});
	};
});
function Kv(e, t) {
	return new Gv({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...Q(t)
	});
}
var qv = /*@__PURE__*/ $("ZodTransform", (e, t) => {
	Z_(), Km.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => y_(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new of(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Bd(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(Bd(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function Jv(e) {
	return new qv({
		type: "transform",
		transform: e
	});
}
var Yv = /*@__PURE__*/ $("ZodOptional", (e, t) => {
	Jm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => P_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Xv(e) {
	return new Yv({
		type: "optional",
		innerType: e
	});
}
var Zv = /*@__PURE__*/ $("ZodExactOptional", (e, t) => {
	Ym.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => P_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Qv(e) {
	return new Zv({
		type: "optional",
		innerType: e
	});
}
var $v = /*@__PURE__*/ $("ZodNullable", (e, t) => {
	Xm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => T_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function ey(e) {
	return new $v({
		type: "nullable",
		innerType: e
	});
}
var ty = /*@__PURE__*/ $("ZodDefault", (e, t) => {
	Zm.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => k_(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function ny(e, t) {
	return new ty({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : fd(t);
		}
	});
}
var ry = /*@__PURE__*/ $("ZodPrefault", (e, t) => {
	$m.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => A_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function iy(e, t) {
	return new ry({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : fd(t);
		}
	});
}
var ay = /*@__PURE__*/ $("ZodNonOptional", (e, t) => {
	eh.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => E_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function oy(e, t) {
	return new ay({
		type: "nonoptional",
		innerType: e,
		...Q(t)
	});
}
var sy = /*@__PURE__*/ $("ZodCatch", (e, t) => {
	rh.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => j_(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function cy(e, t) {
	return new sy({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : $d(t)
	});
}
var ly = /*@__PURE__*/ $("ZodPipe", (e, t) => {
	ih.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => M_(e, t, n, r), e.in = t.in, e.out = t.out;
});
function uy(e, t) {
	return new ly({
		type: "pipe",
		in: e,
		out: t
	});
}
var dy = /*@__PURE__*/ $("ZodReadonly", (e, t) => {
	oh.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => N_(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function fy(e) {
	return new dy({
		type: "readonly",
		innerType: e
	});
}
var py = /*@__PURE__*/ $("ZodCustom", (e, t) => {
	ch.init(e, t), Q_.init(e, t), e._zod.processJSONSchema = (t, n, r) => v_(e, t, n, r);
});
function my(e, t = {}) {
	return /* @__PURE__ */ Ng(py, e, t);
}
function hy(e, t) {
	return /* @__PURE__ */ Pg(e, t);
}
// src/schemas/common.ts
var gy = {
	workspace: 4,
	save: 4
}, _y = tv().regex(/^[a-z0-9][a-z0-9-]*$/, "必须是小写字母、数字与短横线").max(64);
tv().regex(/^\d+\.\d+\.\d+$/, "必须是 x.y.z 形式的版本号");
var vy = Dv().int().nonnegative(), yy = Bv({}), by = zv({
	ownerKey: tv().min(1),
	ownerLabel: tv(),
	ruleId: _y,
	currentSaveId: tv().nullable(),
	data: yy,
	savedHash: tv(),
	schemaVersion: Dv().int(),
	updatedAt: vy
}), xy = zv({
	partyNames: Lv(tv()).default([]),
	partyCount: Dv().int().nonnegative().default(0),
	location: tv().optional(),
	round: Dv().int().optional()
}), Sy = Kv([
	"读档前",
	"新存档前",
	"切换规则前",
	"恢复备份前",
	"改动模组前"
]), Cy = zv({
	id: tv().min(1),
	ownerKey: tv().min(1),
	ownerLabel: tv(),
	ruleId: _y,
	name: tv().min(1).max(80),
	note: tv().max(400).default(""),
	kind: Kv(["manual", "auto"]),
	autoReason: Sy.optional(),
	branchedFrom: tv().optional(),
	createdAt: vy,
	updatedAt: vy,
	deletedAt: vy.optional(),
	summary: xy,
	snapshot: yy,
	hash: tv(),
	schemaVersion: Dv().int()
}), wy = zv({
	reminderDays: Dv().int().positive().default(7),
	reminderSaves: Dv().int().positive().default(10)
}), Ty = zv({
	lastExportAt: vy.nullable().default(null),
	savesSinceExport: Dv().int().nonnegative().default(0),
	persistRequested: jv().default(!1),
	persistGranted: jv().default(!1)
}), Ey = 864e5;
function Dy(e, t, n) {
	if (e.lastExportAt === null) return {
		kind: "never",
		daysSince: null,
		savesSince: e.savesSinceExport,
		text: "还没有导出过备份"
	};
	let r = Math.max(0, Math.floor((n - e.lastExportAt) / Ey)), i = r >= t.reminderDays || e.savesSinceExport >= t.reminderSaves, a = r === 0 ? "今天" : `${r} 天前`, o = i ? `建议导出备份 · 上次完整备份：${a}，之后保存 ${e.savesSinceExport} 次` : `上次完整备份：${a} · 之后保存 ${e.savesSinceExport} 次`;
	return {
		kind: i ? "due" : "ok",
		daysSince: r,
		savesSince: e.savesSinceExport,
		text: o
	};
}
async function Oy(e) {
	return Ty.parse(await e.getMeta("backup") ?? {});
}
async function ky(e) {
	return wy.parse(await e.getMeta("settings") ?? {});
}
async function Ay(e, t) {
	let n = await Oy(e);
	await e.setMeta("backup", {
		...n,
		lastExportAt: t,
		savesSinceExport: 0
	});
}
async function jy(e, t = globalThis.navigator?.storage) {
	let n = await Oy(e);
	if (n.persistRequested) return n;
	let r = t?.persist ? await t.persist() : !1, i = {
		...n,
		persistRequested: !0,
		persistGranted: r
	};
	return await e.setMeta("backup", i), i;
}
// src/core/ids.ts
function My() {
	let e = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(e), e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
	let t = Array.from(e, (e) => e.toString(16).padStart(2, "0"));
	return `${t.slice(0, 4).join("")}-${t.slice(4, 6).join("")}-${t.slice(6, 8).join("")}-${t.slice(8, 10).join("")}-${t.slice(10).join("")}`;
}
function Ny(e) {
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
// node_modules/dexie/import-wrapper.mjs
var Py = /* @__PURE__ */ l((/* @__PURE__ */ o(((e, t, n) => {
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
})))(), 1), Fy = Symbol.for("Dexie"), Iy = globalThis[Fy] || (globalThis[Fy] = Py.default);
if (Py.default.semVer !== Iy.semVer) throw Error(`Two different versions of Dexie loaded in the same app: ${Py.default.semVer} and ${Iy.semVer}`);
var { liveQuery: Ly, mergeRanges: Ry, rangesOverlap: zy, RangeSet: By, cmp: Vy, Entity: Hy, PropModification: Uy, replacePrefix: Wy, add: Gy, remove: Ky, DexieYProvider: qy } = Iy, Jy = "tavern-trpg-assistant", Yy = class extends Iy {
	blobs;
	workspaces;
	saves;
	meta;
	constructor(e = Jy) {
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
}, Xy = class extends Error {
	code;
	details;
	constructor(e, t, n) {
		super(t), this.name = "TrpgError", this.code = e, this.details = n;
	}
}, Zy = (e) => e / 2 ** 32 | 0, Qy = (e) => e >>> 0;
function $y(e, t, n, r) {
	let i = Zy(n), a = Qy(n);
	e.setUint32(t, r ? a : i, r), e.setUint32(t + 4, r ? i : a, r);
}
// node_modules/@noble/hashes/utils.js
function eb(e) {
	return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
var tb = (e) => e ? `"${e}" ` : "";
function nb(e, t = "") {
	if (typeof e != "number") throw TypeError(tb(t) + "expected number, got " + typeof e);
	if (!Number.isSafeInteger(e) || e < 0) throw RangeError(tb(t) + "expected integer >= 0, got " + e);
	return e;
}
function rb(e, t, n = "") {
	if (eb(e) && (t === void 0 || e.length === t)) return e;
	t !== void 0 && nb(t, "length");
	let r = eb(e), i = t === void 0 ? "" : ` of length ${t}`, a = r ? `length=${e.length}` : `type=${typeof e}`, o = tb(n) + "expected Uint8Array" + i + ", got " + a;
	throw r ? RangeError(o) : TypeError(o);
}
var ib = (e, t) => {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError((t === "object" ? "" : `"${t}" `) + "expected object, got type=" + typeof e);
}, ab = (e, t) => {
	ib(e, t);
	let n = Object.getPrototypeOf(e);
	if (n !== Object.prototype && n !== null) throw TypeError(`"${t}" expected plain object`);
	if (Object.hasOwn(e, "__proto__")) throw TypeError(`"${t}.__proto__" is not allowed`);
};
function ob(e, t = !0) {
	if (e.destroyed) throw Error("hash was destroyed");
	if (t && e.finished) throw Error("digest() was already called");
}
function sb(e, t) {
	rb(e, void 0, "output");
	let n = t.outputLen;
	if (!(e.length >= n)) throw RangeError("\"output\" expected length >= " + n);
}
function cb(...e) {
	for (let t = 0; t < e.length; t++) e[t].fill(0);
}
function lb(e) {
	return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function ub(e, t) {
	return e << 32 - t | e >>> t;
}
var db = typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", fb = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function pb(e) {
	if (rb(e), db) return e.toHex();
	let t = "";
	for (let n = 0; n < e.length; n++) t += fb[e[n]];
	return t;
}
function mb(e) {
	if (typeof e != "string") throw TypeError("string expected");
	let t = new TextEncoder().encode(e);
	try {
		return new Uint8Array(t);
	} finally {
		cb(t);
	}
}
function hb(e, t, n = "opts") {
	return ab(e, "defaults"), t !== void 0 && ab(t, n), Object.assign(Object.create(null), e, t);
}
function gb(e, t = {}) {
	if (typeof e != "function") throw TypeError("\"hashCons\" expected function, got type=" + typeof e);
	t = hb({}, t, "info");
	let n = (t, n) => e(n).update(t).digest(), r = e(void 0);
	return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.canXOF = r.canXOF, n.create = (t) => e(t), Object.assign(n, t), Object.freeze(n);
}
var _b = (e) => ({ oid: Uint8Array.from([
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
function vb(e, t, n) {
	return e & t ^ ~e & n;
}
function yb(e, t, n) {
	return e & t ^ e & n ^ t & n;
}
var bb = class {
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
		this.blockLen = e, this.outputLen = t, this.padOffset = n, this.isLE = r, this.buffer = new Uint8Array(e), this.view = lb(this.buffer);
	}
	update(e) {
		ob(this), rb(e);
		let { view: t, buffer: n, blockLen: r } = this, i = e.length, a = !1;
		for (let o = 0; o < i;) {
			let s = Math.min(r - this.pos, i - o);
			if (s === r) {
				let t = lb(e);
				for (; r <= i - o; o += r) this.process(t, o);
				a = !0;
			} else n.set(o === 0 && s === i ? e : e.subarray(o, o + s), this.pos), this.pos += s, o += s, this.pos === r && (this.process(t, 0), this.pos = 0, a = !0);
		}
		return this.length += e.length, a && this.roundClean(), this;
	}
	digestInto(e) {
		ob(this), sb(e, this), this.finished = !0;
		let { buffer: t, view: n, blockLen: r, isLE: i } = this, { pos: a } = this;
		t[a++] = 128, t.fill(0, a), this.padOffset > r - a && (this.process(n, 0), t.fill(0)), $y(n, r - 8, this.length * 8, i), this.process(n, 0), this.roundClean();
		let o = e === t ? n : lb(e), s = this.outputLen, c = s / 4, l = this.get();
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
}, xb = /* @__PURE__ */ Uint32Array.from([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]), Sb = /* @__PURE__ */ Uint32Array.from([
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
]), Cb = /* @__PURE__ */ new Uint32Array(64), wb = class extends bb {
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
		for (let n = 0; n < 16; n++, t += 4) Cb[n] = e.getUint32(t, !1);
		for (let e = 16; e < 64; e++) {
			let t = Cb[e - 15], n = Cb[e - 2], r = ub(t, 7) ^ ub(t, 18) ^ t >>> 3, i = ub(n, 17) ^ ub(n, 19) ^ n >>> 10;
			Cb[e] = i + Cb[e - 7] + r + Cb[e - 16] | 0;
		}
		let { A: n, B: r, C: i, D: a, E: o, F: s, G: c, H: l } = this;
		for (let e = 0; e < 64; e++) {
			let t = ub(o, 6) ^ ub(o, 11) ^ ub(o, 25), u = l + t + vb(o, s, c) + Sb[e] + Cb[e] | 0, d = (ub(n, 2) ^ ub(n, 13) ^ ub(n, 22)) + yb(n, r, i) | 0;
			l = c, c = s, s = o, o = a + u | 0, a = i, i = r, r = n, n = u + d | 0;
		}
		n = n + this.A | 0, r = r + this.B | 0, i = i + this.C | 0, a = a + this.D | 0, o = o + this.E | 0, s = s + this.F | 0, c = c + this.G | 0, l = l + this.H | 0, this.set(n, r, i, a, o, s, c, l);
	}
	roundClean() {
		cb(Cb);
	}
	destroy() {
		this.destroyed = !0, this.set(0, 0, 0, 0, 0, 0, 0, 0), cb(this.buffer);
	}
}, Tb = class extends wb {
	constructor() {
		super(32, xb);
	}
}, Eb = /* @__PURE__ */ gb(() => new Tb(), /* @__PURE__ */ _b(1));
// src/core/hash.ts
function Db(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e) ?? "null";
	if (Array.isArray(e)) return `[${e.map((e) => Db(e === void 0 ? null : e)).join(",")}]`;
	let t = e;
	return `{${Object.keys(t).filter((e) => t[e] !== void 0).sort().map((e) => `${JSON.stringify(e)}:${Db(t[e])}`).join(",")}}`;
}
function Ob(e) {
	return pb(Eb(typeof e == "string" ? mb(e) : e));
}
function kb(e) {
	return Ob(Db(e));
}
// src/core/migrate.ts
var Ab = {
	workspace: {},
	save: {}
}, jb = "这个存档由更新版本的扩展创建，请先更新扩展";
function Mb(e, t, n = {}) {
	let r = n.current ?? gy[e], i = n.migrations ?? Ab[e], a = Number(t.schemaVersion);
	if (!Number.isInteger(a) || a < 0) throw new Xy("E_BAD_VERSION", "文件内容损坏：缺少有效的版本号");
	if (a > r) throw new Xy("E_NEWER_DATA", jb, {
		kind: e,
		version: a,
		current: r
	});
	if (!n.migrations && a < 4) throw new Xy("E_OLD_DATA", "这是旧版扩展的存档（旧扩展包格式），新版不再读取", {
		kind: e,
		version: a
	});
	let o = t;
	for (; a < r;) {
		let t = i[a];
		if (!t) throw new Xy("E_BAD_VERSION", `无法升级版本 ${a} 的数据`, {
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
function Nb(e) {
	return kb({ d: e });
}
function Pb(e) {
	return e.savedHash !== Nb(e.data);
}
function Fb(e, t) {
	return t.reduce((t, n) => ({
		...t,
		...n(e)
	}), {
		partyNames: [],
		partyCount: 0
	});
}
function Ib(e) {
	let t = e.trim();
	if (t.length < 1 || t.length > 40) throw new Xy("E_BAD_NAME", "存档名需要 1–40 个字");
	return t;
}
function Lb(e, t, n = (e) => ` ${e}`) {
	if (!t.has(e)) return e;
	for (let r = 2;; r++) {
		let i = `${e}${n(r)}`;
		if (!t.has(i)) return i;
	}
}
function Rb(e) {
	return Mb("save", e);
}
function zb(e) {
	return Mb("workspace", e);
}
function Bb(e, t) {
	return t.updatedAt - e.updatedAt || t.createdAt - e.createdAt || e.id.localeCompare(t.id);
}
// src/core/saves/campaign.ts
var Vb = class {
	db;
	deps;
	uuid;
	constructor(e, t) {
		this.db = e, this.deps = t, this.uuid = t.uuid ?? My;
	}
	async getWorkspace(e) {
		let t = await this.db.workspaces.get(e);
		if (!t) return null;
		let n = zb(t);
		return n !== t && await this.db.workspaces.put(n), n;
	}
	isDirty(e) {
		return Pb(e);
	}
	async getSave(e) {
		let t = await this.db.saves.get(e);
		return t ? Rb(t) : null;
	}
	async listManual(e, t) {
		return (await this.db.saves.where("ruleId").equals(e.ruleId).toArray()).map(Rb).filter((n) => n.kind === "manual" && n.deletedAt === void 0 && (t === "all" || n.ownerKey === e.ownerKey)).sort(Bb);
	}
	async listAuto(e, t) {
		return (await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray()).map(Rb).filter((e) => e.kind === "auto").sort(Bb);
	}
	async listDeleted(e) {
		return (await this.db.saves.where("ruleId").equals(e).toArray()).map(Rb).filter((e) => e.deletedAt !== void 0).sort((e, t) => (t.deletedAt ?? 0) - (e.deletedAt ?? 0));
	}
	async listOtherRules(e) {
		return (await this.db.saves.toArray()).map(Rb).filter((t) => t.ruleId !== e && t.kind === "manual" && t.deletedAt === void 0).sort(Bb);
	}
	async startNewCampaign(e) {
		this.requireRule(e.ruleId);
		let t = Ib(e.name);
		return this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta
		], async () => {
			let n = await this.getWorkspace(e.ownerKey);
			n && await this.writeAutoSave(n, "新存档前");
			let r = {
				ownerKey: e.ownerKey,
				ownerLabel: e.ownerLabel,
				ruleId: e.ruleId,
				currentSaveId: null,
				data: {},
				savedHash: "",
				schemaVersion: gy.workspace,
				updatedAt: this.deps.now()
			}, i = await this.buildSave(r, {
				id: this.uuid(),
				name: t,
				note: e.note ?? "",
				kind: "manual"
			});
			return r.currentSaveId = i.id, r.savedHash = i.hash, await this.db.saves.put(i), await this.db.workspaces.put(r), await this.bumpSaves(), {
				workspace: r,
				save: i
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
			if (!Pb(t)) return {
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
			let n = await this.requireWorkspace(e), r = n.currentSaveId ? await this.getSave(n.currentSaveId) : null, i = await this.manualNames(n.ownerKey, n.ruleId), a = t === void 0 ? Lb(`${r?.name ?? "存档"} 分支`, i) : Ib(t), o = await this.buildSave(n, {
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
		if (!r || r.deletedAt !== void 0) throw new Xy("E_NOT_FOUND", "没有找到这个存档");
		return this.requireRule(r.ruleId), this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta
		], async () => {
			let t = await this.getWorkspace(e.ownerKey), i = !!t && t.ruleId !== r.ruleId;
			if (i && !n.allowRuleSwitch) throw new Xy("E_RULE_SWITCH_REQUIRED", "这个存档属于其他规则，需要确认切换规则");
			t && await this.writeAutoSave(t, i ? "切换规则前" : "读档前");
			let a = r;
			if (r.ownerKey !== e.ownerKey) {
				let t = await this.manualNames(e.ownerKey, r.ruleId), n = this.deps.now();
				a = {
					...r,
					id: this.uuid(),
					ownerKey: e.ownerKey,
					ownerLabel: e.ownerLabel,
					name: Lb(`${r.name}（来自 ${r.ownerLabel}）`, t),
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
				schemaVersion: gy.workspace,
				updatedAt: this.deps.now()
			};
			return await this.db.workspaces.put(o), o;
		});
	}
	async deleteSave(e) {
		let t = await this.getSave(e);
		if (!t) throw new Xy("E_NOT_FOUND", "没有找到这个存档");
		if (t.kind === "auto") throw new Xy("E_AUTO_NOT_DELETABLE", "自动存档会自动滚动保留，不能单独删除");
		if ((await this.db.workspaces.get(t.ownerKey))?.currentSaveId === t.id) throw new Xy("E_SAVE_IN_USE", "正在使用的存档不能删除，请先读取或新建其他存档");
		let n = {
			...t,
			deletedAt: this.deps.now()
		};
		return await this.db.saves.put(n), n;
	}
	async restoreSave(e) {
		let t = await this.getSave(e);
		if (!t || t.deletedAt === void 0) throw new Xy("E_NOT_FOUND", "没有找到这个已删除的存档");
		let { deletedAt: n, ...r } = t, i = await this.manualNames(t.ownerKey, t.ruleId), a = {
			...r,
			name: Lb(t.name, i, (e) => `（恢复 ${e}）`)
		};
		return await this.db.saves.put(a), a;
	}
	async purgeSaves(e) {
		let t = 0;
		for (let n of e) (await this.getSave(n))?.deletedAt !== void 0 && (await this.db.saves.delete(n), t++);
		return t;
	}
	async renameSave(e, t) {
		return this.patchManual(e, { name: Ib(t) });
	}
	async setNote(e, t) {
		return this.patchManual(e, { note: t.slice(0, 200) });
	}
	async saveAutoAsManual(e) {
		let t = await this.getSave(e);
		if (!t || t.kind !== "auto") throw new Xy("E_NOT_FOUND", "没有找到这个自动存档");
		let n = await this.manualNames(t.ownerKey, t.ruleId), r = this.deps.now(), i = new Date(t.createdAt), a = `${i.getMonth() + 1}月${i.getDate()}日 ${String(i.getHours()).padStart(2, "0")}:${String(i.getMinutes()).padStart(2, "0")}`, o = {
			...t,
			id: this.uuid(),
			kind: "manual",
			autoReason: void 0,
			name: Lb(`自动存档 · ${a}`, n),
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
			summary: Fb(e.data, this.deps.summaryContributors ?? []),
			snapshot: structuredClone(e.data),
			hash: Nb(e.data),
			schemaVersion: gy.save
		};
	}
	async manualNames(e, t) {
		let n = await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray();
		return new Set(n.filter((e) => e.kind === "manual" && e.deletedAt === void 0).map((e) => e.name));
	}
	async bumpSaves() {
		let e = Ty.parse(await this.db.getMeta("backup") ?? {});
		await this.db.setMeta("backup", {
			...e,
			savesSinceExport: e.savesSinceExport + 1
		});
	}
	async patchManual(e, t) {
		let n = await this.getSave(e);
		if (!n || n.deletedAt !== void 0) throw new Xy("E_NOT_FOUND", "没有找到这个存档");
		if (n.kind === "auto") throw new Xy("E_AUTO_NOT_DELETABLE", "自动存档不能改名或加备注");
		let r = {
			...n,
			...t
		};
		return await this.db.saves.put(r), r;
	}
	async requireWorkspace(e) {
		let t = await this.getWorkspace(e);
		if (!t) throw new Xy("E_NO_WORKSPACE", "还没有当前战役");
		return t;
	}
	requireRule(e) {
		let t = this.deps.rules.get(e);
		if (!t) throw new Xy("E_RULE_MISSING", `需要先安装规则『${e}』`);
		return t;
	}
}, Hb = class {
	name;
	id;
	channel = null;
	listeners = /* @__PURE__ */ new Set();
	_readOnly = !1;
	startedAt;
	constructor(e = "tavern-trpg-assistant-lock", t = Date.now, n = My()) {
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
}, Ub = class {
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
function Wb(e) {
	return e.list().map((e) => ({
		id: e.id,
		name: e.name,
		nameShort: e.nameShort,
		description: e.description,
		status: "installed"
	}));
}
var Gb = {
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
function Kb() {
	let e = new Ub();
	return e.register(Gb), e;
}
// src/core/services.ts
var qb = "0.6.0";
function Jb(e = {}) {
	let t = e.now ?? Date.now, n = e.rules ?? Kb(), r = new Yy(e.dbName ?? "tavern-trpg-assistant");
	return {
		db: r,
		rules: n,
		campaign: new Vb(r, {
			rules: n,
			now: t,
			...e.campaign
		}),
		lock: new Hb(),
		now: t
	};
}
// node_modules/pinia/dist/pinia.js
var Yb = typeof window < "u", Xb, Zb = (e) => Xb = e, Qb = Symbol();
function $b(e) {
	return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function";
}
var ex = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof global == "object" && global.global === global ? global : typeof globalThis == "object" ? globalThis : { HTMLElement: null };
function tx(e, { autoBom: t = !1 } = {}) {
	return t && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["﻿", e], { type: e.type }) : e;
}
function nx(e, t, n) {
	let r = new XMLHttpRequest();
	r.open("GET", e), r.responseType = "blob", r.onload = function() {
		sx(r.response, t, n);
	}, r.onerror = function() {
		console.error("could not download file");
	}, r.send();
}
function rx(e) {
	let t = new XMLHttpRequest();
	t.open("HEAD", e, !1);
	try {
		t.send();
	} catch {}
	return t.status >= 200 && t.status <= 299;
}
function ix(e) {
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
var ax = typeof navigator == "object" ? navigator : { userAgent: "" }, ox = /Macintosh/.test(ax.userAgent) && /AppleWebKit/.test(ax.userAgent) && !/Safari/.test(ax.userAgent), sx = Yb ? typeof HTMLAnchorElement < "u" && "download" in HTMLAnchorElement.prototype && !ox ? cx : "msSaveOrOpenBlob" in ax ? lx : ux : () => {};
function cx(e, t = "download", n) {
	let r = document.createElement("a");
	r.download = t, r.rel = "noopener", typeof e == "string" ? (r.href = e, r.origin === location.origin ? ix(r) : rx(r.href) ? nx(e, t, n) : (r.target = "_blank", ix(r))) : (r.href = URL.createObjectURL(e), setTimeout(function() {
		URL.revokeObjectURL(r.href);
	}, 4e4), setTimeout(function() {
		ix(r);
	}, 0));
}
function lx(e, t = "download", n) {
	if (typeof e == "string") {
		if (rx(e)) nx(e, t, n);
		else {
			let t = document.createElement("a");
			t.href = e, t.target = "_blank", setTimeout(function() {
				ix(t);
			});
		}
	} else navigator.msSaveOrOpenBlob(tx(e, n), t);
}
function ux(e, t, n, r) {
	if (r ||= open("", "_blank"), r && (r.document.title = r.document.body.innerText = "downloading..."), typeof e == "string") return nx(e, t, n);
	let i = e.type === "application/octet-stream", a = /constructor/i.test(String(ex.HTMLElement)) || "safari" in ex, o = /CriOS\/[\d]+/.test(navigator.userAgent);
	if ((o || i && a || ox) && typeof FileReader < "u") {
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
var { assign: dx } = Object;
function fx() {
	let e = Ke(!0), t = e.run(() => /* @__PURE__ */ z({})), n = [], r = [], i = vn({
		install(e) {
			Zb(i), i._a = e, e.provide(Qb, i), e.config.globalProperties.$pinia = i, r.forEach((e) => n.push(e)), r = [];
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
var px = () => {};
function mx(e, t, n, r = px) {
	e.add(t);
	let i = () => {
		e.delete(t) && r();
	};
	return !n && qe() && Je(i), i;
}
function hx(e, ...t) {
	e.forEach((e) => {
		e(...t);
	});
}
var gx = (e) => e(), _x = Symbol(), vx = Symbol();
function yx(e, t) {
	e instanceof Map && t instanceof Map ? t.forEach((t, n) => e.set(n, t)) : e instanceof Set && t instanceof Set && t.forEach(e.add, e);
	for (let n in t) {
		if (!Object.hasOwn(t, n)) continue;
		let r = t[n], i = e[n];
		if ($b(i) && $b(r) && Object.hasOwn(e, n) && !/* @__PURE__ */ xn(r) && !/* @__PURE__ */ mn(r)) {
			e[n] = yx(i, r);
			let t = (/* @__PURE__ */ R(e))[n];
			/* @__PURE__ */ xn(t) && /* @__PURE__ */ gn(t) && Tn(t);
		} else e[n] = r;
	}
	return e;
}
var bx = Symbol();
function xx(e) {
	return !e || typeof e != "object" || !Object.hasOwn(e, bx);
}
var { assign: Sx } = Object;
function Cx(e) {
	return !!(/* @__PURE__ */ xn(e) && e.effect);
}
function wx(e, t, n, r) {
	let { state: i, actions: a, getters: o } = t, s = n.state.value[e], c;
	function l() {
		return s || 
		/* istanbul ignore if */
		(n.state.value[e] = i ? i() : {}), Sx(/* @__PURE__ */ jn(n.state.value[e]), a, Object.keys(o || {}).reduce((t, r) => (t[r] = vn(Z(() => {
			Zb(n);
			let t = n._s.get(e);
			return o[r].call(t, t);
		})), t), {}));
	}
	return c = Tx(e, l, t, n, r, !0), c;
}
function Tx(e, t, n = {}, r, i, a) {
	let o, s = Sx({ actions: {} }, n), c = { deep: !0 }, l, u, d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), p, m = r.state.value[e];
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
		}) : (yx(r.state.value[e], t), n = {
			type: "patch object",
			payload: t,
			storeId: e,
			events: p
		});
		let i = h = Symbol();
		ur().then(() => {
			h === i && (l = !0);
		}), u = !0, hx(d, n, r.state.value[e]);
	}
	let _ = a ? function() {
		let { state: e } = n, t = e ? e() : {};
		this.$patch((e) => {
			Sx(e, t);
		});
	} : px;
	function v() {
		o.stop(), d.clear(), f.clear(), r._s.delete(e);
	}
	let y = (t, n = "") => {
		if (_x in t) return t[vx] = n, t;
		let i = function() {
			Zb(r);
			let n = Array.from(arguments), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
			function s(e) {
				a.add(e);
			}
			function c(e) {
				o.add(e);
			}
			hx(f, {
				args: n,
				name: i[vx],
				store: b,
				after: s,
				onError: c
			});
			let l;
			try {
				l = t.apply(this && this.$id === e ? this : b, n);
			} catch (e) {
				throw hx(o, e), e;
			}
			return l instanceof Promise ? l.then((e) => (hx(a, e), e)).catch((e) => (hx(o, e), Promise.reject(e))) : (hx(a, l), l);
		};
		return i[_x] = !0, i[vx] = n, i;
	}, b = /* @__PURE__ */ ln({
		_p: r,
		$id: e,
		$onAction: mx.bind(null, f),
		$patch: g,
		$reset: _,
		$subscribe(t, n = {}) {
			if (d.has(t)) return px;
			let i = mx(d, t, n.detached, () => a()), a = o.run(() => Br(() => r.state.value[e], (r) => {
				(n.flush === "sync" ? u : l) && t({
					storeId: e,
					type: "direct",
					events: p
				}, r);
			}, Sx({}, c, n)));
			return i;
		},
		$dispose: v
	});
	r._s.set(e, b);
	let x = (r._a && r._a.runWithContext || gx)(() => r._e.run(() => (o = Ke()).run(() => t({ action: y }))));
	for (let t in x) {
		let n = x[t];
		/* @__PURE__ */ xn(n) && !Cx(n) || /* @__PURE__ */ mn(n) ? a || (m && xx(n) && (/* @__PURE__ */ xn(n) ? n.value = m[t] : ((n instanceof Set || n instanceof Map) && n.clear(), yx(n, m[t]))), r.state.value[e][t] = n) : typeof n == "function" && (x[t] = y(n, t), s.actions[t] = n);
	}
	return Sx(b, x), Sx(/* @__PURE__ */ R(b), x), Object.defineProperty(b, "$state", {
		get: () => r.state.value[e],
		set: (e) => {
			g((t) => {
				Sx(t, e);
			});
		}
	}), r._p.forEach((e) => {
		let t = o.run(() => e({
			store: b,
			app: r._a,
			pinia: r,
			options: s
		}));
		Sx(b, t);
	}), m && a && n.hydrate && n.hydrate(b.$state, m), l = !0, u = !0, b;
}
function Ex(e, t, n) {
	let r, i = typeof t == "function";
	r = i ? n : t;
	function a(n, a) {
		let o = Pr();
		return n ||= o ? Nr(Qb, null) : null, n && Zb(n), n = Xb, n._s.has(e) || (i ? Tx(e, t, r, n) : wx(e, r, n)), n._s.get(e);
	}
	return a.$id = e, a;
}
// src/stores/app.ts
var Dx = Ex("app", () => {
	let e = /* @__PURE__ */ Sn(null), t = /* @__PURE__ */ z(!1), n = /* @__PURE__ */ z(""), r = /* @__PURE__ */ z(null), i = /* @__PURE__ */ z(null);
	function a() {
		if (!e.value) throw Error("助手尚未启动完成");
		return e.value;
	}
	function o(t) {
		e.value = t;
	}
	async function s() {
		let e = await ky(a().db);
		return r.value = e, e;
	}
	async function c(e) {
		let t = wy.parse({
			...await ky(a().db),
			...e
		});
		await a().db.setMeta("settings", t), r.value = t;
	}
	async function l() {
		let e = a(), [t, n] = await Promise.all([Oy(e.db), ky(e.db)]);
		r.value = n, i.value = Dy(t, n, e.now());
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
}), Ox = 500, kx = Ex("campaign", () => {
	let e = null, t, n = /* @__PURE__ */ Sn(null), r = /* @__PURE__ */ Sn(null), i = /* @__PURE__ */ z(!1), a = /* @__PURE__ */ z(!1), o = /* @__PURE__ */ z(!1), s = Z(() => r.value !== null), c = /* @__PURE__ */ Sn(null), l = 0;
	function u() {
		if (!e) throw Error("存档服务尚未初始化");
		return e;
	}
	function d() {
		if (i.value) throw new Xy("E_READ_ONLY", "另一个窗口正在使用助手，此窗口为只读");
	}
	function f(e) {
		r.value = e, o.value = e ? Pb(e) : !1;
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
		if (d(), !r.value) throw new Xy("E_NO_WORKSPACE", "还没有当前战役");
		f({
			...r.value,
			data: e(r.value.data)
		}), t !== void 0 && clearTimeout(t), t = setTimeout(() => void g(), Ox);
	}
	async function v(e) {
		if (d(), !n.value) throw new Xy("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
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
		if (d(), !n.value) throw new Xy("E_NO_WORKSPACE", "还没有当前战役");
		await g();
		let t = await u().campaign.branch(n.value.ownerKey, e);
		return f(t.workspace), t.save;
	}
	async function x(e, t = {}) {
		if (d(), !n.value) throw new Xy("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
		await g(), f(await u().campaign.loadSave(n.value, e, t));
	}
	async function S(e) {
		if (!n.value) throw new Xy("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
		return await g(), e(u(), n.value.ownerKey);
	}
	async function C(e) {
		if (d(), !n.value) throw new Xy("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
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
function Ax(e) {
	let t = f();
	if (!t) return !1;
	let n = t.value, r = n ? `${n}${n.endsWith("\n") ? "" : "\n"}${e}` : e;
	return _(t, r), t.value === r;
}
// src/host/clipboard.ts
async function jx(e) {
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
var Mx = 1e3, Nx = "例如 2d6+3、1d20+5、4d6";
function Px(e) {
	let t = e.replace(/\s+/g, "").toLowerCase().replace(/＋/g, "+").replace(/－|−/g, "-");
	if (!t) return {
		ok: !1,
		error: `请输入骰式，${Nx}`
	};
	let n = [], r = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/y, i = 0;
	for (; i < t.length;) {
		r.lastIndex = i;
		let a = r.exec(t);
		if (!a || i > 0 && !(a[1] || a[4])) return {
			ok: !1,
			error: `骰式看不懂：「${e.trim()}」。${Nx}`
		};
		if (i = r.lastIndex, a[3] !== void 0) {
			let e = a[1] === "-" ? -1 : 1, t = a[2] === "" ? 1 : Number(a[2]), r = Number(a[3]);
			if (t < 1 || t > 100) return {
				ok: !1,
				error: "一次最多掷 100 颗骰子"
			};
			if (r < 2 || r > 1e3) return {
				ok: !1,
				error: `骰子面数要在 2 到 ${Mx} 之间`
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
		error: `骰式里至少要有一组骰子，${Nx}`
	};
}
function Fx(e) {
	return e.map((e, t) => {
		let n = e.sign === -1 ? "-" : t === 0 ? "" : "+";
		return e.kind === "dice" ? `${n}${e.count}d${e.sides}` : `${n}${e.value}`;
	}).join("");
}
// src/rules/dice/roll.ts
var Ix = () => {
	let e = /* @__PURE__ */ new Uint32Array(1);
	return crypto.getRandomValues(e), e[0] / 4294967296;
};
function Lx(e, t) {
	return Math.min(t, Math.floor(e() * t) + 1);
}
function Rx(e, t = {}) {
	let n = Px(e);
	if (!n.ok) throw Error(n.error);
	let r = t.rng ?? Ix, i = t.mode ?? "normal", a = [...n.terms];
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
			let t = [Lx(r, 20), Lx(r, 20)], n = i === "adv" ? t[0] >= t[1] ? 0 : 1 : t[0] <= t[1] ? 0 : 1;
			return !s && e.sign === 1 && (s = !0, o = t[n] === 20 ? 20 : t[n] === 1 ? 1 : void 0), {
				term: e,
				rolls: t,
				kept: n,
				subtotal: e.sign * t[n]
			};
		}
		let n = Array.from({ length: e.count }, () => Lx(r, e.sides));
		return t && !s && e.sign === 1 && (s = !0, o = n[0] === 20 ? 20 : n[0] === 1 ? 1 : void 0), {
			term: e,
			rolls: n,
			subtotal: e.sign * n.reduce((e, t) => e + t, 0)
		};
	});
	return {
		expression: Fx(a),
		mode: i,
		terms: c,
		total: c.reduce((e, t) => e + t.subtotal, 0),
		...o ? { natural: o } : {}
	};
}
// src/rules/dice/format.ts
var zx = {
	normal: "",
	adv: " 优势",
	dis: " 劣势"
};
function Bx(e) {
	return e.terms.map((t, n) => {
		let r = t.term.sign === -1 ? "- " : n === 0 ? "" : "+ ";
		return t.term.kind === "const" ? `${r}${t.term.value}` : t.kept === void 0 ? `${r}${t.rolls.join(" + ")}` : `${r}取${e.mode === "adv" ? "高" : "低"} ${t.rolls.join("/")}`;
	}).join(" ");
}
function Vx(e) {
	return `${e.expression}${zx[e.mode]} = ${e.total}（${Bx(e)}）`;
}
function Hx(e, t) {
	let n = t.trim().replace(/-{2,}/g, "—").replace(/[<>]/g, "");
	return `<!-- [掷骰] ${n ? `${n}：` : ""}${e} -->`;
}
// src/rules/dice/builder.ts
var Ux = [
	4,
	6,
	8,
	10,
	12,
	20,
	100
], Wx = {
	dice: [],
	mod: 0
};
function Gx(e) {
	if (!e.trim()) return {
		ok: !0,
		builder: Wx
	};
	let t = Px(e);
	return t.ok ? {
		ok: !0,
		builder: Kx(t.terms)
	} : t;
}
function Kx(e) {
	let t = [], n = 0;
	for (let r of e) if (r.kind === "const") n += r.sign * r.value;
	else {
		let e = t.find((e) => e.sides === r.sides && e.sign === r.sign);
		e ? e.count += r.count : t.push({
			count: r.count,
			sides: r.sides,
			sign: r.sign
		});
	}
	return {
		dice: t,
		mod: n
	};
}
function qx(e) {
	let t = [...e.dice].sort((e, t) => t.sign - e.sign || e.sides - t.sides).map((e, t) => `${t === 0 ? e.sign === -1 ? "-" : "" : e.sign === -1 ? "- " : "+ "}${e.count}d${e.sides}`).join(" ");
	return e.mod && (t += `${t ? " " : ""}${e.mod > 0 ? t ? "+ " : "+" : "- "}${Math.abs(e.mod)}`), t;
}
function Jx(e, t) {
	let n = Gx(e);
	return qx(t(n.ok ? n.builder : Wx));
}
function Yx(e, t) {
	return Jx(e, (e) => {
		let n = e.dice.map((e) => ({ ...e })), r = n.find((e) => e.sides === t && e.sign === 1);
		return r ? r.count = Math.min(100, r.count + 1) : n.push({
			count: 1,
			sides: t,
			sign: 1
		}), {
			...e,
			dice: n
		};
	});
}
function Xx(e, t) {
	return Jx(e, (e) => ({
		...e,
		dice: e.dice.map((e) => e.sides === t && e.sign === 1 ? {
			...e,
			count: e.count - 1
		} : { ...e }).filter((e) => e.count > 0)
	}));
}
function Zx(e, t, n = -20, r = 30) {
	return Jx(e, (e) => ({
		...e,
		mod: Math.min(r, Math.max(n, e.mod + t))
	}));
}
function Qx(e, t) {
	return e.dice.filter((e) => e.sides === t && e.sign === 1).reduce((e, t) => e + t.count, 0);
}
function $x(e) {
	let t = e.dice.filter((e) => e.sides === 20);
	return t.length === 1 && t[0].count === 1 && t[0].sign === 1;
}
function eS(e) {
	return e.dice.reduce((e, t) => e + t.count, 0);
}
function tS(e) {
	let t = e.dice.reduce((e, t) => Math.max(e, t.sides), 0) || 20;
	return Ux.find((e) => t <= e) ?? 100;
}
var nS = "trpg-assistant:dice", rS = {
	dice: [],
	mod: 0
}, iS = (e) => e ? `${nS}:${e}` : nS;
function aS(e) {
	let t = {
		history: [],
		text: "",
		mode: "normal",
		note: ""
	};
	try {
		let n = localStorage.getItem(iS(e));
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
var oS = Ex("dice", () => {
	let e = null, t = Ix, n = 1, r, i = aS(null), a = /* @__PURE__ */ z(i.text), o = /* @__PURE__ */ z(i.mode), s = /* @__PURE__ */ z(i.note), c = /* @__PURE__ */ z(i.history), l = /* @__PURE__ */ z(null), u = /* @__PURE__ */ Sn(null), d = /* @__PURE__ */ z("idle"), f = /* @__PURE__ */ z(!1), p = Z(() => Gx(a.value)), m = Z(() => p.value.ok ? "" : p.value.error), h = Z(() => p.value.ok ? p.value.builder : rS), g = Z(() => $x(h.value)), _ = Z(() => p.value.ok && eS(h.value) > 0);
	function v() {
		try {
			localStorage.setItem(iS(e), JSON.stringify({
				history: c.value,
				text: a.value,
				mode: o.value,
				note: s.value
			}));
		} catch (e) {
			console.warn("[trpg-assistant] 保存掷骰记录失败", e);
		}
	}
	function y(t) {
		e = t;
		let n = aS(t);
		c.value = n.history, a.value = n.text, o.value = n.mode, s.value = n.note, l.value = null, u.value = null;
	}
	let b = (e) => {
		t = e ?? Ix;
	};
	function x(e) {
		a.value = e, v();
	}
	let S = (e) => x(Yx(a.value, e)), C = (e) => x(Xx(a.value, e)), w = (e) => x(Zx(a.value, e)), T = () => {
		a.value = "", o.value = "normal", v();
	}, E = (e) => x(e);
	function D(e) {
		o.value = e, v();
	}
	function O(e) {
		s.value = e, v();
	}
	function k() {
		if (!_.value) return null;
		let e = g.value ? o.value : "normal", r = Rx(a.value, {
			rng: t,
			mode: e
		}), i = {
			id: n++,
			at: Date.now(),
			note: s.value.trim(),
			expression: r.expression,
			formula: qx(h.value),
			mode: e,
			total: r.total,
			line: Vx(r),
			...r.natural ? { natural: r.natural } : {}
		};
		return l.value = i, u.value = r, c.value = [i, ...c.value].slice(0, 20), d.value = "idle", f.value = !1, v(), i;
	}
	function ee(e) {
		a.value = e.formula, o.value = e.mode, v();
	}
	function te() {
		c.value = [], v();
	}
	let ne = (e) => Hx(e.line, s.value.trim() || e.note);
	function A() {
		if (!l.value) return !1;
		let e = Ax(ne(l.value));
		return d.value = e ? "done" : "failed", r !== void 0 && clearTimeout(r), e && (r = setTimeout(() => d.value = "idle", 2e3)), e;
	}
	async function j() {
		return l.value ? (f.value = await jx(ne(l.value)), f.value) : !1;
	}
	return {
		text: a,
		mode: o,
		note: s,
		history: c,
		last: l,
		lastResult: u,
		fillState: d,
		copied: f,
		error: m,
		builder: h,
		canMode: g,
		canRoll: _,
		setOwner: y,
		setRng: b,
		addOne: S,
		removeOne: C,
		step: w,
		clear: T,
		setText: E,
		setMode: D,
		setNote: O,
		roll: k,
		loadRecord: ee,
		clearHistory: te,
		fill: A,
		copy: j,
		commentOf: ne
	};
}), sS = {
	success: 4e3,
	info: 4e3,
	undo: 6e3,
	error: 8e3,
	status: 6e3
}, cS = Ex("toast", () => {
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
		let s = n++, c = typeof o == "function" ? { undo: o } : o ?? {};
		for (e.value = [...e.value, {
			id: s,
			kind: t,
			message: a,
			...c
		}]; e.value.length > 3;) r(e.value[0].id);
		return i(s, sS[t]), s;
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
async function lS(e, t) {
	let n = Dx(t), r = cS(t), i = kx(t), a = oS(t);
	try {
		let e = Jb();
		n.setServices(e), await jy(e.db), await n.refreshBackup();
		let t = Ny(d());
		await i.init(e, t), a.setOwner(t?.ownerKey ?? null), n.booted = !0;
	} catch (e) {
		return console.error("[trpg-assistant] 启动失败", e), n.bootError = e instanceof Error ? e.message : String(e), () => void 0;
	}
	let o = Br(() => [i.workspace?.currentSaveId, i.workspace?.savedHash], () => void i.refreshCurrentSave().catch((e) => console.error("[trpg-assistant] 读取当前存档信息失败", e)), { immediate: !0 }), s = Br(() => i.readOnly, (e) => {
		e && r.status("另一个窗口正在使用助手，这里只能查看");
	}, { immediate: !0 }), c = g(e, h(e, "CHAT_CHANGED", "chat_id_changed"), () => {
		let e = Ny(d());
		i.switchOwner(e).catch((e) => {
			console.error("[trpg-assistant] 切换聊天后载入战役数据失败", e), r.error("切换聊天后载入战役数据失败，请重新打开助手");
		}), a.setOwner(e?.ownerKey ?? null);
	});
	return () => {
		s(), o(), c();
	};
}
// src/stores/ui.ts
var uS = {
	home: "首页",
	settings: "设置"
}, dS = Ex("ui", () => {
	let e = /* @__PURE__ */ z(!1), t = /* @__PURE__ */ z("home"), n = /* @__PURE__ */ z(!1);
	function r(e) {
		t.value = e;
	}
	return {
		windowOpen: e,
		page: t,
		diceOpen: n,
		go: r
	};
}), fS = [
	"data-kind",
	"onPointerenter",
	"onPointerleave",
	"onFocusin",
	"onFocusout"
], pS = { class: "trpg-toast__text" }, mS = ["onClick"], hS = ["onClick"], gS = /* @__PURE__ */ H({
	__name: "ToastHost",
	setup(e) {
		let t = cS();
		return (e, n) => (G(), q(Yl, {
			name: "trpg-toast",
			tag: "div",
			class: "trpg-toasts",
			role: "status",
			"aria-live": "polite"
		}, {
			default: V(() => [(G(!0), K(W, null, Oa(B(t).toasts, (e) => (G(), K("div", {
				key: e.id,
				class: "trpg-toast",
				"data-kind": e.kind,
				onPointerenter: (n) => B(t).pause(e.id),
				onPointerleave: (n) => B(t).resume(e.id),
				onFocusin: (n) => B(t).pause(e.id),
				onFocusout: (n) => B(t).resume(e.id)
			}, [
				J("span", pS, F(e.message), 1),
				e.undo ? (G(), K("button", {
					key: 0,
					type: "button",
					onClick: (n) => B(t).runUndo(e.id)
				}, "撤销", 8, mS)) : X("", !0),
				(G(!0), K(W, null, Oa(e.actions ?? [], (n, r) => (G(), K("button", {
					key: r,
					type: "button",
					onClick: (r) => B(t).runAction(e.id, n)
				}, F(n.label), 9, hS))), 128))
			], 40, fS))), 128))]),
			_: 1
		}));
	}
}), _S = {
	class: "trpg-die",
	viewBox: "0 0 100 100",
	"aria-hidden": "true",
	focusable: "false"
}, vS = {
	key: 0,
	points: "50,8 94,86 6,86"
}, yS = {
	key: 1,
	class: "trpg-die__body",
	d: "M24 14h52a10 10 0 0 1 10 10v52a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V24a10 10 0 0 1 10-10z"
}, bS = ["y", "font-size"], xS = /* @__PURE__ */ H({
	__name: "DieIcon",
	props: {
		sides: {},
		value: {}
	},
	setup(e) {
		let t = e, n = Z(() => [
			4,
			6,
			8,
			10,
			12,
			20,
			100
		].find((e) => t.sides <= e) ?? 100), r = Z(() => t.value === void 0 ? "" : String(t.value)), i = Z(() => r.value.length >= 3 ? 24 : r.value.length === 2 ? 32 : 38), a = Z(() => n.value === 4 ? 64 : 53);
		return (e, t) => (G(), K("svg", _S, [n.value === 4 ? (G(), K("polygon", vS)) : n.value === 6 ? (G(), K("path", yS)) : n.value === 8 ? (G(), K(W, { key: 2 }, [t[0] ||= J("polygon", { points: "50,6 92,50 50,94 8,50" }, null, -1), t[1] ||= J("path", {
			class: "trpg-die__facet",
			d: "M8 50h84"
		}, null, -1)], 64)) : n.value === 10 || n.value === 100 ? (G(), K(W, { key: 3 }, [t[2] ||= J("polygon", { points: "50,5 91,38 50,95 9,38" }, null, -1), t[3] ||= J("path", {
			class: "trpg-die__facet",
			d: "M50 5v90M9 38h82"
		}, null, -1)], 64)) : n.value === 12 ? (G(), K(W, { key: 4 }, [t[4] ||= J("polygon", { points: "50,7 92,38 76,88 24,88 8,38" }, null, -1), t[5] ||= J("path", {
			class: "trpg-die__facet",
			d: "M50 30l22 16-8 26H36l-8-26z"
		}, null, -1)], 64)) : (G(), K(W, { key: 5 }, [t[6] ||= J("polygon", { points: "50,5 90,27 90,73 50,95 10,73 10,27" }, null, -1), t[7] ||= J("path", {
			class: "trpg-die__facet",
			d: "M50 22l26 46H24z"
		}, null, -1)], 64)), r.value ? (G(), K("text", {
			key: 6,
			x: "50",
			y: a.value,
			"font-size": i.value,
			"text-anchor": "middle",
			"dominant-baseline": "central"
		}, F(r.value), 9, bS)) : X("", !0)]));
	}
}), SS = {
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
}, CS = [
	"width",
	"height",
	"innerHTML"
], wS = /* @__PURE__ */ H({
	__name: "Icon",
	props: {
		name: {},
		size: {}
	},
	setup(e) {
		let t = e, n = Z(() => SS[t.name] ?? ""), r = Z(() => `${t.size ?? 18}px`);
		return (e, t) => (G(), K("svg", {
			class: "trpg-icon",
			viewBox: "0 0 256 256",
			fill: "currentColor",
			"aria-hidden": "true",
			focusable: "false",
			width: r.value,
			height: r.value,
			innerHTML: n.value
		}, null, 8, CS));
	}
});
// src/ui/shell/storage.ts
function TS(e, t) {
	try {
		let n = localStorage.getItem(e);
		if (!n) return t;
		let r = JSON.parse(n);
		return Number.isFinite(r.x) && Number.isFinite(r.y) ? r : t;
	} catch (e) {
		return console.warn("[trpg-assistant] 读取窗口位置失败", e), t;
	}
}
function ES(e, t) {
	try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/useDrag.ts
function DS(e, t, n) {
	return Math.min(Math.max(e, t), Math.max(t, n));
}
function OS(e) {
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
				x: (typeof e.lockX == "function" ? e.lockX() : e.lockX) ? s.x : DS(s.x + r, 0, window.innerWidth - l),
				y: DS(s.y + i, 0, window.innerHeight - u - (e.bottomGap?.() ?? 0))
			};
		}, u = (t) => {
			i.removeEventListener("pointermove", l), i.removeEventListener("pointerup", u), i.removeEventListener("pointercancel", u), i.hasPointerCapture(t.pointerId) && i.releasePointerCapture(t.pointerId), c ? e.onEnd?.() : e.onTap?.();
		};
		i.addEventListener("pointermove", l), i.addEventListener("pointerup", u), i.addEventListener("pointercancel", u);
	}
	return { onPointerDown: n };
}
// src/ui/shell/DiceTray.vue?vue&type=script&setup=true&lang.ts
var kS = ["data-narrow"], AS = { class: "trpg-dice__shell" }, jS = { class: "trpg-dice__main" }, MS = { class: "trpg-dice__body" }, NS = { class: "trpg-dice__row" }, PS = [
	"value",
	"aria-invalid",
	"onKeydown"
], FS = ["disabled"], IS = {
	class: "trpg-field__error trpg-dice__err",
	role: "alert"
}, LS = {
	class: "trpg-dice__faces",
	role: "group",
	"aria-label": "骰子"
}, RS = [
	"data-n",
	"aria-label",
	"onClick"
], zS = {
	key: 0,
	class: "trpg-dice__cnt"
}, BS = ["aria-label", "onClick"], VS = { class: "trpg-dice__adjust" }, HS = {
	class: "trpg-dice__step",
	role: "group",
	"aria-label": "加减值"
}, US = { "data-testid": "dice-mod" }, WS = [
	"disabled",
	"aria-pressed",
	"onClick"
], GS = {
	class: "trpg-dice__small",
	"data-testid": "dice-hint"
}, KS = ["disabled", "title"], qS = {
	class: "trpg-dice__result",
	"aria-label": "结果",
	"aria-live": "polite"
}, JS = {
	class: "trpg-dice__line",
	"data-testid": "dice-line"
}, YS = ["data-tone"], XS = {
	class: "trpg-sr-only",
	"data-testid": "dice-total"
}, ZS = { class: "trpg-dice__minis" }, QS = {
	key: 0,
	class: "trpg-dice__const"
}, $S = ["title"], eC = { class: "trpg-dice__send" }, tC = ["value"], nC = ["disabled"], rC = ["disabled"], iC = { "aria-label": "最近记录" }, aC = ["aria-expanded"], oC = {
	key: 0,
	class: "trpg-dice__list"
}, sC = ["aria-label", "onClick"], cC = {
	key: 1,
	class: "trpg-dice__clear"
}, lC = /* @__PURE__ */ H({
	__name: "DiceTray",
	setup(e) {
		let t = dS(), n = oS(), r = [
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
		], i = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches, a = /* @__PURE__ */ z(null), o = /* @__PURE__ */ z(window.innerWidth), s = /* @__PURE__ */ z(window.innerHeight), c = Z(() => o.value <= 480), l = /* @__PURE__ */ z(TS("trpg-assistant:dice", {
			x: Math.max(8, window.innerWidth - 384),
			y: Math.max(8, window.innerHeight - 700)
		})), u = /* @__PURE__ */ z(!1), d = () => c.value ? 64 : 0, f = () => ({
			w: a.value?.offsetWidth ?? 360,
			h: a.value?.offsetHeight ?? 480
		});
		function p() {
			o.value = window.innerWidth, s.value = window.innerHeight;
			let { w: e, h: t } = f();
			l.value = {
				x: c.value ? Math.round(o.value * .04) : Math.min(Math.max(l.value.x, 0), Math.max(0, o.value - e)),
				y: Math.min(Math.max(l.value.y, 0), Math.max(0, s.value - t - d()))
			};
		}
		let m = OS({
			position: l,
			size: f,
			lockX: () => c.value,
			bottomGap: d,
			onEnd: () => ES("trpg-assistant:dice", l.value)
		}), h = Z(() => c.value ? {
			left: "4vw",
			width: "92vw",
			top: `${l.value.y}px`
		} : {
			left: `${l.value.x}px`,
			top: `${l.value.y}px`
		});
		da(() => {
			window.addEventListener("resize", p), ur(p);
		}), ma(() => {
			window.removeEventListener("resize", p), clearInterval(y);
		}), Br(() => t.diceOpen, (e) => e && void ur(p)), Br(() => n.lastResult, () => void ur(p));
		let g = /* @__PURE__ */ z(!1), _ = /* @__PURE__ */ z(null), v = /* @__PURE__ */ z(20), y;
		function b() {
			if (g.value || !n.canRoll) return;
			let e = n.roll();
			if (!e) return;
			if (i) {
				_.value = e.id;
				return;
			}
			let t = tS(n.builder);
			g.value = !0, _.value = null, v.value = Math.ceil(Math.random() * t), y = setInterval(() => v.value = Math.ceil(Math.random() * t), 70), setTimeout(() => {
				clearInterval(y), g.value = !1, _.value = e.id;
			}, 460);
		}
		let x = Z(() => n.last && n.lastResult && _.value === n.last.id ? {
			rec: n.last,
			result: n.lastResult
		} : null), S = Z(() => {
			if (!x.value || g.value) return tS(n.builder);
			let e = x.value.result.terms.map((e) => e.term.kind === "dice" ? e.term.sides : 0);
			return tS({
				dice: [{
					count: 1,
					sides: Math.max(0, ...e),
					sign: 1
				}],
				mod: 0
			});
		}), C = Z(() => n.history.filter((e) => !(g.value && e.id === n.last?.id))), w = Z(() => {
			if (!x.value) return [];
			let e = [];
			for (let t of x.value.result.terms) if (t.term.kind === "const") e.push({
				key: `c${e.length}`,
				kind: "const",
				value: t.subtotal
			});
			else {
				let n = t.term.sides;
				t.rolls.forEach((r, i) => e.push({
					key: `${n}-${e.length}-${i}`,
					kind: "die",
					sides: n,
					value: r,
					dim: t.kept !== void 0 && t.kept !== i
				}));
			}
			return e;
		}), T = (e) => `${e > 0 ? "+" : "−"}${Math.abs(e)}`, E = Z(() => n.builder.mod > 0 ? `+${n.builder.mod}` : String(n.builder.mod)), D = Z(() => n.fillState === "done" ? "已填入 ✓" : n.fillState === "failed" ? "尚未填入，再试一次" : "填入输入框"), O = (e) => new Date(e).toLocaleTimeString("zh-CN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: !1
		}), k = Z(() => n.canMode ? "" : "优势劣势只对单个 1d20 有效"), ee = (e) => n.setText(e.target.value), te = (e) => n.loadRecord(e);
		return (e, i) => B(t).diceOpen ? (G(), K("aside", {
			key: 0,
			ref_key: "el",
			ref: a,
			class: "trpg-dice",
			style: Te(h.value),
			"data-narrow": c.value,
			role: "dialog",
			"aria-label": "掷骰",
			"aria-modal": "false"
		}, [J("header", {
			class: "trpg-dice__head",
			onPointerdown: i[1] ||= (...e) => B(m).onPointerDown && B(m).onPointerDown(...e)
		}, [
			Y(wS, {
				name: "dice-five",
				size: 20
			}),
			i[12] ||= J("span", { class: "trpg-dice__title" }, "掷骰", -1),
			J("button", {
				class: "trpg-icon-btn",
				type: "button",
				"aria-label": "关闭掷骰",
				onClick: i[0] ||= (e) => B(t).diceOpen = !1
			}, [Y(wS, {
				name: "x",
				size: 18
			})])
		], 32), J("div", AS, [J("div", jS, [J("div", MS, [
			J("div", null, [
				i[13] ||= J("div", { class: "trpg-dice__lbl" }, [J("label", { for: "trpg-dice-formula" }, "骰式"), J("span", null, "点下面的骰子加进骰式，也可以直接写")], -1),
				J("div", NS, [J("input", {
					id: "trpg-dice-formula",
					value: B(n).text,
					class: "trpg-input trpg-dice__formula",
					type: "text",
					autocomplete: "off",
					spellcheck: "false",
					placeholder: "点骰子，或写 2d6+3",
					"aria-invalid": !!B(n).error,
					onInput: ee,
					onKeydown: [i[2] ||= Eu(() => {}, ["stop"]), Ou(Eu(b, ["prevent"]), ["enter"])]
				}, null, 40, PS), J("button", {
					class: "trpg-btn trpg-btn--quiet",
					type: "button",
					disabled: !B(n).text,
					onClick: i[3] ||= (e) => B(n).clear()
				}, "清空", 8, FS)]),
				J("div", IS, F(B(n).error), 1)
			]),
			J("div", LS, [(G(!0), K(W, null, Oa(B(Ux), (e) => (G(), K("div", {
				key: e,
				class: "trpg-dice__face"
			}, [J("button", {
				class: "trpg-dice__die",
				type: "button",
				"data-n": B(Qx)(B(n).builder, e),
				"aria-label": `加一颗 d${e}${B(Qx)(B(n).builder, e) ? `，现有 ${B(Qx)(B(n).builder, e)} 颗` : ""}`,
				onClick: (t) => B(n).addOne(e)
			}, [
				Y(xS, { sides: e }, null, 8, ["sides"]),
				J("span", null, "d" + F(e), 1),
				B(Qx)(B(n).builder, e) ? (G(), K("span", zS, "×" + F(B(Qx)(B(n).builder, e)), 1)) : X("", !0)
			], 8, RS), B(Qx)(B(n).builder, e) ? (G(), K("button", {
				key: 0,
				class: "trpg-dice__minus",
				type: "button",
				"aria-label": `减一颗 d${e}`,
				onClick: (t) => B(n).removeOne(e)
			}, "−", 8, BS)) : X("", !0)]))), 128))]),
			J("div", VS, [J("div", HS, [
				i[14] ||= J("span", { class: "trpg-dice__small" }, "加减值", -1),
				J("button", {
					type: "button",
					"aria-label": "减 1",
					onClick: i[4] ||= (e) => B(n).step(-1)
				}, "−"),
				J("output", US, F(E.value), 1),
				J("button", {
					type: "button",
					"aria-label": "加 1",
					onClick: i[5] ||= (e) => B(n).step(1)
				}, "+")
			]), J("div", null, [J("div", {
				class: Ae(["trpg-seg", { "is-off": !B(n).canMode }]),
				role: "group",
				"aria-label": "d20 掷法"
			}, [(G(), K(W, null, Oa(r, (e) => J("button", {
				key: e.value,
				type: "button",
				disabled: !B(n).canMode,
				"aria-pressed": (B(n).canMode ? B(n).mode : "normal") === e.value,
				onClick: (t) => B(n).setMode(e.value)
			}, F(e.label), 9, WS)), 64))], 2), J("div", GS, F(k.value), 1)])]),
			J("button", {
				class: "trpg-btn trpg-btn--primary trpg-dice__roll",
				type: "button",
				disabled: !B(n).canRoll || g.value,
				title: B(n).canRoll ? void 0 : "先选一个骰子",
				"data-testid": "dice-roll",
				onClick: b
			}, [Y(wS, {
				name: "dice-five",
				size: 22
			}), i[15] ||= Rs("掷骰", -1)], 8, KS),
			J("section", qS, [
				J("div", {
					class: Ae(["trpg-dice__hero", {
						"is-rolling": g.value,
						"is-nat20": x.value?.rec.natural === 20,
						"is-nat1": x.value?.rec.natural === 1
					}]),
					"data-testid": "dice-hero"
				}, [Y(xS, {
					sides: S.value,
					value: g.value ? v.value : x.value?.rec.total
				}, null, 8, ["sides", "value"])], 2),
				J("div", JS, [x.value ? (G(), K(W, { key: 0 }, [Rs(F(x.value.rec.line) + " ", 1), x.value.rec.natural ? (G(), K("span", {
					key: 0,
					class: "trpg-badge",
					"data-tone": x.value.rec.natural === 20 ? "gold" : "danger"
				}, "天然 " + F(x.value.rec.natural), 9, YS)) : X("", !0)], 64)) : g.value ? X("", !0) : (G(), K(W, { key: 1 }, [Rs("点「掷骰」，结果会落在这里")], 64))]),
				J("span", XS, F(x.value?.rec.total), 1),
				J("div", ZS, [(G(!0), K(W, null, Oa(w.value, (e) => (G(), K(W, { key: e.key }, [e.kind === "const" ? (G(), K("span", QS, F(T(e.value)), 1)) : (G(), K("span", {
					key: 1,
					class: Ae(["trpg-dice__mini", { "is-dim": e.dim }]),
					title: e.dim ? "没有采用" : void 0
				}, [Y(xS, {
					sides: e.sides,
					value: e.value
				}, null, 8, ["sides", "value"])], 10, $S))], 64))), 128))]),
				J("div", eC, [
					J("input", {
						value: B(n).note,
						class: "trpg-input",
						type: "text",
						placeholder: "说明（可空），如：感知检定",
						"aria-label": "说明",
						autocomplete: "off",
						onInput: i[6] ||= (e) => B(n).setNote(e.target.value),
						onKeydown: i[7] ||= Eu(() => {}, ["stop"])
					}, null, 40, tC),
					J("button", {
						class: "trpg-btn trpg-btn--primary",
						type: "button",
						disabled: !x.value,
						onClick: i[8] ||= (e) => B(n).fill()
					}, F(D.value), 9, nC),
					J("button", {
						class: "trpg-btn",
						type: "button",
						disabled: !x.value,
						onClick: i[9] ||= (e) => B(n).copy()
					}, F(B(n).copied ? "已复制 ✓" : "复制"), 9, rC)
				])
			]),
			J("section", iC, [J("button", {
				class: "trpg-dice__recent",
				type: "button",
				"aria-expanded": u.value,
				onClick: i[10] ||= (e) => u.value = !u.value
			}, [J("span", null, [Rs("最近 " + F(C.value.length) + " 次", 1), C.value.length ? (G(), K(W, { key: 0 }, [i[16] ||= Rs(" · 上一次 ", -1), J("b", null, F(C.value[0].total), 1)], 64)) : X("", !0)]), Y(wS, {
				name: u.value ? "caret-down" : "caret-right",
				size: 14
			}, null, 8, ["name"])], 8, aC), u.value ? (G(), K(W, { key: 0 }, [C.value.length ? (G(), K("ul", oC, [(G(!0), K(W, null, Oa(C.value, (e) => (G(), K("li", { key: e.id }, [J("button", {
				type: "button",
				"aria-label": `载入骰式 ${e.formula}`,
				onClick: (t) => te(e)
			}, [
				J("b", null, F(e.total), 1),
				J("span", null, [Rs(F(e.formula), 1), e.note ? (G(), K(W, { key: 0 }, [Rs(" · " + F(e.note), 1)], 64)) : X("", !0)]),
				J("time", null, F(O(e.at)), 1)
			], 8, sC)]))), 128))])) : X("", !0), C.value.length ? (G(), K("div", cC, [J("button", {
				class: "trpg-btn trpg-btn--quiet trpg-btn--small",
				type: "button",
				onClick: i[11] ||= (e) => B(n).clearHistory()
			}, "清空记录")])) : X("", !0)], 64)) : X("", !0)])
		])])])], 12, kS)) : X("", !0);
	}
}), uC = ["aria-expanded"], dC = 48, fC = /* @__PURE__ */ H({
	__name: "FloatingBall",
	setup(e) {
		let t = dS(), n = /* @__PURE__ */ z(TS("trpg-assistant:ball", {
			x: 16,
			y: Math.round(window.innerHeight / 2)
		}));
		function r() {
			n.value = {
				x: Math.min(Math.max(n.value.x, 0), Math.max(0, window.innerWidth - dC)),
				y: Math.min(Math.max(n.value.y, 0), Math.max(0, window.innerHeight - dC))
			};
		}
		da(() => {
			r(), window.addEventListener("resize", r);
		}), ma(() => window.removeEventListener("resize", r));
		let i = OS({
			position: n,
			size: () => ({
				w: dC,
				h: dC
			}),
			onTap: () => {
				t.windowOpen = !t.windowOpen;
			},
			onEnd: () => ES("trpg-assistant:ball", n.value)
		}), a = Z(() => ({
			left: `${n.value.x}px`,
			top: `${n.value.y}px`
		}));
		return (e, n) => (G(), K("button", {
			class: "trpg-ball",
			type: "button",
			"aria-label": "打开或收起 TRPG 跑团助手",
			"aria-expanded": B(t).windowOpen,
			style: Te(a.value),
			onPointerdown: n[0] ||= (...e) => B(i).onPointerDown && B(i).onPointerDown(...e),
			onKeydown: [n[1] ||= Ou(Eu((e) => B(t).windowOpen = !B(t).windowOpen, ["prevent"]), ["enter"]), n[2] ||= Ou(Eu((e) => B(t).windowOpen = !B(t).windowOpen, ["prevent"]), ["space"])]
		}, [Y(wS, {
			name: "dice-five",
			size: 26
		})], 44, uC));
	}
}), pC = Ex("modal", () => {
	let e = /* @__PURE__ */ Sn([]), t = /* @__PURE__ */ Sn("forward"), n = Z(() => e.value.length > 0), r = Z(() => e.value[e.value.length - 1]), i = Z(() => e.value.length), a = Z(() => e.value[0]?.variant ?? "dialog");
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
}), mC = ["data-variant"], hC = ["data-sized"], gC = {
	key: 0,
	class: "trpg-modal__head"
}, _C = ["aria-label"], vC = ["inert", "aria-hidden"], yC = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])", bC = /* @__PURE__ */ H({
	__name: "ModalHost",
	setup(e) {
		let t = pC(), n = /* @__PURE__ */ z(null), r = /* @__PURE__ */ z(null), i = `trpg-modal-title-${Math.random().toString(36).slice(2, 8)}`, a = null, o = [], s = /* @__PURE__ */ new Map(), c = Z(() => t.depth > 1 ? t.stack[t.depth - 2].title : ""), l = null;
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
			return e ? [e.querySelector(".trpg-modal__head"), e.querySelector(".trpg-modal__page:not(.is-under)")].flatMap((e) => e ? [...e.querySelectorAll(yC)] : []).filter((e) => e.getClientRects().length > 0 && e.tabIndex >= 0 && e.getAttribute("aria-hidden") !== "true") : [];
		}
		function m() {
			let e = r.value?.querySelector(".trpg-modal__page:not(.is-under)");
			(e?.querySelector("[data-autofocus]") ?? e?.querySelector(yC) ?? r.value)?.focus({ preventScroll: !0 });
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
		return (e, a) => (G(), K("div", {
			ref_key: "rootEl",
			ref: n,
			class: "trpg-modal-root"
		}, [B(t).isOpen ? (G(), K("div", {
			key: 0,
			class: "trpg-modal",
			"data-variant": B(t).variant,
			onClick: a[2] ||= Eu((e) => B(t).requestClose(), ["self"]),
			onKeydown: Eu(y, ["stop"])
		}, [J("section", {
			ref_key: "cardEl",
			ref: r,
			class: "trpg-modal__card",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": i,
			"data-sized": B(t).variant !== "confirm" && B(t).top?.width ? "true" : void 0,
			style: Te(B(t).variant !== "confirm" && B(t).top?.width ? {
				"--trpg-drawer-width": `${B(t).top.width}px`,
				...B(t).top.height ? { "--trpg-dlg-h": `${B(t).top.height}px` } : {}
			} : void 0),
			tabindex: "-1"
		}, [B(t).top?.bare ? X("", !0) : (G(), K("header", gC, [
			B(t).depth > 1 ? (G(), K("button", {
				key: 0,
				class: "trpg-modal__back",
				type: "button",
				"aria-label": `返回：${c.value}`,
				onClick: a[0] ||= (e) => B(t).pop()
			}, [Y(wS, {
				name: "caret-left",
				size: 16
			}), J("span", null, F(c.value), 1)], 8, _C)) : X("", !0),
			J("h2", {
				id: i,
				class: "trpg-modal__title"
			}, F(B(t).top?.title), 1),
			B(t).top?.header ? (G(), q(wa(B(t).top.header), je(Us({ key: 1 }, B(t).top.props)), null, 16)) : X("", !0),
			J("button", {
				class: "trpg-icon-btn trpg-modal__close",
				type: "button",
				"aria-label": "关闭",
				onClick: a[1] ||= (e) => B(t).requestClose()
			}, [Y(wS, {
				name: "x",
				size: 18
			})])
		])), Y(Yl, {
			tag: "div",
			name: "trpg-page",
			class: "trpg-modal__pages"
		}, {
			default: V(() => [(G(!0), K(W, null, Oa(B(t).stack, (e, n) => (G(), K("div", {
				key: e.key,
				class: Ae(["trpg-modal__page", { "is-under": n < B(t).depth - 1 }]),
				inert: n < B(t).depth - 1,
				"aria-hidden": n < B(t).depth - 1 ? "true" : void 0
			}, [(G(), q(wa(e.component), Us({ ref_for: !0 }, e.props), null, 16))], 10, vC))), 128))]),
			_: 1
		})], 12, hC)], 40, mC)) : X("", !0)], 512));
	}
}), xC = {
	src: null,
	alt: "",
	source: "pattern"
};
function SC(e) {
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
	} : xC;
}
// src/ui/format.ts
var CC = (e) => String(e).padStart(2, "0");
function wC(e) {
	let t = new Date(e);
	return `${t.getMonth() + 1}月${t.getDate()}日 ${CC(t.getHours())}:${CC(t.getMinutes())}`;
}
function TC(e) {
	let t = new Date(e);
	return `${CC(t.getHours())}:${CC(t.getMinutes())}`;
}
function EC(e) {
	return e >= 1048576 ? `${(e / 1024 / 1024).toFixed(1).replace(/\.0$/, "")}MB` : e >= 1024 ? `${Math.round(e / 1024)}KB` : `${e}B`;
}
function DC(e) {
	let { partyNames: t, location: n, round: r } = e.summary;
	return [
		t.slice(0, 3).join("、"),
		n,
		r ? `第 ${r} 轮` : ""
	].filter(Boolean).join(" · ");
}
function OC(e) {
	return e instanceof Error ? e.message : String(e);
}
// src/stores/saves.ts
var kC = Ex("saves", () => {
	let e = Dx(), t = kx(), n = /* @__PURE__ */ z("card"), r = /* @__PURE__ */ z([]), i = /* @__PURE__ */ z([]), a = /* @__PURE__ */ z([]), o = /* @__PURE__ */ z([]), s = /* @__PURE__ */ z([]), c = /* @__PURE__ */ z(!1);
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
function AC(e, t) {
	let n = pC();
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
var jC = { class: "trpg-confirm" }, MC = { class: "trpg-confirm__message" }, NC = {
	key: 0,
	class: "trpg-confirm__details"
}, PC = { class: "trpg-confirm__actions" }, FC = ["data-autofocus"], IC = ["data-autofocus"], LC = /* @__PURE__ */ H({
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
		return (e, n) => (G(), K("div", jC, [
			J("p", MC, F(t.message), 1),
			t.details?.length ? (G(), K("ul", NC, [(G(!0), K(W, null, Oa(t.details, (e) => (G(), K("li", { key: e }, F(e), 1))), 128))])) : X("", !0),
			J("div", PC, [J("button", {
				class: "trpg-btn",
				type: "button",
				"data-autofocus": t.danger ? "" : void 0,
				onClick: n[0] ||= (e) => t.onAnswer(!1)
			}, F(t.cancelLabel ?? "取消"), 9, FC), J("button", {
				class: Ae(["trpg-btn", t.danger ? "trpg-btn--danger" : "trpg-btn--primary"]),
				type: "button",
				"data-autofocus": t.danger ? void 0 : "",
				onClick: n[1] ||= (e) => t.onAnswer(!0)
			}, F(t.confirmLabel), 11, IC)])
		]));
	}
}), RC = 0;
function zC(e) {
	return AC({
		key: `confirm:${++RC}`,
		title: e.title,
		component: vn(LC),
		props: (t) => ({
			...e,
			onAnswer: t
		})
	}, !1);
}
// src/ui/kit/Segmented.vue?vue&type=script&setup=true&lang.ts
var BC = ["aria-label"], VC = [
	"aria-pressed",
	"disabled",
	"title",
	"onClick"
], HC = /* @__PURE__ */ H({
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
		return (n, r) => (G(), K("div", {
			class: "trpg-seg",
			role: "group",
			"aria-label": e.label
		}, [(G(!0), K(W, null, Oa(e.options, (e) => (G(), K("button", {
			key: e.value,
			type: "button",
			"aria-pressed": t.value === e.value,
			disabled: e.disabled,
			title: e.disabled ? e.hint : void 0,
			onClick: (n) => t.value = e.value
		}, F(e.label), 9, VC))), 128))], 8, BC));
	}
}), UC = Uint8Array, WC = Uint16Array, GC = Int32Array, KC = new UC([
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
]), qC = new UC([
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
]), JC = new UC([
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
]), YC = function(e, t) {
	for (var n = new WC(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new GC(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, XC = YC(KC, 2), ZC = XC.b, QC = XC.r;
ZC[28] = 258, QC[258] = 28;
for (var $C = YC(qC, 0), ew = $C.b, tw = $C.r, nw = new WC(32768), rw = 0; rw < 32768; ++rw) {
	var iw = (rw & 43690) >> 1 | (rw & 21845) << 1;
	iw = (iw & 52428) >> 2 | (iw & 13107) << 2, iw = (iw & 61680) >> 4 | (iw & 3855) << 4, nw[rw] = ((iw & 65280) >> 8 | (iw & 255) << 8) >> 1;
}
for (var aw = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new WC(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new WC(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new WC(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[nw[d] >> c] = l;
	} else for (s = new WC(r), i = 0; i < r; ++i) e[i] && (s[i] = nw[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), ow = new UC(288), rw = 0; rw < 144; ++rw) ow[rw] = 8;
for (var rw = 144; rw < 256; ++rw) ow[rw] = 9;
for (var rw = 256; rw < 280; ++rw) ow[rw] = 7;
for (var rw = 280; rw < 288; ++rw) ow[rw] = 8;
for (var sw = new UC(32), rw = 0; rw < 32; ++rw) sw[rw] = 5;
var cw = /*#__PURE__*/ aw(ow, 9, 0), lw = /*#__PURE__*/ aw(ow, 9, 1), uw = /*#__PURE__*/ aw(sw, 5, 0), dw = /*#__PURE__*/ aw(sw, 5, 1), fw = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, pw = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, mw = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, hw = function(e) {
	return (e + 7) / 8 | 0;
}, gw = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new UC(e.subarray(t, n));
}, _w = [
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
], vw = function(e, t, n) {
	var r = Error(t || _w[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, vw), !n) throw r;
	return r;
}, yw = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new UC(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new UC(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new UC(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = pw(e, d, 1);
			var v = pw(e, d + 1, 3);
			if (d += 3, !v) {
				var y = hw(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && vw(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = lw, m = dw, h = 9, g = 5;
			else if (v == 2) {
				var S = pw(e, d, 31) + 257, C = pw(e, d + 10, 15) + 4, w = S + pw(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new UC(w), E = new UC(19), D = 0; D < C; ++D) E[JC[D]] = pw(e, d + D * 3, 7);
				d += C * 3;
				for (var O = fw(E), k = (1 << O) - 1, ee = aw(E, O, 1), D = 0; D < w;) {
					var te = ee[pw(e, d, k)];
					d += te & 15;
					var y = te >> 4;
					if (y < 16) T[D++] = y;
					else {
						var ne = 0, A = 0;
						for (y == 16 ? (A = 3 + pw(e, d, 3), d += 2, ne = T[D - 1]) : y == 17 ? (A = 3 + pw(e, d, 7), d += 3) : y == 18 && (A = 11 + pw(e, d, 127), d += 7); A--;) T[D++] = ne;
					}
				}
				var j = T.subarray(0, S), M = T.subarray(S);
				h = fw(j), g = fw(M), p = aw(j, h, 1), m = aw(M, g, 1);
			} else vw(1);
			if (d > _) {
				c && vw(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var re = (1 << h) - 1, N = (1 << g) - 1, ie = d;; ie = d) {
			var ne = p[mw(e, d) & re], ae = ne >> 4;
			if (d += ne & 15, d > _) {
				c && vw(0);
				break;
			}
			if (ne || vw(2), ae < 256) n[f++] = ae;
			else if (ae == 256) {
				ie = d, p = null;
				break;
			} else {
				var oe = ae - 254;
				if (ae > 264) {
					var D = ae - 257, se = KC[D];
					oe = pw(e, d, (1 << se) - 1) + ZC[D], d += se;
				}
				var ce = m[mw(e, d) & N], le = ce >> 4;
				ce || vw(3), d += ce & 15;
				var M = ew[le];
				if (le > 3) {
					var se = qC[le];
					M += mw(e, d) & (1 << se) - 1, d += se;
				}
				if (d > _) {
					c && vw(0);
					break;
				}
				s && l(f + 131072);
				var ue = f + oe;
				if (f < M) {
					var de = a - M, fe = Math.min(M, ue);
					for (de + f < 0 && vw(3); f < fe; ++f) n[f] = r[de + f];
				}
				for (; f < ue; ++f) n[f] = n[f - M];
			}
		}
		t.l = p, t.p = ie, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? gw(n, 0, f) : n.subarray(0, f);
}, bw = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8;
}, xw = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, Sw = function(e, t) {
	for (var n = [], r = 0; r < e.length; ++r) e[r] && n.push({
		s: r,
		f: e[r]
	});
	var i = n.length, a = n.slice();
	if (!i) return {
		t: kw,
		l: 0
	};
	if (i == 1) {
		var o = new UC(n[0].s + 1);
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
	var p = new WC(f + 1), m = Cw(n[u - 1], p, 0);
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
		t: new UC(p),
		l: m
	};
}, Cw = function(e, t, n) {
	return e.s == -1 ? Math.max(Cw(e.l, t, n + 1), Cw(e.r, t, n + 1)) : t[e.s] = n;
}, ww = function(e) {
	for (var t = e.length; t && !e[--t];);
	for (var n = new WC(++t), r = 0, i = e[0], a = 1, o = function(e) {
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
}, Tw = function(e, t) {
	for (var n = 0, r = 0; r < t.length; ++r) n += e[r] * t[r];
	return n;
}, Ew = function(e, t, n) {
	var r = n.length, i = hw(t + 2);
	e[i] = r & 255, e[i + 1] = r >> 8, e[i + 2] = e[i] ^ 255, e[i + 3] = e[i + 1] ^ 255;
	for (var a = 0; a < r; ++a) e[i + a + 4] = n[a];
	return (i + 4 + r) * 8;
}, Dw = function(e, t, n, r, i, a, o, s, c, l, u) {
	bw(t, u++, n), ++i[256];
	for (var d = Sw(i, 15), f = d.t, p = d.l, m = Sw(a, 15), h = m.t, g = m.l, _ = ww(f), v = _.c, y = _.n, b = ww(h), x = b.c, S = b.n, C = new WC(19), w = 0; w < v.length; ++w) ++C[v[w] & 31];
	for (var w = 0; w < x.length; ++w) ++C[x[w] & 31];
	for (var T = Sw(C, 7), E = T.t, D = T.l, O = 19; O > 4 && !E[JC[O - 1]]; --O);
	var k = l + 5 << 3, ee = Tw(i, ow) + Tw(a, sw) + o, te = Tw(i, f) + Tw(a, h) + o + 14 + 3 * O + Tw(C, E) + 2 * C[16] + 3 * C[17] + 7 * C[18];
	if (c >= 0 && k <= ee && k <= te) return Ew(t, u, e.subarray(c, c + l));
	var ne, A, j, M;
	if (bw(t, u, 1 + (te < ee)), u += 2, te < ee) {
		ne = aw(f, p, 0), A = f, j = aw(h, g, 0), M = h;
		var re = aw(E, D, 0);
		bw(t, u, y - 257), bw(t, u + 5, S - 1), bw(t, u + 10, O - 4), u += 14;
		for (var w = 0; w < O; ++w) bw(t, u + 3 * w, E[JC[w]]);
		u += 3 * O;
		for (var N = [v, x], ie = 0; ie < 2; ++ie) for (var ae = N[ie], w = 0; w < ae.length; ++w) {
			var oe = ae[w] & 31;
			bw(t, u, re[oe]), u += E[oe], oe > 15 && (bw(t, u, ae[w] >> 5 & 127), u += ae[w] >> 12);
		}
	} else ne = cw, A = ow, j = uw, M = sw;
	for (var w = 0; w < s; ++w) {
		var se = r[w];
		if (se > 255) {
			var oe = se >> 18 & 31;
			xw(t, u, ne[oe + 257]), u += A[oe + 257], oe > 7 && (bw(t, u, se >> 23 & 31), u += KC[oe]);
			var ce = se & 31;
			xw(t, u, j[ce]), u += M[ce], ce > 3 && (xw(t, u, se >> 5 & 8191), u += qC[ce]);
		} else xw(t, u, ne[se]), u += A[se];
	}
	return xw(t, u, ne[256]), u + A[256];
}, Ow = /*#__PURE__*/ new GC([
	65540,
	131080,
	131088,
	131104,
	262176,
	1048704,
	1048832,
	2114560,
	2117632
]), kw = /*#__PURE__*/ new UC(0), Aw = function(e, t, n, r, i, a) {
	var o = a.z || e.length, s = new UC(r + o + 5 * (1 + Math.ceil(o / 7e3)) + i), c = s.subarray(r, s.length - i), l = a.l, u = (a.r || 0) & 7;
	if (t) {
		u && (c[0] = a.r >> 3);
		for (var d = Ow[t - 1], f = d >> 13, p = d & 8191, m = (1 << n) - 1, h = a.p || new WC(32768), g = a.h || new WC(m + 1), _ = Math.ceil(n / 3), v = 2 * _, y = function(t) {
			return (e[t] ^ e[t + 1] << _ ^ e[t + 2] << v) & m;
		}, b = new GC(25e3), x = new WC(288), S = new WC(32), C = 0, w = 0, T = a.i || 0, E = 0, D = a.w || 0, O = 0; T + 2 < o; ++T) {
			var k = y(T), ee = T & 32767, te = g[k];
			if (h[ee] = te, g[k] = ee, D <= T) {
				var ne = o - T;
				if ((C > 7e3 || E > 24576) && (ne > 423 || !l)) {
					u = Dw(e, c, 0, b, x, S, w, E, O, T - O, u), E = C = w = 0, O = T;
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
					b[E++] = 268435456 | QC[j] << 18 | tw[M];
					var fe = QC[j] & 31, pe = tw[M] & 31;
					w += KC[fe] + qC[pe], ++x[257 + fe], ++S[pe], D = T + j, ++C;
				} else b[E++] = e[T], ++x[e[T]];
			}
		}
		for (T = Math.max(T, D); T < o; ++T) b[E++] = e[T], ++x[e[T]];
		u = Dw(e, c, l, b, x, S, w, E, O, T - O, u), l || (a.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, a.h = g, a.p = h, a.i = T, a.w = D);
	} else {
		for (var T = a.w || 0; T < o + l; T += 65535) {
			var me = T + 65535;
			me >= o && (c[u / 8 | 0] = l, me = o), u = Ew(c, u + 1, e.subarray(T, me));
		}
		a.i = o;
	}
	return gw(s, 0, r + hw(u) + i);
}, jw = /*#__PURE__*/ (function() {
	for (var e = /* @__PURE__ */ new Int32Array(256), t = 0; t < 256; ++t) {
		for (var n = t, r = 9; --r;) n = (n & 1 && -306674912) ^ n >>> 1;
		e[t] = n;
	}
	return e;
})(), Mw = function() {
	var e = -1;
	return {
		p: function(t) {
			for (var n = e, r = 0; r < t.length; ++r) n = jw[n & 255 ^ t[r]] ^ n >>> 8;
			e = n;
		},
		d: function() {
			return ~e;
		}
	};
}, Nw = function(e, t, n, r, i) {
	if (!i && (i = { l: 1 }, t.dictionary)) {
		var a = t.dictionary.subarray(-32768), o = new UC(a.length + e.length);
		o.set(a), o.set(e, a.length), e = o, i.w = a.length;
	}
	return Aw(e, t.level == null ? 6 : t.level, t.mem == null ? i.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, i);
}, Pw = function(e, t) {
	var n = {};
	for (var r in e) n[r] = e[r];
	for (var r in t) n[r] = t[r];
	return n;
}, Fw = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, Iw = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, Lw = function(e, t) {
	return Iw(e, t) + Iw(e, t + 4) * 4294967296;
}, Rw = function(e, t, n) {
	for (; n; ++t) e[t] = n, n >>>= 8;
};
function zw(e, t) {
	return Nw(e, t || {}, 0, 0);
}
function Bw(e, t) {
	return yw(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var Vw = function(e, t, n, r) {
	for (var i in e) {
		var a = e[i], o = t + i, s = r;
		Array.isArray(a) && (s = Pw(r, a[1]), a = a[0]), ArrayBuffer.isView(a) ? n[o] = [a, s] : (n[o += "/"] = [new UC(0), s], Vw(a, o, n, r));
	}
}, Hw = typeof TextEncoder < "u" && /*#__PURE__*/ new TextEncoder(), Uw = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	Uw.decode(kw, { stream: !0 });
} catch {}
var Ww = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: gw(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function Gw(e, t) {
	if (t) {
		for (var n = new UC(e.length), r = 0; r < e.length; ++r) n[r] = e.charCodeAt(r);
		return n;
	}
	if (Hw) return Hw.encode(e);
	for (var i = e.length, a = new UC(e.length + (e.length >> 1)), o = 0, s = function(e) {
		a[o++] = e;
	}, r = 0; r < i; ++r) {
		if (o + 5 > a.length) {
			var c = new UC(o + 8 + (i - r << 1));
			c.set(a), a = c;
		}
		var l = e.charCodeAt(r);
		l < 128 || t ? s(l) : l < 2048 ? (s(192 | l >> 6), s(128 | l & 63)) : l > 55295 && l < 57344 ? (l = 65536 + (l & 1047552) | e.charCodeAt(++r) & 1023, s(240 | l >> 18), s(128 | l >> 12 & 63), s(128 | l >> 6 & 63), s(128 | l & 63)) : (s(224 | l >> 12), s(128 | l >> 6 & 63), s(128 | l & 63));
	}
	return gw(a, 0, o);
}
function Kw(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	}
	if (Uw) return Uw.decode(e);
	var i = Ww(e), a = i.s, n = i.r;
	return n.length && vw(8), a;
}
var qw = function(e, t) {
	return t + 30 + Fw(e, t + 26) + Fw(e, t + 28);
}, Jw = function(e, t, n) {
	var r = Fw(e, t + 28), i = Fw(e, t + 30), a = Kw(e.subarray(t + 46, t + 46 + r), !(Fw(e, t + 8) & 2048)), o = t + 46 + r, s = Yw(e, o, i, n, Iw(e, t + 20), Iw(e, t + 24), Iw(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		Fw(e, t + 10),
		c,
		l,
		a,
		o + i + Fw(e, t + 32),
		u
	];
}, Yw = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + Fw(e, t + 2)) if (Fw(e, t) == 1) return [
			s ? Lw(e, t + 4 + 8 * c) : i,
			c ? Lw(e, t + 4) : a,
			l ? Lw(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && vw(13);
	}
	return [
		i,
		a,
		o,
		0
	];
}, Xw = function(e) {
	var t = 0;
	if (e) for (var n in e) {
		var r = e[n].length;
		r > 65535 && vw(9), t += r + 4;
	}
	return t;
}, Zw = function(e, t, n, r, i, a, o, s) {
	var c = r.length, l = n.extra, u = s && s.length, d = Xw(l);
	Rw(e, t, o == null ? 67324752 : 33639248), t += 4, o != null && (e[t++] = 20, e[t++] = n.os), e[t] = 20, t += 2, e[t++] = n.flag << 1 | (a < 0 && 8), e[t++] = i && 8, e[t++] = n.compression & 255, e[t++] = n.compression >> 8;
	var f = new Date(n.mtime == null ? Date.now() : n.mtime), p = f.getFullYear() - 1980;
	if ((p < 0 || p > 119) && vw(10), Rw(e, t, p << 25 | f.getMonth() + 1 << 21 | f.getDate() << 16 | f.getHours() << 11 | f.getMinutes() << 5 | f.getSeconds() >> 1), t += 4, a != -1 && (Rw(e, t, n.crc), Rw(e, t + 4, a < 0 ? -a - 2 : a), Rw(e, t + 8, n.size)), Rw(e, t + 12, c), Rw(e, t + 14, d), t += 16, o != null && (Rw(e, t, u), Rw(e, t + 6, n.attrs), Rw(e, t + 10, o), t += 14), e.set(r, t), t += c, d) for (var m in l) {
		var h = l[m], g = h.length;
		Rw(e, t, +m), Rw(e, t + 2, g), e.set(h, t + 4), t += 4 + g;
	}
	return u && (e.set(s, t), t += u), t;
}, Qw = function(e, t, n, r, i) {
	Rw(e, t, 101010256), Rw(e, t + 8, n), Rw(e, t + 10, n), Rw(e, t + 12, r), Rw(e, t + 16, i);
};
function $w(e, t) {
	t ||= {};
	var n = {}, r = [];
	Vw(e, "", n, t);
	var i = 0, a = 0;
	for (var o in n) {
		var s = n[o], c = s[0], l = s[1], u = l.level == 0 ? 0 : 8, d = Gw(o), f = d.length, p = l.comment, m = p && Gw(p), h = m && m.length, g = Xw(l.extra);
		f > 65535 && vw(11);
		var _ = u ? zw(c, l) : c, v = _.length, y = Mw();
		y.p(c), r.push(Pw(l, {
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
	for (var b = new UC(a + 22), x = i, S = a - i, C = 0; C < r.length; ++C) {
		var d = r[C];
		Zw(b, d.o, d, d.f, d.u, d.c.length);
		var w = 30 + d.f.length + Xw(d.extra);
		b.set(d.c, d.o + w), Zw(b, i, d, d.f, d.u, d.c.length, d.o, d.m), i += 16 + w + (d.m ? d.m.length : 0);
	}
	return Qw(b, i, r.length, S, x), b;
}
function eT(e, t) {
	for (var n = {}, r = e.length - 22; Iw(e, r) != 101010256; --r) (!r || e.length - r > 65558) && vw(13);
	var i = Fw(e, r + 8);
	if (!i) return {};
	var a = Iw(e, r + 16), o = Iw(e, r - 20) == 117853008;
	if (o) {
		var s = Iw(e, r - 12);
		o = Iw(e, s) == 101075792, o && (i = Iw(e, s + 32), a = Iw(e, s + 48));
	}
	for (var c = t && t.filter, l = 0; l < i; ++l) {
		var u = Jw(e, a, o), d = u[0], f = u[1], p = u[2], m = u[3], h = u[4], g = u[5], _ = qw(e, g);
		a = h, (!c || c({
			name: m,
			size: f,
			originalSize: p,
			compression: d
		})) && (d ? d == 8 ? n[m] = Bw(e.subarray(_, _ + f), { out: new UC(p) }) : vw(14, "unknown compression type " + d) : n[m] = gw(e, _, _ + f));
	}
	return n;
}
var tT = [
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
function nT(e) {
	return tT.find((t) => t.test(e))?.mime;
}
function rT(e, t) {
	if (t.length > 10485760) throw new Xy("E_BAD_CONTENT", `文件内容损坏：图片「${e}」过大`);
	let n = nT(t);
	if (!n) throw new Xy("E_BAD_CONTENT", `文件内容损坏：图片「${e}」不合法`);
	return n;
}
// src/core/files/zip.ts
function iT(e) {
	try {
		return eT(e);
	} catch {
		throw new Xy("E_NOT_ZIP", "无法识别：这不是 TRPG 跑团助手的文件");
	}
}
function aT(e) {
	let t = {};
	for (let n of Object.keys(e).sort()) {
		let r = e[n];
		t[n] = typeof r == "string" ? Gw(r) : r;
	}
	return $w(t, {
		level: 6,
		mtime: new Date(1980, 0, 1, 0, 0, 0)
	});
}
function oT(e, t) {
	let n = e[t];
	if (n) try {
		return JSON.parse(Kw(n));
	} catch {
		throw new Xy("E_BAD_CONTENT", `文件内容损坏：${t} 无法解析`);
	}
}
// src/core/transfer/saveFile.ts
var sT = zv({
	format: Kv(["trpg-save", "trpg-backup"]),
	formatVersion: Dv().int().positive(),
	appVersion: tv(),
	exportedAt: tv(),
	ruleIds: Lv(tv())
});
function cT(e) {
	return new Xy("E_BAD_CONTENT", `文件内容损坏：${e}`);
}
function lT(e) {
	return e?.path.map(String).join(".") || "整体";
}
function uT(e, t, n, r) {
	let i = [];
	for (let a of Object.keys(e).filter((e) => e.startsWith(t) && e.endsWith(".json")).sort()) {
		let t = oT(e, a);
		if (!t || typeof t != "object") throw cT(`${a} 不是有效的记录`);
		let o = r.safeParse(Mb(n, t));
		if (!o.success) throw cT(`${a} 的 ${lT(o.error.issues[0])} 不合法`);
		i.push(o.data);
	}
	return i;
}
function dT(e) {
	let t = iT(e), n = t["trpg-manifest.json"];
	if (!n) throw new Xy("E_NO_MANIFEST", "无法识别：缺少说明文件，可能不是本扩展导出的文件");
	let r;
	try {
		r = JSON.parse(Kw(n));
	} catch {
		throw cT("说明文件无法解析");
	}
	let i = r;
	if (i.format === "trpg-pack") throw new Xy("E_UNKNOWN_FORMAT", "这是旧版的扩展包文件（.trpgpack），新版已不再使用；自制内容请用【库】导入作者格式的文件");
	if (i.format !== "trpg-save" && i.format !== "trpg-backup") throw new Xy("E_UNKNOWN_FORMAT", "无法识别：未知的文件类型");
	if (typeof i.formatVersion != "number" || i.formatVersion > 3) throw new Xy("E_NEWER_FORMAT", "这个文件由更新版本的扩展创建，请先更新扩展");
	if (i.formatVersion < 3) throw new Xy("E_OLD_DATA", "这是旧版扩展导出的存档（旧扩展包格式），新版不再读取");
	let a = sT.safeParse(r);
	if (!a.success) throw cT(`说明文件的 ${lT(a.error.issues[0])} 不合法`);
	let o = uT(t, "saves/", "save", Cy), s = uT(t, "workspaces/", "workspace", by), c, l = oT(t, "settings.json");
	if (l !== void 0) {
		let e = wy.safeParse(l);
		if (!e.success) throw cT(`settings.json 的 ${lT(e.error.issues[0])} 不合法`);
		c = e.data;
	}
	let u = /* @__PURE__ */ new Map();
	for (let e of Object.keys(t).filter((e) => e.startsWith("blobs/") && !e.endsWith("/"))) {
		let n = e.slice(6);
		if (!/^[a-f0-9]{64}$/.test(n)) throw cT(`图片「${n}」的文件名不是哈希`);
		let r = t[e];
		if (Ob(r) !== n) throw cT(`图片「${n.slice(0, 12)}」的哈希不一致`);
		rT(n, r), u.set(n, r);
	}
	return {
		type: a.data.format === "trpg-backup" ? "backup" : "save",
		manifest: a.data,
		saves: o,
		workspaces: s,
		settings: c,
		blobs: u
	};
}
// src/core/transfer/importer.ts
function fT(e, t) {
	return e.saves.map((e) => t(e.ruleId) ? {
		save: e,
		selectable: !0
	} : {
		save: e,
		selectable: !1,
		reason: "规则未安装"
	});
}
function pT(e, t) {
	if (!t.has(e)) return e;
	let n = `${e}（导入）`;
	if (!t.has(n)) return n;
	for (let n = 2;; n++) {
		let r = `${e}（导入 ${n}）`;
		if (!t.has(r)) return r;
	}
}
async function mT(e, t, n) {
	let { db: r, campaign: i } = e, a = e.uuid ?? My, o = t.saves.filter((t) => e.hasRule(t.ruleId)), s = new Set(n.selectedIds), c = 0;
	return r.transaction("rw", [
		r.saves,
		r.workspaces,
		r.meta,
		r.blobs
	], async () => {
		let l = e.now();
		for (let [e, n] of t.blobs) await r.blobs.get(e) || await r.blobs.put({
			hash: e,
			bytes: n,
			mime: nT(n) ?? "application/octet-stream",
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
					name: pT(t.name, o),
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
			t.settings && await r.setMeta("settings", wy.parse(t.settings));
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
var hT = ["data-disabled"], gT = [
	"disabled",
	"indeterminate",
	"aria-label"
], _T = { class: "trpg-check__text" }, vT = /* @__PURE__ */ H({
	__name: "Checkbox",
	props: /*@__PURE__*/ Ya({
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
		let t = vo(e, "modelValue");
		return (n, r) => (G(), K("label", {
			class: "trpg-check",
			"data-disabled": e.disabled
		}, [Ar(J("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			type: "checkbox",
			disabled: e.disabled,
			indeterminate: e.indeterminate,
			"aria-label": e.label
		}, null, 8, gT), [[fu, t.value]]), J("span", _T, [U(n.$slots, "default")])], 8, hT));
	}
}), yT = {
	class: "page-stack",
	"data-testid": "import-save"
}, bT = { class: "trpg-import__ok" }, xT = {
	key: 0,
	class: "trpg-field"
}, ST = { class: "trpg-field__hint" }, CT = { class: "trpg-list" }, wT = { class: "trpg-row__title" }, TT = { class: "trpg-row__meta" }, ET = { class: "trpg-field__hint" }, DT = { class: "trpg-confirm__actions" }, OT = ["disabled"], kT = /* @__PURE__ */ H({
	__name: "SavePreview",
	props: { rec: {} },
	setup(e) {
		let t = e, n = Dx(), r = kx(), i = pC(), a = kC(), o = cS(), s = Z(() => fT(t.rec, (e) => n.svc().rules.has(e))), c = /* @__PURE__ */ z(s.value.filter((e) => e.selectable).map((e) => e.save.id)), l = /* @__PURE__ */ z("merge"), u = /* @__PURE__ */ z(!1), d = Z(() => t.rec.type === "backup"), f = (e) => n.svc().rules.get(e)?.nameShort ?? e, p = Z(() => d.value && l.value === "overwrite" ? s.value.filter((e) => e.selectable).length : c.value.length), m = Z(() => d.value ? `完整备份 · ${t.rec.saves.length} 个存档` : `存档文件 · ${t.rec.saves.length} 个存档`);
		function h(e, t) {
			c.value = t ? [...c.value, e] : c.value.filter((t) => t !== e);
		}
		async function g() {
			let e = r.owner;
			if (!e) o.error("请先在酒馆中打开一个聊天");
			else if (!d.value || l.value !== "overwrite" || await zC({
				title: "覆盖并恢复",
				message: "先写入自动存档，再用备份替换全部存档、当前数据与设置。",
				confirmLabel: "覆盖并恢复",
				danger: !0
			})) {
				u.value = !0;
				try {
					let s = n.svc(), u = await mT({
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
					console.error("[trpg-assistant] 导入存档失败", e), o.error(`导入失败：${OC(e)}`);
				} finally {
					u.value = !1;
				}
			}
		}
		return (e, t) => (G(), K("div", yT, [
			J("p", bT, "✓ 已识别：" + F(m.value), 1),
			d.value ? (G(), K("div", xT, [Y(HC, {
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
			}, null, 8, ["modelValue"]), J("span", ST, F(l.value === "merge" ? "只添加尚不存在的存档与当前数据。" : "先写自动存档，再用备份替换全部存档、当前数据与设置。"), 1)])) : X("", !0),
			J("ul", CT, [(G(!0), K(W, null, Oa(s.value, (e) => (G(), K("li", {
				key: e.save.id,
				class: "trpg-row"
			}, [Y(vT, {
				"model-value": c.value.includes(e.save.id),
				disabled: !e.selectable || d.value && l.value === "overwrite",
				"onUpdate:modelValue": (t) => h(e.save.id, t)
			}, {
				default: V(() => [J("span", wT, F(e.save.name), 1)]),
				_: 2
			}, 1032, [
				"model-value",
				"disabled",
				"onUpdate:modelValue"
			]), J("span", TT, [Rs(F(f(e.save.ruleId)) + " · " + F(B(wC)(e.save.updatedAt)), 1), e.reason ? (G(), K(W, { key: 0 }, [Rs(" · " + F(e.reason) + "（不可选）", 1)], 64)) : X("", !0)])]))), 128))]),
			J("p", ET, "导入为「" + F(B(r).owner?.ownerLabel ?? "当前角色卡") + "」的存档；重名时名称后加\"（导入）\"。", 1),
			J("div", DT, [J("button", {
				class: "trpg-btn",
				type: "button",
				onClick: t[1] ||= (e) => B(i).close(!0)
			}, "取消"), J("button", {
				class: Ae(["trpg-btn", d.value && l.value === "overwrite" ? "trpg-btn--danger" : "trpg-btn--primary"]),
				type: "button",
				disabled: u.value || p.value === 0,
				onClick: g
			}, F(d.value && l.value === "overwrite" ? "覆盖并恢复" : `导入 ${p.value} 个`), 11, OT)])
		]));
	}
}), AT = { class: "page-stack" }, jT = {
	class: "trpg-row__meta",
	"data-testid": "import-filename"
}, MT = {
	key: 0,
	class: "page-stack",
	role: "alert"
}, NT = { class: "trpg-field__error" }, PT = { class: "trpg-confirm__actions" }, FT = {
	key: 1,
	class: "page-intro",
	role: "status"
}, IT = /* @__PURE__ */ H({
	__name: "ImportPage",
	props: { file: {} },
	setup(e) {
		let t = e, n = pC(), r = /* @__PURE__ */ Sn(null), i = /* @__PURE__ */ z(""), a = /* @__PURE__ */ z(null);
		da(async () => {
			try {
				r.value = dT(new Uint8Array(await t.file.arrayBuffer()));
			} catch (e) {
				e instanceof Xy || console.error("[trpg-assistant] 识别文件失败", e), i.value = OC(e);
			}
		});
		function o(e) {
			let t = e.target, n = t.files?.[0];
			t.value = "", n && LT(n);
		}
		return (e, s) => (G(), K("div", AT, [J("p", jT, F(t.file.name), 1), i.value ? (G(), K("div", MT, [J("p", NT, "⚠ " + F(i.value), 1), J("div", PT, [
			J("button", {
				class: "trpg-btn",
				type: "button",
				onClick: s[0] ||= (e) => a.value?.click()
			}, "选择其他文件"),
			J("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				onClick: s[1] ||= (e) => B(n).close(!0)
			}, "关闭"),
			J("input", {
				ref_key: "picker",
				ref: a,
				class: "trpg-sr-only",
				type: "file",
				accept: ".trpgsave,.zip",
				tabindex: "-1",
				"aria-hidden": "true",
				onChange: o
			}, null, 544)
		])])) : r.value ? (G(), q(kT, {
			key: 2,
			rec: r.value
		}, null, 8, ["rec"])) : (G(), K("p", FT, "正在识别…"))]));
	}
});
// src/ui/imports/openImport.ts
function LT(e) {
	pC().open({
		key: "import",
		title: "导入文件",
		component: vn(IT),
		props: { file: e },
		variant: "dialog"
	});
}
// src/core/files/assets.ts
function RT(e, t = /* @__PURE__ */ new Set()) {
	if (Array.isArray(e)) for (let n of e) RT(n, t);
	else if (e && typeof e == "object") {
		let n = e;
		typeof n.$asset == "string" && t.add(n.$asset);
		for (let e of Object.values(n)) RT(e, t);
	}
	return t;
}
// src/core/transfer/exporter.ts
function zT(e) {
	let t = new Date(e);
	return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function BT(e) {
	return e.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "") || "存档";
}
async function VT(e, t) {
	if (t.type === "save") {
		let n = await e.saves.get(t.saveId);
		if (!n || n.deletedAt !== void 0) throw new Xy("E_NOT_FOUND", "没有找到这个存档");
		return [n];
	}
	return (await e.saves.toArray()).filter((e) => e.deletedAt === void 0);
}
async function HT(e, t) {
	return { saveBytes: (await VT(e.db, t)).reduce((e, t) => e + JSON.stringify(t).length, 0) };
}
async function UT(e, t) {
	let n = await VT(e.db, t), r = {};
	for (let e of n) r[`saves/${e.id}.json`] = JSON.stringify(e);
	let i = [];
	if (t.type === "backup") {
		i = await e.db.workspaces.toArray();
		for (let e of i) r[`workspaces/${encodeURIComponent(e.ownerKey)}.json`] = JSON.stringify(e);
		r["settings.json"] = JSON.stringify(await ky(e.db));
	}
	let a = RT([n, i]);
	for (let t of [...a].sort()) {
		let n = await e.db.blobs.get(t);
		n && (r[`blobs/${t}`] = n.bytes);
	}
	r["trpg-manifest.json"] = JSON.stringify({
		format: t.type === "backup" ? "trpg-backup" : "trpg-save",
		formatVersion: 3,
		appVersion: e.appVersion,
		exportedAt: new Date(e.now()).toISOString(),
		ruleIds: [...new Set(n.map((e) => e.ruleId))]
	});
	let o = zT(e.now()), s = t.type === "backup" ? `TRPG备份_${o}.trpgsave` : `${BT(n[0].name)}_${o}.trpgsave`;
	return {
		bytes: aT(r),
		filename: s
	};
}
// src/ui/download.ts
function WT(e, t) {
	let n = new Blob([e], { type: "application/octet-stream" }), r = URL.createObjectURL(n), i = document.createElement("a");
	i.href = r, i.download = t, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e4);
}
// src/ui/saves/ExportPage.vue?vue&type=script&setup=true&lang.ts
var GT = { class: "page-stack" }, KT = { class: "trpg-field" }, qT = { class: "trpg-field__hint" }, JT = { class: "trpg-confirm__actions" }, YT = ["disabled"], XT = /* @__PURE__ */ H({
	__name: "ExportPage",
	props: { saveId: {} },
	setup(e) {
		let t = e, n = Dx(), r = kx(), i = pC(), a = cS(), o = /* @__PURE__ */ z(t.saveId ?? r.currentSave?.id ?? ""), s = /* @__PURE__ */ z(t.saveId || r.currentSave ? "save" : "backup"), c = /* @__PURE__ */ z("存档"), l = /* @__PURE__ */ z(null), u = /* @__PURE__ */ z(!1), d = Z(() => s.value === "backup" ? { type: "backup" } : {
			type: "save",
			saveId: o.value
		}), f = () => ({
			db: n.svc().db,
			now: n.svc().now,
			appVersion: qb
		}), p = Z(() => EC(l.value?.saveBytes ?? 0)), m = Z(() => new Date(n.svc().now()).toISOString().slice(0, 10)), h = Z(() => s.value === "backup" ? `TRPG备份_${m.value}.trpgsave` : `${c.value.replace(/\s+/g, "_")}_${m.value}.trpgsave`);
		async function g() {
			try {
				s.value === "save" && (c.value = (await n.svc().campaign.getSave(o.value))?.name ?? "存档"), l.value = await HT(f(), d.value);
			} catch (e) {
				console.error("[trpg-assistant] 估算导出大小失败", e), l.value = null;
			}
		}
		da(g), Br(s, g);
		async function _() {
			u.value = !0;
			try {
				let { bytes: e, filename: t } = await UT(f(), d.value);
				WT(e, t), s.value === "backup" && (await Ay(n.svc().db, n.svc().now()), await n.refreshBackup()), a.success(`已导出「${t}」`), i.close(!0);
			} catch (e) {
				console.error("[trpg-assistant] 导出失败", e), a.error(`导出失败：${OC(e)}`);
			} finally {
				u.value = !1;
			}
		}
		return (e, t) => (G(), K("div", GT, [
			J("div", KT, [t[2] ||= J("span", { class: "trpg-field__label" }, "范围", -1), Y(HC, {
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
			J("p", qT, "文件名 " + F(h.value) + " · 约 " + F(p.value), 1),
			J("div", JT, [J("button", {
				class: "trpg-btn",
				type: "button",
				onClick: t[1] ||= (e) => B(i).close(!0)
			}, "取消"), J("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: u.value || s.value === "save" && !o.value,
				onClick: _
			}, F(u.value ? "打包中…" : "导出"), 9, YT)])
		]));
	}
});
// src/ui/saves/fileActions.ts
function ZT(e) {
	pC().open({
		key: "export",
		title: "导出",
		component: vn(XT),
		props: { saveId: e },
		variant: "dialog"
	});
}
async function QT(e) {
	LT(e);
}
// node_modules/ohash/dist/_chunks/is-equal.mjs
function $T(e) {
	return typeof e == "string" ? `'${e}'` : new rE().serialize(e);
}
var eE = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz", tE = /*@__PURE__*/ (function() {
	let e = /* @__PURE__ */ new Uint8Array(128);
	for (let t = 0; t < 69; t++) e[eE.charCodeAt(t)] = t + 1;
	for (let t = 65; t <= 90; t++) e[t] = e[t + 32];
	return e;
})();
function nE(e, t) {
	if (e === t) return 0;
	let n = Math.min(e.length, t.length), r = 0;
	for (let i = 0; i < n; i++) {
		let n = e.charCodeAt(i), a = t.charCodeAt(i);
		if (n === a) continue;
		let o = n < 128 && tE[n] ? tE[n] : n + 128, s = a < 128 && tE[a] ? tE[a] : a + 128;
		if (o !== s) return o < s ? -1 : 1;
		r === 0 && (r = n > a ? -1 : 1);
	}
	return e.length === t.length ? r : e.length < t.length ? -1 : 1;
}
var rE = /*@__PURE__*/ (function() {
	class e {
		#e = /* @__PURE__ */ new Map();
		compare(e, t) {
			let n = typeof e, r = typeof t;
			return n === "string" && r === "string" ? nE(e, t) : n === "number" && r === "number" ? e - t : nE(this.serialize(e, !0), this.serialize(t, !0));
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
			let i = Object.keys(e).sort(nE), a = `${r}{`;
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
function iE(e, t) {
	return e === t || $T(e) === $T(t);
}
// node_modules/reka-ui/dist/shared/arrays.js
function aE(e, t, n) {
	let r = e.findIndex((e) => iE(e, t)), i = e.findIndex((e) => iE(e, n));
	if (r === -1 || i === -1) return [];
	let [a, o] = [r, i].sort((e, t) => e - t);
	return e.slice(a, o + 1);
}
// node_modules/reka-ui/dist/shared/clamp.js
function oE(e, t = -Infinity, n = Infinity) {
	return Math.min(n, Math.max(t, e));
}
// node_modules/reka-ui/dist/shared/createContext.js
function sE(e, t) {
	let n = typeof e == "string" && !t ? `${e}Context` : t, r = Symbol(n);
	return [(t) => {
		let n = Nr(r, t);
		if (n || n === null) return n;
		throw Error(`Injection \`${r.toString()}\` not found. Component must be used within ${Array.isArray(e) ? `one of the following components: ${e.join(", ")}` : `\`${e}\``}`);
	}, (e) => (Mr(r, e), e)];
}
// node_modules/reka-ui/dist/shared/getActiveElement.js
function cE() {
	let e = document.activeElement;
	if (e == null) return null;
	for (; e != null && e.shadowRoot != null && e.shadowRoot.activeElement != null;) e = e.shadowRoot.activeElement;
	return e;
}
// node_modules/reka-ui/dist/shared/handleAndDispatchCustomEvent.js
function lE(e, t, n) {
	let r = n.originalEvent.target, i = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && r.addEventListener(e, t, { once: !0 }), r.dispatchEvent(i);
}
// node_modules/reka-ui/dist/shared/nullish.js
function uE(e) {
	return e == null;
}
// node_modules/@vueuse/shared/dist/index.js
function dE(e, t) {
	return qe() ? (Je(e, t), !0) : !1;
}
function fE() {
	let e = /* @__PURE__ */ new Set(), t = (t) => {
		e.delete(t);
	};
	return {
		on: (n) => {
			e.add(n);
			let r = () => t(n);
			return dE(r), { off: r };
		},
		off: t,
		trigger: (...t) => Promise.all(Array.from(e).map((e) => e(...t))),
		clear: () => {
			e.clear();
		}
	};
}
function pE(e) {
	let t = !1, n, r = Ke(!0);
	return ((...i) => (t ||= (n = r.run(() => e(...i)), !0), n));
}
var mE = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
var hE = (e) => e !== void 0, gE = Object.prototype.toString, _E = (e) => gE.call(e) === "[object Object]", vE = /* #__PURE__ */ yE();
function yE() {
	var e, t;
	return mE && !!((e = window) != null && (e = e.navigator) != null && e.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((t = window) == null || (t = t.navigator) == null ? void 0 : t.maxTouchPoints) > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function bE(e) {
	return Array.isArray(e) ? e : [e];
}
function xE(e) {
	return e || Xs();
}
function SE(e) {
	if (!mE) return e;
	let t = 0, n, r, i = () => {
		--t, r && t <= 0 && (r.stop(), n = void 0, r = void 0);
	};
	return ((...a) => (t += 1, r || (r = Ke(!0), n = r.run(() => e(...a))), dE(i), n));
}
function CE(e) {
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
function wE(e) {
	return CE(Z(e));
}
function TE(e, ...t) {
	let n = t.flat(), r = n[0];
	return wE(() => Object.fromEntries(typeof r == "function" ? Object.entries(/* @__PURE__ */ jn(e)).filter(([e, t]) => !r(En(t), e)) : Object.entries(/* @__PURE__ */ jn(e)).filter((e) => !n.includes(e[0]))));
}
function EE(e, t = 1e4) {
	return An((n, r) => {
		let i = En(e), a, o = () => setTimeout(() => {
			i = En(e), r();
		}, En(t));
		return dE(() => {
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
function DE(e, t) {
	xE(t) && ma(e, t);
}
function OE(e, t, n) {
	return Br(e, t, {
		...n,
		immediate: !0
	});
}
// node_modules/@vueuse/core/dist/index.js
var kE = mE ? window : void 0;
mE && window.document, mE && window.navigator, mE && window.location;
function AE(e) {
	let t = En(e);
	return t?.$el ?? t;
}
function jE(...e) {
	let t = (e, t, n, r) => (e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r)), n = Z(() => {
		let t = bE(En(e[0])).filter((e) => e != null);
		return t.every((e) => typeof e != "string") ? t : void 0;
	});
	return OE(() => [
		n.value?.map((e) => AE(e)) ?? [kE].filter((e) => e != null),
		bE(En(n.value ? e[1] : e[0])),
		bE(B(n.value ? e[2] : e[1])),
		En(n.value ? e[3] : e[2])
	], ([e, n, r, i], a, o) => {
		if (!e?.length || !n?.length || !r?.length) return;
		let s = _E(i) ? { ...i } : i, c = e.flatMap((e) => n.flatMap((n) => r.map((r) => t(e, n, r, s))));
		o(() => {
			c.forEach((e) => e());
		});
	}, { flush: "post" });
}
function ME() {
	let e = /* @__PURE__ */ Sn(!1), t = Xs();
	return t && da(() => {
		e.value = !0;
	}, t), e;
}
/* @__NO_SIDE_EFFECTS__ */
function NE(e) {
	let t = ME();
	return Z(() => (t.value, !!e()));
}
function PE(e) {
	return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function FE(...e) {
	let t, n, r = {};
	e.length === 3 ? (t = e[0], n = e[1], r = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], r = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
	let { target: i = kE, eventName: a = "keydown", passive: o = !1, dedupe: s = !1 } = r, c = PE(t);
	return jE(i, a, (e) => {
		e.repeat && En(s) || c(e) && n(e);
	}, o);
}
function IE(e) {
	return JSON.parse(JSON.stringify(e));
}
function LE(e, t, n = {}) {
	let { window: r = kE, ...i } = n, a, o = /* @__PURE__ */ NE(() => r && "ResizeObserver" in r), s = () => {
		a &&= (a.disconnect(), void 0);
	}, c = Br(Z(() => {
		let t = En(e);
		return Array.isArray(t) ? t.map((e) => AE(e)) : [AE(t)];
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
	return dE(l), {
		isSupported: o,
		stop: l
	};
}
function RE(e, t, n, r = {}) {
	var i, a;
	let { clone: o = !1, passive: s = !1, eventName: c, deep: l = !1, defaultValue: u, shouldEmit: d } = r, f = Xs(), p = n || f?.emit || (f == null || (i = f.$emit) == null ? void 0 : i.bind(f)) || (f == null || (a = f.proxy) == null || (a = a.$emit) == null ? void 0 : a.bind(f?.proxy)), m = c;
	t ||= "modelValue", m ||= `update:${t.toString()}`;
	let h = (e) => o ? typeof o == "function" ? o(e) : IE(e) : e, g = () => hE(e[t]) ? h(e[t]) : u, _ = (e) => {
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
	return Z({
		get() {
			return g();
		},
		set(e) {
			_(e);
		}
	});
}
// node_modules/reka-ui/dist/shared/renderSlotFragments.js
function zE(e) {
	return e ? e.flatMap((e) => e.type === W ? zE(e.children) : [e]) : [];
}
// node_modules/reka-ui/dist/shared/useArrowNavigation.js
var BE = ["INPUT", "TEXTAREA"];
function VE(e, t, n, r = {}) {
	if (!t || r.enableIgnoredElement && BE.includes(t.nodeName)) return null;
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
	return v || _ ? b = HE(y, t, {
		goForward: _ ? m : c === "ltr" ? d : f,
		loop: s
	}) : h ? b = y.at(0) || null : g && (b = y.at(-1) || null), u && b?.focus(), b;
}
function HE(e, t, n, r = e.includes(t) ? e.length : e.length + 1) {
	if (--r === 0) return null;
	let i = e.indexOf(t), a;
	if (a = i === -1 ? n.goForward ? 0 : e.length - 1 : n.goForward ? i + 1 : i - 1, !n.loop && (a < 0 || a >= e.length)) return null;
	let o = e[(a + e.length) % e.length];
	return o ? o.hasAttribute("disabled") && o.getAttribute("disabled") !== "false" ? HE(e, o, n, r) : o : null;
}
// node_modules/reka-ui/dist/ConfigProvider/ConfigProvider.js
var [UE, WE] = /*#__PURE__*/ sE("ConfigProvider"), GE = /* @__PURE__ */ new WeakMap();
function KE(e, t) {
	let n = GE.get(e);
	n || (n = {
		owners: /* @__PURE__ */ new Set(),
		original: e.body.style.pointerEvents
	}, GE.set(e, n)), n.owners.add(t), e.body.style.pointerEvents = "none";
}
function qE(e, t) {
	let n = GE.get(e);
	n?.owners.delete(t) && n.owners.size === 0 && (GE.delete(e), e.body.style.pointerEvents = n.original);
}
// node_modules/defu/dist/defu.mjs
function JE(e) {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null || Symbol.iterator in e ? !1 : Symbol.toStringTag in e ? Object.prototype.toString.call(e) === "[object Module]" : !0;
}
function YE(e, t, n = ".", r) {
	if (!JE(t)) return YE(e, {}, n, r);
	let i = { ...t };
	for (let t of Object.keys(e)) {
		if (t === "__proto__" || t === "constructor") continue;
		let a = e[t];
		a != null && (r && r(i, t, a, n) || (i[t] = Array.isArray(a) && Array.isArray(i[t]) ? [...a, ...i[t]] : JE(a) && JE(i[t]) ? YE(a, i[t], (n ? `${n}.` : "") + t.toString(), r) : a));
	}
	return i;
}
function XE(e) {
	return (...t) => t.reduce((t, n) => YE(t, n, "", e), {});
}
var ZE = XE(), QE = Symbol("useBodyScrollLock"), $E = SE(() => {
	let e = /* @__PURE__ */ z(/* @__PURE__ */ new Map()), t = /* @__PURE__ */ z(), n = Z(() => {
		for (let t of e.value.values()) if (t) return !0;
		return !1;
	}), r = UE({ scrollBody: /* @__PURE__ */ z(!0) }), i = null, a = () => {
		document.body.style.paddingRight = "", document.body.style.marginRight = "", qE(document, QE), document.documentElement.style.removeProperty("--scrollbar-width"), document.body.style.overflow = t.value ?? "", vE && i?.(), t.value = void 0;
	};
	return Br(n, (e, o) => {
		if (!mE) return;
		if (!e) {
			o && a();
			return;
		}
		t.value === void 0 && (t.value = document.body.style.overflow);
		let s = window.innerWidth - document.documentElement.clientWidth, c = {
			padding: s,
			margin: 0
		}, l = r.scrollBody?.value ? typeof r.scrollBody.value == "object" ? ZE({
			padding: r.scrollBody.value.padding === !0 ? s : r.scrollBody.value.padding,
			margin: r.scrollBody.value.margin === !0 ? s : r.scrollBody.value.margin
		}, c) : c : {
			padding: 0,
			margin: 0
		};
		s > 0 && (document.body.style.paddingRight = typeof l.padding == "number" ? `${l.padding}px` : String(l.padding), document.body.style.marginRight = typeof l.margin == "number" ? `${l.margin}px` : String(l.margin), document.documentElement.style.setProperty("--scrollbar-width", `${s}px`), document.body.style.overflow = "hidden"), vE && (i = jE(document, "touchmove", (e) => nD(e), { passive: !1 })), ur(() => {
			n.value && (KE(document, QE), document.body.style.overflow = "hidden");
		});
	}, {
		immediate: !0,
		flush: "sync"
	}), e;
});
function eD(e) {
	let t = Math.random().toString(36).substring(2, 7), n = $E();
	n.value.set(t, e ?? !1);
	let r = Z({
		get: () => n.value.get(t) ?? !1,
		set: (e) => n.value.set(t, e)
	});
	return DE(() => {
		n.value.delete(t);
	}), r;
}
function tD(e) {
	let t = window.getComputedStyle(e);
	if (t.overflowX === "scroll" || t.overflowY === "scroll" || t.overflowX === "auto" && e.clientWidth < e.scrollWidth || t.overflowY === "auto" && e.clientHeight < e.scrollHeight) return !0;
	{
		let t = e.parentNode;
		return !(t instanceof Element) || t.tagName === "BODY" ? !1 : tD(t);
	}
}
function nD(e) {
	let t = e || window.event, n = t.target;
	return n instanceof Element && tD(n) ? !1 : t.touches.length > 1 || (t.preventDefault && t.cancelable && t.preventDefault(), !1);
}
// node_modules/reka-ui/dist/shared/useComposing.js
var rD = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}]/u, iD = /android/i;
function aD() {
	return typeof navigator < "u" && iD.test(navigator.userAgent);
}
function oD(e) {
	let t = /* @__PURE__ */ z(!1), n = /* @__PURE__ */ z(!0), r = /* @__PURE__ */ z(!1), i = Z(() => t.value && n.value);
	function a() {
		t.value = !0, n.value = !0, r.value = !1;
	}
	function o(e) {
		e.data && (rD.test(e.data) ? (n.value = !0, r.value = !0) : aD() && !r.value && (n.value = !1));
	}
	function s(n) {
		ur(() => {
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
function sD(e) {
	let t = UE({ dir: /* @__PURE__ */ z("ltr") });
	return Z(() => e?.value || t.dir?.value || "ltr");
}
// node_modules/reka-ui/dist/shared/useEmitAsProps.js
function cD(e) {
	let t = Xs(), n = t?.type.emits, r = {};
	return n?.length || console.warn(`No emitted event found. Please check component: ${t?.type.__name}`), n?.forEach((t) => {
		r[_e(pe(t))] = (...n) => e(t, ...n);
	}), r;
}
// node_modules/reka-ui/dist/shared/useFilter.js
function lD(e) {
	let t = Z(() => B(e)), n = Z(() => new Intl.Collator("en", {
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
var uD = 0;
function dD() {
	Lr((e) => {
		if (!mE) return;
		let t = document.querySelectorAll("[data-reka-focus-guard]");
		document.body.insertAdjacentElement("afterbegin", t[0] ?? fD()), document.body.insertAdjacentElement("beforeend", t[1] ?? fD()), uD++, e(() => {
			uD === 1 && document.querySelectorAll("[data-reka-focus-guard]").forEach((e) => e.remove()), uD--;
		});
	});
}
function fD() {
	let e = document.createElement("span");
	return e.setAttribute("data-reka-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
// node_modules/reka-ui/dist/shared/useFormControl.js
function pD(e) {
	return Z(() => !En(e) || !!AE(e)?.closest("form"));
}
// node_modules/reka-ui/dist/shared/useForwardExpose.js
function mD() {
	let e = Xs(), t = /* @__PURE__ */ z(), n = Z(() => r());
	pa(() => {
		n.value !== r() && Tn(t);
	});
	function r() {
		return t.value && "$el" in t.value && ["#text", "#comment"].includes(t.value.$el.nodeName) ? t.value.$el.nextElementSibling : AE(t);
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
function hD(e) {
	let t = Xs(), n = Object.keys(t?.type.props ?? {}).reduce((e, n) => {
		let r = (t?.type.props[n]).default;
		return r !== void 0 && (e[n] = r), e;
	}, {}), r = /* @__PURE__ */ Pn(e);
	return Z(() => {
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
function gD(e, t) {
	let n = hD(e), r = t ? cD(t) : {};
	return Z(() => ({
		...n.value,
		...r
	}));
}
// node_modules/aria-hidden/dist/es2015/index.js
var _D = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, vD = /* @__PURE__ */ new WeakMap(), yD = /* @__PURE__ */ new WeakMap(), bD = {}, xD = 0, SD = function(e) {
	return e && (e.host || SD(e.parentNode));
}, CD = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = SD(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, wD = function(e, t, n, r) {
	var i = CD(t, Array.isArray(e) ? e : [e]);
	bD[n] || (bD[n] = /* @__PURE__ */ new WeakMap());
	var a = bD[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		e && !s.has(e) && (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		e && !c.has(e) && Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (vD.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				vD.set(e, c), a.set(e, l), o.push(e), c === 1 && i && yD.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), xD++, function() {
		o.forEach(function(e) {
			var t = vD.get(e) - 1, i = a.get(e) - 1;
			vD.set(e, t), a.set(e, i), t || (yD.has(e) || e.removeAttribute(r), yD.delete(e)), i || e.removeAttribute(n);
		}), xD--, xD || (vD = /* @__PURE__ */ new WeakMap(), vD = /* @__PURE__ */ new WeakMap(), yD = /* @__PURE__ */ new WeakMap(), bD = {});
	};
}, TD = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || _D(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), wD(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
// node_modules/reka-ui/dist/shared/useHideOthers.js
function ED(e) {
	let t;
	Br(() => AE(e), (e) => {
		let n = !1;
		try {
			n = !!e?.closest("[popover]:not(:popover-open)");
		} catch {}
		e && !n ? t = TD(e) : t && t();
	}), ha(() => {
		t && t();
	});
}
// node_modules/reka-ui/dist/shared/useId.js
var DD = 0;
function OD(e, t = "reka") {
	if (e) return e;
	let n, r = UE({ useId: void 0 });
	return n = r.useId ? r.useId() : "useId" in Hu ? yi?.() : `${++DD}`, t ? `${t}-${n}` : n;
}
// node_modules/reka-ui/dist/shared/useKbd.js
function kD() {
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
function AD(e) {
	let t = /* @__PURE__ */ z(), n = Z(() => t.value?.width ?? 0), r = Z(() => t.value?.height ?? 0), i;
	return da(() => {
		let n = AE(e);
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
function jD(e, t) {
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
function MD(e) {
	let t = EE("", 1e3);
	return {
		search: t,
		handleTypeaheadSearch: (n, r) => {
			if (t.value += n, e) e(n);
			else {
				let e = cE(), n = r.map((e) => ({
					...e,
					textValue: e.value?.textValue ?? e.ref.textContent?.trim() ?? ""
				})), i = n.find((t) => t.ref === e), a = PD(n.map((e) => e.textValue), t.value, i?.textValue), o = n.find((e) => e.textValue === a);
				return o && o.ref.focus(), o?.ref;
			}
		},
		resetTypeahead: () => {
			t.value = "";
		}
	};
}
function ND(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
function PD(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = ND(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
// node_modules/reka-ui/dist/Presence/usePresence.js
function FD(e, t) {
	let n = /* @__PURE__ */ z({}), r = /* @__PURE__ */ z("none"), i = /* @__PURE__ */ z(e), a = e.value ? "mounted" : "unmounted", o, s = t.value?.ownerDocument.defaultView ?? kE, { state: c, dispatch: l } = jD(a, {
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
		if (mE) {
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
			let a = r.value, o = ID(t.value);
			e ? (l("MOUNT"), u("enter"), o === "none" && u("after-enter")) : o === "none" || o === "undefined" || n.value?.display === "none" ? (l("UNMOUNT"), u("leave"), u("after-leave")) : i && a !== o ? (l("ANIMATION_OUT"), u("leave")) : (l("UNMOUNT"), u("after-leave"));
		}
	}, { immediate: !0 });
	let d = (e) => {
		if (e.target !== t.value) return;
		let n = ID(t.value), r = n.includes(CSS.escape(e.animationName)), a = c.value === "mounted" ? "enter" : "leave";
		if (r && (u(`after-${a}`), l("ANIMATION_END"), !i.value)) {
			let e = t.value.style.animationFillMode;
			t.value.style.animationFillMode = "forwards", o = s?.setTimeout(() => {
				t.value?.style.animationFillMode === "forwards" && (t.value.style.animationFillMode = e);
			});
		}
		n === "none" && l("ANIMATION_END");
	}, f = (e) => {
		e.target === t.value && (r.value = ID(t.value));
	}, p = Br(t, (e, t) => {
		e ? (n.value = getComputedStyle(e), e.addEventListener("animationstart", f), e.addEventListener("animationcancel", d), e.addEventListener("animationend", d)) : (l("ANIMATION_END"), o !== void 0 && s?.clearTimeout(o), t?.removeEventListener("animationstart", f), t?.removeEventListener("animationcancel", d), t?.removeEventListener("animationend", d));
	}, { immediate: !0 }), m = Br(c, () => {
		let e = ID(t.value);
		r.value = c.value === "mounted" ? e : "none";
	});
	return ha(() => {
		p(), m(), t.value && (t.value.removeEventListener("animationstart", f), t.value.removeEventListener("animationcancel", d), t.value.removeEventListener("animationend", d)), o !== void 0 && s?.clearTimeout(o);
	}), { isPresent: Z(() => ["mounted", "unmountSuspended"].includes(c.value)) };
}
function ID(e) {
	return e && getComputedStyle(e).animationName || "none";
}
// node_modules/reka-ui/dist/Presence/Presence.js
var LD = /*#__PURE__*/ H({
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
		let { present: r, forceMount: i } = /* @__PURE__ */ jn(e), a = /* @__PURE__ */ z(), { isPresent: o } = FD(r, a);
		n({ present: o });
		let s = t.default({ present: o.value });
		s = zE(s || []);
		let c = Xs();
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
		return () => i.value || r.value || o.value ? gc(t.default({ present: o.value })[0], { ref: (e) => {
			let t = AE(e);
			return t?.hasAttribute === void 0 || (t?.hasAttribute("data-reka-popper-content-wrapper") ? a.value = t.firstElementChild : a.value = t), t;
		} }) : null;
	}
}), RD = /*#__PURE__*/ H({
	name: "PrimitiveSlot",
	inheritAttrs: !1,
	setup(e, { attrs: t, slots: n }) {
		return () => {
			if (!n.default) return null;
			let e = zE(n.default()), r = e.findIndex((e) => e.type !== Ss);
			if (r === -1) return e;
			let i = e[r];
			delete i.props?.ref;
			let a = i.props ? Us(t, i.props) : t, o = Ls({
				...i,
				props: {}
			}, a);
			return e.length === 1 ? o : (e[r] = o, e);
		};
	}
}), zD = [
	"area",
	"img",
	"input"
], BD = /*#__PURE__*/ H({
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
		return typeof r == "string" && zD.includes(r) ? () => gc(r, t) : r === "template" ? () => gc(RD, t, { default: n.default }) : () => gc(e.as, t, { default: n.default });
	}
});
// node_modules/reka-ui/dist/Primitive/usePrimitiveElement.js
function VD() {
	let e = /* @__PURE__ */ z();
	return {
		primitiveElement: e,
		currentElement: Z(() => ["#text", "#comment"].includes(e.value?.$el.nodeName) ? e.value?.$el.nextElementSibling : AE(e))
	};
}
// node_modules/reka-ui/dist/DismissableLayer/utils.js
var HD = "dismissableLayer.pointerDownOutside", UD = "dismissableLayer.focusOutside";
function WD(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e.ownerDocument?.defaultView;
	return typeof Element < "u" && e instanceof Element || !!t && e instanceof t.Element;
}
function GD(e, t) {
	if (!WD(t)) return !1;
	if (e.contains(t)) return !0;
	let n = t.closest("[data-dismissable-layer]"), r = e.dataset.dismissableLayer === "" ? e : e.querySelector("[data-dismissable-layer]"), i = Array.from(e.ownerDocument.querySelectorAll("[data-dismissable-layer]"));
	return !!(n && (r === n || i.indexOf(r) < i.indexOf(n)));
}
function KD(e, t, n = !0) {
	let r = /* @__PURE__ */ z(!1), i = /* @__PURE__ */ z(() => {});
	return Lr((a) => {
		if (!mE || !En(n)) return;
		let o = t?.value?.ownerDocument ?? globalThis.document, s = async (n) => {
			let a = n.target;
			if (t?.value && a) {
				if (GD(t.value, a)) o.removeEventListener("click", i.value), r.value = !1;
				else {
					if (n.target && !r.value) {
						let t = { originalEvent: n };
						function r() {
							lE(HD, e, t);
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
function qD(e, t, n = !0) {
	let r = /* @__PURE__ */ z(!1);
	return Lr((i) => {
		if (!mE || !En(n)) return;
		let a = t?.value?.ownerDocument ?? globalThis.document, o = async (n) => {
			if (!t?.value) return;
			await ur(), await ur();
			let i = n.target;
			t.value && i && !GD(t.value, i) && n.target && !r.value && lE(UD, e, { originalEvent: n });
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
var JD = /*#__PURE__*/ ln({
	layersRoot: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), YD = /* @__PURE__ */ H({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = mD(), o = Z(() => a.value?.ownerDocument ?? globalThis.document), s = Z(() => JD.layersRoot), c = Z(() => a.value ? Array.from(s.value).indexOf(a.value) : -1), l = Z(() => JD.layersWithOutsidePointerEventsDisabled.size > 0), u = Z(() => {
			let e = Array.from(s.value), [t] = [...JD.layersWithOutsidePointerEventsDisabled].slice(-1), n = e.indexOf(t);
			return c.value >= n;
		}), d = KD(async (e) => {
			let t = [...JD.branches].some((t) => t?.contains(e.target));
			n.present && u.value && !t && (r("pointerDownOutside", e), r("interactOutside", e), await ur(), e.defaultPrevented || r("dismiss"));
		}, a, () => n.present), f = qD((e) => {
			let t = [...JD.branches].some((t) => t?.contains(e.target));
			n.present && !t && (r("focusOutside", e), r("interactOutside", e), e.defaultPrevented || r("dismiss"));
		}, a);
		return FE("Escape", (e) => {
			n.present && c.value === s.value.size - 1 && (r("escapeKeyDown", e), e.defaultPrevented || r("dismiss"));
		}, { target: () => o.value?.defaultView ?? globalThis.window }), Br([
			a,
			() => n.disableOutsidePointerEvents,
			() => n.present
		], ([e, t, n], r, i) => {
			if (e && n && t) {
				let t = e.ownerDocument;
				KE(t, e), JD.layersWithOutsidePointerEventsDisabled.add(e), i(() => {
					JD.layersWithOutsidePointerEventsDisabled.delete(e), qE(t, e);
				});
			}
		}, { immediate: !0 }), Br([a, () => n.present], ([e, t], n, r) => {
			e && t && (s.value.add(e), r(() => {
				s.value.delete(e);
			}));
		}, { immediate: !0 }), Lr((e) => {
			e(() => {
				a.value && (s.value.delete(a.value), JD.layersWithOutsidePointerEventsDisabled.delete(a.value));
			});
		}), (t, n) => (G(), q(B(BD), {
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
}), XD = pE(() => /* @__PURE__ */ z([]));
function ZD() {
	let e = XD();
	return {
		add(t) {
			let n = e.value[0];
			t !== n && n?.pause(), e.value = QD(e.value, t), e.value.unshift(t);
		},
		remove(t) {
			e.value = QD(e.value, t), e.value[0]?.resume();
		}
	};
}
function QD(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
// node_modules/reka-ui/dist/FocusScope/utils.js
var $D = "focusScope.autoFocusOnMount", eO = "focusScope.autoFocusOnUnmount", tO = {
	bubbles: !1,
	cancelable: !0
};
function nO(e, t) {
	let n = t;
	for (; n;) {
		if (e.contains(n)) return !0;
		n = n.getRootNode().host ?? null;
	}
	return !1;
}
function rO(e, { select: t = !1 } = {}) {
	let n = cE();
	for (let r of e) if (lO(r, { select: t }), cE() !== n) return !0;
}
function iO(e) {
	let t = aO(e);
	return [oO(t, e), oO(t.reverse(), e)];
}
function aO(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t.sort((e, t) => e.tabIndex === t.tabIndex ? 0 : e.tabIndex === 0 ? 1 : t.tabIndex === 0 ? -1 : e.tabIndex - t.tabIndex);
}
function oO(e, t) {
	for (let n of e) if (!sO(n, { upTo: t })) return n;
}
function sO(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function cO(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function lO(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = cE();
		e.focus({ preventScroll: !0 }), e !== n && cO(e) && t && e.select();
	}
}
// node_modules/reka-ui/dist/FocusScope/FocusScope.js
var uO = /* @__PURE__ */ H({
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
		let n = e, r = t, { currentRef: i, currentElement: a } = mD(), o = /* @__PURE__ */ z(null), s = ZD(), c = /*#__PURE__*/ ln({
			paused: !1,
			pause() {
				this.paused = !0;
			},
			resume() {
				this.paused = !1;
			}
		});
		Lr((e) => {
			if (!mE) return;
			let t = a.value;
			if (!n.trapped) return;
			let r = t?.ownerDocument ?? document, i = t ? t.getRootNode() : r;
			function s(e) {
				if (c.paused || !t) return;
				let n = e.target;
				t.contains(n) ? o.value = n : lO(o.value, { select: !0 });
			}
			function l(e) {
				if (c.paused || !t) return;
				let n = e.relatedTarget;
				n !== null && (t.contains(n) || lO(o.value, { select: !0 }));
			}
			function u(e) {
				let n = o.value;
				if (n === null || !e.some((e) => e.removedNodes.length > 0)) return;
				let r = cE();
				r && t.contains(r) || t.contains(n) || lO(t);
			}
			function d(e) {
				if (c.paused || !t) return;
				let n = e.composedPath()[0];
				nO(t, n) || lO(o.value, { select: !0 });
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
			let n = new CustomEvent($D, tO), i = (e) => r("mountAutoFocus", e);
			e.addEventListener($D, i), e.dispatchEvent(n), e.removeEventListener($D, i), n.defaultPrevented || (rO(aO(e), { select: !0 }), cE() === t && lO(e));
		}
		Lr(async (e) => {
			let t = a.value;
			if (await ur(), !t) return;
			n.present !== !1 && s.add(c);
			let i = cE();
			!t.contains(i) && n.present !== !1 && l(t, i), e(() => {
				let e = new CustomEvent(eO, tO), n = (e) => {
					r("unmountAutoFocus", e);
				};
				t.addEventListener(eO, n), t.dispatchEvent(e), t.setAttribute("data-focus-scope-unmounting", ""), setTimeout(() => {
					e.defaultPrevented || lO(i ?? document.body, { select: !0 }), t.removeEventListener(eO, n), s.remove(c), t.removeAttribute("data-focus-scope-unmounting");
				}, 0);
			});
		}), Br(() => n.present, async (e, t) => {
			if (!mE) return;
			if (e === !1 && t === !0) {
				s.remove(c);
				return;
			}
			if (e !== !0 || t !== !1) return;
			s.add(c), await ur();
			let n = a.value;
			if (!n) return;
			let r = cE();
			n.contains(r) || l(n, r);
		});
		function u(e) {
			if (!n.loop && !n.trapped || c.paused) return;
			let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, r = cE();
			if (t && r) {
				let t = e.currentTarget, [i, a] = iO(t);
				i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n.loop && lO(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n.loop && lO(a, { select: !0 })) : r === t && e.preventDefault();
			}
		}
		return (t, n) => (G(), q(B(BD), {
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
}), dO = "menu.itemSelect", fO = ["Enter", " "], pO = [
	"ArrowDown",
	"PageUp",
	"Home"
], mO = [
	"ArrowUp",
	"PageDown",
	"End"
], hO = [...pO, ...mO];
[...fO], [...fO];
function gO(e) {
	return e ? "open" : "closed";
}
function _O(e) {
	let { onEntryFocus: t, onEntryFocusOnce: n, ...r } = e;
	return r;
}
function vO(e) {
	let t = cE();
	for (let n of e) if (n === t || (n.focus(), cE() !== t)) return;
}
function yO(e, t) {
	let { x: n, y: r } = e, i = !1;
	for (let e = 0, a = t.length - 1; e < t.length; a = e++) {
		let o = t[e].x, s = t[e].y, c = t[a].x, l = t[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
function bO(e, t) {
	return t ? yO({
		x: e.clientX,
		y: e.clientY
	}, t) : !1;
}
function xO(e) {
	return e.pointerType === "mouse";
}
// node_modules/reka-ui/dist/Teleport/Teleport.js
var SO = /* @__PURE__ */ H({
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
		let t = e, n = UE({}), r = Z(() => t.to ?? n.teleportTo?.value ?? "body"), i = ME();
		return (t, n) => B(i) || e.forceMount ? (G(), q(ti, {
			key: 0,
			to: r.value,
			disabled: e.disabled,
			defer: e.defer
		}, [U(t.$slots, "default")], 8, [
			"to",
			"disabled",
			"defer"
		])) : X("v-if", !0);
	}
}), CO = "data-reka-collection-item";
function wO(e = {}) {
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
		let n = Array.from(t.querySelectorAll(`[${CO}]`)), r = new Map(n.map((e, t) => [e, t])), a = Array.from(i.itemMap.value.values()).sort((e, t) => (r.get(e.ref) ?? -1) - (r.get(t.ref) ?? -1));
		return e ? a : a.filter((e) => e.ref.dataset.disabled !== "");
	}, s = /*#__PURE__*/ H({
		name: "CollectionSlot",
		inheritAttrs: !1,
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = VD();
			return Br(a, () => {
				i.collectionRef.value = a.value;
			}), () => gc(RD, {
				ref: r,
				...n
			}, t);
		}
	}), c = /*#__PURE__*/ H({
		name: "CollectionItem",
		inheritAttrs: !1,
		props: { value: { validator: () => !0 } },
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = VD();
			return Lr((t) => {
				if (a.value) {
					let n = vn(a.value);
					i.itemMap.value.set(n, {
						ref: a.value,
						value: e.value
					}), t(() => i.itemMap.value.delete(n));
				}
			}), () => gc(RD, {
				...n,
				[CO]: "",
				ref: r
			}, t);
		}
	});
	return {
		getItems: o,
		getItem: a,
		reactiveItems: Z(() => Array.from(i.itemMap.value.values())),
		itemMapSize: Z(() => i.itemMap.value.size),
		CollectionSlot: s,
		CollectionItem: c
	};
}
// node_modules/reka-ui/dist/VisuallyHidden/VisuallyHidden.js
var TO = /* @__PURE__ */ H({
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
		return (t, n) => (G(), q(B(BD), {
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
}), EO = /* @__PURE__ */ H({
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
		let t = e, { primitiveElement: n, currentElement: r } = VD();
		return Br(Z(() => t.checked ?? t.value), (e, t) => {
			if (!r.value) return;
			let n = r.value, i = window.HTMLInputElement.prototype, a = Object.getOwnPropertyDescriptor(i, "value").set;
			if (a && e !== t) {
				let t = new Event("input", { bubbles: !0 }), r = new Event("change", { bubbles: !0 });
				a.call(n, e), n.dispatchEvent(t), n.dispatchEvent(r);
			}
		}), (e, r) => (G(), q(TO, Us({
			ref_key: "primitiveElement",
			ref: n
		}, {
			...t,
			...e.$attrs
		}, { as: "input" }), null, 16));
	}
}), DO = /* @__PURE__ */ H({
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
		let t = e, n = Z(() => typeof t.value == "object" && Array.isArray(t.value) && t.value.length === 0 && t.required), r = Z(() => typeof t.value == "string" || typeof t.value == "number" || typeof t.value == "boolean" || t.value === null || t.value === void 0 ? [{
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
		return (i, a) => (G(), K(W, null, [X(" We render single input if it's required "), n.value ? (G(), q(EO, Us({ key: e.name }, {
			...t,
			...i.$attrs
		}, {
			name: e.name,
			value: e.value
		}), null, 16, ["name", "value"])) : (G(!0), K(W, { key: 1 }, Oa(r.value, (e) => (G(), q(EO, Us({ key: e.name }, { ref_for: !0 }, {
			...t,
			...i.$attrs
		}, {
			name: e.name,
			value: e.value
		}), null, 16, ["name", "value"]))), 128))], 2112));
	}
});
// node_modules/reka-ui/dist/Listbox/utils.js
function OO(e, t, n) {
	return e === void 0 ? !1 : Array.isArray(e) ? e.some((e) => kO(e, t, n)) : kO(e, t, n);
}
function kO(e, t, n) {
	return e === void 0 || t === void 0 ? !1 : typeof e == "string" ? e === t : typeof n == "function" ? n(e, t) : typeof n == "string" ? e?.[n] === t?.[n] : iE(e, t);
}
// node_modules/reka-ui/dist/RovingFocus/utils.js
var AO = "rovingFocusGroup.onEntryFocus", jO = {
	bubbles: !1,
	cancelable: !0
}, MO = {
	ArrowLeft: "prev",
	ArrowUp: "prev",
	ArrowRight: "next",
	ArrowDown: "next",
	PageUp: "first",
	Home: "first",
	PageDown: "last",
	End: "last"
};
function NO(e, t) {
	return t === "rtl" ? e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e : e;
}
function PO(e, t, n) {
	let r = NO(e.key, n);
	if (!(t === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(t === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r))) return MO[r];
}
function FO(e, t = !1) {
	let n = cE();
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), cE() !== n)) return;
}
// node_modules/reka-ui/dist/Listbox/ListboxRoot.js
var [IO, LO] = /*#__PURE__*/ sE("ListboxRoot"), [RO, zO] = /*#__PURE__*/ sE("ListboxHighlightScroll"), BO = /* @__PURE__ */ H({
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
		let r = e, i = n, { multiple: a, highlightOnHover: o, loop: s, orientation: c, disabled: l, selectionBehavior: u, dir: d } = /* @__PURE__ */ jn(r), { getItems: f, getItem: p } = wO({ isProvider: !0 }), { handleTypeaheadSearch: m } = MD(), { primitiveElement: h, currentElement: g } = VD(), _ = kD(), v = sD(d), y = RO(null);
		zO({
			suppressHighlightScroll: /* @__PURE__ */ z(!1),
			onHighlightScrollRequest: () => {}
		});
		let b = pD(g), x = /* @__PURE__ */ z(), S = /* @__PURE__ */ z(!1), C = /* @__PURE__ */ z(!0), w = RE(r, "modelValue", i, {
			defaultValue: r.defaultValue ?? (a.value ? [] : void 0),
			passive: r.modelValue === void 0,
			deep: !0
		});
		function T(e) {
			if (S.value = !0, r.multiple) {
				let t = Array.isArray(w.value) ? [...w.value] : [], n = t.findIndex((t) => kO(t, e, r.by));
				r.selectionBehavior === "toggle" ? (n === -1 ? t.push(e) : t.splice(n, 1), w.value = t) : (w.value = [e], x.value = e);
			} else r.selectionBehavior === "toggle" && kO(w.value, e, r.by) ? w.value = void 0 : w.value = e;
			setTimeout(() => {
				S.value = !1;
			}, 1);
		}
		let E = /* @__PURE__ */ z(null), D = /* @__PURE__ */ z(null), O = /* @__PURE__ */ z(!1), k = /* @__PURE__ */ z(!1), ee = fE(), te = fE(), ne = fE();
		function A() {
			return f().map((e) => e.ref).filter((e) => e.dataset.disabled !== "");
		}
		function j(e, t = !0, n) {
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
		function M(e) {
			if (O.value) ne.trigger(e);
			else {
				let t = f().find((t) => kO(t.value, e, r.by));
				t && (E.value = t.ref, j(t.ref));
			}
		}
		function re(e) {
			if (E.value && E.value.isConnected) {
				if (e.ctrlKey || e.metaKey || e.altKey) return;
				e.preventDefault(), e.stopPropagation(), k.value || E.value.click();
			}
		}
		function N(e) {
			if (C.value) {
				if (S.value = !0, O.value) te.trigger(e);
				else {
					let t = e.altKey || e.ctrlKey || e.metaKey;
					if (t && e.key === "a" && a.value) {
						let t = f(), n = t.map((e) => e.value);
						w.value = [...n], e.preventDefault();
						let r = t.at(-1);
						r && j(r.ref);
					} else if (!t) {
						let t = m(e.key, f());
						t && j(t);
					}
				}
				setTimeout(() => {
					S.value = !1;
				}, 1);
			}
		}
		function ie() {
			k.value = !0;
		}
		function ae() {
			ur(() => {
				k.value = !1;
			});
		}
		function oe() {
			ur(() => {
				ue(new KeyboardEvent("keydown", { key: "PageUp" }));
			});
		}
		function se(e) {
			let t = E.value;
			t?.isConnected && (D.value = t), E.value = null, i("leave", e);
		}
		function ce(e) {
			let t = new CustomEvent("listbox.entryFocus", {
				bubbles: !1,
				cancelable: !0
			});
			if (e.currentTarget?.dispatchEvent(t), i("entryFocus", t), !t.defaultPrevented) {
				if (D.value) j(D.value);
				else {
					let e = A()?.[0];
					j(e);
				}
			}
		}
		function le(e) {
			let t = f(!0).map((e) => e.ref), n = e === "next" ? t.at(-1) : t[0];
			if (!n) return !1;
			let r = Number(n.getAttribute("aria-posinset")), i = Number(n.getAttribute("aria-setsize"));
			return e === "next" ? r === i : r === 1;
		}
		function ue(e) {
			let t = PO(e, c.value, v.value);
			if (!t) return;
			let n = A();
			if (E.value) {
				if (t === "last") n.reverse();
				else if (t === "prev" || t === "next") {
					t === "prev" && n.reverse();
					let r = n.indexOf(E.value), i = s.value && r === n.length - 1;
					if (i && O.value) {
						if (le(t)) {
							let n = t === "next" ? _.HOME : _.END;
							return te.trigger(new KeyboardEvent("keydown", {
								key: n,
								shiftKey: e.shiftKey
							}));
						}
						n = [];
					} else n = i ? n.slice(0, 1) : n.slice(r + 1);
				}
				de(e, n[0]);
			}
			if (n.length) {
				let e = !E.value && t === "prev" ? n.length - 1 : 0;
				j(n[e]);
			}
			if (O.value) return te.trigger(e);
		}
		function de(e, t) {
			if (!O.value && r.selectionBehavior === "replace" && a.value && Array.isArray(w.value) && (!e.altKey && !e.ctrlKey && !e.metaKey || e.shiftKey) && e.shiftKey) {
				let n = f().filter((e) => e.ref.dataset.disabled !== ""), r = n.find((e) => e.ref === t)?.value;
				if (e.key === _.END ? r = n.at(-1)?.value : e.key === _.HOME && (r = n[0]?.value), !r || !x.value) return;
				let i = aE(n.map((e) => e.value), x.value, r);
				w.value = i;
			}
		}
		async function fe(e, t = !0) {
			if (mE) {
				if (await ur(), O.value) ee.trigger({
					event: e,
					scroll: t
				});
				else {
					let e = A(), n = e.find((e) => e.dataset.state === "checked"), r = t ? void 0 : !1;
					n ? j(n, t, r) : e.length && j(e[0], t, r);
				}
			}
		}
		let pe = !1;
		return Br(w, () => {
			if (!S.value) {
				let e = pe;
				pe = !0, ur(() => {
					fe(void 0, e);
				});
			}
		}, {
			immediate: !0,
			deep: !0
		}), t({
			highlightedElement: E,
			highlightItem: M,
			highlightFirstItem: oe,
			highlightSelected: fe,
			getItems: f
		}), LO({
			modelValue: w,
			onValueChange: T,
			multiple: a,
			orientation: c,
			dir: v,
			disabled: l,
			highlightOnHover: o,
			loop: s,
			highlightedElement: E,
			isVirtual: O,
			virtualFocusHook: ee,
			virtualKeydownHook: te,
			virtualHighlightHook: ne,
			by: r.by,
			firstValue: x,
			selectionBehavior: u,
			focusable: C,
			onLeave: se,
			onEnter: ce,
			changeHighlight: j,
			onKeydownEnter: re,
			onKeydownNavigation: ue,
			onKeydownTypeAhead: N,
			onCompositionStart: ie,
			onCompositionEnd: ae,
			highlightFirstItem: oe
		}), (t, n) => (G(), q(B(BD), {
			ref_key: "primitiveElement",
			ref: h,
			as: e.as,
			"as-child": e.asChild,
			dir: B(v),
			"data-disabled": B(l) ? "" : void 0,
			onPointerleave: se,
			onFocusout: n[0] ||= async (e) => {
				let t = e.relatedTarget || e.target;
				await ur(), E.value && B(g) && !B(g).contains(t) && se(e);
			}
		}, {
			default: V(() => [U(t.$slots, "default", { modelValue: B(w) }), B(b) && e.name ? (G(), q(B(DO), {
				key: 0,
				name: e.name,
				value: B(w),
				disabled: B(l),
				required: e.required
			}, null, 8, [
				"name",
				"value",
				"disabled",
				"required"
			])) : X("v-if", !0)]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"dir",
			"data-disabled"
		]));
	}
}), VO = /* @__PURE__ */ H({
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
		let { CollectionSlot: t } = wO(), n = IO(), r = EE(!1, 10);
		return (i, a) => (G(), q(B(t), null, {
			default: V(() => [Y(B(BD), {
				role: "listbox",
				as: e.as,
				"as-child": e.asChild,
				tabindex: B(n).focusable.value ? B(n).highlightedElement.value ? "-1" : "0" : "-1",
				"aria-orientation": B(n).orientation.value,
				"aria-multiselectable": !!B(n).multiple.value,
				"data-orientation": B(n).orientation.value,
				onMousedown: a[0] ||= Eu((e) => r.value = !0, ["left"]),
				onFocus: a[1] ||= (e) => {
					B(r) || B(n).onEnter(e);
				},
				onKeydown: [
					a[2] ||= Ou((e) => {
						(B(n).orientation.value !== "vertical" || e.key !== "ArrowLeft" && e.key !== "ArrowRight") && (B(n).orientation.value !== "horizontal" || e.key !== "ArrowUp" && e.key !== "ArrowDown") && (e.preventDefault(), B(n).focusable.value && B(n).onKeydownNavigation(e));
					}, [
						"down",
						"up",
						"left",
						"right",
						"home",
						"end"
					]),
					Ou(B(n).onKeydownEnter, ["enter"]),
					B(n).onKeydownTypeAhead
				]
			}, {
				default: V(() => [U(i.$slots, "default")]),
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
}), HO = /* @__PURE__ */ H({
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
		let n = e, r = RE(n, "modelValue", t, {
			defaultValue: "",
			passive: n.modelValue === void 0
		}), i = IO(), { primitiveElement: a, currentElement: o } = VD(), s = Z(() => n.disabled || i.disabled.value || !1), c = /* @__PURE__ */ z();
		zr(() => c.value = i.highlightedElement.value?.id), da(() => {
			i.focusable.value = !1, setTimeout(() => {
				n.autoFocus && o.value?.focus();
			}, 1);
		}), ha(() => {
			i.focusable.value = !0;
		});
		let { isComposing: l, shouldDeferInput: u, handleCompositionStart: d, handleCompositionUpdate: f, handleCompositionEnd: p } = oD((e) => {
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
		return (t, n) => (G(), q(B(BD), {
			ref_key: "primitiveElement",
			ref: a,
			as: e.as,
			"as-child": e.asChild,
			value: B(r),
			disabled: s.value ? "" : void 0,
			"data-disabled": s.value ? "" : void 0,
			"aria-disabled": s.value ?? void 0,
			"aria-activedescendant": c.value,
			type: "text",
			onKeydown: [Ou(g, [
				"down",
				"up",
				"home",
				"end"
			]), Ou(_, ["enter"])],
			onInput: h,
			onCompositionstart: m,
			onCompositionupdate: B(f),
			onCompositionend: B(p)
		}, {
			default: V(() => [U(t.$slots, "default", { modelValue: B(r) })]),
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
}), UO = "listbox.select", [WO, GO] = /*#__PURE__*/ sE("ListboxItem"), KO = /* @__PURE__ */ H({
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
		let n = e, r = t, i = OD(void 0, "reka-listbox-item"), { CollectionItem: a } = wO(), { forwardRef: o, currentElement: s } = mD(), c = IO(), l = Z(() => s.value != null && s.value === c.highlightedElement.value), u = Z(() => OO(c.modelValue.value, n.value, c.by)), d = Z(() => c.disabled.value || n.disabled);
		async function f(e) {
			r("select", e), !e?.defaultPrevented && !d.value && e && (c.onValueChange(n.value), c.changeHighlight(s.value));
		}
		function p(e) {
			lE(UO, f, {
				originalEvent: e,
				value: n.value
			});
		}
		return GO({ isSelected: u }), (t, n) => (G(), q(B(a), { value: e.value }, {
			default: V(() => [vc([
				l.value,
				u.value,
				d.value,
				B(c).focusable.value,
				...Object.entries(t.$attrs).flat()
			], () => Y(B(BD), Us({ id: B(i) }, t.$attrs, {
				ref: B(o),
				role: "option",
				tabindex: B(c).focusable.value ? l.value ? "0" : "-1" : -1,
				"aria-selected": u.value,
				as: e.as,
				"as-child": e.asChild,
				disabled: d.value ? "" : void 0,
				"data-disabled": d.value ? "" : void 0,
				"data-highlighted": l.value ? "" : void 0,
				"data-state": u.value ? "checked" : "unchecked",
				onClick: p,
				onKeydown: Ou(Eu(p, ["prevent"]), ["space"]),
				onPointermove: n[0] ||= () => {
					B(c).highlightedElement.value !== B(s) && B(c).highlightOnHover.value && B(c).changeHighlight(B(s), !1, !1);
				}
			}), {
				default: V(() => [U(t.$slots, "default", { selected: u.value })]),
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
}), [qO, JO] = /*#__PURE__*/ sE("PopperRoot"), YO = /* @__PURE__ */ H({
	inheritAttrs: !1,
	__name: "PopperRoot",
	setup(e) {
		let t = /* @__PURE__ */ z();
		return JO({
			anchor: t,
			onAnchorChange: (e) => t.value = e
		}), (e, t) => U(e.$slots, "default");
	}
}), XO = /* @__PURE__ */ H({
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
		let t = e, { forwardRef: n, currentElement: r } = mD(), i = qO();
		return Rr(() => {
			i.onAnchorChange(t.reference ?? r.value);
		}), (t, r) => (G(), q(B(BD), {
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
function ZO(e) {
	return e !== null;
}
function QO(e) {
	return {
		name: "transformOrigin",
		options: e,
		fn(t) {
			let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = $O(n), u = {
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
function $O(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var ek = [
	"top",
	"right",
	"bottom",
	"left"
], tk = Math.min, nk = Math.max, rk = Math.round, ik = Math.floor, ak = (e) => ({
	x: e,
	y: e
}), ok = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function sk(e, t, n) {
	return nk(e, tk(t, n));
}
function ck(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function lk(e) {
	return e.split("-")[0];
}
function uk(e) {
	return e.split("-")[1];
}
function dk(e) {
	return e === "x" ? "y" : "x";
}
function fk(e) {
	return e === "y" ? "height" : "width";
}
function pk(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function mk(e) {
	return dk(pk(e));
}
function hk(e, t, n) {
	n === void 0 && (n = !1);
	let r = uk(e), i = mk(e), a = fk(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = wk(o)), [o, wk(o)];
}
function gk(e) {
	let t = wk(e);
	return [
		_k(e),
		t,
		_k(t)
	];
}
function _k(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var vk = ["left", "right"], yk = ["right", "left"], bk = ["top", "bottom"], xk = ["bottom", "top"];
function Sk(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? yk : vk : t ? vk : yk;
		case "left":
		case "right": return t ? bk : xk;
		default: return [];
	}
}
function Ck(e, t, n, r) {
	let i = uk(e), a = Sk(lk(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(_k)))), a;
}
function wk(e) {
	let t = lk(e);
	return ok[t] + e.slice(t.length);
}
function Tk(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function Ek(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : Tk(e);
}
function Dk(e) {
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
function Ok(e, t, n) {
	let { reference: r, floating: i } = e, a = pk(t), o = mk(t), s = fk(o), c = lk(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = uk(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function kk(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = ck(t, e), p = Ek(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Dk(await i.getClippingRect({
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
	}, y = Dk(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var Ak = 50, jk = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: kk
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = Ok(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < Ak && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = Ok(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Mk = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = ck(e, t) || {};
		if (l == null) return {};
		let d = Ek(u), f = {
			x: n,
			y: r
		}, p = mk(i), m = fk(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		C && await (o.isElement == null ? void 0 : o.isElement(S)) || (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = tk(d[_], T), D = tk(d[v], T), O = C - h[m] - D, k = C / 2 - h[m] / 2 + w, ee = sk(E, k, O), te = !c.arrow && uk(i) != null && k !== ee && a.reference[m] / 2 - (k < E ? E : D) - h[m] / 2 < 0, ne = te ? k < E ? k - E : k - O : 0;
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
}), Nk = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = ck(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = lk(r), _ = pk(o), v = lk(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [wk(o)] : gk(o)), x = p !== "none";
			!d && x && b.push(...Ck(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = hk(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === pk(t) || T.every((e) => pk(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = pk(e.placement);
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
function Pk(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Fk(e) {
	return ek.some((t) => e[t] >= 0);
}
var Ik = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = ck(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Pk(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Fk(e)
					} };
				}
				case "escaped": {
					let e = Pk(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Fk(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Lk = /*#__PURE__*/ new Set(["left", "top"]);
async function Rk(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = lk(n), s = uk(n), c = pk(n) === "y", l = Lk.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = ck(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var zk = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Rk(t, e);
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
}, Bk = function(e) {
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
			} }, ...l } = ck(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = pk(i), p = dk(f), m = u[p], h = u[f], g = (e, t) => sk(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, Vk = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = ck(e, t), u = {
				x: n,
				y: r
			}, d = pk(i), f = dk(d), p = u[f], m = u[d], h = ck(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = Lk.has(lk(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Hk = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = ck(e, t), c = await i.detectOverflow(t, s), l = lk(n), u = uk(n), d = pk(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = tk(p - c[m], g), y = tk(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * nk(c.left, c.right) : S = p - 2 * nk(c.top, c.bottom)), await o({
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
function Uk() {
	return typeof window < "u";
}
function Wk(e) {
	return qk(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Gk(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Kk(e) {
	return ((qk(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function qk(e) {
	return Uk() ? e instanceof Node || e instanceof Gk(e).Node : !1;
}
function Jk(e) {
	return Uk() ? e instanceof Element || e instanceof Gk(e).Element : !1;
}
function Yk(e) {
	return Uk() ? e instanceof HTMLElement || e instanceof Gk(e).HTMLElement : !1;
}
function Xk(e) {
	return !Uk() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Gk(e).ShadowRoot;
}
function Zk(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = cA(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Qk(e) {
	return /^(table|td|th)$/.test(Wk(e));
}
function $k(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var eA = /transform|translate|scale|rotate|perspective|filter/, tA = /paint|layout|strict|content/, nA = (e) => !!e && e !== "none", rA;
function iA(e) {
	let t = Jk(e) ? cA(e) : e;
	return nA(t.transform) || nA(t.translate) || nA(t.scale) || nA(t.rotate) || nA(t.perspective) || !oA() && (nA(t.backdropFilter) || nA(t.filter)) || eA.test(t.willChange || "") || tA.test(t.contain || "");
}
function aA(e) {
	let t = uA(e);
	for (; Yk(t) && !sA(t);) {
		if (iA(t)) return t;
		if ($k(t)) return null;
		t = uA(t);
	}
	return null;
}
function oA() {
	return rA ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), rA;
}
function sA(e) {
	return /^(html|body|#document)$/.test(Wk(e));
}
function cA(e) {
	return Gk(e).getComputedStyle(e);
}
function lA(e) {
	return Jk(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function uA(e) {
	if (Wk(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Xk(e) && e.host || Kk(e);
	return Xk(t) ? t.host : t;
}
function dA(e) {
	let t = uA(e);
	return sA(t) ? (e.ownerDocument || e).body : Yk(t) && Zk(t) ? t : dA(t);
}
function fA(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = dA(e), i = r === e.ownerDocument?.body, a = Gk(r);
	if (i) {
		let e = pA(a);
		return t.concat(a, a.visualViewport || [], Zk(r) ? r : [], e && n ? fA(e) : []);
	}
	return t.concat(r, fA(r, [], n));
}
function pA(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function mA(e) {
	let t = cA(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Yk(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = rk(n) !== a || rk(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function hA(e) {
	return Jk(e) ? e : e.contextElement;
}
function gA(e) {
	let t = hA(e);
	if (!Yk(t)) return ak(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = mA(t), o = (a ? rk(n.width) : n.width) / r, s = (a ? rk(n.height) : n.height) / i;
	return o && Number.isFinite(o) || (o = 1), s && Number.isFinite(s) || (s = 1), {
		x: o,
		y: s
	};
}
var _A = /*#__PURE__*/ ak(0);
function vA(e) {
	let t = Gk(e);
	return !oA() || !t.visualViewport ? _A : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function yA(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === Gk(e);
}
function bA(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = hA(e), o = ak(1);
	t && (r ? Jk(r) && (o = gA(r)) : o = gA(e));
	let s = yA(a, n, r) ? vA(a) : ak(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = Gk(a), t = Jk(r) ? Gk(r) : r, n = e, i = pA(n);
		for (; i && t !== n;) {
			let e = gA(i), t = i.getBoundingClientRect(), r = cA(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Gk(i), i = pA(n);
		}
	}
	return Dk({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function xA(e, t) {
	let n = lA(e).scrollLeft;
	return t ? t.left + n : bA(Kk(e)).left + n;
}
function SA(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - xA(e, n),
		y: n.top + t.scrollTop
	};
}
function CA(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Kk(r), s = t ? $k(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = ak(1), u = ak(0), d = Yk(r);
	if ((d || !a) && ((Wk(r) !== "body" || Zk(o)) && (c = lA(r)), d)) {
		let e = bA(r);
		l = gA(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? SA(o, c) : ak(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function wA(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function TA(e) {
	let t = lA(e), n = e.ownerDocument.body, r = nk(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = nk(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + xA(e), o = -t.scrollTop;
	return cA(n).direction === "rtl" && (a += nk(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var EA = 25;
function DA(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = Gk(e), a = Kk(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !oA() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (xA(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= EA && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function OA(e, t) {
	let n = bA(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = gA(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function kA(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = DA(e, n, t);
	else if (t === "document") r = TA(Kk(e));
	else if (Jk(t)) r = OA(t, n);
	else {
		let n = vA(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Dk(r);
}
function AA(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = fA(e, [], !1).filter((e) => Jk(e) && Wk(e) !== "body"), i = null, a = cA(e).position === "fixed", o = a ? uA(e) : e;
	for (; Jk(o) && !sA(o);) {
		let e = cA(o), t = iA(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = uA(o);
	}
	return t.set(e, r), r;
}
function jA(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? $k(t) ? [] : AA(t, this._c) : [].concat(n), r], o = kA(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = kA(t, a[e], i);
		s = nk(n.top, s), c = tk(n.right, c), l = tk(n.bottom, l), u = nk(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function MA(e) {
	let { width: t, height: n } = mA(e);
	return {
		width: t,
		height: n
	};
}
function NA(e, t, n) {
	let r = Yk(t), i = Kk(t), a = n === "fixed", o = bA(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = ak(0);
	if ((r || !a) && ((Wk(t) !== "body" || Zk(i)) && (s = lA(t)), r)) {
		let e = bA(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = xA(i));
	let l = i && !r && !a ? SA(i, s) : ak(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function PA(e) {
	return cA(e).position === "static";
}
function FA(e, t) {
	if (!Yk(e) || cA(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Kk(e) === n && (n = n.ownerDocument.body), n;
}
function IA(e, t) {
	let n = Gk(e);
	if ($k(e)) return n;
	if (!Yk(e)) {
		let t = uA(e);
		for (; t && !sA(t);) {
			if (Jk(t) && !PA(t)) return t;
			t = uA(t);
		}
		return n;
	}
	let r = FA(e, t);
	for (; r && Qk(r) && PA(r);) r = FA(r, t);
	return r && sA(r) && PA(r) && !iA(r) ? n : r || aA(e) || n;
}
var LA = async function(e) {
	let t = this.getOffsetParent || IA, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: NA(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function RA(e) {
	return cA(e).direction === "rtl";
}
var zA = {
	convertOffsetParentRelativeRectToViewportRelativeRect: CA,
	getDocumentElement: Kk,
	getClippingRect: jA,
	getOffsetParent: IA,
	getElementRects: LA,
	getClientRects: wA,
	getDimensions: MA,
	getScale: gA,
	isElement: Jk,
	isRTL: RA
};
function BA(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function VA(e, t, n) {
	let r = null, i, a = Kk(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = ik(d), h = ik(a.clientWidth - (u + f)), g = ik(a.clientHeight - (d + p)), _ = ik(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: nk(0, tk(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!BA(l, e.getBoundingClientRect())) return s();
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
	let c = Gk(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function HA(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = hA(e), u = i || a ? [...l ? fA(l) : [], ...t ? fA(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? VA(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? bA(e) : null;
	c && g();
	function g() {
		let t = bA(e);
		h && !BA(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var UA = zk, WA = Bk, GA = Nk, KA = Hk, qA = Ik, JA = Mk, YA = Vk, XA = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...zA,
		...i.platform,
		_c: r
	};
	return jk(e, t, {
		...i,
		platform: a
	});
};
// node_modules/@floating-ui/vue/dist/floating-ui.vue.mjs
function ZA(e) {
	return typeof e == "object" && !!e && "$el" in e;
}
function QA(e) {
	if (ZA(e)) {
		let t = e.$el;
		return qk(t) && Wk(t) === "#comment" ? null : t;
	}
	return e;
}
function $A(e) {
	return {
		name: "arrow",
		options: e,
		fn(t) {
			let n = QA(En(e.element));
			return n == null ? {} : JA({
				element: n,
				padding: e.padding
			}).fn(t);
		}
	};
}
function ej(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function tj(e, t) {
	let n = ej(e);
	return Math.round(t * n) / n;
}
function nj(e, t, n) {
	n === void 0 && (n = {});
	let r = n.whileElementsMounted, i = Z(() => En(n.open) ?? !0), a = Z(() => En(n.middleware)), o = Z(() => En(n.placement) ?? "bottom"), s = Z(() => En(n.strategy) ?? "absolute"), c = Z(() => En(n.transform) ?? !0), l = Z(() => QA(e.value)), u = Z(() => QA(t.value)), d = /* @__PURE__ */ z(0), f = /* @__PURE__ */ z(0), p = /* @__PURE__ */ z(s.value), m = /* @__PURE__ */ z(o.value), h = /* @__PURE__ */ Sn({}), g = /* @__PURE__ */ z(!1), _ = Z(() => {
		let e = {
			position: p.value,
			left: "0",
			top: "0"
		};
		if (!u.value) return e;
		let t = tj(u.value, d.value), n = tj(u.value, f.value);
		return c.value ? {
			...e,
			transform: "translate(" + t + "px, " + n + "px)",
			...ej(u.value) >= 1.5 && { willChange: "transform" }
		} : {
			position: p.value,
			left: t + "px",
			top: n + "px"
		};
	}), v;
	function y() {
		if (l.value == null || u.value == null) return;
		let e = i.value;
		XA(l.value, u.value, {
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
var rj = ["dir"], ij = {
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
}, [aj, oj] = /*#__PURE__*/ sE("PopperContent"), sj = /* @__PURE__ */ H({
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
	}, { ...ij }),
	emits: ["placed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = qO(), { forwardRef: a, currentElement: o } = mD(), s = sD(Z(() => n.dir)), c = /* @__PURE__ */ z(), l = /* @__PURE__ */ z(), { width: u, height: d } = AD(l), f = Z(() => n.side + (n.align === "center" ? "" : `-${n.align}`)), p = Z(() => typeof n.collisionPadding == "number" ? n.collisionPadding : {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			...n.collisionPadding
		}), m = Z(() => Array.isArray(n.collisionBoundary) ? n.collisionBoundary : [n.collisionBoundary]), h = Z(() => ({
			padding: p.value,
			boundary: m.value.filter(ZO),
			altBoundary: m.value.length > 0
		})), g = Z(() => ({
			mainAxis: n.sideFlip,
			crossAxis: n.alignFlip
		})), _ = Z(() => [
			UA({
				mainAxis: n.sideOffset + d.value,
				alignmentAxis: n.alignOffset
			}),
			n.prioritizePosition && n.avoidCollisions && GA({
				...h.value,
				...g.value
			}),
			n.avoidCollisions && WA({
				mainAxis: !0,
				crossAxis: !!n.prioritizePosition,
				limiter: n.sticky === "partial" ? YA() : void 0,
				...h.value
			}),
			!n.prioritizePosition && n.avoidCollisions && GA({
				...h.value,
				...g.value
			}),
			KA({
				...h.value,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--reka-popper-available-width", `${n}px`), o.setProperty("--reka-popper-available-height", `${r}px`), o.setProperty("--reka-popper-anchor-width", `${i}px`), o.setProperty("--reka-popper-anchor-height", `${a}px`);
				}
			}),
			l.value && $A({
				element: l.value,
				padding: n.arrowPadding
			}),
			QO({
				arrowWidth: u.value,
				arrowHeight: d.value,
				dir: s.value
			}),
			n.hideWhenDetached && qA({
				strategy: "referenceHidden",
				...h.value
			})
		]), { floatingStyles: v, placement: y, isPositioned: b, middlewareData: x, update: S } = nj(Z(() => n.reference ?? i.anchor.value), c, {
			strategy: n.positionStrategy,
			placement: f,
			whileElementsMounted: (...e) => HA(...e, {
				layoutShift: !n.disableUpdateOnLayoutShift,
				animationFrame: n.updatePositionStrategy === "always"
			}),
			middleware: _
		}), C = Z(() => $O(y.value)[0]), w = Z(() => $O(y.value)[1]);
		Rr(() => {
			b.value && r("placed");
		});
		let T = Z(() => {
			let e = x.value.arrow?.centerOffset !== 0;
			return n.hideShiftedArrow && e;
		}), E = /* @__PURE__ */ z("");
		return Lr(() => {
			o.value && (E.value = window.getComputedStyle(o.value).zIndex);
		}), oj({
			placedSide: C,
			onArrowChange: (e) => l.value = e,
			arrowX: Z(() => x.value.arrow?.x ?? 0),
			arrowY: Z(() => x.value.arrow?.y ?? 0),
			shouldHideArrow: T
		}), (e, t) => (G(), K("div", {
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
		}, [n.memoDependencies ? vc([
			n.asChild,
			n.as,
			C.value,
			w.value,
			B(b),
			...Object.values(e.$attrs),
			...n.memoDependencies
		], () => (G(), q(B(BD), Us({
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
		])), t, 0) : (G(), q(B(BD), Us({
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
		]))], 12, rj));
	}
});
// node_modules/reka-ui/dist/Combobox/useComboboxContentPositioning.js
function cj(e) {
	let t = /* @__PURE__ */ z("inline"), n = /* @__PURE__ */ z(!1), r = /* @__PURE__ */ z(), i = Z(() => t.value === "popper" && !n.value), a;
	zO({
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
var [lj, uj] = /*#__PURE__*/ sE("ComboboxRoot"), dj = /* @__PURE__ */ H({
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
		let r = e, i = n, { primitiveElement: a, currentElement: o } = VD(), { multiple: s, disabled: c, ignoreFilter: l, resetSearchTermOnSelect: u, openOnFocus: d, openOnClick: f, dir: p, resetModelValueOnClear: m, highlightOnHover: h, loop: g, unmountOnHide: _ } = /* @__PURE__ */ jn(r), v = sD(p), y = RE(r, "modelValue", i, {
			defaultValue: r.defaultValue ?? (s.value ? [] : void 0),
			passive: r.modelValue === void 0,
			deep: !0
		}), b = RE(r, "open", i, {
			defaultValue: r.defaultOpen,
			passive: r.open === void 0
		});
		async function x(e) {
			b.value = e, ne.value = "", e ? (await ur(), a.value?.highlightSelected(), C.value = !0, T.value?.focus()) : (C.value = !1, setTimeout(() => {
				!e && r.resetSearchTermOnBlur && S.trigger();
			}, 1));
		}
		let S = fE(), C = /* @__PURE__ */ z(!1), w = /* @__PURE__ */ z(!1), T = /* @__PURE__ */ z(), E = /* @__PURE__ */ z(), D = Z(() => a.value?.highlightedElement ?? void 0), O = cj(b), k = /* @__PURE__ */ z(/* @__PURE__ */ new Map()), ee = /* @__PURE__ */ z(/* @__PURE__ */ new Map()), { contains: te } = lD({ sensitivity: "base" }), ne = /* @__PURE__ */ z(""), A = Z((e) => {
			if (!ne.value || r.ignoreFilter || w.value) return {
				count: k.value.size,
				items: e?.items ?? /* @__PURE__ */ new Map(),
				groups: e?.groups ?? new Set(ee.value.keys())
			};
			let t = 0, n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
			for (let [e, r] of k.value) {
				let i = te(r, ne.value);
				n.set(e, +!!i), i && t++;
			}
			for (let [e, t] of ee.value) for (let r of t) if (n.get(r) > 0) {
				i.add(e);
				break;
			}
			return {
				count: t,
				items: n,
				groups: i
			};
		}), j = Xs();
		return da(() => {
			j?.exposed && (j.exposed.highlightItem = a.value?.highlightItem, j.exposed.highlightFirstItem = a.value?.highlightFirstItem, j.exposed.highlightSelected = a.value?.highlightSelected);
		}), t({
			filtered: A,
			highlightedElement: D,
			highlightItem: a.value?.highlightItem,
			highlightFirstItem: a.value?.highlightFirstItem,
			highlightSelected: a.value?.highlightSelected
		}), uj({
			modelValue: y,
			multiple: s,
			disabled: c,
			open: b,
			onOpenChange: x,
			...O,
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
			allItems: k,
			allGroups: ee,
			filterSearch: ne,
			filterState: A,
			ignoreFilter: l,
			openOnFocus: d,
			openOnClick: f,
			resetModelValueOnClear: m,
			unmountOnHide: _
		}), (t, n) => (G(), q(B(YO), null, {
			default: V(() => [Y(B(BO), Us({
				ref_key: "primitiveElement",
				ref: a
			}, t.$attrs, {
				modelValue: B(y),
				"onUpdate:modelValue": n[0] ||= (e) => /* @__PURE__ */ xn(y) ? y.value = e : null,
				style: { pointerEvents: B(b) ? "auto" : void 0 },
				as: e.as,
				"as-child": e.asChild,
				dir: B(v),
				multiple: B(s),
				name: e.name,
				required: e.required,
				disabled: B(c),
				"highlight-on-hover": B(h),
				loop: B(g),
				by: r.by,
				onHighlight: n[1] ||= (e) => i("highlight", e)
			}), {
				default: V(() => [U(t.$slots, "default", {
					open: B(b),
					modelValue: B(y)
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
}), fj = /* @__PURE__ */ H({
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
		let { forwardRef: t } = mD();
		return (n, r) => (G(), q(B(XO), {
			"as-child": "",
			reference: e.reference
		}, {
			default: V(() => [Y(B(BD), Us({
				ref: B(t),
				"as-child": e.asChild,
				as: e.as
			}, n.$attrs), {
				default: V(() => [U(n.$slots, "default")]),
				_: 3
			}, 16, ["as-child", "as"])]),
			_: 3
		}, 8, ["reference"]));
	}
}), [pj, mj] = /*#__PURE__*/ sE("ComboboxContent"), hj = /* @__PURE__ */ H({
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
		let n = e, r = t, { position: i } = /* @__PURE__ */ jn(n), a = lj(), o = Symbol("ComboboxContent");
		Br(i, (e) => a.onContentPositionChange(o, e), { immediate: !0 });
		let s = Z(() => a.ignoreFilter.value ? a.allItems.value.size === 0 : a.filterState.value.count === 0), { forwardRef: c, currentElement: l } = mD(), u = eD(n.present && n.bodyLock);
		Br([() => n.present, () => n.bodyLock], ([e, t]) => u.value = e && t), dD(), ED(Z(() => n.present ? a.parentElement.value : void 0));
		let d = hD(Z(() => {
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
		mj({ position: i });
		let p = /* @__PURE__ */ z(!1);
		da(() => {
			a.inputElement.value && (p.value = l.value.contains(a.inputElement.value), n.present && p.value && a.inputElement.value.focus());
		}), Br(() => n.present, async (e, t) => {
			if (e || !t) return;
			let n = cE();
			n && l.value.contains(n) && (await ur(), a.triggerElement.value?.focus());
		}), ha(() => {
			a.onContentUnmount(o);
			let e = cE();
			p.value && (!e || e === document.body) && a.triggerElement.value?.focus();
		});
		function m(e) {
			if (a.parentElement.value?.contains(e)) return !0;
			let t = (e instanceof Element ? e.closest("label") : null)?.control;
			return !!t && !!a.parentElement.value?.contains(t);
		}
		let h = { placed: () => a.onContentPlaced(o) };
		return (t, o) => (G(), q(B(VO), { "as-child": "" }, {
			default: V(() => [Y(B(uO), {
				"as-child": "",
				present: n.present,
				onMountAutoFocus: o[5] ||= Eu(() => {}, ["prevent"]),
				onUnmountAutoFocus: o[6] ||= Eu(() => {}, ["prevent"])
			}, {
				default: V(() => [Y(B(YD), {
					"as-child": "",
					present: n.present,
					"disable-outside-pointer-events": e.disableOutsidePointerEvents,
					onDismiss: o[0] ||= (e) => B(a).onOpenChange(!1),
					onFocusOutside: o[1] ||= (e) => {
						m(e.target) && e.preventDefault(), r("focusOutside", e);
					},
					onInteractOutside: o[2] ||= (e) => r("interactOutside", e),
					onEscapeKeyDown: o[3] ||= (e) => r("escapeKeyDown", e),
					onPointerDownOutside: o[4] ||= (e) => {
						m(e.target) && e.preventDefault(), r("pointerDownOutside", e);
					}
				}, {
					default: V(() => [(G(), q(wa(B(i) === "popper" ? B(sj) : B(BD)), Us({
						...t.$attrs,
						...B(d)
					}, {
						id: B(a).contentId,
						ref: B(c),
						"memo-dependencies": B(i) === "popper" ? [B(a).filterSearch.value, B(a).filterState.value] : void 0,
						"data-state": B(a).open.value ? "open" : "closed",
						"data-empty": s.value ? "" : void 0,
						style: {
							display: n.hideWhenEmpty && s.value ? "none" : "flex",
							flexDirection: "column",
							outline: "none",
							...B(i) === "popper" ? f : {}
						}
					}, ja(B(i) === "popper" ? h : {})), {
						default: V(() => [U(t.$slots, "default")]),
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
}), gj = /* @__PURE__ */ H({
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
		let n = gD(e, t), { forwardRef: r } = mD(), i = lj();
		return i.contentId ||= OD(void 0, "reka-combobox-content"), (t, a) => (G(), q(B(LD), {
			present: e.forceMount || B(i).open.value,
			"force-mount": e.forceMount || !B(i).unmountOnHide.value
		}, {
			default: V(({ present: e }) => [Ar(Y(hj, Us({
				...B(n),
				...t.$attrs
			}, {
				ref: B(r),
				present: B(i).unmountOnHide.value || e
			}), {
				default: V(() => [U(t.$slots, "default")]),
				_: 3
			}, 16, ["present"]), [[rl, B(i).unmountOnHide.value || e]])]),
			_: 3
		}, 8, ["present", "force-mount"]));
	}
}), _j = /* @__PURE__ */ H({
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
		let t = e, n = lj(), r = Z(() => n.ignoreFilter.value ? n.allItems.value.size === 0 : n.filterState.value.count === 0);
		return (e, n) => r.value ? (G(), q(B(BD), je(Us({ key: 0 }, t)), {
			default: V(() => [U(e.$slots, "default", {}, () => [n[0] ||= Rs("No options", -1)])]),
			_: 3
		}, 16)) : X("v-if", !0);
	}
}), [vj, yj] = /*#__PURE__*/ sE("ComboboxGroup"), bj = /* @__PURE__ */ H({
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
		let n = e, r = t, i = lj(), a = IO(), { primitiveElement: o, currentElement: s } = VD(), c = RE(n, "modelValue", r, { passive: n.modelValue === void 0 });
		da(() => {
			s.value && i.onInputElementChange(s.value);
		});
		let { isComposing: l, shouldDeferInput: u, handleCompositionStart: d, handleCompositionUpdate: f, handleCompositionEnd: p } = oD((e) => {
			let t = e.target;
			t && h(t.value);
		});
		function m(e) {
			l.value || (e.preventDefault(), i.open.value || i.onOpenChange(!0));
		}
		function h(e) {
			i.open.value ? i.filterSearch.value = e : (i.onOpenChange(!0), ur(() => {
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
			n.displayValue ? c.value = n.displayValue(e) : !i.multiple.value && e && !Array.isArray(e) ? typeof e == "object" ? c.value = "" : c.value = e.toString() : c.value = "", ur(() => {
				c.value = c.value;
			});
		}
		return i.onResetSearchTerm(() => {
			b();
		}), Br(i.modelValue, async () => {
			!i.isUserInputted.value && i.resetSearchTermOnSelect.value && b();
		}, {
			immediate: !0,
			deep: !0
		}), Br(i.filterState, (e, t) => {
			!i.isVirtual.value && t.count === 0 && a.highlightFirstItem();
		}), (t, n) => (G(), q(B(HO), {
			ref_key: "primitiveElement",
			ref: o,
			modelValue: B(c),
			"onUpdate:modelValue": n[0] ||= (e) => /* @__PURE__ */ xn(c) ? c.value = e : null,
			as: e.as,
			"as-child": e.asChild,
			"auto-focus": e.autoFocus,
			disabled: e.disabled,
			"aria-expanded": B(i).open.value,
			"aria-controls": B(i).contentId,
			"aria-autocomplete": "list",
			role: "combobox",
			autocomplete: "off",
			onClick: y,
			onInput: g,
			onKeydown: Ou(m, ["down", "up"]),
			onFocus: _,
			onBlur: v,
			onCompositionstart: B(d),
			onCompositionupdate: B(f),
			onCompositionend: B(p)
		}, {
			default: V(() => [U(t.$slots, "default")]),
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
}), xj = /* @__PURE__ */ H({
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
		let n = e, r = t, i = OD(void 0, "reka-combobox-item"), a = lj(), o = vj(null), { primitiveElement: s, currentElement: c } = VD();
		if (n.value === "") throw Error("A <ComboboxItem /> must have a value prop that is not an empty string. This is because the Combobox value can be set to an empty string to clear the selection and show the placeholder.");
		let l = Z(() => {
			if (a.isVirtual.value || a.ignoreFilter.value || !a.filterSearch.value) return !0;
			{
				let e = a.filterState.value.items.get(i);
				return e === void 0 || e > 0;
			}
		});
		return da(() => {
			a.allItems.value.set(i, n.textValue || c.value.textContent || c.value.innerText);
			let e = o?.id;
			e && (a.allGroups.value.has(e) ? a.allGroups.value.get(e)?.add(i) : a.allGroups.value.set(e, /* @__PURE__ */ new Set([i])));
		}), ha(() => {
			a.allItems.value.delete(i);
		}), (t, o) => l.value ? vc([
			l.value,
			B(a).filterSearch.value,
			B(a).disabled.value,
			e.disabled,
			n.value,
			n.as,
			n.asChild,
			...Object.values(t.$attrs)
		], () => (G(), q(B(KO), Us({ key: 0 }, n, {
			id: B(i),
			ref_key: "primitiveElement",
			ref: s,
			disabled: B(a).disabled.value || e.disabled,
			onSelect: o[0] ||= (t) => {
				r("select", t), !t.defaultPrevented && (!B(a).multiple.value && !e.disabled && !B(a).disabled.value ? (t.preventDefault(), B(a).onOpenChange(!1), B(a).modelValue.value = n.value) : B(a).multiple.value && B(a).inputElement.value?.focus());
			}
		}), {
			default: V((n) => [U(t.$slots, "default", je(Is(n)), () => [Rs(F(e.value), 1)])]),
			_: 3
		}, 16, ["id", "disabled"])), o, 1) : X("v-if", !0);
	}
}), Sj = /* @__PURE__ */ H({
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
		return (e, n) => (G(), q(B(SO), je(Is(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), Cj = /* @__PURE__ */ H({
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
		let t = e, { forwardRef: n, currentElement: r } = mD(), i = lj(), a = Z(() => t.disabled || i.disabled.value || !1);
		return da(() => {
			r.value && i.onTriggerElementChange(r.value);
		}), (r, o) => (G(), q(B(BD), Us(t, {
			ref: B(n),
			type: e.as === "button" ? "button" : void 0,
			tabindex: "-1",
			"aria-label": "Show popup",
			"aria-haspopup": "listbox",
			"aria-expanded": B(i).open.value,
			"aria-controls": B(i).contentId,
			"data-state": B(i).open.value ? "open" : "closed",
			disabled: a.value,
			"data-disabled": a.value ? "" : void 0,
			"aria-disabled": a.value ?? void 0,
			onClick: o[0] ||= (e) => B(i).onOpenChange(!B(i).open.value)
		}), {
			default: V(() => [U(r.$slots, "default")]),
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
function wj(e) {
	let t = UE({ nonce: /* @__PURE__ */ z() });
	return Z(() => e?.value || t.nonce?.value);
}
// node_modules/reka-ui/dist/Combobox/ComboboxViewport.js
var Tj = /* @__PURE__ */ H({
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
		let t = e, { forwardRef: n } = mD(), { nonce: r } = /* @__PURE__ */ jn(t), i = wj(r), a = lj();
		return (e, r) => (G(), K(W, null, [Y(B(BD), Us({
			...e.$attrs,
			...t
		}, {
			ref: B(n),
			"data-reka-combobox-viewport": "",
			role: "presentation",
			style: {
				position: "relative",
				flex: B(a).isVirtual.value ? void 0 : 1,
				overflow: "auto"
			}
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, ["style"]), Y(B(BD), {
			as: "style",
			nonce: B(i)
		}, {
			default: V(() => [...r[0] ||= [Rs(" /* Hide scrollbars cross-browser and enable momentum scroll for touch devices */ [data-reka-combobox-viewport] { scrollbar-width:none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; } [data-reka-combobox-viewport]::-webkit-scrollbar { display: none; } ", -1)]]),
			_: 1
		}, 8, ["nonce"])], 64));
	}
}), [Ej, Dj] = /*#__PURE__*/ sE("RovingFocusGroup"), Oj = /* @__PURE__ */ H({
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
		let r = e, i = n, { loop: a, orientation: o, dir: s } = /* @__PURE__ */ jn(r), c = sD(s), l = RE(r, "currentTabStopId", i, {
			defaultValue: r.defaultCurrentTabStopId,
			passive: r.currentTabStopId === void 0
		}), u = /* @__PURE__ */ z(!1), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ z(0), { getItems: p, CollectionSlot: m } = wO({ isProvider: !0 });
		function h(e) {
			let t = !d.value;
			if (e.currentTarget && e.target === e.currentTarget && t && !u.value) {
				let t = new CustomEvent(AO, jO);
				if (e.currentTarget.dispatchEvent(t), i("entryFocus", t), !t.defaultPrevented) {
					let e = p().map((e) => e.ref).filter((e) => e.dataset.disabled !== "");
					FO([
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
		return t({ getItems: p }), Dj({
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
		}), (t, n) => (G(), q(B(m), null, {
			default: V(() => [Y(B(BD), {
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
}), [kj, Aj] = /*#__PURE__*/ sE("FieldRoot"), jj = /* @__PURE__ */ H({
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
		return (e, n) => (G(), q(B(XO), je(Is(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
});
// node_modules/reka-ui/dist/shared/useIsUsingKeyboard.js
function Mj() {
	let e = /* @__PURE__ */ z(!1);
	return da(() => {
		jE("keydown", () => {
			e.value = !0;
		}, {
			capture: !0,
			passive: !0
		}), jE(["pointerdown", "pointermove"], () => {
			e.value = !1;
		}, {
			capture: !0,
			passive: !0
		});
	}), e;
}
var Nj = SE(Mj), [Pj, Fj] = /*#__PURE__*/ sE(["MenuRoot", "MenuSub"], "MenuContext"), [Ij, Lj] = /*#__PURE__*/ sE("MenuRoot"), Rj = /* @__PURE__ */ H({
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
		let n = e, r = t, { modal: i, dir: a } = /* @__PURE__ */ jn(n), o = sD(a), s = RE(n, "open", r), c = /* @__PURE__ */ z(), l = Nj();
		return Fj({
			open: s,
			onOpenChange: (e) => {
				s.value = e;
			},
			content: c,
			onContentChange: (e) => {
				c.value = e;
			}
		}), Lj({
			onClose: () => {
				s.value = !1;
			},
			isUsingKeyboardRef: l,
			dir: o,
			modal: i
		}), (e, t) => (G(), q(B(YO), null, {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}));
	}
}), [zj, Bj] = /*#__PURE__*/ sE("MenuContent"), Vj = /* @__PURE__ */ H({
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
	}, { ...ij }),
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
		let n = e, r = t, i = Pj(), a = Ij(), { trapFocus: o, disableOutsidePointerEvents: s, loop: c } = /* @__PURE__ */ jn(n);
		dD(), eD(s.value);
		let l = /* @__PURE__ */ z(""), u = /* @__PURE__ */ z(0), d = /* @__PURE__ */ z(0), f = /* @__PURE__ */ z(null), p = /* @__PURE__ */ z("right"), m = /* @__PURE__ */ z(0), h = /* @__PURE__ */ z(null), g = /* @__PURE__ */ z(), { forwardRef: _, currentElement: v } = mD(), { handleTypeaheadSearch: y } = MD(), b = /* @__PURE__ */ z();
		function x(e) {
			let t = VE(e, b.value || cE(), v.value, {
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
			return p.value === f.value?.side && bO(e, f.value?.area);
		}
		async function E(e) {
			r("openAutoFocus", e), !e.defaultPrevented && (e.preventDefault(), v.value?.focus({ preventScroll: !0 }));
		}
		function D(e) {
			if (e.defaultPrevented) return;
			let t = e.target, n = t.closest("[data-reka-menu-content]") === e.currentTarget, r = ["input", "textarea"].includes(t.tagName.toLowerCase()), i = e.ctrlKey || e.altKey || e.metaKey, o = e.key.length === 1, s = VE(e, cE(), v.value, {
				loop: c.value,
				arrowKeyOptions: "vertical",
				dir: a?.dir.value,
				focus: !0,
				attributeName: "[data-reka-collection-item]:not([data-disabled])"
			});
			if (s) return s?.focus();
			if (e.code === "Space") return;
			let l = g.value?.getItems() ?? [];
			if (n && (e.key === "Tab" && a.modal.value && e.preventDefault(), !i && o && !r && y(e.key, l)), e.target !== v.value || !hO.includes(e.key)) return;
			e.preventDefault();
			let u = [...l.map((e) => e.ref)];
			mO.includes(e.key) && u.reverse(), vO(u);
		}
		function O(e) {
			e?.currentTarget?.contains?.(e.target) || (window.clearTimeout(u.value), l.value = "");
		}
		function k(e) {
			if (!xO(e)) return;
			let t = e.target, n = m.value !== e.clientX;
			if ((e?.currentTarget)?.contains(t) && n) {
				let t = e.clientX > m.value ? "right" : "left";
				p.value = t, m.value = e.clientX;
			}
		}
		function ee(e) {
			xO(e) && C.value && C.value.focus();
		}
		return Bj({
			onItemEnter: (e) => !!T(e),
			onItemLeave: (e) => T(e) ? !0 : (["INPUT", "TEXTAREA"].includes(cE()?.tagName || "") || v.value?.focus(), h.value = null, !1),
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
		}), (t, n) => (G(), q(B(uO), {
			"as-child": "",
			trapped: B(o),
			onMountAutoFocus: E,
			onUnmountAutoFocus: n[7] ||= (e) => r("closeAutoFocus", e)
		}, {
			default: V(() => [Y(B(YD), {
				"as-child": "",
				"disable-outside-pointer-events": B(s),
				onEscapeKeyDown: n[2] ||= (e) => r("escapeKeyDown", e),
				onPointerDownOutside: n[3] ||= (e) => r("pointerDownOutside", e),
				onFocusOutside: n[4] ||= (e) => r("focusOutside", e),
				onInteractOutside: n[5] ||= (e) => r("interactOutside", e),
				onDismiss: n[6] ||= (e) => r("dismiss")
			}, {
				default: V(() => [Y(B(Oj), {
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
					default: V(() => [Y(B(sj), {
						ref: B(_),
						role: "menu",
						as: e.as,
						"as-child": e.asChild,
						"aria-orientation": "vertical",
						"data-reka-menu-content": "",
						"data-state": B(gO)(B(i).open.value),
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
}), Hj = /* @__PURE__ */ H({
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
		let t = e, n = zj(), { forwardRef: r, currentElement: i } = mD(), { CollectionItem: a } = wO(), o = /* @__PURE__ */ z(!1), s = Z(() => o.value || i.value != null && n.highlightedElement.value === i.value);
		async function c(e) {
			if (!e.defaultPrevented && xO(e)) {
				if (t.disabled) n.onItemLeave(e);
				else if (!n.onItemEnter(e)) {
					let t = e.currentTarget;
					n.highlightedElement.value = t, ["INPUT", "TEXTAREA"].includes(cE()?.tagName || "") || t.focus({ preventScroll: !0 });
				}
			}
		}
		async function l(e) {
			await ur(), !e.defaultPrevented && xO(e) && n.highlightedElement.value === i.value && !n.onItemLeave(e) && n.highlightedElement.value === i.value && (n.highlightedElement.value = void 0);
		}
		return (t, i) => (G(), q(B(a), { value: { textValue: e.textValue } }, {
			default: V(() => [Y(B(BD), Us({
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
}), Uj = /* @__PURE__ */ H({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = mD(), o = Ij(), s = zj(), c = /* @__PURE__ */ z(!1);
		async function l() {
			let e = a.value;
			if (!n.disabled && e) {
				let e = new CustomEvent(dO, {
					bubbles: !0,
					cancelable: !0
				});
				r("select", e), await ur(), e.defaultPrevented ? c.value = !1 : o.onClose();
			}
		}
		return (t, r) => (G(), q(Hj, Us(n, {
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
				e.disabled || n && t.key === " " || B(fO).includes(t.key) && (t.currentTarget?.click(), t.preventDefault());
			}
		}), {
			default: V(() => [U(t.$slots, "default")]),
			_: 3
		}, 16));
	}
}), Wj = /* @__PURE__ */ H({
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
		let n = e, r = t, i = gD(n, r), a = Pj(), { forwardRef: o, currentElement: s } = mD();
		return ED(s), (e, t) => (G(), q(Vj, Us(B(i), {
			ref: B(o),
			"trap-focus": B(a).open.value,
			"disable-outside-pointer-events": B(a).open.value,
			"disable-outside-scroll": !0,
			onDismiss: t[0] ||= (e) => B(a).onOpenChange(!1),
			onFocusOutside: t[1] ||= Eu((e) => r("focusOutside", e), ["prevent"])
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, ["trap-focus", "disable-outside-pointer-events"]));
	}
}), Gj = /* @__PURE__ */ H({
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
		let n = gD(e, t), r = Pj();
		return (e, t) => (G(), q(Vj, Us(B(n), {
			"trap-focus": !1,
			"disable-outside-pointer-events": !1,
			"disable-outside-scroll": !1,
			onDismiss: t[0] ||= (e) => B(r).onOpenChange(!1)
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), Kj = /* @__PURE__ */ H({
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
		let n = gD(e, t), r = Pj(), i = Ij();
		return (t, a) => (G(), q(B(LD), { present: e.forceMount || B(r).open.value }, {
			default: V(() => [B(i).modal.value ? (G(), q(Wj, je(Us({ key: 0 }, {
				...t.$attrs,
				...B(n)
			})), {
				default: V(() => [U(t.$slots, "default")]),
				_: 3
			}, 16)) : (G(), q(Gj, je(Us({ key: 1 }, {
				...t.$attrs,
				...B(n)
			})), {
				default: V(() => [U(t.$slots, "default")]),
				_: 3
			}, 16))]),
			_: 3
		}, 8, ["present"]));
	}
}), qj = /* @__PURE__ */ H({
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
		return (e, n) => (G(), q(B(SO), je(Is(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), [Jj, Yj] = /*#__PURE__*/ sE("PopoverRoot"), Xj = /* @__PURE__ */ H({
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
		let n = e, r = t, { modal: i } = /* @__PURE__ */ jn(n), a = RE(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		});
		return Yj({
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
			triggerElement: /* @__PURE__ */ z(),
			hasCustomAnchor: /* @__PURE__ */ z(!1)
		}), (e, t) => (G(), q(B(YO), null, {
			default: V(() => [U(e.$slots, "default", {
				open: B(a),
				close: () => a.value = !1
			})]),
			_: 3
		}));
	}
}), Zj = /* @__PURE__ */ H({
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
		let n = e, r = t, i = hD(TE(n, "trapFocus", "disableOutsidePointerEvents")), { forwardRef: a } = mD(), o = Jj();
		return dD(), (t, n) => (G(), q(B(uO), {
			"as-child": "",
			loop: "",
			trapped: e.trapFocus,
			onMountAutoFocus: n[5] ||= (e) => r("openAutoFocus", e),
			onUnmountAutoFocus: n[6] ||= (e) => r("closeAutoFocus", e)
		}, {
			default: V(() => [Y(B(YD), {
				"as-child": "",
				"disable-outside-pointer-events": e.disableOutsidePointerEvents,
				onPointerDownOutside: n[0] ||= (e) => r("pointerDownOutside", e),
				onInteractOutside: n[1] ||= (e) => r("interactOutside", e),
				onEscapeKeyDown: n[2] ||= (e) => r("escapeKeyDown", e),
				onFocusOutside: n[3] ||= (e) => r("focusOutside", e),
				onDismiss: n[4] ||= (e) => B(o).onOpenChange(!1)
			}, {
				default: V(() => [Y(B(sj), Us(B(i), {
					id: B(o).contentId,
					ref: B(a),
					"data-state": B(o).open.value ? "open" : "closed",
					"aria-labelledby": B(o).triggerId,
					style: {
						"--reka-popover-content-transform-origin": "var(--reka-popper-transform-origin)",
						"--reka-popover-content-available-width": "var(--reka-popper-available-width)",
						"--reka-popover-content-available-height": "var(--reka-popper-available-height)",
						"--reka-popover-trigger-width": "var(--reka-popper-anchor-width)",
						"--reka-popover-trigger-height": "var(--reka-popper-anchor-height)"
					},
					role: "dialog"
				}), {
					default: V(() => [U(t.$slots, "default")]),
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
}), Qj = /* @__PURE__ */ H({
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
		let n = e, r = t, i = Jj(), a = /* @__PURE__ */ z(!1);
		eD(!0);
		let o = gD(n, r), { forwardRef: s, currentElement: c } = mD();
		return ED(c), (e, t) => (G(), q(Zj, Us(B(o), {
			ref: B(s),
			"trap-focus": B(i).open.value,
			"disable-outside-pointer-events": "",
			onCloseAutoFocus: t[0] ||= Eu((e) => {
				r("closeAutoFocus", e), a.value || B(i).triggerElement.value?.focus();
			}, ["prevent"]),
			onPointerDownOutside: t[1] ||= (e) => {
				r("pointerDownOutside", e);
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, i = t.button === 2 || n;
				a.value = i;
			},
			onFocusOutside: t[2] ||= Eu(() => {}, ["prevent"])
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, ["trap-focus"]));
	}
}), $j = /* @__PURE__ */ H({
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
		let n = e, r = t, i = Jj(), a = /* @__PURE__ */ z(!1), o = /* @__PURE__ */ z(!1), s = gD(n, r);
		return (e, t) => (G(), q(Zj, Us(B(s), {
			"trap-focus": !1,
			"disable-outside-pointer-events": !1,
			onCloseAutoFocus: t[0] ||= (e) => {
				r("closeAutoFocus", e), e.defaultPrevented || (a.value || B(i).triggerElement.value?.focus(), e.preventDefault()), a.value = !1, o.value = !1;
			},
			onInteractOutside: t[1] ||= async (e) => {
				r("interactOutside", e), e.defaultPrevented || (a.value = !0, e.detail.originalEvent.type === "pointerdown" && (o.value = !0));
				let t = e.target;
				B(i).triggerElement.value?.contains(t) && e.preventDefault(), e.detail.originalEvent.type === "focusin" && o.value && e.preventDefault();
			}
		}), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), eM = /* @__PURE__ */ H({
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
		let n = e, r = t, i = Jj(), a = gD(n, r), { forwardRef: o } = mD();
		return i.contentId ||= OD(void 0, "reka-popover-content"), (t, n) => (G(), q(B(LD), { present: e.forceMount || B(i).open.value }, {
			default: V(() => [B(i).modal.value ? (G(), q(Qj, Us({ key: 0 }, B(a), { ref: B(o) }), {
				default: V(() => [U(t.$slots, "default")]),
				_: 3
			}, 16)) : (G(), q($j, Us({ key: 1 }, B(a), { ref: B(o) }), {
				default: V(() => [U(t.$slots, "default")]),
				_: 3
			}, 16))]),
			_: 3
		}, 8, ["present"]));
	}
}), tM = /* @__PURE__ */ H({
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
		return (e, n) => (G(), q(B(SO), je(Is(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), nM = /* @__PURE__ */ H({
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
		let t = e, n = Jj(), { forwardRef: r, currentElement: i } = mD();
		return n.triggerId ||= OD(void 0, "reka-popover-trigger"), n.contentId ||= OD(void 0, "reka-popover-content"), da(() => {
			n.triggerElement.value = i.value;
		}), (i, a) => (G(), q(wa(B(n).hasCustomAnchor.value ? B(BD) : B(XO)), { "as-child": "" }, {
			default: V(() => [Y(B(BD), {
				id: B(n).triggerId,
				ref: B(r),
				type: e.as === "button" ? "button" : void 0,
				"aria-haspopup": "dialog",
				"aria-expanded": B(n).open.value,
				"aria-controls": B(n).open.value ? B(n).contentId : void 0,
				"data-state": B(n).open.value ? "open" : "closed",
				as: e.as,
				"as-child": t.asChild,
				onClick: B(n).onOpenToggle
			}, {
				default: V(() => [U(i.$slots, "default")]),
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
}), [rM, iM] = /*#__PURE__*/ sE("DropdownMenuRoot"), aM = /* @__PURE__ */ H({
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
		mD();
		let i = RE(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), a = /* @__PURE__ */ z(), { modal: o, dir: s } = /* @__PURE__ */ jn(n), c = sD(s);
		return iM({
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
		}), (e, t) => (G(), q(B(Rj), {
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
}), oM = /* @__PURE__ */ H({
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
		let n = gD(e, t);
		mD();
		let r = rM(), i = /* @__PURE__ */ z(!1);
		function a(e) {
			e.defaultPrevented || (i.value || setTimeout(() => {
				r.triggerElement.value?.focus();
			}, 0), i.value = !1, e.preventDefault());
		}
		return r.contentId ||= OD(void 0, "reka-dropdown-menu-content"), (e, t) => (G(), q(B(Kj), Us({
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
			...B(_O)(e.$attrs)
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
}), sM = /* @__PURE__ */ H({
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
		let n = e, r = cD(t);
		return mD(), (e, t) => (G(), q(B(Uj), je(Is({
			...n,
			...B(r)
		})), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), cM = /* @__PURE__ */ H({
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
		return (e, n) => (G(), q(B(qj), je(Is(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), lM = /* @__PURE__ */ H({
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
		let t = e, n = rM(), { forwardRef: r, currentElement: i } = mD();
		return da(() => {
			n.triggerElement = i;
		}), n.triggerId ||= OD(void 0, "reka-dropdown-menu-trigger"), (i, a) => (G(), q(B(jj), { "as-child": "" }, {
			default: V(() => [Y(B(BD), {
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
				onKeydown: a[1] ||= Ou((t) => {
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
}), uM = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], dM = [" ", "Enter"];
function fM(e, t, n) {
	return e === void 0 ? !1 : Array.isArray(e) ? e.some((e) => pM(e, t, n)) : pM(e, t, n);
}
function pM(e, t, n) {
	return e === void 0 || t === void 0 ? !1 : typeof e == "string" ? e === t : typeof n == "function" ? n(e, t) : typeof n == "string" ? e?.[n] === t?.[n] : iE(e, t);
}
function mM(e) {
	return e == null || e === "" || Array.isArray(e) && e.length === 0;
}
// node_modules/reka-ui/dist/Select/SelectRoot.js
var hM = ["value"], [gM, _M] = /*#__PURE__*/ sE("SelectRoot"), vM = /* @__PURE__ */ H({
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
		let n = e, r = t, { multiple: i, dir: a } = /* @__PURE__ */ jn(n), o = kj(null), s = Z(() => n.name ?? o?.name.value), c = Z(() => o ? n.required || o.required.value : n.required), l = Z(() => !!(n.disabled || o?.disabled.value)), u = RE(n, "modelValue", r, {
			defaultValue: n.defaultValue ?? (i.value ? [] : void 0),
			passive: n.modelValue === void 0,
			deep: !0
		}), d = RE(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), f = /* @__PURE__ */ z(), p = /* @__PURE__ */ z(), m = /* @__PURE__ */ z({
			x: 0,
			y: 0
		}), h = Z(() => i.value && Array.isArray(u.value) ? u.value?.length === 0 : uE(u.value));
		Br(u, () => {
			o?.reportControlState({ filled: !h.value });
		}), wO({ isProvider: !0 });
		let g = sD(a), _ = pD(f), v = /* @__PURE__ */ z(/* @__PURE__ */ new Set()), y = Z(() => Array.from(v.value).map((e) => e.value).join(";"));
		function b(e) {
			let t;
			if (i.value) {
				let r = Array.isArray(u.value) ? [...u.value] : [], i = r.findIndex((t) => pM(t, e, n.by));
				i === -1 ? r.push(e) : r.splice(i, 1), t = [...r];
			} else t = e;
			u.value = t, o?.handleControlInput({ value: t });
		}
		function x(e) {
			return Array.from(v.value).find((t) => fM(e, t.value, n.by));
		}
		return _M({
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
		}), (t, n) => (G(), q(B(YO), null, {
			default: V(() => [U(t.$slots, "default", {
				modelValue: B(u),
				open: B(d)
			}), B(_) && s.value ? (G(), q(yM, {
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
				default: V(() => [B(uE)(B(u)) ? (G(), K("option", {
					key: 0,
					value: e.nullableValue
				}, null, 8, hM)) : X("v-if", !0), (G(!0), K(W, null, Oa(Array.from(v.value), (e) => (G(), K("option", Us({ key: e.value ?? "" }, { ref_for: !0 }, e), null, 16))), 128))]),
				_: 1
			}, 8, [
				"multiple",
				"required",
				"name",
				"autocomplete",
				"disabled",
				"value"
			])) : X("v-if", !0)]),
			_: 3
		}));
	}
}), yM = /* @__PURE__ */ H({
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
		let t = e, n = /* @__PURE__ */ z(), r = gM();
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
		return (e, r) => (G(), q(B(TO), { "as-child": "" }, {
			default: V(() => [J("select", Us({
				ref_key: "selectElement",
				ref: n
			}, t, { onInput: i }), [U(e.$slots, "default")], 16)]),
			_: 3
		}));
	}
}), bM = /* @__PURE__ */ H({
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
		let t = hD(e);
		return (e, n) => (G(), q(B(sj), Us(B(t), { style: {
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
}), xM = {
	onViewportChange: () => {},
	itemTextRefCallback: () => {},
	itemRefCallback: () => {}
}, [SM, CM] = /*#__PURE__*/ sE("SelectContent"), wM = /* @__PURE__ */ H({
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
		let n = e, r = t, i = gM();
		dD(), eD(n.bodyLock);
		let { CollectionSlot: a, getItems: o } = wO(), s = /* @__PURE__ */ z();
		ED(s);
		let { search: c, handleTypeaheadSearch: l } = MD(), u = /* @__PURE__ */ z(), d = /* @__PURE__ */ z(), f = /* @__PURE__ */ z(), p = /* @__PURE__ */ z(!1), m = /* @__PURE__ */ z(!1), h = /* @__PURE__ */ z(!1);
		function g() {
			d.value && s.value && vO([d.value, s.value]);
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
					t = n.loop ? ND(t, i + 1) : t.slice(i + 1);
				}
				setTimeout(() => vO(t)), e.preventDefault();
			}
		}
		let b = TE(n, "loop"), x = hD(Z(() => n.position === "popper" ? b : {}).value);
		return CM({
			content: s,
			viewport: u,
			onViewportChange: (e) => {
				u.value = e;
			},
			itemRefCallback: (e, t, n) => {
				let r = !m.value && !n, a = fM(i.modelValue.value, t, i.by);
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
				(fM(i.modelValue.value, t, i.by) || r) && (f.value = e);
			},
			focusSelectedItem: g,
			position: n.position,
			isPositioned: p,
			searchRef: c
		}), (t, n) => (G(), q(B(a), null, {
			default: V(() => [Y(B(uO), {
				"as-child": "",
				onMountAutoFocus: n[6] ||= Eu(() => {}, ["prevent"]),
				onUnmountAutoFocus: n[7] ||= (e) => {
					r("closeAutoFocus", e), !e.defaultPrevented && (B(i).triggerElement.value?.focus({ preventScroll: !0 }), e.preventDefault());
				}
			}, {
				default: V(() => [Y(B(YD), {
					"as-child": "",
					"disable-outside-pointer-events": e.disableOutsidePointerEvents,
					onFocusOutside: n[2] ||= Eu(() => {}, ["prevent"]),
					onDismiss: n[3] ||= (e) => B(i).onOpenChange(!1),
					onEscapeKeyDown: n[4] ||= (e) => r("escapeKeyDown", e),
					onPointerDownOutside: n[5] ||= (e) => r("pointerDownOutside", e)
				}, {
					default: V(() => [(G(), q(wa(e.position === "popper" ? bM : DM), Us({
						...t.$attrs,
						...B(x)
					}, {
						id: B(i).contentId,
						ref: (e) => {
							if (!e) return;
							let t = B(AE)(e);
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
						onContextmenu: n[0] ||= Eu(() => {}, ["prevent"]),
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
}), [TM, EM] = /*#__PURE__*/ sE("SelectItemAlignedPosition"), DM = /* @__PURE__ */ H({
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
		let n = e, r = t, { getItems: i } = wO(), a = gM(), o = SM(), s = /* @__PURE__ */ z(!1), c = /* @__PURE__ */ z(!0), l = /* @__PURE__ */ z(), { forwardRef: u, currentElement: d } = mD(), { viewport: f, selectedItem: p, selectedItemText: m, focusSelectedItem: h } = o;
		function g() {
			if (a.triggerElement.value && a.valueElement.value && l.value && d.value && f?.value && p?.value && m?.value) {
				let e = a.triggerElement.value.getBoundingClientRect(), t = d.value.getBoundingClientRect(), n = a.valueElement.value.getBoundingClientRect(), o = m.value.getBoundingClientRect();
				if (a.dir.value !== "rtl") {
					let r = o.left - t.left, i = n.left - r, a = e.left - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = oE(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.left = `${d}px`;
				} else {
					let r = t.right - o.right, i = window.innerWidth - n.right - r, a = window.innerWidth - e.right - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = oE(i, 10, Math.max(10, u - c));
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
		return LE(a.triggerElement, () => {
			g();
		}), EM({
			contentWrapper: l,
			shouldExpandOnScrollRef: s,
			onScrollButtonChange: v
		}), (e, t) => (G(), K("div", {
			ref_key: "contentWrapperElement",
			ref: l,
			style: Te({
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: _.value
			})
		}, [Y(B(BD), Us({
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
}), OM = /* @__PURE__ */ H({
	inheritAttrs: !1,
	__name: "SelectProvider",
	props: { context: {
		type: Object,
		required: !0
	} },
	setup(e) {
		return _M(e.context), CM(xM), (e, t) => U(e.$slots, "default");
	}
}), kM = { key: 1 }, AM = /* @__PURE__ */ H({
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
		let n = e, r = gD(n, t), i = gM(), a = /* @__PURE__ */ z();
		da(() => {
			a.value = new DocumentFragment();
		});
		let o = /* @__PURE__ */ z(), s = Z(() => n.forceMount || i.open.value), c = /* @__PURE__ */ z(s.value), l;
		function u() {
			l &&= (clearTimeout(l), void 0);
		}
		return Br(s, (e, t, n) => {
			u(), l = setTimeout(() => {
				c.value = s.value, l = void 0;
			}), n(u);
		}), ha(u), (e, t) => s.value || c.value || o.value?.present ? (G(), q(B(LD), {
			key: 0,
			ref_key: "presenceRef",
			ref: o,
			present: s.value
		}, {
			default: V(() => [Y(wM, je(Is({
				...B(r),
				...e.$attrs
			})), {
				default: V(() => [U(e.$slots, "default")]),
				_: 3
			}, 16)]),
			_: 3
		}, 8, ["present"])) : a.value ? (G(), K("div", kM, [(G(), q(ti, { to: a.value }, [Y(OM, { context: B(i) }, {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 8, ["context"])], 8, ["to"]))])) : X("v-if", !0);
	}
}), [jM, MM] = /*#__PURE__*/ sE("SelectItem"), NM = /* @__PURE__ */ H({
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
		let n = e, r = t, { disabled: i } = /* @__PURE__ */ jn(n), a = gM(), o = SM(), { forwardRef: s, currentElement: c } = mD(), { CollectionItem: l } = wO(), u = Z(() => fM(a.modelValue?.value, n.value, a.by)), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ z(n.textValue ?? ""), p = OD(void 0, "reka-select-item-text");
		async function m(e) {
			e.defaultPrevented || lE("select.select", h, {
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
			await ur(), !e.defaultPrevented && e.currentTarget === cE() && o.onItemLeave?.();
		}
		async function v(e) {
			await ur(), e.defaultPrevented || o.searchRef?.value !== "" && e.key === " " || (dM.includes(e.key) && m(e), e.key === " " && e.preventDefault());
		}
		if (n.value === "") throw Error("A <SelectItem /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
		return da(() => {
			c.value && o.itemRefCallback(c.value, n.value, n.disabled);
		}), MM({
			value: n.value,
			disabled: i,
			textId: p,
			isSelected: u,
			onItemTextChange: (e) => {
				f.value = ((f.value || e?.textContent) ?? "").trim();
			}
		}), (t, n) => (G(), q(B(l), { value: { textValue: f.value } }, {
			default: V(() => [Y(B(BD), {
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
				onTouchend: n[3] ||= Eu(() => {}, ["prevent", "stop"]),
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
}), PM = /* @__PURE__ */ H({
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
		let t = e, n = gM(), r = SM(), i = jM(), { forwardRef: a, currentElement: o } = mD(), s = Z(() => ({
			value: i.value,
			disabled: i.disabled.value,
			textContent: o.value?.textContent ?? i.value?.toString() ?? ""
		}));
		return da(() => {
			o.value && (i.onItemTextChange(o.value), r.itemTextRefCallback(o.value, i.value, i.disabled.value), n.onOptionAdd(s.value));
		}), ha(() => {
			n.onOptionRemove(s.value);
		}), (e, n) => (G(), q(B(BD), Us({
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
}), FM = /* @__PURE__ */ H({
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
		return (e, n) => (G(), q(B(SO), je(Is(t)), {
			default: V(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), IM = /* @__PURE__ */ H({
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
		let t = e, n = gM(), { forwardRef: r, currentElement: i } = mD(), a = Z(() => n.disabled?.value || t.disabled);
		n.contentId ||= OD(void 0, "reka-select-content"), da(() => {
			n.onTriggerChange(i.value);
		});
		let o = kj(null), s = Ga();
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
		let { getItems: p } = wO(), { search: m, handleTypeaheadSearch: h, resetTypeahead: g } = MD();
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
			!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && h(e.key, p()), !(t && e.key === " ") && uM.includes(e.key) && (_(), e.preventDefault());
		}
		return (t, i) => (G(), q(B(XO), {
			"as-child": "",
			reference: e.reference
		}, {
			default: V(() => [Y(B(BD), Us(l(), {
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
				"data-placeholder": B(mM)(B(n).modelValue?.value) ? "" : void 0,
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
}), LM = /* @__PURE__ */ H({
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
		let t = e, { forwardRef: n, currentElement: r } = mD(), i = gM();
		da(() => {
			i.valueElement = r;
		});
		let a = Z(() => {
			let e = [], t = Array.from(i.optionsSet.value), n = (e) => t.find((t) => fM(e, t.value, i.by));
			return e = Array.isArray(i.modelValue.value) ? i.modelValue.value.map((e) => n(e)?.textContent ?? "") : [n(i.modelValue.value)?.textContent ?? ""], e.filter(Boolean);
		}), o = Z(() => a.value.length ? a.value.join(", ") : t.placeholder);
		return (r, s) => (G(), q(B(BD), {
			ref: B(n),
			as: e.as,
			"as-child": e.asChild,
			style: { pointerEvents: "none" },
			"data-placeholder": a.value.length ? void 0 : t.placeholder
		}, {
			default: V(() => [U(r.$slots, "default", {
				selectedLabel: a.value,
				modelValue: B(i).modelValue.value
			}, () => [Rs(F(o.value), 1)])]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"data-placeholder"
		]));
	}
}), RM = /* @__PURE__ */ H({
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
		let t = e, { nonce: n } = /* @__PURE__ */ jn(t), r = wj(n), i = SM(), a = i.position === "item-aligned" ? TM() : void 0, { forwardRef: o, currentElement: s } = mD();
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
		return (e, n) => (G(), K(W, null, [Y(B(BD), Us({
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
		}, 16), Y(B(BD), {
			as: "style",
			nonce: B(r)
		}, {
			default: V(() => [...n[0] ||= [Rs(" /* Hide scrollbars cross-browser and enable momentum scroll for touch devices */ [data-reka-select-viewport] { scrollbar-width:none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; } [data-reka-select-viewport]::-webkit-scrollbar { display: none; } ", -1)]]),
			_: 1
		}, 8, ["nonce"])], 64));
	}
}), zM = ["maxlength"], BM = { class: "trpg-confirm__actions" }, VM = ["disabled"], HM = /* @__PURE__ */ H({
	__name: "BranchPopover",
	props: {
		defaultName: {},
		disabled: { type: Boolean }
	},
	emits: ["create"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = Nr("portalTarget", void 0), a = /* @__PURE__ */ z(!1), o = /* @__PURE__ */ z(""), s = /* @__PURE__ */ z(null);
		async function c(e) {
			a.value = e, e && (o.value = n.defaultName, await ur(), s.value?.focus(), s.value?.select());
		}
		function l() {
			let e = o.value.trim();
			e && (a.value = !1, r("create", e));
		}
		return (t, n) => (G(), q(B(Xj), {
			open: a.value,
			"onUpdate:open": c
		}, {
			default: V(() => [Y(B(nM), {
				class: "trpg-btn",
				disabled: e.disabled
			}, {
				default: V(() => [...n[4] ||= [Rs("分支存档", -1)]]),
				_: 1
			}, 8, ["disabled"]), Y(B(tM), { to: B(i) }, {
				default: V(() => [Y(B(eM), {
					class: "trpg-popover",
					align: "start",
					"side-offset": 6,
					"collision-padding": 8,
					onOpenAutoFocus: n[3] ||= Eu(() => {}, ["prevent"])
				}, {
					default: V(() => [J("form", {
						class: "trpg-field",
						onSubmit: Eu(l, ["prevent"])
					}, [
						n[5] ||= J("label", {
							class: "trpg-field__label",
							for: "trpg-branch-name"
						}, "新存档名", -1),
						Ar(J("input", {
							id: "trpg-branch-name",
							ref_key: "input",
							ref: s,
							"onUpdate:modelValue": n[0] ||= (e) => o.value = e,
							class: "trpg-input",
							maxlength: B(40),
							autocomplete: "off",
							onKeydown: n[1] ||= Ou(Eu((e) => a.value = !1, ["stop", "prevent"]), ["esc"])
						}, null, 40, zM), [[du, o.value]]),
						n[6] ||= J("span", { class: "trpg-field__hint" }, "原存档保持上次保存的样子；当前未保存的改动会进入新分支。", -1),
						J("div", BM, [J("button", {
							class: "trpg-btn",
							type: "button",
							onClick: n[2] ||= (e) => a.value = !1
						}, "取消"), J("button", {
							class: "trpg-btn trpg-btn--primary",
							type: "submit",
							disabled: !o.value.trim()
						}, "创建并切换", 8, VM)])
					], 32)]),
					_: 1
				})]),
				_: 1
			}, 8, ["to"])]),
			_: 1
		}, 8, ["open"]));
	}
}), UM = {
	key: 0,
	class: "trpg-menu__reason"
}, WM = /* @__PURE__ */ H({
	__name: "MoreMenu",
	props: {
		label: {},
		items: {}
	},
	emits: ["select"],
	setup(e) {
		let t = Nr("portalTarget", void 0);
		return (n, r) => (G(), q(B(aM), null, {
			default: V(() => [Y(B(lM), {
				class: "trpg-icon-btn trpg-more",
				"aria-label": `${e.label} 的更多操作`
			}, {
				default: V(() => [Y(wS, {
					name: "dots-three",
					size: 20
				})]),
				_: 1
			}, 8, ["aria-label"]), Y(B(cM), { to: B(t) }, {
				default: V(() => [Y(B(oM), {
					class: "trpg-menu",
					align: "end",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: V(() => [(G(!0), K(W, null, Oa(e.items, (e) => (G(), q(B(sM), {
						key: e.key,
						class: Ae(["trpg-menu__item", { "trpg-menu__item--danger": e.danger }]),
						disabled: e.disabled,
						onSelect: (t) => n.$emit("select", e.key)
					}, {
						default: V(() => [J("span", null, F(e.label), 1), e.disabled && e.reason ? (G(), K("span", UM, F(e.reason), 1)) : X("", !0)]),
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
}), GM = {
	key: 0,
	class: "trpg-folds"
}, KM = {
	class: "trpg-folds__tabs",
	role: "group",
	"aria-label": "更多存档"
}, qM = ["aria-expanded"], JM = ["aria-expanded"], YM = ["aria-expanded"], XM = {
	key: 0,
	class: "trpg-list"
}, ZM = { class: "trpg-row__main" }, QM = { class: "trpg-row__title" }, $M = {
	key: 0,
	class: "trpg-row__meta"
}, eN = { class: "trpg-row__end" }, tN = ["disabled", "onClick"], nN = { class: "trpg-list" }, rN = { class: "trpg-row__main" }, iN = { class: "trpg-row__title" }, aN = { class: "trpg-row__meta" }, oN = { class: "trpg-row__end" }, sN = ["disabled", "onClick"], cN = ["disabled", "onClick"], lN = ["disabled"], uN = {
	key: 2,
	class: "trpg-list"
}, dN = { class: "trpg-row__main" }, fN = { class: "trpg-row__title" }, pN = { class: "trpg-badge" }, mN = { class: "trpg-row__meta" }, hN = { class: "trpg-row__end" }, gN = [
	"disabled",
	"title",
	"onClick"
], _N = /* @__PURE__ */ H({
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
		let n = t, r = /* @__PURE__ */ z(null), i = (e) => r.value = r.value === e ? null : e;
		return (t, a) => e.autos.length || e.deleted.length || e.others.length ? (G(), K("div", GM, [
			J("div", KM, [
				e.autos.length ? (G(), K("button", {
					key: 0,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "auto",
					onClick: a[0] ||= (e) => i("auto")
				}, F(r.value === "auto" ? "▾" : "▸") + " 自动存档 " + F(e.autos.length), 9, qM)) : X("", !0),
				e.deleted.length ? (G(), K("button", {
					key: 1,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "deleted",
					onClick: a[1] ||= (e) => i("deleted")
				}, F(r.value === "deleted" ? "▾" : "▸") + " 最近删除 " + F(e.deleted.length), 9, JM)) : X("", !0),
				e.others.length ? (G(), K("button", {
					key: 2,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "other",
					onClick: a[2] ||= (e) => i("other")
				}, F(r.value === "other" ? "▾" : "▸") + " 其他规则 " + F(e.others.length), 9, YM)) : X("", !0)
			]),
			r.value === "auto" ? (G(), K("ul", XM, [(G(!0), K(W, null, Oa(e.autos, (t) => (G(), K("li", {
				key: t.id,
				class: "trpg-row"
			}, [J("div", ZM, [J("div", QM, F(B(wC)(t.createdAt)) + " · " + F(t.autoReason), 1), B(DC)(t) ? (G(), K("div", $M, F(B(DC)(t)), 1)) : X("", !0)]), J("div", eN, [J("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("load", t)
			}, "读取", 8, tN), Y(WM, {
				label: `自动存档 ${B(wC)(t.createdAt)}`,
				items: [{
					key: "manual",
					label: "另存为存档"
				}],
				onSelect: (e) => n("auto-as-manual", t)
			}, null, 8, ["label", "onSelect"])])]))), 128))])) : X("", !0),
			r.value === "deleted" ? (G(), K(W, { key: 1 }, [J("ul", nN, [(G(!0), K(W, null, Oa(e.deleted, (t) => (G(), K("li", {
				key: t.id,
				class: "trpg-row"
			}, [J("div", rN, [J("div", iN, F(t.name), 1), J("div", aN, "删除于 " + F(B(wC)(t.deletedAt ?? 0)), 1)]), J("div", oN, [J("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("restore", t)
			}, "恢复", 8, sN), J("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("purge", t)
			}, "彻底删除", 8, cN)])]))), 128))]), J("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				disabled: e.readOnly,
				onClick: a[3] ||= (e) => n("purge-all")
			}, "清空最近删除", 8, lN)], 64)) : X("", !0),
			r.value === "other" ? (G(), K("ul", uN, [(G(!0), K(W, null, Oa(e.others, (t) => (G(), K("li", {
				key: t.id,
				class: "trpg-row"
			}, [J("div", dN, [J("div", fN, [Rs(F(t.name) + " ", 1), J("span", pN, F(e.ruleName(t.ruleId)), 1)]), J("div", mN, F(t.ownerLabel) + " · " + F(B(wC)(t.updatedAt)), 1)]), J("div", hN, [J("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly || !e.ruleInstalled(t.ruleId),
				title: e.ruleInstalled(t.ruleId) ? void 0 : "规则未安装",
				onClick: (e) => n("load", t)
			}, F(e.ruleInstalled(t.ruleId) ? "切换规则并读取" : "规则未安装"), 9, gN)])]))), 128))])) : X("", !0)
		])) : X("", !0);
	}
}), vN = ["data-current", "data-testid"], yN = { class: "trpg-save__main" }, bN = { class: "trpg-save__top" }, xN = ["maxlength", "onKeydown"], SN = {
	key: 1,
	class: "trpg-save__name"
}, CN = {
	key: 2,
	class: "trpg-badge",
	"data-tone": "gold"
}, wN = {
	key: 3,
	class: "trpg-badge"
}, TN = { class: "trpg-save__time" }, EN = {
	key: 0,
	class: "trpg-row__meta"
}, DN = {
	key: 1,
	class: "trpg-row__meta trpg-save__note"
}, ON = {
	key: 2,
	class: "trpg-save__noteedit"
}, kN = ["maxlength"], AN = { class: "trpg-save__noteactions" }, jN = { class: "trpg-row__end" }, MN = ["disabled"], NN = /* @__PURE__ */ H({
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
		let n = e, r = t, i = /* @__PURE__ */ z(!1), a = /* @__PURE__ */ z(""), o = /* @__PURE__ */ z(!1), s = /* @__PURE__ */ z(""), c = /* @__PURE__ */ z(null), l = () => [
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
			e === "rename" ? (a.value = n.save.name, i.value = !0, await ur(), c.value?.focus(), c.value?.select()) : e === "note" ? (s.value = n.save.note, o.value = !0) : e === "export" ? r("export") : e === "remove" && r("remove");
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
		return (t, n) => (G(), K("li", {
			class: "trpg-save",
			"data-current": e.current,
			"data-testid": `save-${e.save.name}`
		}, [J("div", yN, [
			J("div", bN, [
				i.value ? Ar((G(), K("input", {
					key: 0,
					ref_key: "nameInput",
					ref: c,
					"onUpdate:modelValue": n[0] ||= (e) => a.value = e,
					class: "trpg-input trpg-save__rename",
					maxlength: B(40),
					"aria-label": "存档名",
					onKeydown: [Ou(Eu(d, ["prevent"]), ["enter"]), n[1] ||= Ou(Eu((e) => i.value = !1, ["stop", "prevent"]), ["esc"])],
					onBlur: d
				}, null, 40, xN)), [[du, a.value]]) : (G(), K("span", SN, F(e.save.name), 1)),
				e.current ? (G(), K("span", CN, "当前")) : X("", !0),
				e.cardBadge ? (G(), K("span", wN, F(e.save.ownerLabel), 1)) : X("", !0),
				J("span", TN, F(B(wC)(e.save.updatedAt)), 1)
			]),
			B(DC)(e.save) ? (G(), K("div", EN, F(B(DC)(e.save)), 1)) : X("", !0),
			e.save.note && !o.value ? (G(), K("div", DN, F(e.save.note.split("\n")[0]), 1)) : X("", !0),
			o.value ? (G(), K("div", ON, [Ar(J("textarea", {
				"onUpdate:modelValue": n[2] ||= (e) => s.value = e,
				class: "trpg-input",
				maxlength: B(200),
				"aria-label": "备注",
				rows: "2",
				onKeydown: n[3] ||= Ou(Eu((e) => o.value = !1, ["stop", "prevent"]), ["esc"])
			}, null, 40, kN), [[du, s.value]]), J("div", AN, [J("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: n[4] ||= (e) => o.value = !1
			}, "取消"), J("button", {
				class: "trpg-btn trpg-btn--small trpg-btn--primary",
				type: "button",
				onClick: f
			}, "保存")])])) : X("", !0)
		]), J("div", jN, [e.current ? X("", !0) : (G(), K("button", {
			key: 0,
			class: "trpg-btn",
			type: "button",
			disabled: e.readOnly,
			onClick: n[5] ||= (e) => r("load")
		}, "读取", 8, MN)), Y(WM, {
			label: e.save.name,
			items: l(),
			onSelect: u
		}, null, 8, ["label", "items"])])], 8, vN));
	}
}), PN = ["data-dragging"], FN = {
	key: 0,
	class: "trpg-drawer__current"
}, IN = { class: "trpg-drawer__name" }, LN = { class: "trpg-drawer__title" }, RN = {
	key: 0,
	class: "trpg-badge",
	"data-tone": "warn"
}, zN = { class: "trpg-drawer__buttons" }, BN = ["disabled"], VN = {
	key: 1,
	class: "trpg-drawer__current"
}, HN = { class: "trpg-drawer__filter" }, UN = {
	key: 1,
	class: "trpg-field__hint"
}, WN = {
	key: 0,
	class: "trpg-saves"
}, GN = {
	key: 1,
	class: "trpg-empty"
}, KN = { class: "trpg-group" }, qN = { class: "trpg-saves" }, JN = { class: "trpg-drawer__bottom" }, YN = ["disabled"], XN = ["disabled"], ZN = /* @__PURE__ */ H({
	__name: "SaveDrawerPage",
	setup(e) {
		let t = Dx(), n = kx(), r = kC(), i = cS(), a = /* @__PURE__ */ z(""), o = /* @__PURE__ */ z(null), s = /* @__PURE__ */ z(!1);
		da(() => void r.refresh().catch((e) => console.error("[trpg-assistant] 读取存档列表失败", e)));
		let c = Z(() => n.currentSave), l = Z(() => t.services?.rules), u = (e) => l.value?.get(e)?.nameShort ?? e, d = (e) => !!l.value?.has(e), f = Z(() => {
			let e = a.value.trim();
			return e ? r.manual.filter((t) => t.name.includes(e) || t.note.includes(e)) : r.manual;
		}), p = Z(() => {
			let e = /* @__PURE__ */ new Map();
			for (let t of r.everything) e.set(t.ruleId, [...e.get(t.ruleId) ?? [], t]);
			return [...e];
		});
		async function m(e, t) {
			try {
				return await e();
			} catch (e) {
				console.error(`[trpg-assistant] ${t}`, e), i.error(`${t}：${OC(e)}`);
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
			await zC({
				title: "彻底删除存档",
				message: `「${t}」将被永久删除，无法恢复。`,
				confirmLabel: "彻底删除",
				danger: !0
			}) && await m(() => r.purge([e]), "删除失败");
		}
		async function v() {
			let e = r.deleted.length;
			await zC({
				title: "清空最近删除",
				message: `最近删除中的 ${e} 个存档将被永久删除，无法恢复。`,
				confirmLabel: "彻底删除",
				danger: !0
			}) && await m(() => r.purge(r.deleted.map((e) => e.id)), "清空失败");
		}
		async function y(e) {
			s.value = !1;
			let t = e.dataTransfer?.files?.[0];
			t && !n.readOnly && await QT(t);
		}
		async function b(e) {
			let t = e.target, n = t.files?.[0];
			t.value = "", n && await QT(n);
		}
		return (e, i) => (G(), K("div", {
			class: "trpg-drawer",
			"data-testid": "save-drawer",
			"data-dragging": s.value,
			onDragover: i[11] ||= Eu((e) => s.value = !0, ["prevent"]),
			onDragleave: i[12] ||= Eu((e) => s.value = !1, ["self"]),
			onDrop: Eu(y, ["prevent"])
		}, [
			B(n).hasCampaign ? (G(), K("section", FN, [
				J("div", IN, [J("span", LN, F(c.value?.name ?? "当前存档"), 1), B(n).dirty ? (G(), K("span", RN, "● 有未保存到存档的改动")) : X("", !0)]),
				J("div", zN, [
					J("button", {
						class: "trpg-btn trpg-btn--primary",
						type: "button",
						disabled: B(n).readOnly || !B(n).dirty,
						onClick: i[0] ||= (e) => B(RP)()
					}, F(B(n).dirty ? "保存存档" : "已是最新"), 9, BN),
					Y(HM, {
						"default-name": `${c.value?.name ?? "存档"} 分支`,
						disabled: B(n).readOnly,
						onCreate: h
					}, null, 8, ["default-name", "disabled"]),
					c.value ? (G(), K("button", {
						key: 0,
						class: "trpg-btn",
						type: "button",
						onClick: i[1] ||= (e) => B(ZT)(c.value.id)
					}, "导出…")) : X("", !0)
				]),
				B(t).reminder ? (G(), K("p", {
					key: 0,
					class: Ae(["trpg-field__hint", { "trpg-warn": B(t).reminder.kind === "due" }])
				}, F(B(t).reminder.text), 3)) : X("", !0)
			])) : (G(), K("section", VN, [...i[13] ||= [J("p", { class: "page-intro" }, "还没有当前战役", -1)]])),
			B(n).hasCampaign ? (G(), K(W, { key: 2 }, [
				J("div", HN, [
					Y(HC, {
						"model-value": B(r).scope,
						label: "存档范围",
						options: [{
							value: "card",
							label: "本卡"
						}, {
							value: "all",
							label: "全部"
						}],
						"onUpdate:modelValue": i[2] ||= (e) => B(r).setScope(e)
					}, null, 8, ["model-value"]),
					B(r).manual.length > 8 ? Ar((G(), K("input", {
						key: 0,
						"onUpdate:modelValue": i[3] ||= (e) => a.value = e,
						class: "trpg-input",
						type: "search",
						placeholder: "按存档名或备注搜索",
						"aria-label": "搜索存档"
					}, null, 512)), [[du, a.value]]) : X("", !0),
					B(r).manual.length > 8 ? (G(), K("span", UN, "共 " + F(f.value.length) + " 个", 1)) : X("", !0)
				]),
				f.value.length ? (G(), K("ul", WN, [(G(!0), K(W, null, Oa(f.value, (e) => (G(), q(NN, {
					key: e.id,
					save: e,
					current: e.id === c.value?.id,
					"card-badge": B(r).scope === "all",
					"read-only": B(n).readOnly,
					onLoad: (t) => B(zP)(e),
					onRename: (t) => m(() => B(r).rename(e.id, t), "改名失败"),
					onNote: (t) => m(() => B(r).setNote(e.id, t), "保存备注失败"),
					onExport: (t) => B(ZT)(e.id),
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
				]))), 128))])) : B(r).loading ? X("", !0) : (G(), K("div", GN, [J("p", null, F(a.value ? "没有符合的存档" : "这张卡还没有存档"), 1), a.value ? (G(), K("button", {
					key: 0,
					class: "trpg-btn",
					type: "button",
					onClick: i[4] ||= (e) => a.value = ""
				}, "清除搜索")) : (G(), K("button", {
					key: 1,
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: i[5] ||= (e) => B(LP)()
				}, "＋ 新存档"))])),
				Y(_N, {
					autos: B(r).autos,
					deleted: B(r).deleted,
					others: B(r).otherRules,
					"read-only": B(n).readOnly,
					"rule-name": u,
					"rule-installed": d,
					onLoad: B(zP),
					onAutoAsManual: i[6] ||= (e) => m(() => B(r).autoAsManual(e.id), "另存失败"),
					onRestore: i[7] ||= (e) => m(() => B(r).restore(e.id), "恢复失败"),
					onPurge: i[8] ||= (e) => _(e.id, e.name),
					onPurgeAll: v
				}, null, 8, [
					"autos",
					"deleted",
					"others",
					"read-only",
					"onLoad"
				])
			], 64)) : (G(!0), K(W, { key: 3 }, Oa(p.value, ([e, t]) => (G(), K("div", {
				key: e,
				class: "trpg-group-block"
			}, [J("h3", KN, F(u(e)) + "（" + F(t.length) + "）", 1), J("ul", qN, [(G(!0), K(W, null, Oa(t, (e) => (G(), q(NN, {
				key: e.id,
				save: e,
				"card-badge": "",
				onLoad: (t) => B(zP)(e),
				onRename: (t) => m(() => B(r).rename(e.id, t), "改名失败"),
				onNote: (t) => m(() => B(r).setNote(e.id, t), "保存备注失败"),
				onExport: (t) => B(ZT)(e.id),
				onRemove: (t) => g(e.id, e.name)
			}, null, 8, [
				"save",
				"onLoad",
				"onRename",
				"onNote",
				"onExport",
				"onRemove"
			]))), 128))])]))), 128)),
			J("footer", JN, [
				B(n).hasCampaign && B(r).manual.length ? (G(), K("button", {
					key: 0,
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					disabled: B(n).readOnly,
					onClick: i[9] ||= (e) => B(LP)()
				}, "＋ 新存档", 8, YN)) : X("", !0),
				J("button", {
					class: "trpg-btn",
					type: "button",
					disabled: B(n).readOnly,
					onClick: i[10] ||= (e) => o.value?.click()
				}, "导入存档文件", 8, XN),
				J("input", {
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
		], 40, PN));
	}
}), QN = { class: "trpg-confirm" }, $N = { class: "trpg-confirm__message" }, eP = { class: "trpg-confirm__actions trpg-confirm__actions--stack" }, tP = /* @__PURE__ */ H({
	__name: "UnsavedLoadPage",
	props: {
		current: {},
		target: {},
		onChoose: { type: Function }
	},
	setup(e) {
		let t = e;
		return (e, n) => (G(), K("div", QN, [
			J("p", $N, "「" + F(t.current) + "」有未保存到存档的改动。读取「" + F(t.target) + "」前：", 1),
			J("div", eP, [
				J("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[0] ||= (e) => t.onChoose("cancel")
				}, "取消"),
				J("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[1] ||= (e) => t.onChoose("discard")
				}, "不保存存档，直接读取"),
				J("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					"data-autofocus": "",
					onClick: n[2] ||= (e) => t.onChoose("save")
				}, "保存存档后读取")
			]),
			n[3] ||= J("p", { class: "trpg-field__hint" }, "无论选哪一项，当前状态都会先写入自动存档。", -1)
		]));
	}
}), nP = () => ({
	step: 1,
	ruleId: "",
	name: "",
	note: "",
	nameEdited: !1,
	touched: !1
}), rP = /* @__PURE__ */ ln(nP());
function iP() {
	Object.assign(rP, nP());
}
// src/ui/wizard/StepName.vue?vue&type=script&setup=true&lang.ts
var aP = { class: "trpg-field" }, oP = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, sP = {
	key: 1,
	class: "trpg-field__error",
	role: "alert"
}, cP = { class: "trpg-field" }, lP = {
	class: "trpg-field__hint",
	"data-testid": "wizard-summary"
}, uP = /* @__PURE__ */ H({
	__name: "StepName",
	emits: ["submit"],
	setup(e, { emit: t }) {
		let n = t, r = Dx(), i = /* @__PURE__ */ z(null), a = Z(() => r.svc().rules.get(rP.ruleId)), o = Z(() => rP.name.trim().length > 40), s = Z(() => rP.name.trim().length === 0), c = Z(() => `将建立：${a.value?.name ?? ""}`);
		return da(() => {
			if (!rP.nameEdited || !rP.name) {
				let e = new Date(r.svc().now());
				rP.name = `${a.value?.nameShort ?? "战役"} · ${e.getMonth() + 1}月${e.getDate()}日`;
			}
			i.value?.focus(), i.value?.select();
		}), (e, t) => (G(), K("form", {
			class: "page-stack",
			onSubmit: t[4] ||= Eu((e) => n("submit"), ["prevent"])
		}, [
			t[7] ||= J("h3", { class: "trpg-step-title" }, "给战役起个名字", -1),
			J("label", aP, [
				t[5] ||= J("span", { class: "trpg-field__label" }, "战役名称", -1),
				Ar(J("input", {
					ref_key: "input",
					ref: i,
					"onUpdate:modelValue": t[0] ||= (e) => B(rP).name = e,
					class: "trpg-input",
					type: "text",
					autocomplete: "off",
					"aria-label": "战役名称",
					onInput: t[1] ||= (e) => {
						B(rP).nameEdited = !0, B(rP).touched = !0;
					}
				}, null, 544), [[du, B(rP).name]]),
				s.value ? (G(), K("span", oP, "请输入战役名称")) : o.value ? (G(), K("span", sP, "名称最多 " + F(B(40)) + " 个字", 1)) : X("", !0)
			]),
			J("label", cP, [t[6] ||= J("span", { class: "trpg-field__label" }, "备注（可空）", -1), Ar(J("textarea", {
				"onUpdate:modelValue": t[2] ||= (e) => B(rP).note = e,
				class: "trpg-input",
				rows: "2",
				maxlength: "200",
				"aria-label": "备注",
				onInput: t[3] ||= (e) => B(rP).touched = !0
			}, null, 544), [[du, B(rP).note]])]),
			J("p", lP, F(c.value), 1)
		], 32));
	}
}), dP = { class: "page-stack" }, fP = /* @__PURE__ */ H({
	__name: "InfoPage",
	props: { lines: {} },
	setup(e) {
		return (t, n) => (G(), K("div", dP, [(G(!0), K(W, null, Oa(e.lines, (e) => (G(), K("p", {
			key: e,
			class: "trpg-info__line"
		}, F(e), 1))), 128))]));
	}
}), pP = ["aria-label"], mP = /* @__PURE__ */ H({
	__name: "Term",
	props: { label: {} },
	emits: ["open"],
	setup(e) {
		return (t, n) => (G(), K("button", {
			class: "trpg-term",
			type: "button",
			"aria-label": e.label,
			"aria-haspopup": "dialog",
			onClick: n[0] ||= Eu((e) => t.$emit("open"), ["stop"])
		}, [U(t.$slots, "default")], 8, pP));
	}
}), hP = { class: "page-stack" }, gP = {
	class: "trpg-rulecards",
	role: "radiogroup",
	"aria-label": "规则"
}, _P = [
	"aria-checked",
	"aria-disabled",
	"tabindex",
	"data-status",
	"onClick",
	"onKeydown"
], vP = {
	class: "trpg-rulecard__mark",
	"aria-hidden": "true"
}, yP = { class: "trpg-rulecard__body" }, bP = { class: "trpg-row__meta" }, xP = {
	key: 0,
	class: "trpg-badge"
}, SP = {
	key: 1,
	class: "trpg-badge",
	"data-tone": "warn"
}, CP = /* @__PURE__ */ H({
	__name: "StepRule",
	setup(e) {
		let t = Dx(), n = pC(), r = Z(() => Wb(t.svc().rules));
		function i(e, t) {
			t === "installed" && (rP.ruleId = e, rP.touched = !0);
		}
		function a(e, t, r) {
			n.push({
				key: `rule:${e}`,
				title: t,
				component: vn(fP),
				props: { lines: [r] }
			});
		}
		return (e, t) => (G(), K("div", hP, [t[0] ||= J("h3", { class: "trpg-step-title" }, "选择这场战役用的规则", -1), J("div", gP, [(G(!0), K(W, null, Oa(r.value, (e) => (G(), K("div", {
			key: e.id,
			class: "trpg-rulecard",
			role: "radio",
			"aria-checked": B(rP).ruleId === e.id,
			"aria-disabled": e.status !== "installed",
			tabindex: e.status === "installed" ? 0 : -1,
			"data-status": e.status,
			onClick: (t) => i(e.id, e.status),
			onKeydown: [Ou(Eu((t) => i(e.id, e.status), ["prevent"]), ["enter"]), Ou(Eu((t) => i(e.id, e.status), ["prevent"]), ["space"])]
		}, [J("span", vP, F(B(rP).ruleId === e.id ? "◉" : "○"), 1), J("span", yP, [
			Y(mP, { onOpen: (t) => a(e.id, e.name, e.description) }, {
				default: V(() => [Rs(F(e.name), 1)]),
				_: 2
			}, 1032, ["onOpen"]),
			J("span", bP, F(e.description), 1),
			e.status === "coming" ? (G(), K("span", xP, "即将推出")) : e.status === "installable" ? (G(), K("span", SP, "可安装")) : X("", !0)
		])], 40, _P))), 128))])]));
	}
}), wP = {
	class: "trpg-wizard",
	"data-testid": "wizard"
}, TP = {
	class: "trpg-steps",
	"aria-label": "步骤"
}, EP = ["data-state"], DP = [
	"aria-current",
	"disabled",
	"onClick"
], OP = { class: "trpg-steps__n" }, kP = { class: "trpg-steps__label" }, AP = {
	class: "trpg-steps__compact",
	"aria-hidden": "true"
}, jP = { class: "trpg-wizard__body" }, MP = { class: "trpg-wizard__foot" }, NP = ["disabled"], PP = ["disabled"], FP = /* @__PURE__ */ H({
	__name: "WizardPage",
	setup(e) {
		let t = Dx(), n = kx(), r = pC(), i = cS(), a = dS(), o = /* @__PURE__ */ z(!1), s = [{
			n: 1,
			label: "规则"
		}, {
			n: 2,
			label: "命名"
		}], c = Z(() => rP.name.trim().length > 0 && rP.name.trim().length <= 40), l = Z(() => rP.step === 1 ? !!rP.ruleId : c.value && !o.value), u = Z(() => s.find((e) => e.n === rP.step)?.label);
		da(() => {
			let e = t.svc().rules.list();
			!rP.ruleId && e.length === 1 && (rP.ruleId = e[0].id);
		});
		function d(e) {
			e < rP.step && (rP.step = e);
		}
		function f() {
			rP.step === 1 ? rP.step = 2 : m();
		}
		function p() {
			rP.step > 1 && (rP.step = 1);
		}
		async function m() {
			if (c.value && !o.value) {
				o.value = !0;
				try {
					let e = await n.startNew({
						ruleId: rP.ruleId,
						name: rP.name.trim(),
						note: rP.note
					});
					await t.refreshBackup(), r.close(!0), a.go("home"), i.success(`已开始「${e.name}」`);
				} catch (e) {
					console.error("[trpg-assistant] 开始冒险失败", e), i.error(`没能开始：${OC(e)}`);
				} finally {
					o.value = !1;
				}
			}
		}
		return (e, t) => (G(), K("div", wP, [
			J("ol", TP, [(G(), K(W, null, Oa(s, (e) => J("li", {
				key: e.n,
				"data-state": e.n === B(rP).step ? "current" : e.n < B(rP).step ? "done" : "todo"
			}, [J("button", {
				type: "button",
				"aria-current": e.n === B(rP).step ? "step" : void 0,
				disabled: e.n >= B(rP).step,
				onClick: (t) => d(e.n)
			}, [J("span", OP, F(e.n), 1), J("span", kP, F(e.label), 1)], 8, DP)], 8, EP)), 64))]),
			J("p", AP, F(B(rP).step) + "/" + F(s.length) + " · " + F(u.value), 1),
			J("div", jP, [B(rP).step === 1 ? (G(), q(CP, { key: 0 })) : (G(), q(uP, {
				key: 1,
				onSubmit: m
			}))]),
			J("footer", MP, [J("button", {
				class: "trpg-btn",
				type: "button",
				disabled: B(rP).step === 1 || o.value,
				onClick: p
			}, "上一步", 8, NP), J("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: !l.value,
				"data-testid": "wizard-next",
				onClick: f
			}, F(B(rP).step === 2 ? o.value ? "正在准备…" : "开始冒险" : "下一步"), 9, PP)])
		]));
	}
});
// src/ui/saves/actions.ts
function IP() {
	pC().open({
		key: "saves",
		title: "存档",
		component: vn(ZN),
		variant: "drawer"
	});
}
function LP() {
	let e = pC();
	iP(), e.open({
		key: "wizard",
		title: "开始新冒险",
		component: vn(FP),
		variant: "dialog",
		guard: () => !rP.touched || (zC({
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
async function RP() {
	let e = kx(), t = cS();
	if (e.hasCampaign && !e.readOnly) try {
		let n = await e.save();
		await Dx().refreshBackup(), t.success(n ? "已保存存档" : "已是最新");
	} catch (e) {
		console.error("[trpg-assistant] 保存存档失败", e), t.error(`保存存档失败：${OC(e)}`);
	}
}
async function zP(e) {
	let t = kx(), n = pC(), r = cS(), i = kC();
	if (t.readOnly) return { loaded: !1 };
	try {
		let a = !!t.workspace && t.workspace.ruleId !== e.ruleId;
		if (a) {
			let n = Dx().svc().rules.get(e.ruleId);
			if (!await zC({
				title: "切换规则",
				message: `「${e.name}」使用 ${n?.name ?? e.ruleId}。读取后，整个助手会切换为该规则的界面与资料；当前的「${t.currentSave?.name ?? "存档"}」会先写入自动存档。`,
				confirmLabel: "切换并读取"
			})) return { loaded: !1 };
		} else if (t.hasCampaign && t.dirty) {
			let n = await AC({
				key: "confirm:unsaved",
				title: "有未保存到存档的改动",
				component: vn(tP),
				props: (n) => ({
					current: t.currentSave?.name ?? "当前存档",
					target: e.name,
					onChoose: n
				})
			}, "cancel");
			if (n === "cancel") return { loaded: !1 };
			n === "save" && await t.save();
		} else if (t.hasCampaign && e.ownerKey !== t.owner?.ownerKey && !await zC({
			title: "读取其他角色卡的存档",
			message: `「${e.name}」属于其他角色卡，读取时会复制为这张卡的新存档。`,
			confirmLabel: "读取"
		})) return { loaded: !1 };
		return await t.load(e.id, { allowRuleSwitch: a || !t.hasCampaign }), await i.refresh(), r.success(`已读取「${e.name}」`), n.close(!0), { loaded: !0 };
	} catch (e) {
		return console.error("[trpg-assistant] 读取存档失败", e), r.error(e instanceof Xy ? e.message : `读取失败：${OC(e)}`), { loaded: !1 };
	}
}
// src/ui/home/HomeCampaign.vue?vue&type=script&setup=true&lang.ts
var BP = { class: "page-stack" }, VP = ["src", "alt"], HP = { class: "trpg-banner__text" }, UP = { class: "trpg-banner__line" }, WP = ["data-dirty"], GP = { class: "trpg-empty trpg-empty--tight" }, KP = /* @__PURE__ */ H({
	__name: "HomeCampaign",
	setup(e) {
		let t = Dx(), n = kx(), r = dS(), i = /* @__PURE__ */ z(!1), a = /* @__PURE__ */ z(!1), o = Z(() => n.workspace ? t.svc().rules.get(n.workspace.ruleId) : void 0), s = Z(() => SC({
			rule: o.value,
			data: n.workspace.data,
			narrow: window.innerWidth <= 480
		})), c = Z(() => !!s.value.src && !i.value), l = Z(() => n.currentSave?.name ?? "存档"), u = Z(() => n.dirty ? "● 有未保存到存档的改动" : n.currentSave ? `存档已保存 ${TC(n.currentSave.updatedAt)}` : "");
		return (e, t) => (G(), K("div", BP, [
			J("section", {
				class: Ae(["trpg-banner", { "trpg-banner--pattern": !c.value }]),
				"aria-label": "战役横幅"
			}, [c.value ? (G(), K("img", {
				key: 0,
				class: Ae(["trpg-banner__img", { "is-loaded": a.value }]),
				src: s.value.src,
				alt: s.value.alt,
				onLoad: t[0] ||= (e) => a.value = !0,
				onError: t[1] ||= (e) => i.value = !0
			}, null, 42, VP)) : X("", !0), J("div", HP, [J("button", {
				class: "trpg-banner__title",
				type: "button",
				"data-testid": "banner-title",
				onClick: t[2] ||= (...e) => B(IP) && B(IP)(...e)
			}, F(l.value), 1), J("div", UP, [J("span", null, F(o.value?.name), 1), J("button", {
				class: "trpg-banner__state",
				type: "button",
				"data-dirty": B(n).dirty,
				onClick: t[3] ||= (...e) => B(IP) && B(IP)(...e)
			}, F(u.value), 9, WP)])])], 2),
			t[6] ||= J("h2", { class: "trpg-group" }, "最近记录", -1),
			J("p", GP, [t[5] ||= Rs("还没有记录，", -1), J("button", {
				class: "trpg-link",
				type: "button",
				onClick: t[4] ||= (e) => B(r).diceOpen = !0
			}, "掷一次骰子试试")])
		]));
	}
}), qP = { class: "page-stack" }, JP = ["disabled"], YP = { class: "trpg-hero__sub" }, XP = {
	key: 1,
	class: "trpg-hero trpg-hero--idle",
	"data-testid": "no-chat"
}, ZP = /* @__PURE__ */ H({
	__name: "HomeEmpty",
	setup(e) {
		let t = kx(), n = Dx(), r = kC(), i = /* @__PURE__ */ z(0);
		return da(async () => {
			i.value = await r.count(), await n.refreshBackup();
		}), (e, n) => (G(), K("div", qP, [B(t).owner ? (G(), K("button", {
			key: 0,
			class: "trpg-hero",
			type: "button",
			"data-testid": "start-banner",
			disabled: B(t).readOnly,
			onClick: n[0] ||= (e) => B(LP)()
		}, [
			n[2] ||= J("span", { class: "trpg-hero__title" }, "开始一场新的冒险", -1),
			J("span", YP, "为「" + F(B(t).owner.ownerLabel) + "」建立一个战役：选规则、资料与冒险，再起个名字。", 1),
			n[3] ||= J("span", {
				class: "trpg-hero__go",
				"aria-hidden": "true"
			}, "开始新冒险 →", -1)
		], 8, JP)) : (G(), K("div", XP, [...n[4] ||= [J("span", { class: "trpg-hero__title" }, "请先在酒馆中打开一个聊天", -1)]])), B(t).owner && i.value > 0 ? (G(), K("button", {
			key: 2,
			class: "trpg-link",
			type: "button",
			"data-testid": "load-existing",
			onClick: n[1] ||= (...e) => B(IP) && B(IP)(...e)
		}, "读取已有存档（" + F(i.value) + "）", 1)) : X("", !0)]));
	}
}), QP = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, $P = {
	key: 1,
	class: "page-stack",
	"aria-busy": "true"
}, eF = /* @__PURE__ */ H({
	__name: "HomeView",
	setup(e) {
		let t = Dx(), n = kx();
		return (e, r) => B(t).bootError ? (G(), K("p", QP, "无法打开本机存储：" + F(B(t).bootError), 1)) : !B(t).booted || !B(n).ready ? (G(), K("div", $P, [...r[0] ||= [J("div", {
			class: "trpg-skeleton",
			style: { height: "140px" }
		}, null, -1), J("div", {
			class: "trpg-skeleton",
			style: { width: "40%" }
		}, null, -1)]])) : B(n).hasCampaign ? (G(), q(KP, { key: 3 })) : (G(), q(ZP, { key: 2 }));
	}
}), tF = /* @__PURE__ */ ln({});
function nF(e, t, n, r, i) {
	tF[e] = {
		id: e,
		title: t,
		status: n,
		summary: r,
		detail: i,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function rF(e, t, n) {
	try {
		await n();
	} catch (n) {
		console.error(`[trpg-assistant] 探针 ${e} 出错`, n), nF(e, t, "error", n instanceof Error ? n.message : String(n));
	}
}
function iF(e) {
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		env: e,
		results: Object.values(tF)
	};
}
// src/probes/envProbe.ts
var aF = "env", oF = "宿主与设备环境";
function sF() {
	let e = document.createElement("div");
	e.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top)", document.body.appendChild(e);
	let t = getComputedStyle(e).paddingTop;
	return e.remove(), t;
}
async function cF(e) {
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
		safeAreaTop: sF(),
		contextKeys: Object.keys(e).sort(),
		libsKeys: Object.keys(window.SillyTavern?.libs ?? {}).sort(),
		hasSetExtensionPrompt: typeof e.setExtensionPrompt == "function",
		hasPromptEnums: !!e.extension_prompt_types,
		eventTypeCount: Object.keys(e.event_types ?? {}).length,
		tauri: t
	};
}
function lF(e) {
	let t = () => rF(aF, oF, async () => {
		let t = await cF(e), n = t.tauri;
		nF(aF, oF, "info", n.present ? "检测到 TauriTavern 宿主" : "未检测到 TauriTavern（普通 SillyTavern）", t);
	});
	return {
		id: aF,
		title: oF,
		hint: "自动检测。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/eventsProbe.ts
var uF = "events", dF = "聊天事件", fF = [
	["CHAT_CHANGED", "chat_id_changed"],
	["MESSAGE_SENT", "message_sent"],
	["MESSAGE_RECEIVED", "message_received"],
	["MESSAGE_SWIPED", "message_swiped"],
	["MESSAGE_EDITED", "message_edited"],
	["MESSAGE_DELETED", "message_deleted"],
	["GENERATION_STARTED", "generation_started"],
	["GENERATION_ENDED", "generation_ended"]
];
function pF(e) {
	let t = {}, n = [], r = () => {
		let e = fF.map(([e]) => e).filter((e) => !t[e]);
		nF(uF, dF, "info", e.length ? `尚未观察到：${e.join("、")}` : "全部事件都已观察到", {
			counts: t,
			recent: n.slice(-30)
		});
	};
	return {
		id: uF,
		title: dF,
		hint: "依次做：发送消息、等回复、切换回复（左右箭头）、编辑一条消息、删除一条消息、切换聊天，观察事件是否都能收到。",
		actions: [{
			label: "刷新",
			run: r
		}],
		start: () => {
			for (let [i, a] of fF) g(e, h(e, i, a), (...e) => {
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
var mF = "identity", hF = "角色卡 / 群组 / 聊天标识";
function gF(e) {
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
function _F(e) {
	let t = [], n = () => {
		let n = gF(e), r = JSON.stringify([
			n.characterId,
			n.groupId,
			n.chatId
		]);
		t.some((e) => e.key === r) || t.push({
			key: r,
			...n
		}), nF(mF, hF, "info", `当前：${n.groupId ? "群组聊天" : n.characterId === null ? "没有打开聊天" : "角色卡聊天"}；已观察 ${t.length} 种上下文`, {
			current: n,
			observed: t
		});
	};
	return {
		id: mF,
		title: hF,
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
// src/probes/promptScan.ts
var vF = "TRPG-PROBE-COMMENT", yF = "TRPG-PROBE-INJECT";
function bF(e) {
	if (typeof e == "string") return e;
	try {
		return JSON.stringify(e) ?? "";
	} catch (e) {
		return console.error("[trpg-assistant] 请求内容无法序列化", e), "";
	}
}
function xF(e, t) {
	let n = e.indexOf(t);
	if (!(n < 0)) return e.slice(Math.max(0, n - 6), n + t.length + 12);
}
function SF(e, t) {
	let n = e?.chat;
	if (Array.isArray(n)) for (let e = 0; e < n.length; e++) {
		let r = n[e];
		if ((typeof r?.content == "string" ? r.content : bF(r?.content)).includes(t)) return {
			role: String(r.role ?? "?"),
			indexFromEnd: n.length - 1 - e
		};
	}
}
function CF(e) {
	let t = bF(e);
	return {
		length: t.length,
		comment: t.includes(vF),
		commentIntact: t.includes("<!--TRPG-PROBE-COMMENT") && t.includes("-->"),
		inject: t.includes(yF),
		commentSnippet: xF(t, vF),
		injectSnippet: xF(t, yF),
		injectAt: SF(e, yF)
	};
}
// src/probes/llmLogAudit.ts
function wF(e) {
	if (e && typeof e == "object") {
		let t = e;
		return t.id ?? t.key ?? t.logId ?? t.name;
	}
	return e;
}
async function TF() {
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
	let o = CF(await e.getRaw(wF(r)));
	return a.scan = o, a.markers = [vF, yF], {
		status: "info",
		summary: `最近一次请求原文：${o.comment ? `含注释标记${o.commentIntact ? "（符号完整）" : "（符号被改）"}` : "无注释标记"}；${o.inject ? "含注入标记" : "无注入标记"}`,
		detail: a
	};
}
// src/probes/promptProbes.ts
var EF = "comment", DF = "注释是否进入发给 AI 的请求", OF = "inject", kF = "提示词注入是否生效", AF = "input", jF = "写入与读取输入框", MF = "tavern-trpg-assistant_probe", NF = 1, PF = 0;
function FF(e) {
	return e?.dryRun === !0;
}
function IF(e) {
	let t = !1, n = !1, r = "", i = [], a = {}, o = (e) => (t) => {
		i.push({
			event: e,
			dryRun: FF(t),
			...CF(t)
		});
	}, s = () => {
		let e = i.filter((e) => !e.dryRun);
		if (r !== "quiet") {
			if (!e.length) t && nF(EF, DF, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）"), n && nF(OF, kF, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）");
			else {
				if (t) {
					let n = e.find((e) => e.comment), i = e.some((e) => e.commentIntact);
					nF(EF, DF, n && i ? "pass" : "fail", n ? i ? "注释原样进入了请求（<!-- --> 完整保留）" : "标记文字进入了请求，但 <!-- --> 符号被改动或删除" : "请求中没有找到注释内容（注释被删除）", {
						runType: r,
						captures: e,
						message: a
					}), t = !1;
				}
				if (n) {
					let t = e.find((e) => e.inject);
					nF(OF, kF, t ? "pass" : "fail", t ? `注入文本进入了请求${t.injectAt ? `（${t.injectAt.role} 消息，距末尾 ${t.injectAt.indexFromEnd} 条）` : ""}` : "请求中没有找到注入文本", {
						runType: r,
						captures: e
					}), n = !1, c();
				}
			}
		}
	}, c = () => {
		let t = e.extension_prompt_types?.IN_CHAT ?? NF, n = e.extension_prompt_roles?.SYSTEM ?? PF;
		e.setExtensionPrompt?.(MF, "", t, 0, !1, n);
	}, l = () => {
		let t = h(e, "CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready"), n = h(e, "GENERATE_AFTER_COMBINE_PROMPTS", "generate_after_combine_prompts"), c = h(e, "GENERATE_AFTER_DATA", "generate_after_data");
		g(e, t, o(t)), g(e, n, o(n)), g(e, c, o(c)), g(e, h(e, "GENERATION_STARTED", "generation_started"), (e, t, n) => {
			n !== !0 && (r = String(e ?? ""), i = []);
		});
		let l = () => s();
		g(e, h(e, "GENERATION_ENDED", "generation_ended"), l), g(e, h(e, "GENERATION_STOPPED", "generation_stopped"), l), g(e, h(e, "MESSAGE_SENT", "message_sent"), (t) => {
			let n = e.chat[Number(t)];
			a.storedInChat = !!n?.mes?.includes(vF);
		}), g(e, h(e, "USER_MESSAGE_RENDERED", "user_message_rendered"), (e) => {
			let t = document.querySelector(`.mes[mesid="${Number(e)}"] .mes_text`);
			t && (a.visibleTextHasMarker = !!t.textContent?.includes(vF), a.htmlHasComment = t.innerHTML.includes(`<!--${vF}`));
		});
	}, u = {
		id: EF,
		title: DF,
		hint: "点「写入测试注释」后，自己发送这条消息（需要已连接模型）。发送完成后自动判定；楼层里应看不到注释文字。",
		actions: [{
			label: "写入测试注释到输入框",
			run: () => rF(EF, DF, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let n = `<!--${vF} 探针-->`;
				_(e, e.value ? `${e.value}\n${n}` : `测试 ${n}`), t = !0, nF(EF, DF, "waiting", "已写入。请发送这条消息，等 AI 回复结束后自动判定");
			})
		}]
	};
	u.actions.push({
		label: "从 TauriTavern 请求日志核对",
		run: () => rF(EF, DF, async () => {
			let e = await TF();
			nF(EF, DF, e.status, e.summary, {
				runType: r,
				audit: e.detail,
				message: a
			});
		})
	});
	let d = {
		id: OF,
		title: kF,
		hint: "点「注入探针」后发送任意消息。可以和上一项同一次发送完成判定。测完请点「清除注入」。",
		actions: [{
			label: "注入探针",
			run: () => rF(OF, kF, () => {
				if (!e.setExtensionPrompt) throw Error("宿主没有 setExtensionPrompt");
				let t = e.extension_prompt_types?.IN_CHAT ?? NF, r = e.extension_prompt_roles?.SYSTEM ?? PF;
				e.setExtensionPrompt(MF, `[${yF}] 这是探针注入文本`, t, 0, !1, r), n = !0, nF(OF, kF, "waiting", "已注入（IN_CHAT，深度 0）。请发送一条消息，判定后会自动清除", { enumsFromContext: !!e.extension_prompt_types });
			})
		}, {
			label: "清除注入",
			run: () => rF(OF, kF, () => {
				c(), n = !1, nF(OF, kF, "idle", "已清除注入");
			})
		}]
	}, p = {
		id: AF,
		title: jF,
		hint: "自动写入一段文字、读回校验，然后恢复原内容（不会发送）。",
		actions: [{
			label: "运行输入框测试",
			run: () => rF(AF, jF, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let t = e.value, n = `${t}[TRPG-PROBE-INPUT]`;
				_(e, n);
				let r = e.value;
				_(e, t);
				let i = e.value === t;
				nF(AF, jF, r === n && i ? "pass" : "fail", r === n ? i ? "写入、读回、恢复都正常" : "写入正常，但恢复失败" : "写入后读回的内容不一致", {
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
var LF = "storage", RF = "本地存储与持久性", zF = `${u}-m0`, BF = 4194304;
function VF() {
	return new Promise((e, t) => {
		let n = indexedDB.open(zF, 1);
		n.onupgradeneeded = () => n.result.createObjectStore("kv"), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
	});
}
function HF(e, t, n) {
	return new Promise((r, i) => {
		let a = n(e.transaction("kv", t).objectStore("kv"));
		a.onsuccess = () => r(a.result), a.onerror = () => i(a.error);
	});
}
function UF(e) {
	let t = () => rF(LF, RF, async () => {
		let t = await VF(), n = await HF(t, "readonly", (e) => e.get("boot")), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			count: (n?.count ?? 0) + 1,
			firstAt: n?.firstAt ?? r,
			lastAt: r
		};
		await HF(t, "readwrite", (e) => e.put(i, "boot"));
		let a = !!await HF(t, "readonly", (e) => e.get("blob"));
		a || await HF(t, "readwrite", (e) => e.put(new Uint8Array(BF), "blob"));
		let o = await HF(t, "readonly", (e) => e.get("blob"));
		t.close();
		let s = await navigator.storage?.persisted?.() ?? null, c = await navigator.storage?.estimate?.() ?? null, l = e.extensionSettings[u] ??= {}, d = Number(l.probeBootCount ?? 0);
		l.probeBootCount = d + 1, e.saveSettingsDebounced(), nF(LF, RF, "info", `IndexedDB 第 ${i.count} 次启动读写正常；刷新页面后次数应增加`, {
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
		id: LF,
		title: RF,
		hint: "每次启动自动读写 IndexedDB（含 4MB 数据）与扩展设置。完全退出再打开应用后，启动次数应继续累加，4MB 数据应已存在。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/tauriProbe.ts
var WF = "tauri", GF = "TauriTavern 扩展接口", KF = `${u}-m0`, qF = "/scripts/tauritavern/layout-kit.js", JF = [
	"current",
	"getCurrent",
	"active",
	"handle",
	"currentChat"
];
function YF(e, t) {
	if (typeof e == "function") return "function";
	if (typeof e != "object" || !e) return typeof e;
	if (t <= 0) return "object";
	let n = {};
	for (let r of Object.keys(e)) n[r] = YF(e[r], t - 1);
	return n;
}
async function XF(e, t) {
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
function ZF(e) {
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
function QF(e) {
	let t = e;
	return t.ok ? {
		ok: !0,
		shape: ZF(t.value)
	} : t;
}
async function $F(e) {
	if (typeof e.searchMessages == "function" || e.store) return {
		handle: e,
		via: "api.chat 本身"
	};
	let t = e.current;
	if (t && typeof t.handle == "function") {
		let e = await XF("api.chat.current.handle()", () => t.handle.call(t));
		if (e.ok && e.value && typeof e.value == "object") return {
			handle: e.value,
			via: "api.chat.current.handle()"
		};
	}
	for (let t of JF) {
		let n = e[t];
		if (typeof n == "function") {
			let r = await XF(`api.chat.${t}()`, () => n.call(e)), i = r.value;
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
function eI() {
	let e = () => rF(WF, GF, async () => {
		if (!window.__TAURITAVERN__) {
			nF(WF, GF, "info", "不是 TauriTavern，跳过（扩展将使用酒馆通用能力）");
			return;
		}
		let e = (await m())?.api ?? {}, t = e.chat ?? {}, n = { apiShape: YF(e, 3) };
		n.layoutKitExports = await XF("layout-kit 导入", () => import(
			/* @vite-ignore */
			qF
).then((e) => Object.keys(e)));
		let { handle: r, via: i } = await $F(t);
		if (n.handleVia = i, r) {
			let e = r;
			n.handleShape = YF(r, 2), e.searchMessages && (n.searchMessages = QF(await XF("searchMessages", () => e.searchMessages({
				query: "你",
				limit: 3
			}))));
			let t = e.locate?.findLastMessage;
			if (t && (n.findLastMessage = QF(await XF("findLastMessage", () => t.call(e.locate, {
				role: "user",
				scanLimit: 50
			})))), e.store?.setJson && e.store.getJson) {
				let t = { at: (/* @__PURE__ */ new Date()).toISOString() };
				n.storeSet = await XF("store.setJson", () => e.store.setJson({
					namespace: KF,
					key: "probe",
					value: t
				})), n.storeGet = await XF("store.getJson", () => e.store.getJson({
					namespace: KF,
					key: "probe"
				})), e.store.listKeys && (n.storeKeys = await XF("store.listKeys", () => e.store.listKeys({ namespace: KF }))), e.store.deleteJson && (n.storeDelete = await XF("store.deleteJson", () => e.store.deleteJson({
					namespace: KF,
					key: "probe"
				})));
			}
			e.metadata?.get && (n.metadata = QF(await XF("metadata.get", () => e.metadata.get()))), typeof e.stableId == "function" && (n.stableId = QF(await XF("stableId", () => e.stableId.call(e)))), typeof e.summary == "function" && (n.summary = QF(await XF("summary", () => e.summary.call(e))));
		}
		let a = e.extension?.store;
		if (a?.setJson && a.getJson) {
			let e = { at: (/* @__PURE__ */ new Date()).toISOString() }, t = {
				namespace: KF,
				key: "probe"
			};
			n.extStoreSet = await XF("extension.store.setJson", () => a.setJson({
				...t,
				value: e
			})), n.extStoreGet = await XF("extension.store.getJson", () => a.getJson(t)), a.listKeys && (n.extStoreKeys = await XF("extension.store.listKeys", () => a.listKeys({ namespace: KF }))), a.deleteJson && (n.extStoreDelete = await XF("extension.store.deleteJson", () => a.deleteJson(t)));
		}
		nF(WF, GF, "info", r ? `找到 handle（${i}）；各接口调用结果见详情` : "没有找到获取 handle 的方式；接口结构见详情", n);
	});
	return {
		id: WF,
		title: GF,
		hint: "仅 TauriTavern 有效。请分别在「已打开聊天」和「未打开聊天」两种状态下点「重新检测」各测一次。",
		actions: [{
			label: "重新检测",
			run: e
		}],
		start: e
	};
}
// src/probes/index.ts
function tI(e) {
	return [
		lF(e),
		...IF(e),
		UF(e),
		_F(e),
		pF(e),
		eI()
	];
}
// src/ui/kit/SelectField.vue?vue&type=script&setup=true&lang.ts
var nI = { class: "trpg-select-trigger__text" }, rI = {
	key: 0,
	class: "trpg-select-trigger__prefix"
}, iI = /* @__PURE__ */ H({
	__name: "SelectField",
	props: /*@__PURE__*/ Ya({
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
		let t = e, n = vo(e, "modelValue"), r = Nr("portalTarget", void 0), i = Z(() => t.options.map((e) => typeof e == "string" ? {
			value: e,
			label: e
		} : e));
		return (t, a) => (G(), q(B(vM), {
			modelValue: n.value,
			"onUpdate:modelValue": a[0] ||= (e) => n.value = e,
			disabled: e.disabled
		}, {
			default: V(() => [Y(B(IM), {
				class: "trpg-select-trigger",
				disabled: e.disabled,
				"aria-label": e.label
			}, {
				default: V(() => [J("span", nI, [e.prefix ? (G(), K("span", rI, F(e.prefix), 1)) : X("", !0), Y(B(LM), { placeholder: e.placeholder ?? "请选择" }, null, 8, ["placeholder"])]), Y(wS, {
					name: "caret-down",
					size: 14
				})]),
				_: 1
			}, 8, ["disabled", "aria-label"]), Y(B(FM), { to: B(r) }, {
				default: V(() => [Y(B(AM), {
					class: "trpg-select-content",
					position: "popper",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: V(() => [Y(B(RM), { class: "trpg-select-viewport" }, {
						default: V(() => [(G(!0), K(W, null, Oa(i.value, (e) => (G(), q(B(NM), {
							key: e.value,
							value: e.value,
							class: "trpg-select-item"
						}, {
							default: V(() => [Y(B(PM), null, {
								default: V(() => [Rs(F(e.label), 1)]),
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
}), aI = {
	class: "trpg-combo__count",
	role: "status"
}, oI = {
	key: 0,
	class: "trpg-row__meta"
}, sI = {
	key: 0,
	class: "trpg-badge"
}, cI = 200, lI = /* @__PURE__ */ H({
	__name: "Combobox",
	props: /*@__PURE__*/ Ya({
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
		let t = e, n = vo(e, "modelValue"), r = Nr("portalTarget", void 0), i = /* @__PURE__ */ z(""), a = Z(() => {
			let e = i.value.trim().toLowerCase();
			return e ? t.options.filter((t) => t.label.toLowerCase().includes(e) || (t.en ?? "").toLowerCase().includes(e)) : t.options;
		}), o = Z(() => a.value.slice(0, cI)), s = Z(() => t.options.find((e) => e.value === n.value)), c = (e) => t.options.find((t) => t.value === e)?.label ?? "";
		return (t, l) => (G(), q(B(dj), {
			modelValue: n.value,
			"onUpdate:modelValue": l[2] ||= (e) => n.value = e,
			disabled: e.disabled,
			"ignore-filter": "",
			"open-on-click": "",
			class: "trpg-combo"
		}, {
			default: V(() => [Y(B(fj), { class: "trpg-combo__anchor" }, {
				default: V(() => [Y(B(bj), {
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
				]), Y(B(Cj), {
					class: "trpg-icon-btn trpg-combo__trigger",
					disabled: e.disabled,
					"aria-label": "展开列表"
				}, {
					default: V(() => [Y(wS, {
						name: "caret-down",
						size: 14
					})]),
					_: 1
				}, 8, ["disabled"])]),
				_: 1
			}), Y(B(Sj), { to: B(r) }, {
				default: V(() => [Y(B(gj), {
					class: "trpg-select-content trpg-combo__content",
					position: "popper",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: V(() => [J("div", aI, [Rs("共 " + F(a.value.length) + " 条", 1), a.value.length > cI ? (G(), K(W, { key: 0 }, [Rs("，只显示前 " + F(cI) + " 条，继续输入可缩小范围")], 64)) : X("", !0)]), Y(B(Tj), {
						class: "trpg-select-viewport",
						onMousedown: l[1] ||= Eu(() => {}, ["prevent"])
					}, {
						default: V(() => [Y(B(_j), { class: "trpg-combo__empty" }, {
							default: V(() => [...l[3] ||= [Rs("没有符合的条目", -1)]]),
							_: 1
						}), (G(!0), K(W, null, Oa(o.value, (e) => (G(), q(B(xj), {
							key: e.value,
							value: e.value,
							class: "trpg-select-item"
						}, {
							default: V(() => [J("span", null, [Rs(F(e.label), 1), e.en ? (G(), K("span", oI, " · " + F(e.en), 1)) : X("", !0)]), e.badge ? (G(), K("span", sI, F(e.badge), 1)) : X("", !0)]),
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
}), uI = ["title"], dI = [
	"aria-checked",
	"aria-label",
	"aria-description",
	"disabled",
	"data-on"
], fI = /* @__PURE__ */ H({
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
		return (r, i) => (G(), K("span", {
			class: "trpg-switch-wrap",
			title: e.lockedReason
		}, [e.lockedReason ? (G(), q(wS, {
			key: 0,
			name: "lock",
			size: 14
		})) : X("", !0), J("button", {
			class: "trpg-switch",
			type: "button",
			role: "switch",
			"aria-checked": t.value,
			"aria-label": e.label,
			"aria-description": e.lockedReason,
			disabled: e.disabled,
			"data-on": t.value,
			onClick: n
		}, [...i[0] ||= [J("span", { class: "trpg-switch__thumb" }, null, -1)]], 8, dI)], 8, uI));
	}
}), pI = { class: "trpg-pill trpg-tag" }, mI = ["aria-label"], hI = /* @__PURE__ */ H({
	__name: "TagPill",
	props: {
		label: {},
		owner: {}
	},
	emits: ["remove"],
	setup(e) {
		return (t, n) => (G(), K("span", pI, [J("span", null, F(e.label), 1), J("button", {
			class: "trpg-tag__x",
			type: "button",
			"aria-label": `移除${e.owner ? `${e.owner}的` : ""}『${e.label}』标签`,
			onClick: n[0] ||= (e) => t.$emit("remove")
		}, "×", 8, mI)]));
	}
}), gI = ["data-testid"], _I = { class: "trpg-list" }, vI = /* @__PURE__ */ H({
	__name: "LabModalPage",
	props: { level: {} },
	setup(e) {
		let t = e, n = pC();
		function r() {
			n.push({
				key: `lab:${t.level + 1}`,
				title: `第 ${t.level + 1} 页`,
				component: vn(vI),
				props: { level: t.level + 1 }
			});
		}
		async function i() {
			await zC({
				title: "测试确认",
				message: "这是弹窗内的确认页，「‹」或 Esc 即取消。",
				confirmLabel: "确认"
			});
		}
		return (t, n) => (G(), K("div", {
			class: "page-stack",
			"data-testid": `lab-page-${e.level}`
		}, [
			J("p", null, [
				Rs("这是演示弹窗的第 " + F(e.level) + " 页。点下面的术语在", 1),
				Y(mP, { onOpen: r }, {
					default: V(() => [...n[0] ||= [Rs("同一个弹窗里", -1)]]),
					_: 1
				}),
				n[1] ||= Rs("前进一页。", -1)
			]),
			J("ul", _I, [(G(), K(W, null, Oa(30, (e) => J("li", {
				key: e,
				class: "trpg-row"
			}, [J("span", null, "演示行 " + F(e), 1)])), 64))]),
			J("button", {
				class: "trpg-btn",
				type: "button",
				onClick: i
			}, "弹窗内确认")
		], 8, gI));
	}
}), yI = { class: "probe" }, bI = { class: "lab" }, xI = { class: "lab__row" }, SI = {
	class: "probe__hint",
	"data-testid": "select-model"
}, CI = { class: "lab__row" }, wI = { class: "trpg-check" }, TI = { class: "lab__row" }, EI = {
	class: "probe__hint",
	"data-testid": "combo-model"
}, DI = { class: "probe__actions" }, OI = { class: "lab__row" }, kI = { class: "trpg-row" }, AI = { class: "trpg-row__main" }, jI = { "data-testid": "switch-state" }, MI = {
	class: "probe__hint",
	"data-testid": "menu-pick"
}, NI = { class: "probe__actions" }, PI = { class: "probe__head" }, FI = { class: "probe__title" }, II = ["data-status"], LI = { class: "probe__hint" }, RI = { class: "probe__actions" }, zI = ["onClick"], BI = ["onClick"], VI = /* @__PURE__ */ H({
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
		], n = /* @__PURE__ */ z(""), r = /* @__PURE__ */ z(""), i = /* @__PURE__ */ z("a"), a = /* @__PURE__ */ z(!1), o = /* @__PURE__ */ z(""), s = /* @__PURE__ */ z(!1), c = /* @__PURE__ */ z(""), l = Array.from({ length: 300 }, (e, t) => ({
			value: `s${t}`,
			label: `法术-${String(t + 1).padStart(3, "0")}`,
			en: `Spell ${t + 1}`,
			badge: t % 2 ? "PHB" : "XGE"
		})), u = /* @__PURE__ */ z(["队伍成员", "风暴岛"]), d = /* @__PURE__ */ z(""), f = pC(), p = cS();
		function m() {
			f.open({
				key: "lab:1",
				title: "演示弹窗",
				component: vn(vI),
				props: { level: 1 }
			});
		}
		async function h() {
			let e = await zC({
				title: "卸载演示",
				message: "确定要卸载吗？",
				confirmLabel: "卸载",
				danger: !0
			});
			p.info(e ? "已确认" : "已取消");
		}
		function g(e, t, n) {
			nF(e, t, n, n === "pass" ? "人工确认：通过" : "人工确认：不通过");
		}
		return (e, f) => (G(), K("section", yI, [
			f[15] ||= J("h3", { class: "probe__title" }, "界面实测（需要你目测后点结果）", -1),
			J("div", bI, [
				J("div", xI, [
					Y(iI, {
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
					J("p", SI, "下拉当前值：" + F(n.value || "未选") + " / " + F(r.value || "未选"), 1),
					Y(iI, {
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
				J("div", CI, [
					Y(HC, {
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
					J("label", wI, [Ar(J("input", {
						"onUpdate:modelValue": f[3] ||= (e) => a.value = e,
						type: "checkbox"
					}, null, 512), [[fu, a.value]]), f[11] ||= Rs(" 勾选框测试", -1)]),
					Ar(J("input", {
						"onUpdate:modelValue": f[4] ||= (e) => o.value = e,
						class: "trpg-input",
						type: "text",
						placeholder: "输入测试：中文 / English"
					}, null, 512), [[du, o.value]])
				]),
				J("div", TI, [
					Y(lI, {
						modelValue: c.value,
						"onUpdate:modelValue": f[5] ||= (e) => c.value = e,
						options: B(l),
						label: "可搜索下拉演示",
						placeholder: "搜索 300 条法术"
					}, null, 8, ["modelValue", "options"]),
					J("p", EI, "可搜索下拉当前值：" + F(c.value || "未选"), 1),
					J("div", DI, [(G(!0), K(W, null, Oa(u.value, (e) => (G(), q(hI, {
						key: e,
						label: e,
						owner: "盖尔",
						onRemove: (t) => u.value = u.value.filter((t) => t !== e)
					}, null, 8, ["label", "onRemove"]))), 128))])
				]),
				J("div", OI, [
					J("div", kI, [
						J("span", AI, [f[12] ||= Rs("开关演示：", -1), J("span", jI, F(s.value ? "开" : "关"), 1)]),
						Y(fI, {
							modelValue: s.value,
							"onUpdate:modelValue": f[6] ||= (e) => s.value = e,
							label: "演示开关"
						}, null, 8, ["modelValue"]),
						Y(WM, {
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
					J("p", MI, "菜单选择：" + F(d.value || "无"), 1),
					J("p", null, [f[14] ||= Rs("下划线术语：", -1), Y(mP, { onOpen: m }, {
						default: V(() => [...f[13] ||= [Rs("点我打开演示弹窗", -1)]]),
						_: 1
					})]),
					J("div", NI, [
						J("button", {
							class: "trpg-btn",
							type: "button",
							onClick: h
						}, "危险确认"),
						J("button", {
							class: "trpg-btn",
							type: "button",
							onClick: f[8] ||= (e) => B(p).success("已保存")
						}, "成功提示"),
						J("button", {
							class: "trpg-btn",
							type: "button",
							onClick: f[9] ||= (e) => B(p).undoable("已删除一项", () => {
								B(p).info("已撤销");
							})
						}, "可撤销提示"),
						J("button", {
							class: "trpg-btn",
							type: "button",
							onClick: f[10] ||= (e) => B(p).error("下载失败：网络中断")
						}, "失败提示")
					])
				])
			]),
			(G(), K(W, null, Oa(t, (e) => J("div", {
				key: e.id,
				class: "probe"
			}, [
				J("div", PI, [J("h4", FI, F(e.title), 1), J("span", {
					class: "trpg-badge",
					"data-status": B(tF)[e.id]?.status ?? "idle"
				}, F(B(tF)[e.id]?.status ?? "待测"), 9, II)]),
				J("p", LI, F(e.how), 1),
				J("div", RI, [J("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => g(e.id, e.title, "pass")
				}, "通过", 8, zI), J("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => g(e.id, e.title, "fail")
				}, "不通过", 8, BI)])
			])), 64))
		]));
	}
}), HI = { class: "probe__head" }, UI = { class: "probe__title" }, WI = ["data-status"], GI = { class: "probe__hint" }, KI = {
	key: 0,
	class: "probe__summary"
}, qI = { class: "probe__actions" }, JI = ["onClick"], YI = { key: 1 }, XI = { class: "report-bar" }, ZI = { role: "status" }, QI = /* @__PURE__ */ H({
	__name: "ProbeList",
	props: { ctx: {} },
	setup(e) {
		let t = e.ctx, n = tI(t), r = /* @__PURE__ */ z("");
		async function i() {
			return JSON.stringify(iF(await cF(t)), null, 2);
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
		return (e, t) => (G(), K("div", null, [
			(G(!0), K(W, null, Oa(B(n), (e) => (G(), K("section", {
				key: e.id,
				class: "probe"
			}, [
				J("div", HI, [J("h3", UI, F(e.title), 1), J("span", {
					class: "trpg-badge",
					"data-status": B(tF)[e.id]?.status ?? "idle"
				}, F(B(tF)[e.id]?.status ?? "待测"), 9, WI)]),
				J("p", GI, F(e.hint), 1),
				B(tF)[e.id] ? (G(), K("p", KI, F(B(tF)[e.id].summary), 1)) : X("", !0),
				J("div", qI, [(G(!0), K(W, null, Oa(e.actions, (e) => (G(), K("button", {
					key: e.label,
					class: "trpg-btn",
					type: "button",
					onClick: (t) => e.run()
				}, F(e.label), 9, JI))), 128))]),
				B(tF)[e.id]?.detail === void 0 ? X("", !0) : (G(), K("details", YI, [t[2] ||= J("summary", null, "详情", -1), J("pre", null, F(JSON.stringify(B(tF)[e.id].detail, null, 2)), 1)]))
			]))), 128)),
			Y(VI),
			J("div", XI, [
				J("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: t[0] ||= (e) => a()
				}, "复制测试报告"),
				J("button", {
					class: "trpg-btn",
					type: "button",
					onClick: t[1] ||= (e) => o()
				}, "保存报告到扩展设置"),
				J("span", ZI, F(r.value), 1)
			])
		]));
	}
}), $I = {
	key: 0,
	class: "page-stack"
}, eL = { class: "trpg-list" }, tL = { class: "trpg-row" }, nL = { class: "trpg-row" }, rL = { class: "trpg-row__main" }, iL = { class: "trpg-row__meta" }, aL = { key: 1 }, oL = {
	key: 0,
	class: "trpg-diag",
	"data-testid": "diagnostics"
}, sL = {
	key: 1,
	class: "page-stack"
}, cL = { class: "trpg-group" }, lL = /* @__PURE__ */ H({
	__name: "SettingsView",
	setup(e) {
		let t = Nr("stCtx"), n = /* @__PURE__ */ z(null), r = Dx();
		return da(() => void (r.booted && r.refreshSettings().catch((e) => console.error("[trpg-assistant] 读取设置失败", e)))), (e, r) => n.value === null ? (G(), K("div", $I, [J("ul", eL, [J("li", tL, [r[4] ||= J("div", { class: "trpg-row__main" }, [J("div", { class: "trpg-row__title" }, "诊断"), J("div", { class: "trpg-row__meta" }, "自检与兼容性测试，遇到问题时用来收集信息")], -1), J("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[0] ||= (e) => n.value = "diag"
		}, [r[3] ||= Rs("打开", -1), Y(wS, {
			name: "caret-right",
			size: 14
		})])]), J("li", nL, [J("div", rL, [r[5] ||= J("div", { class: "trpg-row__title" }, "关于", -1), J("div", iL, "版本 " + F(B(qb)) + " · 开源许可与致谢", 1)]), J("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[1] ||= (e) => n.value = "about"
		}, [r[6] ||= Rs("打开", -1), Y(wS, {
			name: "caret-right",
			size: 14
		})])])])])) : (G(), K("div", aL, [J("button", {
			class: "subpage-back",
			type: "button",
			onClick: r[2] ||= (e) => n.value = null
		}, [Y(wS, {
			name: "caret-left",
			size: 16
		}), r[7] ||= Rs("设置", -1)]), n.value === "diag" ? (G(), K("div", oL, [B(t) ? (G(), q(QI, {
			key: 0,
			ctx: B(t)
		}, null, 8, ["ctx"])) : X("", !0)])) : (G(), K("div", sL, [
			J("h2", cL, "TRPG 跑团助手 " + F(B(qb)), 1),
			r[8] ||= J("p", { class: "page-intro" }, "代码以 AGPL-3.0 许可发布，源码在 GitHub：didhogg/tavern-trpg-assistant。", -1),
			r[9] ||= J("p", { class: "page-intro" }, "界面图标：Phosphor Icons（MIT）。规则数据的来源与许可见各条目的出处标注与随包附带的数据声明。", -1)
		]))]));
	}
}), uL = { class: "trpg-head__chips" }, dL = { class: "trpg-chip__name" }, fL = /* @__PURE__ */ H({
	__name: "HeaderChips",
	props: { layout: {} },
	setup(e) {
		let t = e, n = Dx(), r = kx(), i = cS(), a = dS(), o = Z(() => n.booted && r.hasCampaign), s = Z(() => [...o.value ? [{
			key: "saves",
			label: "存档"
		}] : [], {
			key: "close",
			label: "收起助手"
		}]), c = Z(() => r.currentSave?.name ?? "存档");
		function l(e) {
			e === "saves" ? IP() : a.windowOpen = !1;
		}
		let u = () => i.info("另一个窗口正在使用这份数据，这里只能查看");
		return (e, n) => (G(), K("div", uL, [o.value ? (G(), K(W, { key: 0 }, [
			t.layout === "narrow" ? X("", !0) : (G(), K("button", {
				key: 0,
				class: "trpg-pill trpg-chip",
				type: "button",
				"data-testid": "save-chip",
				"aria-haspopup": "dialog",
				onClick: n[0] ||= (...e) => B(IP) && B(IP)(...e)
			}, [J("span", dL, F(c.value), 1), Y(wS, {
				name: "caret-down",
				size: 14
			})])),
			B(r).dirty && !B(r).readOnly ? (G(), K("button", {
				key: 1,
				class: "trpg-btn trpg-btn--small trpg-btn--primary",
				type: "button",
				"data-testid": "save-button",
				onClick: n[1] ||= (e) => B(RP)()
			}, "● 保存存档")) : X("", !0),
			B(r).readOnly ? (G(), K("button", {
				key: 2,
				class: "trpg-badge trpg-badge--button",
				"data-tone": "warn",
				type: "button",
				onClick: u
			}, "只读")) : X("", !0)
		], 64)) : X("", !0), t.layout === "narrow" ? (G(), q(WM, {
			key: 1,
			label: "助手",
			items: s.value,
			onSelect: l
		}, null, 8, ["items"])) : X("", !0)]));
	}
}), pL = "trpg-assistant:window";
function mL(e, t, n) {
	let r = Math.min(Math.max(e.w, 360), Math.max(360, t)), i = Math.min(Math.max(e.h, 480), Math.max(480, n));
	return {
		w: r,
		h: i,
		x: Math.min(Math.max(e.x, 0), Math.max(0, t - r)),
		y: Math.min(Math.max(e.y, 0), Math.max(0, n - i))
	};
}
function hL(e, t) {
	let n = Math.min(960, e - 32), r = Math.min(640, t - 32);
	return mL({
		w: n,
		h: r,
		x: Math.round((e - n) / 2),
		y: Math.round((t - r) / 2)
	}, e, t);
}
function gL(e, t) {
	try {
		let n = localStorage.getItem(pL);
		if (n) {
			let r = JSON.parse(n);
			if ([
				r.x,
				r.y,
				r.w,
				r.h
			].every(Number.isFinite)) return mL(r, e, t);
		}
	} catch (e) {
		console.warn("[trpg-assistant] 读取窗口位置失败", e);
	}
	return hL(e, t);
}
function _L(e) {
	try {
		localStorage.setItem(pL, JSON.stringify(e));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/MainWindow.vue?vue&type=script&setup=true&lang.ts
var vL = ["data-layout", "data-fullscreen"], yL = ["inert"], bL = {
	key: 0,
	class: "trpg-side",
	"aria-label": "主导航"
}, xL = {
	key: 0,
	class: "trpg-side__name"
}, SL = { class: "trpg-side__list" }, CL = [
	"aria-current",
	"title",
	"onClick"
], wL = { key: 0 }, TL = { class: "trpg-side__list trpg-side__bottom" }, EL = [
	"aria-current",
	"title",
	"onClick"
], DL = { key: 0 }, OL = { class: "trpg-main" }, kL = { class: "trpg-head__title" }, AL = { class: "trpg-body" }, jL = {
	class: "trpg-content",
	tabindex: "-1"
}, ML = ["aria-pressed"], NL = {
	key: 0,
	class: "trpg-tabs",
	"aria-label": "主导航"
}, PL = ["aria-current", "onClick"], FL = /* @__PURE__ */ H({
	__name: "MainWindow",
	setup(e) {
		let t = dS(), n = pC(), r = Z(() => [{
			id: "home",
			label: "首页",
			icon: "house"
		}, {
			id: "settings",
			label: "设置",
			icon: "gear",
			bottom: !0
		}]), i = {
			home: eF,
			settings: lL
		}, a = /* @__PURE__ */ z(window.innerWidth), o = /* @__PURE__ */ z(window.innerHeight), s = /* @__PURE__ */ z(gL(a.value, o.value)), c = /* @__PURE__ */ z(null), l = /* @__PURE__ */ z(s.value.w), u = Z(() => a.value <= 480), d = Z(() => l.value >= 720 ? "wide" : l.value > 480 ? "mid" : "narrow"), f = Z(() => u.value ? {} : {
			left: `${s.value.x}px`,
			top: `${s.value.y}px`,
			width: `${s.value.w}px`,
			height: `${s.value.h}px`
		}), p = Z(() => uS[t.page]), m = Z(() => r.value.filter((e) => !e.bottom)), h = Z(() => r.value.filter((e) => e.bottom)), g = OS({
			position: Z({
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
			onEnd: () => _L(s.value)
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
				t.removeEventListener("pointermove", c), t.removeEventListener("pointerup", l), t.removeEventListener("pointercancel", l), _L(s.value);
			};
			t.addEventListener("pointermove", c), t.addEventListener("pointerup", l), t.addEventListener("pointercancel", l);
		}
		function y() {
			a.value = window.innerWidth, o.value = window.innerHeight, s.value = mL(s.value, a.value, o.value);
		}
		function b(e) {
			(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s" && (e.preventDefault(), RP());
		}
		let x;
		return da(() => {
			window.addEventListener("resize", y), x = new ResizeObserver((e) => {
				let t = e[0]?.contentRect.width;
				t && (l.value = t);
			}), c.value && x.observe(c.value);
		}), ma(() => {
			window.removeEventListener("resize", y), x?.disconnect();
		}), (e, a) => (G(), K("section", {
			ref_key: "winEl",
			ref: c,
			class: "trpg-window",
			style: Te(f.value),
			"data-layout": d.value,
			"data-fullscreen": u.value,
			role: "dialog",
			"aria-label": "TRPG 跑团助手",
			onKeydown: b
		}, [
			J("div", {
				class: "trpg-shell",
				inert: B(n).isOpen
			}, [d.value === "narrow" ? X("", !0) : (G(), K("nav", bL, [
				J("div", {
					class: "trpg-side__brand",
					title: "拖动窗口",
					onPointerdown: _
				}, [Y(wS, {
					name: "dice-five",
					size: 22
				}), d.value === "wide" ? (G(), K("span", xL, "TRPG 跑团助手")) : X("", !0)], 32),
				J("ul", SL, [(G(!0), K(W, null, Oa(m.value, (e) => (G(), K("li", { key: e.id }, [J("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": B(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => B(t).go(e.id)
				}, [Y(wS, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (G(), K("span", wL, F(e.label), 1)) : X("", !0)], 8, CL)]))), 128))]),
				J("ul", TL, [(G(!0), K(W, null, Oa(h.value, (e) => (G(), K("li", { key: e.id }, [J("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": B(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => B(t).go(e.id)
				}, [Y(wS, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (G(), K("span", DL, F(e.label), 1)) : X("", !0)], 8, EL)]))), 128))])
			])), J("div", OL, [
				J("header", {
					class: "trpg-head",
					title: "拖动窗口",
					onPointerdown: _
				}, [
					J("h1", kL, F(p.value), 1),
					Y(fL, { layout: d.value }, null, 8, ["layout"]),
					d.value === "narrow" ? X("", !0) : (G(), K("button", {
						key: 0,
						class: "trpg-icon-btn",
						type: "button",
						"aria-label": "收起助手",
						onClick: a[0] ||= (e) => B(t).windowOpen = !1
					}, [Y(wS, {
						name: "x",
						size: 18
					})]))
				], 32),
				J("div", AL, [J("main", jL, [(G(), q(wa(i[B(t).page])))]), J("button", {
					class: "trpg-dice-btn",
					type: "button",
					"aria-label": "掷骰",
					"aria-pressed": B(t).diceOpen,
					onClick: a[1] ||= (e) => B(t).diceOpen = !B(t).diceOpen
				}, [Y(wS, {
					name: "dice-five",
					size: 28
				})], 8, ML)]),
				d.value === "narrow" ? (G(), K("nav", NL, [(G(!0), K(W, null, Oa(r.value, (e) => (G(), K("button", {
					key: e.id,
					class: "trpg-tab",
					type: "button",
					"aria-current": B(t).page === e.id ? "page" : void 0,
					onClick: (n) => B(t).go(e.id)
				}, [Y(wS, {
					name: e.icon,
					size: 22
				}, null, 8, ["name"]), J("span", null, F(e.label), 1)], 8, PL))), 128))])) : X("", !0)
			])], 8, yL),
			Y(bC),
			u.value ? X("", !0) : (G(), K("div", {
				key: 0,
				class: "trpg-resize",
				"aria-hidden": "true",
				onPointerdown: v
			}, null, 32))
		], 44, vL));
	}
}), IL = { class: "trpg-root" }, LL = /* @__PURE__ */ H({
	__name: "App",
	props: {
		ctx: {},
		portalTarget: {}
	},
	setup(e) {
		let t = e;
		Mr("portalTarget", t.portalTarget), Mr("stCtx", t.ctx);
		let n = dS();
		return (e, t) => (G(), K("div", IL, [
			Y(fC),
			B(n).windowOpen ? (G(), q(FL, { key: 0 })) : X("", !0),
			Y(lC),
			Y(gS)
		]));
	}
}), RL = ".trpg-btn{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);min-height:36px;color:var(--ink);font:inherit;cursor:pointer;white-space:nowrap;justify-content:center;align-items:center;gap:6px;padding:4px 14px;display:inline-flex}.trpg-btn:hover:not(:disabled){border-color:var(--primary)}.trpg-btn:disabled{opacity:.5;cursor:not-allowed}.trpg-btn--primary{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-btn--danger{background:var(--danger);color:#fffcf6;border-color:var(--danger)}.trpg-btn--quiet{background:0 0;border-color:#0000}.trpg-btn--small{min-height:30px;padding:2px 10px;font-size:13px}.trpg-icon-btn{border-radius:var(--radius-sm);min-width:36px;min-height:36px;color:inherit;cursor:pointer;background:0 0;border:1px solid #0000;justify-content:center;align-items:center;display:inline-flex}.trpg-icon-btn:hover{border-color:currentColor}.trpg-input{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);padding:4px 10px}.trpg-input:disabled{opacity:.6}textarea.trpg-input{resize:vertical;min-height:72px}.trpg-field{gap:4px;display:grid}.trpg-field__label{color:var(--ink-2);font-size:13px}.trpg-field__hint{color:var(--ink-2);font-size:12.5px}.trpg-field__error{color:var(--danger);font-size:12.5px}.trpg-select-trigger{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);cursor:pointer;justify-content:space-between;align-items:center;gap:8px;padding:4px 10px;display:inline-flex}.trpg-select-content,.trpg-menu{min-width:var(--reka-select-trigger-width,160px);background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);box-shadow:var(--shadow-float);z-index:100003;color:var(--ink)}.trpg-select-content{max-height:min(8 * 36px, var(--reka-select-content-available-height));overflow:hidden}.trpg-select-viewport{max-height:inherit;padding:4px;overflow-y:auto}.trpg-select-item,.trpg-menu__item{border-radius:var(--radius-xs);cursor:pointer;min-height:40px;color:var(--ink);justify-content:space-between;align-items:center;gap:12px;padding:4px 10px;display:flex}.trpg-menu{min-width:168px;padding:4px}.trpg-select-item[data-highlighted],.trpg-menu__item[data-highlighted]{background:var(--panel);outline:none}.trpg-select-item[data-state=checked]{color:var(--primary);font-weight:600}.trpg-menu__item--danger{color:var(--danger)}.trpg-menu__item[data-disabled]{opacity:.5;cursor:not-allowed}.trpg-menu__reason{color:var(--ink-2);font-size:12px}.trpg-seg{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);display:inline-flex;overflow:hidden}.trpg-seg button{min-height:34px;color:var(--ink);background:0 0;border:0;padding:2px 14px}.trpg-seg button+button{border-left:1px solid var(--line)}.trpg-seg button[aria-pressed=true]{background:var(--primary);color:var(--primary-ink)}.trpg-badge{border-radius:var(--radius-xs);background:var(--panel);border:1px solid var(--line);color:var(--ink-2);white-space:nowrap;padding:0 8px;font-size:12px;font-weight:600;line-height:20px;display:inline-block}.trpg-badge[data-tone=gold]{color:var(--ink);border-color:var(--gold);background:color-mix(in srgb, var(--gold) 28%, transparent)}.trpg-badge[data-tone=ok],.trpg-badge[data-status=pass]{color:var(--ok);border-color:var(--ok)}.trpg-badge[data-tone=danger],.trpg-badge[data-status=fail],.trpg-badge[data-status=error]{color:var(--danger);border-color:var(--danger)}.trpg-badge[data-tone=warn],.trpg-badge[data-status=waiting]{color:var(--unsaved);border-color:var(--unsaved)}.trpg-badge[data-tone=gold]{color:var(--gold);border-color:var(--gold)}.trpg-pill{border:1px solid var(--line);background:var(--card);border-radius:999px;align-items:center;gap:4px;min-height:30px;padding:0 12px;display:inline-flex}.trpg-switch-wrap{color:var(--ink-2);align-items:center;gap:6px;min-height:44px;display:inline-flex}.trpg-switch{border:2px solid var(--line);background:0 0;border-radius:999px;width:42px;height:24px;padding:0;transition:background .16s,border-color .16s;position:relative}.trpg-switch__thumb{background:var(--ink-2);border-radius:50%;width:16px;height:16px;transition:transform .16s,background .16s;position:absolute;top:2px;left:2px}.trpg-switch[data-on=true]{background:var(--primary);border-color:var(--primary)}.trpg-switch[data-on=true] .trpg-switch__thumb{background:var(--primary-ink);transform:translate(18px)}.trpg-switch:disabled{opacity:.55;cursor:not-allowed}.trpg-check{cursor:pointer;align-items:center;gap:8px;min-height:36px;display:inline-flex}.trpg-check[data-disabled=true]{opacity:.6;cursor:not-allowed}.trpg-check input{width:18px;height:18px;accent-color:var(--primary);flex:none;margin:0}.trpg-term{color:var(--ink);text-align:left;text-underline-offset:4px;cursor:pointer;background:0 0;border:0;padding:0;-webkit-text-decoration:underline dotted;text-decoration:underline dotted;text-decoration-thickness:1.5px;display:inline}.trpg-term:hover,.trpg-term:focus-visible{text-decoration-style:solid;-webkit-text-decoration-color:var(--gold);text-decoration-color:var(--gold)}.trpg-list{margin:0;padding:0;list-style:none}.trpg-row{border-bottom:1px solid var(--line);align-items:center;gap:12px;min-height:52px;padding:6px 4px;display:flex}.trpg-row__main{flex:1;min-width:0}.trpg-row__title{overflow-wrap:anywhere;font-weight:600}.trpg-row__meta{color:var(--ink-2);font-size:12.5px}.trpg-row__end{flex:none;align-items:center;gap:8px;display:flex}.trpg-group{font-family:var(--font-serif);color:var(--ink-2);margin:16px 0 4px;font-size:15px}.trpg-skeleton{background:linear-gradient(90deg, var(--panel), var(--line), var(--panel));opacity:.6;border-radius:4px;height:14px}.trpg-empty{text-align:center;color:var(--ink-2);padding:24px 8px}.trpg-progress{background:var(--panel);border-radius:3px;width:120px;height:6px;overflow:hidden}.trpg-progress>span{background:var(--primary);height:100%;transition:width .2s;display:block}.trpg-icon{vertical-align:-3px;flex:none}.trpg-toasts{left:50%;bottom:max(16px, env(safe-area-inset-bottom));z-index:100005;gap:8px;width:min(92vw,420px);display:grid;position:fixed;transform:translate(-50%)}.trpg-toast{border-radius:var(--radius-sm);background:var(--chrome);color:var(--chrome-ink);border-left:4px solid var(--gold);box-shadow:var(--shadow-float);align-items:center;gap:10px;padding:10px 12px;display:flex}.trpg-toast[data-kind=error]{border-left-color:var(--danger)}.trpg-toast[data-kind=success]{border-left-color:var(--ok)}.trpg-toast__text{flex:1}.trpg-toast button{color:var(--gold);background:0 0;border:0;min-height:32px;padding:0 8px;font-weight:600}@media (width<=480px){.trpg-toasts{bottom:calc(64px + env(safe-area-inset-bottom))}}.trpg-toast-enter-from,.trpg-toast-leave-to{opacity:0;transform:translateY(8px)}.trpg-toast-enter-active,.trpg-toast-leave-active{transition:opacity .16s,transform .16s}.trpg-modal-root{display:contents}.trpg-modal{background:var(--scrim);z-index:20;justify-content:center;align-items:center;padding:16px;display:flex;position:absolute;inset:0}.trpg-modal__card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:min(640px,100%);height:min(80%,640px);box-shadow:var(--shadow-float);flex-direction:column;animation:.16s ease-out trpg-pop;display:flex;overflow:hidden}.trpg-modal[data-variant=drawer]{justify-content:flex-end;padding:0}.trpg-modal[data-variant=drawer] .trpg-modal__card{border-radius:0;width:min(440px,100%);height:100%;animation:.2s ease-out trpg-slide}.trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true]{width:min(var(--trpg-drawer-width,440px), 100%)}.trpg-modal[data-variant=confirm] .trpg-modal__card{width:min(440px,100%);height:auto;max-height:90%}.trpg-modal[data-variant=confirm] .trpg-modal__page{position:relative}.trpg-modal__card:has(.trpg-library-card){width:min(1180px,100%);height:92%}.trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true]{width:min(var(--trpg-drawer-width,640px), 100%);height:min(86%, var(--trpg-dlg-h,800px));background:var(--card);border-radius:16px}.trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__page{flex-direction:column;padding:0;display:flex;overflow:hidden}.trpg-modal__head{border-bottom:1px solid var(--line);background:var(--panel);flex:none;align-items:center;gap:8px;min-height:52px;padding:4px 8px 4px 16px;display:flex}.trpg-modal__title{min-width:0;font-family:var(--font-serif);text-overflow:ellipsis;white-space:nowrap;flex:1;margin:0;font-size:17px;overflow:hidden}.trpg-modal__back{border-radius:var(--radius-sm);max-width:40%;min-height:36px;color:var(--primary);white-space:nowrap;background:0 0;border:0;align-items:center;gap:2px;margin-left:-8px;padding:0 8px;display:inline-flex}.trpg-modal__back span{text-overflow:ellipsis;overflow:hidden}.trpg-modal__back:hover{background:var(--card)}.trpg-modal__pages{flex:1;min-height:0;position:relative}.trpg-modal__page{padding:16px;transition:opacity .16s,transform .16s,visibility;position:absolute;inset:0;overflow:auto}.trpg-modal__page.is-under{opacity:0;visibility:hidden;transition:opacity .16s,transform .16s,visibility 0s .16s;transform:translate(-24px)}.trpg-page-enter-from,.trpg-page-leave-to{opacity:0;transform:translate(24px)}.trpg-page-enter-active,.trpg-page-leave-active{transition:opacity .16s,transform .16s}.trpg-modal[data-variant=confirm] .trpg-page-leave-active{position:absolute;inset:0}@keyframes trpg-pop{0%{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}@keyframes trpg-slide{0%{opacity:0;transform:translate(32px)}to{opacity:1;transform:none}}.trpg-confirm{gap:12px;display:grid}.trpg-confirm__message{margin:0}.trpg-confirm__details{color:var(--ink-2);margin:0;padding-left:18px}.trpg-confirm__actions{justify-content:flex-end;gap:8px;margin-top:4px;display:flex}.trpg-window[data-layout=narrow] .trpg-modal{background:var(--paper);align-items:stretch;padding:0}.trpg-window[data-layout=narrow] .trpg-modal__card{border:0;border-radius:0;width:100%;height:100%}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer]:has(.trpg-modal__card[data-sized=true]){background:var(--scrim);align-items:flex-end}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true]{border:1px solid var(--line);border-radius:var(--radius) var(--radius) 0 0;width:100%;height:92%}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true] .trpg-modal__head{background:var(--panel);min-height:56px;color:var(--ink);padding-top:10px;position:relative}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true] .trpg-modal__head:before{content:\"\";background:var(--line);border-radius:2px;width:36px;height:4px;position:absolute;top:6px;left:50%;transform:translate(-50%)}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=drawer] .trpg-modal__card[data-sized=true] .trpg-modal__back{color:var(--primary)}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog]:has(.trpg-modal__card[data-sized=true]){background:var(--scrim);align-items:flex-end}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true]{border:1px solid var(--line);border-radius:16px 16px 0 0;width:100%;height:92%;animation:.2s ease-out trpg-sheet}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__head{background:var(--card);min-height:56px;color:var(--ink);border-bottom:1px solid var(--line);padding-top:10px;position:relative}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__head:before{content:\"\";background:var(--line);border-radius:2px;width:36px;height:4px;position:absolute;top:6px;left:50%;transform:translate(-50%)}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__back{color:var(--primary)}@keyframes trpg-sheet{0%{opacity:0;transform:translateY(100%)}to{opacity:1;transform:none}}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm]{background:var(--scrim);align-items:flex-end}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm] .trpg-modal__card{border-radius:var(--radius) var(--radius) 0 0;height:auto}.trpg-window[data-layout=narrow] .trpg-confirm__actions{flex-direction:column-reverse}.trpg-window[data-layout=narrow] .trpg-confirm__actions .trpg-btn{min-height:44px}.trpg-window[data-layout=narrow] .trpg-modal__card:has(.trpg-library-card){width:min(1180px,100%);height:92%}.trpg-modal__card:has(.trpg-library-card) .trpg-modal__page{padding:0}.trpg-modal__head{background:var(--chrome);min-height:48px;color:var(--chrome-ink);border-bottom:0}.trpg-window[data-layout=narrow] .trpg-modal__back{color:var(--gold)}.trpg-window[data-layout=narrow] .trpg-modal__back,.trpg-window[data-layout=narrow] .trpg-modal__close{min-width:44px;min-height:44px}.trpg-drawer{align-content:start;gap:14px;min-height:100%;display:grid}.trpg-drawer__current{border-bottom:1px solid var(--line);gap:8px;padding-bottom:12px;display:grid}.trpg-drawer__name{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-drawer__title{font-family:var(--font-serif);overflow-wrap:anywhere;font-size:20px;font-weight:600}.trpg-drawer__buttons{flex-wrap:wrap;gap:8px;display:flex}.trpg-drawer__filter{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-drawer__filter .trpg-input{flex:1;min-width:140px}.trpg-drawer__bottom{border-top:1px solid var(--line);background:var(--paper);justify-content:space-between;gap:8px;margin:0 -16px -16px;padding:12px 16px;display:flex;position:sticky;bottom:-16px}.trpg-warn{color:var(--unsaved)}.trpg-saves{margin:0;padding:0;list-style:none}.trpg-save{border-bottom:1px solid var(--line);align-items:flex-start;gap:8px;padding:10px 4px;display:flex}.trpg-save[data-current=true]{background:color-mix(in srgb, var(--gold) 14%, transparent)}.trpg-save__main{flex:1;gap:2px;min-width:0;display:grid}.trpg-save__top{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.trpg-save__name{overflow-wrap:anywhere;font-weight:600}.trpg-save__time{color:var(--ink-2);margin-left:auto;font-size:12.5px}.trpg-save__rename{flex:1;min-height:32px}.trpg-save__noteedit{gap:6px;display:grid}.trpg-save__noteactions{justify-content:flex-end;gap:6px;display:flex}.trpg-folds{gap:6px;display:grid}.trpg-folds__tabs{flex-wrap:wrap;gap:4px;display:flex}.trpg-popover{z-index:100003;background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);width:min(320px,92vw);box-shadow:var(--shadow-float);padding:12px}.trpg-confirm__actions--stack{flex-wrap:wrap;justify-content:flex-end}.trpg-import__ok{color:var(--ok);margin:0;font-weight:600}.trpg-compare{border-collapse:collapse;width:100%;font-size:13px}.trpg-compare th,.trpg-compare td{border-bottom:1px solid var(--line);text-align:left;padding:4px 8px;font-weight:400}.trpg-compare thead th{color:var(--ink-2)}.trpg-window[data-layout=narrow] .trpg-confirm__actions--stack{flex-direction:column-reverse}.trpg-window[data-layout=narrow] .trpg-confirm__actions--stack .trpg-btn{min-height:44px}.trpg-wizard{flex-direction:column;min-height:100%;display:flex}.trpg-wizard__body{flex:1;padding:8px 0 16px}.trpg-wizard__foot{border-top:1px solid var(--line);background:var(--paper);justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:12px 16px;display:flex;position:sticky;bottom:-16px}.trpg-steps{gap:4px;margin:0;padding:0;list-style:none;display:flex}.trpg-steps li{flex:1}.trpg-steps button{border:0;border-bottom:2px solid var(--line);width:100%;min-height:36px;color:var(--ink-2);background:0 0;justify-content:center;align-items:center;gap:6px;padding:0 6px;display:flex}.trpg-steps button:disabled{cursor:default}.trpg-steps li[data-state=current] button{color:var(--primary);border-bottom-color:var(--primary);font-weight:600}.trpg-steps li[data-state=done] button{color:var(--ink);border-bottom-color:var(--gold);cursor:pointer}.trpg-steps li[data-skipped=true] button{opacity:.45}.trpg-steps__n{border:1px solid;border-radius:50%;place-items:center;width:20px;height:20px;font-size:12px;display:inline-grid}.trpg-steps__compact{color:var(--ink-2);margin:0;font-size:13px;display:none}.trpg-window[data-layout=narrow] .trpg-steps{display:none}.trpg-window[data-layout=narrow] .trpg-steps__compact{display:block}.trpg-step-title{font-family:var(--font-serif);margin:0;font-size:17px}.trpg-step-head{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;display:flex}.trpg-step-actions{gap:6px;display:inline-flex}.trpg-rulecards{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;display:grid}.trpg-rulecard{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow-card);cursor:pointer;gap:10px;padding:14px;display:flex}.trpg-rulecard[aria-checked=true]{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary), var(--shadow-card)}.trpg-rulecard[data-status=coming]{opacity:.55;cursor:default}.trpg-rulecard__mark{color:var(--primary);font-size:18px;line-height:1.3}.trpg-rulecard__body{justify-items:start;gap:4px;display:grid}.trpg-radio{cursor:pointer}.trpg-radio input{width:18px;height:18px;accent-color:var(--primary)}.trpg-detail-links{gap:6px;margin:0;padding:0;list-style:none;display:grid}.trpg-info__line{margin:0}.trpg-vlist{height:100%;min-height:160px;position:relative;overflow-y:auto}.trpg-vlist__space{position:relative}.trpg-vlist__row{border-bottom:1px solid var(--line);align-items:center;gap:10px;padding:0 4px;display:flex;position:absolute;left:0;right:0}.trpg-blocks{gap:8px;display:grid}.trpg-blocks__p{margin:0}.trpg-blocks__h h4{font-family:var(--font-serif);margin:8px 0 4px;font-size:15px}.trpg-blocks__list{margin:0;padding-left:20px}.trpg-blocks__table{overflow-x:auto}.trpg-blocks__table table{border-collapse:collapse;min-width:100%;font-size:13px}.trpg-blocks__table th,.trpg-blocks__table td{border:1px solid var(--line);text-align:left;padding:4px 8px}.trpg-blocks__table caption{text-align:left;padding:4px 0;font-weight:600}.trpg-blocks__quote{border-left:3px solid var(--gold);color:var(--ink-2);margin:0;padding-left:12px}.trpg-blocks__read{background:var(--panel);border-radius:var(--radius-sm);padding:8px 12px}.trpg-blocks__mark{color:var(--primary)}.trpg-variantbar{border:1px solid var(--gold);border-radius:var(--radius-sm);background:color-mix(in srgb, var(--gold) 12%, transparent);flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;display:flex}.trpg-variantbar__text{flex:1;min-width:200px}.trpg-variantbar__actions{gap:6px;display:flex}.trpg-variantpick{border:0;gap:6px;margin:0;padding:0;display:grid}.trpg-variantpick .trpg-radio{align-items:flex-start;gap:8px;min-height:36px;display:flex}.trpg-pack-actions{align-items:center;gap:6px;display:inline-flex}.trpg-packdetail{flex-direction:column;gap:10px;height:100%;display:flex}.trpg-packdetail__desc{margin:0}.trpg-packdetail__filter{grid-template-columns:minmax(140px,200px) 1fr auto;align-items:center;gap:8px;display:grid}.trpg-packdetail__list{flex:1;min-height:200px}.trpg-entryrow{flex:1;align-items:baseline;gap:10px;min-width:0;display:flex}.trpg-entryrow .trpg-term{white-space:nowrap;flex:none}.trpg-entryrow__sum{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.trpg-entry__summary{color:var(--ink-2);margin:0}.trpg-entry__lore{gap:6px;display:grid}.trpg-entry__lore-title{font-family:var(--font-serif);margin:8px 0 0;font-size:15px}.trpg-window[data-layout=narrow] .trpg-packdetail__filter{grid-template-columns:1fr}.trpg-modal__page:has(.trpg-packdetail){flex-direction:column;display:flex;overflow:hidden}.trpg-toolbar{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-toolbar__search{flex:1;min-width:160px;max-width:280px}.trpg-pill[aria-pressed=true]{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-row--series{background:var(--panel);min-height:36px}.trpg-row--nested{padding-left:20px}.trpg-packdetail{flex:1;min-height:0}.trpg-issuerow{border:1px solid var(--unsaved);border-radius:var(--radius-sm);background:color-mix(in srgb, var(--unsaved) 12%, transparent);justify-content:space-between;align-items:center;gap:8px;padding:8px 12px;display:flex}.trpg-variantrow{margin-top:8px}.trpg-group--first{margin-top:0}.trpg-row__end--select{width:180px}.trpg-row__end--wrap{flex-wrap:wrap;justify-content:flex-end}.trpg-toolbar--between{justify-content:space-between}.trpg-toolbar__end{align-items:center;gap:10px;display:inline-flex}.trpg-minesub{flex-direction:column;gap:10px;height:100%;min-height:420px;display:flex}.trpg-minesub__list{flex:1;min-height:220px}.trpg-drawer[data-dragging=true]:after{content:\"松开以导入\";z-index:5;border:2px dashed var(--primary);border-radius:var(--radius);background:color-mix(in srgb, var(--paper) 88%, transparent);color:var(--primary);place-items:center;font-weight:600;display:grid;position:absolute;inset:0}.trpg-drawer{position:relative}.trpg-combo__anchor{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);align-items:center;display:flex}.trpg-combo__input{min-width:0;min-height:36px;color:var(--ink);background:0 0;border:0;flex:1;padding:4px 10px}.trpg-combo__input:focus-visible{outline:none}.trpg-combo__anchor:focus-within{outline:2px solid var(--primary);outline-offset:1px}.trpg-combo__content{width:var(--reka-combobox-trigger-width);min-width:260px}.trpg-combo__count{border-bottom:1px solid var(--line);color:var(--ink-2);padding:6px 10px;font-size:12.5px}.trpg-combo__empty{color:var(--ink-2);padding:12px 10px}.trpg-tag{gap:2px;padding-right:2px}.trpg-tag__x{min-width:28px;min-height:28px;color:var(--ink-2);background:0 0;border:0;border-radius:999px;font-size:16px;line-height:1}.trpg-tag__x:hover{color:var(--danger)}.trpg-facts{grid-template-columns:max-content 1fr;gap:6px 14px;margin:0;display:grid}.trpg-facts__label{color:var(--ink-2);white-space:nowrap;padding-top:1px;font-size:13px}.trpg-facts__value{white-space:pre-line;overflow-wrap:anywhere;margin:0}.trpg-facts__sections,.trpg-facts__members{white-space:normal;gap:8px;display:grid}.trpg-facts__members h4{font-family:var(--font-serif);margin:0 0 2px;font-size:14px}.trpg-row__warn{color:var(--accent,#b45309)}.trpg-facts__sub{margin-left:4px;font-size:12px}.trpg-facts__member-row{flex-wrap:wrap;align-items:baseline;gap:2px 14px;display:flex}.trpg-facts__member-label{min-width:4.5em;font-weight:600}.trpg-facts__sections h4{font-family:var(--font-serif);margin:0 0 2px;font-size:14px}.trpg-window[data-layout=narrow] .trpg-facts{grid-template-columns:1fr;gap:2px}.trpg-window[data-layout=narrow] .trpg-facts__value{margin-bottom:8px}.trpg-modal[data-variant=dialog] .trpg-modal__card[data-sized=true] .trpg-modal__head{background:var(--card);min-height:52px;color:var(--ink);border-bottom:1px solid var(--line)}.trpg-tip{max-width:100%;display:inline-flex;position:relative}.trpg-tip.is-inline{display:inline}.trpg-tip__bubble{z-index:60;background:var(--ink);max-width:260px;color:var(--paper);text-align:left;white-space:pre-line;pointer-events:none;box-shadow:var(--shadow-float);border-radius:9px;gap:1px;padding:8px 11px;font-size:12.5px;line-height:1.5;animation:.12s ease-out trpg-tip;display:grid;position:fixed}.trpg-tip__line{font-variant-numeric:tabular-nums;display:block}@keyframes trpg-tip{0%{opacity:0}to{opacity:1}}.trpg-btabs{background:var(--panel);border-bottom:1px solid var(--line);scrollbar-width:none;flex:none;gap:2px;padding:8px 14px 0;display:flex;overflow-x:auto}.trpg-btabs::-webkit-scrollbar{display:none}.trpg-btabs__tab{min-height:40px;color:var(--ink-2);white-space:nowrap;background:0 0;border:1px solid #0000;border-bottom:0;border-radius:10px 10px 0 0;flex:none;align-items:center;gap:6px;margin-bottom:-1px;padding:0 16px;font-size:14px;font-weight:500;display:inline-flex}.trpg-btabs__tab:hover:not(:disabled){background:var(--card)}.trpg-btabs__tab[aria-selected=true]{background:var(--card);border-color:var(--line);color:var(--ink);padding-bottom:1px;font-weight:700}.trpg-btabs__tab:disabled{opacity:.45;cursor:not-allowed}.trpg-btabs__count{background:color-mix(in srgb, var(--ink) 12%, transparent);border-radius:999px;place-items:center;min-width:20px;height:20px;padding:0 6px;font-size:12px;font-weight:600;display:inline-grid}.trpg-item{border:1px solid var(--line);background:var(--card);border-radius:12px;gap:8px;padding:14px 16px;display:grid}.trpg-item__head{align-items:baseline;gap:8px;display:flex}.trpg-item__title{min-width:0;font:700 17px/1.3 var(--font-serif);flex:1;margin:0}.trpg-item__hint{min-width:24px;min-height:24px;color:var(--ink-2);place-items:center;display:inline-grid}button.trpg-rulelink.trpg-item__hint{appearance:none;cursor:pointer;background:0 0;border:0;border-radius:6px;padding:0}button.trpg-rulelink.trpg-item__hint:hover{color:var(--primary);background:var(--panel)}.trpg-item__value{font:700 24px/1 var(--font-serif);font-variant-numeric:tabular-nums}.trpg-item__auto{color:var(--ink-2);text-align:right;margin:0;font-size:12px}.trpg-item__sources{color:var(--ink-2);gap:2px;margin:0;padding:0;font-size:13px;list-style:none;display:grid}.trpg-item__sources li{align-items:baseline;gap:10px;min-width:0;display:flex}.trpg-item__sources li.is-overridden{opacity:.6;text-decoration:line-through}.trpg-item__label{flex:1;min-width:0}.trpg-item__num{font-variant-numeric:tabular-nums}.trpg-item__note{font-size:12px}.trpg-item__edit{flex-wrap:wrap;align-items:center;gap:10px 16px;display:flex}.trpg-stepper{justify-content:center;align-items:center;gap:10px;display:inline-flex}.trpg-stepper__btn{border:1px solid var(--line);background:var(--card);width:28px;height:28px;color:var(--ink);cursor:pointer;border-radius:50%;place-items:center;padding:0;display:inline-grid}.trpg-stepper__btn:hover:not(:disabled){border-color:var(--primary);color:var(--primary)}.trpg-stepper__btn:disabled{opacity:.35;cursor:not-allowed}.trpg-stepper__val{text-align:center;min-width:2ch;font:700 20px/1 var(--font-serif);font-variant-numeric:tabular-nums}.trpg-seg button:disabled{opacity:.4;cursor:not-allowed}", zL = ".probe{border-bottom:1px solid var(--line);padding:10px 0}.probe__head{justify-content:space-between;align-items:center;gap:8px;display:flex}.probe__title{font-family:var(--font-serif);margin:0;font-size:15px}.probe__hint{color:var(--ink-2);margin:4px 0;font-size:12.5px}.probe__summary{margin:4px 0}.probe__actions{flex-wrap:wrap;gap:6px;margin-top:6px;display:flex}.probe pre{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);white-space:pre-wrap;word-break:break-all;max-height:200px;margin:6px 0 0;padding:8px;font-size:11.5px;overflow:auto}.probe summary{cursor:pointer;color:var(--ink-2);font-size:12.5px}.lab{background:var(--panel);border-radius:var(--radius);gap:10px;margin-top:8px;padding:10px;display:grid}.lab__row{gap:6px;display:grid}.report-bar{flex-wrap:wrap;align-items:center;gap:8px;padding:10px 0;display:flex}", BL = ".trpg-btn,.trpg-icon-btn,.trpg-tabs2__tab,.trpg-person,.trpg-tplcard{transition:transform .16s cubic-bezier(0,0,.2,1),box-shadow .16s cubic-bezier(0,0,.2,1)}.trpg-btn:active:not(:disabled),.trpg-icon-btn:active:not(:disabled),.trpg-tabs2__tab:active,.trpg-tplcard:active{transition-duration:80ms;transform:scale(.97)}.trpg-tplcard:hover:not(:active){box-shadow:var(--shadow-card-hover);transform:translateY(-1px)}.trpg-person:hover{box-shadow:var(--shadow-card-hover)}@media (prefers-reduced-motion:reduce){.trpg-btn,.trpg-icon-btn,.trpg-tabs2__tab,.trpg-person,.trpg-tplcard{transition:none}.trpg-btn:active:not(:disabled),.trpg-icon-btn:active:not(:disabled),.trpg-tabs2__tab:active,.trpg-tplcard:active,.trpg-tplcard:hover:not(:active){transform:none}}.trpg-frame{width:var(--fw,72px);height:var(--fh,90px);border:1px solid var(--frame);background:var(--paper);border-radius:8px;flex:none;padding:1px;display:inline-block;position:relative}.trpg-frame__gold{border:2px solid var(--gold);background:var(--paper);border-radius:6px;width:100%;height:100%;padding:2px;display:block}.trpg-frame__pic{background:linear-gradient(180deg, var(--panel), var(--card));border-radius:3px;justify-content:center;align-items:center;width:100%;height:100%;display:flex;overflow:hidden}.trpg-frame__img{object-fit:cover;width:100%;height:100%;display:block}.trpg-frame__ph{width:var(--ficon,36px);height:var(--ficon,36px);fill:currentColor;color:color-mix(in srgb, var(--ink-2) 60%, transparent)}.trpg-frame__badge{border:1px solid var(--frame);background:var(--card);width:22px;height:22px;color:var(--ink);border-radius:50%;place-items:center;display:grid;position:absolute;bottom:-5px;right:-5px}.trpg-stat{text-align:center;font-variant-numeric:tabular-nums;display:block}.trpg-stat__label{width:100%;color:var(--ink-2);font-size:12px;line-height:16px;display:inline-block}.trpg-stat__sp{white-space:pre;font-size:0}.trpg-stat__value{font-family:var(--font-serif);color:var(--ink);font-size:24px;font-weight:700;line-height:30px;display:inline-block}.trpg-stat--md .trpg-stat__value{font-size:20px;font-weight:600;line-height:26px}.trpg-stat__unit{font-family:var(--font-sans);color:var(--ink-2);font-size:14px;font-weight:400}.trpg-hpm{font-variant-numeric:tabular-nums;width:100%;display:block}.trpg-hpm__top{align-items:baseline;gap:8px;margin-bottom:4px;display:flex}.trpg-hpm__top .trpg-stat__label{text-align:left;white-space:nowrap;flex:1 0 auto;width:auto}.trpg-hpm__num{font-family:var(--font-serif);color:var(--ink);white-space:nowrap;font-size:18px;font-weight:600;line-height:24px}.trpg-hpm__num b{font-weight:600}.trpg-hpm__num i{color:var(--ink-2);margin:0 3px;font-size:14px;font-style:normal}.trpg-hpm__num span{color:var(--ink-2);font-size:14px}.trpg-hpm__track{background:var(--hp-track);border-radius:4px;width:100%;height:8px;display:block;position:relative;overflow:hidden}.trpg-hpm__fill{background:var(--hp);border-radius:4px;position:absolute;inset:0 auto 0 0}.trpg-hpm__temp{background:var(--gold);position:absolute;top:0;bottom:0}.trpg-tabs2{background:var(--panel);scrollbar-width:none;border-radius:14px;gap:4px;max-width:100%;padding:4px;display:inline-flex;overflow-x:auto}.trpg-tabs2::-webkit-scrollbar{display:none}.trpg-tabs2__tab{height:44px;color:var(--ink);white-space:nowrap;background:0 0;border:0;border-radius:10px;flex:none;justify-content:center;align-items:center;gap:8px;padding:0 16px;font-size:15px;font-weight:600;display:inline-flex}.trpg-tabs2__tab:hover:not([aria-selected=true]){background:color-mix(in srgb, var(--card) 60%, transparent)}.trpg-tabs2__tab[aria-selected=true]{background:var(--primary);color:var(--primary-ink)}.trpg-tabs2__count{background:var(--card);min-width:22px;color:var(--ink-2);text-align:center;font-variant-numeric:tabular-nums;border-radius:999px;padding:0 7px;font-size:12px;font-weight:600;line-height:20px;display:inline-block}.trpg-tabs2__tab[aria-selected=true] .trpg-tabs2__count{background:color-mix(in srgb, var(--primary-ink) 22%, transparent);color:var(--primary-ink)}.trpg-search{min-width:0;color:var(--ink-2);flex:160px;align-items:center;display:flex;position:relative}.trpg-search>.trpg-icon{pointer-events:none;position:absolute;left:13px}.trpg-search__input{border:1px solid var(--line);background:var(--card);width:100%;height:40px;color:var(--ink);border-radius:10px;padding:0 36px 0 38px}.trpg-search__input::placeholder{color:var(--ink-2)}.trpg-search__input::-webkit-search-cancel-button{appearance:none;display:none}.trpg-search__input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb, var(--primary) 16%, transparent);outline:none}.trpg-search__clear{width:28px;height:28px;color:var(--ink-2);background:0 0;border:0;border-radius:50%;place-items:center;display:grid;position:absolute;right:6px}.trpg-search__clear:hover{background:var(--panel)}.trpg-search__clear:after{content:\"\";position:absolute;inset:-8px}.trpg-toolrow{flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:12px;display:flex}.trpg-toolrow .trpg-btn,.trpg-toolrow .trpg-select-trigger,.trpg-toolrow .trpg-combo__anchor{border-radius:10px;height:40px;min-height:40px}.trpg-toolrow .trpg-btn{padding:0 14px}.trpg-toolrow .trpg-btn--square{width:40px;padding:0}.trpg-toolrow__tag{flex:none;width:104px;min-width:0}.trpg-toolrow__sort{flex:none;width:164px;min-width:0}.trpg-toolrow__count{color:var(--ink-2);white-space:nowrap;font-variant-numeric:tabular-nums;margin-left:auto;font-size:13px}.trpg-select-trigger__text{white-space:nowrap;align-items:baseline;gap:2px;min-width:0;display:inline-flex;overflow:hidden}.trpg-select-trigger__prefix{color:var(--ink-2)}.trpg-toolrow__tag .trpg-combo__input::placeholder{color:var(--ink);opacity:1}.trpg-combo__anchor{border-radius:10px}.trpg-pill.trpg-tag{border-color:var(--line);background:var(--panel);min-height:26px;color:var(--ink);padding:0 2px 0 10px;font-size:12px}.trpg-tag__x{width:24px;min-width:24px;min-height:24px;position:relative}.trpg-tag__x:after{content:\"\";position:absolute;inset:-4px}.trpg-emptystate{color:color-mix(in srgb, var(--ink-2) 50%, transparent);text-align:center;justify-items:center;gap:12px;padding:48px 16px;display:grid}.trpg-emptystate__text{color:var(--ink-2);margin:0;font-size:15px}.trpg-emptystate .trpg-btn{color:var(--ink)}.trpg-modal__head{background:var(--paper);color:var(--ink)}.trpg-modal__title{font-size:20px;font-weight:700}.trpg-window[data-layout=narrow] .trpg-modal__head{background:var(--chrome);color:var(--chrome-ink)}.trpg-dialog{border:1px solid var(--line);background:var(--card);border-radius:12px;gap:12px;padding:16px;display:grid}.trpg-dialog__foot{justify-content:flex-end;gap:8px;padding-top:4px;display:flex}.trpg-dialog__foot .trpg-btn,.trpg-dialog .trpg-input,.trpg-dialog .trpg-select-trigger{border-radius:10px;min-height:40px}.trpg-btn--danger{color:var(--primary-ink)}.trpg-inline-confirm{border-left:3px solid var(--danger);background:var(--panel);border-radius:0 10px 10px 0;flex-wrap:wrap;align-items:center;gap:8px;min-height:44px;padding:8px 12px;display:flex}.trpg-inline-confirm>span:first-child{flex:200px}.trpg-mini{align-items:center;gap:12px;min-width:0;display:flex}.trpg-mini__main{flex:1;min-width:0}.trpg-mini__name{font-family:var(--font-serif);text-overflow:ellipsis;white-space:nowrap;font-size:16px;font-weight:700;display:block;overflow:hidden}.trpg-mini__sub{color:var(--ink-2);text-overflow:ellipsis;white-space:nowrap;font-size:13px;display:block;overflow:hidden}.trpg-mini__sub .is-strong{color:var(--ink);font-weight:600}@media (prefers-color-scheme:dark){.trpg-check input{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark}}", VL = ".trpg-root{z-index:100000;width:0;height:0;position:fixed;top:0;left:0}.trpg-ball{border:2px solid var(--gold);background:var(--chrome);width:48px;height:48px;color:var(--chrome-ink);cursor:grab;touch-action:none;border-radius:50%;place-items:center;padding:0;display:grid;position:fixed;box-shadow:0 2px 8px #00000059}.trpg-window{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow-float);color:var(--ink);position:fixed;overflow:hidden}.trpg-window[data-fullscreen=true]{border:0;border-radius:0;height:100dvh;inset:0}.trpg-shell{width:100%;height:100%;display:flex}.trpg-window[data-layout=narrow] .trpg-shell{padding-bottom:env(safe-area-inset-bottom);background:var(--paper);flex-direction:column}.trpg-window[data-fullscreen=true] .trpg-shell{padding-top:env(safe-area-inset-top);background:var(--chrome)}.trpg-side{background:var(--chrome);width:176px;color:var(--chrome-ink);flex-direction:column;flex:none;display:flex}.trpg-window[data-layout=mid] .trpg-side{width:56px}.trpg-side__brand{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;height:52px;font-family:var(--font-serif);border-bottom:1px solid var(--chrome-hover);color:var(--gold);align-items:center;gap:10px;padding:0 16px;font-size:16px;display:flex}.trpg-window[data-layout=mid] .trpg-side__brand{justify-content:center;padding:0}.trpg-side__list{gap:4px;margin:0;padding:8px;list-style:none;display:grid}.trpg-side__bottom{margin-top:auto}.trpg-nav{border-radius:var(--radius-sm);width:100%;min-height:44px;color:var(--chrome-ink);text-align:left;background:0 0;border:0;align-items:center;gap:12px;padding:0 12px;display:flex}.trpg-window[data-layout=mid] .trpg-nav{justify-content:center;padding:0}.trpg-nav:hover{background:var(--chrome-hover)}.trpg-nav[aria-current=page]{background:var(--chrome-hover);box-shadow:inset 3px 0 0 var(--gold)}.trpg-nav:focus-visible,.trpg-tab:focus-visible,.trpg-side__brand:focus-visible{outline-color:var(--gold)}.trpg-main{background:var(--paper);flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.trpg-head{border-bottom:1px solid var(--line);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;flex:none;align-items:center;gap:12px;height:52px;padding:0 12px 0 20px;display:flex}.trpg-head__title{font-family:var(--font-serif);flex:1;margin:0;font-size:19px;font-weight:600}.trpg-head__chips{align-items:center;gap:8px;display:flex}.trpg-content{outline:none;flex:1;min-height:0;padding:16px 20px 88px;position:relative;overflow:auto}.trpg-window[data-layout=narrow] .trpg-head{background:var(--chrome);height:48px;color:var(--chrome-ink);border-bottom:0;padding:0 8px 0 16px}.trpg-window[data-fullscreen=true] .trpg-head{cursor:default}.trpg-window[data-layout=narrow] .trpg-content{padding:12px 16px 88px}.trpg-tabs{background:var(--chrome);height:56px;color:var(--chrome-ink);flex:none;display:flex}.trpg-tab{min-width:64px;color:var(--chrome-ink);background:0 0;border:0;flex-direction:column;flex:1;justify-content:center;align-items:center;gap:2px;font-size:12px;display:flex}.trpg-tab[aria-current=page]{color:var(--gold);box-shadow:inset 0 3px 0 var(--gold)}.trpg-resize{cursor:nwse-resize;touch-action:none;z-index:30;background:linear-gradient(135deg, transparent 50%, var(--line) 50%, var(--line) 58%, transparent 58%, transparent 70%, var(--line) 70%, var(--line) 78%, transparent 78%);width:22px;height:22px;position:absolute;bottom:0;right:0}.page-stack{gap:16px;display:grid}.page-intro{color:var(--ink-2);margin:0}.subpage-back{border-radius:var(--radius-sm);min-height:36px;color:var(--primary);background:0 0;border:0;align-items:center;gap:2px;margin:0 0 8px -8px;padding:0 8px;display:inline-flex}.subpage-back:hover{background:var(--panel)}.trpg-body{flex:1;min-height:0;display:flex;position:relative}.trpg-body .trpg-content{flex:1}.trpg-dice-btn{z-index:6;border:2px solid var(--gold);background:var(--primary);width:52px;height:52px;color:var(--primary-ink);box-shadow:var(--shadow-float);border-radius:50%;place-items:center;padding:0;display:grid;position:absolute;bottom:20px;right:20px}.trpg-dice-btn[aria-pressed=true]{box-shadow:0 0 0 3px var(--gold), var(--shadow-float)}.trpg-window[data-layout=narrow] .trpg-dice-btn{bottom:16px;right:16px}.trpg-dice{z-index:30;background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:360px;max-height:calc(100dvh - 16px);box-shadow:var(--shadow-float);flex-direction:column;display:flex;position:fixed;overflow:hidden}.trpg-dice__head{background:var(--chrome);min-height:44px;color:var(--chrome-ink);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;flex:none;align-items:center;gap:8px;padding:0 6px 0 14px;display:flex}.trpg-dice__title{font-family:var(--font-serif);flex:1;font-size:16px}.trpg-dice__body{gap:14px;padding:14px 12px;display:grid;overflow-y:auto}.trpg-dice__lbl{color:var(--ink-2);justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px;font-size:12.5px;display:flex}.trpg-dice__row{align-items:center;gap:8px;display:flex}.trpg-dice__formula{min-height:44px;font-family:var(--font-serif);letter-spacing:.02em;font-size:20px}.trpg-dice__formula[aria-invalid=true]{border-color:var(--danger)}.trpg-dice__err{min-height:18px;margin-top:4px}.trpg-dice__faces{grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;display:grid}.trpg-dice__face{min-width:0;position:relative}.trpg-dice__die{border:1px solid var(--line);background:var(--card);width:100%;min-height:58px;color:var(--ink);border-radius:8px;align-content:center;justify-items:center;gap:2px;padding:4px 0 3px;font-size:12px;display:grid;position:relative}.trpg-dice__die:hover{border-color:var(--primary)}.trpg-dice__die[data-n]:not([data-n=\"0\"]){border-color:var(--primary);background:var(--panel)}.trpg-dice__die .trpg-die{width:28px;height:28px}.trpg-dice__cnt{background:var(--primary);min-width:20px;height:20px;color:var(--primary-ink);font-variant-numeric:tabular-nums;border-radius:10px;padding:0 5px;font-size:12px;line-height:20px;position:absolute;top:-6px;right:-4px}.trpg-dice__minus{border:1px solid var(--line);background:var(--card);width:22px;height:22px;color:var(--ink);border-radius:50%;padding:0;font-size:14px;line-height:18px;position:absolute;top:-8px;left:-6px}.trpg-dice__minus:after{content:\"\";position:absolute;inset:-10px}.trpg-die polygon,.trpg-die .trpg-die__body{fill:var(--card);stroke:var(--ink-2);stroke-width:3px;stroke-linejoin:round}.trpg-die .trpg-die__facet{fill:none;stroke:var(--line);stroke-width:2px;stroke-linejoin:round}.trpg-die text{fill:var(--ink);font-family:var(--font-serif);font-weight:600}.trpg-dice__die .trpg-die polygon,.trpg-dice__die .trpg-die .trpg-die__body{fill:none}.trpg-dice__die[data-n]:not([data-n=\"0\"]) .trpg-die polygon,.trpg-dice__die[data-n]:not([data-n=\"0\"]) .trpg-die .trpg-die__body{stroke:var(--primary)}.trpg-dice__adjust{flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:10px 16px;display:flex}.trpg-dice__step{align-items:center;gap:4px;display:inline-flex}.trpg-dice__step button{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:40px;height:40px;color:var(--ink);font-size:18px}.trpg-dice__step output{text-align:center;font-variant-numeric:tabular-nums;min-width:2.6em;font-weight:600}.trpg-dice__small{color:var(--ink-2);font-size:12px}.trpg-dice__step .trpg-dice__small{margin-right:4px}.trpg-dice .trpg-seg button{min-height:40px}.trpg-seg.is-off{opacity:.45}.trpg-seg.is-off button{cursor:not-allowed}.trpg-dice__roll{width:100%;min-height:54px;font-family:var(--font-serif);letter-spacing:.3em;text-indent:.3em;font-size:19px}.trpg-dice__result{border:1px solid var(--line);background:var(--card);border-radius:10px;justify-items:center;gap:8px;padding:14px 12px 12px;display:grid}.trpg-dice__hero{width:124px;height:124px}.trpg-dice__hero .trpg-die{width:100%;height:100%;overflow:visible}.trpg-dice__hero.is-rolling .trpg-die{animation:.46s ease-in-out trpg-tumble}.trpg-dice__hero.is-nat20 .trpg-die polygon,.trpg-dice__hero.is-nat20 .trpg-die .trpg-die__body{stroke:var(--gold);stroke-width:5px;fill:color-mix(in srgb, var(--gold) 22%, var(--card))}.trpg-dice__hero.is-nat1 .trpg-die polygon,.trpg-dice__hero.is-nat1 .trpg-die .trpg-die__body{stroke:var(--danger);stroke-width:5px;fill:color-mix(in srgb, var(--danger) 18%, var(--card))}.trpg-dice__line{min-height:22px;color:var(--ink-2);text-align:center;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}.trpg-dice__minis{flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;min-height:36px;display:flex}.trpg-dice__mini{width:38px;height:38px}.trpg-dice__mini.is-dim{opacity:.35}.trpg-dice__mini .trpg-die{width:100%;height:100%}.trpg-dice__const{background:var(--panel);border:1px solid var(--line);font-variant-numeric:tabular-nums;border-radius:15px;place-items:center;min-width:38px;height:30px;padding:0 8px;font-weight:600;display:inline-grid}.trpg-dice__send{grid-template-columns:1.5fr 1fr;gap:8px;width:100%;display:grid}.trpg-dice__send .trpg-input{grid-column:1/-1}.trpg-dice__send .trpg-btn{min-height:44px}.trpg-dice__recent{border:1px solid var(--line);width:100%;min-height:44px;color:var(--ink-2);text-align:left;background:0 0;border-radius:8px;justify-content:space-between;align-items:center;gap:8px;padding:0 10px;display:flex}.trpg-dice__recent b{color:var(--ink);font-family:var(--font-serif);font-size:16px}.trpg-dice__list{max-height:180px;margin:4px 0 0;padding:0;list-style:none;overflow-y:auto}.trpg-dice__list button{border:0;border-bottom:1px solid var(--line);text-align:left;background:0 0;align-items:baseline;gap:10px;width:100%;min-height:44px;padding:4px 10px;display:flex}.trpg-dice__list button:hover{background:var(--panel)}.trpg-dice__list b{min-width:2em;font-family:var(--font-serif);font-size:17px}.trpg-dice__list span{overflow-wrap:anywhere;min-width:0;color:var(--ink-2);flex:1;font-size:13px}.trpg-dice__list time{color:var(--ink-2);font-size:12px}.trpg-dice__clear{justify-content:flex-end;display:flex}@keyframes trpg-tumble{0%{transform:rotate(0)scale(1)}45%{transform:rotate(200deg)scale(.88)}to{transform:rotate(360deg)scale(1)}}.trpg-hero{border-radius:var(--radius);background:var(--primary);width:100%;min-height:170px;color:var(--primary-ink);text-align:left;box-shadow:var(--shadow-card);border:0;align-content:end;gap:8px;padding:22px 24px;transition:transform .12s,box-shadow .12s;display:grid}button.trpg-hero:hover:not(:disabled){box-shadow:var(--shadow-float);transform:translateY(-1px)}button.trpg-hero:active{transform:none}button.trpg-hero:disabled{opacity:.6;cursor:not-allowed}.trpg-hero--idle{background:var(--panel);color:var(--ink-2)}.trpg-hero__title{font-family:var(--font-serif);font-size:26px;font-weight:600}.trpg-hero__sub{opacity:.9}.trpg-hero__go{justify-self:end;font-weight:600}.trpg-window[data-layout=narrow] .trpg-hero{min-height:140px;padding:18px}.trpg-link{color:var(--primary);background:0 0;border:0;justify-self:start;min-height:36px;padding:0;text-decoration:underline}.trpg-banner{border-radius:var(--radius);background:var(--chrome);color:#f4ecdd;height:200px;position:relative;overflow:hidden}.trpg-banner--pattern{background:repeating-linear-gradient(45deg, var(--chrome) 0 14px, color-mix(in srgb, var(--chrome) 88%, var(--gold)) 14px 28px)}.trpg-banner__img{object-fit:cover;object-position:70% 50%;opacity:0;width:100%;height:100%;transition:opacity .24s;position:absolute;inset:0}.trpg-banner__img.is-loaded{opacity:1}.trpg-banner__text{background:linear-gradient(#0000,#2b211cbf);gap:2px;padding:40px 20px 14px;display:grid;position:absolute;inset:auto 0 0}.trpg-banner__title{color:inherit;font-family:var(--font-serif);text-align:left;background:0 0;border:0;justify-self:start;padding:0;font-size:26px;font-weight:600}.trpg-banner__line{flex-wrap:wrap;align-items:center;gap:10px;font-size:14px;display:flex}.trpg-banner__state{color:inherit;background:0 0;border:0;padding:0}.trpg-banner__state[data-dirty=true]{color:#f3b45a}.trpg-window[data-layout=narrow] .trpg-banner{height:140px}.trpg-overview{grid-template-columns:repeat(4,1fr);gap:12px;display:grid}.trpg-window[data-layout=mid] .trpg-overview,.trpg-window[data-layout=narrow] .trpg-overview{grid-template-columns:repeat(2,1fr)}.trpg-cell{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);min-height:88px;box-shadow:var(--shadow-card);text-align:left;align-content:start;gap:4px;padding:12px 14px;transition:transform .12s,border-color .12s;display:grid}.trpg-cell:hover{border-color:var(--primary);transform:translateY(-1px)}.trpg-cell:active{transform:none}.trpg-cell__title{align-items:center;gap:6px;font-weight:600;display:flex}.trpg-cell__line{color:var(--ink-2);font-size:13px}.trpg-empty--tight{text-align:left;padding:8px 0}.trpg-chip{max-width:260px}.trpg-chip__name{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.trpg-badge--button{cursor:pointer}.trpg-dice__shell{flex:1;min-height:0;display:flex}.trpg-dice__main{flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.trpg-dice__main>.trpg-dice__body{overflow-y:auto}.trpg-dice[data-narrow=true]{max-height:calc(100dvh - 76px)}.trpg-dice[data-narrow=true] .trpg-dice__shell{flex-direction:column}.trpg-rp{background:var(--card);flex-direction:column;flex:1;min-height:0;display:flex}.trpg-rp__body{flex:1;align-content:start;gap:8px;min-height:0;padding:8px 14px;display:grid;overflow-y:auto}.trpg-rp .trpg-seg{width:fit-content;max-width:100%}.trpg-rp .trpg-seg button{min-height:32px;padding:2px 12px}.trpg-rp__sec{border-bottom:1px dotted color-mix(in srgb, var(--line) 60%, transparent);gap:6px;padding-bottom:8px;display:grid}.trpg-rp__sec:last-child{border-bottom:0}.trpg-rp__sec h4{color:var(--ink-2);margin:0;font-size:12px;font-weight:600}.trpg-rp__title{font:700 17px/1.3 var(--font-serif);margin:0}.trpg-rp__pair{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;display:grid}.trpg-rp__rows{gap:0;margin:0;padding:0;list-style:none;display:grid}.trpg-rp__row{border-bottom:1px dotted color-mix(in srgb, var(--line) 60%, transparent);align-items:center;gap:8px;min-height:30px;font-size:14px;display:flex}.trpg-rp__row:last-child{border-bottom:0}.trpg-rp__row>span{flex:1;min-width:0}.trpg-rp__row b{font-variant-numeric:tabular-nums}.trpg-rp__row.is-off{opacity:.4;text-decoration:line-through}.trpg-rp__hint{color:var(--ink-2);font-size:12px;font-weight:400}.trpg-rp__warn{background:color-mix(in srgb, var(--gold) 16%, var(--card));border-radius:8px;margin:0;padding:6px 10px;font-size:13px}.trpg-rp__addrow{gap:4px;display:flex}.trpg-rp__form{grid-template-columns:1fr 1fr auto;align-items:center;gap:6px;display:grid}.trpg-rp__form .trpg-field__error{grid-column:1/-1}.trpg-rp__passive{color:var(--ink-2);align-items:center;gap:8px;font-size:13px;display:flex}.trpg-rp__dc{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-input.trpg-rp__dcnum{text-align:center;width:72px;min-height:44px;font:700 22px var(--font-serif);flex:none}.trpg-rp__round{border:1px solid var(--line);background:var(--card);border-radius:50%;place-items:center;width:34px;height:34px;padding:0;display:inline-grid}.trpg-rp__chips{flex-wrap:wrap;gap:6px;width:100%;display:flex}.trpg-rp__chip{border:1px solid var(--line);background:var(--card);font-variant-numeric:tabular-nums;border-radius:8px;width:40px;height:34px;padding:0}.trpg-rp__chip[aria-pressed=true]{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-rp__contest{gap:8px;display:grid}.trpg-rp__final{margin:0;font-size:14px;font-weight:600}.trpg-rp__final .trpg-rp__hint{margin-top:2px;display:block}.trpg-rp__foot{padding:10px 14px calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);background:var(--card);flex:none;gap:8px;display:grid}.trpg-rp__formula{margin:0;font:700 15px ui-monospace,SF Mono,Menlo,monospace}.trpg-rp__result{border:1px dashed var(--line);border-radius:10px;align-items:center;gap:14px;height:104px;padding:0 14px;display:flex;overflow:hidden}.trpg-rp__total{border:2px solid var(--frame);min-width:64px;height:64px;font:700 28px var(--font-serif);border-radius:14px;place-items:center;padding:0 6px;display:inline-grid}.trpg-rp__verdict{gap:2px;min-width:0;display:grid}.trpg-rp__verdict span{font:700 15px var(--font-serif)}.trpg-rp__verdict .is-pass,.trpg-rp__verdict .is-win{color:var(--primary)}.trpg-rp__verdict .is-fail,.trpg-rp__verdict .is-lose{color:var(--danger)}.trpg-rp__verdict small{color:var(--ink-2);overflow-wrap:anywhere;font-size:12.5px}.trpg-rp__roll{width:100%;min-height:46px;font:700 17px var(--font-serif);letter-spacing:.2em}.trpg-rp input[type=checkbox]{appearance:none;border:1.5px solid var(--line);background:var(--card);cursor:pointer;border-radius:6px;flex:none;width:22px;height:22px;margin:0;position:relative}.trpg-rp input[type=checkbox]:checked{background:var(--primary);border-color:var(--primary)}.trpg-rp input[type=checkbox]:checked:after{content:\"\";border:solid var(--primary-ink);border-width:0 2px 2px 0;width:6px;height:11px;position:absolute;top:2px;left:6px;transform:rotate(45deg)}.trpg-rp__act{align-items:center;gap:12px;display:flex}.trpg-rp__act .trpg-rp__formula{overflow-wrap:anywhere;flex:1;min-width:0}.trpg-rp__act .trpg-rp__roll{flex:none;width:auto;min-width:140px;padding:0 22px}.trpg-rp__result{height:92px}.trpg-rp__sec h4{color:var(--ink);font-size:13px}.trpg-rp__body{padding-bottom:20px}.trpg-input.trpg-rp__dcnum{appearance:textfield;box-shadow:none}.trpg-rp__dcnum::-webkit-inner-spin-button{appearance:none;margin:0}.trpg-rp__dcnum::-webkit-outer-spin-button{appearance:none;margin:0}.trpg-rp__roll{letter-spacing:.08em}.trpg-rp__result.is-empty{height:44px}.trpg-rp__dcline{color:var(--ink-2);margin:0;font-size:12.5px}", HL = ":host{all:initial;pointer-events:inherit;--paper:#f4ecdd;--panel:#eee5d3;--card:#fffcf6;--line:#cbbca3;--ink:#2b211c;--ink-2:#6c6255;--primary:#7a2e26;--primary-ink:#fffcf6;--gold:#b8954a;--danger:#a3352b;--unsaved:#d9892b;--chrome:#2b211c;--chrome-ink:#f1ebdc;--chrome-hover:#3a2d26;--ok:#3f7a3a;--scrim:#2b211c73;--radius:10px;--radius-sm:6px;--radius-xs:4px;--shadow-card:0 1px 2px #2b211c14, 0 2px 8px #2b211c0f;--shadow-float:0 8px 28px #00000047;--hp:#8c2f2a;--hp-track:color-mix(in srgb, var(--line) 55%, var(--card));--frame:color-mix(in srgb, var(--ink) 75%, var(--gold));--shadow-card-hover:0 2px 4px #2b211c1a, 0 6px 16px #2b211c1a;--font-serif:\"Songti SC\", \"Noto Serif SC\", Georgia, serif;--font-sans:\"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;font-family:var(--font-sans);color:var(--ink);font-size:14px;line-height:1.5}@media (prefers-color-scheme:dark){:host{--paper:#20231f;--panel:#2b3029;--card:#181c18;--line:#515849;--ink:#f1ebdc;--ink-2:#bcbbaa;--primary:#e6bf73;--primary-ink:#20231f;--gold:#e6bf73;--danger:#e07a6e;--unsaved:#e8a13a;--chrome:#121411;--chrome-ink:#f1ebdc;--chrome-hover:#232720;--ok:#8cc47f;--scrim:#0000008c;--hp:#c8574c;--frame:color-mix(in srgb, var(--gold) 60%, var(--chrome))}}*,:before,:after{box-sizing:border-box}button,input,textarea,select{font:inherit;color:inherit}button{cursor:pointer}:focus-visible{outline:2px solid var(--primary);outline-offset:2px}.trpg-sr-only{clip:rect(0 0 0 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}@media (prefers-reduced-motion:reduce){*,:before,:after{transition-duration:.01ms!important;animation-duration:.01ms!important}}", UL = "trpg-assistant-root";
function WL(e) {
	if (document.getElementById(UL)) return null;
	let t = document.createElement("div");
	t.id = UL;
	let n = t.attachShadow({ mode: "open" }), r = document.createElement("style");
	r.textContent = [
		HL,
		VL,
		RL,
		BL,
		zL
	].join("\n");
	let i = document.createElement("div");
	i.className = "trpg-portal";
	let a = document.createElement("div");
	n.append(r, a, i), document.body.appendChild(t);
	let o = fx();
	return Iu(LL, {
		ctx: e,
		portalTarget: i
	}).use(o).mount(a), o;
}
// src/main.ts
async function GL() {
	if (window.__trpgAssistantBooted) return;
	window.__trpgAssistantBooted = !0, await p();
	let e = d(), t = WL(e);
	t && await lS(e, t);
}
GL().catch((e) => {
	window.__trpgAssistantBooted = !1, console.error("[trpg-assistant] 启动失败", e);
});
