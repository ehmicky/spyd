// Prepend some statistics with prefixes
export const getPrefix = function(stat, name) {
  const prefix = PREFIXES[name]

  if (prefix === undefined) {
    return ''
  }

  return prefix(stat)
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
