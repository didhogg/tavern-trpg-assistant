// src/library/runtime/frame/early.ts
(() => {
	let e = [];
	globalThis.__trpgFrameErrors = e, addEventListener("error", (t) => {
		e.push(`${t.message} @ ${t.filename}:${t.lineno}`);
	}), addEventListener("unhandledrejection", (t) => {
		let n = t.reason;
		e.push(`unhandledrejection: ${n?.stack ?? String(t.reason)}`);
	});
})();
