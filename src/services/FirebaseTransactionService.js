import { ref, push, onValue, update, remove } from 'firebase/database'

import { ITransactionService } from './ITransactionService'
import { auth, db } from '../firebaseConfig'
import logger from './logging'

function userTransactionsPath(uid) {
  return `transactions/${uid}`
}

function userTransactionsPathScoped(uid) {
  return `users/${uid}/transactions`
}

function isPermissionDenied(error) {
  return String(error).toUpperCase().includes('PERMISSION_DENIED')
}

function normalizeTransaction(id, value) {
  return {
    id,
    date: value?.date ?? '',
    concept: value?.concept ?? '',
    category: value?.category ?? '',
    amount: typeof value?.amount === 'number' ? value.amount : Number(value?.amount ?? 0),
  }
}

export class FirebaseTransactionService extends ITransactionService {
  async add(transactionInput) {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('User not authenticated')

    const payload = {
      date: transactionInput.date,
      concept: transactionInput.concept,
      category: transactionInput.category,
      amount: transactionInput.amount,
    }

    try {
      const txRef = ref(db, userTransactionsPath(uid))
      const newRef = await push(txRef, payload)
      logger.info(`Transaction added: ${transactionInput.concept}`)
      return newRef.key
    } catch (error) {
      if (!isPermissionDenied(error)) throw error

      logger.warn('Legacy transactions path denied, retrying in users/{uid}/transactions')
      const txRefScoped = ref(db, userTransactionsPathScoped(uid))
      const newRef = await push(txRefScoped, payload)
      logger.info(`Transaction added (scoped): ${transactionInput.concept}`)
      return newRef.key
    }
  }

  async update(id, transactionInput) {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('User not authenticated')

    const payload = {
      date: transactionInput.date,
      concept: transactionInput.concept,
      category: transactionInput.category,
      amount: transactionInput.amount,
    }

    try {
      const txRef = ref(db, `${userTransactionsPath(uid)}/${id}`)
      await update(txRef, payload)
      logger.info(`Transaction updated: ${id}`)
    } catch (error) {
      if (!isPermissionDenied(error)) throw error

      logger.warn('Legacy transactions update denied, retrying in users/{uid}/transactions')
      const txRefScoped = ref(db, `${userTransactionsPathScoped(uid)}/${id}`)
      await update(txRefScoped, payload)
      logger.info(`Transaction updated (scoped): ${id}`)
    }
  }

  async remove(id) {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('User not authenticated')

    try {
      const txRef = ref(db, `${userTransactionsPath(uid)}/${id}`)
      await remove(txRef)
      logger.warn(`Transaction deleted: ${id}`)
    } catch (error) {
      if (!isPermissionDenied(error)) throw error

      logger.warn('Legacy transactions remove denied, retrying in users/{uid}/transactions')
      const txRefScoped = ref(db, `${userTransactionsPathScoped(uid)}/${id}`)
      await remove(txRefScoped)
      logger.warn(`Transaction deleted (scoped): ${id}`)
    }
  }

  list() {
    return []
  }

  subscribe(callback) {
    const uid = auth.currentUser?.uid
    if (!uid) {
      callback([])
      return () => {}
    }

    const txRef = ref(db, userTransactionsPath(uid))
    const txRefScoped = ref(db, userTransactionsPathScoped(uid))

    let activeUnsub = () => {}

    const subscribeByRef = (targetRef, mode) => onValue(
      targetRef,
      (snapshot) => {
        const data = snapshot.val()
        const transactions = data
          ? Object.entries(data).map(([id, value]) => normalizeTransaction(id, value))
          : []

        callback(transactions.sort((a, b) => b.date.localeCompare(a.date)))
        logger.debug(`Transactions subscribed in ${mode} mode`)
      },
      (error) => {
        if (mode === 'legacy' && isPermissionDenied(error)) {
          logger.warn('Legacy transactions subscribe denied, switching to users/{uid}/transactions')
          activeUnsub()
          activeUnsub = subscribeByRef(txRefScoped, 'scoped')
          return
        }
        logger.error(`Transaction subscribe error: ${String(error)}`)
      },
    )

    activeUnsub = subscribeByRef(txRef, 'legacy')

    return () => activeUnsub()
  }
}
