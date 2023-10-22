// Divide stats by a scale so they don't show too many digits nor decimals.
export const getScale = (minMeasure, kind) => {
  const scales = SCALES[kind]
  const scaleA = scales.find((scale) => minMeasure >= scale)
  return scaleA === undefined ? scales.at(-1) : scaleA
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
