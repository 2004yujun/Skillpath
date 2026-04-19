import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const DEMO_SKILLS = [
  "UI/UX Design",
  "Figma",
  "Design Systems",
  "User Research",
  "Prototyping",
  "Accessibility",
  "HTML/CSS",
  "React Basics",
];

export type SkillBadge = {
  skill_name: string;
  proficiency?: string | null;
};

type SkillsSectionProps = {
  /** When `undefined`, show the static demo skills. When an array (possibly empty), show user skills. */
  userSkills?: SkillBadge[];
};

export function SkillsSection({ userSkills }: SkillsSectionProps) {
  if (userSkills === undefined) {
    return (
      <section className="border-t border-border px-6 py-5">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {DEMO_SKILLS.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              {label}
            </Badge>
          ))}
        </div>
      </section>
    );
  }

  if (userSkills.length === 0) {
    return (
      <section className="border-t border-border px-6 py-5">
        <h2 className="mb-3 text-lg font-semibold text-card-foreground">Skills</h2>
        <p className="text-sm text-muted-foreground">
          No skills yet.{" "}
          <Link href="/skills/upload" className="text-primary underline-offset-4 hover:underline">
            Upload a skill
          </Link>{" "}
          to build your profile.
        </p>
      </section>
    );
  }

  return (
    <section className="border-t border-border px-6 py-5">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {userSkills.map((s, index) => {
          const label =
            s.proficiency && s.proficiency.length > 0
              ? `${s.skill_name} · ${s.proficiency}`
              : s.skill_name;
          return (
            <Badge
              key={`${index}-${label}`}
              variant="secondary"
              className="bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              {label}
            </Badge>
          );
        })}
      </div>
    </section>
  );
}
