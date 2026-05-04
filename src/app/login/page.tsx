'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070a] p-4 font-sans relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-[#0f141d]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-white rounded-2xl p-2 mb-6 shadow-xl shadow-blue-500/10 border border-white/10 relative group">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-50"></div>
              <div className="relative h-full w-full">
                <Image
                  src="/images/logo.png"
                  alt="ALC Logo"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase text-center">
              ALC PRESUPUESTOS
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-px w-4 bg-blue-500/50"></span>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
                Ingreso Administrativo
              </p>
              <span className="h-px w-4 bg-blue-500/50"></span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl flex items-center gap-3">
                <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-700"
                    placeholder="usuario@alc.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Ingresar</span>
                  <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 flex flex-col items-center">
            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-60">
              <ShieldCheck size={12} className="text-blue-500" />
              Acceso Restringido - Personal Autorizado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
