'use client'
import { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    
    setError('');
    
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.detail || data.non_field_errors?.[0] || 'Identifiants incorrects');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-gradient-to-br from-[#0a1525] via-[#0d2a3d] to-[#1a3d5f] flex">
      {/* Decorative background - Reduced glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#87CEEB] rounded-full blur-[140px] opacity-4" style={{animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
        <div className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-[#00BFFF] rounded-full blur-[160px] opacity-3" style={{animation: 'pulse 14s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s'}}></div>
      </div>

      {/* Content Container - Full Screen Grid */}
      <div className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
        
        {/* Left Side - Branding - 50% width */}
        <div className="hidden lg:flex flex-col justify-center items-start px-16 xl:px-20 py-12 space-y-8">
          {/* Logo ONDA */}
          <div className="inline-block">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#87CEEB]/15 backdrop-blur-md rounded-2xl shadow-[0_0_15px_rgba(135,206,235,0.3)] group-hover:shadow-[0_0_20px_rgba(135,206,235,0.4)] transition-all"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#87CEEB]/30">
                <img 
                  src="/logo-chfaf.png" 
                  alt="Logo ONDA" 
                  className="w-44 h-auto"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4 leading-tight drop-shadow-[0_2px_6px_rgba(135,206,235,0.25)]">
              Gestion de Stock
            </h1>
            <h2 className="text-3xl font-semibold text-[#87CEEB]">
              Office National Des Aéroports
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg text-[#87CEEB] leading-relaxed max-w-lg">
            Gestionnaire, exploitant et développeur des aéroports civils du Royaume du Maroc.
          </p>
        </div>

        {/* Right Side - Login Form - 50% width */}
        <div className="flex items-center justify-center px-8 lg:px-12 xl:px-16 py-12">
          <div className="w-full max-w-md">
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-[#87CEEB]/40">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e3a5f] rounded-2xl mb-6 shadow-[0_0_25px_rgba(30,58,95,0.8)] border-2 border-[#2a5080]">
                  <LogIn className="w-8 h-8 text-[#87CEEB] drop-shadow-[0_0_12px_rgba(135,206,235,1)]" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-[0_2px_6px_rgba(135,206,235,0.25)]">
                  Connexion
                </h1>
                <p className="text-base text-[#87CEEB]">
                  Accédez à votre espace
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-400/40 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <div className="space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Entrez votre nom d'utilisateur"
                    className="w-full px-4 py-3 text-base bg-white/5 border-2 border-[#87CEEB]/30 rounded-xl focus:border-[#87CEEB] focus:outline-none text-white placeholder:text-[#87CEEB]/50 transition"
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Entrez votre mot de passe"
                    className="w-full px-4 py-3 text-base bg-white/5 border-2 border-[#87CEEB]/30 rounded-xl focus:border-[#87CEEB] focus:outline-none text-white placeholder:text-[#87CEEB]/50 transition"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-[#87CEEB] hover:shadow-[0_0_12px_rgba(135,206,235,0.4)] text-[#0d2838] text-base font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_6px_rgba(135,206,235,0.25)]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#0d2838] border-t-transparent rounded-full animate-spin"></div>
                      Connexion en cours...
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-[#87CEEB]/60 mt-6">
              © 2025 ONDA - Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}