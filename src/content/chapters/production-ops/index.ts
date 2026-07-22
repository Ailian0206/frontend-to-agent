import type { Chapter } from "../../types";
import {
  productionInspectionRhythmChapter,
  productionOpsIntroChapter,
} from "./overview";

export const productionOpsChapters: Omit<Chapter, "number">[] = [
  productionOpsIntroChapter,
  productionInspectionRhythmChapter,
];
