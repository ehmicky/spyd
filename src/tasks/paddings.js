// Make `title` and `name` reporter-friendly by adding paddings.
// Also add `iteration.name` which combines `title` and `parameter.
export const addPaddings = function(iterations) {
  const paddings = getPaddings(iterations)
  const iterationsA = iterations.map(iteration =>
    addPadding(iteration, paddings),
  )
  return iterationsA
}

// Vertically align both `title` and `parameter`
const getPaddings = function(iterations) {
  const title = getPadding(iterations, 'title')
  const parameter = getPadding(iterations, 'parameter')
  return { title, parameter }
}

const getPadding = function(iterations, propName) {
  const lengths = iterations.map(({ [propName]: value = '' }) => value.length)
  return Math.max(...lengths)
}

const addPadding = function({ title, parameter, ...iteration }, paddings) {
  const titleA = title.padEnd(paddings.title)

  if (parameter === undefined) {
    const name = titleA.padEnd(paddings.parameter + 3)
    return { ...iteration, title: titleA, name }
  }

  const parameterA = parameter.padEnd(paddings.parameter)
  const nameA = `${titleA} | ${parameterA}`
  return { ...iteration, title: titleA, parameter: parameterA, name: nameA }
}
