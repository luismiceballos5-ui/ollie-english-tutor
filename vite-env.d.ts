import type { ToastState } from "../types";

export function AchievementToast({ toast }: { toast: ToastState }) {
  return (
    <div className="fixed bottom-5 right-5 bg-white border border-stone-200 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 z-40 animate-ollieIn">
      <span className="text-2xl">{toast.icon}</span>
      <div>
        <div className="text-[11px] text-stone-400 uppercase tracking-wide">
          Achievement unlocked
        </div>
        <div className="text-sm font-semibold text-stone-800">{toast.label}</div>
      </div>
    </div>
  );
}
