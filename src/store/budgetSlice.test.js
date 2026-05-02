import { describe, it, expect } from 'vitest'
import reducer, { budgetActions } from './budgetSlice'

// Bootstrap the initial state via a dummy action
const initialState = reducer(undefined, { type: '@@INIT' })

// ─── Sanity check ─────────────────────────────────────────────────────────────

describe('budgetSlice initial state', () => {
  it('has correct default values', () => {
    expect(initialState.showModal).toBe(false)
    expect(initialState.editingTransaction).toBeNull()
    expect(initialState.monthFilter).toBe('current')
    expect(initialState.search).toBe('')
    expect(initialState.transactions).toEqual([])
    expect(initialState.isMutating).toBe(false)
    expect(initialState.transactionsLoading).toBe(false)
  })
})

// ─── UI reducers ─────────────────────────────────────────────────────────────

describe('setMonthFilter', () => {
  it('updates monthFilter', () => {
    const state = reducer(initialState, budgetActions.setMonthFilter('all'))
    expect(state.monthFilter).toBe('all')
  })

  it('does not mutate other fields', () => {
    const state = reducer(initialState, budgetActions.setMonthFilter('all'))
    expect(state.search).toBe(initialState.search)
  })
})

describe('setSearch', () => {
  it('updates search', () => {
    const state = reducer(initialState, budgetActions.setSearch('comida'))
    expect(state.search).toBe('comida')
  })
})

// ─── Modal reducers ──────────────────────────────────────────────────────────

describe('openModal', () => {
  it('sets showModal to true and clears editingTransaction', () => {
    const withEdit = { ...initialState, editingTransaction: { id: '1' } }
    const state = reducer(withEdit, budgetActions.openModal())
    expect(state.showModal).toBe(true)
    expect(state.editingTransaction).toBeNull()
  })
})

describe('closeModal', () => {
  it('sets showModal to false', () => {
    const opened = reducer(initialState, budgetActions.openModal())
    const state = reducer(opened, budgetActions.closeModal())
    expect(state.showModal).toBe(false)
  })

  it('clears editingTransaction on close', () => {
    const tx = { id: '1', concept: 'Test', category: 'food', amount: 50, date: '2026-05-01' }
    const editing = reducer(initialState, budgetActions.openEditModal(tx))
    const state = reducer(editing, budgetActions.closeModal())
    expect(state.editingTransaction).toBeNull()
  })
})

describe('openEditModal', () => {
  it('sets editingTransaction and shows modal', () => {
    const tx = { id: '1', concept: 'Nomina', category: 'income', amount: 2000, date: '2026-05-01' }
    const state = reducer(initialState, budgetActions.openEditModal(tx))
    expect(state.showModal).toBe(true)
    expect(state.editingTransaction).toEqual(tx)
  })
})

// ─── Data reducers ───────────────────────────────────────────────────────────

describe('transactionsReceived', () => {
  it('replaces the transactions list', () => {
    const txs = [
      { id: '1', concept: 'A', category: 'food', amount: 10, date: '2026-05-01' },
    ]
    const state = reducer(initialState, budgetActions.transactionsReceived(txs))
    expect(state.transactions).toEqual(txs)
  })

  it('clears loading and error flags', () => {
    const loading = { ...initialState, transactionsLoading: true, transactionsError: 'old error' }
    const state = reducer(loading, budgetActions.transactionsReceived([]))
    expect(state.transactionsLoading).toBe(false)
    expect(state.transactionsError).toBeNull()
  })
})

describe('transactionsFailed', () => {
  it('stores the error message and sets status to failed', () => {
    const state = reducer(initialState, budgetActions.transactionsFailed('Network error'))
    expect(state.transactionsError).toBe('Network error')
    expect(state.transactionsStatus).toBe('failed')
    expect(state.transactionsLoading).toBe(false)
  })
})

describe('clearStatusMessage', () => {
  it('sets statusMessage to undefined', () => {
    const withMsg = { ...initialState, statusMessage: 'Transaction saved.' }
    const state = reducer(withMsg, budgetActions.clearStatusMessage())
    expect(state.statusMessage).toBeUndefined()
  })
})
