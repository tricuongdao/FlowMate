import InstrumentMark from "./InstrumentMark";

/**
 * The auth plate. The maker's mark, one line of intent, and a specification
 * table stated the way a movement states what it does. The form holds its own
 * column behind a hairline seam.
 */

const SPEC = [
  ["Register", "One account per person, no shared lists"],
  ["Due dates", "Red once the day has passed"],
  ["Search", "Full text across every title saved"],
  ["Session", "httpOnly cookie, no token in reach"],
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      {/* The movement card */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
        <div className="flex items-center gap-2.5">
          <InstrumentMark className="size-6 text-[var(--on-ground)]" />
          <span className="struck text-[0.95rem] uppercase tracking-[0.08em]">
            Flow Mate
          </span>
        </div>

        <div className="max-w-[30rem]">
          <h2 className="struck text-[2.75rem] leading-[1.02] xl:text-[3.25rem]">
            Your day,
            <br />
            in flow.
          </h2>
          <p className="prose-measure mt-5 text-[1.0625rem] leading-relaxed text-[var(--on-ground-2)]">
            Tasks measured against time. It says nothing until something is
            late, and closes a task the moment you do.
          </p>

          <table className="mt-10 w-full border-collapse text-left">
            <caption className="sr-only">What the instrument does</caption>
            <tbody>
              {SPEC.map(([k, v]) => (
                <tr key={k} className="hair-t">
                  <th
                    scope="row"
                    className="legend py-2.5 pr-6 align-top text-[var(--on-ground-2)]"
                  >
                    {k}
                  </th>
                  <td className="py-2.5 text-sm text-[var(--on-ground)]">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="legend text-[var(--on-ground-2)]">Movement FM-3 · MIT</p>
      </div>

      {/* The plate */}
      <div className="hair-l flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="enter w-full max-w-[21rem]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <InstrumentMark className="size-6 text-[var(--on-ground)]" />
            <span className="struck text-[0.95rem] uppercase tracking-[0.08em]">
              Flow Mate
            </span>
          </div>

          <h1 className="struck text-[1.6rem]">{title}</h1>
          <p className="mb-7 mt-1.5 text-sm text-[var(--on-ground-2)]">
            {subtitle}
          </p>

          {children}

          {footer && (
            <p className="mt-6 text-center text-sm text-[var(--on-ground-2)]">
              {footer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
