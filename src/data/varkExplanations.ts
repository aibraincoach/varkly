import type { VarkStyle } from '../types';

export type ExplanationEntry = {
  description: string;
  tips: readonly [string, string, string, string];
};

/** COPY.md §17–§21, verbatim. */
export const VARK_EXPLANATIONS: Record<VarkStyle | 'B', ExplanationEntry> = {
  V: {
    description:
      "You process information best when it's presented visually. Charts, diagrams, and demonstrations help you understand and remember concepts more effectively.",
    tips: [
      'Use color-coding and highlighters in your notes',
      'Convert text information into diagrams, charts, and mindmaps',
      'Watch video demonstrations before attempting new tasks',
      'Use flashcards with images and visual cues',
    ],
  },
  A: {
    description:
      'You learn best through listening and verbal communication. Discussions, lectures, and talking through ideas help you process information effectively.',
    tips: [
      'Record lectures or read your notes aloud to review later',
      'Discuss concepts with others to solidify understanding',
      'Use mnemonic devices and rhymes to remember information',
      'Consider audiobooks or podcast learning materials',
    ],
  },
  R: {
    description:
      'You prefer information displayed as words. Reading and writing help you understand and remember concepts most effectively.',
    tips: [
      'Take detailed notes and rewrite them to enhance memory',
      'Convert diagrams and charts into written descriptions',
      'Create lists, headings, and organized notes',
      'Look for text-based resources rather than visual or interactive ones',
    ],
  },
  K: {
    description:
      'You learn through doing, experiencing, and hands-on activities. Physical involvement helps you understand and remember information.',
    tips: [
      'Use physical objects or models when possible',
      'Take breaks to move around while studying',
      'Apply concepts to real-world scenarios or case studies',
      'Create physical flashcards you can manipulate and arrange',
    ],
  },
  B: {
    description: 'You have a flexible learning style and can adapt to different teaching methods.',
    tips: [
      'Use a variety of learning techniques',
      'Adapt your approach based on the subject matter',
      'Take advantage of different resources available',
      'Share your learning flexibility with teachers and peers',
    ],
  },
};

/** COPY.md §16, multimodal state paragraph (bold markup removed). */
export const MULTIMODAL_DESCRIPTION =
  "You have a multimodal learning style with strengths across several categories. This means you're adaptable and can learn effectively through different methods.";

/** COPY.md §16, empty state. */
export const EMPTY_EXPLANATION_LINE = 'Complete more questions to see your results!';

export const STYLE_NAMES: Record<VarkStyle, string> = {
  V: 'Visual',
  A: 'Auditory',
  R: 'Read/Write',
  K: 'Kinesthetic',
};
