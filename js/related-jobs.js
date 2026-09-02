(function () {
  'use strict';

  var section = document.getElementById('related-jobs');
  if (!section) {
    return;
  }

  var statusEl = section.querySelector('.related-jobs-status');
  var listEl = section.querySelector('.related-jobs-cards');
  var fallbackEl = section.querySelector('.related-jobs-fallback');
  var tags = [];
  try {
    tags = JSON.parse(section.getAttribute('data-tags') || '[]');
  } catch (error) {
    tags = [];
  }
  var limit = parseInt(section.getAttribute('data-limit') || '3', 10);

  function normalizeTag(tag) {
    return tag.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function scoreJob(job, normalizedTags, tagCategories) {
    var score = 0;
    var title = job.title.toLowerCase();
    var searchText = job.search_text || '';

    normalizedTags.forEach(function (tag) {
      if (!tag) {
        return;
      }

      if (title.indexOf(tag) !== -1) {
        score += 4;
      } else if (searchText.indexOf(tag) !== -1) {
        score += 2;
      }

      Object.keys(tagCategories).forEach(function (configTag) {
        if (normalizeTag(configTag) === tag && tagCategories[configTag] === job.category) {
          score += 3;
        }
      });
    });

    return score;
  }

  function renderJobs(jobs, engineeringJobsUrl) {
    listEl.innerHTML = '';

    jobs.forEach(function (job) {
      var item = document.createElement('li');
      item.className = 'related-jobs-card';

      var link = document.createElement('a');
      link.className = 'related-jobs-card-link';
      link.href = job.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      var title = document.createElement('span');
      title.className = 'related-jobs-card-title';
      title.textContent = job.title;

      var meta = document.createElement('span');
      meta.className = 'related-jobs-card-meta';
      meta.textContent = [job.category, job.location].filter(Boolean).join(' · ');

      link.appendChild(title);
      link.appendChild(meta);
      item.appendChild(link);
      listEl.appendChild(item);
    });

    statusEl.hidden = true;
    listEl.hidden = false;

    var browse = document.createElement('a');
    browse.className = 'related-jobs-browse';
    browse.href = engineeringJobsUrl;
    browse.target = '_blank';
    browse.rel = 'noopener noreferrer';
    browse.textContent = 'View all engineering roles';
    section.appendChild(browse);
  }

  function showFallback() {
    statusEl.hidden = true;
    fallbackEl.hidden = false;
  }

  fetch('/jobs.json', { credentials: 'same-origin' })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('jobs.json unavailable');
      }
      return response.json();
    })
    .then(function (payload) {
      var jobs = payload.jobs || [];
      var tagCategories = payload.tag_categories || {};
      var engineeringJobsUrl = payload.engineering_jobs_url || 'https://www.grab.careers/en/teams/engineering/';
      var normalizedTags = tags.map(normalizeTag).filter(Boolean);

      var ranked = jobs
        .map(function (job) {
          return {
            job: job,
            score: scoreJob(job, normalizedTags, tagCategories)
          };
        })
        .filter(function (entry) { return entry.score > 0; })
        .sort(function (a, b) {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.job.title.localeCompare(b.job.title);
        })
        .slice(0, limit)
        .map(function (entry) { return entry.job; });

      if (ranked.length === 0) {
        ranked = jobs
          .filter(function (job) { return job.category === 'Engineering'; })
          .slice(0, limit);
      }

      if (ranked.length === 0) {
        showFallback();
        return;
      }

      renderJobs(ranked, engineeringJobsUrl);
    })
    .catch(function () {
      showFallback();
    });
})();
