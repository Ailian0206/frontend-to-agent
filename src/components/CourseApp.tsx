"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CodeXml,
  ExternalLink,
  GraduationCap,
  Library,
  Link2,
  Menu,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  curricula,
  curriculumMeta,
  defaultCurriculumId,
  isCurriculumId,
} from "@/content/curricula";
import {
  filterChaptersByCurriculum,
  groupChaptersByKind,
  type ChapterSearchItem,
  type ChapterSummary,
} from "@/content/course-index";
import { getResource } from "@/content/resources";
import { siteOrigin } from "@/content/site";
import type { ContentKind, CurriculumId } from "@/content/types";

const progressKey = "frontend-to-agent:completed";
const progressEvent = "frontend-to-agent:progress";
const curriculumKey = "frontend-to-agent:curriculum";
const curriculumEvent = "frontend-to-agent:curriculum";
const mobileQuery = "(max-width: 760px)";

function readStoredCurriculum(): CurriculumId {
  if (typeof window === "undefined") return defaultCurriculumId;
  const stored = window.localStorage.getItem(curriculumKey);
  return stored && isCurriculumId(stored) ? stored : defaultCurriculumId;
}

function subscribeToCurriculum(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(curriculumEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(curriculumEvent, callback);
  };
}

function getCurriculumSnapshot(): string {
  return readStoredCurriculum();
}

function persistCurriculum(id: CurriculumId): void {
  window.localStorage.setItem(curriculumKey, id);
  window.dispatchEvent(new Event(curriculumEvent));
}

