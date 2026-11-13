"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { useStudioData } from "@/components/studio/StudioData";
import { PREVIEW_QUESTIONS, previewLimitMessage } from "@/lib/premium";

type Message = { role: "user" | "assistant"; content: string };

export function DigitalTwin({
  open: openProp,
  onOpenChange,
  launcher = true,
}: {
  // Pass `open` + `onOpenChange` to control the panel from outside (the 3D studio).
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  launcher?: boolean;
} = {}) {
  const { profile, slug, twin, preview } = useStudioData();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => {
    const value = typeof next === "function" ? next(open) : next;
    if (onOpenChange) onOpenChange(value);
    else setOpenState(value);
  };
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: profile.twin.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Let any element in the page with [data-open-twin] open the chat.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-open-twin]")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOpenChange]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");

    // In the editor's preview the twin answers a couple of questions as a trial.
    if (twin === "preview" && (!preview || next.filter((m) => m.role === "user").length > PREVIEW_QUESTIONS)) {
      setMessages([...next, { role: "assistant", content: previewLimitMessage }]);
      return;
    }
    setLoading(true);

    // Only the real conversation (skip the canned greeting) goes to the twin.
    const history = next.filter((m, i) => !(i === 0 && m.role === "assistant"));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(twin === "preview" && preview ? { Authorization: `Bearer ${await preview.token()}` } : {}),
        },
        body: JSON.stringify(
          twin === "preview" && preview
            ? { preview: { name: profile.name, knowledge: preview.knowledge }, messages: history }
            : { slug, messages: history },
        ),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        setMessages((m) => [
          ...m,
          { role: "assistant", content: errText || "Something went wrong." },
        ]);
        setLoading(false);
        return;
      }

      // Stream the reply into a growing assistant message.
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (twin === "off") return null;

  return (
    <>
      {launcher && (
        <button
          type="button"
          className="chat-fab"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open the digital twin chat"
        >
          <span className="pulse" /> Ask my Digital Twin
        </button>
      )}

      <div
        className={`chat-panel ${open ? "open" : ""}`}
        role="dialog"
        aria-label="Digital twin chat"
      >
        <div className="chat-header">
          <div className="mini-avatar">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={38}
                height={38}
                className="avatar-photo"
              />
            ) : (
              profile.initials
            )}
          </div>
          <div>
            <h4>{profile.name}&apos;s Twin</h4>
            <p>● Online · AI assistant</p>
          </div>
          <button
            className="chat-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === "assistant" ? (
                <div className="md">
                  <ReactMarkdown
                    components={{
                      a: ({ ...props }) => (
                        <a target="_blank" rel="noopener noreferrer" {...props} />
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          ))}
          {loading && <div className="msg assistant">…</div>}
        </div>

        {messages.length <= 1 && (
          <div className="suggestions">
            {profile.twin.suggestions.map((s) => (
              <button key={s} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            type="text"
            value={input}
            placeholder="Type your question..."
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? "…" : "Send"}
          </button>
        </form>
      </div>
    </>
  );
}
