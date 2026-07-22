"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CodeXml,
  ExternalLink,
  Library,
  Link2,
  Menu,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  groupChaptersByTrack,
  type ChapterSearchItem,
  type ChapterSummary,
} from "@/content/course-index";
import { getResource } from "@/content/resources";
import { siteOrigin } from "@/content/site";

const progressKey = "frontend-to-agent:completed";
const progressEvent = "frontend-to-agent:progress";
const mobileQuery = "(max-width: 760px)";

function parseStoredProgress(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
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

function subscribeToMobile(callback: () => void): () => void {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getMobileSnapshot(): boolean {
  return window.matchMedia(mobileQuery).matches;
}

function chapterHref(slug: string): string {
  return `/chapter/${slug}`;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

interface CourseAppProps {
  /** Omit on shell pages like /resources so chapter chrome stays inactive. */
  activeChapter?: ChapterSummary;
  chapters: ChapterSummary[];
  searchIndex: ChapterSearchItem[];
  children: ReactNode;
}

export function CourseApp({
  activeChapter,
  chapters,
  searchIndex,
  children,
}: CourseAppProps) {
  const progressSnapshot = useSyncExternalStore(subscribeToProgress, getProgressSnapshot, () => "[]");
  const isMobile = useSyncExternalStore(subscribeToMobile, getMobileSnapshot, () => false);
  const pathname = usePathname();
  const completed = useMemo(() => parseStoredProgress(progressSnapshot), [progressSnapshot]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState(activeChapter?.sections[0]?.id ?? "");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDialogRef = useRef<HTMLDivElement>(null);
  const searchReturnFocusRef = useRef<HTMLElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  const chapterIndex = activeChapter
    ? chapters.findIndex((chapter) => chapter.slug === activeChapter.slug)
    : -1;
  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : undefined;
  const nextChapter = chapterIndex >= 0 ? chapters[chapterIndex + 1] : undefined;
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return normalized
      ? searchIndex.filter((chapter) => chapter.searchText.includes(normalized))
      : searchIndex;
  }, [query, searchIndex]);
  const progress = Math.round((completed.length / chapters.length) * 100);
  const trackGroups = useMemo(() => groupChaptersByTrack(chapters), [chapters]);
  const relatedResources = useMemo(
    () =>
      (activeChapter?.relatedResources ?? [])
        .map((id) => getResource(id))
        .filter((resource): resource is NonNullable<typeof resource> => Boolean(resource)),
    [activeChapter?.relatedResources],
  );
  const resourcesActive = pathname.startsWith("/resources");

  // Close overlays after the router has accepted navigation (do not sync-close in click handlers).
  function scheduleCloseOverlays(): void {
    queueMicrotask(() => {
      setSearchOpen(false);
      setMobileNavOpen(false);
      setQuery("");
    });
  }

  async function copyChapterLink(): Promise<void> {
    if (!activeChapter) return;
    const url = `${siteOrigin}/chapter/${activeChapter.slug}/`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 1600);
    } catch {
      setShareStatus("failed");
      window.setTimeout(() => setShareStatus("idle"), 2200);
    }
  }

  useEffect(() => {
    if (!activeChapter) return;
    const sections = activeChapter.sections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.2, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [activeChapter]);

  useEffect(() => {
    if (!searchOpen && !mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [searchOpen, mobileNavOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const returnFocus = searchReturnFocusRef.current;
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus());

    function trapFocus(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setSearchOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = searchDialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", trapFocus);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trapFocus);
      requestAnimationFrame(() => returnFocus?.focus());
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const frame = requestAnimationFrame(() => mobileCloseButtonRef.current?.focus());
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    function openSearchShortcut(event: KeyboardEvent) {
      if (event.key === "/" && !isEditableTarget(event.target) && !searchOpen) {
        event.preventDefault();
        searchReturnFocusRef.current = document.activeElement as HTMLElement | null;
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", openSearchShortcut);
    return () => document.removeEventListener("keydown", openSearchShortcut);
  }, [searchOpen]);

  function openSearch(): void {
    searchReturnFocusRef.current = document.activeElement as HTMLElement | null;
    setSearchOpen(true);
  }

  function closeMobileNav(): void {
    setMobileNavOpen(false);
    requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
  }

  function toggleComplete(): void {
    if (!activeChapter) return;
    const next = completed.includes(activeChapter.slug)
      ? completed.filter((slug) => slug !== activeChapter.slug)
      : [...completed, activeChapter.slug];
    localStorage.setItem(progressKey, JSON.stringify(next));
    window.dispatchEvent(new Event(progressEvent));
  }

  const shareLabel =
    shareStatus === "copied" ? "链接已复制" : shareStatus === "failed" ? "复制失败" : "复制本章链接";

  return (
    <div className="course-app">
      <header className="mobile-header">
        <button
          ref={mobileMenuButtonRef}
          className="icon-button"
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="打开课程目录"
          title="课程目录"
        ><Menu size={19} /></button>
        <div className="mobile-brand">
          <strong>Frontend → Agent</strong>
          <span>
            {activeChapter
              ? `${String(activeChapter.number).padStart(2, "0")} / ${chapters.length}`
              : "资源库"}
          </span>
        </div>
        <button className="icon-button" type="button" onClick={openSearch} aria-label="搜索课程" title="搜索课程">
          <Search size={18} />
        </button>
      </header>

      <aside
        className={`course-nav ${mobileNavOpen ? "open" : ""}`}
        inert={isMobile && !mobileNavOpen ? true : undefined}
      >
        <div className="nav-brand">
          <div className="brand-mark" aria-hidden="true"><span>F</span><ArrowRight size={13} /><span>A</span></div>
          <div><strong>Frontend to Agent</strong><span>资深前端转型教程</span></div>
          <button
            ref={mobileCloseButtonRef}
            className="icon-button nav-close"
            type="button"
            onClick={closeMobileNav}
            aria-label="关闭课程目录"
          ><X size={18} /></button>
        </div>

        <button className="search-trigger" type="button" onClick={openSearch}>
          <Search size={17} /><span>搜索课程</span><kbd>/</kbd>
        </button>

        <nav aria-label="课程章节">
          <p className="nav-label">按轨道浏览</p>
          {trackGroups.map((group) => (
            <div className="track-group" key={group.track}>
              <p className="track-label" title={group.summary}>{group.track}</p>
              <ol>
                {group.chapters.map((chapter) => {
                  const active = Boolean(activeChapter && chapter.slug === activeChapter.slug);
                  const done = completed.includes(chapter.slug);
                  return (
                    <li key={chapter.slug}>
                      <Link
                        className={active ? "active" : ""}
                        href={chapterHref(chapter.slug)}
                        aria-current={active ? "page" : undefined}
                        onClick={scheduleCloseOverlays}
                      >
                        <span className={`chapter-state ${done ? "done" : ""}`}>
                          {done ? <Check size={12} /> : String(chapter.number).padStart(2, "0")}
                        </span>
                        <span>{chapter.shortTitle}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </nav>

        <div className="nav-progress">
          <div><span>学习进度</span><strong>{progress}%</strong></div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="课程学习进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          ><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
          <p>{completed.length} / {chapters.length} 章已完成</p>
        </div>

        <div className="nav-actions">
          <Link
            className={`github-link ${resourcesActive ? "active" : ""}`}
            href="/resources"
            aria-current={resourcesActive ? "page" : undefined}
            onClick={scheduleCloseOverlays}
          >
            <Library size={17} />公开资源库
          </Link>
          <a className="github-link" href="https://github.com/Ailian0206/frontend-to-agent" target="_blank" rel="noreferrer">
            <CodeXml size={17} />查看源码与完整示例
          </a>
        </div>
      </aside>

      {mobileNavOpen ? <button type="button" className="drawer-backdrop" onClick={closeMobileNav} aria-label="关闭课程目录" /> : null}

      <main className="lesson-main">
        {children}
        {activeChapter ? (
          <footer className="lesson-footer">
            <div className="footer-actions">
              <button
                type="button"
                className={`complete-button ${completed.includes(activeChapter.slug) ? "completed" : ""}`}
                onClick={toggleComplete}
              ><CheckCircle2 size={19} />{completed.includes(activeChapter.slug) ? "本章已完成" : "标记本章完成"}</button>
              <button type="button" className="share-button" onClick={copyChapterLink}>
                <Link2 size={17} />{shareLabel}
              </button>
            </div>
            <div className="chapter-pagination">
              {previousChapter ? (
                <Link href={chapterHref(previousChapter.slug)} onClick={scheduleCloseOverlays}>
                  <ArrowLeft size={17} />上一章
                </Link>
              ) : <span aria-hidden="true" />}
              {nextChapter ? (
                <Link href={chapterHref(nextChapter.slug)} onClick={scheduleCloseOverlays}>
                  下一章<ArrowRight size={17} />
                </Link>
              ) : <span aria-hidden="true" />}
            </div>
          </footer>
        ) : null}
      </main>

      {activeChapter ? (
        <aside className="lesson-outline">
          <div>
            <p className="outline-label">本章大纲</p>
            <nav aria-label="本章大纲">
              {activeChapter.sections.map((section, index) => (
                <button
                  type="button"
                  className={activeSection === section.id ? "active" : ""}
                  key={section.id}
                  onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })}
                ><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</button>
              ))}
            </nav>
          </div>
          <div className="term-index">
            <p className="outline-label">学习轨道</p>
            <div><code>{activeChapter.track}</code></div>
          </div>
          <div className="term-index">
            <p className="outline-label">标签</p>
            <div>{activeChapter.tags.map((tag) => <code key={tag}>{tag}</code>)}</div>
          </div>
          <div className="term-index">
            <p className="outline-label">关键术语</p>
            <div>{activeChapter.terms.map((term) => <code key={term}>{term}</code>)}</div>
          </div>
          {relatedResources.length ? (
            <div className="term-index related-resources">
              <p className="outline-label">相关公开资源</p>
              <ul>
                {relatedResources.map((resource) => (
                  <li key={resource.id}>
                    <a href={resource.url} target="_blank" rel="noreferrer">
                      <span>{resource.title}</span>
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="outline-note"><BookOpen size={18} /><p>先运行代码，再勾选自检。可用左侧轨道分类跳转，进度只保存在当前浏览器。</p></div>
        </aside>
      ) : (
        <aside className="lesson-outline">
          <div className="outline-note">
            <Library size={18} />
            <p>这里是公开资源库。从左侧进入任意章节继续学习；资源链接在新标签页打开原文。</p>
          </div>
        </aside>
      )}

      {searchOpen ? (
        <div className="search-overlay">
          <div className="search-backdrop" onMouseDown={() => setSearchOpen(false)} aria-hidden="true" />
          <div
            className="search-dialog"
            ref={searchDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="搜索课程"
          >
            <div className="search-input-row">
              <Search size={20} />
              <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索正文、代码、MCP、HITL……" aria-label="搜索关键词" />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="关闭搜索"><X size={18} /></button>
            </div>
            <div className="search-results">
              {results.length ? results.map((chapter) => (
                <Link href={chapterHref(chapter.slug)} key={chapter.slug} onClick={scheduleCloseOverlays}>
                  <span>{String(chapter.number).padStart(2, "0")}</span>
                  <div>
                    <strong>{chapter.shortTitle}</strong>
                    <p>{chapter.track} · {chapter.goal}</p>
                  </div>
                  <ArrowRight size={17} />
                </Link>
              )) : (
                <div className="search-empty"><Search size={22} /><strong>没有匹配章节</strong><p>尝试搜索“记忆”“向量库”或“工作流”。</p></div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
