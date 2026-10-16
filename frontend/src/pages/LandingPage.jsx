import { Link } from "react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/context";
import { useReveal } from "@/lib/useReveal";
import InstrumentMark from "@/components/InstrumentMark";
import DemoDial from "@/components/DemoDial";

/**
 * The landing page is a specification sheet: one ruled plate, a real dial in
 * the first viewport, and two doors. No eyebrow kickers, no feature tiles, no
 * conversion copy.
 */

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

/** A ruled specification row: term left, reading right. */
function Spec({ term, children }) {
  return (
    <div className="hair-t grid grid-cols-1 gap-x-8 gap-y-1 py-3.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <dt className="legend pt-0.5 text-[var(--on-ground-2)]">{term}</dt>
      <dd className="text-[0.9375rem] leading-relaxed text-[var(--on-ground)]">
        {children}
      </dd>
    </div>
  );
}

function TopBand() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="hair-b">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="flex items-center gap-2.5">
          <InstrumentMark className="size-6 text-[var(--on-ground)]" />
          <span className="struck text-[0.95rem] uppercase tracking-[0.08em]">
            Flow Mate
          </span>
          <span className="legend hidden text-[var(--on-ground-2)] sm:inline">
            Movement FM-3
          </span>
        </span>

        <span className="flex items-center gap-1">
          <button
            type="button"
            className="icon-btn"
            aria-label={
              theme === "dark"
                ? "Switch to the light dial"
                : "Switch to the dark dial"
            }
            title="Dial"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
          <div className="mx-1 h-5 w-px bg-[var(--hair)]" aria-hidden="true" />
          <Link to="/login" className="btn btn-etch h-9 px-3 text-xs">
            Sign in
          </Link>
          <Link to="/register" className="btn btn-crown h-9 px-4 text-xs">
            Create account
          </Link>
        </span>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-4 pt-12 sm:px-6 sm:pt-16">
      <div className="enter mx-auto max-w-3xl text-center">
        <h1 className="struck text-[2.4rem] leading-[1.02] sm:text-[3.4rem]">
          Every date you owe,
          <br />
          on one dial.
        </h1>
        <p className="prose-measure mx-auto mt-5 text-[1.0625rem] leading-relaxed text-[var(--on-ground-2)]">
          Each task lands on the arc at the moment it falls due. The red needle
          sits at now. Work behind it prints as late.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register" className="btn btn-crown h-11 px-5 text-sm">
            Create account
          </Link>
          <Link to="/login" className="btn btn-pusher h-11 px-5 text-sm">
            Sign in
          </Link>
        </div>
      </div>

      <Reveal className="plate mt-10 sm:mt-12" style={{ transitionDelay: "80ms" }}>
        <DemoDial />
      </Reveal>
    </section>
  );
}

