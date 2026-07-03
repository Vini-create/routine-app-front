import { describe, expect, it } from "vitest";
import { ApiError } from "./api";
import { getAuthErrorMessage, getFieldIssue } from "./authErrors";

const labels = {
  genericError: "generic",
  invalidCredentials: "credentials",
  emailUnverified: "unverified",
  alreadyRegistered: "registered",
  invalidPassword: "password",
  passwordReuse: "reuse",
  invalidVerificationToken: "verification-token",
  invalidResetToken: "reset-token",
  tooManyAttempts: "rate-limit",
  serviceUnavailable: "service",
  connectionError: "connection",
  timeoutError: "timeout",
};

describe("auth error presentation", () => {
  it("localizes known authentication errors", () => {
    expect(getAuthErrorMessage(new ApiError(401, "Invalid credentials"), labels)).toBe("credentials");
    expect(getAuthErrorMessage(new ApiError(403, "Email not verified"), labels)).toBe("unverified");
    expect(getAuthErrorMessage(new ApiError(400, "Email already registered"), labels)).toBe("registered");
  });

  it("maps transport and rate-limit failures", () => {
    expect(getAuthErrorMessage(new ApiError(0, "network"), labels)).toBe("connection");
    expect(getAuthErrorMessage(new ApiError(408, "slow"), labels)).toBe("timeout");
    expect(getAuthErrorMessage(new ApiError(429, "limit"), labels)).toBe("rate-limit");
    expect(getAuthErrorMessage(new ApiError(503, "offline"), labels)).toBe("service");
  });

  it("returns the validation issue for a field", () => {
    const error = new ApiError(422, "invalid", [{ field: "email", message: "invalid email" }]);
    expect(getFieldIssue(error, "email")).toBe("invalid email");
    expect(getFieldIssue(error, "password")).toBe("");
  });
});
