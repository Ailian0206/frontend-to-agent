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
];
