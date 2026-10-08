(function () {
  'use strict';

  /* ---------- Click-anywhere-to-copy prompts ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  var HINT = 'click to copy';

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 1600);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  document.querySelectorAll('.prompt').forEach(function (block, i) {
    var textEl = block.querySelector('.prompt__text');
    var hintEl = block.querySelector('.prompt__hint');
    if (!textEl) return;
    var text = textEl.textContent.trim();
    var resetTimer;

    // Make the whole block an accessible button.
    block.id = block.id || 'prompt-' + (i + 1);
    block.setAttribute('role', 'button');
    block.setAttribute('tabindex', '0');
    block.setAttribute('aria-label', 'Copy prompt: ' + text.slice(0, 80));

    function doCopy() {
      copyText(text).then(function (ok) {
        if (!ok) { showToast('Press Ctrl/⌘ + C to copy'); return; }
        block.classList.add('is-copied');
        if (hintEl) hintEl.textContent = 'copied!';
        showToast('Prompt copied');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          block.classList.remove('is-copied');
          if (hintEl) hintEl.textContent = HINT;
        }, 1600);
      });
    }

    block.addEventListener('click', doCopy);
    block.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doCopy(); }
    });
  });

  /* ---------- TOC active-section highlight ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  var targets = tocLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var current = null;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) current = entry.target.id;
      });
      if (!current) return;
      tocLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    targets.forEach(function (t) { observer.observe(t); });
  }
})();
