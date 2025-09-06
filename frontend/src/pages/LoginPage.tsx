// src/pages/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login, resendVerification } from "../api"; // <-- from your new api.ts

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // prefill from signup redirect if available
  const prefillEmail =
    (location.state as { emailPrefill?: string })?.emailPrefill ?? "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resentMsg, setResentMsg] = useState<string | null>(null);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setErr(null);
    setResentMsg(null);
    setNeedsVerification(false);
    setLoading(true);

    try {
      // Cognito sign-in via Amplify; tokens are stored by the library
      await login(email, password);

      // If sign-in succeeds, just go to apps.
      navigate("/applications");
    } catch (e: any) {
      // Common Amplify/Cognito errors:
      //  - "UserNotConfirmedException": user must verify email
      //  - "NotAuthorizedException": bad credentials
      //  - "UserNotFoundException": no such user
      const name = e?.name || e?.code;

      if (name === "UserNotConfirmedException") {
        setNeedsVerification(true);
        setErr("Please verify your email to continue.");
      } else if (name === "NotAuthorizedException") {
        setErr("Incorrect email or password.");
      } else if (name === "UserNotFoundException") {
        setErr("No account found with that email.");
      } else if (typeof e?.message === "string") {
        setErr(e.message);
      } else {
        setErr("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setErr(null);
    setResentMsg(null);
    try {
      await resendVerification(email);
      setResentMsg("Verification email sent. Check your inbox and spam folder.");
    } catch (e: any) {
      const name = e?.name || e?.code;
      if (name === "LimitExceededException") {
        setErr("Too many attempts. Please wait a bit before trying again.");
      } else if (typeof e?.message === "string") {
        setErr(e.message);
      } else {
        setErr("Could not resend verification email.");
      }
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

          {needsVerification && (
            <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="mb-2">
                Your email isn’t verified yet. Enter the code sent to your inbox on the verification page,
                or resend the email below.
              </p>
              <div className="flex gap-2">
                <Link
                  to="/verify-email"
                  state={{ emailPrefill: email }}
                  className="rounded-md bg-amber-600 px-3 py-1.5 text-white hover:brightness-110"
                >
                  Go to Verify
                </Link>
                <button
                  type="button"
                  onClick={handleResend}
                  className="rounded-md border border-amber-600 px-3 py-1.5 text-amber-700 hover:bg-amber-100"
                >
                  Resend Email
                </button>
              </div>
              {resentMsg && <p className="mt-2 text-amber-700">{resentMsg}</p>}
            </div>
          )}
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
