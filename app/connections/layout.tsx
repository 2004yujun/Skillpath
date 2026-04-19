import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connections | SkillPath",
  description: "Your connections and people you may know",
};

export default function ConnectionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
