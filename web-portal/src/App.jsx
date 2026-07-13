import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import StatsOverview from './components/StatsOverview';
import VehicleHero from './components/VehicleHero';
import ServiceLogsTable from './components/ServiceLogsTable';
import api from './services/api';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gp_token'));
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cached user profile on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('gp_user');
    if (cachedUser && token) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem('gp_user');
      }
    }
  }, [token]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch vehicles
      const vehiclesRes = await api.get('/vehicles');
      const loadedVehicles = vehiclesRes.data || [];
      setVehicles(loadedVehicles);

      // Fetch services for active/first vehicle
      const activeVehicle = loadedVehicles[0];
      if (activeVehicle) {
        const servicesRes = await api.get(`/vehicles/${activeVehicle.id}/services`);
        setServices(servicesRes.data || []);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('No se pudieron obtener los datos de la API. Verifique su conexión al servidor.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  const handleLoginSuccess = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('gp_token');
    localStorage.removeItem('gp_user');
    setUser(null);
    setToken(null);
    setVehicles([]);
    setServices([]);
  };

  const activeVehicle = vehicles[0] || null;

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          onRefresh={fetchData} 
          isRefreshing={loading} 
        />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {!token ? (
            <LoginModal onLoginSuccess={handleLoginSuccess} />
          ) : (
            <div className="space-y-8 animate-fadeIn">
              {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Stats Overview */}
              <StatsOverview vehicles={vehicles} services={services} />

              {/* Vehicle Hero Section */}
              <VehicleHero vehicle={activeVehicle} />

              {/* Service Logs Table */}
              <ServiceLogsTable services={services} />
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} GaragePulse Cloud Ecosystem. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-[#e75c31]" />
            <span>Sincronización en Tiempo Real con Node.js & Android</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
