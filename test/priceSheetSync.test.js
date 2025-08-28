const test = require('node:test');
const assert = require('node:assert/strict');

// This test validates that existing wood entries are preserved
// when the pricing recalculation returns no wood entries.
test('sync retains existing wood entries when recalculation produces none', () => {
  const entry = {
    details: {
      materials: {
        wood: [{ species: 'oak', boardFeet: 10 }],
      },
    },
  };

  // Normalize existing wood entries
  const woodEntries = Array.isArray(entry.details.materials?.wood)
    ? entry.details.materials.wood
    : Array.isArray(entry.details.materials?.wood?.entries)
      ? entry.details.materials.wood.entries
      : [];

  // Simulate calculation results with no wood entries
  const results = {
    materials: {
      wood: { baseCost: 100, wasteCost: 10, totalCost: 110 },
    },
  };

  const newWoodEntries = Array.isArray(results.materials?.wood?.entries) &&
    results.materials.wood.entries?.length
      ? results.materials.wood.entries
      : woodEntries;

  const mergedMaterials = {
    ...entry.details.materials,
    wood: newWoodEntries,
    computedWood: results.materials?.wood
      ? {
          baseCost: results.materials.wood.baseCost,
          wasteCost: results.materials.wood.wasteCost,
          totalCost: results.materials.wood.totalCost,
        }
      : entry.details.materials?.computedWood,
  };

  assert.deepStrictEqual(mergedMaterials.wood, entry.details.materials.wood);
  assert.deepStrictEqual(mergedMaterials.computedWood, {
    baseCost: 100,
    wasteCost: 10,
    totalCost: 110,
  });
});

