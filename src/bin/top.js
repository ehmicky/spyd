import yargs from 'yargs'

import { COMMANDS } from './commands/main.js'

// Define all CLI commands and flags
export const defineCli = function () {
  return yargs.command(COMMANDS.map(getCommand)).usage('').strict()
}

const getCommand = function ({ command, describe, config, usage, examples }) {
  return {
    command,
    describe,
    builder: (commandYargs) =>
      commandYargs.options(config).usage(usage).example(examples),
  }
}
