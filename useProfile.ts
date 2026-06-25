export function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-lg font-bold text-stone-800 tabular-nums">{value}</div>
      <div className="text-[11px] text-stone-400">{label}</div>
    </div>
  );
}
