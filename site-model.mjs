/**
 * One project is open at a time; activating the open project closes it.
 * @param {string | null} currentId
 * @param {string} clickedId
 * @returns {string | null}
 */
export function getNextOpenProject(currentId, clickedId) {
  return currentId === clickedId ? null : clickedId;
}
