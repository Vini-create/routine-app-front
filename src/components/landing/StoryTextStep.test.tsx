import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SilverHighlight } from "./StoryTextStep";

describe("SilverHighlight", () => {
  it("renders every animated highlight glyph explicitly", () => {
    const copy = "um caminho";
    const html = renderToStaticMarkup(
      <SilverHighlight animateByLetter>{copy}</SilverHighlight>,
    );

    expect(html).toContain('data-story-highlight="true"');
    expect(html).toContain('aria-label="um caminho"');
    expect(html.match(/storyHighlightWord/g)).toHaveLength(2);
    expect(html.match(/storyHighlightChar/g)).toHaveLength(Array.from(copy.replaceAll(" ", "")).length);
  });

  it("keeps regular silver copy unsplit", () => {
    const html = renderToStaticMarkup(<SilverHighlight>Winperium.</SilverHighlight>);

    expect(html).toContain(">Winperium.</span>");
    expect(html).not.toContain("storyHighlightChar");
  });
});
