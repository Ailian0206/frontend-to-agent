import { Clock3 } from "lucide-react";
import {
  chapterSearchIndex,
  chapterSummaries,
  summarizeChapter,
} from "@/content/course-index";
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
