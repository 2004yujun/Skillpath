"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const profileSchema = z.object({
  displayName: z.string().min(2, "Enter your name"),
  jobTitle: z.string().min(2, "Add a professional title"),
  location: z.string().min(2, "Add a location"),
  bio: z.string().max(2000),
});

type ProfileValues = z.infer<typeof profileSchema>;

const emptyProfile: ProfileValues = {
  displayName: "",
  jobTitle: "",
  location: "",
  bio: "",
};

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: emptyProfile,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, job_title, location, bio")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        toast.error("Could not load profile", { description: error.message });
        setLoading(false);
        return;
      }

      if (profile) {
        form.reset({
          displayName: profile.full_name ?? "",
          jobTitle: profile.job_title ?? "",
          location: profile.location ?? "",
          bio: profile.bio ?? "",
        });
      } else {
        form.reset({
          ...emptyProfile,
          displayName: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
        });
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [form, router]);

  async function onSubmit(values: ProfileValues) {
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You are not signed in");
      setSubmitting(false);
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: values.displayName,
        job_title: values.jobTitle,
        location: values.location,
        bio: values.bio.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    setSubmitting(false);

    if (error) {
      toast.error("Could not save profile", { description: error.message });
      return;
    }

    toast.success("Profile updated", {
      description: `${values.displayName} — ${values.jobTitle}`,
    });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>
              Updates your learner profile in Supabase (profiles table).
            </CardDescription>
          </CardHeader>
          {loading ? (
            <CardContent className="text-sm text-muted-foreground">Loading…</CardContent>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display name</FormLabel>
                        <FormControl>
                          <Input autoComplete="name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional title</FormLabel>
                        <FormControl>
                          <Input placeholder="Role or focus area" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, region, or remote" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-32 resize-y" placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Saving…" : "Save changes"}
                  </Button>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/skills/upload">
                        Upload Skills
                      </Link>
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      <Link href="/" className="text-primary underline-offset-4 hover:underline">
                        Cancel and view profile
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </main>
  );
}
