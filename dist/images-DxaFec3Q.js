var e = {
	codeSets: {
		cn: {
			repo: "tjliqy/5etools-cn",
			commit: "aaadd34f4e61a4701c31aa38d0337a2b3ae856ba",
			version: "2.40.0",
			lang: "zh",
			label: "中文",
			format: "5etools"
		},
		en: {
			repo: "5etools-mirror-3/5etools-src",
			commit: "32ef600fab87a585a61dd1a22e9b02dfc58c728a",
			version: "2.41.0",
			lang: "en",
			label: "English",
			format: "5etools"
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
			],
			imageRoots: [
				"https://raw.githubusercontent.com/5etools-mirror-3/5etools-img/main/",
				"https://cdn.jsdelivr.net/gh/5etools-mirror-3/5etools-img@main/",
				"https://5e.kiwee.top/img/"
			]
		},
		{
			id: "en-official",
			kind: "official",
			lang: "en",
			codeSet: "en",
			pair: "cn-official",
			fileList: "https://api.github.com/repos/{repo}/git/trees/{commit}?recursive=1",
			mirrors: ["https://cdn.jsdelivr.net/gh/{repo}@{commit}/", "https://raw.githubusercontent.com/{repo}/{commit}/"],
			imageRoots: ["https://raw.githubusercontent.com/5etools-mirror-3/5etools-img/main/", "https://cdn.jsdelivr.net/gh/5etools-mirror-3/5etools-img@main/"]
		},
		{
			id: "cn-brew",
			kind: "brew",
			lang: "zh",
			codeSet: "cn",
			pair: "en-brew",
			repo: "tjliqy/homebrew-deploy",
			mirrors: ["https://homebrew.kiwee.top/", "https://cdn.jsdelivr.net/gh/tjliqy/homebrew-deploy@master/"]
		},
		{
			id: "en-brew",
			kind: "brew",
			lang: "en",
			codeSet: "en",
			pair: "cn-brew",
			repo: "TheGiddyLimit/homebrew",
			mirrors: ["https://raw.githubusercontent.com/TheGiddyLimit/homebrew/master/", "https://cdn.jsdelivr.net/gh/TheGiddyLimit/homebrew@master/"]
		}
	]
}, t = e.codeSets, n = e.sources;
function r(e) {
	let t = n.find((t) => t.id === e);
	if (!t) throw Error(`源登记表里没有：${e}`);
	return t;
}
function i(e) {
	let t = n.find((t) => t.kind === "brew" && t.codeSet === e);
	if (!t) throw Error(`作者程序 ${e} 没有登记对应的自制源`);
	return t;
}
function a(e) {
	let t = n.find((t) => t.kind === "official" && t.codeSet === e);
	if (!t) throw Error(`作者程序 ${e} 没有登记对应的官方数据源`);
	return t;
}
var o = /* @__PURE__ */ new Map();
function s(e, t, n) {
	return e.replaceAll("{repo}", t).replaceAll("{commit}", n);
}
function c(e, n) {
	return e.mirrors.map((r) => s(r, t[e.codeSet].repo, n));
}
function l(e, n) {
	if (!e.fileList) throw Error(`${e.id} 没有登记文件清单地址`);
	return s(e.fileList, t[e.codeSet].repo, n);
}
function u(e) {
	return o.get(e.codeSet) ?? t[e.codeSet].commit;
}
// src/core/ids.ts
function d() {
	let e = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(e), e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
	let t = Array.from(e, (e) => e.toString(16).padStart(2, "0"));
	return `${t.slice(0, 4).join("")}-${t.slice(4, 6).join("")}-${t.slice(6, 8).join("")}-${t.slice(8, 10).join("")}-${t.slice(10).join("")}`;
}
function f(e) {
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
var p = {
	scopes: [{
		id: "5e2014",
		name: "5e 2014",
		edition: "classic"
	}, {
		id: "5e2024",
		name: "5e 2024",
		edition: "one"
	}],
	rules: {
		dnd5e2014: {
			defaultScopes: ["5e2014"],
			showLegacy: !0,
			style: "classic",
			format: "5etools"
		},
		dnd5e2024: {
			defaultScopes: ["5e2024"],
			showLegacy: !1,
			style: "one",
			format: "5etools"
		}
	}
}, m = p.scopes, h = p.rules;
function g(e) {
	let t = h[e];
	if (!t) throw Error(`范围登记表里没有这套规则：${e}`);
	return t;
}
function ee(e) {
	let t = [...e].sort().join(",");
	return t ? Object.entries(h).find(([, e]) => [...e.defaultScopes].sort().join(",") === t)?.[0] ?? null : null;
}
var _ = (e) => `src:${e.toLowerCase()}`, v = (e) => `ent:${e.set}:${e.prop}:${e.hash}`, te = (e) => `${e.set}|${e.prop}|${e.hash}`;
function y(e, t) {
	let n = t.toLowerCase(), r = e.filter((e) => (e.body?._meta?.sources ?? []).some((e) => String(e?.json ?? "").toLowerCase() === n));
	return r.length > 0 && r.every((e) => !e.head?.url && !e.body?._meta?.edition);
}
function b(e, t = m) {
	if (!e || e.classic === null) return null;
	let n = e.classic ? "classic" : "one", r = t.filter((e) => e.edition === n).map((e) => e.id);
	return r.length ? {
		scopes: r,
		global: !1
	} : null;
}
function x(e, t, n) {
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
function S(e, t) {
	return {
		rule: e,
		codeSet: t,
		scopes: [...g(e).defaultScopes],
		include: [],
		exclude: [],
		choices: {}
	};
}
function C(e, t, n) {
	return T(e, _(t), n);
}
function w(e, t, n) {
	return T(e, v(t), n);
}
function T(e, t, n) {
	let r = (e) => e.filter((e) => e !== t);
	return n ? {
		include: [...r(e.include), t],
		exclude: r(e.exclude)
	} : {
		include: r(e.include),
		exclude: [...r(e.exclude), t]
	};
}
function E(e) {
	let t = [];
	for (let n of e.exclude) {
		let e = /^ent:([^:]+):([^:]+):(.+)$/.exec(n);
		e && t.push({
			set: e[1],
			prop: e[2],
			hash: e[3]
		});
	}
	return t;
}
function D(e, t, n) {
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
		visible: !0,
		reason: "out-of-scope"
	} : {
		visible: !0,
		reason: "unclassified"
	};
}
var O = (e) => e.reason !== "out-of-scope" && e.reason !== "unclassified", ne = (e) => e / 2 ** 32 | 0, re = (e) => e >>> 0;
function ie(e, t, n, r) {
	let i = ne(n), a = re(n);
	e.setUint32(t, r ? a : i, r), e.setUint32(t + 4, r ? i : a, r);
}
// node_modules/@noble/hashes/utils.js
function k(e) {
	return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
var A = (e) => e ? `"${e}" ` : "";
function ae(e, t = "") {
	if (typeof e != "number") throw TypeError(A(t) + "expected number, got " + typeof e);
	if (!Number.isSafeInteger(e) || e < 0) throw RangeError(A(t) + "expected integer >= 0, got " + e);
	return e;
}
function j(e, t, n = "") {
	if (k(e) && (t === void 0 || e.length === t)) return e;
	t !== void 0 && ae(t, "length");
	let r = k(e), i = t === void 0 ? "" : ` of length ${t}`, a = r ? `length=${e.length}` : `type=${typeof e}`, o = A(n) + "expected Uint8Array" + i + ", got " + a;
	throw r ? RangeError(o) : TypeError(o);
}
var M = (e, t) => {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError((t === "object" ? "" : `"${t}" `) + "expected object, got type=" + typeof e);
}, N = (e, t) => {
	M(e, t);
	let n = Object.getPrototypeOf(e);
	if (n !== Object.prototype && n !== null) throw TypeError(`"${t}" expected plain object`);
	if (Object.hasOwn(e, "__proto__")) throw TypeError(`"${t}.__proto__" is not allowed`);
};
function P(e, t = !0) {
	if (e.destroyed) throw Error("hash was destroyed");
	if (t && e.finished) throw Error("digest() was already called");
}
function F(e, t) {
	j(e, void 0, "output");
	let n = t.outputLen;
	if (!(e.length >= n)) throw RangeError("\"output\" expected length >= " + n);
}
function I(...e) {
	for (let t = 0; t < e.length; t++) e[t].fill(0);
}
function L(e) {
	return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function R(e, t) {
	return e << 32 - t | e >>> t;
}
function z(e, t) {
	return e << t | e >>> 32 - t >>> 0;
}
var B = typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", V = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function H(e) {
	if (j(e), B) return e.toHex();
	let t = "";
	for (let n = 0; n < e.length; n++) t += V[e[n]];
	return t;
}
function U(e) {
	if (typeof e != "string") throw TypeError("string expected");
	let t = new TextEncoder().encode(e);
	try {
		return new Uint8Array(t);
	} finally {
		I(t);
	}
}
function W(e, t, n = "opts") {
	return N(e, "defaults"), t !== void 0 && N(t, n), Object.assign(Object.create(null), e, t);
}
function G(e, t = {}) {
	if (typeof e != "function") throw TypeError("\"hashCons\" expected function, got type=" + typeof e);
	t = W({}, t, "info");
	let n = (t, n) => e(n).update(t).digest(), r = e(void 0);
	return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.canXOF = r.canXOF, n.create = (t) => e(t), Object.assign(n, t), Object.freeze(n);
}
var K = (e) => ({ oid: Uint8Array.from([
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
function q(e, t, n) {
	return e & t ^ ~e & n;
}
function J(e, t, n) {
	return e & t ^ e & n ^ t & n;
}
var Y = class {
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
		this.blockLen = e, this.outputLen = t, this.padOffset = n, this.isLE = r, this.buffer = new Uint8Array(e), this.view = L(this.buffer);
	}
	update(e) {
		P(this), j(e);
		let { view: t, buffer: n, blockLen: r } = this, i = e.length, a = !1;
		for (let o = 0; o < i;) {
			let s = Math.min(r - this.pos, i - o);
			if (s === r) {
				let t = L(e);
				for (; r <= i - o; o += r) this.process(t, o);
				a = !0;
			} else n.set(o === 0 && s === i ? e : e.subarray(o, o + s), this.pos), this.pos += s, o += s, this.pos === r && (this.process(t, 0), this.pos = 0, a = !0);
		}
		return this.length += e.length, a && this.roundClean(), this;
	}
	digestInto(e) {
		P(this), F(e, this), this.finished = !0;
		let { buffer: t, view: n, blockLen: r, isLE: i } = this, { pos: a } = this;
		t[a++] = 128, t.fill(0, a), this.padOffset > r - a && (this.process(n, 0), t.fill(0)), ie(n, r - 8, this.length * 8, i), this.process(n, 0), this.roundClean();
		let o = e === t ? n : L(e), s = this.outputLen, c = s / 4, l = this.get();
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
}, oe = /* @__PURE__ */ Uint32Array.from([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]), se = /* @__PURE__ */ Uint32Array.from([
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
]), X = /* @__PURE__ */ new Uint32Array(64), ce = class extends Y {
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
		for (let n = 0; n < 16; n++, t += 4) X[n] = e.getUint32(t, !1);
		for (let e = 16; e < 64; e++) {
			let t = X[e - 15], n = X[e - 2], r = R(t, 7) ^ R(t, 18) ^ t >>> 3, i = R(n, 17) ^ R(n, 19) ^ n >>> 10;
			X[e] = i + X[e - 7] + r + X[e - 16] | 0;
		}
		let { A: n, B: r, C: i, D: a, E: o, F: s, G: c, H: l } = this;
		for (let e = 0; e < 64; e++) {
			let t = R(o, 6) ^ R(o, 11) ^ R(o, 25), u = l + t + q(o, s, c) + se[e] + X[e] | 0, d = (R(n, 2) ^ R(n, 13) ^ R(n, 22)) + J(n, r, i) | 0;
			l = c, c = s, s = o, o = a + u | 0, a = i, i = r, r = n, n = u + d | 0;
		}
		n = n + this.A | 0, r = r + this.B | 0, i = i + this.C | 0, a = a + this.D | 0, o = o + this.E | 0, s = s + this.F | 0, c = c + this.G | 0, l = l + this.H | 0, this.set(n, r, i, a, o, s, c, l);
	}
	roundClean() {
		I(X);
	}
	destroy() {
		this.destroyed = !0, this.set(0, 0, 0, 0, 0, 0, 0, 0), I(this.buffer);
	}
}, Z = class extends ce {
	constructor() {
		super(32, oe);
	}
}, le = /* @__PURE__ */ G(() => new Z(), /* @__PURE__ */ K(1));
// src/core/hash.ts
function Q(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e) ?? "null";
	if (Array.isArray(e)) return `[${e.map((e) => Q(e === void 0 ? null : e)).join(",")}]`;
	let t = e;
	return `{${Object.keys(t).filter((e) => t[e] !== void 0).sort().map((e) => `${JSON.stringify(e)}:${Q(t[e])}`).join(",")}}`;
}
function $(e) {
	return H(le(typeof e == "string" ? U(e) : e));
}
function ue(e) {
	return $(Q(e));
}
// src/library/images.ts
function de(e, t) {
	return t ? typeof t == "string" ? e.map((e) => e + encodeURI(t.replace(/^\/+/, ""))) : t.type === "external" || t.url && !t.path ? t.url ? [t.url] : [] : t.path ? e.map((e) => e + encodeURI(t.path.replace(/^\/+/, ""))) : [] : [];
}
function fe(e) {
	return r(e).imageRoots ?? [];
}
function pe(e, t) {
	return de(fe(e), t);
}
function me(e) {
	return e.replace(/^\/?img\//, "");
}
export { d as A, x as C, _ as D, g as E, l as F, r as I, c as L, n as M, i as N, D as O, u as P, a as R, y as S, ee as T, C as _, Q as a, v as b, J as c, G as d, z as f, w as g, b as h, $ as i, t as j, f as k, H as l, m, me as n, q as o, U as p, ue as r, Y as s, pe as t, I as u, S as v, te as w, O as x, E as y };
