(function () {
  'use strict';

  function openSharePopup(url) {
    var width = 600;
    var height = 600;
    var left = (window.screen.width / 2) - (width / 2);
    var top = (window.screen.height / 2) - (height / 2);
    window.open(
      url,
      'share-dialog',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=' + height + ',width=' + width + ',top=' + top + ',left=' + left
    );
  }

  document.querySelectorAll('[data-share-popup]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      openSharePopup(link.href);
    });
  });

  var copyBtn = document.getElementById('share-copy-link');
  var feedback = document.getElementById('share-copy-feedback');

  if (!copyBtn) {
    return;
  }

  var shareUrl = copyBtn.getAttribute('data-share-url');

  function showCopied() {
    copyBtn.classList.add('is-copied');
    if (feedback) {
      feedback.hidden = false;
    }

    window.setTimeout(function () {
      copyBtn.classList.remove('is-copied');
      if (feedback) {
        feedback.hidden = true;
      }
    }, 2000);
  }

  function fallbackCopy() {
    var input = document.createElement('textarea');
    input.value = shareUrl;
    input.setAttribute('readonly', '');
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    try {
      if (document.execCommand('copy')) {
        showCopied();
      }
    } catch (error) {
      // Ignore copy failures in unsupported browsers.
    }
    document.body.removeChild(input);
  }

  copyBtn.addEventListener('click', function () {
    if (!shareUrl) {
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(showCopied).catch(fallbackCopy);
      return;
    }

    fallbackCopy();
  });
})();
