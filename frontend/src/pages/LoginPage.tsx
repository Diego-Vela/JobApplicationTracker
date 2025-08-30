import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { setToken } from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // prefill from signup redirect if available
  const prefillEmail = (location.state as { emailPrefill?: string })?.emailPrefill ?? "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // include this if your backend sets cookies on login
        // credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let detail = "Login failed";
        try {
          const body = await res.json();
          detail = body?.detail || detail;
        } catch { /* ignore */ }
        throw new Error(detail);
      }

      const data = await res.json(); // { access_token, token_type }
      if (!data?.access_token) throw new Error("No token returned");
      setToken(data.access_token);
      navigate("/applications");

      // If backend returns a token, you could store it (for now in localStorage).
      // ⚠️ NOTE: httpOnly cookies are safer than localStorage for prod.
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      navigate("/applications");
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Log in to <span className="text-brand">Jobblet</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
