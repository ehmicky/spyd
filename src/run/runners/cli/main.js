#!/usr/bin/env node
import { performRunner } from '../common/ipc.js'

import { before, measure, after } from './measure.js'
import { start } from './start/main.js'

performRunner({ start, before, measure, after })
