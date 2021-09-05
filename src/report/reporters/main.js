import { boxplot } from './boxplot/main.js'
import { debug } from './debug.js'
import { histogram } from './histogram/main.js'
import { historyReporter as history } from './history.js'

export const REPORTERS = { debug, boxplot, histogram, history }
