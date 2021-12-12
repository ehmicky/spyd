// Divide stats by a scale so they don't show too many digits nor decimals.
export const getScale = function ({ allCombinations, name, kind, ownScale }) {
  const measures = allCombinations
    .map((combination) => getMeasure({ name, kind, ownScale, combination }))
    .filter(isNotEmpty)

  const scales = SCALES[kind]
  const minMeasure = measures.length === 0 ? 1 : Math.min(...measures)
  const scaleA = scales.find((scale) => minMeasure >= scale)

  if (scaleA === undefined) {
    return scales[scales.length - 1]
  }

  return scaleA
}

// The same duration scale is used for all `stats.*Pretty` to make it easier to
// compare between them.
// `mean` is `undefined` when `showPrecision: false`
// `meanMin` is `undefined` when number of loops is low
const getMeasure = function ({
  name,
  kind,
  ownScale,
  combination: {
    stats: { [name]: stat, mean, meanMin, median },
  },
}) {
  if (!MEAN_KINDS.has(kind) || ownScale) {
    return stat
  }

  return [mean, meanMin, median].find(isNotEmpty)
}

const MEAN_KINDS = new Set(['duration'])

// Measures that are `0` are not a good indicator of minimum precision for scale
const isNotEmpty = function (measure) {
  return measure !== undefined && measure !== 0
}

// Possible scales for each unit kind.
/* eslint-disable no-magic-numbers */
const SCALES = {
  // The maximum scale is seconds:
  //  - minutes require writing two scales (e.g. 1m56s) which is harder to read
  //  - minutes are not base 10 which makes it harder to visually compare
  //  - hours-long tasks are unlikely
  duration: [1e9, 1e6, 1e3, 1, 1e-3, 1e-6],
  // Counts use exponential exponents and avoid decimals.
  count: [1e15, 1e12, 1e9, 1e6, 1e3, 1, 1e-3, 1e-6, 1e-9, 1e-12, 1e-15],
  // Percentages per-mil and per-myriad Unicode signs do not show well on
  // terminals. Units like "pcm" are not well-known. So we always use % instead.
  // We do not use the exponent notation because it is odd to combine it with %.
  percentage: [1e-2],
}
/* eslint-enable no-magic-numbers */
