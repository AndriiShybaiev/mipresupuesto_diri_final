import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MENU_ITEMS } from '../entities/entities'

const navClass = ({ isActive }) =>
  `block px-3 py-2 no-underline text-gray-900 border hover:bg-teal-100 ${
    isActive ? 'border-gray-800 font-bold' : 'border-transparent'
  }`

export default function Sidebar({ t, onSignOut }) {
  const { roles } = useAuth()
  const isAdmin = roles?.includes('ADMIN')

  return (
    <aside className="w-60 border-r-2 border-gray-800 p-4 flex flex-col gap-4 bg-teal-50/50">
      <h2 className="text-xl font-bold m-0">{t.sidebarTitle}</h2>
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
        className="mt-auto border border-gray-800 bg-white px-3 py-2 cursor-pointer hover:bg-gray-100"
        onClick={onSignOut}
      >
        {t.logout}
      </button>
    </aside>
  )
}
