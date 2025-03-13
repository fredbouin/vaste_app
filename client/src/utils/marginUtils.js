// src/utils/marginUtils.js

// Convert margin percentage to markup multiplier
export const marginToMarkup = (marginPercentage) => {
  if (!marginPercentage) return 1;
  const margin = parseFloat(marginPercentage) / 100;
  return 1 / (1 - margin);
};

// Convert markup multiplier to margin percentage
export const markupToMargin = (markup) => {
  if (!markup || markup <= 1) return 0;
  return ((markup - 1) / markup * 100).toFixed(1);
};