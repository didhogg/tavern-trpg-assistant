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
	let t = n.find((t) => t.kind === "official" && t.codeSet === e);
	if (!t) throw Error(`作者程序 ${e} 没有登记对应的官方数据源`);
	return t;
}
var a = /* @__PURE__ */ new Map();
function o(e, t, n) {
	return e.replaceAll("{repo}", t).replaceAll("{commit}", n);
}
function s(e, n) {
	return e.mirrors.map((r) => o(r, t[e.codeSet].repo, n));
}
function c(e, n) {
	if (!e.fileList) throw Error(`${e.id} 没有登记文件清单地址`);
	return o(e.fileList, t[e.codeSet].repo, n);
}
function l(e) {
	return a.get(e.codeSet) ?? t[e.codeSet].commit;
}
// src/core/ids.ts
function u() {
	let e = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(e), e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
	let t = Array.from(e, (e) => e.toString(16).padStart(2, "0"));
	return `${t.slice(0, 4).join("")}-${t.slice(4, 6).join("")}-${t.slice(6, 8).join("")}-${t.slice(8, 10).join("")}-${t.slice(10).join("")}`;
}
function d(e) {
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
var f = {
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
}, p = f.scopes, m = f.rules;
function h(e) {
	let t = m[e];
	if (!t) throw Error(`范围登记表里没有这套规则：${e}`);
	return t;
}
var g = (e) => `src:${e.toLowerCase()}`, _ = (e) => `ent:${e.set}:${e.prop}:${e.hash}`, v = (e) => `${e.set}|${e.prop}|${e.hash}`;
function y(e, t) {
	let n = t.toLowerCase(), r = e.filter((e) => (e.body?._meta?.sources ?? []).some((e) => String(e?.json ?? "").toLowerCase() === n));
	return r.length > 0 && r.every((e) => !e.head?.url && !e.body?._meta?.edition);
}
function b(e, t = p) {
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
		scopes: [...h(e).defaultScopes],
		include: [],
		exclude: [],
		choices: {}
	};
}
function C(e, t, n) {
	return T(e, g(t), n);
}
function w(e, t, n) {
	return T(e, _(t), n);
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
var O = (e) => e.reason !== "out-of-scope" && e.reason !== "unclassified";
// src/library/images.ts
function k(e, t) {
	return t ? typeof t == "string" ? e.map((e) => e + encodeURI(t.replace(/^\/+/, ""))) : t.type === "external" || t.url && !t.path ? t.url ? [t.url] : [] : t.path ? e.map((e) => e + encodeURI(t.path.replace(/^\/+/, ""))) : [] : [];
}
function A(e) {
	return r(e).imageRoots ?? [];
}
function j(e, t) {
	return k(A(e), t);
}
function M(e) {
	return e.replace(/^\/?img\//, "");
}
export { r as C, c as S, i as T, d as _, w as a, n as b, E as c, y as d, x as f, D as g, g as h, b as i, _ as l, h as m, M as n, C as o, v as p, p as r, S as s, j as t, O as u, u as v, s as w, l as x, t as y };
