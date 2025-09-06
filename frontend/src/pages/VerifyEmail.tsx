// src/pages/VerifyEmailPage.tsx
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { confirmEmail, resendVerification } from "../api"

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail =
    (location.state as { emailPrefill?: string })?.emailPrefill ?? ""

  const [email, setEmail] = useState(prefillEmail)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resentMsg, setResentMsg] = useState<string | null>(null)

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setErr(null)
    setSuccess(null)
    setResentMsg(null)
    setLoading(true)

    try {
      await confirmEmail(email, code)
      setSuccess("Email verified successfully. You can now log in.")
      // Optionally auto-redirect to login after a short delay:
      setTimeout(() => navigate("/login", { state: { emailPrefill: email } }), 2000)
    } catch (e: any) {
      const name = e?.name || e?.code
      if (name === "CodeMismatchException") {
        setErr("Invalid verification code.")
      } else if (name === "ExpiredCodeException") {
        setErr("Verification code has expired. Please resend a new code.")
      } else if (typeof e?.message === "string") {
        setErr(e.message)
      } else {
        setErr("Verification failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setErr(null)
    setResentMsg(null)
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
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Verify your <span className="text-brand">Jobblet</span> account
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
              disabled={loading || !!prefillEmail}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              disabled={loading}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30 disabled:bg-gray-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          {resentMsg && <p className="text-sm text-amber-700">{resentMsg}</p>}
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Didn’t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="font-medium text-brand hover:underline"
          >
            Resend Email
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already verified?{" "}
          <Link to="/login" state={{ emailPrefill: email }} className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
