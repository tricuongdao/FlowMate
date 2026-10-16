/**
 * Layout measurement (development only). Reports the live widths and heights
 * the dial actually receives, so a breakpoint decision is made on numbers
 * rather than on a screenshot.
 * Run:  node tools/measure.mjs [width] [height]
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const CHROME =
  "C:\\Users\\cuong\\.cache\\puppeteer\\chrome\\win64-153.0.8010.36\\chrome-win64\\chrome.exe";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};

const day = (o, h = 9) => {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  d.setDate(d.getDate() + o);
  return d.toISOString();
};
const TASKS = [
  { _id: "t1", title: "Late one", status: "active", dueDate: day(-6), completedAt: null, createdAt: day(-20), updatedAt: day(-6) },
  { _id: "t2", title: "Late two", status: "active", dueDate: day(-2), completedAt: null, createdAt: day(-14), updatedAt: day(-2) },
  { _id: "t3", title: "Today", status: "active", dueDate: day(0, 17), completedAt: null, createdAt: day(-5), updatedAt: day(-5) },
  { _id: "t4", title: "Plus nine", status: "active", dueDate: day(9), completedAt: null, createdAt: day(-2), updatedAt: day(-2) },
  { _id: "t5", title: "Plus fourteen", status: "active", dueDate: day(14), completedAt: null, createdAt: day(-1), updatedAt: day(-1) },
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const json = (b) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(b));
  };
  if (url.pathname === "/api/auth/me") return json({ user: { id: "u1", name: "Vinny Dao" } });
  if (url.pathname === "/api/tasks")
    return json({
      tasks: TASKS,
      pagination: { page: 1, limit: 12, totalItems: 5, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      activeCount: 5,
      completeCount: 0,
    });
  if (url.pathname.startsWith("/api/")) return json({ message: "ok" });
  let file = path.join(DIST, url.pathname === "/" ? "index.html" : url.pathname);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html");
  res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const dbg = 9900 + Math.floor(Math.random() * 90);
const profile = path.join(ROOT, "node_modules", ".chrome-measure");
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${dbg}`, `--user-data-dir=${profile}`, "--no-first-run", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });

let ws;
for (let i = 0; i < 80 && !ws; i += 1) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${dbg}/json/list`)).json();
    const p = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
    if (p)
      ws = await new Promise((res, rej) => {
        const s = new WebSocket(p.webSocketDebuggerUrl);
        s.addEventListener("open", () => res(s), { once: true });
        s.addEventListener("error", rej, { once: true });
      });
  } catch {
    await new Promise((r) => setTimeout(r, 250));
  }
}
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  const p = pending.get(m.id);
  if (p) {
    pending.delete(m.id);
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
  }
});
const send = (method, params = {}) => {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise((res, rej) => pending.set(i, { resolve: res, reject: rej }));
};
const ev = async (expression) =>
  (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.value;

const rect = (sel) =>
  `(function(){var e=document.querySelector('${sel}');if(!e)return 'absent';var r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)].join(' ')+' | w='+Math.round(r.width)+' h='+Math.round(r.height)})()`;

await send("Runtime.enable");
await send("Page.enable");

for (const w of [1920, 1440, 1280, 1024, 900, 768, 390]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: 900,
    deviceScaleFactor: 1,
    mobile: w < 600,
  });
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/app` });
  await new Promise((r) => setTimeout(r, 2200));

  const form = await ev(
    "document.querySelector('.dial__svg')?.dataset.sweep ? 'ARC' : 'STICK'"
  );
  console.log(`\n── ${w}px ── dial form: ${form}`);
  console.log("   main        ", await ev(rect("main")));
  console.log("   measuring   ", await ev(rect("section[aria-label='Time dial']")));
  console.log("   .dial       ", await ev(rect(".dial")));
  console.log("   .dial__svg  ", await ev(rect(".dial__svg")));
  console.log("   registers   ", await ev(rect(".register")));
  console.log("   rack row    ", await ev(rect(".rack-row")));
  console.log("   svg over box", await ev(
    "(function(){var s=document.querySelector('.dial__svg');if(!s)return 'absent';var r=s.getBoundingClientRect();var p=s.closest('.plate').getBoundingClientRect();return 'plateBottom='+Math.round(p.bottom)+' svgTop='+Math.round(r.top)+' svgBottom='+Math.round(r.bottom)+' tailCut='+(Math.round(r.bottom)-Math.round(p.bottom))})()"
  ));
}

chrome.kill();
server.close();
process.exit(0);
