import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MENU_ITEMS } from '../entities/entities'

const navClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 no-underline text-slate-700 border transition-colors ${
    isActive ? 'border-teal-200 bg-teal-50 text-teal-800 font-semibold' : 'border-transparent hover:bg-slate-100'
  }`

export default function Sidebar({ t, onSignOut }) {
  const { roles } = useAuth()
  const isAdmin = roles?.includes('ADMIN')

  return (
    <aside className="w-64 border-r border-slate-200 p-4 flex flex-col gap-4 bg-white">
      <h2 className="text-lg font-bold m-0 tracking-tight">{t.sidebarTitle}</h2>
      <nav className="flex flex-col gap-1">
        {MENU_ITEMS.map((item) => (
          <NavLink key={item} to={`/${item}`} className={navClass}>
            {t[item]}
          </NavLink>
        ))}

        {/* AC 8.2 — Admin link visible only for ADMIN role */}
        {isAdmin && (
          <NavLink to="/admin" className={navClass}>
            {t.admin}
          </NavLink>
        )}
      </nav>
      <button
        type="button"
        className="mt-auto rounded-lg border border-slate-300 bg-white px-3 py-2 cursor-pointer text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        onClick={onSignOut}
      >
        {t.logout}
      </button>
    </aside>
  )
}
