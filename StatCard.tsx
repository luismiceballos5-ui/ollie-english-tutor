export function SidebarLink({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors ${
        active ? "bg-violet-50 text-violet-700" : "text-stone-600 hover:bg-stone-50"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}
