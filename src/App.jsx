import { useMemo } from 'react'
import './App.css'

import AuthPage from './components/AuthPage'
import BudgetsView from './components/BudgetsView'
import DashboardView from './components/DashboardView'
import Header from './components/Header'
import ReportsView from './components/ReportsView'
import Sidebar from './components/Sidebar'
import TransactionModal from './components/TransactionModal'
import TransactionsView from './components/TransactionsView'

import { useAuth } from './contexts/AuthContext'
import { useLanguage } from './contexts/LanguageContext'
import { budgetActions } from './store/budgetSlice'
import { useBudgetDispatch, useBudgetStore } from './store/store'

import budgetService from './services/BudgetService'
import {
  calculateReports,
  calculateSummary,
  calculateTrend,
  filterTransactions,
  monthlyTransactions,
} from './services/financeService'
import transactionService from './services/TransactionService'

function App() {
  const { t, locale, changeLanguage } = useLanguage()
  const { user, signOut } = useAuth()
  const { activeView, monthFilter, search, showModal, transactions } = useBudgetStore()
  const dispatch = useBudgetDispatch()

  const currentMonth = new Date().toISOString().slice(0, 7)

  const monthTransactions = useMemo(
    () => monthlyTransactions(transactions, currentMonth),
    [transactions, currentMonth],
  )

  const filteredTransactions = useMemo(
    () =>
      filterTransactions(transactions, {
        monthFilter,
        currentMonth,
        search,
      }),
    [transactions, monthFilter, currentMonth, search],
  )

  const summary = useMemo(() => calculateSummary(monthTransactions), [monthTransactions])
  const budgetRows = useMemo(() => budgetService.getRows(monthTransactions), [monthTransactions])
  const trendData = useMemo(() => calculateTrend(transactions), [transactions])
  const reportData = useMemo(
    () => calculateReports(monthTransactions, transactions),
    [monthTransactions, transactions],
  )

  function toggleLanguage() {
    changeLanguage(locale === 'es' ? 'en' : 'es')
  }

  function onSaveTransaction(input) {
    transactionService.add(input)
    dispatch(budgetActions.closeModal())
  }

  function onSignOut() {
    signOut()
    dispatch(budgetActions.setView('dashboard'))
    dispatch(budgetActions.setSearch(''))
    dispatch(budgetActions.setMonthFilter('current'))
    dispatch(budgetActions.closeModal())
  }

  if (!user) {
    return <AuthPage t={t} />
  }

  return (
    <main className="app-shell">
      <Header
        appName={t.appName}
        logo={t.logo}
        locale={locale}
        onToggleLanguage={toggleLanguage}
        showLanguage
      />

      <div className="workspace">
        <Sidebar
          t={t}
          activeView={activeView}
          onChangeView={(view) => dispatch(budgetActions.setView(view))}
          onSignOut={onSignOut}
        />

        <section className="content">
          <header className="section-header">
            <h2>{activeView === 'dashboard' ? t.currentMonthSummary : t[activeView]}</h2>
          </header>

          <div className="section-body">
            {activeView === 'dashboard' ? (
              <DashboardView t={t} summary={summary} trendData={trendData} />
            ) : null}

            {activeView === 'transactions' ? (
              <TransactionsView
                t={t}
                monthFilter={monthFilter}
                search={search}
                transactions={filteredTransactions}
                onMonthFilter={(value) => dispatch(budgetActions.setMonthFilter(value))}
                onSearch={(value) => dispatch(budgetActions.setSearch(value))}
                onOpenModal={() => dispatch(budgetActions.openModal())}
              />
            ) : null}

            {activeView === 'budgets' ? <BudgetsView t={t} rows={budgetRows} /> : null}
            {activeView === 'reports' ? <ReportsView t={t} reportData={reportData} /> : null}
          </div>
        </section>
      </div>

      {showModal ? (
        <TransactionModal
          t={t}
          onClose={() => dispatch(budgetActions.closeModal())}
          onSave={onSaveTransaction}
        />
      ) : null}
    </main>
  )
}

export default App
