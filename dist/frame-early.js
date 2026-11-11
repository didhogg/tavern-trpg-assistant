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
			t && u(e).catch((e) => r.push(`同步存储没存进插件：${String(e)}`));
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
	let s = 1, c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Set();
	addEventListener("message", (t) => {
		let n = t.data;
		if (t.source !== parent || !n || n.channel !== e || n.type !== "response") return;
		let r = c.get(n.id);
		r && (c.delete(n.id), n.ok ? r.resolve(n.value) : r.reject(Error(n.error)));
	});
	function u(n) {
		let r = new Promise((r, i) => {
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
		return (n.op === "local-set" || n.op === "local-remove" || n.op === "kv-set" || n.op === "kv-remove") && (l.add(r), r.then(() => l.delete(r), () => l.delete(r))), r;
	}
	n.__trpgStorageFlush = async () => (await Promise.allSettled([...l]), [...r]);
	function d(e, t) {
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
	let f = new URL(".", location.href);
	function p(e) {
		let t = new URL(e, f);
		return t.origin !== f.origin || !t.pathname.startsWith(f.pathname) ? null : decodeURIComponent(t.pathname.slice(f.pathname.length));
	}
	let m = /* @__PURE__ */ new Map();
	function h(e) {
		let t = m.get(e);
		return t || (t = u({
			op: "file",
			path: e
		}).then((t) => {
			if (typeof t != "string") throw Error(`文件不存在：${e}`);
			return t;
		}), t.catch(() => m.delete(e)), m.set(e, t)), t;
	}
	d("DataUtil", (e) => {
		let t = e.loadJSON.bind(e), n = e.loadRawJSON.bind(e), r = /* @__PURE__ */ new Map();
		e.loadJSON = (n, ...i) => {
			let a = p(n);
			if (a === null) return t(n, ...i);
			let o = r.get(n);
			return o || (o = (async () => {
				let t = JSON.parse(await h(a));
				return await e.pDoMetaMerge(n, t, { isSkipMetaMergeCache: !0 }), t;
			})(), o.catch(() => r.delete(n)), r.set(n, o)), o;
		}, e.loadRawJSON = async (e, ...t) => {
			let r = p(e);
			return r === null ? n(e, ...t) : JSON.parse(await h(r));
		};
	});
	let g = {
		getItem: (e) => u({
			op: "kv-get",
			key: e
		}),
		setItem: (e, t) => u({
			op: "kv-set",
			key: e,
			value: t
		}),
		removeItem: (e) => u({
			op: "kv-remove",
			key: e
		})
	};
	d("StorageUtil", (e) => {
		e._getAsyncStorage = async () => g;
	});
})();
