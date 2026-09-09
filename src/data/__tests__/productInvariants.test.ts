import { describe, it, expect } from 'vitest';
import { panels } from '../panels';
import { questions, QUESTION_COUNT } from '../questions';

describe('fixed product invariants', () => {
  it('declares 13 questions in product metadata', () => {
    expect(QUESTION_COUNT).toBe(13);
  });

  it('matches declared metadata to the questions dataset', () => {
    expect(questions.length).toBe(QUESTION_COUNT);
    expect(questions).toHaveLength(13);
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
