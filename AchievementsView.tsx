export function ProgressBar({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
        <span className="flex items-center gap-1.5 font-medium text-stone-700">
          <span>{icon}</span>
          {label}
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
