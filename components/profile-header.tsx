import type { ReactNode } from "react";
import { MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO = {
  displayName: "Sarah Chen",
  jobTitle: "Senior Product Designer",
  location: "San Francisco, CA",
} as const;

type ProfileHeaderProps = {
  variant?: "demo" | "account";
  displayName?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  /** Replaces the default Connect button (e.g. real connect / sample state). */
  action?: ReactNode;
};

export function ProfileHeader({
  variant = "demo",
  displayName,
  jobTitle,
  location,
  action,
}: ProfileHeaderProps) {
  const name =
    variant === "demo" ? DEMO.displayName : displayName?.trim() || "Learner";
  const title =
    variant === "demo" ? DEMO.jobTitle : jobTitle?.trim() || "Add your professional title";
  const place =
    variant === "demo" ? DEMO.location : location?.trim() || "Add your location";

  return (
    <div className="relative">
      <div className="h-32 rounded-t-xl bg-gradient-to-r from-primary/80 to-primary" />

      <div className="px-6 pb-6">
        <div className="relative -mt-16 mb-4">
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-card bg-muted shadow-lg">
            <User className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">{name}</h1>
            <p className="text-lg text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm">{place}</span>
            </div>
          </div>

          {action ?? <Button className="w-full md:w-auto">Connect</Button>}
        </div>
      </div>
    </div>
  );
}
