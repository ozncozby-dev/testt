// Checks the closed-form springs against brute-force numerical integration.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spring, springByFeel, springs, cubicBezier, track, rng} from '../lib/motion.js';

/** Semi-implicit Euler with a tiny step — the "ground truth" we compare against. */
function integrate({stiffness, damping, mass = 1, velocity = 0}, tEnd, dt = 1e-5) {
  let x = 0, v = velocity;
  for (let t = 0; t < tEnd; t += dt) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
  }
  return x;
}

for (const [label, cfg] of [
  ['underdamped', {stiffness: 200, damping: 10}],
  ['critical', {stiffness: 100, damping: 20}],
  ['overdamped', {stiffness: 100, damping: 40}],
  ['with velocity', {stiffness: 170, damping: 26, velocity: 8}],
]) {
  test(`closed-form spring matches integration: ${label}`, () => {
    const f = spring(cfg);
    for (const t of [0.05, 0.13, 0.3, 0.7, 1.5]) {
      assert.ok(Math.abs(f(t) - integrate(cfg, t)) < 2e-3, `t=${t}: ${f(t)} vs ${integrate(cfg, t)}`);
    }
  });
}

test('springs start at from, settle at to, and settleTime is honest', () => {
  for (const preset of Object.values(springs)) {
    const f = springByFeel({...preset, from: 10, to: 50});
    assert.equal(f(0), 10);
    const ts = f.settleTime(0.001);
    for (let t = ts; t < ts + 2; t += 0.01) assert.ok(Math.abs(f(t) - 50) <= 40 * 0.001 + 1e-9);
  }
});

test('bounce 0 never overshoots', () => {
  const f = springByFeel({duration: 0.4, bounce: 0});
  for (let t = 0; t < 3; t += 0.001) assert.ok(f(t) <= 1 + 1e-9);
});

test('spring is frame-rate independent (pure in t)', () => {
  const f = springByFeel(springs.settle);
  assert.equal(f(0.5), f(0.5));
  assert.equal(springByFeel(springs.settle)(0.5), f(0.5));
});

test('cubicBezier endpoints and monotonic ease-out', () => {
  const e = cubicBezier(0.16, 1, 0.3, 1);
  assert.equal(e(0), 0);
  assert.equal(e(1), 1);
  let prev = 0;
  for (let x = 0; x <= 1; x += 0.01) { assert.ok(e(x) >= prev - 1e-9); prev = e(x); }
});

test('track holds outside its range and hits keys', () => {
  const tr = track([[1, 0], [2, 10], [3, 5]]);
  assert.equal(tr(0), 0);
  assert.equal(tr(2), 10);
  assert.equal(tr(9), 5);
});

test('rng is seeded and repeatable', () => {
  const a = rng(42), b = rng(42);
  for (let i = 0; i < 10; i++) assert.equal(a(), b());
});
