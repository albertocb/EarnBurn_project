const test = require('node:test');
const assert = require('node:assert/strict');
const { AnalyticsService } = require('../.tmp-test/services/analyticsService.js');

test('calculate1RM returns exact weight for single reps', () => {
  assert.equal(AnalyticsService.calculate1RM(100, 1), 100);
});

test('getPRs returns highest estimated 1RM per exercise', () => {
  const prs = AnalyticsService.getPRs([
    { exerciseName: 'Bench Press', weight: 100, reps: 5, date: '2026-01-01' },
    { exerciseName: 'Bench Press', weight: 105, reps: 3, date: '2026-01-08' },
    { exerciseName: 'Squat', weight: 140, reps: 5, date: '2026-01-08' },
  ]);

  const bench = prs.find((p) => p.exerciseName === 'Bench Press');
  const squat = prs.find((p) => p.exerciseName === 'Squat');

  assert.ok(bench);
  assert.ok(squat);
  assert.equal(bench.weight, AnalyticsService.calculate1RM(100, 5));
  assert.equal(squat.weight, AnalyticsService.calculate1RM(140, 5));
});

test('getWeeklyVolume groups and sums tonnage by week', () => {
  const volume = AnalyticsService.getWeeklyVolume([
    { date: '2026-01-05T10:00:00.000Z', weight: 100, reps: 5 },
    { date: '2026-01-06T10:00:00.000Z', weight: 120, reps: 4 },
  ]);

  assert.equal(volume.length, 1);
  assert.equal(volume[0].volume, 980);
});
