import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders user-written markdown as HTML, styled with Tailwind `prose`.
 * Raw HTML in the source is shown as text, not run, and `javascript:` links are
 * stripped (react-markdown defaults), so a page can't inject scripts.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
