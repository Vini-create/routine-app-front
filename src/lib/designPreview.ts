import type { UserMe } from "./api-contracts";

export const designPreviewEnabled =
  process.env.NODE_ENV === "development"
  && process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true";

export const designPreviewUser: UserMe = {
  id: "design-preview-user",
  email: "preview@rotina.ai",
  display_name: "Visitante",
  language: "portuguese_br",
  signature_plan: "free",
  is_verified: true,
  has_password: false,
};
