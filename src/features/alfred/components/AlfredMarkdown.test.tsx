import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AlfredMarkdown } from "./AlfredMarkdown";

describe("AlfredMarkdown", () => {
  it("renders structured model text instead of exposing Markdown markers", () => {
    const html = renderToStaticMarkup(
      <AlfredMarkdown content={"## Opções\n\n1. **Reduzir a carga**\n2. Manter o foco"} />,
    );

    expect(html).toContain("<h2");
    expect(html).toContain("<ol");
    expect(html).toContain("<strong");
    expect(html).toContain("Reduzir a carga");
    expect(html).not.toContain("**");
  });

  it("repairs inline numbered Markdown commonly returned during streaming", () => {
    const html = renderToStaticMarkup(
      <AlfredMarkdown content={"Sugestões: 1. **Reduzir a carga**: escolha prioridades. 2. **Definir prazos**: use blocos claros."} />,
    );

    expect(html).toContain("<ol");
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).not.toContain("1. **");
  });

  it("does not render raw HTML supplied by the model", () => {
    const html = renderToStaticMarkup(
      <AlfredMarkdown content={'<script>alert("xss")</script>\n\nTexto seguro'} />,
    );

    expect(html).not.toContain("<script");
    expect(html).toContain("Texto seguro");
  });

  it("does not preserve unsafe link protocols", () => {
    const html = renderToStaticMarkup(
      <AlfredMarkdown content={"[link inseguro](javascript:alert('xss'))"} />,
    );

    expect(html).not.toContain("javascript:");
  });
});
