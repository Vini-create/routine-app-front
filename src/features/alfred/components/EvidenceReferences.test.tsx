import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EvidenceReferences } from "./EvidenceReferences";

describe("EvidenceReferences", () => {
  it("renders compact public citations without internal excerpts or paths", () => {
    const html = renderToStaticMarkup(
      <EvidenceReferences
        title="Fontes consultadas"
        references={[
          {
            source_id: "src-procrastination-steel-2007",
            title: "The Nature of Procrastination",
            authors: ["Piers Steel"],
            publication_year: 2007,
            url: "https://pubmed.ncbi.nlm.nih.gov/17201571/",
            doi: "10.1037/0033-2909.133.1.65",
            source_ids: [],
            topic: "procrastination",
            supporting_excerpt: "This internal excerpt must not be rendered.",
            source: "canonical/procrastination/knowledge/internal.md",
            retrieval_score: 0.9,
            rerank_score: 0.8,
          },
        ]}
      />,
    );

    expect(html).toContain("The Nature of Procrastination");
    expect(html).toContain("Piers Steel");
    expect(html).toContain("2007");
    expect(html).toContain("https://pubmed.ncbi.nlm.nih.gov/17201571/");
    expect(html).not.toContain("internal excerpt");
    expect(html).not.toContain("canonical/procrastination");
  });
});
