import { describe, it, expect } from 'vitest';
import { panels } from '../panels';
import { questions, QUESTION_COUNT } from '../questions';

describe('fixed product invariants', () => {
  it('ships exactly 13 questions', () => {
    expect(questions).toHaveLength(13);
    expect(QUESTION_COUNT).toBe(13);
    expect(questions.length).toBe(QUESTION_COUNT);
  });

  it('maps one ordered question panel per question, then a Results panel', () => {
    const questionPanels = panels.slice(0, QUESTION_COUNT);
    const resultsPanel = panels[QUESTION_COUNT];

    expect(panels).toHaveLength(QUESTION_COUNT + 1);
    expect(questionPanels.map((panel) => panel.id)).toEqual(questions.map((question) => question.id));
    expect(resultsPanel.title).toBe('Results');
    expect(resultsPanel.id).toBe(QUESTION_COUNT + 1);
  });
});
