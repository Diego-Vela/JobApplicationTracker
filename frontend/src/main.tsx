// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  RootLayout, HomePage, LoginPage, SignupPage, ApplicationsPage,
  ApplicationInfoPage, ApplicationNewPage, DocumentsPage,
  AboutPage, VerifyEmailPage, PrivacyPolicyPage, TermsOfServicePage,
  ForgotPasswordPage, NotFoundPage
} from "./index";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/guards";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Only visible when LOGGED OUT
      {
        element: <PublicOnlyRoute />,
        children: [
          { index: true, element: <HomePage /> },           // /
          { path: "login", element: <LoginPage /> },        // /login
          { path: "signup", element: <SignupPage /> },      // /signup
          { path: "forgot-password", element: <ForgotPasswordPage /> }, // /forgot-password
        ],
      },

      // Visible only when LOGGED IN
      {
        element: <ProtectedRoute />,
        children: [
          { path: "applications", element: <ApplicationsPage /> },        // /applications
          { path: "applications/new", element: <ApplicationNewPage /> },  // /applications/new
          { path: "applications/:id", element: <ApplicationInfoPage /> }, // /applications/:id
          { path: "documents", element: <DocumentsPage /> },              // /documents
        ],
      },

      // Always public (accessible whether logged in or not)
      { path: "about", element: <AboutPage /> },                 // /about
      { path: "verify-email", element: <VerifyEmailPage /> },    // /verify-email
      { path: "privacy", element: <PrivacyPolicyPage /> },       // /privacy
      { path: "terms", element: <TermsOfServicePage /> },        // /terms
      { path: "*", element: <NotFoundPage /> },                  // 404
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
