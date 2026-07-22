import type { Chapter } from "../../types";
import {
  productionInspectionRhythmChapter,
  productionOpsIntroChapter,
} from "./overview";
import {
  supabaseAuthRlsRecoveryChapter,
  supabaseDatabaseMigrationsChapter,
} from "./supabase";
import {
  inngestEventsFunctionsRunsChapter,
  inngestRetriesConcurrencyCostChapter,
} from "./inngest";
import {
  sentryIssuesReleasesSourcemapsChapter,
  sentryTracesAlertsPrivacyChapter,
} from "./sentry";
import {
  vercelCoreOperationsChapter,
  vercelReleaseObservabilityChapter,
} from "./vercel";

export const productionOpsChapters: Omit<Chapter, "number">[] = [
  productionOpsIntroChapter,
  productionInspectionRhythmChapter,
  vercelCoreOperationsChapter,
  vercelReleaseObservabilityChapter,
  supabaseDatabaseMigrationsChapter,
  supabaseAuthRlsRecoveryChapter,
  inngestEventsFunctionsRunsChapter,
  inngestRetriesConcurrencyCostChapter,
  sentryIssuesReleasesSourcemapsChapter,
  sentryTracesAlertsPrivacyChapter,
];
