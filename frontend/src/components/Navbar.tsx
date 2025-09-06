// src/components/Navbar.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link, NavLink, useLocation } from "react-router-dom";
import { logout, getCurrentUser } from "../api";
import { Hub } from "aws-amplify/utils"; // listen for Cognito auth events
import {
  Folder,
  FileText,
  Info as InfoIcon,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh login state (current Cognito user or null)
  const refreshAuth = async () => {
    const user = await getCurrentUser(); // from api.ts (Amplify)
    setIsLoggedIn(!!user);
  };

  useEffect(() => {
    // Initial check
    refreshAuth();

    // Listen to Amplify Auth events (signIn, signOut, token refresh, etc.)
    const unsub = Hub.listen("auth", () => {
      refreshAuth();
    });

    // Also refresh when route changes (useful after redirects)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => unsub();
  }, []);

  useEffect(() => {
    // Re-check on route changes (helps in SPA flows)
    refreshAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await logout(); // clears Amplify session
    } finally {
      setIsLoggedIn(false);
      setMenuOpen(false);
      navigate("/");
    }
  };

  const TabLink = ({
    to,
    label,
    Icon,
  }: {
    to: string;
    label: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[clamp(1.25rem,1.6vw,1.0625rem)] transition",
          isActive ? "bg-white/15 font-semibold" : "hover:bg-white/10",
        ].join(" ")
      }
      aria-current={location.pathname.startsWith(to) ? "page" : undefined}
      onClick={() => setMenuOpen(false)}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-10 bg-brand text-white shadow">
      <nav
        className="mx-auto flex w-full max-w-screen-lg min-w-[320px] items-center justify-between px-4 py-3"
        aria-label="Primary"
      >
        {/* Brand */}
        <Link
          to="/"
          className="font-bold text-[clamp(1.5rem,3vw,2.25rem)] flex-1 text-left"
          onClick={() => setMenuOpen(false)}
        >
          Jobblet
        </Link>

        {/* Tabs (desktop) — only when logged in */}
        <div className="hidden items-center gap-1 md:flex flex-1 justify-center">
          {isLoggedIn && (
            <>
              <TabLink to="/applications" label="Applications" Icon={Folder} />
              <TabLink to="/documents" label="Documents" Icon={FileText} />
              <TabLink to="/about" label="About" Icon={InfoIcon} />
            </>
          )}
        </div>

        {/* Auth actions (desktop) */}
        <div className="hidden gap-2 md:flex flex-1 justify-end">
          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[clamp(1.25rem,1.6vw,1.0625rem)] text-blue-700 transition hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span>Sign out</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[clamp(1.25rem,1.6vw,1.0625rem)] hover:brightness-95"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                <span>Log in</span>
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[clamp(1.25rem,1.6vw,1.0625rem)] text-blue-700 hover:bg-gray-100"
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                <span>Sign up</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden rounded-md p-2 focus:outline-none"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="mt-1 block h-0.5 w-6 bg-white" />
          <span className="mt-1 block h-0.5 w-6 bg-white" />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/20">
          <div className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-2">
            {/* Tabs (mobile) — only when logged in */}
            {isLoggedIn && (
              <div className="flex flex-col gap-1 pb-2">
                <NavLink
                  to="/applications"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-md px-3 py-2",
                      isActive ? "bg-white/15 font-semibold" : "hover:bg-white/10",
                    ].join(" ")
                  }
                >
                  <Folder className="h-4 w-4" aria-hidden />
                  <span>Applications</span>
                </NavLink>
                <NavLink
                  to="/documents"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-md px-3 py-2",
                      isActive ? "bg-white/15 font-semibold" : "hover:bg-white/10",
                    ].join(" ")
                  }
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  <span>Documents</span>
                </NavLink>
                <NavLink
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-md px-3 py-2",
                      isActive ? "bg-white/15 font-semibold" : "hover:bg-white/10",
                    ].join(" ")
                  }
                >
                  <InfoIcon className="h-4 w-4" aria-hidden />
                  <span>About</span>
                </NavLink>
              </div>
            )}

            {/* Auth actions (mobile) */}
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="mt-1 flex w-full items-center gap-2 rounded-md bg-white px-3 py-2 text-blue-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span>Sign out</span>
              </button>
            ) : (
              <div className="flex flex-col gap-1">
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 hover:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="h-4 w-4" aria-hidden />
                    Log in
                  </span>
                </Link>
                <Link
                  to="/signup"
                  className="mt-1 block rounded-md bg-white px-3 py-2 text-blue-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    <UserPlus className="h-4 w-4" aria-hidden />
                    Sign up
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
