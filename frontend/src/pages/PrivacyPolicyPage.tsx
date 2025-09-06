import { Shield, FileText, Lock, UserCheck, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
            <Shield className="h-3.5 w-3.5" />
            Privacy Policy
          </span>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            My Privacy Commitment
          </h1>
          <p className="max-w-3xl text-gray-700">
            This policy explains how I collect, use, and safeguard your
            information when you use Jobblet.
          </p>
        </motion.div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <Section id="data" icon={FileText} title="What I collect">
          <ul className="list-disc pl-6 space-y-2">
            <li>Your account info (email, login details).</li>
            <li>Your resumes and CVs, stored in AWS S3.</li>
            <li>Application details like company, job title, status, and notes.</li>
            <li>Basic technical data (e.g., logs, errors).</li>
          </ul>
        </Section>

        <Section id="use" icon={UserCheck} title="How I use it">
          <ul className="list-disc pl-6 space-y-2">
            <li>To let you track and manage applications.</li>
            <li>To store your documents and link them to applications.</li>
            <li>To secure accounts and improve reliability.</li>
            <li>To communicate about updates or issues.</li>
          </ul>
        </Section>

        <Section id="security" icon={Lock} title="Security">
          <p>
            I use AWS Cognito for authentication and AWS S3 for file storage
            with presigned URLs. While I follow industry standards, no system
            is completely secure.
          </p>
        </Section>

        <Section id="rights" icon={Shield} title="Your rights">
          <ul className="list-disc pl-6 space-y-2">
            <li>You can view, update, or delete your applications and files.</li>
            <li>You can request account deletion anytime.</li>
          </ul>
        </Section>

        <Section id="dont" icon={Shield} title="What I don't do">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              I do{" "}
              <span className="font-semibold text-red-700">not</span> sell, rent,
              or share your personal data with third parties for marketing or
              advertising.
            </li>
            <li>
              I do{" "}
              <span className="font-semibold text-red-700">not</span> use your
              data for profiling or targeted ads.
            </li>
            <li>
              I do{" "}
              <span className="font-semibold text-red-700">not</span> access your
              documents except for technical support or troubleshooting, and only
              with your permission.
            </li>
            <li>
              I do{" "}
              <span className="font-semibold text-red-700">not</span> track your
              activity outside of Jobblet.
            </li>
            <li>No cookies or trackers are used for advertising purposes.</li>
          </ul>
        </Section>

        <Section id="contact" icon={Mail} title="Contact me">
          <p>
            If you have questions about privacy, email me at{" "}
            <a
              href="mailto:diegov5498@gmail.com"
              className="text-blue-600 underline"
            >
              diegov5498@gmail.com
            </a>
            .
          </p>
        </Section>

        <footer className="mt-14 border-t border-gray-200 pt-6 text-sm text-gray-500">
          <span>Last updated {new Date().toLocaleDateString()}</span>
        </footer>
      </main>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: LucideIcon;
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
      className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm"
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
