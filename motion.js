import { duration, sample } from './motion-model.mjs';

const root = document.getElementById('structure-to-clarity');
if (root instanceof HTMLElement) initializeMotion(root);

/** @param {HTMLElement} motionRoot */
function initializeMotion(motionRoot) {
  /** @param {string} selector */
  function element(selector) {
    const node = motionRoot.querySelector(selector);
    if (!(node instanceof HTMLElement)) throw new Error('Missing animation element: ' + selector);
    return node;
  }
  const stage = element('.clarity-stage');
  const object = element('.clarity-object');
  const board = element('.clarity-board');
  const glass = element('.clarity-glass');
  const blueprint = element('.clarity-blueprint');
  const scan = element('.clarity-scan');
  const sheen = element('.clarity-sheen');
  const pieces = Array.from(motionRoot.querySelectorAll('[data-piece]')).filter(node => node instanceof HTMLElement);
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let elapsed = Number(duration);
  let previousTime = 0;
  let animationFrame = 0;
  let explorationFrame = 0;
  let exploration = 0;
  let hasStarted = false;

  /** @param {ReturnType<typeof sample>} state */
  function renderPieces(state) {
    const separation = 1 - state.assembly + exploration * .32;
    for (const piece of pieces) {
      const offsetX = Number(piece.dataset.x ?? 0) * separation;
      const offsetY = Number(piece.dataset.y ?? 0) * separation;
      const offsetZ = Number(piece.dataset.z ?? 0) * separation + 2;
      piece.style.transform = `translate3d(${offsetX}px,${offsetY}px,${offsetZ}px)`;
      piece.style.opacity = String(.14 + .86 * Math.min(1, state.grid + state.surface));
      piece.style.borderColor = `rgba(130,145,164,${.34 * (1 - state.surface)})`;
      piece.style.boxShadow = `8px 12px 28px rgba(8,8,8,${.09 * separation})`;
    }
  }
  /** @param {ReturnType<typeof sample>} state */
  function renderMaterials(state) {
    const separation = 1 - state.assembly + exploration * .32;
    motionRoot.style.setProperty('--clarity-assembly-fit', String(.88 + .12 * state.assembly));
    motionRoot.style.setProperty('--clarity-center-y', `${48 + 7 * (1 - state.assembly)}%`);
    board.style.opacity = String(state.surface);
    blueprint.style.opacity = String(state.grid * .76);
    blueprint.style.clipPath = `inset(0 ${(1 - Math.min(1, state.grid * 2)) * 100}% 0 0)`;
    glass.style.transform = `translate3d(${separation * 22}px,${separation * 50}px,-12px)`;
    glass.style.opacity = String(.25 + state.surface * .75);
    object.style.transform = `rotateX(${26 - state.assembly * 12}deg) rotateY(${-30 + state.assembly * 8}deg) rotateZ(-8deg)`;
    scan.style.opacity = String(state.highlight * .65);
    scan.style.top = `${16 + state.scan * 292}px`;
    sheen.style.opacity = String(state.highlight);
    sheen.style.transform = `translateX(${(state.progress - .78) * 1000 - 100}%)`;
  }
  function render() {
    const state = sample(elapsed, preference.matches);
    renderPieces(state);
    renderMaterials(state);
    motionRoot.dataset.phase = state.phase;
  }
  /** @param {number} timestamp */
  function tick(timestamp) {
    if (previousTime) elapsed = Math.min(duration, elapsed + Math.min(64, timestamp - previousTime));
    previousTime = timestamp;
    render();
    if (elapsed < duration) animationFrame = requestAnimationFrame(tick);
  }
  function start() {
    if (hasStarted || preference.matches) return;
    hasStarted = true;
    elapsed = 0;
    previousTime = 0;
    render();
    animationFrame = requestAnimationFrame(tick);
  }
  /** @param {number} target */
  function explore(target) {
    if (preference.matches || !finePointer.matches || elapsed < duration) return;
    cancelAnimationFrame(explorationFrame);
    const from = exploration;
    const started = performance.now();
    function step() {
      const progress = Math.min(1, (performance.now() - started) / 380);
      exploration = from + (target - from) * (1 - Math.pow(1 - progress, 3));
      render();
      if (progress < 1) explorationFrame = requestAnimationFrame(step);
    }
    explorationFrame = requestAnimationFrame(step);
  }
  function resetPointer() {
    motionRoot.style.setProperty('--pointer-x', '0deg');
    motionRoot.style.setProperty('--pointer-y', '0deg');
  }
  stage.addEventListener('pointerenter', () => explore(1));
  stage.addEventListener('pointerleave', () => { explore(0); resetPointer(); });
  stage.addEventListener('pointermove', event => {
    if (preference.matches || !finePointer.matches) return;
    const bounds = stage.getBoundingClientRect();
    motionRoot.style.setProperty('--pointer-x', `${(event.clientX - bounds.left) / bounds.width * 8 - 4}deg`);
    motionRoot.style.setProperty('--pointer-y', `${4 - (event.clientY - bounds.top) / bounds.height * 8}deg`);
  });
  preference.addEventListener('change', () => {
    cancelAnimationFrame(animationFrame);
    cancelAnimationFrame(explorationFrame);
    elapsed = duration;
    exploration = 0;
    resetPointer();
    render();
  });
  function resize() {
    motionRoot.style.setProperty('--clarity-fit', String(Math.min(1.12, (stage.clientWidth - 40) / 600)));
  }
  resize();
  render();
  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize, { passive: true });
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      start();
      observer.disconnect();
    }, { threshold: .3 });
    observer.observe(stage);
  }
}
