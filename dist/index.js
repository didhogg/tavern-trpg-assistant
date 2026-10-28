// \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = "tavern-trpg-assistant";
function r() {
	let e = window.SillyTavern;
	if (!e?.getContext) throw Error("SillyTavern 宿主未就绪");
	return e.getContext();
}
function i() {
	return document.getElementById("send_textarea");
}
function a(e = 3e4) {
	return new Promise((t, n) => {
		let r = () => !!window.SillyTavern?.getContext && !!i();
		if (r()) {
			t();
			return;
		}
		let a = new MutationObserver(() => {
			r() && (window.clearTimeout(o), a.disconnect(), t());
		}), o = window.setTimeout(() => {
			a.disconnect(), n(/* @__PURE__ */ Error("等待酒馆界面超时"));
		}, e);
		a.observe(document.documentElement, {
			childList: !0,
			subtree: !0
		});
	});
}
async function o(e = 5e3) {
	let t = window.__TAURITAVERN__;
	if (!t) return null;
	let n = t.ready ?? window.__TAURITAVERN_MAIN_READY__;
	return n && await Promise.race([n, new Promise((t, n) => window.setTimeout(() => n(/* @__PURE__ */ Error("TauriTavern ready 超时")), e))]), t;
}
function s(e, t, n) {
	return e.event_types?.[t] ?? n;
}
function c(e, t, n) {
	return e.eventSource.on(t, n), () => {
		(e.eventSource.removeListener ?? e.eventSource.off)?.call(e.eventSource, t, n);
	};
}
function l(e, t) {
	let n = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
	if (!n) throw Error("无法获取输入框 value 写入器");
	n.call(e, t), e.dispatchEvent(new Event("input", { bubbles: !0 }));
}
// node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function u(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var d = {}, f = [], p = () => {}, m = () => !1, h = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), g = (e) => e.startsWith("onUpdate:"), _ = Object.assign, v = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, y = Object.prototype.hasOwnProperty, b = (e, t) => y.call(e, t), x = Array.isArray, S = (e) => ne(e) === "[object Map]", C = (e) => ne(e) === "[object Set]", w = (e) => ne(e) === "[object Date]", T = (e) => ne(e) === "[object RegExp]", E = (e) => typeof e == "function", D = (e) => typeof e == "string", O = (e) => typeof e == "symbol", k = (e) => typeof e == "object" && !!e, ee = (e) => (k(e) || E(e)) && E(e.then) && E(e.catch), te = Object.prototype.toString, ne = (e) => te.call(e), re = (e) => ne(e).slice(8, -1), ie = (e) => ne(e) === "[object Object]", A = (e) => D(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, ae = /* @__PURE__ */ u(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), oe = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, se = /-\w/g, j = oe((e) => e.replace(se, (e) => e.slice(1).toUpperCase())), ce = /\B([A-Z])/g, le = oe((e) => e.replace(ce, "-$1").toLowerCase()), ue = oe((e) => e.charAt(0).toUpperCase() + e.slice(1)), de = oe((e) => e ? `on${ue(e)}` : ""), M = (e, t) => !Object.is(e, t), fe = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, pe = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, me = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, he = (e) => {
	let t = D(e) ? Number(e) : NaN;
	return isNaN(t) ? e : t;
}, ge, _e = () => ge ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {}, ve = /* @__PURE__ */ u("Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol");
function ye(e) {
	if (x(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = D(r) ? Ce(r) : ye(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (D(e) || k(e)) return e;
}
var be = /;(?![^(]*\))/g, xe = /:([^]+)/, Se = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function Ce(e) {
	let t = {};
	return e.replace(Se, (e) => e.startsWith("/*") ? "" : e).split(be).forEach((e) => {
		if (e) {
			let n = e.split(xe);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function we(e) {
	let t = "";
	if (D(e)) t = e;
	else if (x(e)) for (let n = 0; n < e.length; n++) {
		let r = we(e[n]);
		r && (t += r + " ");
	}
	else if (k(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
function Te(e) {
	if (!e) return null;
	let { class: t, style: n } = e;
	return t && !D(t) && (e.class = we(t)), n && (e.style = ye(n)), e;
}
var Ee = /* @__PURE__ */ u("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function De(e) {
	return !!e || e === "";
}
function Oe(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = Me(e[i], t[i], n);
	return r;
}
function ke(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && Me(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function Ae(e, t, n) {
	let r = S(e), i = S(t);
	if (r || i || (r = C(e), i = C(t), r || i)) return r && i ? ke(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !Me(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function je(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function Me(e, t, n) {
	if (e === t) return !0;
	let r = w(e), i = w(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = O(e), i = O(t), r || i ? e === t : (r = x(e), i = x(t), r || i ? r && i ? je(e, t, n, Oe) : !1 : (r = k(e), i = k(t), r || i ? !r || !i ? !1 : je(e, t, n, Ae) : String(e) === String(t))));
}
function Ne(e, t) {
	return e.findIndex((e) => Me(e, t));
}
var Pe = (e) => !!(e && e.__v_isRef === !0), Fe = (e) => D(e) ? e : e == null ? "" : x(e) || k(e) && (e.toString === te || !E(e.toString)) ? Pe(e) ? Fe(e.value) : JSON.stringify(e, Ie, 2) : String(e), Ie = (e, t) => Pe(t) ? Ie(e, t.value) : S(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[Le(t, r) + " =>"] = n, e), {}) } : C(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => Le(e)) } : O(t) ? Le(t) : k(t) && !x(t) && !ie(t) ? String(t) : t, Le = (e, t = "") => O(e) ? `Symbol(${e.description ?? t})` : e;
function Re(e) {
	return e == null ? "initial" : typeof e == "string" ? e === "" ? " " : e : String(e);
}
// node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var N, ze = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && N && (N.active ? (this.parent = N, this.index = (N.scopes || (N.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = N;
			try {
				return N = this, e();
			} finally {
				N = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = N, N = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (N === this) N = this.prevScope;
			else {
				let e = N;
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
function Be(e) {
	return new ze(e);
}
function Ve() {
	return N;
}
function He(e, t = !1) {
	N && N.cleanups.push(e);
}
var P, Ue = /* @__PURE__ */ new WeakSet(), We = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, N && (N.active ? N.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, Ue.has(this) && (Ue.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Je(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, lt(this), Ze(this);
		let e = P, t = at;
		P = this, at = !0;
		try {
			return this.fn();
		} finally {
			Qe(this), P = e, at = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) tt(e);
			this.deps = this.depsTail = void 0, lt(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? Ue.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		$e(this) && this.run();
	}
	get dirty() {
		return $e(this);
	}
}, Ge = 0, Ke, qe;
function Je(e, t = !1) {
	e.flags |= 8, t ? (e.next = qe, qe = e) : (e.next = Ke, Ke = e);
}
function Ye() {
	Ge++;
}
function Xe() {
	if (--Ge > 0) return;
	if (qe) {
		let e = qe;
		for (qe = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; Ke;) {
		let t = Ke;
		for (Ke = void 0; t;) {
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
function Ze(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Qe(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), tt(r), nt(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function $e(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (et(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function et(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === ut) || (e.globalVersion = ut, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !$e(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = P, r = at;
	P = e, at = !0;
	try {
		Ze(e);
		let n = e.fn(e._value);
		(t.version === 0 || M(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		P = n, at = r, Qe(e), e.flags &= -3;
	}
}
function tt(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) tt(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function nt(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
function rt(e, t) {
	e.effect instanceof We && (e = e.effect.fn);
	let n = new We(e);
	t && _(n, t);
	try {
		n.run();
	} catch (e) {
		throw n.stop(), e;
	}
	let r = n.run.bind(n);
	return r.effect = n, r;
}
function it(e) {
	e.effect.stop();
}
var at = !0, ot = [];
function st() {
	ot.push(at), at = !1;
}
function ct() {
	let e = ot.pop();
	at = e === void 0 || e;
}
function lt(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = P;
		P = void 0;
		try {
			t();
		} finally {
			P = e;
		}
	}
}
var ut = 0, dt = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, ft = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!P || !at || P === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== P) t = this.activeLink = new dt(P, this), P.deps ? (t.prevDep = P.depsTail, P.depsTail.nextDep = t, P.depsTail = t) : P.deps = P.depsTail = t, pt(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = P.depsTail, t.nextDep = void 0, P.depsTail.nextDep = t, P.depsTail = t, P.deps === t && (P.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, ut++, this.notify(e);
	}
	notify(e) {
		Ye();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			Xe();
		}
	}
};
function pt(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) pt(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var mt = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ Symbol(""), gt = /* @__PURE__ */ Symbol(""), _t = /* @__PURE__ */ Symbol("");
function vt(e, t, n) {
	if (at && P) {
		let t = mt.get(e);
		t || mt.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new ft()), r.map = t, r.key = n), r.track();
	}
}
function yt(e, t, n, r, i, a) {
	let o = mt.get(e);
	if (!o) {
		ut++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (Ye(), t === "clear") o.forEach(s);
	else {
		let i = x(e), a = i && A(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === _t || !O(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(_t)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(ht)), S(e) && s(o.get(gt)));
				break;
			case "delete":
				i || (s(o.get(ht)), S(e) && s(o.get(gt)));
				break;
			case "set": S(e) && s(o.get(ht));
		}
	}
	Xe();
}
function bt(e, t) {
	let n = mt.get(e);
	return n && n.get(t);
}
function xt(e) {
	let t = /* @__PURE__ */ F(e);
	return t === e || (vt(t, "iterate", _t), /* @__PURE__ */ dn(e)) ? t : /* @__PURE__ */ un(e) ? /* @__PURE__ */ ln(e) ? t.map((e) => hn(mn(e))) : t.map(hn) : t.map(mn);
}
function St(e) {
	return vt(e = /* @__PURE__ */ F(e), "iterate", _t), e;
}
function Ct(e, t) {
	return /* @__PURE__ */ un(e) ? hn(/* @__PURE__ */ ln(e) ? mn(t) : t) : mn(t);
}
var wt = {
	__proto__: null,
	[Symbol.iterator]() {
		return Tt(this, Symbol.iterator, (e) => Ct(this, e));
	},
	concat(...e) {
		return xt(this).concat(...e.map((e) => x(e) ? xt(e) : e));
	},
	entries() {
		return Tt(this, "entries", (e) => (e[1] = Ct(this, e[1]), e));
	},
	every(e, t) {
		return Ot(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return Ot(this, "filter", e, t, (e) => e.map((e) => Ct(this, e)), arguments);
	},
	find(e, t) {
		return Ot(this, "find", e, t, (e) => Ct(this, e), arguments);
	},
	findIndex(e, t) {
		return Ot(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return Ot(this, "findLast", e, t, (e) => Ct(this, e), arguments);
	},
	findLastIndex(e, t) {
		return Ot(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return Ot(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return At(this, "includes", e);
	},
	indexOf(...e) {
		return At(this, "indexOf", e);
	},
	join(e) {
		return xt(this).join(e);
	},
	lastIndexOf(...e) {
		return At(this, "lastIndexOf", e);
	},
	map(e, t) {
		return Ot(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return jt(this, "pop");
	},
	push(...e) {
		return jt(this, "push", e);
	},
	reduce(e, ...t) {
		return kt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return kt(this, "reduceRight", e, t);
	},
	shift() {
		return jt(this, "shift");
	},
	some(e, t) {
		return Ot(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return jt(this, "splice", e);
	},
	toReversed() {
		return xt(this).toReversed();
	},
	toSorted(e) {
		return xt(this).toSorted(e);
	},
	toSpliced(...e) {
		return xt(this).toSpliced(...e);
	},
	unshift(...e) {
		return jt(this, "unshift", e);
	},
	values() {
		return Tt(this, "values", (e) => Ct(this, e));
	}
};
function Tt(e, t, n) {
	let r = St(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ dn(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => Et(a.next(), n), i !== Dt[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => Et(a._next(), n);
	}
	return a;
}
function Et(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var Dt = Array.prototype;
function Ot(e, t, n, r, i, a) {
	let o = St(e), s = o !== e && !/* @__PURE__ */ dn(e), c = o[t];
	if (c !== Dt[t]) {
		let t = c.apply(e, a);
		return s ? mn(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, Ct(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function kt(e, t, n, r) {
	let i = St(e), a = i !== e && !/* @__PURE__ */ dn(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = Ct(e, t)), n.call(this, t, Ct(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? Ct(e, c) : c;
}
function At(e, t, n) {
	let r = /* @__PURE__ */ F(e);
	vt(r, "iterate", _t);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ fn(n[0]) ? (n[0] = /* @__PURE__ */ F(n[0]), r[t](...n)) : i;
}
function jt(e, t, n = []) {
	st(), Ye();
	let r = (/* @__PURE__ */ F(e))[t].apply(e, n);
	return Xe(), ct(), r;
}
var Mt = /* @__PURE__ */ u("__proto__,__v_isRef,__isVue"), Nt = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(O));
function Pt(e) {
	O(e) || (e = String(e));
	let t = /* @__PURE__ */ F(this);
	return vt(t, "has", e), t.hasOwnProperty(e);
}
var Ft = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? tn : en : i ? $t : Qt).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = x(e);
		if (!r) {
			let e;
			if (a && (e = wt[t])) return e;
			if (t === "hasOwnProperty") return Pt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ I(e) ? e : n);
		if ((O(t) ? Nt.has(t) : Mt(t)) || (r || vt(e, "get", t), i)) return o;
		if (/* @__PURE__ */ I(o)) {
			let e = a && A(t) ? o : o.value;
			return r && k(e) ? /* @__PURE__ */ on(e) : e;
		}
		return k(o) ? r ? /* @__PURE__ */ on(o) : /* @__PURE__ */ rn(o) : o;
	}
}, It = class extends Ft {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = x(e) && A(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ un(i);
			if (!/* @__PURE__ */ dn(n) && !/* @__PURE__ */ un(n) && (i = /* @__PURE__ */ F(i), n = /* @__PURE__ */ F(n)), !a && /* @__PURE__ */ I(i) && !/* @__PURE__ */ I(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : b(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ I(e) ? e : r);
		return e === /* @__PURE__ */ F(r) && s && (o ? M(n, i) && yt(e, "set", t, n, i) : yt(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = b(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && yt(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return O(t) && Nt.has(t) || vt(e, "has", t), n;
	}
	ownKeys(e) {
		return vt(e, "iterate", x(e) ? "length" : ht), Reflect.ownKeys(e);
	}
}, Lt = class extends Ft {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, Rt = /* @__PURE__ */ new It(), zt = /* @__PURE__ */ new Lt(), Bt = /* @__PURE__ */ new It(!0), Vt = /* @__PURE__ */ new Lt(!0), Ht = (e) => e, Ut = (e) => Reflect.getPrototypeOf(e);
function Wt(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ F(i), o = S(a), s = e === "entries" || e === Symbol.iterator && o, c = e === "keys" && o, l = i[e](...r), u = n ? Ht : t ? hn : mn;
		return !t && vt(a, "iterate", c ? gt : ht), _(Object.create(l), { next() {
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
function Gt(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function Kt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ F(r), a = /* @__PURE__ */ F(n);
			e || (M(n, a) && vt(i, "get", n), vt(i, "get", a));
			let { has: o } = Ut(i), s = t ? Ht : e ? hn : mn;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && vt(/* @__PURE__ */ F(t), "iterate", ht), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ F(n), i = /* @__PURE__ */ F(t);
			return e || (M(t, i) && vt(r, "has", t), vt(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ F(a), s = t ? Ht : e ? hn : mn;
			return !e && vt(o, "iterate", ht), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return _(n, e ? {
		add: Gt("add"),
		set: Gt("set"),
		delete: Gt("delete"),
		clear: Gt("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ F(this), r = Ut(n), i = /* @__PURE__ */ F(e), a = !t && !/* @__PURE__ */ dn(e) && !/* @__PURE__ */ un(e) ? i : e;
			return r.has.call(n, a) || M(e, a) && r.has.call(n, e) || M(i, a) && r.has.call(n, i) || (n.add(a), yt(n, "add", a, a)), this;
		},
		set(e, n) {
			t || /* @__PURE__ */ dn(n) || /* @__PURE__ */ un(n) || (n = /* @__PURE__ */ F(n));
			let r = /* @__PURE__ */ F(this), { has: i, get: a } = Ut(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ F(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? M(n, s) && yt(r, "set", e, n, s) : yt(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ F(this), { has: n, get: r } = Ut(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ F(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && yt(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ F(this), t = e.size !== 0, n = e.clear();
			return t && yt(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = Wt(r, e, t);
	}), n;
}
function qt(e, t) {
	let n = Kt(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(b(n, i) && i in r ? n : r, i, a);
}
var Jt = { get: /* @__PURE__ */ qt(!1, !1) }, Yt = { get: /* @__PURE__ */ qt(!1, !0) }, Xt = { get: /* @__PURE__ */ qt(!0, !1) }, Zt = { get: /* @__PURE__ */ qt(!0, !0) }, Qt = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), en = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap();
function nn(e) {
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
function rn(e) {
	return /* @__PURE__ */ un(e) ? e : cn(e, !1, Rt, Jt, Qt);
}
// @__NO_SIDE_EFFECTS__
function an(e) {
	return cn(e, !1, Bt, Yt, $t);
}
// @__NO_SIDE_EFFECTS__
function on(e) {
	return cn(e, !0, zt, Xt, en);
}
// @__NO_SIDE_EFFECTS__
function sn(e) {
	return cn(e, !0, Vt, Zt, tn);
}
function cn(e, t, n, r, i) {
	if (!k(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = nn(re(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function ln(e) {
	return /* @__PURE__ */ un(e) ? /* @__PURE__ */ ln(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function un(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function dn(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function fn(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function F(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ F(t) : e;
}
function pn(e) {
	return !b(e, "__v_skip") && Object.isExtensible(e) && pe(e, "__v_skip", !0), e;
}
var mn = (e) => k(e) ? /* @__PURE__ */ rn(e) : e, hn = (e) => k(e) ? /* @__PURE__ */ on(e) : e;
// @__NO_SIDE_EFFECTS__
function I(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function L(e) {
	return _n(e, !1);
}
// @__NO_SIDE_EFFECTS__
function gn(e) {
	return _n(e, !0);
}
function _n(e, t) {
	return /* @__PURE__ */ I(e) ? e : new vn(e, t);
}
var vn = class {
	constructor(e, t) {
		this.dep = new ft(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ F(e), this._value = t ? e : mn(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ dn(e) || /* @__PURE__ */ un(e);
		e = n ? e : /* @__PURE__ */ F(e), M(e, t) && (this._rawValue = e, this._value = n ? e : mn(e), this.dep.trigger());
	}
};
function yn(e) {
	e.dep && e.dep.trigger();
}
function R(e) {
	return /* @__PURE__ */ I(e) ? e.value : e;
}
function z(e) {
	return E(e) ? e() : R(e);
}
var bn = {
	get: (e, t, n) => t === "__v_raw" ? e : R(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ I(i) && !/* @__PURE__ */ I(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function xn(e) {
	return /* @__PURE__ */ ln(e) ? e : new Proxy(e, bn);
}
var Sn = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new ft(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function Cn(e) {
	return new Sn(e);
}
// @__NO_SIDE_EFFECTS__
function wn(e) {
	let t = x(e) ? Array(e.length) : {};
	for (let n in e) t[n] = On(e, n);
	return t;
}
var Tn = class {
	constructor(e, t, n) {
		this._object = e, this._defaultValue = n, this.__v_isRef = !0, this._value = void 0, this._key = O(t) ? t : String(t), this._raw = /* @__PURE__ */ F(e);
		let r = !0, i = e;
		if (!x(e) || O(this._key) || !A(this._key)) do
			r = !/* @__PURE__ */ fn(i) || /* @__PURE__ */ dn(i);
		while (r && (i = i.__v_raw));
		this._shallow = r;
	}
	get value() {
		let e = this._object[this._key];
		return this._shallow && (e = R(e)), this._value = e === void 0 ? this._defaultValue : e;
	}
	set value(e) {
		if (this._shallow && /* @__PURE__ */ I(this._raw[this._key])) {
			let t = this._object[this._key];
			if (/* @__PURE__ */ I(t)) {
				t.value = e;
				return;
			}
		}
		this._object[this._key] = e;
	}
	get dep() {
		return bt(this._raw, this._key);
	}
}, En = class {
	constructor(e) {
		this._getter = e, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
	}
	get value() {
		return this._value = this._getter();
	}
};
// @__NO_SIDE_EFFECTS__
function Dn(e, t, n) {
	return /* @__PURE__ */ I(e) ? e : E(e) ? new En(e) : k(e) && arguments.length > 1 ? On(e, t, n) : /* @__PURE__ */ L(e);
}
function On(e, t, n) {
	return new Tn(e, t, n);
}
var kn = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new ft(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = ut - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && P !== this) return Je(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return et(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function An(e, t, n = !1) {
	let r, i;
	return E(e) ? r = e : (r = e.get, i = e.set), new kn(r, i, n);
}
var jn = {
	GET: "get",
	HAS: "has",
	ITERATE: "iterate"
}, Mn = {
	SET: "set",
	ADD: "add",
	DELETE: "delete",
	CLEAR: "clear"
}, Nn = {}, Pn = /* @__PURE__ */ new WeakMap(), Fn = void 0;
function In() {
	return Fn;
}
function Ln(e, t = !1, n = Fn) {
	if (n) {
		let t = Pn.get(n);
		t || Pn.set(n, t = []), t.push(e);
	}
}
function Rn(e, t, n = d) {
	let { immediate: r, deep: i, once: a, scheduler: o, augmentJob: s, call: c } = n, l = (e) => i ? e : /* @__PURE__ */ dn(e) || i === !1 || i === 0 ? zn(e, 1) : zn(e), u, f, m, h, g = !1, _ = !1;
	if (/* @__PURE__ */ I(e) ? (f = () => e.value, g = /* @__PURE__ */ dn(e)) : /* @__PURE__ */ ln(e) ? (f = () => l(e), g = !0) : x(e) ? (_ = !0, g = e.some((e) => /* @__PURE__ */ ln(e) || /* @__PURE__ */ dn(e)), f = () => e.map((e) => {
		if (/* @__PURE__ */ I(e)) return e.value;
		if (/* @__PURE__ */ ln(e)) return l(e);
		if (E(e)) return c ? c(e, 2) : e();
	})) : f = E(e) ? t ? c ? () => c(e, 2) : e : () => {
		if (m) {
			st();
			try {
				m();
			} finally {
				ct();
			}
		}
		let t = Fn;
		Fn = u;
		try {
			return c ? c(e, 3, [h]) : e(h);
		} finally {
			Fn = t;
		}
	} : p, t && i) {
		let e = f, t = i === !0 ? Infinity : i;
		f = () => zn(e(), t);
	}
	let y = Ve(), b = () => {
		u.stop(), y && y.active && v(y.effects, u);
	};
	if (a && t) {
		let e = t;
		t = (...t) => {
			try {
				return e(...t);
			} finally {
				b();
			}
		};
	}
	let S = _ ? Array(e.length).fill(Nn) : Nn, C = (e) => {
		if (u.flags & 1 && (u.dirty || e)) {
			if (t) {
				let n = u.run();
				if (e || i || g || (_ ? n.some((e, t) => M(e, S[t])) : M(n, S))) {
					let e = Fn;
					st();
					try {
						m && m(), Fn = u;
						let e = [
							n,
							S === Nn ? void 0 : _ && S[0] === Nn ? [] : S,
							h
						];
						S = n, c ? c(t, 3, e) : t(...e);
					} finally {
						Fn = e, ct();
					}
				}
			} else u.run();
		}
	};
	return s && s(C), u = new We(f), u.scheduler = o ? () => o(C, !1) : C, h = (e) => Ln(e, !1, u), m = u.onStop = () => {
		let e = Pn.get(u);
		if (e) {
			if (c) c(e, 4);
			else for (let t of e) t();
			Pn.delete(u);
		}
	}, t ? r ? C(!0) : S = u.run() : o ? o(C.bind(null, !0), !0) : u.run(), b.pause = u.pause.bind(u), b.resume = u.resume.bind(u), b.stop = b, b;
}
function zn(e, t = Infinity, n) {
	if (t <= 0 || !k(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ I(e)) zn(e.value, t, n);
	else if (x(e)) for (let r = 0; r < e.length; r++) zn(e[r], t, n);
	else if (C(e) || S(e)) e.forEach((e) => {
		zn(e, t, n);
	});
	else if (ie(e)) {
		for (let r in e) zn(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && zn(e[r], t, n);
	}
	return e;
}
// node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var Bn = [];
function Vn(e) {
	Bn.push(e);
}
function Hn() {
	Bn.pop();
}
function Un(e, t) {}
var Wn = {
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
}, Gn = {
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
function Kn(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		Jn(e, t, n);
	}
}
function qn(e, t, n, r) {
	if (E(e)) {
		let i = Kn(e, t, n, r);
		return i && ee(i) && i.catch((e) => {
			Jn(e, t, n);
		}), i;
	}
	if (x(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(qn(e[a], t, n, r));
		return i;
	}
}
function Jn(e, t, n, r = !0) {
	let i = t ? t.vnode : null, { errorHandler: a, throwUnhandledErrorInProduction: o } = t && t.appContext.config || d;
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
			st(), Kn(a, null, 10, [
				e,
				i,
				o
			]), ct();
			return;
		}
	}
	Yn(e, n, i, r, o);
}
function Yn(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var Xn = [], Zn = -1, Qn = [], $n = null, er = 0, tr = /* @__PURE__ */ Promise.resolve(), nr = null;
function rr(e) {
	let t = nr || tr;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function ir(e) {
	let t = Zn + 1, n = Xn.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = Xn[r], a = fr(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function ar(e) {
	if (!(e.flags & 1)) {
		let t = fr(e), n = Xn[Xn.length - 1];
		!n || !(e.flags & 2) && t >= fr(n) ? Xn.push(e) : Xn.splice(ir(t), 0, e), e.flags |= 1, or();
	}
}
function or() {
	nr ||= tr.then(pr);
}
function sr(e) {
	if (!x(e)) $n && e.id === -1 ? $n.splice(er + 1, 0, e) : e.flags & 1 || (Qn.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) Qn.push(e[t]);
	or();
}
function cr(e, t, n, r = Zn + 1) {
	for (; r < Xn.length; r++) {
		let n = Xn[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			Xn.splice(r, 1), r = e ? r - 1 : Zn, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function lr(e, t, n = 0) {
	if (Qn.length) {
		let e = Qn, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < Qn.length; i++) {
				let a = Qn[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? Qn[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => fr(e) - fr(t));
		if (Qn.length = r, $n) {
			for (let e = 0; e < i.length; e++) $n.push(i[e]);
			return;
		}
		for ($n = i, er = 0; er < $n.length; er++) {
			let e = $n[er];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		$n = null, er = 0;
	}
}
var ur = !1;
function dr(e, t) {
	if (ur) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(Qn);
	e(), ur = !0;
	try {
		cr(void 0, t), lr(void 0, n, t);
	} finally {
		ur = !1;
	}
}
var fr = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function pr(e) {
	try {
		for (Zn = 0; Zn < Xn.length; Zn++) {
			let e = Xn[Zn];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), Kn(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; Zn < Xn.length; Zn++) {
			let e = Xn[Zn];
			e && (e.flags &= -2);
		}
		Zn = -1, Xn.length = 0, lr(e), nr = null, (Xn.length || Qn.length) && pr(e);
	}
}
var mr, hr = [];
function gr(e, t) {
	mr = e, mr ? (mr.enabled = !0, hr.forEach(({ event: e, args: t }) => mr.emit(e, ...t)), hr = []) : typeof window < "u" && window.HTMLElement && !(window.navigator?.userAgent)?.includes("jsdom") ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((e) => {
		gr(e, t);
	}), setTimeout(() => {
		mr || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, hr = []);
	}, 3e3)) : hr = [];
}
var _r = null, vr = null;
function yr(e) {
	let t = _r;
	return _r = e, vr = e && e.type.__scopeId || null, t;
}
function br(e) {
	vr = e;
}
function xr() {
	vr = null;
}
var Sr = (e) => B;
function B(e, t = _r, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && vs(-1);
		let i = yr(t), a = ms.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = ms.length; e > a; e--) gs();
			yr(i), r._d && vs(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function Cr(e, t) {
	if (_r === null) return e;
	let n = rc(_r), r = e.dirs ||= [];
	for (let e = 0; e < t.length; e++) {
		let [i, a, o, s = d] = t[e];
		i && (E(i) && (i = {
			mounted: i,
			updated: i
		}), i.deep && zn(a), r.push({
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
function wr(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (st(), qn(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), ct());
	}
}
function Tr(e, t) {
	if (Bs) {
		let n = Bs.provides, r = Bs.parent && Bs.parent.provides;
		r === n && (n = Bs.provides = Object.create(r)), n[e] = t;
	}
}
function Er(e, t, n = !1) {
	let r = Q();
	if (r || co) {
		let i = co ? co._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && E(t) ? t.call(r && r.proxy) : t;
	}
}
function Dr() {
	return !!(Q() || co);
}
var Or = /* @__PURE__ */ Symbol.for("v-scx"), kr = () => Er(Or);
function Ar(e, t) {
	return Nr(e, null, t);
}
function jr(e, t) {
	return Nr(e, null, { flush: "post" });
}
function Mr(e, t) {
	return Nr(e, null, { flush: "sync" });
}
function V(e, t, n) {
	return Nr(e, t, n);
}
function Nr(e, t, n = d) {
	let { immediate: r, deep: i, flush: a, once: o } = n, s = _({}, n), c = t && r || !t && a !== "post", l;
	if (Ks) {
		if (a === "sync") {
			let e = kr();
			l = e.__watcherHandles ||= [];
		} else if (!c) {
			let e = () => {};
			return e.stop = p, e.resume = p, e.pause = p, e;
		}
	}
	let u = Bs;
	s.call = (e, t, n) => qn(e, u, t, n);
	let f = !1;
	a === "post" ? s.scheduler = (e) => {
		e.i = u, W(e, u && u.suspense);
	} : a !== "sync" && (f = !0, s.scheduler = (e, t) => {
		t ? e() : ar(e);
	}), s.augmentJob = (e) => {
		t && (e.flags |= 4), f && (e.flags |= 2, u && (e.id = u.uid, e.i = u));
	};
	let m = Rn(e, t, s);
	return Ks && (l ? l.push(m) : c && m()), m;
}
function Pr(e, t, n) {
	let r = this.proxy, i = D(e) ? e.includes(".") ? Fr(r, e) : () => r[e] : e.bind(r, r), a;
	E(t) ? a = t : (a = t.handler, n = t);
	let o = Us(this), s = Nr(i, a.bind(r), n);
	return o(), s;
}
function Fr(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Ir = /* @__PURE__ */ new WeakMap(), Lr = /* @__PURE__ */ Symbol("_vte"), Rr = (e) => e.__isTeleport, zr = (e) => e && (e.disabled || e.disabled === ""), Br = (e) => e && (e.defer || e.defer === ""), Vr = (e) => typeof SVGElement < "u" && e instanceof SVGElement, Hr = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Ur = (e, t) => {
	let n = e && e.to;
	return D(n) ? t ? t(n) : null : n;
}, Wr = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = zr(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = zr(e.props), r = e.target = Ur(e.props, m), a = Yr(r, e, h, p);
			r && (o !== "svg" && Vr(r) ? o = "svg" : o !== "mathml" && Hr(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), Jr(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (Ir.get(e) === t) {
					if (Ir.delete(e), zr(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), Jr(e, !0);
					}
					x(e);
				}
			};
			Ir.set(e, t), W(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), Br(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), Jr(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Ir.get(e);
			if (u) {
				u.flags |= 8, Ir.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = zr(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || Vr(p) ? o = "svg" : (o === "mathml" || Hr(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), Jo(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : Gr(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = Ur(t.props, m);
				e && (t.target = e, Gr(t, e, null, l, 0));
			} else g && Gr(t, p, h, l, 1);
			Jr(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = zr(f), m = a || !p, h = Ir.get(e);
		if (h && (h.flags |= 8, Ir.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: Gr,
	hydrate: Kr
};
function Gr(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Ir.has(e) && (!d || zr(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function Kr(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
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
	let m = t.target = Ur(t.props, c), h = zr(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || Yr(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || Yr(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), Jr(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var qr = Wr;
function Jr(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function Yr(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Lr] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var Xr = /* @__PURE__ */ Symbol("_leaveCb"), Zr = /* @__PURE__ */ Symbol("_enterCb");
function Qr() {
	let e = {
		isMounted: !1,
		isLeaving: !1,
		isUnmounting: !1,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	return ra(() => {
		e.isMounted = !0;
	}), oa(() => {
		e.isUnmounting = !0;
	}), e;
}
var $r = [Function, Array], ei = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: $r,
	onEnter: $r,
	onAfterEnter: $r,
	onEnterCancelled: $r,
	onBeforeLeave: $r,
	onLeave: $r,
	onAfterLeave: $r,
	onLeaveCancelled: $r,
	onBeforeAppear: $r,
	onAppear: $r,
	onAfterAppear: $r,
	onAppearCancelled: $r
}, ti = {
	name: "BaseTransition",
	props: ei,
	setup(e, { slots: t }) {
		let n = Q(), r = Qr();
		return () => {
			let i = t.default && li(t.default(), !0), a = i && i.length ? ni(i) : n.subTree ? As() : void 0;
			if (!a) return;
			let o = /* @__PURE__ */ F(e), { mode: s } = o;
			if (r.isLeaving) return oi(a);
			let c = si(a);
			if (!c) return oi(a);
			let l = ai(c, o, r, n, (e) => l = e);
			c.type !== K && ci(c, l);
			let u = n.subTree && si(n.subTree);
			if (u && u.type !== K && !xs(u, c) && ui(n.subTree)) {
				let e = ai(u, o, r, n);
				if (ci(u, e), s === "out-in" && c.type !== K) return r.isLeaving = !0, e.afterLeave = () => {
					r.isLeaving = !1, n.job.flags & 8 || n.update(), delete e.afterLeave, u = void 0;
				}, oi(a);
				s === "in-out" && c.type !== K ? e.delayLeave = (e, t, n) => {
					let i = ii(r, u);
					i[String(u.key)] = u, e[Xr] = () => {
						t(), e[Xr] = void 0, delete l.delayedLeave, u = void 0;
					}, l.delayedLeave = () => {
						n(), delete l.delayedLeave, u = void 0;
					};
				} : u = void 0;
			} else u &&= void 0;
			return a;
		};
	}
};
function ni(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== K) {
			t = n;
			break;
		}
	}
	return t;
}
var ri = ti;
function ii(e, t) {
	let { leavingVNodes: n } = e, r = n.get(t.type);
	return r || (r = /* @__PURE__ */ Object.create(null), n.set(t.type, r)), r;
}
function ai(e, t, n, r, i) {
	let { appear: a, mode: o, persisted: s = !1, onBeforeEnter: c, onEnter: l, onAfterEnter: u, onEnterCancelled: d, onBeforeLeave: f, onLeave: p, onAfterLeave: m, onLeaveCancelled: h, onBeforeAppear: g, onAppear: _, onAfterAppear: v, onAppearCancelled: y } = t, b = String(e.key), S = ii(n, e), C = (e, t) => {
		e && qn(e, r, 9, t);
	}, w = (e, t) => {
		let n = t[1];
		C(e, t), x(e) ? e.every((e) => e.length <= 1) && n() : e.length <= 1 && n();
	}, T = {
		mode: o,
		persisted: s,
		beforeEnter(t) {
			let r = c;
			if (!n.isMounted) {
				if (a) r = g || c;
				else return;
			}
			t[Xr] && t[Xr](!0);
			let i = S[b];
			if (i && xs(e, i)) {
				let e = i.el[Xr];
				if (!e) {
					let t = ui(i);
					e = t && t.el[Xr];
				}
				e && e();
			}
			C(r, [t]);
		},
		enter(t) {
			if (S[b] === e) return;
			let r = l, i = u, o = d;
			if (!n.isMounted) {
				if (a) r = _ || l, i = v || u, o = y || d;
				else return;
			}
			let s = !1;
			t[Zr] = (e) => {
				s || (s = !0, C(e ? o : i, [t]), T.delayedLeave && T.delayedLeave(), t[Zr] = void 0);
			};
			let c = t[Zr].bind(null, !1);
			r ? w(r, [t, c]) : c();
		},
		leave(t, r) {
			let i = String(e.key);
			if (t[Zr] && t[Zr](!0), n.isUnmounting) return r();
			C(f, [t]);
			let a = !1;
			t[Xr] = (n) => {
				a || (a = !0, r(), C(n ? h : m, [t]), t[Xr] = void 0, S[i] === e && delete S[i]);
			};
			let o = t[Xr].bind(null, !1);
			S[i] = e, p ? w(p, [t, o]) : o();
		},
		clone(e) {
			let a = ai(e, t, n, r, i);
			return i && i(a), a;
		}
	};
	return T;
}
function oi(e) {
	if (Gi(e)) return e = Ds(e), e.children = null, e;
}
function si(e) {
	if (!Gi(e)) return Rr(e.type) && e.children ? ni(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && E(n.default)) return n.default();
	}
}
function ci(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		ci(Rr(n.type) && si(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === G && x(e.children)) {
		let n = _o(e.children, !1);
		n && ci(n, t);
	}
}
function li(e, t = !1, n) {
	let r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a], s = n == null ? o.key : String(n) + String(o.key == null ? a : o.key);
		o.type === G ? (o.patchFlag & 128 && i++, r = r.concat(li(o.children, t, s))) : (t || o.type !== K) && r.push(s == null ? o : Ds(o, { key: s }));
	}
	if (i > 1) for (let e = 0; e < r.length; e++) r[e].patchFlag = -2;
	return r;
}
function ui(e) {
	if (e.component) return ui(e.component.subTree);
	if (e.type === G) {
		let t = x(e.children) && _o(e.children, !1);
		return t ? ui(t) : void 0;
	}
	if (e.type !== K) return e;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
	return E(e) ? /* @__PURE__ */ _({ name: e.name }, t, { setup: e }) : e;
}
function di() {
	let e = Q();
	return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : "";
}
function fi(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function pi(e) {
	let t = Q(), n = /* @__PURE__ */ gn(null);
	if (t) {
		let r = t.refs === d ? t.refs = {} : t.refs;
		Object.defineProperty(r, e, {
			enumerable: !0,
			get: () => n.value,
			set: (e) => n.value = e
		});
	}
	return n;
}
function mi(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var hi = /* @__PURE__ */ new WeakMap();
function gi(e, t, n, r, i = !1) {
	if (x(e)) {
		e.forEach((e, a) => gi(e, t && (x(t) ? t[a] : t), n, r, i));
		return;
	}
	if (Hi(r) && !i) {
		r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && gi(e, t, n, r.component.subTree);
		return;
	}
	let a = r.shapeFlag & 4 ? rc(r.component) : r.el, o = i ? null : a, { i: s, r: c } = e, l = t && t.r, u = s.refs === d ? s.refs = {} : s.refs, f = s.setupState, p = /* @__PURE__ */ F(f), h = f === d ? m : (e) => !mi(u, e) && b(p, e), g = (e, t) => !(t && mi(u, t));
	if (l != null && l !== c) {
		if (_i(t), D(l)) u[l] = null, h(l) && (f[l] = null);
		else if (/* @__PURE__ */ I(l)) {
			let e = t;
			g(l, e.k) && (l.value = null), e.k && (u[e.k] = null);
		}
	}
	if (E(c)) Kn(c, s, 12, [o, u]);
	else {
		let t = D(c), r = /* @__PURE__ */ I(c);
		if (t || r) {
			let s = () => {
				if (e.f) {
					let n = t ? h(c) ? f[c] : u[c] : g(c) || !e.k ? c.value : u[e.k];
					if (i) x(n) && v(n, a);
					else if (x(n)) n.includes(a) || n.push(a);
					else if (t) u[c] = [a], h(c) && (f[c] = u[c]);
					else {
						let t = [a];
						g(c, e.k) && (c.value = t), e.k && (u[e.k] = t);
					}
				} else t ? (u[c] = o, h(c) && (f[c] = o)) : r && (g(c, e.k) && (c.value = o), e.k && (u[e.k] = o));
			};
			if (o) {
				let t = () => {
					s(), hi.delete(e);
				};
				t.id = -1, hi.set(e, t), W(t, n);
			} else _i(e), s();
		}
	}
}
function _i(e) {
	let t = hi.get(e);
	t && (t.flags |= 8, hi.delete(e));
}
var vi = !1, yi = () => {
	vi ||= (console.error("Hydration completed but contains mismatches."), !0);
}, bi = (e) => e.namespaceURI.includes("svg") && e.tagName !== "foreignObject", xi = (e) => e.namespaceURI.includes("MathML"), Si = (e) => {
	if (e.nodeType === 1) {
		if (bi(e)) return "svg";
		if (xi(e)) return "mathml";
	}
}, Ci = (e) => e.nodeType === 8;
function wi(e) {
	let { mt: t, p: n, o: { patchProp: r, createText: i, nextSibling: a, parentNode: o, remove: s, insert: c, createComment: l } } = e, u = (e, t) => {
		t.hasChildNodes() ? (d(t.firstChild, e, null, null, null), lr(), t._vnode = e) : (n(null, e, t), lr(), t._vnode = e);
	}, d = (n, r, s, l, u, h = !1) => {
		h ||= !!r.dynamicChildren;
		let b = Ci(n) && n.data === "[", x = () => g(n, r, s, l, u, b), { type: S, ref: C, shapeFlag: w, patchFlag: T } = r, E = n.nodeType;
		r.el = n, T === -2 && (h = !1, r.dynamicChildren = null);
		let D = null;
		switch (S) {
			case fs:
				E === 3 ? (n.data !== r.children && (yi(), n.data = r.children), D = a(n)) : r.children === "" ? (c(r.el = i(""), o(n), n), D = n) : D = x();
				break;
			case K:
				y(n) ? (D = a(n), v(r.el = n.content.firstChild, n, s)) : D = E !== 8 || b ? x() : a(n);
				break;
			case ps:
				if (b && (n = a(n), E = n.nodeType), E === 1 || E === 3) {
					D = n;
					let e = !r.children.length;
					for (let t = 0; t < r.staticCount; t++) e && (r.children += D.nodeType === 1 ? D.outerHTML : D.data), t === r.staticCount - 1 && (r.anchor = D), D = a(D);
					return b ? a(D) : D;
				}
				x();
				break;
			case G:
				D = b ? m(n, r, s, l, u, h) : x();
				break;
			default: if (w & 1) D = (E !== 1 || r.type.toLowerCase() !== n.tagName.toLowerCase()) && !y(n) ? x() : f(n, r, s, l, u, h);
			else if (w & 6) {
				r.slotScopeIds = u;
				let e = o(n);
				if (D = b ? _(n) : Ci(n) && n.data === "teleport start" ? _(n, n.data, "teleport end") : a(n), t(r, e, null, s, l, Si(e), h), (Hi(r) || r.component.asyncDep) && !r.component.subTree) {
					let t;
					b ? (t = Z(ps), t.anchor = D ? D.previousSibling : e.lastChild) : t = n.nodeType === 3 ? Os("") : Z(n.nodeType === 8 ? K : "div"), t.el = n, r.component.subTree = t;
				}
			} else w & 64 ? D = E === 8 ? r.type.hydrate(n, r, s, l, u, h, e, p) : x() : w & 128 && (D = r.type.hydrate(n, r, s, l, Si(o(n)), u, h, e, d));
		}
		return C != null && gi(C, null, l, r), D;
	}, f = (e, t, n, i, a, o) => {
		o ||= !!t.dynamicChildren;
		let { type: c, dynamicProps: l, props: u, patchFlag: d, shapeFlag: f, dirs: m, transition: g } = t, _ = c === "input" || c === "option", b = !!l;
		if (_ || b || d !== -1) {
			m && wr(t, null, n, "created");
			let c = !1;
			if (y(e)) {
				c = qo(null, g) && n && n.vnode.props && n.vnode.props.appear;
				let r = e.content.firstChild;
				if (c) {
					let e = r.getAttribute("class");
					e && (r.$cls = e), g.beforeEnter(r);
				}
				v(r, e, n), t.el = e = r;
			}
			if (f & 16 && !(u && (u.innerHTML || u.textContent))) {
				let r = p(e.firstChild, t, e, n, i, a, o);
				for (r && !ki(e, 1) && yi(); r;) {
					let e = r;
					r = r.nextSibling, s(e);
				}
			} else if (f & 8) {
				let n = t.children;
				n[0] === "\n" && (e.tagName === "PRE" || e.tagName === "TEXTAREA") && (n = n.slice(1));
				let { textContent: r } = e;
				r !== n && r !== n.replace(/\r\n|\r/g, "\n") && (ki(e, 0) || yi(), e.textContent = t.children);
			}
			if (u) {
				if (_ || b || !o || d & 48) {
					let t = e.tagName.includes("-"), i = e.namespaceURI.includes("svg") ? "svg" : e.namespaceURI.includes("MathML") ? "mathml" : void 0;
					for (let a in u) if (_ && (a.endsWith("value") || a === "indeterminate") || h(a) && !ae(a) || a[0] === "." || t && !ae(a) || l && l.includes(a)) {
						if (Ei(e, a, u[a])) continue;
						r(e, a, null, u[a], i, n);
					}
				} else if (u.onClick) r(e, "onClick", null, u.onClick, void 0, n);
				else if (d & 4 && /* @__PURE__ */ ln(u.style)) for (let e in u.style) u.style[e];
			}
			let x;
			(x = u && u.onVnodeBeforeMount) && Fs(x, n, t), m && wr(t, null, n, "beforeMount"), ((x = u && u.onVnodeMounted) || m || c) && ls(() => {
				x && Fs(x, n, t), c && g.enter(e), m && wr(t, null, n, "mounted");
			}, i);
		}
		return e.nextSibling;
	}, p = (e, t, r, o, s, l, u) => {
		u ||= !!t.dynamicChildren;
		let f = t.children, p = f.length, m = !1;
		for (let t = 0; t < p; t++) {
			let h = u ? f[t] : f[t] = js(f[t]), g = h.type === fs;
			e ? (g && !u && t + 1 < p && js(f[t + 1]).type === fs && (c(i(e.data.slice(h.children.length)), r, a(e)), e.data = h.children), e = d(e, h, o, s, l, u)) : g && !h.children ? c(h.el = i(""), r) : (m || (m = !0, ki(r, 1) || yi()), n(null, h, r, null, o, s, Si(r), l));
		}
		return e;
	}, m = (e, t, n, r, i, s) => {
		let { slotScopeIds: u } = t;
		u && (i = i ? i.concat(u) : u);
		let d = o(e), f = p(a(e), t, d, n, r, i, s);
		return f && Ci(f) && f.data === "]" ? a(t.anchor = f) : (yi(), c(t.anchor = l("]"), d, f), f);
	}, g = (e, t, r, i, c, l) => {
		if (ji(e, t) || yi(), t.el = null, l) {
			let t = _(e);
			for (;;) {
				let n = a(e);
				if (n && n !== t) s(n);
				else break;
			}
		}
		let u = a(e), d = o(e);
		return s(e), n(null, t, d, u, r, i, Si(d), c), r && (r.vnode.el = t.el, Co(r, t.el)), u;
	}, _ = (e, t = "[", n = "]") => {
		let r = 0;
		for (; e;) if (e = a(e), e && Ci(e) && (e.data === t && r++, e.data === n)) {
			if (r === 0) return a(e);
			r--;
		}
		return e;
	}, v = (e, t, n) => {
		let r = t.parentNode;
		r && r.replaceChild(e, t);
		let i = n;
		for (; i;) i.vnode.el === t && (i.vnode.el = i.subTree.el = e), i = i.parent;
	}, y = (e) => e.nodeType === 1 && e.tagName === "TEMPLATE";
	return [u, d];
}
var Ti = /* @__PURE__ */ new Set([
	"src",
	"srcset",
	"href",
	"poster"
]);
function Ei(e, t, n) {
	return Ti.has(t) ? e.getAttribute(t) === (n == null ? null : `${n}`) : !1;
}
var Di = "data-allow-mismatch", Oi = {
	0: "text",
	1: "children",
	2: "class",
	3: "style",
	4: "attribute"
};
function ki(e, t) {
	if (t === 0 || t === 1) for (; e && !e.hasAttribute(Di);) e = e.parentElement;
	return Ai(e && e.getAttribute(Di), t);
}
function Ai(e, t) {
	if (e == null) return !1;
	if (e === "") return !0;
	{
		let n = e.split(",");
		return t === 0 && n.includes("children") ? !0 : n.includes(Oi[t]);
	}
}
function ji(e, t) {
	return ki(e.parentElement, 1) || Mi(e) || Ni(t);
}
function Mi(e) {
	return e.nodeType === 1 && Ai(e.getAttribute(Di), 1);
}
function Ni({ props: e }) {
	let t = e && e[Di];
	return typeof t == "string" && Ai(t, 1);
}
var Pi = _e().requestIdleCallback || ((e) => setTimeout(e, 1)), Fi = _e().cancelIdleCallback || ((e) => clearTimeout(e)), Ii = (e = 1e4) => (t) => {
	let n = Pi(t, { timeout: e });
	return () => Fi(n);
};
function Li(e) {
	let { top: t, left: n, bottom: r, right: i } = e.getBoundingClientRect(), { innerHeight: a, innerWidth: o } = window;
	return (t > 0 && t < a || r > 0 && r < a) && (n > 0 && n < o || i > 0 && i < o);
}
var Ri = (e) => (t, n) => {
	let r = new IntersectionObserver((e) => {
		for (let n of e) if (n.isIntersecting) {
			r.disconnect(), t();
			break;
		}
	}, e), i = (e) => {
		if (Li(e)) return t(), r.disconnect(), !1;
		if (getComputedStyle(e).display === "contents") {
			for (let t = 0; t < e.children.length; t++) if (i(e.children[t]) === !1) return !1;
		}
		r.observe(e);
	};
	return n((e) => {
		if (e instanceof Element) return i(e);
	}), () => r.disconnect();
}, zi = (e) => (t) => {
	if (e) {
		let n = matchMedia(e);
		if (n.matches) t();
		else return n.addEventListener("change", t, { once: !0 }), () => n.removeEventListener("change", t);
	}
}, Bi = (e = []) => (t, n) => {
	D(e) && (e = [e]);
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
function Vi(e, t) {
	if (Ci(e) && e.data === "[") {
		let n = 1, r = e.nextSibling;
		for (; r;) {
			if (r.nodeType === 1) {
				if (t(r) === !1) break;
			} else if (Ci(r)) {
				if (r.data === "]") {
					if (--n === 0) break;
				} else r.data === "[" && n++;
			}
			r = r.nextSibling;
		}
	} else t(e);
}
var Hi = (e) => !!e.type.__asyncLoader;
// @__NO_SIDE_EFFECTS__
function Ui(e) {
	E(e) && (e = { loader: e });
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
				let n = a(o, (t) => Vi(e, t));
				n && (t.bum ||= []).push(n);
			} : o;
			u ? s() : p().then(() => !t.isUnmounted && s());
		},
		get __asyncResolved() {
			return u;
		},
		setup() {
			let e = Bs;
			if (fi(e), u) return () => Wi(u, e);
			let t = (t) => {
				l = null, Jn(t, e, 13, !r);
			};
			if (s && e.suspense || Ks) return p().then((t) => () => Wi(t, e)).catch((e) => (t(e), () => r ? Z(r, { error: e }) : null));
			let a = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(), d = /* @__PURE__ */ L(!!i), f, m;
			return sa(() => {
				f != null && clearTimeout(f), m != null && clearTimeout(m);
			}), i && (m = setTimeout(() => {
				e.isUnmounted || (d.value = !1);
			}, i)), o != null && (f = setTimeout(() => {
				if (!e.isUnmounted && !a.value && !c.value) {
					let e = /* @__PURE__ */ Error(`Async component timed out after ${o}ms.`);
					t(e), c.value = e;
				}
			}, o)), p().then(() => {
				e.isUnmounted || (a.value = !0, e.parent && Gi(e.parent.vnode) && e.parent.update());
			}).catch((n) => {
				e.isUnmounted ? l = null : (t(n), c.value = n);
			}), () => {
				if (a.value && u) return Wi(u, e);
				if (c.value && r) return Z(r, { error: c.value });
				if (n && !d.value) return Wi(n, e);
			};
		}
	});
}
function Wi(e, t) {
	let { ref: n, props: r, children: i, ce: a } = t.vnode, o = Z(e, r, i);
	return o.ref = n, o.ce = a, delete t.vnode.ce, o;
}
var Gi = (e) => e.type.__isKeepAlive, Ki = {
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
		let n = Q(), r = n.ctx;
		if (!r.renderer) return () => {
			let e = t.default && t.default();
			return e && e.length === 1 ? e[0] : e;
		};
		let i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = null, s = n.suspense, { renderer: { p: c, m: l, um: u, o: { createElement: d } } } = r, f = d("div");
		r.activate = (e, t, n, r, i) => {
			let a = e.component;
			l(e, t, n, 0, s), c(a.vnode, e, t, n, a, s, r, e.slotScopeIds, i), W(() => {
				a.isDeactivated = !1, a.a && fe(a.a);
				let t = e.props && e.props.onVnodeMounted;
				t && Fs(t, a.parent, e);
			}, s);
		}, r.deactivate = (e) => {
			let t = e.component;
			Zo(t.m), Zo(t.a), l(e, f, null, 1, s), W(() => {
				t.da && fe(t.da);
				let n = e.props && e.props.onVnodeUnmounted;
				n && Fs(n, t.parent, e), t.isDeactivated = !0;
			}, s);
		};
		function p(e) {
			Qi(e), u(e, n, s, !0);
		}
		function m(e) {
			i.forEach((t, n) => {
				let r = ic(Hi(t) ? t.type.__asyncResolved || {} : t.type);
				r && !e(r) && h(n);
			});
		}
		function h(e) {
			let t = i.get(e);
			t && (!o || !xs(t, o)) ? p(t) : o && (Qi(o), t && Qi(t)), i.delete(e), a.delete(e);
		}
		V(() => [e.include, e.exclude], ([e, t]) => {
			e && m((t) => qi(e, t)), t && m((e) => !qi(t, e));
		}, {
			flush: "post",
			deep: !0
		});
		let g = null, _ = () => {
			g != null && ($o(n.subTree.type) ? W(() => {
				let e = $i(n.subTree);
				e.component && i.set(g, e);
			}, n.subTree.suspense) : i.set(g, $i(n.subTree)));
		};
		return ra(_), aa(_), oa(() => {
			i.forEach((e) => {
				let { subTree: t, suspense: r } = n, i = $i(t);
				if (e.type === i.type && e.key === i.key) {
					Qi(i);
					let e = i.component.da;
					e && W(e, r);
				} else p(e);
			});
		}), () => {
			if (g = null, !t.default) return o = null;
			let n = t.default(), r = n[0];
			if (n.length > 1) return o = null, n;
			if (!bs(r) || !(r.shapeFlag & 4) && !(r.shapeFlag & 128)) return o = null, r;
			let s = $i(r);
			if (s.type === K) return o = null, s;
			let c = s.type, l = ic(Hi(s) ? s.type.__asyncResolved || {} : c), { include: u, exclude: d, max: f } = e;
			if (u && (!l || !qi(u, l)) || d && l && qi(d, l)) return s.shapeFlag &= -257, o = s, r;
			let p = s.key == null ? c : s.key, m = i.get(p);
			return s.el && (s = Ds(s), r.shapeFlag & 128 && (r.ssContent = s)), g = p, m ? (s.el = m.el, s.component = m.component, s.transition && ci(s, s.transition), s.shapeFlag |= 512, a.delete(p), a.add(p)) : (a.add(p), f && a.size > parseInt(f, 10) && h(a.values().next().value)), s.shapeFlag |= 256, o = s, $o(r.type) ? r : s;
		};
	}
};
function qi(e, t) {
	return x(e) ? e.some((e) => qi(e, t)) : D(e) ? e.split(",").includes(t) : T(e) ? (e.lastIndex = 0, e.test(t)) : !1;
}
function Ji(e, t) {
	Xi(e, "a", t);
}
function Yi(e, t) {
	Xi(e, "da", t);
}
function Xi(e, t, n = Bs) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (ea(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) Gi(e.parent.vnode) && Zi(r, t, n, e), e = e.parent;
	}
}
function Zi(e, t, n, r) {
	let i = ea(t, e, r, !0);
	sa(() => {
		v(r[t], i);
	}, n);
}
function Qi(e) {
	e.shapeFlag &= -257, e.shapeFlag &= -513;
}
function $i(e) {
	return e.shapeFlag & 128 ? e.ssContent : e;
}
function ea(e, t, n = Bs, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			st();
			let i = Us(n), a = qn(t, n, e, r);
			return i(), ct(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var ta = (e) => (t, n = Bs) => {
	Ks && e !== "sp" || ea(e, (...e) => t(...e), n);
}, na = ta("bm"), ra = ta("m"), ia = ta("bu"), aa = ta("u"), oa = ta("bum"), sa = ta("um"), ca = ta("sp"), la = ta("rtg"), ua = ta("rtc");
function da(e, t = Bs) {
	ea("ec", e, t);
}
var fa = "components", pa = "directives";
function ma(e, t) {
	return va(fa, e, !0, t) || e;
}
var ha = /* @__PURE__ */ Symbol.for("v-ndc");
function ga(e) {
	return D(e) ? va(fa, e, !1) || e : e || ha;
}
function _a(e) {
	return va(pa, e);
}
function va(e, t, n = !0, r = !1) {
	let i = _r || Bs;
	if (i) {
		let n = i.type;
		if (e === fa) {
			let e = ic(n, !1);
			if (e && (e === t || e === j(t) || e === ue(j(t)))) return n;
		}
		let a = ya(i[e] || n[e], t) || ya(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function ya(e, t) {
	return e && (e[t] || e[j(t)] || e[ue(j(t))]);
}
function ba(e, t, n, r) {
	let i, a = n && n[r], o = x(e);
	if (o || D(e)) {
		let n = o && /* @__PURE__ */ ln(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ dn(e), s = /* @__PURE__ */ un(e), e = St(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? hn(mn(e[n])) : mn(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		if (!Number.isInteger(e) || e < 0) i = [];
		else {
			i = Array(e);
			for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
		}
	} else if (k(e)) {
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
function xa(e, t) {
	for (let n = 0; n < t.length; n++) {
		let r = t[n];
		if (x(r)) for (let t = 0; t < r.length; t++) e[r[t].name] = r[t].fn;
		else r && (e[r.name] = r.key ? (...e) => {
			let t = r.fn(...e);
			return t && (t.key = r.key), t;
		} : r.fn);
	}
	return e;
}
function U(e, t, n, r, i, a) {
	if (n ??= {}, _r.ce || _r.parent && Hi(_r.parent) && _r.parent.ce) {
		let e = a != null && n.key == null ? _({}, n, { key: a }) : n, i = Object.keys(e).length > 0;
		return t !== "default" && (e.name = t), q(), Y(G, null, [Z("slot", e, r && r())], i ? -2 : 64);
	}
	let o = e[t];
	o && o._c && (o._d = !1);
	let s = ms.length;
	q();
	let c;
	try {
		let i = o && Sa(o(n)), s = n.key || a || i && i.key;
		c = Y(G, { key: (s && !O(s) ? s : `_${t}`) + (!i && r ? "_fb" : "") }, i || (r ? r() : []), i && e._ === 1 ? 64 : -2);
	} catch (e) {
		for (let e = ms.length; e > s; e--) gs();
		throw e;
	} finally {
		o && o._c && (o._d = !0);
	}
	return !i && c.scopeId && (c.slotScopeIds = [c.scopeId + "-s"]), c;
}
function Sa(e) {
	return e.some((e) => !bs(e) || !(e.type === K || e.type === G && !Sa(e.children))) ? e : null;
}
function Ca(e, t) {
	let n = {};
	for (let r in e) n[t && /[A-Z]/.test(r) ? `on:${r}` : de(r)] = e[r];
	return n;
}
var wa = (e) => e ? Gs(e) ? rc(e) : wa(e.parent) : null, Ta = /* @__PURE__ */ _(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => wa(e.parent),
	$root: (e) => wa(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => Ya(e),
	$forceUpdate: (e) => e.f ||= () => {
		ar(e.update);
	},
	$nextTick: (e) => e.n ||= rr.bind(e.proxy),
	$watch: (e) => Pr.bind(e)
}), Ea = (e, t) => e !== d && !e.__isScriptSetup && b(e, t), Da = {
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
			else if (Ea(r, t)) return o[t] = 1, r[t];
			else if (i !== d && b(i, t)) return o[t] = 2, i[t];
			else if (b(a, t)) return o[t] = 3, a[t];
			else if (n !== d && b(n, t)) return o[t] = 4, n[t];
			else Wa && (o[t] = 0);
		}
		let l = Ta[t], u, f;
		if (l) return t === "$attrs" && vt(e.attrs, "get", ""), l(e);
		if ((u = s.__cssModules) && (u = u[t])) return u;
		if (n !== d && b(n, t)) return o[t] = 4, n[t];
		if (f = c.config.globalProperties, b(f, t)) return f[t];
	},
	set({ _: e }, t, n) {
		let { data: r, setupState: i, ctx: a } = e;
		return Ea(i, t) ? (i[t] = n, !0) : r !== d && b(r, t) ? (r[t] = n, !0) : b(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (a[t] = n, !0);
	},
	has({ _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: i, props: a, type: o } }, s) {
		let c;
		return !!(n[s] || e !== d && s[0] !== "$" && b(e, s) || Ea(t, s) || b(a, s) || b(r, s) || b(Ta, s) || b(i.config.globalProperties, s) || (c = o.__cssModules) && c[s]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? b(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
}, Oa = /* @__PURE__ */ _({}, Da, {
	get(e, t) {
		if (t !== Symbol.unscopables) return Da.get(e, t, e);
	},
	has(e, t) {
		return t[0] !== "_" && !ve(t);
	}
});
function ka() {
	return null;
}
function Aa() {
	return null;
}
function ja(e) {}
function Ma(e) {}
function Na() {
	return null;
}
function Pa() {}
function Fa(e, t) {
	return null;
}
function Ia() {
	return Ra("useSlots").slots;
}
function La() {
	return Ra("useAttrs").attrs;
}
function Ra(e) {
	let t = Q();
	return t.setupContext ||= nc(t);
}
function za(e) {
	return x(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Ba(e, t) {
	let n = za(e);
	for (let e in t) {
		if (e.startsWith("__skip")) continue;
		let r = n[e];
		r ? x(r) || E(r) ? r = n[e] = {
			type: r,
			default: t[e]
		} : r.default = t[e] : r === null && (r = n[e] = { default: t[e] }), r && t[`__skip_${e}`] && (r.skipFactory = !0);
	}
	return n;
}
function Va(e, t) {
	return !e || !t ? e || t : x(e) && x(t) ? e.concat(t) : _({}, za(e), za(t));
}
function Ha(e, t) {
	let n = {};
	for (let r in e) t.includes(r) || Object.defineProperty(n, r, {
		enumerable: !0,
		get: () => e[r]
	});
	return n;
}
function Ua(e) {
	let t = Q(), n = Ks, r = e();
	Ws(), n && Hs(!1);
	let i = () => {
		Us(t), n && Hs(!0);
	}, a = () => {
		Q() !== t && t.scope.off(), Ws(), n && Hs(!1);
	};
	return ee(r) && (r = r.catch((e) => {
		throw i(), Promise.resolve().then(() => Promise.resolve().then(a)), e;
	})), [r, () => {
		i(), Promise.resolve().then(a);
	}];
}
var Wa = !0;
function Ga(e) {
	let t = Ya(e), n = e.proxy, r = e.ctx;
	Wa = !1, t.beforeCreate && qa(t.beforeCreate, e, "bc");
	let { data: i, computed: a, methods: o, watch: s, provide: c, inject: l, created: u, beforeMount: d, mounted: f, beforeUpdate: m, updated: h, activated: g, deactivated: _, beforeDestroy: v, beforeUnmount: y, destroyed: b, unmounted: S, render: C, renderTracked: w, renderTriggered: T, errorCaptured: D, serverPrefetch: O, expose: ee, inheritAttrs: te, components: ne, directives: re, filters: ie } = t;
	if (l && Ka(l, r, null), o) for (let e in o) {
		let t = o[e];
		E(t) && (r[e] = t.bind(n));
	}
	if (i) {
		let t = i.call(n, n);
		k(t) && (e.data = /* @__PURE__ */ rn(t));
	}
	if (Wa = !0, a) for (let e in a) {
		let t = a[e], i = $({
			get: E(t) ? t.bind(n, n) : E(t.get) ? t.get.bind(n, n) : p,
			set: !E(t) && E(t.set) ? t.set.bind(n) : p
		});
		Object.defineProperty(r, e, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		});
	}
	if (s) for (let e in s) Ja(s[e], r, n, e);
	if (c) {
		let e = E(c) ? c.call(n) : c;
		Reflect.ownKeys(e).forEach((t) => {
			Tr(t, e[t]);
		});
	}
	u && qa(u, e, "c");
	function A(e, t) {
		x(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (A(na, d), A(ra, f), A(ia, m), A(aa, h), A(Ji, g), A(Yi, _), A(da, D), A(ua, w), A(la, T), A(oa, y), A(sa, S), A(ca, O), x(ee)) {
		if (ee.length) {
			let t = e.exposed ||= {};
			ee.forEach((e) => {
				Object.defineProperty(t, e, {
					get: () => n[e],
					set: (t) => n[e] = t,
					enumerable: !0
				});
			});
		} else e.exposed ||= {};
	}
	C && e.render === p && (e.render = C), te != null && (e.inheritAttrs = te), ne && (e.components = ne), re && (e.directives = re), O && fi(e);
}
function Ka(e, t, n = p) {
	x(e) && (e = eo(e));
	for (let n in e) {
		let r = e[n], i;
		i = k(r) ? "default" in r ? Er(r.from || n, r.default, !0) : Er(r.from || n) : Er(r), /* @__PURE__ */ I(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function qa(e, t, n) {
	qn(x(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Ja(e, t, n, r) {
	let i = r.includes(".") ? Fr(n, r) : () => n[r];
	if (D(e)) {
		let n = t[e];
		E(n) && V(i, n);
	} else if (E(e)) V(i, e.bind(n));
	else if (k(e)) {
		if (x(e)) e.forEach((e) => Ja(e, t, n, r));
		else {
			let r = E(e.handler) ? e.handler.bind(n) : t[e.handler];
			E(r) && V(i, r, e);
		}
	}
}
function Ya(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Xa(c, e, o, !0)), Xa(c, t, o)), k(t) && a.set(t, c), c;
}
function Xa(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Xa(e, a, n, !0), i && i.forEach((t) => Xa(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = Za[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Za = {
	data: Qa,
	props: ro,
	emits: ro,
	methods: no,
	computed: no,
	beforeCreate: to,
	created: to,
	beforeMount: to,
	mounted: to,
	beforeUpdate: to,
	updated: to,
	beforeDestroy: to,
	beforeUnmount: to,
	destroyed: to,
	unmounted: to,
	activated: to,
	deactivated: to,
	errorCaptured: to,
	serverPrefetch: to,
	components: no,
	directives: no,
	watch: io,
	provide: Qa,
	inject: $a
};
function Qa(e, t) {
	return t ? e ? function() {
		return _(E(e) ? e.call(this, this) : e, E(t) ? t.call(this, this) : t);
	} : t : e;
}
function $a(e, t) {
	return no(eo(e), eo(t));
}
function eo(e) {
	if (x(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function to(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function no(e, t) {
	return e ? _(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function ro(e, t) {
	return e ? x(e) && x(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : _(/* @__PURE__ */ Object.create(null), za(e), za(t ?? {})) : t;
}
function io(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = _(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = to(e[r], t[r]);
	return n;
}
function ao() {
	return {
		app: null,
		config: {
			isNativeTag: m,
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
var oo = 0;
function so(e, t) {
	return function(n, r = null) {
		E(n) || (n = _({}, n)), r != null && !k(r) && (r = null);
		let i = ao(), a = /* @__PURE__ */ new WeakSet(), o = [], s = !1, c = i.app = {
			_uid: oo++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: uc,
			get config() {
				return i.config;
			},
			set config(e) {},
			use(e, ...t) {
				return a.has(e) || (e && E(e.install) ? (a.add(e), e.install(c, ...t)) : E(e) && (a.add(e), e(c, ...t))), c;
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
					let u = c._ceVNode || Z(n, r);
					return u.appContext = i, l === !0 ? l = "svg" : l === !1 && (l = void 0), o && t ? t(u, a) : e(u, a, l), s = !0, c._container = a, a.__vue_app__ = c, rc(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				s && (qn(o, c._instance, 16), e(null, c._container), delete c._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, c;
			},
			runWithContext(e) {
				let t = co;
				co = c;
				try {
					return e();
				} finally {
					co = t;
				}
			}
		};
		return c;
	};
}
var co = null;
function lo(e, t, n = d) {
	let r = Q(), i = j(t), a = le(t), o = uo(e, i), s = Cn((o, s) => {
		let c, l = d, u;
		return Mr(() => {
			let t = e[i];
			M(c, t) && (c = t, s());
		}), {
			get() {
				return o(), n.get ? n.get(c) : c;
			},
			set(e) {
				let o = n.set ? n.set(e) : e;
				if (!M(o, c) && !(l !== d && M(e, l))) return;
				let f = r.vnode.props, p = !!(f && (t in f || i in f || a in f) && (`onUpdate:${t}` in f || `onUpdate:${i}` in f || `onUpdate:${a}` in f));
				p || (c = e, s()), r.emit(`update:${t}`, o), M(e, l) && (M(e, o) && !M(o, u) || p && l !== d && !M(o, c)) && s(), l = e, u = o;
			}
		};
	});
	return s[Symbol.iterator] = () => {
		let e = 0;
		return { next() {
			return e < 2 ? {
				value: e++ ? o || d : s,
				done: !1
			} : { done: !0 };
		} };
	}, s;
}
var uo = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${j(t)}Modifiers`] || e[`${le(t)}Modifiers`];
function fo(e, t, ...n) {
	if (e.isUnmounted) return;
	let r = e.vnode.props || d, i = n, a = t.startsWith("update:"), o = a && uo(r, t.slice(7));
	o && (o.trim && (i = n.map((e) => D(e) ? e.trim() : e)), o.number && (i = i.map(me)));
	let s, c = r[s = de(t)] || r[s = de(j(t))];
	!c && a && (c = r[s = de(le(t))]), c && qn(c, e, 6, i);
	let l = r[s + "Once"];
	if (l) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[s]) return;
		e.emitted[s] = !0, qn(l, e, 6, i);
	}
}
var po = /* @__PURE__ */ new WeakMap();
function mo(e, t, n = !1) {
	let r = n ? po : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, s = !1;
	if (!E(e)) {
		let r = (e) => {
			let n = mo(e, t, !0);
			n && (s = !0, _(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !s ? (k(e) && r.set(e, null), null) : (x(a) ? a.forEach((e) => o[e] = null) : _(o, a), k(e) && r.set(e, o), o);
}
function ho(e, t) {
	return !e || !h(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), b(e, t[0].toLowerCase() + t.slice(1)) || b(e, le(t)) || b(e, t));
}
function go(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: o, attrs: s, emit: c, render: l, renderCache: u, props: d, data: f, setupState: p, ctx: m, inheritAttrs: h } = e, _ = yr(e), v, y;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			v = js(l.call(t, e, u, d, p, f, m)), y = s;
		} else {
			let e = t;
			v = js(e.length > 1 ? e(d, {
				attrs: s,
				slots: o,
				emit: c
			}) : e(d, null)), y = t.props ? s : vo(s);
		}
	} catch (t) {
		ms.length = 0, Jn(t, e, 1), v = Z(K);
	}
	let b = v;
	if (y && h !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(g) && (y = yo(y, a)), b = Ds(b, y, !1, !0));
	}
	return n.dirs && (b = Ds(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && ci(Rr(b.type) && si(b) || b, n.transition), v = b, yr(_), v;
}
function _o(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (bs(r)) {
			if (r.type !== K || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var vo = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || h(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, yo = (e, t) => {
	let n = {};
	for (let r in e) g(r) && r.slice(9) in t || (n[r] = e[r]);
	return n;
};
function bo(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? xo(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (So(o, r, n) && !ho(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || xo(r, o, l) : !!o;
	return !1;
}
function xo(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!b(e, a) || So(t, e, a) && !ho(n, a)) return !0;
	}
	return !1;
}
function So(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && k(r) && k(i) ? !Me(r, i) : r !== i;
}
function Co({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var wo = {}, To = () => Object.create(wo), Eo = (e) => Object.getPrototypeOf(e) === wo;
function Do(e, t, n, r = !1) {
	let i = {}, a = To();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), ko(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ an(i) : e.type.props ? i : a, e.attrs = a;
}
function Oo(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ F(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (ho(e.emitsOptions, o)) continue;
				let u = t[o];
				if (c) {
					if (b(a, o)) u !== a[o] && (a[o] = u, l = !0);
					else {
						let t = j(o);
						i[t] = Ao(c, s, t, u, e, !1);
					}
				} else u !== a[o] && (a[o] = u, l = !0);
			}
		}
	} else {
		ko(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) t && (b(t, a) || (r = le(a)) !== a && b(t, r)) || (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Ao(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) t && b(t, e) || (delete a[e], l = !0);
	}
	l && yt(e.attrs, "set", "");
}
function ko(e, t, n, r) {
	let [i, a] = e.propsOptions, o = !1, s;
	if (t) for (let c in t) {
		if (ae(c)) continue;
		let l = t[c], u;
		i && b(i, u = j(c)) ? !a || !a.includes(u) ? n[u] = l : (s ||= {})[u] = l : ho(e.emitsOptions, c) || c in r && l === r[c] || (r[c] = l, o = !0);
	}
	if (a) {
		let t = /* @__PURE__ */ F(n), r = s || d;
		for (let o = 0; o < a.length; o++) {
			let s = a[o];
			n[s] = Ao(i, t, s, r[s], e, !b(r, s));
		}
	}
	return o;
}
function Ao(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = b(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && E(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = Us(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === le(n)) && (r = !0));
	}
	return r;
}
var jo = /* @__PURE__ */ new WeakMap();
function Mo(e, t, n = !1) {
	let r = n ? jo : t.propsCache, i = r.get(e);
	if (i) return i;
	let a = e.props, o = {}, s = [], c = !1;
	if (!E(e)) {
		let r = (e) => {
			c = !0;
			let [n, r] = Mo(e, t, !0);
			_(o, n), r && s.push(...r);
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	if (!a && !c) return k(e) && r.set(e, f), f;
	if (x(a)) for (let e = 0; e < a.length; e++) {
		let t = j(a[e]);
		No(t) && (o[t] = d);
	}
	else if (a) for (let e in a) {
		let t = j(e);
		if (No(t)) {
			let n = a[e], r = o[t] = x(n) || E(n) ? { type: n } : _({}, n), i = r.type, c = !1, l = !0;
			if (x(i)) for (let e = 0; e < i.length; ++e) {
				let t = i[e], n = E(t) && t.name;
				if (n === "Boolean") {
					c = !0;
					break;
				}
				n === "String" && (l = !1);
			}
			else c = E(i) && i.name === "Boolean";
			r[0] = c, r[1] = l, (c || b(r, "default")) && s.push(t);
		}
	}
	let l = [o, s];
	return k(e) && r.set(e, l), l;
}
function No(e) {
	return e[0] !== "$" && !ae(e);
}
var Po = (e) => e === "_" || e === "_ctx" || e === "$stable", Fo = (e) => x(e) ? e.map(js) : [js(e)], Io = (e, t, n) => {
	if (t._n) return t;
	let r = B((...e) => Fo(t(...e)), n);
	return r._c = !1, r;
}, Lo = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Po(n)) continue;
		let i = e[n];
		if (E(i)) t[n] = Io(n, i, r);
		else if (i != null) {
			let e = Fo(i);
			t[n] = () => e;
		}
	}
}, Ro = (e, t) => {
	let n = Fo(t);
	e.slots.default = () => n;
}, zo = (e, t, n) => {
	for (let r in t) (n || !Po(r)) && (e[r] = t[r]);
}, Bo = (e, t, n) => {
	let r = e.slots = To();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (zo(r, t, n), n && pe(r, "_", e, !0)) : Lo(t, r);
	} else t && Ro(e, t);
}, Vo = (e, t, n) => {
	let { vnode: r, slots: i } = e, a = !0, o = d;
	if (r.shapeFlag & 32) {
		let e = t._;
		e ? n && e === 1 ? a = !1 : zo(i, t, n) : (a = !t.$stable, Lo(t, i)), o = t;
	} else t && (Ro(e, t), o = { default: 1 });
	if (a) for (let e in i) !Po(e) && o[e] == null && delete i[e];
}, W = ls;
function Ho(e) {
	return Wo(e);
}
function Uo(e) {
	return Wo(e, wi);
}
function Wo(e, t) {
	let n = _e();
	n.__VUE__ = !0;
	let { insert: r, remove: i, patchProp: a, createElement: o, createText: s, createComment: c, setText: l, setElementText: u, parentNode: m, nextSibling: h, setScopeId: g = p, insertStaticContent: _ } = e, v = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !xs(e, t) && (r = he(e), ue(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === f && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case fs:
				y(e, t, n, r);
				break;
			case K:
				b(e, t, n, r);
				break;
			case ps:
				e ?? x(t, n, r, o);
				break;
			case G:
				te(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? w(e, t, n, r, i, a, o, s, c) : d & 6 ? ne(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, ve);
		}
		u != null && i ? gi(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && gi(e.ref, null, a, e, !0);
	}, y = (e, t, n, i) => {
		if (e == null) r(t.el = s(t.children), n, i);
		else {
			let n = t.el = e.el;
			t.children !== e.children && l(n, t.children);
		}
	}, b = (e, t, n, i) => {
		e == null ? r(t.el = c(t.children || ""), n, i) : t.el = e.el;
	}, x = (e, t, n, r) => {
		[e.el, e.anchor] = _(e.children, t, n, r, e.el, e.anchor);
	}, S = ({ el: e, anchor: t }, n, i) => {
		let a;
		for (; e && e !== t;) a = h(e), r(e, n, i), e = a;
		r(t, n, i);
	}, C = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = h(e), i(e), e = n;
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
		if (f = e.el = o(e.type, c, m && m.is, m), h & 8 ? u(f, e.children) : h & 16 && D(e.children, f, null, i, s, Go(e, c), l, d), _ && wr(e, null, i, "created"), E(f, e, e.scopeId, l, i), m) {
			for (let e in m) e !== "value" && !ae(e) && a(f, e, null, m[e], c, i);
			"value" in m && a(f, "value", null, m.value, c), (p = m.onVnodeBeforeMount) && Fs(p, i, e);
		}
		_ && wr(e, null, i, "beforeMount");
		let v = qo(s, g);
		v && g.beforeEnter(f), r(f, t, n), ((p = m && m.onVnodeMounted) || v || _) && W(() => {
			try {
				p && Fs(p, i, e), v && g.enter(f), _ && wr(e, null, i, "mounted");
			} finally {}
		}, s);
	}, E = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || $o(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				E(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, D = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? Ms(e[l]) : js(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, O = (e, t, n, r, i, o, s) => {
		let c = t.el = e.el, { patchFlag: l, dynamicChildren: f, dirs: p } = t;
		l |= e.patchFlag & 16;
		let m = e.props || d, h = t.props || d, g;
		if (n && Ko(n, !1), (g = h.onVnodeBeforeUpdate) && Fs(g, n, t, e), p && wr(t, e, n, "beforeUpdate"), n && Ko(n, !0), f && (!e.dynamicChildren || e.dynamicChildren.length !== f.length) && (l = 0, s = !1, f = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && u(c, ""), f ? k(e.dynamicChildren, f, c, n, r, Go(t, i), o) : s || se(e, t, c, null, n, r, Go(t, i), o, !1), l > 0) {
			if (l & 16) ee(c, m, h, n, i);
			else if (l & 2 && m.class !== h.class && a(c, "class", null, h.class, i), l & 4 && a(c, "style", m.style, h.style, i), l & 8) {
				let e = t.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let r = e[t], o = m[r], s = h[r];
					(s !== o || r === "value") && a(c, r, o, s, i, n);
				}
			}
			l & 1 && e.children !== t.children && u(c, t.children);
		} else !s && f == null && ee(c, m, h, n, i);
		((g = h.onVnodeUpdated) || p) && W(() => {
			g && Fs(g, n, t, e), p && wr(t, e, n, "updated");
		}, r);
	}, k = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || Qo(c), d = u && (c.type === G || !xs(c, l) || c.shapeFlag & 198) ? m(u) : n;
			v(c, l, d, null, r, i, a, o, !0);
		}
	}, ee = (e, t, n, r, i) => {
		if (t !== n) {
			if (t !== d) for (let o in t) !ae(o) && !(o in n) && a(e, o, t[o], null, i, r);
			for (let o in n) {
				if (ae(o)) continue;
				let s = n[o], c = t[o];
				s !== c && o !== "value" && a(e, o, c, s, i, r);
			}
			"value" in n && a(e, "value", t.value, n.value, i);
		}
	}, te = (e, t, n, i, a, o, c, l, u) => {
		let d = t.el = e ? e.el : s(""), f = t.anchor = e ? e.anchor : s(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (l = l ? l.concat(h) : h), e == null ? (r(d, n, i), r(f, n, i), D(t.children || [], n, f, a, o, c, l, u)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (k(e.dynamicChildren, m, n, a, o, c, l), (t.key != null || a && t === a.subTree) && Jo(e, t, !0)) : se(e, t, n, f, a, o, c, l, u);
	}, ne = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : re(t, n, r, i, a, o, c) : ie(e, t, c);
	}, re = (e, t, n, r, i, a, o) => {
		let s = e.component = zs(e, r, i);
		if (Gi(e) && (s.ctx.renderer = ve), qs(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, A, o, a), !e.el) {
				let r = s.subTree = Z(K);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else A(s, e, t, n, i, a, o);
	}, ie = (e, t, n) => {
		let r = t.component = e.component;
		if (bo(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, oe(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, A = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = Xo(e);
					if (n) {
						t && (t.el = c.el, oe(e, t, o)), n.asyncDep.then(() => {
							W(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				Ko(e, !1), t ? (t.el = c.el, oe(e, t, o)) : t = c, n && fe(n), (d = t.props && t.props.onVnodeBeforeUpdate) && Fs(d, s, t, c), Ko(e, !0);
				let f = go(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), he(p), e, i, a), t.el = f.el, u === null && Co(e, f.el), r && W(r, i), (d = t.props && t.props.onVnodeUpdated) && W(() => Fs(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = Hi(t);
				if (Ko(e, !1), l && fe(l), !m && (o = c && c.onVnodeBeforeMount) && Fs(o, d, t), Ko(e, !0), s && be) {
					let t = () => {
						e.subTree = go(e), be(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = go(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && W(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					W(() => Fs(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && Hi(d.vnode) && d.vnode.shapeFlag & 256) && e.a && W(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new We(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => ar(u), Ko(e, !0), l();
	}, oe = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Oo(e, t.props, r, n), Vo(e, t.children, n), st(), cr(e), ct();
	}, se = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, d = e ? e.shapeFlag : 0, f = t.children, { patchFlag: p, shapeFlag: m } = t;
		if (p > 0) {
			if (p & 128) {
				ce(l, f, n, r, i, a, o, s, c);
				return;
			}
			if (p & 256) {
				j(l, f, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (d & 16 && me(l, i, a), f !== l && u(n, f)) : d & 16 ? m & 16 ? ce(l, f, n, r, i, a, o, s, c) : me(l, i, a, !0) : (d & 8 && u(n, ""), m & 16 && D(f, n, r, i, a, o, s, c));
	}, j = (e, t, n, r, i, a, o, s, c) => {
		e ||= f, t ||= f;
		let l = e.length, u = t.length, d = Math.min(l, u), p = 0;
		for (; p < d; p++) {
			let r = t[p] = c ? Ms(t[p]) : js(t[p]);
			v(e[p], r, n, null, i, a, o, s, c);
		}
		l > u ? me(e, i, a, !0, !1, d) : D(t, n, r, i, a, o, s, c, d);
	}, ce = (e, t, n, r, i, a, o, s, c) => {
		let l = 0, u = t.length, d = e.length - 1, p = u - 1;
		for (; l <= d && l <= p;) {
			let r = e[l], u = t[l] = c ? Ms(t[l]) : js(t[l]);
			if (xs(r, u)) v(r, u, n, null, i, a, o, s, c);
			else break;
			l++;
		}
		for (; l <= d && l <= p;) {
			let r = e[d], l = t[p] = c ? Ms(t[p]) : js(t[p]);
			if (xs(r, l)) v(r, l, n, null, i, a, o, s, c);
			else break;
			d--, p--;
		}
		if (l > d) {
			if (l <= p) {
				let e = p + 1, d = e < u ? t[e].el : r;
				for (; l <= p;) v(null, t[l] = c ? Ms(t[l]) : js(t[l]), n, d, i, a, o, s, c), l++;
			}
		} else if (l > p) for (; l <= d;) ue(e[l], i, a, !0), l++;
		else {
			let m = l, h = l, g = /* @__PURE__ */ new Map();
			for (l = h; l <= p; l++) {
				let e = t[l] = c ? Ms(t[l]) : js(t[l]);
				e.key != null && g.set(e.key, l);
			}
			let _, y = 0, b = p - h + 1, x = !1, S = 0, C = Array(b);
			for (l = 0; l < b; l++) C[l] = 0;
			for (l = m; l <= d; l++) {
				let r = e[l];
				if (y >= b) {
					ue(r, i, a, !0);
					continue;
				}
				let u;
				if (r.key != null) u = g.get(r.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && xs(r, t[_])) {
					u = _;
					break;
				}
				u === void 0 ? ue(r, i, a, !0) : (C[u - h] = l + 1, u >= S ? S = u : x = !0, v(r, t[u], n, null, i, a, o, s, c), y++);
			}
			let w = x ? Yo(C) : f;
			for (_ = w.length - 1, l = b - 1; l >= 0; l--) {
				let e = h + l, d = t[e], f = t[e + 1], p = e + 1 < u ? f.el || Qo(f) : r;
				C[l] === 0 ? v(null, d, n, p, i, a, o, s, c) : x && (_ < 0 || l !== w[_] ? le(d, n, p, 2) : _--);
			}
		}
	}, le = (e, t, n, a, o = null) => {
		let { el: s, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) le(e.component.subTree, t, n, a);
		else if (d & 128) e.suspense.move(t, n, a);
		else if (d & 64) c.move(e, t, n, ve);
		else if (c === G) {
			r(s, t, n);
			for (let e = 0; e < u.length; e++) le(u[e], t, n, a);
			r(e.anchor, t, n);
		} else if (c === ps) S(e, t, n);
		else if (a !== 2 && d & 1 && l) {
			if (a === 0) l.persisted && !s[Xr] ? r(s, t, n) : (l.beforeEnter(s), r(s, t, n), W(() => l.enter(s), o));
			else {
				let { leave: a, delayLeave: o, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? i(s) : r(s, t, n);
				}, d = () => {
					let e = s._isLeaving || !!s[Xr];
					s._isLeaving && s[Xr](!0), l.persisted && !e ? u() : a(s, () => {
						u(), c && c();
					});
				};
				o ? o(s, u, d) : d();
			}
		} else r(s, t, n);
	}, ue = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (st(), gi(s, null, n, e, !0), ct()), p == null || e.ctx && e.ctx !== t || (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !Hi(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && Fs(_, t, e), u & 6) pe(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && wr(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ve, r) : l && !l.hasOnce && (a !== G || d > 0 && d & 64) ? me(l, t, n, !1, !0) : (a === G && d & 384 || !i && u & 16) && me(c, t, n), r && de(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && W(() => {
			_ && Fs(_, t, e), h && wr(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, de = (e) => {
		let { type: t, el: n, anchor: r, transition: a } = e, o = t === G;
		if (o && !a) {
			M(n, r);
			return;
		}
		if (t === ps) {
			C(e), a && !a.persisted && a.afterLeave && a.afterLeave();
			return;
		}
		let s = o ? ui(e) : e, c = () => {
			o ? m(n) && M(n, r) : i(n), a && !a.persisted && a.afterLeave && a.afterLeave();
		};
		if (s && s.shapeFlag & 1 && a && !a.persisted) {
			let { leave: e, delayLeave: t } = a, n = s.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, M = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), i(e), e = n;
		i(t);
	}, pe = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		Zo(c), Zo(l), r && fe(r), i.stop(), a ? (a.flags |= 8, ue(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, ue(o, e, t, n)), s && W(s, t), W(() => {
			e.isUnmounted = !0;
		}, t);
	}, me = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) ue(e[o], t, n, r, i);
	}, he = (e) => {
		if (e.shapeFlag & 6) return he(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Lr];
		return n ? h(n) : t;
	}, ge = (e, t, n) => {
		dr(() => {
			e == null ? t._vnode && ue(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : Rs());
	}, ve = {
		p: v,
		um: ue,
		m: le,
		r: de,
		mt: re,
		mc: D,
		pc: se,
		pbc: k,
		n: he,
		o: e
	}, ye, be;
	return t && ([ye, be] = t(ve)), {
		render: ge,
		hydrate: ye,
		createApp: so(ge, ye)
	};
}
function Go({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Ko({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function qo(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Jo(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (x(r) && x(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = Ms(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && Jo(t, a)), a.type === fs && (a.patchFlag === -1 && (a = i[e] = Ms(a)), a.el = t.el), a.type === K && !a.el && (a.el = t.el);
	}
}
function Yo(e) {
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
function Xo(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : Xo(t);
}
function Zo(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Qo(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? Qo(t.subTree) : null;
}
var $o = (e) => e.__isSuspense, es = 0, ts = {
	name: "Suspense",
	__isSuspense: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		if (e == null) rs(t, n, r, i, a, o, s, c, l);
		else {
			if (a && a.deps > 0 && !e.suspense.isInFallback && !a.isHydrating) {
				t.suspense = e.suspense, t.suspense.vnode = t, t.el = e.el;
				return;
			}
			is(e, t, n, r, i, o, s, c, l);
		}
	},
	hydrate: os,
	normalize: ss
};
function ns(e, t) {
	let n = e.props && e.props[t];
	E(n) && n();
}
function rs(e, t, n, r, i, a, o, s, c) {
	let { p: l, o: { createElement: u } } = c, d = u("div"), f = e.suspense = as(e, i, r, t, d, n, a, o, s, c);
	l(null, f.pendingBranch = e.ssContent, d, null, r, f, a, o), f.deps > 0 ? (ns(e, "onPending"), ns(e, "onFallback"), l(null, e.ssFallback, t, n, r, null, a, o), us(f, e.ssFallback)) : f.resolve(!1, !0);
}
function is(e, t, n, r, i, a, o, s, { p: c, um: l, o: { createElement: u } }) {
	let d = t.suspense = e.suspense;
	d.vnode = t, t.el = e.el;
	let f = t.ssContent, p = t.ssFallback, { activeBranch: m, pendingBranch: h, isInFallback: g, isHydrating: _ } = d;
	if (h) d.pendingBranch = f, xs(h, f) ? (d.deps++, c(h, f, _ ? n : d.hiddenContainer, null, i, d, a, o, s), d.deps--, d.deps <= 0 ? d.resolve() : g && !_ && !d.isFallbackMountPending && (c(m, p, n, r, i, null, a, o, s), us(d, p))) : (d.pendingId = es++, _ ? (d.isHydrating = !1, d.activeBranch = h) : l(h, i, d), d.deps = 0, d.effects.length = 0, d.hiddenContainer = u("div"), g ? (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 ? d.resolve() : d.isFallbackMountPending || (c(m, p, n, r, i, null, a, o, s), us(d, p))) : m && xs(m, f) ? (c(m, f, n, r, i, d, a, o, s), d.resolve(!0)) : (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 && d.resolve()));
	else if (m && xs(m, f)) c(m, f, n, r, i, d, a, o, s), us(d, f);
	else if (ns(t, "onPending"), d.pendingBranch = f, d.pendingId = f.shapeFlag & 512 ? f.component.suspenseId : es++, c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0) d.resolve();
	else {
		let { timeout: e, pendingId: t } = d;
		e > 0 ? setTimeout(() => {
			d.pendingId === t && d.fallback(p);
		}, e) : e === 0 && d.fallback(p);
	}
}
function as(e, t, n, r, i, a, o, s, c, l, u = !1) {
	let { p: d, m: f, um: p, n: m, o: { parentNode: h, remove: g } } = l, _, v = ds(e);
	v && t && t.pendingBranch && (_ = t.pendingId, t.deps++);
	let y = e.props ? he(e.props.timeout) : void 0, b = a, x = {
		vnode: e,
		parent: t,
		parentComponent: n,
		namespace: o,
		container: r,
		hiddenContainer: i,
		deps: 0,
		pendingId: es++,
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
					s === x.pendingId && (f(o, u, a === b && !e ? m(i) : a, 0), sr(c), d && r.ssFallback && (r.ssFallback.el = null));
				}), i && !x.isFallbackMountPending && (h(i.el) === u && (a = m(i), e = !0), p(i, l, x, !0), !g && d && r.ssFallback && W(() => r.ssFallback.el = null, x)), g || f(o, u, a, 0);
			}
			x.isFallbackMountPending = !1, us(x, o), x.pendingBranch = null, x.isInFallback = !1;
			let y = x.parent, S = !1;
			for (; y;) {
				if (y.pendingBranch) {
					for (let e = 0; e < c.length; e++) y.effects.push(c[e]);
					S = !0;
					break;
				}
				y = y.parent;
			}
			!S && !g && sr(c), x.effects = [], v && t && t.pendingBranch && _ === t.pendingId && (_ = void 0, t.deps--, t.deps === 0 && !n && t.resolve()), ns(r, "onResolve");
		},
		fallback(e) {
			if (!x.pendingBranch) return;
			let { vnode: t, activeBranch: n, parentComponent: r, container: i, namespace: a } = x;
			ns(t, "onFallback");
			let o = m(n), l = () => {
				if (x.isFallbackMountPending = !1, !x.isInFallback) return;
				let e = x.vnode.ssFallback;
				d(null, e, i, o, r, null, a, s, c), us(x, e);
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
				Jn(t, e, 0);
			}).then((o) => {
				if (e.isUnmounted || x.isUnmounted || x.pendingId !== e.suspenseId) return;
				if (Ws(), !e.scope.active) {
					i && --x.deps === 0 && x.resolve();
					return;
				}
				e.asyncResolved = !0;
				let { vnode: s } = e;
				Ys(e, o, !1), a && (s.el = a);
				let c = !a && e.subTree.el;
				t(e, s, h(a || e.subTree.el), a ? null : m(e.subTree), x, r, n), c && (s.placeholder = null, g(c)), Co(e, s.el), i && --x.deps === 0 && x.resolve();
			});
		},
		unmount(e, t) {
			x.isUnmounted = !0, x.activeBranch && p(x.activeBranch, n, e, t), x.pendingBranch && p(x.pendingBranch, n, e, t);
		}
	};
	return x;
}
function os(e, t, n, r, i, a, o, s, c) {
	let l = t.suspense = as(t, r, n, e.parentNode, document.createElement("div"), null, i, a, o, s, !0), u = c(e, l.pendingBranch = t.ssContent, n, l, a, o);
	return l.deps === 0 && l.resolve(!1, !0), u;
}
function ss(e) {
	let { shapeFlag: t, children: n } = e, r = t & 32;
	e.ssContent = cs(r ? n.default : n), e.ssFallback = r ? cs(n.fallback) : Z(K);
}
function cs(e) {
	let t;
	if (E(e)) {
		let n = _s && e._c;
		n && (e._d = !1, q()), e = e(), n && (e._d = !0, t = hs, gs());
	}
	return x(e) && (e = _o(e)), e = js(e), t && !e.dynamicChildren && (e.dynamicChildren = t.filter((t) => t !== e)), e;
}
function ls(e, t) {
	t && t.pendingBranch ? x(e) ? t.effects.push(...e) : t.effects.push(e) : sr(e);
}
function us(e, t) {
	e.activeBranch = t;
	let { vnode: n, parentComponent: r } = e, i = t.el;
	for (; !i && t.component;) t = t.component.subTree, i = t.el;
	n.el = i, r && r.subTree === n && (r.vnode.el = i, Co(r, i));
}
function ds(e) {
	let t = e.props && e.props.suspensible;
	return t != null && t !== !1;
}
var G = /* @__PURE__ */ Symbol.for("v-fgt"), fs = /* @__PURE__ */ Symbol.for("v-txt"), K = /* @__PURE__ */ Symbol.for("v-cmt"), ps = /* @__PURE__ */ Symbol.for("v-stc"), ms = [], hs = null;
function q(e = !1) {
	ms.push(hs = e ? null : []);
}
function gs() {
	ms.pop(), hs = ms[ms.length - 1] || null;
}
var _s = 1;
function vs(e, t = !1) {
	_s += e, e < 0 && hs && t && (hs.hasOnce = !0);
}
function ys(e) {
	return e.dynamicChildren = _s > 0 ? hs || f : null, gs(), _s > 0 && hs && hs.push(e), e;
}
function J(e, t, n, r, i, a) {
	return ys(X(e, t, n, r, i, a, !0));
}
function Y(e, t, n, r, i) {
	return ys(Z(e, t, n, r, i, !0));
}
function bs(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function xs(e, t) {
	return e.type === t.type && e.key === t.key;
}
function Ss(e) {}
var Cs = ({ key: e }) => e ?? null, ws = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : D(e) || /* @__PURE__ */ I(e) || E(e) ? {
	i: _r,
	r: e,
	k: t,
	f: !!n
} : e);
function X(e, t = null, n = null, r = 0, i = null, a = e === G ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && Cs(t),
		ref: t && ws(t),
		scopeId: vr,
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
		ctx: _r
	};
	return s ? (Ns(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= D(n) ? 8 : 16), _s > 0 && !o && hs && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && hs.push(c), c;
}
var Z = Ts;
function Ts(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== ha || (e = K), bs(e)) {
		let r = Ds(e, t, !0);
		return n && Ns(r, n), _s > 0 && !a && hs && (r.shapeFlag & 6 ? hs[hs.indexOf(e)] = r : hs.push(r)), r.patchFlag = -2, r;
	}
	if (ac(e) && (e = e.__vccOpts), t) {
		t = Es(t);
		let { class: e, style: n } = t;
		e && !D(e) && (t.class = we(e)), k(n) && (/* @__PURE__ */ fn(n) && !x(n) && (n = _({}, n)), t.style = ye(n));
	}
	let o = D(e) ? 1 : $o(e) ? 128 : Rr(e) ? 64 : k(e) ? 4 : E(e) ? 2 : 0;
	return X(e, t, n, r, i, o, a, !0);
}
function Es(e) {
	return e ? /* @__PURE__ */ fn(e) || Eo(e) ? _({}, e) : e : null;
}
function Ds(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? Ps(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && Cs(l),
		ref: t && t.ref ? n && a ? x(a) ? a.concat(ws(t)) : [a, ws(t)] : ws(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== G ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && Ds(e.ssContent),
		ssFallback: e.ssFallback && Ds(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && ci(u, c.clone(u)), u;
}
function Os(e = " ", t = 0) {
	return Z(fs, null, e, t);
}
function ks(e, t) {
	let n = Z(ps, null, e);
	return n.staticCount = t, n;
}
function As(e = "", t = !1) {
	return t ? (q(), Y(K, null, e)) : Z(K, null, e);
}
function js(e) {
	return e == null || typeof e == "boolean" ? Z(K) : x(e) ? Z(G, null, e.slice()) : bs(e) ? Ms(e) : Z(fs, null, String(e));
}
function Ms(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : Ds(e);
}
function Ns(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (x(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), Ns(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !Eo(t) ? t._ctx = _r : r === 3 && _r && (_r.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (E(t)) {
		if (r & 65) {
			Ns(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: _r
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [Os(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function Ps(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = we([t.class, r.class]));
		else if (e === "style") t.style = ye([t.style, r.style]);
		else if (h(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(x(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !g(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function Fs(e, t, n, r = null) {
	qn(e, t, 7, [n, r]);
}
var Is = ao(), Ls = 0;
function Rs() {
	return Ls;
}
function zs(e, t, n) {
	let r = e.type, i = (t ? t.appContext : e.appContext) || Is, a = {
		uid: Ls++,
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
		scope: new ze(!0),
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
		propsOptions: Mo(r, i),
		emitsOptions: mo(r, i),
		emit: null,
		emitted: null,
		propsDefaults: d,
		inheritAttrs: r.inheritAttrs,
		ctx: d,
		data: d,
		props: d,
		attrs: d,
		slots: d,
		refs: d,
		setupState: d,
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
	return a.ctx = { _: a }, a.root = t ? t.root : a, a.emit = fo.bind(null, a), e.ce && e.ce(a), a;
}
var Bs = null, Q = () => Bs || _r, Vs, Hs;
{
	let e = _e(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	Vs = t("__VUE_INSTANCE_SETTERS__", (e) => Bs = e), Hs = t("__VUE_SSR_SETTERS__", (e) => Ks = e);
}
var Us = (e) => {
	let t = Bs;
	return Vs(e), e.scope.on(), () => {
		e.scope.off(), Vs(t);
	};
}, Ws = () => {
	Bs && Bs.scope.off(), Vs(null);
};
function Gs(e) {
	return e.vnode.shapeFlag & 4;
}
var Ks = !1;
function qs(e, t = !1, n = !1) {
	t && Hs(t);
	let { props: r, children: i } = e.vnode, a = Gs(e);
	Do(e, r, a, t), Bo(e, i, n || t);
	let o = a ? Js(e, t) : void 0;
	return t && Hs(!1), o;
}
function Js(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Da);
	let { setup: r } = n;
	if (r) {
		st();
		let n = e.setupContext = r.length > 1 ? nc(e) : null, i = Us(e), a = Kn(r, e, 0, [e.props, n]), o = ee(a);
		if (ct(), i(), (o || e.sp) && !Hi(e) && fi(e), o) {
			if (a.then(Ws, Ws), t) return a.then((n) => {
				Hs(!0);
				try {
					Ys(e, n, t);
				} finally {
					Hs(!1);
				}
			}).catch((t) => {
				Jn(t, e, 0);
			});
			e.asyncDep = a;
		} else Ys(e, a, t);
	} else ec(e, t);
}
function Ys(e, t, n) {
	E(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : k(t) && (e.setupState = xn(t)), ec(e, n);
}
var Xs, Zs;
function Qs(e) {
	Xs = e, Zs = (e) => {
		e.render._rc && (e.withProxy = new Proxy(e.ctx, Oa));
	};
}
var $s = () => !Xs;
function ec(e, t, n) {
	let r = e.type;
	if (!e.render) {
		if (!t && Xs && !r.render) {
			let t = r.template || Ya(e).template;
			if (t) {
				let { isCustomElement: n, compilerOptions: i } = e.appContext.config, { delimiters: a, compilerOptions: o } = r, s = _(_({
					isCustomElement: n,
					delimiters: a
				}, i), o);
				r.render = Xs(t, s);
			}
		}
		e.render = r.render || p, Zs && Zs(e);
	}
	{
		let t = Us(e);
		st();
		try {
			Ga(e);
		} finally {
			ct(), t();
		}
	}
}
var tc = { get(e, t) {
	return vt(e, "get", ""), e[t];
} };
function nc(e) {
	return {
		attrs: new Proxy(e.attrs, tc),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function rc(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(xn(pn(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Ta) return Ta[n](e);
		},
		has(e, t) {
			return t in e || t in Ta;
		}
	}) : e.proxy;
}
function ic(e, t = !0) {
	return E(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function ac(e) {
	return E(e) && "__vccOpts" in e;
}
var $ = (e, t) => /* @__PURE__ */ An(e, t, Ks);
function oc(e, t, n) {
	try {
		vs(-1);
		let r = arguments.length;
		return r === 2 ? k(t) && !x(t) ? bs(t) ? Z(e, null, [t]) : Z(e, t) : Z(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && bs(n) && (n = [n]), Z(e, t, n));
	} finally {
		vs(1);
	}
}
function sc() {}
function cc(e, t, n, r) {
	let i = n[r];
	if (i && lc(i, e)) return i;
	let a = t();
	return a.memo = e.slice(), a.cacheIndex = r, n[r] = a;
}
function lc(e, t) {
	let n = e.memo;
	if (n.length != t.length) return !1;
	for (let e = 0; e < n.length; e++) if (M(n[e], t[e])) return !1;
	return _s > 0 && hs && hs.push(e), !0;
}
var uc = "3.5.44", dc = p, fc = Gn, pc = mr, mc = gr, hc = {
	createComponentInstance: zs,
	setupComponent: qs,
	renderComponentRoot: go,
	setCurrentRenderingInstance: yr,
	isVNode: bs,
	normalizeVNode: js,
	getComponentPublicInstance: rc,
	ensureValidVNode: Sa,
	pushWarningContext: Vn,
	popWarningContext: Hn
}, gc = void 0, _c = typeof window < "u" && window.trustedTypes;
if (_c) try {
	gc = /* @__PURE__ */ _c.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var vc = gc ? (e) => gc.createHTML(e) : (e) => e, yc = "http://www.w3.org/2000/svg", bc = "http://www.w3.org/1998/Math/MathML", xc = typeof document < "u" ? document : null, Sc = xc && /* @__PURE__ */ xc.createElement("template"), Cc = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? xc.createElementNS(yc, e) : t === "mathml" ? xc.createElementNS(bc, e) : n ? xc.createElement(e, { is: n }) : xc.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => xc.createTextNode(e),
	createComment: (e) => xc.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => xc.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Sc.innerHTML = vc(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Sc.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, wc = "transition", Tc = "animation", Ec = /* @__PURE__ */ Symbol("_vtc"), Dc = {
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
}, Oc = /* @__PURE__ */ _({}, ei, Dc), kc = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = Oc, e))((e, { slots: t }) => oc(ri, Mc(e), t)), Ac = (e, t = []) => {
	x(e) ? e.forEach((e) => e(...t)) : e && e(...t);
}, jc = (e) => e ? x(e) ? e.some((e) => e.length > 1) : e.length > 1 : !1;
function Mc(e) {
	let t = {};
	for (let n in e) n in Dc || (t[n] = e[n]);
	if (e.css === !1) return t;
	let { name: n = "v", type: r, duration: i, enterFromClass: a = `${n}-enter-from`, enterActiveClass: o = `${n}-enter-active`, enterToClass: s = `${n}-enter-to`, appearFromClass: c = a, appearActiveClass: l = o, appearToClass: u = s, leaveFromClass: d = `${n}-leave-from`, leaveActiveClass: f = `${n}-leave-active`, leaveToClass: p = `${n}-leave-to` } = e, m = Nc(i), h = m && m[0], g = m && m[1], { onBeforeEnter: v, onEnter: y, onEnterCancelled: b, onLeave: x, onLeaveCancelled: S, onBeforeAppear: C = v, onAppear: w = y, onAppearCancelled: T = b } = t, E = (e, t, n, r) => {
		e._enterCancelled = r, Ic(e, t ? u : s), Ic(e, t ? l : o), n && n();
	}, D = (e, t) => {
		e._isLeaving = !1, Ic(e, d), Ic(e, p), Ic(e, f), t && t();
	}, O = (e) => (t, n) => {
		let i = e ? w : y, o = () => E(t, e, n);
		Ac(i, [t, o]), Lc(() => {
			Ic(t, e ? c : a), Fc(t, e ? u : s), jc(i) || zc(t, r, h, o);
		});
	};
	return _(t, {
		onBeforeEnter(e) {
			Ac(v, [e]), Fc(e, a), Fc(e, o);
		},
		onBeforeAppear(e) {
			Ac(C, [e]), Fc(e, c), Fc(e, l);
		},
		onEnter: O(!1),
		onAppear: O(!0),
		onLeave(e, t) {
			e._isLeaving = !0;
			let n = () => D(e, t);
			Fc(e, d), e._enterCancelled ? (Fc(e, f), Uc(e)) : (Uc(e), Fc(e, f)), Lc(() => {
				e._isLeaving && (Ic(e, d), Fc(e, p), jc(x) || zc(e, r, g, n));
			}), Ac(x, [e, n]);
		},
		onEnterCancelled(e) {
			E(e, !1, void 0, !0), Ac(b, [e]);
		},
		onAppearCancelled(e) {
			E(e, !0, void 0, !0), Ac(T, [e]);
		},
		onLeaveCancelled(e) {
			D(e), Ac(S, [e]);
		}
	});
}
function Nc(e) {
	if (e == null) return null;
	if (k(e)) return [Pc(e.enter), Pc(e.leave)];
	{
		let t = Pc(e);
		return [t, t];
	}
}
function Pc(e) {
	return he(e);
}
function Fc(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.add(t)), (e[Ec] || (e[Ec] = /* @__PURE__ */ new Set())).add(t);
}
function Ic(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.remove(t));
	let n = e[Ec];
	n && (n.delete(t), n.size || (e[Ec] = void 0));
}
function Lc(e) {
	requestAnimationFrame(() => {
		requestAnimationFrame(e);
	});
}
var Rc = 0;
function zc(e, t, n, r) {
	let i = e._endId = ++Rc, a = () => {
		i === e._endId && r();
	};
	if (n != null) return setTimeout(a, n);
	let { type: o, timeout: s, propCount: c } = Bc(e, t);
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
function Bc(e, t) {
	let n = window.getComputedStyle(e), r = (e) => (n[e] || "").split(", "), i = r(`${wc}Delay`), a = r(`${wc}Duration`), o = Vc(i, a), s = r(`${Tc}Delay`), c = r(`${Tc}Duration`), l = Vc(s, c), u = null, d = 0, f = 0;
	t === wc ? o > 0 && (u = wc, d = o, f = a.length) : t === Tc ? l > 0 && (u = Tc, d = l, f = c.length) : (d = Math.max(o, l), u = d > 0 ? o > l ? wc : Tc : null, f = u ? u === wc ? a.length : c.length : 0);
	let p = u === wc && /\b(?:transform|all)(?:,|$)/.test(r(`${wc}Property`).toString());
	return {
		type: u,
		timeout: d,
		propCount: f,
		hasTransform: p
	};
}
function Vc(e, t) {
	for (; e.length < t.length;) e = e.concat(e);
	return Math.max(...t.map((t, n) => Hc(t) + Hc(e[n])));
}
function Hc(e) {
	return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function Uc(e) {
	return (e ? e.ownerDocument : document).body.offsetHeight;
}
function Wc(e, t, n) {
	let r = e[Ec];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var Gc = /* @__PURE__ */ Symbol("_vod"), Kc = /* @__PURE__ */ Symbol("_vsh"), qc = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[Gc] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Jc(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), Jc(e, !0), r.enter(e)) : r.leave(e, () => {
			Jc(e, !1);
		}) : Jc(e, t));
	},
	beforeUnmount(e, { value: t }) {
		Jc(e, t);
	}
};
function Jc(e, t) {
	e.style.display = t ? e[Gc] : "none", e[Kc] = !t;
}
function Yc() {
	qc.getSSRProps = ({ value: e }) => {
		if (!e) return { style: { display: "none" } };
	};
}
var Xc = /* @__PURE__ */ Symbol("");
function Zc(e) {
	let t = Q();
	if (!t) return;
	let n = t.ut = (n = e(t.proxy)) => {
		Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach((e) => $c(e, n));
	}, r = () => {
		let r = e(t.proxy);
		t.ce ? $c(t.ce, r) : Qc(t.subTree, r), n(r);
	};
	ia(() => {
		sr(r);
	}), ra(() => {
		V(r, p, { flush: "post" });
		let e = new MutationObserver(r);
		e.observe(t.subTree.el.parentNode, { childList: !0 }), sa(() => e.disconnect());
	});
}
function Qc(e, t) {
	if (e.shapeFlag & 128) {
		let n = e.suspense;
		e = n.activeBranch, n.pendingBranch && !n.isHydrating && n.effects.push(() => {
			Qc(n.activeBranch, t);
		});
	}
	for (; e.component;) e = e.component.subTree;
	if (e.shapeFlag & 1 && e.el) $c(e.el, t);
	else if (e.type === G) e.children.forEach((e) => Qc(e, t));
	else if (e.type === ps) {
		let { el: n, anchor: r } = e;
		for (; n && ($c(n, t), n !== r);) n = n.nextSibling;
	}
}
function $c(e, t) {
	if (e.nodeType === 1) {
		let n = e.style, r = "";
		for (let e in t) {
			let i = Re(t[e]);
			n.setProperty(`--${e}`, i), r += `--${e}: ${i};`;
		}
		n[Xc] = r;
	}
}
var el = /(?:^|;)\s*display\s*:/;
function tl(e, t, n) {
	let r = e.style, i = D(n), a = !1;
	if (n && !i) {
		if (t) {
			if (D(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? rl(r, t, "");
			}
			else for (let e in t) n[e] ?? rl(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? rl(r, i, "") : sl(e, i, !D(t) && t ? t[i] : void 0, o) || rl(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[Xc];
			e && (n += ";" + e), r.cssText = n, a = el.test(n);
		}
	} else t && e.removeAttribute("style");
	Gc in e && (i && t === n || (e[Gc] = a ? r.display : ""), e[Kc] && (r.display = "none"));
}
var nl = /\s*!important$/;
function rl(e, t, n) {
	if (x(n)) n.forEach((n) => rl(e, t, n));
	else if (n ??= "", t.startsWith("--")) nl.test(n) ? e.setProperty(t, n.replace(nl, ""), "important") : e.setProperty(t, n);
	else {
		let r = ol(e, t);
		nl.test(n) ? e.setProperty(le(r), n.replace(nl, ""), "important") : e[r] = n;
	}
}
var il = [
	"Webkit",
	"Moz",
	"ms"
], al = {};
function ol(e, t) {
	let n = al[t];
	if (n) return n;
	let r = j(t);
	if (r !== "filter" && r in e) return al[t] = r;
	r = ue(r);
	for (let n = 0; n < il.length; n++) {
		let i = il[n] + r;
		if (i in e) return al[t] = i;
	}
	return t;
}
function sl(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && D(r) && n === r;
}
var cl = "http://www.w3.org/1999/xlink";
function ll(e, t, n, r, i, a = Ee(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(cl, t.slice(6, t.length)) : e.setAttributeNS(cl, t, n) : n == null || a && !De(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : O(n) ? String(n) : n);
}
function ul(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? vc(n) : n);
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
		r === "boolean" ? n = De(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function dl(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function fl(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var pl = /* @__PURE__ */ Symbol("_vei");
function ml(e, t, n, r, i = null) {
	let a = e[pl] || (e[pl] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = _l(t);
		r ? dl(e, n, a[t] = xl(r, i), s) : o && (fl(e, n, o, s), a[t] = void 0);
	}
}
var hl = /(Once|Passive|Capture)$/, gl = /^on:?(?:Once|Passive|Capture)$/;
function _l(e) {
	let t, n;
	for (; (n = e.match(hl)) && !gl.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : le(e.slice(2)), t];
}
var vl = 0, yl = /* @__PURE__ */ Promise.resolve(), bl = () => vl ||= (yl.then(() => vl = 0), Date.now());
function xl(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		let r = n.value;
		if (x(r)) {
			let n = e.stopImmediatePropagation;
			e.stopImmediatePropagation = () => {
				n.call(e), e._stopped = !0;
			};
			let i = r.slice(), a = [e];
			for (let n = 0; n < i.length && !e._stopped; n++) {
				let e = i[n];
				e && qn(e, t, 5, a);
			}
		} else qn(r, t, 5, [e]);
	};
	return n.value = e, n.attached = bl(), n;
}
var Sl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Cl = (e, t, n, r, i, a) => {
	let o = i === "svg";
	t === "class" ? Wc(e, r, o) : t === "style" ? tl(e, n, r) : h(t) ? g(t) || ml(e, t, n, r, a) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : wl(e, t, r, o)) ? (ul(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || ll(e, t, r, o, a, t !== "value")) : e._isVueCE && (Tl(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !D(r))) ? ul(e, j(t), r, a, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), ll(e, t, r, o));
};
function wl(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && Sl(t) && E(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return Sl(t) && D(n) ? !1 : t in e;
}
function Tl(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = j(t);
	return Array.isArray(n) ? n.some((e) => j(e) === r) : Object.keys(n).some((e) => j(e) === r);
}
var El = {};
// @__NO_SIDE_EFFECTS__
function Dl(e, t, n) {
	let r = /* @__PURE__ */ H(e, t);
	ie(r) && (r = _({}, r, t));
	class i extends Al {
		constructor(e) {
			super(r, e, n);
		}
	}
	return i.def = r, i;
}
var Ol = /* @__NO_SIDE_EFFECTS__ */ ((e, t) => /* @__PURE__ */ Dl(e, t, Du)), kl = typeof HTMLElement < "u" ? HTMLElement : class {}, Al = class e extends kl {
	constructor(e, t = {}, n = Eu) {
		super(), this._def = e, this._props = t, this._createApp = n, this._isVueCE = !0, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = !1, this._resolved = !1, this._patching = !1, this._dirty = !1, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._styleAnchors = /* @__PURE__ */ new WeakMap(), this._ob = null, this.shadowRoot && n !== Eu ? this._root = this.shadowRoot : e.shadowRoot === !1 ? this._root = this : (this.attachShadow(_({}, e.shadowRootOptions, { mode: "open" })), this._root = this.shadowRoot);
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
		this._connected = !1, rr(() => {
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
			if (n && !x(n)) for (let e in n) {
				let t = n[e];
				(t === Number || t && t.type === Number) && (e in this._props && (this._props[e] = he(this._props[e])), (i ||= /* @__PURE__ */ Object.create(null))[j(e)] = !0);
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
		if (t) for (let e in t) b(this, e) || Object.defineProperty(this, e, { get: () => R(t[e]) });
	}
	_resolveProps(e) {
		let { props: t } = e, n = x(t) ? t : Object.keys(t || {});
		for (let e of Object.keys(this)) e[0] !== "_" && n.includes(e) && this._setProp(e, this[e]);
		for (let e of n.map(j)) Object.defineProperty(this, e, {
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
		let t = this.hasAttribute(e), n = t ? this.getAttribute(e) : El, r = j(e);
		t && this._numberProps && this._numberProps[r] && (n = he(n)), this._setProp(r, n, !1, !0);
	}
	_getProp(e) {
		return this._props[e];
	}
	_setProp(e, t, n = !0, r = !1) {
		if (t !== this._props[e] && (this._dirty = !0, t === El ? delete this._props[e] : (this._props[e] = t, e === "key" && this._app && (this._app._ceVNode.key = t)), r && this._instance && this._update(), n)) {
			let n = this._ob;
			n && (this._processMutations(n.takeRecords()), n.disconnect()), t === !0 ? this.setAttribute(le(e), "") : typeof t == "string" || typeof t == "number" ? this.setAttribute(le(e), t + "") : t || this.removeAttribute(le(e)), n && n.observe(this, { attributes: !0 });
		}
	}
	_update() {
		let e = this._createVNode();
		this._app && (e.appContext = this._app._context), wu(e, this._root);
	}
	_createVNode() {
		let e = {};
		this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
		let t = Z(this._def, _(e, this._props));
		return this._instance || (t.ce = (e) => {
			this._instance = e, e.ce = this, e.isCE = !0;
			let t = (e, t) => {
				this.dispatchEvent(new CustomEvent(e, ie(t[0]) ? _({ detail: t }, t[0]) : { detail: t }));
			};
			e.emit = (e, ...n) => {
				t(e, n), le(e) !== e && t(le(e), n);
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
function jl(e) {
	let t = Q();
	return t && t.ce || null;
}
function Ml() {
	let e = jl();
	return e && e.shadowRoot;
}
function Nl(e = "$style") {
	{
		let t = Q();
		if (!t) return d;
		let n = t.type.__cssModules;
		return n && n[e] || d;
	}
}
var Pl = /* @__PURE__ */ new WeakMap(), Fl = /* @__PURE__ */ new WeakMap(), Il = /* @__PURE__ */ Symbol("_moveCb"), Ll = /* @__PURE__ */ Symbol("_enterCb"), Rl = /* @__PURE__ */ new WeakMap(), zl = /* @__PURE__ */ ((e) => (delete e.props.mode, e))({
	name: "TransitionGroup",
	props: /* @__PURE__ */ _({}, Oc, {
		tag: String,
		moveClass: String
	}),
	setup(e, { slots: t }) {
		let n = Q(), r = Qr(), i, a, o, s, c = () => (s === void 0 && (s = i.length > 0 && Jl(i[0].el, n.vnode.el, Vl(e))), s);
		return aa(() => {
			if (Rl.delete(n), !c()) {
				i = [], o = void 0;
				return;
			}
			let t = Vl(e);
			i.forEach(Bl);
			let r = o && ql(o, n.vnode.el);
			o = void 0, i.forEach((e) => Hl(e, r));
			let a = i.filter(Ul);
			Uc(n.vnode.el), a.forEach((e) => {
				let n = e.el, r = n.style;
				Fc(n, t), r.transform = r.webkitTransform = r.transitionDuration = "";
				let i = n[Il] = (e) => {
					e && e.target !== n || (!e || e.propertyName.endsWith("transform")) && (n.removeEventListener("transitionend", i), n[Il] = null, Ic(n, t));
				};
				n.addEventListener("transitionend", i);
			}), i = [];
		}), () => {
			let l = /* @__PURE__ */ F(e), u = Mc(l), d = l.tag || G;
			if (i = [], s = void 0, a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && !t.el[Kc] && (i.push(t), ci(t, ai(t, u, r, n)), Pl.set(t, Wl(t.el)));
			}
			a = t.default ? li(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && ci(t, ai(t, u, r, n));
			}
			return i.length && (o = Gl(n), Rl.set(n, c)), Z(d, null, a);
		};
	}
});
function Bl(e) {
	let t = e.el;
	t[Il] && t[Il](), t[Ll] && t[Ll]();
}
function Vl(e) {
	return e.moveClass || `${e.name || "v"}-move`;
}
function Hl(e, t) {
	Fl.set(e, Wl(e.el, t));
}
function Ul(e) {
	let t = Pl.get(e), n = Fl.get(e), r = t.left - n.left, i = t.top - n.top;
	if (r || i) {
		let t = e.el, n = t.style, a = t.getBoundingClientRect(), o = 1, s = 1;
		return t.offsetWidth && (o = a.width / t.offsetWidth), t.offsetHeight && (s = a.height / t.offsetHeight), Number.isFinite(o) && o !== 0 || (o = 1), Number.isFinite(s) && s !== 0 || (s = 1), Math.abs(o - 1) < .01 && (o = 1), Math.abs(s - 1) < .01 && (s = 1), n.transform = n.webkitTransform = `translate(${r / o}px,${i / s}px)`, n.transitionDuration = "0s", e;
	}
}
function Wl(e, t) {
	let n = e.getBoundingClientRect();
	return {
		left: n.left - (t ? t.left : 0),
		top: n.top - (t ? t.top : 0)
	};
}
function Gl(e) {
	let t;
	for (let n = e.parent; n; n = n.parent) {
		let r = Rl.get(n);
		if (r) {
			let i = Kl(n.vnode.el, e.vnode.el);
			i && (t ||= []).push(_(Wl(i), {
				item: i,
				willMove: r
			}));
		}
	}
	return t;
}
function Kl(e, t) {
	let n = e.nodeType === 1 ? e : e.parentNode;
	for (; t && t.parentNode !== n;) t = t.parentNode;
	if (t && t.nodeType === 1) return t;
}
function ql(e, t) {
	let n = e.find((e) => e.willMove() && e.item.contains(t));
	return n && Wl(n.item, n);
}
function Jl(e, t, n) {
	let r = e.cloneNode(), i = e[Ec];
	i && i.forEach((e) => {
		e.split(/\s+/).forEach((e) => e && r.classList.remove(e));
	}), n.split(/\s+/).forEach((e) => e && r.classList.add(e)), r.style.display = "none";
	let a = t.nodeType === 1 ? t : t.parentNode;
	a.appendChild(r);
	let { hasTransform: o } = Bc(r);
	return a.removeChild(r), o;
}
var Yl = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return x(t) ? (e) => fe(t, e) : t;
};
function Xl(e) {
	e.target.composing = !0;
}
function Zl(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var Ql = /* @__PURE__ */ Symbol("_assign"), $l = /* @__PURE__ */ Symbol("_initialValue");
function eu(e, t, n) {
	return t && (e = e.trim()), n && (e = me(e)), e;
}
var tu = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[$l] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[$l] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[Ql] = Yl(i);
		let a = r || i.props && i.props.type === "number";
		dl(e, t ? "change" : "input", (t) => {
			t.target.composing || e[Ql](eu(e.value, n, a));
		}), (n || a) && dl(e, "change", () => {
			e.value = eu(e.value, n, a);
		}), t || (dl(e, "compositionstart", Xl), dl(e, "compositionend", Zl), dl(e, "change", Zl));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[$l];
		delete e[$l], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[Ql](eu(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[Ql] = Yl(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? me(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, nu = {
	deep: !0,
	created(e, t, n) {
		e[Ql] = Yl(n), dl(e, "change", () => {
			let t = e._modelValue, n = cu(e), r = e.checked, i = e[Ql];
			if (x(t)) {
				let e = Ne(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (C(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(lu(e, r));
		});
	},
	mounted: ru,
	beforeUpdate(e, t, n) {
		e[Ql] = Yl(n), ru(e, t, n);
	}
};
function ru(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (x(t)) i = Ne(t, r.props.value) > -1;
	else if (C(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = Me(t, lu(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var iu = {
	created(e, { value: t }, n) {
		e.checked = Me(t, n.props.value), e[Ql] = Yl(n), dl(e, "change", () => {
			e[Ql](cu(e));
		});
	},
	beforeUpdate(e, { value: t, oldValue: n }, r) {
		e[Ql] = Yl(r), t !== n && (e.checked = Me(t, r.props.value));
	}
}, au = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, dl(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? me(cu(e)) : cu(e)), r = e.multiple, i = r ? C(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? x(i) ? t.slice() : t : i];
			try {
				e[Ql](i);
			} finally {
				rr(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[Ql] = Yl(r);
	},
	mounted(e, { value: t }) {
		su(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[Ql] = Yl(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, n && n[0] === e.multiple && ou(t, n[1], n[0]) || su(e, t);
	}
};
function ou(e, t, n) {
	if (!n || x(e)) return Me(e, t);
	if (C(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function su(e, t) {
	let n = e.multiple, r = x(t);
	if (!n || r || C(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = cu(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : Ne(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (Me(cu(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function cu(e) {
	return "_value" in e ? e._value : e.value;
}
function lu(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var uu = {
	created(e, t, n) {
		fu(e, t, n, null, "created");
	},
	mounted(e, t, n) {
		fu(e, t, n, null, "mounted");
	},
	beforeUpdate(e, t, n, r) {
		fu(e, t, n, r, "beforeUpdate");
	},
	updated(e, t, n, r) {
		fu(e, t, n, r, "updated");
	}
};
function du(e, t) {
	switch (e) {
		case "SELECT": return au;
		case "TEXTAREA": return tu;
		default: switch (t) {
			case "checkbox": return nu;
			case "radio": return iu;
			default: return tu;
		}
	}
}
function fu(e, t, n, r, i) {
	let a = du(e.tagName, n.props && n.props.type)[i];
	a && a(e, t, n, r);
}
function pu() {
	tu.getSSRProps = ({ value: e }) => ({ value: e }), iu.getSSRProps = ({ value: e }, t) => {
		if (t.props && Me(t.props.value, e)) return { checked: !0 };
	}, nu.getSSRProps = ({ value: e }, t) => {
		if (x(e)) {
			if (t.props && Ne(e, t.props.value) > -1) return { checked: !0 };
		} else if (C(e)) {
			if (t.props && e.has(t.props.value)) return { checked: !0 };
		} else if (e) return { checked: !0 };
	}, uu.getSSRProps = (e, t) => {
		if (typeof t.type != "string") return;
		let n = du(t.type.toUpperCase(), t.props && t.props.type);
		if (n.getSSRProps) return n.getSSRProps(e, t);
	};
}
var mu = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], hu = {
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
	exact: (e, t) => mu.some((n) => e[`${n}Key`] && !t.includes(n))
}, gu = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = hu[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, _u = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, vu = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = le(n.key);
		if (t.some((e) => e === r || _u[e] === r)) return e(n);
	}));
}, yu = /* @__PURE__ */ _({ patchProp: Cl }, Cc), bu, xu = !1;
function Su() {
	return bu ||= Ho(yu);
}
function Cu() {
	return bu = xu ? bu : Uo(yu), xu = !0, bu;
}
var wu = ((...e) => {
	Su().render(...e);
}), Tu = ((...e) => {
	Cu().hydrate(...e);
}), Eu = ((...e) => {
	let t = Su().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = ku(e);
		if (!r) return;
		let i = t._component;
		E(i) || i.render || i.template || (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Ou(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
}), Du = ((...e) => {
	let t = Cu().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let t = ku(e);
		if (t) return n(t, !0, Ou(t));
	}, t;
});
function Ou(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function ku(e) {
	return D(e) ? document.querySelector(e) : e;
}
var Au = !1, ju = () => {
	Au || (Au = !0, pu(), Yc());
}, Mu = /* @__PURE__ */ t({
	BaseTransition: () => ri,
	BaseTransitionPropsValidators: () => ei,
	Comment: () => K,
	DeprecationTypes: () => null,
	EffectScope: () => ze,
	ErrorCodes: () => Wn,
	ErrorTypeStrings: () => fc,
	Fragment: () => G,
	KeepAlive: () => Ki,
	ReactiveEffect: () => We,
	Static: () => ps,
	Suspense: () => ts,
	Teleport: () => qr,
	Text: () => fs,
	TrackOpTypes: () => jn,
	Transition: () => kc,
	TransitionGroup: () => zl,
	TriggerOpTypes: () => Mn,
	VueElement: () => Al,
	assertNumber: () => Un,
	callWithAsyncErrorHandling: () => qn,
	callWithErrorHandling: () => Kn,
	camelize: () => j,
	capitalize: () => ue,
	cloneVNode: () => Ds,
	compatUtils: () => null,
	compile: () => Nu,
	computed: () => $,
	createApp: () => Eu,
	createBlock: () => Y,
	createCommentVNode: () => As,
	createElementBlock: () => J,
	createElementVNode: () => X,
	createHydrationRenderer: () => Uo,
	createPropsRestProxy: () => Ha,
	createRenderer: () => Ho,
	createSSRApp: () => Du,
	createSlots: () => xa,
	createStaticVNode: () => ks,
	createTextVNode: () => Os,
	createVNode: () => Z,
	customRef: () => Cn,
	defineAsyncComponent: () => Ui,
	defineComponent: () => H,
	defineCustomElement: () => Dl,
	defineEmits: () => Aa,
	defineExpose: () => ja,
	defineModel: () => Pa,
	defineOptions: () => Ma,
	defineProps: () => ka,
	defineSSRCustomElement: () => Ol,
	defineSlots: () => Na,
	devtools: () => pc,
	effect: () => rt,
	effectScope: () => Be,
	getCurrentInstance: () => Q,
	getCurrentScope: () => Ve,
	getCurrentWatcher: () => In,
	getTransitionRawChildren: () => li,
	guardReactiveProps: () => Es,
	h: () => oc,
	handleError: () => Jn,
	hasInjectionContext: () => Dr,
	hydrate: () => Tu,
	hydrateOnIdle: () => Ii,
	hydrateOnInteraction: () => Bi,
	hydrateOnMediaQuery: () => zi,
	hydrateOnVisible: () => Ri,
	initCustomFormatter: () => sc,
	initDirectivesForSSR: () => ju,
	inject: () => Er,
	isMemoSame: () => lc,
	isProxy: () => fn,
	isReactive: () => ln,
	isReadonly: () => un,
	isRef: () => I,
	isRuntimeOnly: () => $s,
	isShallow: () => dn,
	isVNode: () => bs,
	markRaw: () => pn,
	mergeDefaults: () => Ba,
	mergeModels: () => Va,
	mergeProps: () => Ps,
	nextTick: () => rr,
	nodeOps: () => Cc,
	normalizeClass: () => we,
	normalizeProps: () => Te,
	normalizeStyle: () => ye,
	onActivated: () => Ji,
	onBeforeMount: () => na,
	onBeforeUnmount: () => oa,
	onBeforeUpdate: () => ia,
	onDeactivated: () => Yi,
	onErrorCaptured: () => da,
	onMounted: () => ra,
	onRenderTracked: () => ua,
	onRenderTriggered: () => la,
	onScopeDispose: () => He,
	onServerPrefetch: () => ca,
	onUnmounted: () => sa,
	onUpdated: () => aa,
	onWatcherCleanup: () => Ln,
	openBlock: () => q,
	patchProp: () => Cl,
	popScopeId: () => xr,
	provide: () => Tr,
	proxyRefs: () => xn,
	pushScopeId: () => br,
	queuePostFlushCb: () => sr,
	reactive: () => rn,
	readonly: () => on,
	ref: () => L,
	registerRuntimeCompiler: () => Qs,
	render: () => wu,
	renderList: () => ba,
	renderSlot: () => U,
	resolveComponent: () => ma,
	resolveDirective: () => _a,
	resolveDynamicComponent: () => ga,
	resolveFilter: () => null,
	resolveTransitionHooks: () => ai,
	setBlockTracking: () => vs,
	setDevtoolsHook: () => mc,
	setTransitionHooks: () => ci,
	shallowReactive: () => an,
	shallowReadonly: () => sn,
	shallowRef: () => gn,
	ssrContextKey: () => Or,
	ssrUtils: () => hc,
	stop: () => it,
	toDisplayString: () => Fe,
	toHandlerKey: () => de,
	toHandlers: () => Ca,
	toRaw: () => F,
	toRef: () => Dn,
	toRefs: () => wn,
	toValue: () => z,
	transformVNodeArgs: () => Ss,
	triggerRef: () => yn,
	unref: () => R,
	useAttrs: () => La,
	useCssModule: () => Nl,
	useCssVars: () => Zc,
	useHost: () => jl,
	useId: () => di,
	useModel: () => lo,
	useSSRContext: () => kr,
	useShadowRoot: () => Ml,
	useSlots: () => Ia,
	useTemplateRef: () => pi,
	useTransitionState: () => Qr,
	vModelCheckbox: () => nu,
	vModelDynamic: () => uu,
	vModelRadio: () => iu,
	vModelSelect: () => au,
	vModelText: () => tu,
	vShow: () => qc,
	version: () => uc,
	warn: () => dc,
	watch: () => V,
	watchEffect: () => Ar,
	watchPostEffect: () => jr,
	watchSyncEffect: () => Mr,
	withAsyncContext: () => Ua,
	withCtx: () => B,
	withDefaults: () => Fa,
	withDirectives: () => Cr,
	withKeys: () => vu,
	withMemo: () => cc,
	withModifiers: () => gu,
	withScopeId: () => Sr
}), Nu = () => {}, Pu = /* @__PURE__ */ rn({});
function Fu(e, t, n, r, i) {
	Pu[e] = {
		id: e,
		title: t,
		status: n,
		summary: r,
		detail: i,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function Iu(e, t, n) {
	try {
		await n();
	} catch (n) {
		console.error(`[trpg-assistant] 探针 ${e} 出错`, n), Fu(e, t, "error", n instanceof Error ? n.message : String(n));
	}
}
function Lu(e) {
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		env: e,
		results: Object.values(Pu)
	};
}
// src/probes/envProbe.ts
var Ru = "env", zu = "宿主与设备环境";
function Bu() {
	let e = document.createElement("div");
	e.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top)", document.body.appendChild(e);
	let t = getComputedStyle(e).paddingTop;
	return e.remove(), t;
}
async function Vu(e) {
	let t = { present: !1 };
	if (window.__TAURITAVERN__) try {
		let e = await o();
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
		safeAreaTop: Bu(),
		contextKeys: Object.keys(e).sort(),
		libsKeys: Object.keys(window.SillyTavern?.libs ?? {}).sort(),
		hasSetExtensionPrompt: typeof e.setExtensionPrompt == "function",
		hasPromptEnums: !!e.extension_prompt_types,
		eventTypeCount: Object.keys(e.event_types ?? {}).length,
		tauri: t
	};
}
function Hu(e) {
	let t = () => Iu(Ru, zu, async () => {
		let t = await Vu(e), n = t.tauri;
		Fu(Ru, zu, "info", n.present ? "检测到 TauriTavern 宿主" : "未检测到 TauriTavern（普通 SillyTavern）", t);
	});
	return {
		id: Ru,
		title: zu,
		hint: "自动检测。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/eventsProbe.ts
var Uu = "events", Wu = "聊天事件", Gu = [
	["CHAT_CHANGED", "chat_id_changed"],
	["MESSAGE_SENT", "message_sent"],
	["MESSAGE_RECEIVED", "message_received"],
	["MESSAGE_SWIPED", "message_swiped"],
	["MESSAGE_EDITED", "message_edited"],
	["MESSAGE_DELETED", "message_deleted"],
	["GENERATION_STARTED", "generation_started"],
	["GENERATION_ENDED", "generation_ended"]
];
function Ku(e) {
	let t = {}, n = [], r = () => {
		let e = Gu.map(([e]) => e).filter((e) => !t[e]);
		Fu(Uu, Wu, "info", e.length ? `尚未观察到：${e.join("、")}` : "全部事件都已观察到", {
			counts: t,
			recent: n.slice(-30)
		});
	};
	return {
		id: Uu,
		title: Wu,
		hint: "依次做：发送消息、等回复、切换回复（左右箭头）、编辑一条消息、删除一条消息、切换聊天，观察事件是否都能收到。",
		actions: [{
			label: "刷新",
			run: r
		}],
		start: () => {
			for (let [i, a] of Gu) c(e, s(e, i, a), (...e) => {
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
var qu = "identity", Ju = "角色卡 / 群组 / 聊天标识";
function Yu(e) {
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
function Xu(e) {
	let t = [], n = () => {
		let n = Yu(e), r = JSON.stringify([
			n.characterId,
			n.groupId,
			n.chatId
		]);
		t.some((e) => e.key === r) || t.push({
			key: r,
			...n
		}), Fu(qu, Ju, "info", `当前：${n.groupId ? "群组聊天" : n.characterId === null ? "没有打开聊天" : "角色卡聊天"}；已观察 ${t.length} 种上下文`, {
			current: n,
			observed: t
		});
	};
	return {
		id: qu,
		title: Ju,
		hint: "在角色卡聊天、群组聊天、未打开聊天三种状态之间切换，观察标识是否都能取到。",
		actions: [{
			label: "刷新",
			run: n
		}],
		start: () => {
			n(), c(e, s(e, "CHAT_CHANGED", "chat_id_changed"), n);
		}
	};
}
// src/probes/promptScan.ts
var Zu = "TRPG-PROBE-COMMENT", Qu = "TRPG-PROBE-INJECT";
function $u(e) {
	if (typeof e == "string") return e;
	try {
		return JSON.stringify(e) ?? "";
	} catch (e) {
		return console.error("[trpg-assistant] 请求内容无法序列化", e), "";
	}
}
function ed(e, t) {
	let n = e.indexOf(t);
	if (!(n < 0)) return e.slice(Math.max(0, n - 40), n + t.length + 60);
}
function td(e, t) {
	let n = e?.chat;
	if (Array.isArray(n)) for (let e = 0; e < n.length; e++) {
		let r = n[e];
		if ((typeof r?.content == "string" ? r.content : $u(r?.content)).includes(t)) return {
			role: String(r.role ?? "?"),
			indexFromEnd: n.length - 1 - e
		};
	}
}
function nd(e) {
	let t = $u(e);
	return {
		length: t.length,
		comment: t.includes(Zu),
		commentIntact: t.includes("<!--TRPG-PROBE-COMMENT") && t.includes("-->"),
		inject: t.includes(Qu),
		commentSnippet: ed(t, Zu),
		injectSnippet: ed(t, Qu),
		injectAt: td(e, Qu)
	};
}
// src/probes/llmLogAudit.ts
function rd(e) {
	if (e && typeof e == "object") {
		let t = e;
		return t.id ?? t.key ?? t.logId ?? t.name;
	}
	return e;
}
async function id() {
	let e = (await o())?.api?.dev?.llmApiLogs;
	if (!e?.index || !e.getRaw) return {
		status: "info",
		summary: "宿主没有请求日志接口，只能依靠事件判定",
		detail: null
	};
	let t = await e.index(), n = Array.isArray(t) ? t : [], r = n[n.length - 1] ?? n[0], i = {
		indexType: typeof t,
		count: n.length,
		latestEntry: r ?? null
	};
	if (r === void 0) return {
		status: "info",
		summary: "请求日志为空（可能未开启记录，或还没有发过请求）",
		detail: i
	};
	let a = nd(await e.getRaw(rd(r)));
	return i.scan = a, i.markers = [Zu, Qu], {
		status: "info",
		summary: `最近一次请求原文：${a.comment ? `含注释标记${a.commentIntact ? "（符号完整）" : "（符号被改）"}` : "无注释标记"}；${a.inject ? "含注入标记" : "无注入标记"}`,
		detail: i
	};
}
// src/probes/promptProbes.ts
var ad = "comment", od = "注释是否进入发给 AI 的请求", sd = "inject", cd = "提示词注入是否生效", ld = "input", ud = "写入与读取输入框", dd = "tavern-trpg-assistant_probe", fd = 1, pd = 0;
function md(e) {
	return e?.dryRun === !0;
}
function hd(e) {
	let t = !1, n = !1, r = "", a = [], o = {}, u = (e) => (t) => {
		a.push({
			event: e,
			dryRun: md(t),
			...nd(t)
		});
	}, d = () => {
		let e = a.filter((e) => !e.dryRun);
		if (r !== "quiet") {
			if (!e.length) t && Fu(ad, od, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）"), n && Fu(sd, cd, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）");
			else {
				if (t) {
					let n = e.find((e) => e.comment), i = e.some((e) => e.commentIntact);
					Fu(ad, od, n && i ? "pass" : "fail", n ? i ? "注释原样进入了请求（<!-- --> 完整保留）" : "标记文字进入了请求，但 <!-- --> 符号被改动或删除" : "请求中没有找到注释内容（注释被删除）", {
						runType: r,
						captures: e,
						message: o
					}), t = !1;
				}
				if (n) {
					let t = e.find((e) => e.inject);
					Fu(sd, cd, t ? "pass" : "fail", t ? `注入文本进入了请求${t.injectAt ? `（${t.injectAt.role} 消息，距末尾 ${t.injectAt.indexFromEnd} 条）` : ""}` : "请求中没有找到注入文本", {
						runType: r,
						captures: e
					}), n = !1;
				}
			}
		}
	}, f = () => {
		let t = s(e, "CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready"), n = s(e, "GENERATE_AFTER_COMBINE_PROMPTS", "generate_after_combine_prompts"), i = s(e, "GENERATE_AFTER_DATA", "generate_after_data");
		c(e, t, u(t)), c(e, n, u(n)), c(e, i, u(i)), c(e, s(e, "GENERATION_STARTED", "generation_started"), (e, t, n) => {
			n !== !0 && (r = String(e ?? ""), a = []);
		});
		let l = () => d();
		c(e, s(e, "GENERATION_ENDED", "generation_ended"), l), c(e, s(e, "GENERATION_STOPPED", "generation_stopped"), l), c(e, s(e, "MESSAGE_SENT", "message_sent"), (t) => {
			let n = e.chat[Number(t)];
			o.storedInChat = !!n?.mes?.includes(Zu);
		}), c(e, s(e, "USER_MESSAGE_RENDERED", "user_message_rendered"), (e) => {
			let t = document.querySelector(`.mes[mesid="${Number(e)}"] .mes_text`);
			t && (o.visibleTextHasMarker = !!t.textContent?.includes(Zu), o.htmlHasComment = t.innerHTML.includes(`<!--${Zu}`));
		});
	}, p = {
		id: ad,
		title: od,
		hint: "点「写入测试注释」后，自己发送这条消息（需要已连接模型）。发送完成后自动判定；楼层里应看不到注释文字。",
		actions: [{
			label: "写入测试注释到输入框",
			run: () => Iu(ad, od, () => {
				let e = i();
				if (!e) throw Error("找不到输入框");
				let n = `<!--${Zu} 探针-->`;
				l(e, e.value ? `${e.value}\n${n}` : `测试 ${n}`), t = !0, Fu(ad, od, "waiting", "已写入。请发送这条消息，等 AI 回复结束后自动判定");
			})
		}]
	};
	p.actions.push({
		label: "从 TauriTavern 请求日志核对",
		run: () => Iu(ad, od, async () => {
			let e = await id();
			Fu(ad, od, e.status, e.summary, {
				runType: r,
				audit: e.detail,
				message: o
			});
		})
	});
	let m = {
		id: sd,
		title: cd,
		hint: "点「注入探针」后发送任意消息。可以和上一项同一次发送完成判定。测完请点「清除注入」。",
		actions: [{
			label: "注入探针",
			run: () => Iu(sd, cd, () => {
				if (!e.setExtensionPrompt) throw Error("宿主没有 setExtensionPrompt");
				let t = e.extension_prompt_types?.IN_CHAT ?? fd, r = e.extension_prompt_roles?.SYSTEM ?? pd;
				e.setExtensionPrompt(dd, `[${Qu}] 这是探针注入文本`, t, 0, !1, r), n = !0, Fu(sd, cd, "waiting", "已注入（IN_CHAT，深度 0）。请发送一条消息", { enumsFromContext: !!e.extension_prompt_types });
			})
		}, {
			label: "清除注入",
			run: () => Iu(sd, cd, () => {
				let t = e.extension_prompt_types?.IN_CHAT ?? fd, r = e.extension_prompt_roles?.SYSTEM ?? pd;
				e.setExtensionPrompt?.(dd, "", t, 0, !1, r), n = !1, Fu(sd, cd, "idle", "已清除注入");
			})
		}]
	}, h = {
		id: ld,
		title: ud,
		hint: "自动写入一段文字、读回校验，然后恢复原内容（不会发送）。",
		actions: [{
			label: "运行输入框测试",
			run: () => Iu(ld, ud, () => {
				let e = i();
				if (!e) throw Error("找不到输入框");
				let t = e.value, n = `${t}[TRPG-PROBE-INPUT]`;
				l(e, n);
				let r = e.value;
				l(e, t);
				let a = e.value === t;
				Fu(ld, ud, r === n && a ? "pass" : "fail", r === n ? a ? "写入、读回、恢复都正常" : "写入正常，但恢复失败" : "写入后读回的内容不一致", {
					readBackMatches: r === n,
					restored: a
				});
			})
		}]
	};
	return [
		{
			...p,
			start: f
		},
		m,
		h
	];
}
// src/probes/storageProbe.ts
var gd = "storage", _d = "本地存储与持久性", vd = `${n}-m0`, yd = 4194304;
function bd() {
	return new Promise((e, t) => {
		let n = indexedDB.open(vd, 1);
		n.onupgradeneeded = () => n.result.createObjectStore("kv"), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
	});
}
function xd(e, t, n) {
	return new Promise((r, i) => {
		let a = n(e.transaction("kv", t).objectStore("kv"));
		a.onsuccess = () => r(a.result), a.onerror = () => i(a.error);
	});
}
function Sd(e) {
	let t = () => Iu(gd, _d, async () => {
		let t = await bd(), r = await xd(t, "readonly", (e) => e.get("boot")), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			count: (r?.count ?? 0) + 1,
			firstAt: r?.firstAt ?? i,
			lastAt: i
		};
		await xd(t, "readwrite", (e) => e.put(a, "boot"));
		let o = !!await xd(t, "readonly", (e) => e.get("blob"));
		o || await xd(t, "readwrite", (e) => e.put(new Uint8Array(yd), "blob"));
		let s = await xd(t, "readonly", (e) => e.get("blob"));
		t.close();
		let c = await navigator.storage?.persisted?.() ?? null, l = await navigator.storage?.estimate?.() ?? null, u = e.extensionSettings[n] ??= {}, d = Number(u.probeBootCount ?? 0);
		u.probeBootCount = d + 1, e.saveSettingsDebounced(), Fu(gd, _d, "info", `IndexedDB 第 ${a.count} 次启动读写正常；刷新页面后次数应增加`, {
			idb: {
				bootCount: a.count,
				firstAt: a.firstAt,
				blobBytes: s?.byteLength ?? 0,
				blobWasAlreadyStored: o
			},
			navigatorStorage: {
				persisted: c,
				usage: l?.usage,
				quota: l?.quota
			},
			extensionSettings: {
				previousBootCount: d,
				nowBootCount: d + 1
			},
			localforagePresent: !!window.SillyTavern?.libs?.localforage
		});
	});
	return {
		id: gd,
		title: _d,
		hint: "每次启动自动读写 IndexedDB（含 4MB 数据）与扩展设置。完全退出再打开应用后，启动次数应继续累加，4MB 数据应已存在。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/tauriProbe.ts
var Cd = "tauri", wd = "TauriTavern 扩展接口", Td = `${n}-m0`, Ed = "/scripts/tauritavern/layout-kit.js", Dd = [
	"current",
	"getCurrent",
	"active",
	"handle",
	"currentChat"
];
function Od(e, t) {
	if (typeof e == "function") return "function";
	if (typeof e != "object" || !e) return typeof e;
	if (t <= 0) return "object";
	let n = {};
	for (let r of Object.keys(e)) n[r] = Od(e[r], t - 1);
	return n;
}
async function kd(e, t) {
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
async function Ad(e) {
	if (typeof e.searchMessages == "function" || e.store) return {
		handle: e,
		via: "api.chat 本身"
	};
	let t = e.current;
	if (t && typeof t.handle == "function") {
		let e = await kd("api.chat.current.handle()", () => t.handle.call(t));
		if (e.ok && e.value && typeof e.value == "object") return {
			handle: e.value,
			via: "api.chat.current.handle()"
		};
	}
	for (let t of Dd) {
		let n = e[t];
		if (typeof n == "function") {
			let r = await kd(`api.chat.${t}()`, () => n.call(e)), i = r.value;
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
function jd() {
	let e = () => Iu(Cd, wd, async () => {
		if (!window.__TAURITAVERN__) {
			Fu(Cd, wd, "info", "不是 TauriTavern，跳过（扩展将使用酒馆通用能力）");
			return;
		}
		let e = (await o())?.api ?? {}, t = e.chat ?? {}, n = { apiShape: Od(e, 3) };
		n.layoutKitExports = await kd("layout-kit 导入", () => import(
			/* @vite-ignore */
			Ed
).then((e) => Object.keys(e)));
		let { handle: r, via: i } = await Ad(t);
		if (n.handleVia = i, r) {
			let e = r;
			n.handleShape = Od(r, 2), e.searchMessages && (n.searchMessages = await kd("searchMessages", () => e.searchMessages({
				query: "你",
				limit: 3
			})));
			let t = e.locate?.findLastMessage;
			if (t && (n.findLastMessage = await kd("findLastMessage", () => t.call(e.locate, {
				role: "user",
				scanLimit: 50
			}))), e.store?.setJson && e.store.getJson) {
				let t = { at: (/* @__PURE__ */ new Date()).toISOString() };
				n.storeSet = await kd("store.setJson", () => e.store.setJson({
					namespace: Td,
					key: "probe",
					value: t
				})), n.storeGet = await kd("store.getJson", () => e.store.getJson({
					namespace: Td,
					key: "probe"
				})), e.store.listKeys && (n.storeKeys = await kd("store.listKeys", () => e.store.listKeys({ namespace: Td }))), e.store.deleteJson && (n.storeDelete = await kd("store.deleteJson", () => e.store.deleteJson({
					namespace: Td,
					key: "probe"
				})));
			}
			e.metadata?.get && (n.metadata = await kd("metadata.get", () => e.metadata.get()));
		}
		let a = e.extension?.store;
		if (a?.setJson && a.getJson) {
			let e = { at: (/* @__PURE__ */ new Date()).toISOString() }, t = {
				namespace: Td,
				key: "probe"
			};
			n.extStoreSet = await kd("extension.store.setJson", () => a.setJson({
				...t,
				value: e
			})), n.extStoreGet = await kd("extension.store.getJson", () => a.getJson(t)), a.listKeys && (n.extStoreKeys = await kd("extension.store.listKeys", () => a.listKeys({ namespace: Td }))), a.deleteJson && (n.extStoreDelete = await kd("extension.store.deleteJson", () => a.deleteJson(t)));
		}
		Fu(Cd, wd, "info", r ? `找到 handle（${i}）；各接口调用结果见详情` : "没有找到获取 handle 的方式；接口结构见详情", n);
	});
	return {
		id: Cd,
		title: wd,
		hint: "仅 TauriTavern 有效。请分别在「已打开聊天」和「未打开聊天」两种状态下点「重新检测」各测一次。",
		actions: [{
			label: "重新检测",
			run: e
		}],
		start: e
	};
}
// src/probes/index.ts
function Md(e) {
	return [
		Hu(e),
		...hd(e),
		Sd(e),
		Xu(e),
		Ku(e),
		jd()
	];
}
// node_modules/ohash/dist/_chunks/is-equal.mjs
function Nd(e) {
	return typeof e == "string" ? `'${e}'` : new Ld().serialize(e);
}
var Pd = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz", Fd = /*@__PURE__*/ (function() {
	let e = /* @__PURE__ */ new Uint8Array(128);
	for (let t = 0; t < 69; t++) e[Pd.charCodeAt(t)] = t + 1;
	for (let t = 65; t <= 90; t++) e[t] = e[t + 32];
	return e;
})();
function Id(e, t) {
	if (e === t) return 0;
	let n = Math.min(e.length, t.length), r = 0;
	for (let i = 0; i < n; i++) {
		let n = e.charCodeAt(i), a = t.charCodeAt(i);
		if (n === a) continue;
		let o = n < 128 && Fd[n] ? Fd[n] : n + 128, s = a < 128 && Fd[a] ? Fd[a] : a + 128;
		if (o !== s) return o < s ? -1 : 1;
		r === 0 && (r = n > a ? -1 : 1);
	}
	return e.length === t.length ? r : e.length < t.length ? -1 : 1;
}
var Ld = /*@__PURE__*/ (function() {
	class e {
		#e = /* @__PURE__ */ new Map();
		compare(e, t) {
			let n = typeof e, r = typeof t;
			return n === "string" && r === "string" ? Id(e, t) : n === "number" && r === "number" ? e - t : Id(this.serialize(e, !0), this.serialize(t, !0));
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
			let i = Object.keys(e).sort(Id), a = `${r}{`;
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
function Rd(e, t) {
	return e === t || Nd(e) === Nd(t);
}
// node_modules/reka-ui/dist/shared/clamp.js
function zd(e, t = -Infinity, n = Infinity) {
	return Math.min(n, Math.max(t, e));
}
// node_modules/reka-ui/dist/shared/createContext.js
function Bd(e, t) {
	let n = typeof e == "string" && !t ? `${e}Context` : t, r = Symbol(n);
	return [(t) => {
		let n = Er(r, t);
		if (n || n === null) return n;
		throw Error(`Injection \`${r.toString()}\` not found. Component must be used within ${Array.isArray(e) ? `one of the following components: ${e.join(", ")}` : `\`${e}\``}`);
	}, (e) => (Tr(r, e), e)];
}
// node_modules/reka-ui/dist/shared/getActiveElement.js
function Vd() {
	let e = document.activeElement;
	if (e == null) return null;
	for (; e != null && e.shadowRoot != null && e.shadowRoot.activeElement != null;) e = e.shadowRoot.activeElement;
	return e;
}
// node_modules/reka-ui/dist/shared/handleAndDispatchCustomEvent.js
function Hd(e, t, n) {
	let r = n.originalEvent.target, i = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && r.addEventListener(e, t, { once: !0 }), r.dispatchEvent(i);
}
// node_modules/reka-ui/dist/shared/nullish.js
function Ud(e) {
	return e == null;
}
// node_modules/@vueuse/shared/dist/index.js
function Wd(e, t) {
	return Ve() ? (He(e, t), !0) : !1;
}
function Gd(e) {
	let t = !1, n, r = Be(!0);
	return ((...i) => (t ||= (n = r.run(() => e(...i)), !0), n));
}
var Kd = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
var qd = (e) => e !== void 0, Jd = Object.prototype.toString, Yd = (e) => Jd.call(e) === "[object Object]", Xd = /* #__PURE__ */ Zd();
function Zd() {
	var e, t;
	return Kd && !!((e = window) != null && (e = e.navigator) != null && e.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((t = window) == null || (t = t.navigator) == null ? void 0 : t.maxTouchPoints) > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function Qd(e) {
	return Array.isArray(e) ? e : [e];
}
function $d(e) {
	return e || Q();
}
function ef(e) {
	if (!Kd) return e;
	let t = 0, n, r, i = () => {
		--t, r && t <= 0 && (r.stop(), n = void 0, r = void 0);
	};
	return ((...a) => (t += 1, r || (r = Be(!0), n = r.run(() => e(...a))), Wd(i), n));
}
function tf(e) {
	return /* @__PURE__ */ rn(/* @__PURE__ */ I(e) ? new Proxy({}, {
		get(t, n, r) {
			return R(Reflect.get(e.value, n, r));
		},
		set(t, n, r) {
			return /* @__PURE__ */ I(e.value[n]) && !/* @__PURE__ */ I(r) ? e.value[n].value = r : e.value[n] = r, !0;
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
function nf(e) {
	return tf($(e));
}
function rf(e, ...t) {
	let n = t.flat(), r = n[0];
	return nf(() => Object.fromEntries(typeof r == "function" ? Object.entries(/* @__PURE__ */ wn(e)).filter(([e, t]) => !r(z(t), e)) : Object.entries(/* @__PURE__ */ wn(e)).filter((e) => !n.includes(e[0]))));
}
function af(e, t = 1e4) {
	return Cn((n, r) => {
		let i = z(e), a, o = () => setTimeout(() => {
			i = z(e), r();
		}, z(t));
		return Wd(() => {
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
function of(e, t) {
	$d(t) && oa(e, t);
}
function sf(e, t, n) {
	return V(e, t, {
		...n,
		immediate: !0
	});
}
// node_modules/@vueuse/core/dist/index.js
var cf = Kd ? window : void 0;
Kd && window.document, Kd && window.navigator, Kd && window.location;
function lf(e) {
	let t = z(e);
	return t?.$el ?? t;
}
function uf(...e) {
	let t = (e, t, n, r) => (e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r)), n = $(() => {
		let t = Qd(z(e[0])).filter((e) => e != null);
		return t.every((e) => typeof e != "string") ? t : void 0;
	});
	return sf(() => [
		n.value?.map((e) => lf(e)) ?? [cf].filter((e) => e != null),
		Qd(z(n.value ? e[1] : e[0])),
		Qd(R(n.value ? e[2] : e[1])),
		z(n.value ? e[3] : e[2])
	], ([e, n, r, i], a, o) => {
		if (!e?.length || !n?.length || !r?.length) return;
		let s = Yd(i) ? { ...i } : i, c = e.flatMap((e) => n.flatMap((n) => r.map((r) => t(e, n, r, s))));
		o(() => {
			c.forEach((e) => e());
		});
	}, { flush: "post" });
}
function df() {
	let e = /* @__PURE__ */ gn(!1), t = Q();
	return t && ra(() => {
		e.value = !0;
	}, t), e;
}
/* @__NO_SIDE_EFFECTS__ */
function ff(e) {
	let t = df();
	return $(() => (t.value, !!e()));
}
function pf(e) {
	return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function mf(...e) {
	let t, n, r = {};
	e.length === 3 ? (t = e[0], n = e[1], r = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], r = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
	let { target: i = cf, eventName: a = "keydown", passive: o = !1, dedupe: s = !1 } = r, c = pf(t);
	return uf(i, a, (e) => {
		e.repeat && z(s) || c(e) && n(e);
	}, o);
}
function hf(e) {
	return JSON.parse(JSON.stringify(e));
}
function gf(e, t, n = {}) {
	let { window: r = cf, ...i } = n, a, o = /* @__PURE__ */ ff(() => r && "ResizeObserver" in r), s = () => {
		a &&= (a.disconnect(), void 0);
	}, c = V($(() => {
		let t = z(e);
		return Array.isArray(t) ? t.map((e) => lf(e)) : [lf(t)];
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
	return Wd(l), {
		isSupported: o,
		stop: l
	};
}
function _f(e, t, n, r = {}) {
	var i, a;
	let { clone: o = !1, passive: s = !1, eventName: c, deep: l = !1, defaultValue: u, shouldEmit: d } = r, f = Q(), p = n || f?.emit || (f == null || (i = f.$emit) == null ? void 0 : i.bind(f)) || (f == null || (a = f.proxy) == null || (a = a.$emit) == null ? void 0 : a.bind(f?.proxy)), m = c;
	t ||= "modelValue", m ||= `update:${t.toString()}`;
	let h = (e) => o ? typeof o == "function" ? o(e) : hf(e) : e, g = () => qd(e[t]) ? h(e[t]) : u, _ = (e) => {
		d ? d(e) && p(m, e) : p(m, e);
	};
	if (s) {
		let n = /* @__PURE__ */ L(g()), r = !1;
		return V(() => e[t], (e) => {
			r || (r = !0, n.value = h(e), rr(() => r = !1));
		}), V(n, (n) => {
			!r && (n !== e[t] || l) && _(n);
		}, { deep: l }), n;
	}
	return $({
		get() {
			return g();
		},
		set(e) {
			_(e);
		}
	});
}
// node_modules/reka-ui/dist/shared/renderSlotFragments.js
function vf(e) {
	return e ? e.flatMap((e) => e.type === G ? vf(e.children) : [e]) : [];
}
// node_modules/reka-ui/dist/ConfigProvider/ConfigProvider.js
var [yf, bf] = /*#__PURE__*/ Bd("ConfigProvider"), xf = /* @__PURE__ */ new WeakMap();
function Sf(e, t) {
	let n = xf.get(e);
	n || (n = {
		owners: /* @__PURE__ */ new Set(),
		original: e.body.style.pointerEvents
	}, xf.set(e, n)), n.owners.add(t), e.body.style.pointerEvents = "none";
}
function Cf(e, t) {
	let n = xf.get(e);
	n?.owners.delete(t) && n.owners.size === 0 && (xf.delete(e), e.body.style.pointerEvents = n.original);
}
// node_modules/defu/dist/defu.mjs
function wf(e) {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null || Symbol.iterator in e ? !1 : Symbol.toStringTag in e ? Object.prototype.toString.call(e) === "[object Module]" : !0;
}
function Tf(e, t, n = ".", r) {
	if (!wf(t)) return Tf(e, {}, n, r);
	let i = { ...t };
	for (let t of Object.keys(e)) {
		if (t === "__proto__" || t === "constructor") continue;
		let a = e[t];
		a != null && (r && r(i, t, a, n) || (i[t] = Array.isArray(a) && Array.isArray(i[t]) ? [...a, ...i[t]] : wf(a) && wf(i[t]) ? Tf(a, i[t], (n ? `${n}.` : "") + t.toString(), r) : a));
	}
	return i;
}
function Ef(e) {
	return (...t) => t.reduce((t, n) => Tf(t, n, "", e), {});
}
var Df = Ef(), Of = Symbol("useBodyScrollLock"), kf = ef(() => {
	let e = /* @__PURE__ */ L(/* @__PURE__ */ new Map()), t = /* @__PURE__ */ L(), n = $(() => {
		for (let t of e.value.values()) if (t) return !0;
		return !1;
	}), r = yf({ scrollBody: /* @__PURE__ */ L(!0) }), i = null, a = () => {
		document.body.style.paddingRight = "", document.body.style.marginRight = "", Cf(document, Of), document.documentElement.style.removeProperty("--scrollbar-width"), document.body.style.overflow = t.value ?? "", Xd && i?.(), t.value = void 0;
	};
	return V(n, (e, o) => {
		if (!Kd) return;
		if (!e) {
			o && a();
			return;
		}
		t.value === void 0 && (t.value = document.body.style.overflow);
		let s = window.innerWidth - document.documentElement.clientWidth, c = {
			padding: s,
			margin: 0
		}, l = r.scrollBody?.value ? typeof r.scrollBody.value == "object" ? Df({
			padding: r.scrollBody.value.padding === !0 ? s : r.scrollBody.value.padding,
			margin: r.scrollBody.value.margin === !0 ? s : r.scrollBody.value.margin
		}, c) : c : {
			padding: 0,
			margin: 0
		};
		s > 0 && (document.body.style.paddingRight = typeof l.padding == "number" ? `${l.padding}px` : String(l.padding), document.body.style.marginRight = typeof l.margin == "number" ? `${l.margin}px` : String(l.margin), document.documentElement.style.setProperty("--scrollbar-width", `${s}px`), document.body.style.overflow = "hidden"), Xd && (i = uf(document, "touchmove", (e) => Mf(e), { passive: !1 })), rr(() => {
			n.value && (Sf(document, Of), document.body.style.overflow = "hidden");
		});
	}, {
		immediate: !0,
		flush: "sync"
	}), e;
});
function Af(e) {
	let t = Math.random().toString(36).substring(2, 7), n = kf();
	n.value.set(t, e ?? !1);
	let r = $({
		get: () => n.value.get(t) ?? !1,
		set: (e) => n.value.set(t, e)
	});
	return of(() => {
		n.value.delete(t);
	}), r;
}
function jf(e) {
	let t = window.getComputedStyle(e);
	if (t.overflowX === "scroll" || t.overflowY === "scroll" || t.overflowX === "auto" && e.clientWidth < e.scrollWidth || t.overflowY === "auto" && e.clientHeight < e.scrollHeight) return !0;
	{
		let t = e.parentNode;
		return !(t instanceof Element) || t.tagName === "BODY" ? !1 : jf(t);
	}
}
function Mf(e) {
	let t = e || window.event, n = t.target;
	return n instanceof Element && jf(n) ? !1 : t.touches.length > 1 || (t.preventDefault && t.cancelable && t.preventDefault(), !1);
}
// node_modules/reka-ui/dist/shared/useDirection.js
function Nf(e) {
	let t = yf({ dir: /* @__PURE__ */ L("ltr") });
	return $(() => e?.value || t.dir?.value || "ltr");
}
// node_modules/reka-ui/dist/shared/useEmitAsProps.js
function Pf(e) {
	let t = Q(), n = t?.type.emits, r = {};
	return n?.length || console.warn(`No emitted event found. Please check component: ${t?.type.__name}`), n?.forEach((t) => {
		r[de(j(t))] = (...n) => e(t, ...n);
	}), r;
}
// node_modules/reka-ui/dist/shared/useFocusGuards.js
var Ff = 0;
function If() {
	Ar((e) => {
		if (!Kd) return;
		let t = document.querySelectorAll("[data-reka-focus-guard]");
		document.body.insertAdjacentElement("afterbegin", t[0] ?? Lf()), document.body.insertAdjacentElement("beforeend", t[1] ?? Lf()), Ff++, e(() => {
			Ff === 1 && document.querySelectorAll("[data-reka-focus-guard]").forEach((e) => e.remove()), Ff--;
		});
	});
}
function Lf() {
	let e = document.createElement("span");
	return e.setAttribute("data-reka-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
// node_modules/reka-ui/dist/shared/useFormControl.js
function Rf(e) {
	return $(() => !z(e) || !!lf(e)?.closest("form"));
}
// node_modules/reka-ui/dist/shared/useForwardExpose.js
function zf() {
	let e = Q(), t = /* @__PURE__ */ L(), n = $(() => r());
	aa(() => {
		n.value !== r() && yn(t);
	});
	function r() {
		return t.value && "$el" in t.value && ["#text", "#comment"].includes(t.value.$el.nodeName) ? t.value.$el.nextElementSibling : lf(t);
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
function Bf(e) {
	let t = Q(), n = Object.keys(t?.type.props ?? {}).reduce((e, n) => {
		let r = (t?.type.props[n]).default;
		return r !== void 0 && (e[n] = r), e;
	}, {}), r = /* @__PURE__ */ Dn(e);
	return $(() => {
		let e = {}, i = t?.vnode.props ?? {};
		return Object.keys(i).forEach((t) => {
			e[j(t)] = i[t];
		}), Object.keys({
			...n,
			...e
		}).reduce((e, t) => (r.value[t] !== void 0 && (e[t] = r.value[t]), e), {});
	});
}
// node_modules/reka-ui/dist/shared/useForwardPropsEmits.js
function Vf(e, t) {
	let n = Bf(e), r = t ? Pf(t) : {};
	return $(() => ({
		...n.value,
		...r
	}));
}
// node_modules/aria-hidden/dist/es2015/index.js
var Hf = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, Uf = /* @__PURE__ */ new WeakMap(), Wf = /* @__PURE__ */ new WeakMap(), Gf = {}, Kf = 0, qf = function(e) {
	return e && (e.host || qf(e.parentNode));
}, Jf = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = qf(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, Yf = function(e, t, n, r) {
	var i = Jf(t, Array.isArray(e) ? e : [e]);
	Gf[n] || (Gf[n] = /* @__PURE__ */ new WeakMap());
	var a = Gf[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		e && !s.has(e) && (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		e && !c.has(e) && Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (Uf.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				Uf.set(e, c), a.set(e, l), o.push(e), c === 1 && i && Wf.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), Kf++, function() {
		o.forEach(function(e) {
			var t = Uf.get(e) - 1, i = a.get(e) - 1;
			Uf.set(e, t), a.set(e, i), t || (Wf.has(e) || e.removeAttribute(r), Wf.delete(e)), i || e.removeAttribute(n);
		}), Kf--, Kf || (Uf = /* @__PURE__ */ new WeakMap(), Uf = /* @__PURE__ */ new WeakMap(), Wf = /* @__PURE__ */ new WeakMap(), Gf = {});
	};
}, Xf = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || Hf(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), Yf(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
// node_modules/reka-ui/dist/shared/useHideOthers.js
function Zf(e) {
	let t;
	V(() => lf(e), (e) => {
		let n = !1;
		try {
			n = !!e?.closest("[popover]:not(:popover-open)");
		} catch {}
		e && !n ? t = Xf(e) : t && t();
	}), sa(() => {
		t && t();
	});
}
// node_modules/reka-ui/dist/shared/useId.js
var Qf = 0;
function $f(e, t = "reka") {
	if (e) return e;
	let n, r = yf({ useId: void 0 });
	return n = r.useId ? r.useId() : "useId" in Mu ? di?.() : `${++Qf}`, t ? `${t}-${n}` : n;
}
// node_modules/reka-ui/dist/shared/useSize.js
function ep(e) {
	let t = /* @__PURE__ */ L(), n = $(() => t.value?.width ?? 0), r = $(() => t.value?.height ?? 0), i;
	return ra(() => {
		let n = lf(e);
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
	}), sa(() => {
		i?.disconnect(), i = void 0;
	}), {
		width: n,
		height: r
	};
}
// node_modules/reka-ui/dist/shared/useStateMachine.js
function tp(e, t) {
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
function np(e) {
	let t = af("", 1e3);
	return {
		search: t,
		handleTypeaheadSearch: (n, r) => {
			if (t.value += n, e) e(n);
			else {
				let e = Vd(), n = r.map((e) => ({
					...e,
					textValue: e.value?.textValue ?? e.ref.textContent?.trim() ?? ""
				})), i = n.find((t) => t.ref === e), a = ip(n.map((e) => e.textValue), t.value, i?.textValue), o = n.find((e) => e.textValue === a);
				return o && o.ref.focus(), o?.ref;
			}
		},
		resetTypeahead: () => {
			t.value = "";
		}
	};
}
function rp(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
function ip(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = rp(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
// node_modules/reka-ui/dist/Presence/usePresence.js
function ap(e, t) {
	let n = /* @__PURE__ */ L({}), r = /* @__PURE__ */ L("none"), i = /* @__PURE__ */ L(e), a = e.value ? "mounted" : "unmounted", o, s = t.value?.ownerDocument.defaultView ?? cf, { state: c, dispatch: l } = tp(a, {
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
		if (Kd) {
			let n = new CustomEvent(e, {
				bubbles: !1,
				cancelable: !1
			});
			t.value?.dispatchEvent(n);
		}
	};
	V(e, async (e, i) => {
		let a = i !== e;
		if (await rr(), a) {
			let a = r.value, o = op(t.value);
			e ? (l("MOUNT"), u("enter"), o === "none" && u("after-enter")) : o === "none" || o === "undefined" || n.value?.display === "none" ? (l("UNMOUNT"), u("leave"), u("after-leave")) : i && a !== o ? (l("ANIMATION_OUT"), u("leave")) : (l("UNMOUNT"), u("after-leave"));
		}
	}, { immediate: !0 });
	let d = (e) => {
		if (e.target !== t.value) return;
		let n = op(t.value), r = n.includes(CSS.escape(e.animationName)), a = c.value === "mounted" ? "enter" : "leave";
		if (r && (u(`after-${a}`), l("ANIMATION_END"), !i.value)) {
			let e = t.value.style.animationFillMode;
			t.value.style.animationFillMode = "forwards", o = s?.setTimeout(() => {
				t.value?.style.animationFillMode === "forwards" && (t.value.style.animationFillMode = e);
			});
		}
		n === "none" && l("ANIMATION_END");
	}, f = (e) => {
		e.target === t.value && (r.value = op(t.value));
	}, p = V(t, (e, t) => {
		e ? (n.value = getComputedStyle(e), e.addEventListener("animationstart", f), e.addEventListener("animationcancel", d), e.addEventListener("animationend", d)) : (l("ANIMATION_END"), o !== void 0 && s?.clearTimeout(o), t?.removeEventListener("animationstart", f), t?.removeEventListener("animationcancel", d), t?.removeEventListener("animationend", d));
	}, { immediate: !0 }), m = V(c, () => {
		let e = op(t.value);
		r.value = c.value === "mounted" ? e : "none";
	});
	return sa(() => {
		p(), m(), t.value && (t.value.removeEventListener("animationstart", f), t.value.removeEventListener("animationcancel", d), t.value.removeEventListener("animationend", d)), o !== void 0 && s?.clearTimeout(o);
	}), { isPresent: $(() => ["mounted", "unmountSuspended"].includes(c.value)) };
}
function op(e) {
	return e && getComputedStyle(e).animationName || "none";
}
// node_modules/reka-ui/dist/Presence/Presence.js
var sp = /*#__PURE__*/ H({
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
		let { present: r, forceMount: i } = /* @__PURE__ */ wn(e), a = /* @__PURE__ */ L(), { isPresent: o } = ap(r, a);
		n({ present: o });
		let s = t.default({ present: o.value });
		s = vf(s || []);
		let c = Q();
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
		return () => i.value || r.value || o.value ? oc(t.default({ present: o.value })[0], { ref: (e) => {
			let t = lf(e);
			return t?.hasAttribute === void 0 || (t?.hasAttribute("data-reka-popper-content-wrapper") ? a.value = t.firstElementChild : a.value = t), t;
		} }) : null;
	}
}), cp = /*#__PURE__*/ H({
	name: "PrimitiveSlot",
	inheritAttrs: !1,
	setup(e, { attrs: t, slots: n }) {
		return () => {
			if (!n.default) return null;
			let e = vf(n.default()), r = e.findIndex((e) => e.type !== K);
			if (r === -1) return e;
			let i = e[r];
			delete i.props?.ref;
			let a = i.props ? Ps(t, i.props) : t, o = Ds({
				...i,
				props: {}
			}, a);
			return e.length === 1 ? o : (e[r] = o, e);
		};
	}
}), lp = [
	"area",
	"img",
	"input"
], up = /*#__PURE__*/ H({
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
		return typeof r == "string" && lp.includes(r) ? () => oc(r, t) : r === "template" ? () => oc(cp, t, { default: n.default }) : () => oc(e.as, t, { default: n.default });
	}
});
// node_modules/reka-ui/dist/Primitive/usePrimitiveElement.js
function dp() {
	let e = /* @__PURE__ */ L();
	return {
		primitiveElement: e,
		currentElement: $(() => ["#text", "#comment"].includes(e.value?.$el.nodeName) ? e.value?.$el.nextElementSibling : lf(e))
	};
}
// node_modules/reka-ui/dist/DismissableLayer/utils.js
var fp = "dismissableLayer.pointerDownOutside", pp = "dismissableLayer.focusOutside";
function mp(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e.ownerDocument?.defaultView;
	return typeof Element < "u" && e instanceof Element || !!t && e instanceof t.Element;
}
function hp(e, t) {
	if (!mp(t)) return !1;
	if (e.contains(t)) return !0;
	let n = t.closest("[data-dismissable-layer]"), r = e.dataset.dismissableLayer === "" ? e : e.querySelector("[data-dismissable-layer]"), i = Array.from(e.ownerDocument.querySelectorAll("[data-dismissable-layer]"));
	return !!(n && (r === n || i.indexOf(r) < i.indexOf(n)));
}
function gp(e, t, n = !0) {
	let r = /* @__PURE__ */ L(!1), i = /* @__PURE__ */ L(() => {});
	return Ar((a) => {
		if (!Kd || !z(n)) return;
		let o = t?.value?.ownerDocument ?? globalThis.document, s = async (n) => {
			let a = n.target;
			if (t?.value && a) {
				if (hp(t.value, a)) o.removeEventListener("click", i.value), r.value = !1;
				else {
					if (n.target && !r.value) {
						let t = { originalEvent: n };
						function r() {
							Hd(fp, e, t);
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
		z(n) && (r.value = !0);
	} };
}
function _p(e, t, n = !0) {
	let r = /* @__PURE__ */ L(!1);
	return Ar((i) => {
		if (!Kd || !z(n)) return;
		let a = t?.value?.ownerDocument ?? globalThis.document, o = async (n) => {
			if (!t?.value) return;
			await rr(), await rr();
			let i = n.target;
			t.value && i && !hp(t.value, i) && n.target && !r.value && Hd(pp, e, { originalEvent: n });
		};
		a.addEventListener("focusin", o), i(() => a.removeEventListener("focusin", o));
	}), {
		onFocusCapture: () => {
			z(n) && (r.value = !0);
		},
		onBlurCapture: () => {
			z(n) && (r.value = !1);
		}
	};
}
// node_modules/reka-ui/dist/DismissableLayer/context.js
var vp = /*#__PURE__*/ rn({
	layersRoot: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), yp = /* @__PURE__ */ H({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = zf(), o = $(() => a.value?.ownerDocument ?? globalThis.document), s = $(() => vp.layersRoot), c = $(() => a.value ? Array.from(s.value).indexOf(a.value) : -1), l = $(() => vp.layersWithOutsidePointerEventsDisabled.size > 0), u = $(() => {
			let e = Array.from(s.value), [t] = [...vp.layersWithOutsidePointerEventsDisabled].slice(-1), n = e.indexOf(t);
			return c.value >= n;
		}), d = gp(async (e) => {
			let t = [...vp.branches].some((t) => t?.contains(e.target));
			n.present && u.value && !t && (r("pointerDownOutside", e), r("interactOutside", e), await rr(), e.defaultPrevented || r("dismiss"));
		}, a, () => n.present), f = _p((e) => {
			let t = [...vp.branches].some((t) => t?.contains(e.target));
			n.present && !t && (r("focusOutside", e), r("interactOutside", e), e.defaultPrevented || r("dismiss"));
		}, a);
		return mf("Escape", (e) => {
			n.present && c.value === s.value.size - 1 && (r("escapeKeyDown", e), e.defaultPrevented || r("dismiss"));
		}, { target: () => o.value?.defaultView ?? globalThis.window }), V([
			a,
			() => n.disableOutsidePointerEvents,
			() => n.present
		], ([e, t, n], r, i) => {
			if (e && n && t) {
				let t = e.ownerDocument;
				Sf(t, e), vp.layersWithOutsidePointerEventsDisabled.add(e), i(() => {
					vp.layersWithOutsidePointerEventsDisabled.delete(e), Cf(t, e);
				});
			}
		}, { immediate: !0 }), V([a, () => n.present], ([e, t], n, r) => {
			e && t && (s.value.add(e), r(() => {
				s.value.delete(e);
			}));
		}, { immediate: !0 }), Ar((e) => {
			e(() => {
				a.value && (s.value.delete(a.value), vp.layersWithOutsidePointerEventsDisabled.delete(a.value));
			});
		}), (t, n) => (q(), Y(R(up), {
			ref: R(i),
			"as-child": e.asChild,
			as: e.as,
			"data-dismissable-layer": "",
			style: ye({ pointerEvents: l.value ? u.value ? "auto" : "none" : void 0 }),
			onFocusCapture: R(f).onFocusCapture,
			onBlurCapture: R(f).onBlurCapture,
			onPointerdownCapture: R(d).onPointerDownCapture
		}, {
			default: B(() => [U(t.$slots, "default")]),
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
}), bp = Gd(() => /* @__PURE__ */ L([]));
function xp() {
	let e = bp();
	return {
		add(t) {
			let n = e.value[0];
			t !== n && n?.pause(), e.value = Sp(e.value, t), e.value.unshift(t);
		},
		remove(t) {
			e.value = Sp(e.value, t), e.value[0]?.resume();
		}
	};
}
function Sp(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
// node_modules/reka-ui/dist/FocusScope/utils.js
var Cp = "focusScope.autoFocusOnMount", wp = "focusScope.autoFocusOnUnmount", Tp = {
	bubbles: !1,
	cancelable: !0
};
function Ep(e, t) {
	let n = t;
	for (; n;) {
		if (e.contains(n)) return !0;
		n = n.getRootNode().host ?? null;
	}
	return !1;
}
function Dp(e, { select: t = !1 } = {}) {
	let n = Vd();
	for (let r of e) if (Np(r, { select: t }), Vd() !== n) return !0;
}
function Op(e) {
	let t = kp(e);
	return [Ap(t, e), Ap(t.reverse(), e)];
}
function kp(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t.sort((e, t) => e.tabIndex === t.tabIndex ? 0 : e.tabIndex === 0 ? 1 : t.tabIndex === 0 ? -1 : e.tabIndex - t.tabIndex);
}
function Ap(e, t) {
	for (let n of e) if (!jp(n, { upTo: t })) return n;
}
function jp(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function Mp(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function Np(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = Vd();
		e.focus({ preventScroll: !0 }), e !== n && Mp(e) && t && e.select();
	}
}
// node_modules/reka-ui/dist/FocusScope/FocusScope.js
var Pp = /* @__PURE__ */ H({
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
		let n = e, r = t, { currentRef: i, currentElement: a } = zf(), o = /* @__PURE__ */ L(null), s = xp(), c = /*#__PURE__*/ rn({
			paused: !1,
			pause() {
				this.paused = !0;
			},
			resume() {
				this.paused = !1;
			}
		});
		Ar((e) => {
			if (!Kd) return;
			let t = a.value;
			if (!n.trapped) return;
			let r = t?.ownerDocument ?? document, i = t ? t.getRootNode() : r;
			function s(e) {
				if (c.paused || !t) return;
				let n = e.target;
				t.contains(n) ? o.value = n : Np(o.value, { select: !0 });
			}
			function l(e) {
				if (c.paused || !t) return;
				let n = e.relatedTarget;
				n !== null && (t.contains(n) || Np(o.value, { select: !0 }));
			}
			function u(e) {
				let n = o.value;
				if (n === null || !e.some((e) => e.removedNodes.length > 0)) return;
				let r = Vd();
				r && t.contains(r) || t.contains(n) || Np(t);
			}
			function d(e) {
				if (c.paused || !t) return;
				let n = e.composedPath()[0];
				Ep(t, n) || Np(o.value, { select: !0 });
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
			let n = new CustomEvent(Cp, Tp), i = (e) => r("mountAutoFocus", e);
			e.addEventListener(Cp, i), e.dispatchEvent(n), e.removeEventListener(Cp, i), n.defaultPrevented || (Dp(kp(e), { select: !0 }), Vd() === t && Np(e));
		}
		Ar(async (e) => {
			let t = a.value;
			if (await rr(), !t) return;
			n.present !== !1 && s.add(c);
			let i = Vd();
			!t.contains(i) && n.present !== !1 && l(t, i), e(() => {
				let e = new CustomEvent(wp, Tp), n = (e) => {
					r("unmountAutoFocus", e);
				};
				t.addEventListener(wp, n), t.dispatchEvent(e), t.setAttribute("data-focus-scope-unmounting", ""), setTimeout(() => {
					e.defaultPrevented || Np(i ?? document.body, { select: !0 }), t.removeEventListener(wp, n), s.remove(c), t.removeAttribute("data-focus-scope-unmounting");
				}, 0);
			});
		}), V(() => n.present, async (e, t) => {
			if (!Kd) return;
			if (e === !1 && t === !0) {
				s.remove(c);
				return;
			}
			if (e !== !0 || t !== !1) return;
			s.add(c), await rr();
			let n = a.value;
			if (!n) return;
			let r = Vd();
			n.contains(r) || l(n, r);
		});
		function u(e) {
			if (!n.loop && !n.trapped || c.paused) return;
			let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, r = Vd();
			if (t && r) {
				let t = e.currentTarget, [i, a] = Op(t);
				i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n.loop && Np(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n.loop && Np(a, { select: !0 })) : r === t && e.preventDefault();
			}
		}
		return (t, n) => (q(), Y(R(up), {
			ref_key: "currentRef",
			ref: i,
			tabindex: "-1",
			"as-child": e.asChild,
			as: e.as,
			onKeydown: u
		}, {
			default: B(() => [U(t.$slots, "default")]),
			_: 3
		}, 8, ["as-child", "as"]));
	}
}), Fp = ["Enter", " "], Ip = [
	"ArrowDown",
	"PageUp",
	"Home"
], Lp = [
	"ArrowUp",
	"PageDown",
	"End"
];
[...Ip, ...Lp], [...Fp], [...Fp];
function Rp(e) {
	let t = Vd();
	for (let n of e) if (n === t || (n.focus(), Vd() !== t)) return;
}
// node_modules/reka-ui/dist/Teleport/Teleport.js
var zp = /* @__PURE__ */ H({
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
		let t = e, n = yf({}), r = $(() => t.to ?? n.teleportTo?.value ?? "body"), i = df();
		return (t, n) => R(i) || e.forceMount ? (q(), Y(qr, {
			key: 0,
			to: r.value,
			disabled: e.disabled,
			defer: e.defer
		}, [U(t.$slots, "default")], 8, [
			"to",
			"disabled",
			"defer"
		])) : As("v-if", !0);
	}
}), Bp = "data-reka-collection-item";
function Vp(e = {}) {
	let { key: t = "", isProvider: n = !1 } = e, r = `${t}CollectionProvider`, i;
	n ? (i = {
		collectionRef: /* @__PURE__ */ L(),
		itemMap: /* @__PURE__ */ L(/* @__PURE__ */ new Map())
	}, Tr(r, i)) : i = Er(r);
	let a = (e, t = !1) => {
		if (!i.collectionRef.value) return;
		let n = i.itemMap.value.get(e);
		return n && (t || n.ref.dataset.disabled !== "") ? n : void 0;
	}, o = (e = !1) => {
		let t = i.collectionRef.value;
		if (!t) return [];
		let n = Array.from(t.querySelectorAll(`[${Bp}]`)), r = new Map(n.map((e, t) => [e, t])), a = Array.from(i.itemMap.value.values()).sort((e, t) => (r.get(e.ref) ?? -1) - (r.get(t.ref) ?? -1));
		return e ? a : a.filter((e) => e.ref.dataset.disabled !== "");
	}, s = /*#__PURE__*/ H({
		name: "CollectionSlot",
		inheritAttrs: !1,
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = dp();
			return V(a, () => {
				i.collectionRef.value = a.value;
			}), () => oc(cp, {
				ref: r,
				...n
			}, t);
		}
	}), c = /*#__PURE__*/ H({
		name: "CollectionItem",
		inheritAttrs: !1,
		props: { value: { validator: () => !0 } },
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = dp();
			return Ar((t) => {
				if (a.value) {
					let n = pn(a.value);
					i.itemMap.value.set(n, {
						ref: a.value,
						value: e.value
					}), t(() => i.itemMap.value.delete(n));
				}
			}), () => oc(cp, {
				...n,
				[Bp]: "",
				ref: r
			}, t);
		}
	});
	return {
		getItems: o,
		getItem: a,
		reactiveItems: $(() => Array.from(i.itemMap.value.values())),
		itemMapSize: $(() => i.itemMap.value.size),
		CollectionSlot: s,
		CollectionItem: c
	};
}
// node_modules/reka-ui/dist/VisuallyHidden/VisuallyHidden.js
var Hp = /* @__PURE__ */ H({
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
		return (t, n) => (q(), Y(R(up), {
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
			default: B(() => [U(t.$slots, "default")]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"aria-hidden",
			"data-hidden",
			"tabindex"
		]));
	}
}), [Up, Wp] = /*#__PURE__*/ Bd("PopperRoot"), Gp = /* @__PURE__ */ H({
	inheritAttrs: !1,
	__name: "PopperRoot",
	setup(e) {
		let t = /* @__PURE__ */ L();
		return Wp({
			anchor: t,
			onAnchorChange: (e) => t.value = e
		}), (e, t) => U(e.$slots, "default");
	}
}), Kp = /* @__PURE__ */ H({
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
		let t = e, { forwardRef: n, currentElement: r } = zf(), i = Up();
		return jr(() => {
			i.onAnchorChange(t.reference ?? r.value);
		}), (t, r) => (q(), Y(R(up), {
			ref: R(n),
			as: e.as,
			"as-child": e.asChild
		}, {
			default: B(() => [U(t.$slots, "default")]),
			_: 3
		}, 8, ["as", "as-child"]));
	}
});
// node_modules/reka-ui/dist/Popper/utils.js
function qp(e) {
	return e !== null;
}
function Jp(e) {
	return {
		name: "transformOrigin",
		options: e,
		fn(t) {
			let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = Yp(n), u = {
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
function Yp(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var Xp = [
	"top",
	"right",
	"bottom",
	"left"
], Zp = Math.min, Qp = Math.max, $p = Math.round, em = Math.floor, tm = (e) => ({
	x: e,
	y: e
}), nm = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function rm(e, t, n) {
	return Qp(e, Zp(t, n));
}
function im(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function am(e) {
	return e.split("-")[0];
}
function om(e) {
	return e.split("-")[1];
}
function sm(e) {
	return e === "x" ? "y" : "x";
}
function cm(e) {
	return e === "y" ? "height" : "width";
}
function lm(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function um(e) {
	return sm(lm(e));
}
function dm(e, t, n) {
	n === void 0 && (n = !1);
	let r = om(e), i = um(e), a = cm(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = bm(o)), [o, bm(o)];
}
function fm(e) {
	let t = bm(e);
	return [
		pm(e),
		t,
		pm(t)
	];
}
function pm(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var mm = ["left", "right"], hm = ["right", "left"], gm = ["top", "bottom"], _m = ["bottom", "top"];
function vm(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? hm : mm : t ? mm : hm;
		case "left":
		case "right": return t ? gm : _m;
		default: return [];
	}
}
function ym(e, t, n, r) {
	let i = om(e), a = vm(am(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(pm)))), a;
}
function bm(e) {
	let t = am(e);
	return nm[t] + e.slice(t.length);
}
function xm(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function Sm(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : xm(e);
}
function Cm(e) {
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
function wm(e, t, n) {
	let { reference: r, floating: i } = e, a = lm(t), o = um(t), s = cm(o), c = am(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = om(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function Tm(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = im(t, e), p = Sm(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Cm(await i.getClippingRect({
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
	}, y = Cm(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var Em = 50, Dm = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Tm
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = wm(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < Em && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = wm(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Om = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = im(e, t) || {};
		if (l == null) return {};
		let d = Sm(u), f = {
			x: n,
			y: r
		}, p = um(i), m = cm(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		C && await (o.isElement == null ? void 0 : o.isElement(S)) || (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = Zp(d[_], T), D = Zp(d[v], T), O = C - h[m] - D, k = C / 2 - h[m] / 2 + w, ee = rm(E, k, O), te = !c.arrow && om(i) != null && k !== ee && a.reference[m] / 2 - (k < E ? E : D) - h[m] / 2 < 0, ne = te ? k < E ? k - E : k - O : 0;
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
}), km = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = im(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = am(r), _ = lm(o), v = am(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [bm(o)] : fm(o)), x = p !== "none";
			!d && x && b.push(...ym(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = dm(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === lm(t) || T.every((e) => lm(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = lm(e.placement);
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
function Am(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function jm(e) {
	return Xp.some((t) => e[t] >= 0);
}
var Mm = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = im(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Am(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: jm(e)
					} };
				}
				case "escaped": {
					let e = Am(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: jm(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Nm = /*#__PURE__*/ new Set(["left", "top"]);
async function Pm(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = am(n), s = om(n), c = lm(n) === "y", l = Nm.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = im(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var Fm = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Pm(t, e);
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
}, Im = function(e) {
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
			} }, ...l } = im(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = lm(i), p = sm(f), m = u[p], h = u[f], g = (e, t) => rm(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, Lm = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = im(e, t), u = {
				x: n,
				y: r
			}, d = lm(i), f = sm(d), p = u[f], m = u[d], h = im(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = Nm.has(am(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Rm = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = im(e, t), c = await i.detectOverflow(t, s), l = am(n), u = om(n), d = lm(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = Zp(p - c[m], g), y = Zp(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * Qp(c.left, c.right) : S = p - 2 * Qp(c.top, c.bottom)), await o({
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
function zm() {
	return typeof window < "u";
}
function Bm(e) {
	return Um(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Vm(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Hm(e) {
	return ((Um(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Um(e) {
	return zm() ? e instanceof Node || e instanceof Vm(e).Node : !1;
}
function Wm(e) {
	return zm() ? e instanceof Element || e instanceof Vm(e).Element : !1;
}
function Gm(e) {
	return zm() ? e instanceof HTMLElement || e instanceof Vm(e).HTMLElement : !1;
}
function Km(e) {
	return !zm() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Vm(e).ShadowRoot;
}
function qm(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = ih(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Jm(e) {
	return /^(table|td|th)$/.test(Bm(e));
}
function Ym(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Xm = /transform|translate|scale|rotate|perspective|filter/, Zm = /paint|layout|strict|content/, Qm = (e) => !!e && e !== "none", $m;
function eh(e) {
	let t = Wm(e) ? ih(e) : e;
	return Qm(t.transform) || Qm(t.translate) || Qm(t.scale) || Qm(t.rotate) || Qm(t.perspective) || !nh() && (Qm(t.backdropFilter) || Qm(t.filter)) || Xm.test(t.willChange || "") || Zm.test(t.contain || "");
}
function th(e) {
	let t = oh(e);
	for (; Gm(t) && !rh(t);) {
		if (eh(t)) return t;
		if (Ym(t)) return null;
		t = oh(t);
	}
	return null;
}
function nh() {
	return $m ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), $m;
}
function rh(e) {
	return /^(html|body|#document)$/.test(Bm(e));
}
function ih(e) {
	return Vm(e).getComputedStyle(e);
}
function ah(e) {
	return Wm(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function oh(e) {
	if (Bm(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Km(e) && e.host || Hm(e);
	return Km(t) ? t.host : t;
}
function sh(e) {
	let t = oh(e);
	return rh(t) ? (e.ownerDocument || e).body : Gm(t) && qm(t) ? t : sh(t);
}
function ch(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = sh(e), i = r === e.ownerDocument?.body, a = Vm(r);
	if (i) {
		let e = lh(a);
		return t.concat(a, a.visualViewport || [], qm(r) ? r : [], e && n ? ch(e) : []);
	}
	return t.concat(r, ch(r, [], n));
}
function lh(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function uh(e) {
	let t = ih(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Gm(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = $p(n) !== a || $p(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function dh(e) {
	return Wm(e) ? e : e.contextElement;
}
function fh(e) {
	let t = dh(e);
	if (!Gm(t)) return tm(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = uh(t), o = (a ? $p(n.width) : n.width) / r, s = (a ? $p(n.height) : n.height) / i;
	return o && Number.isFinite(o) || (o = 1), s && Number.isFinite(s) || (s = 1), {
		x: o,
		y: s
	};
}
var ph = /*#__PURE__*/ tm(0);
function mh(e) {
	let t = Vm(e);
	return !nh() || !t.visualViewport ? ph : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function hh(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === Vm(e);
}
function gh(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = dh(e), o = tm(1);
	t && (r ? Wm(r) && (o = fh(r)) : o = fh(e));
	let s = hh(a, n, r) ? mh(a) : tm(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = Vm(a), t = Wm(r) ? Vm(r) : r, n = e, i = lh(n);
		for (; i && t !== n;) {
			let e = fh(i), t = i.getBoundingClientRect(), r = ih(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Vm(i), i = lh(n);
		}
	}
	return Cm({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function _h(e, t) {
	let n = ah(e).scrollLeft;
	return t ? t.left + n : gh(Hm(e)).left + n;
}
function vh(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - _h(e, n),
		y: n.top + t.scrollTop
	};
}
function yh(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Hm(r), s = t ? Ym(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = tm(1), u = tm(0), d = Gm(r);
	if ((d || !a) && ((Bm(r) !== "body" || qm(o)) && (c = ah(r)), d)) {
		let e = gh(r);
		l = fh(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? vh(o, c) : tm(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function bh(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function xh(e) {
	let t = ah(e), n = e.ownerDocument.body, r = Qp(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = Qp(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + _h(e), o = -t.scrollTop;
	return ih(n).direction === "rtl" && (a += Qp(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var Sh = 25;
function Ch(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = Vm(e), a = Hm(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !nh() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (_h(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= Sh && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function wh(e, t) {
	let n = gh(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = fh(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function Th(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = Ch(e, n, t);
	else if (t === "document") r = xh(Hm(e));
	else if (Wm(t)) r = wh(t, n);
	else {
		let n = mh(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Cm(r);
}
function Eh(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = ch(e, [], !1).filter((e) => Wm(e) && Bm(e) !== "body"), i = null, a = ih(e).position === "fixed", o = a ? oh(e) : e;
	for (; Wm(o) && !rh(o);) {
		let e = ih(o), t = eh(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = oh(o);
	}
	return t.set(e, r), r;
}
function Dh(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Ym(t) ? [] : Eh(t, this._c) : [].concat(n), r], o = Th(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = Th(t, a[e], i);
		s = Qp(n.top, s), c = Zp(n.right, c), l = Zp(n.bottom, l), u = Qp(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Oh(e) {
	let { width: t, height: n } = uh(e);
	return {
		width: t,
		height: n
	};
}
function kh(e, t, n) {
	let r = Gm(t), i = Hm(t), a = n === "fixed", o = gh(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = tm(0);
	if ((r || !a) && ((Bm(t) !== "body" || qm(i)) && (s = ah(t)), r)) {
		let e = gh(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = _h(i));
	let l = i && !r && !a ? vh(i, s) : tm(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function Ah(e) {
	return ih(e).position === "static";
}
function jh(e, t) {
	if (!Gm(e) || ih(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Hm(e) === n && (n = n.ownerDocument.body), n;
}
function Mh(e, t) {
	let n = Vm(e);
	if (Ym(e)) return n;
	if (!Gm(e)) {
		let t = oh(e);
		for (; t && !rh(t);) {
			if (Wm(t) && !Ah(t)) return t;
			t = oh(t);
		}
		return n;
	}
	let r = jh(e, t);
	for (; r && Jm(r) && Ah(r);) r = jh(r, t);
	return r && rh(r) && Ah(r) && !eh(r) ? n : r || th(e) || n;
}
var Nh = async function(e) {
	let t = this.getOffsetParent || Mh, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: kh(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Ph(e) {
	return ih(e).direction === "rtl";
}
var Fh = {
	convertOffsetParentRelativeRectToViewportRelativeRect: yh,
	getDocumentElement: Hm,
	getClippingRect: Dh,
	getOffsetParent: Mh,
	getElementRects: Nh,
	getClientRects: bh,
	getDimensions: Oh,
	getScale: fh,
	isElement: Wm,
	isRTL: Ph
};
function Ih(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Lh(e, t, n) {
	let r = null, i, a = Hm(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = em(d), h = em(a.clientWidth - (u + f)), g = em(a.clientHeight - (d + p)), _ = em(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: Qp(0, Zp(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!Ih(l, e.getBoundingClientRect())) return s();
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
	let c = Vm(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function Rh(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = dh(e), u = i || a ? [...l ? ch(l) : [], ...t ? ch(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? Lh(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? gh(e) : null;
	c && g();
	function g() {
		let t = gh(e);
		h && !Ih(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var zh = Fm, Bh = Im, Vh = km, Hh = Rm, Uh = Mm, Wh = Om, Gh = Lm, Kh = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...Fh,
		...i.platform,
		_c: r
	};
	return Dm(e, t, {
		...i,
		platform: a
	});
};
// node_modules/@floating-ui/vue/dist/floating-ui.vue.mjs
function qh(e) {
	return typeof e == "object" && !!e && "$el" in e;
}
function Jh(e) {
	if (qh(e)) {
		let t = e.$el;
		return Um(t) && Bm(t) === "#comment" ? null : t;
	}
	return e;
}
function Yh(e) {
	return {
		name: "arrow",
		options: e,
		fn(t) {
			let n = Jh(z(e.element));
			return n == null ? {} : Wh({
				element: n,
				padding: e.padding
			}).fn(t);
		}
	};
}
function Xh(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Zh(e, t) {
	let n = Xh(e);
	return Math.round(t * n) / n;
}
function Qh(e, t, n) {
	n === void 0 && (n = {});
	let r = n.whileElementsMounted, i = $(() => z(n.open) ?? !0), a = $(() => z(n.middleware)), o = $(() => z(n.placement) ?? "bottom"), s = $(() => z(n.strategy) ?? "absolute"), c = $(() => z(n.transform) ?? !0), l = $(() => Jh(e.value)), u = $(() => Jh(t.value)), d = /* @__PURE__ */ L(0), f = /* @__PURE__ */ L(0), p = /* @__PURE__ */ L(s.value), m = /* @__PURE__ */ L(o.value), h = /* @__PURE__ */ gn({}), g = /* @__PURE__ */ L(!1), _ = $(() => {
		let e = {
			position: p.value,
			left: "0",
			top: "0"
		};
		if (!u.value) return e;
		let t = Zh(u.value, d.value), n = Zh(u.value, f.value);
		return c.value ? {
			...e,
			transform: "translate(" + t + "px, " + n + "px)",
			...Xh(u.value) >= 1.5 && { willChange: "transform" }
		} : {
			position: p.value,
			left: t + "px",
			top: n + "px"
		};
	}), v;
	function y() {
		if (l.value == null || u.value == null) return;
		let e = i.value;
		Kh(l.value, u.value, {
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
	return V([
		a,
		o,
		s,
		i
	], y, { flush: "sync" }), V([l, u], x, { flush: "sync" }), V(i, S, { flush: "sync" }), Ve() && He(b), {
		x: /* @__PURE__ */ sn(d),
		y: /* @__PURE__ */ sn(f),
		strategy: /* @__PURE__ */ sn(p),
		placement: /* @__PURE__ */ sn(m),
		middlewareData: /* @__PURE__ */ sn(h),
		isPositioned: /* @__PURE__ */ sn(g),
		floatingStyles: _,
		update: y
	};
}
// node_modules/reka-ui/dist/Popper/PopperContent.js
var $h = ["dir"], eg = {
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
}, [tg, ng] = /*#__PURE__*/ Bd("PopperContent"), rg = /* @__PURE__ */ H({
	inheritAttrs: !1,
	__name: "PopperContent",
	props: /* @__PURE__ */ Ba({
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
	}, { ...eg }),
	emits: ["placed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = Up(), { forwardRef: a, currentElement: o } = zf(), s = Nf($(() => n.dir)), c = /* @__PURE__ */ L(), l = /* @__PURE__ */ L(), { width: u, height: d } = ep(l), f = $(() => n.side + (n.align === "center" ? "" : `-${n.align}`)), p = $(() => typeof n.collisionPadding == "number" ? n.collisionPadding : {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			...n.collisionPadding
		}), m = $(() => Array.isArray(n.collisionBoundary) ? n.collisionBoundary : [n.collisionBoundary]), h = $(() => ({
			padding: p.value,
			boundary: m.value.filter(qp),
			altBoundary: m.value.length > 0
		})), g = $(() => ({
			mainAxis: n.sideFlip,
			crossAxis: n.alignFlip
		})), _ = $(() => [
			zh({
				mainAxis: n.sideOffset + d.value,
				alignmentAxis: n.alignOffset
			}),
			n.prioritizePosition && n.avoidCollisions && Vh({
				...h.value,
				...g.value
			}),
			n.avoidCollisions && Bh({
				mainAxis: !0,
				crossAxis: !!n.prioritizePosition,
				limiter: n.sticky === "partial" ? Gh() : void 0,
				...h.value
			}),
			!n.prioritizePosition && n.avoidCollisions && Vh({
				...h.value,
				...g.value
			}),
			Hh({
				...h.value,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--reka-popper-available-width", `${n}px`), o.setProperty("--reka-popper-available-height", `${r}px`), o.setProperty("--reka-popper-anchor-width", `${i}px`), o.setProperty("--reka-popper-anchor-height", `${a}px`);
				}
			}),
			l.value && Yh({
				element: l.value,
				padding: n.arrowPadding
			}),
			Jp({
				arrowWidth: u.value,
				arrowHeight: d.value,
				dir: s.value
			}),
			n.hideWhenDetached && Uh({
				strategy: "referenceHidden",
				...h.value
			})
		]), { floatingStyles: v, placement: y, isPositioned: b, middlewareData: x, update: S } = Qh($(() => n.reference ?? i.anchor.value), c, {
			strategy: n.positionStrategy,
			placement: f,
			whileElementsMounted: (...e) => Rh(...e, {
				layoutShift: !n.disableUpdateOnLayoutShift,
				animationFrame: n.updatePositionStrategy === "always"
			}),
			middleware: _
		}), C = $(() => Yp(y.value)[0]), w = $(() => Yp(y.value)[1]);
		jr(() => {
			b.value && r("placed");
		});
		let T = $(() => {
			let e = x.value.arrow?.centerOffset !== 0;
			return n.hideShiftedArrow && e;
		}), E = /* @__PURE__ */ L("");
		return Ar(() => {
			o.value && (E.value = window.getComputedStyle(o.value).zIndex);
		}), ng({
			placedSide: C,
			onArrowChange: (e) => l.value = e,
			arrowX: $(() => x.value.arrow?.x ?? 0),
			arrowY: $(() => x.value.arrow?.y ?? 0),
			shouldHideArrow: T
		}), (e, t) => (q(), J("div", {
			ref_key: "floatingRef",
			ref: c,
			"data-reka-popper-content-wrapper": "",
			dir: R(s),
			style: ye({
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
		}, [n.memoDependencies ? cc([
			n.asChild,
			n.as,
			C.value,
			w.value,
			R(b),
			...Object.values(e.$attrs),
			...n.memoDependencies
		], () => (q(), Y(R(up), Ps({
			key: 0,
			ref: R(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			style: { animation: R(b) ? void 0 : "none" }
		}), {
			default: B(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"style"
		])), t, 0) : (q(), Y(R(up), Ps({
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
			default: B(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"dir",
			"style"
		]))], 12, $h));
	}
});
// node_modules/reka-ui/dist/shared/useNonce.js
function ig(e) {
	let t = yf({ nonce: /* @__PURE__ */ L() });
	return $(() => e?.value || t.nonce?.value);
}
// node_modules/reka-ui/dist/Field/FieldRoot.js
var [ag, og] = /*#__PURE__*/ Bd("FieldRoot"), sg = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], cg = [" ", "Enter"];
function lg(e, t, n) {
	return e === void 0 ? !1 : Array.isArray(e) ? e.some((e) => ug(e, t, n)) : ug(e, t, n);
}
function ug(e, t, n) {
	return e === void 0 || t === void 0 ? !1 : typeof e == "string" ? e === t : typeof n == "function" ? n(e, t) : typeof n == "string" ? e?.[n] === t?.[n] : Rd(e, t);
}
function dg(e) {
	return e == null || e === "" || Array.isArray(e) && e.length === 0;
}
// node_modules/reka-ui/dist/Select/SelectRoot.js
var fg = ["value"], [pg, mg] = /*#__PURE__*/ Bd("SelectRoot"), hg = /* @__PURE__ */ H({
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
		let n = e, r = t, { multiple: i, dir: a } = /* @__PURE__ */ wn(n), o = ag(null), s = $(() => n.name ?? o?.name.value), c = $(() => o ? n.required || o.required.value : n.required), l = $(() => !!(n.disabled || o?.disabled.value)), u = _f(n, "modelValue", r, {
			defaultValue: n.defaultValue ?? (i.value ? [] : void 0),
			passive: n.modelValue === void 0,
			deep: !0
		}), d = _f(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), f = /* @__PURE__ */ L(), p = /* @__PURE__ */ L(), m = /* @__PURE__ */ L({
			x: 0,
			y: 0
		}), h = $(() => i.value && Array.isArray(u.value) ? u.value?.length === 0 : Ud(u.value));
		V(u, () => {
			o?.reportControlState({ filled: !h.value });
		}), Vp({ isProvider: !0 });
		let g = Nf(a), _ = Rf(f), v = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), y = $(() => Array.from(v.value).map((e) => e.value).join(";"));
		function b(e) {
			let t;
			if (i.value) {
				let r = Array.isArray(u.value) ? [...u.value] : [], i = r.findIndex((t) => ug(t, e, n.by));
				i === -1 ? r.push(e) : r.splice(i, 1), t = [...r];
			} else t = e;
			u.value = t, o?.handleControlInput({ value: t });
		}
		function x(e) {
			return Array.from(v.value).find((t) => lg(e, t.value, n.by));
		}
		return mg({
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
		}), (t, n) => (q(), Y(R(Gp), null, {
			default: B(() => [U(t.$slots, "default", {
				modelValue: R(u),
				open: R(d)
			}), R(_) && s.value ? (q(), Y(gg, {
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
				default: B(() => [R(Ud)(R(u)) ? (q(), J("option", {
					key: 0,
					value: e.nullableValue
				}, null, 8, fg)) : As("v-if", !0), (q(!0), J(G, null, ba(Array.from(v.value), (e) => (q(), J("option", Ps({ key: e.value ?? "" }, { ref_for: !0 }, e), null, 16))), 128))]),
				_: 1
			}, 8, [
				"multiple",
				"required",
				"name",
				"autocomplete",
				"disabled",
				"value"
			])) : As("v-if", !0)]),
			_: 3
		}));
	}
}), gg = /* @__PURE__ */ H({
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
		let t = e, n = /* @__PURE__ */ L(), r = pg();
		V(() => t.value, (e, t) => {
			let r = window.HTMLSelectElement.prototype, i = Object.getOwnPropertyDescriptor(r, "value").set;
			if (e !== t && i && n.value) {
				let t = new Event("change", { bubbles: !0 });
				i.call(n.value, e), n.value.dispatchEvent(t);
			}
		});
		function i(e) {
			r.onValueChange(e.target.value);
		}
		return (e, r) => (q(), Y(R(Hp), { "as-child": "" }, {
			default: B(() => [X("select", Ps({
				ref_key: "selectElement",
				ref: n
			}, t, { onInput: i }), [U(e.$slots, "default")], 16)]),
			_: 3
		}));
	}
}), _g = /* @__PURE__ */ H({
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
		let t = Bf(e);
		return (e, n) => (q(), Y(R(rg), Ps(R(t), { style: {
			boxSizing: "border-box",
			"--reka-select-content-transform-origin": "var(--reka-popper-transform-origin)",
			"--reka-select-content-available-width": "var(--reka-popper-available-width)",
			"--reka-select-content-available-height": "var(--reka-popper-available-height)",
			"--reka-select-trigger-width": "var(--reka-popper-anchor-width)",
			"--reka-select-trigger-height": "var(--reka-popper-anchor-height)"
		} }), {
			default: B(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), vg = {
	onViewportChange: () => {},
	itemTextRefCallback: () => {},
	itemRefCallback: () => {}
}, [yg, bg] = /*#__PURE__*/ Bd("SelectContent"), xg = /* @__PURE__ */ H({
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
		let n = e, r = t, i = pg();
		If(), Af(n.bodyLock);
		let { CollectionSlot: a, getItems: o } = Vp(), s = /* @__PURE__ */ L();
		Zf(s);
		let { search: c, handleTypeaheadSearch: l } = np(), u = /* @__PURE__ */ L(), d = /* @__PURE__ */ L(), f = /* @__PURE__ */ L(), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ L(!1), h = /* @__PURE__ */ L(!1);
		function g() {
			d.value && s.value && Rp([d.value, s.value]);
		}
		V(p, () => {
			g();
		});
		let { onOpenChange: _, triggerPointerDownPosRef: v } = i;
		Ar((e) => {
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
					t = n.loop ? rp(t, i + 1) : t.slice(i + 1);
				}
				setTimeout(() => Rp(t)), e.preventDefault();
			}
		}
		let b = rf(n, "loop"), x = Bf($(() => n.position === "popper" ? b : {}).value);
		return bg({
			content: s,
			viewport: u,
			onViewportChange: (e) => {
				u.value = e;
			},
			itemRefCallback: (e, t, n) => {
				let r = !m.value && !n, a = lg(i.modelValue.value, t, i.by);
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
				(lg(i.modelValue.value, t, i.by) || r) && (f.value = e);
			},
			focusSelectedItem: g,
			position: n.position,
			isPositioned: p,
			searchRef: c
		}), (t, n) => (q(), Y(R(a), null, {
			default: B(() => [Z(R(Pp), {
				"as-child": "",
				onMountAutoFocus: n[6] ||= gu(() => {}, ["prevent"]),
				onUnmountAutoFocus: n[7] ||= (e) => {
					r("closeAutoFocus", e), !e.defaultPrevented && (R(i).triggerElement.value?.focus({ preventScroll: !0 }), e.preventDefault());
				}
			}, {
				default: B(() => [Z(R(yp), {
					"as-child": "",
					"disable-outside-pointer-events": e.disableOutsidePointerEvents,
					onFocusOutside: n[2] ||= gu(() => {}, ["prevent"]),
					onDismiss: n[3] ||= (e) => R(i).onOpenChange(!1),
					onEscapeKeyDown: n[4] ||= (e) => r("escapeKeyDown", e),
					onPointerDownOutside: n[5] ||= (e) => r("pointerDownOutside", e)
				}, {
					default: B(() => [(q(), Y(ga(e.position === "popper" ? _g : wg), Ps({
						...t.$attrs,
						...R(x)
					}, {
						id: R(i).contentId,
						ref: (e) => {
							if (!e) return;
							let t = R(lf)(e);
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
						onContextmenu: n[0] ||= gu(() => {}, ["prevent"]),
						onPlaced: n[1] ||= (e) => p.value = !0,
						onKeydown: y
					}), {
						default: B(() => [U(t.$slots, "default")]),
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
}), [Sg, Cg] = /*#__PURE__*/ Bd("SelectItemAlignedPosition"), wg = /* @__PURE__ */ H({
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
		let n = e, r = t, { getItems: i } = Vp(), a = pg(), o = yg(), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(!0), l = /* @__PURE__ */ L(), { forwardRef: u, currentElement: d } = zf(), { viewport: f, selectedItem: p, selectedItemText: m, focusSelectedItem: h } = o;
		function g() {
			if (a.triggerElement.value && a.valueElement.value && l.value && d.value && f?.value && p?.value && m?.value) {
				let e = a.triggerElement.value.getBoundingClientRect(), t = d.value.getBoundingClientRect(), n = a.valueElement.value.getBoundingClientRect(), o = m.value.getBoundingClientRect();
				if (a.dir.value !== "rtl") {
					let r = o.left - t.left, i = n.left - r, a = e.left - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = zd(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.left = `${d}px`;
				} else {
					let r = t.right - o.right, i = window.innerWidth - n.right - r, a = window.innerWidth - e.right - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = zd(i, 10, Math.max(10, u - c));
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
		let _ = /* @__PURE__ */ L("");
		ra(async () => {
			await rr(), g(), d.value && (_.value = window.getComputedStyle(d.value).zIndex);
		});
		function v(e) {
			e && c.value === !0 && (g(), h?.(), c.value = !1);
		}
		return gf(a.triggerElement, () => {
			g();
		}), Cg({
			contentWrapper: l,
			shouldExpandOnScrollRef: s,
			onScrollButtonChange: v
		}), (e, t) => (q(), J("div", {
			ref_key: "contentWrapperElement",
			ref: l,
			style: ye({
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: _.value
			})
		}, [Z(R(up), Ps({
			ref: R(u),
			style: {
				boxSizing: "border-box",
				maxHeight: "100%"
			}
		}, {
			...e.$attrs,
			...n
		}), {
			default: B(() => [U(e.$slots, "default")]),
			_: 3
		}, 16)], 4));
	}
}), Tg = /* @__PURE__ */ H({
	inheritAttrs: !1,
	__name: "SelectProvider",
	props: { context: {
		type: Object,
		required: !0
	} },
	setup(e) {
		return mg(e.context), bg(vg), (e, t) => U(e.$slots, "default");
	}
}), Eg = { key: 1 }, Dg = /* @__PURE__ */ H({
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
		let n = e, r = Vf(n, t), i = pg(), a = /* @__PURE__ */ L();
		ra(() => {
			a.value = new DocumentFragment();
		});
		let o = /* @__PURE__ */ L(), s = $(() => n.forceMount || i.open.value), c = /* @__PURE__ */ L(s.value), l;
		function u() {
			l &&= (clearTimeout(l), void 0);
		}
		return V(s, (e, t, n) => {
			u(), l = setTimeout(() => {
				c.value = s.value, l = void 0;
			}), n(u);
		}), sa(u), (e, t) => s.value || c.value || o.value?.present ? (q(), Y(R(sp), {
			key: 0,
			ref_key: "presenceRef",
			ref: o,
			present: s.value
		}, {
			default: B(() => [Z(xg, Te(Es({
				...R(r),
				...e.$attrs
			})), {
				default: B(() => [U(e.$slots, "default")]),
				_: 3
			}, 16)]),
			_: 3
		}, 8, ["present"])) : a.value ? (q(), J("div", Eg, [(q(), Y(qr, { to: a.value }, [Z(Tg, { context: R(i) }, {
			default: B(() => [U(e.$slots, "default")]),
			_: 3
		}, 8, ["context"])], 8, ["to"]))])) : As("v-if", !0);
	}
}), [Og, kg] = /*#__PURE__*/ Bd("SelectItem"), Ag = /* @__PURE__ */ H({
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
		let n = e, r = t, { disabled: i } = /* @__PURE__ */ wn(n), a = pg(), o = yg(), { forwardRef: s, currentElement: c } = zf(), { CollectionItem: l } = Vp(), u = $(() => lg(a.modelValue?.value, n.value, a.by)), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(n.textValue ?? ""), p = $f(void 0, "reka-select-item-text");
		async function m(e) {
			e.defaultPrevented || Hd("select.select", h, {
				originalEvent: e,
				value: n.value
			});
		}
		async function h(e) {
			await rr(), r("select", e), e.defaultPrevented || i.value || (a.onValueChange(n.value), a.multiple.value || a.onOpenChange(!1));
		}
		async function g(e) {
			await rr(), !e.defaultPrevented && (i.value ? o.onItemLeave?.() : e.currentTarget?.focus({ preventScroll: !0 }));
		}
		async function _(e) {
			await rr(), !e.defaultPrevented && e.currentTarget === Vd() && o.onItemLeave?.();
		}
		async function v(e) {
			await rr(), e.defaultPrevented || o.searchRef?.value !== "" && e.key === " " || (cg.includes(e.key) && m(e), e.key === " " && e.preventDefault());
		}
		if (n.value === "") throw Error("A <SelectItem /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
		return ra(() => {
			c.value && o.itemRefCallback(c.value, n.value, n.disabled);
		}), kg({
			value: n.value,
			disabled: i,
			textId: p,
			isSelected: u,
			onItemTextChange: (e) => {
				f.value = ((f.value || e?.textContent) ?? "").trim();
			}
		}), (t, n) => (q(), Y(R(l), { value: { textValue: f.value } }, {
			default: B(() => [Z(R(up), {
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
				onTouchend: n[3] ||= gu(() => {}, ["prevent", "stop"]),
				onPointermove: g,
				onPointerleave: _,
				onKeydown: v
			}, {
				default: B(() => [U(t.$slots, "default", { selected: u.value })]),
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
}), jg = /* @__PURE__ */ H({
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
		let t = e, n = pg(), r = yg(), i = Og(), { forwardRef: a, currentElement: o } = zf(), s = $(() => ({
			value: i.value,
			disabled: i.disabled.value,
			textContent: o.value?.textContent ?? i.value?.toString() ?? ""
		}));
		return ra(() => {
			o.value && (i.onItemTextChange(o.value), r.itemTextRefCallback(o.value, i.value, i.disabled.value), n.onOptionAdd(s.value));
		}), sa(() => {
			n.onOptionRemove(s.value);
		}), (e, n) => (q(), Y(R(up), Ps({
			id: R(i).textId,
			ref: R(a)
		}, {
			...t,
			...e.$attrs
		}), {
			default: B(() => [U(e.$slots, "default")]),
			_: 3
		}, 16, ["id"]));
	}
}), Mg = /* @__PURE__ */ H({
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
		return (e, n) => (q(), Y(R(zp), Te(Es(t)), {
			default: B(() => [U(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), Ng = /* @__PURE__ */ H({
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
		let t = e, n = pg(), { forwardRef: r, currentElement: i } = zf(), a = $(() => n.disabled?.value || t.disabled);
		n.contentId ||= $f(void 0, "reka-select-content"), ra(() => {
			n.onTriggerChange(i.value);
		});
		let o = ag(null), s = La();
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
		ra(() => {
			f = o?.registerControl({
				id: c,
				element: () => i.value,
				getValue: () => n.modelValue.value,
				required: () => !!n.required?.value
			});
		}), oa(() => f?.());
		let { getItems: p } = Vp(), { search: m, handleTypeaheadSearch: h, resetTypeahead: g } = np();
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
			!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && h(e.key, p()), !(t && e.key === " ") && sg.includes(e.key) && (_(), e.preventDefault());
		}
		return (t, i) => (q(), Y(R(Kp), {
			"as-child": "",
			reference: e.reference
		}, {
			default: B(() => [Z(R(up), Ps(l(), {
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
				"data-placeholder": R(dg)(R(n).modelValue?.value) ? "" : void 0,
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
				default: B(() => [U(t.$slots, "default")]),
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
}), Pg = /* @__PURE__ */ H({
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
		let t = e, { forwardRef: n, currentElement: r } = zf(), i = pg();
		ra(() => {
			i.valueElement = r;
		});
		let a = $(() => {
			let e = [], t = Array.from(i.optionsSet.value), n = (e) => t.find((t) => lg(e, t.value, i.by));
			return e = Array.isArray(i.modelValue.value) ? i.modelValue.value.map((e) => n(e)?.textContent ?? "") : [n(i.modelValue.value)?.textContent ?? ""], e.filter(Boolean);
		}), o = $(() => a.value.length ? a.value.join(", ") : t.placeholder);
		return (r, s) => (q(), Y(R(up), {
			ref: R(n),
			as: e.as,
			"as-child": e.asChild,
			style: { pointerEvents: "none" },
			"data-placeholder": a.value.length ? void 0 : t.placeholder
		}, {
			default: B(() => [U(r.$slots, "default", {
				selectedLabel: a.value,
				modelValue: R(i).modelValue.value
			}, () => [Os(Fe(o.value), 1)])]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"data-placeholder"
		]));
	}
}), Fg = /* @__PURE__ */ H({
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
		let t = e, { nonce: n } = /* @__PURE__ */ wn(t), r = ig(n), i = yg(), a = i.position === "item-aligned" ? Sg() : void 0, { forwardRef: o, currentElement: s } = zf();
		ra(() => {
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
		return (e, n) => (q(), J(G, null, [Z(R(up), Ps({
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
			default: B(() => [U(e.$slots, "default")]),
			_: 3
		}, 16), Z(R(up), {
			as: "style",
			nonce: R(r)
		}, {
			default: B(() => [...n[0] ||= [Os(" /* Hide scrollbars cross-browser and enable momentum scroll for touch devices */ [data-reka-select-viewport] { scrollbar-width:none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; } [data-reka-select-viewport]::-webkit-scrollbar { display: none; } ", -1)]]),
			_: 1
		}, 8, ["nonce"])], 64));
	}
}), Ig = /* @__PURE__ */ H({
	__name: "SelectField",
	props: /*@__PURE__*/ Va({
		options: {},
		placeholder: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = lo(e, "modelValue"), n = Er("portalTarget", void 0);
		return (r, i) => (q(), Y(R(hg), {
			modelValue: t.value,
			"onUpdate:modelValue": i[0] ||= (e) => t.value = e
		}, {
			default: B(() => [Z(R(Ng), {
				class: "trpg-select-trigger",
				"aria-label": e.label
			}, {
				default: B(() => [Z(R(Pg), { placeholder: e.placeholder ?? "请选择" }, null, 8, ["placeholder"]), i[1] ||= X("span", { "aria-hidden": "true" }, "▾", -1)]),
				_: 1
			}, 8, ["aria-label"]), Z(R(Mg), { to: R(n) }, {
				default: B(() => [Z(R(Dg), {
					class: "trpg-select-content",
					position: "popper",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: B(() => [Z(R(Fg), { class: "trpg-select-viewport" }, {
						default: B(() => [(q(!0), J(G, null, ba(e.options, (e) => (q(), Y(R(Ag), {
							key: e,
							value: e,
							class: "trpg-select-item"
						}, {
							default: B(() => [Z(R(jg), null, {
								default: B(() => [Os(Fe(e), 1)]),
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
}), Lg = ["aria-label"], Rg = ["aria-pressed", "onClick"], zg = /* @__PURE__ */ H({
	__name: "Segmented",
	props: /*@__PURE__*/ Va({
		options: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = lo(e, "modelValue");
		return (n, r) => (q(), J("div", {
			class: "trpg-seg",
			role: "group",
			"aria-label": e.label
		}, [(q(!0), J(G, null, ba(e.options, (e) => (q(), J("button", {
			key: e.value,
			type: "button",
			"aria-pressed": t.value === e.value,
			onClick: (n) => t.value = e.value
		}, Fe(e.label), 9, Rg))), 128))], 8, Lg));
	}
}), Bg = { class: "probe" }, Vg = { class: "lab" }, Hg = { class: "lab__row" }, Ug = {
	class: "probe__hint",
	"data-testid": "select-model"
}, Wg = { class: "lab__row" }, Gg = { class: "trpg-check" }, Kg = { class: "probe__head" }, qg = { class: "probe__title" }, Jg = ["data-status"], Yg = { class: "probe__hint" }, Xg = { class: "probe__actions" }, Zg = ["onClick"], Qg = ["onClick"], $g = /* @__PURE__ */ H({
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
		], n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L("a"), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L("");
		function s(e, t, n) {
			Fu(e, t, n, n === "pass" ? "人工确认：通过" : "人工确认：不通过");
		}
		return (e, c) => (q(), J("section", Bg, [
			c[6] ||= X("h3", { class: "probe__title" }, "界面实测（需要你目测后点结果）", -1),
			X("div", Vg, [X("div", Hg, [
				Z(Ig, {
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
				X("p", Ug, "下拉当前值：" + Fe(n.value || "未选") + " / " + Fe(r.value || "未选"), 1),
				Z(Ig, {
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
			]), X("div", Wg, [
				Z(zg, {
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
				X("label", Gg, [Cr(X("input", {
					"onUpdate:modelValue": c[3] ||= (e) => a.value = e,
					type: "checkbox"
				}, null, 512), [[nu, a.value]]), c[5] ||= Os(" 勾选框测试", -1)]),
				Cr(X("input", {
					"onUpdate:modelValue": c[4] ||= (e) => o.value = e,
					class: "trpg-input",
					type: "text",
					placeholder: "输入测试：中文 / English"
				}, null, 512), [[tu, o.value]])
			])]),
			(q(), J(G, null, ba(t, (e) => X("div", {
				key: e.id,
				class: "probe"
			}, [
				X("div", Kg, [X("h4", qg, Fe(e.title), 1), X("span", {
					class: "trpg-badge",
					"data-status": R(Pu)[e.id]?.status ?? "idle"
				}, Fe(R(Pu)[e.id]?.status ?? "待测"), 9, Jg)]),
				X("p", Yg, Fe(e.how), 1),
				X("div", Xg, [X("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => s(e.id, e.title, "pass")
				}, "通过", 8, Zg), X("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => s(e.id, e.title, "fail")
				}, "不通过", 8, Qg)])
			])), 64))
		]));
	}
}), e_ = { class: "probe__head" }, t_ = { class: "probe__title" }, n_ = ["data-status"], r_ = { class: "probe__hint" }, i_ = {
	key: 0,
	class: "probe__summary"
}, a_ = { class: "probe__actions" }, o_ = ["onClick"], s_ = { key: 1 }, c_ = { class: "report-bar" }, l_ = { role: "status" }, u_ = /* @__PURE__ */ H({
	__name: "ProbeList",
	props: { ctx: {} },
	setup(e) {
		let t = e.ctx, r = Md(t), i = /* @__PURE__ */ L("");
		async function a() {
			return JSON.stringify(Lu(await Vu(t)), null, 2);
		}
		async function o() {
			let e = await a();
			try {
				await navigator.clipboard.writeText(e), i.value = "已复制报告";
			} catch (e) {
				console.error("[trpg-assistant] 复制失败", e), i.value = "复制失败，已保存到扩展设置（见下一个按钮）";
			}
		}
		async function s() {
			let e = t.extensionSettings[n] ??= {};
			e.m0Report = JSON.parse(await a()), t.saveSettingsDebounced(), i.value = "已保存到扩展设置";
		}
		for (let e of r) e.start?.();
		return (e, t) => (q(), J("div", null, [
			(q(!0), J(G, null, ba(R(r), (e) => (q(), J("section", {
				key: e.id,
				class: "probe"
			}, [
				X("div", e_, [X("h3", t_, Fe(e.title), 1), X("span", {
					class: "trpg-badge",
					"data-status": R(Pu)[e.id]?.status ?? "idle"
				}, Fe(R(Pu)[e.id]?.status ?? "待测"), 9, n_)]),
				X("p", r_, Fe(e.hint), 1),
				R(Pu)[e.id] ? (q(), J("p", i_, Fe(R(Pu)[e.id].summary), 1)) : As("", !0),
				X("div", a_, [(q(!0), J(G, null, ba(e.actions, (e) => (q(), J("button", {
					key: e.label,
					class: "trpg-btn",
					type: "button",
					onClick: (t) => e.run()
				}, Fe(e.label), 9, o_))), 128))]),
				R(Pu)[e.id]?.detail === void 0 ? As("", !0) : (q(), J("details", s_, [t[2] ||= X("summary", null, "详情", -1), X("pre", null, Fe(JSON.stringify(R(Pu)[e.id].detail, null, 2)), 1)]))
			]))), 128)),
			Z($g),
			X("div", c_, [
				X("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: t[0] ||= (e) => o()
				}, "复制测试报告"),
				X("button", {
					class: "trpg-btn",
					type: "button",
					onClick: t[1] ||= (e) => s()
				}, "保存报告到扩展设置"),
				X("span", l_, Fe(i.value), 1)
			])
		]));
	}
});
// src/ui/shell/storage.ts
function d_(e, t) {
	try {
		let n = localStorage.getItem(e);
		if (!n) return t;
		let r = JSON.parse(n);
		return Number.isFinite(r.x) && Number.isFinite(r.y) ? r : t;
	} catch (e) {
		return console.warn("[trpg-assistant] 读取窗口位置失败", e), t;
	}
}
function f_(e, t) {
	try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/useDrag.ts
function p_(e, t, n) {
	return Math.min(Math.max(e, t), Math.max(t, n));
}
function m_(e) {
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
				x: p_(s.x + r, 0, window.innerWidth - l),
				y: p_(s.y + i, 0, window.innerHeight - u)
			};
		}, u = (t) => {
			i.removeEventListener("pointermove", l), i.removeEventListener("pointerup", u), i.removeEventListener("pointercancel", u), i.hasPointerCapture(t.pointerId) && i.releasePointerCapture(t.pointerId), c ? e.onEnd?.() : e.onTap?.();
		};
		i.addEventListener("pointermove", l), i.addEventListener("pointerup", u), i.addEventListener("pointercancel", u);
	}
	return { onPointerDown: n };
}
// src/ui/ProbeApp.vue?vue&type=script&setup=true&lang.ts
var h_ = { class: "trpg-root" }, g_ = { class: "trpg-window__body" }, __ = 48, v_ = /* @__PURE__ */ H({
	__name: "ProbeApp",
	props: {
		ctx: {},
		portalTarget: {}
	},
	setup(e) {
		Tr("portalTarget", e.portalTarget);
		let t = /* @__PURE__ */ L(!1), n = /* @__PURE__ */ L(d_("trpg-assistant:ball", {
			x: 16,
			y: Math.round(window.innerHeight / 2)
		})), r = /* @__PURE__ */ L(d_("trpg-assistant:win", {
			x: 16,
			y: 16
		})), i = /* @__PURE__ */ L(null), a = () => ({
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
			if (n.value = o(n.value, __, __), t.value) {
				let { w: e, h: t } = a();
				r.value = o(r.value, e, t);
			}
		}
		ra(() => window.addEventListener("resize", s)), oa(() => window.removeEventListener("resize", s)), V(t, (e) => {
			e && Promise.resolve().then(s);
		});
		let c = m_({
			position: n,
			size: () => ({
				w: __,
				h: __
			}),
			onTap: () => {
				t.value = !t.value;
			},
			onEnd: () => f_("trpg-assistant:ball", n.value)
		}), l = m_({
			position: r,
			size: a,
			onEnd: () => f_("trpg-assistant:win", r.value)
		}), u = $(() => ({
			left: `${n.value.x}px`,
			top: `${n.value.y}px`
		})), d = $(() => ({
			left: `${r.value.x}px`,
			top: `${r.value.y}px`
		}));
		return (n, r) => (q(), J("div", h_, [X("button", {
			class: "trpg-ball",
			type: "button",
			"aria-label": "打开或关闭 TRPG 跑团助手",
			style: ye(u.value),
			onPointerdown: r[0] ||= (...e) => R(c).onPointerDown && R(c).onPointerDown(...e)
		}, "⚄", 36), t.value ? (q(), J("section", {
			key: 0,
			ref_key: "winEl",
			ref: i,
			class: "trpg-window",
			style: ye(d.value),
			role: "dialog",
			"aria-label": "TRPG 跑团助手 M0 探针"
		}, [X("header", {
			class: "trpg-window__head",
			onPointerdown: r[2] ||= (...e) => R(l).onPointerDown && R(l).onPointerDown(...e)
		}, [r[3] ||= X("span", null, "TRPG 跑团助手 · M0 探针", -1), X("button", {
			class: "trpg-icon-btn",
			type: "button",
			"aria-label": "关闭",
			onClick: r[1] ||= (e) => t.value = !1
		}, "✕")], 32), X("div", g_, [Z(u_, { ctx: e.ctx }, null, 8, ["ctx"])])], 4)) : As("", !0)]));
	}
}), y_ = ".trpg-btn{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);min-height:36px;color:var(--ink);font:inherit;cursor:pointer;padding:4px 12px}.trpg-btn:hover{border-color:var(--primary)}.trpg-btn:focus-visible,.trpg-select-trigger:focus-visible,.trpg-input:focus-visible{outline:2px solid var(--primary);outline-offset:1px}.trpg-btn--primary{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-input{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);font:inherit;padding:4px 8px}.trpg-select-trigger{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);font:inherit;cursor:pointer;justify-content:space-between;align-items:center;gap:8px;padding:4px 10px;display:inline-flex}.trpg-select-content{min-width:var(--reka-select-trigger-width);max-height:min(8 * 36px, var(--reka-select-content-available-height));background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);z-index:100001;overflow:hidden;box-shadow:0 6px 18px #0000004d}.trpg-select-viewport{max-height:inherit;padding:4px;overflow-y:auto}.trpg-select-item{cursor:pointer;min-height:36px;color:var(--ink);border-radius:4px;align-items:center;padding:4px 8px;display:flex}.trpg-select-item[data-highlighted]{background:var(--panel);outline:none}.trpg-select-item[data-state=checked]{color:var(--primary);font-weight:600}.trpg-seg{border:1px solid var(--line);border-radius:var(--radius-sm);display:inline-flex;overflow:hidden}.trpg-seg button{background:var(--card);min-height:32px;color:var(--ink);font:inherit;cursor:pointer;border:0;padding:2px 12px}.trpg-seg button+button{border-left:1px solid var(--line)}.trpg-seg button[aria-pressed=true]{background:var(--primary);color:var(--primary-ink)}.trpg-badge{background:var(--panel);border:1px solid var(--line);color:var(--ink-2);border-radius:4px;padding:0 8px;font-size:12px;font-weight:600;display:inline-block}.trpg-badge[data-status=pass]{color:var(--ok);border-color:var(--ok)}.trpg-badge[data-status=fail],.trpg-badge[data-status=error]{color:var(--danger);border-color:var(--danger)}.trpg-badge[data-status=waiting]{color:var(--gold);border-color:var(--gold)}.trpg-check{cursor:pointer;align-items:center;gap:8px;min-height:36px;display:flex}.trpg-check input{width:18px;height:18px;accent-color:var(--primary)}", b_ = ".probe{border-bottom:1px solid var(--line);padding:10px 0}.probe__head{justify-content:space-between;align-items:center;gap:8px;display:flex}.probe__title{font-family:var(--font-serif);margin:0;font-size:15px}.probe__hint{color:var(--ink-2);margin:4px 0;font-size:12.5px}.probe__summary{margin:4px 0}.probe__actions{flex-wrap:wrap;gap:6px;margin-top:6px;display:flex}.probe pre{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);white-space:pre-wrap;word-break:break-all;max-height:200px;margin:6px 0 0;padding:8px;font-size:11.5px;overflow:auto}.probe summary{cursor:pointer;color:var(--ink-2);font-size:12.5px}.lab{background:var(--panel);border-radius:var(--radius);gap:10px;margin-top:8px;padding:10px;display:grid}.lab__row{gap:6px;display:grid}.report-bar{background:var(--paper);flex-wrap:wrap;gap:8px;padding:10px 0;display:flex;position:sticky;bottom:-12px}", x_ = ".trpg-root{z-index:100000;width:0;height:0;position:fixed;top:0;left:0}.trpg-ball{border:2px solid var(--gold);background:var(--primary);width:48px;height:48px;color:var(--primary-ink);cursor:grab;touch-action:none;border-radius:50%;font-size:22px;position:fixed;box-shadow:0 2px 8px #00000059}.trpg-window{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);flex-direction:column;width:min(92vw,440px);height:min(80vh,640px);display:flex;position:fixed;overflow:hidden;box-shadow:0 8px 28px #0006}.trpg-window__head{background:var(--primary);color:var(--primary-ink);font-family:var(--font-serif);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;justify-content:space-between;align-items:center;gap:8px;padding:8px 12px;font-size:16px;display:flex}.trpg-window__body{flex:1;padding:12px;overflow-y:auto}.trpg-icon-btn{border-radius:var(--radius-sm);min-width:32px;min-height:32px;color:inherit;cursor:pointer;background:0 0;border:1px solid #0000;font-size:16px}.trpg-icon-btn:hover{border-color:currentColor}", S_ = ":host{all:initial;pointer-events:inherit;--paper:#f4ecdd;--panel:#eee5d3;--card:#fffcf6;--line:#cbbca3;--ink:#2b211c;--ink-2:#6c6255;--primary:#7a2e26;--primary-ink:#fffcf6;--gold:#b8954a;--danger:#a3352b;--ok:#3f7a3a;--radius:8px;--radius-sm:6px;--font-serif:\"Songti SC\", \"Noto Serif SC\", Georgia, serif;--font-sans:\"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;font-family:var(--font-sans);color:var(--ink);font-size:14px;line-height:1.5}@media (prefers-color-scheme:dark){:host{--paper:#20231f;--panel:#2b3029;--card:#181c18;--line:#515849;--ink:#f1ebdc;--ink-2:#bcbbaa;--primary:#e6bf73;--primary-ink:#20231f;--gold:#e6bf73;--danger:#e07a6e;--ok:#8cc47f}}*,:before,:after{box-sizing:border-box}", C_ = "trpg-assistant-root";
function w_(e) {
	if (document.getElementById(C_)) return;
	let t = document.createElement("div");
	t.id = C_;
	let n = t.attachShadow({ mode: "open" }), r = document.createElement("style");
	r.textContent = [
		S_,
		x_,
		y_,
		b_
	].join("\n");
	let i = document.createElement("div");
	i.className = "trpg-portal";
	let a = document.createElement("div");
	n.append(r, a, i), document.body.appendChild(t), Eu(v_, {
		ctx: e,
		portalTarget: i
	}).mount(a);
}
// src/main.ts
async function T_() {
	window.__trpgAssistantBooted || (window.__trpgAssistantBooted = !0, await a(), w_(r()));
}
T_().catch((e) => {
	window.__trpgAssistantBooted = !1, console.error("[trpg-assistant] 启动失败", e);
});
