"use client";

import Image from "next/image";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import alfredAvatar from "../../../alfred.png";
import { AppShell } from "@/components/app/AppShell";
import { PageInfoButton } from "@/components/app/PageInfoButton";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";
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
  const conversationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const assistant = useTranslations("assistant");

  function scrollConversationToBottom(behavior: ScrollBehavior = "smooth") {
    const conversation = conversationRef.current;
    if (!conversation) return;

    conversation.scrollTo({
      top: conversation.scrollHeight,
      behavior,
    });
  }

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
    scrollConversationToBottom();
    const firstFrame = window.requestAnimationFrame(() => scrollConversationToBottom());
    const secondFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => scrollConversationToBottom());
    });
    const settleTimer = window.setTimeout(() => scrollConversationToBottom(), 180);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(settleTimer);
    };
  }, [messages, isSending]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let restingHeight = viewport.height;

    function syncVisualViewport() {
      if (!viewport) return;
      const composerHasFocus = document.activeElement === inputRef.current;

      if (!composerHasFocus) restingHeight = Math.max(restingHeight, viewport.height);

      const keyboardIsVisible = composerHasFocus && restingHeight - viewport.height > 120;
      document.documentElement.style.setProperty("--assistant-visual-height", `${viewport.height}px`);
      setIsKeyboardOpen(keyboardIsVisible);

      if (keyboardIsVisible) {
        window.requestAnimationFrame(() => scrollConversationToBottom("auto"));
      }
    }

    syncVisualViewport();
    viewport.addEventListener("resize", syncVisualViewport);
    viewport.addEventListener("scroll", syncVisualViewport);

    return () => {
      viewport.removeEventListener("resize", syncVisualViewport);
      viewport.removeEventListener("scroll", syncVisualViewport);
      document.documentElement.style.removeProperty("--assistant-visual-height");
    };
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.style.height = "0px";
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
  }, [text]);

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

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
    window.requestAnimationFrame(() => scrollConversationToBottom());

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
    <AppShell title={assistant.title} showTitle={false} mainClassName="assistantMain">
      <section
        className="assistantShell flex h-full min-h-0 flex-col overflow-hidden lg:h-[calc(100dvh-5rem)]"
        data-keyboard-open={isKeyboardOpen}
      >
        <header className="relative flex shrink-0 items-center justify-between gap-3 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={alfredAvatar}
              alt=""
              priority
              className="size-11 shrink-0 rounded-2xl border border-[var(--border-medium)] object-cover shadow-[0_14px_34px_-22px_rgba(24,24,27,0.9)] sm:size-12"
              sizes="(max-width: 640px) 44px, 48px"
            />
            <div className="min-w-0">
              <p className="label-micro assistantOnlineStatus">{assistant.status}</p>
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="display-title metallicPageTitle truncate text-[2.35rem] leading-none sm:text-5xl">{assistant.title}</h2>
                <PageInfoButton page="assistant" className="size-8 sm:size-9" />
              </div>
            </div>
          </div>
          <span className="developmentBadge max-w-[9rem] shrink-0 truncate rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.07em] lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            {assistant.developmentLabel}
          </span>
        </header>

        <div className="assistantQuickScroll -mx-5 shrink-0 overflow-x-auto px-5 pb-3 pt-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex w-max gap-2 lg:flex-wrap">
            {assistant.quickActions.map((action) => (
              <Button
                key={action}
                variant="secondary"
                className="assistantSuggestion min-h-9 shrink-0 rounded-full border-[var(--border-medium)] bg-[var(--surface-standard)] px-4 text-xs text-[var(--text-secondary)] shadow-none backdrop-blur-xl hover:bg-[var(--surface-focus)] hover:text-[var(--text-primary)]"
                onClick={() => setText(action)}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>

        <div ref={conversationRef} className="assistantConversation min-h-0 flex-1 overflow-y-auto overscroll-contain px-0.5 py-2 pr-1 sm:pr-2">
          <div className="grid gap-3 pb-3 sm:gap-4">
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
              <div className="mx-auto grid max-w-sm gap-3 rounded-[1.4rem] border border-[var(--border-medium)] bg-[var(--surface-standard)] px-4 py-3 text-center text-[var(--text-primary)] shadow-soft backdrop-blur-xl">
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
                  message.role === "user" ? "justify-end pl-10" : "justify-start pr-5 sm:pr-8",
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
                    "assistantBubble max-w-[88%] rounded-[1.35rem] px-4 py-3 sm:max-w-[78%]",
                    message.role === "user" ? "assistantBubbleUser rounded-br-md" : "assistantBubbleBot rounded-bl-md",
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                  <p className="mt-2 text-[11px] font-semibold opacity-55">{formatMessageTime(message.createdAt)}</p>
                </div>
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
          autoComplete="off"
          className="assistantComposer mt-2 flex shrink-0 items-end gap-2 rounded-[1.55rem] border border-[var(--border-medium)] bg-[var(--surface-focus)] p-1.5 pl-4 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
        >
          <textarea
            ref={inputRef}
            name="alfred-message"
            rows={1}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            onFocus={() => window.requestAnimationFrame(() => scrollConversationToBottom("auto"))}
            placeholder={assistant.placeholder}
            autoComplete="off"
            autoCorrect="on"
            autoCapitalize="sentences"
            enterKeyHint="send"
            inputMode="text"
            spellCheck
            aria-label={assistant.placeholder}
            className="assistantComposerInput max-h-28 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent py-3 text-base leading-5 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
          />
          <Button
            type="submit"
            disabled={isSending || !text.trim()}
            aria-label={isSending ? assistant.sending : assistant.send}
            title={isSending ? assistant.sending : assistant.send}
            className="assistantSendButton grid size-11 min-h-11 shrink-0 place-items-center rounded-full p-0"
          >
            {isSending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-black/25 border-t-black" aria-hidden="true" />
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13m-5-5 5 5-5 5" />
              </svg>
            )}
          </Button>
        </form>
      </section>
    </AppShell>
  );
}
