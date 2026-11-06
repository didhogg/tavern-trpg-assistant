// src/library/runtime/protocol.ts
var e = "trpg-library", t = [
	"DataLoader",
	"DataUtil",
	"BrewUtil2",
	"PrereleaseUtil",
	"ExcludeUtil",
	"StorageUtil",
	"Renderer",
	"Omnidexer",
	"UrlUtil",
	"Hist",
	"Parser",
	"SourceUtil"
], n = globalThis, r = {
	channel: e,
	type: "ready",
	codeSet: new URL(".", location.href).pathname.split("/").filter(Boolean).at(-1) ?? "",
	authorVersion: typeof n.VERSION_NUMBER == "string" ? n.VERSION_NUMBER : null,
	present: Object.fromEntries(t.map((e) => [e, n[e] !== void 0])),
	errors: [...n.__trpgFrameErrors ?? []]
};
parent.postMessage(r, location.origin);
