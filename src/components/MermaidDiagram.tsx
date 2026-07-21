"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface MermaidDiagramProps {
  title: string;
  chart: string;
}

type DiagramState =
  | { status: "loading" }
  | { status: "ready"; svg: string }
  | { status: "error"; message: string };

export function MermaidDiagram({ title, chart }: MermaidDiagramProps) {
  const reactId = useId();
  const [state, setState] = useState<DiagramState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

    async function renderDiagram(): Promise<void> {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            background: "#fbfbf8",
            primaryColor: "#f1eee8",
            primaryTextColor: "#1b1d1c",
            primaryBorderColor: "#a8aca8",
            lineColor: "#6d746f",
            secondaryColor: "#e4efea",
            tertiaryColor: "#f3e2de",
            fontFamily: "var(--font-geist), sans-serif",
          },
          flowchart: { curve: "basis", htmlLabels: true },
        });
        const { svg } = await mermaid.render(id, chart);
        if (active) setState({ status: "ready", svg });
      } catch (error) {
        if (active) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "图表渲染失败",
          });
        }
      }
    }

    void renderDiagram();
    return () => {
      active = false;
    };
  }, [chart, reactId]);

  return (
    <figure className="diagram-figure">
      <figcaption>{title}</figcaption>
      {state.status === "loading" ? (
        <div className="diagram-skeleton" aria-label="图表加载中">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      {state.status === "ready" ? (
        <div
          className="mermaid-canvas"
          dangerouslySetInnerHTML={{ __html: state.svg }}
        />
      ) : null}
      {state.status === "error" ? (
        <div className="diagram-error" role="alert">
          <AlertTriangle size={18} />
          <div>
            <strong>图表暂时无法渲染</strong>
            <p>{state.message}</p>
          </div>
        </div>
      ) : null}
    </figure>
  );
}
