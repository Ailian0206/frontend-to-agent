import type { Chapter } from "../../types";
import {
  productionInspectionRhythmChapter,
  productionOpsIntroChapter,
} from "./overview";
import {
  vercelCoreOperationsChapter,
  vercelReleaseObservabilityChapter,
} from "./vercel";

export const productionOpsChapters: Omit<Chapter, "number">[] = [
  productionOpsIntroChapter,
  productionInspectionRhythmChapter,
  vercelCoreOperationsChapter,
  vercelReleaseObservabilityChapter,
];
