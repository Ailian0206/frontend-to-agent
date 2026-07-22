import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { ContentBlock } from "@/content/types";

type ScreenshotBlock = Extract<ContentBlock, { type: "screenshot" }>;
export type AnnotatedScreenshotProps = Omit<ScreenshotBlock, "type">;

export function AnnotatedScreenshot({
  src,
  alt,
  title,
  capturedAt,
  imageKind,
  width,
  height,
  legend,
  sourceUrl,
}: AnnotatedScreenshotProps) {
  // next/image requires the configured basePath to be part of public image URLs.
  const basePath = process.env.GITHUB_PAGES === "true" ? "/frontend-to-agent" : "";

  return (
    <figure className="annotated-screenshot" aria-label={title}>
      <div
        className="screenshot-image"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image
          src={`${basePath}${src}`}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 760px) 100vw, 820px"
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <figcaption>
        <div className="screenshot-caption">
          <div>
            <span className={`screenshot-kind ${imageKind}`}>
              {imageKind === "real" ? "真实界面" : "示意图"}
            </span>
            <strong>{title}</strong>
          </div>
          <p>
            <span>记录于 {capturedAt}</span>
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                查看官方说明<ExternalLink size={13} />
              </a>
            ) : null}
          </p>
        </div>
        {legend.length > 0 ? (
          <ol className="screenshot-legend">
            {legend.map((item) => (
              <li key={`${item.label}-${item.title}`}>
                <span>{item.label}</span>
                <div><strong>{item.title}</strong><p>{item.detail}</p></div>
              </li>
            ))}
          </ol>
        ) : null}
      </figcaption>
    </figure>
  );
}
