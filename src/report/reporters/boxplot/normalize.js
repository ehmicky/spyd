// Normalize combinations, including turning the `quantiles` array instead an
// object with only the quantiles we need
// We use min|max instead of quantiles so it vertically aligns with other
// reporters such as `histogram`.
export const normalizeQuantiles = ({
  stats: { min, max, quantiles },
  ...combination
}) => {
  if (![min, max, quantiles].every(Boolean)) {
    return combination
  }

  return {
    ...combination,
    quantiles: {
      min,
      q1: quantiles[Q1_QUANTILE],
      median: quantiles[MEDIAN_QUANTILE],
      q3: quantiles[Q3_QUANTILE],
      max,
    },
  }
}

const Q1_QUANTILE = 25
const MEDIAN_QUANTILE = 50
const Q3_QUANTILE = 75

export const isMeasuredCombination = ({ quantiles }) => quantiles !== undefined
