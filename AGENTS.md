# Project Guidelines

1. Use Next.js App Router, React 19, and strict TypeScript.
2. Keep user-facing content in Chinese and code comments in English.
3. Preserve the three-column learning-workspace information architecture.
4. Do not call paid model providers in automated tests.
5. Run `npm run test:ci` before pushing milestone changes.
6. Use Chinese Conventional Commits and never commit secrets.
7. Follow [`docs/github-review-workflow.md`](docs/github-review-workflow.md) for branch, PR, CI, review, and merge decisions.
8. Milestone PRs get exactly one successful independent Claude review; fixes are verified by local gates and final CI without a second review.
9. Merge PRs with a merge commit. Do not squash, rebase, amend, or force push.
