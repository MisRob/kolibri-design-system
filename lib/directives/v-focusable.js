// Applies tabindex=0, data-focus=true (see trackInputModality.js),
// Usage: put v-focusable on elements that are not focusable by default

export default {
  inserted(el) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('data-focus', 'true');
  },
};
