import { STAT_TITLES } from '../../../utils/stat_titles.js'

// Retrieve the header name
export const getHeaderNames = function (statName) {
  return [STAT_TITLES[statName]]
}
