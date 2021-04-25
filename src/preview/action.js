import { goodColor, separatorColor } from '../report/utils/colors.js'

// Show keys available for user actions in previews
export const getActions = function (leftWidth) {
  const actions = [
    { key: 'Ctrl-C', name: 'Stop' },
    { key: 'Up/Down', name: 'Scroll' },
  ]

  if (actions.length === 0) {
    return
  }

  const actionsStr = actions.map(getAction).join(separatorColor(', '))
  return `${ACTIONS_LABEL.padEnd(leftWidth)}${actionsStr}`
}

const getAction = function ({ key, name }) {
  return `${goodColor(key)} ${separatorColor(`(${name})`)}`
}

export const ACTIONS_LABEL = 'Actions'
