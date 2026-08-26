import "@testing-library/jest-dom/vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

/**
 * jsdom polyfills: matchMedia, localStorage, location.assign stub.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", {
  writable: true,
  value: localStorageMock,
});

/** location.assign is readonly in jsdom: replace the whole object. */
const originalLocation = window.location;
delete window.location;
window.location = {
  ...originalLocation,
  assign: () => {},
  reload: () => {},
};

/**
 * Shared MSW server: default handlers speak the real API contract so
 * every test runs against realistic envelopes. Individual tests override
 * per test with server.use(...).
 */

export const db = {
  user: { id: "u1", email: "vinny@example.com", name: "Vinny Dao" },
  tasks: [
    {
      _id: "t1",
      title: "Ship the v3 redesign",
      status: "active",
      dueDate: null,
      completedAt: null,
      createdAt: "2026-08-20T10:00:00.000Z",
      updatedAt: "2026-08-20T10:00:00.000Z",
    },
    {
      _id: "t2",
      title: "Pay phone bill",
      status: "complete",
      dueDate: null,
      completedAt: "2026-08-21T15:30:00.000Z",
      createdAt: "2026-08-19T09:00:00.000Z",
      updatedAt: "2026-08-21T15:30:00.000Z",
    },
  ],
};

export function envelope(tasks = db.tasks, extra = {}) {
  return {
    tasks,
    pagination: {
      page: 1,
      limit: 6,
      totalItems: tasks.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    activeCount: tasks.filter((t) => t.status === "active").length,
    completeCount: tasks.filter((t) => t.status === "complete").length,
    ...extra,
  };
}

const handlers = [
  http.get("*/api/auth/me", () => HttpResponse.json({ user: db.user })),
  http.get("*/api/tasks", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? "all";
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    let tasks = db.tasks;
    if (status !== "all") tasks = tasks.filter((t) => t.status === status);
    if (search) tasks = tasks.filter((t) => t.title.toLowerCase().includes(search));
    return HttpResponse.json(envelope(tasks));
  }),
  http.post("*/api/tasks", async ({ request }) => {
    const body = await request.json();
    const task = {
      _id: `t${Math.random().toString(36).slice(2, 8)}`,
      title: body.title,
      status: "active",
      dueDate: body.dueDate ?? null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.tasks.unshift(task);
    return HttpResponse.json(task, { status: 201 });
  }),
  http.put("*/api/tasks/:id", async ({ request, params }) => {
    const body = await request.json();
    const task = db.tasks.find((t) => t._id === params.id);
    if (!task) return HttpResponse.json({ message: "Task not found" }, { status: 404 });
    Object.assign(task, body);
    if (body.status === "complete") task.completedAt = new Date().toISOString();
    if (body.status === "active") task.completedAt = null;
    return HttpResponse.json(task);
  }),
  http.delete("*/api/tasks/:id", ({ params }) => {
    db.tasks = db.tasks.filter((t) => t._id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

export const server = setupServer(...handlers);
export { http, HttpResponse } from "msw";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  localStorageMock.clear();
});
afterAll(() => server.close());
