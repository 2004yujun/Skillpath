import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit profile | SkillPath",
  description: "Update your headline, location, and bio on SkillPath",
};

export default function ProfileEditLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
