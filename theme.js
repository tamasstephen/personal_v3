const themeSections = Array.from(document.querySelectorAll("[data-theme-section]"));
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
let scheduledFrame = 0;

const getSectionTheme = (section) => {
  const theme = section.getAttribute("data-theme-section");
  return theme === "dark" ? "dark" : "light";
};

const getActiveTheme = () => {
  const viewportMidpoint = window.innerHeight / 2;

  for (const section of themeSections) {
    const bounds = section.getBoundingClientRect();

    if (bounds.top <= viewportMidpoint && bounds.bottom > viewportMidpoint) {
      return getSectionTheme(section);
    }
  }

  return "light";
};

const applyTheme = (theme) => {
  document.body.dataset.theme = theme;
  themeColorMeta?.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
};

const updateTheme = () => {
  scheduledFrame = 0;
  applyTheme(getActiveTheme());
};

const scheduleThemeUpdate = () => {
  if (scheduledFrame !== 0) {
    return;
  }

  scheduledFrame = window.requestAnimationFrame(updateTheme);
};

updateTheme();
window.addEventListener("scroll", scheduleThemeUpdate, { passive: true });
window.addEventListener("resize", scheduleThemeUpdate);
