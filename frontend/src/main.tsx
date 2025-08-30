import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ApplicationsPage from "./pages/ApplicationsPage.tsx";
import ApplicationNewPage from "./pages/ApplicationNewPage";
import ApplicationInfoPage from "./pages/ApplicationInfoPage";

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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
