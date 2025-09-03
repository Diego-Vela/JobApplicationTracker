import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getToken, clearToken } from "../api";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!getToken());
    window.addEventListener("storage", sync);        // other tabs
    window.addEventListener("auth-changed", sync);   // same tab
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-changed", sync);
    };
  }, []);

  const handleSignOut = () => {
    clearToken();
    window.dispatchEvent(new Event("auth-changed"));
    setIsLoggedIn(false);
    navigate("/"); // SPA redirect
  };

  return (
    <header className="sticky top-0 z-10 bg-brand text-white shadow">
      <nav className="mx-auto flex w-full max-w-screen-lg min-w-[320px] items-center justify-between px-4 py-3" aria-label="Primary">
        <Link to="/" className="font-bold text-[clamp(1.125rem,2vw,1.5rem)]">Jobblet</Link>

        <div className="hidden gap-2 sm:flex">
          {isLoggedIn ? (
            <button onClick={handleSignOut} className="rounded-lg bg-white px-4 py-2 text-[clamp(0.95rem,1.6vw,1.0625rem)] text-blue-700 transition hover:bg-gray-100">
              Sign out
            </button>
          ) : (
            <>
              <Link to="/login"  className="rounded-lg px-4 py-2 text-[clamp(0.95rem,1.6vw,1.0625rem)] hover:brightness-95">Log in</Link>
              <Link to="/signup" className="rounded-lg bg-white px-4 py-2 text-[clamp(0.95rem,1.6vw,1.0625rem)] text-blue-700 hover:bg-gray-100">Sign up</Link>
            </>
          )}
        </div>

        <button className="sm:hidden rounded-md p-2 focus:outline-none" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
          <span className="block h-0.5 w-6 bg-white" />
          <span className="mt-1 block h-0.5 w-6 bg-white" />
          <span className="mt-1 block h-0.5 w-6 bg-white" />
        </button>
      </nav>

      {menuOpen && (
        <div className="sm:hidden border-t border-white/20">
          <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-2">
            {isLoggedIn ? (
              <button onClick={handleSignOut} className="block w-full text-left rounded-md bg-white px-3 py-2 text-blue-700 hover:bg-gray-100">
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login"  className="block rounded-md px-3 py-2 hover:bg-white/10">Log in</Link>
                <Link to="/signup" className="mt-1 block rounded-md bg-white px-3 py-2 text-blue-700 hover:bg-gray-100">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
