import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { 
  RootLayout, HomePage, LoginPage, SignupPage, ApplicationsPage, 
  ApplicationInfoPage, ApplicationNewPage, DocumentsPage, 
  AboutPage, VerifyEmailPage, PrivacyPolicyPage, TermsOfServicePage,
  ForgotPasswordPage, NotFoundPage
} from "./index";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },        // /
      { path: "login", element: <LoginPage /> },     // /login
      { path: "signup", element: <SignupPage /> },   // /signup
      { path: "applications", element: <ApplicationsPage /> }, // /applications
      { path: "applications/new", element: <ApplicationNewPage /> }, // /applications/new
      { path: "applications/:id", element: <ApplicationInfoPage /> }, // /applications/:id
      { path: "documents", element: <DocumentsPage /> }, // /documents
      { path: "about", element: <AboutPage /> }, // /about
      { path: "verify-email", element: <VerifyEmailPage /> }, // /verify-email
      { path: "privacy", element: <PrivacyPolicyPage /> }, // /privacy-policy
      { path: "terms", element: <TermsOfServicePage /> }, // /terms-of-service
      { path: "forgot-password", element: <ForgotPasswordPage /> }, // /forgot-password
      { path: "*", element: <NotFoundPage /> }, // /404
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
