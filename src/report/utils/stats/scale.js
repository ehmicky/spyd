// Divide stats by a scale so they don't show too many digits nor decimals.
export const getScale = function (allCombinations, name, kind) {
  const measures = allCombinations
    .map((combination) => getMeasure(name, kind, combination))
    .filter(isNotEmpty)

  if (measures.length === 0) {
    return 1
  }

  const scales = SCALES[kind]
  const minMeasure = Math.min(...measures)
  const scaleA = scales.find((scale) => minMeasure >= scale)

  if (scaleA === undefined) {
    return scales[scales.length - 1]
  }

  return scaleA
}

// The same duration scale is used for all `stats.*Pretty` to make it easier to
// compare between them.
// `median` is `undefined` when `showPrecision: false`
// `medianMin` is `undefined` when number of loops is low
const getMeasure = function (
  name,
  kind,
  { stats: { [name]: stat, median, medianMin, mean } },
) {
  if (!MEDIAN_KINDS.has(kind)) {
    return stat
  }

  if (median !== undefined) {
    return median
  }

  if (medianMin !== undefined) {
    return medianMin
  }

  return mean
}

const MEDIAN_KINDS = new Set(['duration'])

// Some measures might be `0`:
//  - `medianMin` when the confidence interval is large
//  - `diff` and `rmoe|rstdev` although this is very unlikely
// The following measures cannot be `0`:
//  - `median|times|loops|samples` since we do not report then
//  - `mean` since it cannot be `0` if `median` is not
//  - `repeat`
// We do not use `0` measures here since they are not a good indicator of
// minimum precision for scales.
// `undefined` happens when there was not enough measures.
const isNotEmpty = function (measure) {
  return measure !== 0 && measure !== undefined
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
