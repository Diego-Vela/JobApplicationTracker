export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-10">
      <section className="text-center">
        <h2 className="mb-4 font-extrabold leading-tight text-[clamp(1.75rem,4vw,2.5rem)]">
          Jobblet helps you track your job hunt with ease
        </h2>

        <p className="mx-auto mb-8 max-w-prose text-[clamp(0.95rem,1.8vw,1.125rem)] text-gray-600">
          Upload resumes, manage applications, add notes, and keep everything
          organized in one place.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/signup"
            className="rounded-lg bg-brand px-5 py-3 text-white transition hover:brightness-95 focus:outline-none focus-visible:ring focus-visible:ring-blue-300 text-[clamp(0.95rem,1.6vw,1.0625rem)]"
            aria-label="Get started with Jobblet"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 transition hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-gray-300 text-[clamp(0.95rem,1.6vw,1.0625rem)]"
            aria-label="Log in to Jobblet"
          >
            Log In
          </a>
        </div>
      </section>
    </main>
  );
}
