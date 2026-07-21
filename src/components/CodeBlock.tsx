import { createHighlighter } from "shiki";
import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  language: string;
  filename: string;
  code: string;
  caption?: string;
  output?: string;
}

const languageAliases: Record<string, string> = {
  text: "text",
  bash: "bash",
  typescript: "typescript",
  json: "json",
  yaml: "yaml",
};

const highlighterPromise = createHighlighter({
  themes: ["github-dark-default"],
  langs: ["text", "bash", "typescript", "json", "yaml"],
});

export async function CodeBlock({
  language,
  filename,
  code,
  caption,
  output,
}: CodeBlockProps) {
  const highlighter = await highlighterPromise;
  const highlighted = highlighter.codeToHtml(code, {
    lang: languageAliases[language] ?? "text",
    theme: "github-dark-default",
  });

  return (
    <figure className="code-figure">
      <div className="code-toolbar">
        <div>
          <span className="code-language">{language}</span>
          <span className="code-filename">{filename}</span>
        </div>
        <CopyButton code={code} />
      </div>
      <div
        className="highlighted-code"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
      {output ? (
        <div className="expected-output">
          <strong>验证方法</strong>
          <pre>{output}</pre>
        </div>
      ) : null}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
