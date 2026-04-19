"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const uploadSchema = z.object({
  skillName: z.string().min(2, "Name your skill"),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"], {
    required_error: "Choose a proficiency level",
  }),
  details: z.string().max(2000).optional(),
  proof: z.instanceof(FileList).optional(),
});

type UploadValues = z.infer<typeof uploadSchema>;

export default function SkillUploadPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      skillName: "",
      details: "",
    },
  });

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        router.replace("/login");
        return;
      }
      setReady(true);
    }
    void checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(values: UploadValues) {
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

    const file = values.proof?.[0];
    let proofPath: string | null = null;

    if (file && file.size > 0) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("skill-proofs")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        toast.error("Could not upload file", { description: uploadError.message });
        setSubmitting(false);
        return;
      }
      proofPath = path;
    }

    const { error } = await supabase.from("skills").insert({
      user_id: user.id, // Keep as user_id for skills table since it references auth.users
      skill_name: values.skillName.trim(),
      proficiency: values.proficiency,
      details: values.details?.trim() || null,
      proof_path: proofPath,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Could not save skill", { description: error.message });
      return;
    }

    toast.success("Skill saved", {
      description: file
        ? `${values.skillName} (${values.proficiency}) — file attached.`
        : `${values.skillName} (${values.proficiency}) added to your profile.`,
    });
    form.reset();
    router.push("/");
    router.refresh();
  }

  if (!ready) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto w-full max-w-md text-sm text-muted-foreground">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Upload a skill</CardTitle>
            <CardDescription>
              Stored in Supabase (<code className="text-xs">skills</code> table and optional{" "}
              <code className="text-xs">skill-proofs</code> storage).
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="skillName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Figma, Python, Project management" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proficiency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proficiency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Projects, years of experience, context…"
                          className="min-h-24 resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Shown on your profile with this skill.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proof"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proof (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="cursor-pointer file:cursor-pointer"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          onChange={(e) => field.onChange(e.target.files ?? undefined)}
                        />
                      </FormControl>
                      <FormDescription>Uploaded to the private skill-proofs bucket.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
                <Button type="submit" className="w-full gap-2" disabled={submitting}>
                  <Upload className="size-4" />
                  {submitting ? "Saving…" : "Save skill"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/" className="text-primary underline-offset-4 hover:underline">
                    View public profile
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
