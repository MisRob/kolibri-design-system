/**
 * This script is being called as part of KDS installation process.
 * It attaches global DOM elements provided by KDS to the Vue app's
 * root element.
 */

import useKLiveRegion from './composables/useKLiveRegion';

export default function initializeDom(appRootEl) {
  const { _mountLiveRegion } = useKLiveRegion();
  _mountLiveRegion(appRootEl);
}
