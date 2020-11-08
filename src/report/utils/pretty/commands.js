import { addIndentedPrefix } from '../prefix.js'

// Add `benchmark.commandsPretty`, CLI-friendly serialization of
// `benchmark.commands`
export const prettifyCommands = function (commands) {
  if (commands === undefined) {
    return
  }

  const body = commands.map(getDescription).join('\n')
  const bodyA = addIndentedPrefix('Runners', body)
  return bodyA
}

const getDescription = function ({ description }) {
  return description
}
