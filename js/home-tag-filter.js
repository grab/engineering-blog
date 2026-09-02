(function () {
  'use strict';

  var panel = document.getElementById('home-tag-filter');
  var nav = document.getElementById('home-tag-filter-nav');
  var clearBtn = document.getElementById('home-tag-filter-clear');
  var defaultView = document.getElementById('home-default-view');
  var filterView = document.getElementById('home-filter-view');
  var filterGrid = document.getElementById('home-filter-grid');
  var filterSummary = document.getElementById('home-filter-summary');
  var filterHeading = document.getElementById('home-filter-heading');
  var emptyState = document.getElementById('home-filter-empty');

  if (!panel || !nav || !defaultView || !filterView || !filterGrid) {
    return;
  }

  var items = Array.prototype.slice.call(filterGrid.querySelectorAll('.post-card'));
  var checkboxes = Array.prototype.slice.call(nav.querySelectorAll('.filter-tag-checkbox'));

  function getTagLabel(tagSlug) {
    if (!tagSlug || !window.blogFilterTags) {
      return '';
    }

    var match = window.blogFilterTags.find(function (tag) {
      return tag.slug === tagSlug;
    });

    return match ? match.name : tagSlug;
  }

  function getSelectedTags() {
    return checkboxes
      .filter(function (checkbox) { return checkbox.checked; })
      .map(function (checkbox) { return checkbox.getAttribute('data-tag-slug'); })
      .filter(Boolean);
  }

  function updateSummary(visibleCount, selectedTags) {
    if (!filterSummary || !filterHeading) {
      return;
    }

    if (!selectedTags.length) {
      filterSummary.textContent = '';
      filterHeading.textContent = 'Articles';
      return;
    }

    var label = visibleCount === 1 ? 'article' : 'articles';
    var matchLabel = selectedTags.length === 1 ? 'tag' : 'tags';

    filterSummary.textContent = visibleCount + ' ' + label + ' matching ' + selectedTags.length + ' selected ' + matchLabel + '.';
    filterHeading.textContent = selectedTags.map(getTagLabel).join(', ');
  }

  function setClearVisible(visible) {
    if (clearBtn) {
      clearBtn.hidden = !visible;
    }
  }

  function showAll() {
    checkboxes.forEach(function (checkbox) {
      checkbox.checked = false;
    });

    defaultView.hidden = false;
    filterView.hidden = true;
    setClearVisible(false);
    updateSummary(0, []);
  }

  function applyTagFilter(selectedTags) {
    defaultView.hidden = true;
    filterView.hidden = false;
    setClearVisible(true);

    var visibleCount = 0;

    items.forEach(function (item) {
      var tagSlugs = (item.getAttribute('data-tag-slugs') || '')
        .split(',')
        .map(function (slug) { return slug.trim(); })
        .filter(Boolean);
      var isVisible = selectedTags.some(function (activeTag) {
        return tagSlugs.indexOf(activeTag) !== -1;
      });

      item.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    updateSummary(visibleCount, selectedTags);

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }

    filterGrid.hidden = visibleCount === 0;
  }

  function handleFilterChange() {
    var selectedTags = getSelectedTags();

    if (!selectedTags.length) {
      showAll();
      return;
    }

    applyTagFilter(selectedTags);
  }

  function handleClearClick() {
    showAll();
  }

  nav.addEventListener('change', handleFilterChange);

  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearClick);
  }

  var toggleBtn = document.getElementById('home-tag-filter-toggle');
  var filterBody = document.getElementById('home-tag-filter-body');
  var collapsedStorageKey = 'home-tag-filter-collapsed';

  function setCollapsed(collapsed) {
    if (!panel || !toggleBtn || !filterBody) {
      return;
    }

    panel.classList.toggle('is-collapsed', collapsed);
    toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');

    try {
      sessionStorage.setItem(collapsedStorageKey, collapsed ? '1' : '0');
    } catch (error) {
      // Ignore storage errors in private browsing.
    }
  }

  function handleToggleClick() {
    setCollapsed(!panel.classList.contains('is-collapsed'));
  }

  if (toggleBtn && filterBody) {
    var storedCollapsed = false;

    try {
      storedCollapsed = sessionStorage.getItem(collapsedStorageKey) === '1';
    } catch (error) {
      storedCollapsed = false;
    }

    setCollapsed(storedCollapsed);
    toggleBtn.addEventListener('click', handleToggleClick);
  }

  showAll();
})();
