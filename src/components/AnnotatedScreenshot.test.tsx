import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AnnotatedScreenshot } from "./AnnotatedScreenshot";

afterEach(cleanup);

describe("AnnotatedScreenshot", () => {
  it("renders a labelled figure with dated legend and source", () => {
    render(
      <AnnotatedScreenshot
        src="/course/production-ops/vercel/deployments.webp"
        alt="Vercel 部署列表"
        title="确认线上版本"
        capturedAt="2026-07-22"
        imageKind="real"
        width={1440}
        height={900}
        legend={[
          { label: "1", title: "Status（状态）", detail: "Ready 表示发布完成。" },
        ]}
        sourceUrl="https://vercel.com/docs/deployments"
      />,
    );

    expect(screen.getByRole("figure")).toHaveAccessibleName("确认线上版本");
    expect(screen.getByRole("img", { name: "Vercel 部署列表" })).toBeInTheDocument();
    expect(screen.getByText("真实界面")).toBeInTheDocument();
    expect(screen.getByText("记录于 2026-07-22")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看官方说明" })).toHaveAttribute(
      "href",
      "https://vercel.com/docs/deployments",
    );
  });

  it("labels illustrations without claiming they are real dashboards", () => {
    render(
      <AnnotatedScreenshot
        src="/course/production-ops/system-map.webp"
        alt="生产系统示意图"
        title="四个平台的职责边界"
        capturedAt="2026-07-22"
        imageKind="illustration"
        width={1440}
        height={900}
        legend={[]}
      />,
    );

    expect(screen.getByText("示意图")).toBeInTheDocument();
    expect(screen.queryByText("真实界面")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "查看官方说明" })).not.toBeInTheDocument();
  });
});
