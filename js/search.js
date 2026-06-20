(function () {
  'use strict';

  var CONTENT_MAX_LENGTH = 180;

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] === variable) {
        return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
      }
    }

    return '';
  }

  function normalizeListField(value) {
    if (Array.isArray(value)) {
      return value.join(' ');
    }

    return value || '';
  }

  function buildLunrIndex(store) {
    var idx = lunr(function () {
      this.ref('id');
      this.field('title', { boost: 12 });
      this.field('tags', { boost: 8 });
      this.field('excerpt', { boost: 6 });
      this.field('author', { boost: 4 });
      this.field('category', { boost: 4 });
      this.field('content');
    });

    Object.keys(store).forEach(function (key) {
      var item = store[key];
      idx.add({
        id: key,
        title: item.title || '',
        tags: normalizeListField(item.tags),
        excerpt: item.excerpt || '',
        author: normalizeListField(item.author),
        category: item.category || '',
        content: item.content || ''
      });
    });

    return idx;
  }

  function formatTagsHtml(tags) {
    if (!tags || !tags.length) {
      return '';
    }

    return tags.map(function (tag) {
      return '<span class="search-result-tag">' + escapeHtml(tag) + '</span>';
    }).join('');
  }

  function displaySearchResults(results, store, searchTerm) {
    var searchResults = document.getElementById('search-results');
    var searchSummary = document.getElementById('search-results-summary');
    if (!searchResults) {
      return;
    }

    if (!results.length) {
      if (searchSummary) {
        searchSummary.textContent = 'No results found for “' + searchTerm + '”.';
      }
      searchResults.innerHTML = '<li class="search-result-empty">Try different keywords, or use the header search for title matches.</li>';
      return;
    }

    if (searchSummary) {
      var label = results.length === 1 ? 'result' : 'results';
      searchSummary.textContent = results.length + ' ' + label + ' for “' + searchTerm + '”.';
    }

    var appendString = '';

    results.forEach(function (result) {
      var item = store[result.ref];
      if (!item) {
        return;
      }

      var snippet = item.excerpt || item.content || '';
      if (snippet.length > CONTENT_MAX_LENGTH) {
        snippet = snippet.substring(0, CONTENT_MAX_LENGTH) + '…';
      }

      appendString += '<li class="posts-summary-posts-list-item search-result-item">';
      appendString += '<a href="' + escapeHtml(item.url) + '">';
      appendString += '<h3>' + escapeHtml(item.title) + '</h3>';
      appendString += '</a>';

      if (item.date || item.tags) {
        appendString += '<p class="search-result-meta">';
        if (item.date) {
          appendString += '<span class="search-result-date">' + escapeHtml(item.date) + '</span>';
        }
        if (item.tags && item.tags.length) {
          appendString += '<span class="search-result-tags">' + formatTagsHtml(item.tags) + '</span>';
        }
        appendString += '</p>';
      }

      if (snippet) {
        appendString += '<p class="post-content">' + escapeHtml(snippet) + '</p>';
      }

      appendString += '</li>';
    });

    searchResults.innerHTML = appendString;
  }

  function runSearch(searchTerm) {
    if (!searchTerm || !window.searchStore) {
      return;
    }

    var input = document.getElementById('blog-search-input') || document.getElementById('search-page-input');
    if (input) {
      input.value = searchTerm;
    }

    var idx = buildLunrIndex(window.searchStore);
    var results = idx.search(searchTerm);
    displaySearchResults(results, window.searchStore, searchTerm);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var searchTerm = getQueryVariable('q');
    if (searchTerm) {
      runSearch(searchTerm);
    }

    var searchPageForm = document.getElementById('search-page-form');
    if (searchPageForm) {
      searchPageForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var pageInput = document.getElementById('search-page-input');
        var query = pageInput ? pageInput.value.trim() : '';
        if (!query) {
          return;
        }

        var nextUrl = '/search.html?q=' + encodeURIComponent(query);
        window.history.replaceState({}, '', nextUrl);
        runSearch(query);
      });
    }
  });
})();
