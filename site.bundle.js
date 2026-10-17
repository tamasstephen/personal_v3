"use strict";
(() => {
  // site-model.mjs
  function getNextOpenProject(currentId, clickedId) {
    return currentId === clickedId ? null : clickedId;
  }
  function resolveTheme({ storedTheme, prefersDark }) {
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
    return prefersDark ? "dark" : "light";
  }
  function getOppositeTheme(theme) {
    return theme === "dark" ? "light" : "dark";
  }
  function getToggleLabel(theme) {
    return theme === "dark" ? { text: "Light", ariaLabel: "Switch to light mode" } : { text: "Dark", ariaLabel: "Switch to dark mode" };
  }

  // site.js
  var themeTransitionMs = 180;
  function initProjects(root) {
    const work = root.querySelector("#work");
    if (!work) return;
    work.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const project = event.target.closest(".project-toggle")?.closest(".project");
      if (!(project instanceof HTMLElement) || !project.dataset.project) return;
      const openProject = work.querySelector('.project[data-open="true"]');
      const currentId = openProject instanceof HTMLElement ? openProject.dataset.project ?? null : null;
      renderOpenProject(work, getNextOpenProject(currentId, project.dataset.project));
    });
  }
  function renderOpenProject(work, openId) {
    for (const project of work.querySelectorAll(".project")) {
      if (!(project instanceof HTMLElement)) continue;
      const isOpen = String(project.dataset.project === openId);
      project.dataset.open = isOpen;
      project.querySelector(".project-toggle")?.setAttribute("aria-expanded", isOpen);
    }
  }
  function initThemeToggle(button) {
    const root = document.documentElement;
    renderToggleLabel(button, readCurrentTheme());
    button.hidden = false;
    button.addEventListener("click", () => {
      const nextTheme = getOppositeTheme(readCurrentTheme());
      root.classList.add("theme-transition");
      root.dataset.theme = nextTheme;
      renderToggleLabel(button, nextTheme);
      storeTheme(nextTheme);
      setTimeout(() => root.classList.remove("theme-transition"), themeTransitionMs);
    });
  }
  function readCurrentTheme() {
    return resolveTheme({ storedTheme: document.documentElement.dataset.theme, prefersDark: matchMedia("(prefers-color-scheme: dark)").matches });
  }
  function renderToggleLabel(button, theme) {
    const label = getToggleLabel(theme);
    button.textContent = label.text;
    button.setAttribute("aria-label", label.ariaLabel);
  }
  function storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      console.warn("Theme preference not saved; storage is unavailable.", error);
    }
  }
  initProjects(document);
  var themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle instanceof HTMLButtonElement) initThemeToggle(themeToggle);
})();
