import { commands } from './commands.js'
import { system } from './system.js'

export const node = {
  id: 'node',
  title: 'Node',
  extensions: ['js', 'ts', 'jsx', 'tsx', 'es6', 'mjs'],
  commands,
  system,
}
