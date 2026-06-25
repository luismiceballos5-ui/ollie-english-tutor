import { ACHIEVEMENTS } from "../constants";
import type { Profile } from "../types";

export function AchievementsView({ profile }: { profile: Profile }) {
  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-8 max-w-3xl w-full mx-auto">
      <h1 className="text-xl font-bold text-stone-800 mb-1">Achievements</h1>
      <p className="text-sm text-stone-500 mb-6">
        {profile.achievements.length} of {ACHIEVEMENTS.length} unlocked
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = profile.achievements.includes(a.id);
          return (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 flex items-center gap-3 ${
                unlocked ? "bg-white border-stone-200" : "bg-stone-50 border-stone-100 opacity-60"
              }`}
            >
              <div className="text-2xl">{unlocked ? a.icon : "🔒"}</div>
              <div>
                <div className="text-sm font-semibold text-stone-700">{a.label}</div>
                <div className="text-xs text-stone-400">{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
