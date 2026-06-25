import type { RefObject } from "react";
import { LESSON_PARTS } from "../constants";
import type { ChatMessage, Profile } from "../types";
import { Bubble } from "./Bubble";
import { TypingDots } from "./TypingDots";

export function LessonView({
  profile,
  started,
  messages,
  loading,
  error,
  input,
  setInput,
  send,
  startLesson,
  jumpTo,
  activePart,
  inputRef,
  bottomRef,
  finishLesson,
}: {
  profile: Profile;
  started: boolean;
  messages: ChatMessage[];
  loading: boolean;
  error: string;
  input: string;
  setInput: (value: string) => void;
  send: () => void;
  startLesson: () => void;
  jumpTo: (part: number) => void;
  activePart: number;
  inputRef: RefObject<HTMLTextAreaElement>;
  bottomRef: RefObject<HTMLDivElement>;
  finishLesson: () => void;
}) {
  if (!started) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-6">
        <div className="text-5xl">🦉</div>
        <div>
          <h2 className="text-xl font-bold text-stone-800 mb-1">
            Ready when you are{profile.name ? `, ${profile.name}` : ""}.
          </h2>
          <p className="text-sm text-stone-500">
            Vocabulary, reading, grammar, writing, speaking &amp; pronunciation — one lesson at a
            time.
          </p>
        </div>
        <button
          onClick={startLesson}
          className="px-7 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-sm"
        >
          🚀 Start lesson
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border-b border-stone-200 px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0">
        {LESSON_PARTS.map((p) => (
          <button
            key={p.id}
            onClick={() => jumpTo(p.id)}
            className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-colors ${
              activePart === p.id
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                : "bg-stone-50 text-stone-500 hover:bg-stone-100"
            }`}
          >
            {p.icon} {p.label}
          </button>
        ))}
        <button
          onClick={finishLesson}
          className="ml-1 whitespace-nowrap px-3 py-1.5 rounded-full text-[11.5px] font-medium bg-amber-100 text-amber-700"
        >
          ✅ Finish lesson
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 py-4">
        <div className="max-w-2xl mx-auto">
          {messages.map((m, i) => (
            <Bubble key={i} msg={m} />
          ))}
          {loading && (
            <div className="flex items-end gap-2 mb-3.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-500">
                🦉
              </div>
              <div className="bg-white rounded-2xl rounded-bl-md border border-stone-200">
                <TypingDots />
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-[13px] text-red-700 my-2">
              ⚠️ {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="bg-white border-t border-stone-200 px-3.5 py-2.5 flex gap-2 items-end flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
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
