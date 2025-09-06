// src/pages/HomePage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api"; 
import FeaturesSection from "../components/home-page/FeaturesSection";
import CallToAction from "../components/home-page/CallToAction";
import Hero from "../components/home-page/Hero";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser(); // null if not signed in
      if (user) navigate("/applications");
    })();
  }, [navigate]);

  return (
    <main className="mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-10 ">
      <Hero />
      <hr className="my-12 border-t border-gray-500" />
      <FeaturesSection />
      <CallToAction />
    </main>
  );
}
