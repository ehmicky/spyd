// Make `taskTitle`, `inputTitle`, 'commandTitle', 'systemTitle'
// reporter-friendly by adding paddings.
export const padTitles = function (combinations) {
  const paddings = getPaddings(combinations)
  return combinations.map((combination) => addPadding(combination, paddings))
}

// Vertically align `taskTitle`, `inputTitle` and `commandTitle`
const getPaddings = function (combinations) {
  const paddings = PADDED_PROPS.map((propName) =>
    getPadding(combinations, propName),
  )
  return Object.fromEntries(paddings)
}

const getPadding = function (combinations, propName) {
  const lengths = combinations.map(({ [propName]: value }) => value.length)
  const padding = Math.max(...lengths)
  return [propName, padding]
}

const addPadding = function (combination, paddings) {
  const titles = PADDED_PROPS.map((propName) =>
    padProp(combination[propName], paddings[propName], propName),
  )
  const titlesA = Object.fromEntries(titles)
  return { ...combination, ...titlesA }
}

const padProp = function (title, padding, propName) {
  const titleA = title.padEnd(padding)
  return [`${propName}${PADDED_PREFIX}`, titleA]
}

const PADDED_PROPS = ['taskTitle', 'inputTitle', 'commandTitle', 'systemTitle']
const PADDED_PREFIX = 'Padded'
