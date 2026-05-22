"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export function useHydrated() {
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (_hasHydrated) setReady(true);
  }, [_hasHydrated]);

  return ready;
}