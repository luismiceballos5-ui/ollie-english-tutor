import { useState, useRef, useEffect, useCallback } from "react";

/* ----------------------------------------------------------------------
   OLLIE — English Tutor
   A personal English-learning companion for a 13-year-old Spanish-
   speaking student, A1 → B1/B2.

   Design language: "field notebook" — warm parchment cards, a single
   confident indigo-to-amber gradient reserved for progress/XP (the one
   signature element), hairline rules instead of heavy shadows, and a
   hand-drawn-feeling owl mark. Everything else stays quiet so the
   gradient actually means something when it shows up.
   ------------------------------------------------------------------- */

const SKILL_KEYS = ["vocabulary", "reading", "grammar", "writing", "speaking", "pronunciation"];

const SKILL_META = {
  vocabulary: { label: "Vocabulary", icon: "📚" },
  reading: { label: "Reading", icon: "📖" },
  grammar: { label: "Grammar", icon: "✏️" },
  writing: { label: "Writing", icon: "📝" },
  speaking: { label: "Speaking", icon: "💬" },
  pronunciation: { label: "Pronunciation", icon: "🗣️" },
};

const LESSON_PARTS = [
  { id: 1, key: "warmup", label: "Warm-Up", icon: "☀️" },
  { id: 2, key: "vocabulary", label: "Vocabulary", icon: "📚" },
  { id: 3, key: "reading", label: "Reading", icon: "📖" },
  { id: 4, key: "grammar", label: "Grammar", icon: "✏️" },
  { id: 5, key: "writing", label: "Writing", icon: "📝" },
  { id: 6, key: "speaking", label: "Speaking", icon: "💬" },
  { id: 7, key: "pronunciation", label: "Pronunciation", icon: "🗣️" },
  { id: 8, key: "review", label: "Review", icon: "🔄" },
  { id: 9, key: "quiz", label: "Quiz", icon: "🏆" },
  { id: 10, key: "homework", label: "Homework", icon: "🏠" },
];

const CURRICULUM = {
  A1: ["Greetings", "Alphabet", "Numbers", "Colors", "Family", "School", "Food", "Animals", "To Be", "Present Simple", "Daily Routines"],
  A2: ["Travel", "Shopping", "Past Simple", "Present Continuous", "Future", "Comparatives", "Prepositions", "Modal Verbs"],
  B1: ["Opinion Writing", "Debates", "Storytelling", "Emails", "Problem Solving", "Reading Analysis", "Conversation"],
};

const ACHIEVEMENTS = [
  { id: "first_lesson", label: "First Step", icon: "🌱", desc: "Completed your first lesson", test: s => s.lessonsCompleted >= 1 },
  { id: "streak_3", label: "On a Roll", icon: "🔥", desc: "3-day streak", test: s => s.streak >= 3 },
  { id: "streak_7", label: "Week Warrior", icon: "⚡", desc: "7-day streak", test: s => s.streak >= 7 },
  { id: "xp_100", label: "Rising Star", icon: "⭐", desc: "Earned 100 XP", test: s => s.xp >= 100 },
  { id: "xp_500", label: "English Explorer", icon: "🧭", desc: "Earned 500 XP", test: s => s.xp >= 500 },
  { id: "vocab_50", label: "Word Collector", icon: "🪙", desc: "50 vocabulary points", test: s => s.skills.vocabulary >= 50 },
  { id: "lessons_10", label: "Dedicated Student", icon: "🎓", desc: "10 lessons completed", test: s => s.lessonsCompleted >= 10 },
];

const STORAGE_KEY = "ollie:profile";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function defaultProfile() {
  return {
    name: "",
    level: "A1",
    unitIndex: 0,
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    lessonsCompleted: 0,
    skills: { vocabulary: 0, reading: 0, grammar: 0, writing: 0, speaking: 0, pronunciation: 0 },
    weakAreas: [],
    achievements: [],
    history: [], // { date, summary }
  };
}

function levelFromXp(xp) {
  // simple curve: each level needs 20% more than the last, base 60xp
  let level = 1, need = 60, total = 0;
  while (xp >= total + need) {
    total += need;
    level += 1;
    need = Math.round(need * 1.2);
  }
  const into = xp - total;
  return { level, into, need };
}

