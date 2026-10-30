import { flushSync } from 'react-dom';

/** Native snapshots animate retained cards; other browsers update immediately. */
export function transitionUi(update: () => void) {
  if (
    typeof document === 'undefined' ||
    !document.startViewTransition ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('ui-filter-transition')
  ) {
    update();
    return;
  }
  document.documentElement.classList.add('ui-filter-transition');
  const transition = document.startViewTransition(() => flushSync(update));
  void transition.finished
    .catch(() => {})
    .finally(() => {
      document.documentElement.classList.remove('ui-filter-transition');
    });
}
