// Make `taskTitle`, `variationTitle`, 'runnerTitle' reporter-friendly by
// adding paddings.
// Also add `iteration.name` which combines them.
export const addPaddings = function(iterations) {
  const paddings = getPaddings(iterations)
  const iterationsA = iterations.map(iteration =>
    addPadding(iteration, paddings),
  )
  const iterationsB = addNames(iterationsA)
  return iterationsB
}

// Vertically align `taskTitle`, `variationTitle` and `runnerTitle`
const getPaddings = function(iterations) {
  const paddings = PADDED_PROPS.map(propName =>
    getPadding(iterations, propName),
  )
  return Object.fromEntries(paddings)
}

const getPadding = function(iterations, propName) {
  const lengths = iterations.map(({ [propName]: value = '' }) => value.length)
  const padding = Math.max(...lengths)
  return [propName, padding]
}

const addPadding = function(iteration, paddings) {
  const titles = PADDED_PROPS.map(propName =>
    padProp(iteration, paddings, propName),
  )
  const titlesA = Object.fromEntries(titles)
  return { ...iteration, ...titlesA }
}

const padProp = function(iteration, paddings, propName) {
  const title = padTitle(paddings[propName], iteration[propName])
  return [propName, title]
}

const padTitle = function(padding, title = '') {
  if (padding === 0) {
    return
  }

  return title.padEnd(padding)
}

// Add `iteration.name`
const addNames = function(iterations) {
  const props = PADDED_PROPS.filter(propName =>
    shouldShowProp(iterations, propName),
  )
  return iterations.map(iteration => addName(iteration, props))
}

const addName = function(iteration, props) {
  const name = props
    .map(propName => iteration[propName])
    .filter(Boolean)
    .join(' | ')
  return { ...iteration, name }
}

// If all variations and/or runners are the same, do not report them.
// Do not do this for tasks though, since `name` should not be empty.
const shouldShowProp = function(iterations, propName) {
  if (propName === 'taskTitle') {
    return true
  }

  const props = iterations.map(iteration => iteration[propName])
  const uniqueProps = [...new Set(props)]
  return uniqueProps.length !== 1
}

const PADDED_PROPS = ['taskTitle', 'variationTitle', 'runnerTitle']
