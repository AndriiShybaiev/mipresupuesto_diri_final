import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import transactionService from '../services/TransactionService'
import logger from '../services/logging'

// ─── Async thunks ────────────────────────────────────────────────────────────

export const startTransactionsSubscription = createAsyncThunk(
  'budget/startTransactionsSubscription',
  async (_arg, thunkApi) => {
    try {
      logger.debug('Transactions: subscribe start (thunk)')

      const unsub = transactionService.subscribe((transactions) => {
        thunkApi.dispatch(transactionsReceived(transactions))
      })

      thunkApi.dispatch(transactionsSubscriptionStarted(unsub))
    } catch (e) {
      return thunkApi.rejectWithValue(String(e))
    }
  },
)

export const stopTransactionsSubscription = createAsyncThunk(
  'budget/stopTransactionsSubscription',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState()
    const unsub = state.budget?.transactionsUnsubscribe

    if (unsub) unsub()
    thunkApi.dispatch(transactionsSubscriptionStopped())
  },
)

export const addTransaction = createAsyncThunk(
  'budget/addTransaction',
  async (input, thunkApi) => {
    try {
      logger.info(`UI: add transaction; concept=${input.concept}`)
      await transactionService.add(input)
    } catch (e) {
      return thunkApi.rejectWithValue(String(e))
    }
  },
)

export const updateTransaction = createAsyncThunk(
  'budget/updateTransaction',
  async ({ id, input }, thunkApi) => {
    try {
      logger.info(`UI: update transaction; id=${id}`)
      await transactionService.update(id, input)
    } catch (e) {
      return thunkApi.rejectWithValue(String(e))
    }
  },
)

export const removeTransaction = createAsyncThunk(
  'budget/removeTransaction',
  async ({ id }, thunkApi) => {
    try {
      logger.warn(`UI: remove transaction; id=${id}`)
      await transactionService.remove(id)
    } catch (e) {
      return thunkApi.rejectWithValue(String(e))
    }
  },
)

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState = {
  // UI
  activeView: 'dashboard',
  monthFilter: 'current',
  search: '',
  showModal: false,
  editingTransaction: null, // { id, ...fields } — transaction being edited

  // Data
  transactions: [],
  transactionsStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  transactionsLoading: false,
  transactionsError: null,

  // User feedback
  statusMessage: undefined,

  // Non-serializable (serializableCheck disabled in store)
  transactionsUnsubscribe: undefined,
}

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setView(state, action) {
      state.activeView = action.payload
    },
    setMonthFilter(state, action) {
      state.monthFilter = action.payload
    },
    setSearch(state, action) {
      state.search = action.payload
    },
    openModal(state) {
      state.showModal = true
      state.editingTransaction = null
    },
    closeModal(state) {
      state.showModal = false
      state.editingTransaction = null
    },
    openEditModal(state, action) {
      state.editingTransaction = action.payload
      state.showModal = true
    },

    transactionsSubscriptionStarted(state, action) {
      if (state.transactionsUnsubscribe) state.transactionsUnsubscribe()
      state.transactionsUnsubscribe = action.payload
      state.transactionsStatus = 'succeeded'
      state.transactionsLoading = false
      state.transactionsError = null
      state.statusMessage = 'Transactions subscription started.'
    },
    transactionsSubscriptionStopped(state) {
      if (state.transactionsUnsubscribe) state.transactionsUnsubscribe()
      state.transactionsUnsubscribe = undefined
      state.transactionsStatus = 'idle'
      state.transactionsLoading = false
      state.statusMessage = 'Transactions subscription stopped.'
    },
    transactionsReceived(state, action) {
      state.transactions = action.payload
      state.transactionsStatus = 'succeeded'
      state.transactionsLoading = false
      state.transactionsError = null
      state.statusMessage = `Transactions updated: ${action.payload.length}`
    },
    transactionsFailed(state, action) {
      state.transactionsStatus = 'failed'
      state.transactionsLoading = false
      state.transactionsError = action.payload
      state.statusMessage = 'Error loading transactions.'
    },
  },

  extraReducers: (builder) => {
    builder
      // ── subscribe ──────────────────────────────────────────────────────────
      .addCase(startTransactionsSubscription.pending, (state) => {
        state.transactionsStatus = 'loading'
        state.transactionsLoading = true
        state.transactionsError = null
        state.statusMessage = 'Subscribing to transactions...'
      })
      .addCase(startTransactionsSubscription.rejected, (state, action) => {
        state.transactionsStatus = 'failed'
        state.transactionsLoading = false
        state.transactionsError = action.payload ?? action.error.message ?? 'Unknown error'
        state.statusMessage = 'Failed to subscribe to transactions.'
      })

      // ── add ────────────────────────────────────────────────────────────────
      .addCase(addTransaction.pending, (state) => {
        state.statusMessage = 'Saving transaction...'
      })
      .addCase(addTransaction.fulfilled, (state) => {
        state.statusMessage = 'Transaction saved.'
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.statusMessage = `Failed to save: ${action.payload ?? action.error.message}`
      })

      // ── update ─────────────────────────────────────────────────────────────
      .addCase(updateTransaction.pending, (state) => {
        state.statusMessage = 'Updating transaction...'
      })
      .addCase(updateTransaction.fulfilled, (state) => {
        state.statusMessage = 'Transaction updated.'
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.statusMessage = `Failed to update: ${action.payload ?? action.error.message}`
      })

      // ── remove ─────────────────────────────────────────────────────────────
      .addCase(removeTransaction.pending, (state) => {
        state.statusMessage = 'Deleting transaction...'
      })
      .addCase(removeTransaction.fulfilled, (state) => {
        state.statusMessage = 'Transaction deleted.'
      })
      .addCase(removeTransaction.rejected, (state, action) => {
        state.statusMessage = `Failed to delete: ${action.payload ?? action.error.message}`
      })
  },
})

export const {
  setView,
  setMonthFilter,
  setSearch,
  openModal,
  closeModal,
  openEditModal,
  transactionsSubscriptionStarted,
  transactionsSubscriptionStopped,
  transactionsReceived,
  transactionsFailed,
} = budgetSlice.actions

export const budgetActions = budgetSlice.actions

export default budgetSlice.reducer
