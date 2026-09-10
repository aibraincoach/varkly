import { describe, it, expect } from 'vitest';
import { buildExplanation } from '../explanation';
import { VARK_EXPLANATIONS, MULTIMODAL_DESCRIPTION, EMPTY_EXPLANATION_LINE } from '../../data/varkExplanations';

describe('buildExplanation', () => {
  it('empty: generic title, no description, the empty-state line as the only tip', () => {
    expect(buildExplanation([])).toEqual({
      title: 'Learning tips',
      description: null,
      tips: [EMPTY_EXPLANATION_LINE],
    });
  });

  it('one dominant style: that style description and all four tips', () => {
    expect(buildExplanation(['K'])).toEqual({
      title: 'Learning tips for Kinesthetic learners',
      description: VARK_EXPLANATIONS.K.description,
      tips: [...VARK_EXPLANATIONS.K.tips],
    });
  });

  it('two dominant styles: multimodal description and two tips from each, in VARK order', () => {
    expect(buildExplanation(['V', 'R'])).toEqual({
      title: 'Learning tips',
      description: MULTIMODAL_DESCRIPTION,
      tips: [
        VARK_EXPLANATIONS.V.tips[0],
        VARK_EXPLANATIONS.V.tips[1],
        VARK_EXPLANATIONS.R.tips[0],
        VARK_EXPLANATIONS.R.tips[1],
      ],
    });
  });

  it('three or more dominant styles: multimodal description and the balanced tips', () => {
    const three = buildExplanation(['V', 'A', 'K']);
    expect(three.title).toBe('Learning tips for balanced learners');
    expect(three.description).toBe(MULTIMODAL_DESCRIPTION);
    expect(three.tips).toEqual([...VARK_EXPLANATIONS.B.tips]);
    expect(buildExplanation(['V', 'A', 'R', 'K'])).toEqual(three);
  });
});
