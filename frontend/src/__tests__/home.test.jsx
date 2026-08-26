import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Component tests for the v3 UI. MSW (set up in setup.js) speaks the real
 * API contract; each test renders through the same providers as the app.
 */

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

async function renderHome() {
  const { default: HomePage } = await import("@/pages/HomePage");
  const { AuthProvider, ThemeProvider } = await import("@/lib/context");
  const Wrapper = makeWrapper();
  const utils = render(
    <ThemeProvider>
      <AuthProvider>
        <Wrapper>
          <HomePage />
        </Wrapper>
      </AuthProvider>
    </ThemeProvider>
  );
  return utils;
}

describe("HomePage", () => {
  beforeEach(async () => {
    // Reset MSW db to known state
    const { db } = await import("./setup");
    db.tasks = [
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
    ];
  });

  it("renders tasks from the API", async () => {
    await renderHome();

    await waitFor(() =>
      expect(screen.getByText("Ship the v3 redesign")).toBeInTheDocument()
    );
    expect(screen.getByText("Pay phone bill")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("2 tasks shown")
    );
  });

  it("filters by status tab", async () => {
    const user = userEvent.setup();
    await renderHome();

    await waitFor(() =>
      expect(screen.getByText("Ship the v3 redesign")).toBeInTheDocument()
    );
    await user.click(screen.getByRole("button", { name: /^Ongoing/ }));

    await waitFor(() =>
      expect(screen.queryByText("Pay phone bill")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Ship the v3 redesign")).toBeInTheDocument();
  });

  it("adds a task via the composer and clears it optimistically", async () => {
    const user = userEvent.setup();
    const { db } = await import("./setup");
    await renderHome();

    await waitFor(() =>
      expect(screen.getByPlaceholderText(/What needs doing/i)).toBeInTheDocument()
    );
    await user.type(await screen.findByPlaceholderText(/What needs doing/i), "Water the plants");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Water the plants")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What needs doing/i)).toHaveValue("");
    expect(db.tasks.some((t) => t.title === "Water the plants")).toBe(true);
  });

  it("toggles a task complete and the check animates", async () => {
    const user = userEvent.setup();
    await renderHome();

    await waitFor(() =>
      expect(screen.getByText("Ship the v3 redesign")).toBeInTheDocument()
    );
    const checkboxes = screen.getAllByRole("checkbox", { name: "Mark as completed" });
    await user.click(checkboxes[0]);

    await waitFor(() =>
      expect(checkboxes[0].querySelector('[data-checked="true"]')).toBeInTheDocument()
    );
  });

  it("deletes a task after the exit animation hands off", async () => {
    const user = userEvent.setup();
    await renderHome();

    await waitFor(() =>
      expect(screen.getByText("Ship the v3 redesign")).toBeInTheDocument()
    );
    await user.click(screen.getByRole("button", { name: /Delete "Ship the v3 redesign"/ }));

    await waitFor(() =>
      expect(screen.queryByText("Ship the v3 redesign")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Pay phone bill")).toBeInTheDocument();
  });

  it("renders skeleton cards while loading", async () => {
    const { server, http, HttpResponse } = await import("./setup");
    server.use(
      http.get("*/api/tasks", async () => {
        await new Promise((r) => setTimeout(r, 80));
        return HttpResponse.json({ tasks: [], pagination: {}, activeCount: 0, completeCount: 0 });
      })
    );

    await renderHome();
    expect(screen.getByLabelText("Loading tasks")).toBeInTheDocument();
  });
});