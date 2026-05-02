import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../contexts/LanguageContext'
import budgetService from '../services/BudgetService'
import { categoryLabel, formatCurrency, monthlyTransactions } from '../services/financeService'

export default function BudgetsView() {
  const { t } = useLanguage()
  const { transactions } = useSelector((state) => state.budget)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const rows = useMemo(() => {
    const monthTransactions = monthlyTransactions(transactions, currentMonth)
    return budgetService.getRows(monthTransactions)
  }, [transactions, currentMonth])

  return (
    <section
      className="border-2 border-gray-800 bg-white p-4 shadow-sm"
      style={{ animation: 'fadeUp 420ms ease both' }}
    >
      <h3 className="m-0 mb-4 font-bold">{t.budgetsTitle}</h3>
      <div className="grid gap-3">
        {rows.map((row) => {
          const overBudget = row.available < 0
          return (
            <article key={row.category} className="border border-gray-300 p-3">
              <div className="flex justify-between gap-4 mb-2">
                <strong>{categoryLabel(row.category, t)}</strong>
                <span className="text-gray-600 text-sm">
                  {formatCurrency(row.used)} / {formatCurrency(row.limit)}
                </span>
              </div>

              <div className="h-2.5 border border-gray-300 bg-gray-100">
                <div
                  className={`h-full ${overBudget ? 'bg-gradient-to-r from-orange-400 to-red-600' : 'bg-gradient-to-r from-teal-300 to-teal-600'}`}
                  style={{ width: `${row.ratio}%` }}
                />
              </div>

              <p className={`mt-1 text-sm ${overBudget ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>
                {overBudget ? t.overBudget : t.available}: {formatCurrency(Math.abs(row.available))}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
