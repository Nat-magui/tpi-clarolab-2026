(() => {
  const presentation = document.getElementById('presentation');
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.getElementById('counter');
  const progressFill = document.getElementById('progressFill');
  const slideTitle = document.getElementById('slideTitle');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const keyHint = document.getElementById('keyHint');

  let current = Math.max(0, Math.min(slides.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));
  let hintTimer;

  const accents = [
    '#5fa8ff', '#cbd6e7', '#5fa8ff', '#5fa8ff', '#a979ff', '#a979ff',
    '#55cdb9', '#55cdb9', '#f0a35c', '#f0a35c', '#f0a35c', '#55cdb9'
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  function fitActiveSlide() {
    const slide = slides[current];
    if (!slide) return;
    const shell = slide.querySelector('.content-shell, .center-stage');
    if (!shell) return;

    shell.style.transform = 'none';

    requestAnimationFrame(() => {
      const slideRect = slide.getBoundingClientRect();
      const contentRect = shell.getBoundingClientRect();
      const safeX = 18;
      const safeY = 14;
      const availableW = Math.max(1, slideRect.width - safeX * 2);
      const availableH = Math.max(1, slideRect.height - safeY * 2);

      const rawScale = Math.min(1, availableW / contentRect.width, availableH / contentRect.height);
      const scale = rawScale < 1 ? rawScale * 0.97 : 1;

      const slideCenterX = slideRect.left + slideRect.width / 2;
      const slideCenterY = slideRect.top + slideRect.height / 2;
      const contentCenterX = contentRect.left + contentRect.width / 2;
      const contentCenterY = contentRect.top + contentRect.height / 2;
      const dx = slideCenterX - contentCenterX;
      const dy = slideCenterY - contentCenterY;

      shell.style.transform = `translate(${dx}px, ${dy}px) scale(${Math.max(0.48, scale)})`;
    });
  }

  function update(direction = 1) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev-exit');
      if (i < current && direction > 0) slide.classList.add('prev-exit');
    });
    slides[current].classList.add('active');
    counter.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
    progressFill.style.width = `${((current + 1) / slides.length) * 100}%`;
    progressFill.style.background = accents[current] || '#5fa8ff';
    slideTitle.textContent = slides[current].dataset.title || '';
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
    history.replaceState(null, '', `#${current + 1}`);
    fitActiveSlide();
    setTimeout(fitActiveSlide, 380);
  }

  function go(next, direction) {
    const bounded = Math.max(0, Math.min(slides.length - 1, next));
    if (bounded === current) return;
    current = bounded;
    update(direction);
  }

  function next() { go(current + 1, 1); }
  function prev() { go(current - 1, -1); }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {}
  }

  function toggleChrome() {
    presentation.classList.toggle('hide-chrome');
    setTimeout(fitActiveSlide, 280);
  }

  function showHint() {
    clearTimeout(hintTimer);
    keyHint.classList.add('show');
    hintTimer = setTimeout(() => keyHint.classList.remove('show'), 2300);
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault(); next();
    } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
      e.preventDefault(); prev();
    } else if (e.key === 'Home') {
      e.preventDefault(); go(0, -1);
    } else if (e.key === 'End') {
      e.preventDefault(); go(slides.length - 1, 1);
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    } else if (e.key.toLowerCase() === 'h') {
      toggleChrome();
    }
  });

  let startX = null;
  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 52) delta < 0 ? next() : prev();
    startX = null;
  }, { passive: true });

  window.addEventListener('resize', fitActiveSlide);
  document.addEventListener('fullscreenchange', () => setTimeout(fitActiveSlide, 80));

  update(1);
  setTimeout(showHint, 650);
})();
