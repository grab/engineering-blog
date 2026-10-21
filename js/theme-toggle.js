(function () {
  var STORAGE_KEY = 'grab-blog-theme';
  var DEFAULT_THEME = 'dark';
  var THEME_COLORS = {
    dark: '#001a0d',
    light: '#f5f4f1'
  };

  function getStoredTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch (error) {}
    return DEFAULT_THEME;
  }

  function applyTheme(theme) {
    var next = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;

    var meta = document.getElementById('meta-theme-color');
    if (meta) {
      meta.setAttribute('content', THEME_COLORS[next]);
    }

    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      var isLight = next === 'light';
      toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      toggle.setAttribute(
        'aria-label',
        isLight ? 'Switch to dark mode' : 'Switch to light mode'
      );
      toggle.setAttribute(
        'title',
        isLight ? 'Switch to dark mode' : 'Switch to light mode'
      );
    }
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {}
  }

  function init() {
    applyTheme(getStoredTheme());

    var toggle = document.getElementById('theme-toggle');
    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
      var next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      persistTheme(next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
