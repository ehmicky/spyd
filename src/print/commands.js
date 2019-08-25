import { blue } from 'chalk'

// Add `benchmark.commandsPretty`, CLI-friendly serialization of
// `benchmark.commands`
export const prettifyCommands = function(commands) {
  const header = blue.bold('Runners:')
  const body = commands.map(getDescription).join('\n')
  return `${header}\n${body}`
}

const getDescription = function({ description }) {
  return `  ${description}`
}
