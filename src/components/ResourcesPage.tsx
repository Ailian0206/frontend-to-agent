"use client";

import { ExternalLink, Library } from "lucide-react";
import { useMemo, useState } from "react";
import { courseResources } from "@/content/resources";
import { courseTracks } from "@/content/taxonomy";
import type { CourseTrack, ResourceKind } from "@/content/types";
import { CourseApp } from "./CourseApp";
import { chapterSearchIndex, chapterSummaries } from "@/content/course-index";

const kinds: Array<ResourceKind | "全部"> = ["全部", "github", "docs", "course", "article", "video"];

export function ResourcesPage() {
  const [track, setTrack] = useState<CourseTrack | "全部">("全部");
  const [kind, setKind] = useState<ResourceKind | "全部">("全部");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return courseResources.filter((resource) => {
      if (track !== "全部" && resource.track !== track) return false;
      if (kind !== "全部" && resource.kind !== kind) return false;
      if (!normalized) return true;
      return [resource.title, resource.summary, resource.why, ...resource.tags]
        .join(" ")
        .toLocaleLowerCase("zh-CN")
        .includes(normalized);
    });
  }, [track, kind, query]);

  return (
    <CourseApp
      chapters={chapterSummaries}
      searchIndex={chapterSearchIndex}
    >
      <article className="resources-page">
        <header className="lesson-header">
          <div className="lesson-kicker">
            <span>公开资料</span>
            <span>可筛选</span>
            <span><Library size={14} />{courseResources.length} 条</span>
          </div>
          <p className="chapter-number">RESOURCE CATALOG</p>
          <h1>公开 Agent 教程与资源库</h1>
          <p className="lesson-goal">
            汇总 GitHub 课程、官方文档与公开中文文章，按本站七大轨道分类。内容为原创摘要与学习建议，请直接访问原链接阅读；不镜像微信公众号付费或未授权全文。
          </p>
        </header>

        <div className="resource-filters">
          <label>
            <span>关键词</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="MCP、HITL、LangGraph、评估……"
              aria-label="筛选资源关键词"
            />
          </label>
          <label>
            <span>轨道</span>
            <select
              value={track}
              onChange={(event) => setTrack(event.target.value as CourseTrack | "全部")}
              aria-label="按轨道筛选"
            >
              <option value="全部">全部轨道</option>
              {courseTracks.map((item) => (
                <option key={item.id} value={item.id}>{item.id}</option>
              ))}
            </select>
          </label>
          <label>
            <span>类型</span>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as ResourceKind | "全部")}
              aria-label="按类型筛选"
            >
              {kinds.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <p className="resource-count">当前显示 {filtered.length} 条</p>

        <ul className="resource-cards">
          {filtered.map((resource) => (
            <li key={resource.id}>
              <div className="resource-card-top">
                <span className="resource-kind">{resource.kind}</span>
                <span className="resource-track">{resource.track}</span>
                <span className="resource-lang">{resource.language}</span>
              </div>
              <a href={resource.url} target="_blank" rel="noreferrer">
                <strong>{resource.title}</strong>
                <ExternalLink size={16} aria-hidden="true" />
              </a>
              <p>{resource.summary}</p>
              <p className="resource-why"><em>为什么放进来：</em>{resource.why}</p>
              <div className="resource-tags">
                {resource.tags.map((tag) => <code key={tag}>{tag}</code>)}
              </div>
            </li>
          ))}
        </ul>
      </article>
    </CourseApp>
  );
}
