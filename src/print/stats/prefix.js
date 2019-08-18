// Prepend some statistics with prefixes
export const addPrefix = function(stat, statPretty, name) {
  const getPrefix = PREFIXES[name]

  if (getPrefix === undefined) {
    return statPretty
  }

  const prefix = getPrefix(stat)
  const statPrettyA = `${prefix}${statPretty}`
  return statPrettyA
}

const getArrow = function(stat) {
  if (stat >= 0) {
    return `${UP_ARROW} `
  }

  return `${DOWN_ARROW} `
}

const getPlusMinus = function() {
  return PLUS_MINUS
}

// The symbols works on CP437 too
const UP_ARROW = '\u2191'
const DOWN_ARROW = '\u2193'
const PLUS_MINUS = '±'

const PREFIXES = {
  diff: getArrow,
  deviation: getPlusMinus,
  variance: getPlusMinus,
}
