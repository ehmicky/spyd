import mapObj from 'map-obj'

// Normalize combinations, including turning the `quantiles` array instead an
// object with only the quantiles we need
export const normalizeQuantiles = function ({
  stats: { quantiles },
  ...combination
}) {
  if (quantiles === undefined) {
    return combination
  }

  const quantilesA = mapObj(QUANTILES, (name, quantileIndex) => [
    name,
    quantiles[quantileIndex],
  ])
  return { ...combination, quantiles: quantilesA }
}

// List of quantiles shown by the reporter
const QUANTILES = { min: 0, q1: 25, median: 50, q3: 75, max: 100 }

export const isMeasuredCombination = function ({ quantiles }) {
  return quantiles !== undefined
}
