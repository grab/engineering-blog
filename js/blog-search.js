(function () {
  'use strict';

  var DEBOUNCE_MS = 150;
  var MAX_TITLE_RESULTS = 8;

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

  function formatTags(tags) {
    if (!tags || !tags.length) {
      return '';
    }

    return tags.slice(0, 3).map(function (tag) {
      return '<span class="blog-search-tag">' + escapeHtml(tag) + '</span>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('blog-search-container');
    var input = document.getElementById('blog-search-input');
    var dropdown = document.getElementById('blog-search-dropdown');
    var form = document.getElementById('blog-search-form');

    if (!container || !input || !dropdown || !window.blogSearchIndex) {
      return;
    }

    var fzfInstance = null;
    var highlightedIndex = -1;
    var debounceTimer = null;
    var currentMatches = [];

    function setDropdownOpen(isOpen) {
      dropdown.hidden = !isOpen;
      input.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function hideDropdown() {
      highlightedIndex = -1;
      currentMatches = [];
      dropdown.innerHTML = '';
      setDropdownOpen(false);
    }

    function getSearchableText(item) {
      var tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
      return [item.title, tags, item.excerpt || ''].join(' ');
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

    function renderDropdown(query, matches) {
      currentMatches = matches.slice(0, MAX_TITLE_RESULTS);
      highlightedIndex = currentMatches.length ? 0 : -1;

      if (!query.trim()) {
        hideDropdown();
        return;
      }

      var html = '<div class="blog-search-dropdown-section">';
      html += '<p class="blog-search-dropdown-label">Matching titles</p>';

      if (!currentMatches.length) {
        html += '<p class="blog-search-empty">No title matches</p>';
      } else {
        html += '<ul class="blog-search-results-list">';
        currentMatches.forEach(function (match, index) {
          var item = match.item;
          var titleHtml = highlightMatches(item.title, match.positions);
          var activeClass = index === highlightedIndex ? ' is-active' : '';
          html += '<li>';
          html += '<a href="' + escapeHtml(item.url) + '" class="blog-search-result' + activeClass + '" role="option" data-index="' + index + '">';
          html += '<span class="blog-search-result-title">' + titleHtml + '</span>';
          if (item.date) {
            html += '<span class="blog-search-result-date">' + escapeHtml(item.date) + '</span>';
          }
          if (item.tags && item.tags.length) {
            html += '<span class="blog-search-result-tags">' + formatTags(item.tags) + '</span>';
          }
          html += '</a>';
          html += '</li>';
        });
        html += '</ul>';
      }

      html += '<a href="/search.html?q=' + encodeURIComponent(query.trim()) + '" class="blog-search-full-link">';
      html += 'Search all articles for “' + escapeHtml(query.trim()) + '”';
      html += '</a>';
      html += '</div>';

      dropdown.innerHTML = html;
      setDropdownOpen(true);
      updateHighlight();
    }

    function updateHighlight() {
      var links = dropdown.querySelectorAll('.blog-search-result');
      links.forEach(function (link, index) {
        link.classList.toggle('is-active', index === highlightedIndex);
      });
    }

    function performTitleSearch(query) {
      if (!fzfInstance || !query.trim()) {
        hideDropdown();
        return;
      }

      renderDropdown(query, fzfInstance.find(query.trim()));
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

    initFzf().then(function () {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');
      if (initialQuery) {
        input.value = initialQuery;
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
        hideDropdown();
        input.blur();
        return;
      }

      if (!dropdown.hidden && currentMatches.length) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          highlightedIndex = Math.min(highlightedIndex + 1, currentMatches.length - 1);
          updateHighlight();
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          highlightedIndex = Math.max(highlightedIndex - 1, 0);
          updateHighlight();
          return;
        }

        if (event.key === 'Enter' && followHighlightedResult()) {
          event.preventDefault();
        }
      }
    });

    form.addEventListener('submit', function (event) {
      if (!dropdown.hidden && followHighlightedResult()) {
        event.preventDefault();
      }
    });

    document.addEventListener('click', function (event) {
      if (!container.contains(event.target)) {
        hideDropdown();
      }
    });
  });
})();
