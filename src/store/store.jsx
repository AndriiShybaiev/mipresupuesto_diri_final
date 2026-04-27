import { createContext, useContext, useEffect, useReducer } from 'react'
import transactionService from '../services/TransactionService'
import { budgetActions, budgetReducer, initialBudgetState } from './budgetSlice'

const BudgetStateContext = createContext(initialBudgetState)
const BudgetDispatchContext = createContext(() => {})

export function BudgetStoreProvider({ children }) {
  const [state, dispatch] = useReducer(budgetReducer, initialBudgetState)

  useEffect(() => {
    const unsubscribe = transactionService.subscribe((transactions) => {
      dispatch(budgetActions.setTransactions(transactions))
    })

    return unsubscribe
  }, [])

  return (
    <BudgetStateContext.Provider value={state}>
      <BudgetDispatchContext.Provider value={dispatch}>{children}</BudgetDispatchContext.Provider>
    </BudgetStateContext.Provider>
  )
}

export function useBudgetStore() {
  return useContext(BudgetStateContext)
}

export function useBudgetDispatch() {
  return useContext(BudgetDispatchContext)
}
