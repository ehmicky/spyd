import { arrowUp, arrowDown } from 'figures'

// Prepend some statistics with prefixes
export const addPrefix = function (stat, statPretty, name) {
  const getPrefix = PREFIXES[name]

  if (getPrefix === undefined) {
    return statPretty
  }

  const prefix = getPrefix(stat)
  const statPrettyA = `${prefix}${statPretty}`
  return statPrettyA
}

const getArrow = function (stat) {
  if (stat === 0) {
    return ''
  }

  if (stat > 0) {
    return `${arrowUp} `
  }

  return `${arrowDown} `
}

const getPlusMinus = function () {
  return PLUS_MINUS
}

// Works on CP437 too
const PLUS_MINUS = '±'

const PREFIXES = {
  diff: getArrow,
  deviation: getPlusMinus,
}
