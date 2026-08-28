import { Link } from "react-router";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/context";
import { useReveal } from "@/lib/useReveal";

// Landing page for Flow Mate.
function FlowMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12.5l2.6 2.6L16.2 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Wraps children in a scroll-reveal. Stays invisible until in view. */
function Reveal({ className = "", style, children }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* A single read-only demo row. REAL markup, not a screenshot of chrome. */
function DemoRow({ title, meta, done = false, overdue = false }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${
          done
            ? "border-flow-500 bg-flow-500 text-white dark:border-flow-400 dark:bg-flow-400 dark:text-[#06281c]"
            : "border-border text-transparent"
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8.5l3 3 6-6.5" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[0.9375rem] leading-snug ${
            done ? "text-muted line-through decoration-flow-600/50" : ""
          }`}
        >
          {title}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-xs text-muted">
          {meta}
          {overdue && (
            <span className="inline-flex items-center rounded-full bg-danger-500/10 px-2 py-0.5 font-medium text-danger-600 dark:bg-danger-400/15 dark:text-danger-400">
              Overdue
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Sections ──────────────────────────────────────────────────────────── */

function LandingNav() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6">
      <div className="material-bar mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl pl-5 pr-3">
        <a href="/" className="flex items-center gap-2.5">
          <FlowMark className="size-6 text-flow-600 dark:text-flow-400" />
          <span className="display text-[1.05rem] font-semibold tracking-tight">Flow Mate</span>
        </a>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="icon-btn"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title="Theme"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <Link to="/login" className="btn btn-ghost h-9 px-3 text-sm">
            Sign in
          </Link>
          <Link to="/register" className="btn btn-primary h-9 px-4 text-sm">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-4 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-20">
      {/* Left: hanging text column, no side art */}
      <div className="page-enter">
        <p className="eyebrow">A calmer task list</p>
        <h1 className="display mt-4 text-[2.6rem] font-semibold leading-[1.04] sm:text-[3.4rem]">
          Your day,
          <br />
          in flow.
        </h1>
        <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted">
          Flow Mate keeps the things you want to get done in one quiet place.
          It uses due dates that nudge instead of nag, search that finds anything
          the moment you type, and progress that saves itself.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link to="/register" className="btn btn-primary h-11 px-5 text-[0.95rem]">
            Start free
            <ArrowRight className="size-4" />
          </Link>
          <Link to="/login" className="btn btn-ghost h-11 px-4 text-[0.95rem]">
            Sign in
          </Link>
        </div>
        <p className="mt-5 text-xs text-muted/70">
          No card. Your tasks stay in your account.
        </p>
      </div>

      {/* Right: a REAL demo, not a fake screenshot window */}
      <Reveal className="demo-card" style={{ transitionDelay: "120ms" }}>
        <div className="demo-head">
          <span>Today</span>
          <span className="flex items-center gap-2">
            <span className="demo-dot" aria-hidden="true" />
            2 of 3 done
          </span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          <DemoRow title="Ship the redesign" meta="Due Aug 26" />
          <DemoRow title="Call the contractor back" meta="Due Aug 24" overdue />
          <DemoRow title="Send the invoice" meta="Done Aug 21" done />
          <DemoRow title="Write the launch post" meta="Done Aug 19" done />
        </div>
      </Reveal>
    </section>
  );
}

function Workbench() {
  const steps = [
    {
      n: "01",
      title: "Capture",
      body: "Type a task, hit enter. No folders to pick, no project to name first. It lands in your list and stays.",
    },
    {
      n: "02",
      title: "Scope",
      body: "Toggle between ongoing and done, narrow by date, or search. The list reframes around what you're looking at. The deck never fills up.",
    },
    {
      n: "03",
      title: "Close",
      body: "Check it off and the row settles into a quiet done state. Your count updates on its own; nothing needs saving.",
    },
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 className="display mt-3 text-[1.9rem] font-semibold leading-tight sm:text-[2.2rem]">
            Three moves,
            <br />
            then it gets out of the way.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
            Most task apps ask you to manage the app. Flow Mate asks for a
            title and a due date, then steps back.
          </p>
        </div>
        <div className="space-y-px overflow-hidden rounded-xl border border-[var(--color-border)]">
          {steps.map((s) => (
            <Reveal key={s.n} className="flex gap-5 bg-[var(--color-paper-raised)] p-5 dark:bg-white/[0.03]">
              <span className="tnum select-none text-sm font-semibold text-flow-700 dark:text-flow-400">
                {s.n}
              </span>
              <div>
                <h3 className="text-[1.05rem] font-semibold">{s.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-paper-raised)] py-14 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <p className="display text-[1.7rem] font-semibold leading-[1.25] sm:text-[2.1rem]">
            A task list should feel like a cleared desk. It should not become
            another inbox demanding attention you don't have.
          </p>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">
            So Flow Mate is quiet by default. No badges that scream, no streaks
            to protect, no upgrade nudge. The one signal color you'll see is
            green for done and amber only when something is genuinely late.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Bento() {
  const tiles = [
    {
      kicker: "Due dates",
      title: "Gentle nudges, not alarms",
      body: "A task turns amber only once it's actually overdue. Until then it just sits there, patiently.",
    },
    {
      kicker: "Search",
      title: "Find any task instantly",
      body: "Type a word and the list narrows as you go. It covers every title you've ever saved.",
    },
    {
      kicker: "Privacy",
      title: "Yours, and only yours",
      body: "Every task is scoped to your account. Sign in anywhere and your flow follows you.",
    },
    {
      kicker: "Theme",
      title: "Light or dark, your call",
      body: "Switch whenever. The page crossfades instead of flashing, and it remembers.",
    },
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-8 max-w-xl">
        <p className="eyebrow">What's inside</p>
        <h2 className="display mt-3 text-[1.9rem] font-semibold leading-tight sm:text-[2.2rem]">
          Small details that respect your attention.
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t, i) => (
          <Reveal key={t.kicker} className="tile" style={{ transitionDelay: `${i * 60}ms` }}>
            <p className="tile-kicker">{t.kicker}</p>
            <h3 className="mt-2 text-[1.1rem] font-semibold">{t.title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{t.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 pt-4 sm:px-6">
      <Reveal className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-paper-raised)] px-6 py-12 text-center dark:bg-white/[0.03]">
        <h2 className="display text-[2rem] font-semibold leading-tight sm:text-[2.6rem]">
          Clear the deck.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[1.05rem] leading-relaxed text-muted">
          Make your first list in under a minute. No setup, no card.
        </p>
        <div className="mt-7 flex justify-center">
          <Link to="/register" className="btn btn-primary h-11 px-6 text-[0.95rem]">
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <FlowMark className="size-5 text-flow-600 dark:text-flow-400" />
          <span className="display text-sm font-semibold">Flow Mate</span>
          <span className="text-xs text-muted/70">v3 · MIT</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/login" className="foot-link">Sign in</Link>
          <Link to="/register" className="foot-link">Get started</Link>
          <a className="foot-link" href="https://github.com/tricuongdao/FlowMate" target="_blank" rel="noreferrer">Source</a>
        </nav>
        <p className="text-xs text-muted/70">© {new Date().getFullYear()} Flow Mate</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="backdrop-aurora" aria-hidden="true" />
      <LandingNav />
      <main>
        <Hero />
        <hr className="rule mx-auto max-w-5xl" />
        <Workbench />
        <Manifesto />
        <Bento />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