function buildSystemPrompt(profile) {
  const unit = CURRICULUM[profile.level]?.[profile.unitIndex] || CURRICULUM[profile.level][0];
  const weak = profile.weakAreas.length ? profile.weakAreas.join(", ") : "none recorded yet";
  const recent = profile.history.slice(-3).map(h => `- ${h.date}: ${h.summary}`).join("\n") || "- No previous lessons yet.";

  return `You are Ollie, a world-class, warm English teacher for a 13-year-old native Spanish speaker.

STUDENT MEMORY (use this to personalize — do not re-ask what you already know):
- Name: ${profile.name || "not given yet, ask warmly"}
- CEFR level: ${profile.level}
- Current curriculum unit: "${unit}"
- Total XP: ${profile.xp}
- Streak: ${profile.streak} day(s)
- Skill scores (0-100): ${SKILL_KEYS.map(k => `${k}=${profile.skills[k]}`).join(", ")}
- Known weak areas to review/recycle: ${weak}
- Recent lesson history:
${recent}

CORE BEHAVIOR
- Be encouraging, patient, fun, and use emojis naturally — never overdo it.
- Adapt difficulty to the level above. Never overwhelm; teach ONE major grammar concept per lesson.
- Use spaced repetition: briefly recycle a previous weak area before introducing new material.
- Student should produce more language than you do — aim for them speaking/writing 70% of the exchange.
- Use English almost always. Use Spanish only to clarify something the student clearly didn't understand.
- NEVER reveal answers to a question/exercise before the student attempts it.
- When correcting, always explain WHY and use this exact format:
❌ What you wrote
✅ Correct version
📝 Why
💡 Tip to remember
- Celebrate genuine progress specifically (not generic "good job") — tie it to what they did well.
- Keep messages concise, short paragraphs, easy to read on a phone.

LESSON STRUCTURE (work through this order across the conversation, one piece per turn — don't dump everything at once):
1. Warm-Up — 5-8 casual questions about their life, gently corrected.
2. Vocabulary — 8-12 words: meaning, pronunciation, part of speech, example, synonym, opposite. Then matching / fill-in-blank / sentence creation.
3. Reading — an original 100-180 word passage on a topic they like, then Main Idea → Details → Vocabulary in Context → Inference → Opinion → Evidence.
4. Grammar — ONE topic from the unit above: Explain → Examples → Common Mistakes → Practice → Correction.
5. Writing — a 60-150 word challenge; brainstorm together first, then correct grammar/vocab/spelling/punctuation/organization, showing original vs corrected.
6. Speaking (text-based) — open questions; after each answer correct it, model a natural rewrite, teach one expression, give a pronunciation tip.
7. Pronunciation — pick up to 5 words: how to say it, stress, hard sounds for Spanish speakers, a practice sentence.
8. Review — quick recap, a few check questions.
9. Quiz — short quiz mixing vocabulary + grammar + reading; wait for the student's answers before correcting anything.
10. Homework — a ~15-minute personalized assignment touching reading, vocabulary, writing, grammar, and speaking practice.

If the student jumps to a specific part via the navigation, go straight there and teach that part well, still following its internal structure above.

FIRST MESSAGE OF A NEW SESSION: greet warmly using their name if known, briefly reference where they left off (recent history above) if any, then continue or start the plan.`;
}

/* ---------------------- friendly rate-limit message ---------------------- */

function formatResetTime(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const diffMin = Math.round((d.getTime() - Date.now()) / 60000);
    const clock = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (diffMin <= 1) return `in a moment (around ${clock})`;
    if (diffMin < 60) return `in about ${diffMin} min (around ${clock})`;
    const hours = Math.round(diffMin / 60);
    return `in about ${hours} hour${hours === 1 ? "" : "s"} (around ${clock})`;
  } catch {
    return null;
  }
}

// Detects the "you've hit your usage limit" error shape and turns it into a
// short, student-friendly sentence instead of dumping raw JSON in the chat.
function friendlyErrorMessage(data, status) {
  const isLimitError =
    data?.type === "exceeded_limit" ||
    data?.resolved?.status === "exceeded" ||
    data?.error?.type === "rate_limit_error" ||
    status === 429;

  if (isLimitError) {
    const resetsAt = data?.resets_at || data?.resolved?.resets_at || data?.notice?.resets_at;
    const whenIso = typeof resetsAt === "number" ? new Date(resetsAt * 1000).toISOString() : resetsAt;
    const when = whenIso ? formatResetTime(whenIso) : null;
    return when
      ? `Ollie needs a short break — we've used up today's lesson time! Let's pick this back up ${when}. 🦉☕`
      : `Ollie needs a short break — we've used up today's lesson time! Please try again a little later. 🦉☕`;
  }

  return null;
}

