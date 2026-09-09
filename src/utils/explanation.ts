import type { ResultsExplanation, VarkStyle } from '../types';
import {
  EMPTY_EXPLANATION_LINE,
  MULTIMODAL_DESCRIPTION,
  STYLE_NAMES,
  VARK_EXPLANATIONS,
} from '../data/varkExplanations';

/**
 * Tip selection mirrors the 2026-09-09 design: four tips for one dominant style,
 * two from each for two, the balanced set for three or more.
 */
export function buildExplanation(dominant: VarkStyle[]): ResultsExplanation {
  if (dominant.length === 0) {
    return { title: 'Learning tips', description: null, tips: [EMPTY_EXPLANATION_LINE] };
  }

  if (dominant.length === 1) {
    const style = dominant[0];
    return {
      title: `Learning tips for ${STYLE_NAMES[style]} learners`,
      description: VARK_EXPLANATIONS[style].description,
      tips: [...VARK_EXPLANATIONS[style].tips],
    };
  }

  if (dominant.length === 2) {
    const [first, second] = dominant;
    return {
      title: 'Learning tips',
      description: MULTIMODAL_DESCRIPTION,
      tips: [
        VARK_EXPLANATIONS[first].tips[0],
        VARK_EXPLANATIONS[first].tips[1],
        VARK_EXPLANATIONS[second].tips[0],
        VARK_EXPLANATIONS[second].tips[1],
      ],
    };
  }

  return {
    title: 'Learning tips for balanced learners',
    description: MULTIMODAL_DESCRIPTION,
    tips: [...VARK_EXPLANATIONS.B.tips],
  };
}
