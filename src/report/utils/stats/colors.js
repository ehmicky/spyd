import { red, green } from 'chalk'

// Add colors on `diff`
export const addColors = function (stat, statPretty, name) {
  const getColor = COLORS[name]

  if (getColor === undefined) {
    return statPretty
  }

  const color = getColor(stat)
  const statPrettyA = color(statPretty)
  return statPrettyA
}

const getSignColor = function (stat) {
  if (stat >= 0) {
    return red
  }

  return green
}

const COLORS = {
  diff: getSignColor,
}
