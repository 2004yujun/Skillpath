import type { DirectoryProfile } from "@/components/profile-directory-card";
import type { CertificationItem } from "@/components/certifications-section";
import type { SkillBadge } from "@/components/skills-section";

export type DemoDirectoryEntry = {
  profile: DirectoryProfile;
  skills: SkillBadge[];
  certifications: CertificationItem[];
};

/** Shown when the database has no rows or policies block reads. */
export const DEMO_DIRECTORY: DemoDirectoryEntry[] = [
  {
    profile: {
      id: "demo-sarah",
      display_name: "Sarah Chen",
      job_title: "Senior Product Designer",
      location: "San Francisco, CA",
      bio:
        "Product designer focused on accessibility, design systems, and user-centered experiences.",
    },
    skills: [
      { skill_name: "UI/UX Design", proficiency: "expert" },
      { skill_name: "Figma", proficiency: "advanced" },
      { skill_name: "Design Systems", proficiency: "advanced" },
    ],
    certifications: [
      {
        title: "Google UX Design Certificate",
        issuer: "Google Career Certificates",
        issuedAt: "Mar 2025",
      },
      {
        title: "Accessibility Professional",
        issuer: "IAAP",
        issuedAt: "Nov 2024",
      },
      {
        title: "Design Systems Specialist",
        issuer: "Design Academy",
        issuedAt: "Jun 2024",
      },
    ],
  },
  {
    profile: {
      id: "demo-marcus",
      display_name: "Marcus Webb",
      job_title: "Full-stack Developer",
      location: "Berlin, DE",
      bio:
        "Building reliable APIs and React apps. Interested in performance, testing, and clear documentation.",
    },
    skills: [
      { skill_name: "TypeScript", proficiency: "advanced" },
      { skill_name: "React", proficiency: "advanced" },
      { skill_name: "Node.js", proficiency: "intermediate" },
    ],
    certifications: [
      {
        title: "AWS Certified Developer – Associate",
        issuer: "Amazon Web Services",
        issuedAt: "Jan 2026",
      },
      {
        title: "Meta Front-End Developer",
        issuer: "Meta",
        issuedAt: "Aug 2025",
      },
    ],
  },
  {
    profile: {
      id: "demo-elena",
      display_name: "Elena Park",
      job_title: "Data Analyst",
      location: "Remote",
      bio:
        "Turning messy data into decisions. SQL, dashboards, and stakeholder-friendly storytelling.",
    },
    skills: [
      { skill_name: "SQL", proficiency: "expert" },
      { skill_name: "Python", proficiency: "intermediate" },
      { skill_name: "Visualization", proficiency: "advanced" },
    ],
    certifications: [
      {
        title: "Google Data Analytics Certificate",
        issuer: "Google Career Certificates",
        issuedAt: "Apr 2025",
      },
      {
        title: "Tableau Desktop Specialist",
        issuer: "Tableau",
        issuedAt: "Dec 2024",
      },
    ],
  },
];

export function getDemoDirectoryEntry(slug: string): DemoDirectoryEntry | null {
  return DEMO_DIRECTORY.find((d) => d.profile.id === slug) ?? null;
}
