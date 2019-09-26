
import ResizeObserver from 'resize-observer-polyfill';
import { debounce } from 'debounce';
export const resize = {
  inserted(el, conds) {
    if (typeof process === 'undefined' ||!process.server) {
      const handleResize = debounce((entries) => {
        const cr = entries[0].contentRect;
        conds.value(cr);
      }, 200);

      const observer = new ResizeObserver(handleResize);
      observer.observe(el);
    }
  }
}
