// Make `taskTitle`, `variationTitle`, 'commandTitle', 'envTitle'
// reporter-friendly by adding paddings.
export const padTitles = function(iterations) {
  const paddings = getPaddings(iterations)
  return iterations.map(iteration => addPadding(iteration, paddings))
}

// Vertically align `taskTitle`, `variationTitle` and `commandTitle`
const getPaddings = function(iterations) {
  const paddings = PADDED_PROPS.map(propName =>
    getPadding(iterations, propName),
  )
  return Object.fromEntries(paddings)
}

const getPadding = function(iterations, propName) {
  const lengths = iterations.map(({ [propName]: value }) => value.length)
  const padding = Math.max(...lengths)
  return [propName, padding]
}

const addPadding = function(iteration, paddings) {
  const titles = PADDED_PROPS.map(propName =>
    padProp(iteration[propName], paddings[propName], propName),
  )
  const titlesA = Object.fromEntries(titles)
  return { ...iteration, ...titlesA }
}

const padProp = function(title, padding, propName) {
  const titleA = title.padEnd(padding)
  return [propName, titleA]
}

const PADDED_PROPS = ['taskTitle', 'variationTitle', 'commandTitle', 'envTitle']
