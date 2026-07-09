export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedSearch = await searchParams;

  return (
    <main className="min-h-screen bg-grey-100 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] card p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/rais-logo.svg" alt="RAIS" className="h-11 w-11 mb-5" />
        <h1 className="text-2xl mb-1">Willkommen zurück</h1>
        <p className="text-grey-500 text-sm mb-6">Bitte mit Ihren Zugangsdaten am RAIS Client Portal anmelden.</p>
        <form action="/auth/signin" method="post" className="space-y-4">
          <div>
            <label className="block text-xs text-grey-600 mb-1" htmlFor="email">
              E-Mail
            </label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label className="block text-xs text-grey-600 mb-1" htmlFor="password">
              Passwort
            </label>
            <input id="password" name="password" type="password" required />
          </div>
          {resolvedSearch?.error ? <p className="chip chip-error">{resolvedSearch.error}</p> : null}
          <button className="btn btn-primary w-full py-2.5" type="submit">
            Einloggen
          </button>
        </form>
      </div>
    </main>
  );
}
