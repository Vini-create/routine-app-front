import type { CheckIn } from "@/types";
import { apiFetch, useLocalFallbackApi } from "./api";

export type SubmitCheckInResponse = {
  aiResponse: string;
};

export async function submitCheckIn(_checkIn: CheckIn, fallbackResponse: string): Promise<SubmitCheckInResponse> {
  // API_CONNECTION_POINT: later call POST /check-ins and return the AI routine adjustment.
  if (!useLocalFallbackApi) {
    return apiFetch<SubmitCheckInResponse>("/check-ins", {
      method: "POST",
      body: JSON.stringify(_checkIn),
    });
  }

  return { aiResponse: fallbackResponse };
}