/* ---------------------------- storage hook ---------------------------- */

function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        const p = res ? JSON.parse(res.value) : defaultProfile();
        setProfile(applyStreakDecay(p));
      } catch {
        setProfile(defaultProfile());
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setProfile(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
    } catch {
      /* best-effort; UI already updated optimistically */
    }
  }, []);

  return { profile, setProfile: persist, loaded };
}

function applyStreakDecay(p) {
  if (!p.lastActiveDate) return p;
  const gap = daysBetween(p.lastActiveDate, todayStr());
  if (gap >= 2) return { ...p, streak: 0 };
  return p;
}

function bumpStreakAndXp(p, xpGain) {
  const today = todayStr();
  let streak = p.streak;
  if (p.lastActiveDate !== today) {
    const gap = p.lastActiveDate ? daysBetween(p.lastActiveDate, today) : 1;
    streak = gap === 1 ? streak + 1 : 1;
  }
  const newAchievements = [...p.achievements];
  const xp = p.xp + xpGain;
  const candidate = { ...p, xp, streak, lastActiveDate: today };
  ACHIEVEMENTS.forEach(a => {
    if (!newAchievements.includes(a.id) && a.test(candidate)) newAchievements.push(a.id);
  });
  return { ...candidate, achievements: newAchievements };
}

/* ------------------------------- UI bits ------------------------------- */

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3.5 py-2.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400"
          style={{ animation: "ollieBounce 1.2s infinite", animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 mb-3.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-500">
          🦉
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-2xl rounded-br-md shadow-[0_3px_12px_rgba(99,102,241,0.3)]"
            : "bg-white text-stone-800 rounded-2xl rounded-bl-md border border-stone-200"
        }`}
      >
        {msg.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 bg-gradient-to-br from-amber-400 to-orange-500">
          🧑‍🎓
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value, label, icon }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
        <span className="flex items-center gap-1.5 font-medium text-stone-700">
          <span>{icon}</span>{label}
        </span>
        <span className="tabular-nums">{Math.round(value)}/100</span>
      </div>
      <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors ${
        active ? "bg-violet-50 text-violet-700" : "text-stone-600 hover:bg-stone-50"
      }`}
    >
      <span className="text-base">{icon}</span>{label}
    </button>
  );
}

/* -------------------------------- App ---------------------------------- */

