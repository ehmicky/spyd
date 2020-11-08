#!/usr/bin/env node
import process from 'process'

import readPkgUp from 'read-pkg-up'
import UpdateNotifier from 'update-notifier'

import { normalizeError, getErrorProps } from '../error/main.js'
import * as commands from '../main.js'

import { parseOpts } from './parse.js'
import { defineCli } from './top.js'

// Parse CLI arguments then run tasks
const runCli = async function () {
  try {
    await checkUpdate()

    const yargs = defineCli()
    const [command, opts] = parseOpts(yargs)
    await commands[command](opts)
  } catch (error) {
    handleCliError(error)
  }
}

const checkUpdate = async function () {
  const { packageJson } = await readPkgUp({ cwd: __dirname, normalize: false })
  UpdateNotifier({ pkg: packageJson }).notify()
}

// Print CLI errors and exit, depending on the error type
const handleCliError = function (error) {
  const errorA = normalizeError(error)
  const { exitCode, printStack } = getErrorProps(errorA)
  const errorMessage = printStack ? errorA.stack : errorA.message
  console.error(errorMessage)
  // eslint-disable-next-line fp/no-mutation
  process.exitCode = exitCode
}

runCli()
