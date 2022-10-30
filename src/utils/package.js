import { createRequire } from 'module'

// TODO: replace with a JSON import after dropping support for Node <16.14.0
const {
  bugs: { url },
  engines: { node },
} = createRequire(import.meta.url)('../../../package.json')

// Bugs URL
export const bugs = url

// Node.js version
export const nodeVersion = node
