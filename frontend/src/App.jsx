import { Toaster } from "sonner";
import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./lib/context";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

function Protected({ children }) {
  const { user, booting } = useAuth();
  if (booting) return null; // session restore: brief, silent
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, booting } = useAuth();
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
          },
        }}
      />
      <Routes>
        {/* Public landing: the product's front door */}
        <Route path="/" element={<LandingPage />} />
        {/* Authenticated app lives at /app */}
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
    </>
  );
}
