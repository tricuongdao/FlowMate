/**
 * Inspection harness (development only, not part of the shipped app).
 *
 * Serves frontend/dist with a mock API so every surface can be rendered and
 * captured without a live MongoDB, then drives Chrome over the DevTools
 * Protocol to screenshot it. Run:  node tools/shoot.mjs <job> <out.png>
 *
 * Jobs: landing | auth-register | app | app-mobile
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
  ".ico": "image/x-icon",
  ".json": "application/json",
};

/* ── Fixture register ──────────────────────────────────────────────────────
   Realistic deadline work: a mix of late, due today, ahead, and closed, plus
   two tasks with no date so the off-dial case is visible. Labels are the
   kind of thing this product's user actually writes. */

function day(offset, hour = 9) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

const TASKS = [
  { _id: "t1", title: "Invoice 0148 — Halden Studio", status: "active", dueDate: day(-6), completedAt: null, createdAt: day(-20), updatedAt: day(-6) },
  { _id: "t2", title: "Return the signed retainer", status: "active", dueDate: day(-2), completedAt: null, createdAt: day(-14), updatedAt: day(-2) },
  { _id: "t3", title: "Statistics problem set 6", status: "active", dueDate: day(0, 17), completedAt: null, createdAt: day(-5), updatedAt: day(-5) },
  { _id: "t4", title: "Send the revised scope to Mira", status: "active", dueDate: day(0, 20), completedAt: null, createdAt: day(-3), updatedAt: day(-3) },
  { _id: "t5", title: "Draft the Q1 summary", status: "active", dueDate: day(3), completedAt: null, createdAt: day(-9), updatedAt: day(-9) },
  { _id: "t6", title: "Client call — scope revision", status: "active", dueDate: day(4), completedAt: null, createdAt: day(-8), updatedAt: day(-8) },
  { _id: "t7", title: "Renew the domain before it lapses", status: "active", dueDate: day(9), completedAt: null, createdAt: day(-2), updatedAt: day(-2) },
  { _id: "t8", title: "Quarterly tax set-aside", status: "active", dueDate: day(14), completedAt: null, createdAt: day(-1), updatedAt: day(-1) },
  { _id: "t9", title: "Read the brief for the Ridley pitch", status: "active", dueDate: null, completedAt: null, createdAt: day(-1), updatedAt: day(-1) },
  { _id: "t10", title: "Ask the landlord about the parking spot", status: "active", dueDate: null, completedAt: null, createdAt: day(-2), updatedAt: day(-2) },
  { _id: "t11", title: "Submit timesheet", status: "complete", dueDate: day(-3), completedAt: day(-3), createdAt: day(-12), updatedAt: day(-3) },
  { _id: "t12", title: "Book the studio for Thursday", status: "complete", dueDate: day(-5), completedAt: day(-5), createdAt: day(-10), updatedAt: day(-5) },
];

const USER = { id: "u1", name: "Vinny Dao", email: "vinny@example.com" };

function envelope(url) {
  const status = url.searchParams.get("status") ?? "all";
  const search = (url.searchParams.get("search") ?? "").toLowerCase();
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = Number(url.searchParams.get("limit") ?? 12);
  let list = TASKS;
  if (status !== "all") list = list.filter((t) => t.status === status);
  if (search) list = list.filter((t) => t.title.toLowerCase().includes(search));
  const totalPages = Math.max(1, Math.ceil(list.length / limit));
  return {
    tasks: list.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      totalItems: list.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    activeCount: TASKS.filter((t) => t.status === "active").length,
    completeCount: TASKS.filter((t) => t.status === "complete").length,
  };
}

/* ── Server ──────────────────────────────────────────────────────────────── */

