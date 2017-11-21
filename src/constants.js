import os from 'os'

// Errors
export const DUPLICATE_PLUGIN_ERROR = 'DUPLICATE_PLUGIN'
export const WATCHER_ALREADY_WATCHING_ERROR = 'WATCHER_ALREADY_WATCHING'
export const WATCHER_ALREADY_STOPPED_ERROR = 'WATCHER_ALREADY_STOPPED'

// Events
export const MASTER_INIT_EVENT = 'MASTER_INIT'
export const WORKER_CONNECT_EVENT = 'WORKER_CONNECT'
export const WORKER_DISCONNECT_EVENT = 'WORKER_DISCONNECT'
export const WORKER_KILLED_EVENT = 'WORKER_KILLED'
export const WORKER_WILL_CONNECT_EVENT = 'WORKER_WILL_CONNECT'
export const WORKER_WILL_DISCONNECT_EVENT = 'WORKER_WILL_DISCONNECT'
export const WORKER_WILL_BE_KILLED_EVENT = 'WORKER_WILL_BE_KILLED'

// Options
export const DEFAULT_OPTIONS = {
  maxWorker: os.cpus().length,
  maxFailuresByUpdate: 5,
  shutdownDelay: 5000,
  keepFresh: false,
  keepSync: true,
  src: './index.js',
  watchDebounce: 100,
  require: [],
}

export const OPTION_KEYS = Object.keys(DEFAULT_OPTIONS)
