#!/usr/bin/env node
import process from 'process'

import readPkgUp from 'read-pkg-up'
import UpdateNotifier from 'update-notifier'

import { normalizeError, getErrorProps } from '../error/main.js'
import * as commands from '../main.js'

import { parseCliFlags } from './parse.js'
import { defineCli } from './top.js'

// Parse CLI flags then execute commands.
// We use dot-delimited flags because:
//  - This allows user-defined identifiers to use dashes without conflicting
//    with CLI flags parsing
//  - This makes it clear that those flags are meant to be nested objects in
//    the YAML configuration file
const runCli = async function () {
  try {
    await checkUpdate()

    const yargs = defineCli()
    const { command, configFlags } = parseCliFlags(yargs)
    await commands[command](configFlags)
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
  const { exitCode, printStack, indented } = getErrorProps(errorA)
  const errorMessage = printStack ? errorA.stack : errorA.message
  const errorMessageA = indented ? ` ${errorMessage}` : errorMessage
  console.error(errorMessageA)
  process.exitCode = exitCode
}

runCli()
