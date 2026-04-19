import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { BookOpen, Clock, Target, TrendingUp, Plus, Play, Award } from "lucide-react";

export default async function CoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Courses & Learning Paths
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to view your learning progress.
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
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: skills, error: skillsError } = await supabase
    .from("skills")
    .select("skill_name, proficiency, details, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: certifications, error: certificationsError } = await supabase
    .from("certifications")
    .select("title, issuer, issued_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (profileError || skillsError || certificationsError) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Error loading courses
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            There was an error loading your learning data.
          </p>
        </div>
      </main>
    );
  }

  // Group skills by proficiency level for learning paths
  const learningPaths = {
    beginner: skills?.filter(s => s.proficiency === "Beginner") || [],
    intermediate: skills?.filter(s => s.proficiency === "Intermediate") || [],
    advanced: skills?.filter(s => s.proficiency === "Advanced") || [],
    expert: skills?.filter(s => s.proficiency === "Expert") || [],
  };

  const totalSkills = skills?.length || 0;
  const totalCertifications = certifications?.length || 0;
  const completedPaths = Object.values(learningPaths).filter(path => path.length > 0).length;

  // Calculate progress metrics
  const progressPercentage = totalSkills > 0 ? Math.min((totalSkills / 10) * 100, 100) : 0;

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Your Learning Journey
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your skills, certifications, and learning progress
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{totalSkills}</p>
                  <p className="text-sm text-muted-foreground">Skills</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{completedPaths}</p>
                  <p className="text-sm text-muted-foreground">Learning Paths</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{totalCertifications}</p>
                  <p className="text-sm text-muted-foreground">Certifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                  <p className="text-sm text-muted-foreground">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Learning Progress
            </CardTitle>
            <CardDescription>
              Your overall skill development journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Skills Mastery</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your current skill portfolio. Keep adding new skills and certifications to increase your progress!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Learning Paths by Proficiency */}
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(learningPaths).map(([level, skillList]) => (
            <Card key={level}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  {level} Path
                </CardTitle>
                <CardDescription>
                  {skillList.length} {skillList.length === 1 ? 'skill' : 'skills'} at {level} level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {skillList.length > 0 ? (
                  <div className="space-y-3">
                    {skillList.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{skill.skill_name}</h4>
                          {skill.details && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {skill.details}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">{level}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      No {level} skills yet
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/skills/upload">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skills
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Certifications */}
        {certifications && certifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Recent Certifications
              </CardTitle>
              <CardDescription>
                Your latest professional credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certifications.slice(0, 3).map((cert, index) => (
                  <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{cert.title}</h4>
                      {cert.issuer && (
                        <p className="text-xs text-muted-foreground">
                          {cert.issuer}
                        </p>
                      )}
                      {cert.issued_at && (
                        <p className="text-xs text-muted-foreground">
                          Issued: {cert.issued_at}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                ))}
                {certifications.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    And {certifications.length - 3} more certifications
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>
              Suggestions to advance your skills and career
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <Button variant="outline" asChild>
                <Link href="/skills/upload">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Skills
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile/edit">
                  <Play className="h-4 w-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/connections">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Find Mentors
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
