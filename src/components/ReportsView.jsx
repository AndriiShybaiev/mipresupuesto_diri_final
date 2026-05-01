import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../contexts/LanguageContext'
import {
  calculateReports,
  categoryLabel,
  formatCurrency,
  monthlyTransactions,
} from '../services/financeService'

export default function ReportsView() {
  const { t } = useLanguage()
  const { transactions } = useSelector((state) => state.budget)
  const currentMonth = new Date().toISOString().slice(0, 7)

  const reportData = useMemo(() => {
    const monthTransactions = monthlyTransactions(transactions, currentMonth)
    return calculateReports(monthTransactions, transactions)
  }, [transactions, currentMonth])

  return (
    <section className="panel report-cards fade-up">
      <article>
        <p>{t.topExpense}</p>
        <strong>
          {reportData.topExpense
            ? `${categoryLabel(reportData.topExpense[0], t)} (${formatCurrency(reportData.topExpense[1])})`
            : '-'}
        </strong>
      </article>
      <article>
        <p>{t.recentMovement}</p>
        <strong>
          {reportData.latest
            ? `${reportData.latest.date} - ${reportData.latest.concept} (${formatCurrency(reportData.latest.amount)})`
            : '-'}
        </strong>
      </article>
      <article>
        <p>{t.totalMovements}</p>
        <strong>{reportData.movementCount}</strong>
      </article>
    </section>
  )
}
