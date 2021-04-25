import { goodColor, separatorColor } from '../report/utils/colors.js'

// Show keys available for user actions in previews
export const getInsructions = function (leftWidth) {
  const instructions = [
    { key: 'Ctrl-C', name: 'Stop' },
    { key: 'Up/Down', name: 'Scroll' },
  ]

  if (instructions.length === 0) {
    return
  }

  const instructionsStr = instructions
    .map(getInsruction)
    .join(separatorColor(', '))
  return `${ACTIONS_LABEL.padEnd(leftWidth)}${instructionsStr}`
}

const getInsruction = function ({ key, name }) {
  return `${goodColor(key)} ${separatorColor(`(${name})`)}`
}

export const ACTIONS_LABEL = 'Actions'
