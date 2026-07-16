export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedSearch = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--color-linen)] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] portal-card p-8 md:p-10">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--color-charcoal)] mb-2">
          Passwort setzen
        </h1>
        <p className="text-sm text-[var(--color-stone)] mb-8">
          Bitte vergeben Sie ein neues Passwort für Ihren ersten Login.
        </p>
        <form action="/auth/reset-password/submit" method="post" className="space-y-5">
          <div>
            <label className="login-label block mb-2" htmlFor="password">
              Neues Passwort
            </label>
            <input id="password" name="password" type="password" required minLength={10} />
          </div>
          {resolvedSearch?.error ? <p className="chip chip-error">{resolvedSearch.error}</p> : null}
          <button className="btn btn-primary w-full py-2.5" type="submit">
            Passwort speichern
          </button>
        </form>
      </div>
    </main>
  );
}
