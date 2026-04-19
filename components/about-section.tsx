import Link from "next/link";

const DEMO_BIO =
  "Product designer with 8+ years of experience creating user-centered digital experiences. Passionate about accessibility, design systems, and bridging the gap between user needs and business goals. Currently focused on expanding my skills in AI-powered design tools and advanced prototyping techniques.";

type AboutSectionProps = {
  variant?: "demo" | "account";
  bio?: string | null;
};

export function AboutSection({ variant = "demo", bio }: AboutSectionProps) {
  if (variant === "demo") {
    return (
      <section className="border-t border-border px-6 py-5">
        <h2 className="mb-3 text-lg font-semibold text-card-foreground">About</h2>
        <p className="leading-relaxed text-muted-foreground">{DEMO_BIO}</p>
      </section>
    );
  }

  const trimmed = bio?.trim();
  return (
    <section className="border-t border-border px-6 py-5">
      <h2 className="mb-3 text-lg font-semibold text-card-foreground">About</h2>
      {trimmed ? (
        <p className="leading-relaxed text-muted-foreground">{trimmed}</p>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Add a short bio from{" "}
          <Link href="/profile/edit" className="text-primary underline-offset-4 hover:underline">
            Edit profile
          </Link>
          .
        </p>
      )}
    </section>
  );
}
