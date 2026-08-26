import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import Task from "../src/models/Task.js";
import User from "../src/models/User.js";

let mongod;
let app;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret";
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri("flowmate-test"));
  app = createApp(null); // no rate limiter in tests
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await Task.deleteMany({});
  await User.deleteMany({});
});

/** Register a user and return a cookie-persisting agent. */
async function registerAgent(name = "Vinny", email = null) {
  const agent = request.agent(app); // .agent() keeps cookies between calls
  const handle = name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
  const res = await agent.post("/api/auth/register").send({
    name,
    email: email || `${handle}@example.com`,
    password: "password123",
  });
  if (res.status !== 201) {
    throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { agent, user: res.body.user, userId: res.body.user.id };
}

describe("Health & misc", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("uptime");
  });

  it("returns 404 JSON for unknown API routes", async () => {
    const res = await request(app).get("/api/nope").expect(404);
    expect(res.body.message).toBe("Route not found");
  });
});

describe("Auth: POST /api/auth/register", () => {
  it("registers a user, sets an httpOnly session cookie, returns public profile", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Vinny", email: "vinny@example.com", password: "password123" })
      .expect(201);

    expect(res.body.user.email).toBe("vinny@example.com");
    expect(res.body.user.name).toBe("Vinny");
    expect(res.body.user.passwordHash).toBeUndefined();

    const cookie = res.headers["set-cookie"].join("; ");
    expect(cookie).toContain("token=");
    expect(cookie).toMatch(/httponly/i);
  });

  it("normalises the email to lowercase", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "MiXeD@ExAmPlE.com", password: "password123" })
      .expect(201);
    expect(res.body.user.email).toBe("mixed@example.com");
  });

  it("rejects duplicate emails with 409", async () => {
    await registerAgent("One", "dup@example.com");
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Two", email: "dup@example.com", password: "password123" })
      .expect(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("rejects short passwords with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "a@example.com", password: "short" })
      .expect(400);
    expect(res.body.details.password).toBeDefined();
  });

  it("rejects invalid emails with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "not-an-email", password: "password123" })
      .expect(400);
    expect(res.body.details.email).toBeDefined();
  });
});

describe("Auth: POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    await registerAgent("Login User", "login@example.com");
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "password123" })
      .expect(200);
    expect(res.body.user.email).toBe("login@example.com");
  });

  it("rejects wrong passwords with a generic 401", async () => {
    await registerAgent("Login User", "wrongpw@example.com");
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrongpw@example.com", password: "wrongpassword" })
      .expect(401);
    // Generic message: must not reveal which part was wrong
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("rejects unknown emails with the same generic 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@example.com", password: "password123" })
      .expect(401);
    expect(res.body.message).toBe("Invalid email or password");
  });
});

describe("Auth: session management", () => {
  it("GET /api/auth/me returns the signed-in user", async () => {
    const { agent, userId } = await registerAgent("Me User");
    const res = await agent.get("/api/auth/me").expect(200);
    expect(res.body.user.id).toBe(userId);
    expect(res.body.user.name).toBe("Me User");
  });

  it("GET /api/auth/me without a session returns 401", async () => {
    const res = await request(app).get("/api/auth/me").expect(401);
    expect(res.body.message).toBe("Not authenticated");
  });

  it("logout clears the cookie and invalidates the session client-side", async () => {
    const { agent } = await registerAgent("Out User");
    await agent.post("/api/auth/logout").expect(200);
    await agent.get("/api/auth/me").expect(401);
  });

  it("tampered tokens are rejected with 401", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", "token=not.a.jwt")
      .expect(401);
    expect(res.body.message).toBe("Invalid session");
  });
});

describe("Tasks require authentication", () => {
  it("GET /api/tasks without a session returns 401", async () => {
    await request(app).get("/api/tasks").expect(401);
  });

  it("POST /api/tasks without a session returns 401", async () => {
    await request(app).post("/api/tasks").send({ title: "x" }).expect(401);
  });
});

