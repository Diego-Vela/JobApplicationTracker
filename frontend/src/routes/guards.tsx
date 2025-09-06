import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../api";

type AuthState = "loading" | "authed" | "guest";

function useAuthStatus() {
  const [status, setStatus] = useState<AuthState>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getCurrentUser(); // null if not signed in
        if (!cancelled) setStatus(user ? "authed" : "guest");
      } catch {
        if (!cancelled) setStatus("guest");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

function LoadingScreen() {
  return (
    <div className="flex h-[40vh] items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-transparent" />
      <span className="ml-3 text-gray-600">Checking session…</span>
    </div>
  );
}

/** Only allow if logged in */
export function ProtectedRoute() {
  const status = useAuthStatus();

  if (status === "loading") return <LoadingScreen />;
  if (status === "authed") return <Outlet />;
  return <Navigate to="/login" replace />;
}

/** Only allow if logged OUT (e.g., /login, /signup, /) */
export function PublicOnlyRoute() {
  const status = useAuthStatus();

  if (status === "loading") return <LoadingScreen />;
  if (status === "guest") return <Outlet />;
  return <Navigate to="/applications" replace />;
}
