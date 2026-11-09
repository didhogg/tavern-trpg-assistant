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
			repo: "tjliqy/homebrew-deploy",
			mirrors: ["https://homebrew.kiwee.top/", "https://cdn.jsdelivr.net/gh/tjliqy/homebrew-deploy@master/"]
		},
		{
			id: "en-brew",
			kind: "brew",
			lang: "en",
			codeSet: "en",
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
function a(e, n) {
	let r = t[n.codeSet];
	return e.replaceAll("{repo}", r.repo).replaceAll("{commit}", r.commit);
}
function o(e) {
	return e.mirrors.map((t) => a(t, e));
}
function s(e) {
	if (!e.fileList) throw Error(`${e.id} 没有登记文件清单地址`);
	return a(e.fileList, e);
}
function c(e) {
	return t[e.codeSet].commit;
}
// src/library/images.ts
function l(e, t) {
	return t ? typeof t == "string" ? e.map((e) => e + encodeURI(t.replace(/^\/+/, ""))) : t.type === "external" || t.url && !t.path ? t.url ? [t.url] : [] : t.path ? e.map((e) => e + encodeURI(t.path.replace(/^\/+/, ""))) : [] : [];
}
function u(e) {
	return r(e).imageRoots ?? [];
}
function d(e, t) {
	return l(u(e), t);
}
function f(e) {
	return e.replace(/^\/?img\//, "");
}
export { s as a, i as c, c as i, f as n, r as o, n as r, o as s, d as t };
