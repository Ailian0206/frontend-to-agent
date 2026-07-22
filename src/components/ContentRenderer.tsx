import {
  AlertTriangle,
  CheckCircle2,
  CircleCheck,
  Info,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ContentBlock } from "@/content/types";
import { AnnotatedScreenshot } from "./AnnotatedScreenshot";
import { CodeBlock } from "./CodeBlock";
import { MermaidDiagram } from "./MermaidDiagram";

interface ContentRendererProps {
  blocks: ContentBlock[];
}

function InlineText({ text }: { text: string }) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);

  return parts.map<ReactNode>((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code className="inline-code" key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return <a href={link[2]} target="_blank" rel="noreferrer" key={index}>{link[1]}</a>;
    }
    return part;
  });
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
        return <p className="lesson-paragraph" key={key}><InlineText text={block.text} /></p>;
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
              <li key={item}><span /><p><InlineText text={item} /></p></li>
            ))}
          </ul>
        );
      case "steps":
        return (
          <ol className="lesson-steps" key={key}>
            {block.items.map((item, itemIndex) => (
              <li key={item.title}>
                <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                <div><strong>{item.title}</strong><p>{item.detail}</p></div>
              </li>
            ))}
          </ol>
        );
      case "callout": {
        const Icon = calloutIcon[block.tone];
        return (
          <aside className={`lesson-callout ${block.tone}`} key={key}>
            <Icon size={19} />
            <div><strong>{block.title}</strong><p>{block.text}</p></div>
          </aside>
        );
      }
      case "table":
        return (
          <div className="table-scroll" key={key}>
            <table>
              <thead><tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${row[0]}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}
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
      case "screenshot":
        return <AnnotatedScreenshot {...block} key={key} />;
      case "checkpoint":
        return (
          <aside className="checkpoint" key={key}>
            <header><CircleCheck size={21} /><strong>{block.title}</strong></header>
            <ul>{block.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>
          </aside>
        );
      case "resources":
        return (
          <section className="resource-list" key={key} aria-label={block.title}>
            <h3>{block.title}</h3>
            <ul>
              {block.items.map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <span className="resource-kind">{item.kind}</span>
                    <strong>{item.title}</strong>
                  </a>
                  <p>{item.note}</p>
                </li>
              ))}
            </ul>
          </section>
        );
    }
  });
}
