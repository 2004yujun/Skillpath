import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile-header";
import { AboutSection } from "@/components/about-section";
import { SkillsSection, type SkillBadge } from "@/components/skills-section";
import { CertificationsSection, type CertificationItem } from "@/components/certifications-section";
import { createClient } from "@/lib/supabase/server";
import { getDemoDirectoryEntry } from "@/lib/demo-profiles";
import { ProfileConnectButton } from "@/components/profile-connect-button";


type PageProps = {
  params: Promise<{ id: string }>;
};

function mapCertRows(
  rows: { title: string; issuer: string | null; issued_at: string | null }[] | null,
): CertificationItem[] {
  return (rows ?? []).map((r) => ({
    title: r.title,
    issuer: r.issuer,
    issuedAt: r.issued_at,
  }));
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  const demo = getDemoDirectoryEntry(id);
  if (demo) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              ← Back to directory
            </Link>
          </p>
          <Card className="overflow-hidden shadow-sm">
            <ProfileHeader
              variant="account"
              displayName={demo.profile.full_name}
              jobTitle={demo.profile.job_title}
              location={demo.profile.location}
              action={
                <ProfileConnectButton
                  profileId={demo.profile.id}
                  initialConnected={false}
                  isSelf={false}
                  isDemo
                />
              }
            />
            <AboutSection variant="account" bio={demo.profile.bio} />
            <SkillsSection userSkills={demo.skills} />
            <CertificationsSection items={demo.certifications} />
          </Card>
        </div>
      </main>
    );
  }

  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, job_title, location, bio")
    .eq("id", id)
    .maybeSingle();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch education data
  const { data: education } = await supabase
    .from("education")
    .select("*")
    .eq("profile_id", id)
    .order("start_date", { ascending: false });

  console.log("viewed profile id", id);
  console.log("education data", education);
  console.log("education error", null);

  // Fetch completions with correct schema
  const completionsResult = await supabase
    .from("completions")
    .select(`
      id,
      profile_id,
      course_id,
      score,
      completion_date,
      created_at,
      courses (
        id,
        title,
        description,
        duration_hours,
        points_reward
      )
    `)
    .eq("profile_id", id)
    .order("completion_date", { ascending: false });

  console.log("Other user completions data:", { completionsResult });

  // Certifications are no longer displayed, replaced by education
  const certifications = [];
  const completions = completionsResult.error ? [] : (completionsResult.data || []);

  const isSelf = !!user && user.id === id;
  let initialConnected = false;
  if (user && !isSelf) {
    const { data: connRow } = await supabase
      .from("connections")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", id)
      .maybeSingle();
    initialConnected = !!connRow;
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary underline-offset-4 hover:underline">
            ← Back to directory
          </Link>
        </p>
        <Card className="overflow-hidden shadow-sm">
          <ProfileHeader
            variant="account"
            displayName={profile.full_name}
            jobTitle={profile.job_title}
            location={profile.location}
            action={
              <ProfileConnectButton
                profileId={id}
                initialConnected={initialConnected}
                isSelf={isSelf}
              />
            }
          />
          <AboutSection variant="account" bio={profile.bio} />
          
          {/* Education Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Education</h3>
            {education && education.length > 0 ? (
              <div className="space-y-3">
                {education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-border pl-3">
                    <h4 className="font-medium text-sm">{edu.school}</h4>
                    {edu.degree && (
                      <p className="text-sm text-muted-foreground">
                        {edu.degree}
                      </p>
                    )}
                    {edu.field_of_study && (
                      <p className="text-xs text-muted-foreground">
                        {edu.field_of_study}
                      </p>
                    )}
                    {(edu.start_date || edu.end_date) && (
                      <p className="text-xs text-muted-foreground">
                        {edu.start_date && `${edu.start_date} - `}
                        {edu.end_date || 'Present'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No education added yet
                </p>
              </div>
            )}
          </div>
          
          {/* Completions Section */}
          {completions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Course Completions</h3>
              <div className="space-y-3">
                {completions.map((completion: any, index: number) => (
                  <div key={index} className="border-l-2 border-border pl-3">
                    <h4 className="font-medium text-sm">{completion.courses?.title || 'Unknown Course'}</h4>
                    {completion.courses?.description && (
                      <p className="text-xs text-muted-foreground">
                        {completion.courses.description}
                      </p>
                    )}
                    {completion.score && (
                      <p className="text-xs text-muted-foreground">
                        Score: {completion.score}
                      </p>
                    )}
                    {completion.completion_date && (
                      <p className="text-xs text-muted-foreground">
                        Completed: {completion.completion_date}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
