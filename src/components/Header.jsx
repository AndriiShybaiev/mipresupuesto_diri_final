export default function Header({ appName, logo, locale, onToggleLanguage, showLanguage }) {
  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-gray-800 px-4 py-3 bg-white">
      <div className="w-16 h-12 border border-gray-800 grid place-items-center font-bold text-sm lowercase">
        {logo}
      </div>
      <h1 className="text-center text-2xl font-bold m-0">{appName}</h1>
      {showLanguage ? (
        <button
          type="button"
          className="justify-self-end border-2 border-gray-800 bg-white px-3 py-1 font-bold cursor-pointer hover:bg-gray-100"
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
