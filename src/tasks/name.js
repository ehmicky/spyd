export const addNames = function(iterations) {
  const iterationsA = iterations.map(addName)
  const iterationsB = addNamePaddings(iterationsA)
  return iterationsB
}

const addName = function({ title, parameter, ...iteration }) {
  const name = getName(title, parameter)
  return { ...iteration, name, title, parameter }
}

const getName = function(title, parameter) {
  if (parameter === undefined) {
    return title
  }

  return `${title} (${parameter})`
}

const addNamePaddings = function(iterations) {
  const padding = Math.max(...iterations.map(getNameLength))
  return iterations.map(iteration => addNamePadding(iteration, padding))
}

const getNameLength = function({ name }) {
  return name.length
}

const addNamePadding = function({ name, ...iteration }, padding) {
  const nameA = name.padEnd(padding)
  return { ...iteration, name: nameA }
}
