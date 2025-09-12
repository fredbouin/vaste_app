import test from 'node:test';
import assert from 'node:assert/strict';
import { smartMergeDetails, num } from '../client/src/pages/pricing/PriceSheet/components/smartMergeDetails.mjs';

test('smartMergeDetails preserves existing data on partial updates', () => {
  const prev = {
    materials: {
      wood: [{ species: 'oak', totalCost: 100 }],
      sheet: [{ material: 'plywood', cost: 50 }],
      hardware: [{ name: 'hinge', cost: 5 }],
      finishing: { cost: 20 },
      upholstery: { cost: 30 },
      computedWood: { baseCost: 80, totalCost: 90 },
    },
    labor: {
      breakdown: [
        { type: 'Stock', hours: 5, rate: 20 },
        { type: 'CNC Operator', hours: 2, rate: 30 },
      ],
    },
    overhead: { rate: 10, hours: 7, cost: 70 },
    cnc: { runtime: 1, rate: 50, cost: 50 },
    components: [
      { id: 'a', name: 'compA', qty: 1 },
      { id: 'b', name: 'compB', qty: 3 },
    ],
  };

  const next = {
    materials: {
      wood: [{ species: 'oak', totalCost: 120 }],
    },
    labor: {
      breakdown: [
        { type: 'Stock', hours: 0, rate: 0 },
        { type: 'NewType', hours: 1, rate: 15 },
      ],
    },
    overhead: { rate: 0 },
    cnc: { runtime: 0 },
    components: [{ id: 'a', qty: 2 }],
  };

  const merged = smartMergeDetails(prev, next);

  // materials
  assert.deepStrictEqual(merged.materials.sheet, prev.materials.sheet);
  assert.deepStrictEqual(merged.materials.hardware, prev.materials.hardware);
  assert.deepStrictEqual(merged.materials.upholstery, prev.materials.upholstery);
  assert.deepStrictEqual(merged.materials.wood, next.materials.wood);
  assert.deepStrictEqual(merged.materials.finishing, prev.materials.finishing);
  assert.deepStrictEqual(merged.materials.computedWood, prev.materials.computedWood);

  // labor
  const stock = merged.labor.breakdown.find(b => b.type === 'Stock');
  assert.equal(stock.hours, 5);
  assert.equal(stock.rate, 20);
  const cncOp = merged.labor.breakdown.find(b => b.type === 'CNC Operator');
  assert.ok(cncOp);
  const newType = merged.labor.breakdown.find(b => b.type === 'NewType');
  assert.equal(newType.hours, 1);

  // overhead & cnc
  assert.equal(merged.overhead.rate, 10);
  assert.equal(merged.cnc.runtime, 1);

  // components
  assert.equal(merged.components.length, 2);
  const compA = merged.components.find(c => c.id === 'a');
  assert.equal(compA.qty, 2);
  assert.ok(merged.components.find(c => c.id === 'b'));

  const calcCost = (d) =>
    num(d.materials.wood[0].totalCost) +
    num(d.materials.sheet[0].cost) +
    num(d.materials.hardware[0].cost) +
    num(d.materials.finishing.cost) +
    num(d.materials.upholstery.cost) +
    num(d.cnc.cost) +
    num(d.overhead.cost);

  const prevCost = calcCost(prev);
  const mergedCost = calcCost(merged);
  assert.equal(mergedCost - prevCost, 20);
});

// ensure non-meaningful materials update keeps previous
 test('smartMergeDetails ignores empty material updates', () => {
  const prev = { materials: { wood: [{ species: 'oak', totalCost: 100 }] } };
  const next = { materials: {} };
  const merged = smartMergeDetails(prev, next);
  assert.deepStrictEqual(merged.materials, prev.materials);
});
