import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEY } from "../constants";
import { applyStreakDecay, defaultProfile } from "../lib/profile";
import type { Profile } from "../types";

export function useProfile() {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const p: Profile = raw ? JSON.parse(raw) : defaultProfile();
      setProfileState(applyStreakDecay(p));
    } catch {
      setProfileState(defaultProfile());
    } finally {
      setLoaded(true);
    }
  }, []);

  const persist = useCallback(
    (next: Profile | ((prev: Profile) => Profile)) => {
      setProfileState((prev) => {
        const resolved = typeof next === "function" ? (next as (p: Profile) => Profile)(prev as Profile) : next;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
        } catch {
          /* best-effort; UI already updated optimistically */
        }
        return resolved;
      });
    },
    [],
  );

  return { profile, setProfile: persist, loaded };
}
