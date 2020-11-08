import { prettifyObject } from '../prefix.js'

// Add `benchmark.commandsPretty`, CLI-friendly serialization of
// `benchmark.commands`
export const prettifyCommands = function (commands) {
  if (commands === undefined) {
    return
  }

  return prettifyObject({ Runners: commands.map(getDescription) })
}

const getDescription = function ({ description }) {
  return description
}
