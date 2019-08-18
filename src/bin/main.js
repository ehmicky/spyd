#!/usr/bin/env node
import { exit } from 'process'

import * as commands from '../main.js'

import { defineCli } from './top.js'
import { parseOpts } from './parse.js'

// Parse CLI arguments then run tasks
const runCli = async function() {
  try {
    const yargs = defineCli()
    const [command, opts] = parseOpts(yargs)
    await commands[command](opts)
  } catch (error) {
    console.error(error.message)
    exit(1)
  }
}

runCli()
