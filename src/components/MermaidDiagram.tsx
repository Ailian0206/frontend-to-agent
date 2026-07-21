"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface MermaidDiagramProps {
  title: string;
  chart: string;
}

type DiagramState =
  | { status: "idle" | "loading" }
  | { status: "ready"; svg: string }
  | { status: "error"; message: string };

export function MermaidDiagram({ title, chart }: MermaidDiagramProps) {
  const reactId = useId();
  const hostRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<DiagramState>({ status: "idle" });

  useEffect(() => {
    let active = true;
    const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

    async function renderDiagram(): Promise<void> {
      try {
        setState({ status: "loading" });
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
        const documentNode = new DOMParser().parseFromString(svg, "image/svg+xml");
        const svgNode = documentNode.documentElement;
        const titleId = `${id}-title`;
        const titleNode = documentNode.createElementNS("http://www.w3.org/2000/svg", "title");
        titleNode.setAttribute("id", titleId);
        titleNode.textContent = title;
        svgNode.insertBefore(titleNode, svgNode.firstChild);
        svgNode.setAttribute("role", "img");
        svgNode.setAttribute("aria-labelledby", titleId);
        const accessibleSvg = new XMLSerializer().serializeToString(svgNode);
        if (active) setState({ status: "ready", svg: accessibleSvg });
      } catch (error) {
        if (active) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "图表渲染失败",
          });
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void renderDiagram();
        }
      },
      { rootMargin: "800px 0px" },
    );
    if (hostRef.current) observer.observe(hostRef.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [chart, reactId, title]);

  return (
    <figure className="diagram-figure" ref={hostRef}>
      <figcaption>{title}</figcaption>
      {state.status === "idle" || state.status === "loading" ? (
        <div className="diagram-skeleton" aria-label="图表加载中">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      {state.status === "ready" ? (
        <>
          <div
            className="mermaid-canvas"
            dangerouslySetInnerHTML={{ __html: state.svg }}
          />
          <p className="diagram-scroll-hint" aria-hidden="true">横向滑动查看完整图表</p>
        </>
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
