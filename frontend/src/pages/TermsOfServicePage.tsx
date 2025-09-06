import { ScrollText, CheckCircle, Ban, FileCheck, AlertTriangle, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
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
            <ScrollText className="h-3.5 w-3.5" />
            Terms of Service
          </span>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            My Service Terms
          </h1>
          <p className="max-w-3xl text-gray-700">
            These are the simple rules for using Jobblet responsibly.
          </p>
        </motion.div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <Section id="account" icon={CheckCircle} title="Your account">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              I use cybersecurity best practices and AWS security features to protect your account and data including encryption, access controls, and monitoring.
            </li>
            <li>You’re responsible for keeping your login secure.</li>
            <li>Provide accurate information when signing up.</li>
          </ul>
        </Section>

        <Section id="acceptable" icon={Ban} title="Acceptable use">
          <p>Please don’t misuse Jobblet. That means no:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Uploading harmful or illegal files.</li>
            <li>Accessing or attempting to access other users’ data.</li>
            <li>Breaking the law while using the service.</li>
          </ul>
        </Section>

        <Section id="uploads" icon={FileCheck} title="Your uploads">
          <p>
            You own the files and information you upload. I only store and
            process them so you can use the features of the site. I don’t claim
            ownership of your content.
          </p>
        </Section>

        <Section id="availability" icon={AlertTriangle} title="Availability">
          <p>
            I’ll do my best to keep Jobblet up and running through AWS, but I can’t promise
            100% uptime. Maintenance and technical issues may cause temporary
            interruptions.
          </p>
        </Section>

        <Section id="contact" icon={Mail} title="Contact me">
          <p>
            Questions about these terms? Email me at{" "}
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

type SectionProps = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
};

function Section({ id, icon: Icon, title, children }: SectionProps) {
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
