import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {/* Heading */}
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Log in to <span className="text-brand">Jobblet</span>
        </h1>

        {/* Login form */}
        <form className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:ring focus:ring-brand/30"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:brightness-95 focus:outline-none focus-visible:ring focus-visible:ring-brand/50"
          >
            Log In
          </button>
        </form>

        {/* Extra links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-brand hover:underline"
            >
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            <a href="#" className="hover:underline">
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
