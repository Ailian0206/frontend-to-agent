"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  CodeXml,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { chapters, getChapter, searchChapters } from "@/content/chapters";
import { ContentRenderer } from "./ContentRenderer";

const progressKey = "frontend-to-agent:completed";
const progressEvent = "frontend-to-agent:progress";

function parseStoredProgress(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function getHashSnapshot(): string {
  const match = window.location.hash.match(/^#\/chapter\/([a-z-]+)$/);
  const slug = match?.[1];
  return slug && chapters.some((chapter) => chapter.slug === slug)
    ? slug
    : chapters[0].slug;
}

function subscribeToHash(callback: () => void): () => void {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function subscribeToProgress(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(progressEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(progressEvent, callback);
  };
}

function getProgressSnapshot(): string {
  return localStorage.getItem(progressKey) ?? "[]";
}

export function CourseApp() {
  const activeSlug = useSyncExternalStore(subscribeToHash, getHashSnapshot, () => chapters[0].slug);
  const progressSnapshot = useSyncExternalStore(subscribeToProgress, getProgressSnapshot, () => "[]");
  const completed = useMemo(() => parseStoredProgress(progressSnapshot), [progressSnapshot]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mainRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileNavOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const activeChapter = getChapter(activeSlug);
  const chapterIndex = chapters.findIndex((chapter) => chapter.slug === activeSlug);
  const previousChapter = chapters[chapterIndex - 1];
  const nextChapter = chapters[chapterIndex + 1];
  const results = useMemo(() => searchChapters(query), [query]);
  const progress = Math.round((completed.length / chapters.length) * 100);

  function navigate(slug: string): void {
    window.history.pushState(null, "", `#/chapter/${slug}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    setSearchOpen(false);
    setMobileNavOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleComplete(): void {
    const next = completed.includes(activeSlug)
      ? completed.filter((slug) => slug !== activeSlug)
      : [...completed, activeSlug];
    localStorage.setItem(progressKey, JSON.stringify(next));
    window.dispatchEvent(new Event(progressEvent));
  }

  return (
    <div className="course-app">
      <header className="mobile-header">
        <button
          className="icon-button"
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="打开课程目录"
          title="课程目录"
        >
          <Menu size={19} />
        </button>
        <div className="mobile-brand">
          <strong>Frontend → Agent</strong>
          <span>{String(activeChapter.number).padStart(2, "0")} / 11</span>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="搜索课程"
          title="搜索课程"
        >
          <Search size={18} />
        </button>
      </header>

      <aside className={`course-nav ${mobileNavOpen ? "open" : ""}`}>
        <div className="nav-brand">
          <div className="brand-mark" aria-hidden="true">
            <span>F</span>
            <ArrowRight size={13} />
            <span>A</span>
          </div>
          <div>
            <strong>Frontend to Agent</strong>
            <span>资深前端转型教程</span>
          </div>
          <button
            className="icon-button nav-close"
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="关闭课程目录"
          >
            <X size={18} />
          </button>
        </div>

        <button className="search-trigger" type="button" onClick={() => setSearchOpen(true)}>
          <Search size={17} />
          <span>搜索课程</span>
          <kbd>/</kbd>
        </button>

        <nav aria-label="课程章节">
          <p className="nav-label">课程目录</p>
          <ol>
            {chapters.map((chapter) => {
              const active = chapter.slug === activeSlug;
              const done = completed.includes(chapter.slug);
              return (
                <li key={chapter.slug}>
                  <button
                    type="button"
                    className={active ? "active" : ""}
                    onClick={() => navigate(chapter.slug)}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className={`chapter-state ${done ? "done" : ""}`}>
                      {done ? <Check size={12} /> : String(chapter.number).padStart(2, "0")}
                    </span>
                    <span>{chapter.shortTitle}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="nav-progress">
          <div>
            <span>学习进度</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track" aria-label={`已完成 ${completed.length} 章`}>
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
          <p>{completed.length} / {chapters.length} 章已完成</p>
        </div>

        <a
          className="github-link"
          href="https://github.com/Ailian0206/frontend-to-agent"
          target="_blank"
          rel="noreferrer"
        >
          <CodeXml size={17} />
          查看源码与完整示例
        </a>
      </aside>

      {mobileNavOpen ? (
        <button
          type="button"
          className="drawer-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-label="关闭课程目录"
        />
      ) : null}

      <main className="lesson-main" ref={mainRef}>
        <article>
          <header className="lesson-header">
            <div className="lesson-kicker">
              <span>{activeChapter.phase}</span>
              <span>{activeChapter.level}</span>
              <span><Clock3 size={14} />{activeChapter.duration}</span>
            </div>
            <p className="chapter-number">CHAPTER {String(activeChapter.number).padStart(2, "0")}</p>
            <h1>{activeChapter.title}</h1>
            <p className="lesson-goal">{activeChapter.goal}</p>
            {activeChapter.dependencies ? (
              <div className="dependency-row" aria-label="本章依赖">
                <span>依赖版本</span>
                {activeChapter.dependencies.map((dependency) => (
                  <code key={dependency}>{dependency}</code>
                ))}
              </div>
            ) : null}
          </header>

          <div className="lesson-sections">
            {activeChapter.sections.map((section, index) => (
              <section id={section.id} key={section.id}>
                <div className="section-heading">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h2>{section.title}</h2>
                </div>
                <ContentRenderer blocks={section.blocks} />
              </section>
            ))}
          </div>

          <footer className="lesson-footer">
            <button
              type="button"
              className={`complete-button ${completed.includes(activeSlug) ? "completed" : ""}`}
              onClick={toggleComplete}
            >
              <CheckCircle2 size={19} />
              {completed.includes(activeSlug) ? "本章已完成" : "标记本章完成"}
            </button>
            <div className="chapter-pagination">
              <button
                type="button"
                onClick={() => previousChapter && navigate(previousChapter.slug)}
                disabled={!previousChapter}
              >
                <ArrowLeft size={17} />
                上一章
              </button>
              <button
                type="button"
                onClick={() => nextChapter && navigate(nextChapter.slug)}
                disabled={!nextChapter}
              >
                下一章
                <ArrowRight size={17} />
              </button>
            </div>
          </footer>
        </article>
      </main>

      <aside className="lesson-outline">
        <div>
          <p className="outline-label">本章大纲</p>
          <nav aria-label="本章大纲">
            {activeChapter.sections.map((section, index) => (
              <button
                type="button"
                key={section.id}
                onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </button>
            ))}
          </nav>
        </div>
        <div className="term-index">
          <p className="outline-label">关键术语</p>
          <div>
            {activeChapter.terms.map((term) => <code key={term}>{term}</code>)}
          </div>
        </div>
        <div className="outline-note">
          <BookOpen size={18} />
          <p>先运行代码，再勾选自检。课程进度只保存在当前浏览器。</p>
        </div>
      </aside>

      {searchOpen ? (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="搜索课程">
          <button
            type="button"
            className="search-backdrop"
            onClick={() => setSearchOpen(false)}
            aria-label="关闭搜索"
          />
          <div className="search-dialog">
            <div className="search-input-row">
              <Search size={20} />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索 RAG、Tool Calling、部署……"
                aria-label="搜索关键词"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="关闭搜索">
                <X size={18} />
              </button>
            </div>
            <div className="search-results">
              {results.length ? results.map((chapter) => (
                <button type="button" key={chapter.slug} onClick={() => navigate(chapter.slug)}>
                  <span>{String(chapter.number).padStart(2, "0")}</span>
                  <div>
                    <strong>{chapter.shortTitle}</strong>
                    <p>{chapter.goal}</p>
                  </div>
                  <ArrowRight size={17} />
                </button>
              )) : (
                <div className="search-empty">
                  <Search size={22} />
                  <strong>没有匹配章节</strong>
                  <p>尝试搜索“记忆”“向量库”或“工作流”。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
