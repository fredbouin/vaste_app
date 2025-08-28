// client/src/utils/normalize.js
export function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

export function sumCost(list, keyCandidates = ['cost', 'amount', 'total', 'hours']) {
  const arr = toArray(list);
  return arr.reduce((acc, item) => {
    // pick first numeric field we recognize
    const n = keyCandidates
      .map(k => (typeof item === 'number' ? item : item?.[k]))
      .find(v => typeof v === 'number' || (typeof v === 'string' && v.trim() !== ''));
    return acc + (Number(n) || 0);
  }, 0);
}
