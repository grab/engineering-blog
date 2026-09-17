(function () {
  'use strict';

  var TOC_MIN_HEADINGS = 3;
  var HEADER_OFFSET = 88;

  var toc = document.getElementById('post-toc');
  var tocList = document.getElementById('post-toc-list');
  var article = document.getElementById('post-content');
  var toggle = document.getElementById('post-toc-toggle');

  if (!toc || !tocList || !article) {
    return;
  }

  var headings = Array.prototype.slice.call(article.querySelectorAll('h2, h3'));

  if (headings.length < TOC_MIN_HEADINGS) {
    return;
  }

  var currentSublist = null;

  headings.forEach(function (heading) {
    if (!heading.id) {
      return;
    }

    var item = document.createElement('li');
    var link = document.createElement('a');

    link.href = '#' + heading.id;
    link.textContent = heading.textContent.trim();
    link.className = heading.tagName === 'H3'
      ? 'post-toc-link post-toc-link--nested'
      : 'post-toc-link';
    item.appendChild(link);

    if (heading.tagName === 'H2') {
      var sublist = document.createElement('ol');
      sublist.className = 'post-toc-sublist';
      item.appendChild(sublist);
      tocList.appendChild(item);
      currentSublist = sublist;
      return;
    }

    if (currentSublist) {
      currentSublist.appendChild(item);
      return;
    }

    tocList.appendChild(item);
  });

  if (!tocList.children.length) {
    return;
  }

  toc.hidden = false;

  function setExpanded(expanded) {
    toc.classList.toggle('is-expanded', expanded);
    if (toggle) {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }

  setExpanded(false);

  if (toggle) {
    toggle.addEventListener('click', function () {
      setExpanded(!toc.classList.contains('is-expanded'));
    });
  }

  tocList.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) {
      return;
    }

    var targetId = link.getAttribute('href').slice(1);
    var target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
})();
