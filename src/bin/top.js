import { argv } from 'node:process'

import yargs from 'yargs'
// eslint-disable-next-line n/file-extension-in-import
import { hideBin } from 'yargs/helpers'

import { COMMANDS } from './commands/main.js'

// Define all CLI commands and flags
export const defineCli = () =>
  yargs(hideBin(argv))
    .command(COMMANDS.map(getCommand))
    .usage('')
    // Disable the default conversion made by yargs of dasherized CLI flags to
    // camelCase because user-defined identifiers can use dashes
    .parserConfiguration({ 'camel-case-expansion': false })
    .strict()

const getCommand = ({ command, describe, config, usage, examples }) => ({
  command,
  describe,
  builder: (commandYargs) =>
    commandYargs.options(config).usage(usage).example(examples),
})
