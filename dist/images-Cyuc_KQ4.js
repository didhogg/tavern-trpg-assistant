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
function _(e) {
	let t = [...e].sort().join(",");
	return t ? Object.entries(h).find(([, e]) => [...e.defaultScopes].sort().join(",") === t)?.[0] ?? null : null;
}
var v = (e) => `src:${e.toLowerCase()}`, y = (e) => `ent:${e.set}:${e.prop}:${e.hash}`, b = (e) => `${e.set}|${e.prop}|${e.hash}`;
function x(e, t) {
	let n = t.toLowerCase(), r = e.filter((e) => (e.body?._meta?.sources ?? []).some((e) => String(e?.json ?? "").toLowerCase() === n));
	return r.length > 0 && r.every((e) => !e.head?.url && !e.body?._meta?.edition);
}
function S(e, t = m) {
	if (!e || e.classic === null) return null;
	let n = e.classic ? "classic" : "one", r = t.filter((e) => e.edition === n).map((e) => e.id);
	return r.length ? {
		scopes: r,
		global: !1
	} : null;
}
function C(e, t, n) {
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
function w(e, t) {
	return {
		rule: e,
		codeSet: t,
		scopes: [...g(e).defaultScopes],
		include: [],
		exclude: [],
		choices: {}
	};
}
function T(e, t, n) {
	return D(e, v(t), n);
}
function E(e, t, n) {
	return D(e, y(t), n);
}
function D(e, t, n) {
	let r = (e) => e.filter((e) => e !== t);
	return n ? {
		include: [...r(e.include), t],
		exclude: r(e.exclude)
	} : {
		include: r(e.include),
		exclude: [...r(e.exclude), t]
	};
}
function O(e) {
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
function k(e, t, n) {
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
var A = (e) => e.reason !== "out-of-scope" && e.reason !== "unclassified";
// src/library/images.ts
function j(e, t) {
	return t ? typeof t == "string" ? e.map((e) => e + encodeURI(t.replace(/^\/+/, ""))) : t.type === "external" || t.url && !t.path ? t.url ? [t.url] : [] : t.path ? e.map((e) => e + encodeURI(t.path.replace(/^\/+/, ""))) : [] : [];
}
function M(e) {
	return r(e).imageRoots ?? [];
}
function N(e, t) {
	return j(M(e), t);
}
function P(e) {
	return e.replace(/^\/?img\//, "");
}
export { u as C, a as D, c as E, i as S, r as T, k as _, E as a, t as b, O as c, x as d, C as f, v as g, g as h, S as i, y as l, _ as m, P as n, T as o, b as p, m as r, w as s, N as t, A as u, f as v, l as w, n as x, d as y };
