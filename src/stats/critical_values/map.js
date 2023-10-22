// Return a map which can be used to infer critical values of statistical
// distributions.
// This relies on using a pre-computed table of critical values, as opposed to
// computing the real value with their underlying function. This is much faster
// but less precise.
// The pre-computed table is an array of objects with properties:
//  - `significanceLevel` {float}: from 0 to 1
//  - `values` {object}:
//     - keys are the degrees of freedom
//     - values are the critical values
//     - missing degrees of freedom are interpolated (which is less precise)
//  - `getMaxValue(degreesOfFreedom: integer) => integer`: approximate the
//    critical value when the `degreesOfFreedom` are very high
// This function transforms this raw table to a map used for efficient retrieval
export const getCriticalValuesMap = (criticalValuesRaw) =>
  new Map(criticalValuesRaw.map(getCriticalValueEntry))

const getCriticalValueEntry = ({
  significanceLevel,
  getMaxValue,
  criticalValues,
}) => {
  const entries = Object.entries(criticalValues).map(normalizeKey)
  const lastPreciseKey = entries.findIndex(isLastPreciseKey)
  const preciseEntries = entries.slice(0, lastPreciseKey + 1)
  const impreciseEntries = entries.slice(lastPreciseKey)
  const preciseMap = new Map(preciseEntries)
  const [impreciseEntriesMaxIndex] = impreciseEntries.at(-1)
  return [
    roundDecimals(significanceLevel),
    { preciseMap, impreciseEntries, impreciseEntriesMaxIndex, getMaxValue },
  ]
}

const normalizeKey = ([key, value]) => [Number(key), value]

// Retrieve the last entry which can used as `preciseMap`
const isLastPreciseKey = ([key], index, entries) => {
  const nextEntry = entries[index + 1]
  return nextEntry === undefined || key !== nextEntry[0] - 1
}

// Retrieve a critical value given a specific degrees of freedom and
// significance level.
// There are three levels of precision depending on how high the numbers of
// degrees of freedom are, since the pre-computed table cannot hard code all
// possible values:
//  - When low enough, we use the precise value
//  - When higher, we use an interpolation between two precise values
//  - When even higher, we use an approximation function
export const getCriticalValue = (
  criticalValuesMap,
  degreesOfFreedom,
  significanceLevel,
) => {
  const {
    preciseMap,
    impreciseEntries,
    impreciseEntriesMaxIndex,
    getMaxValue,
  } = criticalValuesMap.get(roundDecimals(significanceLevel))

  if (degreesOfFreedom > impreciseEntriesMaxIndex) {
    return getMaxValue(degreesOfFreedom)
  }

  const preciseValue = preciseMap.get(degreesOfFreedom)

  if (preciseValue !== undefined) {
    return preciseValue
  }

  return getImpreciseValue(impreciseEntries, degreesOfFreedom)
}

// When using `impreciseEntries`, we interpolate values.
const getImpreciseValue = (impreciseEntries, degreesOfFreedom) => {
  const impreciseEntryIndex = impreciseEntries.findIndex(
    ([degreesOfFreedomA]) => degreesOfFreedomA >= degreesOfFreedom,
  )
  const [bottomDegreesOfFreedom, bottomValue] =
    impreciseEntries[impreciseEntryIndex - 1]
  const [topDegreesOfFreedom, topValue] = impreciseEntries[impreciseEntryIndex]
  const topWeight = degreesOfFreedom - bottomDegreesOfFreedom
  const bottomWeight = topDegreesOfFreedom - degreesOfFreedom
  const topWeightedValue = topValue * topWeight
  const bottomWeightedValue = bottomValue * bottomWeight
  return (topWeightedValue + bottomWeightedValue) / (topWeight + bottomWeight)
}

// Round a number to a specific number of decimals
const roundDecimals = (float, decimalsCount = DEFAULT_DECIMALS_COUNT) => {
  const decimalsScale = 10 ** decimalsCount
  return Math.round(float * decimalsScale) / decimalsScale
}

// The default value is meant to fix Number.EPSILON rounding errors
const getDefaultDecimalsCount = () => Math.floor(-Math.log10(Number.EPSILON))

const DEFAULT_DECIMALS_COUNT = getDefaultDecimalsCount()
