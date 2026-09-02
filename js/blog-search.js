(function () {
  'use strict';

  var DEBOUNCE_MS = 150;
  var MAX_TITLE_RESULTS = 10;

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function highlightMatches(text, positions) {
    if (!positions || positions.length === 0) {
      return escapeHtml(text);
    }

    var uniquePositions = Array.from(new Set(positions)).sort(function (a, b) {
      return a - b;
    });
    var result = '';
    var lastIndex = 0;

    uniquePositions.forEach(function (pos) {
      if (pos >= 0 && pos < text.length) {
        result += escapeHtml(text.substring(lastIndex, pos));
        result += '<span class="blog-search-match">' + escapeHtml(text[pos]) + '</span>';
        lastIndex = pos + 1;
      }
    });

    result += escapeHtml(text.substring(lastIndex));
    return result;
  }

  function getSearchableText(item) {
    var tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
    return [item.title, tags, item.excerpt || ''].join(' ');
  }

  var container = document.getElementById('blog-search-container');
  var trigger = document.getElementById('blog-search-trigger');
  var modal = document.getElementById('blog-search-modal');
  var input = document.getElementById('blog-search-input');
  var resultsEl = document.getElementById('blog-search-results');
  var form = document.getElementById('blog-search-form');
  var fullLink = document.getElementById('blog-search-full-link');
  var shortcutLabel = document.querySelector('[data-blog-search-shortcut]');

  if (!container || !trigger || !modal || !input || !resultsEl || !form || !fullLink || !window.blogSearchIndex) {
    return;
  }

  var fzfInstance = null;
  var highlightedIndex = -1;
  var debounceTimer = null;
  var currentMatches = [];
  var triggerFocus = null;

  function isMac() {
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  }

  function hideResults() {
    highlightedIndex = -1;
    currentMatches = [];
    resultsEl.innerHTML = '';
    fullLink.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }

  function updateFullLink(query) {
    if (query && query.trim()) {
      fullLink.href = '/search.html?q=' + encodeURIComponent(query.trim());
      fullLink.textContent = 'Search all articles for \u201c' + query.trim() + '\u201d';
      fullLink.hidden = false;
    } else {
      fullLink.hidden = true;
    }
  }

  function updateHighlight() {
    var links = resultsEl.querySelectorAll('.blog-search-result');
    links.forEach(function (link, index) {
      var isActive = index === highlightedIndex;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-selected', 'true');
        link.scrollIntoView({ block: 'nearest' });
      } else {
        link.removeAttribute('aria-selected');
      }
    });
  }

  function renderResults(query, matches) {
    currentMatches = matches.slice(0, MAX_TITLE_RESULTS);
    highlightedIndex = currentMatches.length ? 0 : -1;

    var trimmed = query.trim();
    updateFullLink(trimmed);

    if (!trimmed) {
      hideResults();
      return;
    }

    var html = '<p class="blog-search-dropdown-label">Matching titles</p>';

    if (!currentMatches.length) {
      html += '<p class="blog-search-empty">No title matches. Press Enter to search full article content.</p>';
    } else {
      html += '<ul class="blog-search-results-list">';
      currentMatches.forEach(function (match, index) {
        var item = match.item;
        var titleHtml = highlightMatches(item.title, match.positions);
        var activeClass = index === highlightedIndex ? ' is-active' : '';
        html += '<li>';
        html += '<a href="' + escapeHtml(item.url) + '" class="blog-search-result' + activeClass + '" role="option" data-index="' + index + '">';
        html += '<span class="blog-search-result-title">' + titleHtml + '</span>';
        var metaParts = '';
        var topic = item.category && item.category.indexOf(',') === -1 ? item.category : (item.tags && item.tags[0]);
        if (topic) {
          metaParts += '<span class="blog-search-result-category">' + escapeHtml(topic) + '</span>';
        }
        if (item.date) {
          metaParts += '<span class="blog-search-result-date">' + escapeHtml(item.date) + '</span>';
        }
        if (metaParts) {
          html += '<span class="blog-search-result-meta">' + metaParts + '</span>';
        }
        html += '</a>';
        html += '</li>';
      });
      html += '</ul>';
    }

    resultsEl.innerHTML = html;
    input.setAttribute('aria-expanded', 'true');
    updateHighlight();
  }

  function performTitleSearch(query) {
    if (!fzfInstance || !query.trim()) {
      hideResults();
      return;
    }

    renderResults(query, fzfInstance.find(query.trim()));
  }

  function scheduleSearch(query) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      performTitleSearch(query);
    }, DEBOUNCE_MS);
  }

  function followHighlightedResult() {
    if (highlightedIndex < 0 || highlightedIndex >= currentMatches.length) {
      return false;
    }

    window.location.href = currentMatches[highlightedIndex].item.url;
    return true;
  }

  function goToFullSearch() {
    var query = input.value.trim();
    if (query) {
      window.location.href = '/search.html?q=' + encodeURIComponent(query);
    }
  }

  function openModal() {
    modal.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    triggerFocus = document.activeElement;
    hideResults();

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (window.location.pathname.indexOf('/search.html') !== -1 && initialQuery) {
      input.value = initialQuery;
      scheduleSearch(initialQuery);
    } else {
      input.value = '';
    }

    input.focus();
  }

  function closeModal() {
    modal.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hideResults();
    if (triggerFocus && triggerFocus.focus) {
      triggerFocus.focus();
    }
  }

  function toggleModal() {
    if (modal.hidden) {
      openModal();
    } else {
      closeModal();
    }
  }

  function initFzf() {
    return import('https://esm.sh/fzf@0.5.2').then(function (fzfModule) {
      var Fzf = fzfModule.Fzf || fzfModule.default;
      fzfInstance = new Fzf(window.blogSearchIndex, {
        selector: getSearchableText,
        tiebreakers: [fzfModule.byStartAsc]
      });
    }).catch(function (error) {
      console.warn('Title search unavailable:', error);
    });
  }

  initFzf().then(function () {
    if (shortcutLabel) {
      shortcutLabel.textContent = isMac() ? '\u2318K' : 'Ctrl K';
    }
  });

  trigger.addEventListener('click', function () {
    toggleModal();
  });

  modal.addEventListener('click', function (event) {
    if (event.target === modal || event.target.hasAttribute('data-blog-search-close')) {
      closeModal();
    }
  });

  input.addEventListener('input', function (event) {
    scheduleSearch(event.target.value);
  });

  input.addEventListener('focus', function () {
    if (input.value.trim()) {
      scheduleSearch(input.value);
    }
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key === 'ArrowDown') {
      if (currentMatches.length) {
        event.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, currentMatches.length - 1);
        updateHighlight();
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      if (currentMatches.length) {
        event.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, 0);
        updateHighlight();
      }
      return;
    }

    if (event.key === 'Enter' && currentMatches.length && followHighlightedResult()) {
      event.preventDefault();
    }
  });

  form.addEventListener('submit', function (event) {
    if (currentMatches.length && followHighlightedResult()) {
      event.preventDefault();
      return;
    }

    if (input.value.trim()) {
      event.preventDefault();
      goToFullSearch();
    }
  });

  document.addEventListener('keydown', function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      toggleModal();
      return;
    }

    if (event.key === 'Escape' && !modal.hidden && document.activeElement !== input) {
      closeModal();
    }
  });
})();
