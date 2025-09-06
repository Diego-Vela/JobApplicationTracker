// src/pages/VerifyEmailPage.tsx
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { resendVerification } from "../api"

export default function VerifyEmailPage() {
  const location = useLocation()
  const prefillEmail =
    (location.state as { emailPrefill?: string })?.emailPrefill ?? ""

  const [email] = useState(prefillEmail)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [resentMsg, setResentMsg] = useState<string | null>(null)

  async function handleResend() {
    setErr(null)
    setResentMsg(null)
    setLoading(true)
    try {
      await resendVerification(email)
      setResentMsg("Verification email resent. Check your inbox and spam folder.")
    } catch (e: any) {
      const name = e?.name || e?.code
      if (name === "LimitExceededException") {
        setErr("Too many attempts. Please wait before trying again.")
      } else if (typeof e?.message === "string") {
        setErr(e.message)
      } else {
        setErr("Could not resend verification email.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Verify your <span className="text-brand">Jobblet</span> account
        </h1>
        <p className="mb-6 text-center text-gray-700">
          Please check your email inbox for a verification link to activate your account.
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Resending..." : "Resend Verification Email"}
          </button>
          {err && <p className="text-sm text-red-600">{err}</p>}
          {resentMsg && <p className="text-sm text-amber-700">{resentMsg}</p>}
        </div>
        <div className="mt-6 text-center text-sm text-gray-600">
          Already verified?{" "}
          <Link to="/login" state={{ emailPrefill: email }} className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
