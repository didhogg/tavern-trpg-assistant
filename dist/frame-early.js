// src/library/runtime/frame/early.ts
(() => {
	let e = "trpg-library", t = new URLSearchParams(location.search).get("frame") ?? "", n = globalThis, r = [];
	n.__trpgFrameErrors = r;
	let i = [];
	addEventListener("error", (e) => {
		r.push(`${e.message} @ ${e.filename}:${e.lineno}`);
	}), addEventListener("unhandledrejection", (e) => {
		let t = e.reason;
		r.push(`unhandledrejection: ${t?.stack ?? String(e.reason)}`);
	});
	let a = {};
	window.name.startsWith("trpg-local:") && (a = JSON.parse(window.name.slice(11)), window.name = "");
	function o(e, t) {
		let n = new Map(Object.entries(e)), a = (e) => {
			t && d(e).catch((e) => {
				let t = `同步存储没存进插件：${String(e)}`;
				r.push(t), i.push(t);
			});
		};
		return {
			get length() {
				return n.size;
			},
			key: (e) => [...n.keys()][e] ?? null,
			getItem: (e) => n.has(e) ? n.get(e) : null,
			setItem: (e, t) => {
				n.set(String(e), String(t)), a({
					op: "local-set",
					key: String(e),
					value: String(t)
				});
			},
			removeItem: (e) => {
				n.delete(String(e)), a({
					op: "local-remove",
					key: String(e)
				});
			},
			clear: () => {
				for (let e of n.keys()) a({
					op: "local-remove",
					key: e
				});
				n.clear();
			}
		};
	}
	let s = {
		localStorage: o(a, !0),
		sessionStorage: o({}, !1)
	};
	for (let [e, t] of Object.entries(s)) Object.defineProperty(window, e, {
		configurable: !0,
		get: () => t
	});
	let c = 1, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set();
	addEventListener("message", (t) => {
		let n = t.data;
		if (t.source !== parent || !n || n.channel !== e || n.type !== "response") return;
		let r = l.get(n.id);
		r && (l.delete(n.id), n.ok ? r.resolve(n.value) : r.reject(Error(n.error)));
	});
	function d(n) {
		let r = new Promise((r, i) => {
			let a = c++;
			l.set(a, {
				resolve: r,
				reject: i
			}), parent.postMessage({
				channel: e,
				type: "request",
				frame: t,
				id: a,
				...n
			}, location.origin);
		});
		return (n.op === "local-set" || n.op === "local-remove" || n.op === "kv-set" || n.op === "kv-remove") && (u.add(r), r.then(() => u.delete(r), (e) => {
			u.delete(r), (n.op === "kv-set" || n.op === "kv-remove") && i.push(`作者存储没存进插件：${String(e)}`);
		})), r;
	}
	n.__trpgStorageFlush = async () => (await Promise.allSettled([...u]), [...i]);
	function f(e, t) {
		let n;
		Object.defineProperty(globalThis, e, {
			configurable: !0,
			enumerable: !0,
			get: () => n,
			set: (e) => {
				n = e, e && t(e);
			}
		});
	}
	let p = new URL(".", location.href);
	function m(e) {
		let t = new URL(e, p);
		return t.origin !== p.origin || !t.pathname.startsWith(p.pathname) ? null : decodeURIComponent(t.pathname.slice(p.pathname.length));
	}
	let h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Set();
	n.__trpgSitePaths = g;
	function _(e) {
		g.add(e);
		let t = h.get(e);
		return t || (t = d({
			op: "file",
			path: e
		}).then((t) => {
			if (typeof t != "string") throw Error(`文件不存在：${e}`);
			return t;
		}), t.catch(() => h.delete(e)), h.set(e, t)), t;
	}
	f("DataUtil", (e) => {
		let t = e.loadJSON.bind(e), n = e.loadRawJSON.bind(e), r = /* @__PURE__ */ new Map();
		e.loadJSON = (n, ...i) => {
			let a = m(n);
			if (a === null) return t(n, ...i);
			let o = r.get(n);
			return o || (o = (async () => {
				let t = JSON.parse(await _(a));
				return await e.pDoMetaMerge(n, t, { isSkipMetaMergeCache: !0 }), t;
			})(), o.catch(() => r.delete(n)), r.set(n, o)), o;
		}, e.loadRawJSON = async (e, ...t) => {
			let r = m(e);
			return r === null ? n(e, ...t) : JSON.parse(await _(r));
		};
	});
	let v = {
		getItem: (e) => d({
			op: "kv-get",
			key: e
		}),
		setItem: (e, t) => d({
			op: "kv-set",
			key: e,
			value: t
		}),
		removeItem: (e) => d({
			op: "kv-remove",
			key: e
		})
	};
	f("StorageUtil", (e) => {
		e._getAsyncStorage = async () => v;
	});
})();
