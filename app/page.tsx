import Link from "next/link";
import { ProfileDirectoryCard, type DirectoryProfile } from "@/components/profile-directory-card";
import type { SkillBadge } from "@/components/skills-section";
import { createClient } from "@/lib/supabase/server";
import { DEMO_DIRECTORY } from "@/lib/demo-profiles";

function groupSkills(
  rows: { user_id: string; skill_name: string; proficiency: string }[] | null,
): Map<string, SkillBadge[]> {
  const map = new Map<string, SkillBadge[]>();
  for (const row of rows ?? []) {
    const list = map.get(row.user_id) ?? [];
    list.push({ skill_name: row.skill_name, proficiency: row.proficiency });
    map.set(row.user_id, list);
  }
  return map;
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profiles: DirectoryProfile[] = [];
  let skillsByUser = new Map<string, SkillBadge[]>();
  let source: "database" | "demo" = "demo";

  // First try to get all columns to see what actually exists
  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);

  // Debug logging
  console.log("Profile query result:", { profileRows, profilesError });

  if (!profilesError && profileRows && profileRows.length > 0) {
    // Log the actual structure to debug column names
    console.log("Sample profile row:", profileRows[0]);
    
    // Map the actual database columns to the expected DirectoryProfile format
    profiles = profileRows.map((row: any) => ({
      id: row.id,
      full_name: row.full_name || row.display_name || row.displayName || row.name || 'Unknown',
      job_title: row.job_title || row.jobTitle || '',
      location: row.location || '',
      bio: row.bio || ''
    })) as DirectoryProfile[];
    
    source = "database";
    console.log(`Loaded ${profiles.length} profiles from database`);
    // Skills are no longer displayed in profile cards, so we don't need to fetch them
    skillsByUser = new Map();
  } else {
    console.log("Falling back to demo data. Error:", profilesError?.message);
    profiles = DEMO_DIRECTORY.map((d) => d.profile);
    skillsByUser = new Map(DEMO_DIRECTORY.map((d) => [d.profile.id, d.skills]));
  }

  const yours = user ? profiles.findIndex((p) => p.id === user.id) : -1;
  const ordered =
    yours >= 0
      ? [profiles[yours], ...profiles.filter((_, i) => i !== yours)]
      : profiles;

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Learner directory
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {source === "database"
              ? `${profiles.length} profiles from your Supabase project.`
              : `Sample profiles (${profiles.length} total) - create accounts and run the SQL in supabase/ so real rows appear here.`}
          </p>
          {source === "demo" && (
            <p className="mt-2 text-xs text-orange-600">
              Debug: Using demo data - check browser console for database errors
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((profile) => (
            <ProfileDirectoryCard
              key={profile.id}
              profile={profile}
              skills={[]} // Skills are no longer displayed
              highlight={!!user && profile.id === user.id}
            />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            Create account
          </Link>
          <span className="mx-2">·</span>
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
          <span className="mx-2">·</span>
          <Link href="/connections" className="text-primary underline-offset-4 hover:underline">
            Connections
          </Link>
          <span className="mx-2">·</span>
          <Link href="/profile" className="text-primary underline-offset-4 hover:underline">
            View Profile
          </Link>
          <span className="mx-2">·</span>
          <Link href="/courses" className="text-primary underline-offset-4 hover:underline">
            My courses
          </Link>
          <span className="mx-2">·</span>
          <Link href="/logout" className="text-primary underline-offset-4 hover:underline">
            Sign out
          </Link>
        </p>
      </div>
    </main>
  );
}
