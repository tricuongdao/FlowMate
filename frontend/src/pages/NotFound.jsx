import { Link } from "react-router";
import InstrumentMark from "@/components/InstrumentMark";

/**
 * 404. The instrument reports an off-scale reading, with one way back.
 */
export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="enter text-center">
        <InstrumentMark className="mx-auto size-8 text-[var(--on-ground-2)]" brass={false} />
        <p className="seg mt-6 text-[3.5rem] leading-none text-[var(--late)]">
          404
        </p>
        <h1 className="struck mt-4 text-xl">Off the scale</h1>
        <p className="mx-auto mt-2 max-w-[32ch] text-sm leading-relaxed text-[var(--on-ground-2)]">
          Nothing is registered at this address.
        </p>
        <Link to="/" className="btn btn-crown mt-7 h-10 px-5 text-xs">
          Back to the dial
        </Link>
      </div>
    </div>
  );
}
