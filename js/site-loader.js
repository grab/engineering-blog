(function () {
  'use strict';

  var STORAGE_KEY = 'grab-blog-loader-seen';
  var FADE_MS = 550;
  var MIN_HOLD_MS = 400;
  var REDUCED_MOTION_HOLD_MS = 350;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function shouldShowLoader() {
    return document.documentElement.classList.contains('is-loading');
  }

  function markLoaderSeen() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function waitForWindowLoad() {
    if (document.readyState === 'complete') {
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      window.addEventListener('load', resolve, { once: true });
    });
  }

  function getLogoDuration(loader) {
    var raw = loader.getAttribute('data-logo-duration');
    var seconds = Number(raw);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return 2.1;
    }
    return seconds;
  }

  function dismissLoader(loader, aurora) {
    loader.classList.add('is-dismissing');

    window.setTimeout(function () {
      if (aurora && typeof aurora.destroy === 'function') {
        aurora.destroy();
      }
      loader.classList.remove('is-dismissing');
      document.documentElement.classList.remove('is-loading');
      document.documentElement.classList.add('site-loader-skip');
      loader.setAttribute('aria-hidden', 'true');
    }, FADE_MS);
  }

  function init() {
    var loader = document.getElementById('site-loader');
    if (!loader || !shouldShowLoader()) {
      return;
    }

    var reducedMotion = prefersReducedMotion();
    var canvas = document.getElementById('site-loader-aurora');
    var aurora = null;
    var startedAt = performance.now();
    var logoDurationMs = getLogoDuration(loader) * 1000;

    loader.setAttribute('aria-hidden', 'false');

    var ready = Promise.all([
      waitForWindowLoad(),
      wait(Math.max(MIN_HOLD_MS, logoDurationMs))
    ]);

    if (!reducedMotion && canvas && window.FreedomAurora) {
      fetch('/freedom-aurora-settings.json', { credentials: 'same-origin' })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('freedom-aurora-settings.json unavailable');
          }
          return response.json();
        })
        .then(function (settings) {
          aurora = window.FreedomAurora.init(canvas, { settings: settings });
        })
        .catch(function () {
          aurora = window.FreedomAurora.init(canvas);
        });
    } else if (reducedMotion) {
      ready = Promise.all([
        waitForWindowLoad(),
        wait(REDUCED_MOTION_HOLD_MS)
      ]);
    }

    ready.then(function () {
      var elapsed = performance.now() - startedAt;
      var remaining = Math.max(0, logoDurationMs - elapsed);

      return wait(remaining).then(function () {
        markLoaderSeen();
        dismissLoader(loader, aurora);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
