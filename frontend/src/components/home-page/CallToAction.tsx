import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CallToAction() {
  return (
    <section className="mx-auto mt-20 max-w-screen-lg px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.5 }}
        className="rounded-2xl bg-brand/100 px-6 py-12 text-white shadow-md"
      >
        <motion.h3
          initial={false}
          animate={false}
          className="mb-4 font-extrabold text-[clamp(1.5rem,3vw,2rem)]"
        >
          Ready to simplify your job hunt?
        </motion.h3>
        <motion.p
          initial={false}
          animate={false}
          className="mx-auto mb-8 max-w-prose text-[clamp(0.95rem,1.8vw,1.125rem)] opacity-90"
        >
          Get started today and keep your applications, resumes, and notes
          organized in one place.
        </motion.p>
        <motion.div initial={false} animate={false}>
          <Link
            to="/signup"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-brand transition hover:bg-green-300 focus:outline-none focus-visible:ring focus-visible:ring-blue-300"
            aria-label="Sign up for Jobblet"
          >
            Get Started for Free
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