function Measurement() {
  const steps = [
    {
      n: "01",
      title: "Set a task",
      body: "Type a title, add a date if it has one. Tasks without a date stay in the list and off the dial.",
    },
    {
      n: "02",
      title: "Read the arc",
      body: "Day graduations run outward. Everything behind the red needle is late.",
    },
    {
      n: "03",
      title: "Close it",
      body: "A brass strike crosses the row. The task stays in the list, stamped with the day you closed it.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="struck max-w-2xl text-[1.9rem] leading-tight sm:text-[2.3rem]">
        Set it, read it, close it.
      </h2>

      {/* One ruled record, not three equal cards. The sequence is the content,
          so it stays numbered, but the numbers ride the same baseline as the
          step they introduce rather than heading a tile. */}
      <ol className="mt-10 border-t border-[var(--hair)]">
        {steps.map((s, i) => (
          <Reveal key={s.n} style={{ transitionDelay: `${i * 60}ms` }}>
            <li className="hair-b grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-5 gap-y-2 py-6 sm:grid-cols-[3rem_11rem_minmax(0,1fr)] sm:gap-x-8 sm:py-7">
              <span className="fig pt-1 text-sm text-[var(--brass-text)]">
                {s.n}
              </span>
              <h3 className="struck text-[1.15rem] leading-snug sm:pt-0.5">
                {s.title}
              </h3>
              <p className="col-start-2 text-[0.9375rem] leading-relaxed text-[var(--on-ground-2)] sm:col-start-3 sm:max-w-[54ch]">
                {s.body}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function Refusal() {
  const refuses = [
    [
      "Boards",
      "No stage to drag a task through. It is open, or it is closed.",
    ],
    [
      "Streaks",
      "Nothing here rewards you for showing up. There is no number to protect.",
    ],
    [
      "Reminders",
      "No email at dawn, no push at nine. You look when you want to.",
    ],
    [
      "Paid tiers",
      "The whole instrument is here. Nothing is held back.",
    ],
  ];

  return (
    <section className="hair-t hair-b bg-[var(--plate)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="struck max-w-2xl text-[1.9rem] leading-tight sm:text-[2.3rem]">
          What it leaves out.
        </h2>

        <dl className="mt-10 grid gap-x-12 sm:grid-cols-2">
          {refuses.map(([term, body], i) => (
            <Reveal
              key={term}
              className="hair-t py-5"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <dt className="struck text-[1.05rem]">{term}</dt>
              <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-[var(--on-ground-2)]">
                {body}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Specification() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="struck text-[1.9rem] leading-tight sm:text-[2.3rem]">
        Specification
      </h2>

      <dl className="mt-8 max-w-3xl">
        <Spec term="Register">
          Every task belongs to one account. The server scopes each query before
          it answers.
        </Spec>
        <Spec term="Measurement">
          A thirty-day horizon with a graduation at each day boundary. Tasks
          further out are counted and reported, not squeezed into the end of the
          arc.
        </Spec>
        <Spec term="Due dates">
          Red once the day has passed. Brass when it falls today or tomorrow.
          Nothing is coloured before it is owed.
        </Spec>
        <Spec term="Search">
          Full text across every title you have saved, narrowed as you type.
        </Spec>
        <Spec term="Scope">
          Narrow the list by status or by when you set it. The dial narrows too.
        </Spec>
        <Spec term="Dial">
          Dark by default, since most people read it at the end of a day. The
          light dial is one press away and the choice sticks.
        </Spec>
        <Spec term="Keyboard">
          Every control works without a pointer. Entrances respect a
          reduced-motion preference.
        </Spec>
        <Spec term="Running on">
          One Express service, one MongoDB register. Nobody else sees your tasks.
        </Spec>
      </dl>
    </section>
  );
}

function Close() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-2 sm:px-6">
      <Reveal className="plate flex flex-col items-start justify-between gap-6 p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <h2 className="struck text-[1.6rem] leading-tight sm:text-[2rem]">
            Set your first task.
          </h2>
          <p className="mt-2 max-w-[46ch] text-[0.9375rem] leading-relaxed text-[var(--on-ground-2)]">
            Nothing to configure first. A title is enough.
          </p>
        </div>
        <Link to="/register" className="btn btn-crown h-11 shrink-0 px-6 text-sm">
          Create account
        </Link>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="hair-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="flex items-center gap-2.5">
          <InstrumentMark
            className="size-5 text-[var(--on-ground-2)]"
            brass={false}
          />
          <span className="legend text-[var(--on-ground-2)]">
            Flow Mate · Movement FM-3 · MIT
          </span>
        </span>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            to="/login"
            className="text-[var(--on-ground-2)] transition-colors hover:text-[var(--on-ground)]"
          >
            Sign in
          </Link>
          <a
            className="text-[var(--on-ground-2)] transition-colors hover:text-[var(--on-ground)]"
            href="https://github.com/tricuongdao/FlowMate"
            target="_blank"
            rel="noreferrer"
          >
            Source
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <TopBand />
      <main>
        <Hero />
        <Measurement />
        <Refusal />
        <Specification />
        <Close />
      </main>
      <Footer />
    </div>
  );
}
