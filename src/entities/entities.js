export const MENU_ITEMS = ['dashboard', 'transactions', 'budgets', 'reports']

export const BUDGET_LIMITS = {
  food: 350,
  home: 800,
  leisure: 180,
  transport: 120,
}

export const START_TRANSACTIONS = [
  { id: 't1', date: '2026-04-05', concept: 'Nomina', category: 'income', amount: 2000 },
  { id: 't2', date: '2026-04-06', concept: 'Lidl', category: 'food', amount: 50.45 },
  { id: 't3', date: '2026-04-08', concept: 'Alquiler', category: 'home', amount: 760 },
  { id: 't4', date: '2026-04-10', concept: 'Metro', category: 'transport', amount: 26.4 },
  { id: 't5', date: '2026-04-12', concept: 'Cine', category: 'leisure', amount: 29 },
  { id: 't6', date: '2026-03-03', concept: 'Nomina', category: 'income', amount: 1950 },
  { id: 't7', date: '2026-03-06', concept: 'Mercado', category: 'food', amount: 143.8 },
  { id: 't8', date: '2026-03-07', concept: 'Luz y agua', category: 'home', amount: 145 },
  { id: 't9', date: '2026-03-16', concept: 'Restaurante', category: 'leisure', amount: 67 },
]

export const INITIAL_NEW_TRANSACTION = {
  date: new Date().toISOString().slice(0, 10),
  concept: '',
  type: 'expense',
  category: 'food',
  amount: '',
}
