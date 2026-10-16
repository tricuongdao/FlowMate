import { Toaster } from "sonner";
import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./lib/context";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

/**
 * DIRECTION CONTRACT — Flow Mate, Movement FM-3 · seed 3aec6ba0
 *
 * THESIS: The task list as a precision chronograph: one arc measures the
 * commitment against time and a red needle marks now. It refuses the
 * category default of a greeting, a rounded composer card, segmented tabs,
 * and a stack of white task cards on a light ground.
 *
 * OWN-WORLD: A dark instrument case (#0e1216) holding a steel plate
 * (#e8e4da printing in #14181c) and a recessed dial (#12181d). Brass
 * (#b5863c) is the only metal and means the instrument acts; red (#d64b36)
 * means now and only now. Components are drawn, not assembled: chapter-ring
 * selector stops, subdial registers, a minute track, a ruled rack with
 * applied indices, an 18-degree strike where a strike belongs.
 *
 * STORY: Someone behind on a deadline opens this, sees how far past the
 * needle their late work sits, closes what is done, and leaves in seconds.
 *
 * FIRST VIEWPORT: Case back band across the top. Below it in one frame: the
 * arc dial as the primary read on the left — day graduations outward, task
 * stems inward, red needle, date and running time printed at its centre —
 * its three subdial registers beneath, and on the right the selector, the
 * wound composer with its minute track, and the racked register. The single
 * brass element on the page is the composer's Set.
 *
 * FORM: Grounded direction 6 of 7 (mid-century precision timekeeping),
 * assigned by concept-seed key 3aec6ba0, mode operate, code-led.
 *
 * FINISH: unreviewed and undocumented is unfinished; this build ends with
 * the finish review, the verdict, DESIGN.md, and every shipping raster
 * carrying its provenance.
 */

function Protected({ children }) {
  const { user, booting } = useAuth();
  if (booting) return null; // session restore: brief and silent
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, booting } = useAuth();

  return (
    <div id="fm-root">
      {/* The direction contract, emitted into the markup as the root's first
          child so a production build cannot drop it. */}
      <div hidden data-flow-mate-contract="3aec6ba0">
        THESIS: a precision chronograph — one arc measures commitment against
        time, a red needle marks now; no greeting card, no rounded composer,
        no stack of white task cards. OWN-WORLD: dark case #0e1216, steel
        plate #e8e4da printed in #14181c, recessed dial #12181d, brass #b5863c
        only where the instrument acts, red #d64b36 only for now. STORY: see
        how far past the needle the late work sits, close what is done, leave
        in seconds. FIRST VIEWPORT: case-back band; arc dial with day
        graduations outward and task stems inward and the date printed at its
        centre; three subdial registers beneath; selector, minute-track
        composer and racked register to the right; one brass control. FORM:
        grounded direction 6 of 7, concept-seed 3aec6ba0, mode operate,
        code-led. FINISH: unreviewed and undocumented is unfinished; this
        build ends with the finish review, the verdict, DESIGN.md, and every
        shipping raster carrying its provenance.
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "3px",
            fontFamily:
              '"Archivo Narrow", ui-sans-serif, system-ui, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/app"
          element={
            <Protected>
              <HomePage />
            </Protected>
          }
        />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          path="*"
          element={
            booting ? null : user ? <Navigate to="/app" replace /> : <NotFound />
          }
        />
      </Routes>
    </div>
  );
}
