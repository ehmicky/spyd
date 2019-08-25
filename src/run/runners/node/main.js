import { commands } from './commands.js'
import { system } from './system.js'

const extensions = ['js', 'ts', 'jsx', 'tsx', 'es6', 'mjs']

export const node = { id: 'node', title: 'Node', extensions, commands, system }
