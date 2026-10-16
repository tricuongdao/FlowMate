import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import api, { apiError } from "@/lib/axios";
import { cn } from "@/lib/utils";
import AuthLayout from "@/components/AuthLayout";

/**
 * Registration and sign-in share one plate and one form. Validation is
 * inline and never alert-only, server field errors map back onto the inputs
 * that caused them, and the crown carries its own pending state — no
 * separate spinner beside it.
 */
export default function AuthPage({ mode }) {
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
      next.email = "That does not look like an email address";
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
      // Full reload: the restored cookie session boots the instrument cleanly.
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
      title={isRegister ? "Create account" : "Sign in"}
      subtitle={
        isRegister
          ? "Your tasks follow you across sessions."
          : "Pick up where you left off."
      }
      footer={
        <>
          {isRegister ? "Already have an account? " : "New to Flow Mate? "}
          <Link
            to={isRegister ? "/login" : "/register"}
            className="font-medium text-[var(--brass-text)] underline decoration-[color-mix(in_oklab,var(--brass)_50%,transparent)] underline-offset-4 transition-colors hover:decoration-[var(--brass-text)]"
          >
            {isRegister ? "Sign in" : "Create one"}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {isRegister && (
          <Field
            id="auth-name"
            label="Name"
            error={errors.name}
            inputRef={nameRef}
            input={{
              type: "text",
              autoComplete: "name",
              maxLength: 80,
              value: values.name,
              onChange: set("name"),
            }}
          />
        )}

        <Field
          id="auth-email"
          label="Email"
          error={errors.email}
          input={{
            type: "email",
            autoComplete: "email",
            value: values.email,
            onChange: set("email"),
          }}
        />

        <Field
          id="auth-password"
          label="Password"
          error={errors.password}
          hint={isRegister ? "8 characters or more." : undefined}
          input={{
            type: "password",
            autoComplete: isRegister ? "new-password" : "current-password",
            value: values.password,
            onChange: set("password"),
          }}
        />

        <button
          type="submit"
          disabled={pending}
          className="btn btn-crown h-10 w-full text-sm"
        >
          {pending ? "One moment…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}

function Field({ id, label, error, hint, input, inputRef }) {
  return (
    <div>
      <label htmlFor={id} className="legend mb-1.5 block text-[var(--on-ground-2)]">
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn("field px-3 py-2 text-[0.9375rem]")}
        {...input}
      />
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs font-medium text-[var(--late)]"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-[var(--on-ground-2)]">{hint}</p>
      ) : null}
    </div>
  );
}
