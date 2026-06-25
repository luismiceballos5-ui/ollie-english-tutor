import { useEffect, useRef, useState } from "react";
import { AchievementsView } from "./components/AchievementsView";
import { AchievementToast } from "./components/AchievementToast";
import { Dashboard } from "./components/Dashboard";
import { LessonView } from "./components/LessonView";
import { Sidebar } from "./components/Sidebar";
import { ACHIEVEMENTS, CURRICULUM, LESSON_PARTS, SKILL_META } from "./constants";
import { useProfile } from "./hooks/useProfile";
import { callAI } from "./lib/api";
import { levelFromXp } from "./lib/level";
import { bumpStreakAndXp } from "./lib/profile";
import { buildSystemPrompt } from "./lib/prompt";
import { todayStr } from "./lib/date";
import type { AppView, ChatMessage, ToastState } from "./types";

export default function App() {
  const { profile, setProfile, loaded } = useProfile();
  const [view, setView] = useState<AppView>("dashboard");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [activePart, setActivePart] = useState(1);
  const [error, setError] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3200);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function awardXp(amount: number, skillKey?: string | null, skillGain = 4) {
    setProfile((prev) => {
      const skills = { ...prev.skills };
      if (skillKey && skillKey in skills) {
        const key = skillKey as keyof typeof skills;
        skills[key] = Math.min(100, skills[key] + skillGain);
      }
      const bumped = bumpStreakAndXp({ ...prev, skills }, amount);
      const before = ACHIEVEMENTS.filter((a) => prev.achievements.includes(a.id)).length;
      const after = ACHIEVEMENTS.filter((a) => bumped.achievements.includes(a.id)).length;
      if (after > before) {
        const newOne = ACHIEVEMENTS.find(
          (a) => bumped.achievements.includes(a.id) && !prev.achievements.includes(a.id),
        );
        if (newOne) setToast({ icon: newOne.icon, label: newOne.label });
      }
      return bumped;
    });
  }

  async function startLesson() {
    if (!profile) return;
    setStarted(true);
    setView("lesson");
    setLoading(true);
    setError("");
    const sys = buildSystemPrompt(profile);
    const init: ChatMessage[] = [
      { role: "user", content: "Hello! I want to start my English lesson." },
    ];
    setMessages(init);
    const { text, error: callError } = await callAI(init, sys);
    if (text) setMessages([...init, { role: "assistant", content: text }]);
    if (callError) setError(callError);
    awardXp(5);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function send() {
    if (!input.trim() || loading || !profile) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    const sys = buildSystemPrompt(profile);
    const { text, error: callError } = await callAI(next, sys);
    if (text) setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    if (callError) setError(callError);
    const partKey = LESSON_PARTS[activePart - 1]?.key;
    awardXp(8, SKILL_META[partKey as keyof typeof SKILL_META] ? partKey : null);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function jumpTo(part: number) {
    if (!started || loading || !profile) return;
    setActivePart(part);
    const label = LESSON_PARTS[part - 1].label;
    const jump: ChatMessage = {
      role: "user",
      content: `Let's go to Part ${part}: ${label} now please.`,
    };
    const next = [...messages, jump];
    setMessages(next);
    setLoading(true);
    setError("");
    const sys = buildSystemPrompt(profile);
    const { text, error: callError } = await callAI(next, sys);
    if (text) setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    if (callError) setError(callError);
    setLoading(false);
  }

  function finishLesson() {
    setProfile((prev) => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + 1,
      history: [
        ...prev.history,
        {
          date: todayStr(),
          summary: `Lesson covering ${LESSON_PARTS[activePart - 1]?.label || "general practice"}`,
        },
      ].slice(-20),
    }));
    awardXp(15);
    setView("dashboard");
  }

  function saveName() {
    if (!nameDraft.trim()) return;
    setProfile((prev) => ({ ...prev, name: nameDraft.trim() }));
    setNameDraft("");
  }

  if (!loaded || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FBF8F2] text-stone-400 text-sm">
        Loading your progress…
      </div>
    );
  }

  const lvl = levelFromXp(profile.xp);
  const unit = CURRICULUM[profile.level]?.[profile.unitIndex] || CURRICULUM.A1[0];

  return (
    <div className="h-screen flex bg-[#FBF8F2] font-sans text-stone-800">
      <Sidebar
        profile={profile}
        lvl={lvl}
        view={view}
        started={started}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSetView={setView}
        onStartLesson={startLesson}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="text-stone-500 text-xl">
            ☰
          </button>
          <span className="font-semibold text-stone-700">
            {view === "dashboard" ? "Dashboard" : view === "lesson" ? "Lesson" : "Achievements"}
          </span>
        </div>

        {view === "dashboard" && (
          <Dashboard
            profile={profile}
            lvl={lvl}
            unit={unit}
            started={started}
            onStart={startLesson}
            onContinue={() => setView("lesson")}
            onNameDraftChange={setNameDraft}
            nameDraft={nameDraft}
            onSaveName={saveName}
          />
        )}

        {view === "achievements" && <AchievementsView profile={profile} />}

        {view === "lesson" && (
          <LessonView
            profile={profile}
            started={started}
            messages={messages}
            loading={loading}
            error={error}
            input={input}
            setInput={setInput}
            send={send}
            startLesson={startLesson}
            jumpTo={jumpTo}
            activePart={activePart}
            inputRef={inputRef}
            bottomRef={bottomRef}
            finishLesson={finishLesson}
          />
        )}
      </div>

      {toast && <AchievementToast toast={toast} />}
    </div>
  );
}
