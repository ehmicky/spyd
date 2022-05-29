import { config } from './config.js'
import { reportTerminal } from './report.js'

// eslint-disable-next-line import/no-default-export
export default {
  id: 'history',
  capabilities: { history: true },
  config,
  reportTerminal,
}
