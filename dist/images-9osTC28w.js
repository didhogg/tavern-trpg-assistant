var e = {
	codeSets: {
		cn: {
			repo: "tjliqy/5etools-cn",
			commit: "aaadd34f4e61a4701c31aa38d0337a2b3ae856ba",
			version: "2.40.0",
			lang: "zh"
		},
		en: {
			repo: "5etools-mirror-3/5etools-src",
			commit: "32ef600fab87a585a61dd1a22e9b02dfc58c728a",
			version: "2.41.0",
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
// src/library/images.ts
function u(e, t) {
	return t ? typeof t == "string" ? e.map((e) => e + encodeURI(t.replace(/^\/+/, ""))) : t.type === "external" || t.url && !t.path ? t.url ? [t.url] : [] : t.path ? e.map((e) => e + encodeURI(t.path.replace(/^\/+/, ""))) : [] : [];
}
function d(e) {
	return r(e).imageRoots ?? [];
}
function f(e, t) {
	return u(d(e), t);
}
function p(e) {
	return e.replace(/^\/?img\//, "");
}
export { l as a, s as c, n as i, i as l, p as n, c as o, t as r, r as s, f as t };
