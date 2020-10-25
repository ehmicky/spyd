import yargs from 'yargs'

import { COMMANDS } from './commands/main.js'

// Define all CLI commands and options
export const defineCli = function () {
  return COMMANDS.reduce(addCommand, yargs).usage('').strict()
}

const addCommand = function (
  yargsA,
  { input, description, config, usage, examples },
) {
  return yargsA.command(input, description, (commandYargs) =>
    addCommandInfo({ commandYargs, config, usage, examples }),
  )
}

const addCommandInfo = function ({ commandYargs, config, usage, examples }) {
  return commandYargs.options(config).usage(usage).example(examples)
}
