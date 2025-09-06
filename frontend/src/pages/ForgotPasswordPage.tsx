// src/pages/ForgotPasswordPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset, confirmPasswordReset } from "../api";

export default function ForgotPasswordPage() {
  const nav = useNavigate();
  const [stage, setStage] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    try {
      await requestPasswordReset(email);

      setMsg("A verification code was sent to your email.");
      setStage("confirm");
    } catch (e: any) {
      setErr(e?.message || "Could not send reset code.");
    } finally { setLoading(false); }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    try {
      await confirmPasswordReset(email, code, newPw);
      setMsg("Password updated. Redirecting to Login...");
      setTimeout(() => nav("/login", { state: { emailPrefill: email } }), 1000);
    } catch (e: any) {
      setErr(e?.message || "Could not reset password.");
    } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <div
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-md"
        style={{ marginTop: "-12vh" }}
      >
        <h1 className="mb-6 text-center text-3xl font-bold">Reset your password</h1>

        {stage === "request" && (
          <form onSubmit={handleRequest} className="space-y-5 text-lg px-2 sm:px-6">
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-brand focus:ring focus:ring-brand/30"
                required autoComplete="email" disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2 text-lg font-medium text-white transition hover:brightness-95 disabled:opacity-60">
              {loading ? "Sending..." : "Send reset code"}
            </button>
            {msg && <p className="text-base text-green-700">{msg}</p>}
            {err && <p className="text-base text-red-600">{err}</p>}
          </form>
        )}

        {stage === "confirm" && (
          <form onSubmit={handleConfirm} className="space-y-5 text-lg px-2 sm:px-6">
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">Verification code</label>
              <input
                value={code} onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-brand focus:ring focus:ring-brand/30"
                required disabled={loading} inputMode="numeric"
              />
            </div>
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">New password</label>
              <input
                type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-brand focus:ring focus:ring-brand/30"
                required autoComplete="new-password" disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500 text-center">
              </p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2 text-lg font-medium text-white transition hover:brightness-95 disabled:opacity-60">
              {loading ? "Updating..." : "Set new password"}
            </button>
            {msg && <p className="text-base text-green-700">{msg}</p>}
            {err && <p className="text-base text-red-600">{err}</p>}
          </form>
        )}

        <div className="mt-6 text-center text-lg text-gray-600">
          <Link to="/login" className="font-medium text-brand hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
