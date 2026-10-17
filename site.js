import { getNextOpenProject } from './site-model.mjs';

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

initProjects(document);
