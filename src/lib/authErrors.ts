import { ApiError } from "./api";

type AuthErrorLabels = {
  genericError: string;
  invalidCredentials: string;
  emailUnverified: string;
  alreadyRegistered: string;
  invalidPassword: string;
  passwordReuse: string;
  invalidVerificationToken: string;
  invalidResetToken: string;
  tooManyAttempts: string;
  serviceUnavailable: string;
  connectionError: string;
  timeoutError: string;
};

export function getAuthErrorMessage(cause: unknown, labels: AuthErrorLabels) {
  if (!(cause instanceof ApiError)) return labels.genericError;
  if (cause.status === 0) return labels.connectionError;
  if (cause.status === 408) return labels.timeoutError;
  if (cause.status === 429) return labels.tooManyAttempts;
  if (cause.status >= 500) return labels.serviceUnavailable;

  const detail = cause.detail.toLowerCase();
  if (detail.includes("invalid credentials")) return labels.invalidCredentials;
  if (detail.includes("email not verified")) return labels.emailUnverified;
  if (detail.includes("already registered")) return labels.alreadyRegistered;
  if (detail.includes("invalid password")) return labels.invalidPassword;
  if (detail.includes("new password must be different")) return labels.passwordReuse;
  if (detail.includes("verification token")) return labels.invalidVerificationToken;
  if (detail.includes("password reset token")) return labels.invalidResetToken;
  return cause.detail || labels.genericError;
}

export function getFieldIssue(cause: unknown, field: string) {
  if (!(cause instanceof ApiError)) return "";
  return cause.issues.find((issue) => issue.field === field)?.message ?? "";
}
