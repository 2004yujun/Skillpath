import { Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type CertificationItem = {
  title: string;
  issuer: string | null;
  issuedAt: string | null;
};

type CertificationsSectionProps = {
  items: CertificationItem[];
};

export function CertificationsSection({ items }: CertificationsSectionProps) {
  if (items.length === 0) {
    return (
      <section className="border-t border-border px-6 py-5">
        <h2 className="mb-3 text-lg font-semibold text-card-foreground">Certifications</h2>
        <p className="text-sm text-muted-foreground">No certifications listed yet.</p>
      </section>
    );
  }

  return (
    <section className="border-t border-border px-6 py-5">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">Certifications</h2>
      <div className="flex flex-col gap-4">
        {items.map((cert) => (
          <div
            key={`${cert.title}-${cert.issuedAt ?? ""}`}
            className="rounded-lg border border-border bg-secondary/50 p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-card-foreground">{cert.title}</h3>
                {cert.issuer ? (
                  <p className="text-sm text-muted-foreground">Issued by {cert.issuer}</p>
                ) : null}
              </div>
              <Award className="h-5 w-5 shrink-0 text-accent" />
            </div>
            <div className="flex items-center gap-3">
              <Progress value={100} className="h-2 flex-1" />
              <span className="shrink-0 text-xs font-medium text-accent">Verified</span>
            </div>
            {cert.issuedAt ? (
              <p className="mt-2 text-xs text-muted-foreground">Issued {cert.issuedAt}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
