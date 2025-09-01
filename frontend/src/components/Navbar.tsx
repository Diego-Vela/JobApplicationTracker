import { useEffect, useState } from "react";
import { getToken, clearToken } from "../api"; // <= from your api.ts

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  // Keep in sync on this tab and across tabs
  useEffect(() => {
    const sync = () => setIsLoggedIn(!!getToken());
    window.addEventListener("storage", sync); // fires when token changes in other tabs
    return () => window.removeEventListener("storage", sync);
  }, []);

  const handleSignOut = () => {
    clearToken();           // just clears localStorage token
    setIsLoggedIn(false);   // update UI immediately
    window.location.href = "/"; // optional redirect
  };

  return (
    <header className="sticky top-0 z-10 bg-brand text-white shadow">
      <nav
        className="mx-auto flex w-full max-w-screen-lg min-w-[320px] items-center justify-between px-4 py-3"
        aria-label="Primary"
      >
        {/* Brand */}
        <a href="/" className="font-bold text-[clamp(1.125rem,2vw,1.5rem)]">
          Jobblet
        </a>

        {/* Desktop actions */}
        <div className="hidden gap-2 sm:flex">
          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="rounded-lg bg-white px-4 py-2 text-[clamp(0.95rem,1.6vw,1.0625rem)] text-blue-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-300"
            >
              Sign out
            </button>
          ) : (
            <>
              <a
                href="/login"
                className="rounded-lg px-4 py-2 text-[clamp(0.95rem,1.6vw,1.0625rem)] ring-offset-2 transition hover:brightness-95 focus:outline-none focus-visible:ring focus-visible:ring-blue-300"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="rounded-lg bg-white px-4 py-2 text-[clamp(0.95rem,1.6vw,1.0625rem)] text-blue-700 ring-offset-2 transition hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-300"
              >
                Sign up
              </a>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden rounded-md p-2 focus:outline-none focus-visible:ring focus-visible:ring-blue-300"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="mt-1 block h-0.5 w-6 bg-white" />
          <span className="mt-1 block h-0.5 w-6 bg-white" />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/20">
          <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-2">
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="block w-full text-left rounded-md bg-white px-3 py-2 text-blue-700 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-300"
              >
                Sign out
              </button>
            ) : (
              <>
                <a
                  href="/login"
                  className="block rounded-md px-3 py-2 hover:bg-white/10 focus:outline-none focus-visible:ring focus-visible:ring-blue-300"
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  className="mt-1 block rounded-md bg-white px-3 py-2 text-blue-700 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-300"
                >
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
