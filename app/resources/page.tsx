"use client";

import Link from "next/link";
import { ExternalLink, BookOpen, FlaskConical, Database, GraduationCap } from "lucide-react";
import TopNav from "../../components/TopNav";

type Resource = {
  name: string;
  description: string;
  url: string;
  badge?: string;
};

type Category = {
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  resources: Resource[];
};

const categories: Category[] = [
  {
    label: "Official CompTIA",
    sublabel: "Primary source material for the SY0-701 exam",
    icon: GraduationCap,
    accent: "cyan",
    resources: [
      {
        name: "CompTIA Security+ Certification Page",
        description: "Official exam overview, objectives, and registration information.",
        url: "https://www.comptia.org/certifications/security",
        badge: "Official",
      },
      {
        name: "SY0-701 Exam Objectives (PDF)",
        description: "The complete exam objectives document including the official acronym list appendix.",
        url: "https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf",
        badge: "Official",
      },
      {
        name: "CompTIA CertMaster Learn",
        description: "CompTIA's official self-paced e-learning platform for Security+.",
        url: "https://www.comptia.org/en-us/resources/certmaster-training/learn/",
        badge: "Paid",
      },
      {
        name: "CompTIA CertMaster Practice",
        description: "Official adaptive practice test engine with performance feedback.",
        url: "https://www.comptia.org/en-us/resources/certmaster-training/practice/",
        badge: "Paid",
      },
    ],
  },
  {
    label: "Free Study Resources",
    sublabel: "Highly-rated free courses, videos, and study guides",
    icon: BookOpen,
    accent: "violet",
    resources: [
      {
        name: "Professor Messer — Free YouTube Course",
        description: "121 free videos covering every SY0-701 objective, organized by domain. Widely considered the best free Security+ resource available.",
        url: "https://www.youtube.com/playlist?list=PLG49S3nxzAnl4QDVqK-hOnoqcSKEIDDuv",
        badge: "Free",
      },
      {
        name: "Professor Messer — Course Notes & Practice Exams",
        description: "Paid PDF course notes and practice exams to accompany the free video course. Covers all domains with exam-focused summaries.",
        url: "https://www.professormesser.com/sy0-701-success-bundle/",
        badge: "Paid",
      },
      {
        name: "Get Certified Get Ahead (SY0-701)",
        description: "Darril Gibson's comprehensive study guide. The appendix mirrors the official CompTIA acronym list.",
        url: "https://www.amazon.com/CompTIA-Security-Get-Certified-Ahead/dp/B0CM13W88J",
      },
      {
        name: "Jason Dion — Security+ on Udemy",
        description: "Popular video course covering all objectives with practice questions. Frequently on sale.",
        url: "https://www.udemy.com/course/securityplus/",
        badge: "Paid",
      },
    ],
  },
  {
    label: "Practice Tests",
    sublabel: "Simulate exam conditions and identify weak areas",
    icon: FlaskConical,
    accent: "amber",
    resources: [
      {
        name: "Professor Messer Practice Exams",
        description: "Three full-length practice exams written by Professor Messer, closely modelled on the real test.",
        url: "https://www.professormesser.com/amember/signup/sy0701pe",
        badge: "Paid",
      },
      {
        name: "ExamCompass — Free SY0-701 Quizzes",
        description: "Free domain-by-domain practice quizzes, including a dedicated acronym quiz.",
        url: "https://www.examcompass.com/comptia-security-plus-practice-test-1-exam-sy0-701",
        badge: "Free",
      },
      {
        name: "Jason Dion — Practice Tests on Udemy",
        description: "Six full practice exams with detailed explanations for every answer choice.",
        url: "https://www.udemy.com/course/comptia-security-sy0-701-practice-exams/",
        badge: "Paid",
      },
    ],
  },
  {
    label: "Reference Databases",
    sublabel: "Live authoritative sources for concepts covered on the exam",
    icon: Database,
    accent: "emerald",
    resources: [
      {
        name: "MITRE CVE",
        description: "The official Common Vulnerabilities and Exposures database maintained by MITRE.",
        url: "https://www.cve.org/",
        badge: "Free",
      },
      {
        name: "NVD — National Vulnerability Database",
        description: "NIST's enriched CVE feed with CVSS scores, remediation data, and CPE information.",
        url: "https://nvd.nist.gov/",
        badge: "Free",
      },
      {
        name: "NIST CSRC Glossary",
        description: "Authoritative definitions for security terms, many of which appear directly on the exam.",
        url: "https://csrc.nist.gov/glossary",
        badge: "Free",
      },
      {
        name: "NIST SP 800-53",
        description: "Security and privacy controls for federal information systems — frequently referenced in Domain 5.0.",
        url: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
        badge: "Free",
      },
      {
        name: "MITRE ATT&CK",
        description: "Knowledge base of adversary tactics and techniques, relevant to threat and vulnerability topics in Domain 2.0.",
        url: "https://attack.mitre.org/",
        badge: "Free",
      },
    ],
  },
];

const accentClasses: Record<string, { border: string; bg: string; icon: string; badge: string }> = {
  cyan: {
    border: "border-cyan-300/20",
    bg: "bg-cyan-400/10",
    icon: "text-cyan-300",
    badge: "bg-cyan-400/10 text-cyan-200 border-cyan-300/20",
  },
  violet: {
    border: "border-violet-300/20",
    bg: "bg-violet-400/10",
    icon: "text-violet-300",
    badge: "bg-violet-400/10 text-violet-200 border-violet-300/20",
  },
  amber: {
    border: "border-amber-300/20",
    bg: "bg-amber-400/10",
    icon: "text-amber-300",
    badge: "bg-amber-400/10 text-amber-200 border-amber-300/20",
  },
  emerald: {
    border: "border-emerald-300/20",
    bg: "bg-emerald-400/10",
    icon: "text-emerald-300",
    badge: "bg-emerald-400/10 text-emerald-200 border-emerald-300/20",
  },
};

const badgeVariant: Record<string, string> = {
  Official: "bg-cyan-400/10 text-cyan-200 border border-cyan-300/20",
  Free: "bg-emerald-400/10 text-emerald-200 border border-emerald-300/20",
  Paid: "bg-slate-400/10 text-slate-300 border border-white/10",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <TopNav />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-cyan-300">Study Resources</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            CompTIA Security+ SY0-701 resources
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Curated links to official exam materials, free courses, practice
            tests, and authoritative reference databases that map to the SY0-701
            exam objectives.
          </p>
        </div>

        <div className="mt-8 space-y-10">
          {categories.map((cat) => {
            const accent = accentClasses[cat.accent];
            const Icon = cat.icon;

            return (
              <section key={cat.label}>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`rounded-xl border p-2.5 ${accent.border} ${accent.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${accent.icon}`} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {cat.label}
                    </div>
                    <div className="text-sm text-slate-400">{cat.sublabel}</div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {cat.resources.map((res) => (
                    <a
                      key={res.name}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0b1730] p-5 transition hover:border-white/20 hover:bg-white/[0.07]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-base font-medium text-white group-hover:text-cyan-100">
                            {res.name}
                          </span>
                          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 group-hover:text-cyan-300" />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {res.description}
                        </p>
                      </div>

                      {res.badge && (
                        <div className="mt-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs ${badgeVariant[res.badge] ?? ""}`}
                          >
                            {res.badge}
                          </span>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
