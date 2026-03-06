const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateHardwareCost, calculatePricing } = require('./calculationService');

test('calculateHardwareCost falls back to costPerUnit or cost when pricePerUnit missing', () => {
  const hardware = [
    { quantity: 5, costPerUnit: 2 }, // 10
    { quantity: 3, cost: 12 },       // 4 per unit -> 12
    { quantity: 2, pricePerUnit: 1.5 } // 3
  ];
  const total = calculateHardwareCost(hardware, {});
  assert.strictEqual(total, 25);
});

test('pricing sync retains hardware costs without settings ids', () => {
  const itemData = {
    labor: {},
    materials: {
      hardware: [
        { quantity: 5, costPerUnit: 2 },
        { quantity: 3, cost: 12 }
      ]
    }
  };
  const result = calculatePricing(itemData, {});
  assert.strictEqual(result.materials.hardware.cost, 22);
});


test('pricing applies wholesale and MSRP margins independently from cost', () => {
  const itemData = {
    labor: {
      assembly: { hours: 1, rate: 100 }
    },
    materials: {},
    cnc: {}
  };

  const settings = {
    margins: { wholesale: 10, msrp: 50 }
  };

  const result = calculatePricing(itemData, settings);

  assert.strictEqual(result.totals.cost, 100);
  assert.ok(Math.abs(result.totals.wholesale - 111.1111111111) < 0.0001);
  assert.strictEqual(result.totals.msrp, 200);
});
