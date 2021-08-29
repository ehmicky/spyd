// Add:
//  - `combination.task|runner|systemTitlePadded`: like
//     `combination.*Title` but padded so all combinations vertically align
//  - `combination.titles`: combines all *TitlePadded
export const padTitles = function ({ result, result: { combinations } }) {
  const propNames = getUniquePropNames(combinations)
  const paddings = getPaddings(combinations, propNames)
  const combinationsA = combinations.map((combination) =>
    addPadding(combination, paddings),
  )
  return { ...result, combinations: combinationsA }
}

const getUniquePropNames = function (combinations) {
  const propNames = TITLE_PROPS.filter((propName) =>
    shouldShowProp(propName, combinations),
  )
  return propNames.length === 0 ? DEFAULT_TITLE_PROPS : propNames
}

const TITLE_PROPS = ['taskTitle', 'runnerTitle', 'systemTitle']
const DEFAULT_TITLE_PROPS = ['taskTitle']

const shouldShowProp = function (propName, combinations) {
  const titles = combinations.map((combination) => combination[propName])
  return [...new Set(titles)].length !== 1
}

const getPaddings = function (combinations, propNames) {
  return propNames.map((propName) => getPadding(combinations, propName))
}

const getPadding = function (combinations, propName) {
  const lengths = combinations.map(({ [propName]: value }) => value.length)
  const padding = Math.max(...lengths)
  return { propName, padding }
}

const addPadding = function (combination, paddings) {
  const titles = paddings.map(({ propName, padding }) =>
    padProp(combination[propName], padding, propName),
  )
  const titlesA = Object.fromEntries(titles)
  const titlesProp = Object.values(titlesA)
  return { ...combination, ...titlesA, titles: titlesProp }
}

const padProp = function (title, padding, propName) {
  const titleA = title.padEnd(padding)
  return [`${propName}${PADDED_PREFIX}`, titleA]
}

const PADDED_PREFIX = 'Padded'
