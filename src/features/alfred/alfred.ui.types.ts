import type {
  AnalysisReport,
  EvidenceReference,
  InternalRoute,
  ProposedPatch,
  SelectedSkill,
  PatchStatus,
} from "./api/alfred.types";

export type AlfredMessageStatus =
  | "sending"
  | "streaming"
  | "completed"
  | "failed"
  | "cancelled";

export type AlfredUiMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  status: AlfredMessageStatus;
  requestId?: string;
  route?: InternalRoute | null;
  references?: EvidenceReference[];
  analysis?: AnalysisReport | null;
  proposedPatch?: ProposedPatch | null;
  requiresConfirmation?: boolean;
  patchStatus?: PatchStatus;
  selectedSkill?: SelectedSkill;
};
