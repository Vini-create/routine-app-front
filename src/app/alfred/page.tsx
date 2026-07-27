"use client";

import Image from "next/image";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import alfredAvatar from "../../../alfred.png";
import { AppShell } from "@/components/app/AppShell";
import { PageInfoButton } from "@/components/app/PageInfoButton";
import { useLanguage, useTranslations } from "@/components/app/LanguageProvider";
import { ApiError } from "@/lib/api";
import { designPreviewEnabled } from "@/lib/designPreview";
import { cn } from "@/lib/utils";
import { alfredApi } from "@/features/alfred/api/alfredApi";
import { createTurnPayload } from "@/features/alfred/api/createTurnPayload";
import { AlfredStreamError, joinStreamText } from "@/features/alfred/api/sse";
import {
  previewCapabilities,
  previewConversations,
  previewMessages,
  previewReply,
  previewUsage,
} from "@/features/alfred/designPreview";
import type {
  AICapabilitiesResponse,
  AIConversationSummary,
  AIErrorResponse,
  AIInvokeRequest,
  AIMessage,
  AIUsageResponse,
  AlfredStreamDone,
  AlfredStreamPatch,
  AnalysisReport,
  EvidenceReference,
  SelectedSkill,
  PatchStatus,
  ProposedPatch,
} from "@/features/alfred/api/alfred.types";
import type { AlfredUiMessage } from "@/features/alfred/alfred.ui.types";
import { AnalysisReportCard } from "@/features/alfred/components/AnalysisReportCard";
import { EvidenceReferences } from "@/features/alfred/components/EvidenceReferences";
import { PatchConfirmationCard } from "@/features/alfred/components/PatchConfirmationCard";
import { SkillMenu, type SkillOption } from "@/features/alfred/components/SkillMenu";
import { UsageIndicator } from "@/features/alfred/components/UsageIndicator";

type FailedTurn = {
  payload: AIInvokeRequest;
  assistantMessageId: string;
};

function formatMessageTime(createdAt: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(createdAt));
}

function normalizeFailure(error: unknown): { code: string | null; message: string } {
  if (error instanceof AlfredStreamError) {
    return { code: error.payload.code, message: error.payload.message };
  }
  if (error instanceof ApiError) {
    return { code: error.code, message: error.message };
  }
  return { code: null, message: error instanceof Error ? error.message : "" };
}

function isQuotaCode(code: string | null) {
  return Boolean(code && (
    code.includes("quota")
    || code.includes("_limit_exceeded")
    || code === "rate_limit_exceeded"
    || code === "concurrent_stream_limit_exceeded"
  ));
}

type AlfredQuotaMessages = {
  quotaExceeded: string;
  standardQuotaExceeded: string;
  ragQuotaExceeded: string;
  deepAnalysisQuotaExceeded: string;
  rateLimited: string;
  streamAlreadyActive: string;
};

function quotaMessage(code: string | null, assistant: AlfredQuotaMessages) {
  switch (code) {
    case "daily_standard_limit_exceeded":
      return assistant.standardQuotaExceeded;
    case "daily_rag_limit_exceeded":
      return assistant.ragQuotaExceeded;
    case "weekly_deep_analysis_limit_exceeded":
      return assistant.deepAnalysisQuotaExceeded;
    case "rate_limit_exceeded":
      return assistant.rateLimited;
    case "concurrent_stream_limit_exceeded":
      return assistant.streamAlreadyActive;
    default:
      return assistant.quotaExceeded;
  }
}

function toUiMessages(messages: AIMessage[]): AlfredUiMessage[] {
  return messages
    .filter((message) => message.role !== "system")
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
    .map((message) => {
      return {
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.created_at,
        status: "completed" as const,
        requestId: message.request_id,
        route: message.route,
        ...(message.role === "assistant" ? {
          analysis: message.analysis,
          references: message.references ?? [],
          proposedPatch: message.proposed_patch,
          requiresConfirmation: message.requires_confirmation ?? false,
          patchStatus: message.patch_status ?? undefined,
        } : {}),
      };
    });
}

