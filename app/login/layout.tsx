import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in | SkillPath",
  description: "Sign in to your SkillPath learner profile",
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
