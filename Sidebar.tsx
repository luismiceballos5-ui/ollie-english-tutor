import type { ChatMessage } from "../types";

export function Bubble({ msg }: { msg: ChatMessage }) {
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
