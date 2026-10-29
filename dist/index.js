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
}, E = Object.prototype.hasOwnProperty, D = (e, t) => E.call(e, t), O = Array.isArray, te = (e) => ue(e) === "[object Map]", ne = (e) => ue(e) === "[object Set]", re = (e) => ue(e) === "[object Date]", ie = (e) => ue(e) === "[object RegExp]", k = (e) => typeof e == "function", ae = (e) => typeof e == "string", oe = (e) => typeof e == "symbol", se = (e) => typeof e == "object" && !!e, ce = (e) => (se(e) || k(e)) && k(e.then) && k(e.catch), le = Object.prototype.toString, ue = (e) => le.call(e), de = (e) => ue(e).slice(8, -1), fe = (e) => ue(e) === "[object Object]", pe = (e) => ae(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, me = /* @__PURE__ */ v(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), he = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, ge = /-\w/g, _e = he((e) => e.replace(ge, (e) => e.slice(1).toUpperCase())), ve = /\B([A-Z])/g, ye = he((e) => e.replace(ve, "-$1").toLowerCase()), be = he((e) => e.charAt(0).toUpperCase() + e.slice(1)), xe = he((e) => e ? `on${be(e)}` : ""), Se = (e, t) => !Object.is(e, t), A = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, Ce = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, we = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, Te = (e) => {
	let t = ae(e) ? Number(e) : NaN;
	return isNaN(t) ? e : t;
}, Ee, De = () => Ee ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {}, Oe = /* @__PURE__ */ v("Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol");
function ke(e) {
	if (O(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = ae(r) ? Ne(r) : ke(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (ae(e) || se(e)) return e;
}
var Ae = /;(?![^(]*\))/g, je = /:([^]+)/, Me = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function Ne(e) {
	let t = {};
	return e.replace(Me, (e) => e.startsWith("/*") ? "" : e).split(Ae).forEach((e) => {
		if (e) {
			let n = e.split(je);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function Pe(e) {
	let t = "";
	if (ae(e)) t = e;
	else if (O(e)) for (let n = 0; n < e.length; n++) {
		let r = Pe(e[n]);
		r && (t += r + " ");
	}
	else if (se(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
function Fe(e) {
	if (!e) return null;
	let { class: t, style: n } = e;
	return t && !ae(t) && (e.class = Pe(t)), n && (e.style = ke(n)), e;
}
var Ie = /* @__PURE__ */ v("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function Le(e) {
	return !!e || e === "";
}
function Re(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = He(e[i], t[i], n);
	return r;
}
function ze(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && He(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function Be(e, t, n) {
	let r = te(e), i = te(t);
	if (r || i || (r = ne(e), i = ne(t), r || i)) return r && i ? ze(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !He(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function Ve(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function He(e, t, n) {
	if (e === t) return !0;
	let r = re(e), i = re(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = oe(e), i = oe(t), r || i ? e === t : (r = O(e), i = O(t), r || i ? r && i ? Ve(e, t, n, Re) : !1 : (r = se(e), i = se(t), r || i ? !r || !i ? !1 : Ve(e, t, n, Be) : String(e) === String(t))));
}
function Ue(e, t) {
	return e.findIndex((e) => He(e, t));
}
var We = (e) => !!(e && e.__v_isRef === !0), j = (e) => ae(e) ? e : e == null ? "" : O(e) || se(e) && (e.toString === le || !k(e.toString)) ? We(e) ? j(e.value) : JSON.stringify(e, Ge, 2) : String(e), Ge = (e, t) => We(t) ? Ge(e, t.value) : te(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[Ke(t, r) + " =>"] = n, e), {}) } : ne(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => Ke(e)) } : oe(t) ? Ke(t) : se(t) && !O(t) && !fe(t) ? String(t) : t, Ke = (e, t = "") => oe(e) ? `Symbol(${e.description ?? t})` : e;
function qe(e) {
	return e == null ? "initial" : typeof e == "string" ? e === "" ? " " : e : String(e);
}
// node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var Je, Ye = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && Je && (Je.active ? (this.parent = Je, this.index = (Je.scopes || (Je.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = Je;
			try {
				return Je = this, e();
			} finally {
				Je = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = Je, Je = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (Je === this) Je = this.prevScope;
			else {
				let e = Je;
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
function Xe(e) {
	return new Ye(e);
}
function Ze() {
	return Je;
}
function Qe(e, t = !1) {
	Je && Je.cleanups.push(e);
}
var M, $e = /* @__PURE__ */ new WeakSet(), et = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Je && (Je.active ? Je.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, $e.has(this) && ($e.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || rt(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, vt(this), ot(this);
		let e = M, t = mt;
		M = this, mt = !0;
		try {
			return this.fn();
		} finally {
			st(this), M = e, mt = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) ut(e);
			this.deps = this.depsTail = void 0, vt(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? $e.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		ct(this) && this.run();
	}
	get dirty() {
		return ct(this);
	}
}, tt = 0, N, nt;
function rt(e, t = !1) {
	e.flags |= 8, t ? (e.next = nt, nt = e) : (e.next = N, N = e);
}
function it() {
	tt++;
}
function at() {
	if (--tt > 0) return;
	if (nt) {
		let e = nt;
		for (nt = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; N;) {
		let t = N;
		for (N = void 0; t;) {
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
function ot(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function st(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), ut(r), dt(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function ct(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (lt(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function lt(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === yt) || (e.globalVersion = yt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !ct(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = M, r = mt;
	M = e, mt = !0;
	try {
		ot(e);
		let n = e.fn(e._value);
		(t.version === 0 || Se(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		M = n, mt = r, st(e), e.flags &= -3;
	}
}
function ut(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) ut(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function dt(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
function ft(e, t) {
	e.effect instanceof et && (e = e.effect.fn);
	let n = new et(e);
	t && T(n, t);
	try {
		n.run();
	} catch (e) {
		throw n.stop(), e;
	}
	let r = n.run.bind(n);
	return r.effect = n, r;
}
function pt(e) {
	e.effect.stop();
}
var mt = !0, ht = [];
function gt() {
	ht.push(mt), mt = !1;
}
function _t() {
	let e = ht.pop();
	mt = e === void 0 || e;
}
function vt(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = M;
		M = void 0;
		try {
			t();
		} finally {
			M = e;
		}
	}
}
var yt = 0, bt = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, xt = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!M || !mt || M === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== M) t = this.activeLink = new bt(M, this), M.deps ? (t.prevDep = M.depsTail, M.depsTail.nextDep = t, M.depsTail = t) : M.deps = M.depsTail = t, St(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = M.depsTail, t.nextDep = void 0, M.depsTail.nextDep = t, M.depsTail = t, M.deps === t && (M.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, yt++, this.notify(e);
	}
	notify(e) {
		it();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			at();
		}
	}
};
function St(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) St(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var Ct = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ Symbol(""), Tt = /* @__PURE__ */ Symbol(""), Et = /* @__PURE__ */ Symbol("");
function Dt(e, t, n) {
	if (mt && M) {
		let t = Ct.get(e);
		t || Ct.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new xt()), r.map = t, r.key = n), r.track();
	}
}
function Ot(e, t, n, r, i, a) {
	let o = Ct.get(e);
	if (!o) {
		yt++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (it(), t === "clear") o.forEach(s);
	else {
		let i = O(e), a = i && pe(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === Et || !oe(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(Et)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(wt)), te(e) && s(o.get(Tt)));
				break;
			case "delete":
				i || (s(o.get(wt)), te(e) && s(o.get(Tt)));
				break;
			case "set": te(e) && s(o.get(wt));
		}
	}
	at();
}
function kt(e, t) {
	let n = Ct.get(e);
	return n && n.get(t);
}
function At(e) {
	let t = /* @__PURE__ */ Sn(e);
	return t === e || (Dt(t, "iterate", Et), /* @__PURE__ */ bn(e)) ? t : /* @__PURE__ */ yn(e) ? /* @__PURE__ */ vn(e) ? t.map((e) => Tn(wn(e))) : t.map(Tn) : t.map(wn);
}
function jt(e) {
	return Dt(e = /* @__PURE__ */ Sn(e), "iterate", Et), e;
}
function Mt(e, t) {
	return /* @__PURE__ */ yn(e) ? Tn(/* @__PURE__ */ vn(e) ? wn(t) : t) : wn(t);
}
var Nt = {
	__proto__: null,
	[Symbol.iterator]() {
		return Pt(this, Symbol.iterator, (e) => Mt(this, e));
	},
	concat(...e) {
		return At(this).concat(...e.map((e) => O(e) ? At(e) : e));
	},
	entries() {
		return Pt(this, "entries", (e) => (e[1] = Mt(this, e[1]), e));
	},
	every(e, t) {
		return Lt(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return Lt(this, "filter", e, t, (e) => e.map((e) => Mt(this, e)), arguments);
	},
	find(e, t) {
		return Lt(this, "find", e, t, (e) => Mt(this, e), arguments);
	},
	findIndex(e, t) {
		return Lt(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return Lt(this, "findLast", e, t, (e) => Mt(this, e), arguments);
	},
	findLastIndex(e, t) {
		return Lt(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return Lt(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return zt(this, "includes", e);
	},
	indexOf(...e) {
		return zt(this, "indexOf", e);
	},
	join(e) {
		return At(this).join(e);
	},
	lastIndexOf(...e) {
		return zt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return Lt(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return Bt(this, "pop");
	},
	push(...e) {
		return Bt(this, "push", e);
	},
	reduce(e, ...t) {
		return Rt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return Rt(this, "reduceRight", e, t);
	},
	shift() {
		return Bt(this, "shift");
	},
	some(e, t) {
		return Lt(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return Bt(this, "splice", e);
	},
	toReversed() {
		return At(this).toReversed();
	},
	toSorted(e) {
		return At(this).toSorted(e);
	},
	toSpliced(...e) {
		return At(this).toSpliced(...e);
	},
	unshift(...e) {
		return Bt(this, "unshift", e);
	},
	values() {
		return Pt(this, "values", (e) => Mt(this, e));
	}
};
function Pt(e, t, n) {
	let r = jt(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ bn(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => Ft(a.next(), n), i !== It[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => Ft(a._next(), n);
	}
	return a;
}
function Ft(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var It = Array.prototype;
function Lt(e, t, n, r, i, a) {
	let o = jt(e), s = o !== e && !/* @__PURE__ */ bn(e), c = o[t];
	if (c !== It[t]) {
		let t = c.apply(e, a);
		return s ? wn(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, Mt(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function Rt(e, t, n, r) {
	let i = jt(e), a = i !== e && !/* @__PURE__ */ bn(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = Mt(e, t)), n.call(this, t, Mt(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? Mt(e, c) : c;
}
function zt(e, t, n) {
	let r = /* @__PURE__ */ Sn(e);
	Dt(r, "iterate", Et);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ xn(n[0]) ? (n[0] = /* @__PURE__ */ Sn(n[0]), r[t](...n)) : i;
}
function Bt(e, t, n = []) {
	gt(), it();
	let r = (/* @__PURE__ */ Sn(e))[t].apply(e, n);
	return at(), _t(), r;
}
var Vt = /* @__PURE__ */ v("__proto__,__v_isRef,__isVue"), Ht = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(oe));
function Ut(e) {
	oe(e) || (e = String(e));
	let t = /* @__PURE__ */ Sn(this);
	return Dt(t, "has", e), t.hasOwnProperty(e);
}
var Wt = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? dn : un : i ? ln : cn).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = O(e);
		if (!r) {
			let e;
			if (a && (e = Nt[t])) return e;
			if (t === "hasOwnProperty") return Ut;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ En(e) ? e : n);
		if ((oe(t) ? Ht.has(t) : Vt(t)) || (r || Dt(e, "get", t), i)) return o;
		if (/* @__PURE__ */ En(o)) {
			let e = a && pe(t) ? o : o.value;
			return r && se(e) ? /* @__PURE__ */ hn(e) : e;
		}
		return se(o) ? r ? /* @__PURE__ */ hn(o) : /* @__PURE__ */ pn(o) : o;
	}
}, Gt = class extends Wt {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = O(e) && pe(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ yn(i);
			if (!/* @__PURE__ */ bn(n) && !/* @__PURE__ */ yn(n) && (i = /* @__PURE__ */ Sn(i), n = /* @__PURE__ */ Sn(n)), !a && /* @__PURE__ */ En(i) && !/* @__PURE__ */ En(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : D(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ En(e) ? e : r);
		return e === /* @__PURE__ */ Sn(r) && s && (o ? Se(n, i) && Ot(e, "set", t, n, i) : Ot(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = D(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && Ot(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return oe(t) && Ht.has(t) || Dt(e, "has", t), n;
	}
	ownKeys(e) {
		return Dt(e, "iterate", O(e) ? "length" : wt), Reflect.ownKeys(e);
	}
}, Kt = class extends Wt {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, qt = /* @__PURE__ */ new Gt(), Jt = /* @__PURE__ */ new Kt(), Yt = /* @__PURE__ */ new Gt(!0), Xt = /* @__PURE__ */ new Kt(!0), Zt = (e) => e, Qt = (e) => Reflect.getPrototypeOf(e);
function $t(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ Sn(i), o = te(a), s = e === "entries" || e === Symbol.iterator && o, c = e === "keys" && o, l = i[e](...r), u = n ? Zt : t ? Tn : wn;
		return !t && Dt(a, "iterate", c ? Tt : wt), T(Object.create(l), { next() {
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
function en(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function tn(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ Sn(r), a = /* @__PURE__ */ Sn(n);
			e || (Se(n, a) && Dt(i, "get", n), Dt(i, "get", a));
			let { has: o } = Qt(i), s = t ? Zt : e ? Tn : wn;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && Dt(/* @__PURE__ */ Sn(t), "iterate", wt), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ Sn(n), i = /* @__PURE__ */ Sn(t);
			return e || (Se(t, i) && Dt(r, "has", t), Dt(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ Sn(a), s = t ? Zt : e ? Tn : wn;
			return !e && Dt(o, "iterate", wt), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return T(n, e ? {
		add: en("add"),
		set: en("set"),
		delete: en("delete"),
		clear: en("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ Sn(this), r = Qt(n), i = /* @__PURE__ */ Sn(e), a = !t && !/* @__PURE__ */ bn(e) && !/* @__PURE__ */ yn(e) ? i : e;
			return r.has.call(n, a) || Se(e, a) && r.has.call(n, e) || Se(i, a) && r.has.call(n, i) || (n.add(a), Ot(n, "add", a, a)), this;
		},
		set(e, n) {
			t || /* @__PURE__ */ bn(n) || /* @__PURE__ */ yn(n) || (n = /* @__PURE__ */ Sn(n));
			let r = /* @__PURE__ */ Sn(this), { has: i, get: a } = Qt(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ Sn(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? Se(n, s) && Ot(r, "set", e, n, s) : Ot(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ Sn(this), { has: n, get: r } = Qt(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ Sn(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && Ot(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ Sn(this), t = e.size !== 0, n = e.clear();
			return t && Ot(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = $t(r, e, t);
	}), n;
}
function nn(e, t) {
	let n = tn(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(D(n, i) && i in r ? n : r, i, a);
}
var rn = { get: /* @__PURE__ */ nn(!1, !1) }, an = { get: /* @__PURE__ */ nn(!1, !0) }, on = { get: /* @__PURE__ */ nn(!0, !1) }, sn = { get: /* @__PURE__ */ nn(!0, !0) }, cn = /* @__PURE__ */ new WeakMap(), ln = /* @__PURE__ */ new WeakMap(), un = /* @__PURE__ */ new WeakMap(), dn = /* @__PURE__ */ new WeakMap();
function fn(e) {
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
function pn(e) {
	return /* @__PURE__ */ yn(e) ? e : _n(e, !1, qt, rn, cn);
}
// @__NO_SIDE_EFFECTS__
function mn(e) {
	return _n(e, !1, Yt, an, ln);
}
// @__NO_SIDE_EFFECTS__
function hn(e) {
	return _n(e, !0, Jt, on, un);
}
// @__NO_SIDE_EFFECTS__
function gn(e) {
	return _n(e, !0, Xt, sn, dn);
}
function _n(e, t, n, r, i) {
	if (!se(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = fn(de(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function vn(e) {
	return /* @__PURE__ */ yn(e) ? /* @__PURE__ */ vn(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function yn(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function bn(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function xn(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function Sn(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ Sn(t) : e;
}
function Cn(e) {
	return !D(e, "__v_skip") && Object.isExtensible(e) && Ce(e, "__v_skip", !0), e;
}
var wn = (e) => se(e) ? /* @__PURE__ */ pn(e) : e, Tn = (e) => se(e) ? /* @__PURE__ */ hn(e) : e;
// @__NO_SIDE_EFFECTS__
function En(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function P(e) {
	return On(e, !1);
}
// @__NO_SIDE_EFFECTS__
function Dn(e) {
	return On(e, !0);
}
function On(e, t) {
	return /* @__PURE__ */ En(e) ? e : new kn(e, t);
}
var kn = class {
	constructor(e, t) {
		this.dep = new xt(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ Sn(e), this._value = t ? e : wn(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ bn(e) || /* @__PURE__ */ yn(e);
		e = n ? e : /* @__PURE__ */ Sn(e), Se(e, t) && (this._rawValue = e, this._value = n ? e : wn(e), this.dep.trigger());
	}
};
function An(e) {
	e.dep && e.dep.trigger();
}
function F(e) {
	return /* @__PURE__ */ En(e) ? e.value : e;
}
function jn(e) {
	return k(e) ? e() : F(e);
}
var Mn = {
	get: (e, t, n) => t === "__v_raw" ? e : F(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ En(i) && !/* @__PURE__ */ En(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Nn(e) {
	return /* @__PURE__ */ vn(e) ? e : new Proxy(e, Mn);
}
var Pn = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new xt(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function Fn(e) {
	return new Pn(e);
}
// @__NO_SIDE_EFFECTS__
function In(e) {
	let t = O(e) ? Array(e.length) : {};
	for (let n in e) t[n] = Bn(e, n);
	return t;
}
var Ln = class {
	constructor(e, t, n) {
		this._object = e, this._defaultValue = n, this.__v_isRef = !0, this._value = void 0, this._key = oe(t) ? t : String(t), this._raw = /* @__PURE__ */ Sn(e);
		let r = !0, i = e;
		if (!O(e) || oe(this._key) || !pe(this._key)) do
			r = !/* @__PURE__ */ xn(i) || /* @__PURE__ */ bn(i);
		while (r && (i = i.__v_raw));
		this._shallow = r;
	}
	get value() {
		let e = this._object[this._key];
		return this._shallow && (e = F(e)), this._value = e === void 0 ? this._defaultValue : e;
	}
	set value(e) {
		if (this._shallow && /* @__PURE__ */ En(this._raw[this._key])) {
			let t = this._object[this._key];
			if (/* @__PURE__ */ En(t)) {
				t.value = e;
				return;
			}
		}
		this._object[this._key] = e;
	}
	get dep() {
		return kt(this._raw, this._key);
	}
}, Rn = class {
	constructor(e) {
		this._getter = e, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
	}
	get value() {
		return this._value = this._getter();
	}
};
// @__NO_SIDE_EFFECTS__
function zn(e, t, n) {
	return /* @__PURE__ */ En(e) ? e : k(e) ? new Rn(e) : se(e) && arguments.length > 1 ? Bn(e, t, n) : /* @__PURE__ */ P(e);
}
function Bn(e, t, n) {
	return new Ln(e, t, n);
}
var Vn = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new xt(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = yt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && M !== this) return rt(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return lt(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function Hn(e, t, n = !1) {
	let r, i;
	return k(e) ? r = e : (r = e.get, i = e.set), new Vn(r, i, n);
}
var Un = {
	GET: "get",
	HAS: "has",
	ITERATE: "iterate"
}, Wn = {
	SET: "set",
	ADD: "add",
	DELETE: "delete",
	CLEAR: "clear"
}, Gn = {}, Kn = /* @__PURE__ */ new WeakMap(), qn = void 0;
function Jn() {
	return qn;
}
function Yn(e, t = !1, n = qn) {
	if (n) {
		let t = Kn.get(n);
		t || Kn.set(n, t = []), t.push(e);
	}
}
function Xn(e, t, n = y) {
	let { immediate: r, deep: i, once: a, scheduler: o, augmentJob: s, call: c } = n, l = (e) => i ? e : /* @__PURE__ */ bn(e) || i === !1 || i === 0 ? Zn(e, 1) : Zn(e), u, d, f, p, m = !1, h = !1;
	if (/* @__PURE__ */ En(e) ? (d = () => e.value, m = /* @__PURE__ */ bn(e)) : /* @__PURE__ */ vn(e) ? (d = () => l(e), m = !0) : O(e) ? (h = !0, m = e.some((e) => /* @__PURE__ */ vn(e) || /* @__PURE__ */ bn(e)), d = () => e.map((e) => {
		if (/* @__PURE__ */ En(e)) return e.value;
		if (/* @__PURE__ */ vn(e)) return l(e);
		if (k(e)) return c ? c(e, 2) : e();
	})) : d = k(e) ? t ? c ? () => c(e, 2) : e : () => {
		if (f) {
			gt();
			try {
				f();
			} finally {
				_t();
			}
		}
		let t = qn;
		qn = u;
		try {
			return c ? c(e, 3, [p]) : e(p);
		} finally {
			qn = t;
		}
	} : x, t && i) {
		let e = d, t = i === !0 ? Infinity : i;
		d = () => Zn(e(), t);
	}
	let g = Ze(), _ = () => {
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
	let v = h ? Array(e.length).fill(Gn) : Gn, b = (e) => {
		if (u.flags & 1 && (u.dirty || e)) {
			if (t) {
				let n = u.run();
				if (e || i || m || (h ? n.some((e, t) => Se(e, v[t])) : Se(n, v))) {
					let e = qn;
					gt();
					try {
						f && f(), qn = u;
						let e = [
							n,
							v === Gn ? void 0 : h && v[0] === Gn ? [] : v,
							p
						];
						v = n, c ? c(t, 3, e) : t(...e);
					} finally {
						qn = e, _t();
					}
				}
			} else u.run();
		}
	};
	return s && s(b), u = new et(d), u.scheduler = o ? () => o(b, !1) : b, p = (e) => Yn(e, !1, u), f = u.onStop = () => {
		let e = Kn.get(u);
		if (e) {
			if (c) c(e, 4);
			else for (let t of e) t();
			Kn.delete(u);
		}
	}, t ? r ? b(!0) : v = u.run() : o ? o(b.bind(null, !0), !0) : u.run(), _.pause = u.pause.bind(u), _.resume = u.resume.bind(u), _.stop = _, _;
}
function Zn(e, t = Infinity, n) {
	if (t <= 0 || !se(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ En(e)) Zn(e.value, t, n);
	else if (O(e)) for (let r = 0; r < e.length; r++) Zn(e[r], t, n);
	else if (ne(e) || te(e)) e.forEach((e) => {
		Zn(e, t, n);
	});
	else if (fe(e)) {
		for (let r in e) Zn(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && Zn(e[r], t, n);
	}
	return e;
}
// node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var Qn = [];
function $n(e) {
	Qn.push(e);
}
function er() {
	Qn.pop();
}
function tr(e, t) {}
var nr = {
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
}, rr = {
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
function ir(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		or(e, t, n);
	}
}
function ar(e, t, n, r) {
	if (k(e)) {
		let i = ir(e, t, n, r);
		return i && ce(i) && i.catch((e) => {
			or(e, t, n);
		}), i;
	}
	if (O(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(ar(e[a], t, n, r));
		return i;
	}
}
function or(e, t, n, r = !0) {
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
			gt(), ir(a, null, 10, [
				e,
				i,
				o
			]), _t();
			return;
		}
	}
	sr(e, n, i, r, o);
}
function sr(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var cr = [], lr = -1, ur = [], dr = null, fr = 0, pr = /* @__PURE__ */ Promise.resolve(), mr = null;
function hr(e) {
	let t = mr || pr;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function gr(e) {
	let t = lr + 1, n = cr.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = cr[r], a = wr(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function _r(e) {
	if (!(e.flags & 1)) {
		let t = wr(e), n = cr[cr.length - 1];
		!n || !(e.flags & 2) && t >= wr(n) ? cr.push(e) : cr.splice(gr(t), 0, e), e.flags |= 1, vr();
	}
}
function vr() {
	mr ||= pr.then(Tr);
}
function yr(e) {
	if (!O(e)) dr && e.id === -1 ? dr.splice(fr + 1, 0, e) : e.flags & 1 || (ur.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) ur.push(e[t]);
	vr();
}
function br(e, t, n, r = lr + 1) {
	for (; r < cr.length; r++) {
		let n = cr[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			cr.splice(r, 1), r = e ? r - 1 : lr, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function xr(e, t, n = 0) {
	if (ur.length) {
		let e = ur, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < ur.length; i++) {
				let a = ur[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? ur[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => wr(e) - wr(t));
		if (ur.length = r, dr) {
			for (let e = 0; e < i.length; e++) dr.push(i[e]);
			return;
		}
		for (dr = i, fr = 0; fr < dr.length; fr++) {
			let e = dr[fr];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		dr = null, fr = 0;
	}
}
var Sr = !1;
function Cr(e, t) {
	if (Sr) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(ur);
	e(), Sr = !0;
	try {
		br(void 0, t), xr(void 0, n, t);
	} finally {
		Sr = !1;
	}
}
var wr = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function Tr(e) {
	try {
		for (lr = 0; lr < cr.length; lr++) {
			let e = cr[lr];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), ir(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; lr < cr.length; lr++) {
			let e = cr[lr];
			e && (e.flags &= -2);
		}
		lr = -1, cr.length = 0, xr(e), mr = null, (cr.length || ur.length) && Tr(e);
	}
}
var Er, Dr = [];
function Or(e, t) {
	Er = e, Er ? (Er.enabled = !0, Dr.forEach(({ event: e, args: t }) => Er.emit(e, ...t)), Dr = []) : typeof window < "u" && window.HTMLElement && !(window.navigator?.userAgent)?.includes("jsdom") ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((e) => {
		Or(e, t);
	}), setTimeout(() => {
		Er || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, Dr = []);
	}, 3e3)) : Dr = [];
}
var kr = null, Ar = null;
function jr(e) {
	let t = kr;
	return kr = e, Ar = e && e.type.__scopeId || null, t;
}
function Mr(e) {
	Ar = e;
}
function Nr() {
	Ar = null;
}
var Pr = (e) => I;
function I(e, t = kr, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && Ms(-1);
		let i = jr(t), a = Os.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Os.length; e > a; e--) As();
			jr(i), r._d && Ms(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function Fr(e, t) {
	if (kr === null) return e;
	let n = gc(kr), r = e.dirs ||= [];
	for (let e = 0; e < t.length; e++) {
		let [i, a, o, s = y] = t[e];
		i && (k(i) && (i = {
			mounted: i,
			updated: i
		}), i.deep && Zn(a), r.push({
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
function Ir(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (gt(), ar(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), _t());
	}
}
function Lr(e, t) {
	if (Qs) {
		let n = Qs.provides, r = Qs.parent && Qs.parent.provides;
		r === n && (n = Qs.provides = Object.create(r)), n[e] = t;
	}
}
function Rr(e, t, n = !1) {
	let r = $s();
	if (r || xo) {
		let i = xo ? xo._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && k(t) ? t.call(r && r.proxy) : t;
	}
}
function zr() {
	return !!($s() || xo);
}
var Br = /* @__PURE__ */ Symbol.for("v-scx"), Vr = () => Rr(Br);
function Hr(e, t) {
	return Kr(e, null, t);
}
function Ur(e, t) {
	return Kr(e, null, { flush: "post" });
}
function Wr(e, t) {
	return Kr(e, null, { flush: "sync" });
}
function Gr(e, t, n) {
	return Kr(e, t, n);
}
function Kr(e, t, n = y) {
	let { immediate: r, deep: i, flush: a, once: o } = n, s = T({}, n), c = t && r || !t && a !== "post", l;
	if (ac) {
		if (a === "sync") {
			let e = Vr();
			l = e.__watcherHandles ||= [];
		} else if (!c) {
			let e = () => {};
			return e.stop = x, e.resume = x, e.pause = x, e;
		}
	}
	let u = Qs;
	s.call = (e, t, n) => ar(e, u, t, n);
	let d = !1;
	a === "post" ? s.scheduler = (e) => {
		e.i = u, es(e, u && u.suspense);
	} : a !== "sync" && (d = !0, s.scheduler = (e, t) => {
		t ? e() : _r(e);
	}), s.augmentJob = (e) => {
		t && (e.flags |= 4), d && (e.flags |= 2, u && (e.id = u.uid, e.i = u));
	};
	let f = Xn(e, t, s);
	return ac && (l ? l.push(f) : c && f()), f;
}
function qr(e, t, n) {
	let r = this.proxy, i = ae(e) ? e.includes(".") ? Jr(r, e) : () => r[e] : e.bind(r, r), a;
	k(t) ? a = t : (a = t.handler, n = t);
	let o = nc(this), s = Kr(i, a.bind(r), n);
	return o(), s;
}
function Jr(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Yr = /* @__PURE__ */ new WeakMap(), Xr = /* @__PURE__ */ Symbol("_vte"), Zr = (e) => e.__isTeleport, Qr = (e) => e && (e.disabled || e.disabled === ""), $r = (e) => e && (e.defer || e.defer === ""), ei = (e) => typeof SVGElement < "u" && e instanceof SVGElement, ti = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, ni = (e, t) => {
	let n = e && e.to;
	return ae(n) ? t ? t(n) : null : n;
}, ri = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = Qr(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = Qr(e.props), r = e.target = ni(e.props, m), a = ci(r, e, h, p);
			r && (o !== "svg" && ei(r) ? o = "svg" : o !== "mathml" && ti(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), si(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (Yr.get(e) === t) {
					if (Yr.delete(e), Qr(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), si(e, !0);
					}
					x(e);
				}
			};
			Yr.set(e, t), es(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), $r(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), si(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Yr.get(e);
			if (u) {
				u.flags |= 8, Yr.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = Qr(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || ei(p) ? o = "svg" : (o === "mathml" || ti(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), ss(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : ii(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = ni(t.props, m);
				e && (t.target = e, ii(t, e, null, l, 0));
			} else g && ii(t, p, h, l, 1);
			si(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = Qr(f), m = a || !p, h = Yr.get(e);
		if (h && (h.flags |= 8, Yr.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: ii,
	hydrate: ai
};
function ii(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Yr.has(e) && (!d || Qr(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function ai(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
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
	let m = t.target = ni(t.props, c), h = Qr(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || ci(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || ci(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), si(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var oi = ri;
function si(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function ci(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Xr] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var li = /* @__PURE__ */ Symbol("_leaveCb"), ui = /* @__PURE__ */ Symbol("_enterCb");
function di() {
	let e = {
		isMounted: !1,
		isLeaving: !1,
		isUnmounting: !1,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	return ga(() => {
		e.isMounted = !0;
	}), ya(() => {
		e.isUnmounting = !0;
	}), e;
}
var fi = [Function, Array], pi = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: fi,
	onEnter: fi,
	onAfterEnter: fi,
	onEnterCancelled: fi,
	onBeforeLeave: fi,
	onLeave: fi,
	onAfterLeave: fi,
	onLeaveCancelled: fi,
	onBeforeAppear: fi,
	onAppear: fi,
	onAfterAppear: fi,
	onAppearCancelled: fi
}, mi = {
	name: "BaseTransition",
	props: pi,
	setup(e, { slots: t }) {
		let n = $s(), r = di();
		return () => {
			let i = t.default && Si(t.default(), !0), a = i && i.length ? hi(i) : n.subTree ? q() : void 0;
			if (!a) return;
			let o = /* @__PURE__ */ Sn(e), { mode: s } = o;
			if (r.isLeaving) return yi(a);
			let c = bi(a);
			if (!c) return yi(a);
			let l = vi(c, o, r, n, (e) => l = e);
			c.type !== Es && xi(c, l);
			let u = n.subTree && bi(n.subTree);
			if (u && u.type !== Es && !Fs(u, c) && Ci(n.subTree)) {
				let e = vi(u, o, r, n);
				if (xi(u, e), s === "out-in" && c.type !== Es) return r.isLeaving = !0, e.afterLeave = () => {
					r.isLeaving = !1, n.job.flags & 8 || n.update(), delete e.afterLeave, u = void 0;
				}, yi(a);
				s === "in-out" && c.type !== Es ? e.delayLeave = (e, t, n) => {
					let i = _i(r, u);
					i[String(u.key)] = u, e[li] = () => {
						t(), e[li] = void 0, delete l.delayedLeave, u = void 0;
					}, l.delayedLeave = () => {
						n(), delete l.delayedLeave, u = void 0;
					};
				} : u = void 0;
			} else u &&= void 0;
			return a;
		};
	}
};
function hi(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Es) {
			t = n;
			break;
		}
	}
	return t;
}
var gi = mi;
function _i(e, t) {
	let { leavingVNodes: n } = e, r = n.get(t.type);
	return r || (r = /* @__PURE__ */ Object.create(null), n.set(t.type, r)), r;
}
function vi(e, t, n, r, i) {
	let { appear: a, mode: o, persisted: s = !1, onBeforeEnter: c, onEnter: l, onAfterEnter: u, onEnterCancelled: d, onBeforeLeave: f, onLeave: p, onAfterLeave: m, onLeaveCancelled: h, onBeforeAppear: g, onAppear: _, onAfterAppear: v, onAppearCancelled: y } = t, b = String(e.key), x = _i(n, e), S = (e, t) => {
		e && ar(e, r, 9, t);
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
			t[li] && t[li](!0);
			let i = x[b];
			if (i && Fs(e, i)) {
				let e = i.el[li];
				if (!e) {
					let t = Ci(i);
					e = t && t.el[li];
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
			t[ui] = (e) => {
				s || (s = !0, S(e ? o : i, [t]), w.delayedLeave && w.delayedLeave(), t[ui] = void 0);
			};
			let c = t[ui].bind(null, !1);
			r ? C(r, [t, c]) : c();
		},
		leave(t, r) {
			let i = String(e.key);
			if (t[ui] && t[ui](!0), n.isUnmounting) return r();
			S(f, [t]);
			let a = !1;
			t[li] = (n) => {
				a || (a = !0, r(), S(n ? h : m, [t]), t[li] = void 0, x[i] === e && delete x[i]);
			};
			let o = t[li].bind(null, !1);
			x[i] = e, p ? C(p, [t, o]) : o();
		},
		clone(e) {
			let a = vi(e, t, n, r, i);
			return i && i(a), a;
		}
	};
	return w;
}
function yi(e) {
	if (ia(e)) return e = Vs(e), e.children = null, e;
}
function bi(e) {
	if (!ia(e)) return Zr(e.type) && e.children ? hi(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && k(n.default)) return n.default();
	}
}
function xi(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		xi(Zr(n.type) && bi(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === B && O(e.children)) {
		let n = ko(e.children, !1);
		n && xi(n, t);
	}
}
function Si(e, t = !1, n) {
	let r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a], s = n == null ? o.key : String(n) + String(o.key == null ? a : o.key);
		o.type === B ? (o.patchFlag & 128 && i++, r = r.concat(Si(o.children, t, s))) : (t || o.type !== Es) && r.push(s == null ? o : Vs(o, { key: s }));
	}
	if (i > 1) for (let e = 0; e < r.length; e++) r[e].patchFlag = -2;
	return r;
}
function Ci(e) {
	if (e.component) return Ci(e.component.subTree);
	if (e.type === B) {
		let t = O(e.children) && ko(e.children, !1);
		return t ? Ci(t) : void 0;
	}
	if (e.type !== Es) return e;
}
// @__NO_SIDE_EFFECTS__
function L(e, t) {
	return k(e) ? /* @__PURE__ */ T({ name: e.name }, t, { setup: e }) : e;
}
function wi() {
	let e = $s();
	return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : "";
}
function Ti(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function Ei(e) {
	let t = $s(), n = /* @__PURE__ */ Dn(null);
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
function Di(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var Oi = /* @__PURE__ */ new WeakMap();
function ki(e, t, n, r, i = !1) {
	if (O(e)) {
		e.forEach((e, a) => ki(e, t && (O(t) ? t[a] : t), n, r, i));
		return;
	}
	if (ta(r) && !i) {
		r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && ki(e, t, n, r.component.subTree);
		return;
	}
	let a = r.shapeFlag & 4 ? gc(r.component) : r.el, o = i ? null : a, { i: s, r: c } = e, l = t && t.r, u = s.refs === y ? s.refs = {} : s.refs, d = s.setupState, f = /* @__PURE__ */ Sn(d), p = d === y ? S : (e) => !Di(u, e) && D(f, e), m = (e, t) => !(t && Di(u, t));
	if (l != null && l !== c) {
		if (Ai(t), ae(l)) u[l] = null, p(l) && (d[l] = null);
		else if (/* @__PURE__ */ En(l)) {
			let e = t;
			m(l, e.k) && (l.value = null), e.k && (u[e.k] = null);
		}
	}
	if (k(c)) ir(c, s, 12, [o, u]);
	else {
		let t = ae(c), r = /* @__PURE__ */ En(c);
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
					s(), Oi.delete(e);
				};
				t.id = -1, Oi.set(e, t), es(t, n);
			} else Ai(e), s();
		}
	}
}
function Ai(e) {
	let t = Oi.get(e);
	t && (t.flags |= 8, Oi.delete(e));
}
var ji = !1, Mi = () => {
	ji ||= (console.error("Hydration completed but contains mismatches."), !0);
}, Ni = (e) => e.namespaceURI.includes("svg") && e.tagName !== "foreignObject", Pi = (e) => e.namespaceURI.includes("MathML"), Fi = (e) => {
	if (e.nodeType === 1) {
		if (Ni(e)) return "svg";
		if (Pi(e)) return "mathml";
	}
}, Ii = (e) => e.nodeType === 8;
function Li(e) {
	let { mt: t, p: n, o: { patchProp: r, createText: i, nextSibling: a, parentNode: o, remove: s, insert: c, createComment: l } } = e, u = (e, t) => {
		t.hasChildNodes() ? (d(t.firstChild, e, null, null, null), xr(), t._vnode = e) : (n(null, e, t), xr(), t._vnode = e);
	}, d = (n, r, s, l, u, y = !1) => {
		y ||= !!r.dynamicChildren;
		let b = Ii(n) && n.data === "[", x = () => h(n, r, s, l, u, b), { type: S, ref: C, shapeFlag: w, patchFlag: T } = r, ee = n.nodeType;
		r.el = n, T === -2 && (y = !1, r.dynamicChildren = null);
		let E = null;
		switch (S) {
			case Ts:
				ee === 3 ? (n.data !== r.children && (Mi(), n.data = r.children), E = a(n)) : r.children === "" ? (c(r.el = i(""), o(n), n), E = n) : E = x();
				break;
			case Es:
				v(n) ? (E = a(n), _(r.el = n.content.firstChild, n, s)) : E = ee !== 8 || b ? x() : a(n);
				break;
			case Ds:
				if (b && (n = a(n), ee = n.nodeType), ee === 1 || ee === 3) {
					E = n;
					let e = !r.children.length;
					for (let t = 0; t < r.staticCount; t++) e && (r.children += E.nodeType === 1 ? E.outerHTML : E.data), t === r.staticCount - 1 && (r.anchor = E), E = a(E);
					return b ? a(E) : E;
				}
				x();
				break;
			case B:
				E = b ? m(n, r, s, l, u, y) : x();
				break;
			default: if (w & 1) E = (ee !== 1 || r.type.toLowerCase() !== n.tagName.toLowerCase()) && !v(n) ? x() : f(n, r, s, l, u, y);
			else if (w & 6) {
				r.slotScopeIds = u;
				let e = o(n);
				if (E = b ? g(n) : Ii(n) && n.data === "teleport start" ? g(n, n.data, "teleport end") : a(n), t(r, e, null, s, l, Fi(e), y), (ta(r) || r.component.asyncDep) && !r.component.subTree) {
					let t;
					b ? (t = G(Ds), t.anchor = E ? E.previousSibling : e.lastChild) : t = n.nodeType === 3 ? K("") : G(n.nodeType === 8 ? Es : "div"), t.el = n, r.component.subTree = t;
				}
			} else w & 64 ? E = ee === 8 ? r.type.hydrate(n, r, s, l, u, y, e, p) : x() : w & 128 && (E = r.type.hydrate(n, r, s, l, Fi(o(n)), u, y, e, d));
		}
		return C != null && ki(C, null, l, r), E;
	}, f = (e, t, n, i, a, o) => {
		o ||= !!t.dynamicChildren;
		let { type: c, dynamicProps: l, props: u, patchFlag: d, shapeFlag: f, dirs: m, transition: h } = t, g = c === "input" || c === "option", y = !!l;
		if (g || y || d !== -1) {
			m && Ir(t, null, n, "created");
			let c = !1;
			if (v(e)) {
				c = os(null, h) && n && n.vnode.props && n.vnode.props.appear;
				let r = e.content.firstChild;
				if (c) {
					let e = r.getAttribute("class");
					e && (r.$cls = e), h.beforeEnter(r);
				}
				_(r, e, n), t.el = e = r;
			}
			if (f & 16 && !(u && (u.innerHTML || u.textContent))) {
				let r = p(e.firstChild, t, e, n, i, a, o);
				for (r && !Hi(e, 1) && Mi(); r;) {
					let e = r;
					r = r.nextSibling, s(e);
				}
			} else if (f & 8) {
				let n = t.children;
				n[0] === "\n" && (e.tagName === "PRE" || e.tagName === "TEXTAREA") && (n = n.slice(1));
				let { textContent: r } = e;
				r !== n && r !== n.replace(/\r\n|\r/g, "\n") && (Hi(e, 0) || Mi(), e.textContent = t.children);
			}
			if (u) {
				if (g || y || !o || d & 48) {
					let t = e.tagName.includes("-"), i = e.namespaceURI.includes("svg") ? "svg" : e.namespaceURI.includes("MathML") ? "mathml" : void 0;
					for (let a in u) if (g && (a.endsWith("value") || a === "indeterminate") || C(a) && !me(a) || a[0] === "." || t && !me(a) || l && l.includes(a)) {
						if (zi(e, a, u[a])) continue;
						r(e, a, null, u[a], i, n);
					}
				} else if (u.onClick) r(e, "onClick", null, u.onClick, void 0, n);
				else if (d & 4 && /* @__PURE__ */ vn(u.style)) for (let e in u.style) u.style[e];
			}
			let b;
			(b = u && u.onVnodeBeforeMount) && qs(b, n, t), m && Ir(t, null, n, "beforeMount"), ((b = u && u.onVnodeMounted) || m || c) && Ss(() => {
				b && qs(b, n, t), c && h.enter(e), m && Ir(t, null, n, "mounted");
			}, i);
		}
		return e.nextSibling;
	}, p = (e, t, r, o, s, l, u) => {
		u ||= !!t.dynamicChildren;
		let f = t.children, p = f.length, m = !1;
		for (let t = 0; t < p; t++) {
			let h = u ? f[t] : f[t] = Us(f[t]), g = h.type === Ts;
			e ? (g && !u && t + 1 < p && Us(f[t + 1]).type === Ts && (c(i(e.data.slice(h.children.length)), r, a(e)), e.data = h.children), e = d(e, h, o, s, l, u)) : g && !h.children ? c(h.el = i(""), r) : (m || (m = !0, Hi(r, 1) || Mi()), n(null, h, r, null, o, s, Fi(r), l));
		}
		return e;
	}, m = (e, t, n, r, i, s) => {
		let { slotScopeIds: u } = t;
		u && (i = i ? i.concat(u) : u);
		let d = o(e), f = p(a(e), t, d, n, r, i, s);
		return f && Ii(f) && f.data === "]" ? a(t.anchor = f) : (Mi(), c(t.anchor = l("]"), d, f), f);
	}, h = (e, t, r, i, c, l) => {
		if (Wi(e, t) || Mi(), t.el = null, l) {
			let t = g(e);
			for (;;) {
				let n = a(e);
				if (n && n !== t) s(n);
				else break;
			}
		}
		let u = a(e), d = o(e);
		return s(e), n(null, t, d, u, r, i, Fi(d), c), r && (r.vnode.el = t.el, Fo(r, t.el)), u;
	}, g = (e, t = "[", n = "]") => {
		let r = 0;
		for (; e;) if (e = a(e), e && Ii(e) && (e.data === t && r++, e.data === n)) {
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
var Ri = /* @__PURE__ */ new Set([
	"src",
	"srcset",
	"href",
	"poster"
]);
function zi(e, t, n) {
	return Ri.has(t) ? e.getAttribute(t) === (n == null ? null : `${n}`) : !1;
}
var Bi = "data-allow-mismatch", Vi = {
	0: "text",
	1: "children",
	2: "class",
	3: "style",
	4: "attribute"
};
function Hi(e, t) {
	if (t === 0 || t === 1) for (; e && !e.hasAttribute(Bi);) e = e.parentElement;
	return Ui(e && e.getAttribute(Bi), t);
}
function Ui(e, t) {
	if (e == null) return !1;
	if (e === "") return !0;
	{
		let n = e.split(",");
		return t === 0 && n.includes("children") ? !0 : n.includes(Vi[t]);
	}
}
function Wi(e, t) {
	return Hi(e.parentElement, 1) || Gi(e) || Ki(t);
}
function Gi(e) {
	return e.nodeType === 1 && Ui(e.getAttribute(Bi), 1);
}
function Ki({ props: e }) {
	let t = e && e[Bi];
	return typeof t == "string" && Ui(t, 1);
}
var qi = De().requestIdleCallback || ((e) => setTimeout(e, 1)), Ji = De().cancelIdleCallback || ((e) => clearTimeout(e)), Yi = (e = 1e4) => (t) => {
	let n = qi(t, { timeout: e });
	return () => Ji(n);
};
function Xi(e) {
	let { top: t, left: n, bottom: r, right: i } = e.getBoundingClientRect(), { innerHeight: a, innerWidth: o } = window;
	return (t > 0 && t < a || r > 0 && r < a) && (n > 0 && n < o || i > 0 && i < o);
}
var Zi = (e) => (t, n) => {
	let r = new IntersectionObserver((e) => {
		for (let n of e) if (n.isIntersecting) {
			r.disconnect(), t();
			break;
		}
	}, e), i = (e) => {
		if (Xi(e)) return t(), r.disconnect(), !1;
		if (getComputedStyle(e).display === "contents") {
			for (let t = 0; t < e.children.length; t++) if (i(e.children[t]) === !1) return !1;
		}
		r.observe(e);
	};
	return n((e) => {
		if (e instanceof Element) return i(e);
	}), () => r.disconnect();
}, Qi = (e) => (t) => {
	if (e) {
		let n = matchMedia(e);
		if (n.matches) t();
		else return n.addEventListener("change", t, { once: !0 }), () => n.removeEventListener("change", t);
	}
}, $i = (e = []) => (t, n) => {
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
function ea(e, t) {
	if (Ii(e) && e.data === "[") {
		let n = 1, r = e.nextSibling;
		for (; r;) {
			if (r.nodeType === 1) {
				if (t(r) === !1) break;
			} else if (Ii(r)) {
				if (r.data === "]") {
					if (--n === 0) break;
				} else r.data === "[" && n++;
			}
			r = r.nextSibling;
		}
	} else t(e);
}
var ta = (e) => !!e.type.__asyncLoader;
// @__NO_SIDE_EFFECTS__
function na(e) {
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
	return /* @__PURE__ */ L({
		name: "AsyncComponentWrapper",
		__asyncLoader: p,
		__asyncHydrate(e, t, n) {
			let r = e.isConnected, i = !1;
			(t.bu ||= []).push(() => i = !0);
			let o = () => {
				i || !e.parentNode || r && !e.isConnected || n();
			}, s = a ? () => {
				let n = a(o, (t) => ea(e, t));
				n && (t.bum ||= []).push(n);
			} : o;
			u ? s() : p().then(() => !t.isUnmounted && s());
		},
		get __asyncResolved() {
			return u;
		},
		setup() {
			let e = Qs;
			if (Ti(e), u) return () => ra(u, e);
			let t = (t) => {
				l = null, or(t, e, 13, !r);
			};
			if (s && e.suspense || ac) return p().then((t) => () => ra(t, e)).catch((e) => (t(e), () => r ? G(r, { error: e }) : null));
			let a = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(), d = /* @__PURE__ */ P(!!i), f, m;
			return ba(() => {
				f != null && clearTimeout(f), m != null && clearTimeout(m);
			}), i && (m = setTimeout(() => {
				e.isUnmounted || (d.value = !1);
			}, i)), o != null && (f = setTimeout(() => {
				if (!e.isUnmounted && !a.value && !c.value) {
					let e = /* @__PURE__ */ Error(`Async component timed out after ${o}ms.`);
					t(e), c.value = e;
				}
			}, o)), p().then(() => {
				e.isUnmounted || (a.value = !0, e.parent && ia(e.parent.vnode) && e.parent.update());
			}).catch((n) => {
				e.isUnmounted ? l = null : (t(n), c.value = n);
			}), () => {
				if (a.value && u) return ra(u, e);
				if (c.value && r) return G(r, { error: c.value });
				if (n && !d.value) return ra(n, e);
			};
		}
	});
}
function ra(e, t) {
	let { ref: n, props: r, children: i, ce: a } = t.vnode, o = G(e, r, i);
	return o.ref = n, o.ce = a, delete t.vnode.ce, o;
}
var ia = (e) => e.type.__isKeepAlive, aa = {
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
			l(e, t, n, 0, s), c(a.vnode, e, t, n, a, s, r, e.slotScopeIds, i), es(() => {
				a.isDeactivated = !1, a.a && A(a.a);
				let t = e.props && e.props.onVnodeMounted;
				t && qs(t, a.parent, e);
			}, s);
		}, r.deactivate = (e) => {
			let t = e.component;
			us(t.m), us(t.a), l(e, f, null, 1, s), es(() => {
				t.da && A(t.da);
				let n = e.props && e.props.onVnodeUnmounted;
				n && qs(n, t.parent, e), t.isDeactivated = !0;
			}, s);
		};
		function p(e) {
			da(e), u(e, n, s, !0);
		}
		function m(e) {
			i.forEach((t, n) => {
				let r = _c(ta(t) ? t.type.__asyncResolved || {} : t.type);
				r && !e(r) && h(n);
			});
		}
		function h(e) {
			let t = i.get(e);
			t && (!o || !Fs(t, o)) ? p(t) : o && (da(o), t && da(t)), i.delete(e), a.delete(e);
		}
		Gr(() => [e.include, e.exclude], ([e, t]) => {
			e && m((t) => oa(e, t)), t && m((e) => !oa(t, e));
		}, {
			flush: "post",
			deep: !0
		});
		let g = null, _ = () => {
			g != null && (fs(n.subTree.type) ? es(() => {
				let e = fa(n.subTree);
				e.component && i.set(g, e);
			}, n.subTree.suspense) : i.set(g, fa(n.subTree)));
		};
		return ga(_), va(_), ya(() => {
			i.forEach((e) => {
				let { subTree: t, suspense: r } = n, i = fa(t);
				if (e.type === i.type && e.key === i.key) {
					da(i);
					let e = i.component.da;
					e && es(e, r);
				} else p(e);
			});
		}), () => {
			if (g = null, !t.default) return o = null;
			let n = t.default(), r = n[0];
			if (n.length > 1) return o = null, n;
			if (!Ps(r) || !(r.shapeFlag & 4) && !(r.shapeFlag & 128)) return o = null, r;
			let s = fa(r);
			if (s.type === Es) return o = null, s;
			let c = s.type, l = _c(ta(s) ? s.type.__asyncResolved || {} : c), { include: u, exclude: d, max: f } = e;
			if (u && (!l || !oa(u, l)) || d && l && oa(d, l)) return s.shapeFlag &= -257, o = s, r;
			let p = s.key == null ? c : s.key, m = i.get(p);
			return s.el && (s = Vs(s), r.shapeFlag & 128 && (r.ssContent = s)), g = p, m ? (s.el = m.el, s.component = m.component, s.transition && xi(s, s.transition), s.shapeFlag |= 512, a.delete(p), a.add(p)) : (a.add(p), f && a.size > parseInt(f, 10) && h(a.values().next().value)), s.shapeFlag |= 256, o = s, fs(r.type) ? r : s;
		};
	}
};
function oa(e, t) {
	return O(e) ? e.some((e) => oa(e, t)) : ae(e) ? e.split(",").includes(t) : ie(e) ? (e.lastIndex = 0, e.test(t)) : !1;
}
function sa(e, t) {
	la(e, "a", t);
}
function ca(e, t) {
	la(e, "da", t);
}
function la(e, t, n = Qs) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (pa(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) ia(e.parent.vnode) && ua(r, t, n, e), e = e.parent;
	}
}
function ua(e, t, n, r) {
	let i = pa(t, e, r, !0);
	ba(() => {
		ee(r[t], i);
	}, n);
}
function da(e) {
	e.shapeFlag &= -257, e.shapeFlag &= -513;
}
function fa(e) {
	return e.shapeFlag & 128 ? e.ssContent : e;
}
function pa(e, t, n = Qs, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			gt();
			let i = nc(n), a = ar(t, n, e, r);
			return i(), _t(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var ma = (e) => (t, n = Qs) => {
	ac && e !== "sp" || pa(e, (...e) => t(...e), n);
}, ha = ma("bm"), ga = ma("m"), _a = ma("bu"), va = ma("u"), ya = ma("bum"), ba = ma("um"), xa = ma("sp"), Sa = ma("rtg"), Ca = ma("rtc");
function wa(e, t = Qs) {
	pa("ec", e, t);
}
var Ta = "components", Ea = "directives";
function Da(e, t) {
	return ja(Ta, e, !0, t) || e;
}
var Oa = /* @__PURE__ */ Symbol.for("v-ndc");
function ka(e) {
	return ae(e) ? ja(Ta, e, !1) || e : e || Oa;
}
function Aa(e) {
	return ja(Ea, e);
}
function ja(e, t, n = !0, r = !1) {
	let i = kr || Qs;
	if (i) {
		let n = i.type;
		if (e === Ta) {
			let e = _c(n, !1);
			if (e && (e === t || e === _e(t) || e === be(_e(t)))) return n;
		}
		let a = Ma(i[e] || n[e], t) || Ma(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function Ma(e, t) {
	return e && (e[t] || e[_e(t)] || e[be(_e(t))]);
}
function R(e, t, n, r) {
	let i, a = n && n[r], o = O(e);
	if (o || ae(e)) {
		let n = o && /* @__PURE__ */ vn(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ bn(e), s = /* @__PURE__ */ yn(e), e = jt(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Tn(wn(e[n])) : wn(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		if (!Number.isInteger(e) || e < 0) i = [];
		else {
			i = Array(e);
			for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
		}
	} else if (se(e)) {
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
function Na(e, t) {
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
function z(e, t, n, r, i, a) {
	if (n ??= {}, kr.ce || kr.parent && ta(kr.parent) && kr.parent.ce) {
		let e = a != null && n.key == null ? T({}, n, { key: a }) : n, i = Object.keys(e).length > 0;
		return t !== "default" && (e.name = t), V(), U(B, null, [G("slot", e, r && r())], i ? -2 : 64);
	}
	let o = e[t];
	o && o._c && (o._d = !1);
	let s = Os.length;
	V();
	let c;
	try {
		let i = o && Pa(o(n)), s = n.key || a || i && i.key;
		c = U(B, { key: (s && !oe(s) ? s : `_${t}`) + (!i && r ? "_fb" : "") }, i || (r ? r() : []), i && e._ === 1 ? 64 : -2);
	} catch (e) {
		for (let e = Os.length; e > s; e--) As();
		throw e;
	} finally {
		o && o._c && (o._d = !0);
	}
	return !i && c.scopeId && (c.slotScopeIds = [c.scopeId + "-s"]), c;
}
function Pa(e) {
	return e.some((e) => !Ps(e) || !(e.type === Es || e.type === B && !Pa(e.children))) ? e : null;
}
function Fa(e, t) {
	let n = {};
	for (let r in e) n[t && /[A-Z]/.test(r) ? `on:${r}` : xe(r)] = e[r];
	return n;
}
var Ia = (e) => e ? ic(e) ? gc(e) : Ia(e.parent) : null, La = /* @__PURE__ */ T(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Ia(e.parent),
	$root: (e) => Ia(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => so(e),
	$forceUpdate: (e) => e.f ||= () => {
		_r(e.update);
	},
	$nextTick: (e) => e.n ||= hr.bind(e.proxy),
	$watch: (e) => qr.bind(e)
}), Ra = (e, t) => e !== y && !e.__isScriptSetup && D(e, t), za = {
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
			else if (Ra(r, t)) return o[t] = 1, r[t];
			else if (i !== y && D(i, t)) return o[t] = 2, i[t];
			else if (D(a, t)) return o[t] = 3, a[t];
			else if (n !== y && D(n, t)) return o[t] = 4, n[t];
			else no && (o[t] = 0);
		}
		let l = La[t], u, d;
		if (l) return t === "$attrs" && Dt(e.attrs, "get", ""), l(e);
		if ((u = s.__cssModules) && (u = u[t])) return u;
		if (n !== y && D(n, t)) return o[t] = 4, n[t];
		if (d = c.config.globalProperties, D(d, t)) return d[t];
	},
	set({ _: e }, t, n) {
		let { data: r, setupState: i, ctx: a } = e;
		return Ra(i, t) ? (i[t] = n, !0) : r !== y && D(r, t) ? (r[t] = n, !0) : D(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (a[t] = n, !0);
	},
	has({ _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: i, props: a, type: o } }, s) {
		let c;
		return !!(n[s] || e !== y && s[0] !== "$" && D(e, s) || Ra(t, s) || D(a, s) || D(r, s) || D(La, s) || D(i.config.globalProperties, s) || (c = o.__cssModules) && c[s]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? D(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
}, Ba = /* @__PURE__ */ T({}, za, {
	get(e, t) {
		if (t !== Symbol.unscopables) return za.get(e, t, e);
	},
	has(e, t) {
		return t[0] !== "_" && !Oe(t);
	}
});
function Va() {
	return null;
}
function Ha() {
	return null;
}
function Ua(e) {}
function Wa(e) {}
function Ga() {
	return null;
}
function Ka() {}
function qa(e, t) {
	return null;
}
function Ja() {
	return Xa("useSlots").slots;
}
function Ya() {
	return Xa("useAttrs").attrs;
}
function Xa(e) {
	let t = $s();
	return t.setupContext ||= hc(t);
}
function Za(e) {
	return O(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Qa(e, t) {
	let n = Za(e);
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
function $a(e, t) {
	return !e || !t ? e || t : O(e) && O(t) ? e.concat(t) : T({}, Za(e), Za(t));
}
function eo(e, t) {
	let n = {};
	for (let r in e) t.includes(r) || Object.defineProperty(n, r, {
		enumerable: !0,
		get: () => e[r]
	});
	return n;
}
function to(e) {
	let t = $s(), n = ac, r = e();
	rc(), n && tc(!1);
	let i = () => {
		nc(t), n && tc(!0);
	}, a = () => {
		$s() !== t && t.scope.off(), rc(), n && tc(!1);
	};
	return ce(r) && (r = r.catch((e) => {
		throw i(), Promise.resolve().then(() => Promise.resolve().then(a)), e;
	})), [r, () => {
		i(), Promise.resolve().then(a);
	}];
}
var no = !0;
function ro(e) {
	let t = so(e), n = e.proxy, r = e.ctx;
	no = !1, t.beforeCreate && ao(t.beforeCreate, e, "bc");
	let { data: i, computed: a, methods: o, watch: s, provide: c, inject: l, created: u, beforeMount: d, mounted: f, beforeUpdate: p, updated: m, activated: h, deactivated: g, beforeDestroy: _, beforeUnmount: v, destroyed: y, unmounted: b, render: S, renderTracked: C, renderTriggered: w, errorCaptured: T, serverPrefetch: ee, expose: E, inheritAttrs: D, components: te, directives: ne, filters: re } = t;
	if (l && io(l, r, null), o) for (let e in o) {
		let t = o[e];
		k(t) && (r[e] = t.bind(n));
	}
	if (i) {
		let t = i.call(n, n);
		se(t) && (e.data = /* @__PURE__ */ pn(t));
	}
	if (no = !0, a) for (let e in a) {
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
	if (s) for (let e in s) oo(s[e], r, n, e);
	if (c) {
		let e = k(c) ? c.call(n) : c;
		Reflect.ownKeys(e).forEach((t) => {
			Lr(t, e[t]);
		});
	}
	u && ao(u, e, "c");
	function ie(e, t) {
		O(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (ie(ha, d), ie(ga, f), ie(_a, p), ie(va, m), ie(sa, h), ie(ca, g), ie(wa, T), ie(Ca, C), ie(Sa, w), ie(ya, v), ie(ba, b), ie(xa, ee), O(E)) {
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
	S && e.render === x && (e.render = S), D != null && (e.inheritAttrs = D), te && (e.components = te), ne && (e.directives = ne), ee && Ti(e);
}
function io(e, t, n = x) {
	O(e) && (e = po(e));
	for (let n in e) {
		let r = e[n], i;
		i = se(r) ? "default" in r ? Rr(r.from || n, r.default, !0) : Rr(r.from || n) : Rr(r), /* @__PURE__ */ En(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function ao(e, t, n) {
	ar(O(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function oo(e, t, n, r) {
	let i = r.includes(".") ? Jr(n, r) : () => n[r];
	if (ae(e)) {
		let n = t[e];
		k(n) && Gr(i, n);
	} else if (k(e)) Gr(i, e.bind(n));
	else if (se(e)) {
		if (O(e)) e.forEach((e) => oo(e, t, n, r));
		else {
			let r = k(e.handler) ? e.handler.bind(n) : t[e.handler];
			k(r) && Gr(i, r, e);
		}
	}
}
function so(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => co(c, e, o, !0)), co(c, t, o)), se(t) && a.set(t, c), c;
}
function co(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && co(e, a, n, !0), i && i.forEach((t) => co(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = lo[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var lo = {
	data: uo,
	props: go,
	emits: go,
	methods: ho,
	computed: ho,
	beforeCreate: mo,
	created: mo,
	beforeMount: mo,
	mounted: mo,
	beforeUpdate: mo,
	updated: mo,
	beforeDestroy: mo,
	beforeUnmount: mo,
	destroyed: mo,
	unmounted: mo,
	activated: mo,
	deactivated: mo,
	errorCaptured: mo,
	serverPrefetch: mo,
	components: ho,
	directives: ho,
	watch: _o,
	provide: uo,
	inject: fo
};
function uo(e, t) {
	return t ? e ? function() {
		return T(k(e) ? e.call(this, this) : e, k(t) ? t.call(this, this) : t);
	} : t : e;
}
function fo(e, t) {
	return ho(po(e), po(t));
}
function po(e) {
	if (O(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function mo(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function ho(e, t) {
	return e ? T(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function go(e, t) {
	return e ? O(e) && O(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : T(/* @__PURE__ */ Object.create(null), Za(e), Za(t ?? {})) : t;
}
function _o(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = T(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = mo(e[r], t[r]);
	return n;
}
function vo() {
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
var yo = 0;
function bo(e, t) {
	return function(n, r = null) {
		k(n) || (n = T({}, n)), r != null && !se(r) && (r = null);
		let i = vo(), a = /* @__PURE__ */ new WeakSet(), o = [], s = !1, c = i.app = {
			_uid: yo++,
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
					let u = c._ceVNode || G(n, r);
					return u.appContext = i, l === !0 ? l = "svg" : l === !1 && (l = void 0), o && t ? t(u, a) : e(u, a, l), s = !0, c._container = a, a.__vue_app__ = c, gc(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				s && (ar(o, c._instance, 16), e(null, c._container), delete c._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, c;
			},
			runWithContext(e) {
				let t = xo;
				xo = c;
				try {
					return e();
				} finally {
					xo = t;
				}
			}
		};
		return c;
	};
}
var xo = null;
function So(e, t, n = y) {
	let r = $s(), i = _e(t), a = ye(t), o = Co(e, i), s = Fn((o, s) => {
		let c, l = y, u;
		return Wr(() => {
			let t = e[i];
			Se(c, t) && (c = t, s());
		}), {
			get() {
				return o(), n.get ? n.get(c) : c;
			},
			set(e) {
				let o = n.set ? n.set(e) : e;
				if (!Se(o, c) && !(l !== y && Se(e, l))) return;
				let d = r.vnode.props, f = !!(d && (t in d || i in d || a in d) && (`onUpdate:${t}` in d || `onUpdate:${i}` in d || `onUpdate:${a}` in d));
				f || (c = e, s()), r.emit(`update:${t}`, o), Se(e, l) && (Se(e, o) && !Se(o, u) || f && l !== y && !Se(o, c)) && s(), l = e, u = o;
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
var Co = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${_e(t)}Modifiers`] || e[`${ye(t)}Modifiers`];
function wo(e, t, ...n) {
	if (e.isUnmounted) return;
	let r = e.vnode.props || y, i = n, a = t.startsWith("update:"), o = a && Co(r, t.slice(7));
	o && (o.trim && (i = n.map((e) => ae(e) ? e.trim() : e)), o.number && (i = i.map(we)));
	let s, c = r[s = xe(t)] || r[s = xe(_e(t))];
	!c && a && (c = r[s = xe(ye(t))]), c && ar(c, e, 6, i);
	let l = r[s + "Once"];
	if (l) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[s]) return;
		e.emitted[s] = !0, ar(l, e, 6, i);
	}
}
var To = /* @__PURE__ */ new WeakMap();
function Eo(e, t, n = !1) {
	let r = n ? To : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, s = !1;
	if (!k(e)) {
		let r = (e) => {
			let n = Eo(e, t, !0);
			n && (s = !0, T(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !s ? (se(e) && r.set(e, null), null) : (O(a) ? a.forEach((e) => o[e] = null) : T(o, a), se(e) && r.set(e, o), o);
}
function Do(e, t) {
	return !e || !C(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), D(e, t[0].toLowerCase() + t.slice(1)) || D(e, ye(t)) || D(e, t));
}
function Oo(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: o, attrs: s, emit: c, render: l, renderCache: u, props: d, data: f, setupState: p, ctx: m, inheritAttrs: h } = e, g = jr(e), _, v;
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
			}) : e(d, null)), v = t.props ? s : Ao(s);
		}
	} catch (t) {
		Os.length = 0, or(t, e, 1), _ = G(Es);
	}
	let y = _;
	if (v && h !== !1) {
		let e = Object.keys(v), { shapeFlag: t } = y;
		e.length && t & 7 && (a && e.some(w) && (v = jo(v, a)), y = Vs(y, v, !1, !0));
	}
	return n.dirs && (y = Vs(y, null, !1, !0), y.dirs = y.dirs ? y.dirs.concat(n.dirs) : n.dirs), n.transition && xi(Zr(y.type) && bi(y) || y, n.transition), _ = y, jr(g), _;
}
function ko(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (Ps(r)) {
			if (r.type !== Es || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var Ao = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || C(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, jo = (e, t) => {
	let n = {};
	for (let r in e) w(r) && r.slice(9) in t || (n[r] = e[r]);
	return n;
};
function Mo(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? No(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (Po(o, r, n) && !Do(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || No(r, o, l) : !!o;
	return !1;
}
function No(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!D(e, a) || Po(t, e, a) && !Do(n, a)) return !0;
	}
	return !1;
}
function Po(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && se(r) && se(i) ? !He(r, i) : r !== i;
}
function Fo({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var Io = {}, Lo = () => Object.create(Io), Ro = (e) => Object.getPrototypeOf(e) === Io;
function zo(e, t, n, r = !1) {
	let i = {}, a = Lo();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Vo(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ mn(i) : e.type.props ? i : a, e.attrs = a;
}
function Bo(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ Sn(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (Do(e.emitsOptions, o)) continue;
				let u = t[o];
				if (c) {
					if (D(a, o)) u !== a[o] && (a[o] = u, l = !0);
					else {
						let t = _e(o);
						i[t] = Ho(c, s, t, u, e, !1);
					}
				} else u !== a[o] && (a[o] = u, l = !0);
			}
		}
	} else {
		Vo(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) t && (D(t, a) || (r = ye(a)) !== a && D(t, r)) || (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Ho(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) t && D(t, e) || (delete a[e], l = !0);
	}
	l && Ot(e.attrs, "set", "");
}
function Vo(e, t, n, r) {
	let [i, a] = e.propsOptions, o = !1, s;
	if (t) for (let c in t) {
		if (me(c)) continue;
		let l = t[c], u;
		i && D(i, u = _e(c)) ? !a || !a.includes(u) ? n[u] = l : (s ||= {})[u] = l : Do(e.emitsOptions, c) || c in r && l === r[c] || (r[c] = l, o = !0);
	}
	if (a) {
		let t = /* @__PURE__ */ Sn(n), r = s || y;
		for (let o = 0; o < a.length; o++) {
			let s = a[o];
			n[s] = Ho(i, t, s, r[s], e, !D(r, s));
		}
	}
	return o;
}
function Ho(e, t, n, r, i, a) {
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
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === ye(n)) && (r = !0));
	}
	return r;
}
var Uo = /* @__PURE__ */ new WeakMap();
function Wo(e, t, n = !1) {
	let r = n ? Uo : t.propsCache, i = r.get(e);
	if (i) return i;
	let a = e.props, o = {}, s = [], c = !1;
	if (!k(e)) {
		let r = (e) => {
			c = !0;
			let [n, r] = Wo(e, t, !0);
			T(o, n), r && s.push(...r);
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	if (!a && !c) return se(e) && r.set(e, b), b;
	if (O(a)) for (let e = 0; e < a.length; e++) {
		let t = _e(a[e]);
		Go(t) && (o[t] = y);
	}
	else if (a) for (let e in a) {
		let t = _e(e);
		if (Go(t)) {
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
	return se(e) && r.set(e, l), l;
}
function Go(e) {
	return e[0] !== "$" && !me(e);
}
var Ko = (e) => e === "_" || e === "_ctx" || e === "$stable", qo = (e) => O(e) ? e.map(Us) : [Us(e)], Jo = (e, t, n) => {
	if (t._n) return t;
	let r = I((...e) => qo(t(...e)), n);
	return r._c = !1, r;
}, Yo = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Ko(n)) continue;
		let i = e[n];
		if (k(i)) t[n] = Jo(n, i, r);
		else if (i != null) {
			let e = qo(i);
			t[n] = () => e;
		}
	}
}, Xo = (e, t) => {
	let n = qo(t);
	e.slots.default = () => n;
}, Zo = (e, t, n) => {
	for (let r in t) (n || !Ko(r)) && (e[r] = t[r]);
}, Qo = (e, t, n) => {
	let r = e.slots = Lo();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Zo(r, t, n), n && Ce(r, "_", e, !0)) : Yo(t, r);
	} else t && Xo(e, t);
}, $o = (e, t, n) => {
	let { vnode: r, slots: i } = e, a = !0, o = y;
	if (r.shapeFlag & 32) {
		let e = t._;
		e ? n && e === 1 ? a = !1 : Zo(i, t, n) : (a = !t.$stable, Yo(t, i)), o = t;
	} else t && (Xo(e, t), o = { default: 1 });
	if (a) for (let e in i) !Ko(e) && o[e] == null && delete i[e];
}, es = Ss;
function ts(e) {
	return rs(e);
}
function ns(e) {
	return rs(e, Li);
}
function rs(e, t) {
	let n = De();
	n.__VUE__ = !0;
	let { insert: r, remove: i, patchProp: a, createElement: o, createText: s, createComment: c, setText: l, setElementText: u, parentNode: d, nextSibling: f, setScopeId: p = x, insertStaticContent: m } = e, h = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !Fs(e, t) && (r = _e(e), de(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === b && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case Ts:
				g(e, t, n, r);
				break;
			case Es:
				_(e, t, n, r);
				break;
			case Ds:
				e ?? v(t, n, r, o);
				break;
			case B:
				ne(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? w(e, t, n, r, i, a, o, s, c) : d & 6 ? re(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, ye);
		}
		u != null && i ? ki(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && ki(e.ref, null, a, e, !0);
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
		if (f = e.el = o(e.type, c, m && m.is, m), h & 8 ? u(f, e.children) : h & 16 && E(e.children, f, null, i, s, is(e, c), l, d), _ && Ir(e, null, i, "created"), ee(f, e, e.scopeId, l, i), m) {
			for (let e in m) e !== "value" && !me(e) && a(f, e, null, m[e], c, i);
			"value" in m && a(f, "value", null, m.value, c), (p = m.onVnodeBeforeMount) && qs(p, i, e);
		}
		_ && Ir(e, null, i, "beforeMount");
		let v = os(s, g);
		v && g.beforeEnter(f), r(f, t, n), ((p = m && m.onVnodeMounted) || v || _) && es(() => {
			try {
				p && qs(p, i, e), v && g.enter(f), _ && Ir(e, null, i, "mounted");
			} finally {}
		}, s);
	}, ee = (e, t, n, r, i) => {
		if (n && p(e, n), r) for (let t = 0; t < r.length; t++) p(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || fs(n.type) && (n.ssContent === t || n.ssFallback === t)) {
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
		if (n && as(n, !1), (h = m.onVnodeBeforeUpdate) && qs(h, n, t, e), f && Ir(t, e, n, "beforeUpdate"), n && as(n, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (l = 0, s = !1, d = null), (p.innerHTML && m.innerHTML == null || p.textContent && m.textContent == null) && u(c, ""), d ? O(e.dynamicChildren, d, c, n, r, is(t, i), o) : s || se(e, t, c, null, n, r, is(t, i), o, !1), l > 0) {
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
		((h = m.onVnodeUpdated) || f) && es(() => {
			h && qs(h, n, t, e), f && Ir(t, e, n, "updated");
		}, r);
	}, O = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || ds(c), f = u && (c.type === B || !Fs(c, l) || c.shapeFlag & 198) ? d(u) : n;
			h(c, l, f, null, r, i, a, o, !0);
		}
	}, te = (e, t, n, r, i) => {
		if (t !== n) {
			if (t !== y) for (let o in t) !me(o) && !(o in n) && a(e, o, t[o], null, i, r);
			for (let o in n) {
				if (me(o)) continue;
				let s = n[o], c = t[o];
				s !== c && o !== "value" && a(e, o, c, s, i, r);
			}
			"value" in n && a(e, "value", t.value, n.value, i);
		}
	}, ne = (e, t, n, i, a, o, c, l, u) => {
		let d = t.el = e ? e.el : s(""), f = t.anchor = e ? e.anchor : s(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (l = l ? l.concat(h) : h), e == null ? (r(d, n, i), r(f, n, i), E(t.children || [], n, f, a, o, c, l, u)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (O(e.dynamicChildren, m, n, a, o, c, l), (t.key != null || a && t === a.subTree) && ss(e, t, !0)) : se(e, t, n, f, a, o, c, l, u);
	}, re = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : ie(t, n, r, i, a, o, c) : k(e, t, c);
	}, ie = (e, t, n, r, i, a, o) => {
		let s = e.component = Zs(e, r, i);
		if (ia(e) && (s.ctx.renderer = ye), oc(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, ae, o, a), !e.el) {
				let r = s.subTree = G(Es);
				_(null, r, t, n), e.placeholder = r.el;
			}
		} else ae(s, e, t, n, i, a, o);
	}, k = (e, t, n) => {
		let r = t.component = e.component;
		if (Mo(e, t, n)) {
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
					let n = ls(e);
					if (n) {
						t && (t.el = c.el, oe(e, t, o)), n.asyncDep.then(() => {
							es(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, f;
				as(e, !1), t ? (t.el = c.el, oe(e, t, o)) : t = c, n && A(n), (f = t.props && t.props.onVnodeBeforeUpdate) && qs(f, s, t, c), as(e, !0);
				let p = Oo(e), m = e.subTree;
				e.subTree = p, h(m, p, d(m.el), _e(m), e, i, a), t.el = p.el, u === null && Fo(e, p.el), r && es(r, i), (f = t.props && t.props.onVnodeUpdated) && es(() => qs(f, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = ta(t);
				if (as(e, !1), l && A(l), !m && (o = c && c.onVnodeBeforeMount) && qs(o, d, t), as(e, !0), s && xe) {
					let t = () => {
						e.subTree = Oo(e), xe(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = Oo(e);
					h(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && es(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					es(() => qs(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && ta(d.vnode) && d.vnode.shapeFlag & 256) && e.a && es(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new et(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => _r(u), as(e, !0), l();
	}, oe = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Bo(e, t.props, r, n), $o(e, t.children, n), gt(), br(e), _t();
	}, se = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, d = e ? e.shapeFlag : 0, f = t.children, { patchFlag: p, shapeFlag: m } = t;
		if (p > 0) {
			if (p & 128) {
				le(l, f, n, r, i, a, o, s, c);
				return;
			}
			if (p & 256) {
				ce(l, f, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (d & 16 && ge(l, i, a), f !== l && u(n, f)) : d & 16 ? m & 16 ? le(l, f, n, r, i, a, o, s, c) : ge(l, i, a, !0) : (d & 8 && u(n, ""), m & 16 && E(f, n, r, i, a, o, s, c));
	}, ce = (e, t, n, r, i, a, o, s, c) => {
		e ||= b, t ||= b;
		let l = e.length, u = t.length, d = Math.min(l, u), f = 0;
		for (; f < d; f++) {
			let r = t[f] = c ? Ws(t[f]) : Us(t[f]);
			h(e[f], r, n, null, i, a, o, s, c);
		}
		l > u ? ge(e, i, a, !0, !1, d) : E(t, n, r, i, a, o, s, c, d);
	}, le = (e, t, n, r, i, a, o, s, c) => {
		let l = 0, u = t.length, d = e.length - 1, f = u - 1;
		for (; l <= d && l <= f;) {
			let r = e[l], u = t[l] = c ? Ws(t[l]) : Us(t[l]);
			if (Fs(r, u)) h(r, u, n, null, i, a, o, s, c);
			else break;
			l++;
		}
		for (; l <= d && l <= f;) {
			let r = e[d], l = t[f] = c ? Ws(t[f]) : Us(t[f]);
			if (Fs(r, l)) h(r, l, n, null, i, a, o, s, c);
			else break;
			d--, f--;
		}
		if (l > d) {
			if (l <= f) {
				let e = f + 1, d = e < u ? t[e].el : r;
				for (; l <= f;) h(null, t[l] = c ? Ws(t[l]) : Us(t[l]), n, d, i, a, o, s, c), l++;
			}
		} else if (l > f) for (; l <= d;) de(e[l], i, a, !0), l++;
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
					de(r, i, a, !0);
					continue;
				}
				let u;
				if (r.key != null) u = g.get(r.key);
				else for (_ = m; _ <= f; _++) if (C[_ - m] === 0 && Fs(r, t[_])) {
					u = _;
					break;
				}
				u === void 0 ? de(r, i, a, !0) : (C[u - m] = l + 1, u >= S ? S = u : x = !0, h(r, t[u], n, null, i, a, o, s, c), v++);
			}
			let w = x ? cs(C) : b;
			for (_ = w.length - 1, l = y - 1; l >= 0; l--) {
				let e = m + l, d = t[e], f = t[e + 1], p = e + 1 < u ? f.el || ds(f) : r;
				C[l] === 0 ? h(null, d, n, p, i, a, o, s, c) : x && (_ < 0 || l !== w[_] ? ue(d, n, p, 2) : _--);
			}
		}
	}, ue = (e, t, n, a, o = null) => {
		let { el: s, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) ue(e.component.subTree, t, n, a);
		else if (d & 128) e.suspense.move(t, n, a);
		else if (d & 64) c.move(e, t, n, ye);
		else if (c === B) {
			r(s, t, n);
			for (let e = 0; e < u.length; e++) ue(u[e], t, n, a);
			r(e.anchor, t, n);
		} else if (c === Ds) S(e, t, n);
		else if (a !== 2 && d & 1 && l) {
			if (a === 0) l.persisted && !s[li] ? r(s, t, n) : (l.beforeEnter(s), r(s, t, n), es(() => l.enter(s), o));
			else {
				let { leave: a, delayLeave: o, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? i(s) : r(s, t, n);
				}, d = () => {
					let e = s._isLeaving || !!s[li];
					s._isLeaving && s[li](!0), l.persisted && !e ? u() : a(s, () => {
						u(), c && c();
					});
				};
				o ? o(s, u, d) : d();
			}
		} else r(s, t, n);
	}, de = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (gt(), ki(s, null, n, e, !0), _t()), p == null || e.ctx && e.ctx !== t || (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !ta(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && qs(_, t, e), u & 6) he(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Ir(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ye, r) : l && !l.hasOnce && (a !== B || d > 0 && d & 64) ? ge(l, t, n, !1, !0) : (a === B && d & 384 || !i && u & 16) && ge(c, t, n), r && fe(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && es(() => {
			_ && qs(_, t, e), h && Ir(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, fe = (e) => {
		let { type: t, el: n, anchor: r, transition: a } = e, o = t === B;
		if (o && !a) {
			pe(n, r);
			return;
		}
		if (t === Ds) {
			C(e), a && !a.persisted && a.afterLeave && a.afterLeave();
			return;
		}
		let s = o ? Ci(e) : e, c = () => {
			o ? d(n) && pe(n, r) : i(n), a && !a.persisted && a.afterLeave && a.afterLeave();
		};
		if (s && s.shapeFlag & 1 && a && !a.persisted) {
			let { leave: e, delayLeave: t } = a, n = s.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, pe = (e, t) => {
		let n;
		for (; e !== t;) n = f(e), i(e), e = n;
		i(t);
	}, he = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		us(c), us(l), r && A(r), i.stop(), a ? (a.flags |= 8, de(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, de(o, e, t, n)), s && es(s, t), es(() => {
			e.isUnmounted = !0;
		}, t);
	}, ge = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) de(e[o], t, n, r, i);
	}, _e = (e) => {
		if (e.shapeFlag & 6) return _e(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = f(e.anchor || e.el), n = t && t[Xr];
		return n ? f(n) : t;
	}, ve = (e, t, n) => {
		Cr(() => {
			e == null ? t._vnode && de(t._vnode, null, null, !0) : h(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : Xs());
	}, ye = {
		p: h,
		um: de,
		m: ue,
		r: fe,
		mt: ie,
		mc: E,
		pc: se,
		pbc: O,
		n: _e,
		o: e
	}, be, xe;
	return t && ([be, xe] = t(ye)), {
		render: ve,
		hydrate: be,
		createApp: bo(ve, be)
	};
}
function is({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function as({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function os(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function ss(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (O(r) && O(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = Ws(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && ss(t, a)), a.type === Ts && (a.patchFlag === -1 && (a = i[e] = Ws(a)), a.el = t.el), a.type === Es && !a.el && (a.el = t.el);
	}
}
function cs(e) {
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
function ls(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : ls(t);
}
function us(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function ds(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? ds(t.subTree) : null;
}
var fs = (e) => e.__isSuspense, ps = 0, ms = {
	name: "Suspense",
	__isSuspense: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		if (e == null) gs(t, n, r, i, a, o, s, c, l);
		else {
			if (a && a.deps > 0 && !e.suspense.isInFallback && !a.isHydrating) {
				t.suspense = e.suspense, t.suspense.vnode = t, t.el = e.el;
				return;
			}
			_s(e, t, n, r, i, o, s, c, l);
		}
	},
	hydrate: ys,
	normalize: bs
};
function hs(e, t) {
	let n = e.props && e.props[t];
	k(n) && n();
}
function gs(e, t, n, r, i, a, o, s, c) {
	let { p: l, o: { createElement: u } } = c, d = u("div"), f = e.suspense = vs(e, i, r, t, d, n, a, o, s, c);
	l(null, f.pendingBranch = e.ssContent, d, null, r, f, a, o), f.deps > 0 ? (hs(e, "onPending"), hs(e, "onFallback"), l(null, e.ssFallback, t, n, r, null, a, o), Cs(f, e.ssFallback)) : f.resolve(!1, !0);
}
function _s(e, t, n, r, i, a, o, s, { p: c, um: l, o: { createElement: u } }) {
	let d = t.suspense = e.suspense;
	d.vnode = t, t.el = e.el;
	let f = t.ssContent, p = t.ssFallback, { activeBranch: m, pendingBranch: h, isInFallback: g, isHydrating: _ } = d;
	if (h) d.pendingBranch = f, Fs(h, f) ? (d.deps++, c(h, f, _ ? n : d.hiddenContainer, null, i, d, a, o, s), d.deps--, d.deps <= 0 ? d.resolve() : g && !_ && !d.isFallbackMountPending && (c(m, p, n, r, i, null, a, o, s), Cs(d, p))) : (d.pendingId = ps++, _ ? (d.isHydrating = !1, d.activeBranch = h) : l(h, i, d), d.deps = 0, d.effects.length = 0, d.hiddenContainer = u("div"), g ? (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 ? d.resolve() : d.isFallbackMountPending || (c(m, p, n, r, i, null, a, o, s), Cs(d, p))) : m && Fs(m, f) ? (c(m, f, n, r, i, d, a, o, s), d.resolve(!0)) : (c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0 && d.resolve()));
	else if (m && Fs(m, f)) c(m, f, n, r, i, d, a, o, s), Cs(d, f);
	else if (hs(t, "onPending"), d.pendingBranch = f, d.pendingId = f.shapeFlag & 512 ? f.component.suspenseId : ps++, c(null, f, d.hiddenContainer, null, i, d, a, o, s), d.deps <= 0) d.resolve();
	else {
		let { timeout: e, pendingId: t } = d;
		e > 0 ? setTimeout(() => {
			d.pendingId === t && d.fallback(p);
		}, e) : e === 0 && d.fallback(p);
	}
}
function vs(e, t, n, r, i, a, o, s, c, l, u = !1) {
	let { p: d, m: f, um: p, n: m, o: { parentNode: h, remove: g } } = l, _, v = ws(e);
	v && t && t.pendingBranch && (_ = t.pendingId, t.deps++);
	let y = e.props ? Te(e.props.timeout) : void 0, b = a, x = {
		vnode: e,
		parent: t,
		parentComponent: n,
		namespace: o,
		container: r,
		hiddenContainer: i,
		deps: 0,
		pendingId: ps++,
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
					s === x.pendingId && (f(o, u, a === b && !e ? m(i) : a, 0), yr(c), d && r.ssFallback && (r.ssFallback.el = null));
				}), i && !x.isFallbackMountPending && (h(i.el) === u && (a = m(i), e = !0), p(i, l, x, !0), !g && d && r.ssFallback && es(() => r.ssFallback.el = null, x)), g || f(o, u, a, 0);
			}
			x.isFallbackMountPending = !1, Cs(x, o), x.pendingBranch = null, x.isInFallback = !1;
			let y = x.parent, S = !1;
			for (; y;) {
				if (y.pendingBranch) {
					for (let e = 0; e < c.length; e++) y.effects.push(c[e]);
					S = !0;
					break;
				}
				y = y.parent;
			}
			!S && !g && yr(c), x.effects = [], v && t && t.pendingBranch && _ === t.pendingId && (_ = void 0, t.deps--, t.deps === 0 && !n && t.resolve()), hs(r, "onResolve");
		},
		fallback(e) {
			if (!x.pendingBranch) return;
			let { vnode: t, activeBranch: n, parentComponent: r, container: i, namespace: a } = x;
			hs(t, "onFallback");
			let o = m(n), l = () => {
				if (x.isFallbackMountPending = !1, !x.isInFallback) return;
				let e = x.vnode.ssFallback;
				d(null, e, i, o, r, null, a, s, c), Cs(x, e);
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
				or(t, e, 0);
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
				t(e, s, h(a || e.subTree.el), a ? null : m(e.subTree), x, r, n), c && (s.placeholder = null, g(c)), Fo(e, s.el), i && --x.deps === 0 && x.resolve();
			});
		},
		unmount(e, t) {
			x.isUnmounted = !0, x.activeBranch && p(x.activeBranch, n, e, t), x.pendingBranch && p(x.pendingBranch, n, e, t);
		}
	};
	return x;
}
function ys(e, t, n, r, i, a, o, s, c) {
	let l = t.suspense = vs(t, r, n, e.parentNode, document.createElement("div"), null, i, a, o, s, !0), u = c(e, l.pendingBranch = t.ssContent, n, l, a, o);
	return l.deps === 0 && l.resolve(!1, !0), u;
}
function bs(e) {
	let { shapeFlag: t, children: n } = e, r = t & 32;
	e.ssContent = xs(r ? n.default : n), e.ssFallback = r ? xs(n.fallback) : G(Es);
}
function xs(e) {
	let t;
	if (k(e)) {
		let n = js && e._c;
		n && (e._d = !1, V()), e = e(), n && (e._d = !0, t = ks, As());
	}
	return O(e) && (e = ko(e)), e = Us(e), t && !e.dynamicChildren && (e.dynamicChildren = t.filter((t) => t !== e)), e;
}
function Ss(e, t) {
	t && t.pendingBranch ? O(e) ? t.effects.push(...e) : t.effects.push(e) : yr(e);
}
function Cs(e, t) {
	e.activeBranch = t;
	let { vnode: n, parentComponent: r } = e, i = t.el;
	for (; !i && t.component;) t = t.component.subTree, i = t.el;
	n.el = i, r && r.subTree === n && (r.vnode.el = i, Fo(r, i));
}
function ws(e) {
	let t = e.props && e.props.suspensible;
	return t != null && t !== !1;
}
var B = /* @__PURE__ */ Symbol.for("v-fgt"), Ts = /* @__PURE__ */ Symbol.for("v-txt"), Es = /* @__PURE__ */ Symbol.for("v-cmt"), Ds = /* @__PURE__ */ Symbol.for("v-stc"), Os = [], ks = null;
function V(e = !1) {
	Os.push(ks = e ? null : []);
}
function As() {
	Os.pop(), ks = Os[Os.length - 1] || null;
}
var js = 1;
function Ms(e, t = !1) {
	js += e, e < 0 && ks && t && (ks.hasOnce = !0);
}
function Ns(e) {
	return e.dynamicChildren = js > 0 ? ks || b : null, As(), js > 0 && ks && ks.push(e), e;
}
function H(e, t, n, r, i, a) {
	return Ns(W(e, t, n, r, i, a, !0));
}
function U(e, t, n, r, i) {
	return Ns(G(e, t, n, r, i, !0));
}
function Ps(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function Fs(e, t) {
	return e.type === t.type && e.key === t.key;
}
function Is(e) {}
var Ls = ({ key: e }) => e ?? null, Rs = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : ae(e) || /* @__PURE__ */ En(e) || k(e) ? {
	i: kr,
	r: e,
	k: t,
	f: !!n
} : e);
function W(e, t = null, n = null, r = 0, i = null, a = e === B ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && Ls(t),
		ref: t && Rs(t),
		scopeId: Ar,
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
		ctx: kr
	};
	return s ? (Gs(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= ae(n) ? 8 : 16), js > 0 && !o && ks && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && ks.push(c), c;
}
var G = zs;
function zs(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== Oa || (e = Es), Ps(e)) {
		let r = Vs(e, t, !0);
		return n && Gs(r, n), js > 0 && !a && ks && (r.shapeFlag & 6 ? ks[ks.indexOf(e)] = r : ks.push(r)), r.patchFlag = -2, r;
	}
	if (vc(e) && (e = e.__vccOpts), t) {
		t = Bs(t);
		let { class: e, style: n } = t;
		e && !ae(e) && (t.class = Pe(e)), se(n) && (/* @__PURE__ */ xn(n) && !O(n) && (n = T({}, n)), t.style = ke(n));
	}
	let o = ae(e) ? 1 : fs(e) ? 128 : Zr(e) ? 64 : se(e) ? 4 : k(e) ? 2 : 0;
	return W(e, t, n, r, i, o, a, !0);
}
function Bs(e) {
	return e ? /* @__PURE__ */ xn(e) || Ro(e) ? T({}, e) : e : null;
}
function Vs(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? Ks(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && Ls(l),
		ref: t && t.ref ? n && a ? O(a) ? a.concat(Rs(t)) : [a, Rs(t)] : Rs(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== B ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && Vs(e.ssContent),
		ssFallback: e.ssFallback && Vs(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && xi(u, c.clone(u)), u;
}
function K(e = " ", t = 0) {
	return G(Ts, null, e, t);
}
function Hs(e, t) {
	let n = G(Ds, null, e);
	return n.staticCount = t, n;
}
function q(e = "", t = !1) {
	return t ? (V(), U(Es, null, e)) : G(Es, null, e);
}
function Us(e) {
	return e == null || typeof e == "boolean" ? G(Es) : O(e) ? G(B, null, e.slice()) : Ps(e) ? Ws(e) : G(Ts, null, String(e));
}
function Ws(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : Vs(e);
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
			!r && !Ro(t) ? t._ctx = kr : r === 3 && kr && (kr.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (k(t)) {
		if (r & 65) {
			Gs(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: kr
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [K(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function Ks(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = Pe([t.class, r.class]));
		else if (e === "style") t.style = ke([t.style, r.style]);
		else if (C(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(O(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !w(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function qs(e, t, n, r = null) {
	ar(e, t, 7, [n, r]);
}
var Js = vo(), Ys = 0;
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
		scope: new Ye(!0),
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
		propsOptions: Wo(r, i),
		emitsOptions: Eo(r, i),
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
	return a.ctx = { _: a }, a.root = t ? t.root : a, a.emit = wo.bind(null, a), e.ce && e.ce(a), a;
}
var Qs = null, $s = () => Qs || kr, ec, tc;
{
	let e = De(), t = (t, n) => {
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
	zo(e, r, a, t), Qo(e, i, n || t);
	let o = a ? sc(e, t) : void 0;
	return t && tc(!1), o;
}
function sc(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, za);
	let { setup: r } = n;
	if (r) {
		gt();
		let n = e.setupContext = r.length > 1 ? hc(e) : null, i = nc(e), a = ir(r, e, 0, [e.props, n]), o = ce(a);
		if (_t(), i(), (o || e.sp) && !ta(e) && Ti(e), o) {
			if (a.then(rc, rc), t) return a.then((n) => {
				tc(!0);
				try {
					cc(e, n, t);
				} finally {
					tc(!1);
				}
			}).catch((t) => {
				or(t, e, 0);
			});
			e.asyncDep = a;
		} else cc(e, a, t);
	} else pc(e, t);
}
function cc(e, t, n) {
	k(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : se(t) && (e.setupState = Nn(t)), pc(e, n);
}
var lc, uc;
function dc(e) {
	lc = e, uc = (e) => {
		e.render._rc && (e.withProxy = new Proxy(e.ctx, Ba));
	};
}
var fc = () => !lc;
function pc(e, t, n) {
	let r = e.type;
	if (!e.render) {
		if (!t && lc && !r.render) {
			let t = r.template || so(e).template;
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
		gt();
		try {
			ro(e);
		} finally {
			_t(), t();
		}
	}
}
var mc = { get(e, t) {
	return Dt(e, "get", ""), e[t];
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
	return e.exposed ? e.exposeProxy ||= new Proxy(Nn(Cn(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in La) return La[n](e);
		},
		has(e, t) {
			return t in e || t in La;
		}
	}) : e.proxy;
}
function _c(e, t = !0) {
	return k(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function vc(e) {
	return k(e) && "__vccOpts" in e;
}
var J = (e, t) => /* @__PURE__ */ Hn(e, t, ac);
function yc(e, t, n) {
	try {
		Ms(-1);
		let r = arguments.length;
		return r === 2 ? se(t) && !O(t) ? Ps(t) ? G(e, null, [t]) : G(e, t) : G(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && Ps(n) && (n = [n]), G(e, t, n));
	} finally {
		Ms(1);
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
	for (let e = 0; e < n.length; e++) if (Se(n[e], t[e])) return !1;
	return js > 0 && ks && ks.push(e), !0;
}
var Cc = "3.5.44", wc = x, Tc = rr, Ec = Er, Dc = Or, Oc = {
	createComponentInstance: Zs,
	setupComponent: oc,
	renderComponentRoot: Oo,
	setCurrentRenderingInstance: jr,
	isVNode: Ps,
	normalizeVNode: Us,
	getComponentPublicInstance: gc,
	ensureValidVNode: Pa,
	pushWarningContext: $n,
	popWarningContext: er
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
}, Vc = /* @__PURE__ */ T({}, pi, Bc), Hc = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = Vc, e))((e, { slots: t }) => yc(gi, Gc(e), t)), Uc = (e, t = []) => {
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
	if (se(e)) return [qc(e.enter), qc(e.leave)];
	{
		let t = qc(e);
		return [t, t];
	}
}
function qc(e) {
	return Te(e);
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
	_a(() => {
		yr(r);
	}), ga(() => {
		Gr(r, x, { flush: "post" });
		let e = new MutationObserver(r);
		e.observe(t.subTree.el.parentNode, { childList: !0 }), ba(() => e.disconnect());
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
	else if (e.type === B) e.children.forEach((e) => dl(e, t));
	else if (e.type === Ds) {
		let { el: n, anchor: r } = e;
		for (; n && (fl(n, t), n !== r);) n = n.nextSibling;
	}
}
function fl(e, t) {
	if (e.nodeType === 1) {
		let n = e.style, r = "";
		for (let e in t) {
			let i = qe(t[e]);
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
		hl.test(n) ? e.setProperty(ye(r), n.replace(hl, ""), "important") : e[r] = n;
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
	let r = _e(t);
	if (r !== "filter" && r in e) return vl[t] = r;
	r = be(r);
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
function Sl(e, t, n, r, i, a = Ie(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(xl, t.slice(6, t.length)) : e.setAttributeNS(xl, t, n) : n == null || a && !Le(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : oe(n) ? String(n) : n);
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
		r === "boolean" ? n = Le(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
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
	return [e[2] === ":" ? e.slice(3) : ye(e.slice(2)), t];
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
				e && ar(e, t, 5, a);
			}
		} else ar(r, t, 5, [e]);
	};
	return n.value = e, n.attached = Nl(), n;
}
var Fl = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Il = (e, t, n, r, i, a) => {
	let o = i === "svg";
	t === "class" ? rl(e, r, o) : t === "style" ? ml(e, n, r) : C(t) ? w(t) || Dl(e, t, n, r, a) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : Ll(e, t, r, o)) ? (Cl(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || Sl(e, t, r, o, a, t !== "value")) : e._isVueCE && (Rl(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !ae(r))) ? Cl(e, _e(t), r, a, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), Sl(e, t, r, o));
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
	let r = _e(t);
	return Array.isArray(n) ? n.some((e) => _e(e) === r) : Object.keys(n).some((e) => _e(e) === r);
}
var zl = {};
// @__NO_SIDE_EFFECTS__
function Bl(e, t, n) {
	let r = /* @__PURE__ */ L(e, t);
	fe(r) && (r = T({}, r, t));
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
		this._connected = !1, hr(() => {
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
				(t === Number || t && t.type === Number) && (e in this._props && (this._props[e] = Te(this._props[e])), (i ||= /* @__PURE__ */ Object.create(null))[_e(e)] = !0);
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
		if (t) for (let e in t) D(this, e) || Object.defineProperty(this, e, { get: () => F(t[e]) });
	}
	_resolveProps(e) {
		let { props: t } = e, n = O(t) ? t : Object.keys(t || {});
		for (let e of Object.keys(this)) e[0] !== "_" && n.includes(e) && this._setProp(e, this[e]);
		for (let e of n.map(_e)) Object.defineProperty(this, e, {
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
		let t = this.hasAttribute(e), n = t ? this.getAttribute(e) : zl, r = _e(e);
		t && this._numberProps && this._numberProps[r] && (n = Te(n)), this._setProp(r, n, !1, !0);
	}
	_getProp(e) {
		return this._props[e];
	}
	_setProp(e, t, n = !0, r = !1) {
		if (t !== this._props[e] && (this._dirty = !0, t === zl ? delete this._props[e] : (this._props[e] = t, e === "key" && this._app && (this._app._ceVNode.key = t)), r && this._instance && this._update(), n)) {
			let n = this._ob;
			n && (this._processMutations(n.takeRecords()), n.disconnect()), t === !0 ? this.setAttribute(ye(e), "") : typeof t == "string" || typeof t == "number" ? this.setAttribute(ye(e), t + "") : t || this.removeAttribute(ye(e)), n && n.observe(this, { attributes: !0 });
		}
	}
	_update() {
		let e = this._createVNode();
		this._app && (e.appContext = this._app._context), Lu(e, this._root);
	}
	_createVNode() {
		let e = {};
		this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
		let t = G(this._def, T(e, this._props));
		return this._instance || (t.ce = (e) => {
			this._instance = e, e.ce = this, e.isCE = !0;
			let t = (e, t) => {
				this.dispatchEvent(new CustomEvent(e, fe(t[0]) ? T({ detail: t }, t[0]) : { detail: t }));
			};
			e.emit = (e, ...n) => {
				t(e, n), ye(e) !== e && t(ye(e), n);
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
		let n = $s(), r = di(), i, a, o, s, c = () => (s === void 0 && (s = i.length > 0 && su(i[0].el, n.vnode.el, eu(e))), s);
		return va(() => {
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
			let l = /* @__PURE__ */ Sn(e), u = Gc(l), d = l.tag || B;
			if (i = [], s = void 0, a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && !t.el[al] && (i.push(t), xi(t, vi(t, u, r, n)), ql.set(t, ru(t.el)));
			}
			a = t.default ? Si(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && xi(t, vi(t, u, r, n));
			}
			return i.length && (o = iu(n), Zl.set(n, c)), G(d, null, a);
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
	return O(t) ? (e) => A(t, e) : t;
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
	return t && (e = e.trim()), n && (e = we(e)), e;
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
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? we(e.value) : e.value, c = t ?? "";
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
				let e = Ue(t, n), a = e !== -1;
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
	if (O(t)) i = Ue(t, r.props.value) > -1;
	else if (ne(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = He(t, Su(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var _u = {
	created(e, { value: t }, n) {
		e.checked = He(t, n.props.value), e[du] = cu(n), wl(e, "change", () => {
			e[du](xu(e));
		});
	},
	beforeUpdate(e, { value: t, oldValue: n }, r) {
		e[du] = cu(r), t !== n && (e.checked = He(t, r.props.value));
	}
}, vu = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, wl(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? we(xu(e)) : xu(e)), r = e.multiple, i = r ? ne(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? O(i) ? t.slice() : t : i];
			try {
				e[du](i);
			} finally {
				hr(() => {
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
	if (!n || O(e)) return He(e, t);
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
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : Ue(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (He(xu(a), t)) {
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
		if (t.props && He(t.props.value, e)) return { checked: !0 };
	}, hu.getSSRProps = ({ value: e }, t) => {
		if (O(e)) {
			if (t.props && Ue(e, t.props.value) > -1) return { checked: !0 };
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
		let r = ye(n.key);
		if (t.some((e) => e === r || Au[e] === r)) return e(n);
	}));
}, Mu = /* @__PURE__ */ T({ patchProp: Il }, Ic), Nu, Pu = !1;
function Fu() {
	return Nu ||= ts(Mu);
}
function Iu() {
	return Nu = Pu ? Nu : ns(Mu), Pu = !0, Nu;
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
	BaseTransition: () => gi,
	BaseTransitionPropsValidators: () => pi,
	Comment: () => Es,
	DeprecationTypes: () => null,
	EffectScope: () => Ye,
	ErrorCodes: () => nr,
	ErrorTypeStrings: () => Tc,
	Fragment: () => B,
	KeepAlive: () => aa,
	ReactiveEffect: () => et,
	Static: () => Ds,
	Suspense: () => ms,
	Teleport: () => oi,
	Text: () => Ts,
	TrackOpTypes: () => Un,
	Transition: () => Hc,
	TransitionGroup: () => Ql,
	TriggerOpTypes: () => Wn,
	VueElement: () => Ul,
	assertNumber: () => tr,
	callWithAsyncErrorHandling: () => ar,
	callWithErrorHandling: () => ir,
	camelize: () => _e,
	capitalize: () => be,
	cloneVNode: () => Vs,
	compatUtils: () => null,
	compile: () => Ku,
	computed: () => J,
	createApp: () => zu,
	createBlock: () => U,
	createCommentVNode: () => q,
	createElementBlock: () => H,
	createElementVNode: () => W,
	createHydrationRenderer: () => ns,
	createPropsRestProxy: () => eo,
	createRenderer: () => ts,
	createSSRApp: () => Bu,
	createSlots: () => Na,
	createStaticVNode: () => Hs,
	createTextVNode: () => K,
	createVNode: () => G,
	customRef: () => Fn,
	defineAsyncComponent: () => na,
	defineComponent: () => L,
	defineCustomElement: () => Bl,
	defineEmits: () => Ha,
	defineExpose: () => Ua,
	defineModel: () => Ka,
	defineOptions: () => Wa,
	defineProps: () => Va,
	defineSSRCustomElement: () => Vl,
	defineSlots: () => Ga,
	devtools: () => Ec,
	effect: () => ft,
	effectScope: () => Xe,
	getCurrentInstance: () => $s,
	getCurrentScope: () => Ze,
	getCurrentWatcher: () => Jn,
	getTransitionRawChildren: () => Si,
	guardReactiveProps: () => Bs,
	h: () => yc,
	handleError: () => or,
	hasInjectionContext: () => zr,
	hydrate: () => Ru,
	hydrateOnIdle: () => Yi,
	hydrateOnInteraction: () => $i,
	hydrateOnMediaQuery: () => Qi,
	hydrateOnVisible: () => Zi,
	initCustomFormatter: () => bc,
	initDirectivesForSSR: () => Wu,
	inject: () => Rr,
	isMemoSame: () => Sc,
	isProxy: () => xn,
	isReactive: () => vn,
	isReadonly: () => yn,
	isRef: () => En,
	isRuntimeOnly: () => fc,
	isShallow: () => bn,
	isVNode: () => Ps,
	markRaw: () => Cn,
	mergeDefaults: () => Qa,
	mergeModels: () => $a,
	mergeProps: () => Ks,
	nextTick: () => hr,
	nodeOps: () => Ic,
	normalizeClass: () => Pe,
	normalizeProps: () => Fe,
	normalizeStyle: () => ke,
	onActivated: () => sa,
	onBeforeMount: () => ha,
	onBeforeUnmount: () => ya,
	onBeforeUpdate: () => _a,
	onDeactivated: () => ca,
	onErrorCaptured: () => wa,
	onMounted: () => ga,
	onRenderTracked: () => Ca,
	onRenderTriggered: () => Sa,
	onScopeDispose: () => Qe,
	onServerPrefetch: () => xa,
	onUnmounted: () => ba,
	onUpdated: () => va,
	onWatcherCleanup: () => Yn,
	openBlock: () => V,
	patchProp: () => Il,
	popScopeId: () => Nr,
	provide: () => Lr,
	proxyRefs: () => Nn,
	pushScopeId: () => Mr,
	queuePostFlushCb: () => yr,
	reactive: () => pn,
	readonly: () => hn,
	ref: () => P,
	registerRuntimeCompiler: () => dc,
	render: () => Lu,
	renderList: () => R,
	renderSlot: () => z,
	resolveComponent: () => Da,
	resolveDirective: () => Aa,
	resolveDynamicComponent: () => ka,
	resolveFilter: () => null,
	resolveTransitionHooks: () => vi,
	setBlockTracking: () => Ms,
	setDevtoolsHook: () => Dc,
	setTransitionHooks: () => xi,
	shallowReactive: () => mn,
	shallowReadonly: () => gn,
	shallowRef: () => Dn,
	ssrContextKey: () => Br,
	ssrUtils: () => Oc,
	stop: () => pt,
	toDisplayString: () => j,
	toHandlerKey: () => xe,
	toHandlers: () => Fa,
	toRaw: () => Sn,
	toRef: () => zn,
	toRefs: () => In,
	toValue: () => jn,
	transformVNodeArgs: () => Is,
	triggerRef: () => An,
	unref: () => F,
	useAttrs: () => Ya,
	useCssModule: () => Kl,
	useCssVars: () => ul,
	useHost: () => Wl,
	useId: () => wi,
	useModel: () => So,
	useSSRContext: () => Vr,
	useShadowRoot: () => Gl,
	useSlots: () => Ja,
	useTemplateRef: () => Ei,
	useTransitionState: () => di,
	vModelCheckbox: () => hu,
	vModelDynamic: () => Cu,
	vModelRadio: () => _u,
	vModelSelect: () => vu,
	vModelText: () => mu,
	vShow: () => ol,
	version: () => Cc,
	warn: () => wc,
	watch: () => Gr,
	watchEffect: () => Hr,
	watchPostEffect: () => Ur,
	watchSyncEffect: () => Wr,
	withAsyncContext: () => to,
	withCtx: () => I,
	withDefaults: () => qa,
	withDirectives: () => Fr,
	withKeys: () => ju,
	withMemo: () => xc,
	withModifiers: () => ku,
	withScopeId: () => Pr
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
}), rb = $v({
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
}), ib = ey({ instances: Zv(rb).default([]) }), ab = $v({
	id: Ly,
	version: zy
}), ob = $v({
	ownerKey: Z().min(1),
	ownerLabel: Z(),
	ruleId: Ly,
	currentSaveId: Z().nullable(),
	enabledPacks: Zv(ab),
	data: ib,
	savedHash: Z(),
	schemaVersion: Vv().int(),
	updatedAt: By
}), sb = $v({
	partyNames: Zv(Z()).default([]),
	partyCount: Vv().int().nonnegative().default(0),
	location: Z().optional(),
	round: Vv().int().optional()
}), cb = cy([
	"读档前",
	"新存档前",
	"切换规则前",
	"恢复备份前",
	"改动模组前"
]), lb = $v({
	id: Z().min(1),
	ownerKey: Z().min(1),
	ownerLabel: Z(),
	ruleId: Ly,
	name: Z().min(1).max(80),
	note: Z().max(400).default(""),
	kind: cy(["manual", "auto"]),
	autoReason: cb.optional(),
	branchedFrom: Z().optional(),
	createdAt: By,
	updatedAt: By,
	deletedAt: By.optional(),
	summary: sb,
	packs: Zv(tb),
	snapshot: ib,
	hash: Z(),
	schemaVersion: Vv().int()
}), ub = $v({
	reminderDays: Vv().int().positive().default(7),
	reminderSaves: Vv().int().positive().default(10),
	catalogUrl: Z().default("https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json"),
	variantDefault: cy(["apply", "skip"]).default("apply")
}), db = $v({
	lastExportAt: By.nullable().default(null),
	savesSinceExport: Vv().int().nonnegative().default(0),
	persistRequested: Gv().default(!1),
	persistGranted: Gv().default(!1)
}), fb = 864e5;
function pb(e, t, n) {
	if (e.lastExportAt === null) return {
		kind: "never",
		daysSince: null,
		savesSince: e.savesSinceExport,
		text: "还没有导出过备份"
	};
	let r = Math.max(0, Math.floor((n - e.lastExportAt) / fb)), i = r >= t.reminderDays || e.savesSinceExport >= t.reminderSaves, a = r === 0 ? "今天" : `${r} 天前`, o = i ? `建议导出备份 · 上次完整备份：${a}，之后保存 ${e.savesSinceExport} 次` : `上次完整备份：${a} · 之后保存 ${e.savesSinceExport} 次`;
	return {
		kind: i ? "due" : "ok",
		daysSince: r,
		savesSince: e.savesSinceExport,
		text: o
	};
}
async function mb(e) {
	return db.parse(await e.getMeta("backup") ?? {});
}
async function hb(e) {
	return ub.parse(await e.getMeta("settings") ?? {});
}
async function gb(e, t) {
	let n = await mb(e);
	await e.setMeta("backup", {
		...n,
		lastExportAt: t,
		savesSinceExport: 0
	});
}
async function _b(e, t = globalThis.navigator?.storage) {
	let n = await mb(e);
	if (n.persistRequested) return n;
	let r = t?.persist ? await t.persist() : !1, i = {
		...n,
		persistRequested: !0,
		persistGranted: r
	};
	return await e.setMeta("backup", i), i;
}
// src/core/ids.ts
function vb() {
	let e = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(e), e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
	let t = Array.from(e, (e) => e.toString(16).padStart(2, "0"));
	return `${t.slice(0, 4).join("")}-${t.slice(4, 6).join("")}-${t.slice(6, 8).join("")}-${t.slice(8, 10).join("")}-${t.slice(10).join("")}`;
}
function yb(e) {
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
function bb(e) {
	let t = e, n = "";
	do
		n = String.fromCharCode(65 + t % 26) + n, t = Math.floor(t / 26) - 1;
	while (t >= 0);
	return n;
}
// src/core/packs/builtinFile.ts
var xb = { "dnd5e2014-srd": new URL("../packs/dnd5e2014-srd.trpgpack", "" + import.meta.url) };
async function Sb(e) {
	let t = xb[e];
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
function Cb(e) {
	return e?.name === "QuotaExceededError";
}
var wb = "存储空间不足：可以删除不用的内容包，或清空最近删除";
// src/core/semver.ts
function Tb(e) {
	let t = /^(\d+)\.(\d+)\.(\d+)$/.exec(e);
	if (!t) throw Error(`版本号格式不正确：${e}`);
	return [
		Number(t[1]),
		Number(t[2]),
		Number(t[3])
	];
}
function Eb(e, t) {
	let n = Tb(e), r = Tb(t);
	for (let e = 0; e < 3; e++) if (n[e] !== r[e]) return n[e] < r[e] ? -1 : 1;
	return 0;
}
function Db(e) {
	let [t, n, r] = Tb(e);
	return `${t}.${n}.${r + 1}`;
}
// node_modules/fflate/esm/browser.js
var Ob = Uint8Array, kb = Uint16Array, Ab = Int32Array, jb = new Ob([
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
]), Mb = new Ob([
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
]), Nb = new Ob([
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
]), Pb = function(e, t) {
	for (var n = new kb(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new Ab(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, Fb = Pb(jb, 2), Ib = Fb.b, Lb = Fb.r;
Ib[28] = 258, Lb[258] = 28;
for (var Rb = Pb(Mb, 0), zb = Rb.b, Bb = Rb.r, Vb = new kb(32768), Hb = 0; Hb < 32768; ++Hb) {
	var Ub = (Hb & 43690) >> 1 | (Hb & 21845) << 1;
	Ub = (Ub & 52428) >> 2 | (Ub & 13107) << 2, Ub = (Ub & 61680) >> 4 | (Ub & 3855) << 4, Vb[Hb] = ((Ub & 65280) >> 8 | (Ub & 255) << 8) >> 1;
}
for (var Wb = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new kb(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new kb(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new kb(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[Vb[d] >> c] = l;
	} else for (s = new kb(r), i = 0; i < r; ++i) e[i] && (s[i] = Vb[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), Gb = new Ob(288), Hb = 0; Hb < 144; ++Hb) Gb[Hb] = 8;
for (var Hb = 144; Hb < 256; ++Hb) Gb[Hb] = 9;
for (var Hb = 256; Hb < 280; ++Hb) Gb[Hb] = 7;
for (var Hb = 280; Hb < 288; ++Hb) Gb[Hb] = 8;
for (var Kb = new Ob(32), Hb = 0; Hb < 32; ++Hb) Kb[Hb] = 5;
var qb = /*#__PURE__*/ Wb(Gb, 9, 0), Jb = /*#__PURE__*/ Wb(Gb, 9, 1), Yb = /*#__PURE__*/ Wb(Kb, 5, 0), Xb = /*#__PURE__*/ Wb(Kb, 5, 1), Zb = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, Qb = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, $b = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, ex = function(e) {
	return (e + 7) / 8 | 0;
}, tx = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new Ob(e.subarray(t, n));
}, nx = [
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
], rx = function(e, t, n) {
	var r = Error(t || nx[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, rx), !n) throw r;
	return r;
}, ix = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new Ob(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new Ob(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new Ob(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = Qb(e, d, 1);
			var v = Qb(e, d + 1, 3);
			if (d += 3, !v) {
				var y = ex(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && rx(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = Jb, m = Xb, h = 9, g = 5;
			else if (v == 2) {
				var S = Qb(e, d, 31) + 257, C = Qb(e, d + 10, 15) + 4, w = S + Qb(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new Ob(w), ee = new Ob(19), E = 0; E < C; ++E) ee[Nb[E]] = Qb(e, d + E * 3, 7);
				d += C * 3;
				for (var D = Zb(ee), O = (1 << D) - 1, te = Wb(ee, D, 1), E = 0; E < w;) {
					var ne = te[Qb(e, d, O)];
					d += ne & 15;
					var y = ne >> 4;
					if (y < 16) T[E++] = y;
					else {
						var re = 0, ie = 0;
						for (y == 16 ? (ie = 3 + Qb(e, d, 3), d += 2, re = T[E - 1]) : y == 17 ? (ie = 3 + Qb(e, d, 7), d += 3) : y == 18 && (ie = 11 + Qb(e, d, 127), d += 7); ie--;) T[E++] = re;
					}
				}
				var k = T.subarray(0, S), ae = T.subarray(S);
				h = Zb(k), g = Zb(ae), p = Wb(k, h, 1), m = Wb(ae, g, 1);
			} else rx(1);
			if (d > _) {
				c && rx(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var oe = (1 << h) - 1, se = (1 << g) - 1, ce = d;; ce = d) {
			var re = p[$b(e, d) & oe], le = re >> 4;
			if (d += re & 15, d > _) {
				c && rx(0);
				break;
			}
			if (re || rx(2), le < 256) n[f++] = le;
			else if (le == 256) {
				ce = d, p = null;
				break;
			} else {
				var ue = le - 254;
				if (le > 264) {
					var E = le - 257, de = jb[E];
					ue = Qb(e, d, (1 << de) - 1) + Ib[E], d += de;
				}
				var fe = m[$b(e, d) & se], pe = fe >> 4;
				fe || rx(3), d += fe & 15;
				var ae = zb[pe];
				if (pe > 3) {
					var de = Mb[pe];
					ae += $b(e, d) & (1 << de) - 1, d += de;
				}
				if (d > _) {
					c && rx(0);
					break;
				}
				s && l(f + 131072);
				var me = f + ue;
				if (f < ae) {
					var he = a - ae, ge = Math.min(ae, me);
					for (he + f < 0 && rx(3); f < ge; ++f) n[f] = r[he + f];
				}
				for (; f < me; ++f) n[f] = n[f - ae];
			}
		}
		t.l = p, t.p = ce, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? tx(n, 0, f) : n.subarray(0, f);
}, ax = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8;
}, ox = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, sx = function(e, t) {
	for (var n = [], r = 0; r < e.length; ++r) e[r] && n.push({
		s: r,
		f: e[r]
	});
	var i = n.length, a = n.slice();
	if (!i) return {
		t: mx,
		l: 0
	};
	if (i == 1) {
		var o = new Ob(n[0].s + 1);
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
	var p = new kb(f + 1), m = cx(n[u - 1], p, 0);
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
		t: new Ob(p),
		l: m
	};
}, cx = function(e, t, n) {
	return e.s == -1 ? Math.max(cx(e.l, t, n + 1), cx(e.r, t, n + 1)) : t[e.s] = n;
}, lx = function(e) {
	for (var t = e.length; t && !e[--t];);
	for (var n = new kb(++t), r = 0, i = e[0], a = 1, o = function(e) {
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
}, ux = function(e, t) {
	for (var n = 0, r = 0; r < t.length; ++r) n += e[r] * t[r];
	return n;
}, dx = function(e, t, n) {
	var r = n.length, i = ex(t + 2);
	e[i] = r & 255, e[i + 1] = r >> 8, e[i + 2] = e[i] ^ 255, e[i + 3] = e[i + 1] ^ 255;
	for (var a = 0; a < r; ++a) e[i + a + 4] = n[a];
	return (i + 4 + r) * 8;
}, fx = function(e, t, n, r, i, a, o, s, c, l, u) {
	ax(t, u++, n), ++i[256];
	for (var d = sx(i, 15), f = d.t, p = d.l, m = sx(a, 15), h = m.t, g = m.l, _ = lx(f), v = _.c, y = _.n, b = lx(h), x = b.c, S = b.n, C = new kb(19), w = 0; w < v.length; ++w) ++C[v[w] & 31];
	for (var w = 0; w < x.length; ++w) ++C[x[w] & 31];
	for (var T = sx(C, 7), ee = T.t, E = T.l, D = 19; D > 4 && !ee[Nb[D - 1]]; --D);
	var O = l + 5 << 3, te = ux(i, Gb) + ux(a, Kb) + o, ne = ux(i, f) + ux(a, h) + o + 14 + 3 * D + ux(C, ee) + 2 * C[16] + 3 * C[17] + 7 * C[18];
	if (c >= 0 && O <= te && O <= ne) return dx(t, u, e.subarray(c, c + l));
	var re, ie, k, ae;
	if (ax(t, u, 1 + (ne < te)), u += 2, ne < te) {
		re = Wb(f, p, 0), ie = f, k = Wb(h, g, 0), ae = h;
		var oe = Wb(ee, E, 0);
		ax(t, u, y - 257), ax(t, u + 5, S - 1), ax(t, u + 10, D - 4), u += 14;
		for (var w = 0; w < D; ++w) ax(t, u + 3 * w, ee[Nb[w]]);
		u += 3 * D;
		for (var se = [v, x], ce = 0; ce < 2; ++ce) for (var le = se[ce], w = 0; w < le.length; ++w) {
			var ue = le[w] & 31;
			ax(t, u, oe[ue]), u += ee[ue], ue > 15 && (ax(t, u, le[w] >> 5 & 127), u += le[w] >> 12);
		}
	} else re = qb, ie = Gb, k = Yb, ae = Kb;
	for (var w = 0; w < s; ++w) {
		var de = r[w];
		if (de > 255) {
			var ue = de >> 18 & 31;
			ox(t, u, re[ue + 257]), u += ie[ue + 257], ue > 7 && (ax(t, u, de >> 23 & 31), u += jb[ue]);
			var fe = de & 31;
			ox(t, u, k[fe]), u += ae[fe], fe > 3 && (ox(t, u, de >> 5 & 8191), u += Mb[fe]);
		} else ox(t, u, re[de]), u += ie[de];
	}
	return ox(t, u, re[256]), u + ie[256];
}, px = /*#__PURE__*/ new Ab([
	65540,
	131080,
	131088,
	131104,
	262176,
	1048704,
	1048832,
	2114560,
	2117632
]), mx = /*#__PURE__*/ new Ob(0), hx = function(e, t, n, r, i, a) {
	var o = a.z || e.length, s = new Ob(r + o + 5 * (1 + Math.ceil(o / 7e3)) + i), c = s.subarray(r, s.length - i), l = a.l, u = (a.r || 0) & 7;
	if (t) {
		u && (c[0] = a.r >> 3);
		for (var d = px[t - 1], f = d >> 13, p = d & 8191, m = (1 << n) - 1, h = a.p || new kb(32768), g = a.h || new kb(m + 1), _ = Math.ceil(n / 3), v = 2 * _, y = function(t) {
			return (e[t] ^ e[t + 1] << _ ^ e[t + 2] << v) & m;
		}, b = new Ab(25e3), x = new kb(288), S = new kb(32), C = 0, w = 0, T = a.i || 0, ee = 0, E = a.w || 0, D = 0; T + 2 < o; ++T) {
			var O = y(T), te = T & 32767, ne = g[O];
			if (h[te] = ne, g[O] = te, E <= T) {
				var re = o - T;
				if ((C > 7e3 || ee > 24576) && (re > 423 || !l)) {
					u = fx(e, c, 0, b, x, S, w, ee, D, T - D, u), ee = C = w = 0, D = T;
					for (var ie = 0; ie < 286; ++ie) x[ie] = 0;
					for (var ie = 0; ie < 30; ++ie) S[ie] = 0;
				}
				var k = 2, ae = 0, oe = p, se = te - ne & 32767;
				if (re > 2 && O == y(T - se)) for (var ce = Math.min(f, re) - 1, le = Math.min(32767, T), ue = Math.min(258, re); se <= le && --oe && te != ne;) {
					if (e[T + k] == e[T + k - se]) {
						for (var de = 0; de < ue && e[T + de] == e[T + de - se]; ++de);
						if (de > k) {
							if (k = de, ae = se, de > ce) break;
							for (var fe = Math.min(se, de - 2), pe = 0, ie = 0; ie < fe; ++ie) {
								var me = T - se + ie & 32767, he = me - h[me] & 32767;
								he > pe && (pe = he, ne = me);
							}
						}
					}
					te = ne, ne = h[te], se += te - ne & 32767;
				}
				if (ae) {
					b[ee++] = 268435456 | Lb[k] << 18 | Bb[ae];
					var ge = Lb[k] & 31, _e = Bb[ae] & 31;
					w += jb[ge] + Mb[_e], ++x[257 + ge], ++S[_e], E = T + k, ++C;
				} else b[ee++] = e[T], ++x[e[T]];
			}
		}
		for (T = Math.max(T, E); T < o; ++T) b[ee++] = e[T], ++x[e[T]];
		u = fx(e, c, l, b, x, S, w, ee, D, T - D, u), l || (a.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, a.h = g, a.p = h, a.i = T, a.w = E);
	} else {
		for (var T = a.w || 0; T < o + l; T += 65535) {
			var ve = T + 65535;
			ve >= o && (c[u / 8 | 0] = l, ve = o), u = dx(c, u + 1, e.subarray(T, ve));
		}
		a.i = o;
	}
	return tx(s, 0, r + ex(u) + i);
}, gx = /*#__PURE__*/ (function() {
	for (var e = /* @__PURE__ */ new Int32Array(256), t = 0; t < 256; ++t) {
		for (var n = t, r = 9; --r;) n = (n & 1 && -306674912) ^ n >>> 1;
		e[t] = n;
	}
	return e;
})(), _x = function() {
	var e = -1;
	return {
		p: function(t) {
			for (var n = e, r = 0; r < t.length; ++r) n = gx[n & 255 ^ t[r]] ^ n >>> 8;
			e = n;
		},
		d: function() {
			return ~e;
		}
	};
}, vx = function(e, t, n, r, i) {
	if (!i && (i = { l: 1 }, t.dictionary)) {
		var a = t.dictionary.subarray(-32768), o = new Ob(a.length + e.length);
		o.set(a), o.set(e, a.length), e = o, i.w = a.length;
	}
	return hx(e, t.level == null ? 6 : t.level, t.mem == null ? i.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, i);
}, yx = function(e, t) {
	var n = {};
	for (var r in e) n[r] = e[r];
	for (var r in t) n[r] = t[r];
	return n;
}, bx = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, xx = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, Sx = function(e, t) {
	return xx(e, t) + xx(e, t + 4) * 4294967296;
}, Cx = function(e, t, n) {
	for (; n; ++t) e[t] = n, n >>>= 8;
};
function wx(e, t) {
	return vx(e, t || {}, 0, 0);
}
function Tx(e, t) {
	return ix(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var Ex = function(e, t, n, r) {
	for (var i in e) {
		var a = e[i], o = t + i, s = r;
		Array.isArray(a) && (s = yx(r, a[1]), a = a[0]), ArrayBuffer.isView(a) ? n[o] = [a, s] : (n[o += "/"] = [new Ob(0), s], Ex(a, o, n, r));
	}
}, Dx = typeof TextEncoder < "u" && /*#__PURE__*/ new TextEncoder(), Ox = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	Ox.decode(mx, { stream: !0 });
} catch {}
var kx = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: tx(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function Ax(e, t) {
	if (t) {
		for (var n = new Ob(e.length), r = 0; r < e.length; ++r) n[r] = e.charCodeAt(r);
		return n;
	}
	if (Dx) return Dx.encode(e);
	for (var i = e.length, a = new Ob(e.length + (e.length >> 1)), o = 0, s = function(e) {
		a[o++] = e;
	}, r = 0; r < i; ++r) {
		if (o + 5 > a.length) {
			var c = new Ob(o + 8 + (i - r << 1));
			c.set(a), a = c;
		}
		var l = e.charCodeAt(r);
		l < 128 || t ? s(l) : l < 2048 ? (s(192 | l >> 6), s(128 | l & 63)) : l > 55295 && l < 57344 ? (l = 65536 + (l & 1047552) | e.charCodeAt(++r) & 1023, s(240 | l >> 18), s(128 | l >> 12 & 63), s(128 | l >> 6 & 63), s(128 | l & 63)) : (s(224 | l >> 12), s(128 | l >> 6 & 63), s(128 | l & 63));
	}
	return tx(a, 0, o);
}
function jx(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	}
	if (Ox) return Ox.decode(e);
	var i = kx(e), a = i.s, n = i.r;
	return n.length && rx(8), a;
}
var Mx = function(e, t) {
	return t + 30 + bx(e, t + 26) + bx(e, t + 28);
}, Nx = function(e, t, n) {
	var r = bx(e, t + 28), i = bx(e, t + 30), a = jx(e.subarray(t + 46, t + 46 + r), !(bx(e, t + 8) & 2048)), o = t + 46 + r, s = Px(e, o, i, n, xx(e, t + 20), xx(e, t + 24), xx(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		bx(e, t + 10),
		c,
		l,
		a,
		o + i + bx(e, t + 32),
		u
	];
}, Px = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + bx(e, t + 2)) if (bx(e, t) == 1) return [
			s ? Sx(e, t + 4 + 8 * c) : i,
			c ? Sx(e, t + 4) : a,
			l ? Sx(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && rx(13);
	}
	return [
		i,
		a,
		o,
		0
	];
}, Fx = function(e) {
	var t = 0;
	if (e) for (var n in e) {
		var r = e[n].length;
		r > 65535 && rx(9), t += r + 4;
	}
	return t;
}, Ix = function(e, t, n, r, i, a, o, s) {
	var c = r.length, l = n.extra, u = s && s.length, d = Fx(l);
	Cx(e, t, o == null ? 67324752 : 33639248), t += 4, o != null && (e[t++] = 20, e[t++] = n.os), e[t] = 20, t += 2, e[t++] = n.flag << 1 | (a < 0 && 8), e[t++] = i && 8, e[t++] = n.compression & 255, e[t++] = n.compression >> 8;
	var f = new Date(n.mtime == null ? Date.now() : n.mtime), p = f.getFullYear() - 1980;
	if ((p < 0 || p > 119) && rx(10), Cx(e, t, p << 25 | f.getMonth() + 1 << 21 | f.getDate() << 16 | f.getHours() << 11 | f.getMinutes() << 5 | f.getSeconds() >> 1), t += 4, a != -1 && (Cx(e, t, n.crc), Cx(e, t + 4, a < 0 ? -a - 2 : a), Cx(e, t + 8, n.size)), Cx(e, t + 12, c), Cx(e, t + 14, d), t += 16, o != null && (Cx(e, t, u), Cx(e, t + 6, n.attrs), Cx(e, t + 10, o), t += 14), e.set(r, t), t += c, d) for (var m in l) {
		var h = l[m], g = h.length;
		Cx(e, t, +m), Cx(e, t + 2, g), e.set(h, t + 4), t += 4 + g;
	}
	return u && (e.set(s, t), t += u), t;
}, Lx = function(e, t, n, r, i) {
	Cx(e, t, 101010256), Cx(e, t + 8, n), Cx(e, t + 10, n), Cx(e, t + 12, r), Cx(e, t + 16, i);
};
function Rx(e, t) {
	t ||= {};
	var n = {}, r = [];
	Ex(e, "", n, t);
	var i = 0, a = 0;
	for (var o in n) {
		var s = n[o], c = s[0], l = s[1], u = l.level == 0 ? 0 : 8, d = Ax(o), f = d.length, p = l.comment, m = p && Ax(p), h = m && m.length, g = Fx(l.extra);
		f > 65535 && rx(11);
		var _ = u ? wx(c, l) : c, v = _.length, y = _x();
		y.p(c), r.push(yx(l, {
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
	for (var b = new Ob(a + 22), x = i, S = a - i, C = 0; C < r.length; ++C) {
		var d = r[C];
		Ix(b, d.o, d, d.f, d.u, d.c.length);
		var w = 30 + d.f.length + Fx(d.extra);
		b.set(d.c, d.o + w), Ix(b, i, d, d.f, d.u, d.c.length, d.o, d.m), i += 16 + w + (d.m ? d.m.length : 0);
	}
	return Lx(b, i, r.length, S, x), b;
}
function zx(e, t) {
	for (var n = {}, r = e.length - 22; xx(e, r) != 101010256; --r) (!r || e.length - r > 65558) && rx(13);
	var i = bx(e, r + 8);
	if (!i) return {};
	var a = xx(e, r + 16), o = xx(e, r - 20) == 117853008;
	if (o) {
		var s = xx(e, r - 12);
		o = xx(e, s) == 101075792, o && (i = xx(e, s + 32), a = xx(e, s + 48));
	}
	for (var c = t && t.filter, l = 0; l < i; ++l) {
		var u = Nx(e, a, o), d = u[0], f = u[1], p = u[2], m = u[3], h = u[4], g = u[5], _ = Mx(e, g);
		a = h, (!c || c({
			name: m,
			size: f,
			originalSize: p,
			compression: d
		})) && (d ? d == 8 ? n[m] = Tx(e.subarray(_, _ + f), { out: new Ob(p) }) : rx(14, "unknown compression type " + d) : n[m] = tx(e, _, _ + f));
	}
	return n;
}
// node_modules/@noble/hashes/_u64.js
var Bx = (e) => e / 2 ** 32 | 0, Vx = (e) => e >>> 0;
function Hx(e, t, n, r) {
	let i = Bx(n), a = Vx(n);
	e.setUint32(t, r ? a : i, r), e.setUint32(t + 4, r ? i : a, r);
}
// node_modules/@noble/hashes/utils.js
function Ux(e) {
	return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
var Wx = (e) => e ? `"${e}" ` : "";
function Gx(e, t = "") {
	if (typeof e != "number") throw TypeError(Wx(t) + "expected number, got " + typeof e);
	if (!Number.isSafeInteger(e) || e < 0) throw RangeError(Wx(t) + "expected integer >= 0, got " + e);
	return e;
}
function Kx(e, t, n = "") {
	if (Ux(e) && (t === void 0 || e.length === t)) return e;
	t !== void 0 && Gx(t, "length");
	let r = Ux(e), i = t === void 0 ? "" : ` of length ${t}`, a = r ? `length=${e.length}` : `type=${typeof e}`, o = Wx(n) + "expected Uint8Array" + i + ", got " + a;
	throw r ? RangeError(o) : TypeError(o);
}
var qx = (e, t) => {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError((t === "object" ? "" : `"${t}" `) + "expected object, got type=" + typeof e);
}, Jx = (e, t) => {
	qx(e, t);
	let n = Object.getPrototypeOf(e);
	if (n !== Object.prototype && n !== null) throw TypeError(`"${t}" expected plain object`);
	if (Object.hasOwn(e, "__proto__")) throw TypeError(`"${t}.__proto__" is not allowed`);
};
function Yx(e, t = !0) {
	if (e.destroyed) throw Error("hash was destroyed");
	if (t && e.finished) throw Error("digest() was already called");
}
function Xx(e, t) {
	Kx(e, void 0, "output");
	let n = t.outputLen;
	if (!(e.length >= n)) throw RangeError("\"output\" expected length >= " + n);
}
function Zx(...e) {
	for (let t = 0; t < e.length; t++) e[t].fill(0);
}
function Qx(e) {
	return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function $x(e, t) {
	return e << 32 - t | e >>> t;
}
var eS = typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", tS = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function nS(e) {
	if (Kx(e), eS) return e.toHex();
	let t = "";
	for (let n = 0; n < e.length; n++) t += tS[e[n]];
	return t;
}
function rS(e) {
	if (typeof e != "string") throw TypeError("string expected");
	let t = new TextEncoder().encode(e);
	try {
		return new Uint8Array(t);
	} finally {
		Zx(t);
	}
}
function iS(e, t, n = "opts") {
	return Jx(e, "defaults"), t !== void 0 && Jx(t, n), Object.assign(Object.create(null), e, t);
}
function aS(e, t = {}) {
	if (typeof e != "function") throw TypeError("\"hashCons\" expected function, got type=" + typeof e);
	t = iS({}, t, "info");
	let n = (t, n) => e(n).update(t).digest(), r = e(void 0);
	return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.canXOF = r.canXOF, n.create = (t) => e(t), Object.assign(n, t), Object.freeze(n);
}
var oS = (e) => ({ oid: Uint8Array.from([
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
function sS(e, t, n) {
	return e & t ^ ~e & n;
}
function cS(e, t, n) {
	return e & t ^ e & n ^ t & n;
}
var lS = class {
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
		this.blockLen = e, this.outputLen = t, this.padOffset = n, this.isLE = r, this.buffer = new Uint8Array(e), this.view = Qx(this.buffer);
	}
	update(e) {
		Yx(this), Kx(e);
		let { view: t, buffer: n, blockLen: r } = this, i = e.length, a = !1;
		for (let o = 0; o < i;) {
			let s = Math.min(r - this.pos, i - o);
			if (s === r) {
				let t = Qx(e);
				for (; r <= i - o; o += r) this.process(t, o);
				a = !0;
			} else n.set(o === 0 && s === i ? e : e.subarray(o, o + s), this.pos), this.pos += s, o += s, this.pos === r && (this.process(t, 0), this.pos = 0, a = !0);
		}
		return this.length += e.length, a && this.roundClean(), this;
	}
	digestInto(e) {
		Yx(this), Xx(e, this), this.finished = !0;
		let { buffer: t, view: n, blockLen: r, isLE: i } = this, { pos: a } = this;
		t[a++] = 128, t.fill(0, a), this.padOffset > r - a && (this.process(n, 0), t.fill(0)), Hx(n, r - 8, this.length * 8, i), this.process(n, 0), this.roundClean();
		let o = e === t ? n : Qx(e), s = this.outputLen, c = s / 4, l = this.get();
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
}, uS = /* @__PURE__ */ Uint32Array.from([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]), dS = /* @__PURE__ */ Uint32Array.from([
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
]), fS = /* @__PURE__ */ new Uint32Array(64), pS = class extends lS {
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
		for (let n = 0; n < 16; n++, t += 4) fS[n] = e.getUint32(t, !1);
		for (let e = 16; e < 64; e++) {
			let t = fS[e - 15], n = fS[e - 2], r = $x(t, 7) ^ $x(t, 18) ^ t >>> 3, i = $x(n, 17) ^ $x(n, 19) ^ n >>> 10;
			fS[e] = i + fS[e - 7] + r + fS[e - 16] | 0;
		}
		let { A: n, B: r, C: i, D: a, E: o, F: s, G: c, H: l } = this;
		for (let e = 0; e < 64; e++) {
			let t = $x(o, 6) ^ $x(o, 11) ^ $x(o, 25), u = l + t + sS(o, s, c) + dS[e] + fS[e] | 0, d = ($x(n, 2) ^ $x(n, 13) ^ $x(n, 22)) + cS(n, r, i) | 0;
			l = c, c = s, s = o, o = a + u | 0, a = i, i = r, r = n, n = u + d | 0;
		}
		n = n + this.A | 0, r = r + this.B | 0, i = i + this.C | 0, a = a + this.D | 0, o = o + this.E | 0, s = s + this.F | 0, c = c + this.G | 0, l = l + this.H | 0, this.set(n, r, i, a, o, s, c, l);
	}
	roundClean() {
		Zx(fS);
	}
	destroy() {
		this.destroyed = !0, this.set(0, 0, 0, 0, 0, 0, 0, 0), Zx(this.buffer);
	}
}, mS = class extends pS {
	constructor() {
		super(32, uS);
	}
}, hS = /* @__PURE__ */ aS(() => new mS(), /* @__PURE__ */ oS(1));
// src/core/hash.ts
function gS(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e) ?? "null";
	if (Array.isArray(e)) return `[${e.map((e) => gS(e === void 0 ? null : e)).join(",")}]`;
	let t = e;
	return `{${Object.keys(t).filter((e) => t[e] !== void 0).sort().map((e) => `${JSON.stringify(e)}:${gS(t[e])}`).join(",")}}`;
}
function _S(e) {
	return nS(hS(typeof e == "string" ? rS(e) : e));
}
function vS(e) {
	return _S(gS(e));
}
// src/core/migrate.ts
var yS = {
	workspace: {},
	save: {},
	pack: {}
}, bS = "这个存档由更新版本的扩展创建，请先更新扩展";
function xS(e, t, n = {}) {
	let r = n.current ?? Iy[e], i = n.migrations ?? yS[e], a = Number(t.schemaVersion);
	if (!Number.isInteger(a) || a < 0) throw new Q("E_BAD_VERSION", "文件内容损坏：缺少有效的版本号");
	if (a > r) throw new Q("E_NEWER_DATA", bS, {
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
var SS = $v({
	book: Z().min(1).max(20),
	page: Vv().int().nonnegative()
}), CS = cy([
	"不全书",
	"共库",
	"共库机翻",
	"dnd-data",
	"本项目"
]), wS = cy([
	"GPL-3.0",
	"CC-BY-NC-SA-4.0",
	"CC-BY-4.0",
	"MIT"
]), TS = {
	不全书: "GPL-3.0",
	共库: "CC-BY-NC-SA-4.0",
	共库机翻: "CC-BY-NC-SA-4.0",
	"dnd-data": "MIT",
	本项目: "CC-BY-NC-SA-4.0"
}, ES = $v({
	by: CS,
	license: wS,
	machine: Gv().default(!1),
	missing: Zv(Z()).default([]),
	srd: Gv().default(!1)
}).superRefine((e, t) => {
	TS[e.by] !== e.license && t.addIssue({
		code: "custom",
		path: ["license"],
		message: `credit.by 为 ${e.by} 时许可必须是 ${TS[e.by]}`
	}), e.by !== "共库机翻" && e.machine && t.addIssue({
		code: "custom",
		path: ["machine"],
		message: "只有「共库机翻」可以标记为机翻"
	});
}), DS = ey({
	kind: Z().min(1).max(40),
	id: Ry,
	name: Z().min(1).max(200),
	description: Zv(Vy).default([]),
	dmSecret: Zv(Vy).default([]),
	keywords: Zv(Z()).default([]),
	src: SS.optional(),
	credit: ES.optional(),
	data: oy(Z(), qv()).default({})
}), OS = ey({
	name: Z().min(1),
	dmNotes: Zv(Vy).optional(),
	itemIds: Zv(Ry).default([])
}), kS = ey({
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
	chapters: Zv(OS).default([]),
	itemIds: Zv(Ry).default([])
}), AS = ey({
	cover: Uy.optional(),
	description: Z().default(""),
	adventures: Zv(kS),
	shared: Zv(Ry).default([])
}), jS = $v({ items: Zv(DS).default([]) }), MS = [
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
function NS(e) {
	return MS.find((t) => t.test(e))?.mime;
}
function PS(e, t) {
	if (t.length > 10485760) throw new Q("E_BAD_CONTENT", `文件内容损坏：图片「${e}」过大`);
	let n = NS(t);
	if (!n) throw new Q("E_BAD_CONTENT", `文件内容损坏：图片「${e}」不合法`);
	return n;
}
// src/core/packs/manifest.ts
function FS(e) {
	return e?.path.map(String).join(".") || "整体";
}
function IS(e) {
	return _S(new TextEncoder().encode(`trpg-pack-lineage:${e}`)).slice(0, 32);
}
function LS(e, t) {
	let n = { ...e };
	t <= 1 && (n.category = n.kind === "module" ? "adventure" : "rules", n.relationships = {
		requires: Array.isArray(n.dependsOn) ? n.dependsOn : [],
		recommends: [],
		conflicts: []
	}, delete n.kind, delete n.dependsOn), typeof n.lineage == "string" && n.lineage || (n.lineage = IS(String(n.id))), n.blobs = Array.isArray(n.blobs) ? n.blobs : [], n.contributes = n.contributes ?? {}, n.relationships = n.relationships ?? {
		requires: [],
		recommends: [],
		conflicts: []
	}, n.dataVersion = n.dataVersion ?? 1;
	let r = Xy.safeParse(n);
	if (!r.success) throw new Q("E_BAD_CONTENT", `文件内容损坏：说明文件的 ${FS(r.error.issues[0])} 不合法`);
	return r.data;
}
var RS = /^[a-z0-9/._-]+$/, zS = /\.(?:js|mjs|html?|svg)$/i, BS = /* @__PURE__ */ new Set([
	"trpg-manifest.json",
	"entries",
	"features",
	"adventure",
	"blobs"
]), VS = /* @__PURE__ */ new Set([
	"trpg-manifest.json",
	"entries",
	"assets"
]);
function HS(e) {
	return e.includes("/") ? e.slice(0, e.indexOf("/")) : e;
}
function US(e, t, n) {
	let r = 0;
	for (let i of e) {
		if (r += t[i].length, i.startsWith("/") || i.includes("\\") || i.split("/").includes("..") || !RS.test(i)) throw new Q("E_BAD_CONTENT", "文件内容损坏：包含不合法的路径");
		if (zS.test(i)) throw new Q("E_FORBIDDEN_FILE", `不能安装：包里含有不允许的文件「${i}」`);
		let e = n <= 1 ? VS : BS, a = HS(i);
		if (!e.has(a)) throw new Q("E_FORBIDDEN_FILE", `不能安装：包里含有不允许的文件「${i}」`);
	}
	if (e.length > 2e4 || r > 268435456) throw new Q("E_TOO_LARGE", "文件过大或文件数过多，无法导入");
}
// src/core/packs/refs.ts
function WS(e, t = /* @__PURE__ */ new Set()) {
	if (Array.isArray(e)) for (let n of e) WS(n, t);
	else if (e && typeof e == "object") {
		let n = e;
		typeof n.$asset == "string" && t.add(n.$asset);
		for (let e of Object.values(n)) WS(e, t);
	}
	return t;
}
function GS(e, t = []) {
	if (Array.isArray(e)) for (let n of e) GS(n, t);
	else if (e && typeof e == "object") {
		let n = e;
		typeof n.$ref == "string" && t.push(n);
		for (let e of Object.values(n)) GS(e, t);
	}
	return t;
}
function KS(e) {
	return new Q("E_BAD_CONTENT", `文件内容损坏：${e}`);
}
function qS(e) {
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
			if (!n || typeof n.packId != "string" || typeof n.entryId != "string") throw KS(`「${e.name}」的修改目标不合法`);
			if (!u.has(n.packId)) throw KS(`「${e.name}」修改的条目所在的包未声明为依赖`);
			let r = `${n.packId}\u0000${n.entryId}`;
			if (f.has(r)) throw KS(`「${e.name}」修改的条目被修改了两次`);
			f.add(r);
		}
	}
	let p = [
		n.map((e) => e.data),
		r,
		i
	];
	for (let e of GS(p)) {
		let n = e.$ref;
		if (n === "item" || n === "local") {
			if (typeof e.id != "string" || !o.has(e.id)) throw KS(`「${String(e.id ?? "")}」引用了不存在的内容`);
		} else if (n === "ext") {
			let t = typeof e.id == "string" ? e.id : "", n = typeof e.lineage == "string" ? e.lineage : "";
			if (!c.has(t) && !l.has(`${n}\u0000${t}`)) throw KS(`「${t}」引用了不存在的内容`);
		} else if (n === "pack") {
			if (typeof e.packId != "string" || !(e.packId === t.id || u.has(e.packId))) throw KS(`「${String(e.entryId ?? "")}」引用了不存在的包`);
		} else throw KS(`未知的引用类型「${String(n)}」`);
		d++;
	}
	for (let e of WS(p)) if (!a.has(e)) throw KS(`缺少图片「${e.slice(0, 12)}」`);
	return { softRefs: d };
}
// src/core/packs/zip.ts
function JS(e) {
	try {
		return zx(e);
	} catch {
		throw new Q("E_NOT_ZIP", "无法识别：这不是 TRPG 跑团助手的文件");
	}
}
function YS(e) {
	let t = {};
	for (let n of Object.keys(e).sort()) {
		let r = e[n];
		t[n] = typeof r == "string" ? Ax(r) : r;
	}
	return Rx(t, {
		level: 6,
		mtime: new Date(1980, 0, 1, 0, 0, 0)
	});
}
function XS(e, t) {
	let n = e[t];
	if (n) try {
		return JSON.parse(jx(n));
	} catch {
		throw new Q("E_BAD_CONTENT", `文件内容损坏：${t} 无法解析`);
	}
}
// src/core/packs/recognize.ts
function ZS(e) {
	return new Q("E_BAD_CONTENT", `文件内容损坏：${e}`);
}
function QS(e) {
	return Object.keys(e).filter((e) => !e.endsWith("/"));
}
function $S(e) {
	let t = [], n = QS(e).filter((e) => e.startsWith("entries/") && e.endsWith(".json")).sort();
	for (let r of n) {
		let n = XS(e, r);
		if (!Array.isArray(n)) throw ZS(`${r} 不是条目列表`);
		for (let e of n) {
			let n = Qy.safeParse(e);
			if (!n.success) {
				let r = e?.name;
				throw ZS(`第 ${t.length + 1} 项「${typeof r == "string" ? r : "未命名"}」的 ${FS(n.error.issues[0])} 不合法`);
			}
			t.push(n.data);
		}
	}
	return t;
}
function eC(e) {
	let t = [];
	for (let n of QS(e).filter((e) => e.startsWith("features/") && e.endsWith(".json")).sort()) {
		let r = XS(e, n);
		if (!Array.isArray(r)) throw ZS(`${n} 不是功能列表`);
		for (let e of r) {
			let r = e;
			if (!r || typeof r.id != "string" || typeof r.kind != "string" || typeof r.name != "string" || typeof r.data != "object" || r.data === null) throw ZS(`${n} 的功能定义不合法`);
			t.push({
				defaultEnabled: !1,
				description: "",
				...r
			});
		}
	}
	return t;
}
function tC(e) {
	let t = {};
	for (let n of QS(e).filter((e) => e.startsWith("adventure/") && e.endsWith(".json")).sort()) {
		if (n === "adventure/fallback.json") continue;
		let r = XS(e, n);
		if (n === "adventure/adventure.json") {
			let e = AS.safeParse(r);
			if (!e.success) throw ZS(`adventure/adventure.json 的 ${FS(e.error.issues[0])} 不合法`);
			t[n] = e.data;
		} else {
			let e = DS.array().safeParse(r);
			if (!e.success) throw ZS(`${n} 的 ${FS(e.error.issues[0])} 不合法`);
			t[n] = e.data;
		}
	}
	let n = XS(e, "adventure/fallback.json"), r = [];
	if (n !== void 0) {
		let e = jS.safeParse(n);
		if (!e.success) throw ZS(`adventure/fallback.json 的 ${FS(e.error.issues[0])} 不合法`);
		r = e.data.items;
	}
	return {
		adventure: t,
		fallback: r
	};
}
function nC(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	if (t >= 2) {
		for (let t of QS(e).filter((e) => e.startsWith("blobs/"))) {
			let n = t.slice(6);
			if (!/^[a-f0-9]{64}$/.test(n)) throw ZS(`图片「${n}」的文件名不是哈希`);
			let i = e[t];
			if (_S(i) !== n) throw ZS(`图片「${n.slice(0, 12)}」的哈希不一致`);
			let a = PS(n, i);
			r.set(n, {
				hash: n,
				mime: a,
				size: i.length,
				bytes: i
			});
		}
		if (n.blobs.length !== r.size) throw ZS("缺少图片或图片清单不一致");
		for (let e of n.blobs) {
			let t = r.get(e.hash);
			if (!t) throw ZS(`缺少图片「${e.hash.slice(0, 12)}」`);
			if (t.size !== e.size || t.mime !== e.mime) throw ZS(`图片「${e.hash.slice(0, 12)}」与清单不一致`);
		}
	}
	return r;
}
function rC(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let t of QS(e).filter((e) => e.startsWith("assets/"))) {
		let i = t.slice(7), a = e[t], o = _S(a);
		if (r.set(i, o), !n.has(o)) {
			let e = PS(i, a);
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
function iC(e, t, n, r, i) {
	let a = t.pack?.ruleId;
	if (typeof a == "string" && !r.hasRule(a)) throw new Q("E_RULE_MISSING", `需要先安装规则『${a}』`, { ruleId: a });
	let o = $y.safeParse(t);
	if (!o.success) throw ZS(`说明文件的 ${FS(o.error.issues[0])} 不合法`);
	let s = LS(o.data.pack, i);
	if (s.minAppVersion && Eb(s.minAppVersion, r.appVersion) > 0) throw new Q("E_NEWER_APP", `需要先把扩展更新到 v${s.minAppVersion} 才能安装这个内容包`);
	if (s.dataVersion > 1) throw new Q("E_NEWER_DATA", "这个内容包由更新版本的扩展制作，请先更新扩展");
	US(QS(e), e, i);
	let c = $S(e);
	if (c.length !== s.entryCount) throw ZS(`条目数量不符（说明为 ${s.entryCount}，实际 ${c.length}）`);
	let l = {};
	for (let e of c) l[e.type] = (l[e.type] ?? 0) + 1;
	let u = i >= 2 ? eC(e) : [], { adventure: d, fallback: f } = i >= 2 ? tC(e) : {
		adventure: {},
		fallback: []
	}, p = nC(e, i, s);
	i <= 1 && rC(e, c, p), s.blobs = [...p.values()].map(({ hash: e, mime: t, size: n }) => ({
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
	return qS({
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
		sha256: _S(n)
	};
}
function aC(e, t, n, r) {
	let i = [];
	for (let a of Object.keys(e).filter((e) => e.startsWith(t) && e.endsWith(".json")).sort()) {
		let t = XS(e, a);
		if (!t || typeof t != "object") throw ZS(`${a} 不是有效的记录`);
		let o = r(xS(n, t));
		if (!o.ok) throw ZS(`${a} 的 ${o.detail} 不合法`);
		i.push(o.value);
	}
	return i;
}
function oC(e, t) {
	let n = eb.safeParse(t);
	if (!n.success) throw ZS(`说明文件的 ${FS(n.error.issues[0])} 不合法`);
	let r = aC(e, "saves/", "save", (e) => {
		let t = lb.safeParse(e);
		return t.success ? {
			ok: !0,
			value: t.data
		} : {
			ok: !1,
			detail: FS(t.error.issues[0])
		};
	}), i = aC(e, "workspaces/", "workspace", (e) => {
		let t = ob.safeParse(e);
		return t.success ? {
			ok: !0,
			value: t.data
		} : {
			ok: !1,
			detail: FS(t.error.issues[0])
		};
	}), a, o = XS(e, "settings.json");
	if (o !== void 0) {
		let e = ub.safeParse(o);
		if (!e.success) throw ZS(`settings.json 的 ${FS(e.error.issues[0])} 不合法`);
		a = e.data;
	}
	let s = XS(e, "packs.json"), c = [];
	if (Array.isArray(s)) for (let e of s) {
		let t = tb.safeParse(e);
		t.success && c.push(t.data);
	}
	let l = /* @__PURE__ */ new Map();
	for (let t of QS(e)) t.startsWith("packs/") && t.endsWith(".trpgpack") && l.set(t, e[t]);
	let u = /* @__PURE__ */ new Map();
	for (let t of QS(e).filter((e) => e.startsWith("blobs/"))) {
		let n = t.slice(6);
		if (!/^[a-f0-9]{64}$/.test(n)) throw ZS(`图片「${n}」的文件名不是哈希`);
		let r = e[t];
		if (_S(r) !== n) throw ZS(`图片「${n.slice(0, 12)}」的哈希不一致`);
		PS(n, r), u.set(n, r);
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
function sC(e, t) {
	let n = JS(e), r = n["trpg-manifest.json"];
	if (!r) throw new Q("E_NO_MANIFEST", "无法识别：缺少说明文件，可能不是本扩展导出的文件");
	let i;
	try {
		i = JSON.parse(jx(r));
	} catch {
		throw ZS("说明文件无法解析");
	}
	let a = i;
	if (a.format !== "trpg-pack" && a.format !== "trpg-save" && a.format !== "trpg-backup") throw new Q("E_UNKNOWN_FORMAT", "无法识别：未知的文件类型");
	if (typeof a.formatVersion != "number" || a.formatVersion < 1 || a.formatVersion > 2) throw new Q("E_NEWER_FORMAT", "这个文件由更新版本的扩展创建，请先更新扩展");
	let o = Math.max(1, Math.floor(a.formatVersion));
	return a.format === "trpg-pack" ? iC(n, i, e, t, o) : oC(n, i);
}
function cC(e, t) {
	if (e.length !== t.byteSize || _S(e) !== t.sha256) throw new Q("E_CHECKSUM", "下载的文件不完整，请重试");
}
// src/core/packs/catalog.ts
var lC = 36e5, uC = 1e4;
function dC(e, t) {
	return t?.name === "AbortError" ? new Q("E_CANCELLED", "已取消") : new Q("E_NETWORK", `${e}：网络不可用`);
}
function fC(e, t) {
	return new Q("E_HTTP", t === 404 ? `${e}：文件不存在（404）` : `${e}：服务器返回 ${t}`, { status: t });
}
async function pC(e) {
	let t = e.now ?? Date.now;
	if (e.db && !e.force) {
		let n = await e.db.getMeta("catalogCache");
		if (n && n.url === e.url && t() - n.fetchedAt < lC) return n.catalog;
	}
	let n = new AbortController(), r = setTimeout(() => n.abort(), e.timeoutMs ?? uC), i;
	try {
		i = await (e.fetchFn ?? fetch)(e.url, { signal: n.signal });
	} catch (e) {
		throw e?.name === "AbortError" ? new Q("E_NETWORK", "连不上数据仓库：等待超时") : dC("连不上数据仓库", e);
	} finally {
		clearTimeout(r);
	}
	if (!i.ok) throw fC("连不上数据仓库", i.status);
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
async function mC(e, t) {
	let n = new URL(e.url, t.catalogUrl).toString(), r;
	try {
		r = await (t.fetchFn ?? fetch)(n, { signal: t.signal });
	} catch (e) {
		throw dC("下载失败", e);
	}
	if (!r.ok) throw fC("下载失败", r.status);
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
	return cC(s, {
		byteSize: e.byteSize,
		sha256: e.sha256
	}), s;
}
async function hC(e, t, n) {
	let r = e.recognize(t);
	if (r.type !== "pack" || r.manifest.id !== n.id || r.manifest.version !== n.version) throw new Q("E_BAD_CONTENT", "文件内容损坏：下载的文件与目录说明不一致");
	return e.install(r, { source: "download" });
}
function gC(e, t) {
	return t.packs.filter((t) => {
		let n = e.find((e) => e.id === t.id);
		return !!n && n.source !== "builtin" && Eb(t.version, n.version) > 0;
	});
}
function _C(e, t, n) {
	return t.packs.filter((t) => t.ruleId === n && !e.some((e) => e.id === t.id));
}
// src/core/packs/builtins.ts
async function vC(e, t) {
	let n = await e.getMeta(t);
	return Array.isArray(n) ? n.filter((e) => typeof e == "string") : [];
}
async function yC(e) {
	return vC(e, "builtinRemoved");
}
async function bC(e, t, n) {
	let r = new Set(await vC(e, "builtinRemoved"));
	n ? r.add(t) : r.delete(t), await e.setMeta("builtinRemoved", [...r]);
}
async function xC(e) {
	return vC(e, "userRemoved");
}
async function SC(e, t, n) {
	let r = new Set(await vC(e, "userRemoved"));
	n ? r.add(t) : r.delete(t), await e.setMeta("userRemoved", [...r]);
}
async function CC(e, t, n, r) {
	let i = new Set(await yC(e)), a = n.builtinPacks ?? n.corePackIds, o = {
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
var wC = /* @__PURE__ */ l((/* @__PURE__ */ o(((e, t, n) => {
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
		var se = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", ce = typeof se == "symbol" ? function(e) {
			var t;
			return e != null && (t = e[se]) && t.apply(e);
		} : function() {
			return null;
		};
		function le(e, t) {
			var n = e.indexOf(t);
			return n >= 0 && e.splice(n, 1), n >= 0;
		}
		var ue = {};
		function de(e) {
			var t, n, r, i;
			if (arguments.length === 1) {
				if (o(e)) return e.slice();
				if (this === ue && typeof e == "string") return [e];
				if (i = ce(e)) {
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
		var fe = typeof Symbol < "u" ? function(e) {
			return e[Symbol.toStringTag] === "AsyncFunction";
		} : function() {
			return !1;
		}, pe = [
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
		], me = [
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
		], he = pe.concat(me), ge = {
			VersionChanged: "Database version changed by other database connection",
			DatabaseClosed: "Database has been closed",
			Abort: "Transaction aborted",
			TransactionInactive: "Transaction has already completed or failed",
			MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
		};
		function _e(e, t) {
			this.name = e, this.message = t;
		}
		m(_e).from(Error).extend({ toString: function() {
			return this.name + ": " + this.message;
		} });
		function ve(e, t) {
			return e + ". Errors: " + Object.keys(t).map(function(e) {
				return t[e].toString();
			}).filter(function(e, t, n) {
				return n.indexOf(e) === t;
			}).join("\n");
		}
		function ye(e, t, n, r) {
			this.failures = t, this.failedKeys = r, this.successCount = n, this.message = ve(e, t);
		}
		m(ye).from(_e);
		function be(e, t) {
			this.name = "BulkError", this.failures = Object.keys(t).map(function(e) {
				return t[e];
			}), this.failuresByPos = t, this.message = ve(e, this.failures);
		}
		m(be).from(_e);
		var xe = he.reduce(function(e, t) {
			return e[t] = t + "Error", e;
		}, {}), Se = _e, A = he.reduce(function(e, t) {
			var n = t + "Error";
			function r(e, r) {
				this.name = n, e ? typeof e == "string" ? (this.message = `${e}${r ? "\n " + r : ""}`, this.inner = r || null) : typeof e == "object" && (this.message = `${e.name} ${e.message}`, this.inner = e) : (this.message = ge[t] || n, this.inner = null);
			}
			return m(r).from(Se), e[t] = r, e;
		}, {});
		A.Syntax = SyntaxError, A.Type = TypeError, A.Range = RangeError;
		var Ce = me.reduce(function(e, t) {
			return e[t + "Error"] = A[t], e;
		}, {});
		function we(e, t) {
			if (!e || e instanceof _e || e instanceof TypeError || e instanceof SyntaxError || !e.name || !Ce[e.name]) return e;
			var n = new Ce[e.name](t || e.message, e);
			return "stack" in e && p(n, "stack", { get: function() {
				return this.inner.stack;
			} }), n;
		}
		var Te = he.reduce(function(e, t) {
			return [
				"Syntax",
				"Type",
				"Range"
			].indexOf(t) === -1 && (e[t + "Error"] = A[t]), e;
		}, {});
		Te.ModifyError = ye, Te.DexieError = _e, Te.BulkError = be;
		function Ee() {}
		function De(e) {
			return e;
		}
		function Oe(e, t) {
			return e == null || e === De ? t : function(n) {
				return t(e(n));
			};
		}
		function ke(e, t) {
			return function() {
				e.apply(this, arguments), t.apply(this, arguments);
			};
		}
		function Ae(e, t) {
			return e === Ee ? t : function() {
				var n = e.apply(this, arguments);
				n !== void 0 && (arguments[0] = n);
				var r = this.onsuccess, i = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var a = t.apply(this, arguments);
				return r && (this.onsuccess = this.onsuccess ? ke(r, this.onsuccess) : r), i && (this.onerror = this.onerror ? ke(i, this.onerror) : i), a === void 0 ? n : a;
			};
		}
		function je(e, t) {
			return e === Ee ? t : function() {
				e.apply(this, arguments);
				var n = this.onsuccess, r = this.onerror;
				this.onsuccess = this.onerror = null, t.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? ke(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? ke(r, this.onerror) : r);
			};
		}
		function Me(e, t) {
			return e === Ee ? t : function() {
				var n = e.apply(this, arguments), r = arguments[0];
				s(r, n);
				var i = this.onsuccess, a = this.onerror;
				this.onsuccess = null, this.onerror = null;
				var o = t.apply(this, arguments);
				return i && (this.onsuccess = this.onsuccess ? ke(i, this.onsuccess) : i), a && (this.onerror = this.onerror ? ke(a, this.onerror) : a), n === void 0 ? o === void 0 ? void 0 : o : s(n, o);
			};
		}
		function Ne(e, t) {
			return e === Ee ? t : function() {
				return t.apply(this, arguments) !== !1 && e.apply(this, arguments);
			};
		}
		function Pe(e, t) {
			return e === Ee ? t : function() {
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
		var Fe = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
		function Ie(e, t) {
			Fe = e;
		}
		var Le = {}, Re = 100, ze = typeof Promise > "u" ? [] : (function() {
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
		})(), Be = ze[0], Ve = ze[1], He = ze[2], Ue = Ve && Ve.then, We = Be && Be.constructor, j = !!He;
		function Ge() {
			queueMicrotask(lt);
		}
		var Ke = function(e, t) {
			$e.push([e, t]), Je &&= (Ge(), !1);
		}, qe = !0, Je = !0, Ye = [], Xe = [], Ze = De, Qe = {
			id: "global",
			global: !0,
			ref: 0,
			unhandleds: [],
			onunhandled: Ee,
			pgp: !1,
			env: {},
			finalize: Ee
		}, M = Qe, $e = [], et = 0, tt = [];
		function N(e) {
			if (typeof this != "object") throw TypeError("Promises must be constructed via new");
			this._listeners = [], this._lib = !1;
			var t = this._PSD = M;
			if (typeof e != "function") {
				if (e !== Le) throw TypeError("Not a function");
				this._state = arguments[1], this._value = arguments[2], this._state === !1 && at(this, this._value);
			} else this._state = null, this._value = null, ++t.ref, it(this, e);
		}
		var nt = {
			get: function() {
				var e = M, t = St;
				function n(n, r) {
					var i = this, a = !e.global && (e !== M || t !== St), o = a && !Et(), s = new N(function(t, s) {
						st(i, new rt(Nt(n, e, a, o), Nt(r, e, a, o), t, s, e));
					});
					return this._consoleTask && (s._consoleTask = this._consoleTask), s;
				}
				return n.prototype = Le, n;
			},
			set: function(e) {
				p(this, "then", e && e.prototype === Le ? nt : {
					get: function() {
						return e;
					},
					set: nt.set
				});
			}
		};
		d(N.prototype, {
			then: nt,
			_then: function(e, t) {
				st(this, new rt(null, null, e, t, M));
			},
			catch: function(e) {
				if (arguments.length === 1) return this.then(null, e);
				var t = arguments[0], n = arguments[1];
				return typeof t == "function" ? this.then(null, function(e) {
					return e instanceof t ? n(e) : gt(e);
				}) : this.then(null, function(e) {
					return e && e.name === t ? n(e) : gt(e);
				});
			},
			finally: function(e) {
				return this.then(function(t) {
					return N.resolve(e()).then(function() {
						return t;
					});
				}, function(t) {
					return N.resolve(e()).then(function() {
						return gt(t);
					});
				});
			},
			timeout: function(e, t) {
				var n = this;
				return e < Infinity ? new N(function(r, i) {
					var a = setTimeout(function() {
						return i(new A.Timeout(t));
					}, e);
					n.then(r, i).finally(clearTimeout.bind(null, a));
				}) : this;
			}
		}), typeof Symbol < "u" && Symbol.toStringTag && p(N.prototype, Symbol.toStringTag, "Dexie.Promise"), Qe.env = jt();
		function rt(e, t, n, r, i) {
			this.onFulfilled = typeof e == "function" ? e : null, this.onRejected = typeof t == "function" ? t : null, this.resolve = n, this.reject = r, this.psd = i;
		}
		d(N, {
			all: function() {
				var e = de.apply(null, arguments).map(Dt);
				return new N(function(t, n) {
					e.length === 0 && t([]);
					var r = e.length;
					e.forEach(function(i, a) {
						return N.resolve(i).then(function(n) {
							e[a] = n, --r || t(e);
						}, n);
					});
				});
			},
			resolve: function(e) {
				return e instanceof N ? e : e && typeof e.then == "function" ? new N(function(t, n) {
					e.then(t, n);
				}) : new N(Le, !0, e);
			},
			reject: gt,
			race: function() {
				var e = de.apply(null, arguments).map(Dt);
				return new N(function(t, n) {
					e.map(function(e) {
						return N.resolve(e).then(t, n);
					});
				});
			},
			PSD: {
				get: function() {
					return M;
				},
				set: function(e) {
					return M = e;
				}
			},
			totalEchoes: { get: function() {
				return St;
			} },
			newPSD: wt,
			usePSD: Mt,
			scheduler: {
				get: function() {
					return Ke;
				},
				set: function(e) {
					Ke = e;
				}
			},
			rejectionMapper: {
				get: function() {
					return Ze;
				},
				set: function(e) {
					Ze = e;
				}
			},
			follow: function(e, t) {
				return new N(function(n, r) {
					return wt(function(t, n) {
						var r = M;
						r.unhandleds = [], r.onunhandled = n, r.finalize = ke(function() {
							var e = this;
							pt(function() {
								e.unhandleds.length === 0 ? t() : n(e.unhandleds[0]);
							});
						}, r.finalize), e();
					}, t, n, r);
				});
			}
		}), We && (We.allSettled && p(N, "allSettled", function() {
			var e = de.apply(null, arguments).map(Dt);
			return new N(function(t) {
				e.length === 0 && t([]);
				var n = e.length, r = Array(n);
				e.forEach(function(e, i) {
					return N.resolve(e).then(function(e) {
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
		}), We.any && typeof AggregateError < "u" && p(N, "any", function() {
			var e = de.apply(null, arguments).map(Dt);
			return new N(function(t, n) {
				e.length === 0 && n(/* @__PURE__ */ AggregateError([]));
				var r = e.length, i = Array(r);
				e.forEach(function(e, a) {
					return N.resolve(e).then(function(e) {
						return t(e);
					}, function(e) {
						i[a] = e, --r || n(AggregateError(i));
					});
				});
			});
		}), We.withResolvers && (N.withResolvers = We.withResolvers));
		function it(e, t) {
			try {
				t(function(t) {
					if (e._state === null) {
						if (t === e) throw TypeError("A promise cannot be resolved with itself.");
						var n = e._lib && ut();
						t && typeof t.then == "function" ? it(e, function(e, n) {
							t instanceof N ? t._then(e, n) : t.then(e, n);
						}) : (e._state = !0, e._value = t, ot(e)), n && dt();
					}
				}, at.bind(null, e));
			} catch (t) {
				at(e, t);
			}
		}
		function at(e, t) {
			if (Xe.push(t), e._state === null) {
				var n = e._lib && ut();
				t = Ze(t), e._state = !1, e._value = t, mt(e), ot(e), n && dt();
			}
		}
		function ot(e) {
			var t = e._listeners;
			e._listeners = [];
			for (var n = 0, r = t.length; n < r; ++n) st(e, t[n]);
			var i = e._PSD;
			--i.ref || i.finalize(), et === 0 && (++et, Ke(function() {
				--et === 0 && ft();
			}, []));
		}
		function st(e, t) {
			if (e._state === null) e._listeners.push(t);
			else {
				var n = e._state ? t.onFulfilled : t.onRejected;
				if (n === null) return (e._state ? t.resolve : t.reject)(e._value);
				++t.psd.ref, ++et, Ke(ct, [
					n,
					e,
					t
				]);
			}
		}
		function ct(e, t, n) {
			try {
				var r, i = t._value;
				!t._state && Xe.length && (Xe = []), r = Fe && t._consoleTask ? t._consoleTask.run(function() {
					return e(i);
				}) : e(i), !t._state && Xe.indexOf(i) === -1 && ht(t), n.resolve(r);
			} catch (e) {
				n.reject(e);
			} finally {
				--et === 0 && ft(), --n.psd.ref || n.psd.finalize();
			}
		}
		function lt() {
			Mt(Qe, function() {
				ut() && dt();
			});
		}
		function ut() {
			var e = qe;
			return qe = !1, Je = !1, e;
		}
		function dt() {
			var e, t, n;
			do
				for (; $e.length > 0;) for (e = $e, $e = [], n = e.length, t = 0; t < n; ++t) {
					var r = e[t];
					r[0].apply(null, r[1]);
				}
			while ($e.length > 0);
			qe = !0, Je = !0;
		}
		function ft() {
			var e = Ye;
			Ye = [], e.forEach(function(e) {
				e._PSD.onunhandled.call(null, e._value, e);
			});
			for (var t = tt.slice(0), n = t.length; n;) t[--n]();
		}
		function pt(e) {
			function t() {
				e(), tt.splice(tt.indexOf(t), 1);
			}
			tt.push(t), ++et, Ke(function() {
				--et === 0 && ft();
			}, []);
		}
		function mt(e) {
			Ye.some(function(t) {
				return t._value === e._value;
			}) || Ye.push(e);
		}
		function ht(e) {
			for (var t = Ye.length; t;) if (Ye[--t]._value === e._value) {
				Ye.splice(t, 1);
				return;
			}
		}
		function gt(e) {
			return new N(Le, !1, e);
		}
		function _t(e, t) {
			var n = M;
			return function() {
				var r = ut(), i = M;
				try {
					return At(n, !0), e.apply(this, arguments);
				} catch (e) {
					t && t(e);
				} finally {
					At(i, !1), r && dt();
				}
			};
		}
		var vt = {
			awaits: 0,
			echoes: 0,
			id: 0
		}, yt = 0, bt = [], xt = 0, St = 0, Ct = 0;
		function wt(e, t, n, r) {
			var i = M, a = Object.create(i);
			a.parent = i, a.ref = 0, a.global = !1, a.id = ++Ct, Qe.env, a.env = j ? {
				Promise: N,
				PromiseProp: {
					value: N,
					configurable: !0,
					writable: !0
				},
				all: N.all,
				race: N.race,
				allSettled: N.allSettled,
				any: N.any,
				resolve: N.resolve,
				reject: N.reject
			} : {}, t && s(a, t), ++i.ref, a.finalize = function() {
				--this.parent.ref || this.parent.finalize();
			};
			var o = Mt(a, e, n, r);
			return a.ref === 0 && a.finalize(), o;
		}
		function Tt() {
			return vt.id ||= ++yt, ++vt.awaits, vt.echoes += Re, vt.id;
		}
		function Et() {
			return vt.awaits ? (--vt.awaits === 0 && (vt.id = 0), vt.echoes = vt.awaits * Re, !0) : !1;
		}
		("" + Ue).indexOf("[native code]") === -1 && (Tt = Et = Ee);
		function Dt(e) {
			return vt.echoes && e && e.constructor === We ? (Tt(), e.then(function(e) {
				return Et(), e;
			}, function(e) {
				return Et(), Ft(e);
			})) : e;
		}
		function Ot(e) {
			++St, vt.echoes && --vt.echoes !== 0 || (vt.echoes = vt.awaits = vt.id = 0), bt.push(M), At(e, !0);
		}
		function kt() {
			var e = bt[bt.length - 1];
			bt.pop(), At(e, !1);
		}
		function At(e, t) {
			var n = M;
			if ((t ? vt.echoes && (!xt++ || e !== M) : xt && (!--xt || e !== M)) && queueMicrotask(t ? Ot.bind(null, e) : kt), e !== M && (M = e, n === Qe && (Qe.env = jt()), j)) {
				var r = Qe.env.Promise, a = e.env;
				(n.global || e.global) && (Object.defineProperty(i, "Promise", a.PromiseProp), r.all = a.all, r.race = a.race, r.resolve = a.resolve, r.reject = a.reject, a.allSettled && (r.allSettled = a.allSettled), a.any && (r.any = a.any));
			}
		}
		function jt() {
			var e = i.Promise;
			return j ? {
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
		function Mt(e, t, n, r, i) {
			var a = M;
			try {
				return At(e, !0), t(n, r, i);
			} finally {
				At(a, !1);
			}
		}
		function Nt(e, t, n, r) {
			return typeof e == "function" ? function() {
				var i = M;
				n && Tt(), At(t, !0);
				try {
					return e.apply(this, arguments);
				} finally {
					At(i, !1), r && queueMicrotask(Et);
				}
			} : e;
		}
		function Pt(e) {
			Promise === We && vt.echoes === 0 ? xt === 0 ? e() : enqueueNativeMicroTask(e) : setTimeout(e, 0);
		}
		var Ft = N.reject;
		function It(e, t, n, r) {
			if (!e.idbdb || !e._state.openComplete && !M.letThrough && !e._vip) {
				if (e._state.openComplete) return Ft(new A.DatabaseClosed(e._state.dbOpenError));
				if (!e._state.isBeingOpened) {
					if (!e._state.autoOpen) return Ft(new A.DatabaseClosed());
					e.open().catch(Ee);
				}
				return e._state.dbReadyPromise.then(function() {
					return It(e, t, n, r);
				});
			}
			var i = e._createTransaction(t, n, e._dbSchema);
			try {
				i.create(), e._state.PR1398_maxLoop = 3;
			} catch (i) {
				return i.name === xe.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
					return It(e, t, n, r);
				})) : Ft(i);
			}
			return i._promise(t, function(e, t) {
				return wt(function() {
					return M.trans = i, r(e, t, i);
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
		var Lt = "4.4.7", Rt = "￿", zt = -Infinity, Bt = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", Vt = "String expected.", Ht = 1e3, Ut = "__dbnames", Wt = "readonly", Gt = "readwrite";
		function Kt(e, t) {
			return e ? t ? function() {
				return e.apply(this, arguments) && t.apply(this, arguments);
			} : e : t;
		}
		var qt = {
			type: 3,
			lower: -Infinity,
			lowerOpen: !1,
			upper: [[]],
			upperOpen: !1
		};
		function Jt(e) {
			return typeof e == "string" && !/\./.test(e) ? function(t) {
				return t[e] === void 0 && e in t && (t = ie(t), delete t[e]), t;
			} : function(e) {
				return e;
			};
		}
		function Yt() {
			throw A.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
		}
		function Xt(e, t) {
			try {
				var n = $t(e), r = $t(t);
				if (n !== r) return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r === "Date" ? -1 : NaN;
				switch (n) {
					case "number":
					case "Date":
					case "string": return e > t ? 1 : e < t ? -1 : 0;
					case "binary": return Qt(en(e), en(t));
					case "Array": return Zt(e, t);
				}
			} catch {}
			return NaN;
		}
		function Zt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) {
				var o = Xt(e[a], t[a]);
				if (o !== 0) return o;
			}
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function Qt(e, t) {
			for (var n = e.length, r = t.length, i = n < r ? n : r, a = 0; a < i; ++a) if (e[a] !== t[a]) return e[a] < t[a] ? -1 : 1;
			return n === r ? 0 : n < r ? -1 : 1;
		}
		function $t(e) {
			var t = typeof e;
			if (t !== "object") return t;
			if (ArrayBuffer.isView(e)) return "binary";
			var n = oe(e);
			return n === "ArrayBuffer" ? "binary" : n;
		}
		function en(e) {
			return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength) : new Uint8Array(e);
		}
		function tn(e, t, n) {
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
		var nn = function() {
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
		function rn(e, t) {
			for (var n = a(t), r = n.length, i = !1, o = 0; o < r; ++o) {
				var s = n[o], c = t[s], l = C(e, s);
				c instanceof nn ? (w(e, s, c.execute(l)), i = !0) : l !== c && (w(e, s, c), i = !0);
			}
			return i;
		}
		var an = function() {
			function e() {}
			return e.prototype._trans = function(e, t, n) {
				var r = this._tx || M.trans, i = this.name, a = Fe && typeof console < "u" && console.createTask && console.createTask(`Dexie: ${e === "readonly" ? "read" : "write"} ${this.name}`);
				function o(e, n, r) {
					if (!r.schema[i]) throw new A.NotFound("Table " + i + " not part of transaction");
					return t(r.idbtrans, r);
				}
				var s = ut();
				try {
					var c = r && r.db._novip === this.db._novip ? r === M.trans ? r._promise(e, o, n) : wt(function() {
						return r._promise(e, o, n);
					}, {
						trans: r,
						transless: M.transless || M
					}) : It(this.db, e, [this.name], o);
					return a && (c._consoleTask = a, c = c.catch(function(e) {
						return console.trace(e), Ft(e);
					})), c;
				} finally {
					s && dt();
				}
			}, e.prototype.get = function(e, t) {
				var n = this;
				return e && e.constructor === Object ? this.where(e).first(t) : e == null ? Ft(new A.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(t) {
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
				if (n && this.db._maxKey !== Rt) {
					var r = n.keyPath.slice(0, t.length);
					return this.where(r).equals(r.map(function(t) {
						return e[t];
					}));
				}
				!n && Fe && console.warn(`The query ${JSON.stringify(e)} on ${this.name} would benefit from a compound index [${t.join("+")}]`);
				var i = this.schema.idxByName;
				function s(e, t) {
					return Xt(e, t) === 0;
				}
				var c = t.reduce(function(t, n) {
					var r = t[0], a = t[1], c = i[n], l = e[n];
					return [r || c, r || !c ? Kt(a, c && c.multi ? function(e) {
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
				this.schema.mappedClass = e, e.prototype instanceof Yt && (e = function(e) {
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
				return a && i && (o = Jt(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "add",
						keys: t == null ? null : [t],
						values: [o]
					});
				}).then(function(e) {
					return e.numFailures ? N.reject(e.failures[0]) : e.lastResult;
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
						return rn(o, t), r && w(o, r, e), n.core.mutate({
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
							return e.numFailures ? N.reject(e.failures[0]) : !!a;
						});
					});
				});
			}, e.prototype.update = function(e, t) {
				if (typeof e == "object" && !o(e)) {
					var n = C(e, this.schema.primKey.keyPath);
					return n === void 0 ? Ft(new A.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(n).modify(t);
				}
				return this.where(":id").equals(e).modify(t);
			}, e.prototype.put = function(e, t) {
				var n = this, r = this.schema.primKey, i = r.auto, a = r.keyPath, o = e;
				return a && i && (o = Jt(a)(e)), this._trans("readwrite", function(e) {
					return n.core.mutate({
						trans: e,
						type: "put",
						values: [o],
						keys: t == null ? null : [t]
					});
				}).then(function(e) {
					return e.numFailures ? N.reject(e.failures[0]) : e.lastResult;
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
						return tn(t, [e], n);
					}).then(function(e) {
						return e.numFailures ? N.reject(e.failures[0]) : void 0;
					});
				});
			}, e.prototype.clear = function() {
				var e = this;
				return this._trans("readwrite", function(t) {
					return e.core.mutate({
						trans: t,
						type: "deleteRange",
						range: qt
					}).then(function(t) {
						return tn(e, null, t);
					});
				}).then(function(e) {
					return e.numFailures ? N.reject(e.failures[0]) : void 0;
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
					if (s && i) throw new A.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new A.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(Jt(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "add",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new be(`${r.name}.bulkAdd(): ${t} of ${c} operations failed`, o);
					});
				});
			}, e.prototype.bulkPut = function(e, t, n) {
				var r = this, i = Array.isArray(t) ? t : void 0;
				n ||= i ? void 0 : t;
				var a = n ? n.allKeys : void 0;
				return this._trans("readwrite", function(t) {
					var n = r.schema.primKey, o = n.auto, s = n.keyPath;
					if (s && i) throw new A.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
					if (i && i.length !== e.length) throw new A.InvalidArgument("Arguments objects and keys must have the same length");
					var c = e.length, l = s && o ? e.map(Jt(s)) : e;
					return r.core.mutate({
						trans: t,
						type: "put",
						keys: i,
						values: l,
						wantResults: a
					}).then(function(e) {
						var t = e.numFailures, n = e.results, i = e.lastResult, o = e.failures, s = a ? n : i;
						if (t === 0) return s;
						throw new be(`${r.name}.bulkPut(): ${t} of ${c} operations failed`, o);
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
								if (!l && Xt(u(a), n) !== 0) throw new A.Constraint("Cannot update primary key in bulkUpdate()");
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
							throw new be(`${t.name}.bulkUpdate(): ${n} of ${p} operations failed`, r);
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
						return tn(t, e, n);
					});
				}).then(function(e) {
					var r = e.numFailures, i = e.lastResult, a = e.failures;
					if (r === 0) return i;
					throw new be(`${t.name}.bulkDelete(): ${r} of ${n} operations failed`, a);
				});
			}, e;
		}();
		function on(e) {
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
				r ||= Ne, i ||= Ee;
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
					else if (n === "asap") var r = s(t, De, function() {
						for (var e = arguments.length, t = Array(e); e--;) t[e] = arguments[e];
						r.subscribers.forEach(function(e) {
							x(function() {
								e.apply(null, t);
							});
						});
					});
					else throw new A.InvalidArgument("Invalid event config");
				});
			}
		}
		function sn(e, t) {
			return m(t).from({ prototype: e }), t;
		}
		function cn(e) {
			return sn(an.prototype, function(t, n, r) {
				this.db = e, this._tx = r, this.name = t, this.schema = n, this.hook = e._allTables[t] ? e._allTables[t].hook : on(null, {
					creating: [Ae, Ee],
					reading: [Oe, De],
					updating: [Me, Ee],
					deleting: [je, Ee]
				});
			});
		}
		function ln(e, t) {
			return !(e.filter || e.algorithm || e.or) && (t ? e.justLimit : !e.replayFilter);
		}
		function un(e, t) {
			e.filter = Kt(e.filter, t);
		}
		function dn(e, t, n) {
			var r = e.replayFilter;
			e.replayFilter = r ? function() {
				return Kt(r(), t());
			} : t, e.justLimit = n && !r;
		}
		function fn(e, t) {
			e.isMatch = Kt(e.isMatch, t);
		}
		function pn(e, t) {
			if (e.isPrimKey) return t.primaryKey;
			var n = t.getIndexByKeyPath(e.index);
			if (!n) throw new A.Schema("KeyPath " + e.index + " on object store " + t.name + " is not indexed");
			return n;
		}
		function mn(e, t, n) {
			var r = pn(e, t.schema);
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
		function hn(e, t, n, r) {
			var i = e.replayFilter ? Kt(e.filter, e.replayFilter()) : e.filter;
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
				return Promise.all([e.or._iterate(o, n), gn(mn(e, r, n), e.algorithm, o, !e.keysOnly && e.valueMapper)]);
			}
			return gn(mn(e, r, n), Kt(e.algorithm, i), t, !e.keysOnly && e.valueMapper);
		}
		function gn(e, t, n, r) {
			var i = _t(r ? function(e, t, i) {
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
						e.stop(t), n = Ee;
					}, function(t) {
						e.fail(t), n = Ee;
					})) && i(e.value, e, function(e) {
						return n = e;
					}), n();
				});
			});
		}
		var _n = function() {
			function e() {}
			return e.prototype._read = function(e, t) {
				var n = this._ctx;
				return n.error ? n.table._trans(null, Ft.bind(null, n.error)) : n.table._trans("readonly", e).then(t);
			}, e.prototype._write = function(e) {
				var t = this._ctx;
				return t.error ? t.table._trans(null, Ft.bind(null, t.error)) : t.table._trans("readwrite", e, "locked");
			}, e.prototype._addAlgorithm = function(e) {
				var t = this._ctx;
				t.algorithm = Kt(t.algorithm, e);
			}, e.prototype._iterate = function(e, t) {
				return hn(this._ctx, e, t, this._ctx.table.core);
			}, e.prototype.clone = function(e) {
				var t = Object.create(this.constructor.prototype), n = Object.create(this._ctx);
				return e && s(n, e), t._ctx = n, t;
			}, e.prototype.raw = function() {
				return this._ctx.valueMapper = null, this;
			}, e.prototype.each = function(e) {
				var t = this._ctx;
				return this._read(function(n) {
					return hn(t, e, n, t.table.core);
				});
			}, e.prototype.count = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx, r = n.table.core;
					if (ln(n, !0)) return r.count({
						trans: e,
						query: {
							index: pn(n, r.schema),
							range: n.range
						}
					}).then(function(e) {
						return Math.min(e, n.limit);
					});
					var i = 0;
					return hn(n, function() {
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
					return Xt(a(e, i), a(t, i)) * o;
				}
				return this.toArray(function(e) {
					return e.slice().sort(s);
				}).then(t);
			}, e.prototype.toArray = function(e) {
				var t = this;
				return this._read(function(e) {
					var n = t._ctx;
					if (ln(n, !0) && n.limit > 0) {
						var r = n.valueMapper, i = pn(n, n.table.core.schema);
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
					return hn(n, function(e) {
						return a.push(e);
					}, e, n.table.core).then(function() {
						return a;
					});
				}, e);
			}, e.prototype.offset = function(e) {
				var t = this._ctx;
				return e <= 0 || (t.offset += e, ln(t) ? dn(t, function() {
					var t = e;
					return function(e, n) {
						return t === 0 ? !0 : t === 1 ? (--t, !1) : (n(function() {
							e.advance(t), t = 0;
						}), !1);
					};
				}) : dn(t, function() {
					var t = e;
					return function() {
						return --t < 0;
					};
				})), this;
			}, e.prototype.limit = function(e) {
				return this._ctx.limit = Math.min(this._ctx.limit, e), dn(this._ctx, function() {
					var t = e;
					return function(e, n, r) {
						return --t <= 0 && n(r), t >= 0;
					};
				}, !0), this;
			}, e.prototype.until = function(e, t) {
				return un(this._ctx, function(n, r, i) {
					return !e(n.value) || (r(i), t);
				}), this;
			}, e.prototype.first = function(e) {
				return this.limit(1).toArray(function(e) {
					return e[0];
				}).then(e);
			}, e.prototype.last = function(e) {
				return this.reverse().first(e);
			}, e.prototype.filter = function(e) {
				return un(this._ctx, function(t) {
					return e(t.value);
				}), fn(this._ctx, e), this;
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
				if (ln(t, !0) && t.limit > 0) return this._read(function(e) {
					var n = pn(t, t.table.core.schema);
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
				return un(this._ctx, function(e) {
					var t = e.primaryKey.toString(), r = u(n, t);
					return n[t] = !0, !r;
				}), this;
			}, e.prototype.modify = function(e) {
				var t = this, n = this._ctx;
				return this._write(function(r) {
					var i = typeof e == "function" ? e : function(t) {
						return rn(t, e);
					}, o = n.table.core, s = o.schema.primaryKey, c = s.outbound, l = s.extractKey, u = 200, d = t.db._options.modifyChunkSize;
					d && (u = typeof d == "object" ? d[o.name] || d["*"] || 200 : d);
					var f = [], p = 0, m = [], h = function(e, t) {
						var n = t.failures, r = t.numFailures;
						p += e - r;
						for (var i = 0, o = a(n); i < o.length; i++) {
							var s = o[i];
							f.push(n[s]);
						}
					}, g = e === vn;
					return t.clone().primaryKeys().then(function(t) {
						var a = ln(n) && n.limit === Infinity && (typeof e != "function" || g) && {
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
									i.call(C, C.value, C) !== !1 && (C.value == null ? b.push(t[d + x]) : !c && Xt(l(S), l(C.value)) !== 0 ? (b.push(t[d + x]), _.push(C.value)) : (v.push(C.value), c && y.push(t[d + x])));
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
										return tn(n.table, b, e);
									}).then(function(e) {
										return h(b.length, e);
									});
								}).then(function() {
									return t.length > d + f && s(d + u);
								});
							});
						};
						return s(0).then(function() {
							if (f.length > 0) throw new ye("Error modifying one or more objects", f, p, m);
							return t.length;
						});
					});
				});
			}, e.prototype.delete = function() {
				var e = this._ctx, t = e.range;
				return ln(e) && !e.table.schema.yProps && (e.isPrimKey || t.type === 3) ? this._write(function(n) {
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
							if (r) throw new ye("Could not delete some values", Object.keys(n).map(function(e) {
								return n[e];
							}), t - r);
							return t - r;
						});
					});
				}) : this.modify(vn);
			}, e;
		}(), vn = function(e, t) {
			return t.value = null;
		};
		function yn(e) {
			return sn(_n.prototype, function(t, n) {
				this.db = e;
				var r = qt, i = null;
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
					valueMapper: s === De ? null : s
				};
			});
		}
		function bn(e, t) {
			return e < t ? -1 : e === t ? 0 : 1;
		}
		function xn(e, t) {
			return e > t ? -1 : e === t ? 0 : 1;
		}
		function Sn(e, t, n) {
			var r = e instanceof kn ? new e.Collection(e) : e;
			return r._ctx.error = n ? new n(t) : TypeError(t), r;
		}
		function Cn(e) {
			var t = new e.Collection(e, function() {
				return On("");
			});
			return t._addAlgorithm(function() {
				return !1;
			}), t;
		}
		function wn(e) {
			return e === "next" ? function(e) {
				return e.toUpperCase();
			} : function(e) {
				return e.toLowerCase();
			};
		}
		function Tn(e) {
			return e === "next" ? function(e) {
				return e.toLowerCase();
			} : function(e) {
				return e.toUpperCase();
			};
		}
		function En(e, t, n, r, i, a) {
			for (var o = Math.min(e.length, r.length), s = -1, c = 0; c < o; ++c) {
				var l = t[c];
				if (l !== r[c]) return i(e[c], n[c]) < 0 ? e.substr(0, c) + n[c] + n.substr(c + 1) : i(e[c], r[c]) < 0 ? e.substr(0, c) + r[c] + n.substr(c + 1) : s >= 0 ? e.substr(0, s) + t[s] + n.substr(s + 1) : null;
				i(e[c], l) < 0 && (s = c);
			}
			return o < r.length && a === "next" ? e + n.substr(e.length) : o < e.length && a === "prev" ? e.substr(0, n.length) : s < 0 ? null : e.substr(0, s) + r[s] + n.substr(s + 1);
		}
		function P(e, t, n, r) {
			var i, a, o, s, c, l, u, d = n.length;
			if (!n.every(function(e) {
				return typeof e == "string";
			})) return Sn(e, Vt);
			function f(e) {
				i = wn(e), a = Tn(e), o = e === "next" ? bn : xn;
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
				return Dn(s[0], c[d - 1] + r);
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
					var g = En(i, f, s[h], c[h], o, l);
					g === null && p === null ? m = h + 1 : (p === null || o(p, g) > 0) && (p = g);
				}
				return n(p === null ? r : function() {
					e.continue(p + u);
				}), !1;
			}), p;
		}
		function Dn(e, t, n, r) {
			return {
				type: 2,
				lower: e,
				upper: t,
				lowerOpen: n,
				upperOpen: r
			};
		}
		function On(e) {
			return {
				type: 1,
				lower: e,
				upper: e
			};
		}
		var kn = function() {
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
					return this._cmp(e, t) > 0 || this._cmp(e, t) === 0 && (n || r) && !(n && r) ? Cn(this) : new this.Collection(this, function() {
						return Dn(e, t, !n, !r);
					});
				} catch {
					return Sn(this, Bt);
				}
			}, e.prototype.equals = function(e) {
				return e == null ? Sn(this, Bt) : new this.Collection(this, function() {
					return On(e);
				});
			}, e.prototype.above = function(e) {
				return e == null ? Sn(this, Bt) : new this.Collection(this, function() {
					return Dn(e, void 0, !0);
				});
			}, e.prototype.aboveOrEqual = function(e) {
				return e == null ? Sn(this, Bt) : new this.Collection(this, function() {
					return Dn(e, void 0, !1);
				});
			}, e.prototype.below = function(e) {
				return e == null ? Sn(this, Bt) : new this.Collection(this, function() {
					return Dn(void 0, e, !1, !0);
				});
			}, e.prototype.belowOrEqual = function(e) {
				return e == null ? Sn(this, Bt) : new this.Collection(this, function() {
					return Dn(void 0, e);
				});
			}, e.prototype.startsWith = function(e) {
				return typeof e == "string" ? this.between(e, e + Rt, !0, !0) : Sn(this, Vt);
			}, e.prototype.startsWithIgnoreCase = function(e) {
				return e === "" ? this.startsWith(e) : P(this, function(e, t) {
					return e.indexOf(t[0]) === 0;
				}, [e], Rt);
			}, e.prototype.equalsIgnoreCase = function(e) {
				return P(this, function(e, t) {
					return e === t[0];
				}, [e], "");
			}, e.prototype.anyOfIgnoreCase = function() {
				var e = de.apply(ue, arguments);
				return e.length === 0 ? Cn(this) : P(this, function(e, t) {
					return t.indexOf(e) !== -1;
				}, e, "");
			}, e.prototype.startsWithAnyOfIgnoreCase = function() {
				var e = de.apply(ue, arguments);
				return e.length === 0 ? Cn(this) : P(this, function(e, t) {
					return t.some(function(t) {
						return e.indexOf(t) === 0;
					});
				}, e, Rt);
			}, e.prototype.anyOf = function() {
				var e = this, t = de.apply(ue, arguments), n = this._cmp;
				try {
					t.sort(n);
				} catch {
					return Sn(this, Bt);
				}
				if (t.length === 0) return Cn(this);
				var r = new this.Collection(this, function() {
					return Dn(t[0], t[t.length - 1]);
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
				return this.inAnyRange([[zt, e], [e, this.db._maxKey]], {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.noneOf = function() {
				var e = de.apply(ue, arguments);
				if (e.length === 0) return new this.Collection(this);
				try {
					e.sort(this._ascending);
				} catch {
					return Sn(this, Bt);
				}
				var t = e.reduce(function(e, t) {
					return e ? e.concat([[e[e.length - 1][1], t]]) : [[zt, t]];
				}, null);
				return t.push([e[e.length - 1], this.db._maxKey]), this.inAnyRange(t, {
					includeLowers: !1,
					includeUppers: !1
				});
			}, e.prototype.inAnyRange = function(e, t) {
				var n = this, r = this._cmp, i = this._ascending, a = this._descending, o = this._min, s = this._max;
				if (e.length === 0) return Cn(this);
				if (!e.every(function(e) {
					return e[0] !== void 0 && e[1] !== void 0 && i(e[0], e[1]) <= 0;
				})) return Sn(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", A.InvalidArgument);
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
					return Sn(this, Bt);
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
					return Dn(p[0][0], p[p.length - 1][1], !c, !l);
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
				var e = de.apply(ue, arguments);
				return e.every(function(e) {
					return typeof e == "string";
				}) ? e.length === 0 ? Cn(this) : this.inAnyRange(e.map(function(e) {
					return [e, e + Rt];
				})) : Sn(this, "startsWithAnyOf() only works with strings");
			}, e;
		}();
		function An(e) {
			return sn(kn.prototype, function(t, n, r) {
				if (this.db = e, this._ctx = {
					table: t,
					index: n === ":id" ? null : n,
					or: r
				}, this._cmp = this._ascending = Xt, this._descending = function(e, t) {
					return Xt(t, e);
				}, this._max = function(e, t) {
					return Xt(e, t) > 0 ? e : t;
				}, this._min = function(e, t) {
					return Xt(e, t) < 0 ? e : t;
				}, this._IDBKeyRange = e._deps.IDBKeyRange, !this._IDBKeyRange) throw new A.MissingAPI();
			});
		}
		function F(e) {
			return _t(function(t) {
				return jn(t), e(t.target.error), !1;
			});
		}
		function jn(e) {
			e.stopPropagation && e.stopPropagation(), e.preventDefault && e.preventDefault();
		}
		var Mn = "storagemutated", Nn = "x-storagemutated-1", Pn = on(null, Mn), Fn = function() {
			function e() {}
			return e.prototype._lock = function() {
				return b(!M.global), ++this._reculock, this._reculock === 1 && !M.global && (M.lockOwnerFor = this), this;
			}, e.prototype._unlock = function() {
				if (b(!M.global), --this._reculock === 0) for (M.global || (M.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked();) {
					var e = this._blockedFuncs.shift();
					try {
						Mt(e[1], e[0]);
					} catch {}
				}
				return this;
			}, e.prototype._locked = function() {
				return this._reculock && M.lockOwnerFor !== this;
			}, e.prototype.create = function(e) {
				var t = this;
				if (!this.mode) return this;
				var n = this.db.idbdb, r = this.db._state.dbOpenError;
				if (b(!this.idbtrans), !e && !n) switch (r && r.name) {
					case "DatabaseClosedError": throw new A.DatabaseClosed(r);
					case "MissingAPIError": throw new A.MissingAPI(r.message, r);
					default: throw new A.OpenFailed(r);
				}
				if (!this.active) throw new A.TransactionInactive();
				return b(this._completion._state === null), e = this.idbtrans = e || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : n.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })), e.onerror = _t(function(n) {
					jn(n), t._reject(e.error);
				}), e.onabort = _t(function(n) {
					jn(n), t.active && t._reject(new A.Abort(e.error)), t.active = !1, t.on("abort").fire(n);
				}), e.oncomplete = _t(function() {
					t.active = !1, t._resolve(), "mutatedParts" in e && Pn.storagemutated.fire(e.mutatedParts);
				}), this;
			}, e.prototype._promise = function(e, t, n) {
				var r = this;
				if (e === "readwrite" && this.mode !== "readwrite") return Ft(new A.ReadOnly("Transaction is readonly"));
				if (!this.active) return Ft(new A.TransactionInactive());
				if (this._locked()) return new N(function(i, a) {
					r._blockedFuncs.push([function() {
						r._promise(e, t, n).then(i, a);
					}, M]);
				});
				if (n) return wt(function() {
					var e = new N(function(e, n) {
						r._lock();
						var i = t(e, n, r);
						i && i.then && i.then(e, n);
					});
					return e.finally(function() {
						return r._unlock();
					}), e._lib = !0, e;
				});
				var i = new N(function(e, n) {
					var i = t(e, n, r);
					i && i.then && i.then(e, n);
				});
				return i._lib = !0, i;
			}, e.prototype._root = function() {
				return this.parent ? this.parent._root() : this;
			}, e.prototype.waitFor = function(e) {
				var t = this._root(), n = N.resolve(e);
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
				return new N(function(e, r) {
					n.then(function(n) {
						return t._waitingQueue.push(_t(e.bind(null, n)));
					}, function(e) {
						return t._waitingQueue.push(_t(r.bind(null, e)));
					}).finally(function() {
						t._waitingFor === i && (t._waitingFor = null);
					});
				});
			}, e.prototype.abort = function() {
				this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new A.Abort()));
			}, e.prototype.table = function(e) {
				var t = this._memoizedTables ||= {};
				if (u(t, e)) return t[e];
				var n = this.schema[e];
				if (!n) throw new A.NotFound("Table " + e + " not part of transaction");
				var r = new this.db.Table(e, n, this);
				return r.core = this.db.core.table(e), t[e] = r, r;
			}, e;
		}();
		function In(e) {
			return sn(Fn.prototype, function(t, n, r, i, a) {
				var o = this;
				t !== "readonly" && n.forEach(function(e) {
					var t = r[e]?.yProps;
					t && (n = n.concat(t.map(function(e) {
						return e.updatesTable;
					})));
				}), this.db = e, this.mode = t, this.storeNames = n, this.schema = r, this.chromeTransactionDurability = i, this.idbtrans = null, this.on = on(this, "complete", "error", "abort"), this.parent = a || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new N(function(e, t) {
					o._resolve = e, o._reject = t;
				}), this._completion.then(function() {
					o.active = !1, o.on.complete.fire();
				}, function(e) {
					var t = o.active;
					return o.active = !1, o.on.error.fire(e), o.parent ? o.parent._reject(e) : t && o.idbtrans && o.idbtrans.abort(), Ft(e);
				});
			});
		}
		function Ln(e, t, n, r, i, a, o, s) {
			return {
				name: e,
				keyPath: t,
				unique: n,
				multi: r,
				auto: i,
				compound: a,
				src: (n && !o ? "&" : "") + (r ? "*" : "") + (i ? "++" : "") + Rn(t),
				type: s
			};
		}
		function Rn(e) {
			return typeof e == "string" ? e : e ? "[" + [].join.call(e, "+") + "]" : "";
		}
		function zn(e, t, n) {
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
		function Bn(e) {
			return e.length === 1 ? e[0] : e;
		}
		var Vn = function(e) {
			try {
				return e.only([[]]), Vn = function() {
					return [[]];
				}, [[]];
			} catch {
				return Vn = function() {
					return Rt;
				}, Rt;
			}
		};
		function Hn(e) {
			return e == null ? function() {} : typeof e == "string" ? Un(e) : function(t) {
				return C(t, e);
			};
		}
		function Un(e) {
			return e.split(".").length === 1 ? function(t) {
				return t[e];
			} : function(t) {
				return C(t, e);
			};
		}
		function Wn(e) {
			return [].slice.call(e);
		}
		var Gn = 0;
		function Kn(e) {
			return e == null ? ":id" : typeof e == "string" ? e : `[${e.join("+")}]`;
		}
		function qn(e, t, n) {
			function r(e, t) {
				var n = Wn(e.objectStoreNames), r = n.length > 0 ? t.objectStore(n[0]) : {};
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
									extractKey: Hn(t)
								},
								indexes: Wn(e.indexNames).map(function(t) {
									return e.index(t);
								}).map(function(e) {
									var t = e.name, n = e.unique, r = e.multiEntry, i = e.keyPath, s = {
										name: t,
										compound: o(i),
										keyPath: i,
										unique: n,
										multiEntry: r,
										extractKey: Hn(i)
									};
									return a[Kn(i)] = s, s;
								}),
								getIndexByKeyPath: function(e) {
									return a[Kn(e)];
								}
							};
							return a[":id"] = s.primaryKey, t != null && (a[Kn(t)] = s.primaryKey), s;
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
						e = _t(e);
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
							++g, jn(e);
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
						e = _t(e);
						var l = a.index, u = a.range, d = n.objectStore(t), f = l.isPrimaryKey ? d : d.index(l.name), p = o ? s ? "prevunique" : "prev" : s ? "nextunique" : "next", m = r || !("openKeyCursor" in f) ? f.openCursor(i(u), p) : f.openKeyCursor(i(u), p);
						m.onerror = F(c), m.onsuccess = _t(function(t) {
							var r = m.result;
							if (!r) e(null);
							else {
								r.___id = ++Gn, r.done = !1;
								var i = r.continue.bind(r), a = r.continuePrimaryKey;
								a &&= a.bind(r);
								var o = r.advance.bind(r), s = function() {
									throw Error("Cursor not started");
								}, l = function() {
									throw Error("Cursor not stopped");
								};
								r.trans = n, r.stop = r.continue = r.continuePrimaryKey = r.advance = s, r.fail = _t(c), r.next = function() {
									var e = this, t = 1;
									return this.start(function() {
										return t-- ? e.continue() : e.stop();
									}).then(function() {
										return e;
									});
								}, r.start = function(e) {
									var t = new Promise(function(e, t) {
										e = _t(e), m.onerror = F(t), r.fail = t, r.stop = function(t) {
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
									return m.onsuccess = _t(function(e) {
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
							a = _t(a);
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
								}, y.onerror = F(o);
							} else if (e && d === "next") {
								var y = c ? g.getAll(_, f) : g.getAllKeys(_, f);
								y.onsuccess = function(e) {
									return a({ result: e.target.result });
								}, y.onerror = F(o);
							} else {
								var b = 0, x = c || !("openKeyCursor" in g) ? g.openCursor(_, d) : g.openKeyCursor(_, d), S = [];
								x.onsuccess = function() {
									var e = x.result;
									if (!e || (S.push(c ? e.value : e.primaryKey), ++b === l)) return a({ result: S });
									e.continue();
								}, x.onerror = F(o);
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
							e = _t(e);
							for (var a = n.objectStore(t), o = r.length, s = Array(o), c = 0, l = 0, u, d = function(t) {
								var n = t.target;
								s[n._pos] = n.result, ++l === c && e(s);
							}, f = F(i), p = 0; p < o; ++p) r[p] != null && (u = a.get(r[p]), u._pos = p, u.onsuccess = d, u.onerror = f, ++c);
							c === 0 && e(s);
						});
					},
					get: function(e) {
						var n = e.trans, r = e.key;
						return new Promise(function(e, i) {
							e = _t(e);
							var a = n.objectStore(t).get(r);
							a.onsuccess = function(t) {
								return e(t.target.result);
							}, a.onerror = F(i);
						});
					},
					query: a(l, u),
					openCursor: r,
					count: function(e) {
						var n = e.query, r = e.trans, a = n.index, o = n.range;
						return new Promise(function(e, n) {
							var s = r.objectStore(t), c = a.isPrimaryKey ? s : s.index(a.name), l = i(o), u = l ? c.count(l) : c.count();
							u.onsuccess = _t(function(t) {
								return e(t.target.result);
							}), u.onerror = F(n);
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
				MAX_KEY: Vn(t),
				schema: c
			};
		}
		function Jn(e, t) {
			return t.reduce(function(e, t) {
				var r = t.create;
				return n(n({}, e), r(e));
			}, e);
		}
		function Yn(e, t, n, r) {
			var i = n.IDBKeyRange;
			return n.indexedDB, { dbcore: Jn(qn(t, i, r), e.dbcore) };
		}
		function Xn(e, t) {
			var n = t.db;
			e.core = Yn(e._middlewares, n, e._deps, t).dbcore, e.tables.forEach(function(t) {
				var n = t.name;
				e.core.schema.tables.some(function(e) {
					return e.name === n;
				}) && (t.core = e.core.table(n), e[n] instanceof e.Table && (e[n].core = t.core));
			});
		}
		function Zn(e, t, n, r) {
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
		function Qn(e, t) {
			t.forEach(function(t) {
				for (var n in t) t[n] instanceof e.Table && delete t[n];
			});
		}
		function $n(e, t) {
			return e._cfg.version - t._cfg.version;
		}
		function er(e, t, n, r) {
			var i = e._dbSchema;
			n.objectStoreNames.contains("$meta") && !i.$meta && (i.$meta = zn("$meta", pr("")[0], []), e._storeNames.push("$meta"));
			var o = e._createTransaction("readwrite", e._storeNames, i);
			o.create(n), o._completion.catch(r);
			var s = o._reject.bind(o), c = M.transless || M;
			wt(function() {
				if (M.trans = o, M.transless = c, t === 0) a(i).forEach(function(e) {
					ar(n, e, i[e].primKey, i[e].indexes);
				}), Xn(e, n), N.follow(function() {
					return e.on.populate.fire(o);
				}).catch(s);
				else return Xn(e, n), nr(e, o, t).then(function(t) {
					return rr(e, t, o, n);
				}).catch(s);
			});
		}
		function tr(e, t) {
			or(e._dbSchema, t), t.db.version % 10 == 0 && !t.objectStoreNames.contains("$meta") && t.db.createObjectStore("$meta").add(Math.ceil(t.db.version / 10 - 1), "version");
			var n = lr(e, e.idbdb, t);
			fr(e, e._dbSchema, t);
			for (var r = ir(n, e._dbSchema), i = function(e) {
				if (e.change.length || e.recreate) return console.warn(`Unable to patch indexes of table ${e.name} because it has changes on the type of index or primary key.`), { value: void 0 };
				var n = t.objectStore(e.name);
				e.add.forEach(function(t) {
					Fe && console.debug(`Dexie upgrade patch: Creating missing index ${e.name}.${t.src}`), cr(n, t);
				});
			}, a = 0, o = r.change; a < o.length; a++) {
				var s = o[a], c = i(s);
				if (typeof c == "object") return c.value;
			}
		}
		function nr(e, t, n) {
			return t.storeNames.includes("$meta") ? t.table("$meta").get("version").then(function(e) {
				return e ?? n;
			}) : N.resolve(n);
		}
		function rr(e, t, n, r) {
			var i = [], o = e._versions, s = e._dbSchema = lr(e, e.idbdb, r), c = o.filter(function(e) {
				return e._cfg.version >= t;
			});
			if (c.length === 0) return N.resolve();
			c.forEach(function(o) {
				i.push(function() {
					var i = s, c = o._cfg.dbschema;
					fr(e, i, r), fr(e, c, r), s = e._dbSchema = c;
					var l = ir(i, c);
					l.add.forEach(function(e) {
						ar(r, e[0], e[1].primKey, e[1].indexes);
					}), l.change.forEach(function(e) {
						if (e.recreate) throw new A.Upgrade("Not yet support for changing primary key");
						var t = r.objectStore(e.name);
						e.add.forEach(function(e) {
							return cr(t, e);
						}), e.change.forEach(function(e) {
							t.deleteIndex(e.name), cr(t, e);
						}), e.del.forEach(function(e) {
							return t.deleteIndex(e);
						});
					});
					var u = o._cfg.contentUpgrade;
					if (u && o._cfg.version > t) {
						Xn(e, r), n._memoizedTables = {};
						var d = ee(c);
						l.del.forEach(function(e) {
							d[e] = i[e];
						}), Qn(e, [e.Transaction.prototype]), Zn(e, [e.Transaction.prototype], a(d), d), n.schema = d;
						var f = fe(u);
						f && Tt();
						var p, m = N.follow(function() {
							if (p = u(n), p && f) {
								var e = Et.bind(null, null);
								p.then(e, e);
							}
						});
						return p && typeof p.then == "function" ? N.resolve(p) : m.then(function() {
							return p;
						});
					}
				}), i.push(function(t) {
					var r = o._cfg.dbschema;
					sr(r, t), Qn(e, [e.Transaction.prototype]), Zn(e, [e.Transaction.prototype], e._storeNames, e._dbSchema), n.schema = e._dbSchema;
				}), i.push(function(t) {
					e.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(e.idbdb.version / 10) === o._cfg.version ? (e.idbdb.deleteObjectStore("$meta"), delete e._dbSchema.$meta, e._storeNames = e._storeNames.filter(function(e) {
						return e !== "$meta";
					})) : t.objectStore("$meta").put(o._cfg.version, "version"));
				});
			});
			function l() {
				return i.length ? N.resolve(i.shift()(n.idbtrans)).then(l) : N.resolve();
			}
			return l().then(function() {
				or(s, r);
			});
		}
		function ir(e, t) {
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
		function ar(e, t, n, r) {
			var i = e.db.createObjectStore(t, n.keyPath ? {
				keyPath: n.keyPath,
				autoIncrement: n.auto
			} : { autoIncrement: n.auto });
			return r.forEach(function(e) {
				return cr(i, e);
			}), i;
		}
		function or(e, t) {
			a(e).forEach(function(n) {
				t.db.objectStoreNames.contains(n) || (Fe && console.debug("Dexie: Creating missing table", n), ar(t, n, e[n].primKey, e[n].indexes));
			});
		}
		function sr(e, t) {
			[].slice.call(t.db.objectStoreNames).forEach(function(n) {
				return e[n] == null && t.db.deleteObjectStore(n);
			});
		}
		function cr(e, t) {
			e.createIndex(t.name, t.keyPath, {
				unique: t.unique,
				multiEntry: t.multi
			});
		}
		function lr(e, t, n) {
			var r = {};
			return v(t.objectStoreNames, 0).forEach(function(e) {
				for (var t = n.objectStore(e), i = t.keyPath, a = Ln(Rn(i), i || "", !0, !1, !!t.autoIncrement, i && typeof i != "string", !0), o = [], s = 0; s < t.indexNames.length; ++s) {
					var c = t.index(t.indexNames[s]);
					i = c.keyPath;
					var l = Ln(c.name, i, !!c.unique, !!c.multiEntry, !1, i && typeof i != "string", !1);
					o.push(l);
				}
				r[e] = zn(e, a, o);
			}), r;
		}
		function ur(e, t, n) {
			e.verno = t.version / 10;
			var r = e._dbSchema = lr(e, t, n);
			e._storeNames = v(t.objectStoreNames, 0), Zn(e, [e._allTables], a(r), r);
		}
		function dr(e, t) {
			var n = ir(lr(e, e.idbdb, t), e._dbSchema);
			return !(n.add.length || n.change.some(function(e) {
				return e.add.length || e.change.length;
			}));
		}
		function fr(e, t, n) {
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
		function pr(e) {
			return e.split(",").map(function(e, t) {
				var n = e.split(":"), r = n[1]?.trim();
				e = n[0].trim();
				var i = e.replace(/([&*]|\+\+)/g, ""), a = /^\[/.test(i) ? i.match(/^\[(.*)\]$/)[1].split("+") : i;
				return Ln(i, a || null, /\&/.test(e), /\*/.test(e), /\+\+/.test(e), o(a), t === 0, r);
			});
		}
		var mr = function() {
			function e() {}
			return e.prototype._createTableSchema = function(e, t, n) {
				return zn(e, t, n);
			}, e.prototype._parseIndexSyntax = function(e) {
				return pr(e);
			}, e.prototype._parseStoresSpec = function(e, t) {
				var n = this;
				a(e).forEach(function(r) {
					if (e[r] !== null) {
						var i = n._parseIndexSyntax(e[r]), a = i.shift();
						if (!a) throw new A.Schema("Invalid schema for table " + r + ": " + e[r]);
						if (a.unique = !0, a.multi) throw new A.Schema("Primary key cannot be multiEntry*");
						i.forEach(function(e) {
							if (e.auto) throw new A.Schema("Only primary key can be marked as autoIncrement (++)");
							if (!e.keyPath) throw new A.Schema("Index must have a name and cannot be an empty string");
						}), t[r] = n._createTableSchema(r, a, i);
					}
				});
			}, e.prototype.stores = function(e) {
				var t = this.db;
				this._cfg.storesSource = this._cfg.storesSource ? s(this._cfg.storesSource, e) : e;
				var n = t._versions, r = {}, i = {};
				return n.forEach(function(e) {
					s(r, e._cfg.storesSource), i = e._cfg.dbschema = {}, e._parseStoresSpec(r, i);
				}), t._dbSchema = i, Qn(t, [
					t._allTables,
					t,
					t.Transaction.prototype
				]), Zn(t, [
					t._allTables,
					t,
					t.Transaction.prototype,
					this._cfg.tables
				], a(i), i), t._storeNames = a(i), this;
			}, e.prototype.upgrade = function(e) {
				return this._cfg.contentUpgrade = Pe(this._cfg.contentUpgrade || Ee, e), this;
			}, e;
		}();
		function hr(e) {
			return sn(mr.prototype, function(t) {
				this.db = e, this._cfg = {
					version: t,
					storesSource: null,
					dbschema: {},
					tables: {},
					contentUpgrade: null
				};
			});
		}
		var gr = _r();
		function _r() {
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
		function vr(e, t) {
			var n = e._dbNamesDB;
			return n || (n = e._dbNamesDB = new vi(Ut, {
				addons: [],
				indexedDB: e,
				IDBKeyRange: t
			}), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
		}
		function yr(e) {
			return e && typeof e.databases == "function";
		}
		function br(e) {
			var t = e.indexedDB, n = e.IDBKeyRange;
			return yr(t) ? Promise.resolve(t.databases()).then(function(e) {
				return e.map(function(e) {
					return e.name;
				}).filter(function(e) {
					return e !== Ut;
				});
			}) : vr(t, n).toCollection().primaryKeys();
		}
		function xr(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!yr(n) && t !== Ut && vr(n, r).put({ name: t }).catch(Ee);
		}
		function Sr(e, t) {
			var n = e.indexedDB, r = e.IDBKeyRange;
			!yr(n) && t !== Ut && vr(n, r).delete(t).catch(Ee);
		}
		function Cr(e) {
			return wt(function() {
				return M.letThrough = !0, e();
			});
		}
		function wr() {
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
		var Tr;
		function Er(e) {
			return !("from" in e);
		}
		var Dr = function(e, t) {
			if (this) s(this, arguments.length ? {
				d: 1,
				from: e,
				to: arguments.length > 1 ? t : e
			} : { d: 0 });
			else {
				var n = new Dr();
				return e && "d" in e && s(n, e), n;
			}
		};
		d(Dr.prototype, (Tr = {
			add: function(e) {
				return kr(this, e), this;
			},
			addKey: function(e) {
				return Or(this, e, e), this;
			},
			addKeys: function(e) {
				var t = this;
				return e.forEach(function(e) {
					return Or(t, e, e);
				}), this;
			},
			hasKey: function(e) {
				var t = jr(this).next(e).value;
				return t && Xt(t.from, e) <= 0 && Xt(t.to, e) >= 0;
			}
		}, Tr[se] = function() {
			return jr(this);
		}, Tr));
		function Or(e, t, n) {
			var r = Xt(t, n);
			if (!isNaN(r)) {
				if (r > 0) throw RangeError();
				if (Er(e)) return s(e, {
					from: t,
					to: n,
					d: 1
				});
				var i = e.l, a = e.r;
				if (Xt(n, e.from) < 0) return i ? Or(i, t, n) : e.l = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, Mr(e);
				if (Xt(t, e.to) > 0) return a ? Or(a, t, n) : e.r = {
					from: t,
					to: n,
					d: 1,
					l: null,
					r: null
				}, Mr(e);
				Xt(t, e.from) < 0 && (e.from = t, e.l = null, e.d = a ? a.d + 1 : 1), Xt(n, e.to) > 0 && (e.to = n, e.r = null, e.d = e.l ? e.l.d + 1 : 1);
				var o = !e.r;
				i && !e.l && kr(e, i), a && o && kr(e, a);
			}
		}
		function kr(e, t) {
			function n(e, t) {
				var r = t.from, i = t.to, a = t.l, o = t.r;
				Or(e, r, i), a && n(e, a), o && n(e, o);
			}
			Er(t) || n(e, t);
		}
		function Ar(e, t) {
			var n = jr(t), r = n.next();
			if (r.done) return !1;
			for (var i = r.value, a = jr(e), o = a.next(i.from), s = o.value; !r.done && !o.done;) {
				if (Xt(s.from, i.to) <= 0 && Xt(s.to, i.from) >= 0) return !0;
				Xt(i.from, s.from) < 0 ? i = (r = n.next(s.from)).value : s = (o = a.next(i.from)).value;
			}
			return !1;
		}
		function jr(e) {
			var t = Er(e) ? null : {
				s: 0,
				n: e
			};
			return { next: function(e) {
				for (var n = arguments.length > 0; t;) switch (t.s) {
					case 0: if (t.s = 1, n) for (; t.n.l && Xt(e, t.n.from) < 0;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					else for (; t.n.l;) t = {
						up: t,
						n: t.n.l,
						s: 1
					};
					case 1: if (t.s = 2, !n || Xt(e, t.n.to) <= 0) return {
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
		function Mr(e) {
			var t = (e.r?.d || 0) - (e.l?.d || 0), r = t > 1 ? "r" : t < -1 ? "l" : "";
			if (r) {
				var i = r === "r" ? "l" : "r", a = n({}, e), o = e[r];
				e.from = o.from, e.to = o.to, e[r] = o[r], a[r] = o[i], e[i] = a, a.d = Nr(a);
			}
			e.d = Nr(e);
		}
		function Nr(e) {
			var t = e.r, n = e.l;
			return (t ? n ? Math.max(t.d, n.d) : t.d : n ? n.d : 0) + 1;
		}
		function Pr(e, t) {
			return a(t).forEach(function(n) {
				e[n] ? kr(e[n], t[n]) : e[n] = ne(t[n]);
			}), e;
		}
		function I(e, t) {
			return e.all || t.all || Object.keys(e).some(function(n) {
				return t[n] && Ar(t[n], e[n]);
			});
		}
		var Fr = {}, Ir = {}, Lr = !1;
		function Rr(e, t) {
			Pr(Ir, e), Lr || (Lr = !0, setTimeout(function() {
				Lr = !1;
				var e = Ir;
				Ir = {}, zr(e, !1);
			}, 0));
		}
		function zr(e, t) {
			t === void 0 && (t = !1);
			var n = /* @__PURE__ */ new Set();
			if (e.all) for (var r = 0, i = Object.values(Fr); r < i.length; r++) {
				var a = i[r];
				Br(a, e, n, t);
			}
			else for (var o in e) {
				var s = /^idb\:\/\/(.*)\/(.*)\//.exec(o);
				if (s) {
					var a = Fr[`idb://${s[1]}/${s[2]}`];
					a && Br(a, e, n, t);
				}
			}
			n.forEach(function(e) {
				return e();
			});
		}
		function Br(e, t, n, r) {
			for (var i = [], a = 0, o = Object.entries(e.queries.query); a < o.length; a++) {
				for (var s = o[a], c = s[0], l = s[1], u = [], d = 0, f = l; d < f.length; d++) {
					var p = f[d];
					I(t, p.obsSet) ? p.subscribers.forEach(function(e) {
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
		function Vr(e) {
			var t = e._state, n = e._deps.indexedDB;
			if (t.isBeingOpened || e.idbdb) return t.dbReadyPromise.then(function() {
				return t.dbOpenError ? Ft(t.dbOpenError) : e;
			});
			t.isBeingOpened = !0, t.dbOpenError = null, t.openComplete = !1;
			var r = t.openCanceller, a = Math.round(e.verno * 10), o = !1;
			function s() {
				if (t.openCanceller !== r) throw new A.DatabaseClosed("db.open() was cancelled");
			}
			var c = t.dbReadyResolve, l = null, u = !1, d = function() {
				return new N(function(r, i) {
					if (s(), !n) throw new A.MissingAPI();
					var c = e.name, f = t.autoSchema || !a ? n.open(c) : n.open(c, a);
					if (!f) throw new A.MissingAPI();
					f.onerror = F(i), f.onblocked = _t(e._fireOnBlocked), f.onupgradeneeded = _t(function(r) {
						if (l = f.transaction, t.autoSchema && !e._options.allowEmptyDB) {
							f.onerror = jn, l.abort(), f.result.close();
							var a = n.deleteDatabase(c);
							a.onsuccess = a.onerror = _t(function() {
								i(new A.NoSuchDatabase(`Database ${c} doesnt exist`));
							});
						} else {
							l.onerror = F(i);
							var s = r.oldVersion > 2 ** 62 ? 0 : r.oldVersion;
							u = s < 1, e.idbdb = f.result, o && tr(e, l), er(e, s / 10, l, i);
						}
					}, i), f.onsuccess = _t(function() {
						l = null;
						var n = e.idbdb = f.result, i = v(n.objectStoreNames);
						if (i.length > 0) try {
							var s = n.transaction(Bn(i), "readonly");
							if (t.autoSchema) ur(e, n, s);
							else if (fr(e, e._dbSchema, s), !dr(e, s) && !o) return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), n.close(), a = n.version + 1, o = !0, r(d());
							Xn(e, s);
						} catch {}
						gr.add(e), n.onversionchange = _t(function(n) {
							t.vcFired = !0, e.on("versionchange").fire(n);
						}), n.onclose = _t(function() {
							e.close({ disableAutoOpen: !1 });
						}), u && xr(e._deps, c), r();
					}, i);
				}).catch(function(e) {
					switch (e?.name) {
						case "UnknownError":
							if (t.PR1398_maxLoop > 0) return t.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), d();
							break;
						case "VersionError": if (a > 0) return a = 0, d();
					}
					return N.reject(e);
				});
			}, f = typeof navigator < "u" && !!n && n === i.indexedDB;
			return N.race([r, (f ? wr() : N.resolve()).then(d)]).then(function() {
				return s(), t.onReadyBeingFired = [], N.resolve(Cr(function() {
					return e.on.ready.fire(e.vip);
				})).then(function n() {
					if (t.onReadyBeingFired.length > 0) {
						var r = t.onReadyBeingFired.reduce(Pe, Ee);
						return t.onReadyBeingFired = [], N.resolve(Cr(function() {
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
				return r === t.openCanceller && e._close(), Ft(n);
			}).finally(function() {
				t.openComplete = !0, c();
			}).then(function() {
				if (u) {
					var t = {};
					e.tables.forEach(function(n) {
						n.schema.indexes.forEach(function(r) {
							r.name && (t[`idb://${e.name}/${n.name}/${r.name}`] = new Dr(-Infinity, [[[]]]));
						}), t[`idb://${e.name}/${n.name}/`] = t[`idb://${e.name}/${n.name}/:dels`] = new Dr(-Infinity, [[[]]]);
					}), Pn(Mn).fire(t), zr(t, !0);
				}
				return e;
			});
		}
		function Hr(e) {
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
		function Ur(e, t, n) {
			var r = arguments.length;
			if (r < 2) throw new A.InvalidArgument("Too few arguments");
			for (var i = Array(r - 1); --r;) i[r - 1] = arguments[r];
			return n = i.pop(), [
				e,
				D(i),
				n
			];
		}
		function Wr(e, t, n, r, i) {
			return N.resolve().then(function() {
				var a = M.transless || M, o = e._createTransaction(t, n, e._dbSchema, r);
				o.explicit = !0;
				var s = {
					trans: o,
					transless: a
				};
				if (r) o.idbtrans = r.idbtrans;
				else try {
					o.create(), o.idbtrans._explicit = !0, e._state.PR1398_maxLoop = 3;
				} catch (r) {
					return r.name === xe.InvalidState && e.isOpen() && --e._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), e.close({ disableAutoOpen: !1 }), e.open().then(function() {
						return Wr(e, t, n, null, i);
					})) : Ft(r);
				}
				var c = fe(i);
				c && Tt();
				var l, u = N.follow(function() {
					if (l = i.call(o, o), l) {
						if (c) {
							var e = Et.bind(null, null);
							l.then(e, e);
						} else typeof l.next == "function" && typeof l.throw == "function" && (l = Hr(l));
					}
				}, s);
				return (l && typeof l.then == "function" ? N.resolve(l).then(function(e) {
					return o.active ? e : Ft(new A.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
				}) : u.then(function() {
					return l;
				})).then(function(e) {
					return r && o._resolve(), o._completion.then(function() {
						return e;
					});
				}).catch(function(e) {
					return o._reject(e), Ft(e);
				});
			});
		}
		function Gr(e, t, n) {
			for (var r = o(e) ? e.slice() : [e], i = 0; i < n; ++i) r.push(t);
			return r;
		}
		function Kr(e) {
			return n(n({}, e), { table: function(t) {
				var r = e.table(t), i = r.schema, a = Object.create(null), o = [];
				function s(e, t, r) {
					var i = Kn(e), c = a[i] = a[i] || [], l = e == null ? 0 : typeof e == "string" ? 1 : e.length, u = t > 0, d = n(n({}, r), {
						name: u ? `${i}(virtual-from:${r.name})` : r.name,
						lowLevelIndex: r,
						isVirtual: u,
						keyTail: t,
						keyLength: l,
						extractKey: Hn(e),
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
					var t = a[Kn(e)];
					return t && t[0];
				}
				function p(t, n) {
					return {
						type: t.type === 1 ? 2 : t.type,
						lower: Gr(t.lower, t.lowerOpen ? e.MAX_KEY : e.MIN_KEY, n),
						lowerOpen: !0,
						upper: Gr(t.upper, t.upperOpen ? e.MIN_KEY : e.MAX_KEY, n),
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
								r == null ? t.unique ? n.continue(n.key.slice(0, o).concat(t.reverse ? e.MIN_KEY : e.MAX_KEY, i)) : n.continue() : n.continue(Gr(r, t.reverse ? e.MAX_KEY : e.MIN_KEY, i));
							}
							return Object.create(n, {
								continue: { value: r },
								continuePrimaryKey: { value: function(t, r) {
									n.continuePrimaryKey(Gr(t, e.MAX_KEY, i), r);
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
		var qr = {
			stack: "dbcore",
			name: "VirtualIndexMiddleware",
			level: 1,
			create: Kr
		};
		function Jr(e, t, n, r) {
			return n ||= {}, r ||= "", a(e).forEach(function(i) {
				if (!u(t, i)) n[r + i] = void 0;
				else {
					var a = e[i], o = t[i];
					if (typeof a == "object" && typeof o == "object" && a && o) {
						var s = oe(a);
						s === oe(o) ? s === "Object" ? Jr(a, o, n, r + i + ".") : a !== o && (n[r + i] = t[i]) : n[r + i] = t[i];
					} else a !== o && (n[r + i] = t[i]);
				}
			}), a(t).forEach(function(i) {
				u(e, i) || (n[r + i] = t[i]);
			}), n;
		}
		function Yr(e, t) {
			return t.type === "delete" ? t.keys : t.keys || t.values.map(e.extractKey);
		}
		var Xr = {
			stack: "dbcore",
			name: "HooksMiddleware",
			level: 2,
			create: function(e) {
				return n(n({}, e), { table: function(t) {
					var i = e.table(t), a = i.schema.primaryKey;
					return n(n({}, i), { mutate: function(e) {
						var o = M.trans, s = o.table(t).hook, c = s.deleting, l = s.creating, d = s.updating;
						switch (e.type) {
							case "add":
								if (l.fire === Ee) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "put":
								if (l.fire === Ee && d.fire === Ee) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "delete":
								if (c.fire === Ee) break;
								return o._promise("readwrite", function() {
									return f(e);
								}, !0);
							case "deleteRange":
								if (c.fire === Ee) break;
								return o._promise("readwrite", function() {
									return p(e);
								}, !0);
						}
						return i.mutate(e);
						function f(e) {
							var t = M.trans, o = e.keys || Yr(a, e);
							if (!o) throw Error("Keys missing");
							return e = e.type === "add" || e.type === "put" ? n(n({}, e), { keys: o }) : n({}, e), e.type !== "delete" && (e.values = r([], e.values, !0)), e.keys && (e.keys = r([], e.keys, !0)), Zr(i, e, o).then(function(n) {
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
										var p = Jr(o, e.values[i]), m = d.fire.call(s, p, r, o, t);
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
		function Zr(e, t, n) {
			return t.type === "add" ? Promise.resolve([]) : e.getMany({
				trans: t.trans,
				keys: n,
				cache: "immutable"
			});
		}
		function Qr(e, t, n) {
			try {
				if (!t || t.keys.length < e.length) return null;
				for (var r = [], i = 0, a = 0; i < t.keys.length && a < e.length; ++i) Xt(t.keys[i], e[a]) === 0 && (r.push(n ? ie(t.values[i]) : t.values[i]), ++a);
				return r.length === e.length ? r : null;
			} catch {
				return null;
			}
		}
		var $r = {
			stack: "dbcore",
			level: -1,
			create: function(e) {
				return { table: function(t) {
					var r = e.table(t);
					return n(n({}, r), {
						getMany: function(e) {
							if (!e.cache) return r.getMany(e);
							var t = Qr(e.keys, e.trans._cache, e.cache === "clone");
							return t ? N.resolve(t) : r.getMany(e).then(function(t) {
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
		function ei(e, t) {
			return e.trans.mode === "readonly" && !!e.subscr && !e.trans.explicit && e.trans.db._options.cache !== "disabled" && !t.schema.primaryKey.outbound;
		}
		function ti(e, t) {
			switch (e) {
				case "query": return t.values && !t.unique;
				case "get": return !1;
				case "getMany": return !1;
				case "count": return !1;
				case "openCursor": return !1;
			}
		}
		var ni = {
			stack: "dbcore",
			level: 0,
			name: "Observability",
			create: function(e) {
				var t = e.schema.name, r = new Dr(e.MIN_KEY, e.MAX_KEY);
				return n(n({}, e), {
					transaction: function(t, n, r) {
						if (M.subscr && n !== "readonly") throw new A.ReadOnly(`Readwrite transaction in liveQuery context. Querier source: ${M.querier}`);
						return e.transaction(t, n, r);
					},
					table: function(i) {
						var s = e.table(i), c = s.schema, l = c.primaryKey, u = c.indexes, d = l.extractKey, f = l.outbound, p = l.autoIncrement && u.filter(function(e) {
							return e.compound && e.keyPath.includes(l.keyPath);
						}), m = n(n({}, s), { mutate: function(n) {
							var a = n.trans, u = n.mutatedParts ||= {}, d = function(e) {
								var n = `idb://${t}/${i}/${e}`;
								return u[n] || (u[n] = new Dr());
							}, f = d(""), m = d(":dels"), h = n.type, g = n.type === "deleteRange" ? [n.range] : n.type === "delete" ? [n.keys] : n.values.length < 50 ? [Yr(l, n).filter(function(e) {
								return e != null;
							}), n.values] : [], _ = g[0], v = g[1], y = n.trans._cache;
							if (o(_)) {
								f.addKeys(_);
								var b = h === "delete" || _.length === v.length ? Qr(_, y) : null;
								b || m.addKeys(_), (b || v) && ri(d, c, b, v);
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
								})), a.mutatedParts = Pr(a.mutatedParts || {}, u), e;
							});
						} }), h = function(t) {
							var n = t.query, r = n.index, i = n.range;
							return [r, new Dr(i.lower ?? e.MIN_KEY, i.upper ?? e.MAX_KEY)];
						}, g = {
							get: function(e) {
								return [l, new Dr(e.key)];
							},
							getMany: function(e) {
								return [l, new Dr().addKeys(e.keys)];
							},
							count: h,
							query: h,
							openCursor: h
						};
						return a(g).forEach(function(e) {
							m[e] = function(a) {
								var o = M.subscr, c = !!o, l = ei(M, s) && ti(e, a) ? a.obsSet = {} : o;
								if (c) {
									var u = function(e) {
										var n = `idb://${t}/${i}/${e}`;
										return l[n] || (l[n] = new Dr());
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
		function ri(e, t, n, r) {
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
					Xt(i, o) !== 0 && (i != null && s(i), o != null && s(o));
				});
			}
			t.indexes.forEach(i);
		}
		function ii(e, t, r) {
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
		function ai(e, t) {
			return t.lower === void 0 ? !0 : t.lowerOpen ? Xt(e, t.lower) > 0 : Xt(e, t.lower) >= 0;
		}
		function oi(e, t) {
			return t.upper === void 0 ? !0 : t.upperOpen ? Xt(e, t.upper) < 0 : Xt(e, t.upper) <= 0;
		}
		function si(e, t) {
			return ai(e, t) && oi(e, t);
		}
		function ci(e, t, n, r, i, a) {
			if (!n || n.length === 0) return e;
			var s = t.query.index, c = s.multiEntry, l = t.query.range, u = r.schema.primaryKey.extractKey, d = s.extractKey, f = (s.lowLevelIndex || s).extractKey, p = n.reduce(function(e, n) {
				var r = e, i = [];
				if (n.type === "add" || n.type === "put") for (var a = new Dr(), s = n.values.length - 1; s >= 0; --s) {
					var f = n.values[s], p = u(f);
					if (!a.hasKey(p)) {
						var m = d(f);
						(c && o(m) ? m.some(function(e) {
							return si(e, l);
						}) : si(m, l)) && (a.addKey(p), i.push(f));
					}
				}
				switch (n.type) {
					case "add":
						var h = new Dr().addKeys(t.values ? e.map(function(e) {
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
						var g = new Dr().addKeys(n.values.map(function(e) {
							return u(e);
						}));
						r = e.filter(function(e) {
							return !g.hasKey(t.values ? u(e) : e);
						}).concat(t.values ? i : i.map(function(e) {
							return u(e);
						}));
						break;
					case "delete":
						var _ = new Dr().addKeys(n.keys);
						r = e.filter(function(e) {
							return !_.hasKey(t.values ? u(e) : e);
						});
						break;
					case "deleteRange":
						var v = n.range;
						r = e.filter(function(e) {
							return !si(u(e), v);
						});
				}
				return r;
			}, e);
			if (p === e) return e;
			var m = function(e, t) {
				return Xt(f(e), f(t)) || Xt(u(e), u(t));
			};
			return p.sort(t.direction === "prev" || t.direction === "prevunique" ? function(e, t) {
				return m(t, e);
			} : m), t.limit && t.limit < Infinity && (p.length > t.limit ? p.length = t.limit : e.length === t.limit && p.length < t.limit && (i.dirty = !0)), a ? Object.freeze(p) : p;
		}
		function li(e, t) {
			return Xt(e.lower, t.lower) === 0 && Xt(e.upper, t.upper) === 0 && !!e.lowerOpen == !!t.lowerOpen && !!e.upperOpen == !!t.upperOpen;
		}
		function ui(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : -1;
			if (t === void 0) return 1;
			var i = Xt(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return 1;
				if (r) return -1;
			}
			return i;
		}
		function di(e, t, n, r) {
			if (e === void 0) return t === void 0 ? 0 : 1;
			if (t === void 0) return -1;
			var i = Xt(e, t);
			if (i === 0) {
				if (n && r) return 0;
				if (n) return -1;
				if (r) return 1;
			}
			return i;
		}
		function fi(e, t) {
			return ui(e.lower, t.lower, e.lowerOpen, t.lowerOpen) <= 0 && di(e.upper, t.upper, e.upperOpen, t.upperOpen) >= 0;
		}
		function pi(e, t, n, r) {
			var i = Fr[`idb://${e}/${t}`];
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
						return e.req.limit === r.limit && e.req.values === r.values && (e.req.direction ?? "next") === s && li(e.req.query.range, r.query.range);
					});
					return c ? [
						c,
						!0,
						i,
						o
					] : [
						o.find(function(e) {
							return ("limit" in e.req ? e.req.limit : Infinity) >= r.limit && (e.req.direction ?? "next") === s && (!r.values || e.req.values) && fi(e.req.query.range, r.query.range);
						}),
						!1,
						i,
						o
					];
				case "count":
					var l = o.find(function(e) {
						return li(e.req.query.range, r.query.range);
					});
					return [
						l,
						!!l,
						i,
						o
					];
			}
		}
		function mi(e, t, n, r) {
			e.subscribers.add(n), r.addEventListener("abort", function() {
				e.subscribers.delete(n), e.subscribers.size === 0 && hi(e, t);
			});
		}
		function hi(e, t) {
			setTimeout(function() {
				e.subscribers.size === 0 && le(t, e);
			}, 3e3);
		}
		var gi = {
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
											var u = l[c], d = Fr[`idb://${t}/${u}`];
											if (d) {
												var f = e.table(u), p = d.optimisticOps.filter(function(e) {
													return e.trans === a;
												});
												if (a._explicit && i && a.mutatedParts) for (var m = 0, h = Object.values(d.queries.query); m < h.length; m++) for (var g = h[m], _ = 0, v = g.slice(); _ < v.length; _++) {
													var y = v[_];
													I(y.obsSet, a.mutatedParts) && (le(g, y), y.subscribers.forEach(function(e) {
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
																var w = Object.isFrozen(y.res), T = ci(y.res, y.req, p, f, y, w);
																y.dirty ? (le(g, y), y.subscribers.forEach(function(e) {
																	return s.add(e);
																})) : T !== y.res && (y.res = T, y.promise = N.resolve({ result: T }));
															} else y.dirty && le(g, y), y.subscribers.forEach(function(e) {
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
								var o = M.trans;
								if (a.outbound || o.db._options.cache === "disabled" || o.explicit || o.idbtrans.mode !== "readwrite") return i.mutate(e);
								var s = Fr[`idb://${t}/${r}`];
								if (!s) return i.mutate(e);
								var c = i.mutate(e);
								return (e.type === "add" || e.type === "put") && (e.values.length >= 50 || Yr(a, e).some(function(e) {
									return e == null;
								})) ? c.then(function(t) {
									var r = ii(s, n(n({}, e), { values: e.values.map(function(e, r) {
										if (t.failures[r]) return e;
										var i = a.keyPath?.includes(".") ? ie(e) : n({}, e);
										return w(i, a.keyPath, t.results[r]), i;
									}) }), t);
									s.optimisticOps.push(r), queueMicrotask(function() {
										return e.mutatedParts && Rr(e.mutatedParts);
									});
								}) : (s.optimisticOps.push(e), e.mutatedParts && Rr(e.mutatedParts), c.then(function(t) {
									if (t.numFailures > 0) {
										le(s.optimisticOps, e);
										var n = ii(s, e, t);
										n && s.optimisticOps.push(n), e.mutatedParts && Rr(e.mutatedParts);
									}
								}), c.catch(function() {
									le(s.optimisticOps, e), e.mutatedParts && Rr(e.mutatedParts);
								})), c;
							},
							query: function(e) {
								if (!ei(M, i) || !ti("query", e)) return i.query(e);
								var n = M.trans?.db._options.cache === "immutable", a = M, o = a.requery, s = a.signal, c = pi(t, r, "query", e), l = c[0], u = c[1], d = c[2], f = c[3];
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
										return f && l && le(f, l), Promise.reject(e);
									});
									l = {
										obsSet: e.obsSet,
										promise: p,
										subscribers: /* @__PURE__ */ new Set(),
										type: "query",
										req: e,
										dirty: !1
									}, f ? f.push(l) : (f = [l], d ||= Fr[`idb://${t}/${r}`] = {
										queries: {
											query: {},
											count: {}
										},
										objs: /* @__PURE__ */ new Map(),
										optimisticOps: [],
										unsignaledParts: {}
									}, d.queries.query[e.query.index.name || ""] = f);
								}
								return mi(l, f, o, s), l.promise.then(function(t) {
									var r = ci(t.result, e, d?.optimisticOps, i, l, n);
									return { result: n ? r : ie(r) };
								});
							}
						});
					}
				});
			}
		};
		function _i(e, t) {
			return new Proxy(e, { get: function(e, n, r) {
				return n === "db" ? t : Reflect.get(e, n, r);
			} });
		}
		var vi = function() {
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
					maxConnections: Ht
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
					dbReadyResolve: Ee,
					dbReadyPromise: null,
					cancelOpen: Ee,
					openCanceller: null,
					autoSchema: !0,
					PR1398_maxLoop: 3,
					autoOpen: r.autoOpen
				};
				s.dbReadyPromise = new N(function(e) {
					s.dbReadyResolve = e;
				}), s.openCanceller = new N(function(e, t) {
					s.cancelOpen = t;
				}), this._state = s, this.name = t, this.on = on(this, "populate", "blocked", "versionchange", "close", { ready: [Pe, Ee] }), this.once = function(e, t) {
					var n = function() {
						var r = [...arguments];
						i.on(e).unsubscribe(n), t.apply(i, r);
					};
					return i.on(e, n);
				}, this.on.ready.subscribe = y(this.on.ready.subscribe, function(t) {
					return function(n, r) {
						e.vip(function() {
							var e = i._state;
							if (e.openComplete) e.dbOpenError || N.resolve().then(n), r && t(n);
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
				}), this.Collection = yn(this), this.Table = cn(this), this.Transaction = In(this), this.Version = hr(this), this.WhereClause = An(this), this.on("versionchange", function(e) {
					e.newVersion > 0 ? console.warn(`Another connection wants to upgrade database '${i.name}'. Closing db now to resume the upgrade.`) : console.warn(`Another connection wants to delete database '${i.name}'. Closing db now to resume the delete request.`), i.close({ disableAutoOpen: !1 });
				}), this.on("blocked", function(e) {
					!e.newVersion || e.newVersion < e.oldVersion ? console.warn(`Dexie.delete('${i.name}') was blocked`) : console.warn(`Upgrade '${i.name}' blocked by other connection holding version ${e.oldVersion / 10}`);
				}), this._maxKey = Vn(r.IDBKeyRange), this._createTransaction = function(e, t, n, r) {
					return new i.Transaction(e, t, n, i._options.chromeTransactionDurability, r);
				}, this._fireOnBlocked = function(e) {
					i.on("blocked").fire(e), gr.toArray().filter(function(e) {
						return e.name === i.name && e !== i && !e._state.vcFired;
					}).map(function(t) {
						return t.on("versionchange").fire(e);
					});
				}, this.use($r), this.use(gi), this.use(ni), this.use(qr), this.use(Xr);
				var c = new Proxy(this, { get: function(e, t, n) {
					if (t === "_vip") return !0;
					if (t === "table") return function(e) {
						return _i(i.table(e), c);
					};
					var r = Reflect.get(e, t, n);
					return r instanceof an ? _i(r, c) : t === "tables" ? r.map(function(e) {
						return _i(e, c);
					}) : t === "_createTransaction" ? function() {
						return _i(r.apply(this, arguments), c);
					} : r;
				} });
				this.vip = c, o.forEach(function(e) {
					return e(i);
				});
			}
			return e.prototype.version = function(e) {
				if (isNaN(e) || e < .1) throw new A.Type("Given version is not a positive number");
				if (e = Math.round(e * 10) / 10, this.idbdb || this._state.isBeingOpened) throw new A.Schema("Cannot add version when database is open");
				this.verno = Math.max(this.verno, e);
				var t = this._versions, n = t.filter(function(t) {
					return t._cfg.version === e;
				})[0];
				return n || (n = new this.Version(e), t.push(n), t.sort($n), n.stores({}), this._state.autoSchema = !1, n);
			}, e.prototype._whenReady = function(e) {
				var t = this;
				return this.idbdb && (this._state.openComplete || M.letThrough || this._vip) ? e() : new N(function(e, n) {
					if (t._state.openComplete) return n(new A.DatabaseClosed(t._state.dbOpenError));
					if (!t._state.isBeingOpened) {
						if (!t._state.autoOpen) {
							n(new A.DatabaseClosed());
							return;
						}
						t.open().catch(Ee);
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
				return Mt(Qe, function() {
					return Vr(e);
				});
			}, e.prototype._close = function() {
				this.on.close.fire(new CustomEvent("close"));
				var e = this._state;
				if (gr.remove(this), this.idbdb) {
					try {
						this.idbdb.close();
					} catch {}
					this.idbdb = null;
				}
				e.isBeingOpened || (e.dbReadyPromise = new N(function(t) {
					e.dbReadyResolve = t;
				}), e.openCanceller = new N(function(t, n) {
					e.cancelOpen = n;
				}));
			}, e.prototype.close = function(e) {
				var t = (e === void 0 ? { disableAutoOpen: !0 } : e).disableAutoOpen, n = this._state;
				t ? (n.isBeingOpened && n.cancelOpen(new A.DatabaseClosed()), this._close(), n.autoOpen = !1, n.dbOpenError = new A.DatabaseClosed()) : (this._close(), n.autoOpen = this._options.autoOpen || n.isBeingOpened, n.openComplete = !1, n.dbOpenError = null);
			}, e.prototype.delete = function(e) {
				var t = this;
				e === void 0 && (e = { disableAutoOpen: !0 });
				var n = arguments.length > 0 && typeof arguments[0] != "object", r = this._state;
				return new N(function(i, a) {
					var o = function() {
						t.close(e);
						var n = t._deps.indexedDB.deleteDatabase(t.name);
						n.onsuccess = _t(function() {
							Sr(t._deps, t.name), i();
						}), n.onerror = F(a), n.onblocked = t._fireOnBlocked;
					};
					if (n) throw new A.InvalidArgument("Invalid closeOptions argument to db.delete()");
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
				var e = Ur.apply(this, arguments);
				return this._transaction.apply(this, e);
			}, e.prototype._transaction = function(e, t, n) {
				var r = this, i = M.trans;
				i && i.db === this && e.indexOf("!") === -1 || (i = null);
				var a = e.indexOf("?") !== -1;
				e = e.replace("!", "").replace("?", "");
				var o, s;
				try {
					if (s = t.map(function(e) {
						var t = e instanceof r.Table ? e.name : e;
						if (typeof t != "string") throw TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
						return t;
					}), e == "r" || e === Wt) o = Wt;
					else if (e == "rw" || e == Gt) o = Gt;
					else throw new A.InvalidArgument("Invalid transaction mode: " + e);
					if (i) {
						if (i.mode === Wt && o === Gt) {
							if (a) i = null;
							else throw new A.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
						}
						i && s.forEach(function(e) {
							if (i && i.storeNames.indexOf(e) === -1) {
								if (a) i = null;
								else throw new A.SubTransaction("Table " + e + " not included in parent transaction.");
							}
						}), a && i && !i.active && (i = null);
					}
				} catch (e) {
					return i ? i._promise(null, function(t, n) {
						n(e);
					}) : Ft(e);
				}
				var c = Wr.bind(null, this, o, s, i, n);
				return i ? i._promise(o, c, "lock") : M.trans ? Mt(M.transless, function() {
					return r._whenReady(c);
				}) : this._whenReady(c);
			}, e.prototype.table = function(e) {
				if (!u(this._allTables, e)) throw new A.InvalidTable(`Table ${e} does not exist`);
				return this._allTables[e];
			}, e;
		}(), yi = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable", bi = function() {
			function e(e) {
				this._subscribe = e;
			}
			return e.prototype.subscribe = function(e, t, n) {
				return this._subscribe(!e || typeof e == "function" ? {
					next: e,
					error: t,
					complete: n
				} : e);
			}, e.prototype[yi] = function() {
				return this;
			}, e;
		}(), xi;
		try {
			xi = {
				indexedDB: i.indexedDB || i.mozIndexedDB || i.webkitIndexedDB || i.msIndexedDB,
				IDBKeyRange: i.IDBKeyRange || i.webkitIDBKeyRange
			};
		} catch {
			xi = {
				indexedDB: null,
				IDBKeyRange: null
			};
		}
		function Si(e) {
			var t = !1, n, r = new bi(function(r) {
				var i = fe(e);
				function a(t) {
					var n = ut();
					try {
						i && Tt();
						var r = wt(e, t);
						return i && (r = r.finally(Et)), r;
					} finally {
						n && dt();
					}
				}
				var o = !1, s, c = {}, l = {}, u = {
					get closed() {
						return o;
					},
					unsubscribe: function() {
						o || (o = !0, s && s.abort(), d && Pn.storagemutated.unsubscribe(m));
					}
				};
				r.start && r.start(u);
				var d = !1, f = function() {
					return Pt(h);
				};
				function p() {
					return I(l, c);
				}
				var m = function(e) {
					Pr(c, e), p() && f();
				}, h = function() {
					if (!o && xi.indexedDB) {
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
						d ||= (Pn.storagemutated.subscribe(m), !0), Promise.resolve(h).then(function(e) {
							t = !0, n = e, !(o || u.signal.aborted) && (p() ? f() : (l = i, p() ? f() : (c = {}, Pt(function() {
								return !o && r.next && r.next(e);
							}))));
						}, function(e) {
							o || u.signal.aborted || (t = !1, ["DatabaseClosedError", "AbortError"].includes(e?.name) || o || Pt(function() {
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
		var Ci = vi;
		d(Ci, n(n({}, Te), {
			delete: function(e) {
				return new Ci(e, { addons: [] }).delete();
			},
			exists: function(e) {
				return new Ci(e, { addons: [] }).open().then(function(e) {
					return e.close(), !0;
				}).catch("NoSuchDatabaseError", function() {
					return !1;
				});
			},
			getDatabaseNames: function(e) {
				try {
					return br(Ci.dependencies).then(e);
				} catch {
					return Ft(new A.MissingAPI());
				}
			},
			defineClass: function() {
				function e(e) {
					s(this, e);
				}
				return e;
			},
			ignoreTransaction: function(e) {
				return M.trans ? Mt(M.transless || Qe, e) : e();
			},
			vip: Cr,
			async: function(e) {
				return function() {
					try {
						var t = Hr(e.apply(this, arguments));
						return !t || typeof t.then != "function" ? N.resolve(t) : t;
					} catch (e) {
						return Ft(e);
					}
				};
			},
			spawn: function(e, t, n) {
				try {
					var r = Hr(e.apply(n, t || []));
					return !r || typeof r.then != "function" ? N.resolve(r) : r;
				} catch (e) {
					return Ft(e);
				}
			},
			currentTransaction: { get: function() {
				return M.trans || null;
			} },
			waitFor: function(e, t) {
				var n = N.resolve(typeof e == "function" ? Ci.ignoreTransaction(e) : e).timeout(t || 6e4);
				return M.trans ? M.trans.waitFor(n) : n;
			},
			Promise: N,
			debug: {
				get: function() {
					return Fe;
				},
				set: function(e) {
					Ie(e);
				}
			},
			derive: m,
			extend: s,
			props: d,
			override: y,
			Events: on,
			on: Pn,
			liveQuery: Si,
			extendObservabilitySet: Pr,
			getByKeyPath: C,
			setByKeyPath: w,
			delByKeyPath: T,
			shallowClone: ee,
			deepClone: ie,
			getObjectDiff: Jr,
			cmp: Xt,
			asap: x,
			minKey: zt,
			addons: [],
			connections: { get: gr.toArray },
			errnames: xe,
			dependencies: xi,
			cache: Fr,
			semVer: Lt,
			version: Lt.split(".").map(function(e) {
				return parseInt(e);
			}).reduce(function(e, t, n) {
				return e + t / 10 ** (n * 2);
			})
		})), Ci.maxKey = Vn(Ci.dependencies.IDBKeyRange), typeof dispatchEvent < "u" && typeof addEventListener < "u" && (Pn(Mn, function(e) {
			if (!wi) {
				var t = new CustomEvent(Nn, { detail: e });
				wi = !0, dispatchEvent(t), wi = !1;
			}
		}), addEventListener(Nn, function(e) {
			var t = e.detail;
			wi || L(t);
		}));
		function L(e) {
			var t = wi;
			try {
				wi = !0, Pn.storagemutated.fire(e), zr(e, !0);
			} finally {
				wi = t;
			}
		}
		var wi = !1, Ti, Ei = function() {};
		typeof BroadcastChannel < "u" && (Ei = function() {
			Ti = new BroadcastChannel(Nn), Ti.onmessage = function(e) {
				return e.data && L(e.data);
			};
		}, Ei(), typeof Ti.unref == "function" && Ti.unref(), Pn(Mn, function(e) {
			wi || Ti.postMessage(e);
		})), typeof addEventListener < "u" && (addEventListener("pagehide", function(e) {
			if (!vi.disableBfCache && e.persisted) {
				Fe && console.debug("Dexie: handling persisted pagehide"), Ti?.close();
				for (var t = 0, n = gr.toArray(); t < n.length; t++) n[t].close({ disableAutoOpen: !1 });
			}
		}), addEventListener("pageshow", function(e) {
			!vi.disableBfCache && e.persisted && (Fe && console.debug("Dexie: handling persisted pageshow"), Ei(), L({ all: new Dr(-Infinity, [[]]) }));
		}));
		function Di(e) {
			return new nn({ add: e });
		}
		function Oi(e) {
			return new nn({ remove: e });
		}
		function ki(e, t) {
			return new nn({ replacePrefix: [e, t] });
		}
		return N.rejectionMapper = we, Ie(Fe), n(vi, /* @__PURE__ */ Object.freeze({
			__proto__: null,
			DEFAULT_MAX_CONNECTIONS: Ht,
			Dexie: vi,
			Entity: Yt,
			PropModification: nn,
			RangeSet: Dr,
			add: Di,
			cmp: Xt,
			default: vi,
			liveQuery: Si,
			mergeRanges: kr,
			rangesOverlap: Ar,
			remove: Oi,
			replacePrefix: ki
		}), { default: vi }), vi;
	}));
})))(), 1), TC = Symbol.for("Dexie"), EC = globalThis[TC] || (globalThis[TC] = wC.default);
if (wC.default.semVer !== EC.semVer) throw Error(`Two different versions of Dexie loaded in the same app: ${wC.default.semVer} and ${EC.semVer}`);
var { liveQuery: DC, mergeRanges: OC, rangesOverlap: kC, RangeSet: AC, cmp: jC, Entity: MC, PropModification: NC, replacePrefix: PC, add: FC, remove: IC, DexieYProvider: LC } = EC, RC = "tavern-trpg-assistant", zC = {};
function BC(e) {
	return e.length >= 8 && e[0] === 137 && e[1] === 80 && e[2] === 78 && e[3] === 71 ? "image/png" : e.length >= 3 && e[0] === 255 && e[1] === 216 && e[2] === 255 ? "image/jpeg" : e.length >= 6 && String.fromCharCode(...e.slice(0, 4)) === "GIF8" ? "image/gif" : e.length >= 12 && String.fromCharCode(...e.slice(0, 4)) === "RIFF" && String.fromCharCode(...e.slice(8, 12)) === "WEBP" ? "image/webp" : "application/octet-stream";
}
async function VC(e) {
	let t = await e.table("assets").toArray(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
	for (let i of t) {
		let t = _S(i.bytes);
		n.set(`${i.packId}\u0000${i.path}`, t), !r.has(t) && (r.add(t), await e.table("blobs").put({
			hash: t,
			bytes: i.bytes,
			mime: BC(i.bytes),
			size: i.bytes.length,
			createdAt: Date.now()
		}));
	}
	let i = await e.table("packs").toArray();
	for (let r of i) {
		let i = String(r.id), a = t.filter((e) => e.packId === i).map((e) => n.get(`${e.packId}\u0000${e.path}`)), o = r.kind, s = Array.isArray(r.dependsOn) ? r.dependsOn : [], c = {
			...r,
			category: r.category ?? (o === "module" ? "adventure" : "rules"),
			lineage: r.lineage ?? IS(i),
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
	zC.beforeMigrationWrite?.();
}
var HC = class extends EC {
	packs;
	entries;
	searchIndex;
	blobs;
	workspaces;
	saves;
	packTrash;
	meta;
	constructor(e = RC) {
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
		}).upgrade(VC);
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
// src/core/packs/enablement.ts
function UC(e, t, n) {
	return t.filter((t) => n.get(t.id)?.relationships.requires.some((t) => t.id === e)).map((e) => e.id);
}
function WC(e, t, n, r) {
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
function GC(e, t, n, r) {
	if (r.corePackIds.includes(t)) throw new Q("E_CORE_LOCKED", "核心规则始终启用，不能停用");
	let i = UC(t, e, n);
	if (i.length) throw new Q("E_REQUIRED_BY", `${i.map((e) => `『${n.get(e)?.name ?? e}』`).join("、")}依赖它，不能停用`, { dependents: i });
	return e.filter((e) => e.id !== t);
}
// src/rules/dnd5e2014/data/features.ts
var KC = [
	"entries",
	"variants",
	"adventures",
	"table",
	"ruleOptions",
	"aiNotes"
], qC = [
	"charGen",
	"activities",
	"trackers"
], JC = Z().min(1).max(40);
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
	kind: JC,
	name: Z().min(1).max(120),
	description: Z().max(2e3).default(""),
	defaultEnabled: Gv().default(!1),
	stateVersion: Vv().int().positive().optional(),
	data: oy(Z(), qv()).default({})
});
function YC(e) {
	return KC.includes(e) ? "supported" : qC.includes(e) ? "reserved" : "unknown";
}
// src/core/library/types.ts
var XC = "original", ZC = (e, t) => `${e}/${t}`, QC = (e, t) => `${e.lineage ?? e.id}/${t}`;
function $C(e) {
	let t = e;
	return {
		pins: t.pins ?? {},
		features: t.features ?? {},
		featureState: t.featureState ?? {},
		variants: t.variants ?? {}
	};
}
function ew(e, t) {
	return {
		...e,
		...t
	};
}
// src/core/library/features.ts
var tw = (e) => e.content?.features ?? [];
function nw(e, t, n) {
	let r = $C(e), i = { ...r.features }, a = { ...r.featureState };
	for (let e of tw(t)) {
		let r = QC(t, e.id), o = i[r];
		i[r] = o ? {
			...o,
			enabled: !0
		} : {
			def: structuredClone(e),
			packId: t.id,
			version: t.version,
			enabled: !0,
			pinnedAt: n
		}, e.kind === "ruleOptions" && !(r in a) && (a[r] = !!e.defaultEnabled);
	}
	return ew(e, {
		features: i,
		featureState: a
	});
}
function rw(e, t) {
	let n = {};
	for (let [r, i] of Object.entries($C(e).features)) n[r] = i.packId === t ? {
		...i,
		enabled: !1
	} : i;
	return ew(e, { features: n });
}
function iw(e, t, n) {
	let r = $C(e);
	return !r.features[t] || r.features[t].def.kind !== "ruleOptions" ? e : ew(e, { featureState: {
		...r.featureState,
		[t]: n
	} });
}
function aw(e) {
	let t = $C(e);
	return Object.entries(t.features).filter(([, e]) => e.enabled && e.def.kind === "ruleOptions").map(([e, n]) => {
		let r = n.def.data, i = typeof r.text == "string" && r.text !== "[]" ? r.text : "";
		return {
			key: e,
			name: n.def.name,
			summary: r.summary ?? "",
			text: i,
			packId: n.packId,
			implemented: r.implemented === !0,
			on: t.featureState[e] === !0
		};
	});
}
function ow(e, t) {
	let n = $C(e), r = /* @__PURE__ */ new Map();
	for (let [e, i] of Object.entries(n.features)) {
		let n = t.get(i.packId);
		if (!n) continue;
		let a = tw(n).find((t) => QC(n, t.id) === e);
		a && vS(a) !== vS(i.def) && r.set(i.packId, (r.get(i.packId) ?? 0) + 1);
	}
	return r;
}
function sw(e, t, n) {
	let r = { ...$C(e).features }, i = [], a = [];
	for (let e of tw(t)) {
		let o = QC(t, e.id), s = r[o];
		s && vS(e) !== vS(s.def) && ((s.def.stateVersion ?? 1) === (e.stateVersion ?? 1) ? (r[o] = {
			...s,
			def: structuredClone(e),
			version: t.version,
			pinnedAt: n
		}, i.push(o)) : a.push({
			key: o,
			reason: `「${s.def.name}」的数据格式有变化，这个版本不能自动迁移，已保留旧定义`
		}));
	}
	return {
		data: ew(e, { features: r }),
		updated: i,
		kept: a
	};
}
// src/core/library/pins.ts
function cw(e) {
	let { entryId: t, packId: n, ruleId: r, override: i, ...a } = e;
	return {
		...a,
		id: t
	};
}
async function lw(e, t, n, r, i) {
	let a = ZC(n, r), o = $C(t);
	if (o.pins[a]) return t;
	let [s, c] = await Promise.all([e.entries.get([n, r]), e.packs.get(n)]);
	return !s || !c ? null : ew(t, { pins: {
		...o.pins,
		[a]: {
			version: c.version,
			entry: cw(s),
			pinnedAt: i
		}
	} });
}
// src/core/library/mergePatch.ts
function uw(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function dw(e, t) {
	if (!uw(t)) return structuredClone(t);
	let n = uw(e) ? { ...e } : {};
	for (let [e, r] of Object.entries(t)) r === null ? delete n[e] : n[e] = dw(n[e], r);
	return n;
}
// src/core/library/variants.ts
function fw(e, t) {
	let n = [];
	for (let r of t) {
		let t = r.override;
		if (!t?.target?.packId || !t.target.entryId || !t.mode || t.mode !== "replace" && t.mode !== "patch" && t.mode !== "hide") continue;
		let { packId: i, entryId: a, override: o, ruleId: s, ...c } = r, l = t.mode === "replace" ? {
			...c,
			id: t.target.entryId
		} : t.mode === "patch" ? {
			name: c.name,
			summary: c.summary,
			data: c.data
		} : null;
		n.push({
			target: {
				packId: t.target.packId,
				entryId: t.target.entryId
			},
			variant: {
				key: `pack:${e.lineage ?? e.id}/${a}`,
				source: {
					type: "pack",
					packId: e.id,
					lineage: e.lineage ?? e.id,
					version: e.version
				},
				sourceName: e.name,
				mode: t.mode,
				payload: l,
				note: t.note ?? "",
				...t.baseVersion ? { baseVersion: t.baseVersion } : {}
			}
		});
	}
	return n;
}
function pw(e, t, n) {
	let r = $C(e).variants;
	return t.map(({ target: e, variant: t }) => {
		let i = ZC(e.packId, e.entryId), a = r[i], o = a?.active ?? "original", s = o === t.key, c = !s && (o !== "original" || !!a?.manual);
		return {
			entryKey: i,
			variant: t,
			current: o,
			conflict: c,
			defaultUse: s || !c && n === "apply"
		};
	});
}
function mw(e, t) {
	return [...e.filter((e) => e !== t), t].slice(-10);
}
function hw() {
	return {
		candidates: [],
		active: XC,
		manual: !1,
		history: []
	};
}
function gw(e, t, n) {
	let r = { ...$C(e).variants };
	for (let e of t) {
		let t = r[e.entryKey] ?? hw(), i = t.candidates.some((t) => t.key === e.variant.key), a = i ? t.candidates.map((t) => t.key === e.variant.key ? e.variant : t) : [...t.candidates, e.variant], o = {
			...t,
			candidates: a
		};
		!i && n[e.variant.key] && (o = {
			...o,
			active: e.variant.key,
			history: mw(o.history, t.active)
		}), r[e.entryKey] = o;
	}
	return ew(e, { variants: r });
}
function _w(e, t, n) {
	let r = { ...$C(e).variants }, i = r[t];
	return !i || i.active === n || n !== "original" && !i.candidates.some((e) => e.key === n) ? e : (r[t] = {
		...i,
		active: n,
		manual: !0,
		history: mw(i.history, i.active)
	}, ew(e, { variants: r }));
}
function vw(e, t) {
	let n = /* @__PURE__ */ new Set([XC, ...e.candidates.filter((e) => !t.has(e.key)).map((e) => e.key)]);
	for (let t = e.history.length - 1; t >= 0; t--) if (n.has(e.history[t])) return e.history[t];
	return XC;
}
function yw(e, t, n = {}) {
	let r = n.dropCandidates ?? !0, i = {}, a = [];
	for (let [n, o] of Object.entries($C(e).variants)) {
		let e = new Set(o.candidates.filter(t).map((e) => e.key));
		if (!e.size) {
			i[n] = o;
			continue;
		}
		let s = o.active;
		e.has(s) && (s = vw(o, e), a.push({
			entryKey: n,
			from: o.active,
			to: s
		}));
		let c = r ? o.candidates.filter((t) => !e.has(t.key)) : o.candidates, l = o.history.filter((e) => e !== s);
		(c.length || s !== "original") && (i[n] = {
			...o,
			candidates: c,
			active: s,
			history: l
		});
	}
	return {
		data: ew(e, { variants: i }),
		reverted: a
	};
}
var bw = (e) => (t) => t.source.type === "pack" && t.source.packId === e;
function xw(e, t, n) {
	if (!n) {
		let { data: n, reverted: r } = yw(e, t, { dropCandidates: !1 });
		return {
			data: n,
			changed: r
		};
	}
	let r = e, i = [];
	for (let [n, a] of Object.entries($C(e).variants)) {
		let e = a.candidates.find(t);
		e && a.active !== e.key && (i.push({
			entryKey: n,
			from: a.active,
			to: e.key
		}), r = _w(r, n, e.key));
	}
	return {
		data: r,
		changed: i
	};
}
function Sw(e, t) {
	if (!t || t.active === "original") return {
		entry: e,
		active: XC,
		hidden: !1,
		others: t?.candidates.length ?? 0,
		broken: !1
	};
	let n = t.candidates.find((e) => e.key === t.active), r = t.candidates.length;
	if (!n) return {
		entry: e,
		active: XC,
		hidden: !1,
		others: r,
		broken: !0
	};
	if (n.mode === "hide") return {
		entry: e,
		active: n.key,
		hidden: !!e,
		others: r,
		broken: !e
	};
	let i;
	if (n.mode === "replace") i = n.payload;
	else if (e) {
		let t = n.payload;
		i = {
			...e,
			...t.summary ? { summary: t.summary } : {},
			data: dw(e.data, t.data ?? {})
		};
	} else return {
		entry: null,
		active: XC,
		hidden: !1,
		others: r,
		broken: !0
	};
	let a = Qy.safeParse(i);
	return a.success ? {
		entry: a.data,
		active: n.key,
		hidden: !1,
		others: r,
		broken: !1
	} : {
		entry: e,
		active: XC,
		hidden: !1,
		others: r,
		broken: !0
	};
}
// src/core/library/integrity.ts
function Cw(e, t, n) {
	if (Array.isArray(e)) e.forEach((e, r) => Cw(e, [...t, r], n));
	else if (e && typeof e == "object") {
		let r = e;
		n(r, t);
		for (let [e, i] of Object.entries(r)) (t.length !== 0 || e !== "pins" && e !== "features" && e !== "variants" && e !== "featureState" && e !== "trash") && Cw(i, [...t, e], n);
	}
}
var ww = (...e) => e.join("|");
async function Tw(e, t) {
	let n = [], r = $C(t), i = [], a = [];
	Cw(t, [], (e, t) => {
		e.$ref === "pack" && i.push({
			obj: e,
			path: t
		}), typeof e.$asset == "string" && a.push({
			hash: e.$asset,
			path: t
		});
	});
	for (let { obj: t, path: a } of i) {
		let i = String(t.packId), o = String(t.entryId), s = typeof t.name == "string" ? t.name : o;
		r.pins[ZC(i, o)] || (await e.entries.get([i, o]) ? n.push({
			id: ww("pack-unpinned", a.join(".")),
			kind: "pack-unpinned",
			subject: s,
			detail: `「${s}」还没有固定，库里有，可以固定`,
			fixes: ["pin"],
			path: a,
			packId: i,
			entryId: o
		}) : n.push({
			id: ww("pack-missing", a.join(".")),
			kind: "pack-missing",
			subject: s,
			detail: `「${s}」缺失：库里没有它所在的扩展包`,
			fixes: ["install", "text-only"],
			path: a,
			packId: i,
			entryId: o
		}));
	}
	for (let { hash: t, path: r } of a) {
		if (await e.blobs.get(t)) continue;
		let i = r.slice(0, -1).join(".");
		n.push({
			id: ww("asset-missing", t, r.join(".")),
			kind: "asset-missing",
			subject: i || "图片",
			detail: "图片缺失",
			fixes: ["pick-image", "remove-image"],
			path: r,
			hash: t
		});
	}
	let o = /* @__PURE__ */ new Set();
	t.instances.forEach((e, t) => {
		let r = rb.safeParse(e), i = typeof e?.name == "string" ? e.name : `第 ${t + 1} 项`;
		r.success ? (o.has(r.data.id) && n.push({
			id: ww("duplicate-id", t),
			kind: "duplicate-id",
			subject: i,
			detail: `「${i}」与前面的项编号重复`,
			fixes: ["new-id"],
			path: ["instances", t]
		}), o.add(r.data.id)) : n.push({
			id: ww("bad-item", t),
			kind: "bad-item",
			subject: i,
			detail: `「${i}」的内容不符合数据定义，不参与游戏，保存时原样保留`,
			fixes: ["trash"],
			path: ["instances", t]
		});
	});
	for (let [t, i] of Object.entries(r.variants)) {
		if (i.active === "original") continue;
		let a = r.pins[t]?.entry ?? null, o = t.indexOf("/"), s = a ? null : await e.entries.get([t.slice(0, o), t.slice(o + 1)]);
		if (!Sw(a ?? (s ? cw(s) : null), i).broken) continue;
		let c = i.candidates.find((e) => e.key === i.active)?.sourceName ?? "修改版";
		n.push({
			id: ww("variant-broken", t),
			kind: "variant-broken",
			subject: t.slice(o + 1),
			detail: `「${c}」的修改无法显示：原版缺失`,
			fixes: ["install", "use-original"],
			path: ["variants", t],
			packId: t.slice(0, o),
			entryId: t.slice(o + 1)
		});
	}
	return n;
}
function Ew(e, t, n, r = !1) {
	if (t.length === 0) return n(e);
	let [i, ...a] = t, o = Array.isArray(e) ? [...e] : { ...e }, s = i;
	return a.length === 0 && r ? Array.isArray(o) ? o.splice(Number(i), 1) : delete o[i] : o[i] = Ew(o[s], a, n, r), o;
}
async function Dw(e, t, n, r, i, a) {
	switch (r) {
		case "pick-image": return a ? Ew(t, n.path, () => ({ $asset: a })) : t;
		case "pin": return await lw(e, t, n.packId, n.entryId, i) ?? t;
		case "text-only": return Ew(t, n.path, (e) => e.name ?? n.subject);
		case "remove-image": return Ew(t, n.path, () => void 0, !0);
		case "new-id": return Ew(t, [...n.path, "id"], () => vb());
		case "trash": {
			let e = t.instances[n.path[1]], r = Ew(t, n.path, () => void 0, !0), a = [...t.trash ?? [], {
				kind: "instance",
				item: e,
				at: i
			}];
			return {
				...r,
				trash: a
			};
		}
		case "use-original": return _w(t, n.path[1], XC);
		default: return t;
	}
}
// src/core/library/service.ts
var Ow = class {
	db;
	deps;
	constructor(e, t) {
		this.db = e, this.deps = t;
	}
	async workspace(e) {
		let t = await this.deps.campaign.getWorkspace(e);
		if (!t) throw new Q("E_NO_WORKSPACE", "还没有当前战役");
		return t;
	}
	async installedMap() {
		return new Map((await this.db.packs.toArray()).map((e) => [e.id, e]));
	}
	async variantsOf(e) {
		let t = [];
		for (let n of e) t.push(...fw(n, await this.db.entries.where("packId").equals(n.id).toArray()));
		return t;
	}
	async save(e) {
		let t = {
			...e,
			updatedAt: this.deps.now()
		};
		return await this.db.workspaces.put(t), t;
	}
	async previewEnable(e, t) {
		let n = await this.workspace(e), r = this.rule(n.ruleId), i = await this.installedMap(), a = i.get(t);
		if (!a) throw new Q("E_NOT_FOUND", "没有找到这个扩展包，请先在库里安装");
		let { enabledPacks: o, autoEnabled: s } = WC(n.enabledPacks, t, i, r);
		this.assertNoConflict(o, i, [t, ...s]);
		let c = [t, ...s].map((e) => i.get(e)), l = await hb(this.db), u = pw(n.data, await this.variantsOf(c), l.variantDefault);
		return {
			pack: a,
			autoEnabled: s.map((e) => i.get(e)),
			variants: u
		};
	}
	assertNoConflict(e, t, n) {
		let r = new Set(e.map((e) => e.id));
		for (let e of n) {
			let n = t.get(e);
			for (let e of n?.relationships.conflicts ?? []) if (r.has(e.id)) throw new Q("E_PACK_CONFLICT", `『${n?.name}』与『${t.get(e.id)?.name ?? e.id}』冲突${e.reason ? `：${e.reason}` : ""}，不能同时启用`);
			for (let i of r) {
				let r = t.get(i)?.relationships.conflicts.find((t) => t.id === e);
				if (r) throw new Q("E_PACK_CONFLICT", `『${t.get(i)?.name}』与『${n?.name}』冲突${r.reason ? `：${r.reason}` : ""}，不能同时启用`);
			}
		}
	}
	async enable(e, t, n = {}) {
		let r = await this.previewEnable(e, t), i = await this.workspace(e), a = this.rule(i.ruleId), o = await this.installedMap(), { enabledPacks: s, autoEnabled: c } = WC(i.enabledPacks, t, o, a), l = this.deps.now(), u = i.data;
		for (let e of [t, ...c]) u = nw(u, o.get(e), l);
		for (let e of r.variants) {
			let [t, n] = [e.entryKey.slice(0, e.entryKey.indexOf("/")), e.entryKey.slice(e.entryKey.indexOf("/") + 1)];
			u = await lw(this.db, u, t, n, l) ?? u;
		}
		let d = n.use ?? Object.fromEntries(r.variants.map((e) => [e.variant.key, e.defaultUse]));
		return u = gw(u, r.variants, d), {
			workspace: await this.save({
				...i,
				enabledPacks: s,
				data: u
			}),
			autoEnabled: c,
			variantsAdded: r.variants.length
		};
	}
	async applyDefaultVariants(e) {
		let t = await this.workspace(e), n = await this.installedMap(), r = await hb(this.db), i = t.enabledPacks.map((e) => n.get(e.id)).filter((e) => !!e), a = pw(t.data, await this.variantsOf(i), r.variantDefault);
		if (!a.length) return t;
		let o = t.data, s = this.deps.now();
		for (let e of a) {
			let t = e.entryKey.indexOf("/");
			o = await lw(this.db, o, e.entryKey.slice(0, t), e.entryKey.slice(t + 1), s) ?? o;
		}
		return o = gw(o, a, Object.fromEntries(a.map((e) => [e.variant.key, e.defaultUse]))), this.save({
			...t,
			data: o
		});
	}
	async previewDisable(e, t) {
		let n = await this.workspace(e), r = await this.installedMap(), i = n.enabledPacks.filter((e) => r.get(e.id)?.relationships.requires.some((e) => e.id === t)).map((e) => e.id), a = $C(n.data), o = Object.entries(a.features).some(([e, n]) => n.packId === t && e in a.featureState);
		return {
			dependents: i,
			reverted: yw(n.data, bw(t)).reverted,
			hasState: o
		};
	}
	async disable(e, t) {
		let n = await this.workspace(e), r = this.rule(n.ruleId), i = GC(n.enabledPacks, t, await this.installedMap(), r), { data: a, reverted: o } = yw(rw(n.data, t), bw(t));
		return {
			workspace: await this.save({
				...n,
				enabledPacks: i,
				data: a
			}),
			reverted: o
		};
	}
	async setRuleOption(e, t, n) {
		let r = await this.workspace(e);
		return this.save({
			...r,
			data: iw(r.data, t, n)
		});
	}
	async updateFeatures(e, t) {
		let n = await this.workspace(e), r = (await this.installedMap()).get(t);
		if (!r) throw new Q("E_NOT_FOUND", "没有找到这个扩展包");
		let i = this.deps.now(), a = sw(n.data, r, i), o = await this.variantsOf([r]), s = new Set(o.map((e) => e.variant.key)), c = yw(a.data, (e) => bw(t)(e) && !s.has(e.key)), l = await hb(this.db), u = pw(c.data, o, l.variantDefault), d = c.data;
		for (let e of u) {
			let t = e.entryKey.indexOf("/");
			d = await lw(this.db, d, e.entryKey.slice(0, t), e.entryKey.slice(t + 1), i) ?? d;
		}
		return d = gw(d, u, Object.fromEntries(u.map((e) => [e.variant.key, e.defaultUse]))), {
			workspace: await this.save({
				...n,
				data: d
			}),
			kept: a.kept
		};
	}
	async switchVariant(e, t, n) {
		let r = await this.workspace(e);
		return this.save({
			...r,
			data: _w(r.data, t, n)
		});
	}
	async setSourceUse(e, t, n) {
		let r = await this.workspace(e), { data: i, changed: a } = xw(r.data, t, n);
		return {
			workspace: await this.save({
				...r,
				data: i
			}),
			changed: a
		};
	}
	async repair(e, t, n, r) {
		let i = await this.workspace(e);
		await this.deps.campaign.writeAutoSave(i, "改动模组前");
		let a = await Dw(this.db, i.data, t, n, this.deps.now(), r);
		return this.save({
			...i,
			data: a
		});
	}
	async updateFeaturesSafely(e, t) {
		return await this.deps.campaign.writeAutoSave(await this.workspace(e), "改动模组前"), this.updateFeatures(e, t);
	}
	entryKeyOf = ZC;
	rule(e) {
		let t = this.deps.rules.get(e);
		if (!t) throw new Q("E_RULE_MISMATCH", "这个存档的规则没有安装");
		return t;
	}
};
// src/core/library/mine.ts
function kw() {
	let e = /* @__PURE__ */ new Uint8Array(10);
	return crypto.getRandomValues(e), `u-${Array.from(e, (e) => "abcdefghijklmnopqrstuvwxyz0123456789"[e % 36]).join("")}`;
}
var Aw = (e, t) => e.trim().toLowerCase() === t.trim().toLowerCase(), jw = class {
	deps;
	constructor(e) {
		this.deps = e;
	}
	get db() {
		return this.deps.db;
	}
	async mine(e) {
		let t = await this.db.packs.get(e);
		if (!t) throw new Q("E_NOT_FOUND", "没有找到这个包");
		if (t.source !== "user") throw new Q("E_NOT_MINE", "只有「我的」里的包可以直接编辑；可以先复制为我的包");
		return t;
	}
	async assertFreeName(e, t, n) {
		if ((await this.db.packs.where("ruleId").equals(e).toArray()).some((e) => e.id !== n && e.source === "user" && Aw(e.name, t))) throw new Q("E_BAD_NAME", `「我的」里已经有叫「${t}」的包`);
	}
	list(e) {
		return this.deps.packs.list({ ruleId: e }).then((e) => e.filter((e) => e.source === "user"));
	}
	async create(e) {
		let t = e.name.trim();
		if (!t || t.length > 80) throw new Q("E_BAD_NAME", "名称需要 1–80 个字");
		if (!this.deps.rules.has(e.ruleId)) throw new Q("E_RULE_MISSING", "这个规则没有安装");
		await this.assertFreeName(e.ruleId, t);
		let n = {
			id: kw(),
			ruleId: e.ruleId,
			category: e.category ?? "rules",
			name: t,
			version: "1.0.0",
			license: "",
			attribution: "",
			description: (e.description ?? "").slice(0, 400),
			lineage: vb(),
			entryCount: 0,
			typeCounts: {},
			contributes: {
				entries: 0,
				tables: 0,
				variants: 0,
				adventures: 0,
				ruleOptions: 0
			},
			relationships: {
				requires: [],
				recommends: [],
				conflicts: []
			},
			blobs: [],
			dataVersion: 1,
			source: "user",
			byteSize: 0,
			sha256: "",
			installedAt: this.deps.now(),
			schemaVersion: Iy.pack,
			blobHashes: [],
			content: {
				features: [],
				adventure: {},
				fallback: []
			}
		};
		return await this.db.packs.put(n), this.refresh(n.id, !1);
	}
	async rename(e, t) {
		let n = await this.mine(e), r = t.name.trim();
		if (!r || r.length > 80) throw new Q("E_BAD_NAME", "名称需要 1–80 个字");
		await this.assertFreeName(n.ruleId, r, e);
		let i = {
			...n,
			name: r,
			description: (t.description ?? n.description).slice(0, 400)
		};
		return await this.db.packs.put(i), i;
	}
	async duplicate(e) {
		let t = await this.db.packs.get(e);
		if (!t) throw new Q("E_NOT_FOUND", "没有找到这个包");
		let n = await this.db.packs.where("ruleId").equals(t.ruleId).toArray(), r = `${t.name}（我的）`;
		for (let e = 2; n.some((e) => e.source === "user" && Aw(e.name, r)); e++) r = `${t.name}（我的 ${e}）`;
		let i = kw(), a = {
			...structuredClone(t),
			id: i,
			name: r,
			lineage: vb(),
			version: "1.0.0",
			source: "user",
			installedAt: this.deps.now(),
			derivedFrom: {
				id: t.id,
				lineage: t.lineage,
				version: t.version
			}
		}, o = (await this.db.entries.where("packId").equals(e).toArray()).map((e) => ({
			...structuredClone(e),
			packId: i
		}));
		return await this.db.transaction("rw", [this.db.packs, this.db.entries], async () => {
			await this.db.packs.put(a), await this.db.entries.bulkPut(o);
		}), this.refresh(i, !1);
	}
	async remove(e) {
		let t = await this.mine(e);
		await this.db.packTrash.put({
			id: t.id,
			name: t.name,
			ruleId: t.ruleId,
			bytes: await this.deps.packs.exportPack(t.id),
			deletedAt: this.deps.now()
		}), await this.deps.packs.remove(e);
	}
	trash() {
		return this.db.packTrash.toArray().then((e) => e.map(({ bytes: e, ...t }) => t).sort((e, t) => t.deletedAt - e.deletedAt));
	}
	async restore(e) {
		let t = await this.db.packTrash.get(e);
		if (!t) throw new Q("E_NOT_FOUND", "回收站里没有这个包");
		let n = this.deps.packs.recognize(t.bytes);
		if (n.type !== "pack") throw new Q("E_BAD_CONTENT", "回收站里的文件已损坏");
		let r = await this.deps.packs.install(n, {
			source: "user",
			resolution: "overwrite"
		});
		return await this.db.packTrash.delete(e), r;
	}
	async purge(e) {
		await this.db.packTrash.delete(e);
	}
	entries(e) {
		return this.db.entries.where("packId").equals(e).toArray();
	}
	async saveEntry(e, t) {
		let n = await this.mine(e);
		if (!Ry.safeParse(t.id).success) throw new Q("E_BAD_ENTRY", "条目编号只能用小写字母、数字、点与短横线");
		let r = Qy.safeParse(t);
		if (!r.success) throw new Q("E_BAD_ENTRY", `条目内容不合法：${r.error.issues[0]?.message ?? ""}`);
		let { id: i, ...a } = r.data;
		return await this.db.entries.put({
			...a,
			entryId: i,
			packId: e,
			ruleId: n.ruleId
		}), this.refresh(e, !0);
	}
	async deleteEntry(e, t) {
		return await this.mine(e), await this.db.entries.delete([e, t]), this.refresh(e, !0);
	}
	async moveEntry(e, t, n) {
		await this.mine(e);
		let r = await this.mine(t), i = await this.db.entries.get([e, n]);
		if (!i) throw new Q("E_NOT_FOUND", "没有找到这个条目");
		let a = await this.db.entries.get([t, n]) ? `${n}-${Date.now().toString(36)}` : n;
		await this.db.transaction("rw", [this.db.entries], async () => {
			await this.db.entries.delete([e, n]), await this.db.entries.put({
				...i,
				packId: t,
				ruleId: r.ruleId,
				entryId: a
			});
		}), await this.refresh(e, !0), await this.refresh(t, !0);
	}
	async copyEntry(e, t) {
		await this.mine(e);
		let n = await this.db.entries.get([e, t]);
		if (!n) throw new Q("E_NOT_FOUND", "没有找到这个条目");
		let r = 2;
		for (; await this.db.entries.get([e, `${t}-copy${r === 2 ? "" : r}`]);) r++;
		let i = `${t}-copy${r === 2 ? "" : r}`;
		return await this.db.entries.put({
			...structuredClone(n),
			entryId: i,
			name: `${n.name}（副本）`
		}), await this.refresh(e, !0), i;
	}
	async usage(e, t) {
		let n = `${e}/${t}`;
		return (await this.db.saves.toArray()).filter((e) => e.deletedAt === void 0).filter((e) => n in (e.snapshot.pins ?? {})).length;
	}
	async refresh(e, t) {
		let n = await this.db.packs.get(e), r = await this.db.entries.where("packId").equals(e).toArray(), i = {};
		for (let e of r) i[e.type] = (i[e.type] ?? 0) + 1;
		let a = n.content?.features ?? [], o = {
			...n,
			version: t ? Db(n.version) : n.version,
			entryCount: r.length,
			typeCounts: i,
			contributes: {
				entries: r.length,
				tables: i.table ?? 0,
				variants: r.filter((e) => e.override).length,
				adventures: 0,
				ruleOptions: a.filter((e) => e.kind === "ruleOptions").length
			},
			installedAt: this.deps.now()
		};
		await this.db.packs.put(o);
		let s = await this.deps.packs.exportPack(e), c = {
			...o,
			byteSize: s.length,
			sha256: _S(s)
		};
		return await this.db.packs.put(c), c;
	}
};
// src/core/packs/file.ts
function Mw(e) {
	let t = {};
	for (let n of Object.keys(e).sort()) t[n] = e[n];
	return t;
}
function Nw(e) {
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
	let o = new Map([...e.blobs ?? /* @__PURE__ */ new Map()].sort(([e], [t]) => e.localeCompare(t))), s = e.adventure ?? {}, c = e.fallback ?? [], l = { "trpg-manifest.json": gS({
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
			typeCounts: Mw(n),
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
	for (let [e, t] of [...r].sort(([e], [t]) => e.localeCompare(t))) l[`entries/${encodeURIComponent(e)}.json`] = gS(t);
	for (let [e, t] of [...a].sort(([e], [t]) => e.localeCompare(t))) l[`features/${encodeURIComponent(e.toLowerCase())}.json`] = gS(t);
	for (let e of Object.keys(s).sort()) l[e] = gS(s[e]);
	c.length && (l["adventure/fallback.json"] = gS({ items: c }));
	for (let [e, t] of o) l[`blobs/${e}`] = t.bytes;
	return YS(l);
}
// src/core/packs/installer.ts
function Pw(e, t) {
	return e.trim().toLowerCase() === t.trim().toLowerCase();
}
function Fw(e, t) {
	return e.filter((e) => {
		let n = t.get(e.id);
		return n ? e.minVersion ? Eb(n.version, e.minVersion) < 0 : !1 : !0;
	});
}
var Iw = class {
	db;
	deps;
	constructor(e, t) {
		this.db = e, this.deps = t;
	}
	recognize(e) {
		return sC(e, {
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
			missingRequires: Fw(e.manifest.relationships.requires, n),
			missingRecommends: Fw(e.manifest.relationships.recommends, n),
			conflicts: e.manifest.relationships.conflicts.filter((e) => n.has(e.id)).map((e) => ({
				id: e.id,
				reason: e.reason,
				installedVersion: n.get(e.id).version
			})),
			unsupportedFeatures: Lw(e)
		};
		if (t) {
			let n = Eb(e.manifest.version, t.version), i = n > 0 ? "newer" : n === 0 ? "same" : "older", a = t.lineage && e.manifest.lineage && t.lineage !== e.manifest.lineage ? "lineage-mismatch" : i === "older" && t.source === "builtin" ? "builtin-downgrade" : void 0;
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
		let i = (await this.db.packs.where("ruleId").equals(e.manifest.ruleId).toArray()).find((t) => t.category === e.manifest.category && Pw(t.name, e.manifest.name));
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
			throw Cb(e) ? new Q("E_QUOTA", wb) : e;
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
		return n && Eb(t.manifest.version, n.version) <= 0 ? "skipped" : (await this.install(t, {
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
	async remove(e) {
		let t = await this.db.packs.get(e);
		if (!t) throw new Q("E_NOT_FOUND", "没有找到这个内容包");
		return await this.db.transaction("rw", [
			this.db.packs,
			this.db.entries,
			this.db.searchIndex
		], () => this.removeRows(e)), this.deps.onChange?.({
			type: "uninstalled",
			packId: e
		}), t;
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
		return Nw({
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
			if (!r.some((e) => e.category === t && Pw(e.name, i))) return i;
		}
	}
};
function Lw(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.features) YC(n.kind) !== "supported" && t.set(n.kind, (t.get(n.kind) ?? 0) + 1);
	return [...t].map(([e, t]) => ({
		kind: e,
		count: t
	}));
}
// src/core/instances.ts
function Rw(e, t, n, r, i) {
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
		...r > 1 ? { label: bb(a) } : {},
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
// src/core/saves/helpers.ts
function zw(e, t) {
	return vS({
		d: e,
		p: t.map((e) => e.id).sort()
	});
}
function Bw(e) {
	return e.savedHash !== zw(e.data, e.enabledPacks);
}
function Vw(e, t) {
	return t.reduce((t, n) => ({
		...t,
		...n(e)
	}), {
		partyNames: [],
		partyCount: 0
	});
}
function Hw(e) {
	let t = e.trim();
	if (t.length < 1 || t.length > 40) throw new Q("E_BAD_NAME", "存档名需要 1–40 个字");
	return t;
}
function Uw(e, t, n = (e) => ` ${e}`) {
	if (!t.has(e)) return e;
	for (let r = 2;; r++) {
		let i = `${e}${n(r)}`;
		if (!t.has(i)) return i;
	}
}
function Ww(e) {
	return xS("save", e);
}
function Gw(e) {
	return xS("workspace", e);
}
function Kw(e, t) {
	return t.updatedAt - e.updatedAt || t.createdAt - e.createdAt || e.id.localeCompare(t.id);
}
// src/core/saves/campaign.ts
var qw = class {
	db;
	deps;
	uuid;
	constructor(e, t) {
		this.db = e, this.deps = t, this.uuid = t.uuid ?? vb;
	}
	async getWorkspace(e) {
		let t = await this.db.workspaces.get(e);
		if (!t) return null;
		let n = Gw(t);
		return n !== t && await this.db.workspaces.put(n), n;
	}
	isDirty(e) {
		return Bw(e);
	}
	async getSave(e) {
		let t = await this.db.saves.get(e);
		return t ? Ww(t) : null;
	}
	async listManual(e, t) {
		return (await this.db.saves.where("ruleId").equals(e.ruleId).toArray()).map(Ww).filter((n) => n.kind === "manual" && n.deletedAt === void 0 && (t === "all" || n.ownerKey === e.ownerKey)).sort(Kw);
	}
	async listAuto(e, t) {
		return (await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray()).map(Ww).filter((e) => e.kind === "auto").sort(Kw);
	}
	async listDeleted(e) {
		return (await this.db.saves.where("ruleId").equals(e).toArray()).map(Ww).filter((e) => e.deletedAt !== void 0).sort((e, t) => (t.deletedAt ?? 0) - (e.deletedAt ?? 0));
	}
	async listOtherRules(e) {
		return (await this.db.saves.toArray()).map(Ww).filter((t) => t.ruleId !== e && t.kind === "manual" && t.deletedAt === void 0).sort(Kw);
	}
	async missingPacks(e) {
		let t = new Set((await this.db.packs.toArray()).map((e) => e.id));
		return e.enabledPacks.filter((e) => !t.has(e.id));
	}
	async startNewCampaign(e) {
		let t = this.requireRule(e.ruleId), n = Hw(e.name), r = await this.installedMap(), i = [];
		for (let n of [...t.corePackIds, ...e.packIds]) i = WC(i, n, r, t).enabledPacks;
		return this.db.transaction("rw", [
			this.db.workspaces,
			this.db.saves,
			this.db.meta,
			this.db.packs
		], async () => {
			let t = await this.getWorkspace(e.ownerKey);
			t && await this.writeAutoSave(t, "新存档前");
			let a = { instances: [] };
			for (let e of i) a = nw(a, r.get(e.id), this.deps.now());
			let o = {
				ownerKey: e.ownerKey,
				ownerLabel: e.ownerLabel,
				ruleId: e.ruleId,
				currentSaveId: null,
				enabledPacks: i,
				data: a,
				savedHash: "",
				schemaVersion: Iy.workspace,
				updatedAt: this.deps.now()
			}, s = await this.buildSave(o, {
				id: this.uuid(),
				name: n,
				note: e.note ?? "",
				kind: "manual"
			});
			return o.currentSaveId = s.id, o.savedHash = s.hash, await this.db.saves.put(s), await this.db.workspaces.put(o), await this.bumpSaves(), {
				workspace: o,
				save: s
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
			if (!Bw(t)) return {
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
			let n = await this.requireWorkspace(e), r = n.currentSaveId ? await this.getSave(n.currentSaveId) : null, i = await this.manualNames(n.ownerKey, n.ruleId), a = t === void 0 ? Uw(`${r?.name ?? "存档"} 分支`, i) : Hw(t), o = await this.buildSave(n, {
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
					name: Uw(`${r.name}（来自 ${r.ownerLabel}）`, t),
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
			name: Uw(t.name, i, (e) => `（恢复 ${e}）`)
		};
		return await this.db.saves.put(a), a;
	}
	async purgeSaves(e) {
		let t = 0;
		for (let n of e) (await this.getSave(n))?.deletedAt !== void 0 && (await this.db.saves.delete(n), t++);
		return t;
	}
	async renameSave(e, t) {
		return this.patchManual(e, { name: Hw(t) });
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
			name: Uw(`自动存档 · ${a}`, n),
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
		n ? {enabledPacks: o, autoEnabled: s} = WC(r.enabledPacks, t, a, i) : o = GC(r.enabledPacks, t, a, i);
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
		let o = Rw(r.data, a, i.version, n, this.uuid), s = {
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
			summary: Vw(e.data, this.deps.summaryContributors ?? []),
			packs: e.enabledPacks.map((e) => ({
				id: e.id,
				version: e.version,
				name: n.get(e.id)?.name ?? e.id
			})),
			snapshot: structuredClone(e.data),
			hash: zw(e.data, e.enabledPacks),
			schemaVersion: Iy.save
		};
	}
	async manualNames(e, t) {
		let n = await this.db.saves.where("[ownerKey+ruleId]").equals([e, t]).toArray();
		return new Set(n.filter((e) => e.kind === "manual" && e.deletedAt === void 0).map((e) => e.name));
	}
	async bumpSaves() {
		let e = db.parse(await this.db.getMeta("backup") ?? {});
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
}, Jw = class {
	name;
	id;
	channel = null;
	listeners = /* @__PURE__ */ new Set();
	_readOnly = !1;
	startedAt;
	constructor(e = "tavern-trpg-assistant-lock", t = Date.now, n = vb()) {
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
}, Yw = class {
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
function Xw(e, t = []) {
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
var Zw = "dnd5e2014", Qw = {
	id: Zw,
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
function $w() {
	let e = new Yw();
	return e.register(Qw), e;
}
// src/core/services.ts
var eT = "0.1.0";
function tT(e = {}) {
	let t = e.now ?? Date.now, n = e.rules ?? $w(), r = new HC(e.dbName ?? "tavern-trpg-assistant"), i = new Iw(r, {
		rules: n,
		now: t,
		appVersion: e.appVersion ?? "0.1.0"
	}), a = new qw(r, {
		rules: n,
		now: t,
		...e.campaign
	});
	return {
		db: r,
		rules: n,
		packs: i,
		campaign: a,
		library: new Ow(r, {
			rules: n,
			now: t,
			campaign: a
		}),
		mine: new jw({
			db: r,
			packs: i,
			rules: n,
			now: t
		}),
		lock: new Jw(),
		now: t
	};
}
// node_modules/pinia/dist/pinia.js
var nT = typeof window < "u", rT, iT = (e) => rT = e, aT = Symbol();
function oT(e) {
	return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function";
}
var sT = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof global == "object" && global.global === global ? global : typeof globalThis == "object" ? globalThis : { HTMLElement: null };
function cT(e, { autoBom: t = !1 } = {}) {
	return t && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["﻿", e], { type: e.type }) : e;
}
function lT(e, t, n) {
	let r = new XMLHttpRequest();
	r.open("GET", e), r.responseType = "blob", r.onload = function() {
		mT(r.response, t, n);
	}, r.onerror = function() {
		console.error("could not download file");
	}, r.send();
}
function uT(e) {
	let t = new XMLHttpRequest();
	t.open("HEAD", e, !1);
	try {
		t.send();
	} catch {}
	return t.status >= 200 && t.status <= 299;
}
function dT(e) {
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
var fT = typeof navigator == "object" ? navigator : { userAgent: "" }, pT = /Macintosh/.test(fT.userAgent) && /AppleWebKit/.test(fT.userAgent) && !/Safari/.test(fT.userAgent), mT = nT ? typeof HTMLAnchorElement < "u" && "download" in HTMLAnchorElement.prototype && !pT ? hT : "msSaveOrOpenBlob" in fT ? gT : _T : () => {};
function hT(e, t = "download", n) {
	let r = document.createElement("a");
	r.download = t, r.rel = "noopener", typeof e == "string" ? (r.href = e, r.origin === location.origin ? dT(r) : uT(r.href) ? lT(e, t, n) : (r.target = "_blank", dT(r))) : (r.href = URL.createObjectURL(e), setTimeout(function() {
		URL.revokeObjectURL(r.href);
	}, 4e4), setTimeout(function() {
		dT(r);
	}, 0));
}
function gT(e, t = "download", n) {
	if (typeof e == "string") {
		if (uT(e)) lT(e, t, n);
		else {
			let t = document.createElement("a");
			t.href = e, t.target = "_blank", setTimeout(function() {
				dT(t);
			});
		}
	} else navigator.msSaveOrOpenBlob(cT(e, n), t);
}
function _T(e, t, n, r) {
	if (r ||= open("", "_blank"), r && (r.document.title = r.document.body.innerText = "downloading..."), typeof e == "string") return lT(e, t, n);
	let i = e.type === "application/octet-stream", a = /constructor/i.test(String(sT.HTMLElement)) || "safari" in sT, o = /CriOS\/[\d]+/.test(navigator.userAgent);
	if ((o || i && a || pT) && typeof FileReader < "u") {
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
var { assign: vT } = Object;
function yT() {
	let e = Xe(!0), t = e.run(() => /* @__PURE__ */ P({})), n = [], r = [], i = Cn({
		install(e) {
			iT(i), i._a = e, e.provide(aT, i), e.config.globalProperties.$pinia = i, r.forEach((e) => n.push(e)), r = [];
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
var bT = () => {};
function xT(e, t, n, r = bT) {
	e.add(t);
	let i = () => {
		e.delete(t) && r();
	};
	return !n && Ze() && Qe(i), i;
}
function ST(e, ...t) {
	e.forEach((e) => {
		e(...t);
	});
}
var CT = (e) => e(), wT = Symbol(), TT = Symbol();
function ET(e, t) {
	e instanceof Map && t instanceof Map ? t.forEach((t, n) => e.set(n, t)) : e instanceof Set && t instanceof Set && t.forEach(e.add, e);
	for (let n in t) {
		if (!Object.hasOwn(t, n)) continue;
		let r = t[n], i = e[n];
		if (oT(i) && oT(r) && Object.hasOwn(e, n) && !/* @__PURE__ */ En(r) && !/* @__PURE__ */ vn(r)) {
			e[n] = ET(i, r);
			let t = (/* @__PURE__ */ Sn(e))[n];
			/* @__PURE__ */ En(t) && /* @__PURE__ */ bn(t) && An(t);
		} else e[n] = r;
	}
	return e;
}
var DT = Symbol();
function OT(e) {
	return !e || typeof e != "object" || !Object.hasOwn(e, DT);
}
var { assign: kT } = Object;
function AT(e) {
	return !!(/* @__PURE__ */ En(e) && e.effect);
}
function jT(e, t, n, r) {
	let { state: i, actions: a, getters: o } = t, s = n.state.value[e], c;
	function l() {
		return s || 
		/* istanbul ignore if */
		(n.state.value[e] = i ? i() : {}), kT(/* @__PURE__ */ In(n.state.value[e]), a, Object.keys(o || {}).reduce((t, r) => (t[r] = Cn(J(() => {
			iT(n);
			let t = n._s.get(e);
			return o[r].call(t, t);
		})), t), {}));
	}
	return c = MT(e, l, t, n, r, !0), c;
}
function MT(e, t, n = {}, r, i, a) {
	let o, s = kT({ actions: {} }, n), c = { deep: !0 }, l, u, d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), p, m = r.state.value[e];
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
		}) : (ET(r.state.value[e], t), n = {
			type: "patch object",
			payload: t,
			storeId: e,
			events: p
		});
		let i = h = Symbol();
		hr().then(() => {
			h === i && (l = !0);
		}), u = !0, ST(d, n, r.state.value[e]);
	}
	let _ = a ? function() {
		let { state: e } = n, t = e ? e() : {};
		this.$patch((e) => {
			kT(e, t);
		});
	} : bT;
	function v() {
		o.stop(), d.clear(), f.clear(), r._s.delete(e);
	}
	let y = (t, n = "") => {
		if (wT in t) return t[TT] = n, t;
		let i = function() {
			iT(r);
			let n = Array.from(arguments), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
			function s(e) {
				a.add(e);
			}
			function c(e) {
				o.add(e);
			}
			ST(f, {
				args: n,
				name: i[TT],
				store: b,
				after: s,
				onError: c
			});
			let l;
			try {
				l = t.apply(this && this.$id === e ? this : b, n);
			} catch (e) {
				throw ST(o, e), e;
			}
			return l instanceof Promise ? l.then((e) => (ST(a, e), e)).catch((e) => (ST(o, e), Promise.reject(e))) : (ST(a, l), l);
		};
		return i[wT] = !0, i[TT] = n, i;
	}, b = /* @__PURE__ */ pn({
		_p: r,
		$id: e,
		$onAction: xT.bind(null, f),
		$patch: g,
		$reset: _,
		$subscribe(t, n = {}) {
			if (d.has(t)) return bT;
			let i = xT(d, t, n.detached, () => a()), a = o.run(() => Gr(() => r.state.value[e], (r) => {
				(n.flush === "sync" ? u : l) && t({
					storeId: e,
					type: "direct",
					events: p
				}, r);
			}, kT({}, c, n)));
			return i;
		},
		$dispose: v
	});
	r._s.set(e, b);
	let x = (r._a && r._a.runWithContext || CT)(() => r._e.run(() => (o = Xe()).run(() => t({ action: y }))));
	for (let t in x) {
		let n = x[t];
		/* @__PURE__ */ En(n) && !AT(n) || /* @__PURE__ */ vn(n) ? a || (m && OT(n) && (/* @__PURE__ */ En(n) ? n.value = m[t] : ((n instanceof Set || n instanceof Map) && n.clear(), ET(n, m[t]))), r.state.value[e][t] = n) : typeof n == "function" && (x[t] = y(n, t), s.actions[t] = n);
	}
	return kT(b, x), kT(/* @__PURE__ */ Sn(b), x), Object.defineProperty(b, "$state", {
		get: () => r.state.value[e],
		set: (e) => {
			g((t) => {
				kT(t, e);
			});
		}
	}), r._p.forEach((e) => {
		let t = o.run(() => e({
			store: b,
			app: r._a,
			pinia: r,
			options: s
		}));
		kT(b, t);
	}), m && a && n.hydrate && n.hydrate(b.$state, m), l = !0, u = !0, b;
}
function NT(e, t, n) {
	let r, i = typeof t == "function";
	r = i ? n : t;
	function a(n, a) {
		let o = zr();
		return n ||= o ? Rr(aT, null) : null, n && iT(n), n = rT, n._s.has(e) || (i ? MT(e, t, r, n) : jT(e, r, n)), n._s.get(e);
	}
	return a.$id = e, a;
}
// src/core/libraryQueue.ts
var PT = class {
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
function FT(e) {
	let t = globalThis.__TRPG_M2_CATALOG_URL__;
	return t ? typeof location < "u" ? new URL(t, location.href).toString() : t : e.catalogUrl;
}
// src/stores/app.ts
var IT = NT("app", () => {
	let e = /* @__PURE__ */ Dn(null), t = /* @__PURE__ */ P(!1), n = /* @__PURE__ */ P(""), r = /* @__PURE__ */ P(null), i = /* @__PURE__ */ P(null), a = new PT();
	function o() {
		if (!e.value) throw Error("助手尚未启动完成");
		return e.value;
	}
	function s(t) {
		e.value = t;
	}
	async function c() {
		let e = await hb(o().db);
		return r.value = e, e;
	}
	async function l() {
		let e = o(), [t, n] = await Promise.all([mb(e.db), hb(e.db)]);
		r.value = n, i.value = pb(t, n, e.now());
	}
	function u() {
		return FT(r.value ?? { catalogUrl: "https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json" });
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
}), LT = 500, RT = NT("campaign", () => {
	let e = null, t, n = /* @__PURE__ */ Dn(null), r = /* @__PURE__ */ Dn(null), i = /* @__PURE__ */ P(!1), a = /* @__PURE__ */ P(!1), o = /* @__PURE__ */ P(!1), s = J(() => r.value !== null), c = /* @__PURE__ */ Dn(null), l = 0;
	function u() {
		if (!e) throw Error("存档服务尚未初始化");
		return e;
	}
	function d() {
		if (i.value) throw new Q("E_READ_ONLY", "另一个窗口正在使用助手，此窗口为只读");
	}
	function f(e) {
		r.value = e, o.value = e ? Bw(e) : !1;
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
		}), t !== void 0 && clearTimeout(t), t = setTimeout(() => void g(), LT);
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
	async function S(e) {
		if (!n.value) throw new Q("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
		return await g(), e(u(), n.value.ownerKey);
	}
	async function C(e) {
		if (d(), !n.value) throw new Q("E_NO_WORKSPACE", "请先在酒馆中打开一个聊天");
		await g();
		let t = await e(u(), n.value.ownerKey);
		return f(t.workspace), t;
	}
	async function w(e, t) {
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
		load: x,
		setPackEnabled: w
	};
});
// src/host/input.ts
function zT(e) {
	let t = f();
	if (!t) return !1;
	let n = t.value, r = n ? `${n}${n.endsWith("\n") ? "" : "\n"}${e}` : e;
	return _(t, r), t.value === r;
}
// src/host/clipboard.ts
async function BT(e) {
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
var VT = 1e3, HT = "例如 2d6+3、1d20+5、4d6";
function UT(e) {
	let t = e.replace(/\s+/g, "").toLowerCase().replace(/＋/g, "+").replace(/－|−/g, "-");
	if (!t) return {
		ok: !1,
		error: `请输入骰式，${HT}`
	};
	let n = [], r = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/y, i = 0;
	for (; i < t.length;) {
		r.lastIndex = i;
		let a = r.exec(t);
		if (!a || i > 0 && !(a[1] || a[4])) return {
			ok: !1,
			error: `骰式看不懂：「${e.trim()}」。${HT}`
		};
		if (i = r.lastIndex, a[3] !== void 0) {
			let e = a[1] === "-" ? -1 : 1, t = a[2] === "" ? 1 : Number(a[2]), r = Number(a[3]);
			if (t < 1 || t > 100) return {
				ok: !1,
				error: "一次最多掷 100 颗骰子"
			};
			if (r < 2 || r > 1e3) return {
				ok: !1,
				error: `骰子面数要在 2 到 ${VT} 之间`
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
		error: `骰式里至少要有一组骰子，${HT}`
	};
}
function WT(e) {
	return e.map((e, t) => {
		let n = e.sign === -1 ? "-" : t === 0 ? "" : "+";
		return e.kind === "dice" ? `${n}${e.count}d${e.sides}` : `${n}${e.value}`;
	}).join("");
}
// src/rules/dice/roll.ts
var GT = () => {
	let e = /* @__PURE__ */ new Uint32Array(1);
	return crypto.getRandomValues(e), e[0] / 4294967296;
};
function KT(e, t) {
	return Math.min(t, Math.floor(e() * t) + 1);
}
function qT(e, t = {}) {
	let n = UT(e);
	if (!n.ok) throw Error(n.error);
	let r = t.rng ?? GT, i = t.mode ?? "normal", a = [...n.terms];
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
			let t = [KT(r, 20), KT(r, 20)], n = i === "adv" ? t[0] >= t[1] ? 0 : 1 : t[0] <= t[1] ? 0 : 1;
			return !s && e.sign === 1 && (s = !0, o = t[n] === 20 ? 20 : t[n] === 1 ? 1 : void 0), {
				term: e,
				rolls: t,
				kept: n,
				subtotal: e.sign * t[n]
			};
		}
		let n = Array.from({ length: e.count }, () => KT(r, e.sides));
		return t && !s && e.sign === 1 && (s = !0, o = n[0] === 20 ? 20 : n[0] === 1 ? 1 : void 0), {
			term: e,
			rolls: n,
			subtotal: e.sign * n.reduce((e, t) => e + t, 0)
		};
	});
	return {
		expression: WT(a),
		mode: i,
		terms: c,
		total: c.reduce((e, t) => e + t.subtotal, 0),
		...o ? { natural: o } : {}
	};
}
// src/rules/dice/format.ts
var JT = {
	normal: "",
	adv: " 优势",
	dis: " 劣势"
};
function YT(e) {
	return e.terms.map((t, n) => {
		let r = t.term.sign === -1 ? "- " : n === 0 ? "" : "+ ";
		return t.term.kind === "const" ? `${r}${t.term.value}` : t.kept === void 0 ? `${r}${t.rolls.join(" + ")}` : `${r}取${e.mode === "adv" ? "高" : "低"} ${t.rolls.join("/")}`;
	}).join(" ");
}
function XT(e) {
	return `${e.expression}${JT[e.mode]} = ${e.total}（${YT(e)}）`;
}
function ZT(e, t) {
	let n = t.trim().replace(/-{2,}/g, "—").replace(/[<>]/g, "");
	return `<!-- [掷骰] ${n ? `${n}：` : ""}${e} -->`;
}
var QT = "trpg-assistant:dice";
function $T(e) {
	return e ? `${QT}:${e}` : QT;
}
function eE(e) {
	let t = {
		history: [],
		bonus: 0,
		mode: "normal",
		note: ""
	};
	try {
		let n = localStorage.getItem($T(e));
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
var tE = NT("dice", () => {
	let e = null, t = GT, n = 1, r, i = eE(null), a = /* @__PURE__ */ P(i.history), o = /* @__PURE__ */ P(i.bonus), s = /* @__PURE__ */ P(i.mode), c = /* @__PURE__ */ P(i.note), l = /* @__PURE__ */ P(""), u = /* @__PURE__ */ P(null), d = /* @__PURE__ */ P(""), f = /* @__PURE__ */ P("idle"), p = /* @__PURE__ */ P(!1);
	function m() {
		try {
			localStorage.setItem($T(e), JSON.stringify({
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
		let n = eE(t);
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
			line: XT(e),
			...e.natural ? { natural: e.natural } : {}
		};
		return u.value = t, a.value = [t, ...a.value].slice(0, 20), f.value = "idle", p.value = !1, d.value = "", m(), t;
	}
	function v(e) {
		let n = e === 20;
		return _(qT(`1d${e}`, {
			rng: t,
			mode: n ? s.value : "normal",
			bonus: n ? o.value : 0
		}));
	}
	function y() {
		try {
			return _(qT(l.value, {
				rng: t,
				mode: s.value
			}));
		} catch (e) {
			return d.value = e instanceof Error ? e.message : String(e), null;
		}
	}
	function b(e) {
		return _(qT(e.expression, {
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
	let T = (e) => ZT(e.line, e.note);
	function ee() {
		if (!u.value) return !1;
		let e = zT(T(u.value));
		return f.value = e ? "done" : "failed", r !== void 0 && clearTimeout(r), e && (r = setTimeout(() => f.value = "idle", 2e3)), e;
	}
	async function E() {
		return u.value ? (p.value = await BT(T(u.value)), p.value) : !1;
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
}), nE = NT("library", () => {
	let e = IT(), t = RT(), n = /* @__PURE__ */ Dn([]), r = /* @__PURE__ */ Dn(null), i = /* @__PURE__ */ P("idle"), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P({}), s = /* @__PURE__ */ Dn([]), c = /* @__PURE__ */ P([]), l = null, u = J(() => new Map(n.value.map((e) => [e.id, e]))), d = J(() => r.value ? gC(n.value, r.value) : []);
	function f(e) {
		return r.value ? _C(n.value, r.value, e) : [];
	}
	async function p() {
		n.value = await e.svc().packs.list(), c.value = await yC(e.svc().db), l = null;
	}
	async function m() {
		let n = t.workspace;
		return s.value = n ? await Tw(e.svc().db, n.data) : [], s.value;
	}
	let h = J(() => t.workspace ? ow(t.workspace.data, u.value) : /* @__PURE__ */ new Map());
	async function g(t) {
		if (!l) {
			let t = await e.svc().db.entries.toCollection().primaryKeys();
			l = new Map(t.map(([e, t]) => [t, e]));
		}
		return l.get(t);
	}
	async function _(t = !1) {
		i.value = "loading";
		try {
			let n = e.svc();
			return r.value = await pC({
				url: e.catalogUrl(),
				db: n.db,
				force: t
			}), i.value = "ok", a.value = "", !0;
		} catch (e) {
			return console.error("[trpg-assistant] 读取数据仓库目录失败", e), i.value = "error", a.value = e instanceof Error ? e.message : String(e), !1;
		}
	}
	function v(e, t) {
		let n = o.value[e] ?? {
			id: e,
			state: "waiting",
			received: 0,
			total: 0
		};
		o.value = {
			...o.value,
			[e]: {
				...n,
				...t
			}
		};
	}
	function y(e) {
		let { [e]: t, ...n } = o.value;
		o.value = n;
	}
	function b(e) {
		let t = [], n = /* @__PURE__ */ new Set(), i = (e) => {
			if (!n.has(e.id)) {
				n.add(e.id);
				for (let t of e.relationships.requires) {
					if (u.value.has(t.id)) continue;
					let e = r.value?.packs.find((e) => e.id === t.id);
					e && i(e);
				}
				t.push(e);
			}
		};
		return i(e), t;
	}
	async function x(t) {
		let n = b(t), r = !0;
		for (let t of n) await SC(e.svc().db, t.id, !1);
		for (let e of n) v(e.id, {
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
				v(n.id, {
					state: "downloading",
					total: n.byteSize
				});
				let i = await mC(n, {
					catalogUrl: e.catalogUrl(),
					signal: t,
					onProgress: (e, t) => v(n.id, {
						received: e,
						total: t
					})
				});
				v(n.id, { state: "installing" }), await hC(r.packs, i, n);
			}
		}).then(async () => {
			y(n.id), await p();
		}).catch((e) => {
			n.id === t.id && (r = !1), e instanceof Q && e.code === "E_CANCELLED" ? y(n.id) : (console.error(`[trpg-assistant] 安装失败：${n.id}`, e), v(n.id, {
				state: "failed",
				error: e instanceof Error ? e.message : String(e)
			}));
		}));
		return await Promise.all(i), r;
	}
	async function S(t, n) {
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
			await p();
		}
	}
	function C(t) {
		let n = () => t.some((t) => e.queue.state(`pack:${t}`) !== void 0);
		return n() ? new Promise((t) => {
			let r = e.queue.onChange(() => {
				n() || (r(), t());
			});
		}) : Promise.resolve();
	}
	async function w(t) {
		let n = e.svc();
		if ((await n.db.getMeta("autoInstall"))?.[t]?.done || !r.value) return;
		let i = /* @__PURE__ */ new Set([...await xC(n.db), ...await yC(n.db)]), a = r.value.packs.filter((e) => e.ruleId === t && e.recommended && !u.value.has(e.id) && !i.has(e.id));
		await Promise.all(a.map((e) => x(e)));
		let o = r.value.packs.some((e) => e.ruleId === t && e.recommended && !i.has(e.id) && !u.value.has(e.id)), s = { ...await n.db.getMeta("autoInstall") ?? {} };
		s[t] = o ? { done: !1 } : {
			done: !0,
			at: n.now()
		}, await n.db.setMeta("autoInstall", s);
	}
	function T(t) {
		e.queue.cancel(`pack:${t}`);
	}
	function ee(t) {
		return e.queue.state(`pack:${t}`);
	}
	return {
		installed: n,
		issues: s,
		builtinRemoved: c,
		featureUpdateCounts: h,
		runIntegrity: m,
		packOfEntry: g,
		catalog: r,
		catalogState: i,
		catalogError: a,
		tasks: o,
		installedMap: u,
		updates: d,
		downloadable: f,
		refreshInstalled: p,
		loadCatalog: _,
		install: x,
		installFile: S,
		waitFor: C,
		ensureRecommended: w,
		cancel: T,
		queueState: ee,
		clearTask: y
	};
}), rE = {
	success: 4e3,
	info: 4e3,
	undo: 6e3,
	error: 8e3,
	status: 6e3
}, iE = NT("toast", () => {
	let e = /* @__PURE__ */ P([]), t = /* @__PURE__ */ new Map(), n = 1;
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
		return i(s, rE[t]), s;
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
async function aE(e, t) {
	let n = IT(t), r = iE(t), i = RT(t), a = tE(t), o = nE(t);
	try {
		let e = tT();
		n.setServices(e);
		let t = e.rules.get(Zw);
		if (!t) throw Error("规则未注册");
		let s = await CC(e.db, e.packs, t, Sb);
		s.failed.length && (console.error("[trpg-assistant] 内置内容包安装失败", s.failed), r.error(`内置规则资料安装失败：${s.failed.map((e) => e.message).join("；")}`)), await _b(e.db), await o.refreshInstalled(), await n.refreshBackup();
		let c = yb(d());
		await i.init(e, c), a.setOwner(c?.ownerKey ?? null), n.booted = !0;
	} catch (e) {
		return console.error("[trpg-assistant] 启动失败", e), n.bootError = e instanceof Error ? e.message : String(e), () => void 0;
	}
	let s = Gr(() => [i.workspace?.currentSaveId, i.workspace?.savedHash], () => void i.refreshCurrentSave().catch((e) => console.error("[trpg-assistant] 读取当前存档信息失败", e)), { immediate: !0 }), c = Gr(() => i.readOnly, (e) => {
		e && r.status("另一个窗口正在使用助手，这里只能查看");
	}, { immediate: !0 }), l = g(e, h(e, "CHAT_CHANGED", "chat_id_changed"), () => {
		let e = yb(d());
		i.switchOwner(e).catch((e) => {
			console.error("[trpg-assistant] 切换聊天后载入战役数据失败", e), r.error("切换聊天后载入战役数据失败，请重新打开助手");
		}), a.setOwner(e?.ownerKey ?? null);
	});
	return () => {
		c(), s(), l();
	};
}
// src/stores/ui.ts
var oE = {
	home: "首页",
	library: "库",
	settings: "设置"
}, sE = NT("ui", () => {
	let e = /* @__PURE__ */ P(!1), t = /* @__PURE__ */ P("home"), n = /* @__PURE__ */ P(!1), r = /* @__PURE__ */ P("save"), i = /* @__PURE__ */ P(null);
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
}), cE = [
	"data-kind",
	"onPointerenter",
	"onPointerleave",
	"onFocusin",
	"onFocusout"
], lE = { class: "trpg-toast__text" }, uE = ["onClick"], dE = /* @__PURE__ */ L({
	__name: "ToastHost",
	setup(e) {
		let t = iE();
		return (e, n) => (V(), U(Ql, {
			name: "trpg-toast",
			tag: "div",
			class: "trpg-toasts",
			role: "status",
			"aria-live": "polite"
		}, {
			default: I(() => [(V(!0), H(B, null, R(F(t).toasts, (e) => (V(), H("div", {
				key: e.id,
				class: "trpg-toast",
				"data-kind": e.kind,
				onPointerenter: (n) => F(t).pause(e.id),
				onPointerleave: (n) => F(t).resume(e.id),
				onFocusin: (n) => F(t).pause(e.id),
				onFocusout: (n) => F(t).resume(e.id)
			}, [W("span", lE, j(e.message), 1), e.undo ? (V(), H("button", {
				key: 0,
				type: "button",
				onClick: (n) => F(t).runUndo(e.id)
			}, "撤销", 8, uE)) : q("", !0)], 40, cE))), 128))]),
			_: 1
		}));
	}
}), fE = {
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
}, pE = [
	"width",
	"height",
	"innerHTML"
], mE = /* @__PURE__ */ L({
	__name: "Icon",
	props: {
		name: {},
		size: {}
	},
	setup(e) {
		let t = e, n = J(() => fE[t.name] ?? ""), r = J(() => `${t.size ?? 18}px`);
		return (e, t) => (V(), H("svg", {
			class: "trpg-icon",
			viewBox: "0 0 256 256",
			fill: "currentColor",
			"aria-hidden": "true",
			focusable: "false",
			width: r.value,
			height: r.value,
			innerHTML: n.value
		}, null, 8, pE));
	}
}), hE = ["aria-label"], gE = ["aria-pressed", "onClick"], _E = /* @__PURE__ */ L({
	__name: "Segmented",
	props: /*@__PURE__*/ $a({
		options: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = So(e, "modelValue");
		return (n, r) => (V(), H("div", {
			class: "trpg-seg",
			role: "group",
			"aria-label": e.label
		}, [(V(!0), H(B, null, R(e.options, (e) => (V(), H("button", {
			key: e.value,
			type: "button",
			"aria-pressed": t.value === e.value,
			onClick: (n) => t.value = e.value
		}, j(e.label), 9, gE))), 128))], 8, hE));
	}
});
// src/ui/shell/storage.ts
function vE(e, t) {
	try {
		let n = localStorage.getItem(e);
		if (!n) return t;
		let r = JSON.parse(n);
		return Number.isFinite(r.x) && Number.isFinite(r.y) ? r : t;
	} catch (e) {
		return console.warn("[trpg-assistant] 读取窗口位置失败", e), t;
	}
}
function yE(e, t) {
	try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/useDrag.ts
function bE(e, t, n) {
	return Math.min(Math.max(e, t), Math.max(t, n));
}
function xE(e) {
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
				x: (typeof e.lockX == "function" ? e.lockX() : e.lockX) ? s.x : bE(s.x + r, 0, window.innerWidth - l),
				y: bE(s.y + i, 0, window.innerHeight - u)
			};
		}, u = (t) => {
			i.removeEventListener("pointermove", l), i.removeEventListener("pointerup", u), i.removeEventListener("pointercancel", u), i.hasPointerCapture(t.pointerId) && i.releasePointerCapture(t.pointerId), c ? e.onEnd?.() : e.onTap?.();
		};
		i.addEventListener("pointermove", l), i.addEventListener("pointerup", u), i.addEventListener("pointercancel", u);
	}
	return { onPointerDown: n };
}
// src/ui/shell/DiceTray.vue?vue&type=script&setup=true&lang.ts
var SE = ["data-narrow"], CE = { class: "trpg-dice__body" }, wE = ["data-natural"], TE = {
	class: "trpg-dice__line",
	"data-testid": "dice-line"
}, EE = ["data-tone"], DE = {
	key: 1,
	class: "trpg-dice__placeholder"
}, OE = {
	class: "trpg-dice__quick",
	role: "group",
	"aria-label": "快捷骰"
}, kE = ["onClick"], AE = { class: "trpg-dice__mods" }, jE = {
	class: "trpg-dice__bonus",
	role: "group",
	"aria-label": "d20 加值"
}, ME = ["disabled"], NE = {
	class: "trpg-dice__bonus-value",
	"data-testid": "dice-bonus"
}, PE = ["disabled"], FE = { class: "trpg-field" }, IE = { class: "trpg-dice__expr-row" }, LE = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, RE = { class: "trpg-field" }, zE = ["value"], BE = { class: "trpg-dice__out" }, VE = ["disabled"], HE = ["disabled"], UE = {
	class: "trpg-dice__recent",
	"aria-label": "最近记录"
}, WE = { class: "trpg-dice__recent-head" }, GE = ["aria-expanded"], KE = {
	key: 1,
	class: "trpg-field__label"
}, qE = {
	key: 0,
	class: "trpg-dice__list"
}, JE = { class: "trpg-dice__item-total" }, YE = { class: "trpg-dice__item-main" }, XE = { class: "trpg-row__meta" }, ZE = ["aria-label", "onClick"], QE = /* @__PURE__ */ L({
	__name: "DiceTray",
	setup(e) {
		let t = sE(), n = tE(), r = [
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
		], a = /* @__PURE__ */ P(null), o = /* @__PURE__ */ P(window.innerWidth), s = /* @__PURE__ */ P(window.innerHeight), c = J(() => o.value <= 480), l = /* @__PURE__ */ P(vE("trpg-assistant:dice", {
			x: Math.max(8, window.innerWidth - 384),
			y: Math.max(8, window.innerHeight - 640)
		})), u = /* @__PURE__ */ P(!c.value), d = () => ({
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
		let p = xE({
			position: l,
			size: d,
			lockX: () => c.value,
			onEnd: () => yE("trpg-assistant:dice", l.value)
		}), m = J(() => c.value ? {
			left: "4vw",
			width: "92vw",
			top: `${l.value.y}px`
		} : {
			left: `${l.value.x}px`,
			top: `${l.value.y}px`
		});
		ga(() => {
			window.addEventListener("resize", f), hr(f);
		}), ya(() => window.removeEventListener("resize", f)), Gr(() => t.diceOpen, (e) => e && void hr(f));
		let h = J(() => n.bonus > 0 ? `+${n.bonus}` : String(n.bonus)), g = J(() => n.fillState === "done" ? "已填入 ✓" : n.fillState === "failed" ? "尚未填入，再试一次" : "填入输入框"), _ = (e) => new Date(e).toLocaleTimeString("zh-CN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: !1
		});
		return (e, o) => F(t).diceOpen ? (V(), H("aside", {
			key: 0,
			ref_key: "el",
			ref: a,
			class: "trpg-dice",
			style: ke(m.value),
			"data-narrow": c.value,
			role: "dialog",
			"aria-label": "掷骰",
			"aria-modal": "false"
		}, [W("header", {
			class: "trpg-dice__head",
			onPointerdown: o[1] ||= (...e) => F(p).onPointerDown && F(p).onPointerDown(...e)
		}, [
			G(mE, {
				name: "dice-five",
				size: 20
			}),
			o[14] ||= W("span", { class: "trpg-dice__title" }, "掷骰", -1),
			W("button", {
				class: "trpg-icon-btn",
				type: "button",
				"aria-label": "关闭掷骰",
				onClick: o[0] ||= (e) => F(t).diceOpen = !1
			}, [G(mE, {
				name: "x",
				size: 18
			})])
		], 32), W("div", CE, [
			W("div", {
				class: "trpg-dice__result",
				"aria-live": "polite",
				"data-natural": F(n).last?.natural
			}, [F(n).last ? (V(), H(B, { key: 0 }, [
				(V(), H("div", {
					key: F(n).last.id,
					class: "trpg-dice__total",
					"data-testid": "dice-total"
				}, j(F(n).last.total), 1)),
				W("div", TE, j(F(n).last.line), 1),
				F(n).last.natural ? (V(), H("span", {
					key: 0,
					class: "trpg-badge",
					"data-tone": F(n).last.natural === 20 ? "gold" : "danger"
				}, "天然 " + j(F(n).last.natural), 9, EE)) : q("", !0)
			], 64)) : (V(), H("p", DE, "点一个骰子开始掷"))], 8, wE),
			W("div", OE, [(V(), H(B, null, R(r, (e) => W("button", {
				key: e,
				class: Pe(["trpg-btn", { "trpg-btn--primary": e === 20 }]),
				type: "button",
				onClick: (t) => F(n).rollQuick(e)
			}, " d" + j(e), 11, kE)), 64))]),
			W("div", AE, [G(_E, {
				"model-value": F(n).mode,
				label: "优势或劣势（d20）",
				options: i,
				"onUpdate:modelValue": o[2] ||= (e) => F(n).setMode(e)
			}, null, 8, ["model-value"]), W("div", jE, [
				o[15] ||= W("span", { class: "trpg-field__label" }, "加值", -1),
				W("button", {
					class: "trpg-icon-btn",
					type: "button",
					"aria-label": "加值减 1",
					disabled: F(n).bonus <= F(-20),
					onClick: o[3] ||= (e) => F(n).setBonus(F(n).bonus - 1)
				}, "–", 8, ME),
				W("output", NE, j(h.value), 1),
				W("button", {
					class: "trpg-icon-btn",
					type: "button",
					"aria-label": "加值加 1",
					disabled: F(n).bonus >= F(30),
					onClick: o[4] ||= (e) => F(n).setBonus(F(n).bonus + 1)
				}, "+", 8, PE)
			])]),
			W("form", {
				class: "trpg-dice__expr",
				onSubmit: o[7] ||= ku((e) => F(n).rollExpression(), ["prevent"])
			}, [W("label", FE, [
				o[17] ||= W("span", { class: "trpg-field__label" }, "骰式", -1),
				W("span", IE, [Fr(W("input", {
					"onUpdate:modelValue": o[5] ||= (e) => F(n).expression = e,
					class: "trpg-input",
					type: "text",
					inputmode: "text",
					placeholder: "2d6+3",
					"aria-label": "骰式",
					autocomplete: "off",
					onKeydown: o[6] ||= ku(() => {}, ["stop"])
				}, null, 544), [[mu, F(n).expression]]), o[16] ||= W("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "submit"
				}, "掷", -1)]),
				F(n).error ? (V(), H("span", LE, j(F(n).error), 1)) : q("", !0)
			])], 32),
			W("label", RE, [o[18] ||= W("span", { class: "trpg-field__label" }, "说明（可空）", -1), W("input", {
				value: F(n).note,
				class: "trpg-input",
				type: "text",
				placeholder: "感知检定",
				"aria-label": "说明",
				autocomplete: "off",
				onInput: o[8] ||= (e) => F(n).setNote(e.target.value),
				onKeydown: o[9] ||= ku(() => {}, ["stop"])
			}, null, 40, zE)]),
			W("div", BE, [W("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: !F(n).last,
				onClick: o[10] ||= (e) => F(n).fill()
			}, j(g.value), 9, VE), W("button", {
				class: "trpg-btn",
				type: "button",
				disabled: !F(n).last,
				onClick: o[11] ||= (e) => F(n).copy()
			}, j(F(n).copied ? "已复制 ✓" : "复制"), 9, HE)]),
			W("section", UE, [W("div", WE, [c.value ? (V(), H("button", {
				key: 0,
				class: "trpg-btn trpg-btn--quiet trpg-btn--small",
				type: "button",
				"aria-expanded": u.value,
				onClick: o[12] ||= (e) => u.value = !u.value
			}, [K(" 最近 " + j(F(n).history.length) + " 次", 1), G(mE, {
				name: u.value ? "caret-down" : "caret-right",
				size: 14
			}, null, 8, ["name"])], 8, GE)) : (V(), H("span", KE, "最近")), F(n).history.length ? (V(), H("button", {
				key: 2,
				class: "trpg-btn trpg-btn--quiet trpg-btn--small",
				type: "button",
				onClick: o[13] ||= (e) => F(n).clearHistory()
			}, "清空")) : q("", !0)]), u.value && F(n).history.length ? (V(), H("ul", qE, [(V(!0), H(B, null, R(F(n).history, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-dice__item"
			}, [
				W("b", JE, j(e.total), 1),
				W("span", YE, [K(j(e.line), 1), e.note ? (V(), H(B, { key: 0 }, [K(" · " + j(e.note), 1)], 64)) : q("", !0)]),
				W("time", XE, j(_(e.at)), 1),
				W("button", {
					class: "trpg-icon-btn",
					type: "button",
					"aria-label": `再掷一次 ${e.expression}`,
					onClick: (t) => F(n).reroll(e)
				}, [G(mE, {
					name: "arrow-clockwise",
					size: 16
				})], 8, ZE)
			]))), 128))])) : q("", !0)])
		])], 12, SE)) : q("", !0);
	}
}), $E = ["aria-expanded"], eD = 48, tD = /* @__PURE__ */ L({
	__name: "FloatingBall",
	setup(e) {
		let t = sE(), n = /* @__PURE__ */ P(vE("trpg-assistant:ball", {
			x: 16,
			y: Math.round(window.innerHeight / 2)
		}));
		function r() {
			n.value = {
				x: Math.min(Math.max(n.value.x, 0), Math.max(0, window.innerWidth - eD)),
				y: Math.min(Math.max(n.value.y, 0), Math.max(0, window.innerHeight - eD))
			};
		}
		ga(() => {
			r(), window.addEventListener("resize", r);
		}), ya(() => window.removeEventListener("resize", r));
		let i = xE({
			position: n,
			size: () => ({
				w: eD,
				h: eD
			}),
			onTap: () => {
				t.windowOpen = !t.windowOpen;
			},
			onEnd: () => yE("trpg-assistant:ball", n.value)
		}), a = J(() => ({
			left: `${n.value.x}px`,
			top: `${n.value.y}px`
		}));
		return (e, n) => (V(), H("button", {
			class: "trpg-ball",
			type: "button",
			"aria-label": "打开或收起 TRPG 跑团助手",
			"aria-expanded": F(t).windowOpen,
			style: ke(a.value),
			onPointerdown: n[0] ||= (...e) => F(i).onPointerDown && F(i).onPointerDown(...e),
			onKeydown: [n[1] ||= ju(ku((e) => F(t).windowOpen = !F(t).windowOpen, ["prevent"]), ["enter"]), n[2] ||= ju(ku((e) => F(t).windowOpen = !F(t).windowOpen, ["prevent"]), ["space"])]
		}, [G(mE, {
			name: "dice-five",
			size: 26
		})], 44, $E));
	}
}), nD = NT("modal", () => {
	let e = /* @__PURE__ */ Dn([]), t = /* @__PURE__ */ Dn("forward"), n = J(() => e.value.length > 0), r = J(() => e.value[e.value.length - 1]), i = J(() => e.value.length), a = J(() => e.value[0]?.variant ?? "dialog");
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
}), rD = ["data-variant"], iD = { class: "trpg-modal__head" }, aD = ["aria-label"], oD = ["inert", "aria-hidden"], sD = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])", cD = /* @__PURE__ */ L({
	__name: "ModalHost",
	setup(e) {
		let t = nD(), n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(null), i = `trpg-modal-title-${Math.random().toString(36).slice(2, 8)}`, a = null, o = [], s = /* @__PURE__ */ new Map(), c = J(() => t.depth > 1 ? t.stack[t.depth - 2].title : ""), l = null;
		function u(e) {
			let t = e.composedPath()[0];
			l = t instanceof HTMLElement ? t.closest("button, a[href], input, select, textarea, [tabindex]") : null;
		}
		let d;
		ga(() => {
			d = n.value?.getRootNode(), d?.addEventListener("pointerdown", u, !0);
		}), ya(() => d?.removeEventListener("pointerdown", u, !0));
		function f() {
			let e = n.value?.getRootNode(), t = e instanceof ShadowRoot ? e.activeElement : document.activeElement, r = l && l.isConnected ? l : null;
			return r && (!t || t === document.body || t !== r && t.contains(r)) ? r : t && t !== document.body ? t : null;
		}
		function p() {
			let e = r.value;
			return e ? [e.querySelector(".trpg-modal__head"), e.querySelector(".trpg-modal__page:not(.is-under)")].flatMap((e) => e ? [...e.querySelectorAll(sD)] : []).filter((e) => e.getClientRects().length > 0) : [];
		}
		function m() {
			let e = r.value?.querySelector(".trpg-modal__page:not(.is-under)");
			(e?.querySelector("[data-autofocus]") ?? e?.querySelector(sD) ?? r.value)?.focus({ preventScroll: !0 });
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
		Gr(() => [t.depth, t.top?.key], async ([e, t], [n, r]) => {
			if (g(), e === 0) {
				s.clear();
				let e = a;
				a = null, o.length = 0, await hr(), v(e);
			} else if (n === 0 ? a = f() : e > n && o.push(f()), await hr(), e < n && _(), e < n && n > 0) {
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
		return (e, a) => (V(), H("div", {
			ref_key: "rootEl",
			ref: n,
			class: "trpg-modal-root"
		}, [F(t).isOpen ? (V(), H("div", {
			key: 0,
			class: "trpg-modal",
			"data-variant": F(t).variant,
			onClick: a[2] ||= ku((e) => F(t).requestClose(), ["self"]),
			onKeydown: ku(y, ["stop"])
		}, [W("section", {
			ref_key: "cardEl",
			ref: r,
			class: "trpg-modal__card",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": i,
			tabindex: "-1"
		}, [W("header", iD, [
			F(t).depth > 1 ? (V(), H("button", {
				key: 0,
				class: "trpg-modal__back",
				type: "button",
				"aria-label": `返回：${c.value}`,
				onClick: a[0] ||= (e) => F(t).pop()
			}, [G(mE, {
				name: "caret-left",
				size: 16
			}), W("span", null, j(c.value), 1)], 8, aD)) : q("", !0),
			W("h2", {
				id: i,
				class: "trpg-modal__title"
			}, j(F(t).top?.title), 1),
			F(t).top?.header ? (V(), U(ka(F(t).top.header), Fe(Ks({ key: 1 }, F(t).top.props)), null, 16)) : q("", !0),
			W("button", {
				class: "trpg-icon-btn trpg-modal__close",
				type: "button",
				"aria-label": "关闭",
				onClick: a[1] ||= (e) => F(t).requestClose()
			}, [G(mE, {
				name: "x",
				size: 18
			})])
		]), G(Ql, {
			tag: "div",
			name: "trpg-page",
			class: "trpg-modal__pages"
		}, {
			default: I(() => [(V(!0), H(B, null, R(F(t).stack, (e, n) => (V(), H("div", {
				key: e.key,
				class: Pe(["trpg-modal__page", { "is-under": n < F(t).depth - 1 }]),
				inert: n < F(t).depth - 1,
				"aria-hidden": n < F(t).depth - 1 ? "true" : void 0
			}, [(V(), U(ka(e.component), Ks({ ref_for: !0 }, e.props), null, 16))], 10, oD))), 128))]),
			_: 1
		})], 512)], 40, rD)) : q("", !0)], 512));
	}
}), lD = {
	src: null,
	alt: "",
	source: "pattern"
};
function uD(e) {
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
	} : lD;
}
// src/ui/format.ts
var dD = (e) => String(e).padStart(2, "0");
function fD(e) {
	let t = new Date(e);
	return `${t.getMonth() + 1}月${t.getDate()}日 ${dD(t.getHours())}:${dD(t.getMinutes())}`;
}
function pD(e) {
	let t = new Date(e);
	return `${dD(t.getHours())}:${dD(t.getMinutes())}`;
}
function mD(e) {
	return e >= 1048576 ? `${(e / 1024 / 1024).toFixed(1).replace(/\.0$/, "")}MB` : e >= 1024 ? `${Math.round(e / 1024)}KB` : `${e}B`;
}
function hD(e) {
	let { partyNames: t, location: n, round: r } = e.summary;
	return [
		t.slice(0, 3).join("、"),
		n,
		r ? `第 ${r} 轮` : ""
	].filter(Boolean).join(" · ");
}
function gD(e) {
	return e instanceof Error ? e.message : String(e);
}
// src/stores/saves.ts
var _D = NT("saves", () => {
	let e = IT(), t = RT(), n = /* @__PURE__ */ P("card"), r = /* @__PURE__ */ P([]), i = /* @__PURE__ */ P([]), a = /* @__PURE__ */ P([]), o = /* @__PURE__ */ P([]), s = /* @__PURE__ */ P([]), c = /* @__PURE__ */ P(!1);
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
function vD(e, t) {
	let n = nD();
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
var yD = { class: "trpg-confirm" }, bD = { class: "trpg-confirm__message" }, xD = {
	key: 0,
	class: "trpg-confirm__details"
}, SD = { class: "trpg-confirm__actions" }, CD = ["data-autofocus"], wD = ["data-autofocus"], TD = /* @__PURE__ */ L({
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
		return (e, n) => (V(), H("div", yD, [
			W("p", bD, j(t.message), 1),
			t.details?.length ? (V(), H("ul", xD, [(V(!0), H(B, null, R(t.details, (e) => (V(), H("li", { key: e }, j(e), 1))), 128))])) : q("", !0),
			W("div", SD, [W("button", {
				class: "trpg-btn",
				type: "button",
				"data-autofocus": t.danger ? "" : void 0,
				onClick: n[0] ||= (e) => t.onAnswer(!1)
			}, j(t.cancelLabel ?? "取消"), 9, CD), W("button", {
				class: Pe(["trpg-btn", t.danger ? "trpg-btn--danger" : "trpg-btn--primary"]),
				type: "button",
				"data-autofocus": t.danger ? void 0 : "",
				onClick: n[1] ||= (e) => t.onAnswer(!0)
			}, j(t.confirmLabel), 11, wD)])
		]));
	}
}), ED = 0;
function DD(e) {
	return vD({
		key: `confirm:${++ED}`,
		title: e.title,
		component: Cn(TD),
		props: (t) => ({
			...e,
			onAnswer: t
		})
	}, !1);
}
// src/ui/imports/NameConflictPage.vue?vue&type=script&setup=true&lang.ts
var OD = { class: "trpg-confirm" }, kD = { class: "trpg-confirm__message" }, AD = { class: "trpg-field__hint" }, jD = {
	key: 0,
	class: "trpg-field__hint"
}, MD = {
	key: 1,
	class: "trpg-field__hint"
}, ND = { class: "trpg-confirm__actions trpg-confirm__actions--stack" }, PD = ["disabled"], FD = /* @__PURE__ */ L({
	__name: "NameConflictPage",
	props: {
		name: {},
		canReplace: { type: Boolean },
		usedBy: {},
		onChoose: { type: Function }
	},
	setup(e) {
		let t = e;
		return (e, n) => (V(), H("div", OD, [
			W("p", kD, "已安装一个名为「" + j(t.name) + "」的扩展包，但它和要导入的不是同一个扩展包。", 1),
			W("p", AD, "保留两个：导入的扩展包显示为「" + j(t.name) + "（2）」。", 1),
			t.usedBy > 0 ? (V(), H("p", jD, "替换：有 " + j(t.usedBy) + " 个存档用到了已安装的那个。", 1)) : q("", !0),
			t.canReplace ? q("", !0) : (V(), H("p", MD, "内置扩展包不能被替换。")),
			W("div", ND, [
				W("button", {
					class: "trpg-btn",
					type: "button",
					"data-autofocus": "",
					onClick: n[0] ||= (e) => t.onChoose("cancel")
				}, "取消"),
				W("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[1] ||= (e) => t.onChoose("keep-both")
				}, "保留两个"),
				W("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					disabled: !t.canReplace,
					onClick: n[2] ||= (e) => t.onChoose("replace")
				}, "替换已安装的", 8, PD)
			])
		]));
	}
}), ID = { class: "trpg-confirm" }, LD = { class: "trpg-confirm__message" }, RD = { class: "trpg-compare" }, zD = {
	key: 0,
	class: "trpg-field__hint"
}, BD = {
	key: 1,
	class: "trpg-field__error"
}, VD = { class: "trpg-confirm__actions" }, HD = ["disabled"], UD = /* @__PURE__ */ L({
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
		return (t, s) => (V(), H("div", ID, [
			W("p", LD, "已安装同一个扩展包「" + j(r.value.name) + "」。", 1),
			W("table", RD, [s[6] ||= W("thead", null, [W("tr", null, [
				W("th"),
				W("th", null, "已安装"),
				W("th", null, "要导入的")
			])], -1), W("tbody", null, [
				W("tr", null, [
					s[2] ||= W("th", null, "版本", -1),
					W("td", null, "v" + j(r.value.version), 1),
					W("td", null, "v" + j(e.rec.manifest.version) + j(o.value), 1)
				]),
				W("tr", null, [
					s[3] ||= W("th", null, "条目", -1),
					W("td", null, j(r.value.entryCount), 1),
					W("td", null, j(e.rec.manifest.entryCount), 1)
				]),
				W("tr", null, [
					s[4] ||= W("th", null, "来源", -1),
					W("td", null, j(n[r.value.source]), 1),
					s[5] ||= W("td", null, "导入文件", -1)
				])
			])]),
			e.plan.contentChanged ? (V(), H("p", zD, "版本相同，但内容与已安装的不同。")) : q("", !0),
			a.value ? (V(), H("p", BD, "内置扩展包不能降级。")) : q("", !0),
			s[7] ||= W("p", { class: "trpg-field__hint" }, "覆盖后，存档中已加入游戏的内容不受影响。", -1),
			W("div", VD, [W("button", {
				class: "trpg-btn",
				type: "button",
				"data-autofocus": "",
				onClick: s[0] ||= (t) => e.onAnswer(!1)
			}, "取消"), W("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: a.value,
				onClick: s[1] ||= (t) => e.onAnswer(!0)
			}, j(i.value), 9, HD)])
		]));
	}
}), WD = 0;
async function GD(e, t) {
	if (t.action === "install") return { ok: !0 };
	if (t.action === "overwrite") return await vD({
		key: `confirm:overwrite-${++WD}`,
		title: "覆盖扩展包？",
		component: Cn(UD),
		props: (n) => ({
			plan: t,
			rec: e,
			onAnswer: n
		})
	}, !1) ? {
		ok: !0,
		resolution: "overwrite"
	} : { ok: !1 };
	let n = t.existing ? (await IT().svc().packs.referencingSaves(t.existing.id)).length : 0, r = await vD({
		key: `confirm:name-${++WD}`,
		title: "已有同名扩展包",
		component: Cn(FD),
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
var KD = {
	class: "page-stack",
	"data-testid": "import-pack"
}, qD = { class: "trpg-import__ok" }, JD = { class: "trpg-row__title" }, YD = { class: "trpg-row__meta" }, XD = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, ZD = {
	key: 1,
	"aria-label": "需要先安装"
}, QD = { class: "trpg-list" }, $D = { class: "trpg-row__main" }, eO = ["disabled", "onClick"], tO = {
	key: 1,
	class: "trpg-row__meta"
}, nO = {
	key: 2,
	"aria-label": "推荐一起安装"
}, rO = { class: "trpg-list" }, iO = { class: "trpg-row__main" }, aO = ["onClick"], oO = {
	key: 3,
	class: "trpg-field__hint"
}, sO = {
	key: 4,
	class: "trpg-import__ok",
	role: "status"
}, cO = { class: "trpg-confirm__actions" }, lO = ["disabled"], uO = /* @__PURE__ */ L({
	__name: "PackPreview",
	props: { rec: {} },
	setup(e) {
		let t = e, n = IT(), r = nE(), i = nD(), a = iE(), o = /* @__PURE__ */ Dn(null), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(!1), l = J(() => n.svc().rules.get(t.rec.manifest.ruleId)?.name ?? t.rec.manifest.ruleId), u = (e) => r.catalog?.packs.find((t) => t.id === e)?.name ?? e, d = (e) => !!r.catalog?.packs.some((t) => t.id === e), f = {
			ruleOptions: "规则选项",
			aiNotes: "AI 基调",
			characterCreation: "建卡方式",
			activity: "活动",
			tracker: "追踪器"
		}, p = J(() => o.value?.unsupportedFeatures.map((e) => `${f[e.kind] ?? e.kind} ${e.count} 个`).join("、") ?? ""), m = J(() => o.value?.blocked === "lineage-mismatch" ? `已安装的「${o.value.installed?.name}」与这个文件编号相同但来源不同。先卸载已安装的，或请作者更换编号。` : o.value?.blocked === "builtin-downgrade" ? "内置扩展包不能降级。" : ""), h = J(() => !!o.value && !o.value.missingRequires.length && o.value.blocked !== "lineage-mismatch" && !s.value);
		async function g() {
			o.value = await n.svc().packs.plan(t.rec);
		}
		ga(async () => {
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
					let e = await GD(t.rec, o.value);
					if (!e.ok) return;
					await r.installFile(t.rec, e.resolution), c.value = !0, a.success(`已安装「${t.rec.manifest.name}」`);
				} catch (e) {
					console.error("[trpg-assistant] 安装失败", e), a.error(`安装失败：${gD(e)}`);
				} finally {
					s.value = !1;
				}
			}
		}
		return (t, n) => (V(), H("div", KD, [
			W("p", qD, "✓ 已识别：扩展包 · " + j(l.value), 1),
			W("div", null, [W("div", JD, j(e.rec.manifest.name), 1), W("div", YD, "v" + j(e.rec.manifest.version) + " · " + j(e.rec.manifest.entryCount) + " 条 · " + j(F(mD)(e.rec.byteSize)) + " · " + j(e.rec.manifest.author ? `作者 ${e.rec.manifest.author}` : "导入文件"), 1)]),
			m.value ? (V(), H("p", XD, "⚠ " + j(m.value), 1)) : q("", !0),
			o.value?.missingRequires.length ? (V(), H("section", ZD, [n[2] ||= W("h3", { class: "trpg-group" }, "需要先安装：", -1), W("ul", QD, [(V(!0), H(B, null, R(o.value.missingRequires, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row"
			}, [W("span", $D, j(u(e.id)), 1), d(e.id) ? (V(), H("button", {
				key: 0,
				class: "trpg-btn",
				type: "button",
				disabled: !!F(r).tasks[e.id],
				onClick: (t) => _(e.id)
			}, j(F(r).tasks[e.id] ? "安装中…" : "安装"), 9, eO)) : (V(), H("span", tO, "库和数据仓库都没有"))]))), 128))])])) : q("", !0),
			o.value?.missingRecommends.length ? (V(), H("section", nO, [n[3] ||= W("h3", { class: "trpg-group" }, "推荐一起安装（可以跳过）：", -1), W("ul", rO, [(V(!0), H(B, null, R(o.value.missingRecommends, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row"
			}, [W("span", iO, j(u(e.id)), 1), d(e.id) ? (V(), H("button", {
				key: 0,
				class: "trpg-btn",
				type: "button",
				onClick: (t) => _(e.id)
			}, "安装", 8, aO)) : q("", !0)]))), 128))])])) : q("", !0),
			(V(!0), H(B, null, R(o.value?.conflicts ?? [], (e) => (V(), H("p", {
				key: e.id,
				class: "trpg-field__hint"
			}, "与「" + j(u(e.id)) + "」冲突：" + j(e.reason || "不能在同一个存档中同时启用"), 1))), 128)),
			p.value ? (V(), H("p", oO, "本版本暂不支持：" + j(p.value), 1)) : q("", !0),
			c.value ? (V(), H("p", sO, "已安装「" + j(e.rec.manifest.name) + "」", 1)) : q("", !0),
			W("div", cO, [c.value ? q("", !0) : (V(), H("button", {
				key: 0,
				class: "trpg-btn",
				type: "button",
				onClick: n[0] ||= (e) => F(i).close(!0)
			}, "取消")), c.value ? (V(), H("button", {
				key: 2,
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				"data-autofocus": "",
				onClick: n[1] ||= (e) => F(i).close(!0)
			}, "完成")) : (V(), H("button", {
				key: 1,
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: !h.value,
				onClick: v
			}, j(s.value ? "安装中…" : o.value?.relation === "same" ? "重新安装" : "安装"), 9, lO))])
		]));
	}
});
// src/core/transfer/importer.ts
function dO(e, t) {
	return e.saves.map((e) => t(e.ruleId) ? {
		save: e,
		selectable: !0
	} : {
		save: e,
		selectable: !1,
		reason: "规则未安装"
	});
}
function fO(e) {
	return [...e.attachedPacks].map(([e, t]) => ({
		name: e,
		bytes: t
	}));
}
function pO(e, t) {
	if (!t.has(e)) return e;
	let n = `${e}（导入）`;
	if (!t.has(n)) return n;
	for (let n = 2;; n++) {
		let r = `${e}（导入 ${n}）`;
		if (!t.has(r)) return r;
	}
}
async function mO(e, t, n) {
	let { db: r, campaign: i } = e, a = e.uuid ?? vb, o = t.saves.filter((t) => e.hasRule(t.ruleId)), s = new Set(n.selectedIds), c = 0;
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
			mime: NS(n) ?? "application/octet-stream",
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
					name: pO(t.name, o),
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
			t.settings && await r.setMeta("settings", ub.parse(t.settings));
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
var hO = ["data-disabled"], gO = [
	"disabled",
	"indeterminate",
	"aria-label"
], _O = { class: "trpg-check__text" }, vO = /* @__PURE__ */ L({
	__name: "Checkbox",
	props: /*@__PURE__*/ $a({
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
		let t = So(e, "modelValue");
		return (n, r) => (V(), H("label", {
			class: "trpg-check",
			"data-disabled": e.disabled
		}, [Fr(W("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			type: "checkbox",
			disabled: e.disabled,
			indeterminate: e.indeterminate,
			"aria-label": e.label
		}, null, 8, gO), [[hu, t.value]]), W("span", _O, [z(n.$slots, "default")])], 8, hO));
	}
}), yO = {
	class: "page-stack",
	"data-testid": "import-save"
}, bO = { class: "trpg-import__ok" }, xO = {
	key: 0,
	class: "trpg-field"
}, SO = { class: "trpg-field__hint" }, CO = { class: "trpg-list" }, wO = { class: "trpg-row__title" }, TO = { class: "trpg-row__meta" }, EO = {
	key: 1,
	class: "trpg-field__hint"
}, DO = { class: "trpg-field__hint" }, OO = { class: "trpg-confirm__actions" }, kO = ["disabled"], AO = /* @__PURE__ */ L({
	__name: "SavePreview",
	props: { rec: {} },
	setup(e) {
		let t = e, n = IT(), r = RT(), i = nE(), a = nD(), o = _D(), s = iE(), c = J(() => dO(t.rec, (e) => n.svc().rules.has(e))), l = /* @__PURE__ */ P(c.value.filter((e) => e.selectable).map((e) => e.save.id)), u = /* @__PURE__ */ P("merge"), d = /* @__PURE__ */ P(!1), f = J(() => t.rec.type === "backup"), p = (e) => n.svc().rules.get(e)?.nameShort ?? e, m = J(() => f.value && u.value === "overwrite" ? c.value.filter((e) => e.selectable).length : l.value.length), h = J(() => fO(t.rec)), g = J(() => f.value ? `完整备份 · ${t.rec.saves.length} 个存档` : `存档文件 · ${t.rec.saves.length} 个存档`);
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
				let o = await GD(r, a);
				o.ok && (await i.installFile(r, o.resolution), e++);
			}
			return e;
		}
		async function y() {
			let e = r.owner;
			if (!e) s.error("请先在酒馆中打开一个聊天");
			else if (!f.value || u.value !== "overwrite" || await DD({
				title: "覆盖并恢复",
				message: "先写入自动存档，再用备份替换全部存档、当前数据与设置。",
				confirmLabel: "覆盖并恢复",
				danger: !0
			})) {
				d.value = !0;
				try {
					let i = await v(), c = n.svc(), d = await mO({
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
					console.error("[trpg-assistant] 导入存档失败", e), s.error(`导入失败：${gD(e)}`);
				} finally {
					d.value = !1;
				}
			}
		}
		return (e, t) => (V(), H("div", yO, [
			W("p", bO, "✓ 已识别：" + j(g.value), 1),
			f.value ? (V(), H("div", xO, [G(_E, {
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
			}, null, 8, ["modelValue"]), W("span", SO, j(u.value === "merge" ? "只添加尚不存在的存档与当前数据。" : "先写自动存档，再用备份替换全部存档、当前数据与设置。"), 1)])) : q("", !0),
			W("ul", CO, [(V(!0), H(B, null, R(c.value, (e) => (V(), H("li", {
				key: e.save.id,
				class: "trpg-row"
			}, [G(vO, {
				"model-value": l.value.includes(e.save.id),
				disabled: !e.selectable || f.value && u.value === "overwrite",
				"onUpdate:modelValue": (t) => _(e.save.id, t)
			}, {
				default: I(() => [W("span", wO, j(e.save.name), 1)]),
				_: 2
			}, 1032, [
				"model-value",
				"disabled",
				"onUpdate:modelValue"
			]), W("span", TO, [K(j(p(e.save.ruleId)) + " · " + j(F(fD)(e.save.updatedAt)), 1), e.reason ? (V(), H(B, { key: 0 }, [K(" · " + j(e.reason) + "（不可选）", 1)], 64)) : q("", !0)])]))), 128))]),
			h.value.length ? (V(), H("p", EO, "附带扩展包：" + j(h.value.length) + " 个（将一并安装）", 1)) : q("", !0),
			W("p", DO, "导入为「" + j(F(r).owner?.ownerLabel ?? "当前角色卡") + "」的存档；重名时名称后加\"（导入）\"。", 1),
			W("div", OO, [W("button", {
				class: "trpg-btn",
				type: "button",
				onClick: t[1] ||= (e) => F(a).close(!0)
			}, "取消"), W("button", {
				class: Pe(["trpg-btn", f.value && u.value === "overwrite" ? "trpg-btn--danger" : "trpg-btn--primary"]),
				type: "button",
				disabled: d.value || m.value === 0,
				onClick: y
			}, j(f.value && u.value === "overwrite" ? "覆盖并恢复" : `导入 ${m.value} 个`), 11, kO)])
		]));
	}
}), jO = { class: "page-stack" }, MO = {
	class: "trpg-row__meta",
	"data-testid": "import-filename"
}, NO = {
	key: 0,
	class: "page-stack",
	role: "alert"
}, PO = { class: "trpg-field__error" }, FO = { class: "trpg-confirm__actions" }, IO = {
	key: 1,
	class: "page-intro",
	role: "status"
}, LO = /* @__PURE__ */ L({
	__name: "ImportPage",
	props: { file: {} },
	setup(e) {
		let t = e, n = IT(), r = nD(), i = /* @__PURE__ */ Dn(null), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(null);
		ga(async () => {
			try {
				i.value = n.svc().packs.recognize(new Uint8Array(await t.file.arrayBuffer()));
			} catch (e) {
				e instanceof Q || console.error("[trpg-assistant] 识别文件失败", e), a.value = gD(e);
			}
		});
		function s(e) {
			let t = e.target, n = t.files?.[0];
			t.value = "", n && RO(n);
		}
		return (e, n) => (V(), H("div", jO, [W("p", MO, j(t.file.name), 1), a.value ? (V(), H("div", NO, [W("p", PO, "⚠ " + j(a.value), 1), W("div", FO, [
			W("button", {
				class: "trpg-btn",
				type: "button",
				onClick: n[0] ||= (e) => o.value?.click()
			}, "选择其他文件"),
			W("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				onClick: n[1] ||= (e) => F(r).close(!0)
			}, "关闭"),
			W("input", {
				ref_key: "picker",
				ref: o,
				class: "trpg-sr-only",
				type: "file",
				accept: ".trpgsave,.trpgpack,.zip",
				tabindex: "-1",
				"aria-hidden": "true",
				onChange: s
			}, null, 544)
		])])) : i.value ? i.value.type === "pack" ? (V(), U(uO, {
			key: 2,
			rec: i.value
		}, null, 8, ["rec"])) : (V(), U(AO, {
			key: 3,
			rec: i.value
		}, null, 8, ["rec"])) : (V(), H("p", IO, "正在识别…"))]));
	}
});
// src/ui/imports/openImport.ts
function RO(e) {
	nD().open({
		key: "import",
		title: "导入文件",
		component: Cn(LO),
		props: { file: e },
		variant: "dialog"
	});
}
// src/core/transfer/exporter.ts
function zO(e) {
	let t = new Date(e);
	return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function BO(e) {
	return e.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "") || "存档";
}
async function VO(e, t) {
	if (t.type === "save") {
		let n = await e.saves.get(t.saveId);
		if (!n || n.deletedAt !== void 0) throw new Q("E_NOT_FOUND", "没有找到这个存档");
		return [n];
	}
	return (await e.saves.toArray()).filter((e) => e.deletedAt === void 0);
}
async function HO(e, t) {
	let n = new Set(t.flatMap((e) => e.packs.map((e) => e.id)));
	return (await e.packs.list()).filter((e) => n.has(e.id) && e.source !== "builtin");
}
async function UO(e, t) {
	let n = await VO(e.db, t), r = await HO(e, n);
	return {
		saveBytes: n.reduce((e, t) => e + JSON.stringify(t).length, 0),
		packs: r.map((e) => ({
			id: e.id,
			name: e.name,
			byteSize: e.byteSize
		}))
	};
}
async function WO(e, t, n) {
	let r = await VO(e.db, t), i = {};
	for (let e of r) i[`saves/${e.id}.json`] = JSON.stringify(e);
	let a = [];
	if (t.type === "backup") {
		a = await e.db.workspaces.toArray();
		for (let e of a) i[`workspaces/${encodeURIComponent(e.ownerKey)}.json`] = JSON.stringify(e);
		i["settings.json"] = JSON.stringify(await hb(e.db));
	}
	let o = WS([r, a]);
	for (let t of [...o].sort()) {
		let n = await e.db.blobs.get(t);
		n && (i[`blobs/${t}`] = n.bytes);
	}
	let s = await e.packs.list();
	if (i["packs.json"] = JSON.stringify(s.map((e) => ({
		id: e.id,
		version: e.version,
		name: e.name
	}))), n.includePacks) for (let t of await HO(e, r)) i[`packs/${t.id}@${t.version}.trpgpack`] = await e.packs.exportPack(t.id);
	i["trpg-manifest.json"] = JSON.stringify({
		format: t.type === "backup" ? "trpg-backup" : "trpg-save",
		formatVersion: 2,
		appVersion: e.appVersion,
		exportedAt: new Date(e.now()).toISOString(),
		ruleIds: [...new Set(r.map((e) => e.ruleId))]
	});
	let c = zO(e.now()), l = t.type === "backup" ? `TRPG备份_${c}.trpgsave` : `${BO(r[0].name)}_${c}.trpgsave`;
	return {
		bytes: YS(i),
		filename: l
	};
}
// src/ui/download.ts
function GO(e, t) {
	let n = new Blob([e], { type: "application/octet-stream" }), r = URL.createObjectURL(n), i = document.createElement("a");
	i.href = r, i.download = t, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e4);
}
// src/ui/saves/ExportPage.vue?vue&type=script&setup=true&lang.ts
var KO = { class: "page-stack" }, qO = { class: "trpg-field" }, JO = { class: "trpg-row__meta" }, YO = { class: "trpg-field__hint" }, XO = { class: "trpg-confirm__actions" }, ZO = ["disabled"], QO = /* @__PURE__ */ L({
	__name: "ExportPage",
	props: { saveId: {} },
	setup(e) {
		let t = e, n = IT(), r = RT(), i = nD(), a = iE(), o = /* @__PURE__ */ P(t.saveId ?? r.currentSave?.id ?? ""), s = /* @__PURE__ */ P(t.saveId || r.currentSave ? "save" : "backup"), c = /* @__PURE__ */ P(!1), l = /* @__PURE__ */ P("存档"), u = /* @__PURE__ */ P(null), d = /* @__PURE__ */ P(!1), f = J(() => s.value === "backup" ? { type: "backup" } : {
			type: "save",
			saveId: o.value
		}), p = () => ({
			db: n.svc().db,
			packs: n.svc().packs,
			now: n.svc().now,
			appVersion: eT
		}), m = J(() => (u.value?.packs ?? []).reduce((e, t) => e + t.byteSize, 0)), h = J(() => mD((u.value?.saveBytes ?? 0) + (c.value ? m.value : 0))), g = J(() => new Date(n.svc().now()).toISOString().slice(0, 10)), _ = J(() => s.value === "backup" ? `TRPG备份_${g.value}.trpgsave` : `${l.value.replace(/\s+/g, "_")}_${g.value}.trpgsave`);
		async function v() {
			try {
				s.value === "save" && (l.value = (await n.svc().campaign.getSave(o.value))?.name ?? "存档"), u.value = await UO(p(), f.value);
			} catch (e) {
				console.error("[trpg-assistant] 估算导出大小失败", e), u.value = null;
			}
		}
		ga(v), Gr(s, v);
		async function y() {
			d.value = !0;
			try {
				let { bytes: e, filename: t } = await WO(p(), f.value, { includePacks: c.value });
				GO(e, t), s.value === "backup" && (await gb(n.svc().db, n.svc().now()), await n.refreshBackup()), a.success(`已导出「${t}」`), i.close(!0);
			} catch (e) {
				console.error("[trpg-assistant] 导出失败", e), a.error(`导出失败：${gD(e)}`);
			} finally {
				d.value = !1;
			}
		}
		return (e, t) => (V(), H("div", KO, [
			W("div", qO, [t[3] ||= W("span", { class: "trpg-field__label" }, "范围", -1), G(_E, {
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
			u.value?.packs.length ? (V(), U(vO, {
				key: 0,
				modelValue: c.value,
				"onUpdate:modelValue": t[1] ||= (e) => c.value = e
			}, {
				default: I(() => [t[4] ||= K(" 附带所用扩展包 ", -1), W("span", JO, "+ " + j(u.value.packs.length) + " 个，约 " + j(F(mD)(m.value)) + "（内置包不重复打包）", 1)]),
				_: 1
			}, 8, ["modelValue"])) : q("", !0),
			W("p", YO, "文件名 " + j(_.value) + " · 约 " + j(h.value), 1),
			W("div", XO, [W("button", {
				class: "trpg-btn",
				type: "button",
				onClick: t[2] ||= (e) => F(i).close(!0)
			}, "取消"), W("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: d.value || s.value === "save" && !o.value,
				onClick: y
			}, j(d.value ? "打包中…" : "导出"), 9, ZO)])
		]));
	}
});
// src/ui/saves/fileActions.ts
function $O(e) {
	nD().open({
		key: "export",
		title: "导出",
		component: Cn(QO),
		props: { saveId: e },
		variant: "dialog"
	});
}
async function ek(e) {
	RO(e);
}
// node_modules/ohash/dist/_chunks/is-equal.mjs
function tk(e) {
	return typeof e == "string" ? `'${e}'` : new ak().serialize(e);
}
var nk = " _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789abcdefghijklmnopqrstuvwxyz", rk = /*@__PURE__*/ (function() {
	let e = /* @__PURE__ */ new Uint8Array(128);
	for (let t = 0; t < 69; t++) e[nk.charCodeAt(t)] = t + 1;
	for (let t = 65; t <= 90; t++) e[t] = e[t + 32];
	return e;
})();
function ik(e, t) {
	if (e === t) return 0;
	let n = Math.min(e.length, t.length), r = 0;
	for (let i = 0; i < n; i++) {
		let n = e.charCodeAt(i), a = t.charCodeAt(i);
		if (n === a) continue;
		let o = n < 128 && rk[n] ? rk[n] : n + 128, s = a < 128 && rk[a] ? rk[a] : a + 128;
		if (o !== s) return o < s ? -1 : 1;
		r === 0 && (r = n > a ? -1 : 1);
	}
	return e.length === t.length ? r : e.length < t.length ? -1 : 1;
}
var ak = /*@__PURE__*/ (function() {
	class e {
		#e = /* @__PURE__ */ new Map();
		compare(e, t) {
			let n = typeof e, r = typeof t;
			return n === "string" && r === "string" ? ik(e, t) : n === "number" && r === "number" ? e - t : ik(this.serialize(e, !0), this.serialize(t, !0));
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
			let i = Object.keys(e).sort(ik), a = `${r}{`;
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
function ok(e, t) {
	return e === t || tk(e) === tk(t);
}
// node_modules/reka-ui/dist/shared/clamp.js
function sk(e, t = -Infinity, n = Infinity) {
	return Math.min(n, Math.max(t, e));
}
// node_modules/reka-ui/dist/shared/createContext.js
function ck(e, t) {
	let n = typeof e == "string" && !t ? `${e}Context` : t, r = Symbol(n);
	return [(t) => {
		let n = Rr(r, t);
		if (n || n === null) return n;
		throw Error(`Injection \`${r.toString()}\` not found. Component must be used within ${Array.isArray(e) ? `one of the following components: ${e.join(", ")}` : `\`${e}\``}`);
	}, (e) => (Lr(r, e), e)];
}
// node_modules/reka-ui/dist/shared/getActiveElement.js
function lk() {
	let e = document.activeElement;
	if (e == null) return null;
	for (; e != null && e.shadowRoot != null && e.shadowRoot.activeElement != null;) e = e.shadowRoot.activeElement;
	return e;
}
// node_modules/reka-ui/dist/shared/handleAndDispatchCustomEvent.js
function uk(e, t, n) {
	let r = n.originalEvent.target, i = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && r.addEventListener(e, t, { once: !0 }), r.dispatchEvent(i);
}
// node_modules/reka-ui/dist/shared/nullish.js
function dk(e) {
	return e == null;
}
// node_modules/@vueuse/shared/dist/index.js
function fk(e, t) {
	return Ze() ? (Qe(e, t), !0) : !1;
}
function pk(e) {
	let t = !1, n, r = Xe(!0);
	return ((...i) => (t ||= (n = r.run(() => e(...i)), !0), n));
}
var mk = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
var hk = (e) => e !== void 0, gk = Object.prototype.toString, _k = (e) => gk.call(e) === "[object Object]", vk = /* #__PURE__ */ yk();
function yk() {
	var e, t;
	return mk && !!((e = window) != null && (e = e.navigator) != null && e.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((t = window) == null || (t = t.navigator) == null ? void 0 : t.maxTouchPoints) > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function bk(e) {
	return Array.isArray(e) ? e : [e];
}
function xk(e) {
	return e || $s();
}
function Sk(e) {
	if (!mk) return e;
	let t = 0, n, r, i = () => {
		--t, r && t <= 0 && (r.stop(), n = void 0, r = void 0);
	};
	return ((...a) => (t += 1, r || (r = Xe(!0), n = r.run(() => e(...a))), fk(i), n));
}
function Ck(e) {
	return /* @__PURE__ */ pn(/* @__PURE__ */ En(e) ? new Proxy({}, {
		get(t, n, r) {
			return F(Reflect.get(e.value, n, r));
		},
		set(t, n, r) {
			return /* @__PURE__ */ En(e.value[n]) && !/* @__PURE__ */ En(r) ? e.value[n].value = r : e.value[n] = r, !0;
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
function wk(e) {
	return Ck(J(e));
}
function Tk(e, ...t) {
	let n = t.flat(), r = n[0];
	return wk(() => Object.fromEntries(typeof r == "function" ? Object.entries(/* @__PURE__ */ In(e)).filter(([e, t]) => !r(jn(t), e)) : Object.entries(/* @__PURE__ */ In(e)).filter((e) => !n.includes(e[0]))));
}
function Ek(e, t = 1e4) {
	return Fn((n, r) => {
		let i = jn(e), a, o = () => setTimeout(() => {
			i = jn(e), r();
		}, jn(t));
		return fk(() => {
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
function Dk(e, t) {
	xk(t) && ya(e, t);
}
function Ok(e, t, n) {
	return Gr(e, t, {
		...n,
		immediate: !0
	});
}
// node_modules/@vueuse/core/dist/index.js
var kk = mk ? window : void 0;
mk && window.document, mk && window.navigator, mk && window.location;
function Ak(e) {
	let t = jn(e);
	return t?.$el ?? t;
}
function jk(...e) {
	let t = (e, t, n, r) => (e.addEventListener(t, n, r), () => e.removeEventListener(t, n, r)), n = J(() => {
		let t = bk(jn(e[0])).filter((e) => e != null);
		return t.every((e) => typeof e != "string") ? t : void 0;
	});
	return Ok(() => [
		n.value?.map((e) => Ak(e)) ?? [kk].filter((e) => e != null),
		bk(jn(n.value ? e[1] : e[0])),
		bk(F(n.value ? e[2] : e[1])),
		jn(n.value ? e[3] : e[2])
	], ([e, n, r, i], a, o) => {
		if (!e?.length || !n?.length || !r?.length) return;
		let s = _k(i) ? { ...i } : i, c = e.flatMap((e) => n.flatMap((n) => r.map((r) => t(e, n, r, s))));
		o(() => {
			c.forEach((e) => e());
		});
	}, { flush: "post" });
}
function Mk() {
	let e = /* @__PURE__ */ Dn(!1), t = $s();
	return t && ga(() => {
		e.value = !0;
	}, t), e;
}
/* @__NO_SIDE_EFFECTS__ */
function Nk(e) {
	let t = Mk();
	return J(() => (t.value, !!e()));
}
function Pk(e) {
	return typeof e == "function" ? e : typeof e == "string" ? (t) => t.key === e : Array.isArray(e) ? (t) => e.includes(t.key) : () => !0;
}
function Fk(...e) {
	let t, n, r = {};
	e.length === 3 ? (t = e[0], n = e[1], r = e[2]) : e.length === 2 ? typeof e[1] == "object" ? (t = !0, n = e[0], r = e[1]) : (t = e[0], n = e[1]) : (t = !0, n = e[0]);
	let { target: i = kk, eventName: a = "keydown", passive: o = !1, dedupe: s = !1 } = r, c = Pk(t);
	return jk(i, a, (e) => {
		e.repeat && jn(s) || c(e) && n(e);
	}, o);
}
function Ik(e) {
	return JSON.parse(JSON.stringify(e));
}
function Lk(e, t, n = {}) {
	let { window: r = kk, ...i } = n, a, o = /* @__PURE__ */ Nk(() => r && "ResizeObserver" in r), s = () => {
		a &&= (a.disconnect(), void 0);
	}, c = Gr(J(() => {
		let t = jn(e);
		return Array.isArray(t) ? t.map((e) => Ak(e)) : [Ak(t)];
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
	return fk(l), {
		isSupported: o,
		stop: l
	};
}
function Rk(e, t, n, r = {}) {
	var i, a;
	let { clone: o = !1, passive: s = !1, eventName: c, deep: l = !1, defaultValue: u, shouldEmit: d } = r, f = $s(), p = n || f?.emit || (f == null || (i = f.$emit) == null ? void 0 : i.bind(f)) || (f == null || (a = f.proxy) == null || (a = a.$emit) == null ? void 0 : a.bind(f?.proxy)), m = c;
	t ||= "modelValue", m ||= `update:${t.toString()}`;
	let h = (e) => o ? typeof o == "function" ? o(e) : Ik(e) : e, g = () => hk(e[t]) ? h(e[t]) : u, _ = (e) => {
		d ? d(e) && p(m, e) : p(m, e);
	};
	if (s) {
		let n = /* @__PURE__ */ P(g()), r = !1;
		return Gr(() => e[t], (e) => {
			r || (r = !0, n.value = h(e), hr(() => r = !1));
		}), Gr(n, (n) => {
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
function zk(e) {
	return e ? e.flatMap((e) => e.type === B ? zk(e.children) : [e]) : [];
}
// node_modules/reka-ui/dist/shared/useArrowNavigation.js
var Bk = ["INPUT", "TEXTAREA"];
function Vk(e, t, n, r = {}) {
	if (!t || r.enableIgnoredElement && Bk.includes(t.nodeName)) return null;
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
	return v || _ ? b = Hk(y, t, {
		goForward: _ ? m : c === "ltr" ? d : f,
		loop: s
	}) : h ? b = y.at(0) || null : g && (b = y.at(-1) || null), u && b?.focus(), b;
}
function Hk(e, t, n, r = e.includes(t) ? e.length : e.length + 1) {
	if (--r === 0) return null;
	let i = e.indexOf(t), a;
	if (a = i === -1 ? n.goForward ? 0 : e.length - 1 : n.goForward ? i + 1 : i - 1, !n.loop && (a < 0 || a >= e.length)) return null;
	let o = e[(a + e.length) % e.length];
	return o ? o.hasAttribute("disabled") && o.getAttribute("disabled") !== "false" ? Hk(e, o, n, r) : o : null;
}
// node_modules/reka-ui/dist/ConfigProvider/ConfigProvider.js
var [Uk, Wk] = /*#__PURE__*/ ck("ConfigProvider"), Gk = /* @__PURE__ */ new WeakMap();
function Kk(e, t) {
	let n = Gk.get(e);
	n || (n = {
		owners: /* @__PURE__ */ new Set(),
		original: e.body.style.pointerEvents
	}, Gk.set(e, n)), n.owners.add(t), e.body.style.pointerEvents = "none";
}
function qk(e, t) {
	let n = Gk.get(e);
	n?.owners.delete(t) && n.owners.size === 0 && (Gk.delete(e), e.body.style.pointerEvents = n.original);
}
// node_modules/defu/dist/defu.mjs
function Jk(e) {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null || Symbol.iterator in e ? !1 : Symbol.toStringTag in e ? Object.prototype.toString.call(e) === "[object Module]" : !0;
}
function Yk(e, t, n = ".", r) {
	if (!Jk(t)) return Yk(e, {}, n, r);
	let i = { ...t };
	for (let t of Object.keys(e)) {
		if (t === "__proto__" || t === "constructor") continue;
		let a = e[t];
		a != null && (r && r(i, t, a, n) || (i[t] = Array.isArray(a) && Array.isArray(i[t]) ? [...a, ...i[t]] : Jk(a) && Jk(i[t]) ? Yk(a, i[t], (n ? `${n}.` : "") + t.toString(), r) : a));
	}
	return i;
}
function Xk(e) {
	return (...t) => t.reduce((t, n) => Yk(t, n, "", e), {});
}
var Zk = Xk(), Qk = Symbol("useBodyScrollLock"), $k = Sk(() => {
	let e = /* @__PURE__ */ P(/* @__PURE__ */ new Map()), t = /* @__PURE__ */ P(), n = J(() => {
		for (let t of e.value.values()) if (t) return !0;
		return !1;
	}), r = Uk({ scrollBody: /* @__PURE__ */ P(!0) }), i = null, a = () => {
		document.body.style.paddingRight = "", document.body.style.marginRight = "", qk(document, Qk), document.documentElement.style.removeProperty("--scrollbar-width"), document.body.style.overflow = t.value ?? "", vk && i?.(), t.value = void 0;
	};
	return Gr(n, (e, o) => {
		if (!mk) return;
		if (!e) {
			o && a();
			return;
		}
		t.value === void 0 && (t.value = document.body.style.overflow);
		let s = window.innerWidth - document.documentElement.clientWidth, c = {
			padding: s,
			margin: 0
		}, l = r.scrollBody?.value ? typeof r.scrollBody.value == "object" ? Zk({
			padding: r.scrollBody.value.padding === !0 ? s : r.scrollBody.value.padding,
			margin: r.scrollBody.value.margin === !0 ? s : r.scrollBody.value.margin
		}, c) : c : {
			padding: 0,
			margin: 0
		};
		s > 0 && (document.body.style.paddingRight = typeof l.padding == "number" ? `${l.padding}px` : String(l.padding), document.body.style.marginRight = typeof l.margin == "number" ? `${l.margin}px` : String(l.margin), document.documentElement.style.setProperty("--scrollbar-width", `${s}px`), document.body.style.overflow = "hidden"), vk && (i = jk(document, "touchmove", (e) => nA(e), { passive: !1 })), hr(() => {
			n.value && (Kk(document, Qk), document.body.style.overflow = "hidden");
		});
	}, {
		immediate: !0,
		flush: "sync"
	}), e;
});
function eA(e) {
	let t = Math.random().toString(36).substring(2, 7), n = $k();
	n.value.set(t, e ?? !1);
	let r = J({
		get: () => n.value.get(t) ?? !1,
		set: (e) => n.value.set(t, e)
	});
	return Dk(() => {
		n.value.delete(t);
	}), r;
}
function tA(e) {
	let t = window.getComputedStyle(e);
	if (t.overflowX === "scroll" || t.overflowY === "scroll" || t.overflowX === "auto" && e.clientWidth < e.scrollWidth || t.overflowY === "auto" && e.clientHeight < e.scrollHeight) return !0;
	{
		let t = e.parentNode;
		return !(t instanceof Element) || t.tagName === "BODY" ? !1 : tA(t);
	}
}
function nA(e) {
	let t = e || window.event, n = t.target;
	return n instanceof Element && tA(n) ? !1 : t.touches.length > 1 || (t.preventDefault && t.cancelable && t.preventDefault(), !1);
}
// node_modules/reka-ui/dist/shared/useDirection.js
function rA(e) {
	let t = Uk({ dir: /* @__PURE__ */ P("ltr") });
	return J(() => e?.value || t.dir?.value || "ltr");
}
// node_modules/reka-ui/dist/shared/useEmitAsProps.js
function iA(e) {
	let t = $s(), n = t?.type.emits, r = {};
	return n?.length || console.warn(`No emitted event found. Please check component: ${t?.type.__name}`), n?.forEach((t) => {
		r[xe(_e(t))] = (...n) => e(t, ...n);
	}), r;
}
// node_modules/reka-ui/dist/shared/useFocusGuards.js
var aA = 0;
function oA() {
	Hr((e) => {
		if (!mk) return;
		let t = document.querySelectorAll("[data-reka-focus-guard]");
		document.body.insertAdjacentElement("afterbegin", t[0] ?? sA()), document.body.insertAdjacentElement("beforeend", t[1] ?? sA()), aA++, e(() => {
			aA === 1 && document.querySelectorAll("[data-reka-focus-guard]").forEach((e) => e.remove()), aA--;
		});
	});
}
function sA() {
	let e = document.createElement("span");
	return e.setAttribute("data-reka-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
// node_modules/reka-ui/dist/shared/useFormControl.js
function cA(e) {
	return J(() => !jn(e) || !!Ak(e)?.closest("form"));
}
// node_modules/reka-ui/dist/shared/useForwardExpose.js
function lA() {
	let e = $s(), t = /* @__PURE__ */ P(), n = J(() => r());
	va(() => {
		n.value !== r() && An(t);
	});
	function r() {
		return t.value && "$el" in t.value && ["#text", "#comment"].includes(t.value.$el.nodeName) ? t.value.$el.nextElementSibling : Ak(t);
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
function uA(e) {
	let t = $s(), n = Object.keys(t?.type.props ?? {}).reduce((e, n) => {
		let r = (t?.type.props[n]).default;
		return r !== void 0 && (e[n] = r), e;
	}, {}), r = /* @__PURE__ */ zn(e);
	return J(() => {
		let e = {}, i = t?.vnode.props ?? {};
		return Object.keys(i).forEach((t) => {
			e[_e(t)] = i[t];
		}), Object.keys({
			...n,
			...e
		}).reduce((e, t) => (r.value[t] !== void 0 && (e[t] = r.value[t]), e), {});
	});
}
// node_modules/reka-ui/dist/shared/useForwardPropsEmits.js
function dA(e, t) {
	let n = uA(e), r = t ? iA(t) : {};
	return J(() => ({
		...n.value,
		...r
	}));
}
// node_modules/aria-hidden/dist/es2015/index.js
var fA = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, pA = /* @__PURE__ */ new WeakMap(), mA = /* @__PURE__ */ new WeakMap(), hA = {}, gA = 0, _A = function(e) {
	return e && (e.host || _A(e.parentNode));
}, vA = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = _A(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, yA = function(e, t, n, r) {
	var i = vA(t, Array.isArray(e) ? e : [e]);
	hA[n] || (hA[n] = /* @__PURE__ */ new WeakMap());
	var a = hA[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		e && !s.has(e) && (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		e && !c.has(e) && Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (pA.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				pA.set(e, c), a.set(e, l), o.push(e), c === 1 && i && mA.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), gA++, function() {
		o.forEach(function(e) {
			var t = pA.get(e) - 1, i = a.get(e) - 1;
			pA.set(e, t), a.set(e, i), t || (mA.has(e) || e.removeAttribute(r), mA.delete(e)), i || e.removeAttribute(n);
		}), gA--, gA || (pA = /* @__PURE__ */ new WeakMap(), pA = /* @__PURE__ */ new WeakMap(), mA = /* @__PURE__ */ new WeakMap(), hA = {});
	};
}, bA = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || fA(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), yA(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
// node_modules/reka-ui/dist/shared/useHideOthers.js
function xA(e) {
	let t;
	Gr(() => Ak(e), (e) => {
		let n = !1;
		try {
			n = !!e?.closest("[popover]:not(:popover-open)");
		} catch {}
		e && !n ? t = bA(e) : t && t();
	}), ba(() => {
		t && t();
	});
}
// node_modules/reka-ui/dist/shared/useId.js
var SA = 0;
function CA(e, t = "reka") {
	if (e) return e;
	let n, r = Uk({ useId: void 0 });
	return n = r.useId ? r.useId() : "useId" in Gu ? wi?.() : `${++SA}`, t ? `${t}-${n}` : n;
}
// node_modules/reka-ui/dist/shared/useSize.js
function wA(e) {
	let t = /* @__PURE__ */ P(), n = J(() => t.value?.width ?? 0), r = J(() => t.value?.height ?? 0), i;
	return ga(() => {
		let n = Ak(e);
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
	}), ba(() => {
		i?.disconnect(), i = void 0;
	}), {
		width: n,
		height: r
	};
}
// node_modules/reka-ui/dist/shared/useStateMachine.js
function TA(e, t) {
	let n = /* @__PURE__ */ P(e);
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
function EA(e) {
	let t = Ek("", 1e3);
	return {
		search: t,
		handleTypeaheadSearch: (n, r) => {
			if (t.value += n, e) e(n);
			else {
				let e = lk(), n = r.map((e) => ({
					...e,
					textValue: e.value?.textValue ?? e.ref.textContent?.trim() ?? ""
				})), i = n.find((t) => t.ref === e), a = OA(n.map((e) => e.textValue), t.value, i?.textValue), o = n.find((e) => e.textValue === a);
				return o && o.ref.focus(), o?.ref;
			}
		},
		resetTypeahead: () => {
			t.value = "";
		}
	};
}
function DA(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
function OA(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = DA(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
// node_modules/reka-ui/dist/Presence/usePresence.js
function kA(e, t) {
	let n = /* @__PURE__ */ P({}), r = /* @__PURE__ */ P("none"), i = /* @__PURE__ */ P(e), a = e.value ? "mounted" : "unmounted", o, s = t.value?.ownerDocument.defaultView ?? kk, { state: c, dispatch: l } = TA(a, {
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
		if (mk) {
			let n = new CustomEvent(e, {
				bubbles: !1,
				cancelable: !1
			});
			t.value?.dispatchEvent(n);
		}
	};
	Gr(e, async (e, i) => {
		let a = i !== e;
		if (await hr(), a) {
			let a = r.value, o = AA(t.value);
			e ? (l("MOUNT"), u("enter"), o === "none" && u("after-enter")) : o === "none" || o === "undefined" || n.value?.display === "none" ? (l("UNMOUNT"), u("leave"), u("after-leave")) : i && a !== o ? (l("ANIMATION_OUT"), u("leave")) : (l("UNMOUNT"), u("after-leave"));
		}
	}, { immediate: !0 });
	let d = (e) => {
		if (e.target !== t.value) return;
		let n = AA(t.value), r = n.includes(CSS.escape(e.animationName)), a = c.value === "mounted" ? "enter" : "leave";
		if (r && (u(`after-${a}`), l("ANIMATION_END"), !i.value)) {
			let e = t.value.style.animationFillMode;
			t.value.style.animationFillMode = "forwards", o = s?.setTimeout(() => {
				t.value?.style.animationFillMode === "forwards" && (t.value.style.animationFillMode = e);
			});
		}
		n === "none" && l("ANIMATION_END");
	}, f = (e) => {
		e.target === t.value && (r.value = AA(t.value));
	}, p = Gr(t, (e, t) => {
		e ? (n.value = getComputedStyle(e), e.addEventListener("animationstart", f), e.addEventListener("animationcancel", d), e.addEventListener("animationend", d)) : (l("ANIMATION_END"), o !== void 0 && s?.clearTimeout(o), t?.removeEventListener("animationstart", f), t?.removeEventListener("animationcancel", d), t?.removeEventListener("animationend", d));
	}, { immediate: !0 }), m = Gr(c, () => {
		let e = AA(t.value);
		r.value = c.value === "mounted" ? e : "none";
	});
	return ba(() => {
		p(), m(), t.value && (t.value.removeEventListener("animationstart", f), t.value.removeEventListener("animationcancel", d), t.value.removeEventListener("animationend", d)), o !== void 0 && s?.clearTimeout(o);
	}), { isPresent: J(() => ["mounted", "unmountSuspended"].includes(c.value)) };
}
function AA(e) {
	return e && getComputedStyle(e).animationName || "none";
}
// node_modules/reka-ui/dist/Presence/Presence.js
var jA = /*#__PURE__*/ L({
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
		let { present: r, forceMount: i } = /* @__PURE__ */ In(e), a = /* @__PURE__ */ P(), { isPresent: o } = kA(r, a);
		n({ present: o });
		let s = t.default({ present: o.value });
		s = zk(s || []);
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
			let t = Ak(e);
			return t?.hasAttribute === void 0 || (t?.hasAttribute("data-reka-popper-content-wrapper") ? a.value = t.firstElementChild : a.value = t), t;
		} }) : null;
	}
}), MA = /*#__PURE__*/ L({
	name: "PrimitiveSlot",
	inheritAttrs: !1,
	setup(e, { attrs: t, slots: n }) {
		return () => {
			if (!n.default) return null;
			let e = zk(n.default()), r = e.findIndex((e) => e.type !== Es);
			if (r === -1) return e;
			let i = e[r];
			delete i.props?.ref;
			let a = i.props ? Ks(t, i.props) : t, o = Vs({
				...i,
				props: {}
			}, a);
			return e.length === 1 ? o : (e[r] = o, e);
		};
	}
}), NA = [
	"area",
	"img",
	"input"
], PA = /*#__PURE__*/ L({
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
		return typeof r == "string" && NA.includes(r) ? () => yc(r, t) : r === "template" ? () => yc(MA, t, { default: n.default }) : () => yc(e.as, t, { default: n.default });
	}
});
// node_modules/reka-ui/dist/Primitive/usePrimitiveElement.js
function FA() {
	let e = /* @__PURE__ */ P();
	return {
		primitiveElement: e,
		currentElement: J(() => ["#text", "#comment"].includes(e.value?.$el.nodeName) ? e.value?.$el.nextElementSibling : Ak(e))
	};
}
// node_modules/reka-ui/dist/DismissableLayer/utils.js
var IA = "dismissableLayer.pointerDownOutside", LA = "dismissableLayer.focusOutside";
function RA(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e.ownerDocument?.defaultView;
	return typeof Element < "u" && e instanceof Element || !!t && e instanceof t.Element;
}
function zA(e, t) {
	if (!RA(t)) return !1;
	if (e.contains(t)) return !0;
	let n = t.closest("[data-dismissable-layer]"), r = e.dataset.dismissableLayer === "" ? e : e.querySelector("[data-dismissable-layer]"), i = Array.from(e.ownerDocument.querySelectorAll("[data-dismissable-layer]"));
	return !!(n && (r === n || i.indexOf(r) < i.indexOf(n)));
}
function BA(e, t, n = !0) {
	let r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(() => {});
	return Hr((a) => {
		if (!mk || !jn(n)) return;
		let o = t?.value?.ownerDocument ?? globalThis.document, s = async (n) => {
			let a = n.target;
			if (t?.value && a) {
				if (zA(t.value, a)) o.removeEventListener("click", i.value), r.value = !1;
				else {
					if (n.target && !r.value) {
						let t = { originalEvent: n };
						function r() {
							uk(IA, e, t);
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
		jn(n) && (r.value = !0);
	} };
}
function VA(e, t, n = !0) {
	let r = /* @__PURE__ */ P(!1);
	return Hr((i) => {
		if (!mk || !jn(n)) return;
		let a = t?.value?.ownerDocument ?? globalThis.document, o = async (n) => {
			if (!t?.value) return;
			await hr(), await hr();
			let i = n.target;
			t.value && i && !zA(t.value, i) && n.target && !r.value && uk(LA, e, { originalEvent: n });
		};
		a.addEventListener("focusin", o), i(() => a.removeEventListener("focusin", o));
	}), {
		onFocusCapture: () => {
			jn(n) && (r.value = !0);
		},
		onBlurCapture: () => {
			jn(n) && (r.value = !1);
		}
	};
}
// node_modules/reka-ui/dist/DismissableLayer/context.js
var HA = /*#__PURE__*/ pn({
	layersRoot: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), UA = /* @__PURE__ */ L({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = lA(), o = J(() => a.value?.ownerDocument ?? globalThis.document), s = J(() => HA.layersRoot), c = J(() => a.value ? Array.from(s.value).indexOf(a.value) : -1), l = J(() => HA.layersWithOutsidePointerEventsDisabled.size > 0), u = J(() => {
			let e = Array.from(s.value), [t] = [...HA.layersWithOutsidePointerEventsDisabled].slice(-1), n = e.indexOf(t);
			return c.value >= n;
		}), d = BA(async (e) => {
			let t = [...HA.branches].some((t) => t?.contains(e.target));
			n.present && u.value && !t && (r("pointerDownOutside", e), r("interactOutside", e), await hr(), e.defaultPrevented || r("dismiss"));
		}, a, () => n.present), f = VA((e) => {
			let t = [...HA.branches].some((t) => t?.contains(e.target));
			n.present && !t && (r("focusOutside", e), r("interactOutside", e), e.defaultPrevented || r("dismiss"));
		}, a);
		return Fk("Escape", (e) => {
			n.present && c.value === s.value.size - 1 && (r("escapeKeyDown", e), e.defaultPrevented || r("dismiss"));
		}, { target: () => o.value?.defaultView ?? globalThis.window }), Gr([
			a,
			() => n.disableOutsidePointerEvents,
			() => n.present
		], ([e, t, n], r, i) => {
			if (e && n && t) {
				let t = e.ownerDocument;
				Kk(t, e), HA.layersWithOutsidePointerEventsDisabled.add(e), i(() => {
					HA.layersWithOutsidePointerEventsDisabled.delete(e), qk(t, e);
				});
			}
		}, { immediate: !0 }), Gr([a, () => n.present], ([e, t], n, r) => {
			e && t && (s.value.add(e), r(() => {
				s.value.delete(e);
			}));
		}, { immediate: !0 }), Hr((e) => {
			e(() => {
				a.value && (s.value.delete(a.value), HA.layersWithOutsidePointerEventsDisabled.delete(a.value));
			});
		}), (t, n) => (V(), U(F(PA), {
			ref: F(i),
			"as-child": e.asChild,
			as: e.as,
			"data-dismissable-layer": "",
			style: ke({ pointerEvents: l.value ? u.value ? "auto" : "none" : void 0 }),
			onFocusCapture: F(f).onFocusCapture,
			onBlurCapture: F(f).onBlurCapture,
			onPointerdownCapture: F(d).onPointerDownCapture
		}, {
			default: I(() => [z(t.$slots, "default")]),
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
}), WA = pk(() => /* @__PURE__ */ P([]));
function GA() {
	let e = WA();
	return {
		add(t) {
			let n = e.value[0];
			t !== n && n?.pause(), e.value = KA(e.value, t), e.value.unshift(t);
		},
		remove(t) {
			e.value = KA(e.value, t), e.value[0]?.resume();
		}
	};
}
function KA(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
// node_modules/reka-ui/dist/FocusScope/utils.js
var qA = "focusScope.autoFocusOnMount", JA = "focusScope.autoFocusOnUnmount", YA = {
	bubbles: !1,
	cancelable: !0
};
function XA(e, t) {
	let n = t;
	for (; n;) {
		if (e.contains(n)) return !0;
		n = n.getRootNode().host ?? null;
	}
	return !1;
}
function ZA(e, { select: t = !1 } = {}) {
	let n = lk();
	for (let r of e) if (rj(r, { select: t }), lk() !== n) return !0;
}
function QA(e) {
	let t = $A(e);
	return [ej(t, e), ej(t.reverse(), e)];
}
function $A(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t.sort((e, t) => e.tabIndex === t.tabIndex ? 0 : e.tabIndex === 0 ? 1 : t.tabIndex === 0 ? -1 : e.tabIndex - t.tabIndex);
}
function ej(e, t) {
	for (let n of e) if (!tj(n, { upTo: t })) return n;
}
function tj(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function nj(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function rj(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = lk();
		e.focus({ preventScroll: !0 }), e !== n && nj(e) && t && e.select();
	}
}
// node_modules/reka-ui/dist/FocusScope/FocusScope.js
var ij = /* @__PURE__ */ L({
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
		let n = e, r = t, { currentRef: i, currentElement: a } = lA(), o = /* @__PURE__ */ P(null), s = GA(), c = /*#__PURE__*/ pn({
			paused: !1,
			pause() {
				this.paused = !0;
			},
			resume() {
				this.paused = !1;
			}
		});
		Hr((e) => {
			if (!mk) return;
			let t = a.value;
			if (!n.trapped) return;
			let r = t?.ownerDocument ?? document, i = t ? t.getRootNode() : r;
			function s(e) {
				if (c.paused || !t) return;
				let n = e.target;
				t.contains(n) ? o.value = n : rj(o.value, { select: !0 });
			}
			function l(e) {
				if (c.paused || !t) return;
				let n = e.relatedTarget;
				n !== null && (t.contains(n) || rj(o.value, { select: !0 }));
			}
			function u(e) {
				let n = o.value;
				if (n === null || !e.some((e) => e.removedNodes.length > 0)) return;
				let r = lk();
				r && t.contains(r) || t.contains(n) || rj(t);
			}
			function d(e) {
				if (c.paused || !t) return;
				let n = e.composedPath()[0];
				XA(t, n) || rj(o.value, { select: !0 });
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
			let n = new CustomEvent(qA, YA), i = (e) => r("mountAutoFocus", e);
			e.addEventListener(qA, i), e.dispatchEvent(n), e.removeEventListener(qA, i), n.defaultPrevented || (ZA($A(e), { select: !0 }), lk() === t && rj(e));
		}
		Hr(async (e) => {
			let t = a.value;
			if (await hr(), !t) return;
			n.present !== !1 && s.add(c);
			let i = lk();
			!t.contains(i) && n.present !== !1 && l(t, i), e(() => {
				let e = new CustomEvent(JA, YA), n = (e) => {
					r("unmountAutoFocus", e);
				};
				t.addEventListener(JA, n), t.dispatchEvent(e), t.setAttribute("data-focus-scope-unmounting", ""), setTimeout(() => {
					e.defaultPrevented || rj(i ?? document.body, { select: !0 }), t.removeEventListener(JA, n), s.remove(c), t.removeAttribute("data-focus-scope-unmounting");
				}, 0);
			});
		}), Gr(() => n.present, async (e, t) => {
			if (!mk) return;
			if (e === !1 && t === !0) {
				s.remove(c);
				return;
			}
			if (e !== !0 || t !== !1) return;
			s.add(c), await hr();
			let n = a.value;
			if (!n) return;
			let r = lk();
			n.contains(r) || l(n, r);
		});
		function u(e) {
			if (!n.loop && !n.trapped || c.paused) return;
			let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, r = lk();
			if (t && r) {
				let t = e.currentTarget, [i, a] = QA(t);
				i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n.loop && rj(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n.loop && rj(a, { select: !0 })) : r === t && e.preventDefault();
			}
		}
		return (t, n) => (V(), U(F(PA), {
			ref_key: "currentRef",
			ref: i,
			tabindex: "-1",
			"as-child": e.asChild,
			as: e.as,
			onKeydown: u
		}, {
			default: I(() => [z(t.$slots, "default")]),
			_: 3
		}, 8, ["as-child", "as"]));
	}
}), aj = "menu.itemSelect", oj = ["Enter", " "], sj = [
	"ArrowDown",
	"PageUp",
	"Home"
], cj = [
	"ArrowUp",
	"PageDown",
	"End"
], lj = [...sj, ...cj];
[...oj], [...oj];
function uj(e) {
	return e ? "open" : "closed";
}
function dj(e) {
	let { onEntryFocus: t, onEntryFocusOnce: n, ...r } = e;
	return r;
}
function fj(e) {
	let t = lk();
	for (let n of e) if (n === t || (n.focus(), lk() !== t)) return;
}
function pj(e, t) {
	let { x: n, y: r } = e, i = !1;
	for (let e = 0, a = t.length - 1; e < t.length; a = e++) {
		let o = t[e].x, s = t[e].y, c = t[a].x, l = t[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
function mj(e, t) {
	return t ? pj({
		x: e.clientX,
		y: e.clientY
	}, t) : !1;
}
function hj(e) {
	return e.pointerType === "mouse";
}
// node_modules/reka-ui/dist/Teleport/Teleport.js
var gj = /* @__PURE__ */ L({
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
		let t = e, n = Uk({}), r = J(() => t.to ?? n.teleportTo?.value ?? "body"), i = Mk();
		return (t, n) => F(i) || e.forceMount ? (V(), U(oi, {
			key: 0,
			to: r.value,
			disabled: e.disabled,
			defer: e.defer
		}, [z(t.$slots, "default")], 8, [
			"to",
			"disabled",
			"defer"
		])) : q("v-if", !0);
	}
}), _j = "data-reka-collection-item";
function vj(e = {}) {
	let { key: t = "", isProvider: n = !1 } = e, r = `${t}CollectionProvider`, i;
	n ? (i = {
		collectionRef: /* @__PURE__ */ P(),
		itemMap: /* @__PURE__ */ P(/* @__PURE__ */ new Map())
	}, Lr(r, i)) : i = Rr(r);
	let a = (e, t = !1) => {
		if (!i.collectionRef.value) return;
		let n = i.itemMap.value.get(e);
		return n && (t || n.ref.dataset.disabled !== "") ? n : void 0;
	}, o = (e = !1) => {
		let t = i.collectionRef.value;
		if (!t) return [];
		let n = Array.from(t.querySelectorAll(`[${_j}]`)), r = new Map(n.map((e, t) => [e, t])), a = Array.from(i.itemMap.value.values()).sort((e, t) => (r.get(e.ref) ?? -1) - (r.get(t.ref) ?? -1));
		return e ? a : a.filter((e) => e.ref.dataset.disabled !== "");
	}, s = /*#__PURE__*/ L({
		name: "CollectionSlot",
		inheritAttrs: !1,
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = FA();
			return Gr(a, () => {
				i.collectionRef.value = a.value;
			}), () => yc(MA, {
				ref: r,
				...n
			}, t);
		}
	}), c = /*#__PURE__*/ L({
		name: "CollectionItem",
		inheritAttrs: !1,
		props: { value: { validator: () => !0 } },
		setup(e, { slots: t, attrs: n }) {
			let { primitiveElement: r, currentElement: a } = FA();
			return Hr((t) => {
				if (a.value) {
					let n = Cn(a.value);
					i.itemMap.value.set(n, {
						ref: a.value,
						value: e.value
					}), t(() => i.itemMap.value.delete(n));
				}
			}), () => yc(MA, {
				...n,
				[_j]: "",
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
var yj = /* @__PURE__ */ L({
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
		return (t, n) => (V(), U(F(PA), {
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
			default: I(() => [z(t.$slots, "default")]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"aria-hidden",
			"data-hidden",
			"tabindex"
		]));
	}
}), bj = "rovingFocusGroup.onEntryFocus", xj = {
	bubbles: !1,
	cancelable: !0
};
function Sj(e, t = !1) {
	let n = lk();
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), lk() !== n)) return;
}
// node_modules/reka-ui/dist/Popper/PopperRoot.js
var [Cj, wj] = /*#__PURE__*/ ck("PopperRoot"), Tj = /* @__PURE__ */ L({
	inheritAttrs: !1,
	__name: "PopperRoot",
	setup(e) {
		let t = /* @__PURE__ */ P();
		return wj({
			anchor: t,
			onAnchorChange: (e) => t.value = e
		}), (e, t) => z(e.$slots, "default");
	}
}), Ej = /* @__PURE__ */ L({
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
		let t = e, { forwardRef: n, currentElement: r } = lA(), i = Cj();
		return Ur(() => {
			i.onAnchorChange(t.reference ?? r.value);
		}), (t, r) => (V(), U(F(PA), {
			ref: F(n),
			as: e.as,
			"as-child": e.asChild
		}, {
			default: I(() => [z(t.$slots, "default")]),
			_: 3
		}, 8, ["as", "as-child"]));
	}
});
// node_modules/reka-ui/dist/Popper/utils.js
function Dj(e) {
	return e !== null;
}
function Oj(e) {
	return {
		name: "transformOrigin",
		options: e,
		fn(t) {
			let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = kj(n), u = {
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
function kj(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var Aj = [
	"top",
	"right",
	"bottom",
	"left"
], jj = Math.min, Mj = Math.max, Nj = Math.round, Pj = Math.floor, Fj = (e) => ({
	x: e,
	y: e
}), Ij = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Lj(e, t, n) {
	return Mj(e, jj(t, n));
}
function Rj(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function zj(e) {
	return e.split("-")[0];
}
function Bj(e) {
	return e.split("-")[1];
}
function Vj(e) {
	return e === "x" ? "y" : "x";
}
function Hj(e) {
	return e === "y" ? "height" : "width";
}
function Uj(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Wj(e) {
	return Vj(Uj(e));
}
function Gj(e, t, n) {
	n === void 0 && (n = !1);
	let r = Bj(e), i = Wj(e), a = Hj(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = eM(o)), [o, eM(o)];
}
function Kj(e) {
	let t = eM(e);
	return [
		qj(e),
		t,
		qj(t)
	];
}
function qj(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Jj = ["left", "right"], Yj = ["right", "left"], Xj = ["top", "bottom"], Zj = ["bottom", "top"];
function Qj(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Yj : Jj : t ? Jj : Yj;
		case "left":
		case "right": return t ? Xj : Zj;
		default: return [];
	}
}
function $j(e, t, n, r) {
	let i = Bj(e), a = Qj(zj(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(qj)))), a;
}
function eM(e) {
	let t = zj(e);
	return Ij[t] + e.slice(t.length);
}
function tM(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function nM(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : tM(e);
}
function rM(e) {
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
function iM(e, t, n) {
	let { reference: r, floating: i } = e, a = Uj(t), o = Wj(t), s = Hj(o), c = zj(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = Bj(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function aM(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = Rj(t, e), p = nM(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = rM(await i.getClippingRect({
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
	}, y = rM(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var oM = 50, sM = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: aM
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = iM(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < oM && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = iM(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, cM = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = Rj(e, t) || {};
		if (l == null) return {};
		let d = nM(u), f = {
			x: n,
			y: r
		}, p = Wj(i), m = Hj(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		C && await (o.isElement == null ? void 0 : o.isElement(S)) || (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, ee = jj(d[_], T), E = jj(d[v], T), D = C - h[m] - E, O = C / 2 - h[m] / 2 + w, te = Lj(ee, O, D), ne = !c.arrow && Bj(i) != null && O !== te && a.reference[m] / 2 - (O < ee ? ee : E) - h[m] / 2 < 0, re = ne ? O < ee ? O - ee : O - D : 0;
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
}), lM = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = Rj(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = zj(r), _ = Uj(o), v = zj(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [eM(o)] : Kj(o)), x = p !== "none";
			!d && x && b.push(...$j(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Gj(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === Uj(t) || T.every((e) => Uj(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = Uj(e.placement);
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
function uM(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function dM(e) {
	return Aj.some((t) => e[t] >= 0);
}
var fM = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = Rj(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = uM(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: dM(e)
					} };
				}
				case "escaped": {
					let e = uM(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: dM(e)
					} };
				}
				default: return {};
			}
		}
	};
}, pM = /*#__PURE__*/ new Set(["left", "top"]);
async function mM(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = zj(n), s = Bj(n), c = Uj(n) === "y", l = pM.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = Rj(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var hM = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await mM(t, e);
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
}, gM = function(e) {
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
			} }, ...l } = Rj(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Uj(i), p = Vj(f), m = u[p], h = u[f], g = (e, t) => Lj(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, _M = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = Rj(e, t), u = {
				x: n,
				y: r
			}, d = Uj(i), f = Vj(d), p = u[f], m = u[d], h = Rj(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = pM.has(zj(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, vM = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = Rj(e, t), c = await i.detectOverflow(t, s), l = zj(n), u = Bj(n), d = Uj(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = jj(p - c[m], g), y = jj(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * Mj(c.left, c.right) : S = p - 2 * Mj(c.top, c.bottom)), await o({
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
function yM() {
	return typeof window < "u";
}
function bM(e) {
	return CM(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function xM(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function SM(e) {
	return ((CM(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function CM(e) {
	return yM() ? e instanceof Node || e instanceof xM(e).Node : !1;
}
function wM(e) {
	return yM() ? e instanceof Element || e instanceof xM(e).Element : !1;
}
function TM(e) {
	return yM() ? e instanceof HTMLElement || e instanceof xM(e).HTMLElement : !1;
}
function EM(e) {
	return !yM() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof xM(e).ShadowRoot;
}
function DM(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = RM(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function OM(e) {
	return /^(table|td|th)$/.test(bM(e));
}
function kM(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var AM = /transform|translate|scale|rotate|perspective|filter/, jM = /paint|layout|strict|content/, MM = (e) => !!e && e !== "none", NM;
function PM(e) {
	let t = wM(e) ? RM(e) : e;
	return MM(t.transform) || MM(t.translate) || MM(t.scale) || MM(t.rotate) || MM(t.perspective) || !IM() && (MM(t.backdropFilter) || MM(t.filter)) || AM.test(t.willChange || "") || jM.test(t.contain || "");
}
function FM(e) {
	let t = BM(e);
	for (; TM(t) && !LM(t);) {
		if (PM(t)) return t;
		if (kM(t)) return null;
		t = BM(t);
	}
	return null;
}
function IM() {
	return NM ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), NM;
}
function LM(e) {
	return /^(html|body|#document)$/.test(bM(e));
}
function RM(e) {
	return xM(e).getComputedStyle(e);
}
function zM(e) {
	return wM(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function BM(e) {
	if (bM(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || EM(e) && e.host || SM(e);
	return EM(t) ? t.host : t;
}
function VM(e) {
	let t = BM(e);
	return LM(t) ? (e.ownerDocument || e).body : TM(t) && DM(t) ? t : VM(t);
}
function HM(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = VM(e), i = r === e.ownerDocument?.body, a = xM(r);
	if (i) {
		let e = UM(a);
		return t.concat(a, a.visualViewport || [], DM(r) ? r : [], e && n ? HM(e) : []);
	}
	return t.concat(r, HM(r, [], n));
}
function UM(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function WM(e) {
	let t = RM(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = TM(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = Nj(n) !== a || Nj(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function GM(e) {
	return wM(e) ? e : e.contextElement;
}
function KM(e) {
	let t = GM(e);
	if (!TM(t)) return Fj(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = WM(t), o = (a ? Nj(n.width) : n.width) / r, s = (a ? Nj(n.height) : n.height) / i;
	return o && Number.isFinite(o) || (o = 1), s && Number.isFinite(s) || (s = 1), {
		x: o,
		y: s
	};
}
var qM = /*#__PURE__*/ Fj(0);
function JM(e) {
	let t = xM(e);
	return !IM() || !t.visualViewport ? qM : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function YM(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === xM(e);
}
function XM(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = GM(e), o = Fj(1);
	t && (r ? wM(r) && (o = KM(r)) : o = KM(e));
	let s = YM(a, n, r) ? JM(a) : Fj(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = xM(a), t = wM(r) ? xM(r) : r, n = e, i = UM(n);
		for (; i && t !== n;) {
			let e = KM(i), t = i.getBoundingClientRect(), r = RM(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = xM(i), i = UM(n);
		}
	}
	return rM({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function ZM(e, t) {
	let n = zM(e).scrollLeft;
	return t ? t.left + n : XM(SM(e)).left + n;
}
function QM(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - ZM(e, n),
		y: n.top + t.scrollTop
	};
}
function $M(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = SM(r), s = t ? kM(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = Fj(1), u = Fj(0), d = TM(r);
	if ((d || !a) && ((bM(r) !== "body" || DM(o)) && (c = zM(r)), d)) {
		let e = XM(r);
		l = KM(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? QM(o, c) : Fj(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function eN(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function tN(e) {
	let t = zM(e), n = e.ownerDocument.body, r = Mj(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = Mj(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + ZM(e), o = -t.scrollTop;
	return RM(n).direction === "rtl" && (a += Mj(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var nN = 25;
function rN(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = xM(e), a = SM(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !IM() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (ZM(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= nN && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function iN(e, t) {
	let n = XM(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = KM(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function aN(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = rN(e, n, t);
	else if (t === "document") r = tN(SM(e));
	else if (wM(t)) r = iN(t, n);
	else {
		let n = JM(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return rM(r);
}
function oN(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = HM(e, [], !1).filter((e) => wM(e) && bM(e) !== "body"), i = null, a = RM(e).position === "fixed", o = a ? BM(e) : e;
	for (; wM(o) && !LM(o);) {
		let e = RM(o), t = PM(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = BM(o);
	}
	return t.set(e, r), r;
}
function sN(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? kM(t) ? [] : oN(t, this._c) : [].concat(n), r], o = aN(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = aN(t, a[e], i);
		s = Mj(n.top, s), c = jj(n.right, c), l = jj(n.bottom, l), u = Mj(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function cN(e) {
	let { width: t, height: n } = WM(e);
	return {
		width: t,
		height: n
	};
}
function lN(e, t, n) {
	let r = TM(t), i = SM(t), a = n === "fixed", o = XM(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = Fj(0);
	if ((r || !a) && ((bM(t) !== "body" || DM(i)) && (s = zM(t)), r)) {
		let e = XM(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = ZM(i));
	let l = i && !r && !a ? QM(i, s) : Fj(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function uN(e) {
	return RM(e).position === "static";
}
function dN(e, t) {
	if (!TM(e) || RM(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return SM(e) === n && (n = n.ownerDocument.body), n;
}
function fN(e, t) {
	let n = xM(e);
	if (kM(e)) return n;
	if (!TM(e)) {
		let t = BM(e);
		for (; t && !LM(t);) {
			if (wM(t) && !uN(t)) return t;
			t = BM(t);
		}
		return n;
	}
	let r = dN(e, t);
	for (; r && OM(r) && uN(r);) r = dN(r, t);
	return r && LM(r) && uN(r) && !PM(r) ? n : r || FM(e) || n;
}
var pN = async function(e) {
	let t = this.getOffsetParent || fN, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: lN(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function mN(e) {
	return RM(e).direction === "rtl";
}
var hN = {
	convertOffsetParentRelativeRectToViewportRelativeRect: $M,
	getDocumentElement: SM,
	getClippingRect: sN,
	getOffsetParent: fN,
	getElementRects: pN,
	getClientRects: eN,
	getDimensions: cN,
	getScale: KM,
	isElement: wM,
	isRTL: mN
};
function gN(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function _N(e, t, n) {
	let r = null, i, a = SM(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = Pj(d), h = Pj(a.clientWidth - (u + f)), g = Pj(a.clientHeight - (d + p)), _ = Pj(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: Mj(0, jj(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!gN(l, e.getBoundingClientRect())) return s();
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
	let c = xM(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function vN(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = GM(e), u = i || a ? [...l ? HM(l) : [], ...t ? HM(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? _N(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? XM(e) : null;
	c && g();
	function g() {
		let t = XM(e);
		h && !gN(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var yN = hM, bN = gM, xN = lM, SN = vM, CN = fM, wN = cM, TN = _M, EN = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...hN,
		...i.platform,
		_c: r
	};
	return sM(e, t, {
		...i,
		platform: a
	});
};
// node_modules/@floating-ui/vue/dist/floating-ui.vue.mjs
function DN(e) {
	return typeof e == "object" && !!e && "$el" in e;
}
function ON(e) {
	if (DN(e)) {
		let t = e.$el;
		return CM(t) && bM(t) === "#comment" ? null : t;
	}
	return e;
}
function kN(e) {
	return {
		name: "arrow",
		options: e,
		fn(t) {
			let n = ON(jn(e.element));
			return n == null ? {} : wN({
				element: n,
				padding: e.padding
			}).fn(t);
		}
	};
}
function AN(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function jN(e, t) {
	let n = AN(e);
	return Math.round(t * n) / n;
}
function MN(e, t, n) {
	n === void 0 && (n = {});
	let r = n.whileElementsMounted, i = J(() => jn(n.open) ?? !0), a = J(() => jn(n.middleware)), o = J(() => jn(n.placement) ?? "bottom"), s = J(() => jn(n.strategy) ?? "absolute"), c = J(() => jn(n.transform) ?? !0), l = J(() => ON(e.value)), u = J(() => ON(t.value)), d = /* @__PURE__ */ P(0), f = /* @__PURE__ */ P(0), p = /* @__PURE__ */ P(s.value), m = /* @__PURE__ */ P(o.value), h = /* @__PURE__ */ Dn({}), g = /* @__PURE__ */ P(!1), _ = J(() => {
		let e = {
			position: p.value,
			left: "0",
			top: "0"
		};
		if (!u.value) return e;
		let t = jN(u.value, d.value), n = jN(u.value, f.value);
		return c.value ? {
			...e,
			transform: "translate(" + t + "px, " + n + "px)",
			...AN(u.value) >= 1.5 && { willChange: "transform" }
		} : {
			position: p.value,
			left: t + "px",
			top: n + "px"
		};
	}), v;
	function y() {
		if (l.value == null || u.value == null) return;
		let e = i.value;
		EN(l.value, u.value, {
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
	return Gr([
		a,
		o,
		s,
		i
	], y, { flush: "sync" }), Gr([l, u], x, { flush: "sync" }), Gr(i, S, { flush: "sync" }), Ze() && Qe(b), {
		x: /* @__PURE__ */ gn(d),
		y: /* @__PURE__ */ gn(f),
		strategy: /* @__PURE__ */ gn(p),
		placement: /* @__PURE__ */ gn(m),
		middlewareData: /* @__PURE__ */ gn(h),
		isPositioned: /* @__PURE__ */ gn(g),
		floatingStyles: _,
		update: y
	};
}
// node_modules/reka-ui/dist/Popper/PopperContent.js
var NN = ["dir"], PN = {
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
}, [FN, IN] = /*#__PURE__*/ ck("PopperContent"), LN = /* @__PURE__ */ L({
	inheritAttrs: !1,
	__name: "PopperContent",
	props: /* @__PURE__ */ Qa({
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
	}, { ...PN }),
	emits: ["placed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = Cj(), { forwardRef: a, currentElement: o } = lA(), s = rA(J(() => n.dir)), c = /* @__PURE__ */ P(), l = /* @__PURE__ */ P(), { width: u, height: d } = wA(l), f = J(() => n.side + (n.align === "center" ? "" : `-${n.align}`)), p = J(() => typeof n.collisionPadding == "number" ? n.collisionPadding : {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			...n.collisionPadding
		}), m = J(() => Array.isArray(n.collisionBoundary) ? n.collisionBoundary : [n.collisionBoundary]), h = J(() => ({
			padding: p.value,
			boundary: m.value.filter(Dj),
			altBoundary: m.value.length > 0
		})), g = J(() => ({
			mainAxis: n.sideFlip,
			crossAxis: n.alignFlip
		})), _ = J(() => [
			yN({
				mainAxis: n.sideOffset + d.value,
				alignmentAxis: n.alignOffset
			}),
			n.prioritizePosition && n.avoidCollisions && xN({
				...h.value,
				...g.value
			}),
			n.avoidCollisions && bN({
				mainAxis: !0,
				crossAxis: !!n.prioritizePosition,
				limiter: n.sticky === "partial" ? TN() : void 0,
				...h.value
			}),
			!n.prioritizePosition && n.avoidCollisions && xN({
				...h.value,
				...g.value
			}),
			SN({
				...h.value,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--reka-popper-available-width", `${n}px`), o.setProperty("--reka-popper-available-height", `${r}px`), o.setProperty("--reka-popper-anchor-width", `${i}px`), o.setProperty("--reka-popper-anchor-height", `${a}px`);
				}
			}),
			l.value && kN({
				element: l.value,
				padding: n.arrowPadding
			}),
			Oj({
				arrowWidth: u.value,
				arrowHeight: d.value,
				dir: s.value
			}),
			n.hideWhenDetached && CN({
				strategy: "referenceHidden",
				...h.value
			})
		]), { floatingStyles: v, placement: y, isPositioned: b, middlewareData: x, update: S } = MN(J(() => n.reference ?? i.anchor.value), c, {
			strategy: n.positionStrategy,
			placement: f,
			whileElementsMounted: (...e) => vN(...e, {
				layoutShift: !n.disableUpdateOnLayoutShift,
				animationFrame: n.updatePositionStrategy === "always"
			}),
			middleware: _
		}), C = J(() => kj(y.value)[0]), w = J(() => kj(y.value)[1]);
		Ur(() => {
			b.value && r("placed");
		});
		let T = J(() => {
			let e = x.value.arrow?.centerOffset !== 0;
			return n.hideShiftedArrow && e;
		}), ee = /* @__PURE__ */ P("");
		return Hr(() => {
			o.value && (ee.value = window.getComputedStyle(o.value).zIndex);
		}), IN({
			placedSide: C,
			onArrowChange: (e) => l.value = e,
			arrowX: J(() => x.value.arrow?.x ?? 0),
			arrowY: J(() => x.value.arrow?.y ?? 0),
			shouldHideArrow: T
		}), (e, t) => (V(), H("div", {
			ref_key: "floatingRef",
			ref: c,
			"data-reka-popper-content-wrapper": "",
			dir: F(s),
			style: ke({
				...F(v),
				transform: F(b) ? F(v).transform : "translate(0, -200%)",
				minWidth: "max-content",
				zIndex: ee.value,
				"--reka-popper-transform-origin": [F(x).transformOrigin?.x, F(x).transformOrigin?.y].join(" "),
				...F(x).hide?.referenceHidden && {
					visibility: "hidden",
					pointerEvents: "none"
				}
			})
		}, [n.memoDependencies ? xc([
			n.asChild,
			n.as,
			C.value,
			w.value,
			F(b),
			...Object.values(e.$attrs),
			...n.memoDependencies
		], () => (V(), U(F(PA), Ks({
			key: 0,
			ref: F(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			style: { animation: F(b) ? void 0 : "none" }
		}), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"style"
		])), t, 0) : (V(), U(F(PA), Ks({
			key: 1,
			ref: F(a)
		}, e.$attrs, {
			"as-child": n.asChild,
			as: n.as,
			"data-side": C.value,
			"data-align": w.value,
			dir: F(s),
			style: { animation: F(b) ? void 0 : "none" }
		}), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16, [
			"as-child",
			"as",
			"data-side",
			"data-align",
			"dir",
			"style"
		]))], 12, NN));
	}
});
// node_modules/reka-ui/dist/shared/useNonce.js
function RN(e) {
	let t = Uk({ nonce: /* @__PURE__ */ P() });
	return J(() => e?.value || t.nonce?.value);
}
// node_modules/reka-ui/dist/RovingFocus/RovingFocusGroup.js
var [zN, BN] = /*#__PURE__*/ ck("RovingFocusGroup"), VN = /* @__PURE__ */ L({
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
		let r = e, i = n, { loop: a, orientation: o, dir: s } = /* @__PURE__ */ In(r), c = rA(s), l = Rk(r, "currentTabStopId", i, {
			defaultValue: r.defaultCurrentTabStopId,
			passive: r.currentTabStopId === void 0
		}), u = /* @__PURE__ */ P(!1), d = /* @__PURE__ */ P(!1), f = /* @__PURE__ */ P(0), { getItems: p, CollectionSlot: m } = vj({ isProvider: !0 });
		function h(e) {
			let t = !d.value;
			if (e.currentTarget && e.target === e.currentTarget && t && !u.value) {
				let t = new CustomEvent(bj, xj);
				if (e.currentTarget.dispatchEvent(t), i("entryFocus", t), !t.defaultPrevented) {
					let e = p().map((e) => e.ref).filter((e) => e.dataset.disabled !== "");
					Sj([
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
		return t({ getItems: p }), BN({
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
		}), (t, n) => (V(), U(F(m), null, {
			default: I(() => [G(F(PA), {
				tabindex: u.value || f.value === 0 ? -1 : 0,
				"data-orientation": F(o),
				as: e.as,
				"as-child": e.asChild,
				dir: F(c),
				style: { outline: "none" },
				onMousedown: n[0] ||= (e) => d.value = !0,
				onMouseup: g,
				onFocus: h,
				onBlur: n[1] ||= (e) => u.value = !1
			}, {
				default: I(() => [z(t.$slots, "default")]),
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
}), [HN, UN] = /*#__PURE__*/ ck("FieldRoot"), WN = /* @__PURE__ */ L({
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
		return (e, n) => (V(), U(F(Ej), Fe(Bs(t)), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16));
	}
});
// node_modules/reka-ui/dist/shared/useIsUsingKeyboard.js
function GN() {
	let e = /* @__PURE__ */ P(!1);
	return ga(() => {
		jk("keydown", () => {
			e.value = !0;
		}, {
			capture: !0,
			passive: !0
		}), jk(["pointerdown", "pointermove"], () => {
			e.value = !1;
		}, {
			capture: !0,
			passive: !0
		});
	}), e;
}
var KN = Sk(GN), [qN, JN] = /*#__PURE__*/ ck(["MenuRoot", "MenuSub"], "MenuContext"), [YN, XN] = /*#__PURE__*/ ck("MenuRoot"), ZN = /* @__PURE__ */ L({
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
		let n = e, r = t, { modal: i, dir: a } = /* @__PURE__ */ In(n), o = rA(a), s = Rk(n, "open", r), c = /* @__PURE__ */ P(), l = KN();
		return JN({
			open: s,
			onOpenChange: (e) => {
				s.value = e;
			},
			content: c,
			onContentChange: (e) => {
				c.value = e;
			}
		}), XN({
			onClose: () => {
				s.value = !1;
			},
			isUsingKeyboardRef: l,
			dir: o,
			modal: i
		}), (e, t) => (V(), U(F(Tj), null, {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}));
	}
}), [QN, $N] = /*#__PURE__*/ ck("MenuContent"), eP = /* @__PURE__ */ L({
	__name: "MenuContentImpl",
	props: /* @__PURE__ */ Qa({
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
	}, { ...PN }),
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
		let n = e, r = t, i = qN(), a = YN(), { trapFocus: o, disableOutsidePointerEvents: s, loop: c } = /* @__PURE__ */ In(n);
		oA(), eA(s.value);
		let l = /* @__PURE__ */ P(""), u = /* @__PURE__ */ P(0), d = /* @__PURE__ */ P(0), f = /* @__PURE__ */ P(null), p = /* @__PURE__ */ P("right"), m = /* @__PURE__ */ P(0), h = /* @__PURE__ */ P(null), g = /* @__PURE__ */ P(), { forwardRef: _, currentElement: v } = lA(), { handleTypeaheadSearch: y } = EA(), b = /* @__PURE__ */ P();
		function x(e) {
			let t = Vk(e, b.value || lk(), v.value, {
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
		let C = /* @__PURE__ */ P(), w = /* @__PURE__ */ P();
		Gr(b, (e) => {
			if (w.value && (e === void 0 || e !== w.value.trigger.value)) {
				if (e === void 0) return;
				w.value.onOpenChange(!1), w.value = void 0;
			}
		}), Gr(v, (e) => {
			i.onContentChange(e);
		}), ba(() => {
			window.clearTimeout(u.value);
		});
		function T(e) {
			return p.value === f.value?.side && mj(e, f.value?.area);
		}
		async function ee(e) {
			r("openAutoFocus", e), !e.defaultPrevented && (e.preventDefault(), v.value?.focus({ preventScroll: !0 }));
		}
		function E(e) {
			if (e.defaultPrevented) return;
			let t = e.target, n = t.closest("[data-reka-menu-content]") === e.currentTarget, r = ["input", "textarea"].includes(t.tagName.toLowerCase()), i = e.ctrlKey || e.altKey || e.metaKey, o = e.key.length === 1, s = Vk(e, lk(), v.value, {
				loop: c.value,
				arrowKeyOptions: "vertical",
				dir: a?.dir.value,
				focus: !0,
				attributeName: "[data-reka-collection-item]:not([data-disabled])"
			});
			if (s) return s?.focus();
			if (e.code === "Space") return;
			let l = g.value?.getItems() ?? [];
			if (n && (e.key === "Tab" && a.modal.value && e.preventDefault(), !i && o && !r && y(e.key, l)), e.target !== v.value || !lj.includes(e.key)) return;
			e.preventDefault();
			let u = [...l.map((e) => e.ref)];
			cj.includes(e.key) && u.reverse(), fj(u);
		}
		function D(e) {
			e?.currentTarget?.contains?.(e.target) || (window.clearTimeout(u.value), l.value = "");
		}
		function O(e) {
			if (!hj(e)) return;
			let t = e.target, n = m.value !== e.clientX;
			if ((e?.currentTarget)?.contains(t) && n) {
				let t = e.clientX > m.value ? "right" : "left";
				p.value = t, m.value = e.clientX;
			}
		}
		function te(e) {
			hj(e) && C.value && C.value.focus();
		}
		return $N({
			onItemEnter: (e) => !!T(e),
			onItemLeave: (e) => T(e) ? !0 : (["INPUT", "TEXTAREA"].includes(lk()?.tagName || "") || v.value?.focus(), h.value = null, !1),
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
		}), (t, n) => (V(), U(F(ij), {
			"as-child": "",
			trapped: F(o),
			onMountAutoFocus: ee,
			onUnmountAutoFocus: n[7] ||= (e) => r("closeAutoFocus", e)
		}, {
			default: I(() => [G(F(UA), {
				"as-child": "",
				"disable-outside-pointer-events": F(s),
				onEscapeKeyDown: n[2] ||= (e) => r("escapeKeyDown", e),
				onPointerDownOutside: n[3] ||= (e) => r("pointerDownOutside", e),
				onFocusOutside: n[4] ||= (e) => r("focusOutside", e),
				onInteractOutside: n[5] ||= (e) => r("interactOutside", e),
				onDismiss: n[6] ||= (e) => r("dismiss")
			}, {
				default: I(() => [G(F(VN), {
					ref_key: "rovingFocusGroupRef",
					ref: g,
					"current-tab-stop-id": h.value,
					"onUpdate:currentTabStopId": n[0] ||= (e) => h.value = e,
					"as-child": "",
					orientation: "vertical",
					dir: F(a).dir.value,
					loop: F(c),
					onEntryFocus: n[1] ||= (e) => {
						r("entryFocus", e), F(a).isUsingKeyboardRef.value || e.preventDefault();
					}
				}, {
					default: I(() => [G(F(LN), {
						ref: F(_),
						role: "menu",
						as: e.as,
						"as-child": e.asChild,
						"aria-orientation": "vertical",
						"data-reka-menu-content": "",
						"data-state": F(uj)(F(i).open.value),
						dir: F(a).dir.value,
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
						default: I(() => [z(t.$slots, "default")]),
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
}), tP = /* @__PURE__ */ L({
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
		let t = e, n = QN(), { forwardRef: r, currentElement: i } = lA(), { CollectionItem: a } = vj(), o = /* @__PURE__ */ P(!1), s = J(() => o.value || i.value != null && n.highlightedElement.value === i.value);
		async function c(e) {
			if (!e.defaultPrevented && hj(e)) {
				if (t.disabled) n.onItemLeave(e);
				else if (!n.onItemEnter(e)) {
					let t = e.currentTarget;
					n.highlightedElement.value = t, ["INPUT", "TEXTAREA"].includes(lk()?.tagName || "") || t.focus({ preventScroll: !0 });
				}
			}
		}
		async function l(e) {
			await hr(), !e.defaultPrevented && hj(e) && n.highlightedElement.value === i.value && !n.onItemLeave(e) && n.highlightedElement.value === i.value && (n.highlightedElement.value = void 0);
		}
		return (t, i) => (V(), U(F(a), { value: { textValue: e.textValue } }, {
			default: I(() => [G(F(PA), Ks({
				ref: F(r),
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
					await hr(), !(t.defaultPrevented || e.disabled) && (o.value = !0, F(n).highlightedElement.value = r);
				},
				onBlur: i[1] ||= async (e) => {
					await hr(), !e.defaultPrevented && (o.value = !1);
				}
			}), {
				default: I(() => [z(t.$slots, "default")]),
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
}), nP = /* @__PURE__ */ L({
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
		let n = e, r = t, { forwardRef: i, currentElement: a } = lA(), o = YN(), s = QN(), c = /* @__PURE__ */ P(!1);
		async function l() {
			let e = a.value;
			if (!n.disabled && e) {
				let e = new CustomEvent(aj, {
					bubbles: !0,
					cancelable: !0
				});
				r("select", e), await hr(), e.defaultPrevented ? c.value = !1 : o.onClose();
			}
		}
		return (t, r) => (V(), U(tP, Ks(n, {
			ref: F(i),
			onClick: l,
			onPointerdown: r[0] ||= () => {
				c.value = !0;
			},
			onPointerup: r[1] ||= async (e) => {
				await hr(), e.defaultPrevented || c.value || e.currentTarget?.click();
			},
			onKeydown: r[2] ||= async (t) => {
				let n = F(s).searchRef.value !== "";
				e.disabled || n && t.key === " " || F(oj).includes(t.key) && (t.currentTarget?.click(), t.preventDefault());
			}
		}), {
			default: I(() => [z(t.$slots, "default")]),
			_: 3
		}, 16));
	}
}), rP = /* @__PURE__ */ L({
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
		let n = e, r = t, i = dA(n, r), a = qN(), { forwardRef: o, currentElement: s } = lA();
		return xA(s), (e, t) => (V(), U(eP, Ks(F(i), {
			ref: F(o),
			"trap-focus": F(a).open.value,
			"disable-outside-pointer-events": F(a).open.value,
			"disable-outside-scroll": !0,
			onDismiss: t[0] ||= (e) => F(a).onOpenChange(!1),
			onFocusOutside: t[1] ||= ku((e) => r("focusOutside", e), ["prevent"])
		}), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16, ["trap-focus", "disable-outside-pointer-events"]));
	}
}), iP = /* @__PURE__ */ L({
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
		let n = dA(e, t), r = qN();
		return (e, t) => (V(), U(eP, Ks(F(n), {
			"trap-focus": !1,
			"disable-outside-pointer-events": !1,
			"disable-outside-scroll": !1,
			onDismiss: t[0] ||= (e) => F(r).onOpenChange(!1)
		}), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), aP = /* @__PURE__ */ L({
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
		let n = dA(e, t), r = qN(), i = YN();
		return (t, a) => (V(), U(F(jA), { present: e.forceMount || F(r).open.value }, {
			default: I(() => [F(i).modal.value ? (V(), U(rP, Fe(Ks({ key: 0 }, {
				...t.$attrs,
				...F(n)
			})), {
				default: I(() => [z(t.$slots, "default")]),
				_: 3
			}, 16)) : (V(), U(iP, Fe(Ks({ key: 1 }, {
				...t.$attrs,
				...F(n)
			})), {
				default: I(() => [z(t.$slots, "default")]),
				_: 3
			}, 16))]),
			_: 3
		}, 8, ["present"]));
	}
}), oP = /* @__PURE__ */ L({
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
		return (e, n) => (V(), U(F(gj), Fe(Bs(t)), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), [sP, cP] = /*#__PURE__*/ ck("PopoverRoot"), lP = /* @__PURE__ */ L({
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
		let n = e, r = t, { modal: i } = /* @__PURE__ */ In(n), a = Rk(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		});
		return cP({
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
			triggerElement: /* @__PURE__ */ P(),
			hasCustomAnchor: /* @__PURE__ */ P(!1)
		}), (e, t) => (V(), U(F(Tj), null, {
			default: I(() => [z(e.$slots, "default", {
				open: F(a),
				close: () => a.value = !1
			})]),
			_: 3
		}));
	}
}), uP = /* @__PURE__ */ L({
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
		let n = e, r = t, i = uA(Tk(n, "trapFocus", "disableOutsidePointerEvents")), { forwardRef: a } = lA(), o = sP();
		return oA(), (t, n) => (V(), U(F(ij), {
			"as-child": "",
			loop: "",
			trapped: e.trapFocus,
			onMountAutoFocus: n[5] ||= (e) => r("openAutoFocus", e),
			onUnmountAutoFocus: n[6] ||= (e) => r("closeAutoFocus", e)
		}, {
			default: I(() => [G(F(UA), {
				"as-child": "",
				"disable-outside-pointer-events": e.disableOutsidePointerEvents,
				onPointerDownOutside: n[0] ||= (e) => r("pointerDownOutside", e),
				onInteractOutside: n[1] ||= (e) => r("interactOutside", e),
				onEscapeKeyDown: n[2] ||= (e) => r("escapeKeyDown", e),
				onFocusOutside: n[3] ||= (e) => r("focusOutside", e),
				onDismiss: n[4] ||= (e) => F(o).onOpenChange(!1)
			}, {
				default: I(() => [G(F(LN), Ks(F(i), {
					id: F(o).contentId,
					ref: F(a),
					"data-state": F(o).open.value ? "open" : "closed",
					"aria-labelledby": F(o).triggerId,
					style: {
						"--reka-popover-content-transform-origin": "var(--reka-popper-transform-origin)",
						"--reka-popover-content-available-width": "var(--reka-popper-available-width)",
						"--reka-popover-content-available-height": "var(--reka-popper-available-height)",
						"--reka-popover-trigger-width": "var(--reka-popper-anchor-width)",
						"--reka-popover-trigger-height": "var(--reka-popper-anchor-height)"
					},
					role: "dialog"
				}), {
					default: I(() => [z(t.$slots, "default")]),
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
}), dP = /* @__PURE__ */ L({
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
		let n = e, r = t, i = sP(), a = /* @__PURE__ */ P(!1);
		eA(!0);
		let o = dA(n, r), { forwardRef: s, currentElement: c } = lA();
		return xA(c), (e, t) => (V(), U(uP, Ks(F(o), {
			ref: F(s),
			"trap-focus": F(i).open.value,
			"disable-outside-pointer-events": "",
			onCloseAutoFocus: t[0] ||= ku((e) => {
				r("closeAutoFocus", e), a.value || F(i).triggerElement.value?.focus();
			}, ["prevent"]),
			onPointerDownOutside: t[1] ||= (e) => {
				r("pointerDownOutside", e);
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, i = t.button === 2 || n;
				a.value = i;
			},
			onFocusOutside: t[2] ||= ku(() => {}, ["prevent"])
		}), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16, ["trap-focus"]));
	}
}), fP = /* @__PURE__ */ L({
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
		let n = e, r = t, i = sP(), a = /* @__PURE__ */ P(!1), o = /* @__PURE__ */ P(!1), s = dA(n, r);
		return (e, t) => (V(), U(uP, Ks(F(s), {
			"trap-focus": !1,
			"disable-outside-pointer-events": !1,
			onCloseAutoFocus: t[0] ||= (e) => {
				r("closeAutoFocus", e), e.defaultPrevented || (a.value || F(i).triggerElement.value?.focus(), e.preventDefault()), a.value = !1, o.value = !1;
			},
			onInteractOutside: t[1] ||= async (e) => {
				r("interactOutside", e), e.defaultPrevented || (a.value = !0, e.detail.originalEvent.type === "pointerdown" && (o.value = !0));
				let t = e.target;
				F(i).triggerElement.value?.contains(t) && e.preventDefault(), e.detail.originalEvent.type === "focusin" && o.value && e.preventDefault();
			}
		}), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), pP = /* @__PURE__ */ L({
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
		let n = e, r = t, i = sP(), a = dA(n, r), { forwardRef: o } = lA();
		return i.contentId ||= CA(void 0, "reka-popover-content"), (t, n) => (V(), U(F(jA), { present: e.forceMount || F(i).open.value }, {
			default: I(() => [F(i).modal.value ? (V(), U(dP, Ks({ key: 0 }, F(a), { ref: F(o) }), {
				default: I(() => [z(t.$slots, "default")]),
				_: 3
			}, 16)) : (V(), U(fP, Ks({ key: 1 }, F(a), { ref: F(o) }), {
				default: I(() => [z(t.$slots, "default")]),
				_: 3
			}, 16))]),
			_: 3
		}, 8, ["present"]));
	}
}), mP = /* @__PURE__ */ L({
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
		return (e, n) => (V(), U(F(gj), Fe(Bs(t)), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), hP = /* @__PURE__ */ L({
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
		let t = e, n = sP(), { forwardRef: r, currentElement: i } = lA();
		return n.triggerId ||= CA(void 0, "reka-popover-trigger"), n.contentId ||= CA(void 0, "reka-popover-content"), ga(() => {
			n.triggerElement.value = i.value;
		}), (i, a) => (V(), U(ka(F(n).hasCustomAnchor.value ? F(PA) : F(Ej)), { "as-child": "" }, {
			default: I(() => [G(F(PA), {
				id: F(n).triggerId,
				ref: F(r),
				type: e.as === "button" ? "button" : void 0,
				"aria-haspopup": "dialog",
				"aria-expanded": F(n).open.value,
				"aria-controls": F(n).open.value ? F(n).contentId : void 0,
				"data-state": F(n).open.value ? "open" : "closed",
				as: e.as,
				"as-child": t.asChild,
				onClick: F(n).onOpenToggle
			}, {
				default: I(() => [z(i.$slots, "default")]),
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
}), [gP, _P] = /*#__PURE__*/ ck("DropdownMenuRoot"), vP = /* @__PURE__ */ L({
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
		lA();
		let i = Rk(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), a = /* @__PURE__ */ P(), { modal: o, dir: s } = /* @__PURE__ */ In(n), c = rA(s);
		return _P({
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
		}), (e, t) => (V(), U(F(ZN), {
			open: F(i),
			"onUpdate:open": t[0] ||= (e) => /* @__PURE__ */ En(i) ? i.value = e : null,
			dir: F(c),
			modal: F(o)
		}, {
			default: I(() => [z(e.$slots, "default", { open: F(i) })]),
			_: 3
		}, 8, [
			"open",
			"dir",
			"modal"
		]));
	}
}), yP = /* @__PURE__ */ L({
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
		let n = dA(e, t);
		lA();
		let r = gP(), i = /* @__PURE__ */ P(!1);
		function a(e) {
			e.defaultPrevented || (i.value || setTimeout(() => {
				r.triggerElement.value?.focus();
			}, 0), i.value = !1, e.preventDefault());
		}
		return r.contentId ||= CA(void 0, "reka-dropdown-menu-content"), (e, t) => (V(), U(F(aP), Ks({
			id: F(r).contentId,
			"aria-labelledby": F(r)?.triggerId,
			style: {
				"--reka-dropdown-menu-content-transform-origin": "var(--reka-popper-transform-origin)",
				"--reka-dropdown-menu-content-available-width": "var(--reka-popper-available-width)",
				"--reka-dropdown-menu-content-available-height": "var(--reka-popper-available-height)",
				"--reka-dropdown-menu-trigger-width": "var(--reka-popper-anchor-width)",
				"--reka-dropdown-menu-trigger-height": "var(--reka-popper-anchor-height)"
			}
		}, {
			...F(n),
			...F(dj)(e.$attrs)
		}, {
			onCloseAutoFocus: a,
			onInteractOutside: t[0] ||= (e) => {
				if (e.defaultPrevented) return;
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, a = t.button === 2 || n;
				(!F(r).modal.value || a) && (i.value = !0), F(r).triggerElement.value?.contains(e.target) && e.preventDefault();
			}
		}), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16, ["id", "aria-labelledby"]));
	}
}), bP = /* @__PURE__ */ L({
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
		let n = e, r = iA(t);
		return lA(), (e, t) => (V(), U(F(nP), Fe(Bs({
			...n,
			...F(r)
		})), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), xP = /* @__PURE__ */ L({
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
		return (e, n) => (V(), U(F(oP), Fe(Bs(t)), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), SP = /* @__PURE__ */ L({
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
		let t = e, n = gP(), { forwardRef: r, currentElement: i } = lA();
		return ga(() => {
			n.triggerElement = i;
		}), n.triggerId ||= CA(void 0, "reka-dropdown-menu-trigger"), (i, a) => (V(), U(F(WN), { "as-child": "" }, {
			default: I(() => [G(F(PA), {
				id: F(n).triggerId,
				ref: F(r),
				type: e.as === "button" ? "button" : void 0,
				"as-child": t.asChild,
				as: e.as,
				"aria-haspopup": "menu",
				"aria-expanded": F(n).open.value,
				"aria-controls": F(n).open.value ? F(n).contentId : void 0,
				"data-disabled": e.disabled ? "" : void 0,
				disabled: e.disabled,
				"data-state": F(n).open.value ? "open" : "closed",
				onClick: a[0] ||= async (t) => {
					t.defaultPrevented || !e.disabled && t.button === 0 && t.ctrlKey === !1 && (F(n)?.onOpenToggle(), await hr(), F(n).open.value && t.preventDefault());
				},
				onKeydown: a[1] ||= ju((t) => {
					e.disabled || t.defaultPrevented || (["Enter", " "].includes(t.key) && F(n).onOpenToggle(), t.key === "ArrowDown" && F(n).onOpenChange(!0), [
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
				default: I(() => [z(i.$slots, "default")]),
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
}), CP = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], wP = [" ", "Enter"];
function TP(e, t, n) {
	return e === void 0 ? !1 : Array.isArray(e) ? e.some((e) => EP(e, t, n)) : EP(e, t, n);
}
function EP(e, t, n) {
	return e === void 0 || t === void 0 ? !1 : typeof e == "string" ? e === t : typeof n == "function" ? n(e, t) : typeof n == "string" ? e?.[n] === t?.[n] : ok(e, t);
}
function DP(e) {
	return e == null || e === "" || Array.isArray(e) && e.length === 0;
}
// node_modules/reka-ui/dist/Select/SelectRoot.js
var OP = ["value"], [kP, AP] = /*#__PURE__*/ ck("SelectRoot"), jP = /* @__PURE__ */ L({
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
		let n = e, r = t, { multiple: i, dir: a } = /* @__PURE__ */ In(n), o = HN(null), s = J(() => n.name ?? o?.name.value), c = J(() => o ? n.required || o.required.value : n.required), l = J(() => !!(n.disabled || o?.disabled.value)), u = Rk(n, "modelValue", r, {
			defaultValue: n.defaultValue ?? (i.value ? [] : void 0),
			passive: n.modelValue === void 0,
			deep: !0
		}), d = Rk(n, "open", r, {
			defaultValue: n.defaultOpen,
			passive: n.open === void 0
		}), f = /* @__PURE__ */ P(), p = /* @__PURE__ */ P(), m = /* @__PURE__ */ P({
			x: 0,
			y: 0
		}), h = J(() => i.value && Array.isArray(u.value) ? u.value?.length === 0 : dk(u.value));
		Gr(u, () => {
			o?.reportControlState({ filled: !h.value });
		}), vj({ isProvider: !0 });
		let g = rA(a), _ = cA(f), v = /* @__PURE__ */ P(/* @__PURE__ */ new Set()), y = J(() => Array.from(v.value).map((e) => e.value).join(";"));
		function b(e) {
			let t;
			if (i.value) {
				let r = Array.isArray(u.value) ? [...u.value] : [], i = r.findIndex((t) => EP(t, e, n.by));
				i === -1 ? r.push(e) : r.splice(i, 1), t = [...r];
			} else t = e;
			u.value = t, o?.handleControlInput({ value: t });
		}
		function x(e) {
			return Array.from(v.value).find((t) => TP(e, t.value, n.by));
		}
		return AP({
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
		}), (t, n) => (V(), U(F(Tj), null, {
			default: I(() => [z(t.$slots, "default", {
				modelValue: F(u),
				open: F(d)
			}), F(_) && s.value ? (V(), U(MP, {
				key: y.value,
				"aria-hidden": "true",
				tabindex: "-1",
				multiple: F(i),
				required: c.value,
				name: s.value,
				autocomplete: e.autocomplete,
				disabled: l.value,
				value: F(u)
			}, {
				default: I(() => [F(dk)(F(u)) ? (V(), H("option", {
					key: 0,
					value: e.nullableValue
				}, null, 8, OP)) : q("v-if", !0), (V(!0), H(B, null, R(Array.from(v.value), (e) => (V(), H("option", Ks({ key: e.value ?? "" }, { ref_for: !0 }, e), null, 16))), 128))]),
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
}), MP = /* @__PURE__ */ L({
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
		let t = e, n = /* @__PURE__ */ P(), r = kP();
		Gr(() => t.value, (e, t) => {
			let r = window.HTMLSelectElement.prototype, i = Object.getOwnPropertyDescriptor(r, "value").set;
			if (e !== t && i && n.value) {
				let t = new Event("change", { bubbles: !0 });
				i.call(n.value, e), n.value.dispatchEvent(t);
			}
		});
		function i(e) {
			r.onValueChange(e.target.value);
		}
		return (e, r) => (V(), U(F(yj), { "as-child": "" }, {
			default: I(() => [W("select", Ks({
				ref_key: "selectElement",
				ref: n
			}, t, { onInput: i }), [z(e.$slots, "default")], 16)]),
			_: 3
		}));
	}
}), NP = /* @__PURE__ */ L({
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
		let t = uA(e);
		return (e, n) => (V(), U(F(LN), Ks(F(t), { style: {
			boxSizing: "border-box",
			"--reka-select-content-transform-origin": "var(--reka-popper-transform-origin)",
			"--reka-select-content-available-width": "var(--reka-popper-available-width)",
			"--reka-select-content-available-height": "var(--reka-popper-available-height)",
			"--reka-select-trigger-width": "var(--reka-popper-anchor-width)",
			"--reka-select-trigger-height": "var(--reka-popper-anchor-height)"
		} }), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), PP = {
	onViewportChange: () => {},
	itemTextRefCallback: () => {},
	itemRefCallback: () => {}
}, [FP, IP] = /*#__PURE__*/ ck("SelectContent"), LP = /* @__PURE__ */ L({
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
		let n = e, r = t, i = kP();
		oA(), eA(n.bodyLock);
		let { CollectionSlot: a, getItems: o } = vj(), s = /* @__PURE__ */ P();
		xA(s);
		let { search: c, handleTypeaheadSearch: l } = EA(), u = /* @__PURE__ */ P(), d = /* @__PURE__ */ P(), f = /* @__PURE__ */ P(), p = /* @__PURE__ */ P(!1), m = /* @__PURE__ */ P(!1), h = /* @__PURE__ */ P(!1);
		function g() {
			d.value && s.value && fj([d.value, s.value]);
		}
		Gr(p, () => {
			g();
		});
		let { onOpenChange: _, triggerPointerDownPosRef: v } = i;
		Hr((e) => {
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
					t = n.loop ? DA(t, i + 1) : t.slice(i + 1);
				}
				setTimeout(() => fj(t)), e.preventDefault();
			}
		}
		let b = Tk(n, "loop"), x = uA(J(() => n.position === "popper" ? b : {}).value);
		return IP({
			content: s,
			viewport: u,
			onViewportChange: (e) => {
				u.value = e;
			},
			itemRefCallback: (e, t, n) => {
				let r = !m.value && !n, a = TP(i.modelValue.value, t, i.by);
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
				(TP(i.modelValue.value, t, i.by) || r) && (f.value = e);
			},
			focusSelectedItem: g,
			position: n.position,
			isPositioned: p,
			searchRef: c
		}), (t, n) => (V(), U(F(a), null, {
			default: I(() => [G(F(ij), {
				"as-child": "",
				onMountAutoFocus: n[6] ||= ku(() => {}, ["prevent"]),
				onUnmountAutoFocus: n[7] ||= (e) => {
					r("closeAutoFocus", e), !e.defaultPrevented && (F(i).triggerElement.value?.focus({ preventScroll: !0 }), e.preventDefault());
				}
			}, {
				default: I(() => [G(F(UA), {
					"as-child": "",
					"disable-outside-pointer-events": e.disableOutsidePointerEvents,
					onFocusOutside: n[2] ||= ku(() => {}, ["prevent"]),
					onDismiss: n[3] ||= (e) => F(i).onOpenChange(!1),
					onEscapeKeyDown: n[4] ||= (e) => r("escapeKeyDown", e),
					onPointerDownOutside: n[5] ||= (e) => r("pointerDownOutside", e)
				}, {
					default: I(() => [(V(), U(ka(e.position === "popper" ? NP : BP), Ks({
						...t.$attrs,
						...F(x)
					}, {
						id: F(i).contentId,
						ref: (e) => {
							if (!e) return;
							let t = F(Ak)(e);
							t?.hasAttribute("data-reka-popper-content-wrapper") ? s.value = t.firstElementChild : s.value = t;
						},
						role: "listbox",
						"data-state": F(i).open.value ? "open" : "closed",
						dir: F(i).dir.value,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none"
						},
						onContextmenu: n[0] ||= ku(() => {}, ["prevent"]),
						onPlaced: n[1] ||= (e) => p.value = !0,
						onKeydown: y
					}), {
						default: I(() => [z(t.$slots, "default")]),
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
}), [RP, zP] = /*#__PURE__*/ ck("SelectItemAlignedPosition"), BP = /* @__PURE__ */ L({
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
		let n = e, r = t, { getItems: i } = vj(), a = kP(), o = FP(), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(!0), l = /* @__PURE__ */ P(), { forwardRef: u, currentElement: d } = lA(), { viewport: f, selectedItem: p, selectedItemText: m, focusSelectedItem: h } = o;
		function g() {
			if (a.triggerElement.value && a.valueElement.value && l.value && d.value && f?.value && p?.value && m?.value) {
				let e = a.triggerElement.value.getBoundingClientRect(), t = d.value.getBoundingClientRect(), n = a.valueElement.value.getBoundingClientRect(), o = m.value.getBoundingClientRect();
				if (a.dir.value !== "rtl") {
					let r = o.left - t.left, i = n.left - r, a = e.left - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = sk(i, 10, Math.max(10, u - c));
					l.value.style.minWidth = `${s}px`, l.value.style.left = `${d}px`;
				} else {
					let r = t.right - o.right, i = window.innerWidth - n.right - r, a = window.innerWidth - e.right - i, s = e.width + a, c = Math.max(s, t.width), u = window.innerWidth - 10, d = sk(i, 10, Math.max(10, u - c));
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
		let _ = /* @__PURE__ */ P("");
		ga(async () => {
			await hr(), g(), d.value && (_.value = window.getComputedStyle(d.value).zIndex);
		});
		function v(e) {
			e && c.value === !0 && (g(), h?.(), c.value = !1);
		}
		return Lk(a.triggerElement, () => {
			g();
		}), zP({
			contentWrapper: l,
			shouldExpandOnScrollRef: s,
			onScrollButtonChange: v
		}), (e, t) => (V(), H("div", {
			ref_key: "contentWrapperElement",
			ref: l,
			style: ke({
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: _.value
			})
		}, [G(F(PA), Ks({
			ref: F(u),
			style: {
				boxSizing: "border-box",
				maxHeight: "100%"
			}
		}, {
			...e.$attrs,
			...n
		}), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16)], 4));
	}
}), VP = /* @__PURE__ */ L({
	inheritAttrs: !1,
	__name: "SelectProvider",
	props: { context: {
		type: Object,
		required: !0
	} },
	setup(e) {
		return AP(e.context), IP(PP), (e, t) => z(e.$slots, "default");
	}
}), HP = { key: 1 }, UP = /* @__PURE__ */ L({
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
		let n = e, r = dA(n, t), i = kP(), a = /* @__PURE__ */ P();
		ga(() => {
			a.value = new DocumentFragment();
		});
		let o = /* @__PURE__ */ P(), s = J(() => n.forceMount || i.open.value), c = /* @__PURE__ */ P(s.value), l;
		function u() {
			l &&= (clearTimeout(l), void 0);
		}
		return Gr(s, (e, t, n) => {
			u(), l = setTimeout(() => {
				c.value = s.value, l = void 0;
			}), n(u);
		}), ba(u), (e, t) => s.value || c.value || o.value?.present ? (V(), U(F(jA), {
			key: 0,
			ref_key: "presenceRef",
			ref: o,
			present: s.value
		}, {
			default: I(() => [G(LP, Fe(Bs({
				...F(r),
				...e.$attrs
			})), {
				default: I(() => [z(e.$slots, "default")]),
				_: 3
			}, 16)]),
			_: 3
		}, 8, ["present"])) : a.value ? (V(), H("div", HP, [(V(), U(oi, { to: a.value }, [G(VP, { context: F(i) }, {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 8, ["context"])], 8, ["to"]))])) : q("v-if", !0);
	}
}), [WP, GP] = /*#__PURE__*/ ck("SelectItem"), KP = /* @__PURE__ */ L({
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
		let n = e, r = t, { disabled: i } = /* @__PURE__ */ In(n), a = kP(), o = FP(), { forwardRef: s, currentElement: c } = lA(), { CollectionItem: l } = vj(), u = J(() => TP(a.modelValue?.value, n.value, a.by)), d = /* @__PURE__ */ P(!1), f = /* @__PURE__ */ P(n.textValue ?? ""), p = CA(void 0, "reka-select-item-text");
		async function m(e) {
			e.defaultPrevented || uk("select.select", h, {
				originalEvent: e,
				value: n.value
			});
		}
		async function h(e) {
			await hr(), r("select", e), e.defaultPrevented || i.value || (a.onValueChange(n.value), a.multiple.value || a.onOpenChange(!1));
		}
		async function g(e) {
			await hr(), !e.defaultPrevented && (i.value ? o.onItemLeave?.() : e.currentTarget?.focus({ preventScroll: !0 }));
		}
		async function _(e) {
			await hr(), !e.defaultPrevented && e.currentTarget === lk() && o.onItemLeave?.();
		}
		async function v(e) {
			await hr(), e.defaultPrevented || o.searchRef?.value !== "" && e.key === " " || (wP.includes(e.key) && m(e), e.key === " " && e.preventDefault());
		}
		if (n.value === "") throw Error("A <SelectItem /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
		return ga(() => {
			c.value && o.itemRefCallback(c.value, n.value, n.disabled);
		}), GP({
			value: n.value,
			disabled: i,
			textId: p,
			isSelected: u,
			onItemTextChange: (e) => {
				f.value = ((f.value || e?.textContent) ?? "").trim();
			}
		}), (t, n) => (V(), U(F(l), { value: { textValue: f.value } }, {
			default: I(() => [G(F(PA), {
				ref: F(s),
				role: "option",
				"aria-labelledby": F(p),
				"data-highlighted": d.value ? "" : void 0,
				"aria-selected": u.value,
				"data-state": u.value ? "checked" : "unchecked",
				"aria-disabled": F(i) || void 0,
				"data-disabled": F(i) ? "" : void 0,
				tabindex: F(i) ? void 0 : -1,
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
				default: I(() => [z(t.$slots, "default", { selected: u.value })]),
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
}), qP = /* @__PURE__ */ L({
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
		let t = e, n = kP(), r = FP(), i = WP(), { forwardRef: a, currentElement: o } = lA(), s = J(() => ({
			value: i.value,
			disabled: i.disabled.value,
			textContent: o.value?.textContent ?? i.value?.toString() ?? ""
		}));
		return ga(() => {
			o.value && (i.onItemTextChange(o.value), r.itemTextRefCallback(o.value, i.value, i.disabled.value), n.onOptionAdd(s.value));
		}), ba(() => {
			n.onOptionRemove(s.value);
		}), (e, n) => (V(), U(F(PA), Ks({
			id: F(i).textId,
			ref: F(a)
		}, {
			...t,
			...e.$attrs
		}), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16, ["id"]));
	}
}), JP = /* @__PURE__ */ L({
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
		return (e, n) => (V(), U(F(gj), Fe(Bs(t)), {
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16));
	}
}), YP = /* @__PURE__ */ L({
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
		let t = e, n = kP(), { forwardRef: r, currentElement: i } = lA(), a = J(() => n.disabled?.value || t.disabled);
		n.contentId ||= CA(void 0, "reka-select-content"), ga(() => {
			n.onTriggerChange(i.value);
		});
		let o = HN(null), s = Ya();
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
		ga(() => {
			f = o?.registerControl({
				id: c,
				element: () => i.value,
				getValue: () => n.modelValue.value,
				required: () => !!n.required?.value
			});
		}), ya(() => f?.());
		let { getItems: p } = vj(), { search: m, handleTypeaheadSearch: h, resetTypeahead: g } = EA();
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
			!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && h(e.key, p()), !(t && e.key === " ") && CP.includes(e.key) && (_(), e.preventDefault());
		}
		return (t, i) => (V(), U(F(Ej), {
			"as-child": "",
			reference: e.reference
		}, {
			default: I(() => [G(F(PA), Ks(l(), {
				ref: F(r),
				role: "combobox",
				type: e.as === "button" ? "button" : void 0,
				"aria-controls": F(n).open.value ? F(n).contentId : void 0,
				"aria-expanded": F(n).open.value || !1,
				"aria-required": F(n).required?.value,
				"aria-autocomplete": "none",
				disabled: a.value,
				dir: F(n)?.dir.value,
				"data-state": F(n)?.open.value ? "open" : "closed",
				"data-disabled": a.value ? "" : void 0,
				"data-placeholder": F(DP)(F(n).modelValue?.value) ? "" : void 0,
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
				default: I(() => [z(t.$slots, "default")]),
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
}), XP = /* @__PURE__ */ L({
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
		let t = e, { forwardRef: n, currentElement: r } = lA(), i = kP();
		ga(() => {
			i.valueElement = r;
		});
		let a = J(() => {
			let e = [], t = Array.from(i.optionsSet.value), n = (e) => t.find((t) => TP(e, t.value, i.by));
			return e = Array.isArray(i.modelValue.value) ? i.modelValue.value.map((e) => n(e)?.textContent ?? "") : [n(i.modelValue.value)?.textContent ?? ""], e.filter(Boolean);
		}), o = J(() => a.value.length ? a.value.join(", ") : t.placeholder);
		return (r, s) => (V(), U(F(PA), {
			ref: F(n),
			as: e.as,
			"as-child": e.asChild,
			style: { pointerEvents: "none" },
			"data-placeholder": a.value.length ? void 0 : t.placeholder
		}, {
			default: I(() => [z(r.$slots, "default", {
				selectedLabel: a.value,
				modelValue: F(i).modelValue.value
			}, () => [K(j(o.value), 1)])]),
			_: 3
		}, 8, [
			"as",
			"as-child",
			"data-placeholder"
		]));
	}
}), ZP = /* @__PURE__ */ L({
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
		let t = e, { nonce: n } = /* @__PURE__ */ In(t), r = RN(n), i = FP(), a = i.position === "item-aligned" ? RP() : void 0, { forwardRef: o, currentElement: s } = lA();
		ga(() => {
			i?.onViewportChange(s.value);
		});
		let c = /* @__PURE__ */ P(0);
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
		return (e, n) => (V(), H(B, null, [G(F(PA), Ks({
			ref: F(o),
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
			default: I(() => [z(e.$slots, "default")]),
			_: 3
		}, 16), G(F(PA), {
			as: "style",
			nonce: F(r)
		}, {
			default: I(() => [...n[0] ||= [K(" /* Hide scrollbars cross-browser and enable momentum scroll for touch devices */ [data-reka-select-viewport] { scrollbar-width:none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; } [data-reka-select-viewport]::-webkit-scrollbar { display: none; } ", -1)]]),
			_: 1
		}, 8, ["nonce"])], 64));
	}
}), QP = ["maxlength"], $P = { class: "trpg-confirm__actions" }, eF = ["disabled"], tF = /* @__PURE__ */ L({
	__name: "BranchPopover",
	props: {
		defaultName: {},
		disabled: { type: Boolean }
	},
	emits: ["create"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = Rr("portalTarget", void 0), a = /* @__PURE__ */ P(!1), o = /* @__PURE__ */ P(""), s = /* @__PURE__ */ P(null);
		async function c(e) {
			a.value = e, e && (o.value = n.defaultName, await hr(), s.value?.focus(), s.value?.select());
		}
		function l() {
			let e = o.value.trim();
			e && (a.value = !1, r("create", e));
		}
		return (t, n) => (V(), U(F(lP), {
			open: a.value,
			"onUpdate:open": c
		}, {
			default: I(() => [G(F(hP), {
				class: "trpg-btn",
				disabled: e.disabled
			}, {
				default: I(() => [...n[4] ||= [K("分支存档", -1)]]),
				_: 1
			}, 8, ["disabled"]), G(F(mP), { to: F(i) }, {
				default: I(() => [G(F(pP), {
					class: "trpg-popover",
					align: "start",
					"side-offset": 6,
					"collision-padding": 8,
					onOpenAutoFocus: n[3] ||= ku(() => {}, ["prevent"])
				}, {
					default: I(() => [W("form", {
						class: "trpg-field",
						onSubmit: ku(l, ["prevent"])
					}, [
						n[5] ||= W("label", {
							class: "trpg-field__label",
							for: "trpg-branch-name"
						}, "新存档名", -1),
						Fr(W("input", {
							id: "trpg-branch-name",
							ref_key: "input",
							ref: s,
							"onUpdate:modelValue": n[0] ||= (e) => o.value = e,
							class: "trpg-input",
							maxlength: F(40),
							autocomplete: "off",
							onKeydown: n[1] ||= ju(ku((e) => a.value = !1, ["stop", "prevent"]), ["esc"])
						}, null, 40, QP), [[mu, o.value]]),
						n[6] ||= W("span", { class: "trpg-field__hint" }, "原存档保持上次保存的样子；当前未保存的改动会进入新分支。", -1),
						W("div", $P, [W("button", {
							class: "trpg-btn",
							type: "button",
							onClick: n[2] ||= (e) => a.value = !1
						}, "取消"), W("button", {
							class: "trpg-btn trpg-btn--primary",
							type: "submit",
							disabled: !o.value.trim()
						}, "创建并切换", 8, eF)])
					], 32)]),
					_: 1
				})]),
				_: 1
			}, 8, ["to"])]),
			_: 1
		}, 8, ["open"]));
	}
}), nF = {
	key: 0,
	class: "trpg-menu__reason"
}, rF = /* @__PURE__ */ L({
	__name: "MoreMenu",
	props: {
		label: {},
		items: {}
	},
	emits: ["select"],
	setup(e) {
		let t = Rr("portalTarget", void 0);
		return (n, r) => (V(), U(F(vP), null, {
			default: I(() => [G(F(SP), {
				class: "trpg-icon-btn trpg-more",
				"aria-label": `${e.label} 的更多操作`
			}, {
				default: I(() => [G(mE, {
					name: "dots-three",
					size: 20
				})]),
				_: 1
			}, 8, ["aria-label"]), G(F(xP), { to: F(t) }, {
				default: I(() => [G(F(yP), {
					class: "trpg-menu",
					align: "end",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: I(() => [(V(!0), H(B, null, R(e.items, (e) => (V(), U(F(bP), {
						key: e.key,
						class: Pe(["trpg-menu__item", { "trpg-menu__item--danger": e.danger }]),
						disabled: e.disabled,
						onSelect: (t) => n.$emit("select", e.key)
					}, {
						default: I(() => [W("span", null, j(e.label), 1), e.disabled && e.reason ? (V(), H("span", nF, j(e.reason), 1)) : q("", !0)]),
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
}), iF = {
	key: 0,
	class: "trpg-folds"
}, aF = {
	class: "trpg-folds__tabs",
	role: "group",
	"aria-label": "更多存档"
}, oF = ["aria-expanded"], sF = ["aria-expanded"], cF = ["aria-expanded"], lF = {
	key: 0,
	class: "trpg-list"
}, uF = { class: "trpg-row__main" }, dF = { class: "trpg-row__title" }, fF = {
	key: 0,
	class: "trpg-row__meta"
}, pF = { class: "trpg-row__end" }, mF = ["disabled", "onClick"], hF = { class: "trpg-list" }, gF = { class: "trpg-row__main" }, _F = { class: "trpg-row__title" }, vF = { class: "trpg-row__meta" }, yF = { class: "trpg-row__end" }, bF = ["disabled", "onClick"], xF = ["disabled", "onClick"], SF = ["disabled"], CF = {
	key: 2,
	class: "trpg-list"
}, wF = { class: "trpg-row__main" }, TF = { class: "trpg-row__title" }, EF = { class: "trpg-badge" }, DF = { class: "trpg-row__meta" }, OF = { class: "trpg-row__end" }, kF = [
	"disabled",
	"title",
	"onClick"
], AF = /* @__PURE__ */ L({
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
		let n = t, r = /* @__PURE__ */ P(null), i = (e) => r.value = r.value === e ? null : e;
		return (t, a) => e.autos.length || e.deleted.length || e.others.length ? (V(), H("div", iF, [
			W("div", aF, [
				e.autos.length ? (V(), H("button", {
					key: 0,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "auto",
					onClick: a[0] ||= (e) => i("auto")
				}, j(r.value === "auto" ? "▾" : "▸") + " 自动存档 " + j(e.autos.length), 9, oF)) : q("", !0),
				e.deleted.length ? (V(), H("button", {
					key: 1,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "deleted",
					onClick: a[1] ||= (e) => i("deleted")
				}, j(r.value === "deleted" ? "▾" : "▸") + " 最近删除 " + j(e.deleted.length), 9, sF)) : q("", !0),
				e.others.length ? (V(), H("button", {
					key: 2,
					class: "trpg-btn trpg-btn--quiet trpg-btn--small",
					type: "button",
					"aria-expanded": r.value === "other",
					onClick: a[2] ||= (e) => i("other")
				}, j(r.value === "other" ? "▾" : "▸") + " 其他规则 " + j(e.others.length), 9, cF)) : q("", !0)
			]),
			r.value === "auto" ? (V(), H("ul", lF, [(V(!0), H(B, null, R(e.autos, (t) => (V(), H("li", {
				key: t.id,
				class: "trpg-row"
			}, [W("div", uF, [W("div", dF, j(F(fD)(t.createdAt)) + " · " + j(t.autoReason), 1), F(hD)(t) ? (V(), H("div", fF, j(F(hD)(t)), 1)) : q("", !0)]), W("div", pF, [W("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("load", t)
			}, "读取", 8, mF), G(rF, {
				label: `自动存档 ${F(fD)(t.createdAt)}`,
				items: [{
					key: "manual",
					label: "另存为存档"
				}],
				onSelect: (e) => n("auto-as-manual", t)
			}, null, 8, ["label", "onSelect"])])]))), 128))])) : q("", !0),
			r.value === "deleted" ? (V(), H(B, { key: 1 }, [W("ul", hF, [(V(!0), H(B, null, R(e.deleted, (t) => (V(), H("li", {
				key: t.id,
				class: "trpg-row"
			}, [W("div", gF, [W("div", _F, j(t.name), 1), W("div", vF, "删除于 " + j(F(fD)(t.deletedAt ?? 0)), 1)]), W("div", yF, [W("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("restore", t)
			}, "恢复", 8, bF), W("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly,
				onClick: (e) => n("purge", t)
			}, "彻底删除", 8, xF)])]))), 128))]), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				disabled: e.readOnly,
				onClick: a[3] ||= (e) => n("purge-all")
			}, "清空最近删除", 8, SF)], 64)) : q("", !0),
			r.value === "other" ? (V(), H("ul", CF, [(V(!0), H(B, null, R(e.others, (t) => (V(), H("li", {
				key: t.id,
				class: "trpg-row"
			}, [W("div", wF, [W("div", TF, [K(j(t.name) + " ", 1), W("span", EF, j(e.ruleName(t.ruleId)), 1)]), W("div", DF, j(t.ownerLabel) + " · " + j(F(fD)(t.updatedAt)), 1)]), W("div", OF, [W("button", {
				class: "trpg-btn",
				type: "button",
				disabled: e.readOnly || !e.ruleInstalled(t.ruleId),
				title: e.ruleInstalled(t.ruleId) ? void 0 : "规则未安装",
				onClick: (e) => n("load", t)
			}, j(e.ruleInstalled(t.ruleId) ? "切换规则并读取" : "规则未安装"), 9, kF)])]))), 128))])) : q("", !0)
		])) : q("", !0);
	}
}), jF = ["data-current", "data-testid"], MF = { class: "trpg-save__main" }, NF = { class: "trpg-save__top" }, PF = ["maxlength", "onKeydown"], FF = {
	key: 1,
	class: "trpg-save__name"
}, IF = {
	key: 2,
	class: "trpg-badge",
	"data-tone": "gold"
}, LF = {
	key: 3,
	class: "trpg-badge"
}, RF = { class: "trpg-save__time" }, zF = {
	key: 0,
	class: "trpg-row__meta"
}, BF = {
	key: 1,
	class: "trpg-row__meta trpg-save__note"
}, VF = {
	key: 2,
	class: "trpg-save__noteedit"
}, HF = ["maxlength"], UF = { class: "trpg-save__noteactions" }, WF = { class: "trpg-row__end" }, GF = ["disabled"], KF = /* @__PURE__ */ L({
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
		let n = e, r = t, i = /* @__PURE__ */ P(!1), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(!1), s = /* @__PURE__ */ P(""), c = /* @__PURE__ */ P(null), l = () => [
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
			e === "rename" ? (a.value = n.save.name, i.value = !0, await hr(), c.value?.focus(), c.value?.select()) : e === "note" ? (s.value = n.save.note, o.value = !0) : e === "export" ? r("export") : e === "remove" && r("remove");
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
		return (t, n) => (V(), H("li", {
			class: "trpg-save",
			"data-current": e.current,
			"data-testid": `save-${e.save.name}`
		}, [W("div", MF, [
			W("div", NF, [
				i.value ? Fr((V(), H("input", {
					key: 0,
					ref_key: "nameInput",
					ref: c,
					"onUpdate:modelValue": n[0] ||= (e) => a.value = e,
					class: "trpg-input trpg-save__rename",
					maxlength: F(40),
					"aria-label": "存档名",
					onKeydown: [ju(ku(d, ["prevent"]), ["enter"]), n[1] ||= ju(ku((e) => i.value = !1, ["stop", "prevent"]), ["esc"])],
					onBlur: d
				}, null, 40, PF)), [[mu, a.value]]) : (V(), H("span", FF, j(e.save.name), 1)),
				e.current ? (V(), H("span", IF, "当前")) : q("", !0),
				e.cardBadge ? (V(), H("span", LF, j(e.save.ownerLabel), 1)) : q("", !0),
				W("span", RF, j(F(fD)(e.save.updatedAt)), 1)
			]),
			F(hD)(e.save) ? (V(), H("div", zF, j(F(hD)(e.save)), 1)) : q("", !0),
			e.save.note && !o.value ? (V(), H("div", BF, j(e.save.note.split("\n")[0]), 1)) : q("", !0),
			o.value ? (V(), H("div", VF, [Fr(W("textarea", {
				"onUpdate:modelValue": n[2] ||= (e) => s.value = e,
				class: "trpg-input",
				maxlength: F(200),
				"aria-label": "备注",
				rows: "2",
				onKeydown: n[3] ||= ju(ku((e) => o.value = !1, ["stop", "prevent"]), ["esc"])
			}, null, 40, HF), [[mu, s.value]]), W("div", UF, [W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: n[4] ||= (e) => o.value = !1
			}, "取消"), W("button", {
				class: "trpg-btn trpg-btn--small trpg-btn--primary",
				type: "button",
				onClick: f
			}, "保存")])])) : q("", !0)
		]), W("div", WF, [e.current ? q("", !0) : (V(), H("button", {
			key: 0,
			class: "trpg-btn",
			type: "button",
			disabled: e.readOnly,
			onClick: n[5] ||= (e) => r("load")
		}, "读取", 8, GF)), G(rF, {
			label: e.save.name,
			items: l(),
			onSelect: u
		}, null, 8, ["label", "items"])])], 8, jF));
	}
}), qF = {
	class: "trpg-drawer",
	"data-testid": "save-drawer"
}, JF = {
	key: 0,
	class: "trpg-drawer__current"
}, YF = { class: "trpg-drawer__name" }, XF = { class: "trpg-drawer__title" }, ZF = {
	key: 0,
	class: "trpg-badge",
	"data-tone": "warn"
}, QF = { class: "trpg-drawer__buttons" }, $F = ["disabled"], eI = {
	key: 1,
	class: "trpg-drawer__current"
}, tI = { class: "trpg-drawer__filter" }, nI = {
	key: 1,
	class: "trpg-field__hint"
}, rI = {
	key: 0,
	class: "trpg-saves"
}, iI = {
	key: 1,
	class: "trpg-empty"
}, aI = { class: "trpg-group" }, oI = { class: "trpg-saves" }, sI = { class: "trpg-drawer__bottom" }, cI = ["disabled"], lI = ["disabled"], uI = /* @__PURE__ */ L({
	__name: "SaveDrawerPage",
	setup(e) {
		let t = IT(), n = RT(), r = _D(), i = iE(), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(null);
		ga(() => void r.refresh().catch((e) => console.error("[trpg-assistant] 读取存档列表失败", e)));
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
				console.error(`[trpg-assistant] ${t}`, e), i.error(`${t}：${gD(e)}`);
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
			await DD({
				title: "彻底删除存档",
				message: `「${t}」将被永久删除，无法恢复。`,
				confirmLabel: "彻底删除",
				danger: !0
			}) && await p(() => r.purge([e]), "删除失败");
		}
		async function _() {
			let e = r.deleted.length;
			await DD({
				title: "清空最近删除",
				message: `最近删除中的 ${e} 个存档将被永久删除，无法恢复。`,
				confirmLabel: "彻底删除",
				danger: !0
			}) && await p(() => r.purge(r.deleted.map((e) => e.id)), "清空失败");
		}
		async function v(e) {
			let t = e.target, n = t.files?.[0];
			t.value = "", n && await ek(n);
		}
		return (e, i) => (V(), H("div", qF, [
			F(n).hasCampaign ? (V(), H("section", JF, [
				W("div", YF, [W("span", XF, j(s.value?.name ?? "当前存档"), 1), F(n).dirty ? (V(), H("span", ZF, "● 有未保存改动")) : q("", !0)]),
				W("div", QF, [
					W("button", {
						class: "trpg-btn trpg-btn--primary",
						type: "button",
						disabled: F(n).readOnly || !F(n).dirty,
						onClick: i[0] ||= (e) => F(Sz)()
					}, j(F(n).dirty ? "保存" : "已是最新"), 9, $F),
					G(tF, {
						"default-name": `${s.value?.name ?? "存档"} 分支`,
						disabled: F(n).readOnly,
						onCreate: m
					}, null, 8, ["default-name", "disabled"]),
					s.value ? (V(), H("button", {
						key: 0,
						class: "trpg-btn",
						type: "button",
						onClick: i[1] ||= (e) => F($O)(s.value.id)
					}, "导出…")) : q("", !0)
				]),
				F(t).reminder ? (V(), H("p", {
					key: 0,
					class: Pe(["trpg-field__hint", { "trpg-warn": F(t).reminder.kind === "due" }])
				}, j(F(t).reminder.text), 3)) : q("", !0)
			])) : (V(), H("section", eI, [...i[11] ||= [W("p", { class: "page-intro" }, "还没有当前战役", -1)]])),
			F(n).hasCampaign ? (V(), H(B, { key: 2 }, [
				W("div", tI, [
					G(_E, {
						"model-value": F(r).scope,
						label: "存档范围",
						options: [{
							value: "card",
							label: "本卡"
						}, {
							value: "all",
							label: "全部"
						}],
						"onUpdate:modelValue": i[2] ||= (e) => F(r).setScope(e)
					}, null, 8, ["model-value"]),
					F(r).manual.length > 8 ? Fr((V(), H("input", {
						key: 0,
						"onUpdate:modelValue": i[3] ||= (e) => a.value = e,
						class: "trpg-input",
						type: "search",
						placeholder: "按存档名或备注搜索",
						"aria-label": "搜索存档"
					}, null, 512)), [[mu, a.value]]) : q("", !0),
					F(r).manual.length > 8 ? (V(), H("span", nI, "共 " + j(d.value.length) + " 个", 1)) : q("", !0)
				]),
				d.value.length ? (V(), H("ul", rI, [(V(!0), H(B, null, R(d.value, (e) => (V(), U(KF, {
					key: e.id,
					save: e,
					current: e.id === s.value?.id,
					"card-badge": F(r).scope === "all",
					"read-only": F(n).readOnly,
					onLoad: (t) => F(Cz)(e),
					onRename: (t) => p(() => F(r).rename(e.id, t), "改名失败"),
					onNote: (t) => p(() => F(r).setNote(e.id, t), "保存备注失败"),
					onExport: (t) => F($O)(e.id),
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
				]))), 128))])) : F(r).loading ? q("", !0) : (V(), H("div", iI, [W("p", null, j(a.value ? "没有符合的存档" : "这张卡还没有存档"), 1), a.value ? (V(), H("button", {
					key: 0,
					class: "trpg-btn",
					type: "button",
					onClick: i[4] ||= (e) => a.value = ""
				}, "清除搜索")) : (V(), H("button", {
					key: 1,
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: i[5] ||= (e) => F(xz)()
				}, "＋ 新存档"))])),
				G(AF, {
					autos: F(r).autos,
					deleted: F(r).deleted,
					others: F(r).otherRules,
					"read-only": F(n).readOnly,
					"rule-name": l,
					"rule-installed": u,
					onLoad: F(Cz),
					onAutoAsManual: i[6] ||= (e) => p(() => F(r).autoAsManual(e.id), "另存失败"),
					onRestore: i[7] ||= (e) => p(() => F(r).restore(e.id), "恢复失败"),
					onPurge: i[8] ||= (e) => g(e.id, e.name),
					onPurgeAll: _
				}, null, 8, [
					"autos",
					"deleted",
					"others",
					"read-only",
					"onLoad"
				])
			], 64)) : (V(!0), H(B, { key: 3 }, R(f.value, ([e, t]) => (V(), H("div", {
				key: e,
				class: "trpg-group-block"
			}, [W("h3", aI, j(l(e)) + "（" + j(t.length) + "）", 1), W("ul", oI, [(V(!0), H(B, null, R(t, (e) => (V(), U(KF, {
				key: e.id,
				save: e,
				"card-badge": "",
				onLoad: (t) => F(Cz)(e),
				onRename: (t) => p(() => F(r).rename(e.id, t), "改名失败"),
				onNote: (t) => p(() => F(r).setNote(e.id, t), "保存备注失败"),
				onExport: (t) => F($O)(e.id),
				onRemove: (t) => h(e.id, e.name)
			}, null, 8, [
				"save",
				"onLoad",
				"onRename",
				"onNote",
				"onExport",
				"onRemove"
			]))), 128))])]))), 128)),
			W("footer", sI, [
				F(n).hasCampaign && F(r).manual.length ? (V(), H("button", {
					key: 0,
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					disabled: F(n).readOnly,
					onClick: i[9] ||= (e) => F(xz)()
				}, "＋ 新存档", 8, cI)) : q("", !0),
				W("button", {
					class: "trpg-btn",
					type: "button",
					disabled: F(n).readOnly,
					onClick: i[10] ||= (e) => o.value?.click()
				}, "导入存档文件", 8, lI),
				W("input", {
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
}), dI = { class: "trpg-confirm" }, fI = { class: "trpg-confirm__message" }, pI = { class: "trpg-confirm__actions trpg-confirm__actions--stack" }, mI = /* @__PURE__ */ L({
	__name: "UnsavedLoadPage",
	props: {
		current: {},
		target: {},
		onChoose: { type: Function }
	},
	setup(e) {
		let t = e;
		return (e, n) => (V(), H("div", dI, [
			W("p", fI, "「" + j(t.current) + "」有未保存的改动。读取「" + j(t.target) + "」前：", 1),
			W("div", pI, [
				W("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[0] ||= (e) => t.onChoose("cancel")
				}, "取消"),
				W("button", {
					class: "trpg-btn",
					type: "button",
					onClick: n[1] ||= (e) => t.onChoose("discard")
				}, "不保存，直接读取"),
				W("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					"data-autofocus": "",
					onClick: n[2] ||= (e) => t.onChoose("save")
				}, "保存后读取")
			]),
			n[3] ||= W("p", { class: "trpg-field__hint" }, "无论选哪一项，当前状态都会先写入自动存档。", -1)
		]));
	}
}), hI = { adventureImport: !1 }, gI = {
	rules: "资料与规则",
	adventure: "冒险",
	setting: "设定",
	toolkit: "工具"
}, _I = [
	"rules",
	"adventure",
	"setting",
	"toolkit"
];
function vI(e, t) {
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
function yI(e, t, n) {
	let r = e.filter((e) => e.ruleId === n).map((e) => vI(e, t)), i = new Set(r.map((e) => e.id));
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
function bI(e) {
	let t = e.contributes, n = t.tables ?? 0;
	return [
		["资料", Math.max(0, (t.entries ?? e.entryCount) - n)],
		["修改版", t.variants ?? 0],
		["冒险", t.adventures ?? 0],
		["随机表", n],
		["规则选项", t.ruleOptions ?? 0]
	].filter(([, e]) => e > 0).map(([e, t]) => `${e} ${t.toLocaleString("zh-CN")}`).join(" · ");
}
var xI = {
	builtin: "内置",
	download: "官方",
	import: "导入",
	user: "我的",
	catalog: ""
};
function SI(e, t, n) {
	let r = t.find((t) => t.id === e)?.ruleId ?? n?.packs.find((t) => t.id === e)?.ruleId;
	return r ? yI(t, n, r).find((t) => t.id === e) : void 0;
}
// src/ui/kit/Term.vue?vue&type=script&setup=true&lang.ts
var CI = ["aria-label"], wI = /* @__PURE__ */ L({
	__name: "Term",
	props: { label: {} },
	emits: ["open"],
	setup(e) {
		return (t, n) => (V(), H("button", {
			class: "trpg-term",
			type: "button",
			"aria-label": e.label,
			"aria-haspopup": "dialog",
			onClick: n[0] ||= ku((e) => t.$emit("open"), ["stop"])
		}, [z(t.$slots, "default")], 8, CI));
	}
}), TI = {
	spell: "法术",
	monster: "怪物",
	item: "物品",
	class: "职业",
	subclass: "子职业",
	race: "种族",
	subrace: "亚种族",
	background: "背景",
	feat: "专长",
	feature: "特性",
	rule: "规则",
	table: "随机表",
	disease: "疾病",
	condition: "状态",
	status: "状态",
	skill: "技能",
	language: "语言",
	deity: "神祇",
	vehicle: "载具",
	trap: "陷阱",
	hazard: "危险",
	reward: "奖励",
	cult: "邪教",
	object: "物件"
}, EI = (e) => TI[e] ?? e;
function DI(e) {
	let t = e.src, n = e.credit;
	return [t?.book ? `出自 ${t.book}${t.page ? ` 第 ${t.page} 页` : ""}` : "", n?.by ? `中文：${n.by}${n.license ? `（${n.license}）` : ""}` : ""].filter(Boolean).join(" · ");
}
// src/ui/library/inline.ts
function OI(e) {
	let t = [], n = 0;
	for (let r of e.matchAll(new RegExp(Hy.source, "g"))) {
		r.index > n && t.push({
			kind: "text",
			text: e.slice(n, r.index)
		});
		let i = r[2].replace(/\\\|/g, "|"), a = r[3] ?? i;
		t.push(r[1] === "ref" ? {
			kind: "ref",
			id: i,
			text: a
		} : {
			kind: "mark",
			mark: r[1],
			text: a
		}), n = r.index + r[0].length;
	}
	return n < e.length && t.push({
		kind: "text",
		text: e.slice(n)
	}), t;
}
// src/ui/library/TextBlocks.vue?vue&type=script&setup=true&lang.ts
var kI = { class: "trpg-blocks" }, AI = {
	key: 0,
	class: "trpg-blocks__p"
}, jI = { key: 1 }, MI = {
	key: 2,
	class: "trpg-blocks__mark"
}, NI = {
	key: 1,
	class: "trpg-blocks__h"
}, PI = {
	key: 2,
	class: "trpg-blocks__list"
}, FI = {
	key: 3,
	class: "trpg-blocks__table"
}, II = { key: 0 }, LI = {
	key: 4,
	class: "trpg-blocks__quote"
}, RI = { key: 0 }, zI = {
	key: 5,
	class: "trpg-blocks__read"
}, BI = /* @__PURE__ */ L({
	__name: "TextBlocks",
	props: { blocks: {} },
	emits: ["ref"],
	setup(e, { emit: t }) {
		let n = t;
		return (t, r) => {
			let i = Da("TextBlocks", !0);
			return V(), H("div", kI, [(V(!0), H(B, null, R(e.blocks, (e, t) => (V(), H(B, { key: t }, ["p" in e ? (V(), H("p", AI, [(V(!0), H(B, null, R(F(OI)(e.p), (e, t) => (V(), H(B, { key: t }, [e.kind === "ref" ? (V(), U(wI, {
				key: 0,
				onOpen: (t) => n("ref", e.id)
			}, {
				default: I(() => [K(j(e.text), 1)]),
				_: 2
			}, 1032, ["onOpen"])) : e.kind === "mark" && e.mark === "em" ? (V(), H("strong", jI, j(e.text), 1)) : e.kind === "mark" ? (V(), H("span", MI, j(e.text), 1)) : (V(), H(B, { key: 3 }, [K(j(e.text), 1)], 64))], 64))), 128))])) : "h" in e ? (V(), H("section", NI, [W("h4", null, j(e.h), 1), G(i, {
				blocks: e.body,
				onRef: r[0] ||= (e) => n("ref", e)
			}, null, 8, ["blocks"])])) : "list" in e ? (V(), H("ul", PI, [(V(!0), H(B, null, R(e.list, (e, t) => (V(), H("li", { key: t }, [(V(!0), H(B, null, R(F(OI)(e), (e, t) => (V(), H(B, { key: t }, [e.kind === "ref" ? (V(), U(wI, {
				key: 0,
				onOpen: (t) => n("ref", e.id)
			}, {
				default: I(() => [K(j(e.text), 1)]),
				_: 2
			}, 1032, ["onOpen"])) : (V(), H(B, { key: 1 }, [K(j(e.text), 1)], 64))], 64))), 128))]))), 128))])) : "table" in e ? (V(), H("div", FI, [W("table", null, [
				e.table.caption ? (V(), H("caption", II, j(e.table.caption), 1)) : q("", !0),
				W("thead", null, [W("tr", null, [(V(!0), H(B, null, R(e.table.cols, (e) => (V(), H("th", { key: e }, j(e), 1))), 128))])]),
				W("tbody", null, [(V(!0), H(B, null, R(e.table.rows, (e, t) => (V(), H("tr", { key: t }, [(V(!0), H(B, null, R(e, (e, t) => (V(), H("td", { key: t }, j(F(OI)(e).map((e) => e.text).join("")), 1))), 128))]))), 128))])
			])])) : "quote" in e ? (V(), H("blockquote", LI, [K(j(e.quote), 1), e.by ? (V(), H("footer", RI, "—— " + j(e.by), 1)) : q("", !0)])) : "read" in e ? (V(), H("aside", zI, [G(i, {
				blocks: e.read,
				onRef: r[1] ||= (e) => n("ref", e)
			}, null, 8, ["blocks"])])) : q("", !0)], 64))), 128))]);
		};
	}
}), VI = {
	class: "page-stack",
	"data-testid": "compare"
}, HI = {
	key: 0,
	class: "trpg-empty"
}, UI = {
	key: 1,
	class: "trpg-compare"
}, WI = /* @__PURE__ */ L({
	__name: "ComparePage",
	props: {
		left: {},
		right: {},
		leftLabel: {},
		rightLabel: {}
	},
	setup(e) {
		let t = e, n = (e) => e === void 0 ? "（没有）" : typeof e == "string" ? e : JSON.stringify(e), r = J(() => {
			let e = [.../* @__PURE__ */ new Set([...Object.keys(t.left.data), ...Object.keys(t.right.data)])].filter((e) => gS(t.left.data[e]) !== gS(t.right.data[e])).map((e) => ({
				key: e,
				left: n(t.left.data[e]),
				right: n(t.right.data[e])
			}));
			return t.left.summary !== t.right.summary && e.unshift({
				key: "简介",
				left: t.left.summary || "（没有）",
				right: t.right.summary || "（没有）"
			}), e;
		});
		return (t, n) => (V(), H("div", VI, [r.value.length ? (V(), H("table", UI, [W("thead", null, [W("tr", null, [
			n[0] ||= W("th", null, "字段", -1),
			W("th", null, j(e.leftLabel), 1),
			W("th", null, j(e.rightLabel), 1)
		])]), W("tbody", null, [(V(!0), H(B, null, R(r.value, (e) => (V(), H("tr", { key: e.key }, [
			W("th", null, j(e.key), 1),
			W("td", null, j(e.left), 1),
			W("td", null, j(e.right), 1)
		]))), 128))])])) : (V(), H("p", HI, "两个版本没有差异。"))]));
	}
}), GI = {
	class: "trpg-variantbar",
	"data-testid": "variant-bar"
}, KI = { class: "trpg-variantbar__text" }, qI = {
	key: 3,
	class: "trpg-field__error"
}, JI = { class: "trpg-variantbar__actions" }, YI = { class: "trpg-variantpick" }, XI = { class: "trpg-field__label" }, ZI = { class: "trpg-radio" }, QI = ["checked"], $I = ["checked", "onChange"], eL = { class: "trpg-row__meta" }, tL = /* @__PURE__ */ L({
	__name: "VariantBar",
	props: {
		variants: {},
		original: {},
		readOnly: { type: Boolean },
		originName: {}
	},
	emits: ["switch"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = nD(), a = Rr("portalTarget", void 0), o = J(() => n.variants.candidates.find((e) => e.key === n.variants.active)), s = J(() => Sw(n.original, n.variants)), c = J(() => n.variants.candidates.length - +!!o.value), l = (e) => {
			let t = n.variants.candidates.find((t) => t.key === e);
			if (!t || t.mode === "hide") return 0;
			let r = (t.mode, t.payload?.data ?? {});
			return Object.keys(r).length;
		}, u = (e) => {
			let t = n.variants.candidates.find((t) => t.key === e);
			return t?.mode === "hide" ? "隐藏" : t?.mode === "patch" ? `改了 ${l(e)} 处` : "整条替换";
		};
		function d() {
			let e = s.value.entry;
			n.original && e && i.push({
				key: "compare",
				title: "与原版对比",
				component: Cn(WI),
				props: {
					left: n.original,
					right: e,
					leftLabel: "原版",
					rightLabel: "当前"
				}
			});
		}
		return (t, n) => (V(), H("div", GI, [W("div", KI, [s.value.hidden ? (V(), H(B, { key: 0 }, [K("⊘ 本存档中已隐藏（" + j(o.value?.sourceName) + "：" + j(o.value?.note || "这个条目不会出现在搜索与新建里") + "）", 1)], 64)) : o.value ? (V(), H(B, { key: 1 }, [K("✎ 本存档使用《" + j(o.value.sourceName) + "》的修改版", 1), c.value > 0 ? (V(), H(B, { key: 0 }, [K(" · 另有 " + j(c.value) + " 个版本", 1)], 64)) : q("", !0)], 64)) : (V(), H(B, { key: 2 }, [K("本存档使用原版 · 有 " + j(e.variants.candidates.length) + " 个修改版可选", 1)], 64)), s.value.broken ? (V(), H("span", qI, " ⚠ 修改无法显示：原版缺失")) : q("", !0)]), W("div", JI, [o.value && !s.value.hidden && e.original ? (V(), H("button", {
			key: 0,
			class: "trpg-btn trpg-btn--small",
			type: "button",
			onClick: d
		}, "与原版对比")) : q("", !0), G(F(lP), null, {
			default: I(() => [G(F(hP), {
				class: "trpg-btn trpg-btn--small",
				disabled: e.readOnly
			}, {
				default: I(() => [...n[1] ||= [K("切换版本", -1)]]),
				_: 1
			}, 8, ["disabled"]), G(F(mP), { to: F(a) }, {
				default: I(() => [G(F(pP), {
					class: "trpg-popover",
					align: "end",
					"side-offset": 6,
					"collision-padding": 8
				}, {
					default: I(() => [W("fieldset", YI, [
						W("legend", XI, j(e.originName) + "使用哪个版本", 1),
						W("label", ZI, [W("input", {
							type: "radio",
							name: "variant",
							checked: e.variants.active === F(XC),
							onChange: n[0] ||= (e) => r("switch", F("original"))
						}, null, 40, QI), n[2] ||= K(" 原版", -1)]),
						(V(!0), H(B, null, R(e.variants.candidates, (t) => (V(), H("label", {
							key: t.key,
							class: "trpg-radio"
						}, [W("input", {
							type: "radio",
							name: "variant",
							checked: e.variants.active === t.key,
							onChange: (e) => r("switch", t.key)
						}, null, 40, $I), W("span", null, [K(j(t.sourceName), 1), W("span", eL, " · " + j(t.note ? `${t.note}（${u(t.key)}）` : u(t.key)), 1)])]))), 128))
					])]),
					_: 1
				})]),
				_: 1
			}, 8, ["to"])]),
			_: 1
		})])]));
	}
}), nL = {
	key: 0,
	class: "page-stack",
	"data-testid": "entry-detail"
}, rL = { class: "trpg-row__meta" }, iL = {
	key: 1,
	class: "trpg-entry__summary"
}, aL = {
	key: 2,
	class: "trpg-field__hint"
}, oL = {
	key: 1,
	class: "trpg-empty"
}, sL = {
	key: 2,
	class: "trpg-skeleton",
	"aria-busy": "true"
}, cL = /* @__PURE__ */ L({
	__name: "EntryDetailPage",
	props: {
		packId: {},
		entryId: {}
	},
	setup(e) {
		let t = e, n = IT(), r = RT(), i = nE(), a = nD(), o = iE(), s = /* @__PURE__ */ Dn(null), c = /* @__PURE__ */ P(!1);
		ga(async () => {
			s.value = await n.svc().db.entries.get([t.packId, t.entryId]) ?? null, c.value = !s.value, s.value && a.setTitle(`entry:${t.packId}/${t.entryId}`, s.value.name);
		});
		let l = J(() => ZC(t.packId, t.entryId)), u = J(() => s.value ? cw(s.value) : null), d = J(() => r.workspace ? $C(r.workspace.data).variants[l.value] : void 0), f = J(() => u.value ? Sw(u.value, d.value) : null), p = J(() => f.value?.entry ?? u.value), m = J(() => p.value?.data.text ?? []);
		async function h(e) {
			let t = await i.packOfEntry(e);
			t ? vR(t, e, e) : o.info("这个条目所在的扩展包还没有安装");
		}
		async function g(e) {
			let t = d.value?.active;
			try {
				await r.mutate((t, n) => t.library.switchVariant(n, l.value, e).then((e) => ({ workspace: e }))), o.undoable("已切换版本", async () => {
					t && await r.mutate((e, n) => e.library.switchVariant(n, l.value, t).then((e) => ({ workspace: e })));
				});
			} catch (e) {
				console.error("[trpg-assistant] 切换版本失败", e), o.error(`切换失败：${e instanceof Error ? e.message : String(e)}`);
			}
		}
		return (e, t) => p.value && u.value ? (V(), H("div", nL, [
			d.value && d.value.candidates.length ? (V(), U(tL, {
				key: 0,
				variants: d.value,
				original: u.value,
				"read-only": F(r).readOnly,
				"origin-name": u.value.name,
				onSwitch: g
			}, null, 8, [
				"variants",
				"original",
				"read-only",
				"origin-name"
			])) : q("", !0),
			W("p", rL, [K(j(F(EI)(p.value.type)), 1), p.value.nameEn ? (V(), H(B, { key: 0 }, [K(" · " + j(p.value.nameEn), 1)], 64)) : q("", !0)]),
			p.value.summary ? (V(), H("p", iL, j(p.value.summary), 1)) : q("", !0),
			G(BI, {
				blocks: m.value,
				onRef: h
			}, null, 8, ["blocks"]),
			F(DI)(p.value.data) ? (V(), H("p", aL, j(F(DI)(p.value.data)), 1)) : q("", !0)
		])) : c.value ? (V(), H("p", oL, "没有找到这个条目")) : (V(), H("div", sL));
	}
}), lL = 864e5;
async function uL(e, t, n) {
	let r = await e.packs.get(n);
	if (!r) throw new Q("E_NOT_FOUND", "没有找到这个内容包");
	let i = (await e.saves.toArray()).filter((e) => e.deletedAt === void 0), a = (e) => Object.keys(e.snapshot.pins ?? {}), o = (e) => (e.snapshot.adventures ?? []).map((e) => e.packId);
	return {
		pack: r,
		enabledIn: i.filter((e) => e.packs.some((e) => e.id === n)).length,
		pinnedIn: i.filter((e) => a(e).some((e) => e.startsWith(`${n}/`))).length,
		adventuresIn: i.filter((e) => o(e).includes(n)).length,
		core: t.list().some((e) => e.corePackIds.includes(n))
	};
}
function dL(e) {
	let t = [];
	return e.enabledIn && t.push(`${e.enabledIn} 个存档启用了它。`), e.adventuresIn && t.push(`${e.adventuresIn} 个存档导入过它的冒险内容。`), e.pinnedIn && t.push(`${e.pinnedIn} 个存档固定了它的条目。`), t.push("存档里已经用到的内容都有副本，不受影响；没用过的条目在重新安装前查不到。"), e.pack.source === "builtin" && t.push("之后可以在库里重新安装。"), e.pack.source === "user" && t.push("这是你自己做的内容，删除后可在库回收站中保留 30 天。建议先导出为文件。"), t;
}
async function fL(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of await e.packs.toArray()) for (let e of t.blobHashes) n.add(e);
	for (let t of await e.workspaces.toArray()) WS(t.data, n);
	for (let t of await e.saves.toArray()) WS(t.snapshot, n);
	let r = 0;
	for (let i of await e.blobs.toArray()) n.has(i.hash) || t - i.createdAt < lL || (await e.blobs.delete(i.hash), r++);
	return r;
}
async function pL(e, t) {
	let n = await uL(e.db, e.rules, t);
	if (n.core) throw new Q("E_BUILTIN_PROTECTED", "这是规则必选的内容包，不能卸载");
	let { pack: r } = n, i = !1;
	return r.source === "user" && (await e.db.packTrash.put({
		id: r.id,
		name: r.name,
		ruleId: r.ruleId,
		bytes: await e.packs.exportPack(r.id),
		deletedAt: e.now()
	}), i = !0), await e.packs.remove(t), r.source === "builtin" && await bC(e.db, t, !0), r.source === "download" && await SC(e.db, t, !0), await fL(e.db, e.now()), { trashed: i };
}
async function mL(e, t, n) {
	await bC(e.db, t, !1);
	let r = await n(t), i = e.packs.recognize(r);
	if (i.type !== "pack") throw new Q("E_BAD_CONTENT", "内置文件不是内容包");
	await e.packs.install(i, {
		source: "builtin",
		resolution: "overwrite"
	});
}
// src/ui/library/ApplyVariantsPage.vue?vue&type=script&setup=true&lang.ts
var hL = {
	class: "page-stack",
	"data-testid": "apply-variants"
}, gL = { class: "trpg-confirm__message" }, _L = { class: "trpg-drawer__buttons" }, vL = { class: "trpg-list" }, yL = { class: "trpg-row__title" }, bL = { class: "trpg-row__meta" }, xL = {
	key: 0,
	class: "trpg-badge",
	"data-tone": "warn"
}, SL = {
	key: 0,
	class: "trpg-field__hint"
}, CL = { class: "trpg-confirm__actions" }, wL = /* @__PURE__ */ L({
	__name: "ApplyVariantsPage",
	props: {
		packName: {},
		items: {},
		names: {},
		sourceOf: { type: Function },
		onAnswer: { type: Function }
	},
	setup(e) {
		let t = e, n = /* @__PURE__ */ pn(Object.fromEntries(t.items.map((e) => [e.variant.key, e.defaultUse]))), r = (e) => t.items.forEach((t) => n[t.variant.key] = e), i = (e) => e.variant.mode === "hide" ? "隐藏" : e.variant.mode === "patch" ? "局部修改" : "整条替换", a = t.items.filter((e) => e.conflict).length;
		return (t, o) => (V(), H("div", hL, [
			W("p", gL, "「" + j(e.packName) + "」修改了 " + j(e.items.length) + " 个官方条目（只在本存档生效）。", 1),
			W("div", _L, [W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: o[0] ||= (e) => r(!0)
			}, "全部应用"), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: o[1] ||= (e) => r(!1)
			}, "全部不用")]),
			W("ul", vL, [(V(!0), H(B, null, R(e.items, (t) => (V(), H("li", {
				key: t.variant.key,
				class: "trpg-row"
			}, [
				G(vO, {
					modelValue: n[t.variant.key],
					"onUpdate:modelValue": (e) => n[t.variant.key] = e,
					label: e.names[t.entryKey] ?? t.entryKey
				}, {
					default: I(() => [W("span", yL, j(e.names[t.entryKey] ?? t.entryKey), 1)]),
					_: 2
				}, 1032, [
					"modelValue",
					"onUpdate:modelValue",
					"label"
				]),
				W("span", bL, [K(j(i(t)), 1), t.variant.note ? (V(), H(B, { key: 0 }, [K(" · " + j(t.variant.note), 1)], 64)) : q("", !0)]),
				t.conflict ? (V(), H("span", xL, "冲突 · 正在用：" + j(e.sourceOf(t.current)), 1)) : q("", !0)
			]))), 128))]),
			F(a) ? (V(), H("p", SL, "冲突的条目默认保持现状；不勾选的修改版也会加入候选，之后随时可以在版本条里改用。")) : q("", !0),
			W("div", CL, [W("button", {
				class: "trpg-btn",
				type: "button",
				onClick: o[2] ||= (t) => e.onAnswer(null)
			}, "取消"), W("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				"data-autofocus": "",
				onClick: o[3] ||= (t) => e.onAnswer({ ...n })
			}, "启用")])
		]));
	}
}), TL = (e) => e.replace(/[\\/:*?"<>|\s]+/g, "_");
function EL(e, t) {
	console.error(`[trpg-assistant] ${e}`, t), iE().error(`${e}：${gD(t)}`);
}
async function DL(e) {
	let t = nE(), n = iE(), r = t.catalog?.packs.find((t) => t.id === e);
	r ? await t.install(r) && n.success(`已安装「${r.name}」`) : n.error("数据仓库里没有找到这个包，可以稍后重试");
}
function OL(e) {
	return nE().clearTask(e), DL(e);
}
async function kL(e) {
	let t = IT(), n = nE(), r = iE(), i = nD();
	try {
		let a = t.svc(), o = await uL(a.db, a.rules, e.id);
		if (o.core) return r.error("这是规则必选的内容包，不能卸载"), !1;
		let s = dL(o);
		if (!await DD({
			title: "卸载扩展包",
			message: `卸载「${e.name}」？`,
			details: s,
			confirmLabel: "卸载",
			danger: !0
		})) return !1;
		let c = await t.queue.enqueue({
			id: `uninstall:${e.id}`,
			label: `卸载 ${e.name}`,
			run: () => pL({
				db: a.db,
				packs: a.packs,
				rules: a.rules,
				now: a.now
			}, e.id)
		});
		return await n.refreshInstalled(), await n.runIntegrity(), i.isOpen && i.close(!0), r.success(c.trashed ? `已删除「${e.name}」，可在库回收站恢复` : `已卸载「${e.name}」`), !0;
	} catch (e) {
		return EL("卸载失败", e), !1;
	}
}
async function AL(e) {
	let t = IT();
	try {
		let n = t.svc();
		await t.queue.enqueue({
			id: `restore:${e.id}`,
			label: `恢复 ${e.name}`,
			run: () => mL({
				db: n.db,
				packs: n.packs
			}, e.id, Sb)
		}), await nE().refreshInstalled(), iE().success(`已恢复「${e.name}」`);
	} catch (e) {
		EL("恢复失败", e);
	}
}
async function jL(e) {
	try {
		let t = await IT().svc().packs.exportPack(e.id), n = `${TL(e.name)}_v${e.version}.trpgpack`;
		GO(t, n), iE().success(`已导出「${n}」`);
	} catch (e) {
		EL("导出失败", e);
	}
}
async function ML(e) {
	let t = IT(), n = nE(), r = iE();
	try {
		let i = await t.queue.enqueue({
			id: `dup:${e.id}`,
			label: `复制 ${e.name}`,
			run: () => t.svc().mine.duplicate(e.id)
		});
		await n.refreshInstalled();
		let a = nD();
		a.isOpen && a.close(!0), sE().librarySegment = "mine", r.success(`已复制为「${i.name}」`);
	} catch (e) {
		EL("复制失败", e);
	}
}
var NL = (e) => {
	let t = RT().workspace;
	return t && $C(t.data).pins[e]?.entry.name || e.slice(e.indexOf("/") + 1);
};
async function PL(e) {
	let t = RT(), n = nE(), r = iE(), i = n.installedMap.get(e)?.name ?? e;
	try {
		let a = await t.inspect((t, n) => t.library.previewEnable(n, e)), o;
		if (a.variants.length) {
			let e = Object.fromEntries(a.variants.map((e) => [e.entryKey, NL(e.entryKey)])), n = t.workspace, r = (e) => e === "original" ? "原版" : Object.values(n ? $C(n.data).variants : {}).find((t) => t.candidates.some((t) => t.key === e))?.candidates.find((t) => t.key === e)?.sourceName ?? e, s = await vD({
				key: "confirm:variants",
				title: `启用「${i}」`,
				component: Cn(wL),
				props: (t) => ({
					packName: i,
					items: a.variants,
					names: e,
					sourceOf: r,
					onAnswer: t
				})
			}, null);
			if (!s) return !1;
			o = s;
		}
		let s = await t.mutate((t, n) => t.library.enable(n, e, { use: o }));
		await n.runIntegrity();
		let c = s.autoEnabled.map((e) => n.installedMap.get(e)?.name ?? e);
		return r.undoable(c.length ? `已启用「${i}」，并一起启用：${c.join("、")}` : `已启用「${i}」`, () => void FL(e, { confirm: !1 })), !0;
	} catch (e) {
		return EL("启用失败", e), !1;
	}
}
async function FL(e, t = {}) {
	let n = RT(), r = nE(), i = iE(), a = r.installedMap.get(e)?.name ?? e;
	try {
		let o = await n.inspect((t, n) => t.library.previewDisable(n, e));
		if (o.dependents.length) return i.error(`『${o.dependents.map((e) => r.installedMap.get(e)?.name ?? e).join("、")}』需要它，不能停用`), !1;
		if (t.confirm !== !1 && (o.reverted.length > 0 || o.hasState)) {
			let e = [...o.hasState ? [`《${a}》的功能产生的数据（如声望、据点）会保留，重新启用后恢复。`] : [], ...o.reverted.map((e) => `${NL(e.entryKey)}：改回${e.to === "original" ? "原版" : "其他版本"}`)];
			if (!await DD({
				title: `停用「${a}」`,
				message: "停用后：",
				details: e,
				confirmLabel: "停用"
			})) return !1;
		}
		return await n.mutate((t, n) => t.library.disable(n, e)), await r.runIntegrity(), i.undoable(`已停用「${a}」`, () => void PL(e)), !0;
	} catch (e) {
		return EL("停用失败", e), !1;
	}
}
// src/ui/library/PackActions.vue?vue&type=script&setup=true&lang.ts
var IL = { class: "trpg-pack-actions" }, LL = ["title"], RL = {
	key: 0,
	class: "trpg-badge"
}, zL = ["aria-valuenow", "aria-label"], BL = {
	key: 2,
	class: "trpg-row__meta"
}, VL = {
	key: 3,
	class: "trpg-row__meta"
}, HL = {
	key: 0,
	class: "trpg-badge",
	"data-tone": "gold"
}, UL = ["aria-label"], WL = ["title", "aria-label"], GL = {
	key: 1,
	class: "trpg-badge"
}, KL = /* @__PURE__ */ L({
	__name: "PackActions",
	props: { row: {} },
	setup(e) {
		let t = e, n = IT(), r = nE(), i = RT(), a = J(() => r.tasks[t.row.id]), o = J(() => r.queueState(t.row.id)), s = J(() => a.value ? Math.round(a.value.received / Math.max(1, a.value.total) * 100) : 0), c = J(() => n.services?.rules.list().some((e) => e.corePackIds.includes(t.row.id)) ?? !1), l = J(() => !t.row.installed && r.builtinRemoved.includes(t.row.id)), u = J(() => [
			...t.row.category === "adventure" ? [{
				key: "newsave",
				label: "用它开新存档",
				disabled: !0,
				reason: "随后续版本提供"
			}, {
				key: "addsave",
				label: "加入当前存档",
				disabled: !0,
				reason: "随后续版本提供"
			}] : [],
			{
				key: "dup",
				label: "复制为我的包",
				disabled: i.readOnly
			},
			{
				key: "export",
				label: "导出为文件"
			},
			...c.value ? [] : [{
				key: "uninstall",
				label: "卸载",
				danger: !0,
				disabled: i.readOnly
			}]
		]);
		function d(e) {
			e === "dup" ? ML(t.row) : e === "export" ? jL(t.row) : e === "uninstall" && kL(t.row);
		}
		return (t, n) => (V(), H("span", IL, [a.value?.state === "failed" ? (V(), H(B, { key: 0 }, [W("span", {
			class: "trpg-badge",
			"data-tone": "danger",
			title: a.value.error
		}, "⚠ " + j(a.value.error?.slice(0, 18)), 9, LL), W("button", {
			class: "trpg-btn trpg-btn--small",
			type: "button",
			onClick: n[0] ||= (t) => F(OL)(e.row.id)
		}, "重试")], 64)) : a.value || o.value ? (V(), H(B, { key: 1 }, [
			o.value === "waiting" && (!a.value || a.value.state === "waiting") ? (V(), H("span", RL, "等待中")) : (V(), H("span", {
				key: 1,
				class: "trpg-progress",
				role: "progressbar",
				"aria-valuenow": s.value,
				"aria-valuemin": "0",
				"aria-valuemax": "100",
				"aria-label": `${e.row.name} 下载进度`
			}, [W("span", { style: ke({ width: `${s.value}%` }) }, null, 4)], 8, zL)),
			a.value?.state === "downloading" ? (V(), H("span", BL, j(s.value) + "%", 1)) : q("", !0),
			a.value?.state === "installing" ? (V(), H("span", VL, "安装中")) : q("", !0),
			W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: n[1] ||= (t) => F(r).cancel(e.row.id)
			}, "取消")
		], 64)) : l.value ? (V(), H("button", {
			key: 2,
			class: "trpg-btn trpg-btn--small",
			type: "button",
			onClick: n[2] ||= (t) => F(AL)(e.row)
		}, "恢复内置")) : e.row.installed ? (V(), H(B, { key: 4 }, [e.row.updateVersion ? (V(), H("button", {
			key: 0,
			class: "trpg-btn trpg-btn--small trpg-btn--primary",
			type: "button",
			title: `更新到 v${e.row.updateVersion}`,
			"aria-label": `更新 ${e.row.name}`,
			onClick: n[4] ||= (t) => F(DL)(e.row.id)
		}, "更新", 8, WL)) : (V(), H("span", GL, j(F(xI)[e.row.source] ? `${F(xI)[e.row.source]} ` : "") + "v" + j(e.row.version), 1))], 64)) : (V(), H(B, { key: 3 }, [e.row.recommended ? (V(), H("span", HL, "推荐")) : q("", !0), W("button", {
			class: "trpg-btn trpg-btn--small trpg-btn--primary",
			type: "button",
			"aria-label": `安装 ${e.row.name}`,
			onClick: n[3] ||= (t) => F(DL)(e.row.id)
		}, [G(mE, {
			name: "download-simple",
			size: 14
		}), n[5] ||= K("安装", -1)], 8, UL)], 64)), e.row.installed ? (V(), U(rF, {
			key: 5,
			label: e.row.name,
			items: u.value,
			onSelect: d
		}, null, 8, ["label", "items"])) : q("", !0)]));
	}
}), qL = /* @__PURE__ */ L({
	__name: "PackDetailHeader",
	props: { packId: {} },
	setup(e) {
		let t = e, n = nE(), r = J(() => SI(t.packId, n.installed, n.catalog));
		return (e, t) => r.value ? (V(), U(KL, {
			key: 0,
			row: r.value
		}, null, 8, ["row"])) : q("", !0);
	}
}), JL = /* @__PURE__ */ L({
	__name: "SelectField",
	props: /*@__PURE__*/ $a({
		options: {},
		placeholder: {},
		label: {}
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = e, n = So(e, "modelValue"), r = Rr("portalTarget", void 0), i = J(() => t.options.map((e) => typeof e == "string" ? {
			value: e,
			label: e
		} : e));
		return (t, a) => (V(), U(F(jP), {
			modelValue: n.value,
			"onUpdate:modelValue": a[0] ||= (e) => n.value = e
		}, {
			default: I(() => [G(F(YP), {
				class: "trpg-select-trigger",
				"aria-label": e.label
			}, {
				default: I(() => [G(F(XP), { placeholder: e.placeholder ?? "请选择" }, null, 8, ["placeholder"]), G(mE, {
					name: "caret-down",
					size: 14
				})]),
				_: 1
			}, 8, ["aria-label"]), G(F(JP), { to: F(r) }, {
				default: I(() => [G(F(UP), {
					class: "trpg-select-content",
					position: "popper",
					"side-offset": 4,
					"collision-padding": 8
				}, {
					default: I(() => [G(F(ZP), { class: "trpg-select-viewport" }, {
						default: I(() => [(V(!0), H(B, null, R(i.value, (e) => (V(), U(F(KP), {
							key: e.value,
							value: e.value,
							class: "trpg-select-item"
						}, {
							default: I(() => [G(F(qP), null, {
								default: I(() => [K(j(e.label), 1)]),
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
}), YL = ["aria-label"], XL = 6, ZL = /* @__PURE__ */ L({
	__name: "VirtualList",
	props: {
		items: {},
		rowHeight: {},
		keyOf: { type: Function },
		label: {}
	},
	setup(e, { expose: t }) {
		let n = e, r = /* @__PURE__ */ P(null), i = /* @__PURE__ */ P(0), a = /* @__PURE__ */ P(400), o = J(() => Math.max(0, Math.floor(i.value / n.rowHeight) - XL)), s = J(() => Math.min(n.items.length, Math.ceil((i.value + a.value) / n.rowHeight) + XL)), c = J(() => n.items.slice(o.value, s.value).map((e, t) => ({
			item: e,
			index: o.value + t
		}))), l;
		return ga(() => {
			a.value = r.value?.clientHeight || 400, l = new ResizeObserver(() => a.value = r.value?.clientHeight || 400), r.value && l.observe(r.value);
		}), ya(() => l?.disconnect()), t({ scrollToTop: () => r.value && (r.value.scrollTop = 0) }), (t, n) => (V(), H("div", {
			ref_key: "el",
			ref: r,
			class: "trpg-vlist",
			role: "list",
			"aria-label": e.label,
			tabindex: "0",
			onScrollPassive: n[0] ||= (e) => i.value = e.target.scrollTop
		}, [W("div", {
			class: "trpg-vlist__space",
			style: ke({ height: `${e.items.length * e.rowHeight}px` })
		}, [(V(!0), H(B, null, R(c.value, (n) => (V(), H("div", {
			key: e.keyOf(n.item),
			role: "listitem",
			class: "trpg-vlist__row",
			style: ke({
				top: `${n.index * e.rowHeight}px`,
				height: `${e.rowHeight}px`
			})
		}, [z(t.$slots, "default", {
			item: n.item,
			index: n.index
		})], 4))), 128))], 4)], 40, YL));
	}
}), QL = {
	key: 0,
	class: "trpg-packdetail",
	"data-testid": "pack-detail"
}, $L = { class: "trpg-packdetail__head" }, eR = { class: "trpg-row__meta" }, tR = {
	key: 0,
	class: "trpg-packdetail__desc"
}, nR = { class: "trpg-detail-links" }, rR = { key: 0 }, iR = { key: 1 }, aR = { key: 2 }, oR = { key: 3 }, sR = { class: "trpg-packdetail__filter" }, cR = {
	class: "trpg-field__hint",
	"data-testid": "entry-count"
}, lR = { class: "trpg-packdetail__list" }, uR = {
	key: 0,
	class: "trpg-skeleton",
	"aria-busy": "true"
}, dR = {
	key: 1,
	class: "trpg-empty"
}, fR = { class: "trpg-entryrow" }, pR = { class: "trpg-row__meta trpg-entryrow__sum" }, mR = {
	key: 1,
	class: "trpg-empty"
}, hR = {
	key: 1,
	class: "trpg-empty"
}, gR = /* @__PURE__ */ L({
	__name: "PackDetailPage",
	props: { packId: {} },
	setup(e) {
		let t = e, n = IT(), r = nE(), i = RT(), a = J(() => SI(t.packId, r.installed, r.catalog)), o = (e) => SI(e, r.installed, r.catalog)?.name ?? e, s = (e) => r.installedMap.has(e), c = /* @__PURE__ */ Dn([]), l = /* @__PURE__ */ P(!1), u = /* @__PURE__ */ P("all"), d = /* @__PURE__ */ P("");
		async function f() {
			if (!a.value?.installed) return;
			let e = await n.svc().db.entries.where("packId").equals(t.packId).toArray();
			c.value = e.filter((e) => !e.override).map((e) => ({
				entryId: e.entryId,
				name: e.name,
				nameEn: e.nameEn,
				type: e.type,
				summary: e.summary
			})).sort((e, t) => e.type.localeCompare(t.type) || e.name.localeCompare(t.name, "zh")), l.value = !0;
		}
		ga(f), Gr(() => a.value?.installed, f);
		let p = J(() => {
			let e = {};
			for (let t of c.value) e[t.type] = (e[t.type] ?? 0) + 1;
			return [{
				value: "all",
				label: "全部"
			}, ...Object.entries(e).sort((e, t) => t[1] - e[1]).map(([e, t]) => ({
				value: e,
				label: `${EI(e)}（${t}）`
			}))];
		}), m = J(() => {
			let e = d.value.trim().toLowerCase();
			return c.value.filter((t) => (u.value === "all" || t.type === u.value) && (!e || t.name.toLowerCase().includes(e) || (t.nameEn ?? "").toLowerCase().includes(e)));
		}), h = J(() => {
			let e = a.value;
			return e ? [
				xI[e.source],
				`v${e.version}`,
				mD(e.byteSize),
				e.installed ? "已安装" : "未安装"
			].filter(Boolean).join(" · ") : "";
		}), g = J(() => {
			let e = i.workspace;
			return !e || !a.value || e.ruleId !== a.value.ruleId ? "" : a.value.installed ? e.enabledPacks.some((e) => e.id === t.packId) ? "本存档：已启用" : "本存档：未启用" : "本存档：未安装";
		});
		return (t, n) => a.value ? (V(), H("div", QL, [W("div", $L, [
			W("p", eR, j(h.value) + " · " + j(F(bI)(a.value)), 1),
			a.value.description ? (V(), H("p", tR, j(a.value.description), 1)) : q("", !0),
			W("ul", nR, [
				a.value.requires.length ? (V(), H("li", rR, [n[3] ||= K("需要：", -1), (V(!0), H(B, null, R(a.value.requires, (e, t) => (V(), H(B, { key: e }, [
					t ? (V(), H(B, { key: 0 }, [K("、")], 64)) : q("", !0),
					G(wI, { onOpen: (t) => F(_R)(e) }, {
						default: I(() => [K(j(o(e)), 1)]),
						_: 2
					}, 1032, ["onOpen"]),
					K(" " + j(s(e) ? "✓" : "（未安装）"), 1)
				], 64))), 128))])) : q("", !0),
				a.value.recommends.length ? (V(), H("li", iR, [n[4] ||= K("推荐：", -1), (V(!0), H(B, null, R(a.value.recommends, (e, t) => (V(), H(B, { key: e }, [t ? (V(), H(B, { key: 0 }, [K("、")], 64)) : q("", !0), G(wI, { onOpen: (t) => F(_R)(e) }, {
					default: I(() => [K(j(o(e)), 1)]),
					_: 2
				}, 1032, ["onOpen"])], 64))), 128))])) : q("", !0),
				a.value.conflicts.length ? (V(), H("li", aR, [n[5] ||= K("冲突：", -1), (V(!0), H(B, null, R(a.value.conflicts, (e, t) => (V(), H(B, { key: e.id }, [t ? (V(), H(B, { key: 0 }, [K("、")], 64)) : q("", !0), K(j(o(e.id)), 1)], 64))), 128))])) : q("", !0),
				g.value ? (V(), H("li", oR, j(g.value), 1)) : q("", !0)
			])
		]), a.value.installed ? (V(), H(B, { key: 0 }, [W("div", sR, [
			G(JL, {
				modelValue: u.value,
				"onUpdate:modelValue": n[0] ||= (e) => u.value = e,
				options: p.value,
				label: "类别"
			}, null, 8, ["modelValue", "options"]),
			Fr(W("input", {
				"onUpdate:modelValue": n[1] ||= (e) => d.value = e,
				class: "trpg-input",
				type: "search",
				placeholder: "搜索名称",
				"aria-label": "搜索条目"
			}, null, 512), [[mu, d.value]]),
			W("span", cR, "共 " + j(m.value.length) + " 条", 1)
		]), W("div", lR, [l.value ? m.value.length ? (V(), U(ZL, {
			key: 2,
			items: m.value,
			"row-height": 52,
			"key-of": (e) => e.entryId,
			label: "条目列表"
		}, {
			default: I(({ item: t }) => [W("div", fR, [G(wI, { onOpen: (n) => F(vR)(e.packId, t.entryId, t.name) }, {
				default: I(() => [K(j(t.name), 1)]),
				_: 2
			}, 1032, ["onOpen"]), W("span", pR, [K(j(F(EI)(t.type)), 1), t.summary ? (V(), H(B, { key: 0 }, [K(" · " + j(t.summary), 1)], 64)) : q("", !0)])])]),
			_: 1
		}, 8, ["items", "key-of"])) : (V(), H("p", dR, [n[6] ||= K("没有符合的条目 ", -1), d.value || u.value !== "all" ? (V(), H("button", {
			key: 0,
			class: "trpg-link",
			type: "button",
			onClick: n[2] ||= (e) => {
				d.value = "", u.value = "all";
			}
		}, "清除筛选")) : q("", !0)])) : (V(), H("div", uR))])], 64)) : (V(), H("p", mR, "安装后可以查看每一条。"))])) : (V(), H("p", hR, "没有找到这个扩展包"));
	}
});
// src/ui/library/openDetail.ts
function _R(e) {
	let t = nE(), n = nD(), r = SI(e, t.installed, t.catalog), i = {
		key: `pack:${e}`,
		title: r?.name ?? e,
		component: Cn(gR),
		header: Cn(qL),
		props: { packId: e },
		variant: "dialog"
	};
	n.isOpen ? n.push(i) : n.open(i);
}
function vR(e, t, n) {
	let r = nD(), i = {
		key: `entry:${e}/${t}`,
		title: n,
		component: Cn(cL),
		props: {
			packId: e,
			entryId: t
		},
		variant: "dialog"
	};
	r.isOpen ? r.push(i) : r.open(i);
}
// src/ui/wizard/state.ts
var yR = () => ({
	step: 1,
	ruleId: "",
	packIds: [],
	adventureId: "",
	name: "",
	note: "",
	nameEdited: !1,
	packsInit: !1,
	touched: !1
}), $ = /* @__PURE__ */ pn(yR());
function bR() {
	Object.assign($, yR());
}
// src/ui/wizard/StepAdventure.vue?vue&type=script&setup=true&lang.ts
var xR = { class: "page-stack" }, SR = {
	class: "trpg-list",
	role: "radiogroup",
	"aria-label": "冒险"
}, CR = { class: "trpg-row trpg-radio" }, wR = ["checked"], TR = ["checked", "onChange"], ER = { class: "trpg-row__main" }, DR = { class: "trpg-row__meta" }, OR = /* @__PURE__ */ L({
	__name: "StepAdventure",
	setup(e) {
		let t = nE(), n = J(() => yI(t.installed, t.catalog, $.ruleId).filter((e) => e.category === "adventure"));
		function r(e) {
			$.adventureId = e, $.touched = !0;
		}
		return (e, t) => (V(), H("div", xR, [t[3] ||= W("h3", { class: "trpg-step-title" }, "要不要带一个冒险模组", -1), W("div", SR, [W("label", CR, [
			W("input", {
				type: "radio",
				name: "adv",
				checked: F($).adventureId === "",
				onChange: t[0] ||= (e) => r("")
			}, null, 40, wR),
			t[1] ||= K(),
			t[2] ||= W("span", { class: "trpg-row__title" }, "不带冒险，自由开始", -1)
		]), (V(!0), H(B, null, R(n.value, (e) => (V(), H("label", {
			key: e.id,
			class: "trpg-row trpg-radio"
		}, [W("input", {
			type: "radio",
			name: "adv",
			checked: F($).adventureId === e.id,
			onChange: (t) => r(e.id)
		}, null, 40, TR), W("span", ER, [G(wI, { onOpen: (t) => F(_R)(e.id) }, {
			default: I(() => [K(j(e.name), 1)]),
			_: 2
		}, 1032, ["onOpen"]), W("span", DR, j(e.description), 1)])]))), 128))])]));
	}
}), kR = { class: "trpg-field" }, AR = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, jR = {
	key: 1,
	class: "trpg-field__error",
	role: "alert"
}, MR = { class: "trpg-field" }, NR = {
	class: "trpg-field__hint",
	"data-testid": "wizard-summary"
}, PR = /* @__PURE__ */ L({
	__name: "StepName",
	emits: ["submit"],
	setup(e, { emit: t }) {
		let n = t, r = IT(), i = nE(), a = /* @__PURE__ */ P(null), o = J(() => r.svc().rules.get($.ruleId)), s = J(() => $.name.trim().length > 40), c = J(() => $.name.trim().length === 0), l = J(() => {
			let e = $.packIds.length, t = $.adventureId ? `《${i.installedMap.get($.adventureId)?.name ?? $.adventureId}》` : "不带冒险";
			return `将建立：${o.value?.name ?? ""} · 资料 ${e} 本 · ${t}`;
		});
		return ga(() => {
			if (!$.nameEdited || !$.name) {
				let e = new Date(r.svc().now());
				$.name = `${o.value?.nameShort ?? "战役"} · ${e.getMonth() + 1}月${e.getDate()}日`;
			}
			a.value?.focus(), a.value?.select();
		}), (e, t) => (V(), H("form", {
			class: "page-stack",
			onSubmit: t[4] ||= ku((e) => n("submit"), ["prevent"])
		}, [
			t[7] ||= W("h3", { class: "trpg-step-title" }, "给战役起个名字", -1),
			W("label", kR, [
				t[5] ||= W("span", { class: "trpg-field__label" }, "战役名称", -1),
				Fr(W("input", {
					ref_key: "input",
					ref: a,
					"onUpdate:modelValue": t[0] ||= (e) => F($).name = e,
					class: "trpg-input",
					type: "text",
					autocomplete: "off",
					"aria-label": "战役名称",
					onInput: t[1] ||= (e) => {
						F($).nameEdited = !0, F($).touched = !0;
					}
				}, null, 544), [[mu, F($).name]]),
				c.value ? (V(), H("span", AR, "请输入战役名称")) : s.value ? (V(), H("span", jR, "名称最多 " + j(F(40)) + " 个字", 1)) : q("", !0)
			]),
			W("label", MR, [t[6] ||= W("span", { class: "trpg-field__label" }, "备注（可空）", -1), Fr(W("textarea", {
				"onUpdate:modelValue": t[2] ||= (e) => F($).note = e,
				class: "trpg-input",
				rows: "2",
				maxlength: "200",
				"aria-label": "备注",
				onInput: t[3] ||= (e) => F($).touched = !0
			}, null, 544), [[mu, F($).note]])]),
			W("p", NR, j(l.value), 1)
		], 32));
	}
}), FR = { class: "page-stack" }, IR = {
	key: 0,
	class: "trpg-field__hint",
	role: "status"
}, LR = {
	key: 1,
	class: "trpg-field__hint",
	role: "status",
	"data-testid": "wizard-progress"
}, RR = {
	key: 2,
	class: "page-stack",
	"aria-busy": "true"
}, zR = ["aria-label"], BR = { class: "trpg-group" }, VR = { class: "trpg-list" }, HR = ["data-testid"], UR = { class: "trpg-row__main" }, WR = { class: "trpg-row__meta" }, GR = { class: "trpg-row__end" }, KR = {
	key: 0,
	class: "trpg-badge"
}, qR = ["title"], JR = ["onClick"], YR = ["aria-valuenow"], XR = /* @__PURE__ */ L({
	__name: "StepPacks",
	setup(e) {
		let t = IT(), n = nE(), r = /* @__PURE__ */ P(!1), i = J(() => t.svc().rules.get($.ruleId)), a = J(() => yI(n.installed, n.catalog, $.ruleId).filter((e) => e.category !== "adventure")), o = J(() => new Set(i.value?.corePackIds ?? [])), s = J(() => {
			let e = /* @__PURE__ */ new Map(), t = (e) => e.source === "builtin" ? "内置" : e.source === "user" ? "我的" : e.group ?? "其他";
			for (let n of a.value) e.set(t(n), [...e.get(t(n)) ?? [], n]);
			let r = (e) => n.catalog?.packs.findIndex((t) => t.group === e) ?? -1, i = (e) => e === "内置" ? -2 : e === "我的" ? 9999 : e === "其他" ? 9998 : r(e);
			return [...e].sort((e, t) => i(e[0]) - i(t[0]));
		});
		function c(e) {
			if (o.value.has(e)) return "必需";
			let t = a.value.find((t) => $.packIds.includes(t.id) && t.requires.includes(e));
			return t ? `《${t.name}》需要它` : void 0;
		}
		function l(e, t = /* @__PURE__ */ new Set()) {
			if (t.has(e)) return t;
			t.add(e);
			for (let n of a.value.find((t) => t.id === e)?.requires ?? []) l(n, t);
			return t;
		}
		function u(e) {
			return n.catalog?.packs.find((t) => t.id === e);
		}
		function d(e, t) {
			if ($.touched = !0, t) {
				let t = l(e.id);
				$.packIds = [.../* @__PURE__ */ new Set([...$.packIds, ...t])];
				for (let e of t) {
					let t = u(e);
					t && !n.installedMap.has(e) && !n.tasks[e] && n.install(t);
				}
			} else $.packIds = $.packIds.filter((t) => t !== e.id);
		}
		function f() {
			$.touched = !0;
			for (let e of a.value) $.packIds.includes(e.id) || d(e, !0);
		}
		function p() {
			$.touched = !0, $.packIds = [...o.value];
		}
		function m(e) {
			let t = u(e);
			t && n.install(t);
		}
		function h() {
			let e = a.value.filter((e) => e.source === "builtin" || e.source === "user" || e.recommended || o.value.has(e.id)).map((e) => e.id);
			return [.../* @__PURE__ */ new Set([...o.value, ...e.flatMap((e) => [...l(e)])])];
		}
		ga(async () => {
			n.catalog || await n.loadCatalog(), await n.refreshInstalled(), $.packsInit ||= ($.packIds = h(), !0), r.value = !0, await n.ensureRecommended($.ruleId);
		});
		let g = J(() => {
			let e = Object.values(n.tasks), t = e.length;
			if (!t) return "";
			let r = e.filter((e) => e.state !== "failed"), i = e.filter((e) => e.state === "failed").length;
			return r.length ? `正在准备 ${t - r.length - i + 1}/${t}` : `${i} 本未能下载 · 可以先开始，之后在库里补装`;
		});
		return (e, t) => (V(), H("div", FR, [
			W("div", { class: "trpg-step-head" }, [t[1] ||= W("h3", { class: "trpg-step-title" }, "这场战役用哪些资料", -1), W("span", { class: "trpg-step-actions" }, [W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: f
			}, "全选"), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: p
			}, "只留必需")])]),
			F(n).catalogState === "error" ? (V(), H("p", IR, [K(" 没能连上数据仓库：" + j(F(n).catalogError) + "。可以先开始，之后在库里补装。 ", 1), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: t[0] ||= (e) => F(n).loadCatalog(!0)
			}, "重试")])) : q("", !0),
			g.value ? (V(), H("p", LR, j(g.value), 1)) : q("", !0),
			r.value ? q("", !0) : (V(), H("div", RR, [...t[2] ||= [
				W("div", { class: "trpg-skeleton" }, null, -1),
				W("div", {
					class: "trpg-skeleton",
					style: { width: "70%" }
				}, null, -1),
				W("div", {
					class: "trpg-skeleton",
					style: { width: "55%" }
				}, null, -1)
			]])),
			(V(!0), H(B, null, R(r.value ? s.value : [], ([e, t]) => (V(), H("section", {
				key: e,
				"aria-label": e
			}, [W("h4", BR, j(e), 1), W("ul", VR, [(V(!0), H(B, null, R(t, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row",
				"data-testid": `wizard-pack-${e.id}`
			}, [
				G(vO, {
					"model-value": F($).packIds.includes(e.id),
					disabled: !!c(e.id) && F($).packIds.includes(e.id),
					label: e.name,
					"onUpdate:modelValue": (t) => d(e, t)
				}, null, 8, [
					"model-value",
					"disabled",
					"label",
					"onUpdate:modelValue"
				]),
				W("div", UR, [G(wI, { onOpen: (t) => F(_R)(e.id) }, {
					default: I(() => [K(j(e.name), 1)]),
					_: 2
				}, 1032, ["onOpen"]), W("div", WR, [K(j(F(bI)(e)), 1), !e.installed && !F(n).tasks[e.id] ? (V(), H(B, { key: 0 }, [K(" · 未安装 · " + j(F(mD)(e.byteSize)), 1)], 64)) : q("", !0)])]),
				W("div", GR, [c(e.id) && F($).packIds.includes(e.id) ? (V(), H("span", KR, j(c(e.id)), 1)) : q("", !0), F(n).tasks[e.id] ? (V(), H(B, { key: 1 }, [F(n).tasks[e.id].state === "failed" ? (V(), H("span", {
					key: 0,
					class: "trpg-badge",
					"data-tone": "danger",
					title: F(n).tasks[e.id].error
				}, "⚠ 下载失败", 8, qR)) : q("", !0), F(n).tasks[e.id].state === "failed" ? (V(), H("button", {
					key: 1,
					class: "trpg-btn trpg-btn--small",
					type: "button",
					onClick: (t) => m(e.id)
				}, "重试", 8, JR)) : (V(), H("span", {
					key: 2,
					class: "trpg-progress",
					role: "progressbar",
					"aria-valuenow": Math.round(F(n).tasks[e.id].received / Math.max(1, F(n).tasks[e.id].total) * 100),
					"aria-valuemin": "0",
					"aria-valuemax": "100"
				}, [W("span", { style: ke({ width: `${Math.round(F(n).tasks[e.id].received / Math.max(1, F(n).tasks[e.id].total) * 100)}%` }) }, null, 4)], 8, YR))], 64)) : q("", !0)])
			], 8, HR))), 128))])], 8, zR))), 128))
		]));
	}
}), ZR = { class: "page-stack" }, QR = /* @__PURE__ */ L({
	__name: "InfoPage",
	props: { lines: {} },
	setup(e) {
		return (t, n) => (V(), H("div", ZR, [(V(!0), H(B, null, R(e.lines, (e) => (V(), H("p", {
			key: e,
			class: "trpg-info__line"
		}, j(e), 1))), 128))]));
	}
}), $R = { class: "page-stack" }, ez = {
	class: "trpg-rulecards",
	role: "radiogroup",
	"aria-label": "规则"
}, tz = [
	"aria-checked",
	"aria-disabled",
	"tabindex",
	"data-status",
	"onClick",
	"onKeydown"
], nz = {
	class: "trpg-rulecard__mark",
	"aria-hidden": "true"
}, rz = { class: "trpg-rulecard__body" }, iz = { class: "trpg-row__meta" }, az = {
	key: 0,
	class: "trpg-badge"
}, oz = {
	key: 1,
	class: "trpg-badge",
	"data-tone": "warn"
}, sz = /* @__PURE__ */ L({
	__name: "StepRule",
	setup(e) {
		let t = IT(), n = nE(), r = nD(), i = J(() => Xw(t.svc().rules, n.catalog?.rules ?? []));
		function a(e, t) {
			t === "installed" && ($.ruleId = e, $.touched = !0);
		}
		function o(e, t, n) {
			r.push({
				key: `rule:${e}`,
				title: t,
				component: Cn(QR),
				props: { lines: [n] }
			});
		}
		return (e, t) => (V(), H("div", $R, [t[0] ||= W("h3", { class: "trpg-step-title" }, "选择这场战役用的规则", -1), W("div", ez, [(V(!0), H(B, null, R(i.value, (e) => (V(), H("div", {
			key: e.id,
			class: "trpg-rulecard",
			role: "radio",
			"aria-checked": F($).ruleId === e.id,
			"aria-disabled": e.status !== "installed",
			tabindex: e.status === "installed" ? 0 : -1,
			"data-status": e.status,
			onClick: (t) => a(e.id, e.status),
			onKeydown: [ju(ku((t) => a(e.id, e.status), ["prevent"]), ["enter"]), ju(ku((t) => a(e.id, e.status), ["prevent"]), ["space"])]
		}, [W("span", nz, j(F($).ruleId === e.id ? "◉" : "○"), 1), W("span", rz, [
			G(wI, { onOpen: (t) => o(e.id, e.name, e.description) }, {
				default: I(() => [K(j(e.name), 1)]),
				_: 2
			}, 1032, ["onOpen"]),
			W("span", iz, j(e.description), 1),
			e.status === "coming" ? (V(), H("span", az, "即将推出")) : e.status === "installable" ? (V(), H("span", oz, "可安装")) : q("", !0)
		])], 40, tz))), 128))])]));
	}
}), cz = {
	class: "trpg-wizard",
	"data-testid": "wizard"
}, lz = {
	class: "trpg-steps",
	"aria-label": "步骤"
}, uz = ["data-state", "data-skipped"], dz = [
	"aria-current",
	"disabled",
	"title",
	"onClick"
], fz = { class: "trpg-steps__n" }, pz = { class: "trpg-steps__label" }, mz = {
	class: "trpg-steps__compact",
	"aria-hidden": "true"
}, hz = { class: "trpg-wizard__body" }, gz = { class: "trpg-wizard__foot" }, _z = ["disabled"], vz = ["disabled"], yz = /* @__PURE__ */ L({
	__name: "WizardPage",
	setup(e) {
		let t = IT(), n = RT(), r = nE(), i = nD(), a = iE(), o = sE(), s = /* @__PURE__ */ P(!1), c = [
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
		], l = J(() => yI(r.installed, r.catalog, $.ruleId).some((e) => e.category === "adventure")), u = J(() => !hI.adventureImport || !l.value), d = J(() => hI.adventureImport ? "库里还没有冒险" : "冒险导入随后续版本提供"), f = J(() => $.name.trim().length > 0 && $.name.trim().length <= 40), p = J(() => $.step === 1 ? !!$.ruleId : $.step !== 4 || f.value && !s.value), m = J(() => c.find((e) => e.n === $.step)?.label);
		ga(async () => {
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
					console.error("[trpg-assistant] 开始冒险失败", e), a.error(`没能开始：${gD(e)}`);
				} finally {
					s.value = !1;
				}
			}
		}
		return (e, t) => (V(), H("div", cz, [
			W("ol", lz, [(V(), H(B, null, R(c, (e) => W("li", {
				key: e.n,
				"data-state": e.n === F($).step ? "current" : e.n < F($).step ? "done" : "todo",
				"data-skipped": e.n === 3 && u.value
			}, [W("button", {
				type: "button",
				"aria-current": e.n === F($).step ? "step" : void 0,
				disabled: e.n >= F($).step || e.n === 3 && u.value,
				title: e.n === 3 && u.value ? d.value : void 0,
				onClick: (t) => h(e.n)
			}, [W("span", fz, j(e.n), 1), W("span", pz, j(e.label), 1)], 8, dz)], 8, uz)), 64))]),
			W("p", mz, j(F($).step) + "/4 · " + j(m.value), 1),
			W("div", hz, [F($).step === 1 ? (V(), U(sz, { key: 0 })) : F($).step === 2 ? (V(), U(XR, { key: 1 })) : F($).step === 3 ? (V(), U(OR, { key: 2 })) : (V(), U(PR, {
				key: 3,
				onSubmit: v
			}))]),
			W("footer", gz, [W("button", {
				class: "trpg-btn",
				type: "button",
				disabled: F($).step === 1 || s.value,
				onClick: _
			}, "上一步", 8, _z), W("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: !p.value,
				"data-testid": "wizard-next",
				onClick: g
			}, j(F($).step === 4 ? s.value ? "正在准备…" : "开始冒险" : "下一步"), 9, vz)])
		]));
	}
});
// src/ui/saves/actions.ts
function bz() {
	nD().open({
		key: "saves",
		title: "存档",
		component: Cn(uI),
		variant: "drawer"
	});
}
function xz() {
	let e = nD();
	bR(), e.open({
		key: "wizard",
		title: "开始新冒险",
		component: Cn(yz),
		variant: "dialog",
		guard: () => !$.touched || (DD({
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
async function Sz() {
	let e = RT(), t = iE();
	if (e.hasCampaign && !e.readOnly) try {
		let n = await e.save();
		await IT().refreshBackup(), t.success(n ? "已保存" : "已是最新");
	} catch (e) {
		console.error("[trpg-assistant] 保存失败", e), t.error(`保存失败：${gD(e)}`);
	}
}
async function Cz(e) {
	let t = RT(), n = nD(), r = iE(), i = _D();
	if (t.readOnly) return { loaded: !1 };
	try {
		let a = !!t.workspace && t.workspace.ruleId !== e.ruleId;
		if (a) {
			let n = IT().svc().rules.get(e.ruleId);
			if (!await DD({
				title: "切换规则",
				message: `「${e.name}」使用 ${n?.name ?? e.ruleId}。读取后，整个助手会切换为该规则的界面与资料；当前的「${t.currentSave?.name ?? "存档"}」会先写入自动存档。`,
				confirmLabel: "切换并读取"
			})) return { loaded: !1 };
		} else if (t.hasCampaign && t.dirty) {
			let n = await vD({
				key: "confirm:unsaved",
				title: "有未保存的改动",
				component: Cn(mI),
				props: (n) => ({
					current: t.currentSave?.name ?? "当前存档",
					target: e.name,
					onChoose: n
				})
			}, "cancel");
			if (n === "cancel") return { loaded: !1 };
			n === "save" && await t.save();
		} else if (t.hasCampaign && e.ownerKey !== t.owner?.ownerKey && !await DD({
			title: "读取其他角色卡的存档",
			message: `「${e.name}」属于其他角色卡，读取时会复制为这张卡的新存档。`,
			confirmLabel: "读取"
		})) return { loaded: !1 };
		return await t.load(e.id, { allowRuleSwitch: a || !t.hasCampaign }), await i.refresh(), r.success(`已读取「${e.name}」`), n.close(!0), { loaded: !0 };
	} catch (e) {
		return console.error("[trpg-assistant] 读取存档失败", e), r.error(e instanceof Q ? e.message : `读取失败：${gD(e)}`), { loaded: !1 };
	}
}
// src/ui/home/HomeCampaign.vue?vue&type=script&setup=true&lang.ts
var wz = { class: "page-stack" }, Tz = ["src", "alt"], Ez = { class: "trpg-banner__text" }, Dz = { class: "trpg-banner__line" }, Oz = ["data-dirty"], kz = { class: "trpg-overview" }, Az = { class: "trpg-cell__title" }, jz = { class: "trpg-cell__line" }, Mz = {
	key: 0,
	class: "trpg-cell__line"
}, Nz = { class: "trpg-empty trpg-empty--tight" }, Pz = /* @__PURE__ */ L({
	__name: "HomeCampaign",
	setup(e) {
		let t = IT(), n = RT(), r = nE(), i = sE(), a = /* @__PURE__ */ P(!1), o = /* @__PURE__ */ P(!1), s = J(() => n.workspace ? t.svc().rules.get(n.workspace.ruleId) : void 0), c = J(() => uD({
			rule: s.value,
			data: n.workspace.data,
			narrow: window.innerWidth <= 480
		})), l = J(() => !!c.value.src && !a.value), u = J(() => n.currentSave?.name ?? "存档"), d = J(() => n.dirty ? "● 有未保存改动" : n.currentSave ? `已保存 ${pD(n.currentSave.updatedAt)}` : ""), f = J(() => n.workspace?.enabledPacks.length ?? 0), p = J(() => r.catalogState === "ok" ? r.updates.length ? `${r.updates.length} 个可更新` : "已是最新" : "");
		return ga(() => void r.loadCatalog()), (e, t) => (V(), H("div", wz, [
			W("section", {
				class: Pe(["trpg-banner", { "trpg-banner--pattern": !l.value }]),
				"aria-label": "战役横幅"
			}, [l.value ? (V(), H("img", {
				key: 0,
				class: Pe(["trpg-banner__img", { "is-loaded": o.value }]),
				src: c.value.src,
				alt: c.value.alt,
				onLoad: t[0] ||= (e) => o.value = !0,
				onError: t[1] ||= (e) => a.value = !0
			}, null, 42, Tz)) : q("", !0), W("div", Ez, [W("button", {
				class: "trpg-banner__title",
				type: "button",
				"data-testid": "banner-title",
				onClick: t[2] ||= (...e) => F(bz) && F(bz)(...e)
			}, j(u.value), 1), W("div", Dz, [W("span", null, j(s.value?.name), 1), W("button", {
				class: "trpg-banner__state",
				type: "button",
				"data-dirty": F(n).dirty,
				onClick: t[3] ||= (...e) => F(bz) && F(bz)(...e)
			}, j(d.value), 9, Oz)])])], 2),
			t[8] ||= W("h2", { class: "trpg-group" }, "概览", -1),
			W("div", kz, [W("button", {
				class: "trpg-cell",
				type: "button",
				"data-testid": "cell-library",
				onClick: t[4] ||= (e) => F(i).openLibrary("save")
			}, [
				W("span", Az, [G(mE, {
					name: "books",
					size: 18
				}), t[6] ||= K("库", -1)]),
				W("span", jz, "已启用 " + j(f.value) + " 个扩展包", 1),
				p.value ? (V(), H("span", Mz, j(p.value), 1)) : q("", !0)
			])]),
			t[9] ||= W("h2", { class: "trpg-group" }, "最近记录", -1),
			W("p", Nz, [t[7] ||= K("还没有记录，", -1), W("button", {
				class: "trpg-link",
				type: "button",
				onClick: t[5] ||= (e) => F(i).diceOpen = !0
			}, "掷一次骰子试试")])
		]));
	}
}), Fz = { class: "page-stack" }, Iz = ["disabled"], Lz = { class: "trpg-hero__sub" }, Rz = {
	key: 1,
	class: "trpg-hero trpg-hero--idle",
	"data-testid": "no-chat"
}, zz = /* @__PURE__ */ L({
	__name: "HomeEmpty",
	setup(e) {
		let t = RT(), n = IT(), r = _D(), i = /* @__PURE__ */ P(0);
		return ga(async () => {
			i.value = await r.count(), await n.refreshBackup();
		}), (e, n) => (V(), H("div", Fz, [F(t).owner ? (V(), H("button", {
			key: 0,
			class: "trpg-hero",
			type: "button",
			"data-testid": "start-banner",
			disabled: F(t).readOnly,
			onClick: n[0] ||= (e) => F(xz)()
		}, [
			n[2] ||= W("span", { class: "trpg-hero__title" }, "开始一场新的冒险", -1),
			W("span", Lz, "为「" + j(F(t).owner.ownerLabel) + "」建立一个战役：选规则、资料与冒险，再起个名字。", 1),
			n[3] ||= W("span", {
				class: "trpg-hero__go",
				"aria-hidden": "true"
			}, "开始新冒险 →", -1)
		], 8, Iz)) : (V(), H("div", Rz, [...n[4] ||= [W("span", { class: "trpg-hero__title" }, "请先在酒馆中打开一个聊天", -1)]])), F(t).owner && i.value > 0 ? (V(), H("button", {
			key: 2,
			class: "trpg-link",
			type: "button",
			"data-testid": "load-existing",
			onClick: n[1] ||= (...e) => F(bz) && F(bz)(...e)
		}, "读取已有存档（" + j(i.value) + "）", 1)) : q("", !0)]));
	}
}), Bz = {
	key: 0,
	class: "trpg-field__error",
	role: "alert"
}, Vz = {
	key: 1,
	class: "page-stack",
	"aria-busy": "true"
}, Hz = /* @__PURE__ */ L({
	__name: "HomeView",
	setup(e) {
		let t = IT(), n = RT();
		return (e, r) => F(t).bootError ? (V(), H("p", Bz, "无法打开本机存储：" + j(F(t).bootError), 1)) : !F(t).booted || !F(n).ready ? (V(), H("div", Vz, [...r[0] ||= [W("div", {
			class: "trpg-skeleton",
			style: { height: "140px" }
		}, null, -1), W("div", {
			class: "trpg-skeleton",
			style: { width: "40%" }
		}, null, -1)]])) : F(n).hasCampaign ? (V(), U(Pz, { key: 3 })) : (V(), U(zz, { key: 2 }));
	}
}), Uz = {
	class: "page-stack",
	"data-testid": "ext-list"
}, Wz = { class: "trpg-toolbar" }, Gz = ["aria-pressed"], Kz = ["disabled"], qz = {
	key: 0,
	class: "trpg-field__hint",
	role: "status"
}, Jz = ["aria-label"], Yz = { class: "trpg-group" }, Xz = { class: "trpg-list" }, Zz = ["data-testid"], Qz = { class: "trpg-row__main" }, $z = { class: "trpg-row__meta" }, eB = { class: "trpg-row__end" }, tB = { class: "trpg-row trpg-row--series" }, nB = { class: "trpg-row__title" }, rB = ["data-testid"], iB = { class: "trpg-row__main" }, aB = { class: "trpg-row__meta" }, oB = { class: "trpg-row__meta" }, sB = { class: "trpg-row__end" }, cB = {
	key: 1,
	class: "trpg-empty"
}, lB = /* @__PURE__ */ L({
	__name: "ExtList",
	props: { ruleId: {} },
	setup(e) {
		let t = e, n = nE(), r = RT(), i = sE(), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(!1);
		ga(() => void n.loadCatalog());
		let s = J(() => yI(n.installed, n.catalog, t.ruleId).filter((e) => e.source !== "user")), c = J(() => s.value.filter((e) => e.updateVersion)), l = J(() => {
			let e = a.value.trim().toLowerCase();
			return s.value.filter((t) => (!o.value || t.updateVersion) && (!e || t.name.toLowerCase().includes(e) || (t.nameEn ?? "").toLowerCase().includes(e)));
		}), u = J(() => _I.map((e) => {
			let t = l.value.filter((t) => t.category === e).sort((e, t) => Number(t.installed) - Number(e.installed) || (e.series?.order ?? 0) - (t.series?.order ?? 0) || e.name.localeCompare(t.name, "zh")), n = /* @__PURE__ */ new Map(), r = [];
			for (let e of t) e.series ? n.set(e.series.id, [...n.get(e.series.id) ?? [], e]) : r.push(e);
			return {
				category: e,
				label: gI[e],
				single: r,
				series: [...n.values()]
			};
		}).filter((e) => e.single.length || e.series.length));
		async function d() {
			for (let e of c.value) DL(e.id);
		}
		return Gr(() => i.libraryFocusPack, async (e) => {
			e && (await hr(), document.getElementById("trpg-assistant-root")?.shadowRoot?.querySelector(`[data-testid="ext-${e}"]`)?.scrollIntoView({ block: "center" }), i.libraryFocusPack = null);
		}, { immediate: !0 }), (e, t) => (V(), H("div", Uz, [
			W("div", Wz, [
				s.value.length > 8 ? Fr((V(), H("input", {
					key: 0,
					"onUpdate:modelValue": t[0] ||= (e) => a.value = e,
					class: "trpg-input trpg-toolbar__search",
					type: "search",
					placeholder: "搜索名称",
					"aria-label": "搜索扩展包"
				}, null, 512)), [[mu, a.value]]) : q("", !0),
				c.value.length ? (V(), H("button", {
					key: 1,
					class: "trpg-pill",
					type: "button",
					"aria-pressed": o.value,
					"data-testid": "only-updates",
					onClick: t[1] ||= (e) => o.value = !o.value
				}, "有更新 " + j(c.value.length), 9, Gz)) : q("", !0),
				o.value && c.value.length ? (V(), H("button", {
					key: 2,
					class: "trpg-btn trpg-btn--small",
					type: "button",
					disabled: F(r).readOnly,
					onClick: d
				}, "全部更新", 8, Kz)) : q("", !0)
			]),
			F(n).catalogState === "error" ? (V(), H("p", qz, [K("没能连上数据仓库：" + j(F(n).catalogError) + " ", 1), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: t[2] ||= (e) => F(n).loadCatalog(!0)
			}, "重试")])) : q("", !0),
			(V(!0), H(B, null, R(u.value, (e) => (V(), H("section", {
				key: e.category,
				"aria-label": e.label
			}, [W("h3", Yz, j(e.label), 1), W("ul", Xz, [(V(!0), H(B, null, R(e.single, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row",
				"data-testid": `ext-${e.id}`
			}, [W("div", Qz, [G(wI, { onOpen: (t) => F(_R)(e.id) }, {
				default: I(() => [K(j(e.name), 1)]),
				_: 2
			}, 1032, ["onOpen"]), W("div", $z, j(F(bI)(e)), 1)]), W("div", eB, [G(KL, { row: e }, null, 8, ["row"])])], 8, Zz))), 128)), (V(!0), H(B, null, R(e.series, (e) => (V(), H(B, { key: e[0].series.id }, [W("li", tB, [W("span", nB, j(e[0].series.name) + "（系列）", 1)]), (V(!0), H(B, null, R(e, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row trpg-row--nested",
				"data-testid": `ext-${e.id}`
			}, [W("div", iB, [
				W("span", aB, j(e.series.order), 1),
				t[3] ||= K(),
				G(wI, { onOpen: (t) => F(_R)(e.id) }, {
					default: I(() => [K(j(e.name), 1)]),
					_: 2
				}, 1032, ["onOpen"]),
				W("div", oB, j(F(bI)(e)), 1)
			]), W("div", sB, [G(KL, { row: e }, null, 8, ["row"])])], 8, rB))), 128))], 64))), 128))])], 8, Jz))), 128)),
			u.value.length ? q("", !0) : (V(), H("p", cB, j(F(n).catalogState === "loading" ? "正在读取数据仓库…" : "没有符合的扩展包"), 1))
		]));
	}
});
// src/core/library/assets.ts
async function uB(e, t, n) {
	if (t.length > 10485760) throw new Q("E_TOO_LARGE", "图片超过 10MB，请先压缩后再选");
	let r = PS("这张图片", t), i = _S(t);
	try {
		await e.blobs.get(i) || await e.blobs.put({
			hash: i,
			bytes: t,
			mime: r,
			size: t.length,
			createdAt: n
		});
	} catch (e) {
		throw Cb(e) ? new Q("E_QUOTA", wb) : e;
	}
	return { $asset: i };
}
// src/ui/library/saveActions.ts
function dB(e, t) {
	console.error(`[trpg-assistant] ${e}`, t), iE().error(`${e}：${gD(t)}`);
}
async function fB(e, t, n) {
	let r = RT(), i = iE();
	try {
		await r.mutate(async (t, r) => ({ workspace: await t.library.setRuleOption(r, e, n) })), i.undoable(`「${t}」已${n ? "打开" : "关闭"}`, async () => {
			await r.mutate(async (t, r) => ({ workspace: await t.library.setRuleOption(r, e, !n) }));
		});
	} catch (e) {
		dB("设置失败", e);
	}
}
async function pB(e, t) {
	let n = RT(), r = iE();
	try {
		let i = await n.mutate((t, n) => t.library.updateFeaturesSafely(n, e));
		r.success(i.kept.length ? i.kept.map((e) => e.reason).join("；") : `「${t}」的功能定义已更新`);
	} catch (e) {
		dB("更新失败", e);
	}
}
async function mB(e, t, n, r) {
	let i = RT(), a = iE(), o = i.workspace;
	if (o) try {
		let s = xw(o.data, e, n);
		if (!s.changed.length) {
			a.info("没有需要改动的条目");
			return;
		}
		let c = (e) => e === "original" ? "原版" : "其他版本", l = s.changed.map((e) => `${r(e.entryKey)}：${c(e.from)} → ${n ? `《${t}》的版本` : c(e.to)}`);
		if ((s.changed.some((e) => e.from !== "original") || !n) && !await DD({
			title: n ? "全部使用" : "全部不用",
			message: n ? `将有 ${s.changed.length} 个条目改用《${t}》的版本：` : `《${t}》正在使用的 ${s.changed.length} 个条目会改回：`,
			details: l,
			confirmLabel: n ? "全部使用" : "全部不用"
		})) return;
		let u = o.data;
		await i.mutate((t, r) => t.library.setSourceUse(r, e, n)), a.undoable(n ? `已改用《${t}》的版本` : `已不再使用《${t}》的版本`, async () => {
			await i.mutate(async (e, t) => ({ workspace: await e.campaign.updateData(t, () => u) }));
		});
	} catch (e) {
		dB("修改失败", e);
	}
}
async function hB(e, t, n) {
	let r = RT(), i = iE(), a = r.workspace, o = a ? $C(a.data).variants[e]?.active : void 0;
	try {
		await r.mutate(async (n, r) => ({ workspace: await n.library.switchVariant(r, e, t) })), i.undoable(`「${n}」已切换版本`, async () => {
			o && await r.mutate(async (t, n) => ({ workspace: await t.library.switchVariant(n, e, o) }));
		});
	} catch (e) {
		dB("切换失败", e);
	}
}
async function gB(e, t, n) {
	let r = RT(), i = nE(), a = iE();
	try {
		await r.mutate(async (r, i) => ({ workspace: await r.library.repair(i, e, t, n) })), await i.runIntegrity(), a.success("已修复");
	} catch (e) {
		dB("修复失败", e);
	}
}
// src/ui/library/HealthSubpage.vue?vue&type=script&setup=true&lang.ts
var _B = {
	class: "page-stack",
	"data-testid": "health-page"
}, vB = { class: "trpg-step-head" }, yB = { class: "trpg-step-title" }, bB = ["disabled"], xB = { class: "trpg-list" }, SB = { class: "trpg-row__main" }, CB = { class: "trpg-row__title" }, wB = { class: "trpg-row__meta" }, TB = { class: "trpg-row__end trpg-row__end--wrap" }, EB = ["onClick"], DB = {
	key: 0,
	class: "trpg-empty"
}, OB = /* @__PURE__ */ L({
	__name: "HealthSubpage",
	emits: ["back"],
	setup(e) {
		let t = IT(), n = nE(), r = iE(), i = sE(), a = /* @__PURE__ */ P(!1), o = /* @__PURE__ */ P(null), s = null;
		async function c() {
			a.value = !0;
			try {
				await n.runIntegrity();
			} finally {
				a.value = !1;
			}
		}
		ga(c);
		let l = {
			install: "去安装",
			"text-only": "改为纯文字",
			pin: "固定",
			"pick-image": "重新选择",
			"remove-image": "移除图片",
			trash: "移入回收站",
			"new-id": "换新编号",
			"use-original": "改用原版"
		};
		function u(e, t) {
			t === "install" ? i.openLibrary("ext", e.packId) : t === "pick-image" ? (s = e, o.value?.click()) : gB(e, t);
		}
		async function d(e) {
			let n = e.target, i = n.files?.[0];
			if (n.value = "", i && s) try {
				let e = await uB(t.svc().db, new Uint8Array(await i.arrayBuffer()), t.svc().now());
				await gB(s, "pick-image", e.$asset);
			} catch (e) {
				console.error("[trpg-assistant] 选择图片失败", e), r.error(`选择图片失败：${gD(e)}`);
			}
		}
		return (e, t) => (V(), H("div", _B, [
			W("button", {
				class: "subpage-back",
				type: "button",
				onClick: t[0] ||= (t) => e.$emit("back")
			}, [G(mE, {
				name: "caret-left",
				size: 16
			}), t[1] ||= K("本存档", -1)]),
			W("div", vB, [W("h2", yB, j(F(n).issues.length ? `体检：发现 ${F(n).issues.length} 处问题` : "体检：没有问题"), 1), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				disabled: a.value,
				onClick: c
			}, "重新检查", 8, bB)]),
			W("ul", xB, [(V(!0), H(B, null, R(F(n).issues, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row",
				"data-testid": "health-issue"
			}, [W("div", SB, [W("span", CB, [t[2] ||= K("⚠ ", -1), e.packId && e.entryId && e.kind !== "pack-missing" ? (V(), U(wI, {
				key: 0,
				onOpen: (t) => F(vR)(e.packId, e.entryId, e.subject)
			}, {
				default: I(() => [K(j(e.subject), 1)]),
				_: 2
			}, 1032, ["onOpen"])) : (V(), H(B, { key: 1 }, [K(j(e.subject), 1)], 64))]), W("div", wB, j(e.detail), 1)]), W("div", TB, [(V(!0), H(B, null, R(e.fixes, (t) => (V(), H("button", {
				key: t,
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: (n) => u(e, t)
			}, j(l[t]), 9, EB))), 128))])]))), 128))]),
			F(n).issues.length ? q("", !0) : (V(), H("p", DB, "存档里的引用、图片与内容都正常。")),
			W("input", {
				ref_key: "picker",
				ref: o,
				class: "trpg-sr-only",
				type: "file",
				accept: "image/png,image/jpeg,image/webp,image/gif",
				tabindex: "-1",
				"aria-hidden": "true",
				onChange: d
			}, null, 544)
		]));
	}
}), kB = { class: "trpg-field" }, AB = {
	key: 0,
	class: "trpg-field"
}, jB = { class: "trpg-field" }, MB = {
	key: 1,
	class: "trpg-field__error",
	role: "alert"
}, NB = { class: "trpg-confirm__actions" }, PB = ["disabled"], FB = /* @__PURE__ */ L({
	__name: "CreateMinePage",
	props: {
		ruleId: {},
		pack: {}
	},
	emits: ["done"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = IT(), a = nE(), o = nD(), s = iE(), c = /* @__PURE__ */ P(n.pack?.name ?? ""), l = /* @__PURE__ */ P(n.pack?.description ?? ""), u = /* @__PURE__ */ P("rules"), d = /* @__PURE__ */ P(""), f = /* @__PURE__ */ P(!1);
		async function p() {
			f.value = !0, d.value = "";
			try {
				if (n.pack) await i.svc().mine.rename(n.pack.id, {
					name: c.value,
					description: l.value
				}), s.success("已保存");
				else {
					let e = await i.svc().mine.create({
						ruleId: n.ruleId,
						name: c.value,
						category: u.value,
						description: l.value
					});
					s.success(`已建立「${e.name}」`);
				}
				await a.refreshInstalled(), r("done"), o.close(!0);
			} catch (e) {
				d.value = gD(e);
			} finally {
				f.value = !1;
			}
		}
		return (t, n) => (V(), H("form", {
			class: "page-stack",
			onSubmit: ku(p, ["prevent"])
		}, [
			W("label", kB, [n[4] ||= W("span", { class: "trpg-field__label" }, "名称", -1), Fr(W("input", {
				"onUpdate:modelValue": n[0] ||= (e) => c.value = e,
				class: "trpg-input",
				maxlength: "80",
				"aria-label": "名称",
				"data-autofocus": "",
				autocomplete: "off"
			}, null, 512), [[mu, c.value]])]),
			e.pack ? q("", !0) : (V(), H("div", AB, [n[5] ||= W("span", { class: "trpg-field__label" }, "分组", -1), G(_E, {
				modelValue: u.value,
				"onUpdate:modelValue": n[1] ||= (e) => u.value = e,
				label: "分组",
				options: [
					{
						value: "rules",
						label: "资料与规则"
					},
					{
						value: "setting",
						label: "设定"
					},
					{
						value: "toolkit",
						label: "工具"
					},
					{
						value: "adventure",
						label: "冒险"
					}
				]
			}, null, 8, ["modelValue"])])),
			W("label", jB, [n[6] ||= W("span", { class: "trpg-field__label" }, "简介（可空）", -1), Fr(W("textarea", {
				"onUpdate:modelValue": n[2] ||= (e) => l.value = e,
				class: "trpg-input",
				rows: "3",
				maxlength: "400",
				"aria-label": "简介"
			}, null, 512), [[mu, l.value]])]),
			d.value ? (V(), H("p", MB, j(d.value), 1)) : q("", !0),
			W("div", NB, [W("button", {
				class: "trpg-btn",
				type: "button",
				onClick: n[3] ||= (e) => F(o).close(!0)
			}, "取消"), W("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "submit",
				disabled: f.value || !c.value.trim()
			}, j(e.pack ? "保存" : "建立"), 9, PB)])
		], 32));
	}
}), IB = { class: "trpg-confirm" }, LB = { class: "trpg-list" }, RB = ["onClick"], zB = { class: "trpg-confirm__actions" }, BB = /* @__PURE__ */ L({
	__name: "PickPackPage",
	props: {
		packs: {},
		onAnswer: { type: Function }
	},
	setup(e) {
		return (t, n) => (V(), H("div", IB, [
			n[1] ||= W("p", { class: "trpg-confirm__message" }, "移到哪个包？", -1),
			W("ul", LB, [(V(!0), H(B, null, R(e.packs, (t) => (V(), H("li", {
				key: t.id,
				class: "trpg-row"
			}, [W("button", {
				class: "trpg-btn trpg-btn--quiet",
				type: "button",
				onClick: (n) => e.onAnswer(t.id)
			}, j(t.name), 9, RB)]))), 128))]),
			W("div", zB, [W("button", {
				class: "trpg-btn",
				type: "button",
				"data-autofocus": "",
				onClick: n[0] ||= (t) => e.onAnswer(null)
			}, "取消")])
		]));
	}
});
// src/ui/library/mineActions.ts
function VB(e, t) {
	console.error(`[trpg-assistant] ${e}`, t), iE().error(`${e}：${gD(t)}`);
}
function HB(e, t) {
	nD().open({
		key: "mine-form",
		title: t ? "改名与简介" : "新建我的包",
		component: Cn(FB),
		props: {
			ruleId: e,
			pack: t
		},
		variant: "dialog"
	});
}
async function UB(e, t) {
	let n = IT(), r = nE(), i = iE();
	if (!await DD({
		title: "删除我的包",
		message: `「${t}」是你自己做的内容，删除后可在库回收站中保留 30 天。建议先导出为文件。`,
		confirmLabel: "删除",
		danger: !0
	})) return !1;
	try {
		return await n.queue.enqueue({
			id: `mine-remove:${e}`,
			label: `删除 ${t}`,
			run: () => n.svc().mine.remove(e)
		}), await r.refreshInstalled(), i.undoable(`已删除「${t}」，可在库回收站恢复`, async () => {
			await n.svc().mine.restore(e), await r.refreshInstalled();
		}), !0;
	} catch (e) {
		return VB("删除失败", e), !1;
	}
}
async function WB(e) {
	let t = IT();
	try {
		let n = await t.svc().mine.duplicate(e);
		await nE().refreshInstalled(), iE().success(`已复制为「${n.name}」`);
	} catch (e) {
		VB("复制失败", e);
	}
}
async function GB(e, t, n) {
	try {
		GO(await IT().svc().packs.exportPack(e), `${t.replace(/[\\/:*?"<>|\s]+/g, "_")}_v${n}.trpgpack`), iE().success(`已导出「${t}」`);
	} catch (e) {
		VB("导出失败", e);
	}
}
async function KB(e, t) {
	if (!await DD({
		title: "彻底删除",
		message: `「${t}」将被永久删除，无法恢复。`,
		confirmLabel: "彻底删除",
		danger: !0
	})) return !1;
	try {
		return await IT().svc().mine.purge(e), !0;
	} catch (e) {
		return VB("删除失败", e), !1;
	}
}
async function qB(e) {
	try {
		let t = await IT().svc().mine.restore(e);
		await nE().refreshInstalled(), iE().success(`已恢复「${t.name}」`);
	} catch (e) {
		VB("恢复失败", e);
	}
}
async function JB(e) {
	return vD({
		key: "confirm:pick-pack",
		title: "移到…",
		component: Cn(BB),
		props: (t) => ({
			packs: e,
			onAnswer: t
		})
	}, null);
}
// src/ui/library/MineSubpage.vue?vue&type=script&setup=true&lang.ts
var YB = {
	key: 0,
	class: "trpg-minesub",
	"data-testid": "mine-sub"
}, XB = { class: "trpg-step-head" }, ZB = { class: "trpg-step-title" }, QB = { class: "trpg-row__meta" }, $B = { class: "trpg-packdetail__filter" }, eV = { class: "trpg-field__hint" }, tV = { class: "trpg-minesub__list" }, nV = {
	key: 0,
	class: "trpg-empty"
}, rV = { class: "trpg-entryrow" }, iV = { class: "trpg-row__meta trpg-entryrow__sum" }, aV = {
	key: 1,
	class: "trpg-empty"
}, oV = /* @__PURE__ */ L({
	__name: "MineSubpage",
	props: { packId: {} },
	emits: ["back"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = IT(), a = nE(), o = RT(), s = iE(), c = /* @__PURE__ */ Dn([]), l = /* @__PURE__ */ P("all"), u = /* @__PURE__ */ P(""), d = J(() => a.installedMap.get(n.packId));
		async function f() {
			let e = await i.svc().mine.entries(n.packId);
			c.value = e.map((e) => ({
				entryId: e.entryId,
				name: e.name,
				type: e.type,
				summary: e.summary
			})).sort((e, t) => e.type.localeCompare(t.type) || e.name.localeCompare(t.name, "zh"));
		}
		ga(f);
		let p = J(() => {
			let e = {};
			for (let t of c.value) e[t.type] = (e[t.type] ?? 0) + 1;
			return [{
				value: "all",
				label: "全部"
			}, ...Object.entries(e).map(([e, t]) => ({
				value: e,
				label: `${EI(e)}（${t}）`
			}))];
		}), m = J(() => {
			let e = u.value.trim().toLowerCase();
			return c.value.filter((t) => (l.value === "all" || t.type === l.value) && (!e || t.name.toLowerCase().includes(e)));
		}), h = J(() => a.installed.filter((e) => e.source === "user" && e.id !== n.packId && e.ruleId === d.value?.ruleId));
		async function g(e, t) {
			try {
				await e(), await a.refreshInstalled(), await f();
			} catch (e) {
				console.error(`[trpg-assistant] ${t}`, e), s.error(`${t}：${gD(e)}`);
			}
		}
		async function _(e, t) {
			if (e === "copy") await g(() => i.svc().mine.copyEntry(n.packId, t.entryId), "复制失败");
			else if (e === "move") {
				let e = await JB(h.value.map((e) => ({
					id: e.id,
					name: e.name
				})));
				e && await g(() => i.svc().mine.moveEntry(n.packId, e, t.entryId), "移动失败");
			} else if (e === "delete") {
				let e = await i.svc().mine.usage(n.packId, t.entryId);
				await DD({
					title: "删除条目",
					message: `删除「${t.name}」？`,
					details: e ? [`${e} 个存档用到它（已固定，不受影响）。`] : [],
					confirmLabel: "删除",
					danger: !0
				}) && await g(() => i.svc().mine.deleteEntry(n.packId, t.entryId), "删除失败");
			}
		}
		async function v(e) {
			let t = d.value;
			t && (e === "rename" ? HB(t.ruleId, {
				id: t.id,
				name: t.name,
				description: t.description
			}) : e === "dup" ? await WB(t.id) : e === "export" ? await GB(t.id, t.name, t.version) : e === "delete" && await UB(t.id, t.name) && r("back"));
		}
		return (t, n) => d.value ? (V(), H("div", YB, [
			W("button", {
				class: "subpage-back",
				type: "button",
				onClick: n[0] ||= (e) => t.$emit("back")
			}, [G(mE, {
				name: "caret-left",
				size: 16
			}), n[3] ||= K("我的", -1)]),
			W("div", XB, [W("h2", ZB, [K(j(d.value.name) + " ", 1), W("span", QB, "v" + j(d.value.version), 1)]), G(rF, {
				label: d.value.name,
				items: [
					{
						key: "rename",
						label: "改名与简介"
					},
					{
						key: "dup",
						label: "复制为新包"
					},
					{
						key: "export",
						label: "导出为文件"
					},
					{
						key: "delete",
						label: "删除",
						danger: !0
					}
				],
				onSelect: v
			}, null, 8, ["label"])]),
			W("div", $B, [
				G(JL, {
					modelValue: l.value,
					"onUpdate:modelValue": n[1] ||= (e) => l.value = e,
					options: p.value,
					label: "类别"
				}, null, 8, ["modelValue", "options"]),
				Fr(W("input", {
					"onUpdate:modelValue": n[2] ||= (e) => u.value = e,
					class: "trpg-input",
					type: "search",
					placeholder: "搜索名称",
					"aria-label": "搜索条目"
				}, null, 512), [[mu, u.value]]),
				W("span", eV, "共 " + j(m.value.length) + " 条", 1)
			]),
			W("div", tV, [m.value.length ? (V(), U(ZL, {
				key: 1,
				items: m.value,
				"row-height": 52,
				"key-of": (e) => e.entryId,
				label: "条目列表"
			}, {
				default: I(({ item: t }) => [
					W("div", rV, [G(wI, { onOpen: (n) => F(vR)(e.packId, t.entryId, t.name) }, {
						default: I(() => [K(j(t.name), 1)]),
						_: 2
					}, 1032, ["onOpen"]), W("span", iV, j(F(EI)(t.type)), 1)]),
					n[4] ||= W("button", {
						class: "trpg-btn trpg-btn--small",
						type: "button",
						disabled: "",
						title: "条目编辑器随后续版本提供"
					}, "编辑", -1),
					G(rF, {
						label: t.name,
						items: [
							{
								key: "move",
								label: "移到…",
								disabled: !h.value.length || F(o).readOnly,
								reason: "没有别的我的包"
							},
							{
								key: "copy",
								label: "复制",
								disabled: F(o).readOnly
							},
							{
								key: "delete",
								label: "删除",
								danger: !0,
								disabled: F(o).readOnly
							}
						],
						onSelect: (e) => _(e, t)
					}, null, 8, [
						"label",
						"items",
						"onSelect"
					])
				]),
				_: 1
			}, 8, ["items", "key-of"])) : (V(), H("p", nV, "还没有条目"))]),
			n[5] ||= W("p", { class: "trpg-field__hint" }, "条目编辑器随后续版本提供；现在可以复制、移动、删除条目。", -1)
		])) : (V(), H("p", aV, "没有找到这个包"));
	}
}), sV = {
	class: "page-stack",
	"data-testid": "mine-tab"
}, cV = { class: "trpg-toolbar" }, lV = ["disabled"], uV = {
	key: 0,
	class: "trpg-list"
}, dV = ["data-testid"], fV = { class: "trpg-row__main" }, pV = { class: "trpg-row__meta" }, mV = { class: "trpg-row__end" }, hV = ["onClick"], gV = {
	key: 1,
	class: "trpg-empty"
}, _V = {
	key: 2,
	"aria-label": "库回收站"
}, vV = { class: "trpg-group" }, yV = { class: "trpg-list" }, bV = { class: "trpg-row__main" }, xV = { class: "trpg-row__title" }, SV = { class: "trpg-row__meta" }, CV = { class: "trpg-row__end" }, wV = ["onClick"], TV = ["onClick"], EV = /* @__PURE__ */ L({
	__name: "MineTab",
	props: { ruleId: {} },
	emits: ["edit"],
	setup(e) {
		let t = e, n = IT(), r = nE(), i = RT(), a = /* @__PURE__ */ P([]), o = J(() => yI(r.installed, r.catalog, t.ruleId).filter((e) => e.source === "user"));
		async function s() {
			a.value = (await n.svc().mine.trash()).filter((e) => e.ruleId === t.ruleId);
		}
		ga(s);
		let c = (e) => Math.max(0, Math.floor((n.svc().now() - e) / 864e5));
		async function l(e, n) {
			e === "rename" ? HB(t.ruleId, {
				id: n.id,
				name: n.name,
				description: n.description
			}) : e === "dup" ? await WB(n.id) : e === "export" ? await GB(n.id, n.name, n.version) : e === "delete" && await UB(n.id, n.name) && await s();
		}
		return (t, n) => (V(), H("div", sV, [
			W("div", cV, [W("button", {
				class: "trpg-btn trpg-btn--primary",
				type: "button",
				disabled: F(i).readOnly,
				"data-testid": "mine-new",
				onClick: n[0] ||= (t) => F(HB)(e.ruleId)
			}, "＋ 新建", 8, lV)]),
			o.value.length ? (V(), H("ul", uV, [(V(!0), H(B, null, R(o.value, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row",
				"data-testid": `mine-row-${e.name}`
			}, [W("div", fV, [G(wI, { onOpen: (t) => F(_R)(e.id) }, {
				default: I(() => [K(j(e.name), 1)]),
				_: 2
			}, 1032, ["onOpen"]), W("div", pV, j(F(bI)(e) || "还没有内容") + " · v" + j(e.version), 1)]), W("div", mV, [W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: (n) => t.$emit("edit", e.id)
			}, "编辑 ›", 8, hV), G(rF, {
				label: e.name,
				items: [
					{
						key: "rename",
						label: "改名与简介",
						disabled: F(i).readOnly
					},
					{
						key: "dup",
						label: "复制为新包",
						disabled: F(i).readOnly
					},
					{
						key: "export",
						label: "导出为文件"
					},
					{
						key: "delete",
						label: "删除",
						danger: !0,
						disabled: F(i).readOnly
					}
				],
				onSelect: (t) => l(t, e)
			}, null, 8, [
				"label",
				"items",
				"onSelect"
			])])], 8, dV))), 128))])) : (V(), H("div", gV, [...n[1] ||= [W("p", null, "你在存档里做的人物、物品、地点、房规，可以通过『存到我的库』留在这里，所有存档都能用。", -1)]])),
			a.value.length ? (V(), H("section", _V, [W("h3", vV, "库回收站（" + j(a.value.length) + "）", 1), W("ul", yV, [(V(!0), H(B, null, R(a.value, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row"
			}, [W("div", bV, [W("span", xV, j(e.name), 1), W("div", SV, j(c(e.deletedAt)) + " 天前删除 · " + j(Math.max(0, F(30) - c(e.deletedAt))) + " 天后清除 · " + j(F(fD)(e.deletedAt)), 1)]), W("div", CV, [W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: (t) => F(qB)(e.id).then(s)
			}, "恢复", 8, wV), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: (t) => F(KB)(e.id, e.name).then(s)
			}, "彻底删除", 8, TV)])]))), 128))])])) : q("", !0)
		]));
	}
}), DV = ["title"], OV = [
	"aria-checked",
	"aria-label",
	"aria-description",
	"disabled",
	"data-on"
], kV = /* @__PURE__ */ L({
	__name: "Switch",
	props: /*@__PURE__*/ $a({
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
		let t = So(e, "modelValue");
		function n() {
			t.value = !t.value;
		}
		return (r, i) => (V(), H("span", {
			class: "trpg-switch-wrap",
			title: e.lockedReason
		}, [e.lockedReason ? (V(), U(mE, {
			key: 0,
			name: "lock",
			size: 14
		})) : q("", !0), W("button", {
			class: "trpg-switch",
			type: "button",
			role: "switch",
			"aria-checked": t.value,
			"aria-label": e.label,
			"aria-description": e.lockedReason,
			disabled: e.disabled,
			"data-on": t.value,
			onClick: n
		}, [...i[0] ||= [W("span", { class: "trpg-switch__thumb" }, null, -1)]], 8, OV)], 8, DV));
	}
}), AV = {
	class: "page-stack",
	"data-testid": "save-tab"
}, jV = {
	key: 0,
	class: "trpg-issuerow",
	role: "status"
}, MV = { "aria-label": "资料" }, NV = { class: "trpg-list" }, PV = ["data-testid"], FV = { class: "trpg-row__main" }, IV = {
	key: 1,
	class: "trpg-row__title"
}, LV = {
	key: 2,
	class: "trpg-row__meta"
}, RV = {
	key: 3,
	class: "trpg-row__meta"
}, zV = {
	key: 4,
	class: "trpg-row__meta"
}, BV = { class: "trpg-row__end" }, VV = ["onClick"], HV = ["disabled", "onClick"], UV = {
	key: 1,
	"aria-label": "规则选项"
}, WV = { class: "trpg-list" }, GV = ["data-testid"], KV = { class: "trpg-row__main" }, qV = { class: "trpg-row__meta" }, JV = { class: "trpg-row__end" }, YV = {
	key: 2,
	class: "trpg-row trpg-variantrow",
	"aria-label": "修改版"
}, XV = { class: "trpg-row__main" }, ZV = { class: "trpg-row__meta" }, QV = /* @__PURE__ */ L({
	__name: "SaveTab",
	emits: ["sub"],
	setup(e) {
		let t = IT(), n = RT(), r = nE(), i = nD(), a = sE();
		ga(() => void r.runIntegrity());
		let o = J(() => n.workspace), s = J(() => t.svc().rules.get(o.value.ruleId)), c = J(() => new Set(o.value.enabledPacks.map((e) => e.id))), l = {
			builtin: 0,
			download: 1,
			catalog: 1,
			import: 2,
			user: 3
		}, u = J(() => {
			let e = yI(r.installed, r.catalog, o.value.ruleId).filter((e) => e.installed && e.category !== "adventure").map((e) => ({
				id: e.id,
				name: e.name,
				missing: !1,
				rank: l[e.source]
			}));
			for (let t of o.value.enabledPacks) r.installedMap.has(t.id) || e.push({
				id: t.id,
				name: t.id,
				missing: !0,
				rank: 9
			});
			return e.sort((e, t) => e.rank - t.rank || e.name.localeCompare(t.name, "zh"));
		});
		function d(e) {
			if (s.value?.corePackIds.includes(e)) return "内置 · 其他资料都需要它";
			let t = o.value.enabledPacks.find((t) => r.installedMap.get(t.id)?.relationships.requires.some((t) => t.id === e));
			if (t && c.value.has(e)) return `《${r.installedMap.get(t.id)?.name}》需要它`;
			if (!c.value.has(e)) {
				let t = r.installedMap.get(e);
				for (let n of o.value.enabledPacks) {
					let i = r.installedMap.get(n.id), a = t?.relationships.conflicts.find((e) => e.id === n.id) ?? i?.relationships.conflicts.find((t) => t.id === e);
					if (a) return `与『${i?.name}』冲突${a.reason ? `：${a.reason}` : ""}`;
				}
			}
		}
		let f = J(() => aw(o.value.data)), p = (e) => r.installedMap.get(e)?.name ?? e, m = J(() => Object.values($C(o.value.data).variants).filter((e) => e.candidates.length)), h = J(() => m.value.filter((e) => e.candidates.length >= 2).length), g = J(() => {
			let e = r.issues;
			return `发现 ${e.length} 处问题：${e.slice(0, 2).map((e) => `「${e.subject}」${e.kind === "asset-missing" ? "图片缺失" : e.kind === "pack-missing" ? "缺失" : "需要处理"}`).join(" · ")}`;
		});
		function _(e, t) {
			t ? PL(e.id) : FL(e.id);
		}
		function v(e) {
			let t = [
				e.text || e.summary || "这个选项没有更多说明。",
				`来源：${p(e.packId)}`,
				...e.implemented ? [] : ["仅说明：结算不会自动应用。"]
			], n = {
				key: `option:${e.key}`,
				title: e.name,
				component: Cn(QR),
				props: { lines: t }
			};
			i.isOpen ? i.push(n) : i.open({
				...n,
				variant: "dialog"
			});
		}
		return (e, t) => (V(), H("div", AV, [
			F(r).issues.length ? (V(), H("div", jV, [W("span", null, "⚠ " + j(g.value), 1), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				"data-testid": "go-health",
				onClick: t[0] ||= (t) => e.$emit("sub", "health")
			}, "去处理 ›")])) : q("", !0),
			W("section", MV, [t[2] ||= W("h3", { class: "trpg-group" }, "资料", -1), W("ul", NV, [(V(!0), H(B, null, R(u.value, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row",
				"data-testid": `save-pack-${e.id}`
			}, [W("div", FV, [e.missing ? (V(), H("span", IV, j(e.name), 1)) : (V(), U(wI, {
				key: 0,
				onOpen: (t) => F(_R)(e.id)
			}, {
				default: I(() => [K(j(e.name), 1)]),
				_: 2
			}, 1032, ["onOpen"])), e.missing ? (V(), H("div", LV, "未安装 · 已用到的条目照常可用")) : F(r).featureUpdateCounts.get(e.id) ? (V(), H("div", RV, "有新版功能定义 " + j(F(r).featureUpdateCounts.get(e.id)) + " 个", 1)) : d(e.id) ? (V(), H("div", zV, j(d(e.id)), 1)) : q("", !0)]), W("div", BV, [e.missing ? (V(), H("button", {
				key: 0,
				class: "trpg-btn trpg-btn--small",
				type: "button",
				onClick: (t) => F(a).openLibrary("ext", e.id)
			}, "去安装", 8, VV)) : (V(), H(B, { key: 1 }, [F(r).featureUpdateCounts.get(e.id) ? (V(), H("button", {
				key: 0,
				class: "trpg-btn trpg-btn--small",
				type: "button",
				disabled: F(n).readOnly,
				onClick: (t) => F(pB)(e.id, e.name)
			}, "更新", 8, HV)) : q("", !0), G(kV, {
				"model-value": c.value.has(e.id),
				label: `启用 ${e.name}`,
				disabled: F(n).readOnly || !!d(e.id) && (c.value.has(e.id) || d(e.id).startsWith("与")),
				"locked-reason": c.value.has(e.id) ? d(e.id) : void 0,
				"onUpdate:modelValue": (t) => _(e, t)
			}, null, 8, [
				"model-value",
				"label",
				"disabled",
				"locked-reason",
				"onUpdate:modelValue"
			])], 64))])], 8, PV))), 128))])]),
			f.value.length ? (V(), H("section", UV, [t[3] ||= W("h3", { class: "trpg-group" }, "规则选项", -1), W("ul", WV, [(V(!0), H(B, null, R(f.value, (e) => (V(), H("li", {
				key: e.key,
				class: "trpg-row",
				"data-testid": `option-${e.name}`
			}, [W("div", KV, [G(wI, { onOpen: (t) => v(e) }, {
				default: I(() => [K(j(e.name), 1)]),
				_: 2
			}, 1032, ["onOpen"]), W("div", qV, [K(j(p(e.packId)), 1), e.implemented ? q("", !0) : (V(), H(B, { key: 0 }, [K(" · 仅说明")], 64))])]), W("div", JV, [G(kV, {
				"model-value": e.on,
				label: e.name,
				disabled: F(n).readOnly,
				"onUpdate:modelValue": (t) => F(fB)(e.key, e.name, t)
			}, null, 8, [
				"model-value",
				"label",
				"disabled",
				"onUpdate:modelValue"
			])])], 8, GV))), 128))])])) : q("", !0),
			m.value.length ? (V(), H("section", YV, [W("div", XV, [t[4] ||= W("span", { class: "trpg-row__title" }, "修改版", -1), W("div", ZV, [K("本存档有 " + j(m.value.length) + " 个条目用了修改版", 1), h.value ? (V(), H(B, { key: 0 }, [K(" · 冲突 " + j(h.value), 1)], 64)) : q("", !0)])]), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				"data-testid": "go-variants",
				onClick: t[1] ||= (t) => e.$emit("sub", "variants")
			}, "管理 ›")])) : q("", !0)
		]));
	}
}), $V = {
	class: "page-stack",
	"data-testid": "variants-page"
}, eH = { class: "trpg-list" }, tH = { class: "trpg-row__main" }, nH = { class: "trpg-row__title" }, rH = { class: "trpg-row__meta" }, iH = {
	key: 0,
	class: "trpg-row__end"
}, aH = ["disabled", "onClick"], oH = ["disabled", "onClick"], sH = { class: "trpg-toolbar" }, cH = { class: "trpg-list" }, lH = ["data-testid"], uH = { class: "trpg-row__main" }, dH = { class: "trpg-row__meta" }, fH = {
	key: 0,
	class: "trpg-field__error"
}, pH = ["onClick"], mH = { class: "trpg-row__end trpg-row__end--select" }, hH = {
	key: 0,
	class: "trpg-empty"
}, gH = /* @__PURE__ */ L({
	__name: "VariantsSubpage",
	emits: ["back"],
	setup(e) {
		let t = RT(), n = nE(), r = sE(), i = /* @__PURE__ */ P("all"), a = /* @__PURE__ */ P(""), o = J(() => $C(t.workspace.data)), s = (e) => o.value.pins[e]?.entry.name ?? e.slice(e.indexOf("/") + 1), c = (e) => o.value.pins[e]?.entry.type ?? "", l = J(() => {
			let e = /* @__PURE__ */ new Map();
			for (let t of Object.values(o.value.variants)) for (let n of t.candidates) {
				let r = n.source.type === "pack" ? n.source.packId : "house", i = e.get(r) ?? {
					id: r,
					name: n.source.type === "house" ? "本存档房规" : n.sourceName,
					total: 0,
					used: 0
				};
				i.total++, t.active === n.key && i.used++, e.set(r, i);
			}
			return [...e.values()];
		}), u = J(() => Object.entries(o.value.variants).filter(([, e]) => e.candidates.length).map(([e, t]) => {
			let r = t.candidates.find((e) => e.key === t.active), i = o.value.pins[e];
			return {
				key: e,
				name: s(e),
				type: c(e),
				active: t.active,
				slotCandidates: t.candidates.map((e) => ({
					key: e.key,
					sourceName: e.sourceName
				})),
				hidden: r?.mode === "hide",
				broken: !!r && r.mode !== "replace" && !i && !n.installedMap.has(e.slice(0, e.indexOf("/")))
			};
		}).sort((e, t) => e.type.localeCompare(t.type) || e.name.localeCompare(t.name, "zh"))), d = J(() => ({
			conflict: u.value.filter((e) => e.slotCandidates.length >= 2).length,
			unused: u.value.filter((e) => e.active === XC).length,
			hidden: u.value.filter((e) => e.hidden).length
		})), f = J(() => {
			let e = a.value.trim().toLowerCase();
			return u.value.filter((t) => (i.value === "all" || i.value === "conflict" && t.slotCandidates.length >= 2 || i.value === "unused" && t.active === "original" || i.value === "hidden" && t.hidden) && (!e || t.name.toLowerCase().includes(e)));
		}), p = (e) => [{
			value: XC,
			label: "原版"
		}, ...e.slotCandidates.map((e) => ({
			value: e.key,
			label: e.sourceName
		}))], m = (e) => r.openLibrary("ext", e.slice(0, e.indexOf("/")));
		return (e, n) => (V(), H("div", $V, [
			W("button", {
				class: "subpage-back",
				type: "button",
				onClick: n[0] ||= (t) => e.$emit("back")
			}, [G(mE, {
				name: "caret-left",
				size: 16
			}), n[3] ||= K("本存档", -1)]),
			n[5] ||= W("h2", { class: "trpg-group trpg-group--first" }, "来源", -1),
			W("ul", eH, [(V(!0), H(B, null, R(l.value, (e) => (V(), H("li", {
				key: e.id,
				class: "trpg-row"
			}, [W("div", tH, [W("span", nH, j(e.name), 1), W("div", rH, [K(j(e.total) + " 处", 1), e.id === "house" ? q("", !0) : (V(), H(B, { key: 0 }, [K(" · 使用中 " + j(e.used), 1)], 64))])]), e.id === "house" ? q("", !0) : (V(), H("div", iH, [W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				disabled: F(t).readOnly,
				onClick: (t) => F(mB)(F(bw)(e.id), e.name, !0, s)
			}, "全部使用", 8, aH), W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				disabled: F(t).readOnly,
				onClick: (t) => F(mB)(F(bw)(e.id), e.name, !1, s)
			}, "全部不用", 8, oH)]))]))), 128))]),
			W("div", sH, [G(_E, {
				modelValue: i.value,
				"onUpdate:modelValue": n[1] ||= (e) => i.value = e,
				label: "筛选",
				options: [
					{
						value: "all",
						label: "全部"
					},
					{
						value: "conflict",
						label: `有冲突 ${d.value.conflict}`
					},
					{
						value: "unused",
						label: `未使用 ${d.value.unused}`
					},
					{
						value: "hidden",
						label: `隐藏的 ${d.value.hidden}`
					}
				]
			}, null, 8, ["modelValue", "options"]), u.value.length > 8 ? Fr((V(), H("input", {
				key: 0,
				"onUpdate:modelValue": n[2] ||= (e) => a.value = e,
				class: "trpg-input trpg-toolbar__search",
				type: "search",
				placeholder: "搜索条目",
				"aria-label": "搜索条目"
			}, null, 512)), [[mu, a.value]]) : q("", !0)]),
			W("ul", cH, [(V(!0), H(B, null, R(f.value, (e) => (V(), H("li", {
				key: e.key,
				class: "trpg-row",
				"data-testid": `variant-${e.name}`
			}, [W("div", uH, [
				G(wI, { onOpen: (t) => F(vR)(e.key.slice(0, e.key.indexOf("/")), e.key.slice(e.key.indexOf("/") + 1), e.name) }, {
					default: I(() => [K(j(e.name), 1)]),
					_: 2
				}, 1032, ["onOpen"]),
				W("div", dH, [K(j(e.type), 1), e.slotCandidates.length > 1 ? (V(), H(B, { key: 0 }, [K(" · 另有 " + j(e.slotCandidates.length - 1) + " 个版本", 1)], 64)) : q("", !0)]),
				e.broken ? (V(), H("div", fH, [n[4] ||= K("⚠ 修改无法显示：原版缺失 ", -1), W("button", {
					class: "trpg-link",
					type: "button",
					onClick: (t) => m(e.key)
				}, "去安装", 8, pH)])) : q("", !0)
			]), W("div", mH, [G(JL, {
				"model-value": e.active,
				options: p(e),
				label: `${e.name} 使用的版本`,
				"onUpdate:modelValue": (t) => F(hB)(e.key, t ?? F("original"), e.name)
			}, null, 8, [
				"model-value",
				"options",
				"label",
				"onUpdate:modelValue"
			])])], 8, lH))), 128))]),
			f.value.length ? q("", !0) : (V(), H("p", hH, "没有符合的条目"))
		]));
	}
}), _H = {
	key: 0,
	class: "trpg-skeleton",
	"aria-busy": "true"
}, vH = {
	key: 1,
	class: "page-stack",
	"data-testid": "library"
}, yH = { class: "trpg-toolbar trpg-toolbar--between" }, bH = { class: "trpg-toolbar__end" }, xH = {
	class: "trpg-row__meta",
	"data-testid": "library-rule"
}, SH = ["disabled"], CH = /* @__PURE__ */ L({
	__name: "LibraryView",
	setup(e) {
		let t = IT(), n = RT(), r = nE(), i = sE(), a = /* @__PURE__ */ P(null), o = /* @__PURE__ */ P(null);
		ga(() => void r.refreshInstalled());
		let s = J(() => t.svc().rules.list()), c = J(() => n.workspace?.ruleId ?? s.value[0]?.id ?? ""), l = J(() => t.svc().rules.get(c.value)?.name ?? ""), u = J(() => n.hasCampaign), d = J(() => [
			...u.value ? [{
				value: "save",
				label: "本存档"
			}] : [],
			{
				value: "ext",
				label: "扩展"
			},
			{
				value: "mine",
				label: "我的"
			}
		]), f = J({
			get: () => i.librarySegment === "save" && !u.value ? "ext" : i.librarySegment,
			set: (e) => {
				i.librarySegment = e, o.value = null;
			}
		});
		Gr(() => i.librarySegment, () => o.value = null);
		function p(e) {
			let t = e.target, n = t.files?.[0];
			t.value = "", n && RO(n);
		}
		return (e, r) => F(t).booted ? (V(), H("div", vH, [o.value ? o.value.kind === "variants" ? (V(), U(gH, {
			key: 1,
			onBack: r[4] ||= (e) => o.value = null
		})) : o.value.kind === "health" ? (V(), U(OB, {
			key: 2,
			onBack: r[5] ||= (e) => o.value = null
		})) : (V(), U(oV, {
			key: 3,
			"pack-id": o.value.packId,
			onBack: r[6] ||= (e) => o.value = null
		}, null, 8, ["pack-id"])) : (V(), H(B, { key: 0 }, [W("div", yH, [G(_E, {
			modelValue: f.value,
			"onUpdate:modelValue": r[0] ||= (e) => f.value = e,
			label: "库分段",
			options: d.value
		}, null, 8, ["modelValue", "options"]), W("span", bH, [
			W("span", xH, j(l.value), 1),
			W("button", {
				class: "trpg-btn trpg-btn--small",
				type: "button",
				disabled: F(n).readOnly,
				onClick: r[1] ||= (e) => a.value?.click()
			}, [G(mE, {
				name: "download-simple",
				size: 14
			}), r[7] ||= K("导入文件", -1)], 8, SH),
			W("input", {
				ref_key: "picker",
				ref: a,
				class: "trpg-sr-only",
				type: "file",
				accept: ".trpgpack,.trpgsave,.zip",
				tabindex: "-1",
				"aria-hidden": "true",
				onChange: p
			}, null, 544)
		])]), f.value === "save" && u.value ? (V(), U(QV, {
			key: 0,
			onSub: r[2] ||= (e) => o.value = { kind: e }
		})) : f.value === "ext" ? (V(), U(lB, {
			key: 1,
			"rule-id": c.value
		}, null, 8, ["rule-id"])) : f.value === "mine" ? (V(), U(EV, {
			key: 2,
			"rule-id": c.value,
			onEdit: r[3] ||= (e) => o.value = {
				kind: "mine",
				packId: e
			}
		}, null, 8, ["rule-id"])) : q("", !0)], 64))])) : (V(), H("div", _H));
	}
}), wH = /* @__PURE__ */ pn({});
function TH(e, t, n, r, i) {
	wH[e] = {
		id: e,
		title: t,
		status: n,
		summary: r,
		detail: i,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function EH(e, t, n) {
	try {
		await n();
	} catch (n) {
		console.error(`[trpg-assistant] 探针 ${e} 出错`, n), TH(e, t, "error", n instanceof Error ? n.message : String(n));
	}
}
function DH(e) {
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		env: e,
		results: Object.values(wH)
	};
}
// src/probes/envProbe.ts
var OH = "env", kH = "宿主与设备环境";
function AH() {
	let e = document.createElement("div");
	e.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top)", document.body.appendChild(e);
	let t = getComputedStyle(e).paddingTop;
	return e.remove(), t;
}
async function jH(e) {
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
		safeAreaTop: AH(),
		contextKeys: Object.keys(e).sort(),
		libsKeys: Object.keys(window.SillyTavern?.libs ?? {}).sort(),
		hasSetExtensionPrompt: typeof e.setExtensionPrompt == "function",
		hasPromptEnums: !!e.extension_prompt_types,
		eventTypeCount: Object.keys(e.event_types ?? {}).length,
		tauri: t
	};
}
function MH(e) {
	let t = () => EH(OH, kH, async () => {
		let t = await jH(e), n = t.tauri;
		TH(OH, kH, "info", n.present ? "检测到 TauriTavern 宿主" : "未检测到 TauriTavern（普通 SillyTavern）", t);
	});
	return {
		id: OH,
		title: kH,
		hint: "自动检测。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/eventsProbe.ts
var NH = "events", PH = "聊天事件", FH = [
	["CHAT_CHANGED", "chat_id_changed"],
	["MESSAGE_SENT", "message_sent"],
	["MESSAGE_RECEIVED", "message_received"],
	["MESSAGE_SWIPED", "message_swiped"],
	["MESSAGE_EDITED", "message_edited"],
	["MESSAGE_DELETED", "message_deleted"],
	["GENERATION_STARTED", "generation_started"],
	["GENERATION_ENDED", "generation_ended"]
];
function IH(e) {
	let t = {}, n = [], r = () => {
		let e = FH.map(([e]) => e).filter((e) => !t[e]);
		TH(NH, PH, "info", e.length ? `尚未观察到：${e.join("、")}` : "全部事件都已观察到", {
			counts: t,
			recent: n.slice(-30)
		});
	};
	return {
		id: NH,
		title: PH,
		hint: "依次做：发送消息、等回复、切换回复（左右箭头）、编辑一条消息、删除一条消息、切换聊天，观察事件是否都能收到。",
		actions: [{
			label: "刷新",
			run: r
		}],
		start: () => {
			for (let [i, a] of FH) g(e, h(e, i, a), (...e) => {
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
var LH = "identity", RH = "角色卡 / 群组 / 聊天标识";
function zH(e) {
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
function BH(e) {
	let t = [], n = () => {
		let n = zH(e), r = JSON.stringify([
			n.characterId,
			n.groupId,
			n.chatId
		]);
		t.some((e) => e.key === r) || t.push({
			key: r,
			...n
		}), TH(LH, RH, "info", `当前：${n.groupId ? "群组聊天" : n.characterId === null ? "没有打开聊天" : "角色卡聊天"}；已观察 ${t.length} 种上下文`, {
			current: n,
			observed: t
		});
	};
	return {
		id: LH,
		title: RH,
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
function VH(e, t) {
	if (!e) throw Error(t);
}
function HH(e, t, n) {
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
async function UH(e) {
	let t = [], n = tT({
		dbName: `tavern-trpg-assistant-selftest-${vb()}`,
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
	}, l = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="), (e) => e.charCodeAt(0)), u = (e, t, n = "1.0.0", r = []) => Nw({
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
		entries: [...HH(5, "spell", "sp"), ...r],
		blobs: /* @__PURE__ */ new Map([[_S(l), {
			bytes: l,
			mime: "image/png"
		}]])
	});
	try {
		await s("运行环境", async () => (VH(typeof indexedDB < "u", "没有 IndexedDB"), VH(typeof structuredClone == "function", "没有 structuredClone"), VH(typeof crypto?.getRandomValues == "function", "没有 crypto.getRandomValues"), VH(typeof BroadcastChannel < "u", "没有 BroadcastChannel（多窗口只读不可用）"), `secureContext=${String(globalThis.isSecureContext)}`)), await s("生成并识别内容包（zip 压缩与解压）", async () => {
			let e = n.packs.recognize(u("selftest-core", "rules"));
			return VH(e.type === "pack" && e.manifest.entryCount === 5, "识别结果不对"), `${e.type === "pack" ? e.byteSize : 0} 字节`;
		}), await s("安装内置包与模组（模组依赖核心包）", async () => {
			VH(await n.packs.installBuiltin(u("dnd5e2014-srd", "rules")) === "installed", "内置包未安装");
			let e = n.packs.recognize(u("selftest-module", "adventure", "1.0.0", [c]));
			VH(e.type === "pack", "不是内容包"), await n.packs.install(e, { source: "import" }), VH((await n.packs.list()).length === 2, "安装数量不对");
		}), await s("重复导入同一个包：要求先选择覆盖；选择后升级", async () => {
			let e = n.packs.recognize(u("selftest-module", "adventure", "1.1.0", [c]));
			VH(e.type === "pack", "不是内容包");
			let t = !1;
			try {
				await n.packs.install(e, { source: "import" });
			} catch {
				t = !0;
			}
			VH(t, "没有要求选择覆盖"), await n.packs.install(e, {
				source: "import",
				resolution: "overwrite"
			}), VH((await n.db.packs.get("selftest-module"))?.version === "1.1.0", "覆盖后版本不对");
		}), await s("新存档、修改、保存、分支", async () => {
			let e = await n.campaign.startNewCampaign({
				...r,
				ruleId: "dnd5e2014",
				packIds: ["selftest-module"],
				name: "自检存档"
			});
			VH(!n.campaign.isDirty(e.workspace), "新存档不应有未保存改动");
			let t = await n.campaign.updateData(r.ownerKey, (e) => ({
				...e,
				gold: 10
			}));
			VH(n.campaign.isDirty(t), "修改后应为未保存"), VH((await n.campaign.saveCurrent(r.ownerKey)).changed, "保存应写入"), VH((await n.campaign.branch(r.ownerKey)).save.branchedFrom === e.save.id, "分支来源不对");
		}), await s("读取存档（写自动存档）与模板副本", async () => {
			let e = (await n.campaign.listManual({
				ownerKey: r.ownerKey,
				ruleId: "dnd5e2014"
			}, "card")).find((e) => e.name === "自检存档");
			VH(e, "找不到第一个存档"), await n.campaign.loadSave(r, e.id), VH((await n.campaign.listAuto(r.ownerKey, "dnd5e2014")).length === 1, "没有写自动存档");
			let t = await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "tom"
			}), i = await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "tom"
			});
			VH(t.created && !i.created, "唯一条目应只有一份"), VH((await n.campaign.materialize(r.ownerKey, {
				packId: "selftest-module",
				entryId: "sp1"
			}, 3)).instances.map((e) => e.label).join("") === "ABC", "批量编号不对");
		}), await s("删除、最近删除、恢复、彻底删除", async () => {
			let [e] = (await n.campaign.listManual({
				ownerKey: r.ownerKey,
				ruleId: "dnd5e2014"
			}, "card")).filter((e) => e.name !== "自检存档");
			await n.campaign.deleteSave(e.id), VH((await n.campaign.listDeleted("dnd5e2014")).length === 1, "最近删除应有 1 个"), await n.campaign.restoreSave(e.id), await n.campaign.deleteSave(e.id), VH(await n.campaign.purgeSaves([e.id]) === 1, "彻底删除失败");
		}), await s("导出存档并导入到另一张卡", async () => {
			await n.campaign.saveCurrent(r.ownerKey);
			let e = (await n.campaign.getWorkspace(r.ownerKey)).currentSaveId, { bytes: t } = await WO({
				db: n.db,
				packs: n.packs,
				now: n.now,
				appVersion: "99.0.0"
			}, {
				type: "save",
				saveId: e
			}, { includePacks: !0 }), o = n.packs.recognize(t);
			VH(o.type === "save" && o.attachedPacks.size === 1, "导出文件内容不对");
			let s = dO(o, a);
			return VH((await mO({
				db: n.db,
				campaign: n.campaign,
				now: n.now,
				hasRule: a
			}, o, {
				owner: i,
				selectedIds: s.map((e) => e.save.id)
			})).imported === 1, "导入数量不对"), `${t.length} 字节`;
		}), await s("完整备份导出与覆盖恢复", async () => {
			let { bytes: e } = await WO({
				db: n.db,
				packs: n.packs,
				now: n.now,
				appVersion: "99.0.0"
			}, { type: "backup" }, { includePacks: !1 }), t = n.packs.recognize(e);
			VH(t.type === "backup" && t.workspaces.length === 1 && t.saves.length >= 3, "备份内容不对"), await n.campaign.updateData(r.ownerKey, (e) => ({
				...e,
				gold: 999
			})), await mO({
				db: n.db,
				campaign: n.campaign,
				now: n.now,
				hasRule: a
			}, t, {
				owner: r,
				selectedIds: [],
				mode: "overwrite"
			}), VH((await n.campaign.getWorkspace(r.ownerKey))?.data.gold === 10, "覆盖恢复后数据不对"), VH((await n.campaign.listAuto(r.ownerKey, "dnd5e2014")).some((e) => e.autoReason === "恢复备份前"), "没有\"恢复备份前\"自动存档");
		}), await s("删除内容包", async () => {
			await n.packs.uninstall("selftest-module"), VH(await n.db.entries.where("packId").equals("selftest-module").count() === 0, "条目未清除");
		});
	} finally {
		n.db.close(), await n.db.delete();
	}
	return t;
}
// src/probes/m1Probe.ts
var WH = "m1", GH = "M1 数据层自检";
function KH() {
	return {
		id: WH,
		title: GH,
		hint: "在独立的临时数据库里走完：安装内容包 → 新存档 → 保存 → 分支 → 读取 → 副本 → 删除与恢复 → 导出导入 → 备份恢复。只用合成数据，结束后自动删除，不影响你的真实数据。",
		actions: [{
			label: "运行 M1 数据层自检",
			run: () => EH(WH, GH, async () => {
				TH(WH, GH, "waiting", "正在运行…");
				let e = await UH((e) => TH(WH, GH, "waiting", `已完成 ${e.name}`)), t = e.find((e) => !e.ok);
				TH(WH, GH, t ? "fail" : "pass", t ? `未通过：${t.name} — ${t.detail ?? ""}` : `全部通过（${e.length}/10 步）`, e.map((e) => `${e.ok ? "✓" : "✗"} ${e.name}${e.detail ? ` — ${e.detail}` : ""}`));
			})
		}]
	};
}
// src/core/m2selftest.ts
var qH = {
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
function JH(e) {
	let t = e.data.src, n = e.data.credit;
	return `出自《${qH[t?.book ?? ""] ?? t?.book ?? "未知"}》第 ${t?.page ?? 0} 页 · 中文：${n?.by ?? "未知"}（${n?.license ?? "未知"}）`;
}
var YH = () => Sb("dnd5e2014-srd");
function XH() {
	return FT({ catalogUrl: "https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@main/catalog.json" });
}
async function ZH(e) {
	let t = [], n = tT({
		dbName: `tavern-trpg-assistant-m2-${vb()}`,
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
			let e = await n.packs.installBuiltin(await YH()), t = await n.db.packs.get("dnd5e2014-srd");
			if (!t) throw Error("内置 SRD 包未安装");
			return o.push(t), `${e}；${t.entryCount} 条，${(t.byteSize / 1024).toFixed(1)} KB`;
		}), await a("从数据仓库下载一个书籍包", async () => {
			let e;
			try {
				e = await pC({ url: XH() });
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
			let r = await mC(t, { catalogUrl: XH() }), i = n.packs.recognize(r);
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
			return { detail: [t, ...r.map((e, t) => `${t + 1}. ${e.name}｜${e.summary}｜${JH(e)}`)].join("\n") };
		}), await a("每种数据做一次导入 → 读取 → 使用 → 导出 → 再导入", async () => {
			let e = await n.packs.list({ ruleId: "dnd5e2014" });
			if (!e.length) throw Error("没有已安装的内容包");
			let t = await n.db.entries.toArray(), r = [...new Set(t.map((e) => e.type))].sort(), i = [], a = [];
			for (let e of r) {
				let r = t.find((t) => t.type === e), o = await n.packs.exportPack(r.packId), s = n.packs.recognize(o), c = s.entries.find((e) => e.id === r.entryId);
				if (!c || gS(c.data) !== gS(r.data)) {
					a.push(`${e}: ${r.entryId} 导出后内容不一致`);
					continue;
				}
				await n.packs.install(s, {
					source: "import",
					resolution: "overwrite"
				});
				let l = await n.db.entries.get([r.packId, r.entryId]);
				!l || gS(l.data) !== gS(r.data) ? a.push(`${e}: ${r.entryId} 再导入后内容不一致`) : i.push(`✓ ${e}：${r.entryId}`);
			}
			let o = e.find((e) => e.content.features.length > 0);
			if (o) {
				let e = gS(o.content.features), t = await n.packs.exportPack(o.id), r = n.packs.recognize(t);
				gS(r.features) !== e && a.push(`功能定义：${o.id} 导出后不一致`), await n.packs.install(r, {
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
var QH = "m2", $H = "M2 数据自检";
function eU() {
	return {
		id: QH,
		title: $H,
		hint: "在临时数据库里安装内置 SRD 包、从数据仓库下载一个书籍包、显示条数与抽样来源、对每种数据做一次往返，最后清理测试数据库。数据仓库尚未发布时下载一步会跳过；只用临时库，不影响真实数据。",
		actions: [{
			label: "运行 M2 数据自检",
			run: () => EH(QH, $H, async () => {
				TH(QH, $H, "waiting", "正在运行…");
				let e = await ZH((e) => TH(QH, $H, "waiting", `已完成 ${e.name}`)), t = e.find((e) => !e.ok), n = e.filter((e) => e.skipped).length;
				TH(QH, $H, t ? "fail" : "pass", t ? `未通过：${t.name} — ${t.detail ?? ""}` : `全部通过（${e.length}/5 步${n ? `，${n} 步跳过` : ""}）`, e.map((e) => `${e.ok ? e.skipped ? "↷" : "✓" : "✗"} ${e.name}${e.detail ? ` — ${e.detail}` : ""}`));
			})
		}]
	};
}
// src/probes/promptScan.ts
var tU = "TRPG-PROBE-COMMENT", nU = "TRPG-PROBE-INJECT";
function rU(e) {
	if (typeof e == "string") return e;
	try {
		return JSON.stringify(e) ?? "";
	} catch (e) {
		return console.error("[trpg-assistant] 请求内容无法序列化", e), "";
	}
}
function iU(e, t) {
	let n = e.indexOf(t);
	if (!(n < 0)) return e.slice(Math.max(0, n - 6), n + t.length + 12);
}
function aU(e, t) {
	let n = e?.chat;
	if (Array.isArray(n)) for (let e = 0; e < n.length; e++) {
		let r = n[e];
		if ((typeof r?.content == "string" ? r.content : rU(r?.content)).includes(t)) return {
			role: String(r.role ?? "?"),
			indexFromEnd: n.length - 1 - e
		};
	}
}
function oU(e) {
	let t = rU(e);
	return {
		length: t.length,
		comment: t.includes(tU),
		commentIntact: t.includes("<!--TRPG-PROBE-COMMENT") && t.includes("-->"),
		inject: t.includes(nU),
		commentSnippet: iU(t, tU),
		injectSnippet: iU(t, nU),
		injectAt: aU(e, nU)
	};
}
// src/probes/llmLogAudit.ts
function sU(e) {
	if (e && typeof e == "object") {
		let t = e;
		return t.id ?? t.key ?? t.logId ?? t.name;
	}
	return e;
}
async function cU() {
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
	let o = oU(await e.getRaw(sU(r)));
	return a.scan = o, a.markers = [tU, nU], {
		status: "info",
		summary: `最近一次请求原文：${o.comment ? `含注释标记${o.commentIntact ? "（符号完整）" : "（符号被改）"}` : "无注释标记"}；${o.inject ? "含注入标记" : "无注入标记"}`,
		detail: a
	};
}
// src/probes/promptProbes.ts
var lU = "comment", uU = "注释是否进入发给 AI 的请求", dU = "inject", fU = "提示词注入是否生效", pU = "input", mU = "写入与读取输入框", hU = "tavern-trpg-assistant_probe", gU = 1, _U = 0;
function vU(e) {
	return e?.dryRun === !0;
}
function yU(e) {
	let t = !1, n = !1, r = "", i = [], a = {}, o = (e) => (t) => {
		i.push({
			event: e,
			dryRun: vU(t),
			...oU(t)
		});
	}, s = () => {
		let e = i.filter((e) => !e.dryRun);
		if (r !== "quiet") {
			if (!e.length) t && TH(lU, uU, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）"), n && TH(dU, fU, "waiting", "这次生成没有捕获到请求事件（模型已连接吗？）");
			else {
				if (t) {
					let n = e.find((e) => e.comment), i = e.some((e) => e.commentIntact);
					TH(lU, uU, n && i ? "pass" : "fail", n ? i ? "注释原样进入了请求（<!-- --> 完整保留）" : "标记文字进入了请求，但 <!-- --> 符号被改动或删除" : "请求中没有找到注释内容（注释被删除）", {
						runType: r,
						captures: e,
						message: a
					}), t = !1;
				}
				if (n) {
					let t = e.find((e) => e.inject);
					TH(dU, fU, t ? "pass" : "fail", t ? `注入文本进入了请求${t.injectAt ? `（${t.injectAt.role} 消息，距末尾 ${t.injectAt.indexFromEnd} 条）` : ""}` : "请求中没有找到注入文本", {
						runType: r,
						captures: e
					}), n = !1, c();
				}
			}
		}
	}, c = () => {
		let t = e.extension_prompt_types?.IN_CHAT ?? gU, n = e.extension_prompt_roles?.SYSTEM ?? _U;
		e.setExtensionPrompt?.(hU, "", t, 0, !1, n);
	}, l = () => {
		let t = h(e, "CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready"), n = h(e, "GENERATE_AFTER_COMBINE_PROMPTS", "generate_after_combine_prompts"), c = h(e, "GENERATE_AFTER_DATA", "generate_after_data");
		g(e, t, o(t)), g(e, n, o(n)), g(e, c, o(c)), g(e, h(e, "GENERATION_STARTED", "generation_started"), (e, t, n) => {
			n !== !0 && (r = String(e ?? ""), i = []);
		});
		let l = () => s();
		g(e, h(e, "GENERATION_ENDED", "generation_ended"), l), g(e, h(e, "GENERATION_STOPPED", "generation_stopped"), l), g(e, h(e, "MESSAGE_SENT", "message_sent"), (t) => {
			let n = e.chat[Number(t)];
			a.storedInChat = !!n?.mes?.includes(tU);
		}), g(e, h(e, "USER_MESSAGE_RENDERED", "user_message_rendered"), (e) => {
			let t = document.querySelector(`.mes[mesid="${Number(e)}"] .mes_text`);
			t && (a.visibleTextHasMarker = !!t.textContent?.includes(tU), a.htmlHasComment = t.innerHTML.includes(`<!--${tU}`));
		});
	}, u = {
		id: lU,
		title: uU,
		hint: "点「写入测试注释」后，自己发送这条消息（需要已连接模型）。发送完成后自动判定；楼层里应看不到注释文字。",
		actions: [{
			label: "写入测试注释到输入框",
			run: () => EH(lU, uU, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let n = `<!--${tU} 探针-->`;
				_(e, e.value ? `${e.value}\n${n}` : `测试 ${n}`), t = !0, TH(lU, uU, "waiting", "已写入。请发送这条消息，等 AI 回复结束后自动判定");
			})
		}]
	};
	u.actions.push({
		label: "从 TauriTavern 请求日志核对",
		run: () => EH(lU, uU, async () => {
			let e = await cU();
			TH(lU, uU, e.status, e.summary, {
				runType: r,
				audit: e.detail,
				message: a
			});
		})
	});
	let d = {
		id: dU,
		title: fU,
		hint: "点「注入探针」后发送任意消息。可以和上一项同一次发送完成判定。测完请点「清除注入」。",
		actions: [{
			label: "注入探针",
			run: () => EH(dU, fU, () => {
				if (!e.setExtensionPrompt) throw Error("宿主没有 setExtensionPrompt");
				let t = e.extension_prompt_types?.IN_CHAT ?? gU, r = e.extension_prompt_roles?.SYSTEM ?? _U;
				e.setExtensionPrompt(hU, `[${nU}] 这是探针注入文本`, t, 0, !1, r), n = !0, TH(dU, fU, "waiting", "已注入（IN_CHAT，深度 0）。请发送一条消息，判定后会自动清除", { enumsFromContext: !!e.extension_prompt_types });
			})
		}, {
			label: "清除注入",
			run: () => EH(dU, fU, () => {
				c(), n = !1, TH(dU, fU, "idle", "已清除注入");
			})
		}]
	}, p = {
		id: pU,
		title: mU,
		hint: "自动写入一段文字、读回校验，然后恢复原内容（不会发送）。",
		actions: [{
			label: "运行输入框测试",
			run: () => EH(pU, mU, () => {
				let e = f();
				if (!e) throw Error("找不到输入框");
				let t = e.value, n = `${t}[TRPG-PROBE-INPUT]`;
				_(e, n);
				let r = e.value;
				_(e, t);
				let i = e.value === t;
				TH(pU, mU, r === n && i ? "pass" : "fail", r === n ? i ? "写入、读回、恢复都正常" : "写入正常，但恢复失败" : "写入后读回的内容不一致", {
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
var bU = "storage", xU = "本地存储与持久性", SU = `${u}-m0`, CU = 4194304;
function wU() {
	return new Promise((e, t) => {
		let n = indexedDB.open(SU, 1);
		n.onupgradeneeded = () => n.result.createObjectStore("kv"), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
	});
}
function TU(e, t, n) {
	return new Promise((r, i) => {
		let a = n(e.transaction("kv", t).objectStore("kv"));
		a.onsuccess = () => r(a.result), a.onerror = () => i(a.error);
	});
}
function EU(e) {
	let t = () => EH(bU, xU, async () => {
		let t = await wU(), n = await TU(t, "readonly", (e) => e.get("boot")), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			count: (n?.count ?? 0) + 1,
			firstAt: n?.firstAt ?? r,
			lastAt: r
		};
		await TU(t, "readwrite", (e) => e.put(i, "boot"));
		let a = !!await TU(t, "readonly", (e) => e.get("blob"));
		a || await TU(t, "readwrite", (e) => e.put(new Uint8Array(CU), "blob"));
		let o = await TU(t, "readonly", (e) => e.get("blob"));
		t.close();
		let s = await navigator.storage?.persisted?.() ?? null, c = await navigator.storage?.estimate?.() ?? null, l = e.extensionSettings[u] ??= {}, d = Number(l.probeBootCount ?? 0);
		l.probeBootCount = d + 1, e.saveSettingsDebounced(), TH(bU, xU, "info", `IndexedDB 第 ${i.count} 次启动读写正常；刷新页面后次数应增加`, {
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
		id: bU,
		title: xU,
		hint: "每次启动自动读写 IndexedDB（含 4MB 数据）与扩展设置。完全退出再打开应用后，启动次数应继续累加，4MB 数据应已存在。",
		actions: [{
			label: "重新检测",
			run: t
		}],
		start: t
	};
}
// src/probes/tauriProbe.ts
var DU = "tauri", OU = "TauriTavern 扩展接口", kU = `${u}-m0`, AU = "/scripts/tauritavern/layout-kit.js", jU = [
	"current",
	"getCurrent",
	"active",
	"handle",
	"currentChat"
];
function MU(e, t) {
	if (typeof e == "function") return "function";
	if (typeof e != "object" || !e) return typeof e;
	if (t <= 0) return "object";
	let n = {};
	for (let r of Object.keys(e)) n[r] = MU(e[r], t - 1);
	return n;
}
async function NU(e, t) {
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
function PU(e) {
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
function FU(e) {
	let t = e;
	return t.ok ? {
		ok: !0,
		shape: PU(t.value)
	} : t;
}
async function IU(e) {
	if (typeof e.searchMessages == "function" || e.store) return {
		handle: e,
		via: "api.chat 本身"
	};
	let t = e.current;
	if (t && typeof t.handle == "function") {
		let e = await NU("api.chat.current.handle()", () => t.handle.call(t));
		if (e.ok && e.value && typeof e.value == "object") return {
			handle: e.value,
			via: "api.chat.current.handle()"
		};
	}
	for (let t of jU) {
		let n = e[t];
		if (typeof n == "function") {
			let r = await NU(`api.chat.${t}()`, () => n.call(e)), i = r.value;
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
function LU() {
	let e = () => EH(DU, OU, async () => {
		if (!window.__TAURITAVERN__) {
			TH(DU, OU, "info", "不是 TauriTavern，跳过（扩展将使用酒馆通用能力）");
			return;
		}
		let e = (await m())?.api ?? {}, t = e.chat ?? {}, n = { apiShape: MU(e, 3) };
		n.layoutKitExports = await NU("layout-kit 导入", () => import(
			/* @vite-ignore */
			AU
).then((e) => Object.keys(e)));
		let { handle: r, via: i } = await IU(t);
		if (n.handleVia = i, r) {
			let e = r;
			n.handleShape = MU(r, 2), e.searchMessages && (n.searchMessages = FU(await NU("searchMessages", () => e.searchMessages({
				query: "你",
				limit: 3
			}))));
			let t = e.locate?.findLastMessage;
			if (t && (n.findLastMessage = FU(await NU("findLastMessage", () => t.call(e.locate, {
				role: "user",
				scanLimit: 50
			})))), e.store?.setJson && e.store.getJson) {
				let t = { at: (/* @__PURE__ */ new Date()).toISOString() };
				n.storeSet = await NU("store.setJson", () => e.store.setJson({
					namespace: kU,
					key: "probe",
					value: t
				})), n.storeGet = await NU("store.getJson", () => e.store.getJson({
					namespace: kU,
					key: "probe"
				})), e.store.listKeys && (n.storeKeys = await NU("store.listKeys", () => e.store.listKeys({ namespace: kU }))), e.store.deleteJson && (n.storeDelete = await NU("store.deleteJson", () => e.store.deleteJson({
					namespace: kU,
					key: "probe"
				})));
			}
			e.metadata?.get && (n.metadata = FU(await NU("metadata.get", () => e.metadata.get()))), typeof e.stableId == "function" && (n.stableId = FU(await NU("stableId", () => e.stableId.call(e)))), typeof e.summary == "function" && (n.summary = FU(await NU("summary", () => e.summary.call(e))));
		}
		let a = e.extension?.store;
		if (a?.setJson && a.getJson) {
			let e = { at: (/* @__PURE__ */ new Date()).toISOString() }, t = {
				namespace: kU,
				key: "probe"
			};
			n.extStoreSet = await NU("extension.store.setJson", () => a.setJson({
				...t,
				value: e
			})), n.extStoreGet = await NU("extension.store.getJson", () => a.getJson(t)), a.listKeys && (n.extStoreKeys = await NU("extension.store.listKeys", () => a.listKeys({ namespace: kU }))), a.deleteJson && (n.extStoreDelete = await NU("extension.store.deleteJson", () => a.deleteJson(t)));
		}
		TH(DU, OU, "info", r ? `找到 handle（${i}）；各接口调用结果见详情` : "没有找到获取 handle 的方式；接口结构见详情", n);
	});
	return {
		id: DU,
		title: OU,
		hint: "仅 TauriTavern 有效。请分别在「已打开聊天」和「未打开聊天」两种状态下点「重新检测」各测一次。",
		actions: [{
			label: "重新检测",
			run: e
		}],
		start: e
	};
}
// src/probes/index.ts
function RU(e) {
	return [
		KH(),
		eU(),
		MH(e),
		...yU(e),
		EU(e),
		BH(e),
		IH(e),
		LU()
	];
}
// src/ui/views/LabModalPage.vue?vue&type=script&setup=true&lang.ts
var zU = ["data-testid"], BU = { class: "trpg-list" }, VU = /* @__PURE__ */ L({
	__name: "LabModalPage",
	props: { level: {} },
	setup(e) {
		let t = e, n = nD();
		function r() {
			n.push({
				key: `lab:${t.level + 1}`,
				title: `第 ${t.level + 1} 页`,
				component: Cn(VU),
				props: { level: t.level + 1 }
			});
		}
		async function i() {
			await DD({
				title: "测试确认",
				message: "这是弹窗内的确认页，「‹」或 Esc 即取消。",
				confirmLabel: "确认"
			});
		}
		return (t, n) => (V(), H("div", {
			class: "page-stack",
			"data-testid": `lab-page-${e.level}`
		}, [
			W("p", null, [
				K("这是演示弹窗的第 " + j(e.level) + " 页。点下面的术语在", 1),
				G(wI, { onOpen: r }, {
					default: I(() => [...n[0] ||= [K("同一个弹窗里", -1)]]),
					_: 1
				}),
				n[1] ||= K("前进一页。", -1)
			]),
			W("ul", BU, [(V(), H(B, null, R(30, (e) => W("li", {
				key: e,
				class: "trpg-row"
			}, [W("span", null, "演示行 " + j(e), 1)])), 64))]),
			W("button", {
				class: "trpg-btn",
				type: "button",
				onClick: i
			}, "弹窗内确认")
		], 8, zU));
	}
}), HU = { class: "probe" }, UU = { class: "lab" }, WU = { class: "lab__row" }, GU = {
	class: "probe__hint",
	"data-testid": "select-model"
}, KU = { class: "lab__row" }, qU = { class: "trpg-check" }, JU = { class: "lab__row" }, YU = { class: "trpg-row" }, XU = { class: "trpg-row__main" }, ZU = { "data-testid": "switch-state" }, QU = {
	class: "probe__hint",
	"data-testid": "menu-pick"
}, $U = { class: "probe__actions" }, eW = { class: "probe__head" }, tW = { class: "probe__title" }, nW = ["data-status"], rW = { class: "probe__hint" }, iW = { class: "probe__actions" }, aW = ["onClick"], oW = ["onClick"], sW = /* @__PURE__ */ L({
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
		], n = /* @__PURE__ */ P(""), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P("a"), a = /* @__PURE__ */ P(!1), o = /* @__PURE__ */ P(""), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(""), l = nD(), u = iE();
		function d() {
			l.open({
				key: "lab:1",
				title: "演示弹窗",
				component: Cn(VU),
				props: { level: 1 }
			});
		}
		async function f() {
			let e = await DD({
				title: "卸载演示",
				message: "确定要卸载吗？",
				confirmLabel: "卸载",
				danger: !0
			});
			u.info(e ? "已确认" : "已取消");
		}
		function p(e, t, n) {
			TH(e, t, n, n === "pass" ? "人工确认：通过" : "人工确认：不通过");
		}
		return (e, l) => (V(), H("section", HU, [
			l[14] ||= W("h3", { class: "probe__title" }, "界面实测（需要你目测后点结果）", -1),
			W("div", UU, [
				W("div", WU, [
					G(JL, {
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
					W("p", GU, "下拉当前值：" + j(n.value || "未选") + " / " + j(r.value || "未选"), 1),
					G(JL, {
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
				W("div", KU, [
					G(_E, {
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
					W("label", qU, [Fr(W("input", {
						"onUpdate:modelValue": l[3] ||= (e) => a.value = e,
						type: "checkbox"
					}, null, 512), [[hu, a.value]]), l[10] ||= K(" 勾选框测试", -1)]),
					Fr(W("input", {
						"onUpdate:modelValue": l[4] ||= (e) => o.value = e,
						class: "trpg-input",
						type: "text",
						placeholder: "输入测试：中文 / English"
					}, null, 512), [[mu, o.value]])
				]),
				W("div", JU, [
					W("div", YU, [
						W("span", XU, [l[11] ||= K("开关演示：", -1), W("span", ZU, j(s.value ? "开" : "关"), 1)]),
						G(kV, {
							modelValue: s.value,
							"onUpdate:modelValue": l[5] ||= (e) => s.value = e,
							label: "演示开关"
						}, null, 8, ["modelValue"]),
						G(rF, {
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
					W("p", QU, "菜单选择：" + j(c.value || "无"), 1),
					W("p", null, [l[13] ||= K("下划线术语：", -1), G(wI, { onOpen: d }, {
						default: I(() => [...l[12] ||= [K("点我打开演示弹窗", -1)]]),
						_: 1
					})]),
					W("div", $U, [
						W("button", {
							class: "trpg-btn",
							type: "button",
							onClick: f
						}, "危险确认"),
						W("button", {
							class: "trpg-btn",
							type: "button",
							onClick: l[7] ||= (e) => F(u).success("已保存")
						}, "成功提示"),
						W("button", {
							class: "trpg-btn",
							type: "button",
							onClick: l[8] ||= (e) => F(u).undoable("已删除一项", () => {
								F(u).info("已撤销");
							})
						}, "可撤销提示"),
						W("button", {
							class: "trpg-btn",
							type: "button",
							onClick: l[9] ||= (e) => F(u).error("下载失败：网络中断")
						}, "失败提示")
					])
				])
			]),
			(V(), H(B, null, R(t, (e) => W("div", {
				key: e.id,
				class: "probe"
			}, [
				W("div", eW, [W("h4", tW, j(e.title), 1), W("span", {
					class: "trpg-badge",
					"data-status": F(wH)[e.id]?.status ?? "idle"
				}, j(F(wH)[e.id]?.status ?? "待测"), 9, nW)]),
				W("p", rW, j(e.how), 1),
				W("div", iW, [W("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => p(e.id, e.title, "pass")
				}, "通过", 8, aW), W("button", {
					class: "trpg-btn",
					type: "button",
					onClick: (t) => p(e.id, e.title, "fail")
				}, "不通过", 8, oW)])
			])), 64))
		]));
	}
}), cW = { class: "probe__head" }, lW = { class: "probe__title" }, uW = ["data-status"], dW = { class: "probe__hint" }, fW = {
	key: 0,
	class: "probe__summary"
}, pW = { class: "probe__actions" }, mW = ["onClick"], hW = { key: 1 }, gW = { class: "report-bar" }, _W = { role: "status" }, vW = /* @__PURE__ */ L({
	__name: "ProbeList",
	props: { ctx: {} },
	setup(e) {
		let t = e.ctx, n = RU(t), r = /* @__PURE__ */ P("");
		async function i() {
			return JSON.stringify(DH(await jH(t)), null, 2);
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
		return (e, t) => (V(), H("div", null, [
			(V(!0), H(B, null, R(F(n), (e) => (V(), H("section", {
				key: e.id,
				class: "probe"
			}, [
				W("div", cW, [W("h3", lW, j(e.title), 1), W("span", {
					class: "trpg-badge",
					"data-status": F(wH)[e.id]?.status ?? "idle"
				}, j(F(wH)[e.id]?.status ?? "待测"), 9, uW)]),
				W("p", dW, j(e.hint), 1),
				F(wH)[e.id] ? (V(), H("p", fW, j(F(wH)[e.id].summary), 1)) : q("", !0),
				W("div", pW, [(V(!0), H(B, null, R(e.actions, (e) => (V(), H("button", {
					key: e.label,
					class: "trpg-btn",
					type: "button",
					onClick: (t) => e.run()
				}, j(e.label), 9, mW))), 128))]),
				F(wH)[e.id]?.detail === void 0 ? q("", !0) : (V(), H("details", hW, [t[2] ||= W("summary", null, "详情", -1), W("pre", null, j(JSON.stringify(F(wH)[e.id].detail, null, 2)), 1)]))
			]))), 128)),
			G(sW),
			W("div", gW, [
				W("button", {
					class: "trpg-btn trpg-btn--primary",
					type: "button",
					onClick: t[0] ||= (e) => a()
				}, "复制测试报告"),
				W("button", {
					class: "trpg-btn",
					type: "button",
					onClick: t[1] ||= (e) => o()
				}, "保存报告到扩展设置"),
				W("span", _W, j(r.value), 1)
			])
		]));
	}
}), yW = {
	key: 0,
	class: "page-stack"
}, bW = { class: "trpg-list" }, xW = { class: "trpg-row" }, SW = { class: "trpg-row" }, CW = { class: "trpg-row__main" }, wW = { class: "trpg-row__meta" }, TW = { key: 1 }, EW = {
	key: 0,
	class: "trpg-diag",
	"data-testid": "diagnostics"
}, DW = {
	key: 1,
	class: "page-stack"
}, OW = { class: "trpg-group" }, kW = /* @__PURE__ */ L({
	__name: "SettingsView",
	setup(e) {
		let t = Rr("stCtx"), n = /* @__PURE__ */ P(null);
		return (e, r) => n.value === null ? (V(), H("div", yW, [W("ul", bW, [W("li", xW, [r[4] ||= W("div", { class: "trpg-row__main" }, [W("div", { class: "trpg-row__title" }, "诊断"), W("div", { class: "trpg-row__meta" }, "自检与兼容性测试，遇到问题时用来收集信息")], -1), W("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[0] ||= (e) => n.value = "diag"
		}, [r[3] ||= K("打开", -1), G(mE, {
			name: "caret-right",
			size: 14
		})])]), W("li", SW, [W("div", CW, [r[5] ||= W("div", { class: "trpg-row__title" }, "关于", -1), W("div", wW, "版本 " + j(F(eT)) + " · 开源许可与致谢", 1)]), W("button", {
			class: "trpg-btn",
			type: "button",
			onClick: r[1] ||= (e) => n.value = "about"
		}, [r[6] ||= K("打开", -1), G(mE, {
			name: "caret-right",
			size: 14
		})])])])])) : (V(), H("div", TW, [W("button", {
			class: "subpage-back",
			type: "button",
			onClick: r[2] ||= (e) => n.value = null
		}, [G(mE, {
			name: "caret-left",
			size: 16
		}), r[7] ||= K("设置", -1)]), n.value === "diag" ? (V(), H("div", EW, [F(t) ? (V(), U(vW, {
			key: 0,
			ctx: F(t)
		}, null, 8, ["ctx"])) : q("", !0)])) : (V(), H("div", DW, [
			W("h2", OW, "TRPG 跑团助手 " + j(F(eT)), 1),
			r[8] ||= W("p", { class: "page-intro" }, "代码以 AGPL-3.0 许可发布，源码在 GitHub：didhogg/tavern-trpg-assistant。", -1),
			r[9] ||= W("p", { class: "page-intro" }, "界面图标：Phosphor Icons（MIT）。规则数据的来源与许可见各条目的出处标注与随包附带的数据声明。", -1)
		]))]));
	}
}), AW = { class: "trpg-head__chips" }, jW = { class: "trpg-chip__name" }, MW = /* @__PURE__ */ L({
	__name: "HeaderChips",
	props: { layout: {} },
	setup(e) {
		let t = e, n = IT(), r = RT(), i = iE(), a = sE(), o = J(() => n.booted && r.hasCampaign), s = J(() => [...o.value ? [{
			key: "saves",
			label: "存档"
		}] : [], {
			key: "close",
			label: "收起助手"
		}]), c = J(() => r.currentSave?.name ?? "存档");
		function l(e) {
			e === "saves" ? bz() : a.windowOpen = !1;
		}
		let u = () => i.info("另一个窗口正在使用这份数据，这里只能查看");
		return (e, n) => (V(), H("div", AW, [o.value ? (V(), H(B, { key: 0 }, [
			t.layout === "narrow" ? q("", !0) : (V(), H("button", {
				key: 0,
				class: "trpg-pill trpg-chip",
				type: "button",
				"data-testid": "save-chip",
				"aria-haspopup": "dialog",
				onClick: n[0] ||= (...e) => F(bz) && F(bz)(...e)
			}, [W("span", jW, j(c.value), 1), G(mE, {
				name: "caret-down",
				size: 14
			})])),
			F(r).dirty && !F(r).readOnly ? (V(), H("button", {
				key: 1,
				class: "trpg-btn trpg-btn--small trpg-btn--primary",
				type: "button",
				"data-testid": "save-button",
				onClick: n[1] ||= (e) => F(Sz)()
			}, "● 保存")) : q("", !0),
			F(r).readOnly ? (V(), H("button", {
				key: 2,
				class: "trpg-badge trpg-badge--button",
				"data-tone": "warn",
				type: "button",
				onClick: u
			}, "只读")) : q("", !0)
		], 64)) : q("", !0), t.layout === "narrow" ? (V(), U(rF, {
			key: 1,
			label: "助手",
			items: s.value,
			onSelect: l
		}, null, 8, ["items"])) : q("", !0)]));
	}
}), NW = "trpg-assistant:window";
function PW(e, t, n) {
	let r = Math.min(Math.max(e.w, 360), Math.max(360, t)), i = Math.min(Math.max(e.h, 480), Math.max(480, n));
	return {
		w: r,
		h: i,
		x: Math.min(Math.max(e.x, 0), Math.max(0, t - r)),
		y: Math.min(Math.max(e.y, 0), Math.max(0, n - i))
	};
}
function FW(e, t) {
	let n = Math.min(960, e - 32), r = Math.min(640, t - 32);
	return PW({
		w: n,
		h: r,
		x: Math.round((e - n) / 2),
		y: Math.round((t - r) / 2)
	}, e, t);
}
function IW(e, t) {
	try {
		let n = localStorage.getItem(NW);
		if (n) {
			let r = JSON.parse(n);
			if ([
				r.x,
				r.y,
				r.w,
				r.h
			].every(Number.isFinite)) return PW(r, e, t);
		}
	} catch (e) {
		console.warn("[trpg-assistant] 读取窗口位置失败", e);
	}
	return FW(e, t);
}
function LW(e) {
	try {
		localStorage.setItem(NW, JSON.stringify(e));
	} catch (e) {
		console.warn("[trpg-assistant] 保存窗口位置失败", e);
	}
}
// src/ui/shell/MainWindow.vue?vue&type=script&setup=true&lang.ts
var RW = ["data-layout", "data-fullscreen"], zW = ["inert"], BW = {
	key: 0,
	class: "trpg-side",
	"aria-label": "主导航"
}, VW = {
	key: 0,
	class: "trpg-side__name"
}, HW = { class: "trpg-side__list" }, UW = [
	"aria-current",
	"title",
	"onClick"
], WW = { key: 0 }, GW = { class: "trpg-side__list trpg-side__bottom" }, KW = [
	"aria-current",
	"title",
	"onClick"
], qW = { key: 0 }, JW = { class: "trpg-main" }, YW = { class: "trpg-head__title" }, XW = { class: "trpg-body" }, ZW = {
	class: "trpg-content",
	tabindex: "-1"
}, QW = ["aria-pressed"], $W = {
	key: 0,
	class: "trpg-tabs",
	"aria-label": "主导航"
}, eG = ["aria-current", "onClick"], tG = /* @__PURE__ */ L({
	__name: "MainWindow",
	setup(e) {
		let t = sE(), n = nD(), r = [
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
			home: Hz,
			library: CH,
			settings: kW
		}, a = /* @__PURE__ */ P(window.innerWidth), o = /* @__PURE__ */ P(window.innerHeight), s = /* @__PURE__ */ P(IW(a.value, o.value)), c = /* @__PURE__ */ P(null), l = /* @__PURE__ */ P(s.value.w), u = J(() => a.value <= 480), d = J(() => l.value >= 720 ? "wide" : l.value > 480 ? "mid" : "narrow"), f = J(() => u.value ? {} : {
			left: `${s.value.x}px`,
			top: `${s.value.y}px`,
			width: `${s.value.w}px`,
			height: `${s.value.h}px`
		}), p = J(() => oE[t.page]), m = J(() => r.filter((e) => !e.bottom)), h = J(() => r.filter((e) => e.bottom)), g = xE({
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
			onEnd: () => LW(s.value)
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
				t.removeEventListener("pointermove", c), t.removeEventListener("pointerup", l), t.removeEventListener("pointercancel", l), LW(s.value);
			};
			t.addEventListener("pointermove", c), t.addEventListener("pointerup", l), t.addEventListener("pointercancel", l);
		}
		function y() {
			a.value = window.innerWidth, o.value = window.innerHeight, s.value = PW(s.value, a.value, o.value);
		}
		function b(e) {
			(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s" && (e.preventDefault(), Sz());
		}
		let x;
		return ga(() => {
			window.addEventListener("resize", y), x = new ResizeObserver((e) => {
				let t = e[0]?.contentRect.width;
				t && (l.value = t);
			}), c.value && x.observe(c.value);
		}), ya(() => {
			window.removeEventListener("resize", y), x?.disconnect();
		}), (e, a) => (V(), H("section", {
			ref_key: "winEl",
			ref: c,
			class: "trpg-window",
			style: ke(f.value),
			"data-layout": d.value,
			"data-fullscreen": u.value,
			role: "dialog",
			"aria-label": "TRPG 跑团助手",
			onKeydown: b
		}, [
			W("div", {
				class: "trpg-shell",
				inert: F(n).isOpen
			}, [d.value === "narrow" ? q("", !0) : (V(), H("nav", BW, [
				W("div", {
					class: "trpg-side__brand",
					title: "拖动窗口",
					onPointerdown: _
				}, [G(mE, {
					name: "dice-five",
					size: 22
				}), d.value === "wide" ? (V(), H("span", VW, "TRPG 跑团助手")) : q("", !0)], 32),
				W("ul", HW, [(V(!0), H(B, null, R(m.value, (e) => (V(), H("li", { key: e.id }, [W("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": F(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => F(t).go(e.id)
				}, [G(mE, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (V(), H("span", WW, j(e.label), 1)) : q("", !0)], 8, UW)]))), 128))]),
				W("ul", GW, [(V(!0), H(B, null, R(h.value, (e) => (V(), H("li", { key: e.id }, [W("button", {
					class: "trpg-nav",
					type: "button",
					"aria-current": F(t).page === e.id ? "page" : void 0,
					title: e.label,
					onClick: (n) => F(t).go(e.id)
				}, [G(mE, {
					name: e.icon,
					size: 20
				}, null, 8, ["name"]), d.value === "wide" ? (V(), H("span", qW, j(e.label), 1)) : q("", !0)], 8, KW)]))), 128))])
			])), W("div", JW, [
				W("header", {
					class: "trpg-head",
					onPointerdown: a[1] ||= (e) => d.value === "narrow" ? _(e) : void 0
				}, [
					W("h1", YW, j(p.value), 1),
					G(MW, { layout: d.value }, null, 8, ["layout"]),
					d.value === "narrow" ? q("", !0) : (V(), H("button", {
						key: 0,
						class: "trpg-icon-btn",
						type: "button",
						"aria-label": "收起助手",
						onClick: a[0] ||= (e) => F(t).windowOpen = !1
					}, [G(mE, {
						name: "x",
						size: 18
					})]))
				], 32),
				W("div", XW, [W("main", ZW, [(V(), U(ka(i[F(t).page])))]), W("button", {
					class: "trpg-dice-btn",
					type: "button",
					"aria-label": "掷骰",
					"aria-pressed": F(t).diceOpen,
					onClick: a[2] ||= (e) => F(t).diceOpen = !F(t).diceOpen
				}, [G(mE, {
					name: "dice-five",
					size: 28
				})], 8, QW)]),
				d.value === "narrow" ? (V(), H("nav", $W, [(V(), H(B, null, R(r, (e) => W("button", {
					key: e.id,
					class: "trpg-tab",
					type: "button",
					"aria-current": F(t).page === e.id ? "page" : void 0,
					onClick: (n) => F(t).go(e.id)
				}, [G(mE, {
					name: e.icon,
					size: 22
				}, null, 8, ["name"]), W("span", null, j(e.label), 1)], 8, eG)), 64))])) : q("", !0)
			])], 8, zW),
			G(cD),
			u.value ? q("", !0) : (V(), H("div", {
				key: 0,
				class: "trpg-resize",
				"aria-hidden": "true",
				onPointerdown: v
			}, null, 32))
		], 44, RW));
	}
}), nG = { class: "trpg-root" }, rG = /* @__PURE__ */ L({
	__name: "App",
	props: {
		ctx: {},
		portalTarget: {}
	},
	setup(e) {
		let t = e;
		Lr("portalTarget", t.portalTarget), Lr("stCtx", t.ctx);
		let n = sE();
		return (e, t) => (V(), H("div", nG, [
			G(tD),
			F(n).windowOpen ? (V(), U(tG, { key: 0 })) : q("", !0),
			G(QE),
			G(dE)
		]));
	}
}), iG = ".trpg-btn{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);min-height:36px;color:var(--ink);font:inherit;cursor:pointer;white-space:nowrap;justify-content:center;align-items:center;gap:6px;padding:4px 14px;display:inline-flex}.trpg-btn:hover:not(:disabled){border-color:var(--primary)}.trpg-btn:disabled{opacity:.5;cursor:not-allowed}.trpg-btn--primary{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-btn--danger{background:var(--danger);color:#fffcf6;border-color:var(--danger)}.trpg-btn--quiet{background:0 0;border-color:#0000}.trpg-btn--small{min-height:30px;padding:2px 10px;font-size:13px}.trpg-icon-btn{border-radius:var(--radius-sm);min-width:36px;min-height:36px;color:inherit;cursor:pointer;background:0 0;border:1px solid #0000;justify-content:center;align-items:center;display:inline-flex}.trpg-icon-btn:hover{border-color:currentColor}.trpg-input{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);padding:4px 10px}.trpg-input:disabled{opacity:.6}textarea.trpg-input{resize:vertical;min-height:72px}.trpg-field{gap:4px;display:grid}.trpg-field__label{color:var(--ink-2);font-size:13px}.trpg-field__hint{color:var(--ink-2);font-size:12.5px}.trpg-field__error{color:var(--danger);font-size:12.5px}.trpg-select-trigger{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);width:100%;min-height:36px;color:var(--ink);cursor:pointer;justify-content:space-between;align-items:center;gap:8px;padding:4px 10px;display:inline-flex}.trpg-select-content,.trpg-menu{min-width:var(--reka-select-trigger-width,160px);background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);box-shadow:var(--shadow-float);z-index:100003;color:var(--ink)}.trpg-select-content{max-height:min(8 * 36px, var(--reka-select-content-available-height));overflow:hidden}.trpg-select-viewport{max-height:inherit;padding:4px;overflow-y:auto}.trpg-select-item,.trpg-menu__item{border-radius:var(--radius-xs);cursor:pointer;min-height:40px;color:var(--ink);justify-content:space-between;align-items:center;gap:12px;padding:4px 10px;display:flex}.trpg-menu{min-width:168px;padding:4px}.trpg-select-item[data-highlighted],.trpg-menu__item[data-highlighted]{background:var(--panel);outline:none}.trpg-select-item[data-state=checked]{color:var(--primary);font-weight:600}.trpg-menu__item--danger{color:var(--danger)}.trpg-menu__item[data-disabled]{opacity:.5;cursor:not-allowed}.trpg-menu__reason{color:var(--ink-2);font-size:12px}.trpg-seg{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);display:inline-flex;overflow:hidden}.trpg-seg button{min-height:34px;color:var(--ink);background:0 0;border:0;padding:2px 14px}.trpg-seg button+button{border-left:1px solid var(--line)}.trpg-seg button[aria-pressed=true]{background:var(--primary);color:var(--primary-ink)}.trpg-badge{border-radius:var(--radius-xs);background:var(--panel);border:1px solid var(--line);color:var(--ink-2);white-space:nowrap;padding:0 8px;font-size:12px;font-weight:600;line-height:20px;display:inline-block}.trpg-badge[data-tone=ok],.trpg-badge[data-status=pass]{color:var(--ok);border-color:var(--ok)}.trpg-badge[data-tone=danger],.trpg-badge[data-status=fail],.trpg-badge[data-status=error]{color:var(--danger);border-color:var(--danger)}.trpg-badge[data-tone=warn],.trpg-badge[data-status=waiting]{color:var(--unsaved);border-color:var(--unsaved)}.trpg-badge[data-tone=gold]{color:var(--gold);border-color:var(--gold)}.trpg-pill{border:1px solid var(--line);background:var(--card);border-radius:999px;align-items:center;gap:4px;min-height:30px;padding:0 12px;display:inline-flex}.trpg-switch-wrap{color:var(--ink-2);align-items:center;gap:6px;min-height:44px;display:inline-flex}.trpg-switch{border:2px solid var(--line);background:0 0;border-radius:999px;width:42px;height:24px;padding:0;transition:background .16s,border-color .16s;position:relative}.trpg-switch__thumb{background:var(--ink-2);border-radius:50%;width:16px;height:16px;transition:transform .16s,background .16s;position:absolute;top:2px;left:2px}.trpg-switch[data-on=true]{background:var(--primary);border-color:var(--primary)}.trpg-switch[data-on=true] .trpg-switch__thumb{background:var(--primary-ink);transform:translate(18px)}.trpg-switch:disabled{opacity:.55;cursor:not-allowed}.trpg-check{cursor:pointer;align-items:center;gap:8px;min-height:36px;display:inline-flex}.trpg-check[data-disabled=true]{opacity:.6;cursor:not-allowed}.trpg-check input{width:18px;height:18px;accent-color:var(--primary);flex:none;margin:0}.trpg-term{color:var(--ink);text-align:left;text-underline-offset:4px;cursor:pointer;background:0 0;border:0;padding:0;-webkit-text-decoration:underline dotted;text-decoration:underline dotted;text-decoration-thickness:1.5px;display:inline}.trpg-term:hover,.trpg-term:focus-visible{text-decoration-style:solid;-webkit-text-decoration-color:var(--gold);text-decoration-color:var(--gold)}.trpg-list{margin:0;padding:0;list-style:none}.trpg-row{border-bottom:1px solid var(--line);align-items:center;gap:12px;min-height:52px;padding:6px 4px;display:flex}.trpg-row__main{flex:1;min-width:0}.trpg-row__title{overflow-wrap:anywhere;font-weight:600}.trpg-row__meta{color:var(--ink-2);font-size:12.5px}.trpg-row__end{flex:none;align-items:center;gap:8px;display:flex}.trpg-group{font-family:var(--font-serif);color:var(--ink-2);margin:16px 0 4px;font-size:15px}.trpg-skeleton{background:linear-gradient(90deg, var(--panel), var(--line), var(--panel));opacity:.6;border-radius:4px;height:14px}.trpg-empty{text-align:center;color:var(--ink-2);padding:24px 8px}.trpg-progress{background:var(--panel);border-radius:3px;width:120px;height:6px;overflow:hidden}.trpg-progress>span{background:var(--primary);height:100%;transition:width .2s;display:block}.trpg-icon{vertical-align:-3px;flex:none}.trpg-toasts{left:50%;bottom:max(16px, env(safe-area-inset-bottom));z-index:100005;gap:8px;width:min(92vw,420px);display:grid;position:fixed;transform:translate(-50%)}.trpg-toast{border-radius:var(--radius-sm);background:var(--chrome);color:var(--chrome-ink);border-left:4px solid var(--gold);box-shadow:var(--shadow-float);align-items:center;gap:10px;padding:10px 12px;display:flex}.trpg-toast[data-kind=error]{border-left-color:var(--danger)}.trpg-toast[data-kind=success]{border-left-color:var(--ok)}.trpg-toast__text{flex:1}.trpg-toast button{color:var(--gold);background:0 0;border:0;min-height:32px;padding:0 8px;font-weight:600}@media (width<=480px){.trpg-toasts{bottom:calc(64px + env(safe-area-inset-bottom))}}.trpg-toast-enter-from,.trpg-toast-leave-to{opacity:0;transform:translateY(8px)}.trpg-toast-enter-active,.trpg-toast-leave-active{transition:opacity .16s,transform .16s}.trpg-modal-root{pointer-events:none;z-index:20;position:absolute;inset:0}.trpg-modal{background:var(--scrim);pointer-events:auto;justify-content:center;align-items:center;padding:16px;display:flex;position:absolute;inset:0}.trpg-modal__card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:min(640px,100%);height:min(80%,640px);box-shadow:var(--shadow-float);flex-direction:column;animation:.16s ease-out trpg-pop;display:flex;overflow:hidden}.trpg-modal[data-variant=drawer]{justify-content:flex-end;padding:0}.trpg-modal[data-variant=drawer] .trpg-modal__card{border-radius:0;width:min(440px,100%);height:100%;animation:.2s ease-out trpg-slide}.trpg-modal[data-variant=confirm] .trpg-modal__card{width:min(440px,100%);height:auto;max-height:90%}.trpg-modal[data-variant=confirm] .trpg-modal__page{position:relative}.trpg-modal__head{border-bottom:1px solid var(--line);background:var(--panel);flex:none;align-items:center;gap:8px;min-height:52px;padding:4px 8px 4px 16px;display:flex}.trpg-modal__title{min-width:0;font-family:var(--font-serif);text-overflow:ellipsis;white-space:nowrap;flex:1;margin:0;font-size:17px;overflow:hidden}.trpg-modal__back{border-radius:var(--radius-sm);max-width:40%;min-height:36px;color:var(--primary);white-space:nowrap;background:0 0;border:0;align-items:center;gap:2px;margin-left:-8px;padding:0 8px;display:inline-flex}.trpg-modal__back span{text-overflow:ellipsis;overflow:hidden}.trpg-modal__back:hover{background:var(--card)}.trpg-modal__pages{flex:1;min-height:0;position:relative}.trpg-modal__page{padding:16px;transition:opacity .16s,transform .16s,visibility;position:absolute;inset:0;overflow:auto}.trpg-modal__page.is-under{opacity:0;visibility:hidden;pointer-events:none;transition:opacity .16s,transform .16s,visibility 0s .16s;transform:translate(-24px)}.trpg-page-enter-from,.trpg-page-leave-to{opacity:0;transform:translate(24px)}.trpg-page-enter-active,.trpg-page-leave-active{transition:opacity .16s,transform .16s}.trpg-modal[data-variant=confirm] .trpg-page-leave-active{position:absolute;inset:0}@keyframes trpg-pop{0%{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}@keyframes trpg-slide{0%{opacity:0;transform:translate(32px)}to{opacity:1;transform:none}}.trpg-confirm{gap:12px;display:grid}.trpg-confirm__message{margin:0}.trpg-confirm__details{color:var(--ink-2);margin:0;padding-left:18px}.trpg-confirm__actions{justify-content:flex-end;gap:8px;margin-top:4px;display:flex}.trpg-window[data-layout=narrow] .trpg-modal{background:var(--paper);align-items:stretch;padding:0}.trpg-window[data-layout=narrow] .trpg-modal__card{border:0;border-radius:0;width:100%;height:100%}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm]{background:var(--scrim);align-items:flex-end}.trpg-window[data-layout=narrow] .trpg-modal[data-variant=confirm] .trpg-modal__card{border-radius:var(--radius) var(--radius) 0 0;height:auto}.trpg-window[data-layout=narrow] .trpg-confirm__actions{flex-direction:column-reverse}.trpg-window[data-layout=narrow] .trpg-confirm__actions .trpg-btn{min-height:44px}.trpg-window[data-layout=narrow] .trpg-modal__head{background:var(--chrome);min-height:48px;color:var(--chrome-ink);border-bottom:0}.trpg-window[data-layout=narrow] .trpg-modal__back{color:var(--gold)}.trpg-window[data-layout=narrow] .trpg-modal__back,.trpg-window[data-layout=narrow] .trpg-modal__close{min-width:44px;min-height:44px}.trpg-drawer{align-content:start;gap:14px;min-height:100%;display:grid}.trpg-drawer__current{border-bottom:1px solid var(--line);gap:8px;padding-bottom:12px;display:grid}.trpg-drawer__name{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-drawer__title{font-family:var(--font-serif);overflow-wrap:anywhere;font-size:20px;font-weight:600}.trpg-drawer__buttons{flex-wrap:wrap;gap:8px;display:flex}.trpg-drawer__filter{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-drawer__filter .trpg-input{flex:1;min-width:140px}.trpg-drawer__bottom{border-top:1px solid var(--line);background:var(--paper);justify-content:space-between;gap:8px;margin:0 -16px -16px;padding:12px 16px;display:flex;position:sticky;bottom:-16px}.trpg-warn{color:var(--unsaved)}.trpg-saves{margin:0;padding:0;list-style:none}.trpg-save{border-bottom:1px solid var(--line);align-items:flex-start;gap:8px;padding:10px 4px;display:flex}.trpg-save[data-current=true]{background:color-mix(in srgb, var(--gold) 14%, transparent)}.trpg-save__main{flex:1;gap:2px;min-width:0;display:grid}.trpg-save__top{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.trpg-save__name{overflow-wrap:anywhere;font-weight:600}.trpg-save__time{color:var(--ink-2);margin-left:auto;font-size:12.5px}.trpg-save__rename{flex:1;min-height:32px}.trpg-save__noteedit{gap:6px;display:grid}.trpg-save__noteactions{justify-content:flex-end;gap:6px;display:flex}.trpg-folds{gap:6px;display:grid}.trpg-folds__tabs{flex-wrap:wrap;gap:4px;display:flex}.trpg-popover{z-index:100003;background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);width:min(320px,92vw);box-shadow:var(--shadow-float);padding:12px}.trpg-confirm__actions--stack{flex-wrap:wrap;justify-content:flex-end}.trpg-import__ok{color:var(--ok);margin:0;font-weight:600}.trpg-compare{border-collapse:collapse;width:100%;font-size:13px}.trpg-compare th,.trpg-compare td{border-bottom:1px solid var(--line);text-align:left;padding:4px 8px;font-weight:400}.trpg-compare thead th{color:var(--ink-2)}.trpg-window[data-layout=narrow] .trpg-confirm__actions--stack{flex-direction:column-reverse}.trpg-window[data-layout=narrow] .trpg-confirm__actions--stack .trpg-btn{min-height:44px}.trpg-wizard{flex-direction:column;min-height:100%;display:flex}.trpg-wizard__body{flex:1;padding:8px 0 16px}.trpg-wizard__foot{border-top:1px solid var(--line);background:var(--paper);justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:12px 16px;display:flex;position:sticky;bottom:-16px}.trpg-steps{gap:4px;margin:0;padding:0;list-style:none;display:flex}.trpg-steps li{flex:1}.trpg-steps button{border:0;border-bottom:2px solid var(--line);width:100%;min-height:36px;color:var(--ink-2);background:0 0;justify-content:center;align-items:center;gap:6px;padding:0 6px;display:flex}.trpg-steps button:disabled{cursor:default}.trpg-steps li[data-state=current] button{color:var(--primary);border-bottom-color:var(--primary);font-weight:600}.trpg-steps li[data-state=done] button{color:var(--ink);border-bottom-color:var(--gold);cursor:pointer}.trpg-steps li[data-skipped=true] button{opacity:.45}.trpg-steps__n{border:1px solid;border-radius:50%;place-items:center;width:20px;height:20px;font-size:12px;display:inline-grid}.trpg-steps__compact{color:var(--ink-2);margin:0;font-size:13px;display:none}.trpg-window[data-layout=narrow] .trpg-steps{display:none}.trpg-window[data-layout=narrow] .trpg-steps__compact{display:block}.trpg-step-title{font-family:var(--font-serif);margin:0;font-size:17px}.trpg-step-head{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;display:flex}.trpg-step-actions{gap:6px;display:inline-flex}.trpg-rulecards{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;display:grid}.trpg-rulecard{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow-card);cursor:pointer;gap:10px;padding:14px;display:flex}.trpg-rulecard[aria-checked=true]{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary), var(--shadow-card)}.trpg-rulecard[data-status=coming]{opacity:.55;cursor:default}.trpg-rulecard__mark{color:var(--primary);font-size:18px;line-height:1.3}.trpg-rulecard__body{justify-items:start;gap:4px;display:grid}.trpg-radio{cursor:pointer}.trpg-radio input{width:18px;height:18px;accent-color:var(--primary)}.trpg-detail-links{gap:6px;margin:0;padding:0;list-style:none;display:grid}.trpg-info__line{margin:0}.trpg-vlist{height:100%;min-height:160px;position:relative;overflow-y:auto}.trpg-vlist__space{position:relative}.trpg-vlist__row{border-bottom:1px solid var(--line);align-items:center;gap:10px;padding:0 4px;display:flex;position:absolute;left:0;right:0}.trpg-blocks{gap:8px;display:grid}.trpg-blocks__p{margin:0}.trpg-blocks__h h4{font-family:var(--font-serif);margin:8px 0 4px;font-size:15px}.trpg-blocks__list{margin:0;padding-left:20px}.trpg-blocks__table{overflow-x:auto}.trpg-blocks__table table{border-collapse:collapse;min-width:100%;font-size:13px}.trpg-blocks__table th,.trpg-blocks__table td{border:1px solid var(--line);text-align:left;padding:4px 8px}.trpg-blocks__table caption{text-align:left;padding:4px 0;font-weight:600}.trpg-blocks__quote{border-left:3px solid var(--gold);color:var(--ink-2);margin:0;padding-left:12px}.trpg-blocks__read{background:var(--panel);border-radius:var(--radius-sm);padding:8px 12px}.trpg-blocks__mark{color:var(--primary)}.trpg-variantbar{border:1px solid var(--gold);border-radius:var(--radius-sm);background:color-mix(in srgb, var(--gold) 12%, transparent);flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;display:flex}.trpg-variantbar__text{flex:1;min-width:200px}.trpg-variantbar__actions{gap:6px;display:flex}.trpg-variantpick{border:0;gap:6px;margin:0;padding:0;display:grid}.trpg-variantpick .trpg-radio{align-items:flex-start;gap:8px;min-height:36px;display:flex}.trpg-pack-actions{align-items:center;gap:6px;display:inline-flex}.trpg-packdetail{flex-direction:column;gap:10px;height:100%;display:flex}.trpg-packdetail__desc{margin:0}.trpg-packdetail__filter{grid-template-columns:minmax(140px,200px) 1fr auto;align-items:center;gap:8px;display:grid}.trpg-packdetail__list{flex:1;min-height:200px}.trpg-entryrow{flex:1;align-items:baseline;gap:10px;min-width:0;display:flex}.trpg-entryrow .trpg-term{white-space:nowrap;flex:none}.trpg-entryrow__sum{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.trpg-entry__summary{color:var(--ink-2);margin:0}.trpg-window[data-layout=narrow] .trpg-packdetail__filter{grid-template-columns:1fr}.trpg-modal__page:has(.trpg-packdetail){flex-direction:column;display:flex;overflow:hidden}.trpg-toolbar{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.trpg-toolbar__search{flex:1;min-width:160px;max-width:280px}.trpg-pill[aria-pressed=true]{background:var(--primary);color:var(--primary-ink);border-color:var(--primary)}.trpg-row--series{background:var(--panel);min-height:36px}.trpg-row--nested{padding-left:20px}.trpg-packdetail{flex:1;min-height:0}.trpg-issuerow{border:1px solid var(--unsaved);border-radius:var(--radius-sm);background:color-mix(in srgb, var(--unsaved) 12%, transparent);justify-content:space-between;align-items:center;gap:8px;padding:8px 12px;display:flex}.trpg-variantrow{margin-top:8px}.trpg-group--first{margin-top:0}.trpg-row__end--select{width:180px}.trpg-row__end--wrap{flex-wrap:wrap;justify-content:flex-end}.trpg-toolbar--between{justify-content:space-between}.trpg-toolbar__end{align-items:center;gap:10px;display:inline-flex}.trpg-minesub{flex-direction:column;gap:10px;height:100%;min-height:420px;display:flex}.trpg-minesub__list{flex:1;min-height:220px}", aG = ".probe{border-bottom:1px solid var(--line);padding:10px 0}.probe__head{justify-content:space-between;align-items:center;gap:8px;display:flex}.probe__title{font-family:var(--font-serif);margin:0;font-size:15px}.probe__hint{color:var(--ink-2);margin:4px 0;font-size:12.5px}.probe__summary{margin:4px 0}.probe__actions{flex-wrap:wrap;gap:6px;margin-top:6px;display:flex}.probe pre{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);white-space:pre-wrap;word-break:break-all;max-height:200px;margin:6px 0 0;padding:8px;font-size:11.5px;overflow:auto}.probe summary{cursor:pointer;color:var(--ink-2);font-size:12.5px}.lab{background:var(--panel);border-radius:var(--radius);gap:10px;margin-top:8px;padding:10px;display:grid}.lab__row{gap:6px;display:grid}.report-bar{background:var(--paper);flex-wrap:wrap;gap:8px;padding:10px 0;display:flex;position:sticky;bottom:-12px}", oG = ".trpg-root{z-index:100000;width:0;height:0;position:fixed;top:0;left:0}.trpg-ball{border:2px solid var(--gold);background:var(--chrome);width:48px;height:48px;color:var(--chrome-ink);cursor:grab;touch-action:none;border-radius:50%;place-items:center;padding:0;display:grid;position:fixed;box-shadow:0 2px 8px #00000059}.trpg-window{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow-float);color:var(--ink);position:fixed;overflow:hidden}.trpg-window[data-fullscreen=true]{border:0;border-radius:0;height:100dvh;inset:0}.trpg-shell{width:100%;height:100%;display:flex}.trpg-window[data-layout=narrow] .trpg-shell{padding-bottom:env(safe-area-inset-bottom);background:var(--paper);flex-direction:column}.trpg-window[data-fullscreen=true] .trpg-shell{padding-top:env(safe-area-inset-top);background:var(--chrome)}.trpg-side{background:var(--chrome);width:176px;color:var(--chrome-ink);flex-direction:column;flex:none;display:flex}.trpg-window[data-layout=mid] .trpg-side{width:56px}.trpg-side__brand{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;height:52px;font-family:var(--font-serif);border-bottom:1px solid var(--chrome-hover);color:var(--gold);align-items:center;gap:10px;padding:0 16px;font-size:16px;display:flex}.trpg-window[data-layout=mid] .trpg-side__brand{justify-content:center;padding:0}.trpg-side__list{gap:4px;margin:0;padding:8px;list-style:none;display:grid}.trpg-side__bottom{margin-top:auto}.trpg-nav{border-radius:var(--radius-sm);width:100%;min-height:44px;color:var(--chrome-ink);text-align:left;background:0 0;border:0;align-items:center;gap:12px;padding:0 12px;display:flex}.trpg-window[data-layout=mid] .trpg-nav{justify-content:center;padding:0}.trpg-nav:hover{background:var(--chrome-hover)}.trpg-nav[aria-current=page]{background:var(--chrome-hover);box-shadow:inset 3px 0 0 var(--gold)}.trpg-nav:focus-visible,.trpg-tab:focus-visible,.trpg-side__brand:focus-visible{outline-color:var(--gold)}.trpg-main{background:var(--paper);flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.trpg-head{border-bottom:1px solid var(--line);flex:none;align-items:center;gap:12px;height:52px;padding:0 12px 0 20px;display:flex}.trpg-head__title{font-family:var(--font-serif);flex:1;margin:0;font-size:19px;font-weight:600}.trpg-head__chips{align-items:center;gap:8px;display:flex}.trpg-content{outline:none;flex:1;min-height:0;padding:16px 20px 88px;position:relative;overflow:auto}.trpg-window[data-layout=narrow] .trpg-head{background:var(--chrome);height:48px;color:var(--chrome-ink);cursor:grab;touch-action:none;border-bottom:0;padding:0 8px 0 16px}.trpg-window[data-fullscreen=true] .trpg-head{cursor:default}.trpg-window[data-layout=narrow] .trpg-content{padding:12px 16px 88px}.trpg-tabs{background:var(--chrome);height:56px;color:var(--chrome-ink);flex:none;display:flex}.trpg-tab{min-width:64px;color:var(--chrome-ink);background:0 0;border:0;flex-direction:column;flex:1;justify-content:center;align-items:center;gap:2px;font-size:12px;display:flex}.trpg-tab[aria-current=page]{color:var(--gold);box-shadow:inset 0 3px 0 var(--gold)}.trpg-resize{cursor:nwse-resize;touch-action:none;z-index:30;background:linear-gradient(135deg, transparent 50%, var(--line) 50%, var(--line) 58%, transparent 58%, transparent 70%, var(--line) 70%, var(--line) 78%, transparent 78%);width:22px;height:22px;position:absolute;bottom:0;right:0}.page-stack{gap:16px;display:grid}.page-intro{color:var(--ink-2);margin:0}.subpage-back{border-radius:var(--radius-sm);min-height:36px;color:var(--primary);background:0 0;border:0;align-items:center;gap:2px;margin:0 0 8px -8px;padding:0 8px;display:inline-flex}.subpage-back:hover{background:var(--panel)}.trpg-body{flex:1;min-height:0;display:flex;position:relative}.trpg-body .trpg-content{flex:1}.trpg-dice-btn{z-index:6;border:2px solid var(--gold);background:var(--primary);width:52px;height:52px;color:var(--primary-ink);box-shadow:var(--shadow-float);border-radius:50%;place-items:center;padding:0;display:grid;position:absolute;bottom:20px;right:20px}.trpg-dice-btn[aria-pressed=true]{box-shadow:0 0 0 3px var(--gold), var(--shadow-float)}.trpg-window[data-layout=narrow] .trpg-dice-btn{bottom:16px;right:16px}.trpg-dice{z-index:10;background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);width:360px;max-height:70vh;box-shadow:var(--shadow-float);flex-direction:column;display:flex;position:fixed;overflow:hidden}.trpg-dice[data-narrow=true]{max-height:calc(100dvh - 140px)}.trpg-dice__head{background:var(--chrome);min-height:44px;color:var(--chrome-ink);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;flex:none;align-items:center;gap:8px;padding:0 6px 0 14px;display:flex}.trpg-dice__title{font-family:var(--font-serif);flex:1;font-size:16px}.trpg-dice__body{gap:12px;padding:12px;display:grid;overflow-y:auto}.trpg-dice__result{border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--card);align-content:center;justify-items:center;gap:2px;min-height:108px;padding:12px 8px;display:grid}.trpg-dice__result[data-natural=\"20\"]{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)}.trpg-dice__result[data-natural=\"1\"]{border-color:var(--danger);box-shadow:inset 0 0 0 1px var(--danger)}.trpg-dice__total{font-family:var(--font-serif);font-variant-numeric:tabular-nums;font-size:48px;font-weight:700;line-height:1.1;animation:.2s ease-out trpg-roll}.trpg-dice__result[data-natural=\"20\"] .trpg-dice__total{color:var(--gold)}.trpg-dice__result[data-natural=\"1\"] .trpg-dice__total{color:var(--danger)}.trpg-dice__line{color:var(--ink-2);text-align:center;overflow-wrap:anywhere;font-size:13px}.trpg-dice__placeholder{color:var(--ink-2);margin:0}.trpg-dice__quick{grid-template-columns:repeat(7,1fr);gap:4px;display:grid}.trpg-dice__quick .trpg-btn{min-width:0;min-height:44px;padding:0}.trpg-dice__mods{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;display:flex}.trpg-dice__mods .trpg-seg button{min-height:40px}.trpg-dice__bonus{align-items:center;gap:4px;display:inline-flex}.trpg-dice__bonus .trpg-icon-btn{border-color:var(--line);background:var(--card);min-width:40px;min-height:40px;font-size:18px}.trpg-dice__bonus-value{text-align:center;font-variant-numeric:tabular-nums;min-width:2.5em;font-weight:600}.trpg-dice__expr-row{gap:6px;display:flex}.trpg-dice__expr-row .trpg-btn{min-width:56px;min-height:40px}.trpg-dice__expr-row .trpg-input{min-height:40px}.trpg-dice__out{grid-template-columns:1.6fr 1fr;gap:8px;display:grid}.trpg-dice__out .trpg-btn{min-height:44px}.trpg-dice__recent-head{justify-content:space-between;align-items:center;display:flex}.trpg-dice__list{max-height:168px;margin:0;padding:0;list-style:none;overflow-y:auto}.trpg-dice__item{border-bottom:1px solid var(--line);align-items:center;gap:8px;min-height:40px;font-size:13px;display:flex}.trpg-dice__item-total{min-width:2.2em;font-family:var(--font-serif);font-size:16px}.trpg-dice__item-main{overflow-wrap:anywhere;flex:1;min-width:0}@keyframes trpg-roll{0%{opacity:0;transform:translateY(-10px)scale(.9)}to{opacity:1;transform:none}}.trpg-hero{border-radius:var(--radius);background:var(--primary);width:100%;min-height:170px;color:var(--primary-ink);text-align:left;box-shadow:var(--shadow-card);border:0;align-content:end;gap:8px;padding:22px 24px;transition:transform .12s,box-shadow .12s;display:grid}button.trpg-hero:hover:not(:disabled){box-shadow:var(--shadow-float);transform:translateY(-1px)}button.trpg-hero:active{transform:none}button.trpg-hero:disabled{opacity:.6;cursor:not-allowed}.trpg-hero--idle{background:var(--panel);color:var(--ink-2)}.trpg-hero__title{font-family:var(--font-serif);font-size:26px;font-weight:600}.trpg-hero__sub{opacity:.9}.trpg-hero__go{justify-self:end;font-weight:600}.trpg-window[data-layout=narrow] .trpg-hero{min-height:140px;padding:18px}.trpg-link{color:var(--primary);background:0 0;border:0;justify-self:start;min-height:36px;padding:0;text-decoration:underline}.trpg-banner{border-radius:var(--radius);background:var(--chrome);color:#f4ecdd;height:200px;position:relative;overflow:hidden}.trpg-banner--pattern{background:repeating-linear-gradient(45deg, var(--chrome) 0 14px, color-mix(in srgb, var(--chrome) 88%, var(--gold)) 14px 28px)}.trpg-banner__img{object-fit:cover;object-position:70% 50%;opacity:0;width:100%;height:100%;transition:opacity .24s;position:absolute;inset:0}.trpg-banner__img.is-loaded{opacity:1}.trpg-banner__text{background:linear-gradient(#0000,#2b211cbf);gap:2px;padding:40px 20px 14px;display:grid;position:absolute;inset:auto 0 0}.trpg-banner__title{color:inherit;font-family:var(--font-serif);text-align:left;background:0 0;border:0;justify-self:start;padding:0;font-size:26px;font-weight:600}.trpg-banner__line{flex-wrap:wrap;align-items:center;gap:10px;font-size:14px;display:flex}.trpg-banner__state{color:inherit;background:0 0;border:0;padding:0}.trpg-banner__state[data-dirty=true]{color:#f3b45a}.trpg-window[data-layout=narrow] .trpg-banner{height:140px}.trpg-overview{grid-template-columns:repeat(4,1fr);gap:12px;display:grid}.trpg-window[data-layout=mid] .trpg-overview,.trpg-window[data-layout=narrow] .trpg-overview{grid-template-columns:repeat(2,1fr)}.trpg-cell{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);min-height:88px;box-shadow:var(--shadow-card);text-align:left;align-content:start;gap:4px;padding:12px 14px;transition:transform .12s,border-color .12s;display:grid}.trpg-cell:hover{border-color:var(--primary);transform:translateY(-1px)}.trpg-cell:active{transform:none}.trpg-cell__title{align-items:center;gap:6px;font-weight:600;display:flex}.trpg-cell__line{color:var(--ink-2);font-size:13px}.trpg-empty--tight{text-align:left;padding:8px 0}.trpg-chip{max-width:260px}.trpg-chip__name{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.trpg-badge--button{cursor:pointer}", sG = ":host{all:initial;pointer-events:inherit;--paper:#f4ecdd;--panel:#eee5d3;--card:#fffcf6;--line:#cbbca3;--ink:#2b211c;--ink-2:#6c6255;--primary:#7a2e26;--primary-ink:#fffcf6;--gold:#b8954a;--danger:#a3352b;--unsaved:#d9892b;--chrome:#2b211c;--chrome-ink:#f1ebdc;--chrome-hover:#3a2d26;--ok:#3f7a3a;--scrim:#2b211c73;--radius:10px;--radius-sm:6px;--radius-xs:4px;--shadow-card:0 1px 2px #2b211c14, 0 2px 8px #2b211c0f;--shadow-float:0 8px 28px #00000047;--font-serif:\"Songti SC\", \"Noto Serif SC\", Georgia, serif;--font-sans:\"PingFang SC\", \"Microsoft YaHei\", system-ui, sans-serif;font-family:var(--font-sans);color:var(--ink);font-size:14px;line-height:1.5}@media (prefers-color-scheme:dark){:host{--paper:#20231f;--panel:#2b3029;--card:#181c18;--line:#515849;--ink:#f1ebdc;--ink-2:#bcbbaa;--primary:#e6bf73;--primary-ink:#20231f;--gold:#e6bf73;--danger:#e07a6e;--unsaved:#e8a13a;--chrome:#121411;--chrome-ink:#f1ebdc;--chrome-hover:#232720;--ok:#8cc47f;--scrim:#0000008c}}*,:before,:after{box-sizing:border-box}button,input,textarea,select{font:inherit;color:inherit}button{cursor:pointer}:focus-visible{outline:2px solid var(--primary);outline-offset:2px}.trpg-sr-only{clip:rect(0 0 0 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}@media (prefers-reduced-motion:reduce){*,:before,:after{transition-duration:.01ms!important;animation-duration:.01ms!important}}", cG = "trpg-assistant-root";
function lG(e) {
	if (document.getElementById(cG)) return null;
	let t = document.createElement("div");
	t.id = cG;
	let n = t.attachShadow({ mode: "open" }), r = document.createElement("style");
	r.textContent = [
		sG,
		oG,
		iG,
		aG
	].join("\n");
	let i = document.createElement("div");
	i.className = "trpg-portal";
	let a = document.createElement("div");
	n.append(r, a, i), document.body.appendChild(t);
	let o = yT();
	return zu(rG, {
		ctx: e,
		portalTarget: i
	}).use(o).mount(a), o;
}
// src/main.ts
async function uG() {
	if (window.__trpgAssistantBooted) return;
	window.__trpgAssistantBooted = !0, await p();
	let e = d(), t = lG(e);
	t && await aE(e, t);
}
uG().catch((e) => {
	window.__trpgAssistantBooted = !1, console.error("[trpg-assistant] 启动失败", e);
});
