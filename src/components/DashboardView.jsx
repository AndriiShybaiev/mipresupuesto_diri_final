import { formatCurrency } from '../services/financeService'

export default function DashboardView({ t, summary, trendData }) {
  return (
    <>
      <section className="panel summary-grid fade-up">
        <article>
          <p>{t.totalBalance}</p>
          <strong>{formatCurrency(summary.balance)}</strong>
        </article>
        <article>
          <p>{t.income}</p>
          <strong>{formatCurrency(summary.income)}</strong>
        </article>
        <article>
          <p>{t.expenses}</p>
          <strong>{formatCurrency(summary.expenses)}</strong>
        </article>
      </section>

      <section className="panel chart-panel fade-up delay-1">
        <h3>{t.monthlyTrend}</h3>
        <div className="chart">
          {trendData.map((item) => (
            <div key={item.month} className="bar-col">
              <div className="bar" style={{ height: `${item.height}px` }}></div>
              <span>{item.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
