import { useEffect } from 'react';
import { APP } from '../constants/app';

const DEFAULT_TITLE = `${APP.name} — ${APP.tagline}`;
const DEFAULT_DESCRIPTION =
  'Take the 90-second VARK quiz and get a personalized prompt that makes ChatGPT, Claude, or any AI adapt to how your brain actually works.';

/**
 * Sets document title, meta description, and Open Graph title/description for the current page.
 * Call once per route in the main page component.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${APP.name}` : DEFAULT_TITLE;
    document.title = fullTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');

    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }
    if (ogDescription && description) {
      ogDescription.setAttribute('content', description);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      if (metaDescription) {
        metaDescription.setAttribute('content', DEFAULT_DESCRIPTION);
      }
      if (ogTitle) {
        ogTitle.setAttribute('content', DEFAULT_TITLE);
      }
      if (ogDescription) {
        ogDescription.setAttribute('content', DEFAULT_DESCRIPTION);
      }
    };
  }, [title, description]);
}
