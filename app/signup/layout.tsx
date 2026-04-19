import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account | SkillPath",
  description: "Join SkillPath to build and share your learner profile",
};

export default function SignupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
