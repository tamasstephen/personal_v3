/**
 * One project is open at a time; activating the open project closes it.
 * @param {string | null} currentId
 * @param {string} clickedId
 * @returns {string | null}
 */
export function getNextOpenProject(currentId, clickedId) {
  return currentId === clickedId ? null : clickedId;
}

/** @typedef {'light' | 'dark'} Theme */

/**
 * An explicit stored choice wins; otherwise follow the system preference.
 * @param {{ storedTheme: unknown, prefersDark: boolean }} preferences
 * @returns {Theme}
 */
export function resolveTheme({ storedTheme, prefersDark }) {
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  return prefersDark ? 'dark' : 'light';
}

/** @param {Theme} theme @returns {Theme} */
export function getOppositeTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

/**
 * The toggle names the theme it switches to.
 * @param {Theme} theme the current theme
 * @returns {{ text: 'Dark' | 'Light', ariaLabel: string }}
 */
export function getToggleLabel(theme) {
  return theme === 'dark'
    ? { text: 'Light', ariaLabel: 'Switch to light mode' }
    : { text: 'Dark', ariaLabel: 'Switch to dark mode' };
}
