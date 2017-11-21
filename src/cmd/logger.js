import {
  MASTER_INIT_EVENT,
  WORKER_CONNECT_EVENT,
  WORKER_DISCONNECT_EVENT,
  WORKER_KILLED_EVENT,
  WORKER_WILL_CONNECT_EVENT,
  WORKER_WILL_DISCONNECT_EVENT,
  WORKER_WILL_BE_KILLED_EVENT,
} from '../constants'

const createEventLogger = (master, event) =>
  master.on(event, () => console.log(event))

export const master = master => {
  createEventLogger(master, MASTER_INIT_EVENT)
  createEventLogger(master, WORKER_CONNECT_EVENT)
  createEventLogger(master, WORKER_DISCONNECT_EVENT)
  createEventLogger(master, WORKER_KILLED_EVENT)
  createEventLogger(master, WORKER_WILL_CONNECT_EVENT)
  createEventLogger(master, WORKER_WILL_DISCONNECT_EVENT)
  createEventLogger(master, WORKER_WILL_BE_KILLED_EVENT)
}

export default { master }
