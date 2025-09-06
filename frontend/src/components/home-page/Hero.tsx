import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 mt-4 font-extrabold leading-tight text-[clamp(1.75rem,4vw,2.5rem)]"
      >
        Jobblet helps you track your job hunt with ease
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mx-auto mb-12 max-w-prose text-[clamp(1.5rem,1.8vw,1.125rem)] text-gray-600"
      >
        Upload resumes, manage applications, add notes, and keep everything
        organized in one place.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          to="/signup"
          className="rounded-lg bg-brand px-5 py-3 text-white transition hover:brightness-95 focus:outline-none focus-visible:ring focus-visible:ring-blue-300 text-[clamp(1.5rem,1.6vw,1.0625rem)]"
          aria-label="Get started with Jobblet"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 transition hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-gray-300 text-[clamp(1.5rem,1.6vw,1.0625rem)]"
          aria-label="Log in to Jobblet"
        >
          Log In
        </Link>
      </motion.div>
    </section>
  );
}