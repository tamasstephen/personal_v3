import { getNextOpenProject, getOppositeTheme, getToggleLabel, resolveTheme } from './site-model.mjs';

const themeTransitionMs = 180;

/** @param {ParentNode} root */
function initProjects(root) {
  const work = root.querySelector('#work');
  if (!work) return;
  work.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const project = event.target.closest('.project-toggle')?.closest('.project');
    if (!(project instanceof HTMLElement) || !project.dataset.project) return;
    const openProject = work.querySelector('.project[data-open="true"]');
    const currentId = openProject instanceof HTMLElement ? openProject.dataset.project ?? null : null;
    renderOpenProject(work, getNextOpenProject(currentId, project.dataset.project));
  });
}

/** @param {Element} work @param {string | null} openId */
function renderOpenProject(work, openId) {
  for (const project of work.querySelectorAll('.project')) {
    if (!(project instanceof HTMLElement)) continue;
    const isOpen = String(project.dataset.project === openId);
    project.dataset.open = isOpen;
    project.querySelector('.project-toggle')?.setAttribute('aria-expanded', isOpen);
  }
}

/** @param {HTMLButtonElement} button */
function initThemeToggle(button) {
  const root = document.documentElement;
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  renderToggleLabel(button, readCurrentTheme());
  button.hidden = false;
  // Without an explicit choice the CSS follows the system; keep the label in step with it.
  systemDark.addEventListener('change', () => renderToggleLabel(button, readCurrentTheme()));
  button.addEventListener('click', () => {
    const nextTheme = getOppositeTheme(readCurrentTheme());
    root.classList.add('theme-transition');
    root.dataset.theme = nextTheme;
    renderToggleLabel(button, nextTheme);
    storeTheme(nextTheme);
    setTimeout(() => root.classList.remove('theme-transition'), themeTransitionMs);
  });
}

/** @returns {import('./site-model.mjs').Theme} */
function readCurrentTheme() {
  return resolveTheme({ storedTheme: document.documentElement.dataset.theme, prefersDark: matchMedia('(prefers-color-scheme: dark)').matches });
}

/** @param {HTMLButtonElement} button @param {import('./site-model.mjs').Theme} theme */
function renderToggleLabel(button, theme) {
  const label = getToggleLabel(theme);
  button.textContent = label.text;
  button.setAttribute('aria-label', label.ariaLabel);
}

/** @param {import('./site-model.mjs').Theme} theme */
function storeTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.warn('Theme preference not saved; storage is unavailable.', error);
  }
}

/** @param {ParentNode} root */
function initReveal(root) {
  const sections = Array.from(root.querySelectorAll('[data-reveal]'));
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof IntersectionObserver !== 'function' || prefersReducedMotion) {
    for (const section of sections) section.classList.add('is-visible');
    return;
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.15 });
  for (const section of sections) observer.observe(section);
  document.documentElement.classList.add('reveal-ready');
}

initProjects(document);
initReveal(document);
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle instanceof HTMLButtonElement) initThemeToggle(themeToggle);
