// routes/guards.tsx
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../api";

// Only allow if logged in
export function ProtectedRoute() {
  return getToken() ? <Outlet /> : <Navigate to="/login" replace />;
}

// Only allow if logged OUT (e.g., /login, /signup, /)
export function PublicOnlyRoute() {
  return getToken() ? <Navigate to="/applications" replace /> : <Outlet />;
}
