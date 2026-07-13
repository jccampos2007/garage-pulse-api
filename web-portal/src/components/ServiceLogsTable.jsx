import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Wrench, 
  Calendar, 
  DollarSign, 
  Tag, 
  ArrowUpDown, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function ServiceLogsTable({ services = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = 
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || service.category === selectedCategory;
      const matchesType = selectedType === 'ALL' || service.type === selectedType;

      return matchesSearch && matchesCat && matchesType;
    });
  }, [services, searchTerm, selectedCategory, selectedType]);

  const formatDate = (dateValue) => {
    if (!dateValue) return '--';
    const date = new Date(Number(dateValue));
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="rounded-3xl border border-slate-800/90 bg-[#10141d]/80 shadow-2xl backdrop-blur-xl">
      {/* Table Header controls */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 p-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-bold text-white font-['Outfit']">
            Bitácora de Mantenimientos & Servicios
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Historial completo guardado en la API para el control mecánico y garantía
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[220px] flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-[#e75c31] focus:outline-none focus:ring-1 focus:ring-[#e75c31]"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 focus:border-[#e75c31] focus:outline-none"
          >
            <option value="ALL">Categoría: Todas</option>
            {categories.filter(c => c !== 'ALL').map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 focus:border-[#e75c31] focus:outline-none"
          >
            <option value="ALL">Tipo: Todos</option>
            <option value="Preventivo">Preventivo</option>
            <option value="Correctivo">Correctivo</option>
          </select>
        </div>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/60 bg-slate-900/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-3.5">Servicio / Descripción</th>
              <th className="px-6 py-3.5">Categoría</th>
              <th className="px-6 py-3.5">Tipo</th>
              <th className="px-6 py-3.5">Kilometraje</th>
              <th className="px-6 py-3.5">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                  <Wrench className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                  <p className="font-semibold">No se encontraron servicios que coincidan</p>
                  <p className="text-xs text-slate-500 mt-1">Pruebe ajustando los filtros de búsqueda</p>
                </td>
              </tr>
            ) : (
              filteredServices.map((service) => (
                <tr 
                  key={service.id} 
                  className="transition-colors hover:bg-slate-900/40"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-white font-['Outfit']">{service.title}</div>
                    {service.description && (
                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{service.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300">
                      <Tag className="h-3 w-3 text-[#e75c31]" />
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      service.type === 'Preventivo'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {service.type || 'Mantenimiento'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-300">
                    {Number(service.mileage).toLocaleString('es-VE')} km
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {formatDate(service.date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
