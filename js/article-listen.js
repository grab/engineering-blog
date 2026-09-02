(function () {
  'use strict';

  var player = document.getElementById('article-listen');
  if (!player) {
    return;
  }

  var article = document.querySelector('.post-content');
  var toggleBtn = document.getElementById('article-listen-toggle');
  var speedSelect = document.getElementById('article-listen-speed');
  var metaEl = document.getElementById('article-listen-meta');
  var unsupportedEl = document.getElementById('article-listen-unsupported');
  var synth = window.speechSynthesis;

  if (!article || !toggleBtn || !synth || typeof window.SpeechSynthesisUtterance === 'undefined') {
    if (unsupportedEl) {
      unsupportedEl.hidden = false;
    }
    if (toggleBtn) {
      toggleBtn.disabled = true;
    }
    return;
  }

  var title = player.getAttribute('data-title') || document.title;
  var chunks = [];
  var currentChunk = 0;
  var isPlaying = false;
  var voices = [];
  var wordsPerMinute = 155;

  function getArticleText() {
    var clone = article.cloneNode(true);
    var removeSelectors = [
      'pre',
      'code',
      'script',
      'style',
      'table',
      'figure',
      '.highlight',
      '.language-plaintext'
    ];

    removeSelectors.forEach(function (selector) {
      clone.querySelectorAll(selector).forEach(function (node) {
        node.remove();
      });
    });

    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function chunkText(text, maxLength) {
    var sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    var result = [];
    var current = '';

    sentences.forEach(function (sentence) {
      var trimmed = sentence.trim();
      if (!trimmed) {
        return;
      }

      if ((current + ' ' + trimmed).trim().length > maxLength && current) {
        result.push(current.trim());
        current = trimmed;
      } else {
        current = (current + ' ' + trimmed).trim();
      }
    });

    if (current) {
      result.push(current.trim());
    }

    return result.length ? result : [text];
  }

  function pickVoice() {
    if (!voices.length) {
      voices = synth.getVoices();
    }

    var englishVoices = voices.filter(function (voice) {
      return voice.lang && voice.lang.toLowerCase().indexOf('en') === 0;
    });

    return (
      englishVoices.find(function (voice) { return voice.localService; }) ||
      englishVoices[0] ||
      voices[0] ||
      null
    );
  }

  function getRate() {
    return parseFloat(speedSelect.value || '1');
  }

  function estimateMinutes(text, rate) {
    var words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / (wordsPerMinute * rate)));
  }

  function updateMeta() {
    var rate = getRate();
    var minutes = estimateMinutes(getArticleText(), rate);
    metaEl.textContent = minutes + ' min listen · ' + rate + '×';
  }

  function setPlayingState(playing) {
    isPlaying = playing;
    toggleBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    toggleBtn.setAttribute('aria-label', playing ? 'Pause article audio' : 'Play article audio');
    player.classList.toggle('is-playing', playing);
  }

  function speakChunk(index) {
    if (index >= chunks.length) {
      currentChunk = 0;
      setPlayingState(false);
      return;
    }

    currentChunk = index;
    var utterance = new SpeechSynthesisUtterance(chunks[index]);
    var voice = pickVoice();

    utterance.rate = getRate();
    utterance.pitch = 1;

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = function () {
      if (isPlaying) {
        speakChunk(index + 1);
      }
    };

    utterance.onerror = function () {
      setPlayingState(false);
    };

    synth.speak(utterance);
  }

  function startPlayback() {
    if (!chunks.length) {
      var text = getArticleText();
      if (!text) {
        return;
      }

      chunks = [title + '.'].concat(chunkText(text, 420));
    }

    synth.cancel();
    setPlayingState(true);
    speakChunk(currentChunk);
  }

  function pausePlayback() {
    synth.cancel();
    setPlayingState(false);
  }

  function resetPlayback() {
    synth.cancel();
    currentChunk = 0;
    chunks = [];
    setPlayingState(false);
  }

  toggleBtn.addEventListener('click', function () {
    if (isPlaying) {
      pausePlayback();
      return;
    }

    startPlayback();
  });

  speedSelect.addEventListener('change', function () {
    updateMeta();

    if (!isPlaying) {
      return;
    }

    var resumeIndex = currentChunk;
    synth.cancel();
    setPlayingState(true);
    speakChunk(resumeIndex);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && isPlaying) {
      pausePlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    synth.cancel();
  });

  if (typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = function () {
      voices = synth.getVoices();
    };
  }

  voices = synth.getVoices();
  updateMeta();
})();
