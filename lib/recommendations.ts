import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  job_title: string | null;
  location: string | null;
  bio: string | null;
};

export type ScoredRecommendation = {
  profile: ProfileRow;
  score: number;
  reasons: string[];
};

/**
 * Recommends profiles by overlapping skills with you and with people you follow
 * (“your network”). Higher weight on direct skill matches; boosts when a skill
 * appears often among your connections.
 */
export async function getSkillBasedRecommendations(
  supabase: SupabaseClient,
  userId: string,
  limit = 12,
): Promise<ScoredRecommendation[]> {
  const { data: follows, error: followErr } = await supabase
    .from("connections")
    .select("following_id")
    .eq("follower_id", userId);

  if (followErr) {
    return [];
  }

  const following = new Set((follows ?? []).map((f) => f.following_id));
  following.add(userId);

  const { data: mySkills } = await supabase
    .from("skills")
    .select("skill_name")
    .eq("user_id", userId);

  const mySkillSet = new Set(
    (mySkills ?? []).map((s) => s.skill_name.trim().toLowerCase()),
  );

  const networkUserIds = [...following].filter((id) => id !== userId);
  const networkSkillFreq = new Map<string, number>();
  if (networkUserIds.length > 0) {
    const { data: netSkills } = await supabase
      .from("skills")
      .select("skill_name")
      .in("user_id", networkUserIds);
    for (const row of netSkills ?? []) {
      const k = row.skill_name.trim().toLowerCase();
      networkSkillFreq.set(k, (networkSkillFreq.get(k) ?? 0) + 1);
    }
  }

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, job_title, location, bio")
    .neq("id", userId);

  const candidates = (allProfiles as ProfileRow[] | null)?.filter((p) => !following.has(p.id)) ?? [];
  if (candidates.length === 0) return [];

  const candidateIds = candidates.map((c) => c.id);
  const { data: allCandidateSkills } = await supabase
    .from("skills")
    .select("user_id, skill_name")
    .in("user_id", candidateIds);

  const skillsByUser = new Map<string, Set<string>>();
  for (const row of allCandidateSkills ?? []) {
    if (!skillsByUser.has(row.user_id)) skillsByUser.set(row.user_id, new Set());
    skillsByUser.get(row.user_id)!.add(row.skill_name.trim().toLowerCase());
  }

  const scored: ScoredRecommendation[] = candidates.map((profile) => {
    const theirSkills = skillsByUser.get(profile.id) ?? new Set();
    let score = 0;
    const reasonParts: string[] = [];

    for (const s of theirSkills) {
      if (mySkillSet.has(s)) {
        score += 4;
        reasonParts.push(`You both list “${s}”`);
      }
      const nw = networkSkillFreq.get(s) ?? 0;
      if (nw > 0) {
        score += Math.min(2 + nw, 8);
        if (reasonParts.length < 4) {
          reasonParts.push(`“${s}” is common in your network`);
        }
      }
    }

    return {
      profile,
      score,
      reasons: [...new Set(reasonParts)].slice(0, 3),
    };
  });

  const positive = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  if (positive.length > 0) {
    return positive.slice(0, limit);
  }

  return candidates.slice(0, Math.min(6, limit)).map((profile) => ({
    profile,
    score: 0,
    reasons: ["Add skills to get better matches"],
  }));
}
