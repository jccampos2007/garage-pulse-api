import React from 'react';
import { Car, Wrench, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';

export default function StatsOverview({ vehicles = [], services = [] }) {
  const totalVehicles = vehicles.length;
  const totalServices = services.length;
  
  const totalInvestment = services.reduce((acc, s) => acc + (Number(s.cost) || 0), 0);
  
  const activeVehicle = vehicles[0] || null;
  const effectiveKpd = activeVehicle
    ? (activeVehicle.calculated_kpd > 0
        ? activeVehicle.calculated_kpd
        : (activeVehicle.odometer - (activeVehicle.initial_km || 15000)) > 0
        ? ((activeVehicle.odometer - (activeVehicle.initial_km || 15000)) / 41).toFixed(2)
        : 9.06)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Vehicles */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#121622] to-[#0d1018] p-5 shadow-xl transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Vehículos en Flota
            </p>
            <h3 className="mt-1 text-3xl font-extrabold text-white font-['Outfit']">
              {totalVehicles}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e75c31]/15 text-[#e75c31]">
            <Car className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
          <Activity className="h-3.5 w-3.5" />
          <span>{activeVehicle ? `${activeVehicle.name} (${activeVehicle.license_plate}) activo` : 'Sincronizado'}</span>
        </div>
      </div>

      {/* Daily KPD */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#121622] to-[#0d1018] p-5 shadow-xl transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Uso Estadístico (KPD)
            </p>
            <h3 className="mt-1 text-3xl font-extrabold text-white font-['Outfit']">
              {effectiveKpd} <span className="text-sm font-normal text-slate-400">km/día</span>
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5 text-blue-400" />
          <span>Promedio unificado de recorrido</span>
        </div>
      </div>

      {/* Total Services */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#121622] to-[#0d1018] p-5 shadow-xl transition-all hover:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Registros Bitácora
            </p>
            <h3 className="mt-1 text-3xl font-extrabold text-white font-['Outfit']">
              {totalServices}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400">
            <Wrench className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-300">
          <span>Mantenimientos preventivos & correctivos</span>
        </div>
      </div>
    </div>
  );
}
