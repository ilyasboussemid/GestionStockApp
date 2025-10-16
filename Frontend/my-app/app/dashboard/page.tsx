'use client';
import { useEffect, useState } from "react";
import {
  Package,
  TrendingUp,
  Activity,
  LogOut,
  BarChart3,
  Boxes,
  ArrowRight,
  Loader2,
  Shield,
  User,
  Eye,
  Users,
  UserCircle
} from "lucide-react";

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
};

type DashboardStats = {
  total_products: number;
  total_stock_value: number;
  recent_movements: number;
  products_by_category: Record<string, number>;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (!userStr || !token) {
      window.location.href = '/login';
      return;
    }
    
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
    loadDashboardStats(token);
  }, []);

  const loadDashboardStats = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/stats/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navigateTo = (page: string) => {
    window.location.href = `/${page}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0d2a3d] to-[#1a3d5f]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#87CEEB] animate-spin mx-auto drop-shadow-[0_0_20px_rgba(135,206,235,1)]" />
          <p className="mt-4 text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-gradient-to-br from-[#0a1525] via-[#0d2a3d] to-[#1a3d5f] overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-[700px] h-[700px] bg-[#87CEEB] rounded-full blur-[140px] opacity-2" style={{animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
        <div className="absolute bottom-20 left-20 w-[800px] h-[800px] bg-[#00BFFF] rounded-full blur-[160px] opacity-1" style={{animation: 'pulse 14s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s'}}></div>
        
        {/* Particles */}
        {[...Array(120)].map((_, i) => {
          const size = Math.random() * 4 + 1.5;
          const duration = Math.random() * 45 + 30;
          const delay = Math.random() * 10;
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          
          return (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-[#87CEEB] to-[#00BFFF]"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${startX}%`,
                top: `${startY}%`,
                opacity: Math.random() * 0.12 + 0.03,
                boxShadow: `0 0 ${Math.random() * 4 + 1}px rgba(135, 206, 235, 0.15)`,
                animation: `float-${i % 3} ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`
              }}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, -30px); }
          50% { transform: translate(-15px, 15px); }
          75% { transform: translate(25px, 8px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-30px, 20px); }
          50% { transform: translate(18px, -18px); }
          75% { transform: translate(-10px, -25px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(15px, 25px); }
          50% { transform: translate(-25px, -15px); }
          75% { transform: translate(8px, -22px); }
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-b from-[#0a1f2e] via-[#0d2838]/80 to-transparent backdrop-blur-xl border-b border-[#87CEEB]/20 sticky top-0 shadow-[0_4px_20px_rgba(135,206,235,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-[0_2px_6px_rgba(135,206,235,0.25)]">
                Gestion de Stock
              </h1>
              <p className="text-xs text-[#87CEEB] font-medium">ONDA - Office National Des Aéroports</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#87CEEB]/15 to-transparent blur-lg"></div>
                  <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1e3a5f]/50 border border-[#87CEEB]/40">
                    <Shield className="w-4 h-4 text-[#87CEEB]" />
                    <p className="text-sm font-bold text-white">
                      {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
                    </p>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#87CEEB]/20 to-[#00BFFF]/20 backdrop-blur-md border border-[#87CEEB]/40 shadow-[0_0_12px_rgba(135,206,235,0.25)] hover:shadow-[0_0_18px_rgba(135,206,235,0.35)] transition-all">
                    <Shield className="w-4 h-4 drop-shadow-[0_0_6px_rgba(135,206,235,0.8)]" />
                    <span className="bg-gradient-to-r from-white to-[#87CEEB] bg-clip-text text-transparent">Administrateur</span>
                  </span>
                )}
                {user?.role === "employee" && (
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-500/20 backdrop-blur-sm border border-blue-400/40">
                    <User className="w-4 h-4" />
                    Employé
                  </span>
                )}
                {user?.role === "viewer" && (
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gray-500/20 backdrop-blur-sm border border-gray-400/40">
                    <Eye className="w-4 h-4" />
                    Viewer
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#0d2838] bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] active:scale-95 backdrop-blur-md rounded-xl transition-all border border-white/80 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-white drop-shadow-[0_2px_6px_rgba(135,206,235,0.25)]">
            Bonjour, {user?.first_name || user?.username || 'Utilisateur'} 
          </h2>
          <p className="text-[#87CEEB] mt-2 text-lg">
            Voici un aperçu de votre stock
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Total Products - CLIQUABLE */}
          <button
            onClick={() => navigateTo('products')}
            className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-[#87CEEB]/40 hover:border-[#87CEEB]/70 hover:scale-105 hover:shadow-[0_0_30px_rgba(135,206,235,0.4)] transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-[#87CEEB] mb-2">
                  Total Produits
                </p>
                <p className="text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]">
                  {stats?.total_products ?? 0}
                </p>
              </div>
              <div className="bg-[#1e3a5f] p-4 rounded-2xl shadow-[0_0_30px_rgba(30,58,95,0.8)] group-hover:shadow-[0_0_40px_rgba(30,58,95,1)] group-hover:scale-110 transition-all border-2 border-[#2a5080]">
                <Package className="w-8 h-8 text-[#87CEEB] drop-shadow-[0_0_15px_rgba(135,206,235,1)]" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#87CEEB] text-xs group-hover:gap-2 transition-all">
              <span>Voir les produits</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Total Value */}
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-[#87CEEB]/40 hover:border-[#87CEEB]/70 hover:shadow-[0_0_30px_rgba(135,206,235,0.4)] transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#87CEEB] mb-2">
                  Valeur Totale
                </p>
                <p className="text-3xl font-bold text-[#00FF7F] drop-shadow-[0_2px_8px_rgba(0,255,127,0.4)]">
                  {stats?.total_stock_value ? Number(stats.total_stock_value).toLocaleString('fr-FR', {maximumFractionDigits: 0}) : "0"} DH
                </p>
              </div>
              <div className="bg-[#1a3d2e] p-4 rounded-2xl shadow-[0_0_15px_rgba(26,61,46,0.6)] border-2 border-[#2a5040]">
                <TrendingUp className="w-8 h-8 text-[#00D98F] drop-shadow-[0_0_8px_rgba(0,217,143,0.6)]" />
              </div>
            </div>
          </div>

          {/* Recent Movements - CLIQUABLE */}
          <button
            onClick={() => navigateTo('movements')}
            className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-[#87CEEB]/40 hover:border-[#87CEEB]/70 hover:scale-105 hover:shadow-[0_0_30px_rgba(135,206,235,0.4)] transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-[#87CEEB] mb-2">
                  Mouvements (7j)
                </p>
                <p className="text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]">
                  {stats?.recent_movements ?? 0}
                </p>
              </div>
              <div className="bg-[#1e3a5f] p-4 rounded-2xl shadow-[0_0_30px_rgba(30,58,95,0.8)] group-hover:shadow-[0_0_40px_rgba(30,58,95,1)] group-hover:scale-110 transition-all border-2 border-[#2a5080]">
                <Activity className="w-8 h-8 text-[#87CEEB] drop-shadow-[0_0_15px_rgba(135,206,235,1)]" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#87CEEB] text-xs group-hover:gap-2 transition-all">
              <span>Voir les mouvements</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>

        {/* Categories Chart */}
        {stats?.products_by_category && Object.keys(stats.products_by_category).length > 0 && (
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-[#87CEEB]/40 mb-4 flex-1 min-h-0">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-[#87CEEB] drop-shadow-[0_0_15px_rgba(135,206,235,1)]" />
              <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(135,206,235,0.3)]">
                Produits par Catégorie
              </h3>
            </div>
            <div className="space-y-3">
              {Object.entries(stats.products_by_category).map(([category, count]) => (
                <div key={category} className="flex items-center gap-4">
                  <div className="w-36 text-sm font-medium text-[#87CEEB]">
                    {category}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-[#1e3a5f] border-2 border-[#87CEEB] shadow-[0_0_20px_rgba(135,206,235,0.8)] transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (count / (stats?.total_products ?? 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-bold text-white">{count}</span>
                    <span className="text-xs text-[#87CEEB] ml-1">
                      ({((count / (stats?.total_products ?? 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-[#87CEEB]/40">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#87CEEB] drop-shadow-[0_0_15px_rgba(135,206,235,1)]" />
            Actions Rapides
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Produits - CLIQUABLE */}
            <button
              onClick={() => navigateTo('products')}
              className="flex items-center gap-3 p-4 bg-black/40 backdrop-blur-sm border border-[#87CEEB]/40 rounded-xl hover:bg-black/60 hover:border-[#87CEEB]/70 hover:shadow-[0_0_20px_rgba(135,206,235,0.4)] transition-all duration-300 group"
            >
              <div className="bg-[#1e3a5f] p-3 rounded-xl shadow-[0_0_25px_rgba(30,58,95,0.8)] group-hover:shadow-[0_0_35px_rgba(30,58,95,1)] group-hover:scale-110 transition-all border-2 border-[#2a5080]">
                <Package className="w-5 h-5 text-[#87CEEB] drop-shadow-[0_0_12px_rgba(135,206,235,1)]" />
              </div>
              <span className="font-semibold text-white">Voir les Produits</span>
            </button>

            {/* Mouvements - CLIQUABLE */}
            {(user?.role === "admin" || user?.role === "employee") && (
              <button
                onClick={() => navigateTo('movements')}
                className="flex items-center gap-3 p-4 bg-black/40 backdrop-blur-sm border border-[#87CEEB]/40 rounded-xl hover:bg-black/60 hover:border-[#87CEEB]/70 hover:shadow-[0_0_20px_rgba(135,206,235,0.4)] transition-all duration-300 group"
              >
                <div className="bg-[#1e3a5f] p-3 rounded-xl shadow-[0_0_25px_rgba(30,58,95,0.8)] group-hover:shadow-[0_0_35px_rgba(30,58,95,1)] group-hover:scale-110 transition-all border-2 border-[#2a5080]">
                  <Activity className="w-5 h-5 text-[#87CEEB] drop-shadow-[0_0_12px_rgba(135,206,235,1)]" />
                </div>
                <span className="font-semibold text-white">Mouvements</span>
              </button>
            )}

            {/* Utilisateurs - CLIQUABLE */}
            {user?.role === "admin" && (
              <button
                onClick={() => navigateTo('users')}
                className="flex items-center gap-3 p-4 bg-black/40 backdrop-blur-sm border border-[#87CEEB]/40 rounded-xl hover:bg-black/60 hover:border-[#87CEEB]/70 hover:shadow-[0_0_20px_rgba(135,206,235,0.4)] transition-all duration-300 group"
              >
                <div className="bg-[#1e3a5f] p-3 rounded-xl shadow-[0_0_25px_rgba(30,58,95,0.8)] group-hover:shadow-[0_0_35px_rgba(30,58,95,1)] group-hover:scale-110 transition-all border-2 border-[#2a5080]">
                  <Users className="w-5 h-5 text-[#87CEEB] drop-shadow-[0_0_12px_rgba(135,206,235,1)]" />
                </div>
                <span className="font-semibold text-white">Utilisateurs</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}