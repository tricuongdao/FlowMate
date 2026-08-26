/**
 * Shared auth chrome: split layout with a quiet brand panel on desktop,
 * single centered card on mobile. The panel copy states what the product
 * does: no marketing fog.
 */
const AuthLayout = ({ title, subtitle, children }) => (
  <div className="grid min-h-dvh lg:grid-cols-[1fr_460px]">
    {/* Brand panel */}
    <div className="auth-glow relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
      <div className="flex items-center gap-2.5">
        <FlowMark className="size-6 text-flow-600 dark:text-flow-400" />
        <span className="display text-lg font-semibold">Flow Mate</span>
      </div>

      <div className="max-w-md">
        <h2 className="display text-4xl font-semibold leading-[1.08]">
          Your day,
          <br />
          in flow.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          A calm place for the things you want to get done. It handles due dates,
          overdue nudges, live search, and progress that saves itself.
        </p>

        <ul className="mt-8 space-y-3 text-sm text-muted">
          {[
            "Tasks scoped to your account",
            "Due dates with gentle overdue nudges",
            "Instant search across every title",
          ].map((line) => (
            <li key={line} className="flex items-center gap-2.5">
              <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-flow-600 dark:text-flow-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3.5 8.5l3 3 6-6.5" />
              </svg>
              {line}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted/70">Flow Mate v3 · MIT</p>
    </div>

    {/* Form column */}
    <div className="flex items-center justify-center px-5 py-12 sm:px-8">
      <div className="w-full max-w-[22rem] auth-enter">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <FlowMark className="size-6 text-flow-600 dark:text-flow-400" />
          <span className="display text-lg font-semibold">Flow Mate</span>
        </div>

        <h1 className="display text-2xl font-semibold">{title}</h1>
        <p className="mb-7 mt-1.5 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  </div>
);

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

export default AuthLayout;
