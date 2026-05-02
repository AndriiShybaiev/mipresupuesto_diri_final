import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MENU_ITEMS } from '../entities/entities'

export default function Sidebar({ t, onSignOut }) {
  const { roles } = useAuth()
  const isAdmin = roles?.includes('ADMIN')

  return (
    <aside className="sidebar">
      <h2>{t.sidebarTitle}</h2>
      <nav>
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item}
            to={`/${item}`}
            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
          >
            {t[item]}
          </NavLink>
        ))}

        {/* AC 8.2 — Admin link visible only for ADMIN role */}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
          >
            {t.admin}
          </NavLink>
        )}
      </nav>
      <button type="button" className="logout" onClick={onSignOut}>
        {t.logout}
      </button>
    </aside>
  )
}
