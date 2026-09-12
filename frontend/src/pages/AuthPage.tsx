import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AuthMode = "login" | "register";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, user } = useAuth();
  const location = useLocation();

  const state = location.state as { from?: { pathname?: string } } | null;
  const from = state?.from?.pathname ?? "/";

  if (user) {
    return <Navigate to={from} replace />;
  }

  function validate(): string | null {
    if (username.trim().length < 3) {
      return "Username must contain at least 3 characters";
    }
    if (username.trim().length > 30) {
      return "Username must contain at most 30 characters";
    }
    if (password.length < 12) {
      return "Password must contain at least 12 characters";
    }
    if (password.length > 128) {
      return "Password must contain at most 128 characters";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationError = validate();
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const credentials = { username: username.trim(), password };
      if (mode === "login") {
        await login(credentials);
      } else {
        await register(credentials);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsSubmitting(false);
    }
  }

  function switchMode(newMode: AuthMode) {
    setMode(newMode);
    setError(null);
  }

  const inputClassName =
    "w-full pl-10 pr-4 py-2.5 bg-bg-glass border border-border-default focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 rounded-xl text-sm text-text-primary placeholder:text-text-muted outline-none transition-all";

  const tabClassName = (active: boolean) =>
    `flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
      active
        ? "bg-accent-blue/15 text-accent-blue shadow-sm"
        : "text-text-muted hover:text-text-secondary"
    }`;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-bg-card border border-border-light rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="flex p-1 bg-bg-primary/50 rounded-xl border border-border-default mb-6">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={tabClassName(mode === "login")}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={tabClassName(mode === "register")}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              {mode === "login" ? "Welcome back" : "Get started"}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {mode === "login"
                ? "Sign in to access your favorite cities and search history"
                : "Create an account to save favorite locations and track forecasts"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl border border-accent-red/30 bg-accent-red/10 text-accent-red text-sm flex items-start gap-2.5">
              <svg
                className="w-5 h-5 shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alexander"
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={inputClassName}
                />
              </div>
              <p className="mt-1.5 text-xs text-text-muted">
                Must contain between 12 and 128 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-accent-blue hover:bg-accent-blue/90 text-bg-primary font-semibold text-sm rounded-xl transition-all shadow-lg shadow-accent-blue/20 hover:shadow-accent-blue/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-bg-primary/20 border-t-bg-primary rounded-full animate-spin" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
