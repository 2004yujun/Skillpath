import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Edit, MapPin, Briefcase, Award, BookOpen } from "lucide-react";

type Profile = {
  id: string;
  full_name: string | null;
  job_title: string | null;
  location: string | null;
  bio: string | null;
  updated_at: string | null;
};

type Education = {
  id: string;
  profile_id: string;
  school: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at?: string | null;
};

type Completion = {
  id: string;
  profile_id: string;
  course_id: string;
  score: number | null;
  completion_date: string | null;
  created_at?: string | null;
  courses?: {
    id: string;
    title: string | null;
    description: string | null;
    duration_hours: number | null;
    points_reward: number | null;
  } | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Profile not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to view your profile.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, job_title, location, bio, updated_at")
    .eq("id", user.id)
    .single<Profile>();

  if (profileError || !profile) {
    console.log("profileError", profileError);
    console.log("user.id", user.id);

    return (
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Error loading profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your signed-in account does not have a matching profile row yet.
          </p>
        </div>
      </main>
    );
  }

  const { data: education, error: educationError } = await supabase
    .from("education")
    .select("*")
    .eq("profile_id", profile.id)
    .order("start_date", { ascending: false });

  const { data: completions, error: completionsError } = await supabase
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
    .eq("profile_id", profile.id)
    .order("completion_date", { ascending: false });

  console.log("=== PROFILE DEBUG ===");
  console.log("user.id", user.id);
  console.log("profile.id", profile.id);
  console.log("education", education);
  console.log("educationError", educationError);
  console.log("completions", completions);
  console.log("completionsError", completionsError);
  console.log("=== END PROFILE DEBUG ===");

  if (educationError || completionsError) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Error loading profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            There was an error loading your profile data.
          </p>
        </div>
      </main>
    );
  }

  const educationRows: any[] = education ?? [];
const completionRows: any[] = completions ?? [];

console.log("education", education);
console.log("educationRows", educationRows);
console.log("educationRows length", educationRows.length);

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {profile.full_name || "Your Profile"}
                  </h1>

                  {profile.job_title && (
                    <p className="mt-1 flex items-center text-sm text-muted-foreground">
                      <Briefcase className="mr-1 h-4 w-4" />
                      {profile.job_title}
                    </p>
                  )}

                  {profile.location && (
                    <p className="mt-1 flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-4 w-4" />
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile/edit">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/courses/add">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Add Course
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Your profile summary</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.bio ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No bio added yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Education
              </CardTitle>
              <CardDescription>
                Your educational background and qualifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {educationRows.length > 0 ? (
                <div className="space-y-4">
                  {educationRows.map((edu) => (
                    <div key={edu.id} className="rounded-lg border p-4">
                      <p className="font-semibold">{edu.school || "Unknown school"}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.degree || "Qualification"}
                        {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {edu.start_date || "Unknown start"} →{" "}
                        {edu.end_date || "Present"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No education added yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Course Completions
              </CardTitle>
              <CardDescription>
                Your completed courses and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completionRows.length > 0 ? (
                <div className="space-y-3">
                  {completionRows.map((completion) => (
                    <div key={completion.id} className="border-l-2 border-border pl-3">
                      <h4 className="text-sm font-medium">
                        {completion.courses?.title || "Unknown Course"}
                      </h4>

                      {completion.courses?.description && (
                        <p className="text-xs text-muted-foreground">
                          {completion.courses.description}
                        </p>
                      )}

                      {completion.score !== null && completion.score !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Score: {completion.score}
                        </p>
                      )}

                      {completion.completion_date && (
                        <p className="text-xs text-muted-foreground">
                          Completed: {completion.completion_date}
                        </p>
                      )}

                      {completion.courses?.points_reward !== null &&
                        completion.courses?.points_reward !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Points: {completion.courses.points_reward}
                          </p>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-sm text-muted-foreground">
                    No course completions yet
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/courses/add">Add Course</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your profile and learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <Button variant="outline" asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/connections">View Connections</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Browse Directory</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}