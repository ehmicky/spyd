import { prettifyValue } from '../prettify_value.js'

// Add `benchmark.commandsPretty`, CLI-friendly serialization of
// `benchmark.commands`
export const prettifyCommands = function (commands) {
  if (commands === undefined) {
    return
  }

  return prettifyValue({ Runners: commands.map(getDescription) })
}

const getDescription = function ({ description }) {
  return description
}
