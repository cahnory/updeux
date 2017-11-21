import cluster from 'cluster'
import os from 'os'
import { EventEmitter } from 'events'
import { createChainedObject } from './utils/misc'

import {
  DUPLICATE_PLUGIN_ERROR,
  MASTER_INIT_EVENT,
  WORKER_CONNECT_EVENT,
  WORKER_DISCONNECT_EVENT,
  WORKER_KILLED_EVENT,
  WORKER_WILL_CONNECT_EVENT,
  WORKER_WILL_DISCONNECT_EVENT,
  WORKER_WILL_BE_KILLED_EVENT,
} from './constants'

const eventEmitter = new EventEmitter()
let master
let started = false
let plugins = []
let workers = []
let updates = 0
let failures = 0
let settings = {
  maxWorker: Infinity,
  maxFailuresByUpdate: 5,
  shutdownDelay: 5000,
}

const createMasterMethod = func => (...args) => {
  if (cluster.isMaster) {
    return func(...args)
  }
}

export const use = createMasterMethod(plugin => {
  if (plugins.indexOf(plugin) !== -1) {
    throw new Error(DUPLICATE_PLUGIN_ERROR)
  }
  plugins.push(plugin)
})

export const unuse = createMasterMethod(plugin => {
  const key = plugins.indexOf(plugin)
  if (key !== -1) {
    plugins.splice(key, 1)
  }
})

export const on = createMasterMethod((event, callback) => {
  eventEmitter.on(event, callback)
})
export const off = createMasterMethod((event, callback) => {
  eventEmitter.removeListener(event, callback)
})

export const init = createMasterMethod(() => {
  if (master) {
    return
  }

  cluster.on('fork', workerWillConnect)
  cluster.on('exit', workerDidDisconnect) // disconnect too?
  process.on('beforeExit', stop) // error, death too?
  process.on('SIGINT', kill)

  master = createChainedObject({
    settings: options => updateSettings(options),
    update: options => updateWorkers(options),
    start,
    stop,
    status: getStatus,
    on,
    off,
  })

  plugins.forEach(async plugin => {
    master = { ...master, ...((await plugin(master)) || {}) }
  })

  triggerEvent(MASTER_INIT_EVENT)
})

export default createChainedObject({ use, unuse, on, off, init })

const start = () => {
  if (!started) {
    started = true
    handleUpdate()
  }
}

const stop = () => {
  if (started) {
    started = false
    handleUpdate()
  }
}

const getStatus = () => ({
  started,
  updates,
  failures,
  workers: [...workers],
  total: workers.length,
})

const kill = () => {
  started = false
  workers.map(worker => worker.kill())
  process.exit()
}

const updateWorkers = () => {
  updates += 1
  failures = 0
  handleUpdate()
}

const updateSettings = options => {
  if (options) {
    settings = { ...settings, ...options }
    settings.maxWorker = Math.min(settings.maxWorker, os.cpus().length)
    handleUpdate()
  }
}

const handleUpdate = () => {
  // master is stopped or reached max failures
  if (!started || failures >= settings.maxFailuresByUpdate) {
    if (hasConnectedWorker()) {
      disconnectWorker()
    }
    // master is working properly
  } else if (workers.length < settings.maxWorker) {
    connectWorker()
    // need less workers
  } else if (workers.length > settings.maxWorker) {
    disconnectWorker()
    // need worker(s) update
  } else if (getFirstOutdatedWorker()) {
    disconnectWorker()
  }
}

const connectWorker = () => cluster.fork()

const disconnectWorker = target => {
  // find an outdated worker or the oldest
  const worker = target || getFirstOutdatedWorker() || getFirstConnectedWorker()

  // worker is already disconnected
  if (!cluster.workers[worker.id]) {
    workerDidDisconnect(worker)
    handleUpdate()
  } else {
    triggerEvent(WORKER_WILL_DISCONNECT_EVENT, { worker })

    // clean shutdown
    worker.send({ type: 'shutdown', from: 'master' })
    worker.disconnect()
    worker.on('exit', () => {
      clearTimeout(timeout)
    })

    // hard shutdown
    let timeout = setTimeout(() => {
      triggerEvent(WORKER_WILL_BE_KILLED_EVENT, { worker })
      worker.kill()
      triggerEvent(WORKER_KILLED_EVENT, { worker })
    }, settings.shutdownDelay)
  }
}

const workerWillConnect = worker => {
  worker.update = updates
  worker.connected = false
  workers = [...workers, worker]
  triggerEvent(WORKER_WILL_CONNECT_EVENT, { worker })

  worker.on('error', () => workerDidDisconnect(worker, true))
  worker.on('message', message => {
    switch (message) {
      case 'ready':
        workerDidConnect(worker)
        break
    }
  })
}

const workerDidConnect = worker => {
  // worker must be known & not connected
  if (-1 !== workers.indexOf(worker) && !worker.connected) {
    worker.connected = true
    triggerEvent(WORKER_CONNECT_EVENT, { worker })
    handleUpdate()
  }
}

const workerDidDisconnect = (worker, err) => {
  if (-1 !== workers.indexOf(worker)) {
    failures += Number(!!err)
    workers = workers.filter(w => w !== worker)
    worker.connected = false
    triggerEvent(WORKER_DISCONNECT_EVENT, { worker })

    if (failures > settings.maxFailuresByUpdate) {
      stop()
    } else {
      handleUpdate()
    }
  }
}

const getFirstOutdatedWorker = () =>
  workers.find(({ update, connected }) => connected && update !== updates)

const getFirstConnectedWorker = () => workers.find(({ connected }) => connected)

const hasConnectedWorker = () => !!getFirstConnectedWorker()

const triggerEvent = (event, options = {}) => {
  eventEmitter.emit(event, { master, ...options })
}
