import { getCombinationName } from '../title.js'

// Retrieve sidebar with the combination name
export const getSidebar = function (titles) {
  return `\n${getSidebarName(titles)}`
}

export const getSidebarName = function (titles) {
  return getCombinationName(titles)
}
