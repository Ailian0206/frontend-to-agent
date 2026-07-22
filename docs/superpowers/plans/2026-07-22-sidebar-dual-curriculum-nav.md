# 侧栏双课程导航 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留三栏学习工作区的前提下，把左侧导航改成「顶层课程切换 + 内容大类可收展」，为后续「生产部署与运维入门」课程预留独立目录槽位。

**Architecture:** 新增 `CurriculumId`（`agent` | `production-ops`）与课程元数据；章节归属课程（默认 `agent`）；`CourseApp` 顶部用分段 Tab 切换课程，其下按 `kind` 手风琴收展列表。生产课尚无正文时显示空状态。进度与搜索范围限定在当前课程。

**Tech Stack:** Next.js App Router、React 19、TypeScript、Vitest、Playwright

---

### Task 1: 内容模型 — Curriculum

- [ ] 新增 `src/content/curricula.ts`（元数据、默认 ID、校验）
- [ ] `types.ts` / `course-index.ts` / `chapters/index.ts`：章节带 `curriculum`（装配默认 `agent`）
- [ ] 单元测试：全部现有章属 `agent`；`filterChaptersByCurriculum` / `groupChaptersByKind` 行为正确

### Task 2: CourseApp 侧栏 UI

- [ ] 顶部分段控件切换 Agent / 生产运维
- [ ] 大类（课程/实验/选修/作品集）手风琴；默认展开当前章所在大类
- [ ] 切换课程时：有章则跳转该课首章；无章则空状态；Agent 专属链（能力地图/毕业验收）仅 Agent 显示
- [ ] 进度与搜索过滤到当前课程

### Task 3: 样式与 e2e

- [ ] `globals.css`：课程 Tab、手风琴按钮样式
- [ ] e2e：双课程切换、大类折叠、Agent 目录仍可见

### Task 4: 门禁与里程碑 PR

- [ ] `GITHUB_PAGES=true npm run test:ci`
- [ ] PR → Claude 审一次 → merge commit
