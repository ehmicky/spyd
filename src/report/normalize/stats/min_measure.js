// Retrieve the smallest measure of a given stat, across all combinations.
// Used to compute the scale and unit.
export const getMinMeasure = ({ allCombinations, name, kind, ownScale }) => {
  const measures = allCombinations
    .map((combination) => getMeasure({ name, kind, ownScale, combination }))
    .filter(isNotEmpty)
  return measures.length === 0 ? 1 : Math.min(...measures)
}

// The same duration scale is used for all `stats.*Pretty` to make it easier to
// compare between them.
// `mean` is `undefined` when `showPrecision: false`
// `meanMin` is `undefined` when number of loops is low.
const getMeasure = ({
  name,
  kind,
  ownScale,
  combination: {
    stats: { [name]: stat, mean, meanMin, median },
  },
}) => {
  if (!DURATION_KINDS.has(kind) || ownScale) {
    return stat
  }

  return [mean, meanMin, median].find(isNotEmpty)
}

const DURATION_KINDS = new Set(['duration'])

// Measures that are `0` are not a good indicator of minimum precision for scale
const isNotEmpty = (measure) => measure !== undefined && measure !== 0
