import { NavLink } from 'react-router-dom'
import { MENU_ITEMS } from '../entities/entities'

export default function Sidebar({ t, onSignOut }) {
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
      </nav>
      <button type="button" className="logout" onClick={onSignOut}>
        {t.logout}
      </button>
    </aside>
  )
}
