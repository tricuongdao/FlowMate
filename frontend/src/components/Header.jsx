import { useNavigate } from "react-router";
import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth, useTheme } from "@/lib/context";
import { toast } from "sonner";

/**
 * The one earned translucent material in the app: a floating bar that
 * content scrolls beneath. Everything else is solid and quiet.
 */
const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast("Signed out", {
      description: "See you soon.",
    });
    navigate("/login");
  };

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6">
      <div className="material-bar mx-auto flex h-14 max-w-2xl items-center justify-between rounded-2xl pl-5 pr-3">
        <a
          href="/app"
          onClick={(e) => {
            e.preventDefault();
            window.location.assign("/app");
          }}
          className="flex items-center gap-2.5"
        >
          <FlowMark className="size-6 text-flow-600 dark:text-flow-400" />
          <span className="display text-[1.05rem] font-semibold tracking-tight">
            Flow Mate
          </span>
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

          <span className="max-w-[10rem] truncate text-sm font-medium text-muted">
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
};

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

export default Header;
