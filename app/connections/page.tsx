import Link from "next/link";
import { redirect } from "next/navigation";
import { ConnectionsTabs } from "@/components/connections-tabs";
import { createClient } from "@/lib/supabase/server";
import { getSkillBasedRecommendations, type ProfileRow } from "@/lib/recommendations";

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/connections");
  }

  const { data: followRows, error: connError } = await supabase
    .from("connections")
    .select("following_id, created_at")
    .eq("follower_id", user.id)
    .order("created_at", { ascending: false });

  let connections: {
    following_id: string;
    created_at: string | null;
    profile: ProfileRow | null;
  }[] = [];

  if (!connError && followRows && followRows.length > 0) {
    const ids = followRows.map((r) => r.following_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, job_title, location, bio")
      .in("id", ids);

    const byId = new Map((profiles as ProfileRow[] | null)?.map((p) => [p.id, p]) ?? []);
    connections = followRows.map((row) => ({
      following_id: row.following_id,
      created_at: row.created_at,
      profile: byId.get(row.following_id) ?? null,
    }));
  }

  const recommendations = await getSkillBasedRecommendations(supabase, user.id, 12);

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Connections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          People you&apos;ve connected with and suggestions based on shared skills and your network.
        </p>
        {connError ? (
          <p className="mt-4 text-sm text-destructive">
            Could not load connections. Add the <code className="text-xs">connections</code> table
            in Supabase (see <code className="text-xs">supabase/schema.sql</code>).
          </p>
        ) : (
          <div className="mt-8">
            <ConnectionsTabs connections={connections} recommendations={recommendations} />
          </div>
        )}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary underline-offset-4 hover:underline">
            Back to directory
          </Link>
        </p>
      </div>
    </main>
  );
}
