"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const nextPath = searchParams.get("next");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setSubmitting(false);

    if (error) {
      // Check if error is due to unconfirmed email
      if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
        toast.error("Email not confirmed", { 
          description: "Please check your inbox and confirm your email address. You can also resend the confirmation email below." 
        });
        return;
      }
      toast.error("Could not log in", { description: error.message });
      return;
    }

    toast.success("Welcome back");
    const safeNext =
      nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
    router.push(safeNext);
    router.refresh();
  }

  async function resendConfirmation() {
    const email = form.getValues("email");
    if (!email) {
      toast.error("Enter your email address first");
      return;
    }

    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    setResending(false);

    if (error) {
      toast.error("Could not resend confirmation", { description: error.message });
      return;
    }

    toast.success("Confirmation email sent", { 
      description: "Please check your inbox and spam folder" 
    });
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>
              {registered
                ? "After you confirm your email, sign in below."
                : "Sign in to SkillPath with your email and password."}
            </CardDescription>
            {registered && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Account created successfully! Please sign in to continue.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
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
                          autoComplete="current-password"
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
                  {submitting ? "Signing in…" : "Log in"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={resendConfirmation}
                  disabled={resending}
                >
                  {resending ? "Sending..." : "Resend confirmation email"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Need an account?{" "}
                  <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                    Create one
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

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-[calc(100vh-3.5rem)] px-4 py-8" />}>
      <LoginForm />
    </Suspense>
  );
}
