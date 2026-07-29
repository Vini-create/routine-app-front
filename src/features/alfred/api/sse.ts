import type { AIErrorResponse } from "./alfred.types";

export type SSEHandler = (event: string, data: unknown) => void;

export class AlfredStreamError extends Error {
  payload: AIErrorResponse;

  constructor(payload: AIErrorResponse) {
    super(payload.message);
    this.name = "AlfredStreamError";
    this.payload = payload;
  }
}

export function joinStreamText(current: string, chunk: string) {
  if (!current) return chunk;
  if (!chunk) return current;
  if (/\s$/.test(current) || /^\s/.test(chunk)) return `${current}${chunk}`;
  return `${current} ${chunk}`;
}

function processFrame(frame: string, onEvent: SSEHandler) {
  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length > 0) {
    onEvent(eventName, JSON.parse(dataLines.join("\n")));
  }
}

export async function consumeSSE(response: Response, onEvent: SSEHandler): Promise<void> {
  if (!response.body) throw new Error("Streaming response has no body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done }).replaceAll("\r\n", "\n");

      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) processFrame(frame, onEvent);

      if (done) {
        if (buffer.trim()) processFrame(buffer, onEvent);
        break;
      }
    }
  } catch (error) {
    // If parsing or an event handler fails, explicitly cancel the response
    // body. Otherwise fetch may leave the server-side SSE task running and its
    // stream reservation blocks the next Alfred request.
    try {
      await reader.cancel(error);
    } catch {
      // Preserve the original stream error.
    }
    throw error;
  } finally {
    reader.releaseLock();
  }
}