export default function AssistantPage() {
  const assistant = useTranslations("assistant");
  const { language } = useLanguage();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AIConversationSummary[]>([]);
  const [messages, setMessages] = useState<AlfredUiMessage[]>([]);
  const [text, setText] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<SelectedSkill>("auto");
  const [capabilities, setCapabilities] = useState<AICapabilitiesResponse | null>(null);
  const [usage, setUsage] = useState<AIUsageResponse | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [error, setError] = useState("");
  const [failedTurn, setFailedTurn] = useState<FailedTurn | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const conversationsCloseRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const skillOptions = useMemo<SkillOption[]>(() => [
    { value: "auto", ...assistant.skills.auto },
    { value: "conversar", ...assistant.skills.conversar },
    { value: "analisar_progresso", ...assistant.skills.analisar_progresso },
    { value: "reorganizar_rotina", ...assistant.skills.reorganizar_rotina },
    { value: "criar_plano", ...assistant.skills.criar_plano },
    { value: "consultar_conhecimento", ...assistant.skills.consultar_conhecimento },
  ], [assistant.skills]);

  function scrollConversationToBottom(behavior: ScrollBehavior = "smooth") {
    const conversation = conversationRef.current;
    if (!conversation) return;
    conversation.scrollTo({ top: conversation.scrollHeight, behavior });
  }

  function replaceMessage(id: string, update: Partial<AlfredUiMessage>) {
    setMessages((current) => current.map((message) => message.id === id ? { ...message, ...update } : message));
  }

  async function refreshUsage() {
    if (designPreviewEnabled) {
      setUsage(previewUsage);
      setIsLoadingUsage(false);
      return;
    }
    try {
      setUsage(await alfredApi.usage());
    } catch {
      // Usage is supplementary and must not block the conversation.
    } finally {
      setIsLoadingUsage(false);
    }
  }

  async function refreshConversations() {
    if (designPreviewEnabled) {
      setConversations(previewConversations);
      return;
    }
    try {
      const list = await alfredApi.listConversations();
      setConversations([...list].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)));
    } catch {
      // The current conversation remains usable if only the list fails.
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (designPreviewEnabled) {
        setCapabilities(previewCapabilities);
        setUsage(previewUsage);
        setConversations(previewConversations);
        setConversationId(previewConversations[0].id);
        setMessages(previewMessages);
        setIsLoadingUsage(false);
        setIsLoadingHistory(false);
        return;
      }

      const [capabilitiesResult, usageResult, conversationsResult] = await Promise.allSettled([
        alfredApi.capabilities(),
        alfredApi.usage(),
        alfredApi.listConversations(),
      ]);
      if (cancelled) return;

      if (capabilitiesResult.status === "fulfilled") setCapabilities(capabilitiesResult.value);
      if (usageResult.status === "fulfilled") setUsage(usageResult.value);
      setIsLoadingUsage(false);

      if (conversationsResult.status === "rejected") {
        setError(assistant.historyError);
        setIsLoadingHistory(false);
        return;
      }

      const ordered = [...conversationsResult.value].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
      setConversations(ordered);
      if (!ordered[0]) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const detail = await alfredApi.getConversation(ordered[0].id);
        if (cancelled) return;
        setConversationId(detail.id);
        setMessages(toUiMessages(detail.messages));
      } catch {
        if (!cancelled) setError(assistant.conversationError);
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    void initialize();
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [assistant.conversationError, assistant.historyError]);

  useEffect(() => {
    scrollConversationToBottom();
    const frame = window.requestAnimationFrame(() => scrollConversationToBottom());
    return () => window.cancelAnimationFrame(frame);
  }, [messages, isSending]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (!showConversations) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    conversationsCloseRef.current?.focus();
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setShowConversations(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showConversations]);

  useEffect(() => {
    const viewportCandidate = window.visualViewport;
    if (!viewportCandidate) return;
    const visualViewport: VisualViewport = viewportCandidate;
    let restingHeight = visualViewport.height;
    function syncViewport() {
      const composerHasFocus = document.activeElement === inputRef.current;
      if (!composerHasFocus) restingHeight = Math.max(restingHeight, visualViewport.height);
      const keyboardVisible = composerHasFocus && restingHeight - visualViewport.height > 120;
      setIsKeyboardOpen(keyboardVisible);
      if (keyboardVisible) window.requestAnimationFrame(() => scrollConversationToBottom("auto"));
    }
    visualViewport.addEventListener("resize", syncViewport);
    visualViewport.addEventListener("scroll", syncViewport);
    return () => {
      visualViewport.removeEventListener("resize", syncViewport);
      visualViewport.removeEventListener("scroll", syncViewport);
    };
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "0px";
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
  }, [text]);

  async function openConversation(id: string) {
    if (designPreviewEnabled) {
      setConversationId(id);
      setMessages(previewMessages);
      setShowConversations(false);
      return;
    }
    if (id === conversationId || isSending) {
      setShowConversations(false);
      return;
    }
    abortRef.current?.abort();
    setIsLoadingHistory(true);
    setError("");
    setMessages([]);
    setFailedTurn(null);
    try {
      const detail = await alfredApi.getConversation(id);
      setConversationId(detail.id);
      setMessages(toUiMessages(detail.messages));
      setShowConversations(false);
    } catch {
      setError(assistant.conversationError);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function createConversation() {
    if (isCreatingConversation || isSending) return;
    if (designPreviewEnabled) {
      const now = new Date().toISOString();
      const conversation = {
        id: crypto.randomUUID(),
        title: assistant.newConversation,
        summary_en: null,
        created_at: now,
        updated_at: now,
      };
      setConversations((current) => [conversation, ...current]);
      setConversationId(conversation.id);
      setMessages([]);
      setFailedTurn(null);
      setShowConversations(false);
      setIsLoadingHistory(false);
      inputRef.current?.focus();
      return;
    }
    setIsCreatingConversation(true);
    setError("");
    try {
      const conversation = await alfredApi.createConversation(assistant.newConversation);
      setConversations((current) => [conversation, ...current]);
      setConversationId(conversation.id);
      setMessages([]);
      setFailedTurn(null);
      setShowConversations(false);
      inputRef.current?.focus();
    } catch {
      setError(assistant.conversationError);
    } finally {
      setIsCreatingConversation(false);
      setIsLoadingHistory(false);
    }
  }

  async function deleteConversation(id: string) {
    if (isSending || !window.confirm(assistant.deleteConversationConfirm)) return;
    if (designPreviewEnabled) {
      const remaining = conversations.filter((conversation) => conversation.id !== id);
      setConversations(remaining);
      if (conversationId === id) {
        setConversationId(remaining[0]?.id ?? null);
        setMessages(remaining[0] ? previewMessages : []);
      }
      return;
    }
    try {
      await alfredApi.deleteConversation(id);
      const remaining = conversations.filter((conversation) => conversation.id !== id);
      setConversations(remaining);
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
        setFailedTurn(null);
        if (remaining[0]) await openConversation(remaining[0].id);
      }
    } catch {
      setError(assistant.conversationError);
    }
  }

  async function runTurn(payload: AIInvokeRequest, assistantMessageId: string) {
    if (designPreviewEnabled) {
      setIsSending(true);
      setError("");
      replaceMessage(assistantMessageId, { status: "sending", content: "" });
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      replaceMessage(assistantMessageId, {
        ...previewReply(payload.message),
        status: "completed",
        requestId: crypto.randomUUID(),
      });
      setIsSending(false);
      inputRef.current?.focus();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsSending(true);
    setError("");
    setFailedTurn(null);
    replaceMessage(assistantMessageId, { status: "sending", content: "", references: [], analysis: null, proposedPatch: null });

    try {
      let completedConversationId: string | null = null;
      let completedRequestId: string | null = null;
      if (capabilities?.capabilities.streaming !== false) {
        let receivedDone = false;
        let receivedText = "";
        await alfredApi.stream(payload, (event, data) => {
          if (event === "status") {
            replaceMessage(assistantMessageId, { status: "streaming" });
          } else if (event === "reference") {
            const reference = data as EvidenceReference;
            setMessages((current) => current.map((message) => message.id === assistantMessageId
              ? { ...message, status: "streaming", references: [...(message.references ?? []), reference] }
              : message));
          } else if (event === "analysis") {
            const analysis = data as AnalysisReport;
            replaceMessage(assistantMessageId, { analysis, status: "streaming" });
          } else if (event === "patch") {
            const patchEvent = data as AlfredStreamPatch;
            replaceMessage(assistantMessageId, {
              proposedPatch: patchEvent.patch,
              requiresConfirmation: patchEvent.requires_confirmation,
              patchStatus: "pending",
              status: "streaming",
            });
          } else if (event === "token") {
            const chunk = data as { content: string };
            receivedText = joinStreamText(receivedText, chunk.content);
            setMessages((current) => current.map((message) => message.id === assistantMessageId
              ? { ...message, content: receivedText, status: "streaming" }
              : message));
          } else if (event === "done") {
            const done = data as AlfredStreamDone;
            receivedDone = true;
            completedConversationId = done.conversation_id;
            completedRequestId = done.request_id;
            setConversationId(done.conversation_id);
            replaceMessage(assistantMessageId, {
              requestId: done.request_id,
              route: done.route,
              status: "completed",
            });
          }
        }, controller.signal);
        if (!receivedDone) {
          const incomplete: AIErrorResponse = {
            request_id: null,
            code: "graph_execution_failed",
            message: assistant.sendError,
            details: {},
          };
          throw new AlfredStreamError(incomplete);
        }
        if (!receivedText.trim()) {
          const emptyResponse: AIErrorResponse = {
            request_id: completedRequestId,
            code: "graph_execution_failed",
            message: assistant.sendError,
            details: {},
          };
          throw new AlfredStreamError(emptyResponse);
        }
      } else {
        const response = await alfredApi.invoke(payload, controller.signal);
        completedConversationId = response.conversation_id;
        completedRequestId = response.request_id;
        setConversationId(response.conversation_id);
        replaceMessage(assistantMessageId, {
          content: response.message,
          status: "completed",
          requestId: response.request_id,
          route: response.route,
          references: response.references,
          analysis: response.analysis,
          proposedPatch: response.proposed_patch,
          requiresConfirmation: response.requires_confirmation,
          ...(response.requires_confirmation ? { patchStatus: "pending" as const } : {}),
        });
      }

      if (completedConversationId && completedRequestId) {
        try {
          const detail = await alfredApi.getConversation(completedConversationId);
          const canonicalMessages = toUiMessages(detail.messages);
          const persistedResponse = canonicalMessages.find(
            (message) => message.role === "assistant"
              && message.requestId === completedRequestId,
          );
          if (persistedResponse?.content.trim()) {
            setMessages(canonicalMessages);
          }
        } catch {
          // The completed response remains usable if only reconciliation fails.
        }
      }
      await Promise.all([refreshUsage(), refreshConversations()]);
    } catch (caught) {
      if (controller.signal.aborted) {
        replaceMessage(assistantMessageId, { status: "cancelled" });
        return;
      }
      const failure = normalizeFailure(caught);
      const message = failure.code === "idempotency_key_reused"
        ? assistant.sendError
        : failure.code === "plan_unavailable"
        ? assistant.planUnavailable
        : isQuotaCode(failure.code)
          ? quotaMessage(failure.code, assistant)
          : failure.code === "model_unavailable" || failure.code === "global_cost_limit_exceeded"
            ? assistant.serviceUnavailable
            : failure.message || assistant.sendError;
      replaceMessage(assistantMessageId, { status: "failed", content: message });
      setError(message);
      setFailedTurn({ payload, assistantMessageId });
      if (isQuotaCode(failure.code)) void refreshUsage();
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText || isSending || capabilities?.capabilities.conversation === false) return;

    const now = new Date().toISOString();
    const userMessage: AlfredUiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      createdAt: now,
      status: "completed",
      selectedSkill,
    };
    const assistantMessage: AlfredUiMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: now,
      status: "sending",
    };
    const payload = createTurnPayload({
      conversationId,
      message: messageText,
      selectedSkill,
    });

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setText("");
    void runTurn(payload, assistantMessage.id);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  function stopStreaming() {
    abortRef.current?.abort();
  }

  function updatePatchMessage(
    message: AlfredUiMessage,
    patch: ProposedPatch,
    status: PatchStatus,
    requiresConfirmation: boolean,
  ) {
    replaceMessage(message.id, {
      proposedPatch: patch,
      requiresConfirmation,
      patchStatus: status,
    });
  }

  const conversationsModal = showConversations && typeof document !== "undefined"
    ? createPortal(
      <div
        className="fixed inset-0 z-[130] grid place-items-center bg-black/60 p-3 backdrop-blur-md sm:p-6"
        role="presentation"
        onPointerDown={() => setShowConversations(false)}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="alfred-conversations-title"
          onPointerDown={(event) => event.stopPropagation()}
          className="alfredModalSurface flex max-h-[min(42rem,calc(100dvh-1.5rem))] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border-medium)]"
        >
          <header className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4">
            <div className="min-w-0">
              <p className="label-micro">Alfred</p>
              <h2 id="alfred-conversations-title" className="mt-1 font-display text-2xl font-light uppercase leading-none text-[var(--text-primary)]">
                {assistant.conversations}
              </h2>
            </div>
            <button
              ref={conversationsCloseRef}
              type="button"
              onClick={() => setShowConversations(false)}
              aria-label={`${assistant.closeSkillMenu}: ${assistant.conversations}`}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
            <button type="button" disabled={isCreatingConversation || isSending} onClick={() => void createConversation()} className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[1rem] bg-[var(--text-primary)] px-4 text-sm font-extrabold text-[var(--background-primary)] disabled:opacity-50">
              <span className="text-xl font-light" aria-hidden="true">+</span>{assistant.newConversation}
            </button>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {conversations.length ? conversations.map((conversation) => (
                <div key={conversation.id} className={cn("group grid grid-cols-[1fr_2.75rem] items-center rounded-[1rem] border border-transparent", conversation.id === conversationId && "border-[var(--border-soft)] bg-[var(--surface-focus)]")}>
                  <button type="button" disabled={isSending} onClick={() => void openConversation(conversation.id)} className="min-w-0 px-3 py-3 text-left disabled:opacity-50">
                    <span className="block truncate text-sm font-bold text-[var(--text-primary)]">{conversation.title}</span>
                    <span className="mt-1 block text-[10px] text-[var(--text-tertiary)]">{new Date(conversation.updated_at).toLocaleDateString(language)}</span>
                  </button>
                  <button type="button" disabled={isSending} onClick={() => void deleteConversation(conversation.id)} aria-label={assistant.deleteConversation} className="grid size-9 place-items-center rounded-full text-[var(--text-tertiary)] transition hover:bg-[var(--surface-ambient)] hover:text-[var(--text-primary)]">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" /></svg>
                  </button>
                </div>
              )) : <p className="px-3 py-8 text-center text-xs leading-5 text-[var(--text-tertiary)]">{assistant.noConversations}</p>}
            </div>
          </div>
        </section>
      </div>,
      document.body,
    )
    : null;

  return (
    <AppShell title={assistant.title} showTitle={false} showBottomNavigation={false} infoPage="assistant" mainClassName="assistantMain">
      <section className="assistantShell flex h-full min-h-0 flex-col overflow-hidden lg:h-[calc(100dvh-5rem)]" data-keyboard-open={isKeyboardOpen}>
        <header className="relative flex shrink-0 flex-wrap items-center gap-3 pb-3">
          <div className="flex min-w-[10rem] flex-1 items-center gap-3">
            <Image src={alfredAvatar} alt="" priority className="size-11 shrink-0 rounded-2xl border border-[var(--border-medium)] object-cover shadow-[0_14px_34px_-22px_rgba(24,24,27,.9)] sm:size-12" sizes="(max-width:640px) 44px, 48px" />
            <div>
              <p className="label-micro assistantOnlineStatus">{assistant.status}</p>
              <div className="hidden items-center gap-2 lg:flex">
                <h2 className="display-title metallicPageTitle whitespace-nowrap text-[2.35rem] leading-none sm:text-5xl">{assistant.title}</h2>
                <PageInfoButton page="assistant" className="size-8 sm:size-9" />
              </div>
            </div>
          </div>
          <UsageIndicator usage={usage} loading={isLoadingUsage} label={assistant.usageLabel} unlimitedLabel={assistant.unlimited} />
          <button type="button" onClick={() => setShowConversations((current) => !current)} className="grid size-10 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]" aria-label={assistant.conversations} aria-expanded={showConversations}>
            <svg viewBox="0 0 24 24" className="size-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.5 16.5a6.4 6.4 0 0 1-2.35-.44L3.5 17.5l1.22-3.12A6.5 6.5 0 1 1 9.5 16.5Z" />
              <path d="M10.6 18.42a6.52 6.52 0 0 0 6.25-.36l3.65 1.44-1.22-3.12a6.5 6.5 0 0 0-3.53-9.04" />
            </svg>
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div data-tour="assistant-suggestions" className="assistantQuickScroll hidden shrink-0 overflow-x-auto lg:block lg:pb-3 lg:pt-1">
              <div className="flex w-max gap-2 lg:flex-wrap">
                {assistant.quickActions.map((action) => (
                  <button key={action} type="button" onClick={() => setText(action)} className="assistantSuggestion min-h-9 shrink-0 rounded-full border border-[var(--border-medium)] bg-[var(--surface-standard)] px-4 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-focus)] hover:text-[var(--text-primary)]">{action}</button>
                ))}
              </div>
            </div>

            <div ref={conversationRef} data-tour="assistant-conversation" className="assistantConversation min-h-0 flex-1 overflow-y-auto overscroll-contain px-0.5 py-2 pr-1 sm:pr-2">
              <div className="grid gap-3 pb-3 sm:gap-4">
                {isLoadingHistory ? <div className="assistantBubble assistantBubbleBot mx-auto rounded-[1.4rem] px-4 py-3"><p className="text-sm font-semibold">{assistant.loadingHistory}</p></div> : null}
                {!isLoadingHistory && messages.length === 0 ? <div className="mx-auto grid max-w-sm justify-items-center gap-3 px-5 py-10 text-center"><div className="grid size-14 place-items-center rounded-[1.3rem] bg-zinc-950 text-lg font-black text-white dark:bg-white/90 dark:text-zinc-950">A</div><p className="text-sm font-semibold leading-6 text-[var(--text-secondary)]">{assistant.emptyChat}</p></div> : null}

                {error ? (
                  <div ref={errorRef} tabIndex={-1} className="mx-auto flex max-w-md items-center gap-3 rounded-[1.2rem] border border-[var(--border-medium)] bg-[var(--surface-standard)] px-4 py-3 outline-none" role="alert">
                    <p className="min-w-0 flex-1 text-xs font-semibold leading-5">{error}</p>
                    {failedTurn ? <button type="button" disabled={isSending} onClick={() => void runTurn(failedTurn.payload, failedTurn.assistantMessageId)} className="shrink-0 rounded-full border border-[var(--border-medium)] px-3 py-2 text-xs font-bold">{assistant.retry}</button> : null}
                  </div>
                ) : null}

                {messages.map((message, index) => (
                  <div key={message.id} className={cn("assistantMessageRow relative z-10 flex items-end gap-2", message.role === "user" ? "justify-end pl-10" : "justify-start pr-3 sm:pr-8")} style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                    {message.role === "assistant" ? (
                      <Image
                        src={alfredAvatar}
                        alt=""
                        className="mb-1 size-8 shrink-0 rounded-xl border border-[var(--border-medium)] object-cover shadow-[var(--shadow-soft)]"
                        sizes="32px"
                      />
                    ) : null}
                    <div className={cn("assistantBubble max-w-[90%] rounded-[1.35rem] px-4 py-3 sm:max-w-[78%]", message.role === "user" ? "assistantBubbleUser rounded-br-md" : "assistantBubbleBot rounded-bl-md")}>
                      {message.content ? <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p> : null}
                      {message.role === "assistant" && (message.status === "sending" || (message.status === "streaming" && !message.content)) ? (
                        <div className="assistantTyping flex items-center gap-1 py-1" aria-label={message.status === "sending" ? assistant.connecting : assistant.typing}>
                          <span className="size-1.5 rounded-full bg-zinc-500 dark:bg-zinc-300" /><span className="size-1.5 rounded-full bg-zinc-500 dark:bg-zinc-300" /><span className="size-1.5 rounded-full bg-zinc-500 dark:bg-zinc-300" />
                        </div>
                      ) : null}
                      {message.status === "cancelled" ? <p className="text-xs font-semibold text-[var(--text-tertiary)]">{assistant.cancelled}</p> : null}
                      {message.analysis ? <AnalysisReportCard analysis={message.analysis} labels={assistant.analysis} locale={language} /> : null}
                      {message.references?.length ? <EvidenceReferences references={message.references} title={assistant.references} /> : null}
                      {message.proposedPatch?.patch_id && (message.requiresConfirmation || message.patchStatus) ? (
                        <PatchConfirmationCard
                          initialPatch={message.proposedPatch}
                          initialStatus={message.patchStatus}
                          labels={assistant.patch}
                          designPreview={designPreviewEnabled}
                          onChange={(patch, status, requiresConfirmation) => updatePatchMessage(message, patch, status, requiresConfirmation)}
                        />
                      ) : null}
                      <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-semibold opacity-55">
                        <span>{formatMessageTime(message.createdAt, language)}</span>
                        {message.role === "user" && message.selectedSkill && message.selectedSkill !== "auto" ? <span>{skillOptions.find((option) => option.value === message.selectedSkill)?.label}</span> : null}
                        {message.status === "streaming" && message.content ? <span role="status">{assistant.streaming}</span> : null}
                      </div>
                    </div>
                  </div>
                ))}
                <span className="sr-only" aria-live="polite">{isSending ? assistant.streaming : ""}</span>
              </div>
            </div>

            <form
              data-tour="assistant-composer"
              data-expanded={isComposerFocused || Boolean(text.trim())}
              onFocus={() => setIsComposerFocused(true)}
              onBlur={(event) => {
                const form = event.currentTarget;
                window.requestAnimationFrame(() => setIsComposerFocused(form.contains(document.activeElement)));
              }}
              onSubmit={sendMessage}
              autoComplete="off"
              className="assistantComposer flex shrink-0 items-end gap-1 rounded-[1.55rem] border border-[var(--border-medium)] bg-[var(--surface-focus)] p-1.5 shadow-[0_18px_48px_-28px_rgba(0,0,0,.85),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl"
            >
              <SkillMenu value={selectedSkill} onChange={setSelectedSkill} options={skillOptions} capabilities={capabilities} disabled={isSending} addLabel={assistant.addSkill} unavailableLabel={assistant.unavailable} closeLabel={assistant.closeSkillMenu} showCurrentLabel />
              <textarea ref={inputRef} name="alfred-message" rows={1} maxLength={4000} value={text} onChange={(event) => setText(event.target.value)} onKeyDown={handleComposerKeyDown} onFocus={() => window.requestAnimationFrame(() => scrollConversationToBottom("auto"))} placeholder={assistant.placeholder} autoComplete="off" autoCorrect="on" autoCapitalize="sentences" enterKeyHint="send" inputMode="text" spellCheck aria-label={assistant.placeholder} className="assistantComposerInput max-h-28 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent py-3 text-base leading-5 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]" />
              {isSending ? (
                <button type="button" onClick={stopStreaming} aria-label={assistant.cancelStream} title={assistant.cancelStream} className="assistantSendButton grid shrink-0 place-items-center rounded-full">
                  <span className="size-3 rounded-[3px] bg-current" aria-hidden="true" />
                </button>
              ) : (
                <button type="submit" disabled={!text.trim() || capabilities?.capabilities.conversation === false} aria-label={assistant.send} title={assistant.send} className="assistantSendButton grid shrink-0 place-items-center rounded-full">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="assistantSendIcon size-5" fill="currentColor"><path d="M11.28 3.22a1 1 0 0 1 1.44 0l6.75 7a1 1 0 0 1-1.44 1.39L13 6.39V20a1 1 0 1 1-2 0V6.39l-5.03 5.22a1 1 0 1 1-1.44-1.39l6.75-7Z" /></svg>
                </button>
              )}
            </form>
          </div>
        </div>
      </section>
      {conversationsModal}
    </AppShell>
  );
}
