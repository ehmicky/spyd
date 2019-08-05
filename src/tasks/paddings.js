// Make `title` and `name` reporter-friendly by adding paddings.
// Also add `iteration.name` which combines `title` and `variationTitle`.
export const addPaddings = function(iterations) {
  const paddings = getPaddings(iterations)
  const iterationsA = iterations.map(iteration =>
    addPadding(iteration, paddings),
  )
  return iterationsA
}

// Vertically align both `title` and `variationTitle`
const getPaddings = function(iterations) {
  const title = getPadding(iterations, 'title')
  const variation = getPadding(iterations, 'variationTitle')
  return { title, variation }
}

const getPadding = function(iterations, propName) {
  const lengths = iterations.map(({ [propName]: value = '' }) => value.length)
  return Math.max(...lengths)
}

const addPadding = function({ title, variationTitle, ...iteration }, paddings) {
  const titleA = title.padEnd(paddings.title)

  if (variationTitle === undefined) {
    const name = titleA.padEnd(paddings.variation + 3)
    return { ...iteration, title: titleA, name }
  }

  const variationTitleA = variationTitle.padEnd(paddings.variation)
  const nameA = `${titleA} | ${variationTitleA}`
  return {
    ...iteration,
    title: titleA,
    variationTitle: variationTitleA,
    name: nameA,
  }
}
