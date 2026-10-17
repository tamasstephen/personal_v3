import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getNextOpenProject, getOppositeTheme, getToggleLabel, resolveTheme } from '../site-model.mjs';

test('opens a closed project', () => assert.equal(getNextOpenProject('cv-peers', 'curators-path'), 'curators-path'));
test('closes the open project', () => assert.equal(getNextOpenProject('cv-peers', 'cv-peers'), null));
test('opens from all-closed', () => assert.equal(getNextOpenProject(null, 'stephen-beratung'), 'stephen-beratung'));

test('stored dark wins over light system', () => assert.equal(resolveTheme({ storedTheme: 'dark', prefersDark: false }), 'dark'));
test('stored light wins over dark system', () => assert.equal(resolveTheme({ storedTheme: 'light', prefersDark: true }), 'light'));
test('no stored value follows system', () => assert.equal(resolveTheme({ storedTheme: null, prefersDark: true }), 'dark'));
test('invalid stored value follows system', () => assert.equal(resolveTheme({ storedTheme: 'sepia', prefersDark: false }), 'light'));
test('opposite of light is dark', () => assert.equal(getOppositeTheme('light'), 'dark'));
test('opposite of dark is light', () => assert.equal(getOppositeTheme('dark'), 'light'));
test('label offers the other theme', () => assert.deepEqual(getToggleLabel('light'), { text: 'Dark', ariaLabel: 'Switch to dark mode' }));
test('label in dark', () => assert.deepEqual(getToggleLabel('dark'), { text: 'Light', ariaLabel: 'Switch to light mode' }));
