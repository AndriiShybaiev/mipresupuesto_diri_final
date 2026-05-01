import { categoryLabel, formatCurrency } from '../services/financeService'

export default function TransactionsView({
  t,
  monthFilter,
  search,
  transactions,
  onMonthFilter,
  onSearch,
  onOpenModal,
  onEdit,
  onDelete,
}) {
  return (
    <section className="panel fade-up">
      <div className="filters-row">
        <div>
          <label>{t.monthFilter}</label>
          <select value={monthFilter} onChange={(event) => onMonthFilter(event.target.value)}>
            <option value="current">{t.monthCurrent}</option>
            <option value="all">{t.monthAll}</option>
          </select>
        </div>

        <div>
          <label>{t.search}</label>
          <input
            type="text"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={`${t.search}...`}
          />
        </div>

        <button type="button" className="primary" onClick={onOpenModal}>
          {t.addTransaction}
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.date}</th>
              <th>{t.concept}</th>
              <th>{t.category}</th>
              <th>{t.amount}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.concept}</td>
                <td>{categoryLabel(item.category, t)}</td>
                <td className={item.category === 'income' ? 'income' : 'expense'}>
                  {item.category === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                </td>
                <td className="row-actions">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() => onEdit(item)}
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={() => onDelete(item.id)}
                  >
                    {t.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 ? <p className="empty">{t.noTransactions}</p> : null}
      </div>
    </section>
  )
}
