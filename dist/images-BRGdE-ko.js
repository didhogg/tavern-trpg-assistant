var e = {
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
function o(e, n) {
	n && n !== t[e]?.commit ? a.set(e, n) : a.delete(e);
}
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
function u(e, n) {
	return s(e, t[n.codeSet].repo, p(n));
}
function d(e) {
	return e.mirrors.map((t) => u(t, e));
}
function f(e) {
	if (!e.fileList) throw Error(`${e.id} 没有登记文件清单地址`);
	return u(e.fileList, e);
}
function p(e) {
	return a.get(e.codeSet) ?? t[e.codeSet].commit;
}
// src/library/images.ts
function m(e, t) {
	return t ? typeof t == "string" ? e.map((e) => e + encodeURI(t.replace(/^\/+/, ""))) : t.type === "external" || t.url && !t.path ? t.url ? [t.url] : [] : t.path ? e.map((e) => e + encodeURI(t.path.replace(/^\/+/, ""))) : [] : [];
}
function h(e) {
	return r(e).imageRoots ?? [];
}
function g(e, t) {
	return m(h(e), t);
}
function _(e) {
	return e.replace(/^\/?img\//, "");
}
export { p as a, r as c, i as d, o as f, n as i, d as l, _ as n, f as o, t as r, l as s, g as t, c as u };
