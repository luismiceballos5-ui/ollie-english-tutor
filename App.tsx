export function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3.5 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400 animate-ollieBounce"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}
