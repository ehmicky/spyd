import { action } from './action.js'
import { system } from './system.js'

const extensions = ['js', 'ts', 'jsx', 'tsx', 'es6', 'mjs']

export const node = { id: 'node', title: 'Node', extensions, action, system }
