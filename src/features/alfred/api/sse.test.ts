import { describe, expect, it, vi } from "vitest";
import { consumeSSE, joinStreamText } from "./sse";

function chunkedResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

describe("Alfred SSE parser", () => {
  it("handles frames split across network chunks", async () => {
    const handler = vi.fn();
    const response = chunkedResponse([
      "event: status\ndata: {\"node\":\"start\",\"mess",
      "age\":\"Working\"}\n\nevent: token\ndata: {\"content\":\"Hello\"}\n",
      "\nevent: done\ndata: {\"request_id\":\"r1\",\"conversation_id\":\"c1\",\"route\":\"alfred\",\"usage\":{\"plan\":\"free\",\"units_reserved\":1,\"units_consumed\":1,\"units_remaining\":null}}\n\n",
    ]);

    await consumeSSE(response, handler);

    expect(handler).toHaveBeenNthCalledWith(1, "status", { node: "start", message: "Working" });
    expect(handler).toHaveBeenNthCalledWith(2, "token", { content: "Hello" });
    expect(handler).toHaveBeenNthCalledWith(3, "done", expect.objectContaining({ request_id: "r1" }));
  });

  it("preserves one space between grouped token events", () => {
    expect(joinStreamText("A realistic", "plan")).toBe("A realistic plan");
    expect(joinStreamText("A realistic ", "plan")).toBe("A realistic plan");
    expect(joinStreamText("", "Start")).toBe("Start");
  });

  it("accumulates multiple reference events", async () => {
    const references: unknown[] = [];
    const response = chunkedResponse([
      "event: reference\ndata: {\"document_id\":\"d1\"}\n\n",
      "event: reference\ndata: {\"document_id\":\"d2\"}\n\n",
    ]);

    await consumeSSE(response, (event, data) => {
      if (event === "reference") references.push(data);
    });

    expect(references).toEqual([{ document_id: "d1" }, { document_id: "d2" }]);
  });

  it("cancels the response body when an event handler fails", async () => {
    const encoder = new TextEncoder();
    const cancel = vi.fn();
    const response = new Response(new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(
          "event: error\ndata: {\"code\":\"graph_execution_failed\"}\n\n",
        ));
      },
      cancel,
    }));
    const handlerError = new Error("handler failed");

    await expect(consumeSSE(response, () => {
      throw handlerError;
    })).rejects.toBe(handlerError);

    expect(cancel).toHaveBeenCalledOnce();
    expect(cancel).toHaveBeenCalledWith(handlerError);
  });
});
