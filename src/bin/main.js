#!/usr/bin/env node
import { dirname } from 'path'
import process from 'process'
import { fileURLToPath } from 'url'

import { readPackageUpAsync } from 'read-pkg-up'
import UpdateNotifier from 'update-notifier'

import { normalizeError, getErrorProps } from '../error/main.js'
import { run, show, remove, dev } from '../main.js'
import { addNonTopPadding } from '../report/utils/indent.js'

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
    await COMMANDS[command](configFlags)
  } catch (error) {
    handleCliError(error)
  }
}

// TODO: use static JSON imports once those are possible
const checkUpdate = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const { packageJson } = await readPackageUpAsync({ cwd, normalize: false })
  UpdateNotifier({ pkg: packageJson }).notify()
}

const COMMANDS = { run, show, remove, dev }

// Print CLI errors and exit, depending on the error type
const handleCliError = function (error) {
  const errorA = normalizeError(error)
  const { exitCode, printStack, indented } = getErrorProps(errorA)
  const errorMessage = printStack ? errorA.stack : errorA.message
  const errorMessageA = indented ? addNonTopPadding(errorMessage) : errorMessage
  console.error(errorMessageA)
  process.exitCode = exitCode
}

runCli()
