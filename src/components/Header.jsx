export default function Header({ appName, logo, locale, onToggleLanguage, showLanguage }) {
  return (
    <header className="topbar">
      <div className="logo-box">{logo}</div>
      <h1>{appName}</h1>
      {showLanguage ? (
        <button type="button" className="lang-btn" onClick={onToggleLanguage}>
          {locale === 'es' ? 'En' : 'Es'}
        </button>
      ) : (
        <div></div>
      )}
    </header>
  )
}
