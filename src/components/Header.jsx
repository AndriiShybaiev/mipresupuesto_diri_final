export default function Header({ appName, logo, locale, onToggleLanguage, showLanguage }) {
  return (
    <header className="grid grid-cols-3 items-center border-b border-slate-200 px-4 py-3 bg-white">
      <div className="w-16 h-12 rounded-lg border border-slate-300 grid place-items-center font-bold text-sm lowercase text-slate-700 bg-slate-50">
        {logo}
      </div>
      <h1 className="text-center text-2xl font-bold tracking-tight m-0">{appName}</h1>
      {showLanguage ? (
        <button
          type="button"
          className="justify-self-end rounded-md border border-slate-300 bg-white px-3 py-1 font-semibold cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          onClick={onToggleLanguage}
        >
          {locale === 'es' ? 'En' : 'Es'}
        </button>
      ) : (
        <div />
      )}
    </header>
  )
}
