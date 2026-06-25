import { ACHIEVEMENTS, CURRICULUM, SKILL_KEYS, SKILL_META } from "../constants";
import type { LevelInfo, Profile } from "../types";
import { ProgressBar } from "./ProgressBar";
import { StatCard } from "./StatCard";

export function Dashboard({
  profile,
  lvl,
  unit,
  started,
  onStart,
  onContinue,
  nameDraft,
  onNameDraftChange,
  onSaveName,
}: {
  profile: Profile;
  lvl: LevelInfo;
  unit: string;
  started: boolean;
  onStart: () => void;
  onContinue: () => void;
  nameDraft: string;
  onNameDraftChange: (value: string) => void;
  onSaveName: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-8 max-w-5xl w-full mx-auto">
      {!profile.name && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="text-sm text-amber-800 flex-1">
            👋 What's your name? Ollie will remember it.
          </div>
          <div className="flex gap-2">
            <input
              value={nameDraft}
              onChange={(e) => onNameDraftChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSaveName()}
              placeholder="Your name"
              className="px-3 py-1.5 rounded-lg border border-amber-300 text-sm outline-none focus:border-amber-500 bg-white"
            />
            <button
              onClick={onSaveName}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-7">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-3xl shadow-sm">
          🦉
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            {profile.name ? `Hi, ${profile.name}!` : "Welcome!"}
          </h1>
          <p className="text-sm text-stone-500">
            Level {profile.level} · Unit:{" "}
            <span className="font-medium text-stone-600">{unit}</span>
          </p>
        </div>
        <button
          onClick={started ? onContinue : onStart}
          className="ml-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
        >
          {started ? "Continue lesson →" : "Start today's lesson 🚀"}
        </button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        <StatCard icon="⚡" label="XP" value={profile.xp} />
        <StatCard icon="🔥" label="Streak" value={`${profile.streak}d`} />
        <StatCard icon="🎓" label="Lessons" value={profile.lessonsCompleted} />
        <StatCard
          icon="🏆"
          label="Badges"
          value={`${profile.achievements.length}/${ACHIEVEMENTS.length}`}
        />
      </div>

      {/* level progress */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-7">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-stone-700">Level {lvl.level}</span>
          <span className="text-stone-400 tabular-nums">
            {lvl.into}/{lvl.need} XP to next level
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-400"
            style={{ width: `${(lvl.into / lvl.need) * 100}%` }}
          />
        </div>
      </div>

      {/* skills */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-7">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Skill progress</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SKILL_KEYS.map((k) => (
            <ProgressBar
              key={k}
              value={profile.skills[k]}
              label={SKILL_META[k].label}
              icon={SKILL_META[k].icon}
            />
          ))}
        </div>
      </div>

      {/* curriculum + history */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">
            Curriculum — {profile.level}
          </h2>
          <ol className="space-y-1.5 text-sm text-stone-600">
            {CURRICULUM[profile.level].map((u, i) => (
              <li
                key={u}
                className={`flex items-center gap-2 ${
                  i === profile.unitIndex ? "text-violet-700 font-medium" : ""
                }`}
              >
                <span className="w-5 text-xs text-stone-400 tabular-nums">{i + 1}.</span>
                {u}
                {i === profile.unitIndex && (
                  <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full ml-1">
                    current
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Recent activity</h2>
          {profile.history.length === 0 ? (
            <p className="text-sm text-stone-400">No lessons yet — start your first one above!</p>
          ) : (
            <ul className="space-y-2 text-sm text-stone-600">
              {profile.history
                .slice(-5)
                .reverse()
                .map((h, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{h.summary}</span>
                    <span className="text-stone-400 text-xs">{h.date}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
