#!/usr/bin/env node
import { startRunner } from '../common/ipc.js'

import { load } from './load/main.js'
import { measure } from './measure/main.js'

startRunner({ load, measure })
