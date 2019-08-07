#!/usr/bin/env node
import { argv, exit } from 'process'

import { validateInput } from './validate.js'
import { getVersion } from './versions.js'
import { runNode } from './run.js'

// CLI that forwards its arguments to another node instance of a specific
// version range. The version range is specified as the first argument.
const runCli = async function() {
  try {
    const [versionRange, ...args] = argv.slice(2)
    const { exitCode } = await nve(versionRange, args)
    // Forward the exit code from the child process
    exit(exitCode)
  } catch (error) {
    // eslint-disable-next-line no-console, no-restricted-globals
    console.error(error.message)
    exit(1)
  }
}

// Forwards `args` to another node instance of a specific `versionRange`
const nve = async function(versionRange, args = []) {
  validateInput(versionRange, args)

  const versionA = await getVersion(versionRange)
  const { exitCode, signal } = await runNode(versionA, args)
  return { exitCode, signal }
}

runCli()
