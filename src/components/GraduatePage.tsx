"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { chapters } from "@/content/chapters";
import { chapterSearchIndex, chapterSummaries } from "@/content/course-index";
import { coreSkillIds, skillMap } from "@/content/skills";
import { CourseApp } from "./CourseApp";

const graduateSkillsKey = "frontend-to-agent:graduate-skills";
const graduateSkillsEvent = "frontend-to-agent:graduate-skills-change";

function parseStoredGraduateSkills(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function subscribeToGraduateSkills(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(graduateSkillsEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(graduateSkillsEvent, callback);
  };
}

function getGraduateSkillsSnapshot(): string {
  return localStorage.getItem(graduateSkillsKey) ?? "[]";
}

/** Graduation checklist: S1–S11 with proof, linked lessons, and local checkboxes. */
export function GraduatePage() {
  const skillsSnapshot = useSyncExternalStore(
    subscribeToGraduateSkills,
    getGraduateSkillsSnapshot,
    () => "[]",
  );
  const checked = useMemo(() => parseStoredGraduateSkills(skillsSnapshot), [skillsSnapshot]);
  const coreSkills = skillMap.filter((skill) => coreSkillIds.includes(skill.id));

  function toggleSkill(skillId: string): void {
    const next = checked.includes(skillId)
      ? checked.filter((id) => id !== skillId)
      : [...checked, skillId];
    localStorage.setItem(graduateSkillsKey, JSON.stringify(next));
    window.dispatchEvent(new Event(graduateSkillsEvent));
  }

  const progressLabel = `${checked.length} / ${coreSkills.length}`;

  return (
    <CourseApp chapters={chapterSummaries} searchIndex={chapterSearchIndex}>
      <article className="graduate-page skills-page">
        <header className="lesson-header">
          <div className="lesson-kicker">
            <span>毕业验收</span>
            <span>S1–S11</span>
          </div>
          <h1>毕业验收</h1>
          <p className="lesson-goal">
            对照主线能力自检：能讲清 proof、完成关联课程与 Lab，并在作品集里演示。勾选仅保存在当前浏览器（
            <code>{graduateSkillsKey}</code>）。
          </p>
          <p className="graduate-progress" aria-live="polite">
            已勾选 <strong>{progressLabel}</strong> 项能力
          </p>
        </header>

        <section className="graduate-capstone" aria-labelledby="graduate-capstone-heading">
          <h2 id="graduate-capstone-heading">作品集与 Capstone</h2>
          <p>
            最终交付以{" "}
            <Link href="/chapter/capstone">最终实战项目（Capstone）</Link> 为规格；可运行参考实现位于仓库{" "}
            <code>examples/knowledge-agent</code>（HITL 确认、离线评估、演示路径与护栏）。
          </p>
        </section>

        <section aria-labelledby="graduate-skills-heading">
          <h2 id="graduate-skills-heading">主线能力清单（S1–S11）</h2>
          {coreSkills.map((skill) => {
            const linked = chapters.filter((chapter) => chapter.skills.includes(skill.id));
            const isChecked = checked.includes(skill.id);
            return (
              <div className="skill-card graduate-skill-card" id={skill.id} key={skill.id}>
                <label className="graduate-skill-check">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSkill(skill.id)}
                    aria-describedby={`${skill.id}-proof`}
                  />
                  <span className="graduate-skill-title">
                    {skill.id} · {skill.title}
                  </span>
                </label>
                <p id={`${skill.id}-proof`}>{skill.proof}</p>
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