describe("POST /api/tasks (authenticated)", () => {
  it("creates a task owned by the current user", async () => {
    const { agent, userId } = await registerAgent();
    const res = await agent.post("/api/tasks").send({ title: "Write tests" }).expect(201);
    expect(res.body.title).toBe("Write tests");
    expect(res.body.status).toBe("active");
    expect(res.body.completedAt).toBeNull();
    expect(String(res.body.user)).toBe(userId);
  });

  it("creates a task with a due date", async () => {
    const { agent } = await registerAgent("Due", "due@example.com");
    const due = "2030-05-01T10:00:00.000Z";
    const res = await agent.post("/api/tasks").send({ title: "Future task", dueDate: due }).expect(201);
    expect(new Date(res.body.dueDate).toISOString()).toBe(due);
  });

  it("rejects empty titles and bad dates with 400 details", async () => {
    const { agent } = await registerAgent("Bad", "bad@example.com");
    const res = await agent.post("/api/tasks").send({ title: "", dueDate: "not-a-date" }).expect(400);
    expect(res.body.details.title).toBeDefined();
    expect(res.body.details.dueDate).toBeDefined();
  });

  it("rejects malformed JSON bodies with 400", async () => {
    const { agent } = await registerAgent("Json", "json@example.com");
    const res = await agent
      .post("/api/tasks")
      .set("Content-Type", "application/json")
      .send('{"title": ')
      .expect(400);
    expect(res.body.message).toBe("Malformed JSON body");
  });
});

describe("GET /api/tasks: scoping, filtering, pagination", () => {
  it("lists only the current user's tasks, newest first, with counts", async () => {
    const a = await registerAgent("Alice", "alice@example.com");
    const b = await registerAgent("Bob", "bob@example.com");

    await Task.create({ user: a.userId, title: "A-one" });
    await Task.create({ user: a.userId, title: "A-two" });
    await Task.create({ user: b.userId, title: "B-secret" });

    const res = await a.agent.get("/api/tasks").expect(200);
    expect(res.body.tasks.map((t) => t.title)).toEqual(["A-two", "A-one"]);
    expect(res.body.pagination.totalItems).toBe(2);
    expect(res.body.activeCount).toBe(2);
    expect(res.body.completeCount).toBe(0);

    const resB = await b.agent.get("/api/tasks").expect(200);
    expect(resB.body.tasks.map((t) => t.title)).toEqual(["B-secret"]);
  });

  it("paginates per user", async () => {
    const { agent, userId } = await registerAgent("Pager", "pager@example.com");
    for (let i = 1; i <= 7; i++) await Task.create({ user: userId, title: `Task ${i}` });

    const p1 = await agent.get("/api/tasks?page=1&limit=5").expect(200);
    expect(p1.body.tasks).toHaveLength(5);
    expect(p1.body.pagination.totalPages).toBe(2);
    expect(p1.body.pagination.hasNextPage).toBe(true);

    const p2 = await agent.get("/api/tasks?page=2&limit=5").expect(200);
    expect(p2.body.tasks).toHaveLength(2);
    expect(p2.body.pagination.hasPrevPage).toBe(true);
  });

  it("status filter narrows the list but counts stay global", async () => {
    const { agent, userId } = await registerAgent("Status", "status@example.com");
    await Task.create({ user: userId, title: "Open" });
    await Task.create({ user: userId, title: "Done", status: "complete", completedAt: new Date() });

    const res = await agent.get("/api/tasks?status=active").expect(200);
    expect(res.body.tasks.map((t) => t.title)).toEqual(["Open"]);
    expect(res.body.completeCount).toBe(1);
  });

  it("date filter today excludes older tasks", async () => {
    const { agent, userId } = await registerAgent("Dates", "dates@example.com");
    await Task.create({ user: userId, title: "Old task" });
    const ancient = await Task.create({ user: userId, title: "Ancient" });
    await Task.collection.updateOne(
      { _id: ancient._id },
      { $set: { createdAt: new Date("2020-01-01") } }
    );
    const res = await agent.get("/api/tasks?filter=today").expect(200);
    expect(res.body.pagination.totalItems).toBe(1);
    expect(res.body.tasks[0].title).toBe("Old task");
  });

  it("search matches titles via text index", async () => {
    const { agent, userId } = await registerAgent("Search", "search@example.com");
    await Task.create({ user: userId, title: "Buy groceries" });
    await Task.create({ user: userId, title: "Walk the dog" });
    await Task.create({ user: userId, title: "Grocery run for mum" });

    const res = await agent.get("/api/tasks?search=groceries").expect(200);
    // Text search stems words: "groceries" and "grocery" share a root,
    // so both tasks match either query.
    expect(res.body.tasks.map((t) => t.title).sort()).toEqual([
      "Buy groceries",
      "Grocery run for mum",
    ]);

    // Unrelated titles are excluded
    const none = await agent.get("/api/tasks?search=zebra").expect(200);
    expect(none.body.tasks).toHaveLength(0);
  });

  it("rejects invalid query params with 400", async () => {
    const { agent } = await registerAgent("Q", "query@example.com");
    const res = await agent.get("/api/tasks?filter=bogus&page=-1").expect(400);
    expect(res.body.message).toBe("Validation failed");
  });
});

