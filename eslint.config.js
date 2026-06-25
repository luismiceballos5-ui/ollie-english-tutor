import { ACHIEVEMENTS } from "../constants";
import type { Profile } from "../types";
import { daysBetween, todayStr } from "./date";

export function defaultProfile(): Profile {
  return {
    name: "",
    level: "A1",
    unitIndex: 0,
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    lessonsCompleted: 0,
    skills: {
      vocabulary: 0,
      reading: 0,
      grammar: 0,
      writing: 0,
      speaking: 0,
      pronunciation: 0,
    },
    weakAreas: [],
    achievements: [],
    history: [],
  };
}

export function applyStreakDecay(p: Profile): Profile {
  if (!p.lastActiveDate) return p;
  const gap = daysBetween(p.lastActiveDate, todayStr());
  if (gap >= 2) return { ...p, streak: 0 };
  return p;
}

export function bumpStreakAndXp(p: Profile, xpGain: number): Profile {
  const today = todayStr();
  let streak = p.streak;
  if (p.lastActiveDate !== today) {
    const gap = p.lastActiveDate ? daysBetween(p.lastActiveDate, today) : 1;
    streak = gap === 1 ? streak + 1 : 1;
  }
  const newAchievements = [...p.achievements];
  const xp = p.xp + xpGain;
  const candidate: Profile = { ...p, xp, streak, lastActiveDate: today };
  ACHIEVEMENTS.forEach((a) => {
    if (!newAchievements.includes(a.id) && a.test(candidate)) {
      newAchievements.push(a.id);
    }
  });
  return { ...candidate, achievements: newAchievements };
}
