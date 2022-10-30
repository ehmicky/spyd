import { bugs } from '../../../utils/package.js'

import { config } from './config.js'
import { reportTerminal } from './report.js'

// eslint-disable-next-line import/no-default-export
export default {
  id: 'debug',
  capabilities: { debugStats: true },
  config,
  reportTerminal,
  bugs,
}
