"use client";
// hooks/useDashboard.ts

import { useState, useEffect } from "react";
import type { DashboardSummary, Group, Friend, Activity } from "@/types";

interface DashboardData {
  summary:  DashboardSummary;
  groups:   Group[];
  friends:  Friend[];
  activity: Activity[];
  loading:  boolean;
  error:    string | null;
  refetch:  () => void;
}

const AVATAR_COLORS = [
  "rgba(255,79,121,0.15)",
  "rgba(74,222,128,0.12)",
  "rgba(239,159,39,0.15)",
  "rgba(175,169,236,0.2)",
  "rgba(83,74,183,0.2)",
  "rgba(56,189,248,0.15)",
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function useDashboard(): DashboardData {
  const [summary,  setSummary]  = useState<DashboardSummary>({ totalOwed: 0, totalOwing: 0, monthlyShared: 0 });
  const [groups,   setGroups]   = useState<Group[]>([]);
  const [friends,  setFriends]  = useState<Friend[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  const refetch = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      try {
        const [summaryRes, groupsRes, friendsRes, activityRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/groups"),
          fetch("/api/friends"),
          fetch("/api/activity"),
        ]);

        if (cancelled) return;

        // ── Summary ──
        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data.summary);
        }

        // ── Groups ──
        if (groupsRes.ok) {
          const data = await groupsRes.json();
          setGroups(data.groups ?? []);
        }

        // ── Friends ──
        if (friendsRes.ok) {
          const data = await friendsRes.json();
          const mapped = (data.friends ?? []).map((f: any, i: number) => ({
            id:          f.id,
            name:        f.name,
            email:       f.email,
            initials:    f.initials,
            avatarColor: getAvatarColor(i),
            balance:     f.balance,
          }));
          setFriends(mapped);
        }

        // ── Activity ──
        if (activityRes.ok) {
          const data = await activityRes.json();
          setActivity(data.activities ?? []);
        }
      } catch (err) {
        if (!cancelled) setError("Failed to load data. Please refresh.");
        console.error("useDashboard fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [tick]);

  return { summary, groups, friends, activity, loading, error, refetch };
}