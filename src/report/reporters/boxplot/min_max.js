import { isMeasuredCombination } from './normalize.js'

// Return the minimum|maximum value of all combinations.
// This is used as the extreme values of all box plots since they share the
// same abscissa so they can be vertically compared.
export const getMinMaxAll = (combinations) => {
  const combinationsA = combinations.filter(isMeasuredCombination)

  if (combinationsA.length === 0) {
    return {}
  }

  const minAll = Math.min(
    ...combinationsA.map((combination) => getQuantile(combination, 'min')),
  )
  const maxAll = Math.max(
    ...combinationsA.map((combination) => getQuantile(combination, 'max')),
  )
  return { minAll, maxAll }
}

const getQuantile = ({ quantiles }, statName) => quantiles[statName].raw
