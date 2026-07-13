import React, { useState } from 'react';
import { 
  Car, 
  Globe, 
  LogOut, 
  RefreshCw, 
  User, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  Settings 
} from 'lucide-react';
import { setApiBaseUrl, getApiBaseUrl } from '../services/api';

export default function Navbar({ user, onLogout, onRefresh, isRefreshing }) {
  const [currentUrl, setCurrentUrl] = useState(getApiBaseUrl());
  const [showApiSelector, setShowApiSelector] = useState(false);

  const handleUrlChange = (url) => {
    setApiBaseUrl(url);
    setCurrentUrl(url);
    setShowApiSelector(false);
    onRefresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0e14]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#e75c31] to-[#ff8c61] shadow-lg shadow-[#e75c31]/25">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white font-['Outfit']">
                Garage<span className="text-[#e75c31]">Pulse</span>
              </span>
              <span className="rounded-full bg-[#e75c31]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e75c31] border border-[#e75c31]/20">
                Cloud Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sistema de Gestión de Flota & Telemetría
            </p>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3">
          {/* API Server selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowApiSelector(!showApiSelector)}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800/80"
              title="Cambiar servidor API"
            >
              <Server className="h-3.5 w-3.5 text-[#e75c31]" />
              <span className="hidden sm:inline">
                {currentUrl.includes('gscloud.us') ? 'Nube Producción' : 'Servidor Local'}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            {showApiSelector && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-[#10141d] p-2 shadow-2xl shadow-black/80 z-50">
                <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Seleccionar Endpoint API
                </div>
                <button
                  onClick={() => handleUrlChange('https://garage-pulse-api.gscloud.us/api')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    currentUrl.includes('gscloud.us')
                      ? 'bg-[#e75c31]/15 text-[#e75c31] font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    <div>
                      <div>Cloud GSCloud (Producción)</div>
                      <div className="text-[10px] text-slate-500">garage-pulse-api.gscloud.us</div>
                    </div>
                  </div>
                  {currentUrl.includes('gscloud.us') && <CheckCircle2 className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => handleUrlChange('http://localhost:3000/api')}
                  className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    currentUrl.includes('localhost')
                      ? 'bg-[#e75c31]/15 text-[#e75c31] font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5" />
                    <div>
                      <div>Servidor Local Node.js</div>
                      <div className="text-[10px] text-slate-500">http://localhost:3000/api</div>
                    </div>
                  </div>
                  {currentUrl.includes('localhost') && <CheckCircle2 className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800/80 hover:text-white disabled:opacity-50"
            title="Sincronizar datos"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#e75c31]' : ''}`} />
          </button>

          {/* User profile badge */}
          {user && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 pl-3 pr-1.5 py-1.5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e75c31]/20 text-[#e75c31]">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-white leading-none">{user.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{user.email}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                title="Cerrar sesión"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
