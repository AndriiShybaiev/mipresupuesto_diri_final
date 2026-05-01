import { configureStore } from '@reduxjs/toolkit'
import budgetReducer from './budgetSlice'
import logger from '../services/logging'

const loggerMiddleware = (storeAPI) => (next) => (action) => {
  logger.debug(`[redux] action: ${action?.type}`)
  const result = next(action)
  logger.debug(`[redux] state: ${JSON.stringify(storeAPI.getState())}`)
  return result
}

export const store = configureStore({
  reducer: {
    budget: budgetReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed to store unsubscribe fn in state
    }).concat(loggerMiddleware),
})
