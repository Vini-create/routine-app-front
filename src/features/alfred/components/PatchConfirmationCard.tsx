"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { alfredApi } from "../api/alfredApi";
import type { PatchOperation, PatchStatus, ProposedPatch } from "../api/alfred.types";

type PatchLabels = {
  title: string;
  reason: string;
  before: string;
  after: string;
  accept: string;
  edit: string;
  reject: string;
  saveEdit: string;
  rejectReason: string;
  optional: string;
  applied: string;
  rejected: string;
  pending: string;
  expired: string;
  error: string;
  cancel: string;
  successMetrics: string;
};

function fieldLabel(path: string) {
  return path.replace(/^\//, "").replaceAll("_", " ");
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function parseEditedValue(value: string, original: PatchOperation["value"]) {
  if (typeof original === "number") return Number(value);
  if (typeof original === "boolean") return value === "true";
  if (original === null && value === "") return null;
  return value;
}

function editableValue(value: PatchOperation["value"]) {
  return value === null || value === undefined ? "" : String(value);
}

export function PatchConfirmationCard({
  initialPatch,
  labels,
}: {
  initialPatch: ProposedPatch;
  labels: PatchLabels;
}) {
  const queryClient = useQueryClient();
  const [patch, setPatch] = useState(initialPatch);
  const [status, setStatus] = useState<PatchStatus>("pending");
  const [action, setAction] = useState<"accept" | "edit" | "reject" | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "reject">("view");
  const [reason, setReason] = useState("");
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLElement>(null);
  const idempotencyKeysRef = useRef<Partial<Record<"accept" | "edit", string>>>({});
  const simulation = patch.simulation;

  useEffect(() => {
    if (status === "pending") cardRef.current?.focus();
  }, [status]);

  const fields = useMemo(() => simulation?.changed_fields ?? patch.operations.map((operation) => operation.path.replace(/^\//, "")), [patch.operations, simulation?.changed_fields]);

  async function resolve(nextAction: "accept" | "edit" | "reject") {
    if (!patch.patch_id || action) return;
    setAction(nextAction);
    setError("");
    try {
      if (nextAction === "accept") {
        const idempotencyKey = idempotencyKeysRef.current.accept ?? crypto.randomUUID();
        idempotencyKeysRef.current.accept = idempotencyKey;
        const response = await alfredApi.acceptPatch(patch.patch_id, idempotencyKey);
        delete idempotencyKeysRef.current.accept;
        setPatch(response.proposed_patch);
        setStatus(response.status);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["agenda"] }),
          queryClient.invalidateQueries({ queryKey: ["routine-items"] }),
          queryClient.invalidateQueries({ queryKey: ["habits"] }),
          queryClient.invalidateQueries({ queryKey: ["habits-dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["goals"] }),
          queryClient.invalidateQueries({ queryKey: ["goals-dashboard"] }),
        ]);
      } else if (nextAction === "reject") {
        const response = await alfredApi.rejectPatch(patch.patch_id, reason);
        setPatch(response.proposed_patch);
        setStatus(response.status);
        setMode("view");
      } else {
        const operations = patch.operations.map((operation, index): PatchOperation => ({
          ...operation,
          ...(operation.op !== "remove"
          ? { value: parseEditedValue(editedValues[index] ?? editableValue(operation.value), operation.value) }
          : {}),
        }));
        const idempotencyKey = idempotencyKeysRef.current.edit ?? crypto.randomUUID();
        idempotencyKeysRef.current.edit = idempotencyKey;
        const response = await alfredApi.editPatch(patch.patch_id, operations, idempotencyKey);
        delete idempotencyKeysRef.current.edit;
        setPatch(response.proposed_patch);
        setStatus(response.status);
        setMode("view");
      }
    } catch (caught) {
      if (caught instanceof ApiError && (caught.status === 409 || caught.status === 410)) {
        setStatus(caught.status === 410 ? "expired" : "rejected");
      }
      setError(caught instanceof Error ? caught.message : labels.error);
    } finally {
      setAction(null);
    }
  }

  const statusLabel = status === "applied" ? labels.applied : status === "rejected" ? labels.rejected : status === "expired" ? labels.expired : labels.pending;

  return (
    <section ref={cardRef} tabIndex={-1} className="mt-3 rounded-[1.2rem] border border-[var(--border-strong)] bg-[var(--surface-focus)] p-4 outline-none focus:ring-2 focus:ring-[var(--border-strong)]" aria-label={labels.title}>
      <div className="flex items-center justify-between gap-3">
        <p className="label-micro">{labels.title}</p>
        <span className="rounded-full border border-[var(--border-medium)] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[.07em]">{statusLabel}</span>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[.06em] text-[var(--text-tertiary)]">{labels.reason}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{patch.reason}</p>

      {simulation ? (
        <div className="mt-3 grid gap-2">
          {fields.map((field) => (
            <div key={field} className="grid grid-cols-[1fr_auto_1fr] items-stretch overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-ambient)]">
              <div className="min-w-0 p-3">
                <p className="text-[9px] font-extrabold uppercase tracking-[.07em] text-[var(--text-tertiary)]">{labels.before}</p>
                <p className="mt-1 break-words text-xs font-semibold">{formatValue(simulation.before[field])}</p>
              </div>
              <span className="self-center text-[var(--text-tertiary)]" aria-hidden="true">→</span>
              <div className="min-w-0 p-3">
                <p className="text-[9px] font-extrabold uppercase tracking-[.07em] text-[var(--text-tertiary)]">{labels.after} · {fieldLabel(field)}</p>
                <p className="mt-1 break-words text-xs font-semibold">{formatValue(simulation.after[field])}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {patch.success_metrics.length ? (
        <div className="mt-3">
          <p className="text-[9px] font-extrabold uppercase tracking-[.07em] text-[var(--text-tertiary)]">{labels.successMetrics}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {patch.success_metrics.map((metric, index) => (
              <span key={index} className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-ambient)] px-3 py-1.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                {Object.entries(metric).map(([key, value]) => `${fieldLabel(key)}: ${formatValue(value)}`).join(" · ")}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {mode === "edit" ? (
        <div className="mt-3 grid gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-ambient)] p-3">
          {patch.operations.map((operation, index) => (
            <label key={`${operation.path}-${index}`} className="grid gap-1 text-xs font-bold capitalize text-[var(--text-secondary)]">
              {fieldLabel(operation.path)}
              {typeof operation.value === "boolean" ? (
                <select
                  value={editedValues[index] ?? String(operation.value)}
                  onChange={(event) => setEditedValues((current) => ({ ...current, [index]: event.target.value }))}
                  className="min-h-10 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-standard)] px-3 text-[var(--text-primary)]"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              ) : (
                <input
                  type={typeof operation.value === "number" ? "number" : "text"}
                  disabled={operation.op === "remove"}
                  value={editedValues[index] ?? editableValue(operation.value)}
                  onChange={(event) => setEditedValues((current) => ({ ...current, [index]: event.target.value }))}
                  className="min-h-10 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-standard)] px-3 text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)]"
                />
              )}
            </label>
          ))}
        </div>
      ) : null}

      {mode === "reject" ? (
        <label className="mt-3 grid gap-1 text-xs font-bold text-[var(--text-secondary)]">
          {labels.rejectReason} <span className="font-normal text-[var(--text-tertiary)]">({labels.optional})</span>
          <textarea maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-20 resize-none rounded-xl border border-[var(--border-medium)] bg-[var(--surface-ambient)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)]" />
        </label>
      ) : null}

      {error ? <p className="mt-3 text-xs font-semibold text-red-500" role="alert">{error}</p> : null}

      {status === "pending" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={Boolean(action)} onClick={() => mode === "view" ? void resolve("accept") : mode === "edit" ? void resolve("edit") : void resolve("reject")} className="min-h-10 rounded-full bg-[var(--text-primary)] px-4 text-xs font-extrabold text-[var(--background-primary)] disabled:opacity-50">
            {action ? "…" : mode === "edit" ? labels.saveEdit : mode === "reject" ? labels.reject : labels.accept}
          </button>
          {mode === "view" ? (
            <>
              <button type="button" disabled={Boolean(action)} onClick={() => setMode("edit")} className="min-h-10 rounded-full border border-[var(--border-medium)] px-4 text-xs font-bold disabled:opacity-50">{labels.edit}</button>
              <button type="button" disabled={Boolean(action)} onClick={() => setMode("reject")} className="min-h-10 rounded-full border border-[var(--border-medium)] px-4 text-xs font-bold disabled:opacity-50">{labels.reject}</button>
            </>
          ) : (
            <button type="button" disabled={Boolean(action)} onClick={() => setMode("view")} className="min-h-10 rounded-full border border-[var(--border-medium)] px-4 text-xs font-bold disabled:opacity-50">{labels.cancel}</button>
          )}
        </div>
      ) : null}
    </section>
  );
}
