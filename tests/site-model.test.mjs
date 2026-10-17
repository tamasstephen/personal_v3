import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getNextOpenProject } from '../site-model.mjs';

test('opens a closed project', () => assert.equal(getNextOpenProject('cv-peers', 'curators-path'), 'curators-path'));
test('closes the open project', () => assert.equal(getNextOpenProject('cv-peers', 'cv-peers'), null));
test('opens from all-closed', () => assert.equal(getNextOpenProject(null, 'stephen-beratung'), 'stephen-beratung'));
