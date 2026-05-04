'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 256;

type LoginApiError = {
  error?: string;
  code?: 'SERVER_MISCONFIGURED' | 'INVALID_REQUEST' | 'RATE_LIMITED' | 'INVALID_CREDENTIALS';
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validateForm(): string | null {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) return 'Ingresá tu email.';
    if (!EMAIL_REGEX.test(normalizedEmail)) return 'Ingresá un email válido.';
    if (normalizedEmail.length > MAX_EMAIL_LENGTH) return 'El email es demasiado largo.';
    if (!password) return 'Ingresá tu contraseña.';
    if (password.length > MAX_PASSWORD_LENGTH) return 'La contraseña es demasiado larga.';

    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as LoginApiError | null;

        if (response.status === 429 || data?.code === 'RATE_LIMITED') {
          setError('Demasiados intentos. Esperá unos minutos y volvé a intentar.');
          return;
        }

        if (response.status === 401 || data?.code === 'INVALID_CREDENTIALS') {
          setError('Email o contraseña incorrectos.');
          return;
        }

        if (response.status === 500 || data?.code === 'SERVER_MISCONFIGURED') {
          setError('Error interno de autenticación. Contactá al administrador.');
          return;
        }

        setError(data?.error || 'No se pudo iniciar sesión.');
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setError('No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-center gap-4 pb-3 border-b border-slate-700">
          <div className="relative w-14 h-14 bg-white rounded-xl overflow-hidden shadow-lg border-2 border-slate-600">
            <Image src="/images/logo.png" alt="ALC Logo" fill sizes="56px" className="object-contain p-1" priority />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">ALC Presupuestos</h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Ingreso Administrativo</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-wide uppercase text-slate-400 mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            maxLength={MAX_EMAIL_LENGTH}
            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-wide uppercase text-slate-400 mb-1" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            maxLength={MAX_PASSWORD_LENGTH}
            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        {error ? <p className="text-red-400 text-sm font-medium">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition rounded-lg py-2 font-semibold"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider">Acceso restringido para personal autorizado</p>
      </form>
    </main>
  );
}
