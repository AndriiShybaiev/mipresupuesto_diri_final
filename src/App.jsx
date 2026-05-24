import { lazy, Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  addTransaction,
  budgetActions,
  clearStatusMessage,
  startTransactionsSubscription,
  stopTransactionsSubscription,
  updateTransaction,
} from './store/budgetSlice'
import { useAuth } from './contexts/AuthContext'
import { useLanguage } from './contexts/LanguageContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import TransactionModal from './components/TransactionModal'
import ErrorBoundary from './components/ErrorBoundary'
import NotFound from './components/NotFound'
import AuthPage from './components/AuthPage'

const DashboardView = lazy(() => import('./components/DashboardView'))
const TransactionsView = lazy(() => import('./components/TransactionsView'))
const BudgetsView = lazy(() => import('./components/BudgetsView'))
const ReportsView = lazy(() => import('./components/ReportsView'))
const AdminView = lazy(() => import('./components/AdminView'))

const STATUS_DISMISS_MS = 3000

function SectionTitle({ t }) {
  const location = useLocation()
  if (location.pathname.startsWith('/transactions')) return t.transactions
  if (location.pathname.startsWith('/budgets')) return t.budgets
  if (location.pathname.startsWith('/reports')) return t.reports
  if (location.pathname.startsWith('/admin')) return t.adminPanel
  return t.dashboard
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function AdminRoute() {
  const { roles } = useAuth()
  const location = useLocation()
  if (!roles) return null
  if (!roles.includes('ADMIN')) {
    return <Navigate to="/dashboard" replace state={{ accessDenied: true, from: location.pathname }} />
  }
  return <Outlet />
}

function AppLayout() {
  const { t, locale, changeLanguage } = useLanguage()
  const { signOut, user } = useAuth()
  const location = useLocation()
  const {
    showModal,
    editingTransaction,
    transactionsLoading,
    transactionsError,
    isMutating,
    statusMessage,
  } = useSelector((state) => state.budget)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [accessDeniedNotice, setAccessDeniedNotice] = useState(false)
  const isStatusError = typeof statusMessage === 'string' && statusMessage.toLowerCase().startsWith('error:')

  useEffect(() => {
    if (!user) return
    dispatch(startTransactionsSubscription())
    return () => {
      dispatch(stopTransactionsSubscription())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (!statusMessage) return
    const timer = setTimeout(() => dispatch(clearStatusMessage()), STATUS_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [statusMessage, dispatch])

  useEffect(() => {
    if (!location.state?.accessDenied) return
    setAccessDeniedNotice(true)
    navigate(location.pathname, { replace: true, state: {} })
  }, [location, navigate])

  useEffect(() => {
    if (!accessDeniedNotice) return
    const timer = setTimeout(() => setAccessDeniedNotice(false), STATUS_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [accessDeniedNotice])

  function onSaveTransaction(input) {
    if (editingTransaction) {
      dispatch(updateTransaction({ id: editingTransaction.id, input }))
    } else {
      dispatch(addTransaction(input))
    }
    dispatch(budgetActions.closeModal())
  }

  async function onSignOut() {
    await signOut()
    dispatch(budgetActions.setMonthFilter('current'))
    dispatch(budgetActions.setSearch(''))
    dispatch(budgetActions.closeModal())
    navigate('/login')
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header
        appName={t.appName}
        logo={t.logo}
        locale={locale}
        onToggleLanguage={() => changeLanguage(locale === 'es' ? 'en' : 'es')}
        showLanguage
      />

      <div className="flex flex-1">
        <Sidebar t={t} onSignOut={onSignOut} />

        <section className="flex flex-col flex-1">
          <header className="border-b-2 border-gray-800 px-5 py-4">
            <h2 className="m-0 text-2xl font-bold"><SectionTitle t={t} /></h2>
          </header>

          <div className="p-5 flex flex-col gap-4">
            {transactionsLoading && (
              <p className="text-sm px-3 py-2 border border-blue-300 bg-blue-50 text-blue-800">{t.loading}</p>
            )}
            {transactionsError && (
              <p className="text-sm px-3 py-2 border border-red-300 bg-red-50 text-red-800">{transactionsError}</p>
            )}
            {statusMessage && (
              <p className={`text-sm px-3 py-2 border ${isStatusError ? 'border-red-300 bg-red-50 text-red-800' : 'border-emerald-300 bg-emerald-50 text-emerald-800'}`}>
                {statusMessage}
              </p>
            )}
            {accessDeniedNotice && (
              <p className="text-sm px-3 py-2 border border-red-300 bg-red-50 text-red-800">{t.accessDenied}</p>
            )}

            <Suspense fallback={<p className="text-sm px-3 py-2 border border-blue-300 bg-blue-50 text-blue-800">{t.loading}</p>}>
              <Outlet />
            </Suspense>
          </div>
        </section>
      </div>

      {showModal ? (
        <TransactionModal
          t={t}
          initialValues={editingTransaction}
          isMutating={isMutating}
          onClose={() => dispatch(budgetActions.closeModal())}
          onSave={onSaveTransaction}
        />
      ) : null}
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<AuthPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/transactions" element={<TransactionsView />} />
              <Route path="/budgets" element={<BudgetsView />} />
              <Route path="/reports" element={<ReportsView />} />

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminView />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