export default function App() {
  const { profile, setProfile, loaded } = useProfile();
  const [view, setView] = useState("dashboard"); // dashboard | lesson
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [activePart, setActivePart] = useState(1);
  const [error, setError] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3200);
      return () => clearTimeout(t);
    }
  }, [toast]);

  /* ----- API call: fixed. No api-key header — the host injects auth. ----- */
  async function callAI(history, systemPrompt) {
    setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: history,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setError("The tutor's server sent back something unreadable. Please try again.");
        return null;
      }

      if (!res.ok) {
        const friendly = friendlyErrorMessage(data, res.status);
        if (friendly) {
          setError(friendly);
        } else {
          const msg = data?.error?.message || `HTTP ${res.status}`;
          setError(`API error: ${msg}`);
        }
        return null;
      }

      const text = Array.isArray(data?.content)
        ? data.content.map(b => (b?.type === "text" ? b.text : "")).join("")
        : "";

      if (!text) {
        setError("Ollie didn't return any text. Please try sending that again.");
        return null;
      }
      return text;
    } catch (e) {
      setError(`Network error: ${e?.message || "could not reach the tutor."}`);
      return null;
    }
  }

  function awardXp(amount, skillKey, skillGain = 4) {
    setProfile(prev => {
      const skills = { ...prev.skills };
      if (skillKey) skills[skillKey] = Math.min(100, skills[skillKey] + skillGain);
      const bumped = bumpStreakAndXp({ ...prev, skills }, amount);
      const before = ACHIEVEMENTS.filter(a => prev.achievements.includes(a.id)).length;
      const after = ACHIEVEMENTS.filter(a => bumped.achievements.includes(a.id)).length;
      if (after > before) {
        const newOne = ACHIEVEMENTS.find(a => bumped.achievements.includes(a.id) && !prev.achievements.includes(a.id));
        if (newOne) setToast({ icon: newOne.icon, label: newOne.label });
      }
      return bumped;
    });
  }

  async function startLesson() {
    setStarted(true);
    setView("lesson");
    setLoading(true);
    const sys = buildSystemPrompt(profile);
    const init = [{ role: "user", content: "Hello! I want to start my English lesson." }];
    setMessages(init);
    const reply = await callAI(init, sys);
    if (reply) setMessages([...init, { role: "assistant", content: reply }]);
    awardXp(5);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    const sys = buildSystemPrompt(profile);
    const reply = await callAI(next, sys);
    if (reply) setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    const partKey = LESSON_PARTS[activePart - 1]?.key;
    awardXp(8, SKILL_META[partKey] ? partKey : null);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function jumpTo(part) {
    if (!started || loading) return;
    setActivePart(part);
    const label = LESSON_PARTS[part - 1].label;
    const jump = { role: "user", content: `Let's go to Part ${part}: ${label} now please.` };
    const next = [...messages, jump];
    setMessages(next);
    setLoading(true);
    const sys = buildSystemPrompt(profile);
    const reply = await callAI(next, sys);
    if (reply) setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  function finishLesson() {
    setProfile(prev => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + 1,
      history: [...prev.history, { date: todayStr(), summary: `Lesson covering ${LESSON_PARTS[activePart - 1]?.label || "general practice"}` }].slice(-20),
    }));
    awardXp(15);
    setView("dashboard");
  }

  function saveName() {
    if (!nameDraft.trim()) return;
    setProfile(prev => ({ ...prev, name: nameDraft.trim() }));
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
    <div className="h-screen flex bg-[#FBF8F2] font-sans text-stone-800" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes ollieBounce { 0%,80%,100% { transform: translateY(0); opacity:.5 } 40% { transform: translateY(-5px); opacity:1 } }
        @keyframes ollieIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
      `}</style>

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-30 inset-y-0 left-0 w-64 bg-white border-r border-stone-200 flex flex-col p-4 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 px-2 mb-6">
          <span className="text-2xl">🦉</span>
          <div>
            <div className="font-bold text-stone-800 leading-tight">Ollie</div>
            <div className="text-[11px] text-stone-400 leading-tight">English Tutor</div>
          </div>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto">
          <SidebarLink icon="🏡" label="Dashboard" active={view === "dashboard"} onClick={() => { setView("dashboard"); setSidebarOpen(false); }} />
          <SidebarLink icon="🦉" label={started ? "Continue Lesson" : "Start Lesson"} active={view === "lesson"} onClick={() => { setSidebarOpen(false); started ? setView("lesson") : startLesson(); }} />
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Skills</div>
          {SKILL_KEYS.map(k => (
            <div key={k} className="px-3 py-1 text-[13px] text-stone-500 flex items-center justify-between">
              <span className="flex items-center gap-2">{SKILL_META[k].icon} {SKILL_META[k].label}</span>
              <span className="text-[11px] tabular-nums text-stone-400">{profile.skills[k]}</span>
            </div>
          ))}
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Other</div>
          <SidebarLink icon="🏆" label="Achievements" active={view === "achievements"} onClick={() => { setView("achievements"); setSidebarOpen(false); }} />
        </nav>

        <div className="pt-3 border-t border-stone-100 mt-2">
          <div className="text-[11px] text-stone-400 px-2">Level {lvl.level} · {profile.xp} XP</div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="text-stone-500 text-xl">☰</button>
          <span className="font-semibold text-stone-700">{view === "dashboard" ? "Dashboard" : view === "lesson" ? "Lesson" : "Achievements"}</span>
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

      {toast && (
        <div className="fixed bottom-5 right-5 bg-white border border-stone-200 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 z-40" style={{ animation: "ollieIn .25s ease-out" }}>
          <span className="text-2xl">{toast.icon}</span>
          <div>
            <div className="text-[11px] text-stone-400 uppercase tracking-wide">Achievement unlocked</div>
            <div className="text-sm font-semibold text-stone-800">{toast.label}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Dashboard view ---------------------------- */

function Dashboard({ profile, lvl, unit, started, onStart, onContinue, nameDraft, onNameDraftChange, onSaveName }) {
  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-8 max-w-5xl w-full mx-auto">
      {!profile.name && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="text-sm text-amber-800 flex-1">👋 What's your name? Ollie will remember it.</div>
          <div className="flex gap-2">
            <input
              value={nameDraft}
              onChange={e => onNameDraftChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSaveName()}
              placeholder="Your name"
              className="px-3 py-1.5 rounded-lg border border-amber-300 text-sm outline-none focus:border-amber-500 bg-white"
            />
            <button onClick={onSaveName} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium">Save</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-7">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-3xl shadow-sm">🦉</div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            {profile.name ? `Hi, ${profile.name}!` : "Welcome!"}
          </h1>
          <p className="text-sm text-stone-500">Level {profile.level} · Unit: <span className="font-medium text-stone-600">{unit}</span></p>
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
        <StatCard icon="🏆" label="Badges" value={`${profile.achievements.length}/${ACHIEVEMENTS.length}`} />
      </div>

      {/* level progress */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-7">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-stone-700">Level {lvl.level}</span>
          <span className="text-stone-400 tabular-nums">{lvl.into}/{lvl.need} XP to next level</span>
        </div>
        <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-400" style={{ width: `${(lvl.into / lvl.need) * 100}%` }} />
        </div>
      </div>

      {/* skills */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-7">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Skill progress</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SKILL_KEYS.map(k => (
            <ProgressBar key={k} value={profile.skills[k]} label={SKILL_META[k].label} icon={SKILL_META[k].icon} />
          ))}
        </div>
      </div>

      {/* curriculum + history */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Curriculum — {profile.level}</h2>
          <ol className="space-y-1.5 text-sm text-stone-600">
            {CURRICULUM[profile.level].map((u, i) => (
              <li key={u} className={`flex items-center gap-2 ${i === profile.unitIndex ? "text-violet-700 font-medium" : ""}`}>
                <span className="w-5 text-xs text-stone-400 tabular-nums">{i + 1}.</span>
                {u}
                {i === profile.unitIndex && <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full ml-1">current</span>}
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
              {profile.history.slice(-5).reverse().map((h, i) => (
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

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-lg font-bold text-stone-800 tabular-nums">{value}</div>
      <div className="text-[11px] text-stone-400">{label}</div>
    </div>
  );
}

function AchievementsView({ profile }) {
  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-8 max-w-3xl w-full mx-auto">
      <h1 className="text-xl font-bold text-stone-800 mb-1">Achievements</h1>
      <p className="text-sm text-stone-500 mb-6">{profile.achievements.length} of {ACHIEVEMENTS.length} unlocked</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(a => {
          const unlocked = profile.achievements.includes(a.id);
          return (
            <div key={a.id} className={`rounded-2xl border p-4 flex items-center gap-3 ${unlocked ? "bg-white border-stone-200" : "bg-stone-50 border-stone-100 opacity-60"}`}>
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

/* ------------------------------- Lesson view ----------------------------- */

function LessonView({ profile, started, messages, loading, error, input, setInput, send, startLesson, jumpTo, activePart, inputRef, bottomRef, finishLesson }) {
  if (!started) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-6">
        <div className="text-5xl">🦉</div>
        <div>
          <h2 className="text-xl font-bold text-stone-800 mb-1">Ready when you are{profile.name ? `, ${profile.name}` : ""}.</h2>
          <p className="text-sm text-stone-500">Vocabulary, reading, grammar, writing, speaking & pronunciation — one lesson at a time.</p>
        </div>
        <button onClick={startLesson} className="px-7 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-sm">
          🚀 Start lesson
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border-b border-stone-200 px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0">
        {LESSON_PARTS.map(p => (
          <button
            key={p.id}
            onClick={() => jumpTo(p.id)}
            className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-colors ${
              activePart === p.id ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white" : "bg-stone-50 text-stone-500 hover:bg-stone-100"
            }`}
          >
            {p.icon} {p.label}
          </button>
        ))}
        <button onClick={finishLesson} className="ml-1 whitespace-nowrap px-3 py-1.5 rounded-full text-[11.5px] font-medium bg-amber-100 text-amber-700">
          ✅ Finish lesson
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 py-4">
        <div className="max-w-2xl mx-auto">
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}
          {loading && (
            <div className="flex items-end gap-2 mb-3.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-500">🦉</div>
              <div className="bg-white rounded-2xl rounded-bl-md border border-stone-200"><TypingDots /></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-[13px] text-red-700 my-2">⚠️ {error}</div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="bg-white border-t border-stone-200 px-3.5 py-2.5 flex gap-2 items-end flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type your answer… (Enter to send)"
          disabled={loading}
          rows={1}
          className="flex-1 border-2 border-stone-200 rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none max-h-28 focus:border-violet-400 disabled:bg-stone-50"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0 ${
            loading || !input.trim() ? "bg-stone-300" : "bg-gradient-to-br from-indigo-500 to-violet-500"
          }`}
        >
          {loading ? "⏳" : "➤"}
        </button>
      </div>
    </>
  );
}
