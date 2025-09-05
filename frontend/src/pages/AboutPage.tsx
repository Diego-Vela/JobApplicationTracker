import { User, Lightbulb, Wrench, MessageSquare, Github, Mail, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const GITHUB_URL = "https://github.com/diego-vela/JobApplicationTracker";
const CONTACT_EMAIL = "diegov5498@gmail.com";

export default function AboutProject() {
  const [copied, setCopied] = useState(false);

  function handleCopyEmail() {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 rounded-2xl shadow-xl overflow-y-auto">
      <header className="mx-auto max-w-5xl px-6 pt-14 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs text-gray-600">
            <Wrench className="h-3.5 w-3.5" />
            Project Info
          </span>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">About this project</h1>
          <p className="max-w-3xl text-gray-700">
            Jobblet is a streamlined job-application tracker to attach resumes, CVs, and notes
            to specific applications to quickly recall, organize, and manage your job applications.
          </p>
          <nav className="mt-2 flex flex-wrap gap-3 text-sm">
            <a href="#who" className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-gray-600 hover:text-gray-900">Who I am</a>
            <a href="#why" className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-gray-600 hover:text-gray-900">Why I built this</a>
            <a href="#stack" className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-gray-600 hover:text-gray-900">Tech stack & process</a>
            <a href="#feedback" className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-gray-600 hover:text-gray-900">Feedback</a>
          </nav>
        </motion.div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        {/* Who I Am */}
        <Section id="who" icon={User} title="Who I am">
          <p>
            Hi, I’m <span className="font-medium">Diego</span> — a Computer Science graduate and software engineer focused on
            fullstack web and mobile development. 
          </p>
        </Section>

        {/* Why I Built This */}
        <Section id="why" icon={Lightbulb} title="Why I built this">
          <p>
            Job searching after graduation got messy fast. I built this site to organize my process: one place for tracking
            applications, attaching resumes/CVs, jotting notes, and keeping status changes tidy while simultaneously experimenting
            with Amazon Web Services.
          </p>
        </Section>

        {/* Tech Stack & Process */}
        <Section id="stack" icon={Wrench} title="Tech stack & process">
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>
              <span className="font-medium text-gray-900">Frontend:</span> React (Vite) + Tailwind.
            </li>
            <li>
              <span className="font-medium text-gray-900">Backend:</span> FastAPI + PostgreSQL which transitioned to AWS Lambda, API Gateway, and DynamoDB.
            </li>
            <li>
              <span className="font-medium text-gray-900">Storage & Auth:</span> AWS S3 for documents, Cognito for authentication, and Lambda for
              serverless tasks.
            </li>
            <li>
              <span className="font-medium text-gray-900">Process:</span> Light planning involving user stories, data flow diagrams, and iterative feature development.
            </li>
          </ul>
        </Section>

        {/* Feedback */}
        <Section id="feedback" icon={MessageSquare} title="Feedback & communication">
          <p>
            This is an active project — I’d appreciate your ideas and bug reports. Thank you for visiting Jobblet!
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              <Github className="h-4 w-4" /> Open an Issue
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              {copied ? (
                <>
                  <ClipboardCheck className="h-4 w-4 text-green-600" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  {CONTACT_EMAIL}
                </>
              )}
            </button>
          </div>
        </Section>

        <footer className="mt-14 border-t border-gray-200 pt-6 text-sm text-gray-500">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Last updated {new Date().toLocaleDateString()}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.03)]"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="prose prose-invert max-w-none prose-p:text-gray-700 prose-li:text-gray-700">
        {children}
      </div>
    </motion.section>
  );
}
