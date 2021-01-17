import mapObj from 'map-obj'

// When `showTitles` is `false`, we show identifiers instead of titles.
// Titles can be configured with `titles` but requires an explicit opt-in to
// be shown in reporters.
// We do this by replacing every `title` by `id` in the `result` passed to
// reporters so that reporters do not need to handle it: they should just show
// any `title` property.
export const removeTitles = function (result, showTitles) {
  if (showTitles) {
    return result
  }

  return removeResultTitles(result)
}

const removeResultTitles = function (result) {
  const resultA = removeCombinationsTitles(result)
  const resultB = removeCategoriesTitles(resultA)
  const resultC = removeSystemsTitles(resultB)
  const resultD = removePreviousTitles(resultC)
  return resultD
}

const removeCombinationsTitles = function ({ combinations, ...result }) {
  return { ...result, combinations: combinations.map(removeCombinationTitles) }
}

const removeCombinationTitles = function ({
  taskId,
  runnerId,
  systemId,
  ...combination
}) {
  return {
    ...combination,
    taskId,
    taskTitle: taskId,
    runnerId,
    runnerTitle: runnerId,
    systemId,
    systemTitle: systemId,
  }
}

const removeCategoriesTitles = function ({ categories, ...result }) {
  return { ...result, categories: mapObj(categories, removeCategoryTitle) }
}

const removeCategoryTitle = function (category, items) {
  const itemsA = items.map(removeItemTitle)
  return [category, itemsA]
}

const removeItemTitle = function ({ id, ...item }) {
  return { ...item, id, title: id }
}

// In `previous`, `system` is used.
// In the last merged result, `systems` is used instead.
const removeSystemsTitles = function ({ systems, system, ...result }) {
  if (system !== undefined) {
    return { ...result, system: removeSystemTitle(system) }
  }

  return { ...result, systems: systems.map(removeSystemTitle) }
}

const removeSystemTitle = function ({ id, ...obj }) {
  return id === undefined ? obj : { ...obj, id, title: id }
}

// `previous` is `undefined` when recursing over `previous`.
const removePreviousTitles = function ({ previous, ...result }) {
  if (previous === undefined) {
    return result
  }

  return { ...result, previous: previous.map(removeResultTitles) }
}
