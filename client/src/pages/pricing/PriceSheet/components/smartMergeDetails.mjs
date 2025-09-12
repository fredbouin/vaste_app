export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
};

export const num = (v) => (v == null ? 0 : Number(v) || 0);

export const smartMergeDetails = (prevDetails = {}, nextDetails = {}) => {
  const merged = { ...prevDetails, ...nextDetails };

  // ----- Materials -----
  const prevMaterials = prevDetails.materials || {};
  const nextMaterials = nextDetails.materials;
  if (nextMaterials === undefined) {
    merged.materials = prevMaterials;
  } else {
    const mat = { ...prevMaterials };
    Object.keys(nextMaterials || {}).forEach(key => {
      const nextVal = nextMaterials[key];
      if (nextVal === undefined) return;
      if (nextVal === null) {
        // Explicit clear
        mat[key] = null;
      } else if (Array.isArray(nextVal)) {
        // Ignore empty arrays to preserve previous data
        if (nextVal.length > 0) mat[key] = nextVal;
      } else if (typeof nextVal === 'object') {
        // Ignore empty objects
        if (Object.keys(nextVal).length > 0) {
          mat[key] = { ...prevMaterials[key], ...nextVal };
        }
      } else {
        mat[key] = nextVal;
      }
    });
    merged.materials = mat;
  }

  // ----- Labor -----
  const prevLabor = prevDetails.labor || {};
  const nextLabor = nextDetails.labor;
  if (nextLabor === undefined) {
    merged.labor = prevLabor;
  } else {
    const mergedLabor = { ...prevLabor, ...nextLabor };
    const prevBreakdown = toArray(prevLabor.breakdown);
    if (nextLabor.breakdown !== undefined) {
      const map = new Map();
      prevBreakdown.forEach(e => map.set(e.type, { ...e }));
      toArray(nextLabor.breakdown).forEach(e => {
        const existing = map.get(e.type) || {};
        const mergedEntry = { ...existing, ...e };
        if (num(e.rate) === 0) mergedEntry.rate = existing.rate;
        if (num(e.hours) === 0) mergedEntry.hours = existing.hours;
        map.set(e.type, mergedEntry);
      });
      if (Array.isArray(nextLabor.breakdown) && nextLabor.breakdown.length === 0) {
        mergedLabor.breakdown = [];
      } else {
        mergedLabor.breakdown = Array.from(map.values());
      }
    } else {
      mergedLabor.breakdown = prevBreakdown;
    }
    merged.labor = mergedLabor;
  }

  // ----- Overhead -----
  const prevOverhead = prevDetails.overhead || {};
  const nextOverhead = nextDetails.overhead;
  if (nextOverhead === undefined) {
    merged.overhead = prevOverhead;
  } else {
    const oh = { ...prevOverhead, ...nextOverhead };
    if (num(nextOverhead.rate) === 0) oh.rate = prevOverhead.rate;
    if (num(nextOverhead.hours) === 0) oh.hours = prevOverhead.hours;
    if (num(nextOverhead.cost) === 0) oh.cost = prevOverhead.cost;
    merged.overhead = oh;
  }

  // ----- CNC -----
  const prevCnc = prevDetails.cnc || {};
  const nextCnc = nextDetails.cnc;
  if (nextCnc === undefined) {
    merged.cnc = prevCnc;
  } else {
    const cnc = { ...prevCnc, ...nextCnc };
    if (num(nextCnc.runtime) === 0) cnc.runtime = prevCnc.runtime;
    if (num(nextCnc.cost) === 0) cnc.cost = prevCnc.cost;
    if (num(nextCnc.rate) === 0) cnc.rate = prevCnc.rate;
    merged.cnc = cnc;
  }

  // ----- Components -----
  const prevComponents = toArray(prevDetails.components);
  const nextComponents = nextDetails.components;
  if (nextComponents === undefined) {
    merged.components = prevComponents;
  } else if (Array.isArray(nextComponents)) {
    const mergedList = nextComponents.map(nextComp => {
      const id = nextComp.id ?? nextComp._id;
      const prevComp = prevComponents.find(c => (c.id ?? c._id) === id) || {};
      return { ...prevComp, ...nextComp };
    });
    const ids = new Set(mergedList.map(c => c.id ?? c._id));
    prevComponents.forEach(c => {
      const id = c.id ?? c._id;
      if (!ids.has(id)) mergedList.push(c);
    });
    merged.components = mergedList;
  } else {
    merged.components = prevComponents;
  }

  return merged;
};

export default smartMergeDetails;
