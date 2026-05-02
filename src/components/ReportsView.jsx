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
    <section
      className="grid grid-cols-3 gap-3"
      style={{ animation: 'fadeUp 420ms ease both' }}
    >
      <article className="border-2 border-gray-800 bg-white p-4 shadow-sm">
        <p className="m-0 mb-2 text-gray-500 text-sm">{t.topExpense}</p>
        <strong className="block">
          {reportData.topExpense
            ? `${categoryLabel(reportData.topExpense[0], t)} (${formatCurrency(reportData.topExpense[1])})`
            : '-'}
        </strong>
      </article>
      <article className="border-2 border-gray-800 bg-white p-4 shadow-sm">
        <p className="m-0 mb-2 text-gray-500 text-sm">{t.recentMovement}</p>
        <strong className="block">
          {reportData.latest
            ? `${reportData.latest.date} - ${reportData.latest.concept} (${formatCurrency(reportData.latest.amount)})`
            : '-'}
        </strong>
      </article>
      <article className="border-2 border-gray-800 bg-white p-4 shadow-sm">
        <p className="m-0 mb-2 text-gray-500 text-sm">{t.totalMovements}</p>
        <strong className="block text-2xl">{reportData.movementCount}</strong>
      </article>
    </section>
  )
}
