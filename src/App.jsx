import { lazy, Suspense, useEffect } from 'react'
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
import AuthPage from './components/AuthPage'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import NotFound from './components/NotFound'
import Sidebar from './components/Sidebar'
import TransactionModal from './components/TransactionModal'

// AC 7.1 — Carga Diferida (Lazy Loading) para vistas pesadas
const DashboardView = lazy(() => import('./components/DashboardView'))
const TransactionsView = lazy(() => import('./components/TransactionsView'))
const BudgetsView = lazy(() => import('./components/BudgetsView'))
const ReportsView = lazy(() => import('./components/ReportsView'))
const AdminView = lazy(() => import('./components/AdminView'))

import { useAuth } from './contexts/AuthContext'
import { useLanguage } from './contexts/LanguageContext'
import {
  budgetActions,
  clearStatusMessage,
  startTransactionsSubscription,
  stopTransactionsSubscription,
  addTransaction,
  updateTransaction,
} from './store/budgetSlice'

const STATUS_DISMISS_MS = 3000

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Redirects to /login if the user is not authenticated (AC 8.1 pattern)
function ProtectedRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

// ─── AdminRoute ───────────────────────────────────────────────────────────────
// Redirects to /dashboard if the user does not have the ADMIN role (AC 8.2 pattern)
function AdminRoute() {
  const { roles } = useAuth()
  if (!roles) return null
  if (!roles.includes('ADMIN')) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

// ─── Section title ────────────────────────────────────────────────────────────
function SectionTitle({ t }) {
  const { pathname } = useLocation()
  const key = pathname.replace('/', '') || 'dashboard'
  if (key === 'dashboard') return t.currentMonthSummary
  if (key === 'admin') return t.adminPanel
  return t[key] ?? key
}

// ─── App layout (authenticated shell) ────────────────────────────────────────
function AppLayout() {
  const { t, locale, changeLanguage } = useLanguage()
  const { signOut, user } = useAuth()
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

  // Subscribe to Firebase transactions when user is present
  useEffect(() => {
    if (!user) return
    dispatch(startTransactionsSubscription())
    return () => { dispatch(stopTransactionsSubscription()) }
  }, [dispatch, user])

  // Auto-dismiss statusMessage after 3 seconds
  useEffect(() => {
    if (!statusMessage) return
    const timer = setTimeout(() => dispatch(clearStatusMessage()), STATUS_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [statusMessage, dispatch])

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
              <p className={`text-sm px-3 py-2 border ${statusMessage.startsWith('Error') ? 'border-red-300 bg-red-50 text-red-800' : 'border-teal-300 bg-teal-50 text-teal-800'}`}>
                {statusMessage}
              </p>
            )}

            {/* AC 7.1 — Suspense envuelve las vistas lazy */}
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

// ─── App root ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected routes — wrapped in ProtectedRoute (renders Outlet or redirects) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/transactions" element={<TransactionsView />} />
              <Route path="/budgets" element={<BudgetsView />} />
              <Route path="/reports" element={<ReportsView />} />

              {/* AC 8.2 — Admin-only routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminView />} />
              </Route>
            </Route>
          </Route>

          {/* AC 1.6 — 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
