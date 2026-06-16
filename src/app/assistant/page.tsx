"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import {
  defaultConversationId,
  fetchChatHistory,
  sendChatMessage,
  type ChatMessage,
  type ChatContextPayload,
} from "@/lib/chatApi";
import { cn } from "@/lib/utils";

function formatMessageTime(createdAt: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(createdAt));
}

function getChatContext(): ChatContextPayload {
  return {
    locale: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    source: "assistant-page",
  };
}

export default function AssistantPage() {
  const [conversationId, setConversationId] = useState(defaultConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistant = useTranslations("assistant");

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setIsLoadingHistory(true);
      setError("");

      try {
        const history = await fetchChatHistory({ conversationId });
        if (cancelled) return;

        setConversationId(history.conversationId);
        setMessages(history.messages);
      } catch {
        if (!cancelled) setError(assistant.historyError);
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [assistant.historyError, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText || isSending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setText("");
    setIsSending(true);
    setError("");

    try {
      const response = await sendChatMessage({
        conversationId,
        clientMessageId: userMessage.id,
        message: messageText,
        context: getChatContext(),
      }, {
        fallbackResponse: assistant.response,
      });
      setConversationId(response.conversationId);
      setMessages((current) => [...current, response.message]);
    } catch {
      setError(assistant.sendError);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <AppShell title={assistant.title}>
      <section className="assistantShell flex h-[calc(100dvh-10.25rem)] min-h-0 flex-col gap-4 overflow-hidden">
        <div className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="assistantOrb grid size-12 shrink-0 place-items-center rounded-3xl bg-zinc-950 text-lg font-black text-white shadow-[0_18px_42px_-22px_rgba(24,24,27,0.9)] dark:bg-white dark:text-zinc-950">
              A
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{assistant.status}</p>
              <h2 className="text-xl font-black tracking-tight">{assistant.chatTitle}</h2>
            </div>
          </div>
        </div>

        <div className="assistantQuickScroll -mx-5 shrink-0 overflow-x-auto px-5 pb-5 pt-1 [scrollbar-gutter:stable]">
          <div className="flex w-max gap-2 pr-5">
            {assistant.quickActions.map((action) => (
              <Button
                key={action}
                variant="secondary"
                className="assistantSuggestion shrink-0 border-white/60 bg-white/55 text-zinc-800 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.75)] backdrop-blur-xl hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.07] dark:text-zinc-100 dark:hover:bg-white/[0.12]"
                onClick={() => setText(action)}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>

        <div className="assistantConversation min-h-0 flex-1 overflow-y-auto px-1 pb-8 pr-3 [scrollbar-gutter:stable]">
          <div className="grid gap-4 pb-8">
            {isLoadingHistory ? (
              <div className="assistantBubble assistantBubbleBot mx-auto max-w-sm rounded-[1.4rem] px-4 py-3 text-center">
                <p className="text-sm font-semibold">{assistant.loadingHistory}</p>
              </div>
            ) : null}

            {!isLoadingHistory && messages.length === 0 ? (
              <div className="assistantBubble assistantBubbleBot mx-auto max-w-sm rounded-[1.4rem] px-4 py-3 text-center">
                <p className="text-sm font-semibold">{assistant.emptyChat}</p>
              </div>
            ) : null}

            {error ? (
              <div className="mx-auto grid max-w-sm gap-3 rounded-[1.4rem] border border-red-400/20 bg-red-950/20 px-4 py-3 text-center text-red-100 shadow-[0_18px_46px_-34px_rgba(127,29,29,0.9)] backdrop-blur-xl">
                <p className="text-sm font-semibold">{error}</p>
                <Button variant="secondary" className="min-h-10 rounded-2xl" onClick={() => window.location.reload()}>
                  {assistant.retry}
                </Button>
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "assistantMessageRow relative z-10 flex items-end gap-2",
                  message.role === "user" ? "justify-end pl-8" : "justify-start pr-8",
                )}
                style={{ animationDelay: `${index * 55}ms` }}
              >
                {message.role === "assistant" ? (
                  <div className="mb-1 grid size-8 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-[11px] font-black text-white shadow-[0_12px_30px_-22px_rgba(0,0,0,0.75)] dark:bg-white/90 dark:text-zinc-950">
                    A
                  </div>
                ) : null}
                <div
                  className={cn(
                    "assistantBubble max-w-[82%] rounded-[1.4rem] px-4 py-3",
                    message.role === "user" ? "assistantBubbleUser rounded-br-md" : "assistantBubbleBot rounded-bl-md",
                  )}
                >
                  <p className="text-sm leading-6">{message.content}</p>
                  <p className="mt-2 text-[11px] font-semibold opacity-55">{formatMessageTime(message.createdAt)}</p>
                </div>
                {message.role === "user" ? (
                  <div className="mb-1 grid size-8 shrink-0 place-items-center rounded-2xl bg-white/65 text-[11px] font-black text-zinc-800 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.9)] ring-1 ring-white/60 backdrop-blur-xl dark:bg-white/[0.08] dark:text-white dark:ring-white/10">
                    ME
                  </div>
                ) : null}
              </div>
            ))}

            {isSending ? (
              <div
                className="assistantTyping relative z-10 ml-10 flex w-fit items-center gap-1 rounded-full border border-white/60 bg-white/45 px-4 py-2 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.75)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]"
                aria-label={assistant.typing}
              >
                <span className="size-1.5 rounded-full bg-zinc-500 dark:bg-zinc-300" />
                <span className="size-1.5 rounded-full bg-zinc-500 dark:bg-zinc-300" />
                <span className="size-1.5 rounded-full bg-zinc-500 dark:bg-zinc-300" />
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form
          onSubmit={sendMessage}
          className="assistantComposer sticky bottom-0 grid shrink-0 grid-cols-[1fr_auto] gap-2 rounded-[1.6rem] border border-white/18 bg-zinc-900/48 p-2 shadow-[0_20px_60px_-34px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
        >
          <Input
            ref={inputRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={assistant.placeholder}
            className="border-white/10 bg-white/[0.045] text-zinc-100 shadow-none placeholder:text-zinc-500 focus:border-white/20 focus:ring-4 focus:ring-white/5 dark:border-white/10 dark:bg-white/[0.045] dark:focus:ring-white/5"
          />
          <Button type="submit" disabled={isSending} className="rounded-[1.2rem] px-4">
            {isSending ? assistant.sending : assistant.send}
          </Button>
        </form>
      </section>
    </AppShell>
  );
}
