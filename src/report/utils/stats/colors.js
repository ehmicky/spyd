import { red, green } from 'chalk'

// Add colors on `diff`
export const addColors = function (stat, statPretty, name) {
  const getColor = COLORS[name]

  if (getColor === undefined) {
    return statPretty
  }

  const color = getColor(stat)

  if (color === undefined) {
    return statPretty
  }

  return color(statPretty)
}

const getSignColor = function (stat) {
  if (stat === 0) {
    return
  }

  if (stat > 0) {
    return red
  }

  return green
}

const COLORS = {
  diff: getSignColor,
}