function serve() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const json = (body, code = 200) => {
      res.writeHead(code, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };

    if (url.pathname === "/api/auth/me") return json({ user: USER });
    if (url.pathname === "/api/tasks") return json(envelope(url));
    if (url.pathname.startsWith("/api/")) return json({ message: "ok" });

    let file = path.join(DIST, url.pathname === "/" ? "index.html" : url.pathname);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(DIST, "index.html");
    }
    res.writeHead(200, {
      "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
    });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

/* ── Minimal CDP client ──────────────────────────────────────────────────── */

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  static async attach(port) {
    for (let i = 0; i < 80; i += 1) {
      try {
        const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
        if (page) {
          const ws = new WebSocket(page.webSocketDebuggerUrl);
          await new Promise((res, rej) => {
            ws.addEventListener("open", res, { once: true });
            ws.addEventListener("error", rej, { once: true });
          });
          return new Cdp(ws);
        }
      } catch {
        /* browser still coming up */
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error("could not attach to Chrome");
  }
}

/* ── Jobs ────────────────────────────────────────────────────────────────── */

const JOBS = {
  landing: { path: "/", width: 1440, height: 1000, full: true },
  "auth-register": { path: "/register", width: 1440, height: 900, full: true },
  "auth-login": { path: "/login", width: 1440, height: 900, full: false },
  app: { path: "/app", width: 1440, height: 1000, full: true },
  "app-desktop-fold": { path: "/app", width: 1440, height: 900, full: false },
  "app-mobile": { path: "/app", width: 390, height: 844, full: true },
  "landing-mobile": { path: "/", width: 390, height: 844, full: true },
  "auth-mobile": { path: "/register", width: 390, height: 844, full: true },
  "app-light": { path: "/app", width: 1440, height: 900, full: false, scheme: "light" },
  // Full page, light dial: the only capture in the set that contains a closed
  // row, which is what the completion strike needs to be judged from.
  "app-light-full": { path: "/app", width: 1440, height: 1000, full: true, scheme: "light" },
  "app-mobile-light": { path: "/app", width: 390, height: 844, full: true, scheme: "light" },
  "landing-light": { path: "/", width: 1440, height: 1000, full: true, scheme: "light" },
  "app-narrow": { path: "/app", width: 768, height: 900, full: true },
  notfound: { path: "/nope", width: 1440, height: 800, full: false },
};

async function main() {
  const [, , jobName, outArg] = process.argv;
  const job = JOBS[jobName];
  if (!job) throw new Error(`unknown job: ${jobName}`);

  const out = path.resolve(ROOT, "..", outArg);
  fs.mkdirSync(path.dirname(out), { recursive: true });

  const { server, port } = await serve();
  const debugPort = 9222 + Math.floor(Math.random() * 300);
  const profile = path.join(ROOT, "node_modules", ".chrome-profile");
  fs.rmSync(profile, { recursive: true, force: true });

  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${job.width},${job.height}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  try {
    const cdp = await Cdp.attach(debugPort);
    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: job.width,
      height: job.height,
      deviceScaleFactor: 1,
      mobile: job.width < 600,
    });
    // The dark dial is the default; a job can ask for the light one, which is
    // what the visitor gets when their system prefers it.
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-color-scheme", value: job.scheme ?? "dark" },
        { name: "prefers-reduced-motion", value: "no-preference" },
      ],
    });

    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}${job.path}` });
    await new Promise((r) => setTimeout(r, 2600));

    // Settle entrance and reveal animation, then settle again: a hidden
    // element reads as a missing one and gets "fixed" into a regression.
    await cdp.send("Runtime.evaluate", {
      expression: `
        document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
        document.querySelectorAll('.enter, .needle').forEach(function (el) {
          el.style.animation = 'none';
          el.style.transition = 'none';
          el.style.opacity = '1';
        });
        window.scrollTo(0, 0);
      `,
    });
    await new Promise((r) => setTimeout(r, 700));

    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: Boolean(job.full),
    });
    fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
    console.log(`wrote ${out}  (${job.width}x${job.height}${job.full ? " full-page" : ""})`);
  } finally {
    chrome.kill();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
