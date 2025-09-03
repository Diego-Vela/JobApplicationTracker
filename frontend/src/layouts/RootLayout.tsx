import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RootLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 text-gray-800 font-sans">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-screen-lg min-w-[320px] px-4 py-4">
        <Outlet /> {/* This is switched based on my stuff in main */}
      </main>
      <Footer />
    </div>
  );
}
