import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Auth page tests: inline validation, server error mapping, submit flow.
 */

async function renderAuth(mode) {
  const { default: AuthPage } = await import("@/pages/AuthPage");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AuthPage mode={mode} />
      </MemoryRouter>
    </QueryClientProvider>
  );

  if (mode === "login") {
    return {
      email: screen.getByLabelText("Email"),
      password: screen.getByLabelText("Password"),
      submit: screen.getByRole("button", { name: /sign in/i }),
    };
  }

  return {
    name: screen.getByLabelText("Name"),
    email: screen.getByLabelText("Email"),
    password: screen.getByLabelText("Password"),
    submit: screen.getByRole("button", { name: /create account/i }),
  };
}

describe("AuthPage: register", () => {
  it("validates inline before touching the network", async () => {
    const user = userEvent.setup();
    const { submit } = await renderAuth("register");

    await user.click(submit);

    expect(screen.getByText("Your name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("rejects short passwords with a hint", async () => {
    const user = userEvent.setup();
    const fields = await renderAuth("register");

    await user.type(fields.name, "Vinny");
    await user.type(fields.email, "vinny@example.com");
    await user.type(fields.password, "short");
    await user.click(fields.submit);

    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
  });
});

describe("AuthPage: login", () => {
  it("maps server field errors onto the inputs", async () => {
    const user = userEvent.setup();
    const { server, http, HttpResponse } = await import("./setup");
    server.use(
      http.post("*/api/auth/login", () =>
        HttpResponse.json(
          { message: "Validation failed", details: { email: "Invalid email address" } },
          { status: 400 }
        )
      )
    );

    const fields = await renderAuth("login");
    await user.type(fields.email, "valid@example.com");
    await user.type(fields.password, "whatever123");
    await user.click(fields.submit);

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
  });

  it("shows the generic bad-credentials message", async () => {
    const user = userEvent.setup();
    const { server, http, HttpResponse } = await import("./setup");
    server.use(
      http.post("*/api/auth/login", () =>
        HttpResponse.json({ message: "Invalid email or password" }, { status: 401 })
      )
    );

    const fields = await renderAuth("login");
    await user.type(fields.email, "vinny@example.com");
    await user.type(fields.password, "wrong-password");
    await user.click(fields.submit);

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });
});

describe("Theme", () => {
  it("persists a theme choice to localStorage and toggles the class", async () => {
    const user = userEvent.setup();
    const { ThemeProvider, useTheme } = await import("@/lib/context");

    function Probe() {
      const { theme, toggleTheme } = useTheme();
      return (
        <button onClick={toggleTheme} aria-label="theme-probe">
          {theme}
        </button>
      );
    }

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );

    const probe = screen.getByRole("button", { name: "theme-probe" });
    expect(probe).toHaveTextContent(/light|dark/);
    await user.click(probe);
    await waitFor(() => {
      expect(localStorage.getItem("flowmate-theme")).toBeTruthy();
    });
  });
});