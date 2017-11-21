import cluster from 'cluster'
import { createChainedObject } from './utils/misc'
import { DUPLICATE_PLUGIN_ERROR } from './constants'

let worker
let plugins = []

const createWorkerMethod = func => (...args) => {
  if (!cluster.isMaster) {
    return func(...args)
  }
}

export const use = createWorkerMethod(plugin => {
  if (plugins.indexOf(plugin) !== -1) {
    throw new Error(DUPLICATE_PLUGIN_ERROR)
  }
  plugins.push(plugin)
})

export const unuse = createWorkerMethod(plugin => {
  const key = plugins.indexOf(plugin)
  if (key !== -1) {
    plugins.splice(key, 1)
  }
})

const init = createWorkerMethod(() => {
  if (worker) {
    return
  }

  try {
    process.on('message', message => {
      if ('shutdown' === message.type) {
        shutdown()
      }
    })
    worker = {
      id: cluster.worker.id,
      stop: shutdown,
    }

    plugins.forEach(async plugin => {
      worker = { ...worker, ...((await plugin(worker)) || {}) }
    })

    cluster.worker.send('ready')
  } catch (err) {
    shutdown(err)
  }
})

export default createChainedObject({ use, unuse, init })

const shutdown = err => process.exit(Number(!!err))
