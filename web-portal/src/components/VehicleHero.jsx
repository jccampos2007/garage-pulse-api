import React from 'react';
import { 
  Car, 
  MapPin, 
  Gauge, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Compass,
  Zap
} from 'lucide-react';

export default function VehicleHero({ vehicle }) {
  if (!vehicle) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800/80 bg-[#121622]/50 p-8 text-center">
        <Car className="mb-3 h-10 w-10 text-slate-600" />
        <h3 className="text-base font-bold text-slate-300">No hay vehículos registrados</h3>
        <p className="mt-1 text-xs text-slate-500">
          Sincronice o agregue un vehículo desde la aplicación móvil GaragePulse para verlo en la nube.
        </p>
      </div>
    );
  }

  const initialKm = vehicle.initial_km || vehicle.initialKm || 201000;
  const currentOdometer = vehicle.odometer || 0;
  const calibDistance = Math.max(0, currentOdometer - initialKm);

  const effectiveKpd = vehicle.calculated_kpd > 0 
    ? vehicle.calculated_kpd 
    : calibDistance > 0 ? (calibDistance / 41).toFixed(2) : 9.06;

  // Predictive wear estimation (next service at +5000 km from initial)
  const nextOilChangeKm = initialKm + 5000;
  const remainingKm = Math.max(0, nextOilChangeKm - currentOdometer);
  const progressPercent = Math.min(100, Math.round(((currentOdometer - initialKm) / 5000) * 100));

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#131824] via-[#0f131d] to-[#0a0d14] p-6 shadow-2xl lg:p-8">
      {/* Decorative ambient lighting */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#e75c31]/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left column: Vehicle identity */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e75c31]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#e75c31] border border-[#e75c31]/30">
              <Zap className="h-3.5 w-3.5" />
              Vehículo Principal Activo
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              {vehicle.status || 'Óptimo'}
            </span>
          </div>

          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl font-['Outfit'] tracking-tight">
            {vehicle.brand || 'Chery'} <span className="text-[#e75c31]">{vehicle.model || vehicle.name || 'Arauca'}</span>
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 font-mono font-bold text-slate-200">
              {vehicle.license_plate || vehicle.licensePlate || 'SIN-PLACA'}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Año {vehicle.year || 2013}</span>
            </div>
            {vehicle.last_known_location && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="h-4 w-4 text-[#e75c31]" />
                <span className="font-mono">{vehicle.last_known_location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Main Odometer & KPD Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-[480px]">
          {/* Main Odometer card */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#171d2b]/80 p-4 shadow-inner">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Odómetro Actual</span>
              <Gauge className="h-4 w-4 text-[#e75c31]" />
            </div>
            <div className="mt-2 font-mono text-3xl font-black text-white font-['Outfit']">
              {Number(currentOdometer).toLocaleString('es-VE')} <span className="text-sm font-normal text-slate-400">km</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[11px] text-slate-400">
              <span>Km Inicial Calibrado:</span>
              <span className="font-mono font-bold text-slate-300">
                {Number(initialKm).toLocaleString('es-VE')} km
              </span>
            </div>
          </div>

          {/* KPD & Recorrido */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#171d2b]/80 p-4 shadow-inner">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Recorrido de Calibración</span>
              <Compass className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-2 font-mono text-3xl font-black text-blue-400 font-['Outfit']">
              +{Number(calibDistance).toLocaleString('es-VE')} <span className="text-sm font-normal text-slate-400">km</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[11px] text-slate-400">
              <span>Promedio KPD:</span>
              <span className="font-bold text-emerald-400">{effectiveKpd} km/día</span>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive maintenance progress bar */}
      <div className="mt-8 rounded-2xl border border-slate-800/70 bg-[#171d2b]/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <Sparkles className="h-4 w-4 text-[#e75c31]" />
            <span>Próximo Mantenimiento Predictivo (Aceite & Filtros)</span>
          </div>
          <div className="font-mono text-xs text-slate-400">
            Faltan <span className="font-bold text-white">{Number(remainingKm).toLocaleString('es-VE')} km</span> para revisión
          </div>
        </div>

        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-900">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-[#e75c31] transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
