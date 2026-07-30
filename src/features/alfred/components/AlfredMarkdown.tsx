import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "../../../lib/utils";

const components: Components = {
  h1: ({ className, ...props }) => (
    <h1 className={cn("mb-2 mt-4 text-base font-extrabold leading-6 first:mt-0", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={cn("mb-2 mt-4 text-[15px] font-extrabold leading-6 first:mt-0", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mb-1.5 mt-3 text-sm font-extrabold leading-6 first:mt-0", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("mb-3 whitespace-pre-wrap leading-6 last:mb-0", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("mb-3 ml-1 list-disc space-y-1.5 pl-5 last:mb-0", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("mb-3 ml-1 list-decimal space-y-2 pl-5 last:mb-0", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("pl-1 leading-6 marker:font-bold marker:text-[var(--text-tertiary)]", className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-extrabold text-[var(--text-primary)]", className)} {...props} />
  ),
  em: ({ className, ...props }) => (
    <em className={cn("text-[var(--text-secondary)]", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn("break-words font-semibold underline underline-offset-4 hover:opacity-75", className)}
      target="_blank"
      rel="noreferrer noopener"
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("mb-3 border-l-2 border-[var(--border-medium)] pl-3 italic text-[var(--text-secondary)] last:mb-0", className)}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn("rounded-md bg-[var(--surface-standard)] px-1.5 py-0.5 font-mono text-[.9em]", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn("mb-3 max-w-full overflow-x-auto rounded-xl border border-[var(--border-soft)] bg-[var(--surface-standard)] p-3 text-xs leading-5 last:mb-0 [&_code]:bg-transparent [&_code]:p-0", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-4 border-[var(--border-soft)]", className)} {...props} />
  ),
};

export function normalizeAlfredMarkdown(content: string) {
  return content
    .replace(/([.:!?])\s+(?=\d+\.\s+\*\*)/g, "$1\n\n")
    .replace(/([.:!?])\s+(?=[*-]\s+\*\*)/g, "$1\n\n");
}

export function AlfredMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 break-words text-sm leading-6", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={components}
      >
        {normalizeAlfredMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
