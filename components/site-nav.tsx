"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
        <Link href="/" className="font-semibold text-foreground">
          SkillPath
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-muted-foreground">
          {user ? (
            <>
              <Link href="/connections" className="hover:text-foreground">
                Connections
              </Link>
              <Link href="/profile" className="hover:text-foreground">
                View Profile
              </Link>
              <Button type="button" variant="outline" size="sm" onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-foreground">
                Log in
              </Link>
              <Link href="/signup" className="hover:text-foreground">
                Create account
              </Link>
              <Link href="/connections" className="hover:text-foreground">
                Connections
              </Link>
                          </>
          )}
        </nav>
      </div>
    </header>
  );
}
