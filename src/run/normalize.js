import mapObj from 'map-obj'

// Normalize the result after measuring
export const normalizeMeasuredResult = function (result) {
  const combinations = result.combinations.map(normalizeCombination)
  return { ...result, combinations }
}

// Only keep the properties we need for reporting
const normalizeCombination = function ({ dimensions, stats }) {
  const dimensionsA = mapObj(dimensions, getIdProp)
  return { dimensions: dimensionsA, stats }
}

const getIdProp = function (propName, { id }) {
  return [propName, { id }]
}
