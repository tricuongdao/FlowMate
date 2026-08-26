import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import api, { apiError } from "@/lib/axios";
import { cn } from "@/lib/utils";
import AuthLayout from "@/components/AuthLayout";

/**
 * Login + Register share one page and one form. Client-side validation is
 * inline (never alert-only); server field errors map back onto the inputs.
 * The submit button shows its own pending state: no separate spinner.
 */
const AuthPage = ({ mode }) => {
  const isRegister = mode === "register";
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    if (isRegister) nameRef.current?.focus();
  }, [isRegister]);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (isRegister && !values.name.trim()) next.name = "Your name is required";
    if (!values.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = "That doesn't look like an email address";
    if (!values.password) next.password = "Password is required";
    else if (isRegister && values.password.length < 8)
      next.password = "At least 8 characters";
    return next;
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      document.getElementById(`auth-${first}`)?.focus();
      return;
    }
    setPending(true);
    try {
      await api.post(`/auth/${mode}`, {
        ...(isRegister ? { name: values.name.trim() } : {}),
        email: values.email.trim(),
        password: values.password,
      });
      // Full reload so the restored cookie session boots the app cleanly.
      window.location.assign("/app");
    } catch (error) {
      const data = error.response?.data;
      if (data?.details) {
        setErrors(data.details);
      } else {
        setErrors({ password: apiError(error) });
        toast.error(apiError(error));
      }
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title={isRegister ? "Create your account" : "Welcome back"}
      subtitle={
        isRegister
          ? "One account keeps your tasks in flow across sessions."
          : "Sign in to pick up where you left off."
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {isRegister && (
          <div>
            <label htmlFor="auth-name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="auth-name"
              ref={nameRef}
              type="text"
              autoComplete="name"
              maxLength={80}
              value={values.name}
              onChange={set("name")}
              aria-invalid={!!errors.name}
              className={cn("field w-full px-3.5 py-2.5", errors.name && "border-danger-500")}
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            aria-invalid={!!errors.email}
            className={cn("field w-full px-3.5 py-2.5", errors.email && "border-danger-500")}
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </div>

        <div>
          <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={values.password}
            onChange={set("password")}
            aria-invalid={!!errors.password}
            className={cn("field w-full px-3.5 py-2.5", errors.password && "border-danger-500")}
          />
          {errors.password && <FieldError>{errors.password}</FieldError>}
          {isRegister && !errors.password && (
            <p className="mt-1.5 text-xs text-muted">8+ characters.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary h-10 w-full text-sm"
        >
          {pending ? "One moment…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isRegister ? "Already have an account? " : "New to Flow Mate? "}
        <Link
          to={isRegister ? "/login" : "/register"}
          className="font-medium text-flow-700 underline-offset-2 hover:underline dark:text-flow-400"
        >
          {isRegister ? "Sign in" : "Create one"}
        </Link>
      </p>
    </AuthLayout>
  );
};

function FieldError({ children }) {
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-danger-600 dark:text-danger-400">
      {children}
    </p>
  );
}

export default AuthPage;