describe("PUT /api/tasks/:id", () => {
  it("toggles to complete and sets completedAt server-side", async () => {
    const { agent, userId } = await registerAgent("Toggle", "toggle@example.com");
    const task = await Task.create({ user: userId, title: "Toggle me" });

    const res = await agent.put(`/api/tasks/${task._id}`).send({ status: "complete" }).expect(200);
    expect(res.body.status).toBe("complete");
    expect(res.body.completedAt).not.toBeNull();

    // A legitimate reopen clears completedAt
    const reopened = await agent.put(`/api/tasks/${task._id}`).send({ status: "active" }).expect(200);
    expect(reopened.body.status).toBe("active");
    expect(reopened.body.completedAt).toBeNull();
  });

  it("renames a task and updates its due date", async () => {
    const { agent, userId } = await registerAgent("Rename", "rename@example.com");
    const task = await Task.create({ user: userId, title: "Before" });

    const res = await agent
      .put(`/api/tasks/${task._id}`)
      .send({ title: "After", dueDate: "2031-01-01T00:00:00.000Z" })
      .expect(200);
    expect(res.body.title).toBe("After");
    expect(new Date(res.body.dueDate).toISOString()).toBe("2031-01-01T00:00:00.000Z");

    const cleared = await agent.put(`/api/tasks/${task._id}`).send({ dueDate: null }).expect(200);
    expect(cleared.body.dueDate).toBeNull();
  });

  it("returns 404 for another user's task: no existence leak", async () => {
    const owner = await registerAgent("Owner", "owner@example.com");
    const attacker = await registerAgent("Attacker", "attacker@example.com");

    const task = await Task.create({ user: owner.userId, title: "Not yours" });

    const res = await attacker.agent
      .put(`/api/tasks/${task._id}`)
      .send({ status: "complete" })
      .expect(404);
    expect(res.body.message).toBe("Task not found");

    await attacker.agent.delete(`/api/tasks/${task._id}`).expect(404);
  });

  it("returns 400 for a malformed id and rejects unknown fields", async () => {
    const { agent, userId } = await registerAgent("Ids", "ids@example.com");
    await Task.create({ user: userId, title: "x" });

    await agent.put("/api/tasks/not-an-id").send({ title: "y" }).expect(400);

    const mine = await Task.findOne({ user: userId });
    const cheat = await agent
      .put(`/api/tasks/${mine._id}`)
      .send({ status: "complete", completedAt: "1999-01-01" })
      .expect(400);
    expect(cheat.body.details.completedAt).toBeDefined();
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("deletes the user's own task", async () => {
    const { agent, userId } = await registerAgent("Del", "del@example.com");
    const task = await Task.create({ user: userId, title: "Delete me" });
    const res = await agent.delete(`/api/tasks/${task._id}`).expect(200);
    expect(res.body.message).toBe("Task deleted");
    expect(await Task.countDocuments()).toBe(0);
  });

  it("returns 404 for unknown id", async () => {
    const { agent } = await registerAgent("Del404", "del404@example.com");
    const unknownId = new mongoose.Types.ObjectId().toString();
    const res = await agent.delete(`/api/tasks/${unknownId}`).expect(404);
    expect(res.body.message).toBe("Task not found");
  });
});

describe("CORS / Origin handling", () => {
  it("allows same-origin requests (Origin == Host)", async () => {
    const server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    try {
      const { port } = server.address();
      const base = `http://127.0.0.1:${port}`;
      // Same-origin Origin header on an API route: CORS passes (401 follows,
      // because this fetch carries no session cookie).
      const res = await fetch(`${base}/api/auth/me`, { headers: { Origin: base } });
      expect(res.status).toBe(401);
      expect(res.headers.get("access-control-allow-origin")).toBe(base);
    } finally {
      server.close();
    }
  });

  it("allows origins on the CORS_ORIGINS allow-list", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Origin", "http://localhost:5173")
      .expect(401);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("rejects unknown origins with 403 before any auth logic", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Origin", "https://evil.example.com")
      .expect(403);
    expect(res.body.message).toBe("Origin not allowed by CORS");
  });

  it("answers preflights for allowed origins with credentials allowed", async () => {
    const res = await request(app)
      .options("/api/tasks")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST")
      .expect(204);
    expect(res.headers["access-control-allow-methods"]).toContain("POST");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("serves requests with no Origin header (curl, tests)", async () => {
    await request(app).get("/api/auth/me").expect(401);
  });
});
