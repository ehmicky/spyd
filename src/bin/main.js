#!/usr/bin/env node
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { readPackageUp } from 'read-pkg-up'
import UpdateNotifier from 'update-notifier'

import { handleCliError } from '../error/cli.js'
import { run, show, remove, dev } from '../main.js'

import { parseCliFlags } from './parse.js'
import { defineCli } from './top.js'

// Parse CLI flags then execute commands.
// We use dot-delimited flags because:
//  - This allows user-defined identifiers to use dashes without conflicting
//    with CLI flags parsing
//  - This makes it clear that those flags are meant to be nested objects in
//    the YAML configuration file
// The programmatic entry points can also be used:
//  - The configuration is the same:
//     - This makes it easier for users to get consistent behavior between the
//       CLI and programmatic interfaces
//     - But this might require setting some configuration properties which
//       might make more sense programmatically, depending on the use case,
//       especially:
//        - `config: []` or `config: "path"` to remove the default
//          configuration lookup
//        - `reporter: []` to remove reporting
//  - The return value for most methods is a promise which resolves to the same
//    `result` that would be passed to reporters
//  - Any exception should be handled
const runCli = async function () {
  try {
    await checkUpdate()

    const yargs = defineCli()
    const { command, configFlags } = parseCliFlags(yargs)
    await COMMANDS[command](configFlags)
  } catch (error) {
    handleCliError(error, { types: ERROR_PROPS })
  }
}

// TODO: use static JSON imports once those are possible
const checkUpdate = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const { packageJson } = await readPackageUp({ cwd, normalize: false })
  UpdateNotifier({ pkg: packageJson }).notify()
}

const COMMANDS = { run, show, remove, dev }

// Error type-specific behavior
const ERROR_PROPS = {
  default: { exitCode: 5 },
  CoreError: { exitCode: 5 },
  PluginError: { exitCode: 4 },
  UserCodeError: { exitCode: 3 },
  UserError: { exitCode: 2, short: true },
  LimitError: { exitCode: 1, short: true },
  StopError: { exitCode: 0, short: true },
}

runCli()
