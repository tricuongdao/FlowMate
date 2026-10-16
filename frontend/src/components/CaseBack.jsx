import { useNavigate } from "react-router";
import { LogOut, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useTheme } from "@/lib/context";
import InstrumentMark from "./InstrumentMark";

/**
 * The case back: the plate screwed to the top of the instrument carrying
 * the maker's mark, the case number, and the controls. Flat, hairline-ruled,
 * and always there — an instrument's case back does not float over its dial.
 */
export default function CaseBack() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast("Signed out", { description: "The register is closed." });
    navigate("/login");
  };

  return (
    <header className="hair-b bg-[var(--ground)]">
      <div className="mx-auto flex h-14 w-full max-w-[86rem] items-center justify-between gap-3 px-4 sm:px-6">
        <a
          href="/app"
          onClick={(e) => {
            e.preventDefault();
            window.location.assign("/app");
          }}
          className="flex items-center gap-2.5"
        >
          <InstrumentMark className="size-6 text-[var(--on-ground)]" />
          <span className="struck text-[0.95rem] uppercase tracking-[0.08em]">
            Flow Mate
          </span>
          <span className="legend hidden text-[var(--on-ground-2)] sm:inline">
            No. 3
          </span>
        </a>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="icon-btn"
            aria-label={
              theme === "dark" ? "Switch to the light dial" : "Switch to the dark dial"
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

          <span className="max-w-[9rem] truncate text-sm text-[var(--on-ground-2)]">
            {user?.name}
          </span>
          <button
            type="button"
            className="icon-btn"
            aria-label="Sign out"
            title="Sign out"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
