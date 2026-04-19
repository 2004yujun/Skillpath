import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload a skill | SkillPath",
  description: "Add skills and evidence to your SkillPath profile",
};

export default function SkillsUploadLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
