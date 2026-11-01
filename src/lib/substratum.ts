export const CHECKPOINTS = [
  "tormentor1",
  "tormentor2",
  "conductorA",
  "conductorB",
] as const;
export type Checkpoint = (typeof CHECKPOINTS)[number];
export interface SubstratumProgress {
  completedCycles: number;
  marks: Readonly<Record<Checkpoint, boolean>>;
}

export function createSubstratumProgress(
  completedCycles = 0,
): SubstratumProgress {
  return {
    completedCycles,
    marks: {
      tormentor1: false,
      tormentor2: false,
      conductorA: false,
      conductorB: false,
    },
  };
}

export function canMark(
  progress: SubstratumProgress,
  checkpoint: Checkpoint | "bank",
): boolean {
  if (progress.completedCycles >= 3) {
    return false;
  }
  if (checkpoint === "bank") {
    return CHECKPOINTS.every((key) => progress.marks[key]);
  }
  if (progress.marks[checkpoint]) {
    return false;
  }
  return (
    checkpoint === "tormentor1" ||
    checkpoint === "tormentor2" ||
    (progress.marks.tormentor1 && progress.marks.tormentor2)
  );
}

export function markCheckpoint(
  progress: SubstratumProgress,
  checkpoint: Checkpoint | "bank",
): SubstratumProgress {
  if (!canMark(progress, checkpoint)) {
    return progress;
  }
  if (checkpoint === "bank") {
    return createSubstratumProgress(progress.completedCycles + 1);
  }
  return { ...progress, marks: { ...progress.marks, [checkpoint]: true } };
}
