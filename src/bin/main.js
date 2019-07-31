#!/usr/bin/env node
import { exit } from 'process'

import spyd from '../main.js'

import { defineCli } from './top.js'
import { parseOpts } from './parse.js'

// Parse CLI arguments then run tasks
const runCli = async function() {
  try {
    const yargs = defineCli()
    const opts = parseOpts(yargs)
    await spyd(opts)
  } catch (error) {
    runCliHandler(error)
  }
}

// If an error is thrown, print error's description, then exit with exit code 1
const runCliHandler = function({ message }) {
  console.error(message)

  exit(1)
}

runCli()
