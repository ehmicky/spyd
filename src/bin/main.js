#!/usr/bin/env node
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readPackageUp } from 'read-package-up'
import updateNotifier from 'update-notifier'

import { BaseError, UnknownError } from '../error/main.js'
import { dev, remove, run, show } from '../main.js'

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
const runCli = async () => {
  try {
    await checkUpdate()

    const yargs = defineCli()
    const { command, configFlags } = parseCliFlags(yargs)
    await COMMANDS[command](configFlags)
  } catch (error) {
    BaseError.normalize(error, UnknownError).exit()
  }
}

// TODO: use static JSON imports once those are possible
const checkUpdate = async () => {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const { packageJson } = await readPackageUp({ cwd, normalize: false })
  updateNotifier({ pkg: packageJson }).notify()
}

const COMMANDS = { run, show, remove, dev }

await runCli()
