#!/usr/bin/env node
import { handleEvents } from '../common/ipc.js'

import { before, measure, after } from './measure.js'
import { start, end } from './start/main.js'

handleEvents({ start, before, measure, after, end })
