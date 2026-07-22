import { Clock3 } from "lucide-react";
import Link from "next/link";
import {
  chapterSearchIndex,
  chapterSummaries,
  summarizeChapter,
} from "@/content/course-index";
import { getSkill } from "@/content/skills";
import type { Chapter } from "@/content/types";
import { ContentRenderer } from "./ContentRenderer";
import { CourseApp } from "./CourseApp";

export function CoursePage({ chapter }: { chapter: Chapter }) {
  return (
    <CourseApp
      key={chapter.slug}
      activeChapter={summarizeChapter(chapter)}
      chapters={chapterSummaries}
      searchIndex={chapterSearchIndex}
    >
      <article>
        <header className="lesson-header">
          <div className="lesson-kicker">
            <span>{chapter.track}</span>
            <span>{chapter.phase}</span>
            <span>{chapter.level}</span>
            <span><Clock3 size={14} />{chapter.duration}</span>
          </div>
          <p className="chapter-number">CHAPTER {String(chapter.number).padStart(2, "0")}</p>
          <h1>{chapter.title}</h1>
          <p className="lesson-goal">{chapter.goal}</p>
          {chapter.comingSoon ? (
            <aside className="lesson-callout note coming-soon-banner" role="status">
              <strong>本实验将在后续里程碑提供可运行仓库</strong>
              <p>当前为导航占位，可先学关联课程，并通过能力地图核对目标技能。</p>
            </aside>
          ) : null}
          <div className="skill-badge-row" aria-label="关联能力">
            {chapter.skills.map((skillId) => {
              const skill = getSkill(skillId);
              return (
                <Link className="skill-badge" href={`/skills#${skillId}`} key={skillId}>
                  {skillId}
                  {skill ? ` · ${skill.title}` : ""}
                </Link>
              );
            })}
          </div>
          <div className="tag-row" aria-label="本章标签">
            {chapter.tags.map((tag) => <code key={tag}>{tag}</code>)}
          </div>
          {chapter.dependencies ? (
            <div className="dependency-row" aria-label="本章依赖">
              <span>依赖版本</span>
              {chapter.dependencies.map((dependency) => <code key={dependency}>{dependency}</code>)}
            </div>
          ) : null}
        </header>

        <div className="lesson-sections">
          {chapter.sections.map((section, index) => (
            <section id={section.id} key={section.id}>
              <div className="section-heading">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.title}</h2>
              </div>
              <ContentRenderer blocks={section.blocks} />
            </section>
          ))}
        </div>
      </article>
    </CourseApp>
  );
}