function kindExpandedKey(curriculum: CurriculumId): string {
  return `frontend-to-agent:kind-expanded:${curriculum}`;
}

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
  const router = useRouter();
  const progressSnapshot = useSyncExternalStore(subscribeToProgress, getProgressSnapshot, () => "[]");
  const isMobile = useSyncExternalStore(subscribeToMobile, getMobileSnapshot, () => false);
  const pathname = usePathname();
  const completed = useMemo(() => parseStoredProgress(progressSnapshot), [progressSnapshot]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState(activeChapter?.sections[0]?.id ?? "");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  // Prefer URL chapter ownership; shell pages read the last course from localStorage after hydrate.
  const storedCurriculum = useSyncExternalStore(
    subscribeToCurriculum,
    getCurriculumSnapshot,
    () => defaultCurriculumId,
  );
  const [expandedKinds, setExpandedKinds] = useState<ContentKind[]>(() =>
    activeChapter ? [activeChapter.kind] : ["lesson"],
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDialogRef = useRef<HTMLDivElement>(null);
  const searchReturnFocusRef = useRef<HTMLElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  const resourcesActive = pathname.startsWith("/resources");
  const skillsActive = pathname.startsWith("/skills");
  const graduateActive = pathname.startsWith("/graduate");
  const activeCurriculum =
    activeChapter?.curriculum ??
    (skillsActive || graduateActive
      ? defaultCurriculumId
      : isCurriculumId(storedCurriculum)
        ? storedCurriculum
        : defaultCurriculumId);
  const showAgentExtras = activeCurriculum === "agent";

  // Keep accordion open for the active chapter's kind without an effect setState.
  const [expandedForSlug, setExpandedForSlug] = useState(activeChapter?.slug ?? "");
  if (activeChapter && activeChapter.slug !== expandedForSlug) {
    setExpandedForSlug(activeChapter.slug);
    if (!expandedKinds.includes(activeChapter.kind)) {
      setExpandedKinds([...expandedKinds, activeChapter.kind]);
    }
  }

  const visibleChapters = useMemo(
    () => filterChaptersByCurriculum(chapters, activeCurriculum),
    [chapters, activeCurriculum],
  );
  const visibleSearchIndex = useMemo(
    () => filterChaptersByCurriculum(searchIndex, activeCurriculum),
    [searchIndex, activeCurriculum],
  );
  const activeMeta = curriculumMeta(activeCurriculum);

  const chapterIndex = activeChapter
    ? visibleChapters.findIndex((chapter) => chapter.slug === activeChapter.slug)
    : -1;
  const previousChapter = chapterIndex > 0 ? visibleChapters[chapterIndex - 1] : undefined;
  const nextChapter = chapterIndex >= 0 ? visibleChapters[chapterIndex + 1] : undefined;
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return normalized
      ? visibleSearchIndex.filter((chapter) => chapter.searchText.includes(normalized))
      : visibleSearchIndex;
  }, [query, visibleSearchIndex]);
  const completedInCurriculum = useMemo(
    () => completed.filter((slug) => visibleChapters.some((chapter) => chapter.slug === slug)),
    [completed, visibleChapters],
  );
  const progress = visibleChapters.length
    ? Math.round((completedInCurriculum.length / visibleChapters.length) * 100)
    : 0;
  const kindGroups = useMemo(() => groupChaptersByKind(visibleChapters), [visibleChapters]);
  const relatedResources = useMemo(
    () =>
      (activeChapter?.relatedResources ?? [])
        .map((id) => getResource(id))
        .filter((resource): resource is NonNullable<typeof resource> => Boolean(resource)),
    [activeChapter?.relatedResources],
  );

  useEffect(() => {
    if (!activeChapter) return;
    persistCurriculum(activeChapter.curriculum);
  }, [activeChapter]);

  useEffect(() => {
    window.localStorage.setItem(kindExpandedKey(activeCurriculum), JSON.stringify(expandedKinds));
  }, [activeCurriculum, expandedKinds]);

  function selectCurriculum(next: CurriculumId): void {
    persistCurriculum(next);
    setExpandedKinds(activeChapter?.curriculum === next && activeChapter ? [activeChapter.kind] : ["lesson"]);
    // Use activeCurriculum (not activeChapter) so shell pages like /skills don't force-navigate.
    if (activeCurriculum === next) return;
    const first = filterChaptersByCurriculum(chapters, next)[0];
    if (first) {
      router.push(chapterHref(first.slug));
      queueMicrotask(() => {
        setSearchOpen(false);
        setMobileNavOpen(false);
        setQuery("");
      });
    }
  }

  function toggleKind(kind: ContentKind): void {
    setExpandedKinds((current) =>
      current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind],
    );
  }

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
          <strong>{activeMeta.shortTitle}</strong>
          <span>
            {activeChapter
              ? `${String(chapterIndex + 1).padStart(2, "0")} / ${visibleChapters.length}`
              : skillsActive
                ? "能力地图"
                : graduateActive
                  ? "毕业验收"
                  : resourcesActive
                    ? "资源库"
                    : activeMeta.title}
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
          <div><strong>Frontend to Agent</strong><span>{activeMeta.title}</span></div>
          <button
            ref={mobileCloseButtonRef}
            className="icon-button nav-close"
            type="button"
            onClick={closeMobileNav}
            aria-label="关闭课程目录"
          ><X size={18} /></button>
        </div>

        <div className="curriculum-switcher" role="tablist" aria-label="选择课程">
          {curricula.map((item) => {
            const selected = item.id === activeCurriculum;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                className={selected ? "active" : ""}
                aria-selected={selected}
                onClick={() => selectCurriculum(item.id)}
              >
                {item.shortTitle}
              </button>
            );
          })}
        </div>

        <button className="search-trigger" type="button" onClick={openSearch} aria-label="搜索课程">
          <Search size={17} /><span>搜索当前课程</span><kbd>/</kbd>
        </button>

        <nav aria-label="课程章节">
          <p className="nav-label">按内容形态浏览</p>
          {kindGroups.length === 0 ? (
            <p className="nav-empty">本课程目录即将上线。</p>
          ) : (
            kindGroups.map((group) => {
              const expanded = expandedKinds.includes(group.kind);
              return (
                <div className={`kind-group ${expanded ? "expanded" : "collapsed"}`} key={group.kind}>
                  <button
                    type="button"
                    className="kind-toggle"
                    aria-expanded={expanded}
                    onClick={() => toggleKind(group.kind)}
                  >
                    <span className="kind-label">{group.label}</span>
                    <span className="kind-count">{group.chapters.length}</span>
                    <ChevronDown size={15} aria-hidden="true" />
                  </button>
                  {expanded ? (
                    <ol>
                      {group.chapters.map((chapter, index) => {
                        const active = Boolean(activeChapter && chapter.slug === activeChapter.slug);
                        const done = completed.includes(chapter.slug);
                        return (
                          <li key={chapter.slug}>
                            <Link
                              className={`${active ? "active" : ""}${chapter.comingSoon ? " coming-soon" : ""}`}
                              href={chapterHref(chapter.slug)}
                              aria-current={active ? "page" : undefined}
                              onClick={scheduleCloseOverlays}
                            >
                              <span className={`chapter-state ${done ? "done" : ""}`}>
                                {done ? <Check size={12} /> : String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="chapter-nav-title">
                                {chapter.shortTitle}
                                {chapter.comingSoon ? <em className="coming-soon-badge">即将</em> : null}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  ) : null}
                </div>
              );
            })
          )}
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
          <p>{completedInCurriculum.length} / {visibleChapters.length} 章已完成</p>
        </div>

        <div className="nav-actions">
          {showAgentExtras ? (
            <>
              <Link
                className={`github-link ${skillsActive ? "active" : ""}`}
                href="/skills"
                aria-current={skillsActive ? "page" : undefined}
                onClick={scheduleCloseOverlays}
              >
                <BookOpen size={17} />能力地图
              </Link>
              <Link
                className={`github-link ${graduateActive ? "active" : ""}`}
                href="/graduate"
                aria-current={graduateActive ? "page" : undefined}
                onClick={scheduleCloseOverlays}
              >
                <GraduationCap size={17} />毕业验收
              </Link>
            </>
          ) : null}
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
          <div className="outline-note"><BookOpen size={18} /><p>先运行代码，再勾选自检。左侧可切换课程，并收起 / 展开课程、实验、选修与作品集；进度按当前课程统计，只保存在本浏览器。</p></div>
        </aside>
      ) : (
        <aside className="lesson-outline">
          <div className="outline-note">
            <Library size={18} />
            <p>
              {skillsActive
                ? "这里是岗位能力地图。每条能力对应课程与 Lab；从左侧进入章节继续学习。"
                : graduateActive
                  ? "毕业验收清单：勾选 S1–S11 自检项，并沿链接复习课程与 Lab；作品集见 Capstone 与 examples/knowledge-agent。"
                  : "这里是公开资源库。从左侧进入任意章节继续学习；资源链接在新标签页打开原文。"}
            </p>
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
