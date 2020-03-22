#!/usr/bin/env node
import { exit } from 'process'

import UpdateNotifier from 'update-notifier'
import readPkgUp from 'read-pkg-up'

import * as commands from '../main.js'

import { defineCli } from './top.js'
import { parseOpts } from './parse.js'

// Parse CLI arguments then run tasks
const runCli = async function () {
  try {
    await checkUpdate()

    const yargs = defineCli()
    const [command, opts] = parseOpts(yargs)
    await commands[command](opts)
  } catch (error) {
    console.error(error.message)
    exit(1)
  }
}

const checkUpdate = async function () {
  const { packageJson } = await readPkgUp({ cwd: __dirname, normalize: false })
  UpdateNotifier({ pkg: packageJson }).notify()
}

runCli()
