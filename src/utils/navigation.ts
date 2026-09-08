export function clampQuestionIndex(index: number, questionCount: number): number {
  const maxIndex = questionCount - 1;
  return Math.max(0, Math.min(maxIndex, index));
}
