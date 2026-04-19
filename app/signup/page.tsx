"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

const signupSchema = z
  .object({
    name: z.string().min(2, "Enter at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match exactly",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupValues) {
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.name },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
      },
    });
    setSubmitting(false);

    if (error) {
      toast.error("Could not create account", { description: error.message });
      return;
    }

    if (data.session) {
      toast.success("Account created", { description: `Welcome, ${values.name}. Please log in.` });
      form.reset();
      router.push("/login?registered=1");
      return;
    }

    toast.success("Account created successfully", {
      description: "Please check your email to confirm, then log in.",
    });
    form.reset();
    router.push("/login?registered=1");
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Join SkillPath to showcase skills, courses, and certifications.
            </CardDescription>
            <Alert className="mt-4">
              <Mail className="text-muted-foreground" />
              <AlertTitle>Email Configuration</AlertTitle>
              <AlertDescription>
                <strong>Quick Fix:</strong> Go to Supabase Dashboard <strong>Authentication -&gt; Settings</strong> and turn <strong>OFF</strong> "Confirm email" for immediate login.
                <br /><br />
                <strong>For Production:</strong> Configure SMTP or use Supabase&apos;s built-in email in <strong>Authentication -&gt; Providers -&gt; Email</strong>.
              </AlertDescription>
            </Alert>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input autoComplete="name" placeholder="Alex Rivera" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating…" : "Create account"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                    Log in
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
