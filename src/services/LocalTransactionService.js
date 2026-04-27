import { ITransactionService } from './ITransactionService'
import { START_TRANSACTIONS } from '../entities/entities'
import logger from './logging'

const TRANSACTIONS_KEY = 'mipresupuesto_transactions'

function readTransactions() {
  const raw = localStorage.getItem(TRANSACTIONS_KEY)
  if (!raw) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(START_TRANSACTIONS))
    return START_TRANSACTIONS
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : START_TRANSACTIONS
  } catch {
    return START_TRANSACTIONS
  }
}

function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export class LocalTransactionService extends ITransactionService {
  constructor() {
    super()
    this.listeners = new Set()
  }

  notify(data) {
    this.listeners.forEach((callback) => callback(data))
  }

  list() {
    return readTransactions()
  }

  add(transactionInput) {
    const current = this.list()
    const next = [
      {
        id: `t${crypto.randomUUID()}`,
        ...transactionInput,
      },
      ...current,
    ]

    saveTransactions(next)
    logger.info(`Transaction added: ${transactionInput.concept}`)
    this.notify(next)
    return next
  }

  subscribe(callback) {
    this.listeners.add(callback)
    callback(this.list())

    return () => {
      this.listeners.delete(callback)
    }
  }
}
