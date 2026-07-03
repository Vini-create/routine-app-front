import { apiFetch } from "./api";

const useLocalFallbackApi = process.env.NEXT_PUBLIC_USE_MOCK_AI !== "false";

export type WeeklyRoutineSummary = {
  blocks: unknown[];
  habits: unknown[];
  profile: unknown;
  week: unknown[];
};

export type GenerateRoutineFeedbackRequest = {
  goal: string;
  weeklyRoutine: WeeklyRoutineSummary;
};

export type RoutineFeedbackResponse = {
  feedback: string;
};

export async function generateRoutineFeedback(
  input: GenerateRoutineFeedbackRequest,
  fallbackFeedback: string,
): Promise<RoutineFeedbackResponse> {
  // API_CONNECTION_POINT: later call POST /routine-feedback with goal + weekly routine + habits + profile context.
  if (!useLocalFallbackApi) {
    return apiFetch<RoutineFeedbackResponse>("/routine-feedback", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  await new Promise((resolve) => window.setTimeout(resolve, 900));

  return { feedback: fallbackFeedback };
}
