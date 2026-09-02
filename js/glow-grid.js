(function () {
  'use strict';

  var DEFAULTS = {
    background: '#002E27',
    intensity: 86,
    sweepWidth: 46,
    followTime: 0.42,
    borderWidth: 2,
    durationSeconds: 8,
    gridCell: 28,
    gridColor: 'rgba(0, 177, 79, 0.12)',
    glowColor: 'rgba(0, 255, 140, 1)',
    borderGlow: 'rgba(0, 177, 79, 0.85)'
  };

  var instances = [];
  var rafId = null;
  var startTime = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var resizeObserver = null;
  var intersectionObserver = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function parseSettings(raw) {
    if (!raw || !raw.values) {
      return DEFAULTS;
    }

    var values = raw.values;
    var timeline = raw.timeline || {};

    return {
      background: values['appearance.background'] || DEFAULTS.background,
      intensity: Number(values['signal.intensity']) || DEFAULTS.intensity,
      sweepWidth: Number(values['signal.sweepWidth']) || DEFAULTS.sweepWidth,
      followTime: clamp(Number(values['signal.followTime']) || DEFAULTS.followTime, 0.05, 1),
      borderWidth: Number(values['signal.borderWidth']) || DEFAULTS.borderWidth,
      durationSeconds: Number(timeline.durationSeconds) || DEFAULTS.durationSeconds
    };
  }

  function isElementVisible(el) {
    if (!el || el.hidden) {
      return false;
    }

    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function drawGrid(ctx, width, height) {
    var cell = DEFAULTS.gridCell;
    ctx.strokeStyle = DEFAULTS.gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (var x = 0; x <= width; x += cell) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }

    for (var y = 0; y <= height; y += cell) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }

    ctx.stroke();
  }

  function drawSweep(ctx, width, height, progress, settings) {
    var sweepNorm = settings.sweepWidth / 100;
    var band = Math.max(width, height) * sweepNorm;
    var travel = width + height + band;
    var center = progress * travel - band * 0.5;
    var intensity = settings.intensity / 100;

    var gradient = ctx.createLinearGradient(center - band, 0, center + band, height);
    gradient.addColorStop(0, 'rgba(0, 177, 79, 0)');
    gradient.addColorStop(0.45, 'rgba(0, 177, 79, ' + (0.08 * intensity) + ')');
    gradient.addColorStop(0.5, 'rgba(0, 255, 140, ' + (0.55 * intensity) + ')');
    gradient.addColorStop(0.55, 'rgba(0, 177, 79, ' + (0.08 * intensity) + ')');
    gradient.addColorStop(1, 'rgba(0, 177, 79, 0)');

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 255, 140, ' + (0.35 * intensity) + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(center - band * 0.5, height);
    ctx.lineTo(center + band * 0.5, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawBorderGlow(ctx, width, height, progress, settings) {
    // Border animation is handled by CSS (.post-card-glow-border).
    // Keep a soft inner vignette so the grid meets the card edge cleanly.
    var intensity = settings.intensity / 100;
    var inset = settings.borderWidth + 1;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 177, 79, ' + (0.08 + intensity * 0.06) + ')';
    ctx.lineWidth = 1;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
    ctx.restore();
  }

  function resizeInstance(instance) {
    var card = instance.card;
    var container = instance.container;
    var canvas = instance.canvas;

    if (!isElementVisible(card)) {
      instance.width = 0;
      instance.height = 0;
      instance.ready = false;
      return;
    }

    var rect = card.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var width = Math.max(1, Math.round(rect.width));
    var height = Math.max(1, Math.round(rect.height));

    if (width === instance.width && height === instance.height && instance.ready) {
      return;
    }

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    instance.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    instance.width = width;
    instance.height = height;
    instance.ready = width > 8 && height > 8;
  }

  function drawInstance(instance, progress) {
    if (!instance.ready) {
      return;
    }

    var ctx = instance.ctx;
    var width = instance.width;
    var height = instance.height;
    var settings = instance.settings;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = settings.background;
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    drawSweep(ctx, width, height, progress, settings);
    drawBorderGlow(ctx, width, height, progress, settings);
  }

  function tick(timestamp) {
    if (startTime === null) {
      startTime = timestamp;
    }

    instances.forEach(function (instance) {
      if (!instance.isIntersecting || !instance.ready) {
        return;
      }

      var duration = instance.settings.durationSeconds * 1000;
      var elapsed = (timestamp - startTime + (instance.phaseOffset || 0)) % duration;
      var linear = elapsed / duration;
      var eased = lerp(instance.smoothedProgress, linear, instance.settings.followTime);
      instance.smoothedProgress = eased;
      drawInstance(instance, eased);
    });

    rafId = window.requestAnimationFrame(tick);
  }

  function startLoop() {
    if (rafId !== null || instances.length === 0 || reduceMotion) {
      return;
    }
    rafId = window.requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
      startTime = null;
    }
  }

  function createInstance(container, settings, index) {
    var card = container.closest('.post-card');
    var canvas = document.createElement('canvas');
    canvas.className = 'glow-grid-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    var instance = {
      container: container,
      card: card,
      canvas: canvas,
      ctx: canvas.getContext('2d'),
      settings: settings,
      smoothedProgress: 0,
      phaseOffset: index * 120,
      width: 0,
      height: 0,
      ready: false,
      isIntersecting: false
    };

    resizeInstance(instance);

    if (reduceMotion && instance.ready) {
      drawInstance(instance, 0.35);
    }

    return instance;
  }

  function refreshAll() {
    instances.forEach(resizeInstance);

    if (intersectionObserver) {
      instances.forEach(function (instance) {
        intersectionObserver.observe(instance.card);
      });
    }
  }

  function init() {
    var configEl = document.getElementById('glow-grid-settings');
    var settings = parseSettings(configEl ? JSON.parse(configEl.textContent) : null);
    var containers = document.querySelectorAll('[data-glow-grid]');

    if (!containers.length) {
      return;
    }

    document.documentElement.style.setProperty('--glow-grid-border', settings.borderWidth + 'px');
    document.documentElement.style.setProperty('--glow-grid-duration', settings.durationSeconds + 's');

    containers.forEach(function (container, index) {
      var card = container.closest('.post-card');

      if (card) {
        card.style.setProperty('--glow-delay', (-index * 0.65) + 's');
      }

      instances.push(createInstance(container, settings, index));
    });

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(function () {
        refreshAll();
      });

      instances.forEach(function (instance) {
        resizeObserver.observe(instance.card);
      });
    }

    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var match = instances.find(function (instance) {
            return instance.card === entry.target;
          });

          if (match) {
            match.isIntersecting = entry.isIntersecting && isElementVisible(match.card);

            if (match.isIntersecting) {
              resizeInstance(match);
            }
          }
        });
      }, { root: null, rootMargin: '80px', threshold: 0.01 });

      instances.forEach(function (instance) {
        intersectionObserver.observe(instance.card);
      });
    } else {
      instances.forEach(function (instance) {
        instance.isIntersecting = isElementVisible(instance.card);
      });
    }

    window.addEventListener('resize', refreshAll);

    var filterView = document.getElementById('home-filter-view');
    if (filterView && typeof MutationObserver !== 'undefined') {
      var filterObserver = new MutationObserver(function () {
        window.requestAnimationFrame(refreshAll);
      });

      filterObserver.observe(filterView, { attributes: true, attributeFilter: ['hidden'] });
      filterObserver.observe(filterView, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
    }

    window.GlowGrid = { refresh: refreshAll };

    window.requestAnimationFrame(function () {
      refreshAll();

      window.requestAnimationFrame(function () {
        refreshAll();
        startLoop();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopLoop();
    } else if (!reduceMotion && instances.length) {
      refreshAll();
      startLoop();
    }
  });
})();
