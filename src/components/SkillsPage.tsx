"use client";

import Link from "next/link";
import { chapters } from "@/content/chapters";
import { chapterSearchIndex, chapterSummaries } from "@/content/course-index";
import { skillMap } from "@/content/skills";
import { CourseApp } from "./CourseApp";

/** Job-ready skill map page: each skill lists linked lessons / labs. */
export function SkillsPage() {
  const core = skillMap.filter((skill) => skill.group === "core");
  const elective = skillMap.filter((skill) => skill.group === "elective");

  return (
    <CourseApp chapters={chapterSummaries} searchIndex={chapterSearchIndex}>
      <article className="skills-page">
        <header className="lesson-header">
          <div className="lesson-kicker">
            <span>岗位能力</span>
            <span>S1–S11 / E1–E5</span>
          </div>
          <h1>能力地图</h1>
          <p className="lesson-goal">
            对照 JD 主线能力与选修加分项。每条能力绑定本站课程与 Lab（占位条目会标注「即将」）。
          </p>
        </header>

        <section aria-labelledby="core-skills-heading">
          <h2 id="core-skills-heading">主线能力（毕业必过）</h2>
          {core.map((skill) => {
            const linked = chapters.filter((chapter) => chapter.skills.includes(skill.id));
            return (
              <div className="skill-card" id={skill.id} key={skill.id}>
                <h2>
                  {skill.id} · {skill.title}
                </h2>
                <p>{skill.proof}</p>
                <div className="skill-links" aria-label={`${skill.id} 关联内容`}>
                  {linked.map((chapter) => (
                    <Link href={`/chapter/${chapter.slug}`} key={chapter.slug}>
                      {chapter.shortTitle}
                      {chapter.comingSoon ? "（即将）" : ""}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section aria-labelledby="elective-skills-heading">
          <h2 id="elective-skills-heading">选修能力（平台向）</h2>
          {elective.map((skill) => {
            const linked = chapters.filter((chapter) => chapter.skills.includes(skill.id));
            return (
              <div className="skill-card" id={skill.id} key={skill.id}>
                <h2>
                  {skill.id} · {skill.title}
                </h2>
                <p>{skill.proof}</p>
                <div className="skill-links" aria-label={`${skill.id} 关联内容`}>
                  {linked.map((chapter) => (
                    <Link href={`/chapter/${chapter.slug}`} key={chapter.slug}>
                      {chapter.shortTitle}
                      {chapter.comingSoon ? "（即将）" : ""}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </article>
    </CourseApp>
  );
}
