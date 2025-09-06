// src/pages/SignupPage.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api"; 

type FieldErrors = Partial<Record<"email" | "password" | "confirm", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<FieldErrors>({});

  const abortRef = useRef<AbortController | null>(null);

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!EMAIL_RE.test(email)) e.email = "Enter a valid email address";
    if (password.length < 8) e.password = "Minimum 8 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setErr(null);
    if (!validate()) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      await register(email, password); // <-- Cognito sign-up (sends verification email)
      navigate("/verify-email", { state: { emailPrefill: email } });
    } catch (e: any) {
      const code = e?.name || e?.code;
      if (code === "UsernameExistsException") {
        setErr("An account with this email already exists. Try logging in.");
      } else if (code === "InvalidPasswordException") {
        setErr(
          e?.message ||
            "Password does not meet requirements (min length, mixed characters)."
        );
      } else if (typeof e?.message === "string") {
        setErr(e.message);
      } else {
        setErr("Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    return () => abortRef.current?.abort(); // cleanup on unmount
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <div
        className="w-full max-w-lg rounded-xl bg-white p-12 shadow-xl"
        style={{ minHeight: "480px", marginTop: "-12vh" }} // Move box higher up and make it bigger
      >
        <h1 className="mb-6 text-center text-3xl font-bold">
          Create your <span className="text-brand">Jobblet</span> account
        </h1>

        {/* Verification notice banner */}
        <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          After signing up, you’ll receive an email with a verification link.
          Please check your inbox (and spam folder) and click the link before logging in.
        </p>

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
            {fieldErr.email && <p className="mt-1 text-sm text-red-600">{fieldErr.email}</p>}
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
              onChange={(e) => setPass(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
              required
              autoComplete="new-password"
            />
            {fieldErr.password && <p className="mt-1 text-sm text-red-600">{fieldErr.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              disabled={loading}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
              required
              autoComplete="new-password"
            />
            {fieldErr.confirm && <p className="mt-1 text-sm text-red-600">{fieldErr.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>

        <div className="mt-8 text-center text-base text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
