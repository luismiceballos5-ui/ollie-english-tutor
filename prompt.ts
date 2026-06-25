import type { Achievement, CefrLevel, LessonPart, SkillKey } from "./types";

export const SKILL_KEYS: SkillKey[] = [
  "vocabulary",
  "reading",
  "grammar",
  "writing",
  "speaking",
  "pronunciation",
];

export const SKILL_META: Record<SkillKey, { label: string; icon: string }> = {
  vocabulary: { label: "Vocabulary", icon: "📚" },
  reading: { label: "Reading", icon: "📖" },
  grammar: { label: "Grammar", icon: "✏️" },
  writing: { label: "Writing", icon: "📝" },
  speaking: { label: "Speaking", icon: "💬" },
  pronunciation: { label: "Pronunciation", icon: "🗣️" },
};

export const LESSON_PARTS: LessonPart[] = [
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

export const CURRICULUM: Record<CefrLevel, string[]> = {
  A1: [
    "Greetings",
    "Alphabet",
    "Numbers",
    "Colors",
    "Family",
    "School",
    "Food",
    "Animals",
    "To Be",
    "Present Simple",
    "Daily Routines",
  ],
  A2: [
    "Travel",
    "Shopping",
    "Past Simple",
    "Present Continuous",
    "Future",
    "Comparatives",
    "Prepositions",
    "Modal Verbs",
  ],
  B1: [
    "Opinion Writing",
    "Debates",
    "Storytelling",
    "Emails",
    "Problem Solving",
    "Reading Analysis",
    "Conversation",
  ],
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_lesson",
    label: "First Step",
    icon: "🌱",
    desc: "Completed your first lesson",
    test: (s) => s.lessonsCompleted >= 1,
  },
  {
    id: "streak_3",
    label: "On a Roll",
    icon: "🔥",
    desc: "3-day streak",
    test: (s) => s.streak >= 3,
  },
  {
    id: "streak_7",
    label: "Week Warrior",
    icon: "⚡",
    desc: "7-day streak",
    test: (s) => s.streak >= 7,
  },
  {
    id: "xp_100",
    label: "Rising Star",
    icon: "⭐",
    desc: "Earned 100 XP",
    test: (s) => s.xp >= 100,
  },
  {
    id: "xp_500",
    label: "English Explorer",
    icon: "🧭",
    desc: "Earned 500 XP",
    test: (s) => s.xp >= 500,
  },
  {
    id: "vocab_50",
    label: "Word Collector",
    icon: "🪙",
    desc: "50 vocabulary points",
    test: (s) => s.skills.vocabulary >= 50,
  },
  {
    id: "lessons_10",
    label: "Dedicated Student",
    icon: "🎓",
    desc: "10 lessons completed",
    test: (s) => s.lessonsCompleted >= 10,
  },
];

export const STORAGE_KEY = "ollie:profile";
