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
    <section className="panel fade-up">
      <h3>{t.budgetsTitle}</h3>
      <div className="budget-list">
        {rows.map((row) => {
          const overBudget = row.available < 0
          return (
            <article key={row.category} className="budget-row">
              <header>
                <strong>{categoryLabel(row.category, t)}</strong>
                <span>
                  {formatCurrency(row.used)} / {formatCurrency(row.limit)}
                </span>
              </header>

              <div className="progress-track">
                <div
                  className={`progress-fill ${overBudget ? 'danger' : ''}`}
                  style={{ width: `${row.ratio}%` }}
                ></div>
              </div>

              <p className={overBudget ? 'danger-text' : ''}>
                {overBudget ? t.overBudget : t.available}: {formatCurrency(Math.abs(row.available))}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
