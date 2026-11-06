// src/library/runtime/frame/early.ts
(() => {
	let e = "trpg-library", t = new URLSearchParams(location.search).get("frame") ?? "", n = globalThis, r = [];
	n.__trpgFrameErrors = r, addEventListener("error", (e) => {
		r.push(`${e.message} @ ${e.filename}:${e.lineno}`);
	}), addEventListener("unhandledrejection", (e) => {
		let t = e.reason;
		r.push(`unhandledrejection: ${t?.stack ?? String(e.reason)}`);
	});
	function i() {
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
		let t = i();
		Object.defineProperty(window, e, {
			configurable: !0,
			get: () => t
		});
	}
	let a = 1, o = /* @__PURE__ */ new Map();
	addEventListener("message", (t) => {
		let n = t.data;
		if (t.source !== parent || !n || n.channel !== e || n.type !== "response") return;
		let r = o.get(n.id);
		r && (o.delete(n.id), n.ok ? r.resolve(n.value) : r.reject(Error(n.error)));
	});
	function s(n) {
		return new Promise((r, i) => {
			let s = a++;
			o.set(s, {
				resolve: r,
				reject: i
			}), parent.postMessage({
				channel: e,
				type: "request",
				frame: t,
				id: s,
				...n
			}, location.origin);
		});
	}
	function c(e, t) {
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
	let l = new URL(".", location.href);
	function u(e) {
		let t = new URL(e, l);
		return t.origin !== l.origin || !t.pathname.startsWith(l.pathname) ? null : decodeURIComponent(t.pathname.slice(l.pathname.length));
	}
	let d = /* @__PURE__ */ new Map();
	function f(e) {
		let t = d.get(e);
		return t || (t = s({
			op: "file",
			path: e
		}).then((t) => {
			if (typeof t != "string") throw Error(`文件不存在：${e}`);
			return t;
		}), t.catch(() => d.delete(e)), d.set(e, t)), t;
	}
	c("DataUtil", (e) => {
		let t = e.loadJSON.bind(e), n = e.loadRawJSON.bind(e), r = /* @__PURE__ */ new Map();
		e.loadJSON = (n, ...i) => {
			let a = u(n);
			if (a === null) return t(n, ...i);
			let o = r.get(n);
			return o || (o = (async () => {
				let t = JSON.parse(await f(a));
				return await e.pDoMetaMerge(n, t, { isSkipMetaMergeCache: !0 }), t;
			})(), o.catch(() => r.delete(n)), r.set(n, o)), o;
		}, e.loadRawJSON = async (e, ...t) => {
			let r = u(e);
			return r === null ? n(e, ...t) : JSON.parse(await f(r));
		};
	});
	let p = {
		getItem: (e) => s({
			op: "kv-get",
			key: e
		}),
		setItem: (e, t) => s({
			op: "kv-set",
			key: e,
			value: t
		}),
		removeItem: (e) => s({
			op: "kv-remove",
			key: e
		})
	};
	c("StorageUtil", (e) => {
		e._getAsyncStorage = async () => p;
	});
})();
