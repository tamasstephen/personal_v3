import assert from 'node:assert/strict';
import test from 'node:test';
import { duration, sample } from '../motion-model.mjs';

test('choreography moves from structure to clarity and holds completion', () => {
  assert.equal(sample(0).phase, 'Structure');
  assert.equal(sample(1000).phase, 'Assembly');
  assert.equal(sample(2500).phase, 'Experience');
  assert.equal(sample(duration).phase, 'Clarity');
  assert.deepEqual(sample(duration + 1000), sample(duration));
  assert.equal(sample(duration).assembly, 1);
  assert.equal(sample(duration).surface, 1);
  assert.equal(sample(duration).highlight, 0);
});

test('reduced motion renders the completed composition immediately', () => {
  for (const time of [0, 600, 2400]) {
    assert.deepEqual(sample(time, true), sample(duration));
  }
});

test('invalid and out-of-range time inputs cannot corrupt the scene', () => {
  for (const time of [NaN, Infinity, -Infinity, -100]) {
    assert.deepEqual(sample(time), sample(0));
  }
});

test('assembly and surfaces are monotonic, with bounded finite values', () => {
  let previous = sample(0);
  for (let time = 0; time <= duration; time += 10) {
    const state = sample(time);
    for (const key of ['assembly', 'surface', 'grid', 'highlight', 'scan', 'progress']) {
      assert.ok(Number.isFinite(state[key]));
      assert.ok(state[key] >= 0 && state[key] <= 1);
    }
    assert.ok(state.assembly >= previous.assembly);
    assert.ok(state.surface >= previous.surface);
    previous = state;
  }
});

test('the finishing highlight sweeps down and disappears', () => {
  assert.equal(sample(2800).scan, 0);
  assert.ok(sample(3125).highlight > .99);
  assert.equal(sample(3125).scan, .5);
  assert.equal(sample(3450).scan, 1);
  assert.equal(sample(3450).highlight, 0);
});
