// src/library/runtime/frame/early.ts
(() => {
	let e = "trpg-library", t = globalThis, n = [];
	t.__trpgFrameErrors = n, addEventListener("error", (e) => {
		n.push(`${e.message} @ ${e.filename}:${e.lineno}`);
	}), addEventListener("unhandledrejection", (e) => {
		let t = e.reason;
		n.push(`unhandledrejection: ${t?.stack ?? String(e.reason)}`);
	});
	function r() {
		let e = /* @__PURE__ */ new Map();
		return {
			get length() {
				return e.size;
			},
			key: (t) => [...e.keys()][t] ?? null,
			getItem: (t) => e.has(t) ? e.get(t) : null,
			setItem: (t, n) => {
				e.set(String(t), String(n));
			},
			removeItem: (t) => {
				e.delete(String(t));
			},
			clear: () => e.clear()
		};
	}
	for (let e of ["localStorage", "sessionStorage"]) {
		let t = r();
		Object.defineProperty(window, e, {
			configurable: !0,
			get: () => t
		});
	}
	let i = 1, a = /* @__PURE__ */ new Map();
	addEventListener("message", (t) => {
		let n = t.data;
		if (t.source !== parent || !n || n.channel !== e || n.type !== "response") return;
		let r = a.get(n.id);
		r && (a.delete(n.id), n.ok ? r.resolve(n.value) : r.reject(Error(n.error)));
	});
	function o(t) {
		return new Promise((n, r) => {
			let o = i++;
			a.set(o, {
				resolve: n,
				reject: r
			}), parent.postMessage({
				channel: e,
				type: "request",
				id: o,
				...t
			}, location.origin);
		});
	}
	function s(e, t) {
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
	let c = new URL(".", location.href);
	function l(e) {
		let t = new URL(e, c);
		return t.origin !== c.origin || !t.pathname.startsWith(c.pathname) ? null : decodeURIComponent(t.pathname.slice(c.pathname.length));
	}
	let u = /* @__PURE__ */ new Map();
	function d(e) {
		let t = u.get(e);
		return t || (t = o({
			op: "file",
			path: e
		}).then((t) => {
			if (typeof t != "string") throw Error(`文件不存在：${e}`);
			return t;
		}), t.catch(() => u.delete(e)), u.set(e, t)), t;
	}
	s("DataUtil", (e) => {
		let t = e.loadJSON.bind(e), n = e.loadRawJSON.bind(e), r = /* @__PURE__ */ new Map();
		e.loadJSON = (n, ...i) => {
			let a = l(n);
			if (a === null) return t(n, ...i);
			let o = r.get(n);
			return o || (o = (async () => {
				let t = JSON.parse(await d(a));
				return await e.pDoMetaMerge(n, t, { isSkipMetaMergeCache: !0 }), t;
			})(), o.catch(() => r.delete(n)), r.set(n, o)), o;
		}, e.loadRawJSON = async (e, ...t) => {
			let r = l(e);
			return r === null ? n(e, ...t) : JSON.parse(await d(r));
		};
	});
	let f = {
		getItem: (e) => o({
			op: "kv-get",
			key: e
		}),
		setItem: (e, t) => o({
			op: "kv-set",
			key: e,
			value: t
		}),
		removeItem: (e) => o({
			op: "kv-remove",
			key: e
		})
	};
	s("StorageUtil", (e) => {
		e._getAsyncStorage = async () => f;
	});
})();
