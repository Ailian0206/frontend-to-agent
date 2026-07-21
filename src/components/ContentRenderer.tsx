import {
  AlertTriangle,
  CheckCircle2,
  CircleCheck,
  Info,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContentBlock } from "@/content/types";
import { CodeBlock } from "./CodeBlock";
import { MermaidDiagram } from "./MermaidDiagram";

interface ContentRendererProps {
  blocks: ContentBlock[];
}

function MarkdownText({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p>{children}</p>,
        code: ({ children }) => <code className="inline-code">{children}</code>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

const calloutIcon = {
  note: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
};

export function ContentRenderer({ blocks }: ContentRendererProps) {
  return blocks.map((block, index) => {
    const key = `${block.type}-${index}`;

    switch (block.type) {
      case "paragraph":
        return (
          <div className="lesson-paragraph" key={key}>
            <MarkdownText text={block.text} />
          </div>
        );
      case "quote":
        return (
          <figure className="lesson-quote" key={key}>
            <blockquote>{block.text}</blockquote>
            <figcaption>
              <strong>{block.author}</strong>
              {block.source ? <span>{block.source}</span> : null}
            </figcaption>
          </figure>
        );
      case "bullets":
        return (
          <ul className="lesson-list" key={key}>
            {block.items.map((item) => (
              <li key={item}>
                <span />
                <MarkdownText text={item} />
              </li>
            ))}
          </ul>
        );
      case "steps":
        return (
          <ol className="lesson-steps" key={key}>
            {block.items.map((item, itemIndex) => (
              <li key={item.title}>
                <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        );
      case "callout": {
        const Icon = calloutIcon[block.tone];
        return (
          <aside className={`lesson-callout ${block.tone}`} key={key}>
            <Icon size={19} />
            <div>
              <strong>{block.title}</strong>
              <p>{block.text}</p>
            </div>
          </aside>
        );
      }
      case "table":
        return (
          <div className="table-scroll" key={key}>
            <table>
              <thead>
                <tr>
                  {block.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${row[0]}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${cell}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "code":
        return <CodeBlock {...block} key={key} />;
      case "diagram":
        return <MermaidDiagram {...block} key={key} />;
      case "checkpoint":
        return (
          <aside className="checkpoint" key={key}>
            <header>
              <CircleCheck size={21} />
              <strong>{block.title}</strong>
            </header>
            <ul>
              {block.criteria.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ul>
          </aside>
        );
    }
  });
}
