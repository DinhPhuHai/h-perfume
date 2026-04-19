import { useEffect } from 'react';

/**
 * Attach IntersectionObserver to all .observe-reveal elements.
 * Call once in App or main layout.
 */
export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.observe-reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}
