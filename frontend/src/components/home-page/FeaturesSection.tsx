import { FileText, ClipboardList, NotebookPen, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "Upload Resumes & CVs",
    desc: "Keep all your documents in one place for quick access and sharing.",
  },
  {
    icon: ClipboardList,
    title: "Track Applications",
    desc: "Easily organize and update the status of each job application.",
  },
  {
    icon: NotebookPen,
    title: "Add Notes",
    desc: "Save key details about interviews, contacts, and follow-ups.",
  },
  {
    icon: BarChart3,
    title: "Stay Organized",
    desc: "View progress at a glance and never lose track of opportunities.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="mx-auto mt-16 max-w-screen-lg px-4 ">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className="mb-10 text-center font-extrabold text-[clamp(1.5rem,3vw,2rem)]"
      >
        Why use Jobblet?
      </motion.h3>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 + i * 0.15 }}
            className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <Icon className="mb-4 h-10 w-10 text-brand" />
            <h4
              className="mb-2 font-semibold text-xl text-center min-h-[2.5em] flex items-center justify-center"
              style={{ minHeight: "2.5em" }}
            >
              {title}
            </h4>
            <p className="text-center text-gray-600 text-lg">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
