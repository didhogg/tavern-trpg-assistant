// src/library/runtime/frame/early.ts
(() => {
	let e = "trpg-library", t = new URLSearchParams(location.search).get("frame") ?? "", n = globalThis, r = [];
	n.__trpgFrameErrors = r, addEventListener("error", (e) => {
		r.push(`${e.message} @ ${e.filename}:${e.lineno}`);
	}), addEventListener("unhandledrejection", (e) => {
		let t = e.reason;
		r.push(`unhandledrejection: ${t?.stack ?? String(e.reason)}`);
	});
	let i = {};
	window.name.startsWith("trpg-local:") && (i = JSON.parse(window.name.slice(11)), window.name = "");
	function a(e, t) {
		let n = new Map(Object.entries(e)), i = (e) => {
			t && l(e).catch((e) => r.push(`同步存储没存进插件：${String(e)}`));
		};
		return {
			get length() {
				return n.size;
			},
			key: (e) => [...n.keys()][e] ?? null,
			getItem: (e) => n.has(e) ? n.get(e) : null,
			setItem: (e, t) => {
				n.set(String(e), String(t)), i({
					op: "local-set",
					key: String(e),
					value: String(t)
				});
			},
			removeItem: (e) => {
				n.delete(String(e)), i({
					op: "local-remove",
					key: String(e)
				});
			},
			clear: () => {
				for (let e of n.keys()) i({
					op: "local-remove",
					key: e
				});
				n.clear();
			}
		};
	}
	let o = {
		localStorage: a(i, !0),
		sessionStorage: a({}, !1)
	};
	for (let [e, t] of Object.entries(o)) Object.defineProperty(window, e, {
		configurable: !0,
		get: () => t
	});
	let s = 1, c = /* @__PURE__ */ new Map();
	addEventListener("message", (t) => {
		let n = t.data;
		if (t.source !== parent || !n || n.channel !== e || n.type !== "response") return;
		let r = c.get(n.id);
		r && (c.delete(n.id), n.ok ? r.resolve(n.value) : r.reject(Error(n.error)));
	});
	function l(n) {
		return new Promise((r, i) => {
			let a = s++;
			c.set(a, {
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
	}
	function u(e, t) {
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
	let d = new URL(".", location.href);
	function f(e) {
		let t = new URL(e, d);
		return t.origin !== d.origin || !t.pathname.startsWith(d.pathname) ? null : decodeURIComponent(t.pathname.slice(d.pathname.length));
	}
	let p = /* @__PURE__ */ new Map();
	function m(e) {
		let t = p.get(e);
		return t || (t = l({
			op: "file",
			path: e
		}).then((t) => {
			if (typeof t != "string") throw Error(`文件不存在：${e}`);
			return t;
		}), t.catch(() => p.delete(e)), p.set(e, t)), t;
	}
	u("DataUtil", (e) => {
		let t = e.loadJSON.bind(e), n = e.loadRawJSON.bind(e), r = /* @__PURE__ */ new Map();
		e.loadJSON = (n, ...i) => {
			let a = f(n);
			if (a === null) return t(n, ...i);
			let o = r.get(n);
			return o || (o = (async () => {
				let t = JSON.parse(await m(a));
				return await e.pDoMetaMerge(n, t, { isSkipMetaMergeCache: !0 }), t;
			})(), o.catch(() => r.delete(n)), r.set(n, o)), o;
		}, e.loadRawJSON = async (e, ...t) => {
			let r = f(e);
			return r === null ? n(e, ...t) : JSON.parse(await m(r));
		};
	});
	let h = {
		getItem: (e) => l({
			op: "kv-get",
			key: e
		}),
		setItem: (e, t) => l({
			op: "kv-set",
			key: e,
			value: t
		}),
		removeItem: (e) => l({
			op: "kv-remove",
			key: e
		})
	};
	u("StorageUtil", (e) => {
		e._getAsyncStorage = async () => h;
	});
})();
