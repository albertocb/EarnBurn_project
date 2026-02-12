const test = require('node:test');
const assert = require('node:assert/strict');
const { PlanningService } = require('../.tmp-test/services/planningService.js');

const baseMesocycle = {
  id: 'meso-1',
  name: 'Base',
  weeks: 4,
  focus: 'Hypertrophy',
  progressionModel: 'Linear',
  splitStrategy: 'PPL',
  sessionsPerWeek: 5,
  volumePreset: 'Hypertrophy',
  volumeRamp: true,
};

test('generateMicrocycles returns work weeks plus deload week', () => {
  const micros = PlanningService.generateMicrocycles(baseMesocycle);

  assert.equal(micros.length, 5);
  assert.equal(micros[0].isDeload, false);
  assert.equal(micros[4].isDeload, true);
});

test('applyDeloadToScheme reduces sets and targetRpe', () => {
  const result = PlanningService.applyDeloadToScheme({ numSets: 5, targetRpe: 8 });

  assert.equal(result.numSets, 2);
  assert.equal(result.targetRpe, 6);
});
