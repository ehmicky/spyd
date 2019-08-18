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
  return yargsA.command(input, description, yargsB =>
    addCommandInfo(yargsB, { config, usage, examples }),
  )
}

const addCommandInfo = function(yargsA, { config, usage, examples }) {
  const yargsB = yargsA.options(config).usage(usage)
  return examples.reduce(addExample, yargsB)
}

const addExample = function(yargsA, example) {
  return yargsA.example(...example)
}
