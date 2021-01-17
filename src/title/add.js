// Add title to object if the corresponding title exists in the `titles`
// configuration property.
export const addTitles = function (obj, idNames, titles) {
  return idNames.reduce((objA, idName) => addTitle(objA, idName, titles), obj)
}

export const addTitle = function (obj, idName, titles) {
  const id = obj[idName]
  const { [id]: title = id } = titles

  if (title === undefined) {
    return obj
  }

  const titleName = TITLE_PROPS[idName]
  return { ...obj, [titleName]: title }
}

const TITLE_PROPS = {
  id: 'title',
  taskId: 'taskTitle',
  runnerId: 'runnerTitle',
  systemId: 'systemTitle',
}
