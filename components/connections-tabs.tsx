"use client";

import Link from "next/link";
import { MapPin, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfileRow, ScoredRecommendation } from "@/lib/recommendations";

type ConnectionRow = {
  following_id: string;
  created_at: string | null;
  profile: ProfileRow | null;
};

type ConnectionsTabsProps = {
  connections: ConnectionRow[];
  recommendations: ScoredRecommendation[];
};

export function ConnectionsTabs({ connections, recommendations }: ConnectionsTabsProps) {
  return (
    <Tabs defaultValue="connections" className="w-full gap-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="connections">My connections</TabsTrigger>
        <TabsTrigger value="discover">Suggested</TabsTrigger>
      </TabsList>

      <TabsContent value="connections" className="mt-4">
        {connections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No connections yet. Open someone&apos;s profile and click{" "}
            <strong>Connect</strong> to add them here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {connections.map((row) => {
              const p = row.profile;
              if (!p) return null;
              const name = p.full_name?.trim() || "Learner";
              return (
                <li key={row.following_id}>
                  <Card className="flex flex-row items-center gap-4 p-4 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground">{name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {p.job_title?.trim() || "—"}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{p.location?.trim() || "—"}</span>
                      </div>
                    </div>
                    <Link
                      href={`/profiles/${row.following_id}`}
                      className="shrink-0 text-sm text-primary underline-offset-4 hover:underline"
                    >
                      View
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="discover" className="mt-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Suggestions use skills you share and skills common among people you follow.
        </p>
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No suggestions yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recommendations.map(({ profile, score, reasons }) => {
              const name = profile.full_name?.trim() || "Learner";
              return (
                <li key={profile.id}>
                  <Card className="p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-card-foreground">{name}</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.job_title?.trim() || "—"}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{profile.location?.trim() || "—"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {score > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            Match {score}
                          </Badge>
                        ) : null}
                        <Link
                          href={`/profiles/${profile.id}`}
                          className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                          View profile
                        </Link>
                      </div>
                    </div>
                    {reasons.length > 0 ? (
                      <ul className="mt-3 list-inside list-disc text-xs text-muted-foreground">
                        {reasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    ) : null}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}
