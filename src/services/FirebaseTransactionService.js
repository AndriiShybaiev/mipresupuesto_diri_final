import { ref, push, onValue, update, remove } from 'firebase/database'

import { ITransactionService } from './ITransactionService'
import { auth, db } from '../firebaseConfig'
import logger from './logging'

function userTransactionsPath(uid) {
  return `transactions/${uid}`
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
  add(transactionInput) {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('User not authenticated')

    const txRef = ref(db, userTransactionsPath(uid))
    const payload = {
      date: transactionInput.date,
      concept: transactionInput.concept,
      category: transactionInput.category,
      amount: transactionInput.amount,
    }

    logger.info(`Transaction added: ${transactionInput.concept}`)
    return push(txRef, payload).then((newRef) => newRef.key)
  }

  async update(id, transactionInput) {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('User not authenticated')

    const txRef = ref(db, `${userTransactionsPath(uid)}/${id}`)
    await update(txRef, {
      date: transactionInput.date,
      concept: transactionInput.concept,
      category: transactionInput.category,
      amount: transactionInput.amount,
    })
    logger.info(`Transaction updated: ${id}`)
  }

  async remove(id) {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('User not authenticated')

    const txRef = ref(db, `${userTransactionsPath(uid)}/${id}`)
    await remove(txRef)
    logger.warn(`Transaction deleted: ${id}`)
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

    const unsub = onValue(
      txRef,
      (snapshot) => {
        const data = snapshot.val()
        const transactions = data
          ? Object.entries(data).map(([id, value]) => normalizeTransaction(id, value))
          : []

        callback(transactions.sort((a, b) => b.date.localeCompare(a.date)))
      },
      (error) => {
        logger.error(`Transaction subscribe error: ${String(error)}`)
      },
    )

    return unsub
  }
}
