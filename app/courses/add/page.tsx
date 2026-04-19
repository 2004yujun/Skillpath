"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const courseSchema = z.object({
  title: z.string().min(2, "Enter course title"),
  provider: z.string().min(2, "Enter course provider"),
  completionDate: z.string().min(1, "Enter completion date"),
  certificateUrl: z.string().url("Enter valid URL").optional().or(z.literal("")),
  description: z.string().max(500),
});

type CourseValues = z.infer<typeof courseSchema>;

const emptyCourse: CourseValues = {
  title: "",
  provider: "",
  completionDate: "",
  certificateUrl: "",
  description: "",
};

export default function AddCoursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<CourseValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: emptyCourse,
  });

  async function onSubmit(values: CourseValues) {
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

    // For now, we'll store courses in the certifications table as they're similar
    const { error } = await supabase.from("certifications").insert({
      user_id: user.id, // Keep as user_id for certifications table since it references auth.users
      title: `${values.title} - ${values.provider}`,
      issuer: values.provider,
      issued_at: values.completionDate,
      // We could add a certificate_url field to the table in the future
    });

    setSubmitting(false);

    if (error) {
      toast.error("Could not add course", { description: error.message });
      return;
    }

    toast.success("Course added", {
      description: `${values.title} has been added to your profile.`,
    });
    router.push("/courses");
    router.refresh();
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Add Course</CardTitle>
            <CardDescription>
              Add a completed course to your learning profile
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduction to React" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Coursera, Udemy, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="completionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="certificateUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-24 resize-y" placeholder="What you learned..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Course"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/profile" className="text-primary underline-offset-4 hover:underline">
                    Back to profile
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </main>
  );
}
