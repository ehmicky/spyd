import yargs from 'yargs'

import { COMMANDS } from './commands/main.js'

// Define all CLI commands and options
export const defineCli = function() {
  return COMMANDS.reduce(addCommand, yargs)
    .usage('')
    .help()
    .version()
    .strict()
}

const addCommand = function(
  yargsA,
  { input, description, config, usage, examples },
) {
  return yargsA.command(input, description, commandYargs =>
    addCommandInfo(commandYargs, { config, usage, examples }),
  )
}

const addCommandInfo = function(commandYargs, { config, usage, examples }) {
  const commandYargsA = commandYargs.options(config).usage(usage)
  return examples.reduce(addExample, commandYargsA)
}

const addExample = function(commandYargs, example) {
  return commandYargs.example(...example)
}
