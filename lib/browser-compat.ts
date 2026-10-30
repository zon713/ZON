declare global {
  interface Window {
    __HYM_BROWSER_COMPAT__?: {
      supported: boolean;
      capture(): void;
      ready(): void;
      fail(): void;
    };
  }
}

// A classic, synchronous ES5 script: importing a client polyfill is too late
// because vinext reads metadata before application components can mount.
export const browserCompatibilityScript = String.raw`(function (w, d) {
  if (w.__HYM_BROWSER_COMPAT__) return;
  if (typeof Object.hasOwn !== 'function') {
    Object.defineProperty(Object, 'hasOwn', {
      value: function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      },
      configurable: true,
      writable: true
    });
  }
  if (typeof w.queueMicrotask !== 'function' && typeof w.Promise === 'function') {
    w.queueMicrotask = function (callback) {
      if (typeof callback !== 'function') throw new TypeError('Expected a function');
      w.Promise.resolve().then(callback).catch(function (error) {
        w.setTimeout(function () { throw error; }, 0);
      });
    };
  }
  // Older Chromium exposes only the MediaQueryList listener API.
  if (typeof w.matchMedia === 'function') {
    var matchMedia = w.matchMedia;
    w.matchMedia = function (query) {
      var media = matchMedia.call(w, query);
      if (!media.addEventListener && media.addListener) {
        media.addEventListener = function (type, listener) {
          if (type === 'change') media.addListener(listener);
        };
        media.removeEventListener = function (type, listener) {
          if (type === 'change') media.removeListener(listener);
        };
      }
      return media;
    };
  }
  var snapshot;
  var observer;
  var active = true;
  var clinicCount = 0;
  var supported = typeof w.Symbol === 'function' && typeof w.Symbol.for === 'function' &&
    typeof w.Promise === 'function' && typeof w.Promise.allSettled === 'function' &&
    typeof w.Promise.prototype.finally === 'function' &&
    typeof String.prototype.replaceAll === 'function' &&
    typeof w.Map === 'function' && typeof w.Set === 'function' &&
    typeof w.WeakMap === 'function' && typeof w.URL === 'function' &&
    typeof w.URLSearchParams === 'function' && typeof w.fetch === 'function' &&
    typeof w.Headers === 'function' && typeof w.Request === 'function' &&
    typeof w.Response === 'function' && typeof w.AbortController === 'function' &&
    typeof w.TextEncoder === 'function' && typeof w.TextDecoder === 'function' &&
    typeof w.ReadableStream === 'function' &&
    typeof w.ReadableStream.prototype.tee === 'function';
  function stop() {
    active = false;
    if (observer) observer.disconnect();
    snapshot = null;
    w.removeEventListener('error', restore);
    w.removeEventListener('unhandledrejection', restore);
  }
  function restore() {
    if (!active || !snapshot) return;
    if (d.querySelector('main') && (!clinicCount || d.querySelector('.clinic-entry'))) return;
    var saved = snapshot;
    stop();
    if (d.body) d.body.innerHTML = saved.innerHTML;
    else d.documentElement.appendChild(saved);
  }
  w.__HYM_BROWSER_COMPAT__ = {
    supported: supported,
    capture: function () {
      if (!supported || snapshot || !d.body) return;
      snapshot = d.body.cloneNode(true);
      var scripts = snapshot.querySelectorAll('script');
      for (var i = 0; i < scripts.length; i++) scripts[i].parentNode.removeChild(scripts[i]);
      clinicCount = snapshot.querySelectorAll('.clinic-entry').length;
      if (typeof w.MutationObserver === 'function') {
        observer = new w.MutationObserver(restore);
        observer.observe(d.documentElement, { childList: true, subtree: true });
      }
      w.addEventListener('error', restore);
      w.addEventListener('unhandledrejection', restore);
    },
    ready: function () {
      // Let React finish the commit, including reporting fatal effect errors.
      w.setTimeout(function () { restore(); stop(); }, 0);
    },
    fail: restore
  };
})(window, document);`;
