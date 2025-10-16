'use client';
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  PlusCircle,
  Edit,
  Trash,
  Shield,
  User,
  Eye,
  Loader2,
  X,
  Mail,
  Phone,
  Calendar
} from "lucide-react";

type UserType = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  date_joined: string;
};

type CurrentUser = {
  role: string;
};

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "viewer",
    phone: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    
    if (!userStr || !token) {
      window.location.href = '/login';
      return;
    }
    
    const user = JSON.parse(userStr);
    setCurrentUser(user);

    if (user.role !== "admin") {
      alert("Accès refusé : réservé aux administrateurs");
      window.location.href = '/dashboard';
      return;
    }

    loadUsers(token);
  }, []);

  const loadUsers = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(await response.json());
      } else if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        phone: user.phone,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "viewer",
        phone: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    if (!formData.username) {
      alert("Le nom d'utilisateur est obligatoire");
      return;
    }

    if (!editingUser && !formData.password) {
      alert("Le mot de passe est obligatoire pour un nouvel utilisateur");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const updateData: any = { ...formData };
      
      if (editingUser && !updateData.password) {
        delete updateData.password;
      }

      const url = editingUser 
        ? `http://localhost:8000/api/users/${editingUser.id}/`
        : 'http://localhost:8000/api/auth/register/';
      
      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await loadUsers(token!);
        closeModal();
      } else {
        const error = await response.json();
        alert(error.username?.[0] || error.email?.[0] || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur sauvegarde utilisateur", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/users/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        await loadUsers(token!);
      }
    } catch (error) {
      console.error("Erreur suppression utilisateur", error);
      alert("Erreur lors de la suppression");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400/30">
            <Shield className="w-3.5 h-3.5" />
            Administrateur
          </span>
        );
      case "employee":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#1e3a5f] to-[#87CEEB] text-white border border-[#87CEEB]/30">
            <User className="w-3.5 h-3.5" />
            Employé
          </span>
        );
      case "viewer":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-600 to-gray-500 text-white border border-gray-400/30">
            <Eye className="w-3.5 h-3.5" />
            Viewer
          </span>
        );
      default:
        return <span className="text-[#87CEEB]">{role}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      {/* Decorative background - Reduced glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#87CEEB] rounded-full blur-[140px] opacity-4" style={{animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
        <div className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-[#00BFFF] rounded-full blur-[160px] opacity-3" style={{animation: 'pulse 14s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-b from-[#0a1f2e] via-[#0d2838]/80 to-transparent backdrop-blur-xl border-b border-[#87CEEB]/20 sticky top-0 shadow-[0_4px_20px_rgba(135,206,235,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1e3a5f] hover:bg-[#2a5080] transition border border-[#87CEEB]/30 shadow-[0_0_15px_rgba(30,58,95,0.6)]"
              >
                <ArrowLeft className="w-5 h-5 text-[#87CEEB]" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-[0_2px_6px_rgba(135,206,235,0.25)]">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-xs text-[#87CEEB]">Administration des comptes</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#87CEEB] text-[#0d2838] rounded-xl font-bold hover:shadow-[0_0_12px_rgba(135,206,235,0.4)] active:scale-95 transition-all shadow-[0_0_6px_rgba(135,206,235,0.25)]"
            >
              <PlusCircle className="w-5 h-5" />
              Nouvel utilisateur
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        {/* Users Table */}
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#87CEEB]/40 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50 border-b border-[#87CEEB]/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Utilisateur
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#87CEEB] uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date d'inscription
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[#87CEEB] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#87CEEB]/10">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                          <User className="w-8 h-8 text-[#87CEEB]" />
                        </div>
                        <p className="text-[#87CEEB] font-medium">Aucun utilisateur trouvé</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-black/30 transition">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-[#87CEEB]">
                            @{user.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#87CEEB]">
                        {user.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#87CEEB]">
                        {user.phone || "-"}
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-sm text-[#87CEEB]">
                        {formatDate(user.date_joined)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(user)}
                            className="p-2 text-[#87CEEB] hover:text-white hover:bg-[#1e3a5f] rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-white hover:bg-red-500/30 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-[#87CEEB]/40">
          <p className="text-sm text-[#87CEEB]">
            Total : <span className="font-bold text-white">{users.length}</span> utilisateur(s)
          </p>
        </div>
      </main>

      {/* Modal Add/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0d2838] to-[#1a3d5f] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#87CEEB]/40">
            <div className="sticky top-0 bg-gradient-to-r from-[#0d2838] to-[#1a3d5f] border-b border-[#87CEEB]/20 px-6 py-5 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_6px_rgba(135,206,235,0.25)]">
                {editingUser
                  ? "Modifier l'utilisateur"
                  : "Nouvel utilisateur"}
              </h3>
              <button
                onClick={closeModal}
                className="text-[#87CEEB] hover:text-white transition p-1 hover:bg-[#1e3a5f] rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Nom d'utilisateur *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    placeholder="johndoe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    placeholder="John"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    placeholder="Doe"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Rôle *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white focus:border-[#87CEEB] focus:outline-none transition"
                  >
                    <option value="admin" className="bg-[#0d2838]">Administrateur</option>
                    <option value="employee" className="bg-[#0d2838]">Employé</option>
                    <option value="viewer" className="bg-[#0d2838]">Viewer</option>
                  </select>
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Mot de passe {editingUser ? "(laisser vide pour ne pas modifier)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    placeholder="••••••••"
                  />
                  <p className="mt-2 text-xs text-[#87CEEB]">
                    Minimum 8 caractères
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-[#1e3a5f] to-[#87CEEB] hover:from-[#2a5080] hover:to-[#00BFFF] text-white py-3 rounded-xl transition font-semibold shadow-[0_0_15px_rgba(135,206,235,0.3)]"
                >
                  {editingUser ? "Modifier" : "Créer"}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-black/40 text-[#87CEEB] py-3 rounded-xl hover:bg-black/60 transition font-semibold border border-[#87CEEB]/30"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}