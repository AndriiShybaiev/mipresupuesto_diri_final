import { categoryLabel, formatCurrency } from '../services/financeService'

export default function ReportsView({ t, reportData }) {
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
