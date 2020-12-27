#!/usr/bin/env node
import { performRunner } from '../common/ipc.js'

import { measure } from './measure/main.js'
import { start } from './start/main.js'

performRunner({ start, measure })
