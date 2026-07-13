import React, { useState } from 'react';
import { Car, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function LoginModal({ onLoginSuccess }) {
  const [email, setEmail] = useState('ingdiazjc@gmail.com');
  const [password, setPassword] = useState('12369*');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('gp_token', token);
      localStorage.setItem('gp_user', JSON.stringify(user));
      onLoginSuccess(user, token);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error || 
        'No se pudo conectar con la API de GaragePulse. Verifique sus credenciales o el servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Glow backdrop */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#e75c31]/30 to-[#ff8c61]/30 opacity-75 blur-2xl transition duration-500"></div>

        <div className="relative rounded-3xl border border-slate-800 bg-[#0f131d]/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#e75c31] to-[#ff8c61] shadow-xl shadow-[#e75c31]/30">
              <Car className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-['Outfit']">
              Bienvenido a Garage<span className="text-[#e75c31]">Pulse</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Inicie sesión para acceder a toda la telemetría y bitácora guardada en la API
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ingdiazjc@gmail.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#e75c31] focus:outline-none focus:ring-2 focus:ring-[#e75c31]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#e75c31] focus:outline-none focus:ring-2 focus:ring-[#e75c31]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e75c31] to-[#ff7a45] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#e75c31]/25 transition-all hover:scale-[1.01] hover:shadow-[#e75c31]/40 disabled:opacity-50"
            >
              {loading ? (
                <span>Conectando con API...</span>
              ) : (
                <>
                  <span>Ingresar al Portal Cloud</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Prefill helper badge */}
          <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-[#e75c31]" />
              Credenciales Sincronizadas
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Las mismas credenciales de tu app móvil Android conectan a la nube en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
