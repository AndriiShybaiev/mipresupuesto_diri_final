import { MENU_ITEMS } from '../entities/entities'

export default function Sidebar({ t, activeView, onChangeView, onSignOut }) {
  return (
    <aside className="sidebar">
      <h2>{t.sidebarTitle}</h2>
      <nav>
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            className={activeView === item ? 'menu-item active' : 'menu-item'}
            onClick={() => onChangeView(item)}
          >
            {t[item]}
          </button>
        ))}
      </nav>
      <button type="button" className="logout" onClick={onSignOut}>
        {t.logout}
      </button>
    </aside>
  )
}
