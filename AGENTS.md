# Project Guidelines

1. Use Next.js App Router, React 19, and strict TypeScript.
2. Keep user-facing content in Chinese and code comments in English.
3. Preserve the three-column learning-workspace information architecture.
4. Do not call paid model providers in automated tests.
5. Run `npm run test:ci` (and `npm run test:e2e` for UI paths) before pushing milestone changes.
6. Use Chinese Conventional Commits and never commit secrets.
7. Follow [`docs/github-review-workflow.md`](docs/github-review-workflow.md) for branch, PR, CI, review, and merge decisions. Align with sibling repos (`mcp-guardian`, `evidence-graph`): cost-first GitHub usage.
8. Large / milestone work must follow Superpowers: brainstorm → spec → plan → isolated worktree → implement → verify. Do not start coding a milestone from a blank chat.
9. Milestone PRs: open at most one at a time; Claude independent review runs **exactly once** per PR; fixes are verified by local gates and final CI without a second review.
10. Merge PRs with a merge commit. Do not squash, rebase, amend, or force push.
