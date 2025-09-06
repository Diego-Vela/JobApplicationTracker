// AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./guards";
import HomePage from "../pages/HomePage";
import ApplicationsPage from "../pages/ApplicationsPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import DocumentsPage from "../pages/DocumentsPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages: auto-redirect to /applications if logged in using token information */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Private pages: require token */}
      <Route element={<ProtectedRoute />}>
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
      </Route>
    </Routes>
  );
}
