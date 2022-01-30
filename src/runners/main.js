// eslint-disable-next-line import/no-namespace
import * as cli from './cli/main.js'
// eslint-disable-next-line import/no-namespace
import * as node from './node/main.js'

export const RUNNERS = { node, cli }
export const DEFAULT_RUNNERS = ['node']
