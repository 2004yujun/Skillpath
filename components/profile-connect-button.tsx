"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type ProfileConnectButtonProps = {
  profileId: string;
  initialConnected: boolean;
  isSelf: boolean;
  isDemo?: boolean;
};

export function ProfileConnectButton({
  profileId,
  initialConnected,
  isSelf,
  isDemo,
}: ProfileConnectButtonProps) {
  const router = useRouter();
  const [connected, setConnected] = useState(initialConnected);
  const [busy, setBusy] = useState(false);

  if (isDemo) {
    return (
      <Button type="button" variant="secondary" className="w-full md:w-auto" disabled>
        Sample profile
      </Button>
    );
  }

  if (isSelf) {
    return (
      <Button type="button" variant="outline" className="w-full md:w-auto" disabled>
        Your profile
      </Button>
    );
  }

  async function toggle() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=/profiles/${encodeURIComponent(profileId)}`);
      return;
    }

    setBusy(true);
    if (connected) {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", profileId);
      setBusy(false);
      if (error) {
        toast.error("Could not update connection", { description: error.message });
        return;
      }
      setConnected(false);
      toast.success("Removed from connections");
    } else {
      const { error } = await supabase.from("connections").insert({
        follower_id: user.id,
        following_id: profileId,
      });
      setBusy(false);
      if (error) {
        toast.error("Could not connect", { description: error.message });
        return;
      }
      setConnected(true);
      toast.success("Added to your connections");
    }
    router.refresh();
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <Button
        type="button"
        className="w-full md:w-auto"
        variant={connected ? "secondary" : "default"}
        disabled={busy}
        onClick={() => void toggle()}
      >
        {busy ? "…" : connected ? "Connected" : "Connect"}
      </Button>
      {connected ? (
        <Button type="button" variant="ghost" size="sm" asChild className="w-full md:w-auto">
          <Link href="/connections">View connections</Link>
        </Button>
      ) : null}
    </div>
  );
}
