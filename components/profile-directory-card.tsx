import Link from "next/link";
import { MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SkillBadge } from "@/components/skills-section";

export type DirectoryProfile = {
  id: string;
  full_name: string | null;
  job_title: string | null;
  location: string | null;
  bio: string | null;
};

type ProfileDirectoryCardProps = {
  profile: DirectoryProfile;
  skills: SkillBadge[];
  highlight?: boolean;
};

function profileHref(id: string) {
  return `/profiles/${encodeURIComponent(id)}`;
}

export function ProfileDirectoryCard({
  profile,
  skills,
  highlight,
}: ProfileDirectoryCardProps) {
  const name = profile.full_name?.trim() || "Learner";
  const title = profile.job_title?.trim() || "—";
  const place = profile.location?.trim() || "—";
  const bio = profile.bio?.trim();
  const preview =
    bio && bio.length > 160 ? `${bio.slice(0, 157)}…` : bio || "No bio yet.";
  const showBadges = skills.slice(0, 6);

  return (
    <Card
      className={`flex h-full flex-col overflow-hidden shadow-sm ${
        highlight ? "ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="h-16 bg-gradient-to-r from-primary/70 to-primary" />
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-0">
        <div className="-mt-10 flex items-end gap-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-card bg-muted shadow-md">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          {highlight ? (
            <Badge variant="secondary" className="mb-1">
              You
            </Badge>
          ) : null}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">{name}</h2>
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">{place}</span>
          </div>
        </div>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {preview}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-auto w-full">
          <Link href={profileHref(profile.id)}>View profile</Link>
        </Button>
      </div>
    </Card>
  );
}
